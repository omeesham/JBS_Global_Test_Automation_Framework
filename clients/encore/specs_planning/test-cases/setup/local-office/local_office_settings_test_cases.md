# Local Office Settings — Basic Information Test Cases — **Module**: local-office | **Total**: 60 | **Status**: Automated

**Module**: local-office

**URL**: `/navigator/locations/{officeId}/settings/local-office` (Basic Information tab)
**Spec**: `specs/local-office/local-office-settings.spec.ts`
**Location tested**: 1604 (Parker Palm Springs, USA)
**Updated**: 
**Scope**: Basic Information tab only — 60 TCs (TC-LOS-BAS-*)
**Selector file**: `src/selectors/locations/local-office-settings.ts`
**Sibling test cases**: [HIS](local_office_history_test_cases.md) · [ECT](local_office_ect_test_cases.md)

**Split note**: This file was split from the combined `local_office_settings_test_cases.md` to match the 1:1 spec→md convention used by the locations module (the underlying spec breakdown landed in commit f721e15,). Sibling files: [HIS](local_office_history_test_cases.md), [ECT](local_office_ect_test_cases.md). All TC IDs and `Depends_On` fields preserved verbatim.

---

| Field | Value |
|-------|-------|
| Date | |
| URL | https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/local-office |
| Office/Entity | 1604 (Parker Palm Springs) |
| Total fields found | 36 (6 offsets + 9 checkboxes + 3 job-day checkboxes + 1 labor-hourly + 2 phones + 1 combobox + 2 PO inputs + 1 Use Section + 1 Default btn + sections table + rooms table + 2 logo checkboxes + 1 logo combobox + 1 logo preview + exemptions table) |
| Total fields tested (edit+save) | 12 (Use Fulfillment, Delivery offset, Prep non-numeric, Phone 1 empty/XSS/valid, Default Labor to Hourly, Default Order Type options, Logo combobox, Unsaved changes dialog) |
| Save dialog | Shared "Save Changes" dialog on Save click: alertdialog "Save Changes" / "Are you sure you want to save the changes?" / Cancel + Save buttons. Unsaved changes dialog on tab-switch: alertdialog "Unsaved changes" / "Are you sure you want to leave this view? Any unsaved changes will be lost." / Stay + Discard buttons |
| Column headers | Sections: Section Name, Active. Rooms: Room Configuration Name, Active. Exemptions: Service Type, Exempt |
| Dropdown options | Default Order Type: [Event, Outside] (2 options — Internal NOT present). Company Logo: [Header with Dust Ears and Text, PSAV Presentation Services (V3), PSAV DEG Red Bar(V2), SAV_Cropped, SAVLogoNew, Concise New York Logo Orig, CSI Logo, Concise New York Logo, Encore Blue Logo, Encore New Logo, Concise New Logo Large, DISNEY NEW Logo] (12 options) |
| Cascade behaviors | Use Fulfillment checked -> Use Equipments QC enabled. Use Fulfillment unchecked -> QC disabled. |
| Input attribute types | Date offsets: type=text, name=prepDateOffsetHours etc. Phone 1: type=text, name=contactPhone1. PO Number/Label: type=text, no name. |
| Validation error patterns | Date offsets: aria-invalid=true on non-numeric, violation, or positivity constraint violation ("relative to start" fields must be <= 0, "relative to end" fields must be >= 0). Phone 1: aria-invalid=true when empty (required field only — NO format validation). No visible error text paragraphs. |
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
| Add new section | textbox | (placeholder: Add New.) | enabled | (use placeholder selector) |
| Room Configuration Name (table) | textbox | (no rows for 1604) | enabled | (no individual data-testid) |
| Active (room — each row) | toggle | — | enabled | (no data-testid) |
| Add new room | textbox | (placeholder: Add New.) | enabled | (use placeholder selector) |
| Quotes (logo) | checkbox | checked | enabled | `local-office-settings-checkbox-use-quote-logo` |
| Rental Orders/DROs (logo) | checkbox | checked | enabled | `local-office-settings-checkbox-use-rental-logo` |
| Company Logo | combobox | Encore New Logo | enabled; 12 options | `local-office-settings-select-company-logo` |
| Logo preview | image | Encore New Logo artwork | display only | `local-office-settings-logo-preview` |
| Discount Exemptions — each service type toggle | toggle (SVG checkmark) | 75 rows; 4 exempt | enabled | (table: `local-office-settings-table-discount-exemptions`) |

---

## CORRECTIONS FROM PREVIOUS VERSION

| Issue | Old (Wrong) | New (Correct, MCP-verified) |
|-------|-------------|---------------------------------------|
| Use Equipments QC | "always disabled" | Conditionally disabled — enabled when Use Fulfillment is checked |
| Default Order Type options | 3 (Event/Outside/Internal) | 2 (Event/Outside) — Internal option removed |
| Default Labor to Hourly | Missing from field inventory | New checkbox field, unchecked by default, enabled |
| validation | "no inline error" | Delivery input gets `aria-invalid="true"` |
| Phone 1 validation | "required" only | Required-only — NO format validation. Any non-empty string accepted |
| Unsaved changes dialog text | "You have unsaved changes. Do you want to discard them?" | "Are you sure you want to leave this view? Any unsaved changes will be lost." |
| Section toggle mechanism | "img present/absent" | SVG checkmark (`lucide lucide-check text-primary`) present/absent |

## CORRECTIONS FROM AUDIT

| Issue | Old (Wrong) | New (Correct, MCP-verified) |
|-------|-------------|---------------------------------------|
| Save dialog | Self-contradicting: MCP log said "No dialog" but TCs said "Save Local Office Settings / Yes / No" | Uses shared "Save Changes" dialog with Cancel/Save buttons |
| BAS-004 test value | Prep=5 (violates + positivity: Prep must be <= 0) | Prep=-2 (valid: <= 0 and Delivery(0) >= Prep(-2)) |
| BAS-005 test value | Prep=10 (same violation) | Prep=-2 |
| BAS-008 recovery value | Delivery=0 (restores to server-original, the application sees no net change, Save stays disabled) | Delivery=-1 (different from original 0, form is dirty, Save enables) |
| BAS-009 field + value | Return=-10 (negative invalid for "relative to end" fields) | Set=-10 (negative valid for "relative to start" fields) |
| BAS-016 assertion | Expected aria-invalid on "not-a-phone" | No format validation exists; any non-empty string accepted |
| Positivity constraints | Undocumented | "Relative to start" fields (Prep, Set, Delivery) must be <= 0. "Relative to end" fields (Return, Strike, Pickup) must be >= 0 |
| Selector file | Dead selectors: dlgSaveLocalOffice, btnSaveLocalOfficeYes, btnSaveLocalOfficeNo | Removed — uses shared dlgSaveChanges/btnSaveChangesConfirm from shared.ts |

---

## TC-LOS-BAS-001: Page Load — Title, URL, Tab Structure

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: none (baseline-enforcement per LR-019)
**Steps**:
1. Open the Local Office Settings page.
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

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Tab panel visible
2. Verify **Prep Date Offset (Relative to Start)** = `-1` Hrs -> Input value = "-1"
3. Verify **Return Date Offset (Relative to End)** = `1` Hrs -> Input value = "1"
4. Verify **Set Date Offset (Relative to Start)** = `-1` Hrs -> Input value = "-1"
5. Verify **Strike Date Offset (Relative to End)** = `1` Hrs -> Input value = "1"
6. Verify **Delivery Date Offset (Relative to Start)** = `0` Hrs -> Input value = "0"
7. Verify **Pickup Date Offset (Relative to End)** = `0` Hrs -> Input value = "0"

**Expected**: All 6 offset inputs match defaults: -1, 1, -1, 1, 0, 0
**Automatable**: Yes

---

## TC-LOS-BAS-003: Save Button — Disabled by Default

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-BAS-001
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

**Depends_On**: TC-LOS-BAS-001

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Save button disabled
2. Clear "Prep Date Offset" field and type `-2` -> Field value changes to "-2"
3. Verify Save button is now enabled (no disabled attribute) -> Button clickable
4. Cleanup: clear field and type `-1` to restore original value

**Expected**: Editing any date offset field enables the Save button
**Automatable**: Yes

---

## TC-LOS-BAS-005: Date Offset — Edit, Save, Persist

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-BAS-001

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Tab panel visible
2. Clear "Prep Date Offset" field and type `-2` -> Field shows "-2"
3. Click "Save" button -> Save Changes dialog appears with title "Save Changes" and body "Are you sure you want to save the changes?" and buttons "Cancel" and "Save"
4. Click "Save" in the dialog -> Dialog closes and the save completes
5. Verify the notifications region shows the toast text "Local office settings updated" -> Confirmation toast visible
6. Reload the page -> Page reloads fresh
7. Verify "Prep Date Offset" shows `-2` -> Value persisted
8. Cleanup: change back to `-1` and save

**Expected**: Date offset value persists after save and reload, the Save Changes dialog gates the save, and the notifications region shows the success toast "Local office settings updated" after the dialog confirms.
**Automatable**: Yes

---

## TC-LOS-BAS-006: Date Offset — Non-Numeric Input Rejected

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Validation | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Tab panel visible
2. Clear **Prep Date Offset** field and type `abc` -> Field gets `aria-invalid="true"`
3. Verify Save button is **disabled** -> Button has `disabled` attribute
4. **Cleanup**: Clear and type `-1` to restore

**Expected**: Non-numeric input is shown as invalid and the Save button is disabled
**Automatable**: Yes

---

## TC-LOS-BAS-007: Date Offset — Delivery Must Be Greater Than Or Equal To Prep

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Validation | Yes |

**Depends_On**: TC-LOS-BAS-001

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Tab panel visible
2. Clear "Delivery Date Offset" and type `-5` -> Field shows "-5"
3. Verify "Prep Date Offset" shows `-1` (default) -> Delivery is now lower than Prep
4. Verify the "Delivery Date Offset" field is shown as invalid -> A validation error is shown on Delivery
5. Verify the "Save" button is disabled -> The form cannot be saved while the rule is violated
6. Cleanup: clear Delivery and type `0` to restore

**Expected**: rule: the Delivery Date Offset value must be greater than or equal to the Prep Date Offset value. When Delivery is lower than Prep, the Delivery field shows a validation error and the Save button is disabled until the user enters a Delivery value that is greater than or equal to Prep.
**Automatable**: Yes

---

## TC-LOS-BAS-008: Date Offset — Error Recovery

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Trigger validation: set Delivery to `-5` with Prep at `-1` -> Delivery has aria-invalid, Save disabled
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

**Depends_On**: TC-LOS-BAS-001

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Tab panel visible
2. Clear "Set Date Offset (Relative to Start)" and type `-10` -> Field shows "-10"
3. Verify the field is not shown as invalid -> Negative value is valid for fields that are Relative to Start
4. Verify the "Save" button is enabled -> The form can be saved
5. Cleanup: clear and type `-1` to restore

**Expected**: Negative values are valid for date offset fields that are Relative to Start (Prep, Set, Delivery).
**Automatable**: Yes

---

## TC-LOS-BAS-068: Date Offset — Return Rejects Negative Values (Relative to End)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Boundary | Yes |

**Depends_On**: TC-LOS-BAS-001

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Tab panel visible
2. Clear "Return Date Offset (Relative to End)" and type `-5` -> Field shows "-5"
3. Verify the field is shown as invalid -> Negative value is rejected for fields that are Relative to End
4. Verify the "Save" button is disabled -> The form cannot be saved while the value is invalid
5. Cleanup: clear and type `1` to restore

**Expected**: Negative values are rejected for date offset fields that are Relative to End (Return, Strike, Pickup); the field is shown as invalid and the Save button stays disabled.
**Automatable**: Yes

---

## TC-LOS-BAS-010: Date Offset — Zero Value Accepted

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Boundary | Yes |

**Depends_On**: TC-LOS-BAS-001
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

**Depends_On**: TC-LOS-BAS-001
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

**Depends_On**: TC-LOS-BAS-001
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

**Depends_On**: TC-LOS-BAS-001
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

**Depends_On**: TC-LOS-BAS-001
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

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Misc Settings visible
2. Note current **Phone 1** value (non-empty by default for 1604)
3. Clear **Phone 1** field completely -> Field empty
4. Tab out of field -> Field gets `aria-invalid="true"`
5. Verify Save button is **disabled** -> Cannot save empty required field
6. **Cleanup**: Type original phone value back

**Expected**: Empty Phone 1 is shown as invalid and the Save button is disabled
**Automatable**: Yes

---

## TC-LOS-BAS-016: Misc Settings — Phone 1 Validates Phone Format

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Blocked | Validation | No |

**Depends_On**: TC-LOS-BAS-001
**Status**: Blocked by BUG-LOS-BAS-016

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Misc Settings section is visible
2. Clear "Phone 1" and type non-phone text such as `abcdef` -> Field shows the typed text
3. Tab out of the field -> Field is shown as invalid because the value is not a valid phone number
4. Verify the "Save" button is disabled -> The form cannot be saved while the value is not a valid phone number
5. Clear the field and type a valid phone number such as `555-000-1111` -> Field accepts the value and the validation error clears
6. Verify the "Save" button is enabled -> The form can be saved with a valid phone number
7. Cleanup: restore the original phone value

**Expected**: Phone 1 accepts only values that match the phone-number format. Non-phone text is shown as invalid and the Save button stays disabled until the user enters a valid phone number.
**Automatable**: No (blocked until the underlying issue is resolved)

---

## TC-LOS-BAS-017: Misc Settings — Phone 1 Edit, Save, Persist

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Misc Settings visible
2. Note current **Phone 1** value
3. Clear **Phone 1** and type `555-123-4567` -> Field shows new number
4. Click **Save** -> Shared "Save Changes" dialog appears
5. Click **Save** in dialog -> Save completes
6. Reload page -> Verify **Phone 1** = "555-123-4567" -> Persisted
7. **Cleanup**: Restore original value and save

**Expected**: Valid phone number persists after save and reload
**Automatable**: Yes

---

## TC-LOS-BAS-018: Misc Settings — Phone 1 Error Recovery

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-BAS-001
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

**Depends_On**: TC-LOS-BAS-001
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

**Depends_On**: TC-LOS-BAS-001
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

**Depends_On**: TC-LOS-BAS-001
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

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Misc Settings visible
2. Change **Default Order Type** from "Event" to "Outside" -> Dropdown shows "Outside"
3. Click **Save** -> Shared "Save Changes" dialog appears
4. Click **Save** in dialog -> Save completes
5. Reload page -> Verify **Default Order Type** = "Outside" -> Persisted
6. **Cleanup**: Change back to "Event" and save

**Expected**: Default Order Type selection persists after save and reload
**Automatable**: Yes

---

## TC-LOS-BAS-023: Misc Settings — PO Number Field Edit, Save, Persist

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Misc Settings visible
2. Note current **PO Number** value (default empty for 1604)
3. Clear and type `PO-TEST-123` -> Field shows "PO-TEST-123"
4. Click **Save** -> Shared "Save Changes" dialog appears
5. Click **Save** in dialog -> Save completes
6. Reload page -> Verify **PO Number** = "PO-TEST-123" -> Persisted
7. **Cleanup**: Restore original value and save

**Expected**: PO Number text persists after save and reload
**Automatable**: Yes

---

## TC-LOS-BAS-024: Misc Settings — PO Number Label Field Edit, Save, Persist

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Misc Settings visible
2. Note current **PO Number Label** value (default empty for 1604)
3. Clear and type `Purchase Order #` -> Field shows "Purchase Order #"
4. Click **Save** -> Shared "Save Changes" dialog appears
5. Click **Save** in dialog -> Save completes
6. Reload page -> Verify **PO Number Label** = "Purchase Order #" -> Persisted
7. **Cleanup**: Restore original value and save

**Expected**: PO Number Label text persists after save and reload
**Automatable**: Yes

---

## TC-LOS-BAS-025: Section Configuration — Default Active Sections Structure

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-BAS-001

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Tab panel visible
2. Scroll to the "Section Configuration" table -> Table is visible
3. Verify the "Use Section" checkbox above the table is checked -> Section configuration is enabled
4. Verify the table shows at least one section row -> The list is not empty
5. For each row in the table, verify an inline name input is present (each row has an editable name field) -> Each row exposes its name as an editable input
6. Verify the table layout matches the requirements document for the office under test (the set of section names, the active or inactive state of each row, and the total row count come from the requirements document for that office, not from this TC) -> Per-office state matches its requirements row

**Expected**: The Section Configuration table is visible with at least one row and the Use Section checkbox is checked. Each row exposes its name as an editable input. The exact set of section names, the active or inactive state of each row, and the total row count are office-specific and are sourced from the requirements document for the office under test.
**Automatable**: Yes

---

## TC-LOS-BAS-026: Section Configuration — Toggle Section Active/Inactive

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOS-BAS-001
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

**Depends_On**: TC-LOS-BAS-001
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

**Depends_On**: TC-LOS-BAS-001
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

**Depends_On**: TC-LOS-BAS-001
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

**Depends_On**: TC-LOS-BAS-001
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

**Depends_On**: TC-LOS-BAS-001
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

**Depends_On**: TC-LOS-BAS-001

**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Tab panel visible
2. Scroll to the "Default Logo" section -> Section is visible
3. Verify the "Quotes" checkbox is checked by default -> Checkbox is in the checked state for office 1604
4. Verify the "Rental Orders/DROs" checkbox is checked by default -> Checkbox is in the checked state for office 1604
5. Record both states as the documented defaults for office 1604

**Expected**: For office 1604, the Default Logo section shows two checkboxes labeled "Quotes" and "Rental Orders/DROs" and both are checked by default.
**Automatable**: Yes

---

## TC-LOS-BAS-033: Default Logo — Company Logo Combobox Options

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Navigate to Local Office Settings, Basic Information tab and scroll to the "Default Logo" section
2. Click the "Company Logo" combobox to open the dropdown
3. Verify the dropdown lists all available logo options
4. Verify options include PSAV, Encore, and venue-specific logos
5. Verify the current selected value matches the page default
6. Close the dropdown without changing the selection

**Expected**: The Company Logo dropdown offers its full set of logo options
**Automatable**: Yes

---

## TC-LOS-BAS-034: Default Logo — Preview Image Updates on Selection

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Default Logo section visible
2. Note the current **Company Logo** selection and its preview image
3. Change **Company Logo** to a different option -> Selected option changes
4. Verify the logo preview image updated to the new logo -> Different image
5. **Cleanup**: Restore original selection

**Expected**: Changing Company Logo updates the preview image
**Automatable**: Yes

---

## TC-LOS-BAS-035: Discount Exemptions — Service Type Toggles

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOS-BAS-001
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

**Depends_On**: TC-LOS-BAS-001
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

**Depends_On**: TC-LOS-BAS-001
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

**Depends_On**: TC-LOS-BAS-001
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

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Navigate to Local Office Settings, Basic Information tab -> Misc Settings visible
2. Clear **PO Number** and type `<script>alert(1)</script>` -> Text entered
3. Tab out -> Verify field does NOT execute script (no alert)
4. If Save is enabled, save and reload -> Verify stored as plain text, no execution
5. **Cleanup**: Clear PO Number and restore original value

**Expected**: XSS payload stored as plain text or rejected; never executed
**Automatable**: Yes

---

## TC-LOS-BAS-040: Empty Section Name — Reverts to Previous Value When Focus Leaves

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Functional | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Reload Basic Info for clean state
2. Get the first section name (expect "Audio")
3. Edit the first section name to an empty string, press Tab
4. Verify name reverted to original "Audio"

**Expected**: Empty section name reverts to previous value

---

## TC-LOS-BAS-041: Whitespace-Only Section Name — Accepted as New Content

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Automated | Boundary | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Get the first section name
2. Edit the first section name to a whitespace-only value, press Tab
3. Verify name is either whitespace (accepted) or reverted (rejected)
4. Cleanup: restore original name if accepted, reload

**Expected**: Whitespace may be accepted 

---

## TC-LOS-BAS-044: Add New Section with Empty Name — Rejected

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Negative | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Count section rows before
2. Add section with empty name via Add New input, press Tab
3. Count section rows after — expect unchanged

**Expected**: Empty section name via Add New is rejected

---

## TC-LOS-BAS-045: Add New Section with Duplicate Name — Silently Rejected

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Negative | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Count section rows before
2. Add section with name "Audio" (already exists) via Add New, press Tab
3. Count section rows after — expect unchanged
4. Verify Save is disabled (no change was made)

**Expected**: Duplicate section via Add New is silently rejected, no error icon

---

## TC-LOS-BAS-047: Section Edit — Escape Does NOT Revert

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Automated | Functional | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Reload for clean state, get the first section name ("Audio")
2. Type "TEMP CANCEL TEST" into the first section name field, press Escape
3. Verify name is "TEMP CANCEL TEST" (Escape does NOT revert)
4. Cleanup: restore original name, reload

**Expected**: Pressing Escape does not cancel editing of section names

---

## TC-LOS-BAS-048: Verify a room Inactive toggle persists after save and reload

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Round-trip | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Reload, ensure room "Room Toggle Test" exists (add if needed, save)
2. Ensure room starts active (toggle + save if inactive from prior run)
3. Toggle room to inactive
4. Save + reload
5. Find room, verify still inactive after reload
6. Cleanup: toggle back to active + save

**Expected**: Room active/inactive toggle persists through save+reload round-trip

---

## TC-LOS-BAS-049: Verify a room name change persists after save and reload

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Round-trip | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Reload, ensure room "Room Edit Test" exists (handle prior-run rename to "Room Edit Renamed")
2. Rename room to "Room Edit Renamed"
3. Save + reload
4. Verify "Room Edit Renamed" in room names, "Room Edit Test" absent
5. Cleanup: rename back to original + save

**Expected**: Room name edit persists through save+reload round-trip

---

## TC-LOS-BAS-050: Empty Room Name — Revert Behavior

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Functional | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Reload, count rooms before
2. Add "Conference Room Z" via Add New
3. Edit last room to empty string, press Tab
4. Verify room count unchanged (name reverted or row preserved)
5. Cleanup: reload to discard

**Expected**: Empty room name reverts like sections

---

## TC-LOS-BAS-051: Duplicate Room Name via Add New — Silently Rejected

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Negative | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Add "Conference Room Z" via Add New, record count
2. Add "Conference Room Z" again via Add New
3. Verify count unchanged

**Expected**: Duplicate room name via Add New is silently rejected

---

## TC-LOS-BAS-053: Verify a positive value in Relative to Start fields is rejected

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Validation | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Reload, for each of Prep/Set/Delivery:
 - Type positive value (5, 3, 2)
 - Poll until aria-invalid=true
 - Restore default value
2. Reload after all fields tested

**Expected**: Positive values in "relative to start" fields are shown as invalid

---

## TC-LOS-BAS-054: Verify a negative value in Relative to End fields is rejected

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Validation | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. For each of Return/Strike/Pickup:
 - Type negative value (-3, -2, -1)
 - Poll until aria-invalid=true
 - Restore default value
2. Reload after all fields tested

**Expected**: Negative values in "relative to end" fields are shown as invalid

---

## TC-LOS-BAS-055: Verify non-numeric input in the Return field is rejected

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Automated | Validation | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Type "abc" into Return Date Offset, Tab
2. Wait until a validation error appears.
3. Verify Save disabled
4. Reload to clear cached form state (LR-011)

**Expected**: Non-numeric input is shown as invalid on the Return field

---

## TC-LOS-BAS-056: Verify non-numeric input in the Delivery field is rejected

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Automated | Validation | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Type "abc" into Delivery Date Offset, Tab
2. Wait until a validation error appears.
3. Verify Save disabled
4. Reload to clear cached form state (LR-011)

**Expected**: Non-numeric input is shown as invalid on the Delivery field

---

## TC-LOS-BAS-061: Maximum Length Boundary — 3-Char Field Rejects 4+ Chars

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Automated | Boundary | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Type "1234" into Prep (max 3 characters)
2. Verify the stored value is at most 3 characters (extra input is truncated)
3. Truncated "123" is positive for "relative to start" -> aria-invalid
4. Cleanup: restore default, reload

**Expected**: Input truncated to 3 chars; truncated positive value triggers validation

---

## TC-LOS-BAS-062: Maximum Length Boundary — 4-Char Field Accepts Value at Limit

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Automated | Boundary | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Type "-999" into Set (max 4 characters)
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

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Set Delivery = -5 (violates : Delivery < Prep(-1))
2. Poll until Delivery aria-invalid=true
3. Verify Save disabled
4. Set Delivery = -1 (LR-009: differs from default 0)
5. Poll until Delivery aria-invalid=false
6. Verify Save enabled
7. Cleanup: restore default, reload

**Expected**: Cross-validation error clears after correction

---

## TC-LOS-BAS-064: Clear Prep Offset — Save, Reload, Verify Empty

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Functional | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Clear Prep Date Offset, Tab
2. Save + confirm
3. Reload and verify the Prep value is empty (not 0).
4. Cleanup: restore to -1, save

**Expected**: Null offset preserved as empty string, not "0"

---

## TC-LOS-BAS-065: Clear Return Offset — Save, Reload, Verify Empty

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Functional | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Clear Return Date Offset, Tab
2. Save + confirm
3. Reload and verify the Return value is empty (not 0).
4. Cleanup: restore to 1, save

**Expected**: Null offset preserved as empty string

---

## TC-LOS-BAS-066: Clear Prep But Keep Delivery — No Cross-Validation Error

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Automated | Functional | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Reload, clear Prep (default -1)
2. Leave Delivery at default (0)
3. Verify Delivery is not shown as invalid (skipped when Prep is empty)
4. Verify Save enabled (Prep was changed)
5. Cleanup: reload to discard

**Expected**: Cross-validation is not triggered when Prep is empty

---

## TC-LOS-BAS-067: Clear All 6 Offsets — Save, Reload, All Empty

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Automated | Functional | Yes |

**Depends_On**: TC-LOS-BAS-001
**Steps**:
1. Reload, clear all 6 date offsets
2. Save + confirm
3. Reload and verify all six values are empty (not 0).
4. Cleanup: restore all defaults, save

**Expected**: All empty offsets stay empty after bulk clear

---

## BLOCKED / NOT-AUTOMATABLE / DEFERRED TCs

| TC ID | Gap | Status | Reason |
|-------|-----|--------|--------|
| BAS-042 | #18 | NOT APPLICABLE | Duplicate section via rename has NO validation on live app (v1 spec not implemented) |
| BAS-043 | #18 | NOT APPLICABLE | Recovery from duplicate icon — no icon exists (see BAS-042) |
| BAS-046 | #18 | NOT-AUTOMATABLE | No delete UI for sections |
| BAS-052 | #19 | NOT-AUTOMATABLE | No delete UI for rooms |
| BAS-057 | #20 | PLAN INVALIDATED | Set < Delivery cross-validation NOT IMPLEMENTED in the application (MCP-5). Plan assumed Validate path existed. |
| BAS-058 | #20 | PLAN INVALIDATED | Return < Pickup cross-validation NOT IMPLEMENTED (MCP-6). Plan path 6 assumption invalid. |
| BAS-059 | #20 | PLAN INVALIDATED | Strike < Return cross-validation NOT IMPLEMENTED (MCP-6). Plan path 6 assumption invalid. |
| BAS-060 | #20 | PLAN INVALIDATED | Pickup >= Strike cross-validation NOT IMPLEMENTED (MCP-5/6). Plan path 5/6 assumption invalid. |

### Validate Path Coverage — Plan vs Reality

The audit plan defined 8 Validate paths. MCP verification proved only **NM-1264** (Delivery >= Prep) is wired in the the application implementation. The other cross-validators (Set/Delivery, Return/Strike, Return/Pickup, Pickup/Strike) are described in v1 spec but **not implemented** in the live app.

| Path | Plan Claim | Actual Status |
|------|-----------|---------------|
| 1 | Covered by BAS-066 + BAS-057 | BAS-066 [OK], BAS-057 INVALIDATED (Set >= Delivery not enforced) |
| 2 | Covered by BAS-007 + BAS-057 | BAS-007 [OK] (only), BAS-057 INVALIDATED |
| 3 | P2 DEFERRED | INVALIDATED — requires unimplemented Set >= Prep check |
| 4 | Covered by BAS-007 | [OK] only live path |
| 5 | Covered by BAS-060 | INVALIDATED — Pickup >= Strike not enforced |
| 6 | Covered by BAS-058/059/060 | INVALIDATED — all 3 cross-validators missing |
| 7 | P2 DEFERRED | INVALIDATED |
| 8 | P2 DEFERRED | INVALIDATED |

**Effective coverage**: Path 4 (only) is the sole live cross-validation path. Covered by BAS-007. Path 1 partially covered (BAS-066 tests null-Prep behavior). All other paths test validators that don't exist.

---
