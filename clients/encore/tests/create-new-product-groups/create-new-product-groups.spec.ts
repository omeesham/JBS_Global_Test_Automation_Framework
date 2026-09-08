import { test, expect } from '../../src/fixtures/pages.fixture';
import { ProductGroupsPage } from '../../src/pages/product-groups/product-groups.page';
import { ISR_OFFICE } from '../../src/data/item-search/item-search';
import { PGR_ADD_GROUP } from '../../src/data/product-groups/product-groups';

/**
 * Create new Product Groups (NM-2259) — the Add Product Group page on office 1101.
 *
 * The Add page is a route, not a dialog, reached from the Add button on the group list
 * page (the list page itself is the sibling sub-task NM-2258, in
 * `tests/search-for-product-groups/`).
 *
 * Three cases exercise the page at field level and leave through Cancel, which discards
 * typed input silently — that behavior is itself a case. The fourth drives a real create
 * end to end and proves the new group is found again after the list reloads; the save
 * call is never the proof, the search-back is.
 */
test.describe.configure({ timeout: 300_000 });

test.describe('Item Search Add Product Group page — fields and create @item-search @product-groups', () => {
  let pgr: ProductGroupsPage;

  test.beforeEach(async ({ authenticatedSession, config }) => {
    pgr = new ProductGroupsPage(authenticatedSession.page, config);
    await pgr.ensureCleanSearch(ISR_OFFICE);
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
    const name = `${PGR_ADD_GROUP.namePrefix} ${unique}`;
    const description = `${PGR_ADD_GROUP.descriptionPrefix} ${unique}`;
    await pgr.clickAdd();
    await pgr.typeAddName(name);
    await pgr.typeAddDescription(description);
    await pgr.selectServiceType(PGR_ADD_GROUP.serviceType);
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
    expect(await pgr.readColumnValues('Service Type')).toEqual([PGR_ADD_GROUP.serviceType]);
    // The group is created active, and the list's Active filter is on, so it shows Active.
    expect(await pgr.readColumnValues('Status')).toEqual(['Active']);
  });
});
