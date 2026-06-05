/**
 * Corporate Pricing — Pricing Strategy tab page object (NM-1441, S2).
 *
 * Extends CorporatePricingBasePage (route + tab nav + defensive save primitives). Page has ZERO
 * data-testids (D8) → uses text/role/content-anchored locators (CorporatePricingSelectors CSS
 * strings + getByRole for accessible-name elements). NOT BasePage.getElement() — Corporate Pricing
 * is excluded from ALL_SELECTORS (intra-module sub-barrel, F11).
 *
 * Live-grounded: field-inventories/corporate-pricing-strategy-2026-06-05.md.
 */
import { type Locator, type Page } from '@playwright/test';
import { CorporatePricingBasePage } from './corporate-pricing.page';
import type { IConfig } from '../../types';
import { CorporatePricingSelectors as S } from '../../selectors/corporate-pricing';
import { STRATEGY } from '../../data/corporate-pricing/strategy';

type StrategyFlag = 'Is Productions' | 'Is Internal' | 'Is GSO' | 'Is Active';

export class CorporatePricingStrategyPage extends CorporatePricingBasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
  }

  // ---------------------------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------------------------

  /** Open the Pricebook Details page (Strategy tab is the default) and wait for the strategy pane. */
  async open(pricebookId: string = STRATEGY.pricebookGuid, office: string = STRATEGY.office): Promise<void> {
    await this.gotoDetails(office, pricebookId);
    await this.page.locator(S.hdgPriceStrategies).first().waitFor({ state: 'visible', timeout: 25_000 });
    await this.waitForAngularStable();
  }

  /** Is the Pricing Strategy tab active? Content-based (no aria-selected on the live DOM). */
  async isStrategyTabActive(): Promise<boolean> {
    return this.isVisibleSafe(S.hdgPriceStrategies);
  }

  /** Activate the Pricing Detail tab. */
  async clickDetailTab(): Promise<void> {
    await this.switchTab('Pricing Detail');
  }

  // ---------------------------------------------------------------------------
  // HEADER (reference-only — DOCX §1)
  // ---------------------------------------------------------------------------

  /** Read a header reference field. */
  async getHeaderField(field: 'name' | 'type' | 'year' | 'currency' | 'active'): Promise<string> {
    switch (field) {
      case 'name':
        return (await this.page.locator(S.hdgPricebookName).first().innerText()).trim();
      case 'type':
        return this.readLabelValue('Labor/Equipment');
      case 'year':
        return this.readLabelValue('Year');
      case 'currency':
        return this.readLabelValue('Currency');
      case 'active':
        return (await this.page.locator(S.lblRecordStatus).first().innerText()).trim();
    }
  }

  /** A header value is the `<p>` immediately following its label `<p>`. */
  private async readLabelValue(label: string): Promise<string> {
    return (await this.page.locator(`p:text-is("${label}") + p`).first().innerText()).trim();
  }

  /**
   * Header fields are reference-only (read-only text, no inputs). Returns true when the rendered
   * controls are read-only elements (h2 name + p values), not editable inputs.
   */
  async headerFieldsAreReadOnly(): Promise<boolean> {
    const nameTag = await this.page.locator(S.hdgPricebookName).first().evaluate((el) => el.tagName).catch(() => '');
    const typeTag = await this.page.locator('p:text-is("Labor/Equipment") + p').first().evaluate((el) => el.tagName).catch(() => '');
    return nameTag === 'H2' && typeTag === 'P';
  }

  // ---------------------------------------------------------------------------
  // TABS
  // ---------------------------------------------------------------------------

  /** The tab labels actually rendered (live shows 2; History/NM-1444 is absent). */
  async getTabs(): Promise<string[]> {
    const tabs: string[] = [];
    if ((await this.page.locator(S.tabPricingStrategy).count()) > 0) tabs.push('Pricing Strategy');
    if ((await this.page.locator(S.tabPricingDetail).count()) > 0) tabs.push('Pricing Detail');
    if ((await this.page.getByRole('button', { name: 'History', exact: true }).count()) > 0) tabs.push('History');
    return tabs;
  }

  /** Is a "History" tab present? (Expected false — NM-1444 not built.) */
  async hasHistoryTab(): Promise<boolean> {
    return (await this.getTabs()).includes('History');
  }

  // ---------------------------------------------------------------------------
  // STRATEGY LIST (left pane)
  // ---------------------------------------------------------------------------

  /** "Total: N" strategy count. Returns -1 if not found. */
  async getStrategyTotal(): Promise<number> {
    const txt = await this.page.locator(S.lblStrategyTotal).first().innerText().catch(() => '');
    const m = txt.match(/Total:\s*(\d+)/);
    return m && m[1] ? parseInt(m[1], 10) : -1;
  }

  /** Strategy list item button (left complementary pane), matched by its name. */
  private strategyListItem(name: string): Locator {
    return this.page.getByRole('complementary').getByRole('button', { name }).first();
  }

  /** Select a strategy by name → loads its editor. */
  async selectStrategy(name: string): Promise<void> {
    await this.strategyListItem(name).click();
    await this.waitForAngularStable();
  }

  /** Select the first (typically only) strategy in the list — name-agnostic (used by restore). */
  async selectFirstStrategy(): Promise<void> {
    await this.page.getByRole('complementary').getByRole('button').filter({ hasText: /\S/ }).first().click();
    await this.waitForAngularStable();
  }

  /** Whether a strategy row exposes a Remove affordance (true only for isNew rows). */
  async isRemoveVisible(name: string): Promise<boolean> {
    const item = this.strategyListItem(name);
    if ((await item.count()) === 0) return false;
    return (await item.getByRole('button').count()) > 0; // nested Remove icon button
  }

  // ---------------------------------------------------------------------------
  // STRATEGY EDITOR (right pane)
  // ---------------------------------------------------------------------------

  /** Editor strategy-name textbox (accessible name "Pricing Strategy"). */
  private editorNameField(): Locator {
    return this.page.getByRole('textbox', { name: 'Pricing Strategy' });
  }

  /** Current value of the editor's strategy-name textbox. */
  async getStrategyName(): Promise<string> {
    return (await this.editorNameField().inputValue()).trim();
  }

  /** Set the editor strategy name (clears + types) — dirties the form. */
  async setStrategyName(value: string): Promise<void> {
    await this.editorNameField().fill(value);
  }

  /** Read a strategy flag checkbox's checked + disabled state. */
  async getFlag(name: StrategyFlag): Promise<{ checked: boolean; disabled: boolean }> {
    const cb = this.page.getByRole('checkbox', { name });
    return {
      checked: await cb.isChecked().catch(() => false),
      disabled: await cb.isDisabled().catch(() => false),
    };
  }

  /** Read the locations assigned to the selected strategy. */
  async getStrategyLocations(): Promise<Array<{ office: string; name: string }>> {
    const rows = this.page.locator(S.tblLocationsUsingDefault).first().locator('tbody tr');
    const out: Array<{ office: string; name: string }> = [];
    const n = await rows.count();
    for (let i = 0; i < n; i++) {
      const cells = rows.nth(i).locator('td');
      if ((await cells.count()) >= 2) {
        out.push({
          office: (await cells.nth(0).innerText()).trim(),
          name: (await cells.nth(1).innerText()).trim(),
        });
      }
    }
    return out;
  }

  // ---------------------------------------------------------------------------
  // ADD / REMOVE STRATEGY (dialog-gated)
  // ---------------------------------------------------------------------------

  /** Open the "New Pricing Strategy" modal (Add "+" icon in the Price Strategies pane). */
  async openAddStrategyDialog(): Promise<void> {
    await this.page.getByRole('complementary').getByRole('button').filter({ hasText: /^$/ }).first().click();
    await this.page.locator(S.dlgNewStrategy).first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  /** Is the New Pricing Strategy dialog open? */
  async isAddDialogOpen(): Promise<boolean> {
    return this.isVisibleSafe(S.dlgNewStrategy);
  }

  /** Fill the dialog name + submit "Add" → appends an isNew strategy row (NOT saved/persisted). */
  async addStrategy(name: string): Promise<void> {
    await this.openAddStrategyDialog();
    const dlg = this.page.locator(S.dlgNewStrategy).first();
    await dlg.getByRole('textbox', { name: 'Strategy Name' }).fill(name);
    await dlg.getByRole('button', { name: 'Add', exact: true }).click();
    await dlg.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => { /* dialog may animate out */ });
    await this.waitForAngularStable();
  }

  /** Cancel the Add dialog if open. */
  async cancelAddDialog(): Promise<void> {
    const dlg = this.page.locator(S.dlgNewStrategy).first();
    if (await dlg.isVisible().catch(() => false)) {
      await dlg.getByRole('button', { name: 'Cancel', exact: true }).click();
      await dlg.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => { /* ignore */ });
    }
  }

  /** Remove a NEW (isNew) strategy via its nested Remove icon — pre-commit, no DB round trip. */
  async removeStrategy(name: string): Promise<void> {
    await this.strategyListItem(name).getByRole('button').first().click();
    await this.waitForAngularStable();
  }

  // ---------------------------------------------------------------------------
  // DIRTY / SAVE
  // ---------------------------------------------------------------------------

  /** Dirty indicator = the page-level Save button is enabled (inherited `isSaveEnabled`, no separate badge). */
  async isDirty(): Promise<boolean> {
    return this.isSaveEnabled();
  }

  /** Verbatim success-toast text (live 2026-06-05). */
  private static readonly SAVE_TOAST = 'Pricebook saved successfully';

  /**
   * Click Save (defensive per LR-012 — confirm an optional "Save Changes" alertdialog), then wait
   * for the "Pricebook saved successfully" toast as the success/settle signal. THROWS if Save is
   * disabled at call time (nothing to save) so a silent no-op surfaces as a test failure.
   *
   * Why the toast (not Save-button state): the Save button's TEXT flips "Save" → "Saving..." →
   * "Save" during commit (live-verified — the button is briefly `button "Saving..."`), so a
   * `text-is("Save")` disable-wait mismatches mid-save and stalls. The toast is the unambiguous
   * success event. Returns whether the toast was observed (TC-124 asserts it). Persistence is still
   * proven by the caller's reload + re-read (LR-026 — save-success ≠ pristine).
   */
  async saveAndConfirm(): Promise<{ toastSeen: boolean }> {
    await this.clickSaveButtonOrThrow('form not dirty');
    await this.confirmSaveDialogIfPresent(2_000);
    const toastSeen = await this.page
      .getByText(CorporatePricingStrategyPage.SAVE_TOAST, { exact: false })
      .first()
      .waitFor({ state: 'visible', timeout: 20_000 })
      .then(() => true)
      .catch(() => false);
    await this.waitForAngularStable();
    return { toastSeen };
  }

  // ---------------------------------------------------------------------------
  // BASELINE RESTORE (LR-019)
  // ---------------------------------------------------------------------------

  /**
   * Restore the fixture to its baseline: exactly 1 strategy named `defaults.name`. Bounded retry
   * (max 3) over the WHOLE cycle (reload → re-read → rename → save → reload → re-verify) because
   * Angular dirty + the persisted DOM are the only reliable signals (LR-026; save-success alone
   * doesn't prove the restore landed).
   *
   * If MORE than one strategy is present, a prior test persisted a NEW strategy — which is NOT
   * UI-removable (legacy strategies have no Remove). That is unrecoverable fixture drift → THROW
   * loudly rather than silently continue (the spec is designed to never persist a new strategy).
   */
  async ensureDefaultState(defaults: { name: string } = { name: STRATEGY.fixtureStrategyName }): Promise<void> {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await this.open();
      const total = await this.getStrategyTotal();
      if (total > 1) {
        throw new Error(
          `ensureDefaultState: ${total} strategies present (expected 1) — a test persisted an extra ` +
          'strategy that cannot be removed via the UI (legacy strategies have no Remove). Fixture ' +
          'drift; manual cleanup of pricebook 2022-NP Tier 1 required.',
        );
      }
      await this.selectFirstStrategy();
      if ((await this.getStrategyName()) === defaults.name) return; // already clean
      await this.setStrategyName(defaults.name);
      await this.saveAndConfirm();
      await this.open();
      await this.selectFirstStrategy();
      if ((await this.getStrategyName()) === defaults.name) return;
    }
    throw new Error(
      `ensureDefaultState: strategy name not restored to "${defaults.name}" after ${maxAttempts} attempts`,
    );
  }
}
