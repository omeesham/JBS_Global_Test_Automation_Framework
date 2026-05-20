import { test, expect } from '../../src/infra/fixtures';
import {
  SSL_COLUMN_HEADERS,
  SELF_ROW,
  ADD_LOCATION,
  SSL_DIALOG_HEADING,
} from '../../src/data/testdata/locations/location-shared-setup-locations.data';
import { OFFICE_NO } from '../../src/data/testdata/common.data';

test.describe('Location Shared Setup Locations @locations @shared-setup', () => {

  // Per-test navigation guard (dependency-gate removal Phase 1.5). See BAS spec :33.
  test.beforeEach(async ({ locationSharedSetupLocationsPage: pg }) => {
    const url = pg.getCurrentUrl();
    if (!url.includes('settings/location')) {
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
 // Cleanup: hard reload to reset dirty state cleanly (audit-note #5 framework fix —
 // discardAndReturn(homeUrl) was leaving the Angular SPA in a broken serial state where
 // the next test's clickAdd opened the wrong dialog. Replaced with reloadAndNavigateToSSLTab
 // per SP-A walk-evidence-shared-setup-2026-05-15.md:Section B.TC-LOC-SSL-016 hint.
 // SP-D 2026-05-20).
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
  });

  test('TC-LOC-SSL-016: Cancelling the dialog after row selection leaves table and Save unchanged', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
 // SP-D 2026-05-20: body rewritten from empty test.fixme() placeholder to real assertions
 // per walk-evidence-shared-setup-2026-05-15.md:Section B.TC-LOC-SSL-016 (PASS-LIVE class —
 // SP-A flagged 'functionally trivial' because body was empty). Framework leak from TC-015
 // (discardAndReturn → SPA broken state) addressed in TC-015 cleanup above (reloadAndNavigateToSSLTab).
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
 // SP-D 2026-05-20 unfixme: test data switched Miami→Boston per BUG-LOC-SHR-001 alt-query
 // independence (Boston returns 77 rows on e2e per BUG-001 verificationLog 2026-05-19;
 // Miami catalog excluded from office 1604 dialog context). Parent plan v5.1 CLOSURE-2 path:
 // "If alternate query returns results → TC is NOT BUG-001-blocked → unfixme + x2 cycles."
    test.setTimeout(90_000);
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    await pg.ensureCleanSSLTable(OFFICE_NO);
 // Add first available location via name search (ghost-proof — always finds an available one)
    await pg.clickAdd();
    await pg.searchInDialog(ADD_LOCATION.searchByName);
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
 // SP-D 2026-05-20 unfixme: Boston alt-query (per TC-018 comment) unblocks BUG-001 cascade.
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
 // SP-D 2026-05-20 unfixme: Boston alt-query (per TC-018 comment) unblocks BUG-001 cascade.
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
 // SP-D 2026-05-20 unfixme: Boston alt-query (per TC-018 comment) unblocks BUG-001 cascade.
    test.setTimeout(90_000);
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    await pg.ensureCleanSSLTable(OFFICE_NO);
 // Make two changes: toggle self SI ON + add location via name search
    await pg.toggleSelfSharesInventory();
    await pg.clickAdd();
    await pg.searchInDialog(ADD_LOCATION.searchByName);
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
 // SP-D 2026-05-20 unfixme: Boston alt-query (per TC-018 comment) unblocks BUG-001 cascade.
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
 // Traces to walk-evidence-shared-setup-2026-05-15.md:Section A:GAP-001 (A.columns)
 // Complements TC-002 (whole-array content check) with per-testid resolution.
    expect(await pg.isElementVisible('colHeaderLocalOffice')).toBe(true);
    expect(await pg.isElementVisible('colHeaderLocalOfficeName')).toBe(true);
    expect(await pg.isElementVisible('colHeaderPrimaryOffice')).toBe(true);
    expect(await pg.isElementVisible('colHeaderSharesInventory')).toBe(true);
    expect(await pg.isElementVisible('colHeaderActions')).toBe(true);
  });

  test('TC-LOC-SSL-026: Dialog number-search "1233" returns exactly the Miami Marriott office', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
 // Traces to walk-evidence-shared-setup-2026-05-15.md:Section A:GAP-002 (G.number)
 // EXPECTED-FAIL on e2e office 1604 per BUG-LOC-SHR-001 (Miami-region offices structurally
 // excluded from this catalog — visibility/scope filter at /api/location/location-lookup layer).
 // Nav2 baseline returns 1 row. Test serves as Encore-side bug-report evidence vehicle;
 // do NOT add test.fixme() (FORBIDDEN LOOPHOLE #3). SP-D Step 7 will surface the cascade.
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
 // Traces to walk-evidence-shared-setup-2026-05-15.md:Section A:GAP-003 (J.cross-field)
 // Parallels fixme'd TC-021 using non-Miami query (Chicago) that works on e2e office 1604
 // per BUG-LOC-SHR-001 verificationLog 2026-05-19 (123 Chicago rows confirmed).
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

  test('TC-LOC-SSL-028: In-SPA top-tab switch with dirty form does NOT show unsaved dialog', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
 // Traces to walk-evidence-shared-setup-2026-05-15.md:Section A:GAP-004 (K.1 beforeunload — K1b)
 // Architectural negative-test: nav2 + e2e both lack page-level CanDeactivate guard on
 // locationdetail route; only browser-native beforeunload fires on hard-leave. SPA tab
 // switch silently preserves dirty state (USEFUL guard rail to detect future regressions
 // if Angular CanDeactivate is added).
    test.setTimeout(60_000);
    await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
    await pg.ensureCleanSSLTable(OFFICE_NO);
    await pg.makeFormDirty();
    await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
 // Switch to Location Management History top-level tab
    await pg.clickTopLevelTab('tabLocationManagementHistory');
    await expect.poll(() => pg.getActiveTopLevelTab(), { timeout: 5_000 })
      .toContain('Location Management History');
    expect(await pg.hasVisibleUnsavedDialog(1_500)).toBe(false);
    expect(await pg.isSaveEnabled()).toBe(true);
 // Cleanup: navigate back + discard via reload (LR-024 net-zero — no save fired)
    await pg.clickTopLevelTab('tabBasicInformation');
    await expect.poll(() => pg.getActiveTopLevelTab(), { timeout: 5_000 })
      .toContain('Basic Information');
    await pg.discardAndReturn(OFFICE_NO);
  });

  test('TC-LOC-SSL-029: Five rapid Add-button clicks open exactly one dialog', async ({ locationSharedSetupLocationsPage: pg, page, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
 // Traces to walk-evidence-shared-setup-2026-05-15.md:Section A:GAP-005 (K.2 rapid-click)
 // App-level guard: modal-state primitive blocks repeat invocation while dialog is open.
 // Load-bearing assertion is the dialog-count == 1 (what GAP-005 actually proves).
 // Console listener is retained for diagnostic visibility but NOT asserted — walk-evidence's
 // "no console errors" was a passive observation from a probe without an attached listener,
 // and a strict empty-array assertion is too prone to ambient Angular noise (NG0100,
 // ResizeObserver loop, etc.) to be load-bearing in CI.
    test.setTimeout(60_000);
    const consoleErrors: string[] = [];
    const errorHandler = (msg: import('@playwright/test').ConsoleMessage) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    };
    page.on('console', errorHandler);
    try {
      await pg.rapidClickAdd(5, 50);
 // Settle: wait for dialog to be visible (single open)
      await expect.poll(() => pg.isAddDialogVisible(), { timeout: 5_000 }).toBe(true);
      expect(await pg.countAddDialogs()).toBe(1);
      // consoleErrors retained for Playwright trace visibility (not asserted — see comment above).
    } finally {
      page.off('console', errorHandler);
 // Cleanup: close the single open dialog
      await pg.clickDialogCancel();
    }
  });

  test('TC-LOC-SSL-030: Add three non-Miami rows + save + reload → all three persist', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
    dependencyGate(['TC-LOC-SSL-001']);
 // Traces to walk-evidence-shared-setup-2026-05-15.md:Section A:GAP-006 (K.3 table-at-max — K3a only)
 // Small-N (3-row) smoke variant of GAP-006 K3a. Walk-evidence proved up to 44 rows
 // on throwaway office 1605, but LR-024 net-zero constrains shared baseline 1604 to a
 // minimal-mutation variant — full ceiling characterization is intentionally out-of-CI-scope.
 // Queries used: Chicago (123 rows on e2e per BUG-001 verificationLog 2026-05-19),
 // Boston (77 rows per same evidence), Marriott (295 rows per same evidence — Marriott was
 // chosen over Dallas because BUG-001 e2e evidence does NOT enumerate Dallas counts;
 // Dallas only appears in the nav2 baseline alternate-queries block).
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
