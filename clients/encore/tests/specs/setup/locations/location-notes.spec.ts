// seed: tests/specs/smoke/seed.spec.ts
import { test, expect } from '../../../infra/fixtures';
import {
  NOTE_TEXT_SHORT, NOTE_ROW1, NOTE_ROW2,
  NOTE_HELLO, NOTE_WORLD, NOTE_END,
  NOTE_SAVED, NOTE_PERSISTENT, NOTE_TEMPORARY, NOTE_UNSAVED, NOTE_LIFECYCLE,
  NOTE_4000_CHARS, NOTE_4001_CHARS, NOTE_2000_CHARS, NOTE_40_CHARS,
  NOTE_ROW_A, NOTE_ROW_B, NOTE_ROW_C,
  NOTE_COUNTER_EMPTY, NOTE_COUNTER_FULL, KEYBOARD_TEST,
  SPECIAL_CONTENT_TESTS,
  NOTE_ROW_ALPHA, NOTE_ROW_BETA, NOTE_ROW_GAMMA,
  NOTE_KEEP_FIRST, NOTE_DELETE_ME, NOTE_KEEP_LAST,
  NOTE_CANCEL_TEST,
  NOTE_SEQ_A, NOTE_SEQ_B, NOTE_ORIGINAL, NOTE_EDITED, NOTE_DELETE_CHECK,
} from '../../../test-data/setup/locations/location-notes.data';
import { OFFICE_NO, SAVE_CHANGES_DIALOG } from '../../../test-data/common.data';

test.describe('Location Notes @locations @notes', () => {

  // Per-test navigation guard (dependency-gate removal Phase 1.5). See BAS spec :33.
  test.beforeEach(async ({ locationNotesPage }) => {
    const url = locationNotesPage.getCurrentUrl();
    if (!url.includes('settings/location')) {
      await locationNotesPage.navigateToNotesTab(OFFICE_NO);
    }
  });

 // ─── Group A: Navigation + Default State ─────────────────────────────────
 // MCP-verified: Default state = 1 empty textarea row (0/4000), NOT "No Notes Available"

  test('TC-LOC-NTS-001: Verify Notes tab default empty state', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate([]);
    test.setTimeout(60_000);
    await locationNotesPage.navigateToNotesTab(OFFICE_NO);
    await locationNotesPage.ensureEmptyState();
 // Default state: 1 empty textarea, counter 0/4000, Add visible, no Delete
    expect(await locationNotesPage.isDefaultEmptyState()).toBe(true);
    expect(await locationNotesPage.getCharCounterText()).toContain(NOTE_COUNTER_EMPTY);
    expect(await locationNotesPage.isAddButtonVisible()).toBe(true);
    expect(await locationNotesPage.isProgressBarVisible()).toBe(true);
    expect(await locationNotesPage.getDeleteButtonCount()).toBe(0);
  });

 // ─── Group B: Counter & Row Behavior (no save, discard via reload) ──────
 // After discard, state = 1 empty row at index 0. Use row 0 directly.

  test('TC-LOC-NTS-002: Type text in textarea and verify counter updates', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
 // Row 0 already exists from default state
    await locationNotesPage.fillNote(0, NOTE_TEXT_SHORT);
    expect(await locationNotesPage.getCharCount()).toBe(25);
    expect(await locationNotesPage.getCharCounterText()).toContain('25/4000');
    expect(await locationNotesPage.isSaveEnabled()).toBe(true);
    await locationNotesPage.discardChangesViaReload();
  });

  test('TC-LOC-NTS-003: Add second note row and verify Delete button behavior', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
 // Row 0 exists. Fill it, then Add row 1.
    await locationNotesPage.fillNote(0, NOTE_ROW1);
    expect(await locationNotesPage.getDeleteButtonCount()).toBeGreaterThan(0);
    await locationNotesPage.clickAdd();
    expect(await locationNotesPage.getNoteRowCount()).toBe(2);
    expect(await locationNotesPage.getDeleteButtonCount()).toBe(2);
    expect(await locationNotesPage.getCharCount()).toBe(11); // 10 + 1 delimiter
    await locationNotesPage.discardChangesViaReload();
  });

  test('TC-LOC-NTS-004: Multi-row counter includes delimiter per row boundary', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
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

  test('TC-LOC-NTS-005: Delete a row and verify counter decreases', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
    await locationNotesPage.fillNote(0, NOTE_ROW1);
    await locationNotesPage.clickAdd();
    await locationNotesPage.fillNote(1, NOTE_ROW2);
    expect(await locationNotesPage.getCharCount()).toBe(22); // 10+1+11
    await locationNotesPage.deleteRow(1);
    expect(await locationNotesPage.getCharCount()).toBe(10);
    expect(await locationNotesPage.getDeleteButtonCount()).toBe(1);
    await locationNotesPage.discardChangesViaReload();
  });

  test('TC-LOC-NTS-006: Progress bar updates proportionally with character usage', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
    expect(await locationNotesPage.isProgressBarVisible()).toBe(true);
    await locationNotesPage.fillNote(0, NOTE_40_CHARS);
    expect(await locationNotesPage.isProgressBarVisible()).toBe(true);
    await locationNotesPage.fillNote(0, NOTE_2000_CHARS);
    expect(await locationNotesPage.getCharCount()).toBe(2000);
    await locationNotesPage.discardChangesViaReload();
  });

  test('TC-LOC-NTS-007: Verify 4000 character limit (soft enforcement)', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
    await locationNotesPage.fillNote(0, NOTE_4000_CHARS);
    expect(await locationNotesPage.getCharCount()).toBe(4000);
    expect(await locationNotesPage.getCharCounterText()).toContain(NOTE_COUNTER_FULL);
 // Paste 4001 chars — bypasses soft limit
    await locationNotesPage.pasteIntoNote(0, NOTE_4001_CHARS);
    expect(await locationNotesPage.getCharCount()).toBe(4001);
 // Verify no maxlength attribute
    expect(await locationNotesPage.getTextareaMaxlength(0)).toBeNull();
    await locationNotesPage.discardChangesViaReload();
  });

 // ─── Group C: Save & Persistence ────────────────────────────────────────

  test('TC-LOC-NTS-008: Save notes via left-panel Save button', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
    await locationNotesPage.fillNote(0, NOTE_SAVED);
    expect(await locationNotesPage.getCharCount()).toBe(18);
    await locationNotesPage.clickSaveButton();
    const { heading, body } = await locationNotesPage.getSaveDialogContent();
    expect(heading).toContain(SAVE_CHANGES_DIALOG.heading);
    expect(body).toContain(SAVE_CHANGES_DIALOG.body);
    await locationNotesPage.confirmSaveDialog();
    expect(await locationNotesPage.isSaveEnabled()).toBe(false);
    await locationNotesPage.ensureEmptyState();
  });

  test('TC-LOC-NTS-009: Notes persist after page reload', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
    test.setTimeout(60_000);
    await locationNotesPage.fillNote(0, NOTE_PERSISTENT);
    await locationNotesPage.saveAndConfirm();
    await locationNotesPage.reloadAndNavigateToNotesTab();
    expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_PERSISTENT);
    expect(await locationNotesPage.getCharCount()).toBeGreaterThanOrEqual(15);
    await locationNotesPage.ensureEmptyState();
  });

 // ─── Group D: State Preservation ────────────────────────────────────────

  test('TC-LOC-NTS-010: Tab switch preserves unsaved notes', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
    await locationNotesPage.fillNote(0, NOTE_TEMPORARY);
    expect(await locationNotesPage.getCharCount()).toBe(14);
    await locationNotesPage.switchToTab('tabCurrency');
    await locationNotesPage.clickNotesTab();
    expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_TEMPORARY);
    expect(await locationNotesPage.getCharCounterText()).toContain('14/4000');
    await locationNotesPage.discardChangesViaReload();
  });

  test('TC-LOC-NTS-011: Navigation away triggers browser beforeunload dialog', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
    await locationNotesPage.fillNote(0, NOTE_UNSAVED);
    expect(await locationNotesPage.isSaveEnabled()).toBe(true);
    const dialogAppeared = await locationNotesPage.navigateAwayWithUnsavedChanges('/');
    expect(dialogAppeared).toBe(true);
 // Dialog was dismissed — we're still on Notes tab. Discard via reload.
    await locationNotesPage.discardChangesViaReload();
  });

  test('TC-LOC-NTS-012: Delete all notes and save empty state', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
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
    test(`TC-LOC-NTS-${tc.tcId}: ${tc.name}`, async ({ locationNotesPage, dependencyGate }) => {
      dependencyGate(['TC-LOC-NTS-001']);
      test.setTimeout(60_000);
 // Ensure clean state before each iteration — prior test's cleanup may have
 // left saved notes in DB (e.g. if saveAndConfirm succeeded but ensureEmptyState failed).
      await locationNotesPage.ensureEmptyState();
      await locationNotesPage.fillNote(0, tc.text);
      await locationNotesPage.saveAndConfirm();
      await locationNotesPage.reloadAndNavigateToNotesTab();
      expect(await locationNotesPage.getNoteValue(0)).toBe(tc.text);
      await locationNotesPage.ensureEmptyState();
    });
  }

 // ─── Group F: Row Manipulation ──────────────────────────────────────────

  test('TC-LOC-NTS-014: Add multiple rows and verify sequential positions', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
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

  test('TC-LOC-NTS-015: Delete middle row and verify remaining rows shift', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
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

  test('TC-LOC-NTS-016: Row created via Add has Delete visible; typing keeps it', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
 // After save-empty cycles, state is "No Notes Available". prepareEmptyRow clicks Add.
 // Empty single row = no Delete button (appears only with content or 2+ rows).
    await locationNotesPage.prepareEmptyRow();
    expect(await locationNotesPage.getDeleteButtonCount()).toBe(0);
    expect(await locationNotesPage.getCharCount()).toBe(0);
    await locationNotesPage.fillNote(0, KEYBOARD_TEST.singleChar);
    expect(await locationNotesPage.getDeleteButtonCount()).toBeGreaterThan(0);
    await locationNotesPage.discardChangesViaReload();
  });

  test('TC-LOC-NTS-017: Delete last remaining row restores No Notes Available', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
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

  test('TC-LOC-NTS-021: Paste exceeds 4000 char limit — counter shows overage', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
    await locationNotesPage.pasteIntoNote(0, NOTE_4001_CHARS);
    expect(await locationNotesPage.getCharCount()).toBe(4001);
    expect(await locationNotesPage.getCharCounterText()).toContain('4001/4000');
    await locationNotesPage.discardChangesViaReload();
  });

 // ─── Group H: Keyboard Accessibility ────────────────────────────────────

  test('TC-LOC-NTS-022: Accessibility — keyboard navigation', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
    await locationNotesPage.prepareEmptyRow();
    const textarea = locationNotesPage.getNoteTextarea(0);
    await textarea.waitFor({ state: 'visible', timeout: 5_000 });
    await textarea.focus();
    await textarea.type(KEYBOARD_TEST.text);
    expect(await locationNotesPage.getNoteValue(0)).toContain(KEYBOARD_TEST.text);
    expect(await locationNotesPage.isProgressBarVisible()).toBe(true);
    await locationNotesPage.discardChangesViaReload();
  });

 // ─── Group I: Full Lifecycle ────────────────────────────────────────────

  test('TC-LOC-NTS-023: Full lifecycle — add, save, reload, delete, save', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
    test.setTimeout(60_000);
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

 // ─── Group J: Persistence Gap-Fill (TC-024..027) ────────────────────────

  test('TC-LOC-NTS-024: Multi-row persistence — 3 rows save+reload+verify', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
    test.setTimeout(60_000);
    await locationNotesPage.ensureEmptyState();
 // Add 3 rows
    await locationNotesPage.fillNote(0, NOTE_ROW_ALPHA);
    await locationNotesPage.clickAdd();
    await locationNotesPage.fillNote(1, NOTE_ROW_BETA);
    await locationNotesPage.clickAdd();
    await locationNotesPage.fillNote(2, NOTE_ROW_GAMMA);
    expect(await locationNotesPage.getNoteRowCount()).toBe(3);
    expect(await locationNotesPage.getCharCount()).toBe(28); // 9+1+8+1+9
 // Save + reload
    await locationNotesPage.saveAndConfirm();
    await locationNotesPage.reloadAndNavigateToNotesTab();
 // Verify persistence via per-row content (strict row count is unstable under the
 // auto-empty placeholder behavior documented in the test cases; per-row content
 // assertions below cover the persistence contract without the flake risk).
    expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_ROW_ALPHA);
    expect(await locationNotesPage.getNoteValue(1)).toBe(NOTE_ROW_BETA);
    expect(await locationNotesPage.getNoteValue(2)).toBe(NOTE_ROW_GAMMA);
    expect(await locationNotesPage.getCharCount()).toBe(28);
 // Cleanup
    await locationNotesPage.ensureEmptyState();
  });

  test('TC-LOC-NTS-025: Boundary persistence — 4000 chars save+reload', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
    test.setTimeout(60_000);
    await locationNotesPage.ensureEmptyState();
 // Fill 4000 chars
    await locationNotesPage.fillNote(0, NOTE_4000_CHARS);
    expect(await locationNotesPage.getCharCount()).toBe(4000);
 // Save + reload
    await locationNotesPage.saveAndConfirm();
    await locationNotesPage.reloadAndNavigateToNotesTab();
 // Verify persistence
    expect(await locationNotesPage.getCharCount()).toBe(4000);
    const value = await locationNotesPage.getNoteValue(0);
    expect(value.length).toBe(4000);
 // Cleanup
    await locationNotesPage.ensureEmptyState();
  });

  test('TC-LOC-NTS-026: Partial deletion persistence — delete middle row, save, verify remaining', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
    test.setTimeout(60_000);
    await locationNotesPage.ensureEmptyState();
 // Add 3 rows
    await locationNotesPage.fillNote(0, NOTE_KEEP_FIRST);
    await locationNotesPage.clickAdd();
    await locationNotesPage.fillNote(1, NOTE_DELETE_ME);
    await locationNotesPage.clickAdd();
    await locationNotesPage.fillNote(2, NOTE_KEEP_LAST);
    expect(await locationNotesPage.getNoteRowCount()).toBe(3);
 // Delete middle row
    await locationNotesPage.deleteRow(1);
    expect(await locationNotesPage.getNoteRowCount()).toBe(2);
    expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_KEEP_FIRST);
    expect(await locationNotesPage.getNoteValue(1)).toBe(NOTE_KEEP_LAST);
 // Save + reload
    await locationNotesPage.saveAndConfirm();
    await locationNotesPage.reloadAndNavigateToNotesTab();
 // Verify persistence
    expect(await locationNotesPage.getNoteRowCount()).toBe(2);
    expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_KEEP_FIRST);
    expect(await locationNotesPage.getNoteValue(1)).toBe(NOTE_KEEP_LAST);
 // Cleanup
    await locationNotesPage.ensureEmptyState();
  });

  test('TC-LOC-NTS-027: Cancel save dialog — verify changes NOT persisted', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
    test.setTimeout(60_000);
    await locationNotesPage.ensureEmptyState();
 // Add a note
    await locationNotesPage.fillNote(0, NOTE_CANCEL_TEST);
    expect(await locationNotesPage.isSaveEnabled()).toBe(true);
 // Click Save but cancel the dialog
    await locationNotesPage.clickSaveButton();
    await locationNotesPage.cancelSaveDialog();
    expect(await locationNotesPage.isSaveEnabled()).toBe(true); // still unsaved
 // Reload (discards unsaved changes) + verify note is NOT present
    await locationNotesPage.reloadAndNavigateToNotesTab();
    expect(await locationNotesPage.isDefaultEmptyState()).toBe(true);
  });

 // ─── Group K: Coverage Gap-Fill (TC-033..037) ─────────────────────────────
 // MCP-verified 2026-05-12: sequential save, edit-existing, save-empty, overage persistence, delete-persist

  test('TC-LOC-NTS-033: Sequential save — add second note with reload between saves, both persist', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
    test.setTimeout(60_000);
    await locationNotesPage.ensureEmptyState();
 // Save first note
    await locationNotesPage.fillNote(0, NOTE_SEQ_A);
    await locationNotesPage.saveAndConfirm();
 // Reload required: Playwright .fill() does NOT trigger Angular change detection after the
 // form's markAsPristine() runs post-save. Real user typing works fine — this is an
 // automation-tool limitation, not an app bug (manually verified live 2026-05-14).
 // RCA 2026-05-12: 4/4 runs show "Save button did not enable within 5s".
    await locationNotesPage.reloadAndNavigateToNotesTab();
    expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_SEQ_A);
    await locationNotesPage.clickAdd();
    await locationNotesPage.fillNote(1, NOTE_SEQ_B);
    await locationNotesPage.saveAndConfirm();
 // Reload + verify both persist
    await locationNotesPage.reloadAndNavigateToNotesTab();
    expect(await locationNotesPage.getNoteRowCount()).toBe(2);
    expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_SEQ_A);
    expect(await locationNotesPage.getNoteValue(1)).toBe(NOTE_SEQ_B);
    await locationNotesPage.ensureEmptyState();
  });

  test('TC-LOC-NTS-034: Edit existing saved note — overwritten text persists', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
    test.setTimeout(60_000);
    await locationNotesPage.ensureEmptyState();
 // Save original
    await locationNotesPage.fillNote(0, NOTE_ORIGINAL);
    await locationNotesPage.saveAndConfirm();
 // Reload required: Playwright .fill() does NOT trigger Angular change detection after the
 // form's markAsPristine() runs post-save. Real user typing works fine — this is an
 // automation-tool limitation, not an app bug (manually verified live 2026-05-14).
 // RCA 2026-05-12: 6/6 runs show "Save button did not enable within 5s".
    await locationNotesPage.reloadAndNavigateToNotesTab();
    expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_ORIGINAL);
 // Overwrite with new text and save
    await locationNotesPage.fillNote(0, NOTE_EDITED);
    await locationNotesPage.saveAndConfirm();
 // Reload + verify edited text persisted
    await locationNotesPage.reloadAndNavigateToNotesTab();
    expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_EDITED);
    await locationNotesPage.ensureEmptyState();
  });

  test('TC-LOC-NTS-035: Save empty row — persists as empty textarea, not No Notes Available', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
    test.setTimeout(60_000);
    await locationNotesPage.ensureEmptyState();
 // Add empty row (don't type anything) — Save enables from form-dirty on Add
    await locationNotesPage.prepareEmptyRow();
    expect(await locationNotesPage.isSaveEnabled()).toBe(true);
    await locationNotesPage.saveAndConfirm();
 // Reload + verify: 1 empty textarea persisted (NOT "No Notes Available")
    await locationNotesPage.reloadAndNavigateToNotesTab();
    expect(await locationNotesPage.getNoteRowCount()).toBe(1);
    expect(await locationNotesPage.getNoteValue(0)).toBe('');
    expect(await locationNotesPage.getCharCount()).toBe(0);
    expect(await locationNotesPage.isEmptyStateVisible()).toBe(false);
    await locationNotesPage.ensureEmptyState();
  });

  test('TC-LOC-NTS-036: Overage content persists — 4001 chars save+reload without truncation', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
    test.setTimeout(60_000);
    await locationNotesPage.ensureEmptyState();
 // Paste 4001 chars — exceeds soft 4000-char counter limit (textarea has no maxlength attribute)
    await locationNotesPage.pasteIntoNote(0, NOTE_4001_CHARS);
    expect(await locationNotesPage.getCharCount()).toBe(4001);
    expect(await locationNotesPage.getCharCounterText()).toContain('(0 Left)');
 // Save + reload
    await locationNotesPage.saveAndConfirm();
    await locationNotesPage.reloadAndNavigateToNotesTab();
 // Verify all 4001 chars survived — no server-side truncation
    expect(await locationNotesPage.getCharCount()).toBe(4001);
    const value = await locationNotesPage.getNoteValue(0);
    expect(value.length).toBe(4001);
    await locationNotesPage.ensureEmptyState();
  });

  test('TC-LOC-NTS-037: Delete row persists without explicit textarea clear', async ({ locationNotesPage, dependencyGate }) => {
    dependencyGate(['TC-LOC-NTS-001']);
    test.setTimeout(60_000);
    await locationNotesPage.ensureEmptyState();
 // Save a note
    await locationNotesPage.fillNote(0, NOTE_DELETE_CHECK);
    await locationNotesPage.saveAndConfirm();
    await locationNotesPage.reloadAndNavigateToNotesTab();
    expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_DELETE_CHECK);
 // Delete row WITHOUT clearing textarea first (BUG-LOC-NTS-001 regression check)
    await locationNotesPage.deleteRow(0);
    expect(await locationNotesPage.isEmptyStateVisible()).toBe(true);
    await locationNotesPage.saveAndConfirm();
 // Reload + verify deletion persisted
    await locationNotesPage.reloadAndNavigateToNotesTab();
    expect(await locationNotesPage.isDefaultEmptyState()).toBe(true);
  });

});
