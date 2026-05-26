import { Page, expect } from '@playwright/test';
import { BasePage } from '../../core/base-page';
import { Log } from '../../utils/logger';
import { IConfig } from '../../types';
import { CheckboxState } from './location-form-helpers.page';

export class LocationSharedSetupLocationsPage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
    Log.info('LocationSharedSetupLocationsPage initialized');
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // NAVIGATION
 // ─────────────────────────────────────────────────────────────────────────────

 /** Navigate to Shared Setup Locations tab; clicks tab and waits for table readiness. */
  async navigateToSharedSetupTab(officeNo: string = '1604'): Promise<void> {
    await this.navigateToSubTab('tabSharedSetupLocations', 'tblSharedSetupLocations', officeNo);
  }

 /**
 * Group D-2 (lifecycle refactor 2026-05-21): DOM-presence guard so
 * beforeEach can avoid re-navigating when already on the tab.
 */
  async isOnSharedSetupTab(): Promise<boolean> {
    // Fix #4a: use tab trigger aria-selected, not
    // child-anchor count(). Mirrors base-page.ts:448.
    const tab = this.getElement('tabSharedSetupLocations');
    if ((await tab.count()) === 0) return false;
    return (await tab.getAttribute('aria-selected').catch(() => null)) === 'true';
  }

 /** Reload page with beforeunload handler and return to SSL tab. */
  async reloadAndNavigateToSSLTab(officeNo: string = '1604'): Promise<void> {
    const handler = async (d: import('@playwright/test').Dialog) => {
      try { await d.accept(); } catch { /* already handled */ }
    };
    this.page.on('dialog', handler);
    try {
      await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
    } finally {
      this.page.removeListener('dialog', handler);
    }
    await this.waitForAngularStable();
    await this.navigateToSharedSetupTab(officeNo);
  }

 /** Trigger reload to test beforeunload. Dismisses dialog (stays on page). Returns true if fired. */
  async triggerBeforeunloadAndStay(): Promise<boolean> {
    let dialogFired = false;
    const handler = async (d: import('@playwright/test').Dialog) => {
      dialogFired = true;
      try { await d.dismiss(); } catch { /* already handled */ }
    };
    this.page.on('dialog', handler);
    try {
      await this.page.reload({ timeout: 5_000 }).catch(() => {});
    } finally {
      this.page.removeListener('dialog', handler);
    }
    return dialogFired;
  }

 /**
 * Navigate to the office home page to discard unsaved changes, then return to the SSL tab.
 * Used as cleanup when an unsaved dirty state must be abandoned.
 */
  async discardAndReturn(officeNo: string = '1604'): Promise<void> {
    const homeUrl = `${this.config?.base_url ?? ''}navigator/locations/${officeNo}/home`;
    await this.navigateTo(homeUrl);
    const dlg = this.getElement('dlgUnsavedChanges');
    const appeared = await dlg.waitFor({ state: 'visible', timeout: 4_000 }).then(() => true).catch(() => false);
    if (appeared) {
      await this.getElement('btnUnsavedChangesOk').click();
      await dlg.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
    }
    await this.navigateToSharedSetupTab(officeNo);
  }

 /**
 * Defensive cleanup: delete extra rows and reset self SI to unchecked.
 * Call at the start of each persistence test to guard against serial state
 * contamination. No-op if state is already clean.
 */
  async ensureCleanSSLTable(officeNo: string = '1604'): Promise<void> {
    const si = await this.getSelfSharesInventoryState();
    let nsRow = await this.findNonSelfRow();
    if (nsRow || si.checked) {
      Log.info(`[CLEANUP] Dirty state: non-self=${!!nsRow}, SI=${si.checked} — cleaning`);
 // Delete all non-self rows (re-scan after each delete since indexes shift)
      while (nsRow) {
        await this.deleteNonSelfRow(nsRow.index);
        nsRow = await this.findNonSelfRow();
      }
      if (si.checked) await this.setSelfSharesInventory(false);
      await this.clickSave();
      await this.reloadAndNavigateToSSLTab(officeNo);
    }
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // TABLE INSPECTION
 // ─────────────────────────────────────────────────────────────────────────────

 /**
 * Count data rows in the shared-setup table (excludes the fixed Add-button row at the end).
 * Before any additions: returns 1 (self-row only).
 * After adding N locations: returns 1 + N.
 */
  async getDataRowCount(): Promise<number> {
    const table = this.getElement('tblSharedSetupLocations');
    await table.waitFor({ state: 'visible', timeout: 10_000 });
    const total = await table.locator('tbody tr').count();
    return total - 1; // subtract fixed Add-button row
  }

 /** Get the text of all column headers in order. Expected: ['Local Office', 'Local Office Name', 'Primary Office', 'Shares Inventory', '']. */
  async getColumnHeaders(): Promise<string[]> {
    const table = this.getElement('tblSharedSetupLocations');
    await table.waitFor({ state: 'visible', timeout: 10_000 });
    const headers = await table.locator('thead th').allTextContents();
    return headers.map(h => h.trim());
  }

 /** Find the first non-self row (office != 1604). Returns index + text, or null if none. */
  async findNonSelfRow(): Promise<{ index: number; localOffice: string; localOfficeName: string } | null> {
    const count = await this.getDataRowCount();
    const tbl = this.getLocator('tblSharedSetupLocations');
    for (let i = 1; i <= count; i++) {
      const cells = await this.page.locator(`${tbl} tbody tr:nth-child(${i}) td`).allTextContents();
      const office = (cells[0] ?? '').trim();
      if (office !== '1604') {
        return { index: i, localOffice: office, localOfficeName: (cells[1] ?? '').trim() };
      }
    }
    return null;
  }

 /** Get Local Office number and Name text from the self-location row (row 1). */
  async getSelfRowText(): Promise<{ localOffice: string; localOfficeName: string }> {
    const tableSel = this.getLocator('tblSharedSetupLocations');
    const cells = await this.page.locator(`${tableSel} tbody tr:first-child td`).allTextContents();
    return {
      localOffice: (cells[0] ?? '').trim(),
      localOfficeName: (cells[1] ?? '').trim(),
    };
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // SELF-ROW CHECKBOX STATE
 // ─────────────────────────────────────────────────────────────────────────────

 /** Get checked/disabled state of the Primary Office Radix checkbox in the self-row. */
  async getSelfPrimaryOfficeState(): Promise<CheckboxState> {
    return this.getRadixCheckboxState('chkSelfPrimaryOffice');
  }

 /** Get checked/disabled state of the Shares Inventory Radix checkbox in the self-row. */
  async getSelfSharesInventoryState(): Promise<CheckboxState> {
    return this.getRadixCheckboxState('chkSelfSharesInventory');
  }

 /** Click the Shares Inventory checkbox in the self-row to toggle it. */
  async toggleSelfSharesInventory(): Promise<void> {
    await this.getElement('chkSelfSharesInventory').click();
    Log.info('Toggled self Shares Inventory');
  }

 /**
 * Idempotently set Shares Inventory to the given checked state (clicks only if different).
 * Uses BasePage.setRadixCheckbox (Radix-aware).
 */
  async setSelfSharesInventory(checked: boolean): Promise<void> {
    await this.setRadixCheckbox('chkSelfSharesInventory', checked);
  }

 /** Return true if the Delete button in the self-row is disabled. */
  async isSelfDeleteDisabled(): Promise<boolean> {
    return this.getElement('btnSelfDelete').isDisabled();
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // SAVE (LEFT-PANEL)
 // ─────────────────────────────────────────────────────────────────────────────

 /** Check if the left-panel Save button is enabled (form is dirty). */
  async isSaveEnabled(): Promise<boolean> {
    return !(await this.getElement('btnSave').isDisabled().catch(() => true));
  }

 /** Click left-panel Save and wait for Save Changes dialog to appear. */
  async openSaveDialog(): Promise<void> {
    await this.clickWithRetry('btnSave');
    await this.waitForElement('dlgSaveChanges', 5_000);
    Log.info('[OK] Save Changes dialog opened (not confirmed)');
  }

 /** Cancel the Save Changes dialog (for discard scenarios). */
  async cancelSaveDialog(): Promise<void> {
    await this.clickWithRetry('btnSaveChangesCancel');
    await this.getElement('dlgSaveChanges').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
    Log.info('Cancelled Save Changes dialog');
  }

 /** Click the left-panel Save and confirm the Save Changes dialog. Delegates to BasePage.clickSaveWithDialog. */
  async clickSave(): Promise<{ success: boolean; networkError?: string }> {
    return this.clickSaveWithDialog('btnSave');
  }

 /**
 * FCC paradigm save callback. Mirrors location-notes.page.ts:269 — delegate to BasePage.clickSaveWithDialog,
 * throw on failure so saveAndVerifyCase()'s try/catch surfaces it. Use this from FCC test cases.
 */
  async saveAndConfirm(): Promise<void> {
    const result = await this.clickSaveWithDialog('btnSave');
    if (!result.success) {
      Log.error(`[ERR] SSL save failed: ${result.networkError}`);
      throw new Error(`SSL save failed: ${result.networkError}`);
    }
  }

 /**
 * Return true if a Save button exists INSIDE the active tabpanel (as opposed to the shared left-panel).
 * For the Shared Setup Locations tab: expected result is false (no dedicated in-tab Save).
 * Uses evaluate to walk up from the SSL table to its closest [role="tabpanel"] ancestor
 * (the inner SSL tabpanel only), preventing a false-positive match on the outer
 * "Basic Information" tabpanel which contains the shared left-panel Save button.
 */
  async hasInTabSaveButton(): Promise<boolean> {
    const tableSel = this.getLocator('tblSharedSetupLocations');
    const count: number = await this.page.evaluate((sel: string) => {
      const table = document.querySelector(sel);
      if (!table) return 0;
      const tabpanel = table.closest('[role="tabpanel"]');
      if (!tabpanel) return 0;
      return Array.from(tabpanel.querySelectorAll('button')).filter(
        (b) => b.textContent?.trim() === 'Save',
      ).length;
    }, tableSel);
    Log.info(`In-tab Save buttons found: ${count}`);
    return count > 0;
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // ADD / CHANGE LOCAL OFFICE DIALOG
 // ─────────────────────────────────────────────────────────────────────────────

 /** Click the Add button and wait for the Change Local Office dialog to open. */
  async clickAdd(): Promise<void> {
    await this.getElement('btnSharedAdd').click();
    await this.getElement('dlgChangeLocalOffice').waitFor({ state: 'visible', timeout: 10_000 });
    Log.info('Change Local Office dialog opened');
  }

 /** Return true if the Change Local Office dialog is currently visible. */
  async isAddDialogVisible(): Promise<boolean> {
    return this.isElementVisible('dlgChangeLocalOffice', 3_000);
  }

 /** Get the heading text of the Change Local Office dialog. Expected: "Change Local Office". */
  async getDialogHeading(): Promise<string> {
    return ((await this.getElement('dlgChangeLocalOfficeHeading').textContent()) ?? '').trim();
  }

 /** Return true if the dialog Select button is enabled (a row has been checked). */
  async isDialogSelectEnabled(): Promise<boolean> {
    return !(await this.getElement('btnDlgSelect').isDisabled().catch(() => true));
  }

 /**
 * Count visible rows in the dialog results table.
 * Unfiltered baseline is ~4614. After a specific number search it should be 1.
 */
  async getDialogRowCount(): Promise<number> {
    const table = this.getElement('tblDlgResults');
    await table.waitFor({ state: 'visible', timeout: 10_000 });
    return table.locator('tbody tr').count();
  }

 /** Type a search term into the dialog search input to filter results. */
  async searchInDialog(term: string): Promise<void> {
    const input = this.getElement('txtDlgSearch');
    await input.clear();
    await input.fill(term);
    Log.info(`Dialog search: "${term}"`);
  }

 /**
 * Get Local Office number and Name from the first row currently visible in the dialog table.
 * Dialog columns: [0]=checkbox cell, [1]=Local Office, [2]=Local Office Name.
 */
  async getFirstDialogRowText(): Promise<{ localOffice: string; localOfficeName: string }> {
    const table = this.getElement('tblDlgResults');
    const cells = await table.locator('tbody tr:first-child td').allTextContents();
    return {
      localOffice: (cells[1] ?? '').trim(),
      localOfficeName: (cells[2] ?? '').trim(),
    };
  }

 /** Click the row checkbox on the first visible row in the dialog results table. */
  async selectFirstDialogRow(): Promise<void> {
    const table = this.getElement('tblDlgResults');
    const checkbox = table.locator('tbody tr:first-child [role="checkbox"][aria-label="Select row"]');
    await checkbox.waitFor({ state: 'visible', timeout: 5_000 });
 // Dialog table has sticky header (z-20) that intercepts pointer events on first row.
 // Use dispatchEvent to programmatically click the checkbox, bypassing the overlay.
    await checkbox.dispatchEvent('click');
    Log.info('Selected first dialog row');
  }

 /** Click the dialog Select button and wait for the dialog to close. */
  async clickDialogSelect(): Promise<void> {
    await this.getElement('btnDlgSelect').click();
    await this.getElement('dlgChangeLocalOffice').waitFor({ state: 'hidden', timeout: 5_000 });
    Log.info('Dialog Select confirmed, dialog closed');
  }

 /** Click the dialog Cancel button and wait for the dialog to close. */
  async clickDialogCancel(): Promise<void> {
    await this.getElement('btnDlgCancel').click();
    await this.getElement('dlgChangeLocalOffice').waitFor({ state: 'hidden', timeout: 5_000 });
    Log.info('Dialog Cancel clicked, dialog closed');
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // NON-SELF ROW OPERATIONS (DYNAMIC ROW INDEX)
 // ─────────────────────────────────────────────────────────────────────────────

 /**
 * Inspect a data row by 1-based index (row 1 = self, row 2 = first added location, etc.).
 * Returns Primary Office and Shares Inventory checkbox states plus whether Delete is enabled.
 * Dynamic selectors are composed from the table base selector via getLocator.
 */
  async getNonSelfRowState(rowIndex: number): Promise<{
    primaryOffice: CheckboxState;
    sharesInventory: CheckboxState;
    deleteEnabled: boolean;
  }> {
    const tbl = this.getLocator('tblSharedSetupLocations');
    const row = `${tbl} tbody tr:nth-child(${rowIndex})`;
    const primaryEl = this.page.locator(`${row} td:nth-child(3) [role="checkbox"]`);
    const sharesEl = this.page.locator(`${row} td:nth-child(4) [role="checkbox"]`);
    const deleteEl = this.page.locator(`${row} td:nth-child(5) button`);

    const priChecked = (await primaryEl.getAttribute('aria-checked')) === 'true';
    const priDisabled = await primaryEl.isDisabled().catch(() => true);
    const shrChecked = (await sharesEl.getAttribute('aria-checked')) === 'true';
    const shrDisabled = await sharesEl.isDisabled().catch(() => true);
    const delDisabled = await deleteEl.isDisabled().catch(() => true);

    return {
      primaryOffice: { checked: priChecked, disabled: priDisabled },
      sharesInventory: { checked: shrChecked, disabled: shrDisabled },
      deleteEnabled: !delDisabled,
    };
  }

 /**
 * Click the Delete button for the given 1-based data row index.
 * Deletion is instant with no confirmation dialog.
 */
  async deleteNonSelfRow(rowIndex: number): Promise<void> {
    const tbl = this.getLocator('tblSharedSetupLocations');
    const deleteBtn = this.page.locator(`${tbl} tbody tr:nth-child(${rowIndex}) td:nth-child(5) button`);
    await deleteBtn.click();
    Log.info(`Deleted row at index ${rowIndex}`);
  }

 /** Get Local Office number and Name from a non-self row by 1-based index. */
  async getNonSelfRowText(rowIndex: number): Promise<{ localOffice: string; localOfficeName: string }> {
    const tbl = this.getLocator('tblSharedSetupLocations');
    const cells = await this.page.locator(`${tbl} tbody tr:nth-child(${rowIndex}) td`).allTextContents();
    return {
      localOffice: (cells[0] ?? '').trim(),
      localOfficeName: (cells[1] ?? '').trim(),
    };
  }

 /** Click the Shares Inventory checkbox on a non-self row to toggle it. */
  async toggleNonSelfSharesInventory(rowIndex: number): Promise<void> {
    const tbl = this.getLocator('tblSharedSetupLocations');
    const checkbox = this.page.locator(`${tbl} tbody tr:nth-child(${rowIndex}) td:nth-child(4) [role="checkbox"]`);
    await checkbox.click();
    Log.info(`Toggled non-self Shares Inventory at row ${rowIndex}`);
  }

 /** Idempotently set non-self Shares Inventory to target state. */
  async setNonSelfSharesInventory(rowIndex: number, checked: boolean): Promise<void> {
    const tbl = this.getLocator('tblSharedSetupLocations');
    const checkbox = this.page.locator(`${tbl} tbody tr:nth-child(${rowIndex}) td:nth-child(4) [role="checkbox"]`);
    const current = (await checkbox.getAttribute('aria-checked')) === 'true';
    if (current !== checked) {
      await checkbox.click();
      Log.info(`Set non-self SI row ${rowIndex} to ${checked}`);
    }
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // TOP-LEVEL TAB NAVIGATION + DIRTY-STATE HELPERS (TC-028 K1b in-SPA tab switch)
 // ─────────────────────────────────────────────────────────────────────────────

 /** Toggle self SI to make the SSL form dirty (semantic wrapper used by TC-028). */
  async makeFormDirty(): Promise<void> {
    await this.toggleSelfSharesInventory();
  }

 /** Click a top-level tab by selector key (e.g. 'tabBasicInformation', 'tabLocationManagementHistory'). */
  async clickTopLevelTab(tabKey: 'tabBasicInformation' | 'tabLocationManagementHistory'): Promise<void> {
    const tab = this.getElement(tabKey);
    await tab.click();
    // Fix #4b: wait for Radix to transition aria-selected
    // BEFORE returning. Pre-fix, clickTopLevelTab returned immediately after click() —
    // callers raced against the panel-switch animation + content hydration.
    await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 10_000 });
    await this.waitForAngularStable();
    Log.info(`Clicked top-level tab: ${tabKey}`);
  }

 /**
 * Return the label of the currently active top-level tab.
 * Group D-3 (lifecycle refactor 2026-05-21): scope to the two
 * known top-level testids instead of `[role="tab"][aria-selected="true"]`.first(),
 * which also matches sub-tabs (Currency / Notes / etc.) and was order-dependent.
 */
  async getActiveTopLevelTab(): Promise<string> {
    const candidates: Array<'tabBasicInformation' | 'tabLocationManagementHistory'> = [
      'tabBasicInformation',
      'tabLocationManagementHistory',
    ];
    for (const key of candidates) {
      const el = this.getElement(key);
      const aria = await el.getAttribute('aria-selected').catch(() => null);
      if (aria === 'true') {
        return ((await el.textContent()) ?? '').trim();
      }
    }
    return '';
  }

 /** Return true if the Unsaved Changes alertdialog is visible within timeoutMs. */
  async hasVisibleUnsavedDialog(timeoutMs: number = 1_500): Promise<boolean> {
    return this.isElementVisible('dlgUnsavedChanges', timeoutMs);
  }

 /** Click the "Stay" button on the Unsaved Changes alertdialog (keeps user on current view). */
  async clickUnsavedDialogStay(timeoutMs: number = 5_000): Promise<void> {
    const dlg = this.getElement('dlgUnsavedChanges');
    await dlg.waitFor({ state: 'visible', timeout: timeoutMs });
    await this.getElement('btnUnsavedChangesCancel').click();
    await dlg.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // RAPID-CLICK HELPER (TC-029 K2 dialog stacking guard)
 // ─────────────────────────────────────────────────────────────────────────────

 /**
 * Fire `count` click events on the Add button back-to-back with `intervalMs` between each,
 * WITHOUT awaiting dialog visibility between clicks. After the burst, wait for at most one
 * dialog to settle. Used by TC-029 to assert single-dialog behavior under rapid clicks.
 */
  async rapidClickAdd(count: number = 5, intervalMs: number = 50): Promise<void> {
    const addBtn = this.getElement('btnSharedAdd');
    for (let i = 0; i < count; i++) {
      await addBtn.click({ force: true, noWaitAfter: true }).catch((err: Error) => {
        // Only swallow overlay-intercept-class errors (expected for late clicks while dialog is open).
        // Anything else (element not found, detached, target closed) must propagate so TC-029 fails with the real cause.
        if (!/intercepts pointer events|element is not visible|outside of the viewport|Target page, context or browser has been closed/i.test(err.message)) {
          throw err;
        }
      });
      if (i < count - 1 && intervalMs > 0) {
        await new Promise(r => setTimeout(r, intervalMs));
      }
    }
    Log.info(`rapidClickAdd: fired ${count} clicks at ${intervalMs}ms intervals`);
  }

 /** Count the number of Change Local Office dialogs currently in the DOM (used by TC-029). */
  async countAddDialogs(): Promise<number> {
    const c = await this.getElement('dlgChangeLocalOffice').count();
    return c;
  }
}
