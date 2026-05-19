#!/usr/bin/env node
// One-off disposition pass per PLAN_DQU_COVERAGE_REMEDIATION v5 step 2.5.
// Mutates 32 HIST plans in plans/pending/ (Status + successor field + neutralize SESSION BOOTSTRAP)
// AND 16 HIST plans in plans/done/ (Patch 8 — neutralize SESSION BOOTSTRAP only).
// Caller then runs `git mv` for the 32 pending files separately.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(process.cwd());

// Disposition table per PLAN_DQU_COVERAGE_REMEDIATION §10 (32 rows).
const PENDING_DISPOSITIONS = [
  ["PLAN_HIST_COLUMN_FIRST_PIVOT.md", "ARCHIVED-REFERENCE", "Archived for", "Sections 1-3 rationale + KEEP list (consumer: PLAN_DQU_COVERAGE_REMEDIATION v5); 40-subplan execution table no longer authoritative"],
  ["PLAN_HIST_COMMIT_HISTORY_WORK.md", "ARCHIVED-REFERENCE", "Archived for", "Stale WIP/admin; historical context only; no active consumer"],
  ["PLAN_PILOT_SHARED_TESTS.md", "SUPERSEDED", "Superseded by", "PLAN_SHARED_SETUP_DQU.md (Track A pilot #1) + PLAN_LM_HISTORY_COVERAGE.md (col-69 + Shared-Setup-rooted cols); forbidden location-hist-shared-setup.spec.ts NOT salvaged as file"],
  ["SUBPLAN_HISTORY_01_MCP_FINDINGS.md", "ARCHIVED-REFERENCE", "Archived for", "LR-036 boolean-render evidence (Unicode vs SVG); consumer: PLAN_LM_HISTORY_COVERAGE + PLAN_LO_HISTORY_COVERAGE Phase 5 page-object work"],
  ["SUBPLAN_HIST_PIVOT_10_B_LM_3a_LOCAL_INFO_PART_A.md", "FOLDED", "Folded into", "PLAN_LM_HISTORY_COVERAGE Phase 1b discovery (Local Info Part A catalog rows)"],
  ["SUBPLAN_HIST_PIVOT_11_B_LM_3b_LOCAL_INFO_PART_B.md", "FOLDED", "Folded into", "PLAN_LM_HISTORY_COVERAGE Phase 1b discovery (Local Info Part B catalog rows)"],
  ["SUBPLAN_HIST_PIVOT_12_B_LM_4_ACCOUNT_ADDRESS_CATALOG.md", "FOLDED", "Folded into", "PLAN_LM_HISTORY_COVERAGE Phase 1b discovery (Account & Address catalog rows)"],
  ["SUBPLAN_HIST_PIVOT_13_B_LM_5_LEGAL_CATALOG.md", "FOLDED", "Folded into", "PLAN_LM_HISTORY_COVERAGE Phase 1b discovery (Legal catalog rows)"],
  ["SUBPLAN_HIST_PIVOT_16_B_LM_8_AUTO_ADDON_CATALOG.md", "FOLDED", "Folded into", "PLAN_LM_HISTORY_COVERAGE Phase 1b discovery (Auto Add-On catalog rows)"],
  ["SUBPLAN_HIST_PIVOT_17_B_LM_9_TOP_LEVEL_CATALOG.md", "FOLDED", "Folded into", "PLAN_LM_HISTORY_COVERAGE Phase 1b discovery (Top-Level catalog rows)"],
  ["SUBPLAN_HIST_PIVOT_18_B_LM_R_RECONCILE.md", "FOLDED", "Folded into", "PLAN_LM_HISTORY_COVERAGE Phase 2 diff (LM reconcile)"],
  ["SUBPLAN_HIST_PIVOT_19_D0_SHARED_UTILS.md", "FOLDED", "Folded into", "PLAN_LM_HISTORY_COVERAGE + PLAN_LO_HISTORY_COVERAGE Phase 5 (shared utility code)"],
  ["SUBPLAN_HIST_PIVOT_20_C1_LO_BASIC_INFO_TESTS.md", "FOLDED", "Folded into", "PLAN_LO_HISTORY_COVERAGE (Basic Info column tests)"],
  ["SUBPLAN_HIST_PIVOT_21_C2_LO_ECT_TESTS.md", "FOLDED", "Folded into", "PLAN_LO_HISTORY_COVERAGE (ECT column tests)"],
  ["SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md", "SUPERSEDED", "Superseded by", "PLAN_LM_HISTORY_COVERAGE; creates forbidden location-hist-currency.spec.ts — NOT salvaged as file"],
  ["SUBPLAN_HIST_PIVOT_23_D2_LM_PRICING_TESTS.md", "SUPERSEDED", "Superseded by", "PLAN_LM_HISTORY_COVERAGE (Pricing column tests)"],
  ["SUBPLAN_HIST_PIVOT_24_D3a_LM_LOCAL_INFO_PART_A_TESTS.md", "SUPERSEDED", "Superseded by", "PLAN_LM_HISTORY_COVERAGE (Local Info Part A column tests)"],
  ["SUBPLAN_HIST_PIVOT_25_D3b_LM_LOCAL_INFO_PART_B_TESTS.md", "SUPERSEDED", "Superseded by", "PLAN_LM_HISTORY_COVERAGE (Local Info Part B column tests)"],
  ["SUBPLAN_HIST_PIVOT_26_D4_LM_ACCOUNT_ADDRESS_TESTS.md", "SUPERSEDED", "Superseded by", "PLAN_LM_HISTORY_COVERAGE (Account & Address column tests)"],
  ["SUBPLAN_HIST_PIVOT_27_D5_LM_LEGAL_TESTS.md", "SUPERSEDED", "Superseded by", "PLAN_LM_HISTORY_COVERAGE (Legal column tests)"],
  ["SUBPLAN_HIST_PIVOT_30_D8_LM_AUTO_ADDON_TESTS.md", "SUPERSEDED", "Superseded by", "PLAN_LM_HISTORY_COVERAGE (Auto Add-On column tests)"],
  ["SUBPLAN_HIST_PIVOT_31_D9_LM_TOP_LEVEL_TESTS.md", "SUPERSEDED", "Superseded by", "PLAN_LM_HISTORY_COVERAGE (Top-Level column tests)"],
  ["SUBPLAN_HIST_PIVOT_32_D10_LM_ORPHANS_TESTS.md", "SUPERSEDED", "Superseded by", "PLAN_LM_HISTORY_COVERAGE (LM orphans column tests)"],
  ["SUBPLAN_HIST_PIVOT_33_F1_ANOMALY_WRITER.md", "FOLDED", "Folded into", "PLAN_LM_HISTORY_COVERAGE + PLAN_LO_HISTORY_COVERAGE Phase 7 (anomaly writer infrastructure)"],
  ["SUBPLAN_HIST_PIVOT_34_F2_AUTO_FILER.md", "FOLDED", "Folded into", "PLAN_LM_HISTORY_COVERAGE + PLAN_LO_HISTORY_COVERAGE Phase 7 (auto-filer infrastructure)"],
  ["SUBPLAN_HIST_PIVOT_35_E_LO_BUGS.md", "FOLDED", "Folded into", "PLAN_LO_HISTORY_COVERAGE Phase 7 closure (LO bug triage)"],
  ["SUBPLAN_HIST_PIVOT_36_E_LM_CUR_BUGS.md", "FOLDED", "Folded into", "PLAN_LM_HISTORY_COVERAGE Phase 7 (LM Currency bug triage)"],
  ["SUBPLAN_HIST_PIVOT_37_E_LM_OTHER_BUGS.md", "FOLDED", "Folded into", "PLAN_LM_HISTORY_COVERAGE Phase 7 (LM other-column bug triage)"],
  ["SUBPLAN_HIST_PIVOT_38_J_FINAL_AUDIT.md", "SUPERSEDED", "Superseded by", "PLAN_LM_HISTORY_COVERAGE + PLAN_LO_HISTORY_COVERAGE Phase 7 closure + external /audit per AUD-017"],
  ["SUBPLAN_HIST_PIVOT_39_K1_RULES_SWEEP.md", "FOLDED", "Folded into", "PLAN_LM_HISTORY_COVERAGE Phase 7 (rules sweep)"],
  ["SUBPLAN_HIST_PIVOT_40_K2_PROMPTS_SWEEP.md", "FOLDED", "Folded into", "PLAN_LM_HISTORY_COVERAGE Phase 7 (prompts sweep)"],
  ["SUBPLAN_DQU_20_F1i_MGMT_HISTORY_AUDIT.md", "SUPERSEDED", "Superseded by", "PLAN_LM_HISTORY_COVERAGE Phase 5b/7 (LM History neutral-eye audit)"],
];

// Patch 8 scope: 16 HIST files already in done/ — banner-sweep only.
const DONE_BANNER_SWEEP = [
  "SUBPLAN_HIST_PIVOT_02_A2_PURGE_LO_SPECS.md",
  "SUBPLAN_HIST_PIVOT_03_A3_PURGE_MDS_CSVS.md",
  "SUBPLAN_HIST_PIVOT_04_H_DOCS_LANG.md",
  "SUBPLAN_HIST_PIVOT_05_B_LO_1_BASIC_INFO_CATALOG.md",
  "SUBPLAN_HIST_PIVOT_05b_B_LO_1b_BASIC_INFO_RESIDUAL.md",
  "SUBPLAN_HIST_PIVOT_06_B_LO_2_ECT_CATALOG.md",
  "SUBPLAN_HIST_PIVOT_06B_B_LO_2b_ECT_DIRECT_VERIFY.md",
  "SUBPLAN_HIST_PIVOT_07_B_LO_R_RECONCILE.md",
  "SUBPLAN_HIST_PIVOT_08_B_LM_1_CURRENCY_CATALOG.md",
  "SUBPLAN_HIST_PIVOT_09_B_LM_2_PRICING_CATALOG.md",
  "SUBPLAN_HIST_PIVOT_14_B_LM_6_NOTES_CATALOG.md",
  "SUBPLAN_HIST_PIVOT_15_B_LM_7_SHARED_SETUP_CATALOG.md",
  "SUBPLAN_HIST_PIVOT_28_D6_LM_NOTES_TESTS.md",
  "SUBPLAN_HIST_PIVOT_29_D7_LM_SHARED_SETUP_TESTS.md",
  "SUBPLAN_HIST_PIVOT_41_B_LO_V_JIRA_VERIFY.md",
  "PLAN_SP_B_LM_2_CLOSURE_AND_COMPLETENESS_GATE.md",
];

const ARCHIVE_BANNER_PENDING = (successor) => `> **ARCHIVED — DO NOT EXECUTE.** ${successor}\n`;
const ARCHIVE_BANNER_DONE = `> **ARCHIVED — DO NOT EXECUTE.** Completed work, historical reference only.\n`;

// Bootstrap block ends at the first line that is NOT a `>` quote line (or blank).
// Conservative: collect every contiguous run of leading `>` / blank lines starting from
// the first match of "SESSION BOOTSTRAP". Replace that run with the archive banner.
function neutralizeBootstrap(src, banner) {
  const lines = src.split(/\r?\n/);
  const startIdx = lines.findIndex((l) => /SESSION BOOTSTRAP/i.test(l));
  if (startIdx === -1) return { changed: false, out: src, reason: "no SESSION BOOTSTRAP marker" };

  // Walk back from startIdx to find the actual start of the `>` block.
  let blockStart = startIdx;
  while (blockStart > 0) {
    const prev = lines[blockStart - 1];
    if (/^\s*>/.test(prev) || /^\s*$/.test(prev)) blockStart -= 1;
    else break;
  }
  // Walk forward to find the end of the `>` block (first non-`>` non-blank line, OR an `---` separator).
  let blockEnd = startIdx;
  while (blockEnd < lines.length) {
    const cur = lines[blockEnd];
    if (/^\s*>/.test(cur) || /^\s*$/.test(cur)) {
      blockEnd += 1;
    } else {
      break;
    }
  }
  // Also consume a trailing `---` separator if present (we'll re-emit one).
  let consumedSeparator = false;
  if (blockEnd < lines.length && /^---\s*$/.test(lines[blockEnd])) {
    blockEnd += 1;
    consumedSeparator = true;
    // and one trailing blank
    if (blockEnd < lines.length && /^\s*$/.test(lines[blockEnd])) blockEnd += 1;
  }
  const replacement = banner + (consumedSeparator ? "\n---\n\n" : "\n");
  const newLines = [...lines.slice(0, blockStart), replacement.replace(/\n$/, ""), ...lines.slice(blockEnd)];
  return { changed: true, out: newLines.join("\n"), reason: `replaced block lines ${blockStart}..${blockEnd - 1}` };
}

// Update / insert Status field + add the named successor field.
function updateFrontmatter(src, newStatus, fieldLabel, fieldValue) {
  let out = src;
  const statusRe = /^\*\*Status\*\*:[ \t]*[^\n]*/m;
  const statusLine = `**Status**: ${newStatus}`;
  const successorLine = `**${fieldLabel}**: ${fieldValue}`;
  if (statusRe.test(out)) {
    out = out.replace(statusRe, statusLine);
  } else {
    // No Status field — insert after the H1 title line.
    const h1Re = /^(# [^\n]+)\n/m;
    if (h1Re.test(out)) {
      out = out.replace(h1Re, `$1\n\n${statusLine}\n`);
    } else {
      // Last resort — prepend.
      out = `${statusLine}\n\n` + out;
    }
  }
  // Insert successor line right after Status line (or replace if existing same-label field exists).
  const existingSuccessorRe = new RegExp(`^\\*\\*${fieldLabel}\\*\\*:[ \\t]*[^\\n]*`, "m");
  if (existingSuccessorRe.test(out)) {
    out = out.replace(existingSuccessorRe, successorLine);
  } else {
    out = out.replace(/^\*\*Status\*\*:[ \t]*[^\n]*/m, (m) => `${m}\n${successorLine}`);
  }
  return out;
}

let totalPending = 0;
let totalDone = 0;
let warnings = [];

for (const [fname, newStatus, fieldLabel, fieldValue] of PENDING_DISPOSITIONS) {
  const fpath = resolve(ROOT, "plans", "pending", fname);
  if (!existsSync(fpath)) {
    warnings.push(`MISSING (pending): ${fname}`);
    continue;
  }
  const src = readFileSync(fpath, "utf8");
  const successorText = `${fieldLabel === "Superseded by" ? "Superseded by" : fieldLabel === "Folded into" ? "Folded into" : "Archived for"}: ${fieldValue}`;
  const banner = ARCHIVE_BANNER_PENDING(successorText);
  const { changed, out, reason } = neutralizeBootstrap(src, banner);
  if (!changed) {
    // Bootstrap was already neutralized OR never had one. Skip bootstrap replacement; still update frontmatter.
    warnings.push(`NO-BOOTSTRAP (pending): ${fname} — ${reason}; frontmatter still updated`);
  }
  const final = updateFrontmatter(changed ? out : src, newStatus, fieldLabel, fieldValue);
  writeFileSync(fpath, final, "utf8");
  totalPending += 1;
}

for (const fname of DONE_BANNER_SWEEP) {
  const fpath = resolve(ROOT, "plans", "done", fname);
  if (!existsSync(fpath)) {
    warnings.push(`MISSING (done): ${fname}`);
    continue;
  }
  const src = readFileSync(fpath, "utf8");
  const { changed, out, reason } = neutralizeBootstrap(src, ARCHIVE_BANNER_DONE);
  if (!changed) {
    warnings.push(`NO-BOOTSTRAP (done): ${fname} — ${reason}; file unchanged`);
    continue;
  }
  writeFileSync(fpath, out, "utf8");
  totalDone += 1;
}

console.log(JSON.stringify({
  pendingProcessed: totalPending,
  doneProcessed: totalDone,
  warnings,
}, null, 2));
