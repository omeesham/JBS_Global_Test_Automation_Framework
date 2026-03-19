// spec: specs_planning/test-plans/locations/locations_legal_test_plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../setup/fixtures';
import {
  LEGAL_COLUMN_HEADERS,
  LEGAL_DEFAULTS,
  LEGAL_SC_OPTION_COUNT,
  LEGAL_TC_OPTION_COUNT,
  LEGAL_ALT_SC,
  LEGAL_ALT_TC,
} from '../../test-data/locations/location-legal.data';
import { OFFICE_NO } from '../../test-data/common.data';

test.describe.serial('Location Legal @locations @legal', () => {

  test('TC-LOC-LGL-001: Navigate to Legal tab; 3 column headers, 1 data row', async ({ locationLegalPage }) => {
    test.setTimeout(60_000);
    await locationLegalPage.navigateToLegalTab(OFFICE_NO);
    expect(locationLegalPage.getCurrentUrl()).toContain('locations/1604/settings');
    expect(await locationLegalPage.getColumnHeaders()).toEqual([...LEGAL_COLUMN_HEADERS]);
    expect(await locationLegalPage.getGridRowCount()).toBe(1);
  });

  test('TC-LOC-LGL-002: Default field values -- US English, Resort Service Charge, LDW', async ({ locationLegalPage }) => {
    expect(await locationLegalPage.getLanguageName()).toBe(LEGAL_DEFAULTS.languageName);
    expect(await locationLegalPage.getServiceChargeValue()).toBe(LEGAL_DEFAULTS.serviceChargeName);
    expect(await locationLegalPage.getTermsValue()).toBe(LEGAL_DEFAULTS.termsName);
  });

  test('TC-LOC-LGL-003: Language Name cell is read-only', async ({ locationLegalPage }) => {
    expect(await locationLegalPage.isLanguageNameReadOnly()).toBe(true);
  });

  test('TC-LOC-LGL-004: Service Charge dropdown opens with 114 options', async ({ locationLegalPage }) => {
    const options = await locationLegalPage.getServiceChargeOptions();
    expect(options).toHaveLength(LEGAL_SC_OPTION_COUNT);
    expect(options).toContain(LEGAL_DEFAULTS.serviceChargeName);
    expect(options).toContain(LEGAL_ALT_SC);
  });

  test('TC-LOC-LGL-005: Terms and Conditions dropdown opens with 50 options', async ({ locationLegalPage }) => {
    const options = await locationLegalPage.getTermsOptions();
    expect(options).toHaveLength(LEGAL_TC_OPTION_COUNT);
    expect(options).toContain(LEGAL_DEFAULTS.termsName);
    expect(options).toContain(LEGAL_ALT_TC);
  });

  test('TC-LOC-LGL-006: No search/filter in either dropdown', async ({ locationLegalPage }) => {
    expect(await locationLegalPage.hasDropdownSearch('drpLegalServiceCharge0')).toBe(false);
    expect(await locationLegalPage.hasDropdownSearch('drpLegalTerms0')).toBe(false);
  });

  test('TC-LOC-LGL-007: Save button disabled by default', async ({ locationLegalPage }) => {
    expect(await locationLegalPage.isSaveEnabled()).toBe(false);
  });

  test('TC-LOC-LGL-008: Changing Service Charge enables Save', async ({ locationLegalPage }) => {
    expect(await locationLegalPage.isSaveEnabled()).toBe(false);
    await locationLegalPage.selectServiceCharge(LEGAL_ALT_SC);
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
    // Cleanup: reload to discard
    await locationLegalPage.reloadAndNavigateToLegalTab();
  });

  test('TC-LOC-LGL-009: Changing Terms enables Save', async ({ locationLegalPage }) => {
    expect(await locationLegalPage.isSaveEnabled()).toBe(false);
    await locationLegalPage.selectTerms(LEGAL_ALT_TC);
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
    // Cleanup: reload to discard
    await locationLegalPage.reloadAndNavigateToLegalTab();
  });

  test('TC-LOC-LGL-010: Reverting dropdown to original does NOT re-disable Save', async ({ locationLegalPage }) => {
    await locationLegalPage.selectServiceCharge(LEGAL_ALT_SC);
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
    // Revert to original
    await locationLegalPage.selectServiceCharge(LEGAL_DEFAULTS.serviceChargeName);
    // Save stays enabled (dirty-state does not track net-zero)
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
    // Cleanup: reload to discard
    await locationLegalPage.reloadAndNavigateToLegalTab();
  });

  test('TC-LOC-LGL-011: Save SC change persists after reload', async ({ locationLegalPage }) => {
    // Change SC
    await locationLegalPage.selectServiceCharge(LEGAL_ALT_SC);
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
    // Save
    const result = await locationLegalPage.clickSave();
    expect(result.success).toBe(true);
    expect(await locationLegalPage.isSaveEnabled()).toBe(false);
    // Reload and verify persistence
    await locationLegalPage.reloadAndNavigateToLegalTab();
    expect(await locationLegalPage.getServiceChargeValue()).toBe(LEGAL_ALT_SC);
    // Cleanup: restore original
    await locationLegalPage.selectServiceCharge(LEGAL_DEFAULTS.serviceChargeName);
    const restore = await locationLegalPage.clickSave();
    expect(restore.success).toBe(true);
  });

  test('TC-LOC-LGL-012: Save T&C change persists after reload', async ({ locationLegalPage }) => {
    // Fresh state after TC-011's save cycle
    await locationLegalPage.reloadAndNavigateToLegalTab();
    // Change T&C
    await locationLegalPage.selectTerms(LEGAL_ALT_TC);
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
    // Save
    const result = await locationLegalPage.clickSave();
    expect(result.success).toBe(true);
    // Reload and verify persistence
    await locationLegalPage.reloadAndNavigateToLegalTab();
    expect(await locationLegalPage.getTermsValue()).toBe(LEGAL_ALT_TC);
    // Cleanup: restore original
    await locationLegalPage.selectTerms(LEGAL_DEFAULTS.termsName);
    const restore = await locationLegalPage.clickSave();
    expect(restore.success).toBe(true);
  });

  test('TC-LOC-LGL-013: Cancel in Save dialog discards save', async ({ locationLegalPage }) => {
    // Fresh state after TC-012's save cycle
    await locationLegalPage.reloadAndNavigateToLegalTab();
    await locationLegalPage.selectServiceCharge(LEGAL_ALT_SC);
    const dialogType = await locationLegalPage.clickSaveAndGetDialog();
    expect(dialogType).toBe('save-changes');
    await locationLegalPage.cancelSaveDialog();
    // Save still enabled (not saved)
    expect(await locationLegalPage.isSaveEnabled()).toBe(true);
    // Reload and verify original value
    await locationLegalPage.reloadAndNavigateToLegalTab();
    expect(await locationLegalPage.getServiceChargeValue()).toBe(LEGAL_DEFAULTS.serviceChargeName);
  });

  test('TC-LOC-LGL-014: Beforeunload dialog triggers with unsaved changes', async ({ locationLegalPage }) => {
    await locationLegalPage.selectTerms(LEGAL_ALT_TC);
    const dialogFired = await locationLegalPage.triggerBeforeunloadAndStay();
    expect(dialogFired).toBe(true);
    // Cleanup: reload (accept beforeunload) to discard
    await locationLegalPage.reloadAndNavigateToLegalTab();
  });

  // TC-LOC-LGL-015 OMITTED: Country cascade test requires left-panel Country selector
  // that does not exist in current selector inventory. Logged as missing-coverage.

});
