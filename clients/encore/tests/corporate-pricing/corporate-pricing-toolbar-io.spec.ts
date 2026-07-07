import { resolve } from 'node:path';
import { test, expect } from '../../src/fixtures/pages.fixture';
import { CORP_PRICING_TOOLBAR_IO, CORP_PRICING_LOC_IMPORT_API } from '../../src/data/corporate-pricing/toolbar-io';

/**
 * Corporate Pricing — Search toolbar I/O (NM-1604/1625/1446 + NM-2262 + NM-2264 + NM-2305).
 * TC-CPR-TIO-001..051. Live-grounded 2026-06-09 (office 1604); TC-018..024 add the real Loc Pricing
 * Export download round-trip (NM-2262, 2026-07-06); TC-025..040 add the Export ▾ Year(s)+Currency
 * dialog contract + the real per-variant download round-trip (NM-2264, 2026-07-07); TC-041..051 add the
 * real Loc Pricing Import upload round-trip that mutates a throwaway office (NM-2305, 2026-07-07).
 *
 * SCOPE:
 * - Export ▾ (NM-2264): each variant opens a shared Year(s)(1-3)+Currency dialog (Continue disabled
 *   until both set); on Continue the export fires `GET pricing-export?isLabor&isMaxDiscount&currencyId&
 *   locale&years` [200] and downloads a wide product-group x pricebook matrix CSV. Covered: the dialog
 *   behavior, the 1-3 year cap, the currencyId map (USD=1/CAD=2/MXN=3), the real per-variant download,
 *   and the export file-content regressions (duplicate product groups; missing pricebooks / stray labor
 *   rows on the max-discount export). Endpoint assertions filter the backend API path, never the page URL.
 * - Import ▾ (trigger-level): opens a custom in-app upload dialog (NOT a native OS chooser) — no network
 *   on trigger; the grid-scoped Import ▾ real upload round-trip is owned by a separate ticket (NM-2265).
 * - Loc Pricing Import (NM-2305): the REAL upload round-trip in the "@mutation" describe below — it
 *   uploads a CSV the server applies per (location, currency), bounded to throwaway office 5897.
 * - Loc Pricing Export + Grid Options: as before (TC-012..024).
 *
 * Mutation safety: the Export tests only download (auto-discarded to a browser temp dir); the Loc Pricing
 * Import tests mutate office 5897 only and reset it to a known baseline before and after every test.
 */

const VARIANTS = CORP_PRICING_TOOLBAR_IO.variants;
const IMP = CORP_PRICING_TOOLBAR_IO.importDialog;
const EXP = CORP_PRICING_TOOLBAR_IO.exportDialog;
const CUR = CORP_PRICING_TOOLBAR_IO.currencies;

/**
 * Assert a downloaded export matrix is structurally well-formed, not merely present. The row directly
 * after the header is the currency row — its two base columns are blank and every pricebook column
 * carries the export's chosen currency; and every product-group row is exactly as wide as the header.
 * Without this, a ragged CSV or one whose currency row carries the wrong code would still pass a test
 * that only checked the base columns and the row count.
 */
function expectWellFormedExportMatrix(
  r: { headers: string[]; rows: string[][] },
  currencyCode: string,
): void {
  const baseCols = CORP_PRICING_TOOLBAR_IO.exportBaseColumns.length;
  expect(r.rows.length).toBeGreaterThan(0); // at least the currency row is present
  const currencyRow = r.rows[0]!;
  expect(currencyRow).toHaveLength(r.headers.length); // the currency row is exactly as wide as the header
  expect(currencyRow.slice(0, baseCols).map((c) => c.trim()))
    .toEqual(new Array(baseCols).fill('')); // the base columns are blank on the currency row
  const pricebookCurrencies = currencyRow.slice(baseCols).map((c) => c.trim());
  expect(pricebookCurrencies)
    .toEqual(new Array(pricebookCurrencies.length).fill(currencyCode)); // every pricebook column carries the chosen currency
  for (const row of r.rows.slice(1)) {
    expect(row).toHaveLength(r.headers.length); // no ragged / malformed product-group row
  }
}

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

// ─────────────────────────────────────────────────────────────────────────────
// Loc Pricing Export — REAL file download round-trip + downloaded-file verification (NM-2262).
//
// TC-CPR-TIO-012 (above) asserts only that the export request fires and returns 200 — it never captures
// a file. This block captures the REAL downloaded CSV and verifies the FILE itself: filename pattern,
// non-empty/parseable, header columns, data rows, and that the download's own request carried the locale.
// The exported file is the oracle (Loc Pricing Export is a location-scoped CSV, a different dataset from
// the on-screen strategy grid — so the file's own structure/content is asserted, not a grid row-for-row diff).
const LOC = CORP_PRICING_TOOLBAR_IO.locExport;

test.describe('Corporate Pricing — Loc Pricing Export file round-trip (NM-2262) @corporate-pricing @toolbar-io', () => {
  test.beforeEach(async ({ corporatePricingSearchPage: p }) => {
    test.setTimeout(60_000); // fresh grid load + network round-trip + read from the temp download path
    await p.open(); // per-test baseline: fresh search-grid load, no reliance on prior-test state
  });

  // TC-CPR-TIO-018
  test('TC-CPR-TIO-018: Loc Pricing Export downloads a real CSV file with the expected timestamped filename', async ({ corporatePricingSearchPage: p }) => {
    const r = await p.downloadLocPricingExport();
    expect(r.filename).toMatch(LOC.filenamePattern); // LocationPricebooks_<YYYYMMDD>_<HHMMSS>UTC.csv
  });

  // TC-CPR-TIO-019
  test('TC-CPR-TIO-019: Downloaded Loc Pricing Export file is non-empty and parseable as CSV', async ({ corporatePricingSearchPage: p }) => {
    const r = await p.downloadLocPricingExport();
    expect(r.content.length).toBeGreaterThan(0);
    expect(r.content).toContain(','); // the file is actually comma-delimited, not a single garbage token
    expect(r.headers.length).toBeGreaterThan(0); // a header row parsed out
  });

  // TC-CPR-TIO-020
  test('TC-CPR-TIO-020: Downloaded CSV carries the expected header columns and at least one data row', async ({ corporatePricingSearchPage: p }) => {
    const r = await p.downloadLocPricingExport();
    expect(r.headers).toEqual(LOC.expectedHeaders); // exact column set + order (the file is the oracle)
    expect(r.rowCount).toBeGreaterThan(0); // location pricebook data is present
  });

  // TC-CPR-TIO-021
  test('TC-CPR-TIO-021: The Loc Pricing Export download request carries the locale param', async ({ corporatePricingSearchPage: p }) => {
    const r = await p.downloadLocPricingExport();
    expect(r.requestUrl).toContain('location-export');
    expect(r.requestUrl).toContain(CORP_PRICING_TOOLBAR_IO.exportLocaleParam); // locale=en-US on the download's own request
  });

  // TC-CPR-TIO-022
  test('TC-CPR-TIO-022: A second consecutive Loc Pricing Export fires a fresh download', async ({ corporatePricingSearchPage: p }) => {
    const r1 = await p.downloadLocPricingExport();
    const r2 = await p.downloadLocPricingExport(); // no re-open between: proves a fresh download on re-click
    expect(r1.filename).toMatch(LOC.filenamePattern);
    expect(r2.filename).toMatch(LOC.filenamePattern);
    expect(r2.content.length).toBeGreaterThan(0);
  });

  // TC-CPR-TIO-023
  test('TC-CPR-TIO-023: Every downloaded CSV row is well-formed with a valid currency, 0/1 flags, and a consistent date-window', async ({ corporatePricingSearchPage: p }) => {
    const r = await p.downloadLocPricingExport();
    const locationIdx = r.headers.indexOf('LocationNo');
    const currencyIdx = r.headers.indexOf(LOC.currencyColumn);
    const boolIdxs = LOC.booleanColumns.map((c) => r.headers.indexOf(c));
    const useDateIdx = r.headers.indexOf(LOC.useDateColumn);
    const dateWindowIdxs = LOC.dateWindowColumns.map((c) => r.headers.indexOf(c)); // [StartDate, EndDate]
    const validCurrencies: readonly string[] = LOC.validCurrencies; // widen the const tuple so .includes accepts any string
    expect(locationIdx).toBeGreaterThanOrEqual(0);
    expect(currencyIdx).toBeGreaterThanOrEqual(0);
    expect(boolIdxs).not.toContain(-1); // all format-checked columns present in the header row
    expect(useDateIdx).toBeGreaterThanOrEqual(0);
    expect(dateWindowIdxs).not.toContain(-1);
    expect(r.rows.length).toBeGreaterThan(0);
    // Validate EVERY row in plain JS (a per-row expect() over ~38k rows is too slow), then assert the
    // aggregate: a malformed row anywhere in the file collects here and fails with the first offenders shown.
    const offenders: string[] = [];
    for (const [i, row] of r.rows.entries()) {
      if (offenders.length >= 10) break; // enough detail to diagnose; the assertion still fails on the first offender
      if (row.length !== r.headers.length) { offenders.push(`row ${i}: ${row.length} cols (expected ${r.headers.length})`); continue; }
      if (!/^\d+$/.test(row[locationIdx] ?? '')) { offenders.push(`row ${i}: LocationNo "${row[locationIdx] ?? ''}"`); continue; }
      if (!validCurrencies.includes(row[currencyIdx] ?? '')) { offenders.push(`row ${i}: currency "${row[currencyIdx] ?? ''}"`); continue; }
      const badFlag = boolIdxs.find((bi) => { const v = row[bi]; return v !== '0' && v !== '1'; });
      if (badFlag !== undefined) { offenders.push(`row ${i}: flag col ${badFlag} = "${row[badFlag] ?? ''}"`); continue; }
      const useDate = row[useDateIdx] ?? '';
      if (useDate !== '0' && useDate !== '1') { offenders.push(`row ${i}: UseDate "${useDate}"`); continue; }
      // Cross-field window invariant: the date-window columns are empty when the window flag is off,
      // and populated when it's on — the exact date-string format has no populated sample to check yet.
      const windowValues = dateWindowIdxs.map((di) => row[di] ?? '');
      const windowAllEmpty = windowValues.every((v) => v === '');
      const windowAllPopulated = windowValues.every((v) => v !== '');
      if (useDate === '0' && !windowAllEmpty) { offenders.push(`row ${i}: UseDate=0 but date window not empty (${windowValues.join(', ')})`); continue; }
      if (useDate === '1' && !windowAllPopulated) { offenders.push(`row ${i}: UseDate=1 but date window incomplete (${windowValues.join(', ')})`); continue; }
    }
    expect(offenders).toEqual([]); // every row: full column set, numeric LocationNo, supported currency, 0/1 flags, consistent date-window
  });

  // TC-CPR-TIO-024
  // Population path: the export is TENANT-WIDE, not office-scoped — every observed download spans all
  // locations (rows begin at office 1101), so an empty result requires a tenant with zero location
  // pricebooks anywhere, not merely an empty office. No such tenant is available on the shared e2e
  // server (data-blocked). Un-skip once a zero-pricebook tenant is identified, to assert a
  // header-only-but-valid CSV vs a zero-byte file.
  test.skip('TC-CPR-TIO-024: Empty-dataset Loc Pricing Export yields a header-only valid CSV', async ({ corporatePricingSearchPage: p }) => {
    const r = await p.downloadLocPricingExport();
    expect(r.headers).toEqual(LOC.expectedHeaders);
    expect(r.rowCount).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Export ▾ Year(s)+Currency dialog contract, boundaries, and currency mapping (NM-2264).
// The four Export variants gate behind a shared dialog: pick 1-3 years + a currency, then Continue
// fires the export. These tests cover the dialog behavior and the request params (the real file
// round-trip lives in the next block).
test.describe('Corporate Pricing — Export ▾ dialog contract (NM-2264) @corporate-pricing @toolbar-io', () => {
  test.beforeEach(async ({ corporatePricingSearchPage: p }) => {
    test.setTimeout(90_000);
    await p.open(); // per-test baseline: fresh search-grid load
  });

  test('TC-CPR-TIO-025: Each Export variant opens the shared "Export" Year(s)+Currency dialog', async ({ corporatePricingSearchPage: p }) => {
    for (const v of VARIANTS) {
      await p.openExportVariantDialog(v.label);
      const info = await p.getExportDialogInfo();
      expect(info.text).toContain(EXP.title);
      expect(info.text.toLowerCase()).toContain('year');
      expect(info.text.toLowerCase()).toContain('currency');
      expect(info.buttons).toEqual(expect.arrayContaining(['Cancel', 'Continue', 'Close']));
      expect(info.continueDisabled).toBe(true); // disabled before any field is set
      expect(await p.closeExportDialog()).toBe(true);
    }
  });

  test('TC-CPR-TIO-026: Continue stays disabled with only Year(s) set', async ({ corporatePricingSearchPage: p }) => {
    await p.openExportVariantDialog('All Equipment Pricing');
    await p.setExportYears([EXP.defaultYear]);
    expect(await p.isExportContinueEnabled()).toBe(false); // Currency still required
  });

  test('TC-CPR-TIO-027: Continue stays disabled with only Currency set', async ({ corporatePricingSearchPage: p }) => {
    await p.openExportVariantDialog('All Equipment Pricing');
    await p.setExportCurrency('USD');
    expect(await p.isExportContinueEnabled()).toBe(false); // Year(s) still required
  });

  test('TC-CPR-TIO-028: Continue enables when BOTH Year(s) and Currency are set', async ({ corporatePricingSearchPage: p }) => {
    await p.openExportVariantDialog('All Equipment Pricing');
    await p.setExportYears([EXP.defaultYear]);
    await p.setExportCurrency('USD');
    expect(await p.isExportContinueEnabled()).toBe(true);
  });

  test('TC-CPR-TIO-029: Cancel dismisses the dialog without firing any export request', async ({ corporatePricingSearchPage: p }) => {
    const { requestFired, closed } = await p.cancelExportAndCheckNoRequest('All Equipment Pricing', [EXP.defaultYear], 'USD');
    expect(requestFired).toBe(false); // no pricing-export request on Cancel
    expect(closed).toBe(true);
  });

  test('TC-CPR-TIO-030: Year(s) minimum — a single year is accepted and enables Continue', async ({ corporatePricingSearchPage: p }) => {
    await p.openExportVariantDialog('All Equipment Pricing');
    await p.setExportYears([EXP.defaultYear]); // exactly 1 year (the minimum)
    expect(await p.getExportSelectedYears()).toEqual([EXP.defaultYear]);
    await p.setExportCurrency('USD');
    expect(await p.isExportContinueEnabled()).toBe(true);
  });

  test('TC-CPR-TIO-031: Year(s) maximum is 3 — a 4th year cannot be added and no 4-year export fires', async ({ corporatePricingSearchPage: p }) => {
    await p.openExportVariantDialog('All Equipment Pricing');
    await p.setExportYears(['2026', '2027', '2028']);
    expect(await p.getExportSelectedYears()).toEqual(['2026', '2027', '2028']);
    const afterFourth = await p.attemptExtraExportYear('2025'); // attempt a 4th
    expect(afterFourth).toEqual(['2026', '2027', '2028']); // stays at 3 — the 4th is refused
    await p.setExportCurrency('USD');
    const { url, status } = await p.continueExportAndCaptureRequest();
    expect(status).toBe(200);
    const yearsParams = new URL(url).searchParams.getAll('years'); // years are sent as repeated params
    // the exact 3 chosen years round-trip (sorted — the URL order is not guaranteed), never the refused 4th
    expect([...yearsParams].sort()).toEqual(['2026', '2027', '2028']);
  });

  test('TC-CPR-TIO-032: Currency options present — USD, CAD, MXN', async ({ corporatePricingSearchPage: p }) => {
    await p.openExportVariantDialog('All Equipment Pricing');
    const options = await p.getExportCurrencyOptions();
    for (const c of CUR) expect(options).toContain(c.code);
  });

  test('TC-CPR-TIO-033: Each Currency maps to the correct currencyId on Continue', async ({ corporatePricingSearchPage: p }) => {
    for (const c of CUR) {
      await p.openExportVariantDialog('All Equipment Pricing');
      await p.setExportYears([EXP.defaultYear]);
      await p.setExportCurrency(c.code);
      const { url, status } = await p.continueExportAndCaptureRequest();
      expect(status).toBe(200);
      expect(url).toContain(`currencyId=${c.currencyId}`); // USD=1, CAD=2, MXN=3 (live-captured)
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Export ▾ real per-variant download round-trip + file verification (NM-2264).
// Reuses the same CSV capture as Loc Pricing Export (download + request + status on the same click).
// The exported file is a wide product-group x pricebook matrix; the file + the request params are the
// dual oracle. Folds in the export file-content regression checks (NM-1997/1998 duplicate product
// groups; NM-2005 missing pricebooks / stray labor rows on the max-discount export).
test.describe('Corporate Pricing — Export ▾ real download round-trip (NM-2264) @corporate-pricing @toolbar-io', () => {
  const YEAR = EXP.defaultYear;

  test.beforeEach(async ({ corporatePricingSearchPage: p }) => {
    test.setTimeout(150_000); // several real downloads + file reads per test
    await p.open(); // per-test baseline: fresh search-grid load
  });

  test('TC-CPR-TIO-034: All Equipment Pricing — real download + no duplicate product groups', async ({ corporatePricingSearchPage: p }) => {
    const r = await p.downloadExportVariant('All Equipment Pricing', [YEAR], 'USD');
    expect(r.filename).toBe('EquipmentPricings.csv');
    expect(r.status).toBe(200);
    expect(r.requestUrl).toContain('isLabor=false');
    expect(r.requestUrl).toContain('isMaxDiscount=false');
    // the download's own request carries the full gate — currency, the chosen year, and the locale
    expect(r.requestUrl).toContain('currencyId=1'); // USD
    expect(new URL(r.requestUrl).searchParams.getAll('years')).toEqual([YEAR]);
    expect(r.requestUrl).toContain(CORP_PRICING_TOOLBAR_IO.exportLocaleParam); // locale=en-US
    expect(r.headers.slice(0, 2)).toEqual([...CORP_PRICING_TOOLBAR_IO.exportBaseColumns]); // matrix base columns
    expectWellFormedExportMatrix(r, 'USD'); // currency row values + every row as wide as the header
    const ids = p.exportProductGroupIds(r);
    expect(ids.length).toBeGreaterThan(0); // product-group rows present
    expect(new Set(ids).size).toBe(ids.length); // NM-1997/1998: every Product Group Id unique
  });

  test('TC-CPR-TIO-035: All Labor Pricing — real download + no duplicate product groups', async ({ corporatePricingSearchPage: p }) => {
    const r = await p.downloadExportVariant('All Labor Pricing', [YEAR], 'USD');
    expect(r.filename).toBe('LaborPricings.csv');
    expect(r.status).toBe(200);
    expect(r.requestUrl).toContain('isLabor=true');
    expect(r.requestUrl).toContain('isMaxDiscount=false');
    expect(r.requestUrl).toContain('currencyId=1'); // USD
    expect(new URL(r.requestUrl).searchParams.getAll('years')).toEqual([YEAR]);
    expect(r.requestUrl).toContain(CORP_PRICING_TOOLBAR_IO.exportLocaleParam); // locale=en-US
    expect(r.headers.slice(0, 2)).toEqual([...CORP_PRICING_TOOLBAR_IO.exportBaseColumns]);
    expectWellFormedExportMatrix(r, 'USD');
    const ids = p.exportProductGroupIds(r);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length); // NM-1998
  });

  test('TC-CPR-TIO-036: All Equipment Max Discount — round-trip + NM-2005 (pricebooks present, zero labor rows)', async ({ corporatePricingSearchPage: p }) => {
    // Oracles derived LIVE from the companion exports (same currency, same year).
    const eqPricing = await p.downloadExportVariant('All Equipment Pricing', [YEAR], 'USD');
    const activePricebooks = p.exportPricebookColumns(eqPricing.headers); // active pricebook set = its columns
    const laborPricing = await p.downloadExportVariant('All Labor Pricing', [YEAR], 'USD');
    const laborPgIds = new Set(p.exportProductGroupIds(laborPricing)); // labor product-group set

    const r = await p.downloadExportVariant('All Equipment Max Discount', [YEAR], 'USD');
    expect(r.filename).toBe('EquipmentMaxDiscounts.csv');
    expect(r.status).toBe(200);
    expect(r.requestUrl).toContain('isLabor=false');
    expect(r.requestUrl).toContain('isMaxDiscount=true');
    expect(r.requestUrl).toContain('currencyId=1'); // USD
    expect(new URL(r.requestUrl).searchParams.getAll('years')).toEqual([YEAR]);
    expect(r.requestUrl).toContain(CORP_PRICING_TOOLBAR_IO.exportLocaleParam); // locale=en-US
    expectWellFormedExportMatrix(r, 'USD');
    const ids = p.exportProductGroupIds(r);
    expect(new Set(ids).size).toBe(ids.length); // unique product groups

    // NM-2005 (a): every active pricebook (a sibling-Pricing column) is present on the max-discount export.
    const maxCols = new Set(p.exportPricebookColumns(r.headers));
    const missingPricebooks = activePricebooks.filter((c) => !maxCols.has(c));
    expect(missingPricebooks).toEqual([]);

    // NM-2005 (b): zero rows on the equipment-scoped export carry a labor product group.
    const strayLaborRows = ids.filter((id) => laborPgIds.has(id));
    expect(strayLaborRows).toEqual([]);
  });

  test('TC-CPR-TIO-037: All Labor Max Discount — round-trip + labor pricebook completeness', async ({ corporatePricingSearchPage: p }) => {
    const laborPricing = await p.downloadExportVariant('All Labor Pricing', [YEAR], 'USD');
    const laborPricebooks = p.exportPricebookColumns(laborPricing.headers);

    const r = await p.downloadExportVariant('All Labor Max Discount', [YEAR], 'USD');
    expect(r.filename).toBe('LaborMaxDiscounts.csv');
    expect(r.status).toBe(200);
    expect(r.requestUrl).toContain('isLabor=true');
    expect(r.requestUrl).toContain('isMaxDiscount=true');
    expect(r.requestUrl).toContain('currencyId=1'); // USD
    expect(new URL(r.requestUrl).searchParams.getAll('years')).toEqual([YEAR]);
    expect(r.requestUrl).toContain(CORP_PRICING_TOOLBAR_IO.exportLocaleParam); // locale=en-US
    expectWellFormedExportMatrix(r, 'USD');
    const ids = p.exportProductGroupIds(r);
    expect(new Set(ids).size).toBe(ids.length); // unique product groups

    // NM-2005 applied to the labor scope: every active labor pricebook is present on the labor max-discount export.
    const maxCols = new Set(p.exportPricebookColumns(r.headers));
    const missingPricebooks = laborPricebooks.filter((c) => !maxCols.has(c));
    expect(missingPricebooks).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Export ▾ Axis-2 surface-behavior DEEP band (NM-2264): combination (pairwise), result-fidelity, empty-vol.
test.describe('Corporate Pricing — Export ▾ surface-behavior DEEP (NM-2264) @corporate-pricing @toolbar-io', () => {
  const YEAR = EXP.defaultYear;
  const YEARSETS: string[][] = [[YEAR], ['2026', '2027', '2028']]; // 1-year and 3-year selections

  test.beforeEach(async ({ corporatePricingSearchPage: p }) => {
    test.setTimeout(200_000); // multiple downloads / continues per test
    await p.open();
  });

  test('TC-CPR-TIO-038: Combination DEEP — bounded pairwise variant x Year x Currency', async ({ corporatePricingSearchPage: p }) => {
    // A bounded pairwise covering array over {4 variants} x {1yr, 3yr} x {USD, CAD, MXN} — NOT the full
    // cartesian product. Indices are [variantIndex, yearsetIndex, currencyIndex]; every pair of factor
    // levels appears at least once across these rows.
    const pairwise: Array<[number, number, number]> = [
      [0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 2], [2, 0, 2], [2, 1, 0],
      [3, 0, 0], [3, 1, 1], [0, 0, 2], [1, 1, 0], [2, 0, 1], [3, 1, 2],
    ];
    for (const [vi, yi, ci] of pairwise) {
      const v = VARIANTS[vi];
      const years = YEARSETS[yi];
      const c = CUR[ci];
      if (!v || !years || !c) throw new Error('pairwise index out of range');
      await p.openExportVariantDialog(v.label);
      await p.setExportYears(years);
      await p.setExportCurrency(c.code);
      const { url, status } = await p.continueExportAndCaptureRequest();
      expect(status, `${v.label} x ${years.join('+')} x ${c.code}`).toBe(200);
      expect(url).toContain(`isLabor=${v.isLabor}`);
      expect(url).toContain(`isMaxDiscount=${v.isMaxDiscount}`);
      expect(url).toContain(`currencyId=${c.currencyId}`);
      const yearsParams = new URL(url).searchParams.getAll('years'); // years are sent as repeated params
      expect([...yearsParams].sort()).toEqual([...years].sort()); // the exact chosen years round-trip, not just the count
    }
  });

  test('TC-CPR-TIO-039: Result-fidelity DEEP — each variant\'s file reflects its scope', async ({ corporatePricingSearchPage: p }) => {
    const eqP = await p.downloadExportVariant('All Equipment Pricing', [YEAR], 'USD');
    const laborP = await p.downloadExportVariant('All Labor Pricing', [YEAR], 'USD');
    const eqMax = await p.downloadExportVariant('All Equipment Max Discount', [YEAR], 'USD');

    // Equipment vs Labor are genuinely different scopes: disjoint product-group populations...
    const eqIds = new Set(p.exportProductGroupIds(eqP));
    const overlap = p.exportProductGroupIds(laborP).filter((id) => eqIds.has(id));
    expect(overlap).toEqual([]);
    // ...and different pricebook columns.
    expect(p.exportPricebookColumns(eqP.headers)).not.toEqual(p.exportPricebookColumns(laborP.headers));

    // Pricing vs Max Discount (same equipment scope) share the column structure — the dispositive
    // difference is the request param, not the columns (do not assert a false structural difference).
    expect(p.exportPricebookColumns(eqMax.headers)).toEqual(p.exportPricebookColumns(eqP.headers));
    expect(eqP.requestUrl).toContain('isMaxDiscount=false');
    expect(eqMax.requestUrl).toContain('isMaxDiscount=true');
  });

  test('TC-CPR-TIO-040: Empty/minimal-scope DEEP — a currency with no pricebooks yields a valid CSV', async ({ corporatePricingSearchPage: p }) => {
    const cad = await p.downloadExportVariant('All Equipment Pricing', [YEAR], 'CAD'); // live empty-scope oracle
    const usd = await p.downloadExportVariant('All Equipment Pricing', [YEAR], 'USD');
    expect(cad.status).toBe(200);
    expect(cad.content.length).toBeGreaterThan(0); // a real, non-empty file (not zero-byte)
    expect(cad.headers.slice(0, 2)).toEqual([...CORP_PRICING_TOOLBAR_IO.exportBaseColumns]); // base columns present
    // Positive control: the same extractor yields many pricebook columns for USD — so a 0 for CAD is a
    // real empty scope, not a reader that silently returns nothing for every currency.
    expect(p.exportPricebookColumns(usd.headers).length).toBeGreaterThan(0);
    // CAD Equipment carries no pricebooks: the export is a valid, non-empty CSV whose pricebook-column
    // scope is exactly empty (live-confirmed: CAD = 0, USD = 79).
    expect(p.exportPricebookColumns(cad.headers).length).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Loc Pricing Import — REAL upload round-trip (NM-2305).
//
// "Loc Pricing Import" uploads a CSV that the server applies per (LOCATION, CURRENCY): the rows the file
// carries for a location-and-currency REPLACE that location's existing rows in that currency — a row
// omitted from the file within a currency the file touches is REMOVED, not merged (live-verified) — and
// any location, and any currency partition, absent from the file is left untouched (a USD-only file
// leaves a location's CAD rows intact). Because it is a REPLACE, the per-test baseline file (baseline.csv)
// carries the office's COMPLETE USD row set so a reset restores every row. That makes a minimal
// single-location USD file safe: it bounds the mutation to a throwaway office (5897 — outside every other
// spec's offices) and avoids the failure a full ~38k-row import currently hits. The round-trip flips a
// pricebook between Primary and Alternate (the IsAlternate flag) and confirms the change by RE-DOWNLOADING
// the export — the export is the source of truth, a different dataset from the on-screen search grid.
//
// Live-observed write scope: of the flag columns only IsAlternate is applied by the import (Internal /
// Labor / Production come back reported "updated" but do not change), and a pricebook name not already
// defined in the system is silently dropped (createdCount stays 0 and the row never appears) — the import
// updates existing pricebooks, it does not create new ones. TC-050/051 pin those behaviors.
//
// Mutation safety: every test resets office 5897 to its known baseline first and restores it after, and
// the reset is persistence-verified (re-read from a fresh export, not trusted from the upload's own
// success flag). The dialog can look fine while the server rejected the import, so the success cases
// assert the REAL PUT response (status + body), never the dialog alone.
//
// The full/large-file boundary is not automated: importing the full ~38k-row export live on 2026-07-07
// returned HTTP 500 partway through ("Failed to replace LocationPricebook document ..." — NM-2407), and
// automating it would re-import ~38k rows on shared data every run. So it is verified once by hand and
// documented, not wired into CI; the bounded valid round-trip below is the safe automated coverage.
const IMP2 = CORP_PRICING_TOOLBAR_IO.locImport;
const OFFICE = IMP2.throwawayOffice;
const LOC_H = CORP_PRICING_TOOLBAR_IO.locExport.expectedHeaders;
const ALT_IDX = LOC_H.indexOf('IsAlternate');
const fixturePath = (name: string): string =>
  resolve(__dirname, '../../src/data/corporate-pricing/fixtures/loc-pricing-import', name);

/** Office 5897's three baseline rows (all Primary), in the export's 11-column order — the reset oracle. */
const BASELINE_ROWS: string[][] = [
  ['5897', '2026-LV-PB-3867', '2026-LV-PB-3867', 'USD', '0', '0', '0', '0', '0', '', ''],
  ['5897', '2026-LV-LB-3867', '2026-LV-LB-3867', 'USD', '0', '1', '0', '0', '0', '', ''],
  ['5897', '2026-NP LB4', '2026-NP LB4', 'USD', '0', '1', '0', '1', '0', '', ''],
];

/** Sort captured rows so before/after comparisons are order-agnostic — the export re-orders a location's
 *  rows after a mutation, so a positional compare would flake. */
const sortRows = (rows: string[][]): string[][] =>
  [...rows].sort((a, b) => a.join('').localeCompare(b.join('')));

/** Find one pricebook row (by its PriceBook name) in a captured export slice; throw if it is missing. */
function requireRow(cap: { header: string[]; rows: string[][] }, priceBook: string, locationNo: string = OFFICE): string[] {
  const pbIdx = cap.header.indexOf('PriceBook');
  const row = cap.rows.find((r) => r[pbIdx] === priceBook);
  if (!row) throw new Error(`Loc ${locationNo}: pricebook row "${priceBook}" not found in the export`);
  return row;
}

test.describe('Corporate Pricing — Loc Pricing Import real round-trip (NM-2305) @corporate-pricing @toolbar-io @mutation', () => {
  test.beforeEach(async ({ corporatePricingSearchPage: p }) => {
    test.setTimeout(120_000); // upload + server processing + a full export re-download can be slow
    await p.open(); // per-test baseline: fresh search-grid load, no reliance on prior-test state
    // Deterministic baseline: put the throwaway office back to all-Primary before every test so a prior
    // test (or a crashed run) can never bleed into this one.
    const reset = await p.locPricingImport(fixturePath('baseline.csv'));
    expect(reset.success, `office ${OFFICE} baseline reset`).toBe(true);
    // Persistence-verified reset: don't trust the upload's own success flag — re-read the export and
    // confirm 5897 is EXACTLY its three baseline rows before the test body runs.
    const seed = await p.captureLocPricingCsvRows(OFFICE);
    expect(seed.rows, `office ${OFFICE} did not reset to its 3 baseline rows`).toHaveLength(3);
    expect(sortRows(seed.rows)).toEqual(sortRows(BASELINE_ROWS));
  });

  test.afterEach(async ({ corporatePricingSearchPage: p }) => {
    test.setTimeout(120_000);
    // Restore the throwaway office to baseline (best-effort — logged, not asserted, so a flaky restore
    // never masks the test's own verdict).
    const restore = await p.locPricingImport(fixturePath('baseline.csv')).catch(() => null);
    if (!restore || !restore.success) {
      test.info().annotations.push({ type: 'restore', description: `office ${OFFICE} restore to baseline did not confirm` });
    }
  });

  // TC-CPR-TIO-041
  test('TC-CPR-TIO-041: Loc Pricing Import flips a pricebook Primary->Alternate and the change reflects in a fresh export', async ({ corporatePricingSearchPage: p }) => {
    // Known start: NP LB4 is Primary (the beforeEach reset already set this — assert it to prove causation).
    const before = await p.captureLocPricingCsvRows(OFFICE);
    expect(before.header).toEqual(LOC_H); // the export schema is the one the fixtures were built against
    expect(requireRow(before, '2026-NP LB4')[ALT_IDX]).toBe('0');

    // The real mutation: upload a minimal single-location file that flips NP LB4 to Alternate.
    const result = await p.locPricingImport(fixturePath('valid-update.csv'));
    // Assert the REAL server outcome, not the dialog.
    expect(result.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.message).toContain(IMP2.successMessageFragment);
    expect(result.requestUrl).toContain(CORP_PRICING_LOC_IMPORT_API);

    // Verify in a fresh export (the oracle): the whole 11-column row equals the uploaded values.
    const after = await p.captureLocPricingCsvRows(OFFICE);
    expect(requireRow(after, '2026-NP LB4')).toEqual(['5897', '2026-NP LB4', '2026-NP LB4', 'USD', '0', '1', '1', '1', '0', '', '']);
  });

  // TC-CPR-TIO-042
  test('TC-CPR-TIO-042: Loc Pricing Import replaces a location set — a row omitted from the file is removed, not merged', async ({ corporatePricingSearchPage: p }) => {
    // A canary office named in NO import file — captured before + after to prove the import touches only
    // the office the file carries, not others.
    const CANARY = '1101';
    const canaryBefore = await p.captureLocPricingCsvRows(CANARY);
    expect(canaryBefore.rows.length, 'canary office must have rows to compare').toBeGreaterThan(0);

    // beforeEach reset 5897 to its three baseline rows. A 2-of-3-row file: LV-PB flipped to Alternate,
    // LV-LB left Primary; NP LB4 omitted entirely.
    const result = await p.locPricingImport(fixturePath('partial-update.csv'));
    expect(result.success, result.message).toBe(true);

    // The import REPLACES the location's set (within the file's currency) with the file's rows (live-verified
    // per-(location,currency) replace, NOT a per-row merge): the two in-file rows carry their EXACT values,
    // and the omitted row is GONE.
    const after = await p.captureLocPricingCsvRows(OFFICE);
    const pbIdx = after.header.indexOf('PriceBook');
    // Full 11-column assertion on BOTH survivors — not just the flag — so a corrupt Currency/Labor/etc.
    // value cannot slip through.
    expect(requireRow(after, '2026-LV-PB-3867')).toEqual(['5897', '2026-LV-PB-3867', '2026-LV-PB-3867', 'USD', '0', '0', '1', '0', '0', '', '']);
    expect(requireRow(after, '2026-LV-LB-3867')).toEqual(['5897', '2026-LV-LB-3867', '2026-LV-LB-3867', 'USD', '0', '1', '0', '0', '0', '', '']);
    expect(after.rows.map((r) => r[pbIdx])).not.toContain('2026-NP LB4'); // omitted row REMOVED (replace, not merge)
    expect(after.rows).toHaveLength(2); // exactly the file's two rows survive — the count IS the feature (per-location-currency replace)

    // The canary office is completely untouched by a single-office import (order-agnostic compare).
    const canaryAfter = await p.captureLocPricingCsvRows(CANARY);
    expect(sortRows(canaryAfter.rows)).toEqual(sortRows(canaryBefore.rows));
  });

  // TC-CPR-TIO-043
  test('TC-CPR-TIO-043: Loc Pricing Import rejects an empty file in the browser and runs no import', async ({ corporatePricingSearchPage: p }) => {
    const before = await p.captureLocPricingCsvRows(OFFICE);
    const result = await p.locPricingImport(fixturePath('empty.csv'));
    expect(result.success).toBe(false);
    expect(result.status).toBeNull(); // rejected before any request fired
    expect(result.message).toContain(IMP2.rejectEmptyMessage);
    await p.closeImportDialog();
    const after = await p.captureLocPricingCsvRows(OFFICE);
    expect(sortRows(after.rows)).toEqual(sortRows(before.rows)); // nothing was committed
  });

  // TC-CPR-TIO-044
  test('TC-CPR-TIO-044: Loc Pricing Import rejects a non-CSV file by type and runs no import', async ({ corporatePricingSearchPage: p }) => {
    const before = await p.captureLocPricingCsvRows(OFFICE);
    const result = await p.locPricingImport(fixturePath('wrong-format.txt'));
    expect(result.success).toBe(false);
    expect(result.status).toBeNull();
    expect(result.message).toContain(IMP2.rejectWrongFormatMessage);
    await p.closeImportDialog();
    const after = await p.captureLocPricingCsvRows(OFFICE);
    expect(sortRows(after.rows)).toEqual(sortRows(before.rows));
  });

  // TC-CPR-TIO-045
  test('TC-CPR-TIO-045: Loc Pricing Import surfaces an error for a structurally malformed CSV and runs no import', async ({ corporatePricingSearchPage: p }) => {
    const before = await p.captureLocPricingCsvRows(OFFICE);
    const result = await p.locPricingImport(fixturePath('malformed.csv'));
    // A malformed file is rejected before any request runs. The exact text is a raw parser error today
    // (an unfriendly-message improvement lead), so assert that an error IS surfaced — via the error family,
    // not one brittle string — AND that no import ran and nothing changed.
    expect(result.success).toBe(false);
    expect(result.status).toBeNull();
    expect(result.message, 'a malformed file must surface a visible error, not a silent no-op').toMatch(
      /cannot read propert|error|invalid|unsupported|does not contain|check the upload file/i,
    );
    await p.closeImportDialog();
    const after = await p.captureLocPricingCsvRows(OFFICE);
    expect(sortRows(after.rows)).toEqual(sortRows(before.rows));
  });

  // TC-CPR-TIO-046
  // The app auto-submits the import the moment a file is chosen (live-verified) — so there is no
  // "choose then cancel" window. The meaningful negative case is that merely opening the import
  // affordance and dismissing it (without choosing a file) fires no import and changes nothing.
  test('TC-CPR-TIO-046: Loc Pricing Import — opening and dismissing the dialog without choosing a file runs no import', async ({ corporatePricingSearchPage: p }) => {
    const before = await p.captureLocPricingCsvRows(OFFICE);

    // Arm the import-request listener BEFORE opening the affordance, so a regression where merely opening
    // "Loc Pricing Import" fires an import is caught — not only one after the dialog is already open.
    let importFired = false;
    const onReq = (req: import('@playwright/test').Request): void => {
      if (req.url().includes(CORP_PRICING_LOC_IMPORT_API)) importFired = true;
    };
    p.page.on('request', onReq);
    await p.openLocPricingImportDialog();
    await p.closeImportDialog();
    p.page.off('request', onReq);
    expect(importFired).toBe(false);

    const after = await p.captureLocPricingCsvRows(OFFICE);
    expect(sortRows(after.rows)).toEqual(sortRows(before.rows));
  });

  // TC-CPR-TIO-047
  test('TC-CPR-TIO-047: Loc Pricing Import change persists on a fresh export after reload and the search grid still renders', async ({ corporatePricingSearchPage: p }) => {
    const result = await p.locPricingImport(fixturePath('valid-update.csv')); // flip NP LB4 -> Alternate
    expect(result.success, result.message).toBe(true);

    await p.open(); // reload the Search page
    expect(await p.getVisibleRowCount()).toBeGreaterThan(0); // grid re-renders, not left blank (guards NM-2206)

    const after = await p.captureLocPricingCsvRows(OFFICE);
    expect(requireRow(after, '2026-NP LB4')[ALT_IDX]).toBe('1'); // the imported value is durable, not an in-memory echo
  });

  // TC-CPR-TIO-049
  test('TC-CPR-TIO-049: Loc Pricing Import rejects a header-only CSV (headers, zero data rows) in the browser and runs no import', async ({ corporatePricingSearchPage: p }) => {
    const before = await p.captureLocPricingCsvRows(OFFICE);
    const result = await p.locPricingImport(fixturePath('header-only.csv'));
    // Distinct from the 0-byte empty file: a header-only file is also rejected client-side, with its own
    // message, and never fires a request.
    expect(result.success).toBe(false);
    expect(result.status).toBeNull();
    expect(result.message).toContain(IMP2.rejectHeaderOnlyMessage);
    await p.closeImportDialog();
    const after = await p.captureLocPricingCsvRows(OFFICE);
    expect(sortRows(after.rows)).toEqual(sortRows(before.rows)); // nothing committed
  });

  // TC-CPR-TIO-050
  test('TC-CPR-TIO-050: Loc Pricing Import applies only the Alternate flag — Internal/Labor/Production columns are not written', async ({ corporatePricingSearchPage: p }) => {
    // The file sets all four boolean flags to 1 on LV-PB. The server accepts it, but only Alternate is an
    // import-writable column — the fresh export proves the other three stay 0 (live-verified write scope).
    const result = await p.locPricingImport(fixturePath('field-writability.csv'));
    expect(result.status).toBe(200);
    expect(result.success, result.message).toBe(true);

    const after = await p.captureLocPricingCsvRows(OFFICE);
    const H = after.header;
    const row = requireRow(after, '2026-LV-PB-3867');
    expect(row[H.indexOf('IsAlternate')]).toBe('1');   // the only flag the import writes
    expect(row[H.indexOf('IsInternal')]).toBe('0');    // unchanged despite the file setting it to 1
    expect(row[H.indexOf('IsLabor')]).toBe('0');       // unchanged despite the file setting it to 1
    expect(row[H.indexOf('IsProduction')]).toBe('0');  // unchanged despite the file setting it to 1
  });

  // TC-CPR-TIO-051
  test('TC-CPR-TIO-051: Loc Pricing Import silently drops a pricebook not already defined in the system — no row is created', async ({ corporatePricingSearchPage: p }) => {
    const before = await p.captureLocPricingCsvRows(OFFICE);
    const result = await p.locPricingImport(fixturePath('create-novel.csv')); // 3 baseline rows + 1 novel pricebook
    expect(result.success, result.message).toBe(true);

    // The server reports the novel row as "processed" but createdCount is 0 and it never appears in the
    // export — the import updates existing pricebooks and cannot create a new pricebook definition.
    const parsed = JSON.parse(result.responseBody ?? '{}') as { data?: { createdCount?: number } };
    expect(parsed.data?.createdCount).toBe(0);

    const after = await p.captureLocPricingCsvRows(OFFICE);
    const pbIdx = after.header.indexOf('PriceBook');
    expect(after.rows.map((r) => r[pbIdx])).not.toContain('2026-NOVEL-PROBE-9999');
    expect(sortRows(after.rows)).toEqual(sortRows(before.rows)); // 5897 unchanged — the novel row was dropped
  });
});
