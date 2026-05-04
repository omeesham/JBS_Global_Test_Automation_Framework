#!/usr/bin/env node
/**
 * scripts/verify-no-forbidden.mjs
 *
 * Single source of truth for "what must NEVER ship to a client". Used by:
 *   - scripts/ship-client.sh pre-flight (--client=<id>)
 *   - scripts/ship-client.sh post-flight (--target=<path>)
 *   - .githooks/pre-commit (--staged-diff)
 *   - .githooks/pre-push  (--staged="<file>")
 *
 * Modes:
 *   --client=<id>   : git ls-files clients/<id>/ + filter against DENY_GLOBS, fail if any match.
 *   --target=<path> : walk <path> recursively + filter against DENY_GLOBS, fail if any match.
 *   --staged-diff   : scan staged file contents for MARKER_GREP, fail on any hit.
 *   --staged=<file> : check a single staged path against DENY_GLOBS.
 */

import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const DENY_GLOBS = [
  /\/CLAUDE\.md$/,
  /\/specs_planning\//,
  /\/readable_externals\//,
  /\/docs\/read_only_docs\//,
  /\/exports\//,
  /\/\.auth\//,
  /^\.git\//,
  /^\.github\//,
  /^\.claude\//,
  /\/agent-mistakes\.md$/,
  /\/agent-activity-log\.md$/,
  /\/agent-performance\.json$/,
  /\/agent-metrics-report\.md$/,
  /\/agent-escalations\.json$/,
  /\/agent-learnings\.md$/,
  /\/test-id-registry\.json$/,
  /\/daily-status-bank\.json$/,
  /\/active-experiments\.md$/,
  /\.env\.local$/,
  /\.env\..+\.local$/,
  /\.env\.server$/,
  /^\/pipeline\//,
  // Per-client throwaway dev tools — see clients/<id>/scripts/ in working tree.
  // Customer deliverables never need scripts/ — npm scripts in package.json cover demo CI.
  /\/clients\/[^/]+\/scripts\//,
  /^\/scripts\//,
  // Stale env files that no code path loads — Encore runs only the e2e env.
  /\.env\.production$/,
  /\.env\.staging$/,
  /\.env\.example$/,
];

const MARKER_GREP = [/TEMP_RUTVIK_EXPERIMENT/, /v-rutvik/, /khosariya/, /NAVIGATOR_MFA_SECRET=[A-Z0-9]/];

// Strings that must NOT appear in the shipped per-client .gitignore — they leak
// JBS-internal terminology to the customer (plan IDs, ship-pipeline mechanics,
// internal directory names). The JBS-context patterns live at root .gitignore
// instead, so the per-client .gitignore stays customer-neutral.
const GITIGNORE_LEAK_MARKERS = [
  /PLAN_/,
  /pipeline/i,
  /git archive/i,
  /specs_planning/,
  /readable_externals/,
  /read_only_docs/,
  /\bexports\//,
];

function arg(name) {
  const flag = process.argv.find((a) => a.startsWith(`--${name}=`));
  return flag ? flag.slice(`--${name}=`.length) : null;
}
const hasFlag = (name) => process.argv.includes(`--${name}`);

function matchesDeny(rel) {
  return DENY_GLOBS.some((re) => re.test(rel));
}

function walkDir(root, prefix = '') {
  const out = [];
  for (const entry of fs.readdirSync(path.join(root, prefix), { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walkDir(root, rel));
    else if (entry.isFile()) out.push(rel);
  }
  return out;
}

function checkClient(client) {
  let listing;
  try {
    listing = execSync(`git ls-files clients/${client}/`, { cwd: REPO_ROOT, encoding: 'utf-8' });
  } catch {
    console.error(`[verify-no-forbidden] git ls-files failed for clients/${client}/`);
    process.exit(2);
  }
  const tracked = listing.split(/\r?\n/).filter(Boolean);
  // Strip leading clients/<id>/ for glob matching.
  const stripped = tracked.map((p) => p.replace(new RegExp(`^clients/${client}/`), '/'));
  const offending = stripped.filter(matchesDeny);
  if (offending.length > 0) {
    console.error(
      `[verify-no-forbidden] client=${client} found ${offending.length} forbidden file(s) tracked under clients/${client}/:\n` +
        offending.slice(0, 20).map((p) => `  ${p}`).join('\n')
    );
    process.exit(1);
  }
  console.log(`[verify-no-forbidden] OK client=${client} tracked=${tracked.length}`);
}

function checkTarget(target) {
  const root = path.resolve(target);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    console.error(`[verify-no-forbidden] target not a directory: ${target}`);
    process.exit(2);
  }
  const files = walkDir(root).map((p) => `/${p.replace(/\\/g, '/')}`);
  const offending = files.filter(matchesDeny);
  if (offending.length > 0) {
    console.error(
      `[verify-no-forbidden] target=${target} found ${offending.length} forbidden file(s):\n` +
        offending.slice(0, 20).map((p) => `  ${p}`).join('\n')
    );
    process.exit(1);
  }

  // Marker grep — scan all text-ish files for forbidden literals.
  const offenders = [];
  for (const rel of walkDir(root)) {
    if (/\.(png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|pdf|zip|tar|gz|7z)$/i.test(rel)) continue;
    let buf;
    try {
      buf = fs.readFileSync(path.join(root, rel), 'utf-8');
    } catch {
      continue;
    }
    for (const re of MARKER_GREP) {
      if (re.test(buf)) {
        offenders.push(`${rel} :: ${re}`);
        break;
      }
    }
  }
  if (offenders.length > 0) {
    console.error(
      `[verify-no-forbidden] target=${target} found ${offenders.length} marker-hit file(s):\n` +
        offenders.slice(0, 20).map((p) => `  ${p}`).join('\n')
    );
    process.exit(1);
  }

  // Per-client .gitignore content check: shipped .gitignore must not leak
  // JBS-internal terminology. Patterns ride at root .gitignore instead.
  const gitignorePath = path.join(root, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreText = fs.readFileSync(gitignorePath, 'utf-8');
    const leaks = GITIGNORE_LEAK_MARKERS.filter((re) => re.test(gitignoreText));
    if (leaks.length > 0) {
      console.error(
        `[verify-no-forbidden] target=${target} .gitignore leaks JBS terminology: ${leaks.map((re) => re.toString()).join(', ')}`
      );
      process.exit(1);
    }
  }

  console.log(`[verify-no-forbidden] OK target=${target} files=${files.length}`);
}

function checkStagedDiff() {
  let listing;
  try {
    listing = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
    });
  } catch {
    process.exit(0);
  }
  const staged = listing.split(/\r?\n/).filter(Boolean);
  const offenders = [];
  for (const rel of staged) {
    if (rel.startsWith('plans/done/')) continue; // historical artifacts
    if (rel.startsWith('plans/pending/')) continue; // plan author may legitimately reference markers
    if (rel === 'scripts/verify-no-forbidden.mjs') continue; // self-reference: this script's own MARKER_GREP literals
    let buf;
    try {
      buf = execSync(`git show :${rel}`, { cwd: REPO_ROOT, encoding: 'utf-8' });
    } catch {
      continue;
    }
    for (const re of MARKER_GREP) {
      if (re.test(buf)) {
        offenders.push(`${rel} :: ${re}`);
        break;
      }
    }
  }
  if (offenders.length > 0) {
    console.error(
      `[verify-no-forbidden] staged-diff: ${offenders.length} marker-hit file(s):\n` +
        offenders.slice(0, 20).map((p) => `  ${p}`).join('\n')
    );
    process.exit(1);
  }
  console.log('[verify-no-forbidden] OK staged-diff (no marker hits)');
}

function checkStagedFile(file) {
  // Pre-push per-file mode: refuse if path itself matches DENY_GLOBS (relative to repo root).
  const rel = file.replace(/\\/g, '/');
  if (matchesDeny(`/${rel}`) && rel.startsWith('clients/')) {
    console.error(`[verify-no-forbidden] staged forbidden path: ${rel}`);
    process.exit(1);
  }
  process.exit(0);
}

const client = arg('client');
const target = arg('target');
const staged = arg('staged');

if (client) checkClient(client);
else if (target) checkTarget(target);
else if (hasFlag('staged-diff')) checkStagedDiff();
else if (staged) checkStagedFile(staged);
else {
  console.error(
    'Usage: verify-no-forbidden.mjs --client=<id> | --target=<path> | --staged-diff | --staged=<file>'
  );
  process.exit(2);
}
