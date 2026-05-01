# Plans Index

**Last updated**: 2026-05-01
**Auto-generated** by `npm run plans:reindex` — do not hand-edit. Edits will be overwritten.

**Refresh model**: this file is **fully regenerated** every time the script runs — there is no "move" or "add" between sections. When a plan moves `pending/` → `done/`, the next reindex re-evaluates every plan's dependencies and re-sorts the table from scratch. Triggers: manual `npm run plans:reindex`, pre-commit hook (`.githooks/pre-commit` runs `:check` and fails the commit if INDEX is stale), and `/execute` Phase 3.5 step 3 (LR-035).

**Totals**: 95 pending · 220 done · 17 stale (>14d) · 0 DONE-in-pending

---

## Warnings

### Pending Stale (>14 days)

| File | Age | Created | Priority |
|---|---|---|---|
| [PLAN_FULL_CHAIN_AUDIT.md](pending/PLAN_FULL_CHAIN_AUDIT.md) | 38d | 2026-03-24 | P2-CYCLE-3 |
| [PLAN_MAINTAINER_SWEEP.md](pending/PLAN_MAINTAINER_SWEEP.md) | 38d | 2026-03-24 | P2-CYCLE-3 |
| [PLAN_PLAYWRIGHT_CLI_ADOPTION.md](pending/PLAN_PLAYWRIGHT_CLI_ADOPTION.md) | 30d | 2026-04-01 | P2-CYCLE-3 |
| [PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md](pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md) | 28d | 2026-04-03 | P5-PARKED |
| [PLAN_ACTIVITY_LOG_TIMESTAMP_GATE.md](pending/PLAN_ACTIVITY_LOG_TIMESTAMP_GATE.md) | 16d | 2026-04-15 | P2-CYCLE-3 |
| [PLAN_HIST_COMMIT_HISTORY_WORK.md](pending/PLAN_HIST_COMMIT_HISTORY_WORK.md) | 16d | 2026-04-15 | P0-CYCLE-1 |
| [PLAN_PLANS_INDEX_AUTOREGEN.md](pending/PLAN_PLANS_INDEX_AUTOREGEN.md) | 16d | 2026-04-15 | P2-CYCLE-3 |
| [PLAN_MASTER_REPO_CLEANUP.md](pending/PLAN_MASTER_REPO_CLEANUP.md) | 15d | 2026-04-16 | P1-CYCLE-2 |
| [SUBPLAN_REPO_03_AGENT_FILE_RESTRUCTURE.md](pending/SUBPLAN_REPO_03_AGENT_FILE_RESTRUCTURE.md) | 15d | 2026-04-16 | P1-CYCLE-2 |
| [SUBPLAN_REPO_04_DUPLICATE_JUNK_PURGE.md](pending/SUBPLAN_REPO_04_DUPLICATE_JUNK_PURGE.md) | 15d | 2026-04-16 | P1-CYCLE-2 |
| [SUBPLAN_REPO_05_DEAD_CODE_REUSABILITY.md](pending/SUBPLAN_REPO_05_DEAD_CODE_REUSABILITY.md) | 15d | 2026-04-16 | P1-CYCLE-2 |
| [SUBPLAN_REPO_06_DOC_MD_SLOP_AUDIT.md](pending/SUBPLAN_REPO_06_DOC_MD_SLOP_AUDIT.md) | 15d | 2026-04-16 | P1-CYCLE-2 |
| [SUBPLAN_REPO_07_SLOP_PREVENTION.md](pending/SUBPLAN_REPO_07_SLOP_PREVENTION.md) | 15d | 2026-04-16 | P1-CYCLE-2 |
| [SUBPLAN_REPO_08_RENAME_JBS.md](pending/SUBPLAN_REPO_08_RENAME_JBS.md) | 15d | 2026-04-16 | P2-CYCLE-3 |
| [SUBPLAN_REPO_10_SOURCE_CODE_QUALITY.md](pending/SUBPLAN_REPO_10_SOURCE_CODE_QUALITY.md) | 15d | 2026-04-16 | P1-CYCLE-2 |
| [SUBPLAN_REPO_11_SCRIPTS_CONFIG_AUDIT.md](pending/SUBPLAN_REPO_11_SCRIPTS_CONFIG_AUDIT.md) | 15d | 2026-04-16 | P1-CYCLE-2 |
| [SUBPLAN_REPO_12_TEST_INFRASTRUCTURE_AUDIT.md](pending/SUBPLAN_REPO_12_TEST_INFRASTRUCTURE_AUDIT.md) | 15d | 2026-04-16 | P1-CYCLE-2 |

### DONE-in-pending (should be moved to done/)

_None — pending/ is clean._

---

## Execution Queue (pending/)

### Execution Order
Single dependency-sorted list. Top of the table = run first.
`Blocked by` shows pending dependencies (clickable). Empty = ready right now.
Within each dependency tier, plans are sorted by priority (P0 → P3) then newest first.

| Pos | File | Title | Priority | Blocked by | Status | Model | Effort | Perm | Tool | Created |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | [SUBPLAN_DQU_05E_LOS_LI_DEEP_COVERAGE_AUDIT.md](pending/SUBPLAN_DQU_05E_LOS_LI_DEEP_COVERAGE_AUDIT.md) | SUBPLAN: LOS + LI Deep Coverage Retro-Audit (baseline-first + ISTQB depth-grid) | P0-CYCLE-1 | — (ready) | PENDING | Opus | xhi | auto | both | 2026-04-29 |
| 2 | [SUBPLAN_DQU_07_E2_RULES_DOC_UPDATE.md](pending/SUBPLAN_DQU_07_E2_RULES_DOC_UPDATE.md) | SUBPLAN: Rules Doc v2 — Add Rule 5 (Tags) + Rule 6 (Live-DOM-First) | P0-CYCLE-1 | — (ready) | PENDING | Sonnet | hi | auto | — | 2026-04-22 |
| 3 | [SUBPLAN_DQU_08_E3_TAG_ROLLOUT_LOS_LI.md](pending/SUBPLAN_DQU_08_E3_TAG_ROLLOUT_LOS_LI.md) | SUBPLAN: Tag Rollout — LOS + LI MD Files + Re-Export CSVs | P0-CYCLE-1 | [SP-DQU-07](pending/SUBPLAN_DQU_07_E2_RULES_DOC_UPDATE.md) | PENDING | Sonnet | mid | auto | — | 2026-04-22 |
| 4 | [SUBPLAN_DQU_09_D1_REQS_SAMPLING_VERIFICATION.md](pending/SUBPLAN_DQU_09_D1_REQS_SAMPLING_VERIFICATION.md) | SUBPLAN: REQUIREMENTS.md — Sampling-Verification Loop (Probabilistic Clean) | P0-CYCLE-1 | — (ready) | PENDING | Opus | xhi | auto | — | 2026-04-22 |
| 5 | [SUBPLAN_DQU_12_F1a_PRICING_AUDIT.md](pending/SUBPLAN_DQU_12_F1a_PRICING_AUDIT.md) | SUBPLAN: Neutral-Eye Audit + Fix — Pricing | P0-CYCLE-1 | — (ready) | PENDING | Opus | hi | auto | cli | 2026-04-22 |
| 6 | [SUBPLAN_DQU_13_F1b_LEGAL_AUDIT.md](pending/SUBPLAN_DQU_13_F1b_LEGAL_AUDIT.md) | SUBPLAN: Neutral-Eye Audit + Fix — Legal | P0-CYCLE-1 | — (ready) | PENDING | Opus | hi | auto | cli | 2026-04-22 |
| 7 | [SUBPLAN_DQU_14_F1c_CURRENCY_AUDIT.md](pending/SUBPLAN_DQU_14_F1c_CURRENCY_AUDIT.md) | SUBPLAN: Neutral-Eye Audit + Fix — Currency | P0-CYCLE-1 | — (ready) | PENDING | Opus | hi | auto | cli | 2026-04-22 |
| 8 | [SUBPLAN_DQU_15_F1d_NOTES_AUDIT.md](pending/SUBPLAN_DQU_15_F1d_NOTES_AUDIT.md) | SUBPLAN: Neutral-Eye Audit + Fix — Notes | P0-CYCLE-1 | — (ready) | PENDING | Opus | hi | auto | cli | 2026-04-22 |
| 9 | [SUBPLAN_DQU_16_F1e_ACCOUNT_ADDRESS_AUDIT.md](pending/SUBPLAN_DQU_16_F1e_ACCOUNT_ADDRESS_AUDIT.md) | SUBPLAN: Neutral-Eye Audit + Fix — Account & Address | P0-CYCLE-1 | — (ready) | PENDING | Opus | hi | auto | cli | 2026-04-22 |
| 10 | [SUBPLAN_DQU_17_F1f_SHARED_SETUP_AUDIT.md](pending/SUBPLAN_DQU_17_F1f_SHARED_SETUP_AUDIT.md) | SUBPLAN: Neutral-Eye Audit + Fix — Shared Setup Locations | P0-CYCLE-1 | — (ready) | PENDING | Opus | hi | auto | cli | 2026-04-22 |
| 11 | [SUBPLAN_DQU_18_F1g_AUTO_ADDON_AUDIT.md](pending/SUBPLAN_DQU_18_F1g_AUTO_ADDON_AUDIT.md) | SUBPLAN: Neutral-Eye Audit + Fix — Auto Add-on | P0-CYCLE-1 | — (ready) | PENDING | Opus | hi | auto | cli | 2026-04-22 |
| 12 | [SUBPLAN_DQU_19_F1h_ECT_STANDALONE_AUDIT.md](pending/SUBPLAN_DQU_19_F1h_ECT_STANDALONE_AUDIT.md) | SUBPLAN: Neutral-Eye Audit + Fix — ECT (Standalone Scope-Check) | P0-CYCLE-1 | — (ready) | PENDING | Opus | hi | auto | cli | 2026-04-22 |
| 13 | [SUBPLAN_DQU_20_F1i_MGMT_HISTORY_AUDIT.md](pending/SUBPLAN_DQU_20_F1i_MGMT_HISTORY_AUDIT.md) | SUBPLAN: Neutral-Eye Audit + Fix — Location Management History | P0-CYCLE-1 | — (ready) | PENDING | Opus | hi | auto | cli | 2026-04-22 |
| 14 | [SUBPLAN_DQU_31_J2_BUG_REPORTS_PACKAGING.md](pending/SUBPLAN_DQU_31_J2_BUG_REPORTS_PACKAGING.md) | SUBPLAN: Bug Reports — Consolidation + Client-Ready Packaging (Deliverable #4) | P0-CYCLE-1 | [SP-DQU-12](pending/SUBPLAN_DQU_12_F1a_PRICING_AUDIT.md), [SP-DQU-13](pending/SUBPLAN_DQU_13_F1b_LEGAL_AUDIT.md), [SP-DQU-14](pending/SUBPLAN_DQU_14_F1c_CURRENCY_AUDIT.md), [SP-DQU-15](pending/SUBPLAN_DQU_15_F1d_NOTES_AUDIT.md), [SP-DQU-16](pending/SUBPLAN_DQU_16_F1e_ACCOUNT_ADDRESS_AUDIT.md), [SP-DQU-17](pending/SUBPLAN_DQU_17_F1f_SHARED_SETUP_AUDIT.md), [SP-DQU-18](pending/SUBPLAN_DQU_18_F1g_AUTO_ADDON_AUDIT.md), [SP-DQU-19](pending/SUBPLAN_DQU_19_F1h_ECT_STANDALONE_AUDIT.md), [SP-DQU-20](pending/SUBPLAN_DQU_20_F1i_MGMT_HISTORY_AUDIT.md) | PENDING | Sonnet | hi | auto | — | 2026-04-22 |
| 15 | [SUBPLAN_DQU_05C_LR_046_HOOK_AUTHORING.md](pending/SUBPLAN_DQU_05C_LR_046_HOOK_AUTHORING.md) | SUBPLAN SP-DQU-05C — Structural enforcement hook for LR-046 (strict plan lines) | P1-CYCLE-1 | — (ready) | PENDING | Opus | xhi | auto | — | 2026-04-28 |
| 16 | [SUBPLAN_DQU_21_G1_LEFTOVER_STATE_AUDIT.md](pending/SUBPLAN_DQU_21_G1_LEFTOVER_STATE_AUDIT.md) | SUBPLAN: Leftover-State Audit — Enumerate Mutable-State Touchpoints Per Spec | P1-CYCLE-2 | — (ready) | PENDING | Opus | xhi | auto | — | 2026-04-22 |
| 17 | [SUBPLAN_DQU_22_G2_PRE_TEST_SLATE_CLEAR.md](pending/SUBPLAN_DQU_22_G2_PRE_TEST_SLATE_CLEAR.md) | SUBPLAN: Pre-Test Slate-Clear — Pattern Design + Shared Utility | P1-CYCLE-2 | [SP-DQU-21](pending/SUBPLAN_DQU_21_G1_LEFTOVER_STATE_AUDIT.md) | PENDING | Opus | xhi | auto | — | 2026-04-22 |
| 18 | [SUBPLAN_DQU_23_G3_POST_TEST_SLATE_CLEAR.md](pending/SUBPLAN_DQU_23_G3_POST_TEST_SLATE_CLEAR.md) | SUBPLAN: Post-Test Slate-Clear — Pattern Design + Shared Utility | P1-CYCLE-2 | [SP-DQU-22](pending/SUBPLAN_DQU_22_G2_PRE_TEST_SLATE_CLEAR.md) | PENDING | Opus | xhi | auto | — | 2026-04-22 |
| 19 | [SUBPLAN_DQU_24_G4_SLATE_CLEAR_ROLLOUT.md](pending/SUBPLAN_DQU_24_G4_SLATE_CLEAR_ROLLOUT.md) | SUBPLAN: Slate-Clear — Rollout to All 11 Specs | P1-CYCLE-2 | [SP-DQU-22](pending/SUBPLAN_DQU_22_G2_PRE_TEST_SLATE_CLEAR.md), [SP-DQU-23](pending/SUBPLAN_DQU_23_G3_POST_TEST_SLATE_CLEAR.md) | PENDING | Sonnet | hi | auto | — | 2026-04-22 |
| 20 | [SUBPLAN_DQU_25_G5_FULL_SUITE_RCA.md](pending/SUBPLAN_DQU_25_G5_FULL_SUITE_RCA.md) | SUBPLAN: Full-Suite Clean Run + RCA Any Random Failures | P1-CYCLE-2 | [SP-DQU-24](pending/SUBPLAN_DQU_24_G4_SLATE_CLEAR_ROLLOUT.md) | PENDING | Opus | max | auto | — | 2026-04-22 |
| 21 | [SUBPLAN_DQU_30_J1_ALLURE_DELIVERABLE.md](pending/SUBPLAN_DQU_30_J1_ALLURE_DELIVERABLE.md) | SUBPLAN: Allure Report — Client Deliverable #3 | P0-CYCLE-1 | [SP-DQU-25](pending/SUBPLAN_DQU_25_G5_FULL_SUITE_RCA.md) | PENDING | Sonnet | mid | auto | — | 2026-04-22 |
| 22 | [SUBPLAN_DQU_26_H1_SCOPE_DEFINITION.md](pending/SUBPLAN_DQU_26_H1_SCOPE_DEFINITION.md) | SUBPLAN: Scope Definition — Whitelist Encore Deliverable + Runtime Code | P1-CYCLE-2 | — (ready) | PENDING | Sonnet | hi | auto | — | 2026-04-22 |
| 23 | [SUBPLAN_DQU_27_H2_SIMPLIFY_SWEEP.md](pending/SUBPLAN_DQU_27_H2_SIMPLIFY_SWEEP.md) | SUBPLAN: /simplify Sweep — On Whitelist Only | P1-CYCLE-2 | [SP-DQU-26](pending/SUBPLAN_DQU_26_H1_SCOPE_DEFINITION.md) | PENDING | Sonnet | hi | auto | — | 2026-04-22 |
| 24 | [SUBPLAN_DQU_28_H3_CLEANUP_SWEEP.md](pending/SUBPLAN_DQU_28_H3_CLEANUP_SWEEP.md) | SUBPLAN: /cleanup Sweep — Dead Code, Duplicates, Orphaned Files | P1-CYCLE-2 | [SP-DQU-27](pending/SUBPLAN_DQU_27_H2_SIMPLIFY_SWEEP.md) | PENDING | Sonnet | hi | auto | — | 2026-04-22 |
| 25 | [SUBPLAN_DQU_29_I1_IDENTITY_RIPPLE_SYNC.md](pending/SUBPLAN_DQU_29_I1_IDENTITY_RIPPLE_SYNC.md) | SUBPLAN: Identity Ripple Sync — Re-Sync All 7 Agents' Owned Artifacts | P1-CYCLE-2 | [SP-DQU-08](pending/SUBPLAN_DQU_08_E3_TAG_ROLLOUT_LOS_LI.md), [SP-DQU-25](pending/SUBPLAN_DQU_25_G5_FULL_SUITE_RCA.md), [SP-DQU-09](pending/SUBPLAN_DQU_09_D1_REQS_SAMPLING_VERIFICATION.md) | PENDING | Opus | xhi | auto | — | 2026-04-22 |
| 26 | [SUBPLAN_DQU_34_L1_CLIENT_HANDOFF_PACKAGE.md](pending/SUBPLAN_DQU_34_L1_CLIENT_HANDOFF_PACKAGE.md) | SUBPLAN: Client Handoff Package — CSVs + Allure + Bug Reports + README | P0-CYCLE-1 | [SP-DQU-08](pending/SUBPLAN_DQU_08_E3_TAG_ROLLOUT_LOS_LI.md), [SP-DQU-30](pending/SUBPLAN_DQU_30_J1_ALLURE_DELIVERABLE.md), [SP-DQU-31](pending/SUBPLAN_DQU_31_J2_BUG_REPORTS_PACKAGING.md), [SP-DQU-29](pending/SUBPLAN_DQU_29_I1_IDENTITY_RIPPLE_SYNC.md) | PENDING | Opus | xhi | auto | — | 2026-04-22 |
| 27 | [SUBPLAN_DQU_35_L2_EXIT_AUDIT.md](pending/SUBPLAN_DQU_35_L2_EXIT_AUDIT.md) | SUBPLAN: Exit Audit — /audit Full-Chain + /final-q + Diff vs 8 Asks + LR-040 Closure Gate | P0-CYCLE-1 | [SP-DQU-34](pending/SUBPLAN_DQU_34_L1_CLIENT_HANDOFF_PACKAGE.md) | PENDING | Opus | max | auto | — | 2026-04-22 |
| 28 | [SUBPLAN_DQU_10_E_QA_BEST_PRACTICES_BENCHMARK.md](pending/SUBPLAN_DQU_10_E_QA_BEST_PRACTICES_BENCHMARK.md) | SUBPLAN: QA Best-Practices Research + Benchmark vs Our Work | P2-CYCLE-3 | — (ready) | PENDING | Opus | xhi | auto | — | 2026-04-22 |
| 29 | [SUBPLAN_DQU_32_K1_TODAY_SKILL.md](pending/SUBPLAN_DQU_32_K1_TODAY_SKILL.md) | SUBPLAN: Create `/today` Skill — Prospective Daily Priority Summary | P2-CYCLE-3 | — (ready) | PENDING | Sonnet | hi | auto | — | 2026-04-22 |
| 30 | [SUBPLAN_DQU_33_K2_NEXTWEEK_SKILL.md](pending/SUBPLAN_DQU_33_K2_NEXTWEEK_SKILL.md) | SUBPLAN: Create `/nextweek` Skill — Prospective Weekly Outlook | P5-PARKED | — (ready) | SUPERSEDED | Sonnet | hi | auto | — | 2026-04-22 |
| 31 | [PLAN_AGENT_AUTHORING_EFFICIENCY.md](pending/PLAN_AGENT_AUTHORING_EFFICIENCY.md) | PLAN: Agent Authoring Efficiency — One-Look DOM, Locked Catalog, Structural Gate | P0-CYCLE-1 | — (ready) | PENDING | — | — | — | — | 2026-04-23 |
| 32 | [PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md](pending/PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md) | PLAN: /chain Per-Session Orchestration with Stop-Hook /final-q Gating | P0-CYCLE-1 | — (ready) | PENDING | — | — | — | — | 2026-04-22 |
| 33 | [_TEMPLATE_SUBPLAN.md](pending/_TEMPLATE_SUBPLAN.md) | SUBPLAN_<INITIATIVE>_<NN>_<PHASE> — <one-line goal> | P0 | — (ready) | TEMPLATE-DRAFT | Opus | mid | auto | cli | <YYYY-MM-DD> |
| 34 | [SUBPLAN_REPO_03_AGENT_FILE_RESTRUCTURE.md](pending/SUBPLAN_REPO_03_AGENT_FILE_RESTRUCTURE.md) | SUBPLAN: Agent File Restructure | P1-CYCLE-2 | — (ready) | PENDING | — | — | — | — | 2026-04-16 |
| 35 | [SUBPLAN_REPO_04_DUPLICATE_JUNK_PURGE.md](pending/SUBPLAN_REPO_04_DUPLICATE_JUNK_PURGE.md) | SUBPLAN: Duplicate & Junk Purge | P1-CYCLE-2 | — (ready) | PENDING | — | — | — | — | 2026-04-16 |
| 36 | [SUBPLAN_REPO_05_DEAD_CODE_REUSABILITY.md](pending/SUBPLAN_REPO_05_DEAD_CODE_REUSABILITY.md) | SUBPLAN: Dead Code & Reusability | P1-CYCLE-2 | — (ready) | PENDING | — | — | — | — | 2026-04-16 |
| 37 | [SUBPLAN_REPO_06_DOC_MD_SLOP_AUDIT.md](pending/SUBPLAN_REPO_06_DOC_MD_SLOP_AUDIT.md) | SUBPLAN: Doc & MD Slop Audit | P1-CYCLE-2 | — (ready) | PENDING | — | — | — | — | 2026-04-16 |
| 38 | [SUBPLAN_REPO_07_SLOP_PREVENTION.md](pending/SUBPLAN_REPO_07_SLOP_PREVENTION.md) | SUBPLAN: Slop Prevention Guardrails | P1-CYCLE-2 | — (ready) | PENDING | — | — | — | — | 2026-04-16 |
| 39 | [SUBPLAN_REPO_10_SOURCE_CODE_QUALITY.md](pending/SUBPLAN_REPO_10_SOURCE_CODE_QUALITY.md) | SUBPLAN: Source Code Quality Sweep | P1-CYCLE-2 | — (ready) | PENDING | — | — | — | — | 2026-04-16 |
| 40 | [SUBPLAN_REPO_11_SCRIPTS_CONFIG_AUDIT.md](pending/SUBPLAN_REPO_11_SCRIPTS_CONFIG_AUDIT.md) | SUBPLAN: Scripts, Config & Root Files Audit | P1-CYCLE-2 | — (ready) | PENDING | — | — | — | — | 2026-04-16 |
| 41 | [SUBPLAN_REPO_12_TEST_INFRASTRUCTURE_AUDIT.md](pending/SUBPLAN_REPO_12_TEST_INFRASTRUCTURE_AUDIT.md) | SUBPLAN: Test Infrastructure Audit | P1-CYCLE-2 | — (ready) | PENDING | — | — | — | — | 2026-04-16 |
| 42 | [SUBPLAN_REPO_08_RENAME_JBS.md](pending/SUBPLAN_REPO_08_RENAME_JBS.md) | SUBPLAN: Rename jbs_framework | P2-CYCLE-3 | — (ready) | PENDING | — | — | — | — | 2026-04-16 |
| 43 | [PLAN_MASTER_REPO_CLEANUP.md](pending/PLAN_MASTER_REPO_CLEANUP.md) | MASTER PLAN: Repo Unfucking & Client Delivery | P1-CYCLE-2 | — (ready) | PENDING | — | — | — | — | 2026-04-16 |
| 44 | [godsplan.md](pending/godsplan.md) | PLAN: Claude Code Baseline Research + Gene-Marriage Upgrade | P2-CYCLE-3 | — (ready) | PENDING | Opus | max | plan | — | 2026-04-23 |
| 45 | [PLAN_ACTIVITY_LOG_TIMESTAMP_GATE.md](pending/PLAN_ACTIVITY_LOG_TIMESTAMP_GATE.md) | PLAN_ACTIVITY_LOG_TIMESTAMP_GATE | P2-CYCLE-3 | — (ready) | PENDING | — | — | — | — | 2026-04-15 |
| 46 | [PLAN_CHAT_UI_BUGS.md](pending/PLAN_CHAT_UI_BUGS.md) | PLAN: Chat UI Bugs — Website Pipeline Experience | P2-CYCLE-3 | — (ready) | PENDING | — | — | — | — | 2026-04-24 |
| 47 | [PLAN_CODEBASE_CLEANUP.md](pending/PLAN_CODEBASE_CLEANUP.md) | PLAN: Codebase Cleanup — Audit-Corrected Version | P2-CYCLE-3 | — (ready) | PENDING | — | — | — | — | 2026-04-24 |
| 48 | [PLAN_FULL_CHAIN_AUDIT.md](pending/PLAN_FULL_CHAIN_AUDIT.md) | PLAN: Adversarial Full-Chain Audit — V3 (Post-External-Review) | P2-CYCLE-3 | — (ready) | PENDING | — | — | — | — | 2026-03-24 |
| 49 | [PLAN_GENERATOR_AUDIT_AUTO_ADDON.md](pending/PLAN_GENERATOR_AUDIT_AUTO_ADDON.md) | REVISED PLAN: Generator Audit — Auto Add-On (Post-Adversarial Audit V3) | P2-CYCLE-3 | — (ready) | REVISED | — | — | — | — | 2026-04-24 |
| 50 | [PLAN_HEALER_INSPECTOR_QA_REPORT_V1.1.md](pending/PLAN_HEALER_INSPECTOR_QA_REPORT_V1.1.md) | Healer Inspector & QA Report System — Final Logic Plan v1.2 | P2-CYCLE-3 | — (ready) | PENDING | — | — | — | — | 2026-04-24 |
| 51 | [PLAN_MAINTAINER_SWEEP.md](pending/PLAN_MAINTAINER_SWEEP.md) | PLAN: Framework Maintainer Sweep — Selector Collision Architecture Fix | P2-CYCLE-3 | — (ready) | PARTIALLY-DONE | — | — | — | — | 2026-03-24 |
| 52 | [PLAN_PLANS_INDEX_AUTOREGEN.md](pending/PLAN_PLANS_INDEX_AUTOREGEN.md) | PLAN_PLANS_INDEX_AUTOREGEN | P2-CYCLE-3 | — (ready) | PENDING | — | — | — | — | 2026-04-15 |
| 53 | [PLAN_PLAYWRIGHT_CLI_ADOPTION.md](pending/PLAN_PLAYWRIGHT_CLI_ADOPTION.md) | PLAN: Playwright CLI Gradual Adoption | P2-CYCLE-3 | — (ready) | PENDING | — | — | — | — | 2026-04-01 |
| 54 | [PLAN_PRICING_TEST_COVERAGE_AUDIT_AND_FIX.md](pending/PLAN_PRICING_TEST_COVERAGE_AUDIT_AND_FIX.md) | FINAL AUDIT REPORT: Test Coverage Gap Analysis — Interaction vs Verification | P2-CYCLE-3 | — (ready) | PENDING | — | — | — | — | 2026-04-24 |
| 55 | [PLAN_TEST_DATA_CSV_CONVERSION.md](pending/PLAN_TEST_DATA_CSV_CONVERSION.md) | PLAN: Test Data CSV Conversion | P2-CYCLE-3 | — (ready) | PENDING | — | — | — | — | 2026-04-24 |
| 56 | [PLAN_VISUAL_DEBUG_SKILL.md](pending/PLAN_VISUAL_DEBUG_SKILL.md) | PLAN: Visual Debug Skill — Give All Agents Eyes | P2-CYCLE-3 | — (ready) | PENDING | — | — | — | — | 2026-04-24 |
| 57 | [PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md](pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md) | PLAN: Requirements-Driven Test Quality Upgrade | P5-PARKED | — (ready) | PENDING | — | — | — | — | 2026-04-03 |
| 58 | [PLAN_BUG_HUNTING_RULEBOOK_V2.md](pending/PLAN_BUG_HUNTING_RULEBOOK_V2.md) | PLAN: Bug Hunting Rulebook v2 — Detection Fixes + data-testid Hard Rule | — | — (ready) | — | — | — | — | — | 2026-04-24 |
| 59 | [PLAN_HIST_COMMIT_HISTORY_WORK.md](pending/PLAN_HIST_COMMIT_HISTORY_WORK.md) | PLAN_HIST_COMMIT_HISTORY_WORK | P0-CYCLE-1 | — (ready) | PENDING | — | — | — | — | 2026-04-15 |
| 60 | [SUBPLAN_HIST_PIVOT_10_B_LM_3a_LOCAL_INFO_PART_A.md](pending/SUBPLAN_HIST_PIVOT_10_B_LM_3a_LOCAL_INFO_PART_A.md) | SUBPLAN SP-B-LM-3a: MCP Catalog — Local Information Tab (Part A, ~20 parents) → 87-col LM History | P1-CYCLE-2 | — (ready) | PENDING | Opus | max | auto | — | 2026-04-20 |
| 61 | [SUBPLAN_HIST_PIVOT_11_B_LM_3b_LOCAL_INFO_PART_B.md](pending/SUBPLAN_HIST_PIVOT_11_B_LM_3b_LOCAL_INFO_PART_B.md) | SUBPLAN SP-B-LM-3b: MCP Catalog — Local Information Tab (Part B, remaining parents) → 87-col LM History | P1-CYCLE-2 | — (ready) | PENDING | Opus | max | auto | — | 2026-04-20 |
| 62 | [SUBPLAN_HIST_PIVOT_12_B_LM_4_ACCOUNT_ADDRESS_CATALOG.md](pending/SUBPLAN_HIST_PIVOT_12_B_LM_4_ACCOUNT_ADDRESS_CATALOG.md) | SUBPLAN SP-B-LM-4: MCP Catalog — Account & Address Tab → 87-col LM History | P1-CYCLE-2 | — (ready) | PENDING | Opus | max | auto | — | 2026-04-20 |
| 63 | [SUBPLAN_HIST_PIVOT_13_B_LM_5_LEGAL_CATALOG.md](pending/SUBPLAN_HIST_PIVOT_13_B_LM_5_LEGAL_CATALOG.md) | SUBPLAN SP-B-LM-5: MCP Catalog — Legal Tab → 87-col LM History | P1-CYCLE-2 | — (ready) | PENDING | Opus | max | auto | — | 2026-04-20 |
| 64 | [SUBPLAN_HIST_PIVOT_14_B_LM_6_NOTES_CATALOG.md](pending/SUBPLAN_HIST_PIVOT_14_B_LM_6_NOTES_CATALOG.md) | SUBPLAN SP-B-LM-6: MCP Catalog — Notes Tab → 87-col LM History | P1-CYCLE-2 | — (ready) | PENDING | Opus | max | auto | — | 2026-04-20 |
| 65 | [SUBPLAN_HIST_PIVOT_15_B_LM_7_SHARED_SETUP_CATALOG.md](pending/SUBPLAN_HIST_PIVOT_15_B_LM_7_SHARED_SETUP_CATALOG.md) | SUBPLAN SP-B-LM-7: MCP Catalog — Shared Setup Locations Tab → 87-col LM History | P1-CYCLE-2 | — (ready) | PENDING | Opus | max | auto | — | 2026-04-20 |
| 66 | [SUBPLAN_HIST_PIVOT_16_B_LM_8_AUTO_ADDON_CATALOG.md](pending/SUBPLAN_HIST_PIVOT_16_B_LM_8_AUTO_ADDON_CATALOG.md) | SUBPLAN SP-B-LM-8: MCP Catalog — Auto Add-On Tab → 87-col LM History | P1-CYCLE-2 | — (ready) | PENDING | Opus | max | auto | — | 2026-04-20 |
| 67 | [SUBPLAN_HIST_PIVOT_17_B_LM_9_TOP_LEVEL_CATALOG.md](pending/SUBPLAN_HIST_PIVOT_17_B_LM_9_TOP_LEVEL_CATALOG.md) | SUBPLAN SP-B-LM-9: MCP Catalog — Top-level Basic Info Fields → 87-col LM History | P1-CYCLE-2 | — (ready) | PENDING | Opus | max | auto | — | 2026-04-20 |
| 68 | [SUBPLAN_HIST_PIVOT_18_B_LM_R_RECONCILE.md](pending/SUBPLAN_HIST_PIVOT_18_B_LM_R_RECONCILE.md) | SUBPLAN SP-B-LM-R: Reconcile + Merge — Location Management Root-Column Catalog | P1-CYCLE-2 | — (ready) | PENDING | Opus | xhi | auto | — | 2026-04-20 |
| 69 | [SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md](pending/SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md) | SUBPLAN SP-D0: Shared hist-test Utilities (hist-reader.ts + helpers) | P1-CYCLE-2 | — (ready) | PENDING | Sonnet | hi | auto | — | 2026-04-20 |
| 70 | [SUBPLAN_HIST_PIVOT_20_C1_LO_BASIC_INFO_TESTS.md](pending/SUBPLAN_HIST_PIVOT_20_C1_LO_BASIC_INFO_TESTS.md) | SUBPLAN SP-C1: Local Office HIST Column Tests — Basic Info Columns | P1-CYCLE-2 | [SP-D0](pending/SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md) | PENDING | Sonnet | hi | auto | — | 2026-04-20 |
| 71 | [SUBPLAN_HIST_PIVOT_21_C2_LO_ECT_TESTS.md](pending/SUBPLAN_HIST_PIVOT_21_C2_LO_ECT_TESTS.md) | SUBPLAN SP-C2: Local Office HIST Column Tests — ECT Columns | P1-CYCLE-2 | [SP-D0](pending/SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md) | PENDING | Sonnet | hi | auto | — | 2026-04-20 |
| 72 | [SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md](pending/SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md) | SUBPLAN SP-D1: Location Management HIST Per-Column Tests — Currency Root-Tab | P1-CYCLE-2 | [SP-D0](pending/SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md) | PENDING | Opus | xhi | auto | — | 2026-04-20 |
| 73 | [SUBPLAN_HIST_PIVOT_23_D2_LM_PRICING_TESTS.md](pending/SUBPLAN_HIST_PIVOT_23_D2_LM_PRICING_TESTS.md) | SUBPLAN SP-D2: Location Management HIST Per-Column Tests — Pricing Root-Tab | P1-CYCLE-2 | [SP-D0](pending/SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md), [SP-D1](pending/SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md) | PENDING | Sonnet | hi | auto | — | 2026-04-20 |
| 74 | [SUBPLAN_HIST_PIVOT_24_D3a_LM_LOCAL_INFO_PART_A_TESTS.md](pending/SUBPLAN_HIST_PIVOT_24_D3a_LM_LOCAL_INFO_PART_A_TESTS.md) | SUBPLAN SP-D3a: Location Management HIST Per-Column Tests — Local Info Root-Tab (Part A) | P1-CYCLE-2 | [SP-D0](pending/SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md), [SP-D1](pending/SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md) | PENDING | Sonnet | hi | auto | — | 2026-04-20 |
| 75 | [SUBPLAN_HIST_PIVOT_25_D3b_LM_LOCAL_INFO_PART_B_TESTS.md](pending/SUBPLAN_HIST_PIVOT_25_D3b_LM_LOCAL_INFO_PART_B_TESTS.md) | SUBPLAN SP-D3b: Location Management HIST Per-Column Tests — Local Info Root-Tab (Part B) | P1-CYCLE-2 | [SP-D3a](pending/SUBPLAN_HIST_PIVOT_24_D3a_LM_LOCAL_INFO_PART_A_TESTS.md), [SP-D0](pending/SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md) | PENDING | Sonnet | hi | auto | — | 2026-04-20 |
| 76 | [SUBPLAN_HIST_PIVOT_26_D4_LM_ACCOUNT_ADDRESS_TESTS.md](pending/SUBPLAN_HIST_PIVOT_26_D4_LM_ACCOUNT_ADDRESS_TESTS.md) | SUBPLAN SP-D4: Location Management HIST Per-Column Tests — Account & Address Root-Tab | P1-CYCLE-2 | [SP-D0](pending/SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md), [SP-D1](pending/SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md) | PENDING | Sonnet | hi | auto | — | 2026-04-20 |
| 77 | [SUBPLAN_HIST_PIVOT_27_D5_LM_LEGAL_TESTS.md](pending/SUBPLAN_HIST_PIVOT_27_D5_LM_LEGAL_TESTS.md) | SUBPLAN SP-D5: Location Management HIST Per-Column Tests — Legal Root-Tab | P1-CYCLE-2 | [SP-D0](pending/SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md), [SP-D1](pending/SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md) | PENDING | Sonnet | hi | auto | — | 2026-04-20 |
| 78 | [SUBPLAN_HIST_PIVOT_28_D6_LM_NOTES_TESTS.md](pending/SUBPLAN_HIST_PIVOT_28_D6_LM_NOTES_TESTS.md) | SUBPLAN SP-D6: Location Management HIST Per-Column Tests — Notes Root-Tab | P1-CYCLE-2 | [SP-D0](pending/SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md), [SP-D1](pending/SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md) | PENDING | Sonnet | hi | auto | — | 2026-04-20 |
| 79 | [SUBPLAN_HIST_PIVOT_29_D7_LM_SHARED_SETUP_TESTS.md](pending/SUBPLAN_HIST_PIVOT_29_D7_LM_SHARED_SETUP_TESTS.md) | SUBPLAN SP-D7: Location Management HIST Per-Column Tests — Shared Setup Root-Tab | P1-CYCLE-2 | [SP-D0](pending/SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md), [SP-D1](pending/SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md) | PENDING | Sonnet | hi | auto | — | 2026-04-20 |
| 80 | [SUBPLAN_HIST_PIVOT_30_D8_LM_AUTO_ADDON_TESTS.md](pending/SUBPLAN_HIST_PIVOT_30_D8_LM_AUTO_ADDON_TESTS.md) | SUBPLAN SP-D8: Location Management HIST Per-Column Tests — Auto Add-On Root-Tab | P1-CYCLE-2 | [SP-D0](pending/SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md), [SP-D1](pending/SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md) | PENDING | Sonnet | hi | auto | — | 2026-04-20 |
| 81 | [SUBPLAN_HIST_PIVOT_31_D9_LM_TOP_LEVEL_TESTS.md](pending/SUBPLAN_HIST_PIVOT_31_D9_LM_TOP_LEVEL_TESTS.md) | SUBPLAN SP-D9: Location Management HIST Per-Column Tests — Top-level Basic Info Fields | P1-CYCLE-2 | [SP-D0](pending/SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md), [SP-D1](pending/SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md) | PENDING | Sonnet | hi | auto | — | 2026-04-20 |
| 82 | [SUBPLAN_HIST_PIVOT_32_D10_LM_ORPHANS_TESTS.md](pending/SUBPLAN_HIST_PIVOT_32_D10_LM_ORPHANS_TESTS.md) | SUBPLAN SP-D10: Location Management HIST Per-Column Tests — Orphan Columns | P1-CYCLE-2 | [SP-D0](pending/SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md), [SP-D1](pending/SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md) | CONDITIONAL | Sonnet | hi | auto | — | 2026-04-20 |
| 83 | [SUBPLAN_HIST_PIVOT_33_F1_ANOMALY_WRITER.md](pending/SUBPLAN_HIST_PIVOT_33_F1_ANOMALY_WRITER.md) | SUBPLAN SP-F1: Anomaly Writer Utility + JSON Schema + afterEach Wiring | P1-CYCLE-2 | [SP-D0](pending/SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md) | PENDING | Sonnet | hi | auto | — | 2026-04-20 |
| 84 | [SUBPLAN_HIST_PIVOT_34_F2_AUTO_FILER.md](pending/SUBPLAN_HIST_PIVOT_34_F2_AUTO_FILER.md) | SUBPLAN SP-F2: Auto-Bug-Filer Script + Dedup + Dry-run Digest | P1-CYCLE-2 | [SP-F1](pending/SUBPLAN_HIST_PIVOT_33_F1_ANOMALY_WRITER.md) | PENDING | Sonnet | hi | auto | — | 2026-04-20 |
| 85 | [SUBPLAN_HIST_PIVOT_35_E_LO_BUGS.md](pending/SUBPLAN_HIST_PIVOT_35_E_LO_BUGS.md) | SUBPLAN SP-E-LO: Bug Filings — Local Office NOT-TRACKED Fields (Batch) | P1-CYCLE-2 | [SP-C1](pending/SUBPLAN_HIST_PIVOT_20_C1_LO_BASIC_INFO_TESTS.md), [SP-C2](pending/SUBPLAN_HIST_PIVOT_21_C2_LO_ECT_TESTS.md) | GATED | — | — | — | — | 2026-04-20 |
| 86 | [SUBPLAN_HIST_PIVOT_36_E_LM_CUR_BUGS.md](pending/SUBPLAN_HIST_PIVOT_36_E_LM_CUR_BUGS.md) | SUBPLAN SP-E-LM-CUR: Bug Filings — Location Mgmt Currency NOT-TRACKED (CUR-BUG-A/B/C) | P1-CYCLE-2 | [SP-D1](pending/SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md) | GATED | — | — | — | — | 2026-04-20 |
| 87 | [SUBPLAN_HIST_PIVOT_37_E_LM_OTHER_BUGS.md](pending/SUBPLAN_HIST_PIVOT_37_E_LM_OTHER_BUGS.md) | SUBPLAN SP-E-LM-OTHER: Bug Filings — Remaining Location Management NOT-TRACKED (Batch) | P1-CYCLE-2 | [SP-D2](pending/SUBPLAN_HIST_PIVOT_23_D2_LM_PRICING_TESTS.md), [SP-D10](pending/SUBPLAN_HIST_PIVOT_32_D10_LM_ORPHANS_TESTS.md) | GATED | — | — | — | — | 2026-04-20 |
| 88 | [SUBPLAN_HIST_PIVOT_38_J_FINAL_AUDIT.md](pending/SUBPLAN_HIST_PIVOT_38_J_FINAL_AUDIT.md) | SUBPLAN SP-J: WATCHDOG Final Cross-Pivot Audit | P1-CYCLE-2 | [SP-D0](pending/SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md) | PENDING | — | — | — | — | 2026-04-20 |
| 89 | [SUBPLAN_HIST_PIVOT_39_K1_RULES_SWEEP.md](pending/SUBPLAN_HIST_PIVOT_39_K1_RULES_SWEEP.md) | SUBPLAN SP-K1: Framework Rules Sweep — Confirm No Old-Pattern Language | P1-CYCLE-2 | — (ready) | PENDING | — | — | — | — | 2026-04-20 |
| 90 | [SUBPLAN_HIST_PIVOT_40_K2_PROMPTS_SWEEP.md](pending/SUBPLAN_HIST_PIVOT_40_K2_PROMPTS_SWEEP.md) | SUBPLAN SP-K2: Agent Prompts Sweep — Confirm No Old-Pattern Instructions | P1-CYCLE-2 | — (ready) | PENDING | — | — | — | — | 2026-04-20 |
| 91 | [SUBPLAN_HISTORY_01_MCP_FINDINGS.md](pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md) | SP1 MCP Discovery Findings — History Integration | P2-CYCLE-3 | — (ready) | DELIVERABLE | — | — | — | — | 2026-04-28 |

### ⚠️ Cycle Detected
These plans form a circular dependency (authoring error). Resolve by editing `**Depends on**` fields.

| File | Title | Blocked by |
|---|---|---|
| [SUBPLAN_PIPELINE_TSC_HARDEN.md](pending/SUBPLAN_PIPELINE_TSC_HARDEN.md) | SUBPLAN: Pipeline tsc Compilation — Harden Build Mode | [PLAN_CLIENT_DELIVERABLE_REBUILD](pending/PLAN_CLIENT_DELIVERABLE_REBUILD.md) |

### Parent Plans (Waiting on Subplans)
These stay in `pending/` until their last subplan closes them (LR-027 parent-cascade). Do not execute directly.

| File | Title | Priority | Status | Pending Subplans | Created |
|---|---|---|---|---|---|
| [PLAN_CLIENT_DELIVERABLE_REBUILD.md](pending/PLAN_CLIENT_DELIVERABLE_REBUILD.md) | PLAN: Client Deliverable Rebuild — Path A (Vendored Framework + git-archive Ship) | P0-EMERGENCY | PENDING | 1 | 2026-04-30 |
| [PLAN_DELIVERABLE_QUALITY_UPGRADE.md](pending/PLAN_DELIVERABLE_QUALITY_UPGRADE.md) | PLAN: Deliverable Quality Upgrade — CSV, Specs, Cleanup, Reporting | P0-CYCLE-1 | PENDING | 30 | 2026-04-22 |
| [PLAN_HIST_COLUMN_FIRST_PIVOT.md](pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md) | MASTER PLAN — HIST Column-First Pivot ("Column-First Pivot Plan") | P1-CYCLE-2 | PENDING | 31 | 2026-04-20 |

---

## Done (done/)

Completed plans, sorted by Executed date desc. Historical reference — do not modify.

| File | Title | Status | Completed |
|---|---|---|---|
| [SUBPLAN_DQU_05A_LI_TC_PHASE_0_LINT_SWEEP.md](done/SUBPLAN_DQU_05A_LI_TC_PHASE_0_LINT_SWEEP.md) | SUBPLAN: LI Test-Case MD — Phase 0 Lint Sweep | SUPERSEDED | never (folded scope) |
| [PLAN_FRIDAY_DELIVERABLE_2026-04-29.md](done/PLAN_FRIDAY_DELIVERABLE_2026-04-29.md) | PLAN: Friday Deliverable 2026-04-29 — CI Scaffold + Module-Parallel + MFA-less User | DONE | 2026-04-30 |
| [SUBPLAN_EFD_04_DEFERRED_VERIFICATION.md](done/SUBPLAN_EFD_04_DEFERRED_VERIFICATION.md) | SUBPLAN SP-EFD-04 — Deferred Verification (Run When Ready) | DONE | 2026-04-30 |
| [PLAN_53_LOCSET_TESTID_LIVE_VERIFICATION.md](done/PLAN_53_LOCSET_TESTID_LIVE_VERIFICATION.md) | PLAN 53 — Location testid verification & gap report (REWRITE) | DONE | 2026-04-29 |
| [PLAN_INJECTION_CHAIN_HARDENING.md](done/PLAN_INJECTION_CHAIN_HARDENING.md) | PLAN: Auto-Injection Chain Hardening — Future-Proof the Rule Reach | DONE | 2026-04-29 |
| [SUBPLAN_EFD_01_MODULE_PARALLEL.md](done/SUBPLAN_EFD_01_MODULE_PARALLEL.md) | SUBPLAN SP-EFD-01 — Module-Level Playwright Projects (Local Office + Locations as 2 Workers) | DONE | 2026-04-29 |
| [SUBPLAN_EFD_03_CI_WORKFLOW.md](done/SUBPLAN_EFD_03_CI_WORKFLOW.md) | SUBPLAN SP-EFD-03 — GitHub Actions Workflow Rewrite (Manual, Ubuntu+Chromium, Secret-Driven) | DONE | 2026-04-29 |
| [PLAN_BUG_ARCHETYPE_CATALOG.md](done/PLAN_BUG_ARCHETYPE_CATALOG.md) | PLAN: Bug-Archetype Catalog — Persistent QA Memory Across Audits | DONE | 2026-04-28 |
| [PLAN_FIND_BUGS_LI_FOLLOWUP.md](done/PLAN_FIND_BUGS_LI_FOLLOWUP.md) | PLAN: /find-bugs Adversarial Pass on Local Information — closes SP-DQU-04 discipline gap | DONE | 2026-04-28 |
| [PLAN_REMOVE_VAULT.md](done/PLAN_REMOVE_VAULT.md) | Plan: Remove Vault, Store Credentials in Plain Text | — | 2026-04-28 |
| [SUBPLAN_DQU_05B_STRICT_PLAN_LINE_REMEDIATION.md](done/SUBPLAN_DQU_05B_STRICT_PLAN_LINE_REMEDIATION.md) | SUBPLAN: SP-DQU-05 Strict-Step-5 Remediation + Anti-Phantom-Handoff Guard | DONE | 2026-04-28 |
| [SUBPLAN_DQU_05D_LI_NEW_BUG_FIXES.md](done/SUBPLAN_DQU_05D_LI_NEW_BUG_FIXES.md) | SUBPLAN: LI New-Bug Fixes + ARCH Drift Backfill (post-FIND_BUGS_LI_FOLLOWUP) | DONE | 2026-04-28 |
| [SUBPLAN_EFD_02_MFA_LESS_CONTRACT.md](done/SUBPLAN_EFD_02_MFA_LESS_CONTRACT.md) | SUBPLAN SP-EFD-02 — MFA-less User Contract (Docs-only; Code Already Supports) | DONE | 2026-04-28 |
| [PLAN_AUDIT_COPILOT.md](done/PLAN_AUDIT_COPILOT.md) | PLAN: Audit Copilot | SUPERSEDED | 2026-04-27 |
| [PLAN_CC_ANTHROPIC_ALIGNMENT.md](done/PLAN_CC_ANTHROPIC_ALIGNMENT.md) | PLAN: Anthropic-Aligned Claude Code Setup — Surface Debloat + Audit Hardening + Native Patterns | DONE | 2026-04-27 |
| [PLAN_CLAUDE_SETUP_AUDIT_REMEDIATION.md](done/PLAN_CLAUDE_SETUP_AUDIT_REMEDIATION.md) | PLAN: Claude Code Setup Audit & Remediation — Align with Official Best Practices | SUPERSEDED | 2026-04-27 |
| [PLAN_FRAMEWORK_AUDIT_EVIDENCE_EMISSION.md](done/PLAN_FRAMEWORK_AUDIT_EVIDENCE_EMISSION.md) | RCA + Structural Fixes: Skip-Pattern + Identity-Skill Ceremony Bloat | SUPERSEDED | 2026-04-27 |
| [SUBPLAN_AAE_06_PARALLEL_ROLLOUT.md](done/SUBPLAN_AAE_06_PARALLEL_ROLLOUT.md) | SUBPLAN SP-AAE-06: Parallel 9-Module Rollout Under New System | CANCELLED | 2026-04-27 |
| [SUBPLAN_CCE_00_AUDIT_BOUNDARY_HARDENING.md](done/SUBPLAN_CCE_00_AUDIT_BOUNDARY_HARDENING.md) | SUBPLAN: Audit Boundary Hardening — Evidence-Emission Guardrails (run-first scaffolding) | DONE | 2026-04-27 |
| [SUBPLAN_CCE_01_FOUNDATION_CLEANUP.md](done/SUBPLAN_CCE_01_FOUNDATION_CLEANUP.md) | SUBPLAN: Foundation Cleanup — Copilot Absorb/Evict + Stop the Bleeding | DONE | 2026-04-27 |
| [SUBPLAN_CCE_02B_TODO_INJECTION_ENFORCEMENT.md](done/SUBPLAN_CCE_02B_TODO_INJECTION_ENFORCEMENT.md) | SUBPLAN: TodoWrite Context Injection Enforcement (run-first guardrail) | DONE | 2026-04-27 |
| [SUBPLAN_CCE_02_CLAUDEMD_RIGHTSIZE.md](done/SUBPLAN_CCE_02_CLAUDEMD_RIGHTSIZE.md) | SUBPLAN: CLAUDE.md Right-size + Path-scoped Rules + Anthropic Native Blocks | DONE | 2026-04-27 |
| [SUBPLAN_CCE_03_SKILL_RATIONALIZATION.md](done/SUBPLAN_CCE_03_SKILL_RATIONALIZATION.md) | SUBPLAN: Skill Rationalization — Merge Critique Cluster + Trim Descriptions + Verification-Artifact Step | DONE | 2026-04-27 |
| [SUBPLAN_CCE_04_AUDIT_HARDENING.md](done/SUBPLAN_CCE_04_AUDIT_HARDENING.md) | SUBPLAN: Identity Ceremony Fast-Path + §2 Ownership Broadening (Plan B Fixes 3 + 4) | DONE | 2026-04-27 |
| [SUBPLAN_CCE_05_MEMORY_HOOKS_SETTINGS.md](done/SUBPLAN_CCE_05_MEMORY_HOOKS_SETTINGS.md) | SUBPLAN: Memory Consolidation + Hooks/Settings Hardening | DONE | 2026-04-27 |
| [SUBPLAN_CCE_06_VERIFICATION.md](done/SUBPLAN_CCE_06_VERIFICATION.md) | SUBPLAN: Cross-cutting Verification — V0-V11 Including Fresh-Session Cold-Read + Plan B Replays | DONE | 2026-04-27 |
| [SUBPLAN_DQU_03_C1_LOS_FIXES_AND_REEXPORT.md](done/SUBPLAN_DQU_03_C1_LOS_FIXES_AND_REEXPORT.md) | SUBPLAN: LOS CSV Fixes — 11 Reviewer Flags + Re-export + File APP Bugs | DONE | 2026-04-27 |
| [SUBPLAN_DQU_04_B2_LI_NEUTRAL_EYE_AUDIT.md](done/SUBPLAN_DQU_04_B2_LI_NEUTRAL_EYE_AUDIT.md) | SUBPLAN: Neutral-Eye Audit — Local Information (Chrome Claude) | DONE | 2026-04-27 |
| [SUBPLAN_DQU_05_C2_LI_FIXES_AND_REEXPORT.md](done/SUBPLAN_DQU_05_C2_LI_FIXES_AND_REEXPORT.md) | SUBPLAN: LI CSV Fixes + Re-export + File LI APP Bugs | DONE | 2026-04-27 |
| [SUBPLAN_REPO_02_CLAUDE_COPILOT_CONSOLIDATION.md](done/SUBPLAN_REPO_02_CLAUDE_COPILOT_CONSOLIDATION.md) | SUBPLAN: Claude/Copilot Consolidation | SUPERSEDED | 2026-04-27 |
| [SUBPLAN_REPO_13_COPILOT_ACCOUNTABILITY.md](done/SUBPLAN_REPO_13_COPILOT_ACCOUNTABILITY.md) | SUBPLAN: Copilot Accountability Audit | SUPERSEDED | 2026-04-27 |
| [SUBPLAN_AAE_04_CONSUMERS_NO_REWALK.md](done/SUBPLAN_AAE_04_CONSUMERS_NO_REWALK.md) | SUBPLAN SP-AAE-04: Generator + Auditor Refactor — Consume Artifact, Spot-Check Only | DONE | 2026-04-25 |
| [SUBPLAN_AAE_05_HEURISTIC_STALENESS.md](done/SUBPLAN_AAE_05_HEURISTIC_STALENESS.md) | SUBPLAN SP-AAE-05: Authoring-from-Spec Heuristic + Catalog Staleness Signal | DONE | 2026-04-25 |
| [SUBPLAN_DQU_11_F1_REMAINING_MODULES_PLANNER.md](done/SUBPLAN_DQU_11_F1_REMAINING_MODULES_PLANNER.md) | SUBPLAN: Remaining 9 Modules — Neutral-Eye Audit Planner | SUPERSEDED | 2026-04-25 |
| [PLAN_OLD_SITE_TRUTH_BASELINE.md](done/PLAN_OLD_SITE_TRUTH_BASELINE.md) | PLAN_OLD_SITE_TRUTH_BASELINE | DONE | 2026-04-24 |
| [PLAN_PLAYWRIGHT_CLI_FULL_SWITCH.md](done/PLAN_PLAYWRIGHT_CLI_FULL_SWITCH.md) | PLAN: Playwright CLI Full Switch — MCP Retirement | DONE | 2026-04-24 |
| [PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md](done/PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md) | PLAN: Playwright CLI Primary + Claude-in-Chrome Specialist (hybrid) | DONE | 2026-04-24 |
| [SUBPLAN_OSB_01_ACCESS_VERIFY_AND_ROAM.md](done/SUBPLAN_OSB_01_ACCESS_VERIFY_AND_ROAM.md) | SUBPLAN SP-OSB-01: Old-Site Access Verify + Baseline Roam + BUG Oracle Bundle | DONE | 2026-04-24 |
| [SUBPLAN_OSB_02_REQUIREMENTS_AGENT_REWRITE.md](done/SUBPLAN_OSB_02_REQUIREMENTS_AGENT_REWRITE.md) | SUBPLAN SP-OSB-02: Requirements Agent — Phase 1 Rewrite (Old-Site FIRST) | DONE | 2026-04-24 |
| [SUBPLAN_OSB_03_STRUCTURAL_BUNDLE.md](done/SUBPLAN_OSB_03_STRUCTURAL_BUNDLE.md) | SUBPLAN SP-OSB-03: Structural Bundle — Shared Rules + Planner + Encore Questions + Client CLAUDE + Retrofit | DONE | 2026-04-24 |
| [SUBPLAN_PWC2_00_RESEARCH_AND_VERIFY_CLAIMS.md](done/SUBPLAN_PWC2_00_RESEARCH_AND_VERIFY_CLAIMS.md) | SUBPLAN SP-PWC2-00: Research + Verify Researcher Claims (kill-switch gate) | DONE | 2026-04-24 |
| [SUBPLAN_PWC2_01_LR038_V2_CHROME_VS_CLI_MATRIX.md](done/SUBPLAN_PWC2_01_LR038_V2_CHROME_VS_CLI_MATRIX.md) | SUBPLAN SP-PWC2-01: LR-038 v2 — Chrome vs CLI 2-way Matrix | DONE | 2026-04-24 |
| [SUBPLAN_PWC2_02_PLANNING_SKILL_BROWSERTOOL_FIELD.md](done/SUBPLAN_PWC2_02_PLANNING_SKILL_BROWSERTOOL_FIELD.md) | SUBPLAN SP-PWC2-02: `/planning` Skill — Require `BrowserTool` Frontmatter | DONE | 2026-04-24 |
| [SUBPLAN_PWC2_03_PIPELINE_AGENTS_CLI_REWRITE.md](done/SUBPLAN_PWC2_03_PIPELINE_AGENTS_CLI_REWRITE.md) | SUBPLAN SP-PWC2-03: Pipeline Agents — CLI + Chrome Dual Wiring | DONE | 2026-04-24 |
| [SUBPLAN_PWC2_04_SHARED_RULES_10_IDS_REWRITE.md](done/SUBPLAN_PWC2_04_SHARED_RULES_10_IDS_REWRITE.md) | SUBPLAN SP-PWC2-04: Shared Rules — Rewrite 10 IDs for Chrome+CLI | DONE | 2026-04-24 |
| [SUBPLAN_PWC2_05_HARD_GATES_ORCHESTRATOR.md](done/SUBPLAN_PWC2_05_HARD_GATES_ORCHESTRATOR.md) | SUBPLAN SP-PWC2-05: Hard Gates + Orchestrator — PF-G5 Normalizer + Worker + Pipeline-Def | DONE | 2026-04-24 |
| [SUBPLAN_PWC2_06_BROWSERTOOL_GATE_HOOK.md](done/SUBPLAN_PWC2_06_BROWSERTOOL_GATE_HOOK.md) | SUBPLAN SP-PWC2-06: `BrowserTool` PreToolUse Hook (opt-in, ships disabled) | DONE | 2026-04-24 |
| [SUBPLAN_PWC2_07_MCP_RETIREMENT_AND_PILOT.md](done/SUBPLAN_PWC2_07_MCP_RETIREMENT_AND_PILOT.md) | SUBPLAN SP-PWC2-07: MCP Retirement + Pilot Module Run (final gate) | DONE | 2026-04-24 |
| [PLAN_IDENTITY_DISCIPLINE_STRUCTURAL.md](done/PLAN_IDENTITY_DISCIPLINE_STRUCTURAL.md) | PLAN — Identity discipline: structural enforcement (hooks + skill mandates) | DONE | 2026-04-23 |
| [SUBPLAN_AAE_01_ARTIFACT_SPEC.md](done/SUBPLAN_AAE_01_ARTIFACT_SPEC.md) | SUBPLAN SP-AAE-01: Field-Inventory Artifact Spec — Format, Naming, Template | DONE | 2026-04-23 |
| [SUBPLAN_AAE_02_PRECOMMIT_GATE.md](done/SUBPLAN_AAE_02_PRECOMMIT_GATE.md) | SUBPLAN SP-AAE-02: Pre-Commit Gate — Reject TC MD Edits Without Fresh Field-Inventory | DONE | 2026-04-23 |
| [SUBPLAN_AAE_03_PLANNER_EMIT_ARTIFACT.md](done/SUBPLAN_AAE_03_PLANNER_EMIT_ARTIFACT.md) | SUBPLAN SP-AAE-03: Planner Workflow Refactor — Emit Field-Inventory as Phase 0.5 Output | DONE | 2026-04-23 |
| [SUBPLAN_DQU_02_B1_LOS_NEUTRAL_EYE_AUDIT.md](done/SUBPLAN_DQU_02_B1_LOS_NEUTRAL_EYE_AUDIT.md) | SUBPLAN: Neutral-Eye Audit — Local Office Settings (Chrome Claude) | DONE | 2026-04-23 |
| [SUBPLAN_DQU_06_E1_CONVERTER_RENAME_TAGS.md](done/SUBPLAN_DQU_06_E1_CONVERTER_RENAME_TAGS.md) | SUBPLAN: Converter — Rename `Specific Field` → `Tags` Column | DONE | 2026-04-23 |
| [SUBPLAN_IDS_01_PRETOOLUSE_IDENTITY_HOOK.md](done/SUBPLAN_IDS_01_PRETOOLUSE_IDENTITY_HOOK.md) | SUBPLAN SP-IDS-01 — PreToolUse + Stop hooks for identity-switch enforcement | DONE | 2026-04-23 |
| [SUBPLAN_IDS_02_OVERRIDE_DISCIPLINE_HOOK.md](done/SUBPLAN_IDS_02_OVERRIDE_DISCIPLINE_HOOK.md) | SUBPLAN SP-IDS-02 — PreToolUse hook for override discipline (typed authorization) | DONE | 2026-04-23 |
| [SUBPLAN_IDS_03_IDENTITY_SKILL_CONSTRAINT_ARTIFACT.md](done/SUBPLAN_IDS_03_IDENTITY_SKILL_CONSTRAINT_ARTIFACT.md) | SUBPLAN SP-IDS-03 — `/identity` SKILL.md Step 6.5 constraint extraction artifact | DONE | 2026-04-23 |
| [SUBPLAN_IDS_04_EXECUTE_PHASE0_CROSSCHECK.md](done/SUBPLAN_IDS_04_EXECUTE_PHASE0_CROSSCHECK.md) | SUBPLAN SP-IDS-04 — `/execute` SKILL.md Phase 0 subplan-identity vs §2 cross-check HALT | DONE | 2026-04-23 |
| [PLAN_SP_B_LM_2_CLOSURE_AND_COMPLETENESS_GATE.md](done/PLAN_SP_B_LM_2_CLOSURE_AND_COMPLETENESS_GATE.md) | PLAN — SP-B-LM-2 Closure & Completeness Gate (LR-040) | DONE | 2026-04-22 |
| [SUBPLAN_DQU_01_A1_PREP_AND_INDEX_BLOCK.md](done/SUBPLAN_DQU_01_A1_PREP_AND_INDEX_BLOCK.md) | SUBPLAN: Prep — INDEX P0-EMERGENCY Block + Neutral-Eye-Audit Folder + Activity Log | DONE | 2026-04-22 |
| [SUBPLAN_HIST_PIVOT_07_B_LO_R_RECONCILE.md](done/SUBPLAN_HIST_PIVOT_07_B_LO_R_RECONCILE.md) | SUBPLAN SP-B-LO-R: Reconcile + Merge — Local Office Root-Column Catalog | DONE | 2026-04-22 |
| [SUBPLAN_HIST_PIVOT_08_B_LM_1_CURRENCY_CATALOG.md](done/SUBPLAN_HIST_PIVOT_08_B_LM_1_CURRENCY_CATALOG.md) | SUBPLAN SP-B-LM-1: MCP Catalog — Currency Tab → 87-col Location Management History | DONE | 2026-04-22 |
| [SUBPLAN_HIST_PIVOT_09_B_LM_2_PRICING_CATALOG.md](done/SUBPLAN_HIST_PIVOT_09_B_LM_2_PRICING_CATALOG.md) | SUBPLAN SP-B-LM-2: MCP Catalog — Pricing Tab → 87-col Location Management History | DONE | 2026-04-22 |
| [SUBPLAN_HIST_PIVOT_41_B_LO_V_JIRA_VERIFY.md](done/SUBPLAN_HIST_PIVOT_41_B_LO_V_JIRA_VERIFY.md) | SUBPLAN SP-B-LO-V: MCP Live Verification — Jira Claims vs Our Catalog | DONE | 2026-04-22 |
| [SUBPLAN_HIST_PIVOT_42_L1_TC_AUTHORING_RULES.md](done/SUBPLAN_HIST_PIVOT_42_L1_TC_AUTHORING_RULES.md) | SUBPLAN SP-L1: TC Authoring Rules — Install & Propagate | DONE | 2026-04-22 |
| [PLAN_AAA_CLIENT_DELIVERABLE_REMAINING.md](done/PLAN_AAA_CLIENT_DELIVERABLE_REMAINING.md) | PLAN: Client Deliverable — Remaining Work Before Colleague Handoff | DONE | 2026-04-21 |
| [PLAN_BUNDLE_OPERATIONAL_HARDENING.md](done/PLAN_BUNDLE_OPERATIONAL_HARDENING.md) | PLAN: Bundle Operational Hardening — Structural Fixes for Working Client Delivery | DONE | 2026-04-21 |
| [PLAN_BUNDLE_SMOKE_TEST.md](done/PLAN_BUNDLE_SMOKE_TEST.md) | PLAN: Runnable Bundle Smoke Test (colleague validation) | DONE | 2026-04-21 |
| [PLAN_CLIENT_HANDOFF_VALIDATION.md](done/PLAN_CLIENT_HANDOFF_VALIDATION.md) | PLAN: Client Handoff Validation — Minimum Package + Full Suite + Allure Quality | DONE | 2026-04-21 |
| [PLAN_MT_AUDIT.md](done/PLAN_MT_AUDIT.md) | PLAN_MT_AUDIT — Evidence-Based Audit of SP-MT-01..07 (Report Only, No Fixes) | DONE | 2026-04-21 |
| [SUBPLAN_HIST_PIVOT_05b_B_LO_1b_BASIC_INFO_RESIDUAL.md](done/SUBPLAN_HIST_PIVOT_05b_B_LO_1b_BASIC_INFO_RESIDUAL.md) | SUBPLAN SP-B-LO-1b: MCP Catalog — Local Office Basic Info Residual Parents → 42-col History Mapping | DONE | 2026-04-21 |
| [SUBPLAN_HIST_PIVOT_06B_B_LO_2b_ECT_DIRECT_VERIFY.md](done/SUBPLAN_HIST_PIVOT_06B_B_LO_2b_ECT_DIRECT_VERIFY.md) | SUBPLAN SP-B-LO-2b: MCP Direct-Verify — Local Office ECT Residual Items → 42-col History Mapping | DONE | 2026-04-21 |
| [SUBPLAN_HIST_PIVOT_06_B_LO_2_ECT_CATALOG.md](done/SUBPLAN_HIST_PIVOT_06_B_LO_2_ECT_CATALOG.md) | SUBPLAN SP-B-LO-2: MCP Catalog — Local Office ECT → 42-col History Mapping | DONE | 2026-04-21 |
| [PLAN_HIST_INTEGRITY_HARDENING.md](done/PLAN_HIST_INTEGRITY_HARDENING.md) | PLAN: History Integrity Hardening — Parent→Column Mapping & Per-Save Correspondence | SUPERSEDED | 2026-04-20 (superseded — did not execute; content absorbed into master pivot plan) |
| [PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md](done/PLAN_HISTORY_INTEGRATION_CROSS_TAB_SAVE_VERIFICATION.md) | PLAN: History Integration Testing — Cross-Tab Save Verification | SUPERSEDED | 2026-04-20 (Phase 0 + Phase 1 scaffold work landed; Phase 2 append-per-spec pattern retired under pivot. SP1-SP7 done artifacts remain valid. SUBPLAN_HISTORY_01_MCP_FINDINGS.md remains authoritative input.) |
| [SUBPLAN_HISTORY_08_BUG_REPORTS.md](done/SUBPLAN_HISTORY_08_BUG_REPORTS.md) | SUBPLAN 8: Bug Reports — History Discrepancies | SUPERSEDED | 2026-04-20 (folded — bug-filing work continues under the successor's gated SP-E-* subplans) |
| [PLAN_BROWSER_TOOL_SELECTION.md](done/PLAN_BROWSER_TOOL_SELECTION.md) | PLAN — Browser Tool Selection: Claude in Chrome vs Playwright MCP | DONE | 2026-04-20 |
| [SUBPLAN_HIST_PIVOT_01_A1_PURGE_LOC_SPECS.md](done/SUBPLAN_HIST_PIVOT_01_A1_PURGE_LOC_SPECS.md) | SUBPLAN SP-A1: Purge HIST TCs from 8 Location Specs | DONE | 2026-04-20 |
| [SUBPLAN_HIST_PIVOT_02_A2_PURGE_LO_SPECS.md](done/SUBPLAN_HIST_PIVOT_02_A2_PURGE_LO_SPECS.md) | SUBPLAN SP-A2: Purge HIST TCs from 2 Local Office Specs | DONE | 2026-04-20 |
| [SUBPLAN_HIST_PIVOT_03_A3_PURGE_MDS_CSVS.md](done/SUBPLAN_HIST_PIVOT_03_A3_PURGE_MDS_CSVS.md) | SUBPLAN SP-A3: Strip HIST Sections from 10 Test-Case MDs + Re-export CSVs | DONE | 2026-04-20 |
| [SUBPLAN_HIST_PIVOT_04_H_DOCS_LANG.md](done/SUBPLAN_HIST_PIVOT_04_H_DOCS_LANG.md) | SUBPLAN SP-H: REQUIREMENTS.md §History Tracking — Language Revision | DONE | 2026-04-20 |
| [SUBPLAN_HIST_PIVOT_05_B_LO_1_BASIC_INFO_CATALOG.md](done/SUBPLAN_HIST_PIVOT_05_B_LO_1_BASIC_INFO_CATALOG.md) | SUBPLAN SP-B-LO-1: MCP Catalog — Local Office Basic Info → 42-col History Mapping | DONE | 2026-04-20 |
| [PLAN_MULTI_TENANT_RESTRUCTURE.md](done/PLAN_MULTI_TENANT_RESTRUCTURE.md) | MASTER PLAN: Multi-Tenant Repo Restructure | DONE | 2026-04-17 |
| [SUBPLAN_MT_01_SCAFFOLD_ALIASES.md](done/SUBPLAN_MT_01_SCAFFOLD_ALIASES.md) | SUBPLAN MT-01: Scaffold + Aliases + Config Shim (No File Moves) | DONE | 2026-04-17 |
| [SUBPLAN_MT_02_MOVE_TEST_CONTENT.md](done/SUBPLAN_MT_02_MOVE_TEST_CONTENT.md) | SUBPLAN MT-02: Move Encore Test Content | DONE | 2026-04-17 |
| [SUBPLAN_MT_03_MOVE_DOCS_AND_PLANNING.md](done/SUBPLAN_MT_03_MOVE_DOCS_AND_PLANNING.md) | SUBPLAN MT-03: Move Docs, specs_planning, Exports, Client Config | DONE | 2026-04-17 |
| [SUBPLAN_MT_04_CLIENT_AWARE_SCRIPTS.md](done/SUBPLAN_MT_04_CLIENT_AWARE_SCRIPTS.md) | SUBPLAN MT-04: Client-Aware Pipeline Scripts | DONE | 2026-04-17 |
| [SUBPLAN_MT_05_SPLIT_RULES.md](done/SUBPLAN_MT_05_SPLIT_RULES.md) | SUBPLAN MT-05: Split CLAUDE.md + AGENT_SHARED_RULES | DONE | 2026-04-17 |
| [SUBPLAN_MT_06_PARAMETERIZE_AGENTS.md](done/SUBPLAN_MT_06_PARAMETERIZE_AGENTS.md) | SUBPLAN MT-06: Parameterize Pipeline Agents | DONE | 2026-04-17 |
| [SUBPLAN_MT_07_DELIVERY_PACKAGER.md](done/SUBPLAN_MT_07_DELIVERY_PACKAGER.md) | SUBPLAN MT-07: Handoff Readiness (NOT a Packager) | DONE | 2026-04-17 |
| [SUBPLAN_REPO_01_CLIENT_DELIVERY_QUICK.md](done/SUBPLAN_REPO_01_CLIENT_DELIVERY_QUICK.md) | SUBPLAN: Client Delivery Quick Build (V1) — SUPERSEDED | SUPERSEDED | 2026-04-16 (reverted before completion) |
| [PLAN_CLIENT_REPO_DELIVERY.md](done/PLAN_CLIENT_REPO_DELIVERY.md) | MEGA PLAN: Client Repo Delivery — Triple-Audited — SUPERSEDED | SUPERSEDED | 2026-04-16 |
| [SUBPLAN_HISTORY_06_LOCATION_REMAINING_INTEGRATION.md](done/SUBPLAN_HISTORY_06_LOCATION_REMAINING_INTEGRATION.md) | SUBPLAN 6: Location Mgmt History Integration — Remaining Specs | DONE | 2026-04-16 |
| [SUBPLAN_HISTORY_07_VALIDATION.md](done/SUBPLAN_HISTORY_07_VALIDATION.md) | SUBPLAN 7: Validation — Full Suite Run + Cleanup | DONE | 2026-04-16 |
| [SUBPLAN_REPO_09_CLIENT_DELIVERY_POLISH.md](done/SUBPLAN_REPO_09_CLIENT_DELIVERY_POLISH.md) | SUBPLAN: Client Delivery Polish (V2) — SUPERSEDED | SUPERSEDED | 2026-04-16 |
| [PLAN_HIST_EXTERNAL_SP1_AUDIT.md](done/PLAN_HIST_EXTERNAL_SP1_AUDIT.md) | PLAN_HIST_EXTERNAL_SP1_AUDIT | DONE | 2026-04-15 by WATCHDOG (Claude Opus 4.6, see agent-activity-log.md 2026-04-15T09:15) |
| [SUBPLAN_HISTORY_04_LOCAL_OFFICE_INTEGRATION.md](done/SUBPLAN_HISTORY_04_LOCAL_OFFICE_INTEGRATION.md) | SUBPLAN 4: Local Office History Integration Tests | DONE | 2026-04-15 (TCs implemented + verified per "Verification Run" sections below) |
| [PLAN_AUD017_HARD_GATE.md](done/PLAN_AUD017_HARD_GATE.md) | PLAN — Graduate AUD-017 into Structural Hard Gate | DONE | 2026-04-15 (OWNER, Claude Opus 4.6) |
| [PLAN_AGENT_MISTAKES_HIST_GRADUATION.md](done/PLAN_AGENT_MISTAKES_HIST_GRADUATION.md) | PLAN_AGENT_MISTAKES_HIST_GRADUATION | DONE | 2026-04-15 |
| [PLAN_HIST_RUN_SP3_SP4_SPECS.md](done/PLAN_HIST_RUN_SP3_SP4_SPECS.md) | PLAN_HIST_RUN_SP3_SP4_SPECS | DONE | 2026-04-15 |
| [PLAN_HIST_SP2_PER_TC_MCP_AUDIT.md](done/PLAN_HIST_SP2_PER_TC_MCP_AUDIT.md) | PLAN_HIST_SP2_PER_TC_MCP_AUDIT | DONE | 2026-04-15 |
| [PLAN_HIST_SP3_MISSING_TCS.md](done/PLAN_HIST_SP3_MISSING_TCS.md) | PLAN_HIST_SP3_MISSING_TCS | DONE | 2026-04-15 |
| [PLAN_HIST_SP3_STATUS_RECONCILE.md](done/PLAN_HIST_SP3_STATUS_RECONCILE.md) | PLAN_HIST_SP3_STATUS_RECONCILE | DONE | 2026-04-15 |
| [PLAN_HIST_TC_LOS_HIS_003_FIX.md](done/PLAN_HIST_TC_LOS_HIS_003_FIX.md) | PLAN_HIST_TC_LOS_HIS_003_FIX | DONE | 2026-04-15 |
| [PLAN_PLANS_GARDENER_SWEEP.md](done/PLAN_PLANS_GARDENER_SWEEP.md) | PLAN_PLANS_GARDENER_SWEEP | DONE | 2026-04-15 |
| [SUBPLAN_HISTORY_05_LOCATION_CORE_INTEGRATION.md](done/SUBPLAN_HISTORY_05_LOCATION_CORE_INTEGRATION.md) | SUBPLAN 5: Location Mgmt History Integration — Core Specs | DONE | 2026-04-15 |
| [SUBPLAN_HISTORY_03_INFRASTRUCTURE.md](done/SUBPLAN_HISTORY_03_INFRASTRUCTURE.md) | SUBPLAN 3: Infrastructure — Page Objects, Selectors, Fixtures | DONE | 2026-04-14 |
| [SUBPLAN_HISTORY_01_MCP_DISCOVERY.md](done/SUBPLAN_HISTORY_01_MCP_DISCOVERY.md) | SUBPLAN 1: MCP Discovery — History Integration | DONE | 2026-04-13 by OWNER (Copilot in Claude Code Mode) |
| [SUBPLAN_HISTORY_02_REQUIREMENTS_AND_TCS.md](done/SUBPLAN_HISTORY_02_REQUIREMENTS_AND_TCS.md) | SUBPLAN 2: Requirements Update + Integration Test Cases | DONE | 2026-04-13 |
| [PLAN_AUDIT_LOCAL_INFORMATION.md](done/PLAN_AUDIT_LOCAL_INFORMATION.md) | PLAN: Audit + Execute LOCAL_INFORMATION Page | DONE | 2026-04-10 |
| [PLAN_FIX_FALSE_POSITIVE_SELECTORS_AND_TESTID_CSV.md](done/PLAN_FIX_FALSE_POSITIVE_SELECTORS_AND_TESTID_CSV.md) | PLAN: Fix False Positive Selectors + Generate Clean Missing data-testid CSV | DONE | 2026-04-09 |
| [SESSION_1_FINDINGS.md](done/SESSION_1_FINDINGS.md) | SESSION 1 FINDINGS — Comprehensive data-testid DOM Scan | COMPLETE | 2026-04-09 |
| [SESSION_2_FINDINGS.md](done/SESSION_2_FINDINGS.md) | SESSION 2 FINDINGS — Transient Selector Verification | COMPLETE | 2026-04-09 |
| [SESSION_3_FINDINGS.md](done/SESSION_3_FINDINGS.md) | SESSION 3 FINDINGS — False Positive data-testid Verification | COMPLETE | 2026-04-09 |
| [PLAN_AUDIT_AUTO_ADDON.md](done/PLAN_AUDIT_AUTO_ADDON.md) | PLAN_AUDIT_AUTO_ADDON — Session 1 Audit (Execute in Session 2) | — | 2026-04-08 |
| [PLAN_AUDIT_ECT.md](done/PLAN_AUDIT_ECT.md) | PLAN_AUDIT_ECT — ECT Settings Persistence & Coverage Audit | DONE | 2026-04-08 |
| [PLAN_AUDIT_NOTES.md](done/PLAN_AUDIT_NOTES.md) | PLAN_AUDIT_NOTES — Notes Tab Persistence & Coverage Audit | DONE | 2026-04-08 |
| [PLAN_AUDIT_SHARED_SETUP.md](done/PLAN_AUDIT_SHARED_SETUP.md) | PLAN_AUDIT_SHARED_SETUP — Session 1 Audit (Execute in Session 2) | — | 2026-04-08 |
| [NEXT_SESSION_PROMPT.md](done/NEXT_SESSION_PROMPT.md) | Next Session Prompt — RCA & Fix All Failing Specs | — | 2026-04-07 |
| [PLAN_AUDIT_ACCOUNT_ADDRESS.md](done/PLAN_AUDIT_ACCOUNT_ADDRESS.md) | PLAN_AUDIT_ACCOUNT_ADDRESS — Session 1 Audit (Execute in Session 2) | — | 2026-04-07 |
| [PLAN_AUDIT_CURRENCY.md](done/PLAN_AUDIT_CURRENCY.md) | PLAN_AUDIT_CURRENCY — Session 1 Audit (Execute in Session 2) | — | 2026-04-06 |
| [PLAN_AUDIT_LEGAL.md](done/PLAN_AUDIT_LEGAL.md) | PLAN_AUDIT_LEGAL — Session 1 Audit (Execute in Session 2) | — | 2026-04-06 |
| [PLAN_AUDIT_LOCAL_OFFICE_SETTINGS.md](done/PLAN_AUDIT_LOCAL_OFFICE_SETTINGS.md) | PLAN_AUDIT_LOCAL_OFFICE_SETTINGS — Session 1 Audit (Execute in Session 2) | — | 2026-04-06 |
| [PLAN_AUDIT_PRICING.md](done/PLAN_AUDIT_PRICING.md) | PLAN: PRICING Page Audit | EXECUTED | 2026-04-06 |
| [PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS.md](done/PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS.md) | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS | READY | 2026-04-06 |
| [PLAN_ALL_PAGES_TEST_COVERAGE_AUDIT_AND_FIX.md](done/PLAN_ALL_PAGES_TEST_COVERAGE_AUDIT_AND_FIX.md) | PLAN: Per-Page Coverage Audit Plans — Remaining Specs | — | 2026-04-03 |
| [PLAN_TEST_DATA_PERFECTION.md](done/PLAN_TEST_DATA_PERFECTION.md) | PLAN: Test Data Perfection (TypeScript Layer) | COMPLETED | 2026-04-03 |
| [PLAN_V2_REQUIREMENTS_GAPS.md](done/PLAN_V2_REQUIREMENTS_GAPS.md) | PLAN: V2 Requirements Gaps — New Fields & Test Coverage | PENDING | 2026-04-03 |
| [PLAN_BUG_HUNTING_RULEBOOK_V1.md](done/PLAN_BUG_HUNTING_RULEBOOK_V1.md) | PLAN: Bug Hunting System — 4-Category Rulebook + All-Agent Line of Defense | — | 2026-04-01 |
| [PLAN_FILLER_TESTS_AND_PIPELINE_RULES.md](done/PLAN_FILLER_TESTS_AND_PIPELINE_RULES.md) | PLAN: Fix Filler Tests + Add Pipeline Rules | — | 2026-04-01 |
| [PLAN_RCA_FULL_RUN_FAILURES.md](done/PLAN_RCA_FULL_RUN_FAILURES.md) | PLAN: RCA — 7 Full-Run Test Failures (2026-03-25) | PENDING | 2026-04-01 |
| [PLAN_P0_LOCAL_OFFICE_DECONTAMINATION.md](done/PLAN_P0_LOCAL_OFFICE_DECONTAMINATION.md) | P0 — PLAN: Decontaminate Local Office Settings from Locations Module | — | 2026-03-25 |
| [PLAN_50_ADMIN_ORCHESTRATION_EDITOR.md](done/PLAN_50_ADMIN_ORCHESTRATION_EDITOR.md) | MASTER PLAN 50: Per-Client Visual Pipeline Orchestration | — | 2026-03-19 |
| [PLAN_52_PER_CLIENT_DYNAMIC_VISUALIZATION.md](done/PLAN_52_PER_CLIENT_DYNAMIC_VISUALIZATION.md) | PLAN 52B: Post-Implementation Audit Fixes | — | 2026-03-19 |
| [PLAN_53A_CHAT_UX_FIX.md](done/PLAN_53A_CHAT_UX_FIX.md) | Plan 53A: Kill Chat-Blocking View States (Critical UX Fix) | — | 2026-03-19 |
| [PLAN_53B_DATA_MODEL.md](done/PLAN_53B_DATA_MODEL.md) | Plan 53B: Page Registry + Stage Tracking Data Model | — | 2026-03-19 |
| [PLAN_53C_DEPENDENCY_ENGINE.md](done/PLAN_53C_DEPENDENCY_ENGINE.md) | Plan 53C: Dependency Engine + Auto-Cascade | — | 2026-03-19 |
| [PLAN_53D_PAGE_APIS.md](done/PLAN_53D_PAGE_APIS.md) | Plan 53D: Page + Artifact API Endpoints | — | 2026-03-19 |
| [PLAN_53E_CLIENT_ONBOARDING.md](done/PLAN_53E_CLIENT_ONBOARDING.md) | Plan 53E: Client Onboarding Setup Flow | — | 2026-03-19 |
| [PLAN_53F_CHAT_AI_INTEGRATION.md](done/PLAN_53F_CHAT_AI_INTEGRATION.md) | Plan 53F: Chat AI Integration — Page & Stage Awareness | — | 2026-03-19 |
| [PLAN_53G_MULTI_RUN_CONTEXT.md](done/PLAN_53G_MULTI_RUN_CONTEXT.md) | Plan 53G: Multi-Run Context Enhancement | — | 2026-03-19 |
| [PLAN_53H_AUTO_PILOT_UX.md](done/PLAN_53H_AUTO_PILOT_UX.md) | Plan 53H: Auto Pilot UX Overhaul | — | 2026-03-19 |
| [PLAN_53I_MANUAL_REVIEW_UX.md](done/PLAN_53I_MANUAL_REVIEW_UX.md) | Plan 53I: Manual Review UX Overhaul | — | 2026-03-19 |
| [PLAN_53J_DASHBOARD_GRID.md](done/PLAN_53J_DASHBOARD_GRID.md) | Plan 53J: Dashboard — Page Status Grid + Real-Time Artifacts | — | 2026-03-19 |
| [PLAN_53K_REQUIREMENTS_GATE.md](done/PLAN_53K_REQUIREMENTS_GATE.md) | Plan 53K: Requirements Permission Gate | — | 2026-03-19 |
| [PLAN_49A_ARTIFACT_DOWNLOAD.md](done/PLAN_49A_ARTIFACT_DOWNLOAD.md) | PLAN 49A: Wire Artifact Download Button | — | 2026-03-18 |
| [PLAN_49B_START_AT_STAGE.md](done/PLAN_49B_START_AT_STAGE.md) | PLAN 49B: Start Pipeline at Specific Stage | — | 2026-03-18 |
| [PLAN_49C_PIPELINE_GRAPH.md](done/PLAN_49C_PIPELINE_GRAPH.md) | PLAN 49C: n8n-Style Visual Pipeline Graph | — | 2026-03-18 |
| [PLAN_49D_AGENT_STREAMING.md](done/PLAN_49D_AGENT_STREAMING.md) | PLAN 49D: Enhanced Agent Streaming (Chat-Like Feel) | — | 2026-03-18 |
| [PLAN_49E_AUDIT_TRIAGE_MODE.md](done/PLAN_49E_AUDIT_TRIAGE_MODE.md) | PLAN 49E: Audit Agent Triage Mode (Mode 5) | — | 2026-03-18 |
| [PLAN_49F_PIPELINE_PAUSE.md](done/PLAN_49F_PIPELINE_PAUSE.md) | PLAN 49F: Pipeline Pause for Triage | — | 2026-03-18 |
| [PLAN_49G_TRIAGE_API.md](done/PLAN_49G_TRIAGE_API.md) | PLAN 49G: Triage API Backend | — | 2026-03-18 |
| [PLAN_49H_TRIAGE_PANEL.md](done/PLAN_49H_TRIAGE_PANEL.md) | PLAN 49H: Triage Panel Frontend | — | 2026-03-18 |
| [PLAN_49I_ARTIFACT_APPROVAL.md](done/PLAN_49I_ARTIFACT_APPROVAL.md) | PLAN 49I: Mid-Pipeline Artifact Approval | — | 2026-03-18 |
| [PLAN_49J_AUTO_MANUAL_TOGGLE.md](done/PLAN_49J_AUTO_MANUAL_TOGGLE.md) | PLAN 49J: Per-Stage Auto/Manual Toggle | — | 2026-03-18 |
| [PLAN_51_PER_CLIENT_AGENT_CHAINS.md](done/PLAN_51_PER_CLIENT_AGENT_CHAINS.md) | PLAN 51: Per-Client Custom Agent Chains | — | 2026-03-18 |
| [PLAN_48H_GENERATOR_ONE_SHOT_SUCCESS.md](done/PLAN_48H_GENERATOR_ONE_SHOT_SUCCESS.md) | PLAN 48H: Generator One-Shot Success (Upstream Quality + Artifact Discovery) | — | 2026-03-17 |
| [PLAN_48L_INTELLIGENT_FAILURE_ROUTING.md](done/PLAN_48L_INTELLIGENT_FAILURE_ROUTING.md) | PLAN 48L: Intelligent Failure Routing | — | 2026-03-17 |
| [PLAN_48M_PRE_SPEC_UI_WALKTHROUGH.md](done/PLAN_48M_PRE_SPEC_UI_WALKTHROUGH.md) | PLAN 48M: Pre-Spec UI Walkthrough & Bug Detection Protocol | — | 2026-03-17 |
| [PLAN_48_AGENT_PIPELINE_OVERHAUL.md](done/PLAN_48_AGENT_PIPELINE_OVERHAUL.md) | PLAN 48: Agent Pipeline Overhaul — Master Plan | — | 2026-03-17 |
| [PLAN_43_PIPELINE_PLUMBING.md](done/PLAN_43_PIPELINE_PLUMBING.md) | PLAN 43 (Corrected): Pipeline Plumbing — Connect the Joints | — | 2026-03-16 |
| [PLAN_44_DRY_RUN_ROLL_CALL.md](done/PLAN_44_DRY_RUN_ROLL_CALL.md) | PLAN 44: Dry Run Roll Call — AUDITED & CORRECTED | — | 2026-03-16 |
| [PLAN_45_WEBSITE_PIPELINE_TRIGGERS.md](done/PLAN_45_WEBSITE_PIPELINE_TRIGGERS.md) | PLAN 45 (Revised & Executed): Website Pipeline Triggers | — | 2026-03-16 |
| [PLAN_46_REALTIME_STREAMING_UI.md](done/PLAN_46_REALTIME_STREAMING_UI.md) | PLAN 46 (AUDITED & CORRECTED): Real-Time Streaming UI + IP Protection | — | 2026-03-16 |
| [PLAN_47_WORKER_LIFECYCLE_CONTROL.md](done/PLAN_47_WORKER_LIFECYCLE_CONTROL.md) | PLAN 47: Worker Lifecycle Control — UI Buttons + Chat Commands | — | 2026-03-16 |
| [PLAN_48A_DIAGNOSTICS_PIPELINE_FIX.md](done/PLAN_48A_DIAGNOSTICS_PIPELINE_FIX.md) | PLAN 48A: Diagnostics Pipeline Fix | — | 2026-03-16 |
| [PLAN_48B_AGENT_MCP_CAPABILITY_FIX.md](done/PLAN_48B_AGENT_MCP_CAPABILITY_FIX.md) | PLAN 48B: Agent MCP & Capability Fix | — | 2026-03-16 |
| [PLAN_48C_ERROR_HANDLING_SAVE_VERIFICATION.md](done/PLAN_48C_ERROR_HANDLING_SAVE_VERIFICATION.md) | PLAN 48C: Error Handling & Save Verification | — | 2026-03-16 |
| [PLAN_48D_TRIAGE_BUG_DETECTION.md](done/PLAN_48D_TRIAGE_BUG_DETECTION.md) | PLAN 48D: Triage Classification & Bug Detection | — | 2026-03-16 |
| [PLAN_48E_PIPELINE_ORCHESTRATION_FIX.md](done/PLAN_48E_PIPELINE_ORCHESTRATION_FIX.md) | PLAN 48E: Pipeline Orchestration Fix | — | 2026-03-16 |
| [PLAN_48F_DASHBOARD_BUG_REPORTING.md](done/PLAN_48F_DASHBOARD_BUG_REPORTING.md) | PLAN 48F: Dashboard Bug Reporting UI | — | 2026-03-16 |
| [PLAN_48G_ESCALATION_ENFORCEMENT.md](done/PLAN_48G_ESCALATION_ENFORCEMENT.md) | PLAN 48G: Cross-Agent Escalation Enforcement | — | 2026-03-16 |
| [PLAN_48I_TEST_CASE_DIVERSITY.md](done/PLAN_48I_TEST_CASE_DIVERSITY.md) | PLAN 48I: Test Case Diversity | — | 2026-03-16 |
| [PLAN_48J_AUTONOMOUS_ORCHESTRATION.md](done/PLAN_48J_AUTONOMOUS_ORCHESTRATION.md) | PLAN 48J: Autonomous Pipeline Orchestration | — | 2026-03-16 |
| [PLAN_48K_WORKER_MCP_BRIDGE.md](done/PLAN_48K_WORKER_MCP_BRIDGE.md) | PLAN 48K: Worker MCP Bridge + Pre-Stage Artifact Validation + Gate Execution | — | 2026-03-16 |
| [PLAN_40_PROD_RELIABILITY.md](done/PLAN_40_PROD_RELIABILITY.md) | PLAN 40 — Production-Grade Reliability & Crash Protection | PENDING | 2026-03-15 |
| [PLAN_41_AI_SUBSCRIPTION_MANAGEMENT.md](done/PLAN_41_AI_SUBSCRIPTION_MANAGEMENT.md) | PLAN 41: AI Subscription Management (Multi-Tenant, Dual-Mode) | — | 2026-03-15 |
| [PLAN_42_DEEP_LABEL_FIX.md](done/PLAN_42_DEEP_LABEL_FIX.md) | PLAN 42 — Fix "Deep" Label Repetition in UI | APPROVED, | 2026-03-15 |
| [PLAN_39_CHATBOT_ROLE_AWARE_CRUD.md](done/PLAN_39_CHATBOT_ROLE_AWARE_CRUD.md) | PLAN 39 — Role-Aware Chatbot: Full CRUD Proxy + CLI Bug Fix | DONE | 2026-03-14 |
| [PLAN_32_SCHEMA_FOUNDATION.md](done/PLAN_32_SCHEMA_FOUNDATION.md) | PLAN_32: Schema Foundation (RUNS FIRST) | PENDING | 2026-03-13 |
| [PLAN_33_FRONTEND_CLEANUP.md](done/PLAN_33_FRONTEND_CLEANUP.md) | PLAN_33: Frontend Cleanup & Navigation Restructure | PENDING | 2026-03-13 |
| [PLAN_34_BACKEND_CLEANUP.md](done/PLAN_34_BACKEND_CLEANUP.md) | PLAN_34: Website Backend Cleanup + Auth Upgrade | PENDING | 2026-03-13 |
| [PLAN_35_REAL_PAGES.md](done/PLAN_35_REAL_PAGES.md) | PLAN_35: DashboardPage + SettingsPage Expansion + Shared Components | PENDING | 2026-03-13 |
| [PLAN_36_CHATPAGE_REWRITE.md](done/PLAN_36_CHATPAGE_REWRITE.md) | PLAN_36: ChatPage Rewrite — Tri-Model + Cards (The Super Weapon) | PENDING | 2026-03-13 |
| [PLAN_37_WORKER_RELIABILITY.md](done/PLAN_37_WORKER_RELIABILITY.md) | PLAN_37: Worker Reliability & Demo Readiness | PENDING | 2026-03-13 |
| [PLAN_38_MULTI_TENANT.md](done/PLAN_38_MULTI_TENANT.md) | PLAN_38: Multi-Tenant Wiring + SSE Proxy | PENDING | 2026-03-13 |
| [PLAN_23_MONOREPO_INTEGRATION.md](done/PLAN_23_MONOREPO_INTEGRATION.md) | PLAN 23: Monorepo Integration — JBS IntelliQE Frontend + Encore Framework Backend | — | 2026-03-12 |
| [PLAN_24_INFRASTRUCTURE.md](done/PLAN_24_INFRASTRUCTURE.md) | PLAN 24: Infrastructure Setup | PENDING | 2026-03-12 |
| [PLAN_25_FOLDER_RESTRUCTURE.md](done/PLAN_25_FOLDER_RESTRUCTURE.md) | PLAN 25: Folder Restructure | PENDING | 2026-03-12 |
| [PLAN_26_CONFIG_FIXES.md](done/PLAN_26_CONFIG_FIXES.md) | PLAN 26: Configuration Fixes (CRITICAL) | PENDING | 2026-03-12 |
| [PLAN_27_DEV_ENVIRONMENT.md](done/PLAN_27_DEV_ENVIRONMENT.md) | PLAN 27: Development Environment | PENDING | 2026-03-12 |
| [PLAN_28_ENCORE_INTEGRATION.md](done/PLAN_28_ENCORE_INTEGRATION.md) | PLAN 28: Encore API Integration (Core) — POST-AUDIT REVISION | PENDING | 2026-03-12 |
| [PLAN_29_PAGE_POLISH.md](done/PLAN_29_PAGE_POLISH.md) | PLAN 29: Page Polish (Deferrable) | DONE | 2026-03-12 |
| [PLAN_30_AGENT_SCHOOL.md](done/PLAN_30_AGENT_SCHOOL.md) | PLAN 30: Agent School — Inter-Agent Communication System | PENDING | 2026-03-12 |
| [PLAN_31_VERIFICATION.md](done/PLAN_31_VERIFICATION.md) | PLAN 31: Verification & Testing | ALL | 2026-03-12 |
| [PLAN_32_SCOPE_REVERT.md](done/PLAN_32_SCOPE_REVERT.md) | PLAN 32: Scope Revert — Production Config & Code Fallback Defaults | PENDING | 2026-03-12 |
| [PLAN_21_DEMO_WEBSITE.md](done/PLAN_21_DEMO_WEBSITE.md) | PLAN_21: API Contract + Frontend Integration Spec | SKIPPED | 2026-03-11 |
| [PLAN_22_URL_MIGRATION.md](done/PLAN_22_URL_MIGRATION.md) | PLAN 22 — Base URL Migration to cloudapps-e2e.encoreglobal.com | DONE | 2026-03-11 |
| [COLLEAGUE_AGENT_PROMPT.md](done/COLLEAGUE_AGENT_PROMPT.md) | Encore Frontend — Complete Agent Build Instructions | — | 2026-03-10 |
| [PLAN_20_UI_INTEGRATION_AGENT_CHAINING.md](done/PLAN_20_UI_INTEGRATION_AGENT_CHAINING.md) | PLAN_20: SaaS Platform — Multi-Tenant Agent Pipeline with UI | PENDING | 2026-03-10 |
| [PLAN_20_SIMPLIFIED_TEAM_BRIEFING.md](done/PLAN_20_SIMPLIFIED_TEAM_BRIEFING.md) | PLAN_20 — Simplified Team Briefing (v3) | — | 2026-03-09 |
| [PIPELINE_FIX_PLAN.md](done/PIPELINE_FIX_PLAN.md) | COMPLETED | — | 2026-03-06 |
| [PLAN_00_INDEX.md](done/PLAN_00_INDEX.md) | Pipeline Overhaul — Master Index | — | 2026-03-06 |
| [PLAN_01_PLANNER_OVERHAUL.md](done/PLAN_01_PLANNER_OVERHAUL.md) | Plan 01: Planner Agent Overhaul | DONE | 2026-03-06 |
| [PLAN_02_GENERATOR_OVERHAUL.md](done/PLAN_02_GENERATOR_OVERHAUL.md) | Plan 02: Generator Agent Overhaul | DONE | 2026-03-06 |
| [PLAN_03_RCA_PROTOCOL.md](done/PLAN_03_RCA_PROTOCOL.md) | Plan 03: Unified RCA Protocol | DONE | 2026-03-06 |
| [PLAN_04_CODE_REUSABILITY.md](done/PLAN_04_CODE_REUSABILITY.md) | Plan 04: Code Reusability Overhaul | DONE | 2026-03-06 |
| [PLAN_05_SHARED_RULES_UPDATE.md](done/PLAN_05_SHARED_RULES_UPDATE.md) | Plan 05: Shared Rules Update | DONE | 2026-03-06 |
| [PLAN_06_EXISTING_FIXES.md](done/PLAN_06_EXISTING_FIXES.md) | Plan 06: Apply Existing Fixes from PIPELINE_FIX_PLAN.md | DONE | 2026-03-06 |
| [PLAN_07_HEALER_OVERHAUL.md](done/PLAN_07_HEALER_OVERHAUL.md) | Plan 07: Healer Agent Overhaul | DONE | 2026-03-06 |
| [PLAN_08_AUDIT_OVERHAUL.md](done/PLAN_08_AUDIT_OVERHAUL.md) | Plan 08: Audit Agent Overhaul | DONE | 2026-03-06 |
| [PLAN_09_STALE_REF_SCRUB.md](done/PLAN_09_STALE_REF_SCRUB.md) | Plan 09: Scrub Stale References in Active Code | PENDING | 2026-03-06 |
| [PLAN_10_REF_PREVENTION.md](done/PLAN_10_REF_PREVENTION.md) | Plan 10: Add Stale Reference Prevention to validate:sync | PENDING | 2026-03-06 |
| [PLAN_14_REPO_CLEANSING.md](done/PLAN_14_REPO_CLEANSING.md) | Plan 14: Repo Cleansing + Mirror Folderization | PENDING | 2026-03-06 |
| [PLAN_15_FRAMEWORK_MAINTAINER_AGENT.md](done/PLAN_15_FRAMEWORK_MAINTAINER_AGENT.md) | Plan 15: Framework Maintainer Agent | PENDING | 2026-03-06 |
| [PLAN_16_AGENT_ORCHESTRATION.md](done/PLAN_16_AGENT_ORCHESTRATION.md) | Plan 16: Agent Orchestration + SaaS Vision | PENDING | 2026-03-06 |
| [PLAN_17_AGENT_AUTONOMY_FOUNDATION.md](done/PLAN_17_AGENT_AUTONOMY_FOUNDATION.md) | Plan 17: Agent Autonomy Foundation — Self-Audit, Communication, Cross-Agent Intelligence | PENDING | 2026-03-06 |
| [PLAN_18_FRAMEWORK_CLEANUP.md](done/PLAN_18_FRAMEWORK_CLEANUP.md) | Plan 18: Framework Cleanup & Compaction | PENDING | 2026-03-06 |
| [PLAN_19_POST_EXECUTION_CLEANUP.md](done/PLAN_19_POST_EXECUTION_CLEANUP.md) | PLAN_19: Post-Execution Cleanup | — | 2026-03-06 |
| [SYSTEMS_AUDIT_RCA.md](done/SYSTEMS_AUDIT_RCA.md) | Encore Framework: Full Systems Audit & RCA | — | 2026-03-06 |

---

## Folder Structure

```
plans/
  INDEX.md              ← this file (auto-generated)
  pending/              ← active plans (95 files)
  done/                 ← completed plans (220 files)
```

When completing a plan:
1. Update `**Status**: DONE` and add `**Executed**: YYYY-MM-DD` in the plan file
2. `git mv plans/pending/X.md plans/done/X.md`
3. Run `npm run plans:reindex` to refresh this file

---

## Session Log (last 30 days, file mtime)

| Date | Folder | File | Status |
|---|---|---|---|
| 2026-05-01 | pending | [PLAN_CLIENT_DELIVERABLE_REBUILD.md](pending/PLAN_CLIENT_DELIVERABLE_REBUILD.md) | PENDING |
| 2026-05-01 | pending | [SUBPLAN_PIPELINE_TSC_HARDEN.md](pending/SUBPLAN_PIPELINE_TSC_HARDEN.md) | PENDING |
| 2026-04-30 | done | [PLAN_FRIDAY_DELIVERABLE_2026-04-29.md](done/PLAN_FRIDAY_DELIVERABLE_2026-04-29.md) | DONE |
| 2026-04-30 | done | [SUBPLAN_EFD_04_DEFERRED_VERIFICATION.md](done/SUBPLAN_EFD_04_DEFERRED_VERIFICATION.md) | DONE |
| 2026-04-29 | pending | [PLAN_DELIVERABLE_QUALITY_UPGRADE.md](pending/PLAN_DELIVERABLE_QUALITY_UPGRADE.md) | PENDING |
| 2026-04-29 | pending | [SUBPLAN_DQU_05E_LOS_LI_DEEP_COVERAGE_AUDIT.md](pending/SUBPLAN_DQU_05E_LOS_LI_DEEP_COVERAGE_AUDIT.md) | PENDING |
| 2026-04-29 | pending | [SUBPLAN_DQU_12_F1a_PRICING_AUDIT.md](pending/SUBPLAN_DQU_12_F1a_PRICING_AUDIT.md) | PENDING |
| 2026-04-29 | pending | [SUBPLAN_DQU_13_F1b_LEGAL_AUDIT.md](pending/SUBPLAN_DQU_13_F1b_LEGAL_AUDIT.md) | PENDING |
| 2026-04-29 | pending | [SUBPLAN_DQU_14_F1c_CURRENCY_AUDIT.md](pending/SUBPLAN_DQU_14_F1c_CURRENCY_AUDIT.md) | PENDING |
| 2026-04-29 | pending | [SUBPLAN_DQU_15_F1d_NOTES_AUDIT.md](pending/SUBPLAN_DQU_15_F1d_NOTES_AUDIT.md) | PENDING |
| 2026-04-29 | pending | [SUBPLAN_DQU_16_F1e_ACCOUNT_ADDRESS_AUDIT.md](pending/SUBPLAN_DQU_16_F1e_ACCOUNT_ADDRESS_AUDIT.md) | PENDING |
| 2026-04-29 | pending | [SUBPLAN_DQU_17_F1f_SHARED_SETUP_AUDIT.md](pending/SUBPLAN_DQU_17_F1f_SHARED_SETUP_AUDIT.md) | PENDING |
| 2026-04-29 | pending | [SUBPLAN_DQU_18_F1g_AUTO_ADDON_AUDIT.md](pending/SUBPLAN_DQU_18_F1g_AUTO_ADDON_AUDIT.md) | PENDING |
| 2026-04-29 | pending | [SUBPLAN_DQU_19_F1h_ECT_STANDALONE_AUDIT.md](pending/SUBPLAN_DQU_19_F1h_ECT_STANDALONE_AUDIT.md) | PENDING |
| 2026-04-29 | pending | [SUBPLAN_DQU_20_F1i_MGMT_HISTORY_AUDIT.md](pending/SUBPLAN_DQU_20_F1i_MGMT_HISTORY_AUDIT.md) | PENDING |
| 2026-04-29 | pending | [_TEMPLATE_SUBPLAN.md](pending/_TEMPLATE_SUBPLAN.md) | TEMPLATE-DRAFT |
| 2026-04-29 | done | [PLAN_53_LOCSET_TESTID_LIVE_VERIFICATION.md](done/PLAN_53_LOCSET_TESTID_LIVE_VERIFICATION.md) | DONE |
| 2026-04-29 | done | [PLAN_INJECTION_CHAIN_HARDENING.md](done/PLAN_INJECTION_CHAIN_HARDENING.md) | DONE |
| 2026-04-29 | done | [SUBPLAN_EFD_01_MODULE_PARALLEL.md](done/SUBPLAN_EFD_01_MODULE_PARALLEL.md) | DONE |
| 2026-04-29 | done | [SUBPLAN_EFD_03_CI_WORKFLOW.md](done/SUBPLAN_EFD_03_CI_WORKFLOW.md) | DONE |
| 2026-04-28 | pending | [SUBPLAN_DQU_08_E3_TAG_ROLLOUT_LOS_LI.md](pending/SUBPLAN_DQU_08_E3_TAG_ROLLOUT_LOS_LI.md) | PENDING |
| 2026-04-28 | pending | [SUBPLAN_HISTORY_01_MCP_FINDINGS.md](pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md) | DELIVERABLE |
| 2026-04-28 | done | [PLAN_FIND_BUGS_LI_FOLLOWUP.md](done/PLAN_FIND_BUGS_LI_FOLLOWUP.md) | DONE |
| 2026-04-28 | done | [PLAN_REMOVE_VAULT.md](done/PLAN_REMOVE_VAULT.md) | — |
| 2026-04-28 | done | [SUBPLAN_DQU_05D_LI_NEW_BUG_FIXES.md](done/SUBPLAN_DQU_05D_LI_NEW_BUG_FIXES.md) | DONE |
| 2026-04-28 | done | [SUBPLAN_EFD_02_MFA_LESS_CONTRACT.md](done/SUBPLAN_EFD_02_MFA_LESS_CONTRACT.md) | DONE |
| 2026-04-27 | pending | [SUBPLAN_DQU_05C_LR_046_HOOK_AUTHORING.md](pending/SUBPLAN_DQU_05C_LR_046_HOOK_AUTHORING.md) | PENDING |
| 2026-04-27 | pending | [SUBPLAN_DQU_21_G1_LEFTOVER_STATE_AUDIT.md](pending/SUBPLAN_DQU_21_G1_LEFTOVER_STATE_AUDIT.md) | PENDING |
| 2026-04-27 | done | [PLAN_AUDIT_COPILOT.md](done/PLAN_AUDIT_COPILOT.md) | SUPERSEDED |
| 2026-04-27 | done | [PLAN_BUG_ARCHETYPE_CATALOG.md](done/PLAN_BUG_ARCHETYPE_CATALOG.md) | DONE |
| 2026-04-27 | done | [PLAN_CC_ANTHROPIC_ALIGNMENT.md](done/PLAN_CC_ANTHROPIC_ALIGNMENT.md) | DONE |
| 2026-04-27 | done | [PLAN_CLAUDE_SETUP_AUDIT_REMEDIATION.md](done/PLAN_CLAUDE_SETUP_AUDIT_REMEDIATION.md) | SUPERSEDED |
| 2026-04-27 | done | [PLAN_FRAMEWORK_AUDIT_EVIDENCE_EMISSION.md](done/PLAN_FRAMEWORK_AUDIT_EVIDENCE_EMISSION.md) | SUPERSEDED |
| 2026-04-27 | done | [PLAN_MULTI_TENANT_RESTRUCTURE.md](done/PLAN_MULTI_TENANT_RESTRUCTURE.md) | DONE |
| 2026-04-27 | done | [SUBPLAN_AAE_06_PARALLEL_ROLLOUT.md](done/SUBPLAN_AAE_06_PARALLEL_ROLLOUT.md) | CANCELLED |
| 2026-04-27 | done | [SUBPLAN_CCE_00_AUDIT_BOUNDARY_HARDENING.md](done/SUBPLAN_CCE_00_AUDIT_BOUNDARY_HARDENING.md) | DONE |
| 2026-04-27 | done | [SUBPLAN_CCE_01_FOUNDATION_CLEANUP.md](done/SUBPLAN_CCE_01_FOUNDATION_CLEANUP.md) | DONE |
| 2026-04-27 | done | [SUBPLAN_CCE_02B_TODO_INJECTION_ENFORCEMENT.md](done/SUBPLAN_CCE_02B_TODO_INJECTION_ENFORCEMENT.md) | DONE |
| 2026-04-27 | done | [SUBPLAN_CCE_02_CLAUDEMD_RIGHTSIZE.md](done/SUBPLAN_CCE_02_CLAUDEMD_RIGHTSIZE.md) | DONE |
| 2026-04-27 | done | [SUBPLAN_CCE_03_SKILL_RATIONALIZATION.md](done/SUBPLAN_CCE_03_SKILL_RATIONALIZATION.md) | DONE |
