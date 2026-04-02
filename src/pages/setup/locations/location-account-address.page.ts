/**
 * @agent-doc
 * PURPOSE: Location Account and Address Tab Page Object -- venue/branch account card,
 *          master bill-to address card, Account List dialog, Select Customer Address dialog,
 *          phone field validation, save flow (Setup > Location > [Office] > Account and Address tab).
 * OWNER: generator
 * IMPACT: medium -- Account and Address tab tests depend on this.
 * DEPENDS-ON: BasePage, LocationSettingsSelectors, logger.ts, framework-contracts/index.ts
 * USED-BY: tests/specs/setup/locations/location-account-address.spec.ts, fixtures.ts
 * RULES: Never use raw page.* in specs. All selectors from src/selectors/index.ts.
 *        Left-panel Save button used (no dedicated tab save).
 */

import { Page } from '@playwright/test';
import { BasePage } from '../../../common/base-page';
import { Log } from '../../../utils/logger';
import { IConfig } from '../../../framework-contracts';

export class LocationAccountAddressPage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
    Log.info('LocationAccountAddressPage initialized');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────────────────────────

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
      'input[name="accountAndAddress.contactPhone1"]',
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
    await this.fillWithValidation('txtAccListAccountName', name);
    await this.clickWithRetry('btnAccListSearch');
    // Wait for search API to return and table cells to have actual text content.
    // Skeleton rows are visible but empty — wait for a cell with real text.
    const table = this.getElement('tblAccListResults');
    const firstDataCell = table.locator('tbody tr:first-child td:nth-child(2)');
    await firstDataCell.waitFor({ state: 'visible', timeout: 15_000 });
    // Poll until cell has non-empty text (skeleton → real data)
    for (let i = 0; i < 30; i++) {
      const text = (await firstDataCell.textContent() ?? '').trim();
      if (text.length > 0) break;
      await this.page.waitForTimeout(500);
    }
    Log.info(`Searched account: ${name}`);
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

  /** Open Select Customer Address dialog from Venue Address button (first Address button). */
  async openVenueAddressDialog(): Promise<void> {
    const panel = this.getElement('pnlAccountAndAddress');
    await panel.locator('dt:has-text("Address") button').first().click();
    await this.waitForElement('dlgSelectAddress', 10_000);
    Log.info('[OK] Select Customer Address dialog opened (venue)');
  }

  /** Open Select Customer Address dialog from Master Address button (second Address button). */
  async openMasterAddressDialog(): Promise<void> {
    const panel = this.getElement('pnlAccountAndAddress');
    await panel.locator('dt:has-text("Address") button').nth(1).click();
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
  // RELOAD / NAVIGATE
  // ─────────────────────────────────────────────────────────────────────────────

  /** Reload the page and re-navigate to Account and Address tab. */
  async reloadAndNavigate(officeNo: string = '1604'): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
    await this.waitForAngularStable();
    await this.navigateToAccountAndAddressTab(officeNo);
    Log.info('[OK] Reloaded and navigated to Account and Address tab');
  }
}
