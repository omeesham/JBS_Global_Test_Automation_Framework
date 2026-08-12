#!/usr/bin/env node
/**
 * check-untracked-knowledge.mjs
 *
 * Advisory scan for knowledge artifacts that git is silently ignoring.
 *
 * The bug: when a directory is covered by .gitignore but already contains tracked files
 * (force-added at some point), any NEW file created there is silently skipped by
 * `git add` — no error, no warning. This script auto-discovers every such "armed"
 * directory and reports untracked knowledge artifacts within them, making the silence loud.
 *
 * Usage:
 *   node scripts/check-untracked-knowledge.mjs          # advisory — always exits 0
 *   node scripts/check-untracked-knowledge.mjs --strict # exits 1 when findings exist
 *   node scripts/check-untracked-knowledge.mjs --enforce-gate-inputs
 *       # gate-input closure (PLAN_TEAM_REPO_GATE_INPUT_CLOSURE P3, Sev S1):
 *       # scans ONLY the file classes that commit gates READ FROM DISK
 *       # (test-cases md, test-plans md, field-inventories md) and exits 1 if any
 *       # such file exists on disk but is not tracked. A disk-read gate passes on
 *       # the authoring machine and fails on every clone when its input was never
 *       # committed — the 2026-08-12 incident (170 orphan TCs, ALL-071 gate
 *       # unsatisfiable repo-wide for five days). Graduating incident recorded in
 *       # plans/pending/PLAN_TEAM_REPO_GATE_INPUT_CLOSURE.md. Ramp per LR-069:
 *       # the pre-push hook consults untracked_gate_inputs_mode in
 *       # .claude/guardrail-config.json (announce → deny).
 *
 * Does NOT modify git state. Does NOT create hooks. Does NOT touch .gitignore.
 */

import { execSync } from 'node:child_process';
import path from 'node:path';

const ROOT = process.cwd();
const STRICT = process.argv.includes('--strict');
const ENFORCE_GATE_INPUTS = process.argv.includes('--enforce-gate-inputs');

// --- Gate-input closure mode (--enforce-gate-inputs) ---
// The file classes that check:tc-parity and check-tc-has-fieldinventory read from
// the working tree. Anything here that exists on disk but is untracked is invisible
// to every clone while satisfying the gates locally.
const GATE_INPUT_RES = [
  /^clients\/[^/]+\/specs_planning\/test-cases\/.+\.md$/,
  /^clients\/[^/]+\/specs_planning\/test-plans\/.+\.md$/,
  /^clients\/[^/]+\/specs_planning\/_internal\/field-inventories\/[^/]+\.md$/,
];

function runGateInputClosure() {
  // --others lists untracked files; --exclude-standard respects current ignores, and a
  // second pass WITHOUT exclusions catches gate inputs hidden by a future ignore rule.
  const visible = gitOutput('git ls-files --others --exclude-standard -- clients/')
    .split('\n').filter(Boolean).map(stripGitQuotes);
  const ignored = gitOutput('git ls-files --others --ignored --exclude-standard -- clients/')
    .split('\n').filter(Boolean).map(stripGitQuotes);
  const candidates = [...new Set([...visible, ...ignored])];
  const hits = candidates.filter(f => {
    const n = f.replace(/\\/g, '/');
    return GATE_INPUT_RES.some(re => re.test(n)) && !/_TEMPLATE\.md$/.test(n);
  }).sort();

  if (hits.length === 0) {
    console.log('check:untracked-knowledge --enforce-gate-inputs — CLEAN (every gate-read file on disk is tracked)');
    process.exit(0);
  }
  console.error('GATE-INPUT CLOSURE FAIL: the commit gates read these files from disk, but they are');
  console.error('not tracked — every gate that passes here will fail on a fresh clone:');
  for (const f of hits) console.error(`  ${f}\n    → git add ${f}`);
  console.error(`\ncheck:untracked-knowledge --enforce-gate-inputs — ${hits.length} untracked gate-input file(s)`);
  process.exit(1);
}

// --- Classification rules ---

// Files with these extensions are always treated as knowledge artifacts
const KNOWLEDGE_EXTS = new Set(['.md', '.xlsx']);

// Files whose basename contains these substrings are knowledge (case-insensitive)
const KNOWLEDGE_NAME_PATTERNS = ['evidence', 'inventory', 'baseline', 'catalog', 'rca'];

// Files with these extensions are bulk output — suppress even if name matches a knowledge pattern
const BULK_EXTS = new Set(['.json', '.txt', '.png', '.zip', '.log', '.csv', '.xml']);

// Path fragments indicating a per-run dump directory — suppress everything inside
const BULK_DIR_PATTERNS = [
  /testid-live-dumps/i,
  /_archive\//i,
  /\.dedupe-tmp\//i,
  /node_modules\//i,
];

function isKnowledge(filePath) {
  const normalized = filePath.replace(/\\/g, '/').toLowerCase();

  // Per-run dump dirs take absolute precedence — suppress unconditionally
  if (BULK_DIR_PATTERNS.some(re => re.test(normalized))) return false;

  const ext = path.extname(filePath).toLowerCase();

  // Bulk extension overrides knowledge name patterns
  if (BULK_EXTS.has(ext)) return false;

  // Knowledge by extension
  if (KNOWLEDGE_EXTS.has(ext)) return true;

  // Knowledge by name pattern (only reached when extension is not bulk)
  const basename = path.basename(filePath).toLowerCase();
  return KNOWLEDGE_NAME_PATTERNS.some(p => basename.includes(p));
}

// --- Git helpers ---

function gitOutput(cmd, stdin) {
  try {
    const opts = { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] };
    if (stdin !== undefined) opts.input = stdin;
    return execSync(cmd, opts);
  } catch (e) {
    return (e.stdout || '').toString();
  }
}

// Cache results: each unique directory path is checked at most once
const checkIgnoreCache = new Map();

function isDirIgnored(dirPath) {
  if (checkIgnoreCache.has(dirPath)) return checkIgnoreCache.get(dirPath);
  // Probe with a synthetic filename — if the directory is gitignored, this probe is too
  const probe = dirPath + '/__chk_sentinel_x9z__';
  try {
    execSync(`git check-ignore -q -- "${probe}"`, { cwd: ROOT, stdio: 'pipe' });
    checkIgnoreCache.set(dirPath, true);
    return true;
  } catch {
    checkIgnoreCache.set(dirPath, false);
    return false;
  }
}

// --- Step 1: Auto-discover armed directories ---

// An "armed" directory is one that is gitignored AND already contains tracked files.
// The bug fires for any NEW file created inside such a directory.

// Collect all tracked files
const allTracked = gitOutput('git ls-files').split('\n').filter(Boolean);

// Guard: a git repo must have tracked files for this check to be meaningful.
// Without this, a git failure (swallowed by gitOutput) cascades to zero armed dirs → "CLEAN".
if (allTracked.length === 0) {
  let isGitRepo = false;
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd: ROOT, stdio: 'pipe' });
    isGitRepo = true;
  } catch { /* not a git repo or git unavailable */ }

  if (!isGitRepo) {
    console.error(
      'check:untracked-knowledge — FAIL: not a git repository or git is unavailable; ' +
        'expected to run inside a git working tree.'
    );
  } else {
    console.error(
      'check:untracked-knowledge — FAIL: git ls-files returned zero tracked files; ' +
        'cannot evaluate (expected a non-empty tracked-file index).'
    );
  }
  process.exit(1);
}

// Strip git C-string quoting: git quotes paths containing special chars as "path/name"
function stripGitQuotes(p) {
  return (p.startsWith('"') && p.endsWith('"')) ? p.slice(1, -1) : p;
}

if (ENFORCE_GATE_INPUTS) runGateInputClosure();

// Find which tracked files live inside gitignored paths (batch check — single git call)
// --no-index: check pure .gitignore rules regardless of tracking status (tracked files are
// excluded from check-ignore output by default, which would silently empty this list)
const ignoredTracked = gitOutput('git check-ignore --no-index --stdin', allTracked.join('\n'))
  .split('\n')
  .filter(Boolean)
  .map(stripGitQuotes);

// For each ignored tracked file, find its topmost gitignored ancestor directory
const armedRootSet = new Set();
for (const file of ignoredTracked) {
  const parts = file.split('/');
  for (let i = 1; i < parts.length; i++) {
    const dir = parts.slice(0, i).join('/');
    if (isDirIgnored(dir)) {
      armedRootSet.add(dir);
      break; // topmost ignored ancestor found; no need to check deeper
    }
  }
}

// Remove sub-dirs whose parent is already in the armed set (deduplicate to roots only)
const allArmed = [...armedRootSet];
const armedDirs = allArmed
  .filter(d => !allArmed.some(other => other !== d && d.startsWith(other + '/')))
  .sort();

// --- Step 2: Find untracked knowledge files inside armed dirs ---

const findings = [];

for (const dir of armedDirs) {
  // List files that are both untracked (--others) and gitignored (--ignored)
  const untracked = gitOutput(
    `git ls-files --others --ignored --exclude-standard -- "${dir}/"`
  )
    .split('\n')
    .filter(Boolean);

  const knowledge = untracked.filter(isKnowledge);
  const suppressedCount = untracked.length - knowledge.length;
  if (knowledge.length > 0 || suppressedCount > 0) {
    findings.push({ dir, knowledge, suppressedCount });
  }
}

// --- Step 3: Report ---

const totalKnowledge = findings.reduce((n, f) => n + f.knowledge.length, 0);
const totalSuppressed = findings.reduce((n, f) => n + f.suppressedCount, 0);

if (totalKnowledge === 0) {
  console.log('check:untracked-knowledge — CLEAN');
  if (armedDirs.length > 0) {
    console.log(`  Armed directories discovered: ${armedDirs.join(', ')}`);
  } else {
    console.log('  No armed directories found.');
  }
  if (totalSuppressed > 0) {
    console.log(`  Bulk artifacts in armed dirs (suppressed from output): ${totalSuppressed}`);
  }
  process.exit(0);
}

for (const { knowledge } of findings) {
  for (const file of knowledge) {
    console.log('UNTRACKED KNOWLEDGE ARTIFACT (git is silently ignoring this):');
    console.log(`  ${file}`);
    console.log(`  → git add -f ${file}`);
    console.log();
  }
}

const dirWord = armedDirs.length === 1 ? 'directory' : 'directories';
console.log(
  `check:untracked-knowledge — FOUND ${totalKnowledge} untracked knowledge artifact(s)` +
    ` across ${armedDirs.length} armed ${dirWord}`
);
console.log(`  Armed directories: ${armedDirs.join(', ')}`);
console.log(`  Bulk artifacts suppressed from output: ${totalSuppressed}`);

if (STRICT) process.exit(1);
process.exit(0);
