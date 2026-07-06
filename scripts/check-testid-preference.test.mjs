#!/usr/bin/env node
/**
 * Unit tests for check-testid-preference.mjs — classifyLine() + parseAddedSelectorLines().
 * Fixtures mirror REAL corporate-pricing / locations selector shapes (role/text/grid/testid).
 * Run: node scripts/check-testid-preference.test.mjs   (exit 0 = all pass, 1 = a case failed)
 */
import { classifyLine, parseAddedSelectorLines } from './check-testid-preference.mjs';

let pass = 0, fail = 0;
const check = (name, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; } else { fail++; console.error(`  FAIL ${name}: got ${g}, want ${w}`); }
};

// --- classifyLine: fragile non-testid families are flagged by family name ---
check('role-call', classifyLine(`  search: () => page.getByRole('button', { name: 'Search' }),`), 'getByRole');
check('text-call', classifyLine(`  noResults: () => page.getByText('No results'),`), 'getByText');
check('has-text', classifyLine(`  row: 'tr:has(td:has-text("<name>"))',`), 'has-text/text-is');
check('role-attr', classifyLine(`  option: '[role="listbox"] [role="option"]',`), 'role-attr');
check('name-attr', classifyLine(`  code: 'input[name="OracleProductCode"]',`), 'name-attr');
check('nth-child', classifyLine(`  venueCity: 'panel dd:nth-child(3)',`), 'nth-child/nth-of-type');

// --- classifyLine: testid-anchored lines are golden → null (never flagged) ---
check('testid-attr', classifyLine(`  save: '[data-testid="location-settings-btn-save"]',`), null);
check('getByTestId', classifyLine(`  save: () => page.getByTestId('location-settings-btn-save'),`), null);
// testid signal wins even when a role word is also present on the line.
check('testid-plus-role', classifyLine(`  save: '[data-testid="x"][role="button"]',`), null);
// No locator signal at all → null.
check('no-signal', classifyLine(`  // corporate pricing search selectors`), null);
check('empty', classifyLine(''), null);

// --- parseAddedSelectorLines: tracks file + new-file line number, added lines only ---
const diff = [
  'diff --git a/clients/encore/src/selectors/corporate-pricing/search.ts b/clients/encore/src/selectors/corporate-pricing/search.ts',
  'index 111..222 100644',
  '--- a/clients/encore/src/selectors/corporate-pricing/search.ts',
  '+++ b/clients/encore/src/selectors/corporate-pricing/search.ts',
  '@@ -10,0 +11,2 @@ export const searchSelectors = {',
  `+  search: () => page.getByRole('button', { name: 'Search' }),`,
  `+  grid: '[data-testid="cp-grid"]',`,
  '@@ -20,1 +22,1 @@',
  '-  old: removed,',
  `+  option: '[role="option"]',`,
].join('\n');

check('parse-added', parseAddedSelectorLines(diff), [
  { file: 'clients/encore/src/selectors/corporate-pricing/search.ts', line: 11, text: `  search: () => page.getByRole('button', { name: 'Search' }),` },
  { file: 'clients/encore/src/selectors/corporate-pricing/search.ts', line: 12, text: `  grid: '[data-testid="cp-grid"]',` },
  { file: 'clients/encore/src/selectors/corporate-pricing/search.ts', line: 22, text: `  option: '[role="option"]',` },
]);

// End-to-end: added-line classification keeps only the fragile ones (drops the testid line).
const flaggedFamilies = parseAddedSelectorLines(diff).map((a) => classifyLine(a.text)).filter(Boolean);
check('e2e-flagged-families', flaggedFamilies, ['getByRole', 'role-attr']);

console.log(`\ncheck-testid-preference.test: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
