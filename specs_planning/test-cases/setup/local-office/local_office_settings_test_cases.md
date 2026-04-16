# Local Office Settings Test Cases — **Module**: locations | **Total**: 85 | **Status**: Automated

**URL**: `/navigator/locations/{officeId}/settings/local-office`
**Location tested**: 1604 (Parker Palm Springs, USA)
**Updated**: 2026-04-13
**Scope**: All 3 tabs — Basic Information (59 TCs) | Location Settings History (7 TCs) | ECT Settings (17 TCs) | Integration: History Verification (2 TCs)
**Selector file**: `src/selectors/locations/local-office-settings.ts`

---

## MCP_VERIFICATION_LOG

| Field | Value |
|-------|-------|
| Date | 2026-03-23 |
| URL | https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/local-office |
| Office/Entity | 1604 (Parker Palm Springs) |
| Total fields found | 36 (6 offsets + 9 checkboxes + 3 job-day checkboxes + 1 labor-hourly + 2 phones + 1 combobox + 2 PO inputs + 1 Use Section + 1 Default btn + sections table + rooms table + 2 logo checkboxes + 1 logo combobox + 1 logo preview + exemptions table) |
| Total fields tested (edit+save) | 12 (Use Fulfillment, Delivery offset NM-1264, Prep non-numeric, Phone 1 empty/XSS/valid, Default Labor to Hourly, Default Order Type options, Logo combobox, Unsaved changes dialog) |
| Save dialog | Shared "Save Changes" dialog on Save click: alertdialog "Save Changes" / "Are you sure you want to save the changes?" / Cancel + Save buttons. Unsaved changes dialog on tab-switch: alertdialog "Unsaved changes" / "Are you sure you want to leave this view? Any unsaved changes will be lost." / Stay + Discard buttons |
| Column headers | Sections: Section Name, Active. Rooms: Room Configuration Name, Active. Exemptions: Service Type, Exempt |
| Dropdown options | Default Order Type: [Event, Outside] (2 options — Internal NOT present). Company Logo: [Header with Dust Ears and Text, PSAV Presentation Services (V3), PSAV DEG Red Bar(V2), SAV_Cropped, SAVLogoNew, Concise New York Logo Orig, CSI Logo, Concise New York Logo, Encore Blue Logo, Encore New Logo, Concise New Logo Large, DISNEY NEW Logo] (12 options) |
| Cascade behaviors | Use Fulfillment checked -> Use Equipments QC enabled. Use Fulfillment unchecked -> QC disabled. |
| Input attribute types | Date offsets: type=text, name=prepDateOffsetHours etc. Phone 1: type=text, name=contactPhone1. PO Number/Label: type=text, no name. |
| Validation error patterns | Date offsets: aria-invalid=true on non-numeric, NM-1264 violation, or positivity constraint violation ("relative to start" fields must be <= 0, "relative to end" fields must be >= 0). Phone 1: aria-invalid=true when empty (required field only — NO format validation). No visible error text paragraphs. |
| Input masks/formatting | Date offsets: accept any text, validated client-side (aria-invalid). Phone 1: required-only (rejects empty with aria-invalid=true, accepts ANY non-empty text including non-phone formats). |
| Filtering mechanism | N/A for Basic Information tab |
| API loading | Basic Info tab loads immediately |
| Strict mode risks | Discount exemptions toggle cells have no data-testid — locate by row text |
| Form structure | Save button inside `<form data-testid="local-office-settings-form">` — type=button, disabled by default |
| Dialog side effects | Unsaved changes dialog: Stay=safe (returns to tab, changes preserved). Discard=navigates away, changes lost. |
| Boundary behaviors | Date offsets: non-numeric "abc" -> aria-invalid=true, Save disabled. Positive values for "relative to start" fields -> aria-invalid=true. Negative values for "relative to end" fields -> aria-invalid=true. Phone 1: XSS `<script>alert(1)</script>` -> accepted (no format validation), Save enabled. |
| Section toggle mechanism | Active = SVG checkmark (class "lucide lucide-check text-primary"). Inactive = no SVG. Click toggles. |

---

## FIELD INVENTORY — Basic Information Tab

| Field | Type | Default (1604) | State | data-testid |
|---|---|---|---|---|
| Save | button | — | disabled by default | `local-office-settings-btn-save` |
| Prep Date Offset (Relative to Start) | textbox | -1 | enabled | `local-office-settings-input-prep-date-offset` |
| Return Date Offset (Relative to End) | textbox | 1 | enabled | `local-office-settings-input-return-date-offset` |
| Set Date Offset (Relative to Start) | textbox | -1 | enabled | `local-office-settings-input-set-date-offset` |
| Strike Date Offset (Relative to End) | textbox | 1 | enabled | `local-office-settings-input-strike-date-offset` |
| Delivery Date Offset (Relative to Start) | textbox | 0 | enabled | `local-office-settings-input-delivery-date-offset` |
| Pickup Date Offset (Relative to End) | textbox | 0 | enabled | `local-office-settings-input-pickup-date-offset` |
| Use Fulfillment | checkbox | unchecked | enabled; **enables QC when checked** | `local-office-settings-checkbox-use-fulfillment` |
| Use Availability | checkbox | checked | enabled | `local-office-settings-checkbox-use-availability` |
| Use Equipments QC | checkbox | unchecked | **conditionally disabled** (disabled when Use Fulfillment unchecked; enabled when checked) | `local-office-settings-checkbox-use-equipments-qc` |
| Items Filled from Requests Return to Availability | checkbox | unchecked | enabled | `local-office-settings-checkbox-request-items-return` |
| Allow tentative and confirmed Status to have the same priority | checkbox | unchecked | enabled | `local-office-settings-checkbox-same-priority` |
| Print Description (Default) | checkbox | checked | enabled | `local-office-settings-checkbox-print-description` |
| Use ServiceType for Subrental Inventory Sources | checkbox | checked | enabled | `local-office-settings-checkbox-use-subrent-service-type` |
| Phone 1 | textbox | 760-883-1957 | enabled; **required only (no format validation)** | `local-office-settings-input-phone-1` |
| Phone 2 | textbox | (empty) | enabled; optional | `local-office-settings-input-phone-2` |
| Default new job to 1 day — Event | checkbox | unchecked | enabled | `local-office-settings-checkbox-default-job-one-day-event` |
| Default new job to 1 day — Outside | checkbox | unchecked | enabled | `local-office-settings-checkbox-default-job-one-day-outside` |
| Default new job to 1 day — Internal | checkbox | unchecked | enabled | `local-office-settings-checkbox-default-job-one-day-internal` |
| Default Labor to Hourly | checkbox | unchecked | enabled | `local-office-settings-checkbox-default-labor-to-hourly` |
| Default Order Type | combobox | Event | enabled; **2 options: Event / Outside** | `local-office-settings-select-default-order-type` |
| PO Number | textbox | (empty) | enabled | `local-office-settings-input-po-number` |
| PO Number Label | textbox | (empty) | enabled | `local-office-settings-input-po-number-label` |
| Use Section | checkbox | checked | enabled | `local-office-settings-checkbox-use-section` |
| Default (sections) | button | — | enabled | `local-office-settings-btn-default-section` |
| Section Name (table — each row) | textbox | see 13 sections | enabled | (no individual data-testid — use aria-label) |
| Active (section — each row) | toggle (SVG checkmark) | 9 active / 4 inactive | enabled | (no data-testid — use row text + cell position) |
| Add new section | textbox | (placeholder: Add New...) | enabled | (use placeholder selector) |
| Room Configuration Name (table) | textbox | (no rows for 1604) | enabled | (no individual data-testid) |
| Active (room — each row) | toggle | — | enabled | (no data-testid) |
| Add new room | textbox | (placeholder: Add New...) | enabled | (use placeholder selector) |
| Quotes (logo) | checkbox | checked | enabled | `local-office-settings-checkbox-use-quote-logo` |
| Rental Orders/DROs (logo) | checkbox | checked | enabled | `local-office-settings-checkbox-use-rental-logo` |
| Company Logo | combobox | Encore New Logo | enabled; 12 options | `local-office-settings-select-company-logo` |
| Logo preview | image | Encore New Logo artwork | display only | `local-office-settings-logo-preview` |
| Discount Exemptions — each service type toggle | toggle (SVG checkmark) | 75 rows; 4 exempt | enabled | (table: `local-office-settings-table-discount-exemptions`) |

---

## CORRECTIONS FROM PREVIOUS VERSION (2026-03-02)

| Issue | Old (Wrong) | New (Correct, MCP-verified 2026-03-23) |
|-------|-------------|---------------------------------------|
| Use Equipments QC | "always disabled" | Conditionally disabled — enabled when Use Fulfillment is checked |
| Default Order Type options | 3 (Event/Outside/Internal) | 2 (Event/Outside) — Internal option removed |
| Default Labor to Hourly | Missing from field inventory | New checkbox field, unchecked by default, enabled |
| NM-1264 validation | "no inline error" | Delivery input gets `aria-invalid="true"` |
| Phone 1 validation | "required" only | Required-only — NO format validation. Any non-empty string accepted |
| Unsaved changes dialog text | "You have unsaved changes. Do you want to discard them?" | "Are you sure you want to leave this view? Any unsaved changes will be lost." |
| Section toggle mechanism | "img present/absent" | SVG checkmark (`lucide lucide-check text-primary`) present/absent |

## CORRECTIONS FROM 2026-03-24 AUDIT

| Issue | Old (Wrong) | New (Correct, MCP-verified 2026-03-24) |
|-------|-------------|---------------------------------------|
| Save dialog | Self-contradicting: MCP log said "No dialog" but TCs said "Save Local Office Settings / Yes / No" | Uses shared "Save Changes" dialog with Cancel/Save buttons |
| BAS-004 test value | Prep=5 (violates NM-1264 + positivity: Prep must be <= 0) | Prep=-2 (valid: <= 0 and Delivery(0) >= Prep(-2)) |
| BAS-005 test value | Prep=10 (same violation) | Prep=-2 |
| BAS-008 recovery value | Delivery=0 (restores to server-original, Angular sees no net change, Save stays disabled) | Delivery=-1 (different from original 0, form is dirty, Save enables) |
| BAS-009 field + value | Return=-10 (negative invalid for "relative to end" fields) | Set=-10 (negative valid for "relative to start" fields) |
| BAS-016 assertion | Expected aria-invalid on "not-a-phone" | No format validation exists; any non-empty string accepted |
| Positivity constraints | Undocumented | "Relative to start" fields (Prep, Set, Delivery) must be <= 0. "Relative to end" fields (Return, Strike, Pickup) must be >= 0 |
| Selector file | Dead selectors: dlgSaveLocalOffice, btnSaveLocalOfficeYes, btnSaveLocalOfficeNo | Removed — uses shared dlgSaveChanges/btnSaveChangesConfirm from shared.ts |

---

## TC-LOS-BAS-001: Page Load — Title, URL, Tab Structure

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to `/navigator/locations/1604/settings/local-office` -> Page title = "Local Office Settings | Navigator"
2. Verify heading reads **Local Office Settings** -> h1 heading visible
3. Verify 3 tabs present: **Basic Information** | **Location Settings History** | **ECT Settings** -> 3 tabs in tablist
4. Verify **Basic Information** tab is selected by default -> Tab has `aria-selected="true"`

**Expected**: Page loads with 3 tabs, Basic Information active by default
**Automatable**: Yes

---

## TC-LOS-BAS-002: Default Date Offsets — Default Values (Fresh Load)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Tab panel visible
2. Verify **Prep Date Offset (Relative to Start)** = `-1` Hrs -> Input value = "-1"
3. Verify **Return Date Offset (Relative to End)** = `1` Hrs -> Input value = "1"
4. Verify **Set Date Offset (Relative to Start)** = `-1` Hrs -> Input value = "-1"
5. Verify **Strike Date Offset (Relative to End)** = `1` Hrs -> Input value = "1"
6. Verify **Delivery Date Offset (Relative to Start)** = `0` Hrs -> Input value = "0"
7. Verify **Pickup Date Offset (Relative to End)** = `0` Hrs -> Input value = "0"

**Expected**: All 6 offset inputs match defaults: -1, 1, -1, 1, 0, 0 | **Data**: location=1604
**Automatable**: Yes

---

## TC-LOS-BAS-003: Save Button — Disabled by Default

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Tab panel visible
2. Locate **Save** button in left sidebar -> Button with `data-testid="local-office-settings-button-save"`
3. Verify Save button has `disabled` attribute -> Button is not clickable

**Expected**: Save button disabled on fresh page load with no edits
**Automatable**: Yes

---

## TC-LOS-BAS-004: Save Button — Enables on Date Offset Edit

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Save button disabled
2. Clear **Prep Date Offset** field and type `-2` -> Field value changes to "-2"
3. Verify Save button is now **enabled** (no `disabled` attribute) -> Button clickable
4. **Cleanup**: Clear field and type `-1` to restore original value

**Expected**: Editing any date offset field enables the Save button
**Automatable**: Yes

---

## TC-LOS-BAS-005: Date Offset — Edit, Save, Persist

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Tab panel visible
2. Clear **Prep Date Offset** field and type `-2` -> Field shows "-2"
3. Click **Save** -> Shared "Save Changes" dialog appears: "Are you sure you want to save the changes?" / Cancel + Save buttons
4. Click **Save** in dialog -> Dialog closes, save completes
5. Reload page -> Page reloads fresh
6. Verify **Prep Date Offset** = `-2` -> Value persisted
7. **Cleanup**: Change back to `-1` and save

**Expected**: Date offset value persists after save and reload | **Data**: Prep from -1 to -2
**Automatable**: Yes

---

## TC-LOS-BAS-006: Date Offset — Non-Numeric Input Rejected

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Validation | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Tab panel visible
2. Clear **Prep Date Offset** field and type `abc` -> Field gets `aria-invalid="true"`
3. Verify Save button is **disabled** -> Button has `disabled` attribute
4. **Cleanup**: Clear and type `-1` to restore

**Expected**: Non-numeric input triggers aria-invalid and disables Save
**Automatable**: Yes

---

## TC-LOS-BAS-007: Date Offset — Delivery < Prep Cross-Field Validation (NM-1264)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Validation | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Tab panel visible
2. Clear **Delivery Date Offset** and type `-5` -> Field shows "-5"
3. Verify **Prep Date Offset** = `-1` (default) -> Delivery (-5) < Prep (-1)
4. Verify **Delivery Date Offset** field gets `aria-invalid="true"` -> Validation error on Delivery
5. Verify Save button is **disabled** -> Cannot save invalid state
6. **Cleanup**: Clear Delivery and type `0` to restore

**Expected**: When Delivery offset < Prep offset, Delivery field shows aria-invalid and Save disabled
**Automatable**: Yes

---

## TC-LOS-BAS-008: Date Offset — NM-1264 Error Recovery

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Trigger NM-1264 validation: set Delivery to `-5` with Prep at `-1` -> Delivery has aria-invalid, Save disabled
2. Clear **Delivery Date Offset** and type `-1` -> Delivery >= Prep condition restored (use `-1` not `0` to avoid restoring to server-original which leaves form pristine)
3. Verify **Delivery Date Offset** no longer has `aria-invalid` -> Error cleared
4. Verify Save button is **enabled** -> Can save valid state (form is dirty: Delivery changed from 0 to -1)

**Expected**: Correcting the cross-field violation clears error and re-enables Save
**Automatable**: Yes

---

## TC-LOS-BAS-009: Date Offset — Negative Value Accepted (Relative to Start)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Boundary | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Tab panel visible
2. Clear **Set Date Offset (Relative to Start)** and type `-10` -> Field shows "-10"
3. Verify field does NOT have `aria-invalid` -> Negative value valid for "relative to start" fields
4. Verify Save button is **enabled** -> Can save
5. **Cleanup**: Clear and type `-1` to restore

**Expected**: Negative values are valid for "relative to start" date offset fields (Prep, Set, Delivery)
**Automatable**: Yes

---

## TC-LOS-BAS-010: Date Offset — Zero Value Accepted

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Boundary | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Tab panel visible
2. Clear **Prep Date Offset** and type `0` -> Field shows "0"
3. Verify field does NOT have `aria-invalid` -> Zero valid
4. Verify Save button is **enabled** -> Can save
5. **Cleanup**: Clear and type `-1` to restore

**Expected**: Zero is a valid value for date offset fields
**Automatable**: Yes

---

## TC-LOS-BAS-011: Misc Settings — Checkbox Default States

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Tab panel visible
2. Scroll to **Misc Settings** section -> Section visible
3. Verify **Use Fulfillment** checkbox is **unchecked** -> `aria-checked="false"`
4. Verify **Use Equipments QC** checkbox is **unchecked** AND **disabled** -> `aria-checked="false"`, `disabled` attribute present
5. Verify **Default Labor to Hourly** checkbox is **unchecked** -> `aria-checked="false"`, enabled
6. Verify **Default New Job to 1 Day** has 3 sub-checkboxes: **Event** (unchecked), **Outside** (unchecked), **Internal** (unchecked) -> All `aria-checked="false"`

**Expected**: All checkboxes unchecked by default; Use Equipments QC disabled when Use Fulfillment unchecked
**Automatable**: Yes

---

## TC-LOS-BAS-012: Misc Settings — Use Fulfillment Toggle + Cascade to Use Equipments QC

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Misc Settings section visible
2. Verify **Use Equipments QC** is **disabled** -> Has `disabled` attribute
3. Click **Use Fulfillment** checkbox -> Checkbox becomes checked (`aria-checked="true"`)
4. Verify **Use Equipments QC** is now **enabled** (no `disabled` attribute) -> Cascade effect
5. Verify Save button is **enabled** -> Edit detected
6. **Cleanup**: Uncheck **Use Fulfillment** -> Use Equipments QC becomes disabled again

**Expected**: Checking Use Fulfillment enables Use Equipments QC; unchecking disables it
**Automatable**: Yes

---

## TC-LOS-BAS-013: Misc Settings — Use Fulfillment Save and Persist

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Misc Settings visible
2. Click **Use Fulfillment** checkbox -> Becomes checked
3. Click **Save** -> Shared "Save Changes" dialog appears
4. Click **Save** in dialog -> Save completes
5. Reload page -> Page reloads fresh
6. Verify **Use Fulfillment** is **checked** -> `aria-checked="true"`
7. Verify **Use Equipments QC** is **enabled** -> Cascade persisted
8. **Cleanup**: Uncheck Use Fulfillment, save, confirm

**Expected**: Use Fulfillment checked state persists; Use Equipments QC enabled on reload
**Automatable**: Yes

---

## TC-LOS-BAS-014: Misc Settings — Default Labor to Hourly Toggle, Save, Persist

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Misc Settings visible
2. Verify **Default Labor to Hourly** is **unchecked** -> `aria-checked="false"`
3. Click **Default Labor to Hourly** -> Becomes checked (`aria-checked="true"`)
4. Click **Save** -> Shared "Save Changes" dialog appears
5. Click **Save** in dialog -> Save completes
6. Reload page -> Page reloads fresh
7. Verify **Default Labor to Hourly** is **checked** -> Persisted
8. **Cleanup**: Uncheck, save, confirm

**Expected**: Default Labor to Hourly toggle persists after save and reload
**Automatable**: Yes

---

## TC-LOS-BAS-015: Misc Settings — Phone 1 Required: Empty Triggers Validation

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Validation | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Misc Settings visible
2. Note current **Phone 1** value (non-empty by default for 1604)
3. Clear **Phone 1** field completely -> Field empty
4. Tab out of field -> Field gets `aria-invalid="true"`
5. Verify Save button is **disabled** -> Cannot save empty required field
6. **Cleanup**: Type original phone value back

**Expected**: Empty Phone 1 triggers aria-invalid and disables Save
**Automatable**: Yes

---

## TC-LOS-BAS-016: Misc Settings — Phone 1 No Format Validation

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Validation | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Misc Settings visible
2. Clear **Phone 1** and type `not-a-phone` -> Field shows text
3. Tab out -> Field does NOT get `aria-invalid` -> No format validation, only required check
4. Verify Save button is **enabled** -> Non-empty value accepted
5. **Cleanup**: Restore original phone value

**Expected**: Phone 1 has no format validation; any non-empty text is accepted | **Data**: input="not-a-phone"
**Automatable**: Yes

---

## TC-LOS-BAS-017: Misc Settings — Phone 1 Edit, Save, Persist

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Misc Settings visible
2. Note current **Phone 1** value
3. Clear **Phone 1** and type `555-123-4567` -> Field shows new number
4. Click **Save** -> Shared "Save Changes" dialog appears
5. Click **Save** in dialog -> Save completes
6. Reload page -> Verify **Phone 1** = "555-123-4567" -> Persisted
7. **Cleanup**: Restore original value and save

**Expected**: Valid phone number persists after save and reload | **Data**: Phone 1 = "555-123-4567"
**Automatable**: Yes

---

## TC-LOS-BAS-018: Misc Settings — Phone 1 Error Recovery

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Clear **Phone 1** -> aria-invalid, Save disabled
2. Type valid phone number `555-000-1111` -> `aria-invalid` removed
3. Verify Save button is **enabled** -> Can save after recovery

**Expected**: Entering valid phone after error clears validation and re-enables Save
**Automatable**: Yes

---

## TC-LOS-BAS-019: Misc Settings — Phone 2 Optional (Empty Valid)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Misc Settings visible
2. Clear **Phone 2** field completely -> Field empty
3. Tab out -> Field does NOT get `aria-invalid` -> Optional field
4. Verify Save button is **enabled** (if other changes present) -> Empty Phone 2 valid

**Expected**: Phone 2 is optional; empty value does not trigger validation error
**Automatable**: Yes

---

## TC-LOS-BAS-020: Misc Settings — Default New Job to 1 Day Sub-Checkboxes

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Misc Settings visible
2. Verify 3 sub-checkboxes under **Default New Job to 1 Day**: **Event**, **Outside**, **Internal** -> All present
3. Click **Event** checkbox -> Becomes checked (`aria-checked="true"`)
4. Click **Outside** checkbox -> Becomes checked
5. Click **Internal** checkbox -> Becomes checked
6. Verify Save button is **enabled** -> Changes detected
7. **Cleanup**: Uncheck all three

**Expected**: Each sub-checkbox toggles independently; each toggle enables Save
**Automatable**: Yes

---

## TC-LOS-BAS-021: Misc Settings — Default Order Type Dropdown (2 Options)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Misc Settings visible
2. Verify **Default Order Type** dropdown default value = "Event" -> Combobox shows "Event"
3. Click dropdown to open -> 2 options visible: **Event**, **Outside**
4. Select **Outside** -> Dropdown shows "Outside"
5. Verify Save button is **enabled** -> Change detected
6. **Cleanup**: Select "Event" to restore

**Expected**: Default Order Type has exactly 2 options (Event, Outside); default is Event
**Automatable**: Yes

---

## TC-LOS-BAS-022: Misc Settings — Default Order Type Save and Persist

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Misc Settings visible
2. Change **Default Order Type** from "Event" to "Outside" -> Dropdown shows "Outside"
3. Click **Save** -> Shared "Save Changes" dialog appears
4. Click **Save** in dialog -> Save completes
5. Reload page -> Verify **Default Order Type** = "Outside" -> Persisted
6. **Cleanup**: Change back to "Event" and save

**Expected**: Default Order Type selection persists after save and reload | **Data**: from Event to Outside
**Automatable**: Yes

---

## TC-LOS-BAS-023: Misc Settings — PO Number Field Edit, Save, Persist

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Misc Settings visible
2. Note current **PO Number** value (default empty for 1604)
3. Clear and type `PO-TEST-123` -> Field shows "PO-TEST-123"
4. Click **Save** -> Shared "Save Changes" dialog appears
5. Click **Save** in dialog -> Save completes
6. Reload page -> Verify **PO Number** = "PO-TEST-123" -> Persisted
7. **Cleanup**: Restore original value and save

**Expected**: PO Number text persists after save and reload | **Data**: PO Number = "PO-TEST-123"
**Automatable**: Yes

---

## TC-LOS-BAS-024: Misc Settings — PO Number Label Field Edit, Save, Persist

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Misc Settings visible
2. Note current **PO Number Label** value (default empty for 1604)
3. Clear and type `Purchase Order #` -> Field shows "Purchase Order #"
4. Click **Save** -> Shared "Save Changes" dialog appears
5. Click **Save** in dialog -> Save completes
6. Reload page -> Verify **PO Number Label** = "Purchase Order #" -> Persisted
7. **Cleanup**: Restore original value and save

**Expected**: PO Number Label text persists after save and reload | **Data**: PO Number Label = "Purchase Order #"
**Automatable**: Yes

---

## TC-LOS-BAS-025: Section Configuration — Default Active Sections Count

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Tab panel visible
2. Scroll to **Section Configuration** table -> Table visible
3. Count total rows -> 13 rows present
4. For each row, verify **Use Section** column has SVG checkmark (`lucide lucide-check text-primary`) -> All 13 active
5. Verify section names: Audio Visual, Business Center, Decor, Electrical, Event Technology, Floral, Food & Beverage, Internet/Telecom, Lighting, Production & Staging, Rigging, Signage & Graphics, Specialty

**Expected**: 13 sections all active (checkmark present) | **Data**: location=1604
**Automatable**: Yes

---

## TC-LOS-BAS-026: Section Configuration — Toggle Section Active/Inactive

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Section Configuration visible
2. Click the **Use Section** checkbox for first section (e.g., Audio Visual) -> SVG checkmark disappears (section inactive)
3. Verify Save button is **enabled** -> Change detected
4. **Cleanup**: Click checkbox again to restore checkmark

**Expected**: Clicking Use Section toggles between active (checkmark) and inactive (no checkmark)
**Automatable**: Yes

---

## TC-LOS-BAS-027: Section Configuration — Edit Section Name

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Section Configuration visible
2. Click on a section name cell (e.g., "Audio Visual") -> Cell becomes editable
3. Clear and type `AV Services` -> Cell shows "AV Services"
4. Verify Save button is **enabled** -> Change detected
5. **Cleanup**: Clear and type `Audio Visual` to restore

**Expected**: Section names are editable inline; edits enable Save button
**Automatable**: Yes

---

## TC-LOS-BAS-028: Section Configuration — Add New Section

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Section Configuration visible
2. Click **Add** button below the table -> New empty row added at bottom
3. Type section name `Test Section` in new row -> Row shows "Test Section"
4. Verify new row has Use Section checkmark by default -> Active
5. Verify Save button is **enabled** -> Change detected
6. **Cleanup**: Remove the new row or reload without saving

**Expected**: Add button creates new editable row; new sections are active by default
**Automatable**: Yes

---

## TC-LOS-BAS-029: Section Configuration — Default Button Resets

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Section Configuration visible
2. Toggle a section inactive and rename another -> Changes pending
3. Click **Default** button -> Sections reset to system defaults
4. Verify Save button is **enabled** -> Reset counts as change
5. **Cleanup**: Reload without saving to restore actual saved state

**Expected**: Default button resets section configuration to system defaults
**Automatable**: Yes

---

## TC-LOS-BAS-030: Room Configuration — Empty Table by Default

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Tab panel visible
2. Scroll to **Room Configuration** section -> Table visible
3. Verify table shows "No results." -> Empty for location 1604
4. Verify **Add** button is present -> Can add rooms
5. Verify **Default** button is present -> Can reset

**Expected**: Room Configuration table empty by default for location 1604
**Automatable**: Yes

---

## TC-LOS-BAS-031: Room Configuration — Add New Room

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Room Configuration visible
2. Click **Add** button -> New row added with empty name, Use Room checkmark active
3. Type room name `Ballroom A` -> Row shows "Ballroom A"
4. Verify Save button is **enabled** -> Change detected
5. **Cleanup**: Reload without saving

**Expected**: Add button creates new room row with active checkmark; name is editable
**Automatable**: Yes

---

## TC-LOS-BAS-032: Default Logo — Checkbox Default States

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Tab panel visible
2. Scroll to **Default Logo** section -> Section visible
3. Verify **Use Default Proposal Logo** checkbox -> Check current state (checked/unchecked)
4. Verify **Use Default Convention Services Logo** checkbox -> Check current state
5. Record both states as defaults for location 1604

**Expected**: Logo checkboxes have documented default states | **Data**: location=1604
**Automatable**: Yes

---

## TC-LOS-BAS-033: Default Logo — Company Logo Combobox Options

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Default Logo section visible
2. Click **Company Logo** combobox to open -> Dropdown opens
3. Count and record all options -> 12 options present
4. Verify options include: PSAV, Encore, and venue-specific logos
5. Verify current selected value matches page default
6. Close dropdown without changing

**Expected**: Company Logo combobox has 12 options | **Data**: location=1604
**Automatable**: Yes

---

## TC-LOS-BAS-034: Default Logo — Preview Image Updates on Selection

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Default Logo section visible
2. Note current **Company Logo** selection and preview image `src` attribute
3. Change **Company Logo** to a different option -> Selected option changes
4. Verify logo preview image `src` attribute changed -> Different image URL
5. **Cleanup**: Restore original selection

**Expected**: Changing Company Logo updates the preview image
**Automatable**: Yes

---

## TC-LOS-BAS-035: Discount Exemptions — Service Type Toggles

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Tab panel visible
2. Scroll to **Discount Exemptions** section -> Section visible
3. Verify table has columns: **Service Type**, **Exempt** (checkbox)
4. Count service types with Exempt checked -> Record count
5. Toggle one unchecked service type to checked -> Checkmark appears
6. Verify Save button is **enabled** -> Change detected
7. **Cleanup**: Toggle back to unchecked

**Expected**: Exempt checkboxes toggle independently; changes enable Save
**Automatable**: Yes

---

## TC-LOS-BAS-036: Save Dialog — Exact Content and Buttons

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Make any edit (e.g., change date offset to -2)
2. Click **Save** -> Shared "Save Changes" dialog appears
3. Verify dialog heading = "Save Changes" -> Exact text
4. Verify dialog body = "Are you sure you want to save the changes?" -> Exact text
5. Verify two buttons: **Cancel** and **Save** -> Both present
6. Click **Cancel** -> Dialog closes, changes NOT saved, Save button still enabled
7. **Cleanup**: Reload without saving

**Expected**: Save uses shared "Save Changes" dialog with Cancel/Save buttons; Cancel dismisses dialog
**Automatable**: Yes

---

## TC-LOS-BAS-037: Unsaved Changes Dialog — Stay Keeps Changes

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Make any edit
2. Click **Location Settings History** tab to navigate away -> Unsaved changes dialog appears
3. Verify dialog text = "Are you sure you want to leave this view? Any unsaved changes will be lost." -> Exact text
4. Click **Stay** -> Dialog closes, remain on Basic Information tab
5. Verify pending edit is still present -> Changes preserved
6. **Cleanup**: Reload without saving

**Expected**: Stay button keeps user on current tab with pending changes intact
**Automatable**: Yes

---

## TC-LOS-BAS-038: Unsaved Changes Dialog — Discard Leaves

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Make any edit
2. Click **Location Settings History** tab -> Unsaved changes dialog appears
3. Click **Discard** -> Navigates to History tab, changes lost
4. Click **Basic Information** tab -> Return to Basic Information
5. Verify field has original value (edit was discarded) -> Changes not persisted

**Expected**: Discard button navigates away and discards all unsaved changes
**Automatable**: Yes

---

## TC-LOS-BAS-039: Boundary — XSS Input in Text Fields

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Boundary | Yes |

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Misc Settings visible
2. Clear **PO Number** and type `<script>alert(1)</script>` -> Text entered
3. Tab out -> Verify field does NOT execute script (no alert)
4. If Save is enabled, save and reload -> Verify stored as plain text, no execution
5. **Cleanup**: Clear PO Number and restore original value

**Expected**: XSS payload stored as plain text or rejected; never executed | **Data**: input=`<script>alert(1)</script>`
**Automatable**: Yes

---

## TC-LOS-BAS-040: Empty Section Name — Reverts to Previous Value on Blur

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Functional | Yes |

**Steps**:
1. Reload Basic Info for clean state
2. Get section[0] name (expect "Audio")
3. Edit section[0] to empty string, press Tab
4. Verify name reverted to original "Audio"

**Expected**: Empty section name reverts to previous value | **MCP-1 verified 2026-04-06**

---

## TC-LOS-BAS-041: Whitespace-Only Section Name — Accepted as New Content

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Automated | Boundary | Yes |

**Steps**:
1. Get section[0] name
2. Edit section[0] to `"   "` (whitespace), press Tab
3. Verify name is either whitespace (accepted) or reverted (rejected)
4. Cleanup: restore original name if accepted, reload

**Expected**: Whitespace may be accepted (MCP-3 showed whitespace accepted via Add New) | **MCP-3 verified 2026-04-06**

---

## TC-LOS-BAS-044: Add New Section with Empty Name — Rejected

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Negative | Yes |

**Steps**:
1. Count section rows before
2. Add section with empty name via Add New input, press Tab
3. Count section rows after — expect unchanged

**Expected**: Empty section name via Add New is rejected | **MCP-3 verified 2026-04-06**

---

## TC-LOS-BAS-045: Add New Section with Duplicate Name — Silently Rejected

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Negative | Yes |

**Steps**:
1. Count section rows before
2. Add section with name "Audio" (already exists) via Add New, press Tab
3. Count section rows after — expect unchanged
4. Verify Save is disabled (no change was made)

**Expected**: Duplicate section via Add New is silently rejected, no error icon | **MCP-2 verified 2026-04-06**

---

## TC-LOS-BAS-047: Section Edit — Escape Does NOT Revert

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Automated | Functional | Yes |

**Steps**:
1. Reload for clean state, get section[0] name ("Audio")
2. Type "TEMP CANCEL TEST" into section[0], press Escape
3. Verify name is "TEMP CANCEL TEST" (Escape does NOT revert)
4. Cleanup: restore original name, reload

**Expected**: Escape key does not cancel editing — no custom Escape handler on section inputs | **MCP verified 2026-04-06**

---

## TC-LOS-BAS-048: Room Toggle Round-Trip — Toggle Inactive → Save → Reload → Verify

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Round-trip | Yes |

**Steps**:
1. Reload, ensure room "Room Toggle Test" exists (add if needed, save)
2. Ensure room starts active (toggle + save if inactive from prior run)
3. Toggle room to inactive
4. Save + reload
5. Find room, verify still inactive after reload
6. Cleanup: toggle back to active + save

**Expected**: Room active/inactive toggle persists through save+reload round-trip | **Gap #19**

---

## TC-LOS-BAS-049: Room Edit Name Round-Trip — Rename → Save → Reload → Verify

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Round-trip | Yes |

**Steps**:
1. Reload, ensure room "Room Edit Test" exists (handle prior-run rename to "Room Edit Renamed")
2. Rename room to "Room Edit Renamed"
3. Save + reload
4. Verify "Room Edit Renamed" in room names, "Room Edit Test" absent
5. Cleanup: rename back to original + save

**Expected**: Room name edit persists through save+reload round-trip | **Gap #19**

---

## TC-LOS-BAS-050: Empty Room Name — Revert Behavior

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Functional | Yes |

**Steps**:
1. Reload, count rooms before
2. Add "Conference Room Z" via Add New
3. Edit last room to empty string, press Tab
4. Verify room count unchanged (name reverted or row preserved)
5. Cleanup: reload to discard

**Expected**: Empty room name reverts like sections | **MCP-8 verified 2026-04-06**

---

## TC-LOS-BAS-051: Duplicate Room Name via Add New — Silently Rejected

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Negative | Yes |

**Steps**:
1. Add "Conference Room Z" via Add New, record count
2. Add "Conference Room Z" again via Add New
3. Verify count unchanged

**Expected**: Duplicate room name via Add New is silently rejected | **MCP-4 verified 2026-04-06**

---

## TC-LOS-BAS-053: Positive Value in "Relative to Start" Fields — aria-invalid

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Validation | Yes |

**Steps**:
1. Reload, for each of Prep/Set/Delivery:
   - Type positive value (5, 3, 2)
   - Poll until aria-invalid=true
   - Restore default value
2. Reload after all fields tested

**Expected**: Positive values in "relative to start" fields trigger aria-invalid | **LR-008**

---

## TC-LOS-BAS-054: Negative Value in "Relative to End" Fields — aria-invalid

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Validation | Yes |

**Steps**:
1. For each of Return/Strike/Pickup:
   - Type negative value (-3, -2, -1)
   - Poll until aria-invalid=true
   - Restore default value
2. Reload after all fields tested

**Expected**: Negative values in "relative to end" fields trigger aria-invalid | **LR-008**

---

## TC-LOS-BAS-055: Non-Numeric Input on Return Field — aria-invalid

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Automated | Validation | Yes |

**Steps**:
1. Type "abc" into Return Date Offset, Tab
2. Poll until aria-invalid=true
3. Verify Save disabled
4. Reload to clear Angular model corruption (LR-011)

**Expected**: Non-numeric input triggers aria-invalid on Return field

---

## TC-LOS-BAS-056: Non-Numeric Input on Delivery Field — aria-invalid

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Automated | Validation | Yes |

**Steps**:
1. Type "abc" into Delivery Date Offset, Tab
2. Poll until aria-invalid=true
3. Verify Save disabled
4. Reload to clear Angular model corruption (LR-011)

**Expected**: Non-numeric input triggers aria-invalid on Delivery field

---

## TC-LOS-BAS-061: MaxLen Boundary — 3-Char Field Rejects 4+ Chars

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Automated | Boundary | Yes |

**Steps**:
1. Type "1234" into Prep (maxLen=3)
2. Verify stored length <= 3 (HTML maxlength truncates)
3. Truncated "123" is positive for "relative to start" → aria-invalid
4. Cleanup: restore default, reload

**Expected**: Input truncated to 3 chars; truncated positive value triggers validation

---

## TC-LOS-BAS-062: MaxLen Boundary — 4-Char Field Accepts Value at Limit

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Automated | Boundary | Yes |

**Steps**:
1. Type "-999" into Set (maxLen=4)
2. Verify stored value = "-999"
3. Verify aria-invalid=false (negative is valid for "relative to start")
4. Verify Save enabled
5. Cleanup: restore default, reload

**Expected**: 4-char value at limit accepted; negative value valid for "relative to start" field

---

## TC-LOS-BAS-063: Multi-Field Error Recovery — Cross-Validation Clears After Correction

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Functional | Yes |

**Steps**:
1. Set Delivery = -5 (violates NM-1264: Delivery < Prep(-1))
2. Poll until Delivery aria-invalid=true
3. Verify Save disabled
4. Set Delivery = -1 (LR-009: differs from default 0)
5. Poll until Delivery aria-invalid=false
6. Verify Save enabled
7. Cleanup: restore default, reload

**Expected**: Cross-validation error clears after correction | **NM-1264, LR-009, LR-010**

---

## TC-LOS-BAS-064: Clear Prep Offset — Save, Reload, Verify Empty (NM-1453)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Functional | Yes |

**Steps**:
1. Clear Prep Date Offset, Tab
2. Save + confirm
3. Reload, verify Prep value = "" (not "0")
4. Cleanup: restore to -1, save

**Expected**: Null offset preserved as empty string, not "0" | **MCP-7 verified 2026-04-06, NM-1453**

---

## TC-LOS-BAS-065: Clear Return Offset — Save, Reload, Verify Empty (NM-1453)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Functional | Yes |

**Steps**:
1. Clear Return Date Offset, Tab
2. Save + confirm
3. Reload, verify Return value = "" (not "0")
4. Cleanup: restore to 1, save

**Expected**: Null offset preserved as empty string | **NM-1453**

---

## TC-LOS-BAS-066: Clear Prep But Keep Delivery — No Cross-Validation Error

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Automated | Functional | Yes |

**Steps**:
1. Reload, clear Prep (default -1)
2. Leave Delivery at default (0)
3. Poll: Delivery should NOT be aria-invalid (NM-1264 skipped when Prep is null)
4. Verify Save enabled (Prep was changed)
5. Cleanup: reload to discard

**Expected**: NM-1264 not triggered when Prep is null | **MCP-7 verified**

---

## TC-LOS-BAS-067: Clear All 6 Offsets — Save, Reload, All Empty (NM-1453)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Functional | Yes |

**Steps**:
1. Reload, clear all 6 date offsets
2. Save + confirm
3. Reload, verify all 6 values = "" (not "0")
4. Cleanup: restore all defaults, save

**Expected**: All null offsets preserved as empty after bulk clear | **NM-1453**

---

## BLOCKED / NOT-AUTOMATABLE / DEFERRED TCs (2026-04-06)

| TC ID | Gap | Status | Reason |
|-------|-----|--------|--------|
| BAS-042 | #18 | NOT APPLICABLE | Duplicate section via rename has NO validation on live app (v1 spec not implemented) |
| BAS-043 | #18 | NOT APPLICABLE | Recovery from duplicate icon — no icon exists (see BAS-042) |
| BAS-046 | #18 | NOT-AUTOMATABLE | No delete UI for sections (MCP-9 verified 2026-04-06) |
| BAS-052 | #19 | NOT-AUTOMATABLE | No delete UI for rooms (MCP-9 verified 2026-04-06) |
| BAS-057 | #20 | PLAN INVALIDATED | Set < Delivery cross-validation NOT IMPLEMENTED in Angular (MCP-5). Plan assumed Validate() path existed. |
| BAS-058 | #20 | PLAN INVALIDATED | Return < Pickup cross-validation NOT IMPLEMENTED (MCP-6). Plan path 6 assumption invalid. |
| BAS-059 | #20 | PLAN INVALIDATED | Strike < Return cross-validation NOT IMPLEMENTED (MCP-6). Plan path 6 assumption invalid. |
| BAS-060 | #20 | PLAN INVALIDATED | Pickup >= Strike cross-validation NOT IMPLEMENTED (MCP-5/6). Plan path 5/6 assumption invalid. |

### Validate() Path Coverage — Plan vs Reality

The audit plan defined 8 Validate() paths. MCP verification proved only **NM-1264** (Delivery >= Prep) is wired in the Angular implementation. The other cross-validators (Set/Delivery, Return/Strike, Return/Pickup, Pickup/Strike) are described in v1 spec but **not implemented** in the live app.

| Path | Plan Claim | Actual Status |
|------|-----------|---------------|
| 1 | Covered by BAS-066 + BAS-057 | BAS-066 ✅, BAS-057 INVALIDATED (Set >= Delivery not enforced) |
| 2 | Covered by BAS-007 + BAS-057 | BAS-007 ✅ (NM-1264 only), BAS-057 INVALIDATED |
| 3 | P2 DEFERRED | INVALIDATED — requires unimplemented Set >= Prep check |
| 4 | Covered by BAS-007 | ✅ NM-1264 only live path |
| 5 | Covered by BAS-060 | INVALIDATED — Pickup >= Strike not enforced |
| 6 | Covered by BAS-058/059/060 | INVALIDATED — all 3 cross-validators missing |
| 7 | P2 DEFERRED | INVALIDATED |
| 8 | P2 DEFERRED | INVALIDATED |

**Effective coverage**: Path 4 (NM-1264 only) is the sole live cross-validation path. Covered by BAS-007. Path 1 partially covered (BAS-066 tests null-Prep behavior). All other paths test validators that don't exist.

---

# Location Settings History Test Cases

## FIELD INVENTORY — Location Settings History Tab

| Field | Type | Default (1604) | State | data-testid |
|---|---|---|---|---|
| History Type Selector | combobox | Location Management History | enabled; 2 options | `local-office-settings-history-select-type` |
| History Table | table | "No results." (empty) | read-only | `local-office-settings-history-table` |
| Rows Per Page | combobox | 20 | enabled | (no data-testid — pagination control) |
| First/Prev/Next/Last Page | buttons | all disabled (1 page) | disabled when empty | (no data-testid — pagination nav) |

**History Type Options**: Location Management History, Location Management Legacy History

**Column Headers (42 total)**: Local Office, Prep Date Offset, Return Date Offset, Set Date Offset, Strike Date Offset, Pickup Date Offset, Delivery Date Offset, Use Fulfillment, Use Availability, Use Equipment QC, Print Desc, Use Subrent, Phone1, Phone2, Use Sect., Section Name, Sect. Action, Logo Name, Use On Quote, Use On Rental, Service Type - Exempt, ST Action, Action, Notes, Marriott PMS Account Enabled, Default Job to 1 day for Event Orders, Default Job to 1 day for Outside Orders, Default Job to 1 day for Internal Orders, Default Labor to Hourly, Allow tentative and confirmed Status to have the same priority, Items Filled from Requests Return to Availability, Default Order Type, Regular Hours, Regular Hours Multiplier, Over Time Hours, OverTime Hours Multiplier, Double Time Hours, DoubleTime Hours Multiplier, Holiday Multiplier, Recalc Labor Hours, Modified By, Modified On

**Sortable Columns**: All except Local Office, Section Name, Service Type - Exempt, Notes (those have plain text, no sort button)

---

## TC-LOS-HIS-001: History Tab — Navigation and Default View

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to `/navigator/locations/1604/settings/local-office` -> Page loads with Basic Information tab active
2. Click **Location Settings History** tab -> Tab becomes selected (`aria-selected="true"`)
3. Verify **History Type Selector** combobox is visible with default value "Location Management History" -> Combobox displayed
4. Verify history table container is visible -> Table with column headers and data/empty state

**Expected**: Clicking History tab shows history type selector and data table
**Automatable**: Yes

---

## TC-LOS-HIS-002: History Tab — Column Headers (42 Columns)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to History tab -> Tab panel visible
2. Verify table has exactly 42 column headers -> Count matches
3. Verify first columns: **Local Office**, **Prep Date Offset**, **Return Date Offset**, **Set Date Offset**, **Strike Date Offset** -> Present in order
4. Verify last columns: **Holiday Multiplier**, **Recalc Labor Hours**, **Modified By**, **Modified On** -> Present in order

**Expected**: History table shows all 42 expected column headers | **Data**: location=1604
**Automatable**: Yes

---

## TC-LOS-HIS-003: History Tab — Table Populated for Office 1604

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to History tab -> Table visible
2. Verify table body contains at least one data row (not "No results.") -> Populated state

**Expected**: Office 1604 has history records; `isHistoryTableEmpty()` returns `false`
**Automatable**: Yes

**MCP_VERIFICATION_LOG**: [MCP-VERIFIED 2026-04-13, SUBPLAN_HISTORY_01_MCP_FINDINGS.md §2] Office 1604 Local Office History has 61 pages (~1204 rows). Original "Empty State for Location 1604" assertion was factually wrong — rewritten 2026-04-15 per PLAN_HIST_TC_LOS_HIS_003_FIX (Path A / FIX). Spec already uses corrected assertion since commit 87f80cc.

---

## TC-LOS-HIS-004: History Tab — History Type Selector Options

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to History tab -> History Type Selector visible
2. Click **History Type Selector** combobox to open dropdown -> Dropdown options visible
3. Verify exactly 2 options: **Location Management History** (selected), **Location Management Legacy History** -> Both present
4. Close dropdown without selecting -> Original selection maintained

**Expected**: History Type Selector has 2 options; default is "Location Management History"
**Automatable**: Yes

---

## TC-LOS-HIS-005: History Tab — Pagination Controls

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to History tab -> Pagination area visible below table
2. Verify **Rows Per Page** combobox shows "20" -> Default page size
3. Verify page indicator text "1 / 1" -> Current page and total pages
4. Verify 4 navigation buttons: **Go to first page**, **Go to previous page**, **Go to next page**, **Go to last page** -> All present

**Expected**: Pagination controls present with default 20 rows per page, all nav disabled when no data
**Automatable**: Yes

---

## TC-LOS-HIS-006: History Tab — No Save Button (Read-Only)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to History tab -> Tab panel visible
2. Verify no **Save** button exists on this tab -> No save button in tab content
3. Verify no editable fields (textboxes, checkboxes) exist -> Tab is read-only audit log

**Expected**: History tab is read-only; no Save button or editable fields
**Automatable**: Yes

---

## TC-LOS-HIS-007: History Tab — Column Sorting Buttons

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to History tab -> Table with column headers visible
2. Verify sortable columns have sort buttons (e.g., **Prep Date Offset**, **Modified By**, **Modified On**) -> Button elements inside columnheaders
3. Verify non-sortable columns (**Local Office**, **Section Name**, **Service Type - Exempt**, **Notes**) have plain text, no sort button -> No button child
4. Click a sort button (e.g., **Modified On**) -> Sort icon changes direction (ascending/descending indicator)

**Expected**: 38 columns have sort buttons; 4 columns are plain text (not sortable)
**Automatable**: Yes

---

# ECT Settings Test Cases

## MCP_VERIFICATION_LOG — ECT Settings Tab

| Field | Value |
|-------|-------|
| Date | 2026-03-23 |
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
| Labor Cost Input (per row) | textbox | varies (24.44-50.00) | editable; `ect-settings-input-labor-cost-{0..65}` | indexed |
| SubRental Matrix Table | table | 9 rows, 4 columns | read-only | `ect-settings-table-sub-rental-matrix` |

---

## TC-LOS-ECT-001: ECT Tab — Navigation and Header Display

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to `/navigator/locations/1604/settings/local-office` -> Page loads
2. Click **ECT Settings** tab -> Tab becomes selected (`aria-selected="true"`)
3. Verify heading reads "1604 - Parker Palm Springs" (h6) -> Location name displayed
4. Verify **Edit/View** label with **Commission structure** link -> Link present and clickable
5. Verify **Select Currency** combobox shows "USD" -> Default currency

**Expected**: ECT tab displays location name, commission link, and currency selector
**Automatable**: Yes

---

## TC-LOS-ECT-002: ECT Tab — Currency Selector (Single Option)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Steps**:
1. Navigate to ECT Settings tab -> Tab panel visible
2. Click **Select Currency** combobox to open dropdown -> Options visible
3. Verify exactly 1 option: **USD** -> Only USD available
4. Close dropdown -> No change

**Expected**: Currency selector has only USD option for location 1604
**Automatable**: Yes

---

## TC-LOS-ECT-003: ECT Tab — Event Profit Target Table (Read-Only)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

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

**Steps**:
1. Navigate to ECT Settings tab -> Tab panel visible
2. Verify **Save** button for Fixed Costs section exists and is **disabled** -> `data-testid="ect-settings-btn-save-fixed-costs-btn"`
3. Verify **Save** button for Labor Costs section exists and is **disabled** -> `data-testid="ect-settings-btn-save-labor-costs-btn"`
4. Edit **Benefits Multiplier** (Fixed Costs) -> Fixed Costs Save becomes **enabled**, Labor Costs Save stays **disabled**
5. **Cleanup**: Restore original value

**Expected**: Each section has its own Save button; editing one section only enables that section's Save
**Automatable**: Yes

---

## TC-LOS-ECT-008: ECT Tab — Labor Cost Assumptions Table Structure

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Steps**:
1. Navigate to ECT Settings tab -> Scroll to **Labor Cost Assumptions** section
2. Verify heading "Labor Cost Assumptions" (h4) -> Heading present
3. Verify table has 2 columns: **Labor Class**, **Labor Cost** -> Headers match
4. Verify table has 66 data rows -> Row count = 66
5. Verify first row: "Administrative Fee" | "35.00" -> Data matches
6. Verify last row: "zzzFinishing Service" | "37.10" -> Data matches
7. Verify **Labor Class** column is read-only, **Labor Cost** column has editable textboxes -> Only costs editable

**Expected**: Labor Cost Assumptions table has 66 rows; Labor Class read-only, Labor Cost editable
**Automatable**: Yes

---

## TC-LOS-ECT-009: ECT Tab — Labor Cost Edit, Save, Persist

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

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

## TC-LOS-ECT-010: ECT Tab — Labor Cost Non-Numeric Input Reverts

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Validation | Yes |

**Steps**:
1. Navigate to ECT Settings tab -> Labor Cost Assumptions visible
2. Click **Administrative Fee** labor cost cell -> Value "35" shown
3. Clear and type `abc` -> Non-numeric text entered
4. Tab out -> Field reverts to original "35.00" (no error message, no aria-invalid)
5. Verify Save button state -> May or may not be enabled (field silently reverted)

**Expected**: Non-numeric input in labor cost field silently reverts to original value; no validation error displayed
**Automatable**: Yes

---

## TC-LOS-ECT-011: ECT Tab — SubRental Matrix Table (Read-Only)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

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

**Steps**:
1. Read current Historical Subrental value (defensive — don't assume default)
2. Pick test value different from current (e.g., if 0.0% → fill 0.1; if already changed → fill 0)
3. Save Fixed Costs → wait for save button disabled
4. Navigate to Basic Info → return to ECT
5. Verify display shows expected percent
6. Restore: fill original raw value → save → verify restored

**Expected**: Historical Subrental % persists across save-reload cycle
**Automatable**: Yes

---

## TC-LOS-ECT-014: Labor Cost Middle Row (Index 33) — Persistence (RT)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Round-Trip / BVA | Yes |

**Steps**:
1. Navigate to ECT tab
2. Read current labor cost value at row index 33
3. Pick different test value
4. Fill → save Labor Costs → navigate away → return → verify persisted
5. Restore original value

**Expected**: Labor cost middle row (index 33) persists correctly; data-driven with TC-015
**Automatable**: Yes

---

## TC-LOS-ECT-015: Labor Cost Last Row (Index 65) — Persistence (RT)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Round-Trip / BVA | Yes |

**Steps**:
1. Navigate to ECT tab
2. Read current labor cost value at row index 65 (last row of 66-row table)
3. Pick different test value
4. Fill → save Labor Costs → navigate away → return → verify persisted
5. Restore original value

**Expected**: Labor cost last row (index 65) persists correctly; exercises scroll + BVA upper boundary
**Automatable**: Yes

---

## TC-LOS-ECT-016: Multi-field Fixed Costs — Single Save Persists Both (RT)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Round-Trip | Yes |

**Steps**:
1. Read current BM and HS values
2. Edit both Benefits Multiplier and Historical Subrental %
3. Single save (Fixed Costs)
4. Full page reload → navigate to ECT
5. Verify both values persisted
6. Restore both → single save → verify restored

**Expected**: Editing both BM and HS then saving once persists BOTH values
**Automatable**: Yes

---

## TC-LOS-ECT-017: Discard Unsaved Changes — No Persistence (State Transition)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | State Transition / Negative RT | Yes |

**Steps**:
1. Read current BM value (baseline)
2. Fill BM with different value (dirty the form)
3. Click Basic Info tab directly (triggers unsaved changes dialog)
4. Click Discard on the dialog
5. Navigate back to ECT
6. Verify BM is unchanged (original value)

**Expected**: Discarding unsaved changes prevents persistence; Angular dirty guard fires correctly on ECT tab
**Automatable**: Yes

---

# Integration: History Verification Test Cases

> **Purpose**: Verify that saves from other tabs produce correct rows in Location Settings History (42-column table).
> **Data source**: SUBPLAN_HISTORY_01_MCP_FINDINGS.md — all expected formats verified via MCP 2026-04-13.
> **Pre-requisite**: Saves from BAS and ECT tabs must have completed successfully before running these TCs.
> **History detection**: Local Office History uses SVG `lucide-check` icons for booleans (check via `innerHTML.includes('lucide-check')`).

---

## TC-LOS-BAS-HIST: Basic Info Saves — History Row Verification

| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| High | Automated | Integration | Yes | tests/specs/setup/local-office/local-office-settings.spec.ts:839 |

**Completed saves to verify** (from BAS spec): TC-LOS-BAS-005 (PrepDateOffset), TC-LOS-BAS-013 (UseFulfillment), TC-LOS-BAS-014 (DefaultLaborToHourly), TC-LOS-BAS-017 (Phone1), TC-LOS-BAS-022 (DefaultOrderType), TC-LOS-BAS-023 (PoNumber), TC-LOS-BAS-024 (PoNumberLabel), TC-LOS-BAS-039 (PoNumber XSS), TC-LOS-BAS-048 (Room Toggle), TC-LOS-BAS-049 (Room Rename), TC-LOS-BAS-064 (PrepDateOffset cleared), TC-LOS-BAS-065 (ReturnDateOffset cleared), TC-LOS-BAS-067 (all 6 offsets cleared)

**Steps**:
1. After all BAS save TCs complete, capture current pagination total on History tab -> Record `rowCountBefore`
2. Navigate to History tab -> Tab loads with table
3. Verify new rows exist: pagination total > `rowCountBefore` -> Row count increased by number of completed saves
4. Verify latest row (row 1) has Modified On timestamp within ±5 minutes of test run time -> Recent timestamp present
5. Verify latest row Modified By matches test user -> User identity recorded
6. Spot-check at least 3 field values from latest save against expected:
   - Verify Prep Date Offset column value matches last saved value -> Value matches
   - Verify Use Fulfillment column = SVG checkmark (if toggled ON) or empty (if OFF) -> Boolean format correct
   - Verify Default Order Type column matches last saved value -> Value matches

**Expected**: Each BAS save produced exactly 1 new history row. Field values match saved values. Boolean columns use SVG `lucide-check` icons. Timestamps are in MM/DD/YYYY HH:MM:SS AM/PM format.
**Data**: location=1604 | Formats per SUBPLAN_HISTORY_01_MCP_FINDINGS.md §2-§3
**Automatable**: Yes
**Notes**: NOT-TRACKED fields (PO Number, PO Number Label, Room toggle) are explicitly excluded — saves including those fields still produce a history row, but those columns don't exist in the 42-column table.

**MCP_VERIFICATION_LOG**:
- Expected: 1 save = 1 new row (snapshot model); SVG `lucide-check` boolean; MM/DD/YYYY HH:MM:SS AM/PM timestamp; PO Number / PO Number Label / Room toggle are NOT-TRACKED (no column in 42)
- Source: SUBPLAN_HISTORY_01_MCP_FINDINGS.md §2 lines 152-218 (42-col structure + formats + SVG boolean detection pattern), §3 lines 247-257 (LO Basic Info single-field + multi-field causality — snapshot model proven), §4 lines 270-276 (tab refresh on save), §8 lines 325-332 (NOT-TRACKED registry for LO: PO Number, PO Number Label, Room toggle/rename)
- Session: 2026-04-13 14:42–15:04 UTC (Office 1604)
- Verified: ✅

---

## TC-LOS-ECT-HIST: ECT Saves — History Row Verification

| Priority | Status | Type | Automatable | Automation File |
|----------|--------|------|-------------|-----------------|
| High | Automated | Integration | Yes | tests/specs/setup/local-office/local-office-ect.spec.ts:248 |

**Completed saves to verify** (from ECT spec): TC-LOS-ECT-005 (BenefitsMultiplier), TC-LOS-ECT-009 (LaborCost row), TC-LOS-ECT-013 (HistoricalSubrental), TC-LOS-ECT-014 (LaborCost Middle Row), TC-LOS-ECT-015 (LaborCost Last Row), TC-LOS-ECT-016 (BenefitsMultiplier + HistoricalSubrental)

**Steps**:
1. After all ECT save TCs complete, reload page to reset Angular dirty state (LR-026)
2. Navigate to History tab -> Tab loads
3. Sort by Modified On descending
4. Scan top 13 rows: verify Modified By and Modified On are non-empty for each row
5. Count rows with today's date prefix in Modified On -> `todayRowCount`
6. Assert todayRowCount >= 10 (rows come from all save sources — BAS + ECT suite activity)

**Expected**: History rows from today's test suite exist. ECT editable field values (BenefitsMultiplier, HistoricalSubrental, LaborCost) have NO corresponding columns in the 42-column history table (NOT-TRACKED per SP1 §8). Test verifies row existence and metadata only — no ECT-specific field assertions.
**Data**: location=1604 | Formats per SUBPLAN_HISTORY_01_MCP_FINDINGS.md §2
**Automatable**: Yes
**Notes**: ECT saves confirmed NOT-TRACKED by MCP (SP1 §3.5). Test verifies metadata integrity across the suite's combined history output, not ECT-specific causality.

**MCP_VERIFICATION_LOG**:
- Expected: ECT editable field saves produce ZERO new history rows (causal claim)
- Source (structural): SUBPLAN_HISTORY_01_MCP_FINDINGS.md §2 lines 157-202 (42-col header list shows cols 33-40 are read-only ECT globals, not editable fields); §8 lines 325-332 (NOT-TRACKED registry lists BenefitsMultiplier, HistoricalSubrental, LaborCost)
- Source (causal): SUBPLAN_HISTORY_01_MCP_FINDINGS.md §3.5 (ECT Causality, added 2026-04-15) — BenefitsMultiplier 20.0%→21.0%→20.0% test cycle confirmed ZERO new history rows
- Session: 2026-04-15 09:36–09:41 UTC (Office 1604, WATCHDOG follow-up MCP per PLAN_HIST_SP2_PER_TC_MCP_AUDIT.md)
- Evidence: rowCountBefore=64 pages → rowCountAfter=64 pages (after 2 ECT saves); top-row Modified On unchanged at 04/15/2026 08:43:18 AM (the prior Basic Info save row); save fired confirmed via fetch interception → POST /navigator/api/location/ect-settings at 09:39:03Z. ECT save bypasses the "Save Changes" confirmation dialog (immediate save, unlike Basic Info Cancel/Save dialog).
- Verified: ✅