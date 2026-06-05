import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { Log } from '../../utils/logger';
import { IConfig } from '../../types';

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

 /**
 * Group D-2 (lifecycle refactor 2026-05-21): DOM-presence guard so
 * beforeEach can avoid re-navigating when already on the tab.
 */
  async isOnLegalTab(): Promise<boolean> {
    // Fix #4a (radix-tab-dom 2026-05-22):
    // contentLegal is a panel-wrapper testid that Radix keeps mounted across all tab
    // states (count() > 0 returns TRUE even when Legal is inactive). The tab trigger's
    // aria-selected is the only reliable signal — mirrors base-page.ts:448.
    const tab = this.getElement('tabLegal');
    if ((await tab.count()) === 0) return false;
    return (await tab.getAttribute('aria-selected').catch(() => null)) === 'true';
  }

 /** Click Legal tab only (assumes already on location settings page). */
  async clickLegalTab(): Promise<void> {
    await this.clickWithRetry('tabLegal');
    await this.getElement('contentLegal').waitFor({ state: 'visible', timeout: 15_000 });
    // D-1 (lifecycle refactor 2026-05-21): wait for row-0 service-charge dropdown
    // (content-level anchor) so we don't return on the wrapper alone while the Legal
    // table is still hydrating.
    // Fix #4c: dropped trailing .catch(Log.warn) so a missed
    // wait fails loudly at the click step (where the symptom is) instead of being swallowed.
    await this.getElement('drpLegalServiceCharge0')
      .waitFor({ state: 'visible', timeout: 15_000 });
    await this.waitForAngularStable();
  }

 /** Reload page and return to Legal tab. Handles potential beforeunload dialog. */
  async reloadAndNavigateToLegalTab(): Promise<void> {
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
    await this.clickLegalTab();
  }

 // ---------------------------------------------------------------------------
 // GRID INSPECTION
 // ---------------------------------------------------------------------------

 /** Count the number of data rows in the Legal grid (excludes header row). */
  async getGridRowCount(): Promise<number> {
    const grid = this.getElement('tblLegal');
    await grid.waitFor({ state: 'visible', timeout: 15_000 });
    const rows = await grid.locator('tbody tr').count();
    Log.info(`Legal grid rows: ${rows}`);
    return rows;
  }

 /** Get visible column header texts from the Legal table. */
  async getColumnHeaders(): Promise<string[]> {
    const grid = this.getElement('tblLegal');
    await grid.waitFor({ state: 'visible', timeout: 15_000 });
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
    await this.selectComboboxOption('drpLegalServiceCharge0', optionText, { exact: true });
  }

 /** Select a Terms and Conditions option by exact text. */
  async selectTerms(optionText: string): Promise<void> {
    await this.selectComboboxOption('drpLegalTerms0', optionText, { exact: true });
  }

 /**
 * Check if a combobox dropdown has a search/filter input.
 * Opens dropdown, checks for input/search elements, closes it.
 */
  async hasDropdownSearch(dropdownKey: string): Promise<boolean> {
    const listbox = await this.openComboboxListbox(dropdownKey);
    const searchCount = await listbox.locator('input, [type="search"], [cmdk-input]').count();
    await this.page.keyboard.press('Escape');
    await listbox.waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => {});
    return searchCount > 0;
  }

 // ---------------------------------------------------------------------------
 // FCC RUNNER HOOKS (field-case-runner.ts)
 // ---------------------------------------------------------------------------

 /**
 * FCC runner hook — saveAndConfirm shape required by `saveAndVerifyCase()`.
 * Wraps clickSave() and throws on failure so the runner surfaces server errors
 * as test failures (not silent `{success: false}` returns).
 */
  async saveAndConfirm(): Promise<void> {
    const result = await this.clickSave();
    if (!result.success) {
      throw new Error(`Legal save failed: ${result.networkError ?? 'unknown error'}`);
    }
  }

 /**
 * Baseline hook — restore SC + T&C to defaults if dirty. Used per-test by the
 * non-FCC `beforeEach` (LR-019) and as the FCC runner `baseline:`/`cleanup:` callback.
 *
 * Bounded retry (max 3) wraps the WHOLE cycle — read → re-select → save → reload →
 * re-verify — because the flaky step is the 114-option Radix SC select (LR-025): it can
 * "click successfully" yet leave the Angular model unchanged. A silent no-op leaves Save
 * disabled, and `clickSaveWithDialog` returns `{success:true}` when Save is disabled
 * (base-page.ts:360-363) — so save-success never proves the restore landed. The
 * post-reload re-read against the persisted DOM is the load-bearing check; if it still
 * shows non-default, the loop re-selects. After 3 failed cycles it throws, converting a
 * silent baseline failure into a loud one instead of letting the spec re-rot.
 */
  async ensureDefaultState(defaults: { serviceChargeName: string; termsName: string }): Promise<void> {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      let dirty = false;
      if (await this.getServiceChargeValue() !== defaults.serviceChargeName) {
        await this.selectServiceCharge(defaults.serviceChargeName);
        dirty = true;
      }
      if (await this.getTermsValue() !== defaults.termsName) {
        await this.selectTerms(defaults.termsName);
        dirty = true;
      }
      if (!dirty) return; // already at defaults — nothing to restore
      // saveAndConfirm() throws on a real 4xx/5xx (fail loud); a silent no-op (select
      // didn't propagate → Save disabled) returns without throwing — the re-verify below
      // catches that case and loops.
      await this.saveAndConfirm();
      await this.reloadAndNavigateToLegalTab();
      if (await this.getServiceChargeValue() === defaults.serviceChargeName
        && await this.getTermsValue() === defaults.termsName) {
        return;
      }
    }
    throw new Error(
      `ensureDefaultState: Legal SC/Terms not at defaults after ${maxAttempts} attempts`,
    );
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
    // A disabled Save here means the preceding change never dirtied the form — the
    // caller expected a save dialog, so fail loud rather than return an opaque 'none'
    // that masks the real symptom (diagnostic-only; baseline reset prevents reaching here).
    if (await el.isDisabled()) {
      throw new Error('clickSaveAndGetDialog: Save button is disabled — no change to save (expected a dirty form)');
    }
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
