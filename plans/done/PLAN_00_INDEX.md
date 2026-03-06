# Pipeline Overhaul — Master Index

**Date**: 2026-03-02
**Trigger**: Generator wasting hours on fake RCA, planner skipping test cases, agents going in circles
**Goal**: Make agents work like a manual QA — see everything, plan before acting, debug efficiently
**Overall Status**: ALL PLANS COMPLETE

## Agent Identities (Core Roles)

| Agent | Identity | One-Liner |
|-------|----------|-----------|
| Requirements | **HUNTER** | Explore everything on the page independently. Prompt = starting point, DOM = truth. Amplify, don't just verify |
| Planner | **GIVER** | Deliver enough MCP-verified data that Generator one-shots spec creation. Generator should NEVER discover anything on its own |
| Generator | **MOST IMPORTANT** | The production engine. One-shot specs from planner's verified data. Artifact-first RCA when things fail |
| Healer | **SPECIALIZED RCA DEBUGGER** | Same 7-step artifact-first RCA as Generator. Reads spec code, replicates exact steps. No random browsing |
| Audit | **COMPREHENSIVE WATCHDOG** | Knows how to audit every agent type specifically. Audits itself. Produces actionable remediation prompts |

## Problem Summary

1. **Planner creates shit test cases** — skips save+persist tests, wrong field counts, wrong selectors, uncertain language
2. **Generator wastes hours on fake RCA** — goes in circles because planner didn't verify DOM, selectors are all wrong
3. **No agent forces a detailed plan before execution** — they jump straight to code and discover problems mid-flight
4. **RCA is broken** — agents can't replicate failures efficiently, don't read traces/screenshots/videos
5. **Code is duplicated everywhere** — same save dialog, tab navigation, checkbox logic in 3+ page objects
6. **Agents run full spec instead of failing tests** — wastes 2+ minutes per debug cycle
7. **Planner and Requirements do MCP exploration but their output is garbage** — generator re-discovers everything
8. **Healer has weak RCA** — jumps to MCP too early, doesn't read error-context.md, browses randomly
9. **Audit agent is surface-level** — doesn't know agent-specific quality criteria, doesn't audit itself

<!-- SURGICAL EDIT 2026-03-03 by Copilot — Added problems #10, #11, #12
     WHY: User raised 5 concerns not fully covered in original problem summary.
     #10: User reported MCP server dying repeatedly (exit code 4294967295).
     #11: User directive: "only highly reusable code in specs" — page-level DRY existed (problem #5)
           but spec-level duplication was not called out.
     #12: User directive: agents follow TCs blindly even when live site shows different data.
     EVIDENCE: User provided MCP server crash logs. All 3 concerns confirmed as real gaps by
     two independent reviewers. -->
10. **MCP server killed by agent actions** — agents run concurrent playwright tests while MCP browser is open, execute heavy browser_evaluate scripts, or blanket-kill node processes. Exit code 4294967295 = forcible termination
11. **Spec-level code duplication** — same setup, navigation, assertion patterns copy-pasted across spec files. Page object DRY exists but spec-level DRY not enforced
12. **Agents follow test cases blindly when live site differs** — no truth hierarchy. When MCP shows data different from TC/Jira/requirements, agents force the spec to match the wrong TC instead of reporting the discrepancy

## Plan Files

| # | File | What It Fixes | Status |
|---|------|--------------|--------|
| 01 | [PLAN_01_PLANNER_OVERHAUL.md](PLAN_01_PLANNER_OVERHAUL.md) | Planner = GIVER. Full Manual QA Protocol. MCP_VERIFICATION_LOG. Generator-Ready Package | DONE 2026-03-03 |
| 02 | [PLAN_02_GENERATOR_OVERHAUL.md](PLAN_02_GENERATOR_OVERHAUL.md) | Generator = MOST IMPORTANT. Phase 0 plan. Golden Reference. 7-Step artifact-first RCA. --grep debug | DONE 2026-03-03 |
| 03 | [PLAN_03_RCA_PROTOCOL.md](PLAN_03_RCA_PROTOCOL.md) | Unified 7-step RCA for all agents. Artifact locations. Category-based routing | DONE 2026-03-04 |
| 04 | [PLAN_04_CODE_REUSABILITY.md](PLAN_04_CODE_REUSABILITY.md) | Extract ~230 lines duplicated code to BasePage. DRY mandate | DONE 2026-03-03 |
| 05 | [PLAN_05_SHARED_RULES_UPDATE.md](PLAN_05_SHARED_RULES_UPDATE.md) | 32 new rules + 4 updated rules across all agents | DONE 2026-03-03 |
| 06 | [PLAN_06_EXISTING_FIXES.md](PLAN_06_EXISTING_FIXES.md) | Apply 10 fixes from PIPELINE_FIX_PLAN.md (context builder, trust thresholds, etc.) | DONE 2026-03-03 |
| 07 | [PLAN_07_HEALER_OVERHAUL.md](PLAN_07_HEALER_OVERHAUL.md) | Healer = SPECIALIZED RCA DEBUGGER. Same 7-step RCA as Generator. Targeted --grep runs | DONE 2026-03-03 |
| 08 | [PLAN_08_AUDIT_OVERHAUL.md](PLAN_08_AUDIT_OVERHAUL.md) | Audit = COMPREHENSIVE WATCHDOG. Agent-specific checklists. Pipeline infra checks. Self-audit | DONE 2026-03-03 |

## Execution Order

1. **Read all 8 plans first** — understand the full scope
2. **PLAN_06** first (existing fixes) — unblocks context builder, trust progression
3. **PLAN_04** next (code reusability) — reduces code agents need to write
4. **PLAN_05** next (shared rules) — establishes new mandates for all agents
5. **PLAN_01** next (planner overhaul) — fixes the root cause (garbage input)
6. **PLAN_02** next (generator overhaul) — generator can now trust planner output
7. **PLAN_07** next (healer overhaul) — healer gets same RCA capability as generator
8. **PLAN_08** next (audit overhaul) — audit knows how to check each agent properly
9. **PLAN_03** last (RCA protocol) — unified protocol in shared rules for all agents

## Success Criteria

- Requirements agent HUNTS: explores everything independently, amplifies prompt data
- Planner GIVES: delivers MCP-verified test cases with exact selectors, values, save dialogs
- Generator ONE-SHOTS: creates specs that pass on first run from planner's data
- Healer DEBUGS EFFICIENTLY: reads artifacts first, replicates spec steps exactly, --grep only
- Audit CATCHES EVERYTHING: agent-specific checklists, pipeline infra checks, self-audits
- RCA for any failure takes < 5 minutes (read artifacts → replicate → fix)
- No duplicated code across page objects
- Agents run only failing tests during debug, not full spec
<!-- SURGICAL EDIT 2026-03-03 by Copilot — Added 3 success criteria from user concerns -->
- **Live MCP always overrides any prior TC/planner data** — agents report discrepancies instead of forcing specs to match wrong TCs
- **No spec-level code duplication** — patterns used 2+ times extracted to fixtures/helpers
- **MCP server stays alive** — no agent actions cause server exit code 4294967295

## New Rules Summary (PLAN_05)

<!-- SURGICAL EDIT 2026-03-03 by Copilot — Updated counts after ID renumbering and new rules
     WHY: ALL-013..016 renumbered to ALL-020..023 (PLAN_06 owns ALL-013..019 per execution order).
     Added: ALL-024 (truth hierarchy), ALL-025 (self-unblocking), ALL-026 (spec DRY),
     ALL-027 (MCP crash recovery), GEN-021 (wrong TC reporting), GEN-022 (spec pattern search),
     AUD-013 (audit new rules). Updated: ALL-008 (expanded MCP stability).
     Old total: 25 new + 3 updated. New total: 32 new + 4 updated. -->

| Section | New IDs | Count |
|---------|---------|-------|
| Shared | ALL-021 to ALL-027 (ALL-020 pre-existing from PLAN_04) | 7 |
| Requirements | REQ-010 to REQ-013 (REQ-006..009 pre-existing from PLAN_06) | 4 |
| Planner | PLN-018 to PLN-022 | 5 |
| Generator | GEN-016 to GEN-022 | 7 |
| Healer | HLR-009 to HLR-011 | 3 |
| Audit | AUD-011 to AUD-013 | 3 |
| **Updated** | ALL-008, ALL-010, GEN-005, GEN-007 | 4 |
| **ID Note** | PLAN_06 owns ALL-013..019 + REQ-006..009. PLAN_04 owns ALL-020 | — |
| **Total** | | **29 new + 4 updated** (was 32; 3 moved to pre-existing) |
