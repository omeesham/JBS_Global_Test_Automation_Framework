# Location Shared Setup Locations Test Cases
**Module**: locations | **Total**: 25 | **Status**: Automated | **Updated**: 2026-04-14

---

## MCP_VERIFICATION_LOG

| Field | Value |
|-------|-------|
| Date | 2026-03-19 |
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

**Automatable**: Yes

**Steps**:
1. Navigate to Setup > Location > 1604 > click **Shared Setup Locations** tab -> Tab activates, tabpanel visible
2. Verify a table with data-testid="location-settings-table-shared-setup" is visible -> Table present
3. Verify **Add** button is visible in last table row -> Add button present and enabled

**Expected**: Tab renders table with 5-column layout and Add button at bottom
**Data**: office=1604

---

## TC-LOC-SSL-002: Verify column headers
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Automatable**: Yes

**Steps**:
1. Navigate to **Shared Setup Locations** tab -> Tab loads
2. Inspect column headers left-to-right -> Order: **Local Office** | **Local Office Name** | **Primary Office** | **Shares Inventory** | (empty actions column)

**Expected**: 5 columns with headers "Local Office", "Local Office Name", "Primary Office", "Shares Inventory", and one empty header
**Data**: office=1604

---

## TC-LOC-SSL-003: Verify self-location row default state
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Automatable**: Yes

**Steps**:
1. Navigate to **Shared Setup Locations** tab -> Tab loads
2. Locate first data row -> Cells show "1604" and "Parker Palm Springs"
3. Verify **Primary Office** checkbox is checked and disabled (aria-checked="true", disabled) -> Confirmed
4. Verify **Shares Inventory** checkbox is unchecked and editable (aria-checked="false", not disabled) -> Confirmed
5. Verify **Delete** button is disabled -> Confirmed

**Expected**: Self-location (1604) row: Primary Office locked-checked, Shares Inventory editable-unchecked, Delete disabled
**Data**: office=1604

---

## TC-LOC-SSL-004: Primary Office is read-only for self-location
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Automatable**: Yes

**Steps**:
1. Navigate to **Shared Setup Locations** tab -> Tab loads
2. Attempt to click **Primary Office** checkbox in row 1604 -> No interaction (checkbox is disabled)
3. Verify checkbox state unchanged -> Still checked (aria-checked="true")

**Expected**: Primary Office cannot be unchecked for self-location; clicking is a no-op because element has disabled attribute
**Data**: office=1604

---

## TC-LOC-SSL-005: Delete button disabled for self-location
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Automatable**: Yes

**Steps**:
1. Navigate to **Shared Setup Locations** tab -> Tab loads
2. Inspect **Delete** button for row 1604 -> Button has disabled attribute
3. Attempt to click Delete -> No action (disabled)

**Expected**: Delete button is disabled for self-location; self-row cannot be removed
**Data**: office=1604

---

## TC-LOC-SSL-006: Shares Inventory toggle ON enables Save
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Automatable**: Yes

**Preconditions**: Shares Inventory is unchecked for 1604

**Steps**:
1. Navigate to **Shared Setup Locations** tab -> Tab loads, left-panel Save button is disabled
2. Click **Shares Inventory** checkbox in row 1604 -> Checkbox becomes checked (aria-checked="true")
3. Observe left-panel Save button state -> Save button becomes enabled

**Expected**: Toggling Shares Inventory marks form as dirty, enables left-panel Save
**Data**: office=1604
**Cleanup**: Uncheck **Shares Inventory** to revert. If Save still enabled, navigate away and accept unsaved changes dialog or reload page.

---

## TC-LOC-SSL-007: Reverting Shares Inventory disables Save
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Automatable**: Yes

**Preconditions**: Shares Inventory is unchecked for 1604

**Steps**:
1. Navigate to **Shared Setup Locations** tab -> Tab loads
2. Click **Shares Inventory** checkbox -> Becomes checked, Save enabled
3. Click **Shares Inventory** again -> Becomes unchecked (reverted to original)
4. Observe Save button state -> Save button is disabled again

**Expected**: Reverting to original state removes dirty flag, Save disables
**Data**: office=1604

---

## TC-LOC-SSL-008: Shares Inventory save and persist
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Automatable**: Yes

**Preconditions**: Shares Inventory is unchecked for 1604

**Steps**:
1. Navigate to **Shared Setup Locations** tab -> Tab loads
2. Click **Shares Inventory** checkbox -> Becomes checked
3. Click left-panel **Save** -> "Save Changes" alert dialog appears with Save and Cancel buttons
4. Click **Save** in dialog -> Data saved, dialog closes
5. Reload page, navigate back to **Shared Setup Locations** tab -> Tab loads
6. Verify **Shares Inventory** for row 1604 -> Checked state persisted (aria-checked="true")

**Expected**: Checked state persists after save + reload
**Data**: office=1604
**Cleanup**: Uncheck Shares Inventory -> Save -> confirm dialog -> verify unchecked after reload

---

## TC-LOC-SSL-009: Add button opens Change Local Office dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Automatable**: Yes

**Steps**:
1. Navigate to **Shared Setup Locations** tab -> Tab loads
2. Click **Add** button in last table row -> "Change Local Office" dialog opens
3. Verify dialog heading is "Change Local Office" (h2) -> Correct
4. Verify search input with placeholder "Search by Location Name, Number" -> Present
5. Verify results table with 3 columns (checkbox, Local Office, Local Office Name) -> Table visible with rows
6. Verify **Select** button is disabled (no row selected) -> Confirmed
7. Verify **Cancel** button is enabled -> Confirmed
8. Click **Cancel** -> Dialog closes, no changes to main table

**Expected**: Add opens "Change Local Office" dialog with search, results table, Select/Cancel buttons. Cancel closes without changes.
**Data**: office=1604

---

## TC-LOC-SSL-010: Dialog search filters by location name
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Automatable**: Yes

**Steps**:
1. Navigate to **Shared Setup Locations** tab -> click **Add** -> Dialog opens with 4614+ rows
2. Type "Miami" in search input -> Results filter to ~69 rows containing "Miami" in location name
3. Verify filtered rows show matching names (e.g., "Miami Marriott Biscayne Bay") -> Matches visible
4. Click **Cancel** to close

**Expected**: Search input filters results table by location name substring match
**Data**: office=1604, search="Miami"

---

## TC-LOC-SSL-011: Dialog search filters by location number
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Automatable**: Yes

**Steps**:
1. Navigate to **Shared Setup Locations** tab -> click **Add** -> Dialog opens
2. Type "990002" in search input -> Results filter to 1 row: "990002 - Test Server1"
3. Verify exact match shown -> Confirmed
4. Click **Cancel** to close

**Expected**: Search input filters results table by location number match
**Data**: office=1604, search="990002"

---

## TC-LOC-SSL-012: Dialog row selection enables Select button
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Negative |

**Automatable**: Yes

**Steps**:
1. Navigate to **Shared Setup Locations** tab -> click **Add** -> Dialog opens
2. Verify **Select** button is disabled -> Disabled (no row selected)
3. Search for "1099" -> 1 result row
4. Click the row checkbox (role="checkbox" aria-label="Select row") -> Checkbox becomes checked
5. Verify **Select** button is now enabled -> Enabled

**Expected**: Selecting a row checkbox enables the Select button
**Data**: office=1604, search="1099"
**Cleanup**: Click Cancel to close dialog

---

## TC-LOC-SSL-013: Add location via dialog Select button
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Automatable**: Yes

**Steps**:
1. Navigate to **Shared Setup Locations** tab -> Only self-row (1604) present
2. Click **Add** -> Dialog opens
3. Search for a location (e.g., "1099") -> Filter to result
4. Check the row checkbox -> Select button enables
5. Click **Select** -> Dialog closes, new row appears in table
6. Verify new row shows correct Local Office number and Local Office Name -> Confirmed
7. Verify left-panel Save button is enabled -> Form is dirty

**Expected**: Selecting a location and clicking Select adds it to the table and marks form dirty
**Data**: office=1604, added=1099
**Cleanup**: Click Delete on added row -> navigate away and discard changes or reload

---

## TC-LOC-SSL-014: Non-self row state verification
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Automatable**: Yes

**Preconditions**: A non-self location has been added via TC-LOC-SSL-013

**Steps**:
1. Inspect the added (non-self) row in the table
2. Verify **Primary Office** checkbox is unchecked and **disabled** (aria-checked="false", disabled attribute present) -> Confirmed
3. Verify **Shares Inventory** checkbox is checked and **editable** (aria-checked="true", not disabled) -> Confirmed
4. Verify **Delete** button is **enabled** (not disabled) -> Confirmed

**Expected**: Non-self rows: Primary Office disabled+unchecked, Shares Inventory checked+editable, Delete enabled
**Data**: office=1604, added row
**Cleanup**: Delete added row, discard changes

---

## TC-LOC-SSL-015: Delete non-self row (instant, no confirmation)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Automatable**: Yes

**Preconditions**: A non-self location has been added (e.g., via TC-LOC-SSL-013)

**Steps**:
1. Verify table has 2+ data rows (self + added) -> Confirmed
2. Click **Delete** on the added (non-self) row -> Row is immediately removed from the table (no confirmation dialog)
3. Verify table returns to only self-row (1604) + Add row -> Confirmed
4. Verify left-panel Save button state -> Still enabled (form dirty from add+delete cycle)

**Expected**: Delete immediately removes the non-self row without any confirmation dialog
**Data**: office=1604
**Cleanup**: Navigate away and discard unsaved changes, or Save

---

## TC-LOC-SSL-016: Cancel dialog does not modify table
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | State |

**Automatable**: Yes

**Steps**:
1. Navigate to **Shared Setup Locations** tab -> Only self-row
2. Click **Add** -> Dialog opens
3. Search for "Miami" -> Results appear
4. Check a row checkbox (e.g., "1233 - Miami Marriott Biscayne Bay") -> Select enabled
5. Click **Cancel** instead of Select -> Dialog closes
6. Verify main table still has only self-row (1604) -> No new row added
7. Verify left-panel Save button is disabled -> No dirty state

**Expected**: Cancelling dialog after selecting a row makes no changes to the table
**Data**: office=1604

---

## TC-LOC-SSL-017: Tab uses left-panel Save (no dedicated Save)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Automatable**: Yes

**Steps**:
1. Navigate to **Shared Setup Locations** tab -> Tab loads
2. Inspect the Shared Setup Locations tabpanel for a local Save button -> None found inside tabpanel
3. Toggle **Shares Inventory** -> Left-panel Save becomes enabled
4. Click left-panel **Save** -> "Save Changes" alert dialog with Save and Cancel buttons
5. Click **Save** in dialog -> Changes saved

**Expected**: No dedicated Save inside this tab; save uses left-panel Save with "Save Changes" confirmation dialog
**Data**: office=1604
**Cleanup**: Revert Shares Inventory -> Save

---

## TC-LOC-SSL-018: Add location via dialog -> save -> reload -> row persists
| Priority | Status | Type |
|----------|--------|------|
| Critical | Automated | Persistence |

**Automatable**: Yes

**Steps**:
1. Reload and navigate to **Shared Setup Locations** tab -> Clean state (self only)
2. Click **Add** -> Search "Miami" -> Select first available result -> Click **Select**
3. Verify table now has 2 rows -> Confirmed
4. Click **Save** -> Confirm dialog -> Save succeeds
5. Reload page and navigate back to SSL tab -> Table reloads from server
6. Verify table still has 2 rows and added location data matches -> Persisted

**Expected**: Added location persists after save + reload round-trip
**Data**: office=1604, search="Miami" (dynamic — picks first available)
**Cleanup**: Delete added row + Save

---

## TC-LOC-SSL-019: Non-self Shares Inventory toggle -> save -> reload -> persisted
| Priority | Status | Type |
|----------|--------|------|
| Critical | Automated | Persistence |

**Automatable**: Yes

**Steps**:
1. Setup: add first available location via name search + save + reload
2. Verify non-self row has SI=checked (default) -> Confirmed
3. Toggle **Shares Inventory** OFF on non-self row -> Save enabled
4. Click **Save** -> Succeeds
5. Reload and navigate back -> Non-self SI is unchecked -> Persisted

**Expected**: Non-self Shares Inventory toggle persists after save + reload
**Data**: office=1604, search="Miami" (dynamic)
**Cleanup**: Delete added row + Save

---

## TC-LOC-SSL-020: Delete location -> save -> reload -> row removed
| Priority | Status | Type |
|----------|--------|------|
| Critical | Automated | Persistence |

**Automatable**: Yes

**Steps**:
1. Setup: add first available location + save + reload -> 2 rows
2. Delete non-self row -> Row removed instantly, Save enabled
3. Click **Save** -> Succeeds
4. Reload and navigate back -> Only self-row remains -> Deletion persisted

**Expected**: Deleted location stays removed after save + reload
**Data**: office=1604, search="Miami" (dynamic)

---

## TC-LOC-SSL-021: Combined self SI + add location -> save -> reload -> both persisted
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Persistence |

**Automatable**: Yes

**Steps**:
1. Reload to clean state -> Self SI=unchecked, 1 row
2. Toggle self **Shares Inventory** ON
3. Add location via name search dialog
4. Click **Save** -> Succeeds
5. Reload -> Self SI=checked AND added row present -> Both changes persisted

**Expected**: Multiple changes (self SI toggle + add location) persist together
**Data**: office=1604, search="Miami" (dynamic)
**Cleanup**: Reset SI to unchecked + delete added row + Save (try/finally for LR-026)

---

## TC-LOC-SSL-022: Cancel Save dialog -> changes not persisted after reload
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Negative |

**Automatable**: Yes

**Steps**:
1. Reload to clean state -> Self SI=unchecked
2. Toggle self **Shares Inventory** ON -> Save enabled
3. Click **Save** -> "Save Changes" dialog appears
4. Click **Cancel** in dialog -> Dialog closes, form still dirty
5. Reload without saving -> Self SI reverts to unchecked -> Not persisted

**Expected**: Cancelling the Save dialog does NOT persist changes
**Data**: office=1604

---

## TC-LOC-SSL-023: Beforeunload fires when SSL form is dirty
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Automatable**: Yes

**Steps**:
1. Reload to clean state
2. Toggle self **Shares Inventory** -> Form dirty, Save enabled
3. Trigger page reload -> Browser beforeunload dialog fires
4. Dismiss dialog (stay on page) -> Page remains

**Expected**: Dirty form triggers beforeunload dialog on navigation/reload
**Data**: office=1604
**Cleanup**: Navigate away to discard

---

## TC-LOC-SSL-024: Already-added location absent from Change Local Office dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Automatable**: Yes

**Steps**:
1. Setup: add first available location + save
2. Read the added location's number from the table
3. Click **Add** -> Dialog opens
4. Search for the added location's number -> "No results." (count=1, localOffice empty)
5. Verify the row is NOT the added location -> Confirmed absent

**Expected**: Dialog excludes locations already associated with this office
**Data**: office=1604, search=dynamic (captured from table after add)
**Cleanup**: Delete added row + Save
