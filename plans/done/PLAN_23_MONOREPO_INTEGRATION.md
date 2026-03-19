# PLAN 23: Monorepo Integration — JBS IntelliQE Frontend + Encore Framework Backend

## Status: PENDING (Audited & Revised 2026-03-12)

---

## Context

Two codebases must become ONE working local dev environment:

1. **Encore Framework** (our repo) — Playwright test automation framework + Fastify backend (pipeline orchestrator, worker, PostgreSQL). Server currently defaults to `:3001` in code — **must change to `:3100`**.
2. **JBS IntelliQE** (colleague's repo, at `JBSIntelliQE-develop/`) — React SPA frontend (Vite `:5173`) + Express backend (`:3001`) for chat, JIRA, auth, test case storage.

**Primary demo path**: Landing → Login → Chat → JIRA Connect → Story Select → Generate Test Cases → Save → Export → Generate Automation Scripts (triggers Encore pipeline agents)

**Guiding principles**: Minimal invasive changes on both sides. Keep their UX/branding intact. Keep our server/orchestrator/worker untouched. Prioritize best possible outcome for the overall vision.

---

## AUDIT FINDINGS FROM ORIGINAL PLAN 23 (3 Critical, 2 High, 3 Medium)

### CRITICAL:
1. **Port Conflict**: Both backends default to port `3001`. Original plan claims Encore is on `:3100` but `config/environments/.env.server` has `PORT=3001` and `src/server/index.ts:24` defaults to `3001`. **Fix: Phase 3 explicitly changes .env.server PORT to 3100.**
2. **Database Mismatch**: JBS uses `postgres` DB with password `admin` (`backend/src/db.ts`). Encore uses `encore_db` DB with password `postgres` (`.env.server`). **Fix: Phase 3 aligns Encore's DATABASE_URL to `postgres:admin@localhost:5432/postgres`.**
3. **No PostgreSQL Setup**: User has nothing installed — no PG, no dependencies. **Fix: Phase 1 installs PG from scratch.**

### HIGH:
4. **5 Frontend Pages Ignored**: WorkflowsPage (132 LOC, full mock), IntegrationsPage (147 LOC, full mock), AnalyticsPage (163 LOC, full mock), CustomTestSuitePage (175 LOC, full mock), AutomationPage (51 LOC, full mock) — all invisible to original plan. **Fix: Phase 6 documents them; they work as-is with mock data for demo.**
5. **One-Way Adaptation**: Original plan only wires website → framework. Framework doesn't adapt to website. **Acceptable for Phase 0 — framework serves API, website consumes it.**

### MEDIUM:
6. No `.gitignore` updates for new folder structure. **Fix: Phase 2.**
7. No developer workflow guide. **Fix: Phase 4 startup scripts.**
8. Test generation is template-based keyword matching (not AI). Original plan calls it "mock pipeline" which misleads — it's a real (but simple) template engine. **Documented accurately below.**

---

## EXECUTION PHASES (7 Phases, Each Independent & Auditable)

---

### Phase 1: Infrastructure Setup
**Goal**: PostgreSQL + all npm dependencies running from zero.

| Step | Action | Detail |
|------|--------|--------|
| 1.1 | Install PostgreSQL 16 | Via Chocolatey: `choco install postgresql16`, or manual installer, or Docker Compose fallback |
| 1.2 | Set postgres user password to `admin` | `ALTER USER postgres PASSWORD 'admin';` — matches JBS hardcoded config |
| 1.3 | Verify PG running | `psql -U postgres -h localhost -c "SELECT 1"` |
| 1.4 | npm install in root | `npm install` (Encore framework deps: fastify, pg, playwright, etc.) |
| 1.5 | npm install in website/frontend | `cd website/frontend && npm install` (React, Vite, Tailwind, etc.) |
| 1.6 | npm install in website/backend | `cd website/backend && npm install` (Express, pg, zod, etc.) |

**Docker Compose fallback** (if native PG install fails):
```yaml
# docker-compose.yml (root)
version: '3.8'
services:
  postgres:
    image: postgres:16
    ports: ["5432:5432"]
    environment:
      POSTGRES_PASSWORD: admin
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

**Verification**: `psql -U postgres -h localhost -c "SELECT version();"` returns PostgreSQL 16.x

---

### Phase 2: Folder Restructure
**Goal**: Clean monorepo — `website/` for colleague's app, framework at root.

| Step | Action | Detail |
|------|--------|--------|
| 2.1 | Rename `JBSIntelliQE-develop/` → `website/` | `mv JBSIntelliQE-develop website` |
| 2.2 | Update `.gitignore` | Add: `website/frontend/node_modules/`, `website/backend/node_modules/`, `website/frontend/dist/`, `website/backend/dist/` |
| 2.3 | Delete any `JBSIntelliQE-main/` if exists | User confirmed `develop` is correct, `main` is empty |

**Result**:
```
encore_framework/
├── website/                       ← Colleague's React+Express app
│   ├── frontend/                  ← Vite + React (port 5173)
│   │   ├── src/pages/             ← 14 page components
│   │   ├── src/services/api.ts    ← Express API client
│   │   ├── src/types/index.ts     ← TypeScript interfaces
│   │   ├── vite.config.ts         ← Dev server + proxy
│   │   └── package.json
│   ├── backend/                   ← Express API (port 3001)
│   │   ├── src/routes/            ← jira, chat, generate, test-cases, auth
│   │   ├── src/agents/            ← 7 template-based agents (keyword matching)
│   │   ├── src/services/          ← jira.service.ts (AC extraction)
│   │   ├── src/db.ts              ← PostgreSQL pool (JBSTestOpsAI schema)
│   │   └── package.json
│   └── FRONTEND_INTEGRATION_RESPONSE.md
├── src/                           ← Encore framework
│   ├── server/                    ← Fastify API (port 3100)
│   ├── orchestrator/              ← Pipeline engine (schema-driven)
│   ├── worker/                    ← Agent task executor (Claude CLI)
│   ├── pages/                     ← Playwright page objects
│   ├── selectors/                 ← TypeScript selectors (no CSV)
│   └── common/, data/, utils/
├── tests/                         ← Playwright test specs
├── config/                        ← pipeline-definition.json, .env files
├── .github/agents/                ← Agent prompts (.agent.md files)
└── package.json                   ← Framework root
```

**Files changed**: `.gitignore`
**What NOT to move**: `src/server/`, `src/orchestrator/`, `src/worker/` stay at root.

**Verification**: `ls website/frontend/package.json && ls website/backend/package.json` both exist.

---

### Phase 3: Configuration Fixes (CRITICAL)
**Goal**: Fix port conflict + database alignment so both backends can coexist.

| Step | File | Before | After | Why |
|------|------|--------|-------|-----|
| 3.1 | `config/environments/.env.server` | `PORT=3001` | `PORT=3100` | Resolve port conflict with Express |
| 3.2 | `config/environments/.env.server` | `BACKEND_URL=http://localhost:3001` | `BACKEND_URL=http://localhost:3100` | Worker polls correct port |
| 3.3 | `config/environments/.env.server` | `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/encore_db` | `DATABASE_URL=postgresql://postgres:admin@localhost:5432/postgres` | Match JBS credentials (`admin`) + DB name (`postgres`) |
| 3.4 | `config/environments/.env.server` | `CORS_ORIGIN=http://localhost:5173` | `CORS_ORIGIN=http://localhost:5173,http://localhost:3000` | Allow frontend access (already correct, verify) |

**Result after Phase 3**:
- Express (JBS): port `3001`, DB `postgres`, schema `JBSTestOpsAI`, user `postgres`, password `admin`
- Fastify (Encore): port `3100`, DB `postgres`, schema `public`, user `postgres`, password `admin`
- **No table name conflicts**: JBS tables in `JBSTestOpsAI` schema (conversations, messages, jira_connections, test_runs, test_cases). Encore tables in `public` schema (pipeline_runs, stage_results, artifacts, worker_tasks). Both use `IF NOT EXISTS` for idempotent creation.

**Verification**:
- `grep PORT config/environments/.env.server` → shows 3100
- `grep DATABASE_URL config/environments/.env.server` → shows postgres:admin@localhost:5432/postgres

---

### Phase 4: Development Environment
**Goal**: Vite dual-proxy, startup scripts, Claude Preview config.

#### 4.1 Vite Dual-Backend Proxy
**File**: `website/frontend/vite.config.ts`

Current proxy (single backend):
```typescript
proxy: { '/api': 'http://localhost:3001' }
```

Updated proxy (dual backend, order matters):
```typescript
proxy: {
  '/api/pipeline': { target: 'http://localhost:3100', changeOrigin: true },
  '/api/events':   { target: 'http://localhost:3100', changeOrigin: true },
  '/api/admin':    { target: 'http://localhost:3100', changeOrigin: true },
  '/health':       { target: 'http://localhost:3100', changeOrigin: true },
  '/api':          { target: 'http://localhost:3001', changeOrigin: true },
}
```

**Route map**:
| URL Pattern | Backend | Port | Handles |
|---|---|---|---|
| `/api/pipeline/*` | Encore Fastify | 3100 | Pipeline CRUD, run creation, listing |
| `/api/events/*` | Encore Fastify | 3100 | SSE real-time pipeline events |
| `/api/admin/*` | Encore Fastify | 3100 | Usage stats, worker status, pipeline config |
| `/health` | Encore Fastify | 3100 | Encore health check |
| `/api/*` (catch-all) | JBS Express | 3001 | Auth, JIRA, chat, generate, test-cases, reports, agents, config, data, health (`/api/health`) |

**Note**: Both backends have health endpoints at different paths: Encore at `/health`, Express at `/api/health`. No conflict.

#### 4.2 Windows Startup Script
**New file**: `start-dev.bat`

Starts PostgreSQL check + 3 servers in separate terminals.

#### 4.3 Claude Preview Config
**New file**: `.claude/launch.json`
```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "frontend", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 5173, "cwd": "website/frontend" },
    { "name": "website-backend", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 3001, "cwd": "website/backend" },
    { "name": "encore-backend", "runtimeExecutable": "npm", "runtimeArgs": ["run", "server:dev"], "port": 3100 }
  ]
}
```

**Verification**: `curl http://localhost:3001/api/health` + `curl http://localhost:3100/health` both return OK.

---

### Phase 5: Encore API Integration (Wire Script Generation)
**Goal**: Replace simulated `handleScriptGeneration()` in ChatPage with real Encore pipeline calls + SSE.

#### 5.1 New Encore API Client
**New file**: `website/frontend/src/services/encoreApi.ts`

Separate axios client for Encore backend. Keeps existing `api.ts` (Express client) untouched.

Functions:
- `createPipelineRun(data)` → POST /api/pipeline/run
- `subscribeToPipelineEvents(runId, onEvent)` → GET /api/events/:runId (EventSource SSE)
- `listPipelineRuns(status?)` → GET /api/pipeline/list
- `getPipelineRunDetail(id)` → GET /api/pipeline/:id
- `cancelPipelineRun(id)` → POST /api/pipeline/:id/cancel
- `getAdminUsage()` → GET /api/admin/usage
- `getWorkerStatus()` → GET /api/admin/worker-status
- `getPipelineDefinition()` → GET /api/admin/pipeline-definition
- `updatePipelineDefinition(config)` → PUT /api/admin/pipeline-definition
- `encoreHealthCheck()` → GET /health

#### 5.2 Encore TypeScript Types
**File**: `website/frontend/src/types/index.ts` (append to existing)

Types from `src/orchestrator/types.ts` + `plans/INTEGRATION_CONTRACT.md`:
- `PipelineRun`, `StageResult`, `Artifact`, `PipelineRunDetail`
- `CreatePipelineRequest`, `SSEEvent`
- `AdminUsage`, `WorkerStatus`, `HealthResponse`, `PipelineDefinition`

#### 5.3 Wire ChatPage Script Generation
**File**: `website/frontend/src/pages/ChatPage.tsx`

**CRITICAL DESIGN DECISION**:
- **KEEP** `runGeneration()` as-is (template-based test case generation via Express `/api/generate`) — it's fast, works, produces reasonable output
- **WIRE** only `handleScriptGeneration()` to real Encore pipeline — this is where our pipeline shines

**Changes to `handleScriptGeneration()` (lines 539-572)**:
1. Import `createPipelineRun`, `subscribeToPipelineEvents` from `@/services/encoreApi`
2. Add state: `const [pipelineRunId, setPipelineRunId] = useState<string | null>(null)`
3. Replace setTimeout simulation with:
   - `createPipelineRun({ feature: subCategory, module: category, intent: pendingRequirements })`
   - Subscribe SSE: `subscribeToPipelineEvents(runId, handler)`
   - Map SSE events to existing UI state:
     - `stage_start(generation)` → `updatePipeline('script-gen', 'running', ...)`
     - `stage_complete(generation)` → `updatePipeline('script-gen', 'completed', ...)`
     - `stage_start(execution)` → `updatePipeline('execution', 'running', ...)`
     - `stage_complete(execution)` → `updatePipeline('execution', 'completed', ...)`
     - `stage_start(healing)` → `updatePipeline('auto-healing', 'running', ...)`
     - `stage_complete(healing)` → `updatePipeline('auto-healing', 'completed', ...)`
     - `pipeline_complete` → `updatePipeline('report-gen', 'completed', ...)` → transition to `saved`
     - `error` → show error in chat, offer retry
4. **Graceful fallback**: If `createPipelineRun` throws (Encore down), fall back to current setTimeout simulation with warning message

**What stays UNTOUCHED in ChatPage**: `runGeneration()`, all JIRA integration, chat persistence, category/source/column selection, results table, save, export, all UI/styling.

---

### Phase 6: Wire Remaining Pages

#### Pages Already Partially Wired (minor enhancements):

**DashboardPage.tsx** (110 LOC) — Currently calls `getReportsSummary()` + `getAgentStatus()`:
- Add: `getAdminUsage()` for real "Tests Generated" + "Pass Rate" from Encore
- Add: `listPipelineRuns()` for real "Recent Executions" table
- Add: `getWorkerStatus()` for worker indicator
- Keep: Existing mock data as fallback when Encore backend is down

**AgentMonitorPage.tsx** (175 LOC) — Currently calls `getAgentStatus()`:
- Add: `getWorkerStatus()` for real worker connection status
- Add: `listPipelineRuns('running')` for active pipeline display
- Add: `getPipelineDefinition()` for real stage configs, models, budgets
- Keep: Existing agent cards UI, mock queue as fallback

**ExecutionPage.tsx** (142 LOC) — Currently calls `executeTests()`:
- Change: "Run All Tests" button → `createPipelineRun()` instead of `executeTests()`
- Change: Execution history → `listPipelineRuns()` for real run data
- Keep: Progress bars, status mapping, existing UI layout

**SettingsPage.tsx** (275 LOC) — Already fully wired for JIRA (4 API calls):
- Add: "Pipeline Configuration" section
- Add: Load from `getPipelineDefinition()`, save via `updatePipelineDefinition()`
- Add: Display stages with enable/disable toggles, model selectors, budget caps
- Keep: JIRA settings + general settings as-is

#### Pages with Mock Data Only (leave as-is for initial integration):

| Page | LOC | What It Shows | Why Leave As-Is |
|------|-----|--------------|-----------------|
| WorkflowsPage | 132 | 5 hardcoded test workflows with stats | Works visually, no Express endpoint exists to wire to |
| IntegrationsPage | 147 | 6 integration cards (JIRA/GitHub/Slack/etc.) | Works visually, shows connectivity UI |
| AnalyticsPage | 163 | Charts with trend data, KPIs | Works visually, charts render with static data |
| CustomTestSuitePage | 175 | 5 test suite cards with selection | Works visually, suite management UI |
| AutomationPage | 51 | Script code viewer | Works visually, shows generated scripts |

**All 5 pages render correctly with their built-in mock data**. No blank screens. They display realistic-looking content that's appropriate for demo. Wiring them to real APIs requires new Express endpoints that don't exist yet — this is a separate future effort.

---

### Phase 7: Verification & Testing

#### Minimum Demo (Express + Frontend only):
1. Start PostgreSQL
2. `cd website/backend && npm run dev` (Express on :3001, auto-creates JBSTestOpsAI schema)
3. `cd website/frontend && npm run dev` (Vite on :5173)
4. Open http://localhost:5173
5. **Landing page** → "Start Testing"
6. **Login**: jbsadmin / Omeesha@19
7. **Chat** → Application Testing → UI Workflow Testing → JIRA
8. Enter JIRA credentials → Connect → See stories list
9. Select story → Column select → Generate
10. Review test cases (pagination, inline edit, delete)
11. Save → Export (CSV, JIRA, TestRail, Excel formats)
12. Generate Automation Scripts (simulated animation works without Encore)
13. Navigate ALL sidebar pages: Dashboard, Workflows, Integrations, Analytics, Custom Tests, Automation, Execution, Reports, Insights, Agents, Settings — all render

#### Full Demo (All 3 backends):
14. `npm run server:dev` from root (Encore Fastify on :3100)
15. `npm run worker:start` from root (worker polls :3100)
16. Repeat step 12 — verify real SSE events from Encore pipeline
17. Dashboard shows real metrics from `getAdminUsage()`
18. Agent Monitor shows live worker status
19. Settings shows pipeline configuration from Encore
20. Execution page triggers real pipeline runs

#### Health Checks:
- Express: `curl http://localhost:3001/api/health` → `{"status":"ok"}`
- Encore: `curl http://localhost:3100/health` → `{"status":"ok","db":true,"worker":...}`
- Frontend: http://localhost:5173 loads landing page

---

## JIRA Demo Path — E2E Deep Dive (Code-Traced)

### Full Flow with Failure Modes

**Step 1: Landing → Login**
- Route `/` → LandingPage (68 LOC, static) → "Start Testing" → `/login`
- LoginPage calls `loginUser(username, encryptField(password))` → Express `POST /api/auth/login`
- Express checks in-memory `USERS` map: `jbsadmin:Omeesha@19` (admin), `qaengineer:qa@2024`, `dataanalyst:data@2024`
- On success: sessionStorage stores `testops_token` + `testops_user` → redirect to `/chat`
- Auth is sessionStorage-based (not cookies), XOR+Base64 encryption in transit (not AES)

**Step 2-4: Chat → Category → Sub-category → Source**
- All client-side state transitions, zero API calls
- Category cards filtered by role: admin sees all 4, qa_engineer sees 3, data_analyst sees 2

**Step 5: JIRA Connect** (`connect-form` step)
- `handleConnect()` (ChatPage.tsx:334-374):
  - Validates 3 fields non-empty
  - `connectJira(username, url, email, apiKey)` → `POST /api/jira/connect`
  - Backend: `decryptField(rawApiToken)` → builds Basic auth → `GET JIRA /rest/api/3/myself` to test
  - On success: `saveCredsForUser()` → encrypted authHeader to `jira_connections` table
  - Immediately calls `getJiraStories(username)` → `GET /api/jira/stories`
  - `getStories()`: auto-discovers issue types via `GET /rest/api/3/issuetype`, builds JQL, calls `POST /rest/api/3/search/jql`
  - Frontend stores story list, transitions to `content-select`

| Failure | Code Path | User Sees |
|---------|-----------|-----------|
| Bad JIRA URL | axios `ENOTFOUND` → backend `err.code === 'ENOTFOUND'` | "Cannot reach JIRA server (ENOTFOUND)" |
| Wrong credentials | JIRA 401 → backend `status === 401` | "Authentication failed — check your email and API token" |
| DB down | `saveCredsForUser()` throws → 500 | "Failed to connect to JIRA" (**misleading** — JIRA test passed but DB save failed) |
| 0 stories in project | Empty array returned | "Found 0 stories/tasks" — user stuck (no proceed path) |
| Express backend down | axios network error | "Connection failed. Check credentials and try again." |

**Step 6: Story Selection + Details** (`content-select` step)
- `handleStorySelect()` (ChatPage.tsx:377-397):
  - Calls `getJiraStoryDetails(username, issueKey)` → `GET /api/jira/story/:key`
  - Backend fetches full JIRA issue, extracts acceptance criteria via 4-layer strategy:
    1. Custom field by `JIRA_AC_FIELD_KEY` env var (jira.service.ts:171-175)
    2. Auto-discover field by label matching "acceptance" AND "criteria" (jira.service.ts:178-190)
    3. Extract from rendered HTML description by heading regex (jira.service.ts:194-200)
    4. Plain-text fallback (jira.service.ts:203-224)
  - Frontend builds `requirements = title + description + acceptanceCriteria`
  - If `getJiraStoryDetails` fails → silent catch, falls back to basic `title` only

**Step 7-8: Column Select → Generate** (`column-select` → `generating`)
- 9 columns, 6 default-selected
- `runGeneration(pendingRequirements)` → `POST /api/generate`
- Backend: `runGenerationOnly()` runs 5 template agents synchronously:
  - `requirementAgent`: keyword matching (login, checkout, register, search, api, data, etc.)
  - `auditAgent`: adds metadata
  - `plannerAgent`: creates test plan
  - `generatorAgent`: for each feature → positive + negative + edge + E2E cases (template)
  - `scriptAgent`: mock automation scripts
- Returns `testCases[]` — if empty, frontend falls back to 3 hardcoded generic cases
- **NOT AI-powered** — pure keyword matching + templates. Fast (< 100ms), no LLM calls.

**Step 9-10: Results → Save** (`results` → `saved`)
- Paginated table (10/25/50 per page), inline edit, multi-select delete
- `saveTestCases()` → `POST /api/test-cases/save` → PostgreSQL `test_runs` + `test_cases`
- Export: `GET /api/test-cases/:id/export?format=csv|jira|testrail|excel` → CSV blob download

**Step 11: Script Generation** (`script-generating`)
- **Currently**: 100% simulated with 3 × `setTimeout(1.5-2.5s)` — no real API calls
- **After Phase 5**: Calls `createPipelineRun()` → real Encore pipeline → SSE events drive UI
- **Fallback**: If Encore down, reverts to setTimeout simulation with warning

### Dependency Chain
```
PostgreSQL (:5432)
├── Express backend (:3001) — needs PG for chat, JIRA creds, test case storage
│   ├── JIRA Cloud API — needs Express for auth proxy
│   └── Frontend (:5173) — needs Express for /api/* except pipeline
└── Fastify backend (:3100) — needs PG for pipeline_runs, artifacts
    ├── Worker (polls :3100) — executes Claude CLI agent tasks
    └── Frontend (:5173) — needs Fastify for /api/pipeline/*, /api/events/*, /api/admin/*
```

**Minimum demo**: Express + PG + Frontend (script gen simulated)
**Full demo**: All 3 backends + Worker (script gen real via Encore pipeline)

---

## Complete File Change Map

| # | File | Action | Phase |
|---|------|--------|-------|
| 1 | `JBSIntelliQE-develop/` | Rename → `website/` | 2 |
| 2 | `.gitignore` | Add website/ paths | 2 |
| 3 | `config/environments/.env.server` | PORT=3100, BACKEND_URL, DATABASE_URL | 3 |
| 4 | `website/frontend/vite.config.ts` | Dual-backend proxy (5 rules, ordered) | 4 |
| 5 | `start-dev.bat` | **NEW** — Windows startup script | 4 |
| 6 | `.claude/launch.json` | **NEW** — Claude Preview config (3 servers) | 4 |
| 7 | `website/frontend/src/services/encoreApi.ts` | **NEW** — Encore API client (10 functions) | 5 |
| 8 | `website/frontend/src/types/index.ts` | Append Encore types (10 interfaces) | 5 |
| 9 | `website/frontend/src/pages/ChatPage.tsx` | Wire `handleScriptGeneration()` only (lines 539-572) | 5 |
| 10 | `website/frontend/src/pages/DashboardPage.tsx` | Add Encore metrics + pipeline runs | 6 |
| 11 | `website/frontend/src/pages/AgentMonitorPage.tsx` | Add worker status + running pipelines | 6 |
| 12 | `website/frontend/src/pages/ExecutionPage.tsx` | Wire "Run All" to pipeline | 6 |
| 13 | `website/frontend/src/pages/SettingsPage.tsx` | Add pipeline config section | 6 |

**Total**: 8 existing files modified, 3 new files created, 1 folder renamed. **13 changes.**

## Files NOT Modified
- All JBS Express backend code: routes (jira, chat, generate, test-cases, auth, config, execute, agents, data), services (jira.service.ts), agents (7 template agents), db.ts, crypto, index.ts
- All Encore Fastify backend code: server routes, orchestrator, worker
- All Playwright framework code: tests, pages, selectors, fixtures, scripts
- Frontend: LandingPage, LoginPage, AuthContext, Sidebar, Header, Layout
- Frontend: WorkflowsPage, IntegrationsPage, AnalyticsPage, CustomTestSuitePage, AutomationPage (mock data stays — all render correctly)
- Frontend: DataValidationPage, ReportsPage, InsightsPage
- All CSS/Tailwind styling, all component library code, all icons

---

## Frontend Pages Complete Reference

| Route | Page | LOC | API State | Data Source | Phase |
|-------|------|-----|-----------|-------------|-------|
| `/` | LandingPage | 68 | None | Static | — |
| `/login` | LoginPage | ~150 | Real | `POST /api/auth/login` | — |
| `/chat` | ChatPage | 2500+ | Real + Mock | Express (JIRA/generate/save) + simulated scripts | 5 |
| `/dashboard` | DashboardPage | 110 | Real (partial) | `getReportsSummary()` + `getAgentStatus()` | 6 |
| `/workflows` | WorkflowsPage | 132 | Mock only | 5 hardcoded workflows | — |
| `/integrations` | IntegrationsPage | 147 | Mock only | 6 integration cards | — |
| `/analytics` | AnalyticsPage | 163 | Mock only | Static chart data | — |
| `/custom-tests` | CustomTestSuitePage | 175 | Mock only | 5 hardcoded suites | — |
| `/automation` | AutomationPage | 51 | Mock only | Mock scripts from data | — |
| `/execution` | ExecutionPage | 142 | Real (partial) | `executeTests()` + mock history | 6 |
| `/data-validation` | DataValidationPage | ~200 | Mock only | Static validation data | — |
| `/reports` | ReportsPage | ~150 | Mock only | Static report data | — |
| `/insights` | InsightsPage | ~150 | Mock only | Static AI recommendations | — |
| `/agents` | AgentMonitorPage | 175 | Real (partial) | `getAgentStatus()` + mock queue | 6 |
| `/settings` | SettingsPage | 275 | Real | JIRA connect/status/disconnect + config | 6 |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| PG install fails on Windows | Medium | Blocks everything | Docker Compose fallback (Phase 1) |
| Port conflict crashes both backends | ~~High~~ **Fixed** | Both backends down | Phase 3 changes PORT to 3100 |
| DB schema collision | ~~Medium~~ **Fixed** | Data corruption | JBSTestOpsAI vs public schemas, zero overlap |
| DB credential mismatch | ~~High~~ **Fixed** | Encore can't connect | Phase 3 aligns to postgres:admin |
| Encore pipeline fails | Medium | Script gen broken | setTimeout fallback in ChatPage (Phase 5) |
| JIRA API deprecation | Low | Story fetch broken | JBS already uses new `/rest/api/3/search/jql` ✅ |
| npm version incompatibility | Low | Build fails | Both use modern TS + Vite, compatible deps |
| 0 JIRA stories found | Medium | User stuck at selection | No mitigation in current code — future: add manual entry fallback |

---

## Execution Order

| # | Phase | What | Risk |
|---|-------|------|------|
| 1 | Infrastructure | Install PG + npm deps | Medium (PG install) |
| 2 | Structure | Rename folder + .gitignore | None |
| 3 | Config | Fix .env.server (port + DB + CORS) | **CRITICAL** — must be done before starting backends |
| 4 | Dev Env | Vite proxy + startup + launch.json | Low |
| 5 | Core | Wire ChatPage script gen to Encore SSE | Medium |
| 6 | Polish | Enhance Dashboard/Agents/Exec/Settings | Medium |
| 7 | Verify | E2E test JIRA demo path | — |

**Each phase is independently testable.** If Phase 5 fails, Phases 1-4 still give a working demo with simulated script generation. If Phase 6 is skipped, the 4 pages still work with their current partial API integration.
