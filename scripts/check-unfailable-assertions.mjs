#!/usr/bin/env node
/**
 * check-unfailable-assertions.mjs — ban assertions that cannot fail.
 *
 * An assertion that passes for (almost) any observed value gives false confidence: the test is green
 * but proves nothing, so a real regression sails through. This gate flags three concrete shapes that
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
  const report = buildReport({ repoRoot: args.repoRoot, filePaths: walkSpecFiles(args.repoRoot) });

  console.error('[check-unfailable-assertions] summary');
  console.error(`  unfailable assertions in specs: ${report.total} across ${report.files.length} file(s)`);
  for (const f of report.files) {
    for (const v of f.findings) {
      console.error(`  ${f.file}:${v.line}  ${v.kind} — ${v.snippet}`);
    }
  }
  if (report.total === 0) {
    console.error('  none — no swallow-to-benign, unanchored-digit, or count>=0 tautology assertions.');
  }

  process.exit(args.enforce && report.total > 0 ? 1 : 0);
}

const __selfPath = fileURLToPath(import.meta.url);
const __mainArg = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (__mainArg === __selfPath) main();
