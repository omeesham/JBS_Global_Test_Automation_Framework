# PLAN 48A: Diagnostics Pipeline Fix

## Status: PENDING
## Priority: P0-CRITICAL
## Depends On: Nothing

## Problem

ALL diagnostic data is silently lost. Every failure-summary.json has empty networkFailures, consoleErrors, pageUrl, domSnippet, urlBreadcrumbs. Agents have been operating 100% blind on every test run.

**Root Causes**:
1. `commonMethods` fixture reads `__diagnosticsCollector` from bare Playwright `page`, but collector is attached to `authenticatedSession.page` — different objects
2. `commonMethods` is NOT auto-use — tests that only use page object fixtures (locationPricingPage, etc.) never trigger the diagnostics teardown
3. No gate validation checks if diagnostics are actually populated

---

## Changes

### File: `tests/setup/fixtures.ts`

**Fix 1** — Make diagnostics auto-use and read from correct page:

```typescript
// NEW: Auto-use fixture that handles diagnostics for ALL tests
diagnosticsHandler: [async ({ authenticatedSession }, use, testInfo) => {
  const { page } = authenticatedSession;
  await use(undefined);

  // Teardown — extract diagnostics from the CORRECT page (authenticatedSession.page)
  const collector = (page as unknown as Record<string, unknown>).__diagnosticsCollector as DiagnosticsCollector | undefined;
  if (collector) {
    collector.recordUrl();
    const snapshot = collector.getSnapshot();

    if (testInfo.status !== 'passed') {
      try {
        const domContent = await page.content();
        snapshot.domSnippet = domContent.slice(0, 50_000);
      } catch { /* page may be closed */ }
    }

    testInfo.attach('diagnostics', {
      contentType: 'application/json',
      body: Buffer.from(JSON.stringify(snapshot)),
    });

    // Persist per-spec diagnostics file
    if (testInfo.status !== 'passed') {
      const specName = path.basename(testInfo.file, '.spec.ts');
      const diagDir = path.join(process.cwd(), 'reports', 'diagnostics');
      if (!fs.existsSync(diagDir)) fs.mkdirSync(diagDir, { recursive: true });
      const diagFile = path.join(diagDir, `${specName}.diagnostics.json`);
      try {
        let existing: { spec: string; tests: unknown[] } = { spec: specName, tests: [] };
        if (fs.existsSync(diagFile)) {
          existing = JSON.parse(fs.readFileSync(diagFile, 'utf-8'));
        }
        existing.tests.push({
          name: testInfo.title,
          status: testInfo.status,
          consoleErrors: snapshot.consoleErrors,
          networkFailures: snapshot.networkFailures,
          pageErrors: snapshot.pageErrors,
          pageUrl: snapshot.urlHistory.at(-1) ?? '',
          authChain: snapshot.authChain,
        });
        fs.writeFileSync(diagFile, JSON.stringify(existing, null, 2) + '\n', 'utf-8');
      } catch { /* best-effort */ }
    }
  }
}, { auto: true }],  // ← AUTO-USE: runs for EVERY test
```

**Fix 2** — Remove diagnostics code from `commonMethods` teardown (it's now in `diagnosticsHandler`). Keep commonMethods as a utility-only fixture.

**Fix 3** — Add gate validation to `scripts/healer-pre-run.ts` and `scripts/generator-pre-run.ts`:
```typescript
// After reading failure-summary.json, check diagnostics aren't empty
const emptyDiagnostics = failures.filter(f =>
  f.networkFailures.length === 0 &&
  f.consoleErrors.length === 0 &&
  f.pageUrl === '' &&
  f.domSnippet === ''
);
if (emptyDiagnostics.length === failures.length && failures.length > 0) {
  console.warn('[WARN] ALL failures have empty diagnostics — data pipeline may be broken');
}
```

---

## Verification

1. Revert Copilot's pricing spec changes (restore original assertions)
2. Run `npx playwright test tests/specs/locations/location-pricing.spec.ts --project=chrome`
3. Read `reports/failure-summary.json` — verify `networkFailures` contains `{url: "update-location-pricing", status: 500, ...}`
4. Verify `pageUrl`, `consoleErrors`, `domSnippet`, `urlBreadcrumbs` are populated

## Files

- `tests/setup/fixtures.ts` — add auto-use diagnosticsHandler, clean up commonMethods
- `scripts/healer-pre-run.ts` — add empty diagnostics warning
- `scripts/generator-pre-run.ts` — add empty diagnostics warning
- `tests/specs/locations/location-pricing.spec.ts` — revert Copilot's changes
