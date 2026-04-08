# Location Notes Test Plan
**Module**: locations | **Updated**: 2026-04-08
**Test Cases**: specs_planning/test-cases/locations/locations_notes_test_cases.md

## Selector Mapping (Verified 2026-03-17 from src/selectors/locations/notes.ts)

| TC ID | Selector Keys Used |
|---|---|
| TC-LOC-NTS-001 | tabNotes, sectionNotes, tblNotes, lblNoNotesAvailable, btnNotesAdd, barNotesProgress, lblNotesCharCounter |
| TC-LOC-NTS-002 | tabNotes, btnNotesAdd, txtNoteRow0, lblNotesCharCounter, btnSaveNotes |
| TC-LOC-NTS-003 | tabNotes, btnNotesAdd, txtNoteRow0, txtNoteInputAll, btnNotesDelete, lblNotesCharCounter |
| TC-LOC-NTS-004 | tabNotes, btnNotesAdd, txtNoteInputAll, lblNotesCharCounter |
| TC-LOC-NTS-005 | tabNotes, btnNotesAdd, txtNoteInputAll, btnNotesDelete, lblNotesCharCounter |
| TC-LOC-NTS-006 | tabNotes, btnNotesAdd, txtNoteRow0, barNotesProgress |
| TC-LOC-NTS-007 | tabNotes, btnNotesAdd, txtNoteRow0, lblNotesCharCounter, barNotesProgress |
| TC-LOC-NTS-008 | tabNotes, btnNotesAdd, txtNoteRow0, btnSaveNotes, dlgSaveChanges, btnSaveChangesConfirm |
| TC-LOC-NTS-009 | tabNotes, btnNotesAdd, txtNoteRow0, btnSaveNotes, dlgSaveChanges, btnSaveChangesConfirm |
| TC-LOC-NTS-010 | tabNotes, btnNotesAdd, txtNoteRow0, tabCurrency, lblNotesCharCounter |
| TC-LOC-NTS-011 | tabNotes, btnNotesAdd, txtNoteRow0, btnSaveNotes |
| TC-LOC-NTS-012 | tabNotes, sectionNotes, btnNotesDelete, btnSaveNotes, dlgSaveChanges, btnSaveChangesConfirm |
| TC-LOC-NTS-013 | tabNotes, btnNotesAdd, txtNoteRow0, btnSaveNotes, dlgSaveChanges, btnSaveChangesConfirm |
| TC-LOC-NTS-014 | tabNotes, btnNotesAdd, txtNoteInputAll, btnNotesDelete |
| TC-LOC-NTS-015 | tabNotes, btnNotesAdd, txtNoteInputAll, btnNotesDelete, lblNotesCharCounter |
| TC-LOC-NTS-016 | tabNotes, btnNotesAdd, sectionNotes, txtNoteRow0, btnNotesDelete |
| TC-LOC-NTS-017 | tabNotes, sectionNotes, btnNotesDelete, btnSaveNotes |
| TC-LOC-NTS-018 | tabNotes, btnNotesAdd, txtNoteRow0, btnSaveNotes, dlgSaveChanges, btnSaveChangesConfirm |
| TC-LOC-NTS-019 | tabNotes, btnNotesAdd, txtNoteRow0, btnSaveNotes, dlgSaveChanges, btnSaveChangesConfirm |
| TC-LOC-NTS-020 | tabNotes, btnNotesAdd, txtNoteRow0, btnSaveNotes, dlgSaveChanges, btnSaveChangesConfirm |
| TC-LOC-NTS-021 | tabNotes, btnNotesAdd, txtNoteRow0, lblNotesCharCounter |
| TC-LOC-NTS-022 | tabNotes, btnNotesAdd, txtNoteInputAll, btnNotesAdd, barNotesProgress |
| TC-LOC-NTS-023 | tabNotes, btnNotesAdd, txtNoteRow0, btnNotesDelete, btnSaveNotes, dlgSaveChanges, btnSaveChangesConfirm |
| TC-LOC-NTS-024 | tabNotes, btnNotesAdd, txtNoteInputAll, btnSaveNotes, dlgSaveChanges, btnSaveChangesConfirm, lblNotesCharCounter |
| TC-LOC-NTS-025 | tabNotes, btnNotesAdd, txtNoteRow0, btnSaveNotes, dlgSaveChanges, btnSaveChangesConfirm, lblNotesCharCounter |
| TC-LOC-NTS-026 | tabNotes, btnNotesAdd, txtNoteInputAll, btnNotesDelete, btnSaveNotes, dlgSaveChanges, btnSaveChangesConfirm |
| TC-LOC-NTS-027 | tabNotes, btnNotesAdd, txtNoteRow0, btnSaveNotes, dlgSaveChanges, btnSaveChangesCancel |

## UI Testing Checklist (Verified 2026-03-17)

| Check | Status |
|---|---|
| selectorReconciliation | ✓ 13 Notes selectors in notes.ts — all verified via querySelectorAll count=1 on live DOM 2026-03-17 |
| emptyStateVerified | ✓ "No Notes Available" state confirmed as default (NOT 1 default row as old run claimed) |
| deleteButtonBehavior | ✓ Delete appears when row has content (not only 2+ rows) OR when 2+ rows exist |
| saveDialogVerified | ✓ alertdialog "Save Changes" heading + body + Cancel/Save buttons confirmed |
| persistenceVerified | ✓ Save→reload→verify confirmed; delete→save→reload→verify confirmed |
| boundaryTested | ✓ XSS/SQL stored as text; emoji preserved; 4000 soft limit (no maxlength) |
| a11yGapsDocumented | ✓ textarea no aria-label; progressbar no aria-valuenow + no aria-label |
| explorationCleanup | ✓ Notes restored to empty state at end of session |

---

## Scenario: TC-LOC-NTS-001 - Verify Notes tab default empty state
1. Step: `[data-testid="location-settings-sub-tab-notes"]`.click(), expected: Notes tabpanel active
2. Step: Verify `[data-testid="location-settings-section-notes"] td:has-text("No Notes Available")` visible, expected: empty state row present
3. Step: Verify NO `<thead>` in table, expected: 0 column headers in DOM
4. Step: Verify counter text contains "0/4000", expected: "0/4000" and "(4000 Left)"
5. Step: Verify `[data-testid="location-settings-section-notes"] button:has-text("Add")` enabled, expected: Add present
6. Step: Verify `[role="progressbar"]` present in section, expected: progressbar visible
7. Step: Verify 0 Delete buttons in section, expected: no Delete button

---

## Scenario: TC-LOC-NTS-002 - Type text and verify character counter
1. Step: `[data-testid="location-settings-sub-tab-notes"]`.click(), expected: Notes tab active
2. Step: `[data-testid="location-settings-section-notes"] button:has-text("Add")`.click(), expected: empty row with textarea
3. Step: `textarea[name="notes.notes.0.note"]`.fill("Test note for exploration"), expected: text entered
4. Step: Verify counter text, expected: "25/4000" with "(3975 Left)"
5. Step: Verify `[data-testid="location-settings-btn-save"]` enabled, expected: Save button enabled

---

## Scenario: TC-LOC-NTS-003 - Add second row and verify Delete button behavior
1. Step: Add row, fill "First note" in `textarea[name="notes.notes.0.note"]`, expected: counter "10/4000", Delete on row 1
2. Step: `button:has-text("Add")`.click(), expected: row 2 textarea appears
3. Step: Verify Delete on row 1 (content row), expected: still present
4. Step: Verify Delete on row 2 (empty row, 2+ rows), expected: also present
5. Step: Verify counter, expected: "11/4000" (10 + 1 delimiter)

---

## Scenario: TC-LOC-NTS-004 - Multi-row counter includes delimiter
1. Step: Add row, fill "Hello" in textarea.nth(0), expected: counter "5/4000"
2. Step: `button:has-text("Add")`.click(), expected: counter "6/4000" (delimiter)
3. Step: textarea.nth(1).fill("World"), expected: counter "11/4000"
4. Step: `button:has-text("Add")`.click(), expected: counter "12/4000"
5. Step: textarea.nth(2).fill("End"), expected: counter "15/4000"

---

## Scenario: TC-LOC-NTS-005 - Delete row and verify counter decreases
1. Step: Add row, fill "First note", click Add, fill "Second note" in nth(1), expected: counter "22/4000"
2. Step: `[data-testid="location-settings-section-notes"] button:has-text("Delete")`.nth(1).click(), expected: row 2 removed
3. Step: Verify counter, expected: "10/4000"
4. Step: Verify Delete still on row 1 (has content), expected: 1 Delete button remains

---

## Scenario: TC-LOC-NTS-006 - Progress bar updates with character usage
1. Step: Add row, expected: progressbar at minimal fill
2. Step: Fill 40-char string, expected: bar slightly fills
3. Step: Fill 2000-char string, expected: bar ~50% filled proportionally

---

## Scenario: TC-LOC-NTS-007 - 4000 character limit (soft enforcement)
1. Step: Add row, fill 4000-char string, expected: counter "4000/4000(0 Left)", bar full
2. Step: Type 1 more char via keyboard, expected: blocked (key ignored at limit)
3. Step: Paste 4001-char string, expected: counter "4001/4000(0 Left)" — soft limit bypass
4. Step: Verify textarea has no `maxlength` attribute, expected: null/absent

---

## Scenario: TC-LOC-NTS-008 - Save notes via left-panel Save
1. Step: Add row, fill "Saved note content" (18 chars), expected: counter "18/4000"
2. Step: `[data-testid="location-settings-btn-save"]`.click(), expected: `[role="alertdialog"]` appears
3. Step: Verify alertdialog heading, expected: "Save Changes"
4. Step: Verify alertdialog body, expected: "Are you sure you want to save the changes?"
5. Step: `[role="alertdialog"] button:has-text("Save")`.click(), expected: dialog closes
6. Step: Verify `[data-testid="location-settings-btn-save"]` disabled, expected: no pending changes

---

## Scenario: TC-LOC-NTS-009 - Notes persist after page reload
1. Step: Add row, fill "Persistent note", save + confirm, expected: saved
2. Step: `page.goto(same URL)`, expected: page reloads
3. Step: Wait for `[data-testid="location-settings-section-notes"]` visible (~2s), expected: section loads
4. Step: `[data-testid="location-settings-sub-tab-notes"]`.click(), expected: Notes tab active
5. Step: Verify `textarea[name="notes.notes.0.note"]` value, expected: "Persistent note"
6. Step: Verify counter, expected: "15/4000(3985 Left)"

---

## Scenario: TC-LOC-NTS-010 - Tab switch preserves unsaved notes
1. Step: Add row, fill "Temporary text" (14 chars), expected: counter "14/4000"
2. Step: `[data-testid="location-settings-sub-tab-currency"]`.click(), expected: Currency tab loads
3. Step: `[data-testid="location-settings-sub-tab-notes"]`.click(), expected: Notes tab reloads
4. Step: Verify textarea value, expected: "Temporary text"
5. Step: Verify counter, expected: "14/4000(3986 Left)"

---

## Scenario: TC-LOC-NTS-011 - Navigation away triggers browser beforeunload dialog
1. Step: Add row, fill "Unsaved text", expected: Save button enables
2. Step: `page.goto(different URL)`, expected: browser `beforeunload` dialog fires
3. Step: Accept navigation, expected: page navigates away, changes discarded

---

## Scenario: TC-LOC-NTS-012 - Delete all notes and save empty state
1. Step: Open Notes tab with existing note, expected: row visible with Delete
2. Step: `button:has-text("Delete")`.click(), expected: "No Notes Available"; counter "0/4000"
3. Step: Save + confirm, expected: saved
4. Step: Reload + click Notes tab, expected: "No Notes Available" persists

---

## Scenario: TC-LOC-NTS-013 - Special characters stored correctly
1. Step: Add row, fill `"test" <div> &amp; é ñ`, expected: chars appear
2. Step: Verify counter matches character count, expected: accurate
3. Step: Save + confirm, reload, click Notes tab, expected: special chars preserved exactly

---

## Scenario: TC-LOC-NTS-014 - Add multiple rows and verify sequential positions
1. Step: Add row (nth=0), Add row (nth=1), Add row (nth=2), expected: 3 textareas
2. Step: Verify all 3 rows have Delete buttons (2+ rows rule), expected: 3 Delete buttons
3. Step: Verify each textarea has placeholder "Type notes here...", expected: consistent
4. Step: Type distinct text in each via `textarea.nth(0)`, `.nth(1)`, `.nth(2)`, expected: independent content

---

## Scenario: TC-LOC-NTS-015 - Delete middle row and verify remaining rows shift
1. Step: Fill "Row A" (nth=0), "Row B" (nth=1), "Row C" (nth=2), expected: 3 rows
2. Step: `button:has-text("Delete")`.nth(1).click(), expected: "Row B" removed
3. Step: Verify `textarea.nth(0)` = "Row A", `textarea.nth(1)` = "Row C", expected: shift correct
4. Step: Verify counter decreases by "Row B" + 1 delimiter, expected: correct total

---

## Scenario: TC-LOC-NTS-016 - Empty row has no Delete; Delete on first keystroke
1. Step: Open Notes tab, click Add, expected: empty row; count Delete buttons = 0
2. Step: Verify counter "0/4000(4000 Left)", expected: no delimiter added yet
3. Step: Type "a" in `textarea[name="notes.notes.0.note"]`, expected: counter "1/4000"
4. Step: Verify Delete button appears, expected: 1 Delete button now present

---

## Scenario: TC-LOC-NTS-017 - Delete last row restores empty state
1. Step: Open Notes tab with 1 note row with content, expected: Delete visible
2. Step: `button:has-text("Delete")`.click(), expected: "No Notes Available"; counter "0/4000"
3. Step: Verify Add button still enabled, expected: can add new rows
4. Step: Verify `[data-testid="location-settings-btn-save"]` enabled, expected: pending change

---

## Scenario: TC-LOC-NTS-018 - XSS payload stored as text
1. Step: Add row, fill `<script>alert(1)</script>` (25 chars), expected: text only, no execution
2. Step: Verify no alert dialog fires, expected: no script executed
3. Step: Save + confirm, reload, click Notes tab, expected: displays as literal text

---

## Scenario: TC-LOC-NTS-019 - SQL injection stored as text
1. Step: Add row, fill `'; DROP TABLE notes; --` (22 chars), expected: text only
2. Step: Save + confirm, reload, click Notes tab, expected: literal text; no DB error

---

## Scenario: TC-LOC-NTS-020 - Emoji and unicode preserved
1. Step: Add row, fill `café résumé 😀 中文`, expected: all chars display
2. Step: Verify counter = "18/4000", expected: correct (emoji = 2 UTF-16 units)
3. Step: Save + confirm, reload, click Notes tab, expected: `café résumé 😀 中文` preserved

---

## Scenario: TC-LOC-NTS-021 - Paste exceeds 4000 chars (soft limit)
1. Step: Add row, paste 4001-char string, expected: content accepted
2. Step: Verify counter, expected: "4001/4000(0 Left)"
3. Step: Verify textarea `maxlength` attribute, expected: null/absent

---

## Scenario: TC-LOC-NTS-022 - Accessibility: ARIA attributes and keyboard nav
1. Step: Click Notes tab via keyboard Tab+Enter, expected: tab activates
2. Step: Click Add via keyboard, expected: row appears; focus on textarea
3. Step: Check `textarea` attributes: `aria-invalid`, `aria-describedby`, expected: present; `aria-label` absent (gap)
4. Step: Check `[role="progressbar"]` attributes, expected: aria-valuemax="100", aria-valuemin="0"; aria-valuenow absent (gap); no aria-label (gap)
5. Step: Tab through all interactive elements, expected: focus order reachable

---

## Scenario: TC-LOC-NTS-023 - Sequential full lifecycle (add → save → reload → delete → save)
1. Step: Open Notes tab, click Add, fill "Sequential test note" (20 chars), expected: counter "20/4000"
2. Step: Save + confirm, expected: saved; Save disables
3. Step: Reload + click Notes tab, expected: "Sequential test note" persists; counter "20/4000"
4. Step: Click Delete, expected: "No Notes Available"; counter "0/4000"; Save enables
5. Step: Save + confirm, expected: saved; Save disables
6. Step: Reload + click Notes tab, expected: "No Notes Available" — deletion persisted

---

## Scenario: TC-LOC-NTS-024 - Multi-row persistence (3 rows save+reload+verify)
1. Step: Ensure empty state, fill row 0 "Row Alpha", Add + fill row 1 "Row Beta", Add + fill row 2 "Row Gamma", expected: 3 rows, counter 28/4000
2. Step: Save + confirm, expected: saved
3. Step: Reload + click Notes tab, expected: 3 rows persist in order with correct content; counter 28/4000
4. Step: Clean up via ensureEmptyState

---

## Scenario: TC-LOC-NTS-025 - Boundary persistence (4000 chars save+reload)
1. Step: Ensure empty state, fill row 0 with 4000 'A' chars, expected: counter 4000/4000
2. Step: Save + confirm, expected: saved
3. Step: Reload + click Notes tab, expected: counter 4000/4000; value.length = 4000
4. Step: Clean up via ensureEmptyState

---

## Scenario: TC-LOC-NTS-026 - Partial deletion persistence (delete middle row, save, verify remaining)
1. Step: Ensure empty state, fill 3 rows: "Keep First", "Delete Me", "Keep Last", expected: 3 rows
2. Step: Delete row 1 ("Delete Me"), expected: 2 rows remain
3. Step: Save + confirm, expected: saved
4. Step: Reload + click Notes tab, expected: 2 rows persist ("Keep First", "Keep Last")
5. Step: Clean up via ensureEmptyState

---

## Scenario: TC-LOC-NTS-027 - Cancel save dialog (verify changes NOT persisted)
1. Step: Ensure empty state, fill row 0 "Cancel test note", expected: Save enabled
2. Step: Click Save button (opens dialog), click Cancel, expected: dialog closes; Save still enabled
3. Step: Reload page + click Notes tab, expected: empty state ("No Notes Available") — note NOT saved
