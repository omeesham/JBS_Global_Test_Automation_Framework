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

# SUBPLAN SP-D0: Shared hist-test Utilities (hist-reader.ts + helpers)

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 3 (Implementation — prep)
**Status**: Pending
**Priority**: P0 (blocks all SP-C*/SP-D* implementation)
**Created**: 2026-04-20
**Depends on**: SP-B-LO-R + SP-B-LM-R complete (catalogs authoritative)
**Identity**: BUILDER
**Skills**: `/execute` + auto-called `/regression-guard` + `/identity`
**Estimated**: one session (2–3 hours)

---

## Cause

Before writing 12+ spec files that each read hist rows, diff them, and assert column values, we need one shared utility file. Implementing helpers inline per spec multiplies bugs and maintenance overhead. SP-D0 creates the utility set once so SP-C1/C2 + SP-D1..D10 import it.

---

## Scope

**Principle**: DESIGN helpers based on what SP-C1/C2 + SP-D1..D10 will ACTUALLY need. The list below is a starting minimum — extend if your own analysis of downstream subplans and the catalogs reveals more reusable logic. Don't ship speculative utilities (YAGNI). Don't write helpers only one spec uses (inline those).

**Create**: `clients/encore/src/utils/hist-reader.ts` (NEW file)

**Minimum required exports** (start here, extend as needed):
- `readHistoryRowSince(page, sinceMs, headerList): Promise<Record<string, string>>` — thin wrapper over page-object's `getRowsSinceTimestamp`.
- `diffRowsByCol(row, priorRow): Array<{col, header, prev, now}>` — pure function.
- `assertNoTrackedFor(row, substrings: string[]): void` — phantom-row pattern.
- `assertBooleanCell(cellHtml, expected, encoding: 'unicode' | 'svg' | 'text'): void` — LR-036 aware.
- `assertRowCountUnchanged(before, after): void` — negative-case helper.

**Likely additions (evaluate during Phase 0 below — add only if ≥2 downstream specs will use)**:
- `enumerateStateSpace(controlType, fieldConfig): TestCase[]` — per-control-type equivalence class generator. Control types: multi-checkbox (combos), pseudo-radio, combobox (one per option + empty), text (empty/valid/long/special-chars/at-max/over-max/whitespace), date (empty/past/future/boundary/invalid), radio (one per option).
- `histSaveActions: { save, cancel, discardDialog, validationBlock, attemptNoOp }` — reusable save flow helpers for negative cases across all hist specs.
- `enforceBaseline(page, baselineConfig): Promise<void>` — LR-019 first-TC baseline enforcement, shared across hist specs.

**Plus**: `clients/encore/src/utils/hist-reader.test.ts` (unit tests against synthetic DOM fixtures).

---

## KEEP list

- Existing page objects (`location-management-history.page.ts`, `local-office-settings.page.ts`) — UNTOUCHED. `hist-reader.ts` CALLS them, does not duplicate.
- Existing selectors — untouched.
- Existing test data files — untouched.

---

## Step-by-Step Execution

### Phase 0 — Downstream-Needs Analysis (MANDATORY)

**Principle**: Don't blindly implement the exports listed in Scope. First, READ the downstream subplan descriptions (SP-20..SP-32) + the catalogs (SP-B-LO-R + SP-B-LM-R output) + a representative section of the superseded PLAN_HIST_INTEGRITY_HARDENING D1.a taxonomy. THEN design helpers that match actual need.

1. Read these files to understand what downstream specs will ask hist-reader to do:
   - `plans/pending/SUBPLAN_HIST_PIVOT_20_C1_LO_BASIC_INFO_TESTS.md`
   - `plans/pending/SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md` (template driver)
   - `clients/encore/specs_planning/catalogs/hist-root-map-local-office.md` (if exists)
   - `clients/encore/specs_planning/catalogs/hist-root-map-location-management.md` (if exists)
   - The "D1.a control-type taxonomy" from `plans/done/PLAN_HIST_INTEGRITY_HARDENING.md` (superseded but D1.a table is still authoritative input)
2. For each control type (multi-checkbox, pseudo-radio, combobox, text, date, radio): enumerate what the downstream spec needs to DO (drive state changes, assert expected values, handle negative cases).
3. Decide: which logic is reusable across ≥2 downstream specs? → put in hist-reader.ts. Which is spec-specific? → leave inline in SP-D*.
4. Document your design decisions in the file's doc-comment + in your activity-log row.

### Phase 1 — Implementation

1. `/identity BUILDER`.
2. Read `location-management-history.page.ts` to understand `getRowsSinceTimestamp`, `parseModifiedOnMs`, `waitForRecentTopRow`, `getRowValues`.
3. Design function signatures — make them framework-agnostic except for Playwright `Page` and `ElementHandle`.
4. Write `hist-reader.ts` with all 5 exports.
5. Write unit tests:
   - `diffRowsByCol` on synthetic two-row objects.
   - `assertNoTrackedFor` positive (no match → pass) + negative (match → throw).
   - `assertBooleanCell` for each encoding × each expected value (6 cases).
   - `assertRowCountUnchanged` positive + negative.
   - `readHistoryRowSince` with a Playwright page fixture (mocked if needed).
6. Run unit tests until green.
7. Add LR-036 references + LR-003 (no empty catch) discipline in file doc-comment.
8. Commit: `feat(hist-pivot): SP-D0 — add hist-reader.ts shared utilities + unit tests`.

---

## Verification

1. File exists at `clients/encore/src/utils/hist-reader.ts`.
2. Unit tests in `hist-reader.test.ts` all pass (`npx playwright test` or relevant Jest/Vitest config).
3. No TypeScript errors (`npx tsc --noEmit`).
4. Function signatures are documented (JSDoc).
5. No silent error handling (LR-003) — every catch re-throws or emits anomaly JSON.

---

## Handoff Signals

1. Status DONE + Executed.
2. Activity log:
   ```
   | YYYY-MM-DDThh:mm | builder | done | clients/encore/src/utils/hist-reader.ts, clients/encore/src/utils/hist-reader.test.ts | SP-D0 — shared hist-test utilities + unit tests. Consumed by SP-C1..C2 + SP-D1..D10. |
   ```
3. `git mv` to done/. Reindex.

---

## Context for Cold-Start Session

- Do NOT duplicate logic that exists in page objects. This file is a thin façade over them.
- All Location Mgmt hist specs need `encoding: 'unicode'`; all Local Office specs need `encoding: 'svg'` (LR-036).
- Unit tests can use synthetic DOM strings — no real browser required. Use Playwright's own test runner if Jest isn't configured.

---

## Dependencies

- Requires catalogs (SP-B-LO-R + SP-B-LM-R) finished so interface design reflects actual column/encoding reality.
- Unblocks every implementation subplan (SP-C1, C2, D1..D10).
