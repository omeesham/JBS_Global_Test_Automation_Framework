/**
 * sp00-augment-logic.ts — SP00 augmentation extracted into a testable module.
 *
 * Two-mode build (per PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION §183-196):
 *
 *   - list-only (default for `npm run xlsx:build`):
 *       Runs `npx playwright test --list --reporter=json` in clients/encore/.
 *       TC ID present in --list output → Coverage Status = "Automated".
 *       TC ID present in MD but absent from --list → Coverage Status = "Pending Automation".
 *       --list mode = test → Automation Execution = "Pass" (ASSUMED — see caveat).
 *       mode = skip → "Skipped". mode = fixme → "Blocked". absent → empty.
 *
 *   - with-run (for `npm run xlsx:build:with-run`):
 *       Runs `npx playwright test --reporter=json` and reads actual pass/fail.
 *
 * Caveat (must echo on every xlsx:build invocation): list-only Pass = "automated +
 * not skipped/fixme; last run results require a fresh `playwright test` to be
 * authoritative." with-run rebuilds with actual run results.
 *
 * Failure-reason extraction (both modes):
 *   - Source-file regex `test.fixme(true, '<reason>')` per TC ID.
 *   - Fallback `// FIXME: <reason>` line via `scripts/scan-fixmes.ts` registry
 *     (`reports/fixme-registry.json`).
 *
 * Historical: a `from-csv` mode (Phase A bootstrap) read augment columns from
 * `clients/encore/test_cases_csv/*.csv` when playwright was unavailable. Both
 * the explicit `from-csv` branch and the playwright-failure fallback were
 * removed on 2026-05-27 (post-audit cleanup) along with the `augmentFromCsv()`
 * helper, the `csvDir` option, and the `'from-csv'` AugmentMode value — the
 * underlying CSV directory was deleted in Phase D and the path is permanently
 * dead.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';

export type AugmentMode = 'list-only' | 'with-run';

export interface AugmentData {
  coverageStatus: 'Automated' | 'Pending Automation' | 'Manual' | '';
  automationExecution: 'Pass' | 'Fail' | 'Skipped' | 'Blocked' | '';
  ifFailedReason: string;
}

export interface AugmentOptions {
  mode: AugmentMode;
  /** Path to clients/<id>/ — playwright config + specs live here. */
  clientRoot: string;
  /** Path to reports/fixme-registry.json (optional fallback reason source). */
  fixmeRegistryPath?: string;
}

const REPO_ROOT = path.resolve(__dirname, '..');

/** Build augment map by mode for a known set of TC IDs. */
export function augmentByTcId(
  tcIds: string[],
  opts: AugmentOptions
): Map<string, AugmentData> {
  const result = new Map<string, AugmentData>();
  for (const id of tcIds) {
    result.set(id, { coverageStatus: '', automationExecution: '', ifFailedReason: '' });
  }

  // Run playwright (sole augment source post-2026-05-27 audit cleanup).
  try {
    const tests = listPlaywrightTests(opts.clientRoot);
    for (const t of tests) {
      const data = result.get(t.tcId);
      if (!data) continue;
      data.coverageStatus = 'Automated';
      if (opts.mode === 'list-only') {
        // mode=test → assumed Pass; skip → Skipped; fixme → Blocked
        if (t.kind === 'fixme') data.automationExecution = 'Blocked';
        else if (t.kind === 'skip') data.automationExecution = 'Skipped';
        else data.automationExecution = 'Pass';
      }
    }
    // Pending Automation for TC IDs not in playwright list
    for (const [id, data] of result) {
      if (!data.coverageStatus) data.coverageStatus = 'Pending Automation';
    }
  } catch (err) {
    // Playwright invocation failed — surface to stderr so callers know augment
    // columns will be empty. The previous CSV-inherit fallback was removed on
    // 2026-05-27 (post-audit cleanup) along with the test_cases_csv directory.
    process.stderr.write(
      `[sp00-augment] playwright invocation failed (${(err as Error).message}); ` +
      `augment columns will remain empty for this build\n`
    );
  }

  // Reason extraction from source-file fixme regex (best-effort)
  const reasonByTcId = scanFixmeReasons(opts.clientRoot, opts.fixmeRegistryPath);
  for (const [id, reason] of reasonByTcId) {
    const data = result.get(id);
    if (data && !data.ifFailedReason) data.ifFailedReason = reason;
  }

  // ROOT-FIX (2026-06-05, LR-ENC-004): a `test.fixme(true, '<reason>')` called
  // INSIDE a test body is a RUNTIME skip — invisible to `playwright --list`
  // (list-only mode), which reports the test as a plain `test`, so the loop above
  // assumes 'Pass'. The reason string above still gets scraped, producing a
  // Pass+reason contradiction (TC-LOC-SSL-001/041/042/043/044). Re-scan the specs,
  // attribute each runtime fixme to its ENCLOSING `test('TC-...')` declaration
  // (NOT a TC ID embedded in the reason text — scraping the reason was the join
  // bug, since SSL reasons cross-reference sibling TC IDs), and force those rows
  // to 'Blocked' + the real reason. The emit-layer throw in to-xlsx.ts guards any
  // residual Pass+reason as a hard integrity failure.
  const specFixmes = scanSpecRuntimeFixmes(opts.clientRoot);
  for (const [id, reason] of specFixmes) {
    const data = result.get(id);
    if (!data) continue;
    if (!data.ifFailedReason || data.ifFailedReason === 'test.fixme() call in spec') {
      data.ifFailedReason = reason;
    }
    if (data.automationExecution === 'Pass' || data.automationExecution === '') {
      data.automationExecution = 'Blocked';
    }
  }

  return result;
}

/**
 * Scan specs for runtime `test.fixme(true, '<reason>')` calls and attribute each
 * to the TC ID of its ENCLOSING `test(...)` declaration by walking BACKWARD to the
 * nearest test-declaration line. Deliberately NOT the reason text: SSL reasons
 * cross-reference sibling TC IDs (e.g. "Same pattern as TC-LOC-SSL-030"), so
 * scraping the reason string mis-attributes the fixme to the cited sibling — that
 * was the Pass+reason join bug. Returns Map<enclosingTcId, reasonString>.
 */
function scanSpecRuntimeFixmes(clientRoot: string): Map<string, string> {
  const out = new Map<string, string>();
  const specsDir = path.join(clientRoot, 'specs');
  if (!fs.existsSync(specsDir)) return out;
  // Matches `test('TC-...'`, `test.fixme('TC-...'`, `test.skip('TC-...'`, `test.only('TC-...'`.
  const TEST_DECL = /\btest(?:\.(?:fixme|skip|only))?\s*\(\s*[`'"](TC-[A-Z]+-[A-Z]+-[A-Za-z0-9-]+)/;
  for (const file of walkSpecs(specsDir)) {
    const lines = fs.readFileSync(file, 'utf-8').split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i]!.match(/test\.fixme\(\s*true\s*,\s*([`'"])([^`'"]*)\1/);
      if (!m) continue;
      const reason = (m[2] ?? '').trim();
      if (!reason) continue;
      for (let j = i; j >= Math.max(0, i - 40); j--) {
        const d = lines[j]!.match(TEST_DECL);
        if (d && d[1]) {
          if (!out.has(d[1])) out.set(d[1], reason);
          break;
        }
      }
    }
  }
  return out;
}

/** List playwright tests via --list --reporter=json. */
interface ListedTest {
  tcId: string;
  kind: 'test' | 'skip' | 'fixme';
}

function listPlaywrightTests(clientRoot: string): ListedTest[] {
  // Windows: `npx` is not directly findable by execFileSync — Node looks for
  // an exact `npx` filename, but Windows ships `npx.cmd`. shell:true gets the
  // shell to resolve PATHEXT. Linux/mac honor `npx` directly. (PLAN_CSV_TO_XLSX_
  // DELIVERABLE_MIGRATION Phase D-prep — was silently falling back to
  // CSV-inherit and emitting Coverage Status=0 workbook-wide.)
  const isWin = process.platform === 'win32';
  const out = execFileSync(isWin ? 'npx.cmd' : 'npx', ['playwright', 'test', '--list', '--reporter=json'], {
    cwd: clientRoot,
    encoding: 'utf-8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: isWin,
  });
  // Reporter output may be preceded by an "Listing tests:" banner line on some platforms.
  // Strip everything before the first '{' to be safe.
  const firstBrace = out.indexOf('{');
  if (firstBrace < 0) throw new Error('playwright --list produced no JSON');
  const parsed = JSON.parse(out.slice(firstBrace));
  const tests: ListedTest[] = [];
  walkSuite(parsed, tests);
  return tests;
}

function walkSuite(node: any, out: ListedTest[]): void {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node.suites)) for (const s of node.suites) walkSuite(s, out);
  if (Array.isArray(node.specs)) {
    for (const spec of node.specs) {
      const tcId = extractTcIdFromTitle(spec.title || '');
      if (!tcId) continue;
      // spec.tests[*].annotations[*].type may include 'skip' or 'fixme'.
      let kind: 'test' | 'skip' | 'fixme' = 'test';
      const annotations: any[] = [];
      if (Array.isArray(spec.tests)) {
        for (const t of spec.tests) {
          if (Array.isArray(t.annotations)) annotations.push(...t.annotations);
        }
      }
      if (annotations.some(a => a?.type === 'fixme')) kind = 'fixme';
      else if (annotations.some(a => a?.type === 'skip')) kind = 'skip';
      out.push({ tcId, kind });
    }
  }
}

/** Extract TC ID from spec title (e.g. "TC-LOC-CUR-001: verify ..."). */
const TC_ID_IN_TITLE = /\b(TC-[A-Z]+-[A-Z]+-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)\b/;
function extractTcIdFromTitle(title: string): string | null {
  const m = title.match(TC_ID_IN_TITLE);
  return m && m[1] ? m[1] : null;
}

/**
 * Curated registry reasons from `reports/fixme-registry.json` (scripts/scan-fixmes.ts
 * output + baseline-restoration entries). Spec runtime `test.fixme(true,'...')` reasons
 * are handled separately by `scanSpecRuntimeFixmes` with correct enclosing-test
 * attribution — the former forward-walk here grabbed TC IDs from reason text AND from
 * adjacent `dependencyGate([...])` calls, smearing a blocked sibling's reason onto a
 * passing test (e.g. TC-LOC-SSL-001). Removed 2026-06-05 (LR-ENC-004).
 */
function scanFixmeReasons(clientRoot: string, registryPath?: string): Map<string, string> {
  const out = new Map<string, string>();
  if (registryPath && fs.existsSync(registryPath)) {
    try {
      const reg = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      const entries: any[] = Array.isArray(reg) ? reg : (reg.entries || []);
      for (const e of entries) {
        if (e?.tcId && e?.reason && !out.has(e.tcId)) out.set(e.tcId, String(e.reason));
      }
    } catch {
      // Bad registry — skip silently
    }
  }
  return out;
}

function walkSpecs(dir: string): string[] {
  const acc: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) acc.push(...walkSpecs(full));
    else if (entry.isFile() && entry.name.endsWith('.spec.ts')) acc.push(full);
  }
  return acc;
}

// ────────────────────────── Blocked Overlay (post-A bugfix 2026-05-27) ──────────────────────────
//
// Historical context: Phase A's `--from-csv` mode (removed 2026-05-27) read CSVs directly and
// never invoked augmentByTcId(), so the XLSX had an empty 'Automation Execution' column for
// every fixme'd / blocked TC. The Blocked Overlay survives as a registry-driven post-pass so
// the same Blocked rows render correctly under the now-sole MD-primary path.
// fixme-registry.json knows about 28 distinct Blocked TCs across two classes:
//   - Cat-A / NOT-AUTOMATABLE: registered via `// FIXME TC-NNN (reason)` comments scanned by
//     scripts/scan-fixmes.ts (location-local-information.spec.ts lines 473-476). These have
//     specific reasons and SHORT-FORM TC IDs (TC-LOC-037) that need expansion to long-form
//     (TC-LOC-LI-037) to match CSV/XLSX TC IDs.
//   - FIXME-CALL: registered when scan-fixmes detects `test.fixme(...)` literally in spec body.
//     Generic placeholder reason "test.fixme() call in spec"; some entries have tcId=UNKNOWN when
//     the scanner could not extract a TC ID. Real reason lives in the spec's `test.fixme(true, '...')`
//     reason argument and must be read at the registered file:line.
//
// applyBlockedOverlay() is called by to-xlsx.ts:buildWorkbook() after MD-primary parsing completes.
// Pure registry-driven (no playwright --list invocation). Side-effect: mutates tcsBySheet rows.

/** Read the actual `test.fixme(true, '<reason>')` text at or near a given file:line. */
function readFixmeReasonAt(specFile: string, line: number, repoRoot: string): string | null {
  const fullPath = path.isAbsolute(specFile) ? specFile : path.join(repoRoot, specFile);
  if (!fs.existsSync(fullPath)) return null;
  const lines = fs.readFileSync(fullPath, 'utf-8').split(/\r?\n/);
  // Inspect line ± 3 (scan-fixmes occasionally reports off-by-one).
  for (let i = Math.max(0, line - 3); i < Math.min(lines.length, line + 3); i++) {
    const m = lines[i]!.match(/test\.fixme\(\s*true\s*,\s*(['"`])([^'"`]*)\1/);
    if (m && m[2]) return m[2];
  }
  return null;
}

/**
 * Infer the submodule code (e.g. "LI", "NTS", "SSL") from a spec file by reading its first
 * `test('TC-XXX-YYY-NNN':...)` declaration. Without this, expansion of short-form TC IDs
 * like TC-LOC-008 is ambiguous — there can be TC-LOC-ACC-008, TC-LOC-LI-008, etc. in CSV.
 */
function inferSubmoduleCode(specFile: string, repoRoot: string, tcIdHead: string): string | null {
  const fullPath = path.isAbsolute(specFile) ? specFile : path.join(repoRoot, specFile);
  if (!fs.existsSync(fullPath)) return null;
  const content = fs.readFileSync(fullPath, 'utf-8');
  const escHead = tcIdHead.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`test(?:\\.fixme)?\\(\\s*['"\`]${escHead}-([A-Z]+)-[A-Za-z0-9]+`);
  const m = content.match(re);
  return m && m[1] ? m[1] : null;
}

/**
 * Short form (TC-LOC-037) → long form (TC-LOC-LI-037) via SPEC-FILE submodule inference.
 * Iterating knownTcIds and taking the first match was broken: TC-LOC-008 would resolve to
 * whichever sheet appeared first (often TC-LOC-ACC-008) instead of the correct TC-LOC-LI-008.
 * Submodule code comes from the spec file at registry entry's `file` field.
 */
function expandShortTcIdViaSpec(
  shortTcId: string,
  specFile: string,
  repoRoot: string,
  knownTcIds: Set<string>
): string | null {
  const tail = shortTcId.match(/-(\d+[A-Z]?)$/);
  if (!tail) return null;
  const suffix = tail[1]!;
  const headParts = shortTcId.split('-').slice(0, -1);
  if (headParts.length < 2) return null;
  const head = headParts.join('-'); // "TC-LOC"
  const submoduleCode = inferSubmoduleCode(specFile, repoRoot, head);
  if (!submoduleCode) return null;
  const candidate = `${head}-${submoduleCode}-${suffix}`;
  return knownTcIds.has(candidate) ? candidate : null;
}

/** UNKNOWN tcId → resolve by walking spec file ±30 lines for nearest `test(...TC-XXX-YYY-NNN...)`. */
function walkSpecForTcId(
  specFile: string,
  line: number,
  repoRoot: string,
  knownTcIds: Set<string>
): string | null {
  const fullPath = path.isAbsolute(specFile) ? specFile : path.join(repoRoot, specFile);
  if (!fs.existsSync(fullPath)) return null;
  const lines = fs.readFileSync(fullPath, 'utf-8').split(/\r?\n/);
  for (let radius = 0; radius <= 30; radius++) {
    for (const dir of [-1, 1]) {
      const idx = line - 1 + radius * dir;
      if (idx < 0 || idx >= lines.length) continue;
      const m = lines[idx]!.match(/test(?:\.fixme)?\(\s*['"`](TC-[A-Z]+-[A-Z]+-[A-Za-z0-9]+)/);
      if (m && m[1] && knownTcIds.has(m[1])) return m[1];
    }
  }
  return null;
}

/** Resolve a single registry entry to {tcId, reason} pair against the known TC ID set. */
function resolveRegistryEntry(
  entry: { tcId?: string; reason?: string; file?: string; line?: number; category?: string },
  knownTcIds: Set<string>,
  repoRoot: string
): { tcId: string; reason: string } | null {
  if (!entry?.reason) return null;
  const rawTcId = String(entry.tcId || '').trim();
  let reason = String(entry.reason);

  // FIXME-CALL entries carry generic "test.fixme() call in spec" — upgrade to the actual fixme
  // reason text from the spec source file.
  if (entry.category === 'FIXME-CALL' && entry.file && typeof entry.line === 'number') {
    const specReason = readFixmeReasonAt(entry.file, entry.line, repoRoot);
    if (specReason) reason = specReason;
  }

  // Case 1: tcId matches a known TC ID directly.
  if (rawTcId && rawTcId !== 'UNKNOWN' && knownTcIds.has(rawTcId)) {
    return { tcId: rawTcId, reason };
  }

  // Case 2: short form (TC-LOC-037) — expand to long form (TC-LOC-LI-037) using the spec
  // file's first test() declaration to infer the submodule code unambiguously.
  if (rawTcId && rawTcId !== 'UNKNOWN' && entry.file) {
    const expanded = expandShortTcIdViaSpec(rawTcId, entry.file, repoRoot, knownTcIds);
    if (expanded) return { tcId: expanded, reason };
  }

  // Case 3: UNKNOWN — walk the spec file at file:line for the nearest test(TC-...) declaration.
  if ((rawTcId === 'UNKNOWN' || !rawTcId) && entry.file && typeof entry.line === 'number') {
    const walked = walkSpecForTcId(entry.file, entry.line, repoRoot, knownTcIds);
    if (walked) return { tcId: walked, reason };
  }

  return null;
}

/** Generic placeholder reason vs specific reason — specific wins on collision. */
function isMoreSpecificReason(candidate: string, existing: string): boolean {
  const generic = 'test.fixme() call in spec';
  if (existing === generic && candidate !== generic) return true;
  return false;
}

/**
 * Load fixme-registry.json and return Map<canonicalTcId, blockedReason>.
 * Skipped registry entries (unresolvable / no reason) emit stderr WARNs but never throw.
 */
export function loadBlockedFromRegistry(
  registryPath: string,
  repoRoot: string,
  knownTcIds: Set<string>
): Map<string, string> {
  const out = new Map<string, string>();
  if (!fs.existsSync(registryPath)) {
    process.stderr.write(`[overlay] WARN — registry not found at ${registryPath}; no Blocked overlay applied\n`);
    return out;
  }
  let registry: any[];
  try {
    const parsed = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
    registry = Array.isArray(parsed) ? parsed : (parsed?.entries ?? []);
  } catch (err) {
    process.stderr.write(`[overlay] WARN — registry parse failed: ${(err as Error).message}; no Blocked overlay\n`);
    return out;
  }

  let unresolved = 0;
  for (const entry of registry) {
    const r = resolveRegistryEntry(entry, knownTcIds, repoRoot);
    if (!r) {
      unresolved++;
      continue;
    }
    const prev = out.get(r.tcId);
    if (!prev || isMoreSpecificReason(r.reason, prev)) {
      out.set(r.tcId, r.reason);
    }
  }
  if (unresolved > 0) {
    process.stderr.write(`[overlay] note — ${unresolved} registry entry/entries unresolvable against known XLSX TC IDs (stale registry?)\n`);
  }
  return out;
}

/** Shape of a row produced by buildFromMdSource() in to-xlsx.ts. */
export interface BlockedOverlayRow {
  id: string;
  automationExecution: string;
  ifFailedReason: string;
}

/**
 * Apply Blocked overlay to tcsBySheet IN PLACE. Returns counts for observability.
 * Sets `automationExecution = 'Blocked'` and `ifFailedReason = <registry reason>` on
 * every TC ID present in the resolved registry overlay. Leaves all other cells untouched.
 *
 * Generic over `T extends BlockedOverlayRow` so callers can pass their own row type
 * (e.g. to-xlsx.ts:ParsedTc) without an explicit cast. Type assertions inside the loop
 * narrow T's possibly-tighter literal-union fields to plain `string` for the assignment.
 */
export function applyBlockedOverlay<T extends BlockedOverlayRow>(
  tcsBySheet: Map<string, T[]>,
  opts: { repoRoot: string; registryPath: string }
): { applied: number; unmatched: string[]; resolvedTcIds: string[] } {
  const knownTcIds = new Set<string>();
  for (const rows of tcsBySheet.values()) {
    for (const tc of rows) knownTcIds.add(tc.id);
  }
  const blockedMap = loadBlockedFromRegistry(opts.registryPath, opts.repoRoot, knownTcIds);

  let applied = 0;
  const matchedIds = new Set<string>();
  for (const rows of tcsBySheet.values()) {
    for (const tc of rows) {
      const reason = blockedMap.get(tc.id);
      if (reason == null) continue;
      // Cast through BlockedOverlayRow to bypass T's possibly-narrower literal-union type
      // on automationExecution (caller's ParsedTc has 'Pass'|'Fail'|'Skipped'|'Blocked'|'').
      (tc as BlockedOverlayRow).automationExecution = 'Blocked';
      (tc as BlockedOverlayRow).ifFailedReason = reason;
      applied++;
      matchedIds.add(tc.id);
    }
  }
  const unmatched = Array.from(blockedMap.keys()).filter(id => !matchedIds.has(id));
  for (const id of unmatched) {
    process.stderr.write(`[overlay] WARN — registry TC ${id} resolved but not found in any XLSX sheet (CSV may have dropped this TC; registry is stale)\n`);
  }
  return { applied, unmatched, resolvedTcIds: Array.from(blockedMap.keys()) };
}

// CLI: standalone smoke test
if (require.main === module) {
  const args = process.argv.slice(2);
  const mode = (args.find(a => a.startsWith('--mode='))?.split('=')[1] ?? 'list-only') as AugmentMode;
  const clientRoot = path.join(REPO_ROOT, 'clients', 'encore');
  // Demo: probe a few well-known TC IDs
  const demoIds = ['TC-LOC-CUR-001', 'TC-LOC-CUR-002', 'TC-LOS-BAS-001', 'TC-LOC-LP-001'];
  const map = augmentByTcId(demoIds, { mode, clientRoot });
  for (const [id, data] of map) {
    console.log(`${id}\t${data.coverageStatus}\t${data.automationExecution}\t${data.ifFailedReason}`);
  }
}
