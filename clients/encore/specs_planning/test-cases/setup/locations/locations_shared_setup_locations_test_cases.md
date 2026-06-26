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

**Depends_On**: TC-LOC-SSL-001
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

**Depends_On**: TC-LOC-SSL-001
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

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Navigate to **Shared Setup Locations** tab -> Tab loads
2. Attempt to click **Primary Office** checkbox in row 1604 -> No interaction (checkbox is disabled)
3. Verify checkbox state unchanged -> Still checked (aria-checked="true")

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

**Depends_On**: TC-LOC-SSL-001
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

**Depends_On**: TC-LOC-SSL-001
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

**Depends_On**: TC-LOC-SSL-001
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

**Depends_On**: TC-LOC-SSL-001
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

**Depends_On**: TC-LOC-SSL-001
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

**Depends_On**: TC-LOC-SSL-001
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

**Depends_On**: TC-LOC-SSL-001
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

**Depends_On**: TC-LOC-SSL-001
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

**Depends_On**: TC-LOC-SSL-001
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

**Depends_On**: TC-LOC-SSL-001
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

**Depends_On**: TC-LOC-SSL-001
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

**Depends_On**: TC-LOC-SSL-001
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

## TC-LOC-SSL-018: Verify a location added via the dialog persists after save and reload
| Priority | Status | Type |
|----------|--------|------|
| Critical | Automated | Persistence |

**Depends_On**: TC-LOC-SSL-001
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

## TC-LOC-SSL-019: Verify a Shares Inventory toggle persists after save and reload
| Priority | Status | Type |
|----------|--------|------|
| Critical | Automated | Persistence |

**Depends_On**: TC-LOC-SSL-001
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

## TC-LOC-SSL-020: Verify a deleted location stays removed after save and reload
| Priority | Status | Type |
|----------|--------|------|
| Critical | Automated | Persistence |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Setup: add first available location + save + reload -> 2 rows
2. Delete non-self row -> Row removed instantly, Save enabled
3. Click **Save** -> Succeeds
4. Reload and navigate back -> Only self-row remains -> Deletion persisted

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
1. Reload to clean state -> Self SI=unchecked, 1 row
2. Toggle self **Shares Inventory** ON
3. Add location via name search dialog
4. Click **Save** -> Succeeds
5. Reload -> Self SI=checked AND added row present -> Both changes persisted

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

**Depends_On**: TC-LOC-SSL-001
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

**Depends_On**: TC-LOC-SSL-001
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

---

## TC-LOC-SSL-025: Each column header testid resolves to expected text
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes

**Steps**:
1. Navigate to **Shared Setup Locations** tab -> Tab loads
2. Verify `colHeaderLocalOffice` testid resolves and is visible -> Confirmed
3. Verify `colHeaderLocalOfficeName` testid resolves and is visible -> Confirmed
4. Verify `colHeaderPrimaryOffice` testid resolves and is visible -> Confirmed
5. Verify `colHeaderSharesInventory` testid resolves and is visible -> Confirmed
6. Verify `colHeaderActions` testid resolves and is visible -> Confirmed

**Expected**: Per-testid resolution for each of the 5 column headers (complements TC-002 whole-array check)
**Data**: office=1604

---

## TC-LOC-SSL-026: Dialog number-search "1233" returns exactly the Miami Marriott office
| Priority | Status | Type |
|----------|--------|------|
| High | FIXME (app bug — BUG-LOC-SSL-001) | Functional |

**Depends_On**: TC-LOC-SSL-001
**Automatable**: Yes (currently skipped via test.fixme)

**Steps**:
1. Reload + navigate to **Shared Setup Locations** tab; ensure clean state
2. Click **Add** -> Dialog opens
3. Search for "1233" -> Dialog row count expected = 1
4. Read the first dialog row -> localOffice = "1233", localOfficeName contains "Miami Marriott"
5. Click **Cancel** to close dialog

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
1. Reload + navigate to **Shared Setup Locations** tab; ensure clean state
2. Toggle self **Shares Inventory** ON -> Save enables
3. Click **Add** -> Dialog opens; search "Chicago"
4. Verify dialog row count < `the configured max search results` (currently 600) -> Confirmed
5. Select the first dialog row -> Select button enables
6. Click **Select** -> Dialog closes; new row added to main table
7. Click left-panel **Save** -> Confirm dialog -> Save succeeds
8. Reload + navigate back -> Self SI is checked AND added Chicago row is present
9. Cleanup: revert self SI + delete added row + Save (try/finally per LR-026)

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
1. Reload + navigate to **Shared Setup Locations** tab; ensure clean state
2. Make form dirty (toggle Shares Inventory) -> Save enables
3. Click the **Location Management History** top-level tab -> "Unsaved Changes" alertdialog appears
4. Click **Stay** in the dialog -> Dialog closes
5. Verify active top-level tab still contains "Basic Information" (the SSL parent tab) -> Confirmed
6. Verify Save is still enabled (dirty state preserved) -> Confirmed
7. Cleanup: discard changes and return to clean state

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
1. Reload + navigate to **Shared Setup Locations** tab; ensure clean state
2. Capture console errors on the page
3. Rapid-click the **Add** button 5 times with 50ms between clicks
4. Verify exactly 1 dialog is open after settle (poll for isAddDialogVisible) -> Confirmed
5. Verify dialog count = 1 (no stacking) -> Confirmed
6. Cleanup: click Cancel to close the single dialog; detach console listener

**Expected**: App-level modal guard blocks repeat dialog invocation while one is already open; rapid clicks collapse to a single dialog
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
1. Reload + navigate to **Shared Setup Locations** tab; ensure clean state
2. For each query in [Chicago, Boston, Marriott]:
 a. Click **Add** -> Dialog opens
 b. Search the query -> Dialog row count < `the configured max search results` (600)
 c. Select first dialog row -> Select enables
 d. Click **Select** -> Row added to main table
3. Click left-panel **Save** -> Confirm dialog -> Save succeeds
4. Reload + navigate back -> Verify table data row count = 1 + 3 (self + 3 added)
5. Cleanup (restore to baseline): delete all non-self rows + Save until only the self-row remains; reload + verify count = 1

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
1. baseline → `ensureCleanSSLTable` (also opens dialog via `click Add`)
2. act → `searchInDialog('A')` (1-char filter)
3. expectBeforeSave → poll `getDialogRowCount > 0` (some result rendered)
4. click Save and confirm the dialog → `clickDialogCancel` (no persistence — search is in-dialog filter)
5. reload → `reloadAndNavigateToSSLTab`
6. expectAfterReload → `getDataRowCount === 1` (only self, no leak)
7. cleanup → `ensureCleanSSLTable`

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
1. baseline → `ensureCleanSSLTable` + `click Add`
2. act → `searchInDialog(repeat 'X' 200 times)`
3. expectBeforeSave → poll dialog still visible + table state stable (no JS error)
4. click Save and confirm the dialog → `clickDialogCancel`
5. reload → `reloadAndNavigateToSSLTab`
6. expectAfterReload → `getDataRowCount === 1`
7. cleanup → `ensureCleanSSLTable`

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
1. baseline → `ensureCleanSSLTable` + `click Add`
2. act → `searchInDialog('Atlanta')` (filter to small N) → `searchInDialog('')` (clear)
3. expectBeforeSave → poll `getDialogRowCount >= 3000` (restored to bulk; per LR-022 no strict count)
4. click Save and confirm the dialog → `clickDialogCancel`
5. reload → `reloadAndNavigateToSSLTab`
6. expectAfterReload → `getDataRowCount === 1`
7. cleanup → `ensureCleanSSLTable`

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
1. baseline → `ensureCleanSSLTable` + `click Add`
2. act → `searchInDialog('&"\\'<>')` (mixed special chars)
3. expectBeforeSave → poll dialog visible + Select button stays disabled (no real row selected)
4. click Save and confirm the dialog → `clickDialogCancel`
5. reload → `reloadAndNavigateToSSLTab`
6. expectAfterReload → `getDataRowCount === 1`
7. cleanup → `ensureCleanSSLTable`

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
1. baseline → `ensureCleanSSLTable` + `click Add`
2. act → `searchInDialog(' ')` (3 spaces)
3. expectBeforeSave → poll dialog visible + Select stays disabled
4. click Save and confirm the dialog → `clickDialogCancel`
5. reload → `reloadAndNavigateToSSLTab`
6. expectAfterReload → `getDataRowCount === 1`
7. cleanup → `ensureCleanSSLTable`

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
1. baseline → `ensureCleanSSLTable` + `click Add`
2. act → `searchInDialog(' Atlanta ')` (leading/trailing 2-space wrap)
3. expectBeforeSave → poll `getDialogRowCount > 0` AND `getDialogRowCount < 600` (filtered to Atlanta region)
4. click Save and confirm the dialog → `clickDialogCancel`
5. reload → `reloadAndNavigateToSSLTab`
6. expectAfterReload → `getDataRowCount === 1`
7. cleanup → `ensureCleanSSLTable`

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
1. baseline → `ensureCleanSSLTable` + `click Add`
2. act → `searchInDialog('Atlanta')` → `searchInDialog('Boston')` (clear + retype)
3. expectBeforeSave → poll `getFirstDialogRowText.localOfficeName` does NOT contain "Atlanta" (final state = Boston filter)
4. click Save and confirm the dialog → `clickDialogCancel`
5. reload → `reloadAndNavigateToSSLTab`
6. expectAfterReload → `getDataRowCount === 1`
7. cleanup → `ensureCleanSSLTable`

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
1. baseline → `ensureCleanSSLTable` + `click Add`
2. act → `searchInDialog('Atlanta')` → capture initial row count → `searchInDialog('')` (clear via input.clear)
3. expectBeforeSave → poll restored count > filtered count (restored to bulk)
4. click Save and confirm the dialog → `clickDialogCancel`
5. reload → `reloadAndNavigateToSSLTab`
6. expectAfterReload → `getDataRowCount === 1`
7. cleanup → `ensureCleanSSLTable`

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
1. baseline → `ensureCleanSSLTable`
2. act → add 3 non-Miami rows (Chicago / Dallas / Denver) via search-select-add → save → reload → identify MIDDLE-by-add-order (row 1 in 0-indexed: Dallas) → `deleteNonSelfRow(middleIndex)`
3. expectBeforeSave → poll Save enabled
4. click Save and confirm the dialog → `click Save and confirm the dialog`
5. expectAfterSave → Save disabled
6. reload → `reloadAndNavigateToSSLTab`
7. expectAfterReload → `getDataRowCount === 3` (self + 2 remaining); assert remaining row offices = {Chicago, Denver}, NOT Dallas
8. cleanup → `ensureCleanSSLTable`

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
1. baseline → `ensureCleanSSLTable`
2. act → add 2 non-Miami rows (Atlanta, Boston) → save → reload → delete BOTH non-self rows (loop `findNonSelfRow` + `deleteNonSelfRow` until null)
3. expectBeforeSave → `getDataRowCount === 1` (only self in-page after deletes)
4. click Save and confirm the dialog → `click Save and confirm the dialog`
5. reload → `reloadAndNavigateToSSLTab`
6. expectAfterReload → `getDataRowCount === 1` (only self persisted)
7. cleanup → `ensureCleanSSLTable`

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
1. baseline → `ensureCleanSSLTable` → toggle self SI to known state (OFF, the default)
2. act → add 1 non-Miami row (Atlanta) → save → reload → toggle non-self row SI OFF (default = checked, so this toggles to false) → save
3. click Save and confirm the dialog → `click Save and confirm the dialog`
4. reload → `reloadAndNavigateToSSLTab`
5. expectAfterReload → `getSelfSharesInventoryState.checked === false` (UNCHANGED — self SI stays at baseline) AND `getNonSelfRowState(nsRow.index).sharesInventory.checked === false` (CHANGED — non-self toggled)
6. cleanup → `ensureCleanSSLTable`

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
1. baseline → `ensureCleanSSLTable`
2. act → add 5 non-Miami rows (Chicago / Boston / Dallas / Denver / Atlanta)
3. expectBeforeSave → poll Save enabled, `getDataRowCount === 6` (self + 5)
4. click Save and confirm the dialog → `click Save and confirm the dialog`
5. reload → `reloadAndNavigateToSSLTab`
6. expectAfterReload → `getDataRowCount === 6`; assert all 5 office codes present (content-based, no strict order per LR-053/LR-051)
7. cleanup → `ensureCleanSSLTable`

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
1. baseline → `ensureCleanSSLTable` → confirm self SI = unchecked (default)
2. act → add 1 non-Miami row (Atlanta) → save → reload → capture self SI state (false) → toggle non-self row SI OFF (no save yet)
3. expectBeforeSave → in-page state: `getSelfSharesInventoryState.checked === false` (still false — untouched) AND `getNonSelfRowState(nsRow.index).sharesInventory.checked === false` (was true default, now toggled)
4. click Save and confirm the dialog → `click Save and confirm the dialog` (commit the toggle to clean up the dirty state)
5. reload → `reloadAndNavigateToSSLTab`
6. expectAfterReload → self SI still false (post-save still unchanged)
7. cleanup → `ensureCleanSSLTable`

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
1. baseline → `ensureCleanSSLTable`
2. act (round-trip): toggle self SI ON → save → reload → assert checked → toggle self SI OFF → save → reload → assert UNCHECKED
3. click Save and confirm the dialog → `click Save and confirm the dialog` (final save in the round-trip; the lifecycle runner saves only once — the intermediate save is handled in the act step)
4. reload → `reloadAndNavigateToSSLTab` (final reload — second of two reloads in the round-trip)
5. expectAfterReload → `getSelfSharesInventoryState.checked === false` (final state)
6. cleanup → `ensureCleanSSLTable`

**Note**: this TC deviates from one-act-per-test purity for the round-trip motion — pattern parallels the equivalent Notes round-trip TC (edit-twice round-trip). The act step performs both legs of the round-trip; the final save, reload and post-reload check cover only the FINAL leg. The UI cache-invalidation behaviour is verified via the final reload; intermediate state is captured inline in the act step.

**Expected**: SI toggles ON → persists checked, toggles OFF → persists unchecked (full state-machine round-trip)
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
