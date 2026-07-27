# Local Office Settings — ECT Settings Test Cases — **Module**: local-office | **Total**: 18 | **Status**: Automated

**Module**: local-office

**URL**: `/navigator/locations/{officeId}/settings/local-office` (ECT Settings tab)
**Spec**: `specs/local-office/local-office-ect.spec.ts`
**Location tested**: 1604 (Parker Palm Springs, USA)
**Updated**: 
**Scope**: ECT Settings tab only — 18 TCs (TC-LOS-ECT-*)
**Selector file**: `src/selectors/locations/local-office-settings.ts`
**Sibling test cases**: [BAS](local_office_settings_test_cases.md) · [HIS](local_office_history_test_cases.md)

**Split note**: This file was split from the combined `local_office_settings_test_cases.md` to match the 1:1 spec→md convention used by the locations module (the underlying spec breakdown landed in commit f721e15,). Sibling files: [HIS](local_office_history_test_cases.md), [ECT](local_office_ect_test_cases.md). All TC IDs and `Depends_On` fields preserved verbatim.

---

## MCP_VERIFICATION_LOG — ECT Settings Tab

| Field | Value |
|-------|-------|
| Date | |
| URL | https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/local-office |
| Office/Entity | 1604 (Parker Palm Springs) |
| Total fields found | 77 (2 editable inputs + 66 labor cost inputs + 1 currency dropdown + 1 commission link + 7 read-only display fields) |
| Total fields tested (edit+save) | 4 (Benefits Multiplier edit+save+restore, Historical Subrental focus, Admin Fee labor cost edit+restore, Currency dropdown options) |
| Save dialog | No confirmation dialog — saves directly on click. ECT tab has TWO independent Save buttons (Fixed Costs + Labor Costs) |
| Column headers | Event Profit Target: Lower Limit, Upper Limit, Target, Currency. Labor Cost: Labor Class, Labor Cost. SubRental: Lower Limit, Upper Limit, Subrental Percentage, Currency |
| Dropdown options | Currency: [USD] (1 option only) |
| Input masks/formatting | Benefits Multiplier: display "20.0%", raw value "0.2" (decimal). Labor Cost: display "35.00", raw value "35" (auto-adds decimals on blur) |
| Validation error patterns | Labor cost non-numeric: field reverts to original value on blur — no aria-invalid, no error message, silent rejection |
| Form structure | Two Save buttons: `ect-settings-btn-save-fixed-costs-btn` (for fixed costs) and `ect-settings-btn-save-labor-costs-btn` (for labor costs). Both disabled by default |
| Boundary behaviors | Labor cost: non-numeric "abc" -> reverts to original value silently. Benefits Multiplier: accepts decimal values only |

## FIELD INVENTORY — ECT Settings Tab

| Field | Type | Default (1604) | State | data-testid |
|---|---|---|---|---|
| Location Name | heading (h6) | 1604 - Parker Palm Springs | display only | `ect-settings-label-location-name` |
| Commission Structure Link | link | External URL | enabled | `ect-settings-link-commission-structure` |
| Select Currency | dropdown | USD | enabled; 1 option | `ect-settings-select-currency` |
| Save (Fixed Costs) | button | disabled | disabled by default | `ect-settings-btn-save-fixed-costs-btn` |
| Event Profit Target Table | table | 9 rows, 4 columns | read-only | `ect-settings-table-event-profit-target` |
| Venue Fixed Costs | display | 13.9% | read-only | `ect-settings-field-venue-fixed-costs` |
| SG&A % | display | 8.0% | read-only | `ect-settings-field-sga-percent` |
| Benefits Multiplier | textbox | 20.0% (raw: 0.2) | editable; decimal-to-percent | `ect-settings-input-benefits-multiplier` |
| Other Rate | display | 0.0% | read-only | `ect-settings-field-other-rate` |
| No Labor Rate | display | 0.0% | read-only | `ect-settings-field-no-labour-rate` |
| Approval Threshold | display | $10,000,000.00 | read-only | `ect-settings-field-approval-threshold` |
| Historical Subrental % | textbox | 0.0% (raw: 0.0) | editable; decimal-to-percent | `ect-settings-input-historical-subrental` |
| Peak Labor Adjustment % | display | 5.0% | read-only | `ect-settings-field-peak-labor-adjustment` |
| Non-Peak Labor Adjustment % | display | 0.0% | read-only | `ect-settings-field-non-peak-labor-adjustment` |
| Save (Labor Costs) | button | disabled | disabled by default | `ect-settings-btn-save-labor-costs-btn` |
| Labor Cost Assumptions Table | table | 66 rows, 2 columns | editable costs | `ect-settings-table-labor-cost-assumptions` |
| Labor Cost Input (per row) | textbox | varies (24.44-50.00) | editable; `ect-settings-input-labor-cost-{0.65}` | indexed |
| SubRental Matrix Table | table | 9 rows, 4 columns | read-only | `ect-settings-table-sub-rental-matrix` |

---

## TC-LOS-ECT-001: ECT Tab — Navigation and Header Display

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Blocked | Functional | No |

**Depends_On**: none (baseline-enforcement per LR-019)
**Status**: Blocked by BUG-LOS-ECT-001


**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Local Office Settings page. | The Local Office Settings page loads and tabs are visible. |
| 2 | Click the "ECT Settings" tab -> Tab becomes selected | The ECT Settings tab is active and the ECT Settings panel is visible. |
| 3 | Verify the heading reads "1604 - Parker Palm Springs" -> Location name is displayed | The heading "1604 - Parker Palm Springs" is visible at the top of the ECT Settings panel. |
| 4 | Verify the "Edit/View" label is shown with a "Commission structure" link -> Link element is present in the page | The "Commission structure" link element is present on the ECT Settings panel. |
| 5 | Verify the "Select Currency" dropdown shows "USD" -> Default currency is displayed | The Select Currency dropdown displays "USD" as its current value. |

**Expected**: The ECT tab displays the location name, the Commission structure link element, and the currency dropdown.
**Automatable**: No (link-click outcome blocked until the underlying issue is resolved)

---

## TC-LOS-ECT-018: ECT Tab — Sub-Section Headings Present

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Smoke | Yes |

**Depends_On**: TC-LOS-ECT-001

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Local Office Settings page. | The Local Office Settings page loads and tabs are visible. |
| 2 | Click the "ECT Settings" tab -> Tab becomes selected | The ECT Settings tab is active and the panel is visible. |
| 3 | Verify the heading "Event Profit Target" is visible on the tab -> Heading present | The heading "Event Profit Target" is visible on the ECT Settings panel. |
| 4 | Verify the heading "Fixed Costs" is visible on the tab -> Heading present | The heading "Fixed Costs" is visible on the ECT Settings panel. |
| 5 | Verify the heading "Labor Cost Assumptions" is visible on the tab -> Heading present | The heading "Labor Cost Assumptions" is visible on the ECT Settings panel. |
| 6 | Verify the heading "SubRental Matrix" is visible on the tab -> Heading present | The heading "SubRental Matrix" is visible on the ECT Settings panel. |

**Expected**: The ECT Settings tab shows the four sub-section headings verbatim: "Event Profit Target", "Fixed Costs", "Labor Cost Assumptions", and "SubRental Matrix".
**Automatable**: Yes

---

## TC-LOS-ECT-002: ECT Tab — Currency Selector (Single Option)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to ECT Settings tab -> Tab panel visible | The ECT Settings panel is visible. |
| 2 | Click **Select Currency** dropdown to open dropdown -> Options visible | The currency dropdown opens and its options are visible. |
| 3 | Verify exactly 1 option: **USD** -> Only USD available | The dropdown contains exactly one option: "USD". |
| 4 | Close dropdown -> No change | The dropdown closes and the dropdown still displays "USD". |

**Expected**: The currency dropdown has only the "USD" option for location 1604
**Automatable**: Yes

---

## TC-LOS-ECT-003: ECT Tab — Event Profit Target Table (Read-Only)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to ECT Settings tab -> Scroll to **Event Profit Target** section | The ECT Settings panel is visible and the Event Profit Target section is in view. |
| 2 | Verify heading "Event Profit Target" -> Heading present | The heading "Event Profit Target" is visible. |
| 3 | Verify table has 4 columns: **Lower Limit**, **Upper Limit**, **Target**, **Currency** -> Headers match | The table shows four column headers: "Lower Limit", "Upper Limit", "Target", and "Currency". |
| 4 | Verify table has 9 data rows -> Row count = 9 | The table body contains exactly 9 data rows. |
| 5 | Verify first row: $5,000.01 \| $10,000.00 \| 40.0% \| USD -> Data matches | The first row displays "$5,000.01", "$10,000.00", "40.0%", and "USD" in order. |
| 6 | Verify last row: $2,000,000.01 \| $10,000,000.00 \| 30.0% \| USD -> Data matches | The last row displays "$2,000,000.01", "$10,000,000.00", "30.0%", and "USD" in order. |
| 7 | Verify no editable fields in table -> All cells are display-only | No cell in the table becomes editable on click; all cells are display-only. |

**Expected**: Event Profit Target table shows 9 rows of tiered profit targets, all read-only
**Automatable**: Yes

---

## TC-LOS-ECT-004: ECT Tab — Fixed Cost Display Fields (Read-Only)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to ECT Settings tab -> Fixed costs section visible | The ECT Settings panel is visible and the Fixed Costs section is in view. |
| 2 | Verify **Venue Fixed Costs** = "13.9%" -> Read-only display | The Venue Fixed Costs field displays "13.9%" and is not editable. |
| 3 | Verify **SG&A %** = "8.0%" -> Read-only display | The SG&A % field displays "8.0%" and is not editable. |
| 4 | Verify **Other Rate** = "0.0%" -> Read-only display | The Other Rate field displays "0.0%" and is not editable. |
| 5 | Verify **No Labor Rate** = "0.0%" -> Read-only display | The No Labor Rate field displays "0.0%" and is not editable. |
| 6 | Verify **Approval Threshold** = "$10,000,000.00" -> Read-only display | The Approval Threshold field displays "$10,000,000.00" and is not editable. |
| 7 | Verify **Peak Labor Adjustment %** = "5.0%" -> Read-only display | The Peak Labor Adjustment % field displays "5.0%" and is not editable. |
| 8 | Verify **Non-Peak Labor Adjustment %** = "0.0%" -> Read-only display | The Non-Peak Labor Adjustment % field displays "0.0%" and is not editable. |

**Expected**: All 7 read-only fixed cost fields display correct values
**Automatable**: Yes

---

## TC-LOS-ECT-005: ECT Tab — Benefits Multiplier Edit, Save, Persist

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to ECT Settings tab -> Fixed costs section visible | The ECT Settings panel is visible and the Fixed Costs section is in view. |
| 2 | Verify **Benefits Multiplier** default = "20.0%" -> Displayed as percentage | The Benefits Multiplier field displays "20.0%". |
| 3 | Click **Benefits Multiplier** field -> Raw value "0.2" shown (decimal format) | The Benefits Multiplier field is focused and shows the raw decimal value "0.2". |
| 4 | Clear and type `0.25` -> Value entered | The value "0.25" is entered in the Benefits Multiplier field. |
| 5 | Tab out -> Field displays "25.0%" | After tabbing out, the Benefits Multiplier field displays "25.0%". |
| 6 | Verify **Save** (Fixed Costs) button is **enabled** -> Change detected | The Save (Fixed Costs) button is enabled. |
| 7 | Click **Save** -> Value saved (no confirmation dialog) | The save completes immediately with no confirmation dialog; the Save button becomes disabled. |
| 8 | Navigate away and return to ECT tab -> Reload ECT settings | The ECT Settings tab reloads and displays the current saved values. |
| 9 | Verify **Benefits Multiplier** = "25.0%" -> Persisted | The Benefits Multiplier field displays "25.0%". |
| 10 | **Cleanup**: Change back to `0.2` (displays 20.0%) and save | The Benefits Multiplier is restored to "20.0%" and the save completes. |

**Expected**: Benefits Multiplier editable as decimal; displays as percentage; persists after save
**Automatable**: Yes

---

## TC-LOS-ECT-006: ECT Tab — Historical Subrental % Edit

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to ECT Settings tab -> Fixed costs section visible | The ECT Settings panel is visible and the Fixed Costs section is in view. |
| 2 | Verify **Historical Subrental %** default = "0.0%" -> Displayed as percentage | The Historical Subrental % field displays "0.0%". |
| 3 | Click field -> Raw value "0" shown | The Historical Subrental % field is focused and shows the raw value "0". |
| 4 | Clear and type `0.1` -> Value entered | The value "0.1" is entered in the Historical Subrental % field. |
| 5 | Tab out -> Field displays "10.0%" | After tabbing out, the Historical Subrental % field displays "10.0%". |
| 6 | Verify **Save** (Fixed Costs) button is **enabled** -> Change detected | The Save (Fixed Costs) button is enabled. |
| 7 | **Cleanup**: Change back to `0` and save | The Historical Subrental % is restored to "0.0%" and the save completes. |

**Expected**: Historical Subrental % editable as decimal; displays as percentage
**Automatable**: Yes

---

## TC-LOS-ECT-007: ECT Tab — Two Independent Save Buttons

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-ECT-001

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to the ECT Settings tab -> Tab panel visible | The ECT Settings panel is visible. |
| 2 | Verify the Save button for the Fixed Costs section exists and is disabled -> Save Fixed Costs button is present and not enabled | The Save (Fixed Costs) button is present and disabled. |
| 3 | Verify the Save button for the Labor Costs section exists and is disabled -> Save Labor Costs button is present and not enabled | The Save (Labor Costs) button is present and disabled. |
| 4 | Edit the "Benefits Multiplier" field (in Fixed Costs) -> The Fixed Costs Save button becomes enabled | The Save (Fixed Costs) button becomes enabled. |
| 5 | the Labor Costs Save button stays disabled | The Save (Labor Costs) button remains disabled. |
| 6 | Cleanup: restore the original value | The Benefits Multiplier is restored to its original value and the Save (Fixed Costs) button becomes disabled. |

**Expected**: Each section on the ECT Settings tab has its own independent Save button; editing a field in one section only enables that section's Save button.
**Automatable**: Yes

---

## TC-LOS-ECT-008: ECT Tab — Labor Cost Assumptions Table Structure

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-ECT-001

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to the ECT Settings tab -> Scroll to the "Labor Cost Assumptions" section | The ECT Settings panel is visible and the Labor Cost Assumptions section is in view. |
| 2 | Verify the heading "Labor Cost Assumptions" is visible -> Heading present | The heading "Labor Cost Assumptions" is visible. |
| 3 | Verify the table has two columns: "Labor Class" and "Labor Cost" -> Headers match | The table shows two column headers: "Labor Class" and "Labor Cost". |
| 4 | Verify the table has at least one data row -> Table is not empty | The table body contains at least one data row. |
| 5 | Verify the first row's Labor Class cell shows "Administrative Fee" -> First-row label matches | The first row's Labor Class cell displays "Administrative Fee". |
| 6 | Verify the last row's Labor Class cell shows "zzzFinishing Service" -> Last-row label matches | The last row's Labor Class cell displays "zzzFinishing Service". |
| 7 | Verify the "Labor Class" column is read-only -> Labor Class cells are not editable | Labor Class cells are not editable; clicking one does not produce an input control. |
| 8 | Verify the "Labor Cost" cells are editable inputs -> Labor Cost column accepts user input | Labor Cost cells are editable text inputs that accept numeric values. |
| 9 | Note: the numeric value displayed in any Labor Cost cell varies by office and is not checked here. | No specific numeric value is asserted; the Labor Cost cells display numeric values that vary by office. |

**Expected**: The Labor Cost Assumptions table is present with two columns ("Labor Class" and "Labor Cost"). The first row's Labor Class text is "Administrative Fee", the last row's Labor Class text is "zzzFinishing Service", the Labor Class column is read-only, and the Labor Cost column is editable. The numeric value of any specific Labor Cost cell varies by office and is not checked here.
**Automatable**: Yes

---

## TC-LOS-ECT-009: ECT Tab — Labor Cost Edit, Save, Persist

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to ECT Settings tab -> Labor Cost Assumptions section visible | The ECT Settings panel is visible and the Labor Cost Assumptions section is in view. |
| 2 | Click **Administrative Fee** labor cost cell -> Raw value "35" shown | The Administrative Fee Labor Cost cell is focused and displays the raw value "35". |
| 3 | Clear and type `40` -> Value entered | The value "40" is entered in the Administrative Fee Labor Cost cell. |
| 4 | Tab out -> Field displays "40.00" | After tabbing out, the cell displays "40.00". |
| 5 | Verify **Save** (Labor Costs) button is **enabled** -> Change detected | The Save (Labor Costs) button is enabled. |
| 6 | Click **Save** -> Value saved (no confirmation dialog) | The save completes immediately with no confirmation dialog; the Save button becomes disabled. |
| 7 | Navigate away and return -> Reload | The ECT Settings tab reloads showing the current saved values. |
| 8 | Verify **Administrative Fee** labor cost = "40.00" -> Persisted | The Administrative Fee Labor Cost cell displays "40.00". |
| 9 | **Cleanup**: Change back to `35` and save | The Administrative Fee Labor Cost is restored to "35.00" and the save completes. |

**Expected**: Labor cost values editable and persist after save
**Automatable**: Yes

---

## TC-LOS-ECT-010: ECT Tab — Labor Cost Non-Numeric Input After Clear

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Blocked | Validation | No |

**Depends_On**: TC-LOS-ECT-001
**Status**: Blocked by BUG-LOS-ECT-010


**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to the ECT Settings tab -> Labor Cost Assumptions section is visible | The ECT Settings panel is visible and the Labor Cost Assumptions section is in view. |
| 2 | Note the current value of the "Administrative Fee" Labor Cost cell -> Original value recorded | The current value of the Administrative Fee Labor Cost cell is noted. |
| 3 | Triple-click the "Administrative Fee" Labor Cost cell to select all text -> All text in the cell is selected | All text in the Administrative Fee Labor Cost cell is selected. |
| 4 | Press Delete to clear the cell -> Cell is empty | The Administrative Fee Labor Cost cell is empty. |
| 5 | Type `abc` (non-numeric text) -> Cell shows the typed text | The cell displays the typed text "abc". |
| 6 | Press Tab to leave the cell -> Field commits the entry | Focus moves to the next cell. |
| 7 | Verify the field reverts to the original numeric value AND the field is shown as invalid OR the Save button is disabled -> Non-numeric input must NOT silently overwrite the original value with `0.00` | The field either reverts to the original value or is marked invalid, and the Save button remains disabled. The field does not silently change to "0.00" with Save enabled. |
| 8 | Verify the Save button is disabled -> The form cannot be saved with a non-numeric Labor Cost | The Save (Labor Costs) button is disabled. |

**Expected**: When the user clears a Labor Cost cell completely and then types non-numeric text, the field must either revert to its original value or be shown as invalid, and the Save button must stay disabled. The field must not silently change to `0.00` with the Save button enabled (which would allow the user to overwrite their original value with zero).
**Automatable**: No (blocked until the underlying issue is resolved)

---

## TC-LOS-ECT-011: ECT Tab — SubRental Matrix Table (Read-Only)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to ECT Settings tab -> Scroll to **SubRental Matrix** section | The ECT Settings panel is visible and the SubRental Matrix section is in view. |
| 2 | Verify heading "SubRental Matrix" -> Heading present | The heading "SubRental Matrix" is visible. |
| 3 | Verify table has 4 columns: **Lower Limit**, **Upper Limit**, **Subrental Percentage**, **Currency** -> Headers match | The table shows four column headers: "Lower Limit", "Upper Limit", "Subrental Percentage", and "Currency". |
| 4 | Verify table has 9 data rows -> Row count = 9 | The table body contains exactly 9 data rows. |
| 5 | Verify first row: $0.00 \| $4,999.00 \| 0.9% \| USD -> Data matches | The first row displays "$0.00", "$4,999.00", "0.9%", and "USD" in order. |
| 6 | Verify last row: $1,000,000.00 \| $10,000,000.00 \| 13.5% \| USD -> Data matches | The last row displays "$1,000,000.00", "$10,000,000.00", "13.5%", and "USD" in order. |
| 7 | Verify no editable fields in table -> All cells are display-only | No cell in the table becomes editable on click; all cells are display-only. |

**Expected**: SubRental Matrix table shows 9 rows of tiered subrental percentages, all read-only
**Automatable**: Yes

---

## TC-LOS-ECT-012: ECT Tab — Save Behavior (No Confirmation Dialog)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to ECT Settings tab -> Make any edit (e.g., change Benefits Multiplier) | The ECT Settings panel is visible and an edit has been made. |
| 2 | Click **Save** (Fixed Costs) -> Verify NO confirmation dialog appears | No confirmation dialog appears after clicking Save (Fixed Costs). |
| 3 | Verify save completes immediately -> Field retains new value | The save completes and the edited field retains the new value. |
| 4 | Navigate to another tab -> Verify no unsaved changes dialog (already saved) | No unsaved-changes dialog appears on navigating away. |
| 5 | **Cleanup**: Restore original values if changed | The original values are restored and the Save (Fixed Costs) button is disabled. |

**Expected**: ECT Settings Save buttons save directly without confirmation dialog; no unsaved changes dialog after save
**Automatable**: Yes

---

## TC-LOS-ECT-013: Historical Subrental % — Edit, Save, Persist

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Round-Trip | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read current Historical Subrental value (defensive — do not assume a default) | The current Historical Subrental % value is noted. |
| 2 | Pick a test value different from the current value (for example: if currently 0.0%, use 0.1; if already changed, use 0) | A test value different from the current value is identified. |
| 3 | Save Fixed Costs and wait for the Save button to become disabled. | After the chosen test value is entered, Save (Fixed Costs) completes and the button becomes disabled. |
| 4 | Navigate to Basic Info, then return to ECT | The ECT Settings tab reloads and the Historical Subrental % field shows the saved value. |
| 5 | Verify display shows expected percent | The Historical Subrental % field displays the expected percentage value. |
| 6 | Restore: fill original raw value, save, then verify restored | The original value is saved and the Historical Subrental % field shows the original percentage. |

**Expected**: Historical Subrental % persists across save-reload cycle
**Automatable**: Yes

---

## TC-LOS-ECT-014: Labor Cost Middle Row — Persistence

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Round-Trip / BVA | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to ECT tab | The ECT Settings panel is visible. |
| 2 | Read the current labor cost value for a labor class in the middle of the table. | The current labor cost value for the middle-row labor class is noted. |
| 3 | Pick different test value | A test value different from the current value is identified. |
| 4 | Fill -> save Labor Costs -> navigate away -> return -> verify persisted | After saving and navigating back to ECT, the middle-row labor cost displays the new value. |
| 5 | Restore original value | The original labor cost value is saved and the cell displays the restored value. |

**Expected**: Labor cost middle row persists correctly after save and reload
**Automatable**: Yes

---

## TC-LOS-ECT-015: Labor Cost Last Row — Persistence

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Round-Trip / BVA | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to ECT tab | The ECT Settings panel is visible. |
| 2 | Read the current labor cost value in the last row of the table. | The current labor cost value in the last row is noted. |
| 3 | Pick different test value | A test value different from the current value is identified. |
| 4 | Fill -> save Labor Costs -> navigate away -> return -> verify persisted | After saving and navigating back to ECT, the last-row labor cost displays the new value. |
| 5 | Restore original value | The original labor cost value is saved and the cell displays the restored value. |

**Expected**: Labor cost last row persists correctly after save and reload (this also exercises scrolling to the last row)
**Automatable**: Yes

---

## TC-LOS-ECT-016: Multi-field Fixed Costs — Single Save Persists Both

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Round-Trip | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read current Benefits Multiplier and Historical Subrental % values | The current values of both Benefits Multiplier and Historical Subrental % are noted. |
| 2 | Edit both Benefits Multiplier and Historical Subrental % | Both fields are edited and both show their new values. |
| 3 | Single save (Fixed Costs) | The save completes and the Save (Fixed Costs) button becomes disabled. |
| 4 | Full page reload -> navigate to ECT | The ECT Settings tab reloads and displays the current saved values. |
| 5 | Verify both values persisted | Both Benefits Multiplier and Historical Subrental % display the values that were saved. |
| 6 | Restore both -> single save -> verify restored | Both fields are restored to their original values with a single save, and both display their original values. |

**Expected**: Editing both Benefits Multiplier and Historical Subrental % then saving once persists BOTH values
**Automatable**: Yes

---

## TC-LOS-ECT-017: Discard Unsaved Changes — No Persistence (State Transition)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | State Transition / Negative RT | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Read current Benefits Multiplier value (baseline) | The current Benefits Multiplier value is noted. |
| 2 | Fill Benefits Multiplier with a different value to make a change | The Benefits Multiplier field shows the new value and the Save (Fixed Costs) button is enabled. |
| 3 | Click Basic Info tab directly (triggers unsaved changes dialog) | An unsaved-changes dialog appears asking whether to stay or discard changes. |
| 4 | Click Discard on the dialog | The dialog closes and navigation proceeds away from the ECT Settings tab. |
| 5 | Navigate back to ECT | The ECT Settings tab loads and displays the current saved values. |
| 6 | Verify Benefits Multiplier is unchanged (original value) | The Benefits Multiplier field displays the original value noted before the edit. |

**Expected**: Discarding unsaved changes prevents persistence; unsaved-changes detection fires correctly on ECT tab
**Automatable**: Yes
