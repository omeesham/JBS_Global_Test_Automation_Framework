#!/usr/bin/env node
/**
 * xlsx-trim.mjs — trim the deliverable workbook to one or more module scopes for a
 * per-module branch ship. INTERNAL tooling — NEVER ships, NEVER wired into
 * client:ship / xlsx:build / hooks. ON-DEMAND ONLY: invoked solely from
 * scripts/ship-branch.sh when the user explicitly ships module-wise. The repo always
 * holds the FULL all-modules workbook (PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT §Per-module).
 *
 * Sheet-level surgery only — it removes whole sheets and prunes Overview rows; it
 * never touches columns / SUMMARY / step-rows, so the merged step-expanded layout
 * needs no special handling.
 *
 * Usage:
 *   node scripts/xlsx-trim.mjs <xlsx-path> --modules=<token,...>
 *     token = MODULE code (e.g. CPR → all its submodule sheets)
 *           | MODULE.SUBMODULE code (e.g. LOC.NTS → just locations_notes)
 *   node scripts/xlsx-trim.mjs <xlsx-path> --sheets=<sheetA,sheetB,...>   (raw sheet names)
 *
 * Sheet ownership is resolved from export_test_cases/module-codes.json (single source
 * of truth — no hardcoded sheet lists). 'Overview' is always kept, and its data rows
 * are filtered down to the surviving sheets (fixes the dead-hyperlink / cross-module
 * leak the throwaway C:\Temp seed had).
 */
import ExcelJS from 'exceljs';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadRegistry() {
  const raw = readFileSync(path.join(REPO_ROOT, 'export_test_cases', 'module-codes.json'), 'utf8').replace(/^﻿/, '');
  const reg = JSON.parse(raw);
  if (!reg?.modules?.LOC || !reg?.submodules?.LOC?.CUR?.sheet) {
    throw new Error('[xlsx-trim] module-codes.json failed shape assert');
  }
  return reg;
}

/** Resolve --modules tokens (MOD or MOD.SUB) → set of sheet names via the registry. */
function resolveModuleTokens(tokens, reg) {
  const sheets = new Set();
  for (const tokenRaw of tokens) {
    const token = tokenRaw.trim();
    if (!token) continue;
    if (token.includes('.')) {
      const [mod, sub] = token.split('.');
      const e = reg.submodules?.[mod]?.[sub];
      if (!e) throw new Error(`[xlsx-trim] unknown module.submodule "${token}" (check module-codes.json)`);
      sheets.add(e.sheet);
    } else {
      const subs = reg.submodules?.[token];
      if (!subs) throw new Error(`[xlsx-trim] unknown module "${token}" (check module-codes.json)`);
      for (const e of Object.values(subs)) sheets.add(e.sheet);
    }
  }
  return sheets;
}

async function main() {
  const [, , xlsxPath, ...rest] = process.argv;
  if (!xlsxPath) {
    console.error('Usage: node scripts/xlsx-trim.mjs <xlsx-path> --modules=<token,...> | --sheets=<sheet,...>');
    process.exit(1);
  }
  if (!existsSync(xlsxPath)) {
    console.error(`[xlsx-trim] file not found: ${xlsxPath}`);
    process.exit(1);
  }
  const modulesArg = rest.find(a => a.startsWith('--modules='));
  const sheetsArg = rest.find(a => a.startsWith('--sheets='));
  if (!modulesArg && !sheetsArg) {
    console.error('[xlsx-trim] need --modules=<token,...> or --sheets=<sheet,...>');
    process.exit(1);
  }

  let keep;
  if (modulesArg) {
    const reg = loadRegistry();
    keep = resolveModuleTokens(modulesArg.slice('--modules='.length).split(','), reg);
  } else {
    keep = new Set(sheetsArg.slice('--sheets='.length).split(',').map(s => s.trim()).filter(Boolean));
  }
  keep.add('Overview'); // Overview is always kept (and pruned below).

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(xlsxPath);

  // Record the original module sheet names BEFORE removal (for Overview row pruning).
  const originalSheets = [];
  wb.eachSheet(ws => { if (ws.name !== 'Overview') originalSheets.push(ws.name); });

  // Remove every non-kept sheet.
  const toRemove = [];
  wb.eachSheet(ws => { if (!keep.has(ws.name)) toRemove.push(ws.name); });
  for (const name of toRemove) wb.removeWorksheet(wb.getWorksheet(name).id);

  // Assert each requested sheet survived (a typo'd module would silently keep nothing).
  const remaining = [];
  wb.eachSheet(ws => remaining.push(ws.name));
  const missing = [...keep].filter(n => !remaining.includes(n));
  if (missing.length) {
    console.error(`[xlsx-trim] requested sheets not present in workbook: ${missing.join(', ')}`);
    process.exit(1);
  }

  // Prune Overview data rows down to surviving sheets so a single-module recipient
  // sees no other module's names / counts / dead hyperlinks. Overview data rows carry
  // a sheet name (plain or hyperlink) in column 1; a removed sheet's row is spliced.
  const removedSheets = new Set(originalSheets.filter(n => !keep.has(n)));
  const ov = wb.getWorksheet('Overview');
  if (ov && removedSheets.size) {
    const rowsToDelete = [];
    ov.eachRow((row, rowNumber) => {
      const c = row.getCell(1).value;
      const text = c && typeof c === 'object' && 'text' in c ? String(c.text) : String(c ?? '');
      if (removedSheets.has(text.trim())) rowsToDelete.push(rowNumber);
    });
    // splice bottom-up so earlier row numbers stay valid
    for (const rn of rowsToDelete.sort((a, b) => b - a)) ov.spliceRows(rn, 1);
  }

  await wb.xlsx.writeFile(xlsxPath);
  console.log(`[xlsx-trim] kept: ${remaining.join(', ')}`);
  console.log(`[xlsx-trim] removed sheets: ${toRemove.join(', ') || '(none)'}`);
  console.log(`[xlsx-trim] Overview rows pruned for: ${[...removedSheets].join(', ') || '(none)'}`);
}

main().catch(err => { console.error('[xlsx-trim] FAIL —', err.message); process.exit(1); });
