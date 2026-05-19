import { test, expect } from '../../src/infra/fixtures';
import { HISTORY_COMBOBOX } from '../../src/data/testdata/local-office/local-office-history.data';
import { OFFICE_NO } from '../../src/data/testdata/common.data';

test.describe('Local Office Settings — History Tab @locations @local-office-history', () => {

  // Per-test navigation guard (dependency-gate removal Phase 1.5).
  // Mirrors BAS spec :33. Re-navigates only when retry-recycle landed on /home.
  test.beforeEach(async ({ localOfficeSettingsPage }) => {
    const url = localOfficeSettingsPage.getCurrentUrl();
    if (!url.includes('settings/local-office')) {
      await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
      await localOfficeSettingsPage.navigateToHistoryTab();
    }
  });

  test('TC-LOS-HIS-001: History tab — type selector and table visible', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate([]);
    test.setTimeout(60_000);
    await localOfficeSettingsPage.navigateToBasicInfoTab(OFFICE_NO);
    await localOfficeSettingsPage.navigateToHistoryTab();
    expect(await localOfficeSettingsPage.isTabSelected('tabHistory')).toBe(true);
    expect(await localOfficeSettingsPage.isElementVisible('drpHistoryType')).toBe(true);
    expect(await localOfficeSettingsPage.getComboboxValue('drpHistoryType')).toContain(HISTORY_COMBOBOX.default);
    expect(await localOfficeSettingsPage.isElementVisible('tblHistory')).toBe(true);
  });

  test('TC-LOS-HIS-002: History table has column headers', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-HIS-001']);
    const columnCount = await localOfficeSettingsPage.getHistoryColumnHeaderCount();
    expect(columnCount).toBeGreaterThan(0);
  });

 // HIS-003: Office 1604 always has history records — verify table has data (original empty-state test was unreproducible).
  test('TC-LOS-HIS-003: History table has data for office 1604', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-HIS-001']);
    expect(await localOfficeSettingsPage.isHistoryTableEmpty()).toBe(false);
  });

  test('TC-LOS-HIS-004: History type selector — 2 options', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-HIS-001']);
    const options = await localOfficeSettingsPage.getComboboxOptionsList('drpHistoryType');
    expect(options).toHaveLength(2);
    expect(options).toEqual(
      expect.arrayContaining([...HISTORY_COMBOBOX.options]),
    );
  });

  test('TC-LOS-HIS-005: Pagination controls present', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-HIS-001']);
    const navBtnCount = await localOfficeSettingsPage.getHistoryPaginationButtonCount();
    expect(navBtnCount).toBeGreaterThan(0);
  });

  test('TC-LOS-HIS-006: History tab is read-only — no Save, no editable fields', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-HIS-001']);
    expect(await localOfficeSettingsPage.isHistoryTabReadOnly()).toBe(true);
  });

  test('TC-LOS-HIS-007: Sort buttons present', async ({ localOfficeSettingsPage, dependencyGate }) => {
    dependencyGate(['TC-LOS-HIS-001']);
    const sortButtonCount = await localOfficeSettingsPage.getHistorySortButtonCount();
    expect(sortButtonCount).toBeGreaterThan(0);
  });

});
