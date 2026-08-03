#!/usr/bin/env node
/**
 * ticket-doctrine-from-scope.test.mjs — unit tests for ticket-doctrine-from-scope.mjs.
 * Run via: node --test scripts/ticket-doctrine-from-scope.test.mjs
 *
 * For the bundled self-test runner:
 *   node scripts/ticket-doctrine-from-scope.mjs --self-test
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { minimatch } from 'minimatch';
import {
  parseFrontmatterPaths,
  parseScopePaths,
  findMatchingRules,
  loadRules,
} from './ticket-doctrine-from-scope.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const RULES_DIR = join(REPO_ROOT, '.claude', 'rules');
const MINIMATCH_OPTS = { dot: true };

// ---------- parseFrontmatterPaths ----------

test('parseFrontmatterPaths: extracts paths list', () => {
  const content = `---
description: test
paths:
  - "src/**/*.ts"
  - "scripts/**/*.mjs"
---

# body`;
  assert.deepEqual(parseFrontmatterPaths(content), ['src/**/*.ts', 'scripts/**/*.mjs']);
});

test('parseFrontmatterPaths: returns empty when no frontmatter', () => {
  assert.deepEqual(parseFrontmatterPaths('# just content'), []);
});

test('parseFrontmatterPaths: returns empty when no paths key', () => {
  const content = `---
description: no paths here
---`;
  assert.deepEqual(parseFrontmatterPaths(content), []);
});

test('parseFrontmatterPaths: stops at next top-level key', () => {
  const content = `---
paths:
  - "src/**/*.ts"
other: value
---`;
  assert.deepEqual(parseFrontmatterPaths(content), ['src/**/*.ts']);
});

// ---------- parseScopePaths ----------

test('parseScopePaths: extracts bullet list from ## SCOPE section', () => {
  const content = '## SCOPE\n- scripts/foo.mjs   (new)\n- src/bar.ts\n\n## OTHER\n';
  const result = parseScopePaths(content);
  assert.ok(result.includes('scripts/foo.mjs'), `missing scripts/foo.mjs in ${JSON.stringify(result)}`);
  assert.ok(result.includes('src/bar.ts'), `missing src/bar.ts in ${JSON.stringify(result)}`);
});

test('parseScopePaths: strips trailing annotations', () => {
  const content = '## SCOPE\n- scripts/foo.mjs   (new — some note)\n';
  const result = parseScopePaths(content);
  assert.deepEqual(result, ['scripts/foo.mjs']);
});

test('parseScopePaths: returns empty when no ## SCOPE section', () => {
  assert.deepEqual(parseScopePaths('## OTHER\n- something'), []);
});

// ---------- findMatchingRules — mechanism (synthetic rules) ----------

test('** zero-segment: tests/foo.spec.ts matches tests/**/*.spec.ts', () => {
  const rules = [{ ruleFile: 'x', globs: ['tests/**/*.spec.ts'] }];
  assert.deepEqual(findMatchingRules(['tests/foo.spec.ts'], rules), ['x']);
});

test('** multi-segment: tests/a/b/foo.spec.ts matches tests/**/*.spec.ts', () => {
  const rules = [{ ruleFile: 'x', globs: ['tests/**/*.spec.ts'] }];
  assert.deepEqual(findMatchingRules(['tests/a/b/foo.spec.ts'], rules), ['x']);
});

test('* does not cross /: README.md does not match clients/*/README.md', () => {
  const rules = [{ ruleFile: 'x', globs: ['clients/*/README.md'] }];
  assert.deepEqual(findMatchingRules(['README.md'], rules), []);
});

test('* within-segment: clients/encore/README.md matches clients/*/README.md', () => {
  const rules = [{ ruleFile: 'x', globs: ['clients/*/README.md'] }];
  assert.deepEqual(findMatchingRules(['clients/encore/README.md'], rules), ['x']);
});

test('dedup: same path twice yields rule once', () => {
  const rules = [{ ruleFile: 'x', globs: ['src/**/*.ts'] }];
  assert.deepEqual(findMatchingRules(['src/foo.ts', 'src/foo.ts'], rules), ['x']);
});

test('dedup: two different matching paths yield rule once', () => {
  const rules = [{ ruleFile: 'x', globs: ['src/**/*.ts'] }];
  assert.deepEqual(findMatchingRules(['src/a.ts', 'src/b.ts'], rules), ['x']);
});

test('no-match: returns empty array', () => {
  const rules = [{ ruleFile: 'x', globs: ['src/**/*.ts'] }];
  assert.deepEqual(findMatchingRules(['README.md'], rules), []);
});

test('output sorted lexicographically', () => {
  const rules = [
    { ruleFile: '.claude/rules/z.md', globs: ['src/**/*.ts'] },
    { ruleFile: '.claude/rules/a.md', globs: ['src/**/*.ts'] },
  ];
  assert.deepEqual(
    findMatchingRules(['src/foo.ts'], rules),
    ['.claude/rules/a.md', '.claude/rules/z.md'],
  );
});

test('trailing /**: .claude/hooks/deep/foo.sh matches .claude/hooks/**', () => {
  const rules = [{ ruleFile: 'x', globs: ['.claude/hooks/**'] }];
  assert.deepEqual(findMatchingRules(['.claude/hooks/deep/foo.sh'], rules), ['x']);
});

test('backslash paths normalized to forward slashes before matching', () => {
  const rules = [{ ruleFile: 'x', globs: ['src/**/*.ts'] }];
  assert.deepEqual(findMatchingRules(['src\\foo\\bar.ts'], rules), ['x']);
});

// ---------- integration tests against real rule files ----------
// Expected values are derived by reading the live globs (not hardcoded from ticket table).

test('integration: clients/encore/tests/foo.spec.ts — derived from live globs', () => {
  const rules = loadRules(RULES_DIR);
  const testPath = 'clients/encore/tests/foo.spec.ts';
  const expected = rules
    .filter(r => r.globs.some(g => minimatch(testPath, g, MINIMATCH_OPTS)))
    .map(r => r.ruleFile)
    .sort();
  const actual = findMatchingRules([testPath], rules);
  assert.deepEqual(actual, expected);
  // Must include at least: specs, angular, browser-tool, deliverable
  for (const must of [
    '.claude/rules/specs.md',
    '.claude/rules/angular.md',
    '.claude/rules/browser-tool.md',
    '.claude/rules/deliverable.md',
  ]) {
    assert.ok(actual.includes(must), `missing ${must} in ${JSON.stringify(actual)}`);
  }
});

test('integration: README.md matches zero live rules', () => {
  const rules = loadRules(RULES_DIR);
  assert.deepEqual(findMatchingRules(['README.md'], rules), []);
});

test('integration: .claude/hooks/foo.sh matches guardrail-policy + hooks-identity only', () => {
  const rules = loadRules(RULES_DIR);
  const actual = findMatchingRules(['.claude/hooks/foo.sh'], rules);
  assert.deepEqual(actual, [
    '.claude/rules/guardrail-policy.md',
    '.claude/rules/hooks-identity.md',
  ]);
});

test('integration: dedup with real rules — same path twice yields same result as once', () => {
  const rules = loadRules(RULES_DIR);
  const single = findMatchingRules(['clients/encore/tests/foo.spec.ts'], rules);
  const doubled = findMatchingRules(
    ['clients/encore/tests/foo.spec.ts', 'clients/encore/tests/foo.spec.ts'],
    rules,
  );
  assert.deepEqual(single, doubled);
});

// ---------- glob-scope intersection tests (strategy c — glob-intersection) ----------

test('glob-scope: clients/*/tests/** yields specs.md via glob-intersection', () => {
  const rules = loadRules(RULES_DIR);
  const actual = findMatchingRules(['clients/*/tests/**'], rules);
  assert.ok(actual.includes('.claude/rules/specs.md'), `missing specs.md in ${JSON.stringify(actual)}`);
  assert.ok(actual.length >= 1, `expected at least 1 rule, got ${JSON.stringify(actual)}`);
});

test('glob-scope: concrete path yields correct rules via glob-intersection', () => {
  const rules = loadRules(RULES_DIR);
  const actual = findMatchingRules(['clients/encore/tests/foo.spec.ts'], rules);
  assert.ok(actual.includes('.claude/rules/specs.md'), `missing specs.md in ${JSON.stringify(actual)}`);
});

test('glob-scope no-match: nonexistent dir glob returns empty without crashing', () => {
  const rules = loadRules(RULES_DIR);
  const actual = findMatchingRules(['nonexistent-xyz-abc-dir/**'], rules);
  assert.deepEqual(actual, []);
});

// ---------- concrete path matching ----------

test('concrete path: returns correct match (glob-intersection, no FS walk)', () => {
  // findMatchingRules uses pure glob-intersection — no filesystem access of any kind.
  // A concrete path matches a rule glob iff the two globs structurally intersect.
  const result = findMatchingRules(
    ['scripts/foo.mjs'],
    [{ ruleFile: 'x', globs: ['scripts/**/*.mjs'] }],
  );
  assert.deepEqual(result, ['x']);
});

// ---------- DEFECT-7: FS-independent structural glob-overlap (non-existent dirs) ----------

test('defect-7: non-existent-dir glob scope yields specs+angular+browser-tool+deliverable via strategy (c)', () => {
  // No repoRoot: strategy (b) is disabled, forcing strategy (c) to supply every match.
  // Expected values are derived by reading live globs at test time, not copied from the ticket.
  const rules = loadRules(RULES_DIR);
  const actual = findMatchingRules(['clients/brand_new/tests/**'], rules);
  for (const must of [
    '.claude/rules/specs.md',
    '.claude/rules/angular.md',
    '.claude/rules/browser-tool.md',
    '.claude/rules/deliverable.md',
  ]) {
    assert.ok(actual.includes(must), `missing ${must} in ${JSON.stringify(actual)}`);
  }
});

test('defect-7 regression: concrete path still yields correct rules (strategy c skips for non-glob)', () => {
  const rules = loadRules(RULES_DIR);
  const actual = findMatchingRules(['clients/encore/tests/foo.spec.ts'], rules);
  assert.ok(
    actual.includes('.claude/rules/specs.md'),
    `missing specs.md in ${JSON.stringify(actual)}`,
  );
});

test('defect-7: structurally non-overlapping non-existent dir glob returns empty', () => {
  // 'nonexistent-xyz-abc-dir' does not structurally match any rule path prefix — must remain empty.
  const rules = loadRules(RULES_DIR);
  const actual = findMatchingRules(['nonexistent-xyz-abc-dir/**'], rules);
  assert.deepEqual(actual, []);
});
