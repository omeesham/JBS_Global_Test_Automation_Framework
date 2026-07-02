#!/usr/bin/env node
/**
 * check-reload-wait.test.mjs — fixture tests for the reload-must-stabilize guard.
 * Mirrors scripts/check-spec-sleeps.test.mjs.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { findUnstabilizedReloads, walkPageFiles, buildReport } from './check-reload-wait.mjs';

function makeTmpRepo() { return fs.mkdtempSync(path.join(os.tmpdir(), 'reload-wait-')); }
function write(repoRoot, relPath, body) {
  const full = path.join(repoRoot, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, body);
  return full;
}
const cases = [];
function test(name, fn) { cases.push({ name, fn }); }
function assertEq(actual, expected, msg) {
  if (actual !== expected) throw new Error(`${msg || 'assertEq'} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assert failed'); }

test('flags a reload with no following waitForAngularStable', () => {
  const src = [
    'async reloadX() {',
    '  await this.page.reload({ timeout: 30000 });',
    '  await this.clickTab();',
    '}',
  ].join('\n');
  assertEq(findUnstabilizedReloads(src).length, 1);
});

test('does NOT flag a reload followed by waitForAngularStable (even a few lines later)', () => {
  const src = [
    'async reloadX() {',
    '  try {',
    '    await this.page.reload({ timeout: 30000 });',
    '  } finally {',
    '    this.page.removeListener("dialog", h);',
    '  }',
    '  await this.waitForAngularStable();',
    '}',
  ].join('\n');
  assertEq(findUnstabilizedReloads(src).length, 0, 'stabilize within the method window clears it');
});

test('does NOT flag a .catch-chained probe reload', () => {
  assertEq(findUnstabilizedReloads('await this.page.reload({ timeout: 5000 }).catch(() => {});').length, 0);
});

test('does NOT flag opts.reload() (caller-owned stabilization)', () => {
  assertEq(findUnstabilizedReloads('await opts.reload();').length, 0, 'only page.reload is in scope');
});

test('respects reload-wait-exempt marker', () => {
  const src = [
    '// reload-wait-exempt: intentionally leaves the app on the login redirect for the next step',
    'await this.page.reload();',
  ].join('\n');
  assertEq(findUnstabilizedReloads(src).length, 0);
});

test('empty / undefined input is safe', () => {
  assertEq(findUnstabilizedReloads('').length, 0);
  assertEq(findUnstabilizedReloads(undefined).length, 0);
});

test('walkPageFiles + buildReport across a temp repo', () => {
  const repo = makeTmpRepo();
  write(repo, 'clients/acme/src/pages/bad.page.ts', 'async r(){ await this.page.reload(); await this.clickTab(); }');
  write(repo, 'clients/acme/src/pages/good.page.ts', 'async r(){ await this.page.reload(); await this.waitForAngularStable(); }');
  const filePaths = walkPageFiles(repo);
  assertEq(filePaths.length, 2);
  const report = buildReport({ repoRoot: repo, filePaths });
  assertEq(report.total, 1);
  assert(report.files[0].file.endsWith('bad.page.ts'));
});

// ---------- runner ----------
let passed = 0, failed = 0;
for (const c of cases) {
  try { c.fn(); console.log(`  ok  ${c.name}`); passed++; }
  catch (e) { console.error(`  FAIL ${c.name}: ${e.message}`); failed++; }
}
console.log(`\n[check-reload-wait.test] ${passed} passed, ${failed} failed, ${cases.length} total`);
process.exit(failed === 0 ? 0 : 1);
