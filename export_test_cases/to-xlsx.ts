/**
 * to-xlsx.ts — Multi-sheet XLSX workbook emitter for the Encore test-case deliverable.
 *
 * Output: `clients/encore/testcases/encore_test_cases.xlsx` (the SOLE
 *   deliverable workbook — the former `_testrail.xlsx` twin + its `_gen-testrail.ts`
 *   converter were retired by PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT, 2026-06-11)
 *   - Overview sheet (13 cols, per-module quantitative summary) — first tab
 *   - module sheets (13-col TestRail step-expanded schema), one per source MD:
 *       local_office_settings, local_office_history, local_office_ect,
 *       locations_account_address, locations_auto_addon, locations_currency,
 *       locations_left_panel_basic_info, locations_legal, locations_local_information,
 *       locations_management_history, locations_notes, locations_pricing,
 *       locations_shared_setup_location  ← truncated from "..._locations" (32→31 chars; Excel limit)
 *       + corporate_pricing_* sheets (search, strategy, detail, new_pricebook, loc_export, export_all, loc_import, import_all)
 *       + corporate_override_* sheets (core, loc_picker, filters, grid_sort, labor_grid, export, import) — group split from corporate-pricing (59C/59D)
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
 *   - One first-row per case (cols 1-12 + reason at col 13) + N continuation
 *     step-rows (Steps at cols 11-12; trailing Notes / Reason col 13 blank)
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

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import {
  augmentByTcId,
  AugmentData,
  AugmentMode,
  applyBlockedOverlay,
} from './sp00-augment-logic';
import { CsvConverter } from './to-csv';
import { scrubInternalVocab } from './humanize';
import { parseSteps, deriveTestData, DEFAULT_TYPE, DEFAULT_PRIORITY } from './testrail-format';

// Fixed epoch stamped into every workbook's metadata (docProps/core.xml) AND every zip
// entry header, so rebuilding an unchanged corpus is byte-identical (NM-2253, 2026-09-02).
// ExcelJS serializes via JSZip, which stamps every entry's DOS mod-time with `new Date()`
// at write time; two builds seconds apart otherwise differ at offset 10 (the mod-time
// field), dirtying all ~40 committed workbooks whenever any single module changes.
const DETERMINISTIC_TIMESTAMP = new Date('2020-01-01T00:00:00.000Z');

// ────────────────────────── Paths ──────────────────────────

const REPO_ROOT = path.resolve(__dirname, '..');
const CLIENT_ROOT = path.join(REPO_ROOT, 'clients', 'encore');
const MD_ROOT = path.join(CLIENT_ROOT, 'specs_planning', 'test-cases', 'setup');
const XLSX_DIR = path.join(CLIENT_ROOT, 'testcases');
const XLSX_PATH = path.join(XLSX_DIR, 'encore_test_cases.xlsx');
const FIXME_REGISTRY = path.join(REPO_ROOT, 'reports', 'fixme-registry.json');

// ────────────────────────── Schema ──────────────────────────

// Merged TestRail step-expanded schema (PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT,
// 2026-06-11; 'Notes / Reason' moved to the LAST column by
// PLAN_DELIVERABLE_NOTES_REASON_DECLUTTER, 2026-06-11). The single deliverable
// carries TestRail step-expanded rows/columns AND the real status columns. The
// FIRST row of each case carries cols 1-12 (including the reason at col 13);
// continuation step-rows carry ONLY 'Steps (Step)' + 'Steps (Expected Result)'
// (cols 11-12), with a blank trailing 'Notes / Reason' (col 13) by construction.
// 'Type'='Functional' / 'Priority'='Medium' are TestRail constants. CHECKED_COLS in
// scripts/xlsx-lint-rules.mjs is kept in lockstep (same column order; it maps the
// 'Steps (*)' aliases onto canonical 'Steps'/'Expected Result').
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
  'Preconditions',
  'Steps (Step)',
  'Steps (Expected Result)',
  'Notes / Reason', // execution-reason channel — reason-only, last column (declutter plan)
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
  corporate_pricing_loc_export: 'corporate_pricing_loc_export',
  corporate_pricing_export_all: 'corporate_pricing_export_all',
  corporate_pricing_loc_import: 'corporate_pricing_loc_import',
  corporate_pricing_import_all: 'corporate_pricing_import_all',
  // Corporate Override sheets (group split from corporate-pricing, 59C/59D)
  corporate_override_core: 'corporate_override_core',
  corporate_override_location_picker: 'corporate_override_loc_picker',
  corporate_override_filters: 'corporate_override_filters',
  corporate_override_grid_sort: 'corporate_override_grid_sort',
  corporate_override_labor_grid: 'corporate_override_labor_grid',
  corporate_override_export: 'corporate_override_export',
  corporate_override_import: 'corporate_override_import',
  // Terms and Conditions
  terms_conditions_core: 'terms_conditions_core',
  // Service Charge Text
  service_charge_text_core: 'service_charge_text_core',
  // Added 2026-08-10 (NM-3344 Service Charge): slug
  // 'service_charge_basic_information' = 32 chars > Excel's 31-char limit → shortened
  // 'information' → 'info' (25 chars). Mirrors the `sheet` value registered for
  // SVC/BAS in export_test_cases/module-codes.json.
  // Both Discount Matrix tab names exceed Excel's 31-char sheet limit — shortened to match the
  // `sheet` values already registered in module-codes.json (and its sheetNameNotes entries).
  discount_matrix_region_weekly_peaks: 'discount_matrix_region_peaks',
  discount_matrix_location_activation: 'discount_matrix_loc_activation',
  service_charge_basic_information: 'service_charge_basic_info',
  service_charge_history: 'service_charge_history',
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
  corporate_pricing_loc_export: 'Corporate Pricing — Loc Pricing Export',
  corporate_pricing_export_all: 'Corporate Pricing — Export All',
  corporate_pricing_loc_import: 'Corporate Pricing — Loc Pricing Import',
  corporate_pricing_import_all: 'Corporate Pricing — Import All',
  // Corporate Override
  corporate_override_core: 'Corporate Override — Core',
  corporate_override_location_picker: 'Corporate Override — Location Picker',
  corporate_override_filters: 'Corporate Override — Active and Currency Filters',
  corporate_override_grid_sort: 'Corporate Override — Grid Text Filter and Sort',
  corporate_override_labor_grid: 'Corporate Override — Labor Grid',
  corporate_override_export: 'Corporate Override — Export',
  corporate_override_import: 'Corporate Override — Import',
  // Terms and Conditions
  terms_conditions_core: 'Terms and Conditions — Core',
  // Service Charge Text
  service_charge_text_core: 'Service Charge Text — Core',
  // Service Charge
  discount_matrix_criteria: 'Discount Matrix — Search Criteria',
  discount_matrix_region_weekly_peaks: 'Discount Matrix — Region Weekly Peaks',
  discount_matrix_location_activation: 'Discount Matrix — Location Activation',
  service_charge_basic_information: 'Service Charge — Basic Information',
  service_charge_history: 'Service Charge — History',
  // Item Search (NM-2253)
  item_search_product_search: 'Item Search — Product Search',
  item_search_product_code: 'Item Search — Product Code',
  item_search_product_groups: 'Item Search — Product Groups',
};

/** Sheet name → split-file group/stem for the `testcases/<group>/<stem>.xlsx` tree. */
const SPLIT_FILE_MAP: Record<string, { group: string; stem: string }> = {
  // Corporate Pricing
  corporate_pricing_detail: { group: 'corporate-pricing', stem: 'corporate-pricing-detail' },
  corporate_pricing_export_all: { group: 'corporate-pricing', stem: 'corporate-pricing-export-all' },
  corporate_pricing_import_all: { group: 'corporate-pricing', stem: 'corporate-pricing-import-all' },
  corporate_pricing_loc_export: { group: 'corporate-pricing', stem: 'corporate-pricing-loc-export' },
  corporate_pricing_loc_import: { group: 'corporate-pricing', stem: 'corporate-pricing-loc-import' },
  corporate_pricing_new_pricebook: { group: 'corporate-pricing', stem: 'corporate-pricing-new-pricebook' },
  corporate_pricing_override: { group: 'corporate-pricing', stem: 'corporate-pricing-override' },
  corporate_pricing_search: { group: 'corporate-pricing', stem: 'corporate-pricing-search' },
  corporate_pricing_strategy: { group: 'corporate-pricing', stem: 'corporate-pricing-strategy' },
  // Locations
  locations_account_address: { group: 'locations', stem: 'location-account-address' },
  locations_auto_addon: { group: 'locations', stem: 'location-auto-addon' },
  locations_left_panel_basic_info: { group: 'locations', stem: 'location-left-panel-basic-information' },
  locations_legal: { group: 'locations', stem: 'location-legal' },
  locations_notes: { group: 'locations', stem: 'location-notes' },
  locations_shared_setup_location: { group: 'locations', stem: 'location-shared-setup-locations' },
  locations_currency: { group: 'locations', stem: 'location-currency' },
  locations_local_information: { group: 'locations', stem: 'location-local-information' },
  locations_management_history: { group: 'locations', stem: 'location-management-history' },
  locations_pricing: { group: 'locations', stem: 'location-pricing' },
  // Local Office
  local_office_settings: { group: 'local-office', stem: 'local-office-settings' },
  local_office_history: { group: 'local-office', stem: 'local-office-history' },
  local_office_ect: { group: 'local-office', stem: 'local-office-ect' },
  // Corporate Override
  corporate_override_core: { group: 'corporate-override', stem: 'corporate-override-core' },
  corporate_override_loc_picker: { group: 'corporate-override', stem: 'corporate-override-location-picker' },
  corporate_override_filters: { group: 'corporate-override', stem: 'corporate-override-filters' },
  corporate_override_grid_sort: { group: 'corporate-override', stem: 'corporate-override-grid-sort' },
  corporate_override_labor_grid: { group: 'corporate-override', stem: 'corporate-override-labor-grid' },
  corporate_override_export: { group: 'corporate-override', stem: 'corporate-override-export' },
  corporate_override_import: { group: 'corporate-override', stem: 'corporate-override-import' },
  // Terms and Conditions
  terms_conditions_core: { group: 'terms-conditions', stem: 'terms-conditions-core' },
  // Service Charge Text
  service_charge_text_core: { group: 'service-charge-text', stem: 'service-charge-text-core' },
  // Service Charge
  discount_matrix_criteria: { group: 'discount-matrix', stem: 'discount-matrix-search-criteria' },
  discount_matrix_region_peaks: { group: 'discount-matrix', stem: 'discount-matrix-region-weekly-peaks' },
  discount_matrix_loc_activation: { group: 'discount-matrix', stem: 'discount-matrix-location-activation' },
  service_charge_basic_info: { group: 'service-charge', stem: 'service-charge-basic-information' },
  service_charge_history: { group: 'service-charge', stem: 'service-charge-history' },
  // Item Search (NM-2253)
  item_search_product_search: { group: 'item-search', stem: 'item-search-product-search' },
  item_search_product_code: { group: 'item-search', stem: 'item-search-product-code' },
  item_search_product_groups: { group: 'item-search', stem: 'item-search-product-groups' },
};

const EXCEL_SHEET_NAME_LIMIT = 31;

// ── Notes / Reason cell (PLAN_DELIVERABLE_NOTES_REASON_DECLUTTER) ──
//
// Reason-ONLY. The column is reserved for the curated execution reason
// (tc.ifFailedReason). tc.notes (MD Notes / Cleanup) is intentionally NOT surfaced —
// it is cleanup/commentary, not client information, and was the sole content on
// passing rows. The "Blocked — " marker is the machine-detectable prefix that lint
// C1/C3/C4/C5 key on; it MUST stay byte-identical to BLOCKED_MARKER_RE in
// scripts/xlsx-lint-rules.mjs (splitNotesReason) — the lint re-derives the reason
// segment from the cell, so a drift here silently defeats the integrity checks. The
// NOTES_SEPARATOR is gone: the column no longer composes tc.notes (declutter plan).
const BLOCKED_MARKER_RE = /^Blocked\s*[—–-]\s*/i;

/**
 * Compose the 'Notes / Reason' cell. Reason-only: the column carries ONLY the curated
 * execution reason (why a case is not a clean automated pass). The integrity tripwire
 * below guarantees a Pass row never carries ifFailedReason, so Pass rows resolve to ''.
 *
 *  - MARKER IDEMPOTENCY — strip an existing leading "Blocked — " from the reason before
 *    re-applying it, or the blocked-reasons.json entries that already begin with the
 *    marker would ship "Blocked — Blocked — …".
 *  - EXECUTION-GATED MARKER — apply "Blocked — " ONLY when the row's execution is
 *    actually 'Blocked'. The same reason field also carries Skipped reasons
 *    ("Skipped — …") and Pending-Automation env reasons ("Not yet automated — …");
 *    blindly prefixing "Blocked — " would mislabel them AND make lint C1/C3 — which tie
 *    the "Blocked — " segment to execution=Blocked — incoherent.
 *
 * Exported for the unit test (mirrors how toSheetName is exported for the sheet-name test).
 */
export function composeReason(reason: string, execution: string): string {
  // reason gets no upstream humanize pass — scrub here (matches the prior emit-time
  // scrub of the standalone reason column) BEFORE the marker is (re-)applied.
  const cleanReason = scrubInternalVocab(reason || '').trim().replace(BLOCKED_MARKER_RE, '').trim();
  if (!cleanReason) return '';
  return execution === 'Blocked' ? `Blocked — ${cleanReason}` : cleanReason;
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
  // MD Notes (`**Notes**:` + folded `**Cleanup**:`) are intentionally NOT carried —
  // PLAN_DELIVERABLE_NOTES_REASON_DECLUTTER dropped tc.notes from the deliverable
  // (cleanup/commentary, not client information). The notes stay in the MD source.
  // Augment cols filled later
  coverageStatus: AugmentData['coverageStatus'];
  automationExecution: AugmentData['automationExecution'];
  ifFailedReason: string;
  stepExpectedResults: string[];
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
  // 'Notes' column intentionally not read — tc.notes is no longer surfaced (declutter plan).
  if (idCol < 0) return [];

  const tcs: ParsedTc[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]!;
    const id = (r[idCol] ?? '').trim();
    if (!id) continue;
    // Second scrubInternalVocab pass is LOAD-BEARING — NOT a no-op.
    // scrubInternalVocab is NOT idempotent on all inputs: when a bare-token like
    // LR-057 is stripped from (LR-057 per-launcher coverage), the audit-trail
    // parenthetical rule (\(\s*per\b...) has already run and misses the residual
    // ( per-launcher coverage). The second pass catches it.
    // Verified 2026-06-25 — 1 changed cell in locations_account_address when removed.
    tcs.push({
      id,
      title: scrubInternalVocab(titleCol >= 0 ? (r[titleCol] ?? '') : ''),
      module: moduleCol >= 0 ? (r[moduleCol] ?? '') : '',
      submodule: submoduleCol >= 0 ? (r[submoduleCol] ?? '') : '',
      preconditions: scrubInternalVocab(preCol >= 0 ? (r[preCol] ?? '') : ''),
      steps: scrubInternalVocab(stepsCol >= 0 ? (r[stepsCol] ?? '') : ''),
      expected: scrubInternalVocab(expectedCol >= 0 ? (r[expectedCol] ?? '') : ''),
      coverageStatus: '',
      automationExecution: '',
      ifFailedReason: '',
      stepExpectedResults: [],
    });
  }
  // Populate per-step expected results from markdown step tables (D12).
  const perStepER = extractPerStepExpected(filePath);
  for (const tc of tcs) {
    const ers = perStepER.get(tc.id);
    if (ers) tc.stepExpectedResults = ers;
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

/** A module "was measured" if at least one test received a pass or fail from execution. */
function moduleWasMeasured(m: SheetMetrics): boolean {
  return m.pass > 0 || m.fail > 0;
}

interface BuildOptions {
  mode: AugmentMode;
  /** When set, write the workbook here instead of the canonical XLSX_PATH. Used by the
   *  freshness gate (scripts/xlsx-freshness.ts) to build a throwaway copy to a temp file
   *  for comparison WITHOUT clobbering the committed deliverable. */
  outPath?: string;
  /** Run the post-write self-lint subprocess (default true). Auto-skipped when outPath is
   *  set — the subprocess re-reads the canonical XLSX_PATH from disk, not the temp file. */
  selfCheck?: boolean;
  /** Pre-existing Playwright JSON reporter result files (passed to augmentByTcId). */
  runJsonPaths?: string[];
  /** Override the clientRoot passed to augmentByTcId. For integration testing only —
   *  allows tests to inject a temp directory so the S0 guard fires without touching real auth. */
  _clientRootForTest?: string;
}

/**
 * Walk the shallow set from .git/shallow (one hash per line). Returns empty set
 * when the file does not exist (non-shallow repo).
 */
function readShallowSet(): Set<string> {
  const shallowFile = path.join(REPO_ROOT, '.git', 'shallow');
  if (!fs.existsSync(shallowFile)) return new Set();
  return new Set(fs.readFileSync(shallowFile, 'utf-8').split('\n').map(l => l.trim()).filter(Boolean));
}

/**
 * Derive the date (YYYY-MM-DD) and commit of the newest real content change for
 * a tracked MD file. Follows renames via --follow. Pure renames (identical blobs)
 * are skipped; the first commit where the blob actually differs is returned.
 *
 * Gate 1b: if the terminal add commit is listed in .git/shallow, history is
 * truncated → hard-fail (the derived date may be wrong).
 * Gate 4: empty git log → hard-fail for canonical builds; "UNCOMMITTED" for preview.
 */
export function getContentChangeDate(
  mdPath: string,
  shallowSet: Set<string>,
  isCanonical: boolean,
): { date: string; commit: string } {
  let raw: string;
  try {
    raw = execFileSync(
      'git',
      ['log', '--follow', '--raw', '--format=COMMIT %H %aI', '--', mdPath],
      { cwd: REPO_ROOT, encoding: 'utf-8' },
    );
  } catch (err) {
    throw new Error(`[xlsx:build] git log failed for ${path.basename(mdPath)}: ${(err as Error).message}`);
  }

  if (!raw.trim()) {
    if (isCanonical) {
      throw new Error(
        `[xlsx:build] ${path.basename(mdPath)} has no git history — commit it before building the canonical workbook.`,
      );
    }
    return { date: 'UNCOMMITTED', commit: 'none' };
  }

  let currentCommit = '';
  let currentDate = '';
  let lastCommit = '';
  let lastDate = '';
  // newestChange = first blob-change commit encountered (git log is newest-first).
  // oldestChange = last blob-change commit encountered — the add/initial boundary.
  // Gate 1b must check the OLDEST followed raw-event commit: if that commit is in
  // the shallow set, history is truncated at the add boundary and the derived date
  // may be wrong. Checking only the newest commit (as the prior code did) misses
  // files whose add commit is at the graft while the rename commit is not.
  let newestChange: { commit: string; date: string } | null = null;
  let oldestChange: { commit: string; date: string } | null = null;

  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (t.startsWith('COMMIT ')) {
      const parts = t.split(' ');
      currentCommit = parts[1] ?? '';
      currentDate = (parts[2] ?? '').slice(0, 10);
      lastCommit = currentCommit;
      lastDate = currentDate;
    } else if (t.startsWith(':')) {
      // Raw diff entry: ":oldMode newMode oldBlob newBlob STATUS\tpath"
      const tabIdx = t.indexOf('\t');
      const meta = tabIdx >= 0 ? t.slice(0, tabIdx) : t;
      const parts = meta.split(/\s+/);
      const oldBlob = parts[2] ?? '';
      const newBlob = parts[3] ?? '';
      if (oldBlob !== newBlob) {
        // Real content change (includes initial add: old blob = all-zeros)
        if (newestChange === null) {
          newestChange = { commit: currentCommit, date: currentDate };
        }
        // Always update oldestChange — last assignment wins (oldest in the stream)
        oldestChange = { commit: currentCommit, date: currentDate };
      }
      // oldBlob === newBlob → pure rename, skip
    }
  }

  if (newestChange !== null) {
    // Gate 1b: the OLDEST blob-change commit is the add/initial-content boundary.
    // If it is in the shallow set, history is truncated there → hard-fail.
    if (oldestChange !== null && shallowSet.has(oldestChange.commit)) {
      throw new Error(
        `[xlsx:build] ${path.basename(mdPath)} history is truncated at shallow graft ${oldestChange.commit} — run: git fetch --unshallow`,
      );
    }
    return newestChange;
  }

  // Fallback: no blob-changing diff line found (all pure renames — extremely rare)
  if (lastCommit) {
    if (shallowSet.has(lastCommit)) {
      throw new Error(
        `[xlsx:build] ${path.basename(mdPath)} history is truncated at shallow graft ${lastCommit} — run: git fetch --unshallow`,
      );
    }
    return { date: lastDate, commit: lastCommit };
  }

  if (isCanonical) {
    throw new Error(
      `[xlsx:build] ${path.basename(mdPath)} has no git history — commit it before building the canonical workbook.`,
    );
  }
  return { date: 'UNCOMMITTED', commit: 'none' };
}

/**
 * Build a Map<mdPath, date-string> for every consumed MD file (one git lookup per file).
 */
function buildMdDateMap(
  mdFiles: string[],
  shallowSet: Set<string>,
  isCanonical: boolean,
): Map<string, string> {
  // Detect MD files with staged content changes. Their content-change date is
  // today because the commit being built will record today's author date.
  // Without this, getContentChangeDate reads git log (which cannot see the
  // pending commit) and returns the previous commit's date — stale by one commit.
  let stagedSet: Set<string>;
  try {
    const stagedRaw = execFileSync(
      'git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '--', ...mdFiles],
      { cwd: REPO_ROOT, encoding: 'utf-8' },
    );
    stagedSet = new Set(stagedRaw.split('\n').map(l => l.trim()).filter(Boolean).map(f => path.resolve(REPO_ROOT, f)));
  } catch {
    stagedSet = new Set();
  }
  const today = new Date().toISOString().slice(0, 10);
  const map = new Map<string, string>();
  for (const file of mdFiles) {
    if (stagedSet.has(path.resolve(file))) {
      map.set(file, today);
    } else {
      const { date } = getContentChangeDate(file, shallowSet, isCanonical);
      map.set(file, date);
    }
  }
  return map;
}

/**
 * MD-primary parsing path (Phase A.5+; sole operative source post-Phase-D).
 * Humanization is applied inside `parseMd()` via the shared `humanize()` helper
 * from `./humanize`, so `--list-only` and `--with-run` produce CSV-equivalent cells.
 *
 * Returns Map<sheetName, { tcs, mdPath }> with a hard-fail on sheet-name collisions
 * from different source files.
 */
export function buildFromMdSource(mdFiles: string[]): Map<string, { tcs: ParsedTc[]; mdPath: string }> {
  const tcsBySheet = new Map<string, { tcs: ParsedTc[]; mdPath: string }>();
  for (const file of mdFiles) {
    const baseSlug = path.basename(file).replace(/\.md$/, '').replace(/_test_cases$/, '');
    const tcs = parseMd(file);
    if (tcs.length === 0) continue;
    const sheetName = toSheetName(baseSlug); // resolver accepts both forms
    if (tcsBySheet.has(sheetName)) {
      const existing = tcsBySheet.get(sheetName)!;
      if (existing.mdPath !== file) {
        throw new Error(
          `[xlsx:build] Sheet name collision: '${sheetName}' produced by both '${existing.mdPath}' and '${file}'`,
        );
      }
      existing.tcs.push(...tcs);
    } else {
      tcsBySheet.set(sheetName, { tcs: [...tcs], mdPath: file });
    }
  }

  // The 'Specific Field' + 'Tags' columns were removed from the deliverable on
  // 2026-06-05 (LR-ENC-004 V2) — both were 100% empty across all cases.
  return tcsBySheet;
}

export async function buildWorkbook(opts: BuildOptions): Promise<{ outPath: string; sheetsBuilt: string[]; rowsPerSheet: Record<string, number>; fingerprint?: string }> {
  // Resolve output path early — needed by gates and date derivation.
  const outPath = opts.outPath ?? XLSX_PATH;
  const isCanonical = outPath === XLSX_PATH;

  // ── Precondition Gate 3: git must be available ──────────────────────────────
  try {
    execFileSync('git', ['--version'], { cwd: REPO_ROOT, encoding: 'utf-8' });
  } catch {
    throw new Error('[xlsx:build] git is not available — install git before building the canonical workbook.');
  }

  // ── MD file discovery ────────────────────────────────────────────────────────
  // MD-primary parsing path is the sole operative path post-Phase-D
  // (2026-05-27 cleanup of PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION removed
  // `--from-csv` mode and `buildFromCsvSource()`). `list-only` and `with-run`
  // are the only valid modes; programmatic callers passing `from-csv` fall
  // through to MD-primary parsing.
  const mdFiles = walkMd(MD_ROOT);
  if (mdFiles.length === 0) throw new Error(`[xlsx:build] No MD files found under ${MD_ROOT}`);

  // ── Precondition Gate 1: shallow-repo warning ────────────────────────────────
  const shallowSet = readShallowSet();
  if (shallowSet.size > 0) {
    process.stderr.write('[xlsx:build] WARN — repository is shallow; per-file history may be truncated (git fetch --unshallow to resolve).\n');
  }

  // One-commit model: staged markdown is accepted because it lands in the same commit
  // as the workbook. Content-change dates for staged files use today's date (the commit
  // date) so the workbook is not stale by one commit. Working-copy edits and untracked
  // markdown are blocked because the workbook could not be rebuilt from that commit alone.
  const unstaged = execFileSync('git', ['diff', '--name-only', '--', ...mdFiles], { cwd: REPO_ROOT, encoding: 'utf-8' })
    .split('\n').map(l => l.trim()).filter(Boolean);
  // Untracked files anywhere under MD_ROOT (check membership against consumed set)
  const mdFileSet = new Set(mdFiles.map(f => path.relative(REPO_ROOT, f).replace(/\\/g, '/')));
  const untrackedRaw = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', MD_ROOT], { cwd: REPO_ROOT, encoding: 'utf-8' })
    .split('\n').map(l => l.trim()).filter(Boolean);
  const untracked = untrackedRaw.filter(f => mdFileSet.has(f.replace(/\\/g, '/')));
  const dirtyFiles = [...new Set([...unstaged, ...untracked])];
  if (dirtyFiles.length > 0) {
    throw new Error(
      `[xlsx:build] Consumed MD source(s) are not staged for the commit: ${dirtyFiles.join(', ')}. Stage, commit, or stash before building.`,
    );
  }

  // ── Build per-file content-change date map (one git lookup per MD) ───────────
  const mdDateMap = buildMdDateMap(mdFiles, shallowSet, isCanonical);

  const tcsBySheet = buildFromMdSource(mdFiles);

  // Completeness gate: every non-Overview sheet must have exactly one split target.
  // Fires here so it covers both the skip path and the write path below.
  validateSplitCompleteness(Array.from(tcsBySheet.keys()));

  // SP00 augment — populate Coverage Status / Automation Execution / Reason for every TC ID
  const allTcIds: string[] = [];
  for (const [, entry] of tcsBySheet) for (const tc of entry.tcs) allTcIds.push(tc.id);
  const augment = augmentByTcId(allTcIds, {
    mode: opts.mode,
    clientRoot: opts._clientRootForTest ?? CLIENT_ROOT,
    fixmeRegistryPath: FIXME_REGISTRY,
    runJsonPaths: opts.runJsonPaths,
  });
  // S0-BIND guard: augmentByTcId must return entries for every TC ID it receives
  // (it pre-populates the map at construction). An empty map when TC IDs exist
  // means the integration call was severed (e.g. replaced with `new Map()`).
  if (allTcIds.length > 0 && augment.size === 0) {
    throw new Error(
      `S0-BIND: augmentByTcId returned 0 entries for ${allTcIds.length} TC IDs — integration severed`
    );
  }
  for (const [, entry] of tcsBySheet) {
    for (const tc of entry.tcs) {
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
  // applyBlockedOverlay expects Map<string, T[]>; extract flat map (mutations are in-place).
  const tcsFlatMap = new Map<string, ParsedTc[]>();
  for (const [sheet, entry] of tcsBySheet) tcsFlatMap.set(sheet, entry.tcs);
  const overlay = applyBlockedOverlay(tcsFlatMap, { repoRoot: REPO_ROOT, registryPath: FIXME_REGISTRY });
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
  for (const [, entry] of tcsBySheet) {
    for (const tc of entry.tcs) {
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
  for (const [, entry] of tcsBySheet) {
    for (const tc of entry.tcs) {
      if (tc.automationExecution === 'Pass' && (tc.ifFailedReason || '').trim() !== '') {
        throw new Error(
          `[Data Integrity Exception] TC ${tc.id} is marked PASS but carries a failure reason ` +
          `("${tc.ifFailedReason.slice(0, 80)}"). Upstream join bug in sp00-augment-logic.ts — ` +
          `fix the attribution at the source, do NOT coerce here.`
        );
      }
    }
  }

  // ── Fingerprint: collect inputs → compare with embedded → skip if unchanged ──
  // Fail toward writing: any error in fingerprint computation forces a write.
  let fingerprint = '';
  let shouldSkip = false;
  {
    let exporterSourceHash = 'ERROR';
    try { exporterSourceHash = computeExporterSourceHash(); }
    catch (err) {
      process.stderr.write(`[xlsx:build] WARN — exporter hash failed: ${(err as Error).message}; will write unconditionally.\n`);
    }

    const { map: blobIdMap, ok: blobIdsOk } = collectBlobIds(mdFiles);
    const splitMembershipHash = crypto.createHash('sha256')
      .update(JSON.stringify(Object.fromEntries(Object.entries(SPLIT_FILE_MAP).sort())))
      .digest('hex');
    const mdSourcesList = mdFiles
      .map(f => {
        const relPath = path.relative(REPO_ROOT, f).replace(/\\/g, '/');
        return { relPath, blobId: blobIdMap[relPath] ?? '', contentChangeDate: mdDateMap.get(f) ?? 'UNCOMMITTED' };
      })
      .sort((a, b) => a.relPath.localeCompare(b.relPath));
    const perTcAugment = collectAugmentForFingerprint(tcsBySheet);

    const fpRecord: FingerprintRecord = {
      schemaVersion: 1,
      mdSources: mdSourcesList,
      perTcAugment,
      exporterSourceHash,
      excelJsVersion: EXCELJS_VERSION,
      splitTargetMembershipHash: splitMembershipHash,
    };
    fingerprint = computeFingerprint(fpRecord);

    if (computeSkipEligible({ exporterSourceHash, blobIdsOk, isCanonical })) {
      // Read consolidated fingerprint; fail toward writing on any error
      const existingFp = await readEmbeddedFingerprint(outPath);
      if (existingFp === fingerprint) {
        // Fast existence check for all expected splits (avoids silent stale splits)
        let allSplitsExist = true;
        for (const [, mapping] of Object.entries(SPLIT_FILE_MAP)) {
          if (!fs.existsSync(path.join(XLSX_DIR, mapping.group, `${mapping.stem}.xlsx`))) {
            allSplitsExist = false;
            break;
          }
        }
        if (allSplitsExist) {
          process.stderr.write(`[xlsx:build] Inputs unchanged — skipping write.\n`);
          shouldSkip = true;
        } else {
          process.stderr.write(`[xlsx:build] Some split files missing — rebuilding despite matching fingerprint.\n`);
        }
      }
    }
  }
  if (shouldSkip) {
    if (outPath === XLSX_PATH) pruneStaleeSplitFiles();
    return { outPath, sheetsBuilt: [], rowsPerSheet: {}, fingerprint: fingerprint ?? undefined };
  }

  // 5. Emit workbook
  const wb = new ExcelJS.Workbook();
  wb.creator = 'encore_framework xlsx:build';
  wb.created = DETERMINISTIC_TIMESTAMP;
  wb.modified = DETERMINISTIC_TIMESTAMP;

  const overviewRows: { sheet: string; metrics: SheetMetrics; mdPath: string }[] = [];
  const sortedSheetNames = Array.from(tcsBySheet.keys()).sort((a, b) => orderSheets(a, b));
  const rowsPerSheet: Record<string, number> = {};

  // Overview sheet first. "generated on" uses the latest content-change date across the
  // source MDs (deterministic) — NOT wall-clock — so an unchanged corpus rebuilds byte-
  // identically (NM-2253). Falls back to today only if no dated source exists.
  const contentDates = Array.from(mdDateMap.values()).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
  const generatedOn = contentDates.length ? contentDates.sort().at(-1)! : new Date().toISOString().slice(0, 10);
  const overview = wb.addWorksheet('Overview', { views: [{ state: 'frozen', ySplit: 4 }] });
  overview.addRow([`Encore Test Case Workbook — generated on ${generatedOn}`]);
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
    const { tcs, mdPath: sheetMdPath } = tcsBySheet.get(sheetName)!;
    const sheetDate = mdDateMap.get(sheetMdPath);
    if (!sheetDate) throw new Error(`[xlsx:build] Internal: no content-change date for ${sheetMdPath}`);
    tcs.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
    const metrics = emptyMetrics();
    const ws = wb.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });
    const headerRow = ws.addRow([...MODULE_SHEET_HEADERS]);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'left' };

    for (const tc of tcs) {
      // accumulate ONCE per case — Overview/SUMMARY counts stay per-case even
      // though the case now spans 1 first-row + N continuation step-rows.
      accumulate(metrics, tc);

      // Test Data (client-safe, config-driven) + the reason-only Notes / Reason cell.
      // tc.steps / tc.expected are already humanized+scrubbed in parseMd; composeReason
      // scrubs the reason and applies the execution-gated Blocked marker (reason-only —
      // tc.notes is no longer surfaced, per the declutter plan).
      const testData = deriveTestData(tc.steps);
      const notesReason = composeReason(tc.ifFailedReason, tc.automationExecution);

      let steps = parseSteps(tc.steps);
      if (steps.length === 0) steps = ['(no steps defined)'];

      steps.forEach((step, i) => {
        // Per-step Expected Result (D12 — PLAN_59 amendment): each step's
        // Expected Result comes from its own column in the markdown step
        // table. The case-level **Expected**: is a separate field and is
        // never used as a per-step fallback.
        const expected = tc.stepExpectedResults?.[i]?.trim() || '';
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
                tc.preconditions,
                stepCell,
                expected,
                notesReason, // last column (reason-only — declutter plan)
              ]
            // Continuation step-rows carry ONLY Steps (Step)+(Expected Result) at cols
            // 11-12; the trailing Notes / Reason (col 13) is blank by construction.
            : ['', '', '', '', '', '', '', '', '', '', stepCell, expected, '']
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
      moduleWasMeasured(metrics)
        ? `Pass:${metrics.pass} Fail:${metrics.fail} Skipped:${metrics.skipped} Blocked:${metrics.blocked}`
        : 'Not run in this delivery', // Automation Status col
      // Preconditions, Steps (Step), Steps (Expected Result) — empty
      '', '', '',
      `Last Updated: ${sheetDate}`, // Notes / Reason col — content-change date from git history
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

    overviewRows.push({ sheet: sheetName, metrics, mdPath: sheetMdPath });
    rowsPerSheet[sheetName] = tcs.length;
  }

  // Fill Overview data rows AFTER module sheets so hyperlinks resolve
  for (const { sheet, metrics, mdPath: entryMdPath } of overviewRows) {
    const measured = moduleWasMeasured(metrics);
    const executedDenom = metrics.total - metrics.skipped - metrics.blocked;
    const entryDate = mdDateMap.get(entryMdPath) ?? 'UNCOMMITTED';
    const row = overview.addRow([
      sheet,
      metrics.total,
      metrics.automated,
      metrics.pendingAutomation,
      metrics.manual,
      measured ? metrics.pass : '—',
      measured ? metrics.fail : '—',
      measured ? metrics.skipped : '—',
      measured ? metrics.blocked : '—',
      measured ? fmtPct(metrics.pass, metrics.total) : '—',
      measured ? fmtPct(metrics.pass, executedDenom) : '—',
      fmtPct(metrics.automated, metrics.total),
      entryDate, // content-change date from git history (not build date)
    ]);
    // Hyperlink Sheet column → that sheet's A1
    const sheetCell = row.getCell(1);
    sheetCell.value = { text: sheet, hyperlink: `#'${sheet}'!A1` };
    sheetCell.font = { color: { argb: 'FF0563C1' }, underline: true };
  }
  autoSize(overview, OVERVIEW_HEADERS.length);

  // Embed fingerprint in consolidated workbook before writing
  if (isCanonical && fingerprint) embedFingerprint(wb, fingerprint);

  // 6. Write — to opts.outPath for a throwaway build (freshness gate), else the canonical path.
  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  await writeWorkbookDeterministic(wb, outPath);

  // Write split files — one workbook per module sheet (PLAN_59 D2).
  if (outPath === XLSX_PATH) {
    await writeSplitFiles(wb);
    pruneStaleeSplitFiles();
  }

  // Build-time self-fail (LR-ENC-004): re-lint the workbook we just wrote with the
  // SAME shared rules (scripts/xlsx-lint-rules.mjs) used at commit and ship time.
  // `npm run xlsx:build` can therefore never silently emit a workbook with internal
  // vocabulary or a status/reason contradiction. Run as a subprocess to cross the
  // CJS (ts-node) → ESM (.mjs) boundary cleanly; the CLI re-reads XLSX_PATH from disk.
  // Skipped for a throwaway build (outPath set / selfCheck === false): the subprocess
  // re-reads the canonical XLSX_PATH, so it would lint the wrong (stale) file.
  if (opts.selfCheck !== false && outPath === XLSX_PATH) {
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
  }

  return { outPath, sheetsBuilt: ['Overview', ...sortedSheetNames], rowsPerSheet, fingerprint: fingerprint ?? undefined };
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

// ─────────────────────────── Fingerprint (A half — skip-write) ───────────────
//
// B6-CONVERGENCE prescription: embed a deterministic fingerprint INSIDE the
// workbook (hidden sheet __fp__) so skip-write is clone-safe and sidecar-free.
// The fingerprint covers every input that determines a workbook's content.
// Fail-toward-writing: any error computing or reading a fingerprint forces a write.

export const FINGERPRINT_SHEET = '__fp__';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const EXCELJS_VERSION: string = (() => {
  try { return (require('exceljs/package.json') as { version: string }).version; }
  catch { return 'unknown'; }
})();

/**
 * Hash all *.ts and *.json files directly in export_test_cases/ (top-level only,
 * sorted) so any new top-level dependency is automatically included. This is the
 * rot-proof coverage guarantee: add a file → hash changes → fingerprint invalidates
 * → write. Subdirectory imports are not supported; if a subdirectory is ever added,
 * this function must be updated to recurse into it.
 *
 * Exported so the rot-proof coverage test (xlsx-dates.test.ts) can verify that
 * introducing a new file in this directory changes the hash.
 */
export function computeExporterSourceHash(): string {
  const h = crypto.createHash('sha256');
  const files = fs.readdirSync(__dirname)
    .filter(f => f.endsWith('.ts') || f.endsWith('.json'))
    .sort();
  for (const f of files) {
    h.update(f + '\n');
    h.update(fs.readFileSync(path.join(__dirname, f)));
    h.update('\n---\n');
  }
  return h.digest('hex');
}

export interface FingerprintRecord {
  schemaVersion: 1;
  mdSources: Array<{ relPath: string; blobId: string; contentChangeDate: string }>;
  perTcAugment: Array<{ tcId: string; coverageStatus: string; automationExecution: string; ifFailedReason: string }>;
  exporterSourceHash: string;
  excelJsVersion: string;
  splitTargetMembershipHash: string;
}

/**
 * Returns true only when all three skip-eligibility conditions hold:
 *   - blobIdsOk: every consumed MD file resolved a blob ID (shallow repo or new file sets this false)
 *   - exporterSourceHash is not 'ERROR' (hash computation succeeded)
 *   - isCanonical: build is a full canonical write (not list-only / preview)
 * Exported for unit testing of the skip-guard axis.
 */
export function computeSkipEligible(params: { blobIdsOk: boolean; exporterSourceHash: string; isCanonical: boolean }): boolean {
  return params.exporterSourceHash !== 'ERROR' && params.blobIdsOk && params.isCanonical;
}

/**
 * Compute a deterministic SHA-256 fingerprint over all workbook-content inputs.
 * Exported for unit tests.
 */
export function computeFingerprint(inputs: FingerprintRecord): string {
  return crypto.createHash('sha256').update(JSON.stringify(inputs)).digest('hex');
}

/**
 * Reject a SPLIT_FILE_MAP target whose group or stem could escape the deliverable root.
 * Checks: no absolute path, no '..' segment, no path separator inside group or stem,
 * and the fully-resolved output path must fall inside XLSX_DIR.
 */
function assertSplitTargetSafe(key: string, group: string, stem: string): void {
  if (path.isAbsolute(group) || path.isAbsolute(stem)) {
    throw new Error(
      `[xlsx:build] SPLIT_FILE_MAP entry "${key}": group and stem must not be absolute paths ` +
      `(got group="${group}", stem="${stem}") — refusing to proceed.`,
    );
  }
  const hasDotDot = (s: string): boolean => s.split(/[/\\]/).some(seg => seg === '..');
  if (hasDotDot(group) || hasDotDot(stem)) {
    throw new Error(
      `[xlsx:build] SPLIT_FILE_MAP entry "${key}": group and stem must not contain '..' segments ` +
      `(got group="${group}", stem="${stem}") — refusing to proceed.`,
    );
  }
  if (/[/\\]/.test(group) || /[/\\]/.test(stem)) {
    throw new Error(
      `[xlsx:build] SPLIT_FILE_MAP entry "${key}": group and stem must not contain path separators ` +
      `(got group="${group}", stem="${stem}") — refusing to proceed.`,
    );
  }
  const xlsxDirResolved = path.resolve(XLSX_DIR);
  const targetResolved = path.resolve(xlsxDirResolved, group, `${stem}.xlsx`);
  if (!targetResolved.startsWith(xlsxDirResolved + path.sep)) {
    throw new Error(
      `[xlsx:build] SPLIT_FILE_MAP entry "${key}": target resolves outside the deliverable root ` +
      `"${xlsxDirResolved}" (resolved: "${targetResolved}") — refusing to proceed.`,
    );
  }
}

/**
 * Assert the set of built non-Overview sheet names is EXACTLY EQUAL to the set of
 * SPLIT_FILE_MAP keys (bijection), with no duplicate output paths and no targets that
 * escape the deliverable root. Hard-fails (throws) on any violation. Both the bijection
 * check and target sanitization fire before the fingerprint/skip decision, so they
 * apply on the write path and the skip path alike.
 *
 * Exported for unit tests — pass a synthetic splitMap to exercise error paths.
 */
export function validateSplitCompleteness(
  builtSheetNames: string[],
  splitMap: Record<string, { group: string; stem: string }> = SPLIT_FILE_MAP,
): void {
  const mapEntries = Object.entries(splitMap);
  if (mapEntries.length === 0) {
    throw new Error(
      '[xlsx:build] SPLIT_FILE_MAP is empty — cannot validate split completeness; ' +
      'refusing to proceed to avoid silent data loss.',
    );
  }
  for (const [key, val] of mapEntries) {
    if (!val || typeof val.group !== 'string' || !val.group || typeof val.stem !== 'string' || !val.stem) {
      throw new Error(
        `[xlsx:build] SPLIT_FILE_MAP entry "${key}" is malformed ` +
        '(expected { group: string; stem: string }) — refusing to proceed.',
      );
    }
  }
  // Sanitize every target before any write or prune (prevents path-escape via group/stem)
  for (const [key, { group, stem }] of mapEntries) {
    assertSplitTargetSafe(key, group, stem);
  }
  // Bijection: built non-Overview sheet set must EQUAL the SPLIT_FILE_MAP key set.
  // Report the symmetric difference so both directions of violation are named in one error.
  const nonOverviewSheets = new Set(builtSheetNames.filter(s => s !== 'Overview'));
  const mapKeySet = new Set(Object.keys(splitMap));
  const sheetsWithNoMapping = [...nonOverviewSheets].filter(s => !mapKeySet.has(s));
  const ghostMapKeys = [...mapKeySet].filter(k => !nonOverviewSheets.has(k));
  if (sheetsWithNoMapping.length > 0 || ghostMapKeys.length > 0) {
    const parts: string[] = [];
    if (sheetsWithNoMapping.length > 0) {
      parts.push(
        `Sheets built with no SPLIT_FILE_MAP entry (silently absent from deliverables): ` +
        sheetsWithNoMapping.map(s => `"${s}"`).join(', ') + '.',
      );
    }
    if (ghostMapKeys.length > 0) {
      parts.push(
        `SPLIT_FILE_MAP keys with no built sheet (ghost entries protect stale files from pruning): ` +
        ghostMapKeys.map(k => `"${k}"`).join(', ') + '.',
      );
    }
    throw new Error(
      '[xlsx:build] SPLIT_FILE_MAP bijection violated. ' +
      parts.join(' ') +
      ' Fix the map or source files before rebuilding.',
    );
  }
  // No two entries may resolve to the same output path (duplicate target = hard fail)
  const seen = new Map<string, string>(); // outputPath → first sheet key
  for (const [sheetKey, { group, stem }] of mapEntries) {
    const outputPath = `${group}/${stem}.xlsx`;
    const prior = seen.get(outputPath);
    if (prior !== undefined) {
      throw new Error(
        `[xlsx:build] Duplicate split target "${outputPath}" — ` +
        `sheets "${prior}" and "${sheetKey}" both map to the same output file. ` +
        'Each sheet must have a unique split target.',
      );
    }
    seen.set(outputPath, sheetKey);
  }
}

/** Try to read the embedded fingerprint from an existing workbook. Returns null on any error. */
async function readEmbeddedFingerprint(filePath: string): Promise<string | null> {
  if (!fs.existsSync(filePath)) return null;
  try {
    const existingWb = new ExcelJS.Workbook();
    await existingWb.xlsx.readFile(filePath);
    const ws = existingWb.getWorksheet(FINGERPRINT_SHEET);
    if (!ws) return null;
    const val = ws.getCell('A1').value;
    return typeof val === 'string' && val.length > 0 ? val : null;
  } catch {
    return null;
  }
}

/** Embed the fingerprint as a hidden metadata sheet (no client-visible content). */
function embedFingerprint(wb: ExcelJS.Workbook, fingerprint: string): void {
  // Remove any prior __fp__ sheet before re-embedding
  const prior = wb.getWorksheet(FINGERPRINT_SHEET);
  if (prior) wb.removeWorksheet(prior.id);
  const ws = wb.addWorksheet(FINGERPRINT_SHEET, { state: 'hidden' });
  ws.getCell('A1').value = fingerprint;
}

/** Collect per-TC augment data after all overlays, sorted by tcId, for fingerprinting. */
function collectAugmentForFingerprint(
  tcsBySheet: Map<string, { tcs: ParsedTc[]; mdPath: string }>,
): Array<{ tcId: string; coverageStatus: string; automationExecution: string; ifFailedReason: string }> {
  const rows: Array<{ tcId: string; coverageStatus: string; automationExecution: string; ifFailedReason: string }> = [];
  for (const [, entry] of tcsBySheet) {
    for (const tc of entry.tcs) {
      rows.push({
        tcId: tc.id,
        coverageStatus: tc.coverageStatus ?? '',
        automationExecution: tc.automationExecution ?? '',
        ifFailedReason: tc.ifFailedReason ?? '',
      });
    }
  }
  return rows.sort((a, b) => a.tcId.localeCompare(b.tcId));
}

/**
 * Collect git blob IDs for consumed MD files from the staged index.
 * Returns { map: relPath→blobId, ok: true } when every consumed MD has a
 * non-empty blob ID. Returns { map, ok: false } on any git failure or when
 * any MD file is absent from the index (empty blob ID). A degraded result MUST
 * prevent skip — caller must force a write and log the reason.
 */
function collectBlobIds(mdFiles: string[]): { map: Record<string, string>; ok: boolean } {
  const map: Record<string, string> = {};
  if (mdFiles.length === 0) return { map, ok: true };
  try {
    // Read the index because pre-commit builds must fingerprint the content that will be committed.
    const out = execFileSync('git', ['ls-files', '-s', '--', ...mdFiles], { cwd: REPO_ROOT, encoding: 'utf-8' });
    for (const line of out.split('\n')) {
      const t = line.trim();
      if (!t) continue;
      // format: "100644 <hash> 0\t<relpath>"
      const tabIdx = t.indexOf('\t');
      if (tabIdx < 0) continue;
      const relPath = t.slice(tabIdx + 1).replace(/\\/g, '/');
      const cols = t.slice(0, tabIdx).split(/\s+/);
      const blobId = cols[1] ?? '';
      map[relPath] = blobId;
    }
  } catch (err) {
    process.stderr.write(`[xlsx:build] WARN — blob ID collection failed: ${(err as Error).message}; will write unconditionally.\n`);
    return { map, ok: false };
  }
  // Verify every consumed MD has a non-empty blob ID in the index.
  const missing: string[] = [];
  for (const f of mdFiles) {
    const relPath = path.relative(REPO_ROOT, f).replace(/\\/g, '/');
    if (!map[relPath]) missing.push(relPath);
  }
  if (missing.length > 0) {
    process.stderr.write(`[xlsx:build] WARN — ${missing.length} MD file(s) have no blob ID in the index (${missing.slice(0, 3).join(', ')}${missing.length > 3 ? '…' : ''}); will write unconditionally.\n`);
    return { map, ok: false };
  }
  return { map, ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract per-step expected results from markdown step tables.
 * Returns a map from TC ID to an array of expected-result strings,
 * one per table row (aligned 1:1 with parseSteps output after migration).
 */
function extractPerStepExpected(filePath: string): Map<string, string[]> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const result = new Map<string, string[]>();
  const sections = content.split(/^## (TC-[A-Z]+(?:-[A-Z]+)*(?:-\d+[A-Z]?)?):/m);
  for (let i = 1; i < sections.length; i += 2) {
    const id = (sections[i] || '').trim();
    const body = sections[i + 1] || '';
    const tableMatch = body.match(
      /\*\*Steps\*\*:\s*\n\s*\|\s*#\s*\|\s*Step\s*\|\s*Expected Result\s*\|\s*\n\s*\|[-|\s]+\|\s*\n((?:\s*\|.+\|\s*\n?)*)/,
    );
    if (tableMatch) {
      const tableBody = tableMatch[1] || '';
      const rows = tableBody.split('\n').filter(line => line.trim().startsWith('|'));
      const expectedResults: string[] = [];
      for (const row of rows) {
        const cells = row.split('|').slice(1, -1).map(c => c.trim());
        expectedResults.push((cells[2] || '').replace(/\\\|/g, '|'));
      }
      result.set(id, expectedResults);
    }
  }
  return result;
}

/**
 * Delete any .xlsx files under XLSX_DIR subdirectories that are NOT in the current
 * SPLIT_FILE_MAP. A removal or rename in SPLIT_FILE_MAP leaves stale tracked split
 * files that would otherwise keep shipping even after a forced rebuild. This must
 * run after writeSplitFiles() so it only removes truly obsolete files, never
 * concurrently-written ones.
 */
function pruneStaleeSplitFiles(): void {
  // Belt-and-suspenders: refuse to prune if the map is empty or malformed — an empty
  // expectedPaths set would delete every tracked split file with no error.
  const mapEntries = Object.entries(SPLIT_FILE_MAP);
  if (mapEntries.length === 0) {
    throw new Error(
      '[xlsx:build] SPLIT_FILE_MAP is empty — refusing to prune split files to avoid deleting all client deliverables.',
    );
  }
  for (const [key, val] of mapEntries) {
    if (!val || typeof val.group !== 'string' || !val.group || typeof val.stem !== 'string' || !val.stem) {
      throw new Error(
        `[xlsx:build] SPLIT_FILE_MAP entry "${key}" is malformed — refusing to prune split files.`,
      );
    }
  }
  // Sanitize every target before computing expected paths (escape-root prevention)
  for (const [key, { group, stem }] of mapEntries) {
    assertSplitTargetSafe(key, group, stem);
  }
  const expectedPaths = new Set<string>(
    Object.values(SPLIT_FILE_MAP).map(({ group, stem }) =>
      path.join(XLSX_DIR, group, `${stem}.xlsx`),
    ),
  );
  if (!fs.existsSync(XLSX_DIR)) return;
  for (const entry of fs.readdirSync(XLSX_DIR)) {
    const subdir = path.join(XLSX_DIR, entry);
    if (!fs.statSync(subdir).isDirectory()) continue;
    for (const file of fs.readdirSync(subdir)) {
      if (!file.endsWith('.xlsx')) continue;
      const fullPath = path.join(subdir, file);
      if (!expectedPaths.has(fullPath)) {
        fs.unlinkSync(fullPath);
        process.stderr.write(`[xlsx:build] Deleted stale split file: ${path.relative(REPO_ROOT, fullPath).replace(/\\/g, '/')}\n`);
      }
    }
  }
}

/**
 * Deterministic workbook writer (NM-2253, 2026-09-02). ExcelJS serializes through JSZip,
 * which stamps every zip entry's local + central header with `new Date()` at write time —
 * so pinning `wb.created`/`wb.modified` alone (docProps/core.xml, the content layer) still
 * leaves the zip *container* timestamps churning, and every rebuild is byte-different.
 *
 * Serialize to a buffer, then re-emit the zip with every entry's date pinned to
 * DETERMINISTIC_TIMESTAMP. Each entry's decompressed bytes are copied through unchanged, so
 * all workbook content (sheets, styles) is preserved exactly; only the container timestamps
 * are normalized. Write-only: a global JSZip.prototype patch would also corrupt ExcelJS's
 * shared read path, so the normalization is confined here.
 */
async function writeWorkbookDeterministic(wb: ExcelJS.Workbook, outFile: string): Promise<void> {
  const buf = await wb.xlsx.writeBuffer();
  const src = await JSZip.loadAsync(buf as ArrayBuffer);
  const normalized = new JSZip();
  for (const [name, entry] of Object.entries(src.files)) {
    if (entry.dir) {
      // Directory entries carry a DOS timestamp too; JSZip's folder() would stamp them
      // with wall-clock (2-second resolution), so recreate them with the fixed date.
      normalized.file(name, '', { dir: true, date: DETERMINISTIC_TIMESTAMP });
      continue;
    }
    const content = await entry.async('nodebuffer');
    normalized.file(name, content, { date: DETERMINISTIC_TIMESTAMP, binary: true, createFolders: false });
  }
  const out = await normalized.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', platform: 'UNIX' });
  fs.writeFileSync(outFile, out);
}

/**
 * Write split files — one single-sheet workbook per module under testcases/<group>/.
 * Each split workbook clones the corresponding sheet from the consolidated workbook
 * with its header, data rows, blank separator, and SUMMARY row intact (PLAN_59 D2).
 *
 * Splits deliberately do NOT embed the global input fingerprint (NM-2253): it was
 * write-only dead metadata there — only the consolidated workbook's fingerprint is ever
 * read (skip-detection + the xlsx-freshness gate) — and stamping the all-modules
 * fingerprint into every split meant a one-module edit rewrote all 39 splits. Without it
 * (plus the pinned timestamps) an unchanged module's split is byte-identical across
 * rebuilds, so editing one module now touches only the consolidated workbook + that
 * module's own split.
 */
async function writeSplitFiles(consolidatedWb: ExcelJS.Workbook): Promise<void> {
  for (const [sheetName, mapping] of Object.entries(SPLIT_FILE_MAP)) {
    const srcWs = consolidatedWb.getWorksheet(sheetName);
    if (!srcWs) continue;
    const splitDir = path.join(XLSX_DIR, mapping.group);
    if (!fs.existsSync(splitDir)) fs.mkdirSync(splitDir, { recursive: true });
    const splitPath = path.join(splitDir, `${mapping.stem}.xlsx`);
    const splitWb = new ExcelJS.Workbook();
    splitWb.creator = 'encore_framework xlsx:build';
    splitWb.created = DETERMINISTIC_TIMESTAMP;
    splitWb.modified = DETERMINISTIC_TIMESTAMP;
    const destWs = splitWb.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });
    srcWs.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      const destRow = destWs.getRow(rowNumber);
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const destCell = destRow.getCell(colNumber);
        destCell.value = cell.value;
        destCell.style = { ...cell.style };
      });
      destRow.commit();
    });
    for (let c = 1; c <= MODULE_SHEET_HEADERS.length; c++) {
      destWs.getColumn(c).width = srcWs.getColumn(c).width;
    }
    await writeWorkbookDeterministic(splitWb, splitPath);
  }
}

// ────────────────────────── CLI ──────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);
  let mode: AugmentMode = 'list-only';
  if (args.includes('--with-run')) mode = 'with-run';
  else if (args.includes('--list-only')) mode = 'list-only';

  // --run-json=<path> (repeatable): supply pre-existing result files instead of running Playwright.
  // Implies --with-run mode (stamping real outcomes).
  const runJsonPaths: string[] = [];
  for (const arg of args) {
    if (arg.startsWith('--run-json=')) {
      runJsonPaths.push(arg.slice('--run-json='.length));
    }
  }
  if (runJsonPaths.length > 0) {
    mode = 'with-run';
  }

  const selfCheck = !args.includes('--no-self-check');

  // Echo augment-mode caveat per plan §192
  if (mode === 'list-only') {
    console.log(
      `[xlsx:build] mode=list-only — Pass column = assumed-pass for automated TCs that ` +
        `aren't skip/fixme. For authoritative Pass/Fail run \`npm run xlsx:build:with-run\`.`
    );
  }

  buildWorkbook({ mode, runJsonPaths: runJsonPaths.length > 0 ? runJsonPaths : undefined, selfCheck })
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
