# Plan 53C: Dependency Engine + Auto-Cascade

**Priority**: 3
**Depends on**: 53B (needs pages + page_stage_status tables)
**Parent**: PLAN_53_PIPELINE_UX_OVERHAUL.md

---

## Goal

Enforce stage ordering per page. Auto mode cascades missing prerequisites; manual mode blocks. Reads from per-client pipeline definition (NOT hardcoded).

## New File: `src/orchestrator/dependency-engine.ts`

```ts
getStageOrder(definition: PipelineDefinition): string[]
  // Returns ordered ENABLED stage IDs from definition.stages array
  // Example: if client disabled 'healing', returns ['requirements','planning','generation','audit']

getPrerequisites(definition: PipelineDefinition, targetStage: string): string[]
  // All ENABLED stages BEFORE targetStage in the definition's stage order
  // Skips disabled stages — they're not prerequisites

checkPageReadiness(pool, pageId, targetStage, definition): {
  satisfied: boolean,
  missing: string[],      // status = 'not_started'
  failed: string[],       // status = 'failed' (can retry)
  inProgress: string[],   // status = 'in_progress' (active_run_id set)
  needsRequirements: boolean,  // first stage not done AND page has no target_url
  canAutoCascade: boolean,     // true if no inProgress locks
}

buildCascadePlan(pool, pageId, targetStage, definition): string[]
  // Ordered stages to run (missing + failed prereqs + target)
  // Example: target='generation', reqs=done, planning=not_started
  //   → returns ['planning', 'generation']
```

## Cascade Plan Consumption Algorithm

`cascade_plan` is stored as `string[]` on the `pipeline_runs` row. Example: `['planning', 'generation']`.

**On run creation:**
1. First stage from cascade_plan is used as `startStage`
2. Worker task created for that stage

**On stage completion (in `processStageCompletion`):**
1. Load run's `cascade_plan` from DB
2. Find index of completed stage in cascade_plan
3. If there's a next stage in cascade_plan → use it (override `getNextStageId()` routing)
4. If cascade_plan is exhausted → fall back to normal `getNextStageId()` routing rules
5. Update run's `cascade_plan` in DB: set completed stages to null (or track index)

**On stage failure:**
- If a cascaded stage fails → run fails. Don't skip to next in cascade.
- `page_stage_status` updated to `failed`. User can retry.
- Cascade does NOT auto-retry — retries are handled by existing `convergenceGuards.maxIterations` logic.

**Manual mode cascade:**
- Cascade plan is returned to frontend in the run creation response: `{ runId, cascade: true, cascadePlan: [...] }`
- Frontend shows message: "To run Generator, Planner needs to run first..."
- Each stage in cascade fires `approval_required` SSE event (existing manual mode behavior)
- User approves each stage before next one starts

## Integration — `src/server/routes/pipeline.ts`

Modify `POST /api/pipeline/run`:
1. Accept `pageId`, `pageSlug`, `pageName`
2. Resolve page record (create if `pageSlug` given but no `pageId`)
3. Concurrency check: if `page_stage_status.active_run_id` is set for target stage → return 409
4. Call `checkPageReadiness(pool, pageId, startStage, definition)`
5. **Auto mode**: `buildCascadePlan()` → store on run → start from first in plan
6. **Manual mode + missing deps**: return 400 `{ error, missing, failed }`
7. **Manual mode + all satisfied**: proceed normally (no cascade needed)

## Integration — `src/orchestrator/orchestrator.ts`

In `processStageCompletion()`:
- After success, if run has `page_id`:
  - `upsertPageStageStatus(pool, pageId, stageId, { status: 'completed', active_run_id: null, last_run_id: runId })`
  - Broadcast: `{ type: 'page_stage_updated', pageId, stageId, status: 'completed' }`
- After failure:
  - `upsertPageStageStatus(pool, pageId, stageId, { status: 'failed', active_run_id: null })`
- When starting a new stage:
  - `upsertPageStageStatus(pool, pageId, nextStageId, { status: 'in_progress', active_run_id: runId })`
- **Cascade routing**: check cascade_plan BEFORE `getNextStageId()`. Cascade overrides routing rules.
- **Stale lock recovery**: add to server startup — any `page_stage_status` with `active_run_id` pointing to a run that's been `running` for > 60 min → clear the lock.

## Key Files
- Create: `src/orchestrator/dependency-engine.ts`
- Modify: `src/server/routes/pipeline.ts`, `src/orchestrator/orchestrator.ts`, `src/orchestrator/types.ts`

## Guidance
- Replace `detectStartStage()` for page-scoped runs. Keep as fallback for legacy runs without `page_id`.
- Cascade_plan is consumed forward-only. No backtracking.
- Concurrency: `active_run_id` prevents double-runs per page+stage. Cleared on completion/failure/cancel.
- Test: page with only reqs done → request generation → verify cascade=['planning','generation'] → planning runs → completes → generation starts automatically
