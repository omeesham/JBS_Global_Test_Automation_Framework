#!/usr/bin/env ts-node
/**
 * xlsx-dump.ts — plain-text TSV dump of every sheet in
 * clients/encore/test_cases_xlsx/encore_test_cases.xlsx.
 *
 * Used for:
 *   - PR review (binary XLSX diffs are unreadable; reviewers diff the dump)
 *   - parity / freshness sanity-checks
 *   - input to scripts/xlsx-vs-csv-parity.mjs
 *
 * Usage:
 *   ts-node scripts/xlsx-dump.ts                       # → stdout
 *   ts-node scripts/xlsx-dump.ts > dump.txt            # → file
 *   ts-node scripts/xlsx-dump.ts --sheet=local_office_settings   # one sheet
 *   ts-node scripts/xlsx-dump.ts --format=json         # JSON instead of TSV
 */

import * as fs from 'fs';
import * as path from 'path';
import ExcelJS from 'exceljs';

const REPO_ROOT = path.resolve(__dirname, '..');
const XLSX_PATH = path.join(REPO_ROOT, 'clients', 'encore', 'test_cases_xlsx', 'encore_test_cases.xlsx');

interface DumpOpts {
  sheetFilter?: string;
  format: 'tsv' | 'json';
}

async function dump(opts: DumpOpts): Promise<void> {
  if (!fs.existsSync(XLSX_PATH)) {
    console.error(`[xlsx-dump] FAIL — workbook missing at ${path.relative(REPO_ROOT, XLSX_PATH)}`);
    process.exit(1);
  }
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_PATH);

  if (opts.format === 'json') {
    const out: Record<string, string[][]> = {};
    wb.eachSheet(ws => {
      if (opts.sheetFilter && ws.name !== opts.sheetFilter) return;
      out[ws.name] = sheetToMatrix(ws);
    });
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
    return;
  }

  // TSV mode: emit "== Sheet: <name> ==" banner + rows tab-separated
  let first = true;
  wb.eachSheet(ws => {
    if (opts.sheetFilter && ws.name !== opts.sheetFilter) return;
    if (!first) process.stdout.write('\n');
    first = false;
    process.stdout.write(`== Sheet: ${ws.name} (${ws.rowCount} rows) ==\n`);
    const matrix = sheetToMatrix(ws);
    for (const row of matrix) {
      process.stdout.write(row.map(cleanCell).join('\t') + '\n');
    }
  });
}

function sheetToMatrix(ws: ExcelJS.Worksheet): string[][] {
  const rows: string[][] = [];
  ws.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    const out: string[] = [];
    row.eachCell({ includeEmpty: true }, cell => {
      out.push(cellAsString(cell.value));
    });
    rows.push(out);
  });
  return rows;
}

function cellAsString(v: any): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'object') {
    if ('text' in v) return String(v.text);
    if ('result' in v) return String(v.result);
    if ('richText' in v && Array.isArray(v.richText)) {
      return v.richText.map((rt: any) => rt.text ?? '').join('');
    }
  }
  return String(v);
}

function cleanCell(s: string): string {
  return s.replace(/\t/g, ' ').replace(/\r?\n/g, ' ¶ ');
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const sheetArg = args.find(a => a.startsWith('--sheet='));
  const formatArg = args.find(a => a.startsWith('--format='));
  const opts: DumpOpts = {
    sheetFilter: sheetArg?.split('=')[1],
    format: (formatArg?.split('=')[1] as 'tsv' | 'json') ?? 'tsv',
  };
  dump(opts).catch(err => {
    console.error('[xlsx-dump] FAIL —', err);
    process.exit(1);
  });
}
