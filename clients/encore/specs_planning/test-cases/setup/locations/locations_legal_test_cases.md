# Location Legal Test Cases
**Module**: locations | **Total**: 19 | **Status**: Partial | **Updated**: 2026-05-27

---

| Field | Value |
|-------|-------|
| Date | |
| URL | https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location |
| Office/Entity | 1604 (Parker Palm Springs) |
| Total fields found | 3 (Language Name [static], Service Charge Name [dropdown], Terms and Conditions Name [dropdown]) |
| Total fields tested (edit+save) | 2 (Service Charge Name, Terms and Conditions Name) |
| Save dialog | Yes -- heading "Save Changes", body "Are you sure you want to save the changes?", buttons Cancel + Ok |
| Column headers | Language Name, Service Charge Name, Terms and Conditions Name |
| Dropdown options | Service Charge Name: 114 options (first 10: Service Charge, Administrative Fee, Hotel Service Charge, Marriott Hotel Service Charge, Resort Service Charge, Standard 22% Resort Service Charge, Hotel collected Service Charge, Marriott 2013 Service Charge, NoCharge, ETS) |
| Dropdown options | Terms and Conditions Name: 50 options (Service Charges, Administration Fees, Service Charges (Hilton), Administration Fees (Hilton), LDW, Marriott 2013 Service Charge, ET Support and LDW, Admin Fee + LDW. Encore Terms and Conditions, Show Quote, Show Quote MX (Eng)) |
| Cascade behaviors | Country change in left panel resets both SC and T&C values for all language rows |
| Input attribute types | SC dropdown: data-testid="location-settings-select-legal-0-service-charge" role="dropdown" aria-expanded / T&C dropdown: data-testid="location-settings-select-legal-0-terms" role="dropdown" |
| Validation error patterns | Not directly testable for Legal -- errors manifest via an invalid Legal-tab condition blocking left-panel Save |
| Input masks/formatting | N/A -- dropdowns only, no free-text input |
| Filtering mechanism | No search/filter in SC or T&C dropdowns -- full list rendered |
| API loading | Legal tab: table loads immediately after tab click (~1s) |
| Strict mode risks | None -- all selectors use data-testid, unique per querySelectorAll |
| Form structure | Save button: shared left-panel [data-testid="location-settings-btn-save"], NOT inside Legal tabpanel |
| Dialog side effects | Save Changes dialog: Cancel=safe (no save), Ok=persists |
| Post-reload timing | SC and T&C dropdownes load together (~1s after tab render) |
| Readiness signal | Wait for dropdown [data-testid="location-settings-select-legal-0-service-charge"] to have non-empty text |
| Boundary behaviors | N/A -- no free-text input fields on Legal tab |

### CORRECTIONS FROM PREVIOUS VERSION
| Issue | Old (Wrong) | New (Correct) |
|-------|-------------|---------------|
| Default SC value | "Service Charge" | "Resort Service Charge" |
| Legal Save button | Dedicated Legal Save at top-right | NO dedicated Legal Save -- uses shared left-panel Save |
| Save revert behavior | Reverting to original re-disables Save | Save stays enabled after any change, even if reverted |
| SC dropdown search | Hidden search dropdown | No search/filter in dropdown |
| SC option count | 100+ | 114 |
| T&C option count | 50+ | 50 |
| Selectors | None documented with data-testid | Full data-testid selectors verified |

---

## FIELD INVENTORY & DISCOVERY

**Legal Grid** (3 columns, 1 data row for office 1604):
| # | Field | Type | Default (1604) | State | Selector |
|---|-------|------|----------------|-------|----------|
| 1 | Language Name | static text (td) | US English | read-only | N/A (plain text cell, no interactable element) |
| 2 | Service Charge Name | dropdown (button role=dropdown) | Resort Service Charge | editable, 114 options | `[data-testid="location-settings-select-legal-0-service-charge"]` |
| 3 | Terms and Conditions Name | dropdown (button role=dropdown) | LDW | editable, 50 options | `[data-testid="location-settings-select-legal-0-terms"]` |

**Table**: `[data-testid="location-settings-table-legal"]` -- has `<thead>` (3 column headers) + `<tbody>` (data rows).

**Save Button**: Shared left-panel Save `[data-testid="location-settings-btn-save"]`. Disabled by default. Enabled when any field changes (Legal OR other tabs). NOT a dedicated Legal Save.

**Save Dialog**: `[an alert dialog]` -- heading "Save Changes", body "Are you sure you want to save the changes?", buttons: Cancel, Save. No data-testid on dialog elements.

**Dirty-State Tracking**: Once ANY dropdown value is changed, Save enables. Reverting to the original value does NOT re-disable Save. Only a page reload or successful save resets unsaved changes.

**Validation Rules**:
- `SCNAME_IS_REQD`: Service Charge cannot be null/empty
- `TCNAME_IS_REQD`: Terms and Conditions cannot be null/empty
- an invalid Legal-tab condition: Invalid Legal data blocks left-panel Save

**Country Change Cascade**: Changing Country in left panel resets both Service Charge Name and Terms and Conditions Name for all language rows.

---

## Validation Rules

| Rule | Behaviour |
|---|---|
| Service Charge Name is required | An empty or null Service Charge Name produces an invalid Legal-tab condition that blocks the left-panel Save |
| Terms and Conditions Name is required | An empty or null Terms and Conditions Name produces an invalid Legal-tab condition that blocks the left-panel Save |

---

## MCP_VERIFICATION_LOG

Observations for this module were recorded before the verification-log convention existed; the paired
field inventory is absent. A fresh walk must populate this table before the next behavioural edit to
this file.

---
## TC-LOC-LGL-001: Verify Legal grid default structure
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Setup > Location > 1604 > **Basic Information** tab -> Page loads with left panel and sub-tabs | The Basic Information tab for location 1604 is displayed. |
| 2 | Click **Legal** sub-tab -> Legal tabpanel renders | The Legal sub-tab becomes active and the Legal panel is displayed. |
| 3 | Verify table has 3 column headers: **Language Name**, **Service Charge Name**, **Terms and Conditions Name** -> All 3 visible | The table displays exactly 3 column headers: Language Name, Service Charge Name, and Terms and Conditions Name. |
| 4 | Count rows in `<tbody>` -> 1 data row (US English) | Table with 3 columns and 1 row (US English) visible in Legal panel |

**Expected**: Table with 3 columns and 1 row (US English) visible in Legal tabpanel
**Data**: office=1604

---

## TC-LOC-LGL-002: Verify Legal grid default field values
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to **Legal** tab -> Tab loads | The Legal tab is displayed with the Legal panel visible. |
| 2 | Verify US English row cell 1 -> Text "US English" (static, no dropdown) | Cell 1 (Language Name) in the US English row displays "US English". |
| 3 | Verify US English row cell 2 -> dropdown showing "Resort Service Charge" | Cell 2 (Service Charge Name) in the US English row displays "Resort Service Charge". |
| 4 | Verify US English row cell 3 -> dropdown showing "LDW" | The third cell in the US English row shows a dropdown with "LDW" selected. |

**Expected**: US English row shows: Language Name = "US English", Service Charge Name = "Resort Service Charge", Terms and Conditions Name = "LDW"
**Data**: office=1604

---

## TC-LOC-LGL-003: Verify Language Name cell is read-only
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to **Legal** tab -> Tab loads | The Legal tab is displayed with the Legal panel visible. |
| 2 | Verify Language Name cell ("US English") -> No dropdown or button rendered, plain text only | The Language Name cell displays "US English" as static text. |
| 3 | Verify no interactive element exists in first column cell -> Static `<td>` with text content | The first column cell contains static text with no interactive element. |

**Expected**: Language Name column is read-only static text, no editing possible
**Data**: office=1604

---

## TC-LOC-LGL-004: Verify Service Charge Name dropdown opens and shows options
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to **Legal** tab -> Tab loads | The Legal tab is displayed with the Legal panel visible. |
| 2 | Click **Service Charge Name** dropdown in US English row -> Dropdown listbox opens | The Service Charge Name dropdown opens and displays the list of options. |
| 3 | Verify options are visible -> 114 options listed (including "Service Charge", "Administrative Fee", "Hotel Service Charge", "Resort Service Charge", "ETS", "NoCharge") | All option entries in the dropdown list are visible on screen. |
| 4 | Verify current selection state -> "Resort Service Charge" has `data-state="checked"` | The currently selected option, "Resort Service Charge", is visually indicated. |
| 5 | Press Escape -> Dropdown closes, value unchanged | The dropdown closes and the value remains unchanged. |

**Expected**: Dropdown opens with 114 service charge options; currently selected option "Resort Service Charge" is visually indicated; Escape closes dropdown without changing value
**Data**: office=1604

---

## TC-LOC-LGL-005: Verify Terms and Conditions Name dropdown opens and shows options
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to **Legal** tab -> Tab loads | The Legal tab is displayed with the Legal panel visible. |
| 2 | Click **Terms and Conditions Name** dropdown in US English row -> Dropdown listbox opens | The Terms and Conditions Name dropdown opens and displays the list of options. |
| 3 | Verify options are visible -> 50 options listed (including "LDW", "Encore Terms and Conditions", "Blank", "Show Quote", "ETS (No LDW)") | All option entries in the dropdown list are visible on screen. |
| 4 | Verify current selection state -> "LDW" has `data-state="checked"` | The currently selected option, "LDW", is visually indicated. |
| 5 | Press Escape -> Dropdown closes, value unchanged | The dropdown closes and the value remains unchanged. |

**Expected**: Dropdown opens with 50 T&C options; currently selected "LDW" is visually indicated; Escape closes without changing value
**Data**: office=1604

---

## TC-LOC-LGL-006: Verify no search/filter exists in dropdowns
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to **Legal** tab -> Tab loads | The Legal tab is displayed with the Legal panel visible. |
| 2 | Click **Service Charge Name** dropdown -> Dropdown opens | The Service Charge Name dropdown opens and displays the list of options. |
| 3 | Verify no search input or filter textbox exists in the dropdown -> Full list of 114 options rendered directly | No search input or filter field is present in the dropdown. |
| 4 | Press Escape -> Dropdown closes | The dropdown closes and the Service Charge Name value remains unchanged. |
| 5 | Click **Terms and Conditions Name** dropdown -> Dropdown opens | The Terms and Conditions Name dropdown opens and displays the list of options. |
| 6 | Verify no search input or filter textbox exists -> Full list of 50 options rendered directly | No search input or filter field is present in the dropdown. |
| 7 | Press Escape -> Dropdown closes | The dropdown closes. |

**Expected**: Neither dropdown has a search/filter input -- all options are rendered in a flat list
**Data**: office=1604

---

## TC-LOC-LGL-007: Left-panel Save button disabled by default (no changes)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | State |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Setup > Location > 1604 (fresh page load) -> Page loads | The location 1604 page loads and is displayed in Navigator. |
| 2 | Click **Legal** tab -> Tab loads with default values | The Legal tab becomes active and the Legal panel is displayed. |
| 3 | Make no changes -> Both dropdownes show defaults | All fields on the page remain at their original values. |
| 4 | Verify left-panel **Save** button -> Disabled (`[disabled]` attribute present) | The left-panel Save button is disabled. |

**Expected**: Left-panel Save button is disabled when no changes have been made to any field on the page
**Data**: office=1604

---

## TC-LOC-LGL-008: Changing Service Charge Name enables left-panel Save button
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | State |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to **Legal** tab (fresh page load) -> Tab loads | The Legal tab is displayed with the Legal panel visible. |
| 2 | Verify left-panel **Save** button -> Disabled | The left-panel Save button is disabled. |
| 3 | Click **Service Charge Name** dropdown -> Dropdown opens | The Service Charge Name dropdown opens and displays the list of options. |
| 4 | Select a different option from the dropdown (e.g., "Administrative Fee") -> Value updates to "Administrative Fee" | The Service Charge Name field updates to display "Administrative Fee". |
| 5 | Verify left-panel **Save** button -> Now enabled (not disabled) | The left-panel Save button is now enabled. |

**Expected**: Changing Service Charge Name enables the shared left-panel Save button
**Data**: office=1604
**Cleanup**: Reload page without saving (accept the browser's leave-page confirmation) to discard change

---

## TC-LOC-LGL-009: Changing Terms and Conditions Name enables left-panel Save button
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | State |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to **Legal** tab (fresh page load) -> Tab loads | The Legal tab is displayed with the Legal panel visible. |
| 2 | Verify left-panel **Save** button -> Disabled | The left-panel Save button is disabled. |
| 3 | Click **Terms and Conditions Name** dropdown -> Dropdown opens | The Terms and Conditions Name dropdown opens and displays the list of options. |
| 4 | Select a different option from the dropdown (e.g., "Encore Terms and Conditions") -> Value updates | The Terms and Conditions Name field updates to display "Encore Terms and Conditions". |
| 5 | Verify left-panel **Save** button -> Now enabled (not disabled) | The left-panel Save button is now enabled. |

**Expected**: Changing T&C Name enables the shared left-panel Save button
**Data**: office=1604
**Cleanup**: Reload page without saving to discard change

---

## TC-LOC-LGL-010: Reverting dropdowns to original values does NOT re-disable Save
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | State |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to **Legal** tab (fresh page load) -> Tab loads | The Legal tab is displayed with the Legal panel visible. |
| 2 | Change **Service Charge Name** from "Resort Service Charge" to "Administrative Fee" -> Save enables | The Service Charge Name field updates to display "Administrative Fee" and the Save button becomes enabled. |
| 3 | Change **Service Charge Name** back to "Resort Service Charge" -> Value reverted to original | The Service Charge Name field updates to display "Resort Service Charge" again. |
| 4 | Verify left-panel **Save** button -> Still enabled (NOT re-disabled) | Reverting a dropdown to its original value does NOT re-disable the Save button. The form's change tracking does not treat a reverted value as a return to the original unchanged state, so Save stays enabled. A browser confirmation prompt also appears when navigating away |

**Expected**: Reverting a dropdown to its original value does NOT re-disable the Save button. The form's change tracking does not treat a reverted value as a return to the original unchanged state, so Save stays enabled. A browser confirmation prompt also appears when navigating away.
**Data**: office=1604
**Cleanup**: Reload page without saving to discard change

---

## TC-LOC-LGL-011: Save Service Charge change persists after save and reload
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to **Legal** tab (fresh page load) -> Defaults loaded: SC = "Resort Service Charge" | The Legal tab is displayed with Service Charge Name showing "Resort Service Charge". |
| 2 | Click **Service Charge Name** dropdown -> Select "Administrative Fee" -> Value updates | The Service Charge Name field updates to display "Administrative Fee". |
| 3 | Verify left-panel **Save** button -> Enabled | The left-panel Save button is enabled. |
| 4 | Click left-panel **Save** button -> Save Changes dialog appears: heading "Save Changes", body "Are you sure you want to save the changes?" | The Save Changes confirmation dialog is displayed. |
| 5 | Click **Ok** button in dialog -> Save executes, dialog closes | The dialog closes and the change is saved. |
| 6 | Verify left-panel **Save** button -> Returns to disabled (changes saved) | The left-panel Save button is disabled, indicating the change was committed. |
| 7 | Reload page -> Page reloads | The page reloads. |
| 8 | Click **Legal** tab -> Verify **Service Charge Name** -> Displays "Administrative Fee" (persisted) | The Legal tab is displayed and the Service Charge Name field shows "Administrative Fee". |
| 9 | **Cleanup**: Change **Service Charge Name** back to "Resort Service Charge" -> Click Save -> Confirm dialog -> Verify restored | The Service Charge Name is restored to "Resort Service Charge" and the Save button is disabled. |

**Expected**: Legal data change persists through Save and page reload; Save button re-disables after successful save
**Data**: office=1604, changeValue="Administrative Fee", originalValue="Resort Service Charge"

---

## TC-LOC-LGL-012: Save Terms and Conditions change persists after save and reload
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to **Legal** tab (fresh page load) -> Defaults loaded: T&C = "LDW" | The Legal tab is displayed with Terms and Conditions Name showing "LDW". |
| 2 | Click **Terms and Conditions Name** dropdown -> Select "Encore Terms and Conditions" -> Value updates | The Terms and Conditions Name field updates to display "Encore Terms and Conditions". |
| 3 | Click left-panel **Save** button -> Save Changes dialog appears | The Save Changes confirmation dialog is displayed. |
| 4 | Click **Ok** in dialog -> Save executes | The dialog closes and the change is saved. |
| 5 | Reload page -> Page reloads | The page reloads. |
| 6 | Click **Legal** tab -> Verify **Terms and Conditions Name** -> Displays "Encore Terms and Conditions" (persisted) | The Legal tab is displayed and the Terms and Conditions Name field shows "Encore Terms and Conditions". |
| 7 | **Cleanup**: Change T&C back to "LDW" -> Save -> Confirm -> Verify restored | The Terms and Conditions Name is restored to "LDW" and the Save button is disabled. |

**Expected**: T&C change persists through save and reload
**Data**: office=1604, changeValue="Encore Terms and Conditions", originalValue="LDW"

---

## TC-LOC-LGL-013: Cancel in Save Changes dialog discards save
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to **Legal** tab (fresh page load) -> Tab loads | The Legal tab is displayed with the Legal panel visible. |
| 2 | Change **Service Charge Name** to "Administrative Fee" -> Save enables | The Service Charge Name field updates to display "Administrative Fee". |
| 3 | Click left-panel **Save** button -> Save Changes dialog appears | A Save Changes confirmation dialog is displayed. |
| 4 | Click **Cancel** button in dialog -> Dialog closes | The dialog closes and no data is saved. |
| 5 | Verify left-panel **Save** button -> Still enabled (changes not saved) | The left-panel Save button remains enabled. |
| 6 | Reload page (accept the browser's leave-page confirmation) -> Page reloads fresh | The browser's leave-page confirmation is displayed and, once accepted, the page reloads. |
| 7 | Click **Legal** tab -> Verify **Service Charge Name** -> Still "Resort Service Charge" (change was NOT saved) | Service Charge Name still shows "Resort Service Charge"; the cancelled change was not persisted. |

**Expected**: Clicking Cancel in Save Changes dialog dismisses dialog without saving; original values persist after reload
**Data**: office=1604

---

## TC-LOC-LGL-014: Browser warns before leaving the page when there are unsaved Legal changes
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | State |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to **Legal** tab (fresh page load) -> Tab loads | The Legal tab is displayed with the Legal panel visible. |
| 2 | Change **Terms and Conditions Name** to "Blank" -> Save enables | The Terms and Conditions Name field updates to display "Blank". |
| 3 | Attempt to reload or navigate away -> The browser's leave-page confirmation appears | The browser's leave-page confirmation dialog is displayed. |
| 4 | Dismiss dialog (stay on page) -> Page remains, unsaved changes preserved | The dialog closes and the user remains on the Legal tab with the unsaved change intact. |
| 5 | Accept dialog (leave page) -> Page reloads, changes discarded | The page reloads and the changes are discarded. |

**Expected**: Unsaved Legal changes trigger the browser's leave-page confirmation when there are unsaved changes and the user attempts to navigate away
**Data**: office=1604

---

## TC-LOC-LGL-015: Country change resets both Legal dropdowns
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to **Legal** tab -> Verify defaults: SC = "Resort Service Charge", T&C = "LDW" | The Legal tab is displayed with Service Charge Name showing "Resort Service Charge" and Terms and Conditions Name showing "LDW". |
| 2 | In left panel, change **Country** dropdown from "United States" to another value (e.g., "Canada") -> Country changes | The Country field updates to the new value. |
| 3 | Click **Legal** tab -> Legal tab reloads | The Legal tab reloads and displays the updated Legal grid. |
| 4 | Verify **Service Charge Name** -> Value has been reset (no longer "Resort Service Charge") | The Service Charge Name field no longer shows "Resort Service Charge"; it has been reset. |
| 5 | Verify **Terms and Conditions Name** -> Value has been reset (no longer "LDW") | The Terms and Conditions Name field no longer shows "LDW"; it has been reset. |
| 6 | **Cleanup**: Revert **Country** back to "United States" -> Save if needed | The Country is restored to "United States" and any changes are saved. |

**Expected**: Changing Country in left panel resets both Service Charge Name and Terms and Conditions Name for all language rows
**Data**: office=1604

---

## TC-LOC-LGL-016: Verify Service Charge dropdown options are sorted alphabetically
| Priority | Status | Type |
|----------|--------|------|
| Low | OMITTED | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: No (APP BUG)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to **Legal** tab -> Tab loads | The Legal tab is displayed with the Legal panel visible. |
| 2 | Click **Service Charge Name** dropdown -> Listbox opens | The Service Charge Name dropdown opens and displays the list of options. |
| 3 | Read all option texts -> Collect into array | All option texts in the dropdown are visible and legible. |
| 4 | Compare to case-insensitive alphabetical sort -> Assert sorted | The options are in alphabetical order. |

**Expected**: Options are sorted alphabetically
**Data**: office=1604

**OMITTED Reason**: MCP-verified : SC dropdown is NOT sorted alphabetically. Generic names appear first, then location-specific. This is an **APP BUG** — v1 requirement says "sorted alphabetically". Test would fail against live behavior. Logged in REQUIREMENTS.md and master plan.

---

## TC-LOC-LGL-017: Verify Terms and Conditions dropdown options are sorted alphabetically
| Priority | Status | Type |
|----------|--------|------|
| Low | OMITTED | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: No (APP BUG)

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to **Legal** tab -> Tab loads | The Legal tab is displayed with the Legal panel visible. |
| 2 | Click **Terms and Conditions Name** dropdown -> Listbox opens | The Terms and Conditions Name dropdown opens and displays the list of options. |
| 3 | Read all option texts -> Collect into array | All option texts in the dropdown are visible and legible. |
| 4 | Compare to case-insensitive alphabetical sort -> Assert sorted | The options are in alphabetical order. |

**Expected**: Options are sorted alphabetically
**Data**: office=1604

**OMITTED Reason**: MCP-verified : T&C dropdown is NOT sorted alphabetically. Same pattern as SC. **APP BUG** logged in REQUIREMENTS.md and master plan.

---

## TC-LOC-LGL-018: Combined SC + T&C change saves and persists both
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Reload page and navigate to **Legal** tab (LR-026: clean form state before save cycle) | The page reloads and the Legal tab is displayed in a clean state with the Save button disabled. |
| 2 | Change **Service Charge Name** to "Administrative Fee" -> Value updates | The Service Charge Name field updates to display "Administrative Fee". |
| 3 | Change **Terms and Conditions Name** to "Encore Terms and Conditions" -> Value updates | The Terms and Conditions Name field updates to display "Encore Terms and Conditions". |
| 4 | Verify left-panel **Save** button -> Enabled | The left-panel Save button is enabled. |
| 5 | Click left-panel **Save** button -> Save Changes dialog appears | The Save Changes confirmation dialog is displayed. |
| 6 | Click **Ok** in dialog -> Save executes, dialog closes | The dialog closes and both changes are saved. |
| 7 | Verify left-panel **Save** button -> Returns to disabled | The left-panel Save button is disabled. |
| 8 | Reload page and navigate to **Legal** tab -> Fresh state loaded | The page reloads and the Legal tab is displayed with freshly loaded values. |
| 9 | Verify **Service Charge Name** -> Displays "Administrative Fee" (persisted) | The Service Charge Name field shows "Administrative Fee". |
| 10 | Verify **Terms and Conditions Name** -> Displays "Encore Terms and Conditions" (persisted) | The Terms and Conditions Name field shows "Encore Terms and Conditions". |
| 11 | **Cleanup**: Change **Service Charge Name** back to "Resort Service Charge" -> Change **Terms and Conditions Name** back to "LDW" -> Save -> Confirm dialog -> Verify both restored | Both fields are restored to their defaults and the Save button is disabled. |

**Expected**: Changing both dropdowns simultaneously and saving persists both values through reload; cleanup restores defaults
**Data**: office=1604, altSC="Administrative Fee", altTC="Encore Terms and Conditions", defaultSC="Resort Service Charge", defaultTC="LDW"

---

## Field-Case Coverage (FCC) — Legal Server Validation

> Field-Case Coverage block per `PLAN_BIG_PIVOT_FCC_MASTER.md` doctrine + `SUBPLAN_LEGAL_FCC.md` Phase 2 catalog.
> Gap-analysis: 12 existing TCs cover same-mechanic-different-data dropdown save cycles (LR-040(b)); 3 cases are APP BUG / left-panel-deferred (LR-040(c)); 1 net-new TC covers the genuinely uncovered mechanic (DOM tamper negative).
> Full catalog: `clients/encore/specs_planning/_internal/field-case-catalogs/legal-2026-05-27.md`.

---

## TC-LOC-LGL-019: Verify an out-of-list Service Charge value cannot be submitted
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Negative + Save-cycle |

**Depends_On**: none (FCC tests are independent per master doctrine item 1)
**Automatable**: Yes (green test, observed 2026-05-27 11:11 — 21.0s, passes)
**FCC group**: negative (no UI path to invalid value) + runner-integration smoke
**Runner**: `saveAndVerifyCase()` from `clients/encore/src/core/field-case-runner.ts`

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the "Service Charge" dropdown and confirm an invalid, out-of-list value is NOT among the available options, while the current default value AND a valid alternate value ("Administrative Fee") ARE both present | The dropdown list excludes the invalid value and includes both "Resort Service Charge" and "Administrative Fee". |
| 2 | Reset the Legal row to its default Service Charge and Terms & Conditions values | The Service Charge Name and Terms and Conditions Name fields display their default values, "Resort Service Charge" and "LDW". |
| 3 | Select the valid alternate Service Charge ("Administrative Fee") from the dropdown | The Service Charge Name field updates to display "Administrative Fee". |
| 4 | Confirm the "Save" button becomes enabled and the dropdown now reads "Administrative Fee" | The Save button is enabled and the dropdown displays "Administrative Fee". |
| 5 | Click "Save" and confirm the Save Changes dialog | The Save Changes dialog is confirmed and the change is saved. |
| 6 | Confirm the "Save" button returns to disabled after the save completes | The Save button is disabled after the save completes. |
| 7 | Reload the page and return to the "Legal" tab | The page reloads and the Legal tab is displayed with the Legal panel visible. |
| 8 | Confirm the persisted Service Charge value is "Administrative Fee" and is never the invalid value (end-to-end check at the server) | The persisted Service Charge value is "Administrative Fee", and the invalid value is absent server-side. |
| 9 | Restore the Legal row to its default values ("Resort Service Charge" and "LDW") | All checks pass. No UI path exposes an out-of-list value to the user, and a normal save persists only the valid selected value (never the invalid value) at the server |

**Expected**: All checks pass. No UI path exposes an out-of-list value to the user, and a normal save persists only the valid selected value (never the invalid value) at the server.

**Data**: office=1604, legitValue="Administrative Fee", default="Resort Service Charge"

**Notes**: Cleanup after test: The test automatically restores the Legal row to its default values

<!-- Internal (not exported): implementation rationale, the Path D live finding (DOM tamper of the Radix SC dropdown crashes the page), and the future network-layer flip path are documented in plans/done/SUBPLAN_LEGAL_FCC.md (the field-case-catalogs/legal-2026-05-27.md catalog it referenced was lost to the gitignored-MD restore — see _internal/excel-revert-recovery-deviations-2026-06-10.md). The invalid-value sentinel constant LEGAL_INVALID_SC_VALUE lives in src/data/locations/location-legal.ts. -->

---

 Execution reference:
- Legal tab: [data-testid="location-settings-sub-tab-legal"]
- Legal content: [data-testid="location-settings-sub-tab-content-legal"]
- Table: [data-testid="location-settings-table-legal"]
- SC dropdown row 0: [data-testid="location-settings-select-legal-0-service-charge"]
- T&C dropdown row 0: [data-testid="location-settings-select-legal-0-terms"]
- Save button: [data-testid="location-settings-btn-save"] (shared left-panel)
- Save dialog: [an alert dialog] with Cancel + Ok buttons 
- canEditProp is true confirmed for office 1604
- TC-011, TC-012: destructive -- always revert after test (annotated with Cleanup steps)
- TC-015: cross-tab -- requires Country change; always CLEANUP country after test
- Dropdowns: the dropdown library Select components, no search/filter, full list rendered
- Service Charge 114 options, T&C 50 options (for US English language)
- NO dedicated Legal Save button exists 
- Change tracking: the form does NOT treat a reverted value as a return to the original unchanged state; reverting to the original still shows the form as changed

---

## OMITTED Rows

This module has 3 test cases intentionally NOT automated in the spec, collected here for traceability (reasons are also inline at each TC above). All 3 are classified LR-040(c) — not-applicable / app-bug — in `SUBPLAN_LEGAL_FCC.md` and the master plan; none is a coverage gap.

| TC | Status | Reason | Tracking |
|---|---|---|---|
| TC-LOC-LGL-015 | Manual (deferred) | Country-cascade reset depends on a left-panel Country selector. `SUBPLAN_LEFT_PANEL_FCC.md` was user-directed NOT to be created (2026-05-26), so the precondition selector is unavailable to automate against. | Discussion-item flagged in `PLAN_BIG_PIVOT_FCC_MASTER.md` §Roadmap (left-panel row). |
| TC-LOC-LGL-016 | OMITTED | **APP BUG** — Service Charge dropdown is NOT sorted alphabetically (generic names first, then location-specific). v1 requirement says "sorted alphabetically"; the test would fail against live behavior. | Logged in `REQUIREMENTS.md` + master plan. |
| TC-LOC-LGL-017 | OMITTED | **APP BUG** — Terms & Conditions dropdown is NOT sorted alphabetically (same pattern as SC). | Logged in `REQUIREMENTS.md` + master plan. |

(Documentation collected by PLAN_DONE_MEANS_DONE Phase 1.8, 2026-05-28 — Legal-specific; no cross-module OMITTED-schema codification, per the finding #8 downgrade to a 1-of-3 pattern.)
