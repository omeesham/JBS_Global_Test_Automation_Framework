# MASTER PLAN: Repo Unfucking & Client Delivery

**Status**: PENDING
**Created**: 2026-04-16
**Priority**: P1-CYCLE-2
**Parent**: none (master)

---

## Context

Repo is full of AI slop from months of Claude + Copilot sessions appending without cleanup. Colleague is BLOCKED waiting for a delivery folder to wire her FE to. Two phases: (1) unblock colleague NOW with min-req delivery folder, (2) clean everything.

**Delivery model**: Package min-req files into `encore_delivery/` folder, push. Colleague wires FE while we fix repo slop. After cleanup, ship polished V2. Colleague gives client the delivery folder.

**Scope**: ENTIRE REPO except `website/` (non-functional experiment, irrelevant), `node_modules/` (transient), and client-supplied `.docx` files (not our slop). Includes: all code, all MD/docs that agents edited, all agent files, all config, all scripts.

**Each subplan**: right-sized for one session. If a session finds its SP too big, it creates sub-subplans. Sessions have freedom to discover + fix issues the master plan didn't catch.

**Excludes from ALL subplans**: `website/`, `node_modules/` — never touched, never audited, explicitly out of scope per user directive.

---

## Execution Order

**Pivot 2026-04-16**: SP-01 was SUPERSEDED mid-session. User determined the duplicate-carve approach would be thrown away once a second client arrives; the correct model is a multi-tenant restructure where each client's work lives in `clients/{name}/` and the framework stays constant. That work is tracked in a new peer master plan: `PLAN_MULTI_TENANT_RESTRUCTURE.md` (SP-MT-01..07).

**Second pivot 2026-04-16 (WATCHDOG re-audit)**: SP-09 (Client Delivery Polish V2) was initially absorbed by SP-MT-07. Per user directive — *"we ship to colleague, they will ship to client, we ship everything in new structure, colleague decides what to give and what to not give… do not do work for colleague"* — client packaging / IP-scrub / bundle creation is colleague's scope after handoff, not ours. SP-09 is therefore SUPERSEDED and moved to `done/`; SP-MT-07 is reduced to producing a handoff document (`HANDOFF_TO_COLLEAGUE.md`).

```
SP-01: SUPERSEDED — see PLAN_MULTI_TENANT_RESTRUCTURE (SP-MT-01..07)
SP-09: SUPERSEDED — colleague's scope after multi-tenant handoff (see PLAN_MULTI_TENANT_RESTRUCTURE)

REMAINING CLEANUP (can partially parallelize):
  SP-13: Copilot Accountability Audit (P1 — before SP-02, need to know blame)
  SP-02: Claude/Copilot Consolidation (P1)
  SP-03: Agent File Restructure (P1)
  SP-04: Duplicate & Junk Purge (P1)

THEN (deeper cleanup, depends on P1 structure being stable):
  SP-05: Dead Code & Reusability (P2)
  SP-06: Doc & MD Slop Audit (P2)
  SP-07: Slop Prevention Guardrails (P2 — AFTER SP-02 through SP-06 establish locations)
  SP-10: Source Code Quality Sweep (P2)
  SP-11: Scripts, Config & Root Files Audit (P2)
  SP-12: Test Infrastructure Audit (P2)

LAST (after all slop fixed):
  SP-08: Rename jbs_framework (P3)
  SP-09: SUPERSEDED — colleague owns packaging after multi-tenant handoff
```

**Dependencies**:
- SP-01 blocks colleague → execute FIRST
- SP-13 informs SP-02 (know what's Copilot's fault before consolidating)
- SP-02 + SP-03 establish canonical file locations → SP-07 writes rules for those locations
- SP-05 through SP-12 are independent of each other (can run in any order)
- SP-08 is disruptive (breaks absolute paths) → do after cleanup stabilizes
- SP-09 DROPPED — packaging became colleague scope after the 2026-04-16 pivot

---

## Plan Disposition

| Existing Pending Plan | Action | Absorbed Into |
|---|---|---|
| PLAN_CLIENT_REPO_DELIVERY.md | SUPERSEDED | packaging = colleague scope (moved to done/) |
| PLAN_CODEBASE_CLEANUP.md | ABSORB | SP-05 |
| PLAN_MAINTAINER_SWEEP.md | ABSORB | SP-05 |
| PLAN_FULL_CHAIN_AUDIT.md | PARTIAL | SP-05 (code findings only) |
| PLAN_ACTIVITY_LOG_TIMESTAMP_GATE.md | ABSORB | SP-03 |
| PLAN_PLANS_INDEX_AUTOREGEN.md | ABSORB | SP-04 |
| PLAN_AUDIT_COPILOT.md | PROCESS | SP-13 (extract learnings, close plan) |

Plans NOT absorbed (separate initiatives, keep as-is):
PLAN_BUG_HUNTING_RULEBOOK_V2, PLAN_PLAYWRIGHT_CLI_ADOPTION, PLAN_VISUAL_DEBUG_SKILL,
PLAN_CHAT_UI_BUGS (website-related, effectively dead), PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE,
PLAN_HISTORY_INTEGRATION_*, PLAN_TEST_DATA_CSV_CONVERSION, PLAN_GENERATOR_AUDIT_AUTO_ADDON,
PLAN_HEALER_INSPECTOR_QA_REPORT_V1.1, PLAN_PRICING_TEST_COVERAGE_AUDIT_AND_FIX,
PLAN_HIST_COMMIT_HISTORY_WORK

---

## Subplan Summary

| SP | Title | Priority | One-liner |
|---|---|---|---|
| 01 | ~~Client Delivery Quick Build~~ SUPERSEDED | — | Absorbed into PLAN_MULTI_TENANT_RESTRUCTURE (see SP-MT-01..07) |
| 02 | Claude/Copilot Consolidation | P1 | Claude = SOT, Copilot = thin pointer |
| 03 | Agent File Restructure | P1 | Move agent infra from specs_planning/_internal/ to .claude/pipeline/ |
| 04 | Duplicate & Junk Purge | P1 | Kill 3 allure dirs, 2 export dirs, root trash, logs, dist, MCP cache |
| 05 | Dead Code & Reusability | P2 | Delete 1,150+ lines dead code, extract duplicated patterns |
| 06 | Doc & MD Slop Audit | P2 | Audit every agent-edited MD for stale refs, contradictions, bloat |
| 07 | Slop Prevention Guardrails | P2 | Pre-commit hooks, agent verification scripts, health checks |
| 08 | Rename jbs_framework | P3 | Replace ~79 "encore_framework" references |
| 09 | ~~Client Delivery Polish V2~~ SUPERSEDED | — | Packaging = colleague scope post-handoff (file moved to done/) |
| 10 | Source Code Quality Sweep | P2 | Audit src/ for duplicated patterns, dead code, AI slop |
| 11 | Scripts, Config & Root Files Audit | P2 | Audit scripts/, config/, root configs, .gitignore |
| 12 | Test Infrastructure Audit | P2 | Audit tests/ structure, test-data, fixtures, seed spec |
| 13 | Copilot Accountability Audit | P1 | Trace Copilot fuckups — their fault or our gap? |
