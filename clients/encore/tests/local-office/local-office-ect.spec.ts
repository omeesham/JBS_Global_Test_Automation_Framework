import { test, expect } from '../../src/fixtures/pages.fixture';
import { ECT_FIXED_COST_FIELDS } from '../../src/data/local-office/local-office-settings';
import {
  ECT_PAGE,
  ECT_SECTIONS,
  BENEFITS_MULTIPLIER,
  HISTORICAL_SUBRENTAL,
  LABOR_COST_TEST,
  LABOR_COST_RT_ROWS,
} from '../../src/data/local-office/local-office-ect';
import { OFFICE_NO } from '../../src/data/common';

test.describe('Local Office Settings — ECT Settings @local-office-ect', () => {

  // Per-test navigation guard (dependency-gate removal Phase 1.5).
  // When Playwright retries recycle the worker, the fixture's unconditional goto lands
  // on Dashboard/home. Without this guard, the failing test re-runs against /home and
  // every subsequent test in the spec produces a /home cascade. Mirrors BAS spec :33.
  test.beforeEach(async ({ localOfficeEctPage }) => {
    const url = localOfficeEctPage.getCurrentUrl();
    if (!url.includes('settings/local-office')) {
      await localOfficeEctPage.reloadBasicInfo(OFFICE_NO);
      await localOfficeEctPage.navigateToEctTab();
    }
  });

  test('TC-LOS-ECT-001: ECT tab — location name, commission link, currency selector', async ({ localOfficeEctPage, dependencyGate }) => {
    dependencyGate([]);
    test.setTimeout(60_000);
    await localOfficeEctPage.navigateToBasicInfoTab(OFFICE_NO);
    await localOfficeEctPage.navigateToEctTab();
 // Baseline enforcement — reset Benefits Multiplier to 0.2 if dirty from prior run
    const currentBM = await localOfficeEctPage.getEctFieldValue('txtBenefitsMultiplier');
    if (!currentBM.includes(BENEFITS_MULTIPLIER.defaultDisplay)) {
      await localOfficeEctPage.fillAndTab('txtBenefitsMultiplier', BENEFITS_MULTIPLIER.restoreValue);
      await localOfficeEctPage.clickSaveFixedCosts();
      await localOfficeEctPage.reloadBasicInfo(OFFICE_NO);
      await localOfficeEctPage.navigateToEctTab();
    }
    expect(await localOfficeEctPage.isTabSelected('tabEctSettings')).toBe(true);
    expect(await localOfficeEctPage.getTextContent('lblEctLocationName')).toContain(ECT_PAGE.locationDisplay);
    expect(await localOfficeEctPage.isElementVisible('lnkCommissionStructure')).toBe(true);
    expect(await localOfficeEctPage.getComboboxValue('drpCurrency')).toContain(ECT_PAGE.currency);
  });

  test('TC-LOS-ECT-002: Currency selector — contains USD', async ({ localOfficeEctPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    const options = await localOfficeEctPage.getComboboxOptionsList('drpCurrency');
    expect(options.some(o => o.includes(ECT_PAGE.currency))).toBe(true);
  });

  test('TC-LOS-ECT-003: Event Profit Target — label visible, read-only', async ({ localOfficeEctPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    expect(await localOfficeEctPage.getTextContent('lblEventProfitTarget')).toBe(ECT_SECTIONS.eventProfitTarget);
    expect(await localOfficeEctPage.isEventProfitTargetReadOnly()).toBe(true);
  });

  test('TC-LOS-ECT-004: Fixed cost display fields — 7 correct values', async ({ localOfficeEctPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    for (const { key, label, expected } of ECT_FIXED_COST_FIELDS) {
      const actual = await localOfficeEctPage.getEctFieldValue(key);
      expect(actual, label).toContain(expected);
    }
  });

  test('TC-LOS-ECT-005: Benefits Multiplier — edit, save, persist', async ({ localOfficeEctPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    test.setTimeout(60_000);
    expect(await localOfficeEctPage.getEctFieldValue('txtBenefitsMultiplier')).toContain(BENEFITS_MULTIPLIER.defaultDisplay);
    await localOfficeEctPage.fillAndTab('txtBenefitsMultiplier', BENEFITS_MULTIPLIER.testInput);
    expect(await localOfficeEctPage.isEctFixedCostsSaveEnabled()).toBe(true);
    await localOfficeEctPage.clickSaveFixedCosts();
 // Navigate away and return to verify persistence
    await localOfficeEctPage.clickTab('tabBasicInformation');
    await localOfficeEctPage.navigateToEctTab();
    expect(await localOfficeEctPage.getEctFieldValue('txtBenefitsMultiplier')).toContain(BENEFITS_MULTIPLIER.expectedAfterSave);
 // Cleanup
    await localOfficeEctPage.fillAndTab('txtBenefitsMultiplier', BENEFITS_MULTIPLIER.restoreValue);
    await localOfficeEctPage.clickSaveFixedCosts();
  });

  test('TC-LOS-ECT-006: Historical Subrental % — editable', async ({ localOfficeEctPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    test.setTimeout(60_000);
    await localOfficeEctPage.fillAndTab('txtHistoricalSubrental', HISTORICAL_SUBRENTAL.testValue);
    expect(await localOfficeEctPage.isEctFixedCostsSaveEnabled()).toBe(true);
 // Cleanup — full page reload discards unsaved changes and resets Angular dirty state.
 // Cannot save-restore: filling original value (0) makes Save disabled while Angular
 // still tracks intermediate 0.1 as dirty. Tab click would trigger Radix
 // "Unsaved changes" alertdialog that blocks all pointer events on subsequent tests.
 // reloadBasicInfo does safeNavigateTo (handles native beforeunload) + fresh page load.
    await localOfficeEctPage.reloadBasicInfo(OFFICE_NO);
    await localOfficeEctPage.navigateToEctTab();
  });

  test('TC-LOS-ECT-007: Two independent Save buttons', async ({ localOfficeEctPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    test.setTimeout(60_000);
 // Reload ECT tab to reset Angular dirty state from prior test
    await localOfficeEctPage.navigateToBasicInfoTab(OFFICE_NO);
    await localOfficeEctPage.navigateToEctTab();
    expect(await localOfficeEctPage.isEctFixedCostsSaveEnabled()).toBe(false);
    expect(await localOfficeEctPage.isEctLaborCostsSaveEnabled()).toBe(false);
    await localOfficeEctPage.fillAndTab('txtBenefitsMultiplier', BENEFITS_MULTIPLIER.altTestValue);
    expect(await localOfficeEctPage.isEctFixedCostsSaveEnabled()).toBe(true);
    expect(await localOfficeEctPage.isEctLaborCostsSaveEnabled()).toBe(false);
 // Cleanup — reload to discard unsaved changes. Restoring original 0.2 would make Save
 // disabled while Angular still tracks intermediate dirty state, causing "Unsaved changes"
 // dialog on subsequent tab navigation (blocks ECT-009 pointer events).
    await localOfficeEctPage.reloadBasicInfo(OFFICE_NO);
    await localOfficeEctPage.navigateToEctTab();
  });

  test('TC-LOS-ECT-008: Labor Cost Assumptions — class read-only, cost editable', async ({ localOfficeEctPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    expect(await localOfficeEctPage.getTextContent('lblLaborCostAssumptions')).toBe(ECT_SECTIONS.laborCostAssumptions);
    expect(await localOfficeEctPage.getFirstLaborClassName()).toBe(LABOR_COST_TEST.firstClass);
    expect(await localOfficeEctPage.getLastLaborClassName()).toBe(LABOR_COST_TEST.lastClass);
    expect(await localOfficeEctPage.isLaborClassReadOnly()).toBe(true);
    expect(await localOfficeEctPage.isLaborCostEditable()).toBe(true);
  });

  test('TC-LOS-ECT-009: Labor cost — edit, save, persist', async ({ localOfficeEctPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    test.setTimeout(90_000);
 // Navigate via URL (not reload) to avoid "No currencies" API cache miss.
 // ECT-008 is read-only so no dirty state to discard — clean navigation suffices.
    await localOfficeEctPage.navigateToBasicInfoTab(OFFICE_NO);
    await localOfficeEctPage.navigateToEctTab();
 // Read current server value and pick a different test value to guarantee dirty state
    const currentValue = await localOfficeEctPage.getLaborCostValue(0);
    const testValue = currentValue === LABOR_COST_TEST.currentValue ? LABOR_COST_TEST.testValue : LABOR_COST_TEST.altValue;
    await localOfficeEctPage.fillLaborCost(0, testValue);
    expect(await localOfficeEctPage.isEctLaborCostsSaveEnabled()).toBe(true);
    await localOfficeEctPage.clickSaveLaborCosts();
 // Navigate away and return
    await localOfficeEctPage.clickTab('tabBasicInformation');
    await localOfficeEctPage.navigateToEctTab();
    expect(await localOfficeEctPage.getLaborCostValue(0)).toBe(`${testValue}.00`);
 // Cleanup — restore original
    await localOfficeEctPage.fillLaborCost(0, currentValue.replace('.00', ''));
    await localOfficeEctPage.clickSaveLaborCosts();
  });

  test('TC-LOS-ECT-010: Labor cost — non-numeric reverts silently', async ({ localOfficeEctPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    const original = await localOfficeEctPage.getLaborCostValue(0);
    await localOfficeEctPage.fillLaborCost(0, LABOR_COST_TEST.invalidInput);
    const afterBlur = await localOfficeEctPage.getLaborCostValue(0);
    expect(afterBlur).toBe(original);
  });

  test('TC-LOS-ECT-011: SubRental Matrix — label visible, read-only', async ({ localOfficeEctPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    expect(await localOfficeEctPage.getTextContent('lblSubRentalMatrix')).toBe(ECT_SECTIONS.subRentalMatrix);
    expect(await localOfficeEctPage.isSubRentalReadOnly()).toBe(true);
  });

  test('TC-LOS-ECT-012: ECT Save — no confirmation dialog, no unsaved dialog after', async ({ localOfficeEctPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    test.setTimeout(60_000);
    await localOfficeEctPage.fillAndTab('txtBenefitsMultiplier', BENEFITS_MULTIPLIER.altTestValue);
    await localOfficeEctPage.clickSaveFixedCosts();
 // Navigate to another tab — should NOT trigger unsaved changes dialog
    await localOfficeEctPage.clickTab('tabBasicInformation');
    await localOfficeEctPage.waitForBasicInfoForm();
    expect(await localOfficeEctPage.isTabSelected('tabBasicInformation')).toBe(true);
 // Cleanup: return to ECT and restore
    await localOfficeEctPage.navigateToEctTab();
    await localOfficeEctPage.fillAndTab('txtBenefitsMultiplier', BENEFITS_MULTIPLIER.restoreValue);
    await localOfficeEctPage.clickSaveFixedCosts();
  });

  test('TC-LOS-ECT-013: Historical Subrental % — edit, save, persist', async ({ localOfficeEctPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    test.setTimeout(60_000);
 // Defensive read — don't assume default
    const currentHS = await localOfficeEctPage.getEctFieldValue('txtHistoricalSubrental');
    const testValue = currentHS.includes(HISTORICAL_SUBRENTAL.defaultDisplay) ? HISTORICAL_SUBRENTAL.testValue : HISTORICAL_SUBRENTAL.restoreValue;
    const expectedDisplay = currentHS.includes(HISTORICAL_SUBRENTAL.defaultDisplay) ? HISTORICAL_SUBRENTAL.expectedAfterSave : HISTORICAL_SUBRENTAL.defaultDisplay;
    await localOfficeEctPage.fillAndTab('txtHistoricalSubrental', testValue);
    expect(await localOfficeEctPage.isEctFixedCostsSaveEnabled()).toBe(true);
    await localOfficeEctPage.clickSaveFixedCosts();
 // Navigate away and return to verify persistence
    await localOfficeEctPage.clickTab('tabBasicInformation');
    await localOfficeEctPage.navigateToEctTab();
    expect(await localOfficeEctPage.getEctFieldValue('txtHistoricalSubrental')).toContain(expectedDisplay);
 // Restore original value
    const restoreRaw = currentHS.includes(HISTORICAL_SUBRENTAL.defaultDisplay) ? HISTORICAL_SUBRENTAL.restoreValue : HISTORICAL_SUBRENTAL.testValue;
    await localOfficeEctPage.fillAndTab('txtHistoricalSubrental', restoreRaw);
    await localOfficeEctPage.clickSaveFixedCosts();
  });

  for (const { rowIndex, name } of LABOR_COST_RT_ROWS) {
    test(`TC-LOS-ECT-${rowIndex === 33 ? '014' : '015'}: Labor cost ${name} (index ${rowIndex}) — persistence`, async ({ localOfficeEctPage, dependencyGate }) => {
      dependencyGate(['TC-LOS-ECT-001']);
      test.setTimeout(90_000);
 // Navigate fresh to ECT for each row (avoid serial contamination)
      await localOfficeEctPage.navigateToBasicInfoTab(OFFICE_NO);
      await localOfficeEctPage.navigateToEctTab();
 // Defensive read (ECT-009 pattern)
      const currentValue = await localOfficeEctPage.getLaborCostValue(rowIndex);
      const testValue = currentValue === LABOR_COST_TEST.currentValue ? LABOR_COST_TEST.testValue : LABOR_COST_TEST.altValue;
      await localOfficeEctPage.fillLaborCost(rowIndex, testValue);
      expect(await localOfficeEctPage.isEctLaborCostsSaveEnabled()).toBe(true);
      await localOfficeEctPage.clickSaveLaborCosts();
 // Navigate away and return
      await localOfficeEctPage.clickTab('tabBasicInformation');
      await localOfficeEctPage.navigateToEctTab();
      expect(await localOfficeEctPage.getLaborCostValue(rowIndex)).toBe(`${testValue}.00`);
 // Restore original
      await localOfficeEctPage.fillLaborCost(rowIndex, currentValue.replace('.00', ''));
      await localOfficeEctPage.clickSaveLaborCosts();
    });
  }

  test('TC-LOS-ECT-016: Multi-field Fixed Costs — single save persists both BM and HS', async ({ localOfficeEctPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    test.setTimeout(90_000);
    await localOfficeEctPage.navigateToBasicInfoTab(OFFICE_NO);
    await localOfficeEctPage.navigateToEctTab();
 // Read current values (defensive)
    const currentBM = await localOfficeEctPage.getEctFieldValue('txtBenefitsMultiplier');
    const currentHS = await localOfficeEctPage.getEctFieldValue('txtHistoricalSubrental');
 // Pick test values different from current
    const bmTest = currentBM.includes(BENEFITS_MULTIPLIER.defaultDisplay) ? BENEFITS_MULTIPLIER.testInput : BENEFITS_MULTIPLIER.restoreValue;
    const hsTest = currentHS.includes(HISTORICAL_SUBRENTAL.defaultDisplay) ? HISTORICAL_SUBRENTAL.testValue : HISTORICAL_SUBRENTAL.restoreValue;
    const bmExpected = currentBM.includes(BENEFITS_MULTIPLIER.defaultDisplay) ? BENEFITS_MULTIPLIER.expectedAfterSave : BENEFITS_MULTIPLIER.defaultDisplay;
    const hsExpected = currentHS.includes(HISTORICAL_SUBRENTAL.defaultDisplay) ? HISTORICAL_SUBRENTAL.expectedAfterSave : HISTORICAL_SUBRENTAL.defaultDisplay;
 // Edit both fields
    await localOfficeEctPage.fillAndTab('txtBenefitsMultiplier', bmTest);
    await localOfficeEctPage.fillAndTab('txtHistoricalSubrental', hsTest);
 // Single save
    await localOfficeEctPage.clickSaveFixedCosts();
 // Full page reload — stronger than tab navigation
    await localOfficeEctPage.reloadBasicInfo(OFFICE_NO);
    await localOfficeEctPage.navigateToEctTab();
 // Verify both values persisted
    expect(await localOfficeEctPage.getEctFieldValue('txtBenefitsMultiplier')).toContain(bmExpected);
    expect(await localOfficeEctPage.getEctFieldValue('txtHistoricalSubrental')).toContain(hsExpected);
 // Restore both
    const bmRestore = currentBM.includes(BENEFITS_MULTIPLIER.defaultDisplay) ? BENEFITS_MULTIPLIER.restoreValue : BENEFITS_MULTIPLIER.testInput;
    const hsRestore = currentHS.includes(HISTORICAL_SUBRENTAL.defaultDisplay) ? HISTORICAL_SUBRENTAL.restoreValue : HISTORICAL_SUBRENTAL.testValue;
    await localOfficeEctPage.fillAndTab('txtBenefitsMultiplier', bmRestore);
    await localOfficeEctPage.fillAndTab('txtHistoricalSubrental', hsRestore);
    await localOfficeEctPage.clickSaveFixedCosts();
  });

  test('TC-LOS-ECT-017: Discard unsaved changes — no persistence', async ({ localOfficeEctPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-ECT-001']);
    test.setTimeout(60_000);
    await localOfficeEctPage.navigateToBasicInfoTab(OFFICE_NO);
    await localOfficeEctPage.navigateToEctTab();
 // Read current BM value (baseline)
    const originalBM = await localOfficeEctPage.getEctFieldValue('txtBenefitsMultiplier');
 // Dirty the form
    await localOfficeEctPage.fillAndTab('txtBenefitsMultiplier', BENEFITS_MULTIPLIER.altTestValue);
    expect(await localOfficeEctPage.isEctFixedCostsSaveEnabled()).toBe(true);
 // Navigate via direct tab click — triggers unsaved changes dialog
    await localOfficeEctPage.clickTabDirect('tabBasicInformation');
 // Verify dialog appears (explicit — proves Angular dirty guard fires on ECT tab)
    expect(await localOfficeEctPage.isElementVisible('dlgUnsavedLocalOffice')).toBe(true);
    await localOfficeEctPage.clickUnsavedDiscard();
    await localOfficeEctPage.waitForBasicInfoForm();
 // Return to ECT and verify BM unchanged (edit was discarded)
    await localOfficeEctPage.navigateToEctTab();
    expect(await localOfficeEctPage.getEctFieldValue('txtBenefitsMultiplier')).toContain(originalBM);
  });

});

