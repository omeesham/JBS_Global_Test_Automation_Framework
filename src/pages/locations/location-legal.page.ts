/**
 * @agent-doc
 * PURPOSE: Location Legal Tab Page Object -- Legal grid inspection, combobox operations,
 *          save flow, and persistence verification
 *          (Setup > Location > [Office] > Legal tab).
 * OWNER: generator
 * IMPACT: medium -- Legal tab tests depend on this; changes affect all legal specs.
 * DEPENDS-ON: BasePage, SetupLegalSelectors, SetupSharedSelectors, logger.ts, framework-contracts/index.ts
 * USED-BY: tests/specs/locations/location-legal.spec.ts, fixtures.ts
 * RULES: Never use raw page.* in specs. All selectors from src/selectors/index.ts.
 *        All mutating tests MUST cleanup (revert + save or reload) before exiting.
 *        Live behavior (2026-03-18): 1 row (US English), SC = "Resort Service Charge", T&C = "LDW".
 *        Dirty-state does NOT track net-zero: reverting to original still shows dirty.
 *        NO dedicated Legal Save -- uses shared left-panel Save [data-testid=location-settings-btn-save].
 */

import { Page } from '@playwright/test';
import { BasePage } from '../../common/base-page';
import { Log } from '../../utils/logger';
import { IConfig } from '../../framework-contracts';

export class LocationLegalPage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
    Log.info('LocationLegalPage initialized');
  }

  // ---------------------------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------------------------

  /** Navigate to Legal tab for the given office. */
  async navigateToLegalTab(officeNo: string = '1604'): Promise<void> {
    await this.navigateToSubTab('tabLegal', 'contentLegal', officeNo);
  }

  /** Click Legal tab only (assumes already on location settings page). */
  async clickLegalTab(): Promise<void> {
    await this.clickWithRetry('tabLegal');
    await this.getElement('contentLegal').waitFor({ state: 'visible', timeout: 15_000 });
  }

  /** Reload page and return to Legal tab. Handles potential beforeunload dialog. */
  async reloadAndNavigateToLegalTab(): Promise<void> {
    const handler = async (d: import('@playwright/test').Dialog) => {
      try { await d.accept(); } catch { /* dialog may already be handled */ }
    };
    this.page.on('dialog', handler);
    try {
      await this.page.reload({ waitUntil: 'networkidle', timeout: 30_000 });
    } finally {
      this.page.removeListener('dialog', handler);
    }
    await this.clickLegalTab();
  }

  // ---------------------------------------------------------------------------
  // GRID INSPECTION
  // ---------------------------------------------------------------------------

  /** Count the number of data rows in the Legal grid (excludes header row). */
  async getGridRowCount(): Promise<number> {
    const grid = this.getElement('tblLegal');
    await grid.waitFor({ state: 'visible', timeout: 5_000 });
    const rows = await grid.locator('tbody tr').count();
    Log.info(`Legal grid rows: ${rows}`);
    return rows;
  }

  /** Get visible column header texts from the Legal table. */
  async getColumnHeaders(): Promise<string[]> {
    const grid = this.getElement('tblLegal');
    await grid.waitFor({ state: 'visible', timeout: 5_000 });
    const headers = await grid.locator('thead th').allTextContents();
    return headers.map(h => h.trim()).filter(h => h.length > 0);
  }

  /** Get the Language Name text from the given row (0-indexed). */
  async getLanguageName(row: number = 0): Promise<string> {
    const grid = this.getElement('tblLegal');
    const cell = grid.locator(`tbody tr`).nth(row).locator('td').first();
    return (await cell.textContent() || '').trim();
  }

  /** Check if Language Name cell at given row is read-only (no interactive elements). */
  async isLanguageNameReadOnly(row: number = 0): Promise<boolean> {
    const grid = this.getElement('tblLegal');
    const cell = grid.locator(`tbody tr`).nth(row).locator('td').first();
    const interactiveCount = await cell.locator('button, input, textarea, select, [role="combobox"], [contenteditable="true"]').count();
    return interactiveCount === 0;
  }

  // ---------------------------------------------------------------------------
  // COMBOBOX OPERATIONS
  // ---------------------------------------------------------------------------

  /** Get current Service Charge Name display value. */
  async getServiceChargeValue(): Promise<string> {
    return this.getFieldDisplayValue('drpLegalServiceCharge0');
  }

  /** Get current Terms and Conditions Name display value. */
  async getTermsValue(): Promise<string> {
    return this.getFieldDisplayValue('drpLegalTerms0');
  }

  /** Get all Service Charge dropdown options. Opens/closes dropdown. */
  async getServiceChargeOptions(): Promise<string[]> {
    return this.getComboboxOptions('drpLegalServiceCharge0');
  }

  /** Get all Terms and Conditions dropdown options. Opens/closes dropdown. */
  async getTermsOptions(): Promise<string[]> {
    return this.getComboboxOptions('drpLegalTerms0');
  }

  /** Select a Service Charge option by exact text. */
  async selectServiceCharge(optionText: string): Promise<void> {
    await this.selectComboboxOptionExact('drpLegalServiceCharge0', optionText);
  }

  /** Select a Terms and Conditions option by exact text. */
  async selectTerms(optionText: string): Promise<void> {
    await this.selectComboboxOptionExact('drpLegalTerms0', optionText);
  }

  /**
   * Exact-match combobox option selection.
   * BasePage.selectComboboxOption uses :has-text() (contains match) which fails when
   * multiple options share substrings (e.g. "Administrative Fee" matches 4 options).
   * This uses getByRole with exact:true for unambiguous selection.
   */
  private async selectComboboxOptionExact(dropdownKey: string, optionText: string): Promise<void> {
    await this.getElement(dropdownKey).click();
    const listbox = this.page.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible', timeout: 5_000 });
    await listbox.getByRole('option', { name: optionText, exact: true }).click();
    Log.info(`[OK] Selected exact option "${optionText}" for ${dropdownKey}`);
  }

  /**
   * Check if a combobox dropdown has a search/filter input.
   * Opens dropdown, checks for input/search elements, closes it.
   */
  async hasDropdownSearch(dropdownKey: string): Promise<boolean> {
    await this.getElement(dropdownKey).click();
    const listbox = this.page.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible', timeout: 5_000 });
    const searchCount = await listbox.locator('input, [type="search"], [cmdk-input]').count();
    await this.page.keyboard.press('Escape');
    await listbox.waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => {});
    return searchCount > 0;
  }

  /**
   * Open a combobox, verify the checked option, close it. Returns the checked option text.
   */
  async getCheckedOption(dropdownKey: string): Promise<string | null> {
    await this.getElement(dropdownKey).click();
    const listbox = this.page.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible', timeout: 5_000 });
    const checked = listbox.locator('[role="option"][data-state="checked"]');
    const text = await checked.count() > 0 ? (await checked.textContent() || '').trim() : null;
    await this.page.keyboard.press('Escape');
    await listbox.waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => {});
    return text;
  }

  // ---------------------------------------------------------------------------
  // SAVE OPERATIONS
  // ---------------------------------------------------------------------------

  /** Check if the shared left-panel Save button is enabled. */
  async isSaveEnabled(): Promise<boolean> {
    const el = this.getElement('btnSaveLegal');
    const disabled = await el.isDisabled().catch(() => true);
    return !disabled;
  }

  /** Click Save and confirm the Save Changes dialog. Waits for save to be enabled first. */
  async clickSave(): Promise<{ success: boolean; networkError?: string }> {
    await this.waitForSaveEnabled('btnSaveLegal');
    return this.clickSaveWithDialog('btnSaveLegal', 'dlgSaveChanges', 'btnSaveChangesConfirm');
  }

  /** Click Save, detect dialog type, return it (caller dismisses). */
  async clickSaveAndGetDialog(): Promise<'save-changes' | 'none'> {
    const el = this.getElement('btnSaveLegal');
    await el.waitFor({ state: 'visible', timeout: 5_000 });
    if (await el.isDisabled()) return 'none';
    await el.click();
    const dialog = this.getElement('dlgSaveChanges');
    const visible = await dialog.waitFor({ state: 'visible', timeout: 5_000 }).then(() => true).catch(() => false);
    return visible ? 'save-changes' : 'none';
  }

  /** Cancel the Save Changes dialog. */
  async cancelSaveDialog(): Promise<void> {
    const dialog = this.getElement('dlgSaveChanges');
    if (await dialog.isVisible().catch(() => false)) {
      await this.getElement('btnSaveChangesCancel').click();
      await dialog.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
    }
  }

  // ---------------------------------------------------------------------------
  // BEFOREUNLOAD
  // ---------------------------------------------------------------------------

  /**
   * Attempt page reload. Returns true if a beforeunload dialog fired (dismissed -- stayed on page).
   * Useful for TC-014 to verify dirty state triggers beforeunload.
   */
  async triggerBeforeunloadAndStay(): Promise<boolean> {
    let dialogFired = false;
    const handler = async (d: import('@playwright/test').Dialog) => {
      dialogFired = true;
      try { await d.dismiss(); } catch { /* already handled */ }
    };
    this.page.on('dialog', handler);
    try {
      // Trigger reload which fires beforeunload; dismiss keeps us on page
      await this.page.reload({ timeout: 5_000 }).catch(() => {});
    } finally {
      this.page.removeListener('dialog', handler);
    }
    return dialogFired;
  }
}
