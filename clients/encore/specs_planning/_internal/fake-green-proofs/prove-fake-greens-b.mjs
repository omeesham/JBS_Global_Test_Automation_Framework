const matchers = {
  toContainString: (actual, expected) => String(actual).includes(expected),
  toBeNull: (actual) => actual === null,
  toBe: (actual, expected) => Object.is(actual, expected),
  notToBe: (actual, expected) => !Object.is(actual, expected),
  toBeGreaterThanOrEqual: (actual, expected) => actual >= expected,
};

async function swallowRejectsTo(fallback) {
  let rejected = false;
  const value = await Promise.reject(new Error('simulated Playwright failure path'))
    .catch(() => {
      rejected = true;
      return fallback;
    });
  return { value, rejected };
}

function all(checks) {
  return checks.every((check) => check.accepted);
}

function formatChecks(checks) {
  return checks.map((check) => `${check.assertion}:${check.accepted}`).join('; ');
}

async function main() {
  const rows = [];

  {
    const { value, rejected } = await swallowRejectsTo(null);
    const checks = [{ assertion: 'expect(ariaSort).toBeNull()', accepted: matchers.toBeNull(value) }];
    rows.push({
      n: 1,
      klass: 'P2',
      model: 'catch fallback literal null; toBeNull is actual === null',
      wrong: `header gone -> getAttribute rejects=${rejected} -> ariaSort=${value}`,
      fed: 'ariaSort=null',
      checks,
    });
  }

  {
    const scenario = { rowsBeforeLength: 2, ariaSort: null, rowsAfterOrderChanged: false };
    const checks = [
      { assertion: 'expect(rowsBefore.length).toBeGreaterThanOrEqual(1)', accepted: matchers.toBeGreaterThanOrEqual(scenario.rowsBeforeLength, 1) },
      { assertion: 'expect(ariaSort).toBeNull()', accepted: matchers.toBeNull(scenario.ariaSort) },
    ];
    rows.push({
      n: 2,
      klass: 'P3',
      model: 'toBeGreaterThanOrEqual is actual >= expected; toBeNull is actual === null',
      wrong: `rowsAfterOrderChanged=${scenario.rowsAfterOrderChanged}`,
      fed: `rowsBefore.length=${scenario.rowsBeforeLength}, ariaSort=${scenario.ariaSort}`,
      checks,
      omitted: 'rowsAfter/order comparison',
    });
  }

  {
    const scenario = { rowCount: 79, expectedRows: 79, row8Label: 'Not Audio Conferencing', getByIndexResolved: true };
    const checks = [
      { assertion: 'expect(rowCount).toBe(SC_ROW_COUNT)', accepted: matchers.toBe(scenario.rowCount, scenario.expectedRows) },
      { assertion: 'await sc.getPercentageByIndex(AUDIO_IDX)', accepted: scenario.getByIndexResolved },
    ];
    rows.push({
      n: 3,
      klass: 'P3',
      model: 'toBe is Object.is; awaited call only proves no throw',
      wrong: `row8Label=${JSON.stringify(scenario.row8Label)}`,
      fed: `rowCount=${scenario.rowCount}, getPercentageByIndex resolved=${scenario.getByIndexResolved}`,
      checks,
      omitted: 'Audio Conferencing label at AUDIO_IDX',
    });
  }

  {
    const value = '24.005 %';
    const ariaInvalid = null;
    const checks = [
      { assertion: "expect(inputValue).toContain('24.00')", accepted: matchers.toContainString(value, '24.00') },
      { assertion: "expect(ariaInvalid).not.toBe('true')", accepted: matchers.notToBe(ariaInvalid, 'true') },
    ];
    rows.push({
      n: 4,
      klass: 'P1',
      model: 'toContain on string is String.prototype.includes; not.toBe is !Object.is',
      wrong: JSON.stringify(value),
      fed: `inputValue=${JSON.stringify(value)}, ariaInvalid=${ariaInvalid}`,
      checks,
    });
  }

  {
    const value = '024.00 %';
    const ariaInvalid = null;
    const checks = [
      { assertion: "expect(inputValue).toContain('24.00')", accepted: matchers.toContainString(value, '24.00') },
      { assertion: "expect(ariaInvalid).not.toBe('true')", accepted: matchers.notToBe(ariaInvalid, 'true') },
    ];
    rows.push({
      n: 5,
      klass: 'P1',
      model: 'toContain on string is String.prototype.includes; not.toBe is !Object.is',
      wrong: JSON.stringify(value),
      fed: `inputValue=${JSON.stringify(value)}, ariaInvalid=${ariaInvalid}`,
      checks,
    });
  }

  {
    const values = ['10.00 %', '100.00 %'];
    const ariaInvalid = null;
    const checks = [
      { assertion: "expect('10.00 %').toContain('0.00')", accepted: matchers.toContainString(values[0], '0.00') },
      { assertion: "expect('100.00 %').toContain('0.00')", accepted: matchers.toContainString(values[1], '0.00') },
      { assertion: "expect(ariaInvalid).not.toBe('true')", accepted: matchers.notToBe(ariaInvalid, 'true') },
    ];
    rows.push({
      n: 6,
      klass: 'P1',
      model: 'toContain on string is String.prototype.includes; not.toBe is !Object.is',
      wrong: values.map((value) => JSON.stringify(value)).join(' and '),
      fed: `inputValues=${values.map((value) => JSON.stringify(value)).join(', ')}, ariaInvalid=${ariaInvalid}`,
      checks,
    });
  }

  {
    const scenario = { saveActive: true, savedValue: '34.00 %', editValue: '34.00', sortAffordanceAsserted: false };
    const checks = [
      { assertion: 'expect(await sc.waitForSaveActive()).toBe(true)', accepted: matchers.toBe(scenario.saveActive, true) },
      { assertion: 'expect(await sc.getPercentageByIndex(AUDIO_IDX)).toContain(editValue)', accepted: matchers.toContainString(scenario.savedValue, scenario.editValue) },
    ];
    rows.push({
      n: 7,
      klass: 'P3',
      model: 'toBe is Object.is; toContain on string is String.prototype.includes',
      wrong: `sortAffordanceAsserted=${scenario.sortAffordanceAsserted}`,
      fed: `saveActive=${scenario.saveActive}, savedValue=${JSON.stringify(scenario.savedValue)}, editValue=${JSON.stringify(scenario.editValue)}`,
      checks,
      omitted: 'sort affordance expectation',
    });
  }

  {
    const { value, rejected } = await swallowRejectsTo(false);
    const checks = [{ assertion: 'expect(dialogVisible).toBe(false)', accepted: matchers.toBe(value, false) }];
    rows.push({
      n: 8,
      klass: 'P2',
      model: 'catch fallback literal false; toBe is Object.is',
      wrong: `dialog probe failure -> isVisible rejects=${rejected} -> dialogVisible=${value}`,
      fed: `dialogVisible=${value}`,
      checks,
    });
  }

  for (const row of rows) {
    const accepted = all(row.checks);
    const verdict = accepted ? 'FAKE-PROVEN' : 'NOT-FAKE-PROVEN';
    const omitted = row.omitted ? ` | omitted=${row.omitted}` : '';
    console.log(`F${row.n} | class=${row.klass} | model=${row.model} | wrong=${row.wrong} | fed=${row.fed} | assertions=[${formatChecks(row.checks)}]${omitted} | accepted=${accepted} | verdict=${verdict}`);
  }
}

await main();
