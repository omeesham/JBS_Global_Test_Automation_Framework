// spec: specs_planning/test-plans/locations/locations_shared_setup_locations_test_plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../setup/fixtures';
import {
  SSL_COLUMN_HEADERS,
  SELF_ROW,
  ADD_LOCATION,
} from '../../test-data/locations/location-shared-setup-locations.data';
import { OFFICE_NO } from '../../test-data/common.data';

test.describe.serial('Location Shared Setup Locations @locations @shared-setup', () => {

  test('TC-LOC-SSL-001: Tab loads with shared-setup table and Add button', async ({ locationSharedSetupLocationsPage: pg }) => {
    test.setTimeout(60_000);
    await pg.navigateToSharedSetupTab(OFFICE_NO);
    // Baseline enforcement: guarantee Shares Inventory is unchecked before all subsequent TCs.
    // Guards against DB state left dirty by a prior aborted run.
    const inventoryState = await pg.getSelfSharesInventoryState();
    if (inventoryState.checked) {
      await pg.toggleSelfSharesInventory();
      await pg.clickSave();
    }
    expect(await pg.isElementVisible('tblSharedSetupLocations')).toBe(true);
    expect(await pg.isElementVisible('btnSharedAdd')).toBe(true);
  });

  test('TC-LOC-SSL-002: Column headers are correct', async ({ locationSharedSetupLocationsPage: pg }) => {
    expect(await pg.getColumnHeaders()).toEqual([...SSL_COLUMN_HEADERS]);
  });

  test('TC-LOC-SSL-003: Self-location row shows correct data and default checkbox states', async ({ locationSharedSetupLocationsPage: pg }) => {
    const text = await pg.getSelfRowText();
    expect(text.localOffice).toBe(SELF_ROW.localOffice);
    expect(text.localOfficeName).toBe(SELF_ROW.localOfficeName);

    const primaryState = await pg.getSelfPrimaryOfficeState();
    expect(primaryState.checked).toBe(true);
    expect(primaryState.disabled).toBe(true);

    const inventoryState = await pg.getSelfSharesInventoryState();
    expect(inventoryState.checked).toBe(false);
    expect(inventoryState.disabled).toBe(false);

    expect(await pg.isSelfDeleteDisabled()).toBe(true);
  });

  test('TC-LOC-SSL-004: Primary Office is read-only (disabled) for self-location', async ({ locationSharedSetupLocationsPage: pg }) => {
    const state = await pg.getSelfPrimaryOfficeState();
    expect(state.disabled).toBe(true);
    // Confirming remains checked -- cannot be unchecked while disabled
    expect(state.checked).toBe(true);
  });

  test('TC-LOC-SSL-005: Delete button is disabled for self-location', async ({ locationSharedSetupLocationsPage: pg }) => {
    expect(await pg.isSelfDeleteDisabled()).toBe(true);
  });

  test('TC-LOC-SSL-006: Toggling Shares Inventory ON enables left-panel Save', async ({ locationSharedSetupLocationsPage: pg }) => {
    expect(await pg.isSaveEnabled()).toBe(false);
    await pg.toggleSelfSharesInventory();
    expect((await pg.getSelfSharesInventoryState()).checked).toBe(true);
    await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    // Cleanup: toggle back -- reverted state clears dirty flag without saving
    await pg.toggleSelfSharesInventory();
  });

  test('TC-LOC-SSL-007: Reverting Shares Inventory to original state disables Save', async ({ locationSharedSetupLocationsPage: pg }) => {
    await pg.toggleSelfSharesInventory();
    await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await pg.toggleSelfSharesInventory();
    await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(false);
  });

  test('TC-LOC-SSL-008: Shares Inventory save persists after reload', async ({ locationSharedSetupLocationsPage: pg }) => {
    test.setTimeout(90_000);
    await pg.toggleSelfSharesInventory();
    await pg.clickSave();
    await pg.reloadPage();
    await pg.navigateToSharedSetupTab(OFFICE_NO);
    expect((await pg.getSelfSharesInventoryState()).checked).toBe(true);
    // Cleanup: restore original unchecked state
    await pg.toggleSelfSharesInventory();
    await pg.clickSave();
  });

  test('TC-LOC-SSL-009: Add button opens Change Local Office dialog', async ({ locationSharedSetupLocationsPage: pg }) => {
    await pg.clickAdd();
    expect(await pg.isAddDialogVisible()).toBe(true);
    expect(await pg.getDialogHeading()).toBe('Change Local Office');
    expect(await pg.isElementVisible('txtDlgSearch')).toBe(true);
    expect(await pg.isElementVisible('tblDlgResults')).toBe(true);
    expect(await pg.isDialogSelectEnabled()).toBe(false);
    expect(await pg.isElementVisible('btnDlgCancel')).toBe(true);
    await pg.clickDialogCancel();
    expect(await pg.isAddDialogVisible()).toBe(false);
  });

  test('TC-LOC-SSL-010: Dialog search filters results by location name', async ({ locationSharedSetupLocationsPage: pg }) => {
    await pg.clickAdd();
    await pg.searchInDialog(ADD_LOCATION.searchByName);
    await expect.poll(() => pg.getDialogRowCount(), { timeout: 5_000 })
      .toBeLessThan(ADD_LOCATION.searchByNameMaxResults);
    await pg.clickDialogCancel();
  });

  test('TC-LOC-SSL-011: Dialog search filters results by location number (exact match)', async ({ locationSharedSetupLocationsPage: pg }) => {
    await pg.clickAdd();
    await pg.searchInDialog(ADD_LOCATION.searchByNumber);
    await expect.poll(() => pg.getDialogRowCount(), { timeout: 5_000 }).toBe(1);
    const row = await pg.getFirstDialogRowText();
    expect(row.localOffice).toBe(ADD_LOCATION.searchByNumber);
    expect(row.localOfficeName).toBe(ADD_LOCATION.expectedName);
    await pg.clickDialogCancel();
  });

  test('TC-LOC-SSL-012: Selecting a dialog row enables the Select button', async ({ locationSharedSetupLocationsPage: pg }) => {
    await pg.clickAdd();
    expect(await pg.isDialogSelectEnabled()).toBe(false);
    await pg.searchInDialog(ADD_LOCATION.searchByNumber);
    await expect.poll(() => pg.getDialogRowCount(), { timeout: 5_000 }).toBe(1);
    await pg.selectFirstDialogRow();
    expect(await pg.isDialogSelectEnabled()).toBe(true);
    await pg.clickDialogCancel();
  });

  test('TC-LOC-SSL-013: Selecting a location via dialog adds it to the table', async ({ locationSharedSetupLocationsPage: pg }) => {
    expect(await pg.getDataRowCount()).toBe(1);
    await pg.clickAdd();
    await pg.searchInDialog(ADD_LOCATION.searchByNumber);
    await expect.poll(() => pg.getDialogRowCount(), { timeout: 5_000 }).toBe(1);
    await pg.selectFirstDialogRow();
    await pg.clickDialogSelect();
    expect(await pg.getDataRowCount()).toBe(2);
    await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
  });

  test('TC-LOC-SSL-014: Non-self row has correct state (Primary Office disabled, Shares Inventory editable)', async ({ locationSharedSetupLocationsPage: pg }) => {
    // Depends on TC-013: 1099 row is in the table (unsaved)
    const state = await pg.getNonSelfRowState(2);
    expect(state.primaryOffice.checked).toBe(false);
    expect(state.primaryOffice.disabled).toBe(true);
    expect(state.sharesInventory.checked).toBe(true);
    expect(state.sharesInventory.disabled).toBe(false);
    expect(state.deleteEnabled).toBe(true);
  });

  test('TC-LOC-SSL-015: Delete removes non-self row instantly with no confirmation dialog', async ({ locationSharedSetupLocationsPage: pg }) => {
    // Depends on TC-013/014: 1099 row at index 2
    expect(await pg.getDataRowCount()).toBe(2);
    await pg.deleteNonSelfRow(2);
    // Row must disappear immediately -- no alertdialog
    expect(await pg.isElementVisible('dlgSaveChanges', 1_500)).toBe(false);
    await expect.poll(() => pg.getDataRowCount(), { timeout: 5_000 }).toBe(1);
    await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true); // dirty from add+delete cycle
    // Cleanup: navigate away to discard and return to clean state
    await pg.discardAndReturn(OFFICE_NO);
  });

  test('TC-LOC-SSL-016: Cancelling the dialog after row selection leaves table and Save unchanged', async ({ locationSharedSetupLocationsPage: pg }) => {
    // After TC-015 discard: only self-row, Save disabled
    expect(await pg.getDataRowCount()).toBe(1);
    expect(await pg.isSaveEnabled()).toBe(false);
    await pg.clickAdd();
    await pg.searchInDialog(ADD_LOCATION.searchByName);
    await expect.poll(() => pg.getDialogRowCount(), { timeout: 5_000 })
      .toBeLessThan(ADD_LOCATION.searchByNameMaxResults);
    await pg.selectFirstDialogRow();
    expect(await pg.isDialogSelectEnabled()).toBe(true);
    await pg.clickDialogCancel();
    expect(await pg.getDataRowCount()).toBe(1);
    await expect.poll(() => pg.isSaveEnabled(), { timeout: 3_000 }).toBe(false);
  });

  test('TC-LOC-SSL-017: Tab uses left-panel Save with dialog (no dedicated in-tab Save button)', async ({ locationSharedSetupLocationsPage: pg }) => {
    test.setTimeout(90_000);
    expect(await pg.hasInTabSaveButton()).toBe(false);
    await pg.toggleSelfSharesInventory();
    expect(await pg.isSaveEnabled()).toBe(true);
    const result = await pg.clickSave();
    expect(result.success).toBe(true);
    // Cleanup: revert Shares Inventory to keep DB in known clean state
    await pg.toggleSelfSharesInventory();
    await pg.clickSave();
  });

});
