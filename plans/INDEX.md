# Plans Index

**Last updated**: 2026-03-14

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
| 8 | 19 | [PLAN_19](done/PLAN_19_POST_EXECUTION_CLEANUP.md) | Post-execution cleanup: fix 4 AD ghosts, 5 settings.json paths, 3 orchestrator bugs, GARDENER permissions, 28 untracked files | **P0** | DONE 2026-03-06 |
| 9 | 20 | [PLAN_20](done/PLAN_20_UI_INTEGRATION_AGENT_CHAINING.md) | SaaS platform — **Phase 0 (MVP): Local worker + schema-driven orchestrator + Neon + Fastify on Render. Zero API billing. All config via pipeline-definition.json.** Phases 1-7: Multi-tenant (RLS, BullMQ, S3, JWT). Orchestration audit findings fixed. Briefing: [PLAN_20_SIMPLIFIED_TEAM_BRIEFING](PLAN_20_SIMPLIFIED_TEAM_BRIEFING.md) | **P0** | DONE 2026-03-10 |
| 10 | 21 | [PLAN_21](done/PLAN_21_DEMO_WEBSITE.md) | API contract + frontend integration spec. Colleague's agent builds React frontend on Vercel connecting to our Render backend. Real API calls, SSE, Settings page. Agent prompt: [COLLEAGUE_AGENT_PROMPT](COLLEAGUE_AGENT_PROMPT.md) | **P1** | DONE — colleague delivered, frontend received |
| 11 | 23 | [PLAN_23](done/PLAN_23_MONOREPO_INTEGRATION.md) | Monorepo integration — CHUNKED into Plans 24-31 (8 independent phases) | **P0** | DONE (chunked) 2026-03-12 |
| 12 | 24 | [PLAN_24](done/PLAN_24_INFRASTRUCTURE.md) | Infrastructure: Docker Compose PostgreSQL + npm install all locations | **P0** | DONE 2026-03-12 |
| 13 | 25 | [PLAN_25](done/PLAN_25_FOLDER_RESTRUCTURE.md) | Folder restructure: rename JBSIntelliQE-develop → website/ + .gitignore | **P0** | DONE 2026-03-12 |
| 14 | 26 | [PLAN_26](done/PLAN_26_CONFIG_FIXES.md) | Config fixes (CRITICAL): PORT=3100, DATABASE_URL, BACKEND_URL alignment | **P0** | DONE 2026-03-12 |
| 15 | 27 | [PLAN_27](done/PLAN_27_DEV_ENVIRONMENT.md) | Dev environment: Vite dual-proxy, start-dev.bat, launch.json | **P0** | DONE 2026-03-12 |
| 16 | 28 | [PLAN_28](done/PLAN_28_ENCORE_INTEGRATION.md) | Encore integration (CORE): encoreApi.ts + ChatPage SSE wiring (post-audit, 9 bugs fixed) | **P0** | DONE 2026-03-12 |
| 17 | 29 | [PLAN_29](done/PLAN_29_PAGE_POLISH.md) | Page polish: Dashboard, AgentMonitor, Execution, Settings real data | **P1** | DONE 2026-03-13 |
| 18 | 30 | [PLAN_30](done/PLAN_30_AGENT_SCHOOL.md) | Agent School: inter-agent communication system (.claude/ + CLI tool) | **P0** | DONE 2026-03-12 |
| 19 | 31 | [PLAN_31](done/PLAN_31_VERIFICATION.md) | Verification: E2E demo path checklist (minimum + full) | **P0** | DONE 2026-03-13 |
| 20 | 32-old | [PLAN_32_SCOPE_REVERT](done/PLAN_32_SCOPE_REVERT.md) | Scope revert: restore render.yaml + code fallbacks to 3001 | **P0** | DONE 2026-03-13 |
| 11 | 22 | [PLAN_22](done/PLAN_22_URL_MIGRATION.md) | Base URL migration: `ca-nginx-dev.proudmoss...azurecontainerapps.io/navigator/` → `cloudapps-e2e.encoreglobal.com/navigator/`. 10 files changed (8 config + 2 docs), runtime code untouched (reads env vars). Option B chosen (kept `/navigator/` prefix). | **P0** | DONE 2026-03-11 |
| 21 | 32 | [PLAN_32](done/PLAN_32_SCHEMA_FOUNDATION.md) | **Schema Foundation (RUNS FIRST)**: JBSTestOpsAI admin schema, platform_users, clients, tenant template, Encore as first client, platform_settings | **P0** | DONE 2026-03-14 |
| 22 | 33 | [PLAN_33](done/PLAN_33_FRONTEND_CLEANUP.md) | Frontend cleanup: delete 11 pages + mockData.ts + 6 config-panel comps, 16→6 routes (+ /onboarding), IP vocabulary enforcement, dynamic branding | **P0** | DONE 2026-03-14 |
| 23 | 34 | [PLAN_34](done/PLAN_34_BACKEND_CLEANUP.md) | Backend cleanup: delete 10 fake agents + 5 mock routes + dead schemas, tenant-aware auth (bcrypt+JWT+schema routing) | **P0** | DONE 2026-03-14 |
| 24 | 35 | [PLAN_35](done/PLAN_35_REAL_PAGES.md) | DashboardPage (drill-down + morning briefing + super admin panel) + SettingsPage (role-based progressive disclosure, 2/4/6 tabs per role) | **P0** | DONE 2026-03-14 |
| 25 | 36 | [PLAN_36](done/PLAN_36_CHATPAGE_REWRITE.md) | ChatPage rewrite: split 85KB monolith, tri-model (haiku/sonnet/opus), ChatActionCard (cards+buttons UX), IP-safe | **P0** | DONE 2026-03-14 |
| 26 | 37 | [PLAN_37](done/PLAN_37_WORKER_RELIABILITY.md) | Worker reliability: pre-flight checks, SSE error propagation, startup scripts, demo verification | **P1** | DONE 2026-03-14 |
| 27 | 38 | [PLAN_38](done/PLAN_38_MULTI_TENANT.md) | Multi-tenant wiring: tenant middleware, SSE proxy, super admin endpoints, ClientContext/WebsiteContext, schema provisioning automation | **P0** | DONE 2026-03-14 |
| 28 | 39 | [PLAN_39](done/PLAN_39_CHATBOT_ROLE_AWARE_CRUD.md) | Role-aware chatbot: full CRUD proxy, CLI bug fix, 21 actions, defense-in-depth, DashboardBriefing, SuperAdminPanel wiring | **P0** | DONE 2026-03-14 |

**PLAN_11 was deleted** — phantom IDs (AUD-028..030, HLR-015..016) only exist in done/ plan files which are "do not modify." NEVER DO sections already cleaned up. Non-problem.
**PLAN_12 was deleted** — unrequested RCA documentation. Key findings already captured in INDEX.md "Known Issues in Done Plans" and `done/SYSTEMS_AUDIT_RCA.md`. In-session analysis was not recoverable; reconstructing it would have been fabrication.
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
| ~~PLAN_12~~ | ~~RCA reference document~~ | Deleted 2026-03-09 — findings already in INDEX.md + SYSTEMS_AUDIT_RCA.md; in-session analysis not recoverable |
| Fix 10 | Fixme registry: module prefix, lifecycle fields, cross-links | Lower priority — only 1 spec uses fixme currently |
| Fix 11 | Velocity tracking: burndown, throughput metrics | Needs more specs in pipeline before metrics are meaningful |
| Fix 12 | Outcome tracking in context builder: feedback loops | Architectural change — needs design before implementation |

---

## Folder Structure

```
plans/
  INDEX.md              ← this file
  done/                 ← completed plans (14+ files)
  pending/              ← active plans (briefing docs only)
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
| 2026-03-09 | PLAN_20 created and audited by Claude Code: SaaS multi-tenant platform. 7 phases, 21-finding audit (4 CRITICAL, 5 HIGH, 8 MEDIUM, 4 LOW), all resolved. Companion team briefing written. Moved to pending/. |
| 2026-03-10 | **MVP pivot**: PLAN_20 updated with Phase 0 (local worker pattern, zero API billing, schema-driven pipeline-definition.json, Fastify+Neon backend, Render deployment). Full orchestration audit: 7 issues found (hardcoded stages, file-based queue, no admin config), all addressed by pipeline-definition.json + DB-backed queue. PLAN_21 rewritten from static mock → live API contract + frontend integration spec. Colleague agent prompt created at `plans/COLLEAGUE_AGENT_PROMPT.md`. All pipeline settings fully configurable (LLM model per stage, budgets, retries, convergence guards, CLI config, timeouts). |
| 2026-03-10 | PLAN_22 created: Base URL migration from Azure Container Apps (`ca-nginx-dev.proudmoss...`) to Encore's E2E QA env (`cloudapps-e2e.encoreglobal.com`). Full codebase audit: 10 files need changes, 12+ files dynamically read env (no change needed), 15+ historical/unrelated files explicitly excluded. Critical pre-flight: verify `/navigator/` path prefix needed or not. |
| 2026-03-11 | PLAN_22 marked DONE (executed by Copilot, audited by Claude Code — all 10 files migrated, Option B `/navigator/` kept, zero old URL leaks in config/code). PLAN_21 marked SKIPPED — colleague-owned, `COLLEAGUE_AGENT_PROMPT.md` already covers 100% of spec. Only PLAN_20 remains pending. |
| 2026-03-12 | PLAN_20 marked DONE (Phase 0 fully built: Fastify server, orchestrator, worker, pipeline-definition.json, DB schema, routes, serializers all exist). PLAN_21 marked DONE (colleague delivered full React frontend). PLAN_23 created then SUPERSEDED by mega plan. |
| 2026-03-12 | **MEGA PLAN**: PLAN_23 superseded by Plans 24-31 (8-phase chunked integration). Full Phase 0 exploration verified all assumptions. 3-round external audit found 9 bugs in Plan 28 (ChatPage wiring) — all fixed. Key corrections: EventSource ref+cleanup, all 5 Encore stages mapped, exact detail strings, @/ import convention, noUnusedLocals compliance, artifact_ready pushed to chat. Plans saved to pending/. |
| 2026-03-12 | PLAN_24 marked DONE: docker-compose.yml already existed (correct spec). Root npm deps installed (19 packages). **Blockers noted**: Docker not installed, PostgreSQL not available (neither Docker nor native). Per briefing, PG not needed for Plans 25-27. JBS frontend node_modules deferred to after Plan 25 rename. |
| 2026-03-12 | PLAN_26 marked DONE: .env.server PORT=3100, BACKEND_URL=http://localhost:3100, DATABASE_URL=postgres:admin@localhost:5432/postgres. Also updated: render.yaml PORT=3100, server/worker code fallback defaults 3001→3100, worker doc comment. Zero stray :3001 refs in src/ or config/. |
| 2026-03-13 | **QA SaaS OVERHAUL v5**: Plans 32-38 created (7-phase frontend rebuild + multi-tenant SaaS). Master plan v5 at `.claude/plans/graceful-foraging-charm.md`. 3 external audits resolved (23 + 8 + 12 issues). PLAN_32 (Schema Foundation) added to fix FK/auth collision. v5 upgrades: ChatActionCard (cards+buttons UX), role-based progressive disclosure for Settings, Dashboard morning briefing, configurable cost visibility, Encore pre-configured (skip onboarding). Execution order: 32→33→34→35+37→36→38. Obsolete AGENT_BRIEFING_PLANS_24_31.md deleted. |
| 2026-03-14 | **PLAN_39 executed**: Role-aware chatbot — callClaude() bug fix (system prompt separated from user message), chat.service.ts schema-qualified (6 table refs), chatbot.service.ts major refactor (21-action catalog, role-gated context, defense-in-depth executor, formatActionData helper), chat.routes.ts wired with tenant context + whitespace validation. **Cleanup tasks**: ExecutionPage.tsx deleted (orphan), SuperAdminPanel.tsx wired to real /api/admin endpoints, DashboardBriefing.tsx + dashboard.routes.ts created (AI morning briefing), Plans 32-38 moved to done/. |
| 2026-03-12 | PLAN_30 marked DONE: Agent School inter-agent communication system fully built. 11 files in `.claude/` (AGENT_SCHOOL.md, PROTOCOL.md, context/VISION+CURRENT_STATE+WORKFLOW+CURRENT_OWNER, agents/RUTVI+COLLEAGUE, channel/inbox/RUTVI_AGENT+COLLEAGUE_AGENT, channel/broadcast/BROADCAST). CLI tool `scripts/agent-channel.mjs` with 7 commands (school, state, inbox, broadcast, token, handoff, send). Seeded: 5 broadcast discoveries, 1 HANDOFF message to colleague with 4 questions. |
