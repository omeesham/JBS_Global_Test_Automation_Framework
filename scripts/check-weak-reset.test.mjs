#!/usr/bin/env node
/**
 * Unit tests for check-weak-reset.mjs classifyReset() — the reset-classification core.
 * Run: node scripts/check-weak-reset.test.mjs   (exit 0 = all pass, 1 = a case failed)
 */
import { classifyReset, allDescribeBlocks } from './check-weak-reset.mjs';

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  if (got === want) { pass++; }
  else { fail++; console.error(`  FAIL ${name}: got "${got}", want "${want}"`); }
};

const block = (src) => allDescribeBlocks(src)[0].block;

// covers-all: beforeEach restores a baseline, a test commits a save
eq('covers-all', classifyReset(block(`
test.describe('D covers-all', () => {
  test.beforeEach(async ({ p }) => { await p.ensureDefaultState(A, D, LOC); });
  test('t1', async ({ p }) => { await p.setX(1); await p.saveAndConfirm(); });
});`)), 'covers-all');

// fcc: FCC runner in the block
eq('fcc', classifyReset(block(`
test.describe('D fcc', () => {
  test('t1', async ({ p }) => { await saveAndVerifyCase({ baseline: () => p.ensureEmptyState() }); });
});`)), 'fcc');

// fresh-open: beforeEach opens a fresh page
eq('fresh-open', classifyReset(block(`
test.describe('D fresh', () => {
  test.beforeEach(async ({ p }) => { await p.open('equipment'); });
  test('t1', async ({ p }) => { await p.fill(1); await p.clickSaveWithDialog(); });
});`)), 'fresh-open');

// bare-save: beforeEach SAVES but never restores → WEAK
eq('bare-save', classifyReset(block(`
test.describe('D weak', () => {
  test.beforeEach(async ({ p }) => { await p.saveAndConfirm(); });
  test('t1', async ({ p }) => { await p.setX(9); await p.saveAndConfirm(); });
});`)), 'bare-save');

// no-reset: save-capable test but empty beforeEach (that is gate #2's domain → WARN, not bare-save)
eq('no-reset', classifyReset(block(`
test.describe('D noreset', () => {
  test.beforeEach(async ({ p }) => { if (!(await p.isOnTab())) await p.navigateToTab(O); });
  test('t1', async ({ p }) => { await p.setX(2); await p.clickSave(); });
});`)), 'no-reset');

// restore-in-afterEach also counts as covers-all
eq('covers-all-afterEach', classifyReset(block(`
test.describe('D after', () => {
  test.afterEach(async ({ p }) => { await p.ensureDefaultState(A, D, LOC); });
  test('t1', async ({ p }) => { await p.setX(3); await p.saveAndConfirm(); });
});`)), 'covers-all');

console.log(`\ncheck-weak-reset.test: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
