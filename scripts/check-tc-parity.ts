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
import { FINGERPRINT_SHEET } from '../export_test_cases/to-xlsx';

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

// ── Guardrail 6: semantic ID ↔ module ↔ sheet congruence (registry-driven) ────
// ── Guardrail 7: BUG-ID grammar over live artifacts ──────────────────────────
// PLAN_ID_NAMING_AUDIT_AND_REMEDIATION (2026-06-11). Single source of truth:
// export_test_cases/module-codes.json. The audit proved every prior check was
// set-based — a TC-LOC-CPR-608 inside corporate-pricing artifacts (wrong module
// segment) passed guardrails 1-5, C1-C7, and shipped Module="locations" to the
// client workbook. Guardrail 6 makes the MEANING checkable.

// Use the exported constant from the generator (shared single source of truth).
const FINGERPRINT_SHEET_NAME = FINGERPRINT_SHEET;

interface ModuleRegistry {
  modules: Record<string, { name: string; display: string; dir: string }>;
  submodules: Record<string, Record<string, { name: string; display: string; sheet: string; mdBasename: string }>>;
  gapLedger: Record<string, { cause: string; evidence: string }>;
  exceptions: Array<{ rule: string; subject: string; rationale?: string; date?: string }>;
}

function loadModuleRegistry(): ModuleRegistry {
  const regPath = path.join(__dirname, '..', 'export_test_cases', 'module-codes.json');
  const reg = JSON.parse(fs.readFileSync(regPath, 'utf8').replace(/^﻿/, '')) as ModuleRegistry;
  if (!reg?.modules?.LOC?.dir || !reg?.submodules?.LOC?.CUR?.sheet) {
    throw new Error('check-tc-parity: module-codes.json failed shape self-test (modules/submodules missing)');
  }
  // Drift gate: types.ts KNOWN_SUB_CODES must equal the registry's code set.
  const regCodes = new Set(Object.values(reg.submodules).flatMap(m => Object.keys(m)));
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { KNOWN_SUB_CODES } = require('../export_test_cases/types') as { KNOWN_SUB_CODES: readonly string[] };
  const tsCodes = new Set(KNOWN_SUB_CODES);
  const onlyReg = [...regCodes].filter(c => !tsCodes.has(c));
  const onlyTs = [...tsCodes].filter(c => !regCodes.has(c));
  if (onlyReg.length || onlyTs.length) {
    throw new Error(
      `check-tc-parity: KNOWN_SUB_CODES (types.ts) drifted from module-codes.json — ` +
      `registry-only: [${onlyReg.join(',')}] types-only: [${onlyTs.join(',')}]. Mint codes in the registry FIRST, mirror in types.ts.`
    );
  }
  return reg;
}

function isExcepted(reg: ModuleRegistry, rule: string, subject: string): boolean {
  const hit = reg.exceptions.find(e => e.rule === rule && (e.subject === subject || (e.subject.endsWith('*') && subject.startsWith(e.subject.slice(0, -1)))));
  if (hit) console.log(`NOTE: ${subject} allowed by exception ${hit.rule} (${hit.date ?? '?'} — ${hit.rationale ?? 'no rationale recorded'})`);
  return !!hit;
}

/** Parse TC-{MOD}-{SUB}-{tail}; returns null for non-conforming shapes. */
function parseTcId(id: string): { mod: string; sub: string; tail: string; extraSegments: boolean } | null {
  const m = id.match(/^TC-([A-Z]+)-([A-Z]+)-(.+)$/);
  if (!m) return null;
  const tail = m[3]!;
  const extraSegments = /^[A-Z]+-/.test(tail); // a 3rd alpha segment before the number = out of grammar
  return { mod: m[1]!, sub: m[2]!, tail, extraSegments };
}

function runGuardrail6and7(reg: ModuleRegistry, mdIdsBySheetExpectation: Set<string>): { failures: string[]; warnings: string[] } {
  const failures: string[] = [];
  const warnings: string[] = [];
  const testCasesDir = SHARED_PATHS.testCases;

  // sheet -> {modCode, subCode, entry}
  const sheetOwner = new Map<string, { mod: string; sub: string; name: string; idModule?: string; idSubmodule?: string }>();
  for (const [mod, subs] of Object.entries(reg.submodules)) {
    for (const [sub, entry] of Object.entries(subs)) sheetOwner.set(entry.sheet, { mod, sub, name: entry.name, idModule: (entry as any).idModule, idSubmodule: (entry as any).idSubmodule });
  }

  // 6a/6b/6c — MD headers: module/submodule codes registered + match dir/basename
  for (const file of findMarkdownFiles(testCasesDir)) {
    const dirName = path.basename(path.dirname(file));
    const baseName = path.basename(file, '.md');
    const content = fs.readFileSync(file, 'utf8');
    const headerPattern = new RegExp(MD_HEADER_TC_PATTERN.source, MD_HEADER_TC_PATTERN.flags);
    let match;
    while ((match = headerPattern.exec(content)) !== null) {
      const id = match[1]!;
      const parsed = parseTcId(id);
      if (!parsed) { if (!isExcepted(reg, 'G6-SHAPE', id)) failures.push(`[G6] non-grammar TC ID shape: ${id} in ${baseName}.md`); continue; }
      if (parsed.extraSegments) { if (!isExcepted(reg, 'G6-SHAPE', id)) failures.push(`[G6] extra ID segment (4+) in ${id} (${baseName}.md) — grammar is TC-{MOD}-{SUB}-{NNN[A]}`); continue; }
      const mod = reg.modules[parsed.mod];
      if (!mod) { if (!isExcepted(reg, 'G6a-MODULE', id)) failures.push(`[G6a] unregistered module code "${parsed.mod}" in ${id} (${baseName}.md)`); continue; }
      if (mod.dir !== dirName && !isExcepted(reg, 'G6b-DIR', id)) {
        const crossGroupDir = Object.entries(reg.submodules).some(([ownerMod, subs]) =>
          Object.values(subs).some((e: any) => e.idModule === parsed.mod && e.idSubmodule === parsed.sub && reg.modules[ownerMod]?.dir === dirName)
        );
        if (!crossGroupDir) failures.push(`[G6b] ${id} carries module ${parsed.mod} (dir "${mod.dir}") but lives in test-cases/setup/${dirName}/`);
      }
      const sub = reg.submodules[parsed.mod]?.[parsed.sub];
      if (!sub) { if (!isExcepted(reg, 'G6c-SUB', id)) failures.push(`[G6c] unregistered submodule code "${parsed.mod}/${parsed.sub}" in ${id} (${baseName}.md)`); continue; }
      if (sub.mdBasename !== baseName && !isExcepted(reg, 'G6c-SUB', id)) {
        // Cross-group awareness: when a submodule declares idModule/idSubmodule matching
        // this TC's codes, the case is legitimately located in that submodule's file.
        const crossGroupFile = Object.entries(reg.submodules).some(([, subs]) =>
          Object.values(subs).some((e: any) => e.idModule === parsed.mod && e.idSubmodule === parsed.sub && e.mdBasename === baseName)
        );
        if (!crossGroupFile) failures.push(`[G6c] ${id} (submodule ${parsed.sub} → ${sub.mdBasename}.md) found in ${baseName}.md`);
      }
    }
  }

  // 6b for specs — parse `--list` lines: "<file>:<line>:<col> › ... TC-..."
  for (const line of getSpecListOutput().split('\n')) {
    const fileMatch = line.match(/[›>]\s*([\w\\/.-]+\.spec\.ts):\d+:\d+/);
    const idMatch = line.match(TC_PATTERN);
    if (!fileMatch || !idMatch) continue;
    const specDir = path.basename(path.dirname(fileMatch[1]!.replace(/\\/g, '/')));
    const parsed = parseTcId(idMatch[0]);
    if (!parsed) continue;
    const mod = reg.modules[parsed.mod];
    if (mod && mod.dir !== specDir && !isExcepted(reg, 'G6b-DIR', idMatch[0])) {
      const crossGroupDir = Object.entries(reg.submodules).some(([ownerMod, subs]) =>
        Object.values(subs).some((e: any) => e.idModule === parsed.mod && e.idSubmodule === parsed.sub && reg.modules[ownerMod]?.dir === specDir)
      );
      if (!crossGroupDir) failures.push(`[G6b] spec ${fileMatch[1]} declares ${idMatch[0]} (module dir "${mod.dir}") under tests/${specDir}/`);
    }
  }

  // 6d/6e — workbook: Module/Submodule cells + row-ID prefix must match the sheet's registry owner
  const workbookPath = SHARED_PATHS.workbook;
  if (fs.existsSync(workbookPath)) {
    const wb = XLSX.readFile(workbookPath, { cellDates: false, cellNF: false });
    for (const sheetName of wb.SheetNames) {
      if (sheetName === 'Overview') continue;
      if (sheetName === FINGERPRINT_SHEET_NAME) continue;
      const owner = sheetOwner.get(sheetName);
      if (!owner) { failures.push(`[G6e] workbook sheet "${sheetName}" is not registered to any submodule in module-codes.json`); continue; }
      const expectModuleCell = reg.modules[owner.mod]!.name;
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[sheetName]!, { defval: '' });
      for (const row of rows) {
        const id = String(row['TC ID'] ?? '');
        if (!/^TC-/.test(id) || id === 'SUMMARY') continue;
        const modCell = String(row['Module'] ?? '');
        const subCell = String(row['Submodule'] ?? '');
        if (modCell !== expectModuleCell) { failures.push(`[G6d] ${sheetName}/${id}: Module cell "${modCell}" ≠ registry "${expectModuleCell}"`); break; }
        if (subCell !== owner.name) { failures.push(`[G6d] ${sheetName}/${id}: Submodule cell "${subCell}" ≠ registry "${owner.name}"`); break; }
        const parsed = parseTcId(id);
        if (parsed && (parsed.mod !== (owner.idModule || owner.mod) || parsed.sub !== (owner.idSubmodule || owner.sub)) && !isExcepted(reg, 'G6e-SHEET', id)) {
          failures.push(`[G6e] ${id} sits on sheet "${sheetName}" owned by ${owner.mod}/${owner.sub}`);
        }
      }
    }
  }

  // 6f — cross-ref liveness: blocked-reasons keys + TERSE_REASON_ALLOWLIST ⊆ MD ID set
  const blockedReasonsPath = path.join(__dirname, '..', 'export_test_cases', 'blocked-reasons.json');
  if (fs.existsSync(blockedReasonsPath)) {
    const keys = Object.keys(JSON.parse(fs.readFileSync(blockedReasonsPath, 'utf8').replace(/^﻿/, ''))).filter(k => k.startsWith('TC-'));
    for (const k of keys) if (!mdIdsBySheetExpectation.has(k)) failures.push(`[G6f] blocked-reasons.json key ${k} resolves to no test-cases MD header (orphan)`);
  }
  const lintRulesSrc = fs.readFileSync(path.join(__dirname, 'xlsx-lint-rules.mjs'), 'utf8');
  const allowlistBlock = lintRulesSrc.match(/TERSE_REASON_ALLOWLIST = new Set\(\[([\s\S]*?)\]\)/);
  if (allowlistBlock) {
    for (const m of allowlistBlock[1]!.matchAll(/'(TC-[A-Z0-9-]+)'/g)) {
      if (!mdIdsBySheetExpectation.has(m[1]!)) failures.push(`[G6f] TERSE_REASON_ALLOWLIST entry ${m[1]} resolves to no test-cases MD header (stale)`);
    }
  }

  // 6g — numbering gaps must be in the gapLedger (WARN — never renumber)
  const byFamily = new Map<string, number[]>();
  for (const id of mdIdsBySheetExpectation) {
    const fam = moduleKey(id);
    const n = numericSuffix(id);
    if (n < 0) continue;
    (byFamily.get(fam) ?? byFamily.set(fam, []).get(fam)!).push(n);
  }
  for (const [fam, nums] of byFamily) {
    const present = new Set(nums);
    const max = Math.max(...nums);
    for (let i = 1; i <= max; i++) {
      if (!present.has(i)) {
        const gapId = `${fam}-${String(i).padStart(3, '0')}`;
        if (!reg.gapLedger[gapId]) warnings.push(`[G6g] numbering gap ${gapId} not documented in module-codes.json gapLedger — document the cause or restore; NEVER renumber`);
      }
    }
  }

  // Guardrail 7 — BUG-ID grammar over live artifacts (MDs, test plans, specs)
  const bugScanDirs = [testCasesDir, path.join(testCasesDir, '..', '..', 'test-plans'), path.join(SHARED_PATHS.clientRoot, 'tests')];
  const BUG_RE = /\bBUG-[A-Z][A-Z0-9-]*-\d+\b/g;
  for (const dir of bugScanDirs) {
    if (!fs.existsSync(dir)) continue;
    const files: string[] = [];
    const walk = (d: string) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else if (/\.(md|ts)$/.test(e.name)) files.push(f); } };
    walk(dir);
    for (const f of files) {
      const content = fs.readFileSync(f, 'utf8');
      for (const m of content.matchAll(BUG_RE)) {
        const bugId = m[0];
        const bm = bugId.match(/^BUG-([A-Z]+)-([A-Z]+)-\d{1,4}$/);
        const valid = bm && reg.modules[bm[1]!] && reg.submodules[bm[1]!]?.[bm[2]!];
        if (!valid && !isExcepted(reg, 'G7-BUG', bugId)) {
          failures.push(`[G7] BUG ID "${bugId}" in ${path.relative(SHARED_PATHS.clientRoot, f)} violates BUG-{MOD}-{SUB}-{NNN} with registered codes (module-codes.json)`);
        }
      }
    }
  }

  return { failures, warnings };
}

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

// Guardrails 6 + 7 — semantic ID↔module↔sheet congruence + BUG grammar (registry-driven)
const moduleRegistry = loadModuleRegistry();
const g67 = runGuardrail6and7(moduleRegistry, mdIds);
if (g67.failures.length > 0) {
  hasIssues = true;
  console.log(`CRITICAL: ${g67.failures.length} semantic ID/grammar violation(s) (guardrails 6/7 — module-codes.json):`);
  g67.failures.forEach(f => console.log(`  - ${f}`));
  console.log('');
}
if (g67.warnings.length > 0) {
  console.log(`FLAG (non-fatal): ${g67.warnings.length} guardrail-6 warning(s):`);
  g67.warnings.slice(0, 20).forEach(w => console.log(`  - ${w}`));
  if (g67.warnings.length > 20) console.log(`  ... +${g67.warnings.length - 20} more`);
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
