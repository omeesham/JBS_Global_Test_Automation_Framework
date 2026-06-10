import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { Log } from '../../utils/logger';
import { IConfig } from '../../types';
import { PHONE1_BASELINE } from '../../data/locations/location-account-address';

export class LocationAccountAddressPage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
    Log.info('LocationAccountAddressPage initialized');
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // NAVIGATION
 // ─────────────────────────────────────────────────────────────────────────────

 /**
 * Group D-2 (lifecycle refactor 2026-05-21): DOM-presence guard so
 * beforeEach can avoid re-navigating when already on the tab. URL `settings/location` is
 * shared across all sub-tabs and is an unreliable signal after a sibling spec.
 */
  async isOnAccountAndAddressTab(): Promise<boolean> {
    // Fix #4a (radix-tab-dom 2026-05-22):
    // pnlAccountAndAddress is a panel-wrapper testid that Radix keeps mounted across
    // all tab states (count() > 0 returns TRUE even when this tab is inactive). The
    // tab trigger's aria-selected is the only reliable signal — mirrors base-page.ts:448.
    const tab = this.getElement('tabAccountAndAddress');
    if ((await tab.count()) === 0) return false;
    return (await tab.getAttribute('aria-selected').catch(() => null)) === 'true';
  }

 /** Navigate to Account and Address tab for the given office. Waits for API to load content. */
  async navigateToAccountAndAddressTab(officeNo: string = '1604'): Promise<void> {
    await this.navigateToSubTab('tabAccountAndAddress', 'pnlAccountAndAddress', officeNo);
 // Account & Address API can be slow — wait for Phone 1 field to be populated (always present)
    const phone1Field = this.getElement('txtAccPhone1');
    await phone1Field.waitFor({ state: 'visible', timeout: 30_000 });
    await this.page.waitForFunction(
      (selector: string) => {
        const el = document.querySelector(selector) as HTMLInputElement;
        return el && el.value.trim().length > 0;
      },
      '[data-testid="location-settings-input-contact-phone-1"]',
      { timeout: 15_000 }
    );
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // VENUE/BRANCH ACCOUNT CARD
 // ─────────────────────────────────────────────────────────────────────────────

 /** Check if the Venue Name textbox is disabled. */
  async isVenueNameDisabled(): Promise<boolean> {
    return this.getElement('txtAccVenueName').isDisabled();
  }

 /** Get the current value of the Venue Name field. */
  async getVenueNameValue(): Promise<string> {
    return this.getFieldDisplayValue('txtAccVenueName');
  }

 /** Get the current value of Phone 1. */
  async getPhone1Value(): Promise<string> {
    return this.getFieldDisplayValue('txtAccPhone1');
  }

 /** Get the current value of Phone 2. */
  async getPhone2Value(): Promise<string> {
    return this.getFieldDisplayValue('txtAccPhone2');
  }

 /** Clear Phone 1, blur, and check for validation error. */
  async clearPhone1AndBlur(): Promise<void> {
    const el = this.getElement('txtAccPhone1');
    await el.clear();
    await el.press('Tab');
    Log.info('Cleared Phone 1 and blurred');
  }

 /** Fill Phone 1 with a value. Phone mask transforms input, so skip fill-verify. */
  async fillPhone1(value: string): Promise<void> {
    await this.fillWithValidation('txtAccPhone1', value, { verify: false });
    await this.getElement('txtAccPhone1').press('Tab');
  }

 /** Fill Phone 2 with a value. Phone mask transforms input, so skip fill-verify. */
  async fillPhone2(value: string): Promise<void> {
    await this.fillWithValidation('txtAccPhone2', value, { verify: false });
    await this.getElement('txtAccPhone2').press('Tab');
  }

 /** Check if Phone 1 has aria-invalid="true". */
  async isPhone1Invalid(): Promise<boolean> {
    const val = await this.getElement('txtAccPhone1').getAttribute('aria-invalid');
    return val === 'true';
  }

 /** Check if Phone 2 has aria-invalid state. */
  async isPhone2Invalid(): Promise<boolean> {
    const val = await this.getElement('txtAccPhone2').getAttribute('aria-invalid');
    return val === 'true';
  }

 /** Check if the validation error icon is visible next to Phone 1 (app uses SVG icon, not text). */
  async isPhone1ErrorIconVisible(): Promise<boolean> {
    const input = this.getElement('txtAccPhone1');
 // Error icon is an SVG inside a tooltip-trigger div, sibling of the input within the same parent
    const icon = input.locator('..').locator('svg');
    return (await icon.count()) > 0 && (await icon.first().isVisible());
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // VENUE DISPLAY FIELD READERS
 // ─────────────────────────────────────────────────────────────────────────────

 /** Get the venue address line text (first dd after Address button). */
  async getVenueAddressText(): Promise<string> {
    const panel = this.getPanel();
    const venueSection = panel.locator(':text("Venue/Branch Account")').locator('..').locator('..');
    const addressDd = venueSection.locator('dt:has-text("Address") + dd').first();
    return (await addressDd.textContent() ?? '').trim();
  }

 /**
 * Get the venue City text (dd element containing city value).
 * Uses positional indexing because City/State/Zip/Country are standalone <dd> elements
 * WITHOUT <dt> labels (see account-address.ts selectors, line 10: "Address display fields
 * are <dd> static text"). Only Name/Address have <dt> labels with buttons.
 * Venue section dd order: [0]=name (textbox), [1]=address, [2]=city, [3]=state, [4]=zip, [5]=country.
 * If the app adds a dd before City, this index must be updated.
 */
  async getVenueCityText(): Promise<string> {
    const cityText = await this.page.evaluate(() => {
      const panel = document.querySelector('[data-testid="location-settings-sub-tab-content-account-and-address"]');
      if (!panel) return '';
      const allDds = panel.querySelectorAll('dd');
      return allDds[2]?.textContent?.trim() ?? '';
    });
    return cityText;
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // CARD SECTION VISIBILITY
 // ─────────────────────────────────────────────────────────────────────────────

 /** Check if the Venue/Branch Account section header is visible. */
  async isVenueCardVisible(): Promise<boolean> {
    const panel = this.getElement('pnlAccountAndAddress');
    return panel.locator(':text("Venue/Branch Account")').isVisible();
  }

 /** Check if the Master Bill To Address section header is visible. */
  async isMasterCardVisible(): Promise<boolean> {
    const panel = this.getElement('pnlAccountAndAddress');
    return panel.locator(':text("Master Bill To Address")').isVisible();
  }

 /** Get the scoped tabpanel locator for Account and Address content. */
  private getPanel() {
    return this.getElement('pnlAccountAndAddress');
  }

 /**
 * Check if a display field in a card section is read-only (static text, no input).
 * @param sectionText - "Venue/Branch Account" or "Master Bill To Address"
 * @param expectedText - The expected text content of the dd element
 * @returns true if the field is present and contains no editable inputs
 */
  async isDisplayFieldReadOnly(sectionText: string, expectedText: string): Promise<boolean> {
    const panel = this.getPanel();
    const section = panel.locator(`:text("${sectionText}")`).locator('..').locator('..');
    const dd = section.locator(`dd:has-text("${expectedText}")`).first();
    const count = await dd.count();
    if (count === 0) return false;
    const inputs = await dd.locator('input, textarea, [contenteditable="true"]').count();
    return inputs === 0;
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // ACCOUNT LIST DIALOG
 // ─────────────────────────────────────────────────────────────────────────────

 /** Open Account List dialog by clicking the Name button. */
  async openAccountListDialog(): Promise<void> {
    await this.clickWithRetry('btnAccName');
    await this.waitForElement('dlgAccountList', 10_000);
    Log.info('[OK] Account List dialog opened');
  }

 /** Check if Account List dialog is visible. */
  async isAccountListDialogVisible(): Promise<boolean> {
    return this.isElementVisible('dlgAccountList', 3_000);
  }

 /** Fill account name filter and click Search. Waits for results to render with actual content. */
  async searchAccountByName(name: string): Promise<void> {
    await this.searchAccountByFilter('txtAccListAccountName', name, 'name');
  }

 /** Check if the Select button in Account List dialog is disabled. */
  async isAccountListSelectDisabled(): Promise<boolean> {
    return this.getElement('btnAccListSelect').isDisabled();
  }

 /** Click the first row checkbox in Account List results. */
  async checkAccountListFirstRow(): Promise<void> {
    await this.clickWithRetry('chkAccListRowSelect');
    Log.info('Checked first row in Account List');
  }

 /** Click Cancel in Account List dialog. */
  async cancelAccountListDialog(): Promise<void> {
    await this.clickWithRetry('btnAccListCancel');
    await this.getElement('dlgAccountList').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
    Log.info('Cancelled Account List dialog');
  }

 /** Click Reset in Account List dialog. */
  async resetAccountListSearch(): Promise<void> {
    await this.clickWithRetry('btnAccListReset');
    Log.info('Reset Account List search');
  }

 /** Get the Account Name filter field value. */
  async getAccountNameFilterValue(): Promise<string> {
    return this.getFieldDisplayValue('txtAccListAccountName');
  }

 /** Check if the results table has a "No results" row. */
  async isAccountListEmpty(): Promise<boolean> {
    const table = this.getElement('tblAccListResults');
    const text = await table.textContent();
    return (text || '').includes('No results');
  }

 /** Check if a specific text appears in the Account List results table. Waits briefly for content. */
  async accountListResultsContain(text: string): Promise<boolean> {
    const table = this.getElement('tblAccListResults');
 // Wait for table body to have text content
    try {
      await table.locator(`tbody:has-text("${text}")`).waitFor({ state: 'visible', timeout: 10_000 });
      return true;
    } catch {
      return false;
    }
  }

 /** Fill Address filter and click Search. Waits for results. */
  async searchAccountByAddress(address: string): Promise<void> {
    await this.searchAccountByFilter('txtAccListAddress', address, 'address');
  }

 /** Fill City filter and click Search. Waits for results. */
  async searchAccountByCity(city: string): Promise<void> {
    await this.searchAccountByFilter('txtAccListCity', city, 'city');
  }

 /** Fill Account Number filter and click Search. Waits for results (TC-LOC-ACC-030). */
  async searchAccountByNumber(num: string): Promise<void> {
    await this.searchAccountByFilter('txtAccListAccountNumber', num, 'number');
  }

 /** Shared search logic: fill a filter field, click Search, wait for results to render. */
  private async searchAccountByFilter(selectorKey: string, value: string, label: string): Promise<void> {
    await this.fillWithValidation(selectorKey, value);
    await this.clickWithRetry('btnAccListSearch');
    const table = this.getElement('tblAccListResults');
    const firstDataCell = table.locator('tbody tr:first-child td:nth-child(2)');
    // Evidence-based budget (45s). The Account List backend search is slow AND variable: a live-app
    // measurement on 2026-06-02 timed the
    // Account-Number filter (AC000107) at ~29s time-to-first-result — far beyond the prior 15s — while a
    // later spec run of the same search returned in ~11s. 45s (~1.5× the slow sample) absorbs the slow
    // case; fast searches (name/city/address) still resolve as soon as results land, so the raised
    // ceiling never slows a fast run. Shared by ACC-004/025/026/028/030.
    await firstDataCell.waitFor({ state: 'visible', timeout: 45_000 });
    // Poll for the actual transition (first data cell's text becoming non-empty) via
    // waitForFunction instead of a fixed-sleep loop. Budget matches the waitFor above (evidence-based 45s).
    const firstDataCellSelector = `${this.getLocator('tblAccListResults')} tbody tr:first-child td:nth-child(2)`;
    await this.page.waitForFunction(
      (selector: string) => {
        const el = document.querySelector(selector);
        return !!el && (el.textContent ?? '').trim().length > 0;
      },
      firstDataCellSelector,
      { timeout: 45_000 }
    );
    Log.info(`Searched account by ${label}: ${value}`);
  }

 /** Check first row and click Select to apply account. Waits for dialog to close. */
  async selectAccountListFirstRow(): Promise<void> {
    await this.clickWithRetry('chkAccListRowSelect');
    await this.clickWithRetry('btnAccListSelect');
    await this.getElement('dlgAccountList').waitFor({ state: 'hidden', timeout: 10_000 });
    Log.info('[OK] Selected first account row and applied');
  }

 /** Check if Account List dialog has filter fields. */
  async hasAccountListFilters(): Promise<boolean> {
    const numField = await this.isElementVisible('txtAccListAccountNumber', 3_000);
    const nameField = await this.isElementVisible('txtAccListAccountName', 3_000);
    return numField && nameField;
  }

 /** Check if Account List dialog has Search and Reset buttons. */
  async hasAccountListActionButtons(): Promise<boolean> {
    const search = await this.isElementVisible('btnAccListSearch', 3_000);
    const reset = await this.isElementVisible('btnAccListReset', 3_000);
    return search && reset;
  }

 /** Check if Account List dialog has results table. */
  async hasAccountListTable(): Promise<boolean> {
    return this.isElementVisible('tblAccListResults', 3_000);
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // SELECT CUSTOMER ADDRESS DIALOG
 // ─────────────────────────────────────────────────────────────────────────────

 /** Open Select Customer Address dialog from Venue Address button. */
  async openVenueAddressDialog(): Promise<void> {
    await this.clickWithRetry('btnAccVenueAddress');
    await this.waitForElement('dlgSelectAddress', 10_000);
    Log.info('[OK] Select Customer Address dialog opened (venue)');
  }

 /** Open Select Customer Address dialog from Master Address button. */
  async openMasterAddressDialog(): Promise<void> {
    await this.clickWithRetry('btnAccMasterAddress');
    await this.waitForElement('dlgSelectAddress', 10_000);
    Log.info('[OK] Select Customer Address dialog opened (master)');
  }

 /** Check if Select Customer Address dialog is visible. */
  async isAddressDialogVisible(): Promise<boolean> {
    return this.isElementVisible('dlgSelectAddress', 3_000);
  }

 /** Get the number of visible data rows in the address dialog table (excludes hidden/footer rows). */
  async getAddressRowCount(): Promise<number> {
    const table = this.getElement('tblAddrResults');
    await table.waitFor({ state: 'visible', timeout: 5_000 });
 // Client-side filter hides rows via CSS — count only visible rows with data
    const count = await table.locator('tbody tr').evaluateAll(
      rows => rows.filter(r => (r as HTMLElement).offsetHeight > 0 && r.querySelector('td:nth-child(2)')?.textContent?.trim()).length
    );
    return count;
  }

 /** Check if Select button in address dialog is disabled. */
  async isAddressSelectDisabled(): Promise<boolean> {
    return this.getElement('btnAddrSelect').isDisabled();
  }

 /** Check if Save button in address dialog is disabled. */
  async isAddressSaveDisabled(): Promise<boolean> {
    return this.getElement('btnAddrSave').isDisabled();
  }

 /** Click the first row checkbox in address dialog. */
  async checkAddressFirstRow(): Promise<void> {
    await this.clickWithRetry('chkAddrRow');
    Log.info('Checked first row in Address dialog');
  }

 /** Filter address rows using the search bar. Waits for client-side filter to apply. */
  async searchAddress(term: string): Promise<void> {
    const table = this.getElement('tblAddrResults');
    const initialRowCount = await table.locator('tbody tr').count();
    await this.fillWithValidation('txtAddrSearch', term);
 // Client-side filter removes non-matching rows from DOM — wait for last pre-filter row to detach
    if (term && initialRowCount > 1) {
      await table.locator('tbody tr').nth(initialRowCount - 1).waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
    }
    Log.info(`Filtered addresses: ${term}`);
  }

 /** Check if address search bar is visible. */
  async isAddressSearchVisible(): Promise<boolean> {
    return this.isElementVisible('txtAddrSearch', 3_000);
  }

 /** Check if address table contains text in a visible row. */
  async addressResultsContain(text: string): Promise<boolean> {
    const table = this.getElement('tblAddrResults');
    const content = await table.locator('tbody tr').evaluateAll(
      (rows, search) => rows.filter(r => (r as HTMLElement).offsetHeight > 0).some(r => r.textContent?.includes(search)),
      text
    );
    return content;
  }

 /** Check a specific row by address text, then click Select to apply. Waits for dialog to close. */
  async selectAddressRow(addressText: string): Promise<void> {
    const table = this.getElement('tblAddrResults');
    const row = table.locator(`tbody tr:has-text("${addressText}")`).first();
    await row.locator('td:first-child button[role="checkbox"]').click();
    await this.clickWithRetry('btnAddrSelect');
    await this.getElement('dlgSelectAddress').waitFor({ state: 'hidden', timeout: 10_000 });
    Log.info(`[OK] Selected address row: ${addressText}`);
  }

 /** Cancel/close the address dialog. */
  async cancelAddressDialog(): Promise<void> {
    await this.clickWithRetry('btnAddrCancel');
    await this.getElement('dlgSelectAddress').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
    Log.info('Cancelled Address dialog');
  }

 /** Get the total addresses footer text. */
  async getAddressTotalText(): Promise<string> {
    return this.getTextContent('lblAddrTotal');
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // SAVE FLOW (LEFT-PANEL SAVE)
 // ─────────────────────────────────────────────────────────────────────────────

 /** Check if the left-panel Save button is enabled. */
  async isSaveEnabled(): Promise<boolean> {
    const disabled = await this.getElement('btnSaveAccountAddress').isDisabled().catch(() => true);
    Log.info(`Left-panel Save enabled: ${!disabled}`);
    return !disabled;
  }

 /** Click left-panel Save and confirm the Save Changes dialog. */
  async clickSave(): Promise<{ success: boolean; networkError?: string }> {
    return this.clickSaveWithDialog('btnSaveAccountAddress');
  }

 /** Click Save button to open the Save Changes dialog WITHOUT confirming. */
  async openSaveDialog(): Promise<void> {
    await this.clickWithRetry('btnSaveAccountAddress');
    await this.waitForElement('dlgSaveChanges', 5_000);
    Log.info('[OK] Save Changes dialog opened (not confirmed)');
  }

 /** Cancel the Save Changes dialog (for discard scenarios). */
  async cancelSaveDialog(): Promise<void> {
    await this.clickWithRetry('btnSaveChangesCancel');
    await this.getElement('dlgSaveChanges').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
    Log.info('Cancelled Save Changes dialog');
  }

 /** Get text from Save Changes dialog message. */
  async getSaveChangesMessage(): Promise<string> {
    return this.getTextContent('txtSaveChangesMessage');
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // FIELD-COVERAGE RUNNER HOOKS (field-case-runner.ts)
 // ─────────────────────────────────────────────────────────────────────────────

 /**
  * Field-coverage runner hook — `saveAndConfirm` shape required by `saveAndVerifyCase()`.
  * Wraps the result-returning `clickSave()` and THROWS on failure so the runner
  * surfaces server errors as test failures (not a silent `{success:false}` return).
  */
  async saveAndConfirm(): Promise<void> {
    const result = await this.clickSave();
    if (!result.success) {
      throw new Error(`Account & Address save failed: ${result.networkError ?? 'unknown error'}`);
    }
  }

 /**
  * HARDENED per-test baseline (2026-05-29). Restores the deterministically-
  * restorable editable fields (Phone 1, Phone 2) to baseline. Used by the describe's
  * shared `beforeEach` (covers the existing 26 + new filter tests) AND as the field-coverage
  * runner `baseline:`/`cleanup:` callback for save-cycle cases.
  *
  * Bounded retry (max 3) wraps the WHOLE cycle — read → re-fill → save → reload →
  * re-verify — because `clickSaveWithDialog` returns `{success:true}` even when Save is
  * DISABLED (base-page), so save-success alone never proves the reset landed. The
  * post-reload re-read against the persisted DOM is the load-bearing check.
  *
  * Phone 1 is account-linked + server-authoritative: a reload restores it to the account
  * phone (= PHONE1_BASELINE) regardless of whether the masked `fill` propagated, so the
  * cycle self-heals Phone 1 via the reload. If already clean on the first read, returns
  * immediately (cheap — no reload), so back-to-back beforeEach + case-baseline calls cost
  * one read, not two reloads. Throws after 3 failed cycles to fail loud, not silently rot.
  */
  async ensureDefaultState(defaults?: { phone1?: string; phone2?: string }): Promise<void> {
    const wantPhone1 = defaults?.phone1 ?? PHONE1_BASELINE;
    const wantPhone2 = defaults?.phone2 ?? '';
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      let dirty = false;
      if ((await this.getPhone2Value()) !== wantPhone2) {
        await this.fillPhone2(wantPhone2);
        dirty = true;
      }
      if ((await this.getPhone1Value()) !== wantPhone1) {
        await this.fillPhone1(wantPhone1);
        dirty = true;
      }
      if (!dirty) return; // already at baseline — cheap path, no reload
      await this.saveAndConfirm();
      await this.reloadAndNavigate();
      if ((await this.getPhone2Value()) === wantPhone2 && (await this.getPhone1Value()) === wantPhone1) {
        return;
      }
    }
    throw new Error(`ensureDefaultState: A&A Phone1/Phone2 not at baseline after ${maxAttempts} attempts`);
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // RELOAD / NAVIGATE
 // ─────────────────────────────────────────────────────────────────────────────

 /**
  * Reload the page and re-navigate to Account and Address tab.
  *
  * Registers a listener for `GET /navigator-legacy/getLocationDetail` BEFORE the reload, then
  * awaits it after navigation. Phone2 (and other location-level fields) binds to `data.Phone2`
  * from this endpoint, observed at ~5-6s on contended runs. Without this wait, callers polling
  * phone2 immediately after this method returns race against an in-flight hydration response
  * (TC-LOC-ACC-020 root cause — the existing navigateToAccountAndAddressTab gates only on
  * phone1, which hydrates from a faster account-API). Listener is tolerant via `.catch` so
  * cached/early-return cases don't block.
  */
  async reloadAndNavigate(officeNo: string = '1604'): Promise<void> {
    const hydrationPromise = this.page.waitForResponse(
      (r) => r.url().includes('/navigator-legacy/getLocationDetail') && r.status() === 200,
      { timeout: 30_000 },
    ).catch(() => null);
    await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
    await this.waitForAngularStable();
    await this.navigateToAccountAndAddressTab(officeNo);
    await hydrationPromise;
    Log.info('[OK] Reloaded and navigated to Account and Address tab');
  }
}
