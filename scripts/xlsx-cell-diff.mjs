#!/usr/bin/env node
/**
 * xlsx-cell-diff.mjs — byte-level cell diff between two workbooks.
 *
 * Usage: node scripts/xlsx-cell-diff.mjs <baseline.xlsx> <after.xlsx>
 *
 * Compares every module-sheet DATA row cell-by-cell. Skips:
 *   - Overview sheet (carries build date)
 *   - SUMMARY rows (carry "Last Updated: <date>")
 *   - Blank separator rows
 *
 * Exit 0 = identical.  Exit 1 = diffs found.  Exit 2 = infra error.
 *
 * Used as the byte-identical proof gate during the DRY consolidation
 * (INVESTIGATE-AND-FIX-DRY-SERENE-STONEBRAKER) to verify that:
 *  (a) consolidating to-csv.ts onto ./humanize imports produces 0 changed cells, and
 *  (b) removing the redundant double-scrubInternalVocab pass in to-xlsx.ts parseMd()
 *      produces 0 changed cells (scrubInternalVocab is idempotent on already-scrubbed text).
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ExcelJS = require('exceljs');

const MODULE_COL_COUNT = 13;

/**
 * Read module-sheet rows from an xlsx file.
 * Returns Map<sheetName, rows> where each row is a 13-element string array.
 * Skips Overview, SUMMARY rows, and blank separator rows.
 */
async function readModuleRows(file) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  const out = new Map();
  for (const ws of wb.worksheets) {
    if (ws.name === 'Overview') continue;
    const rows = [];
    ws.eachRow((row) => {
      const cells = [];
      for (let c = 1; c <= MODULE_COL_COUNT; c++) {
        let v = row.getCell(c).value;
        if (v && typeof v === 'object' && 'text' in v) v = v.text;
        cells.push(v == null ? '' : String(v).trim());
      }
      if (cells[0] === 'SUMMARY') return;
      if (cells.every(x => x === '')) return;
      rows.push(cells);
    });
    out.set(ws.name, rows);
  }
  return out;
}

/**
 * Diff two module-row maps. Returns human-readable diff lines (empty = identical).
 */
function diffRows(committed, rebuilt) {
  const diffs = [];
  const sheets = new Set([...committed.keys(), ...rebuilt.keys()]);
  for (const sheet of sheets) {
    const a = committed.get(sheet);
    const b = rebuilt.get(sheet);
    if (!a) { diffs.push(`sheet '${sheet}' is in after but not baseline`); continue; }
    if (!b) { diffs.push(`sheet '${sheet}' is in baseline but not after`); continue; }
    if (a.length !== b.length) {
      diffs.push(`sheet '${sheet}': ${a.length} baseline row(s) vs ${b.length} after`);
      continue;
    }
    for (let i = 0; i < a.length; i++) {
      const ra = a[i], rb = b[i];
      for (let c = 0; c < MODULE_COL_COUNT; c++) {
        if ((ra[c] ?? '') !== (rb[c] ?? '')) {
          const tcId = ra[0] || rb[0] || `row ${i + 1}`;
          diffs.push(`sheet '${sheet}' ${tcId} col ${c + 1}: baseline="${(ra[c] ?? '').slice(0, 60)}" after="${(rb[c] ?? '').slice(0, 60)}"`);
          if (diffs.length >= 30) return diffs;
        }
      }
    }
  }
  return diffs;
}

async function main() {
  const [baselinePath, afterPath] = process.argv.slice(2);
  if (!baselinePath || !afterPath) {
    console.error('Usage: node scripts/xlsx-cell-diff.mjs <baseline.xlsx> <after.xlsx>');
    process.exit(2);
  }

  const [baseline, after] = await Promise.all([
    readModuleRows(baselinePath),
    readModuleRows(afterPath),
  ]);

  // Count total data rows (excluding header row per sheet)
  let totalRows = 0;
  for (const rows of baseline.values()) {
    if (rows.length > 1) totalRows += rows.length - 1; // exclude header
  }

  const diffs = diffRows(baseline, after);
  if (diffs.length === 0) {
    console.log(`[xlsx-cell-diff] PASS — 0 changed cells, ${totalRows} module data rows identical.`);
    process.exit(0);
  } else {
    console.error(`[xlsx-cell-diff] FAIL — ${diffs.length} diff(s) found across ${totalRows} module data rows:`);
    for (const d of diffs) console.error(`  ${d}`);
    if (diffs.length >= 30) console.error('  … (truncated at 30 diffs)');
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`[xlsx-cell-diff] infra error: ${err.message}`);
  process.exit(2);
});
