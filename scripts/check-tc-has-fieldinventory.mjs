#!/usr/bin/env node
/**
 * check-tc-has-fieldinventory.mjs — SP-AAE-02 pre-commit gate.
 *
 * Rejects commits that edit the behavioural content of a test-case markdown
 * (Steps / Expected / Data / Preconditions blocks) under clients/<client>/specs_planning/
 * test-cases/** unless the matching field-inventory artifact exists AND its
 * MCP_Session_Date is <= 14 days old.
 *
 * Paired with the format spec at
 * clients/<client>/specs_planning/_internal/field-inventory-spec.md
 * and the parent plan PLAN_AGENT_AUTHORING_EFFICIENCY.md (AAE-D2).
 *
 * Exit codes:
 *   0 — all staged TC edits either (a) don't touch content blocks, or (b) have
 *       a fresh paired field-inventory artifact.
 *   1 — one or more violations (error printed per violation).
 *   2 — script error (git unavailable, bad args, etc.).
 *
 * Default behaviour (no args): reads `git diff --cached` and enforces against
 * staged changes. Intended to be invoked from .githooks/pre-commit.
 *
 * Test-mode flags (used by check-tc-has-fieldinventory.test.mjs):
 *   --test-root <dir>          Treat <dir> as the repo root (overrides REPO_ROOT).
 *   --test-fixture <json-path> Read { files: [{path, oldContent, newContent}], today }
 *                              from JSON instead of invoking git. `today` is ISO
 *                              `YYYY-MM-DD`; defaults to real today.
 *   --verbose                  Log per-file decisions (pass/fail + reasoning).
 *
 * The scope-guard recognises both TC MD styles that exist in the repo today:
 *   A) inline bold markers — `**Steps**: 1. Do X. 2. Do Y.` (locations format)
 *   B) standalone bold markers — `**Steps**:` with numbered continuation on
 *      subsequent lines and a blank line before the next block (local-office
 *      format)
 *   C) future h2 headings — `## Steps` / `## Expected` / etc. (mentioned in the
 *      subplan text; not yet used in-repo but handled defensively)
 *
 * A diff is "in-scope" if the set of content-block lines differs between the
 * old and new file versions. Metadata edits (MCP_VERIFICATION_LOG, CORRECTIONS,
 * FIELD INVENTORY inside the TC MD, priority/status table cells, HTML comments,
 * pure-blank-line reflow) pass without triggering the hook.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..');

const FRESHNESS_DAYS = 14;
const TC_MD_GLOB_RE = /^clients\/[^/]+\/specs_planning\/test-cases\/.+\.md$/;

// ---------- arg parsing ----------
function parseArgs(argv) {
  const out = { repoRoot: DEFAULT_REPO_ROOT, fixturePath: null, verbose: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--test-root') { out.repoRoot = path.resolve(argv[++i]); continue; }
    if (a === '--test-fixture') { out.fixturePath = path.resolve(argv[++i]); continue; }
    if (a === '--verbose') { out.verbose = true; continue; }
    if (a === '--help' || a === '-h') {
      console.log('Usage: check-tc-has-fieldinventory.mjs [--test-root <dir>] [--test-fixture <json>] [--verbose]');
      process.exit(0);
    }
  }
  return out;
}

// ---------- path helpers ----------
function clientFromTcPath(relPath) {
  const m = relPath.match(/^clients\/([^/]+)\/specs_planning\/test-cases\//);
  return m ? m[1] : null;
}

/**
 * Turn a TC MD filename into the module name used for field-inventory lookup.
 *   local_office_settings_test_cases.md -> local-office-settings
 *   locations_currency_test_cases.md    -> locations-currency
 */
function moduleFromTcPath(relPath) {
  const base = path.basename(relPath, '.md');
  return base.replace(/_test_cases$/i, '').replace(/_/g, '-');
}

// ---------- scope guard: extract content-block lines from a file ----------
/**
 * Walk the file line-by-line, tracking which block we are currently inside:
 *   null | 'Steps' | 'Expected' | 'Data' | 'Preconditions'
 *
 * Transitions:
 *   - `^## ` or a `---` separator resets state to null (TC boundary).
 *   - A line containing `**(Steps|Expected|Data|Preconditions)**:` sets state
 *     to the matched block AND counts the line itself as content.
 *   - A `^## (Steps|Expected|Data|Preconditions)` h2 heading sets state AND
 *     counts as content (future format).
 *   - Any other `^\*\*\w+\*\*\s*:` marker (e.g., `**Automatable**:`,
 *     `**Priority**:`) closes the current block — state goes back to null.
 *   - Blank lines do NOT close the block; continuation lines stay "in".
 *
 * Returns the array of content-block lines in file order. Two files whose
 * extracted arrays are equal have equivalent behavioural content.
 */
export function extractContentBlockLines(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  const blockRe = /\*\*(Steps|Expected|Data|Preconditions)\*\*\s*:/i;
  const h2BlockRe = /^##\s+(Steps|Expected|Data|Preconditions)\s*$/i;
  const otherBoldMarkerRe = /^\*\*[A-Za-z][\w\s-]*\*\*\s*:/;
  const h2AnyRe = /^##\s/;
  const tcSeparatorRe = /^---+\s*$/;

  const out = [];
  let state = null;

  for (const raw of lines) {
    const line = raw;

    if (h2BlockRe.test(line)) {
      state = 'h2';
      out.push(line);
      continue;
    }
    if (h2AnyRe.test(line)) { state = null; continue; }
    if (tcSeparatorRe.test(line)) { state = null; continue; }

    if (blockRe.test(line)) {
      state = 'inline';
      out.push(line);
      continue;
    }

    // Only treat a LEADING `**Name**:` as a block-closer. In-line bold phrases
    // (`Click **Save**...`) or `**Steps**: 1. Verify **Use Fulfillment** ...`
    // must NOT flip state.
    if (state && otherBoldMarkerRe.test(line)) {
      state = null;
      continue;
    }

    if (state) out.push(line);
  }
  return out;
}

/** Strip HTML comments + whitespace for "did anything meaningful change?" compare. */
function normaliseForCompare(line) {
  return line.replace(/<!--[\s\S]*?-->/g, '').trim();
}

/**
 * Return true if the NEW file has any content-block line (after
 * HTML-comment + whitespace normalisation) that isn't present in the OLD file,
 * OR vice-versa. Pure metadata or pure HTML-comment edits return false.
 */
export function contentBlocksChanged(oldText, newText) {
  const oldSet = extractContentBlockLines(oldText).map(normaliseForCompare).filter(Boolean);
  const newSet = extractContentBlockLines(newText).map(normaliseForCompare).filter(Boolean);
  if (oldSet.length !== newSet.length) return true;
  for (let i = 0; i < oldSet.length; i++) {
    if (oldSet[i] !== newSet[i]) return true;
  }
  return false;
}

// ---------- artifact lookup ----------
function daysBetween(isoA, isoB) {
  const a = Date.parse(isoA + 'T00:00:00Z');
  const b = Date.parse(isoB + 'T00:00:00Z');
  if (!Number.isFinite(a) || !Number.isFinite(b)) return Infinity;
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}

function todayIso() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Return freshest artifact for (client, module) or null.
 *   { file, sessionDate, ageDays, fresh }
 */
export function findLatestArtifact({ repoRoot, client, module: moduleName, today, freshnessDays }) {
  const dir = path.join(repoRoot, 'clients', client, 'specs_planning', '_internal', 'field-inventories');
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(f => f !== '_TEMPLATE.md' && f.endsWith('.md'));

  let best = null;
  for (const f of files) {
    const m = f.match(/^(.+)-(\d{4}-\d{2}-\d{2})\.md$/);
    if (!m) continue;
    if (m[1] !== moduleName) continue;
    const filenameDate = m[2];

    const full = path.join(dir, f);
    const content = fs.readFileSync(full, 'utf8');
    const fmMatch = content.match(/^\*\*MCP_Session_Date\*\*:\s*(\d{4}-\d{2}-\d{2})\s*$/m);
    if (!fmMatch) continue;
    const sessionDate = fmMatch[1];

    const ageDays = daysBetween(sessionDate, today);
    const fresh = ageDays >= 0 && ageDays <= freshnessDays;
    const candidate = { file: f, filenameDate, sessionDate, ageDays, fresh };
    if (!best || sessionDate > best.sessionDate) best = candidate;
  }
  return best;
}

// ---------- git helpers (production mode) ----------
function gitStagedTcFiles(repoRoot) {
  const raw = execSync('git diff --cached --name-only --diff-filter=ACMR', {
    cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  });
  return raw.split(/\r?\n/).filter(l => l && TC_MD_GLOB_RE.test(l));
}

function gitShow(repoRoot, ref) {
  try {
    return execSync(`git show "${ref}"`, {
      cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return '';
  }
}

function gitOldContent(repoRoot, relPath) {
  return gitShow(repoRoot, `HEAD:${relPath}`);
}

function gitStagedContent(repoRoot, relPath) {
  return gitShow(repoRoot, `:${relPath}`);
}

// ---------- core evaluator (pure, testable) ----------
/**
 * Evaluate staged TC MD edits against paired field-inventory artifacts.
 *
 * @param {object} opts
 * @param {string} opts.repoRoot
 * @param {Array<{path:string, oldContent:string, newContent:string}>} opts.files
 * @param {string} opts.today                 — ISO YYYY-MM-DD
 * @param {number} [opts.freshnessDays=14]
 * @returns {{ ok: boolean, violations: Array<{ path: string, reason: string, detail?: object }> }}
 */
export function evaluate({ repoRoot, files, today, freshnessDays = FRESHNESS_DAYS }) {
  const violations = [];
  for (const f of files) {
    if (!TC_MD_GLOB_RE.test(f.path)) continue;                // not a TC MD
    if (!contentBlocksChanged(f.oldContent, f.newContent)) continue; // metadata-only

    const client = clientFromTcPath(f.path);
    const moduleName = moduleFromTcPath(f.path);
    if (!client || !moduleName) {
      violations.push({ path: f.path, reason: 'unparseable-tc-path' });
      continue;
    }

    const artifact = findLatestArtifact({ repoRoot, client, module: moduleName, today, freshnessDays });
    if (!artifact) {
      violations.push({
        path: f.path,
        reason: 'no-artifact',
        detail: {
          client,
          module: moduleName,
          expectedPath: `clients/${client}/specs_planning/_internal/field-inventories/${moduleName}-<YYYY-MM-DD>.md`,
        },
      });
      continue;
    }
    if (!artifact.fresh) {
      violations.push({
        path: f.path,
        reason: 'stale-artifact',
        detail: {
          client,
          module: moduleName,
          artifact: artifact.file,
          sessionDate: artifact.sessionDate,
          ageDays: artifact.ageDays,
          freshnessDays,
        },
      });
      continue;
    }
  }
  return { ok: violations.length === 0, violations };
}

// ---------- error formatting ----------
function formatViolation(v) {
  const lines = [];
  lines.push(`  x ${v.path}`);
  if (v.reason === 'unparseable-tc-path') {
    lines.push(`      could not parse client + module from path`);
  } else if (v.reason === 'no-artifact') {
    lines.push(`      needs field-inventory artifact at:`);
    lines.push(`        ${v.detail.expectedPath}`);
    lines.push(`      (module "${v.detail.module}" has no paired artifact)`);
  } else if (v.reason === 'stale-artifact') {
    lines.push(`      paired artifact is stale:`);
    lines.push(`        ${v.detail.artifact}`);
    lines.push(`        MCP_Session_Date: ${v.detail.sessionDate} (${v.detail.ageDays} days old; limit is ${v.detail.freshnessDays} days)`);
    lines.push(`      refresh the field-inventory with a dated MCP session before committing`);
  }
  return lines.join('\n');
}

// ---------- entry point ----------
function main() {
  const args = parseArgs(process.argv.slice(2));
  let files;
  let today;

  if (args.fixturePath) {
    const raw = fs.readFileSync(args.fixturePath, 'utf8');
    const fixture = JSON.parse(raw);
    files = (fixture.files || []).map(f => ({
      path: f.path,
      oldContent: f.oldContent ?? '',
      newContent: f.newContent ?? '',
    }));
    today = fixture.today || todayIso();
  } else {
    const staged = gitStagedTcFiles(args.repoRoot);
    files = staged.map(p => ({
      path: p,
      oldContent: gitOldContent(args.repoRoot, p),
      newContent: gitStagedContent(args.repoRoot, p),
    }));
    today = todayIso();
  }

  if (args.verbose) {
    console.log(`[check-tc-has-fieldinventory] today=${today} repoRoot=${args.repoRoot} tcFiles=${files.length}`);
  }

  const result = evaluate({ repoRoot: args.repoRoot, files, today, freshnessDays: FRESHNESS_DAYS });

  if (result.ok) {
    if (args.verbose) console.log('[check-tc-has-fieldinventory] OK');
    process.exit(0);
  }

  console.error('[check-tc-has-fieldinventory] BLOCKED — commit rejected.');
  console.error('');
  console.error('One or more staged test-case markdown edits changed the behavioural content');
  console.error('(Steps / Expected / Data / Preconditions) without a paired field-inventory');
  console.error(`artifact dated within the last ${FRESHNESS_DAYS} days. See`);
  console.error('clients/<client>/specs_planning/_internal/field-inventory-spec.md (SP-AAE-01).');
  console.error('');
  for (const v of result.violations) {
    console.error(formatViolation(v));
    console.error('');
  }
  console.error('If this is a metadata-only edit that was false-flagged, open an issue against');
  console.error('SP-AAE-02 with the diff; otherwise run a dated MCP walk for the module and');
  console.error('emit the artifact, then re-attempt the commit.');
  process.exit(1);
}

// Run main() only when invoked directly (not when imported from the test file).
// Cross-platform: compare absolute paths, not file:// URLs.
const __selfPath = fileURLToPath(import.meta.url);
const __mainArg = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (__mainArg === __selfPath) main();
