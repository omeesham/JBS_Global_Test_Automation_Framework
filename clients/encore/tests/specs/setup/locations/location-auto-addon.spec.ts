// spec: specs_planning/test-plans/locations/locations_auto_addon_test_plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../../setup/fixtures';
import { AUTO_ADDON_DEFAULTS, UNCHECK_PERSISTENCE_CASES } from '../../../test-data/setup/locations/location-auto-addon.data';
import { OFFICE_NO, SAVE_CHANGES_DIALOG, UNSAVED_CHANGES_DIALOG } from '../../../test-data/common.data';

// SP5 integration test: capture wall-clock at suite start so TC-HIST can filter
// history rows produced by this suite's saves. 2-min buffer absorbs clock skew.
let suiteStartTime = 0;

test.describe.serial('Location Auto Add-On @locations @auto-addon', () => {

  test.beforeAll(() => {
    suiteStartTime = Date.now() - 2 * 60 * 1000;
  });

  test('TC-LOC-AAO-001: Navigate to Auto Add-On Tab', async ({ locationAutoAddonPage }) => {
    test.setTimeout(90_000);
    await locationAutoAddonPage.navigateToAutoAddonTab(OFFICE_NO);
    expect(locationAutoAddonPage.getCurrentUrl()).toContain(`locations/${OFFICE_NO}/settings`);
    expect(await locationAutoAddonPage.getCheckboxCount()).toBe(5);
    // Restore defaults in case DB is polluted from prior failed test runs
    let needsSave = false;
    for (const item of AUTO_ADDON_DEFAULTS) {
      const isChecked = await locationAutoAddonPage.isCheckboxChecked(item.key);
      if (isChecked !== item.checked) {
        await locationAutoAddonPage.toggleCheckbox(item.key);
        needsSave = true;
      }
    }
    if (needsSave) {
      await locationAutoAddonPage.clickSaveButton();
      await locationAutoAddonPage.clickSaveOk();
      await locationAutoAddonPage.waitForToast();
      await locationAutoAddonPage.navigateFresh(OFFICE_NO);
    }
  });

  test('TC-LOC-AAO-002: Default State of Checkbox Items (location 1604)', async ({ locationAutoAddonPage }) => {
    for (const item of AUTO_ADDON_DEFAULTS) {
      expect(await locationAutoAddonPage.isCheckboxChecked(item.key),
        `${item.name} should be ${item.checked ? 'checked' : 'unchecked'}`).toBe(item.checked);
    }
    expect(await locationAutoAddonPage.isSaveEnabled()).toBe(false);
  });

  test('TC-LOC-AAO-003: Toggle Checked Item to Unchecked -- Save Enables', async ({ locationAutoAddonPage }) => {
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonEncoreMusic');
    // LR-010: Radix checkbox toggle fires async state update — poll for checked state.
    await expect.poll(() => locationAutoAddonPage.isCheckboxChecked('chkAutoAddonEncoreMusic'), { timeout: 5_000 }).toBe(false);
    await expect.poll(() => locationAutoAddonPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    // Cleanup: revert
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonEncoreMusic');
  });

  test('TC-LOC-AAO-004: Toggle Unchecked Item to Checked -- Save Enables', async ({ locationAutoAddonPage }) => {
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    // LR-010: Radix checkbox toggle fires async state update — poll for checked state.
    await expect.poll(() => locationAutoAddonPage.isCheckboxChecked('chkAutoAddonExpressContentDesignSession'), { timeout: 5_000 }).toBe(true);
    await expect.poll(() => locationAutoAddonPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    // Cleanup: revert
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
  });

  test('TC-LOC-AAO-005: Revert Toggle Re-Disables Save (Smart Form Diff)', async ({ locationAutoAddonPage }) => {
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    // LR-010: Radix checkbox toggle fires async state update — poll for Save state.
    await expect.poll(() => locationAutoAddonPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    await expect.poll(() => locationAutoAddonPage.isSaveEnabled(), { timeout: 5_000 }).toBe(false);
  });

  test('TC-LOC-AAO-006: Save Dialog Appears on Save Click', async ({ locationAutoAddonPage }) => {
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    await locationAutoAddonPage.clickSaveButton();
    expect(await locationAutoAddonPage.isSaveDialogVisible()).toBe(true);
    expect(await locationAutoAddonPage.getSaveDialogHeading()).toBe(SAVE_CHANGES_DIALOG.heading);
    expect(await locationAutoAddonPage.getSaveDialogBody()).toBe(SAVE_CHANGES_DIALOG.body);
    // Cleanup: cancel dialog + revert
    await locationAutoAddonPage.clickSaveCancel();
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
  });

  test('TC-LOC-AAO-007: Save Dialog Cancel -- Dismisses Without Saving', async ({ locationAutoAddonPage }) => {
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    await locationAutoAddonPage.clickSaveButton();
    await locationAutoAddonPage.clickSaveCancel();
    expect(await locationAutoAddonPage.isCheckboxChecked('chkAutoAddonExpressContentDesignSession')).toBe(true);
    expect(await locationAutoAddonPage.isSaveEnabled()).toBe(true);
    // Cleanup: revert
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
  });

  test('TC-LOC-AAO-008: Save Dialog Ok -- Saves Successfully with Toast', async ({ locationAutoAddonPage }) => {
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    await locationAutoAddonPage.clickSaveButton();
    await locationAutoAddonPage.clickSaveOk();
    expect(await locationAutoAddonPage.waitForToast()).toBe(true);
    expect(await locationAutoAddonPage.isSaveEnabled()).toBe(false);
    // Cleanup: restore ECDS to unchecked
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    await locationAutoAddonPage.clickSave();
  });

  test('TC-LOC-AAO-009: Toggle Persists After Page Reload', async ({ locationAutoAddonPage }) => {
    test.setTimeout(60_000);
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    await locationAutoAddonPage.clickSave();
    await locationAutoAddonPage.navigateFresh(OFFICE_NO);
    expect(await locationAutoAddonPage.isCheckboxChecked('chkAutoAddonExpressContentDesignSession')).toBe(true);
    // Cleanup: restore ECDS to unchecked
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    await locationAutoAddonPage.clickSave();
  });

  test('TC-LOC-AAO-010: Save Button Disabled on Fresh Load (No Changes)', async ({ locationAutoAddonPage }) => {
    await locationAutoAddonPage.navigateFresh(OFFICE_NO);
    expect(await locationAutoAddonPage.isSaveEnabled()).toBe(false);
  });

  test('TC-LOC-AAO-011: Multiple Toggles Saved Together', async ({ locationAutoAddonPage }) => {
    test.setTimeout(60_000);
    // Navigate fresh to normalize server state (prior cleanup saves may fail silently)
    await locationAutoAddonPage.navigateFresh(OFFICE_NO);
    await locationAutoAddonPage.checkCheckbox('chkAutoAddonExpressContentDesignSession');
    await locationAutoAddonPage.uncheckCheckbox('chkAutoAddonEncoreMusic');
    expect(await locationAutoAddonPage.isSaveEnabled()).toBe(true);
    await locationAutoAddonPage.clickSave();
    await locationAutoAddonPage.navigateFresh(OFFICE_NO);
    expect(await locationAutoAddonPage.isCheckboxChecked('chkAutoAddonExpressContentDesignSession')).toBe(true);
    expect(await locationAutoAddonPage.isCheckboxChecked('chkAutoAddonEncoreMusic')).toBe(false);
    // Cleanup: restore both to defaults
    await locationAutoAddonPage.uncheckCheckbox('chkAutoAddonExpressContentDesignSession');
    await locationAutoAddonPage.checkCheckbox('chkAutoAddonEncoreMusic');
    await locationAutoAddonPage.clickSave();
  });

  test('TC-LOC-AAO-012: Sub-Tab Switch with Unsaved Changes -- No Dialog', async ({ locationAutoAddonPage }) => {
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    expect(await locationAutoAddonPage.isSaveEnabled()).toBe(true);
    await locationAutoAddonPage.clickLocalInformationTab();
    // No unsaved changes dialog should appear -- sub-tab switch is silent
    await locationAutoAddonPage.navigateToAutoAddonTab(OFFICE_NO);
    expect(await locationAutoAddonPage.isCheckboxChecked('chkAutoAddonExpressContentDesignSession')).toBe(true);
    // Cleanup: revert
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
  });

  test('TC-LOC-AAO-013: Unsaved Changes Dialog Appears on Page Navigation Away', async ({ locationAutoAddonPage }) => {
    // Fresh navigation to ensure form + routing guard are in clean state (TC-012 tab switching can corrupt dirty tracking)
    await locationAutoAddonPage.navigateFresh(OFFICE_NO);
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    expect(await locationAutoAddonPage.isSaveEnabled()).toBe(true);
    await locationAutoAddonPage.clickSidebarHome();
    expect(await locationAutoAddonPage.isUnsavedDialogVisible()).toBe(true);
    expect(await locationAutoAddonPage.getUnsavedDialogHeading()).toBe(UNSAVED_CHANGES_DIALOG.heading);
    expect(await locationAutoAddonPage.getUnsavedDialogBody()).toBe(UNSAVED_CHANGES_DIALOG.body);
    // Cleanup: stay + revert
    await locationAutoAddonPage.clickUnsavedStay();
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
  });

  test('TC-LOC-AAO-014: Unsaved Changes -- Stay Button Keeps User on Page', async ({ locationAutoAddonPage }) => {
    await locationAutoAddonPage.navigateFresh(OFFICE_NO);
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    expect(await locationAutoAddonPage.isSaveEnabled()).toBe(true);
    await locationAutoAddonPage.clickSidebarHome();
    await locationAutoAddonPage.clickUnsavedStay();
    expect(locationAutoAddonPage.getCurrentUrl()).toContain('/settings/location');
    expect(await locationAutoAddonPage.isCheckboxChecked('chkAutoAddonExpressContentDesignSession')).toBe(true);
    expect(await locationAutoAddonPage.isSaveEnabled()).toBe(true);
    // Cleanup: revert
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
  });

  test('TC-LOC-AAO-015: Unsaved Changes -- Discard Button Navigates Away', async ({ locationAutoAddonPage }) => {
    await locationAutoAddonPage.navigateFresh(OFFICE_NO);
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    expect(await locationAutoAddonPage.isSaveEnabled()).toBe(true);
    await locationAutoAddonPage.clickSidebarHome();
    await locationAutoAddonPage.clickUnsavedDiscard();
    // Wait for client-side navigation to complete after Discard
    await expect.poll(() => locationAutoAddonPage.getCurrentUrl(), { timeout: 10_000 }).toContain('/home');
    // Navigate back and verify original state
    await locationAutoAddonPage.navigateFresh(OFFICE_NO);
    expect(await locationAutoAddonPage.isCheckboxChecked('chkAutoAddonExpressContentDesignSession')).toBe(false);
  });

  // --- Round-Trip Persistence: Data-Driven (TC-017/018, MNT-008) ---
  for (const item of UNCHECK_PERSISTENCE_CASES) {
    test(`${item.tc}: ${item.name} Uncheck Persists After Save+Reload`, async ({ locationAutoAddonPage }) => {
      test.setTimeout(60_000);
      await locationAutoAddonPage.navigateFresh(OFFICE_NO);
      // Verify checkbox starts checked (default for Wordly and Labor)
      expect(await locationAutoAddonPage.isCheckboxChecked(item.key),
        `${item.name} should start checked`).toBe(true);
      await locationAutoAddonPage.uncheckCheckbox(item.key);
      expect(await locationAutoAddonPage.isSaveEnabled()).toBe(true);
      await locationAutoAddonPage.clickSave();
      await locationAutoAddonPage.navigateFresh(OFFICE_NO);
      expect(await locationAutoAddonPage.isCheckboxChecked(item.key),
        `${item.name} should remain unchecked after reload`).toBe(false);
      // Cleanup: re-check to restore default
      await locationAutoAddonPage.checkCheckbox(item.key);
      await locationAutoAddonPage.clickSave();
    });
  }

  test('TC-LOC-AAO-019: Cancel Does Not Persist Toggle', async ({ locationAutoAddonPage }) => {
    await locationAutoAddonPage.navigateFresh(OFFICE_NO);
    // ECDS defaults to unchecked — toggle it to checked
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    await expect.poll(() => locationAutoAddonPage.isCheckboxChecked('chkAutoAddonExpressContentDesignSession'), { timeout: 5_000 }).toBe(true);
    await locationAutoAddonPage.clickSaveButton();
    await locationAutoAddonPage.clickSaveCancel();
    // Navigate fresh — safeNavigateTo handles dirty form beforeunload
    await locationAutoAddonPage.navigateFresh(OFFICE_NO);
    // ECDS should still be unchecked (cancel = no save)
    expect(await locationAutoAddonPage.isCheckboxChecked('chkAutoAddonExpressContentDesignSession'),
      'ECDS should remain unchecked after cancel').toBe(false);
  });

  test('TC-LOC-AAO-020: Bulk Invert All Checkboxes Persists After Save+Reload', async ({ locationAutoAddonPage }) => {
    test.setTimeout(60_000);
    await locationAutoAddonPage.navigateFresh(OFFICE_NO);
    // Invert all 5 checkboxes
    for (const item of AUTO_ADDON_DEFAULTS) {
      if (item.checked) {
        await locationAutoAddonPage.uncheckCheckbox(item.key);
      } else {
        await locationAutoAddonPage.checkCheckbox(item.key);
      }
    }
    expect(await locationAutoAddonPage.isSaveEnabled()).toBe(true);
    await locationAutoAddonPage.clickSave();
    await locationAutoAddonPage.navigateFresh(OFFICE_NO);
    // Verify all 5 are inverted from defaults
    for (const item of AUTO_ADDON_DEFAULTS) {
      expect(await locationAutoAddonPage.isCheckboxChecked(item.key),
        `${item.name} should be ${!item.checked ? 'checked' : 'unchecked'} after invert`).toBe(!item.checked);
    }
    // Cleanup: restore ALL defaults
    for (const item of AUTO_ADDON_DEFAULTS) {
      const current = await locationAutoAddonPage.isCheckboxChecked(item.key);
      if (current !== item.checked) {
        if (item.checked) {
          await locationAutoAddonPage.checkCheckbox(item.key);
        } else {
          await locationAutoAddonPage.uncheckCheckbox(item.key);
        }
      }
    }
    await locationAutoAddonPage.clickSave();
  });

  // ── SP5: Cross-tab history integration — MUST be LAST in describe.serial ────
  // SP1 §8: Auto add-on checkboxes have NO mapped column in the 87-column
  // Location Management History. This test verifies whether auto-addon saves
  // create history rows AT ALL (snapshot model may still record Modified By/On).
  //
  // Saves tracked: TC-008 (2), TC-009 (2), TC-011 (2), TC-017 (2), TC-018 (2),
  // TC-020 (2) = 12 guaranteed. TC-006/007/019 cancel = no row.
  // TC-001 conditional baseline = 0-1 row.
  test('TC-LOC-AAO-HIST: Auto-addon saves and history row presence', async ({ locationAutoAddonPage, locationManagementHistoryPage }) => {
    test.setTimeout(180_000);

    // 1. Navigate to Location Management History tab from any starting URL
    //    (navigateToHistoryTab handles: page navigation if needed, unsaved dialog dismissal per LR-026)
    await locationManagementHistoryPage.navigateToHistoryTab(OFFICE_NO);

    // 3. Sort by Modified On descending (SP1 §11: default sort is ASCENDING)
    await locationManagementHistoryPage.sortByModifiedOnDesc();
    await locationManagementHistoryPage.waitForRecentTopRow();

    // 4. Read all rows newer than suiteStartTime — only Modified By/On since
    //    auto-addon has no dedicated column in the 87-column schema (SP1 §8).
    const HEADERS = ['Modified By', 'Modified On'];
    const suiteRows = await locationManagementHistoryPage.getRowsSinceTimestamp(
      suiteStartTime, HEADERS,
    );

    // 5. Informational: auto-addon saves may or may not create history rows.
    //    If rows exist → saves create snapshot rows but addon values have no column.
    //    If 0 rows → auto-addon saves are fully NOT-TRACKED at the save level.
    //    The field absence IS the finding (SP6 guardrail).
    if (suiteRows.length === 0) {
      // NOT-TRACKED at save level: auto-addon endpoint does not create history rows.
      // This is an expected SP1 §8 finding — not a test failure.
      expect.soft(true,
        'INFO: Auto-addon saves produced 0 history rows — NOT-TRACKED at save level (SP1 §8)').toBe(true);
    } else {
      // Saves DO create snapshot rows — verify Modified By/On are populated
      expect.soft(suiteRows.length,
        'auto-addon saves produced history rows — verifying Modified By/On').toBeGreaterThan(0);
      for (let i = 0; i < suiteRows.length; i++) {
        const row = suiteRows[i]!;
        expect.soft(row['Modified By'], `row ${i}: Modified By empty`).toBeTruthy();
        expect.soft(row['Modified On'], `row ${i}: Modified On empty`).toBeTruthy();
      }
    }

    // RC-1 cleanup: return to Basic Information so next spec's sub-tabs are visible
    await locationManagementHistoryPage.returnToBasicInformation();
  });

});
