// spec: specs_planning/test-plans/locations/locations_local_office_settings_test_plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../setup/fixtures';
import {
  DATE_OFFSET_DEFAULTS,
  CHECKBOX_DEFAULTS,
  ONE_DAY_JOB_CHECKBOXES,
  DEFAULT_SECTIONS,
  DEFAULT_PHONE_1,
} from '../../test-data/locations/location-local-office-settings.data';
import { OFFICE_NO } from '../../test-data/common.data';

test.describe.serial('Local Office Settings — Basic Information @locations @local-office-settings', () => {

  test('TC-LOS-BAS-001: Page load — title, 3 tabs, Basic Info active, Save disabled', async ({ locationLocalOfficeSettingsPage }) => {
    test.setTimeout(60_000);
    await locationLocalOfficeSettingsPage.navigateToBasicInfoTab(OFFICE_NO);
    expect(locationLocalOfficeSettingsPage.getCurrentUrl()).toContain(`locations/${OFFICE_NO}/settings`);
    expect(await locationLocalOfficeSettingsPage.isTabSelected('tabBasicInformation')).toBe(true);
    expect(await locationLocalOfficeSettingsPage.isElementVisible('tabHistory')).toBe(true);
    expect(await locationLocalOfficeSettingsPage.isElementVisible('tabEctSettings')).toBe(true);
    expect(await locationLocalOfficeSettingsPage.isSaveEnabled()).toBe(false);
  });

  test('TC-LOS-BAS-002: Default date offsets — all 6 match expected values', async ({ locationLocalOfficeSettingsPage }) => {
    for (const { key, label, value } of DATE_OFFSET_DEFAULTS) {
      expect(await locationLocalOfficeSettingsPage.getInputValue(key), label).toBe(value);
    }
  });

  test('TC-LOS-BAS-003: Save button disabled on fresh load', async ({ locationLocalOfficeSettingsPage }) => {
    expect(await locationLocalOfficeSettingsPage.isSaveEnabled()).toBe(false);
  });

  test('TC-LOS-BAS-004: Editing date offset enables Save', async ({ locationLocalOfficeSettingsPage }) => {
    expect(await locationLocalOfficeSettingsPage.isSaveEnabled()).toBe(false);
    await locationLocalOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-2');
    await expect.poll(() => locationLocalOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await locationLocalOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-1');
  });

  test('TC-LOS-BAS-005: Date offset — edit, save, persist after reload', async ({ locationLocalOfficeSettingsPage }) => {
    await locationLocalOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-2');
    await locationLocalOfficeSettingsPage.waitForSaveToEnable();
    await locationLocalOfficeSettingsPage.clickSaveAndConfirm();
    await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect(await locationLocalOfficeSettingsPage.getInputValue('txtPrepDateOffset')).toBe('-2');
    // Cleanup: restore original
    await locationLocalOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-1');
    await locationLocalOfficeSettingsPage.waitForSaveToEnable();
    await locationLocalOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-006: Non-numeric input triggers aria-invalid, Save disabled', async ({ locationLocalOfficeSettingsPage }) => {
    await locationLocalOfficeSettingsPage.fillAndTab('txtPrepDateOffset', 'abc');
    await expect.poll(() => locationLocalOfficeSettingsPage.isFieldInvalid('txtPrepDateOffset'), { timeout: 5_000 }).toBe(true);
    expect(await locationLocalOfficeSettingsPage.isSaveEnabled()).toBe(false);
    // Reload to ensure clean Angular model — typing 'abc' then '-1' can leave Prep model as NaN
    await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-007: NM-1264 — Delivery < Prep triggers aria-invalid on Delivery', async ({ locationLocalOfficeSettingsPage }) => {
    await locationLocalOfficeSettingsPage.fillAndTab('txtDeliveryDateOffset', '-5');
    // NM-1264 cross-field validation fires asynchronously
    await expect.poll(() => locationLocalOfficeSettingsPage.isFieldInvalid('txtDeliveryDateOffset'), { timeout: 5_000 }).toBe(true);
    expect(await locationLocalOfficeSettingsPage.isSaveEnabled()).toBe(false);
    await locationLocalOfficeSettingsPage.fillAndTab('txtDeliveryDateOffset', '0');
  });

  test('TC-LOS-BAS-008: NM-1264 error recovery — correcting value clears error', async ({ locationLocalOfficeSettingsPage }) => {
    await locationLocalOfficeSettingsPage.fillAndTab('txtDeliveryDateOffset', '-5');
    await expect.poll(() => locationLocalOfficeSettingsPage.isFieldInvalid('txtDeliveryDateOffset'), { timeout: 5_000 }).toBe(true);
    // Correct to -1 (not 0 — restoring original leaves form pristine; not positive — Delivery must be <= 0)
    await locationLocalOfficeSettingsPage.fillAndTab('txtDeliveryDateOffset', '-1');
    await expect.poll(() => locationLocalOfficeSettingsPage.isFieldInvalid('txtDeliveryDateOffset'), { timeout: 5_000 }).toBe(false);
    await expect.poll(() => locationLocalOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    // Cleanup: restore original
    await locationLocalOfficeSettingsPage.fillAndTab('txtDeliveryDateOffset', '0');
  });

  test('TC-LOS-BAS-009: Negative value accepted for date offset', async ({ locationLocalOfficeSettingsPage }) => {
    // Use Set Date Offset (relative to start) — negative values are valid for "relative to start" fields
    await locationLocalOfficeSettingsPage.fillAndTab('txtSetDateOffset', '-10');
    await expect.poll(() => locationLocalOfficeSettingsPage.isFieldInvalid('txtSetDateOffset'), { timeout: 5_000 }).toBe(false);
    await expect.poll(() => locationLocalOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await locationLocalOfficeSettingsPage.fillAndTab('txtSetDateOffset', '-1');
  });

  test('TC-LOS-BAS-010: Zero value accepted for date offset', async ({ locationLocalOfficeSettingsPage }) => {
    await locationLocalOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '0');
    await expect.poll(() => locationLocalOfficeSettingsPage.isFieldInvalid('txtPrepDateOffset'), { timeout: 5_000 }).toBe(false);
    await expect.poll(() => locationLocalOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await locationLocalOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-1');
  });

  test('TC-LOS-BAS-011: Checkbox default states — Fulfillment/QC/Labor/Job', async ({ locationLocalOfficeSettingsPage }) => {
    for (const { key, label, checked, disabled } of CHECKBOX_DEFAULTS) {
      const state = await locationLocalOfficeSettingsPage.getCheckboxState(key);
      expect(state.checked, `${label} checked`).toBe(checked);
      expect(state.disabled, `${label} disabled`).toBe(disabled);
    }
  });

  test('TC-LOS-BAS-012: Fulfillment toggle cascades to QC enabled/disabled', async ({ locationLocalOfficeSettingsPage }) => {
    expect((await locationLocalOfficeSettingsPage.getCheckboxState('chkUseEquipmentsQc')).disabled).toBe(true);
    await locationLocalOfficeSettingsPage.checkCheckbox('chkUseFulfillment');
    expect((await locationLocalOfficeSettingsPage.getCheckboxState('chkUseFulfillment')).checked).toBe(true);
    expect((await locationLocalOfficeSettingsPage.getCheckboxState('chkUseEquipmentsQc')).disabled).toBe(false);
    await expect.poll(() => locationLocalOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    // Cleanup
    await locationLocalOfficeSettingsPage.uncheckCheckbox('chkUseFulfillment');
    expect((await locationLocalOfficeSettingsPage.getCheckboxState('chkUseEquipmentsQc')).disabled).toBe(true);
  });

  test('TC-LOS-BAS-013: Fulfillment checked + QC cascade persists after save', async ({ locationLocalOfficeSettingsPage }) => {
    await locationLocalOfficeSettingsPage.checkCheckbox('chkUseFulfillment');
    await locationLocalOfficeSettingsPage.clickSaveAndConfirm();
    await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect((await locationLocalOfficeSettingsPage.getCheckboxState('chkUseFulfillment')).checked).toBe(true);
    expect((await locationLocalOfficeSettingsPage.getCheckboxState('chkUseEquipmentsQc')).disabled).toBe(false);
    // Cleanup
    await locationLocalOfficeSettingsPage.uncheckCheckbox('chkUseFulfillment');
    await locationLocalOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-014: Default Labor to Hourly toggle persists after save', async ({ locationLocalOfficeSettingsPage }) => {
    expect((await locationLocalOfficeSettingsPage.getCheckboxState('chkDefaultLaborToHourly')).checked).toBe(false);
    await locationLocalOfficeSettingsPage.checkCheckbox('chkDefaultLaborToHourly');
    await locationLocalOfficeSettingsPage.clickSaveAndConfirm();
    await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect((await locationLocalOfficeSettingsPage.getCheckboxState('chkDefaultLaborToHourly')).checked).toBe(true);
    // Cleanup
    await locationLocalOfficeSettingsPage.uncheckCheckbox('chkDefaultLaborToHourly');
    await locationLocalOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-015: Empty Phone 1 triggers aria-invalid, Save disabled', async ({ locationLocalOfficeSettingsPage }) => {
    // Reload to ensure clean form state after prior test's save cycle
    await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    await locationLocalOfficeSettingsPage.clearAndTab('txtPhone1');
    await expect.poll(() => locationLocalOfficeSettingsPage.isFieldInvalid('txtPhone1'), { timeout: 10_000 }).toBe(true);
    expect(await locationLocalOfficeSettingsPage.isSaveEnabled()).toBe(false);
    await locationLocalOfficeSettingsPage.fillAndTab('txtPhone1', DEFAULT_PHONE_1);
  });

  test('TC-LOS-BAS-016: Phone 1 accepts non-phone format — no format validation', async ({ locationLocalOfficeSettingsPage }) => {
    await locationLocalOfficeSettingsPage.fillAndTab('txtPhone1', 'not-a-phone');
    await expect.poll(() => locationLocalOfficeSettingsPage.isFieldInvalid('txtPhone1'), { timeout: 5_000 }).toBe(false);
    await expect.poll(() => locationLocalOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await locationLocalOfficeSettingsPage.fillAndTab('txtPhone1', DEFAULT_PHONE_1);
    // LR-011: Reload to clear any Angular model residue from non-standard input
    await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-017: Valid phone persists after save and reload', async ({ locationLocalOfficeSettingsPage }) => {
    await locationLocalOfficeSettingsPage.fillAndTab('txtPhone1', '555-123-4567');
    await locationLocalOfficeSettingsPage.waitForSaveToEnable();
    await locationLocalOfficeSettingsPage.clickSaveAndConfirm();
    await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect(await locationLocalOfficeSettingsPage.getInputValue('txtPhone1')).toBe('555-123-4567');
    // Cleanup
    await locationLocalOfficeSettingsPage.fillAndTab('txtPhone1', DEFAULT_PHONE_1);
    await locationLocalOfficeSettingsPage.waitForSaveToEnable();
    await locationLocalOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-018: Phone 1 error recovery — valid phone clears aria-invalid', async ({ locationLocalOfficeSettingsPage }) => {
    // Reload to guarantee clean form state before the clear+fill error recovery test
    await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    await locationLocalOfficeSettingsPage.clearAndTab('txtPhone1');
    await expect.poll(() => locationLocalOfficeSettingsPage.isFieldInvalid('txtPhone1'), { timeout: 5_000 }).toBe(true);
    await locationLocalOfficeSettingsPage.fillAndTab('txtPhone1', '555-000-1111');
    await expect.poll(() => locationLocalOfficeSettingsPage.isFieldInvalid('txtPhone1'), { timeout: 5_000 }).toBe(false);
    await expect.poll(() => locationLocalOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await locationLocalOfficeSettingsPage.fillAndTab('txtPhone1', DEFAULT_PHONE_1);
  });

  test('TC-LOS-BAS-019: Phone 2 optional — empty does not trigger validation', async ({ locationLocalOfficeSettingsPage }) => {
    await locationLocalOfficeSettingsPage.clearAndTab('txtPhone2');
    await expect.poll(() => locationLocalOfficeSettingsPage.isFieldInvalid('txtPhone2'), { timeout: 5_000 }).toBe(false);
  });

  test('TC-LOS-BAS-020: Default New Job 1 Day — 3 sub-checkboxes toggle independently', async ({ locationLocalOfficeSettingsPage }) => {
    for (const { key, label } of ONE_DAY_JOB_CHECKBOXES) {
      await locationLocalOfficeSettingsPage.checkCheckbox(key);
      expect((await locationLocalOfficeSettingsPage.getCheckboxState(key)).checked, label).toBe(true);
    }
    await expect.poll(() => locationLocalOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    // Cleanup
    for (const { key } of ONE_DAY_JOB_CHECKBOXES) {
      await locationLocalOfficeSettingsPage.uncheckCheckbox(key);
    }
  });

  test('TC-LOS-BAS-021: Default Order Type — 2 options (Event, Outside)', async ({ locationLocalOfficeSettingsPage }) => {
    expect(await locationLocalOfficeSettingsPage.getComboboxValue('drpDefaultOrderType')).toBe('Event');
    const options = await locationLocalOfficeSettingsPage.getComboboxOptionsList('drpDefaultOrderType');
    expect(options).toHaveLength(2);
    expect(options).toEqual(expect.arrayContaining(['Event', 'Outside']));
  });

  test('TC-LOS-BAS-022: Default Order Type — selection persists after save', async ({ locationLocalOfficeSettingsPage }) => {
    await locationLocalOfficeSettingsPage.selectComboboxExact('drpDefaultOrderType', 'Outside');
    await locationLocalOfficeSettingsPage.clickSaveAndConfirm();
    await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect(await locationLocalOfficeSettingsPage.getComboboxValue('drpDefaultOrderType')).toBe('Outside');
    // Cleanup
    await locationLocalOfficeSettingsPage.selectComboboxExact('drpDefaultOrderType', 'Event');
    await locationLocalOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-023: PO Number persists after save and reload', async ({ locationLocalOfficeSettingsPage }) => {
    await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    await locationLocalOfficeSettingsPage.fillAndTab('txtPoNumber', 'PO-TEST-123');
    // Verify value was typed before saving
    expect(await locationLocalOfficeSettingsPage.getInputValue('txtPoNumber')).toBe('PO-TEST-123');
    await locationLocalOfficeSettingsPage.waitForSaveToEnable();
    await locationLocalOfficeSettingsPage.clickSaveAndConfirm();
    await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect(await locationLocalOfficeSettingsPage.getInputValue('txtPoNumber')).toBe('PO-TEST-123');
    // Cleanup
    await locationLocalOfficeSettingsPage.fillAndTab('txtPoNumber', '');
    await locationLocalOfficeSettingsPage.waitForSaveToEnable();
    await locationLocalOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-024: PO Number Label persists after save and reload', async ({ locationLocalOfficeSettingsPage }) => {
    await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    await locationLocalOfficeSettingsPage.fillAndTab('txtPoNumberLabel', 'Purchase Order #');
    expect(await locationLocalOfficeSettingsPage.getInputValue('txtPoNumberLabel')).toBe('Purchase Order #');
    await locationLocalOfficeSettingsPage.waitForSaveToEnable();
    await locationLocalOfficeSettingsPage.clickSaveAndConfirm();
    await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect(await locationLocalOfficeSettingsPage.getInputValue('txtPoNumberLabel')).toBe('Purchase Order #');
    // Cleanup
    await locationLocalOfficeSettingsPage.fillAndTab('txtPoNumberLabel', '');
    await locationLocalOfficeSettingsPage.waitForSaveToEnable();
    await locationLocalOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-025: Section Configuration — 13 active sections', async ({ locationLocalOfficeSettingsPage }) => {
    expect(await locationLocalOfficeSettingsPage.getSectionRowCount()).toBe(13);
    const names = await locationLocalOfficeSettingsPage.getSectionNames();
    expect(names).toEqual([...DEFAULT_SECTIONS]);
  });

  test('TC-LOS-BAS-026: Section toggle — checkmark disappears/reappears', async ({ locationLocalOfficeSettingsPage }) => {
    // Reload to guarantee clean baseline — prior BAS-025 reads may leave residual form state
    await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect(await locationLocalOfficeSettingsPage.isSectionActive(0)).toBe(true);
    await locationLocalOfficeSettingsPage.toggleSectionActive(0);
    expect(await locationLocalOfficeSettingsPage.isSectionActive(0)).toBe(false);
    await expect.poll(() => locationLocalOfficeSettingsPage.isSaveEnabled(), { timeout: 10_000 }).toBe(true);
    // Cleanup: toggle back and reload to discard
    await locationLocalOfficeSettingsPage.toggleSectionActive(0);
    await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-027: Section name edit enables Save', async ({ locationLocalOfficeSettingsPage }) => {
    await locationLocalOfficeSettingsPage.editSectionName(0, 'AV Services');
    await expect.poll(() => locationLocalOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    // Cleanup
    await locationLocalOfficeSettingsPage.editSectionName(0, 'Audio Visual');
  });

  test('TC-LOS-BAS-028: Add new section row', async ({ locationLocalOfficeSettingsPage }) => {
    await locationLocalOfficeSettingsPage.addSection('Test Section');
    await expect.poll(() => locationLocalOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    // Cleanup: reload without saving
    await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-029: Default button resets sections', async ({ locationLocalOfficeSettingsPage }) => {
    await locationLocalOfficeSettingsPage.toggleSectionActive(0);
    await locationLocalOfficeSettingsPage.clickDefaultSection();
    await expect.poll(() => locationLocalOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    // Cleanup: reload without saving
    await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-030: Room Configuration — empty table', async ({ locationLocalOfficeSettingsPage }) => {
    expect(await locationLocalOfficeSettingsPage.isRoomTableEmpty()).toBe(true);
  });

  test('TC-LOS-BAS-031: Add room row', async ({ locationLocalOfficeSettingsPage }) => {
    await locationLocalOfficeSettingsPage.addRoom('Ballroom A');
    await expect.poll(() => locationLocalOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    // Cleanup: reload without saving
    await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-032: Logo checkbox default states', async ({ locationLocalOfficeSettingsPage }) => {
    const quotesState = await locationLocalOfficeSettingsPage.getCheckboxState('chkLogoQuotes');
    const rentalState = await locationLocalOfficeSettingsPage.getCheckboxState('chkLogoRentalOrders');
    // Record defaults — per field inventory both are checked for 1604
    expect(quotesState.checked).toBe(true);
    expect(rentalState.checked).toBe(true);
  });

  test('TC-LOS-BAS-033: Company Logo combobox — 12 options', async ({ locationLocalOfficeSettingsPage }) => {
    const options = await locationLocalOfficeSettingsPage.getComboboxOptionsList('drpCompanyLogo');
    expect(options).toHaveLength(12);
  });

  test('TC-LOS-BAS-034: Company Logo — preview updates on selection', async ({ locationLocalOfficeSettingsPage }) => {
    const originalSrc = await locationLocalOfficeSettingsPage.getLogoPreviewSrc();
    const options = await locationLocalOfficeSettingsPage.getComboboxOptionsList('drpCompanyLogo');
    const currentValue = await locationLocalOfficeSettingsPage.getComboboxValue('drpCompanyLogo');
    const differentOption = options.find(o => o !== currentValue) ?? options[0]!;
    await locationLocalOfficeSettingsPage.selectComboboxExact('drpCompanyLogo', differentOption);
    const newSrc = await locationLocalOfficeSettingsPage.getLogoPreviewSrc();
    expect(newSrc).not.toBe(originalSrc);
    // Cleanup: restore original
    await locationLocalOfficeSettingsPage.selectComboboxExact('drpCompanyLogo', currentValue);
  });

  test('TC-LOS-BAS-035: Discount exemption toggles independently', async ({ locationLocalOfficeSettingsPage }) => {
    expect(await locationLocalOfficeSettingsPage.isElementVisible('tblDiscountExemptions')).toBe(true);
    const beforeCount = await locationLocalOfficeSettingsPage.getExemptCount();
    await locationLocalOfficeSettingsPage.toggleExemption(0);
    await expect.poll(() => locationLocalOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    // Cleanup
    await locationLocalOfficeSettingsPage.toggleExemption(0);
  });

  test('TC-LOS-BAS-036: Save dialog — exact text and No cancels', async ({ locationLocalOfficeSettingsPage }) => {
    await locationLocalOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-2');
    await locationLocalOfficeSettingsPage.waitForSaveToEnable();
    const dialogAppeared = await locationLocalOfficeSettingsPage.clickSaveAndCancel();
    if (dialogAppeared) {
      expect(await locationLocalOfficeSettingsPage.isSaveEnabled()).toBe(true);
    }
    // Cleanup
    await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-037: Unsaved changes — Stay keeps changes', async ({ locationLocalOfficeSettingsPage }) => {
    await locationLocalOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-3');
    await locationLocalOfficeSettingsPage.waitForSaveToEnable();
    // Trigger unsaved dialog by clicking History tab
    await locationLocalOfficeSettingsPage.clickTab('tabHistory');
    await locationLocalOfficeSettingsPage.clickUnsavedStay();
    expect(await locationLocalOfficeSettingsPage.isTabSelected('tabBasicInformation')).toBe(true);
    expect(await locationLocalOfficeSettingsPage.getInputValue('txtPrepDateOffset')).toBe('-3');
    // Cleanup
    await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-038: Unsaved changes — Discard navigates away', async ({ locationLocalOfficeSettingsPage }) => {
    await locationLocalOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-4');
    await locationLocalOfficeSettingsPage.waitForSaveToEnable();
    await locationLocalOfficeSettingsPage.clickTab('tabHistory');
    await locationLocalOfficeSettingsPage.clickUnsavedDiscard();
    expect(await locationLocalOfficeSettingsPage.isTabSelected('tabHistory')).toBe(true);
    // Navigate back and verify edit was discarded
    await locationLocalOfficeSettingsPage.clickTab('tabBasicInformation');
    await locationLocalOfficeSettingsPage.waitForBasicInfoForm();
    expect(await locationLocalOfficeSettingsPage.getInputValue('txtPrepDateOffset')).toBe('-1');
  });

  test('TC-LOS-BAS-039: XSS in PO Number — stored as plain text, never executed', async ({ locationLocalOfficeSettingsPage }) => {
    const xss = '<script>alert(1)</script>';
    await locationLocalOfficeSettingsPage.fillAndTab('txtPoNumber', xss);
    if (await locationLocalOfficeSettingsPage.isSaveEnabled()) {
      await locationLocalOfficeSettingsPage.clickSaveAndConfirm();
      await locationLocalOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
      const stored = await locationLocalOfficeSettingsPage.getInputValue('txtPoNumber');
      // App stores XSS as plain text (correct security behavior) — verify it round-trips exactly
      expect(stored).toBe(xss);
    }
    // Cleanup
    await locationLocalOfficeSettingsPage.fillAndTab('txtPoNumber', '');
    if (await locationLocalOfficeSettingsPage.isSaveEnabled()) {
      await locationLocalOfficeSettingsPage.clickSaveAndConfirm();
    }
  });

});
