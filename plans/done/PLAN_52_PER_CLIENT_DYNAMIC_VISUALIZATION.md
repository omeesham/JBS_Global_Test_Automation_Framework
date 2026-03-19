# PLAN 52B: Post-Implementation Audit Fixes

## Context

Plan 52 was implemented (11 files created/modified). A thorough post-execution audit found **2 critical bugs** and **3 minor issues** that need fixing before the per-client pipeline system works E2E.

---

## Audit Findings

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | **CRITICAL** | `ChatPage.tsx:94` | `usePipelineSSE()` missing `initialStages` option — chat page always uses hardcoded 5-stage defaults |
| 2 | **CRITICAL** | `DashboardPage.tsx:112` | `handleRunStarted` only calls `pipeline.startWatch(runId)` (local hook) but NOT `activePipeline.startPipeline(runId, mode, clientDefinition)` — global context never learns about the run, so banner/chat page won't track it |
| 3 | **Medium** | `PipelineGraph.tsx:299` | Spacing calc uses `pipelineDefinition!.stages.length` (total) instead of `.filter(s => s.enabled).length` — wrong spacing when definition has disabled stages |
| 4 | **Low** | `pipeline-stages.ts:67` | Double spread of `update` in upsertStage append path — redundant, fields set explicitly then overridden by `...update` |
| 5 | **Low** | `ActivePipelineContext.tsx:178` | Silent error swallowing in catch block when fetching definition on resume — no logging |

---

## Fixes

### Fix 1 (CRITICAL): ChatPage.tsx — Pass `initialStages` to `usePipelineSSE`

**File:** `website/frontend/src/pages/ChatPage.tsx`

**Current (line 94):**
```tsx
const pipeline = usePipelineSSE({
  onComplete: (event) => { ... },
  onError: (message) => { ... },
});
```

**Fix:**
```tsx
import { buildInitialStages } from '@/utils/pipeline-stages';
// ...
const pipeline = usePipelineSSE({
  onComplete: (event) => { ... },
  onError: (message) => { ... },
  initialStages: pipelineDefinition ? buildInitialStages(pipelineDefinition) : undefined,
});
```

Without this, the chat page's local pipeline SSE hook always starts with 5 hardcoded stages regardless of client definition.

---

### Fix 2 (CRITICAL): DashboardPage.tsx — Sync global context on run start

**File:** `website/frontend/src/pages/DashboardPage.tsx`

**Current (line 110):**
```tsx
const handleRunStarted = async (runId: string) => {
  pipeline.startWatch(runId);  // only local hook
  // ...
};
```

**Fix:** Import `useActivePipeline` and call `startPipeline` with the definition:
```tsx
import { useActivePipeline } from '@/contexts/ActivePipelineContext';
// ...
const activePipeline = useActivePipeline();
// ...
const handleRunStarted = async (runId: string) => {
  pipeline.startWatch(runId);
  activePipeline.startPipeline(runId, 'auto', clientDefinition);
  // ...
};
```

Without this, the global `ActivePipelineContext` never knows about dashboard-launched runs. The banner won't appear on other pages, and `ChatPage`/`ActivePipelineBanner` won't track the run.

---

### Fix 3 (Medium): PipelineGraph.tsx — Use enabled count for spacing

**File:** `website/frontend/src/components/pipeline/PipelineGraph.tsx`

**Current (line 299):**
```tsx
const spacing = pipelineDefinition!.stages.length > 6
```

**Fix:**
```tsx
const enabledCount = pipelineDefinition!.stages.filter(s => s.enabled).length;
const spacing = enabledCount > 6
```

---

### Fix 4 (Low): pipeline-stages.ts — Clean up double spread

**File:** `website/frontend/src/utils/pipeline-stages.ts`

**Current (line 60-69):**
```tsx
return [
  ...stages,
  {
    key,
    name: update.name || humanize(key),
    status: update.status || 'pending',
    detail: update.detail || 'Pending',
    ...update,  // redundant spread
  },
];
```

**Fix:** Remove the `...update` spread since each field is already handled explicitly with fallbacks. Or invert: use `{ key, name: humanize(key), status: 'pending', detail: 'Pending', ...update }` to let update override defaults cleanly.

---

### Fix 5 (Low): ActivePipelineContext.tsx — Add error logging

**File:** `website/frontend/src/contexts/ActivePipelineContext.tsx`

**Current (line 180):**
```tsx
} catch { /* use default stages */ }
```

**Fix:**
```tsx
} catch (err) { console.warn('[ActivePipeline] Failed to fetch client definition, using defaults:', err); }
```

---

## Files to Modify

| File | Fixes |
|------|-------|
| `website/frontend/src/pages/ChatPage.tsx` | Fix 1 |
| `website/frontend/src/pages/DashboardPage.tsx` | Fix 2 |
| `website/frontend/src/components/pipeline/PipelineGraph.tsx` | Fix 3 |
| `website/frontend/src/utils/pipeline-stages.ts` | Fix 4 |
| `website/frontend/src/contexts/ActivePipelineContext.tsx` | Fix 5 |

---

## Verification

1. **Dashboard → run pipeline → navigate to chat:** Verify the hero graph shows dynamic stages (not hardcoded 5) and the banner appears
2. **Chat page local SSE:** Verify `pipeline.stages` uses client-specific stages after fix 1
3. **TypeScript:** `tsc --noEmit` still passes
4. **Build:** `npm run build` — no new errors introduced
