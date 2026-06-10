import { test, expect } from '../../src/fixtures/pages.fixture';
import {
  CORP_PRICING_OVERRIDE,
  CORP_PRICING_OVERRIDE_FIXTURE,
  OVERRIDE_NUMERIC_CASES,
} from '../../src/data/corporate-pricing/override';
import { saveAndVerifyCase } from '../../src/utils/field-case-runner';

/**
 * Corporate Pricing — Product Group Override screen, full FCC (Wave-1.5-A, NM-1463).
 * TC-LOC-CPR-501..528. Live-grounded 2026-06-09 (`field-inventories/corporate-pricing-override-2026-06-09.md`).
 *
 * Q-WV15-1 RESOLVED: the grid IS editable for the automation user (the 2026-06-08 recon's "inert cells"
 * was a false negative). Edit = click the Override Price / Max Discount cell `div[role=button]` → an
 * active `spinbutton` reveals → native value-setter (React-controlled; `.fill()` does not commit) +
 * `Enter` commits → Save enables. Active = Radix `checkbox` (LR-036 4th render format) toggles + dirties.
 * Save → "Save Changes" alertdialog → `POST /navigator/api/location/corporate-price-pg-override` (LR-056,
 * never the page URL) → toast "Pricing overrides saved successfully." LR-009 net-zero verified
 * (revert-to-original disables Save). NM-1870 / NM-1889 not-reproduced (live verdicts in the field-inventory).
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
    await p.reloadAndReselect(LOC); // LR-019 baseline: fresh nav + location-select per test
  });

  test('TC-LOC-CPR-501: Override screen loads with Equipment selected by default', async ({ corporatePricingOverridePage: p }) => {
    expect(p.page.url()).toContain('/corporate-pricing/pg-override');
    expect(await p.getActiveTab()).toBe('Equipment');
  });

  test('TC-LOC-CPR-502: Equipment + Labor tabs render and switching flips aria-selected', async ({ corporatePricingOverridePage: p }) => {
    await p.switchOverrideTab('Labor');
    expect(await p.getActiveTab()).toBe('Labor');
    await p.switchOverrideTab('Equipment');
    expect(await p.getActiveTab()).toBe('Equipment');
  });

  test('TC-LOC-CPR-503: Grid is location-gated — empty before a location is selected', async ({ corporatePricingOverridePage: p }) => {
    await p.open(); // fresh load, no location chosen
    expect(await p.isEmpty()).toBe(true); // "No results." visible
    expect(await p.getVisibleRowCount()).toBe(0); // no data rows until a location is picked
    await expect(p.page.getByText('Select a location').first()).toBeVisible();
  });

  test('TC-LOC-CPR-504: Selecting a location populates the grid with the anchor row', async ({ corporatePricingOverridePage: p }) => {
    expect(await p.getVisibleRowCount()).toBeGreaterThan(0);
    expect(await p.findRowByProductGroup(ANCHOR)).not.toBeNull();
  });

  test('TC-LOC-CPR-505: Grid renders all 10 column headers in order', async ({ corporatePricingOverridePage: p }) => {
    const headers = (await p.getColumnHeaders()).join(' | ');
    for (const col of CORP_PRICING_OVERRIDE.gridColumns) expect(headers).toContain(col);
  });

  // NM-1870 ("Current Price not displayed") not-reproduced — Current Price renders a value here.
  test('TC-LOC-CPR-506: Current Price column renders a value', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    expect(row).not.toBeNull();
    const current = (await row!.locator('td').nth(CORP_PRICING_OVERRIDE.columnIndex.currentPrice).innerText()).trim();
    expect(current).toMatch(/\d/); // a value (e.g. "0.00"), not blank — Current Price IS displayed
  });

  test('TC-LOC-CPR-507: Active column renders as a Radix checkbox with readable aria-checked (LR-036)', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    expect(row).not.toBeNull();
    const state = await p.readActiveState(row!);
    expect(typeof state).toBe('boolean'); // aria-checked resolves to a real boolean, not empty textContent
  });

  test('TC-LOC-CPR-508: Labor tab shows the empty state for office 1604 with headers rendered', async ({ corporatePricingOverridePage: p }) => {
    await p.switchOverrideTab('Labor');
    expect(await p.getActiveTab()).toBe('Labor');
    expect(await p.getVisibleRowCount()).toBe(0); // 1604 has no Labor overrides
    const headers = (await p.getColumnHeaders()).join(' | ');
    expect(headers).toContain('Override Price'); // structure still renders
  });

  test('TC-LOC-CPR-509: Currency filter offers ALL/USD/CAD/MXN', async ({ corporatePricingOverridePage: p }) => {
    const opts = await p.getCurrencyOptions();
    for (const c of CORP_PRICING_OVERRIDE.currencyOptions) expect(opts).toContain(c);
  });

  test('TC-LOC-CPR-510: Active-only filter defaults OFF and toggles', async ({ corporatePricingOverridePage: p }) => {
    expect(await p.getActiveOnlyState()).toBe(CORP_PRICING_OVERRIDE.activeOnlyDefault); // false
    await p.setActiveOnly(true);
    expect(await p.getActiveOnlyState()).toBe(true);
    await p.setActiveOnly(false);
    expect(await p.getActiveOnlyState()).toBe(false);
  });

  test('TC-LOC-CPR-511: Rows-per-page offers 10/20/30/40/50', async ({ corporatePricingOverridePage: p }) => {
    const opts = await p.getRowsPerPageOptions();
    for (const o of CORP_PRICING_OVERRIDE.rowsPerPageOptions) expect(opts).toContain(o);
  });

  test('TC-LOC-CPR-512: Client filter by Product Group Name narrows the grid', async ({ corporatePricingOverridePage: p }) => {
    const before = await p.getVisibleRowCount();
    await p.filterProductGroups('House Video');
    const after = await p.getVisibleRowCount();
    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThanOrEqual(before);
    expect(await p.findRowByProductGroup(ANCHOR)).not.toBeNull();
  });

  test('TC-LOC-CPR-513: Client filter by Product Group ID narrows to the matching row', async ({ corporatePricingOverridePage: p }) => {
    await p.filterProductGroups(ANCHOR_ID);
    expect(await p.findRowByProductGroup(ANCHOR)).not.toBeNull();
    expect(await p.getVisibleRowCount()).toBeGreaterThan(0);
  });

  // NM-1889 ("search matches unintended columns") not-reproduced — the filter is scoped to ID + Name.
  test('TC-LOC-CPR-514: Client filter is scoped to ID and Name only', async ({ corporatePricingOverridePage: p }) => {
    // A Currency value ("USD") appears in every row's Currency column but in no Product Group ID/Name.
    await p.filterProductGroups('USD');
    expect(await p.getVisibleRowCount()).toBe(0); // filter does NOT match the Currency column → no over-match
    await p.clearFilter();
    expect(await p.getVisibleRowCount()).toBeGreaterThan(0);
  });

  test('TC-LOC-CPR-515: No-match filter empties the grid; clearing restores rows', async ({ corporatePricingOverridePage: p }) => {
    await p.filterProductGroups('zzz-no-such-group-zzz');
    expect(await p.getVisibleRowCount()).toBe(0);
    await p.clearFilter();
    expect(await p.getVisibleRowCount()).toBeGreaterThan(0);
  });

  test('TC-LOC-CPR-516: Filter tolerates whitespace and special characters without crashing', async ({ corporatePricingOverridePage: p }) => {
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
    // LR-019: enforce the row's VALUE baseline per-test (not just reload). TC-519 reverts to the
    // hardcoded default and asserts Save disables (net-zero) — if a prior save-cycle hard-kill left
    // the row drifted off 445.00, a reload-only baseline would false-fail it against correct app
    // behavior. ensureDefaultState subsumes reloadAndReselect (it reload+reselects internally) and is
    // a cheap read-only no-op when the row is already at default.
    await p.ensureDefaultState(ANCHOR, DEFAULTS, LOC);
  });

  test('TC-LOC-CPR-517: Clicking the Override Price cell reveals an editable numeric input', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    expect(row).not.toBeNull();
    const editorValue = await p.peekOverridePriceEditor(row!); // opens spinbutton, reads, Escapes (no change)
    expect(parseFloat(editorValue)).toBe(parseFloat(DEFAULTS.overridePrice)); // editor exposes the current value
  });

  test('TC-LOC-CPR-518: Editing the Override Price enables Save (dirty)', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    await p.setOverridePrice(row!, OVERRIDE_NUMERIC_CASES.overridePrice.edited);
    expect(await p.isOverrideSaveEnabled()).toBe(true);
  });

  // LR-009 net-zero: reverting to the saved value leaves no net change, so Save disables again.
  test('TC-LOC-CPR-519: Reverting the Override Price to its original value disables Save', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    await p.setOverridePrice(row!, OVERRIDE_NUMERIC_CASES.overridePrice.edited);
    expect(await p.isOverrideSaveEnabled()).toBe(true);
    await p.setOverridePrice(row!, DEFAULTS.overridePrice); // back to original
    expect(await p.isOverrideSaveEnabled()).toBe(false); // net-zero detected, form clean
  });

  test('TC-LOC-CPR-520: Override Price accepts a decimal value', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    await p.setOverridePrice(row!, OVERRIDE_NUMERIC_CASES.overridePrice.decimal);
    expect(parseFloat(await p.readOverridePrice(row!))).toBe(parseFloat(OVERRIDE_NUMERIC_CASES.overridePrice.decimal));
    expect(await p.isOverrideSaveEnabled()).toBe(true);
  });

  test('TC-LOC-CPR-521: Override Price accepts boundary values (0 and a large number)', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    await p.setOverridePrice(row!, OVERRIDE_NUMERIC_CASES.overridePrice.zero);
    expect(parseFloat(await p.readOverridePrice(row!))).toBe(0);
    await p.setOverridePrice(row!, OVERRIDE_NUMERIC_CASES.overridePrice.large);
    expect(parseFloat(await p.readOverridePrice(row!))).toBe(parseFloat(OVERRIDE_NUMERIC_CASES.overridePrice.large));
  });

  test('TC-LOC-CPR-522: Override Price input rejects non-numeric text (LR-011)', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    const retained = await p.probeOverridePriceInput(row!, OVERRIDE_NUMERIC_CASES.overridePrice.nonNumeric); // "abc"
    expect(/[a-z]/i.test(retained)).toBe(false); // type=number coerces non-numeric to "" — no alpha retained
  });

  // BUG-CPR-001 — Max Discount over 100 silently TRAPS focus (no error shown, no way to leave the field).
  // Parked as fixme: the OLD assertion below (">100 rejected" === PASS) MASKED this defect — a binary
  // "did it commit?" oracle cannot see a silent focus-trap (no error node, no state change). Reproduced
  // live by hand on the Pricing Detail grid (2026-06-09, value 333 / pricebook 2022-PB10); the same >100
  // reject mechanic appears here on Override (editor will not commit) so the trap likely repeats, but is
  // NOT human-confirmed here. We do NOT know the correct behavior until Encore fixes the field and it is
  // live — decide then whether >100 should (a) show an error + release focus, (b) clamp to 100, or
  // (c) be allowed, then un-fixme and re-assert against the intended behavior (an out-of-range entry
  // must surface a visible signal and must never trap focus). Do NOT re-green the old assertion: the
  // current ">100 silently rejected" result is the defect under report, not a pass.
  test.fixme('TC-LOC-CPR-523: Max Discount % — out-of-range (>100) handling [blocked: BUG-CPR-001 silent focus-trap; intended behavior unknown until fixed & live]', async ({ corporatePricingOverridePage: p }) => {
    const row = await p.findRowByProductGroup(ANCHOR);
    // a normal percentage commits and dirties the form
    expect(await p.tryMaxDiscount(row!, OVERRIDE_NUMERIC_CASES.maxDiscount.edited)).toBe(true); // 10
    expect(await p.isOverrideSaveEnabled()).toBe(true);
    // a decimal percentage commits
    expect(await p.tryMaxDiscount(row!, OVERRIDE_NUMERIC_CASES.maxDiscount.decimal)).toBe(true); // 12.5
    // >100: the editor does not commit — the OLD assertion below treated that as correct, but it is the
    // bug surface (BUG-CPR-001: silent trap, no error, no escape). Re-assert real behavior once fixed.
    expect(await p.tryMaxDiscount(row!, OVERRIDE_NUMERIC_CASES.maxDiscount.overHundred)).toBe(false); // 150
  });

  test('TC-LOC-CPR-524: Toggling the Active checkbox dirties the form (Save enables)', async ({ corporatePricingOverridePage: p }) => {
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
    await p.ensureDefaultState(ANCHOR, DEFAULTS, LOC); // belt-and-suspenders restore (LR-019)
  });

  test('TC-LOC-CPR-525: Override Price save-cycle persists after reload and restores', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(150_000);
    await saveAndVerifyCase({
      id: 'TC-LOC-CPR-525',
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

  test('TC-LOC-CPR-526: Max Discount % save-cycle persists after reload and restores', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(150_000);
    await saveAndVerifyCase({
      id: 'TC-LOC-CPR-526',
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

  test('TC-LOC-CPR-527: Active toggle save-cycle persists after reload and restores', async ({ corporatePricingOverridePage: p }) => {
    test.setTimeout(150_000);
    let original: boolean = DEFAULTS.active;
    await saveAndVerifyCase({
      id: 'TC-LOC-CPR-527',
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

  test('TC-LOC-CPR-528: Save opens the "Save Changes" dialog; Cancel aborts without committing', async ({ corporatePricingOverridePage: p }) => {
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
