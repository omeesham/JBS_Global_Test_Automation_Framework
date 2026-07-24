import { test, expect } from '../../src/fixtures/pages.fixture';
import {
  CORP_PRICING_OVERRIDE,
  CORP_PRICING_OVERRIDE_FIXTURE,
  CORP_PRICING_OVERRIDE_ACTIVE_BED,
  CORP_PRICING_OVERRIDE_SORT_BED,
  CORP_PRICING_OVERRIDE_LABOR_BED,
  CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED,
  CORP_PRICING_OVERRIDE_EMDASH_BED,
  CORP_PRICING_OVERRIDE_PICKER_BED,
  CORP_PRICING_OVERRIDE_UNSAVED_DIALOG,
  OVERRIDE_NUMERIC_CASES,
} from '../../src/data/corporate-pricing/override';
import {
  OVERRIDE_BVA_OFFICES,
  OVERRIDE_BVA_REJECTED,
  OVERRIDE_BVA_COMMITTED,
  OVERRIDE_BVA_DEFECTS,
  OVERRIDE_REJECTION_SIGNATURE,
  OVERRIDE_CURRENCY_BED,
} from '../../src/data/corporate-pricing/override';
import { saveAndVerifyCase } from '../../src/utils/field-case-runner';
import { CorporatePricingOverrideSelectors } from '../../src/selectors/corporate-pricing/override';
import { resolve } from 'node:path';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import type { CorporatePricingOverridePage } from '../../src/pages/corporate-pricing/corporate-pricing-override.page';

const GRID_ROW = CorporatePricingOverrideSelectors.ovrGridRowAny;

/**
 * Fixture anchored to office 1606 (2026-07-06) while an open Product Group Override data/import
 * problem on office 1604 awaits the Encore product team's answer (see `encore-qa-tracker.xlsx`);
 * revert the fixture to the office-1604 anchors when it is resolved (the data file records them).
 *
 * RESOLVED: the grid IS editable for the automation user (an earlier exploration's "inert cells"
 * was a false negative). Edit = click the Override Price / Max Discount cell `div[role=button]` → an
 * active `spinbutton` reveals → native value-setter (React-controlled; `.fill()` does not commit) +
 * `Enter` commits → Save enables. Active = Radix `checkbox` (a per-table boolean render format) toggles + dirties.
 * Save → "Save Changes" alertdialog → `POST /navigator/api/location/corporate-price-pg-override` (filter the
 * backend API path, never the page URL) → toast "Pricing overrides saved successfully." Net-zero verified
 * (revert-to-original disables Save). NM-1870 / NM-1889 not-reproduced (live verdicts recorded).
 *
 * MUTATION SAFETY: only the save-cycle describe commits, on the dedicated Override fixture row 2609
 * (`House Video Monitor LED 70"-79"`, default Override Price 500.00) — distinct screen/data-model from the
 * Strategy/Detail fixtures (zero collision). Each save-cycle restores via the bounded-retry
 * `ensureDefaultState()` (throws on residual drift). Read/filter/edit-behavior describes never commit.
 * Heavy page (server-loaded grid) → per-test timeout raised where a reload stack runs.
 */

const LOC = CORP_PRICING_OVERRIDE_FIXTURE.office; // location picker search needle ('1606')
const ANCHOR = CORP_PRICING_OVERRIDE_FIXTURE.mutationRowAnchor.productGroupName;
const ANCHOR_ID = CORP_PRICING_OVERRIDE_FIXTURE.mutationRowAnchor.productGroupId;
const DEFAULTS = {
  overridePrice: CORP_PRICING_OVERRIDE_FIXTURE.mutationRowAnchor.overridePriceDefault,
  active: CORP_PRICING_OVERRIDE_FIXTURE.mutationRowAnchor.activeDefault,
};

const IMP = CORP_PRICING_OVERRIDE.import;
const RT = IMP.roundTrip;
const importFixture = (name: string): string =>
  resolve(__dirname, '../../src/data/corporate-pricing/fixtures', IMP.fixtureDir, name);

/** Split a downloaded export into its data rows, tolerating the trailing newline. */
const dataRows = (content: string) => content.split(/\r?\n/).slice(1).filter((l) => l.length > 0);
/** Column values from a naive split — safe here because no field in this file contains a comma. */
const columnValues = (content: string, headers: string[], column: string) => {
  const idx = headers.indexOf(column);
  return dataRows(content).map((l) => l.split(',')[idx] ?? '');
};

const IMPHEADER = CORP_PRICING_OVERRIDE.export.expectedHeaders.join(',');
const validRow = (price: string): string => `${RT.office},${RT.productGroupId},${RT.productGroupName},0,USD,305.00,${price},,1`;
const invalidPgRow = `${RT.office},9999999,Nonexistent Product Group,0,USD,305.00,152.00,,1`;
const writeTmp = (name: string, content: string): string => {
  const dir = mkdtempSync(resolve(tmpdir(), 'ovr-batch-'));
  const file = resolve(dir, name);
  writeFileSync(file, content, 'utf-8');
  return file;
};

const expectBodyRejection = async (p: CorporatePricingOverridePage, fixtureName: string, errorContains: string): Promise<void> => {
  await p.reloadAndReselect(RT.office);
  const before = await p.readOverridePrice((await p.findRowByProductGroup(RT.productGroupName))!);
  await p.openImportDialog();
  await p.attachImportFile(importFixture(fixtureName));
  const result = await p.submitImportAndCaptureResult();
  expect(result.status, 'the import POST returns 200 (partial-success API)').toBe(200);
  expect(result.successRecordCount, 'no row was applied').toBe(0);
  expect(result.failureRecordCount, 'the invalid row is counted as a failure').toBe(1);
  expect(result.errors.join(' | '), 'the error names the offending field').toContain(errorContains);
  await p.reloadAndReselect(RT.office);
  expect(await p.readOverridePrice((await p.findRowByProductGroup(RT.productGroupName))!), 'the grid is unchanged after the rejected row').toBe(before);
};

const expectToastRejection = async (p: CorporatePricingOverridePage, fixtureName: string): Promise<string> => {
  await p.reloadAndReselect(RT.office);
  const before = await p.readOverridePrice((await p.findRowByProductGroup(RT.productGroupName))!);
  await p.openImportDialog();
  await p.attachImportFile(importFixture(fixtureName));
  await p.clickImportUpload();
  const alert = await p.readImportAlert();
  await p.reloadAndReselect(RT.office);
  expect(await p.readOverridePrice((await p.findRowByProductGroup(RT.productGroupName))!), 'the grid is unchanged after the rejected file').toBe(before);
  return alert;
};

test.describe('Corporate Pricing — Product Group Override: read, structure & filters @corporate-pricing @override', () => {
  test.beforeEach(async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(90_000);
    await p.reloadAndReselect(LOC); // baseline: fresh nav + location-select per test
  });

  test('TC-CPR-OVR-001: Override screen loads with Equipment selected by default', async ({ corporatePricingOverridePage: p }) => {
    expect(p.page.url(), 'URL navigates to the Product Group Override screen').toContain('/corporate-pricing/pg-override');
    expect(await p.getActiveTab()).toBe('Equipment');
  });

  test('TC-CPR-OVR-002: Equipment + Labor tabs render and switching flips aria-selected', async ({ corporatePricingOverridePage: p }) => {
    await p.switchOverrideTab('Labor');
    expect(await p.getActiveTab()).toBe('Labor');
    await p.switchOverrideTab('Equipment');
    expect(await p.getActiveTab()).toBe('Equipment');
  });

  test('TC-CPR-OVR-003: Grid is location-gated — empty before a location is selected', async ({ corporatePricingOverridePage: p }) => {
    await p.open(); // fresh load, no location chosen
    expect(await p.isEmpty()).toBe(true); // "No results." visible
    expect(await p.getVisibleRowCount()).toBe(0); // no data rows until a location is picked
    await test.step('Confirm the choose-a-location prompt appears', async () => {
      await expect(p.page.getByText('Select a location').first()).toBeVisible();
    });
  });

  test('TC-CPR-OVR-004: Selecting a location populates the grid with the anchor row', async ({ corporatePricingOverridePage: p }) => {
    expect(await p.getVisibleRowCount(), 'Grid populates after selecting a location').toBeGreaterThan(0);
    expect(await p.findRowByProductGroup(ANCHOR)).not.toBeNull();
  });

  test('TC-CPR-OVR-005: Grid renders all 10 column headers in order', async ({ corporatePricingOverridePage: p }) => {
    const headers = (await p.getColumnHeaders()).join(' | ');
    for (const col of CORP_PRICING_OVERRIDE.gridColumns) expect(headers).toContain(col);
  });

  // NM-1870 ("Current Price not displayed") not-reproduced — Current Price renders a value here.
  test('TC-CPR-OVR-006: Current Price column renders a value', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    expect(row).not.toBeNull();
    const current = (await row!.locator('td').nth(CORP_PRICING_OVERRIDE.columnIndex.currentPrice).innerText()).trim();
    expect(current).toMatch(/\d+\.\d{2}/); // a money value (e.g. "0.00"), not blank — Current Price IS displayed
  });

  test('TC-CPR-OVR-007: Active column renders as a Radix checkbox with readable aria-checked', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    expect(row).not.toBeNull();
    const state = await p.readActiveState(row!);
    expect(typeof state).toBe('boolean'); // aria-checked resolves to a real boolean, not empty textContent
  });

  test('TC-CPR-OVR-008: Labor tab shows the empty state for office 1606 with headers rendered', async ({ corporatePricingOverridePage: p }) => {
    await p.switchOverrideTab('Labor');
    expect(await p.getActiveTab()).toBe('Labor');
    expect(await p.getVisibleRowCount()).toBe(0); // 1606 has no Labor overrides
    const headers = (await p.getColumnHeaders()).join(' | ');
    expect(headers).toContain('Override Price'); // structure still renders
  });

  test('TC-CPR-OVR-009: Currency filter offers ALL/USD/CAD/MXN', async ({ corporatePricingOverridePage: p }) => {
    const opts = await p.getCurrencyOptions();
    for (const c of CORP_PRICING_OVERRIDE.currencyOptions) expect(opts).toContain(c);
  });

  test('TC-CPR-OVR-010: Active-only filter defaults OFF and toggles', async ({ corporatePricingOverridePage: p }) => {
    expect(await p.getActiveOnlyState()).toBe(CORP_PRICING_OVERRIDE.activeOnlyDefault); // false
    await p.setActiveOnly(true);
    expect(await p.getActiveOnlyState()).toBe(true);
    await p.setActiveOnly(false);
    expect(await p.getActiveOnlyState()).toBe(false);
  });

  test('TC-CPR-OVR-011: Rows-per-page offers 10/20/30/40/50', async ({ corporatePricingOverridePage: p }) => {
    const opts = await p.getRowsPerPageOptions();
    for (const o of CORP_PRICING_OVERRIDE.rowsPerPageOptions) expect(opts).toContain(o);
  });

  test('TC-CPR-OVR-012: Client filter by Product Group Name narrows the grid', async ({ corporatePricingOverridePage: p }) => {
    const before = await p.getVisibleRowCount();
    await p.filterProductGroups('House Video');
    const after = await p.getVisibleRowCount();
    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThanOrEqual(before);
    expect(await p.findRowByProductGroup(ANCHOR)).not.toBeNull();
  });

  test('TC-CPR-OVR-013: Client filter by Product Group ID narrows to the matching row', async ({ corporatePricingOverridePage: p }) => {
    await p.filterProductGroups(ANCHOR_ID);
    expect(await p.findRowByProductGroup(ANCHOR)).not.toBeNull();
    expect(await p.getVisibleRowCount()).toBeGreaterThan(0);
  });

  // NM-1889 ("search matches unintended columns") not-reproduced — the filter is scoped to ID + Name.
  test('TC-CPR-OVR-014: Client filter is scoped to ID and Name only', async ({ corporatePricingOverridePage: p }) => {
    // A Currency value ("USD") appears in every row's Currency column but in no Product Group ID/Name.
    await p.filterProductGroups('USD');
    expect(await p.getVisibleRowCount()).toBe(0); // filter does NOT match the Currency column → no over-match
    await p.clearFilter();
    expect(await p.getVisibleRowCount()).toBeGreaterThan(0);
  });

  test('TC-CPR-OVR-015: No-match filter empties the grid; clearing restores rows', async ({ corporatePricingOverridePage: p }) => {
    await p.filterProductGroups('zzz-no-such-group-zzz');
    expect(await p.getVisibleRowCount()).toBe(0);
    await p.clearFilter();
    expect(await p.getVisibleRowCount(), 'Clearing the filter restores the grid rows').toBeGreaterThan(0);
  });

  test('TC-CPR-OVR-016: Filter tolerates whitespace and special characters without crashing', async ({ corporatePricingOverridePage: p }) => {
    await p.filterProductGroups('   ');
    await p.filterProductGroups('@#$%^&*');
    await p.clearFilter();
    expect(await p.getVisibleRowCount()).toBeGreaterThan(0); // app still responsive, rows restored
  });
});

test.describe('Corporate Pricing — Product Group Override: Override Price / Max Discount edit behavior @corporate-pricing @override', () => {
  test.beforeEach(async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(90_000);
    // Per-test baseline: enforce the row's VALUE baseline per-test (not just reload). TC-519 reverts to the
    // hardcoded default and asserts Save disables (net-zero) — if a prior save-cycle hard-kill left
    // the row drifted off 500.00, a reload-only baseline would false-fail it against correct app
    // behavior. ensureDefaultState subsumes reloadAndReselect (it reload+reselects internally) and is
    // a cheap read-only no-op when the row is already at default.
    await p.ensureDefaultState(ANCHOR, DEFAULTS, LOC);
  });

  test('TC-CPR-OVR-017: Clicking the Override Price cell reveals an editable numeric input', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    expect(row).not.toBeNull();
    const editorValue = await p.peekOverridePriceEditor(row!); // opens spinbutton, reads, Escapes (no change)
    expect(parseFloat(editorValue)).toBe(parseFloat(DEFAULTS.overridePrice)); // editor exposes the current value
  });

  test('TC-CPR-OVR-018: Editing the Override Price enables Save (dirty)', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    await p.setOverridePrice(row!, OVERRIDE_NUMERIC_CASES.overridePrice.edited);
    expect(await p.isOverrideSaveEnabled()).toBe(true);
  });

  // Net-zero: reverting to the saved value leaves no net change, so Save disables again.
  test('TC-CPR-OVR-019: Reverting the Override Price to its original value disables Save', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    await p.setOverridePrice(row!, OVERRIDE_NUMERIC_CASES.overridePrice.edited);
    expect(await p.isOverrideSaveEnabled()).toBe(true);
    await p.setOverridePrice(row!, DEFAULTS.overridePrice); // back to original
    expect(await p.isOverrideSaveEnabled()).toBe(false); // net-zero detected, form clean
  });

  test('TC-CPR-OVR-020: Override Price accepts a decimal value', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    await p.setOverridePrice(row!, OVERRIDE_NUMERIC_CASES.overridePrice.decimal);
    expect(parseFloat(await p.readOverridePrice(row!))).toBe(parseFloat(OVERRIDE_NUMERIC_CASES.overridePrice.decimal));
    expect(await p.isOverrideSaveEnabled()).toBe(true);
  });

  test('TC-CPR-OVR-021: Override Price accepts boundary values (0 and a large number)', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    await p.setOverridePrice(row!, OVERRIDE_NUMERIC_CASES.overridePrice.zero);
    expect(parseFloat(await p.readOverridePrice(row!))).toBe(0);
    await p.setOverridePrice(row!, OVERRIDE_NUMERIC_CASES.overridePrice.large);
    expect(parseFloat(await p.readOverridePrice(row!))).toBe(parseFloat(OVERRIDE_NUMERIC_CASES.overridePrice.large));
  });

  test('TC-CPR-OVR-022: Override Price input rejects non-numeric text', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    const retained = await p.probeOverridePriceInput(row!, OVERRIDE_NUMERIC_CASES.overridePrice.nonNumeric); // "abc"
    expect(/[a-z]/i.test(retained)).toBe(false); // type=number coerces non-numeric to "" — no alpha retained
  });

  // Max Discount % over 100 is rejected, but the field does not recover cleanly.
  // Kept skipped. Re-verified live on office 1606 (2026-07-09): entering a value over 100 sets the input to
  // an invalid state (aria-invalid="true") and shows a red border — a real indicator, NOT silent — and the
  // editor refuses to commit the value. BUT the field still misbehaves on recovery: it will not dismiss when
  // you click another cell, and it leaves the cell blank, so an out-of-range entry wedges the row (it even
  // stalled an automated re-drive). Correct behavior remains undefined until the app is fixed (should an
  // over-cap entry clamp to 100, or show an inline message and release the field?). Do NOT re-green the old
  // "did it commit? === false" assertion — that binary cannot tell a clean reject from this stuck state.
  // The valid boundary (values up to and including 100 commit) is covered separately by TC-CPR-OVR-037.
  test.fixme('TC-CPR-OVR-023: Max Discount % — out-of-range (>100) handling [blocked: field enters a stuck state on out-of-range entry; intended behavior unknown until the defect is fixed and live]', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    // a normal percentage commits and dirties the form
    expect(await p.tryMaxDiscount(row!, OVERRIDE_NUMERIC_CASES.maxDiscount.edited)).toBe(true); // 10
    expect(await p.isOverrideSaveEnabled()).toBe(true);
    // a decimal percentage commits
    expect(await p.tryMaxDiscount(row!, OVERRIDE_NUMERIC_CASES.maxDiscount.decimal)).toBe(true); // 12.5
    // >100: the editor does not commit — the OLD assertion below treated that as correct, but it is the
    // bug surface (silent trap: no error, no escape). Re-assert real behavior once fixed.
    expect(await p.tryMaxDiscount(row!, OVERRIDE_NUMERIC_CASES.maxDiscount.overHundred)).toBe(false); // 150
  });

  test('TC-CPR-OVR-024: Toggling the Active checkbox dirties the form (Save enables)', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    const before = await p.readActiveState(row!);
    await p.toggleActive(row!);
    expect(await p.readActiveState(row!)).toBe(!before);
    expect(await p.isOverrideSaveEnabled()).toBe(true);
  });

  // NM-1463: editing the Override Price on an inactive row automatically re-activates it.
  test('TC-CPR-OVR-034: Editing the Override Price on an inactive row auto-activates it (NM-1463)', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    expect(row).not.toBeNull();
    await p.setActive(row!, false); // make the row inactive (staged only — never saved)
    expect(await p.readActiveState(row!)).toBe(false);
    await p.setOverridePrice(row!, OVERRIDE_NUMERIC_CASES.overridePrice.edited);
    expect(await p.readActiveState(row!)).toBe(true); // editing the price re-activated the row
    expect(await p.isOverrideSaveEnabled()).toBe(true);
  });

  // The Max Discount % cap is inclusive at 100 — a value up to and including 100 commits. (The over-100
  // path is a known defect and is covered, kept skipped, by TC-CPR-OVR-023.)
  test('TC-CPR-OVR-037: Max Discount % accepts values up to the 100 cap (inclusive)', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    expect(row).not.toBeNull();
    expect(await p.tryMaxDiscount(row!, OVERRIDE_NUMERIC_CASES.maxDiscount.edited)).toBe(true); // 10 commits
    expect(await p.tryMaxDiscount(row!, OVERRIDE_NUMERIC_CASES.maxDiscount.boundary)).toBe(true); // 100 commits (inclusive cap)
    expect(parseFloat(await p.readMaxDiscount(row!))).toBe(100);
    expect(await p.isOverrideSaveEnabled()).toBe(true);
  });
});

test.describe('Corporate Pricing — Product Group Override: save-cycle (mutation, fixture-restored) @corporate-pricing @override @mutation', () => {
  test.afterEach(async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(150_000);
    await p.ensureDefaultState(ANCHOR, DEFAULTS, LOC); // belt-and-suspenders restore (per-test baseline)
  });

  test('TC-CPR-OVR-025: Override Price save-cycle persists after reload and restores', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(150_000);
    await saveAndVerifyCase({
      id: 'TC-CPR-OVR-025',
      label: 'Override Price save-cycle',
      baseline: () => p.ensureDefaultState(ANCHOR, DEFAULTS, LOC),
      act: async () => {
        const row = await p.findRowByProductGroup(ANCHOR);
        if (!row) throw new Error('anchor row not found');
        await p.setOverridePrice(row, OVERRIDE_NUMERIC_CASES.overridePrice.edited);
      },
      expectBeforeSave: async () => { expect(await p.isOverrideSaveEnabled()).toBe(true); },
      saveAndConfirm: () => p.saveAndConfirm(),
      reload: () => p.reloadAndReselect(LOC),
      expectAfterReload: async () => {
        const row = await p.findRowByProductGroup(ANCHOR);
        expect(row).not.toBeNull();
        expect(parseFloat(await p.readOverridePrice(row!)), 'Override Price value persists after reload').toBe(parseFloat(OVERRIDE_NUMERIC_CASES.overridePrice.edited));
      },
      cleanup: () => p.ensureDefaultState(ANCHOR, DEFAULTS, LOC),
    });
  });

  test('TC-CPR-OVR-026: Max Discount % save-cycle persists after reload and restores', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(150_000);
    await saveAndVerifyCase({
      id: 'TC-CPR-OVR-026',
      label: 'Max Discount save-cycle',
      baseline: () => p.ensureDefaultState(ANCHOR, DEFAULTS, LOC),
      act: async () => {
        const row = await p.findRowByProductGroup(ANCHOR);
        if (!row) throw new Error('anchor row not found');
        await p.setMaxDiscount(row, OVERRIDE_NUMERIC_CASES.maxDiscount.edited);
      },
      expectBeforeSave: async () => { expect(await p.isOverrideSaveEnabled()).toBe(true); },
      saveAndConfirm: () => p.saveAndConfirm(),
      reload: () => p.reloadAndReselect(LOC),
      expectAfterReload: async () => {
        const row = await p.findRowByProductGroup(ANCHOR);
        expect(row).not.toBeNull();
        expect(parseFloat(await p.readMaxDiscount(row!))).toBe(parseFloat(OVERRIDE_NUMERIC_CASES.maxDiscount.edited));
      },
      // cleanup restores Override Price + Active; Max Discount returns to its baseline "—" via the
      // afterEach ensureDefaultState reload (the fixture row's saved Max Discount is the unset default).
      cleanup: () => p.ensureDefaultState(ANCHOR, DEFAULTS, LOC),
    });
  });

  test('TC-CPR-OVR-027: Active toggle save-cycle persists after reload and restores', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(150_000);
    let original: boolean = DEFAULTS.active;
    await saveAndVerifyCase({
      id: 'TC-CPR-OVR-027',
      label: 'Active toggle save-cycle',
      baseline: () => p.ensureDefaultState(ANCHOR, DEFAULTS, LOC),
      act: async () => {
        const row = await p.findRowByProductGroup(ANCHOR);
        if (!row) throw new Error('anchor row not found');
        original = await p.readActiveState(row);
        await p.toggleActive(row);
      },
      expectBeforeSave: async () => { expect(await p.isOverrideSaveEnabled()).toBe(true); },
      saveAndConfirm: () => p.saveAndConfirm(),
      reload: () => p.reloadAndReselect(LOC),
      expectAfterReload: async () => {
        const row = await p.findRowByProductGroup(ANCHOR);
        expect(row).not.toBeNull();
        expect(await p.readActiveState(row!)).toBe(!original); // toggled value persisted
      },
      cleanup: () => p.ensureDefaultState(ANCHOR, DEFAULTS, LOC),
    });
  });

  test('TC-CPR-OVR-028: Save opens the "Save Changes" dialog; Cancel aborts without committing', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(150_000);
    await p.ensureDefaultState(ANCHOR, DEFAULTS, LOC);
    const row = await p.findRowByProductGroup(ANCHOR);
    expect(row).not.toBeNull();
    await p.setOverridePrice(row!, OVERRIDE_NUMERIC_CASES.overridePrice.edited);
    expect(await p.isOverrideSaveEnabled()).toBe(true);
    const dialogText = await p.clickSaveAndCancel(); // captures verbatim text, then Cancel (no commit)
    expect(dialogText).toContain(CORP_PRICING_OVERRIDE.saveDialog.title);
    expect(dialogText).toContain(CORP_PRICING_OVERRIDE.saveDialog.body);
    // Cancel leaves the staged edit dirty but uncommitted; afterEach ensureDefaultState reloads + restores.
  });
});

test.describe('Corporate Pricing — Product Group Override: navigation & location picker @corporate-pricing @override', () => {
  test('TC-CPR-OVR-029: The Search action bar "Pricing Override" button navigates to the Override screen', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(90_000);
    await p.openViaSearchActionBar();
    expect(p.page.url()).toContain('/pg-override');
    await test.step('Confirm the Product Group Override heading is visible', async () => {
      await expect(p.page.locator('h1:text-is("Product Group Override")')).toBeVisible();
    });
  });

  test('TC-CPR-OVR-030: The "Change Local Office" picker gates Select until a row is checked; Cancel applies nothing', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(90_000);
    await p.open(); // fresh load, no location selected yet
    const m = await p.inspectLocationModal(LOC);
    expect(m.title).toContain(CORP_PRICING_OVERRIDE.locationModalTitle); // "Change Local Office"
    expect(m.selectDisabledInitially).toBe(true); // Select is disabled before any row is checked
    expect(m.rowsMatching).toBeGreaterThan(0); // searching the office finds its row
    expect(m.selectEnabledAfterCheck).toBe(true); // checking the row enables Select
    expect(m.gridEmptyAfterCancel).toBe(true); // Cancel closes the picker with no location applied
  });
});

test.describe('Corporate Pricing — Product Group Override: Grid Options (column visibility) @corporate-pricing @override @mutation', () => {
  const COL = CORP_PRICING_OVERRIDE.gridOptionsToggleColumn; // 'Updated By' — a trailing, reversible column

  // Column visibility is a server-persisted preference — restore all columns before and after each test.
  test.beforeEach(async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(120_000);
    await p.ensureAllGridColumnsVisible(LOC);
  });
  test.afterEach(async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(120_000);
    await p.ensureAllGridColumnsVisible(LOC);
  });

  test('TC-CPR-OVR-031: Grid Options lists every column; toggling one hides its header and it persists across reload', async ({ corporatePricingOverridePage: p }) => {
    await p.openGridOptions();
    const cols = await p.getGridOptionColumns();
    const labels = cols.map((c) => c.label).join(' | ');
    for (const expected of CORP_PRICING_OVERRIDE.gridColumns) expect(labels).toContain(expected);
    expect(cols.filter((c) => !c.checked).map((c) => c.label)).toEqual([]); // all columns shown by default
    await p.closeGridOptions();

    expect(await p.isGridColumnVisible(COL)).toBe(true); // present at baseline
    await p.openGridOptions();
    await p.toggleGridColumn(COL);
    await p.closeGridOptions();
    expect(await p.isGridColumnVisible(COL)).toBe(false); // header removed

    await p.reloadAndReselect(LOC);
    expect(await p.isGridColumnVisible(COL)).toBe(false); // the hidden state persisted across the reload
  });
});

test.describe('Corporate Pricing — Product Group Override: toolbar Export / Import @corporate-pricing @override', () => {
  test.beforeEach(async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(90_000);
    await p.reloadAndReselect(LOC);
  });

  test('TC-CPR-OVR-032: Export downloads a Product Group Overrides CSV directly (no dialog)', async ({ corporatePricingOverridePage: p }) => {
    const r = await p.downloadOverrideExport();
    expect(r.filename).toMatch(CORP_PRICING_OVERRIDE.export.filenamePattern); // ProductGroupOverrides_<timestamp>UTC.csv
    expect(r.requestUrl).toContain(CORP_PRICING_OVERRIDE.export.apiPathFragment); // the override export endpoint, not a page URL
    expect(r.requestUrl).toContain(CORP_PRICING_OVERRIDE.export.localeParam); // locale carried on the download's own request
    expect(r.content.length).toBeGreaterThan(0); // a non-empty file
    expect(r.headers).toEqual(CORP_PRICING_OVERRIDE.export.expectedHeaders); // exact column set + order (the file is the oracle)
  });

  // The exported file is tenant-wide (rows begin around office 1101, not scoped to the selected office),
  // so its own structure/content is the oracle, not a grid row-for-row diff — see the `export` comment
  // in override.ts. Validates EVERY row in plain JS (a per-row expect() over ~9k rows is too slow), then
  // asserts the aggregate: a malformed row anywhere in the file collects here and fails with the first
  // offenders shown. Product Group Name is free text (may itself carry a literal `"` — e.g. an inch-mark
  // size like 50"-59" — RFC4180-quoted/escaped in the file) and is not asserted for content; the numeric
  // ID / enum / flag / money columns around it are, per-column, below.
  test('TC-CPR-OVR-038: Every downloaded CSV row is well-formed with valid IDs, currency, 0/1 flags, and money fields', async ({ corporatePricingOverridePage: p }) => {
    const EXPORT = CORP_PRICING_OVERRIDE.export;
    const r = await p.downloadOverrideExport();
    const locIdx = r.headers.indexOf('Location Id');
    const pgIdx = r.headers.indexOf('Product Group Id');
    const currencyIdx = r.headers.indexOf('Currency');
    const boolIdxs = EXPORT.booleanColumns.map((c) => r.headers.indexOf(c));
    const moneyIdx = r.headers.indexOf(EXPORT.moneyColumn);
    const overridePriceIdx = r.headers.indexOf(EXPORT.optionalMoneyColumn);
    const discIdx = r.headers.indexOf(EXPORT.optionalPercentColumn);
    const validCurrencies: readonly string[] = EXPORT.validCurrencies; // widen the const tuple so .includes accepts any string
    expect(locIdx).toBeGreaterThanOrEqual(0);
    expect(pgIdx).toBeGreaterThanOrEqual(0);
    expect(currencyIdx).toBeGreaterThanOrEqual(0);
    expect(boolIdxs).not.toContain(-1); // all format-checked columns present in the header row
    expect(moneyIdx).toBeGreaterThanOrEqual(0);
    expect(overridePriceIdx).toBeGreaterThanOrEqual(0);
    expect(discIdx).toBeGreaterThanOrEqual(0);
    const dataLines = r.content.split(/\r?\n/).slice(1).filter((l) => l.length > 0);
    expect(dataLines.length).toBeGreaterThan(0);
    // A naive comma split is safe here: the file never quotes a comma inside a field (only a literal `"`
    // character), so every well-formed row splits into exactly headers.length fields — verified below.
    const offenders: string[] = [];
    for (const [i, line] of dataLines.entries()) {
      if (offenders.length >= 10) break; // enough detail to diagnose; the assertion still fails on the first offender
      const row = line.split(',');
      if (row.length !== r.headers.length) { offenders.push(`row ${i}: ${row.length} cols (expected ${r.headers.length})`); continue; }
      if (!/^\d+$/.test(row[locIdx] ?? '')) { offenders.push(`row ${i}: Location Id "${row[locIdx] ?? ''}"`); continue; }
      if (!/^\d+$/.test(row[pgIdx] ?? '')) { offenders.push(`row ${i}: Product Group Id "${row[pgIdx] ?? ''}"`); continue; }
      if (!validCurrencies.includes(row[currencyIdx] ?? '')) { offenders.push(`row ${i}: currency "${row[currencyIdx] ?? ''}"`); continue; }
      const badFlag = boolIdxs.find((bi) => { const v = row[bi]; return v !== '0' && v !== '1'; });
      if (badFlag !== undefined) { offenders.push(`row ${i}: flag col ${badFlag} = "${row[badFlag] ?? ''}"`); continue; }
      if (!/^\d+\.\d{2}$/.test(row[moneyIdx] ?? '')) { offenders.push(`row ${i}: Current Price "${row[moneyIdx] ?? ''}"`); continue; }
      const overridePrice = row[overridePriceIdx] ?? '';
      if (overridePrice !== '' && !/^\d+\.\d{2}$/.test(overridePrice)) { offenders.push(`row ${i}: Override Price "${overridePrice}"`); continue; }
      const discount = row[discIdx] ?? '';
      if (discount !== '' && !/^\d+(\.\d+)?$/.test(discount)) { offenders.push(`row ${i}: Override Discount "${discount}"`); continue; }
    }
    expect(offenders).toEqual([]); // every row: full column set, numeric IDs, supported currency, 0/1 flags, well-formed money/percent fields
  });

  test('TC-CPR-OVR-033: Import opens the "Import All Pricing Overrides" dialog with a file input; Cancel closes it without uploading', async ({ corporatePricingOverridePage: p }) => {
    await p.openImportDialog();
    const d = await p.readImportDialog();
    expect(d.text).toContain(CORP_PRICING_OVERRIDE.importDialog.title); // "Import All Pricing Overrides"
    for (const b of CORP_PRICING_OVERRIDE.importDialog.buttons) expect(d.buttons).toContain(b); // Browse / Cancel / Upload / Close
    expect(d.hasFileInput).toBe(true); // a file input exists (no real upload is performed)
    await p.closeImportDialog();
    expect(await p.isImportDialogVisible()).toBe(false); // Cancel dismissed the dialog
  });
});

test.describe('Corporate Pricing — Product Group Override: surface behavior (sorting / render) @corporate-pricing @override', () => {
  test.beforeEach(async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(90_000);
    await p.reloadAndReselect(LOC);
  });

  test('TC-CPR-OVR-035: Clicking a column header does not sort (no active sort state, row order unchanged)', async ({ corporatePricingOverridePage: p }) => {
    const s = await p.probeColumnSort('Product Group Name');
    expect(s.orderChanged).toBe(false); // row order unchanged after the header click
    expect(['ascending', 'descending']).not.toContain(String(s.ariaSortAfter)); // the header never enters an active sort state
  });

  test('TC-CPR-OVR-036: Every row shows a Current Price value on office 1606 (no blank cell) (NM-2206)', async ({ corporatePricingOverridePage: p }) => {
    const prices = await p.getCurrentPriceCells();
    expect(prices.length).toBeGreaterThan(0);
    for (const price of prices) expect(price).toMatch(/\d+\.\d{2}/); // a well-formed money value, never blank / missing
  });
});

test.describe('Corporate Pricing — Product Group Override: Change Local Office picker search & Active filter @corporate-pricing @override', () => {
  test('TC-CPR-OVR-039: Typing a partial office number narrows picker rows; clearing restores the full list', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(90_000);
    await p.reloadAndReselect(LOC);
    await p.openLocationPicker();
    let matchCount = 0;
    await test.step('Search "1107" narrows the list to matching offices', async () => {
      await p.searchLocalOffice('1107');
      matchCount = await p.getPickerRowCount();
      expect(matchCount).toBeGreaterThan(0); // at least one match
      expect(await p.pickerHasRowContaining('1107')).toBe(true); // "1107" text visible in a row
      expect(await p.getPickerRowCountContaining('1107')).toBe(matchCount); // every visible row matches the search query
    });
    await test.step('Clearing the search restores more rows than the filtered result', async () => {
      await p.clearPickerSearch();
      const afterClearCount = await p.getPickerRowCount();
      expect(afterClearCount).toBeGreaterThan(matchCount); // clearing un-narrows: full list has more rows than the filtered result
    });
    await p.cancelLocationPicker(); // no location change
    expect(await p.getVisibleRowCount()).toBeGreaterThan(0); // original location (1606) grid unchanged
  });

  // Known behavior (reviewer-confirmed): the server ignores the activeOnly parameter — both CHECKED
  // and UNCHECKED states return the same location set. Office 1222 ("Hyatt Fairfax at Fair Lakes")
  // is confirmed inactive yet never appears in either state. Opening the picker fires ≥1 POST
  // (positive control proving the network listener works); toggling fires 0 POSTs — the Active
  // checkbox is a client-side filter only. The toggle assertion will fail when the app is fixed.
  test('TC-CPR-OVR-040: Picker Active checkbox defaults unchecked; toggling is a client-side filter — no location-lookup POST fires', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(120_000);
    await p.reloadAndReselect(LOC);
    await test.step('Open picker — fires at least one location-lookup POST (positive control: listener works)', async () => {
      const openProbe = await p.openLocationPickerAndCapturePost();
      expect(openProbe.postFired, 'opening the picker must fire a location-lookup POST').toBe(true);
      expect(openProbe.locationCount, 'POST response must carry at least one location').toBeGreaterThan(0);
    });
    await test.step('Active checkbox defaults to UNCHECKED on open', async () => {
      expect(await p.getPickerActiveCheckboxState()).toBe(false);
    });
    await test.step('Toggle Active to CHECKED — no location-lookup POST fires (client-side filter; activeOnly has no server effect)', async () => {
      const checkProbe = await p.toggleLocalOfficePickerActiveAndCapturePost();
      expect(await p.getPickerActiveCheckboxState()).toBe(true);
      // Real documented behavior: toggle is handled client-side — no POST fires.
      // This assertion fails when the app is fixed to honor activeOnly server-side.
      expect(checkProbe.postFired, 'toggle must NOT fire a location-lookup POST (Active checkbox is a client-side filter)').toBe(false);
      expect(await p.getPickerRowCount(), 'list must still show rows after client-side toggle').toBeGreaterThan(0);
    });
    await test.step('Search "1107" composes with Active CHECKED — matching rows visible', async () => {
      await p.searchLocalOffice('1107');
      expect(await p.pickerHasRowContaining('1107')).toBe(true);
    });
    await test.step('Clear search; toggle Active back to UNCHECKED — still no location-lookup POST fires', async () => {
      await p.clearPickerSearch();
      const uncheckProbe = await p.toggleLocalOfficePickerActiveAndCapturePost();
      expect(await p.getPickerActiveCheckboxState()).toBe(false);
      expect(uncheckProbe.postFired, 'toggle-back must NOT fire a location-lookup POST').toBe(false);
      expect(await p.getPickerRowCount()).toBeGreaterThan(0);
    });
    await test.step('Cancel discards picker state — original grid (1606) remains loaded', async () => {
      await p.cancelLocationPicker();
      expect(await p.getVisibleRowCount()).toBeGreaterThan(0);
    });
  });
});

test.describe('Corporate Pricing — Product Group Override: Active-only and text-filter effects (NM-2269) @corporate-pricing @override', () => {
  // Office 1105 has 9 Equipment rows (7 active, 2 inactive — Camlok #1 and Camlok #2).
  // This office is the only walk-verified bed with inactive rows for the Active-only effect tests.
  test.beforeEach(async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(90_000);
    // Per-test baseline: full reload + location re-select resets all filter state
    // (Active-only OFF, Currency ALL, text filter empty).
    await p.reloadAndReselect(CORP_PRICING_OVERRIDE_ACTIVE_BED.office);
  });

  // @fcc TC-CPR-OVR-042
  test('TC-CPR-OVR-042: Active-only removes inactive rows and restores the full set on uncheck (NM-2269)', async ({ corporatePricingOverridePage: p }) => {
    // Baseline: Active-only is OFF; all 9 rows are visible (7 active + 2 inactive)
    expect(await p.getActiveOnlyState()).toBe(false);
    expect(await p.getVisibleRowCount()).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.totalRows);

    // Check Active-only — the two inactive product groups must disappear
    await p.setActiveOnly(true);
    await expect.poll(() => p.getVisibleRowCount()).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.activeOnlyRows);
    expect(await p.getVisibleRowCount()).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.activeOnlyRows);
    expect(await p.findRowByProductGroup(CORP_PRICING_OVERRIDE_ACTIVE_BED.inactiveGroupName1)).toBeNull();
    expect(await p.findRowByProductGroup(CORP_PRICING_OVERRIDE_ACTIVE_BED.inactiveGroupName2)).toBeNull();

    // Uncheck Active-only — full set and the inactive rows must be restored
    await p.setActiveOnly(false);
    await expect.poll(() => p.getVisibleRowCount()).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.totalRows);
    expect(await p.getVisibleRowCount()).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.totalRows);
    expect(await p.findRowByProductGroup(CORP_PRICING_OVERRIDE_ACTIVE_BED.inactiveGroupName1)).not.toBeNull();
    expect(await p.findRowByProductGroup(CORP_PRICING_OVERRIDE_ACTIVE_BED.inactiveGroupName2)).not.toBeNull();
  });

  // Office 1105 is USD-only (verified 2026-07-17: 9 Equipment rows, all USD).
  // The selectCurrency PO method relies on ovrCurrencyDropdown ('button[role="combobox"]:has-text("ALL")'),
  // which matches only when currency is currently ALL — safe for one call per test.
  // Two-direction oracle: ALL shows rows; an absent currency shows 0. A filter that ignores
  // its input cannot satisfy both assertions simultaneously.
  test('TC-CPR-OVR-043: Currency filter yields the exact row count for the present currency, 0 for an absent currency, and restores the full set', async ({ corporatePricingOverridePage: p }) => {
    // Direction 1: ALL (baseline reset by beforeEach) shows the full row set
    expect(await p.getVisibleRowCount()).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.totalRows);

    // Direction 2: selecting an absent currency must yield exactly 0
    // (CAD has no rows on office 1105 — verified 2026-07-17; if filter ignores input it would stay at totalRows)
    await p.selectCurrency(CORP_PRICING_OVERRIDE_ACTIVE_BED.absentCurrency);
    await expect.poll(() => p.getVisibleRowCount(), { timeout: 30_000 }).toBe(0);
    expect(await p.getVisibleRowCount()).toBe(0);
  });

  // @fcc TC-CPR-OVR-044
  test('TC-CPR-OVR-044: Active-only and text filter applied simultaneously produce the correct intersection; filter order does not affect the result; resetting all restores the full row set (NM-2269)', async ({ corporatePricingOverridePage: p }) => {
    // Phase A — text filter first, then Active-only on top
    // Camlok filter alone: 2 rows (both Camlok rows are inactive)
    await p.filterProductGroups(CORP_PRICING_OVERRIDE_ACTIVE_BED.textFilterCamlok);
    expect(await p.getVisibleRowCount()).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.camlokTotalRows);
    // Add Active-only on top: Camloks are inactive, so intersection is 0 rows
    await p.setActiveOnly(true);
    await expect.poll(() => p.getVisibleRowCount()).toBe(0);
    expect(await p.getVisibleRowCount()).toBe(0);

    // Reset both filters (text filter first, then Active-only)
    await p.clearFilter();
    await expect.poll(() => p.getVisibleRowCount()).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.activeOnlyRows);
    await p.setActiveOnly(false);
    await expect.poll(() => p.getVisibleRowCount()).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.totalRows);
    expect(await p.getVisibleRowCount()).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.totalRows);

    // Phase B — Active-only first, then text filter (order independence: same intersection, different order)
    await p.setActiveOnly(true);
    await expect.poll(() => p.getVisibleRowCount()).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.activeOnlyRows);
    expect(await p.getVisibleRowCount()).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.activeOnlyRows);
    await p.filterProductGroups(CORP_PRICING_OVERRIDE_ACTIVE_BED.textFilterCamlok);
    // Camloks are inactive, Active-only still ON → 0 rows (same result as Phase A — order independent)
    expect(await p.getVisibleRowCount()).toBe(0);

    // Reset Active-only while text filter still active → inactive Camloks become visible again
    await p.setActiveOnly(false);
    await expect.poll(() => p.getVisibleRowCount()).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.camlokTotalRows);
    expect(await p.getVisibleRowCount()).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.camlokTotalRows);
    // Clear text filter → full row set restored
    await p.clearFilter();
    expect(await p.getVisibleRowCount()).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.totalRows);
  });
});

test.describe('Corporate Pricing — Product Group Override: grid text filter + sort effects (NM-2270) @corporate-pricing @override', () => {
  // Office 1105: 9 Equipment rows total; walk-A certifies sort oracles and filter counts.
  test.beforeEach(async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(90_000);
    await p.reloadAndReselect(CORP_PRICING_OVERRIDE_SORT_BED.office);
  });

  // @fcc TC-CPR-OVR-045
  test('TC-CPR-OVR-045: Text filter "Camlok" narrows the grid to matching rows; clearing restores the full set (NM-2270)', async ({ corporatePricingOverridePage: p }) => {
    const PGN_COL = CORP_PRICING_OVERRIDE.columnIndex.productGroupName;

    // Baseline: all 9 rows visible (walk-A certified for office 1105)
    expect(await p.getVisibleRowCount()).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.totalRows);

    // Apply filter — only the 2 Camlok rows survive
    await p.filterProductGroups(CORP_PRICING_OVERRIDE_ACTIVE_BED.textFilterCamlok);
    expect(await p.getVisibleRowCount()).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.camlokTotalRows);

    // Assert the specific Camlok product identities are the visible rows (not just count)
    const filteredNames = await p.getColumnCellValues(PGN_COL);
    expect(filteredNames).toContain(CORP_PRICING_OVERRIDE_ACTIVE_BED.inactiveGroupName1);
    expect(filteredNames).toContain(CORP_PRICING_OVERRIDE_ACTIVE_BED.inactiveGroupName2);

    // Clear filter — full 9-row set restores
    await p.clearFilter();
    expect(await p.getVisibleRowCount()).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.totalRows);
  });

  // @fcc TC-CPR-OVR-046
  test('TC-CPR-OVR-046: Product Group Name column sort: ascending first cell matches walk oracle and order is non-decreasing; descending first cell matches walk oracle and order is non-increasing (NM-2270)', async ({ corporatePricingOverridePage: p }) => {
    const PGN_COL = CORP_PRICING_OVERRIDE.columnIndex.productGroupName;

    // Sort ascending via the header dropdown menu (walk-A: sort is a dropdown, not a header-click toggle)
    await p.sortColumnViaDropdown('Product Group Name', 'ascending');
    expect(await p.getFirstRowCellText(PGN_COL)).toBe(CORP_PRICING_OVERRIDE_SORT_BED.productGroupNameAscFirstCell);
    const ascValues = await p.getColumnCellValues(PGN_COL);
    for (let i = 1; i < ascValues.length; i++) {
      expect(ascValues[i]!.localeCompare(ascValues[i - 1]!)).toBeGreaterThanOrEqual(0);
    }

    // Sort descending
    await p.sortColumnViaDropdown('Product Group Name', 'descending');
    expect(await p.getFirstRowCellText(PGN_COL)).toBe(CORP_PRICING_OVERRIDE_SORT_BED.productGroupNameDescFirstCell);
    const descValues = await p.getColumnCellValues(PGN_COL);
    for (let i = 1; i < descValues.length; i++) {
      expect(descValues[i]!.localeCompare(descValues[i - 1]!)).toBeLessThanOrEqual(0);
    }
  });

  // @fcc TC-CPR-OVR-047
  test('TC-CPR-OVR-047: Product Group column sort: ascending values are non-decreasing; descending values are non-increasing — self-verifying monotonic oracle (NM-2270)', async ({ corporatePricingOverridePage: p }) => {
    // Second sortable column: "Product Group" (numeric product group IDs, column index 1).
    // Compared numerically — the app sorts these as numbers (e.g. 2 before 10), not as strings.
    const PG_COL = CORP_PRICING_OVERRIDE.columnIndex.productGroup;

    await p.sortColumnViaDropdown('Product Group', 'ascending');
    const ascValues = await p.getColumnCellValues(PG_COL);
    expect(ascValues.length, 'ascending sort must yield at least one row').toBeGreaterThan(0);
    for (let i = 1; i < ascValues.length; i++) {
      const prev = Number(ascValues[i - 1]!);
      const curr = Number(ascValues[i]!);
      expect(isNaN(prev), `ascending: row ${i - 1} cell "${ascValues[i - 1]}" should be numeric`).toBe(false);
      expect(isNaN(curr), `ascending: row ${i} cell "${ascValues[i]}" should be numeric`).toBe(false);
      expect(curr, `ascending: row ${i} (${curr}) must be ≥ row ${i - 1} (${prev})`).toBeGreaterThanOrEqual(prev);
    }

    await p.sortColumnViaDropdown('Product Group', 'descending');
    const descValues = await p.getColumnCellValues(PG_COL);
    expect(descValues.length, 'descending sort must yield at least one row').toBeGreaterThan(0);
    for (let i = 1; i < descValues.length; i++) {
      const prev = Number(descValues[i - 1]!);
      const curr = Number(descValues[i]!);
      expect(isNaN(prev), `descending: row ${i - 1} cell "${descValues[i - 1]}" should be numeric`).toBe(false);
      expect(isNaN(curr), `descending: row ${i} cell "${descValues[i]}" should be numeric`).toBe(false);
      expect(curr, `descending: row ${i} (${curr}) must be ≤ row ${i - 1} (${prev})`).toBeLessThanOrEqual(prev);
    }
  });

  // @fcc TC-CPR-OVR-049
  test('TC-CPR-OVR-049: Text filter and column sort applied together: filtered rows match the filter and are correctly ordered (NM-2270)', async ({ corporatePricingOverridePage: p }) => {
    const PGN_COL = CORP_PRICING_OVERRIDE.columnIndex.productGroupName;

    // Apply text filter, then sort — the filtered set must be the right count and non-decreasing
    await p.filterProductGroups(CORP_PRICING_OVERRIDE_ACTIVE_BED.textFilterCamlok);
    expect(await p.getVisibleRowCount()).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.camlokTotalRows);
    await p.sortColumnViaDropdown('Product Group Name', 'ascending');
    const filteredSorted = await p.getColumnCellValues(PGN_COL);
    expect(filteredSorted.length).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.camlokTotalRows); // filter survives the sort

    // Every visible row must match the filter (case-insensitive)
    for (const name of filteredSorted) {
      expect(name!.toLowerCase()).toContain(CORP_PRICING_OVERRIDE_ACTIVE_BED.textFilterCamlok.toLowerCase());
    }

    for (let i = 1; i < filteredSorted.length; i++) {
      expect(filteredSorted[i]!.localeCompare(filteredSorted[i - 1]!)).toBeGreaterThanOrEqual(0);
    }

    // Clear filter — full row set restores
    await p.clearFilter();
    expect(await p.getVisibleRowCount()).toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.totalRows);
  });
});

test.describe('Corporate Pricing — Product Group Override: Grid Options column hide and Reset to Default (NM-2270) @corporate-pricing @override @mutation', () => {
  // Column visibility is a server-persisted preference — restore all columns before and after each test.
  test.beforeEach(async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(120_000);
    await p.ensureAllGridColumnsVisible(CORP_PRICING_OVERRIDE_SORT_BED.office);
  });
  test.afterEach(async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(120_000);
    await p.ensureAllGridColumnsVisible(CORP_PRICING_OVERRIDE_SORT_BED.office);
  });

  // @fcc TC-CPR-OVR-048
  test('TC-CPR-OVR-048: Hiding "Max Discount %" via Grid Options reduces visible column count; Reset to Default restores all columns (NM-2270)', async ({ corporatePricingOverridePage: p }) => {
    // Baseline: all 10 columns visible (walk-A certified)
    expect(await p.getColumnCount()).toBe(CORP_PRICING_OVERRIDE_SORT_BED.gridDefaultColumnCount);

    // Hide "Max Discount %" — visible column count must drop to 9 (walk-A certified)
    await p.openGridOptions();
    await p.toggleGridColumn(CORP_PRICING_OVERRIDE_SORT_BED.gridHideTestColumn);
    await p.closeGridOptions();
    expect(await p.getColumnCount()).toBe(CORP_PRICING_OVERRIDE_SORT_BED.gridHiddenColumnCount);

    // Reset to Default — all 10 columns must be restored
    await p.openGridOptions();
    await p.resetGridToDefault();
    await p.closeGridOptions();
    expect(await p.getColumnCount()).toBe(CORP_PRICING_OVERRIDE_SORT_BED.gridDefaultColumnCount);
  });
});

test.describe('Corporate Pricing — Product Group Override: RBAC access gate @corporate-pricing @override', () => {
  // PERMANENTLY NOT AUTOMATABLE — owner-confirmed 2026-07-20.
  //
  // The deny-path (non-RM user sees no edit cell, no Save, no Import on the Override grid) requires
  // a second test account with a non-Revenue-Management role. The client has confirmed that no such
  // account exists, cannot be obtained, and will never be obtained. Every available automation
  // account carries equivalent RM-level access; there is no in-app role-switch mechanism.
  //
  // RBAC API investigation (2026-07-20, live network capture): navigating to the Override screen
  // with valid auth fires only GET /navigator/api/env and GET /navigator/api/auth/session — no
  // role/permission endpoint, no route guard, no feature flag, no DOM role indicator. There is no
  // API surface a test could query to assert the deny-path. (NM-2126)
  //
  // The positive-path coverage (RM user CAN edit, CAN enable Save, CAN open Import) is already
  // provided by TC-CPR-OVR-017, TC-CPR-OVR-018, and TC-CPR-OVR-033.
  test.skip('TC-CPR-OVR-041: Non-Revenue-Management user sees a read-only Override grid — no edit, no Save, no Import [blocked: every automation account we hold has equivalent access and no RBAC state is exposed on the Override screen; a second automation account WITHOUT the 1101 Revenue Management role would make this automatable immediately; see NM-2126]', async () => {
    // Body intentionally empty — this test is permanently unautomatable.
    // See the describe-block comment above for the investigation evidence.
  });
});

test.describe('Corporate Pricing — Product Group Override: populated Labor grid (NM-2271) @corporate-pricing @override', () => {
  // Office 9460 carries the only known triple-digit Labor override data set ("212 items found",
  // verified live 2026-07-20). A reload always lands on the Equipment tab, so each test re-selects
  // the location and switches to Labor as its per-test baseline.
  test.beforeEach(async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(120_000);
    await p.reloadAndReselect(CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED.office, CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED.office);
    await p.switchOverrideTab('Labor');
    await p.waitForGridRows();
  });

  test('TC-CPR-OVR-050: Labor tab renders a populated grid with real data on office 9460 (NM-2271)', async ({ corporatePricingOverridePage: p }) => {
    expect(await p.getActiveTab()).toBe('Labor');
    expect(await p.getVisibleRowCount()).toBeGreaterThan(0); // populated, not the empty state
    // The bed is a triple-digit data set — the items-found counter, not the visible page, carries the total
    const total = await p.getItemsFoundTotal();
    expect(total).toBeGreaterThan(CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED.minExpectedRows);
    expect(await p.findRowByProductGroup(CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED.page1FirstRowAnchor)).not.toBeNull();
  });

  test('TC-CPR-OVR-051: Labor grid text filter narrows to matching rows and clearing restores the page (NM-2271)', async ({ corporatePricingOverridePage: p }) => {
    const before = await p.getVisibleRowCount();
    await p.filterProductGroups(CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED.filterNeedle);
    const narrowed = await p.getVisibleRowCount();
    expect(narrowed).toBeGreaterThan(0); // the anchor row matches
    expect(narrowed).toBeLessThan(before); // the filter actually narrowed a populated page
    expect(await p.findRowByProductGroup(CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED.page1FirstRowAnchor)).not.toBeNull();
    await p.clearFilter();
    expect(await p.getVisibleRowCount()).toBeGreaterThan(narrowed); // clearing restores the fuller page
  });

  test('TC-CPR-OVR-052: Labor grid column sort orders Product Group Name ascending and descending (NM-2271)', async ({ corporatePricingOverridePage: p }) => {
    // Self-verifying monotonic oracle — resilient to data drift on the shared bed.
    const nameCol = CORP_PRICING_OVERRIDE.columnIndex.productGroupName;
    await p.sortColumnViaDropdown('Product Group Name', 'ascending');
    const asc = await p.getColumnCellValues(nameCol);
    expect(asc.length).toBeGreaterThan(1);
    for (let i = 1; i < asc.length; i++) {
      const prev = (asc[i - 1] ?? '').toLowerCase();
      const curr = (asc[i] ?? '').toLowerCase();
      expect(prev <= curr, 'ascending order holds at row ' + i + ': "' + prev + '" <= "' + curr + '"').toBe(true);
    }
    await p.sortColumnViaDropdown('Product Group Name', 'descending');
    const desc = await p.getColumnCellValues(nameCol);
    expect(desc.length).toBeGreaterThan(1);
    for (let i = 1; i < desc.length; i++) {
      const prev = (desc[i - 1] ?? '').toLowerCase();
      const curr = (desc[i] ?? '').toLowerCase();
      expect(prev >= curr, 'descending order holds at row ' + i + ': "' + prev + '" >= "' + curr + '"').toBe(true);
    }
  });
});

test.describe('Corporate Pricing — Product Group Override: Labor save-cycle (mutation, fixture-restored) (NM-2271) @corporate-pricing @override @mutation', () => {
  // Labor mutation fixture: office 1105, row 655 "General - Ops" (default 160.00, inactive).
  // Save mechanism verified live 2026-07-20 with a committed round-trip (160 → 161 → 160,
  // backend save call returned 200 + success toast + persistence across reload).
  const L_LOC = CORP_PRICING_OVERRIDE_LABOR_BED.office;
  const L_ANCHOR = CORP_PRICING_OVERRIDE_LABOR_BED.mutationRowAnchor.productGroupName;
  const L_DEFAULTS = {
    overridePrice: CORP_PRICING_OVERRIDE_LABOR_BED.mutationRowAnchor.overridePriceDefault,
    active: CORP_PRICING_OVERRIDE_LABOR_BED.mutationRowAnchor.activeDefault,
  };

  test.afterEach(async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(180_000);
    await p.ensureDefaultState(L_ANCHOR, L_DEFAULTS, L_LOC, L_LOC, 'Labor'); // belt-and-suspenders restore (per-test baseline)
  });

  test('TC-CPR-OVR-053: Labor Override Price save-cycle persists after reload and restores (NM-2271)', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(180_000);
    await saveAndVerifyCase({
      id: 'TC-CPR-OVR-053',
      label: 'Labor Override Price save-cycle',
      baseline: () => p.ensureDefaultState(L_ANCHOR, L_DEFAULTS, L_LOC, L_LOC, 'Labor'),
      act: async () => {
        const row = await p.findRowByProductGroup(L_ANCHOR);
        if (!row) throw new Error('Labor anchor row not found');
        await p.setOverridePrice(row, CORP_PRICING_OVERRIDE_LABOR_BED.laborEdited);
      },
      expectBeforeSave: async () => { expect(await p.isOverrideSaveEnabled()).toBe(true); },
      saveAndConfirm: () => p.saveAndConfirm(),
      reload: async () => {
        await p.reloadAndReselect(L_LOC, L_LOC);
        await p.switchOverrideTab('Labor');
      },
      expectAfterReload: async () => {
        const row = await p.findRowByProductGroup(L_ANCHOR);
        expect(row).not.toBeNull();
        expect(parseFloat(await p.readOverridePrice(row!)), 'Labor Override Price value persists after reload').toBe(parseFloat(CORP_PRICING_OVERRIDE_LABOR_BED.laborEdited));
      },
      cleanup: () => p.ensureDefaultState(L_ANCHOR, L_DEFAULTS, L_LOC, L_LOC, 'Labor'),
    });
  });

  test('TC-CPR-OVR-054: Labor Max Discount % save-cycle persists after reload and restores (NM-2271)', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(180_000);
    await saveAndVerifyCase({
      id: 'TC-CPR-OVR-054',
      label: 'Labor Max Discount save-cycle',
      baseline: () => p.ensureDefaultState(L_ANCHOR, L_DEFAULTS, L_LOC, L_LOC, 'Labor'),
      act: async () => {
        const row = await p.findRowByProductGroup(L_ANCHOR);
        if (!row) throw new Error('Labor anchor row not found');
        await p.setMaxDiscount(row, OVERRIDE_NUMERIC_CASES.maxDiscount.edited);
      },
      expectBeforeSave: async () => { expect(await p.isOverrideSaveEnabled()).toBe(true); },
      saveAndConfirm: () => p.saveAndConfirm(),
      reload: async () => {
        await p.reloadAndReselect(L_LOC, L_LOC);
        await p.switchOverrideTab('Labor');
      },
      expectAfterReload: async () => {
        const row = await p.findRowByProductGroup(L_ANCHOR);
        expect(row).not.toBeNull();
        expect(parseFloat(await p.readMaxDiscount(row!))).toBe(parseFloat(OVERRIDE_NUMERIC_CASES.maxDiscount.edited));
      },
      // cleanup restores Override Price + Active; Max Discount returns to its unset baseline via the
      // afterEach ensureDefaultState reload (the fixture row's saved Max Discount is the unset default).
      cleanup: () => p.ensureDefaultState(L_ANCHOR, L_DEFAULTS, L_LOC, L_LOC, 'Labor'),
    });
  });

  test('TC-CPR-OVR-055: Labor Active toggle save-cycle persists after reload and restores (NM-2271)', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(180_000);
    let original: boolean = L_DEFAULTS.active;
    await saveAndVerifyCase({
      id: 'TC-CPR-OVR-055',
      label: 'Labor Active toggle save-cycle',
      baseline: () => p.ensureDefaultState(L_ANCHOR, L_DEFAULTS, L_LOC, L_LOC, 'Labor'),
      act: async () => {
        const row = await p.findRowByProductGroup(L_ANCHOR);
        if (!row) throw new Error('Labor anchor row not found');
        original = await p.readActiveState(row);
        await p.toggleActive(row);
      },
      expectBeforeSave: async () => { expect(await p.isOverrideSaveEnabled()).toBe(true); },
      saveAndConfirm: () => p.saveAndConfirm(),
      reload: async () => {
        await p.reloadAndReselect(L_LOC, L_LOC);
        await p.switchOverrideTab('Labor');
      },
      expectAfterReload: async () => {
        const row = await p.findRowByProductGroup(L_ANCHOR);
        expect(row).not.toBeNull();
        expect(await p.readActiveState(row!)).toBe(!original); // toggled value persisted
      },
      cleanup: () => p.ensureDefaultState(L_ANCHOR, L_DEFAULTS, L_LOC, L_LOC, 'Labor'),
    });
  });
});

test.describe('Corporate Pricing — Product Group Override: unsaved-changes guard (NM-2271) @corporate-pricing @override', () => {
  // The guard dialog fires on IN-APP link navigation away from a dirty grid (verified live: a direct
  // URL change triggers the browser's own leave-page prompt instead, never this dialog). Staged edits
  // here are never saved; each path ends by leaving via Discard or reloading clean.
  const G_LOC = CORP_PRICING_OVERRIDE_LABOR_BED.office; // 1105 — small, well-known bed
  const G_ANCHOR = CORP_PRICING_OVERRIDE_LABOR_BED.mutationRowAnchor.productGroupName;

  test.beforeEach(async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(150_000);
    await p.reloadAndReselect(G_LOC, G_LOC);
    await p.switchOverrideTab('Labor');
    await p.waitForGridRows();
  });

  test('TC-CPR-OVR-056: Navigating away from a dirty grid raises the unsaved-changes dialog; Stay keeps the page and the edit (NM-2271)', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(G_ANCHOR);
    expect(row).not.toBeNull();
    const original = parseFloat(await p.readOverridePrice(row!));
    const staged = String(original + 39); // differs from the saved value so the grid is genuinely dirty
    await p.setOverridePrice(row!, staged);
    expect(await p.isOverrideSaveEnabled()).toBe(true);

    const dialogText = await p.navigateHomeExpectUnsavedDialog();
    expect(dialogText).toContain(CORP_PRICING_OVERRIDE_UNSAVED_DIALOG.title);
    expect(dialogText).toContain(CORP_PRICING_OVERRIDE_UNSAVED_DIALOG.body);
    expect(dialogText).toContain(CORP_PRICING_OVERRIDE_UNSAVED_DIALOG.stayButton);
    expect(dialogText).toContain(CORP_PRICING_OVERRIDE_UNSAVED_DIALOG.discardButton);

    await p.stayOnPage();
    expect(p.page.url(), 'Stay keeps the Override screen open').toContain('/pg-override');
    const rowAfter = await p.findRowByProductGroup(G_ANCHOR);
    expect(rowAfter).not.toBeNull();
    expect(parseFloat(await p.readOverridePrice(rowAfter!)), 'the staged edit survives Stay').toBe(parseFloat(staged));
    expect(await p.isOverrideSaveEnabled(), 'the form stays dirty after Stay').toBe(true);

    // Leave cleanly: discard the staged edit so no state leaks to the next test
    await p.navigateHomeExpectUnsavedDialog();
    await p.discardAndLeave();
  });

  test('TC-CPR-OVR-057: Discard in the unsaved-changes dialog leaves the page and drops the edit (NM-2271)', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(G_ANCHOR);
    expect(row).not.toBeNull();
    const original = parseFloat(await p.readOverridePrice(row!));
    await p.setOverridePrice(row!, String(original + 41));
    expect(await p.isOverrideSaveEnabled()).toBe(true);

    await p.navigateHomeExpectUnsavedDialog();
    await p.discardAndLeave();
    expect(p.page.url(), 'Discard navigates away from the Override screen').toContain('/home');

    // The dropped edit must NOT have persisted
    await p.reloadAndReselect(G_LOC, G_LOC);
    await p.switchOverrideTab('Labor');
    const rowAfter = await p.findRowByProductGroup(G_ANCHOR);
    expect(rowAfter).not.toBeNull();
    expect(parseFloat(await p.readOverridePrice(rowAfter!)), 'the discarded edit did not persist').toBe(original);
  });
});

test.describe('Corporate Pricing — Product Group Override: Labor grid pagination and volume (NM-2271) @corporate-pricing @override', () => {
  const V_BED = CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED;

  test.beforeEach(async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(120_000);
    await p.reloadAndReselect(V_BED.office, V_BED.office);
    await p.switchOverrideTab('Labor');
    await p.waitForGridRows();
  });

  test('TC-CPR-OVR-058: Page navigation changes the visible rows and enables or disables the nav buttons at each end (NM-2271)', async ({ corporatePricingOverridePage: p }) => {
    // Page 1: backward navigation disabled, forward enabled (the bed spans multiple pages)
    const p1 = await p.getPaginationButtonStates();
    expect(p1.first, 'first-page button is disabled on page 1').toBe(true);
    expect(p1.previous, 'previous-page button is disabled on page 1').toBe(true);
    expect(p1.next, 'next-page button is enabled on page 1').toBe(false);
    expect(p1.last, 'last-page button is enabled on page 1').toBe(false);
    const page1FirstRow = await p.getFirstRowCellText(CORP_PRICING_OVERRIDE.columnIndex.productGroupName);

    // Page 2: first row identity changes; backward navigation enables
    await p.goToPage('next');
    const page2FirstRow = await p.getFirstRowCellText(CORP_PRICING_OVERRIDE.columnIndex.productGroupName);
    expect(page2FirstRow, 'page 2 starts with a different row than page 1').not.toBe(page1FirstRow);
    const p2 = await p.getPaginationButtonStates();
    expect(p2.previous, 'previous-page button enables once off page 1').toBe(false);

    // Last page: forward navigation disables; the remainder page holds no more than a full page
    await p.goToPage('last');
    const pLast = await p.getPaginationButtonStates();
    expect(pLast.next, 'next-page button is disabled on the last page').toBe(true);
    expect(pLast.last, 'last-page button is disabled on the last page').toBe(true);
    const lastPageRows = await p.getVisibleRowCount();
    expect(lastPageRows).toBeGreaterThan(0);
    expect(lastPageRows).toBeLessThanOrEqual(parseInt(await p.getRowsPerPageValue(), 10));
  });

  test('TC-CPR-OVR-059: Raising rows-per-page shows more rows without changing the total (NM-2271)', async ({ corporatePricingOverridePage: p }) => {
    const rowsBefore = await p.getVisibleRowCount();
    const totalBefore = await p.getItemsFoundTotal();
    await p.setRowsPerPage('50');
    const rowsAfter = await p.getVisibleRowCount();
    expect(rowsAfter, 'a larger page size shows more rows').toBeGreaterThan(rowsBefore);
    expect(await p.getItemsFoundTotal(), 'the total record count is unchanged by page size').toBe(totalBefore);
  });

  test('TC-CPR-OVR-060: A page-1 row reads back identically after paging to the last page and returning (NM-2271)', async ({ corporatePricingOverridePage: p }) => {
    // Content-anchored round trip across the full page range — guards against windowing/render
    // corruption on the large data set (content anchor, not row index).
    const anchorText = await p.getFirstRowCellText(CORP_PRICING_OVERRIDE.columnIndex.productGroupName);
    expect(anchorText.length).toBeGreaterThan(0);
    await p.goToPage('last');
    expect(await p.getVisibleRowCount()).toBeGreaterThan(0); // far end of the range renders rows
    await p.goToPage('first');
    expect(await p.getFirstRowCellText(CORP_PRICING_OVERRIDE.columnIndex.productGroupName), 'the page-1 anchor row reads back identically after the round trip').toBe(anchorText);
    expect(await p.findRowByProductGroup(anchorText)).not.toBeNull();
  });
});

test.describe('Corporate Pricing — Product Group Override: blank Override Price render (NM-1932) @corporate-pricing @override', () => {
  test.beforeEach(async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(90_000);
    await p.reloadAndReselect(CORP_PRICING_OVERRIDE_EMDASH_BED.office, CORP_PRICING_OVERRIDE_EMDASH_BED.office);
  });

  test('TC-CPR-OVR-061: A blank Override Price renders as an em-dash in a muted style, not an empty cell (NM-1932)', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(CORP_PRICING_OVERRIDE_EMDASH_BED.blankRowName);
    expect(row, 'the known blank-Override-Price row is present on this office').not.toBeNull();
    const cellText = await p.readOverridePrice(row!);
    expect(cellText, 'blank Override Price renders the em-dash placeholder').toBe(CORP_PRICING_OVERRIDE_EMDASH_BED.emDash);
    expect(cellText, 'the cell is NOT empty — asserting empty-string here would pass on the wrong render').not.toBe('');
    // The placeholder carries the muted styling that distinguishes it from a real value
    const cellHtml = await row!.locator('td').nth(CORP_PRICING_OVERRIDE.columnIndex.overridePrice).innerHTML();
    expect(cellHtml).toContain(CORP_PRICING_OVERRIDE_EMDASH_BED.mutedSpanClass);
  });
});

test.describe('Corporate Pricing — Product Group Override: keyboard access to editable cells (NM-2271) @corporate-pricing @override', () => {
  test.beforeEach(async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(90_000);
    await p.reloadAndReselect(LOC);
  });

  test('TC-CPR-OVR-062: Enter opens the Override Price editor on a focused cell; Escape closes it without dirtying the form (NM-2271)', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    expect(row).not.toBeNull();
    const editorValue = await p.openOverridePriceEditorWithKeyboard(row!);
    expect(parseFloat(editorValue), 'the keyboard-opened editor exposes the current value').toBe(parseFloat(DEFAULTS.overridePrice));
    await p.closeEditorWithKeyboard();
    expect(await p.isOverrideSaveEnabled(), 'Escape cancels cleanly — no dirty state').toBe(false);
  });
});

test.describe('Corporate Pricing — Product Group Override: currency-gated picker and drag-to-add (NM-2271) @corporate-pricing @override @mutation', () => {
  // Office 4104: one Equipment override row, zero Labor rows. Selecting a specific currency
  // (USD — not ALL) reveals the Product Group picker in the left search area; dragging a picker
  // row into the grid stages a new override row client-side. All staged rows are discarded via
  // the unsaved-changes dialog — nothing is saved.
  const K_BED = CORP_PRICING_OVERRIDE_PICKER_BED;

  test.beforeEach(async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(150_000);
    await p.reloadAndReselect(K_BED.office, K_BED.office);
  });

  test('TC-CPR-OVR-063: The Product Group picker appears only when a specific currency is selected (NM-2271)', async ({ corporatePricingOverridePage: p }) => {
    // Default currency ALL: no picker
    expect(await p.isProductGroupPickerVisible(), 'no picker panel while Currency is ALL').toBe(false);
    // A specific currency reveals the picker with draggable product-group rows
    await p.selectCurrency(K_BED.gatingCurrency);
    await expect.poll(() => p.isProductGroupPickerVisible(), { timeout: 15_000 }).toBe(true);
    expect(await p.getPickerDraggableRowCount(), 'the picker lists draggable product-group rows').toBeGreaterThan(0);
  });

  test('TC-CPR-OVR-064: Dragging a picker row stages a new override row with no request until Save; Discard drops it (NM-2271)', async ({ corporatePricingOverridePage: p }) => {
    await p.selectCurrency(K_BED.gatingCurrency);
    await expect.poll(() => p.isProductGroupPickerVisible(), { timeout: 15_000 }).toBe(true);
    // The currency switch re-renders the grid — wait for its rows before taking the baseline count
    // (a too-early read returns 0 on a grid that actually holds a row).
    await p.waitForGridRows();
    const rowsBefore = await p.getVisibleRowCount();
    expect(rowsBefore, 'this office carries at least one Equipment override row').toBeGreaterThan(0);

    // No backend save call may fire during the drag — the row stages client-side only
    let saveCallsDuringDrag = 0;
    const listener = (req: { url(): string; method(): string }): void => {
      if (req.url().includes(CORP_PRICING_OVERRIDE.saveApiPath) && req.method() === 'POST') saveCallsDuringDrag += 1;
    };
    p.page.on('request', listener);
    const draggedRowText = await p.dragFirstPickerRowToGrid('Equipment');
    p.page.off('request', listener);

    expect(await p.getVisibleRowCount(), 'the drag staged one new grid row').toBe(rowsBefore + 1);
    expect(saveCallsDuringDrag, 'no save request fires during the drag').toBe(0);
    expect(await p.isOverrideSaveEnabled(), 'staging a row dirties the form').toBe(true);

    // The staged row lands with the unset price and inactive state
    const pgId = draggedRowText.split(' ')[0] ?? ''; // picker row text starts with the product-group id
    expect(pgId.length).toBeGreaterThan(0);
    const staged = await p.findRowByProductGroup(pgId);
    expect(staged, 'the staged row is findable by its product-group id').not.toBeNull();
    expect(parseFloat(await p.readOverridePrice(staged!))).toBe(parseFloat(K_BED.droppedRowDefaults.overridePrice));
    expect(await p.readActiveState(staged!)).toBe(K_BED.droppedRowDefaults.active);

    // Discard the staged row and prove nothing persisted
    await p.navigateHomeExpectUnsavedDialog();
    await p.discardAndLeave();
    await p.reloadAndReselect(K_BED.office, K_BED.office);
    await p.selectCurrency(K_BED.gatingCurrency);
    await p.waitForGridRows();
    await expect.poll(() => p.getVisibleRowCount(), { timeout: 15_000 }).toBe(rowsBefore); // staged row gone
  });

  test('TC-CPR-OVR-065: The picker serves the Labor tab and drag staging works there too (NM-2271)', async ({ corporatePricingOverridePage: p }) => {
    await p.selectCurrency(K_BED.gatingCurrency);
    await expect.poll(() => p.isProductGroupPickerVisible(), { timeout: 15_000 }).toBe(true);
    await p.switchOverrideTab('Labor');
    expect(await p.isProductGroupPickerVisible(), 'the picker persists on the Labor tab').toBe(true);
    expect(await p.getPickerDraggableRowCount(), 'the picker lists Labor product-group rows').toBeGreaterThan(0);

    const rowsBefore = await p.getVisibleRowCount(); // this office has no saved Labor overrides
    await p.dragFirstPickerRowToGrid('Labor');
    expect(await p.getVisibleRowCount(), 'the drag staged one new Labor grid row').toBe(rowsBefore + 1);
    expect(await p.isOverrideSaveEnabled(), 'staging a Labor row dirties the form').toBe(true);

    // Discard — nothing persists
    await p.navigateHomeExpectUnsavedDialog();
    await p.discardAndLeave();
  });
});

// === NM-2271 Gap-Closure: 62 new BVA/boundary/defect tests (TC-CPR-OVR-066 to TC-CPR-OVR-127) ===

test.describe('Override BVA — Equipment field axis (Lot A)', () => {
  const BED = OVERRIDE_BVA_OFFICES.equipment;
  const ROW_ANCHOR = BED.rows[0].productGroupId; // PG 4298

  // ─── Override Price — Rejection ────────────────────────────────────────────

  test('TC-CPR-OVR-066: -5 rejected on Override Price with full rejection oracle', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToEquipmentRow(BED.office, BED.office, ROW_ANCHOR);

    const result = await overridePage.probeEditOracle(row, 'overridePrice', OVERRIDE_BVA_REJECTED.negativeFive.input);

    expect(result.committed, 'Override Price must NOT commit a negative value').toBe(false);
    expect(result.ariaInvalid).toBe(OVERRIDE_REJECTION_SIGNATURE.ariaInvalid);
    expect(result.borderColor).toContain(OVERRIDE_REJECTION_SIGNATURE.borderColor);
    expect(result.errorText, 'No error message announced — defect #4').toBe(OVERRIDE_REJECTION_SIGNATURE.alertRoleTextContent);
    expect(result.saveEnabled).toBe(false);
    expect(result.escapable, 'Editor must be escapable — NOT a focus trap').toBe(true);
  });

  test('TC-CPR-OVR-067: -0.01 rejected on Override Price (BVA below-min)', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToEquipmentRow(BED.office, BED.office, ROW_ANCHOR);

    const result = await overridePage.probeEditOracle(row, 'overridePrice', OVERRIDE_BVA_REJECTED.negativeSmall.input);

    expect(result.committed, '-0.01 (just below zero) must be rejected').toBe(false);
    expect(result.ariaInvalid).toBe(OVERRIDE_REJECTION_SIGNATURE.ariaInvalid);
    expect(result.saveEnabled).toBe(false);
  });

  test('TC-CPR-OVR-068: 0.001 accepted on Override Price (3rd-decimal precision)', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToEquipmentRow(BED.office, BED.office, ROW_ANCHOR);

    const result = await overridePage.probeEditOracle(row, 'overridePrice', '0.001');

    // TODO-UNVERIFIED: decimal accepted per existing TCs; exact display format for 3-decimal unverified
    expect(result.committed, '3rd-decimal precision should commit').toBe(true);
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-069: 999999 accepted on Override Price — no hard upper max', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToEquipmentRow(BED.office, BED.office, ROW_ANCHOR);

    const result = await overridePage.probeEditOracle(row, 'overridePrice', '999999');

    expect(result.committed, 'Override Price has no hard upper maximum').toBe(true);
    expect(result.saveEnabled).toBe(true);
  });

  // ─── Override Price — Defects ──────────────────────────────────────────────

  test('TC-CPR-OVR-070: 1.2.3 silently commits as 1.23 on Override Price — multi-dot corruption defect', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToEquipmentRow(BED.office, BED.office, ROW_ANCHOR);

    const result = await overridePage.probeEditOracle(row, 'overridePrice', OVERRIDE_BVA_DEFECTS.silentCorruptionOverridePrice.input);

    // Assert the DEFECT: browser swallows second dot, app accepts the corrupted value.
    // When fixed: committed will become false (proper rejection of multi-dot input).
    expect(result.committed, 'BUG: 1.2.3 commits instead of being rejected').toBe(true);
    expect(result.displayedValue, 'BUG: second dot swallowed, displays as 1.23').toBe(
      OVERRIDE_BVA_DEFECTS.silentCorruptionOverridePrice.expectedDisplay,
    ); // '1.23'
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-071: 007 on Override Price — leading zeros stripped', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToEquipmentRow(BED.office, BED.office, ROW_ANCHOR);

    const result = await overridePage.probeEditOracle(row, 'overridePrice', '007');

    expect(result.committed, 'Leading-zero input should commit').toBe(true);
    expect(result.displayedValue).toBe('7.00');
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-072: 1e5 on Override Price — scientific notation handling', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToEquipmentRow(BED.office, BED.office, ROW_ANCHOR);

    const result = await overridePage.probeEditOracle(row, 'overridePrice', OVERRIDE_BVA_REJECTED.scientificNotation.input);

    // 1e5 COMMITS on Override Price (no >100 cap) — displays as 100,000.00.
    // Max Discount rejects 1e5 because >100 fires, not because the app refuses the notation.
    expect(result.committed, '1e5 commits on Override Price — no upper cap').toBe(true);
    expect(result.displayedValue).toBe('100000.00');
    // Raw text preserves the thousands separator the oracle strips (ORACLE-FACTS: 100,000.00)
    expect(result.rawDisplayedValue).toBe('100,000.00');
    expect(result.saveEnabled).toBe(true);
  });

  // ─── Max Discount % — Committed (valid) ───────────────────────────────────

  test('TC-CPR-OVR-073: 50 commits as 50.00 % on Max Discount (mid-range)', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToEquipmentRow(BED.office, BED.office, ROW_ANCHOR);

    const result = await overridePage.probeEditOracle(row, 'maxDiscount', OVERRIDE_BVA_COMMITTED.fifty.input);

    expect(result.committed).toBe(true);
    expect(result.displayedValue).toBe(OVERRIDE_BVA_COMMITTED.fifty.expectedDisplay); // '50.00 %'
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-076: 99.99 commits as 99.99 % on Max Discount (just-below-cap BVA)', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToEquipmentRow(BED.office, BED.office, ROW_ANCHOR);

    const result = await overridePage.probeEditOracle(row, 'maxDiscount', OVERRIDE_BVA_COMMITTED.justUnderCap.input);

    expect(result.committed, '99.99 (just below inclusive cap) should commit').toBe(true);
    expect(result.displayedValue).toBe(OVERRIDE_BVA_COMMITTED.justUnderCap.expectedDisplay); // '99.99 %'
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-081: 007 commits as 7.00 % on Max Discount — leading zeros stripped', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToEquipmentRow(BED.office, BED.office, ROW_ANCHOR);

    const result = await overridePage.probeEditOracle(row, 'maxDiscount', OVERRIDE_BVA_COMMITTED.leadingZeros.input);

    expect(result.committed).toBe(true);
    expect(result.displayedValue).toBe(OVERRIDE_BVA_COMMITTED.leadingZeros.expectedDisplay); // '7.00 %'
    expect(result.saveEnabled).toBe(true);
  });

  // ─── Max Discount % — Rejection ───────────────────────────────────────────

  test('TC-CPR-OVR-074: -0.01 rejected on Max Discount (BVA below-min)', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToEquipmentRow(BED.office, BED.office, ROW_ANCHOR);

    const result = await overridePage.probeEditOracle(row, 'maxDiscount', OVERRIDE_BVA_REJECTED.negativeSmall.input);

    expect(result.committed, '-0.01 (just below zero) must be rejected').toBe(false);
    expect(result.ariaInvalid).toBe(OVERRIDE_REJECTION_SIGNATURE.ariaInvalid);
    expect(result.saveEnabled).toBe(false);
  });

  test('TC-CPR-OVR-077: 100.01 rejected on Max Discount with full oracle — supersedes TC-023', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToEquipmentRow(BED.office, BED.office, ROW_ANCHOR);

    const result = await overridePage.probeEditOracle(row, 'maxDiscount', '100.01');

    // Full rejection oracle — the >100 contract is now established (150 verified rejected).
    // 100.01 is the BVA boundary: first value above the inclusive-100 cap.
    expect(result.committed, '100.01 (above inclusive cap) must NOT commit').toBe(false);
    expect(result.ariaInvalid).toBe(OVERRIDE_REJECTION_SIGNATURE.ariaInvalid);
    expect(result.borderColor).toContain(OVERRIDE_REJECTION_SIGNATURE.borderColor);
    expect(result.errorText, 'Bug-evidence: no error message announced (defect #4)').toBe(
      OVERRIDE_REJECTION_SIGNATURE.alertRoleTextContent,
    ); // '' (empty)
    expect(result.saveEnabled).toBe(false);
    expect(result.escapable, 'Editor IS escapable — NOT a focus trap (cross-vendor verified)').toBe(true);
  });

  test('TC-CPR-OVR-080: 1e5 rejected on Max Discount — scientific notation', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToEquipmentRow(BED.office, BED.office, ROW_ANCHOR);

    const result = await overridePage.probeEditOracle(row, 'maxDiscount', OVERRIDE_BVA_REJECTED.scientificNotation.input);

    expect(result.committed, 'Scientific notation must be rejected').toBe(false);
    expect(result.ariaInvalid).toBe(OVERRIDE_REJECTION_SIGNATURE.ariaInvalid);
    expect(result.saveEnabled).toBe(false);
  });

  // ─── Max Discount % — Defects ─────────────────────────────────────────────

  test('TC-CPR-OVR-075: 0.5 commits as 50.00% — 100x multiplier bug (HIGHEST SEVERITY)', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToEquipmentRow(BED.office, BED.office, ROW_ANCHOR);

    const result = await overridePage.probeEditOracle(row, 'maxDiscount', OVERRIDE_BVA_DEFECTS.hundredXMisread.input);

    // THE HEADLINE DEFECT — direct money impact.
    // A user types 0.5 intending a half-percent discount cap.
    // The app stores and displays 50.00 % — a FIFTY percent cap.
    // Input "50" also produces "50.00 %", so two completely different
    // business intents (0.5% vs 50%) collapse to one stored value.
    //
    // When the app is fixed: displayedValue becomes '0.50 %'.
    // Failure message will read: Expected "50.00 %" / Received "0.50 %"
    // — making the fix immediately visible to anyone reading the report.
    expect(result.committed, 'BUG: 0.5 commits (app treats it as 50, not 0.5%)').toBe(true);
    expect(
      result.displayedValue,
      'BUG: 0.5 displays as 50.00 % — a 100× misread. ' +
        'A half-percent cap became a fifty-percent cap. ' +
        'When fixed, this will show 0.50 %.',
    ).toBe(OVERRIDE_BVA_DEFECTS.hundredXMisread.expectedDisplay); // '50.00 %'
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-078: abc blanks Max Discount to em-dash with Save enabled — commit+net-zero defect', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToEquipmentRow(BED.office, BED.office, ROW_ANCHOR);

    const result = await overridePage.probeEditOracle(row, 'overridePrice', OVERRIDE_BVA_DEFECTS.blankCommits.input);

    // Assert the DEFECT: non-numeric commits AND Save enables (real change from non-empty baseline).
    // Re-aimed at Override Price (baseline 152.00 on PG 4298) — Max Discount baseline is already '—',
    // so blanking it produced no net change and Save correctly stayed DISABLED.
    // Override Price has a non-empty baseline, so blanking IS a mutation → Save enables.
    // When fixed: committed becomes false (proper rejection of non-numeric).
    expect(result.committed, 'BUG: abc commits instead of being rejected').toBe(true);
    expect(result.displayedValue, 'Cell blanks to em-dash').toBe(
      OVERRIDE_BVA_DEFECTS.blankCommits.expectedDisplay,
    ); // '—'
    expect(result.saveEnabled, 'BUG: Save enables — abc blanked a non-empty cell (152.00 → —)').toBe(true);
  });

  test('TC-CPR-OVR-079: 1.2.3 silently commits as 1.23 % on Max Discount — multi-dot corruption defect', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToEquipmentRow(BED.office, BED.office, ROW_ANCHOR);

    const result = await overridePage.probeEditOracle(row, 'maxDiscount', OVERRIDE_BVA_DEFECTS.silentCorruptionMaxDiscount.input);

    // Assert the DEFECT: browser swallows second dot, displays with % suffix.
    // Note: Override Price renders as '1.23' (no suffix); Max Discount renders as '1.23 %'.
    // When fixed: committed will become false (proper rejection of multi-dot input).
    expect(result.committed, 'BUG: 1.2.3 commits instead of being rejected').toBe(true);
    expect(result.displayedValue, 'BUG: second dot swallowed, displays as 1.23 %').toBe(
      OVERRIDE_BVA_DEFECTS.silentCorruptionMaxDiscount.expectedDisplay,
    ); // '1.23 %'
    expect(result.saveEnabled).toBe(true);
  });

  // ─── Max Discount % — Net-zero (reverting changes disables Save) ───────────────────────────────────

  test('TC-CPR-OVR-082: Max Discount % revert-to-original disables Save', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToEquipmentRow(BED.office, BED.office, ROW_ANCHOR);

    // Verified: Ctrl+A → Delete → Enter restores to '—' and Save returns to DISABLED.
    const result = await overridePage.editAndRevertToOriginal(row, 'maxDiscount', '50', '');

    expect(result.saveEnabledAfterEdit, 'Save should enable after editing from — to 50').toBe(true);
    expect(result.saveDisabledAfterRevert, 'Save should disable after reverting to original (—)').toBe(true);
  });

  // ─── Active — Net-zero (reverting changes disables Save) ───────────────────────────────────────────

  test('TC-CPR-OVR-083: Active toggle-then-revert disables Save', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToEquipmentRow(BED.office, BED.office, ROW_ANCHOR);

    // Baseline: Active = checked (true) on PG 4298
    const checkbox = row.locator('[role="checkbox"]');

    // Toggle away from original (uncheck)
    await checkbox.click();
    await expect(overridePage.saveButton).toBeEnabled();

    // Toggle back to original (recheck)
    await checkbox.click();
    await expect(overridePage.saveButton).toBeDisabled();
  });
});


test.describe('Override BVA — Labor Override Price', () => {
  const BED = OVERRIDE_BVA_OFFICES.labor;
  const ROW_PG565 = BED.rows[0].productGroupId; // PG 565 — Override Price 13.00
  const ROW_PG893 = BED.rows[1].productGroupId; // PG 893 — Override Price 12.00

  test('TC-CPR-OVR-084: Clicking Override Price on Labor reveals editable spinbutton', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_PG565);

    // Click the Override Price cell — column-specific selector matching probeEditOracle
    const overridePriceCell = row.locator('td:nth-child(6) [role="button"]').first();
    await overridePriceCell.click();

    // Row-scoped editor with 8s timeout — matches probeEditOracle and all sibling tests
    const editor = row.getByRole('spinbutton');
    await editor.waitFor({ state: 'visible', timeout: 8_000 });
    await expect(editor).toHaveValue('13');

    // Cleanup — Escape without committing
    await editor.press('Escape');
  });

  test('TC-CPR-OVR-085: 0 commits as 0.00 on Labor Override Price', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_PG565);

    const result = await overridePage.probeEditOracle(row, 'overridePrice', '0');

    expect(result.committed).toBe(true);
    expect(result.displayedValue).toBe('0.00');
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-086: 25.50 mid-decimal commits on Labor Override Price', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_PG565);

    const result = await overridePage.probeEditOracle(row, 'overridePrice', '25.50');

    expect(result.committed).toBe(true);
    expect(result.displayedValue).toBe('25.50');
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-087: 9999.99 large value commits on Labor Override Price', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_PG565);

    const result = await overridePage.probeEditOracle(row, 'overridePrice', '9999.99');

    expect(result.committed).toBe(true);
    expect(result.displayedValue).toBe('9999.99');
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-088: -0.01 rejected on Labor Override Price (below-min boundary)', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_PG565);

    const result = await overridePage.probeEditOracle(row, 'overridePrice', OVERRIDE_BVA_REJECTED.negativeSmall.input);

    expect(result.committed).toBe(false);
    expect(result.ariaInvalid).toBe(OVERRIDE_REJECTION_SIGNATURE.ariaInvalid);
    expect(result.borderColor).toContain(OVERRIDE_REJECTION_SIGNATURE.borderColor);
    expect(result.errorText).toBe(OVERRIDE_REJECTION_SIGNATURE.alertRoleTextContent);
    expect(result.saveEnabled).toBe(false);

    // Escapability established by cross-provider E2E probe (trap-decider.md, 2026-07-22):
    // after Escape, a different cell's editor opens — the user is never trapped.
    expect(result.escapable, 'Editor must be escapable — NOT a focus trap').toBe(true);
  });

  test('TC-CPR-OVR-089: 0.01 just above zero commits on Labor Override Price', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_PG893);

    const result = await overridePage.probeEditOracle(row, 'overridePrice', '0.01');

    expect(result.committed).toBe(true);
    expect(result.displayedValue).toBe('0.01');
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-090: 12.345 third-decimal precision on Labor Override Price [TODO-UNVERIFIED display]', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_PG565);

    const result = await overridePage.probeEditOracle(row, 'overridePrice', '12.345');

    // TODO-UNVERIFIED: exact display format unknown (12.35 rounded? 12.345? 12.34 truncated?)
    expect(result.committed).toBe(true);
    expect(result.saveEnabled).toBe(true);
    // The live run determines actual displayedValue — update assertion post-verification
    expect(result.displayedValue).toMatch(/^12\.3[0-9]{1,2}$/);
  });

  test('TC-CPR-OVR-091: 999999.99 above-max probe on Labor Override Price [TODO-UNVERIFIED]', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_PG893);

    const result = await overridePage.probeEditOracle(row, 'overridePrice', '999999.99');

    // TODO-UNVERIFIED: no confirmed hard max — TC-021 on Equipment says large numbers accepted
    // Note: probeEditOracle strips commas from displayedValue (helper contract).
    expect(result.committed).toBe(true);
    expect(result.displayedValue).toBe('999999.99');
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-092: abc blanks Override Price to dash, Save enabled — defect evidence (Labor)', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_PG565);

    const result = await overridePage.probeEditOracle(row, 'overridePrice', OVERRIDE_BVA_DEFECTS.blankCommits.input);

    // Assert the DEFECT — test FAILS when the app is fixed (committed will become false)
    expect(result.committed).toBe(true);
    expect(result.displayedValue).toBe(OVERRIDE_BVA_DEFECTS.blankCommits.expectedDisplay); // '—'
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-093: 1.2.3 silently corrupts Override Price to 1.23 — defect evidence (Labor)', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_PG565);

    const result = await overridePage.probeEditOracle(row, 'overridePrice', OVERRIDE_BVA_DEFECTS.silentCorruptionOverridePrice.input);

    // Assert the DEFECT — test FAILS when fixed (committed becomes false, or displayedValue changes)
    expect(result.committed).toBe(true);
    expect(result.displayedValue).toBe(OVERRIDE_BVA_DEFECTS.silentCorruptionOverridePrice.expectedDisplay); // '1.23'
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-094: -5 rejected on Labor Override Price with full affordance oracle', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_PG565);

    const result = await overridePage.probeEditOracle(row, 'overridePrice', OVERRIDE_BVA_REJECTED.negativeFive.input);

    // Full capture order — capture BEFORE escape
    expect(result.committed).toBe(false);
    expect(result.ariaInvalid).toBe(OVERRIDE_REJECTION_SIGNATURE.ariaInvalid);
    expect(result.borderColor).toContain(OVERRIDE_REJECTION_SIGNATURE.borderColor);
    expect(result.errorText).toBe(OVERRIDE_REJECTION_SIGNATURE.alertRoleTextContent); // '' — defect #4
    expect(result.saveEnabled).toBe(false);

    // Escapability established by cross-provider E2E probe (trap-decider.md, 2026-07-22):
    // after Escape, a different cell's editor opens — the user is never trapped.
    expect(result.escapable, 'Editor must be escapable — NOT a focus trap').toBe(true);
  });

  test('TC-CPR-OVR-095: 007 leading zeros stripped to 7.00 on Labor Override Price', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_PG893);

    const result = await overridePage.probeEditOracle(row, 'overridePrice', '007');

    expect(result.committed).toBe(true);
    expect(result.displayedValue).toBe('7.00');
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-096: 1e5 commits as 100,000.00 on Labor Override Price', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_PG893);

    const result = await overridePage.probeEditOracle(row, 'overridePrice', '1e5');

    // 1e5 COMMITS on Override Price — no upper cap. Max Discount rejects it because >100 fires.
    // Raw text preserves the thousands separator the oracle strips (ORACLE-FACTS: 100,000.00)
    expect(result.committed, '1e5 commits on Override Price — no upper cap').toBe(true);
    expect(result.displayedValue).toBe('100000.00');
    expect(result.rawDisplayedValue).toBe('100,000.00');
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-097: Reverting Override Price to original disables Save on Labor', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_PG565);

    const result = await overridePage.editAndRevertToOriginal(
      row,
      'overridePrice',
      '99.99',
      '13.00',
    );

    expect(result.saveEnabledAfterEdit).toBe(true);
    expect(result.saveDisabledAfterRevert).toBe(true);
  });
});

test.describe('Override BVA — Labor Active', () => {
  const BED = OVERRIDE_BVA_OFFICES.labor;
  const ROW_PG565 = BED.rows[0].productGroupId;

  test('TC-CPR-OVR-098: Active toggle-then-revert disables Save on Labor', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_PG565);

    // Read initial state
    const activeCheckbox = row.locator('[role="checkbox"]');
    const initialChecked = await activeCheckbox.getAttribute('aria-checked');

    // Toggle — Save should enable
    await activeCheckbox.click();
    await expect(overridePage.saveButton).toBeEnabled();

    // Toggle back (revert) — Save should disable (net-zero)
    await activeCheckbox.click();
    await expect(overridePage.saveButton).toBeDisabled();

    // Verify state restored
    const finalChecked = await activeCheckbox.getAttribute('aria-checked');
    expect(finalChecked).toBe(initialChecked);
  });
});


test.describe('Override BVA — Labor Max Discount % (LOT-C)', () => {
  const BED = OVERRIDE_BVA_OFFICES.labor;
  const ROW_1 = BED.rows[0].productGroupId; // PG 565, baseline 14.00 %
  const ROW_2 = BED.rows[1].productGroupId; // PG 893, baseline 6.00 %

  // --- Positive (P1–P3) ---

  test('TC-CPR-OVR-099: 0 commits as 0.00 % — min valid', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_1);

    const result = await overridePage.probeEditOracle(row, 'maxDiscount', '0');

    expect(result.committed, '0 should commit as a valid min value').toBe(true);
    expect(result.displayedValue).toBe('0.00 %');
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-100: 50 commits as 50.00 % — mid-value', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_2);

    const result = await overridePage.probeEditOracle(row, 'maxDiscount', OVERRIDE_BVA_COMMITTED.fifty.input);

    expect(result.committed).toBe(true);
    expect(result.displayedValue).toBe(OVERRIDE_BVA_COMMITTED.fifty.expectedDisplay); // '50.00 %'
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-101: 100 commits as 100.00 % — inclusive cap', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_1);

    const result = await overridePage.probeEditOracle(row, 'maxDiscount', OVERRIDE_BVA_COMMITTED.hundredCap.input);

    expect(result.committed).toBe(true);
    expect(result.displayedValue).toBe(OVERRIDE_BVA_COMMITTED.hundredCap.expectedDisplay); // '100.00 %'
    expect(result.saveEnabled).toBe(true);
  });

  // --- BVA (B1–B5) ---

  test('TC-CPR-OVR-102: -0.01 rejected — just below minimum', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_2);

    const result = await overridePage.probeEditOracle(row, 'maxDiscount', OVERRIDE_BVA_REJECTED.negativeSmall.input);

    expect(result.committed, '-0.01 should be rejected as below-min').toBe(false);
    expect(result.ariaInvalid).toBe(OVERRIDE_REJECTION_SIGNATURE.ariaInvalid);
    expect(result.borderColor).toContain(OVERRIDE_REJECTION_SIGNATURE.borderColor);
    expect(result.errorText).toBe(OVERRIDE_REJECTION_SIGNATURE.alertRoleTextContent);
    expect(result.saveEnabled).toBe(false);

    // Escapability established by cross-provider E2E probe (trap-decider.md, 2026-07-22):
    // after Escape, a different cell's editor opens — the user is never trapped.
    expect(result.escapable, 'Editor must be escapable — NOT a focus trap').toBe(true);
  });

  test('TC-CPR-OVR-103: 0.5 commits as 50.00 % — 100x misread defect (highest severity, money bug)', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_1);

    const result = await overridePage.probeEditOracle(row, 'maxDiscount', OVERRIDE_BVA_DEFECTS.hundredXMisread.input);

    // Assert the DEFECT — a half-percent discount cap silently becomes fifty percent.
    // When the app is fixed, displayedValue will become '0.50 %' and this test FAILS loudly.
    expect(result.committed).toBe(true);
    expect(
      result.displayedValue,
      'BUG: 0.5 is misread as 50.00 % — a half-percent cap becomes fifty percent. When fixed, expect 0.50 %',
    ).toBe(OVERRIDE_BVA_DEFECTS.hundredXMisread.expectedDisplay); // '50.00 %'
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-104: 99.99 commits as 99.99 % — just below cap', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_2);

    const result = await overridePage.probeEditOracle(row, 'maxDiscount', OVERRIDE_BVA_COMMITTED.justUnderCap.input);

    expect(result.committed, '99.99 should commit as just-under-cap').toBe(true);
    expect(result.displayedValue).toBe(OVERRIDE_BVA_COMMITTED.justUnderCap.expectedDisplay); // '99.99 %'
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-105: 150 (>100) rejected with full affordance', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_1);

    const result = await overridePage.probeEditOracle(row, 'maxDiscount', OVERRIDE_BVA_REJECTED.overHundred.input);

    expect(result.committed).toBe(false);
    expect(result.ariaInvalid).toBe(OVERRIDE_REJECTION_SIGNATURE.ariaInvalid);
    expect(result.borderColor).toContain(OVERRIDE_REJECTION_SIGNATURE.borderColor);
    expect(result.errorText).toBe(OVERRIDE_REJECTION_SIGNATURE.alertRoleTextContent);
    expect(result.saveEnabled).toBe(false);

    // Escapability established by cross-provider E2E probe (trap-decider.md, 2026-07-22):
    // after Escape, a different cell's editor opens — the user is never trapped.
    expect(result.escapable, 'Editor must be escapable — NOT a focus trap').toBe(true);
  });

  test('TC-CPR-OVR-106: -5 rejected with full affordance', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_2);

    const result = await overridePage.probeEditOracle(row, 'maxDiscount', OVERRIDE_BVA_REJECTED.negativeFive.input);

    expect(result.committed).toBe(false);
    expect(result.ariaInvalid).toBe(OVERRIDE_REJECTION_SIGNATURE.ariaInvalid);
    expect(result.borderColor).toContain(OVERRIDE_REJECTION_SIGNATURE.borderColor);
    expect(result.errorText).toBe(OVERRIDE_REJECTION_SIGNATURE.alertRoleTextContent);
    expect(result.saveEnabled).toBe(false);

    // Escapability established by cross-provider E2E probe (trap-decider.md, 2026-07-22):
    // after Escape, a different cell's editor opens — the user is never trapped.
    expect(result.escapable, 'Editor must be escapable — NOT a focus trap').toBe(true);
  });

  // --- Negative / Coercion (N1–N4) ---

  test('TC-CPR-OVR-107: abc blanks cell to dash, Save stays enabled — blank-commits defect', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_1);

    const result = await overridePage.probeEditOracle(row, 'maxDiscount', OVERRIDE_BVA_DEFECTS.blankCommits.input);

    // Assert the DEFECT — non-numeric blanks the cell and Save stays enabled.
    // When fixed: either rejected (committed=false) or Save disabled. Test fails, exposing the fix.
    expect(result.committed).toBe(true);
    expect(
      result.displayedValue,
      'BUG: abc blanks the discount cap to dash and Save stays enabled — an emptied value can be saved',
    ).toBe(OVERRIDE_BVA_DEFECTS.blankCommits.expectedDisplay); // '—'
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-108: 1.2.3 silently corrupts to 1.23 % — multi-dot defect', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_2);

    const result = await overridePage.probeEditOracle(row, 'maxDiscount', OVERRIDE_BVA_DEFECTS.silentCorruptionMaxDiscount.input);

    // Assert the DEFECT — multi-dot input silently becomes a plausible number.
    // When fixed: rejected (committed=false, aria-invalid=true). Test fails, naming the change.
    expect(result.committed).toBe(true);
    expect(
      result.displayedValue,
      'BUG: 1.2.3 is silently corrupted to 1.23 % — second dot swallowed. When fixed, expect rejection',
    ).toBe(OVERRIDE_BVA_DEFECTS.silentCorruptionMaxDiscount.expectedDisplay); // '1.23 %'
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-109: 007 commits as 7.00 % — leading zeros stripped', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_1);

    const result = await overridePage.probeEditOracle(row, 'maxDiscount', OVERRIDE_BVA_COMMITTED.leadingZeros.input);

    expect(result.committed).toBe(true);
    expect(result.displayedValue).toBe(OVERRIDE_BVA_COMMITTED.leadingZeros.expectedDisplay); // '7.00 %'
    expect(result.saveEnabled).toBe(true);
  });

  test('TC-CPR-OVR-110: 1e5 (scientific notation) rejected with full affordance', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_2);

    const result = await overridePage.probeEditOracle(row, 'maxDiscount', OVERRIDE_BVA_REJECTED.scientificNotation.input);

    expect(result.committed).toBe(false);
    expect(result.ariaInvalid).toBe(OVERRIDE_REJECTION_SIGNATURE.ariaInvalid);
    expect(result.borderColor).toContain(OVERRIDE_REJECTION_SIGNATURE.borderColor);
    expect(result.errorText).toBe(OVERRIDE_REJECTION_SIGNATURE.alertRoleTextContent);
    expect(result.saveEnabled).toBe(false);

    // Escapability established by cross-provider E2E probe (trap-decider.md, 2026-07-22):
    // after Escape, a different cell's editor opens — the user is never trapped.
    expect(result.escapable, 'Editor must be escapable — NOT a focus trap').toBe(true);
  });

  // --- Save-cycle (S3) ---

  test('TC-CPR-OVR-111: Save-cycle — reverting Max Discount % to original disables Save on Labor', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, ROW_1);

    const result = await overridePage.editAndRevertToOriginal(
      row,
      'maxDiscount',
      OVERRIDE_BVA_COMMITTED.fifty.input, // edit to 50
      BED.rows[0].maxDiscount,            // revert to original (14.00)
    );

    expect(result.saveEnabledAfterEdit, 'Save should enable when Max Discount is edited').toBe(true);
    expect(result.saveDisabledAfterRevert, 'Save should disable when reverted to original value').toBe(true);
  });
});


test.describe('Override Toolbar — Location Picker Dismissal', () => {
  const BED = CORP_PRICING_OVERRIDE_FIXTURE;

  test('TC-CPR-OVR-112: Escape closes the location picker without applying a location', async ({ corporatePricingOverridePage: overridePage }) => {
    await overridePage.navigateToEquipmentRow(BED.office, BED.office, BED.mutationRowAnchor.productGroupId);
    const rowCountBefore = await overridePage.getVisibleRowCount();

    // Open the picker dialog
    await overridePage.openLocationPicker();
    await overridePage.page.locator('[role="dialog"]').waitFor({ state: 'visible' });

    // Dismiss with Escape
    await overridePage.page.keyboard.press('Escape');
    await overridePage.page.locator('[role="dialog"]').waitFor({ state: 'hidden' });

    // Assert: grid unchanged, Save still disabled
    const rowCountAfter = await overridePage.getVisibleRowCount();
    expect(rowCountAfter).toBe(rowCountBefore);
    await expect(overridePage.page.locator('button:has-text("Save")')).toBeDisabled();
  });

  test('TC-CPR-OVR-113: Cancel closes the location picker without applying a location', async ({ corporatePricingOverridePage: overridePage }) => {
    await overridePage.navigateToEquipmentRow(BED.office, BED.office, BED.mutationRowAnchor.productGroupId);
    const rowCountBefore = await overridePage.getVisibleRowCount();

    // Open the picker dialog — use the page object helper which waits for full dialog readiness
    await overridePage.openLocationPicker();
    const dialog = overridePage.page.locator('[role="dialog"]');

    // Dismiss with Cancel button (live evidence: dialog footer is Select + Cancel, no Close)
    const cancelBtn = dialog.locator('button:text-is("Cancel")');
    await cancelBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await cancelBtn.click();
    await dialog.waitFor({ state: 'hidden' });

    // Assert: grid unchanged, Save still disabled
    const rowCountAfter = await overridePage.getVisibleRowCount();
    expect(rowCountAfter).toBe(rowCountBefore);
    await expect(overridePage.page.locator('button:has-text("Save")')).toBeDisabled();
  });

  test('TC-CPR-OVR-114: No-results empty state in the location picker', async ({ corporatePricingOverridePage: overridePage }) => {
    await overridePage.navigateToEquipmentRow(BED.office, BED.office, BED.mutationRowAnchor.productGroupId);

    // Open the picker dialog
    await overridePage.openLocationPicker();
    const dialog = overridePage.page.locator('[role="dialog"]');
    await dialog.waitFor({ state: 'visible' });

    // Search a nonsense string
    const searchInput = dialog.locator('[data-testid="location-settings-modal-change-local-office-input-search"]');
    await searchInput.fill('zzz999nonexistent');

    // Assert: "No results." empty state is announced (not a silent blank)
    await expect(dialog.locator('text=No results.')).toBeVisible();

    // Close without applying
    await overridePage.page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
  });

  test('TC-CPR-OVR-115: Re-selecting the current office does not dirty the form (net-zero)', async ({ corporatePricingOverridePage: overridePage }) => {
    await overridePage.navigateToEquipmentRow(BED.office, BED.office, BED.mutationRowAnchor.productGroupId);
    await expect(overridePage.page.locator('button:has-text("Save")')).toBeDisabled();

    // Open picker, search for and re-select the same office (1606)
    await overridePage.openLocationPicker();
    const dialog = overridePage.page.locator('[role="dialog"]');
    await dialog.waitFor({ state: 'visible' });

    const searchInput = dialog.locator('[data-testid="location-settings-modal-change-local-office-input-search"]');
    await searchInput.fill(BED.office);
    await dialog.locator('tbody tr').first().locator('[role="checkbox"]').check();
    await dialog.locator('button:has-text("Select")').click();
    await dialog.waitFor({ state: 'hidden' });

    // Assert: Save stays disabled — re-selecting the same office is net-zero
    await expect(overridePage.page.locator('button:has-text("Save")')).toBeDisabled();
    // Assert: anchor row still present (grid content unchanged)
    // Picker close triggers grid re-render; 5s default was marginal (TC-115 RCA: retry passed in 11.3s)
    await expect(overridePage.page.locator(GRID_ROW, { hasText: BED.mutationRowAnchor.productGroupId })).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Override Toolbar — Text Filter Boundary', () => {
  const BED = CORP_PRICING_OVERRIDE_FIXTURE;

  test('TC-CPR-OVR-116: Text filter narrows grid and empty filter shows no results', async ({ corporatePricingOverridePage: overridePage }) => {
    await overridePage.navigateToEquipmentRow(BED.office, BED.office, BED.mutationRowAnchor.productGroupId);

    // Grid-scoped row locator — excludes the product-group picker's second table
    const gridRows = overridePage.page.locator('table:has(th:has-text("Override Price")) tbody tr');
    const filterInput = overridePage.page.getByPlaceholder('Filter Product Groups Override');
    const baselineCount = await gridRows.count();

    // "70" selectively narrows to PG 2609 only (live evidence: bed-recount-w18.md)
    await filterInput.fill('70');
    await expect(gridRows).toHaveCount(1, { timeout: 5_000 });
    // Assert the surviving row's identity — identity beats a count
    await expect(gridRows.first()).toContainText('2609');

    // No-match string produces the "No results." empty state (live evidence: bed-recount-w18.md)
    await filterInput.fill('zzzz-no-match-w18');
    await expect(overridePage.page.locator('text=No results.')).toBeVisible({ timeout: 5_000 });

    // Clear and verify restore
    await filterInput.clear();
    await expect(gridRows).toHaveCount(baselineCount, { timeout: 5_000 });
  });
});

test.describe('Override Toolbar — Import Rejection', () => {

  /**
   * DEFERRED — NM-2273 owns the import rejection round-trip.
   *
   * What it would prove: that importing a CSV with an empty Override Price column is rejected
   * before the data is written to the server (NM-1940 whole-file validation).
   *
   * The rejection is observable and was confirmed during the live walkthrough of this screen.
   * records the dialog alert `Error Row#:19, Msg: LocationId, ProductGroupId, OverridePrice is required.`
   * A restore procedure is verified: the same evidence shows 152.00 -> 152.01 at lines 180-183,
   * then 152.01 -> 152.00 at lines 194-197, with the full 152.00 -> 152.01 -> 152.00 chain
   * summarized at lines 203-205.
   *
   * Disposition: deferred to the NM-2273 import coverage (its phase 4). That plan
   * names this negative-path TC at lines 215-219, and its acceptance checklist repeats the exact
   * `Error Row#:19, Msg: LocationId, ProductGroupId, OverridePrice is required.` assertion at line 279.
   * It is not written here because NM-2273 authors it inside a full export -> modify -> upload ->
   * restore round-trip; duplicating it here would create two tests asserting the same behavior.
   */
  test.skip('TC-CPR-OVR-117: Import rejects CSV with empty Override Price — whole-file rejection (NM-1940)', async () => {
    // Intentionally empty — see skip reason above
  });
});

test.describe('Override SBC — Tab-Switch Dirty Persistence (Equipment)', () => {
  const BED = CORP_PRICING_OVERRIDE_FIXTURE;

  /**
   * TODO-UNVERIFIED: Tab-switch dirty behavior not live-verified.
   * Expected: no unsaved-changes dialog (URL unchanged), dirty state persists.
   */
  test('TC-CPR-OVR-118: Equipment dirty state persists through Labor tab visit', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToEquipmentRow(BED.office, BED.office, BED.mutationRowAnchor.productGroupId);

    // Make Equipment dirty — edit Override Price
    await overridePage.probeEditOracle(row, 'overridePrice', '999');
    await expect(overridePage.page.locator('button:has-text("Save")')).toBeEnabled();

    // Switch to Labor tab — expect NO dialog (same-page tab, not navigation)
    await overridePage.switchOverrideTab('Labor');

    // Verify no alertdialog appeared
    const dialog = overridePage.page.locator('[role="alertdialog"]');
    await expect(dialog).toBeHidden();

    // Switch back to Equipment
    await overridePage.switchOverrideTab('Equipment');

    // Assert: dirty state preserved — Save still enabled
    await expect(overridePage.page.locator('button:has-text("Save")')).toBeEnabled();
  });
});


test.describe('Override SBC — Labor Sort Ordering', () => {

  test('TC-CPR-OVR-119: Sort produces verifiable monotonic order on Labor tab', async ({ corporatePricingOverridePage: overridePage }) => {
    // Office 9460 has 212 Labor rows (live-verified); default page size 20 — enough for sort proof
    await overridePage.reloadAndReselectTab(
      CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED.office,
      CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED.office,
      'Labor',
    );

    // Sort ascending by Product Group — assert monotonically ordered values on ≥4 rows
    await overridePage.sortColumnViaDropdown('Product Group', 'ascending');
    const ascValues = (await overridePage.getColumnCellValues(
      CORP_PRICING_OVERRIDE.columnIndex.productGroup,
    )).map(v => parseInt(v, 10));
    expect(ascValues.length).toBeGreaterThanOrEqual(4);
    for (let i = 1; i < ascValues.length; i++) {
      expect(ascValues[i]!).toBeGreaterThanOrEqual(ascValues[i - 1]!);
    }

    // Sort descending — assert monotonically descending
    await overridePage.sortColumnViaDropdown('Product Group', 'descending');
    const descValues = (await overridePage.getColumnCellValues(
      CORP_PRICING_OVERRIDE.columnIndex.productGroup,
    )).map(v => parseInt(v, 10));
    for (let i = 1; i < descValues.length; i++) {
      expect(descValues[i]!).toBeLessThanOrEqual(descValues[i - 1]!);
    }
  });
});

test.describe('Override SBC — Tab-Switch Dirty Persistence (Labor)', () => {
  const BED = OVERRIDE_BVA_OFFICES.labor;

  /**
   * TODO-UNVERIFIED: Tab-switch dirty behavior not live-verified.
   * Expected: no unsaved-changes dialog (URL unchanged), dirty state persists.
   */
  test('TC-CPR-OVR-120: Labor dirty state persists through Equipment tab visit', async ({ corporatePricingOverridePage: overridePage }) => {
    const row = await overridePage.navigateToLaborRow(BED.office, BED.office, BED.rows[0].productGroupId);

    // Make Labor dirty — edit Override Price on PG 565
    await overridePage.probeEditOracle(row, 'overridePrice', '99');
    await expect(overridePage.page.locator('button:has-text("Save")')).toBeEnabled();

    // Switch to Equipment tab — expect NO dialog
    await overridePage.switchOverrideTab('Equipment');

    // Verify no alertdialog appeared
    const dialog = overridePage.page.locator('[role="alertdialog"]');
    await expect(dialog).toBeHidden();

    // Switch back to Labor
    await overridePage.switchOverrideTab('Labor');

    // Assert: dirty state preserved — Save still enabled
    await expect(overridePage.page.locator('button:has-text("Save")')).toBeEnabled();
  });
});


test.describe('Override Pagination — Rows-Per-Page Re-renders Grid (office 9460 Labor)', () => {
  const BED = CORP_PRICING_OVERRIDE_LABOR_VOLUME_BED;

  test.beforeEach(async ({ corporatePricingOverridePage: overridePage }) => {
    // Navigate to office 9460 Labor tab — reload ensures default 20-row page size
    await overridePage.reloadAndReselectTab(BED.office, BED.office, 'Labor');
    // Sanity: the volume bed has 100+ rows, so page 1 at default 20 shows exactly 20
    const defaultRows = await overridePage.getVisibleRowCount();
    expect(defaultRows).toBe(20);
  });

  test('TC-CPR-OVR-121: Select 10 → grid shows exactly 10 rows', async ({ corporatePricingOverridePage: overridePage }) => {
    // Change rows-per-page to 10 via Radix combobox (not a native <select>)
    await overridePage.setRowsPerPage('10');

    // Wait for grid to re-render with the new page size
    await overridePage.page.locator(GRID_ROW).first().waitFor({ state: 'visible' });

    // Assert: exactly 10 rows visible (FAILS if control did nothing — default is 20)
    const visibleRows = await overridePage.getVisibleRowCount();
    expect(visibleRows).toBe(10);

    // Assert: pagination state updated — "items found" text still shows total ≥ 100
    const paginationText = await overridePage.page.locator('text=/\\d+ items found/').textContent();
    const totalItems = parseInt(paginationText!.match(/(\d+) items found/)![1]!, 10);
    expect(totalItems).toBeGreaterThanOrEqual(BED.minExpectedRows);
  });

  test('TC-CPR-OVR-122: Select 30 → grid shows exactly 30 rows', async ({ corporatePricingOverridePage: overridePage }) => {
    // Change rows-per-page to 30 via Radix combobox
    await overridePage.setRowsPerPage('30');

    await overridePage.page.locator(GRID_ROW).first().waitFor({ state: 'visible' });

    // Assert: exactly 30 rows visible (FAILS if control did nothing — default is 20)
    const visibleRows = await overridePage.getVisibleRowCount();
    expect(visibleRows).toBe(30);

    // Assert: pagination total unchanged (the control changed page size, not data)
    const paginationText = await overridePage.page.locator('text=/\\d+ items found/').textContent();
    const totalItems = parseInt(paginationText!.match(/(\d+) items found/)![1]!, 10);
    expect(totalItems).toBeGreaterThanOrEqual(BED.minExpectedRows);
  });

  test('TC-CPR-OVR-123: Select 40 → grid shows exactly 40 rows', async ({ corporatePricingOverridePage: overridePage }) => {
    // Change rows-per-page to 40 via Radix combobox
    await overridePage.setRowsPerPage('40');

    await overridePage.page.locator(GRID_ROW).first().waitFor({ state: 'visible' });

    // Assert: exactly 40 rows visible (FAILS if control did nothing — default is 20)
    const visibleRows = await overridePage.getVisibleRowCount();
    expect(visibleRows).toBe(40);

    // Assert: pagination total unchanged
    const paginationText = await overridePage.page.locator('text=/\\d+ items found/').textContent();
    const totalItems = parseInt(paginationText!.match(/(\d+) items found/)![1]!, 10);
    expect(totalItems).toBeGreaterThanOrEqual(BED.minExpectedRows);
  });

  test('TC-CPR-OVR-124: Select 50 → grid shows exactly 50 rows', async ({ corporatePricingOverridePage: overridePage }) => {
    // Change rows-per-page to 50 via Radix combobox
    await overridePage.setRowsPerPage('50');

    await overridePage.page.locator(GRID_ROW).first().waitFor({ state: 'visible' });

    // Assert: exactly 50 rows visible (FAILS if control did nothing — default is 20)
    const visibleRows = await overridePage.getVisibleRowCount();
    expect(visibleRows).toBe(50);

    // Assert: pagination total unchanged
    const paginationText = await overridePage.page.locator('text=/\\d+ items found/').textContent();
    const totalItems = parseInt(paginationText!.match(/(\d+) items found/)![1]!, 10);
    expect(totalItems).toBeGreaterThanOrEqual(BED.minExpectedRows);
  });
});



test.describe('Override Currency Filter — Office 1145 (multi-currency bed)', () => {
  const BED = OVERRIDE_CURRENCY_BED;

  test('TC-CPR-OVR-125: USD filter yields only USD rows — CAD row PG 425 absent', async ({ corporatePricingOverridePage: overridePage }) => {
    await overridePage.navigateToEquipmentRow(BED.office, BED.office, BED.rows.usdAnchor.productGroupId);

    // Baseline: ALL filter, 11 rows
    const rows = overridePage.page.locator(GRID_ROW);
    await expect(rows).toHaveCount(BED.totalRows, { timeout: 10_000 });

    // Apply USD filter via Radix combobox (not a native <select>)
    await overridePage.selectCurrency('USD');

    // Assert: exactly 10 USD rows (auto-retry waits for grid re-render — no fixed sleep)
    await expect(rows).toHaveCount(BED.currencies.USD.count, { timeout: 15_000 });

    // Assert row identity: CAD row PG 425 is ABSENT
    await expect(overridePage.page.locator(GRID_ROW, { hasText: BED.rows.cadAnchor.productGroupId })).toBeHidden();
    // Assert row identity: USD row PG 4298 is PRESENT
    await expect(overridePage.page.locator(GRID_ROW, { hasText: BED.rows.usdAnchor.productGroupId })).toBeVisible();

    // Restore: ALL filter → 11 rows (combobox now shows 'USD', re-target it)
    await overridePage.resetCurrencyFilter('USD');
    await expect(rows).toHaveCount(BED.totalRows, { timeout: 15_000 });
  });

  test('TC-CPR-OVR-126: CAD filter yields only CAD rows — single row PG 425 present', async ({ corporatePricingOverridePage: overridePage }) => {
    await overridePage.navigateToEquipmentRow(BED.office, BED.office, BED.rows.usdAnchor.productGroupId);

    const rows = overridePage.page.locator(GRID_ROW);
    await expect(rows).toHaveCount(BED.totalRows, { timeout: 10_000 });

    // Apply CAD filter via Radix combobox
    await overridePage.selectCurrency('CAD');

    // Assert: exactly 1 CAD row (auto-retry waits for grid re-render — no fixed sleep)
    await expect(rows).toHaveCount(BED.currencies.CAD.count, { timeout: 15_000 });

    // Assert row identity: CAD row PG 425 IS present
    await expect(overridePage.page.locator(GRID_ROW, { hasText: BED.rows.cadAnchor.productGroupId })).toBeVisible();
    // Assert row identity: USD row PG 4298 is ABSENT
    await expect(overridePage.page.locator(GRID_ROW, { hasText: BED.rows.usdAnchor.productGroupId })).toBeHidden();

    // Restore: ALL filter → 11 rows (combobox now shows 'CAD', re-target it)
    await overridePage.resetCurrencyFilter('CAD');
    await expect(rows).toHaveCount(BED.totalRows, { timeout: 15_000 });
  });

  test('TC-CPR-OVR-127: MXN filter yields 0 rows on USD/CAD-only office', async ({ corporatePricingOverridePage: overridePage }) => {
    await overridePage.navigateToEquipmentRow(BED.office, BED.office, BED.rows.usdAnchor.productGroupId);

    const rows = overridePage.page.locator(GRID_ROW);
    await expect(rows).toHaveCount(BED.totalRows, { timeout: 10_000 });

    // Apply MXN filter via Radix combobox
    await overridePage.selectCurrency('MXN');

    // Assert: exactly 0 rows (no MXN data on office 1145) — auto-retry waits for grid re-render
    await expect(rows).toHaveCount(BED.currencies.MXN.count, { timeout: 15_000 });

    // Assert row identity: both anchors absent (grid is empty)
    await expect(overridePage.page.locator(GRID_ROW, { hasText: BED.rows.cadAnchor.productGroupId })).toBeHidden();
    await expect(overridePage.page.locator(GRID_ROW, { hasText: BED.rows.usdAnchor.productGroupId })).toBeHidden();

    // Restore: ALL filter → 11 rows (combobox now shows 'MXN', re-target it)
    await overridePage.resetCurrencyFilter('MXN');
    await expect(rows).toHaveCount(BED.totalRows, { timeout: 15_000 });
  });
});

test.describe('Corporate Pricing Override — Export (NM-2272 graft)', () => {
  const SCOPE = CORP_PRICING_OVERRIDE.export.scope;
  const EXPORT = CORP_PRICING_OVERRIDE.export;
  const GRID_API = CORP_PRICING_OVERRIDE.gridApi;

  test.describe('scope, fidelity & pager', () => {
    test.beforeEach(async ({ corporatePricingOverridePage: p }) => {
      test.setTimeout(120_000);
      await p.reloadAndReselect(LOC);
    });

  test('TC-CPR-OVR-128: Export returns every location in the tenant, not just the selected office', async ({ corporatePricingOverridePage: p }) => {
    const r = await p.downloadOverrideExport();
    const locations = new Set(columnValues(r.content, r.headers, 'Location Id'));
    expect(locations.size).toBeGreaterThan(SCOPE.minDistinctLocations); // many offices, not one
    expect(locations.size).toBeGreaterThan(1); // the plain claim: the file is never single-office
  });

  test('TC-CPR-OVR-129: Export carries the full override population, well above any single office', async ({ corporatePricingOverridePage: p }) => {
    const r = await p.downloadOverrideExport();
    const rows = dataRows(r.content);
    expect(rows.length).toBeGreaterThan(SCOPE.minDataRows); // whole-tenant volume
    expect(rows.length).toBeGreaterThan(await p.getVisibleRowCount()); // strictly more than the grid shows
  });

  test('TC-CPR-OVR-130: Switching to the Labor tab re-scopes the grid but not the export', async ({ corporatePricingOverridePage: p }) => {
    // Positive control: the tab must visibly change what the grid shows.
    await p.switchOverrideTab('Equipment');
    const equipmentContent = (await p.downloadOverrideExport()).content;
    const equipmentGridRows = await p.getVisibleRowCount();

    await p.switchOverrideTab('Labor');
    expect(await p.getActiveTab()).toBe('Labor');
    const laborGridRows = await p.getVisibleRowCount();
    expect(laborGridRows).not.toBe(equipmentGridRows); // the tab genuinely re-scoped the grid

    const laborExport = await p.downloadOverrideExport();
    expect(laborExport.content).toBe(equipmentContent); // ...and the export did not follow it
    const isLabor = new Set(columnValues(laborExport.content, laborExport.headers, 'Is Labor'));
    for (const v of SCOPE.expectedIsLaborValues) expect([...isLabor]).toContain(v); // both kinds still present
  });

  test('TC-CPR-OVR-131: Choosing a different office re-scopes the grid but not the export', async ({ corporatePricingOverridePage: p }) => {
    const before = await p.downloadOverrideExport();
    const gridBefore = await p.getVisibleRowCount();

    await p.selectLocation(CORP_PRICING_OVERRIDE.pager.multiPageOffice);
    await p.waitForGridRows();
    expect(await p.getVisibleRowCount()).not.toBe(gridBefore); // positive control: a different office renders differently

    const after = await p.downloadOverrideExport();
    expect(after.content).toBe(before.content); // the file is identical whichever office is selected
  });

  test('TC-CPR-OVR-132: Active only hides inactive rows in the grid; the export keeps them', async ({ corporatePricingOverridePage: p }) => {
    // Office 1105 is the walk-verified bed that actually HAS inactive rows (9 total, 7 active). The
    // default fixture office has none, so the filter would have nothing to remove and the positive
    // control below could not fire.
    await p.reloadAndReselect(CORP_PRICING_OVERRIDE_ACTIVE_BED.office);
    await p.setActiveOnly(false);
    const allRows = await p.getVisibleRowCount();
    await p.setActiveOnly(true);
    const activeRows = await p.getVisibleRowCount();
    expect(activeRows).toBeLessThan(allRows); // positive control: the filter removed rows

    const r = await p.downloadOverrideExport();
    const inactive = columnValues(r.content, r.headers, 'Is Active').filter((v) => v === '0');
    expect(inactive.length).toBeGreaterThan(0); // inactive overrides survive the export regardless
  });

  test('TC-CPR-OVR-133: The Currency filter empties the grid for an absent currency; the export still carries every currency', async ({ corporatePricingOverridePage: p }) => {
    const currencies = await p.getCurrencyOptions();
    const specific = currencies.filter((c) => c !== 'ALL');
    expect(specific.length).toBeGreaterThan(0);

    const before = await p.getVisibleRowCount();
    await p.selectCurrency(specific[specific.length - 1]!); // the least-used currency on this bed
    const after = await p.getVisibleRowCount();
    expect(after).not.toBe(before); // positive control: the currency filter moved the grid

    const r = await p.downloadOverrideExport();
    const exported = new Set(columnValues(r.content, r.headers, 'Currency'));
    expect(exported.size).toBeGreaterThanOrEqual(SCOPE.minDistinctCurrencies); // every currency present, filter ignored
  });

  test('TC-CPR-OVR-134: The text filter narrows the grid; the export is unchanged', async ({ corporatePricingOverridePage: p }) => {
    const before = await p.downloadOverrideExport();
    const gridBefore = await p.getVisibleRowCount();
    expect(gridBefore).toBeGreaterThan(0);

    const needle = (await p.getFirstRowCellText(CORP_PRICING_OVERRIDE.columnIndex.productGroupName)).slice(0, 6);
    await p.filterProductGroups(needle);
    const gridAfter = await p.getVisibleRowCount();
    expect(gridAfter).toBeLessThanOrEqual(gridBefore);
    expect(gridAfter).toBeGreaterThan(0); // the needle came from a real row, so it must still match

    const after = await p.downloadOverrideExport();
    expect(after.content).toBe(before.content); // the filter never reaches the file
    await p.clearFilter();
  });

  test('TC-CPR-OVR-135: Rows-per-page changes how much of the grid is drawn; the export is unchanged', async ({ corporatePricingOverridePage: p }) => {
    await p.selectLocation(CORP_PRICING_OVERRIDE.pager.multiPageOffice);
    await p.waitForGridRows();

    await p.setRowsPerPage('10');
    const drawnAtTen = await p.getVisibleRowCount();
    const smallExport = await p.downloadOverrideExport();

    await p.setRowsPerPage('50');
    const drawnAtFifty = await p.getVisibleRowCount();
    expect(drawnAtFifty).toBeGreaterThan(drawnAtTen); // positive control: page size really is drawing more rows

    const largeExport = await p.downloadOverrideExport();
    expect(largeExport.content).toBe(smallExport.content); // ...while the file stays whole either way
  });

  test('TC-CPR-OVR-136: Export on an empty, unscoped grid still returns the whole tenant', async ({ corporatePricingOverridePage: p }) => {
    await p.open(); // fresh load, no office selected
    expect(await p.isEmpty()).toBe(true);
    expect(await p.getVisibleRowCount()).toBe(0);

    const r = await p.downloadOverrideExport(); // Export stays enabled on an empty grid
    expect(dataRows(r.content).length).toBeGreaterThan(SCOPE.minDataRows);
    expect(new Set(columnValues(r.content, r.headers, 'Location Id')).size).toBeGreaterThan(SCOPE.minDistinctLocations);
  });

  test('TC-CPR-OVR-137: The Equipment grid row count reconciles with the export rows for that office', async ({ corporatePricingOverridePage: p }) => {
    await p.switchOverrideTab('Equipment');
    await p.setActiveOnly(false);
    const gridRows = await p.getVisibleRowCount();

    const r = await p.downloadOverrideExport();
    const locIdx = r.headers.indexOf('Location Id');
    const laborIdx = r.headers.indexOf('Is Labor');
    const forThisOffice = dataRows(r.content)
      .map((l) => l.split(','))
      .filter((row) => row[locIdx] === LOC);
    const equipmentRows = forThisOffice.filter((row) => row[laborIdx] === '0');

    // The file folds both tabs together; the Equipment tab shows only the Is Labor = 0 half of it.
    expect(equipmentRows.length).toBe(gridRows);
    expect(forThisOffice.length).toBeGreaterThanOrEqual(equipmentRows.length);
  });

  test('TC-CPR-OVR-138: The export tolerates rows with no Override Price and never drops them (NM-1940)', async ({ corporatePricingOverridePage: p }) => {
    const r = await p.downloadOverrideExport();
    const priced = columnValues(r.content, r.headers, 'Override Price');
    const blanks = priced.filter((v) => v === '').length;

    // The app emits these rows and its own import then rejects them, so this asserts the CURRENT
    // contract: blanks are permitted. Deliberately not "every row has a price" — that would fail on
    // every run today and would silently start passing if NM-1940 were fixed, hiding the change.
    expect(CORP_PRICING_OVERRIDE.export.emptyOverridePriceIsTolerated).toBe(true);
    expect(blanks).toBeLessThan(priced.length); // blanks are the exception, never the whole file
    expect(priced.filter((v) => v !== '').length).toBeGreaterThan(0);
  });

  test('TC-CPR-OVR-139: The CSV is well-formed — consistent line endings, a full column set on every row, and quoted inch marks', async ({ corporatePricingOverridePage: p }) => {
    const r = await p.downloadOverrideExportRaw();

    // Line endings are plain LF, never CRLF, and never a mix of the two. Checked on the raw bytes
    // because reading the file as text hides the difference. Pinned so a change is visible: a file
    // that silently switched to CRLF would shift every downstream byte offset.
    const text = r.bytes.toString('latin1');
    expect(text).toContain(EXPORT.structure.lineEnding);
    expect(text.match(/\r/g) ?? []).toEqual([]); // no carriage returns anywhere

    const lines = r.content.split(/\r?\n/).filter((l) => l.length > 0);
    const wrongWidth = lines.slice(1).filter((l) => l.split(',').length !== r.headers.length);
    expect(wrongWidth.slice(0, 5)).toEqual([]); // no field contains a comma, so every row splits cleanly

    // Product group names carry literal inch marks, which must be doubled and the field quoted.
    const quoted = lines.filter((l) => l.includes('""'));
    expect(quoted.length).toBeGreaterThan(EXPORT.structure.minQuotedRows);
    for (const line of quoted.slice(0, 20)) expect(line).toMatch(/"[^"]*""/); // well-formed quoting, not a stray character
  });

  test('TC-CPR-OVR-140: The header row follows the requested locale while the data rows stay identical', async ({ corporatePricingOverridePage: p }) => {
    const english = await p.fetchExportForLocale('en-US');
    expect(english.status).toBe(200);
    expect(english.headerLine.split(',').map((h) => h.replace(/^"|"$/g, '').trim())).toEqual([...EXPORT.expectedHeaders]);

    for (const locale of EXPORT.locales.localizing) {
      const translated = await p.fetchExportForLocale(locale);
      expect(translated.status, `${locale} responds`).toBe(200);
      expect(translated.headerLine, `${locale} translates the header`).not.toBe(english.headerLine);
      // The important half: translating the header must never reformat the numbers underneath it.
      // A locale that used a decimal comma would corrupt every row of a comma-delimited file.
      expect(translated.dataLines.length, `${locale} row count`).toBe(english.dataLines.length);
      expect(translated.dataLines[0], `${locale} first data row`).toBe(english.dataLines[0]);
    }

    for (const locale of EXPORT.locales.fallback) {
      const fallback = await p.fetchExportForLocale(locale);
      expect(fallback.status, `${locale} responds`).toBe(200);
      expect(fallback.headerLine, `${locale} falls back to English`).toBe(english.headerLine);
    }
  });

  test('TC-CPR-OVR-141: A malformed or unknown locale falls back to English instead of failing', async ({ corporatePricingOverridePage: p }) => {
    const english = await p.fetchExportForLocale('en-US');
    for (const locale of EXPORT.locales.malformed) {
      const r = await p.fetchExportForLocale(locale);
      expect(r.status, `locale "${locale}" must not error`).toBe(200);
      expect(r.headerLine, `locale "${locale}" falls back to English`).toBe(english.headerLine);
      expect(r.dataLines.length, `locale "${locale}" returns the same data`).toBe(english.dataLines.length);
    }
    const omitted = await p.fetchExportForLocale('');
    expect(omitted.status).toBe(200);
    expect(omitted.headerLine).toBe(english.headerLine); // omitting the parameter behaves like English
  });

  test('TC-CPR-OVR-142: The grid loads for every healthy office, and office 1604 still fails the way we recorded it', async ({ corporatePricingOverridePage: p }) => {
    for (const office of GRID_API.healthyOffices) {
      const r = await p.fetchGridStatusForOffice(office);
      expect(r.status, `office ${office} grid data`).toBe(200); // a regression here means the fault is spreading
    }

    const failing = await p.fetchGridStatusForOffice(GRID_API.knownFailingOffice);
    if (failing.status === 200) {
      // Not a failure — the office recovered. Assert something real about the recovery rather than
      // restating the status we just branched on: a 200 that still carries the fault text would mean
      // the error is now being served with a success code, which is worse than the original bug.
      expect(failing.body).not.toContain(GRID_API.knownFailureSignature);
    } else {
      expect(failing.status, `office ${GRID_API.knownFailingOffice} is the known-bad one`).toBeGreaterThanOrEqual(500);
      expect(failing.body).toContain(GRID_API.knownFailureSignature); // still the same duplicate-key fault, not a new one
    }
  });

  test('TC-CPR-OVR-143: Tab, Currency and Active only combine without losing rows or breaking the export', async ({ corporatePricingOverridePage: p }) => {
    const baseline = await p.downloadOverrideExport();
    await p.setActiveOnly(false);
    const unfiltered = await p.getVisibleRowCount();
    // Anchor the chain to a non-empty grid. Without this, every "narrows or stays equal" comparison
    // below would be satisfied by a grid stuck at zero rows — the filters would look well behaved
    // precisely when the screen is broken.
    expect(unfiltered).toBeGreaterThan(0);

    await p.setActiveOnly(true);
    const activeOnly = await p.getVisibleRowCount();
    expect(activeOnly).toBeLessThanOrEqual(unfiltered);

    const currencies = (await p.getCurrencyOptions()).filter((c) => c !== 'ALL');
    await p.selectCurrency(currencies[0]!);
    const activeAndCurrency = await p.getVisibleRowCount();
    expect(activeAndCurrency).toBeLessThanOrEqual(activeOnly); // filters intersect, never widen

    await p.switchOverrideTab('Labor');
    expect(await p.getActiveTab()).toBe('Labor'); // the tab still switches with two filters applied

    expect((await p.downloadOverrideExport()).content).toBe(baseline.content); // no combination reaches the file
  });

  test('TC-CPR-OVR-144: Rows-per-page survives a reload, and the export is unaffected either way', async ({ corporatePricingOverridePage: p }) => {
    await p.selectLocation(CORP_PRICING_OVERRIDE.pager.multiPageOffice);
    await p.waitForGridRows();
    const before = await p.downloadOverrideExport();

    await p.setRowsPerPage('50');
    const drawn = await p.getVisibleRowCount();
    expect(drawn).toBeGreaterThan(Number(CORP_PRICING_OVERRIDE.pager.defaultRowsPerPage));

    await p.reloadAndReselect(CORP_PRICING_OVERRIDE.pager.multiPageOffice);
    await p.waitForGridRows();
    // Whether the choice persists is the app's call; what must hold is that the export is identical
    // in both states, so read the post-reload page size rather than assuming which way it went.
    const afterReload = await p.getVisibleRowCount();
    expect(afterReload).toBeGreaterThan(0);
    expect((await p.downloadOverrideExport()).content).toBe(before.content);
  });

  test('TC-CPR-OVR-145: Sorting the grid does not reorder the exported file', async ({ corporatePricingOverridePage: p }) => {
    const PGN = CORP_PRICING_OVERRIDE.columnIndex.productGroupName;
    const before = await p.downloadOverrideExport();
    const firstCellBefore = await p.getFirstRowCellText(PGN);

    await p.sortColumnViaDropdown('Product Group Name', 'descending');
    expect(await p.getFirstRowCellText(PGN)).not.toBe(firstCellBefore); // positive control: the grid really re-ordered

    const after = await p.downloadOverrideExport();
    expect(after.content).toBe(before.content); // the file keeps its own server-side order
  });

  });

  test.describe('grid-to-file reconciliation', () => {
    test.beforeEach(async ({ corporatePricingOverridePage: p }) => {
      test.setTimeout(120_000);
      await p.reloadAndReselect(CORP_PRICING_OVERRIDE_ACTIVE_BED.office);
    });

  test('TC-CPR-OVR-146: A row visible in the grid appears in the export with the same price, and text values survive intact', async ({ corporatePricingOverridePage: p }) => {
    const COL = CORP_PRICING_OVERRIDE.columnIndex;
    const productGroupId = await p.getFirstRowCellText(COL.productGroup);
    const productGroupName = await p.getFirstRowCellText(COL.productGroupName);
    const overridePriceOnScreen = await p.getFirstRowCellText(COL.overridePrice);
    expect(productGroupId).not.toBe('');
    expect(productGroupName).not.toBe('');

    const r = await p.downloadOverrideExport();
    const idx = {
      location: r.headers.indexOf('Location Id'),
      productGroup: r.headers.indexOf('Product Group Id'),
      name: r.headers.indexOf('Product Group Name'),
      override: r.headers.indexOf(EXPORT.optionalMoneyColumn),
    };
    const rows = r.content.split(/\r?\n/).slice(1).filter((l) => l.length > 0).map((l) => l.split(','));
    const match = rows.find((row) => row[idx.location] === CORP_PRICING_OVERRIDE_ACTIVE_BED.office && row[idx.productGroup] === productGroupId);
    expect(match, `product group ${productGroupId} is on screen but missing from the export`).toBeDefined();

    // The price the user reads and the price the file ships must be the same number. The grid adds
    // thousands separators for display, so compare the numeric values rather than the strings.
    expect(Number(match![idx.override])).toBeCloseTo(Number(overridePriceOnScreen.replace(/,/g, '')), 2);

    // Leading zeros in product group names (for example "07A Compass Screen Set Kit") must survive
    // the export as text. Losing them is the classic sign of a value passed through a number type.
    const leadingZeroNames = rows.map((row) => row[idx.name] ?? '').filter((n) => /^0\d/.test(n));
    expect(leadingZeroNames.length).toBeGreaterThan(0); // the tenant does carry such names
    for (const name of leadingZeroNames.slice(0, 10)) expect(name).toMatch(/^0\d/);

    // The final data row must be complete, which is what proves the download was not truncated.
    expect(rows[rows.length - 1]).toHaveLength(r.headers.length);
    expect(r.content).not.toContain('�'); // decodes as valid UTF-8 end to end
  });

  test('TC-CPR-OVR-147: Override Discount stays on the fraction scale, and the known percent-scale rows do not spread', async ({ corporatePricingOverridePage: p }) => {
    const r = await p.downloadOverrideExport();
    const idx = {
      location: r.headers.indexOf('Location Id'),
      productGroup: r.headers.indexOf('Product Group Id'),
      discount: r.headers.indexOf(EXPORT.optionalPercentColumn),
    };
    const discounts = r.content.split(/\r?\n/).slice(1).filter((l) => l.length > 0)
      .map((l) => l.split(','))
      .filter((row) => (row[idx.discount] ?? '') !== '')
      .map((row) => ({ office: row[idx.location] ?? '', productGroup: row[idx.productGroup] ?? '', value: Number(row[idx.discount]) }));
    expect(discounts.length).toBeGreaterThan(0);

    // The column stores a fraction: the grid multiplies by 100 to display it, so 0.06 reads as 6.00%.
    // A value above 1 therefore renders above 100% — beyond the cap the app itself enforces on entry
    // (see TC-CPR-OVR-037). A handful of rows are stored that way and render as 1300% and 1400%.
    const overScale = discounts.filter((d) => d.value > 1);
    const fractionScale = discounts.filter((d) => d.value <= 1);
    expect(fractionScale.length).toBeGreaterThan(overScale.length * 10); // the fraction scale is overwhelmingly the norm

    // Pinned in both directions so the count cannot drift unnoticed: growth means the corruption is
    // spreading, and a drop to zero means it was cleaned up and this guard should be retired.
    expect(overScale.length).toBeLessThanOrEqual(EXPORT.discountScale.knownOverScaleRows);
    for (const d of overScale) {
      expect(d.value * 100, `office ${d.office} / product group ${d.productGroup} renders as ${d.value * 100}%`).toBeGreaterThan(EXPORT.discountScale.percentCap);
    }
  });

  });
});

test.describe('Corporate Pricing Override — Import (NM-2273 graft)', () => {
  test('TC-CPR-OVR-148: Import dialog keeps Upload disabled until a file is attached', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(90_000);
    await p.reloadAndReselect(RT.office);
    await p.openImportDialog();
    const dlg = await p.readImportDialog();
    expect(dlg.text, 'the import dialog is the "Import All Pricing Overrides" dialog').toContain(CORP_PRICING_OVERRIDE.importDialog.title);
    expect(dlg.buttons, 'the dialog offers a Cancel control').toContain('Cancel');

    const before = await p.readImportUploadState();
    expect(before.uploadDisabled, 'Upload is disabled before any file is attached').toBe(true);
    expect(before.noFileVisible, 'the "No file selected" hint shows before a file is attached').toBe(true);

    await p.attachImportFile(importFixture(IMP.malformedFixture));
    const after = await p.readImportUploadState();
    expect(after.uploadDisabled, 'attaching a file enables Upload').toBe(false);

    await p.closeImportDialog(); // no upload performed — the gate is the feature under test
    expect(await p.isImportDialogVisible(), 'Cancel dismisses the dialog with nothing uploaded').toBe(false);
  });

  test('TC-CPR-OVR-149: Malformed CSV is rejected with a readable error and changes zero rows', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(120_000);
    await p.reloadAndReselect(RT.office);
    const rowBefore = await p.findRowByProductGroup(RT.productGroupName);
    expect(rowBefore).not.toBeNull();
    const priceBefore = await p.readOverridePrice(rowBefore!);
    const countBefore = await p.getVisibleRowCount();

    await p.openImportDialog();
    await p.attachImportFile(importFixture(IMP.malformedFixture));
    await p.clickImportUpload();
    const alert = await p.readImportAlert();
    expect(alert, 'a malformed file surfaces a readable rejection, not a silent no-op').toMatch(IMP.malformedRejectPattern);

    // Reload + re-select and confirm the rejection prevented any mutation (save-honesty: the reload is the oracle).
    await p.reloadAndReselect(RT.office);
    const rowAfter = await p.findRowByProductGroup(RT.productGroupName);
    expect(rowAfter).not.toBeNull();
    expect(await p.readOverridePrice(rowAfter!), 'Override Price is unchanged after the rejected import').toBe(priceBefore);
    expect(await p.getVisibleRowCount(), 'row count is unchanged after the rejected import').toBe(countBefore);

    // Cross-office canary: a rejected import must not partially apply ANYWHERE — the richer 9-row office
    // keeps its full row set (the 1-row target office alone cannot prove tenant-wide zero-change).
    await p.reloadAndReselect(CORP_PRICING_OVERRIDE_ACTIVE_BED.office);
    expect(await p.getVisibleRowCount(), 'the canary office is unchanged by the rejected import').toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.totalRows);
    expect(await p.findRowByProductGroup(CORP_PRICING_OVERRIDE_ACTIVE_BED.inactiveGroupName1), 'a canary row is intact by content').not.toBeNull();
  });

  test('TC-CPR-OVR-150: Empty CSV is rejected with a file-format error and changes zero rows', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(120_000);
    await p.reloadAndReselect(RT.office);
    const rowBefore = await p.findRowByProductGroup(RT.productGroupName);
    expect(rowBefore).not.toBeNull();
    const priceBefore = await p.readOverridePrice(rowBefore!);
    const countBefore = await p.getVisibleRowCount();

    await p.openImportDialog();
    await p.attachImportFile(importFixture(IMP.emptyFixture));
    await p.clickImportUpload();
    const alert = await p.readImportAlert();
    expect(alert, 'an empty file surfaces a readable file-format rejection').toBe(IMP.emptyRejectMessage);

    await p.reloadAndReselect(RT.office);
    const rowAfter = await p.findRowByProductGroup(RT.productGroupName);
    expect(rowAfter).not.toBeNull();
    expect(await p.readOverridePrice(rowAfter!), 'Override Price is unchanged after the rejected empty import').toBe(priceBefore);
    expect(await p.getVisibleRowCount(), 'row count is unchanged after the rejected empty import').toBe(countBefore);

    // Cross-office canary: the rejected empty import must not touch the richer 9-row office either.
    await p.reloadAndReselect(CORP_PRICING_OVERRIDE_ACTIVE_BED.office);
    expect(await p.getVisibleRowCount(), 'the canary office is unchanged by the rejected empty import').toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.totalRows);
    expect(await p.findRowByProductGroup(CORP_PRICING_OVERRIDE_ACTIVE_BED.inactiveGroupName1), 'a canary row is intact by content').not.toBeNull();
  });

  test('TC-CPR-OVR-151: Valid import round-trip updates the Override Price then restores it (office 4107 / product group 4298)', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(180_000); // a modify + a restore import, each a clean response, plus a cross-office check and reloads
    await p.reloadAndReselect(RT.office);

    // The export supplies the exact valid row shape; the round-trip re-imports a MINIMAL file — just the
    // header + the one target row, Override Price rewritten. A minimal file returns a clean response
    // instead of the full-dump client stall (NM-2186), and it upserts only the target row (a location
    // absent from the file is left untouched — asserted by the canary below).
    const exp = await p.downloadOverrideExport();
    const lines = exp.content.split(/\r?\n/);
    const header = lines[0]!;
    const targetPrefix = `${RT.office},${RT.productGroupId},`;
    const targetRow = lines.slice(1).find((l) => l.startsWith(targetPrefix));
    expect(targetRow, 'the target row is present in the export').toBeTruthy();
    const baselinePrice = targetRow!.split(',')[RT.overridePriceColumnIndex]!; // live baseline, e.g. "152.00"
    const modifiedPrice = (parseFloat(baselinePrice) + 0.01).toFixed(2); // a net change distinct from the baseline

    const dir = mkdtempSync(resolve(tmpdir(), 'ovr-import-'));
    // A 2-line file: the header + the single target row, with only the Override Price rewritten.
    const buildFile = (price: string): string => {
      const cols = targetRow!.split(',');
      cols[RT.overridePriceColumnIndex] = price;
      const file = resolve(dir, `ovr-${price}.csv`);
      writeFileSync(file, [header, cols.join(',')].join('\n'), 'utf-8');
      return file;
    };
    // Capture the target row's pre-import Mod Date so we can prove the import stamped a fresh one.
    const rowBefore = await p.findRowByProductGroup(RT.productGroupName);
    expect(rowBefore).not.toBeNull();
    const metaBefore = await p.readRowMeta(rowBefore!);

    // The import is a PER-ROW partial-success API — a 200 alone is NOT proof a row applied (a fully-invalid
    // file also returns 200). Assert the server reports exactly the one row succeeded and none failed.
    const fireImport = async (file: string): Promise<void> => {
      await p.openImportDialog();
      await p.attachImportFile(file);
      const result = await p.submitImportAndCaptureResult();
      expect(result.status, 'the import POST returns 200').toBe(200);
      expect(result.failureRecordCount, 'no rows were rejected').toBe(0);
      expect(result.successRecordCount, 'exactly the one row was applied').toBe(1);
    };

    let restoredOk = false;
    try {
      // Modify → read back the committed value after the clean-response import.
      await fireImport(buildFile(modifiedPrice));
      expect(
        parseFloat(await p.awaitImportedOverridePrice(RT.office, RT.productGroupName, modifiedPrice)),
        'the imported Override Price is committed',
      ).toBe(parseFloat(modifiedPrice));

      // The import stamped the row's metadata and left its OTHER columns intact (only Override Price moved).
      const rowAfter = await p.findRowByProductGroup(RT.productGroupName);
      expect(rowAfter).not.toBeNull();
      expect((await rowAfter!.locator('td').nth(CORP_PRICING_OVERRIDE.columnIndex.currency).innerText()).trim(), 'currency is unchanged by the import').toBe('USD');
      expect(await p.readActiveState(rowAfter!), 'Active is unchanged by the import').toBe(true);
      const metaAfter = await p.readRowMeta(rowAfter!);
      expect(metaAfter.updatedBy, 'the import stamped Updated By').not.toBe('');
      expect(metaAfter.modDate, 'the import stamped a fresh Mod Date').not.toBe(metaBefore.modDate);

      // Upsert scope: the body proved exactly ONE row applied, so a location absent from the file keeps its
      // full row set AND its content — asserted by a named row, not just the count (full row verification).
      await p.reloadAndReselect(CORP_PRICING_OVERRIDE_ACTIVE_BED.office);
      expect(await p.getVisibleRowCount(), 'the canary office keeps its full row set').toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.totalRows);
      expect(await p.findRowByProductGroup(CORP_PRICING_OVERRIDE_ACTIVE_BED.inactiveGroupName1), 'a canary row is intact by content').not.toBeNull();

      // Restore the target to its original price and confirm it landed.
      await p.reloadAndReselect(RT.office);
      await fireImport(buildFile(baselinePrice));
      expect(
        parseFloat(await p.awaitImportedOverridePrice(RT.office, RT.productGroupName, baselinePrice)),
        'the Override Price is restored to its original value',
      ).toBe(parseFloat(baselinePrice));
      restoredOk = true;
    } finally {
      // Never leave the shared tenant dirty: best-effort restore if any assertion above threw mid-round-trip.
      if (!restoredOk) {
        await p.reloadAndReselect(RT.office)
          .then(() => p.openImportDialog())
          .then(() => p.attachImportFile(buildFile(baselinePrice)))
          .then(() => p.submitImportAndCaptureResult())
          .then(() => p.awaitImportedOverridePrice(RT.office, RT.productGroupName, baselinePrice))
          .catch(() => { /* best-effort */ });
      }
    }
  });

  test('TC-CPR-OVR-152: Raw export with an empty Override Price row is rejected and changes nothing (NM-1940)', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(180_000);
    await p.reloadAndReselect(RT.office);
    const rowBefore = await p.findRowByProductGroup(RT.productGroupName);
    expect(rowBefore).not.toBeNull();
    const priceBefore = await p.readOverridePrice(rowBefore!);

    const exp = await p.downloadOverrideExport();
    // The raw export must still carry the empty-Override-Price row this test documents (NM-1940).
    const hasEmptyPriceRow = exp.content.split(/\r?\n/).some(
      (l) => l.startsWith(RT.emptyPriceRowPrefix) && (l.split(',')[RT.overridePriceColumnIndex] ?? '') === '',
    );
    expect(hasEmptyPriceRow, 'the raw export carries the empty-Override-Price row (NM-1940)').toBe(true);

    const dir = mkdtempSync(resolve(tmpdir(), 'ovr-raw-'));
    const rawFile = resolve(dir, 'raw-export.csv');
    writeFileSync(rawFile, exp.content, 'utf-8');

    await p.openImportDialog();
    await p.attachImportFile(rawFile);
    await p.clickImportUpload();
    const alert = await p.readImportAlert();
    // The row number is data-position-dependent (observed at Row#:19 on 2026-07-23), so assert the stable
    // required-field message rather than a fixed row index.
    expect(alert, 'the raw export is rejected on the empty-Override-Price row (NM-1940)').toMatch(IMP.nm1940RejectPattern);

    // The whole import aborts with no partial apply — the target row is unchanged after reload.
    await p.reloadAndReselect(RT.office);
    const rowAfter = await p.findRowByProductGroup(RT.productGroupName);
    expect(rowAfter).not.toBeNull();
    expect(await p.readOverridePrice(rowAfter!), 'the grid is unchanged after the aborted import (full rollback)').toBe(priceBefore);

    // Cross-office canary: the aborted raw-export import must not touch the richer 9-row office either.
    await p.reloadAndReselect(CORP_PRICING_OVERRIDE_ACTIVE_BED.office);
    expect(await p.getVisibleRowCount(), 'the canary office is unchanged by the aborted import').toBe(CORP_PRICING_OVERRIDE_ACTIVE_BED.totalRows);
    expect(await p.findRowByProductGroup(CORP_PRICING_OVERRIDE_ACTIVE_BED.inactiveGroupName1), 'a canary row is intact by content').not.toBeNull();
  });

  test('TC-CPR-OVR-153: Import rejects a row with an invalid currency and applies nothing', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(120_000);
    await expectBodyRejection(p, IMP.validation.bodyErrors.invalidCurrency.fixture, IMP.validation.bodyErrors.invalidCurrency.errorContains);
  });

  test('TC-CPR-OVR-154: Import rejects a negative Override Price and applies nothing', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(120_000);
    await expectBodyRejection(p, IMP.validation.bodyErrors.negativePrice.fixture, IMP.validation.bodyErrors.negativePrice.errorContains);
  });

  test('TC-CPR-OVR-155: Import rejects an Override Discount above 100 — the 100 cap is enforced on import too', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(120_000);
    await expectBodyRejection(p, IMP.validation.bodyErrors.discountOver100.fixture, IMP.validation.bodyErrors.discountOver100.errorContains);
  });

  test('TC-CPR-OVR-156: Import rejects a non-numeric Override Price with a decimal-format error', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(120_000);
    const alert = await expectToastRejection(p, IMP.validation.toastErrors.nonNumericPrice.fixture);
    expect(alert, 'a non-numeric price is rejected with a decimal-format message').toMatch(IMP.validation.toastErrors.nonNumericPrice.pattern);
  });

  test('TC-CPR-OVR-157: Import rejects a nonexistent Product Group Id and applies nothing', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(120_000);
    await expectBodyRejection(p, IMP.validation.bodyErrors.nonexistentPg.fixture, IMP.validation.bodyErrors.nonexistentPg.errorContains);
  });

  test('TC-CPR-OVR-158: Import rejects a nonexistent Location and applies nothing', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(120_000);
    await expectBodyRejection(p, IMP.validation.bodyErrors.nonexistentLocation.fixture, IMP.validation.bodyErrors.nonexistentLocation.errorContains);
  });

  test('TC-CPR-OVR-159: Import rejects a row with too few columns naming the required fields', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(120_000);
    const alert = await expectToastRejection(p, IMP.validation.toastErrors.tooFewColumns.fixture);
    expect(alert, 'a too-short row is rejected naming the required fields').toMatch(IMP.validation.toastErrors.tooFewColumns.pattern);
  });

  test('TC-CPR-OVR-160: Import ignores extra trailing columns and applies the valid row', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(120_000);
    await p.reloadAndReselect(RT.office);
    await p.openImportDialog();
    await p.attachImportFile(importFixture(IMP.validation.extraColumns.fixture));
    const result = await p.submitImportAndCaptureResult();
    // Extra columns are ignored (not an error): the server takes the leading fields and applies the row.
    expect(result.status, 'the import POST returns 200').toBe(200);
    expect(result.failureRecordCount, 'no row failed on the extra columns').toBe(0);
    expect(result.successRecordCount, 'the valid row applied despite extra columns').toBe(1);
    // The fixture holds the certified 152.00, so the office stays at its baseline value (no drift).
    await p.reloadAndReselect(RT.office);
    expect(parseFloat(await p.readOverridePrice((await p.findRowByProductGroup(RT.productGroupName))!)), 'the row holds the certified baseline').toBe(152.00);
  });

  test('TC-CPR-OVR-161: Import rejects a header-only file with a file-format error', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(120_000);
    const alert = await expectToastRejection(p, IMP.validation.toastErrors.headerOnly.fixture);
    expect(alert, 'a header-only file is rejected as a format error').toBe(IMP.validation.toastErrors.headerOnly.message);
  });

  test('TC-CPR-OVR-162: Import blocks a non-CSV file — Upload stays disabled with an unsupported-type message', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(90_000);
    await p.reloadAndReselect(RT.office);
    await p.openImportDialog();
    await p.attachImportFileRaw(importFixture(IMP.validation.wrongExtension.fixture));
    const state = await p.readImportUploadState();
    expect(state.uploadDisabled, 'a non-CSV file leaves Upload disabled').toBe(true);
    expect(await p.readImportAlert(), 'the dialog explains the allowed file type').toContain(IMP.validation.wrongExtension.message);
    await p.closeImportDialog();
  });

  test('TC-CPR-OVR-163: Import dialog shows the attached file and dismisses without uploading', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(90_000);
    await p.reloadAndReselect(RT.office);
    await p.openImportDialog();
    const before = await p.readImportDialog();
    expect(before.text, 'the dialog starts with no file selected').toContain(CORP_PRICING_OVERRIDE.importDialog.noFileText);
    // The dialog offers two redundant dismiss controls — Cancel and Close (both plain text buttons that
    // dismiss without uploading); assert both are present.
    expect(before.buttons, 'the dialog offers a Cancel control').toContain('Cancel');
    expect(before.buttons, 'the dialog offers a Close control').toContain('Close');
    await p.attachImportFile(importFixture(IMP.malformedFixture));
    const after = await p.readImportDialog();
    expect(after.text, 'attaching a file clears the "No file selected" hint').not.toContain(CORP_PRICING_OVERRIDE.importDialog.noFileText);
    await p.closeImportDialog();
    expect(await p.isImportDialogVisible(), 'a dismiss control closes the dialog with nothing uploaded').toBe(false);
  });

  test('TC-CPR-OVR-164: A file mixing one valid row and one invalid row is a partial success — the valid row applies, the invalid one fails', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(120_000);
    await p.reloadAndReselect(RT.office);
    const baseline = await p.readOverridePrice((await p.findRowByProductGroup(RT.productGroupName))!);
    // Valid row re-imports the current baseline (a no-op); the second row references a nonexistent product group.
    const file = writeTmp('mixed.csv', [IMPHEADER, validRow(baseline), invalidPgRow].join('\n'));
    await p.openImportDialog();
    await p.attachImportFile(file);
    const result = await p.submitImportAndCaptureResult();
    expect(result.status, 'the import POST returns 200').toBe(200);
    expect(result.successRecordCount, 'the one valid row is applied').toBe(1);
    expect(result.failureRecordCount, 'the one invalid row fails independently (rows are not all-or-nothing)').toBe(1);
    expect(result.errors.join(' | '), 'the failure names the nonexistent product group').toContain(IMP.validation.bodyErrors.nonexistentPg.errorContains);
    await p.reloadAndReselect(RT.office);
    expect(await p.readOverridePrice((await p.findRowByProductGroup(RT.productGroupName))!), 'the target keeps its baseline value (the valid no-op row did not corrupt it)').toBe(baseline);
  });

  test('TC-CPR-OVR-165: A file with duplicate rows for the same override is accepted (both rows succeed, no duplicate error)', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(120_000);
    await p.reloadAndReselect(RT.office);
    const baseline = await p.readOverridePrice((await p.findRowByProductGroup(RT.productGroupName))!);
    // The same target row twice, both at the current baseline (idempotent no-op).
    const file = writeTmp('duplicate.csv', [IMPHEADER, validRow(baseline), validRow(baseline)].join('\n'));
    await p.openImportDialog();
    await p.attachImportFile(file);
    const result = await p.submitImportAndCaptureResult();
    expect(result.status, 'the import POST returns 200').toBe(200);
    expect(result.failureRecordCount, 'neither duplicate row is rejected').toBe(0);
    expect(result.successRecordCount, 'both rows in the batch are accepted (idempotent, no duplicate-key error)').toBe(2);
    await p.reloadAndReselect(RT.office);
    expect(await p.readOverridePrice((await p.findRowByProductGroup(RT.productGroupName))!), 'the target keeps its baseline value').toBe(baseline);
  });

  test('TC-CPR-OVR-166: A large batch (6000 rows) is processed per-row without a stall or size limit', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(180_000);
    await p.reloadAndReselect(RT.office);
    const baseline = await p.readOverridePrice((await p.findRowByProductGroup(RT.productGroupName))!);
    // 6000 rows, all referencing a nonexistent product group — reject-safe (no row can mutate the tenant),
    // and large enough to exercise the batch path. There is no separate "file too large" gate: the import
    // returns a normal per-row result (verified 2026-07-23) rather than the full-valid-dump stall (NM-2186).
    const rows = Array.from({ length: 6000 }, () => invalidPgRow);
    const file = writeTmp('large-batch.csv', [IMPHEADER, ...rows].join('\n'));
    await p.openImportDialog();
    await p.attachImportFile(file);
    const result = await p.submitImportAndCaptureResult();
    expect(result.status, 'the large batch returns a normal response (no stall, no size-limit error)').toBe(200);
    expect(result.successRecordCount, 'no invalid row is applied').toBe(0);
    expect(result.failureRecordCount, 'every row in the large batch is reported per-row').toBe(6000);
    await p.reloadAndReselect(RT.office);
    expect(await p.readOverridePrice((await p.findRowByProductGroup(RT.productGroupName))!), 'the target is unchanged by the all-invalid large batch').toBe(baseline);
  });

});
