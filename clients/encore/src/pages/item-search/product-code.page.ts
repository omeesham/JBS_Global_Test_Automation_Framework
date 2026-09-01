import { Locator, expect } from '@playwright/test';
import { step } from '../../fixtures/step-decorator';
import { ItemSearchPage } from './item-search.page';
import { itemSearchProductCode as S } from '../../selectors/item-search/product-code';

/**
 * The product-code layer of the Products page: the row-selection toolbar and the
 * "Product Code Details" dialogs (view + add flows).
 *
 * The full toolbar mounts only after a result row is clicked, and the dialog's controls
 * re-render on tab switches — locators here are resolved lazily so every action targets
 * the current render. Closing a dialog discards unsaved edits silently (proven live);
 * nothing in this page object ever clicks Save.
 */
export class ProductCodePage extends ItemSearchPage {
  // ---------------------------------------------------------------- row selection & toolbar

  /** Clicks the first result row and waits for the selection toolbar to mount. */
  @step('Select the first result row')
  async selectFirstRow(): Promise<void> {
    await this.page.locator('tbody tr').first().click();
    await expect(this.viewProductCodeButton()).toBeVisible({ timeout: 15_000 });
  }

  viewProductCodeButton(): Locator {
    return this.page.getByRole('button', { name: S.NAME_VIEW_PRODUCT_CODE, exact: true });
  }

  addProductCodeButton(): Locator {
    return this.page.getByRole('button', { name: S.NAME_ADD_PRODUCT_CODE, exact: true });
  }

  viewAvailabilityButton(): Locator {
    return this.page.getByRole('button', { name: S.NAME_VIEW_AVAILABILITY, exact: true });
  }

  /**
   * The toolbar's Product Group button. The grid also has a "Product Group" COLUMN header
   * button; the toolbar sits before the table in DOM order, so `.first()` is the toolbar.
   */
  productGroupButton(): Locator {
    return this.page.getByRole('button', { name: S.NAME_PRODUCT_GROUP, exact: true }).first();
  }

  // ---------------------------------------------------------------- dialog lifecycle

  /** The details dialog (view or add flow — both carry the same title). */
  dialog(): Locator {
    return this.page.locator(S.dialog).filter({ hasText: S.TITLE_DIALOG });
  }

  /** Opens the view dialog for the selected row and waits for it to render. */
  @step('Open the product code details')
  async openViewDialog(): Promise<void> {
    await this.viewProductCodeButton().click();
    await this.dialog().waitFor({ state: 'visible', timeout: 30_000 });
    await this.waitForNoSkeletons();
  }

  /** Opens the add dialog for the selected row and waits for it to render. */
  @step('Open the add product code form')
  async openAddDialog(): Promise<void> {
    await this.addProductCodeButton().click();
    await this.dialog().waitFor({ state: 'visible', timeout: 30_000 });
    await this.waitForNoSkeletons();
  }

  /** Closes the dialog through its footer Close button and waits for it to go. */
  @step('Close the dialog')
  async closeDialog(): Promise<void> {
    await this.dialog().getByRole('button', { name: S.NAME_CLOSE, exact: true }).last().click();
    await this.dialog().waitFor({ state: 'hidden', timeout: 10_000 });
  }

  // ---------------------------------------------------------------- dialog reads

  /** Tab names inside the open dialog, in order. */
  @step('Read the dialog tabs')
  async readDialogTabs(): Promise<string[]> {
    const tabs = await this.dialog().locator(S.tabAny).allTextContents();
    return tabs.map((t) => t.trim()).filter((t) => t.length > 0);
  }

  /** The active tab's name. */
  @step('Read the active dialog tab')
  async readActiveTab(): Promise<string> {
    return ((await this.dialog().locator(S.tabActive).first().textContent()) ?? '').trim();
  }

  /** Clicks a dialog tab by exact name and lets the panel re-render. */
  @step('Open a dialog tab')
  async clickDialogTab(name: string): Promise<void> {
    await this.dialog().getByRole('tab', { name, exact: true }).click();
    await this.waitForAngularStable(10_000).catch(() => {});
    // Tab panels that fetch their content paint loading placeholders first — the
    // History grid rendered its chrome seconds before its headers on a live run.
    await this.waitForNoSkeletons();
  }

  /** Whether the dialog's Save is enabled. */
  @step('Read the dialog Save state')
  async isDialogSaveEnabled(): Promise<boolean> {
    return this.dialog().getByRole('button', { name: S.NAME_SAVE, exact: true })
      .isEnabled().catch(() => false);
  }

  /** The editable name box in the open dialog. */
  dialogNameBox(): Locator {
    return this.dialog().getByPlaceholder(S.PLACEHOLDER_NAME).first();
  }

  /** Full text of the open dialog (structure assertions read from this in one call). */
  @step('Read the dialog content')
  async readDialogText(): Promise<string> {
    return ((await this.dialog().textContent()) ?? '').trim();
  }

  // ---------------------------------------------------------------- segment caret menus

  /** Opens the View split button's segment menu. */
  @step('Open the view segment menu')
  async openViewSegmentMenu(): Promise<void> {
    await this.page.locator(S.btnViewCaret).click();
    await this.page.locator('[role="menu"]').waitFor({ state: 'visible', timeout: 5_000 });
  }

  /** Opens the Add split button's segment menu. */
  @step('Open the add segment menu')
  async openAddSegmentMenu(): Promise<void> {
    await this.page.locator(S.btnAddCaret).click();
    await this.page.locator('[role="menu"]').waitFor({ state: 'visible', timeout: 5_000 });
  }

  /** Clicks a segment entry in the open menu and waits for the dialog to open. */
  @step('Choose a segment')
  async chooseSegment(segment: string): Promise<void> {
    await this.page.getByRole('menuitem', { name: segment, exact: true }).click();
    await this.dialog().waitFor({ state: 'visible', timeout: 30_000 });
    await this.waitForNoSkeletons();
  }

  // ---------------------------------------------------------------- add-form pairing rule

  /** The add form's Product Type selector (shows its placeholder until chosen). */
  productTypeCombo(): Locator {
    return this.dialog().locator('button[role="combobox"]').filter({ hasText: S.TEXT_SELECT_PRODUCT_TYPE }).first();
  }

  /** The add form's Service Type selector. */
  serviceTypeCombo(): Locator {
    return this.dialog().locator('button[role="combobox"]').filter({ hasText: S.TEXT_SELECT_SERVICE_TYPE }).first();
  }

  /** Opens the Product Type list and reads every offered type, leaving it open. */
  @step('Open the Product Type list')
  async readProductTypeOptions(): Promise<string[]> {
    await this.productTypeCombo().click();
    const listbox = this.page.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible', timeout: 5_000 });
    const options = await listbox.locator('[role="option"]').allTextContents();
    return options.map((o) => o.trim()).filter((o) => o.length > 0);
  }

  /** Chooses a product type in the OPEN type list. */
  @step('Choose a Product Type')
  async chooseProductType(type: string): Promise<void> {
    await this.page.getByRole('option', { name: type, exact: true }).click();
    await this.page.locator('[role="listbox"]').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
    await this.waitForAngularStable(5_000).catch(() => {});
  }

  /** Whether the Service Type selector is enabled (it rests locked until a type is chosen). */
  @step('Read the Service Type selector state')
  async isServiceTypeEnabled(): Promise<boolean> {
    // After a Product Type is chosen the service selector still shows its placeholder,
    // so the placeholder-anchored locator keeps resolving.
    return this.serviceTypeCombo().isEnabled().catch(() => false);
  }

  /** Opens the Service Type list and reads the offered services, then closes it. */
  @step('Open the Service Type list')
  async readServiceTypeOptions(): Promise<string[]> {
    await this.serviceTypeCombo().click();
    const listbox = this.page.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible', timeout: 5_000 });
    const options = await listbox.locator('[role="option"]').allTextContents();
    await this.page.keyboard.press('Escape');
    await listbox.waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => {});
    return options.map((o) => o.trim()).filter((o) => o.length > 0);
  }
}
