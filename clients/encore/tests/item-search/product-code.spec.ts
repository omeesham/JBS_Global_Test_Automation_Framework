import { test, expect } from '../../src/fixtures/pages.fixture';
import { ProductCodePage } from '../../src/pages/item-search/product-code.page';
import {
  ISR_OFFICE,
  ISR_SEARCH_WORD,
  ISR_DIALOG_TABS,
  ISR_SEGMENTS,
  ISR_PRODUCT_TYPES,
  ISR_LABOR_SERVICE_SAMPLES,
  ISR_TRANSLATION_LANGUAGES,
  ISR_HISTORY_COLUMN_SAMPLES,
  ISR_ADD_CODE,
} from '../../src/data/item-search/item-search';

/**
 * Item Search — product-code layer (NM-2253): the row-selection toolbar and the
 * "Product Code Details" dialogs, office 1101.
 *
 * Everything here is read/field-level by design: Save is never clicked, and closing a
 * dialog discards edits silently (the app has no unsaved-changes prompt — that actual
 * behavior is itself asserted). The toolbar mounts only with a selected row, so every
 * test runs a search and selects the first row itself; assertions are structural
 * (sections, tabs, states), never bound to a specific product's values.
 *
 * All five view-menu segment entries rescope the dialog. An earlier suspicion that the
 * Category entry was inert did not survive live re-verification (the click had never
 * landed); the segment case samples Sub Category, Class and Category to prove the
 * rescope from both ends of the menu.
 */
test.describe.configure({ timeout: 300_000 });

test.describe('Item Search Product Code dialogs @item-search @product-code', () => {
  let pc: ProductCodePage;

  test.beforeEach(async ({ authenticatedSession, config }) => {
    pc = new ProductCodePage(authenticatedSession.page, config);
    await pc.ensureCleanSearch(ISR_OFFICE);
  });

  /** Runs a word search and selects the first row — the toolbar precondition. */
  const searchAndSelect = async (): Promise<void> => {
    await pc.typeAnyField(ISR_SEARCH_WORD);
    await pc.clickSearchAndWait((n) => n !== null && n > 0);
    await pc.selectFirstRow();
  };

  test('TC-ISR-PCD-001: Selecting a row reveals the product-code toolbar', async ({ dependencyGate }) => {
    dependencyGate([]);
    // This case honors its stated precondition: a default (empty-criteria) search.
    await pc.clickSearchAndWait((n) => n !== null && n > 0);
    await pc.selectFirstRow();
    await expect(pc.viewProductCodeButton()).toBeVisible();
    await expect(pc.addProductCodeButton()).toBeVisible();
    await expect(pc.viewAvailabilityButton()).toBeVisible();
    await expect(pc.productGroupButton()).toBeVisible();
    await expect(pc.gridOptionsButton()).toBeVisible();
    // Both split buttons carry their segment-menu arrows.
    await expect(pc.page.locator('div:has(> button:text-is("View Product Code")) > button[aria-haspopup="menu"]')).toBeVisible();
    await expect(pc.page.locator('div:has(> button:text-is("Add Product Code")) > button[aria-haspopup="menu"]')).toBeVisible();
  });

  test('TC-ISR-PCD-002: View Product Code opens the details dialog on the Item tab', async ({ dependencyGate }) => {
    dependencyGate([]);
    await searchAndSelect();
    const rowsBefore = await pc.readRowCount();
    await pc.openViewDialog();
    expect(await pc.readDialogTabs()).toEqual([...ISR_DIALOG_TABS]);
    expect(await pc.readActiveTab()).toBe('Item');
    const text = await pc.readDialogText();
    for (const section of ['Category', 'Sub Category', 'Class', 'Sub Class', 'Item']) {
      expect(text).toContain(section);
    }
    expect(text).toContain('Product Code ID');
    // The name box holds the selected product's text — read-only pass, nothing typed.
    expect((await pc.dialogNameBox().inputValue()).length).toBeGreaterThan(0);
    expect(await pc.isDialogSaveEnabled()).toBe(false);
    await pc.closeDialog();
    expect(await pc.readRowCount()).toBe(rowsBefore);
  });

  test('TC-ISR-PCD-003: The History tab shows the audit grid', async ({ dependencyGate }) => {
    dependencyGate([]);
    await searchAndSelect();
    await pc.openViewDialog();
    await pc.clickDialogTab('Product Code History');
    expect(await pc.readActiveTab()).toBe('Product Code History');
    // The audit grid fetches after the tab renders its chrome — its own header row
    // appearing is the readiness proof (the pagination cluster paints well before it).
    await expect(pc.dialog().locator('thead th').first()).toBeVisible({ timeout: 60_000 });
    const text = await pc.readDialogText();
    for (const column of ISR_HISTORY_COLUMN_SAMPLES) {
      expect(text).toContain(column);
    }
    // The tab carries its own Grid Options control, separate from the page's.
    await expect(pc.dialog().getByRole('button', { name: 'Grid Options' })).toBeVisible();
    await pc.closeDialog();
  });

  test('TC-ISR-PCD-004: The Translations tab lists four editable languages', async ({ dependencyGate }) => {
    dependencyGate([]);
    await searchAndSelect();
    await pc.openViewDialog();
    await pc.clickDialogTab('Translations');
    const text = await pc.readDialogText();
    expect(text).toContain('Translations for Item');
    for (const language of ISR_TRANSLATION_LANGUAGES) {
      expect(text).toContain(language);
    }
    // Four language rows, each with an editable Name and Description box.
    expect(await pc.dialog().getByRole('textbox').count()).toBeGreaterThanOrEqual(8);
    await pc.closeDialog();
  });

  test('TC-ISR-PCD-005: The View segment menu rescopes the dialog', async ({ dependencyGate }) => {
    dependencyGate([]);
    await searchAndSelect();
    await pc.openViewSegmentMenu();
    expect(await pc.readOpenMenuItems()).toEqual([...ISR_SEGMENTS]);
    await pc.chooseSegment('Sub Category');
    expect(await pc.readActiveTab()).toBe('Sub Category');
    await pc.closeDialog();
    await pc.openViewSegmentMenu();
    await pc.chooseSegment('Class');
    expect(await pc.readActiveTab()).toBe('Class');
    await pc.closeDialog();
    await pc.openViewSegmentMenu();
    await pc.chooseSegment('Category');
    expect(await pc.readActiveTab()).toBe('Category');
    await pc.closeDialog();
    expect(await pc.readRowCount()).toBeGreaterThan(0);
  });

  test('TC-ISR-PCD-006: Add Product Code opens a required-empty form with Save held back', async ({ dependencyGate }) => {
    dependencyGate([]);
    await searchAndSelect();
    await pc.openAddDialog();
    // The add flow opens a single tab scoped to Item.
    const tabs = await pc.readDialogTabs();
    expect(tabs).toEqual(['Item']);
    expect(await pc.dialogNameBox().inputValue()).toBe('');
    // The paired type selectors rest on their placeholders, service locked until a type
    // is chosen.
    await expect(pc.productTypeCombo()).toBeVisible();
    expect(await pc.isServiceTypeEnabled()).toBe(false);
    expect(await pc.isDialogSaveEnabled()).toBe(false);
    await pc.closeDialog();
  });

  test('TC-ISR-PCD-007: Choosing a Product Type unlocks and filters Service Type', async ({ dependencyGate }) => {
    dependencyGate([]);
    await searchAndSelect();
    await pc.openAddDialog();
    // The ten types are a fixed set but their rendered order shifted between two live
    // reads a day apart — membership is the contract, so the compare is sort-agnostic.
    const offered = await pc.readProductTypeOptions();
    expect([...offered].sort()).toEqual([...ISR_PRODUCT_TYPES].sort());
    await pc.chooseProductType('LABOR');
    await expect.poll(async () => await pc.isServiceTypeEnabled(), { timeout: 15_000 }).toBe(true);
    const services = await pc.readServiceTypeOptions();
    expect(services.length).toBeGreaterThanOrEqual(10);
    for (const sample of ISR_LABOR_SERVICE_SAMPLES) {
      expect(services).toContain(sample);
    }
    await pc.closeDialog();
  });

  test('TC-ISR-PCD-008: The Add segment menu opens per-segment forms', async ({ dependencyGate }) => {
    dependencyGate([]);
    await searchAndSelect();
    await pc.openAddSegmentMenu();
    expect(await pc.readOpenMenuItems()).toEqual([...ISR_SEGMENTS]);
    // Category works on the add side — its single tab renames to the segment.
    await pc.chooseSegment('Category');
    expect(await pc.readActiveTab()).toBe('Category');
    await pc.closeDialog();
    expect(await pc.readRowCount()).toBeGreaterThan(0);
  });

  test('TC-ISR-PCD-009: Closing a dialog with edits discards them silently', async ({ dependencyGate }) => {
    dependencyGate([]);
    await searchAndSelect();
    // Edit the view dialog's name, close, reopen — the edit is gone and no prompt fired.
    await pc.openViewDialog();
    const original = await pc.dialogNameBox().inputValue();
    await pc.dialogNameBox().fill(`${original}X`);
    expect(await pc.dialogNameBox().inputValue()).toBe(`${original}X`);
    await pc.closeDialog();
    expect(await pc.page.locator('[role="alertdialog"]').count()).toBe(0);
    await pc.openViewDialog();
    expect(await pc.dialogNameBox().inputValue()).toBe(original);
    await pc.closeDialog();
    // Same silent discard on the add dialog with a chosen type.
    await pc.openAddDialog();
    await pc.readProductTypeOptions();
    await pc.chooseProductType('EQUIPMENT');
    await pc.closeDialog();
    expect(await pc.page.locator('[role="alertdialog"]').count()).toBe(0);
  });

  test('TC-ISR-PCD-010: View Availability is present and enabled with a row selected', async ({ dependencyGate }) => {
    dependencyGate([]);
    await searchAndSelect();
    // Presence check only, deliberately: availability is driven by the date fields, and
    // the product owner has ruled dates are not functional yet. Replace this case with
    // real availability behavior cases when dates go live.
    await expect(pc.viewAvailabilityButton()).toBeVisible();
    await expect(pc.viewAvailabilityButton()).toBeEnabled();
  });

  test('TC-ISR-PCD-011: A completed Add Product Code form saves and the new code is found again', async ({ dependencyGate }) => {
    dependencyGate([]);
    await searchAndSelect();
    // A per-run unique suffix so repeated runs never collide on the same name.
    const unique = Date.now();
    const name = `${ISR_ADD_CODE.namePrefix} ${unique}`;
    const description = `${ISR_ADD_CODE.descriptionPrefix} ${unique}`;
    await pc.openAddDialog();
    await pc.fillAddForm({
      name,
      description,
      productType: ISR_ADD_CODE.productType,
      serviceType: ISR_ADD_CODE.serviceType,
    });
    await pc.saveNewCodeAndConfirm();
    // The save call is never the proof — reset the search and look the new code up again
    // after the grid reloads. The code's name is what lands in the Item column.
    await pc.ensureCleanSearch(ISR_OFFICE);
    await pc.typeAnyField(name);
    expect(await pc.clickSearchAndWait((n) => n === 1)).toBe(1);
    expect(await pc.readColumnValues('Item')).toEqual([name]);
  });
});
