#!/usr/bin/env node
/**
 * check-tc-mcp-citations.test.mjs — fixture tests for SP-AAE-05 heuristic.
 *
 * Each fixture writes a synthetic TC markdown into a temp repo and calls
 * the script's exported helpers. No clock dependency.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  extractTcBlocks,
  tcCitationStatus,
  countFileLevelAnchors,
  buildReport,
  diffAgainstBaseline,
} from './check-tc-mcp-citations.mjs';

function makeTmpRepo() { return fs.mkdtempSync(path.join(os.tmpdir(), 'aae05-cite-')); }

function writeTcFile(repoRoot, relPath, body) {
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

// ---------- block extraction ----------
test('extractTcBlocks splits by ## TC- heading', () => {
  const md = [
    '## Header (non-TC)', 'body of header', '',
    '## TC-FOO-001: First', 'body 1', '---', '',
    '## TC-FOO-002: Second', 'body 2',
    '## Different (non-TC)', 'unrelated',
    '## TC-BAR-001: Third', 'body 3',
  ].join('\n');
  const blocks = extractTcBlocks(md);
  assertEq(blocks.length, 3, 'expected 3 TC blocks');
  assertEq(blocks[0].id, 'TC-FOO-001');
  assertEq(blocks[1].id, 'TC-FOO-002');
  assertEq(blocks[2].id, 'TC-BAR-001');
  assert(blocks[0].body.includes('body 1'));
  assert(!blocks[1].body.includes('body 3'));
});

test('extractTcBlocks tolerates EOF without trailing newline', () => {
  const md = '## TC-X-001: t\nbody';
  const blocks = extractTcBlocks(md);
  assertEq(blocks.length, 1);
  assertEq(blocks[0].id, 'TC-X-001');
});

// ---------- citation detection ----------
test('tcCitationStatus detects bold MCP_VERIFICATION_LOG', () => {
  const body = ['**Steps**: 1. ...', '**MCP_VERIFICATION_LOG**: live walked 2026-04-22'].join('\n');
  const r = tcCitationStatus(body);
  assertEq(r.cited, true);
});

test('tcCitationStatus detects [MCP-VERIFIED ...] inline tag', () => {
  const body = '**Notes**: [MCP-VERIFIED 2026-04-13, SUBPLAN_HISTORY_01_MCP_FINDINGS.md §2] some context';
  const r = tcCitationStatus(body);
  assertEq(r.cited, true);
});

test('tcCitationStatus detects plain MCP_VERIFICATION_LOG: marker', () => {
  const body = 'Some plain text MCP_VERIFICATION_LOG: see field-inventory artifact';
  const r = tcCitationStatus(body);
  assertEq(r.cited, true);
});

test('tcCitationStatus returns false on uncited TC body', () => {
  const body = '**Steps**: 1. Click Save\n**Expected**: Save succeeds';
  const r = tcCitationStatus(body);
  assertEq(r.cited, false);
});

// ---------- file-level anchor ----------
test('countFileLevelAnchors counts ## MCP_VERIFICATION_LOG sections', () => {
  const md = [
    '## Header', '...',
    '## MCP_VERIFICATION_LOG',
    'global anchor body',
    '## TC-X-001', '...',
    '## MCP_VERIFICATION_LOG — ECT Tab',
    'second anchor',
  ].join('\n');
  assertEq(countFileLevelAnchors(md), 2);
});

// ---------- buildReport — full pipeline ----------
test('buildReport — TC files with mixed citation density', () => {
  const repo = makeTmpRepo();
  // File A: 3 TCs, 0 cited, no file-level anchor → 100% uncited
  const fileA = writeTcFile(repo, 'clients/encore/specs_planning/test-cases/setup/foo/foo_test_cases.md', [
    '# Foo TCs',
    '## TC-FOO-001: First', 'body, no citation', '',
    '## TC-FOO-002: Second', 'body, no citation', '',
    '## TC-FOO-003: Third', 'body, no citation',
  ].join('\n'));

  // File B: 2 TCs, 1 cited per-TC, 1 file-level anchor → mixed
  const fileB = writeTcFile(repo, 'clients/encore/specs_planning/test-cases/setup/bar/bar_test_cases.md', [
    '# Bar TCs',
    '## MCP_VERIFICATION_LOG',
    'catalog body',
    '## TC-BAR-001: First',
    '**MCP_VERIFICATION_LOG**: per-TC cite',
    '## TC-BAR-002: Second',
    'no per-TC citation',
  ].join('\n'));

  const report = buildReport({ repoRoot: repo, filePaths: [fileA, fileB] });
  assertEq(report.totals.files, 2);
  assertEq(report.totals.tcs, 5);
  assertEq(report.totals.perTcCited, 1);
  assertEq(report.totals.perTcUncited, 4);
  assertEq(report.totals.fileLevelAnchors, 1);
  assertEq(report.totals.filesWithoutAnyCitation, 1, 'fileA has no per-TC cite + no file-level anchor');
});

// ---------- baseline diff ----------
test('diffAgainstBaseline — equal counts = OK', () => {
  const baseline = { totals: { perTcUncited: 5, filesWithoutAnyCitation: 1 } };
  const report = { totals: { perTcUncited: 5, filesWithoutAnyCitation: 1 } };
  const v = diffAgainstBaseline(report, baseline);
  assertEq(v.ok, true);
});

test('diffAgainstBaseline — regression detected', () => {
  const baseline = { totals: { perTcUncited: 5, filesWithoutAnyCitation: 1 } };
  const report = { totals: { perTcUncited: 7, filesWithoutAnyCitation: 1 } };
  const v = diffAgainstBaseline(report, baseline);
  assertEq(v.ok, false);
  assertEq(v.deltas.perTcUncited, 2);
});

test('diffAgainstBaseline — improvement passes', () => {
  const baseline = { totals: { perTcUncited: 10 } };
  const report = { totals: { perTcUncited: 4, filesWithoutAnyCitation: 0 } };
  const v = diffAgainstBaseline(report, baseline);
  assertEq(v.ok, true);
  assertEq(v.deltas.perTcUncited, -6);
});

// ---------- runner ----------
let passed = 0, failed = 0;
for (const c of cases) {
  try { c.fn(); console.log(`  ok  ${c.name}`); passed++; }
  catch (e) { console.error(`  FAIL ${c.name}: ${e.message}`); failed++; }
}
console.log(`\n[check-tc-mcp-citations.test] ${passed} passed, ${failed} failed, ${cases.length} total`);
process.exit(failed === 0 ? 0 : 1);
