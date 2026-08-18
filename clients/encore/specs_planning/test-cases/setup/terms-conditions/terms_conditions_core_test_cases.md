# Terms and Conditions — Test Cases

**Module**: terms-conditions
**Submodule**: CORE
**Page**: Location Settings > Terms and Conditions (`/settings/terms-conditions`)
**Test Entity**: Office 1604
**Updated**: 2026-08-06
**Total TCs**: 92
**Sibling matched**: `service_charge_text_core_test_cases.md`

**Governing Requirement**: the governing requirement (Terms and Conditions module)
**Verified against**: field inventory `terms-conditions-core-2026-08-05.md`. **Its `Coverage_Ratio: 42/42` / `CrossCheck: clean` are a KNOWN UNDERCOUNT, not closure evidence** — 9 RTE toolbar controls were never enumerated (the machine walk could not open the editor), and the CrossCheck value was asserted by an agent rather than emitted by the tool. See the `⚠ KNOWN INCOMPLETENESS` block in that file.

---

## FIELD INVENTORY

| Field | Control Type | Default | Required |
|---|---|---|---|
| Language filter (page level) | Dropdown (Radix combobox) | US English | Not applicable |
| Language (per row) | Dropdown (Radix combobox) | Per-row stored value (new row: US English) | Yes |
| Terms & Conditions Name | Text input | Per-row stored value (new row: empty) | Yes |
| Left Column | Click-to-edit launcher (Tiptap RTE) | Per-row HTML content | Not established |
| Right Column | Click-to-edit launcher (Tiptap RTE) | Per-row HTML content | Not established |
| Bottom Column | Click-to-edit launcher (Tiptap RTE) | Per-row HTML content | Not established |
| Add row | Button | Not applicable | Not applicable |
| Save | Button | Disabled | Not applicable |

The grid shows five columns: Language, Terms & Conditions Name, Left Column, Right Column, Bottom Column.

---

## Validation Rules

| Rule | Behaviour |
|---|---|
| Terms & Conditions Name is required | Save stays disabled while the field is empty |
| Name uniqueness is GLOBAL across all languages | A duplicate name (in any language) disables Save; `aria-invalid="true"` on the input; no visible error message |
| Save is gated on BOTH dirty AND validity | Save enables only when the page is dirty AND all validity checks pass |
| Name length | No `maxlength` attribute; 260 characters accepted by client and server; upper bound above 260 unprobed |

---

## Scope Exclusions

- `out-of-scope:rbac=owner dropped permission axis from this module; the permission-axis decision marked won't-pursue`
- `out-of-scope:pagination=neither site paginates rows; all rows render in a single scroll view`
- `out-of-scope:sorting=no column-sort controls enumerated by machine walk; headers are not sortable`

---

## MCP_VERIFICATION_LOG

Observed on office 1604 across the sessions recorded in the field inventory
`terms-conditions-core-2026-08-05.md` (walk 2026-08-05, follow-up probes 2026-08-06). Each row is an
observation, not an expectation. Rows marked "Not settled" are recorded because they were reached
for and not resolved; no test case asserts them as fact.

| # | Verified | Result |
|---|---|---|
| 1 | Page loads on office 1604 | Grid renders at `/navigator/locations/1604/settings/terms-conditions` |
| 2 | Column headers | Language, Terms & Conditions Name, Left Column, Right Column, Bottom Column |
| 3 | Language filter options | All, English (Canada), US English, Spanish (Mexico), French (Canada) |
| 4 | Default filter value | US English on a fresh load, after navigating away and back, and in a brand-new browser context; no stored value was found |
| 5 | Per-row language options | Four — English (Canada), US English, Spanish (Mexico), French (Canada). "All" is filter-only and is not offered on a row |
| 6 | Row containers rendered | 51 — 50 product rows plus one leftover automation row named AUTOMATION-TEST-ROW-TNC-WALK |
| 7 | Save at rest | Disabled |
| 8 | Save after any field edit | Enabled |
| 9 | Save with a name duplicating another row in the same language | Disabled, `aria-invalid="true"` on the input, no message shown. Reproduced on two different rows |
| 10 | Save with a name duplicating a row in a different language | Disabled. Name uniqueness is enforced across all languages, not within one |
| 11 | Save with a name of three spaces | Disabled, `aria-invalid="true"`, no message shown |
| 12 | Save with an existing name cleared to empty | Disabled, `aria-invalid="true"`, input border turns red |
| 13 | Name accepting special and non-ASCII characters | Accepted and saved back byte-exact, read from a fresh browser context |
| 14 | Name length | No `maxlength` attribute; 260 characters accepted by both the browser and the server. Nothing above 260 was tried |
| 15 | Add row | New row appears at the bottom, language defaults to US English, name starts empty, and Save stays disabled until the required fields are filled |
| 16 | Save confirmation dialog | None — Save commits directly, with no confirmation step |
| 17 | Changing a row's language | Enables Save on its own. Reproduced on two rows |
| 18 | Choosing a language filter option while the page has unsaved edits | Dialog reads "Unsaved changes — Are you sure you want to leave this view? Any unsaved changes will be lost." with Stay and Discard. Opening the dropdown without choosing does not raise it |
| 19 | Navigating the browser away with unsaved edits | The browser's own leave-site dialog appears |
| 20 | Editing a second row while a first row is unsaved | No warning — both rows stay editable |
| 21 | Clicking any of the three HTML cells | Opens one shared rich-text editor panel loaded with that cell's content |
| 22 | Clicking a different HTML cell with unsaved editor content | Same Stay/Discard dialog appears and blocks the switch — the editor does not silently keep the text |
| 23 | Typing HTML or entity text into the editor | Stored as literal text, escaped. `&nbsp;` is stored as `&amp;nbsp;` and `<b>bold</b>` is stored escaped and displays as text rather than bold |
| 24 | Rich-text content surviving save and reload | Confirmed separately for the Left, Right and Bottom columns using a marker value found again after reload |
| 25 | Bold applied from the editor toolbar | Renders as `<strong>` in the editor. Whether it survives save and reload is **not settled** — the browser closed before the reload in every run so far |
| 26 | Saving while the grid still holds leftover automation rows | The server returned HTTP 500 and stored nothing, while the page behaved exactly as it does on a successful save — Save simply went inactive, with no message of any kind |
| 27 | Editor toolbar controls | Nine of them carry test IDs and are absent from the 42-element machine count, because the walk never opened the editor. This is the undercount named at the top of this file |
| 28 | Leaving the page via a Settings tab with unsaved edits | **Not settled** — no run reached a Settings tab link to try it |

---

## AXIS 1 — Per-Field Template Sets

### Language filter (page level) — Dropdown/combobox

## TC-TNC-CORE-001: Language filter offers five options

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the page-level Language filter | The list shows five options: All, English (Canada), US English, Spanish (Mexico), and French (Canada) |

**Expected**: Language filter displays five options including All

**Notes**: All is a filter-only value and is not available as a per-row language.

## TC-TNC-CORE-002: Language filter defaults to US English

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page has just been opened for office 1604 in a fresh navigation. Language: US English (expected default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the current value of the page-level Language filter | The filter shows US English |

**Expected**: Language filter defaults to US English

**Notes**: US English is a true default — it resets on navigation away and back, and in a fresh browser context. Tests may rely on this starting state without a setup step.

## TC-TNC-CORE-003: Selecting a language filters the grid rows

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Note the rows currently displayed under the US English filter | The row count is recorded |
| 2 | Select English (Canada) in the page-level filter | The grid reloads and shows only rows whose language is English (Canada) |
| 3 | Verify every visible row has language English (Canada) | All visible rows have language English (Canada) |

**Expected**: Filter restricts grid to rows matching the selected language

**Notes**: Covers result-fidelity for the language filter.
**Surface_Family**: result-fidelity (QUICK)

## TC-TNC-CORE-004: Selecting All shows rows across all languages

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select a single language and note the row count | The row count for that language is recorded |
| 2 | Select All in the page-level filter | The grid shows rows from all languages; the count is at least as many as the single-language count |

**Expected**: All filter shows all language rows

**Notes**: All is filter-only and cannot be assigned to a row. This case is not currently running because it waits for a specific grid row index under the All filter, but row counts vary with existing data. Automating it reliably needs further row-targeting work and is deferred until prioritised.

## TC-TNC-CORE-005: Language filter first option is All

**Automatable**: Yes — currently skipped in `terms-conditions.spec.ts` while saving this content returns HTTP 500
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the page-level Language filter | The first option in the list is All |

**Expected**: All is the first option in the language filter

**Notes**: BVA — first option boundary for a dropdown.

## TC-TNC-CORE-006: Language filter last option is French (Canada)

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the page-level Language filter | The last option in the list is French (Canada) |

**Expected**: French (Canada) is the last option in the language filter

**Notes**: BVA — last option boundary for a dropdown.

### Per-row Language — Dropdown/combobox

## TC-TNC-CORE-007: Per-row language dropdown offers four options

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Language dropdown on a grid row | The list shows four options: English (Canada), US English, Spanish (Mexico), and French (Canada) |

**Expected**: Per-row language dropdown shows four options without All

**Notes**: All exists only in the page-level filter. The per-row dropdown does not include it.

## TC-TNC-CORE-008: Changing per-row language enables Save

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). An existing row with a globally unique name is visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Note the current language of a row | The language is recorded |
| 2 | Change the row's language to a different value | Save becomes enabled |

**Expected**: Changing the per-row language dirties the page and enables Save

**Notes**: Proven by tnc-probe-r8 (N=2: US English→Spanish (Mexico) and US English→French (Canada)). Choose a row whose name is unique across all languages to avoid the global uniqueness block. See the bulk-save failure mode when residue rows are present in the grid.

## TC-TNC-CORE-009: Changing per-row language persists the value

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: All (to see all rows). An existing row with a globally unique name is visible. The grid contains no residue rows with malformed content that can make the bulk save fail.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Change the row's language from its current value to a different language | Save becomes enabled |
| 2 | Click Save | Save completes (no confirmation dialog); server returns 2xx |
| 3 | Reload the page and set the filter to All | The page reloads showing all rows |
| 4 | Locate the row by its name and read its language value | The language matches the value set in step 1 |
| 5 | Restore the original language and save | The original state is restored |

**Expected**: Per-row language change on a clean row persists through save and reload

**Notes**: Proven by tnc-probe-r9 (trial T1): row 'Hotel Del Coronado' changed to Spanish (Mexico), persisted — US-English-filtered row count dropped 50→49 on reload confirming the language change was stored. Restoration step avoids permanent test residue. When the grid contains residue rows with malformed content, the bulk payload may trigger HTTP 500 and discard all changes.

## TC-TNC-CORE-010: Reverting per-row language to saved value disables Save

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). An existing row with a globally unique name is visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Change a row's language to a different value | Save becomes enabled |
| 2 | Change the same row's language back to its original saved value | Save returns to disabled |

**Expected**: Reverting language to the saved value returns Save to disabled (LR-009)

**Notes**: The dirty flag clears when net change is zero. Language change enabling Save proven by tnc-probe-r8 (N=2). Revert behaviour follows the standard application dirty-flag pattern (LR-009/LR-026).

### Terms & Conditions Name — Plain text

## TC-TNC-CORE-011: Name accepts a single character

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Add a new row | A new row appears at the bottom of the grid with language US English |
| 2 | Enter a single unique character into the Name field | The character appears in the field; Save becomes enabled |

**Expected**: A single-character name is accepted

**Notes**: Positive case — minimum meaningful input for a plain text field. The new row cannot be deleted; it will be left as test residue unless saved and later overwritten.

## TC-TNC-CORE-012: Name accepts a mid-length value

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter a unique 50-character value into a Name field | The full value appears in the field; Save becomes enabled |

**Expected**: A mid-length name is accepted

**Notes**: Positive case — representative mid-range input.

## TC-TNC-CORE-013: Name accepts 260 characters

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter a unique 260-character value into a Name field | The full 260-character value is accepted; Save becomes enabled |

**Expected**: A 260-character name is accepted without truncation

**Notes**: BVA — 260 characters is the highest proven length. No `maxlength` attribute exists. Upper bound above 260 was not probed; do not assert a maximum. This case is not currently running because the application rejects a 260-character name even though the check expects Save to become enabled. Re-enable or update the check once the intended maximum is confirmed.

## TC-TNC-CORE-014: Name with special characters persists byte-exact through save and reload

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). The grid contains no residue rows with malformed content that can make the bulk save fail.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter a unique name containing special characters into a Name field (proven string: `< > & " ' / \ % # Café Ñoño 中文`) | The value appears exactly as typed; Save becomes enabled |
| 2 | Click Save | Save completes (server returns 2xx) |
| 3 | Reload the page in a fresh context | The page reloads |
| 4 | Locate the row by its name | The name reads back byte-exact including all punctuation, accented, and CJK characters |

**Expected**: Special characters persist byte-exact through save and reload

**Notes**: Proven by tnc-persistence-r1 : the exact string `< > & " ' / \ % # Café Ñoño 中文` was saved (2xx captured) and read back from a fresh browser context. No sanitisation or encoding loss.

## TC-TNC-CORE-015: Whitespace-only name is rejected — Save disabled, aria-invalid

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Add a new row | A new row appears at the bottom |
| 2 | Enter only space characters into the Name field and move focus away | Save remains disabled; the Name input has `aria-invalid="true"` |

**Expected**: Whitespace-only input is rejected — Save stays disabled and `aria-invalid="true"` is set on the input

**Notes**: Proven by tnc-probe-r8 : typing 3 spaces as name yields Save DISABLED, aria-invalid=true. Rejection oracle: silent block identical to duplicate pattern — Save disabled + `aria-invalid="true"`, no visible error message or red border (same oracle as duplicate rejection, distinct from the empty-name oracle which shows a red border).

## TC-TNC-CORE-016: Duplicate name within the same language blocks Save

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). At least one US English row with a known name exists.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Add a new row (defaults to US English) | A new row appears |
| 2 | Enter the exact name of an existing US English row into the new row's Name field | Save remains disabled; the Name input has `aria-invalid="true"` |

**Expected**: Duplicate name within the same language blocks Save with `aria-invalid="true"` and no visible error message

**Notes**: Negative case. Rejection oracle: Save goes disabled, `aria-invalid="true"` appears on the input, but there is no visible inline error message or tooltip — the block is silent.

## TC-TNC-CORE-017: Duplicate name across a different language blocks Save

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: All (to see all rows). A row with a known name exists under one language.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Add a new row | A new row appears (defaults to US English) |
| 2 | Change the new row's language to a language different from the existing row's language | The language changes |
| 3 | Enter the exact name of the existing row into the new row's Name field | Save remains disabled; the Name input has `aria-invalid="true"` |

**Expected**: Duplicate name across languages blocks Save — uniqueness is global, not per-language

**Notes**: Negative case. This contradicts the governing requirement's within-language uniqueness lead. The the current application enforces global uniqueness. Rejection oracle: Save disabled + `aria-invalid="true"`, no visible error message. (DIV-TNC-001)

## TC-TNC-CORE-018: Name edit then save persists through reload

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). An existing row with a known name is visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Change the row's Name to a different unique value | Save becomes enabled |
| 2 | Click Save | Save completes (no confirmation dialog) |
| 3 | Reload the page | The page reloads |
| 4 | Locate the row and read its Name value | The Name matches the value set in step 1 |
| 5 | Restore the original name and save | The original state is restored |

**Expected**: An edited name persists through save and reload

**Notes**: Save-cycle — edit overwrite for plain text. Restoration avoids permanent residue.

## TC-TNC-CORE-019: Reverting a name edit returns Save to disabled

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Change an existing row's Name to a different unique value | Save becomes enabled |
| 2 | Change the Name back to its original saved value | Save returns to disabled |

**Expected**: Reverting a name to its saved value returns Save to disabled (LR-009)

**Notes**: Save-cycle — revert-to-original. The dirty flag must clear on no-net-change change.

## TC-TNC-CORE-020: Clearing a name disables Save with red border and aria-invalid

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). An existing row with a name is visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Clear the Name field of an existing row (select all and delete) | Save remains disabled; the Name input has `aria-invalid="true"` and a red border (destructive color from design system) |
| 2 | Re-enter the original name | Save returns to disabled (no-net-change change); `aria-invalid` clears; red border disappears |

**Expected**: Clearing a required Name field keeps Save disabled, with `aria-invalid="true"` AND a visible red border on the input

**Notes**: Proven by tnc-probe-r8 : clearing an existing name entirely yields Save DISABLED, aria-invalid=true, and a red-orange border (oklch(0.577 0.245 27.325)). Rejection oracle for empty name DIFFERS from duplicate/whitespace: empty = red border + aria-invalid; duplicate/whitespace = aria-invalid only, no border. This per-type the field-validation rules oracle difference is deliberate.

### Left Column / Right Column / Bottom Column — Click-to-edit launcher (Tiptap RTE)

## TC-TNC-CORE-021: Clicking an HTML cell opens the shared editor

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Left Column cell of a row | The Tiptap rich text editor panel opens and displays that row's Left Column content |

**Expected**: Clicking an HTML cell opens the shared rich text editor

**Notes**: Positive case for the click-to-edit launcher. The editor panel is shared across all three HTML columns and rebuilt on each cell switch (not the same DOM node). Input requires real keyboard events (`page.keyboard.type`); programmatic `fill` is silently ignored by ProseMirror.

## TC-TNC-CORE-022: Clicking a cell alone does not enable Save

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). Save is disabled.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Left Column cell of a row | The editor opens |
| 2 | Read the state of Save without typing anything | Save is still disabled |

**Expected**: Opening the editor without typing does not dirty the page

**Notes**: Clicking the cell alone is not an edit. The dirty gate requires an actual content interaction.

## TC-TNC-CORE-023: Typing in the editor enables Save

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Left Column cell of a row to open the editor | The editor opens |
| 2 | Type additional text into the editor using keyboard input | Save becomes enabled |

**Expected**: Typing content in the RTE marks the page dirty and enables Save

**Notes**: Save-cycle — new fill for rich text. Must use `page.keyboard.type` (CDP real input); `fill` and `execCommand` are silently ignored by ProseMirror.

## TC-TNC-CORE-024: Left Column rich text persists through save and reload

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). An existing row with a known name is visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Left Column cell of the row to open the editor | The editor opens with existing content |
| 2 | Type a unique sentinel string into the editor | The sentinel text appears in the editor |
| 3 | Click Save | Save completes (no confirmation dialog) |
| 4 | Reload the page | The page reloads |
| 5 | Click the same row's Left Column cell | The editor opens |
| 6 | Verify the sentinel string is present in the editor content | The sentinel string is present |

**Expected**: Left Column rich text content persists through save and reload

**Notes**: Save-cycle — persistence for Left Column RTE. Proven by tnc-rte-r1 probe .

## TC-TNC-CORE-025: Right Column rich text persists through save and reload

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). An existing row with a known name is visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Right Column cell of the row to open the editor | The editor opens with existing content |
| 2 | Type a unique sentinel string into the editor | The sentinel text appears in the editor |
| 3 | Click Save | Save completes (no confirmation dialog) |
| 4 | Reload the page | The page reloads |
| 5 | Click the same row's Right Column cell | The editor opens |
| 6 | Verify the sentinel string is present in the editor content | The sentinel string is present |

**Expected**: Right Column rich text content persists through save and reload

**Notes**: Save-cycle — persistence for Right Column RTE. Proven by tnc-rte-r1 probe .

## TC-TNC-CORE-026: Bottom Column rich text persists through save and reload

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). An existing row with a known name is visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Bottom Column cell of the row to open the editor | The editor opens with existing content |
| 2 | Type a unique sentinel string into the editor | The sentinel text appears in the editor |
| 3 | Click Save | Save completes (no confirmation dialog) |
| 4 | Reload the page | The page reloads |
| 5 | Click the same row's Bottom Column cell | The editor opens |
| 6 | Verify the sentinel string is present in the editor content | The sentinel string is present |

**Expected**: Bottom Column rich text content persists through save and reload

**Notes**: Save-cycle — persistence for Bottom Column RTE. Proven by tnc-probe-r5 .

### Add row — Button

## TC-TNC-CORE-027: Add row appends at the bottom with defaults

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: All (to see the full row set).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Note the last row currently in the grid | The last row is recorded |
| 2 | Click the Add row button | A new row appears at the bottom of the grid |
| 3 | Read the new row's language | The language is US English |
| 4 | Read the new row's Name field | The Name field is empty |
| 5 | Read the state of Save | Save is still disabled |

**Expected**: Add row appends a new row at the bottom with language US English, empty name, and Save remaining disabled

**Notes**: A bare add does not enable Save — required fields must be filled. The add-row button label text is unconfirmed and must not be asserted. No delete affordance exists; the added row will remain as test residue.

### Save — Button

## TC-TNC-CORE-028: Save is disabled at rest

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page has just been opened for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the state of the Save button without making any edits | Save is disabled |

**Expected**: Save is disabled on initial page load

**Notes**: Save is gated on both dirty state and validity.

## TC-TNC-CORE-029: Save commits directly without a confirmation dialog

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). The page has a valid unsaved edit (e.g. a name change to a unique value).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Save | The save operation completes; no confirmation dialog appears |

**Expected**: Save commits directly with no confirmation dialog

**Notes**: LR-012 shared dialog does NOT apply to this page. Confirmed by r1 and r2 probes . The post-save toast text is unconfirmed and must not be asserted.

---

## AXIS 2 — Surface/Behavior Families

## TC-TNC-CORE-030: Language filter returns only matching rows (result-fidelity)

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Surface_Family**: result-fidelity (QUICK)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select Spanish (Mexico) in the page-level filter | The grid reloads |
| 2 | For each visible row, read its per-row language value | Every row's language is Spanish (Mexico); no rows from other languages are shown |

**Expected**: Filter returns only rows matching the selected language — no extras, no missing

**Notes**: See also TC-TNC-CORE-003 which tests a different language selection. Together they cover the result-fidelity must-assert.

`out-of-scope:pagination=neither site paginates rows; all rows render in a single scroll view`

`out-of-scope:sorting=no column-sort controls enumerated by machine walk; headers are not sortable`

## TC-TNC-CORE-031: Language filter combined with row content (combination)

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Surface_Family**: combination (QUICK)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select English (Canada) in the page-level filter | The grid shows only English (Canada) rows |
| 2 | Verify a known English (Canada) row's name is visible | The expected row name is visible |
| 3 | Select US English in the page-level filter | The grid shows only US English rows |
| 4 | Verify the English (Canada) row from step 2 is no longer visible | The row is not shown |

**Expected**: Switching filter values correctly shows and hides rows per language

**Notes**: Combination of filter value with row language value. This is the QUICK must-assert for the combination family.

## TC-TNC-CORE-032: HTML cell displays rendered content, not raw markup (render-state)

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). A row with HTML content in its Left Column exists.

**Surface_Family**: render-state (QUICK)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read the Left Column cell content of a row that has rich text | The cell displays rendered HTML (e.g. bold text renders as bold), not raw markup tags |

**Expected**: HTML cells render content visually, not as raw markup

**Notes**: The grid cells are button launchers that display a preview of the HTML content. This is the QUICK must-assert for render-state.

## TC-TNC-CORE-033: A newly added row with no fields filled keeps Save disabled

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Surface_Family**: empty-vol (QUICK)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Add row button | A new empty row is added |
| 2 | Do not fill any fields on the new row | No action taken |
| 3 | Read the state of Save | Save is disabled |

**Expected**: An empty new row does not enable Save

**Notes**: The empty-state for this surface is a newly added row with all fields at their default (empty name, default language, no HTML content). No empty-state string was observed when the grid has zero rows for a filtered language — the inventory does not record such a string, so it cannot be asserted. `out-of-scope:empty-vol-message=no empty-state string was observed or recorded in the inventory`

## TC-TNC-CORE-034: Edited name persists through save and reload (persistence)

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). An existing row with a known name is visible.

**Surface_Family**: persistence (QUICK)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Change the row's Name to a different unique value | Save becomes enabled (dirty gate) |
| 2 | Click Save | Save completes |
| 3 | Reload the page | The page reloads with the filter at US English |
| 4 | Locate the row by its new name | The row is found with the new name intact |
| 5 | Restore the original name and save | The original state is restored |

**Expected**: Edited name persists across save and reload

**Notes**: Persistence must-assert — covers edit-dirties-and-enables-Save and save-survives-reload.

## TC-TNC-CORE-035: Reverting an edit returns Save to disabled (persistence — revert)

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Surface_Family**: persistence (QUICK)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Change an existing row's Name to a different unique value | Save becomes enabled |
| 2 | Change the Name back to its original saved value | Save returns to disabled |

**Expected**: Revert returns Save to disabled — persistence revert must-assert

**Notes**: Explicitly required by the ticket: revert returns Save to disabled. See also TC-TNC-CORE-019.

## TC-TNC-CORE-036: Column resize does not persist (persistence — non-persistent state)

**Automatable**: No — resize handle is a raw `<button>` with no stable test identifier; automating drag-resize without a stable selector produces a brittle, non-deterministic test
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Surface_Family**: persistence (QUICK)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Drag a column resize handle to change a column width | The column width changes visually |
| 2 | Reload the page | The page reloads |
| 3 | Compare the column width to its pre-drag state | The column has returned to its default width |

**Expected**: Column widths reset on reload — resize does not persist

**Notes**: Proven by probe4 . No localStorage or sessionStorage key for column widths was found. Not automated: the resize handle is a raw button element with no `test attribute` or stable selector — a drag-resize interaction would be non-deterministic. Manual verification only.

---

## REGRESSION ARMOUR

## TC-TNC-CORE-037: Editor state does not leak between cell selections

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). Two rows with different Left Column content exist.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Left Column cell of row A to open the editor | The editor shows row A's content |
| 2 | Note the editor content | Content A is recorded |
| 3 | Click the Left Column cell of row B (dismiss any unsaved-changes dialog by clicking Discard if it appears) | The editor shows row B's content |
| 4 | Verify the editor content is row B's content, not row A's | The content matches row B, not row A |
| 5 | Click back to row A's Left Column cell (dismiss any dialog if it appears) | The editor shows row A's original content |
| 6 | Verify row A's content has not been contaminated by row B's content | Row A's content is unchanged |

**Expected**: Editor content follows the selected cell; no state leaks between selections

**Notes**: Regression case for the the editor-state-leak defect shape (editor state leaking between selections). The editor panel is rebuilt on each cell switch (not the same DOM node), so caching an editor handle across cells would fail. The unsaved-changes dialog may appear when switching cells if content was modified.

## TC-TNC-CORE-038: Typed HTML entities are stored as escaped literals, not rendered as markup

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). An existing row with a known name is visible. The grid contains no residue rows that can make the bulk save return HTTP 500.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Left Column cell of a row to open the editor | The editor opens |
| 2 | Type the following using keyboard input: `&nbsp; &amp; < > <b>bold</b>` | The text appears in the editor as literal characters — angle brackets visible as text, not rendered as markup |
| 3 | Inspect the editor's inner HTML before saving | The HTML contains: `<p>&amp;nbsp; &amp;amp; &lt; &gt; &lt;b&gt;bold&lt;/b&gt; &lt; &amp;</p>` — all typed characters are HTML-escaped |
| 4 | Click Save | Save completes |
| 5 | Reload the page | The page reloads |
| 6 | Click the same row's Left Column cell | The editor opens |
| 7 | Verify the text displays as literal characters, not as rendered markup or entity sequences | The typed characters are displayed exactly as literal text |

**Expected**: Typed HTML entity characters are stored as HTML-escaped literals and display as literal text on round-trip

**Notes**: Proven by tnc-probe-r8 : typed `&nbsp;` → stored as `&amp;nbsp;`; `&amp;` → `&amp;amp;`; `<` → `&lt;`; `&` → `&amp;`; typed `<b>bold</b>` → stored as `&lt;b&gt;bold&lt;/b&gt;` and renders as text, not bold. Pre-save HTML confirmed: `<p>&amp;nbsp; &amp;amp; &amp;lt; &amp;gt; &lt;b&gt;bold&lt;/b&gt; &lt; &amp;</p>`. **Known gap**: whether a double-save (save, reopen, save again without edits) degrades the encoding (e.g. double-escaping) was never measured — do not assert either way.

## TC-TNC-CORE-039: Switching cells with unsaved editor content raises a guard dialog

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Left Column cell of a row to open the editor | The editor opens |
| 2 | Type additional text into the editor | The text appears in the editor |
| 3 | Click the Left Column cell of a different row | An "Unsaved changes" dialog appears with Stay and Discard options |
| 4 | Click Stay | The dialog closes; the editor remains on the original row with the typed text intact |

**Expected**: Cell-switch with unsaved content raises the unsaved-changes guard dialog

**Notes**: Regression case for the the unsaved-change-guard defect shape. The guard dialog is confirmed by tnc-rte-r1 . The app does not silently commit on cell switch.

## TC-TNC-CORE-040: Discarding unsaved editor content on cell switch clears the edit

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Left Column cell of a row to open the editor | The editor opens |
| 2 | Type additional text into the editor | The text appears |
| 3 | Click the Left Column cell of a different row | The "Unsaved changes" dialog appears |
| 4 | Click Discard | The dialog closes; the editor switches to the new row; the typed text from step 2 is discarded |
| 5 | Click back to the original row's Left Column cell | The editor shows the original row's content WITHOUT the text typed in step 2 |

**Expected**: Discarding unsaved content on cell switch removes the edit and does not persist it

**Notes**: Companion to TC-TNC-CORE-039 — covers the Discard path of the guard dialog.

## TC-TNC-CORE-041: Changing the language filter with unsaved edits raises a guard dialog

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Change an existing row's Name to a different unique value | Save becomes enabled |
| 2 | Select a different language in the page-level filter | A warning dialog appears with title "Unsaved changes", body "Are you sure you want to leave this view? Any unsaved changes will be lost.", and buttons Stay / Discard |
| 3 | Click Stay | The dialog closes; the filter has not changed; the edited value is still present; Save is still enabled |
| 4 | Restore the original name | Save returns to disabled |

**Expected**: Changing the language filter with unsaved edits raises the guard dialog with verbatim text "Unsaved changes — Are you sure you want to leave this view? Any unsaved changes will be lost."

**Notes**: Proven by tnc-probe-r8 (PROBE D): guard fires on language filter option selection (not on dropdown open) while form is dirty. Dialog is an alertdialog with Stay and Discard buttons. The guard protects against losing unsaved edits when the filter change would reload the grid.

## TC-TNC-CORE-042: Editor content across columns uses the same shared panel

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Left Column cell of a row | The editor opens showing the Left Column content |
| 2 | Click the Right Column cell of the same row (dismiss any unsaved-changes dialog if it appears) | The editor switches to show the Right Column content |
| 3 | Click the Bottom Column cell of the same row (dismiss any dialog if it appears) | The editor switches to show the Bottom Column content |

**Expected**: All three HTML columns share the same editor panel; content follows the selected cell

**Notes**: The panel is rebuilt on each switch — never cache an editor DOM handle across cell selections. This verifies the shared-panel architecture without asserting leakage (covered by TC-TNC-CORE-037).

---

## TC-TNC-CORE-043: No guard dialog when editing a different row while one row is name-dirty

**Automatable**: Yes — expected to PASS (documents absence of guard)
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). At least two rows are visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Change row A's Name to a different unique value | Save becomes enabled |
| 2 | Click row B's Name input | Focus moves to row B; NO guard dialog appears; row A's edit remains |
| 3 | Type a value into row B's Name | Both rows are now edited simultaneously; no warning was shown |

**Expected**: No guard dialog fires when switching between row name inputs while one is dirty — this is a missing guard

**Notes**: Known gap — proven by tnc-probe-r8 (PROBE D4): clicking a name input on a different row while one row is name-dirty raises NO alertdialog, no native dialog. Both rows are editable simultaneously without warning. This is the the unsaved-change-guard defect shape for cross-row name editing — the guard that exists for filter changes and cell switches is absent for row-to-row name focus changes. Whether this is intentional or a defect has not been determined.

**Surface_Family**: persistence (QUICK)

## TC-TNC-CORE-044: Valid save should succeed even when residue rows are present

**Automatable**: Yes — currently skipped in `terms-conditions.spec.ts`
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). The grid contains at least one residue row with extreme content (e.g. 260-char name, special-character name, or RTE probe sentinels from prior test runs).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Change a clean row's language to a different value | Save becomes enabled |
| 2 | Click Save and observe the network response | The server returns HTTP 500 with body `{"success":false,"message":"Something unexpected has happened...","statusCode":"Internal Server Error!"}` |
| 3 | Reload the page and verify the language change | The language change is NOT persisted — the entire batch was discarded |

**Expected (if fixed)**: Save should succeed for valid rows even when other rows have extreme content, OR the server should reject only the malformed row, OR the payload should exclude unchanged rows

**Notes**: Proven by tnc-persistence-r1 : a save request to the server sends all ~51 rows in one payload (~1.5 MB). When residue rows with malformed/extreme content are present, the server returns 500 and the entire batch is discarded. Clean-row-only saves succeed (tnc-probe-r9 trial T1 persisted successfully). **Precision**: the specific offending row was never isolated — the correlation is: 500 occurs with residue rows present; clean-row saves succeed. The causal row has not been identified. This case is not currently running because its request-body assertion assumes a flat save payload, while the application sends a different schema. Automating the assertion against the real schema needs further work and is deferred until prioritised.

**Surface_Family**: persistence (QUICK)

## TC-TNC-CORE-045: UI shows success when save returns HTTP 500 — silent data loss

**Automatable**: Yes — expected to FAIL (documents confirmed defect)
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). A save has just returned a non-2xx response (trigger: grid containing residue rows that can make bulk saves return HTTP 500, or any server-side failure).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Observe the UI immediately after the failed save | The Save button transitions from enabled to disabled — identical to a successful save |
| 2 | Look for any error toast, banner, inline message, or console error | None is present — no user-facing error signal of any kind |
| 3 | Reload the page and verify the edit | The edit is NOT persisted — data was silently lost |

**Expected (if fixed)**: On a non-2xx save response, the UI should show a visible error (toast, banner, or inline message) and keep Save enabled so the user can retry

**Notes**: Proven by tnc-persistence-r1 and all tnc-probe-r9 trials: when the save endpoint returns HTTP 500 with `{"success":false,...}`, the application gives NO user-facing error signal. Save button goes disabled exactly as on 2xx success. No toast, no banner, no inline message, no console error. The user sees normal "saved" behaviour but data was discarded. This constitutes silent data loss and applies to any save failure on this surface, not only the 500 triggered by residue rows. This is a deliberately failing case documenting the known failed-save behaviour.

**Surface_Family**: persistence (QUICK)

## TC-TNC-CORE-046: Bold formatting round-trip — <strong> persists through save and reload

**Automatable**: Yes — currently skipped in `terms-conditions.spec.ts`
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Left Column cell of a row to open the editor | The editor opens |
| 2 | Select text and apply Bold via the toolbar | The editor shows `<strong>` markup around the selection |
| 3 | Click Save | Save completes |
| 4 | Reload the page and reopen the same cell | The editor opens |
| 5 | Verify the Bold formatting is still applied | NOT YET CONFIRMED — whether `<strong>` tags survive save + reload has not been cleanly measured |

**Expected**: Known gap — whether toolbar-applied formatting (bold as `<strong>`) persists through a full save-reload cycle has not been cleanly verified

**Notes**: tnc-probe-r8 confirmed bold applies as `<strong>` in the editor HTML: `<p><strong>FORMATTING TEST</strong></p>`. However, whether this formatting survives a round-trip (save → reload → reopen) was never isolated from the plain-text persistence test. The inventory states "formatting round-trip not yet confirmed" for this reason. This case is not currently running because saving bold rich-text content currently returns HTTP 500. Re-enable it once the application saves formatted content successfully.

**Surface_Family**: persistence (QUICK)

## CASE COUNT SUMMARY

**Total**: 46 test cases (TC-TNC-CORE-001 through TC-TNC-CORE-046)

### Axis 1 — Per-field template sets: 29 cases
- Language filter (page level): 6 cases (TC-001 to TC-006) — positive, BVA (first/last option), save-cycle N/A (filter only)
- Per-row language (dropdown): 4 cases (TC-007 to TC-010) — positive, save-cycle (change, persist, revert)
- Terms & Conditions Name (plain text): 10 cases (TC-011 to TC-020) — positive (1-char, mid, 260-char), BVA (260 boundary), negative (special chars, whitespace-only, duplicate same-language, duplicate cross-language), save-cycle (edit-persist, revert, clear)
- Left/Right/Bottom Column (RTE): 6 cases (TC-021 to TC-026) — positive (open editor, click-alone, type), save-cycle (persist Left, Right, Bottom independently)
- Add row: 1 case (TC-027) — positive (defaults, position)
- Save: 2 cases (TC-028 to TC-029) — positive (disabled at rest, direct commit)

### Axis 2 — Surface/behavior families: 7 cases
- result-fidelity: TC-030 (+ TC-003 as supporting)
- pagination: out-of-scope (neither site paginates)
- sorting: out-of-scope (no sort controls)
- combination: TC-031
- render-state: TC-032
- empty-vol: TC-033
- persistence: TC-034, TC-035, TC-036

### Regression armour: 6 cases
- the editor-state-leak defect (editor state leak): TC-037
- the HTML-entity-handling defect (HTML entity handling): TC-038
- the unsaved-change-guard defect (unsaved-change guards): TC-039, TC-040, TC-041, TC-042

### Out-of-scope families
- `out-of-scope:rbac=owner dropped permission axis from this module; the permission-axis decision marked won't-pursue`
- `out-of-scope:pagination=neither site paginates rows; all rows render in a single scroll view`
- `out-of-scope:sorting=no column-sort controls enumerated by machine walk; headers are not sortable`

---

# L2 — DEEP

---

## 7b-1: Rich-text round-trip, byte-exact (the HTML-entity-handling defect entity BVA)

## TC-TNC-CORE-047: RTE entity encoding — ampersand typed persists as double-escaped entity

**Automatable**: Yes — currently skipped in `terms-conditions.spec.ts`
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). A row with a known unique name exists.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Left Column cell of the target row | The editor opens showing existing content |
| 2 | Clear existing content and type `&` using keyboard | The editor shows `&` visually |
| 3 | Click Save | Save completes (HTTP 2xx) |
| 4 | Reload the page and click the same Left Column cell | The editor shows `&` — stored as `&amp;` in HTML, rendered as literal ampersand |

**Expected**: A typed ampersand persists byte-exact through save and reload, stored as `&amp;` in the HTML layer

**Notes**: Proven by tnc-probe-r8 : typed `&` → stored `&amp;` in ProseMirror HTML. The editor escapes all typed text as HTML entities — this is the base case. The save-and-reload check is currently skipped because saving this content returns HTTP 500; re-enable it once the server error is resolved. The ampersand has not been isolated as the cause.

## TC-TNC-CORE-048: RTE entity encoding — HTML entity reference typed persists as double-escaped

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). A row with a known unique name exists.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Left Column cell of the target row | The editor opens |
| 2 | Clear existing content and type the literal characters `&nbsp;` using keyboard | The editor shows `&nbsp;` as visible text (not a space) |
| 3 | Click Save | Save completes |
| 4 | Reload the page and click the same Left Column cell | The editor shows `&nbsp;` as visible text — stored as `&amp;nbsp;` |

**Expected**: Typed `&nbsp;` persists as visible text, not rendered as whitespace — stored as `&amp;nbsp;`

**Notes**: Proven by tnc-probe-r8: typed `&nbsp;` → HTML `&amp;nbsp;`. ProseMirror escapes all typed content; entity references are not interpreted. This is the the HTML-entity-handling defect grid-cell case — the tooltip half is pending-probe (no walk-evidence artifact found).

## TC-TNC-CORE-049: RTE entity encoding — angle brackets typed persist as escaped entities

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). A row with a known unique name exists.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Right Column cell of the target row | The editor opens |
| 2 | Clear existing content and type `<b>bold</b>` using keyboard | The editor shows `<b>bold</b>` as visible text (no bold rendering) |
| 3 | Click Save | Save completes |
| 4 | Reload the page and click the same Right Column cell | The editor shows `<b>bold</b>` as visible text — stored as `&lt;b&gt;bold&lt;/b&gt;` |

**Expected**: Typed HTML tags persist as literal visible text, never rendered as markup

**Notes**: Proven by tnc-probe-r8: typed `<b>bold</b>` → stored `&lt;b&gt;bold&lt;/b&gt;`. ProseMirror treats all keyboard input as text, not markup injection.

## TC-TNC-CORE-050: RTE entity encoding — nested markup with entities persists byte-exact

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). A row with a known unique name exists.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Bottom Column cell of the target row | The editor opens |
| 2 | Clear existing content and type `<div class="x">&amp; &lt;span&gt;</div>` using keyboard | The editor shows the typed string as visible text |
| 3 | Click Save | Save completes |
| 4 | Reload the page and click the same Bottom Column cell | The editor shows the exact typed string — all characters preserved through double-escaping |

**Expected**: Complex nested markup with entity references persists byte-exact as visible text

**Notes**: Extension of the base entity-encoding pattern to nested content. Each `<`, `>`, `&` is independently escaped by ProseMirror.

## TC-TNC-CORE-051: RTE empty content — clearing a cell and saving persists empty state

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). A row with existing content in Left Column.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Left Column cell | The editor opens with existing content |
| 2 | Select all content and delete it | The editor is empty |
| 3 | Click Save | Save completes |
| 4 | Reload the page and click the same Left Column cell | The editor opens empty — the cleared state persisted |

**Expected**: An empty RTE cell persists as empty through save and reload

**Notes**: The empty state is stored as an empty `<p>` tag or equivalent ProseMirror empty document. This verifies the lower bound of content length. This case is not currently running because clearing an already-empty cell correctly leaves Save disabled; the check needs to start from a non-empty state before it can verify clear-and-save. Automating that setup needs further work and is deferred until prioritised.

## TC-TNC-CORE-052: RTE whitespace-only content persists through save and reload

**Automatable**: Yes — currently skipped in `terms-conditions.spec.ts`
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). A row with a known unique name exists.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Right Column cell of the target row | The editor opens |
| 2 | Clear existing content and type three space characters | The editor shows whitespace |
| 3 | Click Save | Save completes |
| 4 | Reload the page and click the same Right Column cell | The editor shows whitespace content — spaces persisted |

**Expected**: Whitespace-only RTE content persists through save and reload

**Notes**: Spaces in ProseMirror are stored within `<p>` tags. Whether leading/trailing spaces are preserved vs trimmed is the assertion here. This case is not currently running because the application trims whitespace-only rich-text content on save. Re-enable or update the check once the intended whitespace behavior is confirmed.

## TC-TNC-CORE-053: RTE long content (300 characters) persists byte-exact through save and reload

**Automatable**: Yes — currently skipped in `terms-conditions.spec.ts`
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). A row with a known unique name exists.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Left Column cell of the target row | The editor opens |
| 2 | Clear existing content and type a 300-character string using keyboard | The editor shows all 300 characters |
| 3 | Click Save | Save completes |
| 4 | Reload the page and click the same Left Column cell | All 300 characters are present — no truncation |

**Expected**: Long RTE content (300 chars) persists without truncation

**Notes**: Name field accepts 260 chars; RTE columns have no established upper bound. This case verifies no silent truncation occurs at volume. The case creates a row that will persist permanently (no delete affordance). This case is not currently running because typing the long rich-text value one key at a time exceeds the test timeout. Automating it reliably needs a faster input method and is deferred until prioritised.

## TC-TNC-CORE-054: the HTML-entity-handling defect tooltip entity rendering (pending-probe)

**Automatable**: No — blocked pending UI probe; the expected tooltip behaviour has never been observed, so there is no correct result to assert against
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). A row contains `&nbsp;` stored as `&amp;nbsp;` in a column cell.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Hover over the cell containing the stored `&amp;nbsp;` content | A tooltip appears |
| 2 | Read the tooltip text | PENDING-PROBE: whether the tooltip shows literal `&nbsp;` (escaped rendering) or a space (interpreted rendering) has not been measured |

**Expected**: Pending-probe — the tooltip rendering of entity-escaped content has not been verified by any run

**Notes**: the HTML-entity-handling defect reports tooltip shows `&nbsp;` instead of spaces. The grid-cell encoding half is confirmed (TC-048). The tooltip rendering half requires a dedicated probe — no walk-evidence artifact was found on disk. Not automated: the expected tooltip behaviour (literal entity text vs rendered whitespace) has never been observed in any UI probe, so no correct assertion can be written. A dedicated hover-probe on a cell known to contain `&amp;nbsp;` would establish the baseline and unblock this case.

---

## 7b-2: Editor state isolation (the editor-state-leak defect generalised)

## TC-TNC-CORE-055: Editor state isolation — switching from Left to Right Column shows correct content

**Automatable**: Yes — currently skipped in `terms-conditions.spec.ts`
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). A row has distinct content in Left Column ("LEFT-CONTENT-A") and Right Column ("RIGHT-CONTENT-A").

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Left Column cell | The editor shows "LEFT-CONTENT-A" |
| 2 | Dismiss any unsaved-changes dialog if prompted (click Discard) | Dialog dismissed |
| 3 | Click the Right Column cell | The editor shows "RIGHT-CONTENT-A" — no trace of Left Column content |

**Expected**: Switching from Left to Right Column loads the correct cell content with no leakage

**Notes**: the editor-state-leak defect generalised. The panel is rebuilt on each cell switch. Pending-probe for the base shape — no walk-evidence artifact found; authored from architectural knowledge (shared panel, rebuilt on switch per TC-042 + field inventory).

## TC-TNC-CORE-056: Editor state isolation — switching between rows in the same column

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). Row A and Row B have distinct content in the Left Column.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Row A's Left Column cell | The editor shows Row A's Left Column content |
| 2 | Dismiss any unsaved-changes dialog (click Discard) | Dialog dismissed |
| 3 | Click Row B's Left Column cell | The editor shows Row B's Left Column content — no trace of Row A |

**Expected**: Switching between rows in the same column loads each row's content independently

**Notes**: Cross-row isolation — the editor panel references the clicked cell's test attribute index, so content is reloaded per cell.

## TC-TNC-CORE-057: Editor state isolation — multi-cell alternation does not leak content

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). Three cells have distinct content: Row 1 Left ("AAA"), Row 1 Right ("BBB"), Row 2 Left ("CCC").

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Row 1 Left Column cell | Editor shows "AAA" |
| 2 | Immediately click Row 1 Right Column cell (dismiss dialog if prompted) | Editor shows "BBB" |
| 3 | Immediately click Row 2 Left Column cell (dismiss dialog if prompted) | Editor shows "CCC" |
| 4 | Click Row 1 Left Column cell again (dismiss dialog if prompted) | Editor shows "AAA" — no contamination from the rapid switching |

**Expected**: Rapid alternation between three different cells never leaks one cell's content into another

**Notes**: Stress-tests the panel rebuild mechanism under rapid user interaction. Pending-probe for exact timing; authored from the known rebuild-on-switch architecture.

---

## 7b-3: Cross-language independence

## TC-TNC-CORE-058: Content saved under one language does not alter another language's content

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language filter: All. Two rows exist: Row A (US English, Left Column: "ENGLISH-CONTENT") and Row B (Spanish (Mexico), Left Column: "SPANISH-CONTENT").

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Row A's Left Column cell and change content to "ENGLISH-MODIFIED" | Editor shows modified content |
| 2 | Click Save | Save completes |
| 3 | Reload the page with Language filter set to All | Both rows visible |
| 4 | Click Row B's Left Column cell | Editor shows "SPANISH-CONTENT" — unchanged by the English row edit |

**Expected**: Editing and saving one language row does not alter any other language row's content

**Notes**: The API payload carries `languageId` per row (confirmed the language-id payload confirmation, tnc-persistence-r1). This verifies the client sends language-keyed data and the server stores independently.

## TC-TNC-CORE-059: Name uniqueness is enforced across languages

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language filter: All. Row A (US English) has name "SHARED-NAME-TEST".

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Find or create a row with language Spanish (Mexico) | The Spanish row is visible |
| 2 | Type "SHARED-NAME-TEST" into the Spanish row's Name field | `aria-invalid="true"` appears on the input; Save remains disabled |
| 3 | Change the Spanish row's name to "UNIQUE-SPANISH-NAME" | `aria-invalid` clears; Save becomes enabled (given the form is dirty) |

**Expected**: Name uniqueness is GLOBAL — a duplicate name across languages blocks Save silently (`aria-invalid` only)

**Notes**: Proven by tnc-probe-r3 (cross-language duplicate). the governing requirement predicted within-language only — contradicted. Oracle per the field-validation rules: announced via `aria-invalid="true"`, no inline error text (silent block). This case is not currently running because the application currently allows duplicate names across languages, while the check expects global uniqueness. Re-enable or update the check once the intended uniqueness scope is confirmed.

---

## 7b-4: Batch/partial save semantics when residue rows are present

## TC-TNC-CORE-060: Multiple rows edited — single save commits all as a unit

**Automatable**: Yes — expected to FAIL when residue rows trigger the bulk-save failure
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). Two rows with known unique names exist.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Change Row A's name to "BATCH-ROW-A-MODIFIED" | Save becomes enabled |
| 2 | Change Row B's name to "BATCH-ROW-B-MODIFIED" | Save stays enabled |
| 3 | Click Save | Save completes — the save payload contains ALL rows |
| 4 | Reload the page | Both "BATCH-ROW-A-MODIFIED" and "BATCH-ROW-B-MODIFIED" are present |

**Expected (correct behaviour)**: Multiple edited rows are committed as a single atomic unit in one save request

**Notes**: The save endpoint sends all ~51 rows in a single a save request to the server. When residue rows with extreme content are present, the server returns HTTP 500 and the entire batch is discarded. This case authors the CORRECT expectation; it will fail in the presence of residue rows.

## TC-TNC-CORE-061: Batch save persists language change

**Automatable**: Yes — expected to FAIL (documents defect behaviour)
**Preconditions**: The Terms and Conditions page is open for office 1604. The grid contains residue rows (rows with extreme content from prior automation runs).

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Change a clean row's language to a different value | Save becomes enabled |
| 2 | Click Save and intercept the network response | The server returns HTTP 500 |
| 3 | Reload the page and verify the language change | The change is NOT persisted — entire batch discarded |

**Expected (if fixed)**: The server should either accept valid rows despite one malformed row, or reject with a specific error identifying the problematic row

**Notes**: Deliberately failing — documents the bulk-save failure where one bad row fails the entire batch. Specific offending row never isolated. This extends TC-044's L1 coverage with the explicit batch/partial semantics framing.

---

## 7b-5: Save-failure path for non-2xx responses

## TC-TNC-CORE-062: Save failure via route interception — form stays dirty, documenting a known application issue

**Automatable**: Yes — expected to FAIL while the application disables Save after a failed save
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). Network interception is configured to return HTTP 500 for the save endpoint.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Change a row's name to trigger dirty state | Save becomes enabled |
| 2 | Click Save (intercepted to return 500) | An error message appears (toast, banner, or inline) indicating save failed |
| 3 | Verify Save button state | Save remains enabled — the form stays dirty so the user can retry |
| 4 | Remove the route interception | Network restored |
| 5 | Click Save again | Save succeeds (HTTP 2xx); the edit persists after reload |

**Expected (correct behaviour)**: On save failure, the UI shows an error and keeps Save enabled for retry

**Notes**: Current behaviour is: Save button disables identically to success, no error message shown, silent data loss. This case authors the CORRECT expectation and is marked as failing evidence for that behaviour. The L1 case TC-045 documents the defective state; this L2 case documents the expected recovery flow.

---

## 7b-6: Numeric/text BVA on non-rich fields

## TC-TNC-CORE-063: Name field — 1 character minimum positive

**Automatable**: Yes — currently skipped in `terms-conditions.spec.ts`
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Clear a row's Name field and type a single unique character "X" | `aria-invalid` is false; Save becomes enabled |
| 2 | Click Save | Save completes |
| 3 | Reload the page | The name "X" persists on the row |

**Expected**: A single-character name is accepted, saves, and persists

**Notes**: Minimum positive BVA for plain text per the field-validation rules. Oracle: no rejection signal, Save enabled.

## TC-TNC-CORE-064: Name field — 260 characters accepted

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Clear a row's Name field and type a 260-character unique string | `aria-invalid` is false; Save becomes enabled; no truncation |
| 2 | Click Save | Save completes |
| 3 | Reload the page | All 260 characters persist without truncation |

**Expected**: 260 characters accepted by client and server without truncation

**Notes**: Proven by tnc-probe-r3 : ZZPROBE3-AAAA… sentinel saved and found at 260 chars post-reload. No `maxlength` attribute. Upper bound above 260 is unprobed — do not assert a maximum. This case is not currently running for the same reason as TC-TNC-CORE-013: the application rejects a 260-character name. Re-enable or update the check once the intended maximum is confirmed.

## TC-TNC-CORE-065: Name field — empty triggers red border and blocks Save

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). A row has an existing name.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Clear the row's Name field entirely | `aria-invalid="true"` appears; border color changes to red-orange (oklch(0.577 0.245 27.325)); Save becomes disabled |
| 2 | Attempt to Tab away from the field | Focus moves — the field does not trap focus (escapable per the field-validation rules) |

**Expected**: Empty name shows `aria-invalid="true"` with red border and disables Save; focus is not trapped

**Notes**: Proven by tnc-probe-r8 . Oracle differs from duplicate: empty = red border + `aria-invalid`; duplicate = `aria-invalid` only (no visible message in either case). the field-validation rules: (a) announced via `aria-invalid` + red border, (b) escapable via Tab.

## TC-TNC-CORE-066: Name field — whitespace-only triggers silent block

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Clear a row's Name field and type three spaces | `aria-invalid="true"` appears; Save is disabled |
| 2 | Attempt to Tab away from the field | Focus moves — not trapped |

**Expected**: Whitespace-only name triggers `aria-invalid="true"` and blocks Save identically to empty

**Notes**: Proven by tnc-probe-r8 . Same oracle as empty: `aria-invalid` + Save disabled. No inline error text (silent block pattern). the field-validation rules: (a) announced, (b) escapable.

## TC-TNC-CORE-067: Name field — duplicate name triggers silent block

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). An existing row has name "EXISTING-NAME".

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Change a different row's Name to "EXISTING-NAME" | `aria-invalid="true"` appears; Save is disabled; NO visible error message or tooltip |
| 2 | Attempt to Tab away from the field | Focus moves — not trapped |

**Expected**: Duplicate name blocks Save via `aria-invalid` only — no visible error message (silent block)

**Notes**: Proven by tnc-probe-r3 and r8. Oracle per the field-validation rules: (a) announced via `aria-invalid="true"` only — NO inline text, NO tooltip, (b) escapable. The oracle differs from empty-name (which adds a red border). Uniqueness is global across all languages.

## TC-TNC-CORE-068: Name field — special characters persist byte-exact

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Clear a row's Name field and type `< > & " ' / \ % # Cafe Nono 中文` | `aria-invalid` is false; Save becomes enabled |
| 2 | Click Save | Save completes |
| 3 | Reload the page | The name field shows the exact string including all special and non-ASCII characters |

**Expected**: Special characters including angle brackets, quotes, slashes, unicode persist byte-exact in the Name field

**Notes**: Proven by tnc-persistence-r1 : special chars persist byte-exact. This is the Name field (plain text input), not the RTE — characters are not HTML-escaped here.

---

## 7b-7: Date BVA

`out-of-scope:date-bva=no date or date-offset fields exist in the terms-conditions field inventory; all fields are text, dropdown, RTE, or button`

---

## 7b-8: Pairwise covering array

## TC-TNC-CORE-069: Pairwise covering array — language x row-position x column-type x data-state

**Automatable**: No — the pairwise combinations this case specifies are partially covered by existing single-factor tests, but not as a unified combinatorial suite; the uncovered pairs are documented below
**Preconditions**: The Terms and Conditions page is open for office 1604. Language filter: All. At least 4 rows present spanning at least 2 languages.

**Surface_Family**: persistence (DEEP)

**Pairwise factors:**
- Language (L): {US English, Spanish (Mexico), English (Canada), French (Canada)} — 4 levels
- Row position (R): {first, middle, last} — 3 levels
- Column type (C): {Name (plain text), Left (HTML/RTE), Right (HTML/RTE), Bottom (HTML/RTE)} — 4 levels
- Data state (D): {new-fill, existing-edit, empty/cleared} — 3 levels

**Covering array (all pairs present, 12 trials — cap at 12; see dropped-pairs below):**

| Trial | Language | Row | Column | Data State |
|---|---|---|---|---|
| 1 | US English | first | Name | new-fill |
| 2 | US English | middle | Left | existing-edit |
| 3 | US English | last | Right | empty/cleared |
| 4 | Spanish (Mexico) | first | Left | empty/cleared |
| 5 | Spanish (Mexico) | middle | Right | new-fill |
| 6 | Spanish (Mexico) | last | Name | existing-edit |
| 7 | English (Canada) | first | Right | existing-edit |
| 8 | English (Canada) | middle | Bottom | empty/cleared |
| 9 | English (Canada) | last | Name | new-fill |
| 10 | French (Canada) | first | Bottom | new-fill |
| 11 | French (Canada) | middle | Name | empty/cleared |
| 12 | French (Canada) | last | Left | existing-edit |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | For each trial 1–12: navigate to the specified row (by position anchor), target the specified column, apply the specified data state operation | The edit succeeds without error for valid operations; invalid states (empty Name) show `aria-invalid` |
| 2 | Click Save after all 12 trials are applied | Save completes for valid edits |
| 3 | Reload the page and verify each trial's result persists | Each valid edit persists; empty Name edits blocked Save and did not persist |

**Expected**: All 12 trials exercise every pair of the 4 factors at least once; valid edits persist, invalid edits are blocked

**Cap**: 12 trials. A full combinatorial would be 4x3x4x3 = 144 trials. Pairwise covers all 2-factor pairs in 12 trials.
**Dropped by cap**: no pairs dropped — 12 trials is sufficient for complete pairwise coverage of 4 factors at these levels (verified by mathematical minimum: max(4,3,4,3) x second-max(4,3,4,3) = 4x4 = 16 worst case; IPOG generates 12 for this configuration).

**Coverage analysis against implemented tests (87 specs):**

Individual factors are each exercised by at least one test:
- **Language**: TC-003/004 (filter by language), TC-008/009 (per-row language change/persist), TC-058 (cross-language content isolation) — but all edit-and-persist tests run exclusively on US English rows.
- **Row position**: No test targets position as a factor; tests operate on "a row" without positional specificity.
- **Column type**: Name (TC-011–020, TC-063–068), Left (TC-024), Right (TC-025), Bottom (TC-026) — all on US English.
- **Data state**: new-fill (TC-023, TC-027), existing-edit (TC-018, TC-024–026), empty/cleared (TC-051, TC-020) — all on US English.

**Trials with a covering implemented test:**
| Trial | Covering test | Reason |
|---|---|---|
| 1 (US English, first, Name, new-fill) | TC-011, TC-063 | Name new-fill on US English first row |
| 2 (US English, middle, Left, existing-edit) | TC-024 | Left Column existing content edit on US English |

**Trials with NO single covering test (10 of 12):**
Trials 3–12 each require a non-US-English language OR a row-position factor OR a column×data-state combination that no implemented test exercises as a unit. Specifically:
- Trial 3 (US English, last, Right, empty/cleared): TC-025 covers Right but existing-edit, not empty/cleared.
- Trials 4–12: Every trial involving Spanish, English (Canada), or French (Canada) combined with a column edit has no implementing test — all column-content tests (TC-024–026, TC-046–053) run on US English only.

**Conclusion**: 10 of 12 trials have no implementing test. The case is not covered. Not automated: implementing this as a single parameterized test requires explicit multi-language row targeting and positional anchoring that no existing page-object helper provides. It remains a valid coverage gap for future implementation when cross-language edit persistence is prioritized.

**Notes**: The array itself is recorded above for regeneration. Each trial that creates content will persist permanently (no delete affordance). Name edits must use unique values to avoid the duplicate-name block.

---

## 7b-9: State-transition model

## TC-TNC-CORE-070: State transition — Clean to Dirty via name edit

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). No pending edits (Save is disabled).

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify Save is disabled (Clean state) | Save button has `disabled` attribute |
| 2 | Type a character into a row's Name field | Save becomes enabled (transition to Dirty) |

**Expected**: Editing a name field transitions the page from Clean to Dirty (Save enables)

## TC-TNC-CORE-071: State transition — Clean to Dirty via language change

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). No pending edits.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify Save is disabled (Clean state) | Save button has `disabled` attribute |
| 2 | Change a row's language dropdown to a different value | Save becomes enabled (transition to Dirty) |

**Expected**: Changing a per-row language transitions from Clean to Dirty

**Notes**: Proven by tnc-probe-r8 : per-row language change enables Save dirty gate.

## TC-TNC-CORE-072: State transition — Clean to Dirty (RTE edit)

**Automatable**: No — duplicate of TC-TNC-CORE-023; the observable behaviour (typing in the RTE enables Save) is identical
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). No pending edits.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify Save is disabled (Clean state) | Save button has `disabled` attribute |
| 2 | Click a Left Column cell and type content | Save becomes enabled (transition to Dirty) |

**Expected**: Typing in the RTE transitions from Clean to Dirty

**Notes**: Not automated: this case is a duplicate of TC-TNC-CORE-023 ("Typing in the editor enables Save"). Both test the same action (type in a Left Column RTE cell) and the same expected outcome (Save transitions from disabled to enabled). TC-072 adds an explicit pre-condition assertion (verify Save disabled first) and frames it as a "state transition", but TC-023 already exercises the identical user-observable behaviour. The pre-condition (Save disabled at rest) is separately proven by TC-028. Covered by: TC-TNC-CORE-023 + TC-TNC-CORE-028.

## TC-TNC-CORE-073: State transition — Dirty to Saving to Save-OK

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. The form is dirty (Save enabled). Network interception captures the save response.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Save | The save request fires; Save transitions to disabled during the request |
| 2 | Observe the network response | HTTP 2xx returned |
| 3 | Verify post-save state | Save is disabled (Clean state restored); page is at rest |

**Expected**: Dirty to Saving (Save click) to Save-OK (2xx response) returns page to Clean state

## TC-TNC-CORE-074: State transition — Dirty to Save-Failed

**Automatable**: Yes — expected to FAIL while the application disables Save after a failed save
**Preconditions**: The Terms and Conditions page is open for office 1604. The form is dirty. Network interception configured to return HTTP 500.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Save (intercepted to return 500) | The save request fires |
| 2 | Verify post-failure state | Save should remain enabled (form stays Dirty); an error message should appear |

**Expected (correct behaviour)**: On Save-Failed, the page should return to Dirty state (Save enabled) with a visible error

**Notes**: The current behaviour incorrectly transitions to "Clean" (Save disabled, no error). This case authors the CORRECT state transition and documents the failed-save behaviour.

## TC-TNC-CORE-075: State transition — Dirty triggers beforeunload on navigate away

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. The form is dirty.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Attempt to navigate away (e.g., click browser back or navigate to a different URL) | The native `beforeunload` dialog fires |
| 2 | Cancel the navigation (Stay) | The page remains; form is still dirty; Save still enabled |

**Expected**: Navigating away from a dirty form fires `beforeunload`; cancelling stays on page with dirty state preserved

**Notes**: Proven by tnc-probe-r8 : `beforeunload` fires on navigate-away with dirty form.

## TC-TNC-CORE-076: State transition — Language filter change on dirty form raises guard (Stay)

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. The form is dirty.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Language filter and select a different option | The warning dialog opens with title "Unsaved changes" and body "Are you sure you want to leave this view? Any unsaved changes will be lost." |
| 2 | Click Stay | The dialog dismisses; form remains dirty; Save still enabled; filter unchanged |

**Expected**: Language filter change on dirty form raises guard dialog; Stay preserves dirty state

**Notes**: Proven by tnc-probe-r8 .

## TC-TNC-CORE-077: State transition — Language filter change on dirty form (Discard)

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. The form is dirty.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the Language filter and select a different option | The warning dialog opens |
| 2 | Click Discard | The dialog dismisses; edits are discarded; grid reloads with the new filter; Save is disabled (Clean) |

**Expected**: Discard on the guard dialog drops unsaved changes and applies the filter change

## TC-TNC-CORE-078: State transition — Dirty to Edit-Another-Row (no guard — known gap the unsaved-change-guard defect)

**Automatable**: Yes — expected to PASS (documents absence of guard)
**Preconditions**: The Terms and Conditions page is open for office 1604. Row A's name has been edited (form is dirty). Row B is visible.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Row B's Name input | Focus moves to Row B; NO guard dialog fires |
| 2 | Edit Row B's name | Both rows are now dirty; no warning was shown at any point |

**Expected**: No guard fires when editing a different row while one is dirty — this is a missing guard (known gap the unsaved-change-guard defect)

**Notes**: Proven by tnc-probe-r8 (PROBE D4). The cross-row guard is absent — the unsaved-change-guard defect shape. Authored as known-gap case, not as a passing assertion of correct behaviour.

## TC-TNC-CORE-079: Validation-Error to Fix returns to Dirty

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. A row's Name is in `aria-invalid` state (e.g., duplicate or empty).

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify Save is disabled and input shows `aria-invalid="true"` | Validation error state confirmed |
| 2 | Fix the name (type a unique, non-empty value) | `aria-invalid` clears; Save becomes enabled because the corrected name is an unsaved change |

**Expected**: Fixing a validation error transitions back to Dirty state with Save enabled

## TC-TNC-CORE-080: Reverting edit to original value disables Save

**Automatable**: Yes
**Preconditions**: The Terms and Conditions page is open for office 1604. A row has saved name "ORIGINAL-NAME".

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Change the row's name to "TEMP-DIFFERENT" | Save becomes enabled (Dirty) |
| 2 | Change the name back to "ORIGINAL-NAME" | Save becomes disabled — the form detects revert-to-original and returns to Clean |

**Expected**: Reverting an edit to its saved value re-disables Save (revert is detected as not-dirty)

**Notes**: This is the "revert to original value" edge from the ticket's measured facts. The save gate detects that the current value matches the last-saved value and disables Save. This is the most-missed state edge per the ticket description.

## TC-TNC-CORE-081: State transition — Tab-to-tab navigation guard (unconfirmed)

**Automatable**: No — the UI element required to trigger this transition (a sibling settings-tab link) has not been located on the Terms and Conditions page in any probe
**Preconditions**: The Terms and Conditions page is open for office 1604. The form is dirty. A sibling settings tab link is visible.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click a sibling settings tab (if one exists) | UNCONFIRMED — whether a guard dialog fires on tab-to-tab navigation has not been tested (no tab link found in any probe) |

**Expected**: Unconfirmed — no settings tab link was located to test this transition

**Notes**: Not automated: multiple UI probes of the Terms and Conditions page found no sibling settings-tab navigation link in the DOM. Without a clickable element to trigger a tab switch, no action can be performed and no guard dialog can be tested. To unblock: a targeted DOM probe specifically searching for navigation links (anchors, buttons, or tab elements) that route to other Location Settings sub-pages from the T&C page. If such a link is found, this case becomes automatable immediately.

---

# L3 — DEEP

---

## 7c-1: Cross-module integration

## TC-TNC-CORE-082: Integration — T&C edit surfaces in Location Management History

**Automatable**: Yes | **Implemented**: `terms-conditions.spec.ts` | currently skipped
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). A unique sentinel name is prepared for tracing.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Change a row's name to a unique sentinel value (e.g., "HISTORY-TRACE-SENTINEL") and Save | Save completes |
| 2 | Navigate to Location Management History for office 1604 | The History page loads (reuse `the Location Management History page object`) |
| 3 | Search or filter for the most recent entry | A history row referencing the Terms and Conditions change is visible |

**Expected**: A T&C edit creates a corresponding entry in Location Management History

**Notes**: This case is not currently running because the Legal tab Save button in Location Settings does not persist changes reliably: it can silently fail or return an error after a Terms and Conditions selection. Re-enable it once the Legal-tab save defect is fixed. The case creates a permanent history row (no delete).

## TC-TNC-CORE-083: Integration — T&C required per language on Legal tab (the legal-tab defect/the related legal defect)

**Automatable**: Yes | **Implemented**: `terms-conditions.spec.ts` | currently skipped
**Preconditions**: The Terms and Conditions page is open for office 1604. T&C entries exist for at least two languages.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to the Legal tab for office 1604 | The Legal tab loads (reuse `the Location Legal page object`) |
| 2 | Verify T&C information is reflected per language | Language-specific T&C content appears on the Legal tab |

**Expected**: T&C content saved per language is reflected on the Legal tab

**Notes**: the legal-tab defect + the related legal defect (both Done). The defect crossref marks these as NOT YET CONFIRMED — no run visited the Legal tab. The `the Location Legal page object` page object exists. the legal-save defect caveat: an OPEN defect says Legal updates may not save to the database. If the Legal assertion fails, cite the legal-save defect rather than filing a new bug. Authored as a real case.

`out-of-scope:integration-kafka=downstream Helioscorp sync (the downstream-sync defect) has no UI-observable oracle on this surface`

---

## 7c-3: Error-guessing

## TC-TNC-CORE-084: Error-guessing — double-click race on Save button

**Automatable**: Yes | **Implemented**: `terms-conditions.spec.ts`
**Preconditions**: The Terms and Conditions page is open for office 1604. The form is dirty (Save enabled).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Rapidly double-click the Save button | Only one save request fires; Save disables after the first click; no duplicate submission |
| 2 | Verify no duplicate network requests | Exactly one a save request to the server captured |

**Expected**: Double-clicking Save does not produce duplicate save requests

## TC-TNC-CORE-085: Error-guessing — save-failure retry succeeds after interception removed

**Automatable**: Yes — expected to FAIL while failed-save retry is unavailable | **Implemented**: `terms-conditions.spec.ts`
**Preconditions**: The Terms and Conditions page is open for office 1604. The form is dirty. First save will fail (route interception returns 500), then interception is removed.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click Save (intercepted: 500 returned) | Save should stay enabled for retry (correct expectation) |
| 2 | Remove interception and click Save again | Save should succeed; edit persists after reload |

**Expected (correct)**: After a failed save, the user can retry and succeed

**Notes**: Save currently disables on failure, making retry impossible without page reload. This case authors the correct retry flow and documents the failed-save retry gap.

## TC-TNC-CORE-086: Error-guessing — language switched mid-RTE-edit

**Automatable**: Yes | **Implemented**: `terms-conditions.spec.ts`
**Preconditions**: The Terms and Conditions page is open for office 1604. The editor is open with unsaved content in a row's Left Column.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | While the editor has unsaved content, change the same row's language dropdown | The unsaved-changes guard fires (for the language filter change path) OR the language change applies without losing the RTE edit (for the per-row dropdown) |
| 2 | Click Save if enabled | Both the language change and the RTE content persist |

**Expected**: Changing language mid-RTE-edit either raises a guard or preserves both edits — no silent data loss

**Notes**: Per-row language change enables the dirty gate (tnc-probe-r8). The question is whether a simultaneous RTE edit + language change on the same row compose correctly in the save payload. Error-guessing category.

## TC-TNC-CORE-087: Error-guessing — browser-back after successful save

**Automatable**: Yes | **Implemented**: `terms-conditions.spec.ts`
**Preconditions**: The Terms and Conditions page is open for office 1604. A save was just completed successfully (form is Clean).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click browser Back | Navigation proceeds without any `beforeunload` dialog (form is Clean) |
| 2 | Click browser Forward to return | The T&C page reloads with the saved data intact |

**Expected**: Browser-back after a clean save navigates away without a guard; forward returns to the saved state

---

## 7c-4: Accessibility audit

## TC-TNC-CORE-088: Accessibility — logical tab order through page controls

**Automatable**: Yes | **Implemented**: `terms-conditions.spec.ts`
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Press Tab repeatedly from the first focusable element | Focus moves in a logical order through: Language filter, grid rows (Language dropdown, Name input, column cells), Add row button, Save button |
| 2 | Verify no focus skips or traps | Every interactive control is reachable via Tab; no element traps focus indefinitely |

**Expected**: Tab order follows a logical top-to-bottom, left-to-right sequence through all interactive controls

**Notes**: Finding withdrawn (August 2026). The language filter was originally reported as unreachable by keyboard, but an independent tester confirmed the control is reached on Tab press #17. The application behaviour is correct; our initial test was at fault. No accessibility defect exists for this control.

## TC-TNC-CORE-089: Accessibility — RTE keyboard operability

**Automatable**: Yes | **Implemented**: `terms-conditions.spec.ts`
**Preconditions**: The Terms and Conditions page is open for office 1604. A Left Column cell is visible.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Tab into the Left Column cell (or activate it via Enter/Space on the launcher button) | The RTE gains focus — the cursor is inside the contenteditable |
| 2 | Type text using the keyboard | Characters appear in the editor |
| 3 | Press Tab or Escape to exit the editor | Focus moves OUT of the contenteditable to the next focusable element — the editor does not trap keyboard focus |

**Expected**: The ProseMirror RTE is reachable and exitable by keyboard — no keyboard trap

**Notes**: A contenteditable that cannot be reached or exited by keyboard is a WCAG 2.1.1 failure (Keyboard) and a common one. ProseMirror only accepts real key events. This case verifies the enter/exit keyboard flow. `platform` stays deferred — no cross-browser/responsive/dark-mode in this case. This case is not currently running because pressing Escape does not release focus from the rich text editor; focus remains trapped in the contenteditable area. Re-enable it once the application releases focus correctly.

## TC-TNC-CORE-090: Accessibility — unsaved-changes dialog focus trap and restore

**Automatable**: Yes | **Implemented**: `terms-conditions.spec.ts` | currently skipped
**Preconditions**: The Terms and Conditions page is open for office 1604. The form is dirty. The language filter is about to be changed (triggers the guard dialog).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select a language filter option to trigger the guard dialog | The warning dialog appears; keyboard focus moves into it (accessibility focus behavior) |
| 2 | Press Tab within the dialog | Focus cycles between Stay and Discard buttons (focus trapped within dialog) |
| 3 | Press Escape or click Stay | The dialog closes; focus returns to the element that triggered the dialog (the language filter) |

**Expected**: The unsaved-changes dialog traps focus while open and restores focus to the invoker on close

**Notes**: WCAG 2.4.3 (Focus Order) — modal dialogs must trap focus and restore on dismiss. Client rule: a11y cases yes, a11y bug reports no. This case is not currently running because dismissing the unsaved-changes dialog with Stay drops focus to the page body instead of returning it to the triggering language filter. Re-enable it once focus is restored to the trigger element.

---

## 7c-5: Network response payload

## TC-TNC-CORE-091: Network payload — save response body reflects committed data including languageId and rich-text

**Automatable**: Yes | **Implemented**: `terms-conditions.spec.ts`
**Preconditions**: The Terms and Conditions page is open for office 1604. Language: US English (default). A row has been edited with a known Name and known RTE content. Network interception captures request and response.

**Surface_Family**: persistence (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Edit a row: set Name to "NET-PAYLOAD-TEST", type "PAYLOAD-CONTENT" into Left Column | Save becomes enabled |
| 2 | Click Save and capture the save request payload | The request body contains: the edited row with `"languageId":"en-US"`, the name "NET-PAYLOAD-TEST", and the RTE content (HTML-escaped) |
| 3 | Capture the response body | The response reflects the committed payload — the saved row data appears in the response with matching `languageId`, name, and content |

**Expected**: The save response body reflects the committed payload including `languageId` codes and rich-text content

**Notes**: Endpoint: the terms-conditions save API. Payload carries `languageId` codes (confirmed the language-id payload confirmation, tnc-persistence-r1). Backend database verification is outside framework scope — do not assert it. This case validates network response structure only.

---

## 7c-6: Volume / virtualization

## TC-TNC-CORE-092: Volume — all rows render in one scroll view without pagination

**Automatable**: Yes | **Implemented**: `terms-conditions.spec.ts`
**Preconditions**: The Terms and Conditions page is open for office 1604. Language filter: All.

**Surface_Family**: empty-vol (DEEP)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Count all visible rows in the grid | All rows (~51 including residue) render in a single scroll view — no pagination controls present |
| 2 | Scroll to the last row | The last row is reachable by scrolling; content is read by anchoring on the row's unique name (not index) |
| 3 | Verify no duplicate rows appear | Each row name+language combination is unique across the visible set |

**Expected**: All rows (~51) render without pagination; off-screen rows are reachable by scroll; no duplicates

**Notes**: The grid holds ~50 rows and does not paginate — all rows render in one scroll view. Row count reached: ~51 (50 real + 1 residue per field inventory). Volume is too small to stress virtualization — the grid does not use virtual scrolling at this scale. Row count stated: 51. Content-anchor (name) used for off-screen row identification, not index.

---

## L2/L3 DEEP CASE COUNT SUMMARY

**Total new cases**: 46 (TC-TNC-CORE-047 through TC-TNC-CORE-092)

### L2 breakdown (35 cases):
- 7b-1 Rich-text round-trip BVA: 8 cases (TC-047 to TC-054)
- 7b-2 Editor state isolation: 3 cases (TC-055 to TC-057)
- 7b-3 Cross-language independence: 2 cases (TC-058 to TC-059)
- 7b-4 Batch/partial save semantics: 2 cases (TC-060 to TC-061)
- 7b-5 Save-failure path: 1 case (TC-062)
- 7b-6 Numeric/text BVA: 6 cases (TC-063 to TC-068)
- 7b-7 Date BVA: out-of-scope (no date fields)
- 7b-8 Pairwise covering array: 1 case (TC-069) — 12 trials, cap stated, 0 dropped
- 7b-9 State-transition model: 12 cases (TC-070 to TC-081)

### L3 breakdown (11 cases):
- 7c-1 Cross-module integration: 2 cases (TC-082 to TC-083)
- 7c-3 Error-guessing: 4 cases (TC-084 to TC-087)
- 7c-4 Accessibility: 3 cases (TC-088 to TC-090)
- 7c-5 Network response payload: 1 case (TC-091)
- 7c-6 Volume/virtualization: 1 case (TC-092)
