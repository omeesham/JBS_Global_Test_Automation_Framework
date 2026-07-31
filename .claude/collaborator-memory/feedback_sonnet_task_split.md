---
name: Sonnet task type split
description: Split plans into SONNET-SAFE (file edits) vs OPUS-ONLY (MCP, RCA, browser) sections. Sonnet burned 70% tokens on MCP browser improvisation.
type: feedback
---

Split plans into two sections for model-appropriate execution:
- **[SONNET-SAFE]**: code changes, file edits, spec writing, page objects, doc updates (deterministic, plan-scripted)
- **[OPUS-ONLY]**: MCP browser verification, RCA, debugging, adaptive judgment tasks

**Why:** Sonnet max session on PLAN_AUDIT_SHARED_SETUP delivered all code correctly but burned ~70% of 35k tokens on MCP browser interaction (stale refs, JS clicks not registering on Angular, search debounce timing, retaking snapshots 15+ times). MCP requires adaptive improvisation that Sonnet can't do.

**How to apply:** When writing plans, tag each step. Sonnet executes SONNET-SAFE sections. Opus executes OPUS-ONLY sections. Neither touches the other's section.

**Enforcement (2026-04-07):** CLAUDE.md Model-Aware Guardrails now has [HALT] gate — same mechanism as /identity file ownership. Sonnet reaching for MCP tools = "[HALT] BLOCKED. Write handoff note, skip step." Not advisory text — a tool-level gate. Full guardrails (checklists, breadcrumbs): `/sonnet` SKILL.md.
