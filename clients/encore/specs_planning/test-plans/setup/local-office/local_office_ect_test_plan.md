# Local Office Settings — ECT Settings Test Plan

**Module**: local-office | **Test Cases**: [../../../test-cases/setup/local-office/local_office_ect_test_cases.md](../../../test-cases/setup/local-office/local_office_ect_test_cases.md)
**Spec**: `tests/local-office/local-office-ect.spec.ts`
**URL**: `/navigator/locations/{officeId}/settings/local-office` (ECT Settings tab)
**Updated**: 2026-04-13 | **Status**: Manual | **Total TCs**: 18 (TC-LOS-ECT-*)
**Sibling test plans**: [BAS](local_office_settings_test_plan.md) · [HIS](local_office_history_test_plan.md)

**Split note**: This file was split from the combined `local_office_settings_test_plan.md` on 2026-05-05 to match the 1:1 spec→md convention used by the locations module (the underlying spec breakdown landed in commit f721e15, 2026-03-26). Sibling test plans: [BAS](local_office_settings_test_plan.md), [HIS](local_office_history_test_plan.md).

---

## Coverage Summary

| Sub-Module | TC ID Range | Count | Key Risks |
|---|---|---|---|
| ECT — Display & Structure | ECT-001 to ECT-004 + ECT-018 | 5 | Currency selector, profit target table, fixed cost fields, sub-section headings |
| ECT — Editable Fields & Save | ECT-005 to ECT-009 | 5 | Benefits Multiplier decimal format, 2 independent Saves, labor costs |
| ECT — Validation & Read-Only | ECT-010 to ECT-012 | 3 | Non-numeric revert, subrental matrix, no-dialog save |
| ECT — Persistence Gap-Fill (RT) | ECT-013 to ECT-017 | 5 | Round-trip persistence, multi-field saves, discard behavior |

---

## Preconditions (All Scenarios)

- User authenticated with Read+Write on location 1604
- Browser at `/navigator/locations/1604/settings/local-office`
- No unsaved changes on page load
- Save button disabled on fresh load


---

## Scenario Group 13: ECT Tab — Navigation & Display

### TC-LOS-ECT-001
1. Click `[data-testid="local-office-settings-tab-ect-settings"]`
2. Assert tab `aria-selected="true"`
3. Assert `[data-testid="ect-settings-label-location-name"]` text = "1604 - Parker Palm Springs"
4. Assert `[data-testid="ect-settings-link-commission-structure"]` visible with text "Commission structure"
5. Assert `[data-testid="ect-settings-select-currency"]` text contains "USD"
6. Expected: ECT header, commission link, currency selector displayed

### TC-LOS-ECT-002
1. Click `[data-testid="ect-settings-select-currency"]` to open dropdown
2. Assert 1 option: "USD"
3. Close dropdown
4. Expected: Single currency option

### TC-LOS-ECT-003
1. Assert `[data-testid="ect-settings-section-title-event-profit-target"]` text = "Event Profit Target"
2. Assert table within `[data-testid="ect-settings-table-event-profit-target"]` has 4 columns + 9 rows
3. Assert first row: $5,000.01 | $10,000.00 | 40.0% | USD
4. Assert last row: $2,000,000.01 | $10,000,000.00 | 30.0% | USD
5. Assert no input elements in table (read-only)
6. Expected: 9-row profit target table, read-only

### TC-LOS-ECT-004
1. Assert `[data-testid="ect-settings-field-venue-fixed-costs"]` contains "13.9%"
2. Assert `[data-testid="ect-settings-field-sga-percent"]` contains "8.0%"
3. Assert `[data-testid="ect-settings-field-other-rate"]` contains "0.0%"
4. Assert `[data-testid="ect-settings-field-no-labour-rate"]` contains "0.0%"
5. Assert `[data-testid="ect-settings-field-approval-threshold"]` contains "$10,000,000.00"
6. Assert `[data-testid="ect-settings-field-peak-labor-adjustment"]` contains "5.0%"
7. Assert `[data-testid="ect-settings-field-non-peak-labor-adjustment"]` contains "0.0%"
8. Expected: 7 read-only fields with correct values

---

## Scenario Group 14: ECT Tab — Editable Fields & Save

### TC-LOS-ECT-005
1. Assert `[data-testid="ect-settings-input-benefits-multiplier"]` display = "20.0%"
2. Click field; assert raw value = "0.2"
3. Fill "0.25"; Tab out; assert display = "25.0%"
4. Assert `[data-testid="ect-settings-btn-save-fixed-costs-btn"]` enabled
5. Click Save; assert no confirmation dialog
6. Navigate away + return; assert value = "25.0%"
7. Cleanup: Restore "0.2" and save
8. Expected: Decimal-to-percent format; persists after save

### TC-LOS-ECT-006
1. Assert `[data-testid="ect-settings-input-historical-subrental"]` display = "0.0%"
2. Click field; fill "0.1"; Tab out; assert display = "10.0%"
3. Assert Fixed Costs Save enabled
4. Cleanup: Restore "0" and save
5. Expected: Historical Subrental % editable; decimal format

### TC-LOS-ECT-007
1. Assert `[data-testid="ect-settings-btn-save-fixed-costs-btn"]` disabled
2. Assert `[data-testid="ect-settings-btn-save-labor-costs-btn"]` disabled
3. Edit Benefits Multiplier
4. Assert Fixed Costs Save enabled; Labor Costs Save still disabled
5. Cleanup: Restore original
6. Expected: Independent Save buttons per section

### TC-LOS-ECT-008
1. Assert `[data-testid="ect-settings-section-title-labor-cost-assumptions"]` text = "Labor Cost Assumptions"
2. Assert table has 2 columns: Labor Class, Labor Cost
3. Count rows = 66
4. Assert first row: "Administrative Fee" / "35.00"
5. Assert last row: "zzzFinishing Service" / "37.10"
6. Assert Labor Class cells have no input (read-only); Labor Cost cells have `input` elements
7. Expected: 66-row table; only costs editable

### TC-LOS-ECT-009
1. Click `[data-testid="ect-settings-input-labor-cost-0"]`; assert raw value "35"
2. Fill "40"; Tab out; assert display "40.00"
3. Assert `[data-testid="ect-settings-btn-save-labor-costs-btn"]` enabled
4. Click Save; assert no dialog
5. Navigate away + return; assert value "40.00"
6. Cleanup: Restore "35" and save
7. Expected: Labor cost editable; persists; no save dialog

---

## Scenario Group 15: ECT Tab — Validation & Read-Only Tables

### TC-LOS-ECT-010
1. Click `[data-testid="ect-settings-input-labor-cost-0"]`; fill "abc"; Tab out
2. Assert value reverted to "35.00" (original)
3. Assert no `aria-invalid`, no error message displayed
4. Expected: Non-numeric input silently rejected; reverts to original

### TC-LOS-ECT-011
1. Assert `[data-testid="ect-settings-section-title-sub-rental-matrix"]` text = "SubRental Matrix"
2. Assert table has 4 columns: Lower Limit, Upper Limit, Subrental Percentage, Currency
3. Count rows = 9
4. Assert first row: $0.00 | $4,999.00 | 0.9% | USD
5. Assert last row: $1,000,000.00 | $10,000,000.00 | 13.5% | USD
6. Assert no input elements in table
7. Expected: 9-row subrental matrix, read-only

### TC-LOS-ECT-012
1. Edit Benefits Multiplier; click Fixed Costs Save
2. Assert no confirmation dialog; save completes
3. Navigate to another tab; assert no unsaved changes dialog
4. Cleanup: Restore values
5. Expected: ECT saves without dialog

---

## Scenario Group 16: ECT Tab — Persistence Gap-Fill (RT)

### TC-LOS-ECT-013
1. Read current Historical Subrental % value (defensive)
2. Fill different test value; save Fixed Costs; wait for save disabled
3. Navigate to Basic Info → return to ECT
4. Assert HS % shows expected persisted value
5. Restore original value; save; verify restored
6. Expected: Historical Subrental % persists across save-reload

### TC-LOS-ECT-014
1. Navigate to ECT tab
2. Read current labor cost at row index 33 (middle row)
3. Fill different test value; save Labor Costs
4. Navigate away → return; assert value persisted
5. Restore original; save
6. Expected: Middle-row labor cost persists correctly (BVA middle boundary)

### TC-LOS-ECT-015
1. Navigate to ECT tab
2. Read current labor cost at row index 65 (last row)
3. Fill different test value; save Labor Costs
4. Navigate away → return; assert value persisted
5. Restore original; save
6. Expected: Last-row labor cost persists correctly (BVA upper boundary)

### TC-LOS-ECT-016
1. Navigate to ECT tab; read current BM and HS values
2. Edit both Benefits Multiplier and Historical Subrental %
3. Single Fixed Costs save
4. Full page reload → navigate to ECT
5. Assert both BM and HS show expected persisted values
6. Restore both; single save; verify restored
7. Expected: Single save persists both editable Fixed Costs fields

### TC-LOS-ECT-017
1. Navigate to ECT tab; read current BM value
2. Fill BM with different value (dirty the form)
3. Click Basic Info tab directly (triggers unsaved dialog)
4. Click Discard on the dialog
5. Navigate back to ECT; assert BM unchanged (original value)
6. Expected: Discarding unsaved changes prevents persistence

## Coverage Index (regenerated 2026-06-11 from the test-cases file)

Authoritative current case list (18 cases). Scenario prose above may lag; this index is mechanically regenerated.

- TC-LOS-ECT-001 — ECT Tab — Navigation and Header Display
- TC-LOS-ECT-018 — ECT Tab — Sub-Section Headings Present
- TC-LOS-ECT-002 — ECT Tab — Currency Selector (Single Option)
- TC-LOS-ECT-003 — ECT Tab — Event Profit Target Table (Read-Only)
- TC-LOS-ECT-004 — ECT Tab — Fixed Cost Display Fields (Read-Only)
- TC-LOS-ECT-005 — ECT Tab — Benefits Multiplier Edit, Save, Persist
- TC-LOS-ECT-006 — ECT Tab — Historical Subrental % Edit
- TC-LOS-ECT-007 — ECT Tab — Two Independent Save Buttons
- TC-LOS-ECT-008 — ECT Tab — Labor Cost Assumptions Table Structure
- TC-LOS-ECT-009 — ECT Tab — Labor Cost Edit, Save, Persist
- TC-LOS-ECT-010 — ECT Tab — Labor Cost Non-Numeric Input After Clear
- TC-LOS-ECT-011 — ECT Tab — SubRental Matrix Table (Read-Only)
- TC-LOS-ECT-012 — ECT Tab — Save Behavior (No Confirmation Dialog)
- TC-LOS-ECT-013 — Historical Subrental % — Edit, Save, Persist (RT)
- TC-LOS-ECT-014 — Labor Cost Middle Row (Index 33) — Persistence (RT)
- TC-LOS-ECT-015 — Labor Cost Last Row (Index 65) — Persistence (RT)
- TC-LOS-ECT-016 — Multi-field Fixed Costs — Single Save Persists Both (RT)
- TC-LOS-ECT-017 — Discard Unsaved Changes — No Persistence (State Transition)
