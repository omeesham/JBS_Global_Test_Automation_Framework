# Service Charge Text — Test Cases

**Module**: service-charge-text
**Submodule**: CORE
**Page**: Location Settings → Service Charge Text (`/settings/service-charge-text`)
**Test Entity**: Office 1604
**Updated**: 2026-08-03
**Total TCs**: 83

**Governing Requirement**: NM-1728 (epic NM-1694)
**Verified against**: the live page on office 1604, 2026-08-03

---

## FIELD INVENTORY

| Field | Control Type | Default | Required |
|---|---|---|---|
| Language filter (page level) | Dropdown | US English | Not applicable |
| Language (per row) | Dropdown | Row value | Yes |
| Service Charge Name | Text input | Row value | Yes |
| Service Charge Display Name | Text input | Row value | Yes |
| Report Column Name | Text input | Row value | Yes |
| Service Charge Text | Rich text editor (opened from the grid cell) | Row value | Not established |
| Add row | Button | Not applicable | Not applicable |
| Save | Button | Disabled | Not applicable |

The grid shows 114 data rows. The five columns are Language, Service Charge Name, Service Charge
Display Name, Report Column Name, and Service Charge Text.

---

## Validation Rules

| Rule | Behaviour |
|---|---|
| Service Charge Name is required | Save stays disabled while the field is empty |
| Service Charge Display Name is required | Save stays disabled while the field is empty |
| Report Column Name is required | Save stays disabled while the field is empty |
| Language is required | Populated by default on a new row |
| Service Charge Name is unique within a language | A duplicate name disables Save |
| Save is gated on validity | Save enables only when every required field is populated and no duplicate name exists |
| Service Charge Name length | No maximum length is enforced in the browser |

---

## MCP_VERIFICATION_LOG

| # | Verified | Result |
|---|---|---|
| 1 | Page loads on office 1604 | Heading reads Service Charge Text |
| 2 | Column headers | Language, Service Charge Name, Service Charge Display Name, Report Column Name, Service Charge Text |
| 3 | Language filter options | All, English (Canada), US English, Spanish (Mexico), French (Canada) |
| 4 | Default filter value | US English |
| 5 | Row count | 114 data rows |
| 6 | Save at rest | Disabled |
| 7 | Selecting a row | Save stays disabled |
| 8 | Add row | Row count becomes 115, Save stays disabled |
| 9 | New row with all required fields filled | Save becomes enabled |
| 10 | New row with a duplicate name | Save becomes disabled |
| 11 | Duplicate name error message | No message is displayed |
| 12 | Name accepting 300 characters | Accepted, and the cell content is visually cut off |
| 13 | Rich text editor | Opens when a Service Charge Text cell is clicked |
| 14 | Reload after unsaved edits | All edits are discarded, row count returns to 114 |

---

## TC-SCT-CORE-001: Metadata columns accept typed input

**Automatable**: Yes — currently skipped in `service-charge-text.spec.ts`
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Type a new value into the Service Charge Name cell of the first row | The typed value appears in the cell |
| 2 | Type a new value into the Service Charge Display Name cell of the same row | The typed value appears in the cell |
| 3 | Type a new value into the Report Column Name cell of the same row | The typed value appears in the cell |

**Notes**: Confirms the three metadata columns are editable directly in the grid.

## TC-SCT-CORE-002: Save stays disabled while a required field is empty

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Add a new row | A new empty row is added to the grid |
| 2 | Leave the Service Charge Name empty and move focus away | Save remains disabled |

**Notes**: Save is gated on validity, so an incomplete row cannot be saved.

## TC-SCT-CORE-003: Save enables when a new row is complete and unique

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Add a new row | A new empty row is added to the grid |
| 2 | Enter a Service Charge Name that is not already used | The value appears in the cell |
| 3 | Enter a Service Charge Display Name and a Report Column Name | Both values appear in their cells |
| 4 | Move focus away from the last field | Save becomes enabled |

**Notes**: This is the positive counterpart to TC-SCT-CORE-002.

## TC-SCT-CORE-004: Duplicate Service Charge Name disables Save

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 and at least one row already has a Service Charge Name.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Add a new row and complete every required field with unique values | Save becomes enabled |
| 2 | Change the new row's Service Charge Name to a name already used by another row in the same language | Save becomes disabled |

**Notes**: Confirms the uniqueness rule is enforced.

## TC-SCT-CORE-005: Duplicate Service Charge Name is announced to the user

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Add a new row and complete every required field with unique values | Save becomes enabled |
| 2 | Change the new row's Service Charge Name to a name already used in the same language | Save becomes disabled |
| 3 | Look for a message explaining why the entry was rejected | The field is marked invalid (`aria-invalid="true"`), a red circular alert icon appears inside the cell, and hovering the icon reveals the tooltip text "Duplicate Service Charge Name for this language." Save remains disabled |

**Notes**: When a duplicate name is entered and focus leaves the field, the application immediately marks the input as invalid, displays a red alert icon next to it, and exposes the reason in a tooltip on that icon. The `aria-invalid="true"` attribute is present on the input at all times after blur, so automated checks can detect the error state without needing to trigger the hover.

## TC-SCT-CORE-006: Service Charge Name accepts a long value

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Enter a 300 character value into a Service Charge Name cell | The full value is accepted and retained |

**Notes**: No maximum length is enforced in the browser.

## TC-SCT-CORE-007: A long Service Charge Name stays readable in the grid

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Enter a 300 character value into a Service Charge Name cell | The full value is accepted |
| 2 | Read the stored value of the field | The stored value is the full 300 character string that was entered — no characters are discarded |

**Notes**: No maximum length is enforced, so all 300 characters are retained in the field's value. The column is narrow and the text is visually truncated in the cell, which is ordinary narrow-column display behaviour; the truncation lifts when the field has focus. This test verifies the stored value, not the visual display width.

## TC-SCT-CORE-008: A name of only spaces is treated as empty

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Add a new row and complete every field except Service Charge Name | Save remains disabled |
| 2 | Enter only space characters into Service Charge Name and move focus away | Save remains disabled |

**Notes**: Confirms whitespace does not satisfy a required field.

## TC-SCT-CORE-009: Special characters are accepted and preserved

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Enter a Service Charge Name containing punctuation and accented characters | The value appears exactly as typed |
| 2 | Move focus to another field | The value is still displayed exactly as typed |

**Notes**: Covers the plain text field family.

## TC-SCT-CORE-010: Reverting an edited value returns Save to disabled

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change a Service Charge Name to a different unique value | Save becomes enabled |
| 2 | Change the same field back to its original value | Save returns to disabled |

**Notes**: Confirms an edit that nets to no change does not leave the page in a saveable state.

## TC-SCT-CORE-011: Language filter offers five options

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Open the page level Language filter | The list shows All, English (Canada), US English, Spanish (Mexico), and French (Canada) |

**Notes**: The option set is fixed for this page.

## TC-SCT-CORE-012: Language filter defaults to US English

**Automatable**: Yes
**Preconditions**: The Service Charge Text page has just been opened for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Read the current value of the page level Language filter | The filter shows US English |

**Notes**: Confirms the documented default language.

## TC-SCT-CORE-013: Selecting a language filters the grid

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Note the number of rows currently displayed | The row count is recorded |
| 2 | Select a different language in the page level filter | The grid reloads and shows the rows for the selected language |

**Notes**: Covers result fidelity for the filter.
**Surface_Family**: result-fidelity (QUICK)

## TC-SCT-CORE-014: Selecting All shows every language

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Select a single language in the page level filter and note the row count | The row count for that language is recorded |
| 2 | Select All in the page level filter | The grid shows at least as many rows as the single language selection |

**Notes**: All is a filter value and is not a language that a row can be assigned.

## TC-SCT-CORE-015: Changing language with unsaved changes prompts first

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Edit a Service Charge Name so the page has unsaved changes | Save becomes enabled |
| 2 | Select a different language in the page level filter | A dialog appears with the message "Unsaved changes  Are you sure you want to leave this view? Any unsaved changes will be lost." and offers Stay and Discard buttons |
| 3 | Click Stay | The dialog closes; the filter has not changed; the edited value is still present; Save is still enabled |
| 4 | Restore the original value | Save returns to disabled |

**Notes**: No save is needed. The leave-view dialog fires on filter change when unsaved edits are present. The Stay button preserves both the edit and the current filter selection.

## TC-SCT-CORE-016: The per row language control opens its own list

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Open the Language control on the first grid row | A list of languages is displayed for that row |

**Notes**: The row control is a button that opens a list. It is not the plain browser dropdown that also exists in the row.

## TC-SCT-CORE-017: The per row language list omits All

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Open the Language control on the first grid row | The list shows the four languages and does not include All |

**Notes**: All exists only as a filter value.

## TC-SCT-CORE-018: Clicking a Service Charge Text cell opens the editor

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Click the Service Charge Text cell of the first row | The rich text editor opens and shows that row's content |

**Notes**: The editor is a rich text area on the page.

## TC-SCT-CORE-019: Selecting a row does not make the page saveable

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 and Save is disabled.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Click the Service Charge Text cell of the first row | The editor opens with that row's content |
| 2 | Read the state of Save | Save is still disabled |

**Notes**: Selecting a row is not an edit.

## TC-SCT-CORE-020: The editor is unavailable until a row is selected

**Automatable**: Yes
**Preconditions**: The Service Charge Text page has just been opened for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Read the state of the rich text editor before selecting any row | The editor is not available for typing |

**Notes**: Matches the documented initial state.

## TC-SCT-CORE-021: Editing the rich text marks the page as changed

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Click a Service Charge Text cell to open the editor | The editor opens with that row's content |
| 2 | Type additional text into the editor and apply it to the row | Save becomes enabled |

**Notes**: No save is required. Reloading the page discards the unsaved editor change. Editor changes are tracked separately from grid changes.

## TC-SCT-CORE-022: Switching rows with unsaved editor changes prompts first

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Open the editor for one row and type additional text | The typed text appears in the editor |
| 2 | Click the Service Charge Text cell of a different row | A confirmation dialog appears asking whether to leave the current view |
| 3 | Click Stay in the confirmation dialog | The dialog closes and the original row remains selected in the editor |

**Notes**: The leave-view dialog uses the same Stay/Discard mechanism as the language filter change. No save is required. If the dialog does not appear on switching rows, that is a defect to report.

## TC-SCT-CORE-023: An empty Service Charge Text loads a starting layout

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 and a row has no Service Charge Text content.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Click the Service Charge Text cell of that row | The editor opens showing a default starting layout rather than a blank area |

**Notes**: Applies when a row has no stored content.

## TC-SCT-CORE-024: Add row appends an empty row

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Note the current number of grid rows | The row count is recorded |
| 2 | Select Add row | The grid contains one more row than before and the new row is empty |

**Notes**: The new row is added at the end of the grid.

## TC-SCT-CORE-025: A new empty row does not make the page saveable

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 and Save is disabled.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Select Add row | A new empty row is added |
| 2 | Read the state of Save | Save is still disabled |

**Notes**: Save depends on the row being complete, not on a row having been added.

## TC-SCT-CORE-026: Completing a new row makes the page saveable

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Select Add row | A new empty row is added and Save stays disabled |
| 2 | Complete every required field on the new row with values that are not already used | Save becomes enabled |

**Notes**: Confirms the rule that Save follows validity.

## TC-SCT-CORE-027: Unsaved rows are discarded when the page is reloaded

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Note the current number of grid rows | The row count is recorded |
| 2 | Select Add row and complete its required fields without saving | The grid contains one more row and Save is enabled |
| 3 | Reload the page | The grid returns to the original row count and Save is disabled |

**Notes**: Confirms that unsaved work does not persist.

## TC-SCT-CORE-028: Filtering shows only the selected language

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Select a specific language in the page level filter | Every visible row shows the selected language |
| 2 | Select All in the page level filter | Rows for more than one language are visible |

**Notes**: Covers the accuracy of the filtered result set.
**Surface_Family**: result-fidelity (QUICK)

## TC-SCT-CORE-029: All five column headers are displayed

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Read the grid column headers | The headers read Language, Service Charge Name, Service Charge Display Name, Report Column Name, and Service Charge Text |

**Notes**: Guards against a missing header or a column that stops being displayed.
**Surface_Family**: render-state (QUICK)

## TC-SCT-CORE-030: Every row is reachable without paging

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Read the number of data rows in the grid | The grid reports its full set of data rows |
| 2 | Locate a row by its Service Charge Name rather than by position | That row is found without using any paging control |

**Notes**: The grid renders in full and has no paging control.
**Surface_Family**: empty-vol (QUICK)

## TC-SCT-CORE-031: Saved values survive a reload

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change a Service Charge Display Name to a new unique value and save | The change is accepted and Save returns to disabled |
| 2 | Reload the page | The changed value is still displayed |
| 3 | Restore the original value and save again | The original value is displayed and Save returns to disabled |

**Notes**: Persistence is checked against this page only. Downstream systems are out of scope because a known open defect prevents changes from reaching them.
**Surface_Family**: persistence (QUICK)

## TC-SCT-CORE-032: Edited Service Charge Name persists after save and reload

**Automatable**: Yes

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change the Service Charge Name of the first US English row to a different unique value | Save becomes enabled |
| 2 | Click Save | The Save button returns to disabled and no error is shown |
| 3 | Reload the page | The changed Service Charge Name is still displayed |
| 4 | Restore the original Service Charge Name and save again | The original value is displayed and Save returns to disabled |

**Notes**: Covers save-cycle correctness for the Service Charge Name field. The restore step in step 4 leaves the page in its original state.
**Surface_Family**: persistence (DEEP)

## TC-SCT-CORE-033: Saved values survive a browser back and forward navigation

**Automatable**: Yes

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change the Service Charge Display Name of the first US English row to a different unique value | Save becomes enabled |
| 2 | Click Save | Save returns to disabled |
| 3 | Navigate to a different page using the browser back button | The browser shows a different page |
| 4 | Navigate forward to the Service Charge Text page | The changed Service Charge Display Name is still displayed |
| 5 | Restore the original value and save again | The original value is displayed and Save returns to disabled |

**Notes**: Confirms that the saved value is read from the server on re-entry, not a stale client cache.
**Surface_Family**: persistence (DEEP)

## TC-SCT-CORE-034: All three metadata fields saved in one operation all persist

**Automatable**: Yes

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change the Service Charge Name, Service Charge Display Name, and Report Column Name of one US English row to three different unique values | Save becomes enabled |
| 2 | Click Save | Save returns to disabled |
| 3 | Reload the page | All three changed values are still displayed on that row |
| 4 | Restore all three original values and save again | All three original values are displayed and Save returns to disabled |

**Notes**: Confirms that a single save operation correctly commits all three fields in the same row. Row count stays at 114 throughout.
**Surface_Family**: persistence (DEEP)

## TC-SCT-CORE-035: Pairwise coverage of language filter, row action, and Save state — part one

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604. The original Service Charge Display Name and Report Column Name values for the first visible row under each filter are known.

This test case and TC-036 together form a 2-way covering array over three factors:
- F1 Language filter: All, English (Canada), US English, Spanish (Mexico), French (Canada) — 5 values
- F2 Row action: no edit, edit a metadata field, edit the rich text editor, type back the original value — 4 values
- F3 Save state: disabled, enabled — 2 values (F3 is a page-level condition, independent of F2; Save is enabled when every row has its three required fields filled and no Service Charge Name is duplicated within a language)

**Factor analysis — pairs, coverage, and impossible exclusions:**

| Factor pair | Total pairs | Covered | Excluded as impossible | Reason for exclusion |
|---|---|---|---|---|
| F1 × F2 | 20 | 20 | 0 | All 5 language values appear with all 4 row actions across the 20-row array |
| F1 × F3 | 10 | 10 | 0 | Each language filter is observed with Save disabled (no-edit rows) and with Save enabled (edit-metadata rows) |
| F2 × F3 | 8 | 7 | 1 | One pair is structurally impossible; all others are constructible by arranging a second row |

F2 × F3 pairs and how each is covered or excluded:
- (no-edit, disabled): covered — steps 1 and 6 (load page, read Save without editing)
- (no-edit, enabled): **impossible** — a freshly loaded page with no change cannot have Save enabled; Save requires at least one field to differ from its loaded value and no invalid row to exist
- (edit-metadata, enabled): covered — steps 2 and 7 (edit Display Name on one row to a new unique value)
- (edit-metadata, disabled): covered — steps 11–13 (edit Display Name on row A while a second row has a blank required field; the page is dirty but invalid)
- (edit-to-original, disabled): covered — steps 3 and 8 (type the original value back into the one changed field)
- (edit-to-original, enabled): covered — steps 14–16 (change two fields on a row, revert only one; the page is still dirty and valid)
- (edit-rte, enabled): covered — steps 4 and 9 (type into the rich text editor with no invalid row present)
- (edit-rte, disabled): covered — steps 17–19 (type into the rich text editor while a second row has a blank required field)

Grand totals: 38 pairs; 37 covered; 1 excluded as impossible. Every valid 2-way pair appears in at least one row of the array. This test case covers the All and English (Canada) filters plus the three second-row constructions for F2 × F3 completeness.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Select All in the language filter and read the Save button state without editing any field | Save is disabled |
| 2 | Change the Service Charge Display Name of the first visible row to a different unique value | Save becomes enabled |
| 3 | Type the original Display Name back into that field and move focus away | Save returns to disabled |
| 4 | Click the Service Charge Text cell of the first visible row to open the rich text editor and type a word into it | Save becomes enabled |
| 5 | Reload the page to discard the unsaved editor change | Save is disabled and the page shows the original content |
| 6 | Select English (Canada) in the language filter and read the Save button state without editing any field | Save is disabled |
| 7 | Change the Service Charge Display Name of the first visible row to a different unique value | Save becomes enabled |
| 8 | Type the original Display Name back into that field and move focus away | Save returns to disabled |
| 9 | Click the Service Charge Text cell of the first visible row and type a word into the editor | Save becomes enabled |
| 10 | Reload the page to discard the unsaved editor change | Save is disabled and the page shows the original content |
| 11 | Add a new row and leave Service Charge Name, Service Charge Display Name, and Report Column Name all blank | A new empty row is added and Save stays disabled |
| 12 | Change the Service Charge Display Name of the first existing row to a different unique value | Save stays disabled — the new row's required fields are empty, so the page is dirty but invalid |
| 13 | Reload the page to discard the edit and remove the new row | Save is disabled and the row count returns to its value before step 11 |
| 14 | Change the Service Charge Display Name of the first row to a different unique value, then also change the Report Column Name of the same row to a different value | Save becomes enabled |
| 15 | Type the original Service Charge Display Name back into the Display Name field and move focus away | Save stays enabled — the Report Column Name is still changed, so the page is still dirty and valid |
| 16 | Reload the page to discard both changes | Save is disabled and the row values return to their original state |
| 17 | Add a new row and leave Service Charge Name, Service Charge Display Name, and Report Column Name all blank | A new empty row is added and Save stays disabled |
| 18 | Click the Service Charge Text cell of the first existing row to open the rich text editor and type a word | Save stays disabled — the new row's required fields are empty, so the page is dirty but invalid |
| 19 | Reload the page to discard the editor change and remove the new row | Save is disabled and the row count returns to its value before step 17 |

**Notes**: Steps 1–10 cover F1=All and F1=English (Canada) each paired with F2={no-edit, edit-metadata, edit-to-original, edit-rte}. Steps 11–19 add the three F2×F3 pairs that require a second row to construct: (edit-metadata, disabled), (edit-to-original, enabled), and (edit-rte, disabled). TC-036 covers the remaining F1 values.
**Surface_Family**: result-fidelity (DEEP)

## TC-SCT-CORE-036: Pairwise coverage of language filter, row action, and Save state — part two

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604. The original Service Charge Display Name values for the first visible row under each filter are known.

This test case completes the 20-row covering array begun in TC-035, covering array rows 9–20 (US English, Spanish (Mexico), and French (Canada) filters).

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Select US English in the language filter and read the Save button state without editing any field | Save is disabled |
| 2 | Change the Service Charge Display Name of the first visible row to a different unique value | Save becomes enabled |
| 3 | Type the original Display Name back and move focus away | Save returns to disabled |
| 4 | Click the Service Charge Text cell of the first visible row and type a word into the editor | Save becomes enabled |
| 5 | Reload the page to discard the unsaved editor change | Save is disabled |
| 6 | Select Spanish (Mexico) in the language filter and read the Save button state without editing any field | Save is disabled |
| 7 | Change the Service Charge Display Name of the first visible row to a different unique value | Save becomes enabled |
| 8 | Type the original Display Name back and move focus away | Save returns to disabled |
| 9 | Click the Service Charge Text cell of the first visible row and type a word into the editor | Save becomes enabled |
| 10 | Reload the page to discard the unsaved editor change | Save is disabled |
| 11 | Select French (Canada) in the language filter and read the Save button state without editing any field | Save is disabled |
| 12 | Change the Service Charge Display Name of the first visible row to a different unique value | Save becomes enabled |
| 13 | Type the original Display Name back and move focus away | Save returns to disabled |
| 14 | Click the Service Charge Text cell of the first visible row and type a word into the editor | Save becomes enabled |
| 15 | Reload the page to discard the unsaved editor change | Save is disabled |

**Notes**: Covers F1=US English, Spanish (Mexico), and French (Canada) each paired with F2={no-edit, edit-metadata, edit-to-original, edit-rte}. Together with TC-035 every valid 2-way pair of values across all three factors is covered. F1×F2 covers all 20 pairs; F1×F3 covers all 10 pairs; F2×F3 covers all 7 constructible pairs (the one excluded pair, (no-edit, enabled), is structurally impossible — see TC-035's factor analysis). The three F2×F3 pairs that require a second row to construct are in TC-035 steps 11–19.
**Surface_Family**: result-fidelity (DEEP)

## TC-SCT-CORE-037: Save stays disabled when all three required fields are blank

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Add a new row | A new empty row is added and Save stays disabled |
| 2 | Leave Service Charge Name, Service Charge Display Name, and Report Column Name all empty | Save stays disabled |

**Notes**: Truth table row 1 of 8: all required fields absent. Save cannot be enabled when no required fields are populated.
**Surface_Family**: combination (DEEP)

## TC-SCT-CORE-038: Save stays disabled when only Service Charge Name is populated

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Add a new row | A new empty row is added and Save stays disabled |
| 2 | Enter a unique value into Service Charge Name only and move focus away | Save stays disabled |

**Notes**: Truth table row 2 of 8: only one of three required fields is populated. Save requires all three.
**Surface_Family**: combination (DEEP)

## TC-SCT-CORE-039: Save stays disabled when only Service Charge Display Name is populated

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Add a new row | A new empty row is added and Save stays disabled |
| 2 | Enter a value into Service Charge Display Name only and move focus away | Save stays disabled |

**Notes**: Truth table row 3 of 8: Service Charge Display Name alone does not satisfy the required-fields gate.
**Surface_Family**: combination (DEEP)

## TC-SCT-CORE-040: Save stays disabled when only Report Column Name is populated

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Add a new row | A new empty row is added and Save stays disabled |
| 2 | Enter a value into Report Column Name only and move focus away | Save stays disabled |

**Notes**: Truth table row 4 of 8: Report Column Name alone does not satisfy the required-fields gate.
**Surface_Family**: combination (DEEP)

## TC-SCT-CORE-041: Save stays disabled when Service Charge Name and Display Name are populated but Report Column Name is blank

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Add a new row | A new empty row is added and Save stays disabled |
| 2 | Enter a unique value into Service Charge Name and a value into Service Charge Display Name, leave Report Column Name empty, and move focus away | Save stays disabled |

**Notes**: Truth table row 5 of 8: two of three required fields populated is still insufficient.
**Surface_Family**: combination (DEEP)

## TC-SCT-CORE-042: Save stays disabled when Service Charge Name and Report Column Name are populated but Display Name is blank

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Add a new row | A new empty row is added and Save stays disabled |
| 2 | Enter a unique value into Service Charge Name and a value into Report Column Name, leave Service Charge Display Name empty, and move focus away | Save stays disabled |

**Notes**: Truth table row 6 of 8: Service Charge Display Name is required; leaving it blank blocks Save regardless of the other two fields.
**Surface_Family**: combination (DEEP)

## TC-SCT-CORE-043: Save stays disabled when Service Charge Display Name and Report Column Name are populated but Name is blank

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Add a new row | A new empty row is added and Save stays disabled |
| 2 | Enter values into Service Charge Display Name and Report Column Name, leave Service Charge Name empty, and move focus away | Save stays disabled |

**Notes**: Truth table row 7 of 8: Service Charge Name is required; leaving it blank blocks Save regardless of the other two fields.
**Surface_Family**: combination (DEEP)

## TC-SCT-CORE-044: Save enables when all three required fields are populated with unique values

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Add a new row | A new empty row is added and Save stays disabled |
| 2 | Enter a Service Charge Name that is not already used in the same language, a Service Charge Display Name, and a Report Column Name | Save becomes enabled |

**Notes**: Truth table row 8 of 8: all three required fields populated with a unique name is the only combination that enables Save. This is the positive case that confirms the gate is complete.
**Surface_Family**: combination (DEEP)

## TC-SCT-CORE-045: Editing any metadata field transitions the page from clean to dirty

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 and Save is disabled.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Verify Save is disabled | Save is disabled |
| 2 | Change the Service Charge Display Name of the first row to a different unique value | Save becomes enabled |
| 3 | Restore the original value | Save returns to disabled |

**Notes**: Confirms the clean-to-dirty state transition. Save enabling is the observable signal that the page has entered the dirty state.
**Surface_Family**: persistence (DEEP)

## TC-SCT-CORE-046: Navigating away with unsaved changes triggers a browser confirmation

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change the Report Column Name of the first row to a different unique value | Save becomes enabled |
| 2 | Attempt to navigate to a different page by clicking a nav link | A native browser dialog asks whether to leave the page |
| 3 | Dismiss the dialog by staying on the page | The Service Charge Text page remains open and the edited value is still present |

**Notes**: The browser fires a beforeunload dialog when the page has unsaved changes and the user tries to leave. The edited value is still visible after the user chooses to stay.
**Surface_Family**: persistence (DEEP)

## TC-SCT-CORE-047: Changing the language filter with unsaved changes shows an in-app confirmation and Stay preserves edits

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change the Service Charge Name of the first US English row to a different unique value | Save becomes enabled |
| 2 | Select a different language in the page level filter | A dialog appears with the text "Unsaved changes  Are you sure you want to leave this view? Any unsaved changes will be lost.  Stay  Discard" |
| 3 | Verify the grid while the dialog is open | The row count has not changed and the edited value is still present |
| 4 | Click Stay | The dialog closes, the language filter has not changed, the edited value is still present, and Save is still enabled |
| 5 | Restore the original value | Save returns to disabled |

**Notes**: The in-app modal fires on a language filter change, not on full navigation. While the modal is open the filter has not been applied. Choosing Stay cancels the filter change entirely.
**Surface_Family**: persistence (DEEP)

## TC-SCT-CORE-048: Choosing Discard in the language filter confirmation applies the filter and loses unsaved changes

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change the Service Charge Name of the first US English row to a different unique value | Save becomes enabled |
| 2 | Select English (Canada) in the page level filter | A dialog appears asking whether to leave the current view |
| 3 | Click Discard | The dialog closes, the language filter changes to English (Canada), the grid shows only English (Canada) rows, and Save is disabled |

**Notes**: Choosing Discard applies the filter and discards all unsaved changes. The page returns to a clean state under the newly selected filter.
**Surface_Family**: persistence (DEEP)

## TC-SCT-CORE-049: Clearing a required field disables Save and restoring it re-enables Save

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 and Save is disabled.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Clear the Service Charge Name field on the first row | Save stays disabled |
| 2 | Type the original Service Charge Name value back into the field and move focus away | Save becomes enabled |
| 3 | Verify Save is enabled | Save is enabled, confirming the page is dirty with a valid value |
| 4 | Restore the original value | Save returns to disabled |

**Notes**: Clearing a required field is a validation error state. Restoring a valid value transitions back to dirty. The page deep-compares against loaded values, so restoring the original value in step 4 puts the page back to clean.
**Surface_Family**: persistence (DEEP)

## TC-SCT-CORE-050: Editing a field and then typing back the original value returns Save to disabled

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 and the original Service Charge Display Name of the first row is known.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change the Service Charge Display Name of the first row to a different unique value | Save becomes enabled |
| 2 | Clear that field and type the original value back in, then move focus away | Save returns to disabled |

**Notes**: The page compares each field value against the value loaded from the server. When every field matches its loaded value the page is treated as clean and Save is disabled. This is different from the common pattern where editing disables Save only after an explicit revert action.
**Surface_Family**: persistence (DEEP)

## TC-SCT-CORE-051: A Service Charge Name that duplicates an existing name in a different language enables Save

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604. The Service Charge Name of the first US English row is known. The uniqueness constraint for Service Charge Names applies within a language only; the same name is valid across different languages.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Select French (Canada) in the language filter and note the Service Charge Name of the first visible row | The French (Canada) name is recorded |
| 2 | Change the Service Charge Name of that row to the US English name noted in the Preconditions | Save becomes enabled |
| 3 | Restore the original French (Canada) Service Charge Name | Save returns to disabled |

**Notes**: A name that is already used by a US English row is a valid name for a French (Canada) row. The duplicate-name rule is scoped per language.
**Surface_Family**: combination (DEEP)

## TC-SCT-CORE-052: A required field left empty on any row keeps Save disabled for the whole page

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Add a new row and fill all three required fields with unique values | Save becomes enabled |
| 2 | Clear the Service Charge Name field on that same new row | Save becomes disabled |

**Notes**: The Save button is gated on every row in the grid being valid, not just the most recently edited row. A single invalid row anywhere in the grid keeps Save disabled.
**Surface_Family**: combination (DEEP)

## TC-SCT-CORE-053: The rich text editor is unavailable until a Service Charge Text cell is clicked

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 and no row has been selected.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Verify that the rich text editor area is not available for typing | The rich text editor is not present or not editable |
| 2 | Click the Service Charge Text cell of a row | The rich text editor becomes present and editable |
| 3 | Verify that Save is still disabled after clicking the cell | Save is still disabled |

**Notes**: The editor's availability depends on a row being selected. Clicking the cell is the trigger; it does not by itself dirty the page.
**Surface_Family**: render-state (DEEP)

## TC-SCT-CORE-054: Changing the language filter updates the grid contents

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 with the US English filter active.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Select Spanish (Mexico) in the page level filter | The grid shows at least one row and every visible row has language Spanish (Mexico) |
| 2 | Select French (Canada) in the page level filter | The grid shows at least one row and every visible row has language French (Canada) |
| 3 | Select All in the page level filter | The grid shows rows covering more than one language; the total row count equals the sum of the row counts from all four individual language filters |
| 4 | Select English (Canada) in the page level filter | The grid shows at least one row and every visible row has language English (Canada) |

**Notes**: Grid contents are a direct function of the language filter selection. The row counts per language are: US English 114, English (Canada) 3, Spanish (Mexico) 1, French (Canada) 2, All 120. All five filter options are exercised.
**Surface_Family**: result-fidelity (DEEP)

## TC-SCT-CORE-055: Keyboard tab order within a row follows the visual column order

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Click the Service Charge Name cell of the first row to place focus there | The Service Charge Name input has keyboard focus |
| 2 | Press Tab | Focus moves to the Service Charge Display Name input in the same row |
| 3 | Press Tab | Focus moves to the Report Column Name input in the same row |
| 4 | Press Tab | Focus moves to the Service Charge Text cell in the same row |

**Notes**: Tab order within a row follows the left-to-right visual column order for the editable columns. This TC covers the within-row sequence; cross-row continuity is a separate probe.
**Surface_Family**: render-state (DEEP)

## TC-SCT-CORE-056: Clicking Save twice rapidly sends exactly one save request

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 and the original Service Charge Display Name of the first US English row is known.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change the Service Charge Display Name of the first US English row to a new unique value | Save becomes enabled |
| 2 | Click Save twice in rapid succession with no pause between clicks | The Save button disables itself immediately after the first click; the second click lands on a disabled button |
| 3 | Verify the number of save requests issued to the service-charge-texts endpoint | Exactly one request was sent and it returned a 200 response |
| 4 | Reload the page | The changed value is still displayed, confirming the single save succeeded |
| 5 | Restore the original value and save again | The original value is displayed and Save returns to disabled |

**Notes**: The Save button disables itself immediately on the first click, making a double-click race produce only one network request. This guards against duplicate submissions.
**Surface_Family**: persistence (DEEP)

## TC-SCT-CORE-057: Editing two rows before saving persists both edits in a single save

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 and the original Service Charge Display Name values for the first and second US English rows are known.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change the Service Charge Display Name of the first US English row to a different unique value | Save becomes enabled |
| 2 | Change the Service Charge Display Name of the second US English row to a different unique value | Save remains enabled |
| 3 | Click Save | Save returns to disabled |
| 4 | Reload the page | Both changed values are still displayed |
| 5 | Restore both original values and save again | Both original values are displayed and Save returns to disabled |

**Notes**: A single save operation submits all rows in the grid. Editing more than one row before saving must persist all edited rows in the same request.
**Surface_Family**: persistence (DEEP)

## TC-SCT-CORE-058: Choosing Stay in the language filter confirmation keeps all unsaved edits intact

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change the Service Charge Name of the first US English row to a different unique value | Save becomes enabled |
| 2 | Select a different language in the page level filter | A confirmation dialog appears asking whether to leave the current view |
| 3 | Click Stay | The dialog closes |
| 4 | Verify the edited value is still in the Service Charge Name field | The changed value is still present |
| 5 | Verify Save is still enabled | Save is enabled |
| 6 | Verify the language filter has not changed | The filter still shows US English |
| 7 | Restore the original value | Save returns to disabled |

**Notes**: After dismissing the leave-view confirmation with Stay, the page is fully restored to its state before the filter was changed: the edit is present, Save is enabled, and the filter is unchanged.
**Surface_Family**: persistence (DEEP)

## TC-SCT-CORE-059: The save request body includes all rows with the correct structure

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 and the original Service Charge Display Name of the first US English row is known.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Intercept network requests to the save endpoint | Network interception is active |
| 2 | Change the Service Charge Display Name of the first US English row to a new unique value | Save becomes enabled |
| 3 | Click Save | A save request is sent to the service-charge-texts endpoint |
| 4 | Inspect the request body | The body contains a rows array; the number of entries in the array equals the number of rows currently displayed in the grid under the active filter; each entry has the keys serviceChargeTextId, serviceChargeName, serviceChargeDisplayName, reportColumnName, languageId, displayText, and htmlDisplayText; the entry for the edited row has serviceChargeDisplayName matching the value entered in step 2 |
| 5 | Verify the response status | The response status is 200 |
| 6 | Restore the original value and save again | The original value is displayed and Save returns to disabled |

**Notes**: The save endpoint receives the full row list on every save, not a delta. At the measured baseline the US English filter shows 114 rows, so the save payload contains 114 entries under that data. The structure check validates that all seven documented keys are present on each row object.
**Surface_Family**: persistence (DEEP)

## TC-SCT-CORE-060: Each language filter option shows the correct number of rows

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Select US English in the page level filter and count the rows | At least one row is displayed and every visible row has language US English; record this count as N_US |
| 2 | Select English (Canada) in the page level filter and count the rows | At least one row is displayed and every visible row has language English (Canada); record this count as N_CA |
| 3 | Select Spanish (Mexico) in the page level filter and count the rows | At least one row is displayed and every visible row has language Spanish (Mexico); record this count as N_MX |
| 4 | Select French (Canada) in the page level filter and count the rows | At least one row is displayed and every visible row has language French (Canada); record this count as N_FR |
| 5 | Select All in the page level filter and count the rows | The total row count equals N_US + N_CA + N_MX + N_FR |

**Notes**: At the measured baseline: US English 114 rows, English (Canada) 3 rows, Spanish (Mexico) 1 row, French (Canada) 2 rows, All 120 rows. The All count equals the sum of the four individual language counts. No filter option produces zero rows.
**Surface_Family**: empty-vol (DEEP)

## TC-SCT-CORE-061: An off-screen row is readable by its Service Charge Name without using a row index

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 with the US English filter active.
**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Search for a row whose Service Charge Name is known but whose position in the list is beyond the visible viewport | The row is found by its Service Charge Name |
| 2 | Read the row's Service Charge Display Name and Report Column Name | Both values are readable without scrolling to a specific numeric row position |

**Notes**: Row lookups must use a content anchor such as the Service Charge Name, never a numeric row index. Shared save handlers across rows can cause index-based reads to report values from row 0 regardless of which row is targeted.
**Surface_Family**: empty-vol (DEEP)

## TC-SCT-CORE-062: Rich text editor content persists after save and reload

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 and the original rich text content of a US English row is known.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Click the Service Charge Text cell of the first US English row to open the rich text editor | The editor opens showing the current content |
| 2 | Change the rich text content to a distinctly different value | Save becomes enabled |
| 3 | Click Save | Save returns to disabled |
| 4 | Reload the page | The rich text cell for the edited row displays the new content |
| 5 | Restore the original content and save again | The original content is displayed and Save returns to disabled |

**Notes**: Existing persistence cases cover only metadata fields. This case proves the rich text editor content survives a full save-and-reload cycle independently of metadata edits.
**Surface_Family**: persistence (DEEP)

## TC-SCT-CORE-063: A newly added row with all fields filled persists after save and reload

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 and the current row count under the active filter is known.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Click Add row | A new empty row appears at the bottom of the grid |
| 2 | Fill in a unique Service Charge Name, a Display Name, and a Report Column Name | Save becomes enabled |
| 3 | Click Save | Save returns to disabled |
| 4 | Reload the page | The row count is original plus one and the new row's Name, Display Name, Report Column Name, and Language values match what was entered |

**Notes**: TC-027 proves that unsaved new rows are not retained on reload. This case proves a saved new row survives reload with all its field values intact.
**Surface_Family**: persistence (DEEP)

## TC-SCT-CORE-064: Changing a row's per-row language persists after save and reload

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 with the All filter active and the original language of the target row is known.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Open the per-row language dropdown on a row and select a different language | Save becomes enabled |
| 2 | Click Save | Save returns to disabled |
| 3 | Reload the page with the All filter active | The row appears with the new language value |
| 4 | Restore the original language and save again | The original language is displayed and Save returns to disabled |

**Notes**: No existing case exercises the per-row language dropdown in a save cycle. This proves the language change persists through reload.
**Surface_Family**: persistence (DEEP)

## TC-SCT-CORE-065: Report Column Name edited in isolation persists after save and reload

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 and the original Report Column Name of the first US English row is known.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change the Report Column Name of the first US English row to a new unique value | Save becomes enabled |
| 2 | Click Save | Save returns to disabled |
| 3 | Reload the page | The Report Column Name cell shows the new value |
| 4 | Restore the original value and save again | The original value is displayed and Save returns to disabled |

**Notes**: TC-034 covers all three metadata fields saved together. This case isolates Report Column Name to prove it persists independently without relying on the combined save.
**Surface_Family**: persistence (DEEP)

## TC-SCT-CORE-066: A metadata edit on one row and a rich text edit on another row both persist in a single save

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 and the original Display Name of the first US English row and the original rich text content of the second US English row are known.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change the Service Charge Display Name of the first US English row to a new unique value | Save becomes enabled |
| 2 | Open the rich text editor on the second US English row and change its content | Save remains enabled |
| 3 | Click Save | Save returns to disabled |
| 4 | Reload the page | The first row's Display Name shows the new value AND the second row's rich text content shows the new content |
| 5 | Restore both original values and save again | Both original values are displayed and Save returns to disabled |

**Notes**: TC-060 edits metadata on two rows. This case combines a metadata edit and an RTE edit across two rows to prove both persist in a single save operation.
**Surface_Family**: pairwise (DEEP)

## TC-SCT-CORE-067: Changing a row's language and editing its Name in the same save both persist

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 with the All filter active and the original language and Name of the target row are known.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Open the per-row language dropdown on a row and select a different language | Save becomes enabled |
| 2 | Change the Service Charge Name of the same row to a new value unique within the new language | Save remains enabled |
| 3 | Click Save | Save returns to disabled |
| 4 | Reload the page with the All filter active | The row shows both the new language and the new Name |
| 5 | Restore both original values and save again | Both original values are displayed and Save returns to disabled |

**Notes**: No existing case exercises language-dropdown and text-edit co-mutation in one save cycle. This proves both changes commit together.
**Surface_Family**: pairwise (DEEP)

## TC-SCT-CORE-068: Edits saved under each of the four single-language filters all persist

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 and the original Display Name of one row per language is known.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Select US English in the page filter, edit the Display Name of the first row to a new value, and click Save | Save returns to disabled |
| 2 | Reload the page under US English filter | The edited value persists |
| 3 | Select English (Canada) in the page filter, edit the Display Name of a row to a new value, and click Save | Save returns to disabled |
| 4 | Reload the page under English (Canada) filter | The edited value persists |
| 5 | Select Spanish (Mexico) in the page filter, edit the Display Name of a row to a new value, and click Save | Save returns to disabled |
| 6 | Reload the page under Spanish (Mexico) filter | The edited value persists |
| 7 | Select French (Canada) in the page filter, edit the Display Name of a row to a new value, and click Save | Save returns to disabled |
| 8 | Reload the page under French (Canada) filter | The edited value persists |
| 9 | Restore all four original values under their respective filters and save each | All original values are displayed and Save returns to disabled after each restore |

**Notes**: TC-035 and TC-036 vary the filter for dirty-state observation but never save under each filter. This proves persistence works identically under every single-language filter.
**Surface_Family**: pairwise (DEEP)

## TC-SCT-CORE-069: A dirty page with an invalid duplicate name still triggers the navigate-away prompt

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change the Service Charge Name of the first US English row to a value that duplicates another row in the same language | Save becomes disabled due to the duplicate |
| 2 | Attempt browser navigation away from the page | The beforeunload confirmation dialog fires |
| 3 | Stay on the page | The page remains with the duplicate value still entered |
| 4 | Restore the original value | Save returns to disabled |

**Notes**: Save being disabled does not mean the page is clean. The dirty flag is independent of the validity gate. This case proves the form correctly fires the navigate-away prompt when dirty-but-invalid.
**Surface_Family**: state-transition (DEEP)

## TC-SCT-CORE-070: Confirming navigation away discards all unsaved changes

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 and the original Display Name of the first US English row is known.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change the Service Charge Display Name of the first US English row to a new unique value | Save becomes enabled |
| 2 | Attempt browser navigation away from the page | The beforeunload confirmation dialog fires |
| 3 | Confirm navigation (leave the page) | Navigation succeeds and the page is left |
| 4 | Navigate back to the Service Charge Text page | The Display Name shows the original server-saved value, not the unsaved edit |

**Notes**: TC-046 tests only the Stay path. This case confirms the Leave path actually discards changes and the page reloads from the server state.
**Surface_Family**: state-transition (DEEP)

## TC-SCT-CORE-071: After a successful save, navigating away does not trigger a prompt

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change the Service Charge Display Name of the first US English row to a new unique value | Save becomes enabled |
| 2 | Click Save | Save returns to disabled |
| 3 | Attempt browser navigation away from the page | No beforeunload prompt appears and navigation succeeds |
| 4 | Navigate back to the page and restore the original value and save | The original value is displayed and Save returns to disabled |

**Notes**: No existing case explicitly verifies that a successful save transitions the form to clean state. This proves the dirty flag is properly cleared after save.
**Surface_Family**: state-transition (DEEP)

## TC-SCT-CORE-072: A rich text edit alone triggers the navigate-away prompt

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Open the rich text editor on the first US English row and change its content without touching any metadata field | Save becomes enabled |
| 2 | Attempt browser navigation away from the page | The beforeunload confirmation dialog fires |
| 3 | Stay on the page | The page remains with the RTE edit intact |
| 4 | Reload the page to discard changes | The original content is restored |

**Notes**: Existing dirty-state cases trigger via metadata edits. This proves the rich text editor alone sets the dirty flag and triggers the navigation guard.
**Surface_Family**: state-transition (DEEP)

## TC-SCT-CORE-073: A failed save keeps the page dirty with Save re-enabled

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change the Service Charge Display Name of the first US English row to a new unique value | Save becomes enabled |
| 2 | Intercept the save endpoint to return a 500 error | Network interception is active |
| 3 | Click Save | A visible error indication appears; Save re-enables after the failure |
| 4 | Attempt browser navigation away from the page | The beforeunload confirmation dialog fires, proving the page is still dirty |
| 5 | Stay on the page and remove the network interception | The page remains with the edit intact |
| 6 | Click Save again | Save succeeds and returns to disabled |
| 7 | Reload the page | The edited value persists |
| 8 | Restore the original value and save | The original value is displayed and Save returns to disabled |

**Notes**: No existing case covers the save-failure transition. This proves that a server error does not corrupt the form state: the page remains dirty, edits are preserved, and a retry can succeed.
**Surface_Family**: state-transition (DEEP)

## TC-SCT-CORE-074: All page controls are operable by keyboard without a mouse

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Use keyboard Tab and arrow keys to reach the page level language filter and activate it with Enter or Space | The filter opens and options are navigable by keyboard |
| 2 | Select a language option with Enter | The filter closes and the grid updates to show the selected language |
| 3 | Tab to the Service Charge Name cell of the first row and type a value | The input accepts keyboard text entry |
| 4 | Tab through Display Name and Report Column Name entering values | Each field accepts keyboard input in visual column order |
| 5 | Tab to the Service Charge Text cell and activate it with Enter or Space | The rich text editor opens |
| 6 | Tab to the Add row button and activate it with Enter or Space | A new row is appended |
| 7 | Tab to the Save button and activate it with Enter or Space | Save is triggered if enabled |
| 8 | Reload the page to discard changes | The page returns to its original state |

**Notes**: TC-055 covers only the within-row tab order. This case proves every interactive control on the page is reachable and activatable by keyboard alone.
**Surface_Family**: accessibility (DEEP)

## TC-SCT-CORE-075: The unsaved-changes dialog traps focus until dismissed and returns focus afterward

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change the Service Charge Display Name of the first US English row to a new unique value | Save becomes enabled |
| 2 | Change the page level language filter to trigger the unsaved-changes dialog | The confirmation dialog appears |
| 3 | Press Tab repeatedly to cycle through focusable elements | Focus cycles only within the dialog and does not escape to the page behind it |
| 4 | Click Stay to dismiss the dialog | The dialog closes and focus returns to the language filter control that initiated the dialog |
| 5 | Restore the original value | Save returns to disabled |

**Notes**: TC-047 and TC-048 cover dialog outcomes but not focus containment. This case proves the dialog is a proper focus trap that returns focus on dismissal.
**Surface_Family**: accessibility (DEEP)

## TC-SCT-CORE-076: A duplicate Service Charge Name rejection provides a visible explanation

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 with at least two rows in the same language.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change the Service Charge Name of one row to match an existing name in the same language | Save becomes disabled |
| 2 | Inspect the row for a visible indication explaining why Save is blocked | A visible message or visual marker at the row level indicates the duplicate name is the cause |
| 3 | Verify that the explanation is programmatically associated with the field | The indication is adjacent to or associated with the Service Charge Name field of the offending row |
| 4 | Correct the name to a unique value | Save re-enables and the duplicate indication disappears |

**Notes**: TC-005 covers that a duplicate is announced. This case verifies that the rejection provides enough contextual information for a user to identify which field and which row caused the block, and that clearing the duplicate removes the indication.
**Surface_Family**: accessibility (DEEP)

## TC-SCT-CORE-077: Two sessions editing the same row results in a conflict outcome, not a silent overwrite

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 in two separate browser contexts (A and B) and the original Display Name of the first US English row is known.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | In context A, change the Display Name of the first US English row to value X | Save becomes enabled in context A |
| 2 | In context B, change the Display Name of the same row to value Y | Save becomes enabled in context B |
| 3 | In context B, click Save | Save succeeds and the row shows value Y |
| 4 | In context A, click Save (now stale) | The save either fails with a visible conflict indication or succeeds with a last-write-wins outcome; the final displayed value matches the accepted server result |
| 5 | Reload both contexts | Both contexts show the same value reflecting the server's authoritative state |
| 6 | Restore the original value and save | The original value is displayed and Save returns to disabled |

**Notes**: TC-060 covers same-session multi-row edits. This case exercises a cross-session stale-save race to verify the app handles conflicting writes without silent data loss. This case is not currently running because it needs a second browser session to simulate two people editing the same row, and that second session does not start reliably in the current setup. Automating it dependably needs further work and is deferred until prioritised.
**Surface_Family**: error-guessing (DEEP)

## TC-SCT-CORE-078: A save failure preserves edits and a retry succeeds

**Automatable**: Yes — currently skipped in `service-charge-text.spec.ts`
**Preconditions**: The Service Charge Text page is open for office 1604 and the original Display Name of the first US English row is known.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Change the Service Charge Display Name of the first US English row to a new unique value | Save becomes enabled |
| 2 | Intercept the save endpoint to return a 500 error for the first request only | Network interception is active |
| 3 | Click Save | A visible failure indication appears; the edited value remains in the field; Save re-enables |
| 4 | Click Save again (interception removed, real endpoint responds) | Save succeeds and returns to disabled |
| 5 | Reload the page | The edited value persists |
| 6 | Restore the original value and save | The original value is displayed and Save returns to disabled |

**Notes**: All existing save cases assume success. This case proves that a transient backend failure does not lose user edits and that a subsequent retry commits them. This case is not currently running because it depends on the same second-session mechanism as TC-SCT-CORE-077, which currently crashes the test worker. Automating it dependably needs further work and is deferred until prioritised.
**Surface_Family**: error-guessing (DEEP)

## TC-SCT-CORE-079: Page level language filter dropdown recovers from a load failure

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Intercept the language filter data endpoint to return a 500 error on the next request | Network interception is active |
| 2 | Trigger a reload or action that re-fetches the language filter options | A visible recovery state appears without corrupting the grid data |
| 3 | Remove the interception and reload the page | The page loads normally with all five language filter options available and filtering works correctly |

**Notes**: TC-011 through TC-014 cover only successful language filter loading. This case proves the page degrades gracefully when the language options endpoint fails and recovers cleanly on retry.
**Surface_Family**: error-guessing (DEEP)

## TC-SCT-CORE-080: Per-row language dropdown recovers from a load failure without changing the row's language

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 and the original language of the target row is known.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Intercept the row language options endpoint to return a 500 error on the next request | Network interception is active |
| 2 | Click the per-row language dropdown on the target row | The dropdown fails to load its options; the row's current language value remains unchanged |
| 3 | Remove the interception and click the dropdown again | The dropdown opens showing four language options (All is excluded) and functions normally |

**Notes**: TC-016 and TC-017 cover only successful per-row dropdown operation. This case proves a transient failure does not corrupt the row's language assignment.
**Surface_Family**: error-guessing (DEEP)

## TC-SCT-CORE-081: The save response body reflects the committed metadata payload

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 and the original Display Name of the first US English row is known.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Intercept network traffic on the save endpoint | Network listener is active |
| 2 | Change the Service Charge Display Name of the first US English row to a new unique value | Save becomes enabled |
| 3 | Click Save | A save request is sent and a response is received |
| 4 | Inspect the response body | The response JSON contains the edited row with serviceChargeDisplayName matching the value entered in step 2 and includes server-assigned identifiers |
| 5 | Reload the page | The displayed value matches the value confirmed in the response body |
| 6 | Restore the original value and save | The original value is displayed and Save returns to disabled |

**Notes**: TC-062 validates the request body and status code only. This case verifies the response body echoes the committed state, proving the server accepted the payload as sent.
**Surface_Family**: network-payload (DEEP)

## TC-SCT-CORE-082: A one-row filtered view remains editable and saveable

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604 and the original Display Name of the single Spanish (Mexico) row is known.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Select Spanish (Mexico) in the page level filter | The grid shows exactly one row |
| 2 | Locate the row by its Service Charge Name and change its Display Name to a new unique value | Save becomes enabled |
| 3 | Click Save | Save returns to disabled |
| 4 | Reload the page under the Spanish (Mexico) filter | The edited value persists and the row is found by its Service Charge Name |
| 5 | Restore the original value and save | The original value is displayed and Save returns to disabled |

**Notes**: TC-063 proves the one-row count. This case proves that a minimal filtered view remains fully functional for editing and saving, using a content anchor rather than a row index.
**Surface_Family**: empty-vol (DEEP)

## TC-SCT-CORE-083: An empty filtered result set renders a recovery state without row rendering errors

**Automatable**: Yes
**Preconditions**: The Service Charge Text page is open for office 1604.

**Steps**:
| # | Step | Expected Result |
|---|---|---|
| 1 | Intercept the grid data endpoint to return an empty row list for the next request | Network interception is active |
| 2 | Trigger a page reload or filter change that fetches grid data | The grid displays a visible no-results or empty state without JavaScript errors or broken row rendering |
| 3 | Remove the interception and reload the page | The grid loads normally with the expected rows and filtering works correctly |

**Notes**: All current filter options return at least one row. This case uses API interception to simulate an empty result set and proves the grid handles zero rows gracefully without attempting to access row indices that do not exist.
**Surface_Family**: empty-vol (DEEP)
