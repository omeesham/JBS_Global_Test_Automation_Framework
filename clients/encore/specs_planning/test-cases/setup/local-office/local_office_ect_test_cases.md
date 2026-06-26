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
| Total fields found | 77 (2 editable inputs + 66 labor cost inputs + 1 currency combobox + 1 commission link + 7 read-only display fields) |
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
| Select Currency | combobox | USD | enabled; 1 option | `ect-settings-select-currency` |
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
1. Navigate to `/navigator/locations/1604/settings/local-office` -> Page loads
2. Click the "ECT Settings" tab -> Tab becomes selected
3. Verify the heading reads "1604 - Parker Palm Springs" -> Location name is displayed
4. Verify the "Edit/View" label is shown with a "Commission structure" link -> Link element is present in the page
5. Verify the "Select Currency" combobox shows "USD" -> Default currency is displayed
6. Note: clicking the "Commission structure" link to verify the destination page is OUT OF SCOPE for this TC (gated by the metadata above) -> Click-outcome verification deferred

**Expected**: The ECT tab displays the location name, the Commission structure link element, and the currency dropdown. Clicking the Commission structure link to verify the destination page is gated by the metadata above and is not asserted by this TC.
**Automatable**: No (link-click outcome blocked until the underlying issue is resolved)

---

## TC-LOS-ECT-018: ECT Tab — Sub-Section Headings Present

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Smoke | Yes |

**Depends_On**: TC-LOS-ECT-001

**Steps**:
1. Navigate to `/navigator/locations/1604/settings/local-office` -> Page loads
2. Click the "ECT Settings" tab -> Tab becomes selected
3. Verify the heading "Event Profit Target" is visible on the tab -> Heading present
4. Verify the heading "Fixed Costs" is visible on the tab -> Heading present
5. Verify the heading "Labor Cost Assumptions" is visible on the tab (plural form) -> Heading present
6. Verify the heading "SubRental Matrix" is visible on the tab -> Heading present

**Expected**: The ECT Settings tab shows the four sub-section headings verbatim: "Event Profit Target", "Fixed Costs", "Labor Cost Assumptions" (plural), and "SubRental Matrix".
**Automatable**: Yes

---

## TC-LOS-ECT-002: ECT Tab — Currency Selector (Single Option)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
1. Navigate to ECT Settings tab -> Tab panel visible
2. Click **Select Currency** combobox to open dropdown -> Options visible
3. Verify exactly 1 option: **USD** -> Only USD available
4. Close dropdown -> No change

**Expected**: The currency dropdown has only the "USD" option for location 1604
**Automatable**: Yes

---

## TC-LOS-ECT-003: ECT Tab — Event Profit Target Table (Read-Only)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
1. Navigate to ECT Settings tab -> Scroll to **Event Profit Target** section
2. Verify heading "Event Profit Target" (h4) -> Heading present
3. Verify table has 4 columns: **Lower Limit**, **Upper Limit**, **Target**, **Currency** -> Headers match
4. Verify table has 9 data rows -> Row count = 9
5. Verify first row: $5,000.01 | $10,000.00 | 40.0% | USD -> Data matches
6. Verify last row: $2,000,000.01 | $10,000,000.00 | 30.0% | USD -> Data matches
7. Verify no editable fields in table -> All cells are display-only

**Expected**: Event Profit Target table shows 9 rows of tiered profit targets, all read-only
**Automatable**: Yes

---

## TC-LOS-ECT-004: ECT Tab — Fixed Cost Display Fields (Read-Only)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
1. Navigate to ECT Settings tab -> Fixed costs section visible
2. Verify **Venue Fixed Costs** = "13.9%" -> Read-only display
3. Verify **SG&A %** = "8.0%" -> Read-only display
4. Verify **Other Rate** = "0.0%" -> Read-only display
5. Verify **No Labor Rate** = "0.0%" -> Read-only display
6. Verify **Approval Threshold** = "$10,000,000.00" -> Read-only display
7. Verify **Peak Labor Adjustment %** = "5.0%" -> Read-only display
8. Verify **Non-Peak Labor Adjustment %** = "0.0%" -> Read-only display

**Expected**: All 7 read-only fixed cost fields display correct values | **Data**: location=1604
**Automatable**: Yes

---

## TC-LOS-ECT-005: ECT Tab — Benefits Multiplier Edit, Save, Persist

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
1. Navigate to ECT Settings tab -> Fixed costs section visible
2. Verify **Benefits Multiplier** default = "20.0%" -> Displayed as percentage
3. Click **Benefits Multiplier** field -> Raw value "0.2" shown (decimal format)
4. Clear and type `0.25` -> Value entered
5. Tab out -> Field displays "25.0%"
6. Verify **Save** (Fixed Costs) button is **enabled** -> Change detected
7. Click **Save** -> Value saved (no confirmation dialog)
8. Navigate away and return to ECT tab -> Reload ECT settings
9. Verify **Benefits Multiplier** = "25.0%" -> Persisted
10. **Cleanup**: Change back to `0.2` (displays 20.0%) and save

**Expected**: Benefits Multiplier editable as decimal; displays as percentage; persists after save | **Data**: from 0.2 to 0.25
**Automatable**: Yes

---

## TC-LOS-ECT-006: ECT Tab — Historical Subrental % Edit

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
1. Navigate to ECT Settings tab -> Fixed costs section visible
2. Verify **Historical Subrental %** default = "0.0%" -> Displayed as percentage
3. Click field -> Raw value "0" shown
4. Clear and type `0.1` -> Value entered
5. Tab out -> Field displays "10.0%"
6. Verify **Save** (Fixed Costs) button is **enabled** -> Change detected
7. **Cleanup**: Change back to `0` and save

**Expected**: Historical Subrental % editable as decimal; displays as percentage
**Automatable**: Yes

---

## TC-LOS-ECT-007: ECT Tab — Two Independent Save Buttons

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-ECT-001

**Steps**:
1. Navigate to the ECT Settings tab -> Tab panel visible
2. Verify the Save button for the Fixed Costs section exists and is disabled -> Save Fixed Costs button is present and not enabled
3. Verify the Save button for the Labor Costs section exists and is disabled -> Save Labor Costs button is present and not enabled
4. Edit the "Benefits Multiplier" field (in Fixed Costs) -> The Fixed Costs Save button becomes enabled; the Labor Costs Save button stays disabled
5. Cleanup: restore the original value

**Expected**: Each section on the ECT Settings tab has its own independent Save button; editing a field in one section only enables that section's Save button.
**Automatable**: Yes

---

## TC-LOS-ECT-008: ECT Tab — Labor Cost Assumptions Table Structure

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-ECT-001

**Steps**:
1. Navigate to the ECT Settings tab -> Scroll to the "Labor Cost Assumptions" section
2. Verify the heading "Labor Cost Assumptions" is visible -> Heading present
3. Verify the table has two columns: "Labor Class" and "Labor Cost" -> Headers match
4. Verify the table has at least one data row -> Table is not empty
5. Verify the first row's Labor Class cell shows "Administrative Fee" -> First-row label matches
6. Verify the last row's Labor Class cell shows "zzzFinishing Service" -> Last-row label matches
7. Verify the "Labor Class" column is read-only -> Labor Class cells are not editable
8. Verify the "Labor Cost" cells are editable inputs -> Labor Cost column accepts user input
9. Note: the numeric value displayed in any Labor Cost cell is office-state-dependent and is NOT asserted by this TC

**Expected**: The Labor Cost Assumptions table is present with two columns ("Labor Class" and "Labor Cost"). The first row's Labor Class text is "Administrative Fee", the last row's Labor Class text is "zzzFinishing Service", the Labor Class column is read-only, and the Labor Cost column is editable. The numeric value of any specific Labor Cost cell is not asserted (office-state-dependent).
**Automatable**: Yes

---

## TC-LOS-ECT-009: ECT Tab — Labor Cost Edit, Save, Persist

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
1. Navigate to ECT Settings tab -> Labor Cost Assumptions section visible
2. Click **Administrative Fee** labor cost cell -> Raw value "35" shown
3. Clear and type `40` -> Value entered
4. Tab out -> Field displays "40.00"
5. Verify **Save** (Labor Costs) button is **enabled** -> Change detected
6. Click **Save** -> Value saved (no confirmation dialog)
7. Navigate away and return -> Reload
8. Verify **Administrative Fee** labor cost = "40.00" -> Persisted
9. **Cleanup**: Change back to `35` and save

**Expected**: Labor cost values editable and persist after save | **Data**: Administrative Fee from 35.00 to 40.00
**Automatable**: Yes

---

## TC-LOS-ECT-010: ECT Tab — Labor Cost Non-Numeric Input After Clear

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Blocked | Validation | No |

**Depends_On**: TC-LOS-ECT-001
**Status**: Blocked by BUG-LOS-ECT-010


**Steps**:
1. Navigate to the ECT Settings tab -> Labor Cost Assumptions section is visible
2. Note the current value of the "Administrative Fee" Labor Cost cell -> Original value recorded
3. Triple-click the "Administrative Fee" Labor Cost cell to select all text -> All text in the cell is selected
4. Press Delete to clear the cell -> Cell is empty
5. Type `abc` (non-numeric text) -> Cell shows the typed text
6. Press Tab to leave the cell -> Field commits the entry
7. Verify the field reverts to the original numeric value AND the field is shown as invalid OR the Save button is disabled -> Non-numeric input must NOT silently overwrite the original value with `0.00`
8. Verify the Save button is disabled -> The form cannot be saved with a non-numeric Labor Cost

**Expected**: When the user clears a Labor Cost cell completely and then types non-numeric text, the field must either revert to its original value or be shown as invalid, and the Save button must stay disabled. The field must not silently change to `0.00` with the Save button enabled (which would allow the user to overwrite their original value with zero).
**Automatable**: No (blocked until the underlying issue is resolved)

---

## TC-LOS-ECT-011: ECT Tab — SubRental Matrix Table (Read-Only)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
1. Navigate to ECT Settings tab -> Scroll to **SubRental Matrix** section
2. Verify heading "SubRental Matrix" (h4) -> Heading present
3. Verify table has 4 columns: **Lower Limit**, **Upper Limit**, **Subrental Percentage**, **Currency** -> Headers match
4. Verify table has 9 data rows -> Row count = 9
5. Verify first row: $0.00 | $4,999.00 | 0.9% | USD -> Data matches
6. Verify last row: $1,000,000.00 | $10,000,000.00 | 13.5% | USD -> Data matches
7. Verify no editable fields in table -> All cells are display-only

**Expected**: SubRental Matrix table shows 9 rows of tiered subrental percentages, all read-only
**Automatable**: Yes

---

## TC-LOS-ECT-012: ECT Tab — Save Behavior (No Confirmation Dialog)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
1. Navigate to ECT Settings tab -> Make any edit (e.g., change Benefits Multiplier)
2. Click **Save** (Fixed Costs) -> Verify NO confirmation dialog appears
3. Verify save completes immediately -> Field retains new value
4. Navigate to another tab -> Verify no unsaved changes dialog (already saved)
5. **Cleanup**: Restore original values if changed

**Expected**: ECT Settings Save buttons save directly without confirmation dialog; no unsaved changes dialog after save
**Automatable**: Yes

---

## TC-LOS-ECT-013: Historical Subrental % — Edit, Save, Persist (RT)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Round-Trip | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
1. Read current Historical Subrental value (defensive — don't assume default)
2. Pick test value different from current (e.g., if 0.0% -> fill 0.1; if already changed -> fill 0)
3. Save Fixed Costs -> wait for save button disabled
4. Navigate to Basic Info -> return to ECT
5. Verify display shows expected percent
6. Restore: fill original raw value -> save -> verify restored

**Expected**: Historical Subrental % persists across save-reload cycle
**Automatable**: Yes

---

## TC-LOS-ECT-014: Labor Cost Middle Row (Index 33) — Persistence (RT)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Round-Trip / BVA | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
1. Navigate to ECT tab
2. Read current labor cost value at row index 33
3. Pick different test value
4. Fill -> save Labor Costs -> navigate away -> return -> verify persisted
5. Restore original value

**Expected**: Labor cost middle row (index 33) persists correctly; data-driven with TC-015
**Automatable**: Yes

---

## TC-LOS-ECT-015: Labor Cost Last Row (Index 65) — Persistence (RT)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Round-Trip / BVA | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
1. Navigate to ECT tab
2. Read current labor cost value at row index 65 (last row of 66-row table)
3. Pick different test value
4. Fill -> save Labor Costs -> navigate away -> return -> verify persisted
5. Restore original value

**Expected**: Labor cost last row (index 65) persists correctly; exercises scroll + BVA upper boundary
**Automatable**: Yes

---

## TC-LOS-ECT-016: Multi-field Fixed Costs — Single Save Persists Both (RT)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Round-Trip | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
1. Read current BM and HS values
2. Edit both Benefits Multiplier and Historical Subrental %
3. Single save (Fixed Costs)
4. Full page reload -> navigate to ECT
5. Verify both values persisted
6. Restore both -> single save -> verify restored

**Expected**: Editing both BM and HS then saving once persists BOTH values
**Automatable**: Yes

---

## TC-LOS-ECT-017: Discard Unsaved Changes — No Persistence (State Transition)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | State Transition / Negative RT | Yes |

**Depends_On**: TC-LOS-ECT-001
**Steps**:
1. Read current BM value (baseline)
2. Fill BM with different value (dirty the form)
3. Click Basic Info tab directly (triggers unsaved changes dialog)
4. Click Discard on the dialog
5. Navigate back to ECT
6. Verify BM is unchanged (original value)

**Expected**: Discarding unsaved changes prevents persistence; unsaved-changes detection fires correctly on ECT tab
**Automatable**: Yes
