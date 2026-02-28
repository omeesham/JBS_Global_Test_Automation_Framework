# Location Notes Test Plan
**Module**: locations | **Updated**: 2026-02-19
**Test Cases**: specs_planning/test-cases/locations/locations_notes_test_cases.md

## Selector Mapping

| TC ID | Selector Keys Used |
|---|---|
| TC-LOC-NTS-001 | tabNotes, tblNotes, txtNoteInput, btnNotesAdd, barNotesProgress, lblNotesCharCount |
| TC-LOC-NTS-002 | tabNotes, txtNoteInput, lblNotesCharCount, btnSave |
| TC-LOC-NTS-003 | tabNotes, txtNoteInput, btnNotesAdd, btnNotesDelete, lblNotesCharCount |
| TC-LOC-NTS-004 | tabNotes, txtNoteInput, btnNotesAdd, lblNotesCharCount |
| TC-LOC-NTS-005 | tabNotes, txtNoteInput, btnNotesAdd, btnNotesDelete, lblNotesCharCount |
| TC-LOC-NTS-006 | tabNotes, txtNoteInput, barNotesProgress |
| TC-LOC-NTS-007 | tabNotes, txtNoteInput, lblNotesCharCount, barNotesProgress |
| TC-LOC-NTS-008 | tabNotes, txtNoteInput, btnSave, dlgSaveChanges, btnSaveChangesConfirm |
| TC-LOC-NTS-009 | tabNotes, txtNoteInput, lblNotesCharCount, btnSave, dlgSaveChanges, btnSaveChangesConfirm |
| TC-LOC-NTS-010 | tabNotes, txtNoteInput, lblNotesCharCount, tabCurrency |
| TC-LOC-NTS-011 | tabNotes, txtNoteInput, btnSave, dlgSaveChanges, btnSaveChangesCancel |
| TC-LOC-NTS-012 | tabNotes, txtNoteInput, lblNotesCharCount, btnSave, dlgSaveChanges, btnSaveChangesConfirm |
| TC-LOC-NTS-013 | tabNotes, txtNoteInput, lblNotesCharCount, btnSave, dlgSaveChanges, btnSaveChangesConfirm |
| TC-LOC-NTS-014 | tabNotes, btnNotesAdd, btnNotesDelete, txtNoteInput |
| TC-LOC-NTS-015 | tabNotes, txtNoteInput, btnNotesAdd, btnNotesDelete, lblNotesCharCount |

## UI Testing Checklist

| Check | Status |
|---|---|
| selectorReconciliation | ✓ 6 Notes selectors verified on live DOM (shadow DOM: textarea name, table header, progressbar role) |
| deleteSymmetry | ✓ Delete appears/disappears correctly at 2+/1 row boundary |
| explorationCleanup | ✓ Text cleared and baseline restored after exploration |

---

## Scenario: TC-LOC-NTS-001 - Verify Notes tab default layout
1. Step: tab[Notes].click(), expected: tabpanel "Notes" visible
2. Step: Verify table has columnheaders "#", "Location Notes", "Actions", expected: 3 headers present
3. Step: Verify 1 row with textarea[placeholder="Type notes here..."], expected: empty textbox in row 1
4. Step: Verify Actions cell in row 1 is empty, expected: no Delete button
5. Step: Verify counter text, expected: "0/4000 (4000 left)"
6. Step: Verify button:has-text("Add") visible, expected: present and enabled
7. Step: Verify [role="progressbar"] visible, expected: present with minimal fill

---

## Scenario: TC-LOC-NTS-002 - Type text and verify character counter
1. Step: tab[Notes].click(), expected: tabpanel loads
2. Step: textarea[name="notes.notes.0.note"].fill("Test note for exploration"), expected: text entered
3. Step: Verify counter, expected: "25/4000 (3975 left)"
4. Step: Verify left-panel Save button is enabled, expected: not disabled

---

## Scenario: TC-LOC-NTS-003 - Add second note row via Add button
1. Step: textarea[name="notes.notes.0.note"].fill("First note"), expected: counter "10/4000"
2. Step: button:has-text("Add").click(), expected: row 2 appears
3. Step: Verify row 2 cell "2" + empty textarea, expected: numbered, placeholder visible
4. Step: Verify button:has-text("Delete") on row 1 and row 2, expected: 2 Delete buttons visible
5. Step: Verify counter, expected: "11/4000 (3989 left)" — 10 chars + 1 delimiter

---

## Scenario: TC-LOC-NTS-004 - Multi-row counter includes delimiter
1. Step: textarea.nth(0).fill("Hello"), expected: counter "5/4000"
2. Step: button:has-text("Add").click(), expected: counter "6/4000" (delimiter added)
3. Step: textarea.nth(1).fill("World"), expected: counter "11/4000" (5+1+5)
4. Step: button:has-text("Add").click(), expected: counter "12/4000"
5. Step: textarea.nth(2).fill("End"), expected: counter "15/4000" (5+1+5+1+3)

---

## Scenario: TC-LOC-NTS-005 - Delete row and verify counter decreases
1. Step: textarea.nth(0).fill("First note"), expected: counter "10/4000"
2. Step: button:has-text("Add").click() + textarea.nth(1).fill("Second note"), expected: counter "22/4000"
3. Step: row 2 button:has-text("Delete").click(), expected: row 2 removed
4. Step: Verify counter, expected: "10/4000 (3990 left)"
5. Step: Verify Actions cell empty (no Delete), expected: only 1 row remains

---

## Scenario: TC-LOC-NTS-006 - Progress bar updates with character usage
1. Step: tab[Notes].click(), expected: progressbar minimal
2. Step: textarea.fill(10-char string), expected: bar barely changes
3. Step: textarea.fill(500-char string), expected: bar shows noticeable fill proportional to 500/4000

---

## Scenario: TC-LOC-NTS-007 - 4000 character limit enforcement
1. Step: textarea.fill(4000-char string), expected: counter "4000/4000 (0 left)"
2. Step: Attempt to type 1 more character, expected: character rejected or truncated
3. Step: Verify progressbar, expected: fully filled

---

## Scenario: TC-LOC-NTS-008 - Save notes via left-panel Save
1. Step: textarea.fill("Saved note content"), expected: counter "18/4000"
2. Step: button[Save] (left-panel).click(), expected: Save Changes dialog appears
3. Step: Verify dialog message, expected: "Are you sure you want to save the changes?"
4. Step: dialog button[Save].click(), expected: dialog closes, changes saved
5. Step: Verify Save button disabled, expected: no unsaved changes

---

## Scenario: TC-LOC-NTS-009 - Notes persist after page reload
1. Step: textarea.fill("Persistent note") + Save + confirm, expected: saved
2. Step: page.reload(), expected: page reloads
3. Step: tab[Notes].click(), expected: Notes tab loads
4. Step: Verify textarea value, expected: "Persistent note"
5. Step: Verify counter, expected: "15/4000 (3985 left)"

---

## Scenario: TC-LOC-NTS-010 - Tab switch preserves unsaved notes
1. Step: textarea.fill("Temporary text"), expected: counter "14/4000"
2. Step: tab[Currency].click(), expected: Currency tab loads
3. Step: tab[Notes].click(), expected: Notes tab loads
4. Step: Verify textarea value, expected: "Temporary text"
5. Step: Verify counter, expected: "14/4000 (3986 left)"

---

## Scenario: TC-LOC-NTS-011 - Unsaved changes prompt on navigation away
1. Step: textarea.fill("Unsaved text"), expected: Save enabled
2. Step: button[Back to Location Search].click(), expected: Save Changes dialog appears
3. Step: Verify dialog message, expected: "Are you sure you want to save the changes?"
4. Step: dialog button[Cancel].click(), expected: stays on page, text preserved

---

## Scenario: TC-LOC-NTS-012 - Save empty note state
1. Step: textarea.fill("Temporary"), expected: has text
2. Step: textarea.fill(""), expected: counter "0/4000 (4000 left)"
3. Step: button[Save].click() + confirm, expected: saved
4. Step: page.reload() + tab[Notes].click(), expected: empty state

---

## Scenario: TC-LOC-NTS-013 - Special characters in notes
1. Step: textarea.fill('"test" <div> & é ñ'), expected: chars accepted
2. Step: Verify counter matches actual character count, expected: correct count
3. Step: Save + reload + Notes tab, expected: special chars preserved exactly

---

## Scenario: TC-LOC-NTS-014 - Add multiple rows (3+) and verify numbering
1. Step: button:has-text("Add").click() twice, expected: 3 rows total
2. Step: Verify cell text for row numbers, expected: "1", "2", "3"
3. Step: Verify all 3 rows have Delete buttons, expected: 3 Delete buttons
4. Step: Verify all 3 textboxes have placeholder, expected: "Type notes here..."

---

## Scenario: TC-LOC-NTS-015 - Delete middle row and verify renumbering
1. Step: Fill 3 rows: "Row A", "Row B", "Row C", expected: 3 rows, counter correct
2. Step: row 2 button:has-text("Delete").click(), expected: "Row B" removed
3. Step: Verify row 1 = "Row A", row 2 = "Row C", expected: renumbered sequentially
4. Step: Verify counter decreases by "Row B" length + 1 delimiter, expected: correct total
