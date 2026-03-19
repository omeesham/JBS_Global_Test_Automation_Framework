# PLAN 28: Encore API Integration (Core) — POST-AUDIT REVISION

**Status**: Pending
**Depends on**: Plans 25, 26, 27
**Goal**: Wire `handleScriptGeneration()` to real Encore pipeline with SSE + graceful fallback.

**Audit cycle**: 3 rounds, 9 real bugs found and fixed, 0 remaining.

---

## Step 1: Create `website/frontend/src/services/encoreApi.ts`

New file — Axios client for Encore endpoints:
- `createPipelineRun(data)` → POST /api/pipeline/run → returns **`{ runId: string }`**
- `subscribeToPipelineEvents(runId, onEvent)` → EventSource on /api/events/:runId
- `listPipelineRuns(status?)` → GET /api/pipeline/list
- `getPipelineRunDetail(id)` → GET /api/pipeline/:id
- `cancelPipelineRun(id)` → POST /api/pipeline/:id/cancel
- `getAdminUsage()` → GET /api/admin/usage
- `getWorkerStatus()` → GET /api/admin/worker-status
- `getPipelineDefinition()` → GET /api/admin/pipeline-definition
- `updatePipelineDefinition(config)` → PUT /api/admin/pipeline-definition
- `encoreHealthCheck()` → GET /health

---

## Step 2: Append Encore types to `website/frontend/src/types/index.ts`

**SSEEvent interface** (includes all event fields):
```typescript
export interface SSEEvent {
  type: string;
  stage?: string;
  data?: unknown;
  error?: string;
  message?: string;         // error events
  runId?: string;
  name?: string;            // artifact name (artifact_ready)
  artifactType?: string;    // artifact type (artifact_ready)
  artifactId?: string;      // artifact ID (artifact_ready)
  status?: string;          // pipeline status (pipeline_complete)
  totalCost?: number;       // total cost (pipeline_complete)
  result?: string;          // 'success' | 'fail' (stage_complete)
  cost?: number;            // stage cost (stage_complete)
  duration?: number;        // stage duration ms (stage_complete)
  agent?: string;           // agent name (stage_start)
  model?: string;           // model used (stage_start)
  attempt?: number;         // attempt number (stage_start)
  timestamp?: string;       // all events
}
```

Plus: PipelineRun, StageResult, Artifact, CreatePipelineRequest, AdminUsage, WorkerStatus, HealthResponse, PipelineDefinition, PipelineStage

---

## Step 3: Wire `handleScriptGeneration()` in ChatPage.tsx

### Verified Codebase Facts
- **Import convention**: `@/` alias (`tsconfig.app.json: "@/*": ["./src/*"]`)
- **Message function**: `push('tessa', text)` (line 251)
- **updatePipeline**: `(key: string, status: string, detail: string)` — 3 args
- **handleScriptGeneration**: Already `async` (line 539). Only call site: `onClick=` (line 1304)
- **SCRIPT_AGENTS**: `['Script Writer', 'Execution Engine', 'Self-Healing Agent']`
- **tsconfig**: `noUnusedLocals: true` — no dead state allowed

### Complete SSE Stage Mapping (all 5 Encore stages → 6 UI stages)

| Encore SSE stage | ChatPage UI key | UI status | detail string |
|---|---|---|---|
| `requirements` (stage_start) | `script-gen` | `running` | `'Producing automation scripts...'` |
| `planning` (stage_start) | `script-gen` | `running` | `'Producing automation scripts...'` |
| `generation` (stage_start) | `execution` | `running` | `'Running tests...'` |
| `generation` (stage_complete) | `script-gen` | `completed` | `` `${tcCount} scripts created` `` |
| `generation` (stage_complete) | `execution` | `completed` | `'Tests validated'` |
| `healing` (stage_start) | `auto-healing` | `running` | `'Checking for flaky tests...'` |
| `healing` (stage_complete) | `auto-healing` | `completed` | `'Auto-healed'` |
| `audit` (stage_complete) | `report-gen` | `completed` | `'Report ready'` |
| `pipeline_complete` | — | — | Close SSE, set step='saved' |
| `artifact_ready` | — | — | Push artifact name to chat |
| `connected` | — | — | No-op (handshake) |
| `error` | — | — | Close SSE, show error |

### Changes to ChatPage.tsx

**1. Add import** (line ~3, uses @/ alias):
```typescript
import { createPipelineRun } from '@/services/encoreApi';
```

**2. Add ref** (near other useRef):
```typescript
const eventSourceRef = useRef<EventSource | null>(null);
```

**3. Add useEffect cleanup** (with other effects):
```typescript
useEffect(() => { return () => { eventSourceRef.current?.close(); }; }, []);
```

**4. DO NOT add pipelineRunId state** — noUnusedLocals would cause compile error.

**5. Replace body of handleScriptGeneration** (lines 540-571 only):
- Try real Encore pipeline via createPipelineRun + EventSource SSE
- Map SSE events to UI stages per mapping table above
- On artifact_ready: `push('tessa', \`Script ready: ${event.name} (${event.artifactType})\`)`
- On error/onerror: close SSE, show message, set step='saved'
- Catch block: verbatim original setTimeout simulation from lines 546-571 + warning message

Full implementation code is in the master plan file at `.claude/plans/stateless-discovering-stonebraker.md`.

---

## Files Touched
1. **NEW**: `website/frontend/src/services/encoreApi.ts`
2. **APPEND**: `website/frontend/src/types/index.ts`
3. **MODIFY**: `website/frontend/src/pages/ChatPage.tsx` (lines 539-572 only)

Zero changes to any other ChatPage function. Zero changes to JBS backend.

---

## Verification
- With Encore running → SSE events drive animation through all 5 stages
- With Encore stopped → fetch fails, fallback setTimeout runs with warning
- Navigate away during pipeline → useEffect closes EventSource, no memory leak
- TypeScript compiles with `noUnusedLocals: true`
