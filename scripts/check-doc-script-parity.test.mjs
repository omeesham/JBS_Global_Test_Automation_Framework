#!/usr/bin/env node
/**
 * check-doc-script-parity.test.mjs — fixture tests for the README ↔ package.json script gate.
 * Mirrors scripts/check-spec-sleeps.test.mjs.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { extractNpmRunRefs, findMissingScripts, findReadmePairs, buildReport } from './check-doc-script-parity.mjs';

function makeTmpRepo() { return fs.mkdtempSync(path.join(os.tmpdir(), 'doc-parity-')); }
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

test('extractNpmRunRefs picks up npm run <name> and the -- form, skips placeholders', () => {
  const md = [
    'Run `npm run test:cli` to execute.',
    'Ship with `npm run client:ship -- --client=encore`.',
    'Generic: `npm run <script>` — illustrative.',
    'Built-in `npm test` is not an npm-run ref.',
  ].join('\n');
  const refs = extractNpmRunRefs(md).map((r) => r.name);
  assert(refs.includes('test:cli'), 'test:cli captured');
  assert(refs.includes('client:ship'), 'client:ship captured (with -- args)');
  assert(!refs.includes('<script>'), 'placeholder skipped');
  assertEq(refs.length, 2, 'only the two real refs');
});

test('findMissingScripts flags a documented script absent from package.json', () => {
  const md = 'Run `npm run test:chrome` and `npm run test:cli`.';
  const scripts = { 'test:cli': 'playwright test' }; // test:chrome missing
  const missing = findMissingScripts(md, scripts);
  assertEq(missing.length, 1);
  assertEq(missing[0].name, 'test:chrome');
});

test('findMissingScripts returns empty when all documented scripts exist', () => {
  const md = 'Run `npm run a` and `npm run b`.';
  assertEq(findMissingScripts(md, { a: 'x', b: 'y' }).length, 0);
});

test('empty inputs are safe', () => {
  assertEq(extractNpmRunRefs('').length, 0);
  assertEq(extractNpmRunRefs(undefined).length, 0);
  assertEq(findMissingScripts('', {}).length, 0);
});

// full pipeline over a temp repo — root + one client
test('findReadmePairs + buildReport across root and clients', () => {
  const repo = makeTmpRepo();
  write(repo, 'README.md', 'Root: `npm run build`.');
  write(repo, 'package.json', JSON.stringify({ scripts: { build: 'tsc' } }));
  write(repo, 'clients/encore/README.md', 'Client: `npm run test:chrome`.'); // missing
  write(repo, 'clients/encore/package.json', JSON.stringify({ scripts: { 'test:cli': 'playwright test' } }));

  const pairs = findReadmePairs(repo);
  assertEq(pairs.length, 2, 'root + one client README/package.json pair');
  const report = buildReport({ repoRoot: repo, pairs });
  assertEq(report.total, 1, 'only the client test:chrome ref is missing');
  assert(report.files[0].file.endsWith('clients/encore/README.md'));
  assertEq(report.files[0].missing[0].name, 'test:chrome');
});

// ---------- runner ----------
let passed = 0, failed = 0;
for (const c of cases) {
  try { c.fn(); console.log(`  ok  ${c.name}`); passed++; }
  catch (e) { console.error(`  FAIL ${c.name}: ${e.message}`); failed++; }
}
console.log(`\n[check-doc-script-parity.test] ${passed} passed, ${failed} failed, ${cases.length} total`);
process.exit(failed === 0 ? 0 : 1);
