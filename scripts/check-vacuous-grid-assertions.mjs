#!/usr/bin/env node
/**
 * check-vacuous-grid-assertions.mjs — systemic guard against vacuous grid/list assertions.
 *
 * A test that loops over a grid/list/row collection and asserts per-row, but never first asserts the
 * collection is non-empty, passes VACUOUSLY when the collection is empty — the loop body never runs,
 * so the test asserts nothing yet reports green. This is exactly how `TC-CPR-STR-013` ("Selected
 * strategy displays its assigned locations") kept passing after the fixture strategy lost all its
 * location assignments (its "Locations Using Pricing As Default" grid went empty): the test looped
 * over zero rows and asserted nothing. See agent-mistakes ALL-092.
 *
 * This guard statically scans `clients/<client>/tests/**\/*.spec.ts` for the pattern:
 *   for (const <x> of <rowCollection>) { ... expect(...) ... }
 *   <rowCollection>.forEach((<x>) => { ... expect(...) ... })
 * where <rowCollection> is (or resolves to) a grid/row getter result AND no non-zero-count guard
 * BOUND TO THAT SAME COLLECTION precedes the loop within the same test. It reports each such loop so
 * the author either adds a guard on the looped collection
 * (`expect(rows.length).toBeGreaterThan(0)` / `if (rows.length === 0) ...`), or — preferably — seeds
 * the data the test controls so the loop is never empty.
 *
 * SOUNDNESS / KNOWN LIMITATIONS — this is a **best-effort heuristic lint, not a proof**. It is
 * deliberately conservative (warn-only). Known blind spots:
 *   - Guard binding is per-LINE: a non-zero-count guard counts only when the looped collection's
 *     identifier and the count assertion appear on the SAME source line (the common
 *     `expect(rows.length).toBeGreaterThan(0)` shape). A guard split across two lines
 *     (`const n = rows.length; expect(n).toBeGreaterThan(0)`) is not recognised → may FALSE-POSITIVE.
 *   - The loop body is scanned within a 25-line window from the loop header; an `expect()` further
 *     down is not seen → may FALSE-NEGATIVE on very long loop bodies.
 *   - Only `for…of` and `<var>.forEach(` are scanned; `for(i…)` index loops and map/reduce chains
 *     are out of scope.
 *   - A membership assertion on a derived value (`expect(joined).toContain(x)`) is NOT treated as a
 *     guard (it cannot be bound to the looped collection), so such a test may FALSE-POSITIVE — add an
 *     explicit `expect(<collection>.length).toBeGreaterThan(0)`.
 * Because of these, do NOT ratchet to `--enforce` as a hard gate without first widening coverage;
 * warn-only surfaces the dominant `for…of getRows(){expect}` class (the TC-CPR-STR-013 bug) reliably.
 *
 * WARN-ONLY by default (exit 0). `--enforce` makes any finding exit 1 (opt-in CI/pre-commit gate).
 * `--baseline <json>` exits 1 only when findings exceed the baseline count (ratchet mode).
 *
 * Convention sibling: scripts/check-tc-mcp-citations.mjs (same pure-function + main() + .test.mjs shape).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..');

// A test-block start: test( / test.fixme( / test.skip( / test.only( / it( .
const TEST_START_RE = /\b(?:test|it)\s*(?:\.\w+)?\s*\(\s*(['"`])(.*?)\1/;
// A for-of loop header → captures (loopVar, iterableExpr).
const FOR_OF_RE = /\bfor\s*\(\s*(?:const|let|var)\s+(\w+)\s+of\s+(.+?)\)\s*\{?/;
// A `<receiver>.forEach(` call → captures the receiver identifier.
const FOREACH_RE = /\b(\w+)\.forEach\s*\(/;
// A row/grid/list collection getter name (the iterable signal).
const ROW_GETTER_RE = /\bget\w*(?:Rows|Locations|Cells|Items|Entries|Records|Results)\w*\s*\(/i;
// A `const rows = await p.getXrows()` style assignment → records the variable as a row collection.
const ROW_VAR_ASSIGN_RE = /\b(?:const|let|var)\s+(\w+)\s*=\s*(?:await\s+)?[\w.]*get\w*(?:Rows|Locations|Cells|Items|Entries|Records|Results)\w*\s*\(/i;
// Non-zero-count / empty-branch guard shapes. A guard makes a loop NON-vacuous ONLY when it appears
// on a line that ALSO names the looped collection (see `lineGuardsCollection`) — a guard on some
// OTHER collection, or a `.toContain` on a derived string, must NOT silence the check (that was the
// collection-agnostic false-negative this binding fixes). Membership assertions are intentionally
// NOT in this list: they cannot be bound to the looped collection, so they are not treated as guards.
const COUNT_OR_EMPTY_RES = [
  /\.toBeGreaterThan\s*\(\s*0\s*\)/,
  /\.toBeGreaterThanOrEqual\s*\(\s*[1-9]\d*\s*\)/,
  /\.not\.toHaveLength\s*\(\s*0\s*\)/,
  /\.toHaveLength\s*\(\s*[1-9]\d*\s*\)/,
  /\.length\s*\)\s*\.toBe\s*\(\s*[1-9]\d*\s*\)/,
  /\.length\b[^\n]*\.toBeGreaterThan(?:OrEqual)?\s*\(/,
  /\blength\s*[=!]==?\s*0\b/,           // if (rows.length === 0) … / !== 0
  /\blength\s*>\s*0\b/,                 // if (rows.length > 0) …
  /\bif\s*\(\s*!\s*[\w.]*\blength\b/,   // if (!rows.length) …
];

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/**
 * True when `line` asserts the non-emptiness of (or empty-branches on) the collection named `token`.
 * Binding rule: the token must appear on the line AND the line must carry a count/empty shape — so a
 * guard on a different collection (or a membership assertion on an unrelated value) does not count.
 */
function lineGuardsCollection(line, token) {
  if (!token) return false;
  if (!new RegExp(`\\b${escapeRegex(token)}\\b`).test(line)) return false;
  return COUNT_OR_EMPTY_RES.some((re) => re.test(line));
}

/**
 * Analyze one spec's source text. Returns an array of findings:
 *   { test, line, iterable, varName }
 * A finding = a for-of loop over a (resolved) row collection, whose body contains `expect(`, with no
 * non-zero/membership guard earlier in the same test block.
 *
 * @param {string} text — spec file source
 * @returns {Array<{test: string, line: number, iterable: string, varName: string}>}
 */
export function analyzeSpec(text) {
  const lines = String(text ?? '').split(/\r?\n/);

  // 1. Partition into test blocks: [startLine, endLine) per test( / it( .
  const blocks = [];
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(TEST_START_RE);
    if (m) {
      if (cur) { cur.end = i; blocks.push(cur); }
      cur = { name: m[2], start: i, end: lines.length };
    }
  }
  if (cur) blocks.push(cur);

  const findings = [];
  for (const block of blocks) {
    const rowVars = new Set();
    for (let i = block.start; i < block.end; i++) {
      const line = lines[i];

      // Record row-collection variables declared in this block.
      const assign = line.match(ROW_VAR_ASSIGN_RE);
      if (assign) rowVars.add(assign[1]);

      // Identify a candidate loop on this line: `for…of` OR `<var>.forEach(`.
      let varName = null;   // the per-iteration binding (diagnostic only)
      let iterable = null;  // raw iterable / receiver expression (diagnostic)
      let token = null;     // the collection identifier a guard must reference to count

      const forMatch = line.match(FOR_OF_RE);
      if (forMatch) {
        varName = forMatch[1];
        iterable = forMatch[2].trim();
        const bare = iterable.replace(/^await\s+/, '').trim();
        if (rowVars.has(bare)) {
          token = bare;                       // loop over a recorded row-collection variable
        } else if (ROW_GETTER_RE.test(iterable)) {
          const g = iterable.match(ROW_GETTER_RE);
          token = g ? g[0].replace(/\s*\($/, '') : bare; // inline getter → bind to the getter name
        }
      } else {
        const feMatch = line.match(FOREACH_RE);
        if (feMatch && rowVars.has(feMatch[1])) {
          varName = feMatch[1];
          iterable = `${feMatch[1]}.forEach`;
          token = feMatch[1];
        }
      }
      if (!token) continue; // not a loop over a recognised row collection

      // Body (loop / callback) must contain an assertion, else it is not asserting per-row at all.
      // NOTE: scanned within a 25-line window — an expect() further down is not seen (documented limit).
      const bodyEnd = Math.min(block.end, i + 25);
      const body = lines.slice(i, bodyEnd).join('\n');
      if (!/\bexpect\s*\(/.test(body)) continue;

      // Guarded iff some EARLIER line in this test block asserts non-emptiness of THIS collection
      // (per-line binding to `token` — a guard on a different collection does not count).
      const preLines = lines.slice(block.start, i + 1);
      const guarded = preLines.some((l) => lineGuardsCollection(l, token));
      if (guarded) continue;

      findings.push({ test: block.name, line: i + 1, iterable, varName });
    }
  }
  return findings;
}

// ---------- file walker ----------
export function walkSpecFiles(repoRoot) {
  const out = [];
  const clientsDir = path.join(repoRoot, 'clients');
  if (!fs.existsSync(clientsDir)) return out;
  for (const client of fs.readdirSync(clientsDir)) {
    const testsRoot = path.join(clientsDir, client, 'tests');
    if (!fs.existsSync(testsRoot)) continue;
    walkDir(testsRoot, out);
  }
  return out;
}

function walkDir(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walkDir(full, out); continue; }
    if (entry.isFile() && entry.name.endsWith('.spec.ts')) out.push(full);
  }
}

export function buildReport({ repoRoot, filePaths }) {
  const fileReports = [];
  let total = 0;
  for (const full of filePaths) {
    const rel = path.relative(repoRoot, full).replace(/\\/g, '/');
    const findings = analyzeSpec(fs.readFileSync(full, 'utf8'));
    if (findings.length) fileReports.push({ file: rel, findings });
    total += findings.length;
  }
  return { generatedAt: 'static', repoRoot, total, files: fileReports };
}

// ---------- arg parsing ----------
function parseArgs(argv) {
  const out = { repoRoot: DEFAULT_REPO_ROOT, enforce: false, baseline: null, out: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--test-root') { out.repoRoot = path.resolve(argv[++i]); continue; }
    if (a === '--enforce') { out.enforce = true; continue; }
    if (a === '--baseline') { out.baseline = path.resolve(argv[++i]); continue; }
    if (a === '--out') { out.out = path.resolve(argv[++i]); continue; }
    if (a === '--help' || a === '-h') {
      console.log('Usage: check-vacuous-grid-assertions.mjs [--enforce] [--baseline <json>] [--out <json>] [--test-root <dir>]');
      process.exit(0);
    }
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = buildReport({ repoRoot: args.repoRoot, filePaths: walkSpecFiles(args.repoRoot) });

  if (args.out) {
    fs.mkdirSync(path.dirname(args.out), { recursive: true });
    fs.writeFileSync(args.out, JSON.stringify(report, null, 2));
  }

  console.error('[check-vacuous-grid-assertions] summary');
  console.error(`  vacuous-risk loops: ${report.total} across ${report.files.length} file(s)`);
  for (const f of report.files) {
    for (const v of f.findings) {
      console.error(`  ${f.file}:${v.line}  test "${v.test}" loops over ${v.iterable} with no prior non-zero-count guard`);
    }
  }
  if (report.total === 0) console.error('  none — every grid/list loop has a non-zero-count/empty guard bound to its collection.');

  if (args.baseline) {
    if (!fs.existsSync(args.baseline)) {
      fs.mkdirSync(path.dirname(args.baseline), { recursive: true });
      fs.writeFileSync(args.baseline, JSON.stringify({ total: report.total }, null, 2));
      console.error(`[check-vacuous-grid-assertions] wrote first baseline (${report.total})`);
      process.exit(0);
    }
    const base = JSON.parse(fs.readFileSync(args.baseline, 'utf8'));
    const ok = report.total <= (base.total ?? 0);
    console.error(`[check-vacuous-grid-assertions] baseline: ${report.total} vs ${base.total} → ${ok ? 'OK' : 'REGRESSION'}`);
    process.exit(ok ? 0 : 1);
  }

  process.exit(args.enforce && report.total > 0 ? 1 : 0);
}

const __selfPath = fileURLToPath(import.meta.url);
const __mainArg = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (__mainArg === __selfPath) main();
