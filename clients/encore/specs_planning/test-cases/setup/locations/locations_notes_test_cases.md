# Location Notes Test Cases
**Module**: locations | **Total**: 58 (clean contiguous set; HIST col-69 cases relocated to Location Management History) | **Status**: Manual | **Updated**: 
**Discovery_Artifacts** (PLAN_PILOT_NOTES_DISCOVERY,):
- Field-inventory (live walk): [`_internal/field-inventories/notes.md`](./././_internal/field-inventories/notes.md)
- HIST catalog (col 69 mapping): [`catalogs/hist-root-map-location-management-notes.md`](./././catalogs/hist-root-map-location-management-notes.md)
- Old-site baseline (nav2): [`_internal/old-site-baseline/notes.md`](./././_internal/old-site-baseline/notes.md)
- 3 APP bugs filed: `reports/bugs/BUG-LOC-NTS-{001,002,003}.json`

---

## MCP_VERIFICATION_LOG

| Field | Value |
|-------|-------|
| Date | **** (live walk performed during PLAN_PILOT_NOTES_DISCOVERY Phase 1a/1b; supersedes the entry preserved below) |
| Source artifact | [`notes.md`](./././_internal/field-inventories/notes.md) — full live DOM walk + 3 destructive save cycles + 87-col history diff |
| URL | https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location |
| Office/Entity | 1604 — Parker Palm Springs |
| Total fields found | 13 (Notes section wrapper, sub-tab activator, sub-tab content panel, "No Notes Available" empty-state row, Add button, Note textarea per row, Delete button per row, Character counter, Progress bar, Save button (shared), Save Changes alertdialog, dialog Cancel, dialog Ok) — see `notes.md` §Field Inventory for full table |
| Total fields tested (edit+save) | 3 save cycles on textarea (cycle 1: empty→typed; cycle 2: delete-without-clear+save discovered BUG-LOC-NTS-001; cycle 3: clear+delete+save success) — see `hist-root-map-location-management-notes.md` §State-space matrix |
| Save dialog | Yes — `alertdialog` heading: "Save Changes", body: "Are you sure you want to save the changes?", **Cancel + Ok buttons** (DRIFT from entry — now `Ok` not `Save`; filed as BUG-LOC-NTS-002 — pending Encore confirmation whether intentional UX change or regression) |
| Dropdown options | None — no dropdowns in Notes tab |
| Cascade behaviors | Add click → empty textarea row + Save enables; Typing → Delete appears on that row; Delete last row → "No Notes Available" empty state. **AFTER SAVE**: app auto-creates an empty placeholder row (row N+1 where N is the user-content row count) — see BUG-LOC-NTS-003 |
| Input attribute types | textarea: `name="notes.notes.{i}.note"` (i=0,1.) / `placeholder=""` (empty in interface, not "Type notes here." as previously documented — verify on next walk) — NO aria-label — NO HTML `maxlength` attribute (the application `Validators.maxLength(4000)` enforces via JS, soft limit) |
| Validation error patterns | None — notes are entirely optional. No aria-invalid trigger, no error messages |
| Input masks/formatting | None — all characters accepted as-is |
| Filtering mechanism | N/A — no dialog tables |
| API loading | Page-load: `GET /navigator/api/core/{currencies,merchants,countries,taxmodes,regions}` → 200 (observed). Notes content loads within ~2s after tab click |
| Strict mode risks | `textarea[name="notes.notes.0.note"]` — unique when 1 row. For nth rows use `nth` scoped to section. **NEW**: post-save state has the additional note rows (N user-content + 1 auto-empty per BUG-LOC-NTS-003) — count assertions on post-save state need to account for the auto-row OR assert on content not count |
| Form structure | Save: `[data-testid="location-settings-btn-save"]` — LEFT PANEL button, shared across all tabs |
| Dialog side effects | Save button click → `alertdialog` appears (non-mutating until confirmed). Cancel → form state unchanged |
| API calls | Save: `POST /locations/1604/settings/location` → 200 (per verification; not re-captured this session — see BUG-LOC-NTS-001 deferredChecks for network-payload capture follow-up) |
| Post-reload timing | Counter + textarea populate within ~2s after page reload and Notes tab click |
| Readiness signal | Wait for `[data-testid="location-settings-section-notes"]` to be visible after tab click |
| Sequential interactions | Add → type → Delete → counter resets correctly; Add → type → delete last row → "No Notes Available". **Persistence quirk**: Delete-only + Save does NOT persist deletion server-side; must clear the note text via input event FIRST, then Delete + Save (BUG-LOC-NTS-001 + LR-026 defensive pattern) |
| Boundary behaviors | XSS `<script>alert(1)</script>` → stored as text (not executed). SQL `'; DROP TABLE --` → stored as text. emoji `😀` + unicode → preserved. 4000 chars: counter shows 4000/4000. 4001+ via paste: counter shows 4001/4000 (SOFT limit — NO HTML maxlength) |
| LM History col mapping | Notes → col **69** (0-idx) of 87 LM History columns; UNIQUE header (no duplicate). Encoding: `<MM/DD/YYYY> - <row-content>` per row, joined by ` \| ` between rows. Trailing empty placeholder appears as ` \| <MM/DD/YYYY> -`. See `hist-root-map-location-management-notes.md` §Parent → Column Map for full details |
| Tab activation quirk | Radix tablist requires full pointer event sequence (`pointerdown` + `pointerup` + `click`) — plain `button.click` does NOT flip `aria-selected`. automation's `.click` already dispatches the full sequence; direct JS `.click` does not. Page objects MUST use automation `.click` not raw interface `.click` |

### Prior verification (, preserved for historical reference)

The entry recorded `Save dialog | Cancel + Save buttons` and `Total fields found | 6`. Both are now superseded by the walk-evidence. The data should not be relied upon for live behavior; consult the row instead. Source-of-truth artifact: [`notes.md`](./././_internal/field-inventories/notes.md).

---

## CRITICAL CORRECTIONS vs. Run

| Old Claim | Correct Behavior |
|-----------|---------------------------------------|
| "Table has 3 columns: #, Location Notes, Actions" | Table has NO `<thead>`. interface shows 2 cells per row: textarea cell + actions cell. No visible row number column. |
| "1 default row with empty textbox" | Default state is "No Notes Available" (empty table with colspan row). Row only appears after clicking **Add**. |
| "Delete appears only when 2+ rows" | Delete appears when (a) a row has text content (single row), OR (b) 2+ rows exist (all rows get Delete). |
| "Delete disappears when 1 row remains" | If 1 remaining row has content, Delete stays. If 1 empty row (just clicked Add), Delete is absent. |
| "4000 char limit: character rejected" | Soft limit. No HTML `maxlength`. Keyboard stops at 4000, but paste/programmatic can exceed → counter shows overage. |
| "TC-014/015: Rows labeled 1, 2, 3" | No visible row numbers in interface. Rows identified by nth position in tbody. |

---

## FIELD INVENTORY & DISCOVERY

**Notes Tab** (live-verified interface, Office 1604):

| # | Element | Type | Selector Key | Default | Notes |
|---|---------|------|-------------|---------|-------|
| 1 | Notes tab | tab | `tabNotes` | — | `data-testid="location-settings-sub-tab-notes"` |
| 2 | Notes section | wrapper | `sectionNotes` | — | `data-testid="location-settings-section-notes"` |
| 3 | Notes table | table | `tblNotes` | empty ("No Notes Available") | NO data-testid, NO thead |
| 4 | Note textarea (row 0) | textarea | `txtNoteRow0` | empty | `name="notes.notes.0.note"`, no maxlength, no aria-label |
| 5 | Add button | button | `btnNotesAdd` | enabled | `data-testid="location-settings-btn-add-note"` (drift corrected — Phase 3.3) |
| 6 | Delete button | button | `btnNotesDelete` | absent (empty state) | Appears when row has content OR 2+ rows exist; uses text-match scoped to section |
| 7 | Character counter | div | `lblNotesCharCounter` | "0/4000(4000 Left)" | `data-testid="location-settings-label-note-character-counter"` (drift corrected — Phase 3.3) |
| 8 | Progress bar | progressbar | `barNotesProgress` | empty fill | `data-testid="location-settings-label-note-character-progress"` (drift corrected — Phase 3.3); `role="progressbar"`, NO aria-label, NO aria-valuenow |
| 9 | Save button | button | `btnSaveNotes` | disabled | `data-testid="location-settings-btn-save"` (left panel, shared) |
| 10 | Save Changes dialog | alertdialog | `dlgSaveChanges` | not present | Appears after clicking Save when changes pending |
| 11 | Dialog Cancel | button | `btnSaveChangesCancel` | — | `[an alert dialog] button:has-text("Cancel")` |
| 12 | Dialog Ok (confirm) | button | `btnSaveChangesConfirm` | — | `[an alert dialog] button:has-text("Ok")` (drift corrected per BUG-LOC-NTS-002 + shared.ts:41) |

---

## TC-LOC-NTS-001: Verify Notes tab default empty state
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: none (baseline-enforcement per LR-019)
**Steps**: 1. Open the Location Settings page. 2. Click the "Notes" tab. 3. Verify the table shows "No Notes Available" (no column headers visible). 4. Verify the character counter shows "0/4000" with "(4000 Left)". 5. Verify the "Add" button is visible and enabled. 6. Verify the progress bar is visible at minimal fill. 7. Verify no "Delete" button appears in the section.
**Expected**: Empty table ("No Notes Available"), counter at 0/4000, Add button enabled, NO Delete button, NO column headers
**Data**: office=1604
**Notes**: Verified live: the table starts EMPTY (no default row). No header row exists in the interface.

---

## TC-LOC-NTS-002: Type text in the note box and verify counter updates
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab. 2. Click the "Add" button. 3. Type "Test note for exploration" in the note box. 4. Verify the character counter shows "25/4000" with "(3975 Left)". 5. Verify the left-panel "Save" button is enabled.
**Expected**: Counter updates in real time to 25/4000; Save button enables on change
**Data**: office=1604 | text="Test note for exploration" (25 chars)
**Cleanup**: Clear the note box or navigate away without saving

---

## TC-LOC-NTS-003: Add second note row and verify Delete button behavior
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab and click "Add". Confirm no "Delete" button appears yet. 2. Type "First note" in the first row. Confirm the counter shows "10/4000" and a "Delete" button appears on that row. 3. Click "Add" again to create a second empty row. 4. Verify the "Delete" button is still present on the first row. 5. Verify the "Delete" button is also present on the second row (all rows get "Delete" when 2 or more rows exist). 6. Verify the counter shows "11/4000" (10 characters plus 1 delimiter).
**Expected**: Delete appears on typed rows and on ALL rows when 2+ exist; counter adds +1 delimiter per additional row
**Data**: office=1604 | row1="First note" (10 chars) | expected_counter=11
**Notes**: Delete appears when row has content (not only 2+ rows). With 2+ rows, even empty rows get Delete.
**Cleanup**: Delete rows and discard changes

---

## TC-LOC-NTS-004: Multi-row counter includes delimiter per row boundary
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab and click "Add". 2. Type "Hello" in the first row. Confirm the counter shows "5/4000". 3. Click "Add" again. Confirm the counter shows "6/4000" (the new row adds 1 delimiter). 4. Type "World" in the second row. Confirm the counter shows "11/4000" (5+1+5). 5. Click "Add" again. Confirm the counter shows "12/4000". 6. Type "End" in the third row. Confirm the counter shows "15/4000" (5+1+5+1+3).
**Expected**: Each additional row adds exactly 1 delimiter character to the total count
**Data**: office=1604 | row1="Hello" | row2="World" | row3="End" | expected_total=15
**Cleanup**: Delete rows 3 and 2, clear row 1, discard changes

---

## TC-LOC-NTS-005: Delete a row and verify counter decreases
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab, click "Add", and type "First note". Confirm the counter shows "10/4000". 2. Click "Add" and type "Second note" in the second row. Confirm the counter shows "22/4000" (10+1+11). 3. Click "Delete" on the second row. Confirm the row is removed and the counter returns to "10/4000". 4. Verify the "Delete" button is still visible on the first row (the row has content). 5. Verify only the first row remains, showing "First note".
**Expected**: Counter decreases by deleted row text + delimiter; Delete stays on the first row because it has content
**Data**: office=1604 | row1="First note" | row2="Second note"
**Notes**: Delete stays on row 1 after deleting row 2 (because row 1 has content — not "disappears when 1 row").
**Cleanup**: Clear row 1, discard changes

---

## TC-LOC-NTS-006: Progress bar updates proportionally with character usage
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab. Confirm the progress bar is at minimal fill. 2. Click "Add" and type a 40-character string. Confirm the bar fills slightly (roughly 1% of 4000). 3. Replace the text with a 2000-character string. Confirm the bar is approximately 50% filled. 4. Verify the bar width corresponds proportionally to the percentage of the 4000-character limit used.
**Expected**: Progress bar fills proportionally to character usage against the 4000 limit
**Data**: office=1604 | small_text=40 chars | large_text=2000 chars
**Cleanup**: Clear text, discard changes

---

## TC-LOC-NTS-007: Verify 4000 character limit (soft enforcement)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Boundary | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab and click "Add". 2. Fill the note box with exactly 4000 characters. Confirm the counter shows "4000/4000(0 Left)" and the progress bar is full. 3. Attempt to type one additional character via keyboard. Confirm the character is blocked (keyboard input stops at the limit). 4. Paste a 4001-character string into the note box. Confirm the counter shows "4001/4000(0 Left)" — the paste is accepted (soft limit only). 5. Verify the field does not impose a hard maximum-length cap (the 4000 limit is enforced by the application, not the browser).
**Expected**: Keyboard input is blocked at 4000 characters; pasting bypasses the limit (it is a soft limit); the counter shows the overage; the field has no hard maximum-length cap
**Data**: office=1604 | boundary_string=4000 chars | paste_string=4001 chars
**Notes**: Verified live: the character limit is soft — the note field enforces no maximum length, so a pasted value can exceed 4000 characters.
**Cleanup**: Clear the note box, discard changes

---

## TC-LOC-NTS-008: Save notes via left-panel Save button
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab, click "Add", and type "Saved note content". Confirm the counter shows "19/4000" (18 content characters plus 1 row-delimiter). 2. Click the left-panel "Save" button. Confirm the save dialog appears. 3. Verify the dialog heading reads "Save Changes". 4. Verify the dialog body reads "Are you sure you want to save the changes?" 5. Click "Ok" in the dialog. Confirm the dialog closes (the button is labeled "Ok", not "Save"). 6. Verify the left-panel "Save" button becomes disabled.
**Expected**: Save dialog appears with confirmed heading/body; after confirmation, notes saved and Save button disables
**Data**: office=1604 | text="Saved note content" (18 chars)
**Cleanup**: Delete note and save to restore empty state — use BUG-LOC-NTS-001 workaround (clear the note text before Delete click)

---

## TC-LOC-NTS-009: Notes persist after page reload
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab, click "Add", and type "Persistent note" (15 characters). 2. Click the left-panel "Save" and confirm in the dialog. Confirm the Save button becomes disabled. 3. Reload the page (navigate to the same URL). 4. Click the "Notes" tab and wait for the section to load. 5. Verify the first note reads "Persistent note". 6. Verify the counter shows "15/4000(3985 Left)".
**Expected**: Saved notes persist after page reload with exact content and correct counter
**Data**: office=1604 | text="Persistent note" (15 chars)
**Cleanup**: Delete note and save to restore empty state

---

## TC-LOC-NTS-010: Tab switch preserves unsaved notes
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | State | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab, click "Add", and type "Temporary text". Confirm the counter shows "14/4000". 2. Click the "Currency" tab. Confirm the Currency tab loads. 3. Click the "Notes" tab again. 4. Verify the note box still contains "Temporary text". 5. Verify the counter shows "14/4000(3986 Left)".
**Expected**: Switching between sub-tabs preserves unsaved note content in the form state
**Data**: office=1604 | text="Temporary text" (14 chars)
**Cleanup**: Clear the note box, discard changes

---

## TC-LOC-NTS-011: Navigating away with unsaved changes shows the browser's leave-page warning
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | State | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab, click "Add", and type "Unsaved text". Confirm the Save button becomes enabled. 2. Navigate away to a different URL. Confirm the browser shows its leave-page confirmation. 3. Accept the navigation. Confirm the user leaves the page and the unsaved changes are discarded.
**Expected**: Navigating away with unsaved changes shows the browser's built-in leave-page confirmation
**Data**: office=1604 | text="Unsaved text"
**Notes**: This is the browser's own leave-page dialog, not the app's "Save Changes" dialog

---

## TC-LOC-NTS-012: Delete all notes and save empty state
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Low | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab with at least one saved note (add and save one if needed). Confirm the note is visible with a "Delete" button. 2. For each row to delete: (a) Clear the note text in the row to empty, then (b) click "Delete" on that row. Confirm the row is removed and "No Notes Available" appears with the counter at "0/4000". 3. Click the left-panel "Save" and confirm in the dialog (the button is labeled "Ok" per BUG-LOC-NTS-002). 4. Reload the page and click the "Notes" tab. Confirm the "No Notes Available" state persists.
**Expected**: Deleting the last note and saving persists the empty "No Notes Available" state. Note: clicking Delete without first clearing the note text does not persist the deletion — the change appears unsaved-pending but the note is not actually removed, so the save keeps the original note. Always clear the note text before clicking Delete.
**Data**: office=1604

---

## TC-LOC-NTS-013: Special and HTML characters stored correctly
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Low | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab and click "Add". 2. Type the string containing `"test"`, `<div>`, `&amp;`, `é`, and `ñ` into the note box. Confirm the characters appear in the note box. 3. Verify the counter counts each character accurately. 4. Click the left-panel "Save" and confirm. 5. Reload the page and open the "Notes" tab. Confirm the special characters are preserved exactly as typed.
**Expected**: HTML entities, quotes, accented chars accepted, counted, saved, retrieved without corruption
**Data**: office=1604 | test_string contains: `"` `<` `>` `&` `é` `ñ`
**Cleanup**: Delete note and save to restore empty state

---

## TC-LOC-NTS-014: Add multiple rows and verify sequential positions
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab and click "Add". Confirm the first note row appears. 2. Click "Add" again. Confirm a second note row appears and both rows have "Delete" buttons. 3. Click "Add" again. Confirm a third note row appears and all three rows have "Delete" buttons. 4. Verify all three note boxes show the placeholder text "Type notes here." 5. Type distinct text in each row. Confirm each note row holds its own content independently.
**Expected**: All three rows are present and editable; each shows a Delete button once two or more rows exist.
**Data**: office=1604
**Notes**: interface has NO visible row number column (#). Rows identified by textarea nth position only.
**Cleanup**: Delete rows 3 and 2, discard changes

---

## TC-LOC-NTS-015: Delete middle row and verify remaining rows shift
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab, click "Add", and type "Row A" in the first row. 2. Click "Add" and type "Row B" in the second row. 3. Click "Add" and type "Row C" in the third row. Confirm the counter includes all three values plus two delimiters. 4. Click "Delete" on the second row. Confirm the "Row B" row is removed. 5. Verify the remaining rows show "Row A" in the first position and "Row C" in the second position (shifted up). 6. Verify the counter decreased by the length of "Row B" (5 characters) plus 1 delimiter, totaling 6 characters removed.
**Expected**: Remaining rows shift; content preserved; counter decreases correctly
**Data**: office=1604 | row1="Row A" | row2="Row B" | row3="Row C"
**Notes**: No visible row numbers — rows identified by position. "Row C" shifts to positional index after deleting positional index.
**Cleanup**: Delete remaining extra row(s), discard changes

---

## TC-LOC-NTS-016: Row created via Add shows Delete, and typing keeps the row
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab. Confirm "No Notes Available" is shown. 2. Click "Add". Confirm an empty row appears with no "Delete" button present (0 Delete buttons). 3. Verify the counter shows "0/4000(4000 Left)". 4. Type a single character "a" in the note box. Confirm the counter shows "1/4000". 5. Verify the "Delete" button now appears on the row.
**Expected**: Empty row has no Delete; Delete appears immediately when text is typed (even 1 char)
**Data**: office=1604 | trigger_char="a"
**Cleanup**: Delete the row or clear text, discard changes

---

## TC-LOC-NTS-017: Delete last remaining row restores No Notes Available
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab with one note row present (add one if empty). Confirm the row is visible with a "Delete" button. 2. Clear the note text in the row to empty. Confirm the counter shows "0/4000(4000 Left)" and Save becomes enabled. 3. Click "Delete". Confirm the row is removed, the table shows "No Notes Available", and the counter reads "0/4000(4000 Left)". 4. Verify the "Add" button is still visible. 5. Verify the "Save" button is enabled (the deletion is a pending change). 6. If asserting persistence: click "Save", confirm the dialog (the button is labeled "Ok" per BUG-LOC-NTS-002), reload, and verify "No Notes Available" persists.
**Expected**: Deleting the last note row returns to "No Notes Available" state immediately; table completely empty. **For persistence**: must pair Delete with preceding fill the note input (BUG-LOC-NTS-001).
**Data**: office=1604

---

## TC-LOC-NTS-018: XSS payload stored as unsafe text (security)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Negative | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab and click "Add". 2. Type `<script>alert(1)</script>` in the note box. Confirm the text is displayed as-is (25 characters in the counter). 3. Verify no script executes (no alert dialog, no visible error). 4. Click the left-panel "Save" and confirm. 5. Reload the page and open the "Notes" tab. Confirm `<script>alert(1)</script>` is displayed as literal text only, with no execution.
**Expected**: XSS payload stored and retrieved as plain text; never executed as HTML or JavaScript
**Data**: office=1604 | xss_payload=`<script>alert(1)</script>`
**Cleanup**: Delete note and save to restore empty state

---

## TC-LOC-NTS-019: SQL injection payload stored as text (security)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Negative | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab and click "Add". 2. Type `'; DROP TABLE notes; --` into the note box and confirm 22 characters appear in the counter. 3. Click the left-panel "Save" and confirm. 4. Reload the page and open the "Notes" tab. Confirm `'; DROP TABLE notes; --` is displayed as literal text with no database error or missing data.
**Expected**: SQL injection payload stored and retrieved as plain text; no database side effects
**Data**: office=1604 | sql_payload=`'; DROP TABLE notes; --`
**Cleanup**: Delete note and save to restore empty state

---

## TC-LOC-NTS-020: Emoji and unicode characters preserved through save/reload
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Boundary | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab and click "Add". 2. Type `café résumé 😀 中文` in the note box. Confirm all characters display correctly. 3. Verify the counter shows "18/4000" (the emoji counts as 2, so the total is 18). 4. Click the left-panel "Save" and confirm. 5. Reload the page and open the "Notes" tab. Confirm `café résumé 😀 中文` is preserved exactly.
**Expected**: Multi-byte unicode and emoji preserved without corruption through the full save+reload cycle
**Data**: office=1604 | unicode_string=`café résumé 😀 中文` (18 chars)
**Cleanup**: Delete note and save to restore empty state

---

## TC-LOC-NTS-021: Paste exceeds 4000 char limit — counter shows overage
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Boundary | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab and click "Add". 2. Paste a string of 4001 characters into the note box. 3. Verify the counter shows "4001/4000(0 Left)" — the counter reflects the overage. 4. Verify the note box accepted the content without a hard rejection (soft limit enforced via JavaScript only).
**Expected**: Counter shows the overage; there is no hard maximum-length cap to prevent pasting; the counter shows "N/4000(0 Left)" for any N at or above 4000
**Data**: office=1604 | paste_string=4001 chars
**Notes**: SOFT LIMIT confirmed. Server behavior on save with > 4000 chars should be separately documented.
**Cleanup**: Clear textarea, discard changes

---

## TC-LOC-NTS-022: Accessibility — keyboard navigation
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Low | Manual | Accessibility | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab and click "Add". 2. Press Tab repeatedly from the top of the Notes section. Confirm that the note box receives focus first, then the "Add" button, then the "Delete" button when it is present. 3. Confirm that the note box has no visible label above or beside it (this is a known gap — the field is identified by placeholder text only, not a permanent label). 4. Confirm the "Add" button is reachable by Tab and can be activated with Enter or Space. 5. Confirm the progress bar is visible but does not receive keyboard focus (it is a read-only indicator). 6. Tab to the left-panel "Save" button and press Enter to open the Save dialog. Confirm the "Cancel" button inside the dialog is reachable by Tab and can be activated with Enter.
**Expected**: All interactive elements (note box, Add, Delete, Save) are reachable by Tab and operable by keyboard. Known gaps: the note box has no permanent visible label; the progress bar does not announce its current fill value to assistive technology.
**Data**: office=1604
**Notes**: Accessibility gaps: (1) note box has no visible label (placeholder only); (2) progress bar does not expose its current value to assistive technology

---

## TC-LOC-NTS-023: Full lifecycle — add, save, reload, delete, save
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Integration | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab. Confirm "No Notes Available" is shown. 2. Click "Add" and type "Sequential test note" (20 characters). Confirm the counter shows "20/4000" and the "Delete" button is visible. 3. Click the left-panel "Save" and confirm in the dialog. Confirm the Save button becomes disabled. 4. Reload the page and click the "Notes" tab. Confirm "Sequential test note" persists and the counter shows "20/4000". 5. Click "Delete" on the note. Confirm "No Notes Available" appears, the counter shows "0/4000", and Save becomes enabled. 6. Click the left-panel "Save" and confirm in the dialog. Confirm the Save button becomes disabled. 7. Reload the page and click the "Notes" tab. Confirm "No Notes Available" persists (the deletion was also saved).
**Expected**: The full add, save, reload, delete, save, and reload lifecycle works correctly at every step.
**Data**: office=1604 | text="Sequential test note" (20 chars)

---

## TC-LOC-NTS-024: Multi-row persistence — 3 rows save+reload+verify
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Round-trip | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab and ensure the empty state. 2. Click "Add" and type "Row Alpha" (9 characters) in the first row, then click "Add" and type "Row Beta" (8 characters) in the second row, then click "Add" and type "Row Gamma" (9 characters) in the third row. Confirm 3 rows with a counter of "30/4000" (28 content plus 2 row-delimiters). 3. Click "Save" and confirm the dialog (the button is labeled "Ok" per BUG-LOC-NTS-002). 4. Reload the page and click the "Notes" tab. Confirm 4 note rows are now visible: the first reads "Row Alpha", the second "Row Beta", the third "Row Gamma", and the fourth is empty (auto-empty placeholder per BUG-LOC-NTS-003). 5. Verify content (not count): the first three rows contain the typed strings. The fourth row is empty. 6. Clean up: clear all note text, delete all rows, and save.
**Expected**: All three notes you entered remain after saving and reloading, with the correct text and order. (The app keeps one extra empty row at the end, so check the text of your notes rather than the total number of rows.)
**Data**: office=1604 | text0="Row Alpha" (9) | text1="Row Beta" (8) | text2="Row Gamma" (9)

---

## TC-LOC-NTS-025: Boundary persistence — 4000 chars save+reload
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Round-trip + BVA | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab and ensure the empty state. 2. Click "Add" and fill the first note row with 4000 "A" characters. Confirm the counter shows "4000/4000". 3. Click "Save" and confirm the dialog. 4. Reload the page and click the "Notes" tab. Confirm the counter shows "4000/4000" and the text length is 4000. 5. Clean up: delete the row and save.
**Expected**: Full 4000-char content persists after save+reload without truncation
**Data**: office=1604 | text='A'.repeat(4000)

---

## TC-LOC-NTS-026: Partial deletion persistence — delete middle row, save, verify remaining
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Round-trip + State Transition | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab and ensure the empty state. 2. Click "Add" and type "Keep First" (10 characters) in the first row, then click "Add" and type "Delete Me" (9 characters) in the second row, then click "Add" and type "Keep Last" (9 characters) in the third row. 3. Clear the second note row so it is empty. Confirm the note box shows empty and Save remains enabled. 4. Click "Delete" on the second row (which is now empty). Confirm the row is removed and the remaining rows shift: first row reads "Keep First", second row reads "Keep Last". 5. Click "Save" and confirm the dialog (the button is labeled "Ok" per BUG-LOC-NTS-002). 6. Reload the page and click the "Notes" tab. Confirm the first two rows contain "Keep First" and "Keep Last". A third empty row may exist as an auto-placeholder (BUG-LOC-NTS-003) — assert on content of the first two rows, not on total count. 7. Clean up: clear all note text, delete all rows, and save.
**Expected**: After deleting the middle row, saving, and reloading, the two non-deleted rows persist. Note: skipping the value-clear step and deleting the row directly will not persist the middle-row deletion — the save keeps all 3 rows.
**Data**: office=1604 | text0="Keep First" | text1="Delete Me" | text2="Keep Last"

---

## TC-LOC-NTS-027: Cancel save dialog — verify changes NOT persisted
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Negative Persistence | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab and ensure the empty state. 2. Click "Add" and type "Cancel test note" (16 characters). Confirm Save becomes enabled. 3. Click the "Save" button. 4. Click "Cancel" in the dialog. Confirm the dialog closes and Save is still enabled. 5. Reload the page and click the "Notes" tab. Confirm "No Notes Available" is shown — the note was not saved.
**Expected**: Cancelling save dialog prevents persistence; note is discarded on reload
**Data**: office=1604 | text="Cancel test note" (16 chars)

---

## TC-LOC-NTS-028: Sequential save — add second note with reload between saves, both persist
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Round-trip | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab and ensure the empty state. 2. Click "Add" and type "Sequential A" (12 characters) in the first row. 3. Click "Save" and confirm the dialog. 4. Reload the page and click the "Notes" tab (a reload is required because Save does not re-enable after a post-save add+fill). 5. Verify the first row reads "Sequential A". 6. Click "Add" and type "Sequential B" (12 characters) in the second row. 7. Click "Save" and confirm the dialog. 8. Reload the page and click the "Notes" tab. 9. Verify the first row reads "Sequential A", the second row reads "Sequential B", and two rows are present.
**Expected**: Both notes persist after two sequential saves with a reload between saves (a reload is required between saves because, in a post-save session, the Save button stays disabled after adding and filling a new note until the page is reloaded)
**Data**: office=1604 | text0="Sequential A" (12) | text1="Sequential B" (12)
**Cleanup**: Delete all rows and save to restore empty state

---

## TC-LOC-NTS-029: Edit existing saved note — overwritten text persists
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Round-trip | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab and ensure the empty state. 2. Click "Add" and type "Original text" (13 characters) in the first row. 3. Click "Save" and confirm the dialog. 4. Reload the page and click the "Notes" tab (a reload is required because Save does not re-enable after a post-save fill). 5. Verify the first row reads "Original text". 6. Overwrite the first row with "Edited text" (11 characters). 7. Click "Save" and confirm the dialog. 8. Reload the page and click the "Notes" tab. 9. Verify the first row reads "Edited text".
**Expected**: In-place edit of a saved note persists after a second save and reload (a reload is required between saves because, in a post-save session, the Save button stays disabled after filling the note until the page is reloaded)
**Data**: office=1604 | original="Original text" (13) | edited="Edited text" (11)
**Cleanup**: Delete row and save to restore empty state

---

## TC-LOC-NTS-030: Save empty row — persists as empty note box, not No Notes Available
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | State Transition | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab and ensure the empty state. 2. Click "Add" to create an empty row (do not type anything). 3. Verify Save becomes enabled (there are now unsaved changes from the Add action). 4. Click "Save" and confirm the dialog. 5. Reload the page and click the "Notes" tab. 6. Verify one empty note box row exists (not "No Notes Available"). 7. Verify the counter shows 0 and the "No Notes Available" message is not visible.
**Expected**: An empty row saved deliberately persists as an empty note box, distinct from the "No Notes Available" default state
**Data**: office=1604
**Cleanup**: Delete row and save to restore empty state

---

## TC-LOC-NTS-031: Overage content persists — 4001 chars save+reload without truncation
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Round-trip + BVA | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab and ensure the empty state. 2. Click "Add" and paste 4001 characters into the first note row (bypasses the soft keyboard limit). 3. Verify the counter shows "4001/4000(0 Left)". 4. Click "Save" and confirm the dialog. 5. Reload the page and click the "Notes" tab. 6. Verify the counter shows 4001 and the text length is 4001.
**Expected**: Content exceeding the 4000 soft limit persists without the text being shortened
**Data**: office=1604 | text='A'.repeat(4001)
**Cleanup**: Delete row and save to restore empty state

---

## TC-LOC-NTS-032: Delete row persists without explicit note box clear
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Regression | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open the "Notes" tab and ensure the empty state. 2. Click "Add" and type "Delete check" (12 characters) in the first row. 3. Click "Save" and confirm the dialog. 4. Reload the page. Verify the first row reads "Delete check". 5. Click "Delete" on the first row WITHOUT clearing the note box first. 6. Verify "No Notes Available" is now visible. 7. Click "Save" and confirm the dialog. 8. Reload the page and click the "Notes" tab. 9. Verify the default empty state persists.
**Expected**: Delete row + save persists the deletion without needing to clear the note box first (regression check for BUG-LOC-NTS-001)
**Data**: office=1604 | text="Delete check" (12)
**Notes**: BUG-LOC-NTS-001 reported that delete-without-clear didn't persist. walk-evidence found NOT reproducible — this TC confirms the fix holds.

---

## Notes Field Coverage — TC-LOC-NTS-033..058

**Derived_From**: `_internal/field-case-catalogs/notes.md`
**Paradigm**: Per-field-case save+reload+verify per `_internal/field-case-generation.md` §2
**Runner**: `clients/encore/src/core/field-case-runner.ts` `saveAndVerifyCase`
**Source**: SUBPLAN_NOTES_FCC_PILOT, canonicalized by SUBPLAN_XLSX_PREP_01
**Naming policy** (Rutvik): TC IDs use submodule naming (NTS), NEVER plan/concept naming (no `-FCC-` segment in any ID). "FCC" survives only as a methodology concept in prose.
**Numbering**: Canonical contiguous IDs TC-LOC-NTS-001..058 (the six HIST col-69 cases formerly carried here were relocated to Location Management History as TC-LOC-MGH-020..025).

---

## TC-LOC-NTS-033: Verify a single-character note persists after save and reload
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none (each FCC test is independent — see SUBPLAN_NOTES_FCC_PILOT discipline)
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and type "a" into the first note row. 3. Click Save and confirm the dialog. 4. Reload the page and navigate back to the Notes tab. 5. Confirm the first note reads "a".
**Expected**: After reload, the first note row holds exactly the one character "a".
**Data**: office=1604 | NOTE_1_CHAR="a"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-034: Verify a 3999-character note persists after save and reload
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and type the 3999-character string into the first note row. 3. Click Save and confirm the dialog. 4. Reload the page and navigate back to the Notes tab. 5. Confirm the first note holds the 3999-character content verbatim.
**Expected**: After reload, the first note row holds the 3999-char content verbatim.
**Data**: office=1604 | NOTE_3999_CHARS="A".repeat(3999)
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-035: Whitespace-only " " persist
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and type three space characters into the first note row. 3. Click Save and confirm the dialog. 4. Reload the page and navigate back to the Notes tab. 5. Confirm the first note holds the three space characters with no trimming.
**Expected**: After reload, the first note row holds the three space characters with no trimming.
**Data**: office=1604 | NOTE_WHITESPACE_ONLY=" "
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-036: Leading whitespace " hello" persist (not trimmed)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and type " hello" (two leading spaces followed by hello) into the first note row. 3. Click Save and confirm the dialog. 4. Reload the page and navigate back to the Notes tab. 5. Confirm the first note holds the two leading spaces and the word hello with no trimming.
**Expected**: After reload, the first note row holds the two leading spaces and the word hello with no trimming.
**Data**: office=1604 | NOTE_LEADING_WS=" hello"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-037: Trailing whitespace "hello " persist (not trimmed)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and type "hello " (hello followed by two trailing spaces) into the first note row. 3. Click Save and confirm the dialog. 4. Reload the page and navigate back to the Notes tab. 5. Confirm the first note holds the word hello followed by two trailing spaces with no trimming.
**Expected**: After reload, the first note row holds the word hello followed by two trailing spaces with no trimming.
**Data**: office=1604 | NOTE_TRAILING_WS="hello "
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-038: Verify a multi-line note with line breaks persists after save
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and paste the three-line value "line1\nline2\nline3" into the first note row. 3. Click Save and confirm the dialog. 4. Reload the page and navigate back to the Notes tab. 5. Confirm the first note holds the same three lines separated by literal newline characters.
**Expected**: After reload, the first note row holds the three lines separated by literal newline characters in the note box value.
**Data**: office=1604 | NOTE_NEWLINE_MULTI="line1\nline2\nline3"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-039: Edit prepend
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add", type "Base text" into the first note row, then save and reload. 3. Add "Prepended — " to the start of the first note (so the full text reads "Prepended — Base text"). 4. Click Save and confirm the dialog. 5. Reload the page and navigate back to the Notes tab. 6. Confirm the first note reads "Prepended — Base text".
**Expected**: After reload, the first note row holds the prepended prefix concatenated in front of the original text.
**Data**: office=1604 | NOTE_APPEND_BASE="Base text" | NOTE_PREPEND_PREFIX="Prepended — "
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-040: Edit partial-replace (slice middle)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add", type "Hello world there" into the first note row, then save and reload. 3. In the first note, replace the word "world" (characters 7 through 11) with "EARTH" so the text reads "Hello EARTH there". 4. Click Save and confirm the dialog. 5. Reload the page and navigate back to the Notes tab. 6. Confirm the first note reads "Hello EARTH there".
**Expected**: After reload, the word "world" in the middle of the first note row has been replaced with the word EARTH; surrounding text is unchanged.
**Data**: office=1604 | NOTE_REPLACE_BASE="Hello world there" | NOTE_REPLACE_SLICE={start:6, end:11, replacement:"EARTH"}
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-041: Edit clear-to-empty (row stays with empty value)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add", type "Base text" into the first note row, then save and reload. 3. Clear the first note row so it is empty. 4. Click Save and confirm the dialog. 5. Reload the page and navigate back to the Notes tab. 6. Confirm the first note row holds an empty value.
**Expected**: After reload, the first note row exists with an empty note box value (a placeholder row, not the "No Notes Available" empty state).
**Data**: office=1604 | NOTE_APPEND_BASE="Base text"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-042: 2-row positive (smallest multi-row save+reload)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and type "Row Alpha-2row" into the first note row. 3. Click "Add" again. 4. Type "Row Beta-2row" into the second note row. 5. Click Save and confirm the dialog. 6. Reload the page and navigate back to the Notes tab. 7. Confirm the first note reads "Row Alpha-2row" and the second note reads "Row Beta-2row".
**Expected**: After reload, two rows persist with the original values in order.
**Data**: office=1604 | NOTE_2ROW_A="Row Alpha-2row" | NOTE_2ROW_B="Row Beta-2row"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-043: 5-row positive (smoke at moderate count)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and type the value for note 1 into the first note row, then click "Add" and type the value for note 2 into the second, and repeat until all five rows are filled with the values for note 1 through note 5 in order. 3. Click Save and confirm the dialog. 4. Reload the page and navigate back to the Notes tab. 5. Confirm each of the five rows holds its original value in order (note 1 first, note 2 second, and so on through note 5).
**Expected**: After reload, five rows persist with the original values in order.
**Data**: office=1604 | NOTE_5ROW=["r1","r2","r3","r4","r5"]
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-044: Mixed-content (note 1 = 1-char, note 2 = 4000-char) save+reload
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and type "a" into the first note row. 3. Click "Add" again. 4. Paste the 4000-character "B" string into the second note row. 5. Click Save and confirm the dialog. 6. Reload the page and navigate back to the Notes tab. 7. Confirm the first note reads "a" and the second note holds the 4000-character string.
**Expected**: After reload, the first note row (short) and the second note row (long) each persist their own content; lengths confirmed independently.
**Data**: office=1604 | NOTE_MIXED_SHORT="a" | NOTE_MIXED_LONG="B".repeat(4000)
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-045: Edit the second of two note rows — first row unchanged after save+reload
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and type NOTE_2ROW_A into the first note row. Click "Add" again and type NOTE_2ROW_B into the second note row. Click Save and confirm the dialog. Reload the page and navigate back to the Notes tab. 3. Add " — edited" to the end of the second note. 4. Click Save and confirm the dialog. 5. Reload the page and navigate back to the Notes tab. 6. Confirm the first note reads NOTE_2ROW_A unchanged. 7. Confirm the second note ends with " — edited".
**Expected**: After the second save+reload, the first note row is identical to the original; the second note row holds the edited content.
**Data**: office=1604 | NOTE_2ROW_A | NOTE_2ROW_B
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-046: Verify deleting the first of two note rows leaves the other
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and type NOTE_2ROW_A into the first note row. Click "Add" again and type NOTE_2ROW_B into the second note row. Click Save and confirm the dialog. Reload the page and navigate back to the Notes tab. 3. Clear the first note row so it is empty, then click "Delete" on that row. 4. Click Save and confirm the dialog. 5. Reload the page and navigate back to the Notes tab. 6. Confirm the first note reads NOTE_2ROW_B (the value originally in the second row).
**Expected**: After reload, the sole remaining row holds the content that was originally in the second note row; the first note row from the initial state is gone.
**Data**: office=1604 | NOTE_2ROW_A | NOTE_2ROW_B
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-047: Verify deleting the last of three note rows leaves the first two
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and type "r1" into the first note row. Click "Add" again and type "r2" into the second note row. Click "Add" again and type "r3" into the third note row. Click Save and confirm the dialog. Reload the page and navigate back to the Notes tab. 3. Clear the third note row so it is empty, then click "Delete" on that row. 4. Click Save and confirm the dialog. 5. Reload the page and navigate back to the Notes tab. 6. Confirm the first note reads "r1" and the second note reads "r2". The third row is absent or holds only the empty placeholder (per BUG-LOC-NTS-003).
**Expected**: After reload, the first and second note rows persist unchanged; the third row is removed from the saved set (assert on content of the first two rows, not total count).
**Data**: office=1604 | three short strings
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-048: Verify a note persists after a cancel-then-resave flow
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and type "Initial draft" into the first note row. 3. Click Save. On the dialog click Cancel. Confirm the form stays dirty and the first note still shows "Initial draft". 4. Clear the first note row and type "Final saved" into it. 5. Click Save and confirm the dialog. 6. Reload the page and navigate back to the Notes tab. 7. Confirm the first note reads "Final saved".
**Expected**: After reload, the first note row holds the final value only; the initial draft was never persisted.
**Data**: office=1604 | NOTE_CANCEL_RESAVE_INITIAL="Initial draft" | NOTE_CANCEL_RESAVE_FINAL="Final saved"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-049: Verify reloading during the save dialog does not persist the note
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and type "Idempotent test" into the first note row. 3. Click Save so the dialog appears. 4. While the dialog is still visible, reload the page. 5. After reload, navigate to the Notes tab. 6. Confirm the Notes section is at the empty default state and no error message is visible.
**Expected**: After reload mid-dialog, no draft data is persisted; the Notes tab is at the empty baseline; no application-level error appears.
**Data**: office=1604 | NOTE_IDEMPOTENT="Idempotent test"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-050: Verify pressing Escape on the save dialog cancels without saving
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and type "Escape test" into the first note row. 3. Click Save so the dialog appears. 4. Press the Escape key. 5. Confirm the dialog closes and the first note still holds "Escape test" with the Save button still enabled (the form has unsaved changes). 6. Reload the page and navigate back to the Notes tab. 7. Confirm the Notes section is at the empty default state (nothing was saved).
**Expected**: Escape dismisses the dialog without saving; the form remains dirty in-memory; nothing is persisted after reload.
**Data**: office=1604 | NOTE_ESCAPE_DIALOG="Escape test"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-051: Verify the save dialog behavior when clicking outside it
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and type "Escape test" into the first note row. 3. Click Save so the dialog appears. 4. Click on the page background outside the dialog. 5. Observe: either the dialog stays open (modal blocks outside clicks) or the dialog closes without saving. Record which branch occurs. 6. If the dialog is still open, click Cancel. If the dialog already closed, confirm the first note row still shows the unsaved text. 7. Reload the page and navigate back to the Notes tab. 8. Confirm the Notes section is at the empty default state (nothing was saved).
**Expected**: The dialog's reaction to an outside click is documented; no draft data persists across reload regardless of branch.
**Data**: office=1604 | NOTE_ESCAPE_DIALOG="Escape test"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-052: Verify a second save attempt keeps the Save button disabled
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and type "Idempotent test" into the first note row. 3. Click Save and confirm the dialog. 4. Wait for the Save button to become disabled. 5. Attempt to click the Save button again without making any changes. 6. Confirm no dialog appears and nothing is saved.
**Expected**: A second save attempt on a form with no pending changes has no effect; the Save button remains disabled and nothing is saved.
**Data**: office=1604 | NOTE_IDEMPOTENT="Idempotent test"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-053: Sequential save persists most recent value
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | FCC | Yes |

**Depends_On**: none
**Spawned_From**: SUBPLAN_XLSX_PREP_01 backfill — spec at and CSV row at locations_notes_test_cases.csv:60 pre-existed without an MD entry from SP-NOTES-FCC-PILOT closure; backfilled here to satisfy Spec ⊂ MD ⊂ CSV parity. Splits responsibility with TC-LOC-MGH-025 (HIST 2-row distinctness assertion stays on the HIST spec side).
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and type NOTE_SEQUENTIAL_HIST_A into the first note row. Click Save and confirm the dialog. 3. Reload the page and navigate back to the Notes tab. 4. Clear the first note row and type NOTE_SEQUENTIAL_HIST_B into it. Click Save and confirm the dialog. 5. Reload the page and navigate back to the Notes tab. 6. Confirm the first note reads NOTE_SEQUENTIAL_HIST_B.
**Expected**: After two sequential saves of different values, the first note holds the most recent value (B); the earlier value (A) is no longer present on the Notes form.
**Data**: office=1604 | NOTE_SEQUENTIAL_HIST_A="HIST seq A" | NOTE_SEQUENTIAL_HIST_B="HIST seq B"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-054: Verify saving Notes does not leave the Currency tab unsaved
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and type NOTE_1_CHAR into the first note row. 3. Click Save and confirm the dialog (Notes is clean after save). 4. Click the "Currency" sub-tab. 5. On the Currency sub-tab, observe the Save button state and confirm no unsaved-changes dialog appears.
**Expected**: After saving Notes, switching to Currency tab does NOT trigger any unsaved-changes dialog; Currency's Save button remains disabled (Currency has no unsaved changes of its own).
**Data**: office=1604 | NOTE_1_CHAR
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-055: Verify saved note rows persist by content after reload
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and type "Idempotent test" into the first note row. 3. Click Save and confirm the dialog. 4. Reload the page and navigate back to the Notes tab. 5. Confirm the first note reads "Idempotent test". Check only the note's text content. The app automatically keeps one trailing empty row, so the total row count is not checked.
**Expected**: After reload, the content of the first note row is verified; the total row count is not checked because the app auto-creates a trailing empty placeholder row.
**Data**: office=1604 | NOTE_IDEMPOTENT="Idempotent test"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-056: Verify deleting the only note row returns the empty state
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and type NOTE_1_CHAR into the first note row. Click Save and confirm the dialog. Reload the page and navigate back to the Notes tab. 3. Clear the first note row so it is empty, then click "Delete" on that row. 4. Click Save and confirm the dialog. 5. Reload the page and navigate back to the Notes tab. 6. Confirm the Notes section is at its empty state (either "No Notes Available" or a single empty placeholder row per BUG-LOC-NTS-003).
**Expected**: After reload, the Notes section is at its empty representation (either the "No Notes Available" row or a single placeholder empty note box).
**Data**: office=1604 | NOTE_1_CHAR
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-057: Tab character "a\\tb" persist
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add" and paste the value "a[tab]b" (the letter a, a literal tab character, then the letter b) into the first note row. 3. Click Save and confirm the dialog. 4. Reload the page and navigate back to the Notes tab. 5. Confirm the first note holds a single tab character between a and b.
**Expected**: After reload, the first note row holds a single tab character between a and b, not a space or two spaces.
**Data**: office=1604 | NOTE_TAB_CHAR="a\tb"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-058: Edit append
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. Ensure the Notes table is empty (no rows visible). 2. Click "Add", type "Base text" into the first note row, then click Save and confirm the dialog and reload the page and navigate back to the Notes tab. 3. Add " — appended" to the end of the first note. 4. Click Save and confirm the dialog. 5. Reload the page and navigate back to the Notes tab. 6. Confirm the first note reads "Base text — appended".
**Expected**: After reload, the first note row holds the original text plus the appended suffix concatenated as one value.
**Data**: office=1604 | NOTE_APPEND_BASE="Base text" | NOTE_APPEND_SUFFIX=" — appended"
**Cleanup**: ensure the table is empty
