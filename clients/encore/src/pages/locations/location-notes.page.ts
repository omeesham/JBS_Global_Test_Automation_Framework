import { Page, expect } from '@playwright/test';
import { BasePage } from '../../core/base-page';
import { Log } from '../../utils/logger';
import { IConfig } from '../../types';

export class LocationNotesPage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
    Log.info('LocationNotesPage initialized');
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // NAVIGATION
 // ─────────────────────────────────────────────────────────────────────────────

 /** Navigate to Notes tab for the given office. */
  async navigateToNotesTab(officeNo: string = '1604'): Promise<void> {
    await this.navigateToSubTab('tabNotes', 'sectionNotes', officeNo);
  }

 /**
 * Group D-2 (lifecycle refactor 2026-05-21): DOM-presence guard so
 * beforeEach can avoid re-navigating when already on the tab.
 */
  async isOnNotesTab(): Promise<boolean> {
    return (await this.getElement('sectionNotes').count()) > 0;
  }

 /** Click Notes tab only (assumes already on location settings page). */
  async clickNotesTab(): Promise<void> {
    await this.clickWithRetry('tabNotes');
    await this.getElement('sectionNotes').waitFor({ state: 'visible', timeout: 15_000 });
    // D-1 (lifecycle refactor 2026-05-21): race content vs empty-state
    // so we don't return on the wrapper alone while the inner Notes data is still hydrating.
    // Log.warn (NOT silent .catch) per adversarial-audit amend so race-lost timeouts are diagnosable.
    await Promise.race([
      this.getElement('txtNoteInputAll').first().waitFor({ state: 'visible', timeout: 15_000 }),
      this.getElement('lblNoNotesAvailable').waitFor({ state: 'visible', timeout: 15_000 }),
    ]).catch((e: Error) => Log.warn(`[tab-hydration] Notes race lost: ${e?.message}`));
  }

 /** Reload page and return to Notes tab. Handles potential beforeunload dialog. */
  async reloadAndNavigateToNotesTab(): Promise<void> {
    const handler = async (d: import('@playwright/test').Dialog) => {
      try { await d.accept(); } catch { /* dialog may already be handled */ }
    };
    this.page.on('dialog', handler);
    try {
      await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
    } finally {
      this.page.removeListener('dialog', handler);
    }
    await this.clickNotesTab();
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // ROW MANAGEMENT
 // ─────────────────────────────────────────────────────────────────────────────

 /** Click the Add button to create a new note row. */
  async clickAdd(): Promise<void> {
    await this.clickWithRetry('btnNotesAdd');
  }

 /**
 * Fill the textarea at the given row index and press Tab (Angular blur trigger).
 * Row 0 = first row, Row 1 = second row, etc.
 * Auto-creates row 0 if page is in "No Notes Available" state (0 textareas).
 */
  async fillNote(row: number, text: string): Promise<void> {
    if (row === 0) {
      const count = await this.getElement('txtNoteInputAll').count();
      if (count === 0) {
        await this.clickAdd();
      }
    }
    const textarea = this.getElement('txtNoteInputAll').nth(row);
    await textarea.waitFor({ state: 'visible', timeout: 5_000 });
    if (text.includes('\n')) {
      await this.pasteIntoNote(row, text);
      return;
    }
    await textarea.fill(text);
    await textarea.press('Tab');
    Log.info(`[OK] Filled note row ${row} with ${text.length} chars`);
  }

 /**
 * Programmatic paste — bypasses JS keyboard handler (soft limit).
 * Used for TC-007/TC-021 boundary test (4001+ chars via paste).
 * Dispatches input+change events to trigger Angular model update.
 * Auto-creates row 0 if page is in "No Notes Available" state.
 */
  async pasteIntoNote(row: number, text: string): Promise<void> {
    if (row === 0) {
      const count = await this.getElement('txtNoteInputAll').count();
      if (count === 0) {
        await this.clickAdd();
      }
    }
    const textarea = this.getElement('txtNoteInputAll').nth(row);
    await textarea.focus();
    await textarea.evaluate((el: HTMLTextAreaElement, t: string) => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      )?.set;
      setter?.call(el, t);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, text);
    await textarea.press('Tab');
    Log.info(`[OK] Pasted ${text.length} chars into note row ${row}`);
  }

 /** Append text to row N's existing value via Angular-friendly input event. FCC γ (edit) helper. */
  async appendToNote(row: number, suffix: string): Promise<void> {
    const textarea = this.getElement('txtNoteInputAll').nth(row);
    await textarea.focus();
    await textarea.evaluate((el: HTMLTextAreaElement, s: string) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
      setter?.call(el, el.value + s);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, suffix);
    await textarea.press('Tab');
  }

 /** Prepend text to row N's existing value via Angular-friendly input event. FCC γ (edit) helper. */
  async prependToNote(row: number, prefix: string): Promise<void> {
    const textarea = this.getElement('txtNoteInputAll').nth(row);
    await textarea.focus();
    await textarea.evaluate((el: HTMLTextAreaElement, p: string) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
      setter?.call(el, p + el.value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, prefix);
    await textarea.press('Tab');
  }

 /** Replace [start, end) of row N's value with newText via Angular-friendly input event. FCC γ (edit) helper. */
  async replaceSliceInNote(row: number, start: number, end: number, newText: string): Promise<void> {
    const textarea = this.getElement('txtNoteInputAll').nth(row);
    await textarea.focus();
    await textarea.evaluate((el: HTMLTextAreaElement, args: { s: number; e: number; n: string }) => {
      const v = el.value;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
      setter?.call(el, v.slice(0, args.s) + args.n + v.slice(args.e));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, { s: start, e: end, n: newText });
    await textarea.press('Tab');
  }

 /** Clear row N's textarea via Angular-friendly input event (LR-026 + BUG-LOC-NTS-001 workaround pattern). FCC ε (delete) prerequisite. */
  async clearNote(row: number): Promise<void> {
    const textarea = this.getElement('txtNoteInputAll').nth(row);
    await textarea.focus();
    await textarea.evaluate((el: HTMLTextAreaElement) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
      setter?.call(el, '');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await textarea.press('Tab');
  }

 /** Ensure at least 1 empty textarea row exists. Clicks Add if in "No Notes Available" state. */
  async prepareEmptyRow(): Promise<void> {
    const count = await this.getElement('txtNoteInputAll').count();
    if (count === 0) {
      await this.clickAdd();
    }
  }

 /** Click Delete button on the given row index. */
  async deleteRow(row: number): Promise<void> {
    const deleteBtn = this.getElement('btnNotesDelete').nth(row);
    await deleteBtn.click();
    Log.info(`[OK] Deleted note row ${row}`);
  }

 /** Delete all note rows by clicking Delete buttons until none remain. */
  async deleteAllRows(): Promise<void> {
    let count = await this.getElement('btnNotesDelete').count();
    while (count > 0) {
      const prev = count;
      await this.getElement('btnNotesDelete').first().click();
      await expect.poll(
        () => this.getElement('btnNotesDelete').count(),
        { timeout: 5_000 },
      ).toBeLessThan(prev);
      count = await this.getElement('btnNotesDelete').count();
    }
    Log.info('[OK] All note rows deleted');
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // STATE CHECKS
 // ─────────────────────────────────────────────────────────────────────────────

 /** Check if "No Notes Available" empty state is visible. */
  async isEmptyStateVisible(): Promise<boolean> {
    return this.getElement('lblNoNotesAvailable').isVisible();
  }

 /** Get input value of the textarea at the given row index. */
  async getNoteValue(row: number): Promise<string> {
    const el = this.getElement('txtNoteInputAll').nth(row);
    await el.waitFor({ state: 'visible', timeout: 15_000 });
    return el.inputValue();
  }

 /** Count the number of note textarea rows currently in the DOM. */
  async getNoteRowCount(): Promise<number> {
    return this.getElement('txtNoteInputAll').count();
  }

 /** Get the full text content of the character counter element. */
  async getCharCounterText(): Promise<string> {
    return (await this.getElement('lblNotesCharCounter').textContent()) ?? '';
  }

 /** Parse the numeric character count from the counter text (e.g., "25/4000" → 25). */
  async getCharCount(): Promise<number> {
    const text = await this.getCharCounterText();
    const match = text.match(/(\d+)\/4000/);
    return match && match[1] ? parseInt(match[1], 10) : -1;
  }

 /** Count the number of Delete buttons currently visible. */
  async getDeleteButtonCount(): Promise<number> {
    return this.getElement('btnNotesDelete').count();
  }

 /** Check if the Add button is visible. */
  async isAddButtonVisible(): Promise<boolean> {
    return this.getElement('btnNotesAdd').isVisible();
  }

 /** Check if the progress bar is visible. */
  async isProgressBarVisible(): Promise<boolean> {
    return this.getElement('barNotesProgress').isVisible();
  }

 /** Check if the left-panel Save button is enabled. */
  async isSaveEnabled(): Promise<boolean> {
    return this.getElement('btnSaveNotes').isEnabled();
  }

 /** Return the Locator for a specific textarea row. For direct interaction in specs (e.g., focus/type). */
  getNoteTextarea(row: number): import('@playwright/test').Locator {
    return this.getElement('txtNoteInputAll').nth(row);
  }

 /** Check if a textarea at row index has a maxlength attribute. Returns the value or null. */
  async getTextareaMaxlength(row: number): Promise<string | null> {
    return this.getElement('txtNoteInputAll').nth(row).getAttribute('maxlength');
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // SAVE DIALOG
 // ─────────────────────────────────────────────────────────────────────────────

 /**
 * Save and auto-confirm the dialog. Delegates to BasePage.clickSaveWithDialog.
 * Waits for Save button to become enabled first (Angular change detection timing).
 */
  async saveAndConfirm(): Promise<void> {
    await this.getElement('btnSaveNotes').waitFor({ state: 'visible', timeout: 5_000 });
 // Wait for Angular to enable Save (may take a tick after fill+Tab).
 // Propagate timeout — if Save never enables, the subsequent click would fail anyway
 // and the original timeout gives a clearer signal than a downstream click error.
    await this.page.waitForFunction(
      (sel: string) => {
        const btn = document.querySelector(sel);
        return btn && !(btn as HTMLButtonElement).disabled;
      },
      this.getLocator('btnSaveNotes'),
      { timeout: 5_000 }
    );
    const result = await this.clickSaveWithDialog('btnSaveNotes');
    if (!result.success) {
      Log.error(`[ERR] Save failed: ${result.networkError}`);
    }
 // Wait for Save button to become disabled — confirms save API response was received
 // and the form is pristine. Without this, immediate page.reload can race with the
 // server processing the save, causing reload to fetch pre-save (stale) data.
 // Timeout propagates so callers fail loudly on stale-read race instead of passing
 // with stale data after a swallowed warning.
    await this.page.waitForFunction(
      (sel: string) => {
        const btn = document.querySelector(sel);
        return btn && (btn as HTMLButtonElement).disabled;
      },
      this.getLocator('btnSaveNotes'),
      { timeout: 10_000 },
    );
  }

 /** Click Save button only (does NOT auto-confirm dialog). For TC-008 dialog verification. */
  async clickSaveButton(): Promise<void> {
    await this.clickWithRetry('btnSaveNotes');
  }

 /** Wait for save dialog to appear and return its heading + body text. */
  async getSaveDialogContent(): Promise<{ heading: string; body: string }> {
    const dialog = this.getElement('dlgSaveChanges');
    await dialog.waitFor({ state: 'visible', timeout: 5_000 });
    const heading = await dialog.locator('h2, [role="heading"]').first().textContent() ?? '';
    const body = await dialog.locator('p, div:not(:has(button)):not(:has(h2))').first().textContent() ?? '';
    return { heading: heading.trim(), body: body.trim() };
  }

 /** Confirm the save dialog (click Save button inside dialog). */
  async confirmSaveDialog(): Promise<void> {
    await this.getElement('btnSaveChangesConfirm').click();
    await this.getElement('dlgSaveChanges').waitFor({ state: 'hidden', timeout: 10_000 });
  }

 /** Cancel the save dialog. */
  async cancelSaveDialog(): Promise<void> {
    await this.getElement('btnSaveChangesCancel').click();
    await this.getElement('dlgSaveChanges').waitFor({ state: 'hidden', timeout: 10_000 });
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // CLEANUP HELPERS
 // ─────────────────────────────────────────────────────────────────────────────

 /**
 * Ensure DB has no saved notes. Deletes any rows with content, saves if needed,
 * then reloads to get a fresh Angular form state.
 */
  async ensureEmptyState(): Promise<void> {
    await this.page.waitForTimeout(500);
    const deleteCount = await this.getElement('btnNotesDelete').count();
    if (deleteCount > 0) {
      await this.deleteAllRows();
 // LR-026: poll for Save-enable instead of fixed 500ms sleep — races Angular's dirty flag
 // when deletion completes before change detection runs. .catch falls through to the
 // reload fallback below if Angular doesn't update (post-markAsPristine session).
      await this.page.waitForFunction(
        (sel: string) => {
          const btn = document.querySelector(sel);
          return btn && !(btn as HTMLButtonElement).disabled;
        },
        this.getLocator('btnSaveNotes'),
        { timeout: 2_000 },
      ).catch(() => {
        Log.info('[INFO] Save did not enable within 2s after delete — will reload for fresh form state');
      });

 // Angular app behavior: after save marks form pristine, deleting notes in the SAME
 // session does NOT re-enable Save (dirty flag not set). Reload to get fresh form state
 // from DB, then re-delete on the fresh form (which properly marks dirty → Save enables).
      if (!(await this.isSaveEnabled())) {
        Log.info('[INFO] Save disabled after delete — reloading for fresh form state');
        await this.reloadAndNavigateToNotesTab();
        const retryDelCount = await this.getElement('btnNotesDelete').count();
        if (retryDelCount > 0) {
          await this.deleteAllRows();
          await this.page.waitForTimeout(500);
        }
      }
    }
    if (await this.isSaveEnabled()) {
      await this.saveAndConfirm();
    }
 // Always reload after cleanup to reset Angular form controller
    await this.reloadAndNavigateToNotesTab();
    Log.info('[OK] Notes ensured empty (DB clean)');
  }

 /**
 * Check if the Notes tab is in a clean empty state.
 * Accepts two forms: "No Notes Available" table (0 textareas) OR 1 empty textarea row.
 */
  async isDefaultEmptyState(): Promise<boolean> {
    const noNotesVisible = await this.isEmptyStateVisible();
    const rowCount = await this.getElement('txtNoteInputAll').count();
    const charCount = await this.getCharCount();
    const deleteCount = await this.getElement('btnNotesDelete').count();
 // Case 1: "No Notes Available" state (0 textareas)
    if (noNotesVisible && rowCount === 0 && charCount === 0) return true;
 // Case 2: 1 empty textarea row (first-ever load)
    if (!noNotesVisible && rowCount === 1 && charCount === 0 && deleteCount === 0) return true;
    return false;
  }

 /**
 * Discard unsaved changes by reloading the page. Handles beforeunload dialog.
 * Re-navigates to Notes tab after reload.
 */
  async discardChangesViaReload(): Promise<void> {
    await this.reloadAndNavigateToNotesTab();
  }

 // ─────────────────────────────────────────────────────────────────────────────
 // SPECIAL TEST SUPPORT
 // ─────────────────────────────────────────────────────────────────────────────

 /**
 * Attempt navigation to trigger beforeunload dialog. Dismisses the dialog
 * (stays on page) to verify it appeared without destroying the SPA context.
 * Returns whether the dialog appeared.
 */
  async navigateAwayWithUnsavedChanges(_url: string): Promise<boolean> {
    let dialogAppeared = false;
    const handler = async (dialog: import('@playwright/test').Dialog) => {
      dialogAppeared = true;
      try { await dialog.dismiss(); } catch { /* dialog may already be handled */ }
    };
 // Suppress fixture's auto-accept handler so this test controls the dialog
    (this.page as unknown as Record<string, unknown>).__skipBeforeunloadAutoAccept = true;
    this.page.on('dialog', handler);
    try {
 // Trigger navigation via browser back or location change
      await this.page.evaluate(() => {
        window.location.href = '/';
      }).catch(() => {
 // Navigation blocked by dialog dismissal — expected
      });
      await this.page.waitForTimeout(1_000);
    } finally {
      this.page.removeListener('dialog', handler);
      (this.page as unknown as Record<string, unknown>).__skipBeforeunloadAutoAccept = false;
    }
    return dialogAppeared;
  }

 /** Switch to another sub-tab by key (e.g., 'tabCurrency'). For TC-010 tab-switch test. */
  async switchToTab(tabKey: string): Promise<void> {
    await this.clickWithRetry(tabKey);
    await this.waitForAngularStable();
  }
}
