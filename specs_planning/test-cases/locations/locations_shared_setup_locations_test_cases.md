# Location Shared Setup Locations Test Cases
**Module**: locations | **Total**: 17 | **Status**: Manual | **Updated**: 2026-02-25

---

## FIELD INVENTORY

**Main Table** (5 columns — Location 1604 self-row):

| Field | Element | State (self-row) | Value (1604) |
|---|---|---|---|
| Location No | static text | display-only | 1604 |
| Location Name | static text | display-only | Parker Palm Springs |
| Primary Office | checkbox | **disabled + checked** | ✓ |
| Shares Inventory | checkbox | **editable** | unchecked |
| (Actions) | button (Delete) | **disabled** for self | — |

**Add Button**: Opens "Select Location" dialog (bottom of table)

**Select Location Dialog** (opened via Add):

| Field | Element | State | Notes |
|---|---|---|---|
| Search | text input | editable | By Location Name or Number |
| Clear (×) | button | enabled when text present | Clears search |
| Results Table | 2-col table (Location No, Location Name) | read-only | "No results." when empty |
| Close | button | always enabled | Closes dialog, no selection made |

**Row selection mechanism**: Unknown — not verifiable in training env (dialog returns no results for all queries). No visible Select button observed. TCs requiring row selection are marked **Blocked (training-env)**.

**Save Flow**: Left-panel Save -- Save Changes confirmation dialog. No dedicated tab Save.

---

## TC-LOC-SSL-001: Verify tab loads with table and Add button
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**:
1. Navigate to Setup > Location > 1604 -- click **Shared Setup Locations** tab ✓ Tab activates
2. Verify a table is visible ✓ Table has 5 columns: Location No, Location Name, Primary Office, Shares Inventory, (Actions)
3. Verify **Add** button is visible below the table ✓ Add button present

**Expected**: Tab renders table with 5-column layout and Add button at bottom
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-SSL-002: Verify column headers order
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Steps**:
1. Navigate to **Shared Setup Locations** tab ✓ Tab loads
2. Inspect column headers left-to-right ✓ Order: Location No | Location Name | Primary Office | Shares Inventory | (no header for Actions)

**Expected**: 5 columns in order with no header on last (Actions) column
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-SSL-003: Verify self-location row initial state
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**:
1. Navigate to **Shared Setup Locations** tab ✓ Tab loads
2. Locate row with Location No **1604** ✓ Row present
3. Verify **Primary Office** checkbox is checked and disabled ✓ Checked + disabled
4. Verify **Shares Inventory** checkbox is unchecked and editable ✓ Unchecked, cursor pointer
5. Verify **Delete** button is disabled ✓ Delete button disabled

**Expected**: Self-location (1604) row has Primary Office locked-checked, Shares Inventory editable-unchecked, Delete disabled
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-SSL-004: Primary Office is read-only for self-location
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Validation |

**Steps**:
1. Navigate to **Shared Setup Locations** tab ✓ Tab loads
2. Attempt to click **Primary Office** checkbox in row 1604 ✓ No interaction — checkbox is disabled
3. Verify checkbox state unchanged ✓ Still checked

**Expected**: Primary Office cannot be unchecked for self-location; clicking is a no-op
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-SSL-005: Delete button disabled for self-location
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Validation |

**Steps**:
1. Navigate to **Shared Setup Locations** tab ✓ Tab loads
2. Inspect **Delete** button for row 1604 ✓ Button is disabled (aria-disabled or disabled attribute)
3. Attempt to click Delete ✓ No action — button does not respond

**Expected**: Delete button is disabled for self-location; self-row cannot be removed
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-SSL-006: Shares Inventory toggle ON enables Save
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Interaction |

**Preconditions**: Shares Inventory is unchecked for 1604

**Steps**:
1. Navigate to **Shared Setup Locations** tab ✓ Tab loads, Save button is disabled
2. Click **Shares Inventory** checkbox in row 1604 ✓ Checkbox becomes checked
3. Observe Save button state ✓ Save button becomes enabled

**Expected**: Toggling Shares Inventory marks form as dirty, enables left-panel Save
**Data**: office=1604
**Cleanup**: Uncheck **Shares Inventory** -- click **Save** -- click **Save** in dialog -- verify unchecked
**Automatable**: Yes

---

## TC-LOC-SSL-007: Reverting Shares Inventory disables Save
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Interaction |

**Preconditions**: Shares Inventory is unchecked for 1604

**Steps**:
1. Navigate to **Shared Setup Locations** tab ✓ Tab loads
2. Click **Shares Inventory** checkbox ✓ Becomes checked, Save enabled
3. Click **Shares Inventory** again ✓ Becomes unchecked (reverted to original)
4. Observe Save button state ✓ Save button is disabled again

**Expected**: Reverting to original state removes dirty flag, Save disables
**Data**: office=1604
**Cleanup**: TC self-reverts in step 3 (Shares Inventory restored to unchecked). If any residual dirty state remains, uncheck **Shares Inventory** -- **Save** -- confirm.
**Automatable**: Yes

---

## TC-LOC-SSL-008: Shares Inventory — save and persist
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Persistence |

**Preconditions**: Shares Inventory is unchecked for 1604

**Steps**:
1. Navigate to **Shared Setup Locations** tab ✓ Tab loads
2. Click **Shares Inventory** checkbox ✓ Becomes checked
3. Click **Save** (left-panel) ✓ Save Changes confirmation dialog appears
4. Click **Save** in dialog ✓ Data saved, dialog closes
5. Reload page and navigate back to **Shared Setup Locations** tab ✓ Tab loads
6. Verify **Shares Inventory** for row 1604 is checked ✓ Persisted

**Expected**: Checked state persists after save + reload
**Data**: office=1604
**Cleanup**: Toggle Shares Inventory OFF -- Save to restore original state
**Automatable**: Yes

---

## TC-LOC-SSL-009: Add button opens Select Location dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**:
1. Navigate to **Shared Setup Locations** tab ✓ Tab loads
2. Click **Add** button below the table ✓ "Select Location" dialog opens
3. Verify dialog contains: heading "Select Location", search input labeled "Search by Location Name, Number", results table (2 cols: Location No, Location Name), Close button ✓ All elements present

**Expected**: Select Location dialog opens with search input, results table, and Close button
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-SSL-010: Select Location dialog — search by location name
| Priority | Status | Type |
|----------|--------|------|
| Medium | Blocked (training-env) | Interaction |

**Steps**: Blocked in training environment — see "When unblocked, verify" section below.

**Blocked**: Training env returns "No results." for all search queries — cannot verify match behavior or confirm row-selection mechanism.

**When unblocked, verify**:
1. Click **Add** -- "Select Location" dialog opens ✓ Dialog visible
2. Type a known location name in the search field ✓ Field accepts input
3. Wait for results ✓ Table updates showing matching rows (Location No + Location Name)

**Expected**: Search input filters results table by location name; matching rows shown; "No results." when no match exists
**Data**: office=1604
**Automatable**: Blocked:Cat-A training-env

---

## TC-LOC-SSL-011: Select Location dialog — search by location number
| Priority | Status | Type |
|----------|--------|------|
| Medium | Blocked (training-env) | Interaction |

**Steps**: Blocked in training environment — see "When unblocked, verify" section below.

**Blocked**: Training env returns "No results." for all search queries — cannot verify match behavior.

**When unblocked, verify**:
1. Click **Add** -- "Select Location" dialog opens ✓ Dialog visible
2. Type a known location number in the search field ✓ Field accepts input
3. Wait for results ✓ Table updates showing matching row(s)

**Expected**: Search input filters results table by location number; matching rows shown; "No results." when no number matches
**Data**: office=1604
**Automatable**: Blocked:Cat-A training-env

---

## TC-LOC-SSL-012: Select Location dialog — clear search
| Priority | Status | Type |
|----------|--------|------|
| Low | Blocked (training-env) | Interaction |

**Steps**: Blocked in training environment — see "When unblocked, verify" section below.

**Blocked**: Training env returns "No results." for all queries — cleared state is indistinguishable from searched state; default state (empty table vs. full list) cannot be confirmed.

**When unblocked, verify**:
1. Click **Add** -- dialog opens ✓ Dialog visible
2. Type any text in search field ✓ Text entered, clear (×) button appears
3. Click the clear (×) button ✓ Search field clears
4. Verify results return to initial state ✓ Results match the state displayed when dialog first opened

**Expected**: Clear button removes search text; results return to dialog's initial state (document observed behavior: empty table or pre-populated list)
**Data**: office=1604
**Automatable**: Blocked:Cat-A training-env

---

## TC-LOC-SSL-013: Select Location dialog — close without selecting
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Interaction |

**Steps**:
1. Click **Add** -- dialog opens ✓ Dialog visible
2. Optionally type in search field ✓ (no selection made)
3. Click **Close** button ✓ Dialog closes
4. Verify main table still shows only row 1604 ✓ No new row added

**Expected**: Closing dialog without selecting a location makes no change to the table
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-SSL-014: Tab uses left-panel Save (no dedicated Save)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Validation |

**Steps**:
1. Navigate to **Shared Setup Locations** tab ✓ Tab loads
2. Inspect the tabpanel for a dedicated Save button ✓ No dedicated Save found inside Shared Setup Locations tabpanel
3. Toggle **Shares Inventory** ✓ Left-panel Save becomes enabled
4. Click left-panel **Save** ✓ Save Changes confirmation dialog appears, data saves on confirm

**Expected**: No dedicated Save inside this tab; save is done via left-panel Save with confirmation dialog
**Data**: office=1604
**Cleanup**: Revert Shares Inventory -- Save
**Automatable**: Yes

---

## TC-LOC-SSL-015: Add non-self location to shared setup — blocked (training-env)
| Priority | Status | Type |
|----------|--------|------|
| High | Blocked (training-env) | User-Requested |

**Steps**: Blocked in training environment — see "When unblocked, verify" section below.

**Blocked**: Training environment Search dialog returns "No results." for all queries — impossible to select and add a non-self location row.

**When unblocked, verify**:
1. Navigate to **Shared Setup Locations** tab ✓ Tab loads, only self-row (1604) present
2. Click **Add** -- "Select Location" dialog opens ✓ Dialog visible
3. Search for a valid location -- click the result row to select it ✓ Dialog closes, new row appears in table
4. Verify new row: Location No filled, Location Name filled, **Primary Office** unchecked+enabled, **Shares Inventory** unchecked+enabled, **Delete** enabled ✓ All columns correct
5. Click **Save** -- confirm -- reload -- navigate back to tab ✓ Added row persists

**Expected**: Non-self location can be added via picker; row appears with editable Primary Office and Shares Inventory; Delete enabled
**Data**: office=1604
**Cleanup**: Delete the added row -- **Save** -- confirm -- verify table returns to self-row only
**Automatable**: Blocked:Cat-A training-env

---

## TC-LOC-SSL-016: Primary Office checkbox behavior on non-self row — blocked (training-env)
| Priority | Status | Type |
|----------|--------|------|
| High | Blocked (training-env) | User-Requested |

**Steps**: Blocked in training environment — see "When unblocked, verify" section below.

**Blocked**: Cannot add a non-self location row in training environment (dialog returns no results).

**When unblocked, verify**:
1. Add a non-self location to the table (per TC-LOC-SSL-015 precondition) ✓ Non-self row present
2. Verify **Primary Office** in added row is unchecked and editable ✓ Unchecked, pointer cursor
3. Check **Primary Office** in the added row ✓ Checkbox becomes checked
4. Verify self-row (1604) **Primary Office** remains checked+disabled ✓ Unaffected by change on added row
5. Verify if checking a second Primary Office deselects the first (single-select behavior) — document actual enforced behavior

**Expected**: Non-self rows have editable Primary Office; self-row remains locked; single-select enforcement (if any) documented from observed behavior
**Data**: office=1604
**Cleanup**: Uncheck Primary Office on added row (if changed) -- Delete added row -- **Save** -- confirm
**Automatable**: Blocked:Cat-A training-env

---

## TC-LOC-SSL-017: Delete enabled and functional for non-self location row — blocked (training-env)
| Priority | Status | Type |
|----------|--------|------|
| High | Blocked (training-env) | User-Requested |

**Steps**: Blocked in training environment — see "When unblocked, verify" section below.

**Blocked**: Cannot add a non-self location row in training environment (dialog returns no results).

**When unblocked, verify**:
1. Add a non-self location to the table (per TC-LOC-SSL-015 precondition) ✓ Non-self row present
2. Verify **Delete** button in the added row is enabled ✓ Enabled, cursor pointer
3. Verify **Delete** button in self-row (1604) remains disabled ✓ Self-row Delete still disabled
4. Click **Delete** on the added row ✓ Row removed from table (or confirmation dialog appears — document behavior)
5. Click **Save** -- confirm -- reload -- navigate to tab ✓ Deleted row no longer present

**Expected**: Delete is enabled only for non-self rows; clicking Delete removes the row; deletion persists after save + reload
**Data**: office=1604

**Automatable**: Blocked:Cat-A training-env