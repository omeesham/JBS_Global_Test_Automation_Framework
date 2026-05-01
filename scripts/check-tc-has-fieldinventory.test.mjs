#!/usr/bin/env node
/**
 * check-tc-has-fieldinventory.test.mjs — fixture tests for the SP-AAE-02 hook.
 *
 * Each fixture builds a temporary "repo" on disk:
 *   <tmp>/clients/encore/specs_planning/_internal/field-inventories/<module>-<date>.md
 *   <tmp>/clients/encore/specs_planning/test-cases/<section>/<dir>/<name>.md
 * and calls the script's exported `evaluate()` with synthetic before/after
 * file contents + a frozen `today`. Freshness arithmetic is deterministic
 * because `today` is injected, not read from the clock.
 *
 * Exit 0 iff all fixtures pass. Exit 1 on any failure.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluate, extractContentBlockLines, contentBlocksChanged, findLatestArtifact } from './check-tc-has-fieldinventory.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------- fixture builder ----------
function makeTmpRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aae02-test-'));
  return dir;
}

function writeArtifact(repoRoot, { client = 'encore', module: moduleName, date, sessionDate }) {
  const dir = path.join(repoRoot, 'clients', client, 'specs_planning', '_internal', 'field-inventories');
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${moduleName}-${date}.md`;
  const body = [
    `**Module**: ${moduleName}`,
    `**Client**: ${client}`,
    `**MCP_Session_Date**: ${sessionDate || date}`,
    `**MCP_Session_Tool**: Claude in Chrome`,
    `**MCP_Tool_Reason**: test fixture`,
    `**Author_Identity**: GIVER`,
    `**Page_URL**: https://example.test/`,
    `**Test_Entity**: fixture-entity`,
    '',
    '## URL(s) visited',
    '- https://example.test/',
    '## Live-state caveat',
    'No drift observed — live matches REQUIREMENTS.md.',
    '## Field Inventory',
    '| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |',
    '|---|---|---|---|---|---|---|---|',
    '| Example | t-example | textbox | "" | none | enabled | none | fixture row |',
    '## Labels + Section Names',
    '**Tab**: "Example"',
    '## Save-cycle observations',
    'Save button behavior: n/a',
    '## Known App Bugs',
    'No app bugs identified in this session.',
    '## Staleness signal',
    `- **Last verified**: ${sessionDate || date}`,
    `- **Fresh-until**: ${sessionDate || date}`,
    `- **Stale-after**: ${sessionDate || date}`,
    '- **Refresh triggers**: test',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(dir, filename), body);
}

// ---------- assertion helpers ----------
const cases = [];
function test(name, fn) { cases.push({ name, fn }); }

function assertEq(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg ?? 'assertEq failed'} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function assert(cond, msg) { if (!cond) throw new Error(msg ?? 'assert failed'); }

// ---------- sample TC MD contents ----------
const TC_PATH = 'clients/encore/specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md';
const MODULE = 'local-office-settings';

const tcBase = [
  '# Local Office Settings Test Cases',
  '',
  '## MCP_VERIFICATION_LOG',
  '',
  '| Field | Value |',
  '|-------|-------|',
  '| Date  | 2026-04-01 |',
  '',
  '---',
  '',
  '## TC-LOS-BAS-001: Page load',
  '',
  '| Priority | Status | Type | Automatable |',
  '|----------|--------|------|-------------|',
  '| High | Manual | Functional | Yes |',
  '',
  '**Steps**:',
  '1. Navigate to the local-office page',
  '2. Verify the header reads "Local Office Settings"',
  '',
  '**Expected**: Page loads with three tabs.',
  '**Automatable**: Yes',
  '',
  '---',
  '',
].join('\n');

const tcChangedStep = tcBase.replace(
  '2. Verify the header reads "Local Office Settings"',
  '2. Verify the header reads "Local Office Settings Page"',
);

const tcChangedExpected = tcBase.replace(
  '**Expected**: Page loads with three tabs.',
  '**Expected**: Page loads with three tabs and a hero banner.',
);

const tcMetaOnly = tcBase.replace(
  '| Date  | 2026-04-01 |',
  '| Date  | 2026-04-15 |',
);

const tcCommentAdded = tcBase.replace(
  '# Local Office Settings Test Cases',
  '# Local Office Settings Test Cases\n<!-- updated by fixture test -->',
);

const tcWithH2Steps = [
  '# Sample',
  '',
  '## TC-EX-001: Example',
  '',
  '## Steps',
  '1. Do X',
  '2. Do Y',
  '',
  '## Expected',
  'Y happens.',
  '',
  '---',
  '',
].join('\n');

const tcWithH2StepsChanged = tcWithH2Steps.replace('1. Do X', '1. Do X differently');

// ---------- unit tests for the parser ----------
test('extractContentBlockLines captures inline **Steps** marker line', () => {
  const out = extractContentBlockLines(tcBase);
  assert(out.some(l => /\*\*Steps\*\*/.test(l)), 'Steps marker not captured');
  assert(out.some(l => /Verify the header reads/.test(l)), 'Steps continuation not captured');
  assert(out.some(l => /\*\*Expected\*\*/.test(l)), 'Expected marker not captured');
});

test('extractContentBlockLines does NOT capture **Automatable** metadata', () => {
  const out = extractContentBlockLines(tcBase);
  // The Expected line CONTAINS "Page loads with three tabs" — that's fine.
  // But the standalone **Automatable**: Yes line must not appear.
  assert(!out.some(l => /^\*\*Automatable\*\*/.test(l.trim())), 'Automatable marker leaked into content');
});

test('extractContentBlockLines handles h2 "## Steps" style', () => {
  const out = extractContentBlockLines(tcWithH2Steps);
  assert(out.some(l => /## Steps/.test(l)), 'h2 Steps heading not captured');
  assert(out.some(l => /Do X/.test(l)), 'h2 Steps continuation not captured');
  assert(out.some(l => /Y happens/.test(l)), 'h2 Expected continuation not captured');
});

test('contentBlocksChanged: metadata-only edit is NOT flagged', () => {
  assertEq(contentBlocksChanged(tcBase, tcMetaOnly), false, 'metadata-only edit wrongly flagged');
});

test('contentBlocksChanged: comment at top of file is NOT flagged', () => {
  assertEq(contentBlocksChanged(tcBase, tcCommentAdded), false, 'comment-only edit wrongly flagged');
});

test('contentBlocksChanged: Step text edit IS flagged', () => {
  assertEq(contentBlocksChanged(tcBase, tcChangedStep), true, 'step-text edit missed');
});

test('contentBlocksChanged: Expected text edit IS flagged', () => {
  assertEq(contentBlocksChanged(tcBase, tcChangedExpected), true, 'expected-text edit missed');
});

test('contentBlocksChanged: h2 Steps edit IS flagged', () => {
  assertEq(contentBlocksChanged(tcWithH2Steps, tcWithH2StepsChanged), true, 'h2-style step edit missed');
});

// ---------- end-to-end evaluate() fixtures (the 4 subplan-mandated cases + 2 edge) ----------

test('Fixture 1: staged TC edit + fresh artifact (14-day window) -> PASS', () => {
  const repoRoot = makeTmpRepo();
  writeArtifact(repoRoot, { module: MODULE, date: '2026-04-23', sessionDate: '2026-04-23' });
  const result = evaluate({
    repoRoot,
    files: [{ path: TC_PATH, oldContent: tcBase, newContent: tcChangedStep }],
    today: '2026-04-23',
  });
  assertEq(result.ok, true, 'expected PASS with fresh artifact');
  assertEq(result.violations.length, 0);
});

test('Fixture 1b: staged TC edit + artifact exactly 14 days old -> PASS (boundary)', () => {
  const repoRoot = makeTmpRepo();
  writeArtifact(repoRoot, { module: MODULE, date: '2026-04-09', sessionDate: '2026-04-09' });
  const result = evaluate({
    repoRoot,
    files: [{ path: TC_PATH, oldContent: tcBase, newContent: tcChangedStep }],
    today: '2026-04-23',
  });
  assertEq(result.ok, true, '14-day-old artifact should still be fresh (inclusive)');
});

test('Fixture 2: staged TC edit + NO artifact -> FAIL', () => {
  const repoRoot = makeTmpRepo();
  const result = evaluate({
    repoRoot,
    files: [{ path: TC_PATH, oldContent: tcBase, newContent: tcChangedStep }],
    today: '2026-04-23',
  });
  assertEq(result.ok, false, 'expected FAIL with no artifact');
  assertEq(result.violations[0].reason, 'no-artifact');
  assertEq(result.violations[0].detail.module, MODULE);
});

test('Fixture 3: staged TC edit + stale artifact (>14 days) -> FAIL', () => {
  const repoRoot = makeTmpRepo();
  writeArtifact(repoRoot, { module: MODULE, date: '2026-04-01', sessionDate: '2026-04-01' }); // 22 days old
  const result = evaluate({
    repoRoot,
    files: [{ path: TC_PATH, oldContent: tcBase, newContent: tcChangedStep }],
    today: '2026-04-23',
  });
  assertEq(result.ok, false, 'expected FAIL with stale artifact');
  assertEq(result.violations[0].reason, 'stale-artifact');
  assertEq(result.violations[0].detail.ageDays, 22);
});

test('Fixture 4: staged edit touches comment line only (no artifact) -> PASS (scope guard)', () => {
  const repoRoot = makeTmpRepo();
  const result = evaluate({
    repoRoot,
    files: [{ path: TC_PATH, oldContent: tcBase, newContent: tcCommentAdded }],
    today: '2026-04-23',
  });
  assertEq(result.ok, true, 'comment-only edit should bypass hook even without artifact');
});

test('Fixture 5: staged TC edit touches metadata-only (no artifact) -> PASS', () => {
  const repoRoot = makeTmpRepo();
  const result = evaluate({
    repoRoot,
    files: [{ path: TC_PATH, oldContent: tcBase, newContent: tcMetaOnly }],
    today: '2026-04-23',
  });
  assertEq(result.ok, true, 'metadata-only edit should bypass hook even without artifact');
});

test('Fixture 6: newest artifact wins when multiple present', () => {
  const repoRoot = makeTmpRepo();
  writeArtifact(repoRoot, { module: MODULE, date: '2026-04-01', sessionDate: '2026-04-01' });
  writeArtifact(repoRoot, { module: MODULE, date: '2026-04-22', sessionDate: '2026-04-22' });
  const result = evaluate({
    repoRoot,
    files: [{ path: TC_PATH, oldContent: tcBase, newContent: tcChangedExpected }],
    today: '2026-04-23',
  });
  assertEq(result.ok, true, 'newest artifact should satisfy freshness even when older one is stale');
});

test('Fixture 7: newly-added TC MD (empty old, new has TCs) + no artifact -> FAIL', () => {
  const repoRoot = makeTmpRepo();
  const result = evaluate({
    repoRoot,
    files: [{ path: TC_PATH, oldContent: '', newContent: tcBase }],
    today: '2026-04-23',
  });
  assertEq(result.ok, false, 'newly-added TC MD with no artifact should fail');
  assertEq(result.violations[0].reason, 'no-artifact');
});

test('Fixture 8: non-TC path (plans/) is ignored entirely', () => {
  const repoRoot = makeTmpRepo();
  const result = evaluate({
    repoRoot,
    files: [{
      path: 'plans/pending/SOMEPLAN.md',
      oldContent: '',
      newContent: '**Steps**: do X then Y.',
    }],
    today: '2026-04-23',
  });
  assertEq(result.ok, true, 'plans/ path should not be checked');
});

test('Fixture 9: _TEMPLATE.md is never picked as an artifact match', () => {
  const repoRoot = makeTmpRepo();
  // Put a _TEMPLATE.md that LOOKS like MODULE-dated, to try to fool the matcher.
  const dir = path.join(repoRoot, 'clients', 'encore', 'specs_planning', '_internal', 'field-inventories');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, '_TEMPLATE.md'), `**MCP_Session_Date**: 2026-04-23\n`);
  const art = findLatestArtifact({ repoRoot, client: 'encore', module: MODULE, today: '2026-04-23', freshnessDays: 14 });
  assertEq(art, null, '_TEMPLATE.md must not be returned as a matched artifact');
});

// ---------- runner ----------
let passed = 0;
let failed = 0;
const failures = [];
for (const c of cases) {
  try {
    c.fn();
    passed++;
    console.log(`  ok  ${c.name}`);
  } catch (e) {
    failed++;
    failures.push({ name: c.name, err: e });
    console.error(`  FAIL ${c.name}`);
    console.error(`       ${e.message}`);
  }
}

console.log('');
console.log(`[check-tc-has-fieldinventory.test] ${passed} passed, ${failed} failed, ${cases.length} total`);
if (failed > 0) {
  process.exit(1);
}
process.exit(0);
