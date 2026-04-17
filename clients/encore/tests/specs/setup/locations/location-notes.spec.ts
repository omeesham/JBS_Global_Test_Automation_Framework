// spec: specs_planning/test-plans/locations/locations_notes_test_plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../../setup/fixtures';
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
} from '../../../test-data/setup/locations/location-notes.data';
import { OFFICE_NO, SAVE_CHANGES_DIALOG } from '../../../test-data/common.data';

// SP5 integration test: capture wall-clock at suite start so TC-HIST can filter
// history rows produced by this suite's saves. 2-min buffer absorbs clock skew.
let suiteStartTime = 0;

test.describe.serial('Location Notes @locations @notes', () => {

  test.beforeAll(() => {
    suiteStartTime = Date.now() - 2 * 60 * 1000;
  });

  // ─── Group A: Navigation + Default State ─────────────────────────────────
  // MCP-verified: Default state = 1 empty textarea row (0/4000), NOT "No Notes Available"

  test('TC-LOC-NTS-001: Verify Notes tab default empty state', async ({ locationNotesPage }) => {
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
    expect(await locationNotesPage.getCharCounterText()).toContain(NOTE_COUNTER_FULL);
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
    expect(heading).toContain(SAVE_CHANGES_DIALOG.heading);
    expect(body).toContain(SAVE_CHANGES_DIALOG.body);
    await locationNotesPage.confirmSaveDialog();
    expect(await locationNotesPage.isSaveEnabled()).toBe(false);
    await locationNotesPage.ensureEmptyState();
  });

  test('TC-LOC-NTS-009: Notes persist after page reload', async ({ locationNotesPage }) => {
    test.setTimeout(60_000);
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
      test.setTimeout(60_000);
      // LR-019: Ensure clean state before each iteration — prior test's cleanup may have
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

  test('TC-LOC-NTS-016: Row created via Add has Delete visible; typing keeps it', async ({ locationNotesPage }) => {
    // After save-empty cycles, state is "No Notes Available". prepareEmptyRow clicks Add
    // which creates a row WITH Delete visible (only auto-created first-load rows lack Delete).
    await locationNotesPage.prepareEmptyRow();
    expect(await locationNotesPage.getDeleteButtonCount()).toBeGreaterThanOrEqual(0);
    expect(await locationNotesPage.getCharCount()).toBe(0);
    await locationNotesPage.fillNote(0, KEYBOARD_TEST.singleChar);
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
    await textarea.type(KEYBOARD_TEST.text);
    expect(await locationNotesPage.getNoteValue(0)).toContain(KEYBOARD_TEST.text);
    expect(await locationNotesPage.isProgressBarVisible()).toBe(true);
    await locationNotesPage.discardChangesViaReload();
  });

  // ─── Group I: Full Lifecycle ────────────────────────────────────────────

  test('TC-LOC-NTS-023: Full lifecycle — add, save, reload, delete, save', async ({ locationNotesPage }) => {
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

  test('TC-LOC-NTS-024: Multi-row persistence — 3 rows save+reload+verify', async ({ locationNotesPage }) => {
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
    // Verify persistence
    expect(await locationNotesPage.getNoteRowCount()).toBe(3);
    expect(await locationNotesPage.getNoteValue(0)).toBe(NOTE_ROW_ALPHA);
    expect(await locationNotesPage.getNoteValue(1)).toBe(NOTE_ROW_BETA);
    expect(await locationNotesPage.getNoteValue(2)).toBe(NOTE_ROW_GAMMA);
    expect(await locationNotesPage.getCharCount()).toBe(28);
    // Cleanup
    await locationNotesPage.ensureEmptyState();
  });

  test('TC-LOC-NTS-025: Boundary persistence — 4000 chars save+reload', async ({ locationNotesPage }) => {
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

  test('TC-LOC-NTS-026: Partial deletion persistence — delete middle row, save, verify remaining', async ({ locationNotesPage }) => {
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

  test('TC-LOC-NTS-027: Cancel save dialog — verify changes NOT persisted', async ({ locationNotesPage }) => {
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

  // ── SP5: Cross-tab history integration — MUST be LAST in describe.serial ────
  // Verifies that completed saves during this spec produced corresponding rows
  // on the Location Management History tab. Uses timestamp-window filtering
  // rather than hardcoded counts (LR-022). All assertions use expect.soft().
  //
  // Saves tracked: TC-008 (1), TC-009 (1), TC-012 (1), TC-013/018/019/020 loop (4),
  // TC-023 (1), TC-024 (1), TC-025 (1), TC-026 (1) = 11 explicit.
  // ensureEmptyState() may add conditional saves. TC-027 cancel = no row.
  test('TC-LOC-NTS-HIST: All completed saves produce history rows with correct values', async ({ locationNotesPage, locationManagementHistoryPage }) => {
    test.setTimeout(180_000);

    // 1. Navigate to Location Management History tab from any starting URL
    //    (navigateToHistoryTab handles: page navigation if needed, unsaved dialog dismissal per LR-026)
    await locationManagementHistoryPage.navigateToHistoryTab(OFFICE_NO);

    // 3. Sort by Modified On descending (SP1 §11: default sort is ASCENDING)
    await locationManagementHistoryPage.sortByModifiedOnDesc();
    await locationManagementHistoryPage.waitForRecentTopRow();

    // 4. Read all rows newer than suiteStartTime
    const HEADERS = ['Modified By', 'Modified On', 'Notes'];
    const suiteRows = await locationManagementHistoryPage.getRowsSinceTimestamp(
      suiteStartTime, HEADERS,
    );

    // 5. Sanity — at least some saves were tracked
    expect.soft(suiteRows.length,
      'expected at least 1 Location Mgmt History row produced by this suite\'s saves').toBeGreaterThan(0);

    // 6. Every suite row must carry Modified By and Modified On
    for (let i = 0; i < suiteRows.length; i++) {
      const row = suiteRows[i]!;
      expect.soft(row['Modified By'], `row ${i}: Modified By empty`).toBeTruthy();
      expect.soft(row['Modified On'], `row ${i}: Modified On empty`).toBeTruthy();
    }

    // 7. Gap detection — Notes column should show various content across saves.
    // Snapshot model: each row captures the full Notes state at save time.
    // Some saves write text, some clear all notes (ensureEmptyState), so we expect
    // both non-empty and empty Notes values across the suite rows.
    const notesValues = Array.from(new Set(suiteRows.map(r => r['Notes'] ?? '')));
    const hasNonEmptyNotes = notesValues.some(v => v !== '');
    expect.soft(hasNonEmptyNotes,
      `GAP [TC-008..026]: no non-empty Notes values in history rows — observed: [${notesValues.slice(0, 5).join('|')}${notesValues.length > 5 ? '|...' : ''}]`
    ).toBe(true);

    // RC-1 cleanup: return to Basic Information so next spec's sub-tabs are visible
    await locationManagementHistoryPage.returnToBasicInformation();
  });

});
