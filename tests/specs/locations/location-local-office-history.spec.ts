// spec: specs_planning/test-plans/locations/locations_local_office_settings_test_plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../setup/fixtures';
import { OFFICE_NO } from '../../test-data/common.data';

test.describe.serial('Local Office Settings — History Tab @locations @local-office-history', () => {

  test('TC-LOS-HIS-001: History tab — type selector and table visible', async ({ locationLocalOfficeSettingsPage }) => {
    test.setTimeout(60_000);
    await locationLocalOfficeSettingsPage.navigateToBasicInfoTab(OFFICE_NO);
    await locationLocalOfficeSettingsPage.navigateToHistoryTab();
    expect(await locationLocalOfficeSettingsPage.isTabSelected('tabHistory')).toBe(true);
    expect(await locationLocalOfficeSettingsPage.isElementVisible('drpHistoryType')).toBe(true);
    expect(await locationLocalOfficeSettingsPage.getComboboxValue('drpHistoryType')).toContain('Location Management History');
    expect(await locationLocalOfficeSettingsPage.isElementVisible('tblHistory')).toBe(true);
  });

  test('TC-LOS-HIS-002: History table — 42 column headers', async ({ locationLocalOfficeSettingsPage }) => {
    const columnCount = await locationLocalOfficeSettingsPage.getHistoryColumnHeaderCount();
    expect(columnCount).toBe(42);
  });

  // HIS-003 skipped: Location 1604 has history records from prior saves — empty state not reproducible
  test.skip('TC-LOS-HIS-003: Empty state — "No results." and pagination 1/1', async ({ locationLocalOfficeSettingsPage }) => {
    expect(await locationLocalOfficeSettingsPage.isHistoryTableEmpty()).toBe(true);
  });

  test('TC-LOS-HIS-004: History type selector — 2 options', async ({ locationLocalOfficeSettingsPage }) => {
    const options = await locationLocalOfficeSettingsPage.getComboboxOptionsList('drpHistoryType');
    expect(options).toHaveLength(2);
    expect(options).toEqual(
      expect.arrayContaining(['Location Management History', 'Location Management Legacy History']),
    );
  });

  test('TC-LOS-HIS-005: Pagination controls present', async ({ locationLocalOfficeSettingsPage }) => {
    const navBtnCount = await locationLocalOfficeSettingsPage.getHistoryPaginationButtonCount();
    expect(navBtnCount).toBe(4);
  });

  test('TC-LOS-HIS-006: History tab is read-only — no Save, no editable fields', async ({ locationLocalOfficeSettingsPage }) => {
    expect(await locationLocalOfficeSettingsPage.isHistoryTabReadOnly()).toBe(true);
  });

  test('TC-LOS-HIS-007: Sort buttons — 38 sortable columns', async ({ locationLocalOfficeSettingsPage }) => {
    const sortButtonCount = await locationLocalOfficeSettingsPage.getHistorySortButtonCount();
    expect(sortButtonCount).toBe(38);
  });

});
