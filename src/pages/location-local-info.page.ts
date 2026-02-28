/**
 * @agent-doc
 * PURPOSE: Location Local Information Tab Page Object â€” navigation, billing, save/reload, and
 *          left-panel baseline for the Local Information form (Setup > Location > [Office] > Local Info tab).
 *          Shared field interactions (checkbox, spin, validation) are inherited from LocationFormHelpers.
 *          Test orchestrators (boundary, dependency, maxLength) are inherited from LocationTestOrchestrators.
 * OWNER: generator
 * IMPACT: high â€” Local Information is the most complex location tab (52 fields, 10 dependencies, API validations).
 * DEPENDS-ON: LocationTestOrchestrators, LocationFormHelpers, logger.ts, framework-contracts/index.ts
 * USED-BY: tests/specs/locations/location-local-information.spec.ts, fixtures.ts
 * RULES: Never use raw page.* in specs â€” all interactions go through this page object.
 *        All selectors come from src/selectors/index.ts (SetupSelectors).
 *        Cleanup after boundary tests that set invalid values.
 *        Live DOM discovery (2026-02-20): Use eSignature, Enable Product Group,
 *        Enable Job Costing, Enable Discount Guidance, Oracle Organization are disabled
 *        for office 1604 â€” reflect in spec assertions accordingly.
 */

import { Page } from '@playwright/test';
import { LocationTestOrchestrators } from './location-test-orchestrators.page';
import { CheckboxState, SpinState } from './location-form-helpers.page';
import { Log } from '../utils/logger';
import { IConfig } from '../framework-contracts';

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
   * Prefers direct URL navigation (faster, avoids UI search flow).
   * @param officeNo - Default 1604 (The Parker Palm Springs â€” our test office)
   */
  async navigateToLocalInfoTab(officeNo: string = '1604'): Promise<void> {
    const currentUrl = this.page.url();
    if (!currentUrl.includes(`locations/${officeNo}/settings`)) {
      Log.info(`Navigating directly to locations/${officeNo}/settings/location`);
      const base = this.config?.base_url || '';
      await this.navigateTo(`${base}locations/${officeNo}/settings/location`);
    } else {
      Log.info(`Already on locations/${officeNo}/settings, skipping navigation`);
    }
    const tab = this.getElement('tabLocalInformation');
    await tab.waitFor({ state: 'visible', timeout: 30000 });
    const isSelected = await tab.getAttribute('aria-selected').catch(() => null);
    if (isSelected !== 'true') {
      await tab.click();
      await this.getElement('btnSaveLocalInfo').waitFor({ state: 'visible', timeout: 30000 });
      // After the tab click triggers a form data fetch, wait for all network requests to settle
      // before reading form values. Without this, cumulative navigate-aways (valid boundary
      // tests) can cause the form to read stale/empty values (RC-4 2026-02-24).
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    }
    Log.info('[OK] Local Information tab active');
  }

  /**
   * Navigate away and back to trigger a page reload, then re-open Local Information tab.
   * Used after Save to verify persistence.
   * @param officeNo - Office number (default 1604)
   */
  async reloadAndNavigateToLocalInfo(officeNo: string = '1604'): Promise<void> {
    Log.info('Reloading page and navigating back to Local Information');
    // Navigate away to a different route first to force the app to destroy + recreate the
    // settings component. page.reload() can hit the router cache and replay stale state
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

  // 
  // SAVE OPERATIONS
  // 

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
   * Click the Local Information Save button.
   */
  async clickSave(): Promise<void> {
    const el = this.getElement('btnSaveLocalInfo');
    await el.waitFor({ state: 'visible', timeout: 5000 });
    if (await el.isDisabled()) {
      Log.info('Save disabled -- no changes to save, skipping click');
      return;
    }
    await el.click();
    const confirmDialog = this.getElement('dlgSaveChanges');
    const dialogVisible = await confirmDialog.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
    if (dialogVisible) {
      Log.info('Save Changes confirmation dialog detected, clicking Confirm');
      await this.getElement('btnSaveChangesConfirm').click();
      await confirmDialog.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      Log.info('Save confirmed, networkidle reached');
    } else {
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    }
    Log.info('Save clicked, waiting for completion');
  }

  /**
   * Assert the "Local information updated" success toast is visible.
   */
  async waitForSaveToast(): Promise<void> {
    await this.getElement('toastLocalInfoUpdated').waitFor({ state: 'visible', timeout: 8000 });
    Log.info('Save success toast confirmed: "Local information updated"');
  }

  // 
  // EFFECTIVE DATE AND BILLING CYCLE
  // 

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
