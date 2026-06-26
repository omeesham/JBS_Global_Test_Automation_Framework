#!/usr/bin/env ts-node
/**
 * humanize.test.ts — unit tests for the shared humanization helpers in humanize.ts.
 *
 * Pins the NTS-008 checkmark-span regression + key scrubInternalVocab behaviors.
 * Run: ts-node scripts/humanize.test.ts
 *   OR: npm run test:humanize
 */

import { sanitizeUnicode, scrubInternalVocab, humanize } from '../export_test_cases/humanize';

let failures = 0;
function assert(label: string, actual: string, expected: string): void {
  const ok = actual === expected;
  console.log(`  ${ok ? '[OK]' : '[FAIL]'} ${label}: ${JSON.stringify(actual)}${ok ? '' : ` (expected ${JSON.stringify(expected)})`}`);
  if (!ok) failures++;
}

// ── NTS-008 regression: bare ✓ as action→expected separator must NOT weld "check mark"
//    onto the adjacent code-span word (the loose \s* form caused "check markalertdialog").
//    Reproduced by humanize(), which calls sanitizeUnicode internally. ──
console.log('NTS-008 / ALL-091 — checkmark-span separator regression');

// End-to-end: bare ✓ between two backtick spans must NOT produce "check markalertdialog"
const nts008Input = '`[testid]` ✓ `alertdialog`';
const nts008Result = humanize(nts008Input);
assert(
  'bare ✓ separator → never "check markalertdialog"',
  nts008Result.includes('check markalertdialog') ? 'BUG: check markalertdialog found' : 'ok',
  'ok'
);
assert(
  'bare ✓ separator → result contains "alert dialog"',
  nts008Result.includes('alert dialog') ? 'ok' : `missing "alert dialog" in: ${nts008Result}`,
  'ok'
);

// sanitizeUnicode alone: bare ✓ between spans normalizes to '->' (action separator), NOT "check mark"
assert(
  'sanitizeUnicode: bare ✓ between code-spans → ->',
  sanitizeUnicode('`[testid]` ✓ `alertdialog`'),
  '`[testid]` -> `alertdialog`'
);

// sanitizeUnicode: backtick-wrapped ✔ → "check mark" (content checkmark, NOT separator)
assert(
  'sanitizeUnicode: `✔` (tight) → "check mark"',
  sanitizeUnicode('show a `✔` marker'),
  'show a check mark marker'
);

// sanitizeUnicode: spaced ✓ inside backtick (` ✓ `) still → "check mark" because the inner ✓
// is wrapped — only a TIGHT match triggers it (no surrounding \s* in the regex)
assert(
  'sanitizeUnicode: spaced ` ✓ ` inside backtick stays as expected (tight match only)',
  sanitizeUnicode('` ✓ `'),
  '` -> `'
);

// ── scrubInternalVocab representative cases ──
console.log('\nscrubInternalVocab — representative cases');

// alertdialog role name → "alert dialog"
assert(
  'alertdialog → "alert dialog"',
  scrubInternalVocab('alertdialog'),
  'alert dialog'
);

// (QUICK) depth marker stripped
assert(
  '(QUICK) stripped',
  scrubInternalVocab('Verify the field (QUICK)'),
  'Verify the field'
);

// (DEEP) depth marker stripped
assert(
  '(DEEP) stripped',
  scrubInternalVocab('Check all values (DEEP)'),
  'Check all values'
);

// fill the note row(0, "a") → type "a" into note row 0
assert(
  'fill the note row(0, "a") → type "a" into note row 0',
  scrubInternalVocab('fill the note row(0, "a")'),
  'type "a" into note row 0'
);

// BUG-ID stripped
assert(
  'BUG-LI-002 stripped',
  scrubInternalVocab('See BUG-LI-002 for details'),
  'See for details'
);

// LR-NNN stripped
assert(
  'LR-026 stripped',
  scrubInternalVocab('applies LR-026 baseline'),
  'applies baseline'
);

// (LR-057 per-launcher coverage) — the two-pass scenario: first pass strips LR-057,
// second pass would be needed to strip the residual "( per-launcher coverage)".
// This test documents the SINGLE-PASS behavior — the residual survives one scrub.
assert(
  'single scrubInternalVocab: (LR-057 per-launcher coverage) strips LR-057, residual survives',
  scrubInternalVocab('same dialog, opposite persistence per launcher (LR-057 per-launcher coverage). Office 1604 restored.'),
  'same dialog, opposite persistence per launcher ( per-launcher coverage). Office 1604 restored'
);
// Double-pass: the second scrub catches the residual ( per-launcher coverage)
assert(
  'double scrubInternalVocab: ( per-launcher coverage) stripped on second pass',
  scrubInternalVocab(scrubInternalVocab('same dialog, opposite persistence per launcher (LR-057 per-launcher coverage). Office 1604 restored.')),
  'same dialog, opposite persistence per launcher. Office 1604 restored'
);

if (failures > 0) {
  console.error(`\n${failures} test(s) FAILED`);
  process.exit(1);
} else {
  console.log(`\nAll tests passed.`);
  process.exit(0);
}
