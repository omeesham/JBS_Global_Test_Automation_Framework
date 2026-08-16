// prove-fake-greens.mjs
// Plain Node, no dependencies.
// For each of the 8 findings: prints finding#, wrong value, assertion, and whether the assertion accepted it.
// Matcher modelling is stated inline per finding.

function result(num, cls, wrongValue, assertionStr, matcherResult, matcherModel) {
  const verdict = matcherResult ? 'FAKE-PROVEN' : 'NOT-FAKE-PROVEN';
  console.log(`F${num} [${cls}] ${verdict} | wrong="${wrongValue}" | assertion: ${assertionStr} | accepted=${matcherResult} | matcher: ${matcherModel}`);
}

// ── FINDING 1 ──────────────────────────────────────────────────────────────────
// TC-SVC-HIS-012, service-charge-history.spec.ts (committed HEAD ~line 289)
// Code: const ariaSort = await allColumnHeaders.first().getAttribute('aria-sort', { timeout: 3000 }).catch(() => null);
//       expect(ariaSort).toBeNull();
// Class P2: (a) swallow fallback is null — exactly what toBeNull demands.
//           (b) getAttribute can fail (element detaches after click / timeout) — real failure path.
// Matcher model: toBeNull() ≡ value === null
{
  const swallowFallback = null; // the .catch(() => null) value
  const assertion = 'expect(ariaSort).toBeNull()';
  const accepted = swallowFallback === null;
  // Part (b): getAttribute throws on detached element / timeout expiry — real failure path confirmed from source.
  const partB = 'getAttribute throws on detached element or 3000ms timeout — real failure path';
  result(1, 'P2', 'null (swallow fallback from .catch(()=>null))', assertion, accepted,
    `toBeNull ≡ value===null; swallow fallback=${JSON.stringify(swallowFallback)}; (b) ${partB}`);
}

// ── FINDING 2 ──────────────────────────────────────────────────────────────────
// TC-SVC-HIS-012, service-charge-history.spec.ts (committed HEAD ~line 271)
// Code: const rowsBefore = await sc.getHistoryRows();
//       expect(rowsBefore.length).toBeGreaterThanOrEqual(1);
//       ... [click] ...
//       const ariaSort = ...; expect(ariaSort).toBeNull();
// Class P3: enumerate every asserted value — none checks row order after click.
// All asserted values (exhaustive enumeration):
//   (a) rowsBefore.length >= 1
//   (b) ariaSort === null
// "Row order after click" is claimed as the missing property.
{
  const allAssertedValues = [
    'rowsBefore.length >= 1  (pre-click row count lower bound)',
    'ariaSort === null        (aria-sort attribute after click)',
  ];
  const claimedMissingProperty = 'row order / row content AFTER click';
  const missingIsAsserted = allAssertedValues.some(v => v.includes('after click') && v.includes('row order'));
  // missingIsAsserted is false — the claimed property is not among the asserted values.
  result(2, 'P3',
    '[none needed — omission proof]',
    `Enumerated asserted values: [${allAssertedValues.join(' | ')}] — "${claimedMissingProperty}" is absent`,
    !missingIsAsserted,
    `P3 omission: exhaustive enumeration shows ${allAssertedValues.length} asserted values; claimed property absent`);
}

// ── FINDING 3 ──────────────────────────────────────────────────────────────────
// TC-SVC-BAS-029, service-charge-basic-information.spec.ts ~line 623
// Code: const rowCount = await page.locator('[data-testid^="service-charge-percentage-"]').count();
//       expect(rowCount).toBe(SC_ROW_COUNT);   // 79
//       await sc.getPercentageByIndex(AUDIO_IDX);  // return value NOT asserted
// Class P3: enumerate every asserted value — row's label/name is not among them.
{
  const allAssertedValues = [
    'rowCount === 79  (count of [data-testid^="service-charge-percentage-"] elements)',
  ];
  // getPercentageByIndex(AUDIO_IDX) is called but its return value is discarded — not asserted.
  const claimedMissingProperty = 'label/name of the row at AUDIO_IDX is "Audio Conferencing"';
  const missingIsAsserted = allAssertedValues.some(v => v.includes('Audio') || v.includes('label'));
  result(3, 'P3',
    '[none needed — omission proof]',
    `Enumerated asserted values: [${allAssertedValues.join(' | ')}] — "${claimedMissingProperty}" is absent; getPercentageByIndex return value is discarded (no expect())`,
    !missingIsAsserted,
    `P3 omission: ${allAssertedValues.length} asserted value(s); row label never asserted; call to getPercentageByIndex has no expect() wrapper`);
}

// ── FINDING 4 ──────────────────────────────────────────────────────────────────
// TC-SVC-BAS-007, service-charge-basic-information.spec.ts line 219
// Code: expect(await input.inputValue()).toContain('24.00');
// Class P1: evaluate toContain('24.00') against wrong value '24.005 %'
// Matcher model: toContain on string ≡ String.prototype.includes
{
  const wrongValue = '24.005 %';
  const expected = '24.00';
  const accepted = wrongValue.includes(expected); // true
  result(4, 'P1', wrongValue, `expect(value).toContain('24.00')`, accepted,
    `toContain on string ≡ String.prototype.includes; '${wrongValue}'.includes('${expected}') = ${accepted}`);
}

// ── FINDING 5 ──────────────────────────────────────────────────────────────────
// TC-SVC-BAS-012, service-charge-basic-information.spec.ts line 290
// Code: expect(await input.inputValue()).toContain('24.00');
// Class P1: evaluate toContain('24.00') against wrong value '024.00 %'
{
  const wrongValue = '024.00 %';
  const expected = '24.00';
  const accepted = wrongValue.includes(expected); // true
  result(5, 'P1', wrongValue, `expect(value).toContain('24.00')`, accepted,
    `toContain on string ≡ String.prototype.includes; '${wrongValue}'.includes('${expected}') = ${accepted}`);
}

// ── FINDING 6 ──────────────────────────────────────────────────────────────────
// TC-SVC-BAS-014, service-charge-basic-information.spec.ts line 326
// Code: expect(await input.inputValue()).toContain('0.00');
// Class P1: evaluate toContain('0.00') against wrong values '10.00 %' and '100.00 %'
{
  const expected = '0.00';
  for (const wrongValue of ['10.00 %', '100.00 %']) {
    const accepted = wrongValue.includes(expected);
    result(6, 'P1', wrongValue, `expect(value).toContain('0.00')`, accepted,
      `toContain on string ≡ String.prototype.includes; '${wrongValue}'.includes('${expected}') = ${accepted}`);
  }
}

// ── FINDING 7 ──────────────────────────────────────────────────────────────────
// TC-SVC-BAS-030, service-charge-basic-information.spec.ts ~line 642
// Code:
//   expect(await sc.waitForSaveActive()).toBe(true);
//   await sc.clickSave();
//   await sc.waitUntilLoaded();
//   await sc.goto(SC_OFFICE);
//   expect(await sc.getPercentageByIndex(AUDIO_IDX)).toContain(editValue);
//   // NEEDS-LIVE-CONFIRM: verify no column sort affordance ... (COMMENT ONLY — never asserted)
// Class P3: enumerate every asserted value — sort-affordance absence is not among them.
{
  const allAssertedValues = [
    'waitForSaveActive() === true  (save button active after edit)',
    'getPercentageByIndex(AUDIO_IDX) contains editValue  (persisted value after reload)',
  ];
  const claimedMissingProperty = 'absence of sort affordance (sortable column header)';
  const missingIsAsserted = allAssertedValues.some(v => v.includes('sort'));
  result(7, 'P3',
    '[none needed — omission proof]',
    `Enumerated asserted values: [${allAssertedValues.join(' | ')}] — "${claimedMissingProperty}" is absent; companion expectation is a NEEDS-LIVE-CONFIRM comment, never an expect()`,
    !missingIsAsserted,
    `P3 omission: ${allAssertedValues.length} asserted values; sort-affordance absence never asserted; comment reads "NEEDS-LIVE-CONFIRM" not an expect()`);
}

// ── FINDING 8 ──────────────────────────────────────────────────────────────────
// TC-SVC-BAS-025, service-charge-basic-information.spec.ts line 588
// Code: expect(await authPage.locator('[role="dialog"], [role="alertdialog"]').first().isVisible().catch(() => false)).toBe(false);
// Class P2: (a) swallow fallback is false — exactly what toBe(false) demands.
//           (b) isVisible() throws when element is not attached to DOM — real failure path.
// Matcher model: toBe(false) ≡ value === false (Object.is semantics, false is false)
{
  const swallowFallback = false; // the .catch(() => false) value
  const assertion = 'expect(value).toBe(false)';
  const accepted = Object.is(swallowFallback, false);
  const partB = 'isVisible() throws when locator resolves to detached/absent element — real failure path; also: a dialog that appears AFTER the synchronous snapshot returns false without throwing';
  result(8, 'P2', 'false (swallow fallback from .catch(()=>false))', assertion, accepted,
    `toBe(false) ≡ Object.is(value,false); swallow fallback=${JSON.stringify(swallowFallback)}; (b) ${partB}`);
}
