import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../common/base-page';
import { Log } from '@framework/utils/logger';
import { IConfig } from '@framework/framework-contracts';
import { CheckboxState } from './location-form-helpers.page';
export class LocationAutoAddonPage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
    Log.info('LocationAutoAddonPage initialized');
  }

  async navigateToAutoAddonTab(officeNo: string = '1604'): Promise<void> {
    await this.navigateToSubTab('tabAutoAddon', 'chkAutoAddonEncoreMusic', officeNo);
  }

  async navigateFresh(officeNo: string = '1604'): Promise<void> {
    const baseUrl = this.config?.base_url || '';
    await this.safeNavigateTo('about:blank');
    await this.navigateTo(`${baseUrl}locations/${officeNo}/settings/location`);
    await this.waitForAngularStable();
    await this.navigateToAutoAddonTab(officeNo);
  }

  async getCheckboxState(key: string): Promise<CheckboxState> {
    return this.getRadixCheckboxState(key);
  }

  async isCheckboxChecked(key: string): Promise<boolean> {
    const state = await this.getRadixCheckboxState(key);
    return state.checked;
  }

  async toggleCheckbox(key: string): Promise<void> {
    // Extended timeout: form inputs are temporarily disabled during save API processing
    await this.getElement(key).click({ timeout: 30_000 });
  }

  async checkCheckbox(key: string): Promise<void> {
    await this.setRadixCheckbox(key, true);
  }

  async uncheckCheckbox(key: string): Promise<void> {
    await this.setRadixCheckbox(key, false);
  }

  async getCheckboxCount(): Promise<number> {
    return this.getElement('chkAutoAddonAll').count();
  }

  /** Save button locator — uses getElement which resolves via ALL_SELECTORS (btnSave from left-panel.ts). */
  private get saveButton(): Locator {
    return this.getElement('btnSave');
  }

  async isSaveEnabled(): Promise<boolean> {
    return !(await this.saveButton.isDisabled());
  }

  async clickSave(): Promise<{ success: boolean; networkError?: string }> {
    const saveBtn = this.saveButton;
    if (await saveBtn.isDisabled()) {
      Log.info('Save button disabled -- skipping click');
      return { success: true };
    }
    await saveBtn.click();
    const dialog = this.getElement('dlgSaveChanges');
    const dialogVisible = await dialog.waitFor({ state: 'visible', timeout: 15_000 })
      .then(() => true).catch(() => false);
    if (dialogVisible) {
      await this.getElement('btnSaveChangesOk').click();
      await dialog.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
    }
    await this.waitForAngularStable();
    // Wait for form to re-enable after save API completes
    const firstCheckbox = this.getElement('chkAutoAddonEncoreMusic');
    const deadline = Date.now() + 15_000;
    while (Date.now() < deadline) {
      const isDisabled = await firstCheckbox.isDisabled().catch(() => true);
      if (!isDisabled) break;
      await this.page.waitForTimeout(500);
    }
    return { success: true };
  }

  async isSaveDialogVisible(): Promise<boolean> {
    return this.getElement('dlgSaveChanges').isVisible();
  }

  async getSaveDialogHeading(): Promise<string> {
    return (await this.getElement('dlgSaveChanges').locator('h2').textContent())?.trim() || '';
  }

  async getSaveDialogBody(): Promise<string> {
    return (await this.getElement('dlgSaveChanges').locator('p').textContent())?.trim() || '';
  }

  async clickSaveButton(): Promise<void> {
    await this.saveButton.click();
  }

  async clickSaveCancel(): Promise<void> {
    await this.getElement('btnSaveChangesCancel').click();
    await this.getElement('dlgSaveChanges').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  async clickSaveOk(): Promise<void> {
    await this.getElement('btnSaveChangesOk').click();
    await this.getElement('dlgSaveChanges').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
    // Wait for save API to complete — form inputs are disabled during save processing
    await this.waitForAngularStable();
    // Wait for form to re-enable (first checkbox becomes interactive)
    await this.getElement('chkAutoAddonEncoreMusic').waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
  }

  async waitForToast(): Promise<boolean> {
    return this.getElement('toastLocalInfoUpdated')
      .waitFor({ state: 'visible', timeout: 10_000 })
      .then(() => true).catch(() => false);
  }

  async clickSidebarHome(): Promise<void> {
    const homeLink = this.page.getByRole('link', { name: 'Home' });
    if (!await homeLink.isVisible().catch(() => false)) {
      // Sidebar collapsed in narrow viewport (headless chrome viewport:null) — expand it
      await this.page.setViewportSize({ width: 1920, height: 1080 });
      await homeLink.waitFor({ state: 'visible', timeout: 5_000 });
    }
    // Suppress the app's beforeunload handler to prevent the fixture from auto-accepting it.
    // This lets the React routing guard show its in-app "Unsaved changes" alertdialog instead.
    await this.page.evaluate(() => {
      window.onbeforeunload = null;
      window.addEventListener('beforeunload', (e) => e.stopImmediatePropagation(), true);
    });
    await homeLink.click();
  }

  async isUnsavedDialogVisible(): Promise<boolean> {
    return this.getElement('autoAddonDlgUnsavedChanges')
      .waitFor({ state: 'visible', timeout: 5_000 })
      .then(() => true).catch(() => false);
  }

  async getUnsavedDialogHeading(): Promise<string> {
    return (await this.getElement('autoAddonDlgUnsavedChanges').locator('h2').textContent())?.trim() || '';
  }

  async getUnsavedDialogBody(): Promise<string> {
    return (await this.getElement('autoAddonDlgUnsavedChanges').locator('p').textContent())?.trim() || '';
  }

  async clickUnsavedStay(): Promise<void> {
    await this.getElement('btnUnsavedChangesStay').click();
    await this.getElement('autoAddonDlgUnsavedChanges').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  async clickUnsavedDiscard(): Promise<void> {
    await this.getElement('btnUnsavedChangesDiscard').click();
    await this.getElement('autoAddonDlgUnsavedChanges').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  async clickLocalInformationTab(): Promise<void> {
    await this.getElement('tabLocalInformation').click();
    await this.waitForAngularStable();
  }

  getCurrentUrl(): string {
    return this.page.url();
  }
}
