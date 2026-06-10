import { test, expect } from '../../src/fixtures/pages.fixture';
import { CORP_PRICING_TOOLBAR_IO } from '../../src/data/corporate-pricing/toolbar-io';

/**
 * Corporate Pricing — Search toolbar I/O, trigger-level FCC (Wave-1.5-B, NM-1604/1625/1446).
 * TC-LOC-CPR-601..617. Live-grounded 2026-06-09 (office 1604, `playwright-cli -s=cpr-toolbar-fcc`;
 * findings in `test-cases/setup/corporate-pricing/corporate_pricing_toolbar_io_test_cases.md`).
 *
 * SCOPE: trigger + variant enumeration ONLY — the dropdown opens, all 4 variants are present, each
 * fires the correct endpoint (Export ▾ / Loc Pricing Export) or opens the correct dialog (Import ▾ /
 * Loc Pricing Import), and Grid Options column toggle persists on reload. The real download/upload
 * round-trip (file content, import validation/error/success) is DEFERRED to a later edge-case test phase.
 *
 * Q-WV15-2 (live answer): Export ▾ fires `GET /navigator/api/location/pricing/pricing-export` with
 * `isLabor` + `isMaxDiscount` query params mapping 1:1 to the 4 variants, plus `locale=en-US` (NM-1604
 * "4 variants + locale" CONFIRMED-LIVE). Import ▾ opens a custom in-app upload dialog (NOT a native OS
 * file chooser) — no network fires on trigger. Endpoint assertions filter the backend API path, never
 * the page URL (LR-056). Read-only: exports download (auto-discarded), imports are cancelled uncommitted.
 */

const VARIANTS = CORP_PRICING_TOOLBAR_IO.variants;
const IMP = CORP_PRICING_TOOLBAR_IO.importDialog;

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Corporate Pricing — toolbar I/O: Export ▾ @corporate-pricing @toolbar-io', () => {
  test.beforeEach(async ({ corporatePricingSearchPage: p }) => {
    test.setTimeout(60_000);
    await p.open(); // LR-019 baseline: fresh search-grid load per test
  });

  test('TC-LOC-CPR-601: Export ▾ opens and lists all 4 export variants', async ({ corporatePricingSearchPage: p }) => {
    await p.openExportMenu();
    const variants = await p.getMenuVariants();
    for (const v of VARIANTS) expect(variants).toContain(v.label);
  });

  test('TC-LOC-CPR-602: Export "All Equipment Pricing" fires the equipment-pricing export endpoint', async ({ corporatePricingSearchPage: p }) => {
    const url = await p.clickExportVariantAndCaptureUrl('All Equipment Pricing');
    expect(url).toContain('isLabor=false');
    expect(url).toContain('isMaxDiscount=false');
    expect(url).toContain(CORP_PRICING_TOOLBAR_IO.exportLocaleParam);
  });

  test('TC-LOC-CPR-603: Export "All Labor Pricing" fires the labor-pricing export endpoint', async ({ corporatePricingSearchPage: p }) => {
    const url = await p.clickExportVariantAndCaptureUrl('All Labor Pricing');
    expect(url).toContain('isLabor=true');
    expect(url).toContain('isMaxDiscount=false');
    expect(url).toContain(CORP_PRICING_TOOLBAR_IO.exportLocaleParam);
  });

  test('TC-LOC-CPR-604: Export "All Equipment Max Discount" fires the equipment-max-discount export endpoint', async ({ corporatePricingSearchPage: p }) => {
    const url = await p.clickExportVariantAndCaptureUrl('All Equipment Max Discount');
    expect(url).toContain('isLabor=false');
    expect(url).toContain('isMaxDiscount=true');
    expect(url).toContain(CORP_PRICING_TOOLBAR_IO.exportLocaleParam);
  });

  test('TC-LOC-CPR-605: Export "All Labor Max Discount" fires the labor-max-discount export endpoint', async ({ corporatePricingSearchPage: p }) => {
    const url = await p.clickExportVariantAndCaptureUrl('All Labor Max Discount');
    expect(url).toContain('isLabor=true');
    expect(url).toContain('isMaxDiscount=true');
    expect(url).toContain(CORP_PRICING_TOOLBAR_IO.exportLocaleParam);
  });

  test('TC-LOC-CPR-606: Export ▾ menu dismisses on outside-click', async ({ corporatePricingSearchPage: p }) => {
    await p.openExportMenu();
    expect((await p.getMenuVariants()).length).toBeGreaterThan(0); // menu confirmed open
    expect(await p.dismissToolbarMenuWithOutsideClick()).toBe(true); // closes on outside-click
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Corporate Pricing — toolbar I/O: Import ▾ @corporate-pricing @toolbar-io', () => {
  test.beforeEach(async ({ corporatePricingSearchPage: p }) => {
    test.setTimeout(60_000);
    await p.open();
  });

  test('TC-LOC-CPR-607: Import ▾ opens and lists all 4 import variants', async ({ corporatePricingSearchPage: p }) => {
    await p.openImportMenu();
    const variants = await p.getMenuVariants();
    for (const v of VARIANTS) expect(variants).toContain(v.label);
  });

  test('TC-LOC-CPR-608: Import "All Equipment Pricing" opens its titled upload dialog (no native file chooser)', async ({ corporatePricingSearchPage: p }) => {
    await p.openImportVariantDialog('All Equipment Pricing');
    const info = await p.getImportDialogInfo();
    expect(info.text).toContain(`${IMP.titlePrefix}All Equipment Pricing`);
    expect(info.text).toContain(IMP.prompt);
    expect(info.buttons).toEqual(expect.arrayContaining(['Browse', 'Upload']));
    expect(info.hasFileInput).toBe(true); // dialog carries a file input — upload itself is EDGE_P3
    await p.closeImportDialog();
  });

  test('TC-LOC-CPR-609: Import "All Labor Pricing" opens its titled upload dialog', async ({ corporatePricingSearchPage: p }) => {
    await p.openImportVariantDialog('All Labor Pricing');
    const info = await p.getImportDialogInfo();
    expect(info.text).toContain(`${IMP.titlePrefix}All Labor Pricing`);
    expect(info.hasFileInput).toBe(true);
    await p.closeImportDialog();
  });

  test('TC-LOC-CPR-610: Import "All Equipment Max Discount" opens its titled upload dialog', async ({ corporatePricingSearchPage: p }) => {
    await p.openImportVariantDialog('All Equipment Max Discount');
    const info = await p.getImportDialogInfo();
    expect(info.text).toContain(`${IMP.titlePrefix}All Equipment Max Discount`);
    expect(info.hasFileInput).toBe(true);
    await p.closeImportDialog();
  });

  test('TC-LOC-CPR-611: Import "All Labor Max Discount" opens its titled upload dialog', async ({ corporatePricingSearchPage: p }) => {
    await p.openImportVariantDialog('All Labor Max Discount');
    const info = await p.getImportDialogInfo();
    expect(info.text).toContain(`${IMP.titlePrefix}All Labor Max Discount`);
    expect(info.buttons).toEqual(expect.arrayContaining(['Browse', 'Upload', 'Cancel', 'Close']));
    expect(info.hasFileInput).toBe(true);
    await p.closeImportDialog();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Corporate Pricing — toolbar I/O: Loc Pricing Export / Import @corporate-pricing @toolbar-io', () => {
  test.beforeEach(async ({ corporatePricingSearchPage: p }) => {
    test.setTimeout(60_000);
    await p.open();
  });

  test('TC-LOC-CPR-612: Loc Pricing Export fires the location-export endpoint', async ({ corporatePricingSearchPage: p }) => {
    const url = await p.clickLocPricingExportAndCaptureUrl();
    expect(url).toContain('/navigator/api/location/pricing/location-export');
    expect(url).toContain(CORP_PRICING_TOOLBAR_IO.exportLocaleParam);
  });

  test('TC-LOC-CPR-613: Loc Pricing Import opens the "Import All Location Pricing" dialog', async ({ corporatePricingSearchPage: p }) => {
    await p.openLocPricingImportDialog();
    const info = await p.getImportDialogInfo();
    expect(info.text).toContain(CORP_PRICING_TOOLBAR_IO.locPricingImportDialogTitle);
    expect(info.buttons).toEqual(expect.arrayContaining(['Browse', 'Upload']));
    expect(info.hasFileInput).toBe(true);
    await p.closeImportDialog();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Corporate Pricing — toolbar I/O: Grid Options @corporate-pricing @toolbar-io @mutation', () => {
  const COL = CORP_PRICING_TOOLBAR_IO.toggleColumn; // 'Price Year' — non-first, reversible

  test.beforeEach(async ({ corporatePricingSearchPage: p }) => {
    test.setTimeout(90_000);
    await p.ensureAllGridColumnsVisible(); // LR-019 baseline: all columns visible (also self-navigates fresh)
  });

  // Column visibility is a server-persisted user preference — always restore to all-visible.
  test.afterEach(async ({ corporatePricingSearchPage: p }) => {
    test.setTimeout(90_000);
    await p.ensureAllGridColumnsVisible();
  });

  test('TC-LOC-CPR-614: Grid Options opens and lists every grid column, all enabled by default', async ({ corporatePricingSearchPage: p }) => {
    await p.openGridOptions();
    const cols = await p.getGridOptionColumns();
    const labels = cols.map((c) => c.label);
    for (const expected of CORP_PRICING_TOOLBAR_IO.gridColumns) expect(labels).toContain(expected);
    expect(cols.every((c) => c.checked)).toBe(true); // all columns shown by default
    await p.closeGridOptions();
  });

  test('TC-LOC-CPR-615: Toggling a column OFF removes its header from the grid', async ({ corporatePricingSearchPage: p }) => {
    expect(await p.isGridColumnVisible(COL)).toBe(true); // present at baseline
    await p.openGridOptions();
    await p.toggleGridColumn(COL);
    await p.closeGridOptions();
    expect(await p.isGridColumnVisible(COL)).toBe(false); // header removed
  });

  test('TC-LOC-CPR-616: A hidden column stays hidden after a page reload (persists)', async ({ corporatePricingSearchPage: p }) => {
    await p.openGridOptions();
    await p.toggleGridColumn(COL);
    await p.closeGridOptions();
    expect(await p.isGridColumnVisible(COL)).toBe(false);
    await p.open(); // reload + re-navigate
    expect(await p.isGridColumnVisible(COL)).toBe(false); // preference persisted server-side
  });

  test('TC-LOC-CPR-617: Toggling a hidden column back ON restores its header', async ({ corporatePricingSearchPage: p }) => {
    await p.openGridOptions();
    await p.toggleGridColumn(COL); // hide
    await p.closeGridOptions();
    expect(await p.isGridColumnVisible(COL)).toBe(false);
    await p.openGridOptions();
    await p.toggleGridColumn(COL); // show again
    await p.closeGridOptions();
    expect(await p.isGridColumnVisible(COL)).toBe(true); // restored
  });
});
