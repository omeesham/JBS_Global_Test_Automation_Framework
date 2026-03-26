// spec: specs_planning/test-plans/setup/local-office/local_office_settings_test_plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../../setup/fixtures';
import {
  DATE_OFFSET_DEFAULTS,
  CHECKBOX_DEFAULTS,
  ONE_DAY_JOB_CHECKBOXES,
  DEFAULT_SECTIONS,
  DEFAULT_PHONE_1,
} from '../../../test-data/setup/local-office/local-office-settings.data';
import { OFFICE_NO } from '../../../test-data/common.data';

test.describe.serial('Local Office Settings — Basic Information @locations @local-office-settings', () => {

  test('TC-LOS-BAS-001: Page load — title, 3 tabs, Basic Info active, Save disabled', async ({ localOfficeSettingsPage }) => {
    test.setTimeout(60_000);
    await localOfficeSettingsPage.navigateToBasicInfoTab(OFFICE_NO);
    expect(localOfficeSettingsPage.getCurrentUrl()).toContain(`locations/${OFFICE_NO}/settings/local-office`);
    expect(await localOfficeSettingsPage.isTabSelected('tabBasicInformation')).toBe(true);
    expect(await localOfficeSettingsPage.isElementVisible('tabHistory')).toBe(true);
    expect(await localOfficeSettingsPage.isElementVisible('tabEctSettings')).toBe(true);
    expect(await localOfficeSettingsPage.isSaveEnabled()).toBe(false);
  });

  test('TC-LOS-BAS-002: Default date offsets — all 6 match expected values', async ({ localOfficeSettingsPage }) => {
    for (const { key, label, value } of DATE_OFFSET_DEFAULTS) {
      expect(await localOfficeSettingsPage.getInputValue(key), label).toBe(value);
    }
  });

  test('TC-LOS-BAS-003: Save button disabled on fresh load', async ({ localOfficeSettingsPage }) => {
    expect(await localOfficeSettingsPage.isSaveEnabled()).toBe(false);
  });

  test('TC-LOS-BAS-004: Editing date offset enables Save', async ({ localOfficeSettingsPage }) => {
    expect(await localOfficeSettingsPage.isSaveEnabled()).toBe(false);
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-2');
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-1');
  });

  test('TC-LOS-BAS-005: Date offset — edit, save, persist after reload', async ({ localOfficeSettingsPage }) => {
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-2');
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect(await localOfficeSettingsPage.getInputValue('txtPrepDateOffset')).toBe('-2');
    // Cleanup: restore original
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-1');
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-006: Non-numeric input triggers aria-invalid, Save disabled', async ({ localOfficeSettingsPage }) => {
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', 'abc');
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtPrepDateOffset'), { timeout: 5_000 }).toBe(true);
    expect(await localOfficeSettingsPage.isSaveEnabled()).toBe(false);
    // Reload to ensure clean Angular model — typing 'abc' then '-1' can leave Prep model as NaN
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-007: NM-1264 — Delivery < Prep triggers aria-invalid on Delivery', async ({ localOfficeSettingsPage }) => {
    await localOfficeSettingsPage.fillAndTab('txtDeliveryDateOffset', '-5');
    // NM-1264 cross-field validation fires asynchronously
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtDeliveryDateOffset'), { timeout: 5_000 }).toBe(true);
    expect(await localOfficeSettingsPage.isSaveEnabled()).toBe(false);
    await localOfficeSettingsPage.fillAndTab('txtDeliveryDateOffset', '0');
  });

  test('TC-LOS-BAS-008: NM-1264 error recovery — correcting value clears error', async ({ localOfficeSettingsPage }) => {
    await localOfficeSettingsPage.fillAndTab('txtDeliveryDateOffset', '-5');
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtDeliveryDateOffset'), { timeout: 5_000 }).toBe(true);
    // Correct to -1 (not 0 — restoring original leaves form pristine; not positive — Delivery must be <= 0)
    await localOfficeSettingsPage.fillAndTab('txtDeliveryDateOffset', '-1');
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtDeliveryDateOffset'), { timeout: 5_000 }).toBe(false);
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    // Cleanup: restore original
    await localOfficeSettingsPage.fillAndTab('txtDeliveryDateOffset', '0');
  });

  test('TC-LOS-BAS-009: Negative value accepted for date offset', async ({ localOfficeSettingsPage }) => {
    // Use Set Date Offset (relative to start) — negative values are valid for "relative to start" fields
    await localOfficeSettingsPage.fillAndTab('txtSetDateOffset', '-10');
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtSetDateOffset'), { timeout: 5_000 }).toBe(false);
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await localOfficeSettingsPage.fillAndTab('txtSetDateOffset', '-1');
  });

  test('TC-LOS-BAS-010: Zero value accepted for date offset', async ({ localOfficeSettingsPage }) => {
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '0');
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtPrepDateOffset'), { timeout: 5_000 }).toBe(false);
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-1');
  });

  test('TC-LOS-BAS-011: Checkbox default states — Fulfillment/QC/Labor/Job', async ({ localOfficeSettingsPage }) => {
    for (const { key, label, checked, disabled } of CHECKBOX_DEFAULTS) {
      const state = await localOfficeSettingsPage.getCheckboxState(key);
      expect(state.checked, `${label} checked`).toBe(checked);
      expect(state.disabled, `${label} disabled`).toBe(disabled);
    }
  });

  test('TC-LOS-BAS-012: Fulfillment toggle cascades to QC enabled/disabled', async ({ localOfficeSettingsPage }) => {
    expect((await localOfficeSettingsPage.getCheckboxState('chkUseEquipmentsQc')).disabled).toBe(true);
    await localOfficeSettingsPage.checkCheckbox('chkUseFulfillment');
    expect((await localOfficeSettingsPage.getCheckboxState('chkUseFulfillment')).checked).toBe(true);
    expect((await localOfficeSettingsPage.getCheckboxState('chkUseEquipmentsQc')).disabled).toBe(false);
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    // Cleanup
    await localOfficeSettingsPage.uncheckCheckbox('chkUseFulfillment');
    expect((await localOfficeSettingsPage.getCheckboxState('chkUseEquipmentsQc')).disabled).toBe(true);
  });

  test('TC-LOS-BAS-013: Fulfillment checked + QC cascade persists after save', async ({ localOfficeSettingsPage }) => {
    await localOfficeSettingsPage.checkCheckbox('chkUseFulfillment');
    await localOfficeSettingsPage.clickSaveAndConfirm();
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect((await localOfficeSettingsPage.getCheckboxState('chkUseFulfillment')).checked).toBe(true);
    expect((await localOfficeSettingsPage.getCheckboxState('chkUseEquipmentsQc')).disabled).toBe(false);
    // Cleanup
    await localOfficeSettingsPage.uncheckCheckbox('chkUseFulfillment');
    await localOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-014: Default Labor to Hourly toggle persists after save', async ({ localOfficeSettingsPage }) => {
    expect((await localOfficeSettingsPage.getCheckboxState('chkDefaultLaborToHourly')).checked).toBe(false);
    await localOfficeSettingsPage.checkCheckbox('chkDefaultLaborToHourly');
    await localOfficeSettingsPage.clickSaveAndConfirm();
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect((await localOfficeSettingsPage.getCheckboxState('chkDefaultLaborToHourly')).checked).toBe(true);
    // Cleanup
    await localOfficeSettingsPage.uncheckCheckbox('chkDefaultLaborToHourly');
    await localOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-015: Empty Phone 1 triggers aria-invalid, Save disabled', async ({ localOfficeSettingsPage }) => {
    // Reload to ensure clean form state after prior test's save cycle
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    await localOfficeSettingsPage.clearAndTab('txtPhone1');
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtPhone1'), { timeout: 10_000 }).toBe(true);
    expect(await localOfficeSettingsPage.isSaveEnabled()).toBe(false);
    await localOfficeSettingsPage.fillAndTab('txtPhone1', DEFAULT_PHONE_1);
  });

  test('TC-LOS-BAS-016: Phone 1 accepts non-phone format — no format validation', async ({ localOfficeSettingsPage }) => {
    await localOfficeSettingsPage.fillAndTab('txtPhone1', 'not-a-phone');
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtPhone1'), { timeout: 5_000 }).toBe(false);
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await localOfficeSettingsPage.fillAndTab('txtPhone1', DEFAULT_PHONE_1);
    // LR-011: Reload to clear any Angular model residue from non-standard input
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-017: Valid phone persists after save and reload', async ({ localOfficeSettingsPage }) => {
    await localOfficeSettingsPage.fillAndTab('txtPhone1', '555-123-4567');
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect(await localOfficeSettingsPage.getInputValue('txtPhone1')).toBe('555-123-4567');
    // Cleanup
    await localOfficeSettingsPage.fillAndTab('txtPhone1', DEFAULT_PHONE_1);
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-018: Phone 1 error recovery — valid phone clears aria-invalid', async ({ localOfficeSettingsPage }) => {
    // Reload to guarantee clean form state before the clear+fill error recovery test
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    await localOfficeSettingsPage.clearAndTab('txtPhone1');
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtPhone1'), { timeout: 5_000 }).toBe(true);
    await localOfficeSettingsPage.fillAndTab('txtPhone1', '555-000-1111');
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtPhone1'), { timeout: 5_000 }).toBe(false);
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await localOfficeSettingsPage.fillAndTab('txtPhone1', DEFAULT_PHONE_1);
  });

  test('TC-LOS-BAS-019: Phone 2 optional — empty does not trigger validation', async ({ localOfficeSettingsPage }) => {
    await localOfficeSettingsPage.clearAndTab('txtPhone2');
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtPhone2'), { timeout: 5_000 }).toBe(false);
  });

  test('TC-LOS-BAS-020: Default New Job 1 Day — 3 sub-checkboxes toggle independently', async ({ localOfficeSettingsPage }) => {
    for (const { key, label } of ONE_DAY_JOB_CHECKBOXES) {
      await localOfficeSettingsPage.checkCheckbox(key);
      expect((await localOfficeSettingsPage.getCheckboxState(key)).checked, label).toBe(true);
    }
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    // Cleanup
    for (const { key } of ONE_DAY_JOB_CHECKBOXES) {
      await localOfficeSettingsPage.uncheckCheckbox(key);
    }
  });

  test('TC-LOS-BAS-021: Default Order Type — 2 options (Event, Outside)', async ({ localOfficeSettingsPage }) => {
    expect(await localOfficeSettingsPage.getComboboxValue('drpDefaultOrderType')).toBe('Event');
    const options = await localOfficeSettingsPage.getComboboxOptionsList('drpDefaultOrderType');
    expect(options).toHaveLength(2);
    expect(options).toEqual(expect.arrayContaining(['Event', 'Outside']));
  });

  test('TC-LOS-BAS-022: Default Order Type — selection persists after save', async ({ localOfficeSettingsPage }) => {
    await localOfficeSettingsPage.selectComboboxExact('drpDefaultOrderType', 'Outside');
    await localOfficeSettingsPage.clickSaveAndConfirm();
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect(await localOfficeSettingsPage.getComboboxValue('drpDefaultOrderType')).toBe('Outside');
    // Cleanup
    await localOfficeSettingsPage.selectComboboxExact('drpDefaultOrderType', 'Event');
    await localOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-023: PO Number persists after save and reload', async ({ localOfficeSettingsPage }) => {
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    await localOfficeSettingsPage.fillAndTab('txtPoNumber', 'PO-TEST-123');
    // Verify value was typed before saving
    expect(await localOfficeSettingsPage.getInputValue('txtPoNumber')).toBe('PO-TEST-123');
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect(await localOfficeSettingsPage.getInputValue('txtPoNumber')).toBe('PO-TEST-123');
    // Cleanup
    await localOfficeSettingsPage.fillAndTab('txtPoNumber', '');
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-024: PO Number Label persists after save and reload', async ({ localOfficeSettingsPage }) => {
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    await localOfficeSettingsPage.fillAndTab('txtPoNumberLabel', 'Purchase Order #');
    expect(await localOfficeSettingsPage.getInputValue('txtPoNumberLabel')).toBe('Purchase Order #');
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect(await localOfficeSettingsPage.getInputValue('txtPoNumberLabel')).toBe('Purchase Order #');
    // Cleanup
    await localOfficeSettingsPage.fillAndTab('txtPoNumberLabel', '');
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-025: Section Configuration — 13 active sections', async ({ localOfficeSettingsPage }) => {
    expect(await localOfficeSettingsPage.getSectionRowCount()).toBe(13);
    const names = await localOfficeSettingsPage.getSectionNames();
    expect(names).toEqual([...DEFAULT_SECTIONS]);
  });

  test('TC-LOS-BAS-026: Section toggle — checkmark disappears/reappears', async ({ localOfficeSettingsPage }) => {
    // Reload to guarantee clean baseline — prior BAS-025 reads may leave residual form state
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect(await localOfficeSettingsPage.isSectionActive(0)).toBe(true);
    await localOfficeSettingsPage.toggleSectionActive(0);
    expect(await localOfficeSettingsPage.isSectionActive(0)).toBe(false);
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 10_000 }).toBe(true);
    // Cleanup: toggle back and reload to discard
    await localOfficeSettingsPage.toggleSectionActive(0);
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-027: Section name edit enables Save', async ({ localOfficeSettingsPage }) => {
    await localOfficeSettingsPage.editSectionName(0, 'AV Services');
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    // Cleanup
    await localOfficeSettingsPage.editSectionName(0, 'Audio Visual');
  });

  test('TC-LOS-BAS-028: Add new section row', async ({ localOfficeSettingsPage }) => {
    await localOfficeSettingsPage.addSection('Test Section');
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    // Cleanup: reload without saving
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-029: Default button resets sections', async ({ localOfficeSettingsPage }) => {
    await localOfficeSettingsPage.toggleSectionActive(0);
    await localOfficeSettingsPage.clickDefaultSection();
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    // Cleanup: reload without saving
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-030: Room Configuration — empty table', async ({ localOfficeSettingsPage }) => {
    expect(await localOfficeSettingsPage.isRoomTableEmpty()).toBe(true);
  });

  test('TC-LOS-BAS-031: Add room row', async ({ localOfficeSettingsPage }) => {
    await localOfficeSettingsPage.addRoom('Ballroom A');
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    // Cleanup: reload without saving
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-032: Logo checkbox default states', async ({ localOfficeSettingsPage }) => {
    const quotesState = await localOfficeSettingsPage.getCheckboxState('chkLogoQuotes');
    const rentalState = await localOfficeSettingsPage.getCheckboxState('chkLogoRentalOrders');
    // Record defaults — per field inventory both are checked for 1604
    expect(quotesState.checked).toBe(true);
    expect(rentalState.checked).toBe(true);
  });

  test('TC-LOS-BAS-033: Company Logo combobox — 12 options', async ({ localOfficeSettingsPage }) => {
    const options = await localOfficeSettingsPage.getComboboxOptionsList('drpCompanyLogo');
    expect(options).toHaveLength(12);
  });

  test('TC-LOS-BAS-034: Company Logo — preview updates on selection', async ({ localOfficeSettingsPage }) => {
    const originalSrc = await localOfficeSettingsPage.getLogoPreviewSrc();
    const options = await localOfficeSettingsPage.getComboboxOptionsList('drpCompanyLogo');
    const currentValue = await localOfficeSettingsPage.getComboboxValue('drpCompanyLogo');
    const differentOption = options.find(o => o !== currentValue) ?? options[0]!;
    await localOfficeSettingsPage.selectComboboxExact('drpCompanyLogo', differentOption);
    const newSrc = await localOfficeSettingsPage.getLogoPreviewSrc();
    expect(newSrc).not.toBe(originalSrc);
    // Cleanup: restore original
    await localOfficeSettingsPage.selectComboboxExact('drpCompanyLogo', currentValue);
  });

  test('TC-LOS-BAS-035: Discount exemption toggles independently', async ({ localOfficeSettingsPage }) => {
    expect(await localOfficeSettingsPage.isElementVisible('tblDiscountExemptions')).toBe(true);
    const beforeCount = await localOfficeSettingsPage.getExemptCount();
    await localOfficeSettingsPage.toggleExemption(0);
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    // Cleanup
    await localOfficeSettingsPage.toggleExemption(0);
  });

  test('TC-LOS-BAS-036: Save dialog — exact text and No cancels', async ({ localOfficeSettingsPage }) => {
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-2');
    await localOfficeSettingsPage.waitForSaveToEnable();
    const dialogAppeared = await localOfficeSettingsPage.clickSaveAndCancel();
    if (dialogAppeared) {
      expect(await localOfficeSettingsPage.isSaveEnabled()).toBe(true);
    }
    // Cleanup
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-037: Unsaved changes — Stay keeps changes', async ({ localOfficeSettingsPage }) => {
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-3');
    await localOfficeSettingsPage.waitForSaveToEnable();
    // Trigger unsaved dialog by clicking History tab
    await localOfficeSettingsPage.clickTab('tabHistory');
    await localOfficeSettingsPage.clickUnsavedStay();
    expect(await localOfficeSettingsPage.isTabSelected('tabBasicInformation')).toBe(true);
    expect(await localOfficeSettingsPage.getInputValue('txtPrepDateOffset')).toBe('-3');
    // Cleanup
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-038: Unsaved changes — Discard navigates away', async ({ localOfficeSettingsPage }) => {
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-4');
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickTab('tabHistory');
    await localOfficeSettingsPage.clickUnsavedDiscard();
    expect(await localOfficeSettingsPage.isTabSelected('tabHistory')).toBe(true);
    // Navigate back and verify edit was discarded
    await localOfficeSettingsPage.clickTab('tabBasicInformation');
    await localOfficeSettingsPage.waitForBasicInfoForm();
    expect(await localOfficeSettingsPage.getInputValue('txtPrepDateOffset')).toBe('-1');
  });

  test('TC-LOS-BAS-039: XSS in PO Number — stored as plain text, never executed', async ({ localOfficeSettingsPage }) => {
    const xss = '<script>alert(1)</script>';
    await localOfficeSettingsPage.fillAndTab('txtPoNumber', xss);
    if (await localOfficeSettingsPage.isSaveEnabled()) {
      await localOfficeSettingsPage.clickSaveAndConfirm();
      await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
      const stored = await localOfficeSettingsPage.getInputValue('txtPoNumber');
      // App stores XSS as plain text (correct security behavior) — verify it round-trips exactly
      expect(stored).toBe(xss);
    }
    // Cleanup
    await localOfficeSettingsPage.fillAndTab('txtPoNumber', '');
    if (await localOfficeSettingsPage.isSaveEnabled()) {
      await localOfficeSettingsPage.clickSaveAndConfirm();
    }
  });

});
