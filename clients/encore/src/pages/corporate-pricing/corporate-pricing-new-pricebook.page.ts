/**
 * Corporate Pricing — New Pricebook create-flow page object (NM-1440).
 *
 * Extends CorporatePricingBasePage. Drives BOTH route options (`?type=equipment|labor`). The create
 * form is React/Next.js in LIGHT DOM; React-controlled inputs are filled via the base
 * `setReactInput` (native value-setter — `.fill()` does not commit React state). Page-level Save +
 * the two tabs are reused from the Details shell (`btnSaveDetails`, `switchTab`, `isSaveEnabled`).
 *
 * MUTATION SAFETY: a committed pricebook is IRREVERSIBLE via the UI (no
 * delete/deactivate anywhere). This page object is therefore NO-COMMIT — `clickSaveExpectDialog()` +
 * `cancelSaveDialog()` prove Save reachability without persisting. There is no `confirmSave` here on
 * purpose. Verified live 2026-06-09.
 */
import { type Locator, type Page } from '@playwright/test';
import { CorporatePricingBasePage } from './corporate-pricing.page';
import type { IConfig } from '../../types';
import { CorporatePricingSelectors as S } from '../../selectors/corporate-pricing';
import { NEW_PRICEBOOK } from '../../data/corporate-pricing/new-pricebook';

export type PricebookType = 'equipment' | 'labor';
export type StrategyFlag = 'Is GSO' | 'Is Active' | 'Is Internal' | 'Is Productions';

export class CorporatePricingNewPricebookPage extends CorporatePricingBasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
  }

  // ---------------------------------------------------------------------------
  // NAVIGATION (per-test baseline = a fresh, always-empty create page per test)
  // ---------------------------------------------------------------------------

  /** Open the create page for the given type and wait for the header to render. */
  async open(type: PricebookType = 'equipment', office: string = NEW_PRICEBOOK.office): Promise<void> {
    await this.gotoNewPricebook(office, type);
    await this.page.locator(S.npName).first().waitFor({ state: 'visible', timeout: 25_000 });
  }

  /** Page heading text ("New Pricebook"). */
  async getHeading(): Promise<string> {
    return (await this.page.locator(S.npHeading).first().innerText()).trim();
  }

  // ---------------------------------------------------------------------------
  // HEADER FIELDS
  // ---------------------------------------------------------------------------

  /** Set the Pricebook Name (React-safe). */
  async setName(value: string): Promise<void> {
    await this.setReactInput(S.npName, value);
  }

  /** Current Pricebook Name input value. */
  async getName(): Promise<string> {
    return this.page.locator(S.npName).first().inputValue();
  }

  /** Set the Price Year (React-safe). */
  async setYear(value: string): Promise<void> {
    await this.setReactInput(S.npYear, value);
  }

  /** Current Price Year input value. */
  async getYear(): Promise<string> {
    return this.page.locator(S.npYear).first().inputValue();
  }

  /** The Type combobox is the 1st of the two on the page (Currency is 2nd). */
  private typeCombo(): Locator {
    return this.page.locator(S.npCombobox).nth(0);
  }

  /** The Currency combobox is the 2nd of the two on the page. */
  private currencyCombo(): Locator {
    return this.page.locator(S.npCombobox).nth(1);
  }

  /** Price Book Type display value ("Equipment" / "Labor" — route-param-fixed). */
  async getTypeValue(): Promise<string> {
    return (await this.typeCombo().innerText()).replace(/\s+/g, ' ').trim();
  }

  /** Whether the Type combobox is disabled (expected true — display-only, route-fixed). */
  async isTypeDisabled(): Promise<boolean> {
    return this.typeCombo().isDisabled().catch(() => false);
  }

  /** Currency display value (default "USD"). */
  async getCurrencyValue(): Promise<string> {
    return (await this.currencyCombo().innerText()).replace(/\s+/g, ' ').trim();
  }

  /** Open the Currency dropdown, read its option texts, close (Escape). */
  async getCurrencyOptions(): Promise<string[]> {
    await this.currencyCombo().click();
    await this.page.locator(S.npOption).first().waitFor({ state: 'visible', timeout: 8_000 });
    const out = (await this.page.locator(S.npOption).allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());
    await this.page.keyboard.press('Escape');
    return out.filter(Boolean);
  }

  // ---------------------------------------------------------------------------
  // TABS
  // ---------------------------------------------------------------------------

  /** Tab labels rendered above the shared header (live = 2). */
  async getTabs(): Promise<string[]> {
    const tabs: string[] = [];
    if ((await this.page.locator(S.tabPricingStrategy).count()) > 0) tabs.push('Pricing Strategy');
    if ((await this.page.locator(S.tabPricingDetail).count()) > 0) tabs.push('Pricing Detail');
    return tabs;
  }

  /** Activate the Pricing Detail tab (base `switchTab`). */
  async clickDetailTab(): Promise<void> {
    await this.switchTab('Pricing Detail');
  }

  // ---------------------------------------------------------------------------
  // STRATEGY LIST + ADD DIALOG
  // ---------------------------------------------------------------------------

  /** "Total: N" strategy count (returns -1 if absent). */
  async getStrategyTotal(): Promise<number> {
    const txt = await this.page.locator(S.npStrategyTotal).first().innerText().catch(() => '');
    const m = txt.match(/Total:\s*(\d+)/);
    return m && m[1] ? parseInt(m[1], 10) : -1;
  }

  /** Whether the empty-state ("No strategies yet") is shown. */
  async hasNoStrategiesYet(): Promise<boolean> {
    return this.isVisibleSafe(S.npNoStrategies);
  }

  /** Open the "New Pricing Strategy" dialog via the (+) icon button (accessible name). */
  async openAddStrategyDialog(): Promise<void> {
    await this.page.getByRole('button', { name: 'New Pricing Strategy' }).first().click();
    await this.page.locator(S.npNewStrategyDialog).first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  /** Is the add dialog open? */
  async isAddDialogOpen(): Promise<boolean> {
    return this.isVisibleSafe(S.npNewStrategyDialog);
  }

  /** Read a dialog flag checkbox's checked + disabled state (dialog must be open). */
  async getDialogFlag(name: StrategyFlag): Promise<{ checked: boolean; disabled: boolean }> {
    const dlg = this.page.locator(S.npNewStrategyDialog).first();
    const cb = dlg.getByRole('checkbox', { name });
    return {
      checked: await cb.isChecked().catch(() => false),
      disabled: await cb.isDisabled().catch(() => false),
    };
  }

  /** Fill the dialog name + submit "Add" → appends an in-session strategy (NOT persisted). */
  async addStrategy(name: string = NEW_PRICEBOOK.strategyName): Promise<void> {
    await this.openAddStrategyDialog();
    await this.setReactInput(S.npDlgStrategyName, name);
    await this.page.locator(S.npNewStrategyDialog).first().getByRole('button', { name: 'Add', exact: true }).click();
    await this.page.locator(S.npNewStrategyDialog).first().waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => { /* animates out */ });
  }

  /**
   * Open the dialog, click "Add" with an EMPTY name, and report whether it was a no-op
   * (dialog still open). Leaves the dialog open on a no-op; the caller Escapes/Cancels.
   */
  async tryAddStrategyWithEmptyName(): Promise<{ stillOpen: boolean }> {
    await this.openAddStrategyDialog();
    await this.page.locator(S.npNewStrategyDialog).first().getByRole('button', { name: 'Add', exact: true }).click();
    return { stillOpen: await this.isAddDialogOpen() };
  }

  /** Cancel the add dialog if open. */
  async cancelAddDialog(): Promise<void> {
    const dlg = this.page.locator(S.npNewStrategyDialog).first();
    if (await dlg.isVisible().catch(() => false)) {
      await dlg.getByRole('button', { name: 'Cancel', exact: true }).click();
      await dlg.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => { /* ignore */ });
    }
  }

  /**
   * Remove an in-session (uncommitted) strategy via its nested Remove icon. Used by the
   * save-gating tests (add a strategy → remove it → Save returns to disabled). No DB round-trip.
   */
  async removeStrategy(name: string = NEW_PRICEBOOK.strategyName): Promise<void> {
    const item = this.page.getByRole('button', { name }).first();
    await item.getByRole('button').first().click();
    await this.waitForAngularStable();
  }

  // ---------------------------------------------------------------------------
  // PRICING DETAIL — product-group ADD (create mode)
  // ---------------------------------------------------------------------------

  /** Count of rendered product-group source rows (assert > 0, never an exact count). */
  async getSourceGroupCount(): Promise<number> {
    return this.page.locator(S.npSourceRow).count();
  }

  /** First N product-group source texts (content sample, e.g. to confirm the type-specific catalog). */
  async getSourceGroupSample(n = 5): Promise<string[]> {
    const out: string[] = [];
    const rows = this.page.locator(S.npSourceRow);
    const count = Math.min(await rows.count(), n);
    for (let i = 0; i < count; i++) out.push((await rows.nth(i).innerText()).replace(/\s+/g, ' ').trim());
    return out;
  }

  /** Double-click a product-group source item (by content) → adds it to the pricebook grid. */
  async addProductGroupByName(name: string): Promise<void> {
    const row = this.page.locator(S.npSourceRow, { hasText: name }).first();
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.dblclick();
  }

  /**
   * Drag a product-group source item (by content) onto the pricebook grid via the full pointer
   * sequence → adds it. This is the positive control that proves the drag primitive fires when adding
   * is allowed (create mode); the management-mode Detail tab uses the same primitive to prove no-add.
   */
  async dragProductGroupByName(name: string): Promise<void> {
    const row = this.page.locator(S.npSourceRow, { hasText: name }).first();
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await this.dragSourceToGrid(row, this.page.locator(S.npDetailGrid).first());
  }

  /** Content-normalized rows of the destination pricebook detail grid (`<tbody> tr`). */
  async getDetailGridRows(): Promise<string[]> {
    const rows = this.page.locator(S.npDetailGrid).first().locator('tbody tr');
    const out: string[] = [];
    const n = await rows.count();
    for (let i = 0; i < n; i++) out.push((await rows.nth(i).innerText()).replace(/\s+/g, ' ').trim());
    return out.filter(Boolean);
  }

  // ---------------------------------------------------------------------------
  // SAVE (NO-COMMIT — reachability only)
  // ---------------------------------------------------------------------------

  /**
   * Click the (enabled) page Save, then return the verbatim text of the "Save Changes" confirmation
   * dialog. Does NOT confirm — the caller MUST follow with `cancelSaveDialog()` to avoid an
   * irreversible commit. Throws (via base) if Save is disabled.
   */
  async clickSaveExpectDialog(): Promise<string> {
    await this.clickSaveButtonOrThrow('New Pricebook not savable');
    const dlg = this.page.locator(S.npSaveDialog).first();
    await dlg.waitFor({ state: 'visible', timeout: 10_000 });
    return (await dlg.innerText()).replace(/\s+/g, ' ').trim();
  }

  /** Cancel the "Save Changes" confirmation dialog (no commit). */
  async cancelSaveDialog(): Promise<void> {
    const dlg = this.page.locator(S.npSaveDialog).first();
    if (await dlg.isVisible().catch(() => false)) {
      await dlg.getByRole('button', { name: 'Cancel', exact: true }).click();
      await dlg.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => { /* ignore */ });
    }
  }

  /**
   * Build a minimally-savable form (Name + Year + one strategy, no product groups). Leaves Save
   * enabled and the form UNCOMMITTED. Used by the save-reachability + dirty-state TCs.
   */
  async fillMinimalSavable(
    name: string = NEW_PRICEBOOK.validName,
    year: string = NEW_PRICEBOOK.validYear,
  ): Promise<void> {
    await this.setName(name);
    await this.setYear(year);
    await this.addStrategy();
  }
}
