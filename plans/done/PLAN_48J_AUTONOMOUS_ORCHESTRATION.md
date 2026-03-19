# PLAN 48J: Autonomous Pipeline Orchestration

## Status: PENDING
## Priority: P1-HIGH
## Depends On: 48H (upstream quality fixes), existing pipeline infrastructure (Plans 43-47)

## Problem

User wants: click "generate specs for module X" on website → pipeline autonomously picks up from wherever the module is in the queue (could be `pending_planning`, `pending_generation`, etc.) and runs to completion. Currently:
- `autoInvoke.enabled: false` in pipeline-config.json (legacy config, not used)
- New PostgreSQL + worker model EXISTS (Plans 43-47 implemented) but stage routing is basic
- No "resume from any stage" capability — pipeline always starts from requirements
- Copilot (VS Code) runs are manual and don't update the pipeline DB

---

## Changes

### 1. Smart Stage Detection

**File**: `src/server/routes/pipeline.ts`

When `/api/pipeline/run` receives a request, check what artifacts already exist before creating a new run:

```typescript
const queueItem = findQueueItem(module, feature);
if (queueItem) {
  const startStage = detectStartStage(queueItem);
  createPipelineRun({ ...input, startStage, queueItemId: queueItem.id });
} else {
  createPipelineRun({ ...input, startStage: 'requirements' });
}
```

### 2. Stage Detection Logic

**File**: `src/server/services/pipeline.service.ts` (new function)

```typescript
function detectStartStage(queueItem: QueueItem): string {
  const hasTestCases = fs.existsSync(`specs_planning/test-cases/${queueItem.module}/${queueItem.id}_test_cases.md`);
  const hasTestPlan = fs.existsSync(`specs_planning/test-plans/${queueItem.module}/${queueItem.id}_test_plan.md`);
  const hasSelectors = selectorPartitionExists(queueItem.module, queueItem.id);
  const hasSpec = fs.existsSync(`tests/specs/${queueItem.module}/${queueItem.id}.spec.ts`);
  const hasFailures = fs.existsSync(`reports/failure-summary.json`);

  if (hasSpec && hasFailures) return 'healing';
  if (hasTestCases && hasTestPlan && hasSelectors) return 'generation';
  if (queueItem.stage === 'pending_planning') return 'planning';
  return 'requirements';
}
```

### 3. Copilot Session Sync

**File**: `scripts/sync-copilot-session.ts` (NEW ~40 lines)

After a manual Copilot session (Generator/Healer), user runs `npm run sync:copilot` to update the pipeline DB with what Copilot produced:

```typescript
// Scan for new/modified spec files not tracked in pipeline DB
// Update queue item stages based on file existence
// Create pipeline_run entry with stage='manual-copilot' for audit trail
// Broadcast SSE event so website reflects current state
```

Bridges the gap between manual Copilot runs and the autonomous pipeline.

### 4. Pipeline Config Update

**File**: `config/pipeline-config.json`

```json
{
  "autoInvoke": {
    "enabled": true,
    "startFrom": "auto-detect",
    "stages": ["requirements", "planning", "generation", "healing", "audit"],
    "routing": {
      "requirements-complete": "planning",
      "planning-complete": "generation",
      "generation-pass": "audit",
      "generation-fail": "healing",
      "healing-complete": "generation",
      "healing-max-retries": 2
    },
    "gating": {
      "planning-to-generation": "selectors-exist AND test-cases-exist AND mcp-log-complete",
      "generation-to-audit": "spec-passes AND typecheck-clean"
    }
  }
}
```

### 5. Website UI — Module Stage Indicator

**File**: `website/frontend/src/components/pipeline/` (existing components)

Show each module's current stage in the pipeline dashboard:
- Green dot: `completed` (spec exists and passes)
- Yellow dot: `in-progress` (worker currently executing)
- Blue dot: `ready` (artifacts exist, can resume from detected stage)
- Gray dot: `not-started`

"Run" button label changes based on stage: "Start from Scratch" / "Resume from Planning" / "Resume from Generation" / etc.

---

## Files

- `src/server/routes/pipeline.ts` — Smart stage detection before run creation
- `src/server/services/pipeline.service.ts` — `detectStartStage()` function
- `config/pipeline-config.json` — Enable autoInvoke with routing + gating
- `scripts/sync-copilot-session.ts` — NEW: bridge manual Copilot to pipeline DB
- `website/frontend/src/components/pipeline/` — Module stage indicators + contextual run button

## Verification

1. Manually run Planner on a module via Copilot → run `npm run sync:copilot` → verify pipeline DB updated
2. Click "Run" on website for that module → verify pipeline starts at generation (not requirements)
3. Generation fails → verify pipeline auto-routes to healing → healing fixes → re-runs generation
4. Full end-to-end: trigger new module from website → watch it go requirements → planning → generation → audit with zero manual intervention
