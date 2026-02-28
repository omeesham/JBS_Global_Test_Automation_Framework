# Location Shared Setup Locations Test Plan
**Module**: locations | **Test Cases**: [test-cases/locations/locations_shared_setup_locations_test_cases.md](../test-cases/locations/locations_shared_setup_locations_test_cases.md) | **Total**: 17

---

## Selector Mapping

| Selector Key | Locator |
|---|---|
| `tabSharedSetupLocations` | `tab:has-text("Shared Setup Locations")` |
| `tblSharedSetupLocations` | `tabpanel:has([role="columnheader"]:has-text("Shares Inventory")) table` |
| `btnSharedAdd` | `tabpanel:has([role="columnheader"]:has-text("Shares Inventory")) button:has-text("Add")` |
| `chkSharedPrimaryOffice` | `tabpanel:has([role="columnheader"]:has-text("Shares Inventory")) tbody tr:first-child td:nth-child(3) [role="checkbox"]` |
| `chkSharedSharesInventory` | `tabpanel:has([role="columnheader"]:has-text("Shares Inventory")) tbody tr:first-child td:nth-child(4) [role="checkbox"]` |
| `btnSharedDelete` | `tabpanel:has([role="columnheader"]:has-text("Shares Inventory")) tbody tr:first-child button:has-text("Delete")` |
| `dlgSelectLocation` | `[role="dialog"]:has(h2:has-text("Select Location"))` |
| `txtSelectLocationSearch` | `[role="dialog"]:has(h2:has-text("Select Location")) input` |
| `btnSelectLocationClose` | `[role="dialog"]:has(h2:has-text("Select Location")) button:has-text("Close")` |
| `btnSelectLocationClearSearch` | `[role="dialog"]:has(h2:has-text("Select Location")) input + button` |
| `tblSelectLocationResults` | `[role="dialog"]:has(h2:has-text("Select Location")) table` |
| `btnSave` | `form:has(input[name="localOfficeName"]) button:has-text("Save")` |
| `dlgSaveChanges` | `[role="alertdialog"]:has-text("Save Changes")` |
| `btnSaveChangesConfirm` | `[role="alertdialog"]:has-text("Save Changes") button:has-text("Save")` |

---

## TC-LOC-SSL-001: Verify tab loads with table and Add button
1. Click `tabSharedSetupLocations` -- tabpanel visible
2. Assert `tblSharedSetupLocations` is visible
3. Assert `btnSharedAdd` is visible

## TC-LOC-SSL-002: Verify column headers order
1. Click `tabSharedSetupLocations`
2. Assert column headers: "Location No" | "Location Name" | "Primary Office" | "Shares Inventory" | (empty)

## TC-LOC-SSL-003: Verify self-location row initial state
1. Click `tabSharedSetupLocations`
2. Assert first data row cell "1604" and "Parker Palm Springs" visible
3. Assert `chkSharedPrimaryOffice` is checked + disabled
4. Assert `chkSharedSharesInventory` is unchecked + enabled
5. Assert `btnSharedDelete` is disabled

## TC-LOC-SSL-004: Primary Office is read-only for self-location
1. Click `tabSharedSetupLocations`
2. Assert `chkSharedPrimaryOffice` has disabled attribute
3. Click `chkSharedPrimaryOffice` -- no state change (disabled)
4. Assert `chkSharedPrimaryOffice` still checked

## TC-LOC-SSL-005: Delete button disabled for self-location
1. Click `tabSharedSetupLocations`
2. Assert `btnSharedDelete` is disabled
3. Attempt click on `btnSharedDelete` -- no action (disabled)

## TC-LOC-SSL-006: Shares Inventory toggle ON enables Save
1. Click `tabSharedSetupLocations`
2. Assert `btnSave` is disabled (no changes)
3. Click `chkSharedSharesInventory` -- becomes checked
4. Assert `btnSave` is enabled
5. **Cleanup**: Click `chkSharedSharesInventory` -- unchecked -- assert `btnSave` disabled (no save needed since not persisted)

## TC-LOC-SSL-007: Reverting Shares Inventory disables Save
1. Click `tabSharedSetupLocations`
2. Click `chkSharedSharesInventory` -- checked, `btnSave` enabled
3. Click `chkSharedSharesInventory` -- unchecked (reverted)
4. Assert `btnSave` is disabled
5. **Cleanup**: TC self-reverts in step 3. If any residual dirty state: uncheck `chkSharedSharesInventory` -- `btnSave` -- `btnSaveChangesConfirm`

## TC-LOC-SSL-008: Shares Inventory — save and persist
1. Click `tabSharedSetupLocations`
2. Click `chkSharedSharesInventory` -- checked
3. Click `btnSave` -- `dlgSaveChanges` appears
4. Click `btnSaveChangesConfirm` -- saved, dialog closes
5. Reload page -- navigate to `tabSharedSetupLocations`
6. Assert `chkSharedSharesInventory` is checked (persisted)
7. **Cleanup**: uncheck `chkSharedSharesInventory` -- `btnSave` -- `btnSaveChangesConfirm`

## TC-LOC-SSL-009: Add button opens Select Location dialog
1. Click `tabSharedSetupLocations`
2. Click `btnSharedAdd`
3. Assert `dlgSelectLocation` is visible
4. Assert heading "Select Location" present
5. Assert `txtSelectLocationSearch` present
6. Assert `tblSelectLocationResults` present
7. Assert `btnSelectLocationClose` present
8. Click `btnSelectLocationClose` -- dialog closes

## TC-LOC-SSL-010: Select Location dialog — search by location name
> **Blocked (training-env)**: dialog returns no results for all queries; match behavior unverifiable.
1. Click `tabSharedSetupLocations` -- click `btnSharedAdd`
2. Assert `dlgSelectLocation` visible
3. Fill `txtSelectLocationSearch` with known location name
4. Wait 1500ms
5. Assert `tblSelectLocationResults` shows matching rows (not "No results.")
6. Click `btnSelectLocationClose`

## TC-LOC-SSL-011: Select Location dialog — search by location number
> **Blocked (training-env)**: dialog returns no results for all queries; match behavior unverifiable.
1. Click `tabSharedSetupLocations` -- click `btnSharedAdd`
2. Fill `txtSelectLocationSearch` with known location number
3. Wait 1500ms
4. Assert `tblSelectLocationResults` shows matching rows
5. Click `btnSelectLocationClose`

## TC-LOC-SSL-012: Select Location dialog — clear search
> **Blocked (training-env)**: default state (empty table vs. full list) cannot be determined when env returns no results.
1. Click `tabSharedSetupLocations` -- click `btnSharedAdd`
2. Fill `txtSelectLocationSearch` with text
3. Click `btnSelectLocationClearSearch`
4. Assert `txtSelectLocationSearch` is empty
5. Assert `tblSelectLocationResults` returns to initial-open state (document actual behavior when unblocked)
6. Click `btnSelectLocationClose`

## TC-LOC-SSL-013: Select Location dialog — close without selecting
1. Click `tabSharedSetupLocations` -- click `btnSharedAdd`
2. Assert `dlgSelectLocation` visible
3. Click `btnSelectLocationClose`
4. Assert `dlgSelectLocation` not visible
5. Assert `tblSharedSetupLocations` row count unchanged (only self-row)

## TC-LOC-SSL-014: Tab uses left-panel Save (no dedicated Save)
1. Click `tabSharedSetupLocations`
2. Assert no Save button inside the Shared Setup Locations tabpanel
3. Click `chkSharedSharesInventory` -- `btnSave` enables
4. Click `btnSave` -- `dlgSaveChanges` appears
5. Assert confirm/cancel buttons present
6. Click `btnSaveChangesConfirm` -- saved
7. **Cleanup**: revert `chkSharedSharesInventory` -- save

## TC-LOC-SSL-015: Add non-self location to shared setup — blocked (training-env)
> **Blocked (training-env)**: dialog returns no results; cannot select a location to add.
1. Click `tabSharedSetupLocations` -- assert only self-row (1604) present
2. Click `btnSharedAdd` -- `dlgSelectLocation` visible
3. Search and click result row -- dialog closes, new row in table
4. Assert new row: Location No, Location Name, Primary Office unchecked+enabled, Shares Inventory unchecked+enabled, Delete enabled
5. Click `btnSave` -- `btnSaveChangesConfirm` -- reload -- assert row persists
6. **Cleanup**: Delete added row -- `btnSave` -- `btnSaveChangesConfirm` -- assert self-row only

## TC-LOC-SSL-016: Primary Office checkbox behavior on non-self row — blocked (training-env)
> **Blocked (training-env)**: cannot add a non-self row.
1. Add non-self location (TC-LOC-SSL-015 precondition)
2. Assert added row `chkSharedPrimaryOffice` is unchecked + enabled
3. Click `chkSharedPrimaryOffice` on added row -- becomes checked
4. Assert self-row `chkSharedPrimaryOffice` still checked + disabled
5. Document whether single-select is enforced (first Primary Office deselects when second checked)
6. **Cleanup**: Uncheck Primary Office on added row -- Delete row -- save

## TC-LOC-SSL-017: Delete enabled and functional for non-self row — blocked (training-env)
> **Blocked (training-env)**: cannot add a non-self row.
1. Add non-self location (TC-LOC-SSL-015 precondition)
2. Assert added row `btnSharedDelete` is enabled
3. Assert self-row `btnSharedDelete` is disabled
4. Click enabled `btnSharedDelete` -- row removed (document if confirmation dialog appears)
5. Click `btnSave` -- `btnSaveChangesConfirm` -- reload -- assert deleted row gone
