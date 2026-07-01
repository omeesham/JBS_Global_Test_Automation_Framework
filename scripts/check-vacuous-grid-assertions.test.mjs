#!/usr/bin/env node
/**
 * check-vacuous-grid-assertions.test.mjs — fixture tests for the vacuous-grid-loop guard.
 *
 * Each fixture exercises the exported pure functions (analyzeSpec / walkSpecFiles / buildReport)
 * against synthetic spec source. No clock dependency. Mirrors scripts/check-tc-mcp-citations.test.mjs.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  analyzeSpec,
  walkSpecFiles,
  buildReport,
} from './check-vacuous-grid-assertions.mjs';

function makeTmpRepo() { return fs.mkdtempSync(path.join(os.tmpdir(), 'vacuous-grid-')); }

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

// ---------- analyzeSpec — the vacuous pattern is flagged ----------
test('flags a loop over a recorded row-collection with no prior non-zero guard', () => {
  const src = [
    "test('selected strategy displays its assigned locations', async () => {",
    '  const locations = await strategy.getStrategyLocations();',
    '  for (const loc of locations) {',
    '    expect(loc.office).toBeTruthy();',
    '  }',
    '});',
  ].join('\n');
  const findings = analyzeSpec(src);
  assertEq(findings.length, 1, 'exactly one vacuous-risk loop');
  assertEq(findings[0].test, 'selected strategy displays its assigned locations');
  assertEq(findings[0].iterable, 'locations');
});

test('flags a loop whose for-header inlines a row getter', () => {
  const src = [
    "test('inline getter loop', async () => {",
    '  for (const row of await page.getDetailGridRows()) {',
    '    expect(row.code).toBeTruthy();',
    '  }',
    '});',
  ].join('\n');
  const findings = analyzeSpec(src);
  assertEq(findings.length, 1, 'inline row-getter loop is flagged');
});

// ---------- analyzeSpec — guarded / safe loops are NOT flagged ----------
test('does NOT flag when a toBeGreaterThan(0) guard precedes the loop', () => {
  const src = [
    "test('guarded by count', async () => {",
    '  const locations = await strategy.getStrategyLocations();',
    '  expect(locations.length).toBeGreaterThan(0);',
    '  for (const loc of locations) {',
    '    expect(loc.office).toBeTruthy();',
    '  }',
    '});',
  ].join('\n');
  assertEq(analyzeSpec(src).length, 0, 'count guard makes loop non-vacuous');
});

test('does NOT flag when the test branches on emptiness', () => {
  const src = [
    "test('empty handled', async () => {",
    '  const cells = await page.getCells();',
    '  if (cells.length === 0) test.skip(true, "no data");',
    '  for (const c of cells) {',
    '    expect(c).toBeTruthy();',
    '  }',
    '});',
  ].join('\n');
  assertEq(analyzeSpec(src).length, 0, 'explicit empty-handling is not silently vacuous');
});

test('does NOT flag a loop over a plain (non-row) array', () => {
  const src = [
    "test('plain array loop', async () => {",
    '  const items = [1, 2, 3];',
    '  for (const n of items) {',
    '    expect(n).toBeGreaterThan(0);',
    '  }',
    '});',
  ].join('\n');
  assertEq(analyzeSpec(src).length, 0, 'non-row iterable is out of scope');
});

test('does NOT flag a row loop with no assertion in its body', () => {
  const src = [
    "test('no assertion loop', async () => {",
    '  const records = await page.getRecords();',
    '  for (const r of records) {',
    '    console.log(r);',
    '  }',
    '});',
  ].join('\n');
  assertEq(analyzeSpec(src).length, 0, 'a loop that asserts nothing per-row is not the vacuous pattern');
});

// ---------- analyzeSpec — guard isolation across test blocks ----------
test('a guard in test A does not protect a vacuous loop in test B', () => {
  const src = [
    "test('A guarded', async () => {",
    '  const rows = await p.getRows();',
    '  expect(rows.length).toBeGreaterThan(0);',
    '  for (const r of rows) { expect(r).toBeTruthy(); }',
    '});',
    "test('B vacuous', async () => {",
    '  const rows2 = await p.getRows();',
    '  for (const r of rows2) { expect(r).toBeTruthy(); }',
    '});',
  ].join('\n');
  const findings = analyzeSpec(src);
  assertEq(findings.length, 1, 'only the unguarded block is flagged');
  assertEq(findings[0].test, 'B vacuous', 'guard does not bleed across blocks');
});

test('empty input yields no findings', () => {
  assertEq(analyzeSpec('').length, 0);
  assertEq(analyzeSpec(undefined).length, 0);
});

// ---------- analyzeSpec — guards must be BOUND to the looped collection ----------
test('an unrelated membership assertion earlier in the block does NOT guard the loop', () => {
  const src = [
    "test('unrelated toContain does not guard', async () => {",
    "  expect('hello').toContain('ell');", // membership on a string — must NOT silence the check
    '  const rows = await p.getRows();',
    '  for (const r of rows) { expect(r).toBeTruthy(); }',
    '});',
  ].join('\n');
  assertEq(analyzeSpec(src).length, 1, 'a membership assertion on an unrelated value is not a guard');
});

test('a count guard on a DIFFERENT collection does NOT protect the looped one', () => {
  const src = [
    "test('guard on other collection', async () => {",
    '  const other = await p.getItems();',
    '  expect(other.length).toBeGreaterThan(0);', // guards `other`, not `rows`
    '  const rows = await p.getRows();',
    '  for (const r of rows) { expect(r).toBeTruthy(); }',
    '});',
  ].join('\n');
  const findings = analyzeSpec(src);
  assertEq(findings.length, 1, 'only the unguarded `rows` loop is flagged');
  assertEq(findings[0].iterable, 'rows');
});

test('a count guard bound to the looped collection DOES protect it', () => {
  const src = [
    "test('bound guard protects', async () => {",
    '  const other = await p.getItems();',
    '  expect(other.length).toBeGreaterThan(0);',
    '  const rows = await p.getRows();',
    '  expect(rows.length).toBeGreaterThan(0);', // guards `rows`
    '  for (const r of rows) { expect(r).toBeTruthy(); }',
    '});',
  ].join('\n');
  // The `rows` loop is guarded; the `other` collection is never looped → 0 findings.
  assertEq(analyzeSpec(src).length, 0, 'a guard naming the looped collection silences the check');
});

// ---------- analyzeSpec — .forEach loops are scanned too ----------
test('flags a .forEach over a row collection with no prior non-zero guard', () => {
  const src = [
    "test('forEach vacuous', async () => {",
    '  const rows = await p.getRows();',
    '  rows.forEach((r) => { expect(r).toBeTruthy(); });',
    '});',
  ].join('\n');
  const findings = analyzeSpec(src);
  assertEq(findings.length, 1, 'a vacuous .forEach is flagged like a vacuous for-of');
  assertEq(findings[0].iterable, 'rows.forEach');
});

test('does NOT flag a guarded .forEach', () => {
  const src = [
    "test('forEach guarded', async () => {",
    '  const rows = await p.getRows();',
    '  expect(rows.length).toBeGreaterThan(0);',
    '  rows.forEach((r) => { expect(r).toBeTruthy(); });',
    '});',
  ].join('\n');
  assertEq(analyzeSpec(src).length, 0, 'a count guard makes the .forEach non-vacuous');
});

// ---------- walkSpecFiles + buildReport — full pipeline over a temp repo ----------
test('walkSpecFiles finds .spec.ts under clients/<id>/tests and buildReport totals findings', () => {
  const repo = makeTmpRepo();
  // Vacuous spec
  writeSpec(repo, 'clients/acme/tests/strategy/vacuous.spec.ts', [
    "test('vacuous grid', async () => {",
    '  const locs = await s.getStrategyLocations();',
    '  for (const l of locs) { expect(l.office).toBeTruthy(); }',
    '});',
  ].join('\n'));
  // Guarded spec
  writeSpec(repo, 'clients/acme/tests/strategy/guarded.spec.ts', [
    "test('guarded grid', async () => {",
    '  const locs = await s.getStrategyLocations();',
    '  expect(locs.length).toBeGreaterThan(0);',
    '  for (const l of locs) { expect(l.office).toBeTruthy(); }',
    '});',
  ].join('\n'));
  // A non-spec file that must be ignored
  writeSpec(repo, 'clients/acme/tests/strategy/helper.ts', 'export const x = 1;');

  const filePaths = walkSpecFiles(repo);
  assertEq(filePaths.length, 2, 'only the two .spec.ts files are walked');

  const report = buildReport({ repoRoot: repo, filePaths });
  assertEq(report.total, 1, 'one vacuous-risk loop across the repo');
  assertEq(report.files.length, 1, 'only the vacuous spec appears in the report');
  assert(report.files[0].file.endsWith('vacuous.spec.ts'), 'reported file is the vacuous one');
  assert(report.files[0].file.includes('/'), 'paths are forward-slash normalised');
});

test('walkSpecFiles returns empty when there is no clients dir', () => {
  const repo = makeTmpRepo();
  assertEq(walkSpecFiles(repo).length, 0);
});

// ---------- runner ----------
let passed = 0, failed = 0;
for (const c of cases) {
  try { c.fn(); console.log(`  ok  ${c.name}`); passed++; }
  catch (e) { console.error(`  FAIL ${c.name}: ${e.message}`); failed++; }
}
console.log(`\n[check-vacuous-grid-assertions.test] ${passed} passed, ${failed} failed, ${cases.length} total`);
process.exit(failed === 0 ? 0 : 1);
