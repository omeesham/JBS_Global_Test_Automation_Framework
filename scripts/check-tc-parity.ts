#!/usr/bin/env ts-node
/**
 * TC Parity Check: Spec TCs vs Markdown TCs vs XLSX TCs (with CSV fallback)
 *
 * Compares Playwright spec test IDs against markdown test case files and the
 * XLSX deliverable (CSV fallback only while both formats coexist — Phase B
 * of PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION). After Phase D removes CSVs,
 * the CSV-fallback path becomes a no-op and is removed along with --fix-csv.
 *   1. TCs in specs but NOT in markdown (missing from client deliverable)
 *   2. TCs in specs but NOT in XLSX (export gap)
 *   3. TCs in markdown but NOT in XLSX (parser/export bug)
 *
 * Usage: npx ts-node scripts/check-tc-parity.ts [--fix-csv]
 *   --fix-csv: One-phase alias — rebuilds the XLSX workbook (legacy flag name
 *              kept through Phase C for hook compat; removed in Phase D).
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { SHARED_PATHS } from './shared-types';

const TC_PATTERN = /TC-[A-Z]+-[A-Z]+-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*/g;

// LR-020 regression guard: regex MUST match all 1- to 3-segment-prefix TC ID shapes.
// 2026-05-26 forensic finding (csv-md-delta-investigation-2026-05-26.md): the prior
// (?:-[A-Z]+)? singular-optional clause silently dropped TC-LOC-LI-NE-NNN (3-segment
// prefix) and the like, inflating the apparent MD/CSV delta. New form: 1-to-3
// dash-segments between TC-<first> and the trailing number/letters group.
const MD_HEADER_TC_PATTERN = /^#{2,3}\s+(TC-[A-Z]+(?:-[A-Z]+){1,3}-(?:\d+[A-Z]?|[A-Z]+)(?:-[A-Z]+)*):/gm;

function assertHeaderRegexCovers3SegmentPrefixes(): void {
  const fixtures = ['TC-LOC-CUR-001', 'TC-LOC-LI-NE-011', 'TC-LOC-SHR-DIV-099'];
  for (const id of fixtures) {
    const probe = `## ${id}: title`;
    const singleHit = new RegExp(MD_HEADER_TC_PATTERN.source);
    const m = probe.match(singleHit);
    if (!m || m[1] !== id) {
      throw new Error(
        `check-tc-parity MD_HEADER_TC_PATTERN self-test FAILED for ${id} — matched ${m ? m[1] : '(null)'}`
      );
    }
  }
}
assertHeaderRegexCovers3SegmentPrefixes();

function getSpecTcIds(): Set<string> {
  // LR-020 regression guard: from repo root, `npx playwright test --list` has no
  // config to find — returns 0 tests, masking the true Spec count as 0. The per-
  // client Playwright project lives at SHARED_PATHS.clientRoot, so anchor execSync
  // there. (2026-05-26 forensic finding.)
  const output = execSync('npx playwright test --list', {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: SHARED_PATHS.clientRoot,
  });
  const ids = new Set<string>();
  for (const match of output.matchAll(TC_PATTERN)) {
    ids.add(match[0]);
  }
  return ids;
}

function getMarkdownTcIds(): Set<string> {
  const ids = new Set<string>();
  const testCasesDir = SHARED_PATHS.testCases;
  const files = findMarkdownFiles(testCasesDir);
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const headerPattern = new RegExp(MD_HEADER_TC_PATTERN.source, MD_HEADER_TC_PATTERN.flags);
    let match;
    while ((match = headerPattern.exec(content)) !== null) {
      ids.add(match[1]!);
    }
  }
  return ids;
}

function getXlsxTcIds(): Set<string> {
  const ids = new Set<string>();
  const workbookPath = SHARED_PATHS.workbook;
  if (!fs.existsSync(workbookPath)) return ids;
  const wb = XLSX.readFile(workbookPath, { cellDates: false, cellNF: false });
  for (const sheetName of wb.SheetNames) {
    if (sheetName === 'Overview') continue;
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
    for (const row of rows) {
      const idCell = row['TC ID'];
      if (typeof idCell === 'string' && /^TC-/.test(idCell)) ids.add(idCell);
    }
  }
  return ids;
}

/** @deprecated CSV-fallback path removed in Phase D. Kept while CSVs coexist with XLSX. */
function getCsvTcIds(): Set<string> {
  const ids = new Set<string>();
  const exportsDir = SHARED_PATHS.exports;
  if (!fs.existsSync(exportsDir)) return ids;
  const csvFiles = fs.readdirSync(exportsDir).filter(f => f.endsWith('.csv'));
  for (const file of csvFiles) {
    const content = fs.readFileSync(path.join(exportsDir, file), 'utf8');
    for (const match of content.matchAll(TC_PATTERN)) {
      ids.add(match[0]);
    }
  }
  return ids;
}

function findMarkdownFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

function setDiff(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter(x => !b.has(x)).sort();
}

// --- Main ---
const specIds = getSpecTcIds();
const mdIds = getMarkdownTcIds();
const xlsxIds = getXlsxTcIds();
const csvIds = getCsvTcIds(); // legacy fallback — removed in Phase D

const inSpecNotMd = setDiff(specIds, mdIds);
const inSpecNotXlsx = setDiff(specIds, xlsxIds);
const inMdNotXlsx = setDiff(mdIds, xlsxIds);
const inMdNotSpec = setDiff(mdIds, specIds);

let hasIssues = false;

console.log('=== TC Parity Report ===\n');
console.log(`Spec TCs:     ${specIds.size}`);
console.log(`Markdown TCs: ${mdIds.size}`);
console.log(`XLSX TCs:     ${xlsxIds.size}${csvIds.size ? `   (CSV fallback: ${csvIds.size})` : ''}\n`);

if (inSpecNotMd.length > 0) {
  hasIssues = true;
  console.log(`CRITICAL: ${inSpecNotMd.length} TCs in specs but NOT in markdown (missing from client deliverable):`);
  inSpecNotMd.forEach(id => console.log(`  - ${id}`));
  console.log('');
}

if (inSpecNotXlsx.length > 0) {
  hasIssues = true;
  console.log(`CRITICAL: ${inSpecNotXlsx.length} TCs in specs but NOT in XLSX (export gap):`);
  inSpecNotXlsx.forEach(id => console.log(`  - ${id}`));
  console.log('');
}

if (inMdNotXlsx.length > 0) {
  hasIssues = true;
  console.log(`WARNING: ${inMdNotXlsx.length} TCs in markdown but NOT in XLSX (parser/export bug):`);
  inMdNotXlsx.forEach(id => console.log(`  - ${id}`));
  console.log('');
}

console.log(`INFO: ${inMdNotSpec.length} TCs in markdown but not yet in specs (planned, not implemented)`);
console.log('');

if (!hasIssues) {
  console.log('PASS: All spec TCs are present in both markdown and XLSX deliverable.');
} else {
  console.log('FAIL: Parity issues detected. Fix markdown gaps, then rebuild XLSX via `npm run xlsx:build`.');
}

if (process.argv.includes('--fix-csv')) {
  // Legacy flag name kept for one phase (B+C) — actually rebuilds the XLSX
  // workbook. Phase D removes the --fix-csv flag entirely along with the
  // CSV fallback branch above. (PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION
  // Phase B / Phase D — auditor finding #1.)
  console.log('\n--- Rebuilding XLSX workbook (legacy --fix-csv alias) ---');
  execSync('npm run xlsx:build', { stdio: 'inherit' });
  console.log('Done.');
}

process.exit(hasIssues ? 1 : 0);
