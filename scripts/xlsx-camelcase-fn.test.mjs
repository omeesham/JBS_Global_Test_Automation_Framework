#!/usr/bin/env node
/**
 * xlsx-camelcase-fn.test.mjs — fixture proving the 'lowercase camelCase fn' vocab rule
 * catches genuine spec-helper leaks and does NOT false-positive on camelCase identifiers
 * that appear without function-call parentheses in legitimate client cell content.
 *
 * Run: node scripts/xlsx-camelcase-fn.test.mjs
 */
import XLSX from 'xlsx';
import { writeFileSync, rmSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { lintWorkbook, readWorkbookRows } from './xlsx-lint-rules.mjs';

let failures = 0;
function check(label, cond) {
  console.log(`  ${cond ? '[OK]' : '[FAIL]'} ${label}`);
  if (!cond) failures++;
}

const HEADERS = [
  'TC ID', 'Title', 'Module', 'Submodule', 'Test Data', 'Type', 'Priority',
  'Coverage Status', 'Automation Status', 'Preconditions',
  'Steps (Step)', 'Steps (Expected Result)', 'Notes / Reason',
];

/** Build a minimal one-sheet workbook with given data rows under HEADERS. */
function buildWb(rows) {
  const aoa = [HEADERS, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'locations_currency');
  return wb;
}

/** Row helper: all blank except the Steps column (index 10). */
const stepRow = (tcId, step) => [tcId, 'Title', 'locations', 'currency', '', 'Functional', 'High', 'Automated', 'Pass', '', step, 'Expected', ''];

const dir = mkdtempSync(path.join(tmpdir(), 'xlsx-camelcase-'));
const wbPath = path.join(dir, 'test.xlsx');

// ── Test A: genuine violation — spec helper call in a Steps cell ──────────────
// 'clickSaveAndConfirm()' is an internal spec-helper method name; it must be caught.
const violationWb = buildWb([
  stepRow('LOC-CUR-001', 'clickSaveAndConfirm() is called by the test'),
]);
writeFileSync(wbPath, XLSX.write(violationWb, { type: 'buffer', bookType: 'xlsx' }));
const violationResult = lintWorkbook(wbPath);
const violationHit = violationResult.vocabHits.some(f => f.pattern === 'lowercase camelCase fn');
check('genuine violation: clickSaveAndConfirm() is caught', violationHit);

// ── Test B: legitimate lookalike — camelCase identifier WITHOUT call parens ───
// A cell that says "camelCase" or "saveAndConfirm" as prose does NOT have function-call
// syntax; the rule must NOT flag it.
const lookalikWb = buildWb([
  stepRow('LOC-CUR-002', 'Field label is displayed in camelCase format'),
]);
writeFileSync(wbPath, XLSX.write(lookalikWb, { type: 'buffer', bookType: 'xlsx' }));
const lookalikeResult = lintWorkbook(wbPath);
const lookalikHit = lookalikeResult.vocabHits.some(f => f.pattern === 'lowercase camelCase fn');
check('legitimate lookalike: "camelCase format" (no parens) is NOT flagged', !lookalikHit);

rmSync(dir, { recursive: true, force: true });

if (failures) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
} else {
  console.log('\nAll checks passed.');
}
