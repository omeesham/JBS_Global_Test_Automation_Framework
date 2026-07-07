#!/usr/bin/env node
/**
 * check-unfailable-assertions.test.mjs — fixture tests for the unfailable-assertion guard.
 * Mirrors scripts/check-spec-sleeps.test.mjs (pure-function + hand-rolled runner).
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { findUnfailable, walkSpecFiles, buildReport } from './check-unfailable-assertions.mjs';

function makeTmpRepo() { return fs.mkdtempSync(path.join(os.tmpdir(), 'unfailable-')); }
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

// A — benign catch
test('flags .catch(() => "") swallow-to-benign', () => {
  const f = findUnfailable("const v = await p.getText().catch(() => '');");
  assertEq(f.length, 1); assertEq(f[0].kind, 'benign-catch');
});
test('flags .catch(() => []) and .catch(() => 0)', () => {
  assertEq(findUnfailable('await p.rows().catch(() => []);').length, 1);
  assertEq(findUnfailable('await p.n().catch(() => 0);').length, 1);
});
test('does NOT flag a catch that rethrows or logs', () => {
  assertEq(findUnfailable('await p.x().catch((e) => { throw e; });').length, 0);
  assertEq(findUnfailable('await p.x().catch(() => { Log.warn("x"); });').length, 0);
});

// B — unanchored digit regex
test('flags toMatch(/\\d/) and toMatch(/\\d+/) unanchored', () => {
  assertEq(findUnfailable('expect(price).toMatch(/\\d/);').length, 1);
  assertEq(findUnfailable('expect(price).toMatch(/\\d+/);').length, 1);
});
test('does NOT flag an anchored numeric regex', () => {
  assertEq(findUnfailable('expect(price).toMatch(/^\\d+\\.\\d{2}$/);').length, 0, 'anchored ^…$ is a strong assertion');
});

// C — count/length tautology (scoped)
test('flags toBeGreaterThanOrEqual(0) on a count', () => {
  const f = findUnfailable('expect(rowCount).toBeGreaterThanOrEqual(0);');
  assertEq(f.length, 1); assertEq(f[0].kind, 'count-tautology');
});
test('flags toBeGreaterThan(-1) on a length', () => {
  assertEq(findUnfailable('expect(items.length).toBeGreaterThan(-1);').length, 1);
});
test('does NOT flag toBeGreaterThanOrEqual(0) on a non-count value (e.g. a date offset)', () => {
  assertEq(findUnfailable('expect(returnOffset).toBeGreaterThanOrEqual(0);').length, 0, 'no count/length token → a >= 0 bound can be meaningful');
});
test('does NOT flag a real count bound', () => {
  assertEq(findUnfailable('expect(rowCount).toBeGreaterThan(0);').length, 0, 'a strict > 0 count check is meaningful');
});

// D — getAll length-only (warn-only, cross-line)
test('flags a getAll result asserted only by toHaveLength', () => {
  const src = [
    "const yearsParams = url.searchParams.getAll('years');",
    'expect(yearsParams).toHaveLength(3);',
  ].join('\n');
  const f = findUnfailable(src);
  assertEq(f.length, 1); assertEq(f[0].kind, 'getall-length-only');
});
test('flags getAll asserted only by .length equality', () => {
  const src = [
    "const yp = req.searchParams.getAll('years');",
    'expect(yp.length).toBe(2);',
  ].join('\n');
  assertEq(findUnfailable(src).length, 1);
});
test('does NOT flag a getAll result whose values are asserted (toEqual)', () => {
  const src = [
    "const yearsParams = url.searchParams.getAll('years');",
    'expect(yearsParams).toHaveLength(3);',
    "expect([...yearsParams].sort()).toEqual(['2026', '2027', '2028']);",
  ].join('\n');
  assertEq(findUnfailable(src).length, 0, 'the value assertion elsewhere in the file exempts it');
});
test('does NOT flag when a .not.toContain value check is present', () => {
  const src = [
    "const yearsParams = url.searchParams.getAll('years');",
    'expect(yearsParams).toHaveLength(3);',
    "expect(yearsParams).not.toContain('2025');",
  ].join('\n');
  assertEq(findUnfailable(src).length, 0, 'a membership check counts as a value assertion');
});
test('respects the // length-only-ok escape on the assertion line', () => {
  const src = [
    "const yp = url.searchParams.getAll('years');",
    'expect(yp).toHaveLength(1); // length-only-ok: single-year case, value asserted upstream',
  ].join('\n');
  assertEq(findUnfailable(src).length, 0);
});
test('getall-length-only does NOT fire on a non-getAll array length assertion', () => {
  assertEq(findUnfailable('expect(rows).toHaveLength(3);').length, 0, 'only .getAll-sourced vars are in scope for kind D');
});

test('empty / undefined input yields no findings', () => {
  assertEq(findUnfailable('').length, 0);
  assertEq(findUnfailable(undefined).length, 0);
});

// full pipeline
test('walkSpecFiles + buildReport totals findings across the repo', () => {
  const repo = makeTmpRepo();
  writeSpec(repo, 'clients/acme/tests/a/bad.spec.ts', "expect(await p.t().catch(() => '')).toBeTruthy();");
  writeSpec(repo, 'clients/acme/tests/a/good.spec.ts', 'expect(rowCount).toBeGreaterThan(0);');
  writeSpec(repo, 'clients/acme/tests/a/helper.ts', 'export const x = 1;');
  const filePaths = walkSpecFiles(repo);
  assertEq(filePaths.length, 2, 'only .spec.ts files walked');
  const report = buildReport({ repoRoot: repo, filePaths });
  assertEq(report.total, 1);
  assert(report.files[0].file.endsWith('bad.spec.ts'));
});

// ---------- runner ----------
let passed = 0, failed = 0;
for (const c of cases) {
  try { c.fn(); console.log(`  ok  ${c.name}`); passed++; }
  catch (e) { console.error(`  FAIL ${c.name}: ${e.message}`); failed++; }
}
console.log(`\n[check-unfailable-assertions.test] ${passed} passed, ${failed} failed, ${cases.length} total`);
process.exit(failed === 0 ? 0 : 1);
