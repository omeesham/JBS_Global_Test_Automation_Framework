import { Locator, expect } from '@playwright/test';
import { step } from '../../fixtures/step-decorator';
import { ProductsGridBasePage } from '../products/products-grid.page';
import { itemSearchProductGroups as S } from '../../selectors/product-groups/product-groups';
import { ISR_OFFICE } from '../../data/products/products';
import { PGR_ROUTE } from '../../data/product-groups/product-groups';

/**
 * Product Groups page — search panel, 4-column grid at a 20-row page size, and the
 * Add Product Group PAGE (a route, not a dialog).
 *
 * Shares the Products page's storage persistence: an EXECUTED search is restored on
 * return; typed-but-unsearched text is dropped. An empty-criteria search returns ZERO
 * groups here (unlike the Products page's return-all) — asserted as live behavior.
 * Serves both Product Groups sub-tasks: the list/search page (NM-2258) and the Add page
 * reached from its Add button (NM-2259), which is driven through a real save.
 */
export class ProductGroupsPage extends ProductsGridBasePage {
  /** The count label this grid renders after any Search or Reset. */
  protected static readonly COUNT_PATTERN = /([\d,]+)\s+product groups?\s+found/;

  // ---------------------------------------------------------------- navigation & readiness

  /** Navigates to the Product Groups page and waits for hydration. */
  @step('Open the Product Groups page')
  async open(office: string = ISR_OFFICE): Promise<void> {
    const baseUrl = (this.config?.base_url ?? '').replace(/\/+$/, '');
    await this.safeNavigateTo(`${baseUrl}${PGR_ROUTE(office)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 120_000,
    });
    await this.waitForReady();
  }

  /** Hydration gate: skeletons gone AND the group search box present. */
  @step('Wait for the group search panel to be ready')
  async waitForReady(): Promise<void> {
    await this.waitForNoSkeletons();
    await expect(this.searchBox()).toBeVisible({ timeout: 30_000 });
  }

  /**
   * Per-test baseline: page open, hydrated, and reset — the box empty and the count at
   * zero. Reset is the reliable route because executed searches are restored on return.
   */
  @step('Reset the group search')
  async ensureCleanSearch(office: string = ISR_OFFICE): Promise<void> {
    // Path-end compare: the Add page's address CONTAINS this page's path, so a substring
    // check would mistake a stranded Add page for the list and hang on its search box.
    const onPage = new URL(this.page.url()).pathname.endsWith(PGR_ROUTE(office));
    if (!onPage) {
      await this.open(office);
    } else {
      await this.waitForReady();
    }
    await this.clickReset();
    // Reset leaves the Active filter as it was, and a case that searched for inactive groups
    // would otherwise hand the next case a filter that hides the groups it creates.
    await this.setActiveFilter(true);
  }

  /** Sets the list's Active filter — checked shows active groups only, cleared shows inactive only. */
  @step('Set the Active filter')
  async setActiveFilter(checked: boolean): Promise<void> {
    if ((await this.isActiveChecked()) !== checked) {
      await this.page.locator(S.chkActive).first().click();
    }
    await expect.poll(() => this.isActiveChecked(), { timeout: 5_000 }).toBe(checked);
  }

  // ---------------------------------------------------------------- search panel

  searchBox(): Locator {
    return this.page.getByPlaceholder(S.PLACEHOLDER_SEARCH);
  }

  /** Types a word into the group search box. */
  @step('Type a word into the group search box')
  async typeSearch(word: string): Promise<void> {
    await this.typeByKeys(this.searchBox(), word);
  }

  /** The group search box's current value. */
  @step('Read the group search box')
  async readSearch(): Promise<string> {
    return this.searchBox().inputValue();
  }

  /** Whether the Active filter checkbox is checked. */
  @step('Read the Active filter state')
  async isActiveChecked(): Promise<boolean> {
    const el = this.page.locator(S.chkActive).first();
    const aria = await el.getAttribute('aria-checked');
    if (aria !== null) return aria === 'true';
    return (await el.getAttribute('data-state')) === 'checked';
  }

  /** Clicks Search and waits for the count label to satisfy the predicate. */
  @step('Run the group search')
  async clickSearchAndWait(predicate: (n: number | null) => boolean = (n) => n !== null): Promise<number | null> {
    await this.page.getByRole('button', { name: S.TEXT_SEARCH, exact: true }).click();
    await this.waitForNoSkeletons();
    return this.waitForCount(ProductGroupsPage.COUNT_PATTERN, predicate);
  }

  /** Clicks Reset and waits for the settled zero state. */
  @step('Reset the group search criteria')
  async clickReset(): Promise<void> {
    await this.page.getByRole('button', { name: S.TEXT_RESET, exact: true }).click();
    await this.waitForCount(ProductGroupsPage.COUNT_PATTERN, (n) => n === 0);
    await expect(this.page.locator('tbody tr')).toHaveCount(0, { timeout: 15_000 });
  }

  /** The number in the "N product groups found" label, or null while none is rendered. */
  @step('Read the groups count')
  async readFoundCount(): Promise<number | null> {
    return this.readCountByPattern(ProductGroupsPage.COUNT_PATTERN);
  }

  // ---------------------------------------------------------------- add page

  /** Clicks Add and waits for the Add Product Group page to render its form. */
  @step('Open the Add Product Group page')
  async clickAdd(): Promise<void> {
    await this.page.getByRole('button', { name: S.TEXT_ADD, exact: true }).click();
    await expect(this.addNameBox()).toBeVisible({ timeout: 30_000 });
    await this.waitForNoSkeletons();
  }

  addNameBox(): Locator {
    return this.page.getByPlaceholder(S.PLACEHOLDER_ADD_NAME);
  }

  addDescriptionBox(): Locator {
    return this.page.getByPlaceholder(S.PLACEHOLDER_ADD_DESC);
  }

  addSaveButton(): Locator {
    return this.page.getByRole('button', { name: S.TEXT_SAVE, exact: true });
  }

  addCancelButton(): Locator {
    return this.page.getByRole('button', { name: S.TEXT_CANCEL, exact: true });
  }

  /** Types into the Add page's Name box. */
  @step('Type into the group Name box')
  async typeAddName(value: string): Promise<void> {
    await this.typeByKeys(this.addNameBox(), value);
  }

  /**
   * Whether the Add page's Active checkbox is checked. The sub-class picker's rows carry
   * their own checkboxes and render before the form, so the form's Active is the LAST
   * checkbox on the page (structure read live).
   */
  @step('Read the Add page Active state')
  async isAddActiveChecked(): Promise<boolean> {
    const el = this.page.getByRole('checkbox').last();
    const aria = await el.getAttribute('aria-checked');
    if (aria !== null) return aria === 'true';
    return (await el.getAttribute('data-state')) === 'checked';
  }

  /** Whether the Add page's Save is enabled. */
  @step('Read the Add page Save state')
  async isAddSaveEnabled(): Promise<boolean> {
    return this.addSaveButton().isEnabled().catch(() => false);
  }

  /** Clicks Cancel on the Add page and waits for the list page to return. */
  @step('Cancel out of the Add page')
  async clickAddCancel(): Promise<void> {
    await this.addCancelButton().click();
    await this.waitForReady();
  }

  /** Full text of the Add page's form area, read in one call for structure assertions. */
  @step('Read the Add page form')
  async readAddPageText(): Promise<string> {
    return this.page.evaluate(() => document.body.innerText);
  }

  // ---------------------------------------------------------------- add-page save flow

  /** Types into the Add page's Description box. */
  @step('Type into the group Description box')
  async typeAddDescription(value: string): Promise<void> {
    await this.typeByKeys(this.addDescriptionBox(), value);
  }

  /**
   * The required Service Type selector. Anchored on the control itself rather than on its
   * placeholder text, which disappears the moment a value is chosen.
   */
  private serviceTypeCombo(): Locator {
    return this.page.locator(S.addServiceTypeCombo);
  }

  /** Opens the Service Type list and chooses a service. */
  @step('Choose a Service Type')
  async selectServiceType(name: string): Promise<void> {
    await this.serviceTypeCombo().click();
    const listbox = this.page.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible', timeout: 5_000 });
    await this.page.getByRole('option', { name, exact: true }).click();
    await listbox.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
    await this.waitForAngularStable(5_000).catch(() => {});
  }

  /**
   * Adds the first available sub-class to the group and returns its label. Double-click
   * moves the item into the group's Sub Classes — the reliable path the picker offers;
   * drag is flaky and frequently never fires the drop.
   */
  @step('Add the first available sub-class')
  async addFirstSubClass(): Promise<string> {
    const first = this.page.locator(S.subClassItem).first();
    await first.waitFor({ state: 'visible', timeout: 10_000 });
    const label = ((await first.textContent()) ?? '').trim();
    await first.dblclick();
    await this.waitForAngularStable(5_000).catch(() => {});
    return label;
  }

  /**
   * Saves the completed Add page and confirms the create landed: Save must be enabled, the
   * create request must return success, the confirmation toast must appear, and the page
   * must return to the group list. The create response is never treated as proof on its own —
   * persistence is proven by the caller searching the new group's name back.
   */
  @step('Save the new group and confirm it was created')
  async saveNewGroupAndConfirm(): Promise<void> {
    const save = this.addSaveButton();
    await expect(save, 'Save should be enabled once the required fields are set')
      .toBeEnabled({ timeout: 10_000 });
    const created = this.page.waitForResponse(
      (r) => r.url().includes(S.CREATE_ENDPOINT) && r.request().method() === 'POST',
      { timeout: 30_000 },
    );
    // Set the toast watch before clicking so it is caught even as the redirect starts.
    const toastShown = this.page.locator(S.TOAST).filter({ hasText: S.TOAST_GROUP_CREATED })
      .waitFor({ state: 'visible', timeout: 20_000 });
    await save.click();
    const res = await created;
    expect(res.status(), 'the create request should return 200').toBe(200);
    expect(((await res.json()) as { success?: boolean })?.success, 'the create response should report success').toBe(true);
    await toastShown;
    // Every observed save lands on the group list. (The NM-2043 discussion in Jira describes
    // a details-page landing instead; the test plan carries that open question.) If the app
    // changes where it lands, this is the step that should fail.
    await expect(this.page, 'a successful save should land on the group list')
      .toHaveURL(/\/products\/product-groups\/?$/, { timeout: 30_000 });
    await this.waitForReady();
  }

  /**
   * Clicks Save on a form the server is expected to reject and returns the text of the
   * rejection toast THAT click raised. Rejection toasts outlive the page they were raised
   * on — an earlier attempt's message can still be on screen — so the method counts the
   * matching toasts before the click, waits for one more, and reads the newest (the toaster
   * renders the newest toast first). A toast that was already there can never satisfy the
   * wait. The form must still be open afterwards — the app keeps every value so the user
   * can correct it.
   */
  @step('Save and read the server rejection')
  async saveExpectingRejection(): Promise<string> {
    const toasts = this.page.locator(S.TOAST).filter({ hasText: S.TOAST_ALREADY_EXISTS });
    const before = await toasts.count();
    await this.addSaveButton().click();
    await expect(toasts, 'the save should raise a rejection toast').toHaveCount(before + 1, { timeout: 20_000 });
    const text = (await toasts.first().innerText()).replace(/\s+/g, ' ').trim();
    await expect(this.addNameBox(), 'the form should still be open after a rejected save').toBeVisible();
    return text;
  }

  // ---------------------------------------------------------------- add-page text boxes

  /** The Name box's current value. */
  @step('Read the group Name box')
  async readAddName(): Promise<string> {
    return this.addNameBox().inputValue();
  }

  /** The Description box's current value. */
  @step('Read the group Description box')
  async readAddDescription(): Promise<string> {
    return this.addDescriptionBox().inputValue();
  }

  /** Whether the Name box is marked invalid — the required-empty state (red border, icon). */
  @step('Read whether the Name box is marked invalid')
  async isAddNameInvalid(): Promise<boolean> {
    return (await this.addNameBox().getAttribute('aria-invalid')) === 'true';
  }

  /** Replaces the Name box's content in one paste-like action; the box's own cap still applies. */
  @step('Paste into the group Name box')
  async pasteAddName(value: string): Promise<void> {
    await this.addNameBox().fill(value);
  }

  /** Replaces the Description box's content in one paste-like action. */
  @step('Paste into the group Description box')
  async pasteAddDescription(value: string): Promise<void> {
    await this.addDescriptionBox().fill(value);
  }

  /** Types at the end of whatever the Name box already holds, without clearing it. */
  @step('Type more into the group Name box')
  async appendToAddName(value: string): Promise<void> {
    await this.typeAtEnd(this.addNameBox(), value);
  }

  /** Types at the end of whatever the Description box already holds, without clearing it. */
  @step('Type more into the group Description box')
  async appendToAddDescription(value: string): Promise<void> {
    await this.typeAtEnd(this.addDescriptionBox(), value);
  }

  /** Keystrokes appended after the current content — the cap cases need the box kept full. */
  private async typeAtEnd(box: Locator, value: string): Promise<void> {
    await box.click();
    await box.press('End');
    await box.pressSequentially(value, { delay: 40 });
  }

  /** Clears the Name box the way a user selecting everything and pressing Delete does. */
  @step('Clear the Name box with select-all and Delete')
  async clearAddNameAtOnce(): Promise<void> {
    const box = this.addNameBox();
    await box.click();
    await box.press('Control+a');
    await box.press('Delete');
  }

  /** Clears the Name box one Backspace per character. */
  @step('Clear the Name box character by character')
  async clearAddNameByBackspace(): Promise<void> {
    const box = this.addNameBox();
    await box.click();
    await box.press('End');
    const length = (await box.inputValue()).length;
    for (let i = 0; i < length; i++) {
      await box.press('Backspace');
    }
  }

  /**
   * Presses Tab from one of the text boxes and reports whether focus actually left it — a
   * box that rejects input must still let the cursor out.
   */
  @step('Tab out of a text box')
  async tabOutOfBox(which: 'name' | 'description'): Promise<boolean> {
    const box = which === 'name' ? this.addNameBox() : this.addDescriptionBox();
    const fieldName = which === 'name' ? 'productGroupName' : 'productGroupDescription';
    await box.press('Tab');
    return this.page.evaluate(
      (name) => document.activeElement?.getAttribute('name') !== name,
      fieldName,
    );
  }

  /** Sets the Add page's Active checkbox. */
  @step('Set the Add page Active checkbox')
  async setAddActive(checked: boolean): Promise<void> {
    if ((await this.isAddActiveChecked()) !== checked) {
      await this.page.locator(S.chkAddActive).click();
    }
    await expect.poll(() => this.isAddActiveChecked(), { timeout: 5_000 }).toBe(checked);
  }

  // ---------------------------------------------------------------- service type list

  /** The chosen Service Type, or the placeholder text while none is chosen. */
  @step('Read the chosen Service Type')
  async readServiceType(): Promise<string> {
    return (await this.page.locator(S.addServiceTypeCombo).innerText()).trim();
  }

  /**
   * Opens the Service Type list, reads every option in order and whether the list carries
   * a search box of its own, then closes it without choosing.
   */
  @step('Read the Service Type options')
  async readServiceTypeOptions(): Promise<{ options: string[]; hasSearchBox: boolean }> {
    await this.page.locator(S.addServiceTypeCombo).click();
    const listbox = this.page.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible', timeout: 5_000 });
    const options = (await listbox.getByRole('option').allInnerTexts()).map((t) => t.trim());
    const hasSearchBox = (await listbox.locator('input').count()) > 0;
    await this.page.keyboard.press('Escape');
    await listbox.waitFor({ state: 'hidden', timeout: 5_000 });
    return { options, hasSearchBox };
  }

  /** Opens the Service Type list, jumps to its last entry with End and confirms it with Enter. */
  @step('Choose the last Service Type from the keyboard')
  async selectLastServiceTypeByKeyboard(): Promise<void> {
    await this.page.locator(S.addServiceTypeCombo).click();
    const listbox = this.page.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible', timeout: 5_000 });
    await this.page.keyboard.press('End');
    await this.page.keyboard.press('Enter');
    await listbox.waitFor({ state: 'hidden', timeout: 5_000 });
  }

  // ---------------------------------------------------------------- sub-class picker

  pickerSearchBox(): Locator {
    return this.page.getByPlaceholder(S.PLACEHOLDER_SUBCLASS_SEARCH, { exact: true });
  }

  /** Replaces the picker's search text; the catalog filters as it changes. */
  @step('Type into the sub-class picker search')
  async typePickerSearch(value: string): Promise<void> {
    await this.pickerSearchBox().fill(value);
  }

  /** The picker's search box's current value. */
  @step('Read the sub-class picker search')
  async readPickerSearch(): Promise<string> {
    return this.pickerSearchBox().inputValue();
  }

  private catalogRows(): Locator {
    return this.page.locator(S.subClassItem);
  }

  /** How many catalog rows the picker currently lists. */
  @step('Read the catalog row count')
  async readCatalogCount(): Promise<number> {
    return this.catalogRows().count();
  }

  /**
   * Waits until the catalog row count is within [min, max] and returns it. The catalog is
   * thousands of rows that render after the form, and it re-filters as the picker's
   * controls change, so every count-based read goes through this wait.
   */
  @step('Wait for the catalog row count')
  async waitForCatalogCount(min: number, max: number = min, timeout = 30_000): Promise<number> {
    await this.page.waitForFunction(
      ({ selector, low, high }) => {
        const n = document.querySelectorAll(selector).length;
        return n >= low && n <= high;
      },
      { selector: S.subClassItem, low: min, high: max },
      { timeout },
    );
    return this.readCatalogCount();
  }

  /** The first catalog row's text. */
  @step('Read the first catalog row')
  async readCatalogFirst(): Promise<string> {
    return (await this.catalogRows().first().innerText()).trim();
  }

  /** The last catalog row's text. */
  @step('Read the last catalog row')
  async readCatalogLast(): Promise<string> {
    return (await this.catalogRows().last().innerText()).trim();
  }

  /** Every catalog row's text — for filtered sets; the full catalog is thousands of rows. */
  @step('Read the catalog rows')
  async readCatalogTexts(): Promise<string[]> {
    return (await this.catalogRows().allInnerTexts()).map((t) => t.trim());
  }

  private pickerLabor(): Locator {
    return this.page.locator(S.chkPickerLabor);
  }

  /** Whether the picker's Labor filter is checked. */
  @step('Read the Labor filter state')
  async isPickerLaborChecked(): Promise<boolean> {
    return (await this.pickerLabor().getAttribute('data-state')) === 'checked';
  }

  /** Sets the picker's Labor filter. */
  @step('Set the Labor filter')
  async setPickerLabor(checked: boolean): Promise<void> {
    if ((await this.isPickerLaborChecked()) !== checked) {
      await this.pickerLabor().click();
    }
    await expect.poll(() => this.isPickerLaborChecked(), { timeout: 5_000 }).toBe(checked);
  }

  /** The picker's current sort order — Ascending or Descending. */
  @step('Read the picker sort order')
  async readPickerSort(): Promise<string> {
    return (await this.page.locator(S.pickerSortCombo).innerText()).trim();
  }

  /** Chooses the picker's sort order. */
  @step('Choose the picker sort order')
  async selectPickerSort(order: string): Promise<void> {
    await this.page.locator(S.pickerSortCombo).click();
    const listbox = this.page.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible', timeout: 5_000 });
    await listbox.getByRole('option', { name: order, exact: true }).click();
    await listbox.waitFor({ state: 'hidden', timeout: 5_000 });
    await expect.poll(() => this.readPickerSort(), { timeout: 5_000 }).toBe(order);
  }

  /** Clicks the picker's own Reset — the Add page has no other Reset. */
  @step('Reset the sub-class picker')
  async clickPickerReset(): Promise<void> {
    await this.page.getByRole('button', { name: S.TEXT_PICKER_RESET, exact: true }).click();
  }

  private addedSubClassRemoveButtons(): Locator {
    return this.page.locator(S.addedSubClassRemove);
  }

  /** The sub-classes currently added to the group, in order. */
  @step('Read the added sub-classes')
  async readAddedSubClasses(): Promise<string[]> {
    const rows = this.addedSubClassRemoveButtons().locator('xpath=..');
    return (await rows.allInnerTexts()).map((t) => t.trim());
  }

  /** Whether the Sub Classes area still shows its "drag or double-click" instruction. */
  @step('Read whether the Sub Classes instruction is shown')
  async isSubClassInstructionShown(): Promise<boolean> {
    return (await this.page.getByText(S.SUBCLASS_INSTRUCTION).count()) > 0;
  }

  /** Adds a catalog item by double-click and returns its label. The catalog keeps the item. */
  @step('Add a catalog item by double-click')
  async addSubClassByDoubleClick(index = 0): Promise<string> {
    const row = this.catalogRows().nth(index);
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    const label = (await row.innerText()).trim();
    await row.dblclick();
    await this.waitForAngularStable(5_000).catch(() => {});
    return label;
  }

  /** Removes an added sub-class through its row's × control. */
  @step('Remove an added sub-class')
  async removeAddedSubClass(index = 0): Promise<void> {
    await this.addedSubClassRemoveButtons().nth(index).click();
    await this.waitForAngularStable(5_000).catch(() => {});
  }

  /**
   * Drags a catalog item onto the Sub Classes area with a real pointer sequence — press,
   * move in steps, release — and returns its label. Playwright's drag helper is not used
   * because it does not reliably fire this picker's drop; the stepped pointer moves do.
   */
  @step('Drag a catalog item onto the Sub Classes area')
  async dragSubClassToGroup(index = 0): Promise<string> {
    const row = this.catalogRows().nth(index);
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    const label = (await row.innerText()).trim();
    const from = await row.boundingBox();
    const to = await this.page.getByText(S.SUBCLASS_INSTRUCTION).boundingBox();
    if (!from || !to) {
      throw new Error('The catalog row or the Sub Classes area has no layout box to drag between');
    }
    const mouse = this.page.mouse;
    await mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await mouse.down();
    await mouse.move(from.x + from.width / 2 + 15, from.y + from.height / 2 + 10, { steps: 6 });
    await mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 30 });
    await mouse.up();
    await this.waitForAngularStable(5_000).catch(() => {});
    return label;
  }

  // ---------------------------------------------------------------- panel toggle

  /** Collapses the sub-class panel through the divider button; the form takes its room. */
  @step('Collapse the sub-class panel')
  async collapsePanel(): Promise<void> {
    await this.page.getByRole('button', { name: S.NAME_COLLAPSE_PANEL, exact: true }).click();
    await expect(this.page.getByRole('button', { name: S.NAME_EXPAND_PANEL, exact: true }))
      .toBeVisible({ timeout: 5_000 });
  }

  /** Expands the sub-class panel again. */
  @step('Expand the sub-class panel')
  async expandPanel(): Promise<void> {
    await this.page.getByRole('button', { name: S.NAME_EXPAND_PANEL, exact: true }).click();
    await expect(this.page.getByRole('button', { name: S.NAME_COLLAPSE_PANEL, exact: true }))
      .toBeVisible({ timeout: 5_000 });
  }

  /**
   * The Name box's left edge and width. The collapsed panel's inputs keep a layout box
   * behind the form, so the form's own geometry is the reliable sign the panel is gone.
   */
  @step('Read the Name box geometry')
  async readAddNameGeometry(): Promise<{ left: number; width: number }> {
    const box = await this.addNameBox().boundingBox();
    if (!box) {
      throw new Error('The Name box has no layout box');
    }
    return { left: Math.round(box.x), width: Math.round(box.width) };
  }

  // ---------------------------------------------------------------- leaving the add page

  /** Goes back in the browser history and waits for the group list to be ready. */
  @step('Go back in the browser history')
  async goBack(): Promise<void> {
    await this.page.goBack({ waitUntil: 'domcontentloaded' });
    await this.waitForReady();
  }

  /** Clicks the "Product Groups" breadcrumb above the Add form and waits for the group list. */
  @step('Click the Product Groups breadcrumb')
  async clickBreadcrumbToGroups(): Promise<void> {
    await this.page.getByRole('link', { name: S.LINK_PRODUCT_GROUPS, exact: true }).click();
    await this.waitForReady();
  }
}
