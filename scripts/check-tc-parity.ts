#!/usr/bin/env ts-node
/**
 * TC Parity Check: Spec TCs vs Markdown TCs vs XLSX TCs
 *
 * Compares Playwright spec test IDs against markdown test case files and the
 * XLSX deliverable. Reports three classes of drift:
 *   1. TCs in specs but NOT in markdown (missing from client deliverable)
 *   2. TCs in specs but NOT in XLSX (export gap)
 *   3. TCs in markdown but NOT in XLSX (parser/export bug)
 *
 * Guardrails added by PLAN_EXCEL_REVERT_RECOVERY (2026-06-10) — the 06-08→06-09
 * silent MD revert rode into the committed workbook because parity was ID-set-only:
 *   4. CROSS-SHEET DUPLICATE TC IDs (FAIL) — the same TC ID on >1 workbook sheet.
 *      Catches the orphan-sheet class (locations_left_panel duplicated 24 IDs of
 *      locations_left_panel_basic_info and parity stayed green).
 *   5. GROSS SPEC↔XLSX CONTENT MISMATCH (FLAG; FAIL on combined signal) — for TC IDs
 *      present in both spec and workbook, compares spec test() titles to workbook
 *      Title cells by token overlap. A module where most shared titles are grossly
 *      divergent AND whose MD numbering runs past the spec's numbering (id-set drift)
 *      is the reverted-content signature (locations_notes: 64 MD IDs vs 58 spec IDs,
 *      31 divergent titles — invisible to ID-set parity).
 *
 * Usage: npx ts-node scripts/check-tc-parity.ts
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { SHARED_PATHS } from './shared-types';

const TC_PATTERN = /TC-[A-Z]+-[A-Z]+-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*/g;

// LR-020 regression guard: regex MUST match all 1- to 3-segment-prefix TC ID shapes.
// 2026-05-26 forensic finding (csv-md-delta-investigation-2026-05-26.md): the prior
// (?:-[A-Z]+)? singular-optional clause silently dropped TC-LOC-LI-NE-NNN (3-segment
// prefix) and the like, inflating the apparent MD/CSV delta. New form: 1-to-3
// dash-segments between TC-<first> and the trailing number/letters group.
const MD_HEADER_TC_PATTERN = /^#{2,3}\s+(TC-[A-Z]+(?:-[A-Z]+){1,3}-(?:\d+[A-Z]?|[A-Z]+)(?:-[A-Z]+)*):/gm;

function assertHeaderRegexCovers3SegmentPrefixes(): void {
  const fixtures = ['TC-LOC-CUR-001', 'TC-LOC-LI-NE-011', 'TC-LOC-SHR-DIV-099'];
  for (const id of fixtures) {
    const probe = `## ${id}: title`;
    const singleHit = new RegExp(MD_HEADER_TC_PATTERN.source);
    const m = probe.match(singleHit);
    if (!m || m[1] !== id) {
      throw new Error(
        `check-tc-parity MD_HEADER_TC_PATTERN self-test FAILED for ${id} — matched ${m ? m[1] : '(null)'}`
      );
    }
  }
}
assertHeaderRegexCovers3SegmentPrefixes();

let specListOutput: string | null = null;
function getSpecListOutput(): string {
  // LR-020 regression guard: from repo root, `npx playwright test --list` has no
  // config to find — returns 0 tests, masking the true Spec count as 0. The per-
  // client Playwright project lives at SHARED_PATHS.clientRoot, so anchor execSync
  // there. (2026-05-26 forensic finding.) Cached — both getSpecTcIds() and
  // getSpecTitles() consume the same single run.
  if (specListOutput === null) {
    specListOutput = execSync('npx playwright test --list', {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: SHARED_PATHS.clientRoot,
    });
  }
  return specListOutput;
}

function getSpecTcIds(): Set<string> {
  const ids = new Set<string>();
  for (const match of getSpecListOutput().matchAll(TC_PATTERN)) {
    ids.add(match[0]);
  }
  return ids;
}

/** Spec test() titles by TC ID, from the `› TC-XXX: <title>` tail of each --list line. */
function getSpecTitles(): Map<string, string> {
  const titles = new Map<string, string>();
  const lineRe = /›\s*(TC-[A-Z]+(?:-[A-Z]+){1,3}-(?:\d+[A-Z]?|[A-Z]+)(?:-[A-Z]+)*):\s*(.+)$/;
  for (const line of getSpecListOutput().split('\n')) {
    const m = line.match(lineRe);
    if (m && m[1] && m[2]) titles.set(m[1], m[2].trim());
  }
  return titles;
}

function getMarkdownTcIds(): Set<string> {
  const ids = new Set<string>();
  const testCasesDir = SHARED_PATHS.testCases;
  const files = findMarkdownFiles(testCasesDir);
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const headerPattern = new RegExp(MD_HEADER_TC_PATTERN.source, MD_HEADER_TC_PATTERN.flags);
    let match;
    while ((match = headerPattern.exec(content)) !== null) {
      ids.add(match[1]!);
    }
  }
  return ids;
}

interface XlsxScan {
  ids: Set<string>;
  /** TC ID → sheets it appears on (guardrail 4: must be exactly 1 each). */
  idSheets: Map<string, string[]>;
  /** TC ID → workbook Title cell (guardrail 5). */
  titles: Map<string, string>;
}

let xlsxScan: XlsxScan | null = null;
function getXlsxScan(): XlsxScan {
  if (xlsxScan) return xlsxScan;
  const scan: XlsxScan = { ids: new Set(), idSheets: new Map(), titles: new Map() };
  const workbookPath = SHARED_PATHS.workbook;
  if (!fs.existsSync(workbookPath)) return (xlsxScan = scan);
  const wb = XLSX.readFile(workbookPath, { cellDates: false, cellNF: false });
  for (const sheetName of wb.SheetNames) {
    if (sheetName === 'Overview') continue;
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
    for (const row of rows) {
      const idCell = row['TC ID'];
      if (typeof idCell !== 'string' || !/^TC-/.test(idCell)) continue;
      scan.ids.add(idCell);
      const sheets = scan.idSheets.get(idCell) ?? [];
      sheets.push(sheetName);
      scan.idSheets.set(idCell, sheets);
      const titleCell = row['Title'];
      if (typeof titleCell === 'string' && !scan.titles.has(idCell)) scan.titles.set(idCell, titleCell);
    }
  }
  return (xlsxScan = scan);
}

function getXlsxTcIds(): Set<string> {
  return getXlsxScan().ids;
}

function findMarkdownFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

function setDiff(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter(x => !b.has(x)).sort();
}

// ── Guardrail 4: cross-sheet duplicate TC IDs ──────────────────────────────────

function findCrossSheetDuplicates(): Array<{ id: string; sheets: string[] }> {
  const dups: Array<{ id: string; sheets: string[] }> = [];
  for (const [id, sheets] of getXlsxScan().idSheets) {
    if (sheets.length > 1) dups.push({ id, sheets });
  }
  return dups.sort((a, b) => a.id.localeCompare(b.id));
}

// ── Guardrail 5: gross spec↔xlsx content mismatch (Notes-revert class) ─────────

/** Tokenize for overlap: lowercase alphanumeric words. The xlsx Title passes through
 *  scrubInternalVocab (em-dash→hyphen, spinbutton→field, …), so exact-match is wrong;
 *  token overlap tolerates the scrub while still catching different-test-entirely. */
function titleTokens(s: string): Set<string> {
  return new Set((s.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(t => t.length > 1));
}

function tokenOverlap(a: string, b: string): number {
  const ta = titleTokens(a);
  const tb = titleTokens(b);
  if (ta.size === 0 || tb.size === 0) return 1; // nothing to compare — not a signal
  let hit = 0;
  for (const t of ta) if (tb.has(t)) hit++;
  return hit / Math.min(ta.size, tb.size);
}

/** Module key = TC ID minus its trailing numeric segment (TC-LOC-LI-NE-011 → TC-LOC-LI-NE). */
function moduleKey(id: string): string {
  return id.replace(/-\d+[A-Z]?$/, '');
}

function numericSuffix(id: string): number {
  const m = id.match(/-(\d+)[A-Z]?$/);
  return m && m[1] ? parseInt(m[1], 10) : -1;
}

const GROSS_OVERLAP_THRESHOLD = 0.34; // below this a shared title counts as grossly divergent
const MODULE_FAIL_FRACTION = 0.5; // FAIL when ≥50% of a module's shared titles are gross …
const MODULE_FAIL_MIN_GROSS = 5; // … and at least 5 TCs are affected …

interface ContentMismatchReport {
  warnings: string[];
  failures: string[];
}

function checkSpecXlsxContentMismatch(specTitles: Map<string, string>): ContentMismatchReport {
  const { titles: xlsxTitles, ids: xlsxIds } = getXlsxScan();
  const report: ContentMismatchReport = { warnings: [], failures: [] };

  // group shared IDs by module
  const byModule = new Map<string, Array<{ id: string; overlap: number }>>();
  for (const [id, specTitle] of specTitles) {
    const xlsxTitle = xlsxTitles.get(id);
    if (xlsxTitle === undefined) continue; // export-gap is guardrail 2's job
    const list = byModule.get(moduleKey(id)) ?? [];
    list.push({ id, overlap: tokenOverlap(specTitle, xlsxTitle) });
    byModule.set(moduleKey(id), list);
  }

  for (const [mod, entries] of byModule) {
    const gross = entries.filter(e => e.overlap < GROSS_OVERLAP_THRESHOLD);
    if (gross.length === 0) continue;

    // id-set drift: workbook numbering runs past the spec's numbering for this module
    // (the revert signature — MD 059..064 vs spec max 058).
    const specMax = Math.max(...entries.map(e => numericSuffix(e.id)));
    const xlsxBeyondSpec = [...xlsxIds].filter(
      id => moduleKey(id) === mod && numericSuffix(id) > specMax
    );

    const frac = gross.length / entries.length;
    const detail =
      `${mod}: ${gross.length}/${entries.length} shared titles grossly divergent ` +
      `(overlap < ${GROSS_OVERLAP_THRESHOLD})` +
      (xlsxBeyondSpec.length > 0 ? `; workbook numbering exceeds spec max by ${xlsxBeyondSpec.length} IDs (${xlsxBeyondSpec.slice(0, 3).join(', ')}…)` : '') +
      ` — e.g. ${gross.slice(0, 3).map(g => g.id).join(', ')}`;

    if (frac >= MODULE_FAIL_FRACTION && gross.length >= MODULE_FAIL_MIN_GROSS && xlsxBeyondSpec.length > 0) {
      report.failures.push(detail);
    } else {
      report.warnings.push(detail);
    }
  }
  return report;
}

/** Self-test (mirrors the regex self-test pattern above): the guardrail-5 detector
 *  must classify a synthetic reverted-module signature as FAIL-grade. */
function assertContentMismatchDetectorWorks(): void {
  const same = tokenOverlap('Verify a room Inactive toggle persists after save and reload',
    'Verify a room Inactive toggle persists after save and reload');
  const scrubbed = tokenOverlap('Paste exceeds 4000 char limit — counter shows overage',
    'Paste exceeds 4000 char limit - counter shows overage');
  const divergent = tokenOverlap('Verify deleting the only note row returns the empty state',
    'Save → Escape key on dialog → dialog closes, dirty preserved, no persist');
  if (same < 0.99 || scrubbed < 0.99 || divergent >= GROSS_OVERLAP_THRESHOLD) {
    throw new Error(
      `check-tc-parity guardrail-5 self-test FAILED: same=${same} scrubbed=${scrubbed} divergent=${divergent}`
    );
  }
}
assertContentMismatchDetectorWorks();

// --- Main ---
const specIds = getSpecTcIds();
const mdIds = getMarkdownTcIds();
const xlsxIds = getXlsxTcIds();

const inSpecNotMd = setDiff(specIds, mdIds);
const inSpecNotXlsx = setDiff(specIds, xlsxIds);
const inMdNotXlsx = setDiff(mdIds, xlsxIds);
const inMdNotSpec = setDiff(mdIds, specIds);

let hasIssues = false;

console.log('=== TC Parity Report ===\n');
console.log(`Spec TCs:     ${specIds.size}`);
console.log(`Markdown TCs: ${mdIds.size}`);
console.log(`XLSX TCs:     ${xlsxIds.size}\n`);

if (inSpecNotMd.length > 0) {
  hasIssues = true;
  console.log(`CRITICAL: ${inSpecNotMd.length} TCs in specs but NOT in markdown (missing from client deliverable):`);
  inSpecNotMd.forEach(id => console.log(`  - ${id}`));
  console.log('');
}

if (inSpecNotXlsx.length > 0) {
  hasIssues = true;
  console.log(`CRITICAL: ${inSpecNotXlsx.length} TCs in specs but NOT in XLSX (export gap):`);
  inSpecNotXlsx.forEach(id => console.log(`  - ${id}`));
  console.log('');
}

if (inMdNotXlsx.length > 0) {
  hasIssues = true;
  console.log(`WARNING: ${inMdNotXlsx.length} TCs in markdown but NOT in XLSX (parser/export bug):`);
  inMdNotXlsx.forEach(id => console.log(`  - ${id}`));
  console.log('');
}

// Guardrail 4 — cross-sheet duplicate TC IDs (orphan-sheet class)
const dupIds = findCrossSheetDuplicates();
if (dupIds.length > 0) {
  hasIssues = true;
  console.log(`CRITICAL: ${dupIds.length} TC IDs appear on MORE THAN ONE workbook sheet (orphan/duplicate sheet):`);
  dupIds.forEach(d => console.log(`  - ${d.id} on [${d.sheets.join(', ')}]`));
  console.log('');
}

// Guardrail 5 — gross spec↔xlsx content mismatch (reverted-content class)
const contentReport = checkSpecXlsxContentMismatch(getSpecTitles());
if (contentReport.failures.length > 0) {
  hasIssues = true;
  console.log(`CRITICAL: spec↔XLSX content mismatch — module(s) carry reverted/foreign content under matching IDs:`);
  contentReport.failures.forEach(f => console.log(`  - ${f}`));
  console.log('');
}
if (contentReport.warnings.length > 0) {
  console.log(`FLAG (non-fatal): spec↔XLSX title divergence worth a look:`);
  contentReport.warnings.forEach(w => console.log(`  - ${w}`));
  console.log('');
}

console.log(`INFO: ${inMdNotSpec.length} TCs in markdown but not yet in specs (planned, not implemented)`);
console.log('');

if (!hasIssues) {
  console.log('PASS: All spec TCs are present in both markdown and XLSX deliverable.');
} else {
  console.log('FAIL: Parity issues detected. Fix markdown gaps, then rebuild XLSX via `npm run xlsx:build`.');
}

process.exit(hasIssues ? 1 : 0);
