/**
 * Corporate Pricing — Search screen page object.
 * `CorporatePricingSearchPage extends CorporatePricingBasePage` (Search page object).
 *
 * Live model (verified 2026-06-05): filters STAGE on input (no network, no grid change);
 * the Search button submits all staged filters SERVER-SIDE as query params of
 * `GET /navigator/api/location/pricing/strategies`. Reset restores defaults + the full list
 * client-side. Read-only screen — no save. React/Next.js + shadcn DataTable; selectors are
 * text/role/placeholder/grid-<th>/content-anchored (near-zero data-testid).
 */
import type { Page, Locator } from '@playwright/test';
import { CorporatePricingBasePage } from './corporate-pricing.page';
import type { IConfig } from '../../types';
import { CorporatePricingSearchSelectors as S } from '../../selectors/corporate-pricing/search';
import { CORP_PRICING_SEARCH, CORP_PRICING_SEARCH_API } from '../../data/corporate-pricing/search';
import { CORPORATE_PRICING_COMMON } from '../../data/corporate-pricing/common';
import {
  CORP_PRICING_TOOLBAR_IO,
  CORP_PRICING_EXPORT_API,
  CORP_PRICING_LOC_EXPORT_API,
} from '../../data/corporate-pricing/toolbar-io';

export type SearchCheckbox = 'isInternal' | 'isLabor' | 'activeOnly';

export class CorporatePricingSearchPage extends CorporatePricingBasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
  }

  // ---------- navigation / readiness ----------

  /** Navigate to Search and wait for the grid to populate (item-count footer present). */
  async open(office: string = CORPORATE_PRICING_COMMON.office): Promise<void> {
    await this.gotoSearch(office);
    await this.waitForGridLoaded();
  }

  /**
   * Wait until the grid has actually rendered (headers + ≥1 data row).
   * NOT the "N items found" footer alone — that regex matches the transient "0 items found" empty
   * state that paints BEFORE the /pricing/strategies response lands (grid renders ~400ms later),
   * so waiting on the footer returns too early and every grid/column/option read races an empty grid.
   * Initial load always has rows (591); P1 search narrows never go to 0, so waiting for the first
   * row is safe (Playwright auto-waits, no fixed sleep).
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

  /** Count currently-rendered data rows (virtualized — ~50, NOT the 591 total; never assert the total). */
  async getVisibleRowCount(): Promise<number> {
    return this.page.locator(S.rowGridAny).count();
  }

  /** Raw item-count footer text (e.g. "591 items found"). */
  async getItemCountText(): Promise<string> {
    return (await this.page.locator(S.lblItemsFound).first().innerText()).replace(/\s+/g, ' ').trim();
  }

  /** Parsed item-count number (e.g. 591). VOLATILE — use for relative narrowed/broadened comparisons, never assert a fixed value. */
  async getItemCountNumber(): Promise<number> {
    const t = await this.getItemCountText();
    return parseInt(t.replace(/[^\d]/g, ''), 10);
  }

  /**
   * Sample the boolean columns (Is GSO..Is Productions, 0-based indices 3-7) across the rendered rows.
   * Returns whether any ✔ was seen and whether every boolean cell is ✔-or-empty.
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
   * Read a boolean cell (Unicode ✔): returns true when the cell shows ✔, false when empty.
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
   * DOM-tamper-crash caveat does not apply (plain text input; verified non-crashing live).
   */
  private async setTextFilter(selector: string, value: string): Promise<void> {
    // Delegates to the base React-controlled-input primitive (native value-setter + input/change
    // events). The native-setter block was de-duplicated into CorporatePricingBasePage.setReactInput
    // into a shared base primitive; behavior is identical (first()-match on the selector).
    await this.setReactInput(selector, value);
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
   * documented fallback). `.check()/.uncheck()` auto-verify the ARIA state (bare click can
   * focus-without-toggle on Radix checkboxes).
   */
  private checkbox(which: SearchCheckbox): Locator {
    const idx = which === 'isInternal' ? 0 : which === 'isLabor' ? 1 : 2;
    return this.page.locator('[role="checkbox"]').nth(idx);
  }

  /** Read a filter checkbox's ARIA state (true when `aria-checked="true"`). */
  async getCheckboxState(which: SearchCheckbox): Promise<boolean> {
    return (await this.checkbox(which).getAttribute('aria-checked')) === 'true';
  }

  /** Check or uncheck a filter checkbox (auto-verifies the ARIA state). */
  async setCheckbox(which: SearchCheckbox, checked: boolean): Promise<void> {
    const cb = this.checkbox(which);
    if (checked) await cb.check();
    else await cb.uncheck();
  }

  // ---------- dropdown filters ----------

  /** Open a combobox, return its option texts, then close (Escape). Safe (read-only) — never tamper. */
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

  /**
   * Open the Location combobox and select the FIRST REAL location (option index 1 — index 0 is the
   * "Clear selection" entry). Returns the option's visible label (e.g. "1101 - Corporate Office …")
   * so the caller can parse the office number and assert the `locationNo` query param. Retry-on-detach:
   * the 2652-option virtualized popover can detach an option mid-render. Used by the field-coverage
   * representative each-option case — exhaustive enumeration of all 2652 is out of scope.
   */
  async selectFirstRealLocation(): Promise<string> {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await this.page.locator(S.drpFilterLocation).first().click();
        const opt = this.page.locator('[role="option"]').nth(1);
        await opt.waitFor({ state: 'visible', timeout: 8_000 });
        const label = (await opt.innerText()).replace(/\s+/g, ' ').trim();
        await opt.click();
        return label;
      } catch {
        await this.page.keyboard.press('Escape').catch(() => { /* nothing open to dismiss */ });
      }
    }
    throw new Error('selectFirstRealLocation: the Location option did not stabilize after 3 attempts');
  }

  // ---------- Field-coverage boundary probe (announced + escapable rejection check) ----------

  /**
   * Probe the Pricebook text filter (a plain React `<input>`) for a BVA / negative value, returning the
   * rejection check bundle WITHOUT clicking Search (the caller submits + asserts the
   * server result). Records, in order:
   *  - `staged` / `stagedLen`: the committed input value (proves no maxlength truncation on overflow)
   *  - `ariaInvalid`: any rejection signal on the input — expected `null` (a search filter accepts any literal)
   *  - `escaped`: whether a NATURAL Tab moved focus OUT of the field, recorded BEFORE any cleanup key —
   *    the helper NEVER presses Escape first, so a real focus-trap is not masked (escapability check;
   *    graduated from the 2026-06-10 TC-523 miss)
   *  - `pageError`: count of "client-side exception" / "Application error" banners — expected 0 (the plain
   *    input is crash-safe, unlike the Radix combobox which tears down the page on DOM-tamper)
   */
  async probePricebookBoundary(
    value: string,
  ): Promise<{ staged: string; stagedLen: number; ariaInvalid: string | null; escaped: boolean; pageError: number }> {
    const input = this.page.locator(S.txtFilterPricebook).first();
    await input.focus();
    await this.setReactInput(S.txtFilterPricebook, value);
    const staged = await input.inputValue();
    const ariaInvalid = await input.getAttribute('aria-invalid');
    // (b) escapable — focus the field, then a natural Tab; confirm focus LEFT it (before any Escape).
    await input.focus();
    const before = await this.page.evaluate(() => (document.activeElement as HTMLInputElement)?.placeholder ?? null);
    await this.page.keyboard.press('Tab');
    const after = await this.page.evaluate(() => (document.activeElement as HTMLInputElement)?.placeholder ?? null);
    const pageError = await this.page.locator('text=/client-side exception|Application error/').count();
    return { staged, stagedLen: staged.length, ariaInvalid, escaped: before !== after, pageError };
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
   * Avoids fixed sleeps — waits on the `/navigator/api/...pricing/strategies` response.
   * Returns the request URL (so callers can assert the query-param shape).
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
    // poll in the spec handles the value-settle.
    await this.page.locator(S.colHeaderAny).first().waitFor({ state: 'visible', timeout: 30_000 });
    return resp.url();
  }

  // ---------- network classification helpers ----------

  /**
   * Attach a counter for list-endpoint requests (filter `/navigator/api/...`, NOT the page URL).
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
   * proven Radix large-interaction retry pattern).
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
   * presence is the right semantic for the "buttons present" requirement (the New affordance is
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

  // ---------- render-state reads (pricebook list) ----------

  /** Open the New split-menu and read its two item texts (Equipment Pricing / Labor Pricing). */
  async getNewMenuItemTexts(): Promise<string[]> {
    await this.openNewMenu();
    const eq = (await this.page.locator(S.mnuNewEquipmentPricing).first().innerText().catch(() => '')).trim();
    const lb = (await this.page.locator(S.mnuNewLaborPricing).first().innerText().catch(() => '')).trim();
    await this.page.keyboard.press('Escape').catch(() => { /* menu may already be closing */ });
    return [eq, lb].filter(Boolean);
  }

  /** The grid column header texts, in order. */
  async getGridHeaders(): Promise<string[]> {
    return (await this.page.locator('thead th').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
  }

  /**
   * Every Price Book name cell on the current page, with whether it carries a link affordance
   * (a clickable button). Proves every pricebook-name cell is a link that navigates to Details.
   */
  async getPricebookNameCells(): Promise<{ text: string; isLink: boolean }[]> {
    const rows = this.page.locator('tbody tr');
    const n = await rows.count();
    const out: { text: string; isLink: boolean }[] = [];
    for (let i = 0; i < n; i++) {
      const firstCell = rows.nth(i).locator('td').first();
      const text = (await firstCell.innerText()).replace(/\s+/g, ' ').trim();
      const isLink = (await firstCell.locator('button.cursor-pointer, a, [role="link"]').count()) > 0;
      out.push({ text, isLink });
    }
    return out;
  }

  /** Read a data row's cell text by 0-based row + column index (content-anchored). */
  async getRowCellText(rowIndex: number, colIndex: number): Promise<string> {
    const cell = this.page.locator('tbody tr').nth(rowIndex).locator('td').nth(colIndex);
    return (await cell.innerText()).replace(/\s+/g, ' ').trim();
  }

  /**
   * The Currency column is filled by a SECOND request (the core/currencies lookup) that resolves
   * AFTER the grid rows render, so each Currency cell shows a "-" placeholder until it lands and the
   * grid re-maps the code. The grid-loaded wait only proves the rows rendered, so a Currency read
   * fired right after it can catch the placeholder (the window widens under heavy back-to-back load).
   * Poll the DOM until the first row's Currency cell resolves away from the placeholder before reading.
   * Best-effort (.catch): if it genuinely never resolves (a real defect), the caller still reads "-"
   * and its currency assertion fails cleanly — this removes the race without weakening the assertion.
   */
  async waitForCurrencyColumnResolved(timeout = 15_000): Promise<void> {
    const headers = await this.getGridHeaders();
    const idx = headers.findIndex((h) => /currency/i.test(h));
    if (idx < 0) return; // no Currency column on this grid — nothing to settle
    await this.page.waitForFunction(
      (i) => {
        const r0 = document.querySelector('tbody tr');
        if (!r0) return false;
        const txt = (r0.querySelectorAll('td')[i]?.textContent || '').trim();
        return txt.length > 0 && txt !== '-';
      },
      idx,
      { timeout, polling: 100 },
    ).catch(() => { /* never resolved — the read below returns the placeholder, assertion fails cleanly */ });
  }

  // ===========================================================================
  // Toolbar I/O — Export ▾ / Import ▾ / Loc Pricing / Grid Options.
  // Trigger + variant level ONLY: assert the menu opens, the variants are present, and the correct
  // endpoint fires (Export) / dialog opens (Import). Real download/upload round-trip is a later edge-case test phase.
  // ===========================================================================

  /**
   * Open a toolbar `▾` dropdown (Export / Import). Mirrors `openNewMenu`'s Radix retry — the Radix
   * DropdownMenu can intermittently not open on the first click under heavy-page timing.
   */
  private async openToolbarMenu(triggerSelector: string): Promise<void> {
    const item = this.page.locator(S.mnuToolbarVariant).first();
    for (let attempt = 0; attempt < 3; attempt++) {
      await this.page.locator(triggerSelector).first().click();
      try {
        await item.waitFor({ state: 'visible', timeout: 4_000 });
        return;
      } catch {
        if (attempt < 2) await this.page.keyboard.press('Escape').catch(() => { /* nothing open */ });
      }
    }
    await item.waitFor({ state: 'visible', timeout: 4_000 }); // final attempt — throws if still closed
  }

  /** Open the Export ▾ dropdown. */
  async openExportMenu(): Promise<void> {
    await this.openToolbarMenu(S.btnExport);
  }

  /** Open the Import ▾ dropdown. */
  async openImportMenu(): Promise<void> {
    await this.openToolbarMenu(S.btnImport);
  }

  /** The variant labels currently listed in the open Export/Import menu (whitespace-normalized). */
  async getMenuVariants(): Promise<string[]> {
    return (await this.page.locator(S.mnuToolbarVariant).allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
  }

  /**
   * Dismiss the open toolbar menu by clicking outside it (on the page heading); true if it closed.
   * Uses a COORDINATE mouse-click, not `locator(heading).click()`: while a Radix menu is open it renders
   * a dismissable overlay over the page, so a locator click on an underlying element is "obscured" and
   * never becomes actionable (times out). A coordinate `mouse.click` dispatches a real pointerdown the
   * overlay catches to dismiss the menu (live-verified 2026-06-09). The heading sits top-left, well
   * outside the top-right Export/Import menu panel, so the click lands genuinely outside it.
   */
  async dismissToolbarMenuWithOutsideClick(): Promise<boolean> {
    const box = await this.page.locator(S.hdgCorporatePricing).first().boundingBox();
    if (box) await this.page.mouse.click(box.x + Math.min(box.width / 2, 40), box.y + box.height / 2);
    else await this.page.mouse.click(200, 200); // fallback: a safe outside-the-menu point
    await this.page.locator(S.mnuToolbarVariant).first().waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => { /* already gone */ });
    return (await this.page.locator(S.mnuToolbarVariant).count()) === 0;
  }

  /**
   * Open Export ▾, click a variant, and return the export request URL. The `waitForRequest` predicate
   * is armed BEFORE the click and filters the backend export API path (never the page URL,
   * which Next.js App-Router also POSTs to for RSC renders). Trigger-level: the request firing is the
   * assertion; the downloaded CSV's content is deferred to a later edge-case test phase (no `waitForEvent('download')`).
   */
  async clickExportVariantAndCaptureUrl(variant: string): Promise<string> {
    await this.openExportMenu();
    const reqPromise = this.page.waitForRequest((r) => r.url().includes(CORP_PRICING_EXPORT_API), { timeout: 15_000 });
    await this.page.locator(S.mnuToolbarVariant, { hasText: variant }).first().click();
    return (await reqPromise).url();
  }

  /** The custom "Import ..." upload dialog, scoped by its prompt text (role is `dialog` or `alertdialog`). */
  private importDialog(): Locator {
    return this.page.locator(S.dlgImport).filter({ hasText: CORP_PRICING_TOOLBAR_IO.importDialog.prompt }).first();
  }

  /** Open Import ▾ and click a variant — opens the "Import <variant>" dialog (NOT a native file chooser). */
  async openImportVariantDialog(variant: string): Promise<void> {
    await this.openImportMenu();
    await this.page.locator(S.mnuToolbarVariant, { hasText: variant }).first().click();
    await this.importDialog().waitFor({ state: 'visible', timeout: 6_000 });
  }

  /** Read the open import dialog: full text, button labels, and whether it carries a file input. */
  async getImportDialogInfo(): Promise<{ text: string; buttons: string[]; hasFileInput: boolean }> {
    const dlg = this.importDialog();
    const text = (await dlg.innerText()).replace(/\s+/g, ' ').trim();
    const buttons = (await dlg.locator('button').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
    const hasFileInput = (await dlg.locator('input[type="file"]').count()) > 0;
    return { text, buttons, hasFileInput };
  }

  /** Close the import dialog (Close/Cancel button, else Escape). No file is uploaded (deferred to a later edge-case test phase). */
  async closeImportDialog(): Promise<void> {
    const dlg = this.importDialog();
    if ((await dlg.count()) === 0) return;
    const closeBtn = dlg.locator('button', { hasText: /^(Close|Cancel)$/ }).first();
    if ((await closeBtn.count()) > 0) await closeBtn.click().catch(() => { /* fall through to Escape */ });
    else await this.page.keyboard.press('Escape').catch(() => { /* nothing */ });
    await dlg.waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => { /* already closed */ });
  }

  /**
   * Click "Loc Pricing Export" (direct, no menu) and return the location-export request URL.
   * `waitForRequest` armed before the click, filtered on the backend API path.
   */
  async clickLocPricingExportAndCaptureUrl(): Promise<string> {
    const reqPromise = this.page.waitForRequest((r) => r.url().includes(CORP_PRICING_LOC_EXPORT_API), { timeout: 15_000 });
    await this.page.locator(S.btnLocPricingExport).first().click();
    return (await reqPromise).url();
  }

  /** Click "Loc Pricing Import" (direct, no menu) — opens the "Import All Location Pricing" dialog. */
  async openLocPricingImportDialog(): Promise<void> {
    await this.page.locator(S.btnLocPricingImport).first().click();
    await this.importDialog().waitFor({ state: 'visible', timeout: 6_000 });
  }

  // ---------- Grid Options (column show/hide popover) ----------

  /** Open the Grid Options menu (the icon button anchored by aria-label). Radix retry, mirrors openNewMenu. */
  async openGridOptions(): Promise<void> {
    const item = this.page.locator(S.mnuGridColumn).first();
    for (let attempt = 0; attempt < 3; attempt++) {
      await this.page.locator(S.btnGridOptions).first().click();
      try {
        await item.waitFor({ state: 'visible', timeout: 4_000 });
        return;
      } catch {
        if (attempt < 2) await this.page.keyboard.press('Escape').catch(() => { /* nothing open */ });
      }
    }
    await item.waitFor({ state: 'visible', timeout: 4_000 });
  }

  /** The Grid Options column toggles: `{ label, checked }` per `menuitemcheckbox` (menu must be open). */
  async getGridOptionColumns(): Promise<{ label: string; checked: boolean }[]> {
    const loc = this.page.locator(S.mnuGridColumn);
    const n = await loc.count();
    const out: { label: string; checked: boolean }[] = [];
    for (let i = 0; i < n; i++) {
      const el = loc.nth(i);
      out.push({
        label: (await el.innerText()).replace(/\s+/g, ' ').trim(),
        checked: (await el.getAttribute('aria-checked')) === 'true',
      });
    }
    return out;
  }

  /** Toggle one Grid Options column by its label (menu must be open). */
  async toggleGridColumn(label: string): Promise<void> {
    await this.page.locator(S.mnuGridColumn, { hasText: label }).first().click();
  }

  /** Close the Grid Options menu (Escape). */
  async closeGridOptions(): Promise<void> {
    await this.page.keyboard.press('Escape').catch(() => { /* nothing open */ });
    await this.page.locator(S.mnuGridColumn).first().waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => { /* already closed */ });
  }

  /** True if a grid column header with the given label is currently rendered. */
  async isGridColumnVisible(label: string): Promise<boolean> {
    return (await this.getColumnHeaders()).some((h) => h === label || h.includes(label));
  }

  /**
   * Mutation-safety restore: re-check any unchecked Grid Options column so the grid returns to its
   * all-columns-visible baseline. Self-navigates (fresh page) so it is robust as a beforeEach/afterEach
   * regardless of the test's end state. The column-visibility preference is server-persisted per user.
   */
  async ensureAllGridColumnsVisible(): Promise<void> {
    await this.open();
    await this.openGridOptions();
    const cols = await this.getGridOptionColumns();
    for (const c of cols) {
      if (!c.checked) await this.toggleGridColumn(c.label);
    }
    await this.closeGridOptions();
  }

  // ---------- column-content reads (filter → grid coherence) ----------

  /** 0-based index of a grid column by its header text (exact, else substring). -1 if absent. */
  async getColumnIndexByName(name: string): Promise<number> {
    const headers = await this.getColumnHeaders();
    const exact = headers.indexOf(name);
    return exact >= 0 ? exact : headers.findIndex((h) => h.includes(name));
  }

  /** Whitespace-normalized text of a named column across all CURRENTLY-RENDERED rows (virtualized sample). */
  async readColumnForVisibleRows(name: string): Promise<string[]> {
    const idx = await this.getColumnIndexByName(name);
    if (idx < 0) throw new Error(`readColumnForVisibleRows: column "${name}" not found in grid headers`);
    const rows = this.page.locator(S.rowGridAny);
    const n = await rows.count();
    const out: string[] = [];
    for (let r = 0; r < n; r++) out.push((await rows.nth(r).locator('td').nth(idx).innerText()).replace(/\s+/g, ' ').trim());
    return out;
  }

  /** Boolean state (Unicode ✔ = true, empty = false) of a named boolean column across rendered rows. */
  async readBooleanColumnForVisibleRows(name: string): Promise<boolean[]> {
    const idx = await this.getColumnIndexByName(name);
    if (idx < 0) throw new Error(`readBooleanColumnForVisibleRows: column "${name}" not found`);
    const rows = this.page.locator(S.rowGridAny);
    const n = await rows.count();
    const out: boolean[] = [];
    for (let r = 0; r < n; r++) out.push(await this.readBooleanCell(rows.nth(r), idx));
    return out;
  }

  /** Price Book name (column 0) of the first N rendered rows — content anchor for order/identity checks. */
  async getFirstNPriceBookNames(n: number): Promise<string[]> {
    const rows = this.page.locator(S.rowGridAny);
    const count = Math.min(await rows.count(), n);
    const out: string[] = [];
    for (let r = 0; r < count; r++) out.push((await rows.nth(r).locator('td').nth(0).innerText()).replace(/\s+/g, ' ').trim());
    return out;
  }

  /** Number of data rows currently in the `<tbody>` (0 on an empty result). */
  async getTbodyRowCount(): Promise<number> {
    return this.page.locator(S.rowGridAny).count();
  }

  /** Whether the verbatim "No results." empty-state message is shown. */
  async hasNoResultsMessage(): Promise<boolean> {
    return this.isVisibleSafe(S.lblNoResults);
  }

  /** Count of Price Book name link-cells rendered in the grid (each navigates to a pricebook's Details). */
  async getPricebookLinkCellCount(): Promise<number> {
    return this.page.locator(S.rowNameButton).count();
  }

  // ---------- pagination (shadcn DataTable footer) ----------

  /** The rows-per-page selector — the only [role="combobox"] whose label is purely digits. */
  private pageSizeCombo(): Locator {
    return this.page.locator(S.drpPageSizeRole).filter({ hasText: /^\s*\d+\s*$/ }).first();
  }

  /** Whether a rows-per-page selector is present (digit-text combobox). */
  async hasPageSizeControl(): Promise<boolean> {
    return (await this.page.locator(S.drpPageSizeRole).filter({ hasText: /^\s*\d+\s*$/ }).count()) > 0;
  }

  /** The current rows-per-page value (e.g. "50"). */
  async getPageSizeValue(): Promise<string> {
    return (await this.pageSizeCombo().innerText()).replace(/\s+/g, ' ').trim();
  }

  /** Open the rows-per-page selector, read its option texts, close (Escape). */
  async getPageSizeOptions(): Promise<string[]> {
    await this.pageSizeCombo().click();
    await this.page.locator('[role="option"]').first().waitFor({ state: 'visible', timeout: 8_000 });
    const out = (await this.page.locator('[role="option"]').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());
    await this.page.keyboard.press('Escape').catch(() => { /* nothing open */ });
    return out.filter(Boolean);
  }

  /** Select a rows-per-page value and wait for the grid to re-render (no fixed sleep). */
  async setPageSize(value: string | number): Promise<void> {
    await this.pageSizeCombo().click();
    await this.page.locator('[role="option"]', { hasText: new RegExp(`^${value}$`) }).first().click();
    await this.page.locator(S.rowGridAny).first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => { /* grid settles */ });
  }

  private pageNavSelector(which: 'first' | 'previous' | 'next' | 'last'): string {
    return which === 'first' ? S.btnPageFirst : which === 'previous' ? S.btnPagePrev : which === 'next' ? S.btnPageNext : S.btnPageLast;
  }

  /** Whether a pagination nav button is present at all. */
  async hasPageNav(which: 'first' | 'previous' | 'next' | 'last'): Promise<boolean> {
    return (await this.page.locator(this.pageNavSelector(which)).count()) > 0;
  }

  /** Whether a pagination nav button is disabled (`disabled` attr or `aria-disabled="true"`). */
  async isPageNavDisabled(which: 'first' | 'previous' | 'next' | 'last'): Promise<boolean> {
    const b = this.page.locator(this.pageNavSelector(which)).first();
    if (await b.isDisabled().catch(() => false)) return true;
    return (await b.getAttribute('aria-disabled')) === 'true';
  }

  /** Click a pagination nav button and wait for the grid to settle. */
  async clickPageNav(which: 'first' | 'previous' | 'next' | 'last'): Promise<void> {
    await this.page.locator(this.pageNavSelector(which)).first().click();
    await this.page.locator(S.rowGridAny).first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => { /* grid settles */ });
  }

  // ---------- sorting (column-header buttons) ----------

  private headerCell(name: string): Locator {
    return this.page.locator(S.colHeaderAny, { hasText: name }).first();
  }

  /** Whether a column header (by text) wraps a clickable button (the sort trigger). */
  async columnHeaderHasButton(name: string): Promise<boolean> {
    return (await this.headerCell(name).locator('button').count()) > 0;
  }

  /** Click a column header's sort button (if present) and let the grid settle. */
  async clickColumnHeaderSort(name: string): Promise<void> {
    const btn = this.headerCell(name).locator('button').first();
    if ((await btn.count()) > 0) await btn.click();
    else await this.headerCell(name).click();
    await this.page.locator(S.rowGridAny).first().waitFor({ state: 'visible', timeout: 10_000 }).catch(() => { /* settle */ });
  }

  /** The `aria-sort` attribute on a column header (null when no active sort). */
  async getColumnAriaSort(name: string): Promise<string | null> {
    return this.headerCell(name).getAttribute('aria-sort');
  }
}
