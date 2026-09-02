import { test, expect } from '../../src/fixtures/pages.fixture';
import { ProductGroupsPage } from '../../src/pages/item-search/product-groups.page';
import { ProductCodePage } from '../../src/pages/item-search/product-code.page';
import { ItemSearchPage } from '../../src/pages/item-search/item-search.page';
import {
  ISR_OFFICE,
  ISR_SEARCH_WORD,
  ISR_PGR_SEARCH_WORD,
  ISR_PGR_COLUMNS,
  ISR_PGR_DEFAULT_PAGE_SIZE,
  ISR_ADD_GROUP,
} from '../../src/data/item-search/item-search';

/**
 * Item Search — Product Groups page (NM-2253), office 1101.
 *
 * Shares the Products page's behaviors (skeleton hydration, storage-restored executed
 * searches, no auto-search on load) with two deliberate differences asserted here: an
 * empty-criteria search returns ZERO groups (the Products page returns everything — the
 * inconsistency is flagged for discussion; this suite asserts today's behavior), and the
 * grid turns 20 rows per page instead of 50.
 *
 * The Add page is mostly exercised at field level and exited through Cancel, which
 * discards typed input silently (that behavior is itself a case); one case drives a real
 * create end to end and proves the new group is found again after the list reloads.
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
    expect(await pgr.readHeaderNames()).toEqual([...ISR_PGR_COLUMNS]);
    await expect(pgr.page.getByRole('button', { name: 'Add', exact: true })).toBeVisible();
    // No rows load until a search runs — the box was left empty by the reset above.
    expect(await pgr.readSearch()).toBe('');
    expect(await pgr.readRowCount()).toBe(0);
  });

  test('TC-ISR-PGR-002: A search word returns matching groups', async ({ dependencyGate }) => {
    dependencyGate([]);
    await pgr.typeSearch(ISR_PGR_SEARCH_WORD);
    const count = await pgr.clickSearchAndWait((n) => n !== null && n > 20);
    expect(count as number).toBeGreaterThan(20);
    const names = await pgr.readColumnValues('Name');
    expect(names.length).toBeGreaterThan(0);
    const word = ISR_PGR_SEARCH_WORD.toLowerCase();
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
    await pgr.typeSearch(ISR_PGR_SEARCH_WORD);
    const count = await pgr.clickSearchAndWait((n) => n !== null && n > 20);
    expect(count as number).toBeGreaterThan(20);
    // Twenty rows per page is this page's size — the exact count is the feature here.
    expect(await pgr.readRowsPerPage()).toBe(ISR_PGR_DEFAULT_PAGE_SIZE);
    expect(await pgr.readRowCount()).toBe(Number(ISR_PGR_DEFAULT_PAGE_SIZE));
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
    await pgr.typeSearch(ISR_PGR_SEARCH_WORD);
    const count = await pgr.clickSearchAndWait((n) => n !== null && n > 0);
    // Leave the page entirely, then come back.
    const products = new ItemSearchPage(authenticatedSession.page, config);
    await products.open(ISR_OFFICE);
    await pgr.open(ISR_OFFICE);
    // The executed search is restored without clicking Search again.
    expect(await pgr.readSearch()).toBe(ISR_PGR_SEARCH_WORD);
    await expect.poll(async () => await pgr.readFoundCount(), { timeout: 120_000 }).toBe(count);
    expect(await pgr.readRowCount()).toBeGreaterThan(0);
  });

  test('TC-ISR-PGR-010: Result rows show their status', async ({ dependencyGate }) => {
    dependencyGate([]);
    // The Active filter is checked (the reset keeps it on), so every row renders Active.
    expect(await pgr.isActiveChecked()).toBe(true);
    await pgr.typeSearch(ISR_PGR_SEARCH_WORD);
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

test.describe('Item Search Product Groups panel and Add page — fields @item-search @product-groups', () => {
  let pgr: ProductGroupsPage;

  test.beforeEach(async ({ authenticatedSession, config }) => {
    pgr = new ProductGroupsPage(authenticatedSession.page, config);
    await pgr.ensureCleanSearch(ISR_OFFICE);
  });

  test('TC-ISR-PGR-005: Reset clears the search and keeps the Active filter', async ({ dependencyGate }) => {
    dependencyGate([]);
    await pgr.typeSearch(ISR_PGR_SEARCH_WORD);
    await pgr.clickSearchAndWait((n) => n !== null && n > 0);
    await pgr.clickReset();
    expect(await pgr.readSearch()).toBe('');
    expect(await pgr.readFoundCount()).toBe(0);
    expect(await pgr.readRowCount()).toBe(0);
    expect(await pgr.isActiveChecked()).toBe(true);
  });

  test('TC-ISR-PGR-006: The Add page opens with a held-back Save', async ({ dependencyGate }) => {
    dependencyGate([]);
    await pgr.clickAdd();
    expect(await pgr.addNameBox().inputValue()).toBe('');
    expect(await pgr.addDescriptionBox().inputValue()).toBe('');
    expect(await pgr.isAddActiveChecked()).toBe(true);
    await expect(pgr.addCancelButton()).toBeEnabled();
    expect(await pgr.isAddSaveEnabled()).toBe(false);
    // A name alone does not complete the required set — Save stays held back.
    await pgr.typeAddName('X');
    expect(await pgr.isAddSaveEnabled()).toBe(false);
    // Leave through Cancel so the typed character is discarded.
    await pgr.clickAddCancel();
  });

  test('TC-ISR-PGR-007: The sub-class picker shows its two panels', async ({ dependencyGate }) => {
    dependencyGate([]);
    await pgr.clickAdd();
    const text = await pgr.readAddPageText();
    expect(text).toContain('Sub Classes');
    // The live instruction uses non-breaking hyphens ("double‑click", "sub‑classes"),
    // so the check is hyphen-agnostic rather than a literal string compare.
    expect(text).toMatch(/Drag or double.click items from the left to add sub.classes/);
    // Structure only at this depth: the left panel offers its own search plus the form's
    // two text boxes.
    expect(await pgr.page.getByRole('textbox').count()).toBeGreaterThanOrEqual(3);
    await pgr.clickAddCancel();
  });

  test('TC-ISR-PGR-008: Cancel leaves the Add page without saving', async ({ dependencyGate }) => {
    dependencyGate([]);
    await pgr.clickAdd();
    await pgr.typeAddName('X');
    await pgr.clickAddCancel();
    // The list page returned with no warning prompt about the typed input.
    expect(await pgr.page.locator('[role="alertdialog"]').count()).toBe(0);
    await pgr.clickAdd();
    expect(await pgr.addNameBox().inputValue()).toBe('');
    await pgr.clickAddCancel();
  });

  test('TC-ISR-PGR-011: A completed Add page saves and the new group is found again', async ({ dependencyGate }) => {
    dependencyGate([]);
    test.setTimeout(420_000);
    // A per-run unique suffix so repeated runs never collide on the same name.
    const unique = Date.now();
    const name = `${ISR_ADD_GROUP.namePrefix} ${unique}`;
    const description = `${ISR_ADD_GROUP.descriptionPrefix} ${unique}`;
    await pgr.clickAdd();
    await pgr.typeAddName(name);
    await pgr.typeAddDescription(description);
    await pgr.selectServiceType(ISR_ADD_GROUP.serviceType);
    // A group needs at least one sub-class; the first available item is added by
    // double-click (the reliable path — drag frequently never fires the drop).
    await pgr.addFirstSubClass();
    expect(await pgr.isAddSaveEnabled()).toBe(true);
    await pgr.saveNewGroupAndConfirm();
    // The save call is never the proof — reset the list and search the new name back
    // after the grid reloads.
    await pgr.ensureCleanSearch(ISR_OFFICE);
    await pgr.typeSearch(name);
    expect(await pgr.clickSearchAndWait((n) => n === 1)).toBe(1);
    expect(await pgr.readColumnValues('Name')).toEqual([name]);
    expect(await pgr.readColumnValues('Service Type')).toEqual([ISR_ADD_GROUP.serviceType]);
    // The group is created active, and the list's Active filter is on, so it shows Active.
    expect(await pgr.readColumnValues('Status')).toEqual(['Active']);
  });
});
