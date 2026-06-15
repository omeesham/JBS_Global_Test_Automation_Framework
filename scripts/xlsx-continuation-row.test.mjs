#!/usr/bin/env node
/**
 * xlsx-continuation-row.test.mjs — invariant test for the merged TestRail
 * step-expanded workbook's continuation-row contract
 * (PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT, 2026-06-11).
 *
 * Step-expanded continuation rows (blank TC ID, only Steps (Step) + Steps
 * (Expected Result) filled) are a NEW row class. This test pins the contract the
 * lint stack must honour:
 *   - blank-ID continuation rows are EXCLUDED from C6 (per-sheet ID order/dups),
 *     C8 (registry congruence), and the TC-ID census;
 *   - they are INCLUDED in the vocab + C7 corruption scans (step text is
 *     client-visible), and any hit is attributed to the OWNING TC via the
 *     carried-forward ownerTcId — never to tcId='';
 *   - C5's <4-word client-sentence check is marker-aware: a 2-word reason still
 *     fails the >=4-word rule even with the "Blocked — " marker prepended.
 *
 * Authored as .mjs (not .ts) so it natively imports the ESM lint module without
 * crossing the ts-node CJS → ESM boundary (the same reason to-xlsx.ts runs
 * xlsx-vocab-lint.mjs as a subprocess).
 *
 * Run: node scripts/xlsx-continuation-row.test.mjs   (npm run test:xlsx-continuation-row)
 */
import XLSX from 'xlsx';
import { writeFileSync, rmSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { lintWorkbook, readWorkbookRows } from './xlsx-lint-rules.mjs';

let failures = 0;
function check(label, cond) {
  console.log(`  ${cond ? '[OK]' : '[FAIL]'} ${label}`);
  if (!cond) failures++;
}

// Merged 13-col schema (identical order to MODULE_SHEET_HEADERS in to-xlsx.ts).
// Notes / Reason moved to the LAST column (PLAN_DELIVERABLE_NOTES_REASON_DECLUTTER).
const HEADERS = [
  'TC ID', 'Title', 'Module', 'Submodule', 'Test Data', 'Type', 'Priority',
  'Coverage Status', 'Automation Status', 'Preconditions',
  'Steps (Step)', 'Steps (Expected Result)', 'Notes / Reason',
];
// Continuation rows carry ONLY Steps (Step)+(Expected Result) at cols 11-12 (indices
// 10-11); the trailing Notes / Reason (index 12) is blank by construction.
const cont = (step, exp) => ['', '', '', '', '', '', '', '', '', '', step, exp, ''];

// Sheet 'locations_currency' is registered (LOC/CUR → module 'locations',
// submodule 'currency') so C8 can resolve the owner for the real rows.
const aoa = [
  HEADERS,
  // Case 1 — first row + a continuation row carrying a C7 corruption ("(->)").
  // Pass row with an EMPTY Notes / Reason → must raise NO C9 (clean pass, C9 case iv).
  ['TC-LOC-CUR-001', 'Currency grid default', 'locations', 'currency', 'User: automation user', 'Functional', 'Medium', 'Automated', 'Pass', 'Office 1604 open', '1. Open the Currency tab', 'The tab renders.', ''],
  cont('2. Click the button (->)', 'The grid updates.'),
  // Case 2 — first row Blocked + a continuation row carrying a vocab leak
  // ('data-testid'). The leak MUST attribute to TC-LOC-CUR-002 (ownerTcId), not ''.
  // Blocked row WITH a real reason → must raise NO C9 (C9 case iii).
  ['TC-LOC-CUR-002', 'Currency add dialog', 'locations', 'currency', 'User: automation user', 'Functional', 'Medium', 'Automated', 'Blocked', 'Office 1604 open', '1. Open the add dialog', 'The dialog opens.', 'Blocked — the dialog still lists an item that was already added so it cannot be re-added cleanly. Pending an application fix'],
  cont('2. Read the data-testid of the row', 'The value is read.'),
  // Case 3 — a 2-word Blocked reason ("Blocked — Oracle required") must trip C5
  // despite the marker (word count excludes the marker).
  ['TC-LOC-CUR-003', 'Currency terse', 'locations', 'currency', 'User: automation user', 'Functional', 'Medium', 'Automated', 'Blocked', 'Office 1604 open', '1. Do the thing', 'It happens.', 'Blocked — Oracle required'],
  // Case 4 — a Pass row whose Notes / Reason is NON-EMPTY → must raise C9a (a clean
  // pass has nothing to explain; cleanup/commentary must not ship). Pass + plain note
  // also stays clear of C1 (C1 only fires on a "Blocked — " segment).
  ['TC-LOC-CUR-004', 'Currency commentary', 'locations', 'currency', 'User: automation user', 'Functional', 'Medium', 'Automated', 'Pass', 'Office 1604 open', '1. Open the grid', 'The grid renders.', 'The Pricing Strategy filter is a free-text box, not a dropdown.'],
  // Case 5 — a Pass row whose cell starts "Cleanup after test:" → must raise C9b
  // (cleanup breadcrumbs are test-maintenance, never client content).
  ['TC-LOC-CUR-005', 'Currency cleanup breadcrumb', 'locations', 'currency', 'User: automation user', 'Functional', 'Medium', 'Automated', 'Pass', 'Office 1604 open', '1. Open the grid', 'The grid renders.', 'Cleanup after test: restore the original grid values.'],
  // SUMMARY footer (exempt everywhere — cosmetic roll-up; positions mirror the emitter:
  // Coverage at col 8, Automation Status at col 9, Last Updated in the trailing Notes / Reason).
  ['SUMMARY', 'Location — Currency', '', '', '', '', '', 'Automated: 5 / Pending: 0', 'Pass:3 Fail:0 Skipped:0 Blocked:2', '', '', '', ''],
];

const dir = mkdtempSync(path.join(tmpdir(), 'xlsx-cont-'));
const fixture = path.join(dir, 'continuation-fixture.xlsx');
try {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), 'locations_currency');
  XLSX.writeFile(wb, fixture);

  console.log('continuation-row invariant');

  // ── readWorkbookRows: ownerTcId carry-forward ──
  const rows = readWorkbookRows(fixture);
  const contRowOfCase2 = rows.find(r => String(r['TC ID'] ?? '').trim() === '' && /data-testid/.test(String(r['Steps'] ?? '')));
  check('continuation row has blank TC ID', contRowOfCase2 && String(contRowOfCase2['TC ID'] ?? '').trim() === '');
  check("continuation row's ownerTcId = TC-LOC-CUR-002", contRowOfCase2 && contRowOfCase2.ownerTcId === 'TC-LOC-CUR-002');

  // ── lintWorkbook results ──
  const res = lintWorkbook(fixture);

  // vocab hit on the continuation step text, attributed to the owning TC (not '')
  const leak = res.vocabHits.find(h => h.pattern === 'data-testid');
  check('vocab scan flags data-testid on a continuation row', !!leak);
  check('vocab hit attributed to ownerTcId TC-LOC-CUR-002 (not blank)', leak && leak.tcId === 'TC-LOC-CUR-002');

  // C7 corruption on a continuation row, attributed to its owner
  const c7 = res.integrityViolations.find(v => v.code === 'C7');
  check('C7 corruption flagged on a continuation row', !!c7);
  check('C7 attributed to ownerTcId TC-LOC-CUR-001 (not blank)', c7 && c7.tcId === 'TC-LOC-CUR-001');

  // blank-ID rows EXCLUDED from C6 (no spurious dup/order violation) and C8
  const c6 = res.integrityViolations.filter(v => v.code === 'C6');
  check('no C6 violation (blank continuation rows excluded from ID census/order)', c6.length === 0);
  const c8 = res.integrityViolations.filter(v => v.code === 'C8');
  check('no C8 violation (blank continuation rows excluded from registry check)', c8.length === 0);

  // C5 marker-aware: a 2-word Blocked reason is caught despite the "Blocked — " marker
  const c5 = res.integrityViolations.find(v => v.code === 'C5' && v.tcId === 'TC-LOC-CUR-003');
  check('C5 catches a 2-word Blocked reason despite the marker', !!c5);

  // C1 must NOT fire on the Pass row (it carries no Blocked segment, only plain steps)
  const c1 = res.integrityViolations.filter(v => v.code === 'C1');
  check('no false C1 on the Pass case', c1.length === 0);

  // ── C9 anti-pollution gate (PLAN_DELIVERABLE_NOTES_REASON_DECLUTTER §2.7) ──
  const c9 = res.integrityViolations.filter(v => v.code === 'C9');
  // C9a — a Pass row with a non-empty Notes / Reason is flagged (TC-LOC-CUR-004).
  check('C9a flags a populated Notes / Reason on a Pass row',
    c9.some(v => v.tcId === 'TC-LOC-CUR-004'));
  // C9b — a "Cleanup after test:" breadcrumb is flagged (TC-LOC-CUR-005).
  check('C9b flags a "Cleanup after test:" breadcrumb',
    c9.some(v => /Cleanup after test/i.test(v.detail)));
  // iii — a Blocked row with a real reason raises NO C9.
  check('no C9 on the Blocked row with a real reason (TC-LOC-CUR-002)',
    !c9.some(v => v.tcId === 'TC-LOC-CUR-002'));
  // iv — a Pass row with an empty cell raises NO C9.
  check('no C9 on the clean Pass row with an empty cell (TC-LOC-CUR-001)',
    !c9.some(v => v.tcId === 'TC-LOC-CUR-001'));
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log('');
if (failures === 0) {
  console.log('[xlsx continuation-row test] PASS — all invariants hold');
  process.exit(0);
} else {
  console.log(`[xlsx continuation-row test] FAIL — ${failures} assertion(s) failed`);
  process.exit(1);
}
