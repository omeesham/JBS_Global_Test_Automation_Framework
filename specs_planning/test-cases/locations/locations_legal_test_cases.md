# Location Legal Test Cases
**Module**: locations | **Total**: 15 | **Status**: Manual | **Updated**: 2026-02-19

---

## FIELD INVENTORY & DISCOVERY

**Legal Grid** (3 columns, 1 data row):
| # | Field | Type | Default (1604) | State |
|---|-------|------|----------------|-------|
| 1 | Language Name | static text | US English | read-only (no editor rendered) |
| 2 | Service Charge Name | combobox | Service Charge | editable (100+ options, filtered by LanguageId) |
| 3 | Terms and Conditions Name | combobox | LDW | editable (50+ options, filtered by LanguageId) |

**Legal Save Button**: Dedicated save in tabpanel, separate from left-panel Save. Disabled when no Legal changes made.

**Validation Rules**:
- `SCNAME_IS_REQD`: Service Charge Name cannot be null/empty (exclamation icon in cell)
- `TCNAME_IS_REQD`: Terms and Conditions Name cannot be null/empty (exclamation icon in cell)
- `!isValidLegalData()`: Invalid Legal data also blocks left-panel Save

**Country Change Cascade**: Changing Country in left panel resets both Service Charge Name and Terms and Conditions Name for all language rows.

---

## TC-LOC-LGL-001: Verify Legal grid default structure
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Navigate to Setup > Location > 1604 -- **Legal** tab ✓ Tab loads 2. Verify table structure ✓ 3 column headers visible: Language Name, Service Charge Name, Terms and Conditions Name 3. Verify row count ✓ 1 data row (US English) 4. Verify Legal **Save** button ✓ Visible at top-right, disabled
**Expected**: Table with 3 columns and 1 row (US English) visible; dedicated Legal Save button present and disabled by default
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-LGL-002: Verify Legal grid default field values
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Legal** tab ✓ Tab loads 2. Verify US English row ✓ Language Name = "US English" (static), **Service Charge Name** = "Service Charge", **Terms and Conditions Name** = "LDW"
**Expected**: US English row shows: Language Name = "US English", Service Charge Name = "Service Charge", Terms and Conditions Name = "LDW"
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-LGL-003: Verify Language Name cell is read-only
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Steps**: 1. Open **Legal** tab ✓ Tab loads 2. Click or attempt to interact with Language Name cell ("US English") ✓ No combobox or input appears 3. Verify cell is static text ✓ No editor is launched
**Expected**: Language Name column is read-only, no editing possible (no combobox rendered in that cell)
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-LGL-004: Verify Service Charge Name dropdown opens and shows options
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Legal** tab ✓ Tab loads 2. Click **Service Charge Name** combobox in US English row ✓ Dropdown opens 3. Verify options visible ✓ Multiple named options visible (e.g., "Service Charge", "Administrative Fee", "Hotel Service Charge", "ETS", "No Service Charge") 4. Verify current selection marked ✓ "Service Charge" shown with selection indicator 5. Press Escape ✓ Dropdown closes, value unchanged
**Expected**: Dropdown opens with 100+ service charge options; currently selected option is visually indicated; dropdown closes on Escape
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-LGL-005: Verify Terms and Conditions Name dropdown opens and shows options
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Legal** tab ✓ Tab loads 2. Click **Terms and Conditions Name** combobox in US English row ✓ Dropdown opens 3. Verify options visible ✓ Multiple named options visible (e.g., "LDW", "Encore Terms and Conditions", "Show Quote", "Blank", "ETS (No LDW)") 4. Verify current selection marked ✓ "LDW" shown with selection indicator 5. Press Escape ✓ Dropdown closes, value unchanged
**Expected**: Dropdown opens with 50+ T&C options; currently selected option is visually indicated; dropdown closes on Escape
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-LGL-006: Search/filter within Service Charge Name dropdown
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Steps**: 1. Open **Legal** tab ✓ Tab loads 2. Click **Service Charge Name** combobox ✓ Dropdown opens 3. Type "marriott" into the search input ✓ List filters to show only Marriott-related service charges 4. Verify filtered results ✓ Options containing "Marriott" in their names are shown 5. Press Escape ✓ Dropdown closes, original value preserved
**Expected**: Typing in the dropdown search input filters the visible options; pressing Escape closes the dropdown without changing the selected value
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-LGL-007: Legal Save button disabled by default (no changes)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Legal** tab ✓ Tab loads 2. Make no changes ✓ Both dropdowns show default values 3. Verify Legal **Save** button ✓ `[disabled]` state, not clickable
**Expected**: Legal Save button is disabled when no changes have been made; unsaved changes flag = false
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-LGL-008: Changing Service Charge Name enables Legal Save button
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Legal** tab ✓ Tab loads 2. Verify Legal **Save** button ✓ Disabled 3. Verify left panel **Save** button ✓ Disabled 4. Click **Service Charge Name** combobox -- select "Administrative Fee" ✓ Value updated to "Administrative Fee" 5. Verify Legal **Save** button ✓ Now enabled (clickable, not disabled) 6. Verify left panel **Save** button ✓ Still disabled (Legal changes do not affect left panel save state)
**Expected**: Changing Service Charge Name enables the Legal-tab-specific Save button; left-panel Save remains unaffected; unsaved changes flag = true
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-LGL-009: Changing Terms and Conditions Name enables Legal Save button
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Legal** tab ✓ Defaults loaded 2. Click **Terms and Conditions Name** combobox -- select "Encore Terms and Conditions" ✓ Value updated 3. Verify Legal **Save** button ✓ Now enabled 4. Click **Terms and Conditions Name** -- revert to "LDW" ✓ Value restored 5. Verify Legal **Save** button ✓ Returns to disabled
**Expected**: T&C change enables Legal Save; reverting to original value re-disables Legal Save (no net change = no unsaved state)
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-LGL-010: Reverting both dropdowns to original values disables Legal Save
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Steps**: 1. Open **Legal** tab ✓ Defaults loaded 2. Change **Service Charge Name** to "Administrative Fee" ✓ Legal Save enabled 3. Change **Terms and Conditions Name** to "Encore Terms and Conditions" ✓ Legal Save still enabled 4. Revert **Service Charge Name** back to "Service Charge" ✓ Still enabled (one difference remains) 5. Revert **Terms and Conditions Name** back to "LDW" ✓ Legal Save becomes disabled again
**Expected**: Legal Save button tracks unsaved state; only disabled when all values match saved state
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-LGL-011: Save legal data change persists after Save
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Steps**: 1. Open **Legal** tab ✓ Defaults loaded 2. Change **Terms and Conditions Name** to "Encore Terms and Conditions" ✓ Legal Save enabled 3. Click Legal **Save** button ✓ Save executes 4. Verify Legal **Save** button ✓ Returns to disabled (changes saved) 5. Navigate away (e.g., switch to Local Information tab, then back to Legal) ✓ Tab reloads 6. Verify **Terms and Conditions Name** ✓ Still shows "Encore Terms and Conditions" (persisted) 7. [CLEANUP] Revert T&C Name back to "LDW" and Save ✓ Restored to original
**Expected**: Legal Save successfully persists legal data change; button re-disables after save; change survives tab navigation
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-LGL-012: Country change resets both Legal dropdowns
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Cross-Tab |

**Steps**: 1. Open **Legal** tab ✓ Verify US English row: SC = "Service Charge", T&C = "LDW" 2. Locate **Country** combobox in the persistent left panel (always visible regardless of right tab) ✓ Country field accessible 3. Change **Country** combobox to a different value (e.g., "Canada") ✓ Country updated 4. Switch back to **Legal** tab ✓ Tab reloads 5. Verify **Service Charge Name** ✓ Value has been reset (no longer "Service Charge") 6. Verify **Terms and Conditions Name** ✓ Value has been reset (no longer "LDW") 7. [CLEANUP] Revert Country back to "United States" ✓ Country restored
**Expected**: Changing Country in Basic Information resets ServiceChargeName and TermsConditionsName for all language rows in Legal tab
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-LGL-013: Validation error indicator shown after Legal data is invalidated
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Validation |

**Steps**: 1. Locate **Country** combobox in the left panel -- change to "Canada" ✓ Country updated, Legal dropdowns reset 2. Open **Legal** tab ✓ Tab visible 3. Observe Service Charge Name cell ✓ Exclamation error indicator (icon) visible in cell 4. Observe Terms and Conditions Name cell ✓ Exclamation error indicator visible in cell
**Expected**: After Legal data is invalidated (values reset to null/empty), exclamation error indicators appear in both Service Charge Name and Terms and Conditions Name cells (per SCNAME_IS_REQD and TCNAME_IS_REQD validation rules)
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-LGL-014: Left panel Save button disabled when Legal data is invalid
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Validation |

**Steps**: 1. Locate **Country** combobox in the left panel -- change to "Canada" ✓ Country updated, both Legal dropdowns reset 2. Observe left panel **Save** button (in Basic Information left column) ✓ Verify Save is disabled 3. Do NOT fix the Legal dropdowns yet ✓ Legal data remains invalid
**Expected**: Left panel Save button disabled when `!isValidLegalData()` — invalid Legal tab data blocks all location saves (not just Legal-tab save)
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-LGL-015: Fixing invalid Legal data re-enables left panel Save
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Validation |

**Steps**: 1. Continue from TC-LOC-LGL-014 (Legal data invalid, left panel Save disabled) 2. Open **Legal** tab ✓ Exclamation icons visible 3. Click **Service Charge Name** -- select valid option (e.g., "Service Charge") ✓ Value set, error icon clears from SC cell 4. Click **Terms and Conditions Name** -- select valid option (e.g., "LDW") ✓ Value set, error icon clears from T&C cell 5. Verify Legal **Save** button ✓ Enabled 6. Verify left panel **Save** button ✓ Now enabled (legal data is valid again) 7. [CLEANUP] Revert Country to "United States" and save
**Expected**: Selecting valid options for both dropdowns clears validation errors; Legal Save and left panel Save both re-enable; `isValidLegalData()` returns true
**Data**: office=1604
**Automatable**: Yes

---

<!-- Execution Notes:
- TCs 001-011: canEditProp=true (confirmed for office 1604; dropdowns are clickable, editable)
- TCs 012-015: Cross-tab (Country change) — use carefully; always CLEANUP country after test
- Service Charge dropdown: 100+ options for US English LanguageId (populated from API filtered by LanguageId)
- T&C dropdown: 50+ options for US English LanguageId (populated from API filtered by LanguageId)
- Each editable cell has 1 DOM element with role=combobox (the visible button); the hidden search input does NOT carry role=combobox in DOM; interact with the visible combobox button
- Legal Save (in tabpanel): separate from left panel Save; tracks only Legal tab changes
- Left panel Save (form container): blocked by !isValidLegalData() when any Legal row has null SC or T&C
- canEditProp=false scenario (read-only mode): dependent on user permissions; not testable with office 1604 in current env
- TC-011 is destructive — always revert after test; annotated with [CLEANUP] steps
-->
