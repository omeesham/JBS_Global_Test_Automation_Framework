// spec: specs_planning/test-plans/locations/locations_pricing_test_plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../setup/fixtures';
import {
  PRICING_COLUMN_HEADERS,
  PRIMARY_PRICING_DROPDOWNS,
  CURRENCY_FILTER_OPTIONS,
  MULTI_ALT_PRICEBOOKS,
  PRIMARY_TEST_ROW,
  SECONDARY_TEST_ROW,
  ECOMMERCE_TEST_ROW,
} from '../../test-data/locations/location-pricing.data';
import { OFFICE_NO } from '../../test-data/common.data';

test.describe.serial('Location Pricing @locations @pricing', () => {
  // MNT-010: describe-level default timeout. Only TC-001 (90s) and persistence tests (120s) override.
  test.setTimeout(60_000);

  // ── Navigate ONCE -- all subsequent tests reuse this page state ──────────────
  test('TC-LOC-PRI-001: Verify Pricing tab default state', async ({ locationPricingPage }) => {
    test.setTimeout(90_000);
    await locationPricingPage.navigateToPricingTab(OFFICE_NO);
    // Pre-cleanup: reset test rows that may be dirty from a previously failed run.
    for (const row of [PRIMARY_TEST_ROW, SECONDARY_TEST_ROW, ECOMMERCE_TEST_ROW]) {
      const state = await locationPricingPage.getIsAlternativeState(row);
      if (state.checked) {
        await locationPricingPage.uncheckIsAlternative(row);
      }
    }
    await locationPricingPage.clickSave();
    await locationPricingPage.reloadPricingTab(OFFICE_NO);
    expect(locationPricingPage.getCurrentUrl()).toContain('locations/1604/settings');
    const corp = await locationPricingPage.getCheckboxState('chkCorporatePricing');
    expect(corp.checked, 'Corporate Pricing should be checked by default').toBe(true);
    const priceGuide = await locationPricingPage.getCheckboxState('chkPriceGuideInclusive');
    expect(priceGuide.checked, 'Price Guide Inclusive should be checked by default').toBe(true);
    const currFilter = await locationPricingPage.getCurrencyFilterValue();
    expect(currFilter).toBe('All');
  });

  test('TC-LOC-PRI-002: Verify Primary Pricing fields default state (5 editable dropdowns)', async ({ locationPricingPage }) => {
    for (const key of PRIMARY_PRICING_DROPDOWNS) {
      const enabled = await locationPricingPage.isDropdownEnabled(key);
      expect(enabled, `${key} should be enabled when Corporate Pricing is checked`).toBe(true);
    }
  });

  test('TC-LOC-PRI-003: Verify Location Secondary Pricing grid structure (7 columns)', async ({ locationPricingPage }) => {
    const headers = await locationPricingPage.getColumnHeaders();
    expect(headers).toEqual([...PRICING_COLUMN_HEADERS]);
    expect(await locationPricingPage.isGridRowVisible(PRIMARY_TEST_ROW)).toBe(true);
  });

  test('TC-LOC-PRI-004: Verify grid row default state (all unchecked)', async ({ locationPricingPage }) => {
    // TC: Check 2021-Tier 3 Urban A and 2022-eCommerce rows -- both should have Is Alternative
    // unchecked with cascaded fields disabled.
    for (const row of [PRIMARY_TEST_ROW, SECONDARY_TEST_ROW]) {
      const isAlt = await locationPricingPage.getIsAlternativeState(row);
      expect(isAlt.checked, `${row} Is Alternative should be unchecked`).toBe(false);
      const useDate = await locationPricingPage.getUseEffectiveDateState(row);
      expect(useDate.disabled, `${row} Use Effective Date should be disabled`).toBe(true);
      expect(await locationPricingPage.isStartDateEnabled(row), `${row} Start Date should be disabled`).toBe(false);
      expect(await locationPricingPage.isEndDateEnabled(row), `${row} End Date should be disabled`).toBe(false);
    }
  });

  test('TC-LOC-PRI-005: Enable Use Effective Date by checking Is Alternative', async ({ locationPricingPage }) => {
    // TC: 2021-Tier 3 Urban A row -- check Is Alternative -> Use Effective Date becomes enabled
    const before = await locationPricingPage.getUseEffectiveDateState(PRIMARY_TEST_ROW);
    expect(before.disabled, 'Use Effective Date should start disabled').toBe(true);
    await locationPricingPage.checkIsAlternative(PRIMARY_TEST_ROW);
    const after = await locationPricingPage.getUseEffectiveDateState(PRIMARY_TEST_ROW);
    expect(after.disabled, 'Use Effective Date should be enabled after Is Alternative checked').toBe(false);
    // Cleanup
    await locationPricingPage.resetGridRow(PRIMARY_TEST_ROW);
  });

  test('TC-LOC-PRI-006: Use Effective Date disabled cannot be clicked when Is Alternative unchecked', async ({ locationPricingPage }) => {
    // TC: 2022-eCommerce row -- Is Alternative unchecked, Use Effective Date disabled
    const isAlt = await locationPricingPage.getIsAlternativeState(SECONDARY_TEST_ROW);
    expect(isAlt.checked).toBe(false);
    const useDate = await locationPricingPage.getUseEffectiveDateState(SECONDARY_TEST_ROW);
    expect(useDate.disabled, 'Use Effective Date should be disabled when Is Alternative unchecked').toBe(true);
    // Verify Is Alternative still unchecked (no accidental toggle)
    const isAltAfter = await locationPricingPage.getIsAlternativeState(SECONDARY_TEST_ROW);
    expect(isAltAfter.checked).toBe(false);
  });

  test('TC-LOC-PRI-007: Full cascade -- Is Alternative + Use Effective Date enables Start/End Date', async ({ locationPricingPage }) => {
    // TC: 2021-Tier 3 Urban A row -- full cascade enables date fields
    expect(await locationPricingPage.isStartDateEnabled(PRIMARY_TEST_ROW)).toBe(false);
    expect(await locationPricingPage.isEndDateEnabled(PRIMARY_TEST_ROW)).toBe(false);
    await locationPricingPage.checkIsAlternative(PRIMARY_TEST_ROW);
    const useDate = await locationPricingPage.getUseEffectiveDateState(PRIMARY_TEST_ROW);
    expect(useDate.disabled).toBe(false);
    await locationPricingPage.checkUseEffectiveDate(PRIMARY_TEST_ROW);
    expect(await locationPricingPage.isStartDateEnabled(PRIMARY_TEST_ROW), 'Start Date should be enabled').toBe(true);
    expect(await locationPricingPage.isEndDateEnabled(PRIMARY_TEST_ROW), 'End Date should be enabled').toBe(true);
    // Cleanup
    await locationPricingPage.resetGridRow(PRIMARY_TEST_ROW);
  });

  test('TC-LOC-PRI-008: Start/End Date remain disabled when Use Effective Date unchecked', async ({ locationPricingPage }) => {
    // TC: 2022-NP LB1 row -- Is Alternative checked, Use Effective Date unchecked -> dates disabled
    await locationPricingPage.checkIsAlternative(ECOMMERCE_TEST_ROW);
    const useDate = await locationPricingPage.getUseEffectiveDateState(ECOMMERCE_TEST_ROW);
    expect(useDate.disabled).toBe(false);
    expect(useDate.checked, 'Use Effective Date should still be unchecked').toBe(false);
    expect(await locationPricingPage.isStartDateEnabled(ECOMMERCE_TEST_ROW)).toBe(false);
    expect(await locationPricingPage.isEndDateEnabled(ECOMMERCE_TEST_ROW)).toBe(false);
    // Cleanup
    await locationPricingPage.resetGridRow(ECOMMERCE_TEST_ROW);
  });

  test('TC-LOC-PRI-009: Uncheck Use Effective Date clears Start/End Date values', async ({ locationPricingPage }) => {
    // TC: 2021-Tier 3 Urban A row -- enter dates, uncheck Use Effective Date, re-check -> dates cleared
    await locationPricingPage.enableFullCascade(PRIMARY_TEST_ROW);
    await locationPricingPage.enterStartDate(PRIMARY_TEST_ROW, '03/01/2026');
    await locationPricingPage.enterEndDate(PRIMARY_TEST_ROW, '03/31/2026');
    await locationPricingPage.uncheckUseEffectiveDate(PRIMARY_TEST_ROW);
    await locationPricingPage.checkUseEffectiveDate(PRIMARY_TEST_ROW);
    const startVal = await locationPricingPage.getStartDateValue(PRIMARY_TEST_ROW);
    const endVal = await locationPricingPage.getEndDateValue(PRIMARY_TEST_ROW);
    expect(startVal, 'Start Date should be cleared after unchecking Use Effective Date').toBe('');
    expect(endVal, 'End Date should be cleared after unchecking Use Effective Date').toBe('');
    // Cleanup
    await locationPricingPage.resetGridRow(PRIMARY_TEST_ROW);
  });

  test('TC-LOC-PRI-010: Uncheck Is Alternative disables and clears all row fields', async ({ locationPricingPage }) => {
    // TC: 2021-Tier 3 Urban A row -- configure cascade + date, uncheck Is Alternative -> all cleared
    await locationPricingPage.enableFullCascade(PRIMARY_TEST_ROW);
    await locationPricingPage.enterStartDate(PRIMARY_TEST_ROW, '02/15/2026');
    await locationPricingPage.uncheckIsAlternative(PRIMARY_TEST_ROW);
    const useDate = await locationPricingPage.getUseEffectiveDateState(PRIMARY_TEST_ROW);
    expect(useDate.disabled, 'Use Effective Date should be disabled').toBe(true);
    expect(useDate.checked, 'Use Effective Date should be unchecked').toBe(false);
    expect(await locationPricingPage.isStartDateEnabled(PRIMARY_TEST_ROW), 'Start Date should be disabled').toBe(false);
    expect(await locationPricingPage.isEndDateEnabled(PRIMARY_TEST_ROW), 'End Date should be disabled').toBe(false);
  });

  test('TC-LOC-PRI-011: Corporate Pricing unchecked disables all Primary pricing dropdowns', async ({ locationPricingPage }) => {
    const before = await locationPricingPage.verifyPrimaryDropdownStates(PRIMARY_PRICING_DROPDOWNS, true);
    expect(before.allPassed, before.failures.join('; ')).toBe(true);
    await locationPricingPage.uncheckCheckbox('chkCorporatePricing');
    const after = await locationPricingPage.verifyPrimaryDropdownStates(PRIMARY_PRICING_DROPDOWNS, false);
    expect(after.allPassed, after.failures.join('; ')).toBe(true);
    // Restore
    await locationPricingPage.checkCheckbox('chkCorporatePricing');
  });

  test('TC-LOC-PRI-012: Corporate Pricing toggle does NOT disable grid fields', async ({ locationPricingPage }) => {
    // TC: 2021-Tier 3 Urban A row -- configure Is Alternative + Use Effective Date, uncheck Corporate Pricing
    // -> grid fields remain enabled
    await locationPricingPage.checkIsAlternative(PRIMARY_TEST_ROW);
    await locationPricingPage.checkUseEffectiveDate(PRIMARY_TEST_ROW);
    await locationPricingPage.uncheckCheckbox('chkCorporatePricing');
    const isAlt = await locationPricingPage.getIsAlternativeState(PRIMARY_TEST_ROW);
    expect(isAlt.disabled, 'Is Alternative should remain enabled').toBe(false);
    const useDate = await locationPricingPage.getUseEffectiveDateState(PRIMARY_TEST_ROW);
    expect(useDate.disabled, 'Use Effective Date should remain enabled').toBe(false);
    // Restore
    await locationPricingPage.checkCheckbox('chkCorporatePricing');
    await locationPricingPage.resetGridRow(PRIMARY_TEST_ROW);
  });

  test('TC-LOC-PRI-013: Re-enable Primary fields by checking Corporate Pricing', async ({ locationPricingPage }) => {
    await locationPricingPage.uncheckCheckbox('chkCorporatePricing');
    const disabled = await locationPricingPage.verifyPrimaryDropdownStates(PRIMARY_PRICING_DROPDOWNS, false);
    expect(disabled.allPassed, disabled.failures.join('; ')).toBe(true);
    await locationPricingPage.checkCheckbox('chkCorporatePricing');
    const enabled = await locationPricingPage.verifyPrimaryDropdownStates(PRIMARY_PRICING_DROPDOWNS, true);
    expect(enabled.allPassed, enabled.failures.join('; ')).toBe(true);
  });

  test('TC-LOC-PRI-014: Currency filter displays "All" by default', async ({ locationPricingPage }) => {
    const value = await locationPricingPage.getCurrencyFilterValue();
    expect(value).toBe('All');
  });

  test('TC-LOC-PRI-015: Currency filter dropdown has expected options', async ({ locationPricingPage }) => {
    // MCP-verified 2026-03-02: office 1604 has only USD rows -- 2 options only.
    const options = await locationPricingPage.getCurrencyFilterOptions();
    expect(options).toEqual([...CURRENCY_FILTER_OPTIONS]);
  });

  test('TC-LOC-PRI-016: Filter grid by selecting USD keeps USD rows visible', async ({ locationPricingPage }) => {
    // MCP-verified 2026-03-02: office 1604 has ONLY USD rows -- selecting USD shows same count.
    // TC validates: filter applies, USD rows remain visible, reset to All restores default.
    const beforeCount = await locationPricingPage.getGridRowCount();
    await locationPricingPage.selectCurrencyFilter('USD');
    const afterCount = await locationPricingPage.getGridRowCount();
    // All rows are USD so count unchanged
    expect(afterCount, 'Row count should be same when all rows are USD').toBe(beforeCount);
    expect(
      await locationPricingPage.isGridRowVisible(PRIMARY_TEST_ROW),
      'Primary USD row should remain visible when filtering USD',
    ).toBe(true);
    // Reset filter
    await locationPricingPage.selectCurrencyFilter('All');
  });

  test('TC-LOC-PRI-017: Primary pricing dropdowns accept selections', async ({ locationPricingPage }) => {
    const corp = await locationPricingPage.getCheckboxState('chkCorporatePricing');
    expect(corp.checked).toBe(true);
    const enabled = await locationPricingPage.isDropdownEnabled('drpPrimaryLaborPricing');
    expect(enabled, 'Primary Labor Pricing should be enabled').toBe(true);
    // Note: Specific option selection verified in TC-026. This test validates interactability.
  });

  test('TC-LOC-PRI-018: Start Date validates -- readOnly input prevents invalid date entry', async ({ locationPricingPage }) => {
    // TC intent: verify Start Date field validates (cannot accept invalid input).
    // Adaptation: Radix date picker input is readOnly -- only calendar selection is allowed.
    await locationPricingPage.enableFullCascade(PRIMARY_TEST_ROW);
    const isReadOnly = await locationPricingPage.isStartDateReadOnly(PRIMARY_TEST_ROW);
    expect(isReadOnly, 'Start Date input should be readOnly (prevents invalid manual entry)').toBe(true);
    // Open the Start Date popover to reveal the validation tooltip for missing date
    await locationPricingPage.openStartDatePopover(PRIMARY_TEST_ROW);
    const hasError = await locationPricingPage.hasDateValidationError();
    expect(hasError, 'Validation error should appear for missing Start Date').toBe(true);
    await locationPricingPage.closeDatePopover();
    // Cleanup
    await locationPricingPage.resetGridRow(PRIMARY_TEST_ROW);
  });

  test('TC-LOC-PRI-019: End Date validates -- readOnly input prevents invalid date entry', async ({ locationPricingPage }) => {
    // TC intent: verify End Date field validates (cannot accept invalid input).
    // Adaptation: Radix date picker input is readOnly -- only calendar selection is allowed.
    await locationPricingPage.enableFullCascade(PRIMARY_TEST_ROW);
    const isReadOnly = await locationPricingPage.isEndDateReadOnly(PRIMARY_TEST_ROW);
    expect(isReadOnly, 'End Date input should be readOnly (prevents invalid manual entry)').toBe(true);
    // Without selecting a date from the calendar, the field should remain empty
    const endVal = await locationPricingPage.getEndDateValue(PRIMARY_TEST_ROW);
    expect(endVal, 'End Date should be empty before calendar selection').toBe('');
    // Open End Date popover to check validation tooltip
    await locationPricingPage.openEndDatePopover(PRIMARY_TEST_ROW);
    const hasError = await locationPricingPage.hasDateValidationError();
    expect(hasError, 'Validation error should appear for missing End Date').toBe(true);
    await locationPricingPage.closeDatePopover();
    // Cleanup
    await locationPricingPage.resetGridRow(PRIMARY_TEST_ROW);
  });

  test('TC-LOC-PRI-021: Multiple price books can have alternate pricing simultaneously', async ({ locationPricingPage }) => {
    // TC: 2021-Tier 3 Urban A, 2022-eCommerce, 2022-NP LB1 -- all checked concurrently
    for (const pb of MULTI_ALT_PRICEBOOKS) {
      await locationPricingPage.checkIsAlternative(pb);
    }
    for (const pb of MULTI_ALT_PRICEBOOKS) {
      const state = await locationPricingPage.getIsAlternativeState(pb);
      expect(state.checked, `${pb} should be checked`).toBe(true);
    }
    // Cleanup
    for (const pb of MULTI_ALT_PRICEBOOKS) {
      await locationPricingPage.resetGridRow(pb);
    }
  });

  test('TC-LOC-PRI-022: Grid validates all rows -- missing date shows validation error', async ({ locationPricingPage }) => {
    // TC: Row 1 (2021-Tier 3 Urban A) cascade without dates -- missing required dates triggers validation.
    //     Row 2 (2022-eCommerce) cascade with valid start date 05/01/2026.
    //     Grid-level validation catches row 1's missing required dates.
    await locationPricingPage.enableFullCascade(PRIMARY_TEST_ROW);
    await locationPricingPage.enableFullCascade(SECONDARY_TEST_ROW);
    await locationPricingPage.enterStartDate(SECONDARY_TEST_ROW, '05/01/2026');
    // Verify row 2 has valid date set
    const validStart = await locationPricingPage.getStartDateValue(SECONDARY_TEST_ROW);
    expect(validStart).toContain('05/01/2026');
    // Open row 1 Start Date popover to reveal validation tooltip
    await locationPricingPage.openStartDatePopover(PRIMARY_TEST_ROW);
    const hasError = await locationPricingPage.hasDateValidationError();
    expect(hasError, 'Validation error should appear for missing dates on row 1').toBe(true);
    await locationPricingPage.closeDatePopover();
    // Row 1 start date should be empty (no calendar selection made)
    const emptyStart = await locationPricingPage.getStartDateValue(PRIMARY_TEST_ROW);
    expect(emptyStart, 'Row 1 Start Date should be empty without calendar selection').toBe('');
    // Cleanup: reset both rows (no save needed -- TC-023 uses reloadPricingTab for isolation)
    await locationPricingPage.resetGridRow(PRIMARY_TEST_ROW);
    await locationPricingPage.resetGridRow(SECONDARY_TEST_ROW);
  });

  // ── Save-dependent / persistence tests (TC-020, TC-023-030) ─────────────────

  test('TC-LOC-PRI-020: Valid dates persist after save', async ({ locationPricingPage }) => {
    // TC: 2021-Tier 3 Urban A row -- enter valid dates, save, reload, verify persistence
    await locationPricingPage.enableFullCascade(PRIMARY_TEST_ROW);
    await locationPricingPage.enterStartDate(PRIMARY_TEST_ROW, '04/01/2026');
    await locationPricingPage.enterEndDate(PRIMARY_TEST_ROW, '04/30/2026');
    await locationPricingPage.clickSave();
    // Reload page and return to Pricing tab to verify persistence
    await locationPricingPage.reloadPricingTab(OFFICE_NO);
    const startVal = await locationPricingPage.getStartDateValue(PRIMARY_TEST_ROW);
    const endVal = await locationPricingPage.getEndDateValue(PRIMARY_TEST_ROW);
    expect(startVal).toContain('04/01/2026');
    expect(endVal).toContain('04/30/2026');
    const isAlt = await locationPricingPage.getIsAlternativeState(PRIMARY_TEST_ROW);
    expect(isAlt.checked).toBe(true);
    const useDate = await locationPricingPage.getUseEffectiveDateState(PRIMARY_TEST_ROW);
    expect(useDate.checked).toBe(true);
    // Cleanup: reset the row so it doesn't persist test data
    await locationPricingPage.resetGridRow(PRIMARY_TEST_ROW);
    await locationPricingPage.clickSave();
  });

  test('TC-LOC-PRI-023: Verify Pricing tab has dedicated Save button', async ({ locationPricingPage }) => {
    // TC: Pricing tab has a dedicated Save button that enables when form is dirty.
    // MCP-verified: button[data-testid="location-settings-btn-save"] exists on Pricing tab.
    // Note: serial test state means prior tests may have left dirty form -- we focus
    // on verifying Save button functionality (exists + enables on change) not initial state.
    await locationPricingPage.navigateToPricingTab(OFFICE_NO);
    // Uncheck Corporate Pricing -- a top-level Angular form control that reliably enables Save
    await locationPricingPage.uncheckCheckbox('chkCorporatePricing');
    const saveEnabled = await locationPricingPage.waitForSaveEnabled();
    expect(saveEnabled, 'Save should be enabled after unchecking Corporate Pricing').toBe(true);
    // Restore original state and save
    await locationPricingPage.checkCheckbox('chkCorporatePricing');
    await locationPricingPage.clickSave();
  });

  // ── Checkbox persistence (TC-024, TC-025) — MNT-008: data-driven loop ──────
  const CHECKBOX_PERSISTENCE_CASES = [
    { tcId: 'TC-LOC-PRI-024', key: 'chkPriceGuideInclusive', label: 'Price Guide Inclusive' },
    { tcId: 'TC-LOC-PRI-025', key: 'chkCorporatePricing', label: 'Corporate Pricing' },
  ] as const;

  for (const { tcId, key, label } of CHECKBOX_PERSISTENCE_CASES) {
    test(`${tcId}: ${label} -- uncheck, save, reload, verify persists; restore`, async ({ locationPricingPage }) => {
      test.setTimeout(120_000);
      await locationPricingPage.navigateToPricingTab(OFFICE_NO);
      const initial = await locationPricingPage.getCheckboxState(key);
      expect(initial.checked, `${label} should be checked by default`).toBe(true);
      await locationPricingPage.uncheckCheckbox(key);
      await locationPricingPage.waitForSaveEnabled();
      await locationPricingPage.clickSave();
      await locationPricingPage.reloadPricingTab(OFFICE_NO);
      const afterUncheck = await locationPricingPage.getCheckboxState(key);
      expect(afterUncheck.checked, `${label} should remain unchecked after reload`).toBe(false);
      await locationPricingPage.checkCheckbox(key);
      await locationPricingPage.waitForSaveEnabled();
      await locationPricingPage.clickSave();
      await locationPricingPage.reloadPricingTab(OFFICE_NO);
      const restored = await locationPricingPage.getCheckboxState(key);
      expect(restored.checked, `${label} should be restored to checked`).toBe(true);
    });
  }

  // ── Dropdown persistence (TC-026..030) — MNT-008: data-driven loop ─────────
  const DROPDOWN_PERSISTENCE_CASES = [
    { tcId: 'TC-LOC-PRI-026', key: 'drpPrimaryLaborPricing', option: '2026-Zone 3 D', label: 'Primary Labor Pricing' },
    { tcId: 'TC-LOC-PRI-027', key: 'drpPrimaryEquipmentPricing', option: '2026-Tier 2 Resort B', label: 'Primary Equipment Pricing' },
    { tcId: 'TC-LOC-PRI-028', key: 'drpPrimaryInternalEquipmentPricing', option: '2023-Internal2', label: 'Primary Internal Equipment Pricing' },
    { tcId: 'TC-LOC-PRI-029', key: 'drpPrimaryProductionLaborPricing', option: '2026-NP LB3', label: 'Primary Production Labor Pricing' },
    { tcId: 'TC-LOC-PRI-030', key: 'drpPrimaryProductionEquipmentPricing', option: '2026-NP Tier 2', label: 'Primary Production Equipment Pricing' },
  ] as const;

  for (const { tcId, key, option, label } of DROPDOWN_PERSISTENCE_CASES) {
    test(`${tcId}: ${label} -- select "${option}", save, reload, verify`, async ({ locationPricingPage }) => {
      await locationPricingPage.selectPrimaryDropdownOption(key, option);
      expect(await locationPricingPage.getDropdownValue(key)).toBe(option);
      await locationPricingPage.waitForSaveEnabled();
      await locationPricingPage.clickSave();
      await locationPricingPage.reloadPricingTab(OFFICE_NO);
      expect(await locationPricingPage.getDropdownValue(key), `${label} should persist after reload`).toBe(option);
    });
  }

});
