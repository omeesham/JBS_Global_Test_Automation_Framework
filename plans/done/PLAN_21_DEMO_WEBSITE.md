# PLAN_21: API Contract + Frontend Integration Spec

**Created**: 2026-03-06
**Revised**: 2026-03-10 (v2 — transformed from static mock to live integration spec)
**Priority**: P1
**Status**: SKIPPED — colleague-owned, not executed by repo agents
**Prerequisites**: PLAN_20 Phase 0 (backend must be deployed first)
**Executor**: Colleague's AI agent (using prompt from `plans/COLLEAGUE_AGENT_PROMPT.md`)
**Note**: Colleague has already built the frontend. `COLLEAGUE_AGENT_PROMPT.md` covers 100% of this spec. This plan serves as reference only — not in our execution queue.

---

## Purpose

This plan defines the **exact contract** between our backend (Render) and the frontend (Vercel). The colleague's agent reads the companion prompt file and builds the entire frontend to connect to our API.

**This is NOT a static mock website anymore.** The UI connects to a live backend with real SSE updates and real pipeline execution.

---

## Architecture

```
[Vercel — Frontend]                    [Render — Backend]                [Local Worker]
React + Vite + Tailwind    ←─ SSE ──   Fastify + Neon DB    ← poll ──  Claude CLI + Max sub
POST /api/pipeline/run     ──────────→  Creates run + task
GET /api/events/:runId     ←─ stream─   Pushes stage events             Executes agents
GET /api/pipeline/list     ──────────→  Queries Neon DB
GET /api/admin/pipeline-def ─────────→  Returns config JSON
PUT /api/admin/pipeline-def ─────────→  Saves config changes
```

---

## API Contract

### Base URL
Environment variable: `VITE_API_URL` (e.g., `https://encore-api.onrender.com`)

### Endpoints

#### Pipeline Operations

**POST `/api/pipeline/run`** — Create new pipeline run
```typescript
// Request
{ feature: string, module: string, intent: string, priority?: "high" | "medium" | "low", targetUrl?: string }
// Response 201
{ runId: string }
```

**GET `/api/pipeline/list`** — List all pipeline runs
```typescript
// Query params: ?status=running&limit=50&offset=0
// Response 200
PipelineRun[]
```

**GET `/api/pipeline/:id`** — Get pipeline detail
```typescript
// Response 200
PipelineRun  // includes stages[] and artifacts[]
```

**POST `/api/pipeline/:id/cancel`** — Cancel running pipeline
```typescript
// Response 200
{ cancelled: true }
```

#### Live Updates (SSE)

**GET `/api/events/:runId`** — Server-Sent Events stream
```typescript
// Connect with EventSource or @microsoft/fetch-event-source
// Events:
{ type: "stage_start", runId, stage, agent, model, attempt, timestamp }
{ type: "stage_complete", runId, stage, result: "success"|"fail", cost, duration, timestamp }
{ type: "pipeline_complete", runId, status: "completed"|"fixme"|"cancelled", totalCost, timestamp }
{ type: "artifact_ready", runId, artifactId, name, type, timestamp }
{ type: "retry", runId, stage, attempt, maxAttempts, reason, timestamp }
{ type: "error", runId, message, timestamp }
{ type: "worker_status", connected: boolean, timestamp }
```

#### Admin

**GET `/api/admin/pipeline-definition`** — Get pipeline config
```typescript
// Response 200
PipelineDefinition  // full schema from pipeline-definition.json
```

**PUT `/api/admin/pipeline-definition`** — Update pipeline config
```typescript
// Request body: PipelineDefinition
// Response 200
{ saved: true }
```

**GET `/api/admin/usage`** — Usage metrics
```typescript
// Response 200
{ totalRuns: number, completedRuns: number, totalCost: number, avgCostPerRun: number }
```

**GET `/api/admin/worker-status`** — Worker health
```typescript
// Response 200
{ connected: boolean, lastHeartbeat: string | null, currentTask: string | null }
```

#### Health

**GET `/health`** — Backend health
```typescript
// Response 200
{ status: "ok", db: "connected" | "disconnected", worker: "connected" | "disconnected" }
```

### Authentication (MVP)
- No JWT for MVP. All endpoints are open.
- Design components to accept an optional auth header prop for production upgrade.
- Worker endpoints use `x-worker-secret` header (not relevant to frontend).

### CORS
- Backend sets `Access-Control-Allow-Origin` to the Vercel frontend URL.
- Frontend just uses standard `fetch()` — no special headers needed.

---

## Shared TypeScript Types

These types are the contract. Frontend must use these exact shapes.

```typescript
interface PipelineRun {
  id: string;
  feature: string;
  module: string;
  intent: string;
  targetUrl?: string;
  stage: string;
  status: "queued" | "running" | "completed" | "fixme" | "cancelled";
  priority: "high" | "medium" | "low";
  cost: number;
  createdAt: string;
  updatedAt: string;
  stages: StageResult[];
  artifacts: Artifact[];
}

interface StageResult {
  id: string;
  stageId: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  attempt: number;
  maxAttempts: number;
  agentModel: string;
  cost: number;
  startedAt?: string;
  completedAt?: string;
}

interface Artifact {
  id: string;
  runId: string;
  name: string;
  type: "spec" | "report" | "test-cases" | "ci-config" | "page-object";
  content?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface PipelineDefinition {
  version: string;
  defaults: {
    model: string;
    maxTurnsPerStage: number;
    budgetPerRunUsd: number;
    budgetPerStageUsd: number;
    autoInvoke: boolean;
  };
  models: {
    available: string[];
    costPerMTokenInput: Record<string, number>;
    costPerMTokenOutput: Record<string, number>;
  };
  stages: StageDefinition[];
  convergenceGuards: {
    enabled: boolean;
    sameFindings: { enabled: boolean; action: string };
    notDecreasing: { enabled: boolean; windowSize: number; action: string };
    maxIterations: { enabled: boolean; limit: number; action: string };
    budgetExhausted: { enabled: boolean; action: string };
  };
}

interface StageDefinition {
  id: string;
  name: string;
  agent: string;
  model: string;
  enabled: boolean;
  maxTurns: number;
  budgetCap: number;
  retries: number;
  timeoutSeconds: number;
  next: Record<string, string>;
  description: string;
}
```

---

## Frontend Pages

### 1. LoginPage (`/login`)
- Black bg (#0a0a0a), white card centered
- Email + password (mock auth for MVP — any credentials accepted, stored in localStorage)
- "Sign In" → `/chat`

### 2. ChatPage (`/chat`) — PRIMARY
- The main interface. Chat is the product, not a help widget.
- User types intent → frontend calls `POST /api/pipeline/run`
- Bot renders pipeline cards, metrics cards, findings cards inline
- Quick action chips: "New request", "Status", "Metrics", "Failures"
- Connects to SSE for active runs → live stage updates in chat bubbles
- Typing "status" → calls `GET /api/pipeline/list` → renders summary card
- Typing "failures" → filters list by `status: "fixme"` → renders findings

### 3. DashboardPage (`/dashboard`)
- Table from `GET /api/pipeline/list`
- Columns: Feature | Module | Status | Priority | Updated
- StatusDot per row, click → `/pipeline/:id`

### 4. PipelineDetailPage (`/pipeline/:id`)
- Left: Vertical timeline from `GET /api/pipeline/:id` `.stages[]`
- Timeline stages driven by `GET /api/admin/pipeline-definition` (stage names, order)
- SSE connected for live updates
- Right: Feature info, artifact download links, "Open in Chat"

### 5. SettingsPage (`/settings`)
- **Tier 2** (visible):
  - Pipeline stages table from `GET /api/admin/pipeline-definition`
  - Toggle enabled/disabled per stage
  - Model dropdown per stage (from `models.available`)
  - Budget input per stage
  - Save → `PUT /api/admin/pipeline-definition`
  - Worker status from `GET /api/admin/worker-status`
- **Tier 3** (collapsed "Advanced" accordion):
  - Auto-invoke toggle
  - Convergence guard toggles
  - Default budget per run
  - Pipeline definition JSON editor (raw)

---

## Design System

Same as original PLAN_21 design philosophy — kept intact:

1. **Monochrome.** No colored backgrounds. White (#fff) or off-white (#fafafa).
2. **Only color**: StatusDot indicators (green=#22c55e, red=#ef4444, yellow=#eab308, black=running with pulse)
3. No gradients. No shadows except login card.
4. Typography: system font or Inter. Weights: 400, 500.
5. Borders: 1px solid #e5e5e5 only.
6. Spacing: generous (p-4 min, gap-3).
7. Icons: Heroicons outline, minimal.
8. Animations: only StatusDot pulse and accordion expand.
9. Login exception: black bg.

---

## Acceptance Criteria

1. `cd ui && npm install && npm run dev` works at localhost:5173
2. Frontend calls real backend API (configured via `VITE_API_URL` env var)
3. Login → Chat → Dashboard → Pipeline Detail → Settings navigation works
4. Chat input → `POST /api/pipeline/run` creates real pipeline run
5. SSE connection shows live stage progression in chat and pipeline detail
6. Dashboard populates from `GET /api/pipeline/list`
7. Settings page loads/saves pipeline definition via admin endpoints
8. Worker status indicator shows connected/disconnected
9. Artifacts downloadable from pipeline detail page
10. **Entire UI is black and white** (monochrome design system)
11. `npm run build` produces dist/ without errors
12. Deployed on Vercel with `VITE_API_URL` pointing to Render backend
13. CORS works between Vercel frontend ↔ Render backend

---

## Colleague Handoff

The complete agent prompt for building this frontend is at:
**`plans/COLLEAGUE_AGENT_PROMPT.md`**

That file is self-contained — the colleague's agent reads it and has everything needed to build the entire frontend without additional context.
