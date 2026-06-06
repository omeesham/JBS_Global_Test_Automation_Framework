import { test, expect } from '../../src/fixtures/pages.fixture';
import { DETAIL } from '../../src/data/corporate-pricing/detail';

/**
 * Corporate Pricing — Pricebook Management / Pricing Detail tab, P1 (Management mode).
 * TC-LOC-CPR-201..220. Live-grounded 2026-06-05.
 *
 * Override model (live): "New Price" is a staging override → on Save it becomes the row's "Price";
 * Base Price (Price col) is read-only. Save is dialog-gated and commits ALL dirty rows in one batch.
 *
 * Mutation safety: per-test `ensureDefaultState()` restores the detailFixture (2021-PB6)
 * anchors to baseline (base Price, no discount). The dependable, reversible dirty lever is **Max
 * Discount**; a New-Price-only edit does not reliably enable Save (a known app quirk), so the
 * New-Price persist test commits the override through the proven grid-batch Save (Max-Discount lever
 * as fallback) and ensureDefaultState reverts the Price to base. No fixed waits;
 * content-anchored reads, no exact counts; save dialog handled defensively.
 */
test.describe('Corporate Pricing — Pricing Detail @corporate-pricing @detail', () => {
  // The Detail grid is heavy (~3707 draggables / ~2430 rows); a page-open is ~15-25s and the
  // save-cycle + bounded-retry restore stack several. The default 30s/test is too tight → generous
  // ceiling (this is a per-test timeout, not a fixed wait).
  test.describe.configure({ timeout: 150_000 });

  test.beforeEach(async ({ corporatePricingDetailPage: p }) => {
    // Per-test baseline: restores detailFixture anchors to base Price / no discount and
    // lands on the Pricing Detail tab.
    await p.ensureDefaultState();
  });

  // ── Load + structure ────────────────────────────────────────────────────────

  test('TC-LOC-CPR-201: Pricing Detail tab activates and the product-group grid renders', async ({ corporatePricingDetailPage: p }) => {
    expect(await p.isDetailTabActive()).toBe(true);
    expect(await p.getProductGroupRowCount()).toBeGreaterThan(0);
  });

  test('TC-LOC-CPR-202: Verify the Pricing Detail grid shows its five columns', async ({ corporatePricingDetailPage: p }) => {
    const headers = await p.getGridHeaders();
    for (const h of DETAIL.headers) expect(headers).toContain(h);
  });

  test('TC-LOC-CPR-203: The Available Product Groups source list loads', async ({ corporatePricingDetailPage: p }) => {
    expect(await p.getSourceItemCount()).toBeGreaterThan(0);
  });

  test('TC-LOC-CPR-204: The source list provides a Search (ID or Name) filter', async ({ corporatePricingDetailPage: p }) => {
    expect(await p.hasSourceFilter()).toBe(true);
  });

  test('TC-LOC-CPR-205: Pricing details load on tab activation', async ({ corporatePricingDetailPage: p }) => {
    // The anchored row's Price + override cells are present once details have loaded.
    expect(await p.getCellText(DETAIL.anchorA.name, 'price')).toBe(DETAIL.anchorA.basePrice);
  });

  // ── Read-only vs editable cells ──────────────────────────────────────────────

  test('TC-LOC-CPR-206: Base Price (Price column) is read-only', async ({ corporatePricingDetailPage: p }) => {
    expect(await p.priceIsReadOnly(DETAIL.anchorA.name)).toBe(true);
  });

  test('TC-LOC-CPR-207: New Price and Max Discount cells are editable', async ({ corporatePricingDetailPage: p }) => {
    // getNewPrice/getMaxDiscount resolve only if the editable inputs exist for the row.
    expect(typeof (await p.getNewPrice(DETAIL.anchorA.name))).toBe('string');
    expect(typeof (await p.getMaxDiscount(DETAIL.anchorA.name))).toBe('string');
  });

  // ── Management-mode defensive (no add) ───────────────────────────────────────

  test('TC-LOC-CPR-208: Single-clicking a source product group does not add a grid row', async ({ corporatePricingDetailPage: p }) => {
    const { before, after } = await p.attemptSourceAdd('single');
    expect(after).toBe(before);
  });

  test('TC-LOC-CPR-209: Double-click a source-list product group does NOT add a grid row (defensive)', async ({ corporatePricingDetailPage: p }) => {
    const { before, after } = await p.attemptSourceAdd('double');
    expect(after).toBe(before);
    expect(await p.isSaveEnabled()).toBe(false); // no dirty
  });

  test('TC-LOC-CPR-210: Drag a source-list product group onto the grid does NOT add (defensive)', async ({ corporatePricingDetailPage: p }) => {
    const { before, after } = await p.attemptDragAdd();
    expect(after).toBe(before);
  });

  test('TC-LOC-CPR-211: Existing grid rows expose no Add/Remove affordance (Management mode)', async ({ corporatePricingDetailPage: p }) => {
    expect(await p.rowHasAddRemoveAffordance(DETAIL.anchorA.name)).toBe(false);
  });

  // ── Dirty / Save ─────────────────────────────────────────────────────────────

  test('TC-LOC-CPR-212: Unmodified grid shows the clean state (Save disabled)', async ({ corporatePricingDetailPage: p }) => {
    expect(await p.isSaveEnabled()).toBe(false);
  });

  test('TC-LOC-CPR-213: Editing a Max Discount changes the state to dirty (Save enabled)', async ({ corporatePricingDetailPage: p }) => {
    expect(await p.isSaveEnabled()).toBe(false);
    await p.setMaxDiscount(DETAIL.anchorA.name, DETAIL.maxDiscountEdit.value);
    expect(await p.isSaveEnabled()).toBe(true);
    // discard without saving — reload restores baseline (next beforeEach also restores)
    await p.open();
    expect(await p.isSaveEnabled()).toBe(false);
  });

  test('TC-LOC-CPR-214: Save is dialog-gated (Save Changes confirmation)', async ({ corporatePricingDetailPage: p }) => {
    await p.setMaxDiscount(DETAIL.anchorA.name, DETAIL.maxDiscountEdit.value);
    expect(await p.isSaveEnabled()).toBe(true);
    // Click Save and assert the confirm dialog surfaces before committing.
    await p.page.locator('button:text-is("Save")').first().click();
    await expect(p.page.getByRole('alertdialog')).toBeVisible({ timeout: 5_000 });
    await expect(p.page.getByRole('alertdialog')).toContainText('Save Changes');
    await p.page.getByRole('alertdialog').getByRole('button', { name: /^(save|ok)$/i }).first().click();
    await expect(p.page.getByRole('alertdialog')).toBeHidden({ timeout: 10_000 });
    await p.ensureDefaultState(); // restore (re-opens + settles)
  });

  test('TC-LOC-CPR-215: Edit a Max Discount, Save, and the change persists across reload (with restore)', async ({ corporatePricingDetailPage: p }) => {
    const name = DETAIL.anchorA.name;
    await p.setMaxDiscount(name, DETAIL.maxDiscountEdit.value);
    expect(await p.isSaveEnabled()).toBe(true);
    await p.saveAndConfirm();
    await p.open();
    expect(await p.getMaxDiscount(name)).toContain(DETAIL.maxDiscountEdit.displayContains);
    await p.ensureDefaultState(); // restore (no cross-run drift)
  });

  test('TC-LOC-CPR-216: Save resets the state from dirty to clean after success', async ({ corporatePricingDetailPage: p }) => {
    await p.setMaxDiscount(DETAIL.anchorA.name, DETAIL.maxDiscountEdit.value);
    expect(await p.isSaveEnabled()).toBe(true); // dirty
    await p.saveAndConfirm();
    expect(await p.isSaveEnabled()).toBe(false); // clean after save
    await p.ensureDefaultState(); // restore
  });

  test('TC-LOC-CPR-217: Save commits grid override edits in one batch (with restore)', async ({ corporatePricingDetailPage: p }) => {
    await p.setMaxDiscount(DETAIL.anchorA.name, DETAIL.maxDiscountEdit.value);
    await p.setMaxDiscount(DETAIL.anchorB.name, DETAIL.maxDiscountEdit.value);
    expect(await p.isSaveEnabled()).toBe(true);
    await p.saveAndConfirm();
    await p.open();
    expect(await p.getMaxDiscount(DETAIL.anchorA.name)).toContain(DETAIL.maxDiscountEdit.displayContains);
    expect(await p.getMaxDiscount(DETAIL.anchorB.name)).toContain(DETAIL.maxDiscountEdit.displayContains);
    await p.ensureDefaultState(); // restore both
  });

  // ── New Price override ───────────────────────────────────────────

  test('TC-LOC-CPR-218: Verify a saved New Price override becomes the row Price after reload', async ({ corporatePricingDetailPage: p }) => {
    const name = DETAIL.anchorB.name;
    await p.setNewPrice(name, DETAIL.newPriceEdit.value);
    // Known app quirk: a New-Price-only edit may not enable Save. The Max-Discount lever guarantees
    // the batch commits; the New-Price value is committed with the grid. ensureDefaultState reverts both.
    if (!(await p.isSaveEnabled())) await p.setMaxDiscount(name, '1');
    await p.saveAndConfirm();
    await p.open();
    expect(await p.getCellText(name, 'price')).toBe(DETAIL.newPriceEdit.value);
    expect(await p.getNewPrice(name)).toBe(''); // staging input clears after save
    await p.ensureDefaultState(); // restore Price to base
  });

  test('TC-LOC-CPR-219: An empty New Price leaves the Base Price in effect', async ({ corporatePricingDetailPage: p }) => {
    const name = DETAIL.anchorA.name;
    // On a clean (no-override) row the New Price input is empty and the Price shows the base price.
    expect(await p.getNewPrice(name)).toBe('');
    expect(await p.getCellText(name, 'price')).toBe(DETAIL.anchorA.basePrice);
  });

  test('TC-LOC-CPR-220: Save accepts a valid currency-formatted New Price', async ({ corporatePricingDetailPage: p }) => {
    const name = DETAIL.anchorB.name;
    await p.setNewPrice(name, DETAIL.newPriceEdit.value); // "250.00" — valid two-decimal currency
    if (!(await p.isSaveEnabled())) await p.setMaxDiscount(name, '1');
    await p.saveAndConfirm(); // a valid value is accepted (no validation block)
    await p.open();
    expect(await p.getCellText(name, 'price')).toBe(DETAIL.newPriceEdit.value);
    await p.ensureDefaultState(); // restore
  });
});
