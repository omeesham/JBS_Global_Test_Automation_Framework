#!/usr/bin/env node
/**
 * check-swallowed-failures.mjs — an empty catch on a load-bearing action must be justified.
 *
 * `await el.click().catch(() => {})` / `await this.page.reload().catch(() => {})` silently discards a
 * real failure: the click never landed, or the reload never happened, and the test sails on believing
 * it did. A best-effort swallow is sometimes correct (dismissing a dialog that may not be present, a
 * probe reload meant to be interrupted) — but that intent must be STATED, not assumed. This gate flags
 * an empty (or comment-only) `.catch(() => {})` chained to ANY `.click*(` custom wrapper (`.click(`,
 * `.clickExportYearOption(`, `.clickTab(` …) / `.reload(` / a save call in a page object, UNLESS the
 * line (or the line directly above) carries a `best-effort` comment explaining why. A body that is only
 * a block comment still swallows the failure — the comment is not a real handler — so it is flagged the
 * same as an empty body unless best-effort-annotated.
 *
 * This operationalises LR-003 (no silent catch) for the page-object action class. Empty catches on
 * settle-only `waitFor({ state })` calls are NOT flagged — waiting for a dialog that may already be
 * gone is a legitimate no-signal settle, and downstream actions auto-wait.
 *
 * IN SCOPE — page objects: `clients/<client>/src/pages/**\/*.ts`.
 * WARN-ONLY by default (exit 0). `--enforce` makes any finding exit 1 (the pre-commit/CI gate mode).
 * Convention sibling: scripts/check-spec-sleeps.mjs (same pure-function + main() + .test.mjs shape).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..');

// A swallowing catch: `.catch(() => {})` / `.catch((e) => {})` with a body that is empty OR only a
// block comment (`{ /* … */ }`). A comment is not a handler, so a comment-only body swallows the
// failure exactly like `{ }` — both are flagged (best-effort annotation is what exempts, below).
const EMPTY_OR_COMMENTED_CATCH_RE = /\.catch\s*\(\s*\(\s*\w*\s*\)\s*=>\s*\{\s*(?:\/\*.*?\*\/\s*)?\}\s*\)/;
// A load-bearing action on the same line: ANY `.click*(` wrapper (`.click(`, `.clickExportYearOption(`,
// `.clickTab(` — custom page-object wrappers ARE load-bearing) / `.reload(` / a save call. The `\w*`
// requires a call `(`, so a property access like `el.clickable` (no paren) is not matched.
const LOAD_BEARING_RE = /\.click\w*\s*\(|\.reload\s*\(|\b(?:clickSave\w*|saveAndConfirm|saveChanges|clickSaveWithDialog)\s*\(/;
// Justification marker (comment), case-insensitive: `// best-effort: …` / `/* best-effort … */`.
const BEST_EFFORT_RE = /best-effort/i;

/** True when a comment-only line (`// …` or a `* …` / `/* …` JSDoc line). */
function isCommentLine(l) { return /^\s*(?:\/\/|\*|\/\*)/.test(l ?? ''); }
/** True when `re` appears in the contiguous comment block immediately above line index `i`. */
function markerInCommentBlockAbove(lines, i, re) {
  for (let j = i - 1; j >= 0 && isCommentLine(lines[j]); j--) {
    if (re.test(lines[j])) return true;
  }
  return false;
}

/**
 * Scan one page-object's source. Returns findings: { line, snippet }.
 * @param {string} text — page object source
 * @returns {Array<{line: number, snippet: string}>}
 */
export function findSwallowed(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  const findings = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!EMPTY_OR_COMMENTED_CATCH_RE.test(line) || !LOAD_BEARING_RE.test(line)) continue;
    // Justified when the catch line itself, or the contiguous comment block directly above it,
    // carries the best-effort marker (so a multi-line justification is recognised).
    const justified = BEST_EFFORT_RE.test(line) || markerInCommentBlockAbove(lines, i, BEST_EFFORT_RE);
    if (justified) continue;
    findings.push({ line: i + 1, snippet: line.trim() });
  }
  return findings;
}

// ---------- file walker ----------
export function walkPageFiles(repoRoot) {
  const out = [];
  const clientsDir = path.join(repoRoot, 'clients');
  if (!fs.existsSync(clientsDir)) return out;
  for (const client of fs.readdirSync(clientsDir)) {
    const pagesRoot = path.join(clientsDir, client, 'src', 'pages');
    if (!fs.existsSync(pagesRoot)) continue;
    walkDir(pagesRoot, out);
  }
  return out;
}

function walkDir(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walkDir(full, out); continue; }
    if (entry.isFile() && entry.name.endsWith('.ts')) out.push(full);
  }
}

export function buildReport({ repoRoot, filePaths }) {
  const fileReports = [];
  let total = 0;
  for (const full of filePaths) {
    const rel = path.relative(repoRoot, full).replace(/\\/g, '/');
    const findings = findSwallowed(fs.readFileSync(full, 'utf8'));
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
    if (a === '--staged') { continue; }
    if (a === '--help' || a === '-h') {
      console.log('Usage: check-swallowed-failures.mjs [--enforce] [--test-root <dir>]');
      process.exit(0);
    }
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const filePaths = walkPageFiles(args.repoRoot);

  if (filePaths.length === 0) {
    const clientsDir = path.join(args.repoRoot, 'clients');
    if (!fs.existsSync(clientsDir)) {
      console.error(`[check-swallowed-failures] FAIL: clients/ directory not found at ${clientsDir}`);
    } else {
      console.error(`[check-swallowed-failures] FAIL: no page-object .ts files found under ${clientsDir}/*/src/pages/`);
    }
    console.error('  expected: at least one .ts file in clients/<client>/src/pages/**/ to check');
    process.exit(1);
  }

  const report = buildReport({ repoRoot: args.repoRoot, filePaths });

  console.error('[check-swallowed-failures] summary');
  console.error(`  scanned ${filePaths.length} page-object file(s)`);
  console.error(`  unannotated empty catches on click/reload/save: ${report.total} across ${report.files.length} file(s)`);
  for (const f of report.files) {
    for (const v of f.findings) {
      console.error(`  ${f.file}:${v.line}  ${v.snippet}`);
    }
  }
  if (report.total === 0) {
    console.error('  none — every empty catch on a load-bearing action carries a best-effort justification.');
  }

  process.exit(args.enforce && report.total > 0 ? 1 : 0);
}

const __selfPath = fileURLToPath(import.meta.url);
const __mainArg = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (__mainArg === __selfPath) main();
