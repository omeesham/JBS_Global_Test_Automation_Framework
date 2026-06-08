# Location - Left Panel (Basic Information) Test Cases

| Module | Test Cases | Automated | Automated | Out of Scope | Updated |
|--------|------------|-----------|--------|--------------|---------|
| Locations | 27 | 26 (96%) | 1 (4%) | 0 (0%) | 2026-06-03 |

> Automated 2026-06-03 (SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC). 26 of 27 TCs automated in `clients/encore/specs/locations/location-left-panel-basic-information.spec.ts` (full run 27 passed ×2). TC-024 deferred (see its note). Live corrections to the original MD captured inline below (LR-020).
---

## FIELD INVENTORY & DISCOVERY

**Total Fields**: 14 fields in left panel — **live-corrected 2026-06-03: 6 read-only + 8 editable** (Line Of Business is read-only in EDIT mode per Encore NM-831/NM-1140, NOT editable as originally documented)

| # | Field | Type | Default (1604) | State |
|---|-------|------|----------------|-------|
| 1 | Office | text input | 1604 | always disabled |
| 2 | Local Office | text input | 1604 | always disabled |
| 3 | Local Office Name | text input | Parker Palm Springs | editable |
| 4 | Active | checkbox (button[role=checkbox]) | checked | editable |
| 5 | Live Date | date picker (popover button) | volatile (1604 shared office — e.g. June 15 1990 / Sep 6 1989 / Aug 28 1989 across runs) | editable |
| 6 | Tax Mode | combobox | US | editable |
| 7 | Country | combobox | United States | editable |
| 8 | Region | combobox | Palm Springs | editable |
| 9 | Servicing Branch Office | combobox | Select Servicing Branch Office | editable |
| 10 | Line Of Business | combobox (DISABLED) | Hotel Services Division | **read-only** (NM-831/NM-1140 — selectable only at creation) |
| 11 | Pay To Address | text input | Encore | always disabled |
| 12 | Union | checkbox (button[role=checkbox]) | unchecked | editable |
| 13 | eCommerce Active | checkbox (button[role=checkbox]) | checked | always disabled |
| 14 | Enable Productions Orders | checkbox (button[role=checkbox]) | checked | always disabled |

**Checkbox Implementation Note**: Left-panel checkboxes are `button[role="checkbox"]` with `data-state="checked|unchecked"` — NOT `input[type="checkbox"]`. Selectors use `label:text-is(".") ~ button[role="checkbox"]`.

**Dropdown Options (verified live)**:
- Tax Mode: US | International (2 options)
- Country: United States | Mexico | Canada | Bahamas (4 options)
- Region: 59 options (US states + cities, alphabetical: Alabama, Arizona, Atlanta.)
- Line Of Business: **disabled/read-only in edit mode** (NM-831/NM-1140) — dropdown does not open; displays "Hotel Services Division"
- Servicing Branch Office: **218 options** (live 2026-06-03; first option varies, e.g. "1752 -- W Hoboken" — original MD's "215 / 0220" was stale)

**Save Button Disabled Conditions (verified live)**:
- `the clean state` -- disabled on fresh page load ✓
- `locationDetail.TaxModeID == 0` -- disabled after country change clears Tax Mode ✓
- Form dirty (valid change) -- enabled. **Correction (live 2026-06-03)**: clearing the required Local Office Name leaves Save **DISABLED** (the empty required field gates Save — matches the requirement; the earlier "Save enables on empty" observation no longer reproduces). Reverting a change back to its original value is a net-zero → Save returns to disabled (LR-009/LR-026); the earlier "stays dirty after revert" note no longer reproduces. **Local Office Name maxlength = 255** live (not 50 — flagged to Encore).

**Country Change Cascade (verified live)**:
- Any country change -- Tax Mode cleared (exclamation icon) + Region cleared
- USA -- Enable Job Costing in Local Info tab enabled/checked
- Non-USA (Canada, Mexico, Bahamas) -- Enable Job Costing unchecked in Local Info tab
- Canada -- "Remit PST Tax" checkbox appears in Local Info tab
- After country change, Tax Mode and Region are NOT auto-restored when selecting another country — must be manually re-selected
- Cascade also resets Legal tab Service Charge + Terms & Conditions (per requirements)

---

## MCP_VERIFICATION_LOG

Live-DOM verification (selectors, defaults, states) is captured in **FIELD INVENTORY & DISCOVERY** above (office 1604, live-corrected 2026-06-03). Key verified facts: 14 left-panel fields (6 read-only + 8 editable); Line Of Business is read-only in edit mode (NM-831/NM-1140); Live Date is volatile on the shared 1604 office.

## Validation Rules

- **Required field gates Save**: clearing the required **Local Office Name** leaves Save **disabled**; a valid dirty change enables Save; a net-zero revert returns Save to disabled (LR-009 / LR-026).
- **Line Of Business read-only in edit mode** (NM-831/NM-1140) — selectable only at creation; the dropdown does not open for an existing location.
- **Country change**: does NOT auto-restore Tax Mode / Region — they must be manually re-selected after a country change.
- **Always-disabled**: Office, Local Office, Pay To Address, eCommerce Active, Enable Productions Orders.
- **Field note**: Local Office Name live `maxlength=255` (not 50 — divergence flagged to Encore).

## TC-LOC-LP-001: Verify Left Panel Field Baseline State
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Baseline |

**Steps**: 1. Navigate to `locations/1604/settings` -- page loads 2. Verify **Office** shows 1604, disabled ✓ 3. Verify **Local Office** shows 1604, disabled ✓ 4. Verify **Local Office Name** shows "Parker Palm Springs", editable ✓ 5. Verify **Active** checkbox is checked ✓ 6. Verify **Live Date** displays a date in "Month Dayth, YYYY" format (the value is not asserted — 1604 is a shared test office whose Live Date changes between runs) ✓ 7. Verify **Tax Mode** shows "US" ✓ 8. Verify **Country** shows "United States" ✓ 9. Verify **Region** shows "Palm Springs" ✓ 10. Verify **Servicing Branch Office** shows "Select Servicing Branch Office" (no selection) ✓ 11. Verify **Line Of Business** shows "Hotel Services Division" ✓ 12. Verify **Pay To Address** shows "Encore", disabled ✓ 13. Verify **Union** is unchecked ✓ 14. Verify **eCommerce Active** is checked and disabled ✓ 15. Verify **Enable Productions Orders** is checked and disabled ✓
**Expected**: All 15 fields display expected default values in correct enabled/disabled state for location 1604
**Data**: `Office=1604` | `LocalOfficeName=Parker Palm Springs` | `Active=checked` | `LiveDate=(volatile; assert format only; live 2026-06-03 = June 15th, 1990)` | `TaxMode=US` | `Country=United States` | `Region=Palm Springs` | `LOB=Hotel Services Division`
**Automatable**: Yes

---

## TC-LOC-LP-002: Verify Office Field is Always Disabled
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Field State |

**Preconditions**: Located on Basic Information page for location 1604
**Steps**: 1. Observe **Office** text input showing "1604" ✓ Verify field has disabled attribute 2. Attempt to click the field -- field receives no focus 3. Verify no cursor or editing interaction is possible
**Expected**: Office field is permanently read-only; cannot be clicked or edited
**Automatable**: Yes

---

## TC-LOC-LP-003: Verify Local Office Field is Always Disabled
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Field State |

**Preconditions**: Located on Basic Information page for location 1604
**Steps**: 1. Observe **Local Office** showing "1604", disabled ✓ 2. Attempt to click -- no focus 3. Verify value cannot be changed
**Expected**: Local Office field is permanently read-only
**Automatable**: Yes

---

## TC-LOC-LP-004: Verify Pay To Address Field is Always Disabled
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Field State |

**Preconditions**: Located on Basic Information page for location 1604
**Steps**: 1. Observe **Pay To Address** showing "Encore", disabled ✓ Field is read-only, cannot receive focus 2. Attempt to click -- no focus acquired, value unchanged
**Expected**: Pay To Address input is permanently read-only, always shows "Encore" for location 1604
**Automatable**: Yes

---

## TC-LOC-LP-005: Verify eCommerce Active is Permanently Disabled
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Field State |

**Preconditions**: Located on Basic Information page for location 1604
**Steps**: 1. Observe **eCommerce Active** checkbox is checked and disabled 2. Attempt to click -- checkbox state does not change 3. Verify it remains checked regardless of other field changes
**Expected**: eCommerce Active is permanently checked and non-interactive
**Automatable**: Yes

---

## TC-LOC-LP-006: Verify Enable Productions Orders is Permanently Disabled
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Field State |

**Preconditions**: Located on Basic Information page for location 1604
**Steps**: 1. Observe **Enable Productions Orders** checkbox is checked and disabled 2. Attempt to click -- no state change 3. Verify it remains checked throughout session
**Expected**: Enable Productions Orders is permanently checked and non-interactive
**Automatable**: Yes

---

## TC-LOC-LP-007: Verify Save Button Disabled on Fresh Page Load
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Save Button |

**Preconditions**: Navigate fresh to `locations/1604/settings` (no prior changes)
**Steps**: 1. Page loads completely -- left panel visible 2. Verify **Save** button is disabled (grayed out, not clickable) 3. Verify no form changes have been made (pristine state)
**Expected**: Save button is disabled on fresh load because the clean state = true
**Notes**: Save disabled condition: `the clean state = true`
**Automatable**: Yes

---

## TC-LOC-LP-008: Verify Save Button Enables After Any Form Change
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Save Button |

**Preconditions**: Fresh page load — Save is disabled
**Steps**: 1. Verify **Save** is disabled ✓ 2. Toggle **Union** checkbox (check it) -- Save becomes enabled ✓ 3. Toggle **Union** back to unchecked (reverting to the original value) -- Save returns to DISABLED (the form detects no net change) ✓
**Expected**: Save enables as soon as any field is changed; reverting the change back to its original value results in no net change, so Save returns to DISABLED
**Notes**: Reverting a change back to its original value returns Save to disabled (no net change).
**Automatable**: Yes

---

## TC-LOC-LP-009: Verify Local Office Name Required Validation
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Validation |

**Preconditions**: On Basic Information page, form in pristine state
**Steps**: 1. Click **Local Office Name** field -- focus 2. Select all text (Ctrl+A) and delete -- field becomes empty 3. Press Tab to blur -- exclamation icon (⚠) appears next to the field ✓ 4. Observe **Save** button state -- Save stays DISABLED (the empty required field gates Save) ✓ 5. Verify exclamation icon is visible indicating required error
**Expected**: Clearing the required Local Office Name shows the exclamation validation icon AND Save stays DISABLED (the empty required field gates Save — matches the requirement).
**Notes**: Clearing the required name shows the error icon and leaves Save disabled, consistent with the documented invalid-state-disables-Save behavior.
**Automatable**: Yes

---

## TC-LOC-LP-010: Verify Local Office Name maxlength (live = 255)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Validation |

**Preconditions**: On Basic Information page for location 1604
**Steps**: 1. Click **Local Office Name** field -- clear existing text 2. Read the input's `maxlength` attribute -- value is **255** ✓ 3. The browser enforces the limit on keystroke at 255 characters ✓
**Expected**: Local Office Name input enforces a maximum length of **255** characters (an open question for Encore — is 255 the intended limit, or should it be 50?)
**Data**: `maxLength=255` (live) | `testValue=AAAAAAAAAABBBBBBBBBBCCCCCCCCCCDDDDDDDDDDEEEEEEEEEE` (50-char sample)
**Cleanup**: Restore field to "Parker Palm Springs" and save
**Automatable**: Yes

---

## TC-LOC-LP-011: Verify Active Checkbox Toggle
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Field Interaction |

**Preconditions**: Active is checked (default for location 1604)
**Steps**: 1. Verify **Active** checkbox is checked ✓ 2. Click **Active** -- uncheck it ✓ Observe Save enables 3. Click **Save** -- save succeeds 4. Reload page -- Active shows unchecked ✓ 5. Click **Active** -- re-check ✓ Save enables 6. Click **Save** -- save succeeds 7. Reload page -- Active shows checked ✓
**Expected**: Active checkbox state persists through save-reload cycle in both checked and unchecked states
**Cleanup**: Restore Active to checked and save
**Automatable**: Yes

---

## TC-LOC-LP-012: Verify Union Checkbox Toggle
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Field Interaction |

**Preconditions**: Union is unchecked (default for location 1604)
**Steps**: 1. Verify **Union** checkbox is unchecked ✓ 2. Click **Union** -- check it ✓ Save enables 3. Click **Save** -- save succeeds 4. Reload page -- Union shows checked ✓ 5. Navigate to **Local Information** tab -- verify **ETS Percentage** default value with Union=checked and document the observed value (Union flag affects ETS default) 6. Return to **Basic Information** tab 7. Uncheck **Union** -- Save -- reload -- Union shows unchecked ✓
**Expected**: Union checkbox toggles and persists. ETS Percentage default value is documented for Union=checked vs Union=unchecked.
**Cleanup**: Restore Union to unchecked and save
**Automatable**: Yes

---

## TC-LOC-LP-013: Verify Tax Mode Dropdown Options
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Dropdown |

**Preconditions**: On Basic Information page for location 1604
**Steps**: 1. Click **Tax Mode** dropdown -- dropdown opens ✓ 2. Verify exactly 2 options: "US" and "International" ✓ 3. Verify current selection is "US" ✓ 4. Press Escape -- dropdown closes
**Expected**: Tax Mode shows exactly 2 options: US, International
**Data**: `options=[US, International]` | `currentValue=US`
**Automatable**: Yes

---

## TC-LOC-LP-014: Verify Country Dropdown Options
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Dropdown |

**Preconditions**: On Basic Information page for location 1604
**Steps**: 1. Click **Country** dropdown -- opens ✓ 2. Verify exactly 4 options: United States, Mexico, Canada, Bahamas ✓ 3. Verify current selection is "United States" ✓ 4. Press Escape -- close
**Expected**: Country contains exactly 4 options: United States, Mexico, Canada, Bahamas
**Data**: `options=[United States, Mexico, Canada, Bahamas]` | `currentValue=United States`
**Automatable**: Yes

---

## TC-LOC-LP-015: Verify Region Dropdown Options and Selectability
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Dropdown |

**Preconditions**: On Basic Information page for location 1604
**Steps**: 1. Click **Region** dropdown -- opens ✓ 2. Verify 59 options (alphabetical: Alabama, Arizona, Atlanta, Boston.) ✓ 3. Verify current selection is "Palm Springs" ✓ 4. Select "Boston" from the list -- Region changes to Boston ✓ 5. Reload page without saving -- Region reverts to "Palm Springs" (changes not persisted)
**Expected**: Region has 59 options, current is Palm Springs; selecting different region updates field
**Data**: `optionCount=59` | `currentValue=Palm Springs`
**Automatable**: Yes

---

## TC-LOC-LP-016: Verify Line Of Business is Read-Only (disabled in edit mode)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Dropdown |

**Preconditions**: On Basic Information page for location 1604
**Steps**: 1. Observe **Line Of Business** combobox is **disabled** (read-only) ✓ 2. Verify the dropdown does NOT open (disabled Radix combobox) 3. Verify displayed value is "Hotel Services Division" ✓
**Expected**: Line Of Business is **read-only/disabled in EDIT mode** (selectable only at location creation); displays "Hotel Services Division". Both the live site and the baseline site show this field disabled (the original documentation's editable 3-option dropdown was inaccurate).
**Data**: `options=[Convention and Tradeshow Services Division, Event Services Division, Hotel Services Division]`
**Automatable**: Yes

---

## TC-LOC-LP-017: Verify Servicing Branch Office Dropdown and Required State
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Dropdown |

**Preconditions**: On Basic Information page for location 1604
**Steps**: 1. Click **Servicing Branch Office** dropdown -- opens ✓ 2. Verify the dropdown lists **>200 options** (218 at last check; first option varies by environment, e.g. "1752 -- W Hoboken") ✓ 3. Verify current UI shows "Select Servicing Branch Office" (no selection for 1604) ✓ 4. Select any option -- field updates, Save enables ✓
**Expected**: Servicing Branch Office lists more than 200 options (218 at last check; the exact count is not asserted); GL Servicing Division must be ≥1 (selecting a value satisfies validation)
**Data**: `optionCount=218 (live 2026-06-03; spec asserts >200, not exact)` | `default=Select Servicing Branch Office (value=0)`
**Notes**: GL Servicing Division corresponds to this field. Validator: `Validators.min(1)` — having no selection means value=0 which fails validation. Whether this prevents Save is consistent with `the invalid state` condition. Last option not asserted (sorted list may vary by environment).
**Automatable**: Yes

---

## TC-LOC-LP-018: Verify Country Change Clears Tax Mode and Region
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Country Cascade |

**Preconditions**: On Basic Information page, Country = United States, Tax Mode = US, Region = Palm Springs
**Steps**: 1. Verify Tax Mode = "US", Region = "Palm Springs" ✓ 2. Click **Country** -- select "Canada" 3. Observe **Tax Mode** dropdown is now empty (cleared) with exclamation icon ✓ 4. Observe **Region** dropdown is now empty (cleared) ✓ 5. Verify Save button is now disabled (TaxModeID = 0) ✓
**Expected**: Changing country clears Tax Mode (shows error) and Region; Save becomes disabled because TaxModeID = 0
**Notes**: Tax Mode and Region must be manually re-selected after country change
**Automatable**: Yes

---

## TC-LOC-LP-019: Verify Save Disabled After Country Change (TaxModeID = 0)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Save Button / Cascade |

**Preconditions**: On Basic Information page; Country = United States, Tax Mode = US, Region = Palm Springs
**Steps**: 1. Click **Country** -- select "Canada" ↓ Tax Mode and Region are cleared 2. Verify **Save** button is disabled (TaxModeID = 0) ✓ 3. Click **Tax Mode** -- select "International" ✓ 4. Verify **Save** button is now enabled ✓ 5. Re-select Country to a different value -- Tax Mode clears again -- Save disables
**Expected**: Save disabled when TaxModeID = 0; selecting a Tax Mode value re-enables Save (if no other disable conditions present)
**Notes**: `locationDetail.TaxModeID == 0` is an explicit Save disabled condition per source code
**Automatable**: Yes

---

## TC-LOC-LP-020: Verify Tax Mode Not Auto-Restored After Country Change
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Country Cascade |

**Preconditions**: Country changed from United States to Canada (Tax Mode cleared)
**Steps**: 1. Verify Tax Mode is empty after Canada selection ✓ 2. Click **Country** -- select "United States" again 3. Observe **Tax Mode** — verify it remains empty (not auto-restored to "US") ✓ 4. Observe **Region** — verify it remains empty ✓
**Expected**: Switching country back to United States does NOT auto-restore Tax Mode or Region; manual re-selection required every time country changes
**Cleanup**: Reload page to restore pristine state
**Automatable**: Yes

---

## TC-LOC-LP-021: Verify Country = USA Enables Job Costing in Local Information
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Country Cascade / Cross-Tab |

**Preconditions**: On Basic Information page, Country = United States
**Steps**: 1. Click **Local Information** tab -- verify **Enable Job Costing** checkbox is checked ✓ 2. Return to Basic Information tab 3. Click **Country** -- select "Canada" 4. Click **Local Information** tab 5. Observe **Enable Job Costing** -- verify it is now unchecked ✓
**Expected**: Enable Job Costing is USA-only; changing to non-USA country automatically unchecks it in Local Information tab
**Automatable**: Yes

---

## TC-LOC-LP-022: Verify Country = Canada Reveals Remit PST Tax in Local Information
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Country Cascade / Cross-Tab |

**Preconditions**: On Basic Information page, Country = United States
**Steps**: 1. Click **Local Information** tab -- verify no "Remit PST Tax" checkbox visible ✓ 2. Return to Basic Information tab 3. Click **Country** -- select "Canada" 4. Click **Local Information** tab 5. Observe **Remit PST Tax** checkbox -- verify it appears (checked by default) ✓
**Expected**: Remit PST Tax is a Canada-specific field; only appears in Local Information tab when Country = Canada
**Cleanup**: Reload page to restore Country to United States
**Automatable**: Yes

---

## TC-LOC-LP-023: Verify Live Date Button Opens Popover
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Field Interaction |

**Preconditions**: On Basic Information page for location 1604
**Steps**: 1. Observe **Live Date** rendered as a button (cursor: pointer) showing a date in "Month Dayth, YYYY" format (value-agnostic — 1604's Live Date drifts between runs) ✓ 2. Click **Live Date** button -- date picker popover opens ✓ 3. Verify the date-picker popover opens (the spec asserts the popover opens; calendar contents are value-agnostic) ✓ 4. Press Escape or click outside -- popover closes; date unchanged ✓
**Expected**: Live Date is a clickable button (not a plain text field); clicking opens a date picker popover showing the saved date. The Pay To Address input above it remains read-only regardless.
**Notes**: Live Date is volatile on shared office 1604 (assert format, not value). Displayed in "Month Dayth, YYYY" format; the test asserts the format and that the popover opens.
**Automatable**: Yes

---

## TC-LOC-LP-024: Verify Cross-Tab Save Validation — Legal Tab Invalid
| Priority | Status | Type |
|----------|--------|------|
| High | Deferred | Cross-Tab / Save Button |

**Preconditions**: Navigate to `locations/1604/settings`, form in pristine state
**Steps**: 1. Click **Legal** tab -- Legal tab opens showing grid 2. Clear a **Service Charge Name** dropdown -- exclamation icon appears ✓ 3. Return to **Basic Information** tab (left panel) 4. Toggle **Union** checkbox -- Save enables ✓ 5. Click **Save** -- observe whether save succeeds or is blocked by Legal validation 6. Document exact behavior: save blocked (expected per an invalid Legal-tab condition) OR save succeeds with Legal error persisting
**Expected**: Per requirements an invalid Legal-tab condition is a Save disabled condition. Document actual observed behavior for cross-tab save interaction.
**Notes**: **Not automated (deferred).** Driving the Legal tab invalid (clearing the required Service Charge) has no UI "clear" affordance on the required Service Charge dropdown and risks leaving the Legal tab in a modified state. Save-gating on an invalid Basic Information state is already proven by TC-019 (TaxModeID=0). Flagged for a design decision.
**Data**: `Location=1604` | `LegalGrid=1 row (US English)`

**Automatable**: Deferred (design decision needed)

---

## Net-new save-and-reload persistence TCs (2026-06-03)

## TC-LOC-LP-025: Verify Local Office Name Persists Through Save+Reload
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Persistence |

**Steps**: 1. Set Local Office Name to "Parker Palm Springs QA" 2. Save + confirm 3. Reload -- value persists ✓ 4. Restore to "Parker Palm Springs" + save
**Expected**: Local Office Name change persists across save+reload; restored to default afterward (no state leak)
**Automatable**: Yes

## TC-LOC-LP-026: Verify Tax Mode Persists Through Save+Reload
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Persistence |

**Steps**: 1. Select Tax Mode "International" 2. Save + confirm 3. Reload -- persists ✓ 4. Restore to "US" + save
**Expected**: Tax Mode change persists across save+reload; restored to default (no state leak)
**Automatable**: Yes

## TC-LOC-LP-027: Verify Region Persists Through Save+Reload
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Persistence |

**Steps**: 1. Select Region "Boston" 2. Save + confirm 3. Reload -- persists ✓ 4. Restore to "Palm Springs" + save
**Expected**: Region change persists across save+reload; restored to default (no state leak)
**Automatable**: Yes

---

## Deferred coverage (documented (c) per LR-040 — not authored as TCs)

- **Servicing Branch Office save-persist**: required field with no "unselect" option → saving a branch into shared office 1604 would leak (can't restore the unselected baseline). Region persist (TC-027) already proves dropdown-persistence. NOT automated.
- **Live Date save-persist**: date-picker calendar needs multi-step month-nav + day-click with value-precision risk; office 1604's Live Date is volatile (CI bots write to it); TC-023 already proves the popover opens. NOT automated.
- **TC-024 (cross-tab Legal-invalid Save gating)**: see TC-024 note — deferred, flagged for design decision.