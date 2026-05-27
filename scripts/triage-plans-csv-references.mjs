#!/usr/bin/env node
/**
 * triage-plans-csv-references.mjs — produce a per-plan action ledger for the
 * CSV-mentioning plans in `plans/pending/` so a human reviewer can classify
 * each plan as REWRITE / DROP-AS-SUPERSEDED / PRESERVE / REVIEW per Phase C
 * of PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.
 *
 * Per the auditor finding folded into the plan body: this script DOES NOT
 * mutate plan files. It emits a markdown ledger at
 * `clients/encore/specs_planning/_internal/plan-triage-ledger-<YYYY-MM-DD>.md`
 * with one section per plan (raw CSV-mention lines + context + suggested
 * classification per the plan body table + blank Action cell for manual
 * decision). The same triage run also emits
 * `_internal/plan-dependency-graph-<YYYY-MM-DD>.md` listing every
 * Depends-on / Blocks / Parent edge that points at a CSV-era plan, so
 * the dependency graph rewrite can land in one reviewable artifact.
 *
 * Usage:
 *   node scripts/triage-plans-csv-references.mjs                   # dry-run (default)
 *   node scripts/triage-plans-csv-references.mjs --emit            # write the two .md files
 *   node scripts/triage-plans-csv-references.mjs --emit --client=X # different active client
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { join, dirname, relative, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

function arg(name) {
  const flag = process.argv.find((a) => a.startsWith(`--${name}=`));
  return flag ? flag.slice(`--${name}=`.length) : null;
}
const hasFlag = (n) => process.argv.includes(`--${n}`);

const CLIENT = arg('client') ?? 'encore';
const TODAY = new Date().toISOString().slice(0, 10);
const PENDING_DIR = join(REPO_ROOT, 'plans', 'pending');
const LEDGER_DIR = join(REPO_ROOT, 'clients', CLIENT, 'specs_planning', '_internal');
const LEDGER_PATH = join(LEDGER_DIR, `plan-triage-ledger-${TODAY}.md`);
const DEPGRAPH_PATH = join(LEDGER_DIR, `plan-dependency-graph-${TODAY}.md`);

// Plan body table — explicit classifications per
// PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION §332-351 (Phase C).
const EXPLICIT_CLASSIFICATIONS = {
  'PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md': 'DROP-AS-SUPERSEDED',
  '_PARITY_RESTRUCTURE_TRACEABILITY_2026-05-26.md': 'REWRITE',
  'SUBPLAN_PARITY_W1_01_DECISIONS_AND_DRIFT_PRETRIAGE.md': 'PRESERVE',
  'SUBPLAN_PARITY_W1_02_TOOLING_MD_CSV_REEXPORT_AND_LO_SPLIT.md': 'REWRITE',
  'SUBPLAN_PARITY_W1_03_LOCAL_OFFICE_CODE_SPLIT.md': 'PRESERVE',
  'SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT.md': 'REWRITE-light',
  'SUBPLAN_PARITY_W1_05_CI_LOCAL_VALIDATORS.md': 'REWRITE',
  'SUBPLAN_PARITY_W2_06_SHADY_PASS_LIVE_AUDIT.md': 'PRESERVE',
  'SUBPLAN_PARITY_W2_07_FIELD_INVENTORIES_NEUTRAL_EYE.md': 'PRESERVE',
  'SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT.md': 'REWRITE-light',
  'SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY.md': 'REWRITE',
  'PLAN_TEST_DATA_CSV_CONVERSION.md': 'REVIEW',
  'PLAN_BIG_PIVOT_FCC_MASTER.md': 'PRESERVE',
  'PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.md': 'SELF',
};

function suggestClassification(file, contentSnippets) {
  if (EXPLICIT_CLASSIFICATIONS[file]) return EXPLICIT_CLASSIFICATIONS[file];
  // Heuristic defaults for the unenumerated 30 plans
  if (/_internal\/csv-md-delta|csv-vs-/.test(contentSnippets)) return 'PRESERVE';
  if (/test_cases_csv|to-csv\.ts|check:tc-parity:fix|csv_export/.test(contentSnippets)) return 'REWRITE-light';
  return 'REVIEW';
}

function walkPendingPlans() {
  const out = [];
  if (!existsSync(PENDING_DIR)) return out;
  for (const name of readdirSync(PENDING_DIR)) {
    if (!name.endsWith('.md')) continue;
    const full = join(PENDING_DIR, name);
    if (!statSync(full).isFile()) continue;
    out.push(full);
  }
  return out.sort();
}

function findCsvHits(content) {
  const hits = [];
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (/csv|CSV/.test(lines[i] ?? '')) hits.push({ line: i + 1, text: lines[i] });
  }
  return hits;
}

function findDepEdges(content) {
  const edges = [];
  const dependsRe = /\*\*(Depends on|Blocks|Parent)\*\*:\s*([^\n]+)/gi;
  let m;
  while ((m = dependsRe.exec(content)) !== null) {
    edges.push({ kind: m[1], target: (m[2] ?? '').trim() });
  }
  return edges;
}

function main() {
  const planFiles = walkPendingPlans();
  const matches = [];
  for (const path of planFiles) {
    const content = readFileSync(path, 'utf-8');
    const hits = findCsvHits(content);
    if (hits.length === 0) continue;
    const file = basename(path);
    const edges = findDepEdges(content);
    matches.push({
      path: relative(REPO_ROOT, path).replace(/\\/g, '/'),
      file,
      hits,
      edges,
      suggested: suggestClassification(file, hits.map(h => h.text).join('\n')),
    });
  }

  const ledger = [];
  ledger.push(`# CSV-Reference Triage Ledger — ${TODAY}\n`);
  ledger.push(`Generated by \`scripts/triage-plans-csv-references.mjs\` for Phase C of`);
  ledger.push(`PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION.\n`);
  ledger.push(`**Plans scanned**: ${planFiles.length} (in \`plans/pending/\`)`);
  ledger.push(`**Plans mentioning CSV**: ${matches.length}\n`);
  ledger.push(`## Per-plan triage table\n`);
  ledger.push(`| Plan | CSV hits | Suggested | Action (fill in) |`);
  ledger.push(`|---|---|---|---|`);
  for (const m of matches) {
    ledger.push(`| \`${m.file}\` | ${m.hits.length} | ${m.suggested} | _ |`);
  }
  ledger.push(``);
  ledger.push(`## Per-plan detail\n`);
  for (const m of matches) {
    ledger.push(`### \`${m.file}\` — suggested **${m.suggested}**\n`);
    ledger.push(`Path: \`${m.path}\`\n`);
    if (m.edges.length > 0) {
      ledger.push(`Dependency edges:`);
      for (const e of m.edges) ledger.push(`- ${e.kind}: ${e.target}`);
      ledger.push(``);
    }
    ledger.push(`CSV mentions (${m.hits.length}):`);
    ledger.push(`\n\`\`\``);
    for (const h of m.hits.slice(0, 20)) {
      ledger.push(`${String(h.line).padStart(4)}: ${(h.text || '').trim()}`);
    }
    if (m.hits.length > 20) ledger.push(`  ... ${m.hits.length - 20} more elided`);
    ledger.push(`\`\`\`\n`);
  }

  // Dependency graph: every edge whose target name matches a CSV-mentioning plan
  const matchedNames = new Set(matches.map(m => m.file.replace(/\.md$/, '')));
  const depGraph = [];
  depGraph.push(`# Plan Dependency Graph — ${TODAY}\n`);
  depGraph.push(`Edges in CSV-mentioning plans that point at other plans.`);
  depGraph.push(`Use this view to confirm no Depends-on / Blocks / Parent`);
  depGraph.push(`references resolve to a now-superseded CSV-era plan.\n`);
  depGraph.push(`| Plan | Edge kind | Target | Target also CSV-mentioning? |`);
  depGraph.push(`|---|---|---|---|`);
  for (const m of matches) {
    for (const e of m.edges) {
      const targetName = (e.target.match(/(SUBPLAN_[A-Z0-9_]+|PLAN_[A-Z0-9_]+)/) || [])[1] ?? e.target;
      const tInMatched = matchedNames.has(targetName);
      depGraph.push(`| \`${m.file}\` | ${e.kind} | ${e.target} | ${tInMatched ? 'yes' : 'no'} |`);
    }
  }
  depGraph.push(``);

  if (hasFlag('emit')) {
    if (!existsSync(LEDGER_DIR)) mkdirSync(LEDGER_DIR, { recursive: true });
    writeFileSync(LEDGER_PATH, ledger.join('\n'), 'utf-8');
    writeFileSync(DEPGRAPH_PATH, depGraph.join('\n'), 'utf-8');
    console.log(`[triage-plans] wrote ledger: ${relative(REPO_ROOT, LEDGER_PATH).replace(/\\/g, '/')}`);
    console.log(`[triage-plans] wrote dep graph: ${relative(REPO_ROOT, DEPGRAPH_PATH).replace(/\\/g, '/')}`);
  } else {
    console.log(`[triage-plans] DRY-RUN — ${matches.length} CSV-mentioning plans found`);
    console.log(`[triage-plans] Pass --emit to write the ledger + dep-graph .md files`);
  }
  return 0;
}

process.exit(main());
