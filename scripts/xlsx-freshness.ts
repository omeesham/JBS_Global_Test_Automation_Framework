#!/usr/bin/env ts-node
/**
 * xlsx-freshness.ts — verify clients/encore/test_cases_xlsx/encore_test_cases.xlsx
 * is fresher than every source MD under
 * clients/encore/specs_planning/test-cases/setup/.
 *
 * Exit 0 = XLSX mtime >= all source MD mtimes.
 * Exit 1 = at least one MD is newer (XLSX is stale; rebuild required).
 *
 * Used by Phase B pre-commit Gate A (after the gate swap from CSV → XLSX).
 * Phase A creates this script; Phase A's gate is still CSV-based.
 */

import * as fs from 'fs';
import * as path from 'path';

const REPO_ROOT = path.resolve(__dirname, '..');
const XLSX_PATH = path.join(REPO_ROOT, 'clients', 'encore', 'test_cases_xlsx', 'encore_test_cases.xlsx');
const MD_ROOT = path.join(REPO_ROOT, 'clients', 'encore', 'specs_planning', 'test-cases', 'setup');

function walkMd(dir: string): string[] {
  const acc: string[] = [];
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '_internal') continue;
      acc.push(...walkMd(full));
    } else if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('_')) {
      acc.push(full);
    }
  }
  return acc;
}

function main(): number {
  if (!fs.existsSync(XLSX_PATH)) {
    console.error(`[xlsx-freshness] FAIL — workbook missing at ${path.relative(REPO_ROOT, XLSX_PATH)}`);
    console.error('[xlsx-freshness] Run `npm run xlsx:build` first.');
    return 1;
  }
  const xlsxMtime = fs.statSync(XLSX_PATH).mtimeMs;
  const mds = walkMd(MD_ROOT);
  const stale: string[] = [];
  for (const md of mds) {
    const mdMtime = fs.statSync(md).mtimeMs;
    if (mdMtime > xlsxMtime) stale.push(md);
  }
  if (stale.length === 0) {
    console.log(`[xlsx-freshness] OK — XLSX fresher than all ${mds.length} source MDs`);
    return 0;
  }
  console.error(`[xlsx-freshness] FAIL — ${stale.length} MD(s) newer than XLSX:`);
  for (const md of stale) {
    const rel = path.relative(REPO_ROOT, md);
    const mdIso = new Date(fs.statSync(md).mtimeMs).toISOString();
    console.error(`  ${rel}  (mtime ${mdIso})`);
  }
  const xlsxIso = new Date(xlsxMtime).toISOString();
  console.error(`  ----`);
  console.error(`  XLSX mtime: ${xlsxIso}`);
  console.error('[xlsx-freshness] Run `npm run xlsx:build` to refresh.');
  return 1;
}

if (require.main === module) {
  process.exit(main());
}
