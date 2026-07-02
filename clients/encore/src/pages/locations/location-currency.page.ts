import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { Log } from '../../utils/logger';
import { IConfig } from '../../types';
import { LocationSettingsSelectors } from '../../selectors';
import { CheckboxState } from '../components/location-form-helpers.component';
import { MERCHANT_DATA } from '../../data/locations/location-currency';

/** Type returned by clickSaveAndCaptureDialog */
export type SaveDialogType = 'save-changes' | 'error' | 'none' | 'disabled';

export class LocationCurrencyPage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
    Log.info('LocationCurrencyPage initialized');
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // NAVIGATION
 // ─────────────────────────────────────────────────────────────────────────────

 /**
 * Navigate to the Currency tab for the given office.
 * Delegates to BasePage.navigateToSubTab (shared tab nav pattern).
 */
  async navigateToCurrencyTab(officeNo: string = '1604'): Promise<void> {
    await this.navigateToSubTab('tabCurrency', 'tblCurrencyGrid', officeNo);
  }

 /**
 * Group D-2 (lifecycle refactor 2026-05-21): DOM-presence guard so
 * beforeEach can avoid re-navigating when already on the tab.
 */
  async isOnCurrencyTab(): Promise<boolean> {
    // Fix #4a: use tab trigger aria-selected, not
    // child-anchor count(). Mirrors base-page.ts:448.
    const tab = this.getElement('tabCurrency');
    if ((await tab.count()) === 0) return false;
    return (await tab.getAttribute('aria-selected').catch(() => null)) === 'true';
  }

 /** Reload page and return to Currency tab. Handles potential beforeunload dialog. */
  async reloadAndNavigateToCurrencyTab(): Promise<void> {
    const handler = async (d: import('@playwright/test').Dialog) => {
      try { await d.accept(); } catch { /* dialog may already be handled */ }
    };
    this.page.on('dialog', handler);
    try {
      await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
    } finally {
      this.page.removeListener('dialog', handler);
    }
    await this.waitForAngularStable();
    await this.clickWithRetry('tabCurrency');
    await this.getElement('tblCurrencyGrid').waitFor({ state: 'visible', timeout: 15_000 });
    await this.waitForAngularStable();
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // GRID INSPECTION
 // ─────────────────────────────────────────────────────────────────────────────

 /** Count the number of currency rows in the grid (excludes header row). */
  async getGridRowCount(): Promise<number> {
    const grid = this.getElement('tblCurrencyGrid');
    await grid.waitFor({ state: 'visible', timeout: 5_000 });
    const rows = await grid.locator('tbody tr').count();
    Log.info(`Currency grid rows: ${rows}`);
    return rows;
  }

 /** Get the visible text of all 4 column headers. Delegates to the shared BasePage helper. */
  async getColumnHeaders(): Promise<string[]> {
    return this.getColumnHeadersByKeys(['colHeaderCurrencyCode', 'colHeaderSelected', 'colHeaderIsDefault', 'colHeaderMerchant']);
  }

 /** Check if the Currency Code cell for a given currency is read-only (not an input). */
  async isCurrencyCodeReadOnly(currency: string): Promise<boolean> {
    const gridSel = this.getLocator('tblCurrencyGrid');
    const cell = this.page.locator(`${gridSel} tbody tr:has-text("${currency}") td:first-child`);
    const inputCount = await cell.locator('input, textarea, [contenteditable="true"]').count();
    Log.info(`${currency} code cell editable inputs: ${inputCount}`);
    return inputCount === 0;
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // CHECKBOX OPERATIONS
 // ─────────────────────────────────────────────────────────────────────────────

 /** Get checked/disabled state of a currency checkbox (Selected or Is Default). */
  async getCheckboxState(selectorKey: keyof typeof LocationSettingsSelectors): Promise<CheckboxState> {
    const state = await this.getRadixCheckboxState(selectorKey);
    Log.info(`${selectorKey}: checked=${state.checked}, disabled=${state.disabled}`);
    return state;
  }

 /** Ensure checkbox is checked (click only if unchecked). */
  async checkCheckbox(selectorKey: keyof typeof LocationSettingsSelectors): Promise<void> {
    const el = this.getElement(selectorKey);
    if (!(await this.getRadixCheckboxState(selectorKey)).checked) {
      await el.click();
    }
    Log.info(`Checked: ${selectorKey}`);
  }

 /** Ensure checkbox is unchecked (click only if checked). */
  async uncheckCheckbox(selectorKey: keyof typeof LocationSettingsSelectors): Promise<void> {
    const el = this.getElement(selectorKey);
    if ((await this.getRadixCheckboxState(selectorKey)).checked) {
      await el.click();
    }
    Log.info(`Unchecked: ${selectorKey}`);
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // MERCHANT DROPDOWN OPERATIONS
 // ─────────────────────────────────────────────────────────────────────────────

 /** Get the current displayed value of a merchant dropdown. Delegates to the shared BasePage helper. */
  async getMerchantValue(dropdownKey: string): Promise<string> {
    return this.getFieldDisplayValue(dropdownKey);
  }

 /** Open a merchant dropdown, collect option texts, close it, return the list (delegates to BasePage.getComboboxOptions — trims + filters empties). */
  async getMerchantOptions(dropdownKey: string): Promise<string[]> {
    const options = await this.getComboboxOptions(dropdownKey);
    Log.info(`Merchant options for ${dropdownKey}: ${options.join(', ')}`);
    return options;
  }

 /**
 * Open the merchant dropdown and check if it is accessible (listbox appears).
 * Also checks if "No Matches Found" is present. Closes the dropdown after.
 * Retry carve-out: visibility probe, not option-select. Helper signature is select-only; probe semantics differ.
 */
  async isMerchantDropdownAccessible(dropdownKey: string): Promise<boolean> {
    await this.getElement(dropdownKey).click();
    await this.waitForAngularStable();
    const listbox = this.page.locator('[role="listbox"]');
    const visible = await listbox.isVisible().catch(() => false);
    await this.page.keyboard.press('Escape');
    await listbox.waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => {});
    Log.info(`${dropdownKey} accessible: ${visible}`);
    return visible;
  }

 /**
 * Open the merchant dropdown and check if "No Matches Found" text is displayed.
 * Closes the dropdown after checking.
 * Retry carve-out: text-substring probe, not option-select. Helper signature is select-only; probe semantics differ.
 */
  async isMerchantNoMatchesFound(dropdownKey: string): Promise<boolean> {
    await this.getElement(dropdownKey).click();
    await this.waitForAngularStable();
    const listbox = this.page.locator('[role="listbox"]');
    const visible = await listbox.isVisible().catch(() => false);
    if (!visible) { await this.page.keyboard.press('Escape'); return false; }
    const text = await listbox.textContent().catch(() => '');
    await this.page.keyboard.press('Escape');
    await listbox.waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => {});
    const noMatches = (text || '').includes('No Matches Found');
    Log.info(`${dropdownKey} No Matches Found: ${noMatches}`);
    return noMatches;
  }

 /** Select a merchant option by its text label. */
  async selectMerchantOption(dropdownKey: string, optionText: string): Promise<void> {
    await this.getElement(dropdownKey).click();
    await this.waitForAngularStable();
    const option = this.page.locator(`[role="listbox"] [role="option"]:has-text("${optionText}")`);
    await option.waitFor({ state: 'visible', timeout: 5_000 });
    await option.click();
    Log.info(`Selected merchant option: ${optionText}`);
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // SAVE / ERROR
 // ─────────────────────────────────────────────────────────────────────────────

 /** Check if the Currency Save button is enabled. */
  async isSaveEnabled(): Promise<boolean> {
    const el = this.getElement('btnSaveCurrency');
    const disabled = await el.isDisabled().catch(() => true);
    Log.info(`Currency Save enabled: ${!disabled}`);
    return !disabled;
  }

 /**
 * Click the Currency Save button and confirm dialog if it appears.
 * Delegates to BasePage.clickSaveWithDialog (shared save dialog pattern).
 */
  async clickSave(): Promise<{ success: boolean; saved?: boolean; networkError?: string }> {
    return this.clickSaveWithDialog('btnSaveCurrency');
  }

 /**
 * Click Save, then detect whether the result is a Save Changes dialog, an Error dialog,
 * or neither. Caller must dismiss via cancelCurrentDialog / confirmSaveDialog.
 * Returns 'disabled' when the Save button was disabled (no save ran) -- distinct from 'none', which means a save ran but no dialog appeared.
 */
  async clickSaveAndCaptureDialog(): Promise<SaveDialogType> {
    const el = this.getElement('btnSaveCurrency');
    await el.waitFor({ state: 'visible', timeout: 5_000 });
    if (await el.isDisabled()) {
      Log.info('Save button disabled -- no save performed (distinct from no-dialog)');
      return 'disabled';
    }
    // Clear any error dialog left open by a prior action, so a stale error cannot be misread as THIS
    // save's result.
    const errorDialog = this.getElement('dlgErrorDialog');
    if (await errorDialog.isVisible().catch(() => false)) {
      await this.getElement('btnErrorOk').click().catch(() => {});
      await errorDialog.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
    }
    await el.click();
    const saveDialog = this.getElement('dlgSaveChanges');
    const saveVisible = await saveDialog.waitFor({ state: 'visible', timeout: 5_000 }).then(() => true).catch(() => false);
    if (saveVisible) { Log.info('Save Changes dialog appeared'); return 'save-changes'; }
    // Wait briefly for a possibly late-rendering error dialog instead of a single zero-wait snapshot.
    const errorVisible = await errorDialog.waitFor({ state: 'visible', timeout: 2_000 }).then(() => true).catch(() => false);
    if (errorVisible) { Log.info('Error dialog appeared'); return 'error'; }
    Log.info('No dialog appeared after Save');
    return 'none';
  }

 /** Cancel the currently visible Save Changes dialog (if any). */
  async cancelCurrentDialog(): Promise<void> {
    const dialog = this.getElement('dlgSaveChanges');
    if (await dialog.isVisible().catch(() => false)) {
      await this.getElement('btnSaveChangesCancel').click();
      await dialog.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
    }
  }

 /** Confirm the currently visible Save Changes dialog and wait for network idle. */
  async confirmSaveDialog(): Promise<void> {
    const dialog = this.getElement('dlgSaveChanges');
    if (await dialog.isVisible().catch(() => false)) {
      await this.getElement('btnSaveChangesConfirm').click();
      await dialog.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
      await this.waitForAngularStable();
    }
  }

 /**
 * Get the error message from the error dialog (if visible), then dismiss it.
 * Returns empty string if no error dialog is present.
 */
  async getDialogErrorText(): Promise<string> {
    const el = this.getElement('dlgErrorMessage');
    const visible = await el.isVisible().catch(() => false);
    if (!visible) return '';
    const text = ((await el.textContent().catch(() => '')) ?? '').trim();
    await this.getElement('btnErrorOk').click().catch(() => {});
    await this.getElement('dlgErrorDialog').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
    Log.info(`Error dialog text: ${text}`);
    return text;
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // DEFAULT-STATE BASELINE
 // ─────────────────────────────────────────────────────────────────────────────

 /**
 * Click Save, confirm the dialog, and throw if the save did not succeed.
 * A void-returning wrapper around clickSave() for callers that want a save
 * failure to surface as an error rather than a {success:false} flag.
 */
  async saveAndConfirm(): Promise<void> {
    const result = await this.clickSave();
    if (!result.success) {
      throw new Error(`Currency save did not succeed${result.networkError ? `: ${result.networkError}` : ''}`);
    }
  }

 /**
 * Enforce the known default grid state for office 1604 before a test runs.
 * Default = USD selected + USD set as default, CAD and MXN unselected, USD merchant
 * set to the office default. No-ops when the grid is already at the default.
 *
 * Uses a bounded retry (max 3): read the grid, and if it has drifted, reset the
 * fields, save, RELOAD, and re-read. The reload + re-read is required because the
 * Save button reports success even when it is disabled, so saving alone never
 * proves the reset actually landed — only reading the reloaded grid does. Throws
 * if the grid is still drifted after 3 attempts so a broken baseline fails loudly
 * instead of letting later tests run from a dirty starting state.
 */
  async ensureDefaultState(): Promise<void> {
    const MAX_ATTEMPTS = 3;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      if (await this.isAtDefaultState()) return;
      // Re-select USD first so its Is-Default checkbox becomes enabled, set USD as the
      // single default (this clears any other default), then clear CAD/MXN selections.
      await this.checkCheckbox('chkUSDSelected');
      await this.checkCheckbox('chkUSDIsDefault');
      await this.uncheckCheckbox('chkCADSelected');
      await this.uncheckCheckbox('chkMXNSelected');
      if (!(await this.getMerchantValue('drpUSDMerchant')).includes(MERCHANT_DATA.usd.id)) {
        await this.selectMerchantOption('drpUSDMerchant', MERCHANT_DATA.usd.display);
      }
      if (await this.isSaveEnabled()) {
        await this.saveAndConfirm();
      }
      await this.reloadAndNavigateToCurrencyTab();
    }
    if (!(await this.isAtDefaultState())) {
      throw new Error('Currency baseline could not be enforced after 3 attempts (grid still drifted from the USD default state)');
    }
  }

 /** Read the grid and report whether it currently matches the office default state. */
  async isAtDefaultState(): Promise<boolean> {
    const usdSelected = await this.getCheckboxState('chkUSDSelected');
    const usdDefault = await this.getCheckboxState('chkUSDIsDefault');
    const cadSelected = await this.getCheckboxState('chkCADSelected');
    const mxnSelected = await this.getCheckboxState('chkMXNSelected');
    const usdMerchant = await this.getMerchantValue('drpUSDMerchant');
    return usdSelected.checked && usdDefault.checked
      && !cadSelected.checked && !mxnSelected.checked
      && usdMerchant.includes(MERCHANT_DATA.usd.id);
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // BEFOREUNLOAD
 // ─────────────────────────────────────────────────────────────────────────────

 /**
 * Attempt page reload. Returns true if a beforeunload dialog fired (dismissed — stayed on page).
 * Useful for TC-LOC-CUR-026 to verify dirty state triggers beforeunload.
 */
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

}
