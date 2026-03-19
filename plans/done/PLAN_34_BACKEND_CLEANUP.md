# PLAN_34: Website Backend Cleanup + Auth Upgrade

**Status**: Pending
**Dependencies**: Execute after PLAN_33 (frontend pages deleted first to prevent 404s)
**Scope**: Delete 10 fake agents + 5 mock routes + dead schemas, upgrade auth to DB-backed bcrypt + JWT with tenant awareness

---

## What to DELETE

### Fake agents (entire directory, 10 files)
```
website/backend/src/agents/requirementAgent.ts    — keyword matching, not AI
website/backend/src/agents/auditAgent.ts          — hardcoded edge cases
website/backend/src/agents/plannerAgent.ts        — simple math
website/backend/src/agents/generatorAgent.ts      — template test cases
website/backend/src/agents/scriptAgent.ts         — boilerplate Playwright stubs
website/backend/src/agents/executionAgent.ts      — random pass/fail
website/backend/src/agents/healingAgent.ts        — blindly marks all passed
website/backend/src/agents/dataValidationAgent.ts — random health scores
website/backend/src/agents/pipeline.ts            — orchestrates the above fakes
website/backend/src/agents/state.ts               — TestOpsState interface (shared by all agents)
```

### Mock routes (5 files)
```
website/backend/src/routes/generate.routes.ts   — calls fake agent pipeline
website/backend/src/routes/execute.routes.ts    — calls fake agent pipeline
website/backend/src/routes/agents.routes.ts     — hardcoded agent status + queue
website/backend/src/routes/data.routes.ts       — random validation data
website/backend/src/routes/config.routes.ts     — in-memory Map, no persistence
```

### Dead code
```
website/backend/src/models/schemas.ts   — 6 Zod schemas, imported by nothing
```

### Hardcoded endpoints in index.ts
- `GET /api/reports/summary` — returns hardcoded 1240 tests, 96% pass rate

---

## What to KEEP

```
website/backend/src/routes/chat.routes.ts       — KEEP (real PostgreSQL)
website/backend/src/routes/jira.routes.ts       — KEEP (real JIRA HTTP)
website/backend/src/routes/test-cases.routes.ts — KEEP (real PostgreSQL)
website/backend/src/services/jira.service.ts    — KEEP (real JIRA integration)
website/backend/src/services/chat.service.ts    — KEEP (real DB operations)
website/backend/src/db.ts                       — KEEP (PostgreSQL connection)
website/backend/src/utils/crypto.ts             — KEEP (used by auth + JIRA)
```

---

## Auth Upgrade (in-memory inline -> DB-backed + JWT with tenant context)

**NOTE: `auth.routes.ts` does NOT exist.** Auth is currently INLINE in index.ts (hardcoded USERS map + login/signup handlers). Must EXTRACT into new `auth.routes.ts` file.

### Current (in index.ts)
```javascript
const USERS = {
  jbsadmin:    { password: 'Omeesha@19', role: 'admin' },
  qaengineer:  { password: 'qa@2024', role: 'qa_engineer' },
  dataanalyst: { password: 'data@2024', role: 'data_analyst' },
};
```

### Target

**NO new users table created here** — PLAN_32 already created the tables. This plan only builds the auth logic.

Users already exist in PLAN_32's schema:
- `JBSTestOpsAI.platform_users` -> super_admin (JBS god mode)
- `tenant_{schema}.users` -> client_admin, qa_engineer, data_engineer (per-client)

### Tenant-Aware Login Steps

1. **EXTRACT** auth logic from index.ts inline INTO new `auth.routes.ts`
2. **Replace** XOR "encryption" with bcrypt for password hashing
3. **Login route logic** (tenant-aware):
   - Try `JBSTestOpsAI.platform_users` first (for super_admin)
   - If not found, iterate client schemas: query `tenant_{schema}.users`
   - (Optimization: if username contains a known client slug prefix, check that schema first)
4. **Generate proper JWT tokens** with payload:
   ```json
   { "userId": "<uuid>", "username": "<string>", "role": "<string>", "clientId": "<uuid|null>", "schema": "<string>" }
   ```
   - super_admin: `clientId=null, schema='JBSTestOpsAI'`
   - everyone else: `clientId=<uuid>, schema='tenant_encore_global'`
5. **New dependencies**: `npm install bcrypt jsonwebtoken` + `@types/bcrypt @types/jsonwebtoken` as devDeps
6. All 4 users already seeded by PLAN_32 (superadmin, encoreadmin, encoreqa, encoredata)

---

## Role Hierarchy

| Role | Description | Managed By | Scope |
|------|------------|------------|-------|
| `super_admin` | JBS god-mode: all clients, platform insights, everything | JBS internal only | Platform-wide |
| `client_admin` | JBS-controlled overlooker for one client | JBS assigns (NOT client self-managed) | Single client |
| `qa_engineer` | Standard user, triggers runs, views results | client_admin or super_admin | Assigned websites |
| `data_engineer` | Data-focused user, same capabilities as qa_engineer | client_admin or super_admin | Assigned websites |

Role names are flexible strings (not enums) — clients can request custom role names.
`client_admin` is JBS-controlled. Clients do NOT self-manage their admin account.

---

## Breakpoint Analysis

| What breaks when routes are deleted | Frontend call site | Fix |
|--------------------------------------|-------------------|-----|
| `POST /api/generate` removed | ChatPage `runGeneration()` line 442 | Rewire to Encore `POST /api/pipeline/run` (PLAN_36) |
| `POST /api/execute` removed | ExecutionPage line ~20 | Page deleted (PLAN_33) |
| `GET /api/agents/status` removed | DashboardPage, AgentMonitorPage | Pages replaced/deleted (PLAN_33/35) |
| `GET /api/agents/queue` removed | AgentMonitorPage | Page deleted (PLAN_33) |
| `POST /api/data/validate` removed | DataValidationPage | Page deleted (PLAN_33) |
| `GET /api/reports/summary` removed | DashboardPage | Page replaced by new DashboardPage (PLAN_35) |
| `POST /api/config` removed | SettingsPage | Already uses Encore admin API |

**Execution order**: Delete frontend pages first (PLAN_33) -> then delete backend routes (PLAN_34). Prevents 404 errors during development.

---

## Files to modify

- `website/backend/src/index.ts` — remove route registrations, remove inline auth (hardcoded USERS map + login/signup handlers), remove reports endpoint
- `website/backend/src/db.ts` — NO new tables (PLAN_32 already created them). Only remove references to deleted routes if any exist.

## Files to create

- `website/backend/src/routes/auth.routes.ts` — extracted + upgraded from inline, tenant-aware login with bcrypt + JWT

## Files to delete

- `website/backend/src/agents/` (entire directory, 10 files)
- `website/backend/src/routes/generate.routes.ts`
- `website/backend/src/routes/execute.routes.ts`
- `website/backend/src/routes/agents.routes.ts`
- `website/backend/src/routes/data.routes.ts`
- `website/backend/src/routes/config.routes.ts`
- `website/backend/src/models/schemas.ts` (6 Zod schemas, imported by nothing — dead code)

---

## Verification

After execution, confirm:

1. **Deletions verified**: `website/backend/src/agents/` directory gone, 5 mock route files gone, `schemas.ts` gone
2. **No orphan imports**: `index.ts` has zero references to deleted agents or routes
3. **Auth works**: `POST /api/auth/login` with seeded users returns valid JWT with `{ userId, username, role, clientId, schema }` payload
4. **Tenant resolution**: super_admin login resolves from `platform_users`, other roles resolve from `tenant_{schema}.users`
5. **Kept routes unaffected**: `chat.routes.ts`, `jira.routes.ts`, `test-cases.routes.ts` still respond correctly
6. **Backend starts clean**: `npm run dev` in `website/backend/` starts without errors or warnings about missing modules
7. **No new tables**: `db.ts` does NOT contain any CREATE TABLE statements added by this plan
