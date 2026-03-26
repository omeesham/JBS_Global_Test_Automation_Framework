# Location Legal Test Cases
**Module**: locations | **Total**: 15 | **Status**: Manual | **Updated**: 2026-03-18

---

## MCP_VERIFICATION_LOG

| Field | Value |
|-------|-------|
| Date | 2026-03-18 |
| URL | https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location |
| Office/Entity | 1604 (Parker Palm Springs) |
| Total fields found | 3 (Language Name [static], Service Charge Name [combobox], Terms and Conditions Name [combobox]) |
| Total fields tested (edit+save) | 2 (Service Charge Name, Terms and Conditions Name) |
| Save dialog | Yes -- heading "Save Changes", body "Are you sure you want to save the changes?", buttons Cancel + Save |
| Column headers | Language Name, Service Charge Name, Terms and Conditions Name |
| Dropdown options | Service Charge Name: 114 options (first 10: Service Charge, Administrative Fee, Hotel Service Charge, Marriott Hotel Service Charge, Resort Service Charge, Standard 22% Resort Service Charge, Hotel collected Service Charge, Marriott 2013 Service Charge, NoCharge, ETS) |
| Dropdown options | Terms and Conditions Name: 50 options (Service Charges, Administration Fees, Service Charges (Hilton), Administration Fees (Hilton), LDW, Marriott 2013 Service Charge, ET Support and LDW, Admin Fee + LDW, ... Encore Terms and Conditions, Show Quote, Show Quote MX (Eng)) |
| Cascade behaviors | Country change in left panel resets both SC and T&C values for all language rows |
| Input attribute types | SC combobox: data-testid="location-settings-select-legal-0-service-charge" role="combobox" aria-expanded / T&C combobox: data-testid="location-settings-select-legal-0-terms" role="combobox" |
| Validation error patterns | Not directly testable for Legal -- errors manifest via !isValidLegalData() blocking left-panel Save |
| Input masks/formatting | N/A -- dropdowns only, no free-text input |
| Filtering mechanism | No search/filter in SC or T&C dropdowns -- full list rendered |
| API loading | Legal tab: table loads immediately after tab click (~1s) |
| Strict mode risks | None -- all selectors use data-testid, unique per querySelectorAll |
| Form structure | Save button: shared left-panel [data-testid="location-settings-btn-save"], NOT inside Legal tabpanel |
| Dialog side effects | Save Changes dialog: Cancel=safe (no save), Save=persists |
| Post-reload timing | SC and T&C comboboxes load together (~1s after tab render) |
| Readiness signal | Wait for combobox [data-testid="location-settings-select-legal-0-service-charge"] to have non-empty text |
| Boundary behaviors | N/A -- no free-text input fields on Legal tab |

### CORRECTIONS FROM PREVIOUS VERSION (2026-02-19)
| Issue | Old (Wrong) | New (Correct) |
|-------|-------------|---------------|
| Default SC value | "Service Charge" | "Resort Service Charge" |
| Legal Save button | Dedicated Legal Save at top-right | NO dedicated Legal Save -- uses shared left-panel Save |
| Save revert behavior | Reverting to original re-disables Save | Save stays enabled after any change, even if reverted |
| SC dropdown search | Hidden search combobox | No search/filter in dropdown |
| SC option count | 100+ | 114 |
| T&C option count | 50+ | 50 |
| Selectors | None documented with data-testid | Full data-testid selectors verified |

---

## FIELD INVENTORY & DISCOVERY

**Legal Grid** (3 columns, 1 data row for office 1604):
| # | Field | Type | Default (1604) | State | Selector |
|---|-------|------|----------------|-------|----------|
| 1 | Language Name | static text (td) | US English | read-only | N/A (plain text cell, no interactable element) |
| 2 | Service Charge Name | combobox (button role=combobox) | Resort Service Charge | editable, 114 options | `[data-testid="location-settings-select-legal-0-service-charge"]` |
| 3 | Terms and Conditions Name | combobox (button role=combobox) | LDW | editable, 50 options | `[data-testid="location-settings-select-legal-0-terms"]` |

**Table**: `[data-testid="location-settings-table-legal"]` -- has `<thead>` (3 column headers) + `<tbody>` (data rows).

**Save Button**: Shared left-panel Save `[data-testid="location-settings-btn-save"]`. Disabled by default. Enabled when any field changes (Legal OR other tabs). NOT a dedicated Legal Save.

**Save Dialog**: `[role="alertdialog"]` -- heading "Save Changes", body "Are you sure you want to save the changes?", buttons: Cancel, Save. No data-testid on dialog elements.

**Dirty-State Tracking**: Once ANY dropdown value is changed, Save enables. Reverting to the original value does NOT re-disable Save. Only a page reload or successful save resets dirty state.

**Validation Rules**:
- `SCNAME_IS_REQD`: Service Charge cannot be null/empty
- `TCNAME_IS_REQD`: Terms and Conditions cannot be null/empty
- `!isValidLegalData()`: Invalid Legal data blocks left-panel Save

**Country Change Cascade**: Changing Country in left panel resets both Service Charge Name and Terms and Conditions Name for all language rows.

---

## TC-LOC-LGL-001: Verify Legal grid default structure
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Automatable**: Yes

**Steps**:
1. Navigate to Setup > Location > 1604 > **Basic Information** tab -> Page loads with left panel and sub-tabs
2. Click **Legal** sub-tab -> Legal tabpanel renders
3. Verify table has 3 column headers: **Language Name**, **Service Charge Name**, **Terms and Conditions Name** -> All 3 visible
4. Count rows in `<tbody>` -> 1 data row (US English)

**Expected**: Table with 3 columns and 1 row (US English) visible in Legal tabpanel
**Data**: office=1604

---

## TC-LOC-LGL-002: Verify Legal grid default field values
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab -> Tab loads
2. Verify US English row cell 1 -> Text "US English" (static, no combobox)
3. Verify US English row cell 2 -> Combobox showing "Resort Service Charge"
4. Verify US English row cell 3 -> Combobox showing "LDW"

**Expected**: US English row shows: Language Name = "US English", Service Charge Name = "Resort Service Charge", Terms and Conditions Name = "LDW"
**Data**: office=1604

---

## TC-LOC-LGL-003: Verify Language Name cell is read-only
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab -> Tab loads
2. Verify Language Name cell ("US English") -> No combobox or button rendered, plain text only
3. Verify no interactive element exists in first column cell -> Static `<td>` with text content

**Expected**: Language Name column is read-only static text, no editing possible
**Data**: office=1604

---

## TC-LOC-LGL-004: Verify Service Charge Name dropdown opens and shows options
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab -> Tab loads
2. Click **Service Charge Name** combobox in US English row -> Dropdown listbox opens
3. Verify options are visible -> 114 options listed (including "Service Charge", "Administrative Fee", "Hotel Service Charge", "Resort Service Charge", "ETS", "NoCharge")
4. Verify current selection state -> "Resort Service Charge" has `data-state="checked"`
5. Press Escape -> Dropdown closes, value unchanged

**Expected**: Dropdown opens with 114 service charge options; currently selected option "Resort Service Charge" is visually indicated; Escape closes dropdown without changing value
**Data**: office=1604

---

## TC-LOC-LGL-005: Verify Terms and Conditions Name dropdown opens and shows options
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab -> Tab loads
2. Click **Terms and Conditions Name** combobox in US English row -> Dropdown listbox opens
3. Verify options are visible -> 50 options listed (including "LDW", "Encore Terms and Conditions", "Blank", "Show Quote", "ETS (No LDW)")
4. Verify current selection state -> "LDW" has `data-state="checked"`
5. Press Escape -> Dropdown closes, value unchanged

**Expected**: Dropdown opens with 50 T&C options; currently selected "LDW" is visually indicated; Escape closes without changing value
**Data**: office=1604

---

## TC-LOC-LGL-006: Verify no search/filter exists in dropdowns
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab -> Tab loads
2. Click **Service Charge Name** combobox -> Dropdown opens
3. Verify no search input or filter textbox exists in the dropdown -> Full list of 114 options rendered directly
4. Press Escape -> Dropdown closes
5. Click **Terms and Conditions Name** combobox -> Dropdown opens
6. Verify no search input or filter textbox exists -> Full list of 50 options rendered directly
7. Press Escape -> Dropdown closes

**Expected**: Neither dropdown has a search/filter input -- all options are rendered in a flat list
**Data**: office=1604

---

## TC-LOC-LGL-007: Left-panel Save button disabled by default (no changes)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | State |

**Automatable**: Yes

**Steps**:
1. Navigate to Setup > Location > 1604 (fresh page load) -> Page loads
2. Click **Legal** tab -> Tab loads with default values
3. Make no changes -> Both comboboxes show defaults
4. Verify left-panel **Save** button -> Disabled (`[disabled]` attribute present)

**Expected**: Left-panel Save button is disabled when no changes have been made to any field on the page
**Data**: office=1604

---

## TC-LOC-LGL-008: Changing Service Charge Name enables left-panel Save button
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | State |

**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab (fresh page load) -> Tab loads
2. Verify left-panel **Save** button -> Disabled
3. Click **Service Charge Name** combobox -> Select "Administrative Fee" -> Value updates to "Administrative Fee"
4. Verify left-panel **Save** button -> Now enabled (not disabled)

**Expected**: Changing Service Charge Name enables the shared left-panel Save button
**Data**: office=1604
**Cleanup**: Reload page without saving (accept beforeunload dialog) to discard change

---

## TC-LOC-LGL-009: Changing Terms and Conditions Name enables left-panel Save button
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | State |

**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab (fresh page load) -> Tab loads
2. Verify left-panel **Save** button -> Disabled
3. Click **Terms and Conditions Name** combobox -> Select "Encore Terms and Conditions" -> Value updates
4. Verify left-panel **Save** button -> Now enabled (not disabled)

**Expected**: Changing T&C Name enables the shared left-panel Save button
**Data**: office=1604
**Cleanup**: Reload page without saving to discard change

---

## TC-LOC-LGL-010: Reverting dropdowns to original values does NOT re-disable Save
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | State |

**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab (fresh page load) -> Tab loads
2. Change **Service Charge Name** from "Resort Service Charge" to "Administrative Fee" -> Save enables
3. Change **Service Charge Name** back to "Resort Service Charge" -> Value reverted to original
4. Verify left-panel **Save** button -> Still enabled (NOT re-disabled)

**Expected**: Reverting a dropdown to its original value does NOT re-disable the Save button. The form dirty-state tracking does not detect net-zero changes. The beforeunload dialog will also trigger on navigation attempts.
**Data**: office=1604
**Cleanup**: Reload page without saving to discard change

---

## TC-LOC-LGL-011: Save Service Charge change persists after save and reload
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab (fresh page load) -> Defaults loaded: SC = "Resort Service Charge"
2. Click **Service Charge Name** combobox -> Select "Administrative Fee" -> Value updates
3. Verify left-panel **Save** button -> Enabled
4. Click left-panel **Save** button -> Save Changes dialog appears: heading "Save Changes", body "Are you sure you want to save the changes?"
5. Click **Save** button in dialog -> Save executes, dialog closes
6. Verify left-panel **Save** button -> Returns to disabled (changes saved)
7. Reload page -> Page reloads
8. Click **Legal** tab -> Verify **Service Charge Name** -> Displays "Administrative Fee" (persisted)
9. **Cleanup**: Change **Service Charge Name** back to "Resort Service Charge" -> Click Save -> Confirm dialog -> Verify restored

**Expected**: Legal data change persists through Save and page reload; Save button re-disables after successful save
**Data**: office=1604, changeValue="Administrative Fee", originalValue="Resort Service Charge"

---

## TC-LOC-LGL-012: Save Terms and Conditions change persists after save and reload
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab (fresh page load) -> Defaults loaded: T&C = "LDW"
2. Click **Terms and Conditions Name** combobox -> Select "Encore Terms and Conditions" -> Value updates
3. Click left-panel **Save** button -> Save Changes dialog appears
4. Click **Save** in dialog -> Save executes
5. Reload page -> Page reloads
6. Click **Legal** tab -> Verify **Terms and Conditions Name** -> Displays "Encore Terms and Conditions" (persisted)
7. **Cleanup**: Change T&C back to "LDW" -> Save -> Confirm -> Verify restored

**Expected**: T&C change persists through save and reload
**Data**: office=1604, changeValue="Encore Terms and Conditions", originalValue="LDW"

---

## TC-LOC-LGL-013: Cancel in Save Changes dialog discards save
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab (fresh page load) -> Tab loads
2. Change **Service Charge Name** to "Administrative Fee" -> Save enables
3. Click left-panel **Save** button -> Save Changes dialog appears
4. Click **Cancel** button in dialog -> Dialog closes
5. Verify left-panel **Save** button -> Still enabled (changes not saved)
6. Reload page (accept beforeunload) -> Page reloads fresh
7. Click **Legal** tab -> Verify **Service Charge Name** -> Still "Resort Service Charge" (change was NOT saved)

**Expected**: Clicking Cancel in Save Changes dialog dismisses dialog without saving; original values persist after reload
**Data**: office=1604

---

## TC-LOC-LGL-014: Beforeunload dialog triggers when navigating with unsaved Legal changes
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | State |

**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab (fresh page load) -> Tab loads
2. Change **Terms and Conditions Name** to "Blank" -> Save enables
3. Attempt to reload or navigate away -> Browser beforeunload dialog appears
4. Dismiss dialog (stay on page) -> Page remains, unsaved changes preserved
5. Accept dialog (leave page) -> Page reloads, changes discarded

**Expected**: Unsaved Legal changes trigger the browser's beforeunload confirmation dialog on navigation attempts
**Data**: office=1604

---

## TC-LOC-LGL-015: Country change resets both Legal dropdowns
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Functional |

**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab -> Verify defaults: SC = "Resort Service Charge", T&C = "LDW"
2. In left panel, change **Country** combobox from "United States" to another value (e.g., "Canada") -> Country changes
3. Click **Legal** tab -> Legal tab reloads
4. Verify **Service Charge Name** -> Value has been reset (no longer "Resort Service Charge")
5. Verify **Terms and Conditions Name** -> Value has been reset (no longer "LDW")
6. **Cleanup**: Revert **Country** back to "United States" -> Save if needed

**Expected**: Changing Country in left panel resets both Service Charge Name and Terms and Conditions Name for all language rows
**Data**: office=1604

---

<!-- Execution Notes:
- Legal tab: [data-testid="location-settings-sub-tab-legal"]
- Legal content: [data-testid="location-settings-sub-tab-content-legal"]
- Table: [data-testid="location-settings-table-legal"]
- SC combobox row 0: [data-testid="location-settings-select-legal-0-service-charge"]
- T&C combobox row 0: [data-testid="location-settings-select-legal-0-terms"]
- Save button: [data-testid="location-settings-btn-save"] (shared left-panel)
- Save dialog: [role="alertdialog"] with Cancel + Save buttons (no data-testid)
- canEditProp=true confirmed for office 1604
- TC-011, TC-012: destructive -- always revert after test (annotated with Cleanup steps)
- TC-015: cross-tab -- requires Country change; always CLEANUP country after test
- Dropdowns: Radix UI Select components, no search/filter, full list rendered
- Service Charge 114 options, T&C 50 options (for US English language)
- NO dedicated Legal Save button exists (this was incorrect in the 2026-02-19 version)
- Dirty-state: form does NOT track net-zero changes; reverting to original still shows as dirty
-->