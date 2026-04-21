> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute <this-filename>`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: load `/identity` per the `**Identity**` field below.
> 2. **Skills**: load every skill in `**Skills**` field below (the leading skill auto-calls its chain — e.g. `/cleanup` → `/regression-guard`).
> 3. **Model + thinking tier**: look up this subplan's SP number in `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` → Execution Order table. Use the specified Opus/Sonnet + think / think hard / think harder / ultrathink. If Phase 0 is present in Step-by-Step, bump thinking tier one notch higher than the table (forensic analysis needs judgment).
> 4. **Dependency gate**: verify every item in `**Depends on**` field is marked DONE in `plans/done/` or not-applicable. If any blocker → HALT + report to user. Do not proceed.
> 5. **Context load**: read `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` §1–§3 (pivot rationale + scope + per-identity KEEP/DELETE inventory) + this subplan in full.
> 6. **Phase 0 FIRST (if present in Step-by-Step)**: execute the "Phase 0 — Date-Forensic Self-Discovery" step before any code or doc edits. Document findings (with dispositions) in your activity-log row.
> 7. **Execute Phases 1+** per Step-by-Step in order.
> 8. **Handoff**: on success, apply the Handoff Signals block — set the file's Status field to DONE + Executed date in this file, append activity-log row (LR-028 + LR-037 wall-clock time ≥ mtime of every touched file), `git mv` this file to `plans/done/`, run `npm run plans:reindex`, commit (one commit per LR-027 boundary).
>
> **HALT + ASK USER** (do NOT silently proceed) if:
> - Any `**Depends on**` item is not DONE.
> - Phase 0 uncovers scope extension >30% beyond the listed starting point (user confirms before acting on unscoped items).
> - Genuine ambiguity in scope beyond the master plan §3 KEEP list.
> - `/regression-guard` diff shows changes unrelated to this subplan's stated scope.
> - Activity-log preflight (`npm run validate:activity-log:preflight`) would fail for your row.

---

# SUBPLAN SP-D1: Location Management HIST Per-Column Tests — Currency Root-Tab

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 3 (Implementation)
**Status**: Pending
**Priority**: P0
**Created**: 2026-04-20
**Depends on**: SP-B-LM-R + SP-D0 complete
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

1. `/identity BUILDER`.
2. `/regression-guard` BEFORE.
3. Read catalog file — confirm 9 Currency parents + expected col 5 / col 63 mapping.
4. Create directory if missing: `tests/specs/setup/locations/history/`.
5. Create file `location-hist-currency.spec.ts`. Import:
   - Playwright `test` from fixtures
   - `LocationCurrencyPage`, `LocationManagementHistoryPage`
   - Helpers from `hist-reader.ts`: `readHistoryRowSince`, `diffRowsByCol`, `assertNoTrackedFor`, `assertBooleanCell`, `assertRowCountUnchanged`
6. Write `describe.serial('Location Mgmt History — Currency root-tab', () => {...})`.
7. Add 22 TCs per scope.
8. Run spec: `npx playwright test clients/encore/tests/specs/setup/locations/history/location-hist-currency.spec.ts --project=chrome`.
9. Triage failures (APP BUG vs TEST BUG). Known: MER + DEF phantom-row TCs should PASS (the phantom-row assertion is the expected behavior of a NOT-TRACKED bug — test validates it).
10. `/regression-guard` AFTER.
11. **Template extraction**: create `clients/encore/docs/hist-spec-template.md` with annotated sections from the Currency spec. Include: "Replace `<TAB>` with the root-tab name", "Replace `<COLUMN_N>` with column index + header", "state-space block = one test per equivalence class per D1.a taxonomy", etc. Don't paste Currency-specific values — paste the structure.
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
