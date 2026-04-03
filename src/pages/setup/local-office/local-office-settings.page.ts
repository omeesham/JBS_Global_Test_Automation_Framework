/**
 * @agent-doc
 * PURPOSE: Local Office Settings Page Object -- Basic Information, History, ECT Settings tabs.
 *          URL: /navigator/locations/{officeId}/settings/local-office
 * OWNER: generator
 * IMPACT: medium -- Local Office Settings tests depend on this.
 * DEPENDS-ON: BasePage, LocalOfficeSettingsSelectors, logger.ts, framework-contracts/index.ts
 * USED-BY: tests/specs/setup/local-office/*.spec.ts, fixtures.ts
 * RULES: Never use raw page.* in specs. All selectors via LocalOfficeSettingsSelectors (NOT ALL_SELECTORS).
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../common/base-page';
import { Log } from '../../../utils/logger';
import { IConfig } from '../../../framework-contracts';
import { LocalOfficeSettingsSelectors, getTsSelector } from '../../../selectors';
import { CheckboxState } from '../locations/location-form-helpers.page';

export class LocalOfficeSettingsPage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
  }

  /**
   * Override getElement to prefer Local Office selectors.
   * LocalOfficeSettingsSelectors is NOT in ALL_SELECTORS (colliding keys: btnSave, tabBasicInformation).
   * Falls back to global lookup for shared elements (dialogs, etc.).
   */
  protected getElement(elementName: string): Locator {
    const selector = (LocalOfficeSettingsSelectors as Record<string, string>)[elementName]
      ?? getTsSelector(elementName);
    if (!selector) throw new Error(`Selector '${elementName}' not found in Local Office or global selectors`);
    return this.page.locator(selector);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────────────────────────

  async navigateToBasicInfoTab(officeNo = '1604'): Promise<void> {
    await this.navigateToSubTab('tabBasicInformation', 'frmBasicInfo', officeNo, 'local-office');
  }

  async navigateToHistoryTab(): Promise<void> {
    const tab = this.getElement('tabHistory');
    const isSelected = await tab.getAttribute('aria-selected').catch(() => null);
    if (isSelected !== 'true') {
      await tab.click();
      await this.waitForAngularStable();
    }
    await this.getElement('tblHistory').waitFor({ state: 'visible', timeout: 15_000 });
  }

  /**
   * Navigate to ECT Settings tab with robust retry for intermittent API failures.
   *
   * RCA ECT-009/012: The ECT API intermittently returns "No currencies" or "No data available"
   * under load. Original retry loop had a bug: after the 3rd retry it didn't re-check whether
   * data loaded before falling through to lblEctLocationName.waitFor() → 30s timeout.
   *
   * Fix: unified retry loop that always checks AFTER each reload, with delay between retries
   * to give the API breathing room.
   */
  async navigateToEctTab(): Promise<void> {
    const maxRetries = 4;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      // Click the ECT tab if not already selected
      const tab = this.getElement('tabEctSettings');
      const isSelected = await tab.getAttribute('aria-selected').catch(() => null);
      if (isSelected !== 'true') {
        await this.dismissAlertDialogIfVisible();
        await tab.click();
        await this.waitForAngularStable();
      }

      // Check for API failure states
      const panelContent = await this.page.locator('[role="tabpanel"]').textContent().catch(() => '');
      const noCurrencies = panelContent?.includes('No currencies for selected location');
      const noData = panelContent?.includes('No data available');

      if (!noCurrencies && !noData) {
        // Check that location name label is visible (content loaded)
        const lblVisible = await this.getElement('lblEctLocationName')
          .waitFor({ state: 'visible', timeout: 5_000 })
          .then(() => true).catch(() => false);
        if (lblVisible) {
          // Verify table data actually loaded
          const table = this.getElement('tblLaborCostAssumptions');
          const hasData = await table.locator('tbody tr').count() > 1
            || !(await table.textContent() || '').includes('No data available');
          if (hasData) return; // Success — ECT tab fully loaded
        }
      }

      // If we've exhausted all retries, throw with context
      if (attempt === maxRetries) {
        throw new Error(`ECT tab failed to load after ${maxRetries} retries. Last state: ${noCurrencies ? '"No currencies"' : noData ? '"No data available"' : 'label not visible'}`);
      }

      Log.warn(`ECT tab not loaded (attempt ${attempt + 1}/${maxRetries + 1}) — retry via page reload`);
      await this.page.waitForTimeout(1_000); // Give API breathing room
      await this.dismissAlertDialogIfVisible();
      await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
      await this.waitForAngularStable();
      await this.dismissAlertDialogIfVisible();
    }
  }

  /** Dismiss Angular/Radix "Unsaved changes" alertdialog if visible. Returns true if dismissed. */
  async dismissAlertDialogIfVisible(): Promise<boolean> {
    const dialog = this.page.locator('[role="alertdialog"]');
    if (await dialog.isVisible().catch(() => false)) {
      const discardBtn = dialog.locator('button:has-text("Discard")');
      if (await discardBtn.isVisible().catch(() => false)) {
        await discardBtn.click();
        await dialog.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
        Log.info('Dismissed "Unsaved changes" alertdialog');
        return true;
      }
    }
    return false;
  }

  /** Reload page and navigate back to Basic Info tab.
   *  Uses safeNavigateTo to handle beforeunload dialog when form has unsaved edits (ALL-052). */
  async reloadBasicInfo(officeNo = '1604'): Promise<void> {
    const baseUrl = this.config?.base_url || '';
    await this.safeNavigateTo(`${baseUrl}locations/${officeNo}/settings/local-office`);
    await this.waitForAngularStable();
    await this.getElement('frmBasicInfo').waitFor({ state: 'visible', timeout: 15_000 });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SAVE — BASIC INFO (dialog-based: Yes/No)
  // ─────────────────────────────────────────────────────────────────────────────

  async isSaveEnabled(): Promise<boolean> {
    return !(await this.getElement('btnSave').isDisabled());
  }

  /** Poll until Save button becomes enabled (Angular dirty-state propagation). */
  async waitForSaveToEnable(timeout = 5_000): Promise<boolean> {
    return this.waitForSaveEnabled('btnSave', timeout);
  }

  /** Click Save and confirm via shared "Save Changes" dialog. Falls through if no dialog appears. */
  async clickSaveAndConfirm(): Promise<void> {
    await this.clickSaveWithDialog('btnSave', 'dlgSaveChanges', 'btnSaveChangesConfirm');
  }

  /** Click Save then click Cancel to dismiss. Returns false if no dialog appears. */
  async clickSaveAndCancel(): Promise<boolean> {
    await this.getElement('btnSave').click();
    const dlg = this.getElement('dlgSaveChanges');
    const visible = await dlg.waitFor({ state: 'visible', timeout: 5_000 })
      .then(() => true).catch(() => false);
    if (visible) {
      await this.getElement('btnSaveChangesCancel').click();
      await dlg.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
      return true;
    }
    return false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SAVE — ECT (no dialog — direct save)
  // ─────────────────────────────────────────────────────────────────────────────

  async isEctFixedCostsSaveEnabled(): Promise<boolean> {
    return !(await this.getElement('btnSaveFixedCosts').isDisabled());
  }

  async isEctLaborCostsSaveEnabled(): Promise<boolean> {
    return !(await this.getElement('btnSaveLaborCosts').isDisabled());
  }

  /**
   * Click Fixed Costs Save and wait for save to complete.
   * RCA ECT-012: waitForAngularStable resolves before the save HTTP response arrives.
   * Navigating immediately triggers "Unsaved changes" dialog (Angular dirty form).
   * Fix: poll until Save button disables — concrete signal that save completed and
   * form was marked pristine. Prevents race between save response and navigation.
   */
  async clickSaveFixedCosts(): Promise<void> {
    await this.getElement('btnSaveFixedCosts').click();
    await this.waitForAngularStable();
    await this.waitForSaveDisabled('btnSaveFixedCosts');
  }

  /**
   * Click Labor Costs Save and wait for save to complete.
   * Same race condition fix as clickSaveFixedCosts — see RCA ECT-012.
   */
  async clickSaveLaborCosts(): Promise<void> {
    await this.getElement('btnSaveLaborCosts').click();
    await this.waitForAngularStable();
    await this.waitForSaveDisabled('btnSaveLaborCosts');
  }

  /** Poll until a save button becomes disabled (form marked pristine after save). */
  private async waitForSaveDisabled(btnKey: string, timeout = 10_000): Promise<void> {
    const btn = this.getElement(btnKey);
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (await btn.isDisabled().catch(() => false)) {
        Log.info(`[OK] Save button disabled (${btnKey}) — save complete, form pristine`);
        return;
      }
      await this.page.waitForTimeout(200);
    }
    Log.warn(`[WARN] Save button (${btnKey}) did not disable within ${timeout}ms — proceeding anyway`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FIELD INTERACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  async getInputValue(key: string): Promise<string> {
    return this.getElement(key).inputValue();
  }

  /** Fill field using keyboard.type (fires raw keydown/input/keyup events for Angular/Radix),
   *  then press Tab to trigger blur/commit (GEN-008). */
  async fillAndTab(key: string, value: string): Promise<void> {
    const el = this.getElement(key);
    await el.click();
    await this.page.keyboard.press('Control+a');
    if (value === '') {
      await this.page.keyboard.press('Backspace');
    } else {
      await this.page.keyboard.type(value);
    }
    await el.press('Tab');
  }

  /** Clear field completely, press Tab to trigger validation. */
  async clearAndTab(key: string): Promise<void> {
    const el = this.getElement(key);
    await el.click();
    await this.page.keyboard.press('Control+a');
    await this.page.keyboard.press('Backspace');
    await el.press('Tab');
  }

  async isFieldInvalid(key: string): Promise<boolean> {
    return (await this.getElement(key).getAttribute('aria-invalid')) === 'true';
  }

  /** Poll until field becomes aria-invalid="true" (LR-010: cross-field async validation). */
  async expectInvalid(key: string, timeout = 5_000): Promise<boolean> {
    return this.waitForFieldInvalid(key, timeout);
  }

  /** Poll until field's aria-invalid clears (LR-010: cross-field async validation). */
  async expectValid(key: string, timeout = 5_000): Promise<boolean> {
    return this.waitForFieldValid(key, timeout);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CHECKBOX (Radix UI — uses aria-checked)
  // ─────────────────────────────────────────────────────────────────────────────

  async getCheckboxState(key: string): Promise<CheckboxState> {
    return this.getRadixCheckboxState(key);
  }

  async checkCheckbox(key: string): Promise<void> {
    await this.setRadixCheckbox(key, true);
  }

  async uncheckCheckbox(key: string): Promise<void> {
    await this.setRadixCheckbox(key, false);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // COMBOBOX
  // ─────────────────────────────────────────────────────────────────────────────

  async getComboboxValue(key: string): Promise<string> {
    return (await this.getElement(key).textContent() || '').trim();
  }

  async getComboboxOptionsList(key: string): Promise<string[]> {
    return this.getComboboxOptions(key);
  }

  /** Select exact combobox option (uses getByRole for exact match — GEN-025). */
  async selectComboboxExact(key: string, optionName: string): Promise<void> {
    await this.getElement(key).click();
    const listbox = this.page.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible', timeout: 5_000 });
    await this.page.getByRole('option', { name: optionName, exact: true }).click();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB STATE
  // ─────────────────────────────────────────────────────────────────────────────

  async isTabSelected(tabKey: string): Promise<boolean> {
    return (await this.getElement(tabKey).getAttribute('aria-selected')) === 'true';
  }

  /** Click a tab by selector key (public wrapper for spec-level tab switching). */
  /**
   * Click a tab. Handles "Unsaved changes" alertdialog if it appears.
   *
   * RCA ECT-012: Angular doesn't reliably call markAsPristine() after ECT save.
   * The save API completes (button disables, toast shows) but the form dirty flag
   * persists. Clicking another tab triggers the dirty guard → "Unsaved changes" dialog.
   * Dismiss with "Discard" to complete the navigation.
   */
  async clickTab(tabKey: string): Promise<void> {
    await this.getElement(tabKey).click();
    await this.page.waitForTimeout(300); // Allow Angular to render dialog if dirty
    const dismissed = await this.dismissAlertDialogIfVisible();
    if (dismissed) await this.waitForAngularStable();
  }

  /** Wait for Basic Info form to be visible (public wrapper for spec use). */
  async waitForBasicInfoForm(timeout = 10_000): Promise<void> {
    await this.getElement('frmBasicInfo').waitFor({ state: 'visible', timeout });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTIONS TABLE
  // ─────────────────────────────────────────────────────────────────────────────

  /** Get data rows from sections table (excludes the "add new" placeholder row). */
  private getSectionDataRows() {
    const table = this.getElement('tblSections');
    return table.locator('tbody tr').filter({
      hasNot: this.page.locator('input[placeholder="Add New..."]'),
    });
  }

  /** Count data rows in the Sections table. */
  async getSectionRowCount(): Promise<number> {
    return this.getSectionDataRows().count();
  }

  /** Get all section names from the Sections table (reads input values). */
  async getSectionNames(): Promise<string[]> {
    const rows = this.getSectionDataRows();
    const count = await rows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const input = rows.nth(i).locator('td:first-child input');
      const val = await input.inputValue();
      if (val.trim().length > 0) names.push(val.trim());
    }
    return names;
  }

  /** Check if a section row has the active checkmark (SVG lucide-check in toggle cell). */
  async isSectionActive(rowIndex: number): Promise<boolean> {
    const row = this.getSectionDataRows().nth(rowIndex);
    return (await row.locator('td:last-child svg').count()) > 0;
  }

  /** Click the active/checkmark cell for a section row to toggle. */
  async toggleSectionActive(rowIndex: number): Promise<void> {
    const row = this.getSectionDataRows().nth(rowIndex);
    await row.locator('td:last-child').click();
  }

  /** Edit a section name by clicking the input and typing. */
  async editSectionName(rowIndex: number, newName: string): Promise<void> {
    const row = this.getSectionDataRows().nth(rowIndex);
    const input = row.locator('td:first-child input');
    await input.click();
    await input.clear();
    await input.fill(newName);
    await input.press('Tab');
  }

  /** Type a name in the "Add New" input at the bottom of the Sections table. */
  async addSection(name: string): Promise<void> {
    const section = this.getElement('tblSections');
    const addInput = section.locator('input[placeholder="Add New..."]');
    await addInput.fill(name);
    await addInput.press('Tab');
  }

  async clickDefaultSection(): Promise<void> {
    await this.clickWithRetry('btnDefaultSection');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ROOMS TABLE
  // ─────────────────────────────────────────────────────────────────────────────

  async isRoomTableEmpty(): Promise<boolean> {
    const table = this.getElement('tblRoomConfig');
    const dataRows = table.locator('tbody tr').filter({
      hasNot: this.page.locator('input[placeholder="Add New..."]'),
    });
    return (await dataRows.count()) === 0;
  }

  async addRoom(name: string): Promise<void> {
    const section = this.getElement('tblRoomConfig');
    const addInput = section.locator('input[placeholder="Add New..."]');
    await addInput.fill(name);
    await addInput.press('Tab');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LOGO
  // ─────────────────────────────────────────────────────────────────────────────

  async getLogoPreviewSrc(): Promise<string> {
    return (await this.getElement('imgLogoPreview').getAttribute('src')) || '';
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DISCOUNT EXEMPTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /** Count rows with the exempt checkmark (SVG) in discount exemptions table. */
  async getExemptCount(): Promise<number> {
    const table = this.getElement('tblDiscountExemptions');
    return table.locator('tbody tr td:last-child svg').count();
  }

  /** Toggle exempt checkbox for a specific row by index. */
  async toggleExemption(rowIndex: number): Promise<void> {
    const table = this.getElement('tblDiscountExemptions');
    await table.locator('tbody tr').nth(rowIndex).locator('td:last-child').click();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UNSAVED CHANGES DIALOG
  // ─────────────────────────────────────────────────────────────────────────────

  /** Click Stay on the unsaved changes dialog. */
  async clickUnsavedStay(): Promise<void> {
    const dlg = this.getElement('dlgUnsavedLocalOffice');
    await dlg.waitFor({ state: 'visible', timeout: 5_000 });
    await this.getElement('btnUnsavedStay').click();
    await dlg.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  /** Click Discard on the unsaved changes dialog. */
  async clickUnsavedDiscard(): Promise<void> {
    const dlg = this.getElement('dlgUnsavedLocalOffice');
    await dlg.waitFor({ state: 'visible', timeout: 5_000 });
    await this.getElement('btnUnsavedDiscard').click();
    await dlg.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HISTORY TAB
  // ─────────────────────────────────────────────────────────────────────────────

  async getHistoryColumnHeaderCount(): Promise<number> {
    return this.getElement('tblHistory').locator('th').count();
  }

  async isHistoryTableEmpty(): Promise<boolean> {
    const text = (await this.getElement('tblHistory').textContent() || '').trim();
    return text.includes('No results.');
  }

  async getHistorySortButtonCount(): Promise<number> {
    return this.getElement('tblHistory').locator('th button').count();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ECT TAB — FIELDS
  // ─────────────────────────────────────────────────────────────────────────────

  async getEctFieldValue(key: string): Promise<string> {
    return this.getFieldDisplayValue(key);
  }

  /** Get event profit target table row count. */
  async getEventProfitTargetRowCount(): Promise<number> {
    return this.getElement('tblEventProfitTarget').locator('tbody tr').count();
  }

  /** Check if event profit target table is read-only (no inputs). */
  async isEventProfitTargetReadOnly(): Promise<boolean> {
    return (await this.getElement('tblEventProfitTarget').locator('input, textarea').count()) === 0;
  }

  /** Get subrental matrix table row count. */
  async getSubRentalMatrixRowCount(): Promise<number> {
    return this.getElement('tblSubRentalMatrix').locator('tbody tr').count();
  }

  /** Check if subrental matrix is read-only (no inputs). */
  async isSubRentalReadOnly(): Promise<boolean> {
    return (await this.getElement('tblSubRentalMatrix').locator('input, textarea').count()) === 0;
  }

  /** Get labor cost table row count. */
  async getLaborCostRowCount(): Promise<number> {
    return this.getElement('tblLaborCostAssumptions').locator('tbody tr').count();
  }

  /** Get labor cost input value by row index (0-based). */
  async getLaborCostValue(rowIndex: number): Promise<string> {
    const input = this.page.locator(`[data-testid="ect-settings-input-labor-cost-${rowIndex}"]`);
    return input.inputValue();
  }

  /** Fill labor cost input by row index, press Tab (GEN-008 + LRN-LOS-002).
   *  RCA ECT-009: Angular can fire "Unsaved changes" alertdialog asynchronously after
   *  tab load. If the click is intercepted, dismiss the dialog and retry. */
  async fillLaborCost(rowIndex: number, value: string): Promise<void> {
    const input = this.page.locator(`[data-testid="ect-settings-input-labor-cost-${rowIndex}"]`);
    try {
      await input.click({ timeout: 5_000 });
    } catch {
      // Dialog may have appeared after tab load — dismiss and retry.
      // After dismissal, the app may revert to Basic Info tab. Re-navigate to ECT.
      await this.dismissAlertDialogIfVisible();
      await this.navigateToEctTab();
      await input.click({ timeout: 10_000 });
    }
    await this.page.keyboard.press('Control+a');
    await this.page.keyboard.type(value);
    await input.press('Tab');
  }

  /** Get first labor class name from the table. */
  async getFirstLaborClassName(): Promise<string> {
    const cell = this.getElement('tblLaborCostAssumptions').locator('tbody tr:first-child td:first-child');
    return (await cell.textContent() || '').trim();
  }

  /** Get last labor class name from the table. */
  async getLastLaborClassName(): Promise<string> {
    const cell = this.getElement('tblLaborCostAssumptions').locator('tbody tr:last-child td:first-child');
    return (await cell.textContent() || '').trim();
  }

  /** Check if labor class column is read-only (no inputs in first column). */
  async isLaborClassReadOnly(): Promise<boolean> {
    return (await this.getElement('tblLaborCostAssumptions')
      .locator('tbody tr:first-child td:first-child input').count()) === 0;
  }

  /** Check if labor cost column has input elements. */
  async isLaborCostEditable(): Promise<boolean> {
    return (await this.getElement('tblLaborCostAssumptions')
      .locator('tbody tr:first-child td:last-child input').count()) > 0;
  }

  /** Get the text of a table row cells for profit target or subrental tables. */
  async getTableRowTexts(tableKey: string, rowSelector: string): Promise<string[]> {
    const cells = this.getElement(tableKey).locator(`${rowSelector} td`);
    return (await cells.allTextContents()).map(t => t.trim());
  }

  /** Check if history tab has editable fields or save button. */
  async isHistoryTabReadOnly(): Promise<boolean> {
    const panel = this.getElement('tabContentHistory');
    const inputs = await panel.locator('input:not([type="hidden"]), textarea').count();
    const saveBtn = await panel.locator('button:has-text("Save")').count();
    return inputs === 0 && saveBtn === 0;
  }

  /** Get pagination text from history tab. */
  async getHistoryPaginationText(): Promise<string> {
    const panel = this.getElement('tabContentHistory');
    const text = await panel.locator('text=/\\d+ \\/ \\d+/').textContent().catch(() => '');
    return (text || '').trim();
  }

  /** Get the count of pagination nav buttons in history tab. */
  async getHistoryPaginationButtonCount(): Promise<number> {
    const panel = this.getElement('tabContentHistory');
    return panel.locator('button[aria-label*="page"], button[aria-label*="Page"]').count();
  }
}
