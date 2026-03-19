# PLAN 48: Agent Pipeline Overhaul — Master Plan

## Status: PENDING

## Context

A comprehensive audit revealed the agent pipeline has **systemic failures at every layer**. Agents go in circles because they're operating blind (no diagnostic data), crippled (missing MCP tools), and have no concept of application bugs (everything gets "healed" away). A real 500 API error on the pricing endpoint was missed because the diagnostics pipeline silently drops all data, the Healer can't navigate to verify, and even if it could — it would "fix" the test to accept the bug.

**Root causes found (7 categories, 25+ individual issues):**
- A: Data pipeline broken (agents get zero diagnostic data)
- B: Agent capabilities broken (Healer can't navigate/click)
- C: Error handling broken (silent failures everywhere)
- D: No bug detection concept (everything gets laundered)
- E: Pipeline orchestration broken (manual-only, unclear routing)
- F: No bug reporting in dashboard
- G: Cross-agent escalation system exists but is 100% dormant (agents never create escalations, no enforcement)

---

## Sub-Plan Index

| Sub-Plan | Category | Priority | Scope | Depends On |
|----------|----------|----------|-------|------------|
| **48A** | Diagnostics Pipeline Fix | P0-CRITICAL | fixtures.ts, agent-reporter.ts | Nothing |
| **48B** | Agent MCP & Capability Fix | P0-CRITICAL | All agent .md files | Nothing |
| **48C** | Error Handling & Save Verification | P1-HIGH | base-page.ts, page objects, adapters | Nothing |
| **48D** | Triage Classification & Bug Detection | P1-HIGH | healer.agent.md, diagnostics.ts, shared rules | 48A, 48B |
| **48E** | Pipeline Orchestration Fix | P2-MEDIUM | pipeline-config.json, agent handoffs | 48D |
| **48F** | Dashboard Bug Reporting UI | P2-MEDIUM | website frontend + backend | 48D |
| **48G** | Cross-Agent Escalation Enforcement | P1-HIGH | All agent .md files, shared rules, pre-run gates | Nothing |
| **48H** | Generator One-Shot Success (Upstream Quality + Artifact Discovery) | P0-CRITICAL | Generator + Planner agent prompts, post-complete gates, shared rules | Nothing |
| **48I** | Test Case Diversity | P1-HIGH | Planner agent prompt, shared rules | 48H |
| **48J** | Autonomous Pipeline Orchestration | P1-HIGH | pipeline.ts, pipeline-config.json, website UI | 48H, 48K, Plans 43-47 |
| **48K** | Worker MCP Bridge + Artifact Validation + Gate Execution | P0-CRITICAL | worker, orchestrator, types, pipeline-definition, MCP configs | Nothing |
| **48L** | Intelligent Failure Routing | P1-HIGH | failure-classifier, orchestrator routing, pipeline-definition | 48K |
| **48M** | Pre-Spec UI Walkthrough & Bug Detection | P0-CRITICAL | Generator + Planner + Healer agent prompts, shared rules | 48B, 48H, 48K |

**Execution order**: 48A + 48B + 48C + 48G + 48H + 48K in parallel (no dependencies) → 48D + 48I + 48L + 48M in parallel → 48E + 48F + 48J in parallel

---

## Verification Plan (End-to-End)

**After 48A**: Run pricing spec → failure-summary.json has non-empty networkFailures with 500 error
**After 48B**: Invoke Healer in Copilot → can browser_navigate and browser_click
**After 48C**: Run pricing spec → logs show `[FAIL] Save had API errors: 500 update-location-pricing`
**After 48D**: Invoke Healer on pricing failure → triages as BUG, generates report, does NOT heal
**After 48E**: Run full pipeline with autoInvoke → correct routing between agents
**After 48F**: Open dashboard → BugDiscoveryPanel shows pricing bug with evidence
**After 48G**: Healer finds stale TC → creates escalation for Planner → next Planner invocation shows PF-ESC → Planner resolves
**After 48H**: Generator finds Planner's existing selectors, spec passes on first run, no 2-hour iteration
**After 48I**: Planner creates Boundary/Accessibility/State TCs alongside Functional/Validation
**After 48J**: Click "Run" on website → pipeline auto-detects stage, runs to completion autonomously
**After 48K**: Worker spawns Claude CLI with `--mcp-config` → agents have browser tools. Orchestrator validates upstream artifacts before dispatching downstream stages. Pre-run and post-complete gates execute in autonomous pipeline.
**After 48L**: Generator fails with wrong selector → classified as `selector_not_found` → routed back to Planner (not Healer). Planner receives "UPSTREAM FIX REQUIRED" prompt with evidence.
**After 48M**: Generator walks through ALL TC steps on MCP before writing code. Catches dialog side effects (Reset mutation), API errors (403), timing races (phone2 async load). Planner documents dialog side effects + readiness signals. Healer uses mandatory MCP for selector failures instead of "last resort."
