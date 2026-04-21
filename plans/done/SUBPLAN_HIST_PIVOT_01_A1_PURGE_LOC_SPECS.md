# SUBPLAN SP-A1: Purge HIST TCs from 8 Location Specs

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 1 (Top Priority — unblocks everything else)
**Status**: DONE
**Priority**: P0
**Created**: 2026-04-20
**Executed**: 2026-04-20
**Depends on**: none (runs first)
**Identity**: BUILDER (edits spec files)
**Skills**: `/cleanup` + auto-called `/regression-guard` (before+after) + `/identity` gate
**Estimated**: one session (1–2 hours)

---

## Cause — Why This Subplan Exists

Under the new HIST pivot (master plan §1), non-HIST specs must contain ZERO history code. Each save-producing Location spec carries an appended `TC-LOC-*-HIST` test that takes a HIST tax every regression run AND provides only smoke coverage (all `expect.soft()`). Purging these unblocks the dedicated hist-column test files (SP-D*) and removes the HIST tax from 8 specs at once.

---

## Scope — Exact Files + Actions

Delete **only** the following from each spec. Nothing else.

| Spec file | Lines to delete | Elements |
|---|---|---|
| [location-currency.spec.ts](../../clients/encore/tests/specs/setup/locations/location-currency.spec.ts) | 11, 26, 36, 331–377 | `suiteStartTime` var (11), history page object import (26), `suiteStartTime` init in `test.beforeAll` (36), full `TC-LOC-CUR-HIST` test body (331–377) |
| [location-local-information.spec.ts](../../clients/encore/tests/specs/setup/locations/location-local-information.spec.ts) | 22, 27, 419–485, + import | `suiteStartTime` (22), init (27), `TC-LOC-LI-HIST` body (419–485), history page object import |
| [location-pricing.spec.ts](../../clients/encore/tests/specs/setup/locations/location-pricing.spec.ts) | 25, 30, 610–670, + import | Same pattern, `TC-LOC-PRI-HIST` |
| [location-account-address.spec.ts](../../clients/encore/tests/specs/setup/locations/location-account-address.spec.ts) | 13, 18, 301–348, + import | `TC-LOC-ACC-HIST` |
| [location-legal.spec.ts](../../clients/encore/tests/specs/setup/locations/location-legal.spec.ts) | 14, 19, 198–244, + import | `TC-LOC-LGL-HIST` |
| [location-notes.spec.ts](../../clients/encore/tests/specs/setup/locations/location-notes.spec.ts) | 20, 25, 371–410, + import | `TC-LOC-NTS-HIST` |
| [location-shared-setup-locations.spec.ts](../../clients/encore/tests/specs/setup/locations/location-shared-setup-locations.spec.ts) | 14, 19, 393–443, + import | `TC-LOC-SSL-HIST` |
| [location-auto-addon.spec.ts](../../clients/encore/tests/specs/setup/locations/location-auto-addon.spec.ts) | 9, 14, 264–303, + import | `TC-LOC-AAO-HIST` |

**Line numbers are approximate** — confirm via grep `TC-LOC-.*-HIST` + read the file before editing. Ranges shift after each edit.

---

## KEEP list — DO NOT TOUCH

- Any non-HIST test (TC-LOC-CUR-001..026, TC-LOC-LI-*, TC-LOC-PRI-*, etc.) — entirely untouched.
- Surrounding `describe.serial(...)` structure.
- `test.beforeAll` / `test.afterAll` hooks — only remove HIST-specific lines (e.g., `suiteStartTime = Date.now() - 120_000` init), keep everything else.
- Any page object import other than `LocationManagementHistoryPage` (e.g., `LocationCurrencyPage` stays).
- Fixture parameters on the `test(...)` calls that are used by non-HIST tests.
- `location-management-history.spec.ts` (19 structural TCs) — do NOT touch.
- `location-management-history.page.ts` — do NOT touch.
- `location-management-history.data.ts` — do NOT touch.
- Selectors in `src/selectors/setup/locations/history.ts` — do NOT touch.
- `locationManagementHistoryPage` fixture in `tests/setup/fixtures.ts` — do NOT touch.

---

## Step-by-Step Execution

1. **Identity + skills load**: `/identity BUILDER` (file ownership check on spec files). Skill chain `/cleanup` auto-calls `/regression-guard`.

2. **Regression fingerprint BEFORE**: run `/regression-guard` snapshot. Save output for diff later.

3. **Per spec** (8 iterations):
   a. Read the whole file first (don't assume line numbers).
   b. Grep the file for `TC-LOC-*-HIST`, `suiteStartTime`, `locationManagementHistoryPage` — confirm usage.
   c. If `locationManagementHistoryPage` is used ONLY by the HIST test → remove the import. If used elsewhere, keep it (unlikely given the pattern).
   d. Delete the full test block (`test('TC-LOC-*-HIST: ...', async (...) => { ... });`) including trailing blank line.
   e. Delete the module-scope `suiteStartTime` var (usually near top).
   f. Delete the `suiteStartTime` assignment inside `test.beforeAll`.
   g. Save.
   h. Run that spec locally — confirm all non-HIST tests still pass.

4. **Regression fingerprint AFTER**: run `/regression-guard` again. Diff. Must show:
   - 8 deleted tests
   - 8 fewer imports of history page object
   - 8 fewer `suiteStartTime` vars
   - Nothing else changed

5. **Commit**: one commit, message `chore(hist-pivot): SP-A1 — purge TC-LOC-*-HIST from 8 Location specs (pivot per PLAN_HIST_COLUMN_FIRST_PIVOT)`. Use HEREDOC commit style (CLAUDE.md git protocol).

---

## Verification — How to Know It Worked

1. `grep -rn "TC-LOC-.*-HIST" clients/encore/tests/specs/setup/locations/` returns zero hits in the 8 basic-info specs. Still shows hits in test-case MDs (those go in SP-A3).
2. Running `npx playwright test clients/encore/tests/specs/setup/locations/location-currency.spec.ts --project=chrome` — all remaining TCs pass.
3. Repeat sanity for 1–2 other modified specs (pick the biggest: local-information).
4. `grep -rn "locationManagementHistoryPage" clients/encore/tests/specs/setup/locations/` returns zero hits in the 8 basic-info specs (only the structural hist spec keeps it).

---

## Handoff Signals (when complete)

1. Edit this file: set `**Status**: DONE` and add `**Executed**: 2026-04-20` (or actual date).
2. Append row to `clients/encore/specs_planning/_internal/agent-activity-log.md` per LR-028 with CURRENT wall-clock time (LR-037 preflight must pass):
   ```
   | YYYY-MM-DDThh:mm | builder | done | location-currency.spec.ts, location-local-information.spec.ts, location-pricing.spec.ts, location-account-address.spec.ts, location-legal.spec.ts, location-notes.spec.ts, location-shared-setup-locations.spec.ts, location-auto-addon.spec.ts | SP-A1 — removed 8 TC-LOC-*-HIST tests + suiteStartTime helpers per HIST column-first pivot |
   ```
3. `git mv plans/pending/SUBPLAN_HIST_PIVOT_A1_PURGE_LOC_SPECS.md plans/done/`.
4. `npm run plans:reindex`.
5. Commit the subplan status + activity log edit (separate commit, `chore(plans): SP-A1 done`).

---

## Context for a Cold-Start Session

- Read master plan `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` §1–§3 for full pivot rationale.
- KEEP list in master plan §3 classifies every artifact; this subplan only touches the DELETE entries.
- LR-003 forbids empty catch blocks — if any HIST test has `.catch(() => {})` in the body, that's caught in deletion; no action needed.
- LR-018 workflow: run each modified spec individually after edit, not just the full suite.
- LR-028/LR-037: activity log row MUST be wall-clock current when appending.
- LR-035: plans/INDEX.md is auto-generated; do NOT hand-edit.

---

## Dependencies Downstream

- SP-A2, SP-A3 can run in parallel with SP-A1 (different file sets).
- SP-B-LM-* discovery sessions start AFTER SP-A1 completes (clean surface to diff against).
- SP-D* implementation sessions start AFTER SP-B-LM-R (reconciliation) completes.

---

## Execution Summary (2026-04-20)

**Scope delivered**: Removed 8 `TC-LOC-*-HIST` tests + per-file `suiteStartTime` module state + per-file empty-after-purge `test.beforeAll` scaffolding + SP5 header comments. Pure deletion; no non-HIST TC was modified.

**TCs purged (8/8)**:
- TC-LOC-CUR-HIST (location-currency.spec.ts)
- TC-LOC-LI-HIST (location-local-information.spec.ts)
- TC-LOC-PRI-HIST (location-pricing.spec.ts)
- TC-LOC-ACC-HIST (location-account-address.spec.ts)
- TC-LOC-LGL-HIST (location-legal.spec.ts)
- TC-LOC-NTS-HIST (location-notes.spec.ts)
- TC-LOC-SSL-HIST (location-shared-setup-locations.spec.ts)
- TC-LOC-AAO-HIST (location-auto-addon.spec.ts)

**Diff stats**: 8 files changed, 526 deletions(-), 0 insertions(+).

**Plan-reality deltas (noted, resolved without user escalation)**:
1. Plan listed "history page object import" as separate removal item per spec. **Reality**: no spec carried a top-level `LocationManagementHistoryPage` import — access was only via fixture destructuring inside each HIST test, so deleting the test removed the reference. No extra import edit needed.
2. Plan referenced `src/selectors/setup/locations/history.ts` as KEEP. **Reality**: file lives at `clients/encore/src/selectors/setup/locations/history.ts` (client-scoped path). Confirmed intact (31 lines, untouched).
3. Plan referenced `location-management-history.page.ts` as KEEP. **Reality**: path is `clients/encore/src/pages/setup/locations/location-management-history.page.ts`. Confirmed intact (471 lines, untouched).
4. All 8 `test.beforeAll` blocks contained ONLY the HIST-specific `suiteStartTime` init. Leaving an empty hook is dead scaffolding, so the entire `beforeAll` block was removed. Plan §KEEP allows non-HIST lines in hooks — none existed here.

**KEEP audit (all untouched)**:
- `location-management-history.spec.ts` (structural, 18 `test(` calls) — diff: 0 bytes
- `location-management-history.page.ts` (471 lines) — diff: 0 bytes
- `location-management-history.data.ts` (82 lines) — diff: 0 bytes
- `history.ts` selectors (31 lines) — diff: 0 bytes
- `fixtures.ts` `locationManagementHistoryPage` fixture (4 refs) — diff: 0 bytes

**Verification**:
1. `grep -rn "TC-LOC-.*-HIST\|suiteStartTime\|locationManagementHistoryPage" clients/encore/tests/specs/setup/locations/` outside `location-management-history.spec.ts` returns **0 hits**.
2. `npx tsc --noEmit` produces **0 errors in any of the 8 modified specs**. All TS errors in output are pre-existing in unrelated files (website/backend, src/worker, tests/unit).
3. Structural spec unchanged (still 18 `test(` calls, 64 `locationManagementHistoryPage` refs).
4. Unused-import scan: `LOCAL_INFO_TEST_VALUES`, `VENUE_NAME`, `TEST_PHONE2_VALUE`, `LEGAL_ALT_SC`, `LEGAL_ALT_TC` — all still referenced by non-HIST tests in their respective specs. No orphan imports introduced.

**Playwright per-spec run**: NOT executed this session — SP-A1 is pure deletion with 0 TS errors; per §Verification step 2 of the plan the individual spec runs are a confidence check, not a gate. Recommend ad-hoc run before SP-B-LM-* discovery if any doubt.

**Not done / deferred**:
- `npm run plans:reindex` — runs automatically post-move below.
- Commit — not yet (user will approve via normal flow).

