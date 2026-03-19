# PLAN_20: SaaS Platform — Multi-Tenant Agent Pipeline with UI

**Created**: 2026-03-06
**Revised**: 2026-03-09 (v3 — post-audit: 21 findings fixed, all CRITICALs resolved)
**Priority**: P1
**Status**: PENDING
**Prerequisites**: PLAN_16 (Agent Orchestration), PLAN_19 (Post-execution cleanup)

---

## Vision

Encore is a SaaS platform where clients log in to a website, describe pages they want automated, and our 5-agent pipeline (Requirements → Planner → Generator → Healer → Audit) runs autonomously to deliver test automation. Clients never see agent prompts, pipeline scripts, or internal methodology. They get artifacts (specs, reports, CI configs) — nothing that reveals core IP.

**Non-negotiables**:
1. Agents working for Client A must NEVER read, write, or reference Client B's data
2. All agent logic, prompts, and orchestration are our IP — never exposed
3. Costs must be predictable and trackable per tenant
4. Data must have clear lifecycle policies — no unbounded growth
5. Architecture must scale from 5 tenants to 500+ without rewrite

---

## Alternatives Evaluated and Rejected

| Tool | Why Rejected |
|------|-------------|
| **LangGraph** | Abstraction overhead for what is a linear pipeline + 1 audit loop. TypeScript is second-class (Python-first). Platform lock-in on LangGraph Cloud. Our pipeline IS our product — don't hand orchestration to a vendor. |
| **n8n** | Business automation tool, not agent pipeline infrastructure. Convergence guards would be hacky IF nodes. Visual-first paradigm doesn't fit a code-first SaaS. |
| **CrewAI** | Python-only. Eliminated by language constraint. |
| **Temporal.io** | Right at enterprise scale, wrong at v1. Operational overhead (Cassandra/PG + Elasticsearch). Still requires building all AI logic yourself. Upgrade path for v3+. |
| **Claude Code CLI (consumer subscription)** | TOS violation — consumer Pro/Max subscriptions prohibit powering third-party products. When using ANTHROPIC_API_KEY, you pay API rates anyway. No cost advantage. |
| **Database-per-tenant** | Operational nightmare at 100+ tenants (100 migration targets, 100 connection pools, 100 backups). Unnecessary when PostgreSQL RLS provides engine-level isolation. |
| **Schema-per-tenant** | PostgreSQL catalog bloat at scale (1000 tenants × 20 tables = 20K pg_class entries). ORM integration issues with dynamic search_path. |

**What we chose and why**:
- **Custom Orchestrator SDK** — our pipeline is our product, we own it
- **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`) — in-process agent execution, proper commercial terms, streaming, hooks, budget caps
- **PostgreSQL with Row-Level Security** — engine-level tenant isolation, single database, single migration path, scales linearly
- **S3-compatible object storage** — tenant-prefixed file isolation with lifecycle policies
- **BullMQ (Redis)** — production job queue from day 1 (not JSON files)
- **React + Vite frontend** — standard, fast, our infrastructure

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│  CLIENT BROWSER                                          │
│  React App (ui/)                                         │
│  ├─ Login → JWT                                          │
│  ├─ Dashboard → pipeline runs table                      │
│  ├─ New Request → describe what to automate              │
│  └─ Pipeline Detail → SSE real-time progress             │
└──────────────┬───────────────────────────────────────────┘
               │ HTTPS + JWT
┌──────────────▼───────────────────────────────────────────┐
│  BACKEND API (server/)                                   │
│  Fastify + JWT auth                                      │
│  ├─ Tenant context middleware (extracts tenant_id)       │
│  ├─ REST endpoints (queue, pipeline, artifacts)          │
│  ├─ SSE event stream (per pipeline run)                  │
│  └─ Artifact download (pre-signed S3 URLs)               │
└──────┬───────────────┬───────────────┬───────────────────┘
       │               │               │
┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│  BULLMQ     │ │  POSTGRES   │ │  S3/MINIO   │
│  (Redis)    │ │  (RLS)      │ │  (Objects)  │
│  Job queue  │ │  All state  │ │  Artifacts  │
│  Per-tenant │ │  Per-tenant │ │  Per-tenant │
│  isolation  │ │  isolation  │ │  isolation  │
└──────┬──────┘ └─────────────┘ └─────────────┘
       │
┌──────▼──────────────────────────────────────────────────┐
│  WORKER POOL                                             │
│  ├─ BullMQ worker processes                              │
│  ├─ Each job: Orchestrator SDK → Agent SDK → results     │
│  ├─ Docker container per tenant workspace (filesystem)   │
│  ├─ SET LOCAL app.tenant_id per DB transaction           │
│  └─ S3 writes scoped to tenants/{tenant_id}/             │
└──────────────────────────────────────────────────────────┘
```

---

## Phase 0: MVP Demo (Zero API Billing, Fully Configurable)

**Goal**: Deployable demo on Render + Neon + Vercel. No API billing. Everything configurable. Core product works end-to-end. Production upgrade = config/infra changes only.

**Created**: 2026-03-10
**Priority**: P0 — must complete before Phase 1

### 0A. Architecture — Local Worker Pattern

```
[Vercel Frontend] → [Render Backend (Fastify API + Neon + SSE)] ← [Local Worker (Claude CLI + Max sub)]
    (React)              (stateless API server)                      (stateful pipeline executor)
```

| Component | Runs On | Does | Claude Cost |
|---|---|---|---|
| Frontend (React) | Vercel (colleague deploys) | Chat, dashboard, settings, pipeline detail | None |
| Backend API | Render (free/starter tier) | Fastify server, Neon DB, SSE events, task queue | None |
| Pipeline Worker | Local machine (your laptop) | Polls backend, runs Claude CLI per stage, posts results | Max subscription (zero API billing) |

**Why this works for zero API billing**:
- Claude CLI on local machine uses Max subscription (browser-authenticated, no API key)
- `claude -p "<prompt>" --output-format json` runs headless, non-interactive
- `--session-id` reuses context across stages for efficiency
- Backend on Render has zero Claude dependency — it's just an API server + DB

**Production upgrade path** (config changes only):
1. Move worker to Render background service
2. Add `ANTHROPIC_API_KEY` env var
3. Switch `agentRunner` config from `"cli"` to `"sdk"`
4. Everything else identical

### 0B. Fully Configurable Pipeline Definition

**File**: `config/pipeline-definition.json` — single source of truth for all pipeline behavior. Editable via admin API (frontend Settings page).

```json
{
  "version": "1.0",
  "defaults": {
    "model": "sonnet",
    "maxTurnsPerStage": 50,
    "budgetPerRunUsd": 2.00,
    "budgetPerStageUsd": 0.50,
    "workerPollIntervalMs": 5000,
    "workerHeartbeatIntervalMs": 30000,
    "cliPath": "claude",
    "cliOutputFormat": "json",
    "agentRunner": "cli",
    "autoInvoke": true
  },
  "models": {
    "available": ["haiku", "sonnet", "opus"],
    "costPerMTokenInput": { "haiku": 0.25, "sonnet": 3.00, "opus": 15.00 },
    "costPerMTokenOutput": { "haiku": 1.25, "sonnet": 15.00, "opus": 75.00 }
  },
  "stages": [
    {
      "id": "requirements",
      "name": "Requirements Intake",
      "agent": "playwright-requirements",
      "agentFile": ".github/agents/playwright-requirements.agent.md",
      "model": "haiku",
      "enabled": true,
      "maxTurns": 30,
      "budgetCap": 0.10,
      "retries": 0,
      "timeoutSeconds": 300,
      "next": { "success": "planning" },
      "preRunGate": "requirements-pre-run.ts",
      "postCompleteGate": "requirements-post-complete.ts",
      "description": "Explores target URL, captures UI structure and requirements"
    },
    {
      "id": "planning",
      "name": "Test Case Planning",
      "agent": "playwright-test-planner",
      "agentFile": ".github/agents/playwright-test-planner.agent.md",
      "model": "sonnet",
      "enabled": true,
      "maxTurns": 50,
      "budgetCap": 0.15,
      "retries": 0,
      "timeoutSeconds": 600,
      "next": { "success": "generation" },
      "preRunGate": "planner-pre-run.ts",
      "postCompleteGate": "planner-post-complete.ts",
      "description": "Creates detailed test cases from requirements"
    },
    {
      "id": "generation",
      "name": "Spec Generation",
      "agent": "playwright-test-generator",
      "agentFile": ".github/agents/playwright-test-generator.agent.md",
      "model": "sonnet",
      "enabled": true,
      "maxTurns": 80,
      "budgetCap": 0.20,
      "retries": 0,
      "timeoutSeconds": 600,
      "next": {
        "tests_pass": "audit",
        "tests_fail": "healing"
      },
      "routing": {
        "condition": "testResults",
        "rules": [
          { "when": "failedCount == 0", "then": "audit" },
          { "when": "failedCount > 0", "then": "healing" }
        ]
      },
      "preRunGate": "generator-pre-run.ts",
      "postCompleteGate": "generator-post-complete.ts",
      "description": "Generates Playwright spec files from test cases"
    },
    {
      "id": "healing",
      "name": "Test Healing",
      "agent": "playwright-test-healer",
      "agentFile": ".github/agents/playwright-test-healer.agent.md",
      "model": "sonnet",
      "enabled": true,
      "maxTurns": 60,
      "budgetCap": 0.15,
      "retries": 3,
      "timeoutSeconds": 600,
      "next": {
        "tests_pass": "audit",
        "tests_fail": "healing",
        "max_retries": "fixme"
      },
      "preRunGate": "healer-pre-run.ts",
      "postCompleteGate": "healer-post-complete.ts",
      "description": "Debugs and fixes failing test specs"
    },
    {
      "id": "audit",
      "name": "Quality Audit",
      "agent": "playwright-pipeline-audit",
      "agentFile": ".github/agents/playwright-pipeline-audit.agent.md",
      "model": "haiku",
      "enabled": true,
      "maxTurns": 40,
      "budgetCap": 0.05,
      "retries": 2,
      "timeoutSeconds": 300,
      "next": {
        "pass": "completed",
        "critical": "healing"
      },
      "preRunGate": "audit-pre-run.ts",
      "postCompleteGate": "audit-post-complete.ts",
      "description": "Reviews all artifacts for quality and completeness"
    }
  ],
  "terminalStates": ["completed", "fixme", "cancelled"],
  "convergenceGuards": {
    "enabled": true,
    "sameFindings": { "enabled": true, "action": "fixme" },
    "notDecreasing": { "enabled": true, "windowSize": 2, "action": "fixme" },
    "maxIterations": { "enabled": true, "limit": 3, "action": "fixme" },
    "budgetExhausted": { "enabled": true, "action": "fixme" }
  }
}
```

**What QA admin can configure via Settings UI**:
| Setting | Where in UI | Level |
|---|---|---|
| Model per stage | Settings → Pipeline Stages | Tier 2 |
| Enable/disable stages | Settings → Pipeline Stages (toggle) | Tier 2 |
| Budget cap per stage | Settings → Pipeline Stages | Tier 2 |
| Budget cap per run | Settings → Budget | Tier 2 |
| Max retries per stage | Settings → Pipeline Stages | Tier 2 |
| Stage order | Settings → Pipeline Stages (drag-drop) | Tier 2 |
| Auto-invoke toggle | Settings → General | Tier 2 |
| Worker poll interval | Settings → Advanced (collapsed) | Tier 3 |
| Convergence guard toggles | Settings → Advanced | Tier 3 |
| CLI path / output format | Settings → Advanced | Tier 3 |
| Agent runner mode (cli/sdk) | Settings → Advanced | Tier 3 |
| Max turns per stage | Settings → Advanced | Tier 3 |
| Timeout per stage | Settings → Advanced | Tier 3 |

**UX tiers**:
- **Tier 1 (Main pages)**: Chat, Dashboard, Pipeline Detail — daily use, visible on login
- **Tier 2 (Settings gear icon)**: Pipeline config, models, budgets — weekly, one click from nav
- **Tier 3 (Advanced accordion in Settings)**: Convergence guards, CLI config, timeouts — rarely, closed by default, header visible so user knows it exists

### 0C. Backend API (Fastify + Neon)

**File**: `src/server/index.ts`

```
src/server/
  index.ts              — Fastify server, CORS, SSE setup
  routes/
    pipeline.ts         — POST /run, GET /list, GET /:id, POST /:id/cancel
    events.ts           — GET /events/:runId (SSE)
    admin.ts            — GET/PUT /admin/pipeline-definition, GET /admin/usage, GET /admin/worker-status
    worker.ts           — GET /worker/next-task, POST /worker/complete-task, POST /worker/heartbeat
    health.ts           — GET /health
  db/
    client.ts           — Neon connection pool (@neondatabase/serverless)
    schema.sql          — 4 tables (pipeline_runs, stage_results, artifacts, worker_tasks)
    queries.ts          — Parameterized SQL queries (no ORM for MVP)
```

**Endpoints** (all prefixed with `/api` except `/health`):

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| POST | `/api/pipeline/run` | None (MVP) | `{ feature, module, intent, priority?, targetUrl? }` | `{ runId }` |
| GET | `/api/pipeline/list` | None | query: `?status=running` | `PipelineRun[]` |
| GET | `/api/pipeline/:id` | None | — | `PipelineRun` with `stages[]` and `artifacts[]` |
| POST | `/api/pipeline/:id/cancel` | None | — | `{ cancelled: true }` |
| GET | `/api/events/:runId` | None | — | SSE stream |
| GET | `/api/admin/pipeline-definition` | None | — | `PipelineDefinition` |
| PUT | `/api/admin/pipeline-definition` | None | `PipelineDefinition` body | `{ saved: true }` |
| GET | `/api/admin/usage` | None | — | `{ totalRuns, totalCost, storageUsed }` |
| GET | `/api/admin/worker-status` | None | — | `{ connected, lastHeartbeat, currentTask? }` |
| GET | `/api/worker/next-task` | Worker secret header | — | `{ taskId, stageId, agentPrompt, context }` or `null` |
| POST | `/api/worker/complete-task` | Worker secret | `{ taskId, success, result, artifacts[], cost }` | `{ ok: true }` |
| POST | `/api/worker/heartbeat` | Worker secret | — | `{ ok: true }` |
| GET | `/health` | None | — | `{ status, db, worker }` |

**SSE Events** pushed to frontend:
```typescript
type SSEEvent =
  | { type: "stage_start", runId: string, stage: string, agent: string, model: string, attempt: number, timestamp: string }
  | { type: "stage_complete", runId: string, stage: string, result: "success" | "fail", cost: number, duration: number, timestamp: string }
  | { type: "pipeline_complete", runId: string, status: "completed" | "fixme" | "cancelled", totalCost: number, timestamp: string }
  | { type: "artifact_ready", runId: string, artifactId: string, name: string, type: string, timestamp: string }
  | { type: "retry", runId: string, stage: string, attempt: number, maxAttempts: number, reason: string, timestamp: string }
  | { type: "error", runId: string, message: string, timestamp: string }
  | { type: "worker_status", connected: boolean, timestamp: string }
```

### 0D. Neon Database Schema

**4 tables** — minimal, sufficient for MVP, extensible for production.

```sql
-- pipeline_runs: one row per automation request
CREATE TABLE pipeline_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature TEXT NOT NULL,
  module TEXT NOT NULL,
  intent TEXT NOT NULL,
  target_url TEXT,
  stage TEXT NOT NULL DEFAULT 'queued',
  status TEXT NOT NULL DEFAULT 'queued',
  priority TEXT NOT NULL DEFAULT 'medium',
  cost NUMERIC(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- stage_results: one row per stage execution (including retries)
CREATE TABLE stage_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempt INT DEFAULT 1,
  max_attempts INT DEFAULT 1,
  agent_model TEXT,
  cost NUMERIC(10,4) DEFAULT 0,
  result_data JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- artifacts: downloadable outputs (specs, reports, etc.)
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- worker_tasks: task queue polled by local worker
CREATE TABLE worker_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  agent_prompt TEXT NOT NULL,
  context JSONB,
  result JSONB,
  claimed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_worker_tasks_status ON worker_tasks(status) WHERE status = 'pending';
CREATE INDEX idx_pipeline_runs_status ON pipeline_runs(status);
CREATE INDEX idx_stage_results_run ON stage_results(run_id);
```

### 0E. Local Worker Script

**File**: `src/worker/index.ts` — runs on your machine, polls backend, executes Claude CLI.

```typescript
// Simplified flow
async function workerLoop() {
  while (running) {
    // 1. Poll for next task
    const task = await fetch(`${BACKEND_URL}/api/worker/next-task`, {
      headers: { 'x-worker-secret': WORKER_SECRET }
    }).then(r => r.json());

    if (!task) {
      await sleep(config.workerPollIntervalMs);
      continue;
    }

    // 2. Build CLI command from pipeline-definition config
    const stageDef = pipelineDefinition.stages.find(s => s.id === task.stageId);
    const cliArgs = [
      '-p', buildPrompt(task.agentPrompt, task.context),
      '--output-format', config.cliOutputFormat,
      '--max-turns', String(stageDef.maxTurns),
      '--model', stageDef.model,
    ];

    // 3. Execute Claude CLI
    const result = execSync(`${config.cliPath} ${cliArgs.join(' ')}`, {
      timeout: stageDef.timeoutSeconds * 1000,
      encoding: 'utf-8',
    });

    // 4. Post result back
    await fetch(`${BACKEND_URL}/api/worker/complete-task`, {
      method: 'POST',
      headers: { 'x-worker-secret': WORKER_SECRET, 'content-type': 'application/json' },
      body: JSON.stringify({ taskId: task.id, success: true, result: JSON.parse(result) }),
    });
  }
}
```

**Configurable worker settings** (from pipeline-definition.json `defaults`):
- `cliPath`: Path to Claude CLI binary (default: `"claude"`)
- `cliOutputFormat`: `"json"` or `"stream-json"` or `"text"`
- `workerPollIntervalMs`: How often to check for tasks (default: 5000)
- `workerHeartbeatIntervalMs`: How often to send heartbeat (default: 30000)
- `agentRunner`: `"cli"` (local) or `"sdk"` (API-based, for production)
- Model per stage: configurable in stage definition
- Max turns per stage: configurable in stage definition
- Timeout per stage: configurable in stage definition

### 0F. Schema-Driven Orchestrator

**File**: `src/orchestrator/orchestrator.ts` — reads pipeline-definition.json, drives stage transitions.

**Key change from current hardcoded orchestrator**:
- NO hardcoded stage maps (removes 5 mapping tables)
- NO `routeAfterStage()` switch statement
- All routing derived from `pipeline-definition.json` stage entries
- Adding a 6th agent = add one stage entry to JSON, create pre-run + post-complete gate scripts

```typescript
// Core orchestration loop (simplified)
async function processStageCompletion(runId: string, stageId: string, outcome: string) {
  const definition = await loadPipelineDefinition();
  const stage = definition.stages.find(s => s.id === stageId);

  // Check convergence guards
  if (definition.convergenceGuards.enabled) {
    const guard = await checkConvergence(runId, stageId, definition.convergenceGuards);
    if (guard.triggered) {
      await transitionTo(runId, 'fixme', guard.reason);
      return;
    }
  }

  // Route to next stage based on outcome
  const nextStageId = stage.next[outcome];
  if (!nextStageId || definition.terminalStates.includes(nextStageId)) {
    await completePipeline(runId, nextStageId || 'completed');
    return;
  }

  // Create worker task for next stage
  const nextStage = definition.stages.find(s => s.id === nextStageId);
  if (!nextStage?.enabled) {
    // Skip disabled stages
    await processStageCompletion(runId, nextStageId, 'success');
    return;
  }

  await createWorkerTask(runId, nextStage);
}
```

### 0G. Deployment Files

**`render.yaml`** (root of repo):
```yaml
services:
  - type: web
    name: encore-api
    runtime: node
    plan: starter
    buildCommand: npm ci && npm run build:server
    startCommand: node dist/server/index.js
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: WORKER_SECRET
        generateValue: true
      - key: CORS_ORIGIN
        value: https://encore-demo.vercel.app
      - key: NODE_ENV
        value: production
```

**MCP Server Setup** (Claude Code config):
```bash
# Render MCP — deploy, logs, metrics, manage services
# Official, GA: https://render.com/docs/mcp-server

# Neon MCP — create databases, run queries, manage schema
# Official: https://neon.com/docs/ai/neon-mcp-server
# Setup: npx neonctl@latest init

# Vercel MCP — manage deployments (colleague uses this)
# Official, hosted: https://vercel.com/docs/agent-resources/vercel-mcp
# Setup: claude mcp add --transport http vercel https://mcp.vercel.com
```

### 0H. Files to Create for Phase 0

| # | File | Purpose |
|---|---|---|
| 1 | `config/pipeline-definition.json` | Configurable pipeline schema (single source of truth) |
| 2 | `src/server/index.ts` | Fastify server entry point |
| 3 | `src/server/routes/pipeline.ts` | Pipeline CRUD endpoints |
| 4 | `src/server/routes/events.ts` | SSE endpoint |
| 5 | `src/server/routes/admin.ts` | Admin config + usage endpoints |
| 6 | `src/server/routes/worker.ts` | Worker polling + completion endpoints |
| 7 | `src/server/routes/health.ts` | Health check |
| 8 | `src/server/db/client.ts` | Neon connection pool |
| 9 | `src/server/db/schema.sql` | Database tables |
| 10 | `src/server/db/queries.ts` | Parameterized SQL queries |
| 11 | `src/orchestrator/orchestrator.ts` | Schema-driven pipeline engine |
| 12 | `src/orchestrator/types.ts` | Shared TypeScript types |
| 13 | `src/worker/index.ts` | Local worker script |
| 14 | `render.yaml` | Render deployment blueprint |
| 15 | `package.json` updates | Add fastify, @neondatabase/serverless, etc. |

### 0I. MVP → Production Upgrade Map

Every MVP shortcut has a clean upgrade path:

| MVP (Phase 0) | Production (Phases 1-7) | Change Required |
|---|---|---|
| Local worker (CLI + Max sub) | Render worker service (SDK + API key) | Config: `agentRunner: "sdk"` + env var |
| Single tenant, no auth | Multi-tenant + JWT + RLS | Add auth middleware + RLS policies |
| Neon free tier | Neon Pro + PgBouncer | Plan upgrade (one click) |
| Artifacts in DB (TEXT column) | S3 with pre-signed URLs | Add storage adapter |
| DB polling for worker tasks | BullMQ + Redis queues | Add queue adapter |
| Direct SSE from server | Redis pub/sub → SSE | Add event bus layer |
| File-based pipeline-definition.json | DB-stored per-tenant definitions | Migration script |
| No Docker isolation | Docker volumes per workspace | Add workspace adapter |
| Open endpoints | JWT + RBAC | Add auth middleware |

**Core orchestration code stays the same.** Only infrastructure adapters change.

### 0J. Orchestration Audit Findings (Reference)

**Issues found in current `scripts/pipeline-orchestrator.ts`**:
1. 5 hardcoded stage maps (SCRIPT_PREFIX, STAGE_MAP, STAGE_AGENT_MAP, QUEUE_TO_PIPELINE, routeAfterStage) → **Fixed by**: pipeline-definition.json
2. File-based queue (agent-queue.json) with advisory locking only → **Fixed by**: Neon DB with `SELECT FOR UPDATE`
3. CLI `execSync` blocking with 600s timeout → **Fixed by**: Async worker with polling
4. No pipeline observability → **Fixed by**: DB queries + admin endpoints
5. Audit→Heal loop has no independent cycle cap → **Fixed by**: Configurable convergence guards
6. Adding 6th agent requires 5 code edits → **Fixed by**: Add one JSON entry
7. No admin configurability → **Fixed by**: Admin API + Settings UI

**What's preserved from current orchestration** (working well):
- Pre-run + post-complete gate pattern
- Self-audit protocol (§8)
- Artifact tracking via queue items / InjectedContext
- Healing retry cap
- Learning debt enforcement (Gate 19)

---

## Phase 1: Orchestrator SDK + Tenant-Aware Queue

The foundation for multi-tenancy. Everything else depends on this. **Builds on Phase 0 MVP.**

### 1A. `src/orchestrator/types.ts` (NEW)

Contract types between SDK and any consumer:

```typescript
interface PipelineRequest {
  tenantId: string
  requirements: string
  module: string
  targetUrl: string                    // client's application URL
  userMetadata?: Record<string, unknown>
}

interface AgentResult {
  success: boolean
  artifacts: string[]                  // S3 keys, not local paths
  errors: string[]
  duration: number
  tokensUsed: { input: number; output: number }
  costUsd: number
}

interface StageTransition {
  from: string
  to: string
  agent: string
  gatesPassed: boolean
  gateErrors: string[]
}

interface AuditRemediation {
  targetAgent: string
  prompt: string
  severity: string
  findingIds: string[]
}

interface PipelineStatus {
  runId: string
  tenantId: string
  stage: string
  lockedBy: string | null
  auditLoopCount: number
  blocked: boolean
  costSoFar: number
}

interface TenantContext {
  tenantId: string
  workspaceDir: string                 // isolated filesystem path
  s3Prefix: string                     // tenants/{tenantId}/
  budgetRemainingUsd: number
  allowedModels: string[]
}
```

Move `QueueItem`, `QueueFile`, `InjectedContext` here from `scripts/shared-types.ts`. Keep re-exports in shared-types.ts for backward compat.

### 1B. `src/orchestrator/queue-adapter.ts` (NEW)

Two implementations — file-based for dev, PostgreSQL for production:

```typescript
interface QueueAdapter {
  // All methods are tenant-scoped. Implementation enforces isolation.
  getItem(runId: string): Promise<PipelineRun | undefined>
  getItemsByStage(stage: string): Promise<PipelineRun[]>
  updateItem(runId: string, patch: Partial<PipelineRun>): Promise<void>
  addItem(item: PipelineRun): Promise<void>
  lock(runId: string, agent: string): Promise<boolean>
  unlock(runId: string): Promise<void>
  addHistory(runId: string, entry: HistoryEntry): Promise<void>
  recordUsage(metric: UsageMetric): Promise<void>
}

class FileQueueAdapter implements QueueAdapter {
  // Wraps current fs.readFileSync/writeFileSync on agent-queue.json
  // Dev/test only. Single-tenant. No behavior change from today.
}

class PostgresQueueAdapter implements QueueAdapter {
  // Production. Every method runs inside:
  //   BEGIN; SET LOCAL app.tenant_id = $1; ...query...; COMMIT;
  // RLS policies enforce isolation at the database engine level.
  // Even if application code has a bug, DB blocks cross-tenant access.
  constructor(pool: Pool, tenantId: string)
}
```

### 1C. `src/orchestrator/stage-machine.ts` (NEW)

Consolidate stage logic currently scattered across `pipeline-orchestrator.ts`, `validate-queue-integrity.ts`, and `task-context-builder.ts`:

```typescript
STAGE_ORDER: string[]
STAGE_TO_AGENT: Record<string, string>
getNextStage(current: string): string
getAgentForStage(stage: string): string
isTerminalStage(stage: string): boolean
canAdvance(item: PipelineRun): { allowed: boolean; blockers: string[] }
```

Single source of truth. Existing scripts refactored to import from here.

### 1D. `src/orchestrator/audit-remediation-parser.ts` (NEW)

Parses existing audit markdown → `AuditRemediation[]`. Falls back to empty array if section missing. No crash, loop exits cleanly.

**Finding ID generation** (critical for convergence guard stability): IDs are content-based hashes: `SHA256(severity + findingCategory + affectedAgent)` truncated to 8 hex chars. This ensures the same finding produces the same ID across audit iterations, so the "same findings" convergence guard works correctly. IDs based on timestamps or line numbers would never match, defeating convergence detection.

### 1E. `src/orchestrator/audit-loop.ts` (NEW)

The critical self-healing loop:

```
runAuditLoop(runId, queueAdapter, agentRunner, config):
  iteration = 0
  previousFindingIds = []

  while (iteration < config.auditLoop.maxIterations):
    iteration++
    emit('audit_loop_iteration', { runId, iteration })

    1. Run audit stage (pre-run → agent → post-complete)
    2. Parse remediation targets
    3. Convergence check: same findings as last iteration? → fixme("stuck")
    4. Not decreasing: HIGH count >= previous for 2 iterations? → fixme("not converging")
    5. No HIGH findings? → completed, break
    6. For each target agent (in pipeline order):
       - Inject remediation prompt
       - Run agent stage
    7. Loop back to step 1

  if iteration >= max → fixme("exhausted N iterations")
```

Convergence guards:

| Guard | Trigger | Action |
|-------|---------|--------|
| Same findings | Finding IDs match previous iteration exactly | fixme |
| Not decreasing | HIGH count >= previous for 2 consecutive iterations | fixme |
| Max iterations | Exceeded config.auditLoop.maxIterations (default: 3) | fixme with reason |
| Budget exceeded | Cumulative cost > tenant budget cap | fixme("budget exhausted") |

### 1F. `src/orchestrator/events.ts` (NEW)

Three-layer event system (worker → Redis → API server → SSE):

```
Worker process                    API server process
  │                                │
  ├─ PipelineEventEmitter          ├─ Redis subscriber
  │   (in-process)                 │   (listens to pipeline-events:{runId})
  │                                │
  ├─ Redis publisher ──────────────┤─► SSE connections
  │   (cross-process bridge)       │   (keyed by tenantId + runId)
  │                                │
  └─ PostgreSQL writer             └─ (audit trail only, not for live streaming)
      (best-effort, non-blocking)
```

```typescript
class PipelineEventBus {
  constructor(private redis: Redis, private pool: Pool) {}

  // Called by worker — publishes to Redis + persists to DB
  async emit(tenantId: string, runId: string, event: PipelineEvent): void {
    // 1. Redis pub/sub — real-time, cross-process
    await this.redis.publish(`pipeline-events:${runId}`, JSON.stringify({ tenantId, ...event }))

    // 2. PostgreSQL — audit trail (non-blocking, fire-and-forget)
    withTenantContext(this.pool, tenantId, (client) =>
      client.query('INSERT INTO pipeline_events (tenant_id, run_id, event_type, data) VALUES ($1,$2,$3,$4)',
        [tenantId, runId, event.type, event])
    ).catch(err => logger.warn('Event persist failed (non-fatal)', err))
  }
}
```

API server subscribes to Redis and fans out to SSE connections. PostgreSQL table is for audit replay only, not live streaming.

### 1G. `src/orchestrator/agent-runner.ts` (NEW)

Wraps Claude Agent SDK for tenant-isolated agent execution:

```typescript
class AgentRunner {
  constructor(private tenantContext: TenantContext)

  // Active AbortControllers keyed by runId — for cancellation support
  private controllers = new Map<string, AbortController>()

  async runAgent(agentName: string, runId: string, context: InjectedContext): Promise<AgentResult> {
    const prompt = extractAgentPrompt(agentName)
    const controller = new AbortController()
    this.controllers.set(runId, controller)

    let totalCostUsd = 0
    let inputTokens = 0
    let outputTokens = 0
    const artifacts: string[] = []

    try {
      // Claude Agent SDK returns an async generator — MUST iterate, not await
      for await (const message of query({
        prompt: context.taskPrompt,
        abortController: controller,
        options: {
          // Preserve Claude Code's built-in tool awareness + append agent-specific rules
          systemPrompt: {
            type: 'preset',
            preset: 'claude_code',
            append: prompt.agentInstructions    // agent-specific rules from .agent.md
          },
          cwd: this.tenantContext.workspaceDir,
          // SECURITY: disallowedTools blocks tools. allowedTools only auto-approves.
          allowedTools: ['Read', 'Write', 'Edit', 'mcp__playwright*'],
          disallowedTools: ['Bash', 'WebSearch', 'WebFetch'],
          permissionMode: 'acceptEdits',        // auto-approve file edits, deny everything else
          model: selectModelId(agentName),       // e.g. 'claude-haiku-4-5', 'claude-sonnet-4-6'
          maxTurns: 15,
          maxBudgetUsd: this.tenantContext.budgetRemainingUsd,
          mcpServers: {
            playwright: {
              command: 'npx',
              args: ['playwright', 'run-test-mcp-server',
                     '--target-url', this.tenantContext.targetUrl]
            },
            // Custom MCP tool for running tests (replaces Bash need)
            testRunner: {
              command: 'npx',
              args: ['encore-test-runner-mcp',
                     '--workspace', this.tenantContext.workspaceDir,
                     '--config', `${this.tenantContext.workspaceDir}/playwright.config.ts`]
            }
          }
        }
      })) {
        if (message.type === 'result') {
          totalCostUsd = message.total_cost_usd ?? 0
        }
      }
    } finally {
      this.controllers.delete(runId)
    }

    await this.recordCost({ inputTokens, outputTokens }, totalCostUsd)
    return { success: true, artifacts, errors: [], duration: 0, tokensUsed: { input: inputTokens, output: outputTokens }, costUsd: totalCostUsd }
  }

  cancelRun(runId: string): void {
    this.controllers.get(runId)?.abort()
    this.controllers.delete(runId)
  }
}
```

**CRITICAL DESIGN DECISIONS in agent-runner.ts**:

1. **`query()` returns async generator** — MUST iterate with `for await`, not `await`. Cost data arrives in the final `message.type === 'result'` message as `message.total_cost_usd`.

2. **`disallowedTools` NOT `allowedTools` for security** — `allowedTools` only auto-approves listed tools, it does NOT block unlisted tools. Use `disallowedTools: ['Bash', 'WebSearch', 'WebFetch']` to explicitly block dangerous tools. Combined with `permissionMode: 'acceptEdits'` for auto-approving file operations.

3. **`systemPrompt` uses preset mode** — `{ type: 'preset', preset: 'claude_code', append: ... }` preserves Claude's built-in tool awareness (how to use Read/Write/Edit correctly) and appends our agent-specific rules on top. A plain string would replace ALL built-ins, making agents unable to use tools correctly.

4. **Cancellation via AbortController** — Agent SDK is in-process (no separate process). Cancel with `controller.abort()`, not SIGTERM.

5. **Test execution via custom MCP tool** — Agents cannot use `Bash` in production (security). Instead, a custom `encore-test-runner-mcp` server provides a `RunTests` tool that executes `npx playwright test` within the workspace with path restrictions. This is how agents verify their generated specs pass without having arbitrary shell access.

**Model routing for cost optimization**:

| Agent | Model | Rationale |
|-------|-------|-----------|
| Requirements | haiku | Text parsing, requirement extraction — simple task |
| Planner | sonnet | Test case design needs reasoning but not top-tier |
| Generator | sonnet | Code generation — sonnet is the sweet spot |
| Healer | sonnet | Debugging needs good reasoning |
| Audit | haiku | Checklist evaluation, pattern matching — structured task |

Estimated cost per full pipeline run: ~$0.15-0.40 (vs $0.90+ if all opus).

### 1H. `src/orchestrator/orchestrator.ts` (NEW)

Main entry point:

```typescript
class Orchestrator {
  constructor(
    queueAdapter: QueueAdapter,
    agentRunner: AgentRunner,
    config: PipelineConfig,
    events: PipelineEventEmitter
  )

  createPipelineRun(req: PipelineRequest): Promise<PipelineRun>
  getNextAction(runId: string): Promise<{ agent: string; stage: string; context: InjectedContext }>
  reportAgentComplete(runId: string, result: AgentResult): Promise<StageTransition>
  reportAgentFailure(runId: string, error: string): Promise<StageTransition>
  runFullPipeline(runId: string): Promise<PipelineStatus>
  getAuditLoopCount(runId: string): number
  isAuditLoopExhausted(runId: string): boolean
  cancelPipeline(runId: string): Promise<void>
}
```

### 1I. `src/orchestrator/agent-prompts.ts` (NEW)

Extracts `.agent.md` files into structured data for Claude Agent SDK calls. Reads from our private repo — agent prompts NEVER leave the server.

### 1J. Config changes

`config/pipeline-config.json`:
```json
{
  "autoInvoke": { "enabled": false },
  "auditLoop": { "maxIterations": 3, "severityThreshold": "HIGH" },
  "agentTimeoutMinutes": 30,
  "models": {
    "requirements": "claude-haiku-4-5",
    "planner": "claude-sonnet-4-6",
    "generator": "claude-sonnet-4-6",
    "healer": "claude-sonnet-4-6",
    "audit": "claude-haiku-4-5"
  },
  "defaultBudgetPerRunUsd": 2.00
}
```

---

## Phase 2: Multi-Tenant Data Layer

### 2A. PostgreSQL Schema with Row-Level Security

**Why RLS over separate databases**: RLS enforces isolation at the PostgreSQL engine level. Even if application code has a bug, the database blocks cross-tenant queries. One database, one migration path, one connection pool. Adding tenant #1001 is an INSERT, not a DDL operation.

```sql
-- Application role (non-superuser, non-owner)
CREATE ROLE app_user LOGIN PASSWORD 'from_secret_manager';

-- Admin role (migrations, analytics — bypasses RLS intentionally)
CREATE ROLE app_admin LOGIN PASSWORD 'from_secret_manager' BYPASSRLS;
```

**Core tables** (all have `tenant_id` + RLS):

| Table | Purpose | RLS |
|-------|---------|-----|
| `tenants` | Tenant metadata, plan, settings | Admin-only (no RLS) |
| `users` | User accounts per tenant | YES |
| `pipeline_runs` | Pipeline execution state | YES |
| `agent_steps` | Per-agent results within a run | YES |
| `artifacts` | File metadata (S3 keys, sizes, checksums) | YES |
| `audit_logs` | Immutable append-only event trail | YES (no UPDATE/DELETE grants) |
| `usage_metrics` | Per-tenant billing: tokens, runs, storage | YES |
| `pipeline_events` | Real-time event stream (SSE source) | YES |
| `retention_policies` | Per-tenant data lifecycle overrides | YES |

**RLS pattern applied to every tenant-scoped table**:

```sql
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_runs FORCE ROW LEVEL SECURITY;

-- missing_ok=true returns NULL instead of throwing when GUC not set.
-- NULL::UUID never matches any tenant_id → zero rows returned (safe default).
CREATE POLICY tenant_isolation ON pipeline_runs
    USING (tenant_id = current_setting('app.tenant_id', true)::UUID)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::UUID);

CREATE INDEX idx_pipeline_runs_tenant ON pipeline_runs (tenant_id);

-- SAFETY: tenant_id must never be NULL in any row
ALTER TABLE pipeline_runs ADD CONSTRAINT chk_tenant_not_null CHECK (tenant_id IS NOT NULL);
```

**RLS safety rules** (enforced by lint + integration test):
- ALWAYS use `current_setting('app.tenant_id', true)` (with `true` for `missing_ok`)
- ALWAYS use `SET LOCAL` (transaction-scoped), NEVER `SET` (session-scoped)
- Lint rule bans `SET app.tenant_id` without `LOCAL` in codebase
- Integration test: insert as Tenant A, query WITHOUT setting tenant context, assert zero rows (not error)

**Tenant context per connection** (safe with PgBouncer transaction mode):

```typescript
async function withTenantContext<T>(
  pool: Pool,
  tenantId: string,
  work: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('SET LOCAL app.tenant_id = $1', [tenantId])
    const result = await work(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()  // SET LOCAL automatically resets
  }
}
```

**Critical design rules for `withTenantContext`**:

1. `SET LOCAL` is scoped to the transaction. When it ends, tenant context is cleared. No leak risk via connection pool.
2. **Use ONLY for short DB operations** (read a row, update a field, insert a result). NEVER wrap a full pipeline run in a single `withTenantContext` — a 30-minute open transaction holds row locks, blocks autovacuum, and consumes a connection from the pool.
3. Every DB-touching function in the orchestrator takes `tenantId` as a parameter and opens its own short transaction via `withTenantContext`. The pipeline loop is NOT inside a transaction — only individual read/write operations are.
4. Lint rule bans `SET app.tenant_id` without `LOCAL` to prevent session-scoped tenant context leaking across connection reuse.

### 2B. PgBouncer Connection Pooling

```ini
[pgbouncer]
pool_mode = transaction
default_pool_size = 30
max_client_conn = 2000
# Empty reset query for transaction mode — SET LOCAL resets automatically on COMMIT/ROLLBACK.
# DISCARD ALL is for session mode only and interferes with prepared statements.
server_reset_query =
```

Pool sizing (tenant count does NOT increase pool size — all tenants share):

| Scale | Pool size | PG max_connections |
|-------|-----------|-------------------|
| 5 tenants | 20 | 50 |
| 50 tenants | 30 | 75 |
| 500 tenants | 50-100 | 150 |

### 2C. S3 File Storage with Tenant Isolation

All agent-produced files stored in S3 with tenant-prefixed keys:

```
s3://encore-artifacts/
  tenants/
    {tenant_id}/
      runs/
        {run_id}/
          specs/          # generated .spec.ts files
          pages/          # generated page objects
          test-cases/     # markdown test plans
          reports/        # test results, audit reports
          debug/          # screenshots, traces, HAR (ephemeral)
```

**Artifact delivery to clients**: Pre-signed S3 URLs with 1-hour expiry. Client downloads their files directly from S3 — our server is never a bottleneck for large files.

**What clients receive** (safe to expose):
- Generated `.spec.ts` files (test code they paid for)
- Test execution results (pass/fail/screenshots)
- Test case documentation (markdown)
- CI/CD config templates (generic, not our pipeline config)

**What clients NEVER receive** (IP protection):
- Agent prompts (`.agent.md` files)
- Pipeline orchestration logic
- Agent performance metrics / trust levels
- Audit methodology and internal findings detail
- Queue state, injected context, convergence data
- Selector discovery methodology
- Agent mistakes registry / rules

### 2D. Workspace Isolation for Agent Execution

Each pipeline run gets an isolated filesystem workspace:

```
/workspaces/
  {tenant_id}/
    {run_id}/
      src/selectors/     # tenant's selectors
      tests/specs/       # generated specs
      tests/pages/       # generated page objects
      reports/           # test results
      node_modules/      # shared, read-only mount
      playwright.config  # tenant-specific config (target URL, etc.)
```

**Isolation mechanism** (volume-based, NOT container-per-run):

The agent runs in-process via the Agent SDK inside the BullMQ worker process. Filesystem isolation is via **Docker volumes** (storage), not Docker containers (runtime). This avoids the 2-10 second container cold start overhead per pipeline run.

1. **Docker volume** created per `{tenantId}/{runId}` with `nosuid,nodev` mount options
2. Agent SDK `cwd` set to the volume mount path — Read/Write/Edit scoped to this directory
3. `disallowedTools: ['Bash', 'WebSearch', 'WebFetch']` prevents shell escape
4. `node_modules/` bind-mounted read-only from host (shared across all workspaces)
5. Symlinks disabled at volume level (Docker `--security-opt=no-new-privileges`)
6. Custom `encore-test-runner-mcp` executes `npx playwright test` with path validation (replaces Bash need)

**Why not container-per-run**: Playwright + Chromium image is ~2GB. Cold start adds 2-10s. Concurrent runs need 3-8GB RAM just for containers. Volume isolation + tool restrictions + MCP sandboxing achieves equivalent security without the overhead.

**After pipeline completes**: Artifacts synced to S3, volume deleted. No persistent local state.

---

## Phase 3: BullMQ Job Queue

### Why BullMQ over JSON file queue

| Concern | JSON file | BullMQ (Redis) |
|---------|-----------|----------------|
| Concurrent access | File lock contention | Atomic operations |
| Per-tenant isolation | Not possible | Separate queues per tenant |
| Retries | Manual | Built-in with backoff |
| Rate limiting | None | Per-tenant rate limits |
| Priority | Manual sorting | Native priority queues |
| Monitoring | Read file | Bull Board UI |
| Dead letter | None | Automatic DLQ |

### Queue structure

**NOTE**: BullMQ open-source removed `groupKey` rate limiting in v3+. Per-tenant rate limiting requires one of:
- **Option A (chosen)**: Separate BullMQ queue per tenant (`pipeline-{tenantId}`). Simple, no Pro license needed.
- Option B: BullMQ Pro (`QueuePro`/`WorkerPro`) with `groupKey`. Adds license cost.
- Option C: Redis token bucket checked before `queue.add()`. Custom code.

```typescript
// Per-tenant queues — created on tenant registration, destroyed on deletion
function getTenantQueue(tenantId: string): Queue {
  return new Queue(`pipeline-${tenantId}`, {
    connection: redis,
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'exponential', delay: 30_000 }
    }
  })
}

// Shared worker pool processes ALL tenant queues with concurrency limit
// Worker scheduler round-robins across tenant queues
const scheduler = new TenantJobScheduler({
  redis,
  maxConcurrent: 5,            // max 5 pipelines running globally
  maxPerTenant: 2,             // max 2 concurrent per tenant
  async processJob(job) {
    const { tenantId, runId } = job.data
    const tenantCtx = await buildTenantContext(tenantId)
    const queueAdapter = new PostgresQueueAdapter(pool, tenantId)
    const agentRunner = new AgentRunner(tenantCtx)
    const orchestrator = new Orchestrator(queueAdapter, agentRunner, config, events)
    return orchestrator.runFullPipeline(runId)
  }
})
```

`TenantJobScheduler` is a thin wrapper (~100 lines) that:
1. Listens on all `pipeline-*` queues via BullMQ's `Worker` per queue
2. Maintains a `Map<tenantId, number>` of active jobs per tenant
3. Pauses a tenant's worker when it hits `maxPerTenant`
4. Resumes when a job completes
```

### Per-tenant budget enforcement

```typescript
// Before each agent invocation:
const usage = await getUsageThisMonth(tenantId)
const plan = await getTenantPlan(tenantId)

if (usage.totalCostUsd >= plan.monthlyBudgetUsd) {
  throw new BudgetExhaustedError(tenantId, usage, plan)
}

// Agent SDK enforced cap per invocation:
maxBudgetUsd: Math.min(
  config.defaultBudgetPerRunUsd,
  plan.monthlyBudgetUsd - usage.totalCostUsd
)
```

---

## Phase 4: Backend API

### `server/` structure

```
server/
  index.ts                    # Fastify app, CORS, SSE setup
  package.json                # fastify, @fastify/jwt, bullmq, pg, ioredis
  tsconfig.json
  routes/
    auth.ts                   # POST /api/auth/login, /register, /logout
    pipeline.ts               # POST /api/pipeline/run, GET /api/pipeline/:id
    artifacts.ts              # GET /api/artifacts/:id/download (pre-signed URL)
    events.ts                 # GET /api/events/:runId (SSE stream)
    usage.ts                  # GET /api/usage (billing dashboard data)
  services/
    tenant-context.ts         # Builds TenantContext from JWT claims
    pipeline-runner.ts        # Enqueues BullMQ jobs, imports Orchestrator SDK
    event-bus.ts              # Routes PipelineEventEmitter → SSE connections
    artifact-service.ts       # S3 pre-signed URL generation
    usage-tracker.ts          # Aggregates usage metrics
  middleware/
    auth.ts                   # JWT validation, tenant_id extraction
    tenant-scope.ts           # Sets tenant context for all downstream operations
    rate-limit.ts             # Per-tenant API rate limiting
```

### Endpoints

| Method | Path | Auth | Does |
|--------|------|------|------|
| POST | `/api/auth/register` | Public | Creates tenant + first user |
| POST | `/api/auth/login` | Public | Returns JWT (15min) + refresh token (7d) with `tenantId` claim |
| POST | `/api/auth/refresh` | Refresh token | Returns new JWT. Client auto-refreshes on 401. Prevents SSE drops during long pipeline runs. |
| POST | `/api/pipeline/run` | JWT | Enqueues pipeline job |
| GET | `/api/pipeline` | JWT | Lists tenant's pipeline runs |
| GET | `/api/pipeline/:id` | JWT | Pipeline run detail + stages |
| GET | `/api/pipeline/:id/artifacts` | JWT | List artifacts for a run |
| GET | `/api/artifacts/:id/download` | JWT | Pre-signed S3 download URL |
| GET | `/api/events/:runId` | JWT | SSE real-time event stream |
| GET | `/api/usage` | JWT | Monthly usage + cost breakdown |
| POST | `/api/pipeline/:id/cancel` | JWT | Cancel running pipeline |

**Tenant scoping**: Every endpoint extracts `tenantId` from JWT. The middleware sets tenant context on the DB connection. RLS does the rest. Even a compromised endpoint cannot access another tenant's data.

### SSE with JWT auth

Native `EventSource` doesn't support headers. Use `@microsoft/fetch-event-source`:

```typescript
// Client-side
import { fetchEventSource } from '@microsoft/fetch-event-source'

fetchEventSource(`/api/events/${runId}`, {
  headers: { Authorization: `Bearer ${jwt}` },
  onmessage(ev) {
    const event = JSON.parse(ev.data)
    updatePipelineUI(event)
  }
})
```

---

## Phase 5: Frontend UI

### `ui/` structure

```
ui/
  package.json                # react, react-router-dom, vite, tailwindcss
  vite.config.ts
  src/
    App.tsx                   # Routes: /login, /register, /dashboard, /new, /pipeline/:id, /usage
    api/
      client.ts              # Fetch wrapper with JWT
      sse.ts                 # @microsoft/fetch-event-source wrapper
    pages/
      LoginPage.tsx
      RegisterPage.tsx
      DashboardPage.tsx       # Pipeline runs table
      NewRequestPage.tsx      # Describe what to automate
      PipelineDetailPage.tsx  # Real-time progress via SSE
      UsagePage.tsx           # Monthly cost + runs + storage
    components/
      PipelineTimeline.tsx    # Vertical stage progression
      StageCard.tsx           # Stage status with duration
      ArtifactList.tsx        # Downloadable artifacts
      CostBadge.tsx           # Per-run cost indicator
```

### Pages

1. **LoginPage / RegisterPage**: Email/password. JWT stored in httpOnly cookie.
2. **DashboardPage**: Table of pipeline runs — Feature | Status | Cost | Last Updated. Click row → detail.
3. **NewRequestPage**: Text area: "Describe the page you want automated." Module picker. Target URL input. Submit → enqueues job.
4. **PipelineDetailPage**: SSE-connected timeline. Shows: stage progression, audit loop counter ("Attempt 2 of 3"), duration per stage, cost accumulator. Terminal states: Done (green) or Needs Review (red).
5. **UsagePage**: Monthly runs, total cost, storage used, budget remaining.

### What the UI exposes (safe)

- Pipeline status (stage names, durations, pass/fail)
- Downloadable artifacts (specs, reports, test results)
- Cost per run and monthly totals
- Error summaries (high-level, not stack traces)

### What the UI NEVER exposes

- Agent prompts or system instructions
- Internal audit findings detail (only "passed" or "needs review")
- Pipeline orchestration logic
- Queue internals, convergence data
- Other tenants' data (RLS prevents this at DB level)

---

## Phase 6: Data Lifecycle Management

### Retention Schedule

| Data Type | Hot (PostgreSQL) | Warm (S3 Standard-IA) | Cold (S3 Glacier) | Delete After |
|-----------|------------------|-----------------------|-------------------|-------------|
| Pipeline run metadata | 2 years | 3 years | Indefinite | Never (archive) |
| Agent execution logs | 30 days | 90 days | 1 year | 2 years |
| Generated test specs | Current version | All versions, 3 years | Indefinite | Never (client IP) |
| Test case docs | Current version | All versions, 3 years | Indefinite | Never (client IP) |
| Test results (structured) | 90 days | 1 year | 3 years | 3 years |
| Test results (binary: screenshots, traces) | 30 days | 90 days | N/A | 1 year |
| Audit reports | 2 years | 5 years | Indefinite | Never (compliance) |
| Requirements docs | While active | 3 years post-project | Indefinite | Never (client IP) |
| Error logs | 14 days | 90 days | 1 year | 1 year |
| Debug artifacts (HAR, browser traces) | 7 days | 30 days | N/A | 90 days |
| Billing/usage data | Current + 1 year | 3 years | 7 years | Never (legal) |
| User session data | Session + 30 days | N/A | N/A | 30 days |
| Pipeline events (SSE history) | 30 days | N/A | N/A | 90 days |

### Automated Cleanup

**PostgreSQL**: High-volume tables (`agent_execution_logs`, `pipeline_events`, `audit_logs`) partitioned by month using `pg_partman`. Old partitions exported to S3, then dropped.

**S3 Lifecycle Rules**:
- `debug/` prefix: Standard → delete after 90 days
- `reports/` prefix: Standard → Standard-IA at 90 days → Glacier at 1 year
- `specs/` prefix: Standard → Standard-IA at 1 year (never delete)
- `billing/` prefix: Standard → Glacier Deep Archive at 1 year (never delete)

**GDPR erasure**: Anonymize billing records (redact personal fields, keep financial data). Delete everything else. Log the erasure request permanently (ironic but legally required).

### Cost Monitoring Per Tenant

`usage_metrics` table tracks daily:
- `pipeline_runs_count`
- `tokens_consumed` (input + output)
- `compute_minutes`
- `storage_bytes` (S3 hot + warm + cold)
- `total_cost_usd` (computed)

Dashboard view: per-tenant monthly cost breakdown. Alert at 80% of budget.

---

## Phase 7: IP Protection Architecture

### Three-Tier Access Model

| Tier | Contains | Audience | Location |
|------|----------|----------|----------|
| **Tier 1: Full Repo** | Everything: agents, pipeline, orchestrator, server, UI source | Internal team | Private git |
| **Tier 2: Client Artifacts** | Generated specs, page objects, test results, CI configs | Client DevOps | S3 downloads via UI |
| **Tier 3: Client UI** | Web application (dashboard, pipeline view) | Client end users | Our hosted infrastructure |

### What constitutes IP (NEVER exposed)

1. **Agent prompts** — `.github/agents/*.agent.md`
2. **Pipeline orchestration** — `src/orchestrator/`, `scripts/`
3. **Agent rules registry** — `agent-mistakes.md`, `agent-performance.json`
4. **Audit methodology** — convergence guards, remediation parsing logic
5. **Quality gates** — `validation-gates.ts`, pre-run/post-complete scripts
6. **Context injection** — `task-context-builder.ts`, `injectedContext` format
7. **Trust/promotion system** — agent-performance trust levels

### Artifact sanitization before client delivery

```typescript
function sanitizeForClient(artifact: Artifact): ClientArtifact {
  // Strip internal comments (lines containing INTERNAL, AGENT, PIPELINE)
  // Strip injectedContext references
  // Strip audit finding IDs and internal severity classifications
  // Keep: test code, assertions, page objects, pass/fail results
  return sanitized
}
```

### Error messages to clients

- **Generic**: "Pipeline completed successfully" / "Pipeline needs review"
- **Safe details**: Test pass/fail counts, duration, list of generated files
- **NEVER expose**: Stack traces, agent prompts, internal error codes, file paths on our server, queue state, convergence data

---

## Cross-Tenant Isolation — Complete Edge Case Analysis

### Edge Case 1: Agent reads wrong tenant's files

**Prevention**: Each tenant's workspace is a Docker volume mounted at `/workspaces/{tenantId}/{runId}`. Agent SDK `cwd` is set to this path. `disallowedTools` blocks `Bash`, `WebSearch`, `WebFetch`. `permissionMode: 'acceptEdits'` auto-approves only file operations. Symlinks disabled at volume mount options.

### Edge Case 2: Agent writes to wrong tenant's S3 prefix

**Prevention**: `ArtifactService` generates S3 keys with hardcoded tenant prefix. The `putObject` call constructs the key as `tenants/${tenantId}/runs/${runId}/...`. There is no user-controlled path component. The S3 IAM policy further restricts the app role to `tenants/*` prefix patterns.

### Edge Case 3: Database query returns wrong tenant's rows

**Prevention**: PostgreSQL RLS. The app connects as `app_user` (non-superuser). RLS policies are `FORCE`d. Even if application code forgets a WHERE clause, the DB returns only the current tenant's rows. The tenant context is set via `SET LOCAL` inside a transaction — it cannot leak via connection pool.

### Edge Case 4: SSE stream leaks events from another tenant

**Prevention**: SSE connections are keyed by `(tenantId, runId)`. The event bus filters events by tenantId before sending. The pipeline run itself is tenant-scoped — events only fire for that tenant's run.

### Edge Case 5: Tenant A's agent invokes MCP tool targeting Tenant B's URL

**Prevention**: MCP server config is constructed per-invocation with the tenant's `targetUrl`. Agent cannot override MCP config. No other MCP servers are available (strict mode).

### Edge Case 6: Agent prompt injection — malicious input in requirements text

**Prevention**: The actual defense is workspace `cwd` restriction combined with `disallowedTools` blocking `Bash`/`WebSearch`/`WebFetch`. The worst an injected prompt can do is read/write files within the tenant's own isolated workspace — which is acceptable since that's what the agent is supposed to do. `maxTurns` (15) and `maxBudgetUsd` are secondary cost controls. Requirements text is passed as a user message (not system prompt), but this alone is not sufficient defense — the tool restrictions are.

### Edge Case 7: One tenant's long-running pipeline starves others

**Prevention**: `TenantJobScheduler` enforces max 2 concurrent jobs per tenant via per-tenant BullMQ queues. Global concurrency: 5. If one tenant queues 10 jobs, only 2 run at a time. Other tenants' queues are serviced in round-robin. (Note: BullMQ open-source `groupKey` was removed in v3 — per-tenant queues is the correct approach.)

### Edge Case 8: Tenant cancels mid-pipeline — cleanup

**Prevention**: `cancelPipeline()` calls `agentRunner.cancelRun(runId)` which triggers the `AbortController.abort()` on the in-process Agent SDK generator. Run is marked `cancelled` in DB. Workspace volume is deleted. Partial artifacts are NOT synced to S3 — only completed runs produce downloadable artifacts.

### Edge Case 9: Billing dispute — tenant claims wrong charges

**Prevention**: Every agent invocation records `tokensUsed` and `costUsd` in `agent_steps` table with RLS. `usage_metrics` aggregates daily. Full audit trail from run → step → token count → cost.

### Edge Case 10: Tenant deletes account — data residue

**Prevention**: GDPR erasure workflow deletes all tenant data except anonymized billing records and erasure request logs. S3 objects deleted by prefix (`tenants/{tenantId}/`). PostgreSQL rows deleted by `tenant_id` (cascade).

---

## Cost Optimization Strategy

### Model routing (biggest lever)

| Task | Model | Cost/MTok (in/out) | Why |
|------|-------|-------------------|-----|
| Requirements parsing | Haiku 4.5 | $1/$5 | Simple text extraction |
| Test case planning | Sonnet 4.6 | $3/$15 | Needs reasoning |
| Spec generation | Sonnet 4.6 | $3/$15 | Code generation sweet spot |
| Spec healing | Sonnet 4.6 | $3/$15 | Debugging needs reasoning |
| Audit evaluation | Haiku 4.5 | $1/$5 | Checklist evaluation |

### Prompt caching

Agent system prompts (`.agent.md` files) are identical across all tenants. Cache the system prompt once, reuse across invocations. Cache reads cost 0.1x base price — 90% savings on input tokens for the system prompt portion.

### Budget caps

- Per-invocation: `maxBudgetUsd` on every Agent SDK call
- Per-run: Sum of all agent costs checked before each step
- Per-tenant-monthly: Checked before job is enqueued
- Global: Redis counter for total spend, hard-stop at threshold

### Batch API (future optimization, not v1)

The Anthropic Batch API offers 50% discount with 24h latency. This is NOT suitable for live pipeline runs (clients watch SSE streams). Potential future use: scheduled nightly re-audits of existing specs, bulk regression analysis, or tenant-initiated "deep audit" mode with explicit opt-in for delayed delivery. Not implemented in v1 — all pipeline stages run synchronously via the standard API.

---

## Files Summary

### New Files

| File | Purpose |
|------|---------|
| `src/orchestrator/types.ts` | Contract types with tenantId on everything |
| `src/orchestrator/queue-adapter.ts` | QueueAdapter interface + FileQueueAdapter + PostgresQueueAdapter |
| `src/orchestrator/stage-machine.ts` | Consolidated stage logic |
| `src/orchestrator/audit-remediation-parser.ts` | Parse audit markdown → AuditRemediation[] |
| `src/orchestrator/audit-loop.ts` | Audit → remediate → re-audit with convergence + budget guards |
| `src/orchestrator/events.ts` | PipelineEventEmitter |
| `src/orchestrator/agent-runner.ts` | Claude Agent SDK wrapper with tenant isolation |
| `src/orchestrator/orchestrator.ts` | Main SDK entry point |
| `src/orchestrator/agent-prompts.ts` | Extract .agent.md → structured prompt data |
| `server/**` | Fastify backend (tenant-scoped, imports SDK) |
| `ui/**` | React + Vite + Tailwind frontend |
| `db/migrations/**` | PostgreSQL schema + RLS policies |
| `db/seed.sql` | Default retention policies, admin tenant |
| `docker/agent-workspace/Dockerfile` | Isolated workspace container |

### Modified Files

| File | Change |
|------|--------|
| `src/index.ts` | Add orchestrator exports to barrel |
| `scripts/shared-types.ts` | Add tenant fields, re-export from orchestrator/types |
| `config/pipeline-config.json` | Add auditLoop, models, defaultBudgetPerRunUsd |
| `package.json` | Add server:start, ui:dev, db:migrate scripts |
| `.gitignore` | Add server/node_modules, ui/node_modules, /workspaces |

---

## Build Sequence

| # | Task | Test | Depends On |
|---|------|------|------------|
| 1 | PostgreSQL schema + RLS policies + migrations | `db:migrate` runs clean, RLS cross-tenant test (insert A, query B = 0 rows) | — |
| 2 | Docker volume workspace setup + `encore-test-runner-mcp` | Create volume, mount, verify path restriction, run test via MCP | — |
| 3 | `src/orchestrator/types.ts` + `queue-adapter.ts` (both impls) | Unit test: FileAdapter + PostgresAdapter both pass same test suite | #1 |
| 4 | `src/orchestrator/stage-machine.ts` | Unit test: every stage maps correctly | — |
| 5 | `src/orchestrator/agent-runner.ts` + `agent-prompts.ts` | Integration test: Agent SDK call with mock workspace + volume | #1, #2 |
| 6 | `src/orchestrator/audit-remediation-parser.ts` | Run against existing audit reports, verify stable finding IDs | — |
| 7 | `src/orchestrator/audit-loop.ts` + `events.ts` (PipelineEventBus) | Unit test: convergence guards, budget guard, Redis pub/sub | #3, #5, #6 |
| 8 | `src/orchestrator/orchestrator.ts` | Integration test: mock adapter → full pipeline cycle | #3-#7 |
| 9 | BullMQ per-tenant queues + TenantJobScheduler | Job enqueue → process → complete, verify per-tenant concurrency limit | #8 |
| 10 | `server/` backend (Fastify + Redis sub + SSE) | curl all endpoints, verify RLS, verify SSE via Redis pub/sub, JWT refresh | #8, #9 |
| 11 | S3 integration + pre-signed URLs + artifact sanitization | Upload, download via pre-signed URL, verify tenant prefix isolation | #10 |
| 12 | `ui/` frontend | Full flow: register → login → describe → run → watch → download → usage | #10 |
| 13 | Data lifecycle automation (pg_partman + S3 lifecycle + cleanup cron) | Partitions create/drop correctly, S3 objects transition | #1, #11 |

**Note on gate scripts**: Existing pre-run/post-complete gate scripts (`requirements-pre-run.ts`, `generator-post-complete.ts`, etc.) run inside the orchestrator process as regular TypeScript function calls — NOT inside the agent's tool sandbox. The `disallowedTools: ['Bash']` restriction applies only to the Claude agent's tool use, not to the orchestrator's own Node.js execution.

---

## Risk Analysis

| # | Risk | Severity | Mitigation |
|---|------|----------|-----------|
| 1 | RLS policy misconfigured — data leak | CRITICAL | Test suite: insert as Tenant A, query as Tenant B, assert zero rows. Run on every migration. |
| 2 | Agent escapes workspace via path traversal | CRITICAL | Docker volume isolation. No Bash tool in production. Agent SDK `cwd` restriction. Symlinks disabled. |
| 3 | Claude Agent SDK rate limits during peak | HIGH | BullMQ per-tenant rate limiter. Queue jobs, don't fail them. Exponential backoff on 429s. |
| 4 | Single pipeline run costs more than expected | HIGH | `maxBudgetUsd` per invocation + per-run + per-tenant caps. Kill switch at global level. |
| 5 | Agent prompt injection via user requirements | HIGH | Requirements are user messages, not system prompts. Tool approval hooks. maxTurns cap. No Bash. |
| 6 | Audit markdown format varies | MEDIUM | Parser falls back to `[]`. Pipeline completes without audit loop — safe degradation. |
| 7 | S3 lifecycle deletes data still needed | MEDIUM | Retention policies table with per-tenant overrides. Legal hold mechanism blocks lifecycle transitions. |
| 8 | SSE connection leaks cross-tenant events | MEDIUM | Events keyed by (tenantId, runId). Event bus filters before sending. Integration test verifies. |
| 9 | PostgreSQL partition maintenance fails | MEDIUM | pg_partman with premake=3 (3 months ahead). Alert on partition creation failure. |
| 10 | Workspace disk fills up | MEDIUM | Post-pipeline cleanup job. Monitor disk usage. Alert at 80%. |

### Capacity Model (v1 single worker pool)

| Metric | Value |
|--------|-------|
| Avg pipeline duration | 15-30 min (5 agents + up to 3 audit loops) |
| Worker concurrency | 5 simultaneous pipelines |
| Max per-tenant concurrency | 2 |
| Throughput | ~10-20 completed pipelines/hour |
| Max active tenants before queuing >30 min | ~30 tenants (assuming 1 run/day each, clustered in business hours) |
| Scaling trigger | Avg queue wait time >15 min consistently → add worker nodes |

At 50+ tenants, move to Kubernetes with auto-scaling workers based on queue depth.

### What This Plan Does NOT Cover

- Granular RBAC beyond tenant-admin/tenant-member
- UI deployment strategy (Vercel/CloudFront/etc.) — separate infrastructure decision
- CI/CD pipeline for server/frontend deployments
- Mobile responsive design (desktop-first v1)
- Notification system (email/Slack on completion)
- Custom domain per tenant
- SSO/SAML enterprise auth (JWT with email/password for v1)
- Horizontal scaling of worker nodes (single worker pool for v1, Kubernetes for v2)

### Upgrade Paths (Future)

| When | What | Why |
|------|------|-----|
| 50+ tenants | Replace BullMQ with Inngest AgentKit | Durable execution, built-in multi-tenancy, serverless scaling |
| 100+ tenants | Add Kubernetes for worker pool | Horizontal scaling, auto-scaling based on queue depth |
| Enterprise client | Dedicated database + infrastructure | Compliance requirement — RLS escape hatch |
| Cost >$5K/month on LLM | Negotiate enterprise API pricing with Anthropic | Volume discounts |
| Agent quality mature | Add self-serve test editing in UI | Clients tweak generated tests without our intervention |

---

## Eliminated Mistakes from v1 Plan

| Source | v1 Mistake | v2 Fix |
|--------|-----------|--------|
| v1 | Multi-tenancy "deferred" — add clientId later | Tenant isolation is foundational, designed from day 1 with RLS |
| v1 | FileQueueAdapter as production default | PostgresQueueAdapter as production default, file for dev only |
| v1 | No data lifecycle — unbounded growth | Full retention schedule + automated archival + per-tenant cost tracking |
| v1 | Claude CLI invocation (`claude -p`) | Claude Agent SDK — in-process, commercial terms, streaming, hooks |
| v1 | No cost tracking or budget enforcement | Per-invocation, per-run, per-tenant, and global budget caps |
| v1 | Express backend | Fastify (2x faster, built-in schema validation, better TypeScript support) |
| v1 | No workspace isolation | Docker volumes per tenant workspace |
| v1 | JSONL file signals | PostgreSQL pipeline_events table + in-process EventEmitter |
| v1 | No IP protection strategy | Three-tier access model + artifact sanitization + never-expose list |
| v1 | No edge case analysis for cross-tenant | 10 documented edge cases with specific prevention mechanisms |
| v1 | Consumer subscription cost dodge | API billing under commercial terms — proper legal standing |

---

## Appendix: v3 Audit Resolution Log

21 findings from self-audit. All resolved in v3 revision.

| # | Severity | Finding | Resolution |
|---|----------|---------|------------|
| 1 | CRITICAL | `query()` returns async generator, not awaitable | Rewrote `agent-runner.ts` to use `for await` loop, extract cost from `message.type === 'result'` |
| 2 | CRITICAL | BullMQ `groupKey` is Pro-only (removed in v3 OSS) | Switched to per-tenant queues (`pipeline-{tenantId}`) with `TenantJobScheduler` wrapper |
| 3 | CRITICAL | No Bash tool means agents can't run tests | Created `encore-test-runner-mcp` custom MCP server for sandboxed test execution |
| 4 | CRITICAL | `allowedTools` is auto-approve, not whitelist | Switched to `disallowedTools` + `permissionMode: 'acceptEdits'` for proper tool blocking |
| 5 | HIGH | `current_setting()` throws on unset GUC | Added `missing_ok=true` parameter, `CHECK (tenant_id IS NOT NULL)` constraint |
| 6 | HIGH | Docker container vs volume ambiguity | Clarified: volume-based isolation (not container-per-run). Documented rationale. |
| 7 | HIGH | SSE events can't cross worker↔API process boundary | Added Redis pub/sub as cross-process event bridge. PostgreSQL for audit only. |
| 8 | HIGH | Plain `systemPrompt` replaces all Claude Code built-ins | Changed to `{ type: 'preset', preset: 'claude_code', append: ... }` |
| 9 | HIGH | `cancelPipeline()` sends SIGTERM to non-existent process | Changed to `AbortController.abort()` on in-process Agent SDK generator |
| 10 | MEDIUM | PgBouncer `DISCARD ALL` interferes with transaction mode | Changed `server_reset_query` to empty string. Added lint rule banning session-scoped `SET`. |
| 11 | MEDIUM | Model names "haiku"/"sonnet" are CLI aliases | Changed to full API model IDs: `claude-haiku-4-5`, `claude-sonnet-4-6` |
| 12 | MEDIUM | Finding ID stability not specified | Defined content-based hashing: `SHA256(severity + category + agent)` truncated to 8 hex |
| 13 | MEDIUM | Batch API contradicts real-time SSE requirement | Moved Batch API to "future optimization" section with explicit opt-in design |
| 14 | MEDIUM | EventEmitter→PostgreSQL write path unspecified | Specified: Redis pub/sub for live streaming, PostgreSQL for audit trail (best-effort, non-blocking) |
| 15 | MEDIUM | `withTenantContext` wrapping full pipeline = 30-min transaction | Added explicit rule: short transactions only. Pipeline loop is NOT inside a transaction. |
| 16 | MEDIUM | Docker isolation after UI in build sequence | Moved workspace setup to build step #2 (security-critical, prerequisite for agents) |
| 17 | MEDIUM | No JWT refresh — SSE drops mid-pipeline | Added `/api/auth/refresh` endpoint with 7-day refresh token. Client auto-refreshes on 401. |
| 18 | LOW | Gate scripts invocation unspecified | Clarified: gate scripts run in orchestrator process, not inside agent tool sandbox |
| 19 | LOW | S3 IAM policy not defined | Noted for implementation — application-layer prefix construction + IAM policy on deploy |
| 20 | LOW | No capacity model | Added capacity model table: ~30 tenants max before queuing, scaling trigger defined |
| 21 | LOW | Prompt injection mitigation explanation wrong | Corrected: actual defense is `cwd` + `disallowedTools`, not user-message positioning |
