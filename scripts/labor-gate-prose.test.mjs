// labor-gate-prose.test.mjs — fixture suite for labor-gate.mjs quote-aware splitter
// Run with: node scripts/labor-gate-prose.test.mjs
//
// Tests that the labor gate does NOT false-deny ordinary developer commands
// whose prose merely MENTIONS a test invocation (commit messages, grep patterns,
// echo, documentation writes), while still denying real test invocations.
//
// Two cases (P01, P02) assert the quote-aware behaviour that requires the
// operator's patch to splitCompoundCommand. Until that patch lands on disk,
// those cases FAIL — that is correct and expected; see EXPECTED-FAILURES.

import { join } from 'node:path';

const HOME = process.env.HOME || process.env.USERPROFILE || '';
const guardPath = join(HOME, '.claude', 'hooks', 'labor-gate.mjs');
const { checkCommand } = await import('file:///' + guardPath.replace(/\\/g, '/'));

// ─── Harness (matches test-dispatch-visibility-fixtures.mjs) ──────────────────

let passed = 0;
let failed = 0;
const PREPATCH_CASES = new Set(['P01', 'P02']);

function assert(id, label, cmd, expectedAllow) {
  const result = checkCommand(cmd);
  const ok = result.allow === expectedAllow;
  if (ok) {
    passed++;
    console.log(`  PASS [${expectedAllow ? 'ALLOW' : 'DENY'}] ${id} ${label}`);
  } else {
    failed++;
    const pre = PREPATCH_CASES.has(id)
      ? ' [AWAITING OPERATOR PATCH to splitCompoundCommand quote-tracking]'
      : '';
    console.error(`  FAIL [expected ${expectedAllow ? 'ALLOW' : 'DENY'}, got ${result.allow ? 'ALLOW' : 'DENY'}] ${id} ${label}${pre}`);
    if (result.reason) console.error(`       reason: ${result.reason}`);
  }
}

console.log('\n=== labor-gate prose-vs-invocation fixture suite ===\n');

// ═══════════════════════════════════════════════════════════════════════════════
// MUST-ALLOW — ordinary commands whose prose mentions test invocations
// ═══════════════════════════════════════════════════════════════════════════════

// P01 and P02: the two cases that exercise the quote-aware splitter.
// Pre-patch, splitCompoundCommand splits on \n and ; inside quotes,
// causing the prose fragment to be classified as a standalone invocation.

assert('P01', 'multi-line commit message body mentions npm test',
  'git commit -m "Fix parser edge case\n\nnpm test now passes on all inputs"',
  true);

assert('P02', 'single-line commit message with semicolon mentions npm test',
  'git commit -m "Fixed parser; npm test passes now"',
  true);

assert('P03', 'grep whose search pattern is a test command',
  'grep -r "npm test" .',
  true);

assert('P04', 'echo of a test command',
  'echo "npx playwright test --grep smoke"',
  true);

assert('P05', 'documentation write containing a test command',
  'cat > CONTRIBUTING.md << \'EOF\'\nTo run tests: npm run e2e\nEOF',
  true);

assert('P06', 'heredoc body contains playwright test invocation',
  'cat << USAGE\nRun: npx playwright test --project=chromium\nUSAGE',
  true);

assert('P07', 'piped log search whose pattern mentions a test command',
  'git log --oneline --grep="npm test" | head -5',
  true);

// ═══════════════════════════════════════════════════════════════════════════════
// MUST-DENY — real invocations that must still be refused
// ═══════════════════════════════════════════════════════════════════════════════

assert('D01', 'bare playwright test runner',
  'npx playwright test',
  false);

assert('D02', 'package-manager test script',
  'npm test',
  false);

assert('D03', 'run-script alias targeting e2e',
  'npm run e2e',
  false);

assert('D04', 'runner with a filter flag',
  'npx playwright test --grep "smoke"',
  false);

assert('D05', 'test command inside shell -c wrapper',
  'bash -c "npm test"',
  false);

assert('D06', 'test command behind nohup (command runner prefix)',
  'nohup npx playwright test',
  false);

assert('D07', 'test command after cd joined by &&',
  'cd /tmp && npm test',
  false);

assert('D08', 'test command with environment-variable prefix',
  'CI=1 npm test',
  false);

assert('D09', 'playwright invoked directly (no npx)',
  'playwright test',
  false);

assert('D10', 'direct path to playwright binary',
  'node_modules/.bin/playwright test',
  false);

assert('D11', 'npm run regression',
  'npm run regression',
  false);

assert('D12', 'pnpm test',
  'pnpm test',
  false);

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed (of ${passed + failed} total)\n`);

if (failed > 0) {
  const prePatchCount = [...PREPATCH_CASES].length;
  console.log(`NOTE: ${prePatchCount} failure(s) are expected pre-patch (P01, P02).`);
  console.log('      They will pass once the operator applies the quote-tracking patch');
  console.log('      to splitCompoundCommand in the protected labor-gate.mjs file.\n');
}

process.exit(failed > 0 ? 1 : 0);
