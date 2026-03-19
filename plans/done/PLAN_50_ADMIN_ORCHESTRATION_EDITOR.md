# MASTER PLAN 50: Per-Client Visual Pipeline Orchestration

## Context

**Problem:** The pipeline is hardcoded as a global 5-agent chain (Requirements → Planner → Generator → Healer → Audit). Every client gets the same pipeline. The orchestrator reads from a static JSON file (`config/pipeline-definition.json`). The frontend `PipelineGraph.tsx` has hardcoded `STAGE_META`, `POSITIONS`, and `EDGE_DEFS`. `ActivePipelineContext.tsx` has hardcoded `INITIAL_STAGES`.

**Goal:** Super admins can visually design custom agent pipelines per client via an n8n-style drag-and-drop editor. Each client can have a different set of agents, different topology, different models/budgets. The orchestrator, worker, and frontend all dynamically adapt.

**This plan merges Plan 50 (Visual Editor) + Plan 51 (Per-Client Backend) into one cohesive E2E delivery.**

---

## Phase A: Backend Foundation

### A1. Database Schema

Add to `src/server/db/schema.sql` (and run on startup):

```sql
CREATE TABLE IF NOT EXISTS agent_types (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(100) DEFAULT 'Bot',
  category VARCHAR(50) DEFAULT 'core',
  default_model VARCHAR(50) DEFAULT 'sonnet',
  agent_file TEXT,
  capabilities TEXT[],
  enabled BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pipeline_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id VARCHAR(100) UNIQUE,
  definition JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pipeline_def_default
  ON pipeline_definitions ((client_id IS NULL)) WHERE client_id IS NULL;
```

**Key decisions:**
- `client_id VARCHAR(100)` matches existing `pipeline_runs.client_id` type
- `NULL client_id` = default template (one allowed via unique partial index)
- `version INTEGER` for optimistic concurrency control
- `definition JSONB` stores the full `PipelineDefinition` object

### A2. Agent Registry Seed

**Create: `src/server/models/agent-registry.ts`**

Static seed data defining 10 agent types:
- **5 core (enabled):** requirements, planning, generation, healing, audit
- **5 future (disabled):** api_testing, security_scan, performance, accessibility, etl_validation

Each entry: `{ id, name, description, icon, category, defaultModel, agentFile, capabilities }`

Seed function upserts into `agent_types` table on server startup.

### A3. DB Query Functions

**Modify: `src/server/db/queries.ts`**

Add functions:
```
listAgentTypes(pool) → AgentType[]
getClientPipelineDefinition(pool, clientId) → { definition, version, isDefault } | null
saveClientPipelineDefinition(pool, clientId, definition, expectedVersion, createdBy) → { version }
cloneDefaultToClient(pool, clientId, createdBy) → { version }
deleteClientPipelineDefinition(pool, clientId) → void
```

**Fallback logic:** Query for client_id first, then fall back to NULL (default), then return null.

### A4. Orchestrator Changes

**Modify: `src/orchestrator/orchestrator.ts`**

Change `loadPipelineDefinition()` signature:
```typescript
// FROM (sync, file-only):
export function loadPipelineDefinition(): PipelineDefinition

// TO (async, DB + file fallback):
export async function loadPipelineDefinition(
  pool?: Pool, clientId?: string | null
): Promise<PipelineDefinition>
```

Logic:
1. If `pool` + `clientId` provided → try DB (`getClientPipelineDefinition`)
2. If DB returns result → use it (cache 5s per client)
3. If DB returns null OR no pool → fall back to file read (existing behavior)

**All callers updated to `await`:**
- `processStageCompletion()` — looks up `run.client_id`, passes to `loadPipelineDefinition(pool, run.client_id)`
- `getNextStageId()` — receives definition as param (already loaded by caller)
- `getStageDefinition()` — same

**`savePipelineDefinition()` unchanged** — still writes to file (used as template/fallback).

### A5. Admin Route Updates

**Modify: `src/server/routes/admin.ts`**

Update existing + add new endpoints:

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/agent-types` | List all agent types |
| GET | `/api/admin/pipeline-definition?clientId=xxx` | Per-client def (falls back to default) |
| PUT | `/api/admin/pipeline-definition?clientId=xxx` | Save per-client (with version for concurrency) |
| POST | `/api/admin/pipeline-definition/validate` | Validate topology |
| POST | `/api/admin/pipeline-definition/clone-default?clientId=xxx` | Clone default to client |
| DELETE | `/api/admin/pipeline-definition?clientId=xxx` | Delete custom, revert to default |

**Existing GET/PUT `/api/admin/pipeline-definition`** (no clientId) continues working for backwards compat — operates on the default template.

**Validation logic:**
- Unique stage IDs
- All `next` targets point to valid stage IDs or terminal states
- All stages reachable from first stage (BFS)
- At least one path from every node reaches a terminal state
- All agent type IDs exist in registry

### A6. Worker Route Changes

**Modify: `src/server/routes/worker.ts`**

In task dispatch: load per-client definition instead of global.
```
const definition = await loadPipelineDefinition(app.db, task.client_id);
```

### A7. Pipeline Route Changes

**Modify: `src/server/routes/pipeline.ts`**

When creating a run, load per-client definition to determine first stage.

### A8. Migration Strategy

On server startup (`src/server/index.ts`):
1. Run schema migration (CREATE TABLE IF NOT EXISTS)
2. Seed agent_types from registry
3. If no default pipeline_definitions row exists → read `config/pipeline-definition.json`, insert as default

**The JSON file is NEVER deleted** — serves as fallback and version-controlled template.

---

## Phase B: Frontend Visual Editor

### B1. Type Updates

**Modify: `website/frontend/src/types/index.ts`**

```typescript
interface AgentType {
  id: string; name: string; description: string; icon: string;
  category: 'core' | 'testing' | 'security' | 'data' | 'custom';
  defaultModel: string; agentFile: string;
  capabilities: string[]; enabled: boolean; sortOrder: number;
}

interface PipelineDefinitionResponse {
  definition: PipelineDefinition; version: number;
  isDefault: boolean; clientId: string | null;
}

interface PipelineValidationResult {
  valid: boolean; errors: string[]; warnings: string[];
}
```

### B2. API Service Updates

**Modify: `website/frontend/src/services/encoreApi.ts`**

Add functions:
- `getAgentTypes()` → `GET /api/admin/agent-types`
- `getClientPipelineDefinition(clientId?)` → `GET /api/admin/pipeline-definition?clientId=xxx`
- `saveClientPipelineDefinition(def, version, clientId?)` → `PUT ...`
- `validatePipelineDefinition(def)` → `POST /api/admin/pipeline-definition/validate`
- `cloneDefaultToClient(clientId)` → `POST /api/admin/pipeline-definition/clone-default`
- `deleteClientPipelineDefinition(clientId)` → `DELETE ...`

### B3. PipelineGraph Enhancement (Dual-Mode)

**Modify: `website/frontend/src/components/pipeline/PipelineGraph.tsx`**

New props:
```typescript
interface PipelineGraphProps {
  // ... existing props ...
  definition?: PipelineDefinition;   // Dynamic stages (replaces hardcoded STAGE_META)
  editable?: boolean;                // Enable drag/connect/select
  onNodesChange?: (changes) => void; // Editor callbacks
  onEdgesChange?: (changes) => void;
  onConnect?: (connection) => void;
  onNodeSelect?: (stageId) => void;
  onNodeDelete?: (stageId) => void;
}
```

**Changes:**
- When `definition` prop provided → derive STAGE_META, POSITIONS, EDGE_DEFS dynamically
- Auto-layout via dagre (`@dagrejs/dagre`) for position calculation
- When `editable=true` → `nodesDraggable={true}`, `nodesConnectable={true}`, drop handler for new nodes
- When `editable=false` (default) → behavior unchanged

**Extracted to utility: `website/frontend/src/utils/pipeline-layout.ts`**
- `computeLayout(stages: StageDefinition[])` → `{ nodes, edges }` using dagre

### B4. EditableStageNode

**Create: `website/frontend/src/components/pipeline/EditableStageNode.tsx`**

Extends StageNode with:
- Blue selection border when selected
- Delete (X) button in corner
- Visible drag handle
- Dashed border for unconfigured nodes

### B5. AgentPalette

**Create: `website/frontend/src/components/settings/AgentPalette.tsx`**

Left sidebar (240px):
- Fetches agent types on mount
- Draggable cards grouped by category (Core, Testing, Security, Data, Custom)
- Search/filter input
- "In Pipeline" badge for already-used agents
- HTML5 drag → ReactFlow `onDrop` creates new node with defaults from AgentType

### B6. NodeConfigPanel

**Create: `website/frontend/src/components/settings/NodeConfigPanel.tsx`**

Right sidebar (320px), opens on node select:
- Agent name + icon (read-only from registry)
- Model dropdown (haiku/sonnet/opus)
- Budget Cap ($), Retries (0-10), Timeout (s), Max Turns (1-100)
- Approval Mode toggle (auto/manual)
- Enabled toggle
- Delete Node button (red, with confirm)
- Changes update in-memory state immediately

### B7. Editor State Hook

**Create: `website/frontend/src/hooks/usePipelineEditor.ts`**

```typescript
interface EditorState {
  definition: PipelineDefinition;
  version: number;
  clientId: string | null;
  isDefault: boolean;
  selectedNodeId: string | null;
  isDirty: boolean;
  validationErrors: string[];
  undoStack: PipelineDefinition[];  // last 20
  redoStack: PipelineDefinition[];
}
```

Exposes: `undo()`, `redo()`, `addNode()`, `removeNode()`, `updateNode()`, `addEdge()`, `removeEdge()`, `save()`, `validate()`, `loadClient()`, `resetToDefault()`.

### B8. PipelineBuilderTab

**Create: `website/frontend/src/components/settings/PipelineBuilderTab.tsx`**

Main editor layout:
```
┌──────────────┬──────────────────────────┬───────────────────┐
│ AgentPalette │   ReactFlow Canvas       │ NodeConfigPanel   │
│ (240px)      │   (flex-1)               │ (320px, if sel.)  │
│              │   + MiniMap + Controls    │                   │
└──────────────┴──────────────────────────┴───────────────────┘
│ Toolbar: [Client ▾] [Undo] [Redo] [Preview] [Reset] [Save] │
└─────────────────────────────────────────────────────────────┘
```

**Toolbar:**
- Client dropdown (from ClientContext — super_admin sees all)
- Undo/Redo (Ctrl+Z / Ctrl+Shift+Z)
- Preview toggle (switches to read-only mode)
- Reset to Default (DELETE endpoint, confirm first)
- Save (validates first → PUT with version → 409 if stale)

### B9. Settings Page Integration

**Modify: `website/frontend/src/pages/SettingsPage.tsx`**

Replace:
```
import PipelineDeepConfigTab ...
{ id: 'pipeline', label: 'Pipeline Deep Config', roles: ['super_admin'] }
{activeTab === 'pipeline' && <PipelineDeepConfigTab />}
```
With:
```
import PipelineBuilderTab ...
{ id: 'pipeline', label: 'Pipeline Builder', roles: ['super_admin'] }
{activeTab === 'pipeline' && <PipelineBuilderTab />}
```

`PipelineDeepConfigTab.tsx` kept as fallback but not rendered.

---

## Phase C: Integration

### C1. ActivePipelineContext

**Modify: `website/frontend/src/contexts/ActivePipelineContext.tsx`**

Remove hardcoded `INITIAL_STAGES`. In `startPipeline`:
1. Fetch pipeline definition for the run's client
2. Build initial stages dynamically from `definition.stages.filter(s => s.enabled)`
3. Pipeline stage list matches actual client topology

### C2. Dashboard Read-Only

Dashboard `PipelineGraph` usage unchanged — pass `definition` prop when available (from run detail), fall back to hardcoded when not.

### C3. SSE Events

No SSE changes needed — events already use dynamic `stage: task.stage_id`. The frontend maps them against the definition-derived stage list.

---

## New Dependency

**`@dagrejs/dagre`** — directed graph auto-layout (~20KB). Used in `pipeline-layout.ts` to position nodes when rendering dynamic pipelines.

---

## Files Summary

### Create (8 files)
| File | Purpose |
|------|---------|
| `src/server/models/agent-registry.ts` | Agent type seed data + registry |
| `src/server/db/migrations/002_pipeline_definitions.sql` | Schema migration |
| `website/frontend/src/components/settings/PipelineBuilderTab.tsx` | Main editor |
| `website/frontend/src/components/settings/AgentPalette.tsx` | Draggable agent sidebar |
| `website/frontend/src/components/settings/NodeConfigPanel.tsx` | Node config panel |
| `website/frontend/src/components/pipeline/EditableStageNode.tsx` | Editable node |
| `website/frontend/src/utils/pipeline-layout.ts` | Dagre layout utility |
| `website/frontend/src/hooks/usePipelineEditor.ts` | Editor state + undo/redo |

### Modify (11 files)
| File | Change |
|------|--------|
| `src/server/db/schema.sql` | Add agent_types + pipeline_definitions tables |
| `src/server/db/queries.ts` | Add pipeline def + agent type queries |
| `src/orchestrator/orchestrator.ts` | `loadPipelineDefinition()` → async, DB+file fallback, per-client |
| `src/server/routes/admin.ts` | Add agent-types, per-client CRUD, validate endpoints |
| `src/server/routes/worker.ts` | Load per-client definition for task dispatch |
| `src/server/routes/pipeline.ts` | Load per-client definition for run creation |
| `website/frontend/src/types/index.ts` | Add AgentType, PipelineDefinitionResponse types |
| `website/frontend/src/services/encoreApi.ts` | Add new API calls |
| `website/frontend/src/components/pipeline/PipelineGraph.tsx` | Dynamic stages, editable mode, definition prop |
| `website/frontend/src/pages/SettingsPage.tsx` | Replace PipelineDeepConfigTab → PipelineBuilderTab |
| `website/frontend/src/contexts/ActivePipelineContext.tsx` | Dynamic INITIAL_STAGES from definition |

**Total: 19 files (8 create + 11 modify)**

---

## Edge Cases Covered

| Case | Handling |
|------|----------|
| Client has no custom pipeline | Falls back to default. Editor shows "Using Default Template" + "Customize" button |
| Agent type disabled but in client's pipeline | Soft-delete only. Validation warns but doesn't block. Stage still executes if agentFile exists |
| Two admins edit same client concurrently | Optimistic concurrency via `version` column. Second save gets 409 Conflict |
| Pipeline definition schema changes | `version` field in definition. Migration function upgrades on load |
| Undo/redo | In-memory React state, last 20 snapshots, session-only |
| Cycles | Allowed: self-loops (healing→healing), upstream blame (gen→planning). Disallowed: cycles with no terminal path. Validation uses DFS |
| DB unavailable | File-based fallback preserved. `loadPipelineDefinition` catches DB errors |
| Historical runs | MVP: show current client definition. Future: snapshot in pipeline_runs |

---

## Implementation Order (3 Sessions)

### Session 1: Database + API Layer
_Files: 5 (2 create, 3 modify)_

1. Create `src/server/db/migrations/002_pipeline_definitions.sql` — schema
2. Create `src/server/models/agent-registry.ts` — seed data
3. Modify `src/server/db/schema.sql` — add tables (IF NOT EXISTS)
4. Modify `src/server/db/queries.ts` — add pipeline def + agent type queries
5. Modify `src/server/routes/admin.ts` — add agent-types, per-client CRUD, validate endpoints
6. Start Docker services, run server, verify all endpoints via curl/Postman

**Verification:** All 6 API endpoints return correct data. Default definition seeded from JSON file.

### Session 2: Orchestrator + Worker Integration
_Files: 3 modify_

1. Modify `src/orchestrator/orchestrator.ts` — `loadPipelineDefinition()` → async, DB+file fallback
2. Modify `src/server/routes/worker.ts` — per-client definition for task dispatch
3. Modify `src/server/routes/pipeline.ts` — per-client definition for run creation
4. Run server, create a pipeline run with clientId, verify correct per-client routing

**Verification:** Pipeline run with custom client definition routes through correct topology. File fallback works when DB row missing.

### Session 3: Full Frontend Editor
_Files: 11 (6 create, 5 modify)_

1. `npm install @dagrejs/dagre` — auto-layout dependency
2. Create `website/frontend/src/utils/pipeline-layout.ts` — dagre layout
3. Create `website/frontend/src/hooks/usePipelineEditor.ts` — editor state
4. Create `website/frontend/src/components/pipeline/EditableStageNode.tsx`
5. Create `website/frontend/src/components/settings/AgentPalette.tsx`
6. Create `website/frontend/src/components/settings/NodeConfigPanel.tsx`
7. Create `website/frontend/src/components/settings/PipelineBuilderTab.tsx`
8. Modify `website/frontend/src/types/index.ts` — add types
9. Modify `website/frontend/src/services/encoreApi.ts` — add API calls
10. Modify `website/frontend/src/components/pipeline/PipelineGraph.tsx` — dynamic + editable
11. Modify `website/frontend/src/pages/SettingsPage.tsx` — swap tab
12. Modify `website/frontend/src/contexts/ActivePipelineContext.tsx` — dynamic stages
13. Start frontend dev server + backend, verify full visual editor E2E

**Verification:** Full E2E flow — drag agents, configure, save, switch clients, undo/redo, preview mode.

---

## Verification Checklist

### Backend
- [ ] `GET /admin/agent-types` → 10 agent types (5 enabled, 5 disabled)
- [ ] `GET /admin/pipeline-definition` → default 5-stage from DB
- [ ] `GET /admin/pipeline-definition?clientId=X` → default (no custom yet)
- [ ] `PUT /admin/pipeline-definition?clientId=X` with 3 stages → saves
- [ ] `GET /admin/pipeline-definition?clientId=X` → returns 3-stage custom
- [ ] Concurrent PUT with wrong version → 409
- [ ] POST validate with invalid cycle → error
- [ ] Pipeline run with clientId=X routes through custom topology

### Frontend
- [ ] Super admin opens Pipeline Builder → sees editable graph
- [ ] Drag agent from palette → node appears on canvas
- [ ] Draw edge between nodes → validates
- [ ] Click node → config panel opens, edit model/budget
- [ ] Switch client dropdown → loads that client's pipeline
- [ ] Undo/redo works (Ctrl+Z / Ctrl+Shift+Z)
- [ ] Save with invalid topology → red errors shown
- [ ] Non-admin → tab not visible

### E2E
- [ ] Super admin creates 3-stage pipeline for client → triggers run → worker executes 3 stages → completes
- [ ] Dashboard shows correct 3-stage graph for that client's run
