#!/usr/bin/env node
/**
 * check-fieldinventory-staleness.test.mjs — fixture tests for SP-AAE-05.
 *
 * Builds a temp repo with synthetic field-inventory artifacts and asserts
 * the staleness verdicts (fresh/warn/halt) at canonical age boundaries.
 * Today is injected so freshness arithmetic is deterministic.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  daysBetween,
  scanClient,
  buildReport,
  moduleVerdict,
} from './check-fieldinventory-staleness.mjs';

function makeTmpRepo() { return fs.mkdtempSync(path.join(os.tmpdir(), 'aae05-stale-')); }

function writeArtifact(repoRoot, { client = 'encore', module: moduleName, sessionDate, filenameDate, omitMcpDate = false, plainMcpDate = false, rawMcpDateLine = null }) {
  const fnDate = filenameDate || sessionDate;
  const dir = path.join(repoRoot, 'clients', client, 'specs_planning', '_internal', 'field-inventories');
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${moduleName}-${fnDate}.md`;
  const lines = [
    `**Module**: ${moduleName}`,
    `**Client**: ${client}`,
  ];
  if (rawMcpDateLine !== null) lines.push(rawMcpDateLine);
  else if (!omitMcpDate) lines.push(`${plainMcpDate ? '' : '**'}MCP_Session_Date${plainMcpDate ? '' : '**'}: ${sessionDate}`);
  lines.push(
    `**MCP_Session_Tool**: Claude in Chrome`,
    `**MCP_Tool_Reason**: test fixture`,
    `**Author_Identity**: GIVER`,
    `**Page_URL**: https://example.test/`,
    `**Test_Entity**: fixture`,
    '',
    '## URL(s) visited', '- example',
    '## Live-state caveat', 'No drift.',
    '## Field Inventory',
    '| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |',
    '|---|---|---|---|---|---|---|---|',
    '| Example | t-example | textbox | "" | none | enabled | none | row |',
    '## Labels + Section Names', '**Tab**: "Example"',
    '## Save-cycle observations', '**Save button behavior**: enabled',
    '## Known App Bugs', 'No app bugs identified in this session.',
    '## Staleness signal',
    `- **Last verified**: ${sessionDate || fnDate}`,
    `- **Fresh-until**: ${sessionDate || fnDate}`,
    `- **Stale-after**: ${sessionDate || fnDate}`,
    '- **Refresh triggers**: test',
    '',
  );
  fs.writeFileSync(path.join(dir, filename), lines.join('\n'));
  return filename;
}

const cases = [];
function test(name, fn) { cases.push({ name, fn }); }
function assertEq(actual, expected, msg) {
  if (actual !== expected) throw new Error(`${msg || 'assertEq'} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assert failed'); }

// ---------- daysBetween ----------
test('daysBetween basic ISO subtraction', () => {
  assertEq(daysBetween('2026-04-01', '2026-04-15'), 14);
  assertEq(daysBetween('2026-04-15', '2026-04-15'), 0);
  assertEq(daysBetween('2026-04-15', '2026-05-15'), 30);
});

// ---------- boundary verdicts ----------
test('fresh at 0 days', () => {
  const repo = makeTmpRepo();
  writeArtifact(repo, { module: 'mod-a', sessionDate: '2026-04-25' });
  const arts = scanClient({ repoRoot: repo, client: 'encore', today: '2026-04-25', warnDays: 14, haltDays: 30 });
  assertEq(arts.length, 1);
  assertEq(arts[0].verdict, 'fresh');
  assertEq(arts[0].ageDays, 0);
});

test('fresh at 14 days (boundary inclusive)', () => {
  const repo = makeTmpRepo();
  writeArtifact(repo, { module: 'mod-a', sessionDate: '2026-04-11' });
  const arts = scanClient({ repoRoot: repo, client: 'encore', today: '2026-04-25', warnDays: 14, haltDays: 30 });
  assertEq(arts[0].verdict, 'fresh');
  assertEq(arts[0].ageDays, 14);
});

test('warn at 15 days', () => {
  const repo = makeTmpRepo();
  writeArtifact(repo, { module: 'mod-a', sessionDate: '2026-04-10' });
  const arts = scanClient({ repoRoot: repo, client: 'encore', today: '2026-04-25', warnDays: 14, haltDays: 30 });
  assertEq(arts[0].verdict, 'warn');
  assertEq(arts[0].ageDays, 15);
});

test('warn at 30 days (boundary inclusive)', () => {
  const repo = makeTmpRepo();
  writeArtifact(repo, { module: 'mod-a', sessionDate: '2026-03-26' });
  const arts = scanClient({ repoRoot: repo, client: 'encore', today: '2026-04-25', warnDays: 14, haltDays: 30 });
  assertEq(arts[0].verdict, 'warn');
  assertEq(arts[0].ageDays, 30);
});

test('halt at 31 days', () => {
  const repo = makeTmpRepo();
  writeArtifact(repo, { module: 'mod-a', sessionDate: '2026-03-25' });
  const arts = scanClient({ repoRoot: repo, client: 'encore', today: '2026-04-25', warnDays: 14, haltDays: 30 });
  assertEq(arts[0].verdict, 'halt');
  assertEq(arts[0].ageDays, 31);
});

// ---------- malformed ----------
test('halt when MCP_Session_Date missing from frontmatter', () => {
  const repo = makeTmpRepo();
  writeArtifact(repo, { module: 'mod-a', sessionDate: '2026-04-25', omitMcpDate: true });
  const arts = scanClient({ repoRoot: repo, client: 'encore', today: '2026-04-25', warnDays: 14, haltDays: 30 });
  assertEq(arts[0].verdict, 'halt');
  assertEq(arts[0].note, 'missing-mcp-session-date');
});

test('reads plain MCP_Session_Date frontmatter', () => {
  const repo = makeTmpRepo();
  writeArtifact(repo, { module: 'mod-a', sessionDate: '2026-04-25', plainMcpDate: true });
  const arts = scanClient({ repoRoot: repo, client: 'encore', today: '2026-04-25', warnDays: 14, haltDays: 30 });
  assertEq(arts[0].verdict, 'fresh');
  assertEq(arts[0].sessionDate, '2026-04-25');
});

test('halt distinctly when MCP_Session_Date is present but unreadable', () => {
  const repo = makeTmpRepo();
  writeArtifact(repo, { module: 'mod-a', sessionDate: '2026-04-25', rawMcpDateLine: '**MCP_Session_Date**: yesterday' });
  const arts = scanClient({ repoRoot: repo, client: 'encore', today: '2026-04-25', warnDays: 14, haltDays: 30 });
  assertEq(arts[0].verdict, 'halt');
  assert(arts[0].note.startsWith('unreadable-mcp-session-date:'), `expected unreadable note, got ${arts[0].note}`);
});

test('halt when filename date != MCP_Session_Date', () => {
  const repo = makeTmpRepo();
  writeArtifact(repo, { module: 'mod-a', sessionDate: '2026-04-25', filenameDate: '2026-04-20' });
  const arts = scanClient({ repoRoot: repo, client: 'encore', today: '2026-04-25', warnDays: 14, haltDays: 30 });
  assertEq(arts[0].verdict, 'halt');
  assertEq(arts[0].note, 'filename-date-mismatch');
});

test('skips _TEMPLATE.md', () => {
  const repo = makeTmpRepo();
  // Write a template file by hand (not via writeArtifact, since that uses module-name-date convention)
  const dir = path.join(repo, 'clients', 'encore', 'specs_planning', '_internal', 'field-inventories');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, '_TEMPLATE.md'), '<!-- template -->');
  writeArtifact(repo, { module: 'mod-a', sessionDate: '2026-04-25' });
  const arts = scanClient({ repoRoot: repo, client: 'encore', today: '2026-04-25', warnDays: 14, haltDays: 30 });
  assertEq(arts.length, 1);
  assertEq(arts[0].module, 'mod-a');
});

// ---------- moduleVerdict ----------
test('moduleVerdict — picks newest of multiple per module', () => {
  const repo = makeTmpRepo();
  writeArtifact(repo, { module: 'mod-a', sessionDate: '2026-04-01' }); // 24 days warn
  writeArtifact(repo, { module: 'mod-a', sessionDate: '2026-04-22' }); // 3 days fresh
  const v = moduleVerdict({ repoRoot: repo, client: 'encore', module: 'mod-a', today: '2026-04-25', warnDays: 14, haltDays: 30 });
  assertEq(v.verdict, 'fresh');
  assertEq(v.sessionDate, '2026-04-22');
  assertEq(v.candidates, 2);
});

test('moduleVerdict — no artifact = halt no-artifact', () => {
  const repo = makeTmpRepo();
  const v = moduleVerdict({ repoRoot: repo, client: 'encore', module: 'mod-missing', today: '2026-04-25', warnDays: 14, haltDays: 30 });
  assertEq(v.verdict, 'halt');
  assertEq(v.reason, 'no-artifact');
});

// ---------- aggregate report ----------
test('buildReport totals across multiple artifacts', () => {
  const repo = makeTmpRepo();
  writeArtifact(repo, { module: 'mod-a', sessionDate: '2026-04-25' }); // fresh
  writeArtifact(repo, { module: 'mod-b', sessionDate: '2026-04-05' }); // warn 20
  writeArtifact(repo, { module: 'mod-c', sessionDate: '2026-03-20' }); // halt 36
  const report = buildReport({ repoRoot: repo, today: '2026-04-25', warnDays: 14, haltDays: 30 });
  assertEq(report.totals.artifacts, 3);
  assertEq(report.totals.fresh, 1);
  assertEq(report.totals.warn, 1);
  assertEq(report.totals.halt, 1);
});

// ---------- runner ----------
let passed = 0, failed = 0;
for (const c of cases) {
  try { c.fn(); console.log(`  ok  ${c.name}`); passed++; }
  catch (e) { console.error(`  FAIL ${c.name}: ${e.message}`); failed++; }
}
console.log(`\n[check-fieldinventory-staleness.test] ${passed} passed, ${failed} failed, ${cases.length} total`);
process.exit(failed === 0 ? 0 : 1);
