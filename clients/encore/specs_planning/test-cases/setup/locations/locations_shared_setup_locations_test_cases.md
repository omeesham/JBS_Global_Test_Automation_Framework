# Location Shared Setup Locations Test Cases
**Module**: locations | **Total**: 44 (30 + 14) | **Status**: Automated | **Updated**: 

---

## MCP_VERIFICATION_LOG

| Field | Value |
|-------|-------|
| Date | |
| URL | https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location |
| Office/Entity | 1604 (Parker Palm Springs) |
| Total fields found | 5 (table: 2 static text cells, 2 checkboxes, 1 button per data row; plus Add button) |
| Total fields tested (edit+save) | 3 (Shares Inventory toggle, Add location flow, Delete row) |
| Save dialog | Yes -- left-panel Save triggers alertdialog "Save Changes" with Save/Cancel buttons |
| Column headers | Local Office, Local Office Name, Primary Office, Shares Inventory, (empty actions) |
| Dropdown options | N/A -- no dropdowns in this tab |
| Cascade behaviors | Checking dialog row checkbox enables Select button; Add enables Save; Delete enables Save |
| Input attribute types | N/A -- no text inputs in main tab; Dialog search: placeholder="Search by Location Name, Number" |
| Validation error patterns | N/A -- no validation errors observed |
| Input masks/formatting | N/A |
| Filtering mechanism | Dialog search: filters 4614 rows by text match on Local Office number or name |
| API loading | Tab content loads instantly on tab click |
| Strict mode risks | Dialog has 4614 rows with individual checkboxes -- use search to reduce before selecting |
| Form structure | Save button: left-panel (shared with all tabs), not inside tabpanel |
| Dialog side effects | Cancel=safe (no state change), Close(X)=safe, Select=adds row to table + enables Save |
| API calls | Tab switch: no separate API call observed |
| Post-reload timing | Table data loads instantly with tab switch |
| Readiness signal | Wait for table data-testid="location-settings-table-shared-setup" to be visible |
| Sequential interactions | Add->Delete->Save = dirty state remains (Save enabled) |
| Boundary behaviors | N/A -- no text/numeric inputs in main tab |
| Dialog details | Heading: "Change Local Office" (h2), 3-col table (checkbox, Local Office, Local Office Name), 4614 rows, Select/Cancel/Close buttons |

---

## FIELD INVENTORY

**Main Table** (5 columns -- Location 1604 self-row):

| Column | Element | State (self-row) | Value (1604) |
|---|---|---|---|
| Local Office | static text | display-only | 1604 |
| Local Office Name | static text | display-only | Parker Palm Springs |
| Primary Office | checkbox (button role="checkbox") | **disabled + checked** | aria-checked="true" |
| Shares Inventory | checkbox (button role="checkbox") | **editable** | aria-checked="false" |
| (Actions) | button "Delete" | **disabled** for self | disabled=true |

**Non-Self Row State** (verified by adding location 0000):

| Column | State |
|---|---|
| Local Office | static text (display-only) |
| Local Office Name | static text (display-only) |
| Primary Office | **disabled + unchecked** |
| Shares Inventory | **editable + checked** (defaults to true) |
| Delete | **enabled** |

**Add Button**: Inside last table row; opens "Change Local Office" dialog

**Change Local Office Dialog** (opened via Add):

| Element | Type | State | Notes |
|---|---|---|---|
| Heading | h2 | static | Text: "Change Local Office" |
| Search input | text input | editable | placeholder="Search by Location Name, Number" |
| Results table | 3-col table (checkbox, Local Office, Local Office Name) | 4614 rows | Filterable by search |
| Row checkbox | button role="checkbox" aria-label="Select row" | per-row | Single-select by checkbox |
| Select | button | disabled until row checked | Adds selected location to main table |
| Cancel | button | always enabled | Closes dialog, no state change |
| Close (X) | button | always enabled | Closes dialog, no state change |

**Save Flow**: Left-panel Save -- "Save Changes" alert dialog with Save/Cancel. No dedicated tab Save.
**Delete Flow**: Instant removal, **no confirmation dialog**.

**Key data-testid attributes**:
- Tab: location-settings-sub-tab-shared-setup-locations
- Table: location-settings-table-shared-setup

---

## TC-LOC-SSL-001: Verify tab loads with table and Add button
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Steps**:
1. Navigate to Setup > Location > 1604 and click the "Shared Setup Locations" tab. Verify the tab activates and the panel is visible.
2. Verify the Shared Setup Locations table is visible.
3. Verify the "Add" button is visible in the last table row and is enabled.

**Expected**: Tab renders table with 5-column layout and Add button at bottom
**Data**: office=1604

---

## TC-LOC-SSL-002: Verify column headers
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Navigate to the "Shared Setup Locations" tab and verify it loads.
2. Inspect the column headers from left to right and verify the order is: "Local Office", "Local Office Name", "Primary Office", "Shares Inventory", and one empty actions column.

**Expected**: 5 columns with headers "Local Office", "Local Office Name", "Primary Office", "Shares Inventory", and one empty header
**Data**: office=1604

---

## TC-LOC-SSL-003: Verify self-location row default state
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Navigate to the "Shared Setup Locations" tab and verify it loads.
2. Locate the first data row and verify the cells show "1604" and "Parker Palm Springs".
3. Verify the "Primary Office" checkbox is checked and disabled.
4. Verify the "Shares Inventory" checkbox is unchecked and editable.
5. Verify the "Delete" button is disabled.

**Expected**: Self-location (1604) row: Primary Office locked-checked, Shares Inventory editable-unchecked, Delete disabled
**Data**: office=1604

---

## TC-LOC-SSL-004: Primary Office is read-only for self-location
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Navigate to the "Shared Setup Locations" tab and verify it loads.
2. Attempt to click the "Primary Office" checkbox in the row for office 1604 and verify no interaction occurs because the checkbox is disabled.
3. Verify the checkbox state is unchanged and still checked.

**Expected**: Primary Office cannot be unchecked for the self-location; clicking it has no effect because the checkbox is disabled
**Data**: office=1604

---

## TC-LOC-SSL-005: Delete button disabled for self-location
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Navigate to the "Shared Setup Locations" tab and verify it loads.
2. Inspect the "Delete" button for row 1604 and verify it is disabled.
3. Attempt to click "Delete" and verify no action occurs.

**Expected**: Delete button is disabled for self-location; self-row cannot be removed
**Data**: office=1604

---

## TC-LOC-SSL-006: Shares Inventory toggle ON enables Save
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Preconditions**: Shares Inventory is unchecked for 1604

**Steps**:
1. Navigate to the "Shared Setup Locations" tab and verify it loads with the left-panel "Save" button disabled.
2. Click the "Shares Inventory" checkbox in the row for office 1604 and verify it becomes checked.
3. Observe the left-panel "Save" button and verify it becomes enabled.

**Expected**: Toggling Shares Inventory marks form as dirty, enables left-panel Save
**Data**: office=1604
**Cleanup**: Uncheck **Shares Inventory** to revert. If Save still enabled, navigate away and accept unsaved changes dialog or reload page.

---

## TC-LOC-SSL-007: Reverting Shares Inventory disables Save
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Preconditions**: Shares Inventory is unchecked for 1604

**Steps**:
1. Navigate to the "Shared Setup Locations" tab and verify it loads.
2. Click "Shares Inventory" and verify it becomes checked with "Save" enabled.
3. Click "Shares Inventory" again and verify it becomes unchecked, reverting to the original state.
4. Observe the "Save" button state and verify it is disabled again.

**Expected**: Reverting to original state removes dirty flag, Save disables
**Data**: office=1604

---

## TC-LOC-SSL-008: Shares Inventory save and persist
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Preconditions**: Shares Inventory is unchecked for 1604

**Steps**:
1. Navigate to the "Shared Setup Locations" tab and verify it loads.
2. Click "Shares Inventory" and verify it becomes checked.
3. Click the left-panel "Save" and verify the "Save Changes" dialog appears with "Save" and "Cancel" buttons.
4. Click "Save" in the dialog and verify the data is saved and the dialog closes.
5. Reload the page and navigate back to the "Shared Setup Locations" tab.
6. Verify the "Shares Inventory" checkbox for row 1604 is still checked.

**Expected**: Checked state persists after save + reload
**Data**: office=1604
**Cleanup**: Uncheck Shares Inventory -> Save -> confirm dialog -> verify unchecked after reload

---

## TC-LOC-SSL-009: Add button opens Change Local Office dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Navigate to the "Shared Setup Locations" tab and verify it loads.
2. Click "Add" in the last table row and verify the "Change Local Office" dialog opens.
3. Verify the dialog heading reads "Change Local Office".
4. Verify the search input with placeholder "Search by Location Name, Number" is present.
5. Verify the results table has 3 columns (checkbox, Local Office, Local Office Name) and is visible with rows.
6. Verify the "Select" button is disabled because no row is selected.
7. Verify the "Cancel" button is enabled.
8. Click "Cancel" and verify the dialog closes with no changes to the main table.

**Expected**: Add opens "Change Local Office" dialog with search, results table, Select/Cancel buttons. Cancel closes without changes.
**Data**: office=1604

---

## TC-LOC-SSL-010: Dialog search filters by location name
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Navigate to the "Shared Setup Locations" tab, click "Add", and verify the dialog opens with a large number of rows.
2. Type "Miami" in the search input and verify the results filter to rows containing "Miami" in the location name.
3. Verify the filtered rows show matching names such as "Miami Marriott Biscayne Bay".
4. Click "Cancel" to close.

**Expected**: Search input filters results table by location name substring match
**Data**: office=1604, search="Miami"

---

## TC-LOC-SSL-011: Dialog search filters by location number
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Navigate to the "Shared Setup Locations" tab, click "Add", and verify the dialog opens.
2. Type "990002" in the search input and verify the results filter to 1 row showing "990002 - Test Server1".
3. Verify the exact match is shown.
4. Click "Cancel" to close.

**Expected**: Search input filters results table by location number match
**Data**: office=1604, search="990002"

---

## TC-LOC-SSL-012: Dialog row selection enables Select button
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Negative |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Navigate to the "Shared Setup Locations" tab, click "Add", and verify the dialog opens.
2. Verify the "Select" button is disabled because no row is selected.
3. Search for "1099" and verify 1 result row appears.
4. Click the row checkbox and verify it becomes checked.
5. Verify the "Select" button is now enabled.

**Expected**: Selecting a row checkbox enables the Select button
**Data**: office=1604, search="1099"
**Cleanup**: Click Cancel to close dialog

---

## TC-LOC-SSL-013: Add location via dialog Select button
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Navigate to the "Shared Setup Locations" tab and verify only the self-row for office 1604 is present.
2. Click "Add" and verify the dialog opens.
3. Search for a location such as "1099" and verify the results filter.
4. Check the row checkbox and verify the "Select" button becomes enabled.
5. Click "Select" and verify the dialog closes with a new row appearing in the table.
6. Verify the new row shows the correct Local Office number and Local Office Name.
7. Verify the left-panel "Save" button is enabled because there are unsaved changes.

**Expected**: Selecting a location and clicking Select adds it to the table and Save becomes enabled
**Data**: office=1604, added=1099
**Cleanup**: Click Delete on added row -> navigate away and discard changes or reload

---

## TC-LOC-SSL-014: Non-self row state verification
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Preconditions**: A non-self location has been added

**Steps**:
1. Inspect the added non-self row in the table.
2. Verify the "Primary Office" checkbox is unchecked and disabled.
3. Verify the "Shares Inventory" checkbox is checked and editable.
4. Verify the "Delete" button is enabled.

**Expected**: Non-self rows: Primary Office disabled+unchecked, Shares Inventory checked+editable, Delete enabled
**Data**: office=1604, added row
**Cleanup**: Delete added row, discard changes

---

## TC-LOC-SSL-015: Delete non-self row (instant, no confirmation)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Preconditions**: A non-self location has been added

**Steps**:
1. Verify the table has 2 or more data rows (self plus at least one added row).
2. Click "Delete" on the added non-self row and verify the row is immediately removed from the table with no confirmation dialog.
3. Verify the table returns to only the self-row (1604) and the "Add" row.
4. Verify the left-panel "Save" button is still enabled because there are unsaved changes from the add and delete cycle.

**Expected**: Delete immediately removes the non-self row without any confirmation dialog
**Data**: office=1604
**Cleanup**: Navigate away and discard unsaved changes, or Save

---

## TC-LOC-SSL-016: Cancel dialog does not modify table
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | State |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Navigate to the "Shared Setup Locations" tab and verify only the self-row is present.
2. Click "Add" and verify the dialog opens.
3. Search for "Miami" and verify results appear.
4. Check a row checkbox such as "1233 - Miami Marriott Biscayne Bay" and verify "Select" becomes enabled.
5. Click "Cancel" instead of "Select" and verify the dialog closes.
6. Verify the main table still has only the self-row (1604) with no new row added.
7. Verify the left-panel "Save" button is disabled because no dirty state was created.

**Expected**: Cancelling dialog after selecting a row makes no changes to the table
**Data**: office=1604

---

## TC-LOC-SSL-017: Tab uses left-panel Save (no dedicated Save)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Navigate to the "Shared Setup Locations" tab and verify it loads.
2. Inspect the Shared Setup Locations panel for a local "Save" button and verify none is found inside the panel.
3. Toggle "Shares Inventory" and verify the left-panel "Save" becomes enabled.
4. Click the left-panel "Save" and verify the "Save Changes" dialog appears with "Save" and "Cancel" buttons.
5. Click "Save" in the dialog and verify changes are saved.

**Expected**: No dedicated Save inside this tab; save uses left-panel Save with "Save Changes" confirmation dialog
**Data**: office=1604
**Cleanup**: Revert Shares Inventory -> Save

---

## TC-LOC-SSL-018: Verify a location added via the dialog persists after save and reload
| Priority | Status | Type |
|----------|--------|------|
| Critical | Automated | Persistence |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Reload and navigate to the "Shared Setup Locations" tab to confirm a clean state with only the self-row.
2. Click "Add", search for "Miami", select the first available result, and click "Select".
3. Verify the table now has 2 rows.
4. Click "Save" and confirm the dialog, then verify the save succeeds.
5. Reload the page and navigate back to the "Shared Setup Locations" tab.
6. Verify the table still has 2 rows and the added location data matches.

**Expected**: Added location persists after save + reload round-trip
**Data**: office=1604, search="Miami" (dynamic — picks first available)
**Cleanup**: Delete added row + Save

---

## TC-LOC-SSL-019: Verify a Shares Inventory toggle persists after save and reload
| Priority | Status | Type |
|----------|--------|------|
| Critical | Automated | Persistence |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Setup: add the first available location via name search, save, and reload.
2. Verify the non-self row has "Shares Inventory" checked by default.
3. Toggle "Shares Inventory" off on the non-self row and verify "Save" becomes enabled.
4. Click "Save" and verify it succeeds.
5. Reload and navigate back and verify the non-self "Shares Inventory" is unchecked.

**Expected**: Non-self Shares Inventory toggle persists after save + reload
**Data**: office=1604, search="Miami" (dynamic)
**Cleanup**: Delete added row + Save

---

## TC-LOC-SSL-020: Verify a deleted location stays removed after save and reload
| Priority | Status | Type |
|----------|--------|------|
| Critical | Automated | Persistence |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Setup: add the first available location, save, and reload to confirm 2 rows.
2. Delete the non-self row and verify it is removed instantly with "Save" becoming enabled.
3. Click "Save" and verify it succeeds.
4. Reload and navigate back and verify only the self-row remains.

**Expected**: Deleted location stays removed after save + reload
**Data**: office=1604, search="Miami" (dynamic)

---

## TC-LOC-SSL-021: Verify Shares Inventory plus an added location both persist after reload
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Persistence |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Reload to a clean state and verify "Shares Inventory" is unchecked with 1 row.
2. Toggle "Shares Inventory" on for the self-row.
3. Add a location via the name search dialog.
4. Click "Save" and verify it succeeds.
5. Reload and verify "Shares Inventory" is checked and the added row is present.

**Expected**: Multiple changes (self SI toggle + add location) persist together
**Data**: office=1604, search="Miami" (dynamic)
**Cleanup**: Reset SI to unchecked + delete added row + Save (try/finally for LR-026)

---

## TC-LOC-SSL-022: Verify cancelling the Save dialog discards changes after reload
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Negative |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Reload to a clean state and verify "Shares Inventory" is unchecked.
2. Toggle "Shares Inventory" on and verify "Save" becomes enabled.
3. Click "Save" and verify the "Save Changes" dialog appears.
4. Click "Cancel" in the dialog and verify the dialog closes while the form stays dirty.
5. Reload without saving and verify "Shares Inventory" reverts to unchecked and was not persisted.

**Expected**: Cancelling the Save dialog does NOT persist changes
**Data**: office=1604

---

## TC-LOC-SSL-023: Browser warns before leaving the page when there are unsaved changes.
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Reload to a clean state.
2. Toggle "Shares Inventory" and verify the form has unsaved changes with "Save" enabled.
3. Trigger a page reload and verify the browser's leave-page confirmation dialog fires.
4. Dismiss the dialog to stay on the page and verify the page remains.

**Expected**: Unsaved changes trigger the browser's leave-page confirmation on navigation/reload
**Data**: office=1604
**Cleanup**: Navigate away to discard

---

## TC-LOC-SSL-024: Already-added location absent from Change Local Office dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Setup: add the first available location and save.
2. Read the added location's number from the table.
3. Click "Add" and verify the dialog opens.
4. Search for the added location's number and verify no results are returned (already associated).
5. Verify the added location is absent from the dialog results.

**Expected**: Dialog excludes locations already associated with this office
**Data**: office=1604, search=dynamic (captured from table after add)
**Cleanup**: Delete added row + Save

---

## TC-LOC-SSL-025: Each column header shows its expected label
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Navigate to the "Shared Setup Locations" tab and verify it loads.
2. Verify the "Local Office" column header is visible.
3. Verify the "Local Office Name" column header is visible.
4. Verify the "Primary Office" column header is visible.
5. Verify the "Shares Inventory" column header is visible.
6. Verify the actions column header is visible.

**Expected**: Each of the 5 column headers is addressed and verified individually
**Data**: office=1604

---

## TC-LOC-SSL-026: Dialog number-search "1233" returns exactly the Miami Marriott office
| Priority | Status | Type |
|----------|--------|------|
| High | FIXME (app bug — BUG-LOC-SSL-001) | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes (currently skipped via test.fixme)

**Steps**:
1. Reload and navigate to the "Shared Setup Locations" tab and ensure a clean state.
2. Click "Add" and verify the dialog opens.
3. Search for "1233" and verify 1 result row is returned.
4. Read the first dialog row and verify "Local Office" = "1233" and "Local Office Name" contains "Miami Marriott".
5. Click "Cancel" to close the dialog.

**Expected**: Number-search "1233" returns exactly one row for the Miami Marriott Biscayne Bay office
**Data**: office=1604, search="1233"
**Known issue**: Blocked by app bug — Miami-region offices structurally excluded from /api/location/location-lookup visibility filter for office 1604; search "1233" returns a phantom row with empty localOffice cell. Pending Encore fix. See `reports/bugs/BUG-LOC-SSL-001.json` verificationLog.

---

## TC-LOC-SSL-027: Combined self SI + add non-Miami row (Chicago) + save persists both after reload
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Persistence |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Reload and navigate to the "Shared Setup Locations" tab and ensure a clean state.
2. Toggle "Shares Inventory" on for the self-row and verify "Save" becomes enabled.
3. Click "Add" and verify the dialog opens. Search for "Chicago".
4. Verify the dialog row count is within the configured maximum search results.
5. Select the first dialog row and verify the "Select" button becomes enabled.
6. Click "Select" and verify the dialog closes with a new row added to the main table.
7. Click the left-panel "Save", confirm the dialog, and verify the save succeeds.
8. Reload and navigate back and verify "Shares Inventory" is checked and the added Chicago row is present.
9. Cleanup: revert "Shares Inventory", delete the added row, and save.

**Expected**: Multiple changes (self SI toggle + non-Miami add) persist together after save + reload
**Data**: office=1604, search="Chicago"
**Cleanup**: try/finally — revert SI + delete added row + Save; fall back to reload + ensureCleanSSLTable on failure

---

## TC-LOC-SSL-028: Verify switching tabs with unsaved changes shows the Unsaved dialog
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Reload and navigate to the "Shared Setup Locations" tab and ensure a clean state.
2. Toggle "Shares Inventory" and verify "Save" becomes enabled.
3. Click the "Location Management History" top-level tab and verify the "Unsaved Changes" dialog appears.
4. Click "Stay" in the dialog and verify the dialog closes.
5. Verify the active top-level tab still shows "Basic Information" (the parent tab of Shared Setup Locations).
6. Verify "Save" is still enabled because the dirty state is preserved.
7. Cleanup: discard changes and return to a clean state.

**Expected**: Tab switch with dirty form shows Unsaved Changes dialog; Stay preserves both tab focus and dirty state
**Data**: office=1604

---

## TC-LOC-SSL-029: Five rapid Add-button clicks open exactly one dialog
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Reload and navigate to the "Shared Setup Locations" tab and ensure a clean state.
2. Watch for any error on the page.
3. Rapidly click the "Add" button 5 times in quick succession.
4. Verify exactly 1 dialog is open after the clicks settle.
5. Verify there is no dialog stacking (count = 1).
6. Cleanup: click "Cancel" to close the single dialog.

**Expected**: Opening the dialog repeatedly in quick succession still shows only one dialog.
**Data**: office=1604, click_count=5, click_interval=50ms
**Note**: Console errors retained for trace visibility (not asserted — ambient the application noise like NG0100 / ResizeObserver loop makes strict empty-array assertion too flaky for CI). Load-bearing assertion is `countAddDialogs === 1`.

---

## TC-LOC-SSL-030: Verify three added location rows persist after save and reload
| Priority | Status | Type |
|----------|--------|------|
| High | FIXME (app bug — random per-row Delete after reload) | Persistence |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes (currently skipped via test.fixme)

**Steps**:
1. Reload and navigate to the "Shared Setup Locations" tab and ensure a clean state.
2. For each search query in Chicago, Boston, and Marriott: click "Add" and verify the dialog opens. Search the query and verify the row count is within the configured maximum. Select the first dialog row and verify "Select" becomes enabled. Click "Select" and verify the row is added to the main table.
3. Click the left-panel "Save", confirm the dialog, and verify the save succeeds.
4. Reload and navigate back and verify the table has 4 data rows (self plus 3 added).
5. Cleanup: delete all non-self rows, save, and verify only the self-row remains after reload.

**Expected**: All three non-Miami rows persist after save + reload; small-N (3-row) smoke variant for multi-add coverage
**Data**: office=1604, queries=["Chicago", "Boston", "Marriott"]
**Known issue**: Blocked by a known application issue — a random per-row Delete button becomes unclickable after add + save + reload, so the cleanup loop cannot complete. Pending an application fix. Full upper-bound characterisation (confirmed up to 44 rows on a throwaway office) is out of automated-run scope; minimal-mutation discipline on baseline office 1604 keeps changes small.

---

## Granular Cases

Per [SUBPLAN_SSL_FCC.md](./././././plans/pending/SUBPLAN_SSL_FCC.md) Phase 2 (GIVER). Catalogs ~14 net-new tests in the existing `'Location Shared Setup Locations @locations @shared-setup'` describe block (placed above the prior 30-TC contents). Each net-new test uses `saveAndVerifyCase` from [`clients/encore/src/core/field-case-runner.ts`](././././src/core/field-case-runner.ts) (lifecycle runner installed by SUBPLAN_NOTES_FCC_PILOT, DONE).

**Sister artifacts**:
- Field-case taxonomy: [field-case-generation.md](./././_internal/field-case-generation.md)
- Field-inventory (10 days fresh): [shared-setup.md](./././_internal/field-inventories/shared-setup.md)
- Walk-evidence (Phase 1 spot-check): [walk-evidence-shared-setup.md](./././_internal/walk-evidence-shared-setup.md)

### Gap-analysis matrix — taxonomy × SSL field type × coverage disposition

LR-040 classifies every applicable taxonomy case as (a) net-new TC, (b) covered by existing TC, or (c) deferred-with-bug. SSL has 4 field-types in scope: plain-text Search input (Add dialog), Checkbox SI (self + non-self), Multi-row FormArray (locations table), Dialog/button (Add + dialog mechanics).

| # | Taxonomy case | Field type | Disposition | Recipient TC |
|---|---|---|---|---|
| G01 | Search positive: 1-char filter (BVA min) | plain text | (a) net-new | TC-LOC-SSL-033 |
| G02 | Search positive: mid-length (7 chars "Atlanta") | plain text | (b) covered | TC-LOC-SSL-010 (line 261) |
| G03 | Search positive: number search (exact match) | plain text | (b) covered | TC-LOC-SSL-011 (line 280) |
| G04 | Search BVA: very-long string (200+ chars) | plain text | (a) net-new | TC-LOC-SSL-034 |
| G05 | Search BVA: clear-input restores rows | plain text | (a) net-new | TC-LOC-SSL-035 |
| G06 | Search BVA: empty initial dialog (~4378 rows) | plain text | (b) covered | TC-LOC-SSL-009 implicit + TC-LOC-SSL-026 (line 595) |
| G07 | Search negative: special chars ("&", "'", "\"") | plain text | (a) net-new | TC-LOC-SSL-036 |
| G08 | Search negative: whitespace-only | plain text | (a) net-new | TC-LOC-SSL-037 |
| G09 | Search negative: leading/trailing whitespace | plain text | (a) net-new | TC-LOC-SSL-038 |
| G10 | Search negative: newline character | plain text | (b) covered-by-equivalent | TC-LOC-SSL-036 (special-chars umbrella) |
| G11 | Search edit-cycle: type → clear → type | plain text | (a) net-new | TC-LOC-SSL-039 |
| G12 | Search edit-cycle: clear-restores-baseline | plain text | (a) net-new (paired with G05) | TC-LOC-SSL-040 |
| G13 | Search edit-cycle: append / prepend / partial-replace | plain text | (c) DROP — too-synthetic for non-persisted search input (out of scope per `feedback_discussion_item_not_bug.md` — no UI path, no Jira) | n/a (discussion-item) |
| G14 | Checkbox positive: check (self SI toggle ON) | checkbox | (b) covered | TC-LOC-SSL-006 (line 172) |
| G15 | Checkbox positive: uncheck (non-self SI toggle OFF) | checkbox | (b) covered | TC-LOC-SSL-019 (line 452) |
| G16 | Checkbox save-cycle: toggle ON → save → reload persisted | checkbox | (b) covered | TC-LOC-SSL-008 (line 214), TC-LOC-SSL-019 (line 452) |
| G17 | Checkbox save-cycle: toggle OFF → save → reload persisted | checkbox | (b) covered | TC-LOC-SSL-019 (line 452 — default checked, toggles OFF, saves, reloads, asserts OFF) |
| G18 | Checkbox save-cycle: full round-trip ON→save→OFF→save | checkbox | (a) net-new | TC-LOC-SSL-044 |
| G19 | Checkbox save-cycle: toggle-then-revert disables Save | checkbox | (b) covered | TC-LOC-SSL-007 (line 193, fixme'd by LR-026/BUG-LOC-SSL-001 evidence vehicle) |
| G20 | Checkbox cross-row independence (pre-save) | checkbox | (a) net-new | TC-LOC-SSL-043 |
| G21 | Multi-row positive: 1 row | FormArray | (b) covered | TC-LOC-SSL-018 (line 430) |
| G22 | Multi-row positive: 2 rows | FormArray | (b) covered-by-equivalent | TC-LOC-SSL-027 (line 616 — 1 + self = 2 total with self-SI cross-action) |
| G23 | Multi-row positive: N rows (3) | FormArray | (b) covered | TC-LOC-SSL-030 (line 685, fixme'd by random-delete app bug) |
| G24 | Multi-row positive: N rows (5 — boundary push) | FormArray | (a) net-new | TC-LOC-SSL-032 (fixme — same app bug) |
| G25 | Multi-row save-cycle: add+save (single) | FormArray | (b) covered | TC-LOC-SSL-018 |
| G26 | Multi-row save-cycle: edit-row+save | FormArray | (b) covered | TC-LOC-SSL-019 (toggle non-self SI on added row) |
| G27 | Multi-row save-cycle: delete-LAST + save | FormArray | (b) covered | TC-LOC-SSL-020 (line 473) |
| G28 | Multi-row save-cycle: delete-MIDDLE + save | FormArray | (a) net-new | TC-LOC-SSL-031 (fixme — same app bug) |
| G29 | Multi-row save-cycle: delete-FIRST + save | FormArray | (b) covered-by-equivalent | TC-LOC-SSL-020 (delete is positional-index-based; first = last when N=1) |
| G30 | Multi-row save-cycle: delete-ALL non-self + save | FormArray | (a) net-new | TC-LOC-SSL-041 |
| G31 | Multi-row save-cycle: cross-row edit-preserve (toggle row 1 SI → row 0 unchanged across save+reload) | FormArray | (a) net-new | TC-LOC-SSL-042 |
| G32 | Multi-row BVA: empty-row content | FormArray | (c) N/A — SSL rows are integer IDs (no text content); structurally inapplicable | n/a (taxonomy mismatch) |
| G33 | Multi-row BVA: max-row content | FormArray | (c) N/A — same as G32 | n/a (taxonomy mismatch) |
| G34 | Multi-row negative: special chars / newlines / unicode / html-as-text | FormArray | (c) N/A — same as G32 | n/a (taxonomy mismatch) |
| G35 | Dialog/button: Add opens dialog | button | (b) covered | TC-LOC-SSL-009 (line 238) |
| G36 | Dialog/button: Cancel closes dialog cleanly | button | (b) covered | TC-LOC-SSL-016 (line 387) |
| G37 | Dialog/button: Close (X) — testid absent in live interface per walk-evidence D-001 | button | (c) discussion-item — UI affordance not present, no spec uses it, no Jira | n/a (recorded in walk-evidence-shared-setup.md §3 D-001) |
| G38 | Dialog/button: Row checkbox → Select button enable | button | (b) covered | TC-LOC-SSL-012 (line 299) |
| G39 | Dialog/button: rapid-click Add → exactly one dialog | button | (b) covered | TC-LOC-SSL-029 (line 663) |
| G40 | Combined save: self-SI + Add | mixed | (b) covered | TC-LOC-SSL-021 (line 492) + TC-LOC-SSL-027 (line 616) |
| G41 | Top-tab switch with dirty form → Unsaved dialog | mixed | (b) covered | TC-LOC-SSL-028 (line 641) |
| G42 | Already-added location excluded from dialog | dialog | (b) covered | TC-LOC-SSL-024 (line 553, fixme'd by BUG-LOC-SSL-001) |
| G43 | Beforeunload fires when dirty | global | (b) covered | TC-LOC-SSL-023 (line 533) |

**Matrix summary**:
- 14 (a) net-new TCs = TC-LOC-SSL-031.044 (canonical sequence after SUBPLAN_XLSX_PREP_01 rename — submodule-only IDs per naming policy)
- 23 (b) covered-by-existing — each cites a TC ID with line number for grep verification
- 6 (c) deferred-with-justification — 1 discussion-item (G13 too-synthetic), 1 discussion-item (G37 missing testid), 3 structural N/A (G32-34 taxonomy mismatch — SSL FormArray rows have no text content), 1 covered-by-equivalent (G10 newline = subset of special-chars)

**LR-046 strict-line audit**: STRICT-LINE-A (every taxonomy case classified (a)/(b)/(c)) — ✅ all 43 cells classified above with cite. STRICT-LINE-B (zero duplications) — ✅ each (a) net-new TC tested against the 30 existing TCs above; the gap-table entry for each net-new TC names a distinct angle not covered by existing.

### Net-new TC catalog (14 entries — TC-LOC-SSL-031.044, canonical sequence)

---

## TC-LOC-SSL-033: Verify a single-character search shows at least one result
| Priority | Status | Type |
|----------|--------|------|
| Medium | Pending automation | Functional / α |

**Group**: α (Search BVA min)
**Field type**: plain text (Add-dialog search input)
**Depends_On**: none (LR-019 own baseline via `ensureCleanSSLTable`)
**Automatable**: Yes

**Steps**:
1. Ensure the table is in a clean state (only the self-row) and open the "Change Local Office" dialog.
2. Type a single character "A" in the search input.
3. Verify at least one row is rendered in the dialog.
4. Click "Cancel" to close the dialog without saving.
5. Reload and navigate back to the "Shared Setup Locations" tab.
6. Verify the table still shows only the self-row with no leaked additions.
7. Restore the table to a clean state.

**Expected**: 1-char search filter renders ≥1 row in dialog; no form leak after cancel + reload
**Data**: office=1604, search="A"

---

## TC-LOC-SSL-034: Verify a very long search string does not crash the dialog
| Priority | Status | Type |
|----------|--------|------|
| Medium | Pending automation | Functional / α |

**Group**: α (Search BVA max+overflow)
**Field type**: plain text
**Depends_On**: none
**Automatable**: Yes

**Steps**:
1. Ensure the table is in a clean state and click "Add" to open the dialog.
2. Type a string of 200 repeated "X" characters in the search input.
3. Verify the dialog is still visible and the table state is stable with no JavaScript error.
4. Click "Cancel" to close the dialog.
5. Reload and navigate back to the "Shared Setup Locations" tab.
6. Verify the table shows only the self-row.
7. Restore the table to a clean state.

**Expected**: 200-char paste does not break dialog rendering; either 0 results or "No results." cleanly
**Data**: office=1604, search=`"X".repeat(200)`

---

## TC-LOC-SSL-035: Verify clearing the search restores the full row count
| Priority | Status | Type |
|----------|--------|------|
| Medium | Pending automation | Functional / α |

**Group**: α (Search BVA empty)
**Field type**: plain text
**Depends_On**: none
**Automatable**: Yes

**Steps**:
1. Ensure the table is in a clean state and click "Add" to open the dialog.
2. Search for "Atlanta" to filter to a small number of rows, then clear the search input.
3. Verify the dialog row count is restored to the bulk catalog size (3000 or more rows).
4. Click "Cancel" to close the dialog.
5. Reload and navigate back to the "Shared Setup Locations" tab.
6. Verify the table shows only the self-row.
7. Restore the table to a clean state.

**Expected**: Clearing the search input restores the unfiltered row count; baseline is bulk catalog (~3000+)
**Data**: office=1604, filtered="Atlanta", cleared=""

---

## TC-LOC-SSL-036: Search special chars return clean empty-state (no crash)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Pending automation | Functional / β |

**Group**: β (Search negative — special chars)
**Field type**: plain text
**Depends_On**: none
**Automatable**: Yes

**Steps**:
1. Ensure the table is in a clean state and click "Add" to open the dialog.
2. Type the mixed special characters string in the search input.
3. Verify the dialog is still visible and the "Select" button stays disabled because no valid row is selected.
4. Click "Cancel" to close the dialog.
5. Reload and navigate back to the "Shared Setup Locations" tab.
6. Verify the table shows only the self-row.
7. Restore the table to a clean state.

**Expected**: Special chars produce either zero real rows or "No results." placeholder; no crash, Select stays disabled
**Data**: office=1604, search=`&"\\'<>`

---

## TC-LOC-SSL-037: Search whitespace-only filter does not crash
| Priority | Status | Type |
|----------|--------|------|
| Medium | Pending automation | Functional / β |

**Group**: β (Search negative — whitespace)
**Field type**: plain text
**Depends_On**: none
**Automatable**: Yes

**Steps**:
1. Ensure the table is in a clean state and click "Add" to open the dialog.
2. Type three spaces in the search input.
3. Verify the dialog is still visible and the "Select" button stays disabled.
4. Click "Cancel" to close the dialog.
5. Reload and navigate back to the "Shared Setup Locations" tab.
6. Verify the table shows only the self-row.
7. Restore the table to a clean state.

**Expected**: Whitespace-only input either treats as empty (full bulk) or shows "No results."; no crash
**Data**: office=1604, search=`" "`

---

## TC-LOC-SSL-038: Search leading/trailing whitespace still matches base term
| Priority | Status | Type |
|----------|--------|------|
| Medium | Pending automation | Functional / β |

**Group**: β (Search negative — whitespace wrap)
**Field type**: plain text
**Depends_On**: none
**Automatable**: Yes

**Steps**:
1. Ensure the table is in a clean state and click "Add" to open the dialog.
2. Type " Atlanta " with leading and trailing spaces in the search input.
3. Verify at least one row is shown and the count is less than the maximum (filtered to the Atlanta region).
4. Click "Cancel" to close the dialog.
5. Reload and navigate back to the "Shared Setup Locations" tab.
6. Verify the table shows only the self-row.
7. Restore the table to a clean state.

**Expected**: Filter trims (or doesn't) whitespace consistently; Atlanta rows render
**Data**: office=1604, search=`" Atlanta "`

---

## TC-LOC-SSL-039: Verify retyping a search after clearing swaps the results
| Priority | Status | Type |
|----------|--------|------|
| Medium | Pending automation | Functional / γ |

**Group**: γ (Search edit-cycle)
**Field type**: plain text
**Depends_On**: none
**Automatable**: Yes

**Steps**:
1. Ensure the table is in a clean state and click "Add" to open the dialog.
2. Search for "Atlanta", then clear and retype "Boston" in the search input.
3. Verify the first visible dialog row does not contain "Atlanta" in the name (final state shows Boston rows).
4. Click "Cancel" to close the dialog.
5. Reload and navigate back to the "Shared Setup Locations" tab.
6. Verify the table shows only the self-row.
7. Restore the table to a clean state.

**Expected**: Re-typing replaces previous filter; final state shows Boston rows, not Atlanta
**Data**: office=1604, query1="Atlanta", query2="Boston"

---

## TC-LOC-SSL-040: Search edit-cycle: clear-via-input-clear restores baseline
| Priority | Status | Type |
|----------|--------|------|
| Medium | Pending automation | Functional / γ |

**Group**: γ (Search edit-cycle paired with G05)
**Field type**: plain text
**Depends_On**: none
**Automatable**: Yes

**Steps**:
1. Ensure the table is in a clean state and click "Add" to open the dialog.
2. Search for "Atlanta" and capture the row count, then clear the search input completely.
3. Verify the restored row count is greater than the filtered count (bulk catalog restored).
4. Click "Cancel" to close the dialog.
5. Reload and navigate back to the "Shared Setup Locations" tab.
6. Verify the table shows only the self-row.
7. Restore the table to a clean state.

**Expected**: Clearing input via clear restores rows to bulk count (catalog ~3000+ post-filter)
**Data**: office=1604

---

## TC-LOC-SSL-031: Verify deleting a middle row persists after save and reload
| Priority | Status | Type |
|----------|--------|------|
| High | FIXME (BUG-LOC-SSL-001 random per-row Delete-after-reload) | Persistence / δ |

**Group**: δ (Multi-row delete variants)
**Field type**: FormArray
**Depends_On**: none
**Automatable**: Yes (currently `test.fixme` due to same app bug as TC-030)

**Steps**:
1. Ensure the table is in a clean state.
2. Add 3 non-Miami rows (Chicago, Dallas, Denver) by searching for and adding each. Save and reload. Then identify the middle-added row (Dallas) and delete it.
3. Verify "Save" is enabled.
4. Click "Save" and confirm the dialog.
5. Verify "Save" is disabled after the save completes.
6. Reload and navigate back to the "Shared Setup Locations" tab.
7. Verify the table has 3 rows (self plus 2 remaining) and the remaining offices are Chicago and Denver, not Dallas.
8. Restore the table to a clean state.

**Expected**: Deleting middle row preserves rows 0 and 2 across save+reload
**Data**: office=1604, queries=["Chicago", "Dallas", "Denver"], deleteIndex=1 (post-add-order)
**Known issue**: BUG-LOC-SSL-001 (random per-row Delete becomes non-clickable after reload); cleanup loop may hang. Same fixme pattern as TC-030.

---

## TC-LOC-SSL-041: Verify deleting all non-self rows persists after save and reload
| Priority | Status | Type |
|----------|--------|------|
| High | Pending automation | Persistence / δ |

**Group**: δ (Multi-row delete-all)
**Field type**: FormArray
**Depends_On**: none
**Automatable**: Yes

**Steps**:
1. Ensure the table is in a clean state.
2. Add 2 non-Miami rows (Atlanta, Boston), save, reload, then delete both non-self rows.
3. Verify only the self-row remains in the table.
4. Click "Save" and confirm the dialog.
5. Reload and navigate back to the "Shared Setup Locations" tab.
6. Verify only the self-row persisted.
7. Restore the table to a clean state.

**Expected**: Bulk-delete of all non-self rows persists; baseline 1-row state restored after save+reload
**Data**: office=1604, queries=["Atlanta", "Boston"]

---

## TC-LOC-SSL-042: Verify editing one row Shares Inventory does not change another on save
| Priority | Status | Type |
|----------|--------|------|
| High | Pending automation | Persistence / ε |

**Group**: ε (Multi-row edit / cross-row preserve)
**Field type**: FormArray + checkbox
**Depends_On**: none
**Automatable**: Yes

**Steps**:
1. Ensure the table is in a clean state and confirm "Shares Inventory" for the self-row is unchecked (the default).
2. Add 1 non-Miami row (Atlanta), save, and reload. Then toggle the non-self row "Shares Inventory" off (default is checked, so this changes it to unchecked) and save.
3. Click "Save" and confirm the dialog.
4. Reload and navigate back to the "Shared Setup Locations" tab.
5. Verify the self-row "Shares Inventory" is still unchecked (unchanged) and the non-self row "Shares Inventory" is unchecked (was changed).
6. Restore the table to a clean state.

**Expected**: Toggling non-self SI does NOT affect self SI across the save+reload cycle (cross-row save independence)
**Data**: office=1604, query="Atlanta"

---

## TC-LOC-SSL-032: Verify adding five location rows persists after save and reload
| Priority | Status | Type |
|----------|--------|------|
| Medium | FIXME (BUG-LOC-SSL-001 random per-row Delete after reload during cleanup) | Persistence / ε |

**Group**: ε (Multi-row N-row boundary)
**Field type**: FormArray
**Depends_On**: none
**Automatable**: Yes (currently `test.fixme` due to cleanup churn on random Delete bug)

**Steps**:
1. Ensure the table is in a clean state.
2. Add 5 non-Miami rows (Chicago, Boston, Dallas, Denver, Atlanta).
3. Verify "Save" is enabled and the table shows 6 rows (self plus 5).
4. Click "Save" and confirm the dialog.
5. Reload and navigate back to the "Shared Setup Locations" tab.
6. Verify the table shows 6 rows and all 5 office codes are present.
7. Restore the table to a clean state.

**Expected**: 5-row boundary push persists across save+reload
**Data**: office=1604, queries=["Chicago", "Boston", "Dallas", "Denver", "Atlanta"]
**Known issue**: Same BUG-LOC-SSL-001 random-Delete-non-clickable bug as TC-030 / this TC. Cleanup at end may hang.

---

## TC-LOC-SSL-043: Verify toggling one row Shares Inventory does not flip another pre-save
| Priority | Status | Type |
|----------|--------|------|
| Medium | Pending automation | Functional / ζ |

**Group**: ζ (Checkbox cross-row independence)
**Field type**: checkbox
**Depends_On**: none
**Automatable**: Yes

**Steps**:
1. Ensure the table is in a clean state and confirm "Shares Inventory" for the self-row is unchecked.
2. Add 1 non-Miami row (Atlanta), save, and reload. Capture the self-row "Shares Inventory" state (unchecked). Then toggle the non-self row "Shares Inventory" off without saving.
3. Verify in-page state before save: the self-row "Shares Inventory" is still unchecked (untouched) and the non-self row "Shares Inventory" is now unchecked (was checked by default, now toggled).
4. Click "Save" and confirm the dialog to commit the toggle and clean up the dirty state.
5. Reload and navigate back to the "Shared Setup Locations" tab.
6. Verify the self-row "Shares Inventory" is still unchecked after save.
7. Restore the table to a clean state.

**Expected**: Toggling non-self SI does NOT change self SI in-page (pre-save assertion)
**Data**: office=1604, query="Atlanta"

---

## TC-LOC-SSL-044: Verify a Shares Inventory checkbox persists across an on-off save cycle
| Priority | Status | Type |
|----------|--------|------|
| Medium | Pending automation | Persistence / ζ |

**Group**: ζ (Checkbox round-trip)
**Field type**: checkbox
**Depends_On**: none
**Automatable**: Yes

**Steps**:
1. Ensure the table is in a clean state.
2. Toggle "Shares Inventory" on for the self-row, save, reload, verify it is checked, then toggle "Shares Inventory" off, save, and reload.
3. Note: the final save and reload are the second of two reloads in the round-trip. The intermediate save occurs within step 2.
4. After the final reload, verify the self-row "Shares Inventory" is unchecked (final state).
5. Restore the table to a clean state.

**Note**: This case performs both legs of the round-trip in a single action step. The final save, reload, and post-reload check cover only the final leg. The persisted result is verified via the final reload, with the intermediate state captured inline in the action step.

**Expected**: SI toggled ON persists as checked, and toggled OFF persists as unchecked (a full round-trip of the toggle state).
**Data**: office=1604

---

### Group catalog summary

| Group | Count | TC IDs | Field type |
|---|---|---|---|
| α — Search BVA | 3 | SSL-033/034/035 | plain text |
| β — Search special/whitespace | 3 | SSL-036/037/038 | plain text |
| γ — Search edit-cycle | 2 | SSL-039/040 | plain text |
| δ — Multi-row delete variants | 2 | SSL-031 [fixme] / SSL-041 | FormArray |
| ε — Multi-row edit / N-boundary | 2 | SSL-042 / SSL-032 [fixme] | FormArray |
| ζ — Checkbox cross-row + round-trip | 2 | SSL-043 / SSL-044 | checkbox |
| **Total** | **14** | TC-LOC-SSL-031.044 (canonical, post-rename) | — |

**Fixme count**: 2 (SSL-031 + SSL-032, both blocked by BUG-LOC-SSL-001 random-Delete-non-clickable bug — same app issue as existing TC-030).

**±15% deviation budget check (STRICT-LINE-C)**: 13 ± 15% = 11.05–14.95; 14 catalogued = within budget. ✅
