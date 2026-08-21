import { verifyDenominator, spotAudit } from './scripts/walk-coverage/verify-denominator.mjs';
import { coverageVerdict } from './scripts/walk-coverage/lib/coverage-manifest.mjs';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const REPO_ROOT = process.cwd();
const OUT = join(REPO_ROOT, '.claude/state/ua-worker/dlv-build-denom-01');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

let passed = 0; let failed = 0;
function ok(name, cond, detail='') {
  if (cond) { console.log(`  [PASS] ${name}`); passed++; }
  else { console.log(`  [FAIL] ${name}${detail ? ': '+detail : ''}`); failed++; }
}

// ─── build shared fixtures ────────────────────────────────────────────────
const MANIFEST_HEADER = `---
MCP_Session_Date: 2026-07-21
Coverage_Ratio: 5/5
CrossCheck: clean
Walk_State: office=1604 module=pricing walked=[resting,cascade:alt-on]
Completion_Record: reports/walk-coverage/1604-pricing.json (status=complete, elements=5)
---

## Coverage Manifest

| controlRef | disposition |
|---|---|
| testid:foo | covered-by-TC:TC-CPR-DET-001 |
| testid:bar | covered-by-TC:TC-CPR-DET-002 |
| testid:baz | covered-by-TC:TC-CPR-DET-003 |
| testid:qux | covered-by-TC:TC-CPR-DET-004 |
| testid:quux | covered-by-TC:TC-CPR-DET-005 |
`;

// 5-entry JSON, 5 manifest entries = full match
const ENTRIES5 = ['foo','bar','baz','qux','quux'].map(k => ({ key: `testid:${k}` }));
const JSON5_PATH = join(REPO_ROOT, 'reports/walk-coverage/1604-pricing.json');
if (!existsSync(join(REPO_ROOT,'reports/walk-coverage'))) mkdirSync(join(REPO_ROOT,'reports/walk-coverage'),{recursive:true});

// build valid completion_record (round-trip test)
const report5base = { entries: ENTRIES5, completion_record: { version:1, status:'complete', surfaces_attempted:['1604-pricing'], surfaces_enumerated:['1604-pricing'], element_count:5, raw_before_collapse:5, halt_reasons:[] } };
const preHash = JSON.stringify(report5base, null, 2) + '\n';
const hash = createHash('sha256').update(preHash).digest('hex');
const report5 = JSON.parse(preHash);
report5.completion_record.content_sha256 = hash;
writeFileSync(JSON5_PATH, JSON.stringify(report5, null, 2) + '\n');

// 5-entry JSON, 3 manifest entries (2 missing)
const MANIFEST_3 = `---
MCP_Session_Date: 2026-07-21
Coverage_Ratio: 3/5
CrossCheck: clean
Walk_State: office=1604 module=pricing walked=[resting,cascade:alt-on]
Completion_Record: reports/walk-coverage/1604-pricing.json (status=complete, elements=5)
---
## Coverage Manifest
| controlRef | disposition |
|---|---|
| testid:foo | covered-by-TC:TC-CPR-DET-001 |
| testid:bar | covered-by-TC:TC-CPR-DET-002 |
| testid:baz | covered-by-TC:TC-CPR-DET-003 |
`;

console.log('\n=== ACCEPTANCE TESTS ===');

// T1: 5 entries + 3-row manifest → missing 2
const t1 = verifyDenominator(MANIFEST_3, JSON5_PATH);
ok('T1: 5-entry JSON + 3-manifest → ok:false', !t1.ok);
ok('T1: missing.length===2', t1.reason && (t1.reason.match(/\d+/) || [''])[0] === '2', t1.reason);

// T2: 5 entries + 5-row manifest → ok:true
const t2 = verifyDenominator(MANIFEST_HEADER, JSON5_PATH);
ok('T2: 5/5 → ok:true', t2.ok, t2.reason || '');

// T3: Walk_State walked=[resting] but pricing needs cascade:alt-on → FAIL
const MANIFEST_WALKED1 = MANIFEST_HEADER.replace('walked=[resting,cascade:alt-on]','walked=[resting]');
const t3 = verifyDenominator(MANIFEST_WALKED1, JSON5_PATH);
ok('T3: walked=[resting] missing cascade:alt-on → FAIL', !t3.ok && t3.reason && t3.reason.includes('cascade:alt-on'), t3.reason || '');

// T4: UNREACHABLE entry without exemption → FAIL
const entriesWithUnreachable = [...ENTRIES5, { key: 'testid:ghost', status: 'UNREACHABLE' }];
const jsonUPath = join(REPO_ROOT,'reports/walk-coverage/unreachable-test.json');
writeFileSync(jsonUPath, JSON.stringify({ entries: entriesWithUnreachable }, null, 2) + '\n');
const t4 = verifyDenominator(MANIFEST_HEADER, jsonUPath);
ok('T4: UNREACHABLE without exemption → FAIL', !t4.ok && t4.reason && t4.reason.includes('UNREACHABLE'), t4.reason || '');

// T5: spotAudit with nonexistent TC → FAIL
const MANIFEST_BAD_TC = `---
MCP_Session_Date: 2026-07-21
---
## Coverage Manifest
| controlRef | disposition |
|---|---|
| testid:ctrl1 | covered-by-TC:TC-CPR-IMA-999 |
| testid:ctrl2 | covered-by-TC:TC-CPR-IMA-998 |
| testid:ctrl3 | covered-by-TC:TC-CPR-IMA-997 |
| testid:ctrl4 | covered-by-TC:TC-CPR-IMA-996 |
| testid:ctrl5 | covered-by-TC:TC-CPR-IMA-995 |
| testid:ctrl6 | covered-by-TC:TC-CPR-IMA-994 |
| testid:ctrl7 | covered-by-TC:TC-CPR-IMA-993 |
| testid:ctrl8 | covered-by-TC:TC-CPR-IMA-992 |
| testid:ctrl9 | covered-by-TC:TC-CPR-IMA-991 |
| testid:ctrl10 | covered-by-TC:TC-CPR-IMA-990 |
`;
const t5 = spotAudit(MANIFEST_BAD_TC);
ok('T5: nonexistent TC-CPR-IMA-999 → FAIL', !t5.ok, JSON.stringify(t5.failures));
ok('T5: failure message names TC', t5.failures && t5.failures.some(f=>f.includes('TC-CPR-IMA-')));

// T6: spotAudit with real TC id → pass
const MANIFEST_REAL_TC = `---
MCP_Session_Date: 2026-07-21
---
## Coverage Manifest
| controlRef | disposition |
|---|---|
| testid:ctrl1 | covered-by-TC:TC-CPR-DET-001 |
| testid:ctrl2 | covered-by-TC:TC-CPR-DET-002 |
| testid:ctrl3 | covered-by-TC:TC-CPR-DET-003 |
| testid:ctrl4 | covered-by-TC:TC-CPR-DET-004 |
| testid:ctrl5 | covered-by-TC:TC-CPR-DET-005 |
| testid:ctrl6 | covered-by-TC:TC-CPR-DET-006 |
| testid:ctrl7 | covered-by-TC:TC-CPR-DET-007 |
| testid:ctrl8 | covered-by-TC:TC-CPR-DET-008 |
| testid:ctrl9 | covered-by-TC:TC-CPR-DET-009 |
| testid:ctrl10 | covered-by-TC:TC-CPR-DET-010 |
`;
const t6 = spotAudit(MANIFEST_REAL_TC);
ok('T6: real TC ids present in specs → pass', t6.ok, JSON.stringify(t6.failures));

// T7: ROUND-TRIP — valid completion_record accepted; flipped byte rejected
// Use the full MANIFEST_HEADER which points to JSON5_PATH (already written above with valid hash)
const t7a = coverageVerdict(MANIFEST_HEADER, '2026-06-19', { artifactPath: JSON5_PATH });
ok('T7a: valid completion_record → coverageVerdict complete', t7a.complete, JSON.stringify(t7a.reasons));

// Flip one byte: replace hash char
const flipped = JSON.stringify(report5,null,2).replace(hash, hash.slice(0,-1)+'X') + '\n';
const jsonFlipPath = join(REPO_ROOT,'reports/walk-coverage/flipped.json');
writeFileSync(jsonFlipPath, flipped);
const MANIFEST_FLIPPED = MANIFEST_HEADER.replace('1604-pricing.json','flipped.json');
const t7b = coverageVerdict(MANIFEST_FLIPPED, '2026-06-19', { artifactPath: JSON5_PATH, manifestMandatoryDate: '2026-06-19' });
ok('T7b: flipped byte → coverageVerdict not complete (sha mismatch)', !t7b.complete && t7b.reasons && t7b.reasons.some(r=>r.includes('sha256')||r.includes('mismatch')||r.includes('tampered')), JSON.stringify(t7b.reasons));

console.log(`\nResult: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
