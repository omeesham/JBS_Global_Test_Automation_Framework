/**
 * Corporate Pricing — shared BASE page object (S0 foundation).
 *
 * `CorporatePricingBasePage extends BasePage` (F3 — the repo has NO `*.base.page.ts` convention;
 * per-module bases use ordinary `.page.ts` filenames, e.g. `local-office-settings.page.ts`).
 * S1 (Search) / S2 (Strategy) / S3 (Detail) create their per-screen page objects extending THIS
 * class and add their own fixtures — those are their owned BUILDER deliverables (per the master's
 * per-module delivery map). S0 ships only the shared navigation + grid/tab/save primitives.
 *
 * Selector strategy (Doctrine 4 / D8): text/role/grid-header/content-anchored. Corporate Pricing
 * selectors are EXCLUDED from `ALL_SELECTORS` (generic keys collide with Location Settings — same
 * precedent as Local Office), so this class references `CorporatePricingSelectors.*` DIRECTLY via
 * `this.page.locator(...)`, NOT via BasePage's `getElement()` (which resolves through ALL_SELECTORS).
 */
import type { Page, Locator } from '@playwright/test';
import { BasePage } from '../../core/base-page';
import type { IConfig } from '../../types';
import { CorporatePricingSelectors as S } from '../../selectors/corporate-pricing';
import { CORPORATE_PRICING_ROUTES, CORPORATE_PRICING_COMMON } from '../../data/testdata/corporate-pricing/common.data';
import { Log } from '../../utils/logger';

export class CorporatePricingBasePage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
    // One init log for every screen (was duplicated in the S2/S3 ctors; `constructor.name`
    // resolves to the concrete subclass — ALL-026 dedup, closure-audit D3).
    Log.info(`${this.constructor.name} initialized`);
  }

  /** Build a full URL from config.base_url + a route path suffix. */
  private buildUrl(pathSuffix: string): string {
    const base = (this.config?.base_url ?? '').replace(/\/+$/, '');
    return `${base}${pathSuffix}`;
  }

  /** Navigate to the Corporate Pricing Search screen. */
  async gotoSearch(office: string = CORPORATE_PRICING_COMMON.office): Promise<void> {
    await this.navigateTo(this.buildUrl(CORPORATE_PRICING_ROUTES.searchPath(office)));
    await this.waitForAngularStable();
  }

  /** Navigate to a Pricebook Details screen (defaults to the Pricing Strategy tab). */
  async gotoDetails(office: string, pricebookId: string): Promise<void> {
    await this.navigateTo(this.buildUrl(CORPORATE_PRICING_ROUTES.detailsPath(office, pricebookId)));
    await this.waitForAngularStable();
  }

  /**
   * Switch Details sub-tab. NOT `navigateToSubTab` (that is `/settings/location`-specific).
   * Tabs are plain buttons with text; aria-selected was not exposed on the live DOM, so this
   * clicks + waits for Angular stability. S2/S3 add a stronger active-tab guard if needed.
   */
  async switchTab(tab: 'Pricing Strategy' | 'Pricing Detail'): Promise<void> {
    const sel = tab === 'Pricing Strategy' ? S.tabPricingStrategy : S.tabPricingDetail;
    await this.page.locator(sel).first().click();
    await this.waitForAngularStable();
  }

  /**
   * Read the currently-RENDERED grid rows' text (content-anchored, virtualization-aware).
   * The Search grid (591 rows) and Pricing Detail grid are virtualized — only visible rows exist
   * in the DOM. With `needle`, scrolls (bounded) until a row containing it renders, then returns
   * the matching rows; without `needle`, returns all currently-visible rows. Per LR-053 +
   * `feedback_history_content_anchored_lookup` (never index-based row lookup).
   */
  async readGridRowsByContent(needle?: string, maxScrolls = 40): Promise<string[]> {
    const collect = async (): Promise<string[]> => {
      const rows = this.page.locator(S.rowGridAny);
      const count = await rows.count();
      const out: string[] = [];
      for (let i = 0; i < count; i++) {
        const txt = (await rows.nth(i).innerText()).replace(/\s+/g, ' ').trim();
        if (txt) out.push(txt);
      }
      return out;
    };

    if (!needle) return collect();

    for (let s = 0; s < maxScrolls; s++) {
      const visible = await collect();
      const hits = visible.filter((r) => r.includes(needle));
      if (hits.length > 0) return hits;
      await this.page.mouse.wheel(0, 600);
      await this.waitForAngularStable(2_000).catch(() => { /* best-effort during virtual scroll */ });
    }
    return [];
  }

  /** Locate a single grid row by content (for interaction). Returns null if not found within scroll budget. */
  async findGridRowByContent(needle: string, maxScrolls = 40): Promise<Locator | null> {
    for (let s = 0; s < maxScrolls; s++) {
      const row = this.page.locator(S.rowGridAny, { hasText: needle }).first();
      if ((await row.count()) > 0 && (await row.isVisible().catch(() => false))) return row;
      await this.page.mouse.wheel(0, 600);
      await this.waitForAngularStable(2_000).catch(() => { /* best-effort */ });
    }
    return null;
  }

  /** Read the Search "N items found" count. Returns null if the label isn't present. */
  async getSearchItemCount(): Promise<number | null> {
    const el = this.page.locator(S.lblItemsFound).first();
    if ((await el.count()) === 0) return null;
    const m = (await el.innerText()).match(/([\d,]+)\s+items found/);
    return m && m[1] ? parseInt(m[1].replace(/,/g, ''), 10) : null;
  }

  /**
   * Click the page-level Save (Details) — DEFENSIVE per LR-012: the confirm mechanism was NOT
   * mutation-probed in S0 (HUNTER read-only). Clicks Save; if a "Save Changes" alertdialog
   * appears, confirms it; otherwise proceeds (direct save). S2/S3 tighten via `saveAndConfirm`.
   */
  async clickSave(): Promise<void> {
    await this.page.locator(S.btnSaveDetails).first().click();
    await this.confirmSaveDialogIfPresent(2_000);
    await this.waitForAngularStable();
  }

  // ---------------------------------------------------------------------------
  // SHARED PRIMITIVES (ALL-026 — extracted from S1/S2/S3 page objects, closure-audit D3)
  // ---------------------------------------------------------------------------

  /** Dirty indicator shared by Strategy + Detail: the page-level Save button is enabled. */
  async isSaveEnabled(): Promise<boolean> {
    return this.page.locator(S.btnSaveDetails).first().isEnabled().catch(() => false);
  }

  /**
   * Click the page-level Save, THROWING if it is disabled (nothing to commit) so a silent no-op
   * surfaces as a test failure. `reason` names the surface for the error (e.g. "form not dirty").
   */
  protected async clickSaveButtonOrThrow(reason: string): Promise<void> {
    const save = this.page.locator(S.btnSaveDetails).first();
    if (!(await save.isEnabled().catch(() => false))) {
      throw new Error(`saveAndConfirm: Save is disabled (${reason} — nothing to commit)`);
    }
    await save.click();
  }

  /**
   * Confirm the optional "Save Changes" alertdialog if it appears (defensive per LR-012 — the
   * Details Save is dialog-gated, but the dialog is treated as optional so the helper is safe on
   * direct-save screens). Clicks the dialog's Save/OK button when present.
   */
  protected async confirmSaveDialogIfPresent(timeout = 2_500): Promise<void> {
    const dlg = this.page.getByRole('alertdialog');
    if (await dlg.isVisible({ timeout }).catch(() => false)) {
      await dlg.getByRole('button', { name: /^(save|ok)$/i }).first().click();
    }
  }

  /** True if the target's first match is visible; never throws (content-based active/open probe). */
  protected async isVisibleSafe(target: string | Locator): Promise<boolean> {
    const loc = typeof target === 'string' ? this.page.locator(target) : target;
    return loc.first().isVisible().catch(() => false);
  }

  /** Read every matched element's whitespace-normalized innerText, dropping empties (header/list reads). */
  protected async readAllTexts(target: string | Locator): Promise<string[]> {
    const loc = typeof target === 'string' ? this.page.locator(target) : target;
    const n = await loc.count();
    const out: string[] = [];
    for (let i = 0; i < n; i++) out.push((await loc.nth(i).innerText()).replace(/\s+/g, ' ').trim());
    return out.filter(Boolean);
  }
}
