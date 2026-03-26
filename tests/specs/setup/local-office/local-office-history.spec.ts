// spec: specs_planning/test-plans/locations/locations_local_office_settings_test_plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../../setup/fixtures';
import { OFFICE_NO } from '../../../test-data/common.data';

test.describe.serial('Local Office Settings — History Tab @locations @local-office-history', () => {

  test('TC-LOS-HIS-001: History tab — type selector and table visible', async ({ localOfficeSettingsPage }) => {
    test.setTimeout(60_000);
    await localOfficeSettingsPage.navigateToBasicInfoTab(OFFICE_NO);
    await localOfficeSettingsPage.navigateToHistoryTab();
    expect(await localOfficeSettingsPage.isTabSelected('tabHistory')).toBe(true);
    expect(await localOfficeSettingsPage.isElementVisible('drpHistoryType')).toBe(true);
    expect(await localOfficeSettingsPage.getComboboxValue('drpHistoryType')).toContain('Location Management History');
    expect(await localOfficeSettingsPage.isElementVisible('tblHistory')).toBe(true);
  });

  test('TC-LOS-HIS-002: History table — 42 column headers', async ({ localOfficeSettingsPage }) => {
    const columnCount = await localOfficeSettingsPage.getHistoryColumnHeaderCount();
    expect(columnCount).toBe(42);
  });

  // HIS-003 skipped: Location 1604 has history records from prior saves — empty state not reproducible
  test.skip('TC-LOS-HIS-003: Empty state — "No results." and pagination 1/1', async ({ localOfficeSettingsPage }) => {
    expect(await localOfficeSettingsPage.isHistoryTableEmpty()).toBe(true);
  });

  test('TC-LOS-HIS-004: History type selector — 2 options', async ({ localOfficeSettingsPage }) => {
    const options = await localOfficeSettingsPage.getComboboxOptionsList('drpHistoryType');
    expect(options).toHaveLength(2);
    expect(options).toEqual(
      expect.arrayContaining(['Location Management History', 'Location Management Legacy History']),
    );
  });

  test('TC-LOS-HIS-005: Pagination controls present', async ({ localOfficeSettingsPage }) => {
    const navBtnCount = await localOfficeSettingsPage.getHistoryPaginationButtonCount();
    expect(navBtnCount).toBe(4);
  });

  test('TC-LOS-HIS-006: History tab is read-only — no Save, no editable fields', async ({ localOfficeSettingsPage }) => {
    expect(await localOfficeSettingsPage.isHistoryTabReadOnly()).toBe(true);
  });

  test('TC-LOS-HIS-007: Sort buttons — 38 sortable columns', async ({ localOfficeSettingsPage }) => {
    const sortButtonCount = await localOfficeSettingsPage.getHistorySortButtonCount();
    expect(sortButtonCount).toBe(38);
  });

});
