/**
 * to-xlsx.ts — Multi-sheet XLSX workbook emitter for the Encore test-case deliverable.
 *
 * Output: `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` (the SOLE
 *   deliverable workbook — the former `_testrail.xlsx` twin + its `_gen-testrail.ts`
 *   converter were retired by PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT, 2026-06-11)
 *   - Overview sheet (13 cols, per-module quantitative summary) — first tab
 *   - module sheets (13-col TestRail step-expanded schema), one per source MD:
 *       local_office_settings, local_office_history, local_office_ect,
 *       locations_account_address, locations_auto_addon, locations_currency,
 *       locations_left_panel_basic_info, locations_legal, locations_local_information,
 *       locations_management_history, locations_notes, locations_pricing,
 *       locations_shared_setup_location  ← truncated from "..._locations" (32→31 chars; Excel limit)
 *       + corporate_pricing_* sheets (search, strategy, detail, new_pricebook, override, toolbar_io)
 *
 * Sources (post-Phase-D + 2026-05-27 post-audit cleanup):
 *   PRIMARY (sole) — `clients/encore/specs_planning/test-cases/setup/<module>/*.md`
 *                    (TC ID, Title, Module, Submodule, Status, Steps, Expected, Notes)
 *   The 'Specific Field' + 'Tags' columns were removed on 2026-06-05 (LR-ENC-004 V2):
 *   both were 100% empty across all cases. The CSV supplementary lookup + CSV_DIR
 *   const + loadCsvLookup() that once back-filled them were already dropped 2026-05-27.
 *
 * Phase A constraint: this file MUST NOT modify
 *   types.ts / markdown-parser.ts / to-json.ts / to-jira.ts / to-testmo.ts / index.ts.
 * The N1 semantic rename (Manual → Pending Automation in shared types) lands in
 * Phase A.5. Until then, this emitter remaps locally at row-emit time.
 *
 * Sheet styling (per plan Decision #7 — minimal):
 *   - Header row bold + frozen
 *   - One first-row per case (cols 1-11) + N continuation step-rows (cols 12-13)
 *   - Blank row (visual separator) + trailing summary row (bold + light-gray fill)
 *   - Column widths auto-sized
 *   - No conditional formatting, no charts, no pivots
 *
 * Build modes (selected via CLI flag):
 *   default                 — list-only SP00 augment (sub-second; Pass column =
 *                             assumed-pass for automated TCs that aren't skip/fixme)
 *   --with-run              — actual pass/fail via `npx playwright test` (slow)
 *
 * CLI: `npm run xlsx:build` / `npm run xlsx:build:with-run`
 */

import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import ExcelJS from 'exceljs';
import {
  augmentByTcId,
  AugmentData,
  AugmentMode,
  applyBlockedOverlay,
} from './sp00-augment-logic';
import { CsvConverter } from './to-csv';
import { scrubInternalVocab } from './humanize';
import { parseSteps, perStepExpected, deriveTestData, DEFAULT_TYPE, DEFAULT_PRIORITY } from './testrail-format';

// ────────────────────────── Paths ──────────────────────────

const REPO_ROOT = path.resolve(__dirname, '..');
const CLIENT_ROOT = path.join(REPO_ROOT, 'clients', 'encore');
const MD_ROOT = path.join(CLIENT_ROOT, 'specs_planning', 'test-cases', 'setup');
const XLSX_DIR = path.join(CLIENT_ROOT, 'test_cases_xlsx');
const XLSX_PATH = path.join(XLSX_DIR, 'encore_test_cases.xlsx');
const FIXME_REGISTRY = path.join(REPO_ROOT, 'reports', 'fixme-registry.json');

// ────────────────────────── Schema ──────────────────────────

// Merged TestRail step-expanded schema (PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT,
// 2026-06-11). The single deliverable now carries TestRail step-expanded
// rows/columns AND the real status columns. The FIRST row of each case carries
// cols 1-11; continuation step-rows carry ONLY 'Steps (Step)' + 'Steps (Expected
// Result)' (cols 12-13). 'Type'='Functional' / 'Priority'='Medium' are TestRail
// constants. CHECKED_COLS in scripts/xlsx-lint-rules.mjs is kept in lockstep
// (it maps the 'Steps (*)' aliases onto canonical 'Steps'/'Expected Result').
//
// COLUMN-NAME COLLISION NOTE (load-bearing — do NOT "fix" one to match the other):
// the 'Automation Status' column HERE means *execution* (Pass/Fail/Skipped/Blocked).
// The MD-grammar field also named 'Automation Status' (markdown-parser.ts:102,
// enum types.ts:98, emitted by to-jira.ts) means *coverage* (Automated / Pending
// Automation). Same words, different axis — kept user-locked on purpose.
const MODULE_SHEET_HEADERS = [
  'TC ID',
  'Title',
  'Module',
  'Submodule',
  'Test Data',
  'Type',
  'Priority',
  'Coverage Status',
  'Automation Status', // execution axis (Pass/Fail/Skipped/Blocked) — see collision note above
  'Notes / Reason',
  'Preconditions',
  'Steps (Step)',
  'Steps (Expected Result)',
] as const;

const OVERVIEW_HEADERS = [
  'Sheet',
  'Total',
  'Automated',
  'Pending Automation',
  'Manual',
  'Pass',
  'Fail',
  'Skipped',
  'Blocked',
  '% Pass of Total',
  '% Pass of Executed',
  '% Automation Coverage',
  'Last Updated',
] as const;

/** Source-MD basename (without _test_cases.md) → canonical sheet name. */
const SHEET_NAMES: Record<string, string> = {
  local_office_settings: 'local_office_settings',
  local_office_history: 'local_office_history',
  local_office_ect: 'local_office_ect',
  locations_account_address: 'locations_account_address',
  locations_auto_addon: 'locations_auto_addon',
  locations_currency: 'locations_currency',
  // Renamed 2026-06-03 (SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC): slug
  // 'locations_left_panel_basic_information' = 38 chars > Excel's 31-char limit → capped at 31.
  locations_left_panel_basic_information: 'locations_left_panel_basic_info',
  locations_legal: 'locations_legal',
  locations_local_information: 'locations_local_information',
  locations_management_history: 'locations_management_history',
  locations_notes: 'locations_notes',
  locations_pricing: 'locations_pricing',
  // PLAN DEVIATION: original "locations_shared_setup_locations" = 32 chars,
  // exceeds Excel's 31-char sheet-name limit. Truncated trailing 's' → 31 chars.
  // (Plan §234 said "31 (cap)" but that count was off-by-one.)
  locations_shared_setup_locations: 'locations_shared_setup_location',
  // Corporate Pricing sheets pinned explicitly 2026-06-11 (previously rode the
  // silent toSheetName fallback). corporate_pricing_new_pricebook is exactly 31
  // chars — at the Excel limit.
  corporate_pricing_search: 'corporate_pricing_search',
  corporate_pricing_strategy: 'corporate_pricing_strategy',
  corporate_pricing_detail: 'corporate_pricing_detail',
  corporate_pricing_new_pricebook: 'corporate_pricing_new_pricebook',
  corporate_pricing_override: 'corporate_pricing_override',
  corporate_pricing_toolbar_io: 'corporate_pricing_toolbar_io',
};

const SHEET_DISPLAY_NAMES: Record<string, string> = {
  local_office_settings: 'Local Office Settings (Basic Information)',
  local_office_history: 'Local Office Settings (History)',
  local_office_ect: 'Local Office Settings (ECT)',
  locations_account_address: 'Location — Account & Address',
  locations_auto_addon: 'Location — Auto Add-On',
  locations_currency: 'Location — Currency',
  locations_left_panel_basic_information: 'Location — Left Panel / Basic Information',
  locations_legal: 'Location — Legal',
  locations_local_information: 'Location — Local Information',
  locations_management_history: 'Location — Management History',
  locations_notes: 'Location — Notes',
  locations_pricing: 'Location — Pricing',
  locations_shared_setup_locations: 'Location — Shared Setup Locations',
  corporate_pricing_search: 'Corporate Pricing — Search',
  corporate_pricing_strategy: 'Corporate Pricing — Pricing Strategy',
  corporate_pricing_detail: 'Corporate Pricing — Pricing Detail',
  corporate_pricing_new_pricebook: 'Corporate Pricing — New Pricebook',
  corporate_pricing_override: 'Corporate Pricing — Product Group Override',
  corporate_pricing_toolbar_io: 'Corporate Pricing — Toolbar Import/Export',
};

const EXCEL_SHEET_NAME_LIMIT = 31;

// Sheet → human display submodule (e.g. 'local_information' → 'Local Information'),
// sourced from the module-codes.json registry (single source of truth). Used ONLY
// to feed perStepExpected() a clean, underscore-free submodule name for the
// synthesised middle-step expecteds — the Submodule CELL value keeps coming from
// to-csv.ts (machine name, C8-asserted), this map is display text only.
const SHEET_TO_DISPLAY_SUB: Record<string, string> = (() => {
  const raw = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'module-codes.json'), 'utf8').replace(/^﻿/, '')
  ) as { submodules: Record<string, Record<string, { display: string; sheet: string }>> };
  const out: Record<string, string> = {};
  for (const subs of Object.values(raw.submodules)) {
    for (const e of Object.values(subs)) out[e.sheet] = e.display;
  }
  return out;
})();

// ── Notes / Reason merge (PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT §Notes/Reason) ──
//
// The merged 'Notes / Reason' column composes tc.notes + tc.ifFailedReason. The
// "Blocked — " marker is the machine-detectable prefix that lint C1/C3/C5 key on;
// the NOTES_SEPARATOR delimits the reason segment from appended Notes. BOTH the
// marker regex and the separator MUST stay byte-identical to their twins in
// scripts/xlsx-lint-rules.mjs (splitNotesReason) — the lint re-derives the reason
// segment from the cell, so a drift here silently defeats C1/C3/C4/C5.
const BLOCKED_MARKER_RE = /^Blocked\s*[—–-]\s*/i;
const NOTES_SEPARATOR = '\n\nNotes: ';

/**
 * Compose the merged 'Notes / Reason' cell.
 *   both    → `Blocked — <reason>` + blank line + `Notes: <notes>`  (Blocked rows)
 *   reason  → `Blocked — <reason>`                                   (Blocked rows)
 *   notes   → `<notes>`
 *   neither → ``
 *
 * Two corrections over the plan's literal shorthand, both required for correctness:
 *  (1) MARKER IDEMPOTENCY — strip an existing leading "Blocked — " from the reason
 *      before re-applying it, or the 17 blocked-reasons.json entries that already
 *      begin with the marker would ship "Blocked — Blocked — …".
 *  (2) EXECUTION-GATED MARKER — apply "Blocked — " ONLY when the row's execution is
 *      actually 'Blocked'. The same reason field also carries Skipped reasons
 *      ("Skipped — …") and Pending-Automation env reasons ("Not yet automated — …");
 *      blindly prefixing "Blocked — " would mislabel them AND make lint C1/C3 — which
 *      tie the "Blocked — " segment to execution=Blocked — incoherent. (DEVIATION
 *      from the plan's "reason only → Blocked — <reason>"; recorded in the Execution
 *      Summary. The plan's own C1/C3 semantics demand this.)
 */
function composeNotesReason(notes: string, reason: string, execution: string): string {
  const cleanNotes = (notes || '').trim();
  // reason gets no upstream humanize pass — scrub here (matches the prior emit-time
  // scrub of the standalone reason column) BEFORE the marker is (re-)applied.
  let cleanReason = scrubInternalVocab(reason || '').trim().replace(BLOCKED_MARKER_RE, '').trim();
  const markedReason = cleanReason
    ? (execution === 'Blocked' ? `Blocked — ${cleanReason}` : cleanReason)
    : '';
  if (markedReason && cleanNotes) return `${markedReason}${NOTES_SEPARATOR}${cleanNotes}`;
  if (markedReason) return markedReason;
  if (cleanNotes) return cleanNotes;
  return '';
}

/**
 * Resolve / validate a sheet name from a basename slug. HALTs on overflow.
 * Exported for unit-tests (Phase A HARD GATE 3).
 */
export function toSheetName(basenameSlug: string): string {
  // Accept both forms — with and without the `_test_cases` suffix
  const lookupKey = basenameSlug.replace(/_test_cases$/, '');
  const mapped = SHEET_NAMES[lookupKey];
  if (mapped) {
    if (mapped.length > EXCEL_SHEET_NAME_LIMIT) {
      throw new Error(
        `Sheet name '${mapped}' is ${mapped.length} chars; Excel limit is ${EXCEL_SHEET_NAME_LIMIT}. ` +
          `Add an explicit short-code mapping for '${lookupKey}' in SHEET_NAMES.`
      );
    }
    return mapped;
  }
  // New module not in the map → use the derived slug as-is, HALT if it overflows.
  if (lookupKey.length > EXCEL_SHEET_NAME_LIMIT) {
    throw new Error(
      `[toSheetName HALT] Derived sheet name '${lookupKey}' is ${lookupKey.length} chars; ` +
        `Excel limit is ${EXCEL_SHEET_NAME_LIMIT}. Add an explicit short-code mapping ` +
        `for '${lookupKey}' in SHEET_NAMES, then regenerate.`
    );
  }
  return lookupKey;
}

// ────────────────────────── MD parser (delegated) ──────────────────────────
//
// Phase A.5 part 2 (the “list-only parser switch”): we delegate every MD→cell
// transform to `CsvConverter.convertFile` so XLSX bytes match the freshly-
// regenerated CSV bytes by construction. This:
//
//  1. Guarantees xlsx-vs-csv-parity passes (modulo the documented schema-shape
//     moduli the gate already allows for Tags / Specific Field / Coverage Status).
//  2. Eliminates the duplicate parser surface — to-csv.ts:parseSimpleFormat is
//     the single source of truth for inline-format step splitting, cleanup-into-
//     notes extraction, internal-tag stripping, and final humanization.
//  3. Survives MD drift cleanly — when MDs are re-authored, regenerating the
//     CSVs (the parity oracle) and the XLSX in the same pass keeps both deliverables
//     in lockstep until Phase D deletes CSVs.
//
// to-csv.ts stays the parity oracle (Phase D will delete it). We deliberately do
// not extend markdown-parser.ts: its existing extractSteps/extractList expect
// table / bullet-list formats and other consumers (to-jira, to-json, to-testmo)
// rely on those semantics unchanged.

interface ParsedTc {
  id: string;
  title: string;
  module: string;
  submodule: string;
  preconditions: string;
  steps: string;
  expected: string;
  notes: string;
  // Augment cols filled later
  coverageStatus: AugmentData['coverageStatus'];
  automationExecution: AugmentData['automationExecution'];
  ifFailedReason: string;
}


/**
 * Parse a single MD file into ParsedTc[] by delegating to the parity-oracle
 * (to-csv.ts:CsvConverter.convertFile). Producing the same CSV bytes from the
 * same MD source guarantees XLSX cells match the fresh-CSV cells byte-for-byte
 * (modulo schema-shape moduli already allowed by xlsx-vs-csv-parity.mjs:
 * Coverage Status rename and Yes→Automated / No→Pending Automation value remap;
 * trailing SUMMARY rows).
 *
 * (The 'Specific Field' + 'Tags' columns were removed from the deliverable on
 * 2026-06-05 — LR-ENC-004 V2 — both were 100% empty across all cases.)
 * Augment columns (Coverage Status / Automation Execution / If Failed Reason)
 * come from SP00 augment.
 */
function parseMd(filePath: string): ParsedTc[] {
  const csvText = CsvConverter.convertFile(filePath, 'human');
  const rows = parseCsv(csvText);
  if (rows.length === 0) return [];
  const header = rows[0]!;
  const idCol = header.indexOf('TC ID');
  const titleCol = header.indexOf('Title');
  const moduleCol = header.indexOf('Module');
  const submoduleCol = header.indexOf('Submodule');
  const preCol = header.indexOf('Preconditions');
  const stepsCol = header.indexOf('Steps');
  const expectedCol = header.indexOf('Expected Result');
  const notesCol = header.indexOf('Notes');
  if (idCol < 0) return [];

  const tcs: ParsedTc[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]!;
    const id = (r[idCol] ?? '').trim();
    if (!id) continue;
    // scrubInternalVocab on every customer-facing cell — strips Phase D
    // pre-audit's flagged tokens (BUG-IDs, LR-NNN, MCP-verified, SP-XXX-NN,
    // RCA dates, internal HTML TODO comments, spec-helper function calls,
    // /api/ paths, form.* idioms) per humanize.ts.
    tcs.push({
      id,
      title: scrubInternalVocab(titleCol >= 0 ? (r[titleCol] ?? '') : ''),
      module: moduleCol >= 0 ? (r[moduleCol] ?? '') : '',
      submodule: submoduleCol >= 0 ? (r[submoduleCol] ?? '') : '',
      preconditions: scrubInternalVocab(preCol >= 0 ? (r[preCol] ?? '') : ''),
      steps: scrubInternalVocab(stepsCol >= 0 ? (r[stepsCol] ?? '') : ''),
      expected: scrubInternalVocab(expectedCol >= 0 ? (r[expectedCol] ?? '') : ''),
      notes: scrubInternalVocab(notesCol >= 0 ? (r[notesCol] ?? '') : ''),
      coverageStatus: '',
      automationExecution: '',
      ifFailedReason: '',
    });
  }
  return tcs;
}

// ────────────────────────── CSV-text parser (used by parseMd) ──────────────────────────
//
// parseCsv() is shared infrastructure used by parseMd() to parse the in-memory
// CSV text emitted by CsvConverter.convertFile() (the MD→CSV parity-oracle path).
// The original loadCsvLookup() that read from disk-resident CSV files was removed
// on 2026-05-27 (post-audit cleanup) once the test_cases_csv directory was deleted.

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else inQuotes = false;
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
  while (rows.length > 0 && rows[rows.length - 1]!.length === 1 && rows[rows.length - 1]![0] === '') rows.pop();
  return rows;
}

// ────────────────────────── Workbook builder ──────────────────────────

interface SheetMetrics {
  total: number;
  automated: number;
  pendingAutomation: number;
  manual: number;
  pass: number;
  fail: number;
  skipped: number;
  blocked: number;
}

function emptyMetrics(): SheetMetrics {
  return { total: 0, automated: 0, pendingAutomation: 0, manual: 0, pass: 0, fail: 0, skipped: 0, blocked: 0 };
}

function accumulate(m: SheetMetrics, tc: ParsedTc): void {
  m.total += 1;
  if (tc.coverageStatus === 'Automated') m.automated += 1;
  else if (tc.coverageStatus === 'Pending Automation') m.pendingAutomation += 1;
  else if (tc.coverageStatus === 'Manual') m.manual += 1;
  if (tc.automationExecution === 'Pass') m.pass += 1;
  else if (tc.automationExecution === 'Fail') m.fail += 1;
  else if (tc.automationExecution === 'Skipped') m.skipped += 1;
  else if (tc.automationExecution === 'Blocked') m.blocked += 1;
}

function fmtPct(num: number, denom: number): string {
  if (denom === 0) return '—';
  return `${((num / denom) * 100).toFixed(1)}%`;
}

interface BuildOptions {
  mode: AugmentMode;
}

/**
 * MD-primary parsing path (Phase A.5+; sole operative source post-Phase-D).
 * Humanization is applied inside `parseMd()` via the shared `humanize()` helper
 * from `./humanize`, so `--list-only` and `--with-run` produce CSV-equivalent cells.
 */
function buildFromMdSource(): Map<string, ParsedTc[]> {
  const mdFiles = walkMd(MD_ROOT);
  if (mdFiles.length === 0) throw new Error(`[xlsx:build] No MD files found under ${MD_ROOT}`);

  const tcsBySheet = new Map<string, ParsedTc[]>();
  for (const file of mdFiles) {
    const baseSlug = path.basename(file).replace(/\.md$/, '').replace(/_test_cases$/, '');
    const tcs = parseMd(file);
    if (tcs.length === 0) continue;
    const sheetName = toSheetName(baseSlug); // resolver accepts both forms
    if (!tcsBySheet.has(sheetName)) tcsBySheet.set(sheetName, []);
    tcsBySheet.get(sheetName)!.push(...tcs);
  }

  // The 'Specific Field' + 'Tags' columns were removed from the deliverable on
  // 2026-06-05 (LR-ENC-004 V2) — both were 100% empty across all cases.
  return tcsBySheet;
}

async function buildWorkbook(opts: BuildOptions): Promise<{ outPath: string; sheetsBuilt: string[]; rowsPerSheet: Record<string, number> }> {
  const buildIsoDate = new Date().toISOString().slice(0, 10);
  const buildTimestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');

  // MD-primary parsing path is the sole operative path post-Phase-D
  // (2026-05-27 cleanup of PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION removed
  // `--from-csv` mode and `buildFromCsvSource()`). `list-only` and `with-run`
  // are the only valid modes; programmatic callers passing `from-csv` fall
  // through to MD-primary parsing.
  const tcsBySheet = buildFromMdSource();

  // SP00 augment — populate Coverage Status / Automation Execution / Reason for every TC ID
  const allTcIds: string[] = [];
  for (const [, tcs] of tcsBySheet) for (const tc of tcs) allTcIds.push(tc.id);
  const augment = augmentByTcId(allTcIds, {
    mode: opts.mode,
    clientRoot: CLIENT_ROOT,
    fixmeRegistryPath: FIXME_REGISTRY,
  });
  for (const [, tcs] of tcsBySheet) {
    for (const tc of tcs) {
      const a = augment.get(tc.id);
      if (!a) continue;
      tc.coverageStatus = a.coverageStatus;
      tc.automationExecution = a.automationExecution;
      tc.ifFailedReason = a.ifFailedReason;
    }
  }

  // Blocked overlay (post-Phase-A bugfix 2026-05-27). On Windows, list-only mode
  // hits the `spawnSync npx ENOENT` fallback so playwright's `kind === 'fixme'`
  // signal never reaches augment, leaving `Automation Execution` blank for blocked
  // TCs. The overlay sets execution='Blocked' + ifFailedReason from the registry.
  const overlay = applyBlockedOverlay(tcsBySheet, { repoRoot: REPO_ROOT, registryPath: FIXME_REGISTRY });
  process.stderr.write(`[xlsx:build] Blocked overlay applied to ${overlay.applied} row(s) from ${overlay.resolvedTcIds.length} registry TC(s)\n`);

  // Curated client-facing reason / disposition overrides (LR-ENC-004). COMMITTED,
  // gitignore-proof home for blocked / skipped / Manual reasons that have no other
  // committed source — replaces the GC-prone fixme-registry baseline-restoration
  // entries. Applied AFTER augment+overlay so it is authoritative; runs BEFORE the
  // Pass+reason tripwire below. Implements the "Manual" disposition (Coverage
  // Status = Manual, blank Execution + Reason) and durable blocked reasons.
  const BLOCKED_REASONS_PATH = path.join(__dirname, 'blocked-reasons.json');
  let blockedReasons: Record<string, { coverage?: string; execution?: string; reason?: string }> = {};
  try {
    blockedReasons = JSON.parse(fs.readFileSync(BLOCKED_REASONS_PATH, 'utf-8'));
  } catch (err) {
    process.stderr.write(`[xlsx:build] WARN — could not read blocked-reasons.json: ${(err as Error).message}\n`);
  }
  for (const [, tcs] of tcsBySheet) {
    for (const tc of tcs) {
      const o = blockedReasons[tc.id];
      if (!o) continue;
      if (o.coverage !== undefined) tc.coverageStatus = o.coverage as ParsedTc['coverageStatus'];
      if (o.execution !== undefined) tc.automationExecution = o.execution as ParsedTc['automationExecution'];
      if (o.reason !== undefined) tc.ifFailedReason = o.reason;
    }
  }

  // INTEGRITY TRIPWIRE (LR-ENC-004 — replaces the former `reason ⇒ set Blocked`
  // coercion at this point, per the throw-not-coerce decision). A row marked 'Pass'
  // that still carries a failure reason is a Data Integrity Exception: the upstream
  // join in sp00-augment-logic.ts mis-attributed a blocked sibling's reason to a
  // passing test. NEVER coerce it silently — fail the build so the SOURCE is fixed.
  for (const [, tcs] of tcsBySheet) {
    for (const tc of tcs) {
      if (tc.automationExecution === 'Pass' && (tc.ifFailedReason || '').trim() !== '') {
        throw new Error(
          `[Data Integrity Exception] TC ${tc.id} is marked PASS but carries a failure reason ` +
          `("${tc.ifFailedReason.slice(0, 80)}"). Upstream join bug in sp00-augment-logic.ts — ` +
          `fix the attribution at the source, do NOT coerce here.`
        );
      }
    }
  }

  // 5. Emit workbook
  const wb = new ExcelJS.Workbook();
  wb.creator = 'encore_framework xlsx:build';
  wb.created = new Date();

  const overviewRows: { sheet: string; metrics: SheetMetrics }[] = [];
  const sortedSheetNames = Array.from(tcsBySheet.keys()).sort((a, b) => orderSheets(a, b));
  const rowsPerSheet: Record<string, number> = {};

  // Overview sheet first
  const overview = wb.addWorksheet('Overview', { views: [{ state: 'frozen', ySplit: 4 }] });
  overview.addRow([`Encore Test Case Workbook — generated on ${buildTimestamp}`]);
  overview.mergeCells(1, 1, 1, OVERVIEW_HEADERS.length);
  overview.getCell(1, 1).font = { bold: true, size: 14 };
  overview.addRow([`Workbook version: encore_test_cases.xlsx`]);
  overview.mergeCells(2, 1, 2, OVERVIEW_HEADERS.length);
  overview.getCell(2, 1).font = { italic: true };
  overview.addRow([]); // spacer
  const overviewHeaderRow = overview.addRow([...OVERVIEW_HEADERS]);
  overviewHeaderRow.font = { bold: true };
  overviewHeaderRow.alignment = { vertical: 'middle', horizontal: 'left' };

  // Module sheets
  for (const sheetName of sortedSheetNames) {
    // Sort rows by TC ID so the deliverable reads in ascending ID order regardless
    // of MD source order. New cases are often spliced into the source next to a
    // thematically-related older case while taking the next free global number,
    // which leaves the source IDs out of numeric sequence (LR-ENC-004 V3). The
    // comparator is numeric-aware: 024 < 024A < 025, the NE-* sub-series groups
    // after the plain numeric block, and the non-numeric SKIP-BILLING sorts last.
    // MUST stay identical to compareTcId() in scripts/xlsx-lint-rules.mjs — the C6
    // guard re-asserts this exact order at build/commit/ship and fails on divergence.
    const tcs = tcsBySheet.get(sheetName)!;
    tcs.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
    const metrics = emptyMetrics();
    const ws = wb.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });
    const headerRow = ws.addRow([...MODULE_SHEET_HEADERS]);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'left' };

    const displaySub = SHEET_TO_DISPLAY_SUB[sheetName] ?? sheetName;
    for (const tc of tcs) {
      // accumulate ONCE per case — Overview/SUMMARY counts stay per-case even
      // though the case now spans 1 first-row + N continuation step-rows.
      accumulate(metrics, tc);

      // Test Data (client-safe, config-driven) + the merged Notes / Reason cell.
      // tc.notes / tc.steps / tc.expected are already humanized+scrubbed in parseMd;
      // composeNotesReason scrubs the reason and applies the Blocked marker.
      const testData = deriveTestData(tc.steps);
      const notesReason = composeNotesReason(tc.notes, tc.ifFailedReason, tc.automationExecution);

      let steps = parseSteps(tc.steps);
      if (steps.length === 0) steps = ['(no steps defined)'];

      steps.forEach((step, i) => {
        const isLast = i === steps.length - 1;
        const expected = perStepExpected(step, tc.expected, isLast, displaySub);
        const stepCell = `${i + 1}. ${step}`;
        ws.addRow(
          i === 0
            ? [
                tc.id,
                tc.title,
                tc.module,
                tc.submodule,
                testData,
                DEFAULT_TYPE,
                DEFAULT_PRIORITY,
                tc.coverageStatus,
                tc.automationExecution, // 'Automation Status' column = execution axis
                notesReason,
                tc.preconditions,
                stepCell,
                expected,
              ]
            // Continuation step-rows carry ONLY Steps (Step) + Steps (Expected Result).
            : ['', '', '', '', '', '', '', '', '', '', '', stepCell, expected]
        );
      });
    }

    // Blank separator
    ws.addRow([]);

    // Trailing summary row (bold + light-gray fill, same metrics as Overview entry).
    // 13-col merged schema: roll-up metrics land in the status columns; the SUMMARY
    // row is exempt from every lint check (TC ID cell == 'SUMMARY').
    const summary = ws.addRow([
      'SUMMARY',
      SHEET_DISPLAY_NAMES[mdSlugForSheet(sheetName)] ?? sheetName,
      // Module, Submodule, Test Data, Type, Priority — empty
      '', '', '', '', '',
      `Automated: ${metrics.automated} / Pending: ${metrics.pendingAutomation}`, // Coverage Status col
      `Pass:${metrics.pass} Fail:${metrics.fail} Skipped:${metrics.skipped} Blocked:${metrics.blocked}`, // Automation Status col
      `Last Updated: ${buildIsoDate}`, // Notes / Reason col
      // Preconditions, Steps (Step), Steps (Expected Result) — empty
      '', '', '',
    ]);
    summary.font = { bold: true };
    summary.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEFEFEF' }, // light gray
      };
    });

    // Autosize columns (rough — bound by 12..80)
    autoSize(ws, MODULE_SHEET_HEADERS.length);

    overviewRows.push({ sheet: sheetName, metrics });
    rowsPerSheet[sheetName] = tcs.length;
  }

  // Fill Overview data rows AFTER module sheets so hyperlinks resolve
  for (const { sheet, metrics } of overviewRows) {
    const executedDenom = metrics.total - metrics.skipped - metrics.blocked;
    const row = overview.addRow([
      sheet,
      metrics.total,
      metrics.automated,
      metrics.pendingAutomation,
      metrics.manual,
      metrics.pass,
      metrics.fail,
      metrics.skipped,
      metrics.blocked,
      fmtPct(metrics.pass, metrics.total),
      fmtPct(metrics.pass, executedDenom),
      fmtPct(metrics.automated, metrics.total),
      buildIsoDate,
    ]);
    // Hyperlink Sheet column → that sheet's A1
    const sheetCell = row.getCell(1);
    sheetCell.value = { text: sheet, hyperlink: `#'${sheet}'!A1` };
    sheetCell.font = { color: { argb: 'FF0563C1' }, underline: true };
  }
  autoSize(overview, OVERVIEW_HEADERS.length);

  // 6. Write
  if (!fs.existsSync(XLSX_DIR)) fs.mkdirSync(XLSX_DIR, { recursive: true });
  await wb.xlsx.writeFile(XLSX_PATH);

  // Build-time self-fail (LR-ENC-004): re-lint the workbook we just wrote with the
  // SAME shared rules (scripts/xlsx-lint-rules.mjs) used at commit and ship time.
  // `npm run xlsx:build` can therefore never silently emit a workbook with internal
  // vocabulary or a status/reason contradiction. Run as a subprocess to cross the
  // CJS (ts-node) → ESM (.mjs) boundary cleanly; the CLI re-reads XLSX_PATH from disk.
  const lintScript = path.join(REPO_ROOT, 'scripts', 'xlsx-vocab-lint.mjs');
  try {
    execFileSync(process.execPath, [lintScript], { stdio: 'inherit' });
  } catch {
    throw new Error(
      '[xlsx:build] self-check FAILED — the generated workbook contains banned vocabulary ' +
      'or a status/reason contradiction (see the xlsx:lint output above). Fix the SOURCE ' +
      '(MD test cases, spec test.fixme reasons, or export_test_cases/blocked-reasons.json) and rebuild.'
    );
  }

  return { outPath: XLSX_PATH, sheetsBuilt: ['Overview', ...sortedSheetNames], rowsPerSheet };
}

/** Order: Overview first (handled outside), then local_office_* alphabetical, then locations_* alphabetical. */
function orderSheets(a: string, b: string): number {
  const aLo = a.startsWith('local_office');
  const bLo = b.startsWith('local_office');
  if (aLo && !bLo) return -1;
  if (!aLo && bLo) return 1;
  return a.localeCompare(b);
}

/** Reverse-lookup: sheet name → MD slug key (for SHEET_DISPLAY_NAMES). */
function mdSlugForSheet(sheetName: string): string {
  for (const [slug, name] of Object.entries(SHEET_NAMES)) {
    if (name === sheetName) return slug;
  }
  return sheetName;
}

function autoSize(ws: ExcelJS.Worksheet, columnCount: number): void {
  for (let c = 1; c <= columnCount; c++) {
    let max = 12;
    ws.getColumn(c).eachCell({ includeEmpty: false }, cell => {
      const v = cell.value;
      let len = 0;
      if (v == null) len = 0;
      else if (typeof v === 'string') len = v.length;
      else if (typeof v === 'number') len = String(v).length;
      else if (typeof v === 'object' && 'text' in (v as any)) len = String((v as any).text).length;
      else len = String(v).length;
      if (len > max) max = len;
    });
    ws.getColumn(c).width = Math.min(max + 2, 80);
  }
}

function walkMd(dir: string): string[] {
  const acc: string[] = [];
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '_internal') continue;
      acc.push(...walkMd(full));
    } else if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('_')) {
      acc.push(full);
    }
  }
  return acc;
}

// ────────────────────────── CLI ──────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);
  let mode: AugmentMode = 'list-only';
  if (args.includes('--with-run')) mode = 'with-run';
  else if (args.includes('--list-only')) mode = 'list-only';

  // Echo augment-mode caveat per plan §192
  if (mode === 'list-only') {
    console.log(
      `[xlsx:build] mode=list-only — Pass column = assumed-pass for automated TCs that ` +
        `aren't skip/fixme. For authoritative Pass/Fail run \`npm run xlsx:build:with-run\`.`
    );
  }

  buildWorkbook({ mode })
    .then(({ outPath, sheetsBuilt, rowsPerSheet }) => {
      console.log(`[xlsx:build] OK → ${path.relative(REPO_ROOT, outPath)}`);
      console.log(`[xlsx:build] sheets: ${sheetsBuilt.length} (${sheetsBuilt.join(', ')})`);
      const totalRows = Object.values(rowsPerSheet).reduce((a, b) => a + b, 0);
      console.log(`[xlsx:build] total data rows: ${totalRows}`);
      for (const [s, n] of Object.entries(rowsPerSheet)) {
        console.log(`  ${s.padEnd(34)} ${String(n).padStart(4)} rows`);
      }
    })
    .catch(err => {
      console.error('[xlsx:build] FAIL —', err);
      process.exit(1);
    });
}
