# SUBPLAN 5: Location Mgmt History Integration — Core Specs

**Parent**: PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md
**Agent**: Copilot/Claude Code (BUILDER identity)
**Phase**: 2.3, 2.4, 2.5
**Status**: DONE
**Executed**: 2026-04-15
**Depends on**: SUBPLAN_HISTORY_01 (done) + SUBPLAN_HISTORY_03 (done)
**History System**: Location Management History (87 columns)

---

## Context

Three core Location Management specs need history integration tests.
**Primary goal**: verify saves on Basic Info tabs (Local Info / Pricing / Currency) produce
correct rows on the Location Management History tab **AND** detect gaps where saved fields
are not reflected in history (these are potential app bugs per LR-030/LR-034).

**Save counts (audited 2026-04-15 via spec grep — plan's original counts were stale):**
- `location-local-information.spec.ts`: ~17 test-level saves + `.each()` iterations (varies at runtime)
- `location-pricing.spec.ts`: 4 `test.skip` entries still present; active completed saves ≈ **2-3**
  (TC-001 baseline cleanup, TC-024 uncheck+restore). Per user Q1 answer: pricing saves were
  recently fixed — runtime classification required (don't hardcode "blocked").
- `location-currency.spec.ts`: ~17 completed saves + 3 cancel/dismiss tests (CUR-014, CUR-017, CUR-025, CUR-026)

**Strategy update (post-audit)**: Plan's original "27 saves, assert 27 rows" design is brittle
because `.each()` iterations, skipped tests, and runtime failures make save counts non-deterministic.
Replace with **timestamp-window detection** — see §Integration Test Pattern below.

---

## Audit Findings (2026-04-15 /ultrathink adversarial audit)

14 findings against the original plan. Summary:

| ID | Finding | Resolution |
|----|---------|-----------|
| F-1 | Plan's save counts (27/9/30) don't match current spec shape | Use runtime timestamp-window, not hardcoded counts |
| F-2 | NOT-TRACKED saves (EnableMultidayPricing, Merchant) break "1 save = 1 row" assumption | Per user: detect gaps → file BUG-LOC reports per LR-034 |
| F-3 | Save classification signal (completed vs canceled) needs test-body reading | Handled at runtime by timestamp window — no upfront classification needed |
| F-4 | SP1 confirms Location Mgmt History default sort is ASCENDING | Must explicitly `sortByModifiedOnDesc()` before reading |
| F-5 | Page object's `getColumnByHeader` is O(n²) — re-resolves headers every call | Add `getRowsSinceTimestamp(sinceMs, headers)` helper with single header resolution |
| F-6 | Cross-contamination baseline missing | Capture `suiteStartTime = Date.now() - 2min buffer` in `test.beforeAll` |
| F-7 | Snapshot-vs-changed-field assertion scope undefined | Assert intentionally-changed fields only (expected-value list per spec) |
| F-8 | TC ID convention | Use `TC-LOC-LI-HIST`, `TC-LOC-PRI-HIST`, `TC-LOC-CUR-HIST` |
| F-9 | Test placement unclear | LAST test in `test.describe.serial` block, appended only — no reorder |
| F-10 | Test case .md updates not in plan | Per user Q3: update `specs_planning/test-cases/setup/locations/*.md` |
| F-11..14 | User-intent alignment: OK (cross-tab verification, `expect.soft` for all-mismatch visibility) | No change |

**User steering answers (2026-04-15):**
1. **Pricing**: pricing saves were recently fixed — runtime inspection required. If first save
   in suite produces no row (timestamp window empty), skip with reason. Don't assume blocked.
2. **NOT-TRACKED** = **GAP** = **potential bug per requirements** (all Basic Info fields should
   appear in history). Primary goal = find gaps. File BUG-LOC-xxx report per LR-034. Don't hard-fail
   the test on gaps (`expect.soft`).
3. **Docs**: full bookkeeping — test case .md + code + activity log.

---

## Session Start Protocol

```
/identity BUILDER
/regression-guard   (before snapshot)
```

**MANDATORY reads before ANY work:**
1. `plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md` — column headers, Unicode ✔ boolean format, Modified By user, sort direction
2. `src/pages/setup/locations/location-management-history.page.ts` — existing page object from SP3
3. `tests/specs/setup/locations/location-management-history.spec.ts` — existing pattern, `parseDateVal` helper
4. `tests/test-data/setup/locations/location-management-history.data.ts` — column headers constant
5. Each target spec file end-to-end (local-info 410 lines, pricing 590 lines, currency 313 lines)

---

## Phase 2.3: location-local-information Integration Test

**TC ID**: `TC-LOC-LI-HIST`
**Placement**: LAST test in `test.describe.serial('Location Local Info ...')`

**Expected field-value coverage** (from audited test bodies):

| Source TC | Changed field | History column | Tracked? | Expected value(s) in rows |
|-----------|---------------|----------------|----------|---------------------------|
| TC-LOC-LI-025 | Billing Type | "Billing Type" | YES | "Direct" (then "Master" on restore) |
| TC-LOC-LI-021/029 | Oracle Product Code | "Oracle Product Code" | YES | `LOCAL_INFO_TEST_VALUES.oracleProductTest`, `specialChars`, `oracleProductDefault` |
| TC-LOC-LI-069 | Oracle Department Code | "Oracle Department Code" | YES | `oracleDeptTest`, `oracleDeptDefault` |
| TC-LOC-LI-072 | Enable IDC Billing | "Enable IDC Billing" | YES | ✔ (checked), "" (unchecked) |
| TC-LOC-LI-071 | Enable Multiday Pricing | **NO COLUMN** | **NOT-TRACKED (SP1 §8)** | **GAP: file BUG-LOC-xxx** |
| TC-LOC-LI-077 | ETS / ETS Percent | "ETS" + "ETS Percent" | YES | ✔ + "23.00 %", "" + "0.00 %" |
| TC-LOC-LI-075 | Apply C&C Fee / C&C Percent | "Apply Cables and Consumables Fee" + "C&C Percent" | YES | ✔ + "5.00 %", "" + "0.00 %" |
| TC-LOC-LI-076 | Allow Resort Tax / Percentage | "Allow Resort Tax" + "Resort Tax Percentage" | YES | ✔ + "3.00 %", "" + "0.00 %" |
| TC-LOC-LI-073 | Display Tax / Company Remit Tax | "Display Tax" + "Company Remit Tax..." | YES | toggle round-trip values |
| TC-LOC-LI-SKIP-BILLING | Skip Billing | "Skip Billing" | YES | toggle of original state |
| TC-LOC-LI-021 | Calculate LDW on Net Amount | "Calculate LDW on Net Amount" | YES | ✔ then "" |
| TC-LOC-LI-064/065 | Show SC As Admin / Calc SC on Net Amount | "Show Service Charge As Administrative Fee" + "Calculate Service Charge On Net Amount" | YES | ✔ round-trip |
| TC-LOC-LI-074 | Threshold / Prompt For Approval | "Threshold" + "Prompt For Approval" | YES | numeric + ✔ round-trip |
| `LDW_BOUNDARIES` loop | LDW Percentage | "LDW Percentage" | YES | each valid boundary value |

Timeout: `test.setTimeout(180_000)`.

## Phase 2.4: location-pricing Integration Test

**TC ID**: `TC-LOC-PRI-HIST`
**Placement**: LAST test in `test.describe.serial('Location Pricing ...')`

**Runtime classification** — before running assertions:
1. Fetch rows since `suiteStartTime`
2. If `rowsFromSuite.length === 0` → the 500 bug likely still blocks → `test.skip('no history rows from this suite — pricing saves may still be blocked by API 500')`
3. Otherwise proceed with assertions

**Expected field-value coverage:**

| Source TC | Changed field | History column | Tracked? | Expected |
|-----------|---------------|----------------|----------|----------|
| TC-LOC-PRI-001 | chkCorporatePricing, chkPriceGuideInclusive (baseline reset) | "Corporate Pricing" + "Include Service Charge in Price Guides" | YES | ✔ after cleanup |
| TC-LOC-PRI-024 | chkPriceGuideInclusive | "Include Service Charge in Price Guides" | YES | "" (uncheck) then ✔ (restore) |

`test.skip`'d tests (TC-020, TC-025, dropdown-persistence-loop) produce no saves. NOT in scope.

Timeout: `test.setTimeout(180_000)`.

## Phase 2.5: location-currency Integration Test

**TC ID**: `TC-LOC-CUR-HIST`
**Placement**: LAST test in `test.describe.serial('Location Currency ...')`

**Expected field-value coverage:**

| Source TC | Changed field | History column | Tracked? | Expected |
|-----------|---------------|----------------|----------|----------|
| TC-LOC-CUR-001 | USD Selected, USD IsDefault (baseline enforce) | "Currency" (col 6 primary) | YES | USD present |
| TC-LOC-CUR-021 | CAD Selected round-trip | primary Currency | PARTIAL | may appear as currency sets |
| TC-LOC-CUR-022 | USD Merchant changed | **NO COLUMN** | **NOT-TRACKED (SP1 §8)** | **GAP: file BUG-LOC-xxx** |
| TC-LOC-CUR-023 | CAD IsDefault cascade | primary Currency | PARTIAL | default-currency change visible |
| TC-LOC-CUR-024 | CAD Selected + USD Merchant (combined) | primary Currency + **no Merchant col** | PARTIAL + GAP | merchant change → gap, currency → row |
| TC-LOC-CUR-027 | No-default state (USD IsDefault unchecked) | primary Currency | ?? | verify if row appears |

Canceled saves (no row): TC-014 (cancel dialog), TC-017 (cancel dialog), TC-025 (cancel), TC-026 (beforeunload stay).
Validation saves (no change persisted): TC-013 (save blocked by app).

Timeout: `test.setTimeout(180_000)`.

---

## Integration Test Pattern (same for all three)

```typescript
// Module-level: captures the wall-clock at suite start for timestamp-window filtering
// SP1 §11: Modified On timezone undetermined; 2-min buffer absorbs any client/server skew.
let suiteStartTime = 0;

test.describe.serial('...', () => {
  test.beforeAll(() => {
    suiteStartTime = Date.now() - 2 * 60 * 1000;
  });

  // ... existing tests unchanged ...

  test('TC-LOC-{MODULE}-HIST: All completed saves produce history rows with correct values', async ({
    locationLocalInfoPage, // or pricing/currency page
    locationManagementHistoryPage,
  }) => {
    test.setTimeout(180_000);

    // 1. Reload basic-info page (LR-026: clear any lingering dirty form state)
    //    safeNavigateTo dismisses unsaved-changes dialog if present.
    await locationXxxPage.reloadAndNavigateToXxxTab(OFFICE_NO);

    // 2. Navigate to Location Management History tab (handles dirty-state dialog)
    await locationManagementHistoryPage.navigateToHistoryTab(OFFICE_NO);

    // 3. Sort by Modified On descending (SP1: default is ASCENDING for Location Mgmt)
    await locationManagementHistoryPage.sortByModifiedOnDesc();

    // 4. Read rows since suite start (desc sort — stop when Modified On < suiteStartTime)
    const suiteRows = await locationManagementHistoryPage.getRowsSinceTimestamp(
      suiteStartTime,
      /* headers */ [...],
    );

    // 5. Pricing-only runtime skip: if no rows, saves may still be blocked
    if (suiteRows.length === 0) {
      test.skip(true, 'No history rows from this suite — saves may be blocked (e.g., API 500)');
      return;
    }

    // 6. Sanity: every suite row has Modified By + Modified On (expect.soft — collect ALL issues)
    for (const [i, row] of suiteRows.entries()) {
      expect.soft(row['Modified By'], `Row ${i}: Modified By empty`).toBeTruthy();
      expect.soft(row['Modified On'], `Row ${i}: Modified On empty`).toBeTruthy();
    }

    // 7. Gap detection: each expected field-value pair MUST appear in at least one row
    const expectedChanges: Array<{ field: string; values: string[]; note?: string }> = [ ... ];
    const gaps: string[] = [];

    for (const { field, values, note } of expectedChanges) {
      const observed = suiteRows.map(r => r[field]).filter(v => v !== undefined);
      const found = values.some(v => observed.includes(v));
      if (!found) {
        gaps.push(`${field}: expected one of [${values.join('|')}], observed [${observed.join('|')}]${note ? ` (${note})` : ''}`);
      }
      expect.soft(found,
        `GAP: ${field} — expected [${values.join('|')}] in history, observed [${observed.join('|')}]`
      ).toBe(true);
    }

    // 8. Known NOT-TRACKED per SP1 §8 (bugs filed as BUG-LOC-xxx):
    //    - EnableMultidayPricing (local-info): no column in 87
    //    - Merchant currency (currency): no column in 87
    //    Don't assert — document in comments. File bug reports separately.
  });
});
```

---

## Guardrails

- ZERO changes to existing tests — APPEND only
- Integration test MUST be LAST in `test.describe.serial` block
- Use `expect.soft()` for all assertions — we want ALL mismatches/gaps reported in one run
- Column access by HEADER TEXT via page object methods — never indices
- Data formats from `SUBPLAN_HISTORY_01_MCP_FINDINGS.md` only — never assume
- Run each spec individually after adding integration test (LR-018)
- If a save produces no matching history column → soft-fail + document as GAP → file BUG-LOC-xxx per LR-034

---

## Session End Protocol

**COMPLETION GATE**: Before marking DONE, pass the 5-point Sub-Plan Completion Gate in the master plan PLUS:
- [ ] All 3 integration tests written and LAST-in-serial placement verified
- [ ] Page object helper `getRowsSinceTimestamp` added + unit-validated
- [ ] Each spec runs individually to completion (LR-018 step 4)
- [ ] Full Location Mgmt suite runs green with new tests (LR-018 step 5)
- [ ] Test case .md files updated with TC-HIST entries (user Q3 answer)
- [ ] BUG-LOC-xxx report filed for each confirmed gap (LR-034)
- [ ] Execution Summary written to this plan (LR-027)

```
/regression-guard   (after snapshot)
/reflect
```

Activity log entry per LR-028 with timestamp ≥ file mtimes (LR-037).

---

## Execution Summary

**Executed**: 2026-04-15 (BUILDER / claude-code, Opus 4.6)

### TCs implemented (3 / 3)

| TC | Spec | File:Line | Status |
|----|------|-----------|--------|
| TC-LOC-LI-HIST | location-local-information.spec.ts | :419 | PASS (15.2s solo, 15.1s in full suite) |
| TC-LOC-CUR-HIST | location-currency.spec.ts | :325 | PASS (8.0s solo, 8.7s in full suite) |
| TC-LOC-PRI-HIST | location-pricing.spec.ts | :607 | PASS (13.6s solo, 14.9s in full suite) |

### TCs dropped
None.

### Page object
`src/pages/setup/locations/location-management-history.page.ts` — helpers added:
- `static parseModifiedOnMs(val)` — parses `MM/DD/YYYY HH:MM:SS AM/PM` via `Date.UTC` (server renders timestamps as UTC literal text, confirmed via trace.zip).
- `async getRowsSinceTimestamp(sinceMs, headers, maxRows=40)` — reads page-1 rows with single-pass header resolution and stop-on-old-row.
- `async waitForRecentTopRow(maxAgeMs=24h, timeoutMs=15s)` — post-sort DOM settle guard.
- `async clickSortColumn(...)` — 3-attempt retry with Escape-reset for LR-025 Radix flakiness.

### Test pattern
Each spec uses module-level `let suiteStartTime = 0` + `test.beforeAll(() => { suiteStartTime = Date.now() - 2 * 60 * 1000; })` (2-min clock-skew buffer). HIST test runs LAST in `describe.serial`, reloads the form tab (LR-026), navigates to Location Management History, sorts by Modified On desc, waits for recent top row, reads rows back to `suiteStartTime`, and asserts gap-detection against expected field+value pairs.

### MCP / trace findings (cycle 5 debugging)

1. **Timezone parse** — initial `new Date(y,m,d,h,...)` interpreted server's UTC-literal text as browser-local (IST = UTC+5:30), making recent rows appear 5.5h earlier than `suiteStartTime` → 0 rows collected. Fixed to `Date.UTC(...)`. Proven via trace.zip call@2382 (textContent `04/15/2026 02:28:04 PM` → parsed=14:28:04Z, sinceMs=14:24:58Z, delta=+185629ms → INCLUDED).

2. **Pagination loop empty-page trap** — `getRowsSinceTimestamp`'s original pagination loop marched through 103 pages on location 1604 before timing out at 180s. Trace analysis (421 getText ÷ 21 reads/row = 20 rows collected across 103 pages) proved that `clickPaginationButton('next')` → immediate `tbody tr` count often returned 0 due to post-click DOM re-render lag in the 87-column / ~2900-row table. Fixed by collapsing to page-1-only reads (default `maxRows=40`) — a test suite's saves always fit in 1 page after desc sort. Documented in page-object JSDoc as a "don't re-introduce pagination without a rowCount>0 wait" warning.

3. **Radix sort menu flakiness (LR-025)** — `clickSortColumn` intermittently failed when `[role="menu"]` didn't render within 5s of the sort button click. Wrapped open+click in a 3-attempt retry with `Escape` reset between attempts. Confirmed effective — no sort-menu failures across cycles 5-8.

### Bug reports filed (per LR-034)

| Bug ID | Module | Title | Severity |
|--------|--------|-------|---------|
| BUG-HIS-001 | LOCATION_MANAGEMENT_HISTORY | Enable Multiday Pricing save produces no history row | medium |
| BUG-HIS-002 | LOCATION_MANAGEMENT_HISTORY | Merchant currency save produces no history row | medium |

Both bugs were pre-identified in SP1 §8 (NOT-TRACKED fields). BUG-HIS-001 is the documented gap for TC-LOC-LI-071. BUG-HIS-002 covers TC-LOC-CUR-022 / CUR-024. Evidence: SP1 MCP column inventory (no Multiday or MerchantCurrency columns in 87-col schema) + SP5 HIST test gap-detection output.

Auto Add-On audit-trail gap (SP1 §8) is noted in both bug reports' "notes" fields but not filed separately — Auto Add-On spec is out of SP5 scope.

### Documentation changes

- `specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md` — TC-LOC-HIST-001 renamed to TC-LOC-LI-HIST, marked ✅ Automated, automation-file ref + Steps rewritten to match implementation.
- `specs_planning/test-cases/setup/locations/locations_currency_test_cases.md` — same for TC-LOC-HIST-002 → TC-LOC-CUR-HIST.
- `specs_planning/test-cases/setup/locations/locations_pricing_test_cases.md` — same for TC-LOC-HIST-003 → TC-LOC-PRI-HIST.

### Test pass confirmation

| Run | Result |
|-----|--------|
| LI solo cycle 6 (2026-04-15 15:14) | 35/35 PASS |
| CUR solo (2026-04-15 15:17) | 28/28 PASS |
| PRI solo w/ retries (2026-04-15 15:22) | 28 pass / 7 skip (TC-031 recovered on retry) |
| Full Location suite (2026-04-15 ~15:40) | 192 pass / 2 fail / 3 flaky / 10 skip / 21 did-not-run. All 3 SP5 HIST tests PASS. 2 failures (TC-LOC-MGH-008, TC-LOC-SSL-013) are pre-existing and NOT SP5-related. No serial contamination from SP5 changes. |

Logs retained: `reports/sp5-li-run8.log`, `reports/sp5-cur-run.log`, `reports/sp5-pri-run2.log`, `reports/sp5-full-run.log`.

