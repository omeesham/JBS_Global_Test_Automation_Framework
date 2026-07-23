#!/usr/bin/env node
/**
 * check-unfailable-assertions.mjs — ban assertions that cannot fail.
 *
 * An assertion that passes for (almost) any observed value gives false confidence: the test is green
 * but proves nothing, so a real regression sails through. This gate flags four concrete shapes that
 * shipped in this suite before remediation:
 *
 *   A. Swallow-to-benign feeding an assertion — `.catch(() => '')` / `.catch(() => [])` / `.catch(() => 0)`.
 *      A failed read is silently replaced with an empty/zero value, which the following `expect`
 *      then accepts. (The STR-021 `.catch(() => '')` made the assertion unfailable.)
 *   B. Unanchored digit regex — `.toMatch(/\d/)` / `.toMatch(/\d+/)` with no `^…$` anchor. Matches ANY
 *      string that merely CONTAINS a digit (e.g. "abc3" passes a "price" check). The strong form is an
 *      anchored `^\d+(\.\d+)?$`. (The OVR/STR `/\d/` checks were this class.)
 *   C. Count/length tautology — `.toBeGreaterThanOrEqual(0)` / `.toBeGreaterThan(-1)` on a COUNT or
 *      LENGTH. A count is always ≥ 0, so the check proves nothing. (The `count >= 0` tautologies.)
 *      Scoped to lines that name a count/length token so it never flags a legitimately-negative value
 *      (e.g. a date offset that must be ≥ 0 is meaningful and is NOT flagged — no count/length token).
 *   D. getAll length-only (WARN-ONLY, ratcheting) — a value read from `.getAll(...)` /
 *      `.searchParams.getAll(...)` that is asserted ONLY by `.toHaveLength(n)` / `.length` and never by
 *      value (`toContain` / `toEqual` / `toStrictEqual` / `toMatchObject`) anywhere in the file. Repeated
 *      query params can carry wrong VALUES while the COUNT still passes — the NM-2264 years-round-trip
 *      class. Ships WARN-ONLY (does NOT fail `--enforce`) until the suite is confirmed clean, then
 *      ratchets to enforce — the same measured rollout the vacuous-grid gate used. Escape:
 *      `// length-only-ok: <reason>` on the assertion line or the line directly above.
 *
 * IN SCOPE — spec files only: `clients/<client>/tests/**\/*.spec.ts`.
 * WARN-ONLY by default (exit 0). `--enforce` makes any finding exit 1 (the pre-commit/CI gate mode).
 * Convention sibling: scripts/check-spec-sleeps.mjs (same pure-function + main() + .test.mjs shape).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..');

// A: catch that returns a benign empty/zero value (feeds an expect that then can't fail).
const BENIGN_CATCH_RE = /\.catch\s*\(\s*\(\s*\)\s*=>\s*(?:''|""|``|\[\]|0)\s*\)/;
// B: unanchored digit-class regex inside toMatch — starts with \d, no leading ^ anchor.
const UNANCHORED_DIGIT_RE = /\.toMatch\s*\(\s*\/\\d[+*]?\//;
// C: non-negative tautology matchers.
const NONNEG_TAUTOLOGY_RE = /\.toBeGreaterThanOrEqual\s*\(\s*0\s*\)|\.toBeGreaterThan\s*\(\s*-1\s*\)/;
// C-scope: the line must reference a count/length signal, else a >= 0 may be a meaningful bound.
const COUNT_TOKEN_RE = /count|length|\.count\s*\(|rows?\b|items?\b|size\b/i;
// D: a var read from .getAll( — the value whose length may be asserted while its VALUES are not.
const GETALL_ASSIGN_RE = /(?:const|let|var)\s+(\w+)\s*=\s*(?:await\s+)?[^;=]*\.getAll\s*\(/;
// D: a length/count-only assertion on that var (no value check).
function lengthOnlyAssertRe(name) {
  return new RegExp(
    `expect\\(\\s*${name}\\s*\\)\\s*\\.toHaveLength\\s*\\(` +
    `|expect\\(\\s*${name}\\.length\\s*\\)\\s*\\.(?:toBe|toEqual|toStrictEqual|toBeGreaterThan\\w*|toBeLessThan\\w*)\\s*\\(`,
  );
}
// D: any value matcher (membership / equality) — its presence on a line naming the var means the
// var's VALUES are checked somewhere, so it is NOT length-only. `.not.toContain(...)` counts too.
const VALUE_MATCHER_RE = /\.(?:toContain|toEqual|toStrictEqual|toMatchObject)\b/;
// D: escape marker for a deliberate length-only assertion.
const LENGTH_ONLY_OK_RE = /length-only-ok/;
// D is warn-only until the suite is confirmed clean — it never contributes to the --enforce exit code.
const RATCHET_WARN_KINDS = new Set(['getall-length-only']);

/**
 * Scan one spec's source. Returns findings: { line, kind, snippet }.
 * @param {string} text — spec file source
 * @returns {Array<{line: number, kind: string, snippet: string}>}
 */
export function findUnfailable(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  const findings = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (BENIGN_CATCH_RE.test(line)) {
      findings.push({ line: i + 1, kind: 'benign-catch', snippet: line.trim() });
    }
    if (UNANCHORED_DIGIT_RE.test(line)) {
      findings.push({ line: i + 1, kind: 'unanchored-digit-regex', snippet: line.trim() });
    }
    if (NONNEG_TAUTOLOGY_RE.test(line) && COUNT_TOKEN_RE.test(line)) {
      findings.push({ line: i + 1, kind: 'count-tautology', snippet: line.trim() });
    }
  }

  // D — getAll length-only (cross-line, WARN-ONLY). Collect vars read from `.getAll(...)`, then flag
  // a length/count-only assertion on any such var UNLESS its values are checked somewhere in the file.
  const getAllVars = new Set();
  for (const l of lines) {
    const m = GETALL_ASSIGN_RE.exec(l);
    if (m) getAllVars.add(m[1]);
  }
  for (const name of getAllVars) {
    const nameRe = new RegExp(`\\b${name}\\b`);
    const valueChecked = lines.some((l) => nameRe.test(l) && VALUE_MATCHER_RE.test(l));
    if (valueChecked) continue; // the var's values ARE asserted somewhere → not length-only
    const lengthRe = lengthOnlyAssertRe(name);
    for (let i = 0; i < lines.length; i++) {
      if (!lengthRe.test(lines[i])) continue;
      const escaped = LENGTH_ONLY_OK_RE.test(lines[i]) || (i > 0 && LENGTH_ONLY_OK_RE.test(lines[i - 1]));
      if (escaped) continue;
      findings.push({ line: i + 1, kind: 'getall-length-only', snippet: lines[i].trim() });
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
    const findings = findUnfailable(fs.readFileSync(full, 'utf8'));
    if (findings.length) fileReports.push({ file: rel, findings });
    total += findings.length;
  }
  return { total, files: fileReports };
}

// ---------- arg parsing ----------
function parseArgs(argv) {
  const out = { repoRoot: DEFAULT_REPO_ROOT, enforce: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--test-root') { out.repoRoot = path.resolve(argv[++i]); continue; }
    if (a === '--enforce') { out.enforce = true; continue; }
    if (a === '--staged') { continue; } // accepted for pre-commit call parity; full-scan is safe (fast, static)
    if (a === '--help' || a === '-h') {
      console.log('Usage: check-unfailable-assertions.mjs [--enforce] [--test-root <dir>]');
      process.exit(0);
    }
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const clientsDir = path.join(args.repoRoot, 'clients');
  const specFiles = walkSpecFiles(args.repoRoot);

  if (specFiles.length === 0) {
    if (!fs.existsSync(clientsDir)) {
      console.error(`[check-unfailable-assertions] FAIL: clients/ directory not found at ${clientsDir}`);
    } else {
      console.error(`[check-unfailable-assertions] FAIL: no .spec.ts files found under ${clientsDir}/*/tests/`);
    }
    process.exit(1);
  }

  const report = buildReport({ repoRoot: args.repoRoot, filePaths: specFiles });

  // Warn-only (ratcheting) kinds are reported but do NOT contribute to the --enforce exit code.
  let enforceableTotal = 0;
  let warnOnlyTotal = 0;
  for (const f of report.files) {
    for (const v of f.findings) {
      if (RATCHET_WARN_KINDS.has(v.kind)) warnOnlyTotal++; else enforceableTotal++;
    }
  }

  console.error('[check-unfailable-assertions] summary');
  console.error(`  unfailable assertions in specs: ${report.total} across ${report.files.length} file(s)` +
    (warnOnlyTotal > 0 ? `  (${enforceableTotal} enforced, ${warnOnlyTotal} warn-only)` : ''));
  for (const f of report.files) {
    for (const v of f.findings) {
      const tag = RATCHET_WARN_KINDS.has(v.kind) ? ' (warn-only)' : '';
      console.error(`  ${f.file}:${v.line}  ${v.kind}${tag} — ${v.snippet}`);
    }
  }
  if (report.total === 0) {
    console.error('  none — no swallow-to-benign, unanchored-digit, count>=0 tautology, or getAll length-only assertions.');
  }

  process.exit(args.enforce && enforceableTotal > 0 ? 1 : 0);
}

const __selfPath = fileURLToPath(import.meta.url);
const __mainArg = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (__mainArg === __selfPath) main();
