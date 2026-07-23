#!/usr/bin/env node
/**
 * check-reload-wait.mjs — a page reload in a page object must be followed by an Angular-stable wait.
 *
 * `this.page.reload()` returns as soon as the document loads, but the Angular app then re-bootstraps
 * and re-binds asynchronously. Reading a field right after the reload — before the app has rehydrated
 * — is a race that flakes intermittently (the notes-reload-missing-stable class). Every real reload in
 * a page object must be followed, within the same method, by `waitForAngularStable()`.
 *
 * NOT flagged:
 *   - `page.reload(...).catch(...)` — a probe reload deliberately meant to be interrupted (e.g. firing
 *     a beforeunload prompt that a handler dismisses); it is never expected to complete or stabilize.
 *   - `opts.reload()` / a reload closure passed in — the caller's closure owns stabilization.
 *   - a reload whose method continuation calls `waitForAngularStable` within the scan window.
 * Escape hatch: `// reload-wait-exempt: <reason>` on the reload line or the comment block above it.
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

// A page reload on the Playwright Page (this.page.reload / page.reload). NOT opts.reload / x.reload.
const PAGE_RELOAD_RE = /\b(?:this\.)?page\.reload\s*\(/;
const CATCH_CHAINED_RE = /\.reload\s*\([^)]*\)\s*\.catch\s*\(/; // probe reload, exempt
const STABLE_RE = /waitForAngularStable\s*\(/;
const EXEMPT_RE = /reload-wait-exempt\s*:/i;
const SCAN_WINDOW = 12; // lines after the reload to look for the stabilize call

function isCommentLine(l) { return /^\s*(?:\/\/|\*|\/\*)/.test(l ?? ''); }
function markerInCommentBlockAbove(lines, i, re) {
  for (let j = i - 1; j >= 0 && isCommentLine(lines[j]); j--) {
    if (re.test(lines[j])) return true;
  }
  return false;
}

/**
 * Scan one page object's source. Returns findings: { line, snippet }.
 * @param {string} text — page object source
 * @returns {Array<{line: number, snippet: string}>}
 */
export function findUnstabilizedReloads(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  const findings = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!PAGE_RELOAD_RE.test(line)) continue;
    if (CATCH_CHAINED_RE.test(line)) continue;                       // probe reload — exempt
    if (EXEMPT_RE.test(line) || markerInCommentBlockAbove(lines, i, EXEMPT_RE)) continue;
    const windowText = lines.slice(i, i + SCAN_WINDOW + 1).join('\n');
    if (STABLE_RE.test(windowText)) continue;                        // stabilized within the method
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
    const findings = findUnstabilizedReloads(fs.readFileSync(full, 'utf8'));
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
      console.log('Usage: check-reload-wait.mjs [--enforce] [--test-root <dir>]');
      process.exit(0);
    }
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const filePaths = walkPageFiles(args.repoRoot);

  // VACUOUS-ON-ZERO guard: a check with nothing to check is broken, not passing.
  if (filePaths.length === 0) {
    const clientsDir = path.join(args.repoRoot, 'clients');
    if (!fs.existsSync(clientsDir)) {
      console.error(`[check-reload-wait] FAIL — clients/ directory not found at ${clientsDir}`);
    } else {
      console.error(`[check-reload-wait] FAIL — no page-object .ts files found under clients/*/src/pages/`);
    }
    process.exit(1);
  }

  const report = buildReport({ repoRoot: args.repoRoot, filePaths });

  console.error('[check-reload-wait] summary');
  console.error(`  page reloads not followed by waitForAngularStable: ${report.total} across ${report.files.length} file(s)`);
  for (const f of report.files) {
    for (const v of f.findings) {
      console.error(`  ${f.file}:${v.line}  ${v.snippet}`);
    }
  }
  if (report.total === 0) {
    console.error('  none — every non-probe reload stabilizes the app before the method continues.');
  }

  process.exit(args.enforce && report.total > 0 ? 1 : 0);
}

const __selfPath = fileURLToPath(import.meta.url);
const __mainArg = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (__mainArg === __selfPath) main();
