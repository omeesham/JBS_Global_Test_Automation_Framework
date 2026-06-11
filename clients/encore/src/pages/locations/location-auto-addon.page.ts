import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { Log } from '../../utils/logger';
import { IConfig } from '../../types';
import { CheckboxState } from '../components/location-form-helpers.component';
export class LocationAutoAddonPage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
    Log.info('LocationAutoAddonPage initialized');
  }

  async navigateToAutoAddonTab(officeNo: string = '1604'): Promise<void> {
    await this.navigateToSubTab('tabAutoAddon', 'chkAutoAddonEncoreMusic', officeNo);
  }

 /**
 * Group D-2 (lifecycle refactor 2026-05-21): DOM-presence guard so
 * beforeEach can avoid re-navigating when already on the tab.
 */
  async isOnAutoAddonTab(): Promise<boolean> {
    // Fix #4a: use tab trigger aria-selected, not
    // child-anchor count(). Mirrors base-page.ts:448.
    const tab = this.getElement('tabAutoAddon');
    if ((await tab.count()) === 0) return false;
    return (await tab.getAttribute('aria-selected').catch(() => null)) === 'true';
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

 /**
 * Blind toggle — flips the checkbox from its CURRENT live state via a plain click.
 * KEPT (not replaced by the smart setRadixCheckbox) per the Phase-1.5 re-verification of the
 * 2026-03-25 generator-audit Finding 5: the cascade-risk it flagged (a cleanup toggle going the
 * wrong direction after a silent save failure) is now mitigated by the per-test ensureDefaultState
 * baseline below — every test starts from a known-clean state regardless of a prior test's cleanup.
 * Use this where a test intentionally flips the current state and asserts the result; use
 * checkCheckbox / uncheckCheckbox (state-aware, idempotent) when a SPECIFIC target state is needed.
 */
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

 /**
 * Per-test baseline — restore all Auto Add-On checkboxes to their defaults if dirty.
 * Wired into the spec's `beforeEach` (after the nav-guard) so EVERY test starts from a known
 * state, not just TC-001. A first-test-only baseline rots under per-test retries (a retry
 * re-runs `beforeEach` but NOT TC-001's body) and after the 2026-05-08 dependencyGate->annotation
 * change (TC-001 no longer guarantees-runs-first) — exactly the 2026-05-27 Legal failure shape.
 *
 * Bounded retry (max 3) wraps the WHOLE cycle — read -> re-set -> save -> reload -> re-verify —
 * because clickSave() returns {success:true} even when Save is disabled (base re-enable path), so
 * a silent no-op (the set didn't dirty the form) never throws. The post-reload re-read against the
 * persisted DOM is the load-bearing check; if it still shows non-default the loop re-sets. After 3
 * failed cycles it throws, converting a silent baseline failure into a loud one. Mirrors
 * location-legal.page.ts `ensureDefaultState`.
 */
  async ensureDefaultState(
    defaults: ReadonlyArray<{ key: string; name: string; checked: boolean }>,
    officeNo: string = '1604',
  ): Promise<void> {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      let dirty = false;
      for (const item of defaults) {
        if ((await this.isCheckboxChecked(item.key)) !== item.checked) {
          if (item.checked) { await this.checkCheckbox(item.key); }
          else { await this.uncheckCheckbox(item.key); }
          dirty = true;
        }
      }
      if (!dirty) { return; } // already at defaults — nothing to restore
      await this.clickSave();
      await this.navigateFresh(officeNo);
      let allMatch = true;
      for (const item of defaults) {
        if ((await this.isCheckboxChecked(item.key)) !== item.checked) { allMatch = false; break; }
      }
      if (allMatch) { return; }
    }
    throw new Error(
      `ensureDefaultState: Auto Add-On checkboxes not at defaults after ${maxAttempts} attempts`,
    );
  }

 /** Save button locator — uses getElement which resolves via ALL_SELECTORS (btnSave from left-panel.ts). */
  private get saveButton(): Locator {
    return this.getElement('btnSave');
  }

  async isSaveEnabled(): Promise<boolean> {
    return !(await this.saveButton.isDisabled());
  }

 /**
 * Custom save — intentionally NOT deduped to the base `clickSaveWithDialog` helper:
 * this tab's Save Changes dialog confirms with "Ok" (`btnSaveChangesOk`), whereas base defaults to
 * the "Save" variant (`btnSaveChangesConfirm`); and this method adds a post-save form-re-enable wait
 * (the checkboxes are disabled during save processing). Behavior is not identical → kept separate.
 */
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
 // Wait for the form to re-enable after the save API completes — the first checkbox is
 // disabled during save processing. Poll the actual disabled->enabled transition (no fixed sleep) via
 // waitForFunction (not a fixed-sleep loop). Best-effort: downstream actions auto-wait for
 // actionability via their own 30s click timeout, so a missed re-enable never silently passes.
    await this.page.waitForFunction(() => {
      const el = document.querySelector(
        '[data-testid="location-settings-checkbox-auto-add-on-false_encore music"]',
      ) as HTMLButtonElement | null;
      return !!el && !el.disabled && el.getAttribute('aria-disabled') !== 'true';
    }, undefined, { timeout: 15_000 }).catch(() => {});
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
}
