# PLAN_38: Multi-Tenant Wiring + SSE Proxy

**Status**: Pending
**Dependencies**: PLAN_32 (schema + seed data), PLAN_35 (SuperAdminPanel component), PLAN_36 (ChatPage rewrite)
**Scope**: Wire tenant middleware, SSE proxy, super admin endpoints, frontend contexts. Schema exists from PLAN_32.

---

## Vision

Multi-tenant QA automation SaaS. Schema foundation built in PLAN_32. This plan WIRES everything together: tenant middleware, SSE proxy, super admin endpoints, frontend contexts.

- **Clients** (organizations) — Encore Global, Hilton, Marriott, etc.
- **Websites** (apps to test) — each client has 1+ websites
- **Users** — belong to a client, roles named per client wish (QA, Data Engineer, etc.)
- **Admins** — JBS-controlled, NOT client self-managed:
  - **Super Admin** (JBS god) — sees everything, manages all clients/admins/users, platform insights, own dashboard
  - **Client Admin** (JBS-controlled) — overlooker for one client, assigned by JBS
  - **QA Engineer** — standard user, triggers runs, views results
  - **Data Engineer** — data-focused user, same capabilities as QA

---

## Data Model — Already Created in PLAN_32

**All schema SQL lives in PLAN_32.** This plan does NOT create tables — it WIRES them:
- Tenant middleware reads JWT → looks up client's schema → sets search_path
- Express routes query the correct tenant schema
- Frontend contexts load client/website data from the correct schema

---

## Why Hybrid (not pure per-client DB or pure shared)

1. **Encore pipeline engine is shared** — pipeline_runs, stage_results, artifacts, worker_tasks in `public` schema. Engine doesn't need tenant awareness.
2. **Client data fully isolated** — chat history, test cases, JIRA, users per-schema. SQL injection can't leak cross-tenant.
3. **website_runs mapping in shared admin schema** — super_admin needs cross-client visibility.
4. **Schema provisioning** on client onboarding:
   - INSERT INTO JBSTestOpsAI.clients (name, slug, db_schema)
   - CREATE SCHEMA IF NOT EXISTS "tenant_{slug}"
   - Run migration SQL to create all tables in new schema
   - Seed client_admin user (JBS-assigned)
5. **Connection handling** — Express middleware extracts client_id from JWT → looks up db_schema → sets search_path.

---

## Seed Data — Already Done in PLAN_32

All seed data (Encore Global client, Navigator4 website, 3 Encore users, super admin, platform settings) is created in PLAN_32. This plan only references existing data.

---

## Access Control Matrix

| Role | Own client data | Other clients | Manage websites | Manage users | Trigger runs | Dashboard scope |
|------|----------------|---------------|-----------------|-------------|--------------|----------------|
| super_admin | Yes | Yes (all) | Yes (all) | Yes (all) | Yes (all) | Platform-wide metrics |
| client_admin | Yes | No | Yes (own) | Yes (own) | Yes (own) | Client-scoped |
| qa_engineer | Yes | No | No | No | Yes (assigned) | Client-scoped |
| data_engineer | Yes | No | No | No | Yes (assigned) | Client-scoped |

**client_admin is JBS-controlled.** Clients do NOT self-manage their admin account.

---

## Frontend Architecture

### Website switcher in header (not sidebar)

```
┌──────────────────────────────────────────────────┐
│  [Encore Global ▼]  [Navigator4 ▼]  │ User ▼ │
│  (client)           (website)        │        │
└──────────────────────────────────────────────────┘
```

- Client dropdown: Super admins see all clients. Others see their own client only.
- Website dropdown: Shows websites belonging to selected client.
- All pages filter data by selected website.
- Chatbot prompt includes selected website context + enabled services.

### React contexts

- `ClientContext` — active client + role-based visibility
- `WebsiteContext` — active website + config + enabled services
- These wrap the entire app inside `AuthContext`

### Data flow

```
Login → AuthContext (user + role + client_id + schema)
  → ClientContext (load client, load websites)
    → WebsiteContext (selected website, config, enabled_services)
      → All pages filter by website_id
      → Chatbot includes website context + services in prompts
      → Chatbot pre-fills targetUrl when creating runs
      → Dashboard shows only runs for selected website
      → Settings scoped to current client + website
```

---

## Pipeline Run Association (Encore backend UNTOUCHED)

**Creating a run:**
1. `POST /api/pipeline/run` (Encore backend) → get `runId`
2. `POST /api/website-runs` (Express) → store `{ website_id, run_id, client_id, created_by }`
3. Subscribe to SSE through proxy (see below)

**Listing runs (server-side filtering — prevents data leaks):**
1. Frontend: `GET /api/website-runs?website_id={id}` (Express)
2. Express: fetches from Encore, JOINs with `JBSTestOpsAI.website_runs` filtered by client
3. Returns ONLY authorized runs — tenant isolation at DB level

**CRITICAL: Frontend NEVER calls Encore /api/pipeline/list directly.** All pipeline data proxied through Express which enforces tenant isolation via schema + website_runs.

Encore backend has ZERO knowledge of tenancy. All multi-tenant logic lives in Express. Clean separation.

---

## Super Admin Dashboard (PRIORITY — built in PLAN_35, wired to real data here)

PLAN_35 creates the `SuperAdminPanel.tsx` component. PLAN_38 wires it to real cross-tenant data:
- All clients, all websites, all runs across the platform
- Usage/cost aggregated per client
- Client onboarding (create client → provisions schema → seed admin → invite users)
- Platform health (all workers, all pipeline configs)
- Model usage breakdown (haiku/sonnet/opus per client)
- Custom solution request queue (pending review, approved, rejected)

**New endpoints (super_admin only):**
- `GET /api/admin/platform-stats` — cross-client metrics
- `GET /api/admin/client-usage` — per-client usage breakdown
- `GET /api/admin/custom-requests` — pending custom solution requests
- `POST /api/admin/custom-requests/:id/review` — approve/reject custom solution

---

## SSE Proxy for Multi-Tenant Security (~100 LOC, distinct subtask)

The Encore backend's SSE endpoint `GET /api/events/:runId` has NO authentication — anyone with a runId can subscribe. In multi-tenant mode, this is a data leak.

**Solution**: Proxy SSE through the website backend with tenant validation:
```
Frontend → GET /api/website-runs/:runId/events (website backend)
  → Website backend validates: does this runId belong to the user's website?
  → If yes: proxy SSE from Encore GET /api/events/:runId to the client
  → If no: 403 Forbidden
```

### Implementation

1. **New Express route**: `GET /api/website-runs/:runId/events` (~30 LOC)
   - JWT auth middleware extracts user → client → websites
   - Query website_runs table: `SELECT 1 FROM website_runs WHERE run_id = $1 AND website_id = ANY($2)`
   - If unauthorized: 403. If authorized: pipe SSE from Encore.

2. **SSE proxy handler** (~40 LOC)
   - Open upstream connection to `${ENCORE_URL}/api/events/${runId}` using `http.get()`
   - Set response headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`
   - Pipe upstream data chunks to client response
   - Handle upstream close/error → close client connection
   - Handle client disconnect → abort upstream request

3. **Vite proxy config update** (~5 LOC)
   - Route `/api/events` to Express (:3001) instead of Encore (:3100)

4. **Frontend `subscribeToPipelineEvents()` update** (~10 LOC)
   - Change endpoint from `/api/events/:runId` to `/api/website-runs/:runId/events`
   - Add JWT Authorization header to EventSource (via polyfill — native EventSource doesn't support headers, use `event-source-polyfill` package)

5. **Tests**: verify 403 for cross-tenant runId, verify SSE data flows through proxy

---

## Input Validation for Chatbot Endpoint

The `/api/chat/ask` endpoint must validate:
- `message`: max 5000 characters (prevents prompt overflow)
- `conversationId`: must be valid UUID
- Rate limit: max 10 requests per minute per user (prevents abuse)
- Conversation history: load last 20 messages but cap total token estimate

---

## Chatbot Website Awareness

System prompt includes:
```
You are a QA automation assistant.
Current client: Encore Global (enterprise plan)
Current website: Navigator4
  URL: https://cloudapps-e2e.encoreglobal.com/navigator/
  Auth: Microsoft SSO
  Framework: Radix UI
  Modules: locations, currency, pricing, local-info
  Default test target: Office 1604 (The Parker Palm Springs)
Worker status: Online
This website's recent runs: [3 completed, 1 running]
```

---

## Files to modify

- `website/backend/src/db.ts` (add shared admin tables + schema provisioning functions)
- `website/backend/src/index.ts` (register new routes, add tenant middleware)
- `website/frontend/src/pages/ChatPage.tsx` (use website context + enabled services)
- `website/frontend/src/pages/DashboardPage.tsx` (filter by website, wire SuperAdminPanel)
- `website/frontend/src/pages/SettingsPage.tsx` (wire UserManagement + ClientManagement tabs)
- `website/frontend/src/components/layout/Header.tsx` (client/website switcher)

## Files to create

- `website/backend/src/middleware/tenant.middleware.ts` (JWT → client_id → search_path)
- `website/backend/src/services/tenant.service.ts` (schema provisioning, migration runner — function exists in PLAN_32)
- `website/backend/src/routes/clients.routes.ts`
- `website/backend/src/routes/websites.routes.ts`
- `website/backend/src/routes/website-runs.routes.ts` (includes SSE proxy)
- `website/backend/src/routes/admin.routes.ts` (super_admin platform stats + custom request review)
- `website/backend/src/services/clients.service.ts`
- `website/backend/src/services/websites.service.ts`
- `website/frontend/src/contexts/ClientContext.tsx`
- `website/frontend/src/contexts/WebsiteContext.tsx`

---

## Verification

- [ ] Tenant middleware correctly sets search_path from JWT client_id
- [ ] SSE proxy returns 403 for cross-tenant runId access
- [ ] SSE proxy correctly pipes event stream from Encore to authenticated client
- [ ] ClientContext loads correct client data based on user role
- [ ] WebsiteContext loads websites for selected client
- [ ] Super admin endpoints return cross-tenant aggregated data
- [ ] Website switcher in header shows correct options per role
- [ ] Frontend never calls Encore /api/pipeline/list directly
- [ ] Schema provisioning automation works for new client onboarding
- [ ] Input validation on /api/chat/ask rejects oversized/malformed requests
- [ ] Rate limiting enforced on chatbot endpoint
