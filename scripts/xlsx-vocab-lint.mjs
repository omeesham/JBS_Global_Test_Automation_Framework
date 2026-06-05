#!/usr/bin/env node
/**
 * xlsx-vocab-lint.mjs — commit-time CLI gate (npm run xlsx:lint).
 *
 * Thin wrapper over the shared rule module scripts/xlsx-lint-rules.mjs (ALL-026 DRY):
 * the SAME deny-list + integrity checks run at build time (to-xlsx self-fail), commit
 * time (.githooks/pre-commit step 5b → here), and ship time (verify-no-forbidden.mjs).
 *
 * Exit codes: 0 = clean, 1 = vocab/integrity violation(s), 2 = workbook missing.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { lintWorkbook, formatReport } from './xlsx-lint-rules.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const XLSX_PATH = path.join(ROOT, 'clients', 'encore', 'test_cases_xlsx', 'encore_test_cases.xlsx');

let result;
try {
  result = lintWorkbook(XLSX_PATH);
} catch (err) {
  console.error(`[xlsx:lint] ${err.message}`);
  process.exit(2);
}

console.log(formatReport(result));

if (!result.ok) {
  console.log('[xlsx:lint] strip these at SOURCE — MD files under clients/encore/specs_planning/test-cases/setup/, spec test.fixme() reason strings, or reports/fixme-registry.json (baseline-restoration entries) — then re-run "npm run xlsx:build".');
  process.exit(1);
}
process.exit(0);
