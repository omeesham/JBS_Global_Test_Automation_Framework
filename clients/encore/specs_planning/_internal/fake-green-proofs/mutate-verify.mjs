// mutate-verify.mjs
// Plain Node, no dependencies. Reads assertions from the working tree filesystem, not HEAD.

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const files = {
  history: path.join(repoRoot, 'clients', 'encore', 'tests', 'service-charge', 'service-charge-history.spec.ts'),
  basic: path.join(repoRoot, 'clients', 'encore', 'tests', 'service-charge', 'service-charge-basic-information.spec.ts'),
};

const sources = Object.fromEntries(
  Object.entries(files).map(([key, file]) => [key, fs.readFileSync(file, 'utf8')]),
);

function requireAssertions(fileKey, assertions) {
  const source = sources[fileKey];
  const missing = assertions.filter((assertion) => !source.includes(assertion));
  if (missing.length) {
    throw new Error(`Current working-tree source ${files[fileKey]} is missing assertion(s): ${missing.join(' | ')}`);
  }
  return assertions;
}

function deepEqual(left, right) {
  if (Object.is(left, right)) return true;
  if (typeof left !== typeof right) return false;
  if (!left || !right || typeof left !== 'object') return false;
  if (Array.isArray(left) !== Array.isArray(right)) return false;

  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every((key) => Object.hasOwn(right, key) && deepEqual(left[key], right[key]));
}

const matchers = {
  toContain: (actual, expected) => String(actual).includes(expected),
  toBe: (actual, expected) => Object.is(actual, expected),
  toEqual: (actual, expected) => deepEqual(actual, expected),
  notToEqual: (actual, expected) => !deepEqual(actual, expected),
  toBeGreaterThan: (actual, expected) => actual > expected,
  toBeGreaterThanOrEqual: (actual, expected) => actual >= expected,
  notToBeVisible: (visible) => visible !== true,
};

const findings = [
  {
    n: 1,
    wrong: 'header gone -> old getAttribute rejection swallowed to ariaSort=null',
    assertions: requireAssertions('history', [
      'expect(rows.length).toBeGreaterThanOrEqual(2);',
      'expect(ascRow0.length).toBeGreaterThan(0);',
      'expect(ascRow0Parsed).toBe(minDate);',
      'expect(descRow0.length).toBeGreaterThan(0);',
      'expect(ascRow0).not.toEqual(descRow0);',
    ]),
    model: 'toBe is Object.is; toEqual is deep equality; not.toEqual negates deep equality; length comparisons are numeric; no catch fallback remains',
    accepted: false,
    outcome: 'CLOSED',
    reason: 'the current assertion set has no toBeNull/catch path, so the old null fallback cannot satisfy it',
  },
  {
    n: 2,
    wrong: 'rowsAfterOrderChanged=false while old test only checked pre-click row count and ariaSort=null',
    assertions: requireAssertions('history', [
      'expect(ascRow0Parsed).toBe(minDate);',
      'expect(ascRow0).not.toEqual(descRow0);',
    ]),
    model: 'toBe is Object.is for the parsed minimum date; not.toEqual uses deep equality and rejects identical ascending/descending row-0 values',
    accepted: matchers.toBe(10, 20) && matchers.notToEqual('same row', 'same row'),
    outcome: 'CLOSED',
    reason: 'an unchanged/non-minimum order fails the new minimum-date and ascending-vs-descending assertions',
  },
  {
    n: 3,
    wrong: 'row 8 label = "Not Audio Conferencing"',
    assertions: requireAssertions('basic', [
      'expect(rowCount).toBe(SC_ROW_COUNT);',
      "expect(rowLabel).toBe('Audio Conferencing');",
      "expect(percentageValue).toContain(' %');",
    ]),
    model: 'toBe is Object.is; toContain on string is String.prototype.includes',
    accepted: matchers.toBe('Not Audio Conferencing', 'Audio Conferencing'),
    outcome: 'CLOSED',
    reason: 'the current label assertion rejects the old wrong row-label mutation',
  },
  {
    n: 4,
    wrong: '24.005 %',
    assertions: requireAssertions('basic', [
      "expect(await input.inputValue()).toBe('24.00 %');",
      "expect(await input.getAttribute('aria-invalid')).not.toBe('true');",
    ]),
    model: 'toBe is Object.is; not.toBe negates Object.is',
    accepted: matchers.toBe('24.005 %', '24.00 %'),
    outcome: 'CLOSED',
    reason: 'the former substring-passing value is not exactly the repaired expected value',
  },
  {
    n: 5,
    wrong: '024.00 %',
    assertions: requireAssertions('basic', [
      "expect(await input.inputValue()).toBe('24.00 %');",
      "expect(await input.getAttribute('aria-invalid')).not.toBe('true');",
    ]),
    model: 'toBe is Object.is; not.toBe negates Object.is',
    accepted: matchers.toBe('024.00 %', '24.00 %'),
    outcome: 'CLOSED',
    reason: 'the former substring-passing leading-zero value is not exactly the repaired expected value',
  },
  {
    n: 6,
    wrong: '10.00 % and 100.00 %',
    assertions: requireAssertions('basic', [
      "expect(await input.inputValue()).toBe('0.00 %');",
      "expect(await input.getAttribute('aria-invalid')).not.toBe('true');",
    ]),
    model: 'toBe is Object.is; not.toBe negates Object.is',
    accepted: matchers.toBe('10.00 %', '0.00 %') || matchers.toBe('100.00 %', '0.00 %'),
    outcome: 'CLOSED',
    reason: 'both former substring-passing values are rejected by the exact zero assertion',
  },
  {
    n: 7,
    wrong: 'sortAffordanceAsserted=false / sort affordance may exist while saved value persists',
    assertions: requireAssertions('basic', [
      'expect(await sc.waitForSaveActive()).toBe(true);',
      'expect(await sc.getPercentageByIndex(AUDIO_IDX)).toContain(editValue);',
    ]),
    model: 'toBe is Object.is; toContain on string is String.prototype.includes; no matcher covers the sort-affordance property',
    accepted: matchers.toBe(true, true) && matchers.toContain('34.00 %', '34.00'),
    outcome: 'CHANGED-SHAPE',
    reason: 'the current test deliberately leaves the sort-affordance expectation unasserted; new wrong value: sort affordance present and savedValue="34.00 %" with editValue="34.00" still passes',
  },
  {
    n: 8,
    wrong: 'dialog probe failure -> old isVisible rejection swallowed to false, or delayed dialog appears after instant snapshot',
    assertions: requireAssertions('basic', [
      'expect(await sc.isSaveEnabled()).toBe(false);',
      'await expect(authPage.locator(\'[role="dialog"], [role="alertdialog"]\')).not.toBeVisible({ timeout: 3000 });',
    ]),
    model: 'toBe is Object.is for Save-disabled checks; not.toBeVisible rejects visible=true over the bounded wait; no catch-to-false fallback remains',
    accepted: matchers.notToBeVisible(true),
    outcome: 'CLOSED',
    reason: 'a visible dialog during the bounded window fails the repaired assertion instead of being coerced to false',
  },
];

console.log('MUTATION VERIFY');
console.log('ASSERTION_SOURCE=working tree filesystem via fs.readFileSync; git show HEAD was not used');
console.log(`FILES=${files.history}; ${files.basic}`);

for (const finding of findings) {
  const acceptedText = finding.accepted ? 'true' : 'false';
  const current = finding.assertions.map((assertion) => `"${assertion}"`).join(' | ');
  const prefix = finding.outcome === 'CHANGED-SHAPE' || finding.outcome === 'STILL-OPEN'
    ? `*** ${finding.outcome} F${finding.n} ***`
    : `F${finding.n}`;
  console.log(`${prefix} | wrong="${finding.wrong}" | currentAssertion=${current} | matcherModel=${finding.model} | currentAcceptsWrong=${acceptedText} | outcome=${finding.outcome} | ${finding.reason}`);
}
