import { Page } from '@playwright/test';
import { BasePage } from '../../core/base-page';
import { Log } from '../../utils/logger';
import { IConfig } from '../../types';
import { DynamicSelectors } from '../../selectors';
import { CheckboxState } from './location-form-helpers.page';

export class LocationPricingPage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
    Log.info('LocationPricingPage initialized');
  }

 // ---------------------------------------------------------------------------
 // NAVIGATION
 // ---------------------------------------------------------------------------

 /**
 * Navigate to the Pricing tab for the given office.
 * Delegates to BasePage.navigateToSubTab (shared tab nav pattern).
 */
  async navigateToPricingTab(officeNo: string = '1604'): Promise<void> {
    await this.navigateToSubTab('tabPricing', 'chkCorporatePricing', officeNo);
 // Wait for pricing API to populate persisted checkbox states (default render is unchecked).
    await this.waitForPricingDataLoaded();
  }

 /**
 * Detect whether the Pricing tab is currently rendered (DOM presence of chkCorporatePricing).
 * Encore sub-tabs share `settings/location` URL — URL-based detection is unreliable after a
 * sibling spec like Notes; DOM presence is the reliable signal.
 */
  async isOnPricingTab(): Promise<boolean> {
    return (await this.getElement('chkCorporatePricing').count()) > 0;
  }

 /**
 * Force-reload the current page and re-select the Pricing tab.
 * MNT-003: delegates to navigate-away + navigateToSubTab instead of reimplementing.
 */
  async reloadPricingTab(officeNo: string = '1604'): Promise<void> {
    const base = this.config?.base_url || '';
 // After Save→Cancel, form stays dirty. safeNavigateTo handles beforeunload dialog.
    await this.safeNavigateTo(`${base}locations`, { waitUntil: 'domcontentloaded' });
    await this.navigateToPricingTab(officeNo);
  }

 /**
 * Wait for the pricing API data to fully load after tab navigation.
 * The Pricing tab renders checkboxes with DEFAULT state before the API response
 * populates them with persisted values. networkidle alone is unreliable because
 * Angular's change detection applies API data to DOM attributes AFTER the HTTP
 * response is received (async gap). RCA PRI-025: in serial runs, this gap widens
 * enough that checkbox reads return stale default values.
 * Signal: Primary Labor Pricing dropdown value becomes non-empty (populated by API).
 */
  async waitForPricingDataLoaded(): Promise<void> {
    await this.waitForAngularStable();
 // Signal 1: Primary Labor Pricing dropdown value populated by API
    const dropdown = this.getElement('drpPrimaryLaborPricingUSD');
    for (let i = 0; i < 40; i++) {
      const text = (await dropdown.textContent() ?? '').trim();
      if (text.length > 0 && text !== 'Select') break;
      await this.page.waitForTimeout(250);
    }
 // Signal 2: Grid rows rendered — grid data loads AFTER dropdown in a separate
 // Angular change detection cycle. Without this, date inputs and checkbox states
 // read as empty/default (PRI-020 flakiness).
    const gridRows = this.page.locator('[role="tabpanel"] table tbody tr');
    for (let i = 0; i < 20; i++) {
      const count = await gridRows.count();
      if (count > 0) break;
      await this.page.waitForTimeout(250);
    }
 // Signal 3: Final Angular stability pass — ensures checkbox aria-checked and
 // date input values reflect persisted state (not default render values).
    await this.waitForAngularStable();
  }

 // ---------------------------------------------------------------------------
 // CHECKBOX OPERATIONS (static selectors -- top section)
 // ---------------------------------------------------------------------------

 /** Get checked/disabled state of a static checkbox (Corporate Pricing, Price Guide Inclusive).
 * Delegates to BasePage.getRadixCheckboxState (Radix button[role="checkbox"] uses aria-checked). */
  async getCheckboxState(selectorKey: string): Promise<CheckboxState> {
    return this.getRadixCheckboxState(selectorKey);
  }

 /** Ensure a static checkbox is checked. Delegates to BasePage.setRadixCheckbox. */
  async checkCheckbox(selectorKey: string): Promise<void> {
    await this.setRadixCheckbox(selectorKey, true);
  }

 /** Ensure a static checkbox is unchecked. Delegates to BasePage.setRadixCheckbox. */
  async uncheckCheckbox(selectorKey: string): Promise<void> {
    await this.setRadixCheckbox(selectorKey, false);
  }

 // ---------------------------------------------------------------------------
 // PRIMARY PRICING DROPDOWNS
 // ---------------------------------------------------------------------------

 /** Check if a primary pricing dropdown is enabled. */
  async isDropdownEnabled(selectorKey: string): Promise<boolean> {
    const el = this.getElement(selectorKey);
    const disabled = await el.isDisabled().catch(() => true);
    Log.info(`${selectorKey} enabled: ${!disabled}`);
    return !disabled;
  }

 /** Get the current value of a primary pricing dropdown. MNT-012: delegates to BasePage.getFieldDisplayValue. */
  async getDropdownValue(selectorKey: string): Promise<string> {
    return this.getFieldDisplayValue(selectorKey);
  }

 /** Verify all 5 primary pricing dropdowns are enabled/disabled. */
  async verifyPrimaryDropdownStates(keys: readonly string[], expectedEnabled: boolean): Promise<{ allPassed: boolean; failures: string[] }> {
    const failures: string[] = [];
    for (const key of keys) {
      const enabled = await this.isDropdownEnabled(key);
      if (enabled !== expectedEnabled) {
        failures.push(`${key}: expected enabled=${expectedEnabled}, got ${enabled}`);
      }
    }
    return { allPassed: failures.length === 0, failures };
  }

 /**
 * Select a pricebook option from a primary pricing dropdown popover.
 * MCP-verified : combobox opens a dialog[name="Popover Content"] containing
 * a search textbox (placeholder "Search pricebooks...") and option buttons.
 * IMPORTANT: clicking an already-selected option DESELECTS it (Radix toggle behavior).
 * This method skips interaction when the target value is already displayed.
 * @param selectorKey - selector key for the combobox (e.g., 'drpPrimaryLaborPricingUSD')
 * @param optionText - exact pricebook name to select
 */
  async selectPrimaryDropdownOption(selectorKey: string, optionText: string): Promise<void> {
 // Skip if already set -- clicking an already-selected option toggles it off (Radix behavior)
    const currentValue = await this.getDropdownValue(selectorKey);
    if (currentValue === optionText) {
      Log.info(`${selectorKey} already shows "${optionText}" -- skipping (toggle-safe)`);
      return;
    }
    await this.getElement(selectorKey).click();
    const dialog = this.page.getByRole('dialog', { name: 'Popover Content' });
    await dialog.waitFor({ state: 'visible', timeout: 5_000 });
 // Search for the option (the list is virtualized with 100+ entries)
    const searchInput = dialog.getByRole('textbox', { name: 'Search pricebooks...' });
    await searchInput.fill(optionText);
 // Wait for the filtered option button to appear
    const optionBtn = dialog.getByRole('button', { name: optionText, exact: true });
    await optionBtn.waitFor({ state: 'visible', timeout: 5_000 });
    await optionBtn.click();
    await dialog.waitFor({ state: 'hidden', timeout: 5_000 });
    Log.info(`[OK] Selected "${optionText}" for ${selectorKey}`);
  }

 // ---------------------------------------------------------------------------
 // CURRENCY FILTER
 // ---------------------------------------------------------------------------

 /** Get the current text of the currency filter dropdown. MNT-012: delegates to BasePage.getFieldDisplayValue. */
  async getCurrencyFilterValue(): Promise<string> {
    return this.getFieldDisplayValue('drpCurrencyFilter');
  }

 /** Open currency filter dropdown and get all option texts.
 * Delegates to BasePage.getComboboxOptions (shared Radix listbox pattern).
 * B5' (PRI stabilization): outer try/finally fires Escape on the failure path
 * if the upstream open throws before BasePage's internal Escape runs. Defensive only;
 * Escape on already-closed popover is a safe no-op in Radix. */
  async getCurrencyFilterOptions(): Promise<string[]> {
    try {
      return await this.getComboboxOptions('drpCurrencyFilter');
    } finally {
      await this.page.keyboard.press('Escape').catch(() => {});
    }
  }

 /** Select a currency filter option by its display text. */
  async selectCurrencyFilter(optionText: string): Promise<void> {
    await this.getElement('drpCurrencyFilter').click();
    await this.page.waitForTimeout(500);
    const option = this.page.locator(DynamicSelectors.optCurrencyFilter(optionText));
    await option.waitFor({ state: 'visible', timeout: 5_000 });
    await option.click();
    Log.info(`Currency filter -> ${optionText}`);
  }

 // ---------------------------------------------------------------------------
 // COLUMN HEADERS
 // ---------------------------------------------------------------------------

 /** Get the text of all 7 column headers in the secondary pricing grid. */
  async getColumnHeaders(): Promise<string[]> {
    return this.getColumnHeadersByKeys([
      'colHeaderPricingStrategy', 'colHeaderPricebook', 'colHeaderCurrency',
      'colHeaderIsAlternative', 'colHeaderUseEffectiveDate',
      'colHeaderStartDate', 'colHeaderEndDate',
    ]);
  }

 // ---------------------------------------------------------------------------
 // GRID ROW OPERATIONS (dynamic selectors)
 // ---------------------------------------------------------------------------

 /** Check if a price book row exists in the grid (DOM presence, not viewport visibility). */
  async isGridRowVisible(priceBookName: string): Promise<boolean> {
    const selector = DynamicSelectors.rowPriceBook(priceBookName);
    const count = await this.page.locator(selector).count();
    Log.info(`Row "${priceBookName}" present: ${count > 0}`);
    return count > 0;
  }

 /** Check if a price book row is displayed (CSS visible, not just DOM presence). Safe for filter tests. */
  async isGridRowDisplayed(priceBookName: string): Promise<boolean> {
    const selector = DynamicSelectors.rowPriceBook(priceBookName);
    const loc = this.page.locator(selector);
    const count = await loc.count();
    if (count === 0) return false;
    return loc.first().isVisible().catch(() => false);
  }

 /** Get total number of visible rows in the grid. */
  async getGridRowCount(): Promise<number> {
    const count = await this.page.locator('[role="tabpanel"] table tbody tr').count();
    Log.info(`Grid row count: ${count}`);
    return count;
  }

 /** Get Is Alternative checkbox state for a grid row. */
  async getIsAlternativeState(priceBookName: string): Promise<CheckboxState> {
    const selector = DynamicSelectors.chkIsAlternative(priceBookName);
    const el = this.page.locator(selector);
 // Radix grid checkboxes: button[role="checkbox"] with aria-checked, not native input
    const ariaChecked = await el.getAttribute('aria-checked').catch(() => null);
    const checked = ariaChecked === 'true';
    const disabled = await el.isDisabled().catch(() => true);
    Log.info(`Is Alternative [${priceBookName}]: checked=${checked} disabled=${disabled}`);
    return { checked, disabled };
  }

 /** Get Use Effective Date checkbox state for a grid row. */
  async getUseEffectiveDateState(priceBookName: string): Promise<CheckboxState> {
    const selector = DynamicSelectors.chkUseEffectiveDate(priceBookName);
    const el = this.page.locator(selector);
 // Radix grid checkboxes: button[role="checkbox"] with aria-checked, not native input
    const ariaChecked = await el.getAttribute('aria-checked').catch(() => null);
    const checked = ariaChecked === 'true';
    const disabled = await el.isDisabled().catch(() => true);
    Log.info(`Use Effective Date [${priceBookName}]: checked=${checked} disabled=${disabled}`);
    return { checked, disabled };
  }

 /** Check the Is Alternative checkbox for a grid row (click only if unchecked). */
  async checkIsAlternative(priceBookName: string): Promise<void> {
    const state = await this.getIsAlternativeState(priceBookName);
    if (!state.checked) {
      const selector = DynamicSelectors.chkIsAlternative(priceBookName);
      await this.page.locator(selector).click();
      Log.info(`Checked Is Alternative: ${priceBookName}`);
    }
  }

 /** Uncheck the Is Alternative checkbox for a grid row (click only if checked). */
  async uncheckIsAlternative(priceBookName: string): Promise<void> {
    const state = await this.getIsAlternativeState(priceBookName);
    if (state.checked) {
      const selector = DynamicSelectors.chkIsAlternative(priceBookName);
      await this.page.locator(selector).click();
      Log.info(`Unchecked Is Alternative: ${priceBookName}`);
    }
  }

 /** Check the Use Effective Date checkbox for a grid row (click only if unchecked). */
  async checkUseEffectiveDate(priceBookName: string): Promise<void> {
    const state = await this.getUseEffectiveDateState(priceBookName);
    if (!state.checked) {
      const selector = DynamicSelectors.chkUseEffectiveDate(priceBookName);
      await this.page.locator(selector).click();
      Log.info(`Checked Use Effective Date: ${priceBookName}`);
    }
  }

 /** Uncheck the Use Effective Date checkbox for a grid row (click only if checked). */
  async uncheckUseEffectiveDate(priceBookName: string): Promise<void> {
    const state = await this.getUseEffectiveDateState(priceBookName);
    if (state.checked) {
      const selector = DynamicSelectors.chkUseEffectiveDate(priceBookName);
      await this.page.locator(selector).click();
      Log.info(`Unchecked Use Effective Date: ${priceBookName}`);
    }
  }

 /** Check if the Start Date button/field is enabled for a grid row. */
  async isStartDateEnabled(priceBookName: string): Promise<boolean> {
    const selector = DynamicSelectors.dtpStartDate(priceBookName);
    const el = this.page.locator(selector);
    const disabled = await el.isDisabled().catch(() => true);
    Log.info(`Start Date [${priceBookName}] enabled: ${!disabled}`);
    return !disabled;
  }

 /** Check if the End Date button/field is enabled for a grid row. */
  async isEndDateEnabled(priceBookName: string): Promise<boolean> {
    const selector = DynamicSelectors.dtpEndDate(priceBookName);
    const el = this.page.locator(selector);
    const disabled = await el.isDisabled().catch(() => true);
    Log.info(`End Date [${priceBookName}] enabled: ${!disabled}`);
    return !disabled;
  }

 /** Get the Start Date input value for a grid row. */
  async getStartDateValue(priceBookName: string): Promise<string> {
    const selector = DynamicSelectors.dtpStartDate(priceBookName);
    const input = this.page.locator(selector);
    return (await input.inputValue().catch(() => '')).trim();
  }

 /** Get the End Date input value for a grid row. */
  async getEndDateValue(priceBookName: string): Promise<string> {
    const selector = DynamicSelectors.dtpEndDate(priceBookName);
    const input = this.page.locator(selector);
    return (await input.inputValue().catch(() => '')).trim();
  }

 /** Enter a date via calendar popover for the Start Date field. dateValue format: MM/DD/YYYY. */
  async enterStartDate(priceBookName: string, dateValue: string): Promise<void> {
    await this.selectDateFromCalendar(priceBookName, 6, dateValue);
    Log.info(`Entered Start Date [${priceBookName}]: ${dateValue}`);
  }

 /** Enter a date via calendar popover for the End Date field. dateValue format: MM/DD/YYYY. */
  async enterEndDate(priceBookName: string, dateValue: string): Promise<void> {
    await this.selectDateFromCalendar(priceBookName, 7, dateValue);
    Log.info(`Entered End Date [${priceBookName}]: ${dateValue}`);
  }

 /** Check whether the Start Date input has the readOnly attribute (Radix calendar-only input). */
  async isStartDateReadOnly(priceBookName: string): Promise<boolean> {
    const selector = DynamicSelectors.dtpStartDate(priceBookName);
    const el = this.page.locator(selector);
    return (await el.getAttribute('readonly')) !== null;
  }

 /** Check whether the End Date input has the readOnly attribute (Radix calendar-only input). */
  async isEndDateReadOnly(priceBookName: string): Promise<boolean> {
    const selector = DynamicSelectors.dtpEndDate(priceBookName);
    const el = this.page.locator(selector);
    return (await el.getAttribute('readonly')) !== null;
  }

 /**
 * Check whether a date-missing validation message is visible.
 * The validation tooltip only renders while the calendar popover is open.
 * Caller must ensure the popover is already open before calling this.
 */
  async hasDateValidationError(): Promise<boolean> {
    const msg = this.page.locator('text=/Pricing Effective.*date.*must be set/');
    return (await msg.count()) > 0;
  }

 /**
 * Open the Start Date calendar popover for a grid row (does not select a date).
 * Useful for triggering/checking the validation tooltip.
 */
  async openStartDatePopover(priceBookName: string): Promise<void> {
    const row = this.page.locator(DynamicSelectors.rowPriceBook(priceBookName));
    const cell = row.locator('td:nth-child(6)');
    await cell.getByRole('button', { name: 'Open popover' }).click();
 // Wait for calendar dialog to appear
    const dialog = this.page.getByRole('dialog', { name: 'Popover Content' });
    await dialog.waitFor({ state: 'visible', timeout: 5_000 });
    Log.info(`Opened Start Date popover for ${priceBookName}`);
  }

 /**
 * Open the End Date calendar popover for a grid row (does not select a date).
 * Useful for triggering/checking the validation tooltip.
 */
  async openEndDatePopover(priceBookName: string): Promise<void> {
    const row = this.page.locator(DynamicSelectors.rowPriceBook(priceBookName));
    const cell = row.locator('td:nth-child(7)');
    await cell.getByRole('button', { name: 'Open popover' }).click();
    const dialog = this.page.getByRole('dialog', { name: 'Popover Content' });
    await dialog.waitFor({ state: 'visible', timeout: 5_000 });
    Log.info(`Opened End Date popover for ${priceBookName}`);
  }

 /** Close any open calendar popover by pressing Escape. */
  async closeDatePopover(): Promise<void> {
    await this.page.keyboard.press('Escape');
 // Wait for the dialog to disappear
    const dialog = this.page.getByRole('dialog', { name: 'Popover Content' });
    await dialog.waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => {});
    Log.info('Closed date popover');
  }

 /**
 * Select a date via the Radix calendar popover. Opens the popover, navigates to the
 * target month/year, then clicks the target day button. Popover auto-closes on selection.
 * @param colIndex 6 = Start Date, 7 = End Date
 */
  private static readonly MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  private getOrdinalSuffix(day: number): string {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  private async selectDateFromCalendar(
    priceBookName: string, colIndex: number, dateValue: string,
  ): Promise<void> {
    const parts = dateValue.split('/').map(Number);
    const monthNum = parts[0] as number;
    const dayNum = parts[1] as number;
    const yearNum = parts[2] as number;
    const targetMonthName = LocationPricingPage.MONTH_NAMES[monthNum - 1];
    const targetLabel = `${targetMonthName} ${yearNum}`;

 // Open the calendar popover for the target cell
    const row = this.page.locator(DynamicSelectors.rowPriceBook(priceBookName));
 // Scroll grid row to center of viewport before opening popover — prevents popover rendering off-screen
    await row.scrollIntoViewIfNeeded();
    const cell = row.locator(`td:nth-child(${colIndex})`);
 // MCP-RCA : The popover trigger is a <div role="button" aria-label="Open popover">.
 // After enableFullCascade, Angular needs a render cycle to remove aria-disabled and
 // pointer-events:none. Wait for the trigger to be interactive before clicking.
    const trigger = cell.locator('[role="button"][aria-label="Open popover"]:not([aria-disabled="true"])');
    await trigger.waitFor({ state: 'visible', timeout: 10_000 });
    await trigger.click();

 // Wait for calendar dialog
    const dialog = this.page.getByRole('dialog', { name: 'Popover Content' });
    await dialog.waitFor({ state: 'visible', timeout: 5_000 });

 // Navigate to the target month/year.
 // MCP-RCA : dispatchEvent('click') fires a raw Event that React/Radix
 // processes unreliably (label may not update). Use force:true click instead —
 // the row.scrollIntoViewIfNeeded above ensures the calendar is in viewport.
 // Poll for the status label change instead of a fixed timeout to avoid race conditions.
    let currentLabel = (await dialog.getByRole('status').textContent() || '').trim();
    let safety = 0;
    while (currentLabel !== targetLabel && safety < 24) {
      const labelParts = currentLabel.split(' ');
      const curMonthName = labelParts[0] || '';
      const curYearStr = labelParts[1] || '0';
      const curMonthIdx = LocationPricingPage.MONTH_NAMES.indexOf(curMonthName);
      const curYear = parseInt(curYearStr);
      const diff = (yearNum - curYear) * 12 + ((monthNum - 1) - curMonthIdx);
      if (diff === 0) break;
      const navBtn = diff > 0
        ? dialog.getByRole('button', { name: 'Go to the Next Month' })
        : dialog.getByRole('button', { name: 'Go to the Previous Month' });
 // MCP-RCA : dispatchEvent('click') fires a raw Event that React ignores.
 // Regular .click and .click({force:true}) fail with "outside viewport" for rows
 // near the bottom of the grid. HTMLElement.click (via evaluate) bypasses viewport
 // checks entirely and fires a real click event that React's synthetic event system handles.
      await navBtn.evaluate((el) => (el as HTMLElement).click());
 // Poll until the status label changes (React re-render is async)
      const oldLabel = currentLabel;
      for (let i = 0; i < 20; i++) {
        await this.page.waitForTimeout(50);
        currentLabel = (await dialog.getByRole('status').textContent() || '').trim();
        if (currentLabel !== oldLabel) break;
      }
      safety++;
    }

 // Click the target day cell — use regular click (day cells are inside the visible dialog,
 // unlike month nav buttons which can be outside viewport). Regular click triggers Radix
 // event handlers that update the date value in Angular's model.
    const suffix = this.getOrdinalSuffix(dayNum);
    const dayPattern = `${targetMonthName} ${dayNum}${suffix}, ${yearNum}`;
    await dialog
      .getByRole('gridcell', { name: new RegExp(dayPattern) })
      .getByRole('button')
      .click();
  }

 /**
 * Enable the full cascade for a grid row: Is Alternative -> Use Effective Date.
 * Utility for tests that need date fields enabled.
 */
  async enableFullCascade(priceBookName: string): Promise<void> {
    await this.checkIsAlternative(priceBookName);
 // checkbox cascade is async — poll until Use Effective Date is enabled
 // before clicking it. Without this, checkUseEffectiveDate hits a disabled checkbox (no-op).
    let cascadeReady = false;
    for (let i = 0; i < 20; i++) {
      const state = await this.getUseEffectiveDateState(priceBookName);
      if (!state.disabled) { cascadeReady = true; break; }
      await this.page.waitForTimeout(250);
    }
    if (!cascadeReady) {
      Log.warn(`[WARN] UseEffectiveDate still disabled after 5s poll for ${priceBookName}`);
    }
    await this.checkUseEffectiveDate(priceBookName);
    Log.info(`Full cascade enabled for ${priceBookName}`);
  }

 /**
 * Count interactive elements (button, input, checkbox, combobox) in a grid row's
 * read-only columns (Pricing Strategy, Pricebook, Currency — columns 1-3).
 * Returns 0 if all three columns are display-only as expected.
 */
  async getReadOnlyColumnInteractiveCount(priceBookName: string): Promise<number> {
    const row = this.page.locator(DynamicSelectors.rowPriceBook(priceBookName));
    let total = 0;
    for (const colIdx of [1, 2, 3]) {
      const cell = row.locator(`td:nth-child(${colIdx})`);
      total += await cell.locator('button, input, [role="checkbox"], [role="combobox"]').count();
    }
    Log.info(`Read-only columns [${priceBookName}]: ${total} interactive elements`);
    return total;
  }

 /**
 * Reset a grid row to defaults: uncheck Is Alternative (cascades clear everything).
 * Use after tests that modify row state to avoid side effects on subsequent serial tests.
 */
  async resetGridRow(priceBookName: string): Promise<void> {
    await this.uncheckIsAlternative(priceBookName);
    Log.info(`Row reset: ${priceBookName}`);
  }

 // ---------------------------------------------------------------------------
 // SAVE (Pricing-specific)
 // ---------------------------------------------------------------------------

 /** Check if the Pricing Save button is enabled. */
  async isSaveEnabled(): Promise<boolean> {
    const el = this.getElement('btnSavePricing');
    const disabled = await el.isDisabled().catch(() => true);
    Log.info(`Pricing Save enabled: ${!disabled}`);
    return !disabled;
  }

 /**
 * Wait for the Save button to become enabled (form dirty state propagation).
 * MNT-004 + MNT-012: delegates to BasePage.waitForSaveEnabled (no hardcoded selectors).
 * @param saveBtnKey - defaults to 'btnSavePricing' for this tab
 * @param timeout - defaults to 5000ms
 */
  async waitForSaveEnabled(saveBtnKey = 'btnSavePricing', timeout = 5_000): Promise<boolean> {
    return super.waitForSaveEnabled(saveBtnKey, timeout);
  }

 /**
 * Click the Pricing Save button and confirm the Save Changes dialog if it appears.
 * Delegates to BasePage.clickSaveWithDialog (shared save dialog pattern).
 */
  async clickSave(): Promise<{ success: boolean; networkError?: string }> {
    return this.clickSaveWithDialog('btnSavePricing');
  }

 /** Click the Save button WITHOUT confirming the dialog. Opens the Save Changes dialog. */
  async clickSaveButton(): Promise<void> {
    const el = this.getElement('btnSavePricing');
    await el.click();
    await this.getElement('dlgSaveChanges').waitFor({ state: 'visible', timeout: 5_000 });
    Log.info('Clicked Save button — dialog opened');
  }

 /** Click Cancel on the Save Changes dialog (dismiss without saving). */
  async clickSaveCancel(): Promise<void> {
    await this.getElement('btnSaveChangesCancel').click();
    await this.getElement('dlgSaveChanges').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
    Log.info('Clicked Save Cancel — dialog dismissed');
  }

 /** Check if the Save Changes dialog is currently visible. */
  async isSaveDialogVisible(): Promise<boolean> {
    return this.getElement('dlgSaveChanges').isVisible();
  }

 // ---------------------------------------------------------------------------
 // UNSAVED CHANGES DIALOG
 // ---------------------------------------------------------------------------

 /** Click sidebar Home link to trigger unsaved changes dialog. Suppresses beforeunload to get app-level dialog. */
  async clickSidebarHome(): Promise<void> {
    const homeLink = this.page.getByRole('link', { name: 'Home' });
    if (!await homeLink.isVisible().catch(() => false)) {
      await this.page.setViewportSize({ width: 1920, height: 1080 });
      await homeLink.waitFor({ state: 'visible', timeout: 5_000 });
    }
 // Suppress beforeunload so the app-level "Unsaved changes" alertdialog fires instead
    await this.page.evaluate(() => {
      window.onbeforeunload = null;
      window.addEventListener('beforeunload', (e) => e.stopImmediatePropagation(), true);
    });
    await homeLink.click();
  }

 /** Wait for the Unsaved Changes dialog and check visibility. */
  async isUnsavedDialogVisible(): Promise<boolean> {
    const dlg = this.page.locator('[data-testid="location-settings-modal-unsaved-changes"]');
    return dlg.waitFor({ state: 'visible', timeout: 5_000 }).then(() => true).catch(() => false);
  }

 /** Click Stay on the Unsaved Changes dialog. */
  async clickUnsavedStay(): Promise<void> {
    const dlg = this.page.locator('[data-testid="location-settings-modal-unsaved-changes"]');
    await dlg.locator('button:has-text("Stay")').click();
    await dlg.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
    Log.info('Clicked Stay on Unsaved Changes dialog');
  }
}
