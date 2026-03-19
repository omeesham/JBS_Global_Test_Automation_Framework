# PLAN 49F: Pipeline Pause for Triage

## Context
When generation/healing produces test failures, pipeline should route to Audit (always, not just on pass), and after Audit produces a triage report, pipeline should PAUSE with `awaiting_triage` status until user makes decisions on the dashboard.

## What to Build
1. **Routing change**: Generation ALWAYS routes to audit (not just on pass)
2. **New status**: `awaiting_triage` — pipeline pauses, SSE fires `triage_required` event
3. **Resume flow**: After user submits triage decisions, pipeline resumes
   - `report_bug` items → create BUG-*.json + annotate tests with `test.skip('bug-blocked')`
   - `heal_feature_change` items → route to Healer with feature-change context
   - `needs_investigation` items → keep paused until user re-decides
4. **Resume endpoint**: `POST /api/pipeline/:id/resume-triage`

## Files to Modify
- `config/pipeline-definition.json` — change generation routing: always → audit
- `src/orchestrator/orchestrator.ts` — add awaiting_triage handling after audit completion
- `src/orchestrator/types.ts` — add `awaiting_triage` to PipelineRunStatus, `triage_required` to SSEEvent types
- `src/server/routes/pipeline.ts` — add resume-triage endpoint

## Agent Research Directives
- Read orchestrator.ts `processStageCompletion()` (lines 232-377) — understand full routing flow
- Read pipeline-definition.json routing rules for generation stage (lines 86-105)
- Understand how convergence guards interact with paused state — pausing should NOT count as an iteration
- Read how worker tasks are created (`createWorkerTask` call at line 370)
- Check if `resumeFromTriage` needs to create a new worker task or replay the completion
- Study the existing `fixme` terminal state pattern — `awaiting_triage` is similar but resumable

## Edge Cases to Audit
- User never makes triage decisions — pipeline stuck forever. Need configurable timeout? Or just SSE reminder?
- User changes decisions after submitting — allow re-decide before pipeline fully resumes?
- Multiple pipeline runs waiting for triage simultaneously — each must be independent
- Budget tracking during pause — time waiting shouldn't count as cost
- SSE connection drops during triage wait — on reconnect, must re-send `triage_required` event
- All tests pass but audit finds code quality issues — should NOT trigger triage, just standard audit

## Effort
~100 lines across 4 files
