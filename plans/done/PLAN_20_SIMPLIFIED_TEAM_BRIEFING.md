# PLAN_20 — Simplified Team Briefing (v3)

**Purpose**: Non-technical summary of the SaaS platform plan.
**Date**: 2026-03-09 (updated from 2026-03-06)

---

## What Are We Building?

A website where clients log in, describe what they want tested in plain English, and our AI agents do everything automatically. Clients never see code, git, or terminals.

**Three main components:**

1. **Website** — clients log in, submit requests, watch progress, download results
2. **Backend server** — receives requests, manages queues, streams live updates
3. **Orchestrator SDK** — the engine that knows which agent runs next, checks quality, handles the fix-retry loop

---

## How Does It Work?

```
Client opens website
  → Types: "I need tests for the invoice approval page"
  → Picks their app's URL
  → Clicks Submit
  → Watches a live timeline:

    [done] Requirements gathered
    [done] Test cases planned
    [now]  Tests being written...
    [    ] Quality check
    [    ] Done!

  → If quality check finds issues:
    [now]  Fixing (attempt 1 of 3)...

  → Eventually: "Done!" (download files) or "Needs Review" (our team steps in)
```

---

## Key Decisions (What Changed from v1)

| Decision | Why |
|----------|-----|
| **Claude Agent SDK** (not CLI) | Commercial terms. In-process execution. Budget caps per run. |
| **PostgreSQL Row-Level Security** | Database ENGINE blocks cross-tenant access. Not just application code. |
| **Per-tenant BullMQ queues** | One tenant can't starve others. Max 2 concurrent runs per tenant. |
| **Custom MCP for test running** | Agents can't use shell commands (security). Custom tool runs tests safely. |
| **Docker volumes** (not containers) | Isolated file storage without container startup overhead. |
| **Redis pub/sub for events** | Live updates cross from worker process to API server to client browser. |
| **S3 for all files** | Pre-signed URLs for downloads. Lifecycle policies auto-archive/delete old data. |

---

## Data Safety — Cross-Tenant Isolation

**Agents working for Client A can NEVER access Client B's data.** Enforced at 3 levels:

1. **Database**: PostgreSQL RLS policies. Even buggy code can't read wrong tenant's rows.
2. **Files**: Docker volumes per tenant. Agents can only read/write their own workspace.
3. **Network**: MCP servers configured per-tenant with their specific target URL only.

---

## What Clients See vs What's Protected

| Clients GET | Clients NEVER see |
|-------------|------------------|
| Generated test files (.spec.ts) | Agent prompts / AI instructions |
| Test results (pass/fail, screenshots) | Pipeline orchestration logic |
| Test case documentation | Internal quality reports |
| CI/CD config templates | Other clients' anything |
| Cost breakdown per run | How our agents work internally |

---

## Cost Structure

- Agents use **cheaper models for simple tasks** (Haiku for parsing) and **smarter models for hard tasks** (Sonnet for code generation)
- Every run has a **budget cap** ($2 default)
- Every tenant has a **monthly budget limit**
- Per-run cost: estimated **$0.15-0.40**

---

## Data Lifecycle (Nothing Grows Forever)

| Data | Keep Hot | Archive | Delete |
|------|----------|---------|--------|
| Generated test specs | Forever | Never | Never (client's IP) |
| Test results | 90 days | 1 year | 3 years |
| Debug screenshots | 7 days | 30 days | 90 days |
| Billing records | 1 year | 7 years | Never (legal) |
| Error logs | 14 days | 90 days | 1 year |

---

## Capacity (v1)

- **5 concurrent pipelines** max globally
- **2 per tenant** max
- **~30 tenants** before queuing becomes an issue
- Scale trigger: add worker nodes when avg wait >15 min

---

## Build Order

1. Database + workspace isolation (foundation)
2. Orchestrator SDK + agent runner (core engine)
3. Job queue + worker pool (scaling)
4. Backend API + SSE events (connectivity)
5. S3 + artifact management (file delivery)
6. Frontend website (user experience)
7. Data lifecycle automation (maintenance)

---

## What's NOT in v1

- Mobile design (desktop-first)
- Email/Slack notifications
- SSO/SAML enterprise auth
- Horizontal auto-scaling (manual worker scaling for now)
- Custom domains per tenant

---

## Self-Audit Results

Plan was self-audited with 21 findings (4 CRITICAL, 5 HIGH, 8 MEDIUM, 4 LOW). All resolved in v3. Key fixes:
- Agent SDK API usage corrected (async generator, not await)
- BullMQ per-tenant isolation fixed (groupKey is Pro-only)
- Test execution via custom MCP tool (agents can't use Bash)
- Tool blocking via `disallowedTools` (not `allowedTools`)
- SSE event routing via Redis pub/sub (cross-process bridge)

Full audit log in main plan document appendix.
