# Location Shared Setup Locations Test Plan
**Module**: locations | **Test Cases**: [test-cases/locations/locations_shared_setup_locations_test_cases.md](../test-cases/locations/locations_shared_setup_locations_test_cases.md) | **Total**: 24

---

## Selector Mapping

| Selector Key | Locator | Source |
|---|---|---|
| tabSharedSetupLocations | [data-testid="location-settings-sub-tab-shared-setup-locations"] | shared-setup-locations.ts |
| tblSharedSetupLocations | [data-testid="location-settings-table-shared-setup"] | shared-setup-locations.ts |
| chkSelfPrimaryOffice | [data-testid="location-settings-table-shared-setup"] tbody tr:first-child td:nth-child(3) [role="checkbox"] | shared-setup-locations.ts |
| chkSelfSharesInventory | [data-testid="location-settings-table-shared-setup"] tbody tr:first-child td:nth-child(4) [role="checkbox"] | shared-setup-locations.ts |
| btnSelfDelete | [data-testid="location-settings-table-shared-setup"] tbody tr:first-child td:nth-child(5) button | shared-setup-locations.ts |
| btnSharedAdd | [data-testid="location-settings-table-shared-setup"] tbody tr:last-child button | shared-setup-locations.ts |
| dlgChangeLocalOffice | [role="dialog"]:has(h2) | shared-setup-locations.ts |
| dlgChangeLocalOfficeHeading | [role="dialog"] h2 | shared-setup-locations.ts |
| txtDlgSearch | [role="dialog"] input[placeholder="Search by Location Name, Number"] | shared-setup-locations.ts |
| tblDlgResults | [role="dialog"] table | shared-setup-locations.ts |
| btnDlgSelect | [role="dialog"] button:has-text("Select") | shared-setup-locations.ts |
| btnDlgCancel | [role="dialog"] button:has-text("Cancel") | shared-setup-locations.ts |
| btnDlgClose | [role="dialog"] button:last-of-type | shared-setup-locations.ts |
| dlgSaveChanges | [role="alertdialog"]:has-text("Save Changes") | shared.ts |
| btnSaveChangesConfirm | [role="alertdialog"]:has-text("Save Changes") button:has-text("Save") | shared.ts |
| btnSaveChangesCancel | [role="alertdialog"]:has-text("Save Changes") button:has-text("Cancel") | shared.ts |

**Non-self row selectors** (dynamic -- nth-child(N) where N>1):
- Primary Office: tblSharedSetupLocations >> tbody tr:nth-child(N) td:nth-child(3) [role="checkbox"]
- Shares Inventory: tblSharedSetupLocations >> tbody tr:nth-child(N) td:nth-child(4) [role="checkbox"]
- Delete: tblSharedSetupLocations >> tbody tr:nth-child(N) td:nth-child(5) button

---

## TC-LOC-SSL-001: Verify tab loads with table and Add button
1. Click tabSharedSetupLocations -- tabpanel visible
2. Assert tblSharedSetupLocations is visible
3. Assert btnSharedAdd is visible and enabled

## TC-LOC-SSL-002: Verify column headers
1. Click tabSharedSetupLocations
2. Assert column headers in tblSharedSetupLocations: "Local Office" | "Local Office Name" | "Primary Office" | "Shares Inventory" | ""

## TC-LOC-SSL-003: Verify self-location row default state
1. Click tabSharedSetupLocations
2. Assert first data row cells: "1604", "Parker Palm Springs"
3. Assert chkSelfPrimaryOffice is checked (aria-checked="true") and disabled
4. Assert chkSelfSharesInventory is unchecked (aria-checked="false") and enabled
5. Assert btnSelfDelete is disabled

## TC-LOC-SSL-004: Primary Office is read-only for self-location
1. Click tabSharedSetupLocations
2. Assert chkSelfPrimaryOffice has disabled attribute
3. Click chkSelfPrimaryOffice -- no state change (disabled element)
4. Assert chkSelfPrimaryOffice still checked

## TC-LOC-SSL-005: Delete button disabled for self-location
1. Click tabSharedSetupLocations
2. Assert btnSelfDelete is disabled
3. Attempt click on btnSelfDelete -- no action (disabled)

## TC-LOC-SSL-006: Shares Inventory toggle ON enables Save
1. Click tabSharedSetupLocations
2. Assert btnSave is disabled (no changes)
3. Click chkSelfSharesInventory -- becomes checked
4. Assert btnSave is enabled
5. **Cleanup**: Click chkSelfSharesInventory -- unchecked (no save needed since not persisted)

## TC-LOC-SSL-007: Reverting Shares Inventory disables Save
1. Click tabSharedSetupLocations
2. Click chkSelfSharesInventory -- checked, btnSave enabled
3. Click chkSelfSharesInventory -- unchecked (reverted)
4. Assert btnSave is disabled

## TC-LOC-SSL-008: Shares Inventory save and persist
1. Click tabSharedSetupLocations
2. Click chkSelfSharesInventory -- checked
3. Click btnSave -- dlgSaveChanges appears
4. Click btnSaveChangesConfirm -- saved, dialog closes
5. Reload page -- navigate to tabSharedSetupLocations
6. Assert chkSelfSharesInventory is checked (persisted)
7. **Cleanup**: Click chkSelfSharesInventory -- uncheck -- btnSave -- btnSaveChangesConfirm

## TC-LOC-SSL-009: Add button opens Change Local Office dialog
1. Click tabSharedSetupLocations
2. Click btnSharedAdd
3. Assert dlgChangeLocalOffice is visible
4. Assert dlgChangeLocalOfficeHeading text is "Change Local Office"
5. Assert txtDlgSearch is present
6. Assert tblDlgResults is present with rows
7. Assert btnDlgSelect is disabled
8. Assert btnDlgCancel is enabled
9. Click btnDlgCancel -- dialog closes

## TC-LOC-SSL-010: Dialog search filters by location name
1. Click tabSharedSetupLocations -- click btnSharedAdd
2. Fill txtDlgSearch with "Miami"
3. Wait 1500ms for filter
4. Assert tblDlgResults row count < 100 (filtered from 4614)
5. Assert at least one row contains "Miami" in Local Office Name column
6. Click btnDlgCancel

## TC-LOC-SSL-011: Dialog search filters by location number
1. Click tabSharedSetupLocations -- click btnSharedAdd
2. Fill txtDlgSearch with "1099"
3. Wait 1500ms
4. Assert tblDlgResults has exactly 1 row
5. Assert row shows "1099" and "Corporate Company"
6. Click btnDlgCancel

## TC-LOC-SSL-012: Dialog row selection enables Select button
1. Click tabSharedSetupLocations -- click btnSharedAdd
2. Assert btnDlgSelect is disabled
3. Fill txtDlgSearch with "1099" -- wait for 1 result
4. Click row checkbox ([role="checkbox"][aria-label="Select row"]) -- checked
5. Assert btnDlgSelect is enabled
6. Click btnDlgCancel

## TC-LOC-SSL-013: Add location via dialog Select button
1. Click tabSharedSetupLocations -- assert only self-row (1604) visible
2. Click btnSharedAdd -- dlgChangeLocalOffice opens
3. Fill txtDlgSearch with "1099" -- 1 result
4. Click row checkbox -- checked
5. Click btnDlgSelect -- dialog closes
6. Assert tblSharedSetupLocations has 2 data rows (1604 + added)
7. Assert new row shows added location number and name
8. Assert btnSave is enabled (form dirty)
9. **Cleanup**: Click Delete on added row -- navigate away (discard) or reload

## TC-LOC-SSL-014: Non-self row state verification
Precondition: Non-self location added (TC-LOC-SSL-013 flow)
1. Locate added (non-self) row in tblSharedSetupLocations
2. Assert row Primary Office checkbox: aria-checked="false" + disabled
3. Assert row Shares Inventory checkbox: aria-checked="true" + enabled
4. Assert row Delete button: enabled
5. **Cleanup**: Delete added row, discard changes

## TC-LOC-SSL-015: Delete non-self row (instant, no confirmation)
Precondition: Non-self location added
1. Assert tblSharedSetupLocations has 2+ data rows
2. Click Delete button on added row
3. Assert row is immediately removed (no alertdialog)
4. Assert tblSharedSetupLocations has only self-row + Add row
5. Assert btnSave is still enabled (dirty from add+delete)
6. **Cleanup**: Navigate away and discard, or reload

## TC-LOC-SSL-016: Cancel dialog does not modify table
1. Click tabSharedSetupLocations -- assert only self-row
2. Click btnSharedAdd -- dialog opens
3. Fill txtDlgSearch with "Miami"
4. Click a row checkbox -- checked, btnDlgSelect enabled
5. Click btnDlgCancel -- dialog closes
6. Assert tblSharedSetupLocations still has only self-row (1604)
7. Assert btnSave is disabled

## TC-LOC-SSL-017: Tab uses left-panel Save (no dedicated Save)
1. Click tabSharedSetupLocations
2. Assert no Save button inside Shared Setup Locations tabpanel
3. Click chkSelfSharesInventory -- btnSave enables
4. Click btnSave -- dlgSaveChanges appears
5. Assert dlgSaveChanges has Save and Cancel buttons
6. Click btnSaveChangesConfirm -- saved
7. **Cleanup**: Revert chkSelfSharesInventory -- save

## TC-LOC-SSL-018: Add location -> save -> reload -> persists
1. reloadAndNavigateToSSLTab -- ensureCleanSSLTable
2. clickAdd -- searchInDialog("Miami") -- poll getDialogRowCount < 100
3. Capture added row via findNonSelfRow (from TABLE, not dialog)
4. selectFirstDialogRow -- clickDialogSelect -- assert getDataRowCount=2
5. clickSave -- assert success
6. reloadAndNavigateToSSLTab -- assert getDataRowCount=2
7. findNonSelfRow -- assert localOffice + localOfficeName match captured values
8. **Cleanup**: deleteNonSelfRow(dynamic index) -- clickSave

## TC-LOC-SSL-019: Non-self SI toggle -> save -> reload -> persisted
1. reloadAndNavigateToSSLTab -- ensureCleanSSLTable
2. Add location via name search "Miami" -- clickSave -- reload
3. findNonSelfRow -- assert sharesInventory.checked=true (default)
4. toggleNonSelfSharesInventory(dynamic index) -- poll isSaveEnabled
5. clickSave -- reload -- assert sharesInventory.checked=false
6. **Cleanup**: deleteNonSelfRow(dynamic index) -- clickSave

## TC-LOC-SSL-020: Delete location -> save -> reload -> row removed
1. reloadAndNavigateToSSLTab -- ensureCleanSSLTable
2. Add location via name search "Miami" -- clickSave -- reload -- assert 2 rows
3. findNonSelfRow -- deleteNonSelfRow(dynamic index) -- poll getDataRowCount=1
4. clickSave -- reload -- assert getDataRowCount=1

## TC-LOC-SSL-021: Combined self SI + add location -> save -> reload -> both persisted
1. reloadAndNavigateToSSLTab -- ensureCleanSSLTable
2. toggleSelfSharesInventory -- add location via "Miami" name search
3. clickSave -- assert success
4. reload -- assert getSelfSharesInventoryState.checked=true AND getDataRowCount=2
5. **Cleanup**: try { setSelfSharesInventory(false) + deleteNonSelfRow + clickSave } catch { reload + ensureCleanSSLTable }

## TC-LOC-SSL-022: Cancel Save dialog -> changes not persisted
1. reloadAndNavigateToSSLTab -- ensureCleanSSLTable
2. toggleSelfSharesInventory -- assert checked=true, isSaveEnabled=true
3. openSaveDialog -- cancelSaveDialog -- assert isSaveEnabled still true
4. reloadAndNavigateToSSLTab -- assert getSelfSharesInventoryState.checked=false

## TC-LOC-SSL-023: Beforeunload fires when dirty
1. reloadAndNavigateToSSLTab -- ensureCleanSSLTable
2. toggleSelfSharesInventory -- poll isSaveEnabled=true
3. triggerBeforeunloadAndStay -- assert returned true
4. **Cleanup**: discardAndReturn

## TC-LOC-SSL-024: Already-added location absent from dialog
1. reloadAndNavigateToSSLTab -- ensureCleanSSLTable
2. Add location via "Miami" name search -- clickSave
3. findNonSelfRow -- capture localOffice number
4. clickAdd -- searchInDialog(captured number)
5. poll getDialogRowCount=1 -- getFirstDialogRowText -- assert localOffice != captured
6. clickDialogCancel
7. **Cleanup**: deleteNonSelfRow(dynamic index) -- clickSave

---

## History Coverage

Per PLAN_HIST_COLUMN_FIRST_PIVOT (2026-04-20), Shared Setup Locations hist tracking is verified by the dedicated Location Management History per-column suite (see SP-D7). SSL-relevant columns in the 87-col history table:

- cols 59-61: Action / ID / Name of Shared Setup Location
