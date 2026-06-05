/**
 * Corporate Pricing — Search screen (NM-1445) page object.
 * `CorporatePricingSearchPage extends CorporatePricingBasePage` (Search page object).
 *
 * Live model (D2, verified 2026-06-05): filters STAGE on input (no network, no grid change);
 * the Search button submits all staged filters SERVER-SIDE as query params of
 * `GET /navigator/api/location/pricing/strategies`. Reset restores defaults + the full list
 * client-side. Read-only screen — no save. React/Next.js + shadcn DataTable; selectors are
 * text/role/placeholder/grid-<th>/content-anchored (near-zero data-testid — Doctrine 4).
 *
 * Field-inventory: the Corporate Pricing Search field inventory
 */
import type { Page, Locator } from '@playwright/test';
import { CorporatePricingBasePage } from './corporate-pricing.page';
import type { IConfig } from '../../types';
import { CorporatePricingSearchSelectors as S } from '../../selectors/corporate-pricing/search';
import { CORP_PRICING_SEARCH, CORP_PRICING_SEARCH_API } from '../../data/corporate-pricing/search';

export type SearchCheckbox = 'isInternal' | 'isLabor' | 'activeOnly';

export class CorporatePricingSearchPage extends CorporatePricingBasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
  }

  // ---------- navigation / readiness ----------

  /** Navigate to Search and wait for the grid to populate (item-count footer present). */
  async open(office: string = '1604'): Promise<void> {
    await this.gotoSearch(office);
    await this.waitForGridLoaded();
  }

  /**
   * Wait until the grid has actually rendered (headers + ≥1 data row).
   * NOT the "N items found" footer alone — that regex matches the transient "0 items found" empty
   * state that paints BEFORE the /pricing/strategies response lands (grid renders ~400ms later),
   * so waiting on the footer returns too early and every grid/column/option read races an empty grid.
   * Initial load always has rows (591); P1 search narrows never go to 0, so waiting for the first
   * row is safe (LR-052-clean — Playwright auto-waits, no fixed sleep).
   */
  async waitForGridLoaded(timeout = 30_000): Promise<void> {
    await this.page.locator(S.colHeaderAny).first().waitFor({ state: 'visible', timeout });
    await this.page.locator(S.rowGridAny).first().waitFor({ state: 'visible', timeout });
  }

  // ---------- grid reads ----------

  /** The grid's column header texts, in DOM order (whitespace-normalized, empties dropped). */
  async getColumnHeaders(): Promise<string[]> {
    return this.readAllTexts(S.colHeaderAny);
  }

  /** Number of grid column headers currently rendered. */
  async getColumnCount(): Promise<number> {
    return this.page.locator(S.colHeaderAny).count();
  }

  /** Count currently-rendered data rows (virtualized — ~50, NOT the 591 total; never assert the total, LR-022). */
  async getVisibleRowCount(): Promise<number> {
    return this.page.locator(S.rowGridAny).count();
  }

  /** Raw item-count footer text (e.g. "591 items found"). */
  async getItemCountText(): Promise<string> {
    return (await this.page.locator(S.lblItemsFound).first().innerText()).replace(/\s+/g, ' ').trim();
  }

  /** Parsed item-count number (e.g. 591). VOLATILE — use for relative narrowed/broadened comparisons, never assert a fixed value (LR-022). */
  async getItemCountNumber(): Promise<number> {
    const t = await this.getItemCountText();
    return parseInt(t.replace(/[^\d]/g, ''), 10);
  }

  /**
   * Sample the boolean columns (Is GSO..Is Productions, 0-based indices 3-7) across the rendered rows.
   * Returns whether any ✔ was seen and whether every boolean cell is ✔-or-empty (LR-036 contract).
   */
  async booleanCellsValid(maxRows = 15): Promise<{ hasTrue: boolean; allValid: boolean }> {
    const boolIdx = [3, 4, 5, 6, 7];
    const rows = this.page.locator(S.rowGridAny);
    const n = Math.min(await rows.count(), maxRows);
    let hasTrue = false;
    let allValid = true;
    for (let r = 0; r < n; r++) {
      for (const c of boolIdx) {
        const t = (await rows.nth(r).locator('td').nth(c).innerText()).trim();
        if (t.includes(CORP_PRICING_SEARCH.booleanTrueMarker)) hasTrue = true;
        else if (t !== '') allValid = false;
      }
    }
    return { hasTrue, allValid };
  }

  /**
   * Read a boolean cell (LR-036 Unicode ✔): returns true when the cell shows ✔, false when empty.
   * `colIndex` is the 0-based column position (see CORP_PRICING_SEARCH.liveColumns).
   */
  async readBooleanCell(row: Locator, colIndex: number): Promise<boolean> {
    const cell = row.locator('td').nth(colIndex);
    const txt = (await cell.innerText()).trim();
    return txt.includes(CORP_PRICING_SEARCH.booleanTrueMarker);
  }

  /** Locate a data row by its Price Book name (content-anchored, virtualization-aware via base helper). */
  async findRowByName(name: string): Promise<Locator | null> {
    return this.findGridRowByContent(name);
  }

  // ---------- filters (staging) ----------

  /**
   * Set a React controlled <input> via the native value-setter + input/change events.
   * This is the canonical React-controlled-input update (what React Testing Library does) and the
   * method PROVEN on the live walk to commit state so the next Search submits the new query.
   * `pressSequentially` keystrokes did NOT reliably commit React state for the Pricebook field
   * (likely a keystroke typeahead/debounce) → Search re-submitted an unchanged query → the app
   * deduped → no /pricing/strategies response → waitForResponse hung. NOT a Radix combobox, so the
   * ALL-088 DOM-tamper-crash caveat does not apply (plain text input; verified non-crashing live).
   */
  private async setTextFilter(selector: string, value: string): Promise<void> {
    await this.page.locator(selector).first().evaluate((el, val) => {
      const input = el as HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      setter?.call(input, val as string);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
  }

  /** Stage a value in the Pricebook filter (no network until Search). */
  async fillPricebookFilter(value: string): Promise<void> {
    await this.setTextFilter(S.txtFilterPricebook, value);
  }

  /** Clear the Pricebook filter (stages an empty value). */
  async clearPricebookFilter(): Promise<void> {
    await this.setTextFilter(S.txtFilterPricebook, '');
  }

  /** Stage a value in the Pricing Strategy filter (no network until Search). */
  async fillStrategyFilter(value: string): Promise<void> {
    await this.setTextFilter(S.txtFilterStrategy, value);
  }

  /** Current text in the Pricebook filter input. */
  async getPricebookFilterValue(): Promise<string> {
    return this.page.locator(S.txtFilterPricebook).inputValue();
  }

  /** Current text in the Pricing Strategy filter input. */
  async getStrategyFilterValue(): Promise<string> {
    return this.page.locator(S.txtFilterStrategy).inputValue();
  }

  /**
   * The 3 filter checkboxes are the only `[role="checkbox"]` on the Search screen, in DOM order
   * Is Internal(0) / Is Labor(1) / Active Only(2) — live-verified 2026-06-05. Indexed access is
   * the verified-stable locator (label-proximity `:has()` selectors are kept in search.ts as a
   * documented fallback). `.check()/.uncheck()` auto-verify the ARIA state (ALL-089 — bare click
   * can focus-without-toggle on Radix checkboxes).
   */
  private checkbox(which: SearchCheckbox): Locator {
    const idx = which === 'isInternal' ? 0 : which === 'isLabor' ? 1 : 2;
    return this.page.locator('[role="checkbox"]').nth(idx);
  }

  /** Read a filter checkbox's ARIA state (true when `aria-checked="true"`). */
  async getCheckboxState(which: SearchCheckbox): Promise<boolean> {
    return (await this.checkbox(which).getAttribute('aria-checked')) === 'true';
  }

  /** Check or uncheck a filter checkbox (auto-verifies the ARIA state — ALL-089). */
  async setCheckbox(which: SearchCheckbox, checked: boolean): Promise<void> {
    const cb = this.checkbox(which);
    if (checked) await cb.check();
    else await cb.uncheck();
  }

  // ---------- dropdown filters ----------

  /** Open a combobox, return its option texts, then close (Escape). Safe (read-only) — never tamper (ALL-088). */
  private async readComboOptions(comboSelector: string): Promise<string[]> {
    await this.page.locator(comboSelector).first().click();
    await this.page.locator('[role="option"]').first().waitFor({ state: 'visible', timeout: 8_000 });
    // The Location popover lazy-loads/virtualizes its 2652 options — the first read can catch only the
    // "Clear selection" entry before the list populates. Best-effort wait for a 3rd option so the list
    // is loaded (no-op/caught for small dropdowns like Currency's 4). Then batch-read via allInnerTexts
    // (ONE protocol call — a per-option nth() loop over 2652 blew the 120s test timeout).
    await this.page.locator('[role="option"]').nth(2).waitFor({ state: 'visible', timeout: 5_000 }).catch(() => { /* small dropdown */ });
    const out = (await this.page.locator('[role="option"]').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());
    await this.page.keyboard.press('Escape');
    return out.filter(Boolean);
  }

  /** Option texts in the Currency filter dropdown (opens, reads, closes). */
  async getCurrencyOptions(): Promise<string[]> {
    return this.readComboOptions(S.drpFilterCurrency);
  }

  /** Option texts in the Location filter dropdown (opens, reads, closes). */
  async getLocationOptions(): Promise<string[]> {
    return this.readComboOptions(S.drpFilterLocation);
  }

  /** The Currency dropdown's current (default) label text. */
  async getCurrencyDefaultText(): Promise<string> {
    return (await this.page.locator(S.drpFilterCurrency).first().innerText()).replace(/\s+/g, ' ').trim();
  }

  /** The Location dropdown's current (default) label text. */
  async getLocationDefaultText(): Promise<string> {
    return (await this.page.locator(S.drpFilterLocation).first().innerText()).replace(/\s+/g, ' ').trim();
  }

  /** Select a Currency option by its visible text. */
  async selectCurrency(value: string): Promise<void> {
    await this.page.locator(S.drpFilterCurrency).first().click();
    await this.page.locator('[role="option"]', { hasText: value }).first().click();
  }

  // ---------- actions ----------

  /** Submit the staged filters (server-side query — pair with `searchAndWaitForList` to await results). */
  async clickSearch(): Promise<void> {
    await this.page.locator(S.btnSearch).first().click();
  }

  /** Reset all filters to defaults and restore the full client-side list (no network). */
  async clickReset(): Promise<void> {
    await this.page.locator(S.btnReset).first().click();
  }

  /**
   * Click Search and wait for the server list response to land + the grid to settle.
   * Avoids fixed sleeps (LR-052) — waits on the `/navigator/api/...pricing/strategies` response.
   * Returns the request URL (so callers can assert the query-param shape — D2).
   */
  async searchAndWaitForList(): Promise<string> {
    const respPromise = this.page.waitForResponse(
      (r) => r.url().includes(CORP_PRICING_SEARCH_API),
      { timeout: 30_000 },
    );
    await this.clickSearch();
    const resp = await respPromise;
    // After Search, wait for grid STRUCTURE (headers), NOT a data row — a server filter can legitimately
    // return 0 results (e.g. Pricebook + Is Internal combo), so requiring a row would hang. The count
    // poll in the spec handles the value-settle (LR-052-clean).
    await this.page.locator(S.colHeaderAny).first().waitFor({ state: 'visible', timeout: 30_000 });
    return resp.url();
  }

  // ---------- network classification helpers (D2) ----------

  /**
   * Attach a counter for list-endpoint requests (filter `/navigator/api/...` per LR-056, NOT the page URL).
   * Returns a live getter + a `dispose()` — the `authenticatedSession.page` is worker-scoped, so the
   * listener MUST be removed at test end or it stacks across tests in the same worker.
   */
  attachListCallCounter(): { count: () => number; urls: () => string[]; dispose: () => void } {
    const urls: string[] = [];
    const handler = (req: import('@playwright/test').Request): void => {
      if (req.url().includes(CORP_PRICING_SEARCH_API)) urls.push(req.url());
    };
    this.page.on('request', handler);
    return {
      count: () => urls.length,
      urls: () => [...urls],
      dispose: () => this.page.off('request', handler),
    };
  }

  // ---------- Price Book name → details ----------

  /** Click a Price Book name cell (content-anchored) → navigates to /details/<guid>. */
  async clickPricebookName(name: string): Promise<void> {
    const row = await this.findRowByName(name);
    if (!row) throw new Error(`Price Book row not found for "${name}"`);
    await row.locator('button.cursor-pointer').first().click();
  }

  // ---------- New split-button ----------

  /**
   * Open the New split-button menu. Radix DropdownMenu can intermittently not open on the first click
   * under heavy-page timing, so re-click (Escape + retry) up to 3× until a menu item renders (the
   * proven Radix large-interaction retry pattern, LR-025 / navigation.md Radix-tab note).
   */
  async openNewMenu(): Promise<void> {
    const item = this.page.locator(S.mnuNewEquipmentPricing).first();
    for (let attempt = 0; attempt < 3; attempt++) {
      await this.page.locator(S.btnNew).first().click();
      try {
        // `waitFor` honors the timeout (unlike `isVisible({timeout})`, which checks immediately).
        await item.waitFor({ state: 'visible', timeout: 4_000 });
        return;
      } catch {
        if (attempt < 2) await this.page.keyboard.press('Escape').catch(() => { /* nothing open */ });
      }
    }
    await item.waitFor({ state: 'visible', timeout: 4_000 }); // final attempt — throws (real failure) if still closed
  }

  /** Open the New split-menu and select "Equipment Pricing". */
  async clickNewEquipmentPricing(): Promise<void> {
    await this.openNewMenu();
    await this.page.locator(S.mnuNewEquipmentPricing).first().click();
  }

  /** Open the New split-menu and select "Labor Pricing". */
  async clickNewLaborPricing(): Promise<void> {
    await this.openNewMenu();
    await this.page.locator(S.mnuNewLaborPricing).first().click();
  }

  // ---------- action-bar presence ----------

  /**
   * Whether an action-bar button is PRESENT (attached in the DOM). "Present", not "visible" — at a
   * headless viewport the 7-button action bar overflows, so some buttons exist but report not-visible;
   * presence is the right semantic for the DOCX "buttons present" requirement (the New affordance is
   * proven interactable separately via openNewMenu).
   */
  /**
   * All button label texts on the page (shadow-pierced, via textContent). Used for action-bar
   * presence: Playwright's `:text-is`/visible-text engine misses the action-bar buttons at the
   * test render (their label is not "visible text" to Playwright), but a shadow-walk over
   * `textContent` reliably finds all of them (verified live — all 7 action buttons present).
   */
  async getAllButtonTexts(): Promise<string[]> {
    return this.page.evaluate(() => {
      const acc: Element[] = [];
      const walk = (root: Document | ShadowRoot): void => {
        for (const n of Array.from(root.querySelectorAll('*'))) {
          acc.push(n);
          if ((n as HTMLElement).shadowRoot) walk((n as HTMLElement).shadowRoot as ShadowRoot);
        }
      };
      walk(document);
      return acc
        .filter((n) => n.tagName === 'BUTTON')
        .map((b) => (b.textContent || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean);
    });
  }
}
