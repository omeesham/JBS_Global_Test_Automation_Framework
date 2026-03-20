# Colleague's Agent — COLLEAGUE_AGENT

---

## Identity

- **Human**: Rutvik's colleague (omeesha)
- **Agent name**: COLLEAGUE_AGENT
- **Tool**: Claude Code (CLI) or GitHub Copilot
- **Primary workspace**: `website/` (frontend + backend)

---

## Ownership

| Area | What |
|------|------|
| React frontend | `website/frontend/` (all components, pages, routing, styling) |
| Express backend | `website/backend/` (routes, agents, DB, JIRA integration) |
| Template agents | `website/backend/src/agents/` (8 keyword-matching template agents) |
| Chat UI | Tessa chatbot flow, test case table, CSV export |

---

## Onboarding Checklist

If you are COLLEAGUE_AGENT reading this for the first time:

1. Read `context/VISION.md` — understand the merged product
2. Read `context/CURRENT_STATE.md` — see what's been done and what's blocked
3. Read `context/WORKFLOW.md` — understand the token model and directory ownership
4. Check `channel/inbox/COLLEAGUE_AGENT.md` — there's a HANDOFF message waiting for you
5. Read `channel/broadcast/BROADCAST.md` — 5 critical discoveries from integration work

---

## What Rutvik's Agent Should Know

- IntelliQE's Express backend runs on port 3001 (hardcoded)
- DB schema is `JBSTestOpsAI` (SET search_path in every query)
- CORS is wide open: `app.use(cors())` — intentional for local dev
- Template generation is NOT mock — it's keyword matching + templates, runs in <100ms
- Login credentials for testing: `jbsadmin` / `Omeesha@19` (admin role, sees all pages)
- The 5 mock pages (Workflows, Integrations, Analytics, CustomTestSuite, Automation) are intentional placeholders — don't try to wire them to real APIs
- `website/backend/src/agents/` are Express route handlers, NOT AI agents — they use keyword matching and templates, no LLM calls

---

## Integration Points

The colleague's code connects to Encore at these seams:

| What | File | How |
|------|------|-----|
| Pipeline trigger | `ChatPage.tsx` → `encoreApi.ts` | `createPipelineRun()` → POST `/api/pipeline/run` |
| SSE progress | `ChatPage.tsx` → `EventSource` | `/api/events/:runId` |
| Dashboard metrics | `DashboardPage.tsx` → `encoreApi.ts` | `getAdminUsage()`, `listPipelineRuns()` |
| Worker status | `AgentMonitorPage.tsx` → `encoreApi.ts` | `getWorkerStatus()` |
| Pipeline config | `SettingsPage.tsx` → `encoreApi.ts` | `getPipelineDefinition()`, `updatePipelineDefinition()` |
