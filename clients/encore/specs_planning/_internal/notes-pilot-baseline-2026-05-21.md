# Notes Pilot — TC-Mapping Baseline (Phase 0.4)

**Plan**: `plans/pending/PLAN_FRAMEWORK_LIFECYCLE_NOTES_PILOT_V2.md`
**Captured**: 2026-05-21 PM (Phase 0.4 per plan)
**Methodology**: each TC run individually via `npx playwright test specs/locations/<spec>.spec.ts --project=encore-locations --workers=1 --retries=0 --grep "<TC-ID>" --reporter=list`. Per-run artifacts in `clients/encore/reports/test-results/`.
**Headed flag**: dropped — Bash sandbox has no display; behavior-equivalent for pass/fail capture (plan-line micro-rescope justified empirically and disclosed here, not silent).

---

## Results

| TC | Status | Failure mode | BUG-1 hypothesis |
|---|---|---|---|
| TC-LOC-NTS-FCC-022 | **FAIL** | `locator.click: Timeout 10000ms exceeded` on `btnNotesDelete.nth(0)` in `deleteRow()` at `location-notes.page.ts:164` | App bug: "Delete button vanishes on single empty row" — already plan-classified as `test.fixme()` + file bug |
| TC-LOC-NTS-FCC-024 | **FAIL** | `expect(isDefaultEmptyState).toBe(true)` — received `false` after `page.reload()` + `navigateToNotesTab()` | **Confirmed**: bare `page.reload()` reloaded about:blank (not real app); the real-app save persisted because mid-dialog "reload" never actually fired on real page |
| TC-LOC-NTS-FCC-025 | **FAIL** | `expect(isSaveEnabled).toBe(true)` — received `false` after `page.keyboard.press('Escape')` | **Confirmed**: bare-page Escape didn't reach real app's save dialog → real Save dialog stayed open → main Save button in dialog-locked disabled state |
| TC-LOC-NTS-FCC-026 | **PASS** (vacuous) | n/a — bare-page `mouse.click(2,2)` no-op, `isVisible` on bare page returns false (skipping Escape branch); final reload via page-object cleans up and masks the failure | **Confirmed**: BUG-1 present but masked by page-object cleanup path. After A-1 rewrite, test will actually verify click-outside behavior |
| TC-LOC-NTS-FCC-027 | **PASS** (vacuous) | n/a — bare-page locator finds nothing → `.click({force:true}).catch()` swallows; `networkRequests` empty trivially since listener attached to bare page | **Confirmed**: BUG-1 present but masked. After A-1 rewrite, force-click on real disabled button may genuinely fire (plan-flagged risk — re-evaluate `.catch()` swallow) |
| TC-LOC-NTS-FCC-029 | **FAIL** | `locator.click: Timeout 5000ms exceeded` on `[data-testid="location-settings-sub-tab-currency"]` (bare page locator finds nothing) | **Confirmed**: BUG-1 currencyTab locator timeout — exactly the symptom plan predicted |
| TC-LOC-NTS-009 | **PASS** | n/a (already passing) | D-1 hydration race fix is PREVENTIVE, not REACTIVE. Plan-listed but no current failure — keep in scope as a stability safeguard, lower priority |
| TC-LOC-SSL-029 | **PASS** (vacuous) | n/a — bare-page `console` listener captures no events (about:blank), real assertions (`rapidClickAdd`, `isAddDialogVisible`, `countAddDialogs`) all use page-object; `consoleErrors` array intentionally non-asserting per test comment | **Confirmed**: BUG-1 dormant code. After A-1 rewrite, console listener actually captures real-app errors |

---

## Pattern

- **3 hard failures (FCC-024/025/029)**: direct BUG-1 symptoms — bare page operation doesn't reach real app, causing missing/wrong state at assertion.
- **3 vacuous passes (FCC-026/027/SSL-029)**: BUG-1 present but masked — the bare-page operation is no-op AND the test's load-bearing assertions happen on the page-object (real page), so test passes for the wrong reason.
- **1 app bug (FCC-022)**: plan-classified `test.fixme()` + bug file — root cause is in app, not framework.
- **1 currently-passing test (TC-LOC-NTS-009)**: plan's D-1 hydration race is preventive — keep in scope as a stability guard, not a fix-current-failure item.

## Implications for plan strict line

Plan line 309: "Notes module shows 57 passed + 1 fixme (FCC-022)."

After A-1 rewrite, 5 currently-affected tests (3 hard fails + 2 of the 3 vacuous passes — FCC-024/025/026/027/029) become real assertions on real page. The vacuous-pass tests (FCC-026/027/SSL-029) will run their assertions for the first time meaningfully. Outcomes are not guaranteed pass — they're guaranteed REAL. The "57 passed + 1 fixme" line carries the assumption that all 6 BUG-1 tests pass after A-1.

If any of the 3 vacuous-pass tests FAIL after A-1 makes them real (e.g., click-outside dialog behavior unverified, force-click on disabled button genuinely fires), the strict line breaks. **Plan must allow for outcome-discovery**: per LR-039 + feedback_failing_TC_as_bug_evidence_vehicle.md, a fail after A-1 = upstream bug evidence vehicle, not a re-plan loop.

## Cross-reference to prior session

Activity-log row 2026-05-21T14:58 (OWNER) already documented 4 failures (FCC-022 / FCC-024 / FCC-025 / FCC-029) + 1 flaky (TC-LOC-NTS-008) + 4 spawned RCA tasks. That session classified failure causes from the symptom side (deleteRow timeout, currencyTab timeout, etc.) without naming the page-collision pattern. This baseline is consistent with that session's evidence; BUG-1 is the unifying root cause for FCC-024/025/029 (and dormant in FCC-026/027/SSL-029).
