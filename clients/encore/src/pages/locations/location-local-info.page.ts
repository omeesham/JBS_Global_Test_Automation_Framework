import { Page } from '@playwright/test';
import { CheckboxState, LocationFormHelpers, SpinState } from './location-form-helpers.page';
import { LocationSettingsSelectors } from '../../selectors';
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

export class LocationLocalInfoPage extends LocationFormHelpers {
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
    // Fix #4a: use tab trigger aria-selected, not
    // child-anchor count(). Mirrors base-page.ts:448.
    const tab = this.getElement('tabLocalInformation');
    if ((await tab.count()) === 0) return false;
    return (await tab.getAttribute('aria-selected').catch(() => null)) === 'true';
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

 // ─────────────────────────────────────────────────────────────────────────────
 // TEST ORCHESTRATORS -- boundary testing, dependency, max-length
 // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Full boundary test cycle: set -> (invalid: verify error) / (valid: save -> reload -> verify -> restore -> save).
   */
  async testBoundaryValue(
    spinKey: keyof typeof LocationSettingsSelectors,
    value: string,
    valid: boolean,
    errorContains: string | undefined,
    restoreValue: string,
    officeNo: string = '1604',
    restoreEnableKey?: keyof typeof LocationSettingsSelectors,
  ): Promise<{ passed: boolean; detail: string }> {
    await this.setSpinValue(spinKey, value);

    if (!valid && errorContains) {
      await this.getElement(spinKey).press('Tab');
      const hasError = await this.hasValidationError(errorContains);
      if (!hasError) {
        // Some borderline values disable Save silently without an inline error paragraph.
        const saveDisabled = !(await this.isSaveEnabled());
        if (!saveDisabled) {
          return { passed: false, detail: `Expected error containing "${errorContains}", none found; Save also enabled -- app accepted the value` };
        }
        await this.setSpinValue(spinKey, restoreValue);
        await this.clickSave();
        await this.waitForAngularStable();
        return { passed: true, detail: `${value} -> silently invalid (save disabled, no inline error) [ok]` };
      }
      await this.setSpinValue(spinKey, restoreValue);
      await this.clickSave();
      await this.waitForAngularStable();
      return { passed: true, detail: `${value} -> invalid (error shown) [ok]` };
    }

    await this.clickSave();
    await this.waitForAngularStable();
    await this.reloadAndNavigateToLocalInfo(officeNo);

    const spin = await this.getSpinState(spinKey);
    const hasError = await this.hasValidationError('Number must be');
    if (hasError) {
      return { passed: false, detail: `Expected no error, got validation error` };
    }
    if (!spin.disabled) {
      const spinNum = parseFloat(spin.value);
      const expectedDisplayNum = parseFloat(value) * 100;
      if (isNaN(spinNum) || Math.abs(spinNum - expectedDisplayNum) > 0.01) {
        return { passed: false, detail: `Expected display~=${expectedDisplayNum.toFixed(2)} (fill "${value}"x100), got value="${spin.value}"` };
      }
    }

    if (restoreEnableKey) { await this.checkCheckbox(restoreEnableKey); }
    await this.setSpinValue(spinKey, restoreValue);
    await this.clickSave();
    await this.waitForAngularStable();
    return { passed: true, detail: `${value} -> valid [ok]` };
  }

  /**
   * Test checkbox dependency: trigger -> verify target state -> restore.
   */
  async testDependency(
    trigger: keyof typeof LocationSettingsSelectors,
    triggerAction: 'check' | 'uncheck',
    target: keyof typeof LocationSettingsSelectors,
    targetType: 'spin' | 'checkbox',
    expectedDisabled: boolean,
    expectedChecked: boolean | undefined,
    restore: Array<{ key: keyof typeof LocationSettingsSelectors; action: 'check' | 'uncheck' }>,
    spinRestore?: { key: keyof typeof LocationSettingsSelectors; value: string },
  ): Promise<{ passed: boolean; failures: string[] }> {
    const failures: string[] = [];
    if (triggerAction === 'check') { await this.checkCheckbox(trigger); } else { await this.uncheckCheckbox(trigger); }

    if (targetType === 'checkbox') {
      const state = await this.getCheckboxState(target);
      if (state.disabled !== expectedDisabled) failures.push(`${target} disabled: expected ${expectedDisabled}, got ${state.disabled}`);
      if (expectedChecked !== undefined && state.checked !== expectedChecked) failures.push(`${target} checked: expected ${expectedChecked}, got ${state.checked}`);
    } else {
      const disabled = await this.isFieldDisabled(target);
      if (disabled !== expectedDisabled) failures.push(`${target} disabled: expected ${expectedDisabled}, got ${disabled}`);
    }

    for (const r of restore) {
      if (r.action === 'check') { await this.checkCheckbox(r.key); } else { await this.uncheckCheckbox(r.key); }
    }
    if (spinRestore) { await this.setSpinValue(spinRestore.key, spinRestore.value); }
    await this.clickSave();
    return { passed: failures.length === 0, failures };
  }

  /**
   * Test maxLength enforcement: fill overlong string -> verify truncation.
   */
  async testMaxLength(
    fieldKey: keyof typeof LocationSettingsSelectors,
    maxLength: number,
    restoreValue: string,
  ): Promise<{ passed: boolean; detail: string }> {
    const actualMax = await this.getMaxLength(fieldKey);
    if (actualMax !== maxLength) return { passed: false, detail: `maxLength: expected ${maxLength}, got ${actualMax}` };
    const overlong = 'A'.repeat(maxLength * 2 + 10);
    await this.fillText(fieldKey, overlong);
    const truncated = await this.getTextValue(fieldKey);
    if (truncated.length > maxLength) return { passed: false, detail: `Truncation failed: length ${truncated.length} > ${maxLength}` };
    await this.fillText(fieldKey, restoreValue);
    await this.clickSave();
    return { passed: true, detail: `maxLength=${maxLength} enforced [ok]` };
  }
}
