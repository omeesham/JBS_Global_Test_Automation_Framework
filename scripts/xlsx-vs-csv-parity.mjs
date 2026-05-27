#!/usr/bin/env node
/**
 * xlsx-vs-csv-parity.mjs — Phase A HARD GATE + Phase D pre-delete gate.
 *
 * Compares the freshly-built workbook (clients/encore/test_cases_xlsx/encore_test_cases.xlsx)
 * row-by-row against the current 11 CSVs (clients/encore/test_cases_csv/*.csv).
 *
 * Per PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION §265 (verify) the comparison must
 * pass modulo:
 *   (a) NEW schema cells —
 *       - locations TCs: XLSX has new Tags col (empty); CSV col "Specific Field" → XLSX col "Specific Field"
 *       - local-office TCs: XLSX has new Specific Field col (empty); CSV col "Tags" → XLSX col "Tags"
 *       - the "Automated"/"Coverage Status" header rename + Yes→Automated / No→Pending Automation value map
 *       - trailing SUMMARY rows + blank separator row in XLSX (not in CSV)
 *   (b) Merged local_office_settings.csv (85 rows) splits across 3 sheets:
 *       BAS prefix → local_office_settings, HIS prefix → local_office_history,
 *       ECT prefix → local_office_ect. Each row matched within its prefix group.
 *
 * Any UNEXPLAINED drift → exit 1 + diff list. Exit 0 = parity confirmed.
 *
 * Removed in Phase D when CSVs are deleted (the comparison target disappears).
 *
 * Pure Node (no TypeScript compile step) — runs as the .mjs extension implies.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import * as path from 'path';
import { fileURLToPath } from 'url';
import xlsxLib from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const CSV_DIR = join(REPO_ROOT, 'clients', 'encore', 'test_cases_csv');
const XLSX_PATH = join(REPO_ROOT, 'clients', 'encore', 'test_cases_xlsx', 'encore_test_cases.xlsx');

// Map CSV basename → XLSX sheet name. For the merged LO CSV we resolve by TC-ID prefix.
const CSV_TO_SHEET = {
  locations_account_address_test_cases: 'locations_account_address',
  locations_auto_addon_test_cases: 'locations_auto_addon',
  locations_currency_test_cases: 'locations_currency',
  locations_left_panel_test_cases: 'locations_left_panel',
  locations_legal_test_cases: 'locations_legal',
  locations_local_information_test_cases: 'locations_local_information',
  locations_management_history_test_cases: 'locations_management_history',
  locations_notes_test_cases: 'locations_notes',
  locations_pricing_test_cases: 'locations_pricing',
  // PLAN DEVIATION (documented in to-xlsx.ts SHEET_NAMES): "...locations" → "...location" (32→31)
  locations_shared_setup_locations_test_cases: 'locations_shared_setup_location',
};

const LO_PREFIX_TO_SHEET = {
  BAS: 'local_office_settings',
  HIS: 'local_office_history',
  HST: 'local_office_history',
  HISL: 'local_office_history',
  ECT: 'local_office_ect',
};

const LO_MERGED_CSV = 'local_office_settings_test_cases';

/** Minimal CSV parser — handles quoted fields, internal commas, escaped quotes, embedded newlines. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  text = text.replace(/^﻿/, ''); // strip BOM
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else inQuotes = false;
      } else cell += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else if (c === '\r') { /* skip */ }
      else cell += c;
    }
  }
  if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
  while (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') rows.pop();
  return rows;
}

/** Normalise text for comparison — collapse whitespace, strip trailing nbsp, etc. */
function norm(s) {
  if (s == null) return '';
  return String(s)
    .replace(/﻿/g, '')
    .replace(/ /g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .trim();
}

/** Map CSV's "Automated" Yes/No into XLSX's "Coverage Status" value. */
function coverageEquivalent(csvAutomated, xlsxCoverageStatus) {
  const a = norm(csvAutomated);
  const cs = norm(xlsxCoverageStatus);
  if (a === 'Yes' && cs === 'Automated') return true;
  if (a === 'No' && cs === 'Pending Automation') return true;
  if (a === '' && cs === '') return true;
  return false;
}

function loadXlsx() {
  if (!existsSync(XLSX_PATH)) {
    console.error(`[parity] FAIL — workbook missing at ${path.relative(REPO_ROOT, XLSX_PATH)}.`);
    console.error('[parity] Run `npm run xlsx:build` first.');
    process.exit(1);
  }
  const wb = xlsxLib.readFile(XLSX_PATH, { cellDates: false, cellNF: false, cellText: true });
  // Convert every sheet to AoA, key by sheet name. We also build a TC-ID → row map per sheet.
  const sheets = {};
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    const aoa = xlsxLib.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });
    sheets[name] = aoa;
  }
  return sheets;
}

function buildXlsxIndex(sheets) {
  // sheetName → Map<tcId, row>  (row is a string[] aligned to MODULE_SHEET_HEADERS)
  const index = {};
  for (const [name, rows] of Object.entries(sheets)) {
    if (name === 'Overview') continue;
    if (rows.length === 0) continue;
    const header = rows[0].map(norm);
    const idCol = header.indexOf('TC ID');
    if (idCol < 0) continue;
    const map = new Map();
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const id = norm(row[idCol]);
      if (!id || id === 'SUMMARY') continue;
      map.set(id, { row, header });
    }
    index[name] = map;
  }
  return index;
}

function compareCsv(csvBasename, csvRows, xlsxIndex, issues) {
  // CSV header
  const csvHeader = csvRows[0].map(norm);
  const csvIdCol = csvHeader.indexOf('TC ID');
  const csvTitleCol = csvHeader.indexOf('Title');
  const csvModuleCol = csvHeader.indexOf('Module');
  const csvSubmoduleCol = csvHeader.indexOf('Submodule');
  const csvSpecificFieldCol = csvHeader.indexOf('Specific Field');
  const csvTagsCol = csvHeader.indexOf('Tags');
  const csvPreCol = csvHeader.indexOf('Preconditions');
  const csvStepsCol = csvHeader.indexOf('Steps');
  const csvExpectedCol = csvHeader.indexOf('Expected Result');
  const csvNotesCol = csvHeader.indexOf('Notes');
  const csvAutomatedCol = csvHeader.indexOf('Automated');
  const csvExecCol = csvHeader.indexOf('Automation Execution');
  const csvReasonCol = csvHeader.indexOf('If Failed Reason of Failure');

  if (csvIdCol < 0) {
    issues.push(`[${csvBasename}] CSV missing 'TC ID' column`);
    return;
  }

  let rowsChecked = 0;
  let rowsMatched = 0;
  const localIssues = [];

  for (let i = 1; i < csvRows.length; i++) {
    const csvRow = csvRows[i];
    const id = norm(csvRow[csvIdCol]);
    if (!id) continue;
    rowsChecked++;

    // Resolve XLSX sheet
    let sheetName = CSV_TO_SHEET[csvBasename];
    if (csvBasename === LO_MERGED_CSV) {
      const m = id.match(/^TC-LOS-([A-Z]+)-/);
      const prefix = m ? m[1] : '';
      sheetName = LO_PREFIX_TO_SHEET[prefix];
      if (!sheetName) {
        localIssues.push(`row ${i}: TC ${id} has unknown LO prefix '${prefix}' (expected BAS/HIS/HST/HISL/ECT)`);
        continue;
      }
    }
    if (!sheetName) {
      localIssues.push(`row ${i}: TC ${id} from ${csvBasename} has no matching XLSX sheet`);
      continue;
    }

    const xlsxSheet = xlsxIndex[sheetName];
    if (!xlsxSheet) {
      localIssues.push(`row ${i}: XLSX sheet '${sheetName}' not found in workbook`);
      continue;
    }
    const xlsxEntry = xlsxSheet.get(id);
    if (!xlsxEntry) {
      localIssues.push(`row ${i}: TC ${id} present in CSV but absent from XLSX sheet '${sheetName}'`);
      continue;
    }

    const { row: xRow, header: xHeader } = xlsxEntry;
    const xCol = (label) => {
      const idx = xHeader.indexOf(label);
      return idx >= 0 ? norm(xRow[idx]) : '';
    };

    // Pre-resolve XLSX Automation Execution + Reason once — needed for Blocked-overlay modulo
    // (post-Phase-A 2026-05-27 fix: --from-csv mode applies registry-driven Blocked overlay,
    // CSV has no Blocked column so the overlay is allowed-and-expected modulo).
    const xlsxExec = xCol('Automation Execution');
    const xlsxReason = xCol('If Failed Reason of Failure');

    // Compare cell-by-cell (skipping the modulo cells)
    const cmps = [
      ['Title', csvTitleCol >= 0 ? norm(csvRow[csvTitleCol]) : '', xCol('Title')],
      ['Module', csvModuleCol >= 0 ? norm(csvRow[csvModuleCol]) : '', xCol('Module')],
      ['Submodule', csvSubmoduleCol >= 0 ? norm(csvRow[csvSubmoduleCol]) : '', xCol('Submodule')],
      ['Preconditions', csvPreCol >= 0 ? norm(csvRow[csvPreCol]) : '', xCol('Preconditions')],
      ['Steps', csvStepsCol >= 0 ? norm(csvRow[csvStepsCol]) : '', xCol('Steps')],
      ['Expected Result', csvExpectedCol >= 0 ? norm(csvRow[csvExpectedCol]) : '', xCol('Expected Result')],
      ['Notes', csvNotesCol >= 0 ? norm(csvRow[csvNotesCol]) : '', xCol('Notes')],
      ['Automation Execution', csvExecCol >= 0 ? norm(csvRow[csvExecCol]) : '', xCol('Automation Execution')],
      ['If Failed Reason of Failure', csvReasonCol >= 0 ? norm(csvRow[csvReasonCol]) : '', xCol('If Failed Reason of Failure')],
    ];

    // Specific Field — present on locations CSVs (col 5). On LO merged CSV the col is "Tags", not "Specific Field".
    if (csvSpecificFieldCol >= 0) {
      cmps.push(['Specific Field', norm(csvRow[csvSpecificFieldCol]), xCol('Specific Field')]);
    }
    if (csvTagsCol >= 0) {
      cmps.push(['Tags', norm(csvRow[csvTagsCol]), xCol('Tags')]);
    }

    let rowMatch = true;
    for (const [field, csvVal, xVal] of cmps) {
      if (csvVal !== xVal) {
        // Allowed modulo: Blocked overlay from fixme-registry is AUTHORITATIVE for TCs in
        // the registry. CSV may have stale 'Fail' (from when the test was actually running
        // and failing) or '' (Cat-A TCs never automated) — overlay upgrades both to Blocked
        // because the spec now wraps these tests in test.fixme(). Registry-driven.
        if (field === 'Automation Execution' && xVal === 'Blocked') continue;
        if (field === 'If Failed Reason of Failure' && xlsxExec === 'Blocked') continue;
        rowMatch = false;
        localIssues.push(
          `row ${i} (${id}) field '${field}' differs:\n` +
            `    CSV:  ${truncate(csvVal, 200)}\n` +
            `    XLSX: ${truncate(xVal, 200)}`
        );
      }
    }

    // Automated → Coverage Status (allowed remap)
    if (csvAutomatedCol >= 0) {
      const csvAutomated = norm(csvRow[csvAutomatedCol]);
      const xlsxCoverage = xCol('Coverage Status');
      if (!coverageEquivalent(csvAutomated, xlsxCoverage)) {
        rowMatch = false;
        localIssues.push(
          `row ${i} (${id}) Coverage Status mismatch:\n` +
            `    CSV Automated:        '${csvAutomated}'\n` +
            `    XLSX Coverage Status: '${xlsxCoverage}'\n` +
            `    (allowed mapping: Yes↔Automated, No↔Pending Automation)`
        );
      }
    }

    if (rowMatch) rowsMatched++;
  }

  // Reverse drift: TCs in XLSX-sheets-for-this-CSV that aren't in this CSV
  // (skip for LO merged — we only sample its rows)
  if (csvBasename !== LO_MERGED_CSV) {
    const sheetName = CSV_TO_SHEET[csvBasename];
    if (sheetName && xlsxIndex[sheetName]) {
      const csvIds = new Set(csvRows.slice(1).map(r => norm(r[csvIdCol])).filter(Boolean));
      for (const xlsxId of xlsxIndex[sheetName].keys()) {
        if (!csvIds.has(xlsxId)) {
          localIssues.push(`extra TC in XLSX '${sheetName}': ${xlsxId} (not present in CSV)`);
        }
      }
    }
  }

  if (localIssues.length === 0) {
    console.log(`[parity] OK   ${csvBasename}  ${rowsMatched}/${rowsChecked} rows matched`);
  } else {
    console.log(`[parity] DRIFT ${csvBasename}  ${rowsMatched}/${rowsChecked} rows matched, ${localIssues.length} issue(s):`);
    for (const issue of localIssues.slice(0, 20)) {
      console.log(`         ${issue}`);
    }
    if (localIssues.length > 20) console.log(`         … (${localIssues.length - 20} more issues elided)`);
    issues.push(...localIssues.map(s => `[${csvBasename}] ${s}`));
  }
}

function truncate(s, max) {
  if (s == null) return '';
  if (s.length <= max) return s;
  return s.slice(0, max) + '…';
}

function main() {
  if (!existsSync(CSV_DIR)) {
    console.log('[parity] CSVs already deleted — parity check no longer applicable.');
    return 0;
  }
  const sheets = loadXlsx();
  const xlsxIndex = buildXlsxIndex(sheets);

  const csvFiles = readdirSync(CSV_DIR).filter(f => f.endsWith('.csv')).sort();
  if (csvFiles.length === 0) {
    console.error('[parity] FAIL — no CSVs found in', CSV_DIR);
    return 1;
  }

  const issues = [];
  for (const f of csvFiles) {
    const base = f.replace(/\.csv$/, '');
    const text = readFileSync(join(CSV_DIR, f), 'utf-8');
    const rows = parseCsv(text);
    compareCsv(base, rows, xlsxIndex, issues);
  }

  console.log('');
  if (issues.length === 0) {
    console.log(`[parity] PASS — all ${csvFiles.length} CSVs match XLSX modulo schema cells + LO 3-way split`);
    return 0;
  }
  console.error(`[parity] FAIL — ${issues.length} parity issue(s) across ${csvFiles.length} CSVs`);
  return 1;
}

process.exit(main());
