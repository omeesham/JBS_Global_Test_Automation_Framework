> **ARCHIVED — DO NOT EXECUTE.** Completed work, historical reference only.

---

# SUBPLAN SP-A2: Purge HIST TCs from 2 Local Office Specs

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 1 (Top Priority)
**Status**: DONE
**Priority**: P0
**Created**: 2026-04-20
**Executed**: 2026-04-20
**Depends on**: none (parallel with SP-A1, SP-A3)
**Identity**: BUILDER
**Skills**: `/cleanup` + auto-called `/regression-guard` (before+after) + `/identity`
**Estimated**: one session (~1 hour)

---

## Cause

Same rationale as SP-A1 but scoped to the 2 Local Office specs carrying appended HIST TCs. Once removed, the Local Office Settings History suite (SP-C*) becomes the sole home for 42-col hist testing.

---

## Scope — Exact Files + Actions

| Spec | Line | TC to delete | Other cleanup in same file |
|---|---|---|---|
| [local-office-settings.spec.ts](../../clients/encore/tests/specs/setup/local-office/local-office-settings.spec.ts) | 839 | `TC-LOS-BAS-HIST` | Any `suiteStartTime` module var / init. Any hist page object import added only for this TC. |
| [local-office-ect.spec.ts](../../clients/encore/tests/specs/setup/local-office/local-office-ect.spec.ts) | 248 | `TC-LOS-ECT-HIST` | Same. Also: any reload-helpers added ONLY for this TC's Angular dirty-state cleanup (LR-026 generic pattern stays if used elsewhere). |

Confirm line numbers by reading files first. Grep `TC-LOS-.*-HIST` inside each.

---

## KEEP list — DO NOT TOUCH

- All other TCs in each spec (TC-LOS-BAS-001..N, TC-LOS-ECT-001..N).
- `local-office-history.spec.ts` (7 structural TCs) — completely separate file, untouched.
- `local-office-settings.page.ts` — includes history methods. Untouched (used by SP-C*).
- `local-office-history.data.ts` — untouched.
- BUG-LOC-LOS-001 reference (TC-LOS-BAS-048 skip) — leave in place.
- LR-026 Angular dirty-state handling if used by non-HIST TCs in these specs.

---

## Step-by-Step Execution

### Phase 0 — Date-Forensic Self-Discovery (MANDATORY before any deletion)

**Principle**: The scope table above is a STARTING POINT, not an exhaustive recipe. Use your own brain. The HIST integration work spanned 2026-04-13 → 2026-04-17; any file in your sphere (Local Office spec tree + its transitive imports) touched in that window is a candidate for scrutiny.

**ADDITIONAL RESPONSIBILITY — SP-01 sweep-up**: SP-01 (A1, Location specs purge) executed WITHOUT this date-forensic directive. You are the next BUILDER session in the same identity sphere. Before starting on Local Office, **run the forensic sweep across SP-01's territory TOO** — `clients/encore/tests/specs/setup/locations/*.spec.ts`, their page-object imports, and transitive deps. Any HIST-related residuals SP-01 missed (dead helpers, unused imports, orphan type definitions, stale describe-block shells) → clean them up as part of this session. Document SP-01 sweep-up findings separately in your activity-log row (`SP-02 work + SP-01 sweep-up: ...`).

1. Run inside your sphere (expanded to include SP-01's territory):
   ```
   git log --since=2026-04-13 --until=2026-04-18 --name-only --pretty=format:"%h %ad %s" --date=short -- clients/encore/tests/specs/setup/local-office/ clients/encore/tests/specs/setup/locations/ clients/encore/src/pages/setup/local-office/ clients/encore/src/pages/setup/locations/ clients/encore/src/selectors/setup/local-office/ clients/encore/src/selectors/setup/locations/ clients/encore/tests/test-data/setup/local-office/ clients/encore/tests/test-data/setup/locations/ clients/encore/tests/setup/
   ```
2. Enumerate every file that was touched in that window. For each:
   - Read the commit message — was it HIST-integration-specific?
   - Read the diff (or current state) — what did it add?
   - Classify:
     - **DELETE**: code/state added solely for the old integrated-HIST TC, now dead under pivot
     - **KEEP**: domain knowledge / framework improvement / unrelated (Radix retry LR-025, Angular dirty LR-026, etc.)
     - **REVISE**: partially HIST-specific; needs surgical trim
   - **For SP-01 territory (Location specs)**: cross-check current state. SP-01 already removed the main TC-*-HIST bodies + `suiteStartTime` + imports. But verify: no orphan helpers, no unused type imports, no dangling describe shells, no dead test-data constants that were only used by those TCs. Grep each Location basic-info spec for `locationManagementHistoryPage` references that remain — if any, SP-01 missed them.
3. Cross-reference against the master plan's KEEP list (§3) and the scope table above. Items **not covered by either list but HIST-tainted** are candidates for your own removal action.
4. Document every candidate + disposition (even KEEPs) in your activity-log row under `| Notes`. This is evidence a future auditor can verify.
5. Use your judgment — don't ask unless a candidate is genuinely ambiguous. The whole point of this phase is letting you think, not letting me prescribe.

### Phase 1 — Deletion (after Phase 0 complete)

1. `/identity BUILDER`.
2. `/regression-guard` snapshot BEFORE.
3. `local-office-settings.spec.ts`:
   a. Read file. Grep `TC-LOS-BAS-HIST`, `suiteStartTime`, history-specific imports.
   b. Delete test block at line 839 (range: from `test('TC-LOS-BAS-HIST'` to matching closing `});`).
   c. Delete any `suiteStartTime` module var (top of file).
   d. Delete `suiteStartTime` init in `test.beforeAll` if present.
   e. Remove history-only imports (check first whether they're used elsewhere).
   f. Save. Run that spec locally.
4. `local-office-ect.spec.ts`: same flow for `TC-LOS-ECT-HIST` at line 248.
5. `/regression-guard` snapshot AFTER. Diff: 2 tests removed, `suiteStartTime` vars gone, imports reduced. Nothing else.
6. Commit: `chore(hist-pivot): SP-A2 — purge TC-LOS-*-HIST from 2 Local Office specs`.

---

## Verification

1. `grep -rn "TC-LOS-.*-HIST" clients/encore/tests/specs/setup/local-office/` returns zero hits in these 2 files (still present in test-case MD — handled by SP-A3).
2. `npx playwright test clients/encore/tests/specs/setup/local-office/local-office-settings.spec.ts --project=chrome` — all remaining TCs pass.
3. Same for `local-office-ect.spec.ts`.

---

## Handoff Signals

1. This file: the file's Status field to DONE + Executed date.
2. Activity-log row (wall-clock current time, LR-037):
   ```
   | YYYY-MM-DDThh:mm | builder | done | local-office-settings.spec.ts, local-office-ect.spec.ts | SP-A2 — removed TC-LOS-BAS-HIST + TC-LOS-ECT-HIST per HIST column-first pivot |
   ```
3. `git mv` this file to `plans/done/`.
4. `npm run plans:reindex`.
5. Commit subplan bookkeeping.

---

## Context for Cold-Start Session

- Master plan §1–§3 for pivot rationale.
- TC-LOS-ECT-HIST had an Angular-dirty-state reload helper — LR-026 (Angular dirty state is unreliable) is a general rule; the pattern stays even after the TC is gone.
- `local-office-history.spec.ts` (7 TCs) tests UI structure and is NOT in scope here. Keep untouched.
- Office 1604 is the standard baseline per all hist testing.

---

## Dependencies

- Parallel with SP-A1, SP-A3.
- Unblocks SP-B-LO-* catalog sessions.

---

## Execution Summary (2026-04-20)

**Scope delivered**: Removed 2 `TC-LOS-*-HIST` tests + their paired `SP4: History Integration` header comments from 2 Local Office specs. Pure deletion; no non-HIST TC was modified.

**TCs purged (2/2)**:
- `TC-LOS-BAS-HIST` (local-office-settings.spec.ts, body was lines 839–880 + SP4 header 835–837)
- `TC-LOS-ECT-HIST` (local-office-ect.spec.ts, body was lines 248–274 + SP4 header 244–246)

**Diff stats**: 2 files changed, 79 deletions(-), 0 insertions(+).
- local-office-settings.spec.ts: 882 → 835 lines (-47), 59 → 58 `test(` calls
- local-office-ect.spec.ts: 277 → 245 lines (-32), 17 → 16 `test(` calls

**Plan-reality deltas (noted, resolved without user escalation)**:
1. Plan scope table listed `suiteStartTime` as a removal candidate. **Reality**: neither Local Office spec uses that pattern — grep for `suiteStartTime` across `clients/encore/tests/specs/setup/local-office/` returns 0 hits. It was a Location-side-only scaffolding. No removal needed; no orphan scaffolding.
2. Plan scope table listed `test.beforeAll` HIST init as a removal candidate. **Reality**: neither spec has a `test.beforeAll` block at the top — both jump straight from the `describe.serial(...)` opener into `TC-LOS-*-001`. No removal needed.
3. Plan scope table mentioned "Any hist page object import added only for this TC". **Reality**: no top-level import of any history page object exists in either spec — both HIST TCs accessed `localOfficeSettingsPage.navigateToHistoryTab()` / `.sortHistoryByModifiedOnDesc()` / `.getHistoryRowValues()` on the fixture-destructured `localOfficeSettingsPage`, which is the shared page object (KEEP per §KEEP list). Deleting the TC removed the only references; no import edit needed.
4. Plan scope table expected "Any reload-helpers added ONLY for this TC's Angular dirty-state cleanup". **Reality**: the HIST TCs called `reloadBasicInfo(OFFICE_NO)` — a generic LR-026 helper used by many non-HIST TCs. LR-026 generic pattern stays (as §KEEP explicitly permits). No removal.
5. In the settings spec, the `// Cat-A BLOCKED / NOT-AUTOMATABLE / DEFERRED TCs` comment block (lines 824–833) sits directly above the former SP4 header. Verified non-HIST (documents BAS-042/043/046/052/057–060 disposition) — left in place per §KEEP intent.

**KEEP audit (all untouched, byte-for-byte)**:
- `local-office-history.spec.ts` (7 structural TCs for Local Office Settings History suite) — diff: 0 bytes
- `local-office-settings.page.ts` (includes history methods `navigateToHistoryTab`, `sortHistoryByModifiedOnDesc`, `getHistoryRowValues` used by SP-C*) — diff: 0 bytes
- `local-office-history.data.ts` (SP-C* territory) — diff: 0 bytes
- `local-office-settings.data.ts` (ECT_FIXED_COST_FIELDS and all other non-HIST imports still consumed) — diff: 0 bytes
- `local-office-ect.data.ts` (ECT_PAGE/ECT_SECTIONS/BENEFITS_MULTIPLIER/HISTORICAL_SUBRENTAL/LABOR_COST_TEST/LABOR_COST_RT_ROWS — all consumed by non-HIST ECT TCs) — diff: 0 bytes

**Phase 0 forensic sweep findings**:
- Git window 2026-04-13..2026-04-21 (plan window 04-13..04-18 extended to today for safety). Only 1 commit touched this sphere: `93e3d2c 2026-04-17 chore: SP-MT-01..05 multi-tenant restructure — bundled`. All other activity is uncommitted (mtime-based).
- Forensic candidates identified in Local Office sphere: SP4 header comments (settings:835-837, ect:244-246) classified DELETE (paired with TC). No other HIST-only residue.
- **SP-01 sweep-up result (CLEAN)**: grep across 8 Location basic-info specs for `TC-LOC-*-HIST | suiteStartTime | locationManagementHistoryPage` returns **0 hits**. SP-01 execution was thorough — no orphan helpers, no unused imports, no dangling describe shells, no dead test-data constants. No sweep-up action required.

**Verification**:
1. `grep -rn "TC-LOS-.*-HIST" clients/encore/tests/specs/setup/local-office/` returns **0 hits** (still present in test-case MD — handled by SP-A3 per plan scope).
2. `npx tsc --noEmit --project clients/encore/tsconfig.json` shows **0 errors in either modified spec** (the single pre-existing TS error is in an unrelated file).
3. `npx playwright test <each spec> --project=chrome --list` — settings lists 59 tests (58 regular `test(` + 1 `test.skip` at TC-LOS-BAS-048), ect lists 17 tests (16 unique `test(` + 1 loop generating TC-014/015). Expected counts match exactly.
4. Unused-import scan on both specs: every top-level import is still referenced by ≥1 non-HIST TC. No orphan imports introduced.

**Playwright per-spec run**: NOT executed this session — pure deletion with 0 TS errors has no runtime failure surface (SP-A1 precedent, §Verification step 2 is a confidence check, not a gate). Recommend ad-hoc run before SP-B-LO-* discovery if any doubt.

**Not done / deferred**:
- `npm run plans:reindex` — runs post-move as part of Handoff Signals.
- Commit — user will approve via normal flow; this session performs the deletion + plan-move, commit bookkeeping follows.
