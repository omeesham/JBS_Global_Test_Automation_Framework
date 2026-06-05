#!/usr/bin/env node
/**
 * verify-protected-names.mjs — proves the ship deny-list (verify-no-forbidden DENY_GLOBS)
 * still catches every agent-only protected name in the POST-restructure tree.
 *
 * The deny-list is anchored on directory/file NAMES (specs_planning/, docs/read_only_docs/,
 * CLAUDE.md, …). It survives DEEPER moves but dies the instant a protected name is RENAMED —
 * a silent leak. This guard plants a probe file at each protected name in a temp tree, runs
 * `verify-no-forbidden --target`, and asserts each is flagged.
 *
 * Built by PLAN_ENCORE_POM_RESTRUCTURE (2026-06-05). Exit 0 = all caught; 1 = a gap.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

// Protected names that must never ship (mirror verify-no-forbidden DENY_GLOBS). Planted
// (with innocent content, so only the NAME trips the deny-list) under a temp client tree.
const PROBES = [
  'clients/encore/CLAUDE.md',
  'clients/encore/specs_planning/_internal/probe.md',
  'clients/encore/readable_externals/probe.md',
  'clients/encore/docs/read_only_docs/probe.md',
  'clients/encore/docs/REQUIREMENTS.md',
  'clients/encore/docs/MODULE_REGISTRY.md',
];

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-protected-'));
try {
  for (const rel of PROBES) {
    const full = path.join(tmp, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, 'probe — innocent content, only the path name should trip the deny-list\n');
  }

  let out = '';
  let exit = 0;
  try {
    out = execSync(
      `node ${JSON.stringify(path.join('scripts', 'verify-no-forbidden.mjs'))} --target=${JSON.stringify(tmp)}`,
      { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    );
  } catch (e) {
    exit = e.status || 1;
    out = (e.stdout || '') + (e.stderr || '');
  }

  if (exit === 0) {
    console.error('[verify-protected-names] FAIL — verify-no-forbidden returned 0; planted protected names were NOT flagged.');
    console.error(out);
    process.exit(1);
  }
  const missed = PROBES.filter((rel) => !out.includes(rel));
  if (missed.length) {
    console.error(`[verify-protected-names] FAIL — ${missed.length} protected name(s) NOT caught by the deny-list (silent-ship risk):`);
    for (const m of missed) console.error('  ' + m);
    console.error('--- verify-no-forbidden output ---\n' + out);
    process.exit(1);
  }
  console.log(`[verify-protected-names] OK — all ${PROBES.length} protected names caught by the ship deny-list post-restructure`);
  process.exit(0);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
