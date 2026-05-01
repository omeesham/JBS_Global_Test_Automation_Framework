#!/usr/bin/env node
/**
 * priority-sweep.mjs — One-shot metadata sweep for plans/pending/*.md
 *
 * Updates `**Priority**:` field on each plan per the vision mapping
 * (P0-CYCLE-1 | P1-CYCLE-2 | P2-CYCLE-3 | P5-PARKED) and
 * normalizes DQU subplan `**Parent**:` field from markdown-link to bare filename.
 *
 * Run once, then `npm run plans:reindex`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PENDING_DIR = path.resolve(__dirname, '..', 'plans', 'pending');

const P0 = new Set([
  'PLAN_AGENT_AUTHORING_EFFICIENCY.md',
  'PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md',
  'PLAN_DELIVERABLE_QUALITY_UPGRADE.md',
  'PLAN_HIST_COMMIT_HISTORY_WORK.md',
  'SUBPLAN_AAE_04_CONSUMERS_NO_REWALK.md',
  'SUBPLAN_AAE_05_HEURISTIC_STALENESS.md',
  'SUBPLAN_AAE_06_PARALLEL_ROLLOUT.md',
  'SUBPLAN_DQU_03_C1_LOS_FIXES_AND_REEXPORT.md',
  'SUBPLAN_DQU_04_B2_LI_NEUTRAL_EYE_AUDIT.md',
  'SUBPLAN_DQU_05_C2_LI_FIXES_AND_REEXPORT.md',
  'SUBPLAN_DQU_07_E2_RULES_DOC_UPDATE.md',
  'SUBPLAN_DQU_08_E3_TAG_ROLLOUT_LOS_LI.md',
  'SUBPLAN_DQU_09_D1_REQS_SAMPLING_VERIFICATION.md',
  'SUBPLAN_DQU_12_F1a_PRICING_AUDIT.md',
  'SUBPLAN_DQU_13_F1b_LEGAL_AUDIT.md',
  'SUBPLAN_DQU_14_F1c_CURRENCY_AUDIT.md',
  'SUBPLAN_DQU_15_F1d_NOTES_AUDIT.md',
  'SUBPLAN_DQU_16_F1e_ACCOUNT_ADDRESS_AUDIT.md',
  'SUBPLAN_DQU_17_F1f_SHARED_SETUP_AUDIT.md',
  'SUBPLAN_DQU_18_F1g_AUTO_ADDON_AUDIT.md',
  'SUBPLAN_DQU_19_F1h_ECT_STANDALONE_AUDIT.md',
  'SUBPLAN_DQU_20_F1i_MGMT_HISTORY_AUDIT.md',
  'SUBPLAN_DQU_21_G1_LEFTOVER_STATE_AUDIT.md',
  'SUBPLAN_DQU_22_G2_PRE_TEST_SLATE_CLEAR.md',
  'SUBPLAN_DQU_23_G3_POST_TEST_SLATE_CLEAR.md',
  'SUBPLAN_DQU_24_G4_SLATE_CLEAR_ROLLOUT.md',
  'SUBPLAN_DQU_25_G5_FULL_SUITE_RCA.md',
  'SUBPLAN_DQU_30_J1_ALLURE_DELIVERABLE.md',
  'SUBPLAN_DQU_31_J2_BUG_REPORTS_PACKAGING.md',
  'SUBPLAN_DQU_34_L1_CLIENT_HANDOFF_PACKAGE.md',
  'SUBPLAN_DQU_35_L2_EXIT_AUDIT.md',
]);

const P1 = new Set([
  'PLAN_HIST_COLUMN_FIRST_PIVOT.md',
  'PLAN_MASTER_REPO_CLEANUP.md',
  'PLAN_MULTI_TENANT_RESTRUCTURE.md',
  'SUBPLAN_DQU_26_H1_SCOPE_DEFINITION.md',
  'SUBPLAN_DQU_27_H2_SIMPLIFY_SWEEP.md',
  'SUBPLAN_DQU_28_H3_CLEANUP_SWEEP.md',
  'SUBPLAN_DQU_29_I1_IDENTITY_RIPPLE_SYNC.md',
  // all HIST pivot subplans 10-40
  ...Array.from({ length: 31 }, (_, i) => {
    const n = i + 10;
    // This is a placeholder — actual names read from filesystem below
    return null;
  }).filter(Boolean),
  // all REPO subplans
  'SUBPLAN_REPO_02_CLAUDE_COPILOT_CONSOLIDATION.md',
  'SUBPLAN_REPO_03_AGENT_FILE_RESTRUCTURE.md',
  'SUBPLAN_REPO_04_DUPLICATE_JUNK_PURGE.md',
  'SUBPLAN_REPO_05_DEAD_CODE_REUSABILITY.md',
  'SUBPLAN_REPO_06_DOC_MD_SLOP_AUDIT.md',
  'SUBPLAN_REPO_07_SLOP_PREVENTION.md',
  'SUBPLAN_REPO_10_SOURCE_CODE_QUALITY.md',
  'SUBPLAN_REPO_11_SCRIPTS_CONFIG_AUDIT.md',
  'SUBPLAN_REPO_12_TEST_INFRASTRUCTURE_AUDIT.md',
  'SUBPLAN_REPO_13_COPILOT_ACCOUNTABILITY.md',
]);

const P2 = new Set([
  'PLAN_CHAT_UI_BUGS.md',
  'PLAN_PLANS_INDEX_AUTOREGEN.md',
  'PLAN_ACTIVITY_LOG_TIMESTAMP_GATE.md',
  'PLAN_PLAYWRIGHT_CLI_ADOPTION.md',
  'PLAN_VISUAL_DEBUG_SKILL.md',
  'PLAN_CODEBASE_CLEANUP.md',
  'PLAN_FULL_CHAIN_AUDIT.md',
  'PLAN_AUDIT_COPILOT.md',
  'PLAN_BUG_HUNTING_RULEBOOK_V2.md',
  'PLAN_HEALER_INSPECTOR_QA_REPORT_V1.1.md',
  'PLAN_MAINTAINER_SWEEP.md',
  'PLAN_TEST_DATA_CSV_CONVERSION.md',
  'PLAN_GENERATOR_AUDIT_AUTO_ADDON.md',
  'PLAN_PRICING_TEST_COVERAGE_AUDIT_AND_FIX.md',
  'SUBPLAN_HISTORY_01_MCP_FINDINGS.md',
  'SUBPLAN_REPO_08_RENAME_JBS.md',
  'godsplan.md',
  'SUBPLAN_DQU_10_E_QA_BEST_PRACTICES_BENCHMARK.md',
  'SUBPLAN_DQU_11_F1_REMAINING_MODULES_PLANNER.md',
  'SUBPLAN_DQU_32_K1_TODAY_SKILL.md',
]);

const P5 = new Set([
  'PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md',
  'SUBPLAN_DQU_33_K2_NEXTWEEK_SKILL.md',
]);

// Auto-include all HIST_PIVOT_NN files in P1
const allFiles = fs.readdirSync(PENDING_DIR).filter(f => f.endsWith('.md'));
for (const f of allFiles) {
  if (f.startsWith('SUBPLAN_HIST_PIVOT_')) P1.add(f);
}

function classify(filename) {
  if (P0.has(filename)) return 'P0-CYCLE-1';
  if (P1.has(filename)) return 'P1-CYCLE-2';
  if (P2.has(filename)) return 'P2-CYCLE-3';
  if (P5.has(filename)) return 'P5-PARKED';
  return null;
}

function updatePriority(content, newPriority) {
  // Match **Priority**: <anything until end of line>
  const re = /^(\s*\*\*Priority\*\*\s*:\s*)(.+)$/m;
  if (re.test(content)) {
    return content.replace(re, `$1${newPriority}`);
  }
  // If no Priority field exists, inject after the first metadata block (after first `**Status**` line)
  const statusRe = /^(\s*\*\*Status\*\*\s*:\s*[^\n]+)$/m;
  if (statusRe.test(content)) {
    return content.replace(statusRe, `$1\n**Priority**: ${newPriority}`);
  }
  return content; // don't know where to put it — skip
}

function fixParentFormat(content) {
  // Match **Parent**: [FILENAME.md](../pending/FILENAME.md) → **Parent**: FILENAME.md
  const re = /^(\s*\*\*Parent\*\*\s*:\s*)\[([^\]]+\.md)\]\([^)]+\)(\s*)$/m;
  return content.replace(re, '$1$2$3');
}

const results = { P0: 0, P1: 0, P2: 0, P5: 0, skipped: [], parentFixed: 0 };

for (const f of allFiles) {
  const fpath = path.join(PENDING_DIR, f);
  const original = fs.readFileSync(fpath, 'utf8');
  const pri = classify(f);

  let next = original;
  if (pri) {
    next = updatePriority(next, pri);
    results[pri.split('-')[0]]++;
  } else {
    results.skipped.push(f);
  }

  // Parent format fix for DQU subplans (applies regardless of priority)
  const withParentFix = fixParentFormat(next);
  if (withParentFix !== next) {
    results.parentFixed++;
    next = withParentFix;
  }

  if (next !== original) {
    fs.writeFileSync(fpath, next, 'utf8');
  }
}

console.log(JSON.stringify(results, null, 2));
