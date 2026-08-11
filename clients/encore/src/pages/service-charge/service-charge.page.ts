import { Page, expect } from '@playwright/test';
import { step } from '../../fixtures/step-decorator';
import { BasePage } from '../base.page';
import { Log } from '../../utils/logger';
import { IConfig } from '../../types';
import { serviceCharge as sc } from '../../selectors/service-charge/service-charge';
import { SC_ROUTE, SC_SERVICE_TYPE_INDEX } from '../../data/service-charge/service-charge';

/**
 * Service Charge setup page.
 *
 * Covers two tabs under Location Settings → Service Charge (/settings/service-charge):
 * - Basic Information (default): 79-row table of decimal percentage inputs, one per service type.
 * - Service Charge History: read-only audit grid.
 *
 * Loading: the Basic Information tab renders 79 percentage inputs disabled for ~30 s after
 * navigation before enabling them all at once. waitUntilLoaded() waits for the first input
 * to become enabled — this is the reliable load gate for the Basic Information tab.
 *
 * Tabs: located by accessible name (Radix ids shift between builds — never use them).
 *
 * Save dialog: the shared "Save Changes" dialog (dlgSaveChanges / btnSaveChangesConfirm)
 * is assumed; a custom dialog exists only if a live walk proves otherwise. Confirm
 * before authoring save-cycle assertions.
 *
 * RUNTIME VERIFICATION OUTSTANDING: the e2e environment was degraded at build time
 * (all inputs disabled, office header showing "Local Office : -"). Every method below
 * is authored against the application's DOM as observed on 2026-08-10; no live run has confirmed behaviour.
 */
export class ServiceChargePage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
    Log.info('ServiceChargePage initialized');
  }

  // ---------------------------------------------------------------- navigation

  /** Navigates to the Service Charge page for the given office and waits for it to load. */
  @step('Navigate to the Service Charge page for an office')
  async goto(office: string = '1604'): Promise<void> {
    const baseUrl = (this.config?.base_url ?? '').replace(/\/+$/, '');
    await this.safeNavigateTo('about:blank');
    await this.navigateTo(`${baseUrl}${SC_ROUTE(office)}`);
    await this.waitUntilLoaded();
  }

  /**
   * Navigates to the Service Charge page for the given office without waiting for the
   * Basic Information percentage inputs to become enabled.
   *
   * Use this method when the test only needs the History tab and does not require
   * the Basic Information tab to be in an editable state. The standard goto() method
   * waits for BI inputs to enable (up to 60 s) — that gate is wrong for read-only
   * History paths where the target office may have disabled or read-only BI inputs.
   * This method does not change the contract of waitUntilLoaded(); other callers are
   * unaffected.
   */
  @step('Navigate to the Service Charge page for an office (History tab only)')
  async gotoHistory(office: string = '1604'): Promise<void> {
    const baseUrl = (this.config?.base_url ?? '').replace(/\/+$/, '');
    await this.safeNavigateTo('about:blank');
    await this.navigateTo(`${baseUrl}${SC_ROUTE(office)}`);
    await this.waitForAngularStable();
  }

  /**
   * Waits until the Basic Information tab's percentage inputs are enabled.
   *
   * After navigation the page renders all 79 percentage inputs in a disabled state for
   * approximately 30 seconds before enabling them all at once. Waiting for skeleton
   * disappearance alone returns too early — inputs are still disabled at that point.
   * This gate waits for the first percentage input to become enabled, which confirms the
   * page is ready to interact with. A 60-second timeout accommodates the observed ~30.5 s
   * enable delay with comfortable headroom.
   */
  @step('Wait for the page to finish loading')
  async waitUntilLoaded(timeout = 60_000): Promise<void> {
    await expect(this.page.locator(sc.percentageByIndex(0)).first()).toBeEnabled({ timeout });
    await this.waitForAngularStable();
  }

  /**
   * Switches to the Basic Information tab by accessible name.
   * Radix-generated tab ids must never be used — they shift between builds.
   */
  @step('Switch to the Basic Information tab')
  async switchToBasicInformationTab(): Promise<void> {
    await this.page
      .getByRole('tab', { name: sc.TAB_BASIC_INFORMATION_NAME, exact: true })
      .click();
    await this.waitUntilLoaded();
  }

  /**
   * Switches to the Service Charge History tab by accessible name and waits until it is
   * confirmed active. Uses aria-selected rather than a heading — the page h1 stays
   * "Service Charge" on both tabs, so no History-specific heading exists.
   * Radix-generated tab ids must never be used — they shift between builds.
   */
  @step('Switch to the Service Charge History tab')
  async switchToHistoryTab(): Promise<void> {
    const tab = this.page.getByRole('tab', { name: sc.TAB_HISTORY_NAME, exact: true });
    await tab.click();
    await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 10_000 });
    await this.waitForAngularStable();
  }

  // ---------------------------------------------------------------- reading

  /**
   * Returns the full office header text shown at the top of the page
   * (e.g. "Local Office : Parker Palm Springs").
   * The header element carries no data-testid; located by visible text pattern.
   */
  @step('Read the office header text')
  async getOfficeHeader(): Promise<string> {
    const raw = await this.page
      .getByText(/Local Office\s*:/, { exact: false })
      .first()
      .textContent();
    return (raw ?? '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Returns the current value of the percentage input at the given row index (0–78).
   * Values live in input.value — textContent returns empty for these inputs.
   */
  @step('Read a percentage value by row index')
  async getPercentageByIndex(index: number): Promise<string> {
    return this.page.locator(sc.percentageByIndex(index)).inputValue();
  }

  /**
   * Returns the current value of the percentage input for a named service type.
   * Row index is resolved from SC_SERVICE_TYPE_INDEX (sourced from the application's DOM as observed on 2026-08-10).
   * Throws if the service-type name is not present in the map.
   */
  @step('Read a percentage value by service type name')
  async getPercentageByServiceType(serviceType: string): Promise<string> {
    const index = SC_SERVICE_TYPE_INDEX[serviceType];
    if (index === undefined) {
      throw new Error(`Service type not found in index map: "${serviceType}"`);
    }
    return this.getPercentageByIndex(index);
  }

  /**
   * Returns the column headers of the currently visible table in display order.
   * Works for both the Basic Information and History tab tables.
   */
  @step('Read the table column headers')
  async getBasicInfoHeaders(): Promise<string[]> {
    const raw = await this.page.getByRole('columnheader').allTextContents();
    return raw.map((h) => h.replace(/\s+/g, ' ').trim()).filter((h) => h.length > 0);
  }

  /**
   * Returns whether the Save button is currently enabled.
   * Checks both the disabled property and aria-disabled attribute.
   */
  @step('Check whether the Save button is enabled')
  async isSaveEnabled(timeout = 5_000): Promise<boolean> {
    const btn = this.page.locator(sc.save).first();
    await btn.waitFor({ state: 'attached', timeout });
    const isDisabled = await btn.isDisabled();
    const ariaDisabled = await btn.getAttribute('aria-disabled');
    return !isDisabled && ariaDisabled !== 'true';
  }

  /**
   * Polls until the Save button becomes enabled. Returns true if it enables within the
   * budget, false otherwise.
   */
  @step('Wait for the Save button to become enabled')
  async waitForSaveActive(timeout = 10_000): Promise<boolean> {
    await expect.poll(() => this.isSaveEnabled(), { timeout }).toBe(true);
    return true;
  }

  /**
   * Polls until the Save button becomes disabled. Returns true if it disables within the
   * budget, false otherwise.
   */
  @step('Wait for the Save button to become disabled')
  async waitForSaveInactive(timeout = 10_000): Promise<boolean> {
    await expect.poll(() => this.isSaveEnabled(), { timeout }).toBe(false);
    return true;
  }

  // ---------------------------------------------------------------- editing

  /**
   * Resolves the percentage input at the given row index and waits until it is enabled.
   *
   * All 79 percentage inputs render disabled for ~30 seconds after every navigation or
   * reload before enabling all at once. The 60 000 ms budget matches waitUntilLoaded()
   * so every interaction path (initial load, reload, afterEach restore) gets the same
   * headroom regardless of whether the caller went through waitUntilLoaded() first.
   */
  private async resolveEnabledPercentageField(index: number) {
    const field = this.page.locator(sc.percentageByIndex(index)).first();
    await expect(field).toBeEnabled({ timeout: 60_000 });
    return field;
  }

  /**
   * Sets the percentage value at the given row index. Waits for the field to be enabled
   * before interacting — percentage inputs are disabled for ~30 s after every navigation
   * or reload. Clears the field, types the new value, and presses Tab to move focus away
   * and trigger Angular change detection.
   *
   * The 400 ms settle after Tab is intentionally kept as a fixed wait. A deterministic
   * signal (e.g. Save button enabling) cannot be used here because restore paths set the
   * value back to the saved default, which produces a net-zero change — Save stays
   * disabled — making Save-enabled an unreliable gate for this method.
   */
  @step('Set a percentage value by row index')
  async setPercentageByIndex(index: number, value: string): Promise<void> {
    const field = await this.resolveEnabledPercentageField(index);
    await field.click();
    await field.fill(value);
    await this.page.keyboard.press('Tab');
    await this.page.waitForTimeout(400);
  }

  /**
   * Sets the percentage value for a named service type.
   * Row index is resolved from SC_SERVICE_TYPE_INDEX.
   * Throws if the service-type name is not present in the map.
   */
  @step('Set a percentage value by service type name')
  async setPercentageByServiceType(serviceType: string, value: string): Promise<void> {
    const index = SC_SERVICE_TYPE_INDEX[serviceType];
    if (index === undefined) {
      throw new Error(`Service type not found in index map: "${serviceType}"`);
    }
    await this.setPercentageByIndex(index, value);
  }

  /**
   * Clicks the Save button.
   * This page saves silently — no confirmation dialog appears after clicking Save.
   * After clicking, callers should wait for waitUntilLoaded() to confirm the save completed.
   */
  @step('Click the Save button')
  async clickSave(): Promise<void> {
    await this.page.locator(sc.save).first().click();
  }

  // ---------------------------------------------------------------- History tab

  /**
   * Waits until the Service Charge History grid has finished loading — skeletons are gone
   * and at least one data row with non-empty cells is visible.
   *
   * The grid populates asynchronously after tab activation. Waiting for skeleton
   * disappearance alone is insufficient — rows exist in the DOM while still being
   * placeholders. This method first waits for all skeletons to clear, then polls until
   * getHistoryRows() returns at least one row. No fixed sleeps; uses web-first assertions.
   */
  @step('Wait for the Service Charge History grid to finish loading')
  async waitUntilHistoryLoaded(timeout = 90_000): Promise<void> {
    await expect(this.page.locator(sc.skeleton)).toHaveCount(0, { timeout });
    await expect
      .poll(async () => (await this.getHistoryRows()).length > 0, { timeout: 30_000 })
      .toBe(true);
  }

  /**
   * Returns the page `<h1>` heading text, trimmed and normalised.
   * The heading reads "Service Charge" on both tabs; NM-3300 tracks a known defect where
   * the office name is missing (expected: "Service Charge — Parker Palm Springs").
   */
  @step('Read the page heading')
  async getPageHeading(): Promise<string> {
    const raw = await this.page.locator('h1').first().textContent();
    return (raw ?? '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Returns the number of data rows currently visible in the Service Charge History grid.
   * Delegates to getHistoryRows() so skeleton rows are excluded from the count.
   * The spec decides what to assert — this method only reports the count.
   */
  @step('Count the rows in the Service Charge History grid')
  async getHistoryRowCount(): Promise<number> {
    return (await this.getHistoryRows()).length;
  }

  /**
   * Searches the History tab panel for pagination, filter, search, and date-range controls
   * and returns a structured evidence object.
   *
   * Returns counts of each selector searched so absence cases can document exactly what was
   * looked for — "we looked and found nothing" is distinguishable from "we never looked".
   * Must be called while the History tab is active.
   */
  @step('Scan the History tab for pagination, filter, search, and date-range controls')
  async getHistoryControlCensus(): Promise<{
    paginationAriaLabelCount: number;
    roleNavigationCount: number;
    nextPrevButtonCount: number;
    pageSizeSelectorCount: number;
    loadMoreCount: number;
    filterInputCount: number;
    searchInputCount: number;
    dateRangePickerCount: number;
    selectorsSearched: string[];
  }> {
    const p = this.page;
    const [
      paginationAriaLabelCount,
      roleNavigationCount,
      nextPrevButtonCount,
      pageSizeSelectorCount,
      loadMoreCount,
      filterInputCount,
      searchInputCount,
      dateRangePickerCount,
    ] = await Promise.all([
      p.locator('[aria-label*="page" i]').count(),
      p.locator('[role="navigation"]').count(),
      p
        .locator('button')
        .filter({ hasText: /next|prev(ious)?/i })
        .count(),
      p.locator('select[aria-label*="page" i], [data-testid*="page-size"]').count(),
      p.locator('button').filter({ hasText: /load more/i }).count(),
      p.locator('input').count(),
      p.locator('[aria-label*="search" i], [placeholder*="search" i]').count(),
      p.locator('[aria-label*="date" i], [data-testid*="date-range"]').count(),
    ]);
    return {
      paginationAriaLabelCount,
      roleNavigationCount,
      nextPrevButtonCount,
      pageSizeSelectorCount,
      loadMoreCount,
      filterInputCount,
      searchInputCount,
      dateRangePickerCount,
      selectorsSearched: [
        '[aria-label*="page" i]',
        '[role="navigation"]',
        'button[text~=next/prev]',
        'select[aria-label*="page" i] / [data-testid*="page-size"]',
        'button[text~=load more]',
        'input',
        '[aria-label*="search" i] / [placeholder*="search" i]',
        '[aria-label*="date" i] / [data-testid*="date-range"]',
      ],
    };
  }

  /**
   * Returns whether the Unsaved Changes alertdialog is currently visible.
   *
   * Angular's dirty state does not reliably reset after save. When navigating from
   * Basic Information to History with unsaved edits, the app should present an alertdialog
   * with Save Changes / Discard Changes / Cancel options (NM-3285). Use this method to
   * assert whether the modal appeared.
   */
  @step('Check whether the Unsaved Changes modal is visible')
  async isUnsavedChangesModalVisible(): Promise<boolean> {
    return this.page.locator('[role="alertdialog"]').isVisible();
  }

  /**
   * Returns the column headers of the Service Charge History grid in display order.
   * Must be called after switchToHistoryTab().
   */
  @step('Read the Service Charge History table column headers')
  async getHistoryHeaders(): Promise<string[]> {
    const raw = await this.page.getByRole('columnheader').allTextContents();
    return raw.map((h) => h.replace(/\s+/g, ' ').trim()).filter((h) => h.length > 0);
  }

  /**
   * Returns all visible data rows from the Service Charge History grid as arrays of cell text.
   * Row content was not observable during exploration (the grid rendered loading skeletons only).
   * Returns what is rendered; empty result means no rows loaded or tab not yet switched to.
   * NEEDS-LIVE-CONFIRM: that row cell content is accessible via textContent on this table.
   */
  @step('Read all rows from the Service Charge History table')
  async getHistoryRows(): Promise<string[][]> {
    const rows = this.page.getByRole('row');
    const count = await rows.count();
    const result: string[][] = [];
    // Row at index 0 is the header row — start from 1.
    for (let i = 1; i < count; i++) {
      const cells = await rows.nth(i).getByRole('cell').allTextContents();
      const clean = cells.map((c) => c.replace(/\s+/g, ' ').trim());
      // Skip skeleton rows — they render as empty cells.
      if (clean.some((c) => c.length > 0)) {
        result.push(clean);
      }
    }
    return result;
  }
}
