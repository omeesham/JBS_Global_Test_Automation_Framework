/**
 * @agent-doc
 * PURPOSE: Location Shared Setup Locations Tab Page Object -- shared-location table CRUD,
 *          Shares Inventory toggle, Add dialog search/select, and non-self row state
 *          verification (Setup > Location > [Office] > Shared Setup Locations tab).
 * OWNER: generator
 * IMPACT: medium -- Shared Setup Locations tab tests depend on this.
 * DEPENDS-ON: BasePage, LocationSettingsSelectors, logger.ts, framework-contracts/index.ts
 * USED-BY: tests/specs/setup/locations/location-shared-setup-locations.spec.ts, fixtures.ts
 * RULES: Never use raw page.* in specs. All named selectors from src/selectors/index.ts.
 *        Dynamic row selectors (non-self rows) are composed from the table base selector
 *        via getLocator() and extended with nth-child -- this is acceptable for dynamic rows.
 *        All mutating tests MUST call clickSave() + cleanup before exiting.
 *        Live behavior (2026-03-19): Self-row Primary Office=checked+disabled, Delete=disabled.
 *        Non-self rows: Primary Office=unchecked+disabled, Shares Inventory=checked+editable.
 *        Delete is instant (no confirmation dialog).
 */

import { Page } from '@playwright/test';
import { BasePage } from '../../../common/base-page';
import { Log } from '../../../utils/logger';
import { IConfig } from '../../../framework-contracts';
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

  /** Full page reload (for persistence verification), then re-navigates to the tab. */
  async reloadPage(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
    await this.waitForAngularStable();
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

  /** Click the left-panel Save and confirm the Save Changes dialog. Delegates to BasePage.clickSaveWithDialog. */
  async clickSave(): Promise<{ success: boolean; networkError?: string }> {
    return this.clickSaveWithDialog('btnSave');
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
   * Dynamic selectors are composed from the table base selector via getLocator().
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
}
