import { Page } from '@playwright/test';
import { LocationTestOrchestrators } from './location-test-orchestrators.page';
import { CheckboxState, SpinState } from './location-form-helpers.page';
import { Log } from '../../utils/logger';
import { IConfig } from '../../types';

// Re-export for backward compatibility
export type { CheckboxState, SpinState };

/** Left-panel baseline snapshot (read-only fields) */
export interface LeftPanelBaseline {
  office: string;
  localOffice: string;
  payToAddress: string;
  eCommerceActive: boolean;
  enableProductionsOrders: boolean;
}

export class LocationLocalInfoPage extends LocationTestOrchestrators {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
    Log.info('LocationLocalInfoPage initialized');
  }

 // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 // NAVIGATION
 // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

 /**
 * Navigate directly to office 1604 Local Information tab via URL.
 * Delegates to BasePage.navigateToSubTab (shared tab nav pattern).
 * @param officeNo - Default 1604 (The Parker Palm Springs -- our test office)
 */
  async navigateToLocalInfoTab(officeNo: string = '1604'): Promise<void> {
    await this.navigateToSubTab('tabLocalInformation', 'btnSaveLocalInfo', officeNo);
  }

 /**
 * Group D-2 (lifecycle refactor 2026-05-21): DOM-presence guard so
 * beforeEach can avoid re-navigating when already on the tab. Uses chkApplyLDW (tab-specific),
 * NOT btnSaveLocalInfo (shared across all Location Settings sub-tabs).
 */
  async isOnLocalInfoTab(): Promise<boolean> {
    return (await this.getElement('chkApplyLDW').count()) > 0;
  }

 /**
 * Navigate away and back to trigger a page reload, then re-open Local Information tab.
 * Used after Save to verify persistence.
 * @param officeNo - Office number (default 1604)
 */
  async reloadAndNavigateToLocalInfo(officeNo: string = '1604'): Promise<void> {
    Log.info('Reloading page and navigating back to Local Information');
 // Navigate away to a different route first to force the app to destroy + recreate the
 // settings component. page.reload can hit the router cache and replay stale state
 // instead of re-fetching from server.
    const base = this.config?.base_url || '';
    await this.page.goto(`${base}locations`, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await this.navigateToLocalInfoTab(officeNo);
  }

 // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 // LEFT PANEL BASELINE
 // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

 /**
 * Capture left-panel read-only baseline values for office 1604.
 * Call once before any save operations; compare after saves to assert no corruption.
 */
  async captureLeftPanelBaseline(): Promise<LeftPanelBaseline> {
    Log.info('Capturing left-panel baseline values');
    const officeVal = await this.getElement('txtOffice').inputValue().catch(() => '');
    const localOfficeVal = await this.getElement('txtLocalOffice').inputValue().catch(() => '');
    const payToVal = await this.getElement('txtPayToAddress').inputValue().catch(() => '');
    const ecommerce = await this.getElement('chkECommerceActive').isChecked().catch(() => false);
    const prodOrders = await this.getElement('chkEnableProductionsOrders').isChecked().catch(() => false);
    const baseline: LeftPanelBaseline = {
      office: officeVal,
      localOffice: localOfficeVal,
      payToAddress: payToVal,
      eCommerceActive: ecommerce,
      enableProductionsOrders: prodOrders,
    };
    Log.info(`Left panel baseline: ${JSON.stringify(baseline)}`);
    return baseline;
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // RADIO GROUP INTERACTIONS
 // ─────────────────────────────────────────────────────────────────────────────

 /**
 * Check which Billing Type radio is selected.
 * @returns 'Master' | 'Direct'
 */
  async getBillingType(): Promise<'Master' | 'Direct'> {
    const masterChecked = await this.getElement('rdoBillingTypeMaster').isChecked().catch(() => false);
    return masterChecked ? 'Master' : 'Direct';
  }

 /**
 * Select Billing Type radio.
 */
  async selectBillingType(type: 'Master' | 'Direct'): Promise<void> {
    const key = type === 'Master' ? 'rdoBillingTypeMaster' : 'rdoBillingTypeDirect';
    await this.getElement(key).click();
    Log.info(`Selected Billing Type: ${type}`);
  }

 /**
 * Check which Billing Way radio is selected.
 * @returns 'Event' | 'Daily'
 */
  async getBillingWay(): Promise<'Event' | 'Daily'> {
    const eventChecked = await this.getElement('rdoBillingWayEvent').isChecked().catch(() => false);
    return eventChecked ? 'Event' : 'Daily';
  }

 /**
 * Select Billing Way radio.
 * NOTE: Triggers API validation (checkBillWayChange). May show error dialog if unbilled orders exist.
 */
  async selectBillingWay(way: 'Event' | 'Daily'): Promise<void> {
    const key = way === 'Event' ? 'rdoBillingWayEvent' : 'rdoBillingWayDaily';
    await this.getElement(key).click();
    Log.info(`Selected Billing Way: ${way}`);
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
  }

 // SAVE OPERATIONS

 /**
 * Check if the Local Information Save button is enabled.
 */
  async isSaveEnabled(): Promise<boolean> {
    const el = this.getElement('btnSaveLocalInfo');
    const disabled = await el.isDisabled().catch(() => true);
    Log.info(`Save button enabled: ${!disabled}`);
    return !disabled;
  }

 /**
 * Click the Local Information Save button and confirm dialog if it appears.
 * Delegates to BasePage.clickSaveWithDialog (shared save dialog pattern).
 * Dialog timeout extended to 10s (LI form has slower server validation).
 */
  async clickSave(): Promise<{ success: boolean; networkError?: string }> {
    return this.clickSaveWithDialog('btnSaveLocalInfo', 'dlgSaveChanges', 'btnSaveChangesConfirm', 10_000);
  }

 /**
 * Assert the "Local information updated" success toast is visible.
 */
  async waitForSaveToast(): Promise<void> {
    await this.getElement('toastLocalInfoUpdated').waitFor({ state: 'visible', timeout: 8000 });
    Log.info('Save success toast confirmed: "Local information updated"');
  }

 // EFFECTIVE DATE AND BILLING CYCLE

 /** Check if Effective Date button is disabled. */
  async isEffectiveDateDisabled(): Promise<boolean> {
    return await this.getElement('btnEffectiveDate').isDisabled().catch(() => true);
  }

 /** Check if Billing Cycle dropdown is disabled. */
  async isBillingCycleDisabled(): Promise<boolean> {
    return await this.getElement('drpBillingCycle').isDisabled().catch(() => true);
  }

 /** Get Billing Cycle selected display text. */
  async getBillingCycleValue(): Promise<string> {
    const el = this.getElement('drpBillingCycle');
    return (await el.textContent().catch(() => '') ?? '').trim();
  }
}
