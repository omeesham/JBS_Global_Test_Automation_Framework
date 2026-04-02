/**
 * @agent-doc
 * PURPOSE: Location Currency Tab Page Object -- currency selection, Is Default rules, merchant dropdowns,
 *          save/validation, and grid state verification (Setup > Location > [Office] > Currency tab).
 * OWNER: generator
 * IMPACT: medium -- Currency tab tests depend on this; changes affect all currency specs.
 * DEPENDS-ON: BasePage, LocationSettingsSelectors, logger.ts, framework-contracts/index.ts
 * USED-BY: tests/specs/setup/locations/location-currency.spec.ts, fixtures.ts
 * RULES: Never use raw page.* in specs. All selectors from src/selectors/index.ts.
 *        All mutating tests MUST call clickSave() + cleanup before exiting.
 *        Live behavior (2026-02-18): USD default=selected+isDefault; CAD/MXN unselected.
 *        Merchant always accessible regardless of Selected state.
 * NOTE: Extends BasePage directly (not LocationFormHelpers) by design.
 *       Currency has no spinbutton boundaries, no reload-verify-persistence orchestration,
 *       and uses dialog-based save flow unlike LI. ~13 lines of checkbox overlap is acceptable
 *       vs inheriting 200+ lines of unused LI-specific orchestrators.
 */

import { Page } from '@playwright/test';
import { BasePage } from '../../../common/base-page';
import { Log } from '../../../utils/logger';
import { IConfig } from '../../../framework-contracts';
import { LocationSettingsSelectors } from '../../../selectors';
import { CheckboxState } from './location-form-helpers.page';

/** Type returned by clickSaveAndCaptureDialog */
export type SaveDialogType = 'save-changes' | 'error' | 'none';

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
   * Delegates to BasePage.navigateToSubTab (ALL-020: shared tab nav pattern).
   */
  async navigateToCurrencyTab(officeNo: string = '1604'): Promise<void> {
    await this.navigateToSubTab('tabCurrency', 'tblCurrencyGrid', officeNo);
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

  /** Get the visible text of all 4 column headers. MNT-012: delegates to BasePage.getColumnHeadersByKeys. */
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
    const el = this.getElement(selectorKey);
    const checked = await el.isChecked().catch(() => false);
    const disabled = await el.isDisabled().catch(() => true);
    Log.info(`${selectorKey}: checked=${checked}, disabled=${disabled}`);
    return { checked, disabled };
  }

  /** Ensure checkbox is checked (click only if unchecked). */
  async checkCheckbox(selectorKey: keyof typeof LocationSettingsSelectors): Promise<void> {
    const el = this.getElement(selectorKey);
    if (!(await el.isChecked())) {
      await el.click();
    }
    Log.info(`Checked: ${selectorKey}`);
  }

  /** Ensure checkbox is unchecked (click only if checked). */
  async uncheckCheckbox(selectorKey: keyof typeof LocationSettingsSelectors): Promise<void> {
    const el = this.getElement(selectorKey);
    if (await el.isChecked()) {
      await el.click();
    }
    Log.info(`Unchecked: ${selectorKey}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MERCHANT DROPDOWN OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /** Get the current displayed value of a merchant dropdown. MNT-012: delegates to BasePage.getFieldDisplayValue. */
  async getMerchantValue(dropdownKey: string): Promise<string> {
    return this.getFieldDisplayValue(dropdownKey);
  }

  /** Open a merchant dropdown, collect option texts, close it, return the list. */
  async getMerchantOptions(dropdownKey: string): Promise<string[]> {
    await this.getElement(dropdownKey).click();
    await this.waitForAngularStable();
    const listbox = this.page.locator('[role="listbox"]');
    const isVisible = await listbox.isVisible().catch(() => false);
    if (!isVisible) {
      return [];
    }
    const options = await listbox.locator('[role="option"]').allTextContents();
    // Close dropdown
    await this.page.keyboard.press('Escape');
    await listbox.waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => {});
    Log.info(`Merchant options for ${dropdownKey}: ${options.join(', ')}`);
    return options.map(o => o.trim()).filter(o => o.length > 0);
  }

  /**
   * Open the merchant dropdown and check if it is accessible (listbox appears).
   * Also checks if "No Matches Found" is present. Closes the dropdown after.
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
   * Delegates to BasePage.clickSaveWithDialog (ALL-020: shared save dialog pattern).
   */
  async clickSave(): Promise<{ success: boolean; networkError?: string }> {
    return this.clickSaveWithDialog('btnSaveCurrency');
  }

  /**
   * Click Save, then detect whether the result is a Save Changes dialog, an Error dialog,
   * or neither. Caller must dismiss via cancelCurrentDialog() / confirmSaveDialog().
   */
  async clickSaveAndCaptureDialog(): Promise<SaveDialogType> {
    const el = this.getElement('btnSaveCurrency');
    await el.waitFor({ state: 'visible', timeout: 5_000 });
    if (await el.isDisabled()) {
      Log.info('Save button disabled -- cannot capture dialog');
      return 'none';
    }
    await el.click();
    const saveDialog = this.getElement('dlgSaveChanges');
    const saveVisible = await saveDialog.waitFor({ state: 'visible', timeout: 5_000 }).then(() => true).catch(() => false);
    if (saveVisible) { Log.info('Save Changes dialog appeared'); return 'save-changes'; }
    const errorDialog = this.getElement('dlgErrorDialog');
    const errorVisible = await errorDialog.isVisible().catch(() => false);
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

}
