# Plan 53G: Multi-Run Context Enhancement

**Priority**: 7
**Depends on**: 53D (needs run APIs)
**Parent**: PLAN_53_PIPELINE_UX_OVERHAUL.md

---

## Goal

ActivePipelineContext tracks multiple concurrent runs (different pages) while maintaining backwards-compatible API for existing consumers.

## Changes to `ActivePipelineContext.tsx`

**Keep existing API shape** — add multi-run tracking ON TOP of it, not replacing it:

```ts
interface ActivePipelineState {
  // === EXISTING (unchanged, backwards-compat) ===
  runId: string | null;           // = focusedRunId for backwards compat
  stages: PipelineStageState[];   // = focusedRun.stages
  activityMessages: ActivityMessage[];
  isActive: boolean;              // = any run active
  pipelineStatus: string | null;  // = focusedRun.status
  pendingAction: PendingAction;   // = focusedRun.pendingAction
  pipelineMode: 'auto' | 'manual'; // = focusedRun.mode
  pipelineDefinition: PipelineDefinition | null;

  // === NEW (multi-run) ===
  activeRuns: Map<string, ActiveRunState>;  // runId → full state
  focusedRunId: string | null;
  focusedRun: ActiveRunState | null;        // convenience getter
  pendingCount: number;                      // count of runs with pendingAction

  // === EXISTING METHODS (unchanged) ===
  startPipeline(runId: string, mode: 'auto' | 'manual'): void;
  clearPendingAction(): void;  // operates on focusedRun

  // === NEW METHODS ===
  focusRun(runId: string): void;
  startPipelineForPage(runId: string, mode: string, pageId: string, pageName: string): void;
}
```

**Key design**: The existing `runId`, `stages`, `pipelineStatus`, etc. are computed from `focusedRun`. Any code using the old API continues to work — it sees the focused run's data. Plans 53H and 53I use the SAME old API.

## Multiple SSE Subscriptions

- One EventSource per active runId, stored in `Map<string, EventSource>`
- Cap at 10 subscriptions max
- Events tagged with runId + pageName in `activityMessages`
- On focus change: update computed properties, DON'T close/reopen SSE

## Chat UI Additions (ChatPage.tsx)

- If `pendingCount > 1`: show badge "N stages awaiting approval" above chat
- Click badge → dropdown listing pending runs with page names → click one to `focusRun()`
- This is the ONLY ChatPage change in this plan — structure stays as defined by 53A

## Key Files
- Modify: `ActivePipelineContext.tsx`, `usePipelineSSE.ts`, `ChatPage.tsx` (badge only)

## Guidance
- The old single-run API is a VIEW into the multi-run map via focusedRun
- `startPipeline()` still works — creates a run in `activeRuns` and focuses it
- `clearPendingAction()` operates on focusedRun (backwards compat)
- Resume on mount: poll `listPipelineRuns('running')` → subscribe to all → focus most recent
