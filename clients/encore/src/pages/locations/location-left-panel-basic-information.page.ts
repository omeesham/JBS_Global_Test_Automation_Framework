import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { Log } from '../../utils/logger';
import { IConfig } from '../../types';
import { LP_BASELINE, PAY_TO_ORIGINAL } from '../../data/locations/location-left-panel-basic-information';

/**
 * Location Settings — Left Panel (Basic Information) page object.
 *
 * Drives the shared left-panel card on `/settings/location` (office 1604): 6 read-only +
 * 8 editable fields + the shared Save button. Reuses BasePage Radix helpers (combobox/checkbox)
 * and the shared "Save Changes" dialog (confirms with "Ok"). The `ensureDefaultState` bounded-retry
 * mirrors LocationLegalPage (per-test baseline) with Country-first ordering because a Country change
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
    // AND respects the input's maxlength — Playwright fill() sets .value directly, bypassing both (Angular dirty-state).
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
  // (no Local Information mutation / no Local Information field-coverage spec needed).
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

  /** Poll the shared Save button enabling (async Angular dirty propagation). */
  async waitForSaveButtonEnabled(timeout = 10_000): Promise<boolean> {
    return this.waitForSaveEnabled('btnSave', timeout);
  }

  /** Poll the shared Save button DISABLING (e.g. net-zero revert or post-save pristine — RAF poll). */
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

  /** Field-coverage runner hook — throws on a real save failure so the runner surfaces it (not a silent pass). */
  async saveAndConfirm(): Promise<void> {
    const result = await this.clickSave();
    if (!result.success) {
      throw new Error(`Left-panel save failed: ${result.networkError ?? 'unknown error'}`);
    }
    // Confirm the save LANDED before any caller reload: the app disables the Save button once the
    // save API completes + the form goes pristine. Guards the save-then-reload race (Angular dirty-state) — the
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
  // PAY TO ADDRESS LAUNCHER + "Pay To List" DIALOG
  //
  // Pay To Address is a LAUNCHER (not a plain disabled textbox — the 2026-06-03 walk first
  // misclassified it as one; corrected after root-cause analysis 2026-06-11). The disabled display input shows the
  // current Pay To NAME; the field's <label> opens the "Pay To List" search dialog. A standard
  // Playwright click on the label is BLOCKED (its `for=` points at the disabled input →
  // "element is not enabled"), so the launcher is driven via dispatchEvent('click').
  // Save endpoint PUT /navigator/api/location/update-properties; search GET …/getLocationPayToList.
  // No dialog testids → role+text selectors. Selection PERSISTS (financial.payToId); restore is
  // ID-anchored (the name "Encore" is ambiguous — IDs 1 & 4 both "Encore").
  // KEPT SEPARATE from the account-address dialog helpers (no shared lookup-dialog base): the
  // launchers diverge (dispatchEvent on a label vs button click), the filters are located
  // differently (accessible-name getByRole vs CSS/testid), and persistence differs per launcher —
  // a shared abstraction would couple three non-identical behaviors, so they are kept separate.
  // ---------------------------------------------------------------------------

  /** Open the "Pay To List" dialog via the launcher label (dispatched click — a plain click is blocked). */
  async openPayToDialog(): Promise<void> {
    const label = this.getElement('lblPayToAddress').first();
    await label.dispatchEvent('click');
    await this.getElement('dlgPayToList').first().waitFor({ state: 'visible', timeout: 15_000 });
    Log.info('[OK] Pay To List dialog opened');
  }

  async isPayToDialogVisible(): Promise<boolean> {
    return this.getElement('dlgPayToList').first().isVisible({ timeout: 3_000 }).catch(() => false);
  }

  /** Is the dialog footer Select button disabled (no row checked)? */
  async isPayToSelectDisabled(): Promise<boolean> {
    return this.getElement('btnPTLSelect').isDisabled().catch(() => true);
  }

  /** Dialog has the (Pay To ID + Pay To Name) filter inputs (located by accessible name). */
  async hasPayToFilters(): Promise<boolean> {
    const dlg = this.getElement('dlgPayToList').first();
    const id = await dlg.getByRole('textbox', { name: 'Pay To ID', exact: true }).isVisible().catch(() => false);
    const name = await dlg.getByRole('textbox', { name: 'Pay To Name', exact: true }).isVisible().catch(() => false);
    return id && name;
  }

  /** Dialog has the Search + Reset action buttons. */
  async hasPayToActionButtons(): Promise<boolean> {
    const search = await this.isElementVisible('btnPTLSearch', 3_000);
    const reset = await this.isElementVisible('btnPTLReset', 3_000);
    return search && reset;
  }

  /** Dialog has the results table + footer Cancel button. */
  async hasPayToTableAndCancel(): Promise<boolean> {
    const table = await this.isElementVisible('tblPTLResults', 3_000);
    const cancel = await this.isElementVisible('btnPTLCancel', 3_000);
    return table && cancel;
  }

  /**
   * Type into a Pay To List filter input via real keystrokes (React-controlled — fill() can no-op).
   * Filters are located by ACCESSIBLE NAME (no stable CSS attribute — the name comes from a sibling
   * label), scoped to the dialog. `filterName` ∈ "Pay To ID" | "Pay To Name" | "Address" | "Phone" | "Fax".
   */
  private async typePayToFilter(filterName: string, value: string): Promise<void> {
    const el = this.getElement('dlgPayToList').first().getByRole('textbox', { name: filterName, exact: true });
    await el.click();
    await el.press('Control+a');
    await el.press('Delete');
    await el.pressSequentially(value, { delay: 20 });
  }

  /** Click Search and await the server search response (filter the backend endpoint, never the page URL). */
  private async submitPayToSearch(): Promise<void> {
    const resp = this.page.waitForResponse(
      (r) => r.url().includes('/navigator/api/location/getLocationPayToList'),
      { timeout: 15_000 },
    ).catch(() => null);
    await this.clickWithRetry('btnPTLSearch');
    await resp;
  }

  /** Filter by Pay To ID (precise) and Search. */
  async searchPayToById(id: string): Promise<void> {
    await this.typePayToFilter('Pay To ID', id);
    await this.submitPayToSearch();
  }

  /** Filter by Pay To Name (server-side contains) and Search. */
  async searchPayToByName(name: string): Promise<void> {
    await this.typePayToFilter('Pay To Name', name);
    await this.submitPayToSearch();
  }

  /** Click Reset (clears filters, restores the full pre-loaded list). */
  async resetPayToSearch(): Promise<void> {
    await this.clickWithRetry('btnPTLReset');
    Log.info('Reset Pay To List search');
  }

  /** Does the Pay To List results table contain the given text in a visible row? */
  async payToResultsContain(text: string): Promise<boolean> {
    const table = this.getElement('tblPTLResults');
    try {
      await table.locator(`tbody:has-text("${text}")`).first().waitFor({ state: 'visible', timeout: 10_000 });
      return true;
    } catch {
      return false;
    }
  }

  /** Count visible data rows (rows with a non-empty 2nd cell = ID column). */
  async getPayToDialogRowCount(): Promise<number> {
    const table = this.getElement('tblPTLResults');
    await table.waitFor({ state: 'visible', timeout: 5_000 });
    return table.locator('tbody tr').evaluateAll(
      (rows) => rows.filter((r) => (r as HTMLElement).offsetHeight > 0 && r.querySelector('td:nth-child(2)')?.textContent?.trim()).length,
    );
  }

  /** Is the empty-state "No results." shown in the dialog? */
  async isPayToDialogEmpty(): Promise<boolean> {
    const dlg = this.getElement('dlgPayToList').first();
    const text = await dlg.textContent().catch(() => '');
    return (text || '').includes('No results');
  }

  /** Check the first visible result row's checkbox (after a search narrows results). */
  async checkPayToFirstRow(): Promise<void> {
    await this.clickWithRetry('chkPTLRowFirst');
    Log.info('Checked first Pay To row');
  }

  /** Cancel the dialog (no selection applied). */
  async cancelPayToDialog(): Promise<void> {
    await this.clickWithRetry('btnPTLCancel');
    await this.getElement('dlgPayToList').first().waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
    Log.info('Cancelled Pay To List dialog');
  }

  /** Close the dialog via the Close (X) button. */
  async closePayToDialog(): Promise<void> {
    await this.clickWithRetry('btnPTLClose');
    await this.getElement('dlgPayToList').first().waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
    Log.info('Closed Pay To List dialog (X)');
  }

  /** Dismiss the dialog with Escape. */
  async escPayToDialog(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.getElement('dlgPayToList').first().waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
    Log.info('Dismissed Pay To List dialog (Esc)');
  }

  /**
   * Select a Pay To by ID end-to-end: open dialog (if needed) → search by ID → check the (single)
   * result row → Select → wait for the dialog to close. Leaves the form DIRTY (does NOT save) — the
   * caller decides whether to save (persistence) or reload (discard). ID-anchored because the name
   * "Encore" is ambiguous (IDs 1 & 4 share it).
   */
  async selectPayToById(id: string): Promise<void> {
    if (!(await this.isPayToDialogVisible())) await this.openPayToDialog();
    await this.searchPayToById(id);
    await this.checkPayToFirstRow();
    await this.clickWithRetry('btnPTLSelect');
    await this.getElement('dlgPayToList').first().waitFor({ state: 'hidden', timeout: 10_000 });
    Log.info(`[OK] Selected Pay To ID ${id}`);
  }

  /** Restore office-1604 Pay To to the original (ID-anchored) and persist: select → save → reload. */
  async restorePayToOriginal(): Promise<void> {
    await this.selectPayToById(String(PAY_TO_ORIGINAL.id));
    await this.saveAndConfirm();
    await this.reloadAndNavigate();
  }

  // ---------------------------------------------------------------------------
  // BASELINE (per-test reset) — bounded whole-cycle retry, Country-first ordering
  // ---------------------------------------------------------------------------

  /**
   * Restore the mutable left-panel fields to office-1604 defaults if dirty. Bounded retry (max 3)
   * wraps the WHOLE cycle — read -> re-set -> save -> reload -> re-verify — because the flaky step is
   * the Radix selects (retry-on-detach): a "successful" click can leave the Angular model unchanged, and
   * `clickSaveWithDialog` returns `{success:true}` when Save is disabled, so save-success alone never
   * proves the reset landed. The post-reload re-read is the load-bearing check; after 3 failed cycles
   * it THROWS, converting a silent baseline failure into a loud one.
   *
   * Country is set FIRST — a Country change cascade-clears Tax Mode + Region, so it must precede them.
   */
  async ensureDefaultState(baseline: typeof LP_BASELINE = LP_BASELINE): Promise<void> {
    // VERIFY-ONLY Pay To guard. Pay To selection persists, but a display read returns only
    // the NAME ("Encore"), which is ambiguous (IDs 1 & 4 both "Encore") — so we CANNOT auto-repair by
    // name without risking the wrong ID. Honest detection beats a wrong repair: THROW with guidance if
    // the Pay To name drifted off the office-1604 default, so a leaked alternate (e.g. "Encore Bahamas"
    // from a crashed persistence run) fails LOUD instead of silently poisoning every Pay To assertion.
    // ID-anchored restore lives in the persistence case's cleanup/finally (restorePayToOriginal), not here.
    const payToName = await this.getPayToAddress();
    if (payToName !== PAY_TO_ORIGINAL.name) {
      throw new Error(
        `ensureDefaultState: Pay To Address drifted to "${payToName}" (expected "${PAY_TO_ORIGINAL.name}", `
        + `office-1604 payToId ${PAY_TO_ORIGINAL.id}). Name-anchored repair is UNSAFE (≥2 "Encore" rows) — `
        + `restore office 1604 to Pay To ID ${PAY_TO_ORIGINAL.id} via the Pay To List dialog, then re-run.`,
      );
    }

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
