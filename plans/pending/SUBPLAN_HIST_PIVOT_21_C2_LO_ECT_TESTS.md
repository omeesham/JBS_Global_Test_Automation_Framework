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

# SUBPLAN SP-C2: Local Office HIST Column Tests — ECT Columns

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 3 (Implementation)
**Status**: Pending
**Priority**: P0
**Created**: 2026-04-20
**Depends on**: SP-B-LO-R + SP-D0 complete
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
