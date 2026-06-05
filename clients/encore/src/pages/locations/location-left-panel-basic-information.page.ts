import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { Log } from '../../utils/logger';
import { IConfig } from '../../types';
import { LP_BASELINE } from '../../data/locations/location-left-panel-basic-information';

/**
 * Location Settings — Left Panel (Basic Information) page object.
 *
 * Drives the shared left-panel card on `/settings/location` (office 1604): 6 read-only +
 * 8 editable fields + the shared Save button. Reuses BasePage Radix helpers (combobox/checkbox)
 * and the shared "Save Changes" dialog (confirms with "Ok"). The `ensureDefaultState` bounded-retry
 * mirrors LocationLegalPage (LR-019) with Country-first ordering because a Country change
 * cascade-clears Tax Mode + Region.
 *
 * 2026-06-03. Field states live-verified that date.
 */
export class LocationLeftPanelBasicInformationPage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
    Log.info('LocationLeftPanelBasicInformationPage initialized');
  }

  // ---------------------------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------------------------

  /** Navigate to Location Settings (Basic Information left panel) for the given office. */
  async navigateToBasicInformation(officeNo: string = '1604'): Promise<void> {
    const expected = `locations/${officeNo}/settings/location`;
    if (!this.page.url().includes(expected)) {
      const baseUrl = this.config?.base_url || '';
      Log.info(`Navigating to ${expected}`);
      await this.navigateTo(`${baseUrl}${expected}`);
      await this.waitForAngularStable();
    }
    // The left panel is always present on this URL; the editable name field is the readiness anchor.
    await this.getElement('txtLocalOfficeName').waitFor({ state: 'visible', timeout: 30_000 });
  }

  /** DOM-presence guard so beforeEach can avoid re-navigating when already here. */
  async isOnBasicInformation(): Promise<boolean> {
    const el = this.getElement('txtLocalOfficeName');
    if ((await el.count()) === 0) return false;
    return el.isVisible().catch(() => false);
  }

  /** Reload + return to Basic Information. Auto-accepts the dirty-form beforeunload dialog. */
  async reloadAndNavigate(officeNo: string = '1604'): Promise<void> {
    const handler = async (d: import('@playwright/test').Dialog) => {
      try { await d.accept(); } catch { /* dialog may already be handled */ }
    };
    this.page.on('dialog', handler);
    try {
      await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
    } finally {
      this.page.removeListener('dialog', handler);
    }
    await this.waitForAngularStable();
    await this.navigateToBasicInformation(officeNo);
  }

  // ---------------------------------------------------------------------------
  // FIELD READERS (live display values)
  // ---------------------------------------------------------------------------

  async getOfficeValue(): Promise<string> { return this.getFieldDisplayValue('txtOffice'); }
  async getLocalOfficeValue(): Promise<string> { return this.getFieldDisplayValue('txtLocalOffice'); }
  async getLocalOfficeName(): Promise<string> { return (await this.getElement('txtLocalOfficeName').inputValue()).trim(); }
  async getPayToAddress(): Promise<string> { return this.getFieldDisplayValue('txtPayToAddress'); }
  async getTaxMode(): Promise<string> { return this.getFieldDisplayValue('drpTaxMode'); }
  async getCountry(): Promise<string> { return this.getFieldDisplayValue('drpCountry'); }
  async getRegion(): Promise<string> { return this.getFieldDisplayValue('drpRegion'); }
  async getServicingBranch(): Promise<string> { return this.getFieldDisplayValue('drpServicingBranch'); }
  async getLineOfBusiness(): Promise<string> { return this.getFieldDisplayValue('drpLineOfBusiness'); }
  /** Live Date renders as the popover button's text ("June 15th, 1990"); aria-label is "Open popover". */
  async getLiveDateText(): Promise<string> { return this.getFieldDisplayValue('btnLiveDate'); }

  // ---------------------------------------------------------------------------
  // FIELD STATE
  // ---------------------------------------------------------------------------

  /** Generic disabled check by selector key (text inputs + the disabled LOB combobox). */
  async isFieldDisabled(key: string): Promise<boolean> {
    return this.getElement(key).isDisabled().catch(() => true);
  }

  async getActiveState() { return this.getRadixCheckboxState('chkActive'); }
  async getUnionState() { return this.getRadixCheckboxState('chkUnion'); }
  async getECommerceState() { return this.getRadixCheckboxState('chkECommerceActive'); }
  async getProductionOrdersState() { return this.getRadixCheckboxState('chkEnableProductionsOrders'); }

  /** maxlength attribute of the Local Office Name input (TC-010). */
  async getLocalOfficeNameMaxLength(): Promise<number | null> {
    const max = await this.getElement('txtLocalOfficeName').getAttribute('maxlength');
    return max ? parseInt(max, 10) : null;
  }

  // ---------------------------------------------------------------------------
  // FIELD SETTERS
  // ---------------------------------------------------------------------------

  async setLocalOfficeName(value: string): Promise<void> {
    const el = this.getElement('txtLocalOfficeName');
    await el.click();
    await el.press('Control+a');
    await el.press('Delete');
    // pressSequentially (real keystrokes) reliably fires Angular input events so the form dirties,
    // AND respects the input's maxlength — Playwright fill() sets .value directly, bypassing both (LR-026).
    await el.pressSequentially(value, { delay: 10 });
    await el.press('Tab');
  }

  async clearLocalOfficeName(): Promise<void> {
    const el = this.getElement('txtLocalOfficeName');
    await el.click();
    await el.press('Control+a');
    await el.press('Delete');
    await el.press('Tab');
  }

  // Playwright check()/uncheck() click + AUTO-VERIFY the aria-checked state (with actionability
  // retry) — robust against the Radix "click focuses but doesn't toggle" race that bare
  // setRadixCheckbox (click-without-verify) hit (TC-008).
  async setActive(checked: boolean): Promise<void> {
    const el = this.getElement('chkActive');
    if (checked) await el.check({ timeout: 15_000 }); else await el.uncheck({ timeout: 15_000 });
  }
  async setUnion(checked: boolean): Promise<void> {
    const el = this.getElement('chkUnion');
    if (checked) await el.check({ timeout: 15_000 }); else await el.uncheck({ timeout: 15_000 });
  }

  async selectTaxMode(text: string): Promise<void> { await this.selectComboboxOption('drpTaxMode', text, { exact: true }); }
  async selectCountry(text: string): Promise<void> { await this.selectComboboxOption('drpCountry', text, { exact: true }); }
  async selectRegion(text: string): Promise<void> { await this.selectComboboxOption('drpRegion', text, { exact: true }); }
  /** Servicing Branch options are "<code> -- <name>" — substring match by intent. */
  async selectServicingBranch(text: string): Promise<void> { await this.selectComboboxOption('drpServicingBranch', text, { exact: false }); }

  // ---------------------------------------------------------------------------
  // DROPDOWN OPTION READERS (open -> read -> Escape)
  // ---------------------------------------------------------------------------

  async getTaxModeOptions(): Promise<string[]> { return this.getComboboxOptions('drpTaxMode'); }
  async getCountryOptions(): Promise<string[]> { return this.getComboboxOptions('drpCountry'); }
  async getRegionOptions(): Promise<string[]> { return this.getComboboxOptions('drpRegion'); }
  async getServicingBranchOptions(): Promise<string[]> { return this.getComboboxOptions('drpServicingBranch'); }

  // ---------------------------------------------------------------------------
  // LIVE DATE POPOVER
  // ---------------------------------------------------------------------------

  /** Click Live Date to open the calendar popover. Returns true if a popover/calendar appeared. */
  async openLiveDatePopover(): Promise<boolean> {
    await this.getElement('btnLiveDate').click();
    const popover = this.page.locator('[data-radix-popper-content-wrapper], [role="dialog"], [role="grid"]');
    return popover.first().waitFor({ state: 'visible', timeout: 5_000 }).then(() => true).catch(() => false);
  }

  async closeLiveDatePopover(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  // ---------------------------------------------------------------------------
  // CROSS-TAB READS (Country cascade effects on the Local Information sub-tab).
  // The left panel is shared/always-visible, so a Country change applied here is
  // reactive on whichever sub-tab is showing — these READ Local Information only
  // (no Local Information mutation / no Local Information FCC spec needed).
  // ---------------------------------------------------------------------------

  /** Activate the Local Information sub-tab (right panel). */
  async clickLocalInformationTab(): Promise<void> {
    const tab = this.getElement('tabLocalInformation');
    await tab.waitFor({ state: 'visible', timeout: 15_000 });
    if ((await tab.getAttribute('aria-selected').catch(() => null)) !== 'true') {
      await tab.click();
      await this.waitForAngularStable();
    }
  }

  /** Enable Job Costing checkbox state on Local Information (USA-only field). */
  async getJobCostingState() { return this.getRadixCheckboxState('chkEnableJobCosting'); }

  /** Is the Canada-only "Remit PST Tax" checkbox present on Local Information? (no testid → text). */
  async isRemitPstVisible(): Promise<boolean> {
    return this.page.getByText('Remit PST Tax', { exact: false }).first()
      .isVisible({ timeout: 3_000 }).catch(() => false);
  }

  // ---------------------------------------------------------------------------
  // SAVE OPERATIONS (shared left-panel Save -> "Save Changes" dialog, confirm "Ok")
  // ---------------------------------------------------------------------------

  async isSaveEnabled(): Promise<boolean> {
    return !(await this.getElement('btnSave').isDisabled().catch(() => true));
  }

  /** Poll the shared Save button enabling (async Angular dirty propagation — LR-026/LR-010). */
  async waitForSaveButtonEnabled(timeout = 10_000): Promise<boolean> {
    return this.waitForSaveEnabled('btnSave', timeout);
  }

  /** Poll the shared Save button DISABLING (e.g. net-zero revert or post-save pristine — LR-052 RAF poll). */
  async waitForSaveButtonDisabled(timeout = 10_000): Promise<boolean> {
    return this.page.waitForFunction(() => {
      const deep = (root: Document | ShadowRoot, sel: string): Element | null => {
        const found = root.querySelector(sel);
        if (found) return found;
        for (const el of Array.from(root.querySelectorAll('*'))) {
          const sr = el.shadowRoot;
          if (sr) { const x = deep(sr, sel); if (x) return x; }
        }
        return null;
      };
      const btn = deep(document, '[data-testid="location-settings-btn-save"]') as HTMLButtonElement | null;
      return !!btn && btn.disabled;
    }, undefined, { timeout }).then(() => true).catch(() => false);
  }

  /** Click Save (waits for enabled) and confirm the shared Save Changes dialog. */
  async clickSave(): Promise<{ success: boolean; networkError?: string }> {
    await this.waitForSaveEnabled('btnSave');
    return this.clickSaveWithDialog('btnSave', 'dlgSaveChanges', 'btnSaveChangesConfirm');
  }

  /** FCC runner hook — throws on a real save failure so the runner surfaces it (not a silent pass). */
  async saveAndConfirm(): Promise<void> {
    const result = await this.clickSave();
    if (!result.success) {
      throw new Error(`Left-panel save failed: ${result.networkError ?? 'unknown error'}`);
    }
    // Confirm the save LANDED before any caller reload: the app disables the Save button once the
    // save API completes + the form goes pristine. Guards the save-then-reload race (LR-026) — the
    // name save in particular is slower than checkbox/dropdown saves and otherwise reloads stale.
    await this.page.waitForFunction(() => {
      const deep = (root: Document | ShadowRoot, sel: string): Element | null => {
        const found = root.querySelector(sel);
        if (found) return found;
        for (const el of Array.from(root.querySelectorAll('*'))) {
          const sr = el.shadowRoot;
          if (sr) { const x = deep(sr, sel); if (x) return x; }
        }
        return null;
      };
      const btn = deep(document, '[data-testid="location-settings-btn-save"]') as HTMLButtonElement | null;
      return !!btn && btn.disabled;
    }, undefined, { timeout: 10_000 }).catch(() => { /* best-effort; the test assertion catches a true miss */ });
  }

  // ---------------------------------------------------------------------------
  // BASELINE (LR-019 per-test reset) — bounded whole-cycle retry, Country-first ordering
  // ---------------------------------------------------------------------------

  /**
   * Restore the mutable left-panel fields to office-1604 defaults if dirty. Bounded retry (max 3)
   * wraps the WHOLE cycle — read -> re-set -> save -> reload -> re-verify — because the flaky step is
   * the Radix selects (LR-025): a "successful" click can leave the Angular model unchanged, and
   * `clickSaveWithDialog` returns `{success:true}` when Save is disabled, so save-success alone never
   * proves the reset landed. The post-reload re-read is the load-bearing check; after 3 failed cycles
   * it THROWS, converting a silent baseline failure into a loud one.
   *
   * Country is set FIRST — a Country change cascade-clears Tax Mode + Region, so it must precede them.
   */
  async ensureDefaultState(baseline: typeof LP_BASELINE = LP_BASELINE): Promise<void> {
    const maxAttempts = 3;
    const atDefaults = async (): Promise<boolean> =>
      (await this.getCountry()) === baseline.country
      && (await this.getTaxMode()) === baseline.taxMode
      && (await this.getRegion()) === baseline.region
      && (await this.getLocalOfficeName()) === baseline.localOfficeName
      && (await this.getActiveState()).checked === baseline.active
      && (await this.getUnionState()).checked === baseline.union;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      let dirty = false;
      // Country FIRST (its change cascade-clears Tax Mode + Region).
      if ((await this.getCountry()) !== baseline.country) { await this.selectCountry(baseline.country); dirty = true; }
      if ((await this.getTaxMode()) !== baseline.taxMode) { await this.selectTaxMode(baseline.taxMode); dirty = true; }
      if ((await this.getRegion()) !== baseline.region) { await this.selectRegion(baseline.region); dirty = true; }
      if ((await this.getLocalOfficeName()) !== baseline.localOfficeName) { await this.setLocalOfficeName(baseline.localOfficeName); dirty = true; }
      if ((await this.getActiveState()).checked !== baseline.active) { await this.setActive(baseline.active); dirty = true; }
      if ((await this.getUnionState()).checked !== baseline.union) { await this.setUnion(baseline.union); dirty = true; }

      if (!dirty) return; // already at defaults
      await this.saveAndConfirm();
      await this.reloadAndNavigate();
      if (await atDefaults()) return;
    }
    throw new Error(`ensureDefaultState: left panel not at office-1604 defaults after ${maxAttempts} attempts`);
  }
}
