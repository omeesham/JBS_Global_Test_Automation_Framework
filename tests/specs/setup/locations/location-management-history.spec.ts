// spec: specs_planning/test-plans/setup/locations/locations_management_history_test_plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../../setup/fixtures';
import {
  COLUMN_COUNT,
  FIRST_COLUMN,
  LAST_COLUMN,
  DEFAULT_ROWS_PER_PAGE,
  ROWS_PER_PAGE_OPTIONS,
  NON_SORTABLE_COLUMNS,
  ROW_1_EXPECTED,
} from '../../../test-data/setup/locations/location-management-history.data';
import { OFFICE_NO } from '../../../test-data/common.data';

/** Parse "MM/DD/YYYY HH:MM:SS AM/PM" date format deterministically. */
function parseDateVal(val: string): number {
  const parts = val.trim().split(' ');
  const dateParts = (parts[0] || '').split('/');
  const timeParts = (parts[1] || '').split(':').map(Number);
  const ampm = parts[2] || '';
  const m = Number(dateParts[0]);
  const d = Number(dateParts[1]);
  const y = Number(dateParts[2]);
  let h = timeParts[0] || 0;
  const min = timeParts[1] || 0;
  const s = timeParts[2] || 0;
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return new Date(y, m - 1, d, h, min, s).getTime();
}

test.describe.serial('Location Management History @locations @management-history', () => {

  test('TC-LOC-MGH-001: Tab renders and DataTable loads', async ({ locationManagementHistoryPage }) => {
    test.setTimeout(60_000);
    await locationManagementHistoryPage.navigateToHistoryTab(OFFICE_NO);
    expect(await locationManagementHistoryPage.isTableVisible()).toBe(true);
    expect(await locationManagementHistoryPage.getColumnHeaderCount()).toBeGreaterThan(0);
  });

  test('TC-LOC-MGH-002: All 87 column headers present', async ({ locationManagementHistoryPage }) => {
    const count = await locationManagementHistoryPage.getColumnHeaderCount();
    expect(count).toBe(COLUMN_COUNT);
    const headers = await locationManagementHistoryPage.getColumnHeaders();
    expect(headers[0]).toBe(FIRST_COLUMN);
    expect(headers[headers.length - 1]).toBe(LAST_COLUMN);
  });

  test('TC-LOC-MGH-003: Default rows per page is 20', async ({ locationManagementHistoryPage }) => {
    const value = await locationManagementHistoryPage.getRowsPerPageValue();
    expect(value).toBe(DEFAULT_ROWS_PER_PAGE);
  });

  test('TC-LOC-MGH-004: Rows per page dropdown options', async ({ locationManagementHistoryPage }) => {
    const options = await locationManagementHistoryPage.getRowsPerPageOptions();
    expect(options).toEqual(ROWS_PER_PAGE_OPTIONS);
  });

  test('TC-LOC-MGH-005: Change rows per page updates table display', async ({ locationManagementHistoryPage }) => {
    await locationManagementHistoryPage.setRowsPerPage('10');
    const rows = await locationManagementHistoryPage.getDataRowCount();
    expect(rows).toBeLessThanOrEqual(10);
    // Reset to default
    await locationManagementHistoryPage.setRowsPerPage(DEFAULT_ROWS_PER_PAGE);
  });

  test('TC-LOC-MGH-006: Pagination controls disabled when only one page', async ({ locationManagementHistoryPage }) => {
    test.skip(true, 'Office 1604 has 2900+ rows -- always multi-page. Requires a location with <= 20 history rows.');
  });

  test('TC-LOC-MGH-007: Empty state message for location with no history', async ({ locationManagementHistoryPage }) => {
    // TC requirement: a location with NO history. 1604 has history.
    // This test documents the expected empty state behavior.
    // Use a freshly created location or one known to have no records.
    test.skip(true, 'Requires a location with zero history rows -- 1604 has 2900+ rows');
  });

  test('TC-LOC-MGH-008: Data row renders with correct values (location 1604)', async ({ locationManagementHistoryPage }) => {
    const row = await locationManagementHistoryPage.getRowValues(0, [
      ...Object.keys(ROW_1_EXPECTED), 'Modified By', 'Oracle Product Code',
    ]);
    for (const [key, expected] of Object.entries(ROW_1_EXPECTED)) {
      expect(row[key]).toBe(expected);
    }
    // Dynamic fields — values change per save, just verify non-empty
    expect(row['Modified By']).toBeTruthy();
    expect(row['Oracle Product Code']).toBeTruthy();
  });

  test('TC-LOC-MGH-009: Sort ascending on sortable column', async ({ locationManagementHistoryPage }) => {
    await locationManagementHistoryPage.clickSortColumn('Modified On', 'ascending');
    const firstVal = await locationManagementHistoryPage.getColumnByHeader(0, 'Modified On');
    const lastVal = await locationManagementHistoryPage.getColumnByHeader(
      Math.min(19, await locationManagementHistoryPage.getDataRowCount() - 1), 'Modified On');
    expect(firstVal).toBeTruthy();
    expect(lastVal).toBeTruthy();
    // Verify ascending order: first date <= last date
    const firstTs = parseDateVal(firstVal);
    const lastTs = parseDateVal(lastVal);
    expect(firstTs).not.toBeNaN();
    expect(lastTs).not.toBeNaN();
    expect(firstTs).toBeLessThanOrEqual(lastTs);
  });

  test('TC-LOC-MGH-010: Sort descending by toggling same column', async ({ locationManagementHistoryPage }) => {
    await locationManagementHistoryPage.clickSortColumn('Modified On', 'descending');
    const firstVal = await locationManagementHistoryPage.getColumnByHeader(0, 'Modified On');
    const lastVal = await locationManagementHistoryPage.getColumnByHeader(
      Math.min(19, await locationManagementHistoryPage.getDataRowCount() - 1), 'Modified On');
    expect(firstVal).toBeTruthy();
    expect(lastVal).toBeTruthy();
    // Verify descending order: first date >= last date
    const firstTs = parseDateVal(firstVal);
    const lastTs = parseDateVal(lastVal);
    expect(firstTs).not.toBeNaN();
    expect(lastTs).not.toBeNaN();
    expect(firstTs).toBeGreaterThanOrEqual(lastTs);
  });

  test('TC-LOC-MGH-011: Sort by Live Date column', async ({ locationManagementHistoryPage }) => {
    await locationManagementHistoryPage.clickSortColumn('Live Date');
    const firstRow = await locationManagementHistoryPage.getColumnByHeader(0, 'Live Date');
    expect(firstRow).toBeTruthy();
  });

  test('TC-LOC-MGH-012: Non-sortable columns have no sort button', async ({ locationManagementHistoryPage }) => {
    for (const col of NON_SORTABLE_COLUMNS) {
      expect(await locationManagementHistoryPage.isSortButtonPresent(col)).toBe(false);
    }
  });

  test('TC-LOC-MGH-013: Column 28 renders correct header text', async ({ locationManagementHistoryPage }) => {
    const headers = await locationManagementHistoryPage.getColumnHeaders();
    const col28 = headers[27]; // 0-indexed
    expect(col28).toBe('Calculate LDW on Net Amount');
  });

  test('TC-LOC-MGH-014: Columns 37 and 38 have correct distinct headers', async ({ locationManagementHistoryPage }) => {
    const headers = await locationManagementHistoryPage.getColumnHeaders();
    const col37 = headers[36]; // 0-indexed
    const col38 = headers[37]; // 0-indexed
    expect(col37).toBe('Calculate CAC on Net Amount');
    expect(col38).toBe('Terms and Conditions');
    // Both columns are non-sortable (MCP-verified 2026-04-14)
    expect(await locationManagementHistoryPage.isSortButtonPresentByIndex(36)).toBe(false);
    expect(await locationManagementHistoryPage.isSortButtonPresentByIndex(37)).toBe(false);
  });

  test('TC-LOC-MGH-015: Read-only -- no Add/Edit/Delete controls present', async ({ locationManagementHistoryPage }) => {
    expect(await locationManagementHistoryPage.isReadOnly()).toBe(true);
  });

  test('TC-LOC-MGH-016: Read-only -- table cells are not interactive', async ({ locationManagementHistoryPage }) => {
    // Click a cell and verify no input/editor appears
    expect(await locationManagementHistoryPage.areCellsNonInteractive()).toBe(true);
  });

  test('TC-LOC-MGH-017: Horizontal scroll works for wide table', async ({ locationManagementHistoryPage }) => {
    expect(await locationManagementHistoryPage.hasHorizontalScroll()).toBe(true);
    // Verify last column is accessible (col 87)
    const headers = await locationManagementHistoryPage.getColumnHeaders();
    expect(headers[headers.length - 1]).toBe(LAST_COLUMN);
  });

  test('TC-LOC-MGH-018: API endpoint called on tab activation', async ({ locationManagementHistoryPage }) => {
    // Switch away from History tab, then re-enter — verify API fires
    const responses = await locationManagementHistoryPage.captureResponsesOnHistoryTabSwitch();
    expect(responses.length).toBeGreaterThan(0);
  });

  test('TC-LOC-MGH-019: Pagination navigation enables with multiple pages', async ({ locationManagementHistoryPage }) => {
    // Page 1: next/last enabled, first/prev disabled
    expect(await locationManagementHistoryPage.isPaginationButtonDisabled('first')).toBe(true);
    expect(await locationManagementHistoryPage.isPaginationButtonDisabled('previous')).toBe(true);
    expect(await locationManagementHistoryPage.isPaginationButtonDisabled('next')).toBe(false);
    expect(await locationManagementHistoryPage.isPaginationButtonDisabled('last')).toBe(false);

    // Go to next page
    await locationManagementHistoryPage.clickPaginationButton('next');
    const paginationAfterNext = await locationManagementHistoryPage.getPaginationText();
    expect(paginationAfterNext).toContain('2');

    // Go to previous page
    await locationManagementHistoryPage.clickPaginationButton('previous');
    const paginationAfterPrev = await locationManagementHistoryPage.getPaginationText();
    expect(paginationAfterPrev).toMatch(/^1\s*\/\s*\d+$/);

    // Go to last page
    await locationManagementHistoryPage.clickPaginationButton('last');
    expect(await locationManagementHistoryPage.isPaginationButtonDisabled('next')).toBe(true);
    expect(await locationManagementHistoryPage.isPaginationButtonDisabled('last')).toBe(true);

    // Go to first page
    await locationManagementHistoryPage.clickPaginationButton('first');
    expect(await locationManagementHistoryPage.isPaginationButtonDisabled('first')).toBe(true);
    expect(await locationManagementHistoryPage.isPaginationButtonDisabled('previous')).toBe(true);
  });

});
