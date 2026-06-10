/**
 * Corporate Pricing — Product Group Override screen page object (Wave-1.5 scaffold).
 * `CorporatePricingOverridePage extends CorporatePricingBasePage`.
 *
 * URL: /navigator/locations/{office}/settings/corporate-pricing/pg-override
 * Reached via the Search action-bar "Pricing Override" button (navigation confirmed BUILT 2026-06-08).
 *
 * Live model (verified 2026-06-08, `field-inventories/corporate-pricing-override-2026-06-08.md`):
 *  - Equipment / Labor tabs (Radix `role=tab`, `aria-selected`); switching reloads the grid.
 *  - Grid is **location-gated**: empty ("No results.") until a location is picked via the
 *    "Select a location" card → modal table (search + checkbox row + "Select").
 *  - 10-column grid; `Active` renders as a **Radix checkbox** (read `aria-checked`, LR-036).
 *  - "Filter Product Groups Override..." filters the grid **client-side** (no Search button).
 *  - Save is disabled on clean; dialog-gated by the shared Corporate Pricing save pattern.
 *
 * Selector strategy: text/role/grid-header/content-anchored (ZERO data-testids). Reuses the base
 * `readGridRowsByContent` / `findGridRowByContent` / `readAllTexts` / `isVisibleSafe` /
 * `confirmSaveDialogIfPresent` (ALL-026). Does NOT reuse the base `switchTab` — that union is typed
 * for the Details tabs ('Pricing Strategy' | 'Pricing Detail'); the Override Equipment/Labor tabs get
 * their own switcher here.
 *
 * EDIT MECHANISM (Q-WV15-1 RESOLVED, W15-A 2026-06-09): the grid IS editable for the automation user
 * (the 2026-06-08 recon's "inert cells" was a false negative). Click an Override Price / Max Discount
 * `div[role=button]` cell → an active `spinbutton` reveals → native value-setter (React-controlled;
 * `.fill()` does not commit) + `Enter` commits → Save enables. Active = Radix `checkbox` toggles +
 * dirties. Save → "Save Changes" dialog (matched via the CSS `[role="alertdialog"]` selector + TEXT
 * buttons — Playwright `getByRole('alertdialog')` does NOT match it) → POST corporate-price-pg-override
 * → toast. Net-zero (revert disables Save) verified. Max Discount % is capped at 100 (>100 rejected).
 */
import type { Page, Locator } from '@playwright/test';
import { CorporatePricingBasePage } from './corporate-pricing.page';
import type { IConfig } from '../../types';
import { CorporatePricingOverrideSelectors as OS } from '../../selectors/corporate-pricing/override';
import { CORPORATE_PRICING_ROUTES, CORPORATE_PRICING_COMMON } from '../../data/corporate-pricing/common';
import { CORP_PRICING_OVERRIDE } from '../../data/corporate-pricing/override';

export type OverrideTab = 'Equipment' | 'Labor';

export class CorporatePricingOverridePage extends CorporatePricingBasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
  }

  // ---------- navigation / readiness ----------

  /** Navigate directly to the Product Group Override screen. */
  async gotoOverride(office: string = CORPORATE_PRICING_COMMON.office): Promise<void> {
    const base = (this.config?.base_url ?? '').replace(/\/+$/, '');
    await this.navigateTo(`${base}${CORPORATE_PRICING_ROUTES.overridePath(office)}`);
    await this.waitForAngularStable();
    await this.waitForLoaded();
  }

  /** Open the Override screen (alias for gotoOverride; mirrors the Search page object's `open`). */
  async open(office: string = CORPORATE_PRICING_COMMON.office): Promise<void> {
    await this.gotoOverride(office);
  }

  /** Wait until the screen chrome (heading + tabs) has rendered. */
  async waitForLoaded(timeout = 30_000): Promise<void> {
    await this.page.locator(OS.ovrHeading).first().waitFor({ state: 'visible', timeout });
    await this.page.locator(OS.ovrTabEquipment).first().waitFor({ state: 'visible', timeout });
  }

  // ---------- Equipment / Labor tabs (NOT base switchTab — different tab set) ----------

  /** The currently-active tab ('Equipment' | 'Labor') per `aria-selected`. */
  async getActiveTab(): Promise<OverrideTab | null> {
    if ((await this.page.locator(OS.ovrTabEquipment).getAttribute('aria-selected')) === 'true') return 'Equipment';
    if ((await this.page.locator(OS.ovrTabLabor).getAttribute('aria-selected')) === 'true') return 'Labor';
    return null;
  }

  /** Switch to the Equipment or Labor tab and wait for `aria-selected="true"` on the target tab. */
  async switchOverrideTab(tab: OverrideTab): Promise<void> {
    const sel = tab === 'Equipment' ? OS.ovrTabEquipment : OS.ovrTabLabor;
    await this.page.locator(sel).first().click();
    // Wait for Radix to flip aria-selected. A Playwright locator pierces shadow DOM and auto-retries
    // until the attribute lands — no fixed sleep (LR-052), no raw document.querySelector (shadow-blind).
    await this.page
      .locator(`[role="tab"][aria-selected="true"]:has-text("${tab}")`)
      .first()
      .waitFor({ state: 'visible', timeout: 10_000 })
      .catch(() => { /* best-effort; the test asserts via getActiveTab */ });
    await this.waitForAngularStable();
  }

  // ---------- location picker ----------

  /** Open the "Select a location" picker dialog. */
  async openLocationPicker(): Promise<void> {
    await this.page.locator(OS.ovrSelectLocationText).first().click();
    await this.page.locator(OS.ovrLocationPickerSearch).first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  /**
   * Select a location to populate the grid: open the picker, search by name/number, check the
   * matching row, confirm with "Select". Content-anchored (LR-022) — never an index.
   */
  async selectLocation(nameOrNumber: string): Promise<void> {
    await this.openLocationPicker();
    await this.page.locator(OS.ovrLocationPickerSearch).first().fill(nameOrNumber);
    const row = this.page.locator(OS.ovrLocationPickerRowAny, { hasText: nameOrNumber }).first();
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.locator(OS.ovrLocationPickerRowCheckbox).first().check();
    await this.page.locator(OS.ovrLocationPickerSelect).first().click();
    await this.waitForAngularStable();
  }

  // ---------- filters ----------

  /** Currency filter option texts (opens, reads, closes). Live: ALL / USD / CAD / MXN. */
  async getCurrencyOptions(): Promise<string[]> {
    await this.page.locator(OS.ovrCurrencyDropdown).first().click();
    await this.page.locator('[role="option"]').first().waitFor({ state: 'visible', timeout: 8_000 });
    const out = (await this.page.locator('[role="option"]').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());
    await this.page.keyboard.press('Escape');
    return out.filter(Boolean);
  }

  /** Select a Currency filter option by visible text. */
  async selectCurrency(value: string): Promise<void> {
    await this.page.locator(OS.ovrCurrencyDropdown).first().click();
    await this.page.locator('[role="option"]', { hasText: value }).first().click();
    await this.waitForAngularStable();
  }

  /** Rows-per-page option texts (opens, reads, closes). Live: 10 / 20 / 30 / 40 / 50. */
  async getRowsPerPageOptions(): Promise<string[]> {
    await this.page.locator(OS.ovrRowsPerPage).first().click();
    await this.page.locator('[role="option"]').first().waitFor({ state: 'visible', timeout: 8_000 });
    const out = (await this.page.locator('[role="option"]').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());
    await this.page.keyboard.press('Escape');
    return out.filter(Boolean);
  }

  /** Read the "Active only" filter checkbox state (`aria-checked`). */
  async getActiveOnlyState(): Promise<boolean> {
    return (await this.page.locator(OS.ovrActiveOnlyCheckbox).first().getAttribute('aria-checked')) === 'true';
  }

  /** Check/uncheck the "Active only" filter (auto-verifies ARIA state). */
  async setActiveOnly(checked: boolean): Promise<void> {
    const cb = this.page.locator(OS.ovrActiveOnlyCheckbox).first();
    if (checked) await cb.check();
    else await cb.uncheck();
    await this.waitForAngularStable();
  }

  /**
   * Type into the client-side "Filter Product Groups Override..." input (narrows the rendered grid).
   * React-controlled + debounced: `.fill()` alone does not commit React state, and `waitForAngularStable`
   * is a no-op on this React app — so use `setReactInput` (native setter) + a one-shot settle for the
   * filter's debounce/re-render to land before the caller reads the row count (NOT a polling loop → LR-052 ok).
   */
  async filterProductGroups(text: string): Promise<void> {
    await this.setReactInput(OS.ovrFilterInput, text);
    await this.page.waitForTimeout(800);
  }

  /** Clear the product-group filter (native setter + settle). */
  async clearFilter(): Promise<void> {
    await this.setReactInput(OS.ovrFilterInput, '');
    await this.page.waitForTimeout(700);
  }

  // ---------- grid reads (content-anchored) ----------

  /** The grid column header texts, in DOM order. Live: 10 columns (Location…Updated By). */
  async getColumnHeaders(): Promise<string[]> {
    return this.readAllTexts(OS.ovrColHeaderAny);
  }

  /** Number of grid column headers rendered. */
  async getColumnCount(): Promise<number> {
    return this.page.locator(OS.ovrColHeaderAny).count();
  }

  /** Count currently-rendered grid rows (never assert the total — LR-022). */
  async getVisibleRowCount(): Promise<number> {
    return this.page.locator(OS.ovrGridRowAny).count();
  }

  /** Locate a grid row by Product Group name (content-anchored). Returns null if not present. */
  async findRowByProductGroup(name: string): Promise<Locator | null> {
    const row = this.page.locator(OS.ovrGridRowAny, { hasText: name }).first();
    return (await row.count()) > 0 ? row : null;
  }

  /** True when there are no override rows (the "No results." empty state is visible). */
  async isEmpty(): Promise<boolean> {
    return this.isVisibleSafe(OS.ovrNoResults);
  }

  /**
   * Read the `Active` cell of a row as a boolean. LR-036: the Override grid renders Active as a
   * Radix checkbox (`button[role=checkbox]`); read `aria-checked`, NOT `textContent`.
   */
  async readActiveState(row: Locator): Promise<boolean> {
    return (await row.locator('[role="checkbox"]').first().getAttribute('aria-checked')) === 'true';
  }

  /**
   * Read a numeric click-to-edit cell's DISPLAY value (the `div[role=button]`), waiting for display mode
   * so a read never races a still-open editor (which would yield "" → NaN on back-to-back edits).
   * Thousands separators are stripped so "999,999.00" → "999999.00" parses correctly.
   */
  private async readEditableCell(row: Locator, colIndex: number): Promise<string> {
    const cell = row.locator('td').nth(colIndex);
    const disp = cell.locator('[role="button"]').first();
    await disp.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => { /* fall back to the whole cell */ });
    const src = (await disp.count()) > 0 ? disp : cell;
    return (await src.innerText()).replace(/\s+/g, ' ').replace(/,/g, '').trim();
  }

  /** Read the Override Price cell display value (e.g. "445.00"). */
  async readOverridePrice(row: Locator): Promise<string> {
    return this.readEditableCell(row, CORP_PRICING_OVERRIDE.columnIndex.overridePrice);
  }

  /** Read the Max Discount % cell display value ("—" when unset). */
  async readMaxDiscount(row: Locator): Promise<string> {
    return this.readEditableCell(row, CORP_PRICING_OVERRIDE.columnIndex.maxDiscount);
  }

  // ---------- grid readiness ----------

  /** Wait for the override grid to render data rows (server-loaded after a location is selected). */
  async waitForGridRows(timeout = 20_000): Promise<void> {
    await this.page
      .locator(OS.ovrGridRowAny)
      .first()
      .waitFor({ state: 'visible', timeout })
      .catch(() => { /* may be legitimately empty (Labor / no-match filter) */ });
  }

  /** Reload the Override screen and re-select the location (the FCC `reload` step). */
  async reloadAndReselect(needle: string, office: string = CORPORATE_PRICING_COMMON.office): Promise<void> {
    await this.gotoOverride(office);
    await this.selectLocation(needle);
    await this.waitForGridRows();
  }

  // ---------- per-cell edit (Q-WV15-1 RESOLVED 2026-06-09 — click → spinbutton → native-set → Enter) ----------

  /**
   * Open a click-to-edit numeric cell (`div[role=button]`) and return its revealed `spinbutton` editor.
   * The Override grid spinbutton is React-controlled: `.fill()` does NOT commit React state, so callers
   * MUST use `setReactInput` (native value-setter) + `Enter` to commit. Verified live 2026-06-09.
   */
  private async openCellEditor(row: Locator, cellSel: string): Promise<Locator> {
    await row.locator(cellSel).first().click();
    const editor = this.page.getByRole('spinbutton').first();
    await editor.waitFor({ state: 'visible', timeout: 8_000 });
    return editor;
  }

  /** Open a numeric cell editor, native-set the value, Enter to commit, then wait for the editor to
   *  detach + a short settle so the cell's value <div> re-renders before any read (avoids a NaN race). */
  private async editNumericCell(row: Locator, cellSel: string, value: string): Promise<void> {
    const editor = await this.openCellEditor(row, cellSel);
    await this.setReactInput(editor, value);
    await editor.press('Enter');
    await editor.waitFor({ state: 'detached', timeout: 8_000 }).catch(() => { /* read below tolerates a slow close */ });
    await this.page.waitForTimeout(250);
  }

  /** Commit `value` into the row's Override Price cell (does NOT click Save). Dirties the form. */
  async setOverridePrice(row: Locator, value: string): Promise<void> {
    await this.editNumericCell(row, OS.ovrCellOverridePrice, value);
  }

  /** Commit `value` into the row's Max Discount % cell (does NOT click Save). Dirties the form. */
  async setMaxDiscount(row: Locator, value: string): Promise<void> {
    await this.editNumericCell(row, OS.ovrCellMaxDiscount, value);
  }

  /**
   * Attempt to commit a Max Discount value; returns true if it committed (editor closed) or false if the
   * field REJECTED it (editor stayed open — the live app caps Max Discount % at 100, so >100 is rejected).
   * On rejection the editor is Escaped to leave a clean cell. Does NOT click Save.
   */
  async tryMaxDiscount(row: Locator, value: string): Promise<boolean> {
    const editor = await this.openCellEditor(row, OS.ovrCellMaxDiscount);
    await this.setReactInput(editor, value);
    await editor.press('Enter');
    const committed = await editor.waitFor({ state: 'detached', timeout: 4_000 }).then(() => true).catch(() => false);
    if (!committed) {
      await editor.press('Escape').catch(() => {});
      await this.page.getByRole('spinbutton').first().waitFor({ state: 'detached', timeout: 4_000 }).catch(() => {});
    }
    await this.page.waitForTimeout(200);
    return committed;
  }

  /**
   * Open the Override Price editor, read the value the editor exposes, then **Escape** (discard — no
   * change staged). Used to prove the cell is editable without dirtying the form.
   */
  async peekOverridePriceEditor(row: Locator): Promise<string> {
    const editor = await this.openCellEditor(row, OS.ovrCellOverridePrice);
    const v = await editor.inputValue().catch(() => '');
    await editor.press('Escape').catch(() => {});
    await this.page.getByRole('spinbutton').first().waitFor({ state: 'detached', timeout: 5_000 }).catch(() => {});
    return v;
  }

  /**
   * Open the Override Price editor, attempt to set `raw` via the native setter, return the value the
   * (type=number) input actually retains, then Escape (no commit). Used to prove non-numeric input is
   * rejected (LR-011 — a `<input type=number>` coerces an invalid string to "").
   */
  async probeOverridePriceInput(row: Locator, raw: string): Promise<string> {
    const editor = await this.openCellEditor(row, OS.ovrCellOverridePrice);
    await this.setReactInput(editor, raw);
    const v = await editor.inputValue().catch(() => '');
    await editor.press('Escape').catch(() => {});
    await this.page.getByRole('spinbutton').first().waitFor({ state: 'detached', timeout: 5_000 }).catch(() => {});
    return v;
  }

  /** Toggle the row's Active checkbox (does NOT click Save). Dirties the form. */
  async toggleActive(row: Locator): Promise<void> {
    await row.locator(OS.ovrCellActiveCheckbox).first().click();
  }

  /** Set the row's Active checkbox to `checked` (no-op if already there). Does NOT click Save. */
  async setActive(row: Locator, checked: boolean): Promise<void> {
    if ((await this.readActiveState(row)) !== checked) await this.toggleActive(row);
  }

  // ---------- save (dialog-gated; live-verified 2026-06-09) ----------

  /** Whether the page-level Save button is enabled (dirty indicator). */
  async isOverrideSaveEnabled(): Promise<boolean> {
    return this.page.locator(OS.ovrBtnSave).first().isEnabled().catch(() => false);
  }

  /**
   * Click the page-level Save and confirm the shared "Save Changes" alertdialog, then settle on the
   * success toast. Live-verified flow (2026-06-09): Save → alertdialog (heading "Save Changes", body
   * "Are you sure you want to save the changes?", Cancel/Save) → `POST {saveApiPath}` → toast
   * "Pricing overrides saved successfully." The dialog can take a few seconds on this heavy page, so we
   * wait for it explicitly (the base 2.5s probe was too short in recon).
   */
  async saveAndConfirm(): Promise<void> {
    await this.page.locator(OS.ovrBtnSave).first().click();
    // The dialog is `<div role="alertdialog">` — Playwright `getByRole('alertdialog')` does NOT match it
    // (shadow/portal a11y exclusion), so use the CSS selector + the TEXT-anchored Save button (the
    // dialog buttons have no computed accessible name). W15-A live finding 2026-06-09.
    const dlg = this.page.locator(OS.ovrSaveDialog).first();
    await dlg.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => { /* direct-save fallback */ });
    if (await dlg.isVisible().catch(() => false)) {
      await this.page.locator(OS.ovrSaveDialogConfirm).first().click();
    }
    // settle on the success toast (persistence is re-verified by the caller's reload + DOM re-read)
    await this.page
      .getByText(CORP_PRICING_OVERRIDE.saveSuccessToast, { exact: false })
      .first()
      .waitFor({ state: 'visible', timeout: 12_000 })
      .catch(() => {});
    await this.waitForAngularStable(2_000).catch(() => {});
  }

  /**
   * Click Save and capture the verbatim "Save Changes" dialog text WITHOUT confirming, then Cancel
   * (no commit). Used by the save-dialog FCC case (mirrors the new-pricebook NO-COMMIT dialog probe).
   */
  async clickSaveAndCancel(): Promise<string> {
    await this.page.locator(OS.ovrBtnSave).first().click();
    const dlg = this.page.locator(OS.ovrSaveDialog).first();
    await dlg.waitFor({ state: 'visible', timeout: 10_000 });
    const text = (await dlg.innerText()).replace(/\s+/g, ' ').trim();
    await this.page.locator(OS.ovrSaveDialogCancel).first().click();
    await dlg.waitFor({ state: 'hidden', timeout: 8_000 }).catch(() => {});
    return text;
  }

  // ---------- fixture restore (LR-019 baseline; bounded-retry, throws if it can't restore) ----------

  /** Whitespace/decimal-tolerant numeric compare ("445.00" === "445"). */
  private static numEq(a: string, b: string): boolean {
    const n = (s: string): number => parseFloat(String(s).replace(/[^0-9.\-]/g, ''));
    return Number.isFinite(n(a)) && Number.isFinite(n(b)) && n(a) === n(b);
  }

  /** Max Discount baseline is "unset" — rendered as an em-dash / hyphen / empty. */
  private static isMaxDiscountUnset(s: string): boolean {
    const t = (s ?? '').replace(/\s+/g, '').trim();
    return t === '' || t === '—' || t === '-' || t === '–';
  }

  /**
   * Restore the fixture row to its baseline Override Price + Active + (unset) Max Discount. Reloads +
   * re-selects each cycle, re-reads, saves only if dirty; bounded to 3 cycles then a final verify that
   * THROWS if it could not restore (so a silent drift surfaces as a failure, mirroring the Legal
   * `ensureDefaultState`). Max Discount is cleared back to its unset state when a prior case set it.
   */
  async ensureDefaultState(
    anchor: string,
    defaults: { overridePrice: string; active: boolean },
    needle: string,
    office: string = CORPORATE_PRICING_COMMON.office,
  ): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      await this.reloadAndReselect(needle, office);
      const row = await this.findRowByProductGroup(anchor);
      if (!row) throw new Error(`ensureDefaultState: row "${anchor}" not found for office ${office}`);
      const priceOk = CorporatePricingOverridePage.numEq(await this.readOverridePrice(row), defaults.overridePrice);
      const activeOk = (await this.readActiveState(row)) === defaults.active;
      const mdOk = CorporatePricingOverridePage.isMaxDiscountUnset(await this.readMaxDiscount(row));
      if (priceOk && activeOk && mdOk) return;
      if (!priceOk) await this.setOverridePrice(row, defaults.overridePrice);
      if (!mdOk) await this.setMaxDiscount(row, ''); // clear back to unset
      if (!activeOk) await this.setActive(row, defaults.active);
      if (await this.isOverrideSaveEnabled()) await this.saveAndConfirm();
    }
    await this.reloadAndReselect(needle, office);
    const row = await this.findRowByProductGroup(anchor);
    const gotP = row ? await this.readOverridePrice(row) : 'MISSING';
    const gotMd = row ? await this.readMaxDiscount(row) : 'MISSING';
    const gotA = row ? await this.readActiveState(row) : null;
    if (
      !row ||
      !CorporatePricingOverridePage.numEq(gotP, defaults.overridePrice) ||
      !CorporatePricingOverridePage.isMaxDiscountUnset(gotMd) ||
      gotA !== defaults.active
    ) {
      throw new Error(`ensureDefaultState: failed to restore "${anchor}" (price=${gotP}, maxDisc=${gotMd}, active=${gotA})`);
    }
  }
}
