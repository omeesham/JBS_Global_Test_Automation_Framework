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

/**
 * Parse a TC-selector string into a Set of TC IDs.
 * Syntax: comma-separated tokens; each token is either a single TC ID
 * (e.g. TC-CPR-OVR-045) or an inclusive numeric range (e.g. TC-CPR-OVR-001..041).
 * Range syntax: full start ID ending with a zero-padded number, "..", then the end
 * number only (prefix and zero-padding are inferred from the start ID).
 */
function parseTcSelector(selector) {
  const ids = new Set();
  for (const rawToken of selector.split(',')) {
    const token = rawToken.trim();
    if (!token) continue;
    if (!token.includes('..')) {
      ids.add(token);
      continue;
    }
    const sep = token.indexOf('..');
    const startId = token.slice(0, sep);
    const endSuffix = token.slice(sep + 2);
    const m = startId.match(/^(.*[-_])(\d+)$/);
    if (!m) throw new Error(`[xlsx-trim] range start "${startId}" must end with digits after a "-" or "_" separator`);
    const [, prefix, startDigits] = m;
    const startNum = parseInt(startDigits, 10);
    const endNum = parseInt(endSuffix, 10);
    if (isNaN(endNum)) throw new Error(`[xlsx-trim] range end "${endSuffix}" in "${token}" is not a number`);
    if (endNum < startNum) throw new Error(`[xlsx-trim] range end ${endNum} < start ${startNum} in "${token}"`);
    const pad = startDigits.length;
    for (let n = startNum; n <= endNum; n++) {
      ids.add(`${prefix}${String(n).padStart(pad, '0')}`);
    }
  }
  return ids;
}

/**
 * Within a worksheet, keep only rows whose TC ID is in tcKeepSet.
 * Continuation rows (blank TC ID + any cell has content) follow their owning TC:
 * they are kept when their owner is kept, dropped when their owner is dropped.
 * Blank separator rows (blank TC ID + all cells empty) and the SUMMARY row are
 * always kept. The TC ID column is located by name in the header row, not by index.
 * Returns the Set of TC IDs from tcKeepSet that were actually found in this sheet.
 */
function filterTcRows(ws, tcKeepSet) {
  const headerRow = ws.getRow(1);
  let tcIdColIdx = -1;
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (String(cell.value ?? '').trim() === 'TC ID') tcIdColIdx = colNumber;
  });
  if (tcIdColIdx < 0) {
    throw new Error(`[xlsx-trim] sheet "${ws.name}" has no "TC ID" header — cannot apply --tcs filter`);
  }

  const found = new Set();
  const toDelete = [];
  let currentOwnerKept = false;

  ws.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    if (rowNumber === 1) return; // header always kept
    const tcId = String(row.getCell(tcIdColIdx).value ?? '').trim();
    if (tcId === 'SUMMARY') return; // trailing summary row always kept
    if (tcId === '') {
      // Detect continuation row (has content) vs blank separator (no content).
      let hasContent = false;
      row.eachCell({ includeEmpty: false }, () => { hasContent = true; });
      if (hasContent && !currentOwnerKept) toDelete.push(rowNumber);
      // blank separator (no content) always kept; continuation of kept owner kept
      return;
    }
    // Regular TC first-row.
    if (tcKeepSet.has(tcId)) {
      currentOwnerKept = true;
      found.add(tcId);
    } else {
      currentOwnerKept = false;
      toDelete.push(rowNumber);
    }
  });

  // Delete bottom-up to preserve row numbers of earlier rows.
  for (const rn of toDelete.sort((a, b) => b - a)) ws.spliceRows(rn, 1);

  return found;
}

/**
 * Recompute Overview aggregate counts from the surviving module-sheet rows.
 * Called after --tcs filtering to keep the workbook self-consistent.
 * The Overview header row is located dynamically (first cell == 'Sheet').
 */
function recomputeOverviewCounts(wb) {
  const ov = wb.getWorksheet('Overview');
  if (!ov) return;

  // Locate the header row by its first cell value ('Sheet').
  let ovHeaderRowNum = -1;
  ov.eachRow((row, rn) => {
    if (ovHeaderRowNum !== -1) return;
    const first = String(row.getCell(1).value ?? '').trim();
    if (first === 'Sheet') ovHeaderRowNum = rn;
  });
  if (ovHeaderRowNum < 0) return;

  // Map header names to 1-based column indices in the Overview sheet.
  const ovCol = {};
  ov.getRow(ovHeaderRowNum).eachCell({ includeEmpty: true }, (cell, colNum) => {
    const name = String(cell.value ?? '').trim();
    if (name) ovCol[name] = colNum;
  });

  wb.eachSheet(ws => {
    if (ws.name === 'Overview') return;

    // Locate TC ID, Coverage Status, Automation Status columns in this sheet.
    const sheetCol = {};
    ws.getRow(1).eachCell({ includeEmpty: true }, (cell, colNum) => {
      const name = String(cell.value ?? '').trim();
      if (name) sheetCol[name] = colNum;
    });
    const tcIdCol = sheetCol['TC ID'];
    const covCol  = sheetCol['Coverage Status'];
    const execCol = sheetCol['Automation Status'];
    if (!tcIdCol || !covCol || !execCol) return;

    // Tally metrics from first-row TC entries only (skip header, continuations, SUMMARY).
    let total = 0, automated = 0, pendingAutomation = 0, manual = 0;
    let pass = 0, fail = 0, skipped = 0, blocked = 0;
    ws.eachRow({ includeEmpty: true }, (row, rn) => {
      if (rn === 1) return;
      const tcId = String(row.getCell(tcIdCol).value ?? '').trim();
      if (!tcId || tcId === 'SUMMARY') return;
      total++;
      const cov  = String(row.getCell(covCol).value ?? '').trim();
      if (cov === 'Automated')          automated++;
      else if (cov === 'Pending Automation') pendingAutomation++;
      else if (cov === 'Manual')        manual++;
      const exec = String(row.getCell(execCol).value ?? '').trim();
      if (exec === 'Pass')    pass++;
      else if (exec === 'Fail')    fail++;
      else if (exec === 'Skipped') skipped++;
      else if (exec === 'Blocked') blocked++;
    });

    // Find the Overview data row whose first cell matches this sheet name.
    let ovDataRowNum = -1;
    ov.eachRow((row, rn) => {
      if (rn <= ovHeaderRowNum || ovDataRowNum !== -1) return;
      const c = row.getCell(1).value;
      const text = c && typeof c === 'object' && 'text' in c ? String(c.text) : String(c ?? '');
      if (text.trim() === ws.name) ovDataRowNum = rn;
    });
    if (ovDataRowNum < 0) return;

    const executedDenom = total - skipped - blocked;
    const fmtPct = (num, denom) => denom > 0 ? `${((num / denom) * 100).toFixed(1)}%` : '—';

    const ovRow = ov.getRow(ovDataRowNum);
    const set = (name, val) => { if (ovCol[name]) ovRow.getCell(ovCol[name]).value = val; };
    set('Total',                total);
    set('Automated',            automated);
    set('Pending Automation',   pendingAutomation);
    set('Manual',               manual);
    set('Pass',                 pass);
    set('Fail',                 fail);
    set('Skipped',              skipped);
    set('Blocked',              blocked);
    set('% Pass of Total',      fmtPct(pass, total));
    set('% Pass of Executed',   fmtPct(pass, executedDenom));
    set('% Automation Coverage', fmtPct(automated, total));
    ovRow.commit();
  });
}

async function main() {
  const [, , xlsxPath, ...rest] = process.argv;
  if (!xlsxPath) {
    console.error('Usage: node scripts/xlsx-trim.mjs <xlsx-path> --modules=<token,...> | --sheets=<sheet,...> [--tcs=<selector>]');
    process.exit(1);
  }
  if (!existsSync(xlsxPath)) {
    console.error(`[xlsx-trim] file not found: ${xlsxPath}`);
    process.exit(1);
  }
  const modulesArg = rest.find(a => a.startsWith('--modules='));
  const sheetsArg = rest.find(a => a.startsWith('--sheets='));
  const tcsArg = rest.find(a => a.startsWith('--tcs='));
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

  // TC-row filter — applied to each surviving module sheet when --tcs is supplied.
  if (tcsArg) {
    const tcKeepSet = parseTcSelector(tcsArg.slice('--tcs='.length));
    const allFound = new Set();
    wb.eachSheet(ws => {
      if (ws.name === 'Overview') return;
      const found = filterTcRows(ws, tcKeepSet);
      for (const id of found) allFound.add(id);
    });
    // Every requested TC ID must appear in at least one sheet — absent IDs are an error.
    const notFound = [...tcKeepSet].filter(id => !allFound.has(id));
    if (notFound.length) {
      console.error(`[xlsx-trim] --tcs: TC IDs not found in any surviving sheet: ${notFound.join(', ')}`);
      process.exit(1);
    }
    console.log(`[xlsx-trim] --tcs filter: retained ${allFound.size} TC(s)`);
    // Recompute Overview aggregate counts from the surviving rows so the workbook is
    // self-consistent. A client noticing that totals disagree with visible rows is a
    // credibility problem. Choice: recompute (vs remove count columns) to preserve
    // the workbook structure the client expects.
    recomputeOverviewCounts(wb);
  }

  await wb.xlsx.writeFile(xlsxPath);
  console.log(`[xlsx-trim] kept: ${remaining.join(', ')}`);
  console.log(`[xlsx-trim] removed sheets: ${toRemove.join(', ') || '(none)'}`);
  console.log(`[xlsx-trim] Overview rows pruned for: ${[...removedSheets].join(', ') || '(none)'}`);
}

main().catch(err => { console.error('[xlsx-trim] FAIL —', err.message); process.exit(1); });
