// spec: specs_planning/test-plans/locations/locations_currency_test_plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../../setup/fixtures';
import { CURRENCY_COLUMN_HEADERS, UNSELECTED_CURRENCY_STATES, MERCHANT_DATA, DEFAULT_CURRENCY, ALTERNATE_USD_MERCHANT } from '../../../test-data/setup/locations/location-currency.data';
import { OFFICE_NO } from '../../../test-data/common.data';

test.describe.serial('Location Currency @locations @currency', () => {

  test('TC-LOC-CUR-001: Navigate to Currency tab; 3 rows, 4 column headers visible', async ({ locationCurrencyPage }) => {
    test.setTimeout(60_000);
    await locationCurrencyPage.navigateToCurrencyTab(OFFICE_NO);
    expect(locationCurrencyPage.getCurrentUrl()).toContain(`locations/${OFFICE_NO}/settings`);
    // Enforce known baseline: USD=selected+isDefault, CAD/MXN=unselected.
    // Guards against state corruption from previous test runs (idempotent -- no-ops if DB is already correct).
    await locationCurrencyPage.checkCheckbox('chkUSDSelected');
    await locationCurrencyPage.checkCheckbox('chkUSDIsDefault');
    await locationCurrencyPage.uncheckCheckbox('chkCADSelected');
    await locationCurrencyPage.uncheckCheckbox('chkMXNSelected');
    await locationCurrencyPage.clickSave();
    expect(await locationCurrencyPage.getGridRowCount()).toBe(3);
    expect(await locationCurrencyPage.getColumnHeaders()).toEqual(CURRENCY_COLUMN_HEADERS);
  });

  test('TC-LOC-CUR-002: USD default -- Selected, Is Default checked; merchant set', async ({ locationCurrencyPage }) => {
    expect((await locationCurrencyPage.getCheckboxState('chkUSDSelected')).checked).toBe(true);
    expect((await locationCurrencyPage.getCheckboxState('chkUSDIsDefault')).checked).toBe(true);
    expect(await locationCurrencyPage.getMerchantValue('drpUSDMerchant')).toContain(MERCHANT_DATA.usd.id);
  });

  for (const cur of UNSELECTED_CURRENCY_STATES) {
    test(`TC-LOC-CUR-${cur.tcId}: ${cur.currency} default -- unselected, Is Default disabled`, async ({ locationCurrencyPage }) => {
      expect((await locationCurrencyPage.getCheckboxState(cur.selectedKey)).checked).toBe(false);
      expect((await locationCurrencyPage.getCheckboxState(cur.isDefaultKey)).disabled).toBe(true);
    });
  }

  test('TC-LOC-CUR-018: Currency Code column is read-only', async ({ locationCurrencyPage }) => {
    expect(await locationCurrencyPage.isCurrencyCodeReadOnly(DEFAULT_CURRENCY)).toBe(true);
  });

  test('TC-LOC-CUR-019: Merchant dropdown accessible for unselected currency', async ({ locationCurrencyPage }) => {
    expect(await locationCurrencyPage.isMerchantDropdownAccessible('drpCADMerchant')).toBe(true);
  });

  test('TC-LOC-CUR-015: Save disabled initially; enabled after field change', async ({ locationCurrencyPage }) => {
    expect(await locationCurrencyPage.isSaveEnabled()).toBe(false);
    await locationCurrencyPage.checkCheckbox('chkCADSelected');
    expect(await locationCurrencyPage.isSaveEnabled()).toBe(true);
    await locationCurrencyPage.uncheckCheckbox('chkCADSelected');
  });

  test('TC-LOC-CUR-005: Selecting currency enables its Is Default checkbox', async ({ locationCurrencyPage }) => {
    expect((await locationCurrencyPage.getCheckboxState('chkCADIsDefault')).disabled).toBe(true);
    await locationCurrencyPage.checkCheckbox('chkCADSelected');
    // LR-010: selecting currency enables Is Default async — poll for disabled state.
    await expect.poll(
      () => locationCurrencyPage.getCheckboxState('chkCADIsDefault').then(s => s.disabled),
      { timeout: 5_000 },
    ).toBe(false);
    await locationCurrencyPage.uncheckCheckbox('chkCADSelected');
  });

  test('TC-LOC-CUR-007: Unselecting currency disables and unchecks Is Default', async ({ locationCurrencyPage }) => {
    await locationCurrencyPage.checkCheckbox('chkCADSelected');
    await locationCurrencyPage.checkCheckbox('chkCADIsDefault');
    await locationCurrencyPage.uncheckCheckbox('chkCADSelected');
    const state = await locationCurrencyPage.getCheckboxState('chkCADIsDefault');
    expect(state.disabled).toBe(true);
    expect(state.checked).toBe(false);
    // Restore: USD Is Default was auto-unchecked when CAD was set as default -- restore it
    await locationCurrencyPage.checkCheckbox('chkUSDIsDefault');
    await locationCurrencyPage.clickSave();
  });

  test('TC-LOC-CUR-006: Single default rule -- setting CAD default auto-unchecks USD default', async ({ locationCurrencyPage }) => {
    expect((await locationCurrencyPage.getCheckboxState('chkUSDIsDefault')).checked).toBe(true);
    await locationCurrencyPage.checkCheckbox('chkCADSelected');
    await locationCurrencyPage.checkCheckbox('chkCADIsDefault');
    expect((await locationCurrencyPage.getCheckboxState('chkUSDIsDefault')).checked).toBe(false);
    // Cleanup: uncheck CAD (disables+clears CAD IsDefault), restore USD IsDefault, save
    await locationCurrencyPage.uncheckCheckbox('chkCADSelected');
    await locationCurrencyPage.checkCheckbox('chkUSDIsDefault');
    await locationCurrencyPage.clickSave();
  });

  test('TC-LOC-CUR-008: USD Merchant dropdown shows 2 options', async ({ locationCurrencyPage }) => {
    const options = await locationCurrencyPage.getMerchantOptions('drpUSDMerchant');
    expect(options).toHaveLength(2);
    expect(options.some(o => o.includes(MERCHANT_DATA.usd.id))).toBe(true);
    expect(options.some(o => o.includes(MERCHANT_DATA.bahamas.id))).toBe(true);
  });

  test('TC-LOC-CUR-009: CAD Merchant dropdown shows 1 option', async ({ locationCurrencyPage }) => {
    const options = await locationCurrencyPage.getMerchantOptions('drpCADMerchant');
    expect(options).toHaveLength(1);
    expect(options[0]).toContain(MERCHANT_DATA.canada.id);
  });

  test('TC-LOC-CUR-010: MXN Merchant dropdown shows No Matches Found', async ({ locationCurrencyPage }) => {
    await locationCurrencyPage.checkCheckbox('chkMXNSelected');
    expect((await locationCurrencyPage.getCheckboxState('chkMXNIsDefault')).disabled).toBe(false);
    await locationCurrencyPage.checkCheckbox('chkMXNIsDefault');
    expect((await locationCurrencyPage.getCheckboxState('chkMXNIsDefault')).checked).toBe(true);
    expect(await locationCurrencyPage.isMerchantNoMatchesFound('drpMXNMerchant')).toBe(true);
    await locationCurrencyPage.uncheckCheckbox('chkMXNSelected');
    await locationCurrencyPage.clickSave();
  });

  test('TC-LOC-CUR-011: Select merchant for CAD currency', async ({ locationCurrencyPage }) => {
    await locationCurrencyPage.checkCheckbox('chkCADSelected');
    await locationCurrencyPage.selectMerchantOption('drpCADMerchant', MERCHANT_DATA.canada.display);
    expect(await locationCurrencyPage.getMerchantValue('drpCADMerchant')).toContain(MERCHANT_DATA.canada.id);
    await locationCurrencyPage.uncheckCheckbox('chkCADSelected');
    await locationCurrencyPage.clickSave();
  });

  test('TC-LOC-CUR-012: Merchant value persists when currency is unselected', async ({ locationCurrencyPage }) => {
    await locationCurrencyPage.checkCheckbox('chkCADSelected');
    await locationCurrencyPage.selectMerchantOption('drpCADMerchant', MERCHANT_DATA.canada.display);
    await locationCurrencyPage.uncheckCheckbox('chkCADSelected');
    expect(await locationCurrencyPage.getMerchantValue('drpCADMerchant')).toContain(MERCHANT_DATA.canada.id);
    await locationCurrencyPage.clickSave();
  });

  test('TC-LOC-CUR-016: USD Merchant can be changed to alternate option', async ({ locationCurrencyPage }) => {
    expect(await locationCurrencyPage.getMerchantValue('drpUSDMerchant')).toContain(MERCHANT_DATA.usd.id);
    await locationCurrencyPage.selectMerchantOption('drpUSDMerchant', MERCHANT_DATA.bahamas.display);
    expect(await locationCurrencyPage.getMerchantValue('drpUSDMerchant')).toContain(MERCHANT_DATA.bahamas.id);
    await locationCurrencyPage.selectMerchantOption('drpUSDMerchant', MERCHANT_DATA.usd.display);
    await locationCurrencyPage.clickSave();
  });

  test('TC-LOC-CUR-013: Validation -- at least one currency must be selected', async ({ locationCurrencyPage }) => {
    // Uncheck USD (the only selected currency) -- app disables Save to enforce minimum-1-currency constraint
    // NOTE: unchecking USD also auto-unchecks USD IsDefault; both must be restored
    await locationCurrencyPage.uncheckCheckbox('chkUSDSelected');
    expect((await locationCurrencyPage.getCheckboxState('chkUSDIsDefault')).disabled).toBe(true);
    const saveBlocked = !(await locationCurrencyPage.isSaveEnabled());
    // Full restore: re-select USD AND re-apply IsDefault so TC-014+ start clean
    await locationCurrencyPage.checkCheckbox('chkUSDSelected');
    await locationCurrencyPage.checkCheckbox('chkUSDIsDefault');
    await locationCurrencyPage.clickSave();
    expect(saveBlocked, 'Save must be blocked when no currency is selected').toBe(true);
  });

  test('TC-LOC-CUR-014: Save without default currency shows confirmation dialog (not an error)', async ({ locationCurrencyPage }) => {
    await locationCurrencyPage.uncheckCheckbox('chkUSDIsDefault');
    const dialogType = await locationCurrencyPage.clickSaveAndCaptureDialog();
    expect(dialogType).toBe('save-changes');
    await locationCurrencyPage.cancelCurrentDialog();
    await locationCurrencyPage.checkCheckbox('chkUSDIsDefault');
    await locationCurrencyPage.clickSave();
  });

  test('TC-LOC-CUR-017: Multiple currencies selected without default -- save confirmation shown', async ({ locationCurrencyPage }) => {
    await locationCurrencyPage.checkCheckbox('chkCADSelected');
    await locationCurrencyPage.uncheckCheckbox('chkUSDIsDefault');
    const dialogType = await locationCurrencyPage.clickSaveAndCaptureDialog();
    expect(dialogType).toBe('save-changes');
    await locationCurrencyPage.cancelCurrentDialog();
    await locationCurrencyPage.uncheckCheckbox('chkCADSelected');
    await locationCurrencyPage.checkCheckbox('chkUSDIsDefault');
    await locationCurrencyPage.clickSave();
  });

  test('TC-LOC-CUR-020: All three currencies can be selected simultaneously', async ({ locationCurrencyPage }) => {
    await locationCurrencyPage.checkCheckbox('chkCADSelected');
    await locationCurrencyPage.checkCheckbox('chkMXNSelected');
    expect((await locationCurrencyPage.getCheckboxState('chkUSDSelected')).checked).toBe(true);
    expect((await locationCurrencyPage.getCheckboxState('chkCADSelected')).checked).toBe(true);
    expect((await locationCurrencyPage.getCheckboxState('chkMXNSelected')).checked).toBe(true);
    await locationCurrencyPage.uncheckCheckbox('chkCADSelected');
    await locationCurrencyPage.uncheckCheckbox('chkMXNSelected');
    await locationCurrencyPage.clickSave();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // ROUND-TRIP PERSISTENCE (P0)
  // ─────────────────────────────────────────────────────────────────────────────

  test('TC-LOC-CUR-021: Selected currency persists after save and reload', async ({ locationCurrencyPage }) => {
    test.setTimeout(60_000);
    await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
    // Select CAD
    await locationCurrencyPage.checkCheckbox('chkCADSelected');
    expect(await locationCurrencyPage.isSaveEnabled()).toBe(true);
    const result = await locationCurrencyPage.clickSave();
    expect(result.success).toBe(true);
    expect(await locationCurrencyPage.isSaveEnabled()).toBe(false);
    // Reload and verify persistence
    await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
    expect((await locationCurrencyPage.getCheckboxState('chkCADSelected')).checked).toBe(true);
    // Cleanup: uncheck CAD → save
    await locationCurrencyPage.uncheckCheckbox('chkCADSelected');
    await locationCurrencyPage.clickSave();
  });

  test('TC-LOC-CUR-022: Merchant change persists after save and reload', async ({ locationCurrencyPage }) => {
    test.setTimeout(60_000);
    await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
    // Change USD merchant to Bahamas
    await locationCurrencyPage.selectMerchantOption('drpUSDMerchant', ALTERNATE_USD_MERCHANT.display);
    expect(await locationCurrencyPage.getMerchantValue('drpUSDMerchant')).toContain(ALTERNATE_USD_MERCHANT.id);
    expect(await locationCurrencyPage.isSaveEnabled()).toBe(true);
    const result = await locationCurrencyPage.clickSave();
    expect(result.success).toBe(true);
    expect(await locationCurrencyPage.isSaveEnabled()).toBe(false);
    // Reload and verify persistence
    await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
    expect(await locationCurrencyPage.getMerchantValue('drpUSDMerchant')).toContain(ALTERNATE_USD_MERCHANT.id);
    // Cleanup: restore original USD merchant → save
    await locationCurrencyPage.selectMerchantOption('drpUSDMerchant', MERCHANT_DATA.usd.display);
    await locationCurrencyPage.clickSave();
  });

  test('TC-LOC-CUR-023: IsDefault change persists after save and reload (cascade)', async ({ locationCurrencyPage }) => {
    test.setTimeout(60_000);
    await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
    // Select CAD + set as default (auto-unchecks USD IsDefault)
    await locationCurrencyPage.checkCheckbox('chkCADSelected');
    await locationCurrencyPage.checkCheckbox('chkCADIsDefault');
    expect((await locationCurrencyPage.getCheckboxState('chkUSDIsDefault')).checked).toBe(false);
    expect(await locationCurrencyPage.isSaveEnabled()).toBe(true);
    const result = await locationCurrencyPage.clickSave();
    expect(result.success).toBe(true);
    expect(await locationCurrencyPage.isSaveEnabled()).toBe(false);
    // Reload and verify
    await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
    expect((await locationCurrencyPage.getCheckboxState('chkCADIsDefault')).checked).toBe(true);
    expect((await locationCurrencyPage.getCheckboxState('chkUSDIsDefault')).checked).toBe(false);
    // Cleanup: uncheck CAD Selected (auto-disables CAD IsDefault) → restore USD IsDefault → save
    await locationCurrencyPage.uncheckCheckbox('chkCADSelected');
    await locationCurrencyPage.checkCheckbox('chkUSDIsDefault');
    await locationCurrencyPage.clickSave();
  });

  test('TC-LOC-CUR-024: Combined changes persist after single save and reload', async ({ locationCurrencyPage }) => {
    test.setTimeout(60_000);
    await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
    // Select CAD + change USD merchant — two changes in one save
    await locationCurrencyPage.checkCheckbox('chkCADSelected');
    await locationCurrencyPage.selectMerchantOption('drpUSDMerchant', ALTERNATE_USD_MERCHANT.display);
    expect(await locationCurrencyPage.isSaveEnabled()).toBe(true);
    const result = await locationCurrencyPage.clickSave();
    expect(result.success).toBe(true);
    expect(await locationCurrencyPage.isSaveEnabled()).toBe(false);
    // Reload and verify both persisted
    await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
    expect((await locationCurrencyPage.getCheckboxState('chkCADSelected')).checked).toBe(true);
    expect(await locationCurrencyPage.getMerchantValue('drpUSDMerchant')).toContain(ALTERNATE_USD_MERCHANT.id);
    // Cleanup: uncheck CAD + restore USD merchant → save
    await locationCurrencyPage.uncheckCheckbox('chkCADSelected');
    await locationCurrencyPage.selectMerchantOption('drpUSDMerchant', MERCHANT_DATA.usd.display);
    await locationCurrencyPage.clickSave();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // STATE TRANSITION (P1-P2)
  // ─────────────────────────────────────────────────────────────────────────────

  test('TC-LOC-CUR-025: Cancel save discards changes — reload shows original state', async ({ locationCurrencyPage }) => {
    test.setTimeout(60_000);
    await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
    // Make a change
    await locationCurrencyPage.checkCheckbox('chkCADSelected');
    expect(await locationCurrencyPage.isSaveEnabled()).toBe(true);
    // Click save but cancel the dialog
    const dialogType = await locationCurrencyPage.clickSaveAndCaptureDialog();
    expect(dialogType).toBe('save-changes');
    await locationCurrencyPage.cancelCurrentDialog();
    // Reload — change should NOT have persisted (cancel = discard)
    await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
    expect((await locationCurrencyPage.getCheckboxState('chkCADSelected')).checked).toBe(false);
    // No cleanup needed — cancel means nothing was saved
  });

  test('TC-LOC-CUR-026: Beforeunload dialog fires when form is dirty', async ({ locationCurrencyPage }) => {
    test.setTimeout(60_000);
    await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
    // Make a dirty change
    await locationCurrencyPage.checkCheckbox('chkCADSelected');
    expect(await locationCurrencyPage.isSaveEnabled()).toBe(true);
    // Trigger reload — beforeunload should fire and dismiss keeps us on page
    const dialogFired = await locationCurrencyPage.triggerBeforeunloadAndStay();
    expect(dialogFired).toBe(true);
    // Cleanup: reload discards dirty state (nothing was saved)
    await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // EDGE CASE (P2)
  // ─────────────────────────────────────────────────────────────────────────────

  test('TC-LOC-CUR-027: No-default state persists after save and reload', async ({ locationCurrencyPage }) => {
    test.setTimeout(60_000);
    await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
    // Uncheck USD IsDefault — no currency is default
    await locationCurrencyPage.uncheckCheckbox('chkUSDIsDefault');
    expect((await locationCurrencyPage.getCheckboxState('chkUSDIsDefault')).checked).toBe(false);
    expect(await locationCurrencyPage.isSaveEnabled()).toBe(true);
    // Save (clickSave auto-confirms the "Save Changes" dialog)
    const result = await locationCurrencyPage.clickSave();
    expect(result.success).toBe(true);
    expect(await locationCurrencyPage.isSaveEnabled()).toBe(false);
    // Reload and verify no-default persisted
    await locationCurrencyPage.reloadAndNavigateToCurrencyTab();
    expect((await locationCurrencyPage.getCheckboxState('chkUSDIsDefault')).checked).toBe(false);
    // Cleanup: restore USD IsDefault → save
    await locationCurrencyPage.checkCheckbox('chkUSDIsDefault');
    await locationCurrencyPage.clickSave();
  });

});
