#!/usr/bin/env ts-node
/**
 * to-xlsx-sheet-name.test.ts — unit tests for the toSheetName() resolver.
 *
 * Per PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION §234 + Phase A HARD GATE 3:
 *   - all 13 current sheet names must resolve cleanly (Excel ≤31 chars)
 *   - the 3 local-office sheets (BAS/HIS/ECT) split correctly
 *   - a synthetic 32-char overflow case MUST throw via the HALT branch
 *
 * Run: ts-node scripts/to-xlsx-sheet-name.test.ts
 *   OR: npm test:xlsx-sheet-name  (added in package.json)
 */

import { toSheetName } from '../export_test_cases/to-xlsx';

let failures = 0;
function assert(label: string, actual: string, expected: string): void {
  const ok = actual === expected;
  console.log(`  ${ok ? '[OK]' : '[FAIL]'} ${label}: '${actual}'${ok ? '' : ` (expected '${expected}')`}`);
  if (!ok) failures++;
}
function assertThrows(label: string, fn: () => unknown): void {
  let threw = false;
  let msg = '';
  try { fn(); } catch (e) { threw = true; msg = (e as Error).message; }
  console.log(`  ${threw ? '[OK]' : '[FAIL]'} ${label}${threw ? ` (HALT: ${msg.slice(0, 80)}…)` : ' — expected to throw'}`);
  if (!threw) failures++;
}

console.log('toSheetName — 13 current modules');
assert('local_office_settings', toSheetName('local_office_settings'), 'local_office_settings');
assert('local_office_history', toSheetName('local_office_history'), 'local_office_history');
assert('local_office_ect', toSheetName('local_office_ect'), 'local_office_ect');
assert('locations_account_address', toSheetName('locations_account_address'), 'locations_account_address');
assert('locations_auto_addon', toSheetName('locations_auto_addon'), 'locations_auto_addon');
assert('locations_currency', toSheetName('locations_currency'), 'locations_currency');
assert('locations_left_panel', toSheetName('locations_left_panel'), 'locations_left_panel');
assert('locations_legal', toSheetName('locations_legal'), 'locations_legal');
assert('locations_local_information', toSheetName('locations_local_information'), 'locations_local_information');
assert('locations_management_history', toSheetName('locations_management_history'), 'locations_management_history');
assert('locations_notes', toSheetName('locations_notes'), 'locations_notes');
assert('locations_pricing', toSheetName('locations_pricing'), 'locations_pricing');
assert(
  'locations_shared_setup_locations (truncated to ...location, 31 chars)',
  toSheetName('locations_shared_setup_locations'),
  'locations_shared_setup_location'
);

console.log('toSheetName — accepts both forms (with and without _test_cases suffix)');
assert('local_office_settings_test_cases', toSheetName('local_office_settings_test_cases'), 'local_office_settings');
assert(
  'locations_shared_setup_locations_test_cases',
  toSheetName('locations_shared_setup_locations_test_cases'),
  'locations_shared_setup_location'
);

console.log('toSheetName — Excel limit enforcement (31 chars)');
// 31-char untracked name → returns as-is
const exactly31 = 'a'.repeat(31);
assert(`untracked 31-char name passes`, toSheetName(exactly31), exactly31);
// 32-char untracked name → HALT
const synthetic32 = 'a'.repeat(32);
assertThrows(`synthetic 32-char untracked name HALTs`, () => toSheetName(synthetic32));

console.log('');
if (failures === 0) {
  console.log(`[to-xlsx sheet-name tests] PASS — all assertions hold`);
  process.exit(0);
} else {
  console.log(`[to-xlsx sheet-name tests] FAIL — ${failures} assertion(s) failed`);
  process.exit(1);
}
