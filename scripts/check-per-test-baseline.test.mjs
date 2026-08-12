#!/usr/bin/env node
/**
 * Unit tests for check-per-test-baseline.mjs — hasMechanism / hasAnyMechanism / beforeEachSlice.
 * Run: node scripts/check-per-test-baseline.test.mjs   (exit 0 = all pass, 1 = a case failed)
 */
import { hasMechanism, hasAnyMechanism, beforeEachSlice } from './check-per-test-baseline.mjs';

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  if (got === want) { pass++; }
  else { fail++; console.error(`  FAIL ${name}: got "${got}", want "${want}"`); }
};

const block = (src) => {
  const re = /test\.describe\s*\(\s*['"`]([^'"`]*)['"`]/;
  const m = re.exec(src);
  return m ? src.slice(m.index) : src;
};

// --- credit-goto-in-beforeeach: goto() in beforeEach is recognised as fresh-open ---
eq('credit-goto-in-beforeeach',
  hasMechanism(block(`
test.describe('Service Charge Basic Information', () => {
  test.beforeEach(async ({ sc }) => { await sc.goto('1604'); });
  test('t1', async ({ sc }) => { await sc.clickSave(); });
});`), 'fresh-open'),
  true);

// --- reject-goto-in-test-body: goto() in test body NOT in beforeEach is NOT credited ---
eq('reject-goto-in-test-body',
  hasAnyMechanism(block(`
test.describe('D no-beforeeach-goto', () => {
  test('t1', async ({ sc }) => { await sc.goto('x'); await sc.clickSave(); });
});`)),
  false);

// --- reject-gotohistory-in-beforeeach: gotoHistory() does NOT match the regex ---
eq('reject-gotohistory-in-beforeeach',
  hasAnyMechanism(block(`
test.describe('D gotohistory', () => {
  test.beforeEach(async ({ sc }) => { await sc.gotoHistory('x'); });
  test('t1', async ({ sc }) => { await sc.clickSave(); });
});`)),
  false);

// --- credit-open-regression: open() in beforeEach still works after regex change ---
eq('credit-open-regression',
  hasMechanism(block(`
test.describe('D open-still-works', () => {
  test.beforeEach(async ({ p }) => { await p.open('equipment'); });
  test('t1', async ({ p }) => { await p.clickSaveWithDialog(); });
});`), 'fresh-open'),
  true);

// --- no-mechanism-save-capable: no beforeEach, just a save in test body → no mechanism ---
eq('no-mechanism-save-capable',
  hasAnyMechanism(block(`
test.describe('D bare-save', () => {
  test('t1', async ({ p }) => { await p.setX(9); await p.clickSave(); });
});`)),
  false);

// --- scope-guard: beforeEachSlice stops at first test() declaration ---
const scopeSrc = `
test.describe('D scope', () => {
  test.beforeEach(async ({ p }) => { await p.open('x'); });
  test('t1', async ({ p }) => { await sc.goto('y'); await p.clickSave(); });
});`;
const slice = beforeEachSlice(block(scopeSrc));
eq('scope-guard-open-in-slice', /\bopen\s*\(/.test(slice), true);
eq('scope-guard-goto-not-in-slice', /\bgoto\s*\(/.test(slice), false);

console.log(`\n${fail === 0 ? 'PASS' : 'FAIL'}: check-per-test-baseline — ${pass} passed, ${fail} failed.`);
process.exit(fail > 0 ? 1 : 0);
