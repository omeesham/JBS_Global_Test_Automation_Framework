> **ARCHIVED — DO NOT EXECUTE.** Superseded by: PLAN_LM_HISTORY_COVERAGE; creates forbidden location-hist-currency.spec.ts — NOT salvaged as file

---

# SUBPLAN SP-D1: Location Management HIST Per-Column Tests — Currency Root-Tab

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 3 (Implementation)
**Status**: SUPERSEDED
**Superseded by**: PLAN_LM_HISTORY_COVERAGE; creates forbidden location-hist-currency.spec.ts — NOT salvaged as file
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: SP-B-LM-R + SP-D0 complete
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**Identity**: BUILDER
**Skills**: `/execute` + `/regression-guard` + `/find-bugs` + `/identity`
**Estimated**: one session

---

## Cause

Per-column tests for every 87-col Location Management History column whose root lives on the Currency tab. This is the proof-of-pattern spec for Location Mgmt — establishes the template for SP-D2..D10.

---

## Scope

**File (NEW)**: `clients/encore/tests/specs/setup/locations/history/location-hist-currency.spec.ts`

**Source catalog**: `hist-root-map-location-management.md` (from SP-B-LM-R), filter: `Tab == Currency`.
**Expected columns (per SP-B-LM-1 findings)**: col 5 "Currency" (primary), col 63 "Currency" (cross-contamination guard). NOT-TRACKED: 6 Merchant + IsDefault phantom-row tests.

**TCs to add** (per master plan §5 SP-D1 + D2-from-superseded pattern):

1. **State-space (col 5)**: 7 TCs covering valid combos
   - TC-LOCH-CUR-ST-01..07: USD / CAD / MXN / USD+CAD / USD+MXN / CAD+MXN / USD+CAD+MXN
2. **Pseudo-radio (IsDefault)**: 3 TCs
   - TC-LOCH-CUR-DEF-01..03: default cycles with NOT-TRACKED phantom-row assertion
3. **Merchant NOT-TRACKED**: 3 TCs
   - TC-LOCH-CUR-MER-01..02: USD + CAD Merchant phantom-row tests
   - TC-LOCH-CUR-MER-03: SKIP with documented reason (no MXN options)
4. **Metadata**: 4 TCs
   - TC-LOCH-CUR-META-01: Modified By equals authenticated user
   - TC-LOCH-CUR-META-02: Modified On monotonic
   - TC-LOCH-CUR-META-03: Col 63 unchanged across all Currency saves (cross-contamination guard)
   - TC-LOCH-CUR-META-04: Unchanged-field fidelity (only col 5 + Modified On change)
5. **Negative**: 4 TCs
   - TC-LOCH-CUR-NEG-01: cancel → 0 rows
   - TC-LOCH-CUR-NEG-02: discard → 0 rows
   - TC-LOCH-CUR-NEG-03: validation-block (all unchecked) → 0 rows
   - TC-LOCH-CUR-NEG-04: no-op save → 0 rows

**Total**: ~22 TCs for Currency. All hard-assert, zero `expect.soft()`.

**Additional deliverable — reusable template file** (CRITICAL): After the Currency spec is complete and green, EXTRACT its reusable structure into `clients/encore/docs/hist-spec-template.md` with annotated sections. SP-D2..D10 copy from this template — they do NOT re-derive structure from D1's Currency-specific body. The template must cover: imports pattern, baseline TC-001, describe-block-per-column structure, state-space invocation pattern, metadata TCs, negative-case block, handoff pattern. This template is load-bearing for preventing D2..D10 drift.

---

## KEEP list — DO NOT TOUCH

- `location-management-history.spec.ts` (19 structural TCs) — untouched.
- `location-management-history.page.ts` — used, not modified.
- `location-management-history.data.ts` — used, not modified.
- Selectors — untouched.

---

## Step-by-Step Execution

> **[Phase 0] Old-site baseline check (LR-ENC-001 / ALL-078 — from SP-OSB-03, 2026-04-24)**: before authoring any TC, visit https://navigator2.training.psav.com/#/setup/locationdetail/1604 (old UI — tabs embedded in ONE URL, NOT a 1:1 path match with new site; observation-only, zero selector parity — old site uses `name=`/`id=`, not `data-testid`). Record baseline observations in `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md`. Reference the artifact path + date in the Execution Summary under "Old-site baseline: consulted Y/N + evidence". Merchant Currency column is **baseline-absent** (old-site LM History has no Merchant Currency column per `OSB-ACCESS-VERIFY-2026-04-24.md` §4 / §5) → record `baselineScope: baseline-absent` for Merchant Currency TCs specifically; Currency tab itself IS present on baseline, so the location-currency column (col 6) IS observable. For baseline-absent columns, flag for `/encore-questions` escalation — do NOT HALT.

1. `/identity BUILDER`.
2. `/regression-guard` BEFORE.
3. Read catalog file — confirm 9 Currency parents + expected col 5 / col 63 mapping.
4. Create directory if missing: `tests/specs/setup/locations/history/`.
5. Create file `location-hist-currency.spec.ts`. Import:
   - Playwright `test` from fixtures
   - `LocationCurrencyPage`, `LocationManagementHistoryPage`
   - Helpers from `hist-reader.ts`: `readHistoryRowSince`, `diffRowsByCol`, `assertNoTrackedFor`, `assertBooleanCell`, `assertRowCountUnchanged`
6. Write `test.describe('Location Mgmt History — Currency root-tab', () => {...})` and call `dependencyGate([...])` as the first line of every test. Do **NOT** restore `.serial` — post-2026-05-05 dependency-aware migration (parent: PLAN_DEPENDENCY_AWARE_FAILURE.md, BATCH closure) made `.serial` forbidden in `tests/specs/`. Use `dependencyGate(['TC-baseline'])` for state-dependent tests; `dependencyGate([])` for independents.
7. Add 22 TCs per scope.
8. Run spec: `npx playwright test clients/encore/tests/specs/setup/locations/history/location-hist-currency.spec.ts --project=chrome`.
9. Triage failures (APP BUG vs TEST BUG). Known: MER + DEF phantom-row TCs should PASS (the phantom-row assertion is the expected behavior of a NOT-TRACKED bug — test validates it).
10. `/regression-guard` AFTER.
11. **Template extraction**: create `clients/encore/docs/hist-spec-template.md` (SEE UPDATE BLOCK BELOW — actual path is `clients/encore/specs_planning/_internal/hist-spec-template.md`) with annotated sections from the Currency spec. Include: "Replace `<TAB>` with the root-tab name", "Replace `<COLUMN_N>` with column index + header", "state-space block = one test per equivalence class per D1.a taxonomy", etc. Don't paste Currency-specific values — paste the structure.
   - **TC-AUTHORING-RULES CARRY (MANDATORY)**: the extracted template MUST include a top-level section titled `## TC Authoring Rules` that references `clients/encore/specs_planning/_internal/tc-authoring-rules.md` verbatim as the single source of truth for all 4 authoring rules (symbols, bold-UI-labels, Expected-English, bug-descriptor language). Every SP-D2..D10 session that copies from this template inherits the rules reference. Do NOT paste the rules body into the template — reference the rules doc path so updates propagate automatically.
12. Commit: `feat(hist-pivot): SP-D1 — Location Mgmt HIST Currency per-column tests (22 TCs) + template`.

---

## Verification

1. All 22 TCs pass on baseline office 1604.
2. `grep -rn "expect.soft" location-hist-currency.spec.ts` → zero hits.
3. Structural hist spec untouched (19/19 pass).
4. Seeded corruption of col 5 (API write skipping save hook) causes specific state-space TC to fail + anomaly JSON emitted.
5. **`clients/encore/docs/hist-spec-template.md` EXISTS** and contains annotated reusable structure (not Currency-specific values).

---

## Handoff Signals

1. Status DONE + Executed.
2. Activity log:
   ```
   | YYYY-MM-DDThh:mm | builder | done | clients/encore/tests/specs/setup/locations/history/location-hist-currency.spec.ts, clients/encore/docs/hist-spec-template.md | SP-D1 — Location Mgmt HIST Currency tests (22 TCs) + reusable template doc. Phantom-row coverage for Merchant + IsDefault. Template drives SP-D2..D10. |
   ```
3. `git mv` to done/. Reindex.

---

## Context for Cold-Start Session

- Master plan §5 SP-D1 for detailed TC structure.
- Prior MCP 2026-04-17 proved Merchant + IsDefault NOT-TRACKED — these TCs encode that finding as hard assertions.
- Encoding: `unicode` for Location Mgmt booleans (LR-036).
- File size aim: <1500 LOC. Currency has 22 TCs which is fine.

---

## Dependencies

- SP-B-LM-R + SP-D0.
- Template for SP-D2..D10.
- Feeds SP-E-LM-CUR (bug filing for CUR-BUG-A/B/C).

---

## UPDATE (2026-04-22) — TEMPLATE LOCATION CORRECTION (user-approved)

**User pre-approval, 2026-04-22**: redirect the reusable spec template from `clients/encore/docs/hist-spec-template.md` to `clients/encore/specs_planning/_internal/hist-spec-template.md`.

### Why
The path `clients/encore/docs/` does NOT exist in this repo. Writing to it would create a new top-level directory with no convention anchor — other `clients/encore/` artifacts live under `src/`, `tests/`, `specs_planning/`, `config/`, `exports/`, `api-testing/`. Docs either live at repo root `docs/` (framework-wide) or inside `specs_planning/` (client-specific planning docs). The `_internal/` subdirectory already houses agent-facing internal artifacts (agent-activity-log, agent-mistakes). Reusable test-spec templates belong with other internal planning artifacts, not in a new orphan folder.

### Execution-agent directive (override)
1. In Step-by-Step item 11: create `clients/encore/specs_planning/_internal/hist-spec-template.md` — NOT `clients/encore/docs/hist-spec-template.md`.
2. In §Verification item 5: update the EXISTS check to the corrected path.
3. In Handoff Signals activity-log template: update the second file path to the corrected path.
4. Any downstream subplan referencing the template (SP-D2..D10, SP-J item #19) — resolve the template at the corrected path. If SP-J's original "item 19: Template exists at `clients/encore/docs/hist-spec-template.md`" is referenced during audit, use `clients/encore/specs_planning/_internal/hist-spec-template.md` instead. SP-J's own UPDATE block should note this redirect.
5. Do NOT create `clients/encore/docs/` directory at all.

### No content change
Template CONTENT is unchanged — still annotated structure from the Currency spec with `<TAB>` / `<COLUMN_N>` / state-space / metadata / fidelity / NOT-TRACKED phantom-row blocks. Only the filesystem location changes.
