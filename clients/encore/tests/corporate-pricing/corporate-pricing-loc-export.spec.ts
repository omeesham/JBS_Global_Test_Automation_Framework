/**
 * Corporate Pricing — Loc Pricing Export file round-trip (NM-2262).
 * TC-CPR-LEX-001..007. Live-grounded 2026-07-06 (office 1604).
 *
 * "Loc Pricing Export" downloads a location-scoped pricebook CSV. These cases verify the REAL
 * downloaded file (not just that the export endpoint fires): the timestamped filename, that the
 * file is non-empty and parseable, its exact header columns and data rows, that the download
 * request carries the locale, that a second export downloads a fresh file, and that every row is
 * well-formed (valid currency, 0/1 flags, consistent date window). LEX-007 is a data-blocked
 * empty-dataset stub (Manual until a zero-pricebook office is available).
 *
 * The exported file is the oracle — a location-scoped CSV, a different dataset from the on-screen
 * strategy grid — so the file's own structure and content are asserted, not a grid row-for-row diff.
 */
import { test, expect } from '../../src/fixtures/pages.fixture';
import { CORP_PRICING_TOOLBAR_IO } from '../../src/data/corporate-pricing/toolbar-io';
// Loc Pricing Export — REAL file download round-trip + downloaded-file verification (NM-2262).
//
// TC-CPR-TIO-012 (in the baseline toolbar spec) asserts only that the export request fires — it never captures
// a file. This block captures the REAL downloaded CSV and verifies the FILE itself: filename pattern,
// non-empty/parseable, header columns, data rows, and that the download's own request carried the locale.
// The exported file is the oracle (Loc Pricing Export is a location-scoped CSV, a different dataset from
// the on-screen strategy grid — so the file's own structure/content is asserted, not a grid row-for-row diff).
const LOC = CORP_PRICING_TOOLBAR_IO.locExport;

test.describe('Corporate Pricing — Loc Pricing Export file round-trip (NM-2262) @corporate-pricing @loc-pricing-export', () => {
  test.beforeEach(async ({ corporatePricingSearchPage: p }) => {
    test.setTimeout(60_000); // fresh grid load + network round-trip + read from the temp download path
    await p.open(); // per-test baseline: fresh search-grid load, no reliance on prior-test state
  });

  // TC-CPR-LEX-001
  test('TC-CPR-LEX-001: Loc Pricing Export downloads a real CSV file with the expected timestamped filename', async ({ corporatePricingSearchPage: p }) => {
    const r = await p.downloadLocPricingExport();
    expect(r.filename).toMatch(LOC.filenamePattern); // LocationPricebooks_<YYYYMMDD>_<HHMMSS>UTC.csv
  });

  // TC-CPR-LEX-002
  test('TC-CPR-LEX-002: Downloaded Loc Pricing Export file is non-empty and parseable as CSV', async ({ corporatePricingSearchPage: p }) => {
    const r = await p.downloadLocPricingExport();
    expect(r.content.length).toBeGreaterThan(0);
    expect(r.content).toContain(','); // the file is actually comma-delimited, not a single garbage token
    expect(r.headers.length).toBeGreaterThan(0); // a header row parsed out
  });

  // TC-CPR-LEX-003
  test('TC-CPR-LEX-003: Downloaded CSV carries the expected header columns and at least one data row', async ({ corporatePricingSearchPage: p }) => {
    const r = await p.downloadLocPricingExport();
    expect(r.headers).toEqual(LOC.expectedHeaders); // exact column set + order (the file is the oracle)
    expect(r.rowCount).toBeGreaterThan(0); // location pricebook data is present
  });

  // TC-CPR-LEX-004
  test('TC-CPR-LEX-004: The Loc Pricing Export download request carries the locale param', async ({ corporatePricingSearchPage: p }) => {
    const r = await p.downloadLocPricingExport();
    expect(r.requestUrl).toContain('location-export');
    expect(r.requestUrl).toContain(CORP_PRICING_TOOLBAR_IO.exportLocaleParam); // locale=en-US on the download's own request
  });

  // TC-CPR-LEX-005
  test('TC-CPR-LEX-005: A second consecutive Loc Pricing Export fires a fresh download', async ({ corporatePricingSearchPage: p }) => {
    const r1 = await p.downloadLocPricingExport();
    const r2 = await p.downloadLocPricingExport(); // no re-open between: proves a fresh download on re-click
    expect(r1.filename).toMatch(LOC.filenamePattern);
    expect(r2.filename).toMatch(LOC.filenamePattern);
    expect(r2.content.length).toBeGreaterThan(0);
  });

  // TC-CPR-LEX-006
  test('TC-CPR-LEX-006: Every downloaded CSV row is well-formed with a valid currency, 0/1 flags, and a consistent date-window', async ({ corporatePricingSearchPage: p }) => {
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

  // TC-CPR-LEX-007
  // Population path: the export is TENANT-WIDE, not office-scoped — every observed download spans all
  // locations (rows begin at office 1101), so an empty result requires a tenant with zero location
  // pricebooks anywhere, not merely an empty office. No such tenant is available on the shared e2e
  // server (data-blocked). Un-skip once a zero-pricebook tenant is identified, to assert a
  // header-only-but-valid CSV vs a zero-byte file.
  test.skip('TC-CPR-LEX-007: Empty-dataset Loc Pricing Export yields a header-only valid CSV', async ({ corporatePricingSearchPage: p }) => {
    const r = await p.downloadLocPricingExport();
    expect(r.headers).toEqual(LOC.expectedHeaders);
    expect(r.rowCount).toBe(0);
  });
});
