# PLAN: Flakiness Elimination — Replace networkidle + Add Retries

## Context

Suite runs 231 tests. Each full run produces 3-7 failures — **different tests each time**.
All failures are category NETWORK with `networkidle` in last actions before timeout.
Root cause: Angular SPA keeps zone.js micro-tasks alive → `networkidle` either never resolves
or resolves between route change and API response (too early). Research (Playwright docs,
community, Microsoft Angular guides) all recommend the same fix: stop using `networkidle`.

**Goal**: Zero flaky failures. Every failure should mean a real bug.

---

## Research Summary (completed prior to this plan)

| Finding | Source | Applicability |
|---------|--------|---------------|
| `networkidle` unreliable for SPA (Angular/React) | Playwright docs, GitHub issues | Direct — 11 usages in our codebase |
| Replace with `waitForResponse()` + element visibility | Playwright best practices | Direct — 0 usages of waitForResponse today |
| `getAllAngularTestabilities().whenStable()` polyfill | Angular testing guides | Direct — no Angular stability check exists |
| `retries: 1` restarts serial blocks from test 1 | Playwright serial docs | Direct — retries:0 locally, cascading "did not run" |
| `toPass()` for compound assertion retry | Playwright v1.40+ | Useful for save+reload patterns (0 usages today) |
| `expect.poll()` for single-value polling | Already used (30+ times) | Already well-adopted ✓ |

---

## Execution Plan: 6 Changes

### Change 1: Add `waitForAngularStable()` to BasePage

**File**: `src/common/base-page.ts`
**Location**: After `waitForPageLoad()` (after line 211)

**Add new method:**
```typescript
/**
 * Wait for Angular to finish all pending async operations (zone.js stability).
 * Falls back silently if Angular testabilities are not available (non-Angular pages).
 * Use this after navigation/reload instead of networkidle for Angular SPAs.
 */
protected async waitForAngularStable(timeout = 10_000): Promise<void> {
  try {
    await this.page.evaluate(() => {
      return new Promise<void>((resolve, reject) => {
        const maxWait = setTimeout(() => resolve(), 10_000); // safety fallback
        try {
          const testabilities = (window as any).getAllAngularTestabilities?.();
          if (!testabilities || testabilities.length === 0) {
            clearTimeout(maxWait);
            resolve(); // Not an Angular page
            return;
          }
          testabilities[0].whenStable(() => {
            clearTimeout(maxWait);
            resolve();
          });
        } catch {
          clearTimeout(maxWait);
          resolve(); // Graceful fallback
        }
      });
    });
  } catch {
    // page.evaluate can throw if page navigated away — safe to ignore
  }
}
```

**Rationale**: This is the Angular-native way to wait for async operations. It replaces the
heuristic-based `networkidle` with a deterministic signal from Angular's zone.js. The fallback
ensures it works on non-Angular pages too.

---

### Change 2: Replace `networkidle` in `navigateToSubTab()` (BasePage)

**File**: `src/common/base-page.ts`
**Lines**: 374–397

**BEFORE** (line 386):
```typescript
await this.navigateTo(`${baseUrl}${expectedPath}/${settingsPath}`);
await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
```

**AFTER**:
```typescript
await this.navigateTo(`${baseUrl}${expectedPath}/${settingsPath}`);
await this.waitForAngularStable();
```

**BEFORE** (line 393):
```typescript
await tab.click();
await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
```

**AFTER**:
```typescript
await tab.click();
await this.waitForAngularStable();
```

**Safety**: The readiness element wait at line 395 (`getElement(readinessElementKey).waitFor({ state: 'visible' })`) is the real gate. The `networkidle` was just a "hopefully Angular has settled" heuristic before it. Angular stability check is strictly better.

---

### Change 3: Replace `networkidle` in `clickSaveWithDialog()` (BasePage)

**File**: `src/common/base-page.ts`
**Line**: 348

**BEFORE**:
```typescript
await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {
  Log.warn(`Network did not reach idle within 15s after save`);
});
```

**AFTER**:
```typescript
// Wait for save API response to complete (already captured by responseHandler above)
await this.waitForAngularStable();
```

**Safety**: The `responseHandler` (lines 330-334) already captures all 400+ responses. The `networkErrors` check at line 356 catches API failures. We don't need `networkidle` — we need Angular to process the save response. The responseHandler + Angular stability = complete coverage.

---

### Change 4: Replace `networkidle` in page object reload/nav methods

**4a. `local-office-settings.page.ts`** — 9 occurrences

**navigateToHistoryTab() line 49:**
```typescript
// BEFORE:
await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
// AFTER:
await this.waitForAngularStable();
```

**navigateToEctTab() line 59:**
```typescript
// BEFORE:
await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
// AFTER:
await this.waitForAngularStable();
```

**navigateToEctTab() lines 70, 73 (retry loop):**
```typescript
// BEFORE:
await this.page.reload({ waitUntil: 'networkidle', timeout: 30_000 });
...
await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
// AFTER:
await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
...
await this.waitForAngularStable();
```

**navigateToEctTab() lines 83, 86 (second retry):**
```typescript
// BEFORE:
await this.page.reload({ waitUntil: 'networkidle', timeout: 30_000 });
...
await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
// AFTER:
await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
...
await this.waitForAngularStable();
```

**reloadBasicInfo() line 109:**
```typescript
// BEFORE:
await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
// AFTER:
await this.waitForAngularStable();
```

**clickSaveFixedCosts() line 159:**
```typescript
// BEFORE:
await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
// AFTER:
await this.waitForAngularStable();
```

**clickSaveLaborCosts() line 164:**
```typescript
// BEFORE:
await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
// AFTER:
await this.waitForAngularStable();
```

---

**4b. `location-shared-setup-locations.page.ts`** — line 43

**reloadPage():**
```typescript
// BEFORE:
async reloadPage(): Promise<void> {
  await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
  await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
}
// AFTER:
async reloadPage(): Promise<void> {
  await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
  await this.waitForAngularStable();
}
```

---

**4c. `location-account-address.page.ts`** — line 372

**reloadAndNavigate():**
```typescript
// BEFORE:
async reloadAndNavigate(officeNo: string = '1604'): Promise<void> {
  await this.page.reload({ waitUntil: 'networkidle', timeout: 30_000 });
  await this.navigateToAccountAndAddressTab(officeNo);
  Log.info('[OK] Reloaded and navigated to Account and Address tab');
}
// AFTER:
async reloadAndNavigate(officeNo: string = '1604'): Promise<void> {
  await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
  await this.waitForAngularStable();
  await this.navigateToAccountAndAddressTab(officeNo);
  Log.info('[OK] Reloaded and navigated to Account and Address tab');
}
```

---

**4d. `location-notes.page.ts`** — line 52

**reloadAndNavigateToNotesTab():**
```typescript
// BEFORE:
await this.page.reload({ waitUntil: 'networkidle', timeout: 30_000 });
// AFTER:
await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
// Note: clickNotesTab() at line 56 already waits for tab content visibility
```

---

**4e. `location-legal.page.ts`** — line 50

**reloadAndNavigateToLegalTab():**
```typescript
// BEFORE:
await this.page.reload({ waitUntil: 'networkidle', timeout: 30_000 });
// AFTER:
await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
// Note: clickLegalTab() at line 54 already waits for tab content visibility
```

---

### Change 5: Add `retries: 1` for local runs

**File**: `playwright.config.ts`
**Line**: 61

**BEFORE**:
```typescript
retries: process.env.CI ? 2 : 0,  // CI: 2 retries for flaky tests; Local: 0 for fast feedback
```

**AFTER**:
```typescript
retries: process.env.CI ? 2 : 1,  // CI: 2 retries; Local: 1 retry (serial blocks restart from test 1)
```

**Rationale**: Serial blocks (`describe.serial`) restart the entire group from test 1 on retry.
Without retries, a single transient failure cascades to 10-20 "did not run" results.
With retries:1, the group gets one more chance — if it passes on retry, it's flaky not broken.
This is a safety net, not a fix — the networkidle replacement is the real fix.

---

### Change 6: Add pipeline rule ALL-064

**File**: `docs/read_only_docs/AGENT_SHARED_RULES.md`
**Location**: After ALL-063

```markdown
| **ALL-064** | **NO networkidle IN ANGULAR SPA TESTS** — Never use `waitUntil: 'networkidle'` or `waitForLoadState('networkidle')` in page objects or specs. Angular's zone.js keeps micro-tasks alive, making networkidle either hang (timeout) or resolve too early (between route change and API response). Instead use: (a) `waitForAngularStable()` for zone stability, (b) element visibility waits for DOM readiness, (c) `waitForResponse()` for specific API calls. | Generator, Healer | Prevents flaky NETWORK-category failures (5-7 per run before fix) |
```

**File**: `CLAUDE.md`
**Location**: After LR-022

```markdown
### LR-023: Replace networkidle with Angular stability + element visibility
Never use `networkidle` in Angular SPA tests. Angular's zone.js keeps micro-tasks alive,
causing `networkidle` to either timeout or resolve prematurely. The replacement pattern is:
1. `waitForAngularStable()` — waits for Angular zone to stabilize (deterministic)
2. Element visibility check — `getElement(key).waitFor({ state: 'visible' })` (concrete signal)
3. `waitForResponse()` — for API-dependent assertions (specific, not heuristic)
Every `networkidle` in the codebase was replaced in the 2026-04 flakiness elimination.
**Trigger**: Any page object or spec writing session.
```

---

## Files Modified

| # | File | Changes |
|---|------|---------|
| 1 | `src/common/base-page.ts` | Add `waitForAngularStable()` method; replace networkidle in `navigateToSubTab()` (2 spots) and `clickSaveWithDialog()` (1 spot) |
| 2 | `src/pages/setup/local-office/local-office-settings.page.ts` | Replace 9 networkidle usages with `waitForAngularStable()` or `domcontentloaded` |
| 3 | `src/pages/setup/locations/location-shared-setup-locations.page.ts` | Replace 1 networkidle in `reloadPage()` |
| 4 | `src/pages/setup/locations/location-account-address.page.ts` | Replace 1 networkidle in `reloadAndNavigate()` |
| 5 | `src/pages/setup/locations/location-notes.page.ts` | Replace 1 networkidle in `reloadAndNavigateToNotesTab()` |
| 6 | `src/pages/setup/locations/location-legal.page.ts` | Replace 1 networkidle in `reloadAndNavigateToLegalTab()` |
| 7 | `playwright.config.ts` | Change `retries: 0` → `retries: 1` for local runs |
| 8 | `docs/read_only_docs/AGENT_SHARED_RULES.md` | Add ALL-064 |
| 9 | `CLAUDE.md` | Add LR-023 |

## NOT Modified (with reasoning)

| File | Why NOT modified |
|------|-----------------|
| `tests/setup/fixtures.ts` | Auth fixture already has 300s timeout (root) and worker-scoped isolation. No change needed. |
| `playwright.config.ci.ts` | Already has `retries: 2`. No change needed. |
| `src/utils/app-constants.ts` | Timeout values are fine. The problem is networkidle, not timeouts. |
| Test spec files (`*.spec.ts`) | Specs don't use networkidle — all flakiness is in page objects. Clean. |
| `src/pages/setup/locations/location-pricing.page.ts` | Uses `domcontentloaded` + custom polling. No networkidle. Already correct. |

## Verification

1. `npm run build` — TypeScript compilation passes (new method, type-safe)
2. `npx playwright test --project=chrome tests/specs/setup/` — Full suite, expect 0 failures
3. Run twice — if same 0 failures, flakiness eliminated. If 1-2 flaky, retries:1 catches them.
4. Compare failure count: before (5-7 per run) vs after (target: 0)

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| `waitForAngularStable()` doesn't resolve | Low — Angular testabilities API is stable since Angular 2+ | 10s fallback timeout in the method |
| Angular testabilities not available | Low — Navigator4 is Angular | Graceful fallback (resolve immediately) |
| Some test needs actual network idle | Very Low — all networkidle usages have element waits after | Element visibility is the real gate |
| retries:1 masks real failures | Low | retries only catch transient issues; deterministic failures fail twice |
