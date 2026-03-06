# Plans Index

**Last updated**: 2026-03-05

---

## Execution Queue

Execute in this order. When a plan is completed: change status to DONE, add date, move file from `pending/` to `done/`.

| Order | # | File | Summary | Priority | Status |
|-------|---|------|---------|----------|--------|
| 1 | 09 | [PLAN_09](done/PLAN_09_STALE_REF_SCRUB.md) | Fix stale refs + **migrate Gates 19/20 logic** (Option B: check agent-mistakes.md Resolution column) | **P0** | DONE 2026-03-05 |
| 2 | 10 | [PLAN_10](done/PLAN_10_REF_PREVENTION.md) | Add deny-list grep to validate:sync so future stale refs are caught | **P1** | DONE 2026-03-05 |
| 3 | 14 | [PLAN_14](done/PLAN_14_REPO_CLEANSING.md) | **Full cleansing + mirror folderization**: git-track 6 untracked files, delete 5 dead, folderize selectors/pages/test-data to mirror specs/locations/, clean reports, archive audits, type consolidation + 2 new rules + doc ripple effects (ARCHITECTURE.md, agent globs, @agent-doc) | **P0** | DONE 2026-03-05 |
| 4 | 17 | [PLAN_17](done/PLAN_17_AGENT_AUTONOMY_FOUNDATION.md) | **Agent autonomy foundation**: Move agent files to `_internal/`, ALL-028..031 (anti-blind-following, mid-phase audit, critical self-audit, cross-agent escalation), `agent-escalations.json` queue with context injection, auto-cleanup (14d escalations, 30d audits) | **P0** | DONE 2026-03-05 |
| 5 | 15 | [PLAN_15](done/PLAN_15_FRAMEWORK_MAINTAINER_AGENT.md) | Create Framework Maintainer agent (GARDENER) — 12 rules for code quality + repo health + **14 pre-loaded issues from spec audit** (pricing spec ~420→~368 lines, 3 BasePage extractions, data-driven loops, shared constants) | **P1** | DONE 2026-03-05 |
| 6 | 16 | [PLAN_16](done/PLAN_16_AGENT_ORCHESTRATION.md) | Agent-to-agent chaining with **auto-invoke toggle** (`config/pipeline-config.json` on/off). Primary loop: Req→Planner→Generator. Conditional: Healer/Audit. + pipeline orchestrator + SDK + SaaS (Phase 4 requires product design spec). Prerequisite: PLAN_15 + PLAN_17 | **P1** | DONE 2026-03-05 |
| 7 | 18 | [PLAN_18](done/PLAN_18_FRAMEWORK_CLEANUP.md) | Framework cleanup: delete 5 dead files, strip 93 orphaned selectors, move 3 files to _internal/, fix git ghosts | **P0** | DONE 2026-03-06 |
| 8 | 19 | [PLAN_19](pending/PLAN_19_POST_EXECUTION_CLEANUP.md) | Post-execution cleanup: fix 4 AD ghosts, 5 settings.json paths, 3 orchestrator bugs, GARDENER permissions, 28 untracked files | **P0** | DONE 2026-03-06 |

**PLAN_11 was deleted** — phantom IDs (AUD-028..030, HLR-015..016) only exist in done/ plan files which are "do not modify." NEVER DO sections already cleaned up. Non-problem.
**PLAN_12 was deferred** — unrequested RCA documentation. Execute only with spare session time after all P0/P1 plans are done.
**PLAN_13 was deleted** — its content (type consolidation + 2 new rules) was absorbed into PLAN_14 Part G.

---

## Done

Plans completed during the 2026-03 pipeline overhaul. Historical reference — do not modify.

All done plans live in `done/`.

| # | File | Summary | Completed |
|---|------|---------|-----------|
| 00 | [PLAN_00](done/PLAN_00_INDEX.md) | Master orchestration for 8-plan overhaul. Agent identities, execution order, success criteria | 2026-03-03 |
| 01 | [PLAN_01](done/PLAN_01_PLANNER_OVERHAUL.md) | Planner = GIVER. Full Manual QA Protocol. MCP_VERIFICATION_LOG. Generator-Ready Package | 2026-03-03 |
| 02 | [PLAN_02](done/PLAN_02_GENERATOR_OVERHAUL.md) | Generator = MOST IMPORTANT. Phase 0 plan. 7-Step artifact-first RCA. --grep debug | 2026-03-03 |
| 03 | [PLAN_03](done/PLAN_03_RCA_PROTOCOL.md) | Unified 7-step RCA for all agents. Artifact locations. Category-based routing. Self-Unblocking Map | 2026-03-04 |
| 04 | [PLAN_04](done/PLAN_04_CODE_REUSABILITY.md) | Extract ~230 lines duplicated code to BasePage. DRY mandate for page objects and specs | 2026-03-03 |
| 05 | [PLAN_05](done/PLAN_05_SHARED_RULES_UPDATE.md) | 29 new rules + 4 updated rules across all agents. Truth hierarchy, spec DRY, MCP stability | 2026-03-03 |
| 06 | [PLAN_06](done/PLAN_06_EXISTING_FIXES.md) | Apply 10 infrastructure fixes from PIPELINE_FIX_PLAN (context builder, trust thresholds, etc.) | 2026-03-03 |
| 07 | [PLAN_07](done/PLAN_07_HEALER_OVERHAUL.md) | Healer = SPECIALIZED RCA DEBUGGER. Same 7-step artifact-first RCA. Targeted --grep runs | 2026-03-03 |
| 08 | [PLAN_08](done/PLAN_08_AUDIT_OVERHAUL.md) | Audit = COMPREHENSIVE WATCHDOG. Agent-specific checklists. Pipeline infra checks. Self-audit | 2026-03-03 |
| — | [PIPELINE_FIX_PLAN](done/PIPELINE_FIX_PLAN.md) | Original 10-fix plan that preceded the 8-plan overhaul. Infrastructure bugs + agent guardrails | 2026-03-02 |
| — | [SYSTEMS_AUDIT_RCA](done/SYSTEMS_AUDIT_RCA.md) | Full systems audit that triggered the overhaul. 8 WORKS, 10 BROKEN/DEAD, 13 fixes proposed | 2026-03-02 |\n| 18 | [PLAN_18](done/PLAN_18_FRAMEWORK_CLEANUP.md) | Framework cleanup: delete 5 dead files, strip 93 orphaned selectors, move 3 files to _internal/, fix git ghosts | 2026-03-06 |

### Known Issues in Done Plans (from independent RCA 2026-03-04)

- PLAN_08 references phantom IDs AUD-028..030 — actual IDs are AUD-014..016 (documentation debt only, no active code impact)
- PLAN_07 references phantom IDs HLR-015..016 — content covered by HLR-013..014 (documentation debt only, no active code impact)
- PLAN_06 has ambiguous completion evidence — plan body says "Status Check Needed" while INDEX says DONE
- 3 SYSTEMS_AUDIT fixes (10: fixme registry, 11: velocity tracking, 12: outcome tracking) have no plan — deferred

---

## Deferred (No Plan Yet)

| Item | What | Why Deferred |
|---|---|---|
| PLAN_12 | RCA reference document (documentation only) | Unrequested — supports self-audit loop but not blocking. Execute with spare session time |
| Fix 10 | Fixme registry: module prefix, lifecycle fields, cross-links | Lower priority — only 1 spec uses fixme currently |
| Fix 11 | Velocity tracking: burndown, throughput metrics | Needs more specs in pipeline before metrics are meaningful |
| Fix 12 | Outcome tracking in context builder: feedback loops | Architectural change — needs design before implementation |

---

## Folder Structure

```
plans/
  INDEX.md              ← this file
  done/                 ← completed plans (11 files)
  pending/              ← active plans (2 files)
```

When completing a plan: update the Execution Queue status → move file from `pending/` to `done/`.

---

## Session Log

| Date | What Changed |
|------|-------------|
| 2026-03-04 | Plans 09-12 created (stale refs, prevention, phantom IDs, RCA report) |
| 2026-03-04 | Plans 14-15 created (repo cleansing, framework maintainer agent) |
| 2026-03-04 | PLAN_13 deleted — absorbed into PLAN_14 Part G |
| 2026-03-04 | PLAN_14 rewritten: added mirror folderization (pages/selectors/test-data), git health (6 untracked files), full file-by-file repo audit |
| 2026-03-04 | PLAN_16 created: agent-to-agent orchestration (4 phases: VS Code handoffs → pipeline orchestrator → Claude Agent SDK → SaaS) |
| 2026-03-04 | plans/ folder restructured into done/ + pending/ subfolders |
| 2026-03-04 | Ripple effect audit: PLAN_14 +Part H (13 doc edits — ARCHITECTURE.md paths, agent File Permissions globs, @agent-doc comments). PLAN_09 +FIX_DIAGNOSIS_TEMPLATE.md +CRITICAL Gates 19/20 logic migration (reads empty stub = pipeline blocked on retries). PLAN_10 widened scan glob. PLAN_16 +6 missing gate scripts |
| 2026-03-04 | Spec audit (2nd + 3rd specs): 20 findings. PLAN_15 expanded 7→12 rules (+MNT-008..012: data-driven compaction, shared constants, timeout consolidation, stale JSDoc, shared utility extraction). PLAN_15 first-task pre-loaded with 14 known issues (pricing spec ~420→~300 lines). PLAN_16 Phase 1 enhanced with auto-invoke toggle (`config/pipeline-config.json` on/off, primary loop Req→Planner→Generator, conditional Healer/Audit) |
| 2026-03-05 | PLAN_17 created: Agent Autonomy Foundation — self-audit (mid-phase + critical), anti-blind-following (ALL-028..031), cross-agent escalation queue (`agent-escalations.json`), move agent files to `_internal/`, auto-cleanup. Inserted at position 5 (after PLAN_14, before PLAN_15). PLAN_16 prerequisite updated to include PLAN_17 |
| 2026-03-05 | Independent plan review (Claude Code + Copilot cross-audit): PLAN_11 deleted (non-problem — phantom IDs only in done/ files, NEVER DO already cleaned). PLAN_12 deferred (unrequested scope). PLAN_09 updated to select Option B (agent-mistakes.md Resolution column). PLAN_10 deny-list expanded (+§9C). PLAN_16 Phase 4 prereq noted. PLAN_17 Part A grep verification added. Queue renumbered: 6 pending plans. |
| 2026-03-06 | PLAN_18 executed by Claude Code (5 file deletions, 93 selector strips, 3 file moves, 14 script edits, git ghost fixes). PLAN_19 created and executed by Copilot: 4 AD ghost fixes, 5 settings.json path corrections, 3 orchestrator bugs fixed (SCRIPT_PREFIX map + pipeline-config stage names + planner-pre-run.ts), GARDENER permissions corrected, 5 stale doc refs fixed, 2 gate scripts improved, planner agent paths expanded, 29 files tracked, INDEX updated |
