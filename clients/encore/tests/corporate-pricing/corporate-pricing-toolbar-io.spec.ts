/**
 * Corporate Pricing — Search toolbar I/O baseline (NM-1604 / NM-1625 / NM-1446).
 * TC-CPR-TIO-001..017. Live-grounded 2026-06-09 (office 1604).
 *
 * Covers the Search-page toolbar surface at trigger + variant level:
 * - Export ▾ menu: opens, lists all 4 variants, and each variant opens the shared
 *   Year(s)+Currency dialog before its export endpoint fires; menu dismisses on outside-click.
 * - Import ▾ menu: opens, lists all 4 variants, each opens its titled in-app upload dialog
 *   (not a native OS chooser); no network fires on trigger.
 * - Loc Pricing Export / Loc Pricing Import triggers (endpoint + dialog level).
 * - Grid Options: lists every grid column (all on by default); toggling one off removes its
 *   header and the hidden state persists across reload.
 *
 * The real file round-trips live in their own sibling specs: corporate-pricing-loc-export
 * (download-file verification), corporate-pricing-export-all (the Export dialog contract), and
 * corporate-pricing-loc-import (the Loc Pricing Import upload).
 */
import { test, expect } from '../../src/fixtures/pages.fixture';
import { CORP_PRICING_TOOLBAR_IO } from '../../src/data/corporate-pricing/toolbar-io';
const VARIANTS = CORP_PRICING_TOOLBAR_IO.variants;
const IMP = CORP_PRICING_TOOLBAR_IO.importDialog;
const EXP = CORP_PRICING_TOOLBAR_IO.exportDialog;
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Corporate Pricing — toolbar I/O: Export ▾ @corporate-pricing @toolbar-io', () => {
  test.beforeEach(async ({ corporatePricingSearchPage: p }) => {
    test.setTimeout(60_000);
    await p.open(); // baseline: fresh search-grid load per test
  });

  test('TC-CPR-TIO-001: Export ▾ opens and lists all 4 export variants', async ({ corporatePricingSearchPage: p }) => {
    await p.openExportMenu();
    const variants = await p.getMenuVariants();
    for (const v of VARIANTS) expect(variants).toContain(v.label);
  });

  // The four Export variants now gate behind a Year(s)+Currency dialog; only Continue fires the export.
  test('TC-CPR-TIO-002: Export "All Equipment Pricing" — dialog gate then equipment-pricing endpoint', async ({ corporatePricingSearchPage: p }) => {
    await p.openExportVariantDialog('All Equipment Pricing');
    expect(await p.isExportContinueEnabled()).toBe(false); // gated until Year(s) + Currency are set
    await p.setExportYears([EXP.defaultYear]);
    await p.setExportCurrency('USD');
    const { url, status } = await p.continueExportAndCaptureRequest();
    expect(url).toContain('isLabor=false');
    expect(url).toContain('isMaxDiscount=false');
    expect(url).toContain(CORP_PRICING_TOOLBAR_IO.exportLocaleParam);
    expect(status).toBe(200);
  });

  test('TC-CPR-TIO-003: Export "All Labor Pricing" — dialog gate then labor-pricing endpoint', async ({ corporatePricingSearchPage: p }) => {
    await p.openExportVariantDialog('All Labor Pricing');
    await p.setExportYears([EXP.defaultYear]);
    await p.setExportCurrency('USD');
    const { url, status } = await p.continueExportAndCaptureRequest();
    expect(url).toContain('isLabor=true');
    expect(url).toContain('isMaxDiscount=false');
    expect(url).toContain(CORP_PRICING_TOOLBAR_IO.exportLocaleParam);
    expect(status).toBe(200);
  });

  test('TC-CPR-TIO-004: Export "All Equipment Max Discount" — dialog gate then equipment-max-discount endpoint', async ({ corporatePricingSearchPage: p }) => {
    await p.openExportVariantDialog('All Equipment Max Discount');
    await p.setExportYears([EXP.defaultYear]);
    await p.setExportCurrency('USD');
    const { url, status } = await p.continueExportAndCaptureRequest();
    expect(url).toContain('isLabor=false');
    expect(url).toContain('isMaxDiscount=true');
    expect(url).toContain(CORP_PRICING_TOOLBAR_IO.exportLocaleParam);
    expect(status).toBe(200);
  });

  test('TC-CPR-TIO-005: Export "All Labor Max Discount" — dialog gate then labor-max-discount endpoint', async ({ corporatePricingSearchPage: p }) => {
    await p.openExportVariantDialog('All Labor Max Discount');
    await p.setExportYears([EXP.defaultYear]);
    await p.setExportCurrency('USD');
    const { url, status } = await p.continueExportAndCaptureRequest();
    expect(url).toContain('isLabor=true');
    expect(url).toContain('isMaxDiscount=true');
    expect(url).toContain(CORP_PRICING_TOOLBAR_IO.exportLocaleParam);
    expect(status).toBe(200);
  });

  test('TC-CPR-TIO-006: Export ▾ menu dismisses on outside-click', async ({ corporatePricingSearchPage: p }) => {
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

  test('TC-CPR-TIO-007: Import ▾ opens and lists all 4 import variants', async ({ corporatePricingSearchPage: p }) => {
    await p.openImportMenu();
    const variants = await p.getMenuVariants();
    for (const v of VARIANTS) expect(variants).toContain(v.label);
  });

  test('TC-CPR-TIO-008: Import "All Equipment Pricing" opens its titled upload dialog (no native file chooser)', async ({ corporatePricingSearchPage: p }) => {
    await p.openImportVariantDialog('All Equipment Pricing');
    const info = await p.getImportDialogInfo();
    expect(info.text).toContain(`${IMP.titlePrefix}All Equipment Pricing`);
    expect(info.text).toContain(IMP.prompt);
    expect(info.buttons).toEqual(expect.arrayContaining(['Browse', 'Upload']));
    expect(info.hasFileInput).toBe(true); // dialog carries a file input — upload itself is a later edge-case test phase
    await p.closeImportDialog();
  });

  test('TC-CPR-TIO-009: Import "All Labor Pricing" opens its titled upload dialog', async ({ corporatePricingSearchPage: p }) => {
    await p.openImportVariantDialog('All Labor Pricing');
    const info = await p.getImportDialogInfo();
    expect(info.text).toContain(`${IMP.titlePrefix}All Labor Pricing`);
    expect(info.hasFileInput).toBe(true);
    await p.closeImportDialog();
  });

  test('TC-CPR-TIO-010: Import "All Equipment Max Discount" opens its titled upload dialog', async ({ corporatePricingSearchPage: p }) => {
    await p.openImportVariantDialog('All Equipment Max Discount');
    const info = await p.getImportDialogInfo();
    expect(info.text).toContain(`${IMP.titlePrefix}All Equipment Max Discount`);
    expect(info.hasFileInput).toBe(true);
    await p.closeImportDialog();
  });

  test('TC-CPR-TIO-011: Import "All Labor Max Discount" opens its titled upload dialog', async ({ corporatePricingSearchPage: p }) => {
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

  test('TC-CPR-TIO-012: Loc Pricing Export fires the location-export endpoint', async ({ corporatePricingSearchPage: p }) => {
    const url = await p.clickLocPricingExportAndCaptureUrl();
    expect(url).toContain('/navigator/api/location/pricing/location-export');
    expect(url).toContain(CORP_PRICING_TOOLBAR_IO.exportLocaleParam);
  });

  test('TC-CPR-TIO-013: Loc Pricing Import opens the "Import All Location Pricing" dialog', async ({ corporatePricingSearchPage: p }) => {
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
    await p.ensureAllGridColumnsVisible(); // baseline: all columns visible (also self-navigates fresh)
  });

  // Column visibility is a server-persisted user preference — always restore to all-visible.
  test.afterEach(async ({ corporatePricingSearchPage: p }) => {
    test.setTimeout(90_000);
    await p.ensureAllGridColumnsVisible();
  });

  test('TC-CPR-TIO-014: Grid Options opens and lists every grid column, all enabled by default', async ({ corporatePricingSearchPage: p }) => {
    await p.openGridOptions();
    const cols = await p.getGridOptionColumns();
    const labels = cols.map((c) => c.label);
    for (const expected of CORP_PRICING_TOOLBAR_IO.gridColumns) expect(labels).toContain(expected);
    expect(cols.every((c) => c.checked)).toBe(true); // all columns shown by default
    await p.closeGridOptions();
  });

  test('TC-CPR-TIO-015: Toggling a column OFF removes its header from the grid', async ({ corporatePricingSearchPage: p }) => {
    expect(await p.isGridColumnVisible(COL)).toBe(true); // present at baseline
    await p.openGridOptions();
    await p.toggleGridColumn(COL);
    await p.closeGridOptions();
    expect(await p.isGridColumnVisible(COL)).toBe(false); // header removed
  });

  test('TC-CPR-TIO-016: A hidden column stays hidden after a page reload (persists)', async ({ corporatePricingSearchPage: p }) => {
    await p.openGridOptions();
    await p.toggleGridColumn(COL);
    await p.closeGridOptions();
    expect(await p.isGridColumnVisible(COL)).toBe(false);
    await p.open(); // reload + re-navigate
    expect(await p.isGridColumnVisible(COL)).toBe(false); // preference persisted server-side
  });

  test('TC-CPR-TIO-017: Toggling a hidden column back ON restores its header', async ({ corporatePricingSearchPage: p }) => {
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
