/**
 * Corporate Pricing — Product Group Override screen page object.
 * `CorporatePricingOverridePage extends CorporatePricingBasePage`.
 *
 * URL: /navigator/locations/{office}/settings/corporate-pricing/pg-override
 * Reached via the Search action-bar "Pricing Override" button (navigation confirmed BUILT 2026-06-08).
 *
 * Live model (verified 2026-06-08):
 *  - Equipment / Labor tabs (Radix `role=tab`, `aria-selected`); switching reloads the grid.
 *  - Grid is **location-gated**: empty ("No results.") until a location is picked via the
 *    "Select a location" card → modal table (search + checkbox row + "Select").
 *  - 10-column grid; `Active` renders as a **Radix checkbox** (read `aria-checked`).
 *  - "Filter Product Groups Override..." filters the grid **client-side** (no Search button).
 *  - Save is disabled on clean; dialog-gated by the shared Corporate Pricing save pattern.
 *
 * Selector strategy: text/role/grid-header/content-anchored (ZERO data-testids). Reuses the base
 * `readGridRowsByContent` / `findGridRowByContent` / `readAllTexts` / `isVisibleSafe` /
 * `confirmSaveDialogIfPresent` (shared base helpers). Does NOT reuse the base `switchTab` — that union is typed
 * for the Details tabs ('Pricing Strategy' | 'Pricing Detail'); the Override Equipment/Labor tabs get
 * their own switcher here.
 *
 * EDIT MECHANISM (RESOLVED 2026-06-09): the grid IS editable for the automation user
 * (an earlier exploration's "inert cells" reading was a false negative). Click an Override Price / Max Discount
 * `div[role=button]` cell → an active `spinbutton` reveals → native value-setter (React-controlled;
 * `.fill()` does not commit) + `Enter` commits → Save enables. Active = Radix `checkbox` toggles +
 * dirties. Save → "Save Changes" dialog (matched via the CSS `[role="alertdialog"]` selector + TEXT
 * buttons — Playwright `getByRole('alertdialog')` does NOT match it) → POST corporate-price-pg-override
 * → toast. Net-zero (revert disables Save) verified. Max Discount % is capped at 100 (>100 rejected).
 */
import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';
import { CorporatePricingBasePage } from './corporate-pricing.page';
import type { IConfig } from '../../types';
import { CorporatePricingOverrideSelectors as OS } from '../../selectors/corporate-pricing/override';
import { CORPORATE_PRICING_ROUTES, CORPORATE_PRICING_COMMON } from '../../data/corporate-pricing/common';
import { CORP_PRICING_OVERRIDE } from '../../data/corporate-pricing/override';
import { Log } from '../../utils/logger';
import { readFileSync } from 'node:fs';

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
    // until the attribute lands — no fixed sleep, no raw document.querySelector (shadow-blind).
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
   * matching row, confirm with "Select". Content-anchored — never an index.
   */
  async selectLocation(nameOrNumber: string): Promise<void> {
    const search = this.page.locator(OS.ovrLocationPickerSearch).first();
    await this.openLocationPicker();
    // The picker is a Radix modal whose search input can mount a moment before it becomes
    // editable (open animation + a server-loaded location list). A fill occasionally races
    // that window and finds the input non-editable; a fresh re-open reliably clears the stuck
    // state, so the open-and-fill is bounded-retried before giving up.
    for (let attempt = 1; ; attempt++) {
      try {
        await search.fill(nameOrNumber, { timeout: 6_000 });
        break;
      } catch (err) {
        if (attempt >= 3) throw err;
        await this.page.keyboard.press('Escape').catch(() => { /* best-effort dismiss before re-open */ });
        await search.waitFor({ state: 'hidden', timeout: 2_000 }).catch(() => { /* best-effort: re-open regardless of dismiss result */ });
        await this.openLocationPicker();
      }
    }
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
   * filter's debounce/re-render to land before the caller reads the row count (NOT a polling loop).
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

  /** Count currently-rendered grid rows (never assert the total). */
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
   * Read the `Active` cell of a row as a boolean. The Override grid renders Active as a
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

  /** Reload the Override screen and re-select the location (the field-coverage `reload` step). */
  async reloadAndReselect(needle: string, office: string = CORPORATE_PRICING_COMMON.office): Promise<void> {
    await this.gotoOverride(office);
    await this.selectLocation(needle);
    await this.waitForGridRows();
  }

  // ---------- per-cell edit (resolved 2026-06-09 — click → spinbutton → native-set → Enter) ----------

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
   * rejected (a `<input type=number>` coerces an invalid string to "").
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
   * wait for it explicitly (the base 2.5s probe was too short during initial exploration).
   */
  async saveAndConfirm(): Promise<void> {
    await this.page.locator(OS.ovrBtnSave).first().click();
    // The dialog is `<div role="alertdialog">` — Playwright `getByRole('alertdialog')` does NOT match it
    // (shadow/portal a11y exclusion), so use the CSS selector + the TEXT-anchored Save button (the
    // dialog buttons have no computed accessible name). Live finding 2026-06-09.
    const dlg = this.page.locator(OS.ovrSaveDialog).first();
    await dlg.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => { /* direct-save fallback */ });
    if (await dlg.isVisible().catch(() => false)) {
      await this.page.locator(OS.ovrSaveDialogConfirm).first().click();
    }
    // Settle on the success toast (persistence is re-verified by the caller's reload + DOM re-read).
    // Warn instead of silently swallowing a timeout — a missing toast is a real signal the save may
    // not have completed cleanly, even though the caller's reload + re-read remains the proof.
    const toastSeen = await this.page
      .getByText(CORP_PRICING_OVERRIDE.saveSuccessToast, { exact: false })
      .first()
      .waitFor({ state: 'visible', timeout: 12_000 })
      .then(() => true)
      .catch(() => false);
    if (!toastSeen) {
      Log.warn('saveAndConfirm: success toast not seen within 12s — the caller reload + re-read still proves persistence, but the save may not have completed cleanly.');
    }
    await this.waitForAngularStable(2_000).catch(() => {});
  }

  /**
   * Click Save and capture the verbatim "Save Changes" dialog text WITHOUT confirming, then Cancel
   * (no commit). Used by the save-dialog field-coverage case (mirrors the new-pricebook NO-COMMIT dialog probe).
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

  // ---------- fixture restore (per-test baseline; bounded-retry, throws if it can't restore) ----------

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

  // ---------- navigation from the Search action bar ----------

  /** Start on the Search screen and click its "Pricing Override" action-bar button; wait for the Override screen. */
  async openViaSearchActionBar(office: string = CORPORATE_PRICING_COMMON.office): Promise<void> {
    const base = (this.config?.base_url ?? '').replace(/\/+$/, '');
    await this.navigateTo(`${base}${CORPORATE_PRICING_ROUTES.searchPath(office)}`);
    await this.waitForAngularStable();
    await this.page.locator(OS.ovrNavFromSearch).first().click();
    await this.page.waitForURL(/\/pg-override/, { timeout: 20_000 }).catch(() => { /* the caller asserts the URL */ });
    await this.waitForLoaded();
  }

  // ---------- location picker detail ----------

  /**
   * Open the location picker, capture its detail facts (title, Select disabled-before / enabled-after a row
   * is checked, matching-row count), then Cancel (no location applied). Returns the observed facts.
   */
  async inspectLocationModal(needle: string): Promise<{
    title: string;
    selectDisabledInitially: boolean;
    rowsMatching: number;
    selectEnabledAfterCheck: boolean;
    gridEmptyAfterCancel: boolean;
  }> {
    await this.openLocationPicker();
    const title = (await this.page.locator(OS.ovrLocationModalDialog).first().innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
    const selectDisabledInitially = await this.page.locator(OS.ovrLocationPickerSelect).first().isDisabled().catch(() => false);
    await this.page.locator(OS.ovrLocationPickerSearch).first().fill(needle);
    const rows = this.page.locator(OS.ovrLocationPickerRowAny, { hasText: needle });
    // The picker search is server-backed — wait for the matching row to render before counting
    // (a fixed sleep raced the result). A genuine zero-match is still handled by the count below.
    await rows.first().waitFor({ state: 'visible', timeout: 10_000 }).catch(() => { /* best-effort: zero rows is itself a valid observation */ });
    const rowsMatching = await rows.count();
    await rows.first().locator(OS.ovrLocationPickerRowCheckbox).first().check().catch(() => { /* row may need a plain click */ });
    // Wait for the Select button to actually become enabled after checking the row, rather than a
    // fixed pause; a row that genuinely never enables Select resolves to false at the timeout.
    const selectBtn = this.page.locator(OS.ovrLocationPickerSelect).first();
    const selectEnabledAfterCheck = await expect(selectBtn)
      .toBeEnabled({ timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
    await this.page.locator(OS.ovrLocationPickerCancel).first().click().catch(() => { /* best-effort dismiss; the gridEmptyAfterCancel read below is the real check */ });
    // Wait for the choose-a-location prompt to actually reappear (picker closed) rather than a fixed pause.
    await this.page.locator(OS.ovrSelectLocationText).first().waitFor({ state: 'visible', timeout: 5_000 }).catch(() => { /* the read below is the real oracle */ });
    const gridEmptyAfterCancel = await this.isVisibleSafe(OS.ovrSelectLocationText);
    return { title, selectDisabledInitially, rowsMatching, selectEnabledAfterCheck, gridEmptyAfterCancel };
  }

  // ---------- Grid Options (column show/hide; visibility persists server-side) ----------

  /** Open the Grid Options popover (an icon button carrying an accessible name). */
  async openGridOptions(): Promise<void> {
    await this.page.locator(OS.ovrBtnGridOptions).first().click();
    await this.page.locator(OS.ovrGridOptionsMenuItem).first().waitFor({ state: 'visible', timeout: 8_000 });
  }

  /** Read the Grid Options column toggles as {label, checked}. */
  async getGridOptionColumns(): Promise<Array<{ label: string; checked: boolean }>> {
    return this.page.locator(OS.ovrGridOptionsMenuItem).evaluateAll((els) =>
      els.map((e) => ({
        label: (e.textContent || '').replace(/\s+/g, ' ').trim(),
        checked: e.getAttribute('aria-checked') === 'true',
      })),
    );
  }

  /** Toggle a Grid Options column by its visible label. */
  async toggleGridColumn(label: string): Promise<void> {
    await this.page.locator(OS.ovrGridOptionsMenuItem, { hasText: label }).first().click();
    await this.page.waitForTimeout(500);
  }

  /** Close the Grid Options popover. */
  async closeGridOptions(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(400);
  }

  /** Whether a grid column header containing the given label is currently rendered. */
  async isGridColumnVisible(label: string): Promise<boolean> {
    const headers = await this.getColumnHeaders();
    return headers.some((h) => h.includes(label));
  }

  /** Click "Reset to Default" inside the Grid Options popover (restores every column). */
  async resetGridToDefault(): Promise<void> {
    await this.page.locator(OS.ovrGridOptionsReset).first().click().catch(() => { /* best-effort; callers re-open Grid Options and verify column state */ });
    await this.page.waitForTimeout(600);
  }

  /**
   * Baseline restore: ensure every grid column is visible again. Column visibility is a server-persisted
   * preference, so a test that hides a column must restore it. Bounded retry re-reads the columns after
   * a reload and re-toggles any still hidden, throwing if the baseline cannot be restored — a silently
   * no-op'd toggle must never report success while a column stays hidden for the next test.
   */
  async ensureAllGridColumnsVisible(needle: string, office: string = CORPORATE_PRICING_COMMON.office): Promise<void> {
    const allColumnsChecked = async (): Promise<boolean> => {
      await this.openGridOptions();
      const cols = await this.getGridOptionColumns();
      await this.closeGridOptions();
      return cols.every((c) => c.checked);
    };
    await this.saveAndVerifyPersisted({
      isAtTarget: allColumnsChecked,
      applyMutation: async () => {
        await this.openGridOptions();
        const cols = await this.getGridOptionColumns();
        for (const c of cols) if (!c.checked) await this.toggleGridColumn(c.label);
        await this.closeGridOptions();
      },
      save: async () => { /* each toggle persists immediately server-side; no separate save step */ },
      reload: async () => this.reloadAndReselect(needle, office),
      label: 'grid column visibility',
    });
  }

  // ---------- toolbar Export (direct CSV download) / Import (dialog) ----------

  /**
   * Click the Override toolbar's Export button and capture the direct CSV download: returns its filename,
   * the download request URL, and the file's raw content + parsed header row. The exported file is the oracle.
   */
  async downloadOverrideExport(): Promise<{ filename: string; requestUrl: string; content: string; headers: string[] }> {
    const [download, request] = await Promise.all([
      this.page.waitForEvent('download', { timeout: 30_000 }),
      this.page.waitForRequest((r) => r.url().includes(CORP_PRICING_OVERRIDE.export.apiPathFragment), { timeout: 30_000 }),
      this.page.locator(OS.ovrBtnExport).first().click(),
    ]);
    const filePath = await download.path();
    if (!filePath) throw new Error('downloadOverrideExport: the download did not resolve to a file path');
    const raw = readFileSync(filePath, 'utf-8');
    const content = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw; // strip a leading byte-order mark if present
    const firstLine = content.split(/\r?\n/)[0] ?? '';
    const headers = firstLine ? firstLine.split(',').map((h) => h.replace(/^"|"$/g, '').trim()) : [];
    return { filename: download.suggestedFilename(), requestUrl: request.url(), content, headers };
  }

  /** Open the Override toolbar's Import dialog (a custom in-app modal, not a native file chooser). */
  async openImportDialog(): Promise<void> {
    await this.page.locator(OS.ovrBtnImport).first().click();
    await this.page.locator(OS.ovrImportDialog).first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  /** Read the Import dialog facts: verbatim text, button labels, and whether a file input exists. */
  async readImportDialog(): Promise<{ text: string; buttons: string[]; hasFileInput: boolean }> {
    const dlg = this.page.locator(OS.ovrImportDialog).first();
    const text = (await dlg.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
    const buttons = (await dlg.locator('button').allInnerTexts().catch(() => [])).map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
    const hasFileInput = (await this.page.locator(OS.ovrImportFileInput).count()) > 0;
    return { text, buttons, hasFileInput };
  }

  /** Close the Import dialog without uploading a file (Cancel, falling back to Close). */
  async closeImportDialog(): Promise<void> {
    await this.page.locator(OS.ovrImportCancel).first().click().catch(async () => {
      await this.page.locator(OS.ovrImportClose).first().click().catch(() => { /* best-effort fallback close; the hidden-wait below confirms dismissal */ });
    });
    await this.page.locator(OS.ovrImportDialog).first().waitFor({ state: 'hidden', timeout: 6_000 }).catch(() => {});
  }

  /** Whether the Import dialog is currently visible. */
  async isImportDialogVisible(): Promise<boolean> {
    return this.isVisibleSafe(OS.ovrImportDialog);
  }

  // ---------- sorting probe + current-price read ----------

  /**
   * Click a grid column header and report whether it activates sorting: `aria-sort` before/after and
   * whether the first row's content changed. On this build header clicks are inert (no sort).
   */
  async probeColumnSort(headerLabel: string): Promise<{ ariaSortBefore: string | null; ariaSortAfter: string | null; orderChanged: boolean }> {
    const firstRowBefore = (await this.page.locator(OS.ovrGridRowAny).first().innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
    const header = this.page.locator(OS.ovrColHeaderAny, { hasText: headerLabel }).first();
    const ariaSortBefore = await header.getAttribute('aria-sort').catch(() => null);
    await header.click().catch(() => { /* best-effort: an inert header may not react (that is the behavior under test); the reads below are the oracle */ });
    await this.page.waitForTimeout(1_000);
    const ariaSortAfter = await header.getAttribute('aria-sort').catch(() => null);
    const firstRowAfter = (await this.page.locator(OS.ovrGridRowAny).first().innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
    return { ariaSortBefore, ariaSortAfter, orderChanged: firstRowBefore !== firstRowAfter };
  }

  /** Read every visible row's Current Price cell text (for the blank/missing-value guard). */
  async getCurrentPriceCells(): Promise<string[]> {
    const rows = this.page.locator(OS.ovrGridRowAny);
    const n = await rows.count();
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      out.push((await rows.nth(i).locator('td').nth(CORP_PRICING_OVERRIDE.columnIndex.currentPrice).innerText().catch(() => '')).trim());
    }
    return out;
  }
}
