// One-off baseline dumper for encore_test_cases_testrail.xlsx (id-audit 2026-06-10).
// Captures per-sheet: name, headers, row count, distinct Module/Sub-Module values, first 3 IDs.
import ExcelJS from 'exceljs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../../..');
const file = path.join(repo, 'clients/encore/test_cases_xlsx/encore_test_cases_testrail.xlsx');

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(file);
const out = {};
wb.eachSheet((ws) => {
  const headers = (ws.getRow(1).values || []).slice(1).map(v => String(v ?? ''));
  const modCol = headers.indexOf('Module') + 1;
  const subCol = headers.findIndex(h => /sub.?module/i.test(h)) + 1;
  const idCol = headers.indexOf('ID') + 1;
  const modules = new Set(); const subs = new Set(); const ids = [];
  ws.eachRow((row, n) => {
    if (n === 1) return;
    if (modCol) { const v = row.getCell(modCol).text.trim(); if (v) modules.add(v); }
    if (subCol) { const v = row.getCell(subCol).text.trim(); if (v) subs.add(v); }
    if (idCol && ids.length < 3) { const v = row.getCell(idCol).text.trim(); if (v) ids.push(v); }
  });
  out[ws.name] = { headers, rowCount: ws.rowCount - 1, modules: [...modules], subModules: [...subs], firstIds: ids };
});
fs.writeFileSync(path.join(here, 'baseline-testrail-dump.json'), JSON.stringify(out, null, 2));
console.log('sheets:', Object.keys(out).length);
for (const [name, s] of Object.entries(out)) console.log(`${name}: rows=${s.rowCount} modules=${JSON.stringify(s.modules)}`);
