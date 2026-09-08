import { test, expect } from '../../src/fixtures/pages.fixture';
import { ProductGroupsPage } from '../../src/pages/product-groups/product-groups.page';
import { ProductCodePage } from '../../src/pages/item-search/product-code.page';
import { ItemSearchPage } from '../../src/pages/item-search/item-search.page';
import { ISR_OFFICE, ISR_SEARCH_WORD } from '../../src/data/item-search/item-search';
import {
  PGR_SEARCH_WORD,
  PGR_COLUMNS,
  PGR_DEFAULT_PAGE_SIZE,
} from '../../src/data/product-groups/product-groups';

/**
 * Search For Product Groups (NM-2258) — the Product Groups list page on office 1101.
 *
 * Covers arriving at the page, running a group search, the empty-search and pagination
 * contracts, Reset, search persistence across navigation, and the status column. The
 * create flow behind the page's Add button is the sibling sub-task NM-2259 and lives in
 * `tests/create-new-product-groups/`.
 *
 * Shares the Products page's behaviors (skeleton hydration, storage-restored executed
 * searches, no auto-search on load) with two deliberate differences asserted here: an
 * empty-criteria search returns ZERO groups (the Products page returns everything — the
 * inconsistency is flagged for discussion; this suite asserts today's behavior), and the
 * grid turns 20 rows per page instead of 50.
 */
test.describe.configure({ timeout: 300_000 });

// ---------------------------------------------------------------------------- surface cases

test.describe('SBC — Item Search Product Groups surface behaviors @item-search @product-groups', () => {
  let pgr: ProductGroupsPage;

  test.beforeEach(async ({ authenticatedSession, config }) => {
    pgr = new ProductGroupsPage(authenticatedSession.page, config);
    await pgr.ensureCleanSearch(ISR_OFFICE);
  });

  test('TC-ISR-PGR-001: The Product Groups page loads without auto-searching', async ({ authenticatedSession, config, dependencyGate }) => {
    dependencyGate([]);
    test.setTimeout(420_000);
    // The covered entry is the in-app route: a selected row's toolbar on the Products
    // page. The beforeEach already reset THIS page, so the arrival state is clean.
    const products = new ProductCodePage(authenticatedSession.page, config);
    await products.ensureCleanSearch(ISR_OFFICE);
    await products.typeAnyField(ISR_SEARCH_WORD);
    await products.clickSearchAndWait((n) => n !== null && n > 0);
    await products.selectFirstRow();
    await products.productGroupButton().click();
    await pgr.waitForReady();
    expect(await pgr.readHeaderNames()).toEqual([...PGR_COLUMNS]);
    await expect(pgr.page.getByRole('button', { name: 'Add', exact: true })).toBeVisible();
    // No rows load until a search runs — the box was left empty by the reset above.
    expect(await pgr.readSearch()).toBe('');
    expect(await pgr.readRowCount()).toBe(0);
  });

  test('TC-ISR-PGR-002: A search word returns matching groups', async ({ dependencyGate }) => {
    dependencyGate([]);
    await pgr.typeSearch(PGR_SEARCH_WORD);
    const count = await pgr.clickSearchAndWait((n) => n !== null && n > 20);
    expect(count as number).toBeGreaterThan(20);
    const names = await pgr.readColumnValues('Name');
    expect(names.length).toBeGreaterThan(0);
    const word = PGR_SEARCH_WORD.toLowerCase();
    for (const name of names) {
      expect(name.toLowerCase()).toContain(word);
    }
  });

  test('TC-ISR-PGR-003: Searching with an empty box returns zero groups', async ({ dependencyGate }) => {
    dependencyGate([]);
    // Deliberately different from the Products page, where an empty search returns the
    // full set. The inconsistency is flagged for discussion with the product team; this
    // case asserts today's actual behavior and should be revisited if the rule changes.
    const count = await pgr.clickSearchAndWait((n) => n === 0);
    expect(count).toBe(0);
    expect(await pgr.readRowCount()).toBe(0);
    // The zero must be the settled response, not a loading gap — sample the count across
    // a twenty-second window and require it to stay at zero throughout.
    const started = Date.now();
    await expect
      .poll(async () => {
        if ((await pgr.readFoundCount()) !== 0) return 'results appeared';
        return Date.now() - started > 20_000 ? 'stayed empty' : 'still watching';
      }, { timeout: 60_000 })
      .toBe('stayed empty');
    expect(await pgr.readRowCount()).toBe(0);
  });

  test('TC-ISR-PGR-004: Pagination pages through at twenty rows', async ({ dependencyGate }) => {
    dependencyGate([]);
    await pgr.typeSearch(PGR_SEARCH_WORD);
    const count = await pgr.clickSearchAndWait((n) => n !== null && n > 20);
    expect(count as number).toBeGreaterThan(20);
    // Twenty rows per page is this page's size — the exact count is the feature here.
    expect(await pgr.readRowsPerPage()).toBe(PGR_DEFAULT_PAGE_SIZE);
    expect(await pgr.readRowCount()).toBe(Number(PGR_DEFAULT_PAGE_SIZE));
    expect(await pgr.readPageNumber()).toBe('1');
    expect(await pgr.isPaginationEnabled('Go to first page')).toBe(false);
    expect(await pgr.isPaginationEnabled('Go to previous page')).toBe(false);
    const firstRowPage1 = await pgr.readFirstRowText();
    await pgr.clickPagination('Go to next page');
    await expect.poll(async () => await pgr.readPageNumber(), { timeout: 60_000 }).toBe('2');
    expect(await pgr.readFirstRowText()).not.toBe(firstRowPage1);
    expect(await pgr.isPaginationEnabled('Go to first page')).toBe(true);
    expect(await pgr.isPaginationEnabled('Go to previous page')).toBe(true);
    await pgr.clickPagination('Go to first page');
    await expect.poll(async () => await pgr.readPageNumber(), { timeout: 60_000 }).toBe('1');
    expect(await pgr.readFirstRowText()).toBe(firstRowPage1);
  });

  test('TC-ISR-PGR-009: An executed group search survives leaving and returning', async ({ authenticatedSession, config, dependencyGate }) => {
    dependencyGate([]);
    test.setTimeout(420_000);
    await pgr.typeSearch(PGR_SEARCH_WORD);
    const count = await pgr.clickSearchAndWait((n) => n !== null && n > 0);
    // Leave the page entirely, then come back.
    const products = new ItemSearchPage(authenticatedSession.page, config);
    await products.open(ISR_OFFICE);
    await pgr.open(ISR_OFFICE);
    // The executed search is restored without clicking Search again.
    expect(await pgr.readSearch()).toBe(PGR_SEARCH_WORD);
    await expect.poll(async () => await pgr.readFoundCount(), { timeout: 120_000 }).toBe(count);
    expect(await pgr.readRowCount()).toBeGreaterThan(0);
  });

  test('TC-ISR-PGR-010: Result rows show their status', async ({ dependencyGate }) => {
    dependencyGate([]);
    // The Active filter is checked (the reset keeps it on), so every row renders Active.
    expect(await pgr.isActiveChecked()).toBe(true);
    await pgr.typeSearch(PGR_SEARCH_WORD);
    await pgr.clickSearchAndWait((n) => n !== null && n > 0);
    const statuses = await pgr.readColumnValues('Status');
    expect(statuses.length).toBeGreaterThan(0);
    for (const status of statuses) {
      expect(status).toBe('Active');
    }
    const serviceTypes = await pgr.readColumnValues('Service Type');
    for (const serviceType of serviceTypes) {
      expect(serviceType.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------- field cases

test.describe('Item Search Product Groups search panel — fields @item-search @product-groups', () => {
  let pgr: ProductGroupsPage;

  test.beforeEach(async ({ authenticatedSession, config }) => {
    pgr = new ProductGroupsPage(authenticatedSession.page, config);
    await pgr.ensureCleanSearch(ISR_OFFICE);
  });

  test('TC-ISR-PGR-005: Reset clears the search and keeps the Active filter', async ({ dependencyGate }) => {
    dependencyGate([]);
    await pgr.typeSearch(PGR_SEARCH_WORD);
    await pgr.clickSearchAndWait((n) => n !== null && n > 0);
    await pgr.clickReset();
    expect(await pgr.readSearch()).toBe('');
    expect(await pgr.readFoundCount()).toBe(0);
    expect(await pgr.readRowCount()).toBe(0);
    expect(await pgr.isActiveChecked()).toBe(true);
  });
});
