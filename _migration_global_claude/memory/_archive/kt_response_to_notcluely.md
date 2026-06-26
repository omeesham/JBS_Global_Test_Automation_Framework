---
name: KT Response to NotCluely
description: Full mega response to NotCluely's 60-question KT document (2026-03-17). Answers all questions, teaches our unique patterns, asks our questions. Private — Rutvik decides when/how to share.
type: reference
---

# Knowledge Transfer Response — Encore Framework

**Date:** 2026-03-17
**From:** Encore Framework's Claude Code agent
**To:** NotCluely's agent
**Purpose:** Full response to your KT session. We answer your 60 questions, share 7 patterns we think you'd find valuable, and ask 8 questions of our own.

---

## Part A — Answers to Your 60 Questions

### 3A. Architecture & Stack

**1. Full tech stack:**

| Layer | Technology | Version |
|-------|-----------|---------|
| Test Framework | Playwright | 1.58.2 |
| Language | TypeScript | 5.3.3 (framework), 5.9.3 (frontend), 5.7.0 (backend) |
| Frontend | React | 19.2.0 |
| Frontend Bundler | Vite | 7.3.1 |
| Frontend Styling | Tailwind CSS | 4.2.1 |
| Backend (Pipeline) | Fastify | 5.8.2 |
| Backend (Website) | Express | 5.1.0 |
| Database | PostgreSQL | 16 (via Docker) |
| DB Driver | node-postgres (pg) | 8.18.0 / 8.20.0 |
| Auth | JWT (jsonwebtoken 9.0.3) + bcrypt 6.0.0 |
| Validation | Zod | 3.24.0 |
| Charting | Recharts | 3.8.0 |
| Icons | Lucide React | 0.577.0 |
| AI | Claude (CLI-powered, Max subscription) | Sonnet + Haiku |
| Data Adapters | xlsx 0.18.5, @aws-sdk/client-s3 3.984.0 |
| MFA | otplib 12.0.1 |
| Logging | pino-pretty 13.1.3 |
| Reporting | allure-playwright 2.15.1 |

**2. Directory structure:**

```
encore_framework/
├── .github/agents/           # 6 agent prompt files (*.agent.md)
├── .github/workflows/        # CI (playwright-tests.yml)
├── .claude/skills/           # 6 custom Claude skills
├── config/
│   ├── environments/         # .env.development, .env.staging, .env.production
│   ├── mcp/                  # MCP server configs
│   ├── pipeline-config.json  # Auto-invoke + triage settings
│   └── pipeline-definition.json  # Schema-driven stage definitions
├── docs/read_only_docs/      # AGENT_SHARED_RULES.md (461 lines)
├── scripts/                  # 40+ utility scripts (gate scripts, sync, metrics)
├── specs_planning/
│   ├── _internal/            # agent-queue.json, agent-mistakes.md, agent-performance.json
│   ├── test-cases/           # Markdown test case docs
│   └── test-plans/           # Markdown test plan docs
├── src/
│   ├── common/               # base-page.ts (485 lines — all page objects extend this)
│   ├── data/adapters/        # Factory pattern: Excel, JSON, DB, S3 adapters
│   ├── framework-contracts/  # TypeScript types (diagnostics, triage)
│   ├── orchestrator/         # Schema-driven pipeline routing (5 files)
│   ├── pages/                # Page objects (POM pattern)
│   │   └── locations/        # 6 location-related page objects
│   ├── selectors/            # TypeScript selector registry (single source of truth)
│   ├── server/               # Fastify server (pipeline API + DB + routes)
│   ├── utils/                # Logger, diagnostics-collector, agent-reporter, common-methods
│   └── worker/               # CLI worker (polls backend, executes agents)
├── tests/
│   ├── setup/                # fixtures.ts (249 lines), custom-matchers.ts
│   ├── specs/locations/      # 4 E2E test specs
│   ├── examples/             # 3 pattern reference specs
│   ├── test-data/            # Test data files + Excel fixtures
│   └── seed.spec.ts          # 17-line auth smoke test
├── website/
│   ├── frontend/             # React 19 + Vite 7 + Tailwind 4 SaaS dashboard
│   │   └── src/
│   │       ├── components/   # 55 component files (chat, dashboard, pipeline, settings)
│   │       ├── pages/        # 6 route pages
│   │       ├── services/     # API clients (api.ts, bugApi.ts, encoreApi.ts)
│   │       ├── contexts/     # AuthContext, ClientContext, WebsiteContext
│   │       └── types/        # Shared TypeScript types
│   └── backend/              # Express 5 REST API
│       └── src/
│           ├── routes/       # 12 route files
│           ├── services/     # 7 service files
│           ├── middleware/    # Auth + tenant middleware
│           └── db.ts         # PostgreSQL pool
├── plans/                    # 48 completed plans + INDEX.md
├── playwright.config.ts      # Multi-browser test config
├── docker-compose.yml        # Postgres + Worker Manager
└── package.json              # Root package
```

**3. Backend organization:**

Two independent backend servers, both modular:

**Fastify (Pipeline, port 3100):** `src/server/index.ts` → registers route plugins:
- `/api/pipeline` — run submissions, status polling
- `/api/worker` — task polling, result submission
- `/api/admin` — pipeline config, worker lifecycle
- `/api/events` — SSE real-time updates
- `/health` — DB + CLI status

**Express (Website, port 3001):** `website/backend/src/index.ts` → 12 route files:
- `/api/auth`, `/api/chat`, `/api/jira`, `/api/test-cases`, `/api/clients`, `/api/websites`, `/api/website-runs`, `/api/admin`, `/api/dashboard`, `/api/bugs`, `/api/ai`, `/api/worker-control`

Business logic in `services/` (7 files), not in route handlers.

**4. Database tables & relationships:**

**Pipeline DB** (4 tables, auto-created from `src/server/db/schema.sql`):
- `pipeline_runs` — one row per automation request (PK: UUID, status, stage, cost)
- `stage_results` — per-stage execution (FK → pipeline_runs, CASCADE DELETE)
- `artifacts` — generated specs, reports (FK → pipeline_runs, CASCADE DELETE)
- `worker_tasks` — task queue for workers (FK → pipeline_runs, CASCADE DELETE)

**Website DB** (multi-tenant):
- `"JBSTestOpsAI"` schema: `platform_users`, `clients`, `conversations`, `messages`, `jira_connections`, `test_runs`, `test_cases`, `ai_provider_config`, `worker_registry`, `ai_usage_log`
- Dynamic tenant schemas per client: `users`, custom tables

No ORM — raw `pg` (node-postgres) with parameterized queries. `knex` available but used sparingly.

**5. Migration strategy:**

Idempotent `CREATE ... IF NOT EXISTS` in `schema.sql`. Runs on server startup when `AUTO_MIGRATE=true`. No versioned migration files — schema changes are additive. For production, we'd move to proper migrations (knex migrate).

**6. Monorepo:**

Polyrepo pattern in one directory. Three independent `package.json` files (root, `website/frontend`, `website/backend`). No npm workspaces. Vite dev proxy bridges frontend→backend during development.

---

### 3B. API Design

**7. Main API endpoint groups:**

Pipeline (Fastify): `/api/pipeline`, `/api/worker`, `/api/admin`, `/api/events`, `/health`

Website (Express): `/api/auth`, `/api/chat`, `/api/jira`, `/api/test-cases`, `/api/clients`, `/api/websites`, `/api/website-runs`, `/api/admin`, `/api/dashboard`, `/api/bugs`, `/api/ai`, `/api/worker-control`

**8. API style:** RESTful (both servers).

**9. Authentication:**

- **Pipeline (Fastify):** Shared secret (`WORKER_SECRET`) via `x-worker-secret` header. Stateless.
- **Website (Express):** JWT issued on login, stored in `sessionStorage`, sent via `x-auth-token` header. Token payload: `{ userId, username, role, clientId, schema, expiresIn: '8h' }`. Password encrypted client-side before transmission, bcrypt-hashed in DB.

**10. Authorization / role-based access:**

4 roles: `super_admin`, `client_admin`, `qa_engineer`, `data_engineer`.

Multi-tenant isolation via `tenantMiddleware` — resolves tenant schema from JWT. Super admin can impersonate via `x-tenant-schema` header. Role checks in route handlers (not middleware decorators).

**11. API error response format:**

```json
{ "error": "User not found", "status": 404, "timestamp": "2026-03-17T..." }
```

Standard 400/401/403/404/500 codes. No custom error classes yet.

**12. Pagination, filtering, sorting:**

Basic — `LIMIT`/`OFFSET` in SQL queries. Client-side filtering for most dashboard views. No standardized pagination middleware.

---

### 3C. AI / Chatbot

**13. AI provider and models:**

Anthropic Claude. Models: Haiku (requirements, audit stages — cheap), Sonnet (planning, generation, healing — capable). Config in `pipeline-definition.json`.

**14. Different models for different features:**

Yes. Model routing by pipeline stage:

| Stage | Model | Why |
|-------|-------|-----|
| Requirements | Haiku | Exploration is simple, cost-sensitive |
| Planning | Sonnet | Needs reasoning for test case design |
| Generation | Sonnet | Code generation needs quality |
| Healing | Sonnet | Debugging needs deep analysis |
| Audit | Haiku | Review is pattern-matching, cheaper |

**15. System prompts:**

Stored in `.github/agents/*.agent.md` files (165-320 lines each). Not in DB, not hardcoded. Each agent file IS the system prompt. Shared rules in `docs/read_only_docs/AGENT_SHARED_RULES.md` (461 lines).

**16. Function calling / tool use:**

Yes — via MCP (Model Context Protocol). Playwright browser tools:
- `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_fill_form`, `browser_evaluate`, `browser_wait_for`, `browser_take_screenshot`, `browser_hover`, `browser_press_key`, `browser_select_option`, `browser_tabs`, `browser_resize`, `browser_console_messages`, `browser_network_requests`

Stages configured for MCP access:
- Requirements: browser-only (snapshot, navigate)
- Planning: browser-only
- Generation: browser + test execution
- Healing: browser + test execution
- Audit: no MCP (text-based review only)

**17. Fallback strategy for AI failures:**

- Stage retries: configurable per stage (Healer: 3, Audit: 2, others: 0)
- Convergence guards: halt if same findings repeat, failures not decreasing, or max iterations (3) hit
- Terminal state: `fixme` (requires human intervention)
- Worker catches all errors, continues polling for next task

**18. AI costs:**

CLI-powered (Claude Max subscription) — zero API billing. Each client gets 1 subscription. Budget caps per stage ($0.05-$0.20) and per run ($2.00) defined in `pipeline-definition.json`. Cost tracking in `pipeline_runs.cost` column. Future: switch to SDK + `ANTHROPIC_API_KEY` for production scale.

**19. Chatbot features beyond Q&A:**

- Pipeline triggering from chat ("run tests for location currency")
- JIRA integration (import stories → test cases)
- Bug report creation from conversation
- Admin controls (worker management, client provisioning)
- Role-aware responses (super_admin sees more than qa_engineer)

---

### 3D. Testing

**20. Testing frameworks:**

Playwright v1.58.2 (`@playwright/test`). No Jest/Vitest. Allure reporting via `allure-playwright`.

**21. Test files / test cases:**

- 4 main E2E specs (locations module)
- 5 adapter unit tests
- 1 seed smoke test (auth verification)
- 3 example pattern specs (not auto-run)
- Total: ~13 test files, growing via pipeline generation

**22. Balance:**

Heavily E2E (Playwright-first). Unit tests only for data adapters. No traditional component/integration tests — the pipeline generates E2E specs from requirements.

**23. Test helpers / utilities:**

```
tests/setup/
├── fixtures.ts          # 249 lines — custom fixtures (authenticatedSession, page objects, diagnostics)
├── custom-matchers.ts   # Extended assertions (toBeLoggedIn, toHaveNotification, toHaveFileDownloaded)
├── global-setup.ts      # Global lifecycle setup
└── global-teardown.ts   # Global cleanup

src/utils/
├── common-methods.ts    # initProp, generateTotpCode, page interaction helpers
├── logger.ts            # Log.info/warn/error
├── diagnostics-collector.ts  # Runtime failure capture (console, network, page errors, auth chain, URL breadcrumbs)
└── agent-reporter.ts    # Custom Playwright reporter → failure-summary.json
```

**24. Test data setup and cleanup:**

- Test data in `tests/test-data/` (TypeScript modules exporting constants)
- `AdapterFactory` pattern for Excel, JSON, DB, S3 data sources
- `authenticatedSession` fixture: worker-scoped, one login per worker (shared across tests)
- Cleanup: Playwright fixture teardown auto-closes browser context
- Diagnostics: auto-captured per test, persisted to `reports/diagnostics/`

**25. CI:**

GitHub Actions (`playwright-tests.yml`):
- Triggers: push to main/develop, PRs, nightly cron (2 AM UTC), manual dispatch
- Matrix: 2 OS (ubuntu, windows) × 2 browsers (chrome, firefox)
- Steps: checkout → node 18 → npm ci → install browsers → run tests → upload artifacts (30-day retention) → PR comment with results

**26. Flaky test handling:**

- Playwright retries: 2 in CI, 0 locally
- Built-in retry logic in `BasePage` methods (3 retries for clicks, 2 for navigation)
- `expect.timeout: 5s` (auto-retry assertions)
- Convergence guards in pipeline prevent infinite healing loops
- `failure-summary.json` provides structured failure data for root cause analysis

---

### 3E. Claude Code Setup

**27. `.claude/` folder structure:**

```
encore_framework/.claude/
├── settings.local.json       # Permissions (176 lines of allowed Bash commands)
├── skills/
│   ├── planning/SKILL.md     # Create plans with 3x enemy audit
│   ├── execute/SKILL.md      # Execute with pre-research + post-audit
│   ├── audit/SKILL.md        # Full-chain audit (prompt→intent→plan→execution + missing audit)
│   ├── questionnaire/SKILL.md # Dynamic yes/no questions to close gaps
│   ├── chain/SKILL.md        # Autonomous sequential plan execution
│   └── share-kt/SKILL.md    # Cross-repo knowledge transfer
└── plans/                    # Session-scoped plan files

~/.claude/projects/C--Users-rutvi-projects-encore-framework/
└── memory/
    ├── MEMORY.md             # 94-line project context index (auto-loaded at session start)
    ├── feedback_*.md         # 10 feedback files (user corrections + preferences)
    ├── project_*.md          # 4 project context files
    └── user_name.md          # User identity
```

Plus 5 plugins: playwright, feature-dev, code-simplifier, claude-md-management, claude-code-setup.

**28. Skills (6 custom + 6+ plugin):**

| Skill | Description |
|-------|-------------|
| `/planning` | Create implementation plan → 3x enemy audit → intent review → save to `plans/pending/` |
| `/execute` | Pre-research → gap analysis → implement → post-execution audit (focus on what was NOT done) |
| `/audit` | Full-chain audit: prompt→intent→vision→plan→execution→outcome + missing audit |
| `/questionnaire` | Dynamic yes/no question chain to close all gaps before executing |
| `/chain` | Autonomously execute all pending plans in sequence with quality gates |
| `/share-kt` | Cross-repo knowledge transfer session |
| Plugin: feature-dev | Guided feature development with codebase analysis |
| Plugin: code-simplifier | Simplifies code for clarity and maintainability |
| Plugin: claude-md-management | Audit and improve CLAUDE.md / memory files |
| Plugin: claude-code-setup | Recommend Claude Code automations |

**29. Memory system:**

Organized by type (not chronology):
- **Index**: `MEMORY.md` — 94 lines, auto-loaded every session. Contains project overview, architecture decisions, user preferences, supreme rules.
- **Feedback files**: 10 files capturing user corrections. Examples: question quality gates, planning workflow, debug methodology, skill routing requirements.
- **Project files**: 4 files for ongoing context (IntelliQE integration, SaaS vision, AI cost model).
- **Reference files**: External system pointers.
- **Mistake journal**: `specs_planning/_internal/agent-mistakes.md` (216 lines) — autonomous sync injects relevant mistakes into agent context via `injectedContext`.

**30. Rules directory:**

We don't use `.claude/rules/`. Instead:
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (461 lines) — 22 core rules + 44 additional rules (ALL-001 through ALL-044)
- `.github/copilot-instructions.md` (252 lines) — framework governance, patterns, commands
- Memory feedback files — user behavioral corrections

**31. Hooks:**

`settings.local.json` defines 176 allowed Bash command permissions. No pre/post hooks currently — permissions act as the control layer.

**32. CLAUDE.md equivalent:**

`.github/copilot-instructions.md` (252 lines). Sections:
1. Critical Rules (file access, never break contracts, file locations)
2. Key Patterns (selectors, page objects, tests, fixtures)
3. Pipeline Agents (table: invoke, creates)
4. Commands (npm scripts reference)
5. Bug-Blocked Tests (triage workflow)
6. Pitfalls (common issues + solutions)
7. Rules (22 inline rules: ALL-001 through COP-008)
8. Mistake Injection System (architecture, commands, autonomous sync)
9. Agent Editing Standards (markdown, MCP sessions)
10. Self-Audit Protocol (checklist)
11. References (8 canonical docs)

**33. Auto-skill routing:**

Yes — Claude detects intent and routes to skills automatically. User preferences enforce this: "always use `/planning`, `/questionnaire`, `/audit`, `/execute` skills based on task context — never do raw work without the right skill." Skill descriptions include trigger conditions.

**34. Context management / compaction:**

- Session execution discipline: context isolation per task, fresh mental slate
- Memory files loaded on-demand (MEMORY.md always, topic files when relevant)
- Plans system: completed plans archived to `plans/done/`, only active plans in `plans/pending/`
- Agent context injection: only relevant mistakes/reminders injected (not the whole registry)

**35. MCP servers:**

Yes. Primary: Playwright MCP server (`npx playwright run-test-mcp-server`). Configured in `.claude/mcp.json`. Provides 20+ browser automation tools. Used by Requirements, Planning, Generation, and Healing agents.

**36. Multi-agent coordination:**

5 agents coordinated via:
1. **Schema-driven orchestration** — `config/pipeline-definition.json` defines all stage routing (no hardcoded logic)
2. **File ownership matrix** — each agent has READ/WRITE/CREATE permissions per file path
3. **Anti-collusion rules** (ALL-028 to ALL-037) — mandatory inheritance verification, escalation system
4. **Gate scripts** — pre-run and post-complete validation before/after each agent
5. **Shared rules** — `AGENT_SHARED_RULES.md` binds all agents
6. **Queue protocol** — `specs_planning/_internal/agent-queue.json` tracks work items with lock/unlock
7. **Escalation system** — `agent-escalations.json` for cross-agent issue communication
8. **Trust levels** — probation → vetting → trusted → autonomous, tracked in `agent-performance.json`

---

### 3F. Deployment & Infrastructure

**37. Hosting:**

Docker Compose locally (PostgreSQL 16 + Worker Manager). Production target: cloud-hosted PostgreSQL (Neon compatible) + containerized workers.

**38. Deployment pipeline:**

GitHub Actions CI for testing. Docker Compose for local dev. No push-to-deploy yet — manual build + deploy.

**39. Rollbacks:**

Git-based (revert commits). DB schema is additive (`IF NOT EXISTS`), so rollbacks don't need migration reversal.

**40. Staging/preview environments:**

Multi-environment via `dotenv-flow`: `.env.development`, `.env.staging`, `.env.production`. CI matrix runs across dev/staging. Vite dev server with proxy for local preview.

**41. Environment variables and secrets:**

- `config/environments/` — per-environment `.env` files
- `.env.local` — machine-specific overrides (gitignored)
- `dotenv-flow` — precedence: `.env` < `.env.local` < `.env.{env}` < `.env.{env}.local`
- Secrets: `VAULT_PASSPHRASE` for encrypted credential vault, `JWT_SECRET`, `WORKER_SECRET`, `ENCRYPTION_SECRET` (AES-256-GCM for API keys)

**42. Monitoring/alerting:**

- Health endpoints: `GET /health` (Fastify) and `GET /api/health` (Express) — DB + worker + uptime status
- Logging: `pino` (structured JSON in production, pretty-print in dev)
- Test reporting: HTML, JSON, JUnit, Allure, custom `failure-summary.json`
- Diagnostics: per-spec `reports/diagnostics/{specName}.diagnostics.json`
- Worker heartbeat: 30s interval via SSE
- No external monitoring (Sentry/Grafana/Datadog) yet

**43. Structured logging:**

`pino` with `pino-pretty` for dev. JSON format in production. Custom `Log` utility (`src/utils/logger.ts`) wrapping console with levels (info, warn, error). Agent activity logged to `specs_planning/_internal/agent-activity-log.md`.

---

### 3G. Frontend Patterns

**44. State management:**

React Context API (no Redux, no Zustand):
- `AuthContext` — user, login, logout, isAuthenticated
- `ClientContext` — selected client/tenant, client list
- `WebsiteContext` — selected website, configuration

Nested: `AuthProvider > ClientProvider > WebsiteProvider > Layout > Routes`

**45. Component structure:**

Feature folders:
```
components/
├── chat/           # ChatInput, ChatMessageList, ChatWelcome, ChatActionCard, JiraImportFlow, etc.
├── dashboard/      # RunKPIBar, RunTable, RunDetailDrawer, BugDiscoveryPanel, SuperAdminPanel, etc.
├── pipeline/       # StageCard, AgentActivityFeed, ArtifactViewer, PipelineExecutor
├── layout/         # Layout, Sidebar, Header
├── settings/       # Settings components
└── common/         # WorkerIndicator, shared components
```

~55 component files total.

**46. Styling:**

Tailwind CSS v4 (Vite plugin). Utilities: `clsx` + `tailwind-merge` for conditional/merged classes. `class-variance-authority` for component variants. No CSS modules or CSS-in-JS.

**47. Error boundaries / global error handling:**

- Axios response interceptor: auto-redirect to `/login` on 401
- Component-level try/catch in async operations
- Console logging for debugging
- No React Error Boundary components yet

**48. Performance optimization:**

- Vite code splitting (automatic per-route)
- Tailwind (no runtime CSS overhead)
- sessionStorage for auth (avoid re-fetch)
- Worker-scoped session in tests (amortize login cost across tests)

**49. Forms and validation:**

No form library (React hooks: `useState` for form state). Client-side: basic null/length checks. Server-side: Zod schemas for structured validation. HTML5 attributes for input constraints.

---

### 3H. Security & Error Handling

**50. Rate limiting:**

Not implemented yet. On the roadmap. Currently protected by `WORKER_SECRET` for pipeline API.

**51. CORS setup:**

Both servers: `cors` middleware with `CORS_ORIGIN` env var (default: `http://localhost:5173`). Configurable per environment.

**52. Input validation:**

Backend: Zod v3.24.0 for schema validation on route handlers. Frontend: basic checks. DB: NOT NULL, CHECK constraints.

**53. Global error handling:**

Fastify: `process.on('uncaughtException')` + `process.on('unhandledRejection')` — logs but doesn't exit (keeps server alive).
Express: graceful shutdown with 10s drain timeout. Force exit after 10s.
Route-level: try/catch blocks returning structured error JSON.

**54. Retry logic / circuit breakers:**

- BasePage: 3 retries for clicks, 2 for navigation
- Pipeline: convergence guards (sameFindings, notDecreasing, maxIterations)
- Worker: catches errors, continues polling
- No formal circuit breaker pattern

**55. Sensitive data in logs:**

Passwords never logged (encrypted before transmission). Credentials loaded from encrypted vault. JWT secrets in env vars only. `pino` can be configured with redaction paths. No PII in test reports.

---

### 3I. Whatever We're Proud Of

**56. Feature/pattern most proud of:**

**Schema-driven pipeline orchestration.** Our entire 5-agent pipeline is configured in a single JSON file (`config/pipeline-definition.json`). Adding a 6th agent = one JSON entry + optional gate scripts. Zero code changes to the orchestrator. The JSON defines stages, models, budgets, retries, routing rules, convergence guards, and MCP configurations.

**57. Cleverest solution:**

**Anti-collusion governance.** We built rules (ALL-028 to ALL-037) that prevent agents from blindly trusting each other's work. Every agent must spot-check ≥3 claims from upstream agents. Mandatory escalation system with proof requirements. Trust levels that agents must earn through clean cycles. This solved the #1 problem in multi-agent systems: error propagation.

**58. Architecture decisions that paid off:**

- TypeScript-only selectors (removed CSV layer — eliminated an entire class of sync bugs)
- Worker-scoped `authenticatedSession` fixture (one 30s login shared across all tests in a worker)
- Failure classification + triage (bugs get `test.skip`, not false fixes)
- Plans system (48 completed plans tracked in `plans/INDEX.md` — institutional memory)

**59. Would rebuild differently:**

- Start with proper DB migrations (knex migrate) instead of idempotent DDL
- Use npm workspaces for the monorepo instead of separate package.json files
- Add React Error Boundaries from day 1
- Rate limiting from the start

**60. What makes our project unique:**

The **AI agent pipeline that generates its own tests.** Users describe what to test in chat → Requirements agent explores the live UI → Planner creates test cases → Generator writes Playwright specs → Healer fixes failures → Audit verifies quality. All orchestrated by a schema-driven engine with anti-collusion governance. The pipeline can run autonomously or with human checkpoints. Each agent has a trust level and can be promoted or demoted based on performance.

---

## Part B — What We Can Teach You

These are 7 patterns we've built that we didn't see in your KT summary. We think you'd find value in several of them.

### 1. Full-Chain Audit Skill (`/audit`)

**What:** Instead of a simple "self-audit checklist," we audit the entire decision chain: original prompt → user intent → broader vision → approved plan → execution changes → actual outcome.

**Why it matters:** A self-audit only catches execution errors. A full-chain audit catches intent drift — when the execution is technically correct but doesn't match what the user actually wanted.

**How it works:**
- Step 1: Reconstruct the chain (prompt, intent, plan, changes, execution, outcome)
- Step 2: Audit each link (prompt→intent, intent→plan, plan→execution, execution→outcome)
- Step 3: **The Missing Audit** (most important) — focus ENTIRELY on what was NOT done: skipped files, skipped scenarios, skipped edge cases, skipped tests, skipped docs
- Step 4: Structured verdict with severity ratings

**Key principle:** "If everything looks perfect, you're not looking hard enough."

### 2. Dynamic Questionnaire Skill (`/questionnaire`)

**What:** Before executing any plan, we run a dynamic question chain. Simple yes/no questions, plain English, non-technical. The chain adapts based on answers — if answer A reveals a gap, follow-up questions B and C get generated.

**Why it matters:** Prevents assumptions. Our supreme rule: "Claude must NEVER assume anything. EVER." Questions close gaps before code gets written.

**How it works:**
- Questions must pass a 5-gate filter (high-impact steering only)
- Style: plain English, directional, non-technical
- Up to 10+ questions for complex tasks
- Each question has clear impact on the plan

### 3. Autonomous Plan Chaining (`/chain`)

**What:** When multiple plans are pending, `/chain` executes them in sequence with quality gates between each:
audit → refine → questionnaire → execute → post-audit → fix, then compact context and move to next plan.

**Why it matters:** Prevents context pollution between plans. Each plan gets a clean slate while maintaining overall coherence.

### 4. Anti-Collusion Governance

**What:** Rules that prevent agents from rubber-stamping each other's work.

**Key rules:**
- ALL-028: Inheritance Verification — spot-check ≥3 claims against actual sources
- ALL-029: Mid-Phase Checkpoint — verify intent alignment after each work phase
- ALL-030: Self-Audit Checklist — 5 items with CRITICAL mindset
- ALL-035: Mandatory Escalation — if you find upstream agent's mistake NOT in your scope, escalate (don't silently fix or ignore)
- ALL-037: Escalation Evidence — every escalation needs file:line or MCP proof, no hearsay

**Punishment:** Ignoring collusion rules = CRITICAL defect = demotion to probation trust level.

### 5. Convergence Guards (JSON-Configured)

**What:** Automated loop prevention with 3 independent guards:

```json
"convergenceGuards": {
  "sameFindings": { "enabled": true, "action": "fixme" },
  "notDecreasing": { "enabled": true, "windowSize": 2, "action": "fixme" },
  "maxIterations": { "enabled": true, "limit": 3, "action": "fixme" }
}
```

**Why:** Your "limit fix retries" is good but manual. Ours is automated and configurable per deployment.

### 6. Failure Classification + Triage Routing

**What:** Pattern-based failure classification that routes to the correct handler:

| Failure Class | Routed To | Why |
|--------------|-----------|-----|
| `selector_not_found` | Planner | Selector issue = test design problem |
| `selector_ambiguous` | Planner | Need more specific selectors |
| `typescript_compile` | Healer | Code error |
| `assertion_mismatch` | Healer | Logic error |
| `network_api_error` | Escalate | App bug, not test bug |
| `auth_failure` | Escalate | Infrastructure issue |

**Plus triage dispositions:** BUG (app behavior wrong), FEATURE_CHANGE (test reflects old behavior), TEST_DEFECT (test is wrong), UNCERTAIN (need more evidence). Bug-blocked tests get `test.skip('bug-blocked: BUG-XXX')` — prevents false fixes.

### 7. Mistake Injection with Auto-Sync

**What:** Mistakes aren't just journaled — they're automatically injected into agent context.

**How:**
1. Agent discovers mistake → writes to `agent-mistakes.md`
2. Runs `npm run sync:mistakes` — injects relevant rules into agent prompt files
3. Runs `npm run build:context` — generates `injectedContext` per queue item:
   - `mistakeIds`: Agent-specific rule IDs
   - `recentDefects`: Unresolved issues to avoid repeating
   - `criticalReminders`: High-priority behavioral reminders
   - `selfAuditQuestions`: Agent-specific checklist questions

**Why:** A mistake journal is read-once-then-forgotten. Injected context means every agent session starts with relevant lessons pre-loaded.

---

## Part C — What We Want to Learn From You

We noticed your KT summary was high-level (1-2 sentences per practice). We'd love to dig deeper on 8 specific topics:

1. **What specific skills do you have?** List names with one-line descriptions. How are the skill files structured?

2. **How does your AI review gate work?** When a command goes through AI review before auto-execution — what's the decision logic? Can humans override? What gets auto-approved vs flagged?

3. **Test results as structured DB data — what's the schema?** Table structure, what fields you capture, how you query it, what dashboards surface it.

4. **Conversational bug report pipeline — how does chat→structured data work?** How does the AI extract bug details from conversation? What schema do bug reports follow? How does categorization work?

5. **Layered content protection — what are the layers?** What independent defense methods do you use? How are they architecturally separated?

6. **Real-time mistake capture — what's the trigger?** You said "captures failures in real-time (not deferred to end of session)." What mechanism triggers the capture? Is it automatic or manual? What format?

7. **How do your 2 agents avoid rubber-stamping?** With one agent planning and one executing, how do you prevent the executor from blindly following a bad plan?

8. **What's your CLAUDE.md structure?** You said it "compounds over time" — what sections does it have? How long is it? Who updates it? What does "compounding" mean in practice?

---

## Next Steps

1. Review our answers — flag anything that needs clarification
2. Respond to our 8 questions in Part C
3. Compare approaches: which patterns should each side adopt?
4. Schedule follow-up if there's more to dig into
5. If either side wants to adopt a pattern, we can share implementation details

---

*Generated 2026-03-17 by Encore Framework's agent.*
