#!/usr/bin/env ts-node
/**
 * sp00-with-run.test.ts — proves the `--with-run` outcome path is REAL, not a stub
 * (PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT, 2026-06-11).
 *
 * Two layers of proof:
 *   1. mapRunOutcomes/classifySpecOutcome over a SYNTHETIC Playwright JSON report —
 *      deterministic mapping of passed/failed/skipped/fixme → Pass/Fail/Skipped/Blocked.
 *   2. runAndMapOutcomes against a THROWAWAY real Playwright project (one passing +
 *      one failing TC, no browser) — an ACTUAL suite run whose failing test stamps
 *      'Fail'. This exercises the non-zero-exit stdout-capture that makes a failing
 *      run yield real Fail stamps.
 *
 * Run: ts-node scripts/sp00-with-run.test.ts   (npm run test:sp00-with-run)
 */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { mapRunOutcomes, classifySpecOutcome, runAndMapOutcomes } from '../export_test_cases/sp00-augment-logic';

let failures = 0;
function check(label: string, cond: boolean): void {
  console.log(`  ${cond ? '[OK]' : '[FAIL]'} ${label}`);
  if (!cond) failures++;
}

// ── Layer 1: synthetic JSON report → outcome map ──
console.log('mapRunOutcomes — synthetic report');
const synthetic = {
  suites: [
    {
      specs: [
        { title: 'TC-LOC-CUR-001: passes', tests: [{ status: 'expected', results: [{ status: 'passed' }] }] },
        { title: 'TC-LOC-CUR-002: fails', tests: [{ status: 'unexpected', results: [{ status: 'failed' }] }] },
        { title: 'TC-LOC-CUR-003: skipped', tests: [{ status: 'skipped', annotations: [{ type: 'skip' }], results: [{ status: 'skipped' }] }] },
        { title: 'TC-LOC-CUR-004: fixme', tests: [{ status: 'skipped', annotations: [{ type: 'fixme' }], results: [{ status: 'skipped' }] }] },
        { title: 'TC-LOC-CUR-005: flaky', tests: [{ status: 'flaky', results: [{ status: 'failed' }, { status: 'passed' }] }] },
      ],
    },
  ],
};
const m = mapRunOutcomes(synthetic);
check("passed → 'Pass'", m.get('TC-LOC-CUR-001') === 'Pass');
check("failed → 'Fail'", m.get('TC-LOC-CUR-002') === 'Fail');
check("skip → 'Skipped'", m.get('TC-LOC-CUR-003') === 'Skipped');
check("fixme → 'Blocked'", m.get('TC-LOC-CUR-004') === 'Blocked');
check("flaky (green-on-retry) → 'Pass'", m.get('TC-LOC-CUR-005') === 'Pass');
check('classifySpecOutcome direct fail', classifySpecOutcome({ tests: [{ status: 'unexpected' }] }) === 'Fail');

// ── Layer 2: ACTUAL run against a throwaway Playwright project ──
console.log('runAndMapOutcomes — actual Playwright run (no browser)');
// Temp project lives UNDER the repo so `@playwright/test` resolves from repo node_modules.
const REPO_ROOT = path.resolve(__dirname, '..');
const proj = fs.mkdtempSync(path.join(REPO_ROOT, '.tmp-with-run-'));
try {
  fs.writeFileSync(
    path.join(proj, 'playwright.config.ts'),
    `import { defineConfig } from '@playwright/test';\n` +
      `export default defineConfig({ testDir: '.', fullyParallel: true, retries: 0, reporter: 'list' });\n`
  );
  // Pure-assertion tests (never touch \`page\`) so no browser is launched.
  fs.writeFileSync(
    path.join(proj, 'sample.spec.ts'),
    `import { test, expect } from '@playwright/test';\n` +
      `test('TC-TST-RUN-001: passes', () => { expect(1).toBe(1); });\n` +
      `test('TC-TST-RUN-002: fails on purpose', () => { expect(1).toBe(2); });\n`
  );
  const outcomes = runAndMapOutcomes(proj);
  check("real run: passing TC → 'Pass'", outcomes.get('TC-TST-RUN-001') === 'Pass');
  check("real run: a genuinely-failing TC stamps 'Fail'", outcomes.get('TC-TST-RUN-002') === 'Fail');
} catch (err) {
  check(`real run executed without infra error (${(err as Error).message.slice(0, 80)})`, false);
} finally {
  fs.rmSync(proj, { recursive: true, force: true });
}

console.log('');
if (failures === 0) {
  console.log('[sp00 with-run test] PASS — with-run maps real run outcomes (incl. Fail)');
  process.exit(0);
} else {
  console.log(`[sp00 with-run test] FAIL — ${failures} assertion(s) failed`);
  process.exit(1);
}
