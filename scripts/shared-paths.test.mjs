#!/usr/bin/env node
/**
 * Unit test for shared-paths.ts and shared-paths.mjs (SP-MT-04).
 *
 * Asserts:
 *   1. Default ACTIVE_CLIENT (unset) resolves to clients/encore/.
 *   2. ACTIVE_CLIENT=encore resolves to clients/encore/.
 *   3. ACTIVE_CLIENT=acme resolves to clients/acme/.
 *   4. shared-paths.ts SHARED_PATHS.activityLog === shared-paths.mjs SHARED_PATHS.activityLog
 *      (no drift between the TypeScript and ESM siblings).
 *
 * Exit 0 on pass, 1 on fail.
 * Invoked via: npm run test:shared-paths
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

let failed = 0;

function assert(label, cond, detail = '') {
  if (cond) {
    console.log(`  OK  ${label}`);
  } else {
    console.log(`  FAIL ${label}${detail ? `  [${detail}]` : ''}`);
    failed++;
  }
}

/**
 * Run a ts-node one-liner and return stdout trimmed.
 * Uses child process so ACTIVE_CLIENT env can be controlled per-scenario.
 */
function evalTs(snippet, env = {}) {
  const cmd = `npx ts-node -e "${snippet.replace(/"/g, '\\"')}"`;
  return execSync(cmd, {
    cwd: REPO_ROOT,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

console.log('shared-paths.test.mjs');

// ── Scenario 1: default (no ACTIVE_CLIENT) → encore ──
console.log('\n[1] ACTIVE_CLIENT unset → defaults to encore');
const defaultOut = evalTs(
  "const m = require('./scripts/shared-paths'); console.log(m.activeClient()); console.log(m.SHARED_PATHS.queue);",
  { ACTIVE_CLIENT: '' },
);
const [defaultClient, defaultQueue] = defaultOut.split('\n');
assert('activeClient() === "encore"', defaultClient === 'encore', `got: ${defaultClient}`);
assert(
  'SHARED_PATHS.queue under clients/encore/',
  defaultQueue.includes(path.join('clients', 'encore', 'specs_planning', '_internal', 'agent-queue.json')),
  defaultQueue,
);

// ── Scenario 2: ACTIVE_CLIENT=encore ──
console.log('\n[2] ACTIVE_CLIENT=encore');
const encoreOut = evalTs(
  "const m = require('./scripts/shared-paths'); console.log(m.SHARED_PATHS.queue);",
  { ACTIVE_CLIENT: 'encore' },
);
assert(
  'SHARED_PATHS.queue under clients/encore/',
  encoreOut.includes(path.join('clients', 'encore', 'specs_planning', '_internal', 'agent-queue.json')),
  encoreOut,
);

// ── Scenario 3: ACTIVE_CLIENT=acme ──
console.log('\n[3] ACTIVE_CLIENT=acme');
const acmeOut = evalTs(
  "const m = require('./scripts/shared-paths'); console.log(m.SHARED_PATHS.queue); console.log(m.SHARED_PATHS.clientRoot); console.log(m.SHARED_PATHS.reports);",
  { ACTIVE_CLIENT: 'acme' },
);
const [acmeQueue, acmeClientRoot, acmeReports] = acmeOut.split('\n');
assert(
  'SHARED_PATHS.queue under clients/acme/',
  acmeQueue.includes(path.join('clients', 'acme', 'specs_planning', '_internal', 'agent-queue.json')),
  acmeQueue,
);
assert(
  'SHARED_PATHS.clientRoot under clients/acme/',
  acmeClientRoot.endsWith(path.join('clients', 'acme')),
  acmeClientRoot,
);
assert(
  'SHARED_PATHS.reports stays framework-level (no client dir)',
  !acmeReports.includes(path.join('clients', 'acme')) && acmeReports.endsWith('reports'),
  acmeReports,
);

// ── Scenario 4: .ts ↔ .mjs drift check ──
console.log('\n[4] shared-paths.ts vs shared-paths.mjs drift check');
const tsActivityLog = evalTs(
  "const m = require('./scripts/shared-paths'); console.log(m.SHARED_PATHS.activityLog);",
  { ACTIVE_CLIENT: 'acme' },
);
// .mjs subprocess with ACTIVE_CLIENT=acme so we can string-compare vs the .ts value.
const mjsActivityLogAcme = execSync(
  `node --input-type=module -e "import('./scripts/shared-paths.mjs').then(m => console.log(m.SHARED_PATHS.activityLog))"`,
  { cwd: REPO_ROOT, env: { ...process.env, ACTIVE_CLIENT: 'acme' }, encoding: 'utf8' },
).trim();
assert(
  '.ts and .mjs SHARED_PATHS.activityLog string-equal under ACTIVE_CLIENT=acme',
  tsActivityLog === mjsActivityLogAcme,
  `ts=${tsActivityLog} mjs=${mjsActivityLogAcme}`,
);

// ── Result ──
if (failed > 0) {
  console.log(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}
console.log('\nAll assertions passed.');
process.exit(0);
