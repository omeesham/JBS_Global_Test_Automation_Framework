#!/usr/bin/env node
/**
 * xlsx-merged-shape.test.mjs — regression guard for the merged TestRail step-expanded
 * deliverable shape (PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT, 2026-06-11).
 *
 * FAILS if the merge is ever reverted:
 *   - any module sheet's header row drifts from the merged 13-col schema;
 *   - any retired old column ('Notes', 'Automation Execution', 'If Failed Reason of
 *     Failure', 'Automation Type', 'Specific Field') reappears in a sheet header;
 *   - a second `*_testrail.xlsx` workbook reappears in the deliverable directory.
 *
 * Run: node scripts/xlsx-merged-shape.test.mjs   (npm run test:xlsx-merged-shape)
 */
import XLSX from 'xlsx';
import { existsSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const XLSX_DIR = path.join(REPO_ROOT, 'clients', 'encore', 'testcases');
const XLSX_PATH = path.join(XLSX_DIR, 'encore_test_cases.xlsx');

const MERGED_HEADERS = [
  'TC ID', 'Title', 'Module', 'Submodule', 'Test Data', 'Type', 'Priority',
  'Coverage Status', 'Automation Status', 'Preconditions',
  'Steps (Step)', 'Steps (Expected Result)', 'Notes / Reason',
];
const FORBIDDEN_OLD_COLUMNS = [
  'Notes', 'Automation Execution', 'If Failed Reason of Failure',
  'Automation Type', 'Specific Field', 'ID', 'Sub-Module',
];

let failures = 0;
function check(label, cond) {
  console.log(`  ${cond ? '[OK]' : '[FAIL]'} ${label}`);
  if (!cond) failures++;
}

console.log('merged-shape regression');

// 1. No second *_testrail.xlsx workbook in the deliverable directory.
const testrailFiles = existsSync(XLSX_DIR)
  ? readdirSync(XLSX_DIR).filter(f => /_testrail\.xlsx$/i.test(f))
  : [];
check(`no *_testrail.xlsx in ${path.relative(REPO_ROOT, XLSX_DIR)} (found: ${testrailFiles.join(', ') || 'none'})`, testrailFiles.length === 0);

// 2. Every module sheet header row == the merged 13-col schema, with no old columns.
if (!existsSync(XLSX_PATH)) {
  check(`workbook exists at ${path.relative(REPO_ROOT, XLSX_PATH)} (run npm run xlsx:build)`, false);
} else {
  const wb = XLSX.readFile(XLSX_PATH);
  for (const sheetName of wb.SheetNames) {
    if (sheetName === 'Overview') continue;
    const aoa = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: '' });
    const header = (aoa[0] || []).map(h => String(h).replace(/^﻿/, '').trim());
    const exact = header.length === MERGED_HEADERS.length && MERGED_HEADERS.every((h, i) => header[i] === h);
    check(`${sheetName}: header == merged 13-col schema`, exact);
    const oldHit = FORBIDDEN_OLD_COLUMNS.find(c => header.includes(c));
    check(`${sheetName}: no retired old column (found: ${oldHit ?? 'none'})`, !oldHit);
  }
}

console.log('');
if (failures === 0) {
  console.log('[xlsx merged-shape test] PASS — single merged step-expanded workbook, no old shape');
  process.exit(0);
} else {
  console.log(`[xlsx merged-shape test] FAIL — ${failures} assertion(s) failed (the merge may have regressed)`);
  process.exit(1);
}
