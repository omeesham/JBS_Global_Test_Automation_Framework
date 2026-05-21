import { test, expect } from '../../src/infra/fixtures';
import {
  SSL_COLUMN_HEADERS,
  SELF_ROW,
  ADD_LOCATION,
  SSL_DIALOG_HEADING,
} from '../../src/data/testdata/locations/location-shared-setup-locations.data';
import { OFFICE_NO } from '../../src/data/testdata/common.data';

test.describe('Location Shared Setup Locations @locations @shared-setup', () => {

  // Per-test navigation guard (D-2 lifecycle refactor 2026-05-21).
  // DOM-presence beats url.includes (shared `settings/location` URL across sub-tabs).
  test.beforeEach(async ({ locationSharedSetupLocationsPage: pg }) => {
    if (!(await pg.isOnSharedSetupTab())) {
      await pg.navigateToSharedSetupTab(OFFICE_NO);
    }
  });

  test('TC-LOC-SSL-001: Tab loads with shared-setup table and Add button', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate([]);
    test.setTimeout(60_000);
    await pg.navigateToSharedSetupTab(OFFICE_NO);
 // Baseline enforcement — clean up any extra rows and reset SI.
    await pg.ensureCleanSSLTable(OFFICE_NO);
    expect(await pg.isElementVisible('tblSharedSetupLocations')).toBe(true);
    expect(await pg.isElementVisible('btnSharedAdd')).toBe(true);
  });

  test('TC-LOC-SSL-002: Column headers are correct', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
    expect(await pg.getColumnHeaders()).toEqual([...SSL_COLUMN_HEADERS]);
  });

  test('TC-LOC-SSL-003: Self-location row shows correct data and default checkbox states', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
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

  test('TC-LOC-SSL-004: Primary Office is read-only (disabled) for self-location', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
    const state = await pg.getSelfPrimaryOfficeState();
    expect(state.disabled).toBe(true);
 // Confirming remains checked -- cannot be unchecked while disabled
    expect(state.checked).toBe(true);
  });

  test('TC-LOC-SSL-005: Delete button is disabled for self-location', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
    expect(await pg.isSelfDeleteDisabled()).toBe(true);
  });

  test('TC-LOC-SSL-006: Toggling Shares Inventory ON enables left-panel Save', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
    expect(await pg.isSaveEnabled()).toBe(false);
    await pg.toggleSelfSharesInventory();
    expect((await pg.getSelfSharesInventoryState()).checked).toBe(true);
    await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
 // Cleanup: toggle back -- reverted state clears dirty flag without saving
    await pg.toggleSelfSharesInventory();
  });

  test('TC-LOC-SSL-007: Reverting Shares Inventory to original state disables Save', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    test.fixme(true, 'Blocked by app bug: Shares Inventory net-zero revert on added rows leaves FormControl.dirty set; Save stays enabled despite zero net change. Companion to the random-Delete-non-clickable bug. Pending Encore fix.');
    dependencyGate(['TC-LOC-SSL-001']);
 // SSL-006 toggle-back leaves Angular dirty state. Reload for clean baseline.
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(false);
    await pg.toggleSelfSharesInventory();
    await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await pg.toggleSelfSharesInventory();
    await expect.poll(() => pg.isSaveEnabled(), { timeout: 8_000 }).toBe(false);
  });

  test('TC-LOC-SSL-008: Shares Inventory save persists after reload', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
    test.setTimeout(90_000);
    await pg.toggleSelfSharesInventory();
    await pg.clickSave();
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    expect((await pg.getSelfSharesInventoryState()).checked).toBe(true);
 // Cleanup: restore original unchecked state
    await pg.toggleSelfSharesInventory();
    await pg.clickSave();
  });

  test('TC-LOC-SSL-009: Add button opens Change Local Office dialog', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
    await pg.clickAdd();
    expect(await pg.isAddDialogVisible()).toBe(true);
    expect(await pg.getDialogHeading()).toBe(SSL_DIALOG_HEADING);
    expect(await pg.isElementVisible('txtDlgSearch')).toBe(true);
    expect(await pg.isElementVisible('tblDlgResults')).toBe(true);
    expect(await pg.isDialogSelectEnabled()).toBe(false);
    expect(await pg.isElementVisible('btnDlgCancel')).toBe(true);
    await pg.clickDialogCancel();
    expect(await pg.isAddDialogVisible()).toBe(false);
  });

  test('TC-LOC-SSL-010: Dialog search filters results by location name', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
    await pg.clickAdd();
    await pg.searchInDialog(ADD_LOCATION.searchByName);
    await expect.poll(() => pg.getDialogRowCount(), { timeout: 5_000 })
      .toBeLessThan(ADD_LOCATION.searchByNameMaxResults);
    await pg.clickDialogCancel();
  });

  test('TC-LOC-SSL-011: Dialog search filters results by location number (exact match)', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
    await pg.clickAdd();
    await pg.searchInDialog(ADD_LOCATION.searchByNumber);
    await expect.poll(() => pg.getDialogRowCount(), { timeout: 5_000 }).toBe(1);
    const row = await pg.getFirstDialogRowText();
    expect(row.localOffice).toBe(ADD_LOCATION.searchByNumber);
    expect(row.localOfficeName).toBe(ADD_LOCATION.expectedName);
    await pg.clickDialogCancel();
  });

  test('TC-LOC-SSL-012: Selecting a dialog row enables the Select button', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
    await pg.clickAdd();
    expect(await pg.isDialogSelectEnabled()).toBe(false);
    await pg.searchInDialog(ADD_LOCATION.searchByNumber);
    await expect.poll(() => pg.getDialogRowCount(), { timeout: 5_000 }).toBe(1);
    await pg.selectFirstDialogRow();
 // RCA SSL-012: dispatchEvent('click') fires async React state update —
 // Select button enable propagates after a short delay. Use expect.poll.
    await expect.poll(() => pg.isDialogSelectEnabled(), { timeout: 5_000 }).toBe(true);
    await pg.clickDialogCancel();
  });

  test('TC-LOC-SSL-013: Selecting a location via dialog adds it to the table', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
    expect(await pg.getDataRowCount()).toBe(1);
    await pg.clickAdd();
    await pg.searchInDialog(ADD_LOCATION.searchByNumber);
    await expect.poll(() => pg.getDialogRowCount(), { timeout: 5_000 }).toBe(1);
    await pg.selectFirstDialogRow();
    await pg.clickDialogSelect();
    expect(await pg.getDataRowCount()).toBe(2);
    await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
  });

  test('TC-LOC-SSL-014: Non-self row has correct state (Primary Office disabled, Shares Inventory editable)', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
 // Depends on TC-013: 1099 row is in the table (unsaved)
    const state = await pg.getNonSelfRowState(2);
    expect(state.primaryOffice.checked).toBe(false);
    expect(state.primaryOffice.disabled).toBe(true);
    expect(state.sharesInventory.checked).toBe(true);
    expect(state.sharesInventory.disabled).toBe(false);
    expect(state.deleteEnabled).toBe(true);
  });

  test('TC-LOC-SSL-015: Delete removes non-self row instantly with no confirmation dialog', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
 // Depends on TC-013/014: 1099 row at index 2
    expect(await pg.getDataRowCount()).toBe(2);
    await pg.deleteNonSelfRow(2);
 // Row must disappear immediately -- no alertdialog
    expect(await pg.isElementVisible('dlgSaveChanges', 1_500)).toBe(false);
    await expect.poll(() => pg.getDataRowCount(), { timeout: 5_000 }).toBe(1);
    await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true); // dirty from add+delete cycle
 // Cleanup: hard reload — discardAndReturn left the Angular SPA in a broken serial
 // state where the next test's clickAdd opened the wrong dialog.
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
  });

  test('TC-LOC-SSL-016: Cancelling the dialog after row selection leaves table and Save unchanged', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
    test.setTimeout(60_000);
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    await pg.ensureCleanSSLTable(OFFICE_NO);
 // Baseline: capture pre-dialog table state + Save state
    const beforeRowCount = await pg.getDataRowCount();
    const beforeSaveEnabled = await pg.isSaveEnabled();
    expect(beforeSaveEnabled).toBe(false);
 // Open Add dialog, search, select first row (DO NOT click Select — that would commit)
    await pg.clickAdd();
    await pg.searchInDialog(ADD_LOCATION.searchByName);
    await expect.poll(() => pg.getDialogRowCount(), { timeout: 8_000 })
      .toBeLessThan(ADD_LOCATION.searchByNameMaxResults);
    await pg.selectFirstDialogRow();
    await expect.poll(() => pg.isDialogSelectEnabled(), { timeout: 5_000 }).toBe(true);
 // Cancel the dialog instead of selecting
    await pg.clickDialogCancel();
 // Verify table row count unchanged + Save still disabled (cancel = no-op)
    expect(await pg.getDataRowCount()).toBe(beforeRowCount);
    expect(await pg.isSaveEnabled()).toBe(false);
  });

  test('TC-LOC-SSL-017: Tab uses left-panel Save with dialog (no dedicated in-tab Save button)', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
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

  test('TC-LOC-SSL-018: Add location via dialog -> save -> reload -> row persists', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
    test.setTimeout(90_000);
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    await pg.ensureCleanSSLTable(OFFICE_NO);
    await pg.clickAdd();
    await pg.searchInDialog('Chicago');
    await expect.poll(() => pg.getDialogRowCount(), { timeout: 8_000 })
      .toBeLessThan(ADD_LOCATION.searchByNameMaxResults);
    await pg.selectFirstDialogRow();
    await expect.poll(() => pg.isDialogSelectEnabled(), { timeout: 5_000 }).toBe(true);
    await pg.clickDialogSelect();
    expect(await pg.getDataRowCount()).toBe(2);
 // Capture added row from TABLE (not dialog — dialog text timing is unreliable)
    const added = await pg.findNonSelfRow();
    expect(added).not.toBeNull();
 // Save
    const result = await pg.clickSave();
    expect(result.success).toBe(true);
 // Reload and verify
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    expect(await pg.getDataRowCount()).toBe(2);
    const persisted = await pg.findNonSelfRow();
    expect(persisted).not.toBeNull();
    expect(persisted!.localOffice).toBe(added!.localOffice);
    expect(persisted!.localOfficeName).toBe(added!.localOfficeName);
 // Cleanup: delete + save (use dynamic index)
    await pg.deleteNonSelfRow(persisted!.index);
    const cleanup = await pg.clickSave();
    expect(cleanup.success).toBe(true);
  });

  test('TC-LOC-SSL-019: Non-self Shares Inventory toggle -> save -> reload -> persisted', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
    test.setTimeout(90_000);
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    await pg.ensureCleanSSLTable(OFFICE_NO);
 // Setup: add first available location and save
    await pg.clickAdd();
    await pg.searchInDialog(ADD_LOCATION.searchByName);
    await expect.poll(() => pg.getDialogRowCount(), { timeout: 8_000 })
      .toBeLessThan(ADD_LOCATION.searchByNameMaxResults);
    await pg.selectFirstDialogRow();
    await expect.poll(() => pg.isDialogSelectEnabled(), { timeout: 5_000 }).toBe(true);
    await pg.clickDialogSelect();
    const addSave = await pg.clickSave();
    expect(addSave.success).toBe(true);
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
 // Find the non-self row (sort order varies)
    const nsRow = await pg.findNonSelfRow();
    expect(nsRow).not.toBeNull();
 // Default: SI is checked for non-self rows. Toggle OFF.
    expect((await pg.getNonSelfRowState(nsRow!.index)).sharesInventory.checked).toBe(true);
    await pg.toggleNonSelfSharesInventory(nsRow!.index);
    await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    const result = await pg.clickSave();
    expect(result.success).toBe(true);
 // Reload and verify SI is OFF
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    const nsRow2 = await pg.findNonSelfRow();
    expect((await pg.getNonSelfRowState(nsRow2!.index)).sharesInventory.checked).toBe(false);
 // Cleanup: delete row + save
    await pg.deleteNonSelfRow(nsRow2!.index);
    const cleanup = await pg.clickSave();
    expect(cleanup.success).toBe(true);
  });

  test('TC-LOC-SSL-020: Delete location -> save -> reload -> row removed', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
    test.setTimeout(90_000);
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    await pg.ensureCleanSSLTable(OFFICE_NO);
    await pg.clickAdd();
    await pg.searchInDialog('Dallas');
    await expect.poll(() => pg.getDialogRowCount(), { timeout: 8_000 })
      .toBeLessThan(ADD_LOCATION.searchByNameMaxResults);
    await pg.selectFirstDialogRow();
    await expect.poll(() => pg.isDialogSelectEnabled(), { timeout: 5_000 }).toBe(true);
    await pg.clickDialogSelect();
    const addSave = await pg.clickSave();
    expect(addSave.success).toBe(true);
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    expect(await pg.getDataRowCount()).toBe(2);
 // Delete non-self row and save (use dynamic index — sort order varies)
    const nsRow = await pg.findNonSelfRow();
    await pg.deleteNonSelfRow(nsRow!.index);
    await expect.poll(() => pg.getDataRowCount(), { timeout: 5_000 }).toBe(1);
    const result = await pg.clickSave();
    expect(result.success).toBe(true);
 // Reload and verify row is gone
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    expect(await pg.getDataRowCount()).toBe(1);
  });

  test('TC-LOC-SSL-021: Combined self SI + add location -> save -> reload -> both persisted', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
    test.setTimeout(90_000);
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    await pg.ensureCleanSSLTable(OFFICE_NO);
    await pg.toggleSelfSharesInventory();
    await pg.clickAdd();
    await pg.searchInDialog('Denver');
    await expect.poll(() => pg.getDialogRowCount(), { timeout: 8_000 })
      .toBeLessThan(ADD_LOCATION.searchByNameMaxResults);
    await pg.selectFirstDialogRow();
    await expect.poll(() => pg.isDialogSelectEnabled(), { timeout: 5_000 }).toBe(true);
    await pg.clickDialogSelect();
    await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    const result = await pg.clickSave();
    expect(result.success).toBe(true);
 // Reload and verify both changes persisted
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    expect((await pg.getSelfSharesInventoryState()).checked).toBe(true);
    expect(await pg.getDataRowCount()).toBe(2);
 // Cleanup (per use try/finally for combined dirty state)
    try {
      await pg.setSelfSharesInventory(false);
      const nsRow = await pg.findNonSelfRow();
      if (nsRow) await pg.deleteNonSelfRow(nsRow.index);
      await pg.clickSave();
    } catch {
      await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
      await pg.ensureCleanSSLTable(OFFICE_NO);
    }
  });

  test('TC-LOC-SSL-022: Cancel Save dialog -> changes not persisted after reload', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
    test.setTimeout(90_000);
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    await pg.ensureCleanSSLTable(OFFICE_NO);
 // Make a change
    await pg.toggleSelfSharesInventory();
    expect((await pg.getSelfSharesInventoryState()).checked).toBe(true);
    await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
 // Open Save dialog and cancel it
    await pg.openSaveDialog();
    await pg.cancelSaveDialog();
 // Form still dirty after cancel
    await expect.poll(() => pg.isSaveEnabled(), { timeout: 3_000 }).toBe(true);
 // Reload without saving — change should NOT persist
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    expect((await pg.getSelfSharesInventoryState()).checked).toBe(false);
  });

  test('TC-LOC-SSL-023: Beforeunload fires when SSL form is dirty', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
    test.setTimeout(90_000);
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    await pg.ensureCleanSSLTable(OFFICE_NO);
 // Make form dirty
    await pg.toggleSelfSharesInventory();
    await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
 // Trigger reload — beforeunload should fire and be dismissed (stay on page)
    const fired = await pg.triggerBeforeunloadAndStay();
    expect(fired).toBe(true);
 // Cleanup: navigate away to discard
    await pg.discardAndReturn(OFFICE_NO);
  });

  test('TC-LOC-SSL-024: Already-added location is absent from Change Local Office dialog', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
    test.setTimeout(90_000);
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    await pg.ensureCleanSSLTable(OFFICE_NO);
    await pg.clickAdd();
    await pg.searchInDialog('Atlanta');
    await expect.poll(() => pg.getDialogRowCount(), { timeout: 8_000 })
      .toBeLessThan(ADD_LOCATION.searchByNameMaxResults);
    await pg.selectFirstDialogRow();
    await expect.poll(() => pg.isDialogSelectEnabled(), { timeout: 5_000 }).toBe(true);
    await pg.clickDialogSelect();
    const result = await pg.clickSave();
    expect(result.success).toBe(true);
 // Read the added location from the TABLE (reliable, not dialog)
    const added = await pg.findNonSelfRow();
    expect(added).not.toBeNull();
 // Test: open dialog, search for the same location number — must not appear
    await pg.clickAdd();
    await pg.searchInDialog(added!.localOffice);
 // Wait for debounce — "No results." row shows (count stays 1 but localOffice is empty)
    await expect.poll(() => pg.getDialogRowCount(), { timeout: 8_000 }).toBe(1);
    const row = await pg.getFirstDialogRowText();
    expect(row.localOffice).not.toBe(added!.localOffice);
    await pg.clickDialogCancel();
 // Cleanup: delete + save (use dynamic index)
    await pg.deleteNonSelfRow(added!.index);
    const cleanup = await pg.clickSave();
    expect(cleanup.success).toBe(true);
  });

  test('TC-LOC-SSL-025: Each column header testid resolves to expected text', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
 // Complements TC-002 (whole-array content check) with per-testid resolution.
    expect(await pg.isElementVisible('colHeaderLocalOffice')).toBe(true);
    expect(await pg.isElementVisible('colHeaderLocalOfficeName')).toBe(true);
    expect(await pg.isElementVisible('colHeaderPrimaryOffice')).toBe(true);
    expect(await pg.isElementVisible('colHeaderSharesInventory')).toBe(true);
    expect(await pg.isElementVisible('colHeaderActions')).toBe(true);
  });

  test('TC-LOC-SSL-026: Dialog number-search "1233" returns exactly the Miami Marriott office', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    test.fixme(true, 'Blocked by app bug: Miami-region offices excluded from /api/location/location-lookup visibility filter; search "1233" returns phantom row with empty localOffice cell. Pending Encore fix.');
    dependencyGate(['TC-LOC-SSL-001']);
    test.setTimeout(60_000);
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    await pg.ensureCleanSSLTable(OFFICE_NO);
    await pg.clickAdd();
    await pg.searchInDialog('1233');
    await expect.poll(() => pg.getDialogRowCount(), { timeout: 8_000 }).toBe(1);
    const row = await pg.getFirstDialogRowText();
    expect(row.localOffice).toBe('1233');
    expect(row.localOfficeName).toContain('Miami Marriott');
    await pg.clickDialogCancel();
  });

  test('TC-LOC-SSL-027: Combined self SI + add non-Miami row + save persists both after reload', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
 // Cross-field save coverage: self SI ON + add non-Miami row (Chicago).
    test.setTimeout(120_000);
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    await pg.ensureCleanSSLTable(OFFICE_NO);
 // Combined change: toggle self SI + add non-Miami row via dialog
    await pg.toggleSelfSharesInventory();
    await pg.clickAdd();
    await pg.searchInDialog('Chicago');
    await expect.poll(() => pg.getDialogRowCount(), { timeout: 8_000 })
      .toBeLessThan(ADD_LOCATION.searchByNameMaxResults);
    await pg.selectFirstDialogRow();
    await expect.poll(() => pg.isDialogSelectEnabled(), { timeout: 5_000 }).toBe(true);
    await pg.clickDialogSelect();
    await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    const result = await pg.clickSave();
    expect(result.success).toBe(true);
 // Reload and verify both changes persisted
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    expect((await pg.getSelfSharesInventoryState()).checked).toBe(true);
    expect(await pg.getDataRowCount()).toBe(2);
 // Cleanup: try/finally for combined dirty state (mirrors TC-021)
    try {
      await pg.setSelfSharesInventory(false);
      const nsRow = await pg.findNonSelfRow();
      if (nsRow) await pg.deleteNonSelfRow(nsRow.index);
      await pg.clickSave();
    } catch {
      await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
      await pg.ensureCleanSSLTable(OFFICE_NO);
    }
  });

  test('TC-LOC-SSL-028: Top-tab switch with dirty form shows Unsaved Changes dialog; Stay preserves state', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
    test.setTimeout(60_000);
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    await pg.ensureCleanSSLTable(OFFICE_NO);
    await pg.makeFormDirty();
    await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await pg.clickTopLevelTab('tabLocationManagementHistory');
    expect(await pg.hasVisibleUnsavedDialog(5_000)).toBe(true);
    await pg.clickUnsavedDialogStay();
    await expect.poll(() => pg.getActiveTopLevelTab(), { timeout: 5_000 })
      .toContain('Basic Information');
    expect(await pg.isSaveEnabled()).toBe(true);
    await pg.discardAndReturn(OFFICE_NO);
  });

  test('TC-LOC-SSL-029: Five rapid Add-button clicks open exactly one dialog', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
 // App-level guard: modal-state blocks repeat invocation while dialog is open.
 // Load-bearing assertion is dialog-count == 1. Console listener kept for trace visibility
 // (not asserted — ambient Angular noise like NG0100 / ResizeObserver loop makes strict
 // empty-array assertion too flaky for CI).
    test.setTimeout(60_000);
    // Group A-1 (lifecycle refactor 2026-05-21): bare `page` removed.
    // console listener now attaches to the REAL app page and will actually capture errors
    // emitted while clicking Add.
    const realPage = pg.page;
    const consoleErrors: string[] = [];
    const errorHandler = (msg: import('@playwright/test').ConsoleMessage) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    };
    realPage.on('console', errorHandler);
    try {
      await pg.rapidClickAdd(5, 50);
 // Settle: wait for dialog to be visible (single open)
      await expect.poll(() => pg.isAddDialogVisible(), { timeout: 5_000 }).toBe(true);
      expect(await pg.countAddDialogs()).toBe(1);
      // consoleErrors retained for Playwright trace visibility (not asserted — see comment above).
    } finally {
      realPage.off('console', errorHandler);
 // Cleanup: close the single open dialog
      await pg.clickDialogCancel();
    }
  });

  test('TC-LOC-SSL-030: Add three non-Miami rows + save + reload → all three persist', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    test.fixme(true, 'Blocked by app bug: random per-row Delete button becomes non-clickable after add+save+reload; cleanup loop spins forever clicking the dead button. Pending Encore fix.');
    dependencyGate(['TC-LOC-SSL-001']);
 // Small-N (3-row) smoke variant: adds Chicago + Boston + Marriott rows, saves,
 // reloads, verifies all 3 persist. Full ceiling characterization (proven up to 44
 // rows on a throwaway office) is out of CI scope — net-zero discipline on baseline
 // office 1604 keeps mutation minimal.
    test.setTimeout(180_000);
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    await pg.ensureCleanSSLTable(OFFICE_NO);
    const queries = ['Chicago', 'Boston', 'Marriott'] as const;
    for (const q of queries) {
      await pg.clickAdd();
      await pg.searchInDialog(q);
      await expect.poll(() => pg.getDialogRowCount(), { timeout: 8_000 })
        .toBeLessThan(ADD_LOCATION.searchByNameMaxResults);
      await pg.selectFirstDialogRow();
      await expect.poll(() => pg.isDialogSelectEnabled(), { timeout: 5_000 }).toBe(true);
      await pg.clickDialogSelect();
    }
    const addSave = await pg.clickSave();
    expect(addSave.success).toBe(true);
 // Reload and verify all 3 added rows persisted
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    expect(await pg.getDataRowCount()).toBe(1 + queries.length);
 // Cleanup (LR-024 net-zero): delete all non-self rows + save until back to 1
    let nsRow = await pg.findNonSelfRow();
    while (nsRow) {
      await pg.deleteNonSelfRow(nsRow.index);
      nsRow = await pg.findNonSelfRow();
    }
    const cleanup = await pg.clickSave();
    expect(cleanup.success).toBe(true);
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    expect(await pg.getDataRowCount()).toBe(1);
  });

});
