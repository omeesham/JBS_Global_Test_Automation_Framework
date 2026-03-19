# PLAN 49B: Start Pipeline at Specific Stage

## Context
Demo needs to start pipeline at planner stage (skip requirements for existing modules that already have REQUIREMENTS.md). Currently pipeline always starts at requirements stage.

## What to Build
1. **Frontend**: Add "Start at stage" dropdown to RunPipelineModal (options: requirements, planning, generation)
2. **Backend**: Accept `startStage` parameter in POST `/api/pipeline/run`
3. **Orchestrator**: Honor startStage — create first worker task at specified stage instead of requirements

## Files to Modify
- `website/frontend/src/components/dashboard/RunPipelineModal.tsx` — add stage dropdown
- `src/server/routes/pipeline.ts` — accept startStage in run creation
- `src/orchestrator/orchestrator.ts` — honor startStage when creating first task

## Agent Research Directives
- Read RunPipelineModal.tsx to understand current form fields and submission
- Read orchestrator's run creation flow — where is the first stage determined?
- Read artifact-validator.ts — starting at later stages requires upstream artifacts to exist
- Determine valid start points: planning needs REQUIREMENTS.md, generation needs test cases + selectors
- Check how pipeline run is created in DB (what initial stage/status is set)

## Edge Cases to Audit
- Starting at generation without test cases → artifact validator blocks → need clear error message to user
- Starting at healing without specs → same issue
- Queue item state when skipping stages — does the queue need entries for skipped stages?
- UI validation: disable stages that have missing prerequisites (gray out with tooltip)

## Effort
~40 lines across 3 files
