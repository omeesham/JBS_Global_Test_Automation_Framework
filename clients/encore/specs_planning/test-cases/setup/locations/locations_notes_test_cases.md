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
**Steps**: 1. Navigate to `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location` ✓ Page loads 2. Click **Notes** tab `[data-testid="location-settings-sub-tab-notes"]` ✓ Tab activates 3. Verify table shows "No Notes Available" ✓ Empty state with colspan row (NO column headers in interface) 4. Verify character counter ✓ "0/4000" with "(4000 Left)" 5. Verify **Add** button visible ✓ `[data-testid="location-settings-section-notes"] button:has-text("Add")` enabled 6. Verify progress bar visible ✓ `[role="progressbar"]` minimal fill 7. Verify NO **Delete** button ✓ No Delete button in section
**Expected**: Empty table ("No Notes Available"), counter at 0/4000, Add button enabled, NO Delete button, NO column headers
**Data**: office=1604
**Notes**: Verified live: the table starts EMPTY (no default row). No header row exists in the interface.

---

## TC-LOC-NTS-002: Type text in textarea and verify counter updates
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab ✓ Empty state 2. Click **Add** button ✓ Empty row appears with `textarea[name="notes.notes.0.note"]` focused 3. Type "Test note for exploration" ✓ Text appears in textarea 4. Verify character counter ✓ "25/4000" with "(3975 Left)" 5. Verify **Save** button in left panel is enabled ✓ `[data-testid="location-settings-btn-save"]` enabled
**Expected**: Counter updates in real time to 25/4000; Save button enables on change
**Data**: office=1604 | text="Test note for exploration" (25 chars)
**Cleanup**: Clear textarea or navigate away without saving

---

## TC-LOC-NTS-003: Add second note row and verify Delete button behavior
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, click **Add** ✓ Empty row with textarea; NO Delete button 2. Type "First note" in row 1 ✓ Counter: "10/4000", **Delete** appears on row 1 3. Click **Add** button again ✓ Second row appears as empty textarea 4. Verify Delete on row 1 ✓ Still present (row has content) 5. Verify Delete on row 2 ✓ Also present (2+ rows — ALL rows get Delete) 6. Verify counter ✓ "11/4000" (10 chars + 1 delimiter)
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
**Steps**: 1. Open **Notes** tab, click **Add** ✓ Row 1 2. Type "Hello" in row 1 ✓ Counter: "5/4000" 3. Click **Add** ✓ Row 2 appears, counter: "6/4000" (delimiter=+1) 4. Type "World" in row 2 ✓ Counter: "11/4000" (5+1+5) 5. Click **Add** ✓ Row 3 appears, counter: "12/4000" 6. Type "End" in row 3 ✓ Counter: "15/4000" (5+1+5+1+3)
**Expected**: Each additional row adds exactly 1 delimiter character to the total count
**Data**: office=1604 | row1="Hello" | row2="World" | row3="End" | expected_total=15
**Cleanup**: Delete rows 3 and 2, clear row 1, discard changes

---

## TC-LOC-NTS-005: Delete a row and verify counter decreases
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, click **Add**, type "First note" ✓ Counter: "10/4000" 2. Click **Add**, type "Second note" in row 2 ✓ Counter: "22/4000" (10+1+11) 3. Click **Delete** on row 2 ✓ Row 2 removed; counter: "10/4000" 4. Verify Delete still visible on row 1 ✓ Row 1 has content → Delete remains visible 5. Verify 1-row state ✓ Only row 1 remains with "First note"
**Expected**: Counter decreases by deleted row text + delimiter; Delete stays on row 1 because it has content
**Data**: office=1604 | row1="First note" | row2="Second note"
**Notes**: Delete stays on row 1 after deleting row 2 (because row 1 has content — not "disappears when 1 row").
**Cleanup**: Clear row 1, discard changes

---

## TC-LOC-NTS-006: Progress bar updates proportionally with character usage
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab ✓ Progress bar `[role="progressbar"]` at minimal fill 2. Click **Add**, type 40-character string ✓ Bar slightly fills (~1% of 4000) 3. Change text to a 2000-character string ✓ Bar is ~50% filled 4. Verify proportional fill ✓ Bar width corresponds to percentage of 4000 used
**Expected**: Progress bar fills proportionally to character usage against the 4000 limit
**Data**: office=1604 | small_text=40 chars | large_text=2000 chars
**Cleanup**: Clear text, discard changes

---

## TC-LOC-NTS-007: Verify 4000 character limit (soft enforcement)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Boundary | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, click **Add** ✓ Row appears 2. Fill textarea with exactly 4000 characters ✓ Counter: "4000/4000(0 Left)", progress bar full 3. Attempt to type one additional character via keyboard ✓ Character is blocked (keyboard input stops at limit) 4. Paste a 4001-char string into textarea ✓ Counter shows "4001/4000(0 Left)" — overage accepted via paste 5. Verify textarea has NO `maxlength` attribute ✓ Confirmed (soft-limit only)
**Expected**: Keyboard input blocked at 4000; paste bypasses (soft limit); counter shows overage; no HTML maxlength
**Data**: office=1604 | boundary_string=4000 chars | paste_string=4001 chars
**Notes**: Verified live: the character limit is soft — the note field enforces no maximum length, so a pasted value can exceed 4000 characters.
**Cleanup**: Clear textarea, discard changes

---

## TC-LOC-NTS-008: Save notes via left-panel Save button
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, click **Add**, type "Saved note content" ✓ Counter: "19/4000" (18 content + 1 row-delimiter — see counter-includes-delimiter behavior in TC-LOC-NTS-004) 2. Click left-panel **Save** `[data-testid="location-settings-btn-save"]` ✓ `alertdialog` appears 3. Verify dialog heading ✓ "Save Changes" 4. Verify dialog body ✓ "Are you sure you want to save the changes?" 5. Click **Ok** in dialog `[an alert dialog] button:has-text("Ok")` ✓ Dialog closes (BUG-LOC-NTS-002 — button is labeled "Ok" not "Save" per walk-evidence; will revert to `Save` if Encore confirms label fix) 6. Verify left-panel **Save** button becomes disabled ✓ No unsaved changes
**Expected**: Save dialog appears with confirmed heading/body; after confirmation, notes saved and Save button disables
**Data**: office=1604 | text="Saved note content" (18 chars)
**Cleanup**: Delete note and save to restore empty state — use BUG-LOC-NTS-001 workaround (clear the note text before Delete click)

---

## TC-LOC-NTS-009: Notes persist after page reload
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, click **Add**, type "Persistent note" ✓ 15 chars 2. Save via left-panel **Save**, confirm in dialog ✓ Saved; Save button disables 3. Reload page (navigate same URL) ✓ Page reloads 4. Click **Notes** tab ✓ Tab loads (~2s — wait for `[data-testid="location-settings-section-notes"]`) 5. Verify row value ✓ "Persistent note" in textarea 6. Verify counter ✓ "15/4000(3985 Left)"
**Expected**: Saved notes persist after page reload with exact content and correct counter
**Data**: office=1604 | text="Persistent note" (15 chars)
**Cleanup**: Delete note and save to restore empty state

---

## TC-LOC-NTS-010: Tab switch preserves unsaved notes
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | State | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, click **Add**, type "Temporary text" ✓ Counter: "14/4000" 2. Click **Currency** tab `[data-testid="location-settings-sub-tab-currency"]` ✓ Currency tab loads 3. Click **Notes** tab again ✓ Notes tab reloads 4. Verify textarea still contains ✓ "Temporary text" 5. Verify counter ✓ "14/4000(3986 Left)"
**Expected**: Switching between sub-tabs preserves unsaved note content in the form state
**Data**: office=1604 | text="Temporary text" (14 chars)
**Cleanup**: Clear textarea, discard changes

---

## TC-LOC-NTS-011: Navigation away triggers browser beforeunload dialog
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | State | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, click **Add**, type "Unsaved text" ✓ Save button enables 2. Navigate away (e.g., `navigation` to a different URL) ✓ Browser "beforeunload" dialog prompt appears 3. Accept navigation ✓ User leaves page without saving; changes discarded
**Expected**: Navigating away with unsaved changes triggers browser's built-in beforeunload confirmation dialog
**Data**: office=1604 | text="Unsaved text"
**Notes**: This is the BROWSER's `beforeunload` dialog, not the app's `alertdialog "Save Changes"`

---

## TC-LOC-NTS-012: Delete all notes and save empty state
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Low | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab with a saved note (or add + save one) ✓ Note visible with Delete button 2. **For each row to delete** (LR-026 + BUG-LOC-NTS-001 workaround): (a) Clear the row's the note text to empty string via input event (automation `.fill("")`) — wait for form-dirty propagation, (b) Click **Delete** on the row ✓ Row removed, "No Notes Available" shows; counter: "0/4000" 3. Click left-panel **Save**, confirm in dialog (button is "Ok" per BUG-LOC-NTS-002) ✓ Saved 4. Reload page, click **Notes** tab ✓ "No Notes Available" state persists
**Expected**: Deleting the last note and saving persists the empty "No Notes Available" state. **WARNING (BUG-LOC-NTS-001)**: clicking Delete WITHOUT first clearing the note text does NOT persist the deletion — the form-dirty flag flips but the underlying FormArray's value is not updated, so save dispatches the pre-delete payload. Always pair Delete with a preceding fill the note input in automation.
**Data**: office=1604

---

## TC-LOC-NTS-013: Special and HTML characters stored correctly
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Low | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, click **Add** ✓ Row appears 2. Type: `"test"`, `<div>`, `&amp;`, `é`, `ñ` ✓ Characters appear in textarea 3. Verify counter counts each character accurately ✓ Length matches expected 4. Save via left-panel **Save**, confirm ✓ Saved 5. Reload and verify **Notes** tab ✓ Special characters preserved exactly as typed
**Expected**: HTML entities, quotes, accented chars accepted, counted, saved, retrieved without corruption
**Data**: office=1604 | test_string contains: `"` `<` `>` `&` `é` `ñ`
**Cleanup**: Delete note and save to restore empty state

---

## TC-LOC-NTS-014: Add multiple rows and verify sequential positions
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, click **Add** ✓ Row 1 textarea (positional index) appears 2. Click **Add** again ✓ Row 2 textarea (positional index) appears; both rows have Delete buttons 3. Click **Add** again ✓ Row 3 textarea (positional index) appears; all 3 rows have Delete buttons 4. Verify all 3 textboxes have placeholder ✓ "Type notes here." 5. Type distinct text in each ✓ Each `textarea` (scoped by nth) holds its own content
**Expected**: Three rows accessible via nth indexing on `[data-testid="location-settings-section-notes"] textarea`; all get Delete when 2+ rows
**Data**: office=1604
**Notes**: interface has NO visible row number column (#). Rows identified by textarea nth position only.
**Cleanup**: Delete rows 3 and 2, discard changes

---

## TC-LOC-NTS-015: Delete middle row and verify remaining rows shift
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, click **Add**, type "Row A" in row 1 (positional index) ✓ 2. Click **Add**, type "Row B" in row 2 (positional index) ✓ 3. Click **Add**, type "Row C" in row 3 (positional index) ✓ Counter includes all 3 + 2 delimiters 4. Click **Delete** on row 2 ✓ "Row B" row removed 5. Verify remaining rows ✓ positional index = "Row A", positional index = "Row C" (shifted) 6. Verify counter ✓ Decreased by "Row B" (5 chars) + 1 delimiter = 6 chars removed
**Expected**: Remaining rows shift; content preserved; counter decreases correctly
**Data**: office=1604 | row1="Row A" | row2="Row B" | row3="Row C"
**Notes**: No visible row numbers — rows identified by position. "Row C" shifts to positional index after deleting positional index.
**Cleanup**: Delete remaining extra row(s), discard changes

---

## TC-LOC-NTS-016: Row created via Add has Delete visible; typing keeps it
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab ✓ "No Notes Available" state 2. Click **Add** ✓ Empty row appears; NO Delete button in section (verify: 0 Delete buttons) 3. Verify counter ✓ "0/4000(4000 Left)" 4. Type a single character "a" in the textarea ✓ Counter: "1/4000" 5. Verify Delete button NOW appears ✓ Delete visible in the row's actions cell
**Expected**: Empty row has no Delete; Delete appears immediately when text is typed (even 1 char)
**Data**: office=1604 | trigger_char="a"
**Cleanup**: Delete the row or clear text, discard changes

---

## TC-LOC-NTS-017: Delete last remaining row restores No Notes Available
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab with 1 note row (add one if empty) ✓ Row with content visible; Delete button present 2. **Clear the the note text to empty string via input event** (LR-026 + BUG-LOC-NTS-001 workaround) ✓ Counter: "0/4000(4000 Left)"; Save enables 3. Click **Delete** ✓ Row removed; table shows "No Notes Available"; counter: "0/4000(4000 Left)" 4. Verify Add button still visible ✓ Can still add a new row 5. Verify Save button enabled ✓ Pending change (deletion not yet saved) 6. (If asserting persistence) Click **Save**, confirm dialog (button is "Ok" per BUG-LOC-NTS-002) → reload → verify "No Notes Available" persists
**Expected**: Deleting the last note row returns to "No Notes Available" state immediately; table completely empty. **For persistence**: must pair Delete with preceding fill the note input (BUG-LOC-NTS-001).
**Data**: office=1604

---

## TC-LOC-NTS-018: XSS payload stored as unsafe text (security)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Negative | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, click **Add** ✓ Row appears 2. Type `<script>alert(1)</script>` in textarea ✓ Text displayed as-is (25 chars in counter) 3. Verify no script executes ✓ No alert dialog; no console injection errors 4. Save via left-panel **Save**, confirm ✓ Saved 5. Reload and open **Notes** tab ✓ `<script>alert(1)</script>` displays as literal text only; no execution
**Expected**: XSS payload stored and retrieved as plain text; never executed as HTML or JavaScript
**Data**: office=1604 | xss_payload=`<script>alert(1)</script>`
**Cleanup**: Delete note and save to restore empty state

---

## TC-LOC-NTS-019: SQL injection payload stored as text (security)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Negative | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, click **Add** ✓ Row appears 2. Type `'; DROP TABLE notes; --` in textarea ✓ 22 chars in counter 3. Save via left-panel **Save**, confirm ✓ Saved 4. Reload and open **Notes** tab ✓ `'; DROP TABLE notes; --` displays as literal text; no DB error or missing data
**Expected**: SQL injection payload stored and retrieved as plain text; no database side effects
**Data**: office=1604 | sql_payload=`'; DROP TABLE notes; --`
**Cleanup**: Delete note and save to restore empty state

---

## TC-LOC-NTS-020: Emoji and unicode characters preserved through save/reload
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Boundary | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, click **Add** ✓ Row appears 2. Type `café résumé 😀 中文` in textarea ✓ All characters display correctly 3. Verify counter ✓ "18/4000" (emoji counts as 2 UTF-16 units; total = 18) 4. Save via left-panel **Save**, confirm ✓ Saved 5. Reload and open **Notes** tab ✓ `café résumé 😀 中文` preserved exactly
**Expected**: Multi-byte unicode and emoji preserved without corruption through the full save+reload cycle
**Data**: office=1604 | unicode_string=`café résumé 😀 中文` (18 chars)
**Cleanup**: Delete note and save to restore empty state

---

## TC-LOC-NTS-021: Paste exceeds 4000 char limit — counter shows overage
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Boundary | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, click **Add** ✓ Row appears 2. Paste a string of 4001 characters ✓ Text pasted into textarea 3. Verify counter ✓ Shows "4001/4000(0 Left)" — counter shows overage; "(0 Left)" for any >= 4000 4. Verify textarea accepted the content ✓ No hard rejection (soft limit via JS only)
**Expected**: Counter shows overage; no HTML maxlength attribute prevents paste; counter shows "N/4000(0 Left)" for any N>=4000
**Data**: office=1604 | paste_string=4001 chars
**Notes**: SOFT LIMIT confirmed. Server behavior on save with > 4000 chars should be separately documented.
**Cleanup**: Clear textarea, discard changes

---

## TC-LOC-NTS-022: Accessibility — keyboard navigation
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Low | Manual | Accessibility | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, click **Add** ✓ Row appears 2. Tab through interactive elements ✓ Focus order: textarea → Add → Delete (if present) 3. Verify textarea ✓ Has `aria-invalid="false"` (correct baseline); has `aria-describedby`; has NO `aria-label` (gap!) 4. Verify Add button ✓ Accessible via button text "Add"; no aria-label needed (text is label) 5. Verify progressbar ✓ `aria-valuemax="100"`, `aria-valuemin="0"` present; `aria-valuenow` NOT set (gap!); NO `aria-label` (gap!) 6. Verify keyboard save ✓ Tab to Save button, Enter triggers Save dialog; Cancel dismissable via Tab+Enter
**Expected**: All interactive elements keyboard-reachable; known gaps: textarea no aria-label, progressbar no aria-valuenow + no aria-label
**Data**: office=1604
**Notes**: Accessibility gaps: (1) textarea has no aria-label (placeholder only); (2) progressbar no aria-valuenow; (3) progressbar no aria-label

---

## TC-LOC-NTS-023: Full lifecycle — add, save, reload, delete, save
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Integration | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab ✓ Empty state ("No Notes Available") 2. Click **Add**, type "Sequential test note" (20 chars) ✓ Counter: "20/4000", Delete visible 3. Click left-panel **Save**, confirm in dialog ✓ Saved; Save button disables 4. Reload page, click **Notes** tab ✓ "Sequential test note" persists; counter: "20/4000" 5. Click **Delete** on the note ✓ "No Notes Available"; counter: "0/4000"; Save enables 6. Click left-panel **Save**, confirm in dialog ✓ Saved; Save button disables 7. Reload page, click **Notes** tab ✓ "No Notes Available" — deletion also persisted
**Expected**: Full add → save → reload → delete → save → reload lifecycle works correctly at every step
**Data**: office=1604 | text="Sequential test note" (20 chars)

---

## TC-LOC-NTS-024: Multi-row persistence — 3 rows save+reload+verify
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Round-trip | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, ensure empty state 2. Fill row 0 "Row Alpha" (9 chars), click **Add**, fill row 1 "Row Beta" (8 chars), click **Add**, fill row 2 "Row Gamma" (9 chars) ✓ 3 rows, counter: "30/4000" (28 content + 2 row-delimiters; counter assumption from prior TC ignored auto-empty post-save behavior) 3. Click **Save**, confirm dialog (button is "Ok" per BUG-LOC-NTS-002) ✓ Saved 4. Reload page, click **Notes** tab ✓ **4 textareas now visible**: row 0="Row Alpha", row 1="Row Beta", row 2="Row Gamma", row 3=empty (auto-empty placeholder per BUG-LOC-NTS-003). Counter: "30/4000" or similar (varies with delimiter accounting) 5. Verify content (NOT count): row 0/1/2 contain the typed strings; row 3 is empty 6. Clean up: clear all the note text + delete all rows + save (LR-026 + BUG-LOC-NTS-001 workaround)
**Expected**: All 3 user-content rows persist after save+reload with correct content and order. **NOTE (BUG-LOC-NTS-003)**: post-save state has the additional note rows (N user-content + 1 auto-empty); assert on content of rows 0.N-1, not on total textarea count.
**Data**: office=1604 | text0="Row Alpha" (9) | text1="Row Beta" (8) | text2="Row Gamma" (9)

---

## TC-LOC-NTS-025: Boundary persistence — 4000 chars save+reload
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Round-trip + BVA | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, ensure empty state 2. Fill row 0 with 4000 'A' chars ✓ Counter: "4000/4000" 3. Click **Save**, confirm dialog ✓ Saved 4. Reload page, click **Notes** tab ✓ Counter: "4000/4000"; text length = 4000 5. Clean up: delete + save
**Expected**: Full 4000-char content persists after save+reload without truncation
**Data**: office=1604 | text='A'.repeat(4000)

---

## TC-LOC-NTS-026: Partial deletion persistence — delete middle row, save, verify remaining
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Round-trip + State Transition | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, ensure empty state 2. Fill row 0 "Keep First" (10), click **Add**, fill row 1 "Delete Me" (9), click **Add**, fill row 2 "Keep Last" (9) ✓ 3 rows 3. **BUG-LOC-NTS-001 workaround**: clear row 1's the note text to empty string via input event ✓ row 1 textarea shows empty; Save still enabled 4. Click **Delete** on row 1 ("Delete Me" — now empty after step 3) ✓ Row removed; remaining rows shift: row 0="Keep First", row 1="Keep Last" 5. Click **Save**, confirm dialog (button is "Ok" per BUG-LOC-NTS-002) ✓ Saved 6. Reload page, click **Notes** tab ✓ Content of rows 0,1 persists as "Keep First" and "Keep Last"; row 2 may exist as auto-empty (BUG-LOC-NTS-003). Assert on CONTENT of first 2 rows, not on total count 7. Clean up: clear all the note text + delete all rows + save
**Expected**: After deleting middle row + save + reload, the two non-deleted rows persist (content-based assertion). **WARNING (BUG-LOC-NTS-001)**: skipping step 3 (the value-clear) and going directly from step 2 → 4 → 5 will NOT persist the middle-row deletion — the save will dispatch all 3 rows.
**Data**: office=1604 | text0="Keep First" | text1="Delete Me" | text2="Keep Last"

---

## TC-LOC-NTS-027: Cancel save dialog — verify changes NOT persisted
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Negative Persistence | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, ensure empty state 2. Fill row 0 "Cancel test note" (16 chars) ✓ Save enabled 3. Click **Save** button (opens dialog) 4. Click **Cancel** in dialog ✓ Dialog closes; Save still enabled 5. Reload page, click **Notes** tab ✓ Empty state ("No Notes Available") — note was NOT saved
**Expected**: Cancelling save dialog prevents persistence; note is discarded on reload
**Data**: office=1604 | text="Cancel test note" (16 chars)

---

## TC-LOC-NTS-028: Sequential save — add second note with reload between saves, both persist
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Round-trip | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, ensure empty state 2. Fill row 0 with "Sequential A" (12 chars) 3. Click **Save**, confirm dialog ✓ Saved 4. Reload page, click **Notes** tab (the the unsaved state does not re-enable Save after add+fill post-save — reload required) 5. Verify row 0 = "Sequential A" 6. Click **Add**, fill row 1 with "Sequential B" (12 chars) 7. Click **Save**, confirm dialog ✓ Saved 8. Reload page, click **Notes** tab 9. Verify row 0 = "Sequential A", row 1 = "Sequential B", row count = 2
**Expected**: Both notes persist after two sequential saves with a reload between saves (a reload is required between saves because, in a post-save session, the Save button stays disabled after adding and filling a new note until the page is reloaded — observed across multiple runs)
**Data**: office=1604 | text0="Sequential A" (12) | text1="Sequential B" (12)
**Cleanup**: Delete all rows and save to restore empty state

---

## TC-LOC-NTS-029: Edit existing saved note — overwritten text persists
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Round-trip | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, ensure empty state 2. Fill row 0 with "Original text" (13 chars) 3. Click **Save**, confirm dialog ✓ Saved 4. Reload page, click **Notes** tab (the the unsaved state does not re-enable Save after fill post-save — reload required) 5. Verify row 0 = "Original text" 6. Overwrite row 0 with "Edited text" (11 chars) 7. Click **Save**, confirm dialog ✓ Saved 8. Reload page, click **Notes** tab 9. Verify row 0 = "Edited text"
**Expected**: In-place edit of a saved note persists after a second save and reload (a reload is required between saves because, in a post-save session, the Save button stays disabled after filling the note until the page is reloaded — observed across multiple runs)
**Data**: office=1604 | original="Original text" (13) | edited="Edited text" (11)
**Cleanup**: Delete row and save to restore empty state

---

## TC-LOC-NTS-030: Save empty row — persists as empty textarea, not No Notes Available
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | State Transition | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, ensure empty state 2. Click **Add** to create empty row (don't type anything) 3. Verify Save enables (form dirty from Add) 4. Click **Save**, confirm dialog ✓ Saved 5. Reload page, click **Notes** tab 6. Verify 1 empty textarea row exists (NOT "No Notes Available") 7. Verify counter = 0, empty-state message NOT visible
**Expected**: An empty row saved deliberately persists as an empty textarea, distinct from the "No Notes Available" default state
**Data**: office=1604
**Cleanup**: Delete row and save to restore empty state

---

## TC-LOC-NTS-031: Overage content persists — 4001 chars save+reload without truncation
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Round-trip + BVA | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, ensure empty state 2. Paste 4001 characters into row 0 (bypasses soft keyboard limit) 3. Verify counter shows 4001 and "(0 Left)" 4. Click **Save**, confirm dialog ✓ Saved 5. Reload page, click **Notes** tab 6. Verify counter = 4001 and text length = 4001
**Expected**: Content exceeding the 4000 soft limit persists without server-side truncation
**Data**: office=1604 | text='A'.repeat(4001)
**Cleanup**: Delete row and save to restore empty state

---

## TC-LOC-NTS-032: Delete row persists without explicit textarea clear
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Regression | Yes |

**Depends_On**: TC-LOC-NTS-001
**Steps**: 1. Open **Notes** tab, ensure empty state 2. Fill row 0 with "Delete check" (12 chars) 3. Click **Save**, confirm dialog ✓ Saved 4. Reload page, verify row 0 = "Delete check" 5. Click **Delete** on row 0 WITHOUT clearing textarea first 6. Verify empty state ("No Notes Available") visible 7. Click **Save**, confirm dialog ✓ Saved 8. Reload page, click **Notes** tab 9. Verify default empty state persists
**Expected**: Delete row + save persists the deletion without needing to clear textarea first (regression check for BUG-LOC-NTS-001)
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
**Steps**: 1. ensure the table is empty 2. fill the note row(0, "a") 3. click Save and confirm the dialog 4. reload the page and navigate back to the Notes tab 5. read the note value(0) returns "a"
**Expected**: After reload, row 0 holds exactly the one character "a".
**Data**: office=1604 | NOTE_1_CHAR="a"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-034: Verify a 3999-character note persists after save and reload
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, NOTE_3999_CHARS) 3. click Save and confirm the dialog 4. reload the page and navigate back to the Notes tab 5. read the note value(0) returns the 3999-char string
**Expected**: After reload, row 0 holds the 3999-char content verbatim.
**Data**: office=1604 | NOTE_3999_CHARS="A".repeat(3999)
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-035: Whitespace-only " " persist
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, " ") 3. click Save and confirm the dialog 4. reload the page and navigate back to the Notes tab 5. read the note value(0) returns " "
**Expected**: After reload, row 0 holds the three space characters with no trimming.
**Data**: office=1604 | NOTE_WHITESPACE_ONLY=" "
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-036: Leading whitespace " hello" persist (not trimmed)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, " hello") 3. click Save and confirm the dialog 4. reload the page and navigate back to the Notes tab 5. read the note value(0) returns " hello"
**Expected**: After reload, row 0 holds the two leading spaces and the word hello with no trimming.
**Data**: office=1604 | NOTE_LEADING_WS=" hello"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-037: Trailing whitespace "hello " persist (not trimmed)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, "hello ") 3. click Save and confirm the dialog 4. reload the page and navigate back to the Notes tab 5. read the note value(0) returns "hello "
**Expected**: After reload, row 0 holds the word hello followed by two trailing spaces with no trimming.
**Data**: office=1604 | NOTE_TRAILING_WS="hello "
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-038: Verify a multi-line note with line breaks persists after save
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. paste into the note(0, "line1\nline2\nline3") 3. click Save and confirm the dialog 4. reload the page and navigate back to the Notes tab 5. read the note value(0) returns the same three-line value with embedded newlines preserved
**Expected**: After reload, row 0 holds the three lines separated by literal newline characters in the textarea value.
**Data**: office=1604 | NOTE_NEWLINE_MULTI="line1\nline2\nline3"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-039: Edit prepend
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, "Base text") then save and reload 3. prependToNote(0, "Prepended — ") 4. click Save and confirm the dialog 5. reload the page and navigate back to the Notes tab 6. read the note value(0) returns "Prepended — Base text"
**Expected**: After reload, row 0 holds the prepended prefix concatenated in front of the original text.
**Data**: office=1604 | NOTE_APPEND_BASE="Base text" | NOTE_PREPEND_PREFIX="Prepended — "
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-040: Edit partial-replace (slice middle)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, "Hello world there") then save and reload 3. replaceSliceInNote(0, 6, 11, "EARTH") 4. click Save and confirm the dialog 5. reload the page and navigate back to the Notes tab 6. read the note value(0) returns "Hello EARTH there"
**Expected**: After reload, the substring from index 6 to index 11 inside row 0 has been replaced with the new word EARTH; surrounding text is unchanged.
**Data**: office=1604 | NOTE_REPLACE_BASE="Hello world there" | NOTE_REPLACE_SLICE={start:6, end:11, replacement:"EARTH"}
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-041: Edit clear-to-empty (row stays with empty value)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, "Base text") then save and reload 3. clear the note row(0) 4. click Save and confirm the dialog 5. reload the page and navigate back to the Notes tab 6. read the note value(0) returns the empty string
**Expected**: After reload, row 0 exists with an empty textarea value (consistent with TC-035 behavior; placeholder row in the FormArray, not "No Notes Available" empty-state).
**Data**: office=1604 | NOTE_APPEND_BASE="Base text"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-042: 2-row positive (smallest multi-row save+reload)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, "Row Alpha-2row") 3. click Add 4. fill the note row(1, "Row Beta-2row") 5. click Save and confirm the dialog 6. reload the page and navigate back to the Notes tab 7. read the note value(0) returns the first value AND read the note value(1) returns the second value
**Expected**: After reload, two rows persist with the original values in order.
**Data**: office=1604 | NOTE_2ROW_A="Row Alpha-2row" | NOTE_2ROW_B="Row Beta-2row"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-043: 5-row positive (smoke at moderate count)
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. For i in 0.4: click Add if i>0; fill the note row(i, NOTE_5ROW[i]) 3. click Save and confirm the dialog 4. reload the page and navigate back to the Notes tab 5. For i in 0.4: read the note value(i) returns NOTE_5ROW[i]
**Expected**: After reload, five rows persist with the original values in order.
**Data**: office=1604 | NOTE_5ROW=["r1","r2","r3","r4","r5"]
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-044: Mixed-content (row 0 = 1-char, row 1 = 4000-char) save+reload
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, "a") 3. click Add 4. paste into the note(1, "B".repeat(4000)) 5. click Save and confirm the dialog 6. reload the page and navigate back to the Notes tab 7. read the note value(0) returns "a" AND read the note value(1) returns the 4000-char string
**Expected**: After reload, the short row 0 and long row 1 each persist their own content; lengths confirmed independently.
**Data**: office=1604 | NOTE_MIXED_SHORT="a" | NOTE_MIXED_LONG="B".repeat(4000)
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-045: Edit row 1 of 2 — row 0 unchanged after save+reload
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, NOTE_2ROW_A); click Add; fill the note row(1, NOTE_2ROW_B); click Save and confirm the dialog; reload the page and navigate back to the Notes tab 3. append text to the note(1, " — edited"); click Save and confirm the dialog; reload the page and navigate back to the Notes tab 4. read the note value(0) returns NOTE_2ROW_A unchanged AND read the note value(1) ends with " — edited"
**Expected**: After the second save+reload, row 0 is byte-for-byte identical to the original; row 1 holds the edited content.
**Data**: office=1604 | NOTE_2ROW_A | NOTE_2ROW_B
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-046: Verify deleting the first of two note rows leaves the other
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, NOTE_2ROW_A); click Add; fill the note row(1, NOTE_2ROW_B); click Save and confirm the dialog; reload the page and navigate back to the Notes tab 3. clear the note row(0); delete the row(0) (BUG-LOC-NTS-001 workaround per LR-026) 4. click Save and confirm the dialog 5. reload the page and navigate back to the Notes tab 6. read the note value(0) returns NOTE_2ROW_B (originally row 1)
**Expected**: After reload, the sole remaining row holds the original row 1 content; row 0 from the initial state is gone.
**Data**: office=1604 | NOTE_2ROW_A | NOTE_2ROW_B
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-047: Verify deleting the last of three note rows leaves the first two
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, "r1"); click Add; fill the note row(1, "r2"); click Add; fill the note row(2, "r3"); click Save and confirm the dialog; reload the page and navigate back to the Notes tab 3. clear the note row(2); delete the row(2) 4. click Save and confirm the dialog 5. reload the page and navigate back to the Notes tab 6. read the note value(0)=="r1" AND read the note value(1)=="r2"; row 2 is absent or is the placeholder empty row per BUG-LOC-NTS-003
**Expected**: After reload, rows 0 and 1 persist unchanged; the third row is removed from the saved set (placeholder behavior per BUG-LOC-NTS-003 acknowledged via content assertion not count).
**Data**: office=1604 | three short strings
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-048: Verify a note persists after a cancel-then-resave flow
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, "Initial draft") 3. click Save; on the dialog click Cancel; verify form stays dirty and value still "Initial draft" 4. clear the note row(0); fill the note row(0, "Final saved") 5. click Save and confirm the dialog 6. reload the page and navigate back to the Notes tab 7. read the note value(0) returns "Final saved"
**Expected**: After reload, row 0 holds the final value only; the initial draft was never persisted.
**Data**: office=1604 | NOTE_CANCEL_RESAVE_INITIAL="Initial draft" | NOTE_CANCEL_RESAVE_FINAL="Final saved"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-049: Verify reloading during the save dialog does not persist the note
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, "Idempotent test") 3. click Save so the dialog appears 4. while the dialog is visible, navigate via page.reload 5. After reload, navigate to Notes tab 6. isDefaultEmptyState returns true and no error toast is visible
**Expected**: After reload mid-dialog, no draft data is persisted; the Notes tab is at the empty baseline; no application-level error appears.
**Data**: office=1604 | NOTE_IDEMPOTENT="Idempotent test"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-050: Verify pressing Escape on the save dialog cancels without saving
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, "Escape test") 3. click Save so the dialog appears 4. press the Escape key 5. dialog closes; row 0 still holds "Escape test"; Save button is still enabled (form remains dirty) 6. reload the page and navigate back to the Notes tab 7. isDefaultEmptyState returns true
**Expected**: Escape dismisses the dialog without saving; the form remains dirty in-memory; nothing is persisted after reload.
**Data**: office=1604 | NOTE_ESCAPE_DIALOG="Escape test"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-051: Verify the save dialog behavior when clicking outside it
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, "Escape test") 3. click Save so the dialog appears 4. click on the page background outside the dialog bounds 5. Observe: either the dialog stays open (modal blocks outside clicks) OR the dialog dismisses with no save. Record the observed behavior. 6. If still open: click Cancel; if dismissed: confirm row 0 still dirty 7. reload the page and navigate back to the Notes tab 8. isDefaultEmptyState returns true
**Expected**: The dialog's reaction to an outside click is documented; no draft data persists across reload regardless of branch.
**Data**: office=1604 | NOTE_ESCAPE_DIALOG="Escape test"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-052: Verify a second save attempt keeps the Save button disabled
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, "Idempotent test") 3. click Save and confirm the dialog 4. wait for Save to disable 5. attempt to click the Save button without changing anything 6. assert no dialog appears AND no save API call fires
**Expected**: A second save attempt on a form with no pending changes has no effect; the Save button remains disabled and no save request is sent.
**Data**: office=1604 | NOTE_IDEMPOTENT="Idempotent test"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-053: Sequential save persists most recent value
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | FCC | Yes |

**Depends_On**: none
**Spawned_From**: SUBPLAN_XLSX_PREP_01 backfill — spec at and CSV row at locations_notes_test_cases.csv:60 pre-existed without an MD entry from SP-NOTES-FCC-PILOT closure; backfilled here to satisfy Spec ⊂ MD ⊂ CSV parity. Splits responsibility with TC-LOC-MGH-025 (HIST 2-row distinctness assertion stays on the HIST spec side).
**Steps**: 1. ensure the table is empty 2. fill the note row(0, NOTE_SEQUENTIAL_HIST_A); click Save and confirm the dialog 3. reload the page and navigate back to the Notes tab 4. clear the note row(0); fill the note row(0, NOTE_SEQUENTIAL_HIST_B); click Save and confirm the dialog 5. reload the page and navigate back to the Notes tab 6. read the note value(0) returns NOTE_SEQUENTIAL_HIST_B
**Expected**: After two sequential saves of different values, row 0 holds the most recent value (B); the first value (A) is no longer present on the Notes form. HIST 2-row distinctness assertion is covered by TC-LOC-MGH-025 in the Location Management History spec .
**Data**: office=1604 | NOTE_SEQUENTIAL_HIST_A="HIST seq A" | NOTE_SEQUENTIAL_HIST_B="HIST seq B"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-054: Verify saving Notes does not leave the Currency tab unsaved
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, NOTE_1_CHAR) 3. click Save and confirm the dialog (Notes is pristine after save) 4. click the Currency sub-tab 5. on the Currency sub-tab, observe the Save button state and the unsaved-changes dialog state
**Expected**: After saving Notes, switching to Currency tab does NOT trigger any unsaved-changes dialog; Currency's Save button remains disabled (Currency itself is pristine).
**Data**: office=1604 | NOTE_1_CHAR
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-055: Verify saved note rows persist by content after reload
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, "Idempotent test") 3. click Save and confirm the dialog 4. reload the page and navigate back to the Notes tab 5. read the note value(0) returns "Idempotent test" (content-based assertion per LR-053; do not assert row count because BUG-LOC-NTS-003 auto-adds a placeholder empty row at index N)
**Expected**: After reload, the content of row 0 is verified; total row count is intentionally NOT asserted because the app auto-creates a trailing empty placeholder row.
**Data**: office=1604 | NOTE_IDEMPOTENT="Idempotent test"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-056: Verify deleting the only note row returns the empty state
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, NOTE_1_CHAR); click Save and confirm the dialog; reload the page and navigate back to the Notes tab 3. clear the note row(0); delete the row(0) 4. click Save and confirm the dialog 5. reload the page and navigate back to the Notes tab 6. isDefaultEmptyState returns true OR row 0 holds an empty value (placeholder per BUG-LOC-NTS-003)
**Expected**: After reload, the Notes section is at its empty representation (either the "No Notes Available" row or a single placeholder empty textarea).
**Data**: office=1604 | NOTE_1_CHAR
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-057: Tab character "a\\tb" persist
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, "a" + tab + "b") via paste into the note 3. click Save and confirm the dialog 4. reload the page and navigate back to the Notes tab 5. read the note value(0) returns the literal tab between a and b
**Expected**: After reload, row 0 holds a single tab character between a and b, not a space or two spaces.
**Data**: office=1604 | NOTE_TAB_CHAR="a\tb"
**Cleanup**: ensure the table is empty

---

## TC-LOC-NTS-058: Edit append
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | FCC | Yes |

**Depends_On**: none
**Steps**: 1. ensure the table is empty 2. fill the note row(0, "Base text") then click Save and confirm the dialog and reload the page and navigate back to the Notes tab to land an initial saved row 3. append text to the note(0, " — appended") 4. click Save and confirm the dialog 5. reload the page and navigate back to the Notes tab 6. read the note value(0) returns "Base text — appended"
**Expected**: After reload, row 0 holds the original text plus the appended suffix concatenated as one value.
**Data**: office=1604 | NOTE_APPEND_BASE="Base text" | NOTE_APPEND_SUFFIX=" — appended"
**Cleanup**: ensure the table is empty
