import { test, expect } from '../../src/fixtures/pages.fixture';
import { ItemSearchPage } from '../../src/pages/item-search/item-search.page';
import { ProductGroupsPage } from '../../src/pages/item-search/product-groups.page';
import {
  ISR_OFFICE,
  ISR_OFFICE_OPTION,
  ISR_LOCATION_PLACEHOLDER,
  ISR_REGION_PLACEHOLDER,
  ISR_REGION_SAMPLE,
  ISR_LOCATION_LIST_FLOOR,
  ISR_REGION_LIST_FLOOR,
  ISR_ORG_ENTRIES,
  ISR_SEARCH_WORD,
  ISR_NO_MATCH_BARCODE,
  ISR_COLUMNS,
  ISR_COLUMN_MENU_ITEMS,
  ISR_SORT_COLUMN,
  ISR_HIDE_COLUMN,
  ISR_PAGE_SIZES,
  ISR_DEFAULT_PAGE_SIZE,
  ISR_PAGE_COUNT_FLOOR,
  ISR_TOOLTIP_INFO,
  ISR_TOOLTIP_COLLAPSE,
  ISR_TOOLTIP_GRID_OPTIONS,
} from '../../src/data/item-search/item-search';

/**
 * Item Search — Products page (NM-2253), office 1101 (admin-only surface).
 *
 * Two live behaviors shape every test:
 *  - Results load only on Search, and Reset empties to "0 products found" until the next
 *    Search. Executed criteria + results + sort order are restored from browser storage on
 *    later visits, so every test starts from Reset — defaults are never asserted on a bare
 *    load.
 *  - The page hydrates behind skeleton placeholders (~20s cold, ~11s per unfiltered
 *    search); every wait keys on the placeholder census, never a row count.
 *
 * Nothing here persists data — the page has no save; only filter state is touched and
 * each test restores what it changes.
 */
// A test can run two full searches plus a reload on a slow evening — the ceiling covers
// the worst measured stack, and the run report is where slowness gets surfaced.
test.describe.configure({ timeout: 300_000 });

/** True when the values are in non-descending order, compared case-insensitively. */
const isNonDescending = (values: string[]): boolean =>
  values.every((v, i) => i === 0 || (values[i - 1] ?? '').toLowerCase() <= v.toLowerCase());

// ---------------------------------------------------------------------------- surface cases

test.describe('SBC — Item Search Products surface behaviors @item-search @product-search', () => {
  let isr: ItemSearchPage;

  test.beforeEach(async ({ authenticatedSession, config }) => {
    isr = new ItemSearchPage(authenticatedSession.page, config);
    await isr.ensureCleanSearch(ISR_OFFICE);
  });

  test('TC-ISR-PRS-001: The Products page loads with the search panel and grid ready', async ({ dependencyGate }) => {
    dependencyGate([]);
    // A full navigation is the point of this case — it proves the ready gate itself.
    await isr.open(ISR_OFFICE);
    expect(await isr.readHeaderNames()).toEqual([...ISR_COLUMNS]);
    // The count number is deliberately not asserted — a bare load may restore a previous
    // search — only that the label renders at all.
    await expect.poll(async () => await isr.readFoundCount(), { timeout: 30_000 }).not.toBeNull();
  });

  test('TC-ISR-PRS-003: An Any Field word returns only matching products', async ({ dependencyGate }) => {
    dependencyGate([]);
    const total = await isr.clickSearchAndWait((n) => n !== null && n > 0);
    await isr.typeAnyField(ISR_SEARCH_WORD);
    const filtered = await isr.clickSearchAndWait((n) => n !== null && n > 0 && n < (total as number));
    expect(filtered as number).toBeGreaterThan(0);
    expect(filtered as number).toBeLessThan(total as number);
    const rows = await isr.page.locator('tbody tr').allTextContents();
    const word = ISR_SEARCH_WORD.toLowerCase();
    for (const row of rows.slice(0, 10)) {
      expect(row.toLowerCase()).toContain(word);
    }
  });

  test('TC-ISR-PRS-006: Grid cells show a tooltip only when their text is cut off', async ({ dependencyGate }) => {
    dependencyGate([]);
    await isr.clickSearchAndWait((n) => n !== null && n > 0);
    const samples = await isr.findTruncationSamples();
    expect(samples.truncated, 'no cut-off cell found on the first page').not.toBeNull();
    expect(samples.fitting, 'no fully-fitting cell found on the first page').not.toBeNull();
    // A cut-off cell shows its full text in a tooltip on hover.
    const truncated = samples.truncated!;
    const tip = await isr.hoverAndReadTooltip(isr.cellAt(truncated.row, truncated.col));
    expect(tip).toContain(truncated.text.slice(0, 30));
    // A fitting cell shows none — sampled repeatedly across the tooltip's open delay.
    // The cut-off cell's tooltip can outlive its hover, so the stage is cleared first;
    // without this the sampler reads the leftover tooltip and blames the fitting cell.
    const fitting = samples.fitting!;
    await isr.waitForTooltipsToClear();
    await isr.cellAt(fitting.row, fitting.col).hover();
    const started = Date.now();
    await expect
      .poll(async () => {
        const tooltips = await isr.page.locator('[role="tooltip"]').count();
        if (tooltips > 0) return 'tooltip appeared';
        return Date.now() - started > 2_000 ? 'stayed clear' : 'still watching';
      }, { timeout: 10_000 })
      .toBe('stayed clear');
  });

  test('TC-ISR-PRS-009: Location and Region clear each other', async ({ dependencyGate }) => {
    dependencyGate([]);
    await isr.selectLocation(ISR_OFFICE_OPTION, ISR_OFFICE);
    expect(await isr.readLocationText()).toContain(ISR_OFFICE);
    // Feeding Region overrides the office — the last one set wins.
    await isr.selectRegion(ISR_REGION_SAMPLE);
    expect(await isr.readRegionText()).toContain(ISR_REGION_SAMPLE);
    expect(await isr.readLocationText()).toBe(ISR_LOCATION_PLACEHOLDER);
    // And back the other way.
    await isr.selectLocation(ISR_OFFICE_OPTION, ISR_OFFICE);
    expect(await isr.readLocationText()).toContain(ISR_OFFICE);
    expect(await isr.readRegionText()).toBe(ISR_REGION_PLACEHOLDER);
    // Reset restores the current office and clears the region.
    await isr.clickReset();
    expect(await isr.readLocationText()).toContain(ISR_OFFICE);
    expect(await isr.readRegionText()).toBe(ISR_REGION_PLACEHOLDER);
  });

  test('TC-ISR-PRS-012: Quantity Greater Than Zero narrows the results', async ({ dependencyGate }) => {
    dependencyGate([]);
    const total = await isr.clickSearchAndWait((n) => n !== null && n > 0);
    await isr.toggleFilter(0);
    expect(await isr.isFilterChecked(0)).toBe(true);
    const narrowed = await isr.clickSearchAndWait((n) => n !== null && n > 0 && n < (total as number));
    expect(narrowed as number).toBeGreaterThan(0);
    expect(narrowed as number).toBeLessThan(total as number);
    // Unchecking brings the unfiltered total back.
    await isr.toggleFilter(0);
    expect(await isr.isFilterChecked(0)).toBe(false);
    const restored = await isr.clickSearchAndWait((n) => n === total);
    expect(restored).toBe(total);
  });

  test('TC-ISR-PRS-013: A barcode with no match shows the empty state', async ({ dependencyGate }) => {
    dependencyGate([]);
    await isr.typeBarcode(ISR_NO_MATCH_BARCODE);
    const none = await isr.clickSearchAndWait((n) => n === 0);
    expect(none).toBe(0);
    await expect(isr.page.getByText('No results')).toBeVisible();
    expect(await isr.readRowCount()).toBe(0);
    // Clearing the barcode brings the full set back.
    await isr.typeBarcode('');
    const restored = await isr.clickSearchAndWait((n) => n !== null && n > 0);
    expect(restored as number).toBeGreaterThan(0);
  });

  test('TC-ISR-PRS-014: Sorting flips through the column menu', async ({ dependencyGate }) => {
    dependencyGate([]);
    await isr.clickSearchAndWait((n) => n !== null && n > 0);
    // Normalize to ascending first — the sort order also persists across visits, so the
    // starting direction is otherwise whatever the previous run left behind.
    await isr.openColumnMenu(ISR_SORT_COLUMN);
    expect(await isr.readOpenMenuItems()).toEqual([...ISR_COLUMN_MENU_ITEMS]);
    await isr.clickMenuItem('Sort ascending');
    const ascendingFirstRow = await isr.readFirstRowText();
    const ascending = (await isr.readColumnValues(ISR_SORT_COLUMN)).filter((v) => v !== '');
    expect(isNonDescending(ascending)).toBe(true);
    // Flip to descending: the page changes and the order reverses.
    await isr.openColumnMenu(ISR_SORT_COLUMN);
    await isr.clickMenuItem('Sort descending');
    await expect.poll(async () => await isr.readFirstRowText(), { timeout: 60_000 }).not.toBe(ascendingFirstRow);
    const descending = (await isr.readColumnValues(ISR_SORT_COLUMN)).filter((v) => v !== '');
    expect(isNonDescending([...descending].reverse())).toBe(true);
    // Restore ascending — the original first row returns.
    await isr.openColumnMenu(ISR_SORT_COLUMN);
    await isr.clickMenuItem('Sort ascending');
    await expect.poll(async () => await isr.readFirstRowText(), { timeout: 60_000 }).toBe(ascendingFirstRow);
  });

  test('TC-ISR-PRS-015: Pagination moves between pages', async ({ dependencyGate }) => {
    dependencyGate([]);
    await isr.clickSearchAndWait((n) => n !== null && n > 0);
    expect(await isr.readPageNumber()).toBe('1');
    expect((await isr.readTotalPages()) ?? 0).toBeGreaterThan(ISR_PAGE_COUNT_FLOOR);
    expect(await isr.isPaginationEnabled('Go to first page')).toBe(false);
    expect(await isr.isPaginationEnabled('Go to previous page')).toBe(false);
    expect(await isr.isPaginationEnabled('Go to next page')).toBe(true);
    const firstRowPage1 = await isr.readFirstRowText();
    await isr.clickPagination('Go to next page');
    await expect.poll(async () => await isr.readPageNumber(), { timeout: 60_000 }).toBe('2');
    expect(await isr.readFirstRowText()).not.toBe(firstRowPage1);
    expect(await isr.isPaginationEnabled('Go to first page')).toBe(true);
    expect(await isr.isPaginationEnabled('Go to previous page')).toBe(true);
    await isr.clickPagination('Go to first page');
    await expect.poll(async () => await isr.readPageNumber(), { timeout: 60_000 }).toBe('1');
    expect(await isr.readFirstRowText()).toBe(firstRowPage1);
  });

  test('TC-ISR-PRS-016: Rows-per-page offers five sizes', async ({ dependencyGate }) => {
    dependencyGate([]);
    await isr.clickSearchAndWait((n) => n !== null && n > 0);
    expect(await isr.readRowsPerPage()).toBe(ISR_DEFAULT_PAGE_SIZE);
    expect(await isr.readRowsPerPageOptions()).toEqual([...ISR_PAGE_SIZES]);
    // Escape closed the list without choosing — the size and the page are unchanged.
    expect(await isr.readRowsPerPage()).toBe(ISR_DEFAULT_PAGE_SIZE);
    // Fifty rows per page is the feature under test here, so the exact count is correct.
    expect(await isr.readRowCount()).toBe(Number(ISR_DEFAULT_PAGE_SIZE));
  });

  test('TC-ISR-PRS-018: An executed search survives leaving and returning', async ({ authenticatedSession, config, dependencyGate }) => {
    dependencyGate([]);
    test.setTimeout(420_000);
    await isr.typeAnyField(ISR_SEARCH_WORD);
    const count = await isr.clickSearchAndWait((n) => n !== null && n > 0);
    // Leave the page entirely, then come back.
    const groups = new ProductGroupsPage(authenticatedSession.page, config);
    await groups.open(ISR_OFFICE);
    await isr.open(ISR_OFFICE);
    // The executed search is restored without clicking Search again.
    expect(await isr.readAnyField()).toBe(ISR_SEARCH_WORD);
    await expect.poll(async () => await isr.readFoundCount(), { timeout: 120_000 }).toBe(count);
    expect(await isr.readRowCount()).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------- field cases

test.describe('Item Search Products search panel — fields @item-search @product-search', () => {
  let isr: ItemSearchPage;

  test.beforeEach(async ({ authenticatedSession, config }) => {
    isr = new ItemSearchPage(authenticatedSession.page, config);
    await isr.ensureCleanSearch(ISR_OFFICE);
  });

  test('TC-ISR-PRS-002: Reset restores the default criteria and empties the results', async ({ dependencyGate }) => {
    dependencyGate([]);
    // Dirty the criteria with a real executed search first.
    await isr.typeAnyField(ISR_SEARCH_WORD);
    await isr.clickSearchAndWait((n) => n !== null && n > 0);
    await isr.clickReset();
    expect(await isr.readAnyField()).toBe('');
    expect(await isr.readBarcode()).toBe('');
    expect(await isr.readRegionText()).toBe(ISR_REGION_PLACEHOLDER);
    expect(await isr.readLocationText()).toContain(ISR_OFFICE);
    expect(await isr.isFilterChecked(0)).toBe(false);
    expect(await isr.isFilterChecked(1)).toBe(true);
    expect(await isr.isKeywordSelected()).toBe(true);
    expect(await isr.readFoundCount()).toBe(0);
    expect(await isr.readRowCount()).toBe(0);
    // The zero state must be the settled response, not a loading gap — keep sampling the
    // count across a twenty-second window and require it to stay at zero throughout.
    const started = Date.now();
    await expect
      .poll(async () => {
        if ((await isr.readFoundCount()) !== 0) return 'results appeared';
        return Date.now() - started > 20_000 ? 'stayed empty' : 'still watching';
      }, { timeout: 60_000 })
      .toBe('stayed empty');
    expect(await isr.readRowCount()).toBe(0);
  });

  test('TC-ISR-PRS-004: Search help opens guidance for the selected search type', async ({ dependencyGate }) => {
    dependencyGate([]);
    await isr.openSearchHelp();
    const text = (await isr.openPopover().textContent()) ?? '';
    expect(text).toContain('Any Field');
    expect(text.toLowerCase()).toContain('category');
    expect(text.toLowerCase()).toContain('product group');
    await isr.closePopover();
    await expect(isr.openPopover()).toBeHidden({ timeout: 5_000 });
  });

  test('TC-ISR-PRS-005: The header icons show their tooltips', async ({ dependencyGate }) => {
    dependencyGate([]);
    expect(await isr.hoverAndReadTooltip(isr.moreInformationButton())).toContain(ISR_TOOLTIP_INFO);
    expect(await isr.hoverAndReadTooltip(isr.collapseButton())).toContain(ISR_TOOLTIP_COLLAPSE);
    expect(await isr.hoverAndReadTooltip(isr.gridOptionsButton())).toContain(ISR_TOOLTIP_GRID_OPTIONS);
  });

  test('TC-ISR-PRS-007: The Location dropdown lists offices', async ({ dependencyGate }) => {
    dependencyGate([]);
    // The office list is data-driven (5,110 entries at the last check) — assert a floor.
    expect(await isr.readLocationOptionCount()).toBeGreaterThan(ISR_LOCATION_LIST_FLOOR);
    expect(await isr.locationListHas(ISR_LOCATION_PLACEHOLDER)).toBe(true);
    expect(await isr.locationListHas(ISR_OFFICE_OPTION)).toBe(true);
    // Escape closed each open list without selecting — the value is unchanged.
    expect(await isr.readLocationText()).toContain(ISR_OFFICE);
  });

  test('TC-ISR-PRS-008: The Region dropdown lists regions', async ({ dependencyGate }) => {
    dependencyGate([]);
    const regions = await isr.readRegionOptions();
    expect(regions.length).toBeGreaterThan(ISR_REGION_LIST_FLOOR);
    expect(regions).toContain(ISR_REGION_SAMPLE);
    expect(regions).toContain(ISR_REGION_PLACEHOLDER);
    expect(await isr.readRegionText()).toBe(ISR_REGION_PLACEHOLDER);
  });

  test('TC-ISR-PRS-010: The Product Organization popover offers the country checklist', async ({ dependencyGate }) => {
    dependencyGate([]);
    const text = await isr.readOrgPopoverText();
    for (const entry of ISR_ORG_ENTRIES) {
      expect(text).toContain(entry);
    }
    // The popover was dismissed without choosing — the field still shows None.
    expect(await isr.readOrgValueText()).toContain('None');
  });

  test('TC-ISR-PRS-011: The date fields open a calendar with a time spinner', async ({ dependencyGate }) => {
    dependencyGate([]);
    // Field-level verification only — the product owner has ruled date-driven behavior
    // is not functional yet, so no case asserts how dates change results.
    const prepBefore = await isr.readDateFieldText('Prep Date Time');
    expect(prepBefore).toContain('12:00 AM');
    expect(await isr.readDateFieldText('Return Date Time')).toContain('11:59 PM');
    await isr.openDatePopover(1);
    const popover = isr.openPopover();
    await expect(popover.locator('[role="grid"]').first()).toBeVisible({ timeout: 5_000 });
    // The time spinner sits below the calendar; some builds expose it as spin buttons,
    // others as plain time text — accept either rendering of the same control.
    if ((await popover.getByRole('spinbutton').count()) === 0) {
      expect((await popover.textContent()) ?? '').toMatch(/AM|PM/);
    }
    await isr.closePopover();
    expect(await isr.readDateFieldText('Prep Date Time')).toBe(prepBefore);
  });

  test('TC-ISR-PRS-017: Grid Options hides and restores a column', async ({ dependencyGate }) => {
    dependencyGate([]);
    await isr.clickSearchAndWait((n) => n !== null && n > 0);
    expect(await isr.readHeaderNames()).toContain(ISR_HIDE_COLUMN);
    await isr.openGridOptions();
    const entries = await isr.readOpenMenuItems();
    expect(entries).toContain('Reset to Default View');
    expect(entries).toContain(ISR_HIDE_COLUMN);
    // The Item column has no entry — it cannot be hidden.
    expect(entries.filter((e) => e === 'Item')).toHaveLength(0);
    expect(await isr.isGridOptionChecked(ISR_HIDE_COLUMN)).toBe(true);
    // Hide the column and prove it left the grid.
    await isr.clickMenuItem(ISR_HIDE_COLUMN);
    await expect.poll(async () => await isr.readHeaderNames(), { timeout: 30_000 }).not.toContain(ISR_HIDE_COLUMN);
    await isr.openGridOptions();
    expect(await isr.isGridOptionChecked(ISR_HIDE_COLUMN)).toBe(false);
    // Restore it.
    await isr.clickMenuItem(ISR_HIDE_COLUMN);
    await expect.poll(async () => await isr.readHeaderNames(), { timeout: 30_000 }).toContain(ISR_HIDE_COLUMN);
  });

  test('TC-ISR-PRS-019: The search panel collapses and expands', async ({ dependencyGate }) => {
    dependencyGate([]);
    // Give the panel a value that must survive the collapse cycle.
    await isr.typeAnyField('zz');
    const input = isr.page.locator('[data-testid="e2e-search-input"]');
    // Collapsing slides the panel up and out of the window rather than removing it,
    // so the proof is the toggle renaming itself and the input leaving the viewport
    // (proven live: the collapsed input keeps a box at a negative height).
    await isr.collapseButton().click();
    await expect(isr.collapseToggleNamed('Expand search panel')).toBeVisible({ timeout: 10_000 });
    await expect(input).not.toBeInViewport({ timeout: 10_000 });
    await isr.collapseButton().click();
    await expect(isr.collapseToggleNamed('Collapse search panel')).toBeVisible({ timeout: 10_000 });
    await expect(input).toBeInViewport({ timeout: 10_000 });
    expect(await isr.readAnyField()).toBe('zz');
    // Drop the typed value so nothing leaks forward (it was never searched).
    await isr.typeAnyField('');
  });
});
