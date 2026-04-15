/**
 * @agent-doc
 * PURPOSE: Location Management History Tab Page Object -- read-only 87-column history DataTable.
 *          URL: /navigator/locations/{officeId}/settings/location (History tab)
 * OWNER: generator
 * IMPACT: medium -- Location Management History tests depend on this.
 * DEPENDS-ON: BasePage, LocationSettingsSelectors (via getTsSelector), logger.ts, framework-contracts/index.ts
 * USED-BY: tests/specs/setup/locations/location-management-history.spec.ts, fixtures.ts
 * RULES: Never use raw page.* in specs. All selectors via getTsSelector (LocationSettingsSelectors).
 *        Boolean TRUE = Unicode "✔" (textContent readable). NOT SVG like Local Office History.
 *        Scope all table queries to [data-testid="location-settings-history-table"] (SP1 §5).
 *        Cols 6+64 both named "Currency" -- use getColumnByIndex(63) for pricing currency.
 */

import { Page } from '@playwright/test';
import { BasePage } from '../../../common/base-page';
import { Log } from '../../../utils/logger';
import { IConfig } from '../../../framework-contracts';

export class LocationManagementHistoryPage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Navigate to Location Management History tab.
   * Handles unsaved dialog if dirty form state persists (LR-026, SP1 §11).
   */
  async navigateToHistoryTab(officeNo = '1604'): Promise<void> {
    const currentUrl = this.page.url();
    if (!currentUrl.includes(`locations/${officeNo}/settings/location`)) {
      const baseUrl = this.config?.base_url || '';
      await this.navigateTo(`${baseUrl}locations/${officeNo}/settings/location`);
      await this.waitForAngularStable();
    }
    const tab = this.getElement('tabLocationManagementHistory');
    await tab.waitFor({ state: 'visible', timeout: 30_000 });
    const isSelected = await tab.getAttribute('aria-selected').catch(() => null);
    if (isSelected !== 'true') {
      await tab.click();
      await this.dismissAlertDialogIfVisible();
      await this.waitForAngularStable();
    }
    await this.getElement('tblMgmtHistory').locator('th').first().waitFor({ state: 'visible', timeout: 15_000 });
  }

  /**
   * Switch to Basic Info tab, then back to History — capturing HTTP responses during the switch.
   * Used by TC-018 to verify the API fires on tab activation.
   */
  async captureResponsesOnHistoryTabSwitch(): Promise<string[]> {
    // Switch away from History tab
    const basicTab = this.getElement('tabBasicInformation');
    await basicTab.click();
    await this.waitForAngularStable();

    // Start capturing
    const responses: string[] = [];
    const handler = (resp: { status(): number; url(): string }) => {
      responses.push(`[${resp.status()}] ${resp.url()}`);
    };
    this.page.on('response', handler);

    // Switch back to History tab
    const historyTab = this.getElement('tabLocationManagementHistory');
    await historyTab.click();
    await this.waitForAngularStable();
    await this.getElement('tblMgmtHistory').locator('th').first().waitFor({ state: 'visible', timeout: 15_000 });

    // Stop capturing
    this.page.off('response', handler);
    return responses;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TABLE STATE
  // ─────────────────────────────────────────────────────────────────────────────

  /** Check if history table is visible. */
  async isTableVisible(): Promise<boolean> {
    return this.getElement('tblMgmtHistory').isVisible();
  }

  /** Get all column header texts (L-to-R order). */
  async getColumnHeaders(): Promise<string[]> {
    const table = this.getElement('tblMgmtHistory');
    await table.locator('th').first().waitFor({ state: 'visible', timeout: 10_000 });
    const headers = table.locator('th');
    return (await headers.allTextContents()).map(t => t.trim());
  }

  /** Get column header count. */
  async getColumnHeaderCount(): Promise<number> {
    return this.getElement('tblMgmtHistory').locator('th').count();
  }

  /** Get data row count (tbody rows). */
  async getDataRowCount(): Promise<number> {
    return this.getElement('tblMgmtHistory').locator('tbody tr').count();
  }

  /** Check if table shows empty state. */
  async isTableEmpty(): Promise<boolean> {
    const text = (await this.getElement('tblMgmtHistory').textContent() || '').trim();
    return text.includes('No results.');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CELL ACCESS — By Header Name
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Find column index by header text.
   * Returns the FIRST match (important for duplicate "Currency" cols 6+64).
   * Use getColumnByIndex() for col 64 (pricing currency).
   */
  private async getColumnIndex(headerText: string): Promise<number> {
    const headers = await this.getColumnHeaders();
    const idx = headers.indexOf(headerText);
    if (idx === -1) throw new Error(`Column header "${headerText}" not found in history table`);
    return idx;
  }

  /**
   * Get cell value by row index (0-based) and header text.
   * Boolean columns with Unicode "✔" are readable via textContent.
   */
  async getColumnByHeader(rowIndex: number, headerText: string): Promise<string> {
    const colIndex = await this.getColumnIndex(headerText);
    return this.getColumnByIndex(rowIndex, colIndex);
  }

  /**
   * Get cell value by row index (0-based) and column index (0-based).
   * Use this for duplicate-named columns (e.g., col 64 = pricing Currency).
   */
  async getColumnByIndex(rowIndex: number, colIndex: number): Promise<string> {
    const cell = this.getElement('tblMgmtHistory').locator(`tbody tr`).nth(rowIndex).locator('td').nth(colIndex);
    return (await cell.textContent() || '').trim();
  }

  /**
   * Read multiple column values from a specific row.
   * @param rowIndex - 0-based row index
   * @param headerTexts - Array of column header names to read
   * @returns Record mapping header name → cell text
   */
  async getRowValues(rowIndex: number, headerTexts: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    for (const header of headerTexts) {
      result[header] = await this.getColumnByHeader(rowIndex, header);
    }
    return result;
  }

  /**
   * Read multiple column values from the latest (first) row.
   * Convenience wrapper for getRowValues(0, ...).
   */
  async getLatestRowValues(headerTexts: string[]): Promise<Record<string, string>> {
    return this.getRowValues(0, headerTexts);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SORTING
  // ─────────────────────────────────────────────────────────────────────────────

  /** Click sort dropdown and select a direction for a sortable column by header text. */
  async clickSortColumn(headerText: string, direction: 'ascending' | 'descending' = 'ascending'): Promise<void> {
    const colIndex = await this.getColumnIndex(headerText);
    const th = this.getElement('tblMgmtHistory').locator('th').nth(colIndex);
    const sortBtn = th.locator('button');
    if (await sortBtn.count() === 0) {
      throw new Error(`Column "${headerText}" is not sortable (no button element)`);
    }
    await sortBtn.click();
    const menu = this.page.locator('[role="menu"]');
    await menu.waitFor({ state: 'visible', timeout: 5_000 });
    await menu.locator(`[role="menuitem"]:has-text("Sort ${direction}")`).click();
    await this.waitForAngularStable();
  }

  /** Check if a column has a sort button (by header text). */
  async isSortButtonPresent(headerText: string): Promise<boolean> {
    const colIndex = await this.getColumnIndex(headerText);
    const th = this.getElement('tblMgmtHistory').locator('th').nth(colIndex);
    return (await th.locator('button').count()) > 0;
  }

  /** Check if a column has a sort button (by 0-based column index). */
  async isSortButtonPresentByIndex(colIndex: number): Promise<boolean> {
    const th = this.getElement('tblMgmtHistory').locator('th').nth(colIndex);
    return (await th.locator('button').count()) > 0;
  }

  /** Sort by Modified On descending via dropdown menu. */
  async sortByModifiedOnDesc(): Promise<void> {
    await this.clickSortColumn('Modified On', 'descending');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PAGINATION
  // ─────────────────────────────────────────────────────────────────────────────

  /** Get current rows-per-page dropdown value. */
  async getRowsPerPageValue(): Promise<string> {
    return (await this.getElement('drpMgmtHistoryRowsPerPage').textContent() || '').trim();
  }

  /** Get rows-per-page dropdown options. */
  async getRowsPerPageOptions(): Promise<string[]> {
    await this.getElement('drpMgmtHistoryRowsPerPage').click();
    const listbox = this.page.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible', timeout: 5_000 });
    const options = await listbox.locator('[role="option"]').allTextContents();
    await this.page.keyboard.press('Escape');
    await listbox.waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => {});
    return options.map(o => o.trim());
  }

  /** Select a rows-per-page option. */
  async setRowsPerPage(value: string): Promise<void> {
    await this.getElement('drpMgmtHistoryRowsPerPage').click();
    const listbox = this.page.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible', timeout: 5_000 });
    await this.page.getByRole('option', { name: value, exact: true }).click();
    await this.waitForAngularStable();
  }

  /** Get pagination text (e.g., "1/147"). Reads from the tab content container's pagination span. */
  async getPaginationText(): Promise<string> {
    const tabContent = this.page.locator('[data-testid="location-settings-tab-content-management-history"]');
    const paginationSpan = tabContent.locator('span').filter({ hasText: /^\d+\s*\/\s*\d+$/ });
    const text = await paginationSpan.textContent().catch(() => '');
    return (text || '').trim();
  }

  /** Check if a pagination button is disabled. */
  async isPaginationButtonDisabled(direction: 'first' | 'previous' | 'next' | 'last'): Promise<boolean> {
    const keyMap = {
      first: 'btnMgmtHistoryFirstPage',
      previous: 'btnMgmtHistoryPrevPage',
      next: 'btnMgmtHistoryNextPage',
      last: 'btnMgmtHistoryLastPage',
    };
    return this.getElement(keyMap[direction]).isDisabled();
  }

  /** Click a pagination button. */
  async clickPaginationButton(direction: 'first' | 'previous' | 'next' | 'last'): Promise<void> {
    const keyMap = {
      first: 'btnMgmtHistoryFirstPage',
      previous: 'btnMgmtHistoryPrevPage',
      next: 'btnMgmtHistoryNextPage',
      last: 'btnMgmtHistoryLastPage',
    };
    await this.getElement(keyMap[direction]).click();
    await this.waitForAngularStable();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // READ-ONLY VERIFICATION
  // ─────────────────────────────────────────────────────────────────────────────

  /** Verify the tab panel has no Add/Edit/Delete/Save controls. */
  async isReadOnly(): Promise<boolean> {
    const panel = this.page.locator('[role="tabpanel"]');
    const addBtn = await panel.locator('button:has-text("Add")').count();
    const editBtn = await panel.locator('button:has-text("Edit")').count();
    const deleteBtn = await panel.locator('button:has-text("Delete")').count();
    const saveBtn = await panel.locator('button:has-text("Save")').count();
    const inputs = await panel.locator('input:not([type="hidden"]), textarea').count();
    return addBtn === 0 && editBtn === 0 && deleteBtn === 0 && saveBtn === 0 && inputs === 0;
  }

  /** Verify data cells are non-interactive (no input/editor on click). */
  async areCellsNonInteractive(): Promise<boolean> {
    const firstCell = this.getElement('tblMgmtHistory').locator('tbody tr:first-child td:first-child');
    if (await firstCell.count() === 0) return true; // No data rows
    await firstCell.click();
    const inputsAfterClick = await firstCell.locator('input, textarea, [contenteditable="true"]').count();
    return inputsAfterClick === 0;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HORIZONTAL SCROLL
  // ─────────────────────────────────────────────────────────────────────────────

  /** Check if the table is wider than its container (horizontal scroll present). */
  async hasHorizontalScroll(): Promise<boolean> {
    const table = this.getElement('tblMgmtHistory');
    return table.evaluate(el => {
      const inner = el.querySelector('table');
      return inner ? inner.scrollWidth > el.clientWidth : el.scrollWidth > el.clientWidth;
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ROW COUNT (via pagination)
  // ─────────────────────────────────────────────────────────────────────────────

  /** Get approximate total row count from pagination (pages × rowsPerPage). */
  async getApproximateTotalRowCount(): Promise<number> {
    const paginationText = await this.getPaginationText();
    const match = paginationText.match(/\d+\s*\/\s*(\d+)/);
    if (!match?.[1]) return 0;
    const totalPages = parseInt(match[1], 10);
    const rowsPerPage = parseInt(await this.getRowsPerPageValue(), 10) || 20;
    return totalPages * rowsPerPage;
  }
}
