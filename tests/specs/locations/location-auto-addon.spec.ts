// spec: specs_planning/test-plans/locations/locations_auto_addon_test_plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../setup/fixtures';
import { AUTO_ADDON_DEFAULTS } from '../../test-data/locations/location-auto-addon.data';
import { OFFICE_NO } from '../../test-data/common.data';

test.describe.serial('Location Auto Add-On @locations @auto-addon', () => {

  test('TC-LOC-AAO-001: Navigate to Auto Add-On Tab', async ({ locationAutoAddonPage }) => {
    test.setTimeout(90_000);
    await locationAutoAddonPage.navigateToAutoAddonTab(OFFICE_NO);
    expect(locationAutoAddonPage.getCurrentUrl()).toContain('locations/1604/settings');
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
    expect(await locationAutoAddonPage.isCheckboxChecked('chkAutoAddonEncoreMusic')).toBe(false);
    expect(await locationAutoAddonPage.isSaveEnabled()).toBe(true);
    // Cleanup: revert
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonEncoreMusic');
  });

  test('TC-LOC-AAO-004: Toggle Unchecked Item to Checked -- Save Enables', async ({ locationAutoAddonPage }) => {
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    expect(await locationAutoAddonPage.isCheckboxChecked('chkAutoAddonExpressContentDesignSession')).toBe(true);
    expect(await locationAutoAddonPage.isSaveEnabled()).toBe(true);
    // Cleanup: revert
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
  });

  test('TC-LOC-AAO-005: Revert Toggle Re-Disables Save (Smart Form Diff)', async ({ locationAutoAddonPage }) => {
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    expect(await locationAutoAddonPage.isSaveEnabled()).toBe(true);
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    expect(await locationAutoAddonPage.isSaveEnabled()).toBe(false);
  });

  test('TC-LOC-AAO-006: Save Dialog Appears on Save Click', async ({ locationAutoAddonPage }) => {
    await locationAutoAddonPage.toggleCheckbox('chkAutoAddonExpressContentDesignSession');
    await locationAutoAddonPage.clickSaveButton();
    expect(await locationAutoAddonPage.isSaveDialogVisible()).toBe(true);
    expect(await locationAutoAddonPage.getSaveDialogHeading()).toBe('Save Changes');
    expect(await locationAutoAddonPage.getSaveDialogBody()).toBe('Are you sure you want to save the changes?');
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
    expect(await locationAutoAddonPage.getUnsavedDialogHeading()).toBe('Unsaved changes');
    expect(await locationAutoAddonPage.getUnsavedDialogBody()).toBe(
      'Are you sure you want to leave this view? Any unsaved changes will be lost.');
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

});
