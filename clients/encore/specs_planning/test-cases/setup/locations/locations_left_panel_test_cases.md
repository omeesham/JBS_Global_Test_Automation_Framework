# Location - Left Panel (Basic Information) Test Cases

| Module | Test Cases | Automated | Manual | Out of Scope | Updated |
|--------|------------|-----------|--------|--------------|---------|
| Locations | 24 | 0 (0%) | 24 (100%) | 0 (0%) | 2026-02-19 |
---

## FIELD INVENTORY & DISCOVERY

**Total Fields**: 14 fields in left panel

| # | Field | Type | Default (1604) | State |
|---|-------|------|----------------|-------|
| 1 | Office | text input | 1604 | always disabled |
| 2 | Local Office | text input | 1604 | always disabled |
| 3 | Local Office Name | text input | Parker Palm Springs | editable |
| 4 | Active | checkbox (button[role=checkbox]) | checked | editable |
| 5 | Live Date | date picker (popover button) | May 8th, 2007 | editable |
| 6 | Tax Mode | combobox | US | editable |
| 7 | Country | combobox | United States | editable |
| 8 | Region | combobox | Palm Springs | editable |
| 9 | Servicing Branch Office | combobox | Select Servicing Branch Office | editable |
| 10 | Line Of Business | combobox | Hotel Services Division | editable |
| 11 | Pay To Address | text input | Encore | always disabled |
| 12 | Union | checkbox (button[role=checkbox]) | unchecked | editable |
| 13 | eCommerce Active | checkbox (button[role=checkbox]) | checked | always disabled |
| 14 | Enable Productions Orders | checkbox (button[role=checkbox]) | checked | always disabled |

**Checkbox Implementation Note**: Left-panel checkboxes are `button[role="checkbox"]` with `data-state="checked|unchecked"` — NOT `input[type="checkbox"]`. Selectors use `label:text-is("...") ~ button[role="checkbox"]`.

**Dropdown Options (verified live)**:
- Tax Mode: US | International (2 options)
- Country: United States | Mexico | Canada | Bahamas (4 options)
- Region: 59 options (US states + cities, alphabetical: Alabama, Arizona, Atlanta...)
- Line Of Business: 3 options (Convention and Tradeshow Services Division, Event Services Division, Hotel Services Division)
- Servicing Branch Office: 215 options (first: 0220 -- Test Location 0220)

**Save Button Disabled Conditions (verified live)**:
- `form.pristine` -- disabled on fresh page load ✓
- `locationDetail.TaxModeID == 0` -- disabled after country change clears Tax Mode ✓
- Form dirty (any change made) -- enabled, even with required field empty (LocalOfficeName error icon shows but Save still enables — live behaviour differs from documented `form.invalid` condition)

**Country Change Cascade (verified live)**:
- Any country change -- Tax Mode cleared (exclamation icon) + Region cleared
- USA -- Enable Job Costing in Local Info tab enabled/checked
- Non-USA (Canada, Mexico, Bahamas) -- Enable Job Costing unchecked in Local Info tab
- Canada -- "Remit PST Tax" checkbox appears in Local Info tab
- After country change, Tax Mode and Region are NOT auto-restored when selecting another country — must be manually re-selected
- Cascade also resets Legal tab Service Charge + Terms & Conditions (per requirements)

---

## TC-LOC-LP-001: Verify Left Panel Field Baseline State
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Baseline |

**Steps**: 1. Navigate to `locations/1604/settings` -- page loads 2. Verify **Office** shows 1604, disabled ✓ 3. Verify **Local Office** shows 1604, disabled ✓ 4. Verify **Local Office Name** shows "Parker Palm Springs", editable ✓ 5. Verify **Active** checkbox is checked ✓ 6. Verify **Live Date** shows "May 8th, 2007" ✓ 7. Verify **Tax Mode** shows "US" ✓ 8. Verify **Country** shows "United States" ✓ 9. Verify **Region** shows "Palm Springs" ✓ 10. Verify **Servicing Branch Office** shows "Select Servicing Branch Office" (no selection) ✓ 11. Verify **Line Of Business** shows "Hotel Services Division" ✓ 12. Verify **Pay To Address** shows "Encore", disabled ✓ 13. Verify **Union** is unchecked ✓ 14. Verify **eCommerce Active** is checked and disabled ✓ 15. Verify **Enable Productions Orders** is checked and disabled ✓
**Expected**: All 15 fields display expected default values in correct enabled/disabled state for location 1604
**Data**: `Office=1604` | `LocalOfficeName=Parker Palm Springs` | `Active=checked` | `LiveDate=May 8th, 2007` | `TaxMode=US` | `Country=United States` | `Region=Palm Springs` | `LOB=Hotel Services Division`
**Automatable**: Yes

---

## TC-LOC-LP-002: Verify Office Field is Always Disabled
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Field State |

**Preconditions**: Located on Basic Information page for location 1604
**Steps**: 1. Observe **Office** text input showing "1604" ✓ Verify field has disabled attribute 2. Attempt to click the field -- field receives no focus 3. Verify no cursor or editing interaction is possible
**Expected**: Office field is permanently read-only; cannot be clicked or edited
**Automatable**: Yes

---

## TC-LOC-LP-003: Verify Local Office Field is Always Disabled
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Field State |

**Preconditions**: Located on Basic Information page for location 1604
**Steps**: 1. Observe **Local Office** showing "1604", disabled ✓ 2. Attempt to click -- no focus 3. Verify value cannot be changed
**Expected**: Local Office field is permanently read-only
**Automatable**: Yes

---

## TC-LOC-LP-004: Verify Pay To Address Field is Always Disabled
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Field State |

**Preconditions**: Located on Basic Information page for location 1604
**Steps**: 1. Observe **Pay To Address** showing "Encore", disabled ✓ Field is read-only, cannot receive focus 2. Attempt to click -- no focus acquired, value unchanged
**Expected**: Pay To Address input is permanently read-only, always shows "Encore" for location 1604
**Automatable**: Yes

---

## TC-LOC-LP-005: Verify eCommerce Active is Permanently Disabled
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Field State |

**Preconditions**: Located on Basic Information page for location 1604
**Steps**: 1. Observe **eCommerce Active** checkbox is checked and disabled 2. Attempt to click -- checkbox state does not change 3. Verify it remains checked regardless of other field changes
**Expected**: eCommerce Active is permanently checked and non-interactive
**Automatable**: Yes

---

## TC-LOC-LP-006: Verify Enable Productions Orders is Permanently Disabled
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Field State |

**Preconditions**: Located on Basic Information page for location 1604
**Steps**: 1. Observe **Enable Productions Orders** checkbox is checked and disabled 2. Attempt to click -- no state change 3. Verify it remains checked throughout session
**Expected**: Enable Productions Orders is permanently checked and non-interactive
**Automatable**: Yes

---

## TC-LOC-LP-007: Verify Save Button Disabled on Fresh Page Load
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Save Button |

**Preconditions**: Navigate fresh to `locations/1604/settings` (no prior changes)
**Steps**: 1. Page loads completely -- left panel visible 2. Verify **Save** button is disabled (grayed out, not clickable) 3. Verify no form changes have been made (pristine state)
**Expected**: Save button is disabled on fresh load because form.pristine = true
**Notes**: Save disabled condition: `form.pristine = true`
**Automatable**: Yes

---

## TC-LOC-LP-008: Verify Save Button Enables After Any Form Change
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Save Button |

**Preconditions**: Fresh page load — Save is disabled
**Steps**: 1. Verify **Save** is disabled ✓ 2. Toggle **Union** checkbox (check it) -- Save becomes enabled ✓ 3. Toggle **Union** back to unchecked -- Save remains enabled (form still dirty) ✓
**Expected**: Save button enables as soon as any field is changed; does not return to disabled even if field is reset to original value
**Notes**: Once dirty, form stays dirty until page reload
**Automatable**: Yes

---

## TC-LOC-LP-009: Verify Local Office Name Required Validation
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Validation |

**Preconditions**: On Basic Information page, form in pristine state
**Steps**: 1. Click **Local Office Name** field -- focus 2. Select all text (Ctrl+A) and delete -- field becomes empty 3. Press Tab to blur -- exclamation icon (⚠) appears next to the field ✓ 4. Observe **Save** button state -- Save becomes enabled (form is dirty) 5. Verify exclamation icon is visible indicating required error
**Expected**: Clearing Local Office Name shows exclamation validation icon; Save enables due to dirty form (live behaviour — note: Save does not become disabled despite empty required field)
**Notes**: Live-verified: clearing LocalOfficeName shows error icon BUT Save enables (form.pristine = false overrides). Differs from documented `form.invalid disables Save` condition. This discrepancy should be noted as a live finding.
**Automatable**: Yes

---

## TC-LOC-LP-010: Verify Local Office Name Max 50 Characters
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Validation |

**Preconditions**: On Basic Information page for location 1604
**Steps**: 1. Click **Local Office Name** field -- clear existing text 2. Type exactly 50 characters -- value accepted ✓ 3. Attempt to type 51st character -- character should not be entered (max length enforced) ✓ 4. Verify field value is truncated at 50 chars
**Expected**: Local Office Name accepts maximum 50 characters; additional characters are rejected
**Data**: `maxLength=50` | `testValue=AAAAAAAAAABBBBBBBBBBCCCCCCCCCCDDDDDDDDDDEEEEEEEEEE` (50 chars)
**Cleanup**: Restore field to "Parker Palm Springs" and save
**Automatable**: Yes

---

## TC-LOC-LP-011: Verify Active Checkbox Toggle
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Field Interaction |

**Preconditions**: Active is checked (default for location 1604)
**Steps**: 1. Verify **Active** checkbox is checked ✓ 2. Click **Active** -- uncheck it ✓ Observe Save enables 3. Click **Save** -- save succeeds 4. Reload page -- Active shows unchecked ✓ 5. Click **Active** -- re-check ✓ Save enables 6. Click **Save** -- save succeeds 7. Reload page -- Active shows checked ✓
**Expected**: Active checkbox state persists through save-reload cycle in both checked and unchecked states
**Cleanup**: Restore Active to checked and save
**Automatable**: Yes

---

## TC-LOC-LP-012: Verify Union Checkbox Toggle
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Field Interaction |

**Preconditions**: Union is unchecked (default for location 1604)
**Steps**: 1. Verify **Union** checkbox is unchecked ✓ 2. Click **Union** -- check it ✓ Save enables 3. Click **Save** -- save succeeds 4. Reload page -- Union shows checked ✓ 5. Navigate to **Local Information** tab -- verify **ETS Percentage** default value with Union=checked and document the observed value (Union flag affects ETS default) 6. Return to **Basic Information** tab 7. Uncheck **Union** -- Save -- reload -- Union shows unchecked ✓
**Expected**: Union checkbox toggles and persists. ETS Percentage default value is documented for Union=checked vs Union=unchecked.
**Cleanup**: Restore Union to unchecked and save
**Automatable**: Yes

---

## TC-LOC-LP-013: Verify Tax Mode Dropdown Options
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Dropdown |

**Preconditions**: On Basic Information page for location 1604
**Steps**: 1. Click **Tax Mode** dropdown -- dropdown opens ✓ 2. Verify exactly 2 options: "US" and "International" ✓ 3. Verify current selection is "US" ✓ 4. Press Escape -- dropdown closes
**Expected**: Tax Mode shows exactly 2 options: US, International
**Data**: `options=[US, International]` | `currentValue=US`
**Automatable**: Yes

---

## TC-LOC-LP-014: Verify Country Dropdown Options
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Dropdown |

**Preconditions**: On Basic Information page for location 1604
**Steps**: 1. Click **Country** dropdown -- opens ✓ 2. Verify exactly 4 options: United States, Mexico, Canada, Bahamas ✓ 3. Verify current selection is "United States" ✓ 4. Press Escape -- close
**Expected**: Country contains exactly 4 options: United States, Mexico, Canada, Bahamas
**Data**: `options=[United States, Mexico, Canada, Bahamas]` | `currentValue=United States`
**Automatable**: Yes

---

## TC-LOC-LP-015: Verify Region Dropdown Options and Selectability
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Dropdown |

**Preconditions**: On Basic Information page for location 1604
**Steps**: 1. Click **Region** dropdown -- opens ✓ 2. Verify 59 options (alphabetical: Alabama, Arizona, Atlanta, Boston...) ✓ 3. Verify current selection is "Palm Springs" ✓ 4. Select "Boston" from the list -- Region changes to Boston ✓ 5. Reload page without saving -- Region reverts to "Palm Springs" (changes not persisted)
**Expected**: Region has 59 options, current is Palm Springs; selecting different region updates field
**Data**: `optionCount=59` | `currentValue=Palm Springs`
**Automatable**: Yes

---

## TC-LOC-LP-016: Verify Line Of Business Dropdown Options
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Dropdown |

**Preconditions**: On Basic Information page for location 1604
**Steps**: 1. Click **Line Of Business** dropdown -- opens ✓ 2. Verify exactly 3 options: "Convention and Tradeshow Services Division", "Event Services Division", "Hotel Services Division" ✓ 3. Verify current selection is "Hotel Services Division" ✓ 4. Press Escape -- close
**Expected**: Line Of Business has exactly 3 options; current is Hotel Services Division
**Data**: `options=[Convention and Tradeshow Services Division, Event Services Division, Hotel Services Division]`
**Automatable**: Yes

---

## TC-LOC-LP-017: Verify Servicing Branch Office Dropdown and Required State
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Dropdown |

**Preconditions**: On Basic Information page for location 1604
**Steps**: 1. Click **Servicing Branch Office** dropdown -- opens ✓ 2. Verify 215 options (first: "0220 -- Test Location 0220") ✓ 3. Verify current UI shows "Select Servicing Branch Office" (no selection for 1604) ✓ 4. Select any option -- field updates, Save enables ✓
**Expected**: Servicing Branch Office has 215 options; GLServicingDivisionValue must be ≥1 (selecting a value satisfies validation)
**Data**: `optionCount=215` | `default=Select Servicing Branch Office (value=0)`
**Notes**: GLServicingDivisionValue corresponds to this field. Validator: `Validators.min(1)` — having no selection means value=0 which fails validation. Whether this prevents Save is consistent with `form.invalid` condition. Last option not asserted (sorted list may vary by environment).
**Automatable**: Yes

---

## TC-LOC-LP-018: Verify Country Change Clears Tax Mode and Region
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Country Cascade |

**Preconditions**: On Basic Information page, Country = United States, Tax Mode = US, Region = Palm Springs
**Steps**: 1. Verify Tax Mode = "US", Region = "Palm Springs" ✓ 2. Click **Country** -- select "Canada" 3. Observe **Tax Mode** dropdown is now empty (cleared) with exclamation icon ✓ 4. Observe **Region** dropdown is now empty (cleared) ✓ 5. Verify Save button is now disabled (TaxModeID = 0) ✓
**Expected**: Changing country clears Tax Mode (shows error) and Region; Save becomes disabled because TaxModeID = 0
**Notes**: Tax Mode and Region must be manually re-selected after country change
**Automatable**: Yes

---

## TC-LOC-LP-019: Verify Save Disabled After Country Change (TaxModeID = 0)
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Save Button / Cascade |

**Preconditions**: On Basic Information page; Country = United States, Tax Mode = US, Region = Palm Springs
**Steps**: 1. Click **Country** -- select "Canada" ↓ Tax Mode and Region are cleared 2. Verify **Save** button is disabled (TaxModeID = 0) ✓ 3. Click **Tax Mode** -- select "International" ✓ 4. Verify **Save** button is now enabled ✓ 5. Re-select Country to a different value -- Tax Mode clears again -- Save disables
**Expected**: Save disabled when TaxModeID = 0; selecting a Tax Mode value re-enables Save (if no other disable conditions present)
**Notes**: `locationDetail.TaxModeID == 0` is an explicit Save disabled condition per source code
**Automatable**: Yes

---

## TC-LOC-LP-020: Verify Tax Mode Not Auto-Restored After Country Change
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Country Cascade |

**Preconditions**: Country changed from United States to Canada (Tax Mode cleared)
**Steps**: 1. Verify Tax Mode is empty after Canada selection ✓ 2. Click **Country** -- select "United States" again 3. Observe **Tax Mode** — verify it remains empty (not auto-restored to "US") ✓ 4. Observe **Region** — verify it remains empty ✓
**Expected**: Switching country back to United States does NOT auto-restore Tax Mode or Region; manual re-selection required every time country changes
**Cleanup**: Reload page to restore pristine state
**Automatable**: Yes

---

## TC-LOC-LP-021: Verify Country = USA Enables Job Costing in Local Information
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Country Cascade / Cross-Tab |

**Preconditions**: On Basic Information page, Country = United States
**Steps**: 1. Click **Local Information** tab -- verify **Enable Job Costing** checkbox is checked ✓ 2. Return to Basic Information tab 3. Click **Country** -- select "Canada" 4. Click **Local Information** tab 5. Observe **Enable Job Costing** -- verify it is now unchecked ✓
**Expected**: Enable Job Costing is USA-only; changing to non-USA country automatically unchecks it in Local Information tab
**Automatable**: Yes

---

## TC-LOC-LP-022: Verify Country = Canada Reveals Remit PST Tax in Local Information
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Country Cascade / Cross-Tab |

**Preconditions**: On Basic Information page, Country = United States
**Steps**: 1. Click **Local Information** tab -- verify no "Remit PST Tax" checkbox visible ✓ 2. Return to Basic Information tab 3. Click **Country** -- select "Canada" 4. Click **Local Information** tab 5. Observe **Remit PST Tax** checkbox -- verify it appears (checked by default) ✓
**Expected**: Remit PST Tax is a Canada-specific field; only appears in Local Information tab when Country = Canada
**Cleanup**: Reload page to restore Country to United States
**Automatable**: Yes

---

## TC-LOC-LP-023: Verify Live Date Button Opens Popover
| Priority | Status | Type |
|----------|--------|------|
| Low | Manual | Field Interaction |

**Preconditions**: On Basic Information page for location 1604
**Steps**: 1. Observe **Live Date** shows "May 8th, 2007" rendered as a button (cursor: pointer) ✓ 2. Click **Live Date** button -- date picker popover opens ✓ 3. Verify calendar displays the saved date (May 2007) ✓ 4. Press Escape or click outside -- popover closes; date unchanged ✓
**Expected**: Live Date is a clickable button (not a plain text field); clicking opens a date picker popover showing the saved date. The Pay To Address input above it remains read-only regardless.
**Notes**: Live Date confirmed as "May 8th, 2007" for office 1604 (verified 2026-02-19). Displayed as "Month Day, Year" format.
**Automatable**: Yes

---

## TC-LOC-LP-024: Verify Cross-Tab Save Validation — Legal Tab Invalid
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Cross-Tab / Save Button |

**Preconditions**: Navigate to `locations/1604/settings`, form in pristine state
**Steps**: 1. Click **Legal** tab -- Legal tab opens showing grid 2. Clear a **Service Charge Name** dropdown -- exclamation icon appears ✓ 3. Return to **Basic Information** tab (left panel) 4. Toggle **Union** checkbox -- Save enables ✓ 5. Click **Save** -- observe whether save succeeds or is blocked by Legal validation 6. Document exact behavior: save blocked (expected per `!isValidLegalData()`) OR save succeeds with Legal error persisting
**Expected**: Per requirements `!isValidLegalData()` is a Save disabled condition. Document actual observed behavior for cross-tab save interaction.
**Notes**: Legal tab validation cross-tab interaction. The Legal pipeline covers dedicated Legal testing. This TC verifies only the cross-tab Save button behavior.
**Data**: `Location=1604` | `LegalGrid=1 row (US English)`

**Automatable**: Yes