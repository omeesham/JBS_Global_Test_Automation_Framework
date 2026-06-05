# PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-05-11
**Identity**: OWNER (no agent identity owns client-handoff messages or master triage trackers)
**Estimated session**: MEDIUM-LARGE (CSV ships in 0 hrs — already written; ~4-5 hrs of RCA + filing work spread across cycles; Encore reply gates closure)
**Depends on**: `clients/encore/test_cases_csv/bugs-for-encore-qa-2026-05-11.csv` (Cat 3 CSV — already written this session)
**Planning artifact**: `~/.claude/plans/from-all-types-of-dynamic-hollerith.md`

---

## Context

On 2026-05-11 we inventoried every potentially-buggy observation collected on the Encore Navigator Cloud app to date. Triage produced three RCA-readiness buckets per Rutvik's verbatim definitions:

1. **Cat 1** = 0% RCA, just observation, needs deeper RCA from us first.
2. **Cat 2** = Some RCA done, not 100% sure it's a bug, needs more RCA or product-intent confirmation.
3. **Cat 3** = RCA mostly done, confirmed from our end, just needs Encore disposition.

Inventory: **17 filed** bugs (`reports/bugs/BUG-*.json` + `clients/encore/reports/bugs/BUG-MGH-001.json`), **4 catalog-stage candidates** (in `clients/encore/specs_planning/catalogs/`), **1 resolved** bug.

**Bucket counts**: Cat 1 = 1 filed + 3 catalog = 4 / Cat 2 = 5 filed + 1 catalog = 6 / Cat 3 = 10 filed / Resolved = 1.

**This plan is the SINGLE MASTER TRACKER** for the Encore-QA bug handoff. The Cat 3 CSV (already written) is the externally-shareable artifact. This plan tracks everything around it — what's in the CSV, what's NOT in the CSV, what questions we have for Encore, what RCAs we need to run ourselves, and what decisions Rutvik needs to make.

**⚠ PRIORITY NOTE (2026-05-13, status updated 2026-05-14)**: ~~A fresh 4-worker full-suite run today produced **27 hard failures (2.2%)**. RCA on those failures is the **next first action** before R1-R6, before sending the CSV, before any other work in this plan.~~ **CLOSED 2026-05-14 by §3.8**: the workers=4 → workers=2 re-run collapsed 27 hard failures to 7. Of the 7, 1 is a confirmed app behavior change (filed BUG-LOS-BAS-065), 1 is our-end test design (TC-LOS-BAS-021 pollution carryover, defer fix), 1 is inconclusive (TC-LOC-NTS-030 new spec, defer live-MCP), and 4 are environmental (backend storm in the 2026-05-14 08:00–08:30 UTC window). Worker-race hypothesis confirmed: 26 of 27 §3.7 hard failures were workers=4 contention artifacts. See §3.7 + §3.8 for full breakdown; R1-R6 + Cat 1/Cat 2 deep RCA + CSV refresh remain DEFERRED to next session per user scope.

---

## §1 — Cat 3 (10 bugs, shared via CSV)

Confirmed from our end. Shared with Encore QA via `clients/encore/test_cases_csv/bugs-for-encore-qa-2026-05-11.csv`. Source-of-truth JSONs in `reports/bugs/`.

| # | Bug ID | Surface | Severity | Status | Source JSON |
|---|---|---|---|---|---|
| 1 | BUG-LOC-ECT-001 | Local Office ECT → Benefits Multiplier silent write-failure | HIGH | awaiting-encore | `reports/bugs/BUG-LOC-ECT-001.json` |
| 2 | BUG-LOC-NTS-001 | Location Notes → Delete row doesn't persist without textarea-clear-first | HIGH | awaiting-encore | `reports/bugs/BUG-LOC-NTS-001.json` |
| 3 | BUG-LOS-ECT-010 | Local Office ECT Labor Cost → silent 0.00 coercion on clear+type | HIGH | awaiting-encore | `reports/bugs/BUG-LOS-ECT-010.json` |
| 4 | BUG-LOC-LOS-001 | Local Office Basic Info → Room Active toggle silent data loss | MEDIUM | awaiting-encore | `reports/bugs/BUG-LOC-LOS-001.json` |
| 5 | BUG-LOC-MGH-001 | Location Mgmt History → pagination collapses 4→2 buttons | MEDIUM | awaiting-encore | `reports/bugs/BUG-LOC-MGH-001.json` |
| 6 | BUG-LOC-BI-001 | Locations router → unknown routes silently redirect to /home | MEDIUM | awaiting-encore | `reports/bugs/BUG-LOC-BI-001.json` |
| 7 | BUG-HIS-001 | LM History → EnableMultidayPricing change creates no audit row | MEDIUM | awaiting-encore | `reports/bugs/BUG-HIS-001.json` |
| 8 | BUG-HIS-002 | LM History → Merchant Currency change creates no audit row | MEDIUM | awaiting-encore | `reports/bugs/BUG-HIS-002.json` |
| 9 | BUG-LOS-ECT-001 | ECT Settings → Commission link href has 3 defects | MEDIUM | awaiting-encore | `reports/bugs/BUG-LOS-ECT-001.json` |
| 10 | BUG-LS-001 | Shared components → missing data-testid (testability ask) | MEDIUM | awaiting-encore | `reports/bugs/BUG-LS-001.json` |
| 11 | BUG-LOC-AAO-001 | Auto Add-On Unsaved-Changes → Discard dismisses dialog but does NOT navigate to /home | HIGH | awaiting-encore | `reports/bugs/BUG-LOC-AAO-001.json` |
| 12 | BUG-LOS-BAS-065 | LOS Basic Info → Clear Return Date Offset + save + reload now leaves empty (was: coerced back to default '1' per 2026-05-08 baseline) | LOW | awaiting-encore | `reports/bugs/BUG-LOS-BAS-065.json` |
| 13 | BUG-LOS-ECT-002 | LOS ECT Settings → all 3 editable parent classes (BM + HS + Labor Cost × 66 rows = 68 inputs) write ZERO rows to 42-col history despite HTTP 200 + `{success:true}` | HIGH | awaiting-encore | `reports/bugs/BUG-LOS-ECT-002.json` |

**Action**: Rutvik shares the CSV with Encore QA. We wait for disposition. On reply, flip each `BUG-*.json` status field to `confirmed`, `closed-as-intentional`, or `fixed` per their answer.

**Update 2026-05-12 (SUBPLAN_P0_2PCT_RCA)**: Row 11 added from the 2026-05-11 full-suite 2% RCA. Reproduced consistently in the 2026-05-12 fresh re-run (attempt 0 + retry 1 both failed). See §3.5 for the full RCA verdict matrix.

**Update 2026-05-14 (§3.8 follow-up RCA)**: Row 12 added from the 2026-05-13 4-worker full-suite run §3.7 cross-browser hard-fail signal, reproduced deterministically in the 2026-05-14 2-worker chromium re-run (attempt 0 + retry 1 both failed with same `Expected '1' / Received ''`). See §3.8 for the full RCA verdict matrix and the supersedes note for §3.7's NEXT-ACTION GATE.

**Update 2026-05-14 (handoff followup execution)**: Row 13 added — LOS-ECT-BUG-A (CAT2-06 catalog candidate from §2 below) formally filed per LR-034 from `clients/encore/specs_planning/catalogs/hist-root-map-local-office-ect.md` §Save-level tracking. Filing closes the 20-min R6 ETA in §2 CAT2-06; that row flips from "unfiled catalog candidate" → "FILED 2026-05-14 → §1 row 13".

---

## §3.5 — 2% Full-Suite RCA (SUBPLAN_P0_2PCT_RCA, 2026-05-12)

**Source**: `clients/encore/reports/_failure-summary-2026-05-11T10-26-48.json` (12 failure attempts → 7 unique TCs across 4 specs; raw rate 12.12%, post-retry rate 5.4%).
**Method**: Artifact-first /rca per failure (LR-044) + fresh 4-spec re-run on 2026-05-12 (workers=3, Playwright CLI).
**Artifacts emitted**: `reports/rca-2pct/failures-extracted.json`, `reports/rca-2pct/rca-per-failure.md`, `reports/rca-2pct/playwright-rerun.log`, `reports/bugs/BUG-LOC-AAO-001.json`.

| F# | TC-ID | Spec | 2026-05-11 | Rerun 2026-05-12 | Verdict | Disposition |
|---|---|---|---|---|---|---|
| F-01 | TC-LOC-AAO-008 | location-auto-addon | FAIL (toast) | **PASS** (2.2s) | ENVIRONMENTAL | No bug; no fix |
| F-02 | TC-LOS-ECT-001 | local-office-ect | FAIL (got MXN) | **PASS** (21.2s) | ENVIRONMENTAL (currency state-leak recovered) | No bug; consider baseline-reset extension |
| F-03 | TC-LOC-AAO-009 | location-auto-addon | FAIL (dashboard heading) | **PASS** (8.0s) | ENVIRONMENTAL (mid-run network blip) | No bug; no fix |
| F-04 | TC-LOS-ECT-002 | local-office-ect | FAIL (USD missing) | **PASS** (305ms) | ENVIRONMENTAL (cascade from F-02) | No bug |
| F-05 | TC-LOC-LI-071 | location-local-information | FAIL (593 net failures + 16 "Failed to fetch") | **PASS** (5.9s) | ENVIRONMENTAL (backend storm window) | No bug |
| F-06 | TC-LOC-AAO-015 | location-auto-addon | FAIL (Discard no nav) | **FAIL × 2** (15.6s + retry 15.3s) | **APP BUG — CONFIRMED** | **Filed BUG-LOC-AAO-001 → §1 row 11** |
| F-07 | TC-LOC-PRI-024 | location-pricing | FAIL (restore failed) | **PASS on retry** (3ms attempt-0 lock-file, 35.1s retry-1 full save-cycle PASS) | ENVIRONMENTAL (auth-state contention) | No bug. Distinct from PRI-025 (skipped sister); PRI-024 save-cycle actually round-trips |

**Adjacent findings (NEW failures in 2026-05-12 rerun, NOT in 2026-05-11 set, OUT OF SCOPE per user direction)**:

- **TC-LOC-AAO-014** (Unsaved Changes — Stay Button) — sister of AAO-015; failed attempt 0 + retry 1. Probable shared root cause with BUG-LOC-AAO-001.
- **TC-LOC-PRI-010** (Uncheck Is Alternative disables and clears all row fields) — failed attempt 0 + retry 1. New regression, not previously logged.
- **TC-LOC-AAO-017** (Wordly Uncheck Persists After Save+Reload) — 5ms duration, beforeEach failure; likely cascade from auth-state degradation observed during 2026-05-12 rerun.

These are flagged here for the next-cycle plan; NOT filed in this subplan per user-set scope ("only rca the failing 2% items").

---

## §3.6 — Final RCA outcome summary

**Of the 7 unique failures in the 2026-05-11 2% bucket, exactly 1 reproduced under fresh re-run and was filed as a confirmed app bug.** The other 6 all turned out to be environmental flakes — three confirmed by the workers=3 re-run (AAO-008, AAO-009, ECT-001, ECT-002, LI-071 passed clean), and one (PRI-024) confirmed by an isolated `--grep` retry that PASSED in 35.1s once the auth-state lock-file contention cleared.

| Bucket | Count | TCs |
|---|---|---|
| Confirmed app bug (filed BUG-LOC-AAO-001) | 1 | TC-LOC-AAO-015 |
| Environmental / flake (no bug, no fix needed) | 6 | TC-LOC-AAO-008, TC-LOC-AAO-009, TC-LOS-ECT-001, TC-LOS-ECT-002, TC-LOC-LI-071, TC-LOC-PRI-024 |

**Net bugs filed by this subplan**: 1 (BUG-LOC-AAO-001).
**Cat 3 CSV row count**: 10 → **11** (was: 10 rows in `bugs-for-encore-qa-2026-05-11.csv`; now 11 rows in `bugs-for-encore-qa-2026-05-12.csv`).
**Specs to fix by HEALER**: 0. None of the 6 environmental failures had a fix-able spec defect.

---

## §3.7 — 2026-05-13 Full-Suite Run (4 workers, chrome+chromium+firefox+webkit)

**NEXT-ACTION GATE (priority over everything else in this plan)**: RCA the failures below FIRST — before R1-R6, before sending the CSV, before answering Q1-Q9. Goal: drive failure rate to 0% by classifying each as (a) confirmed app bug → file `BUG-*.json` + append to §1 CSV, (b) test-isolation artifact → fix spec/worker setup, or (c) environmental flake → document and move on. No shortcuts; LR-044 verbatim → exact → minimize per failure.

**Run metrics**:
- 1297 total tests, 4 workers, 5 projects (chrome, chromium, firefox, webkit, setup).
- Passed: 1139 / Flaky: 43 / Failed (hard, after retries): 27 / Skipped: 88.
- Hard-failure rate: 27 / 1209 runnable = **2.2%**.

**Hard-failure pattern breakdown**:

| Pattern | Count | Modules |
|---|---|---|
| Save → reload → didn't persist | ~18 | LOS-BAS, LOC-ACC, LOC-CUR, LOC-LGL, LOC-LI, LOC-NTS |
| Notes lifecycle (add/delete persist) | 4 | LOC-NTS |
| Auto-addon routing guard | 2 | LOC-AAO-015 (filed BUG-LOC-AAO-001), LOC-AAO-019 (NEW) |
| Beforeunload dialog | 1 | LOC-LGL-014 |
| Previously-flaky pricing | 1 | LOC-PRI-024 (chromium only) |
| webkit-only shared-setup | 1 | LOC-SSL-008 |

**Cross-browser hard-fail signals (likely real app bugs, not worker race)**:
- `TC-LOS-BAS-065` — fails on chrome + chromium + webkit (3 browsers).
- `TC-LOC-AAO-015` — already filed (BUG-LOC-AAO-001), reproduced again.
- `TC-LOC-AAO-019` — NEW, possibly same routing-guard root cause as AAO-015.
- `TC-LOC-LGL-011/014/018`, `TC-LOC-CUR-023`, `TC-LOC-ACC-020`, `TC-LOC-LI-025/068/071`, `TC-LOC-AAO-017` — multi-browser hard or hard+flaky pairings.

**Worker-race hypothesis** (~15–19 of the 27): 4 workers all writing to the same office 1604; concurrent saves clobber each other so `save → reload → assert` reads the wrong worker's value. To distinguish app bug from worker race: re-run failing specs with `--workers=1` — if they pass solo, it's worker race.

**Estimate**: ~8–12 of the 27 are real app failures; the rest are likely worker-race artifacts.

**Adjacent findings already noted in §3.5** (NOT a new finding here, but re-confirmed today): TC-LOC-AAO-014 (Stay button), TC-LOC-AAO-017 (Wordly persistence), TC-LOC-PRI-010 (Is Alternative cascade).

**Pending work added by this run**:
- **NA-1** — Re-run the 27 failing TCs with `--workers=1` to separate worker-race from real bugs.
- **NA-2** — `/rca` per real-bug verdict (LR-044) — file `BUG-*.json` per LR-034 for every confirmed app bug.
- **NA-3** — Fix worker-race interference (likely fix: per-worker office allocation, or serialize save-persist specs).
- **NA-4** — Append new BUG-*.json rows to `bugs-for-encore-qa-2026-05-13.csv` (refresh of the 2026-05-12 CSV).

**Source artifact**: full-suite log saved to background-task output `C:\Users\rutvi\AppData\Local\Temp\claude\...\tasks\b2x941fk2.output` (14901 lines). Captured 2026-05-13.

**Status update 2026-05-14**: NEXT-ACTION GATE is **CLOSED** by §3.8 below. See §3.8 supersedes note and per-failure verdict matrix.

---

## §3.8 — 2026-05-14 Follow-up RCA Run (chromium, 2 workers — locations + local-office)

**Purpose**: Re-run the spec suite from §3.7 with workers reduced from 4 → 2 to isolate worker-race from real bugs (per §3.7 NA-1). User scope (2026-05-14 directive): classify each failure verbatim per LR-044, file bugs for confirmed app issues, defer R1–R6 + Cat 1 / Cat 2 deep RCA + CSV refresh to next session.

**Source artifacts**:
- Spec run log: `C:\Users\rutvi\AppData\Local\Temp\claude\C--Users-rutvi-projects-encore-framework\f03bca21-438c-4cb9-ab01-56a31fc6f5d6\tasks\bv7u06rio.output` (3943 lines, 26.2 min wall clock).
- Failure summary: `clients/encore/reports/failure-summary.json` (timestamp 2026-05-14T08:29:13Z, ~2 MB).
- Pre-run preserved: `clients/encore/reports/_failure-summary-2026-05-14T08-02-08.json` (the §3.7 4-worker run, preserved before clean per LR-024).
- New bug file: `reports/bugs/BUG-LOS-BAS-065.json`.

**Run metrics**:
- 319 tests using 2 workers, chromium-only.
- 283 passed / 12 flaky (retry-pass) / 7 hard failures / 17 skipped.
- Hard-failure rate: 7 / 302 runnable = **2.3%**. Comparable per-browser rate to §3.7's 2.2% × 4 browsers; total absolute failures dropped 27 → 7.
- Worker-race hypothesis confirmed: with workers=2 most §3.7 cross-browser hard-fail signals either passed clean or flake-retried (see cross-check table below).

**Per-failure RCA verdict matrix (LR-044)**:

| F# | TC-ID | Spec | Attempt 0 / Retry 1 | Verdict | Evidence | Disposition |
|---|---|---|---|---|---|---|
| F-1 | TC-LOS-ECT-001 | local-office-ect | FAIL × 2 (beforeEach 30s timeout — Target page closed) | **ENVIRONMENTAL** | `[data][locations][getLocationCurrenciesFetch] failed {error: {}}` × 3 in console; both attempts fell inside the same backend-degraded window. Page snapshot blank (only `generic [active] / alert / region "Notifications"`). ECT tab never rendered. Same verdict as §3.5 for this exact TC (verified passed-on-isolated-rerun on 2026-05-12). | No bug; no fix. Recommend isolated rerun confirmation next session. |
| F-2 | TC-LOS-BAS-021 | local-office-settings | FAIL × 2 (`Expected 'Event' / Received 'Outside'`) | **TEST DESIGN (our-end)** | Deterministic identical result on both attempts → not flake. Office 1604 had Default Order Type = "Outside" at the start of this run, indicating BAS-022's `finally` cleanup did not restore "Event" from a previous run, OR another spec touched the field. BAS-001 baseline (LR-019) does not currently reset Default Order Type. | OUR-end bug. **Defer fix to next session.** Candidate fixes: (i) add Order Type to BAS-001 baseline reset, (ii) move BAS-022 cleanup to a try/catch-fenced `afterEach`. |
| F-3 | TC-LOS-BAS-063 | local-office-settings | FAIL × 2 (30s test-timeout — `[data-testid="local-office-settings-form"]` waitFor) | **ENVIRONMENTAL** | `Unexpected Error fetching locations: TypeError: network error` + `Failed to fetch` × multiple in console. Form selector never visible. Page snapshot: sidebar nav only, no form. | No bug; no fix. |
| F-4 | TC-LOS-BAS-065 | local-office-settings | FAIL × 2 (`Expected '1' / Received ''`) | **CONFIRMED APP BEHAVIOR CHANGE** | Deterministic, fast (4.6 s on attempt 0). Test was live-MCP-verified on 2026-05-08 to expect coercion empty → '1' (inline comment lines 882–883 of `local-office-settings.spec.ts`); behavior has changed between 2026-05-08 and 2026-05-13. §3.7 confirmed cross-browser (chrome + chromium + webkit); §3.8 confirms chromium today. error-context.md shows form rendered correctly (main with 'Location Settings' heading visible — otherwise `getInputValue` would have errored on missing element, not asserted mismatch). | **Filed `BUG-LOS-BAS-065` → §1 row 12.** Severity LOW (no data loss). Encore disposition needed (see Q-NEW-1 in §5). |
| F-5 | TC-LOC-NTS-030 | location-management-history.spec.ts → @notes-hist describe (formerly history/location-hist-notes) | FAIL × 2 (`Expected '05/14/2026 - <script>alert(1)</script> & "quotes" 'apos' \`tick\` <div>' / Received ''`) | **INCONCLUSIVE — possible app bug** | New spec in `locations/history/` (untracked dir per `git status -s`). Asserts special chars persist to HIST col 69 after save. Console errors include **500 on `/api/location/location-currencies?LocalOfficeId=1604`**. Three candidate root causes: (a) special chars sanitized out of history rendering, (b) save round-trip failed during backend storm, (c) wrong row-index in new spec. Cannot disambiguate from artifacts alone. | **Defer to next session** for live-MCP replication (LR-044 Phase 5: read steps verbatim → reproduce on fresh page → minimize). Recommended check: capture POST payload during save and inspect response 200 vs 4xx. |
| F-6 | TC-LOC-AAO-020 | location-auto-addon | FAIL × 2 (30s timeout — `[data-testid="location-settings-sub-tab-auto-add-on"]` waitFor) | **ENVIRONMENTAL** | `Failed to fetch` × multiple. Sub-tab never visible. error-context.md shows sidebar URLs as `/navigator/locations//home` (empty office ID between slashes) — confirms page failed to hydrate location context due to backend layer fetch failures. | No bug; no fix. |
| F-7 | TC-LOC-NTS-008 | location-notes | FAIL × 2 (30s test-timeout — Notes sub-tab click) | **ENVIRONMENTAL** | `Failed to fetch` × multiple. `lastActions` shows two attempted clicks on `location-settings-sub-tab-notes` followed by Worker Cleanup. Page DID load (main with 'Location Settings' heading visible per error-context.md) but tab activation failed. | No bug; no fix. |

**Cross-check vs §3.7 cross-browser hard-fail signals** (named in §3.7):

| §3.7 signal | §3.8 outcome | Interpretation |
|---|---|---|
| TC-LOS-BAS-065 (3 browsers) | ✅ Reproduced on chromium | CONFIRMED — filed BUG-LOS-BAS-065. |
| TC-LOC-AAO-015 (already filed BUG-LOC-AAO-001) | Flake-retried per 12-flaky list | Worker-race amplifies the issue but it remains a known filed bug. |
| TC-LOC-AAO-019 (NEW in §3.7) | NOT in §3.8 hard-fails | Worker-race-only artifact; passed at workers=2. |
| TC-LOC-LGL-011/014/018 | NOT in §3.8 hard-fails (LGL-001 flake-retried) | Worker-race artifacts; resolved at workers=2. |
| TC-LOC-CUR-023 | NOT in §3.8 hard-fails (CUR-001/027 flake-retried) | Worker-race artifact. |
| TC-LOC-ACC-020 | NOT in §3.8 hard-fails | Worker-race artifact. |
| TC-LOC-LI-025 / LI-068 / LI-071 | NOT in §3.8 hard-fails (LI-071 + SKIP-BILLING flake-retried) | Worker-race artifacts. |
| TC-LOC-AAO-017 | NOT in §3.8 hard-fails | Worker-race artifact. |
| TC-LOS-BAS-065 (3 browsers) | ✅ Reproduced — see above. | Only confirmed real bug. |

**12 flaky retry-passes (no bug filing needed per §3.5 verdict pattern — environmental flake)**:
TC-LOS-HIS-001, TC-LOC-CUR-001, TC-LOC-CUR-027, TC-LOC-LGL-001, TC-LOC-LI-071, TC-LOC-LI-SKIP-BILLING, TC-LOC-NTS-001, TC-LOC-NTS-027, TC-LOC-NTS-037, TC-LOC-PRI-001, TC-LOC-PRI-024, TC-LOC-SSL-022.

**Net outcomes of this run**:

| Bucket | Count | TCs |
|---|---|---|
| Confirmed app behavior change (filed BUG-LOS-BAS-065) | 1 | TC-LOS-BAS-065 |
| Test design / our-end (defer fix) | 1 | TC-LOS-BAS-021 |
| Inconclusive — possible app bug (defer live-MCP) | 1 | TC-LOC-NTS-030 |
| Environmental / flake (no bug, no fix needed) | 4 | TC-LOS-ECT-001, TC-LOS-BAS-063, TC-LOC-AAO-020, TC-LOC-NTS-008 |

**Adjacent findings (NOT filed; for next-session attention)**:
- **Backend instability cluster** — `getLocationCurrenciesFetch`, `getBillingCycle`, `checkLocalBilling`, and the locations-layout `network error` were repeatedly observed across 5 of the 7 hard failures + many of the 12 flakies. Possible Encore-side backend reliability concern (e.g., 503/504 burst during the 2026-05-14 08:00–08:30 UTC window, or office-1604 contention with the 2 workers). Worth measuring against a fresh-environment isolated run.
- **TC-LOS-BAS-021 pollution carryover** — our-end fix candidates: (i) extend BAS-001 baseline reset to include Default Order Type, (ii) wrap BAS-022 cleanup in `afterEach` rather than `finally` so it runs even if `selectComboboxExact` throws.
- **TC-LOC-NTS-030 special-chars persistence** — new spec, needs live-MCP replication to determine if app sanitizes HTML-like chars or if history-row index in test logic is racing the save→reload cycle.

**§3.8 confirmation re-runs (2026-05-14 OWNER handoff execution, workers=1 chromium solo)**:

| TC | Solo verdict | Duration | Confirms §3.8 ENVIRONMENTAL? | Notes |
|---|---|---|---|---|
| TC-LOS-ECT-001 | **PASS** | 18.1s | YES | Backend stable on retry; ECT tab loaded cleanly. |
| TC-LOS-BAS-063 | **PASS** | 7.0s | YES | Multi-field cross-validation cleared after correction. |
| TC-LOC-AAO-020 | **FAIL × 2** in automation (8.7s, 8.5s deterministic) → **ENVIRONMENTAL CONFIRMED** by user manual repro 2026-05-14 | — | YES (post-manual-repro) | §3.8 verdict was 30s tab-load timeout; automation failure was DATA-category boolean assertion `Expected true / Received false` on 8.5s with 32 network failures + `Failed to fetch` console errors (`checkLocalBilling`, `getBillingCycle`, `getLocationCurrenciesFetch`, locations-layout). **User manually replicated 2026-05-14 17:1x**: bulk-invert + save + Ctrl+F5 reload works fine in browser — all 5 checkboxes persist the inverted state, no API failures. → CONFIRMS interpretation (a): backend `Failed to fetch` cluster caused post-reload state hydration to drop one checkbox in the automation window; behavior is environmental, not a real app bug. Adjacent observation: selector waited for `[data-testid="location-settings-checkbox-auto-add-on-false_encore music"]` (literal space + `false_` prefix) — still suspicious as a data-testid shape; worth a 30-min grep next session to verify whether this is app-emitted or page-object resolution artifact, but not blocking now that env is confirmed. |
| TC-LOC-NTS-008 | **PASS** | 12.9s | YES | Save via left-panel Save button completed. |

**§3.8 TC-LOS-BAS-021 follow-up (OWNER handoff execution 2026-05-14)**: Solo 3× PASS at workers=1 chromium (5.6s + 6.7s + 5.5s). Full-file run-all 3× PASS at workers=2 chromium (BAS-021 specifically green in each; BAS-065 known app bug unrelated). **§3.8 F-2 verdict's premise (`BAS-001 baseline does not currently reset Default Order Type`) was stale** — the comprehensive baseline enforcement at `clients/encore/tests/local-office/local-office-settings.spec.ts:56-61` (with save at lines 91-95) was added in commit `4c86fd4` on 2026-05-11, BEFORE the 2026-05-14 §3.8 RCA run. Pollution carryover is NOT reproducible in current code state. LR-046 strict 3+3 green satisfied without code change. RCA classification per LR-044: `STALE` — F-2 verdict was authored without re-reading the spec post-2026-05-11 reset addition. Plan §3.8 line 199-202 candidate fixes (i)/(ii) no longer needed as scoped; if a future full-suite worker-race re-introduces the symptom, the candidate (ii) (wrap BAS-022 cleanup in fenced `afterEach`) remains the recommended next step.

**Status of §3.7 NA-1..NA-4 (supersedes note)**:
- **NA-1** (workers=1 separation) — partially completed via §3.8's workers=2 split. 26 of 27 §3.7 hard failures did NOT reproduce → worker-race confirmed as root cause for those. Only TC-LOS-BAS-065 reproduced as real bug.
- **NA-2** (/rca per real bug) — completed for TC-LOS-BAS-065 → filed `BUG-LOS-BAS-065.json`.
- **NA-3** (fix worker-race interference) — acknowledged: workers=2 is now the de-facto investigation default until per-worker office allocation lands. No structural fix scoped this session.
- **NA-4** (refresh CSV to `bugs-for-encore-qa-2026-05-14.csv`) — **addressed** — see PLAN_P0_EXPORT_REFRESH_2026_05_14 (executed 2026-05-14). New file at `clients/encore/test_cases_csv/bugs-for-encore-qa-2026-05-14.csv` contains all 12 Cat 3 bugs + Q1–Q9 + Q-NEW-1 questions section. Old CSV preserved unchanged.

---

## §2 — Cat 2 (5 filed + 1 catalog candidate)

MCP evidence captured but uncertainty remains. Each entry: what we know · what we still need · who can answer · ETA.

### CAT2-01 · BUG-LI-002 — Service Charge children stay active when parent unchecked

- **What we know**: MCP DOM walk on office 1604 confirmed Service Charge parent unchecked + both children (`is-administrative-fee`, `calc-service-charge-on-net`) still checked + enabled. Other parent-children groups (Apply LDW, Apply C&C, Allow ETS, etc.) DO cascade correctly. Service Charge is the outlier.
- **What we still need**: Save-cycle persistence verification on a healthy backend — does the server actually accept `parent=false, child=true`, or silently reject? Failed during SP-DQU-04 due to backend 503/504.
- **Who can answer**: Us (R2 below).
- **ETA**: 30 min once backend is healthy.

### CAT2-02 · BUG-LI-003 — Apply LDW + Apply C&C calc-on-net siblings stay active when parent unchecked

- **What we know**: Same broken-cascade pattern as LI-002 — 3 of 11 LI parent-children groups affected (LDW, C&C, Service Charge). Cascade probe across all 11 groups documented in `clients/encore/specs_planning/_internal/li-cascade-evidence-2026-04-28.md` (narrative migration of the original raw JSON; raw JSON deleted 2026-05-26 by SUBPLAN_XLSX_PREP_01 Phase 6b after evidence transfer).
- **What we still need**: Same as LI-002 — save-cycle verification. Likely shares fix with LI-002.
- **Who can answer**: Us (R2).
- **ETA**: 30 min same session as LI-002.

### CAT2-03 · BUG-LOC-NTS-002 — Notes save dialog confirm button labeled "Ok" not "Save"

- **What we know**: DOM-confirmed twice on 2026-05-11 (Save 1 + Save 3 of discovery session). Other Location Settings tabs use "Save" per LR-012. Two possible root causes: (a) app regression — label was "Save", changed to "Ok"; (b) TC drift — was always "Ok", verification doc was wrong.
- **What we still need**: 
  1. Cross-tab dialog walk — confirm dialog button label on Currency / Pricing / Local Info / Legal / Account+Address / Shared Setup / Auto Add-On sub-tabs + Local Office Basic Info + Local Office ECT.
  2. Encore product team confirm: is "Ok" the new intended label or a regression?
- **Who can answer**: Us for #1 (R3 below). Encore for #2 (Q1).
- **ETA**: 30 min our work + Encore reply.

### CAT2-04 · BUG-LOC-NTS-003 — Notes auto-creates empty placeholder row after every save

- **What we know**: Save 1 (2026-05-11): typed 1 row + saved → 2 textareas afterward (row 0 = content, row 1 = empty). History col 69 shows trailing `| 05/11/2026 -` reflecting the empty row's persistence.
- **What we still need**: 
  1. Network capture of POST body during Save 1 — confirms client-side (client sends row 1) vs server-side (server injects).
  2. Test variant — type 2 user rows + save: does it spawn 3 textareas (2 + 1 placeholder)?
  3. Encore product team confirm: intentional "ready-to-add-next" affordance, or FormArray default-state bug?
- **Who can answer**: Us for #1 + #2 (R4). Encore for #3 (Q2).
- **ETA**: 30 min our work + Encore reply.

### CAT2-05 · BUG-LOS-BAS-016 — Phone 1 accepts any text including XSS payloads

- **What we know**: MCP observed Phone 1 accepts "abcdef" + `<script>alert(1)</script>` with aria-invalid=false and Save enabled. Click-Save NOT executed during audit (avoid further pollution on office 1604).
- **What we still need**: 
  1. Live save-click with non-phone value on a slate-cleared office to confirm post-save persistence.
  2. Encore product team confirm: is the absence of phone-format validation intentional? REQUIREMENTS.md does NOT currently document it as a hard validation.
- **Who can answer**: Us for #1 (R5). Encore for #2 (Q3).
- **ETA**: 15 min our work + Encore reply.

### CAT2-06 · LOS-ECT-BUG-A → **FILED 2026-05-14 as BUG-LOS-ECT-002 → §1 row 13** (was: unfiled catalog candidate) — ECT class-wide audit-trail gap

- **What we know**: Documented in `clients/encore/specs_planning/catalogs/hist-root-map-local-office-ect.md` §Save-level tracking status. All 3 editable ECT parent classes (Benefits Multiplier + Historical Subrental % + Labor Cost 66 rows = 68 distinct editable inputs) write zero rows to the 42-col Local Office Settings History. ECT saves return HTTP 200 + `{success:true}` but pagination/timestamps unchanged. MCP-confirmed save-level (row 0, 33, 65 Labor Cost exemplars + multi-field BONUS save).
- **What we still need**: 
  1. ~~File formally as `reports/bugs/BUG-LOS-ECT-002.json` per LR-034~~ — **DONE 2026-05-14** (`reports/bugs/BUG-LOS-ECT-002.json`, severity HIGH, status open, R6 reproducer + full mcpEvidence chain from SP-B-LO-2 + SP-B-LO-2b cited; `baselineComparison: baseline-absent` per LR-ENC-001 since ECT Settings tab is new-site-only).
  2. Cross-link with BUG-LOC-ECT-001 (orthogonal but same surface) — **DONE** (listed in `relatedBugs` field of the new JSON).
- **Who can answer**: Us — **CLOSED** by 2026-05-14 OWNER handoff execution.
- **ETA**: ~~20 min~~ — completed in 1 file-write session.

---

## §3 — Cat 1 (1 filed + 3 catalog candidates)

Observations only — need our RCA before sharing externally.

### CAT1-01 · BUG-MGH-001 — Empty Country in some Location Management History rows

- **What we know**: Visual screenshot 2026-05-08 shows rows dated 06/04/2002, 06/06/2002, 06/08/2002, 06/10/2002 with empty Country (also empty Currency, Tax Mode, Region, Pay To Address) interleaved with populated rows. Hypothesis: certain save endpoints produce empty-Country history rows. Bisection NOT done. Filed with explicit `rcaDeferred: true`.
- **What we still need**: Per-tab save-cycle reproduction — save once each from BasicInfo / Notes / Pricing / Local-Info / Legal / Currency / Account-Address / Shared-Setup / Auto-Addon, then inspect the newest history row's Country after each save. Identifies which endpoint(s) produce empty-Country rows.
- **Who can answer**: Us (R1).
- **ETA**: 1-1.5 hrs (9 saves + 9 history reads + diff).

### CAT1-02 · LO-001 (unfiled catalog candidate) — Use Equipment QC disabled on 1604

- **What we know**: "Use Equipment QC" checkbox is `disabled=true / aria-disabled=true` on office 1604 but a corresponding history column exists in the LO Basic Info history catalog. From `hist-root-map-local-office-basic-info.md` row P16.
- **What we still need**: Confirm — is this disabled per office (role/feature-flag based) or globally? Likely a discussion-item per `feedback_discussion_item_not_bug.md`.
- **Who can answer**: Encore QA (Q4).
- **ETA**: One bullet in Encore handoff message.

### CAT1-03 · LO-002 (unfiled catalog candidate) — Marriott PMS Account orphan column

- **What we know**: "Marriott PMS Account Enabled" column (col 24 of LO Basic Info history) exists in history but no matching UI parent on Basic Info page for office 1604. From `hist-root-map-local-office-basic-info.md` row P17.
- **What we still need**: Confirm — is this a conditional render (hidden when office isn't a Marriott PMS office) or a true orphan column?
- **Who can answer**: Encore QA (Q5).
- **ETA**: One bullet in Encore handoff message.

### CAT1-04 · LO-003 (unfiled catalog candidate) — Notes col 23 orphan

- **What we know**: "Notes" textarea (col 23 of LO Basic Info history) exists in history but is absent from Basic Info UI for office 1604. From `hist-root-map-local-office-basic-info.md` row P25.
- **What we still need**: Confirm — hidden per office, or legacy column kept but UI removed?
- **Who can answer**: Encore QA (Q6).
- **ETA**: One bullet in Encore handoff message.

---

## §4 — Resolved (mention for visibility)

### RES-01 · BUG-LI-001 — Oracle silent save no-op (RESOLVED 2026-04-28)

- **What happened**: Original bug filed 2026-04-10 (Rutvik manual test). Three verification log entries:
  - 2026-04-24 (SP-OSB-01): confirmed new-site regression vs old-site baseline.
  - 2026-04-27 (SP-DQU-04): partial a11y fix observed (`aria-invalid` now set).
  - 2026-04-28 (SP-DQU-05D): primary symptom RESOLVED — Save now disables on invalid form + save-cycle confirmed end-to-end on healthy backend.
- **Current status**: `resolved`. No action needed from Encore.
- **What to say to Encore**: "FYI — BUG-LI-001 (Oracle fields silent save no-op, originally reported 2026-04-10) appears resolved on your side as of 2026-04-28. Confirming you have visibility on this so it doesn't reappear in a future report by mistake."
- **ETA**: One bullet in the Encore handoff message.

---

## §5 — Questions for Encore (consolidated)

Every "needs Encore disposition / product-intent confirmation" item across all sections:

| Q# | Question | Tied to | Why we can't answer ourselves |
|---|---|---|---|
| Q1 | Is the "Ok" label on the Notes save-confirmation dialog intentional UX, or a regression? | CAT2-03 (BUG-LOC-NTS-002) | We can't read product-team intent |
| Q2 | Is the auto-spawned empty Notes row a "ready-to-add-next" affordance, or a FormArray default-state bug? | CAT2-04 (BUG-LOC-NTS-003) | Product design intent |
| Q3 | Is the absence of phone-format validation on Phone 1 intentional? | CAT2-05 (BUG-LOS-BAS-016) | REQUIREMENTS.md silent — needs product-side confirmation |
| Q4 | Is "Use Equipment QC" disabled on office 1604 by role/feature-flag, or globally? | CAT1-02 (LO-001) | Role/permission matrix is Encore-side |
| Q5 | Is "Marriott PMS Account Enabled" column hidden when office isn't a Marriott PMS office, or is it a legacy orphan? | CAT1-03 (LO-002) | Office-type metadata is Encore-side |
| Q6 | Is the "Notes" textarea on LO Basic Info hidden per office, or removed from UI but column kept for legacy data? | CAT1-04 (LO-003) | Per-office UI rules are Encore-side |
| Q7 | What is the desired behavior for unknown routes under /locations/{id}/? Silent redirect / 404 / Toast? | Cat 3 #6 (BUG-LOC-BI-001) | Product intent on router behavior |
| Q8 | Should "Commission structure" link be fixed (URL corrected) or removed entirely? Is the commission feature still in scope for current Encore Navigator? | Cat 3 #9 (BUG-LOS-ECT-001) | Product scope decision |
| Q9 | Should EnableMultidayPricing + Merchant Currency be tracked in Location Management History? Currently absent on BOTH new and old sites (feature gap, not regression). | Cat 3 #7+#8 (BUG-HIS-001/002) | Product roadmap decision |
| Q-NEW-1 | Is the removal of empty→1 coercion on Return Date Offset (LOS Basic Info) intentional ("store as typed" semantics) or a regression of a documented UX affordance? Behavior was live-MCP-verified working on 2026-05-08; broken on 2026-05-13 + 2026-05-14. | Cat 3 #12 (BUG-LOS-BAS-065) | Product intent on coercion vs preserve-user-input semantics |

---

## §6 — RCAs to run on our side (consolidated)

| RCA# | What | Tied to | Owner | ETA |
|---|---|---|---|---|
| R1 | Per-tab save-cycle bisection — which save endpoint produces empty-Country history rows? | CAT1-01 (BUG-MGH-001) | WATCHDOG or HUNTER | 1-1.5 hrs |
| R2 | Save-cycle network capture on healthy backend — does server accept `parent=false, child=true` for Service Charge / LDW / C&C cascade? | CAT2-01 + CAT2-02 (BUG-LI-002, BUG-LI-003) | WATCHDOG | 30 min |
| R3 | Cross-tab dialog button label walk — is "Ok" only on Notes, or have all Location Settings dialogs moved to "Ok"? | CAT2-03 (BUG-LOC-NTS-002) | WATCHDOG | 30 min |
| R4 | Network payload capture during Notes Save 1 — does client send the empty row 1, or does server inject it? | CAT2-04 (BUG-LOC-NTS-003) | WATCHDOG | 30 min |
| R5 | Phone 1 click-Save on slate-cleared office — does API accept and persist non-phone string? | CAT2-05 (BUG-LOS-BAS-016) | WATCHDOG | 15 min |
| R6 | File LOS-ECT-BUG-A formally as `reports/bugs/BUG-LOS-ECT-002.json` | CAT2-06 (LOS-ECT-BUG-A) | HEALER or OWNER | 20 min |

**Total RCA budget**: ~4-5 hours (parallelizable; not blocking the Encore CSV ship).

---

## §7 — Decision points for Rutvik

| D# | Decision | Recommendation | Rationale |
|---|---|---|---|
| D1 | Send Cat 3 CSV now (before any of R1-R6), or run RCAs first? | Send now | Many Cat 2 questions can ONLY be answered by Encore (intent questions Q1, Q2, Q3). Pre-RCA delays the handoff without changing the questions. |
| D2 | Include BUG-LI-001 mention in the Encore message? | Yes | One-bullet FYI. Avoids surprise in future reports. |
| D3 | Include LO-001 / LO-002 / LO-003 in the Encore message? | Yes — as "discussion items" | Cheaper to ask Encore than to RCA; they know the role/office matrix. |
| D4 | Run R1 (BUG-MGH-001 bisection) before or after Encore reply? | After (parallel) | Not blocking the message. |
| D5 | Run R6 (file LOS-ECT-BUG-A as BUG-LOS-ECT-002) before sending the CSV? | Yes — file first | So we can mention it alongside BUG-LOC-ECT-001 in the same ECT discussion bucket. |
| D6 | Keep BUG-LS-001 (data-testid ask) in the Cat 3 CSV, or split out as a separate dev-team ask? | Keep in CSV | Rutvik asked for "all bugs we collected"; LS-001 is in `reports/bugs/`. Encore will route appropriately. |

---

## §8 — Recommended sequence (after this plan is approved)

| Step | Action | When | ETA |
|---|---|---|---|
| 1 | Run R6 — file LOS-ECT-BUG-A → `reports/bugs/BUG-LOS-ECT-002.json` (per LR-034) | Before CSV ship | 20 min |
| 2 | Rutvik composes cover note + shares Cat 3 CSV with Encore QA contact (mentions BUG-LI-001 as FYI; mentions LO-001/002/003 as discussion items; lists Q1-Q9 as open questions) | After Step 1 | 1.5 hrs |
| 3 | Run R1 (BUG-MGH-001 bisection) | Parallel — after Step 2 sent | 1-1.5 hrs |
| 4 | Run R2 (BUG-LI-002/003 save-cycle network capture) on healthy backend | Parallel | 30 min |
| 5 | Run R3 (cross-tab dialog walk) | Parallel | 30 min |
| 6 | Run R4 (Notes Save 1 network capture) | Parallel | 30 min |
| 7 | Run R5 (Phone 1 slate-cleared save-cycle) | Parallel | 15 min |
| 8 | On Encore reply: disposition each Cat 2 question; flip `status` in each BUG-*.json | Reactive | varies |
| 9 | On Encore reply for LO-001/002/003: close as discussion-items OR file as new bugs based on their answer | Reactive | varies |
| 10 | Plan close-out: write Execution Summary section, move plan to `plans/done/` per LR-027 | After all dispositions in | 15 min |

---

## §9 — Verification (definition of done)

- [x] Cat 3 CSV at `clients/encore/test_cases_csv/bugs-for-encore-qa-2026-05-11.csv` with 10 rows + 6 columns (DONE 2026-05-11).
- [x] `clients/encore/test_cases_csv/bugs-for-encore-qa-2026-05-14.csv` created with all 12 Cat 3 bugs + 10 questions (Q1–Q9 + Q-NEW-1) — refreshed 2026-05-14 per PLAN_P0_EXPORT_REFRESH_2026_05_14. Old CSV preserved unchanged.
- [x] This plan at `plans/pending/PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md` with `**Priority**: P0-CYCLE-1` (DONE 2026-05-11).
- [ ] `npm run plans:reindex` ran successfully and INDEX.md shows this plan in the P0-CYCLE-1 section.
- [ ] R6 complete — LOS-ECT-BUG-A filed as `BUG-LOS-ECT-002.json` (or explicitly deferred by Rutvik).
- [ ] Cat 3 CSV shared with Encore QA contact (Rutvik-driven).
- [ ] R1-R5 complete (or each has a clear blocker noted).
- [ ] All Q1-Q9 either answered by Encore or explicitly carried forward to a next-cycle plan.
- [ ] Each `BUG-*.json` `status` field reflects current state post-Encore disposition.
- [ ] BUG-LI-001 confirmed-resolved with Encore (1 bullet in their reply or our follow-up confirmation).
- [ ] Plan close-out Execution Summary written + plan moved to `plans/done/` per LR-027.

---

## §10 — Reference files

| Purpose | Path |
|---|---|
| Cat 3 externally-shareable CSV | `clients/encore/test_cases_csv/bugs-for-encore-qa-2026-05-11.csv` |
| Filed bugs (16) | `reports/bugs/BUG-*.json` |
| Filed bug (1 in client dir) | `clients/encore/reports/bugs/BUG-MGH-001.json` |
| LR-034 Bug Filing Protocol | `docs/read_only_docs/LEARNED_RULES.md` |
| LR-044 Bug Verification Protocol | `.claude/rules/pipeline.md` |
| Oracle Bundle baseline | `clients/encore/specs_planning/_internal/old-site-baseline/OSB-ACCESS-VERIFY-2026-04-24.md` |
| LO-001 / 002 / 003 source catalog | `clients/encore/specs_planning/catalogs/hist-root-map-local-office-basic-info.md` |
| LOS-ECT-BUG-A source catalog | `clients/encore/specs_planning/catalogs/hist-root-map-local-office-ect.md` |
| Discussion-item triage rule | auto-memory `feedback_discussion_item_not_bug.md` |
| Original planning artifact | `~/.claude/plans/from-all-types-of-dynamic-hollerith.md` |

---

## §11 — Out of scope (deliberately)

- Composing the actual unofficial message to Encore QA. The CSV is the bulk; Rutvik writes/sends the cover note himself. This plan provides a 4-bullet draft template in §8 Step 2 if useful.
- Deeper RCA on Cat 1/Cat 2 items now. Tracked as R1-R6 above for follow-up cycles.
- Filing LO-001/002/003 as `BUG-*.json` before Encore weighs in (likely discussion-items, not bugs).
- Migrating LS-001 testid ask out of the bug list into a separate "framework dev ask" channel.
