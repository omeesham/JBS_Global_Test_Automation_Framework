import { test, expect } from '../../src/fixtures/pages.fixture';
import {
  CORP_PRICING_OVERRIDE,
  CORP_PRICING_OVERRIDE_FIXTURE,
  OVERRIDE_NUMERIC_CASES,
} from '../../src/data/corporate-pricing/override';
import { saveAndVerifyCase } from '../../src/utils/field-case-runner';

/**
 * Corporate Pricing — Product Group Override screen, full field-coverage (NM-1463).
 * TC-CPR-OVR-001..528. Live-grounded 2026-06-09.
 *
 * RESOLVED: the grid IS editable for the automation user (an earlier exploration's "inert cells"
 * was a false negative). Edit = click the Override Price / Max Discount cell `div[role=button]` → an
 * active `spinbutton` reveals → native value-setter (React-controlled; `.fill()` does not commit) +
 * `Enter` commits → Save enables. Active = Radix `checkbox` (a per-table boolean render format) toggles + dirties.
 * Save → "Save Changes" alertdialog → `POST /navigator/api/location/corporate-price-pg-override` (filter the
 * backend API path, never the page URL) → toast "Pricing overrides saved successfully." Net-zero verified
 * (revert-to-original disables Save). NM-1870 / NM-1889 not-reproduced (live verdicts recorded).
 *
 * MUTATION SAFETY: only the save-cycle describe commits, on the dedicated Override fixture row 2605
 * (`House Video Monitor - Specialty`, default Override Price 445.00) — distinct screen/data-model from the
 * Strategy/Detail fixtures (zero collision). Each save-cycle restores via the bounded-retry
 * `ensureDefaultState()` (throws on residual drift). Read/filter/edit-behavior describes never commit.
 * Heavy page (server-loaded grid) → per-test timeout raised where a reload stack runs.
 */

const LOC = CORP_PRICING_OVERRIDE_FIXTURE.office; // location picker search needle ('1604')
const ANCHOR = CORP_PRICING_OVERRIDE_FIXTURE.mutationRowAnchor.productGroupName;
const ANCHOR_ID = CORP_PRICING_OVERRIDE_FIXTURE.mutationRowAnchor.productGroupId;
const DEFAULTS = {
  overridePrice: CORP_PRICING_OVERRIDE_FIXTURE.mutationRowAnchor.overridePriceDefault,
  active: CORP_PRICING_OVERRIDE_FIXTURE.mutationRowAnchor.activeDefault,
};

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Corporate Pricing — Product Group Override: read, structure & filters @corporate-pricing @override', () => {
  test.beforeEach(async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(90_000);
    await p.reloadAndReselect(LOC); // baseline: fresh nav + location-select per test
  });

  test('TC-CPR-OVR-001: Override screen loads with Equipment selected by default', async ({ corporatePricingOverridePage: p }) => {
    expect(p.page.url()).toContain('/corporate-pricing/pg-override');
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
    await expect(p.page.getByText('Select a location').first()).toBeVisible();
  });

  test('TC-CPR-OVR-004: Selecting a location populates the grid with the anchor row', async ({ corporatePricingOverridePage: p }) => {
    expect(await p.getVisibleRowCount()).toBeGreaterThan(0);
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

  test('TC-CPR-OVR-008: Labor tab shows the empty state for office 1604 with headers rendered', async ({ corporatePricingOverridePage: p }) => {
    await p.switchOverrideTab('Labor');
    expect(await p.getActiveTab()).toBe('Labor');
    expect(await p.getVisibleRowCount()).toBe(0); // 1604 has no Labor overrides
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
    expect(await p.getVisibleRowCount()).toBeGreaterThan(0);
  });

  test('TC-CPR-OVR-016: Filter tolerates whitespace and special characters without crashing', async ({ corporatePricingOverridePage: p }) => {
    await p.filterProductGroups('   ');
    await p.filterProductGroups('@#$%^&*');
    await p.clearFilter();
    expect(await p.getVisibleRowCount()).toBeGreaterThan(0); // app still responsive, rows restored
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Corporate Pricing — Product Group Override: Override Price / Max Discount edit behavior @corporate-pricing @override', () => {
  test.beforeEach(async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(90_000);
    // Per-test baseline: enforce the row's VALUE baseline per-test (not just reload). TC-519 reverts to the
    // hardcoded default and asserts Save disables (net-zero) — if a prior save-cycle hard-kill left
    // the row drifted off 445.00, a reload-only baseline would false-fail it against correct app
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

  // BUG-CPR-OVR-001 — Max Discount over 100 silently TRAPS focus (no error shown, no way to leave the field).
  // Parked as fixme: the OLD assertion below (">100 rejected" === PASS) MASKED this defect — a binary
  // "did it commit?" check cannot see a silent focus-trap (no error node, no state change). Reproduced
  // live by hand on the Pricing Detail grid (2026-06-09, value 333 / pricebook 2022-PB10); the same >100
  // reject mechanic appears here on Override (editor will not commit) so the trap likely repeats, but is
  // NOT human-confirmed here. We do NOT know the correct behavior until Encore fixes the field and it is
  // live — decide then whether >100 should (a) show an error + release focus, (b) clamp to 100, or
  // (c) be allowed, then un-fixme and re-assert against the intended behavior (an out-of-range entry
  // must surface a visible signal and must never trap focus). Do NOT re-green the old assertion: the
  // current ">100 silently rejected" result is the defect under report, not a pass.
  test.fixme('TC-CPR-OVR-023: Max Discount % — out-of-range (>100) handling [blocked: BUG-CPR-OVR-001 silent focus-trap; intended behavior unknown until fixed & live]', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    // a normal percentage commits and dirties the form
    expect(await p.tryMaxDiscount(row!, OVERRIDE_NUMERIC_CASES.maxDiscount.edited)).toBe(true); // 10
    expect(await p.isOverrideSaveEnabled()).toBe(true);
    // a decimal percentage commits
    expect(await p.tryMaxDiscount(row!, OVERRIDE_NUMERIC_CASES.maxDiscount.decimal)).toBe(true); // 12.5
    // >100: the editor does not commit — the OLD assertion below treated that as correct, but it is the
    // bug surface (BUG-CPR-OVR-001: silent trap, no error, no escape). Re-assert real behavior once fixed.
    expect(await p.tryMaxDiscount(row!, OVERRIDE_NUMERIC_CASES.maxDiscount.overHundred)).toBe(false); // 150
  });

  test('TC-CPR-OVR-024: Toggling the Active checkbox dirties the form (Save enables)', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    const before = await p.readActiveState(row!);
    await p.toggleActive(row!);
    expect(await p.readActiveState(row!)).toBe(!before);
    expect(await p.isOverrideSaveEnabled()).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
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
        expect(parseFloat(await p.readOverridePrice(row!))).toBe(parseFloat(OVERRIDE_NUMERIC_CASES.overridePrice.edited));
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
