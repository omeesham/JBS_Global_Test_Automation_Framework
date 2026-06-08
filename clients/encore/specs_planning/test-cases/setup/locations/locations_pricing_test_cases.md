# Location Pricing Test Cases
**Module**: locations | **Total**: 35 | **Status**: Partial | **Updated**: 

---

## FIELD INVENTORY & DISCOVERY

**Top Section Fields** (4 fields):
- **Checkboxes**: 2 (Corporate Pricing, Price Guide Inclusive)
- **Dropdowns**: 1 (Currency filter)
- **Button**: 1 (Save)

**Primary Pricing Section** (5 editable dropdowns / comboboxes):
- Primary Labor Pricing
- Primary Equipment Pricing
- Primary Internal Equipment Pricing
- Primary Production Labor Pricing
- Primary Production Equipment Pricing

> **CORRECTION (live verification)**: These are editable comboboxes, NOT read-only display fields. Selections can be made when Corporate Pricing is checked.

**Location Secondary Pricing Grid Columns** (7 columns):
1. **Pricing Strategy** (read-only text)
2. **Pricebook** (read-only text)
3. **Currency** (read-only text)
4. **Is Alternative** (checkbox)
5. **Use Effective Date** (checkbox)
6. **Start Date** (date picker MM/DD/YYYY)
7. **End Date** (date picker MM/DD/YYYY)

**Grid Rows**: 20+ price book rows spanning:
- Tiers (1/2/3)
- Property types (Luxury, Resort, Suburban, Airport, Convention, Branch)
- Special categories (eCommerce, Stand-Alone Virtual, Offsite Events)
- Regional variations (MEX, NP National Production)

**Critical Cascading Dependencies**:
1. **Is Alternative** unchecked -- **Use Effective Date** disabled
2. **Is Alternative** checked -- **Use Effective Date** enabled
3. **Use Effective Date** unchecked -- **Start Date** and **End Date** disabled
4. **Use Effective Date** checked -- **Start Date** and **End Date** enabled

**Master Toggle Behavior** (✅ CONFIRMED LIVE BEHAVIOR —):
- Corporate Pricing unchecked -- Primary pricing dropdowns disabled
- Secondary grid (Is Alternative, Use Effective Date, Start Date, End Date) remains fully editable
- Prior REQUIREMENTS.md was incorrect; live interface verified and REQUIREMENTS.md updated

---

## TC-LOC-PRI-001: Verify Pricing tab default state
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: none (baseline-enforcement per LR-019)
**Steps**: 1. Navigate to Setup > Location > 1604 -- **Pricing** tab ✓ Tab loads 2. Verify **Corporate Pricing** checkbox ✓ Checked 3. Verify **Price Guide Inclusive** checkbox ✓ Checked 4. Verify **Currency** filter ✓ Shows "All"
**Expected**: Pricing tab loads with Corporate Pricing and Price Guide Inclusive enabled, Currency filter set to "All"
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-PRI-002: Verify Primary Pricing fields default state
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Navigate to Setup > Location > 1604 -- **Pricing** tab ✓ Tab loads 2. Verify Primary pricing section (USD) ✓ 5 dropdowns visible: **Primary Labor Pricing**, **Primary Equipment Pricing**, **Primary Internal Equipment Pricing**, **Primary Production Labor Pricing**, **Primary Production Equipment Pricing** 3. Click **Primary Labor Pricing** dropdown ✓ Dropdown opens, options are selectable (editable combobox, not read-only text) 4. Verify all 5 fields are enabled and accept user input when **Corporate Pricing** is checked ✓ Confirmed editable comboboxes
**Expected**: 5 Primary pricing editable comboboxes (not read-only) are visible and accept selections when Corporate Pricing is checked
**Data**: office=1604

**Notes**: CORRECTION from prior docs: primary pricing fields are editable dropdowns, not read-only display fields.
**Automatable**: Yes

---

## TC-LOC-PRI-003: Verify Location Secondary Pricing grid structure
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Open **Pricing** tab ✓ Tab loads 2. Scroll to **Location Secondary Pricing** grid ✓ Grid visible 3. Verify column headers ✓ 7 columns: Pricing Strategy, Pricebook, Currency, Is Alternative, Use Effective Date, Start Date, End Date 4. Verify first row ✓ MEX BO GDL MXN 2025 row visible
**Expected**: Grid displays 7 columns with correct headers and price book rows
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-PRI-004: Verify grid row default state (all unchecked)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Open **Pricing** tab ✓ Tab loads 2. Check first price book row (MEX BO GDL MXN 2025) ✓ **Is Alternative** unchecked, **Use Effective Date** disabled, **Start Date** disabled, **End Date** disabled 3. Check second price book row (2021-Tier 3 Urban A) ✓ Same state: Is Alternative unchecked, other fields disabled
**Expected**: All price book rows start with Is Alternative unchecked and cascaded fields disabled
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-PRI-005: Enable Use Effective Date by checking Is Alternative
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Verify MEX BO GDL row **Use Effective Date** checkbox ✓ Disabled (not clickable) 2. Check MEX BO GDL **Is Alternative** checkbox ✓ Checked, Save button enabled 3. Verify **Use Effective Date** checkbox ✓ Enabled (clickable)
**Expected**: Checking Is Alternative enables Use Effective Date checkbox
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-PRI-006: Is Alternative remains unchecked when Use Effective Date disabled
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Verify 2021-Tier 3 Urban A row **Is Alternative** ✓ Unchecked 2. Attempt to click **Use Effective Date** checkbox ✓ Disabled, no interaction 3. Verify **Is Alternative** ✓ Still unchecked
**Expected**: Use Effective Date cannot be checked when Is Alternative is unchecked
**Data**: office=1604

**Notes**: Validates unidirectional cascade (parent controls child, not vice versa)
**Automatable**: Yes

---

## TC-LOC-PRI-007: Enable Start/End Date fields by cascading checkboxes
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Verify MEX BO GDL row **Start Date** and **End Date** ✓ Both disabled, show "MM/DD/YYYY" placeholder 2. Check **Is Alternative** ✓ Checked 3. Check **Use Effective Date** ✓ Checked 4. Verify **Start Date** and **End Date** ✓ Both enabled, date picker buttons clickable
**Expected**: Full cascade: Is Alternative checked -- Use Effective Date enabled -- Use Effective Date checked -- Start/End Date enabled
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-PRI-008: Start/End Date remain disabled when Use Effective Date unchecked
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Check 2022-eCommerce row **Is Alternative** ✓ Checked, Use Effective Date enabled 2. Verify **Use Effective Date** ✓ Unchecked 3. Verify **Start Date** and **End Date** ✓ Both disabled
**Expected**: Date fields remain disabled until Use Effective Date is checked
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-PRI-009: Uncheck Use Effective Date clears Start/End Date values
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Enable dates via cascade (Is Alternative checked, Use Effective Date checked) ✓ Start/End Date enabled 2. Enter **Start Date** = 03/01/2026, **End Date** = 03/31/2026 ✓ Dates entered 3. Uncheck **Use Effective Date** ✓ Unchecked 4. Re-check **Use Effective Date** ✓ Checked again 5. Verify **Start Date** and **End Date** ✓ Values cleared (empty fields)
**Expected**: Unchecking Use Effective Date clears date values
**Data**: office=1604 | startDate=03/01/2026 | endDate=03/31/2026

**Notes**: Per REQUIREMENTS.md: "On Uncheck: Clears StartDate value, Clears EndDate value"
**Automatable**: Yes

---

## TC-LOC-PRI-010: Uncheck Is Alternative disables and clears all row fields
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Configure MEX BO GDL row: **Is Alternative** checked, **Use Effective Date** checked, **Start Date** = 02/15/2026 ✓ All fields configured 2. Uncheck **Is Alternative** ✓ Unchecked 3. Verify **Use Effective Date** ✓ Disabled and unchecked 4. Verify **Start Date** and **End Date** ✓ Disabled and values cleared
**Expected**: Unchecking Is Alternative disables Use Effective Date, clears dates, and sets IsDeleted=true flag
**Data**: office=1604 | startDate=02/15/2026

**Notes**: Per REQUIREMENTS.md: "On Uncheck: Clears all validation errors, Sets IsDeleted=true, Sets UseDate=false, Clears StartDate and EndDate values"
**Automatable**: Yes

---

## TC-LOC-PRI-011: Corporate Pricing master toggle disables Primary pricing fields
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Verify **Primary Labor Pricing** dropdown ✓ Enabled (clickable) 2. Uncheck **Corporate Pricing** checkbox ✓ Unchecked, Save button enabled 3. Verify all 5 Primary pricing dropdowns ✓ All disabled (grayed out)
**Expected**: Unchecking Corporate Pricing disables all Primary pricing fields
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-PRI-012: Corporate Pricing toggle does NOT disable grid fields
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Confirmed Behavior |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Configure MEX BO GDL row: **Is Alternative** checked, **Use Effective Date** checked ✓ Fields enabled 2. Uncheck **Corporate Pricing** checkbox ✓ Unchecked 3. Verify MEX BO GDL **Is Alternative** checkbox ✓ Still enabled (clickable) 4. Verify **Use Effective Date** checkbox ✓ Still enabled
**Expected**: Grid fields remain enabled (actual live behavior)
**Data**: office=1604

**Notes**: CONFIRMED BEHAVIOR: Corporate Pricing unchecked -- Primary pricing dropdowns become disabled ONLY; secondary grid (Is Alternative, Use Effective Date, Start Date, End Date) remains fully editable. Prior REQUIREMENTS.md was incorrect; documentation has been updated to reflect actual live behavior.
**Automatable**: Yes

---

## TC-LOC-PRI-013: Re-enable fields by checking Corporate Pricing
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Uncheck **Corporate Pricing** ✓ Primary pricing fields disabled 2. Check **Corporate Pricing** ✓ Checked 3. Verify **Primary Labor Pricing** dropdown ✓ Re-enabled (clickable)
**Expected**: Checking Corporate Pricing re-enables Primary pricing fields
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-PRI-014: Currency filter displays "All" by default
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Open **Pricing** tab ✓ Tab loads 2. Check **Currency** filter dropdown ✓ Shows "All"
**Expected**: Currency filter defaults to "All" showing all currencies
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-PRI-015: Currency filter dropdown options
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Click **Currency** filter dropdown ✓ Dropdown opens 2. Verify options ✓ Exactly 4 options: "All", "USD", "MXN", "CAD"
**Expected**: Currency dropdown contains exactly "All", "USD", "MXN", "CAD" — no other options
**Data**: office=1604

**Notes**: Confirmed from Currency tab live verification (office 1604,): 3 currencies configured -- 4 filter options: All + USD + MXN + CAD
**Automatable**: Yes

---

## TC-LOC-PRI-016: Filter grid by selecting specific currency
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Click **Currency** filter ✓ Opens 2. Select **USD** ✓ Filter applied 3. Verify grid rows ✓ Only USD price books visible (MEX BO GDL MXN 2025 hidden) 4. Select **All** ✓ Filter cleared 5. Verify grid ✓ All currencies visible again
**Expected**: Currency filter updates grid to show only matching price books
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-PRI-017: Primary pricing fields accept dropdown selections
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Ensure **Corporate Pricing** checked ✓ Checked 2. Click **Primary Labor Pricing** dropdown ✓ Dropdown opens (loading skeleton if API unavailable) 3. Select any available price book option ✓ Option selected and shown in dropdown 4. Verify dropdown ✓ Shows selected value 5. Click **Save** ✓ Confirm dialog -- save completes; reload -- value persists
**Expected**: Primary pricing dropdowns accept selections and persist after save
**Data**: office=1604

**Notes**: Primary pricing dropdown options cannot be discovered in training environment — pricing APIs (production-pricebooks, corporate-pricebooks) return CORS errors. Verify specific option names with API access. TC verifies dropdown accepts selection and persists — testable when APIs are accessible.
**Automatable**: Yes

---

## TC-LOC-PRI-018: Start Date validates MM/DD/YYYY format
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Enable date fields (Is Alternative checked, Use Effective Date checked) ✓ Dates enabled 2. Click **Start Date** field, enter invalid date "13/45/2026" ✓ Entered 3. Click outside field ✓ Validation triggers 4. Verify error state ✓ Field shows error indicator (red border / error class on input)
**Expected**: Invalid date format triggers validation error via customDateValidator; field shows error state
**Data**: office=1604 | invalidDate=13/45/2026

**Notes**: Per REQUIREMENTS.md: customDateValidator validates via isValidDate method. Exact error message text cannot be verified in training environment — pricing grid does not load (CORS-blocked API). Verify specific error text with API access.
**Automatable**: Yes

---

## TC-LOC-PRI-019: End Date validates MM/DD/YYYY format
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Enable date fields ✓ Dates enabled 2. Click **End Date** field, enter invalid date "99/99/9999" ✓ Entered 3. Click outside field ✓ Validation triggers 4. Verify error state ✓ Error indicator displayed
**Expected**: Invalid date format triggers validation error via customDateValidator
**Data**: office=1604 | invalidDate=99/99/9999
**Automatable**: Yes

---

## TC-LOC-PRI-020: Valid dates persist after save
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Enable dates (Is Alternative checked, Use Effective Date checked) ✓ Dates enabled 2. Enter **Start Date** = 04/01/2026, **End Date** = 04/30/2026 ✓ Valid dates entered 3. Click **Save** ✓ Save completes 4. Refresh page or navigate away and return ✓ Return to Pricing tab 5. Verify MEX BO GDL row ✓ **Start Date** = 04/01/2026, **End Date** = 04/30/2026, **Is Alternative** and **Use Effective Date** both checked
**Expected**: Date values and checkbox states persist after save
**Data**: office=1604 | startDate=04/01/2026 | endDate=04/30/2026
**Automatable**: Yes

---

## TC-LOC-PRI-021: Multiple price books can have alternate pricing simultaneously
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Check **Is Alternative** for MEX BO GDL MXN 2025 ✓ Checked 2. Check **Is Alternative** for 2021-Tier 3 Urban A ✓ Checked 3. Check **Is Alternative** for 2022-eCommerce ✓ Checked 4. Verify all three rows ✓ All show Is Alternative checked simultaneously
**Expected**: Multiple price books can be marked as alternate pricing concurrently (no single-selection constraint)
**Data**: office=1604
**Automatable**: Yes

---

## TC-LOC-PRI-022: Grid validates all rows via validateCorporatePriceGrid
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Configure MEX BO GDL: **Is Alternative** checked, **Use Effective Date** checked, **Start Date** = invalid "99/99/9999" ✓ Invalid entry 2. Configure 2021-Tier 3: **Is Alternative** checked, **Use Effective Date** checked, **Start Date** = "05/01/2026" (valid) ✓ Valid entry 3. Attempt **Save** ✓ Validation runs 4. Verify error state ✓ Grid-level error: CorporatePrices control shows {invalid: true}
**Expected**: Grid validation aggregates errors from all rows, blocks save if any row has validation error
**Data**: office=1604 | invalidDate=99/99/9999 | validDate=05/01/2026

**Notes**: Per REQUIREMENTS.md: validateCorporatePriceGrid iterates all rows, sets CorporatePrices form control error if any row fails validation
**Automatable**: Yes

---
## TC-LOC-PRI-023: Verify Pricing tab has dedicated Save button (separate from left-panel Save)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Navigate to Setup > Location > 1604 -- **Pricing** tab ✓ Tab loads 2. Verify a dedicated **Save** button is visible inside the Pricing tabpanel (purple button, top-right of pricing card) ✓ Save button present and always enabled 3. Check **Is Alternative** for any price book row ✓ Row changes state 4. Click the Pricing **Save** button ✓ Save completes (no confirmation dialog needed) 5. Reload page and return to **Pricing** tab 6. Verify the row's **Is Alternative** state persisted ✓ Confirmed
**Expected**: Pricing tab has its own dedicated Save button, separate from the main left-panel Save. It is always enabled when Pricing tab is open and successfully persists pricing changes.
**Data**: office=1604

**Notes**: The `btnSavePricing` selector targets the Pricing tabpanel Save specifically. Other right-panel tabs (Local Information, Currency) do NOT have a tab-specific Save — they use the main panel Save.
**Automatable**: Yes

---
## TC-LOC-PRI-024: Price Guide Inclusive - edit and persist
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Navigate to Setup > Location > 1604 -> **Pricing** tab [OK] Tab loads 2. Verify **Price Guide Inclusive** checkbox [OK] Checked (default) 3. Uncheck **Price Guide Inclusive** [OK] Unchecked 4. Click **Save** (Pricing tab Save button) [OK] Save completes 5. Reload page and return to **Pricing** tab [OK] Tab loads 6. Verify **Price Guide Inclusive** [OK] Still unchecked (persisted) 7. Re-check **Price Guide Inclusive** [OK] Checked 8. Click **Save** [OK] Save completes 9. Reload and verify **Price Guide Inclusive** [OK] Checked (restored to default)
**Expected**: Price Guide Inclusive toggle state persists after save and page reload
**Data**: office=1604
**Cleanup**: Step 9 restores default checked state
**Automatable**: Yes

---

## TC-LOC-PRI-025: Corporate Pricing - toggle state persists after Save
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Navigate to Pricing tab [OK] **Corporate Pricing** is checked (default) 2. Uncheck **Corporate Pricing** [OK] Unchecked, Primary pricing dropdowns disabled 3. Click **Save** [OK] Save completes 4. Reload page and return to Pricing tab [OK] Tab loads 5. Verify **Corporate Pricing** [OK] Still unchecked (persisted) 6. Re-check **Corporate Pricing** [OK] Checked, Primary pricing dropdowns re-enabled 7. Click **Save** [OK] Save completes 8. Reload and verify **Corporate Pricing** [OK] Checked (restored to default)
**Expected**: Corporate Pricing checkbox state persists through save and reload
**Data**: office=1604
**Cleanup**: Step 8 restores default checked state
**Automatable**: Yes

---

## TC-LOC-PRI-026: Primary Labor Pricing - select and persist specific value
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Navigate to Pricing tab, ensure **Corporate Pricing** checked [OK] Primary pricing enabled 2. Click **Primary Labor Pricing** dropdown [OK] Dropdown opens 3. Select **2026-Zone 3 D** [OK] Value selected 4. Click **Save** [OK] Save completes 5. Reload and return to Pricing tab [OK] Tab loads 6. Verify **Primary Labor Pricing** [OK] Shows "2026-Zone 3 D"
**Expected**: Primary Labor Pricing "2026-Zone 3 D" persists after save
**Data**: office=1604 | value=2026-Zone 3 D
**Cleanup**: Reset **Primary Labor Pricing** to original value after test
**Automatable**: Yes

---

## TC-LOC-PRI-027: Primary Equipment Pricing - select and persist specific value
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Navigate to Pricing tab, ensure **Corporate Pricing** checked [OK] Primary pricing enabled 2. Click **Primary Equipment Pricing** dropdown [OK] Dropdown opens 3. Select **2026-Tier 2 Resort B** [OK] Value selected 4. Click **Save** [OK] Save completes 5. Reload and return to Pricing tab [OK] Tab loads 6. Verify **Primary Equipment Pricing** [OK] Shows "2026-Tier 2 Resort B"
**Expected**: Primary Equipment Pricing "2026-Tier 2 Resort B" persists after save
**Data**: office=1604 | value=2026-Tier 2 Resort B
**Cleanup**: Reset **Primary Equipment Pricing** to original value after test
**Automatable**: Yes

---

## TC-LOC-PRI-028: Primary Internal Equipment Pricing - select and persist specific value
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Navigate to Pricing tab, ensure **Corporate Pricing** checked [OK] Primary pricing enabled 2. Click **Primary Internal Equipment Pricing** dropdown [OK] Dropdown opens 3. Select **2023-Internal2** [OK] Value selected 4. Click **Save** [OK] Save completes 5. Reload and return to Pricing tab [OK] Tab loads 6. Verify **Primary Internal Equipment Pricing** [OK] Shows "2023-Internal2"
**Expected**: Primary Internal Equipment Pricing "2023-Internal2" persists after save
**Data**: office=1604 | value=2023-Internal2
**Cleanup**: Reset **Primary Internal Equipment Pricing** to original value after test
**Automatable**: Yes

---

## TC-LOC-PRI-029: Primary Production Labor Pricing - select and persist specific value
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Navigate to Pricing tab, ensure **Corporate Pricing** checked [OK] Primary pricing enabled 2. Click **Primary Production Labor Pricing** dropdown [OK] Dropdown opens 3. Select **2026-NP LB3** [OK] Value selected 4. Click **Save** [OK] Save completes 5. Reload and return to Pricing tab [OK] Tab loads 6. Verify **Primary Production Labor Pricing** [OK] Shows "2026-NP LB3"
**Expected**: Primary Production Labor Pricing "2026-NP LB3" persists after save
**Data**: office=1604 | value=2026-NP LB3
**Cleanup**: Reset **Primary Production Labor Pricing** to original value after test
**Automatable**: Yes

---

## TC-LOC-PRI-030: Primary Production Equipment Pricing - select and persist specific value
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | User-Requested |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Navigate to Pricing tab, ensure **Corporate Pricing** checked [OK] Primary pricing enabled 2. Click **Primary Production Equipment Pricing** dropdown [OK] Dropdown opens 3. Select **2026-NP Tier 2** [OK] Value selected 4. Click **Save** [OK] Save completes 5. Reload and return to Pricing tab [OK] Tab loads 6. Verify **Primary Production Equipment Pricing** [OK] Shows "2026-NP Tier 2"
**Expected**: Primary Production Equipment Pricing "2026-NP Tier 2" persists after save
**Data**: office=1604 | value=2026-NP Tier 2
**Cleanup**: Reset **Primary Production Equipment Pricing** to original value after test
**Automatable**: Yes

---

## TC-LOC-PRI-031: Save dialog Cancel — edit, Save, Cancel, form stays dirty, no data saved
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | State Transition |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Check **Is Alternative** on primary test row ✓ Checked 2. Verify **Save** enabled ✓ Enabled 3. Click **Save** ✓ Save Changes dialog appears 4. Click **Cancel** ✓ Dialog dismissed 5. Verify **Save** still enabled ✓ Enabled (form still dirty) 6. Reload Pricing tab ✓ Tab loads 7. Verify **Is Alternative** on primary test row ✓ Unchecked (data NOT persisted)
**Expected**: Cancelling the Save Changes dialog discards all pending changes; reload shows original state
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-pricing.spec.ts
**Automatable**: Yes

---

## TC-LOC-PRI-032: Unsaved changes dialog — edit, navigate away, Stay returns to form
| Priority | Status | Type |
|----------|--------|------|
| Medium | ✅ Automated | State Transition |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Navigate to **Pricing** tab ✓ Tab loads 2. Uncheck **Corporate Pricing** ✓ Unchecked (form dirty) 3. Verify **Save** enabled ✓ Enabled 4. Click sidebar Home link ✓ Unsaved changes dialog appears 5. Click **Stay** ✓ Dialog dismissed, stays on Pricing tab 6. Verify URL still contains locations path ✓ Correct page 7. Verify **Save** still enabled ✓ Enabled (form still dirty)
**Expected**: Clicking Stay on unsaved changes dialog returns to form with dirty state preserved
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-pricing.spec.ts
**Cleanup**: Re-check **Corporate Pricing** -- reload Pricing tab to discard dirty state
**Automatable**: Yes

---

## TC-LOC-PRI-033: Grid validation errors block Save — missing dates with cascade enabled
| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | Validation |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Reload **Pricing** tab ✓ Tab loads (clean state, LR-026) 2. Verify **Save** disabled ✓ Disabled (no pending changes) 3. Check **Is Alternative** on primary test row ✓ Checked 4. Wait for **Use Effective Date** enabled (LR-010 poll) ✓ Enabled 5. Check **Use Effective Date** ✓ Checked 6. Wait for date fields enabled (LR-010 poll) ✓ Enabled 7. Verify **Save** state with empty dates ✓ Disabled (validation error: required dates missing) 8. Enter valid Start Date and End Date ✓ Dates entered 9. Verify **Save** enabled ✓ Enabled (dirty + no validation errors)
**Expected**: Grid validation blocks Save when required date fields are empty after enabling cascade; Save enables after valid dates entered
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-pricing.spec.ts
**Cleanup**: Reset grid row (uncheck Is Alternative) -- reload Pricing tab (LR-026)
**Automatable**: Yes
**Notes**: MCP-1 unverified due to API 500 issue — hypothesis assertion will fail informatively if wrong

---

## TC-LOC-PRI-035: Read-only columns (Pricing Strategy, Pricebook, Currency) have no interactive elements
| Priority | Status | Type |
|----------|--------|------|
| Low | ✅ Automated | Structure |

**Depends_On**: TC-LOC-PRI-001
**Steps**: 1. Navigate to **Pricing** tab ✓ Tab loads 2. Inspect columns 1-3 (Pricing Strategy, Pricebook, Currency) on primary test row ✓ No button, checkbox, or input elements found
**Expected**: Read-only columns contain only display text — no interactive elements
**Data**: office=1604
**Status**: ✅ Automated
**Automation File**: specs/locations/location-pricing.spec.ts
**Automatable**: Yes
**Notes**: TC-LOC-PRI-034 intentionally does not exist (skipped ID)
