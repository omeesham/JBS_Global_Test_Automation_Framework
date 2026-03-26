# Location Notes Test Cases
**Module**: locations | **Total**: 23 | **Status**: Manual | **Updated**: 2026-03-17

---

## MCP_VERIFICATION_LOG

| Field | Value |
|-------|-------|
| Date | 2026-03-17 |
| URL | https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location |
| Office/Entity | 1604 — Parker Palm Springs |
| Total fields found | 6 (textarea, Add button, Delete button, counter display, progressbar, Notes tab) |
| Total fields tested (edit+save) | 1 (textarea — add+save+reload+verify confirmed) |
| Save dialog | Yes — `alertdialog` heading: "Save Changes", body: "Are you sure you want to save the changes?", Cancel + Save buttons |
| Dropdown options | None — no dropdowns in Notes tab |
| Cascade behaviors | Add click → empty textarea row + Save enables; Typing → Delete appears on that row; Delete last row → "No Notes Available" empty state |
| Input attribute types | textarea: `name="notes.notes.{i}.note"` (i=0,1,...) / `placeholder="Type notes here..."` — NO aria-label |
| Validation error patterns | None — notes are entirely optional. No aria-invalid trigger, no error messages |
| Input masks/formatting | None — all characters accepted as-is |
| Filtering mechanism | N/A — no dialog tables |
| API loading | `GET /api/location/1604` → 200 (~2s). Notes content loads within ~2s after tab click. |
| Strict mode risks | `textarea[name="notes.notes.0.note"]` — unique when 1 row. For nth rows use `nth()` scoped to section. |
| Form structure | Save: `[data-testid="location-settings-btn-save"]` — LEFT PANEL button, shared across all tabs |
| Dialog side effects | Save button click → `alertdialog` appears (non-mutating until confirmed). Cancel → form state unchanged. |
| API calls | Save: `POST /locations/1604/settings/location` → 200. No errors observed. |
| Post-reload timing | Counter + textarea populate within ~2s after page reload and Notes tab click |
| Readiness signal | Wait for `[data-testid="location-settings-section-notes"]` to be visible after tab click |
| Sequential interactions | Add → type → Delete → counter resets correctly; Add → type → delete last row → "No Notes Available" |
| Boundary behaviors | XSS `<script>alert(1)</script>` → stored as text (not executed). SQL `'; DROP TABLE --` → stored as text. emoji `😀` + unicode → preserved. 4000 chars: counter shows 4000/4000. 4001+ via paste: counter shows 4001/4000 (SOFT limit — NO HTML maxlength) |

---

## CRITICAL CORRECTIONS vs. 2026-02-19 Run

| Old Claim | Correct Behavior (verified 2026-03-17) |
|-----------|---------------------------------------|
| "Table has 3 columns: #, Location Notes, Actions" | Table has NO `<thead>`. DOM shows 2 cells per row: textarea cell + actions cell. No visible row number column. |
| "1 default row with empty textbox" | Default state is "No Notes Available" (empty table with colspan row). Row only appears after clicking **Add**. |
| "Delete appears only when 2+ rows" | Delete appears when (a) a row has text content (single row), OR (b) 2+ rows exist (all rows get Delete). |
| "Delete disappears when 1 row remains" | If 1 remaining row has content, Delete stays. If 1 empty row (just clicked Add), Delete is absent. |
| "4000 char limit: character rejected" | Soft limit. No HTML `maxlength`. Keyboard stops at 4000, but paste/programmatic can exceed → counter shows overage. |
| "TC-014/015: Rows labeled 1, 2, 3" | No visible row numbers in DOM. Rows identified by nth() position in tbody. |

---

## FIELD INVENTORY & DISCOVERY

**Notes Tab** (live-verified DOM, Office 1604):

| # | Element | Type | Selector Key | Default | Notes |
|---|---------|------|-------------|---------|-------|
| 1 | Notes tab | tab | `tabNotes` | — | `data-testid="location-settings-sub-tab-notes"` |
| 2 | Notes section | wrapper | `sectionNotes` | — | `data-testid="location-settings-section-notes"` |
| 3 | Notes table | table | `tblNotes` | empty ("No Notes Available") | NO data-testid, NO thead |
| 4 | Note textarea (row 0) | textarea | `txtNoteRow0` | empty | `name="notes.notes.0.note"`, no maxlength, no aria-label |
| 5 | Add button | button | `btnNotesAdd` | enabled | NO data-testid — scoped via section |
| 6 | Delete button | button | `btnNotesDelete` | absent (empty state) | Appears when row has content OR 2+ rows exist |
| 7 | Character counter | div | `lblNotesCharCounter` | "0/4000(4000 Left)" | CSS class `text-[11px]`, no data-testid |
| 8 | Progress bar | progressbar | `barNotesProgress` | empty fill | `role="progressbar"`, NO aria-label, NO aria-valuenow |
| 9 | Save button | button | `btnSaveNotes` | disabled | `data-testid="location-settings-btn-save"` (left panel, shared) |
| 10 | Save Changes dialog | alertdialog | `dlgSaveChanges` | not present | Appears after clicking Save when changes pending |
| 11 | Dialog Cancel | button | `btnSaveChangesCancel` | — | `[role="alertdialog"] button:has-text("Cancel")` |
| 12 | Dialog Save | button | `btnSaveChangesConfirm` | — | `[role="alertdialog"] button:has-text("Save")` |

---

## TC-LOC-NTS-001: Verify Notes tab default empty state
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**: 1. Navigate to `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location` ✓ Page loads 2. Click **Notes** tab `[data-testid="location-settings-sub-tab-notes"]` ✓ Tab activates 3. Verify table shows "No Notes Available" ✓ Empty state with colspan row (NO column headers in DOM) 4. Verify character counter ✓ "0/4000" with "(4000 Left)" 5. Verify **Add** button visible ✓ `[data-testid="location-settings-section-notes"] button:has-text("Add")` enabled 6. Verify progress bar visible ✓ `[role="progressbar"]` minimal fill 7. Verify NO **Delete** button ✓ No Delete button in section
**Expected**: Empty table ("No Notes Available"), counter at 0/4000, Add button enabled, NO Delete button, NO column headers
**Data**: office=1604
**Notes**: CORRECTION from 2026-02-19: Table starts EMPTY (no default row). No `<thead>` exists in DOM.

---

## TC-LOC-NTS-002: Type text in textarea and verify counter updates
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**: 1. Open **Notes** tab ✓ Empty state 2. Click **Add** button ✓ Empty row appears with `textarea[name="notes.notes.0.note"]` focused 3. Type "Test note for exploration" ✓ Text appears in textarea 4. Verify character counter ✓ "25/4000" with "(3975 Left)" 5. Verify **Save** button in left panel is enabled ✓ `[data-testid="location-settings-btn-save"]` enabled
**Expected**: Counter updates in real time to 25/4000; Save button enables on change
**Data**: office=1604 | text="Test note for exploration" (25 chars)
**Cleanup**: Clear textarea or navigate away without saving

---

## TC-LOC-NTS-003: Add second note row and verify Delete button behavior
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**: 1. Open **Notes** tab, click **Add** ✓ Empty row with textarea; NO Delete button 2. Type "First note" in row 1 ✓ Counter: "10/4000", **Delete** appears on row 1 3. Click **Add** button again ✓ Second row appears as empty textarea 4. Verify Delete on row 1 ✓ Still present (row has content) 5. Verify Delete on row 2 ✓ Also present (2+ rows — ALL rows get Delete) 6. Verify counter ✓ "11/4000" (10 chars + 1 delimiter)
**Expected**: Delete appears on typed rows and on ALL rows when 2+ exist; counter adds +1 delimiter per additional row
**Data**: office=1604 | row1="First note" (10 chars) | expected_counter=11
**Notes**: CORRECTION: Delete appears when row has content (not only 2+ rows). With 2+ rows, even empty rows get Delete.
**Cleanup**: Delete rows and discard changes

---

## TC-LOC-NTS-004: Multi-row counter includes delimiter per row boundary
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**: 1. Open **Notes** tab, click **Add** ✓ Row 1 2. Type "Hello" in row 1 ✓ Counter: "5/4000" 3. Click **Add** ✓ Row 2 appears, counter: "6/4000" (delimiter=+1) 4. Type "World" in row 2 ✓ Counter: "11/4000" (5+1+5) 5. Click **Add** ✓ Row 3 appears, counter: "12/4000" 6. Type "End" in row 3 ✓ Counter: "15/4000" (5+1+5+1+3)
**Expected**: Each additional row adds exactly 1 delimiter character to the total count
**Data**: office=1604 | row1="Hello" | row2="World" | row3="End" | expected_total=15
**Cleanup**: Delete rows 3 and 2, clear row 1, discard changes

---

## TC-LOC-NTS-005: Delete a row and verify counter decreases
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**: 1. Open **Notes** tab, click **Add**, type "First note" ✓ Counter: "10/4000" 2. Click **Add**, type "Second note" in row 2 ✓ Counter: "22/4000" (10+1+11) 3. Click **Delete** on row 2 ✓ Row 2 removed; counter: "10/4000" 4. Verify Delete still visible on row 1 ✓ Row 1 has content → Delete remains visible 5. Verify 1-row state ✓ Only row 1 remains with "First note"
**Expected**: Counter decreases by deleted row text + delimiter; Delete stays on row 1 because it has content
**Data**: office=1604 | row1="First note" | row2="Second note"
**Notes**: CORRECTION: Delete stays on row 1 after deleting row 2 (because row 1 has content — not "disappears when 1 row").
**Cleanup**: Clear row 1, discard changes

---

## TC-LOC-NTS-006: Progress bar updates proportionally with character usage
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**: 1. Open **Notes** tab ✓ Progress bar `[role="progressbar"]` at minimal fill 2. Click **Add**, type 40-character string ✓ Bar slightly fills (~1% of 4000) 3. Change text to a 2000-character string ✓ Bar is ~50% filled 4. Verify proportional fill ✓ Bar width corresponds to percentage of 4000 used
**Expected**: Progress bar fills proportionally to character usage against the 4000 limit
**Data**: office=1604 | small_text=40 chars | large_text=2000 chars
**Cleanup**: Clear text, discard changes

---

## TC-LOC-NTS-007: Verify 4000 character limit (soft enforcement, no HTML maxlength)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Boundary | Yes |

**Steps**: 1. Open **Notes** tab, click **Add** ✓ Row appears 2. Fill textarea with exactly 4000 characters ✓ Counter: "4000/4000(0 Left)", progress bar full 3. Attempt to type one additional character via keyboard ✓ Character is blocked (keyboard input stops at limit) 4. Paste a 4001-char string into textarea ✓ Counter shows "4001/4000(0 Left)" — overage accepted via paste 5. Verify textarea has NO `maxlength` attribute ✓ Confirmed (soft-limit only)
**Expected**: Keyboard input blocked at 4000; paste bypasses (soft limit); counter shows overage; no HTML maxlength
**Data**: office=1604 | boundary_string=4000 chars | paste_string=4001 chars
**Notes**: CORRECTION from 2026-02-19: Limit is SOFT. No `maxlength` on textarea. Paste can exceed 4000.
**Cleanup**: Clear textarea, discard changes

---

## TC-LOC-NTS-008: Save notes via left-panel Save button (dialog confirmation)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**: 1. Open **Notes** tab, click **Add**, type "Saved note content" ✓ Counter: "18/4000" 2. Click left-panel **Save** `[data-testid="location-settings-btn-save"]` ✓ `alertdialog` appears 3. Verify dialog heading ✓ "Save Changes" 4. Verify dialog body ✓ "Are you sure you want to save the changes?" 5. Click **Save** in dialog `[role="alertdialog"] button:has-text("Save")` ✓ Dialog closes 6. Verify left-panel **Save** button becomes disabled ✓ No unsaved changes
**Expected**: Save dialog appears with confirmed heading/body; after confirmation, notes saved and Save button disables
**Data**: office=1604 | text="Saved note content" (18 chars)
**Cleanup**: Delete note and save to restore empty state

---

## TC-LOC-NTS-009: Notes persist after page reload
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**: 1. Open **Notes** tab, click **Add**, type "Persistent note" ✓ 15 chars 2. Save via left-panel **Save**, confirm in dialog ✓ Saved; Save button disables 3. Reload page (navigate same URL) ✓ Page reloads 4. Click **Notes** tab ✓ Tab loads (~2s — wait for `[data-testid="location-settings-section-notes"]`) 5. Verify row value ✓ "Persistent note" in textarea 6. Verify counter ✓ "15/4000(3985 Left)"
**Expected**: Saved notes persist after page reload with exact content and correct counter
**Data**: office=1604 | text="Persistent note" (15 chars)
**Cleanup**: Delete note and save to restore empty state

---

## TC-LOC-NTS-010: Switching sub-tabs preserves unsaved note content
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | State | Yes |

**Steps**: 1. Open **Notes** tab, click **Add**, type "Temporary text" ✓ Counter: "14/4000" 2. Click **Currency** tab `[data-testid="location-settings-sub-tab-currency"]` ✓ Currency tab loads 3. Click **Notes** tab again ✓ Notes tab reloads 4. Verify textarea still contains ✓ "Temporary text" 5. Verify counter ✓ "14/4000(3986 Left)"
**Expected**: Switching between sub-tabs preserves unsaved note content in React state
**Data**: office=1604 | text="Temporary text" (14 chars)
**Cleanup**: Clear textarea, discard changes

---

## TC-LOC-NTS-011: Navigation away with unsaved changes triggers browser dialog
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | State | Yes |

**Steps**: 1. Open **Notes** tab, click **Add**, type "Unsaved text" ✓ Save button enables 2. Navigate away (e.g., `browser_navigate` to a different URL) ✓ Browser "beforeunload" dialog prompt appears 3. Accept navigation ✓ User leaves page without saving; changes discarded
**Expected**: Navigating away with unsaved changes triggers browser's built-in beforeunload confirmation dialog
**Data**: office=1604 | text="Unsaved text"
**Notes**: This is the BROWSER's `beforeunload` dialog, not the app's `alertdialog "Save Changes"`

---

## TC-LOC-NTS-012: Delete all notes and save empty state
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Low | Manual | Functional | Yes |

**Steps**: 1. Open **Notes** tab with a saved note (or add + save one) ✓ Note visible with Delete button 2. Click **Delete** on the row ✓ "No Notes Available" shows; counter: "0/4000" 3. Click left-panel **Save**, confirm in dialog ✓ Saved 4. Reload page, click **Notes** tab ✓ "No Notes Available" state persists
**Expected**: Deleting the last note and saving persists the empty "No Notes Available" state
**Data**: office=1604

---

## TC-LOC-NTS-013: Special and HTML characters stored correctly
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Low | Manual | Functional | Yes |

**Steps**: 1. Open **Notes** tab, click **Add** ✓ Row appears 2. Type: `"test"`, `<div>`, `&amp;`, `é`, `ñ` ✓ Characters appear in textarea 3. Verify counter counts each character accurately ✓ Length matches expected 4. Save via left-panel **Save**, confirm ✓ Saved 5. Reload and verify **Notes** tab ✓ Special characters preserved exactly as typed
**Expected**: HTML entities, quotes, accented chars accepted, counted, saved, retrieved without corruption
**Data**: office=1604 | test_string contains: `"` `<` `>` `&` `é` `ñ`
**Cleanup**: Delete note and save to restore empty state

---

## TC-LOC-NTS-014: Add multiple rows and verify sequential textarea positions
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**: 1. Open **Notes** tab, click **Add** ✓ Row 1 textarea (nth=0) appears 2. Click **Add** again ✓ Row 2 textarea (nth=1) appears; both rows have Delete buttons 3. Click **Add** again ✓ Row 3 textarea (nth=2) appears; all 3 rows have Delete buttons 4. Verify all 3 textboxes have placeholder ✓ "Type notes here..." 5. Type distinct text in each ✓ Each `textarea` (scoped by nth) holds its own content
**Expected**: Three rows accessible via nth() indexing on `[data-testid="location-settings-section-notes"] textarea`; all get Delete when 2+ rows
**Data**: office=1604
**Notes**: CORRECTION: DOM has NO visible row number column (#). Rows identified by textarea nth() position only.
**Cleanup**: Delete rows 3 and 2, discard changes

---

## TC-LOC-NTS-015: Delete a middle row and verify remaining rows shift
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**: 1. Open **Notes** tab, click **Add**, type "Row A" in row 1 (nth=0) ✓ 2. Click **Add**, type "Row B" in row 2 (nth=1) ✓ 3. Click **Add**, type "Row C" in row 3 (nth=2) ✓ Counter includes all 3 + 2 delimiters 4. Click **Delete** on row 2 ✓ "Row B" row removed 5. Verify remaining rows ✓ nth=0 = "Row A", nth=1 = "Row C" (shifted) 6. Verify counter ✓ Decreased by "Row B" (5 chars) + 1 delimiter = 6 chars removed
**Expected**: Remaining rows shift; content preserved; counter decreases correctly
**Data**: office=1604 | row1="Row A" | row2="Row B" | row3="Row C"
**Notes**: CORRECTION: No visible row numbers — rows identified by position. "Row C" shifts to nth=1 after deleting nth=1.
**Cleanup**: Delete remaining extra row(s), discard changes

---

## TC-LOC-NTS-016: Empty row has no Delete button — Delete appears on first keystroke
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**: 1. Open **Notes** tab ✓ "No Notes Available" state 2. Click **Add** ✓ Empty row appears; NO Delete button in section (verify: 0 Delete buttons) 3. Verify counter ✓ "0/4000(4000 Left)" 4. Type a single character "a" in the textarea ✓ Counter: "1/4000" 5. Verify Delete button NOW appears ✓ Delete visible in the row's actions cell
**Expected**: Empty row has no Delete; Delete appears immediately when text is typed (even 1 char)
**Data**: office=1604 | trigger_char="a"
**Cleanup**: Delete the row or clear text, discard changes

---

## TC-LOC-NTS-017: Delete last remaining row restores empty state
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**: 1. Open **Notes** tab with 1 note row (add one if empty) ✓ Row with content visible; Delete button present 2. Click **Delete** ✓ Row removed; table shows "No Notes Available"; counter: "0/4000(4000 Left)" 3. Verify Add button still visible ✓ Can still add a new row 4. Verify Save button enabled ✓ Pending change (deletion not yet saved)
**Expected**: Deleting the last note row returns to "No Notes Available" state immediately; table completely empty
**Data**: office=1604

---

## TC-LOC-NTS-018: XSS payload stored as unsafe text (security)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Negative | Yes |

**Steps**: 1. Open **Notes** tab, click **Add** ✓ Row appears 2. Type `<script>alert(1)</script>` in textarea ✓ Text displayed as-is (25 chars in counter) 3. Verify no script executes ✓ No alert dialog; no console injection errors 4. Save via left-panel **Save**, confirm ✓ Saved 5. Reload and open **Notes** tab ✓ `<script>alert(1)</script>` displays as literal text only; no execution
**Expected**: XSS payload stored and retrieved as plain text; never executed as HTML or JavaScript
**Data**: office=1604 | xss_payload=`<script>alert(1)</script>`
**Cleanup**: Delete note and save to restore empty state

---

## TC-LOC-NTS-019: SQL injection payload stored as text (security)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Negative | Yes |

**Steps**: 1. Open **Notes** tab, click **Add** ✓ Row appears 2. Type `'; DROP TABLE notes; --` in textarea ✓ 22 chars in counter 3. Save via left-panel **Save**, confirm ✓ Saved 4. Reload and open **Notes** tab ✓ `'; DROP TABLE notes; --` displays as literal text; no DB error or missing data
**Expected**: SQL injection payload stored and retrieved as plain text; no database side effects
**Data**: office=1604 | sql_payload=`'; DROP TABLE notes; --`
**Cleanup**: Delete note and save to restore empty state

---

## TC-LOC-NTS-020: Emoji and unicode characters preserved through save/reload
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Boundary | Yes |

**Steps**: 1. Open **Notes** tab, click **Add** ✓ Row appears 2. Type `café résumé 😀 中文` in textarea ✓ All characters display correctly 3. Verify counter ✓ "18/4000" (emoji counts as 2 UTF-16 units; total = 18) 4. Save via left-panel **Save**, confirm ✓ Saved 5. Reload and open **Notes** tab ✓ `café résumé 😀 中文` preserved exactly
**Expected**: Multi-byte unicode and emoji preserved without corruption through the full save+reload cycle
**Data**: office=1604 | unicode_string=`café résumé 😀 中文` (18 chars)
**Cleanup**: Delete note and save to restore empty state

---

## TC-LOC-NTS-021: Paste exceeds 4000 char limit — counter shows overage (soft limit)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Boundary | Yes |

**Steps**: 1. Open **Notes** tab, click **Add** ✓ Row appears 2. Paste a string of 4001 characters ✓ Text pasted into textarea 3. Verify counter ✓ Shows "4001/4000(0 Left)" — counter shows overage; "(0 Left)" for any >= 4000 4. Verify textarea accepted the content ✓ No hard rejection (soft limit via JS only)
**Expected**: Counter shows overage; no HTML maxlength attribute prevents paste; counter shows "N/4000(0 Left)" for any N>=4000
**Data**: office=1604 | paste_string=4001 chars
**Notes**: SOFT LIMIT confirmed. Server behavior on save with > 4000 chars should be separately documented.
**Cleanup**: Clear textarea, discard changes

---

## TC-LOC-NTS-022: Accessibility — ARIA attributes and keyboard navigation
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Low | Manual | Accessibility | Yes |

**Steps**: 1. Open **Notes** tab, click **Add** ✓ Row appears 2. Tab through interactive elements ✓ Focus order: textarea → Add → Delete (if present) 3. Verify textarea ✓ Has `aria-invalid="false"` (correct baseline); has `aria-describedby`; has NO `aria-label` (gap!) 4. Verify Add button ✓ Accessible via button text "Add"; no aria-label needed (text is label) 5. Verify progressbar ✓ `aria-valuemax="100"`, `aria-valuemin="0"` present; `aria-valuenow` NOT set (gap!); NO `aria-label` (gap!) 6. Verify keyboard save ✓ Tab to Save button, Enter triggers Save dialog; Cancel dismissable via Tab+Enter
**Expected**: All interactive elements keyboard-reachable; known gaps: textarea no aria-label, progressbar no aria-valuenow + no aria-label
**Data**: office=1604
**Notes**: Accessibility gaps: (1) textarea has no aria-label (placeholder only); (2) progressbar no aria-valuenow; (3) progressbar no aria-label

---

## TC-LOC-NTS-023: Sequential full lifecycle — add, save, reload, delete, save
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Integration | Yes |

**Steps**: 1. Open **Notes** tab ✓ Empty state ("No Notes Available") 2. Click **Add**, type "Sequential test note" (20 chars) ✓ Counter: "20/4000", Delete visible 3. Click left-panel **Save**, confirm in dialog ✓ Saved; Save button disables 4. Reload page, click **Notes** tab ✓ "Sequential test note" persists; counter: "20/4000" 5. Click **Delete** on the note ✓ "No Notes Available"; counter: "0/4000"; Save enables 6. Click left-panel **Save**, confirm in dialog ✓ Saved; Save button disables 7. Reload page, click **Notes** tab ✓ "No Notes Available" — deletion also persisted
**Expected**: Full add → save → reload → delete → save → reload lifecycle works correctly at every step
**Data**: office=1604 | text="Sequential test note" (20 chars)