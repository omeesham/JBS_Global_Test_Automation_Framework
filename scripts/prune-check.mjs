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
const SKIP_DIRS = new Set(['node_modules', '.git', '.playwright-cli', 'dist', '.auth']);

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

function hasStem(filePath, stem) {
  try { return readFileSync(filePath, 'utf8').includes(stem); }
  catch { return false; }
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

function scanRefs(absPath, stem) {
  const plansDone = join(REPO_ROOT, 'plans', 'done');
  const skipBase = [plansDone, absPath];
  const refs = [];

  // class 1: code refs
  for (const f of walkDir(REPO_ROOT, new Set(['.ts', '.mjs', '.js']), skipBase)) {
    if (hasStem(f, stem)) refs.push({ class: 'code', file: f });
  }
  // class 2: plan refs
  const plansDir = join(REPO_ROOT, 'plans');
  if (existsSync(plansDir)) {
    for (const f of walkDir(plansDir, new Set(['.md']), skipBase)) {
      if (hasStem(f, stem)) refs.push({ class: 'plan', file: f });
    }
  }
  // class 3: config refs
  for (const f of walkDir(REPO_ROOT, new Set(['.json']), [join(REPO_ROOT, 'node_modules'), absPath])) {
    if (hasStem(f, stem)) refs.push({ class: 'config', file: f });
  }
  // class 4: hook refs
  for (const f of walkDir(REPO_ROOT, new Set(['.sh']), [absPath])) {
    if (hasStem(f, stem)) refs.push({ class: 'hook', file: f });
  }
  // class 5: doc refs
  const docsDir = join(REPO_ROOT, 'docs');
  if (existsSync(docsDir)) {
    for (const f of walkDir(docsDir, new Set(['.md']), [absPath])) {
      if (hasStem(f, stem)) refs.push({ class: 'doc', file: f });
    }
  }
  return refs;
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

for (const c of candidates) {
  const absPath = resolve(c);
  if (!existsSync(absPath)) {
    process.stderr.write('candidate not found: ' + c + '\n');
    process.exit(2);
  }
  const guard = applyGuards(absPath);
  if (guard) { results.push({ path: c, ...guard }); continue; }
  const stem = basename(c, extname(c));
  const refs = scanRefs(absPath, stem);
  if (refs.length > 0) {
    results.push({ path: c, verdict: 'live-ref', refs });
    hasLiveRef = true;
  } else {
    results.push({ path: c, verdict: 'safe' });
  }
}

process.stdout.write(JSON.stringify(results, null, 2) + '\n');
process.exit(hasLiveRef ? 1 : 0);
