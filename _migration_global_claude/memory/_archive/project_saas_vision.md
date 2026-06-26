---
name: QA SaaS Product Vision
description: Multi-tenant chat-first QA SaaS — clients, websites, admin tiers, dual-model chatbot, Claude CLI for cost efficiency.
type: project
---

## Product Vision

The QA SaaS is **chat-first, multi-tenant by design**:
- Primary UX: AI chatbot (dual-model: haiku for speed, sonnet for depth) that triggers runs, answers questions, manages pipeline — all through conversation
- Secondary UX: Traditional pages (Runs, RunDetail, NewRun, Settings) as alternative navigation
- Both modes backed by the REAL Encore backend — zero mock data anywhere
- Encore Global is the FIRST client, architecture supports unlimited clients

## Multi-Tenant Model (decided 2026-03-13)
- **Clients** = organizations (Encore, Hilton, etc.)
- **Websites** = apps a client wants tested (Navigator4 for Encore)
- **Users** belong to a client, have roles
- **Admin tiers**: super_admin (all clients), client_admin (own client), qa_engineer (assigned websites), viewer (read-only)
- Client = 1+ websites. Admins manage everything for their tier.
- Separate JBSTestOpsAI schema for tenant data, Encore backend (public schema) stays untouched

## Claude CLI Strategy
- Pipeline worker: `claude -p` with Max subscription ($0 cost)
- Chatbot: haiku for intent routing (1-3s), sonnet escalation for complex reasoning
- Both use Claude CLI, not Anthropic API — cost-free with Max subscription
- Long-term: if switching to API, haiku is 10x cheaper per token (smart default)

## Architecture Decisions
- Dual-model chatbot over hybrid (pattern matching + CLI) — all messages go through AI, no brittle rules
- Keep 2 PostgreSQL schemas separate (JBSTestOpsAI + public) — clean separation
- Website-run mapping table bridges Encore pipeline to tenant model without modifying Encore backend
- Frontend team's visual polish is valuable — keep Tailwind/shadcn styling, replace logic underneath
