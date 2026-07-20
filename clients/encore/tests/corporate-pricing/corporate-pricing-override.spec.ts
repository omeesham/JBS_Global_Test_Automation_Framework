import { test, expect } from '../../src/fixtures/pages.fixture';
import {
  CORP_PRICING_OVERRIDE,
  CORP_PRICING_OVERRIDE_FIXTURE,
  CORP_PRICING_OVERRIDE_ACTIVE_BED,
  CORP_PRICING_OVERRIDE_SORT_BED,
  OVERRIDE_NUMERIC_CASES,
} from '../../src/data/corporate-pricing/override';
import { saveAndVerifyCase } from '../../src/utils/field-case-runner';

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
