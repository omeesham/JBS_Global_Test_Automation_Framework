#!/usr/bin/env node
/**
 * check-spec-sleeps.mjs — ban fixed-duration sleeps in spec files.
 *
 * A `page.waitForTimeout(N)` (or a hand-rolled `new Promise(r => setTimeout(r, N))`) inside a spec
 * is a DIAGNOSTIC-PAUSE: a fixed wall-clock sleep standing in for a real readiness signal. It flakes
 * on slow CI, never confirms the transition it is waiting for, and compounds across a run. This is
 * the exact class removed from the Legal + Left-Panel specs (10 sleeps, ~20s/run) — this gate keeps
 * them from coming back. Replace with an event/state wait: `expect.poll(...)`, `waitForFunction(...)`,
 * `locator.waitFor({ state })`, or `expect(locator).toBeVisible()` (all auto-retry on the real signal).
 *
 * IN SCOPE — spec files only: `clients/<client>/tests/**\/*.spec.ts`. Page objects legitimately carry
 * a small number of bounded settle-waits and are NOT scanned here (a separate concern). `auth.setup.ts`
 * is not a `.spec.ts`, so its auth-retry backoff is naturally out of scope.
 *
 * FLAGGED:
 *   - `<anything>.waitForTimeout(` — Playwright's fixed sleep.
 *   - `new Promise(<r> => setTimeout(<r>, <n>))` — the hand-rolled sleep idiom.
 * NOT FLAGGED (these are configuration, not sleeps):
 *   - `test.setTimeout(N)` / `setup.setTimeout(N)` / `test.slow()` — per-test timeout budget.
 *
 * EXEMPTION — a fixed sleep is legitimate ONLY for proving a NEGATIVE (that some event does NOT
 * happen within a bounded window — there is no signal to poll for a non-event). Annotate that single
 * line, or the line immediately above it, with `// sleep-ok: <reason>` and the gate skips it. This
 * mirrors the repo's `// best-effort:` / `// save-verify-exempt:` exemption convention.
 *
 * WARN-ONLY by default (exit 0). `--enforce` makes any finding exit 1 (the pre-commit/CI gate mode).
 * Convention sibling: scripts/check-vacuous-grid-assertions.mjs (same pure-function + main() + .test.mjs shape).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isCommentLine, markerInCommentBlockAbove, walkSpecFiles } from './lib/spec-scan-helpers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..');

// A fixed Playwright sleep: `<recv>.waitForTimeout(` — recv is page / this.page / a Locator.
const WAIT_FOR_TIMEOUT_RE = /\bwaitForTimeout\s*\(/;
// The hand-rolled sleep idiom: `setTimeout(<something>, <number>)` used as a delay. `test.setTimeout(`
// and `setup.setTimeout(` are the timeout-budget API and are excluded by the negative lookbehind on `.`.
const RAW_SLEEP_RE = /(?<![.\w])setTimeout\s*\(/;
// Exemption marker — this line, or the contiguous comment block directly above, proves a negative.
const SLEEP_OK_RE = /sleep-ok\s*:/i;

/**
 * Scan one spec's source. Returns findings: { line, kind, snippet }.
 * A sleep annotated `// sleep-ok: <reason>` (on its own line or the line directly above) is exempt.
 * @param {string} text — spec file source
 * @returns {Array<{line: number, kind: string, snippet: string}>}
 */
export function findSleeps(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  const findings = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const kind = WAIT_FOR_TIMEOUT_RE.test(line) ? 'waitForTimeout'
      // Raw setTimeout used as a delay — but NOT `test.setTimeout` / `setup.setTimeout` (timeout budget).
      : RAW_SLEEP_RE.test(line) ? 'setTimeout'
      : null;
    if (!kind) continue;
    // Exempt when the sleep line itself, or the contiguous comment block directly above it, carries
    // the sleep-ok marker (so a multi-line justification is recognised).
    const exempt = SLEEP_OK_RE.test(line) || markerInCommentBlockAbove(lines, i, SLEEP_OK_RE);
    if (exempt) continue;
    findings.push({ line: i + 1, kind, snippet: line.trim() });
  }
  return findings;
}

export function buildReport({ repoRoot, filePaths }) {
  const fileReports = [];
  let total = 0;
  for (const full of filePaths) {
    const rel = path.relative(repoRoot, full).replace(/\\/g, '/');
    const findings = findSleeps(fs.readFileSync(full, 'utf8'));
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
      console.log('Usage: check-spec-sleeps.mjs [--enforce] [--test-root <dir>]');
      process.exit(0);
    }
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const filePaths = walkSpecFiles(args.repoRoot);

  const clientsDir = path.join(args.repoRoot, 'clients');
  if (!fs.existsSync(clientsDir)) {
    console.error('[check-spec-sleeps] FAIL — clients/ directory does not exist at ' + clientsDir);
    console.error('  The check requires clients/<client>/tests/**/*.spec.ts to scan.');
    process.exit(1);
  }
  if (filePaths.length === 0) {
    console.error('[check-spec-sleeps] FAIL — 0 spec files found under ' + clientsDir);
    console.error('  Expected clients/<client>/tests/**/*.spec.ts but found none.');
    process.exit(1);
  }

  const report = buildReport({ repoRoot: args.repoRoot, filePaths });

  console.error('[check-spec-sleeps] summary');
  console.error(`  fixed sleeps in specs: ${report.total} across ${report.files.length} file(s)`);
  for (const f of report.files) {
    for (const v of f.findings) {
      console.error(`  ${f.file}:${v.line}  ${v.kind} — ${v.snippet}`);
    }
  }
  if (report.total === 0) {
    console.error('  none — no fixed sleeps in spec files (use expect.poll / waitForFunction / waitFor instead).');
  }

  process.exit(args.enforce && report.total > 0 ? 1 : 0);
}

const __selfPath = fileURLToPath(import.meta.url);
const __mainArg = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (__mainArg === __selfPath) main();
