import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { IConfig } from '../../types';

export class LocationManagementHistoryPage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
  }

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
 * Navigate back to Basic Information tab from History.
 * MUST be called at the end of every HIST integration test to prevent
 * cross-spec state contamination (a full-suite run can otherwise leak tab state between specs).
 * When History tab is active, sub-tabs (Currency, Legal, etc.) are hidden.
 * If the next spec file inherits this worker, its TC-001 will fail.
 */
  async returnToBasicInformation(): Promise<void> {
    const basicTab = this.getElement('tabBasicInformation');
    await basicTab.click();
    await this.waitForAngularStable();
  }

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

  async isTableVisible(): Promise<boolean> {
    return this.getElement('tblMgmtHistory').isVisible();
  }

  async getColumnHeaders(): Promise<string[]> {
    const table = this.getElement('tblMgmtHistory');
    await table.locator('th').first().waitFor({ state: 'visible', timeout: 10_000 });
    const headers = table.locator('th');
    return (await headers.allTextContents()).map(t => t.trim());
  }

  async getColumnHeaderCount(): Promise<number> {
    return this.getElement('tblMgmtHistory').locator('th').count();
  }

  async getDataRowCount(): Promise<number> {
    return this.getElement('tblMgmtHistory').locator('tbody tr').count();
  }

  async isTableEmpty(): Promise<boolean> {
    const text = (await this.getElement('tblMgmtHistory').textContent() || '').trim();
    return text.includes('No results.');
  }

 // CELL ACCESS — By Header Name

 /**
 * Find column index by header text.
 * Returns the FIRST match (important for duplicate "Currency" cols 6+64).
 * Use getColumnByIndex for col 64 (pricing currency).
 */
  private async getColumnIndex(headerText: string): Promise<number> {
    const headers = await this.getColumnHeaders();
    const idx = headers.indexOf(headerText);
    if (idx === -1) throw new Error(`Column header "${headerText}" not found in history table`);
    return idx;
  }

  async getColumnByHeader(rowIndex: number, headerText: string): Promise<string> {
    const colIndex = await this.getColumnIndex(headerText);
    return this.getColumnByIndex(rowIndex, colIndex);
  }

  async getColumnByIndex(rowIndex: number, colIndex: number): Promise<string> {
    const cell = this.getElement('tblMgmtHistory').locator(`tbody tr`).nth(rowIndex).locator('td').nth(colIndex);
    return (await cell.textContent() || '').trim();
  }

  async getRowValues(rowIndex: number, headerTexts: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    for (const header of headerTexts) {
      result[header] = await this.getColumnByHeader(rowIndex, header);
    }
    return result;
  }

  async getLatestRowValues(headerTexts: string[]): Promise<Record<string, string>> {
    return this.getRowValues(0, headerTexts);
  }

 /**
 * Parse "MM/DD/YYYY HH:MM:SS AM/PM" Modified On cell value to epoch ms.
 * Returns NaN for malformed input.
 * TIMEZONE: Treats the displayed time as UTC (via Date.UTC). Evidence from
 * trace.zip analysis showed that the server renders timestamps as
 * UTC literal text (no TZ suffix, no client-side localization). Using
 * `new Date(y,m,d,h,...)` would interpret as browser-local, causing off-by-
 * offset-hours errors (e.g., -5.5h for IST clients) that make recent rows
 * appear < suiteStartTime and incorrectly skip them.
 * Edge case: if server ever switches to rendering in browser-local TZ, parsed
 * values will be slightly future — still > sinceMs → still correctly included.
 * For old rows (months ago), the offset error is negligible relative to the
 * full gap to sinceMs, so stop-at-page logic still works.
 */
  static parseModifiedOnMs(val: string): number {
    const parts = val.trim().split(' ');
    const dateParts = (parts[0] || '').split('/');
    const timeParts = (parts[1] || '').split(':').map(Number);
    const ampm = parts[2] || '';
    const m = Number(dateParts[0]);
    const d = Number(dateParts[1]);
    const y = Number(dateParts[2]);
    let h = timeParts[0] || 0;
    const min = timeParts[1] || 0;
    const s = timeParts[2] || 0;
    if (!Number.isFinite(m) || !Number.isFinite(d) || !Number.isFinite(y)) return NaN;
    if (!Number.isFinite(h) || !Number.isFinite(min) || !Number.isFinite(s)) return NaN;
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return Date.UTC(y, m - 1, d, h, min, s);
  }

 /**
 * Read rows on the current (first) page with Modified On >= sinceMs. Assumes desc
 * sort (caller must call sortByModifiedOnDesc first). Stops at the first row whose
 * Modified On is older than sinceMs.
 * PAGE-1-ONLY: a test suite's saves always fit in 1 page (<20 rows) after desc sort.
 * Earlier paginated version timed out at 180s on location 1604 because subsequent
 * pages frequently returned rowCount=0 due to post-click DOM re-render lag,
 * causing the loop to march through 100+ pages of unrelated history. See trace
 * analysis cycle 5. If a future suite needs >20 rows, raise rowsPerPage
 * via setRowsPerPage('50') before calling — don't re-introduce pagination without
 * a rowCount>0 wait after each clickPaginationButton.
 * Resolves each header to a column index ONCE, then reads all rows with those
 * indices — avoids the O(n*cols) re-resolution in getColumnByHeader loops.
 * @param sinceMs Lower-bound epoch ms. Rows strictly older are excluded.
 * @param headerTexts Column headers to read (duplicate names return first match).
 * @param maxRows Safety cap (default 40 — 2x typical rowsPerPage).
 */
  async getRowsSinceTimestamp(
    sinceMs: number,
    headerTexts: string[],
    maxRows = 40,
  ): Promise<Array<Record<string, string>>> {
    const allHeaders = await this.getColumnHeaders();
    const modifiedOnIdx = allHeaders.indexOf('Modified On');
    if (modifiedOnIdx === -1) {
      throw new Error('Modified On column not found in history table');
    }
    const headerToIdx: Record<string, number> = {};
    for (const h of headerTexts) {
      const idx = allHeaders.indexOf(h);
      if (idx === -1) {
        throw new Error(`Header "${h}" not found in history table`);
      }
      headerToIdx[h] = idx;
    }

    const table = this.getElement('tblMgmtHistory');
    const collected: Array<Record<string, string>> = [];

 // Navigate to first page so desc sort starts from newest row
    const firstDisabled = await this.isPaginationButtonDisabled('first').catch(() => true);
    if (!firstDisabled) {
      await this.clickPaginationButton('first');
    }

    const rowCount = await table.locator('tbody tr').count();
    for (let r = 0; r < rowCount && collected.length < maxRows; r++) {
      const row = table.locator('tbody tr').nth(r);
      const modifiedOnVal = ((await row.locator('td').nth(modifiedOnIdx).textContent()) || '').trim();
      const modifiedOnMs = LocationManagementHistoryPage.parseModifiedOnMs(modifiedOnVal);
      if (Number.isFinite(modifiedOnMs) && modifiedOnMs < sinceMs) {
        break;
      }
      const rec: Record<string, string> = {};
      for (const [header, idx] of Object.entries(headerToIdx)) {
        rec[header] = ((await row.locator('td').nth(idx).textContent()) || '').trim();
      }
      collected.push(rec);
    }

    return collected;
  }

 /** Click sort dropdown and select a direction for a sortable column by header text.
 * Radix dropdown flakiness: menu occasionally fails to appear after button click.
 * Retry pattern: Escape to close any lingering state, re-click, max 3 attempts.
 * Retry carve-out: Radix Dropdown Menu surface ([role="menu"]/[role="menuitem"]), NOT Select listbox.
 * Different retry abstraction; selectComboboxOption helper does not apply. */
  async clickSortColumn(headerText: string, direction: 'ascending' | 'descending' = 'ascending'): Promise<void> {
    const colIndex = await this.getColumnIndex(headerText);
    const th = this.getElement('tblMgmtHistory').locator('th').nth(colIndex);
    const sortBtn = th.locator('button');
    if (await sortBtn.count() === 0) {
      throw new Error(`Column "${headerText}" is not sortable (no button element)`);
    }
    const menu = this.page.locator('[role="menu"]').first();
    let lastErr: unknown = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await sortBtn.click();
        await menu.waitFor({ state: 'visible', timeout: 3_000 });
        await menu.locator(`[role="menuitem"]:has-text("Sort ${direction}")`).click();
        await menu.waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => { /* best effort */ });
        await this.waitForAngularStable();
        return;
      } catch (e) {
        lastErr = e;
 // Escape to close any half-open menu; short settle before retry
        await this.page.keyboard.press('Escape').catch(() => {});
        await this.page.waitForTimeout(300);
      }
    }
    throw new Error(`clickSortColumn("${headerText}", "${direction}") failed after 3 attempts: ${String(lastErr)}`);
  }

  async isSortButtonPresent(headerText: string): Promise<boolean> {
    const colIndex = await this.getColumnIndex(headerText);
    const th = this.getElement('tblMgmtHistory').locator('th').nth(colIndex);
    return (await th.locator('button').count()) > 0;
  }

  async isSortButtonPresentByIndex(colIndex: number): Promise<boolean> {
    const th = this.getElement('tblMgmtHistory').locator('th').nth(colIndex);
    return (await th.locator('button').count()) > 0;
  }

  async sortByModifiedOnDesc(): Promise<void> {
    await this.clickSortColumn('Modified On', 'descending');
  }

 /**
 * Wait until the first tbody row's Modified On is within `maxAgeMs` of now.
 * Use after sortByModifiedOnDesc to ensure the DOM has re-rendered with
 * newest rows on top before reading (clickSortColumn + waitForAngularStable
 * does NOT guarantee row re-render has landed).
 * Location Management History has ~2900 rows; after switching from ASC to DESC
 * the re-render can take 1-3s. Without this wait, top row may still show 2005
 * timestamps while the desc view is still materializing.
 */
  async waitForRecentTopRow(maxAgeMs = 24 * 60 * 60 * 1000, timeoutMs = 15_000): Promise<void> {
    const headers = await this.getColumnHeaders();
    const modifiedOnIdx = headers.indexOf('Modified On');
    if (modifiedOnIdx === -1) throw new Error('Modified On column not found');
    const deadline = Date.now() + timeoutMs;
    let lastVal = '';
    while (Date.now() < deadline) {
      const firstRow = this.getElement('tblMgmtHistory').locator('tbody tr').first();
      if ((await firstRow.count()) > 0) {
        lastVal = ((await firstRow.locator('td').nth(modifiedOnIdx).textContent()) || '').trim();
        const ms = LocationManagementHistoryPage.parseModifiedOnMs(lastVal);
        if (Number.isFinite(ms) && (Date.now() - ms) <= maxAgeMs) return;
      }
      await this.page.waitForTimeout(200);
    }
    throw new Error(`Top row Modified On "${lastVal}" not within ${maxAgeMs}ms of now after ${timeoutMs}ms wait — sort may not have applied`);
  }

  async getRowsPerPageValue(): Promise<string> {
    return (await this.getElement('drpMgmtHistoryRowsPerPage').textContent() || '').trim();
  }

  async getRowsPerPageOptions(): Promise<string[]> {
    return this.getComboboxOptions('drpMgmtHistoryRowsPerPage');
  }

  async setRowsPerPage(value: string): Promise<void> {
    await this.getElement('drpMgmtHistoryRowsPerPage').click();
    const listbox = this.page.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible', timeout: 5_000 });
    await this.page.getByRole('option', { name: value, exact: true }).click();
    await this.waitForAngularStable();
  }

  async getPaginationText(): Promise<string> {
    const tabContent = this.page.locator('[data-testid="location-settings-tab-content-management-history"]');
    const current = (await tabContent.locator('input[aria-label="Current page number"]').inputValue().catch(() => '')).trim();
    const totalRaw = ((await tabContent.locator('span').filter({ hasText: /^\/\s*\d+$/ }).first().textContent().catch(() => '')) || '').trim();
    const total = totalRaw.replace(/\D/g, '');
    if (!current || !total) return '';
    return `${current} / ${total}`;
  }

  async isPaginationButtonDisabled(direction: 'first' | 'previous' | 'next' | 'last'): Promise<boolean> {
    const keyMap = {
      first: 'btnMgmtHistoryFirstPage',
      previous: 'btnMgmtHistoryPrevPage',
      next: 'btnMgmtHistoryNextPage',
      last: 'btnMgmtHistoryLastPage',
    };
    return this.getElement(keyMap[direction]).isDisabled();
  }

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

  async isReadOnly(): Promise<boolean> {
    const panel = this.page.locator('[role="tabpanel"]');
    const addBtn = await panel.locator('button:has-text("Add")').count();
    const editBtn = await panel.locator('button:has-text("Edit")').count();
    const deleteBtn = await panel.locator('button:has-text("Delete")').count();
    const saveBtn = await panel.locator('button:has-text("Save")').count();
    // Scope the editable-field check to the DATA TABLE region only. The tblMgmtHistory testid is a
    // wrapper <div> that contains BOTH the nested data <table> AND the paginator "Current page number"
    // <input> (verified on the live app, 2026-06-02). Counting panel-wide (or even wrapper-wide)
    // catches the paginator input → false negative.
    // The nested <table> is the data region and is genuinely input-free (sibling TC-016 proves cells are
    // non-interactive). Assert exactly 0 — no relaxation, no constant subtraction.
    const inputs = await this.getElement('tblMgmtHistory').locator('table')
      .locator('input:not([type="hidden"]), textarea').count();
    return addBtn === 0 && editBtn === 0 && deleteBtn === 0 && saveBtn === 0 && inputs === 0;
  }

  async areCellsNonInteractive(): Promise<boolean> {
    const firstCell = this.getElement('tblMgmtHistory').locator('tbody tr:first-child td:first-child');
    if (await firstCell.count() === 0) return true; // No data rows
    await firstCell.click();
    const inputsAfterClick = await firstCell.locator('input, textarea, [contenteditable="true"]').count();
    return inputsAfterClick === 0;
  }

  async hasHorizontalScroll(): Promise<boolean> {
    const table = this.getElement('tblMgmtHistory');
    return table.evaluate(el => {
      const inner = el.querySelector('table');
      return inner ? inner.scrollWidth > el.clientWidth : el.scrollWidth > el.clientWidth;
    });
  }

  async getApproximateTotalRowCount(): Promise<number> {
    const paginationText = await this.getPaginationText();
    const match = paginationText.match(/\d+\s*\/\s*(\d+)/);
    if (!match?.[1]) return 0;
    const totalPages = parseInt(match[1], 10);
    const rowsPerPage = parseInt(await this.getRowsPerPageValue(), 10) || 20;
    return totalPages * rowsPerPage;
  }
}
