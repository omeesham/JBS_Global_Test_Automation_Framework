import { test, expect } from '../../src/infra/fixtures';
import { AUTO_ADDON_DEFAULTS, UNCHECK_PERSISTENCE_CASES } from '../../src/data/testdata/locations/location-auto-addon.data';
import { OFFICE_NO, SAVE_CHANGES_DIALOG, UNSAVED_CHANGES_DIALOG } from '../../src/data/testdata/common.data';

test.describe('Location Auto Add-On @locations @auto-addon', () => {

  // Per-test navigation guard (dependency-gate removal Phase 1.5). See BAS spec :33.
  test.beforeEach(async ({ locationAutoAddonPage }) => {
    const url = locationAutoAddonPage.getCurrentUrl();
    if (!url.includes('settings/location')) {
      await locationAutoAddonPage.navigateToAutoAddonTab(OFFICE_NO);
    }
  });

  test('TC-LOC-AAO-001: Navigate to Auto Add-On Tab', async ({ locationAutoAddonPage, dependencyGate }) => {
    dependencyGate([]);
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

  test('TC-LOC-AAO-002: Default State of Checkbox Items (location 1604)', async ({ locationAutoAddonPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-AAO-001']);
    for (const item of AUTO_ADDON_DEFAULTS) {
      expect(await locationAutoAddonPage.isCheckboxChecked(item.key),
        `${item.name} should be ${item.checked ? 'checked' : 'unchecked'}`).toBe(item.checked);
    }
    expect(await locationAutoAddonPage.isSaveEnabled()).toBe(false);
  });

  test('TC-LOC-AAO-003: Toggle Checked Item to Unchecked -- Save Enables', async ({ locationAutoAddonPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-AAO-001']);
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonEncoreMusic');
 // Radix checkbox toggle fires async state update — poll for checked state.
    await expect.poll(() => locationAutoAddonPage.isCheckboxChecked('chkAutoAddonEncoreMusic'), { timeout: 5_000 }).toBe(false);
    await expect.poll(() => locationAutoAddonPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
 // Cleanup: revert
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonEncoreMusic');
  });

  test('TC-LOC-AAO-004: Toggle Unchecked Item to Checked -- Save Enables', async ({ locationAutoAddonPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-AAO-001']);
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
 // Radix checkbox toggle fires async state update — poll for checked state.
    await expect.poll(() => locationAutoAddonPage.isCheckboxChecked('chkAutoAddonExpressContentDesignSession'), { timeout: 5_000 }).toBe(true);
    await expect.poll(() => locationAutoAddonPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
 // Cleanup: revert
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
  });

  test('TC-LOC-AAO-005: Revert Toggle Re-Disables Save (Smart Form Diff)', async ({ locationAutoAddonPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-AAO-001']);
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
 // Radix checkbox toggle fires async state update — poll for Save state.
    await expect.poll(() => locationAutoAddonPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    await expect.poll(() => locationAutoAddonPage.isSaveEnabled(), { timeout: 5_000 }).toBe(false);
  });

  test('TC-LOC-AAO-006: Save Dialog Appears on Save Click', async ({ locationAutoAddonPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-AAO-001']);
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    await locationAutoAddonPage.clickSaveButton();
    expect(await locationAutoAddonPage.isSaveDialogVisible()).toBe(true);
    expect(await locationAutoAddonPage.getSaveDialogHeading()).toBe(SAVE_CHANGES_DIALOG.heading);
    expect(await locationAutoAddonPage.getSaveDialogBody()).toBe(SAVE_CHANGES_DIALOG.body);
 // Cleanup: cancel dialog + revert
    await locationAutoAddonPage.clickSaveCancel();
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
  });

  test('TC-LOC-AAO-007: Save Dialog Cancel -- Dismisses Without Saving', async ({ locationAutoAddonPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-AAO-001']);
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    await locationAutoAddonPage.clickSaveButton();
    await locationAutoAddonPage.clickSaveCancel();
    expect(await locationAutoAddonPage.isCheckboxChecked('chkAutoAddonExpressContentDesignSession')).toBe(true);
    expect(await locationAutoAddonPage.isSaveEnabled()).toBe(true);
 // Cleanup: revert
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
  });

  test('TC-LOC-AAO-008: Save Dialog Ok -- Saves Successfully with Toast', async ({ locationAutoAddonPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-AAO-001']);
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    await locationAutoAddonPage.clickSaveButton();
    await locationAutoAddonPage.clickSaveOk();
    expect(await locationAutoAddonPage.waitForToast()).toBe(true);
    expect(await locationAutoAddonPage.isSaveEnabled()).toBe(false);
 // Cleanup: restore ECDS to unchecked
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    await locationAutoAddonPage.clickSave();
  });

  test('TC-LOC-AAO-009: Toggle Persists After Page Reload', async ({ locationAutoAddonPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-AAO-001']);
    test.setTimeout(60_000);
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    await locationAutoAddonPage.clickSave();
    await locationAutoAddonPage.navigateFresh(OFFICE_NO);
    expect(await locationAutoAddonPage.isCheckboxChecked('chkAutoAddonExpressContentDesignSession')).toBe(true);
 // Cleanup: restore ECDS to unchecked
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    await locationAutoAddonPage.clickSave();
  });

  test('TC-LOC-AAO-010: Save Button Disabled on Fresh Load (No Changes)', async ({ locationAutoAddonPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-AAO-001']);
    await locationAutoAddonPage.navigateFresh(OFFICE_NO);
    expect(await locationAutoAddonPage.isSaveEnabled()).toBe(false);
  });

  test('TC-LOC-AAO-011: Multiple Toggles Saved Together', async ({ locationAutoAddonPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-AAO-001']);
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

  test('TC-LOC-AAO-012: Sub-Tab Switch with Unsaved Changes -- No Dialog', async ({ locationAutoAddonPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-AAO-001']);
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    expect(await locationAutoAddonPage.isSaveEnabled()).toBe(true);
    await locationAutoAddonPage.clickLocalInformationTab();
 // No unsaved changes dialog should appear -- sub-tab switch is silent
    await locationAutoAddonPage.navigateToAutoAddonTab(OFFICE_NO);
    expect(await locationAutoAddonPage.isCheckboxChecked('chkAutoAddonExpressContentDesignSession')).toBe(true);
 // Cleanup: revert
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
  });

  test('TC-LOC-AAO-013: Unsaved Changes Dialog Appears on Page Navigation Away', async ({ locationAutoAddonPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-AAO-001']);
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

  test('TC-LOC-AAO-014: Unsaved Changes -- Stay Button Keeps User on Page', async ({ locationAutoAddonPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-AAO-001']);
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

  test('TC-LOC-AAO-015: Unsaved Changes -- Discard Button Navigates Away', async ({ locationAutoAddonPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-AAO-001']);
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
    test(`${item.tc}: ${item.name} Uncheck Persists After Save+Reload`, async ({ locationAutoAddonPage, dependencyGate }) => {
      dependencyGate(['TC-LOC-AAO-001']);
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

  test('TC-LOC-AAO-019: Cancel Does Not Persist Toggle', async ({ locationAutoAddonPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-AAO-001']);
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

  test('TC-LOC-AAO-020: Bulk Invert All Checkboxes Persists After Save+Reload', async ({ locationAutoAddonPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-AAO-001']);
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

});
