#!/usr/bin/env node
/**
 * sp00-audit-v5.mjs — Comprehensive XLSX deliverable audit.
 *
 * Scans every module sheet in
 * clients/encore/testcases/encore_test_cases.xlsx for:
 *   1. Empty required cells
 *   2. Jargon / framework leakage
 *   3. Slop phrases in the Notes / Reason column
 *   4. Malformed TC IDs
 *   5. Contradictory data (Coverage Status vs Automation Status)
 *   6. HALT-FOR-USER sentinels (exposed, not counted as defects)
 *
 * Exit 0 = clean, exit 1 = defects found.
 *
 * Source: the single workbook (Overview + module sheets). Manual-run-only tool —
 * nothing in the pipeline invokes it. Updated for the merged TestRail step-expanded
 * schema (PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT, 2026-06-11): reads the merged
 * status columns ('Automation Status', 'Notes / Reason') and the 'Steps (*)' columns;
 * the prior 'Specific Field' / 'Automated' / 'Automation Execution' / 'If Failed
 * Reason of Failure' / separate 'Notes' columns are retired. loadSheets keys case
 * rows on /^TC-/ so step-expanded continuation rows (blank TC ID) are not counted as
 * cases. NOTE: this TC-row-keyed audit only sees step 1 (later steps live on dropped
 * continuation rows) — the live gate scripts/xlsx-lint-rules.mjs scans ALL rows.
 */

import { existsSync } from 'fs';
import { join } from 'path';
import XLSX from 'xlsx';

const XLSX_PATH = join(process.cwd(), 'clients', 'encore', 'testcases', 'encore_test_cases.xlsx');
// Column order tracks the sheet (Notes / Reason moved to the last column by
// PLAN_DELIVERABLE_NOTES_REASON_DECLUTTER) — used positionally for COLUMNS[c] labels.
const COLUMNS = [
  'TC ID', 'Title', 'Module', 'Submodule', 'Test Data', 'Type', 'Priority',
  'Coverage Status', 'Automation Status', 'Preconditions',
  'Steps (Step)', 'Steps (Expected Result)', 'Notes / Reason'
];
const REQUIRED_ALWAYS = new Set([
  'TC ID', 'Title', 'Module', 'Submodule', 'Preconditions',
  'Steps (Step)', 'Steps (Expected Result)'
]);

const JARGON_PATTERNS = [
  /\bAngular\b/i,
  /\bFormControl\b/,
  /\bFormGroup\b/,
  /\bFormArray\b/,
  /\baria-[a-z]+/,
  /\bRadix\b/,
  /\bNext\.js\b/i,
  /\bReact\b/,
  /\bshadcn\b/i,
  /\blucide\b/i,
  /\bpage\.locator\b/,
  /\bpage\.goto\b/,
  /\bpage\.click\b/,
  /\bawait\s+page\b/,
  /\btest\.fixme\b/,
  /\btest\.skip\b/,
  /\.spec\.ts\b/,
  /\.page\.ts\b/,
  /\.data\.ts\b/,
  /\bselectors?\.[a-z]/i,
  /\bPRIMARY_SYMPTOM\b/,
  /\bMCP_VERIFICATION_LOG\b/,
  /\bInternal:/,
  /\/navigator\/api\//,
  /\/api\/v\d/,
  /\bPOST\s+\//,
  /\bGET\s+\//,
  /\bPUT\s+\//,
  /\bDELETE\s+\//,
  /\bclickSaveWithDialog\b/,
  /\bclickSaveAndConfirm\b/,
  /\bfillAndTab\b/,
  /\bclearAndTab\b/,
  /\bwaitForAngularStable\b/,
  /\bsetRadixCheckbox\b/,
  /\bdismissAlertDialogIfVisible\b/,
  /\bdata-testid\b/,
  /\bdata-state\b/,
];

const JARGON_EXEMPTIONS = [
  /\bdata-testid\b/,
  /\bdata-state\b/,
];

const SLOP_PHRASES = [
  /^automation pending$/i,
  /^depends on environment$/i,
  /^by design$/i,
  /^future enhancement$/i,
  /^TBD$/i,
  /^tbd$/,
  /^spec not yet implemented$/i,
  /^N\/A$/i,
];

// Shape check for the TC-{MODULE}-{SUBMODULE}-{NNN[A]} grammar — module-agnostic
// (LOC/LOS/CPR/…) so it does not go stale when module-codes.json gains a module.
const TC_ID_PATTERN = /^TC-[A-Z]+-[A-Z]+-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;

function isJargon(text, colName, rowContext = '') {
  // Accessibility-themed TCs may legitimately reference ARIA attributes
  const isAccessibilityTC = /accessibility|aria|keyboard navigation/i.test(rowContext);

  // Notes / Reason column is more permissive — only flag the worst offenders
  const patterns = colName === 'Notes / Reason'
    ? JARGON_PATTERNS.filter(p =>
        /PRIMARY_SYMPTOM|MCP_VERIFICATION_LOG|Internal:|page\.locator|page\.goto/.test(p.source))
    : JARGON_PATTERNS;

  for (const pat of patterns) {
    if (pat.test(text)) {
      // Exempt ARIA mentions in accessibility-themed TCs
      if (isAccessibilityTC && /aria-/.test(pat.source)) continue;
      // Check exemptions for the step + test-data columns
      if (['Test Data', 'Steps (Step)', 'Steps (Expected Result)', 'Preconditions'].includes(colName)) {
        if (/data-testid|data-state/.test(text) && /button\[role/.test(text)) continue;
      }
      return pat.source;
    }
  }
  return null;
}

/**
 * Load sheet sources as `{ file, rows }` pairs where `rows[0]` is the header,
 * reading the XLSX workbook (the single deliverable post-CSV-retirement). The
 * header row + cell shape mirrors the legacy CSV layout so the downstream
 * audit logic stays unchanged.
 */
function loadSheets() {
  if (!existsSync(XLSX_PATH)) {
    console.error(`✗ Workbook not found: ${XLSX_PATH}`);
    console.error('  Run `npm run xlsx:build` to generate it first.');
    process.exit(1);
  }
  const wb = XLSX.readFile(XLSX_PATH, { cellDates: false, cellNF: false });
  const sources = [];
  for (const sheetName of wb.SheetNames) {
    if (sheetName === 'Overview') continue;
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    // sheet_to_json with header:1 returns array-of-arrays so row[0] is header.
    const arr = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    // Keep the header (row 0) + one row per CASE. In the merged step-expanded layout a
    // case spans 1 first-row (TC ID in col 0) + N continuation step-rows (blank col 0);
    // key case rows on /^TC-/ so continuation rows AND the trailing blank/SUMMARY rows
    // are dropped and the per-sheet count is distinct TC IDs, not raw rows.
    const filtered = arr.filter((r, i) => {
      if (i === 0) return true; // header
      return /^TC-/.test(String(r[0] ?? '').trim());
    });
    if (filtered.length === 0) continue;
    sources.push({ file: `${sheetName} (xlsx sheet)`, rows: filtered });
  }
  return sources;
}

function audit() {
  const sources = loadSheets();
  const defects = [];
  const halts = [];
  let totalRows = 0;

  for (const { file, rows } of sources) {
    if (rows.length < 2) {
      defects.push({ file, row: 0, col: '-', issue: 'XLSX sheet has no data rows' });
      continue;
    }

    const header = rows[0];
    const headerMap = {};
    header.forEach((h, i) => { headerMap[String(h).replace(/^﻿/, '')] = i; });
    // Normalize `Coverage Status` (Automated/Pending Automation) to a boolean-ish
    // 'Yes'/'No' so the contradictory/required checks below keep their semantics.
    const coverageIdx = headerMap['Coverage Status'];

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      totalRows++;
      const tcId = (row[headerMap['TC ID']] || '').trim();
      let automated = '';
      if (coverageIdx !== undefined) {
        const cov = String(row[coverageIdx] || '').trim();
        if (cov === 'Automated') automated = 'Yes';
        else if (cov === 'Pending Automation') automated = 'No';
      }
      const execution = (row[headerMap['Automation Status']] || '').trim();
      // Reason now lives in the merged 'Notes / Reason' cell (reason segment + optional
      // appended Notes). For this advisory audit, read the whole cell.
      const reason = (row[headerMap['Notes / Reason']] || '').trim();
      const title = (row[headerMap['Title']] || '').trim();

      // 1. TC ID format
      if (tcId && !TC_ID_PATTERN.test(tcId)) {
        defects.push({ file, row: r + 1, col: 'TC ID', issue: `Malformed TC ID: "${tcId}"` });
      }

      // 2. HALT-FOR-USER (expose, not defect)
      for (let c = 0; c < row.length && c < COLUMNS.length; c++) {
        if ((row[c] || '').includes('HALT-FOR-USER')) {
          halts.push({ file, row: r + 1, tcId, col: COLUMNS[c], value: row[c].trim() });
        }
      }

      // 3. Empty required columns
      for (const colName of REQUIRED_ALWAYS) {
        const idx = headerMap[colName];
        if (idx !== undefined && !(row[idx] || '').trim()) {
          defects.push({ file, row: r + 1, col: colName, issue: 'Empty required cell' });
        }
      }

      // Automation Status — required when Automated=Yes
      if (automated === 'Yes' && !execution) {
        defects.push({ file, row: r + 1, col: 'Automation Status', issue: 'Empty but Automated=Yes' });
      }

      // Reason — required only when Execution=Fail. (PLAN_DELIVERABLE_NOTES_REASON_DECLUTTER
      // R3: a Pending-Automation row [Automated=No] legitimately has no reason now that the
      // column is reason-only; only a failing row without an explanation is a real gap.)
      if (execution === 'Fail' && !reason) {
        defects.push({ file, row: r + 1, col: 'Notes / Reason', issue: 'Empty but required (Execution=Fail)' });
      }

      // 4. Contradictory data
      if (automated === 'No' && execution === 'Pass') {
        defects.push({ file, row: r + 1, col: 'Automation Status', issue: 'Contradictory: Automated=No but Execution=Pass' });
      }

      // 5. Jargon scan (client-facing text columns; status/id columns excluded)
      const jargonCols = ['Title', 'Test Data', 'Preconditions', 'Steps (Step)',
        'Steps (Expected Result)', 'Notes / Reason'];
      for (const colName of jargonCols) {
        const idx = headerMap[colName];
        if (idx === undefined) continue;
        const val = (row[idx] || '').trim();
        if (!val) continue;
        const match = isJargon(val, colName, title);
        if (match) {
          defects.push({ file, row: r + 1, col: colName, issue: `Jargon: matched /${match}/` });
        }
      }

      // 6. Slop phrases in the Notes / Reason column
      if (reason) {
        for (const pat of SLOP_PHRASES) {
          if (pat.test(reason)) {
            defects.push({ file, row: r + 1, col: 'Notes / Reason', issue: `Slop phrase: "${reason}"` });
            break;
          }
        }
      }

      // 8. Placeholder detection (all cells)
      for (let c = 0; c < row.length && c < COLUMNS.length; c++) {
        const val = (row[c] || '').trim();
        if (/^(TBD|tbd|xxx|XXX|\?\?\?|placeholder)$/i.test(val)) {
          defects.push({ file, row: r + 1, col: COLUMNS[c], issue: `Placeholder: "${val}"` });
        }
      }
    }
  }

  // Report
  console.log('═══ SP00 Audit v5 — Comprehensive XLSX Deliverable Audit ═══\n');
  console.log(`Sheets/files scanned: ${sources.length}`);
  console.log(`Total data rows: ${totalRows}`);
  console.log(`Defects found: ${defects.length}`);
  console.log(`HALT-FOR-USER sentinels: ${halts.length}\n`);

  if (defects.length > 0) {
    console.log('── DEFECTS ──\n');
    const byFile = {};
    for (const d of defects) {
      if (!byFile[d.file]) byFile[d.file] = [];
      byFile[d.file].push(d);
    }
    for (const [file, defs] of Object.entries(byFile)) {
      console.log(`${file} (${defs.length} defects):`);
      for (const d of defs) {
        console.log(`  Row ${d.row} [${d.col}]: ${d.issue}`);
      }
      console.log();
    }

    const byCat = {};
    for (const d of defects) {
      const cat = d.issue.split(':')[0];
      byCat[cat] = (byCat[cat] || 0) + 1;
    }
    console.log('── BY CATEGORY ──');
    for (const [cat, count] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${cat}: ${count}`);
    }
    console.log();
  }

  if (halts.length > 0) {
    console.log('── HALT-FOR-USER SENTINELS ──\n');
    for (const h of halts) {
      console.log(`  ${h.file} Row ${h.row} [${h.col}] ${h.tcId}: ${h.value}`);
    }
    console.log();
  }

  if (defects.length === 0) {
    console.log('✓ CLEAN — no defects found.\n');
    process.exit(0);
  } else {
    console.log(`✗ FAILED — ${defects.length} defect(s) must be resolved.\n`);
    process.exit(1);
  }
}

audit();
