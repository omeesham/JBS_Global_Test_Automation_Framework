import { Locator } from '@playwright/test';
import { LocalOfficeSettingsPage } from './local-office-settings.page';
import { LocalOfficeHistorySelectors, LocalOfficeSettingsSelectors, getTsSelector } from '../../selectors';

export class LocalOfficeHistoryPage extends LocalOfficeSettingsPage {

 /**
 * getElement override — prefer HIS selectors, cascade to shared tab/dialog selectors in LocalOfficeSettingsSelectors,
 * then global. LocalOfficeSettingsSelectors is excluded from ALL_SELECTORS (key collisions), so a direct cascade is required.
 */
  protected getElement(elementName: string): Locator {
    const selector = (LocalOfficeHistorySelectors as Record<string, string>)[elementName]
      ?? (LocalOfficeSettingsSelectors as Record<string, string>)[elementName]
      ?? getTsSelector(elementName);
    if (!selector) throw new Error(`Selector '${elementName}' not found in Local Office History, Settings, or global selectors`);
    return this.page.locator(selector);
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // NAVIGATION
 // ─────────────────────────────────────────────────────────────────────────────

 /**
 * Navigate to History tab. Handles unsaved dialog if dirty form persists.
 * After save -> tab switch: wait for Save disabled, then switch.
 * If alertdialog appears, click "Discard" to proceed.
 */
  async navigateToHistoryTab(): Promise<void> {
    const tab = this.getElement('tabHistory');
    const isSelected = await tab.getAttribute('aria-selected').catch(() => null);
    if (isSelected !== 'true') {
      await tab.click();
      await this.waitForAngularStable();
      await this.dismissAlertDialogIfVisible();
    }
    await this.getElement('tblHistory').waitFor({ state: 'visible', timeout: 15_000 });
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // HISTORY TAB — STRUCTURE
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

 /**
 * Get all column header texts from the history table.
 * Scoped to [data-testid="local-office-settings-history-table"] (5: 3 tables in DOM).
 */
  async getHistoryColumnHeaders(): Promise<string[]> {
    const table = this.getElement('tblHistory');
    return (await table.locator('th').allTextContents()).map(t => t.trim());
  }

 /**
 * Get cell value by row index (0-based) and header text.
 * CRITICAL (2): Local Office History uses SVG lucide-check icons for booleans.
 * textContent returns "" for both TRUE and FALSE. Must check innerHTML for lucide-check.
 */
  async getHistoryColumnByHeader(rowIndex: number, headerText: string): Promise<string> {
    const headers = await this.getHistoryColumnHeaders();
    const colIndex = headers.indexOf(headerText);
    if (colIndex === -1) throw new Error(`Column "${headerText}" not found in Local Office history table`);

    const cell = this.getElement('tblHistory').locator('tbody tr').nth(rowIndex).locator('td').nth(colIndex);
    const text = (await cell.textContent() || '').trim();

 // : Boolean detection via innerHTML for SVG lucide-check icons
    if (text === '') {
      const html = await cell.innerHTML();
      if (html.includes('lucide-check')) return '✔'; // Return ✔ for TRUE
    }
    return text;
  }

 /**
 * Read multiple column values from a specific row.
 * @param rowIndex - 0-based row index
 * @param headerTexts - Array of column header names to read
 * @returns Record mapping header name -> cell text
 */
  async getHistoryRowValues(rowIndex: number, headerTexts: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    for (const header of headerTexts) {
      result[header] = await this.getHistoryColumnByHeader(rowIndex, header);
    }
    return result;
  }

 /**
 * Sort history table by Modified On descending.
 * Checks current sort state before clicking.
 */
  async sortHistoryByModifiedOnDesc(): Promise<void> {
    const headers = await this.getHistoryColumnHeaders();
    const colIndex = headers.indexOf('Modified On');
    if (colIndex === -1) throw new Error('Column "Modified On" not found in Local Office history table');

    const th = this.getElement('tblHistory').locator('th').nth(colIndex);
    const sortBtn = th.locator('button');
    if (await sortBtn.count() === 0) throw new Error('"Modified On" column has no sort button');

    const ariaSort = await th.getAttribute('aria-sort').catch(() => null);
    if (ariaSort === 'descending') return;
 // Sort button opens a menu with "Sort ascending" / "Sort descending" items.
 // Matches the MGH page's clickSortColumn pattern.
    await sortBtn.click();
    const menu = this.page.locator('[role="menu"]');
    await menu.waitFor({ state: 'visible', timeout: 5_000 });
    await menu.locator('[role="menuitem"]:has-text("Sort descending")').click();
    await this.waitForAngularStable();
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // HISTORY TAB — READ-ONLY + PAGINATION
 // ─────────────────────────────────────────────────────────────────────────────

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
