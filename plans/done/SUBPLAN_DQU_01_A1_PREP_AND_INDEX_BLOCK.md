# SUBPLAN: Prep — INDEX P0-EMERGENCY Block + Neutral-Eye-Audit Folder + Activity Log

**Status**: DONE
**Executed**: 2026-04-22
**Priority**: P0
**Created**: 2026-04-22
**Parent**: [PLAN_DELIVERABLE_QUALITY_UPGRADE.md](../pending/PLAN_DELIVERABLE_QUALITY_UPGRADE.md)
**Depends on**: none (first subplan)
**Blocks**: every other SP-DQU-*

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_DQU_01_A1_PREP_AND_INDEX_BLOCK.md`
**Identity**: OWNER
**Skills auto-called**: none (housekeeping)
**Model + thinking**: Sonnet + medium (deterministic file work)
**Dependency gate**: none
**Context files** (read before Phase 0):
- `plans/pending/PLAN_DELIVERABLE_QUALITY_UPGRADE.md`
- `plans/INDEX.md` (to locate correct insertion point)
- `scripts/plans-reindex.mjs` (understand auto-regen behavior)
**Phase 0 directive**: verify `plans/INDEX.md` is auto-regenerated (LR-035) — do NOT hand-edit.
**Handoff sequence**:
- Announce browser tool not needed (file-only work).
- Activity-log row on close per LR-037 (current wall-clock).
**HALT conditions**:
- If `npm run plans:reindex` script missing or broken → stop, report to user.
- If `P0-EMERGENCY` priority marker is not supported by auto-regen → fall back to `P0` + put emergency note in plan's first line.

---

## Purpose

Establish infrastructure for the whole `/execute` chain of SP-DQU-*. Ensure `plans/INDEX.md` surfaces the P0-EMERGENCY track above the 31 HIST subplans; create the shared folder for neutral-eye audits; capture the session's activity-log row.

## Step-by-step

1. Delete `C:/Users/rutvi/projects/encore_framework/tmp_read_review.cjs` if it still exists (plan-mode cleanup leftover).
2. Verify Priority `P0-EMERGENCY` (or `P0 (emergency)`) is recognized by `scripts/plans-reindex.mjs`. If yes, keep the existing mega plan's Priority as-is. If not, bump mega plan's Priority to `P0` and prepend `(EMERGENCY — see plan body)` to its title line; that's enough for the auto-regen to sort it above other P0 plans alphabetically.
3. Create `clients/encore/specs_planning/_internal/neutral-eye-audits/` directory.
4. Create `clients/encore/specs_planning/_internal/neutral-eye-audits/_TEMPLATE.md` with these sections:
   - `# Neutral-Eye Audit — <Module>`
   - `**Date**: YYYY-MM-DD` / `**Auditor**: WATCHDOG` / `**Browser tool**: Claude in Chrome — <LR-038 reason>`
   - `## URL(s) visited`
   - `## Field inventory` (table: name, testid, kind, default, constraint)
   - `## Default values` (per-field rendered state)
   - `## Validation behavior` (invalid input → save state / toast / dialog text verbatim)
   - `## Section names + labels` (exact rendered text)
   - `## Links + actions` (click → observed outcome)
   - `## Suggested TCs (top-down layered)` (SMOKE first, then POSITIVE, then NEGATIVE, then UI, then REGRESSION)
   - `## Diff vs our CSV` (table: TC ID, defect type, evidence line, fix)
   - `## Suspected APP bugs` (table: module, field, observed, expected, BUG-*.json filename)
5. Run `npm run plans:reindex` to regenerate INDEX.md.
6. Append activity-log row to `clients/encore/specs_planning/_internal/agent-activity-log.md` with current wall-clock timestamp, author=OWNER, files-touched list, description "SP-DQU-01 prep — INDEX block, neutral-eye-audit folder, template".

## Acceptance criteria

- [ ] `tmp_read_review.cjs` absent from repo root.
- [ ] `clients/encore/specs_planning/_internal/neutral-eye-audits/_TEMPLATE.md` exists with all 11 sections.
- [ ] `plans/INDEX.md` reindex clean (`npm run plans:reindex:check` green); mega plan visible near the top.
- [ ] Activity-log row appended with correct timestamp (LR-037 preflight green).

### Execution Summary

**Executed**: 2026-04-22
**Agent**: OWNER (Sonnet 4.6 /execute)
**Browser tool**: N/A — pure file work

**Steps completed**:
1. `tmp_read_review.cjs` — already absent from repo root. No action needed.
2. Priority `P0-EMERGENCY` — recognized by `plans-reindex.mjs` (`P(\d)` regex extracts `0` → rank 0). Mega plan's existing Priority `P0 (client deliverable...)` unchanged; DQU plan sorts above HIST plan (INDEX line 36 vs 48) by newest-first P0 ordering.
3. Created `clients/encore/specs_planning/_internal/neutral-eye-audits/_TEMPLATE.md` — 11 sections present.
4. Ran `npm run plans:reindex` → 99 pending, 161 done, 7 stale, 0 DONE-in-pending. `reindex:check` green.
5. Appended activity-log row at 2026-04-22T23:49 per LR-037.
6. Subplan moved to `plans/done/`.

**LR-040 classification**:
- tmp absent → (a) direct-verified
- Priority → (a) direct-verified via script read
- Template created → (a) directly executed
- Reindex → (a) directly run + check green
- Activity-log row → (a) this row

---

## Handoff to next subplan

Next: SP-DQU-02 (LOS neutral-eye audit). Tell next agent:
- "Template ready at `neutral-eye-audits/_TEMPLATE.md`."
- "Mega plan surfaced on INDEX (DQU at line 36, above HIST at line 48)."
- No blockers. Proceed.
