# Location Notes Test Cases
**Module**: locations | **Total**: 15 | **Status**: Manual | **Updated**: 2026-02-19

---

## FIELD INVENTORY & DISCOVERY

**Notes Tab** (6 elements):
| Element | Type | State | Value (1604) |
|---|---|---|---|
| Table | table | 3 columns: #, Location Notes, Actions | 1 default row |
| Note textbox | textarea | editable, placeholder "Type notes here..." | (empty) |
| Add button | button | always enabled, below table | "Add" |
| Delete button | button | visible only when 2+ rows, in Actions column | "Delete" |
| Character counter | display text | real-time update | "0/4000 (4000 left)" |
| Progress bar | progressbar | visual char usage, max=100 | empty |

**Behavioral Notes (Verified Live)**:
- Max 4000 characters shared across ALL notes (not per-note)
- Adding a second row adds a 1-character delimiter to the count
- Delete button appears on ALL rows when 2+ rows; disappears when only 1 row
- No validation errors — notes are entirely optional
- No dedicated Save — relies on left-panel **Save** button
- textarea name pattern: `notes.notes.{i}.note` (i=0,1,...)

---

## TC-LOC-NTS-001: Verify Notes tab default layout
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Navigate to Setup > Location > 1604 -- **Notes** tab ✓ Tab loads 2. Verify table with 3 column headers ✓ "#", "Location Notes", "Actions" 3. Verify 1 default row ✓ Row numbered "1" with empty textbox, Actions cell empty 4. Verify character counter ✓ "0/4000 (4000 left)" 5. Verify **Add** button visible below table ✓ Present and enabled 6. Verify progress bar visible ✓ Empty/minimal state 7. Verify no **Delete** button ✓ Actions column cell is empty
**Expected**: Table with headers, 1 empty row, counter at 0/4000, Add button present, no Delete button
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-NTS-002: Type text and verify character counter
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Notes** tab ✓ Default layout 2. Type "Test note for exploration" in the textbox ✓ Text appears 3. Verify character counter ✓ "25/4000 (3975 left)" 4. Verify **Save** button in left panel becomes enabled ✓ Save is now clickable
**Expected**: Counter updates in real time showing exact character count; Save button enables on change
**Data**: office=1604 | text="Test note for exploration" (25 chars)
**Cleanup**: Clear textbox text to restore baseline
**Automatable**: Yes

---

## TC-LOC-NTS-003: Add second note row via Add button
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Notes** tab ✓ Default 1 row 2. Type "First note" in row 1 textbox ✓ Counter: "10/4000 (3990 left)" 3. Click **Add** button ✓ New row appears 4. Verify row 2 added ✓ Numbered "2" with empty textbox, placeholder "Type notes here..." 5. Verify **Delete** buttons ✓ Delete button now visible in Actions column on both row 1 and row 2 6. Verify character counter ✓ "11/4000 (3989 left)" — 10 chars + 1 delimiter
**Expected**: New row added with correct numbering; Delete buttons appear on all rows; counter includes 1-char delimiter
**Data**: office=1604 | row1="First note" (10 chars)
**Cleanup**: Delete row 2, clear row 1
**Automatable**: Yes

---

## TC-LOC-NTS-004: Multi-row character counter includes delimiter
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Steps**: 1. Open **Notes** tab, type "Hello" in row 1 ✓ Counter: "5/4000 (3995 left)" 2. Click **Add** ✓ Row 2 added, counter: "6/4000 (3994 left)" — delimiter added 3. Type "World" in row 2 ✓ Counter: "11/4000 (3989 left)" — 5 + 1 + 5 4. Click **Add** ✓ Row 3 added, counter: "12/4000 (3988 left)" 5. Type "End" in row 3 ✓ Counter: "15/4000 (3985 left)" — 5 + 1 + 5 + 1 + 3
**Expected**: Each row-to-row boundary adds exactly 1 delimiter character to the total count
**Data**: office=1604 | row1="Hello" | row2="World" | row3="End" | expected_total=15
**Cleanup**: Delete rows 3 and 2, clear row 1
**Automatable**: Yes

---

## TC-LOC-NTS-005: Delete note row and verify counter decreases
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Notes** tab, type "First note" in row 1 ✓ Counter: "10/4000" 2. Click **Add**, type "Second note" in row 2 ✓ Counter: "22/4000" — 10 + 1 + 11 3. Click **Delete** on row 2 ✓ Row 2 removed 4. Verify counter ✓ "10/4000 (3990 left)" — delimiter also removed 5. Verify row 1 still present ✓ Text "First note" intact 6. Verify **Delete** button gone ✓ Actions cell empty with only 1 row remaining
**Expected**: Deleting a row decreases counter by row text length + delimiter; Delete disappears when 1 row left
**Data**: office=1604 | row1="First note" | row2="Second note"
**Cleanup**: Clear row 1
**Automatable**: Yes

---

## TC-LOC-NTS-006: Verify progress bar updates with character usage
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Steps**: 1. Open **Notes** tab ✓ Progress bar empty/minimal 2. Type a short text (10 chars) ✓ Progress bar barely changes 3. Type a medium text (500 chars) ✓ Progress bar shows noticeable fill 4. Observe bar is proportional to counter ✓ Bar width corresponds to chars used / 4000
**Expected**: Progress bar fills proportionally to character usage against 4000 limit
**Data**: office=1604 | short_text=10 chars | medium_text=500 chars
**Cleanup**: Clear textbox
**Automatable**: Yes

---

## TC-LOC-NTS-007: Verify 4000 character limit enforcement
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Notes** tab ✓ Counter: "0/4000" 2. Paste a string of exactly 4000 characters into row 1 ✓ Counter: "4000/4000 (0 left)" 3. Attempt to type one more character ✓ Verify behavior (character rejected or truncated) 4. Verify progress bar ✓ Fully filled
**Expected**: Character limit enforced at 4000; cannot exceed limit; progress bar full at capacity
**Data**: office=1604 | text=4000-char string
**Notes**: If limit is soft (allows typing but shows warning), document actual behavior
**Cleanup**: Clear textbox
**Automatable**: Yes

---

## TC-LOC-NTS-008: Save notes via left-panel Save
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Notes** tab, type "Saved note content" in row 1 ✓ Counter: "18/4000" 2. Click left-panel **Save** button ✓ Save Changes dialog appears 3. Verify dialog message ✓ "Are you sure you want to save the changes?" 4. Click **Save** in dialog ✓ Changes saved 5. Verify **Save** button becomes disabled ✓ No unsaved changes
**Expected**: Notes saved successfully via left-panel Save; confirmation dialog shown; Save button re-disables
**Data**: office=1604 | text="Saved note content"
**Cleanup**: Clear note text and save again to restore empty state
**Automatable**: Yes

---

## TC-LOC-NTS-009: Verify notes persist after page reload
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Notes** tab, type "Persistent note" in row 1 ✓ Text entered 2. Save via left-panel **Save** -- confirm dialog ✓ Saved 3. Reload the page (F5 or navigate away and back) ✓ Page reloads 4. Navigate to **Notes** tab ✓ Tab loads 5. Verify row 1 textbox ✓ Contains "Persistent note" 6. Verify counter ✓ "15/4000 (3985 left)"
**Expected**: Saved notes persist after page reload with correct counter
**Data**: office=1604 | text="Persistent note" (15 chars)
**Cleanup**: Clear note text and save to restore empty state
**Automatable**: Yes

---

## TC-LOC-NTS-010: Tab switch preserves unsaved notes
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Steps**: 1. Open **Notes** tab, type "Temporary text" ✓ Counter: "14/4000" 2. Click **Currency** tab ✓ Currency tab loads 3. Click **Notes** tab ✓ Notes tab loads again 4. Verify textbox ✓ Contains "Temporary text" 5. Verify counter ✓ Still "14/4000 (3986 left)"
**Expected**: Switching tabs within the same page preserves unsaved note content
**Data**: office=1604 | text="Temporary text"
**Cleanup**: Clear textbox and discard changes
**Automatable**: Yes

---

## TC-LOC-NTS-011: Unsaved changes prompt on navigation away
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Steps**: 1. Open **Notes** tab, type "Unsaved text" ✓ Save button enabled 2. Click **Back to Location Search** ✓ Observe behavior 3. Verify Save Changes confirmation dialog ✓ Dialog appears with "Are you sure you want to save the changes?" 4. Click **Cancel** in dialog ✓ Stays on current page, note text preserved
**Expected**: Navigating away with unsaved changes triggers Save Changes dialog; canceling keeps user on page
**Data**: office=1604 | text="Unsaved text"
**Cleanup**: Clear textbox, navigate away without saving
**Automatable**: Yes

---

## TC-LOC-NTS-012: Save empty note state
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | User-Requested |

**Steps**: 1. Open **Notes** tab ✓ Default empty state 2. Verify no text in default row ✓ Textbox empty, counter "0/4000" 3. Type "Temporary" then clear the textbox ✓ Counter returns to "0/4000" 4. Click left-panel **Save** ✓ Save Changes dialog 5. Confirm save ✓ Saved 6. Reload page and open **Notes** tab ✓ Empty state
**Expected**: Empty notes can be saved; empty state persists after reload
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-NTS-013: Special characters in notes
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | User-Requested |

**Steps**: 1. Open **Notes** tab ✓ Default layout 2. Type special characters: quotes ("test"), angle brackets (<div>), ampersand (&), unicode (é, ñ) ✓ Characters appear 3. Verify counter counts each character ✓ Counter matches expected length 4. Save via left-panel **Save**, confirm ✓ Saved 5. Reload and verify ✓ Special characters preserved exactly
**Expected**: Special characters (HTML entities, unicode, quotes) are accepted, counted, and persisted correctly
**Data**: office=1604 | text contains: " < > & é ñ
**Cleanup**: Clear note and save to restore empty state
**Automatable**: Yes

---

## TC-LOC-NTS-014: Add multiple rows (3+) and verify numbering
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Steps**: 1. Open **Notes** tab ✓ 1 default row 2. Click **Add** ✓ Row 2 appears 3. Click **Add** ✓ Row 3 appears 4. Verify sequential numbering ✓ Rows labeled "1", "2", "3" 5. Verify all 3 rows have **Delete** buttons ✓ All Actions columns show Delete 6. Verify all 3 textboxes have placeholder "Type notes here..." ✓ Consistent
**Expected**: Rows are sequentially numbered; all rows have Delete when 2+ exist
**Data**: office=1604
**Cleanup**: Delete rows 3 and 2
**Automatable**: Yes

---

## TC-LOC-NTS-015: Delete middle row and verify renumbering
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Steps**: 1. Open **Notes** tab ✓ Default state 2. Type "Row A" in row 1 ✓ Entered 3. Click **Add**, type "Row B" in row 2 ✓ Entered 4. Click **Add**, type "Row C" in row 3 ✓ Entered, counter includes "Row A" + "Row B" + "Row C" + 2 delimiters 5. Click **Delete** on row 2 (containing "Row B") ✓ Row removed 6. Verify remaining rows ✓ Row 1 = "Row A", Row 2 = "Row C" (renumbered from 3 to 2) 7. Verify counter ✓ Decreases by length of "Row B" + 1 delimiter
**Expected**: Remaining rows renumber sequentially; counter adjusts correctly; content preserved
**Data**: office=1604 | row1="Row A" | row2="Row B" | row3="Row C"
**Cleanup**: Delete row 2 ("Row C"), clear row 1 ("Row A")

**Automatable**: Yes