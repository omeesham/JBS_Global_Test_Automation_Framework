#!/usr/bin/env node
/**
 * check-spec-sleeps.test.mjs — fixture tests for the spec fixed-sleep guard.
 * Exercises the exported pure functions (findSleeps / walkSpecFiles / buildReport) against
 * synthetic spec source. No clock dependency. Mirrors scripts/check-vacuous-grid-assertions.test.mjs.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { findSleeps, walkSpecFiles, buildReport } from './check-spec-sleeps.mjs';

function makeTmpRepo() { return fs.mkdtempSync(path.join(os.tmpdir(), 'spec-sleeps-')); }
function writeSpec(repoRoot, relPath, body) {
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

// ---------- findSleeps — the banned patterns ARE flagged ----------
test('flags page.waitForTimeout', () => {
  const src = [
    "test('x', async ({ page }) => {",
    '  await page.waitForTimeout(500);',
    '});',
  ].join('\n');
  const f = findSleeps(src);
  assertEq(f.length, 1, 'one waitForTimeout flagged');
  assertEq(f[0].kind, 'waitForTimeout');
  assertEq(f[0].line, 2);
});

test('flags this.page.waitForTimeout too', () => {
  assertEq(findSleeps('await this.page.waitForTimeout(1000);').length, 1);
});

test('flags the hand-rolled new Promise(setTimeout) sleep idiom', () => {
  const src = 'await new Promise((r) => setTimeout(r, 2000));';
  const f = findSleeps(src);
  assertEq(f.length, 1, 'raw setTimeout delay flagged');
  assertEq(f[0].kind, 'setTimeout');
});

// ---------- findSleeps — timeout-budget config is NOT a sleep ----------
test('does NOT flag test.setTimeout (per-test budget)', () => {
  assertEq(findSleeps('  test.setTimeout(60_000);').length, 0, 'test.setTimeout is config, not a sleep');
});

test('does NOT flag setup.setTimeout', () => {
  assertEq(findSleeps('  setup.setTimeout(300_000);').length, 0);
});

test('does NOT flag a plain spec with only real waits', () => {
  const src = [
    "test('clean', async ({ page }) => {",
    '  await expect.poll(async () => (await page.locator(".x").count())).toBeGreaterThan(0);',
    '  await page.locator(".y").waitFor({ state: "visible" });',
    '});',
  ].join('\n');
  assertEq(findSleeps(src).length, 0, 'expect.poll / waitFor are the sanctioned real-signal waits');
});

test('empty / undefined input yields no findings', () => {
  assertEq(findSleeps('').length, 0);
  assertEq(findSleeps(undefined).length, 0);
});

// ---------- findSleeps — sleep-ok exemption (proving a negative) ----------
test('exempts a sleep annotated on the line above', () => {
  const src = [
    '  // sleep-ok: proving no network request fires — a negative has no signal to poll',
    '  await page.waitForTimeout(1000);',
  ].join('\n');
  assertEq(findSleeps(src).length, 0, 'sleep-ok on the prior line exempts the sleep');
});

test('exempts a sleep annotated inline', () => {
  assertEq(findSleeps('  await page.waitForTimeout(1000); // sleep-ok: negative probe').length, 0);
});

test('does NOT exempt when a non-comment line separates the marker from the sleep', () => {
  const src = [
    '  // sleep-ok: reason',
    '  const x = 1;',
    '  await page.waitForTimeout(1000);',
  ].join('\n');
  assertEq(findSleeps(src).length, 1, 'the comment-block walk stops at the non-comment line');
});

test('exempts a sleep with the marker in a multi-line comment block directly above', () => {
  const src = [
    '  // A fixed settle to prove NO save request fires.',
    '  // sleep-ok: a negative has no signal to poll for.',
    '  await page.waitForTimeout(1000);',
  ].join('\n');
  assertEq(findSleeps(src).length, 0, 'marker anywhere in the contiguous comment block above exempts');
});

// ---------- walkSpecFiles + buildReport — full pipeline over a temp repo ----------
test('walkSpecFiles finds .spec.ts under clients/<id>/tests and buildReport totals findings', () => {
  const repo = makeTmpRepo();
  writeSpec(repo, 'clients/acme/tests/a/sleepy.spec.ts', [
    "test('sleepy', async ({ page }) => {",
    '  await page.waitForTimeout(300);',
    '});',
  ].join('\n'));
  writeSpec(repo, 'clients/acme/tests/a/clean.spec.ts', [
    "test('clean', async ({ page }) => {",
    '  test.setTimeout(60_000);',
    '  await page.locator(".x").waitFor();',
    '});',
  ].join('\n'));
  // A non-spec file (setup) must be ignored even if it has a setTimeout backoff.
  writeSpec(repo, 'clients/acme/tests/auth.setup.ts', 'await new Promise((r) => setTimeout(r, 5000));');

  const filePaths = walkSpecFiles(repo);
  assertEq(filePaths.length, 2, 'only the two .spec.ts files are walked (auth.setup.ts excluded)');
  const report = buildReport({ repoRoot: repo, filePaths });
  assertEq(report.total, 1, 'one sleep across the repo');
  assertEq(report.files.length, 1, 'only the sleepy spec appears');
  assert(report.files[0].file.endsWith('sleepy.spec.ts'), 'reported file is the sleepy one');
  assert(report.files[0].file.includes('/'), 'paths are forward-slash normalised');
});

test('walkSpecFiles returns empty when there is no clients dir', () => {
  assertEq(walkSpecFiles(makeTmpRepo()).length, 0);
});

// ---------- runner ----------
let passed = 0, failed = 0;
for (const c of cases) {
  try { c.fn(); console.log(`  ok  ${c.name}`); passed++; }
  catch (e) { console.error(`  FAIL ${c.name}: ${e.message}`); failed++; }
}
console.log(`\n[check-spec-sleeps.test] ${passed} passed, ${failed} failed, ${cases.length} total`);
process.exit(failed === 0 ? 0 : 1);
