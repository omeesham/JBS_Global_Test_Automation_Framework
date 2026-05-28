#!/usr/bin/env node
import XLSX from 'xlsx';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const XLSX_PATH = path.join(ROOT, 'clients', 'encore', 'test_cases_xlsx', 'encore_test_cases.xlsx');

if (!existsSync(XLSX_PATH)) {
  console.error(`[xlsx:lint] missing workbook: ${XLSX_PATH}`);
  console.error('[xlsx:lint] run "npm run xlsx:build" first');
  process.exit(2);
}

const wb = XLSX.readFile(XLSX_PATH);
const allRows = [];
for (const sheetName of wb.SheetNames) {
  if (sheetName === 'Overview') continue;
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });
  for (const r of rows) allRows.push({ sheet: sheetName, ...r });
}

const BANNED = [
  { name: 'Angular bare', re: /\bAngular\b/i },
  { name: 'Playwright bare', re: /\bPlaywright\b/i },
  { name: 'data-testid', re: /data-testid/i },
  { name: '.page.ts ref', re: /\.page\.ts/i },
  { name: 'spec.ts ref', re: /\.spec\.ts/i },
  { name: 'getByTestId', re: /getByTestId/ },
  { name: 'MCP-N verified', re: /MCP-?[0-9]*\s+verified/i },
  { name: 'MCP_VERIFICATION_LOG', re: /MCP_VERIFICATION_LOG/ },
  { name: 'BUG-LI-NNN', re: /BUG-LI-\d+/ },
  { name: 'spec helper expectAfter*', re: /\bexpectAfter[A-Z]/ },
  { name: 'spec helper expectBefore*', re: /\bexpectBefore[A-Z]/ },
  { name: 'spec helper ensureEmpty*', re: /\bensureEmpty[A-Z]/ },
  { name: 'spec helper saveAndConfirm', re: /\bsaveAndConfirm\b/ },
  { name: 'spec helper reloadAndNavigate*', re: /\breloadAndNavigate/ },
  { name: 'spec helper waitForSave*', re: /\bwaitForSave[A-Z]/ },
  { name: 'spec helper clickAdd', re: /\bclickAdd\(/ },
  { name: 'DOM textarea.value', re: /textarea\.value/ },
  { name: 'DOM form.pristine', re: /\bform\.pristine/ },
  { name: 'backend ERR_/BILLING_', re: /(ERR_(LEFT|LEGAL)|BILLING_)/ },
  { name: 'backend hideRemitTax', re: /\bhideRemitTax\b/ },
  { name: 'backend CheckDiscount', re: /\bCheckDiscount\b/ },
  { name: 'backend updateControlStatus', re: /\bupdateControlStatus\b/ },
  { name: 'backend ADD_LOCATION.', re: /ADD_LOCATION\./ },
  { name: 'lowercase camelCase fn', re: /\b[a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]+\([^)]*\)/ },
  { name: 'bare YYYY-MM-DD', re: /\b202[0-9]-\d{2}-\d{2}\b/ },
  { name: 'NM-NNN ticket', re: /\bNM-\d{2,5}\b/ },
];

const CHECKED_COLS = ['TC ID', 'Title', 'Module', 'Submodule', 'Specific Field', 'Tags', 'Preconditions', 'Steps', 'Expected Result', 'Notes', 'Coverage Status', 'Automation Execution', 'If Failed Reason of Failure'];

const hits = {};
for (const r of allRows) {
  const tcId = r['TC ID'] || r['Test ID'] || '';
  if (tcId === 'SUMMARY') continue;
  for (const col of CHECKED_COLS) {
    const v = String(r[col] || '');
    if (!v) continue;
    for (const b of BANNED) {
      if (b.re.test(v)) {
        hits[b.name] = hits[b.name] || [];
        const m = v.match(b.re)?.[0];
        hits[b.name].push({ sheet: r.sheet, tcId, col, match: m, sample: v.length > 120 ? v.substring(0, 120) + '...' : v });
      }
    }
  }
}

const sorted = Object.entries(hits).sort((a, b) => b[1].length - a[1].length);
const totalHits = Object.values(hits).reduce((s, l) => s + l.length, 0);

console.log(`[xlsx:lint] rows scanned: ${allRows.length}`);
console.log(`[xlsx:lint] categories: ${sorted.length}, total hits: ${totalHits}`);

if (totalHits === 0) {
  console.log('[xlsx:lint] PASS — workbook is clean of internal/agent vocab.');
  process.exit(0);
}

console.log();
for (const [name, list] of sorted) {
  console.log(`--- ${name}: ${list.length} hits ---`);
  for (const h of list.slice(0, 5)) {
    console.log(`  [${h.sheet}/${h.tcId}/${h.col}] '${h.match}' :: ${h.sample}`);
  }
  if (list.length > 5) console.log(`  ... +${list.length - 5} more`);
}

console.log();
console.log(`[xlsx:lint] FAIL — ${totalHits} banned-vocab hit(s) found in client deliverable workbook.`);
console.log('[xlsx:lint] strip these from source MDs under clients/encore/specs_planning/test-cases/setup/, then re-run "npm run xlsx:build".');
process.exit(1);
