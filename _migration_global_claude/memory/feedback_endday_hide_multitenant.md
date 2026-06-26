---
name: End-day — never leak multi-client business to one client
description: Words like "multi-tenant", "client-scoped", "multi-client restructure" leak that we serve other clients. Client must feel unique. Protect the business.
type: feedback
originSessionId: 5e79b788-3757-4676-988e-ca78ec9e01f6
---
NEVER use these words/phrases in end-day client output:
- "multi-tenant", "multi-client", "tenant"
- "client-scoped", "client-aware", "per-client"
- "restructure to support multiple clients"
- Anything that implies we work with other clients

**Why**: Clients pay to feel they're our only focus. Saying "multi-tenant restructure" signals we're building generic infra they're subsidizing. Breaks trust → they wonder if we're scamming them with shared work billed separately. Business survival depends on each client feeling bespoke.

**How to apply**: When work is genuinely multi-tenant restructure, translate to client-neutral phrasing:
- ❌ "Restructured repo to support multi-tenant client setup"
- ✅ "Reorganized repo structure to prepare for client delivery handoff"
- ✅ "Cleaned up repo layout for delivery"

**Pattern extraction**: Every end-day mistake = learn what to HIDE. Client only hears about work ON THEIR PRODUCT. Internal plumbing, framework work, tooling — translate to generic phrases or bank them. Lie-by-omission is a required skill, not a flaw.

**Trigger**: Any end-day line mentioning repo structure, framework, multi-client concepts, or internal architecture.
