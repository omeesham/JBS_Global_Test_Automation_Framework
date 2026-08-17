/**
 * xlsx-tripwire.test.ts — unit tests for the S0 tripwire guards in sp00-augment-logic.
 *
 * Graduating incident: 2026-08-13/14, all-skip listing poisoned 1970 workbook
 * rows when .auth/encore-state.json was absent (PLAN_66).
 *
 * Tests both exported pure predicates without touching real auth state or running
 * Playwright. Temp files are created and cleaned up in OS tmp (outside the repo).
 *
 * Run: ts-node scripts/xlsx-tripwire.test.ts   (npm run test:xlsx-tripwire)
 */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { authStateExists, isAllSkipListing } from '../export_test_cases/sp00-augment-logic';

let failures = 0;
function check(label: string, cond: boolean): void {
  console.log(`  ${cond ? '[OK]' : '[FAIL]'} ${label}`);
  if (!cond) failures++;
}

// ── Guard 1: authStateExists ──────────────────────────────────────────────────
console.log('Guard 1 — authStateExists');

// Trips: directory exists, file does not
const tmpClientRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'xlsx-tripwire-'));
try {
  const authDir = path.join(tmpClientRoot, '.auth');
  fs.mkdirSync(authDir);
  check('returns false when encore-state.json is absent', !authStateExists(tmpClientRoot));

  // Passes: file exists
  const stateFile = path.join(authDir, 'encore-state.json');
  fs.writeFileSync(stateFile, '{}', 'utf-8');
  check('returns true when encore-state.json exists', authStateExists(tmpClientRoot));
} finally {
  fs.rmSync(tmpClientRoot, { recursive: true, force: true });
}

// ── Guard 2: isAllSkipListing ─────────────────────────────────────────────────
console.log('Guard 2 — isAllSkipListing');

// Trips: every test is skip-annotated
check(
  'returns true on all-skip listing (3 tests, all skip)',
  isAllSkipListing([
    { tcId: 'TC-LOC-CUR-001', kind: 'skip' },
    { tcId: 'TC-LOC-CUR-002', kind: 'skip' },
    { tcId: 'TC-LOC-CUR-003', kind: 'skip' },
  ])
);

// Passes: mixed listing (some skip, some test)
check(
  'returns false on mixed listing (skip + test)',
  !isAllSkipListing([
    { tcId: 'TC-LOC-CUR-001', kind: 'skip' },
    { tcId: 'TC-LOC-CUR-002', kind: 'test' },
  ])
);

// Passes: mixed listing (skip + fixme)
check(
  'returns false on mixed listing (skip + fixme)',
  !isAllSkipListing([
    { tcId: 'TC-LOC-CUR-001', kind: 'skip' },
    { tcId: 'TC-LOC-CUR-002', kind: 'fixme' },
  ])
);

// Passes: empty listing — separate failure class, guard must not misfire
check(
  'returns false on empty listing (zero tests)',
  !isAllSkipListing([])
);

// ─────────────────────────────────────────────────────────────────────────────
console.log('');
if (failures === 0) {
  console.log('[xlsx tripwire test] PASS — all invariants hold');
  process.exit(0);
} else {
  console.log(`[xlsx tripwire test] FAIL — ${failures} assertion(s) failed`);
  process.exit(1);
}
