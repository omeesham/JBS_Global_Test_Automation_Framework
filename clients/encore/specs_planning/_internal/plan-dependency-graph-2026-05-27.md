# Plan Dependency Graph — 2026-05-27

Edges in CSV-mentioning plans that point at other plans.
Use this view to confirm no Depends-on / Blocks / Parent
references resolve to a now-superseded CSV-era plan.

| Plan | Edge kind | Target | Target also CSV-mentioning? |
|---|---|---|---|
| `PLAN_AGENT_AUTHORING_EFFICIENCY.md` | Parent | (root — system-level mega plan) | no |
| `PLAN_AGENT_AUTHORING_EFFICIENCY.md` | Depends on | SP-DQU-02 (done — neutral-eye findings file proves the artifact format works for one module) | no |
| `PLAN_AGENT_AUTHORING_EFFICIENCY.md` | Blocks | SP-DQU-03 + every SP-DQU-04..21 (LOS fixes onward consume the new gate; 9 remaining modules ride the new rails) | no |
| `PLAN_BIG_PIVOT_FCC_MASTER.md` | Depends on | none | no |
| `PLAN_BIG_PIVOT_FCC_MASTER.md` | Blocks | per-module FCC subplans (named in §Roadmap below) | no |
| `PLAN_BIG_PIVOT_FCC_MASTER.md` | Parent | PLAN_BIG_PIVOT_FCC_MASTER.md` (per LR-048 schema — singular key). Reference false-green doctrine in prose as `co-doctrine: §False-Green Sweep Doctrine (this file)`, NOT as a second parent. | yes |
| `PLAN_BIG_PIVOT_FCC_MASTER.md` | Depends on | `; CLEANUP closes first; both must close before module is shipped. | no |
| `PLAN_BIG_PIVOT_FCC_MASTER.md` | Parent | PLAN_BIG_PIVOT_FCC_MASTER.md` may return zero pending siblings — this would normally trigger LR-027's parent-cascade clause and auto-close the master. | yes |
| `PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md` | Parent | PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md` or that lists this plan as their parent in body. This plan has no subplans (its work was inlined as Phase 0/A/A.5/B/C/D — no child subplans were spawned), so the cascade is a no-op. | yes |
| `PLAN_DELIVERABLE_QUALITY_UPGRADE.md` | Parent | (root — mega plan) | no |
| `PLAN_DELIVERABLE_QUALITY_UPGRADE.md` | Depends on | none | no |
| `PLAN_DELIVERABLE_QUALITY_UPGRADE.md` | Blocks | HIST column-first pivot (all 31 SUBPLAN_HIST_PIVOT_* subplans paused until this plan closes) | no |
| `PLAN_LM_HISTORY_COVERAGE.md` | Parent | `plans/pending/PLAN_DQU_COVERAGE_REMEDIATION.md` | no |
| `PLAN_LM_HISTORY_COVERAGE.md` | Depends on | column-root catalogs (Local Office, ECT, Currency, Pricing, Notes col 69 done; Local Info, Account, Legal, Shared Setup, Auto-Addon, Top-Level pending — filled inline by Phase 1b per parent §6) | no |
| `PLAN_LM_HISTORY_COVERAGE.md` | Blocks | parent plan flip to `done/` (one of 14 child plans per parent §7 parent-persistence rule) | no |
| `PLAN_MASTER_REPO_CLEANUP.md` | Parent | none (master) | no |
| `PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS.md` | Depends on | `clients/encore/test_cases_csv/bugs-for-encore-qa-2026-05-11.csv` (Cat 3 CSV — already written this session) | no |
| `PLAN_TEST_DATA_CSV_CONVERSION.md` | Depends on | PLAN_TEST_DATA_PERFECTION (all TS data must be perfected first) | no |
| `PLAN_TEST_DATA_CSV_CONVERSION.md` | Blocks | None | no |
| `PLAN_VERTICAL_RESTRUCTURE_PENDING.md` | Depends on | none (no Encore confirmation needed; index/plan-shape changes only) | no |
| `PLAN_VERTICAL_RESTRUCTURE_PENDING.md` | Blocks | per-submodule execution cadence (cycles run via existing subplans once Plan A finalises the queue) and `PLAN_VERTICAL_DELIVERY_SOX.md`'s push cycle | no |
| `SUBPLAN_DQU_05E_LOS_LI_DEEP_COVERAGE_AUDIT.md` | Parent | PLAN_DELIVERABLE_QUALITY_UPGRADE.md | yes |
| `SUBPLAN_DQU_05E_LOS_LI_DEEP_COVERAGE_AUDIT.md` | Depends on | SP-DQU-03 (LOS fixes DONE), SP-DQU-05 (LI fixes DONE), LR-045 row 4 amendment (DONE 2026-04-29) | no |
| `SUBPLAN_DQU_05E_LOS_LI_DEEP_COVERAGE_AUDIT.md` | Blocks | HIST column-first pivot — any HIST subplan touching LOS or LI specs (SUBPLAN_HIST_PIVOT_20_C1_LO_BASIC_INFO_TESTS, SUBPLAN_HIST_PIVOT_24/25 LI tests, etc.) | no |
| `SUBPLAN_DQU_05E_LOS_LI_DEEP_COVERAGE_AUDIT.md` | Parent | PLAN_DELIVERABLE_QUALITY_UPGRADE.md`. If zero → close parent PLAN. Otherwise → leave open. | yes |
| `SUBPLAN_DQU_08_E3_TAG_ROLLOUT_LOS_LI.md` | Parent | PLAN_DELIVERABLE_QUALITY_UPGRADE.md | yes |
| `SUBPLAN_DQU_08_E3_TAG_ROLLOUT_LOS_LI.md` | Depends on | SP-DQU-03 (LOS fixes), SP-DQU-05 (LI fixes), SP-DQU-05D (LI new-bug fixes — BUG-LI-003 + 6 ARCH drift items + ~30 NEGATIVE TCs; MUST land before tag rollout per PLAN_FIND_BUGS_LI_FOLLOWUP Fork A reroute 2026-04-28), SP-DQU-06 (converter ready), SP-DQU-07 (rules doc live) | no |
| `SUBPLAN_DQU_08_E3_TAG_ROLLOUT_LOS_LI.md` | Blocks | SP-DQU-34 (client handoff — CSVs must be tagged before shipping) | no |
| `SUBPLAN_DQU_10_E_QA_BEST_PRACTICES_BENCHMARK.md` | Parent | PLAN_DELIVERABLE_QUALITY_UPGRADE.md | yes |
| `SUBPLAN_DQU_10_E_QA_BEST_PRACTICES_BENCHMARK.md` | Depends on | SP-DQU-01 | no |
| `SUBPLAN_DQU_10_E_QA_BEST_PRACTICES_BENCHMARK.md` | Blocks | none (feeds recommendations to downstream subplans) | no |
| `SUBPLAN_DQU_12_F1a_PRICING_AUDIT.md` | Parent | PLAN_DELIVERABLE_QUALITY_UPGRADE.md | yes |
| `SUBPLAN_DQU_12_F1a_PRICING_AUDIT.md` | Depends on | SP-AAE-01, SP-AAE-02, SP-AAE-03, SP-AAE-04, SP-AAE-05, SP-DQU-03, SP-DQU-04, SP-DQU-05 | no |
| `SUBPLAN_DQU_13_F1b_LEGAL_AUDIT.md` | Parent | PLAN_DELIVERABLE_QUALITY_UPGRADE.md | yes |
| `SUBPLAN_DQU_13_F1b_LEGAL_AUDIT.md` | Depends on | SP-AAE-01, SP-AAE-02, SP-AAE-03, SP-AAE-04, SP-AAE-05, SP-DQU-03, SP-DQU-04, SP-DQU-05 | no |
| `SUBPLAN_DQU_14_F1c_CURRENCY_AUDIT.md` | Parent | PLAN_DELIVERABLE_QUALITY_UPGRADE.md | yes |
| `SUBPLAN_DQU_14_F1c_CURRENCY_AUDIT.md` | Depends on | SP-AAE-01, SP-AAE-02, SP-AAE-03, SP-AAE-04, SP-AAE-05, SP-DQU-03, SP-DQU-04, SP-DQU-05 | no |
| `SUBPLAN_DQU_16_F1e_ACCOUNT_ADDRESS_AUDIT.md` | Parent | PLAN_DELIVERABLE_QUALITY_UPGRADE.md | yes |
| `SUBPLAN_DQU_16_F1e_ACCOUNT_ADDRESS_AUDIT.md` | Depends on | SP-AAE-01, SP-AAE-02, SP-AAE-03, SP-AAE-04, SP-AAE-05, SP-DQU-03, SP-DQU-04, SP-DQU-05 | no |
| `SUBPLAN_DQU_18_F1g_AUTO_ADDON_AUDIT.md` | Parent | PLAN_DELIVERABLE_QUALITY_UPGRADE.md | yes |
| `SUBPLAN_DQU_18_F1g_AUTO_ADDON_AUDIT.md` | Depends on | SP-AAE-01, SP-AAE-02, SP-AAE-03, SP-AAE-04, SP-AAE-05, SP-DQU-03, SP-DQU-04, SP-DQU-05 | no |
| `SUBPLAN_DQU_19_F1h_ECT_STANDALONE_AUDIT.md` | Parent | PLAN_DELIVERABLE_QUALITY_UPGRADE.md | yes |
| `SUBPLAN_DQU_19_F1h_ECT_STANDALONE_AUDIT.md` | Depends on | SP-AAE-01, SP-AAE-02, SP-AAE-03, SP-AAE-04, SP-AAE-05, SP-DQU-03, SP-DQU-04, SP-DQU-05 | no |
| `SUBPLAN_DQU_26_H1_SCOPE_DEFINITION.md` | Parent | PLAN_DELIVERABLE_QUALITY_UPGRADE.md | yes |
| `SUBPLAN_DQU_26_H1_SCOPE_DEFINITION.md` | Depends on | SP-DQU-01 | no |
| `SUBPLAN_DQU_26_H1_SCOPE_DEFINITION.md` | Blocks | SP-DQU-27 (simplify sweep), SP-DQU-28 (cleanup sweep) | no |
| `SUBPLAN_DQU_29_I1_IDENTITY_RIPPLE_SYNC.md` | Parent | PLAN_DELIVERABLE_QUALITY_UPGRADE.md | yes |
| `SUBPLAN_DQU_29_I1_IDENTITY_RIPPLE_SYNC.md` | Depends on | SP-DQU-08 (CSVs tagged), SP-DQU-25 (specs clean), SP-DQU-09 (REQUIREMENTS.md trusted) | no |
| `SUBPLAN_DQU_29_I1_IDENTITY_RIPPLE_SYNC.md` | Blocks | SP-DQU-34 (handoff package should reflect re-synced state) | no |
| `SUBPLAN_DQU_33_K2_NEXTWEEK_SKILL.md` | Parent | PLAN_DELIVERABLE_QUALITY_UPGRADE.md | yes |
| `SUBPLAN_DQU_33_K2_NEXTWEEK_SKILL.md` | Depends on | SP-DQU-01 | no |
| `SUBPLAN_DQU_33_K2_NEXTWEEK_SKILL.md` | Blocks | none | no |
| `SUBPLAN_DQU_34_L1_CLIENT_HANDOFF_PACKAGE.md` | Parent | PLAN_DELIVERABLE_QUALITY_UPGRADE.md | yes |
| `SUBPLAN_DQU_34_L1_CLIENT_HANDOFF_PACKAGE.md` | Depends on | SP-DQU-08 (CSVs tagged), SP-DQU-30 (Allure), SP-DQU-31 (bug reports package), SP-DQU-29 (identity ripple sync) | no |
| `SUBPLAN_DQU_34_L1_CLIENT_HANDOFF_PACKAGE.md` | Blocks | SP-DQU-35 (exit audit) | no |
| `SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT.md` | Parent | PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md | yes |
| `SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT.md` | Depends on | PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md (Phase 0 + Phases A+B complete — MD prereqs + workbook reader cutover), SUBPLAN_PARITY_W1_03_LOCAL_OFFICE_CODE_SPLIT.md, SUBPLAN_PARITY_W1_01_DECISIONS_AND_DRIFT_PRETRIAGE.md | yes |
| `SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT.md` | Blocks | SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md (consumes W1-04 state) | yes |
| `SUBPLAN_PARITY_W1_05_CI_LOCAL_VALIDATORS.md` | Parent | PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md | yes |
| `SUBPLAN_PARITY_W1_05_CI_LOCAL_VALIDATORS.md` | Depends on | PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md (Phase D — full XLSX cutover complete, CSVs deleted) | yes |
| `SUBPLAN_PARITY_W1_05_CI_LOCAL_VALIDATORS.md` | Blocks | SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md (consumes the validators) | yes |
| `SUBPLAN_PARITY_W2_06_SHADY_PASS_LIVE_AUDIT.md` | Parent | PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md | yes |
| `SUBPLAN_PARITY_W2_06_SHADY_PASS_LIVE_AUDIT.md` | Depends on | ALL OF WAVE 1 — SUBPLAN_PARITY_W1_01, W1_03, W1_04, W1_05 (W1-02 closed-as-superseded by PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION; Wave 0 XLSX migration must also be GREEN before live audit) | no |
| `SUBPLAN_PARITY_W2_06_SHADY_PASS_LIVE_AUDIT.md` | Blocks | SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md | yes |
| `SUBPLAN_PARITY_W2_07_FIELD_INVENTORIES_NEUTRAL_EYE.md` | Parent | PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md | yes |
| `SUBPLAN_PARITY_W2_07_FIELD_INVENTORIES_NEUTRAL_EYE.md` | Depends on | ALL OF WAVE 1 — W1-01, W1-03, W1-04, W1-05 (W1-02 closed-as-superseded by PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION; Wave 0 XLSX migration must also be GREEN before live walks) | yes |
| `SUBPLAN_PARITY_W2_07_FIELD_INVENTORIES_NEUTRAL_EYE.md` | Blocks | SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md | yes |
| `SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md` | Parent | PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md | yes |
| `SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md` | Depends on | SUBPLAN_PARITY_W2_06_SHADY_PASS_LIVE_AUDIT.md, SUBPLAN_PARITY_W2_07_FIELD_INVENTORIES_NEUTRAL_EYE.md | yes |
| `SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md` | Blocks | SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md | yes |
| `SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md` | Parent | PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md | yes |
| `SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md` | Depends on | ALL previous — W1-01..05 + W2-06, W2-07, W2-08 | no |
| `SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md` | Blocks | none (last subplan — closes parent plan) | no |
| `SUBPLAN_REPO_04_DUPLICATE_JUNK_PURGE.md` | Parent | MASTER_REPO_CLEANUP | no |
