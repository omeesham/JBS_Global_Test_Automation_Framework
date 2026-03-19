# PLAN 49J: Per-Stage Auto/Manual Toggle

## Context
Super admin can toggle each pipeline stage between "auto" (proceed without asking) and "manual" (pause for approval) from the dashboard. This controls the `approvalMode` field added in PLAN_49I.

## What to Build
1. **Toggle UI**: Row of stage toggles in SuperAdminPanel or RunPipelineModal
   - 5 stages listed: Requirements, Planning, Generation, Healing, Audit
   - Each has auto/manual toggle switch
   - Visual indicator of current setting
   - "Reset to Defaults" button (all auto)
2. **Save**: Updates pipeline-definition.json via existing `updatePipelineDefinition` API

## Files to Modify
- `website/frontend/src/components/dashboard/SuperAdminPanel.tsx` — add stage toggle section
- `config/pipeline-definition.json` — default approvalMode values per stage

## Agent Research Directives
- Read SuperAdminPanel.tsx to understand existing admin controls layout and patterns
- Read encoreApi.ts `getPipelineDefinition()` and `updatePipelineDefinition()` — these already exist
- Check if pipeline definition hot-reloads (orchestrator.ts `loadPipelineDefinition()` uses 5s cache in prod)
- Verify changes only affect NEW runs (not running pipelines)
- Check Tailwind toggle switch component patterns used elsewhere in codebase

## Edge Cases to Audit
- Changing toggle while pipeline is running → should only affect new runs, not in-progress
- Non-super-admin attempting toggle → permission check (frontend + backend)
- All stages set to manual → pipeline pauses at every step (valid but slow)
- Reset to defaults → confirm dialog before resetting
- Pipeline definition validation → approvalMode must be 'auto' or 'manual', reject invalid values

## Dependencies
- Requires PLAN_49I (ArtifactApprovalPanel) to be implemented first for the approval UX

## Effort
~60 lines across 2 files
