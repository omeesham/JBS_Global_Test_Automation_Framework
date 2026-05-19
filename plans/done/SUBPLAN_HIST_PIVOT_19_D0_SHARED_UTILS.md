> **ARCHIVED — DO NOT EXECUTE.** Folded into: PLAN_LM_HISTORY_COVERAGE + PLAN_LO_HISTORY_COVERAGE Phase 5 (shared utility code)

---

# SUBPLAN SP-D0: Shared hist-test Utilities (hist-reader.ts + helpers)

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 3 (Implementation — prep)
**Status**: FOLDED
**Folded into**: PLAN_LM_HISTORY_COVERAGE + PLAN_LO_HISTORY_COVERAGE Phase 5 (shared utility code)
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: SP-B-LO-R + SP-B-LM-R complete (catalogs authoritative)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
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

---

## UPDATE (2026-04-22) — AUDIT RECOMMENDATION (append-only; original plan above is intact)

> **Execution-agent directive — read BEFORE Phase 0 runs.**
> This subplan now has TWO candidate paths:
> - **(a) Original plan** — everything above this section.
> - **(b) Audit recommendation** — this section.
> Do NOT default to either. Your first task in Phase 0 (bump thinking tier one notch):
> 1. Read both paths in full.
> 2. Verify the audit's claims yourself — open referenced files, grep referenced exports, spot-check 2-3 claims minimum.
> 3. If the audit's evidence holds → execute path (b).
> 4. If the audit is stale or wrong → execute path (a) and log the disposition in activity-log.
> 5. If both paths are partially right → synthesize a third path, document in Phase 1 kickoff, log the synthesis reason.
> Never pick the newer text just because it's newer. Evidence wins, not recency.

**Audited by**: /ultrathink + /audit + /planning (Opus, 2026-04-22)
**Audit plan**: `~/.claude/plans/3-shared-utils-temporal-kahan.md`

### Finding
Readers this subplan proposes to wrap ALREADY EXIST on existing page objects:
- [location-management-history.page.ts:181](../../clients/encore/src/pages/setup/locations/location-management-history.page.ts) — `parseModifiedOnMs()` static timestamp parser
- [location-management-history.page.ts:216](../../clients/encore/src/pages/setup/locations/location-management-history.page.ts) — `getRowsSinceTimestamp()` pagination-safe row reader (~45 LOC)
- [location-management-history.page.ts:323](../../clients/encore/src/pages/setup/locations/location-management-history.page.ts) — `waitForRecentTopRow()`
- [local-office-settings.page.ts:525](../../clients/encore/src/pages/setup/local-office/local-office-settings.page.ts) — `getHistoryColumnByHeader()` with LR-036 SVG/Unicode normalization already baked in

D0's `readHistoryRowSince` is a thin wrapper = duplicate. `assertBooleanCell` duplicates the LR-036 branch already in `getHistoryColumnByHeader`. `diffRowsByCol` and `assertRowCountUnchanged` are 1-line expressions. Unit tests on test helpers in a Playwright E2E framework = meta-testing; integration tests (SP-C1..D10) are the actual unit tests.

### Proposed alternative path — 15-LOC patch, zero new files
1. Do NOT create `clients/encore/src/utils/hist-reader.ts`. Do NOT create `hist-reader.test.ts`.
2. Add LR-036 boolean normalization to [location-management-history.page.ts](../../clients/encore/src/pages/setup/locations/location-management-history.page.ts) — mirror the SVG-vs-Unicode branch from `LocalOfficeSettingsPage.getHistoryColumnByHeader:525` onto this page object (currently only LO page has it; LM page is missing it). ~15 LOC addition.
3. Downstream specs (SP-C1..D10) call `page.getHistoryColumnByHeader(...)` directly → compare normalized string with plain `expect().toBe()`. No `assertBooleanCell` helper needed.
4. `assertNoTrackedFor` = 4-line inline loop in the 2-3 specs that actually use it. Not a shared helper.
5. No helper unit tests. Integration test failure in C1 or D1 is the feedback loop.

### Evidence the audit verified (2026-04-22)
- `grep "parseModifiedOnMs|getRowsSinceTimestamp|waitForRecentTopRow|getHistoryColumnByHeader" clients/encore/src/pages/` confirmed all 4 functions exist at the cited line numbers.
- CLAUDE.md: "Three similar lines is better than a premature abstraction" + "Don't design for hypothetical future requirements" directly apply.
- SP-D0's own Phase 0 says "design based on what downstream specs will ACTUALLY need" — that's the entry point for choosing path (b).

### Risk of blindly following path (a)
- New file adds ~300 LOC of wrapper + test maintenance surface.
- Creates two sources of truth for timestamp parsing, row reading, LR-036 encoding (page object + utils).
- Unit test DOM fixtures drift as app changes → false failures in D0 while C1/D1..D10 pass (or vice versa).
- Blocks 12 downstream subplans unnecessarily.

### What execution agent must check before picking
- `grep -n "parseModifiedOnMs\|getRowsSinceTimestamp\|getHistoryColumnByHeader" clients/encore/src/pages/setup/` — if all 4 still resolve, audit holds. If any renamed/removed since 2026-04-22, audit is stale → path (a).
- If path (b) chosen: in Phase 1, patch `location-management-history.page.ts` only; do NOT touch `local-office-settings.page.ts` (it already has the normalization).

---

## UPDATE #2 (2026-04-22) — USER APPROVED PATH (b)

**User pre-approval, 2026-04-22**: execute path (b) directly. Do NOT deliberate between path (a) and path (b). Do NOT write `clients/encore/src/utils/hist-reader.ts`. Do NOT write `hist-reader.test.ts`.

**Execution-agent directive (override):**
1. Skip the path-choice deliberation above — closed by user.
2. Still run the LR-020 verification grep (`grep -n "parseModifiedOnMs\|getRowsSinceTimestamp\|waitForRecentTopRow\|getHistoryColumnByHeader" clients/encore/src/pages/setup/`) at Phase 0 start to confirm the 4 function refs still exist at the cited line numbers.
   - If all 4 resolve → proceed with path (b).
   - If ANY have been renamed/removed/moved since 2026-04-22 → HALT and report to user; do NOT silently fall back to path (a). The plan must be revised first.
3. Phase 1 scope (path b ONLY):
   - Add ~15 LOC to [location-management-history.page.ts](../../clients/encore/src/pages/setup/locations/location-management-history.page.ts) — mirror the SVG/Unicode normalization branch from `LocalOfficeSettingsPage.getHistoryColumnByHeader:525` onto `LocationManagementHistoryPage.getColumnByHeader` (or add a new `getHistoryColumnByHeader` method on LM page if cleaner). Encoding branch: `unicode` for LM surface per LR-036.
   - NO new file creation. NO `src/utils/hist-reader.ts`. NO helper unit tests.
   - `assertNoTrackedFor` = 4-line inline loop in the 2-3 specs that use it (SP-C1 / SP-D1 may each inline their own; 4 lines of duplication is cheaper than shared abstraction per CLAUDE.md).
4. Dependency impact: downstream subplans (SP-C1, C2, D1..D10) import from the page object, not from `src/utils/`. Keep that import pattern when you reach those subplans.
5. Commit message: `refactor(hist-pivot): SP-D0 — mirror LR-036 normalization onto LocationManagementHistoryPage (path b per audit 2026-04-22)`.

**Rationale for forcing path (b)**: duplicating readers that already exist on page objects violates DRY + introduces two sources of truth for LR-036 encoding + bloats maintenance surface + blocks 12 downstream subplans for weeks of no-value wrapping. User explicitly closed this decision.
