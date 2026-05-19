> **ARCHIVED — DO NOT EXECUTE.** Folded into: PLAN_LO_HISTORY_COVERAGE (Basic Info column tests)

---

# SUBPLAN SP-C1: Local Office HIST Column Tests — Basic Info Columns

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 3 (Implementation)
**Status**: FOLDED
**Folded into**: PLAN_LO_HISTORY_COVERAGE (Basic Info column tests)
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: SP-B-LO-R complete (authoritative Local Office catalog) + SP-D0 complete (hist-reader.ts)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**Identity**: BUILDER
**Skills**: `/execute` + auto-called `/regression-guard` + `/find-bugs` + `/identity`
**Estimated**: one session (if Basic Info catalog has ≤15 cols; else split C1a/C1b)

---

## Cause

Write per-column tests for every Basic-Info-rooted column in the 42-col Local Office Settings History. This grows the existing `local-office-history.spec.ts` (currently 7 structural TCs) with column-level verification TCs.

---

## Scope

**File to grow**: [local-office-history.spec.ts](../../clients/encore/tests/specs/setup/local-office/local-office-history.spec.ts) (currently ~52 lines, 7 structural TCs — ALL UNTOUCHED).

**Source catalog**: `clients/encore/specs_planning/catalogs/hist-root-map-local-office.md` (authoritative, from SP-B-LO-R). Filter: rows where `Tab == Basic Information`.

**Tests to add per column** (from master plan §5 SP-C1 template):
```ts
describe('Col N — <HeaderName> [root: <RootField>]', () => {
  describe('State-space coverage', () => {
    test('TC-LOSH-COL{N}-ST-01 — <state 1> persists', async (...) => { ... });
    test('TC-LOSH-COL{N}-ST-02 — <state 2> persists', async (...) => { ... });
    // One per equivalence class of the root's control type
  });
  describe('Metadata', () => {
    test('TC-LOSH-COL{N}-MOD-01 — Modified By equals test user', async (...) => { ... });
    test('TC-LOSH-COL{N}-MOD-02 — Modified On is monotonic vs prior row', async (...) => { ... });
  });
  describe('Unchanged-field fidelity', () => {
    test('TC-LOSH-COL{N}-FID — saves on unrelated roots leave col {N} unchanged', async (...) => { ... });
  });
  // For NOT-TRACKED columns:
  describe('Phantom-row guard', () => {
    test('TC-LOSH-COL{N}-ORPH — root change produces no visible value in col {N}', async (...) => { ... });
  });
});
```

**Negative cases (once per spec, not per column)**:
- TC-LOSH-NEG-01: cancel save → row count unchanged
- TC-LOSH-NEG-02: discard dialog → row count unchanged
- TC-LOSH-NEG-03: validation-block → row count unchanged
- TC-LOSH-NEG-04: no-op save → row count unchanged

---

## KEEP list — DO NOT TOUCH

- 7 existing structural TCs (TC-LOS-HIS-001..007) — untouched.
- `local-office-settings.page.ts` history methods — used, not modified.
- `local-office-history.data.ts` — used, not modified.
- SP-B-LO-R catalog — read, not modified.

---

## Step-by-Step Execution

> **[Phase 0] Old-site baseline check (LR-ENC-001 / ALL-078 — from SP-OSB-03, 2026-04-24)**: before authoring any TC, visit https://navigator2.training.psav.com/#/setup/locationdetail/1604 (old UI — tabs embedded in ONE URL, NOT a 1:1 path match with new site; observation-only, zero selector parity — old site uses `name=`/`id=`, not `data-testid`). Record baseline observations in `clients/encore/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md`. Reference the artifact path + date in the Execution Summary under "Old-site baseline: consulted Y/N + evidence". Baseline-absent feature (ECT Settings, EnableMultidayPricing, Merchant Currency column per `OSB-ACCESS-VERIFY-2026-04-24.md`) → record `baselineScope: baseline-absent`, flag for `/encore-questions` escalation — do NOT HALT.

1. `/identity BUILDER`.
2. `/regression-guard` snapshot BEFORE.
3. Read SP-B-LO-R catalog. Filter Basic Info rows.
4. Import `hist-reader.ts` helpers + `local-office-settings.page.ts` page object + `assertBooleanCell`.
5. For each Basic-Info column:
   a. Add describe block per template.
   b. Write state-space TCs (one per equivalence class).
   c. Write metadata TCs (2 per column).
   d. Write fidelity TC (1 per column).
   e. Write phantom-row TC if NOT-TRACKED per catalog (1 per).
6. Add 4 file-level negative TCs.
7. Run spec: `npx playwright test clients/encore/tests/specs/setup/local-office/local-office-history.spec.ts --project=chrome`.
8. Fix any failures: classify as APP BUG (LR-034 protocol, feeds SP-E-LO) or TEST BUG (fix).
9. Seed one known corruption (e.g., alter a tracked field via API without save hook) → confirm failure + anomaly JSON emitted (SP-F1 must be available or mocked).
10. `/regression-guard` AFTER.
11. Commit: `feat(hist-pivot): SP-C1 — Local Office HIST per-column tests for Basic Info columns`.

---

## Verification

1. Every Basic-Info column in the catalog has at least: one state-space TC, one metadata TC, one fidelity TC, one phantom-row TC if NOT-TRACKED.
2. 4 file-level negative TCs present.
3. All new TCs pass on baseline office 1604.
4. Structural 7 TCs still pass.
5. Seeded corruption test fails + anomaly JSON emitted.
6. No `expect.soft()` anywhere in the new tests.

---

## Handoff Signals

1. Status DONE + Executed.
2. Activity log:
   ```
   | YYYY-MM-DDThh:mm | builder | done | clients/encore/tests/specs/setup/local-office/local-office-history.spec.ts | SP-C1 — added N per-column TCs for Basic Info columns. Seeded corruption validated anomaly pipeline. |
   ```
3. `git mv` to done/. Reindex.

---

## Context for Cold-Start Session

- Master plan §5 SP-C template is the ground truth for test structure.
- Encoding: all Local Office hist cols use SVG lucide-check for booleans (`encoding: 'svg'`).
- LR-003 no empty catch.
- LR-018 run individually before running full suite.
- LR-024 clean artifacts before RCA on any failure.
- LR-025 Radix retry on sort if needed.
- LR-026 Angular dirty state handling after saves.

---

## Dependencies

- SP-B-LO-R + SP-D0.
- Unblocks SP-C2 (can run in parallel actually, if wanted) + SP-E-LO (bug filings from this session's phantom-row findings).
