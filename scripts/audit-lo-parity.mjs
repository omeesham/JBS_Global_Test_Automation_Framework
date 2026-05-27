#!/usr/bin/env node
// READ-ONLY audit script for agent-1 (local_office_* sheets)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ExcelJS from 'exceljs';
import { parseString } from '@fast-csv/parse';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const XLSX = path.join(REPO, 'clients/encore/test_cases_xlsx/encore_test_cases.xlsx');
const CSV  = path.join(REPO, 'clients/encore/test_cases_csv/local_office_settings_test_cases.csv');
const REG  = path.join(REPO, 'reports/fixme-registry.json');

const SHEET_PREFIX = {
  'local_office_settings': ['TC-LOS-BAS-'],
  'local_office_history':  ['TC-LOS-HIS-', 'TC-LOS-HST-', 'TC-LOS-HISL-'],
  'local_office_ect':      ['TC-LOS-ECT-'],
};

function norm(s) {
  if (s == null) return '';
  if (typeof s !== 'string') s = String(s);
  // normalize whitespace and CRLF
  return s.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
}

function cellAsString(v) {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'object') {
    if ('text' in v) return String(v.text);
    if ('result' in v) return String(v.result);
    if ('richText' in v && Array.isArray(v.richText)) {
      return v.richText.map(rt => rt.text ?? '').join('');
    }
  }
  return String(v);
}

async function readXlsx() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX);
  const out = {};
  wb.eachSheet(ws => {
    if (!SHEET_PREFIX[ws.name]) return;
    const rows = [];
    ws.eachRow({ includeEmpty: true }, row => {
      const r = [];
      row.eachCell({ includeEmpty: true }, c => r.push(cellAsString(c.value)));
      rows.push(r);
    });
    if (!rows.length) return;
    const headers = rows[0].map(norm);
    const body = rows.slice(1).map(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = norm(r[i] ?? ''));
      return obj;
    });
    out[ws.name] = { headers, body };
  });
  return out;
}

function readCsv() {
  const txt = fs.readFileSync(CSV, 'utf8');
  return new Promise((resolve, reject) => {
    const rows = [];
    parseString(txt, { headers: true, ignoreEmpty: true })
      .on('error', reject)
      .on('data', r => {
        const o = {};
        for (const k of Object.keys(r)) o[norm(k)] = norm(r[k]);
        rows.push(o);
      })
      .on('end', () => resolve(rows));
  });
}

function readRegistry() {
  const data = JSON.parse(fs.readFileSync(REG, 'utf8'));
  const set = new Set();
  // Handle whatever shape it is.
  if (Array.isArray(data)) {
    for (const x of data) {
      if (typeof x === 'string') set.add(x);
      else if (x?.tcId) set.add(x.tcId);
      else if (x?.id) set.add(x.id);
    }
  } else if (typeof data === 'object' && data) {
    for (const k of Object.keys(data)) set.add(k);
  }
  return set;
}

function classifyDrift(field, csv, xlsx, isBlocked) {
  // Allowed modulo categories
  if (field === 'Coverage Status') {
    // CSV originally had this as 'Automated' column? In merged CSV header → check both.
    return null; // handled separately
  }
  if (field === 'Automation Execution' && xlsx === 'Blocked') {
    return 'BLOCKED_OVERLAY_EXEC';
  }
  if (field === 'If Failed Reason of Failure' && isBlocked) {
    return 'BLOCKED_OVERLAY_REASON';
  }
  if (field === 'Specific Field' && csv === '' && xlsx !== '') {
    return 'NEW_XLSX_SPECIFIC_FIELD'; // technically XLSX-added value, allowed when CSV had no column
  }
  return 'UNEXPECTED';
}

// XLSX has columns: TC ID, Title, Module, Submodule, Specific Field, Tags,
//   Preconditions, Steps, Expected Result, Notes, Coverage Status,
//   Automation Execution, If Failed Reason of Failure
// CSV (merged LO) has: TC ID, Title, Module, Submodule, Tags, Preconditions,
//   Steps, Expected Result, Notes, Automated, Automation Execution,
//   If Failed Reason of Failure  (NO "Specific Field")

const FIELDS_TO_COMPARE = [
  'TC ID', 'Title', 'Module', 'Submodule', 'Tags', 'Preconditions',
  'Steps', 'Expected Result', 'Notes',
  'Coverage Status', 'Automation Execution', 'If Failed Reason of Failure'
];

function mapCoverage(csvAuto) {
  // CSV "Automated" → XLSX "Coverage Status"
  // Yes→Automated, No→Pending Automation, ''→''
  if (csvAuto === 'Yes' || csvAuto === 'yes') return 'Automated';
  if (csvAuto === 'No' || csvAuto === 'no')   return 'Pending Automation';
  return '';
}

async function main() {
  const xlsxSheets = await readXlsx();
  const csvAll = await readCsv();
  const registry = readRegistry();

  // Identify CSV header for Automated column (might be 'Automated')
  const csvHeaders = csvAll.length ? Object.keys(csvAll[0]) : [];
  const csvByTc = new Map(csvAll.map(r => [r['TC ID'], r]));

  const drifts = []; // {sheet, tcId, field, csv, xlsx, classification}
  const sheetStats = {};
  let totalCells = 0;

  for (const [sheetName, prefixes] of Object.entries(SHEET_PREFIX)) {
    const sheet = xlsxSheets[sheetName];
    if (!sheet) {
      drifts.push({sheet: sheetName, tcId: '*sheet*', field: 'sheet-presence', csv: 'expected', xlsx: 'missing', classification: 'UNEXPECTED'});
      continue;
    }
    sheetStats[sheetName] = { xlsxRows: 0, csvRows: 0, matched: 0 };
    // Filter XLSX body: only rows with TC ID matching prefixes; exclude SUMMARY row
    const xlsxRows = sheet.body.filter(r => {
      const tc = r['TC ID'];
      if (!tc) return false;
      if (tc.toUpperCase().startsWith('SUMMARY')) return false;
      return prefixes.some(p => tc.startsWith(p));
    });
    const csvRows = csvAll.filter(r => prefixes.some(p => r['TC ID'].startsWith(p)));
    sheetStats[sheetName].xlsxRows = xlsxRows.length;
    sheetStats[sheetName].csvRows = csvRows.length;

    // Build maps
    const xMap = new Map(xlsxRows.map(r => [r['TC ID'], r]));
    const cMap = new Map(csvRows.map(r => [r['TC ID'], r]));

    // Missing in XLSX
    for (const tc of cMap.keys()) {
      if (!xMap.has(tc)) drifts.push({sheet: sheetName, tcId: tc, field: 'row-presence', csv: 'present', xlsx: 'MISSING', classification: 'UNEXPECTED'});
    }
    // Extra in XLSX (not in CSV)
    for (const tc of xMap.keys()) {
      if (!cMap.has(tc)) drifts.push({sheet: sheetName, tcId: tc, field: 'row-presence', csv: 'MISSING', xlsx: 'present', classification: 'UNEXPECTED'});
    }

    // Routing check: any XLSX TC whose prefix does NOT match this sheet's prefixes
    for (const r of sheet.body) {
      const tc = r['TC ID'];
      if (!tc || tc.toUpperCase().startsWith('SUMMARY')) continue;
      if (!tc.startsWith('TC-LOS-')) continue; // unrelated
      const matchesThisSheet = prefixes.some(p => tc.startsWith(p));
      if (!matchesThisSheet) {
        drifts.push({sheet: sheetName, tcId: tc, field: 'routing', csv: '(expected elsewhere)', xlsx: `routed to ${sheetName}`, classification: 'UNEXPECTED'});
      }
    }

    // Cell-by-cell comparison
    for (const tc of [...cMap.keys()].filter(k => xMap.has(k))) {
      sheetStats[sheetName].matched++;
      const cRow = cMap.get(tc);
      const xRow = xMap.get(tc);
      const isBlocked = xRow['Automation Execution'] === 'Blocked';

      for (const field of FIELDS_TO_COMPARE) {
        totalCells++;
        const xVal = xRow[field] ?? '';
        let cVal;
        if (field === 'Coverage Status') {
          cVal = mapCoverage(cRow['Automated'] ?? '');
        } else {
          cVal = cRow[field] ?? '';
        }
        if (norm(xVal) === norm(cVal)) continue;

        let cls = classifyDrift(field, cVal, xVal, isBlocked);
        if (cls === null) {
          // Coverage match check
          cls = 'UNEXPECTED';
        }
        drifts.push({sheet: sheetName, tcId: tc, field, csv: cVal, xlsx: xVal, classification: cls});
      }

      // Also flag if XLSX has Specific Field non-empty (allowed but record for tally)
      const sf = xRow['Specific Field'];
      if (sf && sf !== '') {
        drifts.push({sheet: sheetName, tcId: tc, field: 'Specific Field', csv: '(column absent)', xlsx: sf, classification: 'NEW_XLSX_SPECIFIC_FIELD'});
      }
    }
  }

  // Tally
  const tally = { UNEXPECTED: 0, BLOCKED_OVERLAY_EXEC: 0, BLOCKED_OVERLAY_REASON: 0, NEW_XLSX_SPECIFIC_FIELD: 0, COVERAGE_RENAME: 0 };
  for (const d of drifts) tally[d.classification] = (tally[d.classification] ?? 0) + 1;

  console.log('## SUMMARY');
  console.log('totalCells:', totalCells);
  console.log('drifts total:', drifts.length);
  console.log('tally:', JSON.stringify(tally, null, 2));
  console.log('sheetStats:', JSON.stringify(sheetStats, null, 2));
  console.log('');
  console.log('## ALL DRIFTS');
  for (const d of drifts) {
    const c = d.csv.length > 200 ? d.csv.slice(0,200)+'…' : d.csv;
    const x = d.xlsx.length > 200 ? d.xlsx.slice(0,200)+'…' : d.xlsx;
    console.log(`[${d.classification}] ${d.sheet} / ${d.tcId} / ${d.field}`);
    console.log(`  CSV : ${c}`);
    console.log(`  XLSX: ${x}`);
  }

  // Registry summary
  console.log('');
  console.log('## REGISTRY (Blocked entries)');
  const losBlocked = [...registry].filter(t => t.startsWith('TC-LOS-'));
  console.log('Total registry entries:', registry.size);
  console.log('LOS entries in registry:', losBlocked.length);
  console.log('LOS:', losBlocked.sort());
}
main().catch(e => { console.error(e); process.exit(2); });
