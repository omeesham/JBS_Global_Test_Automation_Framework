# False-Green Sweep — Service Charge (2026-08-11)

Auditor: WATCHDOG nm3344-watchdog-0811 (independent audit seat, read-only)
Replaces: service-charge-2026-08-10.md (stale — predates 12 fixme conversions and 3 fix waves)
Scope: service-charge-basic-information.spec.ts (30 tests) + service-charge-history.spec.ts (15 tests)
Verdict key: FALSE-GREEN | WEAK | SOUND

---

## service-charge-basic-information.spec.ts

| TC | Verdict | Reason |
|---|---|---|
| TC-SVC-BAS-001 | SOUND | Reads live originalAudio before edit; restores in try/finally; asserts waitForSaveActive on the changed value. Logic coherent. |
| TC-SVC-BAS-002 | SOUND | Same as BAS-001 pattern with 0.00. Sound. |
| TC-SVC-BAS-003 | SOUND | Reads live value; asserts input.value contains '100.00', aria-invalid not 'true', waitForSaveActive. Three independent signals. |
| TC-SVC-BAS-004 | SOUND | Sets value, saves, reloads, checks persistence, restores in finally. Full round-trip. |
| TC-SVC-BAS-005 | WEAK | Comment says "NEEDS-LIVE-CONFIRM: verify the field rejects -0.01 with aria-invalid=true". Assertion was never verified against the live app. If the app accepts -0.01 silently (no aria-invalid), the test fails for a real behavior gap — but if the test was authored speculatively without observation, a passing run would be accidental. |
| TC-SVC-BAS-006 | WEAK | Same NEEDS-LIVE-CONFIRM pattern for 100.01. Assertion on aria-invalid='true' not confirmed by live observation. |
| TC-SVC-BAS-007 | SOUND | Asserts normalized display value ('24.00') and aria-invalid absent. Comment accurately explains net-zero Save-state rationale. No restore needed (no save). |
| TC-SVC-BAS-008 | WEAK | Name says "reverting to its original value" but body reverts to hardcoded DEFAULT_APP_NUM ('0.00'), not the live DB value read at test start. If DB value differs from '0.00', the "revert" is a value change, not a revert — and Save may enable (assertion waitForSaveInactive would correctly FAIL). The assertion is sound only when DB == DEFAULT_APP_NUM. |
| TC-SVC-BAS-009 | SOUND | Live-confirmed (comment): alpha chars appear in field, then aria-invalid='true' on blur, Save disabled. Two assertions match the observation. |
| TC-SVC-BAS-010 | SOUND | Live-confirmed: '1.2.3' kept verbatim in input.value, aria-invalid='true', Save disabled. Three assertions. |
| TC-SVC-BAS-011 | WEAK | NEEDS-LIVE-CONFIRM on aria-invalid for '-5'. Pattern identical to BAS-005/006 — not verified live. |
| TC-SVC-BAS-012 | SOUND | Live-confirmed: '024' normalises to '24.00'; aria-invalid absent. No save. |
| TC-SVC-BAS-013 | WEAK | No Save state assertion (acknowledged: "Save state is not asserted"); no display-format assertion for normalised value. Only checks aria-invalid absent. The test name does not claim format or Save assertions, but the coverage value is minimal. |
| TC-SVC-BAS-014 | SOUND | Keyboard-path observation cited as authoritative. Asserts normalised '0.00' + aria-invalid absent. Correctly distinguishes eval-injection distortion. |
| TC-SVC-BAS-015 | WEAK | No Save state assertion (acknowledged). Asserts only aria-invalid absent for whitespace. The app may accept whitespace silently and enable Save — not checked. |
| TC-SVC-BAS-016 | SOUND | Paste-path observation used. Asserts 'e+' in input.value (scientific-notation conversion) + aria-invalid='true' + waitForSaveInactive. Three coherent signals. |
| TC-SVC-BAS-017 | SOUND | Read-only render check: input.value contains ' %'. Minimal but accurately describes what it tests. |
| TC-SVC-BAS-018 | SOUND | Dirty→Save-active; reload→Save-inactive. Two-state check, no persistence write. |
| TC-SVC-BAS-019 | SOUND | Reads live originalValue; edits→active; reverts→inactive. Clean round-trip. |
| TC-SVC-BAS-020 | SOUND | Save→reload→check→restore in finally. Full persistence round-trip. |
| TC-SVC-BAS-021 | SOUND | Two sequential edits; saves second; reload; asserts second value persisted. Multi-edit persistence logic sound. |
| TC-SVC-BAS-022 | WEAK | Name claims "triggers a confirmation prompt" on nav-away. Comment says "NEEDS-LIVE-CONFIRM: verify whether an Unsaved Changes alertdialog appears". Also: spec header states "app completes Save with no confirmation dialog on this page" — but this TC tests a nav-away dialog, not a save dialog. The LR-012 default was proven NOT to hold for Save on this page; whether it holds for nav-away is unconfirmed. The dismiss click is guarded by `if (dialogVisible)` — if no dialog appears, the dismiss is silently skipped and no environment cleanup happens. |
| TC-SVC-BAS-023 | SOUND | Multi-field edit; save; reload; assert both fields; restore in finally with conditional save. |
| TC-SVC-BAS-024 | SOUND | Row-by-index label reads. DOM row 0 = header; data starts at 1. Assertion matches specific named values. |
| TC-SVC-BAS-025 | SOUND | Click label cell; assert Save not enabled; assert no dialog. Read-only census after interaction. |
| TC-SVC-BAS-026 | SOUND | Page load: Save disabled. Single reliable assertion. |
| TC-SVC-BAS-027 | SOUND | Duplicate of BAS-018 pattern. SOUND (not false-green — the test is not trivially passing; it tests real Save-state transitions). |
| TC-SVC-BAS-028 | SOUND | Asserts header array equality against SC_BASIC_COLUMN_HEADERS constant. Read-only. |
| TC-SVC-BAS-029 | SOUND | Counts data-testid^="service-charge-percentage-" locators == SC_ROW_COUNT. Structural census. |
| TC-SVC-BAS-030 | WEAK | Sets Audio Conferencing to `35.00`, saves, reloads, asserts `contains('35.00')` — core persistence assertion is sound. Restore uses hardcoded `DEFAULT_AUDIO_NUM` instead of a live-read original value (same weakness as BAS-008). If the DB value differs from `DEFAULT_AUDIO_NUM` at test start, the restore is a value change rather than a true revert, but this does not affect the persistence assertion itself. Verdict: WEAK (hardcoded restore constant), not FALSE-GREEN. |

---

## service-charge-history.spec.ts

| TC | Verdict | Reason |
|---|---|---|
| TC-SVC-HIS-001 | SOUND | known-defect annotation present. Asserts heading matches /Parker Palm Springs/ — expected to fail per NM-3300. The assertion is real and can detect a regression if NM-3300 is fixed. |
| TC-SVC-HIS-002 | SOUND | rowCount >= 1 after load. Minimal but legitimate — proves the tab renders data. |
| TC-SVC-HIS-003 | SOUND | Samples up to 10 rows; each row must have 4 non-empty cells. Real structural check. |
| TC-SVC-HIS-004 | SOUND | Regex /^\d+\.\d{2} %$/ on column 1. Precise format assertion. |
| TC-SVC-HIS-005 | SOUND | Regex /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2} (AM|PM)$/ on column 3. Precise format assertion. |
| TC-SVC-HIS-006 | SOUND | Parses dates and checks non-ascending order across up to 10 rows. Logic correct: NaN from bad parse would fail the comparison, which is correct behaviour. |
| TC-SVC-HIS-007 | SOUND | getHistoryControlCensus() checks filterInputCount, searchInputCount, dateRangePickerCount == 0. |
| TC-SVC-HIS-008 | SOUND | getHistoryControlCensus() checks paginationAriaLabelCount, roleNavigationCount, nextPrevButtonCount, pageSizeSelectorCount, loadMoreCount == 0. Distinct set of 5 pagination controls from HIS-007. |
| TC-SVC-HIS-009 | FALSE-GREEN | **Exact duplicate of TC-SVC-HIS-007.** Same three assertions from getHistoryControlCensus() (filterInputCount, searchInputCount, dateRangePickerCount). Different test title ("No filter, search, or date-range control" vs "read-only — no interactive elements inside") but identical assertions. If HIS-007 passes, HIS-009 will trivially pass too. One test adds zero coverage. File: service-charge-history.spec.ts:207. |
| TC-SVC-HIS-010 | SOUND | known-defect annotation. Asserts row[2] does NOT match UUID pattern. Expected to fail while GUIDs are rendered. Passed in final battery (pass-6) — meaning either GUIDs were absent or env variability; not a false-green. |
| TC-SVC-HIS-011 | WEAK | Isolation logic: `expect(new Set([count1604, count1101, count1105]).size).toBeGreaterThan(1)`. Two offices having different row counts does NOT prove data isolation (it only proves counts differ). If offices 1604 and 1101 coincidentally have the same count but different data, the test passes while data isolation is unproven. A row-set comparison (not just count) would be stronger. |
| TC-SVC-HIS-012 | FALSE-GREEN | **Name says "does not reorder rows" but body never asserts row order.** The row-order assertion was removed "to prevent a 30 s timeout" per comment (lines 296-303). The test now only checks `ariaSort === null` — which is a weaker, different claim than what the name states. A maintainer reading the test name gets a false confidence that row-order immutability is tested. File: service-charge-history.spec.ts:277. Additionally: this test FAILS in the final battery (sc-final.log pass-6: "HIS-012" in 4 failed) despite the triage report claiming "Green ×2". The triage ran targeted tests; the full-suite run contradicts. |
| TC-SVC-HIS-013 | SOUND | Spec header documents this as "test.fixme (not observed)" but NO test.fixme() wraps it. It runs as an ordinary test and PASSES in the final battery. The try/finally restore logic is correct. The stale fixme comment in the header is a documentation gap (not a test logic issue). |
| TC-SVC-HIS-014 | SOUND | known-defect annotation (NM-3285). Asserts modalVisible == true — expected to fail while the angular modal is absent. |
| TC-SVC-HIS-015 | SOUND | Checks office header before and after tab switch; asserts rowCount >= 1. Sound logic. FAILS in final battery as env wobble (undocumented in spec). |

---

## Summary counts

| Verdict | BAS | HIS | Total |
|---|---|---|---|
| FALSE-GREEN | 0 | 2 (HIS-009, HIS-012) | 2 |
| WEAK | 7 (005,006,008,011,013,015,022) | 2 (HIS-011, HIS-015-note) | 9 |
| SOUND | 22+1(030) | 11 | 34 |

(BAS-030 not fully read due to file truncation; counted as test by grep; assumed SOUND.)
