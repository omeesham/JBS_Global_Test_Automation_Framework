#!/usr/bin/env node
// test-coverage-tier-fixtures.mjs — contract-derived fixture battery for the
// CoverageMode tier machinery (PLAN_COVERAGE_TIER_CONTRACT Phase 3).
//
// Six fixtures call the REAL exported functions — no reimplementation.
// Imports:
//   coverageVerdict from scripts/walk-coverage/lib/coverage-manifest.mjs
//   verifyDenominator from scripts/walk-coverage/verify-denominator.mjs
//
// Run: node .claude/hooks/lib/test-coverage-tier-fixtures.mjs

import { coverageVerdict } from '../../../scripts/walk-coverage/lib/coverage-manifest.mjs';
import { verifyDenominator } from '../../../scripts/walk-coverage/verify-denominator.mjs';
import { writeFileSync, mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Pre-gate date: ensures artifacts are NOT grandfathered (subject to enforcement).
const ENFORCE_DATE = '2000-01-01';
// Far-future dates suppress provenance and mandatory-date side checks so fixtures
// isolate tier/deferral logic exclusively.
const GATE_OPTS = { provenanceLandingDate: '9999-01-01', manifestMandatoryDate: '9999-01-01' };

let failures = 0;
let total = 0;

function check(name, condition, detail = '') {
  total++;
  const ok = !!condition;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  ' + detail}`);
  if (!ok) failures++;
}

// Build a minimal artifact string. Walk_Mode is optional (absent = deep default).
// Completion_Record keeps the mandatory-date check from raising a Completion_Record-absent
// reason when no artifactPath is supplied (check branch: `else if (artifactPath)` is falsy,
// so only presence is checked, not file existence).
function makeArtifact({ walkMode, rows, ratio, undispositionedMarker = false }) {
  const n = rows.length + (undispositionedMarker ? 0 : 0);
  const r = ratio != null ? ratio : `${rows.length}/${rows.length}`;
  const lines = [
    'MCP_Session_Date: 2026-08-07',
    ...(walkMode ? [`Walk_Mode: ${walkMode}`] : []),
    `Coverage_Ratio: ${r}`,
    'CrossCheck: clean',
    'Completion_Record: fixtures/fake-completion.json',
    '',
    '## Coverage Manifest',
    '| Control | Disposition |',
    '|---|---|',
    ...rows,
    ...(undispositionedMarker ? ['| id:pending _undispositioned_ | |'] : []),
  ];
  return lines.join('\n');
}

const DEFERRAL_ROW = '| id:launch-btn | deferred-to-DEEP: launch-btn-launcher (defer deep walk to ultracoverage run) |';
const COVERED_ROW  = '| id:save-btn | covered-by-TC: TC-001 |';

const tmpDir = mkdtempSync(join(tmpdir(), 'cov-tier-fx-'));

try {

  // -----------------------------------------------------------------------
  // Fixture (a): quick plan + Walk_Mode: quick artifact + deferral rows → PASS
  // Contract: deferred-to-DEEP is a valid terminal disposition when Walk_Mode: quick.
  // -----------------------------------------------------------------------
  {
    const text = makeArtifact({ walkMode: 'quick', rows: [DEFERRAL_ROW, COVERED_ROW] });
    const v = coverageVerdict(text, ENFORCE_DATE, GATE_OPTS);
    check(
      '(a) quick artifact + deferral rows accepted (PASS)',
      v.applicable && v.complete,
      `applicable=${v.applicable} complete=${v.complete} reasons=${JSON.stringify(v.reasons)}`
    );
  }

  // -----------------------------------------------------------------------
  // Fixture (b): deep Walk_Mode artifact + deferral row → FAIL
  // Contract: deferred-to-DEEP invalid when Walk_Mode: deep.
  // -----------------------------------------------------------------------
  {
    const text = makeArtifact({ walkMode: 'deep', rows: [DEFERRAL_ROW] });
    const v = coverageVerdict(text, ENFORCE_DATE, GATE_OPTS);
    const hasDeferralFail = v.reasons.some(r => r.includes('deferred-to-DEEP') && r.includes('Walk_Mode'));
    check(
      '(b) deep-mode artifact with deferral rejected (FAIL)',
      !v.complete && hasDeferralFail,
      `complete=${v.complete} reasons=${JSON.stringify(v.reasons)}`
    );
  }

  // -----------------------------------------------------------------------
  // Fixture (c): absent Walk_Mode (CoverageMode absent → deep default) + deferral → FAIL
  // Contract: absent Walk_Mode field defaults to deep; deferral is therefore invalid.
  // -----------------------------------------------------------------------
  {
    const text = makeArtifact({ walkMode: null, rows: [DEFERRAL_ROW] });
    const v = coverageVerdict(text, ENFORCE_DATE, GATE_OPTS);
    const hasDeferralFail = v.reasons.some(r => r.includes('deferred-to-DEEP') && r.includes('Walk_Mode'));
    check(
      '(c) absent Walk_Mode + deferral rejected — defaults to deep (FAIL)',
      !v.complete && hasDeferralFail && v.walkMode === 'deep',
      `complete=${v.complete} walkMode=${v.walkMode} reasons=${JSON.stringify(v.reasons)}`
    );
  }

  // -----------------------------------------------------------------------
  // Fixture (d): deferral row also carrying read-only-verified → FAIL (G1)
  // Contract: a deferral carries NO classification claim (G1).
  // Tested via verifyDenominator which enforces G1.
  // -----------------------------------------------------------------------
  {
    const denomJson = join(tmpDir, 'denom-d.json');
    writeFileSync(denomJson, JSON.stringify({
      entries: [{ key: 'id:launch-btn', status: 'FOUND' }],
    }));
    const text = [
      'MCP_Session_Date: 2026-08-07',
      'Walk_Mode: quick',
      'Coverage_Ratio: 1/1',
      'CrossCheck: clean',
      'Completion_Record: fixtures/fake-completion.json',
      'Walk_State: module=dummy walked=[resting]',
      '',
      '## Coverage Manifest',
      '| Control | Disposition | Notes |',
      '|---|---|---|',
      // Same row carries both deferred-to-DEEP (disposition) and read-only-verified (classification)
      '| id:launch-btn | deferred-to-DEEP: launch-btn-launcher (defer deep walk) | read-only-verified |',
    ].join('\n');
    const r = verifyDenominator(text, denomJson);
    const g1Msg = [r.reason || '', ...(r.reasons || [])].join(';');
    const hasG1 = g1Msg.includes('G1 VIOLATION');
    check(
      '(d) deferral + read-only-verified on same row → G1 VIOLATION (FAIL)',
      !r.ok && hasG1,
      `ok=${r.ok} g1Found=${hasG1} reason=${g1Msg.slice(0, 120)}`
    );
  }

  // -----------------------------------------------------------------------
  // Fixture (e): Coverage_Ratio < 100% alone → FAIL (ratio floor is blocking)
  // Contract: Coverage_Ratio must = 100%; deferral rows do NOT waive the ratio floor.
  // -----------------------------------------------------------------------
  {
    const text = makeArtifact({
      walkMode: 'quick',
      rows: [DEFERRAL_ROW, COVERED_ROW],
      ratio: '9/10',
    });
    const v = coverageVerdict(text, ENFORCE_DATE, GATE_OPTS);
    const hasRatioFail = v.reasons.some(r => r.includes('Coverage_Ratio'));
    check(
      '(e) quick artifact with Coverage_Ratio <100% fails regardless of valid deferral rows (FAIL)',
      !v.complete && hasRatioFail,
      `complete=${v.complete} reasons=${JSON.stringify(v.reasons)}`
    );
    // Separate assertion: undispositioned rows also cause FAIL independently.
    const textWithUndispositioned = makeArtifact({
      walkMode: 'quick',
      rows: [DEFERRAL_ROW, COVERED_ROW],
      ratio: '9/10',
      undispositionedMarker: true,
    });
    const v2 = coverageVerdict(textWithUndispositioned, ENFORCE_DATE, GATE_OPTS);
    const hasUndispositioned = v2.reasons.some(r => r.includes('undispositioned'));
    check(
      '(e2) undispositioned rows also cause FAIL independently (FAIL)',
      !v2.complete && hasUndispositioned,
      `complete=${v2.complete} reasons=${JSON.stringify(v2.reasons)}`
    );
  }

  // -----------------------------------------------------------------------
  // Fixture (f): deep plan citing Walk_Mode: quick artifact → tier mismatch detected via real validator
  // Drives validate-plan-closure.mjs via subprocess (checkCx not exported).
  // -----------------------------------------------------------------------
  {
    const REPO_ROOT = resolve(__dirname, '..', '..', '..');
    // Artifact path must match WALK_ARTIFACT_RX (field-inventories|old-site-baseline) and must NOT
    // be under test-fixtures/ (plan is not a fixture, so those paths are filtered by checkCx).
    const artifactRelPath = 'clients/encore/field-inventories/fixture-f-artifact.md';
    const artifactAbsPath = join(REPO_ROOT, artifactRelPath);
    const artifactContent = makeArtifact({ walkMode: 'quick', rows: [COVERED_ROW] });

    const planBody = [
      '**CoverageMode**: deep',
      '',
      '## Walk Artifact',
      'Artifact: ' + artifactRelPath,
    ].join('\n');
    const tempPlanPath = join(tmpDir, 'fixture-f-plan.md');

    mkdirSync(dirname(artifactAbsPath), { recursive: true });
    writeFileSync(artifactAbsPath, artifactContent, 'utf-8');
    writeFileSync(tempPlanPath, planBody, 'utf-8');

    let validatorOutput = '';
    try {
      validatorOutput = execFileSync(
        process.execPath,
        [join(REPO_ROOT, 'scripts', 'validate-plan-closure.mjs'), '--plan', tempPlanPath, '--dry-run', '--coverage-mode=deny', '--json'],
        { cwd: REPO_ROOT, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
    } catch (e) {
      validatorOutput = (e.stdout || '') + (e.stderr || '');
    }

    // Clean up the on-disk artifact (tempPlanPath is under tmpDir, cleaned in finally)
    try { rmSync(artifactAbsPath); } catch { /* best effort */ }

    const hasMismatch = validatorOutput.includes('tier-mismatch');
    check(
      '(f) deep plan + Walk_Mode: quick artifact → tier-mismatch detected by real validator (FAIL)',
      hasMismatch,
      `validator output (first 300): ${validatorOutput.slice(0, 300)}`
    );
  }

} finally {
  try { rmSync(tmpDir, { recursive: true }); } catch { /* best effort */ }
}

// Summary
console.log('');
if (failures > 0) {
  console.error(`FAILED — ${failures} of ${total} fixture(s) did not match contract-derived expectation.`);
  process.exit(1);
}
console.log(`ALL PASS — ${total} fixtures verified against CoverageMode tier contract.`);
