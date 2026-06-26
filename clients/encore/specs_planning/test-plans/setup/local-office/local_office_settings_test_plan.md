# Local Office Settings — Basic Information Test Plan

**Module**: local-office | **Test Cases**: [../../../test-cases/setup/local-office/local_office_settings_test_cases.md](../../../test-cases/setup/local-office/local_office_settings_test_cases.md)
**Spec**: `tests/local-office/local-office-settings.spec.ts`
**URL**: `/navigator/locations/{officeId}/settings/local-office` (Basic Information tab)
**Updated**: 2026-04-13 | **Status**: Manual | **Total TCs**: 60 (TC-LOS-BAS-*)
**Sibling test plans**: [HIS](local_office_history_test_plan.md) · [ECT](local_office_ect_test_plan.md)

**Split note**: This file was split from the combined `local_office_settings_test_plan.md` on 2026-05-05 to match the 1:1 spec→md convention used by the locations module (the underlying spec breakdown landed in commit f721e15, 2026-03-26). Sibling test plans: [HIS](local_office_history_test_plan.md), [ECT](local_office_ect_test_plan.md).

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

(Additional TC-LOS-BAS-* entries 040-068 are gap-fill / round-trip / boundary scenarios — see test cases file. Numbering has documented gaps: 042/043/046/052/057/058/059/060 — dispositions recorded in the test-cases file table.)

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

## Coverage Index (regenerated 2026-06-11 from the test-cases file)

Authoritative current case list (60 cases). Scenario prose above may lag; this index is mechanically regenerated.

- TC-LOS-BAS-001 — Page Load — Title, URL, Tab Structure
- TC-LOS-BAS-002 — Default Date Offsets — Default Values (Fresh Load)
- TC-LOS-BAS-003 — Save Button — Disabled by Default
- TC-LOS-BAS-004 — Save Button — Enables on Date Offset Edit
- TC-LOS-BAS-005 — Date Offset — Edit, Save, Persist
- TC-LOS-BAS-006 — Date Offset — Non-Numeric Input Rejected
- TC-LOS-BAS-007 — Date Offset — Delivery Must Be Greater Than Or Equal To Prep
- TC-LOS-BAS-008 — Date Offset — Error Recovery
- TC-LOS-BAS-009 — Date Offset — Negative Value Accepted (Relative to Start)
- TC-LOS-BAS-068 — Date Offset — Return Rejects Negative Values (Relative to End)
- TC-LOS-BAS-010 — Date Offset — Zero Value Accepted
- TC-LOS-BAS-011 — Misc Settings — Checkbox Default States
- TC-LOS-BAS-012 — Misc Settings — Use Fulfillment Toggle + Cascade to Use Equipments QC
- TC-LOS-BAS-013 — Misc Settings — Use Fulfillment Save and Persist
- TC-LOS-BAS-014 — Misc Settings — Default Labor to Hourly Toggle, Save, Persist
- TC-LOS-BAS-015 — Misc Settings — Phone 1 Required: Empty Triggers Validation
- TC-LOS-BAS-016 — Misc Settings — Phone 1 Validates Phone Format
- TC-LOS-BAS-017 — Misc Settings — Phone 1 Edit, Save, Persist
- TC-LOS-BAS-018 — Misc Settings — Phone 1 Error Recovery
- TC-LOS-BAS-019 — Misc Settings — Phone 2 Optional (Empty Valid)
- TC-LOS-BAS-020 — Misc Settings — Default New Job to 1 Day Sub-Checkboxes
- TC-LOS-BAS-021 — Misc Settings — Default Order Type Dropdown (2 Options)
- TC-LOS-BAS-022 — Misc Settings — Default Order Type Save and Persist
- TC-LOS-BAS-023 — Misc Settings — PO Number Field Edit, Save, Persist
- TC-LOS-BAS-024 — Misc Settings — PO Number Label Field Edit, Save, Persist
- TC-LOS-BAS-025 — Section Configuration — Default Active Sections Structure
- TC-LOS-BAS-026 — Section Configuration — Toggle Section Active/Inactive
- TC-LOS-BAS-027 — Section Configuration — Edit Section Name
- TC-LOS-BAS-028 — Section Configuration — Add New Section
- TC-LOS-BAS-029 — Section Configuration — Default Button Resets
- TC-LOS-BAS-030 — Room Configuration — Empty Table by Default
- TC-LOS-BAS-031 — Room Configuration — Add New Room
- TC-LOS-BAS-032 — Default Logo — Checkbox Default States
- TC-LOS-BAS-033 — Default Logo — Company Logo Combobox Options
- TC-LOS-BAS-034 — Default Logo — Preview Image Updates on Selection
- TC-LOS-BAS-035 — Discount Exemptions — Service Type Toggles
- TC-LOS-BAS-036 — Save Dialog — Exact Content and Buttons
- TC-LOS-BAS-037 — Unsaved Changes Dialog — Stay Keeps Changes
- TC-LOS-BAS-038 — Unsaved Changes Dialog — Discard Leaves
- TC-LOS-BAS-039 — Boundary — XSS Input in Text Fields
- TC-LOS-BAS-040 — Empty Section Name — Reverts to Previous Value on Blur
- TC-LOS-BAS-041 — Whitespace-Only Section Name — Accepted as New Content
- TC-LOS-BAS-044 — Add New Section with Empty Name — Rejected
- TC-LOS-BAS-045 — Add New Section with Duplicate Name — Silently Rejected
- TC-LOS-BAS-047 — Section Edit — Escape Does NOT Revert
- TC-LOS-BAS-048 — Verify a room Inactive toggle persists after save and reload
- TC-LOS-BAS-049 — Verify a room name change persists after save and reload
- TC-LOS-BAS-050 — Empty Room Name — Revert Behavior
- TC-LOS-BAS-051 — Duplicate Room Name via Add New — Silently Rejected
- TC-LOS-BAS-053 — Verify a positive value in Relative to Start fields is rejected
- TC-LOS-BAS-054 — Verify a negative value in Relative to End fields is rejected
- TC-LOS-BAS-055 — Verify non-numeric input in the Return field is rejected
- TC-LOS-BAS-056 — Verify non-numeric input in the Delivery field is rejected
- TC-LOS-BAS-061 — MaxLen Boundary — 3-Char Field Rejects 4+ Chars
- TC-LOS-BAS-062 — MaxLen Boundary — 4-Char Field Accepts Value at Limit
- TC-LOS-BAS-063 — Multi-Field Error Recovery — Cross-Validation Clears After Correction
- TC-LOS-BAS-064 — Clear Prep Offset — Save, Reload, Verify Empty
- TC-LOS-BAS-065 — Clear Return Offset — Save, Reload, Verify Empty
- TC-LOS-BAS-066 — Clear Prep But Keep Delivery — No Cross-Validation Error
- TC-LOS-BAS-067 — Clear All 6 Offsets — Save, Reload, All Empty
