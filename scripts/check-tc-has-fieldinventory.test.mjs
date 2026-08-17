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
import { execSync } from 'node:child_process';
import { evaluate, extractContentBlockLines, contentBlocksChanged, findLatestArtifact, parseStagedNameStatus, parseStagedNameStatusZ, gitStagedTcFilesWithStatus } from './check-tc-has-fieldinventory.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------- fixture builder ----------
function makeTmpRepo() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'aae02-test-'));
}

/** Run fn(dir) with a fresh temp dir; always removes the dir on exit. */
function withTmpRepo(fn) {
  const dir = makeTmpRepo();
  try { return fn(dir); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
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

test('Fixture 1: staged TC edit + fresh artifact (14-day window) -> PASS', () => withTmpRepo(repoRoot => {
  writeArtifact(repoRoot, { module: MODULE, date: '2026-04-23', sessionDate: '2026-04-23' });
  const result = evaluate({
    repoRoot,
    files: [{ path: TC_PATH, oldContent: tcBase, newContent: tcChangedStep }],
    today: '2026-04-23',
  });
  assertEq(result.ok, true, 'expected PASS with fresh artifact');
  assertEq(result.violations.length, 0);
}));

test('Fixture 1b: staged TC edit + artifact exactly 14 days old -> PASS (boundary)', () => withTmpRepo(repoRoot => {
  writeArtifact(repoRoot, { module: MODULE, date: '2026-04-09', sessionDate: '2026-04-09' });
  const result = evaluate({
    repoRoot,
    files: [{ path: TC_PATH, oldContent: tcBase, newContent: tcChangedStep }],
    today: '2026-04-23',
  });
  assertEq(result.ok, true, '14-day-old artifact should still be fresh (inclusive)');
}));

test('Fixture 2: staged TC edit + NO artifact -> FAIL', () => withTmpRepo(repoRoot => {
  const result = evaluate({
    repoRoot,
    files: [{ path: TC_PATH, oldContent: tcBase, newContent: tcChangedStep }],
    today: '2026-04-23',
  });
  assertEq(result.ok, false, 'expected FAIL with no artifact');
  assertEq(result.violations[0].reason, 'no-artifact');
  assertEq(result.violations[0].detail.module, MODULE);
}));

test('Fixture 3: staged TC edit + stale artifact (>14 days) -> FAIL', () => withTmpRepo(repoRoot => {
  writeArtifact(repoRoot, { module: MODULE, date: '2026-04-01', sessionDate: '2026-04-01' }); // 22 days old
  const result = evaluate({
    repoRoot,
    files: [{ path: TC_PATH, oldContent: tcBase, newContent: tcChangedStep }],
    today: '2026-04-23',
  });
  assertEq(result.ok, false, 'expected FAIL with stale artifact');
  assertEq(result.violations[0].reason, 'stale-artifact');
  assertEq(result.violations[0].detail.ageDays, 22);
}));

test('Fixture 4: staged edit touches comment line only (no artifact) -> PASS (scope guard)', () => withTmpRepo(repoRoot => {
  const result = evaluate({
    repoRoot,
    files: [{ path: TC_PATH, oldContent: tcBase, newContent: tcCommentAdded }],
    today: '2026-04-23',
  });
  assertEq(result.ok, true, 'comment-only edit should bypass hook even without artifact');
}));

test('Fixture 5: staged TC edit touches metadata-only (no artifact) -> PASS', () => withTmpRepo(repoRoot => {
  const result = evaluate({
    repoRoot,
    files: [{ path: TC_PATH, oldContent: tcBase, newContent: tcMetaOnly }],
    today: '2026-04-23',
  });
  assertEq(result.ok, true, 'metadata-only edit should bypass hook even without artifact');
}));

test('Fixture 6: newest artifact wins when multiple present', () => withTmpRepo(repoRoot => {
  writeArtifact(repoRoot, { module: MODULE, date: '2026-04-01', sessionDate: '2026-04-01' });
  writeArtifact(repoRoot, { module: MODULE, date: '2026-04-22', sessionDate: '2026-04-22' });
  const result = evaluate({
    repoRoot,
    files: [{ path: TC_PATH, oldContent: tcBase, newContent: tcChangedExpected }],
    today: '2026-04-23',
  });
  assertEq(result.ok, true, 'newest artifact should satisfy freshness even when older one is stale');
}));

test('Fixture 7: newly-added TC MD (empty old, new has TCs) + no artifact -> FAIL', () => withTmpRepo(repoRoot => {
  const result = evaluate({
    repoRoot,
    files: [{ path: TC_PATH, oldContent: '', newContent: tcBase }],
    today: '2026-04-23',
  });
  assertEq(result.ok, false, 'newly-added TC MD with no artifact should fail');
  assertEq(result.violations[0].reason, 'no-artifact');
}));

test('Fixture 8: non-TC path (plans/) is ignored entirely', () => withTmpRepo(repoRoot => {
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
}));

test('Fixture 9: _TEMPLATE.md is never picked as an artifact match', () => withTmpRepo(repoRoot => {
  // Put a _TEMPLATE.md that LOOKS like MODULE-dated, to try to fool the matcher.
  const dir = path.join(repoRoot, 'clients', 'encore', 'specs_planning', '_internal', 'field-inventories');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, '_TEMPLATE.md'), `**MCP_Session_Date**: 2026-04-23\n`);
  const art = findLatestArtifact({ repoRoot, client: 'encore', module: MODULE, today: '2026-04-23', freshnessDays: 14 });
  assertEq(art, null, '_TEMPLATE.md must not be returned as a matched artifact');
}));

// ---------- parseStagedNameStatus unit tests ----------

test('parseStagedNameStatus: A line → forceNew=false, oldPath=newPath', () => {
  const raw = 'A\tclients/encore/specs_planning/test-cases/setup/local-office/foo_test_cases.md';
  const entries = parseStagedNameStatus(raw);
  assertEq(entries.length, 1, 'expected 1 entry');
  assertEq(entries[0].forceNew, false, 'A must not forceNew');
  assertEq(entries[0].oldPath, entries[0].newPath, 'A: oldPath===newPath');
});

test('parseStagedNameStatus: M line → forceNew=false, oldPath=newPath', () => {
  const raw = 'M\tclients/encore/specs_planning/test-cases/setup/local-office/foo_test_cases.md';
  const entries = parseStagedNameStatus(raw);
  assertEq(entries.length, 1, 'expected 1 entry');
  assertEq(entries[0].forceNew, false, 'M must not forceNew');
});

test('parseStagedNameStatus: R100 inside→inside → forceNew=false, correct oldPath', () => {
  const raw = 'R100\tclients/encore/specs_planning/test-cases/setup/old_name_test_cases.md\tclients/encore/specs_planning/test-cases/setup/new_name_test_cases.md';
  const entries = parseStagedNameStatus(raw);
  assertEq(entries.length, 1, 'expected 1 entry');
  assertEq(entries[0].forceNew, false, 'inside→inside rename must not forceNew');
  assertEq(entries[0].oldPath, 'clients/encore/specs_planning/test-cases/setup/old_name_test_cases.md', 'oldPath must be old path');
  assertEq(entries[0].newPath, 'clients/encore/specs_planning/test-cases/setup/new_name_test_cases.md', 'newPath must be new path');
});

test('parseStagedNameStatus: R100 outside→inside → forceNew=true (laundering blocked)', () => {
  const raw = 'R100\tsome/external/path/foo_test_cases.md\tclients/encore/specs_planning/test-cases/setup/foo_test_cases.md';
  const entries = parseStagedNameStatus(raw);
  assertEq(entries.length, 1, 'expected 1 entry');
  assertEq(entries[0].forceNew, true, 'outside→inside rename MUST forceNew');
});

test('parseStagedNameStatus: R inside→outside → skipped (new path not TC)', () => {
  const raw = 'R100\tclients/encore/specs_planning/test-cases/setup/foo_test_cases.md\tsome/other/path/foo.md';
  const entries = parseStagedNameStatus(raw);
  assertEq(entries.length, 0, 'inside→outside rename must be skipped (not TC destination)');
});

test('parseStagedNameStatus: C### copy → forceNew=true (deny-safe)', () => {
  const raw = 'C100\tsome/source/foo.md\tclients/encore/specs_planning/test-cases/setup/foo_test_cases.md';
  const entries = parseStagedNameStatus(raw);
  assertEq(entries.length, 1, 'expected 1 entry for copy into TC scope');
  assertEq(entries[0].forceNew, true, 'copy must forceNew');
});

test('parseStagedNameStatus: malformed R line (wrong arity) → throws (parse failure)', () => {
  const raw = 'R100\tclients/encore/specs_planning/test-cases/setup/foo_test_cases.md';
  let threw = false;
  try {
    parseStagedNameStatus(raw);
  } catch (e) {
    threw = true;
    assert(e.message.includes('R requires 3 tab-fields'), `error message must describe R arity; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatus must throw on malformed R (wrong arity)');
});

test('parseStagedNameStatus: path with spaces parses correctly', () => {
  const raw = 'R100\tclients/encore/specs_planning/test-cases/setup/old name_test_cases.md\tclients/encore/specs_planning/test-cases/setup/new name_test_cases.md';
  const entries = parseStagedNameStatus(raw);
  assertEq(entries.length, 1, 'path with spaces must parse');
  assertEq(entries[0].forceNew, false, 'inside→inside with spaces must not forceNew');
});

test('parseStagedNameStatus: non-TC paths are ignored', () => {
  const raw = 'A\tplans/pending/SOMEPLAN.md\nM\tdocs/README.md';
  const entries = parseStagedNameStatus(raw);
  assertEq(entries.length, 0, 'non-TC paths must be ignored');
});

test('parseStagedNameStatus: malformed line (no tab) → throws with raw line in message', () => {
  const raw = 'GARBAGE_NO_TAB';
  let threw = false;
  try {
    parseStagedNameStatus(raw);
  } catch (e) {
    threw = true;
    assert(e.message.includes('GARBAGE_NO_TAB'), `error message must name the offending line; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatus must throw on a malformed line, not silently drop it');
});

test('parseStagedNameStatus: malformed C line (wrong arity) → throws (parse failure)', () => {
  const raw = 'C100\tclients/encore/specs_planning/test-cases/setup/foo_test_cases.md';
  let threw = false;
  try {
    parseStagedNameStatus(raw);
  } catch (e) {
    threw = true;
    assert(e.message.includes('C requires 3 tab-fields'), `error message must describe C arity; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatus must throw on malformed C (wrong arity)');
});

// ---------- parseStagedNameStatusZ unit tests (NUL-delimited, DEFECT 2 fix) ----------

test('parseStagedNameStatusZ: A line with ASCII path → 1 entry, forceNew=false', () => {
  const raw = 'A\0clients/encore/specs_planning/test-cases/setup/local-office/foo_test_cases.md\0';
  const entries = parseStagedNameStatusZ(raw);
  assertEq(entries.length, 1, 'expected 1 entry');
  assertEq(entries[0].forceNew, false, 'A must not forceNew');
  assertEq(entries[0].oldPath, entries[0].newPath, 'A: oldPath===newPath');
});

test('parseStagedNameStatusZ: R100 with space in filename → parsed correctly', () => {
  const raw = 'R100\0clients/encore/specs_planning/test-cases/setup/old name_test_cases.md\0clients/encore/specs_planning/test-cases/setup/new name_test_cases.md\0';
  const entries = parseStagedNameStatusZ(raw);
  assertEq(entries.length, 1, 'space in filename must parse correctly');
  assertEq(entries[0].forceNew, false, 'inside→inside with space must not forceNew');
  assertEq(entries[0].oldPath, 'clients/encore/specs_planning/test-cases/setup/old name_test_cases.md', 'oldPath with space');
  assertEq(entries[0].newPath, 'clients/encore/specs_planning/test-cases/setup/new name_test_cases.md', 'newPath with space');
});

test('parseStagedNameStatusZ: R100 with unicode (café) in filename → parsed correctly', () => {
  const raw = 'R100\0clients/encore/specs_planning/test-cases/setup/café_old_test_cases.md\0clients/encore/specs_planning/test-cases/setup/café_new_test_cases.md\0';
  const entries = parseStagedNameStatusZ(raw);
  assertEq(entries.length, 1, 'unicode filename must parse correctly');
  assertEq(entries[0].forceNew, false, 'inside→inside unicode rename must not forceNew');
  assertEq(entries[0].oldPath, 'clients/encore/specs_planning/test-cases/setup/café_old_test_cases.md', 'oldPath with unicode');
  assertEq(entries[0].newPath, 'clients/encore/specs_planning/test-cases/setup/café_new_test_cases.md', 'newPath with unicode');
});

test('parseStagedNameStatusZ: R with only 1 path (wrong arity) → throws', () => {
  const raw = 'R100\0clients/encore/specs_planning/test-cases/setup/foo_test_cases.md\0';
  let threw = false;
  try {
    parseStagedNameStatusZ(raw);
  } catch (e) {
    threw = true;
    assert(e.message.includes('R record requires'), `error must describe R arity; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatusZ must throw on R with wrong arity');
});

test('parseStagedNameStatusZ: C with only 1 path (wrong arity) → throws', () => {
  const raw = 'C100\0clients/encore/specs_planning/test-cases/setup/foo_test_cases.md\0';
  let threw = false;
  try {
    parseStagedNameStatusZ(raw);
  } catch (e) {
    threw = true;
    assert(e.message.includes('C record requires'), `error must describe C arity; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatusZ must throw on C with wrong arity');
});

test('parseStagedNameStatusZ: non-TC paths are ignored', () => {
  const raw = 'A\0plans/pending/SOMEPLAN.md\0M\0docs/README.md\0';
  const entries = parseStagedNameStatusZ(raw);
  assertEq(entries.length, 0, 'non-TC paths must be ignored');
});

// DEFECT 1: truncated A/M NUL record (e.g. "M\0" with no following path) must throw.
// Catches: parseStagedNameStatusZ silently returning 0 entries on empty path field.
test('parseStagedNameStatusZ: truncated A/M record (empty path field) → throws (DEFECT 1 probe)', () => {
  // "M\0" splits to ['M', ''] — the path field is an empty string, not a valid path.
  const raw = 'M\0';
  let threw = false;
  try {
    parseStagedNameStatusZ(raw);
  } catch (e) {
    threw = true;
    assert(e.message.includes('missing or empty path'), `error must describe empty path; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatusZ must throw on truncated A/M record with empty path field');
});

// DEFECT 2: a path containing a newline (or any C0 control character) must throw.
// Without this, TC_MD_GLOB_RE (.+ without dotAll) silently returns 0 entries —
// control chars in paths mean corruption or adversarial filenames; refuse both.
// Catches: parseStagedNameStatusZ silently returning 0 entries for newline-bearing paths.
test('parseStagedNameStatusZ: path containing newline → throws (DEFECT 2 probe / control character)', () => {
  // Simulates the probe: R100\0old\0clients/.../new\nline_test_cases.md\0
  const newPath = 'clients/encore/specs_planning/test-cases/setup/new\nline_test_cases.md';
  const raw = `R100\0clients/encore/specs_planning/test-cases/setup/old_test_cases.md\0${newPath}\0`;
  let threw = false;
  try {
    parseStagedNameStatusZ(raw);
  } catch (e) {
    threw = true;
    assert(e.message.includes('control character'), `error must mention control character; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatusZ must throw on path containing a newline');
});

// Structural self-check: unrecognised status must throw (not silently classify as entry or skip).
// Catches: any future code that adds a deny-safe fallback branch instead of enforcing the invariant.
test('parseStagedNameStatusZ: unrecognised status → throws (structural self-check)', () => {
  const raw = 'X\0clients/encore/specs_planning/test-cases/setup/foo_test_cases.md\0';
  let threw = false;
  try {
    parseStagedNameStatusZ(raw);
  } catch (e) {
    threw = true;
    assert(e.message.includes('unrecognised status'), `error must name unrecognised status; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatusZ must throw on unrecognised status, not silently classify or skip');
});

// DEFECT 3 revert-sensitivity proof: git without -z octal-quotes non-ASCII paths (e.g. café →
// "caf\303\251_..."), so parseStagedNameStatus (non-Z) returns 0 entries for unicode filenames.
// This proves the integration test 'Integration: unicode filename (café)...' catches exactly
// this regression: if gitStagedTcFilesWithStatus were reverted to parseStagedNameStatus (non-Z),
// the unicode rename would be invisible and the test would fail (entries.length === 0, not 1).
test('parseStagedNameStatus: octal-quoted unicode path (git non-z output) → returns 0 entries (revert-sensitivity proof)', () => {
  // Git emits this without -z when core.quotepath is on (default):
  const octalOld = '"clients/encore/specs_planning/test-cases/setup/caf\\303\\251_old_test_cases.md"';
  const octalNew = '"clients/encore/specs_planning/test-cases/setup/caf\\303\\251_new_test_cases.md"';
  const raw = `R100\t${octalOld}\t${octalNew}`;
  const entries = parseStagedNameStatus(raw);
  // The octal-escaped, quoted path doesn't match TC_MD_GLOB_RE → 0 entries.
  // Under the -z parser the same rename produces 1 entry — proving -z is required.
  assertEq(entries.length, 0, 'non-z parser must return 0 entries for octal-quoted unicode path (revert-sensitivity: if -z were removed, the integration unicode test would catch this)');
});

test('parseStagedNameStatus: well-formed batch parses correctly after malformed-line fix', () => {
  const raw = [
    'A\tclients/encore/specs_planning/test-cases/setup/local-office/foo_test_cases.md',
    'M\tclients/encore/specs_planning/test-cases/setup/local-office/bar_test_cases.md',
  ].join('\n');
  const entries = parseStagedNameStatus(raw);
  assertEq(entries.length, 2, 'well-formed batch must still yield 2 entries');
  assertEq(entries[0].forceNew, false, 'A entry must not forceNew');
  assertEq(entries[1].forceNew, false, 'M entry must not forceNew');
});

// ---------- evaluate() rename simulation fixtures ----------

test('Rename F1: R100 inside→inside (identical content, no artifact) → PASS', () => withTmpRepo(repoRoot => {
  // When old content is correctly resolved (identical), contentBlocksChanged=false → skip
  const result = evaluate({
    repoRoot,
    files: [{ path: TC_PATH, oldContent: tcBase, newContent: tcBase }],
    today: '2026-04-23',
  });
  assertEq(result.ok, true, 'R100 rename with identical content must pass without artifact');
}));

test('Rename F2: R<100 inside→inside (content-block edit, no artifact) → FAIL', () => withTmpRepo(repoRoot => {
  const result = evaluate({
    repoRoot,
    files: [{ path: TC_PATH, oldContent: tcBase, newContent: tcChangedStep }],
    today: '2026-04-23',
  });
  assertEq(result.ok, false, 'rename with content edit must fail without artifact');
  assertEq(result.violations[0].reason, 'no-artifact');
}));

test('Rename F3: outside→inside R100 (forceNew=true, oldContent forced to \'\') → FAIL (laundering blocked)', () => withTmpRepo(repoRoot => {
  // Outside→inside: forceNew=true → oldContent='', contentBlocksChanged('', tcBase)=true → violation
  const result = evaluate({
    repoRoot,
    files: [{ path: TC_PATH, oldContent: '', newContent: tcBase }],
    today: '2026-04-23',
  });
  assertEq(result.ok, false, 'outside→inside rename must fail (laundering blocked)');
  assertEq(result.violations[0].reason, 'no-artifact');
}));

test('Rename F4: R100 inside→inside with whitespace-only delta → PASS', () => withTmpRepo(repoRoot => {
  const tcBaseWithTrailingSpaces = tcBase.replace(
    '1. Navigate to the local-office page',
    '1. Navigate to the local-office page   ',
  );
  const result = evaluate({
    repoRoot,
    files: [{ path: TC_PATH, oldContent: tcBase, newContent: tcBaseWithTrailingSpaces }],
    today: '2026-04-23',
  });
  assertEq(result.ok, true, 'whitespace-only rename delta must pass (normaliseForCompare)');
}));

// ---------- integration harness (real git repo in OS temp dir) ----------

function runGitCmd(cmd, cwd) {
  return execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function setUpTempGitRepo() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aae02-git-'));
  runGitCmd('git init', tmpDir);
  runGitCmd('git config user.email "test@test.com"', tmpDir);
  runGitCmd('git config user.name "Test"', tmpDir);
  return tmpDir;
}

function writeAndCommitTcFile(repoRoot, relPath, content) {
  const full = path.join(repoRoot, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  runGitCmd(`git add "${relPath}"`, repoRoot);
  runGitCmd('git commit -m "initial"', repoRoot);
}

test('Integration: R100 inside→inside rename → parseStagedNameStatus yields forceNew=false', () => {
  const tmpDir = setUpTempGitRepo();
  try {
    const oldRel = 'clients/encore/specs_planning/test-cases/setup/old_mod_test_cases.md';
    const newRel = 'clients/encore/specs_planning/test-cases/setup/new_mod_test_cases.md';
    writeAndCommitTcFile(tmpDir, oldRel, tcBase);
    // Stage a rename via git mv
    const oldFull = path.join(tmpDir, oldRel);
    const newFull = path.join(tmpDir, newRel);
    fs.renameSync(oldFull, newFull);
    runGitCmd(`git add "${oldRel}" "${newRel}"`, tmpDir);
    const entries = gitStagedTcFilesWithStatus(tmpDir);
    assert(entries.length === 1, `expected 1 entry, got ${entries.length}`);
    assertEq(entries[0].forceNew, false, 'R100 inside→inside must not forceNew');
    assertEq(entries[0].newPath, newRel, 'newPath must be new TC path');
    assertEq(entries[0].oldPath, oldRel, 'oldPath must be old TC path');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    assert(!fs.existsSync(tmpDir), 'temp dir must be removed');
  }
});

test('Integration: outside→inside rename → parseStagedNameStatus yields forceNew=true', () => {
  const tmpDir = setUpTempGitRepo();
  try {
    const oldRel = 'docs/some_test_cases.md';
    const newRel = 'clients/encore/specs_planning/test-cases/setup/some_test_cases.md';
    writeAndCommitTcFile(tmpDir, oldRel, tcBase);
    const oldFull = path.join(tmpDir, oldRel);
    const newFull = path.join(tmpDir, newRel);
    fs.mkdirSync(path.dirname(newFull), { recursive: true });
    fs.renameSync(oldFull, newFull);
    runGitCmd(`git add "${oldRel}" "${newRel}"`, tmpDir);
    const entries = gitStagedTcFilesWithStatus(tmpDir);
    assert(entries.length === 1, `expected 1 entry, got ${entries.length}`);
    assertEq(entries[0].forceNew, true, 'outside→inside rename MUST forceNew (laundering blocked)');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    assert(!fs.existsSync(tmpDir), 'temp dir must be removed');
  }
});

test('Integration: inside→outside rename → 0 entries (not TC destination)', () => {
  const tmpDir = setUpTempGitRepo();
  try {
    const oldRel = 'clients/encore/specs_planning/test-cases/setup/foo_test_cases.md';
    const newRel = 'docs/foo.md';
    writeAndCommitTcFile(tmpDir, oldRel, tcBase);
    const oldFull = path.join(tmpDir, oldRel);
    const newFull = path.join(tmpDir, newRel);
    fs.mkdirSync(path.dirname(newFull), { recursive: true });
    fs.renameSync(oldFull, newFull);
    runGitCmd(`git add "${oldRel}" "${newRel}"`, tmpDir);
    const entries = gitStagedTcFilesWithStatus(tmpDir);
    assertEq(entries.length, 0, 'inside→outside rename must produce 0 TC entries');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    assert(!fs.existsSync(tmpDir), 'temp dir must be removed');
  }
});

test('Integration: plain add → 1 entry, forceNew=false', () => {
  const tmpDir = setUpTempGitRepo();
  try {
    // commit a dummy file so HEAD exists
    writeAndCommitTcFile(tmpDir, 'README.md', '# test\n');
    const tcRel = 'clients/encore/specs_planning/test-cases/setup/add_test_cases.md';
    const full = path.join(tmpDir, tcRel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, tcBase);
    runGitCmd(`git add "${tcRel}"`, tmpDir);
    const entries = gitStagedTcFilesWithStatus(tmpDir);
    assertEq(entries.length, 1, 'expected 1 entry for plain add');
    assertEq(entries[0].forceNew, false, 'plain add must not forceNew');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    assert(!fs.existsSync(tmpDir), 'temp dir must be removed');
  }
});

test('Integration: filename with space in rename → gitStagedTcFilesWithStatus parses correctly', () => {
  const tmpDir = setUpTempGitRepo();
  try {
    const oldRel = 'clients/encore/specs_planning/test-cases/setup/old name_test_cases.md';
    const newRel = 'clients/encore/specs_planning/test-cases/setup/new name_test_cases.md';
    writeAndCommitTcFile(tmpDir, oldRel, tcBase);
    const oldFull = path.join(tmpDir, oldRel);
    const newFull = path.join(tmpDir, newRel);
    fs.renameSync(oldFull, newFull);
    runGitCmd(`git add "clients/encore/specs_planning/test-cases/setup/old name_test_cases.md" "clients/encore/specs_planning/test-cases/setup/new name_test_cases.md"`, tmpDir);
    const entries = gitStagedTcFilesWithStatus(tmpDir);
    assert(entries.length === 1, `expected 1 entry for space-filename rename, got ${entries.length}`);
    assertEq(entries[0].forceNew, false, 'space filename inside→inside must not forceNew');
    assertEq(entries[0].newPath, newRel, 'newPath must be new path with space');
    assertEq(entries[0].oldPath, oldRel, 'oldPath must be old path with space');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('Integration: unicode filename (café) in rename → gitStagedTcFilesWithStatus parses correctly', () => {
  const tmpDir = setUpTempGitRepo();
  try {
    const oldRel = 'clients/encore/specs_planning/test-cases/setup/café_old_test_cases.md';
    const newRel = 'clients/encore/specs_planning/test-cases/setup/café_new_test_cases.md';
    writeAndCommitTcFile(tmpDir, oldRel, tcBase);
    const oldFull = path.join(tmpDir, oldRel);
    const newFull = path.join(tmpDir, newRel);
    fs.renameSync(oldFull, newFull);
    runGitCmd(`git add "${oldRel}" "${newRel}"`, tmpDir);
    const entries = gitStagedTcFilesWithStatus(tmpDir);
    assert(entries.length === 1, `expected 1 entry for unicode-filename rename, got ${entries.length}`);
    assertEq(entries[0].forceNew, false, 'unicode filename inside→inside must not forceNew');
    assertEq(entries[0].newPath, newRel, 'newPath must match unicode path');
    assertEq(entries[0].oldPath, oldRel, 'oldPath must match unicode path');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});


// ---------- BOUNCE4: status grammar strict validation (parseStagedNameStatus) ----------
// Each test below is a revert-sensitivity probe: if validateStatusToken were removed
// from parseStagedNameStatus, these would silently return 0 entries instead of throwing.

test('parseStagedNameStatus: M100 (invalid — M with trailing chars) → throws (grammar violation)', () => {
  const raw = 'M100\tclients/encore/specs_planning/test-cases/setup/foo_test_cases.md';
  let threw = false;
  try { parseStagedNameStatus(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
    assert(e.message.includes('M100'), `error must name the offending token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatus must throw on M100 (invalid status grammar)');
});

test('parseStagedNameStatus: RXYZ (invalid — R not followed by digits) → throws (grammar violation)', () => {
  const raw = 'RXYZ\tclients/encore/specs_planning/test-cases/setup/old_test_cases.md\tclients/encore/specs_planning/test-cases/setup/new_test_cases.md';
  let threw = false;
  try { parseStagedNameStatus(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
    assert(e.message.includes('RXYZ'), `error must name the offending token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatus must throw on RXYZ (invalid status grammar)');
});

test('parseStagedNameStatus: CXYZ (invalid — C not followed by digits) → throws (grammar violation)', () => {
  const raw = 'CXYZ\tsome/source.md\tclients/encore/specs_planning/test-cases/setup/foo_test_cases.md';
  let threw = false;
  try { parseStagedNameStatus(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
    assert(e.message.includes('CXYZ'), `error must name the offending token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatus must throw on CXYZ (invalid status grammar)');
});

test('parseStagedNameStatus: lowercase m → throws (grammar violation — case-sensitive)', () => {
  const raw = 'm\tclients/encore/specs_planning/test-cases/setup/foo_test_cases.md';
  let threw = false;
  try { parseStagedNameStatus(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatus must throw on lowercase m');
});

test('parseStagedNameStatus: lowercase r100 → throws (grammar violation — case-sensitive)', () => {
  const raw = 'r100\tclients/encore/specs_planning/test-cases/setup/old_test_cases.md\tclients/encore/specs_planning/test-cases/setup/new_test_cases.md';
  let threw = false;
  try { parseStagedNameStatus(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatus must throw on lowercase r100');
});

test('parseStagedNameStatus: R with no digits → throws (grammar violation — scored status requires digits)', () => {
  const raw = 'R\tclients/encore/specs_planning/test-cases/setup/old_test_cases.md\tclients/encore/specs_planning/test-cases/setup/new_test_cases.md';
  let threw = false;
  try { parseStagedNameStatus(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatus must throw on R with no digits');
});

test('parseStagedNameStatus: R1234 (4 digits — exceeds score range 0–100) → throws (grammar violation)', () => {
  const raw = 'R1234\tclients/encore/specs_planning/test-cases/setup/old_test_cases.md\tclients/encore/specs_planning/test-cases/setup/new_test_cases.md';
  let threw = false;
  try { parseStagedNameStatus(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
    assert(e.message.includes('R1234'), `error must name the offending token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatus must throw on R1234 (4 digits)');
});

test('parseStagedNameStatus: R100X (trailing char after digits) → throws (grammar violation)', () => {
  const raw = 'R100X\tclients/encore/specs_planning/test-cases/setup/old_test_cases.md\tclients/encore/specs_planning/test-cases/setup/new_test_cases.md';
  let threw = false;
  try { parseStagedNameStatus(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
    assert(e.message.includes('R100X'), `error must name the offending token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatus must throw on R100X (trailing character after digits)');
});

test('parseStagedNameStatus: status with leading whitespace → throws (grammar violation)', () => {
  const raw = ' R100\tclients/encore/specs_planning/test-cases/setup/old_test_cases.md\tclients/encore/specs_planning/test-cases/setup/new_test_cases.md';
  let threw = false;
  try { parseStagedNameStatus(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatus must throw on status with leading whitespace');
});

// ---------- BOUNCE5: score range constrained to git's real 0–100 ----------
// Revert-sensitivity: if VALID_STATUS_SCORED_RE reverted to /^[RC]\d{1,3}$/, R999/C999/R101 would
// silently pass as valid tokens and branch into arity logic with wrong meaning.

test('parseStagedNameStatus: R999 (score > 100 — outside git range) → throws (grammar violation)', () => {
  const raw = 'R999\tclients/encore/specs_planning/test-cases/setup/old_test_cases.md\tclients/encore/specs_planning/test-cases/setup/new_test_cases.md';
  let threw = false;
  try { parseStagedNameStatus(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
    assert(e.message.includes('R999'), `error must name the offending token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatus must throw on R999 (score exceeds git maximum of 100)');
});

test('parseStagedNameStatus: C999 (score > 100 — outside git range) → throws (grammar violation)', () => {
  const raw = 'C999\tclients/encore/specs_planning/test-cases/setup/old_test_cases.md\tclients/encore/specs_planning/test-cases/setup/new_test_cases.md';
  let threw = false;
  try { parseStagedNameStatus(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
    assert(e.message.includes('C999'), `error must name the offending token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatus must throw on C999 (score exceeds git maximum of 100)');
});

test('parseStagedNameStatus: R101 (score > 100 — outside git range) → throws (grammar violation)', () => {
  const raw = 'R101\tclients/encore/specs_planning/test-cases/setup/old_test_cases.md\tclients/encore/specs_planning/test-cases/setup/new_test_cases.md';
  let threw = false;
  try { parseStagedNameStatus(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
    assert(e.message.includes('R101'), `error must name the offending token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatus must throw on R101 (score exceeds git maximum of 100)');
});

test('parseStagedNameStatus: R000 (zero-padded 0% — valid git floor) → parses without throw', () => {
  const raw = 'R000\tclients/encore/specs_planning/test-cases/setup/old_test_cases.md\tclients/encore/specs_planning/test-cases/setup/new_test_cases.md';
  // R000 is valid grammar; it will parse (result may be empty if old path not in TC scope, that is fine)
  let threw = false;
  try { parseStagedNameStatus(raw); } catch (e) { threw = true; }
  assert(!threw, 'parseStagedNameStatus must NOT throw on R000 (valid zero-padded score within 0–100)');
});

test('parseStagedNameStatus: C075 (zero-padded 75% — valid git score) → parses without throw', () => {
  const raw = 'C075\tclients/encore/specs_planning/test-cases/setup/old_test_cases.md\tclients/encore/specs_planning/test-cases/setup/new_test_cases.md';
  let threw = false;
  try { parseStagedNameStatus(raw); } catch (e) { threw = true; }
  assert(!threw, 'parseStagedNameStatus must NOT throw on C075 (valid zero-padded score within 0–100)');
});

// ---------- BOUNCE4: status grammar strict validation (parseStagedNameStatusZ) ----------
// Each test below is a revert-sensitivity probe: if validateStatusToken were removed
// from parseStagedNameStatusZ, these would silently consume fields with wrong meaning.

test('parseStagedNameStatusZ: M100 (invalid) → throws (grammar violation)', () => {
  const raw = 'M100\0clients/encore/specs_planning/test-cases/setup/foo_test_cases.md\0';
  let threw = false;
  try { parseStagedNameStatusZ(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
    assert(e.message.includes('M100'), `error must name the offending token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatusZ must throw on M100 (invalid status grammar)');
});

test('parseStagedNameStatusZ: RXYZ (invalid) → throws (grammar violation)', () => {
  const raw = 'RXYZ\0clients/encore/specs_planning/test-cases/setup/old_test_cases.md\0clients/encore/specs_planning/test-cases/setup/new_test_cases.md\0';
  let threw = false;
  try { parseStagedNameStatusZ(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
    assert(e.message.includes('RXYZ'), `error must name the offending token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatusZ must throw on RXYZ (invalid status grammar)');
});

test('parseStagedNameStatusZ: CXYZ (invalid) → throws (grammar violation)', () => {
  const raw = 'CXYZ\0some/source.md\0clients/encore/specs_planning/test-cases/setup/foo_test_cases.md\0';
  let threw = false;
  try { parseStagedNameStatusZ(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
    assert(e.message.includes('CXYZ'), `error must name the offending token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatusZ must throw on CXYZ (invalid status grammar)');
});

test('parseStagedNameStatusZ: lowercase m → throws (grammar violation — case-sensitive)', () => {
  const raw = 'm\0clients/encore/specs_planning/test-cases/setup/foo_test_cases.md\0';
  let threw = false;
  try { parseStagedNameStatusZ(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatusZ must throw on lowercase m');
});

test('parseStagedNameStatusZ: lowercase r100 → throws (grammar violation — case-sensitive)', () => {
  const raw = 'r100\0clients/encore/specs_planning/test-cases/setup/old_test_cases.md\0clients/encore/specs_planning/test-cases/setup/new_test_cases.md\0';
  let threw = false;
  try { parseStagedNameStatusZ(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatusZ must throw on lowercase r100');
});

test('parseStagedNameStatusZ: R with no digits → throws (grammar violation)', () => {
  const raw = 'R\0clients/encore/specs_planning/test-cases/setup/old_test_cases.md\0clients/encore/specs_planning/test-cases/setup/new_test_cases.md\0';
  let threw = false;
  try { parseStagedNameStatusZ(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatusZ must throw on R with no digits');
});

test('parseStagedNameStatusZ: R1234 (4 digits) → throws (grammar violation)', () => {
  const raw = 'R1234\0clients/encore/specs_planning/test-cases/setup/old_test_cases.md\0clients/encore/specs_planning/test-cases/setup/new_test_cases.md\0';
  let threw = false;
  try { parseStagedNameStatusZ(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
    assert(e.message.includes('R1234'), `error must name the offending token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatusZ must throw on R1234 (4 digits)');
});

test('parseStagedNameStatusZ: R100X (trailing char) → throws (grammar violation)', () => {
  const raw = 'R100X\0clients/encore/specs_planning/test-cases/setup/old_test_cases.md\0clients/encore/specs_planning/test-cases/setup/new_test_cases.md\0';
  let threw = false;
  try { parseStagedNameStatusZ(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
    assert(e.message.includes('R100X'), `error must name the offending token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatusZ must throw on R100X (trailing character)');
});

test('parseStagedNameStatusZ: status with leading whitespace → throws (grammar violation)', () => {
  const raw = ' R100\0clients/encore/specs_planning/test-cases/setup/old_test_cases.md\0clients/encore/specs_planning/test-cases/setup/new_test_cases.md\0';
  let threw = false;
  try { parseStagedNameStatusZ(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatusZ must throw on status with leading whitespace');
});

// ---------- BOUNCE5: score range constrained to git's real 0–100 (parseStagedNameStatusZ) ----------
// Revert-sensitivity: if VALID_STATUS_SCORED_RE reverted to /^[RC]\d{1,3}$/, R999/C999/R101 would
// silently pass as valid tokens and branch into arity logic with wrong meaning.

test('parseStagedNameStatusZ: R999 (score > 100 — outside git range) → throws (grammar violation)', () => {
  const raw = 'R999\0clients/encore/specs_planning/test-cases/setup/old_test_cases.md\0clients/encore/specs_planning/test-cases/setup/new_test_cases.md\0';
  let threw = false;
  try { parseStagedNameStatusZ(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
    assert(e.message.includes('R999'), `error must name the offending token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatusZ must throw on R999 (score exceeds git maximum of 100)');
});

test('parseStagedNameStatusZ: C999 (score > 100 — outside git range) → throws (grammar violation)', () => {
  const raw = 'C999\0clients/encore/specs_planning/test-cases/setup/old_test_cases.md\0clients/encore/specs_planning/test-cases/setup/new_test_cases.md\0';
  let threw = false;
  try { parseStagedNameStatusZ(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
    assert(e.message.includes('C999'), `error must name the offending token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatusZ must throw on C999 (score exceeds git maximum of 100)');
});

test('parseStagedNameStatusZ: R101 (score > 100 — outside git range) → throws (grammar violation)', () => {
  const raw = 'R101\0clients/encore/specs_planning/test-cases/setup/old_test_cases.md\0clients/encore/specs_planning/test-cases/setup/new_test_cases.md\0';
  let threw = false;
  try { parseStagedNameStatusZ(raw); } catch (e) {
    threw = true;
    assert(e.message.includes('invalid status token'), `error must cite invalid status token; got: ${e.message}`);
    assert(e.message.includes('R101'), `error must name the offending token; got: ${e.message}`);
  }
  assert(threw, 'parseStagedNameStatusZ must throw on R101 (score exceeds git maximum of 100)');
});

test('parseStagedNameStatusZ: R000 (zero-padded 0% — valid git floor) → parses without throw', () => {
  const raw = 'R000\0clients/encore/specs_planning/test-cases/setup/old_test_cases.md\0clients/encore/specs_planning/test-cases/setup/new_test_cases.md\0';
  let threw = false;
  try { parseStagedNameStatusZ(raw); } catch (e) { threw = true; }
  assert(!threw, 'parseStagedNameStatusZ must NOT throw on R000 (valid zero-padded score within 0–100)');
});

test('parseStagedNameStatusZ: C075 (zero-padded 75% — valid git score) → parses without throw', () => {
  const raw = 'C075\0clients/encore/specs_planning/test-cases/setup/old_test_cases.md\0clients/encore/specs_planning/test-cases/setup/new_test_cases.md\0';
  let threw = false;
  try { parseStagedNameStatusZ(raw); } catch (e) { threw = true; }
  assert(!threw, 'parseStagedNameStatusZ must NOT throw on C075 (valid zero-padded score within 0–100)');
});

// BOUNCE4 corollary: R with valid status, non-TC destination → explicit non-TC skip (NOT silent zero).
// Revert-sensitivity: removing validateStatusToken would not affect this case but the test
// documents the explicit-classification guarantee that makes the non-TC path legitimate.
test('parseStagedNameStatusZ: R100 with non-TC destination → 0 entries (explicit non-TC classification)', () => {
  const raw = 'R100\0clients/encore/specs_planning/test-cases/setup/old_test_cases.md\0docs/some_other_file.md\0';
  const entries = parseStagedNameStatusZ(raw);
  assertEq(entries.length, 0, 'non-TC destination with valid R100 status must explicitly skip to 0 entries');
});

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
