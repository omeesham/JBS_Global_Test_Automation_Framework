#!/usr/bin/env node
/**
 * prune-check.mjs — Live-reference checker for pruning candidates.
 *
 * Sev: S1 announce-tier per guardrail-policy.md §LR-069.
 * Graduating incident: SUBPLAN_LCD_06_SELF_PRUNING Phase 2 (2026-07-16).
 *
 * Input:  candidate file paths as positional args, or --list <file> (one path per line).
 * Output: JSON array, one entry per candidate:
 *   { path, verdict: "safe" | "untouchable" | "live-ref", guard?: string, refs?: Array }
 * Exit 1  if ANY candidate verdict is "live-ref" (fail-safe).
 * Exit 0  otherwise (safe or untouchable candidates only).
 *
 * Never-prune guards (applied before grep — first match wins):
 *   ACTIVE-SESSION   mtime < 24 h               → verdict "untouchable"
 *   WORKTREE-LOCK    <path>.lock sidecar exists  → verdict "untouchable"
 *   LIVE-BRANCH      plan file Status != terminal → verdict "untouchable"
 *
 * 5-class live-reference grep (pure Node — Windows Git Bash compatible):
 *   code    *.ts *.mjs *.js  (repo-wide, excl. node_modules / plans/done / candidate)
 *   plan    *.md in plans/   (excl. plans/done / candidate)
 *   config  *.json           (repo-wide, excl. node_modules / candidate)
 *   hook    *.sh             (repo-wide, excl. candidate)
 *   doc     *.md in docs/    (excl. candidate)
 *
 * Must be run from the repo root (process.cwd() = REPO_ROOT).
 */

import { readFileSync, statSync, existsSync, readdirSync } from 'node:fs';
import { join, basename, extname, resolve, sep } from 'node:path';

const REPO_ROOT = process.cwd();
const NOW_MS = Date.now();
const H24_MS = 24 * 60 * 60 * 1000;
const TERMINAL = new Set(['done', 'superseded', 'cancelled', 'subsumed']);
// `_archive` holds already-pruned content: a mention there is a historical record, never a live
// reference, and counting it would make every archived file cite its archived neighbours.
const SKIP_DIRS = new Set(['node_modules', '.git', '.playwright-cli', 'dist', '.auth', '_archive']);

function* walkDir(dir, exts, skipAbsPaths) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (skipAbsPaths.some(s => full === s || full.startsWith(s + sep))) continue;
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      yield* walkDir(full, exts, skipAbsPaths);
    } else if (e.isFile() && exts.has(extname(e.name).toLowerCase())) {
      yield full;
    }
  }
}

function planStatus(filePath) {
  try {
    const text = readFileSync(filePath, 'utf8');
    const m = text.match(/^\*\*Status\*\*:\s*(\S+)/im) || text.match(/^Status:\s*(\S+)/im);
    return m ? m[1].toLowerCase().replace(/[^a-z-]/g, '') : null;
  } catch { return null; }
}

function applyGuards(absPath) {
  if ((NOW_MS - statSync(absPath).mtimeMs) < H24_MS) {
    return { verdict: 'untouchable', guard: 'ACTIVE-SESSION' };
  }
  if (existsSync(absPath + '.lock')) {
    return { verdict: 'untouchable', guard: 'WORKTREE-LOCK' };
  }
  const plansAbs = resolve(REPO_ROOT, 'plans');
  if ((absPath === plansAbs || absPath.startsWith(plansAbs + sep)) && absPath.endsWith('.md')) {
    const status = planStatus(absPath);
    if (!status || !TERMINAL.has(status)) {
      return { verdict: 'untouchable', guard: 'LIVE-BRANCH' };
    }
  }
  return null;
}

/**
 * Build the reference index ONCE for the whole candidate set, then answer every candidate
 * from it.
 *
 * The original shape called scanRefs(candidate) inside the candidate loop, so each candidate
 * re-walked and re-read the entire repo — cost was candidates × repo. At 595 candidates that
 * produced no output in 25+ minutes and had to be killed (2026-07-31 client-surface purge).
 * Cost is now repo + candidates, over the same 5 classes with the same skip rules.
 *
 * A file never counts as a reference to itself. That skip is per-candidate, so it cannot live
 * in the shared walk and is applied at lookup time in refsFor() instead.
 */
function buildRefIndex(stems) {
  const plansDone = join(REPO_ROOT, 'plans', 'done');
  const nodeModules = join(REPO_ROOT, 'node_modules');
  const plansDir = join(REPO_ROOT, 'plans');
  const docsDir = join(REPO_ROOT, 'docs');

  const claudeDir = join(REPO_ROOT, '.claude');
  // Exclude ephemeral state/worktrees from the claude-md scan — those dirs hold
  // session artifacts and chip outputs that reference many names transiently; they
  // would produce false-positive "live-ref" verdicts for anything mentioned in a
  // work log or state snapshot.
  const claudeState = join(REPO_ROOT, '.claude', 'state');
  const claudeWorktrees = join(REPO_ROOT, '.claude', 'worktrees');

  const sources = [
    { cls: 'code', root: REPO_ROOT, exts: new Set(['.ts', '.mjs', '.js']), skip: [plansDone] },
    { cls: 'plan', root: plansDir, exts: new Set(['.md']), skip: [plansDone] },
    { cls: 'config', root: REPO_ROOT, exts: new Set(['.json']), skip: [nodeModules] },
    { cls: 'hook', root: REPO_ROOT, exts: new Set(['.sh']), skip: [] },
    { cls: 'doc', root: docsDir, exts: new Set(['.md']), skip: [] },
    { cls: 'claude', root: claudeDir, exts: new Set(['.md']), skip: [claudeState, claudeWorktrees] },
  ];

  const index = new Map(stems.map(s => [s, []]));

  for (const { cls, root, exts, skip } of sources) {
    if (!existsSync(root)) continue;
    for (const f of walkDir(root, exts, skip)) {
      let text;
      try { text = readFileSync(f, 'utf8'); } catch { continue; }
      for (const stem of stems) {
        if (text.includes(stem)) index.get(stem).push({ class: cls, file: f });
      }
    }
  }
  return index;
}

function refsFor(index, absPath, stem) {
  return (index.get(stem) || []).filter(r => r.file !== absPath);
}

function parseCandidates(args) {
  const li = args.indexOf('--list');
  if (li !== -1) {
    if (!args[li + 1]) { process.stderr.write('--list requires a file path\n'); process.exit(2); }
    return readFileSync(args[li + 1], 'utf8').split('\n').map(l => l.trim()).filter(Boolean);
  }
  return args;
}

const candidates = parseCandidates(process.argv.slice(2));
if (!candidates.length) {
  process.stderr.write('Usage: prune-check.mjs <path1> [<path2>...] | --list <file>\n');
  process.exit(2);
}

const results = [];
let hasLiveRef = false;

// Guards first — a guarded candidate needs no reference scan, so keep it out of the index.
const guarded = new Map();
const toScan = [];
for (const c of candidates) {
  const absPath = resolve(c);
  if (!existsSync(absPath)) {
    process.stderr.write('candidate not found: ' + c + '\n');
    process.exit(2);
  }
  const guard = applyGuards(absPath);
  if (guard) guarded.set(c, guard);
  else toScan.push({ c, absPath, stem: basename(c, extname(c)) });
}

const refIndex = buildRefIndex([...new Set(toScan.map(t => t.stem))]);

for (const c of candidates) {
  const g = guarded.get(c);
  if (g) { results.push({ path: c, ...g }); continue; }
  const { absPath, stem } = toScan.find(t => t.c === c);
  const refs = refsFor(refIndex, absPath, stem);
  if (refs.length > 0) {
    results.push({ path: c, verdict: 'live-ref', refs });
    hasLiveRef = true;
  } else {
    results.push({ path: c, verdict: 'safe' });
  }
}

process.stdout.write(JSON.stringify(results, null, 2) + '\n');
process.exit(hasLiveRef ? 1 : 0);
