import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { IConfig } from '../../types';
import { LocalOfficeSettingsSelectors, getTsSelector } from '../../selectors';
import { CheckboxState } from '../components/location-form-helpers.component';

export class LocalOfficeSettingsPage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
  }

 /**
 * Override getElement to prefer Local Office selectors.
 * LocalOfficeSettingsSelectors is NOT in ALL_SELECTORS (colliding keys: btnSave, tabBasicInformation).
 * Falls back to global lookup for shared elements (dialogs, etc.).
 */
  protected getElement(elementName: string): Locator {
    const selector = (LocalOfficeSettingsSelectors as Record<string, string>)[elementName]
      ?? getTsSelector(elementName);
    if (!selector) throw new Error(`Selector '${elementName}' not found in Local Office or global selectors`);
    return this.page.locator(selector);
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // NAVIGATION
 // ─────────────────────────────────────────────────────────────────────────────

  async navigateToBasicInfoTab(officeNo = '1604'): Promise<void> {
    await this.navigateToSubTab('tabBasicInformation', 'frmBasicInfo', officeNo, 'local-office');
  }

 /** Reload page and navigate back to Basic Info tab.
 * Uses safeNavigateTo to handle beforeunload dialog when form has unsaved edits.
 * 30s form-visibility timeout: live-verified cold-load p95 ~9s isolated, but under
 * 4-worker contention loads regularly exceed 15s (was the BAS-001 timeout failure).
 * See reports/live-verification-2026-05-08.md. */
  async reloadBasicInfo(officeNo = '1604'): Promise<void> {
    const baseUrl = this.config?.base_url || '';
    await this.safeNavigateTo(`${baseUrl}locations/${officeNo}/settings/local-office`);
    await this.waitForAngularStable();
    await this.getElement('frmBasicInfo').waitFor({ state: 'visible', timeout: 30_000 });
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // SAVE — BASIC INFO (dialog-based: Yes/No)
 // ─────────────────────────────────────────────────────────────────────────────

  async isSaveEnabled(): Promise<boolean> {
    return !(await this.getElement('btnSave').isDisabled());
  }

 /** Poll until Save button becomes enabled (Angular dirty-state propagation).
  * Default 10s — Angular dirty propagation can lag after section-grid edits. */
  async waitForSaveToEnable(timeout = 10_000): Promise<boolean> {
    return this.waitForSaveEnabled('btnSave', timeout);
  }

 /** Click Save and confirm via shared "Save Changes" dialog. Falls through if no dialog appears.
 * Returns {success, networkError?} from the underlying save — callers that care about
 * silent 500s can assert on `.success`. Existing callers that discard the return value
 * still compile (TS allows ignoring a Promise<T>).
 */
  async clickSaveAndConfirm(): Promise<{ success: boolean; networkError?: string }> {
    return this.clickSaveWithDialog('btnSave', 'dlgSaveChanges', 'btnSaveChangesConfirm');
  }

 /** Click Save then click Cancel to dismiss. Returns false if no dialog appears. */
  async clickSaveAndCancel(): Promise<boolean> {
    await this.getElement('btnSave').click();
    const dlg = this.getElement('dlgSaveChanges');
    const visible = await dlg.waitFor({ state: 'visible', timeout: 5_000 })
      .then(() => true).catch(() => false);
    if (visible) {
      await this.getElement('btnSaveChangesCancel').click();
      await dlg.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
      return true;
    }
    return false;
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // FIELD INTERACTIONS
 // ─────────────────────────────────────────────────────────────────────────────

  async getInputValue(key: string): Promise<string> {
    return this.getElement(key).inputValue();
  }

 /** Fill field using keyboard.type (fires raw keydown/input/keyup events for Angular/Radix),
 * then press Tab to trigger blur/commit. */
  async fillAndTab(key: string, value: string): Promise<void> {
    const el = this.getElement(key);
    await el.click();
    await this.page.keyboard.press('Control+a');
    if (value === '') {
      await this.page.keyboard.press('Backspace');
    } else {
      await this.page.keyboard.type(value);
    }
    await el.press('Tab');
  }

 /** Clear field completely, press Tab to trigger validation. */
  async clearAndTab(key: string): Promise<void> {
    const el = this.getElement(key);
    await el.click();
    await this.page.keyboard.press('Control+a');
    await this.page.keyboard.press('Backspace');
    await el.press('Tab');
  }

  async isFieldInvalid(key: string): Promise<boolean> {
    return (await this.getElement(key).getAttribute('aria-invalid')) === 'true';
  }

 /** Poll until field becomes aria-invalid="true" (cross-field async validation). */
  async expectInvalid(key: string, timeout = 5_000): Promise<boolean> {
    return this.waitForFieldInvalid(key, timeout);
  }

 /** Poll until field's aria-invalid clears (cross-field async validation). */
  async expectValid(key: string, timeout = 5_000): Promise<boolean> {
    return this.waitForFieldValid(key, timeout);
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // CHECKBOX (Radix UI — uses aria-checked)
 // ─────────────────────────────────────────────────────────────────────────────

  async getCheckboxState(key: string): Promise<CheckboxState> {
    return this.getRadixCheckboxState(key);
  }

  async checkCheckbox(key: string): Promise<void> {
    await this.setRadixCheckbox(key, true);
  }

  async uncheckCheckbox(key: string): Promise<void> {
    await this.setRadixCheckbox(key, false);
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // COMBOBOX
 // ─────────────────────────────────────────────────────────────────────────────

  async getComboboxValue(key: string): Promise<string> {
    return (await this.getElement(key).textContent() || '').trim();
  }

  async getComboboxOptionsList(key: string): Promise<string[]> {
    return this.getComboboxOptions(key);
  }

 /** Select exact combobox option (delegates to BasePage.selectComboboxOption with exact:true; retry-on-detach + telemetry). */
  async selectComboboxExact(key: string, optionName: string): Promise<void> {
    await this.selectComboboxOption(key, optionName, { exact: true });
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // TAB STATE
 // ─────────────────────────────────────────────────────────────────────────────

  async isTabSelected(tabKey: string): Promise<boolean> {
    return (await this.getElement(tabKey).getAttribute('aria-selected')) === 'true';
  }

 /** Click a tab WITHOUT auto-dismissing the unsaved changes dialog.
 * Use this when the test needs to interact with the dialog itself (BAS-037/038). */
  async clickTabDirect(tabKey: string): Promise<void> {
    await this.getElement(tabKey).click();
  }

 /**
 * Click a tab. Handles "Unsaved changes" alertdialog if it appears.
 * Angular doesn't reliably call markAsPristine after ECT save.
 * The save API completes (button disables, toast shows) but the form dirty flag
 * persists. Clicking another tab triggers the dirty guard → "Unsaved changes" dialog.
 * Dismiss with "Discard" to complete the navigation.
 */
  async clickTab(tabKey: string): Promise<void> {
    await this.getElement(tabKey).click();
    await this.page.waitForTimeout(300); // Allow Angular to render dialog if dirty
    const dismissed = await this.dismissAlertDialogIfVisible();
    if (dismissed) await this.waitForAngularStable();
  }

 /** Wait for Basic Info form to be visible (public wrapper for spec use). */
  async waitForBasicInfoForm(timeout = 10_000): Promise<void> {
    await this.getElement('frmBasicInfo').waitFor({ state: 'visible', timeout });
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // SECTIONS TABLE
 // ─────────────────────────────────────────────────────────────────────────────

 /** Get data rows from sections table (excludes the "add new" placeholder row). */
  private getSectionDataRows() {
    const table = this.getElement('tblSections');
    return table.locator('tbody tr').filter({
      hasNot: this.page.locator('input[placeholder="Add New..."]'),
    });
  }

 /** Count data rows in the Sections table. */
  async getSectionRowCount(): Promise<number> {
    return this.getSectionDataRows().count();
  }

 /** Get a single section name by row index. */
  async getSectionNameByIndex(rowIndex: number): Promise<string> {
    const row = this.getSectionDataRows().nth(rowIndex);
    return (await row.locator('td:first-child input').inputValue()).trim();
  }

 /** Get all section names from the Sections table (reads input values). */
  async getSectionNames(): Promise<string[]> {
    const rows = this.getSectionDataRows();
    const count = await rows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const input = rows.nth(i).locator('td:first-child input');
      const val = await input.inputValue();
      if (val.trim().length > 0) names.push(val.trim());
    }
    return names;
  }

 /** Check if a section row has the active checkmark (SVG lucide-check in toggle cell). */
  async isSectionActive(rowIndex: number): Promise<boolean> {
    const row = this.getSectionDataRows().nth(rowIndex);
    return (await row.locator('td:last-child svg').count()) > 0;
  }

 /** Click the active/checkmark cell for a section row to toggle. */
  async toggleSectionActive(rowIndex: number): Promise<void> {
    const row = this.getSectionDataRows().nth(rowIndex);
    await row.locator('td:last-child').click();
  }

 /** Edit a section name by clicking the input and typing. */
  async editSectionName(rowIndex: number, newName: string): Promise<void> {
    const row = this.getSectionDataRows().nth(rowIndex);
    const input = row.locator('td:first-child input');
    await input.click();
    await input.clear();
    await input.fill(newName);
    await input.press('Tab');
  }

 /** Start editing a section name, type a value, then press Escape to cancel. */
  async editSectionNameAndCancel(rowIndex: number, tempName: string): Promise<void> {
    const row = this.getSectionDataRows().nth(rowIndex);
    const input = row.locator('td:first-child input');
    await input.click();
    await input.clear();
    await input.fill(tempName);
    await input.press('Escape');
  }

 /** Type a name in the "Add New" input at the bottom of the Sections table. */
  async addSection(name: string): Promise<void> {
    const section = this.getElement('tblSections');
    const addInput = section.locator('input[placeholder="Add New..."]');
    await addInput.fill(name);
    await addInput.press('Tab');
  }

  async clickDefaultSection(): Promise<void> {
    await this.clickWithRetry('btnDefaultSection');
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // ROOMS TABLE
 // ─────────────────────────────────────────────────────────────────────────────

 /** Get data rows from room table (excludes the "add new" placeholder row). */
  private getRoomDataRows() {
    const table = this.getElement('tblRoomConfig');
    return table.locator('tbody tr').filter({
      hasNot: this.page.locator('input[placeholder="Add New..."]'),
    });
  }

  async isRoomTableEmpty(): Promise<boolean> {
    return (await this.getRoomDataRows().count()) === 0;
  }

 /** Count data rows in the Room table. */
  async getRoomRowCount(): Promise<number> {
    return this.getRoomDataRows().count();
  }

 /** Get all room names from the Room table (reads input values). */
  async getRoomNames(): Promise<string[]> {
    const rows = this.getRoomDataRows();
    const count = await rows.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const input = rows.nth(i).locator('td:first-child input');
      const val = await input.inputValue();
      if (val.trim().length > 0) names.push(val.trim());
    }
    return names;
  }

 /** Check if a room row has the active checkmark (SVG in toggle cell). */
  async isRoomActive(rowIndex: number): Promise<boolean> {
    const row = this.getRoomDataRows().nth(rowIndex);
    return (await row.locator('td:last-child svg').count()) > 0;
  }

 /** Click the active/checkmark cell for a room row to toggle. */
  async toggleRoomActive(rowIndex: number): Promise<void> {
    const row = this.getRoomDataRows().nth(rowIndex);
    await row.locator('td:last-child').click();
  }

 /** Edit a room name by clicking the input and typing. */
  async editRoomName(rowIndex: number, newName: string): Promise<void> {
    const row = this.getRoomDataRows().nth(rowIndex);
    const input = row.locator('td:first-child input');
    await input.click();
    await input.clear();
    await input.fill(newName);
    await input.press('Tab');
  }

  async addRoom(name: string): Promise<void> {
    const section = this.getElement('tblRoomConfig');
    const addInput = section.locator('input[placeholder="Add New..."]');
    await addInput.fill(name);
    await addInput.press('Tab');
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // LOGO
 // ─────────────────────────────────────────────────────────────────────────────

  async getLogoPreviewSrc(): Promise<string> {
    return (await this.getElement('imgLogoPreview').getAttribute('src')) || '';
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // DISCOUNT EXEMPTIONS
 // ─────────────────────────────────────────────────────────────────────────────

 /** Count rows with the exempt checkmark (SVG) in discount exemptions table. */
  async getExemptCount(): Promise<number> {
    const table = this.getElement('tblDiscountExemptions');
    return table.locator('tbody tr td:last-child svg').count();
  }

 /** Toggle exempt checkbox for a specific row by index. */
  async toggleExemption(rowIndex: number): Promise<void> {
    const table = this.getElement('tblDiscountExemptions');
    await table.locator('tbody tr').nth(rowIndex).locator('td:last-child').click();
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // UNSAVED CHANGES DIALOG
 // ─────────────────────────────────────────────────────────────────────────────

 /** Click Stay on the unsaved changes dialog. */
  async clickUnsavedStay(): Promise<void> {
    const dlg = this.getElement('dlgUnsavedLocalOffice');
    await dlg.waitFor({ state: 'visible', timeout: 5_000 });
    await this.getElement('btnUnsavedStay').click();
    await dlg.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

 /** Click Discard on the unsaved changes dialog. */
  async clickUnsavedDiscard(): Promise<void> {
    const dlg = this.getElement('dlgUnsavedLocalOffice');
    await dlg.waitFor({ state: 'visible', timeout: 5_000 });
    await this.getElement('btnUnsavedDiscard').click();
    await dlg.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }
}
