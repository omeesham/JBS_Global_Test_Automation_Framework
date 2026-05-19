> **ARCHIVED — DO NOT EXECUTE.** Folded into: PLAN_LO_HISTORY_COVERAGE (ECT column tests)

---

# SUBPLAN SP-C2: Local Office HIST Column Tests — ECT Columns

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 3 (Implementation)
**Status**: FOLDED
**Folded into**: PLAN_LO_HISTORY_COVERAGE (ECT column tests)
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: SP-B-LO-R + SP-D0 complete
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**Identity**: BUILDER
**Skills**: `/execute` + `/regression-guard` + `/find-bugs` + `/identity`
**Estimated**: one session

---

## Cause

Write per-column tests for ECT-rooted columns in the 42-col Local Office Settings History. ECT may produce zero hist rows at save-level (per SP-B-LO-2 finding) — this spec formalizes the observed behavior.

---

## Scope

**File**: grow `local-office-history.spec.ts` (same file as SP-C1).
**Source catalog**: `hist-root-map-local-office.md`, filter: `Tab == ECT Settings`.
**Save-level tracking is BOOL**: if catalog says ECT saves produce zero rows, then TCs are `TC-LOSH-ECT-*-SAVE-NOROW` asserting save does NOT produce a row. If catalog says rows are produced, revert to standard per-column template.

---

## KEEP list

- SP-C1's Basic Info TCs — untouched.
- Structural 7 TCs — untouched.
- Page objects — used, not modified.

---

## Step-by-Step Execution

> **[Phase 0] Old-site baseline check (LR-ENC-001 / ALL-078 — from SP-OSB-03, 2026-04-24)**: this module is **baseline-ABSENT** — ECT Settings is a new-site-only feature (old site has no ECT tab and no `/settings/local-office` page per `OSB-ACCESS-VERIFY-2026-04-24.md` §3). Record `baselineScope: baseline-absent` on the queue entry, cite OSB §3 as evidence in the Execution Summary under "Old-site baseline: consulted N — feature absent, see OSB-ACCESS-VERIFY-2026-04-24 §3", and flag for `/encore-questions` escalation if any behavior uncertainty remains. Do NOT HALT — baseline-absent is a valid closure path (ALL-078).

1. `/identity BUILDER`.
2. `/regression-guard` BEFORE.
3. Read catalog. Filter ECT rows.
4. Based on save-level tracking result:
   a. If ECT saves produce NO rows: write `TC-LOSH-ECT-{PARENT}-SAVE-NOROW` assertions — row count stays fixed after save.
   b. If rows produced: standard per-column template from SP-C1.
5. Run spec individually.
6. Triage failures (APP BUG vs TEST BUG).
7. `/regression-guard` AFTER.
8. Commit: `feat(hist-pivot): SP-C2 — Local Office HIST per-column tests for ECT columns`.

---

## Verification

1. Every ECT parent in catalog has at least one TC.
2. Save-level NOT-TRACKED cases (if any) have hard-asserted row count unchanged.
3. No `expect.soft()`.
4. Structural + Basic Info TCs still pass.

---

## Handoff Signals

1. Status DONE + Executed.
2. Activity log:
   ```
   | YYYY-MM-DDThh:mm | builder | done | clients/encore/tests/specs/setup/local-office/local-office-history.spec.ts | SP-C2 — added ECT per-column TCs (save-level tracking enforced). |
   ```
3. `git mv` to done/. Reindex.

---

## Context for Cold-Start Session

- Candidate bug LOS-ECT-BUG-A (all ECT editable rows NOT-TRACKED at save level) may be confirmed here, feeds SP-E-LO.
- Encoding: SVG lucide-check for all Local Office booleans (LR-036).

---

## Dependencies

- SP-B-LO-R + SP-D0.
- Can run parallel to SP-C1 with care (same file, manage merge conflicts).
- Unblocks SP-E-LO.
