import { test, expect } from '../../src/infra/fixtures';
import { ECT_FIXED_COST_FIELDS } from '../../src/data/testdata/local-office/local-office-settings.data';
import {
  ECT_PAGE,
  ECT_SECTIONS,
  BENEFITS_MULTIPLIER,
  HISTORICAL_SUBRENTAL,
  LABOR_COST_TEST,
  LABOR_COST_RT_ROWS,
} from '../../src/data/testdata/local-office/local-office-ect.data';
import { OFFICE_NO } from '../../src/data/testdata/common.data';

test.describe('Local Office Settings — ECT Settings @locations @local-office-ect', () => {

  // Per-test navigation guard (dependency-gate removal Phase 1.5).
  // When Playwright retries recycle the worker, the fixture's unconditional goto lands
  // on Dashboard/home. Without this guard, the failing test re-runs against /home and
  // every subsequent test in the spec produces a /home cascade. Mirrors BAS spec :33.
  test.beforeEach(async ({ localOfficeSettingsPage }) => {
    const url = localOfficeSettingsPage.getCurrentUrl();
    if (!url.includes('settings/local-office')) {
      await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
      await localOfficeSettingsPage.navigateToEctTab();
    }
  });

  test('TC-LOS-ECT-001: ECT tab — location name, commission link, currency selector', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate([]);
    test.setTimeout(60_000);
    await localOfficeSettingsPage.navigateToBasicInfoTab(OFFICE_NO);
    await localOfficeSettingsPage.navigateToEctTab();
 // Baseline enforcement — reset Benefits Multiplier to 0.2 if dirty from prior run
    const currentBM = await localOfficeSettingsPage.getEctFieldValue('txtBenefitsMultiplier');
    if (!currentBM.includes(BENEFITS_MULTIPLIER.defaultDisplay)) {
      await localOfficeSettingsPage.fillAndTab('txtBenefitsMultiplier', BENEFITS_MULTIPLIER.restoreValue);
      await localOfficeSettingsPage.clickSaveFixedCosts();
      await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
      await localOfficeSettingsPage.navigateToEctTab();
    }
    expect(await localOfficeSettingsPage.isTabSelected('tabEctSettings')).toBe(true);
    expect(await localOfficeSettingsPage.getTextContent('lblEctLocationName')).toContain(ECT_PAGE.locationDisplay);
    expect(await localOfficeSettingsPage.isElementVisible('lnkCommissionStructure')).toBe(true);
    expect(await localOfficeSettingsPage.getComboboxValue('drpCurrency')).toContain(ECT_PAGE.currency);
  });

  test('TC-LOS-ECT-002: Currency selector — contains USD', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    const options = await localOfficeSettingsPage.getComboboxOptionsList('drpCurrency');
    expect(options.some(o => o.includes(ECT_PAGE.currency))).toBe(true);
  });

  test('TC-LOS-ECT-003: Event Profit Target — label visible, read-only', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    expect(await localOfficeSettingsPage.getTextContent('lblEventProfitTarget')).toBe(ECT_SECTIONS.eventProfitTarget);
    expect(await localOfficeSettingsPage.isEventProfitTargetReadOnly()).toBe(true);
  });

  test('TC-LOS-ECT-004: Fixed cost display fields — 7 correct values', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    for (const { key, label, expected } of ECT_FIXED_COST_FIELDS) {
      const actual = await localOfficeSettingsPage.getEctFieldValue(key);
      expect(actual, label).toContain(expected);
    }
  });

  test('TC-LOS-ECT-005: Benefits Multiplier — edit, save, persist', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    test.setTimeout(60_000);
    expect(await localOfficeSettingsPage.getEctFieldValue('txtBenefitsMultiplier')).toContain(BENEFITS_MULTIPLIER.defaultDisplay);
    await localOfficeSettingsPage.fillAndTab('txtBenefitsMultiplier', BENEFITS_MULTIPLIER.testInput);
    expect(await localOfficeSettingsPage.isEctFixedCostsSaveEnabled()).toBe(true);
    await localOfficeSettingsPage.clickSaveFixedCosts();
 // Navigate away and return to verify persistence
    await localOfficeSettingsPage.clickTab('tabBasicInformation');
    await localOfficeSettingsPage.navigateToEctTab();
    expect(await localOfficeSettingsPage.getEctFieldValue('txtBenefitsMultiplier')).toContain(BENEFITS_MULTIPLIER.expectedAfterSave);
 // Cleanup
    await localOfficeSettingsPage.fillAndTab('txtBenefitsMultiplier', BENEFITS_MULTIPLIER.restoreValue);
    await localOfficeSettingsPage.clickSaveFixedCosts();
  });

  test('TC-LOS-ECT-006: Historical Subrental % — editable', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    test.setTimeout(60_000);
    await localOfficeSettingsPage.fillAndTab('txtHistoricalSubrental', HISTORICAL_SUBRENTAL.testValue);
    expect(await localOfficeSettingsPage.isEctFixedCostsSaveEnabled()).toBe(true);
 // Cleanup — full page reload discards unsaved changes and resets Angular dirty state.
 // Cannot save-restore: filling original value (0) makes Save disabled while Angular
 // still tracks intermediate 0.1 as dirty. Tab click would trigger Radix
 // "Unsaved changes" alertdialog that blocks all pointer events on subsequent tests.
 // reloadBasicInfo does safeNavigateTo (handles native beforeunload) + fresh page load.
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    await localOfficeSettingsPage.navigateToEctTab();
  });

  test('TC-LOS-ECT-007: Two independent Save buttons', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    test.setTimeout(60_000);
 // Reload ECT tab to reset Angular dirty state from prior test
    await localOfficeSettingsPage.navigateToBasicInfoTab(OFFICE_NO);
    await localOfficeSettingsPage.navigateToEctTab();
    expect(await localOfficeSettingsPage.isEctFixedCostsSaveEnabled()).toBe(false);
    expect(await localOfficeSettingsPage.isEctLaborCostsSaveEnabled()).toBe(false);
    await localOfficeSettingsPage.fillAndTab('txtBenefitsMultiplier', BENEFITS_MULTIPLIER.altTestValue);
    expect(await localOfficeSettingsPage.isEctFixedCostsSaveEnabled()).toBe(true);
    expect(await localOfficeSettingsPage.isEctLaborCostsSaveEnabled()).toBe(false);
 // Cleanup — reload to discard unsaved changes. Restoring original 0.2 would make Save
 // disabled while Angular still tracks intermediate dirty state, causing "Unsaved changes"
 // dialog on subsequent tab navigation (blocks ECT-009 pointer events).
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    await localOfficeSettingsPage.navigateToEctTab();
  });

  test('TC-LOS-ECT-008: Labor Cost Assumptions — class read-only, cost editable', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    expect(await localOfficeSettingsPage.getTextContent('lblLaborCostAssumptions')).toBe(ECT_SECTIONS.laborCostAssumptions);
    expect(await localOfficeSettingsPage.getFirstLaborClassName()).toBe(LABOR_COST_TEST.firstClass);
    expect(await localOfficeSettingsPage.getLastLaborClassName()).toBe(LABOR_COST_TEST.lastClass);
    expect(await localOfficeSettingsPage.isLaborClassReadOnly()).toBe(true);
    expect(await localOfficeSettingsPage.isLaborCostEditable()).toBe(true);
  });

  test('TC-LOS-ECT-009: Labor cost — edit, save, persist', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    test.setTimeout(90_000);
 // Navigate via URL (not reload) to avoid "No currencies" API cache miss.
 // ECT-008 is read-only so no dirty state to discard — clean navigation suffices.
    await localOfficeSettingsPage.navigateToBasicInfoTab(OFFICE_NO);
    await localOfficeSettingsPage.navigateToEctTab();
 // Read current server value and pick a different test value to guarantee dirty state
    const currentValue = await localOfficeSettingsPage.getLaborCostValue(0);
    const testValue = currentValue === LABOR_COST_TEST.currentValue ? LABOR_COST_TEST.testValue : LABOR_COST_TEST.altValue;
    await localOfficeSettingsPage.fillLaborCost(0, testValue);
    expect(await localOfficeSettingsPage.isEctLaborCostsSaveEnabled()).toBe(true);
    await localOfficeSettingsPage.clickSaveLaborCosts();
 // Navigate away and return
    await localOfficeSettingsPage.clickTab('tabBasicInformation');
    await localOfficeSettingsPage.navigateToEctTab();
    expect(await localOfficeSettingsPage.getLaborCostValue(0)).toBe(`${testValue}.00`);
 // Cleanup — restore original
    await localOfficeSettingsPage.fillLaborCost(0, currentValue.replace('.00', ''));
    await localOfficeSettingsPage.clickSaveLaborCosts();
  });

  test('TC-LOS-ECT-010: Labor cost — non-numeric reverts silently', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    const original = await localOfficeSettingsPage.getLaborCostValue(0);
    await localOfficeSettingsPage.fillLaborCost(0, LABOR_COST_TEST.invalidInput);
    const afterBlur = await localOfficeSettingsPage.getLaborCostValue(0);
    expect(afterBlur).toBe(original);
  });

  test('TC-LOS-ECT-011: SubRental Matrix — label visible, read-only', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    expect(await localOfficeSettingsPage.getTextContent('lblSubRentalMatrix')).toBe(ECT_SECTIONS.subRentalMatrix);
    expect(await localOfficeSettingsPage.isSubRentalReadOnly()).toBe(true);
  });

  test('TC-LOS-ECT-012: ECT Save — no confirmation dialog, no unsaved dialog after', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    test.setTimeout(60_000);
    await localOfficeSettingsPage.fillAndTab('txtBenefitsMultiplier', BENEFITS_MULTIPLIER.altTestValue);
    await localOfficeSettingsPage.clickSaveFixedCosts();
 // Navigate to another tab — should NOT trigger unsaved changes dialog
    await localOfficeSettingsPage.clickTab('tabBasicInformation');
    await localOfficeSettingsPage.waitForBasicInfoForm();
    expect(await localOfficeSettingsPage.isTabSelected('tabBasicInformation')).toBe(true);
 // Cleanup: return to ECT and restore
    await localOfficeSettingsPage.navigateToEctTab();
    await localOfficeSettingsPage.fillAndTab('txtBenefitsMultiplier', BENEFITS_MULTIPLIER.restoreValue);
    await localOfficeSettingsPage.clickSaveFixedCosts();
  });

  test('TC-LOS-ECT-013: Historical Subrental % — edit, save, persist', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    test.setTimeout(60_000);
 // Defensive read — don't assume default
    const currentHS = await localOfficeSettingsPage.getEctFieldValue('txtHistoricalSubrental');
    const testValue = currentHS.includes(HISTORICAL_SUBRENTAL.defaultDisplay) ? HISTORICAL_SUBRENTAL.testValue : HISTORICAL_SUBRENTAL.restoreValue;
    const expectedDisplay = currentHS.includes(HISTORICAL_SUBRENTAL.defaultDisplay) ? HISTORICAL_SUBRENTAL.expectedAfterSave : HISTORICAL_SUBRENTAL.defaultDisplay;
    await localOfficeSettingsPage.fillAndTab('txtHistoricalSubrental', testValue);
    expect(await localOfficeSettingsPage.isEctFixedCostsSaveEnabled()).toBe(true);
    await localOfficeSettingsPage.clickSaveFixedCosts();
 // Navigate away and return to verify persistence
    await localOfficeSettingsPage.clickTab('tabBasicInformation');
    await localOfficeSettingsPage.navigateToEctTab();
    expect(await localOfficeSettingsPage.getEctFieldValue('txtHistoricalSubrental')).toContain(expectedDisplay);
 // Restore original value
    const restoreRaw = currentHS.includes(HISTORICAL_SUBRENTAL.defaultDisplay) ? HISTORICAL_SUBRENTAL.restoreValue : HISTORICAL_SUBRENTAL.testValue;
    await localOfficeSettingsPage.fillAndTab('txtHistoricalSubrental', restoreRaw);
    await localOfficeSettingsPage.clickSaveFixedCosts();
  });

  for (const { rowIndex, name } of LABOR_COST_RT_ROWS) {
    test(`TC-LOS-ECT-${rowIndex === 33 ? '014' : '015'}: Labor cost ${name} (index ${rowIndex}) — persistence`, async ({ localOfficeSettingsPage, dependencyGate }) => {
      dependencyGate(['TC-LOS-ECT-001']);
      test.setTimeout(90_000);
 // Navigate fresh to ECT for each row (avoid serial contamination)
      await localOfficeSettingsPage.navigateToBasicInfoTab(OFFICE_NO);
      await localOfficeSettingsPage.navigateToEctTab();
 // Defensive read (ECT-009 pattern)
      const currentValue = await localOfficeSettingsPage.getLaborCostValue(rowIndex);
      const testValue = currentValue === LABOR_COST_TEST.currentValue ? LABOR_COST_TEST.testValue : LABOR_COST_TEST.altValue;
      await localOfficeSettingsPage.fillLaborCost(rowIndex, testValue);
      expect(await localOfficeSettingsPage.isEctLaborCostsSaveEnabled()).toBe(true);
      await localOfficeSettingsPage.clickSaveLaborCosts();
 // Navigate away and return
      await localOfficeSettingsPage.clickTab('tabBasicInformation');
      await localOfficeSettingsPage.navigateToEctTab();
      expect(await localOfficeSettingsPage.getLaborCostValue(rowIndex)).toBe(`${testValue}.00`);
 // Restore original
      await localOfficeSettingsPage.fillLaborCost(rowIndex, currentValue.replace('.00', ''));
      await localOfficeSettingsPage.clickSaveLaborCosts();
    });
  }

  test('TC-LOS-ECT-016: Multi-field Fixed Costs — single save persists both BM and HS', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    test.setTimeout(90_000);
    await localOfficeSettingsPage.navigateToBasicInfoTab(OFFICE_NO);
    await localOfficeSettingsPage.navigateToEctTab();
 // Read current values (defensive)
    const currentBM = await localOfficeSettingsPage.getEctFieldValue('txtBenefitsMultiplier');
    const currentHS = await localOfficeSettingsPage.getEctFieldValue('txtHistoricalSubrental');
 // Pick test values different from current
    const bmTest = currentBM.includes(BENEFITS_MULTIPLIER.defaultDisplay) ? BENEFITS_MULTIPLIER.testInput : BENEFITS_MULTIPLIER.restoreValue;
    const hsTest = currentHS.includes(HISTORICAL_SUBRENTAL.defaultDisplay) ? HISTORICAL_SUBRENTAL.testValue : HISTORICAL_SUBRENTAL.restoreValue;
    const bmExpected = currentBM.includes(BENEFITS_MULTIPLIER.defaultDisplay) ? BENEFITS_MULTIPLIER.expectedAfterSave : BENEFITS_MULTIPLIER.defaultDisplay;
    const hsExpected = currentHS.includes(HISTORICAL_SUBRENTAL.defaultDisplay) ? HISTORICAL_SUBRENTAL.expectedAfterSave : HISTORICAL_SUBRENTAL.defaultDisplay;
 // Edit both fields
    await localOfficeSettingsPage.fillAndTab('txtBenefitsMultiplier', bmTest);
    await localOfficeSettingsPage.fillAndTab('txtHistoricalSubrental', hsTest);
 // Single save
    await localOfficeSettingsPage.clickSaveFixedCosts();
 // Full page reload — stronger than tab navigation
    await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
    await localOfficeSettingsPage.navigateToEctTab();
 // Verify both values persisted
    expect(await localOfficeSettingsPage.getEctFieldValue('txtBenefitsMultiplier')).toContain(bmExpected);
    expect(await localOfficeSettingsPage.getEctFieldValue('txtHistoricalSubrental')).toContain(hsExpected);
 // Restore both
    const bmRestore = currentBM.includes(BENEFITS_MULTIPLIER.defaultDisplay) ? BENEFITS_MULTIPLIER.restoreValue : BENEFITS_MULTIPLIER.testInput;
    const hsRestore = currentHS.includes(HISTORICAL_SUBRENTAL.defaultDisplay) ? HISTORICAL_SUBRENTAL.restoreValue : HISTORICAL_SUBRENTAL.testValue;
    await localOfficeSettingsPage.fillAndTab('txtBenefitsMultiplier', bmRestore);
    await localOfficeSettingsPage.fillAndTab('txtHistoricalSubrental', hsRestore);
    await localOfficeSettingsPage.clickSaveFixedCosts();
  });

  test('TC-LOS-ECT-017: Discard unsaved changes — no persistence', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    test.setTimeout(60_000);
    await localOfficeSettingsPage.navigateToBasicInfoTab(OFFICE_NO);
    await localOfficeSettingsPage.navigateToEctTab();
 // Read current BM value (baseline)
    const originalBM = await localOfficeSettingsPage.getEctFieldValue('txtBenefitsMultiplier');
 // Dirty the form
    await localOfficeSettingsPage.fillAndTab('txtBenefitsMultiplier', BENEFITS_MULTIPLIER.altTestValue);
    expect(await localOfficeSettingsPage.isEctFixedCostsSaveEnabled()).toBe(true);
 // Navigate via direct tab click — triggers unsaved changes dialog
    await localOfficeSettingsPage.clickTabDirect('tabBasicInformation');
 // Verify dialog appears (explicit — proves Angular dirty guard fires on ECT tab)
    expect(await localOfficeSettingsPage.isElementVisible('dlgUnsavedLocalOffice')).toBe(true);
    await localOfficeSettingsPage.clickUnsavedDiscard();
    await localOfficeSettingsPage.waitForBasicInfoForm();
 // Return to ECT and verify BM unchanged (edit was discarded)
    await localOfficeSettingsPage.navigateToEctTab();
    expect(await localOfficeSettingsPage.getEctFieldValue('txtBenefitsMultiplier')).toContain(originalBM);
  });

});

