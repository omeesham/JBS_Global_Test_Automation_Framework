#!/usr/bin/env node
/**
 * test-fieldinventory-skip-fixtures.mjs — nine fixtures for the owner-attested
 * single-use skip token added to check-tc-has-fieldinventory.mjs.
 *
 * Drives the gate script end-to-end via subprocess (--test-root + --test-fixture)
 * so file-system side effects (log append, token consumption) are real and verifiable.
 * Exit 0 iff all nine fixtures pass. Exit 1 on any failure.
 *
 * Run: node scripts/test-fieldinventory-skip-fixtures.mjs
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GATE_SCRIPT = path.join(__dirname, 'check-tc-has-fieldinventory.mjs');
const TODAY = '2026-07-31';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'fi-skip-test-'));
}

/** Write .claude/state/fieldinventory-skip.json into tmpDir */
function writeSkipToken(tmpDir, token) {
  const dir = path.join(tmpDir, '.claude', 'state');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'fieldinventory-skip.json'), JSON.stringify(token, null, 2));
}

/** Write raw bytes as the skip token (for malformed-JSON test) */
function writeSkipTokenRaw(tmpDir, raw) {
  const dir = path.join(tmpDir, '.claude', 'state');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'fieldinventory-skip.json'), raw);
}

/** Build a valid base token; callers spread-override fields as needed */
function baseToken(overrides = {}) {
  return {
    attested_by: 'rutvik',
    authorising_quote: 'i would like the gate to be changed into if i say skip the walk personally (not claude) then that gate is skippable',
    session_id: 'd79157a6-8e2f-4b4d-8dac-48af24387ba5',
    issued: TODAY,
    modules: ['corporate-override-core', 'corporate-override-grid-sort'],
    reason: 'Deliverables push blocked; owner-authorised skip for this commit',
    ...overrides,
  };
}

/** A minimal TC markdown with content blocks (Steps + Expected) so the gate fires */
function tcContent(label) {
  return [
    `# ${label} Test Cases`,
    '',
    '---',
    '',
    `## TC-${label.toUpperCase().substring(0, 6)}-001: Basic`,
    '',
    '**Steps**:',
    `1. Navigate to ${label}`,
    '2. Verify form loads',
    '',
    `**Expected**: Form for ${label} loads correctly.`,
    '',
    '---',
    '',
  ].join('\n');
}

/** Build the fixture JSON that --test-fixture consumes */
function makeFixtureJson(tmpDir, tcPaths) {
  const fixturePath = path.join(tmpDir, 'fixture.json');
  const fixtureData = {
    today: TODAY,
    files: tcPaths.map(p => ({ path: p, oldContent: '', newContent: tcContent(p) })),
  };
  fs.writeFileSync(fixturePath, JSON.stringify(fixtureData));
  return fixturePath;
}

const CORE_TC = 'clients/encore/specs_planning/test-cases/setup/co/corporate_override_core_test_cases.md';
const NM2270_TC = 'clients/encore/specs_planning/test-cases/setup/co/corporate_override_grid_sort_test_cases.md';
const BOTH_TCS = [CORE_TC, NM2270_TC];

/** Run the gate script, return { status, stdout, stderr } */
function runGate(tmpDir, fixturePath) {
  const result = spawnSync(
    process.execPath,
    [GATE_SCRIPT, '--test-root', tmpDir, '--test-fixture', fixturePath],
    { encoding: 'utf8' },
  );
  return {
    status: result.status ?? -1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    output: (result.stdout ?? '') + (result.stderr ?? ''),
  };
}

// ── test runner ───────────────────────────────────────────────────────────────

const cases = [];
function test(name, fn) { cases.push({ name, fn }); }

// ── Fixture 1: no token → blocks (default path stays intact) ─────────────────
test('Fixture 1: no token → blocks', () => {
  const tmp = makeTmpDir();
  const fp = makeFixtureJson(tmp, BOTH_TCS);
  const r = runGate(tmp, fp);
  if (r.status !== 1) throw new Error(`expected exit 1, got ${r.status}\n${r.output}`);
  if (!r.output.includes('BLOCKED')) throw new Error(`expected BLOCKED in output\n${r.output}`);
  // Skip token file must not exist — it was never written.
  const tokenPath = path.join(tmp, '.claude', 'state', 'fieldinventory-skip.json');
  if (fs.existsSync(tokenPath)) throw new Error('token file unexpectedly present');
});

// ── Fixture 2: valid token naming both blocked modules → passes + banner + log + consumed ──
test('Fixture 2: valid token (both modules) → passes, banner, audit log, token consumed', () => {
  const tmp = makeTmpDir();
  writeSkipToken(tmp, baseToken());
  const fp = makeFixtureJson(tmp, BOTH_TCS);
  const r = runGate(tmp, fp);
  if (r.status !== 0) throw new Error(`expected exit 0, got ${r.status}\n${r.output}`);
  if (!r.stderr.includes('FIELD-INVENTORY GATE SKIPPED')) throw new Error(`banner missing\n${r.stderr}`);
  if (!r.stderr.includes('corporate-override-core')) throw new Error(`core module not in banner\n${r.stderr}`);
  if (!r.stderr.includes('corporate-override-grid-sort')) throw new Error(`nm2270 module not in banner\n${r.stderr}`);

  // Audit log must exist and contain a row
  const logPath = path.join(tmp, 'reports', 'diagnostics', 'fieldinventory-skips.log');
  if (!fs.existsSync(logPath)) throw new Error('audit log not created');
  const logContent = fs.readFileSync(logPath, 'utf8').trim();
  if (!logContent) throw new Error('audit log is empty');
  const row = JSON.parse(logContent.split('\n')[0]);
  if (!row.modules.includes('corporate-override-core')) throw new Error('audit row missing core module');
  if (!row.authorising_quote) throw new Error('audit row missing authorising_quote');
  if (!row.staged_files) throw new Error('audit row missing staged_files');

  // Original token must be gone; consumed copy must exist
  const tokenPath = path.join(tmp, '.claude', 'state', 'fieldinventory-skip.json');
  if (fs.existsSync(tokenPath)) throw new Error('token was not consumed (original still present)');
  const stateDir = path.join(tmp, '.claude', 'state');
  const consumed = fs.readdirSync(stateDir).filter(f => f.startsWith('fieldinventory-skip.consumed.'));
  if (consumed.length !== 1) throw new Error(`expected 1 consumed file, found ${consumed.length}`);
});

// ── Fixture 3: token names only ONE module → still blocks on the other ────────
test('Fixture 3: token names only corporate-override-core → still blocks on nm2270', () => {
  const tmp = makeTmpDir();
  writeSkipToken(tmp, baseToken({ modules: ['corporate-override-core'] }));
  const fp = makeFixtureJson(tmp, BOTH_TCS);
  const r = runGate(tmp, fp);
  if (r.status !== 1) throw new Error(`expected exit 1 (scope holds), got ${r.status}\n${r.output}`);
  if (!r.output.includes('corporate-override-grid-sort')) throw new Error(`nm2270 not mentioned in block output\n${r.output}`);
});

// ── Fixture 4: modules ["*"] → blocks ─────────────────────────────────────────
test('Fixture 4: modules ["*"] → blocks (no blanket skip)', () => {
  const tmp = makeTmpDir();
  writeSkipToken(tmp, baseToken({ modules: ['*'] }));
  const fp = makeFixtureJson(tmp, BOTH_TCS);
  const r = runGate(tmp, fp);
  if (r.status !== 1) throw new Error(`expected exit 1, got ${r.status}\n${r.output}`);
  if (!r.output.toLowerCase().includes('wildcard')) throw new Error(`expected wildcard mention\n${r.output}`);
});

// ── Fixture 5: modules [] → blocks ────────────────────────────────────────────
test('Fixture 5: modules [] → blocks', () => {
  const tmp = makeTmpDir();
  writeSkipToken(tmp, baseToken({ modules: [] }));
  const fp = makeFixtureJson(tmp, BOTH_TCS);
  const r = runGate(tmp, fp);
  if (r.status !== 1) throw new Error(`expected exit 1, got ${r.status}\n${r.output}`);
  if (!r.output.toLowerCase().includes('modules')) throw new Error(`expected modules mention\n${r.output}`);
});

// ── Fixture 6: token dated 3 days ago → blocks stating the age ───────────────
test('Fixture 6: token issued 3 days ago → blocks, states age', () => {
  const tmp = makeTmpDir();
  writeSkipToken(tmp, baseToken({ issued: '2026-07-28' })); // 3 days before TODAY
  const fp = makeFixtureJson(tmp, BOTH_TCS);
  const r = runGate(tmp, fp);
  if (r.status !== 1) throw new Error(`expected exit 1, got ${r.status}\n${r.output}`);
  if (!r.output.includes('3 day')) throw new Error(`expected age mention ("3 day")\n${r.output}`);
});

// ── Fixture 7: malformed JSON → blocks with parse error ──────────────────────
test('Fixture 7: malformed JSON → blocks with parse error', () => {
  const tmp = makeTmpDir();
  writeSkipTokenRaw(tmp, '{ "attested_by": "rutvik", BROKEN JSON }');
  const fp = makeFixtureJson(tmp, BOTH_TCS);
  const r = runGate(tmp, fp);
  if (r.status !== 1) throw new Error(`expected exit 1, got ${r.status}\n${r.output}`);
  if (!r.output.toLowerCase().includes('malformed')) throw new Error(`expected "malformed" in output\n${r.output}`);
});

// ── Fixture 8: re-run immediately after a successful skip → blocks (single-use) ─
test('Fixture 8: re-run after skip → blocks again (single-use)', () => {
  const tmp = makeTmpDir();
  writeSkipToken(tmp, baseToken());
  const fp = makeFixtureJson(tmp, BOTH_TCS);

  // First run: must succeed and consume the token
  const r1 = runGate(tmp, fp);
  if (r1.status !== 0) throw new Error(`first run expected exit 0, got ${r1.status}\n${r1.output}`);

  // Second run: token is consumed, must block
  const r2 = runGate(tmp, fp);
  if (r2.status !== 1) throw new Error(`second run expected exit 1 (single-use), got ${r2.status}\n${r2.output}`);
  if (!r2.output.includes('BLOCKED')) throw new Error(`expected BLOCKED on second run\n${r2.output}`);
});

// ── Fixture 9: reason of 5 characters → blocks ───────────────────────────────
test('Fixture 9: reason "short" (5 chars) → blocks', () => {
  const tmp = makeTmpDir();
  writeSkipToken(tmp, baseToken({ reason: 'short' }));
  const fp = makeFixtureJson(tmp, BOTH_TCS);
  const r = runGate(tmp, fp);
  if (r.status !== 1) throw new Error(`expected exit 1, got ${r.status}\n${r.output}`);
  if (!r.output.toLowerCase().includes('reason')) throw new Error(`expected "reason" in output\n${r.output}`);
});

// ── runner ────────────────────────────────────────────────────────────────────
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
console.log(`[test-fieldinventory-skip-fixtures] ${passed} passed, ${failed} failed, ${cases.length} total`);
if (failed > 0) process.exit(1);
process.exit(0);
