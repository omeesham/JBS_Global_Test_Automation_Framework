# SUBPLAN: Exit Audit — /audit Full-Chain + /final-q + Diff vs 8 Asks + LR-040 Closure Gate

**Status**: Pending
**Priority**: P0-CYCLE-1
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-34 (handoff package ready)
**Blocks**: HIST pivot resumption
**Model**: claude-opus-4-8
**Thinking**: max
**PermissionMode**: auto
**Justification**: Multi-chain audit + LR-040 closure gate (LR-041 Opus max criteria)

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_35_L2_EXIT_AUDIT.md`
**Identity**: WATCHDOG
**Skills auto-called**: /identity, /audit, /final-q, /reflect
**Model + thinking**: Opus + high (multi-chain audit, judgment-heavy)
**Dependency gate**: SP-DQU-34 `Status: DONE`; ALL Track A-L subplans closed or explicitly deferred.
**Context files**:
- `plans/pending/PLAN_DELIVERABLE_QUALITY_UPGRADE.md` (Success Criteria + 8 asks)
- All 34 prior subplans' Execution Summaries
- `clients/encore/specs_planning/_internal/agent-activity-log.md` (evidence trail)
- `plans/INDEX.md`
- LR-040 closure gate rules

## Purpose

Gate the mega plan to DONE. Verify each of the 8 user asks has evidence. Verify LR-040 closure gate on every subplan. Produce audit report + resume HIST pivot.

## Step-by-step

1. Run `/audit` full-chain on this mega plan:
   - Map 8 original asks to evidence (file paths, commits, subplan IDs).
   - Identify any unchecked gap.
2. Run `/final-q`:
   - Reconstruct todo list from user's 8 asks + core vision.
   - Tag each: done / partial / skipped / deferred / failed / ignored.
   - Context budget classification.
   - GREEN / YELLOW / RED verdict.
3. LR-040 closure gate: for EVERY subplan SP-DQU-01 through SP-DQU-34:
   - Verify every planned item is (a) MCP-proven with evidence, (b) grep-verifiable hand-off to another subplan, or (c) user-flagged discussion-item.
   - No phantom hand-offs permitted.
   - If any subplan fails gate → fix BEFORE flipping mega plan status to DONE.
4. Produce (the referenced audit report was never created) (date per completion):
   - 8-asks diff table.
   - Per-subplan closure-gate results.
   - LR-040 findings.
   - `/final-q` verdict.
   - Carryover items logged in activity log.
5. Move `PLAN_DELIVERABLE_QUALITY_UPGRADE.md` + all 34 subplans from `plans/pending/` to `plans/done/` with:
   - `**Status**: DONE`
   - `**Executed**: YYYY-MM-DD`
   - Execution Summary section per LR-027.
6. Remove `## P0-EMERGENCY — Deliverable Quality Upgrade` block from `plans/INDEX.md` (or let auto-regen remove it since the plan has moved to done/).
7. Run `npm run plans:reindex`. INDEX reflects DONE state.
8. Update `plans/INDEX.md` top-of-queue pointer to resume HIST pivot:
   - Ensure `PLAN_HIST_COLUMN_FIRST_PIVOT.md` + 31 subplans are next in queue.
9. Append final activity-log row (OWNER + WATCHDOG combined) describing completion + HIST resumption.
10. Invoke `/reflect` to capture session learnings + flag any `/compile-learnings` candidates (e.g., slate-clear pattern if it graduates to LR-041).

## Acceptance criteria

- [ ] Audit report exists in `plans/done/`.
- [ ] All 8 asks have evidence ✓ or logged carryover.
- [ ] LR-040 closure gate passes on every subplan.
- [ ] Mega plan + 34 subplans moved to `plans/done/` with DONE + Execution Summary.
- [ ] `plans/INDEX.md` regen clean; HIST pivot is next P0.
- [ ] `/reflect` invoked; learnings captured.
- [ ] Final activity-log row appended.

## Handoff

Mega plan closed. HIST pivot resumes. User notified in chat with final summary.
