#!/usr/bin/env node
/**
 * check-swallowed-failures.test.mjs — fixture tests for the load-bearing empty-catch guard.
 * Mirrors scripts/check-spec-sleeps.test.mjs.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { findSwallowed, walkPageFiles, buildReport } from './check-swallowed-failures.mjs';

function makeTmpRepo() { return fs.mkdtempSync(path.join(os.tmpdir(), 'swallowed-')); }
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

test('flags an unannotated empty catch on .click()', () => {
  assertEq(findSwallowed('await this.btn.click().catch(() => {});').length, 1);
});
test('flags an unannotated empty catch on .reload()', () => {
  assertEq(findSwallowed('await this.page.reload({ timeout: 5000 }).catch(() => {});').length, 1);
});
test('flags an unannotated empty catch on a save call', () => {
  assertEq(findSwallowed('await this.clickSaveWithDialog().catch(() => {});').length, 1);
});

test('does NOT flag an empty catch on a settle waitFor', () => {
  assertEq(findSwallowed("await dlg.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});").length, 0,
    'a dialog-hidden settle is a legitimate no-signal wait');
});

test('does NOT flag when annotated best-effort inline', () => {
  assertEq(findSwallowed('await this.btn.click().catch(() => {}); // best-effort: dialog may be absent').length, 0);
});
test('does NOT flag when annotated best-effort on the line above', () => {
  const src = [
    '// best-effort: probe reload meant to be interrupted by the unsaved-changes dialog',
    'await this.page.reload({ timeout: 5000 }).catch(() => {});',
  ].join('\n');
  assertEq(findSwallowed(src).length, 0);
});
test('recognises the /* best-effort ... */ block-comment form on the same line', () => {
  assertEq(findSwallowed('await opts.reload().catch(() => { /* best-effort recovery */ });').length, 0,
    'a non-empty catch body is not an empty catch anyway, but best-effort still exempts');
});
test('recognises the marker in a multi-line comment block directly above', () => {
  const src = [
    '// this reload only needs to fire the beforeunload prompt; the handler above',
    '// dismisses it, so best-effort: the reload is expected to be cancelled.',
    'await this.page.reload({ timeout: 5000 }).catch(() => {});',
  ].join('\n');
  assertEq(findSwallowed(src).length, 0, 'marker anywhere in the contiguous comment block above justifies');
});

test('empty / undefined input is safe', () => {
  assertEq(findSwallowed('').length, 0);
  assertEq(findSwallowed(undefined).length, 0);
});

test('walkPageFiles + buildReport across a temp repo', () => {
  const repo = makeTmpRepo();
  write(repo, 'clients/acme/src/pages/a.page.ts', 'await x.click().catch(() => {});');
  write(repo, 'clients/acme/src/pages/b.page.ts', "await d.waitFor({ state: 'hidden' }).catch(() => {});");
  const filePaths = walkPageFiles(repo);
  assertEq(filePaths.length, 2);
  const report = buildReport({ repoRoot: repo, filePaths });
  assertEq(report.total, 1, 'only the click-swallow is flagged');
  assert(report.files[0].file.endsWith('a.page.ts'));
});

// ---------- runner ----------
let passed = 0, failed = 0;
for (const c of cases) {
  try { c.fn(); console.log(`  ok  ${c.name}`); passed++; }
  catch (e) { console.error(`  FAIL ${c.name}: ${e.message}`); failed++; }
}
console.log(`\n[check-swallowed-failures.test] ${passed} passed, ${failed} failed, ${cases.length} total`);
process.exit(failed === 0 ? 0 : 1);
