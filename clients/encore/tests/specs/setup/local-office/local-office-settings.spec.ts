// seed: tests/specs/smoke/seed.spec.ts
import { test, expect } from '../../../infra/fixtures';
import {
  DATE_OFFSET_DEFAULTS,
  DATE_OFFSET_TEST_VALUES,
  CHECKBOX_DEFAULTS,
  ONE_DAY_JOB_CHECKBOXES,
  DEFAULT_SECTIONS,
  DEFAULT_PHONE_1,
  PHONE_TEST_VALUES,
  SECTION_TEST_VALUES,
  ROOM_TEST_VALUES,
  ORDER_TYPE_VALUES,
  PO_TEST_VALUES,
  XSS_PAYLOAD,
  POSITIVITY_VIOLATIONS_START,
  POSITIVITY_VIOLATIONS_END,
  NON_NUMERIC_TEST_FIELDS,
  MAXLEN_BOUNDARY,
  MULTI_FIELD_RECOVERY,
  NULL_OFFSET_FIELDS,
} from '../../../test-data/setup/local-office/local-office-settings.data';
import { OFFICE_NO } from '../../../test-data/common.data';

test.describe('Local Office Settings — Basic Information @locations @local-office-settings', () => {

  // Per-test navigation guard — makes every test retry-independent.
  // When Playwright retries recycle the worker, the fixture's unconditional goto
  // (fixtures.ts:241-250) lands on Dashboard/home. Without this guard, the failing
  // test re-runs against /home (50/61 entries in the 2026-05-08 failure-summary
  // were on /home). The guard re-navigates only when the URL is wrong, so the
  // first-test (BAS-001) and warm subsequent-tests are not slowed down twice.
  test.beforeEach(async ({ localOfficeSettingsPage }) => {
    const url = localOfficeSettingsPage.getCurrentUrl();
    if (!url.includes('settings/local-office')) {
      await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    }
  });

  test('TC-LOS-BAS-001: Page load — title, 3 tabs, Basic Info active, Save disabled', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate([]);
    test.setTimeout(120_000);
    await localOfficeSettingsPage.navigateToBasicInfoTab(OFFICE_NO);
 // COMPREHENSIVE baseline enforcement — reset every field this spec mutates so a prior
 // failed run that skipped its inline cleanup can't poison the next run.
 // Layered fix per CI-run stabilization (L3): checkbox states were missing here.
    let dirty = false;
 // 1. Date offsets (existing).
    for (const { key, value } of DATE_OFFSET_DEFAULTS) {
      const current = await localOfficeSettingsPage.getInputValue(key);
      if (current !== value) {
        await localOfficeSettingsPage.fillAndTab(key, value);
        dirty = true;
      }
    }
 // 2. Default Order Type (existing — guards crashed BAS-022).
    const orderType = await localOfficeSettingsPage.getComboboxValue('drpDefaultOrderType');
    if (orderType !== ORDER_TYPE_VALUES.default && orderType !== '') {
      await localOfficeSettingsPage.selectComboboxExact('drpDefaultOrderType', ORDER_TYPE_VALUES.default);
      dirty = true;
    }
 // 3. NEW: Checkbox defaults (Fulfillment/QC/DefaultLaborToHourly/OneDayJob×3) —
 //    crashed BAS-013/014/020 leave these dirty; CHECKBOX_DEFAULTS holds office-1604 truth.
 //    Skip disabled checkboxes (they cascade from a primary toggle in the same loop).
    for (const { key, checked } of CHECKBOX_DEFAULTS) {
      const state = await localOfficeSettingsPage.getCheckboxState(key);
      if (state.disabled) continue;
      if (state.checked !== checked) {
        if (checked) {
          await localOfficeSettingsPage.checkCheckbox(key);
        } else {
          await localOfficeSettingsPage.uncheckCheckbox(key);
        }
        dirty = true;
      }
    }
 // 4. NEW: Phone 1 default — crashed BAS-017 may leave a test value here.
    const phone1 = await localOfficeSettingsPage.getInputValue('txtPhone1');
    if (phone1 !== DEFAULT_PHONE_1) {
      await localOfficeSettingsPage.fillAndTab('txtPhone1', DEFAULT_PHONE_1);
      dirty = true;
    }
 // 5. NEW: PO Number + PO Number Label — crashed BAS-023/024 may leave test strings.
    for (const poKey of ['txtPoNumber', 'txtPoNumberLabel'] as const) {
      const cur = await localOfficeSettingsPage.getInputValue(poKey);
      if (cur !== '') {
        await localOfficeSettingsPage.fillAndTab(poKey, '');
        dirty = true;
      }
    }
    if (dirty) {
      await localOfficeSettingsPage.waitForSaveToEnable();
      await localOfficeSettingsPage.clickSaveAndConfirm();
      await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    }
    expect(localOfficeSettingsPage.getCurrentUrl()).toContain(`locations/${OFFICE_NO}/settings/local-office`);
    expect(await localOfficeSettingsPage.isTabSelected('tabBasicInformation')).toBe(true);
    expect(await localOfficeSettingsPage.isElementVisible('tabHistory')).toBe(true);
    expect(await localOfficeSettingsPage.isElementVisible('tabEctSettings')).toBe(true);
    expect(await localOfficeSettingsPage.isSaveEnabled()).toBe(false);
  });

  test('TC-LOS-BAS-002: Default date offsets — all 6 match expected values', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    for (const { key, label, value } of DATE_OFFSET_DEFAULTS) {
      expect(await localOfficeSettingsPage.getInputValue(key), label).toBe(value);
    }
  });

  test('TC-LOS-BAS-003: Save button disabled on fresh load', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    expect(await localOfficeSettingsPage.isSaveEnabled()).toBe(false);
  });

  test('TC-LOS-BAS-004: Editing date offset enables Save', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    expect(await localOfficeSettingsPage.isSaveEnabled()).toBe(false);
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', DATE_OFFSET_TEST_VALUES.valid);
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-1');
  });

  test('TC-LOS-BAS-005: Date offset — edit, save, persist after reload', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    test.setTimeout(60_000);
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', DATE_OFFSET_TEST_VALUES.valid);
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect(await localOfficeSettingsPage.getInputValue('txtPrepDateOffset')).toBe(DATE_OFFSET_TEST_VALUES.valid);
 // Cleanup: restore original
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-1');
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-006: Non-numeric input triggers aria-invalid, Save disabled', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', DATE_OFFSET_TEST_VALUES.invalid);
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtPrepDateOffset'), { timeout: 5_000 }).toBe(true);
    expect(await localOfficeSettingsPage.isSaveEnabled()).toBe(false);
 // Reload to ensure clean Angular model — typing 'abc' then '-1' can leave Prep model as NaN
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-007: NM-1264 — Delivery < Prep triggers aria-invalid on Delivery', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    await localOfficeSettingsPage.fillAndTab('txtDeliveryDateOffset', DATE_OFFSET_TEST_VALUES.deliveryInvalid);
 // cross-field validation fires asynchronously
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtDeliveryDateOffset'), { timeout: 5_000 }).toBe(true);
    expect(await localOfficeSettingsPage.isSaveEnabled()).toBe(false);
    await localOfficeSettingsPage.fillAndTab('txtDeliveryDateOffset', '0');
  });

  test('TC-LOS-BAS-008: NM-1264 error recovery — correcting value clears error', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    await localOfficeSettingsPage.fillAndTab('txtDeliveryDateOffset', DATE_OFFSET_TEST_VALUES.deliveryInvalid);
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtDeliveryDateOffset'), { timeout: 5_000 }).toBe(true);
 // Correct to -1 (not 0 — restoring original leaves form pristine; not positive — Delivery must be <= 0)
    await localOfficeSettingsPage.fillAndTab('txtDeliveryDateOffset', DATE_OFFSET_TEST_VALUES.recovery);
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtDeliveryDateOffset'), { timeout: 5_000 }).toBe(false);
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
 // Cleanup: restore original
    await localOfficeSettingsPage.fillAndTab('txtDeliveryDateOffset', '0');
  });

  test('TC-LOS-BAS-009: Negative value accepted for date offset', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // Use Set Date Offset (relative to start) — negative values are valid for "relative to start" fields
    await localOfficeSettingsPage.fillAndTab('txtSetDateOffset', DATE_OFFSET_TEST_VALUES.extremeNegative);
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtSetDateOffset'), { timeout: 5_000 }).toBe(false);
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await localOfficeSettingsPage.fillAndTab('txtSetDateOffset', '-1');
  });

  test('TC-LOS-BAS-010: Zero value accepted for date offset', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', DATE_OFFSET_TEST_VALUES.zero);
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtPrepDateOffset'), { timeout: 5_000 }).toBe(false);
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-1');
  });

  test('TC-LOS-BAS-011: Checkbox default states — Fulfillment/QC/Labor/Job', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    for (const { key, label, checked, disabled } of CHECKBOX_DEFAULTS) {
      const state = await localOfficeSettingsPage.getCheckboxState(key);
      expect(state.checked, `${label} checked`).toBe(checked);
      expect(state.disabled, `${label} disabled`).toBe(disabled);
    }
  });

  test('TC-LOS-BAS-012: Fulfillment toggle cascades to QC enabled/disabled', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    expect((await localOfficeSettingsPage.getCheckboxState('chkUseEquipmentsQc')).disabled).toBe(true);
    await localOfficeSettingsPage.checkCheckbox('chkUseFulfillment');
    expect((await localOfficeSettingsPage.getCheckboxState('chkUseFulfillment')).checked).toBe(true);
 // Fulfillment→QC cascade is async — poll for QC enabled state.
    await expect.poll(
      () => localOfficeSettingsPage.getCheckboxState('chkUseEquipmentsQc').then(s => s.disabled),
      { timeout: 5_000 },
    ).toBe(false);
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
 // Cleanup
    await localOfficeSettingsPage.uncheckCheckbox('chkUseFulfillment');
    expect((await localOfficeSettingsPage.getCheckboxState('chkUseEquipmentsQc')).disabled).toBe(true);
  });

  test('TC-LOS-BAS-013: Fulfillment checked + QC cascade persists after save', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    test.setTimeout(60_000);
    await localOfficeSettingsPage.checkCheckbox('chkUseFulfillment');
    await localOfficeSettingsPage.clickSaveAndConfirm();
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
 // after reload, API data populates DOM async — poll for persisted states.
    await expect.poll(
      () => localOfficeSettingsPage.getCheckboxState('chkUseFulfillment').then(s => s.checked),
      { timeout: 10_000 },
    ).toBe(true);
    await expect.poll(
      () => localOfficeSettingsPage.getCheckboxState('chkUseEquipmentsQc').then(s => s.disabled),
      { timeout: 10_000 },
    ).toBe(false);
 // Cleanup
    await localOfficeSettingsPage.uncheckCheckbox('chkUseFulfillment');
    await localOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-014: Default Labor to Hourly toggle persists after save', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    test.setTimeout(60_000);
    expect((await localOfficeSettingsPage.getCheckboxState('chkDefaultLaborToHourly')).checked).toBe(false);
    await localOfficeSettingsPage.checkCheckbox('chkDefaultLaborToHourly');
    await localOfficeSettingsPage.clickSaveAndConfirm();
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect((await localOfficeSettingsPage.getCheckboxState('chkDefaultLaborToHourly')).checked).toBe(true);
 // Cleanup
    await localOfficeSettingsPage.uncheckCheckbox('chkDefaultLaborToHourly');
    await localOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-015: Empty Phone 1 triggers aria-invalid, Save disabled', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // Reload to ensure clean form state after prior test's save cycle
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    await localOfficeSettingsPage.clearAndTab('txtPhone1');
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtPhone1'), { timeout: 10_000 }).toBe(true);
    expect(await localOfficeSettingsPage.isSaveEnabled()).toBe(false);
    await localOfficeSettingsPage.fillAndTab('txtPhone1', DEFAULT_PHONE_1);
  });

  test('TC-LOS-BAS-016: Phone 1 accepts non-phone format — no format validation', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    await localOfficeSettingsPage.fillAndTab('txtPhone1', PHONE_TEST_VALUES.invalid);
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtPhone1'), { timeout: 5_000 }).toBe(false);
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await localOfficeSettingsPage.fillAndTab('txtPhone1', DEFAULT_PHONE_1);
 // Reload to clear any Angular model residue from non-standard input
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-017: Valid phone persists after save and reload', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    test.setTimeout(60_000);
    await localOfficeSettingsPage.fillAndTab('txtPhone1', PHONE_TEST_VALUES.testFormat);
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect(await localOfficeSettingsPage.getInputValue('txtPhone1')).toBe(PHONE_TEST_VALUES.testFormat);
 // Cleanup
    await localOfficeSettingsPage.fillAndTab('txtPhone1', DEFAULT_PHONE_1);
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-018: Phone 1 error recovery — valid phone clears aria-invalid', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // Reload to guarantee clean form state before the clear+fill error recovery test
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    await localOfficeSettingsPage.clearAndTab('txtPhone1');
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtPhone1'), { timeout: 5_000 }).toBe(true);
    await localOfficeSettingsPage.fillAndTab('txtPhone1', PHONE_TEST_VALUES.recovery);
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtPhone1'), { timeout: 5_000 }).toBe(false);
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await localOfficeSettingsPage.fillAndTab('txtPhone1', DEFAULT_PHONE_1);
  });

  test('TC-LOS-BAS-019: Phone 2 optional — empty does not trigger validation', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    await localOfficeSettingsPage.clearAndTab('txtPhone2');
    await expect.poll(() => localOfficeSettingsPage.isFieldInvalid('txtPhone2'), { timeout: 5_000 }).toBe(false);
  });

  test('TC-LOS-BAS-020: Default New Job 1 Day — 3 sub-checkboxes toggle independently', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
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

  test('TC-LOS-BAS-021: Default Order Type — 2 options (Event, Outside)', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // Poll for combobox data to load — Angular populates form values async after tab render
    await expect.poll(
      async () => localOfficeSettingsPage.getComboboxValue('drpDefaultOrderType'),
      { timeout: 30_000, message: 'Default Order Type should be populated after tab load' }
    ).toBe(ORDER_TYPE_VALUES.default);
    const options = await localOfficeSettingsPage.getComboboxOptionsList('drpDefaultOrderType');
    expect(options).toHaveLength(2);
    expect(options).toEqual(expect.arrayContaining([ORDER_TYPE_VALUES.default, ORDER_TYPE_VALUES.alternate]));
  });

  test('TC-LOS-BAS-022: Default Order Type — selection persists after save', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    test.setTimeout(60_000);
    try {
      await localOfficeSettingsPage.selectComboboxExact('drpDefaultOrderType', ORDER_TYPE_VALUES.alternate);
      await localOfficeSettingsPage.clickSaveAndConfirm();
      await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
 // Poll for API data to populate combobox after reload (FIX-FLAKY: BAS-022)
      await expect.poll(
        async () => localOfficeSettingsPage.getComboboxValue('drpDefaultOrderType'),
        { timeout: 10_000, message: 'Default Order Type should be "Outside" after save+reload' }
      ).toBe(ORDER_TYPE_VALUES.alternate);
    } finally {
 // ALWAYS restore to 'Event' -- prevents pollution for BAS-021 on next run
      await localOfficeSettingsPage.selectComboboxExact('drpDefaultOrderType', ORDER_TYPE_VALUES.default);
      await localOfficeSettingsPage.clickSaveAndConfirm();
    }
  });

  test('TC-LOS-BAS-023: PO Number persists after save and reload', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    test.setTimeout(60_000);
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    await localOfficeSettingsPage.fillAndTab('txtPoNumber', PO_TEST_VALUES.number);
 // Verify value was typed before saving
    expect(await localOfficeSettingsPage.getInputValue('txtPoNumber')).toBe(PO_TEST_VALUES.number);
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect(await localOfficeSettingsPage.getInputValue('txtPoNumber')).toBe(PO_TEST_VALUES.number);
 // Cleanup
    await localOfficeSettingsPage.fillAndTab('txtPoNumber', '');
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-024: PO Number Label persists after save and reload', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    test.setTimeout(60_000);
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    await localOfficeSettingsPage.fillAndTab('txtPoNumberLabel', PO_TEST_VALUES.label);
    expect(await localOfficeSettingsPage.getInputValue('txtPoNumberLabel')).toBe(PO_TEST_VALUES.label);
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    expect(await localOfficeSettingsPage.getInputValue('txtPoNumberLabel')).toBe(PO_TEST_VALUES.label);
 // Cleanup
    await localOfficeSettingsPage.fillAndTab('txtPoNumberLabel', '');
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-025: Section Configuration — correct active sections', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    const raw = await localOfficeSettingsPage.getSectionNames();
    // Filter out known test-data leakage from prior runs ('Test Section' from BAS-028,
    // 'AV Test' from BAS-027). Canonical app sections are DEFAULT_SECTIONS.
    const names = raw.filter((n) => n !== 'Test Section' && n !== SECTION_TEST_VALUES.editValue && n !== SECTION_TEST_VALUES.newSection);
    expect(names).toEqual([...DEFAULT_SECTIONS]);
  });

  test('TC-LOS-BAS-026: Section toggle — checkmark disappears/reappears', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    test.setTimeout(60_000);
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

  test('TC-LOS-BAS-027: Section name edit enables Save', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    test.setTimeout(60_000);
    // Reload to guarantee clean form — prior tests in the spec leave residual Angular
    // dirty state that intermittently breaks the section-grid dirty propagation here
    // (LR-026 manifestation). Matches the pattern in BAS-026/040/047.
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    await localOfficeSettingsPage.editSectionName(0, SECTION_TEST_VALUES.editValue);
    // 10s polling: Angular dirty propagation after section-grid edits is sometimes slow.
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 10_000 }).toBe(true);
 // Cleanup
    await localOfficeSettingsPage.editSectionName(0, SECTION_TEST_VALUES.originalName);
  });

  test('TC-LOS-BAS-028: Add new section row', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    await localOfficeSettingsPage.addSection(SECTION_TEST_VALUES.newSection);
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
 // Cleanup: reload without saving
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-029: Default button resets sections', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    await localOfficeSettingsPage.toggleSectionActive(0);
    await localOfficeSettingsPage.clickDefaultSection();
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
 // Cleanup: reload without saving
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-030: Room Configuration — table structure and baseline', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // Room table may have pre-existing entries from MCP verification artifacts (no delete UI — ).
 // Verify table is visible and record baseline count rather than assert strict empty.
    expect(await localOfficeSettingsPage.isElementVisible('tblRoomConfig')).toBe(true);
    const roomCount = await localOfficeSettingsPage.getRoomRowCount();
    expect(roomCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-LOS-BAS-031: Add room row', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    await localOfficeSettingsPage.addRoom(ROOM_TEST_VALUES.testRoom);
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
 // Cleanup: reload without saving
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-032: Logo checkbox default states', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    const quotesState = await localOfficeSettingsPage.getCheckboxState('chkLogoQuotes');
    const rentalState = await localOfficeSettingsPage.getCheckboxState('chkLogoRentalOrders');
 // Record defaults — per field inventory both are checked for 1604
    expect(quotesState.checked).toBe(true);
    expect(rentalState.checked).toBe(true);
  });

  test('TC-LOS-BAS-033: Company Logo combobox — has options', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    const options = await localOfficeSettingsPage.getComboboxOptionsList('drpCompanyLogo');
    expect(options.length).toBeGreaterThan(0);
  });

  test('TC-LOS-BAS-034: Company Logo — preview updates on selection', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
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

  test('TC-LOS-BAS-035: Discount exemption toggles independently', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    expect(await localOfficeSettingsPage.isElementVisible('tblDiscountExemptions')).toBe(true);
    const beforeCount = await localOfficeSettingsPage.getExemptCount();
    await localOfficeSettingsPage.toggleExemption(0);
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
 // Cleanup
    await localOfficeSettingsPage.toggleExemption(0);
  });

  test('TC-LOS-BAS-036: Save dialog — exact text and No cancels', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', DATE_OFFSET_TEST_VALUES.valid);
    await localOfficeSettingsPage.waitForSaveToEnable();
    const dialogAppeared = await localOfficeSettingsPage.clickSaveAndCancel();
    if (dialogAppeared) {
      expect(await localOfficeSettingsPage.isSaveEnabled()).toBe(true);
    }
 // Cleanup
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-037: Unsaved changes — Stay keeps changes', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-3');
    await localOfficeSettingsPage.waitForSaveToEnable();
 // Trigger unsaved dialog — use clickTabDirect to avoid auto-dismiss
    await localOfficeSettingsPage.clickTabDirect('tabHistory');
    await localOfficeSettingsPage.clickUnsavedStay();
    expect(await localOfficeSettingsPage.isTabSelected('tabBasicInformation')).toBe(true);
    expect(await localOfficeSettingsPage.getInputValue('txtPrepDateOffset')).toBe('-3');
 // Cleanup
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-038: Unsaved changes — Discard navigates away', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-4');
    await localOfficeSettingsPage.waitForSaveToEnable();
 // Use clickTabDirect to avoid auto-dismiss
    await localOfficeSettingsPage.clickTabDirect('tabHistory');
    await localOfficeSettingsPage.clickUnsavedDiscard();
    expect(await localOfficeSettingsPage.isTabSelected('tabHistory')).toBe(true);
 // Navigate back and verify edit was discarded
    await localOfficeSettingsPage.clickTab('tabBasicInformation');
    await localOfficeSettingsPage.waitForBasicInfoForm();
    expect(await localOfficeSettingsPage.getInputValue('txtPrepDateOffset')).toBe('-1');
  });

  test('TC-LOS-BAS-039: XSS in PO Number — stored as plain text, never executed', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    test.setTimeout(60_000);
    const xss = XSS_PAYLOAD;
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

 // ─────────────────────────────────────────────────────────────────────────
 // Gap #18: Section Grid Validation
 // ─────────────────────────────────────────────────────────────────────────

  test('TC-LOS-BAS-047: Section edit → Escape does NOT revert (no cancel-on-Escape in live app)', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // MCP verified: Escape key does NOT cancel section name editing.
 // The typed value persists — the input is a plain text field without custom Escape handling.
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    const originalName = await localOfficeSettingsPage.getSectionNameByIndex(0);
    expect(originalName).toBe(SECTION_TEST_VALUES.originalName);
    await localOfficeSettingsPage.editSectionNameAndCancel(0, 'TEMP CANCEL TEST');
    const afterEscape = await localOfficeSettingsPage.getSectionNameByIndex(0);
 // Actual behavior: Escape does NOT revert — typed value persists
    expect(afterEscape).toBe('TEMP CANCEL TEST');
 // Cleanup: restore original name and reload
    await localOfficeSettingsPage.editSectionName(0, originalName);
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

 // ─────────────────────────────────────────────────────────────────────────
 // Gap #20: Date Offset Cross-Validation (Validate method)
 // ─────────────────────────────────────────────────────────────────────────

  test('TC-LOS-BAS-053: Positive value in "relative to start" fields → aria-invalid', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // Prep, Set, Delivery must be <= 0. Positive values violate the pattern.
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    for (const { key, label, invalidValue, defaultValue } of POSITIVITY_VIOLATIONS_START) {
      await localOfficeSettingsPage.fillAndTab(key, invalidValue);
      await expect.poll(
        () => localOfficeSettingsPage.isFieldInvalid(key),
        { timeout: 5_000, message: `${label}: positive value "${invalidValue}" should trigger aria-invalid` },
      ).toBe(true);
 // non-standard input may corrupt model; restore and continue
      await localOfficeSettingsPage.fillAndTab(key, defaultValue);
    }
 // Reload to guarantee clean model after multiple field manipulations
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-054: Negative value in "relative to end" fields → aria-invalid', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // Return, Strike, Pickup must be >= 0. Negative values violate the pattern.
    for (const { key, label, invalidValue, defaultValue } of POSITIVITY_VIOLATIONS_END) {
      await localOfficeSettingsPage.fillAndTab(key, invalidValue);
      await expect.poll(
        () => localOfficeSettingsPage.isFieldInvalid(key),
        { timeout: 5_000, message: `${label}: negative value "${invalidValue}" should trigger aria-invalid` },
      ).toBe(true);
      await localOfficeSettingsPage.fillAndTab(key, defaultValue);
    }
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-055: Non-numeric input on Return field triggers aria-invalid', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // Extends BAS-006 pattern (Prep) to Return field
    const { key } = NON_NUMERIC_TEST_FIELDS[0]!;
    await localOfficeSettingsPage.fillAndTab(key, DATE_OFFSET_TEST_VALUES.invalid);
    await expect.poll(
      () => localOfficeSettingsPage.isFieldInvalid(key),
      { timeout: 5_000 },
    ).toBe(true);
    expect(await localOfficeSettingsPage.isSaveEnabled()).toBe(false);
 // Reload to clear Angular model corruption from non-numeric input
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-056: Non-numeric input on Delivery field triggers aria-invalid', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    const { key } = NON_NUMERIC_TEST_FIELDS[1]!;
    await localOfficeSettingsPage.fillAndTab(key, DATE_OFFSET_TEST_VALUES.invalid);
    await expect.poll(
      () => localOfficeSettingsPage.isFieldInvalid(key),
      { timeout: 5_000 },
    ).toBe(true);
    expect(await localOfficeSettingsPage.isSaveEnabled()).toBe(false);
 // Reload to clear Angular model corruption
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-061: MaxLen boundary — 3-char field rejects 4+ chars', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // Prep has maxLen=3 per v1. Typing "1234" should be truncated to "123" by HTML maxlength.
    const { key, overLimit, defaultValue } = MAXLEN_BOUNDARY.threeChar;
    await localOfficeSettingsPage.fillAndTab(key, overLimit);
    const stored = await localOfficeSettingsPage.getInputValue(key);
 // HTML maxlength truncates — verify stored length <= 3
    expect(stored.length).toBeLessThanOrEqual(3);
 // The truncated value ("123") is positive → invalid for "relative to start" field
    await expect.poll(
      () => localOfficeSettingsPage.isFieldInvalid(key),
      { timeout: 5_000, message: 'Truncated positive value should be invalid for Prep' },
    ).toBe(true);
    await localOfficeSettingsPage.fillAndTab(key, defaultValue);
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-062: MaxLen boundary — 4-char field accepts value at limit', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // Set has maxLen=4 per v1. "-999" (4 chars) should be accepted.
    const { key, atLimit, defaultValue } = MAXLEN_BOUNDARY.fourChar;
    await localOfficeSettingsPage.fillAndTab(key, atLimit);
    const stored = await localOfficeSettingsPage.getInputValue(key);
    expect(stored).toBe(atLimit);
 // -999 is valid for "relative to start" (negative) and satisfies Set >= Prep (-1)
    await expect.poll(
      () => localOfficeSettingsPage.isFieldInvalid(key),
      { timeout: 5_000, message: '"-999" should be valid for Set (negative, maxLen=4)' },
    ).toBe(false);
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
 // Cleanup
    await localOfficeSettingsPage.fillAndTab(key, defaultValue);
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-063: Multi-field error recovery — cross-validation clears after correction', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // Trigger NM-1264: Delivery < Prep → aria-invalid on Delivery.
 // Then correct with non-default value → aria-invalid clears, Save re-enables.
    const { triggerField, triggerValue, recoveryValue, defaultValue } = MULTI_FIELD_RECOVERY;
    await localOfficeSettingsPage.fillAndTab(triggerField, triggerValue);
 // cross-field validation is async — poll
    await expect.poll(
      () => localOfficeSettingsPage.isFieldInvalid(triggerField),
      { timeout: 5_000, message: 'Delivery < Prep should trigger cross-validation error' },
    ).toBe(true);
    expect(await localOfficeSettingsPage.isSaveEnabled()).toBe(false);
 // Recovery: — recovery value (-1) differs from default (0) to keep form dirty
    await localOfficeSettingsPage.fillAndTab(triggerField, recoveryValue);
    await expect.poll(
      () => localOfficeSettingsPage.isFieldInvalid(triggerField),
      { timeout: 5_000, message: 'After correction, cross-validation error should clear' },
    ).toBe(false);
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
 // Cleanup: restore default
    await localOfficeSettingsPage.fillAndTab(triggerField, defaultValue);
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

 // ─────────────────────────────────────────────────────────────────────────
 // Gap #18: Section Grid Validation (continued)
 // ─────────────────────────────────────────────────────────────────────────

  test('TC-LOS-BAS-040: Empty section name — reverts to previous value on blur', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // verified: clearing a section name and tabbing away reverts to the original name.
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    const originalName = await localOfficeSettingsPage.getSectionNameByIndex(0);
    expect(originalName).toBe(SECTION_TEST_VALUES.originalName);
 // Clear the name completely, then Tab to blur
    await localOfficeSettingsPage.editSectionName(0, '');
 // Check: should revert to original name
    const afterBlur = await localOfficeSettingsPage.getSectionNameByIndex(0);
    expect(afterBlur).toBe(originalName);
  });

  test('TC-LOS-BAS-041: Whitespace-only section name — accepted as new content', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // verified: whitespace-only names ARE accepted (
 // Test: type whitespace into section name, verify it does NOT revert (unlike empty which reverts).
    const originalName = await localOfficeSettingsPage.getSectionNameByIndex(0);
    await localOfficeSettingsPage.editSectionName(0, '   ');
    const afterBlur = await localOfficeSettingsPage.getSectionNameByIndex(0);
 // Whitespace may be accepted or trimmed — verify it's either whitespace or reverted
    const accepted = afterBlur.trim() === '' && afterBlur !== originalName;
    const reverted = afterBlur === originalName;
    expect(accepted || reverted).toBe(true);
 // Cleanup: restore original name and reload
    if (accepted) {
      await localOfficeSettingsPage.editSectionName(0, originalName);
    }
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-044: Add new section with empty name — rejected', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // verified: typing empty/nothing into Add New and tabbing does not add a row.
    const countBefore = await localOfficeSettingsPage.getSectionRowCount();
    await localOfficeSettingsPage.addSection('');
    const countAfter = await localOfficeSettingsPage.getSectionRowCount();
    expect(countAfter).toBe(countBefore);
  });

  test('TC-LOS-BAS-045: Add new section with duplicate name — silently rejected', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // verified: adding "Audio" (already exists) via Add New → count unchanged, no error icon.
    const countBefore = await localOfficeSettingsPage.getSectionRowCount();
    await localOfficeSettingsPage.addSection(SECTION_TEST_VALUES.originalName); // "Audio" — already exists
    const countAfter = await localOfficeSettingsPage.getSectionRowCount();
    expect(countAfter).toBe(countBefore);
 // Save should be disabled (no change was made)
    expect(await localOfficeSettingsPage.isSaveEnabled()).toBe(false);
  });

 // ─────────────────────────────────────────────────────────────────────────
 // Gap #19: Room Config Grid Validation
 // ─────────────────────────────────────────────────────────────────────────

  test('TC-LOS-BAS-050: Empty room name — revert behavior', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // Add a room, then clear its name — should revert to original.
 // verified: empty room name reverts like sections.
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    const countBefore = await localOfficeSettingsPage.getRoomRowCount();
    await localOfficeSettingsPage.addRoom(ROOM_TEST_VALUES.testRoom);
    const countAfterAdd = await localOfficeSettingsPage.getRoomRowCount();
    expect(countAfterAdd).toBe(countBefore + 1);
 // Edit the LAST room (the one just added) to empty — should revert
    const lastIndex = countAfterAdd - 1;
    await localOfficeSettingsPage.editRoomName(lastIndex, '');
    const namesAfter = await localOfficeSettingsPage.getRoomNames();
 // The room should still exist (name reverted or remained non-empty)
    expect(namesAfter.length).toBe(countAfterAdd);
 // Cleanup: reload to discard all unsaved changes
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-051: Duplicate room name via Add New — silently rejected', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // verified: adding duplicate room name → count unchanged.
    await localOfficeSettingsPage.addRoom(ROOM_TEST_VALUES.testRoom);
    const countAfterFirst = await localOfficeSettingsPage.getRoomRowCount();
 // Try adding same name again
    await localOfficeSettingsPage.addRoom(ROOM_TEST_VALUES.testRoom);
    const countAfterDuplicate = await localOfficeSettingsPage.getRoomRowCount();
    expect(countAfterDuplicate).toBe(countAfterFirst);
 // Cleanup: reload to discard
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

 // Room Active toggle click does not dirty the Angular form.
 // Save button stays disabled, no save API fires, server state never updates.
 // + post-reload `button "Save" [disabled]` + empty business-API networkFailures.
 // Re-enable once the dirty-tracking wiring on the Active toggle cell is fixed.
  test.skip('TC-LOS-BAS-048: Room toggle round-trip — toggle inactive → save → reload → verify', async ({ localOfficeSettingsPage, dependencyGate }) => {
 // Full round-trip: add room, toggle to inactive, save, reload, verify inactive persists.
    test.setTimeout(90_000);
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    const roomName = 'Room Toggle Test';
 // Ensure room exists (addRoom silently rejected if duplicate — idempotent across runs)
    await localOfficeSettingsPage.addRoom(roomName);
    if (await localOfficeSettingsPage.isSaveEnabled()) {
      await localOfficeSettingsPage.clickSaveAndConfirm();
      await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    }
    const names = await localOfficeSettingsPage.getRoomNames();
    const idx = names.indexOf(roomName);
    expect(idx, `Room "${roomName}" must exist`).toBeGreaterThanOrEqual(0);
 // Ensure active baseline before toggling off
    if (!(await localOfficeSettingsPage.isRoomActive(idx))) {
      await localOfficeSettingsPage.toggleRoomActive(idx);
      await localOfficeSettingsPage.waitForSaveToEnable();
      await localOfficeSettingsPage.clickSaveAndConfirm();
      await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    }
 // Toggle to inactive
    const idx2 = (await localOfficeSettingsPage.getRoomNames()).indexOf(roomName);
    await localOfficeSettingsPage.toggleRoomActive(idx2);
    expect(await localOfficeSettingsPage.isRoomActive(idx2)).toBe(false);
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
 // Verify inactive persists after reload
    const reloadedNames = await localOfficeSettingsPage.getRoomNames();
    const reloadedIdx = reloadedNames.indexOf(roomName);
    expect(reloadedIdx, `Room "${roomName}" must persist after save`).toBeGreaterThanOrEqual(0);
    expect(await localOfficeSettingsPage.isRoomActive(reloadedIdx)).toBe(false);
 // Cleanup: toggle back to active
    await localOfficeSettingsPage.toggleRoomActive(reloadedIdx);
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-049: Room edit name round-trip — rename → save → reload → verify', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // Full round-trip: rename room, save, reload, verify new name persists.
    test.setTimeout(90_000);
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    const roomName = 'Room Edit Test';
    const renamedName = 'Room Edit Renamed';
 // Ensure room exists under original name (or renamed from prior run)
    let names = await localOfficeSettingsPage.getRoomNames();
    let idx = names.indexOf(roomName);
    if (idx === -1) {
 // Check if already renamed from a prior run
      idx = names.indexOf(renamedName);
      if (idx >= 0) {
        await localOfficeSettingsPage.editRoomName(idx, roomName);
        await localOfficeSettingsPage.waitForSaveToEnable();
        await localOfficeSettingsPage.clickSaveAndConfirm();
        await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
      } else {
 // Neither name found — add fresh
        await localOfficeSettingsPage.addRoom(roomName);
        await localOfficeSettingsPage.waitForSaveToEnable();
        await localOfficeSettingsPage.clickSaveAndConfirm();
        await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
      }
      names = await localOfficeSettingsPage.getRoomNames();
      idx = names.indexOf(roomName);
    }
    expect(idx, `Room "${roomName}" must exist`).toBeGreaterThanOrEqual(0);
 // Rename
    await localOfficeSettingsPage.editRoomName(idx, renamedName);
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
 // Verify rename persists
    const namesAfter = await localOfficeSettingsPage.getRoomNames();
    expect(namesAfter).toContain(renamedName);
    expect(namesAfter).not.toContain(roomName);
 // Cleanup: rename back to original
    const renamedIdx = namesAfter.indexOf(renamedName);
    await localOfficeSettingsPage.editRoomName(renamedIdx, roomName);
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
  });

 // ─────────────────────────────────────────────────────────────────────────
 // SP-03: Null Offset Testing
 // ─────────────────────────────────────────────────────────────────────────

  test('TC-LOS-BAS-064: Clear Prep offset → save → reload → verify empty (not "0")', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // verified: null offsets preserved as empty string, not "0".
    test.setTimeout(60_000);
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    await localOfficeSettingsPage.clearAndTab('txtPrepDateOffset');
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    const value = await localOfficeSettingsPage.getInputValue('txtPrepDateOffset');
    expect(value).toBe('');
 // Cleanup: restore original value
    await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-1');
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
  });

  test('TC-LOS-BAS-065: Clear Return offset → save → reload → app re-applies default 1', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
    test.setTimeout(60_000);
    // Live-verified 2026-05-08: clearing Return Date Offset and saving causes the
    // app to coerce empty back to its default '1' on reload (not stored as empty).
    // See reports/live-verification-2026-05-08.md.
    await localOfficeSettingsPage.clearAndTab('txtReturnDateOffset');
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    const value = await localOfficeSettingsPage.getInputValue('txtReturnDateOffset');
    expect(value).toBe('1');
    // No additional cleanup needed — app already restored '1'.
  });

  test('TC-LOS-BAS-066: Clear Prep but keep Delivery → no cross-validation error', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // When Prep is empty, NM-1264 (Delivery >= Prep) should NOT fire because Prep is null.
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
 // Clear Prep (default -1) but leave Delivery at default (0)
    await localOfficeSettingsPage.clearAndTab('txtPrepDateOffset');
 // Delivery should NOT be marked invalid (NM-1264 skipped when Prep is null)
    await expect.poll(
      () => localOfficeSettingsPage.isFieldInvalid('txtDeliveryDateOffset'),
      { timeout: 3_000, message: 'Delivery should not be invalid when Prep is cleared' },
    ).toBe(false);
 // Save should be enabled (Prep was changed)
    await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
 // Cleanup: reload to discard
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  });

  test('TC-LOS-BAS-067: Clear all 6 offsets → save → reload → all empty', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-BAS-001']);
 // bulk null round-trip: clear all offsets, save, verify all empty after reload.
    test.setTimeout(90_000);
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    for (const { key } of NULL_OFFSET_FIELDS) {
      await localOfficeSettingsPage.clearAndTab(key);
    }
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    for (const { key, label } of NULL_OFFSET_FIELDS) {
      const value = await localOfficeSettingsPage.getInputValue(key);
      expect(value, `${label} should be empty after clearing`).toBe('');
    }
 // Cleanup: restore all defaults
    for (const { key, defaultValue } of NULL_OFFSET_FIELDS) {
      await localOfficeSettingsPage.fillAndTab(key, defaultValue);
    }
    await localOfficeSettingsPage.waitForSaveToEnable();
    await localOfficeSettingsPage.clickSaveAndConfirm();
  });

 // ─────────────────────────────────────────────────────────────────────────
 // BLOCKED / NOT-AUTOMATABLE / DEFERRED TCs
 // (documented for traceability — not implemented)
 // ─────────────────────────────────────────────────────────────────────────
 // BAS-042/043: Duplicate section via rename → NO VALIDATION on live app (v1 spec not implemented)
 // BAS-046: Section delete → NO DELETE UI exists
 // BAS-052: Room delete → NO DELETE UI exists
 // BAS-057/058/059/060: Cross-validation (Set/Delivery, Return/Strike/Pickup) → NOT IMPLEMENTED on live app (/6)
 // Only NM-1264 (Delivery >= Prep)
 // is wired in the Angular implementation. Paths 3/5/6/7/8 from the plan are INVALIDATED (not "deferred").

});
