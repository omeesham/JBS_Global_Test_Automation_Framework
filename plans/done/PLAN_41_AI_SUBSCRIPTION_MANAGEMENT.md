# PLAN 41: AI Subscription Management (Multi-Tenant, Dual-Mode)

## Context

**Problem:** Each client organization gets their own Claude subscription. The platform must support **both** CLI-based (Max subscription, cost-efficient) and API-based (pay-per-token, flexible) execution per client — configurable by super admin. Currently everything runs on a single CLI login with zero client isolation.

**Key constraints:**
1. **Support both CLI and API** — nothing is decided yet, need to handle whatever is chosen per client
2. **CLI is preferred** (saves cost) — separate workers per client, each logged into their own Claude account
3. **API as fallback** — when CLI limits hit or more capacity needed, switch to API keys
4. **Total secrecy** — client-side users (client_admin, qa_engineer) must NEVER know what AI model we use. Only super_admin and internal admins configure Claude.
5. **Claude's own rate limits** — Max subscription has weekly/daily limits. Handle gracefully. Extra billing (API) if needed.

**What exists:**
- `agentRunner: 'cli' | 'sdk'` switch in types + worker (SDK is a stub at `src/worker/index.ts:305`)
- Single shared task queue with zero client isolation
- JIRA integration pattern (service → routes → frontend) as reference
- Multi-tenant DB schema (`JBSTestOpsAI` admin + `tenant_*`)
- Docker compose with only Postgres (no worker containers)

---

## Architecture

### Dual-Mode Execution Per Client

```
Super Admin configures per client:
┌─────────────────────────────────────────────────────┐
│  Client: Hilton Hotels                              │
│  AI Mode: [CLI] / [API] / [CLI + API overflow]      │
│                                                     │
│  CLI Config:                                        │
│    Worker ID: worker-hilton-1                        │
│    Claude Account: hilton-qa@jbs.com                 │
│    Status: ● Active (logged in)                     │
│                                                     │
│  API Config (optional):                             │
│    API Key: sk-ant-***...xY                         │
│    Monthly Budget: $50.00                            │
│    Status: ● Valid                                  │
│                                                     │
│  Overflow: When CLI hits rate limit → use API        │
└─────────────────────────────────────────────────────┘
```

### Three Execution Modes (per client)

| Mode | How | Cost | When to Use |
|---|---|---|---|
| `cli` | Dedicated worker with isolated Claude auth | $20/mo flat (Max sub) | Default, cost-efficient |
| `api` | Shared worker pool, per-client API key | Pay-per-token | High volume, no rate limits |
| `cli_with_api_overflow` | CLI primary, auto-fallback to API on rate limit | $20/mo + overflow tokens | Best of both worlds |

### Worker Architecture

```
┌─────────── Server ───────────────────────────────┐
│                                                   │
│  ┌── CLI Workers (1 per client) ──────────────┐  │
│  │                                             │  │
│  │  worker-hilton (CLAUDE_HOME=/workers/hilton) │  │
│  │  worker-encore (CLAUDE_HOME=/workers/encore) │  │
│  │  worker-marriott (CLAUDE_HOME=/workers/marr) │  │
│  │                                             │  │
│  │  Each polls: /api/worker/next-task?client=X │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
│  ┌── API Worker Pool (shared) ────────────────┐  │
│  │                                             │  │
│  │  worker-api-1  (resolves API key per task)  │  │
│  │  worker-api-2  (resolves API key per task)  │  │
│  │                                             │  │
│  │  Each polls: /api/worker/next-task?mode=api │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
│  ┌── Worker Manager ─────────────────────────┐   │
│  │  Tracks: which workers exist, their status │   │
│  │  Auto-restart on crash                     │   │
│  │  Health checks every 30s                   │   │
│  │  CLI rate limit detection → overflow to API │  │
│  └────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────┘
```

### Client Secrecy

The word "Claude" appears **nowhere** in client-facing UI:
- Client users see "AI" or "IntelliQE AI"
- Settings for AI config: **super_admin only** (hidden from client_admin, qa_engineer)
- Cost displayed as "credits" or hidden entirely (already configurable via `platform_settings.cost_visibility`)
- Model names abstracted: "fast" / "balanced" / "powerful" (not haiku/sonnet/opus)

---

## Implementation

### Phase 1: Database Foundation

**1a. Migration: `website/backend/src/db/migrations/002_ai_subscriptions.sql`** (NEW)
- Named "ai_subscriptions" not "claude_subscriptions" — client secrecy extends to DB naming

```sql
-- Per-client AI provider configuration (admin schema)
CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".ai_provider_config (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         UUID NOT NULL UNIQUE REFERENCES "JBSTestOpsAI".clients(id),

  -- Execution mode
  execution_mode    VARCHAR(30) DEFAULT 'cli',  -- 'cli' | 'api' | 'cli_with_api_overflow'

  -- CLI config
  cli_worker_id     VARCHAR(100),               -- assigned worker identifier
  cli_account_email VARCHAR(200),               -- Claude account email (for admin reference)
  cli_auth_status   VARCHAR(50) DEFAULT 'not_configured', -- not_configured|authenticated|expired|rate_limited
  cli_config_path   TEXT,                       -- path to isolated Claude config dir

  -- API config
  api_key_enc       TEXT,                       -- AES-256-GCM encrypted API key
  api_key_hint      VARCHAR(20),                -- "sk-ant-...xY"
  api_status        VARCHAR(50) DEFAULT 'not_configured',
  api_monthly_budget_usd NUMERIC(10,2),
  api_current_month_usd  NUMERIC(10,2) DEFAULT 0,

  -- General
  preferred_model   VARCHAR(50) DEFAULT 'sonnet',
  max_concurrent_tasks INTEGER DEFAULT 1,
  configured_by     VARCHAR(100),
  last_health_check TIMESTAMPTZ,
  health_error      TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Worker registry
CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".worker_registry (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id       VARCHAR(100) UNIQUE NOT NULL,  -- e.g., 'worker-hilton-1'
  client_id       UUID REFERENCES "JBSTestOpsAI".clients(id), -- NULL = shared API worker
  worker_type     VARCHAR(30) NOT NULL,          -- 'cli_dedicated' | 'api_shared'
  status          VARCHAR(50) DEFAULT 'offline', -- offline|online|busy|error
  last_heartbeat  TIMESTAMPTZ,
  host_info       JSONB,                         -- OS, CPU, memory (for monitoring)
  config          JSONB,                         -- runtime config overrides
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking (source-agnostic, no "Claude" in naming)
CREATE TABLE IF NOT EXISTS "JBSTestOpsAI".ai_usage_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES "JBSTestOpsAI".clients(id),
  worker_id       VARCHAR(100),
  source          VARCHAR(50) NOT NULL,          -- 'pipeline' | 'chatbot'
  source_id       VARCHAR(100),
  execution_mode  VARCHAR(30),                   -- 'cli' | 'api'
  model           VARCHAR(50),
  input_tokens    INTEGER DEFAULT 0,
  output_tokens   INTEGER DEFAULT 0,
  cost_usd        NUMERIC(10,6) DEFAULT 0,
  rate_limited    BOOLEAN DEFAULT false,         -- was this a rate-limited request?
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_client ON "JBSTestOpsAI".ai_usage_log(client_id);
CREATE INDEX idx_ai_usage_created ON "JBSTestOpsAI".ai_usage_log(created_at);
CREATE INDEX idx_worker_registry_client ON "JBSTestOpsAI".worker_registry(client_id);
```

**1b. Add `client_id` to pipeline tables**
- **File:** `src/server/db/schema.sql` (MODIFY)
- Add `client_id VARCHAR(100)` to `pipeline_runs` table
- Add `client_id VARCHAR(100)` to `worker_tasks` table (denormalized for fast filtering)

**1c. AES-256-GCM encryption utility**
- **File:** `website/backend/src/utils/crypto-aes.ts` (NEW)
- `encryptAtRest(plaintext)` / `decryptAtRest(encrypted)` using `ENCRYPTION_SECRET` env var
- Node.js built-in `crypto` module, zero dependencies

**1d. Run migration on startup**
- **File:** `website/backend/src/db.ts` (MODIFY)

### Phase 2: AI Provider Service

**File:** `website/backend/src/services/ai-provider.service.ts` (NEW)
- Named "ai-provider" not "claude" — secrecy

Core functions:

```typescript
// Configuration CRUD
saveConfig(clientId, mode, cliConfig?, apiConfig?, configuredBy)
getConfig(clientId) → AiProviderConfig (never raw key)
updateConfig(clientId, updates)
deleteConfig(clientId)
getAllConfigs() → AiProviderConfig[] (super_admin)

// API key management
saveApiKey(clientId, apiKey) → encrypt + store + hint
getApiKeyForClient(clientId) → decrypted key (internal)
validateApiKey(clientId) → test against Anthropic API

// CLI worker management
registerWorker(workerId, clientId?, type)
updateWorkerStatus(workerId, status)
getWorkerForClient(clientId) → WorkerInfo | null
getWorkerHeartbeats() → all workers' last heartbeat

// Execution routing
resolveExecutionMethod(clientId) → { mode, apiKey?, workerId? }
handleRateLimit(clientId) → trigger overflow to API if configured

// Usage tracking
recordUsage(clientId, source, model, tokens, cost, rateLimited?)
getUsageSummary(clientId, period?) → { total, bySource, byModel }
checkBudget(clientId) → { allowed, remaining, mode }

// Health checks
runHealthCheck(clientId) → { cli: status, api: status }
```

### Phase 3: API Routes

**File:** `website/backend/src/routes/ai-provider.routes.ts` (NEW)

| Method | Endpoint | Role | Purpose |
|---|---|---|---|
| GET | `/api/ai/configs` | super_admin | List all clients' AI configs |
| GET | `/api/ai/config/:clientId` | super_admin | Get single client's config |
| POST | `/api/ai/config` | super_admin | Create/update AI config for client |
| DELETE | `/api/ai/config/:clientId` | super_admin | Remove AI config |
| POST | `/api/ai/validate-api-key/:clientId` | super_admin | Test API key validity |
| POST | `/api/ai/validate-cli/:clientId` | super_admin | Check CLI worker auth status |
| GET | `/api/ai/usage/:clientId` | super_admin | Usage breakdown |
| GET | `/api/ai/workers` | super_admin | Worker registry status |
| POST | `/api/ai/workers/register` | worker (WORKER_SECRET) | Worker self-registration |
| PUT | `/api/ai/workers/:workerId/heartbeat` | worker (WORKER_SECRET) | Heartbeat |
| GET | `/api/ai/internal/resolve/:clientId` | worker (WORKER_SECRET) | Get execution config for task |

**Register:** `website/backend/src/index.ts` (MODIFY) — add routes

### Phase 4: Task Routing (Client-Aware)

**4a. Encore server modifications**
- **File:** `src/server/routes/pipeline.ts` (MODIFY)
  - Accept `clientId` in create-run request body
  - Store in `pipeline_runs.client_id`
- **File:** `src/server/routes/worker.ts` (MODIFY)
  - Accept `?client_id=X` query param on `/api/worker/next-task`
  - Filter tasks: `WHERE client_id = $1` (if provided) or `WHERE client_id IS NULL` (shared pool)
  - Include `clientId` in task response
- **File:** `src/server/db/queries.ts` (MODIFY)
  - Update `claimNextTask` to filter by client_id
  - Update `createRun` to accept client_id
- **File:** `scripts/shared-types.ts` (MODIFY)
  - Add `clientId?: string` to `TaskResponse` and `CreatePipelineRequest`

**4b. Website backend plumbing**
- **File:** `website/backend/src/services/chatbot.service.ts` (MODIFY)
  - When `trigger_run` fires, pass `req.clientId` to Encore create-run endpoint

### Phase 5: Worker Dual-Mode Execution

**File:** `src/worker/index.ts` (MODIFY)

**New env vars for worker:**
```
WORKER_TYPE=cli_dedicated|api_shared    # what kind of worker am I
WORKER_CLIENT_ID=hilton-hotels          # (CLI mode) which client do I serve
CLAUDE_CONFIG_DIR=/workers/hilton       # (CLI mode) isolated Claude auth directory
```

**Changes:**
1. On startup: self-register via `POST /api/ai/workers/register`
2. Task polling: add `?client_id=${CLIENT_ID}` if CLI dedicated worker
3. New function `executeClaudeSdkStage(task, cfg)`:
   - Fetch execution config: `GET /api/ai/internal/resolve/${task.clientId}`
   - Use `@anthropic-ai/sdk` or raw `fetch` to Anthropic Messages API
   - Pass client's API key in `x-api-key` header
   - Parse response, extract token usage
   - Report usage back
4. Rate limit detection in CLI mode:
   - Parse stderr for rate limit messages
   - If detected: call `handleRateLimit(clientId)` → if overflow enabled, re-queue task for API pool
   - Log to `ai_usage_log` with `rate_limited: true`
5. Replace SDK stub (lines 305-311) with real `executeClaudeSdkStage`

**New file:** `src/worker/sdk-executor.ts` (NEW)
- Isolated module for Anthropic API calls
- `callAnthropicAPI(apiKey, model, systemPrompt, userMessage, maxTokens)` → response + usage

### Phase 6: Chatbot Dual-Mode

**File:** `website/backend/src/services/chatbot.service.ts` (MODIFY)

1. New function `callClaudeSDK(systemPrompt, userMessage, model, apiKey, maxTokens)`:
   - `fetch('https://api.anthropic.com/v1/messages', ...)` with client's API key
   - Returns `{ text, usage: { input, output } }`

2. Modify `chatAsk()`:
   - Resolve execution method: `resolveExecutionMethod(req.clientId)`
   - If `api` or `cli_with_api_overflow`: use `callClaudeSDK` with resolved API key
   - If `cli`: use existing `callClaude` (CLI subprocess) — but this uses whatever CLI is logged in on the server
   - Record usage via `recordUsage()`
   - On rate limit from CLI: auto-fallback to API if overflow configured

3. **No new chatbot actions for clients** — Claude config is invisible to them. Only super_admin chatbot actions:
   - `configure_ai_provider` — "Set up AI for a client"
   - `check_ai_status` — "Check AI status for all clients"

### Phase 7: Worker Manager (Process Orchestration)

**File:** `src/worker/worker-manager.ts` (NEW)

This is the **master process** that manages CLI workers:

```typescript
class WorkerManager {
  // Spawn/kill dedicated CLI worker processes
  spawnCliWorker(clientId, claudeConfigDir)
  stopCliWorker(clientId)

  // Health monitoring
  checkWorkerHealth(workerId) → status
  restartUnhealthyWorkers()

  // Rate limit handling
  onRateLimitDetected(clientId) → re-route to API pool

  // Lifecycle
  startAll() → read ai_provider_config, spawn workers for all 'cli' clients
  stopAll() → graceful shutdown
}
```

**Usage:** The worker manager runs as the main process. In docker-compose, it's a single service that internally spawns child processes per client.

### Phase 8: Frontend (Super Admin Only)

**8a. API functions**
- **File:** `website/frontend/src/services/api.ts` (MODIFY)
- Add: `getAiConfigs()`, `saveAiConfig()`, `deleteAiConfig()`, `validateAiApiKey()`, `getAiUsage()`, `getAiWorkers()`

**8b. AI Provider Management Tab**
- **File:** `website/frontend/src/components/settings/AiProviderTab.tsx` (NEW)
- **Visible to:** super_admin ONLY (not even client_admin)
- Shows all clients in a table/card grid:

```
┌─────────────────────────────────────────────────┐
│  AI Provider Configuration                      │
│  ─────────────────────────────────────────────  │
│                                                 │
│  ┌─ Hilton Hotels ──────────────────────────┐  │
│  │ Mode: CLI + API Overflow                  │  │
│  │ CLI Worker: ● Online (worker-hilton-1)    │  │
│  │ API Key: sk-ant-***...xY  ● Valid         │  │
│  │ Usage: $12.30 / $50.00 budget             │  │
│  │ [Configure] [Health Check] [Usage Report] │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌─ Encore Global ──────────────────────────┐  │
│  │ Mode: CLI Only                            │  │
│  │ CLI Worker: ● Online (worker-encore-1)    │  │
│  │ API Key: Not configured                   │  │
│  │ Usage: Unlimited (CLI subscription)       │  │
│  │ [Configure] [Health Check] [Usage Report] │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌─ New Client ─────────────────────────────┐  │
│  │ ⚠ AI not configured                      │  │
│  │ [Set Up AI]                               │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

- Configure modal: mode selector, CLI account email, API key input, budget, preferred model
- Health check: real-time validation button
- Usage report: per-client breakdown (pipeline vs chatbot, by model)

**8c. Register in Settings page**
- **File:** `website/frontend/src/pages/SettingsPage.tsx` (MODIFY)
- Add "AI Provider" tab — role-gated to super_admin only
- Tab label is "AI Provider" (not "Claude") — even admin UI maintains abstraction

### Phase 9: Docker & Deployment

**9a. Docker Compose (dev)**
- **File:** `docker-compose.yml` (MODIFY)
- Add worker-manager service with volume mounts for isolated Claude config dirs

```yaml
worker-manager:
  build: .
  command: node dist/worker/worker-manager.js
  environment:
    - BACKEND_URL=http://encore-api:3001
    - WORKER_SECRET=dev-secret
  volumes:
    - ./workers-config:/workers  # isolated Claude auth dirs per client
  depends_on:
    - postgres
```

**9b. Render (production)**
- **File:** `render.yaml` (MODIFY)
- Add background worker service

```yaml
- type: worker
  name: encore-worker-manager
  runtime: node
  buildCommand: npm ci && npm run build:worker
  startCommand: node dist/worker/worker-manager.js
  envVars:
    - key: BACKEND_URL
      fromService: encore-api
    - key: WORKER_SECRET
      sync: false
    - key: ENCRYPTION_SECRET
      sync: false
```

---

## Rate Limit Handling Flow

```
1. CLI worker executes task for Client X
2. Claude CLI returns rate limit error (stderr: "rate limit" / "too many requests")
3. Worker detects → logs rate_limited=true in ai_usage_log
4. Worker calls handleRateLimit(clientId)
5. If client's mode = 'cli_with_api_overflow':
   a. Resolve API key for client
   b. Re-execute same task via API
   c. Log overflow usage
6. If client's mode = 'cli' (no overflow):
   a. Mark task as 'rate_limited' (new status)
   b. Admin notified
   c. Task retried after backoff (or manually)
```

---

## Security

| Concern | Solution |
|---|---|
| API keys at rest | AES-256-GCM with `ENCRYPTION_SECRET` env var |
| API keys in transit | Existing XOR transit encryption + TLS |
| API keys in responses | Never returned — only `api_key_hint` |
| Worker key access | Internal endpoint with WORKER_SECRET auth |
| Client secrecy | No "Claude" naming in client-facing UI/DB. Labels: "AI", "IntelliQE AI" |
| Role enforcement | super_admin only for all AI config routes |
| CLI auth isolation | Separate `CLAUDE_CONFIG_DIR` per client worker |

---

## Environment Variables (New)

```
# Production
ENCRYPTION_SECRET=<32-byte-hex>          # AES key for API keys at rest
WORKER_TYPE=cli_dedicated|api_shared     # Per worker instance
WORKER_CLIENT_ID=<client-slug>           # Per CLI worker
CLAUDE_CONFIG_DIR=/workers/<client>      # Per CLI worker

# Dev (no changes needed — single CLI login works as-is)
```

---

## File Summary

| Action | File | Phase |
|---|---|---|
| NEW | `website/backend/src/db/migrations/002_ai_subscriptions.sql` | 1 |
| NEW | `website/backend/src/utils/crypto-aes.ts` | 1 |
| NEW | `website/backend/src/services/ai-provider.service.ts` | 2 |
| NEW | `website/backend/src/routes/ai-provider.routes.ts` | 3 |
| NEW | `src/worker/sdk-executor.ts` | 5 |
| NEW | `src/worker/worker-manager.ts` | 7 |
| NEW | `website/frontend/src/components/settings/AiProviderTab.tsx` | 8 |
| MODIFY | `website/backend/src/db.ts` | 1 |
| MODIFY | `src/server/db/schema.sql` | 4 |
| MODIFY | `src/server/routes/pipeline.ts` | 4 |
| MODIFY | `src/server/routes/worker.ts` | 4 |
| MODIFY | `src/server/db/queries.ts` | 4 |
| MODIFY | `scripts/shared-types.ts` | 4 |
| MODIFY | `src/worker/index.ts` | 5 |
| MODIFY | `website/backend/src/services/chatbot.service.ts` | 6 |
| MODIFY | `website/backend/src/index.ts` | 3 |
| MODIFY | `website/frontend/src/services/api.ts` | 8 |
| MODIFY | `website/frontend/src/pages/SettingsPage.tsx` | 8 |
| MODIFY | `docker-compose.yml` | 9 |
| MODIFY | `render.yaml` | 9 |
| MODIFY | `config/pipeline-definition.json` | 5 |

---

## Verification Plan

1. **Migration:** Start backend → verify 3 new tables in `JBSTestOpsAI` schema
2. **Crypto:** Unit test encrypt/decrypt roundtrip
3. **API config:** Super admin creates AI config via API → verify encrypted key in DB, hint visible
4. **API validation:** Call validate endpoint → confirms key works against Anthropic
5. **Task routing:** Create run with clientId → verify worker picks up only its client's tasks
6. **SDK execution:** Set client to `api` mode → trigger pipeline → verify Anthropic API called with correct key
7. **CLI isolation:** Start two CLI workers with different config dirs → verify each uses its own auth
8. **Rate limit overflow:** Simulate CLI rate limit → verify auto-fallback to API
9. **Budget check:** Set budget to $0 → verify API requests blocked with clear error
10. **Secrecy:** Login as client_admin → verify no "Claude" / "AI Provider" tab visible
11. **Usage tracking:** Run pipeline + chat → verify usage logged with correct client, model, tokens
12. **Worker health:** Kill a worker → verify manager detects + restarts
