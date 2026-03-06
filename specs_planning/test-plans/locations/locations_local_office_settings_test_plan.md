# Local Office Settings Test Plan

**Module**: locations | **Test Cases**: [test-cases/locations/locations_local_office_settings_test_cases.md](../test-cases/locations/locations_local_office_settings_test_cases.md)
**URL**: `/navigator/locations/{officeId}/settings/local-office`
**Updated**: 2026-03-02 | **Status**: Manual | **Total TCs**: 56

---

## Coverage Summary

| Sub-Module | TC ID Range | Count | Key Risks |
|---|---|---|---|
| Basic Information — Date Offsets | TC-LOS-BAS-001 to 006 | 6 | NM-1264 cross-field validation, save toggling |
| Basic Information — Misc Settings | TC-LOS-BAS-007 to 014 | 8 | Phone 1 required, always-disabled QC, default order type |
| Basic Information — Section Config | TC-LOS-BAS-015 to 020 | 6 | NM-1223 duplicate name, Default reset |
| Basic Information — Room Config | TC-LOS-BAS-021 to 023 | 3 | NM-1223 duplicate room, empty table |
| Basic Information — Default Logo | TC-LOS-BAS-024 to 026 | 3 | Preview update, 12 options |
| Basic Information — Discount Exemptions | TC-LOS-BAS-027 to 028 | 2 | Toggle exempt, verify defaults |
| Basic Information — Navigation | TC-LOS-BAS-029 to 031 | 3 | Unsaved changes dialog |
| Basic Information — Multi-Field / Boundary | TC-LOS-BAS-032 to 035 | 4 | Compound changes, negative/-zero values |
| Location Settings History | TC-LOS-HST-001 to 006 | 6 | Read-only, 42 columns, filter, pagination |
| ECT Settings | TC-LOS-ECT-001 to 015 | 15 | Dual save buttons, role-gated field, read-only tables |

---

## Preconditions (All Scenarios)

- User is authenticated with at minimum Read+Write on location 1604
- Browser navigated to `/navigator/locations/1604/settings/local-office`
- No unsaved changes on page load
- For ECT Settings role tests: user must have Production & Sales role (NM-1260)

---

## Scenario Group 1: Page Load & Tab Navigation

### TC-LOS-BAS-001
1. Navigate to `[BASE_URL]/navigator/locations/1604/settings/local-office`
2. Assert `document.title` = "Local Office Settings | Navigator"
3. Assert `h1` visible with text "Local Office Settings"
4. Assert `[data-testid="local-office-settings-tab-basic-information"]` has `aria-selected="true"`
5. Assert `[data-testid="local-office-settings-tab-location-settings-history"]` visible
6. Assert `[data-testid="local-office-settings-tab-ect-settings"]` visible
7. Assert Save button `[data-testid="local-office-settings-btn-save"]` is disabled
8. Expected: Page rendered with correct title; Basic Information active; Save disabled

---

## Scenario Group 2: Default Date Offsets

### TC-LOS-BAS-002
1. Assert `[data-testid="local-office-settings-input-prep-date-offset"]` value = "-1"
2. Assert `[data-testid="local-office-settings-input-return-date-offset"]` value = "1"
3. Assert `[data-testid="local-office-settings-input-set-date-offset"]` value = "-1"
4. Assert `[data-testid="local-office-settings-input-strike-date-offset"]` value = "1"
5. Assert `[data-testid="local-office-settings-input-delivery-date-offset"]` value = "0"
6. Assert `[data-testid="local-office-settings-input-pickup-date-offset"]` value = "0"
7. Expected: All 6 offset defaults verified

### TC-LOS-BAS-003
1. Assert Save button disabled on load
2. `fill([data-testid="local-office-settings-input-prep-date-offset"], "-2")` + press Tab
3. Assert Save button enabled
4. `fill([data-testid="local-office-settings-input-prep-date-offset"], "-1")` + press Tab
5. Assert Save button disabled; Expected: Dirty state toggling works

### TC-LOS-BAS-005 — NM-1264 Cross-Field Validation
1. Assert Save disabled (clean state)
2. `fill([data-testid="local-office-settings-input-delivery-date-offset"], "-5")` + press Tab
3. Assert Save button disabled (Delivery -5 < Prep -1 = invalid)
4. Assert no visible error paragraph in DOM
5. Expected: Delivery < Prep silently disables Save | **Data**: delivery=-5, prep=-1

### TC-LOS-BAS-006
1. (State: delivery=-5, Save disabled) `fill([data-testid="local-office-settings-input-delivery-date-offset"], "0")` + press Tab
2. Assert Save enables (Delivery 0 >= Prep -1 = valid)
3. `fill([data-testid="local-office-settings-input-delivery-date-offset"], "-1")` + press Tab
4. Assert Save disables (reverted to original "0"? — revert delivery to "0")
5. Expected: Constraint fix re-enables Save

### TC-LOS-BAS-034 — Boundary: Negative Values
1. `fill([data-testid="local-office-settings-input-pickup-date-offset"], "-3")` + press Tab
2. Assert `[data-testid="local-office-settings-input-pickup-date-offset"]` has no error state
3. Assert Save button enabled
4. Revert pickup to "0" + press Tab; assert Save disabled
5. Expected: Negative integer accepted without error

### TC-LOS-BAS-035 — Boundary: Zero Value
1. `fill([data-testid="local-office-settings-input-prep-date-offset"], "0")` + press Tab
2. Assert delivery (value "0") >= prep (value "0") — valid; Save enables
3. Revert prep to "-1"; assert Save disables
4. Expected: Zero is a valid offset value; delivery==prep is valid (not a conflict)

---

## Scenario Group 3: Misc Settings

### TC-LOS-BAS-007 — Default Checkbox States
1. Assert `[data-testid="local-office-settings-checkbox-use-fulfillment"]` unchecked, enabled
2. Assert `[data-testid="local-office-settings-checkbox-use-availability"]` checked, enabled
3. Assert `[data-testid="local-office-settings-checkbox-use-equipments-qc"]` unchecked, **disabled**
4. Assert `[data-testid="local-office-settings-checkbox-request-items-return"]` unchecked, enabled
5. Assert `[data-testid="local-office-settings-checkbox-same-priority"]` unchecked, enabled
6. Assert `[data-testid="local-office-settings-checkbox-print-description"]` checked, enabled
7. Assert `[data-testid="local-office-settings-checkbox-use-subrent-service-type"]` checked, enabled
8. Expected: 7 checkboxes; Use Equipments QC is disabled

### TC-LOS-BAS-008 — QC Always Disabled
1. Assert `[data-testid="local-office-settings-checkbox-use-equipments-qc"]` has `disabled` attribute
2. `click([data-testid="local-office-settings-checkbox-use-equipments-qc"])` — assert no state change
3. Assert Save button remains disabled
4. Expected: Use Equipments QC cannot be interacted with

### TC-LOS-BAS-009 — Phone 1 Required: Empty → aria-invalid
1. `fill([data-testid="local-office-settings-input-phone-1"], "")` + press Tab
2. Assert `[data-testid="local-office-settings-input-phone-1"]` has `aria-invalid="true"`
3. Assert Save button disabled
4. Expected: Phone 1 empty triggers aria-invalid; Save blocked

### TC-LOS-BAS-010 — Phone 1 Error Recovery
1. (State: Phone 1 empty, Save disabled) `fill([data-testid="local-office-settings-input-phone-1"], "760-883-1957")` + press Tab
2. Assert `aria-invalid` not "true" on Phone 1
3. Assert Save button enables then disables (reverted to original = no net change)
4. Expected: Restoring Phone 1 clears error and returns to clean state

### TC-LOS-BAS-011 — Phone 2 Optional
1. (`[data-testid="local-office-settings-input-phone-2"]` is empty — default)
2. Confirm Save disabled (clean state)
3. `fill([data-testid="local-office-settings-input-phone-2"], "555-0100")` + press Tab; assert Save enables
4. Clear Phone 2; assert no `aria-invalid`; assert Save disables
5. Expected: Phone 2 optional; empty never invalid

### TC-LOS-BAS-012 — Default Job 1 Day (3 Checkboxes)
1. Assert all 3 default-job checkboxes unchecked
2. Click `[data-testid="local-office-settings-checkbox-default-job-one-day-event"]`; assert Save enables
3. Revert all; assert Save disables
4. Expected: All 3 unchecked by default; each independently enables Save

### TC-LOS-BAS-013 — Default Order Type: 3 Options
1. Assert `[data-testid="local-office-settings-select-default-order-type"]` value = "Event"
2. Click combobox; assert options: "Event", "Outside", "Internal"
3. Select "Outside"; assert Save enables
4. Select "Event" again; assert Save disables
5. Expected: 3 options; default = Event

### TC-LOS-BAS-014 — PO Number and Label (Optional Text)
1. Assert `[data-testid="local-office-settings-input-po-number"]` empty; `[data-testid="local-office-settings-input-po-number-label"]` empty
2. Fill PO Number "PO-TEST"; assert Save enables
3. Clear PO Number; assert Save disables
4. Fill PO Number Label "Purchase Order"; assert Save enables
5. Clear PO Number Label; assert Save disables
6. Expected: Both PO fields are empty by default and optional

---

## Scenario Group 4: Section Configuration

### TC-LOS-BAS-015 — 13 Active Sections Default
1. Assert `[data-testid="local-office-settings-checkbox-use-section"]` checked
2. Assert `[data-testid="local-office-settings-table-sections"]` has 13 data rows
3. Assert row names: Audio, Flipcharts, Hybrid Meeting, Labor, Lighting, Power, Presenter Support, Projection, Rigging, Scenic, Staging, Video, Whiteboard
4. Assert "Add new..." placeholder input visible
5. Expected: 13 active sections in documented order

### TC-LOS-BAS-016 — Use Section Toggle
1. Click `[data-testid="local-office-settings-checkbox-use-section"]`; assert Save enables
2. Revert; assert Save disables
3. Expected: Use Section checkbox is editable

### TC-LOS-BAS-017 — Edit Section Name
1. Click "Flipcharts" row textbox; change to "Flipcharts Updated" + Tab; assert Save enables
2. Revert to "Flipcharts" + Tab; assert Save disables
3. Expected: Name edit enables Save; revert disables it

### TC-LOS-BAS-018 — Add New Section
1. Fill "Add new..." input in sections table with "TestSection" + press Enter
2. Assert new row "TestSection" appears; assert Save enables
3. Expected: New section row created on confirm

### TC-LOS-BAS-019 — NM-1223: Duplicate Active Section Name
1. Edit "Flipcharts" name to "Audio" + Tab (duplicate of existing active "Audio")
2. Assert Save disabled
3. Expected: Duplicate active name prevents save per NM-1223

### TC-LOS-BAS-020 — Default Button Resets Sections
1. Click `[data-testid="local-office-settings-btn-default-section"]`
2. Observe result (dialog or immediate reset); assert Save enables
3. Expected: Default button triggers a reset action

### TC-LOS-BAS-033 — Active Toggle per Row
1. Identify "Video" row active toggle; click toggle; assert Save enables; assert inactive state
2. Click toggle again; assert active state; assert Save disables
3. Expected: Each row toggle independently toggleable

---

## Scenario Group 5: Room Configuration

### TC-LOS-BAS-021 — Empty Table Default
1. Assert `[data-testid="local-office-settings-table-room-config"]` has 0 data rows
2. Assert "Add new..." placeholder input visible in table
3. Expected: Room Configuration is empty for location 1604

### TC-LOS-BAS-022 — Add New Room
1. Fill "Add new..." in room config with "Ballroom A" + Enter
2. Assert new row "Ballroom A" appears; assert Save enables
3. Expected: Room can be added via Add new

### TC-LOS-BAS-023 — NM-1223: Duplicate Active Room Name
1. Add room "Conf A"; then add another "Conf A"; assert both active
2. Assert Save disabled
3. Expected: Duplicate active room name blocks save per NM-1223

---

## Scenario Group 6: Default Logo

### TC-LOS-BAS-024 — Logo Checkboxes Default
1. Assert `[data-testid="local-office-settings-checkbox-use-quote-logo"]` checked
2. Assert `[data-testid="local-office-settings-checkbox-use-rental-logo"]` checked
3. Uncheck Quotes; assert Save enables; revert; assert Save disables
4. Expected: Both logo checkboxes checked by default; each independently toggleable

### TC-LOS-BAS-025 — Company Logo Combobox (12 Options)
1. Assert `[data-testid="local-office-settings-select-company-logo"]` value = "Encore New Logo"
2. Click combobox; assert listbox has exactly 12 options (see FIELD INVENTORY)
3. Select "Encore Blue Logo"; assert Save enables
4. Revert to "Encore New Logo"; assert Save disables
5. Expected: 12 logo options; default = Encore New Logo

### TC-LOS-BAS-026 — Logo Preview Updates
1. Assert `[data-testid="local-office-settings-logo-preview"]` `src` attribute reflects Encore New Logo
2. Select "Encore Blue Logo" from Company Logo combobox
3. Assert logo preview `src` attribute changes
4. Expected: Preview is responsive to selection changes

---

## Scenario Group 7: Discount Exemptions

### TC-LOS-BAS-027 — Service Type Exempt Toggle
1. Locate `[data-testid="local-office-settings-table-discount-exemptions"]`; find "APP Downloaded" row (non-exempt)
2. Click "APP Downloaded" Exempt toggle; assert Save enables
3. Revert; assert Save disables
4. Expected: Discount exemption toggles are interactive per service type row

### TC-LOS-BAS-028 — Pre-Exempt Services Confirmed
1. Verify "HSIA - Labor" toggle img active (exempt state)
2. Verify "Loss Damage Waiver" toggle img active (exempt state)
3. Verify "Operator Labor" toggle img active (exempt state)
4. Expected: Known-exempt services confirmed in initial state

---

## Scenario Group 8: Unsaved Changes Dialog

### TC-LOS-BAS-029 — Stay (Basic Info)
1. Click Use Fulfillment; assert Save enabled (dirty)
2. Click ECT Settings tab; assert `[role="alertdialog"]` with heading "Unsaved changes" appears
3. Assert body text "You have unsaved changes. Do you want to discard them?"
4. Assert "Stay" button and "Discard" button present
5. Click "Stay"; assert dialog closes; still on Basic Information; Save still enabled
6. Revert Use Fulfillment; assert Save disables

### TC-LOS-BAS-030 — Discard (Basic Info to History)
1. Click Use Fulfillment; assert Save enabled
2. Click Location Settings History tab; assert dialog appears
3. Click "Discard"; assert Location Settings History tab activates; changes lost

### TC-LOS-BAS-031 — ECT Tab → Basic Info (Same Dialog)
1. Navigate to ECT Settings tab; edit Benefits Multiplier to "21.0%" + Tab; assert Fixed Costs Save enabled
2. Click Basic Information tab; assert "Unsaved changes" dialog appears
3. Click "Discard"; assert Basic Information tab activates; ECT Benefits Multiplier reverted to "20.0%"

### TC-LOS-BAS-032 — Multi-Field Compound Changes
1. Check Use Fulfillment, fill Phone 2 "555-0100", fill PO Number "PO-001"
2. Assert Save enabled throughout
3. Revert all 3 fields to original values
4. Assert Save disables
5. Expected: All changes must be reverted to return to clean state

---

## Scenario Group 9: Location Settings History Tab

### TC-LOS-HST-001 — Empty State for Location 1604
1. Click `[data-testid="local-office-settings-tab-location-settings-history"]`
2. Assert `[data-testid="local-office-settings-history-select-type"]` shows "Location Settings History"
3. Assert `p:has-text("No results.")` visible inside history table container
4. Assert pagination buttons all disabled

### TC-LOS-HST-002 — Filter Dropdown 2 Options
1. Click `[data-testid="local-office-settings-history-select-type"]`
2. Assert exactly 2 options: "Location Settings History" and "Location Settings Legacy History"
3. Select "Location Settings Legacy History"; assert table reloads

### TC-LOS-HST-003 — 42 Columns; Local Office No Sort Button
1. Assert `[data-testid="local-office-settings-history-table"]` visible
2. Assert "Local Office" columnheader has no `<button>` child
3. Assert all other 41 columnheaders each contain a sort `<button>`
4. Expected: 41 sortable + 1 non-sortable = 42 total columns

### TC-LOS-HST-004 — Rows Per Page Dropdown
1. Assert default rows-per-page combobox value = "20"
2. Click combobox; assert options: 10, 20, 30, 40, 50
3. Select "10"; assert combobox value updates
4. Expected: 5 page-size options; default 20

### TC-LOS-HST-005 — Read-Only Table
1. Assert no Add, Edit, or Delete buttons in history tab panel
2. Attempt click on any table cell; assert no input appears
3. Expected: No modification capability on history table

### TC-LOS-HST-006 — Filter Change Triggers Reload
1. Switch filter to "Location Settings Legacy History"; assert table update response
2. Switch back to "Location Settings History"; assert table resets
3. Expected: Both filter options trigger data reload

---

## Scenario Group 10: ECT Settings Tab

### TC-LOS-ECT-001 — Header and Location Info
1. Click `[data-testid="local-office-settings-tab-ect-settings"]`
2. Assert `[data-testid="ect-settings-label-location-name"]` has text "1604 - Parker Palm Springs"
3. Assert `[data-testid="ect-settings-link-commission-structure"]` visible
4. Assert `[data-testid="ect-settings-select-currency"]` value = "USD"
5. Expected: ECT header correct for location 1604

### TC-LOS-ECT-002 — Currency Selector (USD only)
1. Click `[data-testid="ect-settings-select-currency"]`; assert only "USD" option
2. Close dropdown; assert value "USD" unchanged
3. Expected: Only USD available for 1604

### TC-LOS-ECT-003 — Commission Structure Link
1. Assert `[data-testid="ect-settings-link-commission-structure"]` has `href` containing "1604"
2. Expected: Link references the correct office ID | **Status**: Blocked (Cat-A: external legacy URL)

### TC-LOS-ECT-004 — Event Profit Target Read-Only
1. Assert `[data-testid="ect-settings-table-event-profit-target"]` has 9 rows
2. Click any cell; assert no input appears
3. Expected: Event Profit Target is read-only

### TC-LOS-ECT-005 — Fixed Costs Display Fields
1. Assert Venue Fixed Costs display = "13.9%"
2. Assert SG&A = "8.0%"
3. Assert Other Rate = "0.0%"
4. Assert No Labor = "0.0%"
5. Assert Approval Threshold = "$0.00"
6. Assert Peak Labor = "5.0%"
7. Assert Non-Peak = "0.0%"
8. Attempt to click each → no input; Expected: 7 display-only fields

### TC-LOS-ECT-006 — Benefits Multiplier: Editable; Fixed Costs Save Independent
1. Assert `[data-testid="ect-settings-btn-save-fixed-costs-btn"]` disabled; `[data-testid="ect-settings-btn-save-labor-costs-btn"]` disabled
2. `fill([data-testid="ect-settings-input-benefits-multiplier"], "21.0%")` + Tab
3. Assert Fixed Costs Save enabled; Labor Costs Save still disabled
4. Revert Benefits Multiplier to "20.0%" + Tab; assert Fixed Costs Save disabled
5. Expected: Benefits Multiplier enables ONLY Fixed Costs Save

### TC-LOS-ECT-007 — Historical Subrental (NM-1260)
1. Assert `[data-testid="ect-settings-input-historical-subrental"]` not disabled (for Production & Sales user)
2. Fill "1.0%" + Tab; assert Fixed Costs Save enables; Labor Costs Save unaffected
3. Revert to "0.0%"; assert Fixed Costs Save disables
4. Expected: Historical Subrental editable for role; role-gating tested in separate manual step

### TC-LOS-ECT-008 — Labor Costs Save Independent of Fixed Costs
1. `fill([data-testid="ect-settings-input-labor-cost-0"], "40.00")` + Tab
2. Assert Labor Costs Save enabled; Fixed Costs Save still disabled
3. Revert to "35.00" + Tab; assert Labor Costs Save disables
4. Expected: Labor Cost edit enables ONLY Labor Costs Save

### TC-LOS-ECT-009 — Two Saves Fully Independent
1. Edit Benefits Multiplier → Fixed Costs Save enabled, Labor Costs Save disabled
2. Revert Benefits Multiplier → both disabled
3. Edit labor cost row 0 → Labor Costs Save enabled, Fixed Costs Save disabled
4. Revert → both disabled; Expected: Zero cross-activation between save buttons

### TC-LOS-ECT-010 — Labor Cost Assumptions 66 Rows
1. Assert `[data-testid="ect-settings-table-labor-cost-assumptions"]` row count = 66
2. Assert `[data-testid="ect-settings-input-labor-cost-0"]` (Administrative Fee) value = "35.00"
3. Assert `[data-testid="ect-settings-input-labor-cost-65"]` (zzzFinishing Service) value = "37.10"
4. Expected: 66 editable rows; spot-check first/last

### TC-LOS-ECT-011 — SubRental Matrix Read-Only
1. Assert `[data-testid="ect-settings-table-sub-rental-matrix"]` has 9 rows
2. Click any cell; assert no input appears
3. Expected: SubRental Matrix is read-only

### TC-LOS-ECT-012 — Unsaved Changes Dialog: ECT → History (Stay)
1. (ECT dirty: edit Benefits Multiplier) Click Location Settings History tab
2. Assert "Unsaved changes" alertdialog appears
3. Click "Stay"; assert remain on ECT Settings; change preserved
4. Revert Benefits Multiplier to "20.0%"

### TC-LOS-ECT-013 — Unsaved Changes Dialog: ECT → Basic Info (Discard)
1. (ECT dirty: edit Benefits Multiplier to "21.0%") Click Basic Information tab
2. Assert dialog appears; click "Discard"
3. Assert Basic Information tab active; return to ECT → assert Benefits = "20.0%"

### TC-LOS-ECT-014 — Fixed Costs Explanatory Text Present
1. Assert 3 explanatory paragraph elements visible under Fixed Costs
2. Assert text includes "Fixed costs include salaried labor", "actual percentage", "SG&A (Selling, General, and Administrative)"
3. Expected: Informational text renders correctly

### TC-LOS-ECT-015 — Historical Subrental Enabled for Current Test User
1. Assert `[data-testid="ect-settings-input-historical-subrental"]` is NOT disabled
2. Click and confirm it accepts input
3. Expected: Rutvik test account (Production & Sales role) can edit the field

---

## Execution Order

1. Basic Info page load + tab checks (TC-LOS-BAS-001, 002, 003)
2. Date Offset defaults + save toggle (TC-LOS-BAS-002–006, 034, 035)
3. Misc Settings defaults (TC-LOS-BAS-007–015)
4. Section Config (TC-LOS-BAS-015–020, 033)
5. Room Config (TC-LOS-BAS-021–023)
6. Default Logo (TC-LOS-BAS-024–026)
7. Discount Exemptions (TC-LOS-BAS-027–028)
8. Unsaved Changes dialog (TC-LOS-BAS-029–031)
9. Multi-field compound (TC-LOS-BAS-032)
10. History tab (TC-LOS-HST-001–006)
11. ECT Settings (TC-LOS-ECT-001–015)

---

## Known Issues

| Bug | TC(s) | Description |
|---|---|---|
| NM-1264 | TC-LOS-BAS-005/006 | Delivery < Prep silently disables Save; no inline error |
| NM-1223 | TC-LOS-BAS-019/023 | Duplicate active name silently disables Save |
| NM-1260 | TC-LOS-ECT-007/015 | Historical Subrental gated by Production & Sales role |
