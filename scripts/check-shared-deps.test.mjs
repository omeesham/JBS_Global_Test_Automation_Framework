#!/usr/bin/env node
/**
 * check-shared-deps.test.mjs — fixture tests for check-shared-deps.mjs.
 * Run: node scripts/check-shared-deps.test.mjs  (exit 0 = all pass, 1 = any failed)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { isFine, extractPathRefs, resolveRef, buildReport } from './check-shared-deps.mjs';

const cases = [];
function test(name, fn) { cases.push({ name, fn }); }
function assertEq(got, want, msg) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g !== w) throw new Error(`${msg || 'assertEq'}: got ${g}, want ${w}`);
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

// ─── isFine() unit tests ────────────────────────────────────────────────────

test('isFine: .env.local is FINE', () => assert(isFine('.env.local')));
test('isFine: clients/encore/.env.local is FINE', () => assert(isFine('clients/encore/.env.local')));
test('isFine: clients/encore/.env.development.local is FINE', () => assert(isFine('clients/encore/.env.development.local')));
test('isFine: .env.server is FINE', () => assert(isFine('.env.server')));
test('isFine: clients/encore/.env.server is FINE', () => assert(isFine('clients/encore/.env.server')));
test('isFine: test-results/foo.html is FINE', () => assert(isFine('test-results/foo.html')));
test('isFine: clients/encore/test-results/trace.zip is FINE', () => assert(isFine('clients/encore/test-results/trace.zip')));
test('isFine: node_modules/lodash/index.js is FINE', () => assert(isFine('node_modules/lodash/index.js')));
test('isFine: .auth/session.json is FINE', () => assert(isFine('.auth/session.json')));
test('isFine: clients/encore/.auth/state.json is FINE', () => assert(isFine('clients/encore/.auth/state.json')));
test('isFine: .claude/state/chain.log is FINE', () => assert(isFine('.claude/state/chain.log')));
test('isFine: .claude/private/guiding-vision.md is FINE', () => assert(isFine('.claude/private/guiding-vision.md')));
test('isFine: runtime.log is FINE (*.log)', () => assert(isFine('logs/runtime.log')));
test('isFine: current_plan.md is FINE', () => assert(isFine('current_plan.md')));
test('isFine: rotation-state.json is FINE', () => assert(isFine('rotation-state.json')));

// NOT fine — these are knowledge artifacts that must be obtainable
test('isFine: clients/encore/CLAUDE.md is NOT fine', () => assert(!isFine('clients/encore/CLAUDE.md')));
test('isFine: clients/encore/specs_planning/walk-evidence.md is NOT fine', () => assert(!isFine('clients/encore/specs_planning/walk-evidence.md')));
test('isFine: clients/encore/specs_planning/_internal/field-inventory.md is NOT fine', () => assert(!isFine('clients/encore/specs_planning/_internal/field-inventory.md')));
test('isFine: plans/done/some-plan.md is NOT fine', () => assert(!isFine('plans/done/some-plan.md')));
test('isFine: docs/read_only_docs/LEARNED_RULES.md is NOT fine', () => assert(!isFine('docs/read_only_docs/LEARNED_RULES.md')));

// ─── extractPathRefs() unit tests ───────────────────────────────────────────

test('extractPathRefs: @-reference with slash is extracted', () => {
  const refs = extractPathRefs('@clients/encore/CLAUDE.md', 'CLAUDE.md');
  assert(refs.some((r) => r.rawPath === 'clients/encore/CLAUDE.md'), 'should extract @-ref');
});

test('extractPathRefs: @-reference without slash (@username) is NOT extracted', () => {
  const refs = extractPathRefs('cc @fcc tag', 'README.md');
  assert(!refs.some((r) => r.rawPath === 'fcc'), '@fcc has no slash, skip');
});

test('extractPathRefs: markdown relative link is extracted', () => {
  const refs = extractPathRefs('[text](clients/foo/bar.md)', 'plans/INDEX.md');
  assert(refs.some((r) => r.rawPath === 'clients/foo/bar.md'), 'markdown link should be extracted');
});

test('extractPathRefs: markdown https URL is NOT extracted', () => {
  const refs = extractPathRefs('[link](https://example.com/clients/foo/bar)', 'README.md');
  assert(!refs.some((r) => r.rawPath.startsWith('https')), 'URL must not be extracted');
});

test('extractPathRefs: backtick path with known dir is extracted', () => {
  const refs = extractPathRefs('see `clients/encore/specs_planning/_internal/foo.md`', 'CLAUDE.md');
  assert(refs.some((r) => r.rawPath === 'clients/encore/specs_planning/_internal/foo.md'));
});

test('extractPathRefs: backtick path on glob-containing line is NOT extracted', () => {
  // Lines with * are glob docs, not concrete paths
  const refs = extractPathRefs('pattern `clients/*/specs_planning/` matches all', 'CLAUDE.md');
  assert(!refs.some((r) => r.rawPath.includes('*')), 'glob path must not be extracted');
});

test('extractPathRefs: relative ESM import is extracted', () => {
  const refs = extractPathRefs("import { foo } from './check-dead-exports.mjs';", 'scripts/bar.mjs');
  assert(refs.some((r) => r.rawPath === './check-dead-exports.mjs'));
});

test('extractPathRefs: npm package import is NOT extracted', () => {
  const refs = extractPathRefs("import { readFile } from 'node:fs';", 'scripts/foo.mjs');
  assert(!refs.some((r) => r.rawPath === 'node:fs'), 'npm/node: import must not be extracted');
});

test('extractPathRefs: empty input is safe', () => {
  assertEq(extractPathRefs('', 'foo.md').length, 0);
  assertEq(extractPathRefs(undefined, 'foo.md').length, 0);
});

// ─── resolveRef() unit tests ─────────────────────────────────────────────────

test('resolveRef: repo-root-relative path is normalised', () => {
  const rel = resolveRef('clients/encore/CLAUDE.md', 'CLAUDE.md', '/repo');
  assertEq(rel, 'clients/encore/CLAUDE.md');
});

test('resolveRef: relative import is resolved against file dir', () => {
  const rel = resolveRef('./check-dead-exports.mjs', 'scripts/bar.mjs', '/repo');
  assertEq(rel, 'scripts/check-dead-exports.mjs');
});

test('resolveRef: path escaping the repo returns null', () => {
  assertEq(resolveRef('../../outside/file.md', 'scripts/foo.mjs', '/repo'), null);
});

// ─── Integration test with temp git repo ──────────────────────────────────────

function gitExec(args, cwd) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (r.error) throw new Error(`git ${args[0]}: ${r.error.message}`);
  return r;
}

function writeFile(dir, rel, content) {
  const full = path.join(dir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  return full;
}

test('integration: full scenario across 6 cases', () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'check-shared-deps-'));
  try {
    gitExec(['init'], repo);
    gitExec(['config', 'user.email', 'test@test.com'], repo);
    gitExec(['config', 'user.name', 'Test'], repo);

    // .gitignore: ignore knowledge artifacts under specs_planning/ and CLAUDE.md
    writeFile(repo, '.gitignore', [
      'clients/*/CLAUDE.md',
      'clients/*/specs_planning/',
    ].join('\n') + '\n');

    // Case 1 (BROKEN, auto-loading file): CLAUDE.md references @clients/encore/CLAUDE.md
    writeFile(repo, 'CLAUDE.md',
      '| Active client | `@clients/encore/CLAUDE.md` |\n' +
      '| Inventory spec | `@clients/encore/specs_planning/_internal/field-inventory-spec.md` |\n',
    );

    // Case 2 (BROKEN, inert plan): plan references a gitignored evidence artifact
    writeFile(repo, 'plans/done/old-plan.md',
      'Walk evidence: clients/encore/specs_planning/_internal/walk-evidence.md\n',
    );

    // Case 3 (FINE): reference to .env.local — must NOT flag
    writeFile(repo, 'docs/SETUP.md',
      'Copy `.env.local` from the template. See also https://example.com/docs for details.\n',
    );

    // Case 4 (tracked): scripts/bar.mjs imports from scripts/foo.mjs (both tracked) — must NOT flag
    writeFile(repo, 'scripts/foo.mjs', 'export const x = 1;\n');
    writeFile(repo, 'scripts/bar.mjs', "import { x } from './foo.mjs';\n");

    // Case 6 (URL — not a path): in docs file above (https://example.com/ already excluded by Pattern 2 filter)

    // Stage tracked files (not the gitignored ones)
    gitExec(['add', '.gitignore', 'CLAUDE.md', 'plans/done/old-plan.md', 'docs/SETUP.md', 'scripts/foo.mjs', 'scripts/bar.mjs'], repo);

    // Case 5 (BROKEN, gitignored knowledge artifact): create but do NOT add to index
    writeFile(repo, 'clients/encore/CLAUDE.md', '# Encore config\n');
    writeFile(repo, 'clients/encore/specs_planning/_internal/field-inventory-spec.md', '# Inventory\n');
    writeFile(repo, 'clients/encore/specs_planning/_internal/walk-evidence.md', '# Evidence\n');

    const { broken } = buildReport({ repoRoot: repo });

    // Case 3: .env.local must NOT appear in broken
    assert(!broken.some((b) => b.relPath.includes('.env.local')), 'Case 3: .env.local must NOT be flagged');

    // Case 4: scripts/foo.mjs (tracked) must NOT appear in broken
    assert(!broken.some((b) => b.relPath === 'scripts/foo.mjs'), 'Case 4: tracked import must NOT be flagged');

    // Case 6: https://example.com URL must NOT appear in broken
    assert(!broken.some((b) => b.relPath.startsWith('https')), 'Case 6: URL must NOT be flagged');

    // Cases 1 & 5: gitignored knowledge artifacts must appear in broken
    assert(broken.some((b) => b.relPath === 'clients/encore/CLAUDE.md'),
      'Case 1/5: clients/encore/CLAUDE.md must be flagged');

    // Case 2: inert plan reference to gitignored evidence must be flagged
    assert(broken.some((b) => b.relPath.includes('specs_planning') && b.relPath.includes('walk-evidence')),
      'Case 2: gitignored walk-evidence must be flagged');

    // Auto-loading files must sort first
    const cmFinding = broken.find((b) => b.refFile === 'CLAUDE.md');
    assert(cmFinding, 'CLAUDE.md must appear as a referencing file');
    const planFinding = broken.find((b) => b.refFile === 'plans/done/old-plan.md');
    assert(planFinding, 'plans/done/old-plan.md must appear as a referencing file');
    const cmIdx = broken.indexOf(cmFinding);
    const planIdx = broken.indexOf(planFinding);
    assert(cmIdx < planIdx, 'CLAUDE.md (auto-loading) must sort before the inert plan');

  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

// ─── Runner ──────────────────────────────────────────────────────────────────

let passed = 0, failed = 0;
for (const c of cases) {
  try { c.fn(); console.log(`  ok  ${c.name}`); passed++; }
  catch (e) { console.error(`  FAIL ${c.name}: ${e.message}`); failed++; }
}
console.log(`\n[check-shared-deps.test] ${passed} passed, ${failed} failed, ${cases.length} total`);
process.exit(failed === 0 ? 0 : 1);
