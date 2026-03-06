# Local Office Settings Test Cases — **Module**: locations | **Total**: 56 | **Status**: Manual

**URL**: `/navigator/locations/{officeId}/settings/local-office`
**Location tested**: 1604 (Parker Palm Springs, USA)
**Updated**: 2026-03-02
**Tabs**: Basic Information | Location Settings History | ECT Settings

---

## FIELD INVENTORY — Basic Information Tab

| Field | Type | Default (1604) | State |
|---|---|---|---|
| Save | button | — | disabled (enables on any change) |
| Prep Date Offset (Relative to Start) | textbox | -1 | enabled |
| Return Date Offset (Relative to End) | textbox | 1 | enabled |
| Set Date Offset (Relative to Start) | textbox | -1 | enabled |
| Strike Date Offset (Relative to End) | textbox | 1 | enabled |
| Delivery Date Offset (Relative to Start) | textbox | 0 | enabled |
| Pickup Date Offset (Relative to End) | textbox | 0 | enabled |
| Use Fulfillment | checkbox | unchecked | enabled |
| Use Availability | checkbox | checked | enabled |
| Use Equipments QC | checkbox | unchecked | **disabled** (always) |
| Items Filled from Requests Return to Availability | checkbox | unchecked | enabled |
| Allow tentative and confirmed Status to have the same priority | checkbox | unchecked | enabled |
| Print Description (Default) | checkbox | checked | enabled |
| Use ServiceType for Subrental Inventory Sources | checkbox | checked | enabled |
| Phone 1 | textbox | 760-883-1957 | enabled; **required** |
| Phone 2 | textbox | (empty) | enabled; optional |
| Default new job to 1 day — Event | checkbox | unchecked | enabled |
| Default new job to 1 day — Outside | checkbox | unchecked | enabled |
| Default new job to 1 day — Internal | checkbox | unchecked | enabled |
| Default Order Type | combobox | Event | enabled; options: Event / Outside / Internal |
| PO Number | textbox | (empty) | enabled |
| PO Number Label | textbox | (empty) | enabled |
| Use Section | checkbox | checked | enabled |
| Default (sections) | button | — | enabled |
| Section Name (table — each row) | textbox | see 13 sections | enabled |
| Active (section — each row) | toggle | 9 active / 4 inactive (Power, Rigging, Staging, Whiteboard = inactive) | enabled |
| Add new section | textbox | (placeholder: Add new...) | enabled |
| Room Configuration Name (table) | textbox | (no rows) | enabled |
| Active (room — each row) | toggle | — | enabled |
| Add new room | textbox | (placeholder: Add new...) | enabled |
| Quotes (logo) | checkbox | checked | enabled |
| Rental Orders/DROs (logo) | checkbox | checked | enabled |
| Company Logo | combobox | Encore New Logo | enabled; 12 options |
| Logo preview | image | Encore New Logo artwork | display only |
| Discount Exemptions — each service type toggle | toggle | varies | enabled |

---

## FIELD INVENTORY — Location Settings History Tab

| Element | Type | Default | State |
|---|---|---|---|
| Filter | combobox | Location Settings History | enabled; 2 options |
| History table | table | "No results." (1604) | read-only |
| Rows per page | combobox | 20 | options: 10/20/30/40/50 |
| Pagination buttons | buttons | disabled (1604 empty) | — |
| 41 column sort buttons | button | — | enabled |
| Local Office column header | columnheader | — | no sort button |

---

## FIELD INVENTORY — ECT Settings Tab

| Field | Type | Default (1604/USD) | State |
|---|---|---|---|
| Location header | heading | "1604 - Parker Palm Springs" | display only |
| Edit/View Commission structure | link | — | enabled (external URL) |
| Currency | combobox | USD | enabled; USD-only for 1604 |
| Fixed Costs Save | button | — | disabled (enables on edit) |
| Event Profit Target | table | 9 rows | read-only |
| Venue Fixed Costs | display | 13.9% | read-only |
| SG&A % | display | 8.0% | read-only |
| Benefits Multiplier | textbox | 20.0% | **editable** |
| Other Rate | display | 0.0% | read-only |
| No Labor Rate | display | 0.0% | read-only |
| Approval Threshold | display | $0.00 | read-only |
| Historical Subrental % | textbox | 0.0% | editable (role-dependent: Production & Sales) |
| Peak Labor Adjustment % | display | 5.0% | read-only |
| Non-Peak Labor Adjustment % | display | 0.0% | read-only |
| Labor Costs Save | button | — | disabled (enables on edit); **separate from Fixed Costs** |
| Labor Cost Assumptions | table | 66 rows, all editable | enabled |
| SubRental Matrix | table | 9 rows | read-only |

---

## TC-LOS-BAS-001: Page Load — Title, URL, Tab Structure

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to `/navigator/locations/1604/settings/local-office` ✓ Page title = "Local Office Settings | Navigator"
2. Verify heading `<h1>` reads **Local Office Settings** ✓ Heading "Local Office Settings" visible
3. Verify 3 tabs present: **Basic Information** | **Location Settings History** | **ECT Settings** ✓ 3 tabs visible in tablist
4. Verify **Basic Information** tab is selected/active by default ✓ Tab has `aria-selected="true"`, content panel visible

**Expected**: Page loads on `/settings/local-office`, h1 = "Local Office Settings", 3 tabs, Basic Information active

**Automatable**: Yes


---

## TC-LOS-BAS-002: Default Date Offsets — Default Values

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings page, Basic Information tab active ✓ Tab panel visible
2. Verify 6 offset fields in **Default Date Offsets** section ✓ All 6 fields visible with "Hrs" suffix label
3. Verify **Prep Date Offset (Relative to Start)** = `-1` Hrs ✓ Input value = "-1"
4. Verify **Return Date Offset (Relative to End)** = `1` Hrs ✓ Input value = "1"
5. Verify **Set Date Offset (Relative to Start)** = `-1` Hrs ✓ Input value = "-1"
6. Verify **Strike Date Offset (Relative to End)** = `1` Hrs ✓ Input value = "1"
7. Verify **Delivery Date Offset (Relative to Start)** = `0` Hrs ✓ Input value = "0"
8. Verify **Pickup Date Offset (Relative to End)** = `0` Hrs ✓ Input value = "0"

**Expected**: All 6 offset inputs match documented defaults | **Data**: location=1604

**Automatable**: Yes


---

## TC-LOS-BAS-003: Save Button — Disabled by Default, Enables on Field Edit

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ **Save** button is `disabled`
2. Click **Use Fulfillment** checkbox ✓ checkbox state changes; **Save** button becomes enabled
3. Click **Use Fulfillment** checkbox again (revert to original state) ✓ **Save** button returns to `disabled`

**Expected**: Save is disabled on load, enables on any field change, disables again when all fields match original values

**Automatable**: Yes


---

## TC-LOS-BAS-004: Save Button — Enables on Date Offset Edit

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ **Save** disabled
2. Click on **Prep Date Offset (Relative to Start)** input, change value from `-1` to `-2`, press Tab ✓ **Save** enables
3. Revert value back to `-1`, press Tab ✓ **Save** disables again

**Expected**: Editing any date offset field enables Save; reverting disables again

**Automatable**: Yes


---

## TC-LOS-BAS-005: Default Date Offsets — Delivery < Prep Cross-Field Validation (NM-1264)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Validation | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ Prep = -1, Delivery = 0
2. Click **Delivery Date Offset (Relative to Start)**, change to `-5`, press Tab ✓ Delivery (-5) < Prep (-1) constraint violated
3. Verify **Save** button is `disabled` ✓ Save disabled even though field was edited
4. Verify no inline error message text appears in the DOM ✓ No visible error paragraph; constraint silent
5. Revert **Delivery Date Offset** back to `0`, press Tab ✓ Delivery (0) >= Prep (-1), constraint satisfied

**Expected**: Delivery < Prep disables Save silently (no inline error). Confirmed NM-1264. | **Data**: prep=-1, delivery=-5

**Automatable**: Yes


---

## TC-LOS-BAS-006: Default Date Offsets — Delivery Validation Error Recovery

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Validation | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ Prep = -1, Delivery = 0
2. Set **Delivery Date Offset** to `-5`, press Tab ✓ Save disabled (Delivery < Prep)
3. Correct **Delivery Date Offset** to `0` (>= Prep of -1), press Tab ✓ Save re-enables (constraint satisfied again)

**Expected**: Fixing Delivery >= Prep re-enables Save button. Error recovery confirmed.
**Cleanup**: Revert delivery to `0`

**Automatable**: Yes


---

## TC-LOS-BAS-007: Misc Settings — Checkbox Default States

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ Misc Settings section visible
2. Verify **Use Fulfillment** = unchecked, enabled ✓
3. Verify **Use Availability** = checked, enabled ✓
4. Verify **Use Equipments QC** = unchecked, **disabled** ✓ cursor=not-allowed or no cursor; cannot interact
5. Verify **Items Filled from Requests Return to Availability** = unchecked, enabled ✓
6. Verify **Allow tentative and confirmed Status to have the same priority** = unchecked, enabled ✓
7. Verify **Print Description (Default)** = checked, enabled ✓
8. Verify **Use ServiceType for Subrental Inventory Sources** = checked, enabled ✓

**Expected**: 6 enabled checkboxes match defaults; Use Equipments QC is always disabled | **Data**: location=1604

**Automatable**: Yes


---

## TC-LOS-BAS-008: Misc Settings — Use Equipments QC Always Disabled

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ Misc Settings section present
2. Locate **Use Equipments QC** checkbox ✓ Checkbox visible
3. Verify checkbox `disabled` attribute is set (aria snapshot shows `[disabled]`) ✓ Cannot click or interact
4. Attempt click — verify state does not change and Save remains disabled ✓

**Expected**: Use Equipments QC is permanently disabled; cannot be toggled

**Automatable**: Yes


---

## TC-LOS-BAS-009: Misc Settings — Phone 1 Required: Empty Triggers aria-invalid + Save Disabled

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Validation | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ **Phone 1** = "760-883-1957"
2. Click **Phone 1** input, select all, clear to empty, press Tab ✓ Input is now empty
3. Verify **Phone 1** input has `aria-invalid="true"` ✓ aria-invalid set to true
4. Verify **Save** button is `disabled` ✓ Save disabled despite change being detected
5. Verify no visible error text paragraph appears ✓ No inline message

**Expected**: Clearing Phone 1 makes it invalid (aria-invalid=true) and disables Save | **Data**: clear phone="760-883-1957"

**Automatable**: Yes


---

## TC-LOS-BAS-010: Misc Settings — Phone 1 Error Recovery

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Validation | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information; clear **Phone 1** ✓ Save disabled, aria-invalid=true
2. Type `760-883-1957` into **Phone 1**, press Tab ✓ aria-invalid clears; Save disables (value matches original — no net change)

**Expected**: Providing the original Phone 1 value restores valid state; Save disables because field matches original | **Cleanup**: No action needed (value already matches original)

**Automatable**: Yes


---

## TC-LOS-BAS-011: Misc Settings — Phone 2 Optional (Empty is Valid)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ **Phone 2** is empty (placeholder text)
2. Verify **Save** button is `disabled` (no changes yet) ✓
3. Type a value into **Phone 2**, press Tab ✓ Save enables
4. Clear **Phone 2** back to empty, press Tab ✓ Save disables (back to original); no aria-invalid on Phone 2

**Expected**: Phone 2 is optional; empty is always valid

**Automatable**: Yes


---

## TC-LOS-BAS-012: Misc Settings — Default New Job to 1 Day (3 Checkboxes)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ Misc Settings section present
2. Verify **Default new job to 1 day — Event** = unchecked, enabled ✓
3. Verify **Default new job to 1 day — Outside** = unchecked, enabled ✓
4. Verify **Default new job to 1 day — Internal** = unchecked, enabled ✓
5. Click **Default new job to 1 day — Event** ✓ Save enables
6. Click **Default new job to 1 day — Event** again to revert to unchecked ✓ Save disables

**Expected**: 3 independent checkboxes, all unchecked by default, each independently enables Save

**Automatable**: Yes


---

## TC-LOS-BAS-013: Misc Settings — Default Order Type Dropdown (3 Options)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ **Default Order Type** combobox shows "Event"
2. Click **Default Order Type** combobox ✓ Dropdown opens; listbox visible
3. Verify 3 options: **Event**, **Outside**, **Internal** ✓ All 3 options present
4. Select **Outside** ✓ Combobox now shows "Outside"; Save enables
5. Select back **Event** ✓ Combobox shows "Event"; Save disables (reverted)

**Expected**: Default Order Type has 3 options (Event/Outside/Internal), defaults to Event. Selection enables Save.

**Automatable**: Yes


---

## TC-LOS-BAS-014: Misc Settings — PO Number and PO Number Label Accept Text

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Low | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ **PO Number** and **PO Number Label** both empty
2. Click **PO Number**, type `PO-TEST-001`, press Tab ✓ Save enables
3. Click **PO Number Label**, type `Purchase Order`, press Tab ✓ Both fields filled; Save still enabled
4. Clear both fields ✓ Save disables (back to original empty state)

**Expected**: Both PO fields accept text input; their defaults are empty (optional)

**Automatable**: Yes


---

## TC-LOS-BAS-015: Section Configuration — Default 13 Active Sections

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ Section Configuration section visible
2. Verify **Use Section** checkbox is checked ✓ Checked state confirmed
3. Verify Section table has exactly 13 data rows ✓ Row count = 13
4. Verify section names: Audio, Flipcharts, Hybrid Meeting, Labor, Lighting, Power, Presenter Support, Projection, Rigging, Scenic, Staging, Video, Whiteboard ✓ All 13 names match
5. Verify 9 sections are **Active** and 4 are **Inactive**:
   - Active: Audio, Flipcharts, Hybrid Meeting, Labor, Lighting, Presenter Support, Projection, Scenic, Video
   - Inactive: Power, Rigging, Staging, Whiteboard ✓ Active/Inactive states match DOM
6. Verify **Add new...** blank row exists at bottom ✓ Placeholder input visible

**Expected**: 13 sections; 9 active, 4 inactive (Power, Rigging, Staging, Whiteboard are inactive) | **Data**: location=1604

**Automatable**: Yes


---

## TC-LOS-BAS-016: Section Configuration — Use Section Checkbox Effect

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ **Use Section** = checked
2. Click **Use Section** to uncheck ✓ Save enables
3. Revert **Use Section** to checked ✓ Save disables
4. Note: ability to observe section table changes requires further exploration of UI behavior when Use Section is toggled

**Expected**: Use Section is editable; toggling enables Save | **Note**: May hide/show section table — explore live

**Automatable**: Yes


---

## TC-LOS-BAS-017: Section Configuration — Edit Existing Section Name

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ Section table visible
2. Click **Flipcharts** section name textbox ✓ Input focused
3. Change name to `Flipcharts Updated`, press Tab ✓ Save enables
4. Revert name back to `Flipcharts`, press Tab ✓ Save disables
**Cleanup**: Ensure section name is reverted to `Flipcharts`

**Expected**: Editing any section name textbox enables Save; reverting disables it

**Automatable**: Yes


---

## TC-LOS-BAS-018: Section Configuration — Add New Section

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ Section table with 13 rows
2. Click the **Add new...** textbox at the bottom of the Section table ✓ Input focused
3. Type `TestSection`, press Enter ✓ New row added to the table; Save enables
4. Verify new row appears with name `TestSection` ✓ Row visible in table

**Expected**: Typing in Add new + Enter creates a new section row | **Cleanup**: Remove TestSection row before save

**Automatable**: Yes


---

## TC-LOS-BAS-019: Section Configuration — Duplicate Active Name Prevents Save (NM-1223)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Validation | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ Section table: 13 rows
2. Edit the **Flipcharts** section name to `Audio` (which already exists and is active), press Tab ✓ Two "Audio" active rows exist
3. Verify **Save** button is `disabled` ✓ Save stays disabled (duplicate validation)
4. Verify a **"Duplicate Name"** warning appears adjacent to the duplicate row ✓ Warning message visible inline

**Expected**: Duplicate active section name prevents Save (NM-1223); "Duplicate Name" warning appears adjacent to the duplicate row | **Cleanup**: Reload page to restore Flipcharts

**Automatable**: Yes


---

## TC-LOS-BAS-020: Section Configuration — Default Button Resets Sections

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ Section Configuration present
2. Locate the **Default** button next to Use Section ✓ Button visible and enabled
3. Click **Default** ✓ No confirmation dialog appears; sections table is immediately updated with system defaults; Save enables
4. Verify section list is reset to system defaults (DOM-verified: Audio, Flipcharts, Hybrid Meeting, Labor, Lighting, Power, Presenter Support, Projection, Rigging, Scenic, Staging, Video, Whiteboard) ✓ Sections restored
5. Verify **Save** is enabled after Default is clicked ✓ Save enabled (state differs from saved)

**Expected**: Default button immediately applies system default sections with no confirmation dialog; Save enables to allow persisting the reset

**Automatable**: Yes


---

## TC-LOS-BAS-021: Room Configuration — Empty Table by Default

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ Room Configuration section visible
2. Verify Room Configuration table has **0 data rows** (empty table) ✓ No rows except Add new
3. Verify **Add new...** placeholder input exists at bottom ✓ Input visible

**Expected**: Room Configuration is empty for 1604 | **Data**: location=1604

**Automatable**: Yes


---

## TC-LOS-BAS-022: Room Configuration — Add New Room Configuration Name

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ Room Configuration empty
2. Click **Add new...** textbox in Room Configuration table ✓ Input focused
3. Type `Ballroom A`, press Enter ✓ New row added; Save enables
4. Verify row appears with name `Ballroom A` ✓

**Expected**: Adding a name to Add new row creates a room configuration entry | **Cleanup**: Remove row before save

**Automatable**: Yes


---

## TC-LOS-BAS-023: Room Configuration — Duplicate Active Room Name Prevents Save (NM-1223)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Validation | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information; add room `ConferenceA`, save it (if needed) ✓
2. Add a second room with name `ConferenceA` ✓ Two active "ConferenceA" entries
3. Verify **Save** is `disabled` ✓ Duplicate active room name prevents save (NM-1223)
**Cleanup**: Remove duplicate entry

**Expected**: Same NM-1223 rule applies to Room Configuration table

**Automatable**: Yes


---

## TC-LOS-BAS-024: Default Logo — Checkboxes and Default State

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ Default Logo section visible
2. Verify **Quotes** checkbox = checked ✓
3. Verify **Rental Orders/DROs** checkbox = checked ✓
4. Click **Quotes** to uncheck ✓ Save enables
5. Revert **Quotes** to checked ✓ Save disables

**Expected**: Both logo checkboxes are checked by default; each is independently toggleable

**Automatable**: Yes


---

## TC-LOS-BAS-025: Default Logo — Company Logo Combobox (12 Options)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ **Company Logo** = "Encore New Logo"
2. Click **Company Logo** combobox ✓ Dropdown opens
3. Verify 12 logo options available: Concise New York Logo, DISNEY NEW Logo, SAVLogoNew, Concise New Logo Large, Encore New Logo, PSAV DEG Red Bar(V2), Encore Blue Logo, SAV_Cropped, PSAV Presentation Services (V3), Concise New York Logo Orig, CSI Logo, Header with Dust Ears and Text ✓ All 12 present
4. Select a different logo (e.g., **Encore Blue Logo**) ✓ Combobox updates; Save enables
5. Revert to **Encore New Logo** ✓ Save disables

**Expected**: Company Logo combobox has 12 options; default = "Encore New Logo"

**Automatable**: Yes


---

## TC-LOS-BAS-026: Default Logo — Preview Image Updates on Logo Selection Change

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ Logo preview shows Encore New Logo artwork
2. Click **Company Logo** combobox, select **Encore Blue Logo** ✓ Combobox changes
3. Verify logo preview image updates to show the Encore Blue Logo ✓ Preview `img` src changes
4. Revert Company Logo to **Encore New Logo** ✓ Preview reverts

**Expected**: Logo preview image reflects the currently selected Company Logo | **Data**: testid=local-office-settings-logo-preview

**Automatable**: Yes


---

## TC-LOS-BAS-027: Discount Exemptions — Service Type Toggle

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ Discount Exemptions section visible
2. Verify table has Service Type and Exempt columns ✓
3. Verify 75 service type rows present (verified from DOM: APP Downloaded, App Quality Assurance, ... through ZSub Rental Specialty) ✓
4. Identify a currently non-exempt service type (toggle img NOT present), e.g., **APP Downloaded** ✓
5. Click its **Exempt** toggle cell ✓ Toggle activates; Save enables
6. Revert toggle back to original state ✓ Save disables

**Expected**: Each service type has an independently toggleable Exempt status; toggling enables Save

**Automatable**: Yes


---

## TC-LOS-BAS-028: Discount Exemptions — Currently Exempt Services

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information, Discount Exemptions section ✓
2. Identify services that are currently exempt (img present in toggle cell): HSIA - Labor, HSIA - Subrental Equipment, Loss Damage Waiver, Operator Labor ✓ These 4 have active toggle img (verified from DOM snapshot)
3. Verify toggle img is NOT present for the majority of non-exempt services ✓
4. Click **Loss Damage Waiver** toggle to remove exemption ✓ img disappears; Save enables
5. Revert **Loss Damage Waiver** toggle to exempt ✓ img appears; Save disables

**Expected**: Confirmed exempt services have active toggle; each is independently toggleable | **Data**: location=1604

**Automatable**: Yes


---

## TC-LOS-BAS-029: Unsaved Changes Dialog — Stay Keeps Changes

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Navigation | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ Save disabled
2. Click **Use Fulfillment** checkbox ✓ Save enables (change made)
3. Click **ECT Settings** tab ✓ "Unsaved changes" alertdialog appears: heading "Unsaved changes", paragraph "You have unsaved changes. Do you want to discard them?", buttons **Stay** and **Discard**
4. Click **Stay** ✓ Dialog closes; remain on Basic Information tab; change is preserved; Save remains enabled

**Expected**: "Unsaved changes" dialog with Stay/Discard. Stay → remain on current tab with unsaved changes intact | **Cleanup**: Revert Use Fulfillment

**Automatable**: Yes


---

## TC-LOS-BAS-030: Unsaved Changes Dialog — Discard Navigates Away

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Navigation | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ Save disabled
2. Click **Use Fulfillment** checkbox ✓ Save enables
3. Click **Location Settings History** tab ✓ "Unsaved changes" alertdialog appears
4. Click **Discard** ✓ Dialog closes; navigates to Location Settings History tab; changes discarded; Save on Basic Info would be disabled

**Expected**: Discard → navigate to target tab, changes lost | **Cleanup**: No action needed (changes discarded)

**Automatable**: Yes


---

## TC-LOS-BAS-031: Unsaved Changes Dialog — ECT Settings Tab Switch Triggers Same Dialog

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Navigation | Yes |

**Steps**:
1. Navigate to ECT Settings tab ✓ Active
2. Edit **Benefits Multiplier** from `20.0%` to `21.0%`, press Tab ✓ Fixed Costs Save enables
3. Click **Basic Information** tab ✓ "Unsaved changes" alertdialog appears with Stay/Discard
4. Click **Discard** ✓ Navigates to Basic Information; ECT changes discarded
5. Return to ECT Settings ✓ Benefits Multiplier reverted to `20.0%`

**Expected**: Same "Unsaved changes" dialog works for ECT Settings tab navigation | **Cleanup**: Verify ECT values restored

**Automatable**: Yes


---

## TC-LOS-BAS-032: Basic Information — Multiple Field Changes in One Session

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ Save disabled
2. Change **Use Fulfillment** (check), **Phone 2** (type "555-0100"), **PO Number** (type "PO-001") ✓
3. Verify **Save** is enabled ✓ Multiple changes tracked
4. Revert all 3 to originals ✓ Save disables when all reverted

**Expected**: Multiple field changes compound; all must be reverted to re-disable Save

**Automatable**: Yes


---

## TC-LOS-BAS-033: Section Toggle — Active/Inactive Toggle Updates Table Row

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information, Section Configuration ✓ All 13 sections active
2. Click the **Active** toggle cell for **Video** (toggle img present = active) ✓ Toggle changes state; Save enables
3. Verify Video row now shows inactive state (img disappears or changes) ✓
4. Click the toggle again to re-activate ✓ img returns; Save disables

**Expected**: Section active toggle is independently toggleable; toggling enables Save

**Automatable**: Yes


---

## TC-LOS-BAS-034: Default Date Offsets — Negative Values Accepted

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Boundary | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ Prep = -1 (already negative)
2. Verify **Prep Date Offset** = `-1` is already a valid negative value ✓ No error shown
3. Change **Pickup Date Offset** from `0` to `-3`, press Tab ✓ Negative value accepted; Save enables
4. Revert to `0` ✓ Save disables

**Expected**: Date offset inputs accept negative integers (verified by default values of -1) | **Cleanup**: Revert

**Automatable**: Yes


---

## TC-LOS-BAS-035: Default Date Offsets — Zero Value Accepted

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Boundary | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information ✓ Delivery = 0, Pickup = 0
2. Verify both `0` values are saved/valid without error ✓ No error showing
3. Change **Prep Date Offset** from `-1` to `0`, press Tab ✓ Value = 0 accepted; Save enables
4. Note: Delivery (0) = Prep (0) → Delivery >= Prep valid (not a violation) ✓
5. Revert Prep to `-1` ✓ Save disables

**Expected**: Zero is a valid date offset value; Delivery == Prep is valid (not a violation)

**Automatable**: Yes


---

## TC-LOS-HST-001: Location Settings History Tab — Structure and Empty State

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, click **Location Settings History** tab ✓ History tab panel activates
2. Verify filter combobox shows **Location Settings History** (default) ✓
3. Verify table is visible with column headers ✓
4. Verify empty state text = "No results." ✓ (location 1604 has no history)
5. Verify pagination row shows rows-per-page combobox = `20` ✓
6. Verify all pagination buttons (first/prev/next/last) are disabled ✓

**Expected**: History tab loads with filter, empty table "No results.", pagination disabled | **Data**: location=1604

**Automatable**: Yes


---

## TC-LOS-HST-002: History Filter Dropdown — Two Options

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Location Settings History tab ✓ Filter combobox visible
2. Click the **filter combobox** (default: "Location Settings History") ✓ Dropdown opens
3. Verify exactly 2 options: **Location Settings History** and **Location Settings Legacy History** ✓
4. Select **Location Settings Legacy History** ✓ Filter updates; table may show different data

**Expected**: Filter has 2 options; selection changes the data source | **Data**: testid=local-office-settings-history-select-type

**Automatable**: Yes


---

## TC-LOS-HST-003: History Table — 42 Columns, All Sortable Except Local Office

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Location Settings History tab ✓ Table visible
2. Verify **Local Office** column header has no sort button ✓ Only plain text header
3. Verify all other 41 columns have a sort button (clickable) ✓ Sort buttons present on all others
4. Verify column list matches documented 42 columns: Local Office, Prep Date Offset, Return Date Offset, Set Date Offset, Strike Date Offset, Pickup Date Offset, Delivery Date Offset, Use Fulfillment, Use Availability, Use Equip QC, Print Desc, Use Subrent, Phone1, Phone2, Use Sect., Section Name, Sect. Action, Logo Name, Use On Quote, Use On Rental, Service Type - Exempt, ST Action, Action, Notes, Marriott PMS Account Enabled, Default Job to 1 day for Event Orders, Default Job to 1 day for Outside Orders, Default Job to 1 day for Internal Orders, Default Labor to Hourly, Allow tentative and confirmed Status to have the same priority, Items Filled from Requests Return to Availability, Default Order Type, Regular Hours, Regular Hours Multiplier, Over Time Hours, OverTime Hours Multiplier, Double Time Hours, DoubleTime Hours Multiplier, Holiday Multiplier, Recalc Labor Hours, Modified By, Modified On ✓ All 42 present

**Expected**: 42 columns total; Local Office unique in having no sort button

**Automatable**: Yes


---

## TC-LOS-HST-004: History Pagination — Rows Per Page Options

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Location Settings History tab ✓ Pagination visible
2. Click **rows per page** combobox (default: 20) ✓ Dropdown opens
3. Verify options: **10**, **20**, **30**, **40**, **50** ✓ All 5 options present
4. Select `10` ✓ Rows per page updates to 10

**Expected**: Rows per page has 5 options (10/20/30/40/50); default is 20

**Automatable**: Yes


---

## TC-LOS-HST-005: History Tab — Read-Only Table (No Add/Edit/Delete)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Location Settings History tab ✓ Table visible
2. Verify there is no **Add** button, no row-level **Edit** or **Delete** controls ✓
3. Attempt to click/edit any cell in the table — confirm no input appears ✓ Table is read-only

**Expected**: History table is entirely read-only. No modification controls exist.

**Automatable**: Yes


---

## TC-LOS-HST-006: History Filter Change Triggers Table Reload

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Location Settings History tab ✓ Default filter = "Location Settings History"
2. Change filter to **Location Settings Legacy History** ✓ Table reloads with legacy data (or still shows "No results." for 1604)
3. Change filter back to **Location Settings History** ✓ Table reloads with current data view

**Expected**: Changing the filter dropdown triggers a table data reload

**Automatable**: Yes


---

## TC-LOS-ECT-001: ECT Settings — Page Header and Location Info

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, click **ECT Settings** tab ✓ ECT tab panel activates
2. Verify heading `<h6>` reads **1604 - Parker Palm Springs** ✓ testid=ect-settings-label-location-name
3. Verify "Edit/View: Commission structure" link is visible ✓ testid=ect-settings-link-commission-structure
4. Verify **Currency** combobox shows **USD** ✓ testid=ect-settings-select-currency

**Expected**: ECT Settings shows correct location header, commission link, and USD currency selector

**Automatable**: Yes


---

## TC-LOS-ECT-002: ECT Settings — Currency Selector (USD-only for Location 1604)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, ECT Settings tab ✓ Currency = "USD"
2. Click **Currency** combobox ✓ Dropdown opens
3. Verify only **USD** is available as an option ✓ One option in listbox
4. Close dropdown without selecting ✓ Currency remains "USD"

**Expected**: Location 1604 has only USD currency in ECT Settings | **Data**: location=1604

**Automatable**: Yes


---

## TC-LOS-ECT-003: ECT Settings — Commission Structure Link

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Low | Manual | Navigation | No |

**Steps**:
1. Navigate to Local Office Settings, ECT Settings tab ✓ Commission link visible
2. Verify **Commission structure** is a clickable link ✓
3. Verify the link URL contains the office ID (1604) ✓ Confirmed URL pattern: `#/commissons/commissionstier/:1604/`

**Expected**: Commission structure link is present and navigates to external commission configuration | **Status**: Blocked (Cat-A: external URL in legacy app)

**Automatable**: No


---

## TC-LOS-ECT-004: ECT Settings — Event Profit Target Table Read-Only

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, ECT Settings tab ✓ Event Profit Target table visible
2. Verify table has 4 columns: Lower Limit, Upper Limit, Target, Currency ✓
3. Verify 9 data rows with expected values starting from $5,000.01 → $10,000.01 → $25,000.01 → etc ✓
4. Attempt to click/edit any cell ✓ No input appears; table is read-only

**Expected**: Event Profit Target table has 9 read-only rows | **Data**: first row = $5,000.01 / $10,000.00 / 41.0% / USD

**Automatable**: Yes


---

## TC-LOS-ECT-005: ECT Settings — Fixed Costs Display Fields (Read-Only)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, ECT Settings tab ✓ Fixed Costs section visible
2. Verify **Venue Fixed Costs** = 13.9% (display only) ✓
3. Verify **SG&A %** = 8.0% (display only) ✓
4. Verify **Other Rate** = 0.0% (display only) ✓
5. Verify **No Labor Rate** = 0.0% (display only) ✓
6. Verify **Approval Threshold** = $0.00 (display only) ✓
7. Verify **Peak Labor Adjustment %** = 5.0% (display only) ✓
8. Verify **Non-Peak Labor Adjustment %** = 0.0% (display only) ✓

**Expected**: 7 display-only Fixed Cost fields match documented values | **Data**: location=1604, currency=USD

**Automatable**: Yes


---

## TC-LOS-ECT-006: ECT Settings — Benefits Multiplier Editable; Fixed Costs Save Enables

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, ECT Settings tab ✓ **Benefits Multiplier** = "20.0%"; **Fixed Costs Save** disabled
2. Click **Benefits Multiplier** input, change to `21.0%`, press Tab ✓ Fixed Costs Save enables
3. Verify **Labor Costs Save** button remains disabled ✓ Independent save — not affected by Fixed Costs edit
4. Revert **Benefits Multiplier** to `20.0%`, press Tab ✓ Fixed Costs Save disables again

**Expected**: Benefits Multiplier enables Fixed Costs Save only; Labor Costs Save unaffected | **Cleanup**: Revert to 20.0%

**Automatable**: Yes


---

## TC-LOS-ECT-007: ECT Settings — Historical Subrental % Role-Gated (NM-1260)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | No |

**Steps**:
1. Login as user WITH **Production & Sales** role; navigate to Local Office Settings, ECT Settings ✓ **Historical Subrental %** = editable textbox
2. Click **Historical Subrental %**, change value to `1.0%`, press Tab ✓ Fixed Costs Save enables
3. Revert to `0.0%` ✓ Save disables
4. Login as user WITHOUT **Production & Sales** role; navigate to ECT Settings per NM-1260 ✓ **Historical Subrental %** = **disabled** (cannot edit)

**Expected**: Historical Subrental % is editable only for users with Production & Sales role (NM-1260) | **Status**: Partially blocked (requires role switching; step 4 blocked = Cat-A: role not available in test env) | **Cleanup**: Revert to 0.0%

**Automatable**: No


---

## TC-LOS-ECT-008: ECT Settings — Labor Costs Save Enables on Any Row Edit

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, ECT Settings tab ✓ **Labor Costs Save** disabled; **Fixed Costs Save** disabled
2. Click **Administrative Fee** labor cost input (row 0), change value from `35.00` to `40.00`, press Tab ✓ **Labor Costs Save** enables
3. Verify **Fixed Costs Save** remains disabled ✓ Independent from Labor Costs section
4. Revert **Administrative Fee** to `35.00`, press Tab ✓ Labor Costs Save disables again

**Expected**: Editing any Labor Cost row enables Labor Costs Save ONLY; Fixed Costs Save unaffected | **Cleanup**: Revert to 35.00

**Automatable**: Yes


---

## TC-LOS-ECT-009: ECT Settings — Two Separate Save Buttons (Fixed Costs + Labor Costs)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, ECT Settings tab ✓ Both Save buttons disabled
2. Edit **Benefits Multiplier** ✓ Only Fixed Costs Save enables; Labor Costs Save remains disabled
3. Revert Benefits Multiplier; then edit **Administrative Fee** labor cost ✓ Only Labor Costs Save enables; Fixed Costs Save remains disabled
4. Revert all changes ✓ Both saves disabled

**Expected**: Fixed Costs Save and Labor Costs Save are completely independent and do not cross-enable | **Cleanup**: Revert all edits

**Automatable**: Yes


---

## TC-LOS-ECT-010: ECT Settings — Labor Cost Assumptions Table (66 Rows All Editable)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, ECT Settings tab ✓ Labor Cost Assumptions table visible
2. Verify table has 2 columns: **Labor Class** (read-only text), **Labor Cost** (editable textbox) ✓
3. Verify exactly **66** labor cost rows via data-testid pattern `ect-settings-input-labor-cost-{0..65}` ✓
4. Spot-check row 0 (**Administrative Fee**) = 35.00 ✓
5. Spot-check row 2 (**Audio - Operate/Show**) = 37.10 ✓
6. Spot-check last row (index 65, **zzzFinishing Service**) = 37.10 ✓

**Expected**: 66 labor cost rows, all Labor Cost cells editable, Labor Class cells read-only | **Data**: location=1604

**Automatable**: Yes


---

## TC-LOS-ECT-011: ECT Settings — SubRental Matrix Table Read-Only

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, ECT Settings tab ✓ SubRental Matrix section visible
2. Verify 4 columns: Lower Limit, Upper Limit, Subrental Percentage, Currency ✓
3. Verify 9 data rows with expected values (e.g., row 1: $0.00 / $4,999.00 / 0.9% / USD) ✓
4. Attempt to edit any cell ✓ No input; table is read-only

**Expected**: SubRental Matrix has 9 read-only rows | **Data**: testid=ect-settings-table-sub-rental-matrix

**Automatable**: Yes


---

## TC-LOS-ECT-012: ECT Settings — Unsaved Changes Dialog on Tab Switch

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Navigation | Yes |

**Steps**:
1. Navigate to Local Office Settings, ECT Settings tab ✓ Both Saves disabled
2. Edit **Benefits Multiplier** from `20.0%` to `21.0%`, press Tab ✓ Fixed Costs Save enables
3. Click **Location Settings History** tab ✓ "Unsaved changes" alertdialog appears
4. Verify dialog heading: "Unsaved changes" ✓
5. Verify body: "You have unsaved changes. Do you want to discard them?" ✓
6. Verify 2 buttons: **Stay** (keeps user on ECT Settings) and **Discard** (navigates to History) ✓
7. Click **Stay** ✓ Remains on ECT Settings; Benefits Multiplier = 21.0% preserved; Save still enabled

**Expected**: Unsaved changes dialog with Stay/Discard; Stay preserves context | **Cleanup**: Revert Benefits Multiplier to 20.0%

**Automatable**: Yes


---

## TC-LOS-ECT-013: ECT Settings — Unsaved Changes Discard Navigates and Loses Changes

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Navigation | Yes |

**Steps**:
1. Navigate to Local Office Settings, ECT Settings tab; edit **Benefits Multiplier** to `21.0%` ✓ Save enables
2. Click **Basic Information** tab ✓ "Unsaved changes" dialog appears
3. Click **Discard** ✓ Navigates to Basic Information; ECT edits lost
4. Return to ECT Settings ✓ Benefits Multiplier = `20.0%` (original value restored)

**Expected**: Discard navigates away and loses unsaved ECT changes | **Cleanup**: No action needed

**Automatable**: Yes


---

## TC-LOS-ECT-014: ECT Settings — Fixed Costs Explanatory Text Present

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Low | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, ECT Settings tab ✓ Fixed Costs section visible
2. Verify explanatory paragraphs exist below the Fixed Costs fields ✓ 3 paragraphs: "Fixed costs include salaried labor...", "The Fixed cost percentage above is the actual percentage...", "SG&A (Selling, General, and Administrative)..."

**Expected**: Fixed Costs section includes 3 informational paragraphs explaining the metrics

**Automatable**: Yes


---

## TC-LOS-ECT-015: ECT Settings — Historical Subrental % Enabled for Current User

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Login as current test user (Rutvik Khorasiya — has Production & Sales role) ✓
2. Navigate to Local Office Settings, ECT Settings tab ✓
3. Verify **Historical Subrental %** input is enabled (not disabled) ✓ `isDisabled=false` confirmed live
4. Click and edit the value ✓ Fixed Costs Save enables
5. Revert ✓

**Expected**: Current test user can edit Historical Subrental % (has required role) | **Cleanup**: Revert to 0.0%

**Automatable**: Yes


---