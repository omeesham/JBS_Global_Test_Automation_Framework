/**
 * to-xlsx.ts — Multi-sheet XLSX workbook emitter for the Encore test-case deliverable.
 *
 * Output: `clients/encore/test_cases_xlsx/encore_test_cases.xlsx`
 *   - Overview sheet (12 cols, per-module quantitative summary) — first tab
 *   - 13 module sheets (13 cols, canonical schema):
 *       local_office_settings, local_office_history, local_office_ect,
 *       locations_account_address, locations_auto_addon, locations_currency,
 *       locations_left_panel, locations_legal, locations_local_information,
 *       locations_management_history, locations_notes, locations_pricing,
 *       locations_shared_setup_location  ← truncated from "..._locations" (32→31 chars; Excel limit)
 *
 * Sources (Phase A bootstrap — "local parser fork" per
 * PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION §256):
 *   PRIMARY  — `clients/encore/specs_planning/test-cases/setup/<module>/*.md`
 *              (TC ID, Title, Module, Submodule, Status, Steps, Expected, Notes)
 *   SUPPLEMENTARY  — `clients/encore/test_cases_csv/*.csv`
 *              (Specific Field, Tags — values that are not yet structured in MD;
 *               also Automated/Execution/Reason as CSV-fallback when playwright
 *               invocation fails). After Phase D deletes CSVs, sp00-augment-logic.ts
 *               must produce all augment columns; Specific Field becomes a manual
 *               column the team owns directly in XLSX (or extends MD format later).
 *
 * Phase A constraint: this file MUST NOT modify
 *   types.ts / markdown-parser.ts / to-json.ts / to-jira.ts / to-testmo.ts / index.ts.
 * The N1 semantic rename (Manual → Pending Automation in shared types) lands in
 * Phase A.5. Until then, this emitter remaps locally at row-emit time.
 *
 * Sheet styling (per plan Decision #7 — minimal):
 *   - Header row bold + frozen
 *   - Data rows N..N+1 (one TC per row)
 *   - Blank row (visual separator) + trailing summary row (bold + light-gray fill)
 *   - Column widths auto-sized
 *   - No conditional formatting, no charts, no pivots
 *
 * Build modes (selected via CLI flag):
 *   default                 — list-only SP00 augment (sub-second when playwright list works;
 *                             falls back to CSV-inherit when playwright fails)
 *   --with-run              — actual pass/fail via `npx playwright test` (slow)
 *   --from-csv              — Phase A bootstrap mode; ignores playwright entirely
 *                             and inherits augment columns from existing CSVs.
 *                             Removed in Phase D.
 *
 * CLI: `npm run xlsx:build` / `npm run xlsx:build:with-run`
 */

import * as fs from 'fs';
import * as path from 'path';
import ExcelJS from 'exceljs';
import {
  augmentByTcId,
  AugmentData,
  AugmentMode,
  applyBlockedOverlay,
} from './sp00-augment-logic';
import { humanize } from './humanize';

// ────────────────────────── Paths ──────────────────────────

const REPO_ROOT = path.resolve(__dirname, '..');
const CLIENT_ROOT = path.join(REPO_ROOT, 'clients', 'encore');
const MD_ROOT = path.join(CLIENT_ROOT, 'specs_planning', 'test-cases', 'setup');
const CSV_DIR = path.join(CLIENT_ROOT, 'test_cases_csv');
const XLSX_DIR = path.join(CLIENT_ROOT, 'test_cases_xlsx');
const XLSX_PATH = path.join(XLSX_DIR, 'encore_test_cases.xlsx');
const FIXME_REGISTRY = path.join(REPO_ROOT, 'reports', 'fixme-registry.json');

// ────────────────────────── Schema ──────────────────────────

const MODULE_SHEET_HEADERS = [
  'TC ID',
  'Title',
  'Module',
  'Submodule',
  'Specific Field',
  'Tags',
  'Preconditions',
  'Steps',
  'Expected Result',
  'Notes',
  'Coverage Status',
  'Automation Execution',
  'If Failed Reason of Failure',
] as const;

const OVERVIEW_HEADERS = [
  'Sheet',
  'Total',
  'Automated',
  'Pending Automation',
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
  locations_left_panel: 'locations_left_panel',
  locations_legal: 'locations_legal',
  locations_local_information: 'locations_local_information',
  locations_management_history: 'locations_management_history',
  locations_notes: 'locations_notes',
  locations_pricing: 'locations_pricing',
  // PLAN DEVIATION: original "locations_shared_setup_locations" = 32 chars,
  // exceeds Excel's 31-char sheet-name limit. Truncated trailing 's' → 31 chars.
  // (Plan §234 said "31 (cap)" but that count was off-by-one.)
  locations_shared_setup_locations: 'locations_shared_setup_location',
};

const SHEET_DISPLAY_NAMES: Record<string, string> = {
  local_office_settings: 'Local Office Settings (Basic Information)',
  local_office_history: 'Local Office Settings (History)',
  local_office_ect: 'Local Office Settings (ECT)',
  locations_account_address: 'Location — Account & Address',
  locations_auto_addon: 'Location — Auto Add-On',
  locations_currency: 'Location — Currency',
  locations_left_panel: 'Location — Left Panel / Basic Information',
  locations_legal: 'Location — Legal',
  locations_local_information: 'Location — Local Information',
  locations_management_history: 'Location — Management History',
  locations_notes: 'Location — Notes',
  locations_pricing: 'Location — Pricing',
  locations_shared_setup_locations: 'Location — Shared Setup Locations',
};

/** TC ID prefix → which sheet the row belongs to (for splitting the merged LO CSV). */
const LO_PREFIX_TO_SHEET: Record<string, string> = {
  BAS: 'local_office_settings',
  HIS: 'local_office_history',
  HST: 'local_office_history',
  HISL: 'local_office_history',
  ECT: 'local_office_ect',
};

const EXCEL_SHEET_NAME_LIMIT = 31;

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

// ────────────────────────── Local MD parser fork ──────────────────────────

interface ParsedTc {
  id: string;
  title: string;
  module: string;
  submodule: string;
  specificField: string; // populated from CSV (Phase A bootstrap)
  tags: string;          // populated from CSV / MD metadata table (Phase A bootstrap)
  preconditions: string;
  steps: string;
  expected: string;
  notes: string;
  // Augment cols filled later
  coverageStatus: AugmentData['coverageStatus'];
  automationExecution: AugmentData['automationExecution'];
  ifFailedReason: string;
}

/** Parse a single MD file into an array of TC records (local fork — does not import markdown-parser.ts). */
function parseMd(filePath: string): ParsedTc[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const tcs: ParsedTc[] = [];
  // Header: ## TC-XXX-YY-ZZZ: title  (also ### form)
  const sections = content.split(/^#{2,3}\s+(TC-[A-Z]+(?:-[A-Z]+)*(?:-[A-Za-z0-9]+)?):\s*/m);
  for (let i = 1; i < sections.length; i += 2) {
    const id = (sections[i] ?? '').trim();
    const body = sections[i + 1] ?? '';
    if (!id || !body) continue;

    const lines = body.trim().split('\n');
    const title = stripMarkup((lines[0] ?? '').trim());
    const { module, submodule } = deriveModuleSubmodule(id);
    const specificField = ''; // Filled from CSV later
    const tags = extractTags(body);

    // Phase A.5 (PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION): apply the shared
    // humanize() pipeline so list-only / with-run output matches the legacy
    // CSV deliverable byte-for-byte (passes xlsx-vs-csv-parity without
    // --from-csv bootstrap). `humanize` = cleanMarkdown → humanizeAssertion →
    // convertElementIdsToLabels (shared module at export_test_cases/humanize.ts,
    // extracted from to-csv.ts:383-597).
    const steps = humanize(extractStrippedField(body, 'Steps'));
    const expected = humanize(
      extractStrippedField(body, 'Expected') || extractStrippedField(body, 'Expected Result'),
    );
    const notes = humanize(extractStrippedField(body, 'Notes'));
    const preconditionsRaw =
      extractStrippedField(body, 'Preconditions') ||
      extractStrippedField(body, 'Preconditions \\(Human\\)');
    const preconditions = humanize(preconditionsRaw) || derivePreconditions(id);

    tcs.push({
      id,
      title,
      module,
      submodule,
      specificField,
      tags,
      preconditions,
      steps,
      expected,
      notes,
      coverageStatus: '',
      automationExecution: '',
      ifFailedReason: '',
    });
  }
  return tcs;
}

/** Pull a bold-labelled field value: `**Field**: value` until next bold field / separator / new TC. */
function extractStrippedField(body: string, field: string): string {
  const re = new RegExp(
    `(?:\\*\\*)?${field}(?:\\*\\*)?:\\s*([\\s\\S]+?)(?=\\n\\s*(?:\\*\\*)?[A-Z][A-Za-z _()]*?(?:\\*\\*)?:|\\n---|\\n##|$)`,
    'i'
  );
  const m = body.match(re);
  if (!m || !m[1]) return '';
  return stripMarkup(m[1].trim());
}

function extractTags(body: string): string {
  // Some modules carry a Tags column in the 3-col metadata table. We look only at the
  // top metadata table (the one right after the TC header). If absent → empty.
  const tableMatch = body.match(/\|([^\n]*?)\|\s*\n\|[\-\s|]+\|\s*\n\|([^\n]+)\|/);
  if (!tableMatch) return '';
  const headerCells = tableMatch[1]!.split('|').map(s => s.trim()).filter(s => s.length > 0);
  const valueCells = tableMatch[2]!.split('|').map(s => s.trim()).filter(s => s.length > 0);
  const tagsIdx = headerCells.findIndex(h => h.toLowerCase() === 'tags');
  if (tagsIdx < 0 || tagsIdx >= valueCells.length) return '';
  return valueCells[tagsIdx] ?? '';
}

function stripMarkup(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[✅✔✓⚠️❌]/gu, '')
    .replace(/→/g, '->')
    .replace(/[—–]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .trim();
}

function deriveModuleSubmodule(id: string): { module: string; submodule: string } {
  // TC-LOC-CUR-001 → locations / currency
  // TC-LOS-BAS-001 → local-office / basic_information
  // TC-LOS-HIS-001 → local-office / history
  // TC-LOS-ECT-001 → local-office / ect_settings
  const m = id.match(/^TC-([A-Z]+)-([A-Z]+)-/);
  if (!m) return { module: 'unknown', submodule: 'unknown' };
  const moduleCode = m[1]!;
  const subCode = m[2]!;
  const moduleMap: Record<string, string> = { LOC: 'locations', LOS: 'local-office' };
  const subMap: Record<string, string> = {
    CUR: 'currency',
    PRI: 'pricing',
    PRC: 'pricing',
    LI: 'local_information',
    LCL: 'local_information',
    ACC: 'account_address',
    LGL: 'legal',
    NTS: 'notes',
    LP: 'left_panel',
    SSL: 'shared_setup_locations',
    AAO: 'auto_addon',
    MGH: 'management_history',
    BAS: 'basic_information',
    HIS: 'history',
    HST: 'history',
    ECT: 'ect_settings',
    HIST: 'history_integration',
    HISL: 'history_integration',
  };
  return {
    module: moduleMap[moduleCode] ?? moduleCode.toLowerCase(),
    submodule: subMap[subCode] ?? subCode.toLowerCase(),
  };
}

function derivePreconditions(id: string): string {
  if (id.startsWith('TC-LOC')) return 'Office 1604 is open in Navigator.';
  if (id.startsWith('TC-LOS')) return 'Local Office Settings page is open (Office 1604).';
  return '';
}

// ────────────────────────── CSV supplementary lookup ──────────────────────────

interface CsvLookup {
  specificFieldByTcId: Map<string, string>;
  tagsByTcId: Map<string, string>;
  /** TC IDs encountered in CSVs but missing from MD — surfaces drift. */
  orphanedInCsv: Set<string>;
}

function loadCsvLookup(): CsvLookup {
  const specificFieldByTcId = new Map<string, string>();
  const tagsByTcId = new Map<string, string>();
  const allCsvIds = new Set<string>();
  if (!fs.existsSync(CSV_DIR)) {
    return { specificFieldByTcId, tagsByTcId, orphanedInCsv: new Set() };
  }
  for (const f of fs.readdirSync(CSV_DIR)) {
    if (!f.endsWith('.csv')) continue;
    const text = fs.readFileSync(path.join(CSV_DIR, f), 'utf-8').replace(/^﻿/, '');
    const rows = parseCsv(text);
    if (rows.length === 0) continue;
    const header = rows[0]!;
    const idCol = header.indexOf('TC ID');
    const specificFieldCol = header.indexOf('Specific Field');
    const tagsCol = header.indexOf('Tags');
    if (idCol < 0) continue;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]!;
      const id = row[idCol];
      if (!id) continue;
      allCsvIds.add(id);
      if (specificFieldCol >= 0) specificFieldByTcId.set(id, (row[specificFieldCol] ?? '').trim());
      if (tagsCol >= 0) tagsByTcId.set(id, (row[tagsCol] ?? '').trim());
    }
  }
  return { specificFieldByTcId, tagsByTcId, orphanedInCsv: allCsvIds };
}

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
  pass: number;
  fail: number;
  skipped: number;
  blocked: number;
}

function emptyMetrics(): SheetMetrics {
  return { total: 0, automated: 0, pendingAutomation: 0, pass: 0, fail: 0, skipped: 0, blocked: 0 };
}

function accumulate(m: SheetMetrics, tc: ParsedTc): void {
  m.total += 1;
  if (tc.coverageStatus === 'Automated') m.automated += 1;
  else if (tc.coverageStatus === 'Pending Automation') m.pendingAutomation += 1;
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

/** Phase A bootstrap: emit XLSX rows directly from existing CSVs (every cell from CSV). */
function buildFromCsvSource(): Map<string, ParsedTc[]> {
  const tcsBySheet = new Map<string, ParsedTc[]>();
  if (!fs.existsSync(CSV_DIR)) {
    throw new Error(
      `[xlsx:build] from-csv mode requires CSVs to exist at ${CSV_DIR}. ` +
        `Phase D removed them — switch mode to list-only or with-run.`
    );
  }
  const csvFiles = fs.readdirSync(CSV_DIR).filter(f => f.endsWith('.csv'));
  for (const f of csvFiles) {
    const text = fs.readFileSync(path.join(CSV_DIR, f), 'utf-8').replace(/^﻿/, '');
    const rows = parseCsv(text);
    if (rows.length === 0) continue;
    const header = rows[0]!;
    const idCol = header.indexOf('TC ID');
    const titleCol = header.indexOf('Title');
    const moduleCol = header.indexOf('Module');
    const submoduleCol = header.indexOf('Submodule');
    const specificFieldCol = header.indexOf('Specific Field');
    const tagsCol = header.indexOf('Tags');
    const preCol = header.indexOf('Preconditions');
    const stepsCol = header.indexOf('Steps');
    const expectedCol = header.indexOf('Expected Result');
    const notesCol = header.indexOf('Notes');
    const automatedCol = header.indexOf('Automated');
    const execCol = header.indexOf('Automation Execution');
    const reasonCol = header.indexOf('If Failed Reason of Failure');
    if (idCol < 0) continue;

    const baseSlug = f.replace(/\.csv$/, '');
    const isMergedLo = baseSlug === 'local_office_settings_test_cases';

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i]!;
      const id = (r[idCol] ?? '').trim();
      if (!id) continue;
      const automatedVal = automatedCol >= 0 ? (r[automatedCol] ?? '').trim() : '';
      const coverageStatus: ParsedTc['coverageStatus'] =
        automatedVal === 'Yes' ? 'Automated' : automatedVal === 'No' ? 'Pending Automation' : '';
      const execRaw = execCol >= 0 ? (r[execCol] ?? '').trim() : '';
      const automationExecution: ParsedTc['automationExecution'] =
        execRaw === 'Pass' || execRaw === 'Fail' || execRaw === 'Skipped' || execRaw === 'Blocked' ? execRaw : '';
      const tc: ParsedTc = {
        id,
        title: titleCol >= 0 ? (r[titleCol] ?? '') : '',
        module: moduleCol >= 0 ? (r[moduleCol] ?? '') : '',
        submodule: submoduleCol >= 0 ? (r[submoduleCol] ?? '') : '',
        specificField: specificFieldCol >= 0 ? (r[specificFieldCol] ?? '') : '',
        tags: tagsCol >= 0 ? (r[tagsCol] ?? '') : '',
        preconditions: preCol >= 0 ? (r[preCol] ?? '') : '',
        steps: stepsCol >= 0 ? (r[stepsCol] ?? '') : '',
        expected: expectedCol >= 0 ? (r[expectedCol] ?? '') : '',
        notes: notesCol >= 0 ? (r[notesCol] ?? '') : '',
        coverageStatus,
        automationExecution,
        ifFailedReason: reasonCol >= 0 ? (r[reasonCol] ?? '') : '',
      };

      // Resolve which sheet this TC lands on
      let sheetName: string;
      if (isMergedLo) {
        const m = id.match(/^TC-LOS-([A-Z]+)-/);
        const prefix = m ? m[1]! : '';
        sheetName = LO_PREFIX_TO_SHEET[prefix] ?? 'local_office_settings';
      } else {
        sheetName = toSheetName(baseSlug);
      }
      if (!tcsBySheet.has(sheetName)) tcsBySheet.set(sheetName, []);
      tcsBySheet.get(sheetName)!.push(tc);
    }
  }
  return tcsBySheet;
}

/**
 * Phase A.5+ MD-primary parsing path. Humanization is applied inside
 * `parseMd()` via the shared `humanize()` helper from `./humanize`, so
 * `--list-only` and `--with-run` produce CSV-equivalent cells.
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

  // CSV supplementary lookup (Specific Field + Tags) — until MD format extends to carry them
  const csvLookup = loadCsvLookup();
  for (const [, tcs] of tcsBySheet) {
    for (const tc of tcs) {
      const sf = csvLookup.specificFieldByTcId.get(tc.id);
      if (sf) tc.specificField = sf;
      const tagsCsv = csvLookup.tagsByTcId.get(tc.id);
      if (tagsCsv && !tc.tags) tc.tags = tagsCsv;
      csvLookup.orphanedInCsv.delete(tc.id);
    }
  }
  if (csvLookup.orphanedInCsv.size > 0) {
    process.stderr.write(
      `[xlsx:build] WARN — ${csvLookup.orphanedInCsv.size} CSV TC IDs not found in MDs: ` +
        `${Array.from(csvLookup.orphanedInCsv).slice(0, 5).join(', ')}` +
        (csvLookup.orphanedInCsv.size > 5 ? `, ...` : '') +
        `\n`
    );
  }
  return tcsBySheet;
}

async function buildWorkbook(opts: BuildOptions): Promise<{ outPath: string; sheetsBuilt: string[]; rowsPerSheet: Record<string, number> }> {
  const buildIsoDate = new Date().toISOString().slice(0, 10);
  const buildTimestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');

  let tcsBySheet: Map<string, ParsedTc[]>;
  if (opts.mode === 'from-csv') {
    // Phase A bootstrap: emit XLSX directly from CSVs.
    // Rationale: the CSV is the canonical state of the deliverable today (post-SP00 humanization);
    // the to-csv.ts emitter applied cleanMarkdown + humanizeAssertion transforms that turn raw MD
    // into client-readable text. Re-parsing MDs here would lose that humanization and fail the
    // xlsx-vs-csv-parity HARD GATE. Until Phase A.5/B port the humanization layer into to-xlsx.ts
    // (or sp00-augment-logic.ts) directly, CSV-sourced builds are the safest path. Phase D removes
    // CSVs; at that point the workflow must switch to MD-based parsing with humanization inlined.
    tcsBySheet = buildFromCsvSource();

    // Blocked overlay (post-Phase-A bugfix 2026-05-27) — CSV has no 'Blocked' column, but
    // fixme-registry.json knows about 28 distinct TCs intentionally not running (12 Cat-A +
    // 12 NOT-AUTOMATABLE in location-local-information, 4 FIXME-CALL in shared-setup-locations
    // and notes). Overlay sets automationExecution='Blocked' + ifFailedReason from registry.
    // Leaves all other CSV-sourced cells untouched. xlsx-vs-csv-parity allows this modulo.
    const overlay = applyBlockedOverlay(tcsBySheet, { repoRoot: REPO_ROOT, registryPath: FIXME_REGISTRY });
    process.stderr.write(`[xlsx:build] Blocked overlay applied to ${overlay.applied} row(s) from ${overlay.resolvedTcIds.length} registry TC(s)\n`);
  } else {
    // list-only / with-run: MD-primary parsing path (Phase A.5+).
    tcsBySheet = buildFromMdSource();

    // SP00 augment — populate Coverage Status / Automation Execution / Reason for every TC ID
    const allTcIds: string[] = [];
    for (const [, tcs] of tcsBySheet) for (const tc of tcs) allTcIds.push(tc.id);
    const augment = augmentByTcId(allTcIds, {
      mode: opts.mode,
      clientRoot: CLIENT_ROOT,
      csvDir: CSV_DIR,
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
  overview.addRow([`Encore Test Case Workbook — generated on ${buildTimestamp} (mode: ${opts.mode})`]);
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
    const tcs = tcsBySheet.get(sheetName)!;
    const metrics = emptyMetrics();
    const ws = wb.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });
    const headerRow = ws.addRow([...MODULE_SHEET_HEADERS]);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'left' };

    for (const tc of tcs) {
      accumulate(metrics, tc);
      ws.addRow([
        tc.id,
        tc.title,
        tc.module,
        tc.submodule,
        tc.specificField,
        tc.tags,
        tc.preconditions,
        tc.steps,
        tc.expected,
        tc.notes,
        tc.coverageStatus,
        tc.automationExecution,
        tc.ifFailedReason,
      ]);
    }

    // Blank separator
    ws.addRow([]);

    // Trailing summary row (bold + light-gray fill, same metrics as Overview entry)
    const summary = ws.addRow([
      'SUMMARY',
      SHEET_DISPLAY_NAMES[mdSlugForSheet(sheetName)] ?? sheetName,
      '', '', '', '', '', '', '', '',
      `Automated: ${metrics.automated} / Pending: ${metrics.pendingAutomation}`,
      `Pass:${metrics.pass} Fail:${metrics.fail} Skipped:${metrics.skipped} Blocked:${metrics.blocked}`,
      `Last Updated: ${buildIsoDate}`,
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
  else if (args.includes('--from-csv')) mode = 'from-csv';
  else if (args.includes('--list-only')) mode = 'list-only';

  // Echo augment-mode caveat per plan §192
  if (mode === 'list-only') {
    console.log(
      `[xlsx:build] mode=list-only — Pass column = assumed-pass for automated TCs that ` +
        `aren't skip/fixme. For authoritative Pass/Fail run \`npm run xlsx:build:with-run\`.`
    );
  } else if (mode === 'from-csv') {
    console.log(
      `[xlsx:build] mode=from-csv — augment columns inherited verbatim from current CSVs ` +
        `(Phase A bootstrap). Switch to list-only / with-run once Phase D removes CSVs.`
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
