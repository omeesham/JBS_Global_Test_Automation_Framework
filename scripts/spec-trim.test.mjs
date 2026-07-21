#!/usr/bin/env node
/**
 * spec-trim.test.mjs — fixture tests for the spec-trim AST slicer.
 * Mirrors scripts/check-swallowed-failures.test.mjs style.
 *
 * Run: node scripts/spec-trim.test.mjs
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseSelector,
  parseSelectorDetailed,
  identifyCall,
  extractTcId,
  computeRemovals,
  spliceOut,
  extractTcIdsFromTitles,
  runSafetyChecks,
  pruneUnusedImports,
  ArgError,
  TcIdError,
} from './spec-trim.mjs';
import ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTmpDir() { return fs.mkdtempSync(path.join(os.tmpdir(), 'spec-trim-')); }
function write(dir, rel, body) {
  const full = path.join(dir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, body, 'utf8');
  return full;
}

const cases = [];
function test(name, fn) { cases.push({ name, fn }); }
function assertEq(actual, expected, msg) {
  if (actual !== expected)
    throw new Error(`${msg || 'assertEq'} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assert failed'); }
function assertThrows(fn, ErrorClass, msgContains) {
  let threw = false;
  try { fn(); } catch (e) {
    threw = true;
    if (ErrorClass && !(e instanceof ErrorClass))
      throw new Error(`expected ${ErrorClass.name} but got ${e.constructor.name}: ${e.message}`);
    if (msgContains && !e.message.includes(msgContains))
      throw new Error(`expected message containing "${msgContains}" but got: ${e.message}`);
  }
  if (!threw) throw new Error(`expected to throw but did not`);
}

/** Parse text with TypeScript and return top-level statements. */
function stmts(src) {
  const sf = ts.createSourceFile('f.ts', src, ts.ScriptTarget.Latest, true);
  return [...sf.statements];
}

/** Run computeRemovals in 'keep' mode and return trimmed text. */
function keepTrim(src, ids) {
  const idSet = new Set(Array.isArray(ids) ? ids : [...ids]);
  const sf = ts.createSourceFile('f.ts', src, ts.ScriptTarget.Latest, true);
  const result = computeRemovals([...sf.statements], src, (id) => !idSet.has(id));
  return spliceOut(src, result.spans);
}

// ---------------------------------------------------------------------------
// parseSelector
// ---------------------------------------------------------------------------

test('parseSelector: single TC ID', () => {
  const s = parseSelector('TC-CPR-OVR-001');
  assertEq(s.size, 1);
  assert(s.has('TC-CPR-OVR-001'));
});

test('parseSelector: comma-separated list', () => {
  const s = parseSelector('TC-CPR-OVR-001,TC-CPR-OVR-005,TC-CPR-OVR-010');
  assertEq(s.size, 3);
  assert(s.has('TC-CPR-OVR-005'));
});

test('parseSelector: full-ID range TC-CPR-OVR-001..TC-CPR-OVR-003', () => {
  const s = parseSelector('TC-CPR-OVR-001..TC-CPR-OVR-003');
  assertEq(s.size, 3);
  assert(s.has('TC-CPR-OVR-001') && s.has('TC-CPR-OVR-002') && s.has('TC-CPR-OVR-003'));
});

test('parseSelector: abbreviated range TC-CPR-OVR-001..003', () => {
  const s = parseSelector('TC-CPR-OVR-001..003');
  assertEq(s.size, 3);
  assert(s.has('TC-CPR-OVR-001') && s.has('TC-CPR-OVR-002') && s.has('TC-CPR-OVR-003'));
});

test('parseSelector: mixed-prefix range throws ArgError', () => {
  assertThrows(() => parseSelector('TC-CPR-OVR-001..TC-CPR-DET-005'), ArgError, 'same alphabetic prefix');
});

test('parseSelector: range start > end throws ArgError', () => {
  assertThrows(() => parseSelector('TC-CPR-OVR-005..003'), ArgError, 'start > end');
});

// ---------------------------------------------------------------------------
// parseSelectorDetailed
// ---------------------------------------------------------------------------

test('parseSelectorDetailed: single ID lands in explicitIds, not endpointIds', () => {
  const { ids, explicitIds, endpointIds } = parseSelectorDetailed('TC-CPR-OVR-001');
  assertEq(ids.size, 1);
  assert(explicitIds.has('TC-CPR-OVR-001'), 'explicit');
  assertEq(endpointIds.size, 0, 'no endpoints for single-ID');
});

test('parseSelectorDetailed: range endpoints in endpointIds, interior not in explicitIds or endpointIds', () => {
  const { ids, explicitIds, endpointIds } = parseSelectorDetailed('TC-CPR-OVR-001..003');
  assertEq(ids.size, 3);
  assertEq(explicitIds.size, 0, 'no explicit IDs from range');
  assert(endpointIds.has('TC-CPR-OVR-001'), 'start endpoint');
  assert(endpointIds.has('TC-CPR-OVR-003'), 'end endpoint');
  assert(!endpointIds.has('TC-CPR-OVR-002'), 'interior not an endpoint');
  assert(ids.has('TC-CPR-OVR-002'), 'interior in full set');
});

test('parseSelectorDetailed: parseSelector still returns the full ids Set', () => {
  const set = parseSelector('TC-CPR-OVR-001..003');
  assertEq(set.size, 3);
  assert(set.has('TC-CPR-OVR-002'));
});

// ---------------------------------------------------------------------------
// identifyCall
// ---------------------------------------------------------------------------

test('identifyCall: recognises test(', () => {
  const [s] = stmts("test('TC-001: t', async () => {});");
  const c = identifyCall(s);
  assert(c && c.kind === 'test' && c.title === 'TC-001: t');
});

test('identifyCall: recognises test.skip(', () => {
  const [s] = stmts("test.skip('TC-002: t', async () => {});");
  assertEq(identifyCall(s)?.kind, 'test');
});

test('identifyCall: recognises test.fixme(', () => {
  const [s] = stmts("test.fixme('TC-003: t', async () => {});");
  assertEq(identifyCall(s)?.kind, 'test');
});

test('identifyCall: recognises test.only(', () => {
  const [s] = stmts("test.only('TC-004: t', async () => {});");
  assertEq(identifyCall(s)?.kind, 'test');
});

test('identifyCall: recognises test.describe(', () => {
  const [s] = stmts("test.describe('Suite', () => {});");
  assertEq(identifyCall(s)?.kind, 'describe');
});

test('identifyCall: recognises test.describe.skip(', () => {
  const [s] = stmts("test.describe.skip('Suite', () => {});");
  assertEq(identifyCall(s)?.kind, 'describe');
});

test('identifyCall: returns null for test.beforeEach(', () => {
  const [s] = stmts("test.beforeEach(async () => {});");
  assert(identifyCall(s) === null);
});

test('identifyCall: returns null for import declarations', () => {
  const [s] = stmts("import { test } from './fixture';");
  assert(identifyCall(s) === null);
});

// ---------------------------------------------------------------------------
// extractTcId
// ---------------------------------------------------------------------------

test('extractTcId: extracts from standard title', () => {
  assertEq(extractTcId('TC-CPR-OVR-001: screen loads'), 'TC-CPR-OVR-001');
});
test('extractTcId: returns null when no TC ID', () => {
  assert(extractTcId('just a plain title') === null);
});

// ---------------------------------------------------------------------------
// computeRemovals — keep mode
// ---------------------------------------------------------------------------

test('keep a contiguous range: only kept IDs survive', () => {
  const src = [
    "test('TC-A-001: one', async () => {});",
    "test('TC-A-002: two', async () => {});",
    "test('TC-A-003: three', async () => {});",
  ].join('\n');
  const out = keepTrim(src, ['TC-A-001', 'TC-A-003']);
  assert(out.includes('TC-A-001'), 'TC-A-001 kept');
  assert(!out.includes('TC-A-002'), 'TC-A-002 removed');
  assert(out.includes('TC-A-003'), 'TC-A-003 kept');
});

test('keep a non-contiguous set across describe blocks', () => {
  const src = [
    "test.describe('D1', () => {",
    "  test('TC-A-001: a', async () => {});",
    "  test('TC-A-002: b', async () => {});",
    "});",
    "test.describe('D2', () => {",
    "  test('TC-A-003: c', async () => {});",
    "});",
  ].join('\n');
  const out = keepTrim(src, ['TC-A-001', 'TC-A-003']);
  assert(out.includes('TC-A-001'));
  assert(!out.includes('TC-A-002'));
  assert(out.includes('TC-A-003'));
});

test('drop mode: specified IDs are removed, rest kept', () => {
  const src = [
    "test('TC-A-001: one', async () => {});",
    "test('TC-A-002: two', async () => {});",
    "test('TC-A-003: three', async () => {});",
  ].join('\n');
  const idSet = new Set(['TC-A-002']);
  const sf = ts.createSourceFile('f.ts', src, ts.ScriptTarget.Latest, true);
  const result = computeRemovals([...sf.statements], src, (id) => idSet.has(id));
  const out = spliceOut(src, result.spans);
  assert(!out.includes('TC-A-002'), 'TC-A-002 dropped');
  assert(out.includes('TC-A-001'), 'TC-A-001 kept');
  assert(out.includes('TC-A-003'), 'TC-A-003 kept');
});

// ---------------------------------------------------------------------------
// Describe emptiness cascade
// ---------------------------------------------------------------------------

test('a describe with all tests removed is itself removed', () => {
  const src = [
    "test.describe('Suite', () => {",
    "  test('TC-A-001: a', async () => {});",
    "  test('TC-A-002: b', async () => {});",
    "});",
  ].join('\n');
  const out = keepTrim(src, []);  // keep nothing
  assert(!out.includes('describe'), 'empty describe removed');
  assert(!out.includes('TC-A-001'));
  assert(!out.includes('TC-A-002'));
});

test('an outer describe emptied by inner removals is also removed', () => {
  const src = [
    "test.describe('Outer', () => {",
    "  test.describe('Inner', () => {",
    "    test('TC-A-001: a', async () => {});",
    "  });",
    "});",
  ].join('\n');
  const out = keepTrim(src, []);
  assert(!out.includes('Outer'), 'outer describe removed');
  assert(!out.includes('Inner'), 'inner describe removed');
});

test('a describe with a surviving test is NOT removed', () => {
  const src = [
    "test.describe('Suite', () => {",
    "  test('TC-A-001: a', async () => {});",
    "  test('TC-A-002: b', async () => {});",
    "});",
  ].join('\n');
  const out = keepTrim(src, ['TC-A-001']);
  assert(out.includes('Suite'), 'describe retained');
  assert(out.includes('TC-A-001'), 'kept test present');
  assert(!out.includes('TC-A-002'), 'dropped test gone');
});

test('hooks (beforeEach/afterEach) inside a surviving describe are kept', () => {
  const src = [
    "test.describe('Suite', () => {",
    "  test.beforeEach(async () => { console.log('before'); });",
    "  test('TC-A-001: a', async () => {});",
    "});",
  ].join('\n');
  const out = keepTrim(src, ['TC-A-001']);
  assert(out.includes('beforeEach'), 'hook retained');
  assert(out.includes('TC-A-001'));
});

// ---------------------------------------------------------------------------
// test.skip / test.fixme / test.only handled like test
// ---------------------------------------------------------------------------

test('test.skip is handled like test — kept when in set', () => {
  const src = "test.skip('TC-A-001: skipped', async () => {});";
  const out = keepTrim(src, ['TC-A-001']);
  assert(out.includes('TC-A-001'));
  assert(out.includes('test.skip'));
});

test('test.fixme is handled like test — removed when not in set', () => {
  const src = [
    "test('TC-A-001: normal', async () => {});",
    "test.fixme('TC-A-002: fixme', async () => {});",
  ].join('\n');
  const out = keepTrim(src, ['TC-A-001']);
  assert(out.includes('TC-A-001'));
  assert(!out.includes('TC-A-002'));
});

test('test.only is handled like test', () => {
  const src = [
    "test.only('TC-A-001: only', async () => {});",
    "test('TC-A-002: normal', async () => {});",
  ].join('\n');
  const out = keepTrim(src, ['TC-A-002']);
  assert(!out.includes('TC-A-001'));
  assert(out.includes('TC-A-002'));
});

// ---------------------------------------------------------------------------
// Title with no TC ID → TcIdError
// ---------------------------------------------------------------------------

test('a test title with no TC ID throws TcIdError', () => {
  const src = "test('plain title without TC id', async () => {});";
  const sf = ts.createSourceFile('f.ts', src, ts.ScriptTarget.Latest, true);
  assertThrows(
    () => computeRemovals([...sf.statements], src, () => true),
    TcIdError,
    'no TC ID'
  );
});

// ---------------------------------------------------------------------------
// Requested TC ID absent from file — warns, does not throw
// ---------------------------------------------------------------------------

test('extractTcIdsFromTitles returns only IDs present in titles', () => {
  const src = [
    "test('TC-A-001: present', async () => {});",
    "// TC-A-002 appears in a comment only",
  ].join('\n');
  const ids = extractTcIdsFromTitles(src);
  assert(ids.has('TC-A-001'), 'title ID found');
  assert(!ids.has('TC-A-002'), 'comment-only ID not counted');
});

// ---------------------------------------------------------------------------
// AST correctness: body with } inside string/template literal
// ---------------------------------------------------------------------------

test('test body with } inside a string literal survives intact (regression: AST vs brace-counting)', () => {
  const src = [
    "test('TC-A-001: brace test', async () => {",
    "  const s = 'value: {braces: \"inside\"}';",
    "  expect(s).toBeTruthy();",
    "});",
    "test('TC-A-002: to remove', async () => {",
    "  expect(true).toBeTruthy();",
    "});",
  ].join('\n');
  const out = keepTrim(src, ['TC-A-001']);
  assert(out.includes('TC-A-001'), 'TC-A-001 survived');
  assert(out.includes('{braces: "inside"}'), 'string with braces intact');
  assert(!out.includes('TC-A-002'), 'TC-A-002 removed');
});

test('test body with } inside a template literal survives intact', () => {
  const src = [
    'test(\'TC-A-001: template\', async () => {',
    '  const s = `value: ${JSON.stringify({x:1})}`;',
    '  expect(s).toBeTruthy();',
    '});',
    "test('TC-A-002: drop me', async () => {});",
  ].join('\n');
  const out = keepTrim(src, ['TC-A-001']);
  assert(out.includes('TC-A-001'));
  assert(!out.includes('TC-A-002'));
});

// ---------------------------------------------------------------------------
// Leading comments are removed with the test
// ---------------------------------------------------------------------------

test('leading comment describing a dropped test is removed', () => {
  const src = [
    "test('TC-A-001: kept', async () => {});",
    '// This comment belongs to TC-A-002 and should be removed.',
    "test('TC-A-002: dropped', async () => {});",
  ].join('\n');
  const out = keepTrim(src, ['TC-A-001']);
  assert(!out.includes('TC-A-002'), 'dropped test gone');
  assert(!out.includes('belongs to TC-A-002'), 'leading comment removed');
});

// ---------------------------------------------------------------------------
// Output re-parses clean
// ---------------------------------------------------------------------------

test('output re-parses as valid TypeScript with zero syntax diagnostics', () => {
  const src = [
    "import { test, expect } from './fixture';",
    "test.describe('Suite', () => {",
    "  test('TC-A-001: alpha', async ({ page }) => {",
    "    expect(await page.title()).toBeTruthy();",
    "  });",
    "  test('TC-A-002: beta', async ({ page }) => {",
    "    expect(await page.url()).toContain('/home');",
    "  });",
    "});",
  ].join('\n');
  const out = keepTrim(src, ['TC-A-001']);
  const { errors } = runSafetyChecks(out, new Set(['TC-A-001']), new Set(['TC-A-002']));
  const syntaxErrors = errors.filter(e => e.startsWith('SAFETY-1'));
  assertEq(syntaxErrors.length, 0, 'no syntax errors after trim: ' + syntaxErrors.join('; '));
});

// ---------------------------------------------------------------------------
// Safety checks
// ---------------------------------------------------------------------------

test('SAFETY-3: dropped TC ID in a retained comment triggers an error', () => {
  const src = [
    "test('TC-A-001: kept — see also TC-A-002', async () => {});",
    "test('TC-A-002: dropped', async () => {});",
  ].join('\n');
  // TC-A-002 is in TC-A-001's title, so if we remove TC-A-002 the test TC-A-001 retains the reference
  const out = keepTrim(src, ['TC-A-001']);
  const { errors } = runSafetyChecks(out, new Set(['TC-A-001']), new Set(['TC-A-002']));
  const s3 = errors.filter(e => e.startsWith('SAFETY-3'));
  assertEq(s3.length, 1, 'SAFETY-3 fires when dropped ID lingers in output');
});

test('SAFETY-5: unused import after trim is pruned from output (not warned and shipped)', () => {
  const src = [
    "import { helperFn } from './util';",
    "test('TC-A-001: calls the util', async () => { helperFn(); });",
    "test('TC-A-002: plain test', async () => {});",
  ].join('\n');
  const trimmed = keepTrim(src, ['TC-A-002']);
  // pruneUnusedImports removes the unused import so the output compiles
  const pruned = pruneUnusedImports(trimmed);
  assert(!pruned.includes('helperFn'), 'unused import pruned');
  // runSafetyChecks on pruned output has no SAFETY-5 issues
  const { errors } = runSafetyChecks(pruned, new Set(['TC-A-002']), new Set(['TC-A-001']));
  assertEq(errors.filter(e => e.startsWith('SAFETY-5')).length, 0, 'SAFETY-5 clear after pruning');
});

test('SAFETY-5 is now a hard error (not a warning) when unused imports remain unpruned', () => {
  // Simulates a case where runSafetyChecks receives un-pruned output
  const src = [
    "import { helperFn } from './util';",
    "test('TC-A-002: plain test', async () => {});",
  ].join('\n');
  const { errors, warnings } = runSafetyChecks(src, new Set(['TC-A-002']), new Set());
  assertEq(errors.filter(e => e.startsWith('SAFETY-5')).length, 1, 'SAFETY-5 is a hard error');
  assertEq(warnings.filter(w => w.startsWith('SAFETY-5')).length, 0, 'SAFETY-5 not also a warning');
});

// ---------------------------------------------------------------------------
// D3: full test.* / test.describe.* callee family
// ---------------------------------------------------------------------------

test('identifyCall: recognises test.fail(', () => {
  const [s] = stmts("test.fail('TC-005: t', async () => {});");
  assertEq(identifyCall(s)?.kind, 'test');
});

test('identifyCall: recognises test.describe.only(', () => {
  const [s] = stmts("test.describe.only('Suite', () => {});");
  assertEq(identifyCall(s)?.kind, 'describe');
});

test('identifyCall: recognises test.describe.fixme(', () => {
  const [s] = stmts("test.describe.fixme('Suite', () => {});");
  assertEq(identifyCall(s)?.kind, 'describe');
});

test('D3: test.fail with out-of-range TC ID is correctly dropped', () => {
  const src = [
    "test('TC-A-001: kept', async () => {});",
    "test.fail('TC-A-002: failing test', async () => {});",
  ].join('\n');
  const out = keepTrim(src, ['TC-A-001']);
  assert(out.includes('TC-A-001'), 'kept test present');
  assert(!out.includes('TC-A-002'), 'test.fail out-of-range dropped');
});

test('D3: test.describe.only containing out-of-range tests: empty describe removed', () => {
  const src = [
    "test.describe.only('Suite', () => {",
    "  test('TC-A-002: only here', async () => {});",
    "});",
    "test('TC-A-001: top-level', async () => {});",
  ].join('\n');
  const out = keepTrim(src, ['TC-A-001']);
  assert(out.includes('TC-A-001'));
  assert(!out.includes('TC-A-002'), 'out-of-range test inside test.describe.only dropped');
});

test('D3: unknown test.* callee with TC ID fails closed', () => {
  const src = "test.whenever('TC-A-001: future callee', async () => {});";
  const sf = ts.createSourceFile('f.ts', src, ts.ScriptTarget.Latest, true);
  assertThrows(
    () => computeRemovals([...sf.statements], src, () => false),
    TcIdError,
    'unknown test-family callee'
  );
});

test('D3: unknown test.* callee WITHOUT a TC ID is silently kept (hook-like)', () => {
  const src = [
    "test.useOptions({ timeout: 5000 });",
    "test('TC-A-001: normal', async () => {});",
  ].join('\n');
  // Should not throw — no TC ID in the unknown callee's first arg
  const out = keepTrim(src, ['TC-A-001']);
  assert(out.includes('TC-A-001'));
});

// ---------------------------------------------------------------------------
// D4: import pruning — side-effect and type-only imports are never removed
// ---------------------------------------------------------------------------

test('D4: side-effect-only import is never pruned', () => {
  const src = [
    "import './setup';",
    "test('TC-A-001: uses side-effect', async () => {});",
    "test('TC-A-002: other', async () => {});",
  ].join('\n');
  const pruned = pruneUnusedImports(keepTrim(src, ['TC-A-001']));
  assert(pruned.includes("import './setup'"), 'side-effect import retained');
});

test('D4: type-only import is never pruned', () => {
  const src = [
    "import type { MyType } from './types';",
    "const x: MyType = {} as MyType;",
    "test('TC-A-001: typed', async () => {});",
    "test('TC-A-002: other', async () => {});",
  ].join('\n');
  const pruned = pruneUnusedImports(keepTrim(src, ['TC-A-002']));
  assert(pruned.includes('import type'), 'type-only import retained');
});

test('D4: partially-used named import prunes only the unused specifiers', () => {
  const src = [
    "import { usedFn, unusedFn } from './util';",
    "test('TC-A-001: uses fn', async () => { usedFn(); });",
    "test('TC-A-002: does not use fn', async () => {});",
  ].join('\n');
  const pruned = pruneUnusedImports(keepTrim(src, ['TC-A-001']));
  assert(pruned.includes('usedFn'), 'used import kept');
  assert(!pruned.includes('unusedFn'), 'unused import pruned');
});

test('D4: inline type-only specifier is never pruned', () => {
  const src = [
    "import { type TypeFoo, usedBar } from './types';",
    "const x: TypeFoo = {} as TypeFoo;",
    "test('TC-A-001: uses bar', async () => { usedBar(); });",
    "test('TC-A-002: other', async () => {});",
  ].join('\n');
  // TC-A-002 kept: usedBar is now unused, TypeFoo is type-only — both should be pruned/kept correctly
  const pruned = pruneUnusedImports(keepTrim(src, ['TC-A-002']));
  assert(pruned.includes('TypeFoo'), 'inline type-only specifier retained');
});

// ---------------------------------------------------------------------------
// spliceOut
// ---------------------------------------------------------------------------

test('spliceOut: removes multiple non-overlapping spans', () => {
  const text = 'ABCDEFGHIJ';
  const result = spliceOut(text, [{ pos: 1, end: 3 }, { pos: 6, end: 8 }]);
  assertEq(result, 'ADEFIJ');
});

test('spliceOut: handles spans in reverse input order (sorts before use)', () => {
  const text = 'ABCDEFGHIJ';
  const result = spliceOut(text, [{ pos: 6, end: 8 }, { pos: 1, end: 3 }]);
  assertEq(result, 'ADEFIJ');
});

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------
let passed = 0, failed = 0;
for (const c of cases) {
  try {
    c.fn();
    console.log(`  ok  ${c.name}`);
    passed++;
  } catch (e) {
    console.error(`  FAIL ${c.name}: ${e.message}`);
    failed++;
  }
}
console.log(`\n[spec-trim.test] ${passed} passed, ${failed} failed, ${cases.length} total`);
process.exit(failed === 0 ? 0 : 1);
