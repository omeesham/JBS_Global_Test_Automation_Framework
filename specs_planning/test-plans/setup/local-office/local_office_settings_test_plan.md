# Local Office Settings Test Plan

**Module**: locations | **Test Cases**: [test-cases/locations/locations_local_office_settings_test_cases.md](../../test-cases/locations/locations_local_office_settings_test_cases.md)
**URL**: `/navigator/locations/{officeId}/settings/local-office`
**Updated**: 2026-03-23 | **Status**: Manual | **Total TCs**: 58

---

## Coverage Summary

| Sub-Module | TC ID Range | Count | Key Risks |
|---|---|---|---|
| Page Load & Tab Structure | BAS-001 | 1 | Tab default state |
| Date Offsets — Defaults & CRUD | BAS-002 to BAS-010 | 9 | NM-1264 cross-field, non-numeric rejection, boundary values |
| Misc Settings — Checkboxes | BAS-011 to BAS-014 | 4 | Fulfillment->QC cascade, Default Labor to Hourly |
| Misc Settings — Phone Fields | BAS-015 to BAS-019 | 5 | Phone 1 required (no format validation), Phone 2 optional |
| Misc Settings — Other Fields | BAS-020 to BAS-024 | 5 | Default Job sub-checkboxes, Default Order Type (2 opts), PO fields |
| Section Configuration | BAS-025 to BAS-029 | 5 | 13 active default, toggle, edit, add, Default reset |
| Room Configuration | BAS-030 to BAS-031 | 2 | Empty table, add room |
| Default Logo | BAS-032 to BAS-034 | 3 | Checkboxes, 12 combobox options, preview update |
| Discount Exemptions | BAS-035 | 1 | Exempt toggles |
| Save & Unsaved Changes Dialogs | BAS-036 to BAS-038 | 3 | Save dialog text, unsaved Stay/Discard |
| Boundary — XSS | BAS-039 | 1 | XSS in text fields |
| History Tab | HIS-001 to HIS-007 | 7 | Read-only audit log, 42 columns, history type selector, pagination |
| ECT — Display & Structure | ECT-001 to ECT-004 | 4 | Currency selector, profit target table, fixed cost fields |
| ECT — Editable Fields & Save | ECT-005 to ECT-009 | 5 | Benefits Multiplier decimal format, 2 independent Saves, labor costs |
| ECT — Validation & Read-Only | ECT-010 to ECT-012 | 3 | Non-numeric revert, subrental matrix, no-dialog save |

---

## Preconditions (All Scenarios)

- User authenticated with Read+Write on location 1604
- Browser at `/navigator/locations/1604/settings/local-office`
- No unsaved changes on page load
- Save button disabled on fresh load

---

## Scenario Group 1: Page Load & Tab Navigation

### TC-LOS-BAS-001
1. Navigate to `[BASE_URL]/navigator/locations/1604/settings/local-office`
2. Assert `document.title` = "Local Office Settings | Navigator"
3. Assert `h1` text "Local Office Settings" visible
4. Assert `[data-testid="local-office-settings-tab-basic-information"]` has `aria-selected="true"`
5. Assert `[data-testid="local-office-settings-tab-location-settings-history"]` visible
6. Assert `[data-testid="local-office-settings-tab-ect-settings"]` visible
7. Assert `[data-testid="local-office-settings-btn-save"]` is disabled
8. Expected: Page rendered; Basic Information active; Save disabled

---

## Scenario Group 2: Default Date Offsets

### TC-LOS-BAS-002
1. Assert `[data-testid="local-office-settings-input-prep-date-offset"]` value = "-1"
2. Assert `[data-testid="local-office-settings-input-return-date-offset"]` value = "1"
3. Assert `[data-testid="local-office-settings-input-set-date-offset"]` value = "-1"
4. Assert `[data-testid="local-office-settings-input-strike-date-offset"]` value = "1"
5. Assert `[data-testid="local-office-settings-input-delivery-date-offset"]` value = "0"
6. Assert `[data-testid="local-office-settings-input-pickup-date-offset"]` value = "0"
7. Expected: All 6 offsets match defaults (-1,1,-1,1,0,0)

### TC-LOS-BAS-003
1. Assert Save button `[data-testid="local-office-settings-btn-save"]` disabled on fresh load
2. Expected: Save disabled with no edits

### TC-LOS-BAS-004
1. Assert Save disabled
2. Fill `[data-testid="local-office-settings-input-prep-date-offset"]` with "-2"
3. Assert Save enabled
4. Cleanup: Restore "-1"
5. Expected: Any date offset edit enables Save

### TC-LOS-BAS-005
1. Fill `[data-testid="local-office-settings-input-prep-date-offset"]` with "-2"
2. Click Save `[data-testid="local-office-settings-btn-save"]`
3. Assert shared "Save Changes" dialog appears
4. Assert dialog body "Are you sure you want to save the changes?"
5. Click **Save** in dialog; assert dialog closes
6. Reload page; assert prep offset = "-2"
7. Cleanup: Restore "-1" and save
8. Expected: Edit persists after save + reload

### TC-LOS-BAS-006
1. Fill `[data-testid="local-office-settings-input-prep-date-offset"]` with "abc"
2. Assert field has `aria-invalid="true"`
3. Assert Save disabled
4. Cleanup: Restore "-1"
5. Expected: Non-numeric input triggers aria-invalid, Save blocked

### TC-LOS-BAS-007 — NM-1264 Cross-Field
1. Fill `[data-testid="local-office-settings-input-delivery-date-offset"]` with "-5"
2. Assert `[data-testid="local-office-settings-input-delivery-date-offset"]` has `aria-invalid="true"`
3. Assert Save disabled (Delivery -5 < Prep -1 = invalid)
4. Cleanup: Restore "0"
5. Expected: Delivery < Prep triggers aria-invalid on Delivery

### TC-LOS-BAS-008
1. (State: Delivery=-5, aria-invalid, Save disabled)
2. Fill `[data-testid="local-office-settings-input-delivery-date-offset"]` with "-1"
3. Assert `aria-invalid` removed from Delivery field
4. Assert Save enabled (form dirty: Delivery changed from server-original 0 to -1)
5. Expected: Correcting violation clears error

### TC-LOS-BAS-009
1. Fill `[data-testid="local-office-settings-input-set-date-offset"]` with "-10"
2. Assert field does NOT have `aria-invalid`
3. Assert Save enabled
4. Cleanup: Restore "-1"
5. Expected: Negative values valid for "relative to start" offset fields

### TC-LOS-BAS-010
1. Fill `[data-testid="local-office-settings-input-prep-date-offset"]` with "0"
2. Assert field does NOT have `aria-invalid`
3. Assert Save enabled
4. Cleanup: Restore "-1"
5. Expected: Zero is valid

---

## Scenario Group 3: Misc Settings — Checkboxes

### TC-LOS-BAS-011
1. Assert `[data-testid="local-office-settings-checkbox-use-fulfillment"]` `aria-checked="false"`
2. Assert `[data-testid="local-office-settings-checkbox-use-equipments-qc"]` `aria-checked="false"` AND `disabled`
3. Assert `[data-testid="local-office-settings-checkbox-default-labor-to-hourly"]` `aria-checked="false"`, enabled
4. Assert `[data-testid="local-office-settings-checkbox-default-job-one-day-event"]` `aria-checked="false"`
5. Assert `[data-testid="local-office-settings-checkbox-default-job-one-day-outside"]` `aria-checked="false"`
6. Assert `[data-testid="local-office-settings-checkbox-default-job-one-day-internal"]` `aria-checked="false"`
7. Expected: All checkboxes unchecked; QC disabled when Fulfillment unchecked

### TC-LOS-BAS-012 — Fulfillment->QC Cascade
1. Assert QC `[data-testid="local-office-settings-checkbox-use-equipments-qc"]` disabled
2. Click `[data-testid="local-office-settings-checkbox-use-fulfillment"]`
3. Assert Fulfillment `aria-checked="true"`
4. Assert QC now enabled (no `disabled` attribute)
5. Assert Save enabled
6. Cleanup: Uncheck Fulfillment; assert QC disabled again
7. Expected: Fulfillment enables/disables QC

### TC-LOS-BAS-013
1. Click `[data-testid="local-office-settings-checkbox-use-fulfillment"]`; assert checked
2. Click Save; confirm dialog; click Yes
3. Reload; assert Fulfillment checked, QC enabled
4. Cleanup: Uncheck Fulfillment, save
5. Expected: Fulfillment state + QC cascade persists

### TC-LOS-BAS-014
1. Assert `[data-testid="local-office-settings-checkbox-default-labor-to-hourly"]` unchecked
2. Click checkbox; assert `aria-checked="true"`
3. Click Save; confirm; reload
4. Assert checkbox still checked
5. Cleanup: Uncheck, save
6. Expected: Default Labor to Hourly persists

---

## Scenario Group 4: Misc Settings — Phone Fields

### TC-LOS-BAS-015
1. Clear `[data-testid="local-office-settings-input-phone-1"]`; Tab
2. Assert `aria-invalid="true"` on Phone 1
3. Assert Save disabled
4. Cleanup: Restore original value
5. Expected: Empty Phone 1 triggers validation

### TC-LOS-BAS-016
1. Fill `[data-testid="local-office-settings-input-phone-1"]` with "not-a-phone"; Tab
2. Assert NO `aria-invalid` (no format validation, only required check)
3. Assert Save enabled
4. Cleanup: Restore original
5. Expected: Non-phone format accepted (no format validation)

### TC-LOS-BAS-017
1. Fill `[data-testid="local-office-settings-input-phone-1"]` with "555-123-4567"
2. Click Save; confirm; reload
3. Assert Phone 1 = "555-123-4567"
4. Cleanup: Restore original, save
5. Expected: Valid phone persists

### TC-LOS-BAS-018
1. Clear Phone 1; assert aria-invalid, Save disabled
2. Fill "555-000-1111"; assert aria-invalid removed, Save enabled
3. Expected: Error recovery works

### TC-LOS-BAS-019
1. Clear `[data-testid="local-office-settings-input-phone-2"]`; Tab
2. Assert NO `aria-invalid`
3. Assert Save enabled (if other changes) or remains clean
4. Expected: Phone 2 is optional

---

## Scenario Group 5: Misc Settings — Other Fields

### TC-LOS-BAS-020
1. Assert 3 sub-checkboxes under Default New Job to 1 Day: Event, Outside, Internal
2. Click Event `[data-testid="local-office-settings-checkbox-default-job-one-day-event"]`; assert checked
3. Click Outside; assert checked
4. Click Internal; assert checked
5. Assert Save enabled
6. Cleanup: Uncheck all
7. Expected: Each toggles independently

### TC-LOS-BAS-021
1. Assert `[data-testid="local-office-settings-select-default-order-type"]` value = "Event"
2. Click combobox; assert exactly 2 options: "Event", "Outside"
3. Select "Outside"; assert Save enabled
4. Cleanup: Select "Event"
5. Expected: 2 options (NOT 3); default = Event

### TC-LOS-BAS-022
1. Select "Outside" in Default Order Type
2. Click Save; confirm; reload
3. Assert Default Order Type = "Outside"
4. Cleanup: Restore "Event", save
5. Expected: Selection persists

### TC-LOS-BAS-023
1. Fill `[data-testid="local-office-settings-input-po-number"]` with "PO-TEST-123"
2. Click Save; confirm; reload
3. Assert PO Number = "PO-TEST-123"
4. Cleanup: Clear, save
5. Expected: PO Number persists

### TC-LOS-BAS-024
1. Fill `[data-testid="local-office-settings-input-po-number-label"]` with "Purchase Order #"
2. Click Save; confirm; reload
3. Assert PO Number Label = "Purchase Order #"
4. Cleanup: Clear, save
5. Expected: PO Number Label persists

---

## Scenario Group 6: Section Configuration

### TC-LOS-BAS-025
1. Assert `[data-testid="local-office-settings-table-sections"]` has 13 rows
2. Assert all rows have SVG checkmark (`lucide lucide-check text-primary`) in Use Section
3. Verify names: Audio Visual, Business Center, Decor, Electrical, Event Technology, Floral, Food & Beverage, Internet/Telecom, Lighting, Production & Staging, Rigging, Signage & Graphics, Specialty
4. Expected: 13 active sections

### TC-LOS-BAS-026
1. Click Use Section checkbox for first section
2. Assert checkmark disappears
3. Assert Save enabled
4. Cleanup: Click again to restore
5. Expected: Toggle active/inactive

### TC-LOS-BAS-027
1. Click section name "Audio Visual"; edit to "AV Services"
2. Assert Save enabled
3. Cleanup: Restore "Audio Visual"
4. Expected: Name edit enables Save

### TC-LOS-BAS-028
1. Click Add button below sections table
2. Assert new empty row added
3. Type "Test Section" in new row
4. Assert Save enabled
5. Cleanup: Reload without saving
6. Expected: Add creates new editable row

### TC-LOS-BAS-029
1. Toggle a section inactive + rename another
2. Click Default `[data-testid="local-office-settings-btn-default-section"]`
3. Assert sections reset to system defaults
4. Assert Save enabled
5. Cleanup: Reload without saving
6. Expected: Default resets to system defaults

---

## Scenario Group 7: Room Configuration

### TC-LOS-BAS-030
1. Assert `[data-testid="local-office-settings-table-room-config"]` shows "No results."
2. Assert Add button present
3. Assert Default button present
4. Expected: Empty table for 1604

### TC-LOS-BAS-031
1. Click Add button in Room Configuration
2. Assert new row with empty name, Use Room checkmark active
3. Type "Ballroom A"
4. Assert Save enabled
5. Cleanup: Reload without saving
6. Expected: Add creates room row

---

## Scenario Group 8: Default Logo

### TC-LOS-BAS-032
1. Assert `[data-testid="local-office-settings-checkbox-use-quote-logo"]` state (checked/unchecked)
2. Assert `[data-testid="local-office-settings-checkbox-use-rental-logo"]` state
3. Record defaults for 1604
4. Expected: Logo checkboxes at documented defaults

### TC-LOS-BAS-033
1. Click `[data-testid="local-office-settings-select-company-logo"]` to open
2. Count options -> 12
3. Verify includes PSAV, Encore, and venue-specific logos
4. Close without changing
5. Expected: 12 logo options

### TC-LOS-BAS-034
1. Note current Company Logo selection + preview `[data-testid="local-office-settings-logo-preview"]` `src`
2. Change Company Logo to different option
3. Assert preview image `src` changed
4. Cleanup: Restore original
5. Expected: Preview updates on selection

---

## Scenario Group 9: Discount Exemptions

### TC-LOS-BAS-035
1. Assert `[data-testid="local-office-settings-table-discount-exemptions"]` visible
2. Assert columns: Service Type, Exempt (checkbox)
3. Count exempt services
4. Toggle one unchecked to checked; assert Save enabled
5. Cleanup: Toggle back
6. Expected: Exempt toggles independently

---

## Scenario Group 10: Save & Unsaved Changes Dialogs

### TC-LOS-BAS-036
1. Make any edit; click Save
2. Assert shared "Save Changes" dialog appears
3. Assert dialog body "Are you sure you want to save the changes?"
4. Assert Cancel + Save buttons present
5. Click Cancel; assert dialog closes, changes NOT saved, Save still enabled
6. Cleanup: Reload
7. Expected: Shared Save Changes dialog; Cancel dismisses

### TC-LOS-BAS-037
1. Make any edit; click History tab
2. Assert dialog text "Are you sure you want to leave this view? Any unsaved changes will be lost."
3. Click Stay; assert remain on Basic Information tab
4. Assert edit still present
5. Cleanup: Reload
6. Expected: Stay preserves changes

### TC-LOS-BAS-038
1. Make any edit; click History tab
2. Click Discard in unsaved changes dialog
3. Assert navigated to History tab
4. Click Basic Information tab; assert edit discarded
5. Expected: Discard navigates away, loses changes

---

## Scenario Group 11: Boundary

### TC-LOS-BAS-039
1. Fill `[data-testid="local-office-settings-input-po-number"]` with "<script>alert(1)</script>"
2. Assert no script execution
3. If Save enabled: save + reload; assert stored as plain text
4. Cleanup: Clear, save
5. Expected: XSS payload never executed

---

## Scenario Group 12: History Tab — Navigation & Structure

### TC-LOS-HIS-001
1. Click `[data-testid="local-office-settings-tab-location-settings-history"]`
2. Assert tab `aria-selected="true"`
3. Assert `[data-testid="local-office-settings-history-select-type"]` visible with text "Location Management History"
4. Assert `[data-testid="local-office-settings-history-table"]` visible
5. Expected: History tab shows type selector and data table

### TC-LOS-HIS-002
1. On History tab, assert `[data-testid="local-office-settings-history-table"]` has 42 `th` elements
2. Assert first 5 headers: Local Office, Prep Date Offset, Return Date Offset, Set Date Offset, Strike Date Offset
3. Assert last 4 headers: Holiday Multiplier, Recalc Labor Hours, Modified By, Modified On
4. Expected: 42 column headers present in correct order

### TC-LOS-HIS-003
1. On History tab, assert table body contains "No results." text
2. Assert pagination "1 / 1"
3. Assert all 4 nav buttons disabled (first, prev, next, last)
4. Expected: Empty state for location 1604

### TC-LOS-HIS-004
1. Click `[data-testid="local-office-settings-history-select-type"]` to open dropdown
2. Assert 2 options: "Location Management History" (selected), "Location Management Legacy History"
3. Close dropdown; assert original selection maintained
4. Expected: 2 history type options

### TC-LOS-HIS-005
1. On History tab, assert rows-per-page combobox value = "20"
2. Assert page indicator "1 / 1"
3. Assert 4 nav buttons present (first, prev, next, last)
4. Expected: Pagination controls present; default 20 rows/page

### TC-LOS-HIS-006
1. On History tab, assert no `button[type="submit"]` or Save button within tabpanel
2. Assert no `input`, `textarea`, or editable fields within tabpanel (except pagination)
3. Expected: History tab is read-only

### TC-LOS-HIS-007
1. On History tab, count `th button` elements inside `[data-testid="local-office-settings-history-table"]`
2. Assert 38 sort buttons (42 columns - 4 non-sortable: Local Office, Section Name, Service Type - Exempt, Notes)
3. Assert non-sortable columns contain only text, no button child
4. Expected: 38 sortable + 4 non-sortable columns

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
