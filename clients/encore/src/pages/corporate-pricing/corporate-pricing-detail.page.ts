/**
 * Corporate Pricing — Pricing Detail tab page object.
 *
 * Extends CorporatePricingBasePage (route + tab nav + defensive save primitives). The Detail tab is
 * a heavy shadcn/Radix HTML `<table>` (~2430 product-group rows, ~3707 draggable source items,
 * 0 data-testids) → content-anchored reads by Product Group Name, NEVER exact-count assertions.
 * Verified on the live app, 2026-06-05.
 *
 * Override model (live): "New Price" is a staging override — on Save its value becomes the row's
 * "Price" column (base Price has NO input = read-only). "Max Discount" persists as "N.NN %".
 * Save is dialog-gated ("Save Changes" alertdialog) and commits ALL dirty rows in one batch.
 * Dirty lever: editing Max Discount reliably enables Save; a New-Price-only edit does NOT reliably
 * enable it (a known app quirk) though the New-Price value still commits when the grid saves.
 */
import { expect, type Locator, type Page } from '@playwright/test';
import { CorporatePricingBasePage } from './corporate-pricing.page';
import type { IConfig } from '../../types';
import { CorporatePricingSelectors as S } from '../../selectors/corporate-pricing';
import { DETAIL_GRID_COLS } from '../../selectors/corporate-pricing/pricing-detail';
import { DETAIL } from '../../data/corporate-pricing/detail';

type DetailAnchor = { id: string; name: string; basePrice: string };

export class CorporatePricingDetailPage extends CorporatePricingBasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
  }

  // ---------------------------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------------------------

  /** Open the Pricebook Details page and activate the Pricing Detail tab; wait for the grid. */
  async open(pricebookId: string = DETAIL.pricebookGuid, office: string = DETAIL.office): Promise<void> {
    await this.gotoDetails(office, pricebookId);
    await this.openDetailTab();
  }

  /** Activate the Pricing Detail tab and wait for the product-group grid to render. */
  async openDetailTab(): Promise<void> {
    await this.switchTab('Pricing Detail');
    await this.page.locator(S.colDetailProductGroupName).first().waitFor({ state: 'visible', timeout: 25_000 });
    await this.waitForAngularStable();
  }

  /** Is the Detail tab active? Content-based — the grid headers are rendered. */
  async isDetailTabActive(): Promise<boolean> {
    return this.isVisibleSafe(S.colDetailProductGroupName);
  }

  // ---------------------------------------------------------------------------
  // GRID — HEADERS + ROWS (content-anchored)
  // ---------------------------------------------------------------------------

  /** The 5 grid column headers, in DOM order. */
  async getGridHeaders(): Promise<string[]> {
    return this.readAllTexts(`${S.tblDetailGrid} th`);
  }

  /** Count of product-group DATA rows (rows that carry editable inputs). Behavioural, not asserted exact. */
  async getProductGroupRowCount(): Promise<number> {
    return this.page.locator(`${S.tblDetailGrid} tr:has(input)`).count();
  }

  /** A grid row located by its (unique) Product Group Name. */
  private gridRow(name: string): Locator {
    return this.page.locator(`${S.tblDetailGrid} tr`, { hasText: name }).first();
  }

  /** Read the read-only text of a column cell for an anchored row (e.g. 'price', 'id'). */
  async getCellText(name: string, col: keyof typeof DETAIL_GRID_COLS): Promise<string> {
    const cell = this.gridRow(name).locator('td').nth(DETAIL_GRID_COLS[col]);
    return (await cell.innerText()).replace(/\s+/g, ' ').trim();
  }

  /** The New Price `<input>` for an anchored row (column 3). */
  private newPriceInput(name: string): Locator {
    return this.gridRow(name).locator('td').nth(DETAIL_GRID_COLS.newPrice).locator('input').first();
  }

  /** The Max Discount `<input>` for an anchored row (column 4). */
  private maxDiscountInput(name: string): Locator {
    return this.gridRow(name).locator('td').nth(DETAIL_GRID_COLS.maxDiscount).locator('input').first();
  }

  /** Current New Price input value for the row anchored by Product Group Name. */
  async getNewPrice(name: string): Promise<string> {
    return (await this.newPriceInput(name).inputValue()).trim();
  }

  /** Current Max Discount input value for the row anchored by Product Group Name. */
  async getMaxDiscount(name: string): Promise<string> {
    return (await this.maxDiscountInput(name).inputValue()).trim();
  }

  /**
   * The Price (Base Price) cell is read-only when it contains NO `<input>`.
   * Live: the cell is plain `<td>` text.
   */
  async priceIsReadOnly(name: string): Promise<boolean> {
    const cell = this.gridRow(name).locator('td').nth(DETAIL_GRID_COLS.price);
    return (await cell.locator('input').count()) === 0;
  }

  /** Whether an existing grid row exposes any Add/Remove affordance (Management mode → expected none). */
  async rowHasAddRemoveAffordance(name: string): Promise<boolean> {
    return (await this.gridRow(name).locator('button').count()) > 0;
  }

  // ---------------------------------------------------------------------------
  // CELL EDITS (real keystrokes — fill() is unreliable for dirty-tracking)
  // ---------------------------------------------------------------------------

  /** Type a New Price override into an anchored row (real keystrokes). */
  async setNewPrice(name: string, value: string): Promise<void> {
    const inp = this.newPriceInput(name);
    await inp.scrollIntoViewIfNeeded();
    await inp.click();
    await inp.press('Control+a');
    await inp.press('Delete');
    await inp.pressSequentially(value, { delay: 50 });
    await inp.press('Tab');
  }

  /** Type a Max Discount into an anchored row (real keystrokes — the dependable dirty lever). */
  async setMaxDiscount(name: string, value: string): Promise<void> {
    const inp = this.maxDiscountInput(name);
    await inp.scrollIntoViewIfNeeded();
    await inp.click();
    await inp.press('Control+a');
    await inp.press('Delete');
    await inp.pressSequentially(value, { delay: 50 });
    await inp.press('Tab');
  }

  // ---------------------------------------------------------------------------
  // SOURCE LIST (Available Product Groups, left side)
  // ---------------------------------------------------------------------------

  /** Count of draggable source-list product groups (behavioural `> 0`, not exact). */
  async getSourceItemCount(): Promise<number> {
    return this.page.locator(S.itemDraggableAny).count();
  }

  /** Is the source-list "Search ID or Name..." filter present? */
  async hasSourceFilter(): Promise<boolean> {
    return (await this.page.locator(S.txtSourceFilter).count()) > 0;
  }

  /**
   * Management-mode defensive probe: act on a source-list item and report whether the grid grew.
   * `mode` 'single' = single-click (select/display, no add), 'double' = double-click (must NOT add).
   * Returns { before, after } data-row counts so the caller asserts no-add (before === after).
   */
  async attemptSourceAdd(mode: 'single' | 'double', index = 0): Promise<{ before: number; after: number }> {
    const before = await this.getProductGroupRowCount();
    const item = this.page.locator(S.itemDraggableAny).nth(index);
    await item.scrollIntoViewIfNeeded();
    if (mode === 'double') await item.dblclick();
    else await item.click();
    await this.waitForAngularStable(2_000).catch(() => { /* best-effort settle */ });
    const after = await this.getProductGroupRowCount();
    return { before, after };
  }

  /**
   * Management-mode defensive probe: attempt a drag of a source item onto the grid; report grid growth.
   * Drag is implemented via Playwright's `dragTo` (HTML5 dnd). Returns { before, after } row counts.
   */
  async attemptDragAdd(index = 0): Promise<{ before: number; after: number }> {
    const before = await this.getProductGroupRowCount();
    const item = this.page.locator(S.itemDraggableAny).nth(index);
    await item.scrollIntoViewIfNeeded();
    await item.dragTo(this.page.locator(S.tblDetailGrid).first()).catch(() => { /* drop may be rejected — that is the point */ });
    await this.waitForAngularStable(2_000).catch(() => { /* best-effort */ });
    const after = await this.getProductGroupRowCount();
    return { before, after };
  }

  // ---------------------------------------------------------------------------
  // DIRTY / SAVE (reuses the shared dialog-gated Save)
  // ---------------------------------------------------------------------------

  /**
   * Click Save (defensive — confirm the "Save Changes" alertdialog), then best-effort wait for
   * Save to disable (commit signal). THROWS if Save is disabled at call time so a silent no-op
   * surfaces as a failure (save-success ≠ pristine; reload + re-read is load-bearing).
   */
  async saveAndConfirm(): Promise<void> {
    await this.clickSaveButtonOrThrow('grid not dirty');
    await this.confirmSaveDialogIfPresent(3_000);
    await expect(this.page.locator(S.btnSaveDetails).first())
      .toBeDisabled({ timeout: 15_000 })
      .catch(() => { /* app may leave it enabled; reload+re-read is the load-bearing check */ });
    await this.waitForAngularStable();
  }

  // ---------------------------------------------------------------------------
  // BASELINE RESTORE — handles the sticky New-Price override
  // ---------------------------------------------------------------------------

  /**
   * Restore the detailFixture's two mutation anchors to baseline: anchorA/anchorB Price = base, no
   * discount. The New-Price override is sticky (it becomes the Price), so reverting requires writing
   * New Price = basePrice; the form is dirtied reliably via the Max-Discount lever (= '0') in the
   * SAME batch save, which also commits the New-Price reverts. Bounded retry (max 3) over the whole
   * cycle because save-success alone does not prove the restore landed.
   */
  async ensureDefaultState(
    anchors: DetailAnchor[] = [DETAIL.anchorA, DETAIL.anchorB],
  ): Promise<void> {
    const maxAttempts = 3;
    const isClean = async (a: DetailAnchor): Promise<boolean> => {
      const price = await this.getCellText(a.name, 'price');
      const md = await this.getMaxDiscount(a.name);
      return price === a.basePrice && /^0(\.0+)?\s*%?$/.test(md.replace(/\s/g, ''));
    };

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await this.open(); // single heavy page-open per attempt
      const dirtyAnchors: DetailAnchor[] = [];
      for (const a of anchors) {
        if (!(await isClean(a))) dirtyAnchors.push(a);
      }
      if (dirtyAnchors.length === 0) return; // already clean

      for (const a of dirtyAnchors) {
        await this.setNewPrice(a.name, a.basePrice); // revert override to base
        await this.setMaxDiscount(a.name, '0'); // reliable dirty lever + no-discount
      }
      await this.saveAndConfirm();

      // Verify IN-PLACE — after Save the grid re-renders the persisted state (avoids a 2nd heavy open).
      let stillDirty = false;
      for (const a of anchors) {
        if (!(await isClean(a))) { stillDirty = true; break; }
      }
      if (!stillDirty) return;
    }
    throw new Error(
      `ensureDefaultState: detailFixture anchors not restored to baseline after ${maxAttempts} attempts — manual cleanup of pricebook 2021-PB6 may be required.`,
    );
  }
}
