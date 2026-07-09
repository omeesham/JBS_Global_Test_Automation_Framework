import { Locator } from '@playwright/test';
import { LocalOfficeSettingsPage } from './local-office-settings.page';
import { LocalOfficeEctSelectors, LocalOfficeSettingsSelectors, getTsSelector } from '../../selectors';
import { Log } from '../../utils/logger';

export class LocalOfficeEctPage extends LocalOfficeSettingsPage {

 /**
 * getElement override — prefer ECT selectors, cascade to shared tab/dialog selectors in LocalOfficeSettingsSelectors,
 * then global. LocalOfficeSettingsSelectors is excluded from ALL_SELECTORS (key collisions), so a direct cascade is required.
 */
  protected getElement(elementName: string): Locator {
    const selector = (LocalOfficeEctSelectors as Record<string, string>)[elementName]
      ?? (LocalOfficeSettingsSelectors as Record<string, string>)[elementName]
      ?? getTsSelector(elementName);
    if (!selector) throw new Error(`Selector '${elementName}' not found in Local Office ECT, Settings, or global selectors`);
    return this.page.locator(selector);
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // NAVIGATION
 // ─────────────────────────────────────────────────────────────────────────────

 /**
 * Navigate to ECT Settings tab with robust retry for intermittent API failures.
 * The ECT API intermittently returns "No currencies" or "No data available"
 * under load. Original retry loop had a bug: after the 3rd retry it didn't re-check whether
 * data loaded before falling through to lblEctLocationName.waitFor → 30s timeout.
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
 * waitForAngularStable resolves before the save HTTP response arrives.
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
 * Same race condition fix as clickSaveFixedCosts.
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

 /** Fill labor cost input by row index, press Tab ( + LRN-LOS-002).
 * Angular can fire "Unsaved changes" alertdialog asynchronously after
 * tab load. If the click is intercepted, dismiss the dialog and retry. */
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
}
