#!/usr/bin/env ts-node
/**
 * xlsx-compose-reason.test.ts — unit tests for the reason-only composeReason() helper
 * (PLAN_DELIVERABLE_NOTES_REASON_DECLUTTER §2.5).
 *
 * Pins the reason-only contract of the 'Notes / Reason' column:
 *   - tc.notes (MD Notes / Cleanup) is NO LONGER surfaced — the column carries ONLY
 *     the curated execution reason (tc.ifFailedReason).
 *   - the "Blocked — " marker stays execution-gated (applied only when exec='Blocked')
 *     and idempotent (an already-marked reason is not double-marked).
 *   - an empty reason resolves to '' (Pass rows, which carry no ifFailedReason, are
 *     therefore empty automatically).
 *
 * Run: ts-node scripts/xlsx-compose-reason.test.ts
 *   OR: npm run test:xlsx-compose-reason  (added in package.json)
 */

import { composeReason } from '../export_test_cases/to-xlsx';

let failures = 0;
function assert(label: string, actual: string, expected: string): void {
  const ok = actual === expected;
  console.log(`  ${ok ? '[OK]' : '[FAIL]'} ${label}: '${actual}'${ok ? '' : ` (expected '${expected}')`}`);
  if (!ok) failures++;
}

console.log('composeReason — reason-only contract');

// Empty reason → empty cell (the Pass-row case, since the integrity tripwire keeps
// ifFailedReason off every Pass row).
assert('empty reason → empty', composeReason('', ''), '');
assert('empty reason, blocked exec → empty', composeReason('', 'Blocked'), '');

// Skipped reason: no "Blocked — " marker (execution is not 'Blocked').
assert(
  'skipped reason, no marker',
  composeReason('grid row date values do not persist after save and reload', 'Skipped'),
  'grid row date values do not persist after save and reload'
);

// Blocked reason: the execution-gated "Blocked — " marker is applied.
assert(
  'blocked reason gets the marker',
  composeReason('the dialog still lists a location that was already added to the office', 'Blocked'),
  'Blocked — the dialog still lists a location that was already added to the office'
);

// Idempotent: an already-marked reason on a Blocked row is not double-marked.
assert(
  'idempotent — already-marked reason stays single',
  composeReason('Blocked — the Service Charge dropdown options are not sorted alphabetically', 'Blocked'),
  'Blocked — the Service Charge dropdown options are not sorted alphabetically'
);

// Execution-gated: a Pending-Automation env reason (blank execution) keeps NO marker.
assert(
  'pending env reason, blank exec, no marker',
  composeReason('Not yet automated — requires a different office', ''),
  'Not yet automated — requires a different office'
);

// Defensive: a stray "Blocked — " marker on a non-Blocked row is stripped (execution
// gates the marker; the reason text is preserved without it).
assert(
  'stray marker on non-blocked row is stripped',
  composeReason('Blocked — requires a different office', ''),
  'requires a different office'
);

console.log('');
if (failures === 0) {
  console.log(`[xlsx compose-reason tests] PASS — all assertions hold`);
  process.exit(0);
} else {
  console.log(`[xlsx compose-reason tests] FAIL — ${failures} assertion(s) failed`);
  process.exit(1);
}
