// spec: specs_planning/test-plans/locations/locations_notes_test_plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../setup/fixtures';
import {
  NOTE_TEXT_SHORT, NOTE_ROW1, NOTE_ROW2,
  NOTE_HELLO, NOTE_WORLD, NOTE_END,
  NOTE_SAVED, NOTE_PERSISTENT, NOTE_TEMPORARY, NOTE_UNSAVED, NOTE_LIFECYCLE,
  NOTE_4000_CHARS, NOTE_4001_CHARS, NOTE_2000_CHARS, NOTE_40_CHARS,
  NOTE_ROW_A, NOTE_ROW_B, NOTE_ROW_C,
  SPECIAL_CONTENT_TESTS,
} from '../../test-data/locations/location-notes.data';
import { OFFICE_NO } from '../../test-data/common.data';

test.describe.serial('Location Notes @locations @notes', () => {

  // ─── Group A: Navigation + Default State ─────────────────────────────────
  // MCP-verified: Default state = 1 empty textarea row (0/4000), NOT "No Notes Available"

  test('TC-LOC-NTS-001: Verify Notes tab default empty state', async ({ locationNotesPage }) => {
    test.setTimeout(60_000);
    await locationNotesPage.navigateToNotesTab(OFFICE_NO);
    await locationNotesPage.ensureEmptyState();
    // Default state: 1 empty textarea, counter 0/4000, Add visible, no Delete
    expect(await locationNotesPage.isDefaultEmptyState()).toBe(true);
    expect(await locationNotesPage.getCharCounterText()).toContain('0/4000');
    expect(await locationNotesPage.isAddButtonVisible()).toBe(true);
    expect(await locationNotesPage.isProgressBarVisible()).toBe(true);
    expect(await locationNotesPage.getDeleteButtonCount()).toBe(0);
  });

  // ─── Group B: Counter & Row Behavior (no save, discard via reload) ──────
  // After discard, state = 1 empty row at index 0. Use row 0 directly.

  test('TC-LOC-NTS-002: Type text in textarea and verify counter updates', async ({ locationNotesPage }) => {
    // Row 0 already exists from default state
    await locationNotesPage.fillNote(0, NOTE_TEXT_SHORT);
    expect(await locationNotesPage.getCharCount()).toBe(25);
    expect(await locationNotesPage.getCharCounterText()).toContain('25/4000');
    expect(await locationNotesPage.isSaveEnabled()).toBe(true);
    await locationNotesPage.discardChangesViaReload();
  });

  test('TC-LOC-NTS-003: Add second note row and verify Delete button behavior', async ({ locationNotesPage }) => {
    // Row 0 exists. Fill it, then Add row 1.
    await locationNotesPage.fillNote(0, NOTE_ROW1);
    expect(await locationNotesPage.getDeleteButtonCount()).toBeGreaterThan(0);
    await locationNotesPage.clickAdd();
    expect(await locationNotesPage.getNoteRowCount()).toBe(2);
    expect(await locationNotesPage.getDeleteButtonCount()).toBe(2);
    expect(await locationNotesPage.getCharCount()).toBe(11); // 10 + 1 delimiter
    await locationNotesPage.discardChangesViaReload();
  });

  test('TC-LOC-NTS-004: Multi-row counter includes delimiter per row boundary', async ({ locationNotesPage }) => {
    // Row 0 exists already
    await locationNotesPage.fillNote(0, NOTE_HELLO);
    expect(await locationNotesPage.getCharCount()).toBe(5);
    await locationNotesPage.clickAdd();
    expect(await locationNotesPage.getCharCount()).toBe(6); // +1 delimiter
    await locationNotesPage.fillNote(1, NOTE_WORLD);
    expect(await locationNotesPage.getCharCount()).toBe(11); // 5+1+5
    await locationNotesPage.clickAdd();
    expect(await locationNotesPage.getCharCount()).toBe(12); // +1 delimiter
    await locationNotesPage.fillNote(2, NOTE_END);
    expect(await locationNotesPage.getCharCount()).toBe(15); // 5+1+5+1+3
    await locationNotesPage.discardChangesViaReload();
  });

  test('TC-LOC-NTS-005: Delete a row and verify counter decreases', async ({ locationNotesPage }) => {
    await locationNotesPage.fillNote(0, NOTE_ROW1);
    await locationNotesPage.clickAdd();
    await locationNotesPage.fillNote(1, NOTE_ROW2);
    expect(await locationNotesPage.getCharCount()).toBe(22); // 10+1+11
    await locationNotesPage.deleteRow(1);
    expect(await locationNotesPage.getCharCount()).toBe(10);
    expect(await locationNotesPage.getDeleteButtonCount()).toBeGreaterThan(0);
    await locationNotesPage.discardChangesViaReload();
  });

  test('TC-LOC-NTS-006: Progress bar updates proportionally with character usage', async ({ locationNotesPage }) => {
    expect(await locationNotesPage.isProgressBarVisible()).toBe(true);
    await locationNotesPage.fillNote(0, NOTE_40_CHARS);
    expect(await locationNotesPage.isProgressBarVisible()).toBe(true);
    await locationNotesPage.fillNote(0, NOTE_2000_CHARS);
    expect(await locationNotesPage.getCharCount()).toBe(2000);
    await locationNotesPage.discardChangesViaReload();
  });

  test('TC-LOC-NTS-007: Verify 4000 character limit (soft enforcement)', async ({ locationNotesPage }) => {
    await locationNotesPage.fillNote(0, NOTE_4000_CHARS);
    expect(await locationNotesPage.getCharCount()).toBe(4000);
    expect(await locationNotesPage.getCharCounterText()).toContain('0 Left');
    // Paste 4001 chars — bypasses soft limit
    await locationNotesPage.pasteIntoNote(0, NOTE_4001_CHARS);
    expect(await locationNotesPage.getCharCount()).toBe(4001);
    // Verify no maxlength attribute
    expect(await locationNotesPage.getTextareaMaxlength(0)).toBeNull();
    await locationNotesPage.discardChangesViaReload();
  });

  // ─── Group C: Save & Persistence ────────────────────────────────────────

  test('TC-LOC-NTS-008: Save notes via left-panel Save button', async ({ locationNotesPage }) => {
    await locationNotesPage.fillNote(0, NOTE_SAVED);
    expect(await locationNotesPage.getCharCount()).toBe(18);
    await locationNotesPage.clickSaveButton();
    const { heading, body } = await locationNotesPage.getSaveDialogContent();
    expect(heading).toContain('Save Changes');
    expect(body).toContain('Are you sure you want to save the changes');
    await locationNotesPage.confirmSaveDialog();
    expect(await locationNotesPage.isSaveEnabled()).toBe(false);
    await locationNotesPage.ensureEmptyState();
  });

  test('TC-LOC-NTS-009: Notes persist after page reload', async ({ locationNotesPage }) => {
    await locationNotesPage.fillNote(0, NOTE_PERSISTENT);
    await locationNotesPage.saveAndConfirm();
    await locationNotesPage.reloadAndNavigateToNotesTab();
    expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_PERSISTENT);
    expect(await locationNotesPage.getCharCount()).toBeGreaterThanOrEqual(15);
    await locationNotesPage.ensureEmptyState();
  });

  // ─── Group D: State Preservation ────────────────────────────────────────

  test('TC-LOC-NTS-010: Tab switch preserves unsaved notes', async ({ locationNotesPage }) => {
    await locationNotesPage.fillNote(0, NOTE_TEMPORARY);
    expect(await locationNotesPage.getCharCount()).toBe(14);
    await locationNotesPage.switchToTab('tabCurrency');
    await locationNotesPage.clickNotesTab();
    expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_TEMPORARY);
    expect(await locationNotesPage.getCharCounterText()).toContain('14/4000');
    await locationNotesPage.discardChangesViaReload();
  });

  test('TC-LOC-NTS-011: Navigation away triggers browser beforeunload dialog', async ({ locationNotesPage }) => {
    await locationNotesPage.fillNote(0, NOTE_UNSAVED);
    expect(await locationNotesPage.isSaveEnabled()).toBe(true);
    const dialogAppeared = await locationNotesPage.navigateAwayWithUnsavedChanges('/');
    expect(dialogAppeared).toBe(true);
    // Dialog was dismissed — we're still on Notes tab. Discard via reload.
    await locationNotesPage.discardChangesViaReload();
  });

  test('TC-LOC-NTS-012: Delete all notes and save empty state', async ({ locationNotesPage }) => {
    await locationNotesPage.fillNote(0, NOTE_ROW1);
    await locationNotesPage.saveAndConfirm();
    // Delete saved note + save empty
    await locationNotesPage.ensureEmptyState();
    // Reload: default state = 1 empty row (DB is empty)
    await locationNotesPage.reloadAndNavigateToNotesTab();
    expect(await locationNotesPage.isDefaultEmptyState()).toBe(true);
  });

  // ─── Group E: Special Content Save+Reload (data-driven, 4 TCs) ─────────

  for (const tc of SPECIAL_CONTENT_TESTS) {
    test(`TC-LOC-NTS-${tc.tcId}: ${tc.name}`, async ({ locationNotesPage }) => {
      await locationNotesPage.fillNote(0, tc.text);
      await locationNotesPage.saveAndConfirm();
      await locationNotesPage.reloadAndNavigateToNotesTab();
      expect(await locationNotesPage.getNoteValue(0)).toBe(tc.text);
      await locationNotesPage.ensureEmptyState();
    });
  }

  // ─── Group F: Row Manipulation ──────────────────────────────────────────

  test('TC-LOC-NTS-014: Add multiple rows and verify sequential positions', async ({ locationNotesPage }) => {
    // Ensure row 0 exists, then add 2 more = 3 total
    await locationNotesPage.prepareEmptyRow();
    await locationNotesPage.clickAdd();
    await locationNotesPage.clickAdd();
    expect(await locationNotesPage.getNoteRowCount()).toBe(3);
    await locationNotesPage.fillNote(0, NOTE_ROW_A);
    await locationNotesPage.fillNote(1, NOTE_ROW_B);
    await locationNotesPage.fillNote(2, NOTE_ROW_C);
    expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_ROW_A);
    expect(await locationNotesPage.getNoteValue(1)).toBe(NOTE_ROW_B);
    expect(await locationNotesPage.getNoteValue(2)).toBe(NOTE_ROW_C);
    await locationNotesPage.discardChangesViaReload();
  });

  test('TC-LOC-NTS-015: Delete middle row and verify remaining rows shift', async ({ locationNotesPage }) => {
    await locationNotesPage.fillNote(0, NOTE_ROW_A);
    await locationNotesPage.clickAdd();
    await locationNotesPage.fillNote(1, NOTE_ROW_B);
    await locationNotesPage.clickAdd();
    await locationNotesPage.fillNote(2, NOTE_ROW_C);
    expect(await locationNotesPage.getCharCount()).toBe(17); // 5+1+5+1+5
    await locationNotesPage.deleteRow(1); // delete "Row B"
    expect(await locationNotesPage.getNoteRowCount()).toBe(2);
    expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_ROW_A);
    expect(await locationNotesPage.getNoteValue(1)).toBe(NOTE_ROW_C);
    expect(await locationNotesPage.getCharCount()).toBe(11); // 5+1+5
    await locationNotesPage.discardChangesViaReload();
  });

  test('TC-LOC-NTS-016: Empty row has no Delete — Delete appears on first keystroke', async ({ locationNotesPage }) => {
    // Prepare 1 empty row to test delete-button behavior
    await locationNotesPage.prepareEmptyRow();
    expect(await locationNotesPage.getDeleteButtonCount()).toBe(0);
    expect(await locationNotesPage.getCharCount()).toBe(0);
    await locationNotesPage.fillNote(0, 'a');
    expect(await locationNotesPage.getDeleteButtonCount()).toBeGreaterThan(0);
    await locationNotesPage.discardChangesViaReload();
  });

  test('TC-LOC-NTS-017: Delete last remaining row restores No Notes Available', async ({ locationNotesPage }) => {
    // Type in row 0 to get Delete button, then delete it
    await locationNotesPage.fillNote(0, NOTE_ROW1);
    expect(await locationNotesPage.getDeleteButtonCount()).toBeGreaterThan(0);
    await locationNotesPage.deleteRow(0);
    // After deleting typed row → "No Notes Available" appears
    expect(await locationNotesPage.isEmptyStateVisible()).toBe(true);
    expect(await locationNotesPage.getCharCount()).toBe(0);
    expect(await locationNotesPage.isAddButtonVisible()).toBe(true);
    await locationNotesPage.discardChangesViaReload();
  });

  // ─── Group G: Paste Boundary ────────────────────────────────────────────

  test('TC-LOC-NTS-021: Paste exceeds 4000 char limit — counter shows overage', async ({ locationNotesPage }) => {
    await locationNotesPage.pasteIntoNote(0, NOTE_4001_CHARS);
    expect(await locationNotesPage.getCharCount()).toBe(4001);
    expect(await locationNotesPage.getCharCounterText()).toContain('4001/4000');
    await locationNotesPage.discardChangesViaReload();
  });

  // ─── Group H: Keyboard Accessibility ────────────────────────────────────

  test('TC-LOC-NTS-022: Accessibility — keyboard navigation', async ({ locationNotesPage }) => {
    await locationNotesPage.prepareEmptyRow();
    const textarea = locationNotesPage['getElement']('txtNoteInputAll').nth(0);
    await textarea.focus();
    await textarea.type('Keyboard test');
    expect(await locationNotesPage.getNoteValue(0)).toContain('Keyboard test');
    expect(await locationNotesPage.isProgressBarVisible()).toBe(true);
    await locationNotesPage.discardChangesViaReload();
  });

  // ─── Group I: Full Lifecycle ────────────────────────────────────────────

  test('TC-LOC-NTS-023: Full lifecycle — add, save, reload, delete, save', async ({ locationNotesPage }) => {
    // Add + save
    await locationNotesPage.fillNote(0, NOTE_LIFECYCLE);
    expect(await locationNotesPage.getCharCount()).toBe(20);
    await locationNotesPage.saveAndConfirm();
    // Reload + verify
    await locationNotesPage.reloadAndNavigateToNotesTab();
    expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_LIFECYCLE);
    expect(await locationNotesPage.getCharCount()).toBeGreaterThanOrEqual(20);
    // Delete + save
    await locationNotesPage.ensureEmptyState();
    // Reload + verify default state
    await locationNotesPage.reloadAndNavigateToNotesTab();
    expect(await locationNotesPage.isDefaultEmptyState()).toBe(true);
  });

});
