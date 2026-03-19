# PLAN 48C: Error Handling & Save Verification

## Status: PENDING
## Priority: P1-HIGH
## Depends On: Nothing

## Problem

`clickSaveWithDialog()` in BasePage logs `[OK] Save complete` even when the API returns 500. Dialog timeout and networkidle timeout are silently swallowed with `.catch(() => {})`. Ten+ empty catch blocks across the codebase hide real errors.

---

## Changes

### File: `src/common/base-page.ts`

**Fix 1** — `clickSaveWithDialog()` must verify save success:
```typescript
protected async clickSaveWithDialog(
  saveBtnKey: string,
  dialogKey: string = 'dlgSaveChanges',
  confirmBtnKey: string = 'btnSaveChangesConfirm',
  dialogTimeout: number = 5_000,
): Promise<{ success: boolean; networkError?: string }> {
  const saveBtn = this.getElement(saveBtnKey);
  await saveBtn.waitFor({ state: 'visible', timeout: 5_000 });
  if (await saveBtn.isDisabled()) {
    Log.info(`Save button disabled (${saveBtnKey}) -- skipping click`);
    return { success: true };
  }

  // Capture network responses during save
  const networkErrors: string[] = [];
  const responseHandler = (response: any) => {
    if (response.status() >= 400) {
      networkErrors.push(`${response.status()} ${response.url()}`);
    }
  };
  this.page.on('response', responseHandler);

  await saveBtn.click();

  const dialog = this.getElement(dialogKey);
  const dialogVisible = await dialog.waitFor({ state: 'visible', timeout: dialogTimeout })
    .then(() => true).catch(() => false);

  if (dialogVisible) {
    Log.info(`Save confirmation dialog appeared -- confirming`);
    await this.getElement(confirmBtnKey).click();
    await dialog.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {
      Log.warn(`Save dialog did not close within 10s`);
    });
  }

  // Wait for network to settle
  await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {
    Log.warn(`Network did not reach idle within 15s after save`);
  });

  // Remove listener
  this.page.off('response', responseHandler);

  // Check for API errors
  if (networkErrors.length > 0) {
    Log.error(`[FAIL] Save had API errors: ${networkErrors.join(', ')}`);
    return { success: false, networkError: networkErrors.join('; ') };
  }

  Log.info(`[OK] Save complete (${saveBtnKey})`);
  return { success: true };
}
```

**Fix 2** — Replace dangerous `.catch(() => {})` patterns with logging:

| File | Line | Current | Fix |
|------|------|---------|-----|
| base-page.ts | ~308 | `dialog.waitFor({ state: 'hidden' }).catch(() => {})` | `.catch(() => { Log.warn('Dialog did not close') })` |
| base-page.ts | ~310 | `waitForLoadState('networkidle').catch(() => {})` | `.catch(() => { Log.warn('Network idle timeout') })` |
| base-page.ts | ~455 | `catch { return false; }` | `catch(e) { Log.warn('Save button wait failed: ' + e.message); return false; }` |

**Fix 3** — Add network error logging to DiagnosticsCollector:
```typescript
// In diagnostics-collector.ts, add method:
getNetworkErrorSummary(): string {
  const errors = this.networkFailures.filter(n => n.status >= 400);
  if (errors.length === 0) return 'No API errors';
  return errors.map(e => `${e.status} ${e.url.split('/').pop()}: ${e.body.substring(0, 200)}`).join('\n');
}
```

---

## Verification

1. Run pricing spec (known 500 on save)
2. Check test output logs — should now show `[FAIL] Save had API errors: 500 update-location-pricing`
3. Check failure-summary.json — should have non-empty networkFailures

## Files

- `src/common/base-page.ts` — fix clickSaveWithDialog, replace empty catches
- `src/utils/diagnostics-collector.ts` — add getNetworkErrorSummary
- `src/pages/locations/location-pricing.page.ts` — update save calls to handle return value
- `src/pages/locations/location-local-info.page.ts` — same
- `src/pages/locations/location-currency.page.ts` — same
