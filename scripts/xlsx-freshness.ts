#!/usr/bin/env ts-node
/**
 * xlsx-freshness.ts — content freshness + reproducibility gate for the Encore
 * deliverable workbook (clients/encore/test_cases_xlsx/encore_test_cases.xlsx).
 *
 * Replaces the prior MTIME check, which only compared source-MD file timestamps and
 * was blind to spec changes, builder changes, and "workbook committed but its builder
 * left uncommitted" — i.e. all three real drift incidents the deliverable has hit:
 *   1. coverage staleness  (workbook built before the specs existed)
 *   2. notes-leak          (workbook built by an old pre-declutter builder)
 *   3. unreproducible source (workbook built from an uncommitted builder)
 *
 * The single invariant that catches all three: a fresh rebuild from committed source
 * must equal the committed workbook. Two checks enforce it.
 *
 *   Check A (staleness) — rebuild the workbook from the working-tree source to a temp
 *     file and diff the module-sheet DATA rows against the committed workbook. The
 *     Overview sheet and every SUMMARY row are skipped (they carry the build date — the
 *     only non-deterministic cells); module data rows have no timestamps, so the compare
 *     is deterministic. Any cell diff ⇒ the committed workbook does not reflect current
 *     source ⇒ FAIL (rebuild + restage).
 *
 *   Check B (reproducibility) — the workbook's generator sources (the builder + the
 *     export_test_cases pipeline it imports + blocked-reasons.json) must have NO
 *     UNSTAGED changes. A workbook built from a dirty/uncommitted generator cannot be
 *     reproduced from committed source ⇒ FAIL. (Staged generator changes are fine — they
 *     are being committed alongside the workbook.)
 *
 * Exit 0 = fresh + reproducible. Exit 1 = stale or non-reproducible. Exit 2 = infra error.
 *
 * Wired into .githooks/pre-commit + .githooks/pre-push (npm run xlsx:freshness).
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execFileSync } from 'child_process';
import ExcelJS from 'exceljs';
import { buildWorkbook } from '../export_test_cases/to-xlsx';

const REPO_ROOT = path.resolve(__dirname, '..');
const XLSX_PATH = path.join(REPO_ROOT, 'clients', 'encore', 'test_cases_xlsx', 'encore_test_cases.xlsx');
const MODULE_COL_COUNT = 13; // merged TestRail step-expanded schema width

// Generator sources the committed workbook is built from. An uncommitted change to any
// of these means the committed workbook cannot be reproduced from committed source.
const GENERATOR_SOURCES = [
  'export_test_cases/to-xlsx.ts',
  'export_test_cases/to-csv.ts',
  'export_test_cases/markdown-parser.ts',
  'export_test_cases/humanize.ts',
  'export_test_cases/testrail-format.ts',
  'export_test_cases/sp00-augment-logic.ts',
  'export_test_cases/blocked-reasons.json',
];

/**
 * Read a workbook's module sheets into Map<sheetName, rows>, where each row is a fixed
 * 13-cell string array. Includes the header row (catches a column-order drift); skips the
 * Overview sheet, SUMMARY rows, and the blank separator rows.
 */
async function readModuleRows(file: string): Promise<Map<string, string[][]>> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  const out = new Map<string, string[][]>();
  for (const ws of wb.worksheets) {
    if (ws.name === 'Overview') continue;
    const rows: string[][] = [];
    ws.eachRow((row) => {
      const cells: string[] = [];
      for (let c = 1; c <= MODULE_COL_COUNT; c++) {
        let v: unknown = row.getCell(c).value;
        if (v && typeof v === 'object' && 'text' in (v as Record<string, unknown>)) {
          v = (v as { text: unknown }).text;
        }
        cells.push(v == null ? '' : String(v).trim());
      }
      if (cells[0] === 'SUMMARY') return;       // carries Last Updated: <date>
      if (cells.every((x) => x === '')) return; // blank separator row
      rows.push(cells);
    });
    out.set(ws.name, rows);
  }
  return out;
}

/** Diff two module-row maps. Returns human-readable diff lines (empty array = identical). */
export function diffRows(committed: Map<string, string[][]>, rebuilt: Map<string, string[][]>): string[] {
  const diffs: string[] = [];
  const sheets = new Set([...committed.keys(), ...rebuilt.keys()]);
  for (const sheet of sheets) {
    const a = committed.get(sheet);
    const b = rebuilt.get(sheet);
    if (!a) { diffs.push(`sheet '${sheet}' is in the rebuild but not the committed workbook`); continue; }
    if (!b) { diffs.push(`sheet '${sheet}' is in the committed workbook but not the rebuild`); continue; }
    if (a.length !== b.length) {
      diffs.push(`sheet '${sheet}': ${a.length} committed row(s) vs ${b.length} rebuilt`);
      continue;
    }
    for (let i = 0; i < a.length; i++) {
      const ra = a[i]!, rb = b[i]!;
      for (let c = 0; c < MODULE_COL_COUNT; c++) {
        if ((ra[c] ?? '') !== (rb[c] ?? '')) {
          const tcId = ra[0] || rb[0] || `row ${i + 1}`;
          diffs.push(`sheet '${sheet}' ${tcId} col ${c + 1}: committed="${(ra[c] ?? '').slice(0, 50)}" rebuilt="${(rb[c] ?? '').slice(0, 50)}"`);
          if (diffs.length >= 30) return diffs;
        }
      }
    }
  }
  return diffs;
}

/** Generator sources with UNSTAGED working-tree changes (staged changes are OK — being committed). */
function unstagedGenerators(): string[] {
  const out = execFileSync('git', ['diff', '--name-only', '--', ...GENERATOR_SOURCES], {
    cwd: REPO_ROOT,
    encoding: 'utf-8',
  });
  return out.split(/\r?\n/).filter(Boolean);
}

/** Self-test: the row-diff detector must flag a one-cell change and pass identical input. */
function assertDiffDetectorWorks(): void {
  const base = new Map<string, string[][]>([['s', [Array(MODULE_COL_COUNT).fill('').map((_, i) => (i === 7 ? 'Automated' : `c${i}`))]]]);
  const same = new Map<string, string[][]>([['s', [Array(MODULE_COL_COUNT).fill('').map((_, i) => (i === 7 ? 'Automated' : `c${i}`))]]]);
  const changed = new Map<string, string[][]>([['s', [Array(MODULE_COL_COUNT).fill('').map((_, i) => (i === 7 ? 'Pending Automation' : `c${i}`))]]]);
  if (diffRows(base, same).length !== 0) throw new Error('xlsx-freshness self-test FAILED: identical rows flagged as different');
  if (diffRows(base, changed).length === 0) throw new Error('xlsx-freshness self-test FAILED: a changed cell was not detected');
}

async function main(): Promise<number> {
  assertDiffDetectorWorks();

  if (!fs.existsSync(XLSX_PATH)) {
    console.error(`[xlsx-freshness] FAIL — workbook missing at ${path.relative(REPO_ROOT, XLSX_PATH)}; run \`npm run xlsx:build\`.`);
    return 1;
  }

  let ok = true;

  // ── Check A — rebuild from working-tree source to a temp file, diff module rows ──
  const tmp = path.join(os.tmpdir(), `encore-xlsx-freshness-${process.pid}.xlsx`);
  try {
    await buildWorkbook({ mode: 'list-only', outPath: tmp, selfCheck: false });
    const [committed, rebuilt] = await Promise.all([readModuleRows(XLSX_PATH), readModuleRows(tmp)]);
    const diffs = diffRows(committed, rebuilt);
    if (diffs.length > 0) {
      ok = false;
      console.error(`[xlsx-freshness] Check A FAIL — committed workbook does not match a fresh rebuild (${diffs.length} diff${diffs.length === 1 ? '' : 's'}):`);
      for (const d of diffs.slice(0, 20)) console.error(`  ${d}`);
      if (diffs.length > 20) console.error(`  … +${diffs.length - 20} more`);
      console.error('[xlsx-freshness] Fix: `npm run xlsx:build`, then stage the rebuilt workbook.');
    } else {
      console.log('[xlsx-freshness] Check A OK — committed workbook matches a fresh rebuild (all module rows).');
    }
  } finally {
    try { fs.unlinkSync(tmp); } catch { /* best effort */ }
  }

  // ── Check B — generators must be committed (workbook reproducible from HEAD) ──
  const dirty = unstagedGenerators();
  if (dirty.length > 0) {
    ok = false;
    console.error('[xlsx-freshness] Check B FAIL — workbook generators have uncommitted changes, so the shipped workbook is not reproducible from committed source:');
    for (const f of dirty) console.error(`  ${f}`);
    console.error('[xlsx-freshness] Fix: commit the generator change(s) alongside the rebuilt workbook.');
  } else {
    console.log('[xlsx-freshness] Check B OK — workbook generators are clean (no unstaged changes).');
  }

  return ok ? 0 : 1;
}

if (require.main === module) {
  main()
    .then((code) => process.exit(code))
    .catch((err) => {
      console.error(`[xlsx-freshness] infra error: ${(err as Error).message}`);
      process.exit(2);
    });
}
