# Location - Left Panel (Basic Information) Test Cases

**Module**: locations

| Module | Test Cases | Automated | Deferred | Out of Scope | Updated |
|--------|------------|-----------|--------|--------------|---------|
| Locations | 37 | 36 (97%) | 1 (3%) | 0 (0%) | 2026-06-11 |

> Automated 2026-06-03 (SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC). 26 of 27 TCs automated in `clients/encore/tests/locations/location-left-panel-basic-information.spec.ts` (full run 27 passed ×2). TC-024 deferred (see its note). Live corrections to the original MD captured inline below (LR-020).
> **2026-06-11 (SUBPLAN_LAUNCHER_DIALOG_GAPS_FCC)**: Pay To Address re-classified from "plain disabled textbox" to a **launcher** opening the "Pay To List" search dialog (the 2026-06-03 walk missed the affordance — RCA `_internal/rca-launcher-dialog-misses-2026-06-11.md`, LR-057). TC-LOC-LP-004 keeps its ID + input-disabled assertion (still true) with corrected launcher wording; 10 net-new launcher TCs added (TC-LOC-LP-028..037). Evidence: `_internal/field-inventories/left-panel-basic-information-2026-06-11.md` §Launcher dialogs.
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
| 6 | Tax Mode | dropdown | US | editable |
| 7 | Country | dropdown | United States | editable |
| 8 | Region | dropdown | Palm Springs | editable |
| 9 | Servicing Branch Office | dropdown | Select Servicing Branch Office | editable |
| 10 | Line Of Business | dropdown (DISABLED) | Hotel Services Division | **read-only** (NM-831/NM-1140 — selectable only at creation) |
| 11 | Pay To Address | **launcher** (read-only display input + "Pay To List" search dialog) | Encore (payToId=1) | display input always disabled; **launcher always active** — `affordance: launcher → "Pay To List"` |
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
- **Always-disabled**: Office, Local Office, eCommerce Active, Enable Productions Orders. (**Pay To Address** display input is also always-disabled, BUT the field is a **launcher** — its `<label>` opens the "Pay To List" search dialog; see TC-LOC-LP-028..037.)
- **Launcher field — Pay To Address**: the display textbox shows the current Pay To **name** ("Encore" = payToId 1) and is always disabled; the field **label** is a clickable launcher (React onClick) opening the "Pay To List" dialog (5 filters Pay To ID/Name/Address/Phone/Fax + Search/Reset; 13-col sortable table; per-row checkbox; Select-disabled-until-checked; Cancel/Close-X; single page rows-per-page 20). Selection updates `financial.payToId` and **persists** through save+reload. Restore anchor = the Pay To **ID** (name is ambiguous — IDs 1 & 4 are both "Encore"). `affordance: launcher → "Pay To List"` (LR-057).
- **Field note**: Local Office Name live `maxlength=255` (not 50 — divergence flagged to Encore).

## TC-LOC-LP-001: Verify Left Panel Field Baseline State
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Baseline |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the location Settings page -- it loads | The location Settings page loads and the Basic Information tab is displayed. |
| 2 | Verify **Office** shows 1604, disabled ✓ | The Office field shows 1604 and is disabled. |
| 3 | Verify **Local Office** shows 1604, disabled ✓ | The Local Office field shows 1604 and is disabled. |
| 4 | Verify **Local Office Name** shows "Parker Palm Springs", editable ✓ | The Local Office Name field shows "Parker Palm Springs" and is editable. |
| 5 | Verify **Active** checkbox is checked ✓ | The Active checkbox is checked. |
| 6 | Verify **Live Date** displays a date in "Month Dayth, YYYY" format ✓ | The Live Date field displays a date in "Month Dayth, YYYY" format. |
| 7 | Verify **Tax Mode** shows "US" ✓ | The Tax Mode field shows "US". |
| 8 | Verify **Country** shows "United States" ✓ | The Country field shows "United States". |
| 9 | Verify **Region** shows "Palm Springs" ✓ | The Region field shows "Palm Springs". |
| 10 | Verify **Servicing Branch Office** shows "Select Servicing Branch Office" (no selection) ✓ | The Servicing Branch Office field shows the placeholder "Select Servicing Branch Office", with no branch office selected. |
| 11 | Verify **Line Of Business** shows "Hotel Services Division" ✓ | The Line Of Business field shows "Hotel Services Division". |
| 12 | Verify **Pay To Address** shows "Encore", disabled ✓ | The Pay To Address field shows "Encore" and is disabled. |
| 13 | Verify **Union** is unchecked ✓ | The Union checkbox is unchecked. |
| 14 | Verify **eCommerce Active** is checked and disabled ✓ | The eCommerce Active checkbox is checked and disabled. |
| 15 | Verify **Enable Productions Orders** is checked and disabled ✓ | Enable Productions Orders is checked and disabled. |

**Expected**: All fields display their expected default values in correct enabled/disabled state for location 1604
**Data**: `Office=1604` | `LocalOfficeName=Parker Palm Springs` | `Active=checked` | `LiveDate=(volatile; assert format only; live 2026-06-03 = June 15th, 1990)` | `TaxMode=US` | `Country=United States` | `Region=Palm Springs` | `LOB=Hotel Services Division`
**Automatable**: Yes

---

## TC-LOC-LP-002: Verify Office Field is Always Disabled
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Field State |

**Preconditions**: Located on Basic Information page for location 1604
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Observe **Office** text input showing "1604" ✓ Verify field has disabled attribute | The Office text input shows "1604". |
| 2 | Attempt to click the field -- field receives no focus | The Office field receives no focus when clicked. |
| 3 | Verify no cursor or editing interaction is possible | No cursor or editing interaction is possible in the Office field. |

**Expected**: Office field is permanently read-only; cannot be clicked or edited
**Automatable**: Yes

---

## TC-LOC-LP-003: Verify Local Office Field is Always Disabled
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Field State |

**Preconditions**: Located on Basic Information page for location 1604
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Observe **Local Office** showing "1604", disabled ✓ | The Local Office field shows "1604" and is disabled. |
| 2 | Attempt to click -- no focus | The Local Office field receives no focus when clicked. |
| 3 | Verify value cannot be changed | The field value cannot be changed. |

**Expected**: Local Office field is permanently read-only
**Automatable**: Yes

---

## TC-LOC-LP-004: Verify Pay To Address Display Input is Always Disabled (opens a dialog)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Field State |

**Preconditions**: Located on Basic Information page for location 1604
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Observe the "Pay To Address" display input showing "Encore" and verify it is disabled and cannot receive focus or be edited. | The Pay To Address display input shows "Encore", is disabled, and does not receive focus or accept edits. |
| 2 | Note that this asserts the display input only. The field's label opens the "Pay To List" dialog, so the disabled display does not mean the field is non-interactive. | The "Pay To Address" display input is permanently disabled and shows "Encore" for location 1604. The disabled state applies to the display input only; the field's interactive affordance lives on its label |

**Expected**: The "Pay To Address" display input is permanently disabled and shows "Encore" for location 1604. The disabled state applies to the display input only; the field's interactive affordance lives on its label.
**Notes**: This TC's input-disabled assertion stays TRUE. The launcher coverage is net-new (TC-LOC-LP-028..037), NOT a change to this TC's assertion. Wording corrected this revision — the prior "permanently read-only" phrasing masked the launcher affordance (ID kept, assertion unchanged).
**Automatable**: Yes

---

## TC-LOC-LP-005: Verify eCommerce Active is Permanently Disabled
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Field State |

**Preconditions**: Located on Basic Information page for location 1604
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Observe **eCommerce Active** checkbox is checked and disabled | The eCommerce Active checkbox is checked and disabled. |
| 2 | Attempt to click -- checkbox state does not change | The eCommerce Active checkbox state does not change when clicked. |
| 3 | Verify it remains checked regardless of other field changes | The eCommerce Active checkbox remains checked regardless of other field changes. |

**Expected**: eCommerce Active is permanently checked and non-interactive
**Automatable**: Yes

---

## TC-LOC-LP-006: Verify Enable Productions Orders is Permanently Disabled
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Field State |

**Preconditions**: Located on Basic Information page for location 1604
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Observe **Enable Productions Orders** checkbox is checked and disabled | The Enable Productions Orders checkbox is checked and disabled. |
| 2 | Attempt to click -- no state change | The Enable Productions Orders checkbox state does not change when clicked. |
| 3 | Verify it remains checked throughout session | Enable Productions Orders remains checked throughout the session. |

**Expected**: Enable Productions Orders is permanently checked and non-interactive
**Automatable**: Yes

---

## TC-LOC-LP-007: Verify Save Button Disabled on Fresh Page Load
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Save Button |

**Preconditions**: Open the location Settings page fresh (no prior changes)
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Page loads completely -- left panel visible | The page loads completely and the left panel is visible. |
| 2 | Verify **Save** button is disabled (grayed out, not clickable) | The Save button is grayed out, disabled, and not clickable. |
| 3 | Verify no form changes have been made | No form changes have been made; the page is in a clean state. |

**Expected**: Save button is disabled on fresh load because there are no unsaved changes
**Notes**: Save is disabled while the form has no unsaved changes.
**Automatable**: Yes

---

## TC-LOC-LP-008: Verify Save Button Enables After Any Form Change
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Save Button |

**Preconditions**: Fresh page load — Save is disabled
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify **Save** is disabled ✓ | The Save button is disabled. |
| 2 | Toggle **Union** checkbox (check it) -- Save becomes enabled ✓ | The Save button becomes enabled after the Union checkbox is checked. |
| 3 | Toggle **Union** back to unchecked (reverting to the original value) -- Save returns to DISABLED (the form detects no net change) ✓ | Save returns to disabled when Union is reverted to its original value; no net change is detected. |

**Expected**: Save enables as soon as any field is changed; reverting the change back to its original value results in no net change, so Save returns to DISABLED
**Notes**: Reverting a change back to its original value returns Save to disabled (no net change).
**Automatable**: Yes

---

## TC-LOC-LP-009: Verify Local Office Name Required Validation
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Validation |

**Preconditions**: On Basic Information page, with no unsaved changes
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click **Local Office Name** field -- focus | The Local Office Name field receives focus. |
| 2 | Select all text (Ctrl+A) and delete -- field becomes empty | The Local Office Name field becomes empty. |
| 3 | Press Tab to move focus off the field -- an exclamation icon (⚠) appears next to the field ✓ | An exclamation icon appears next to the Local Office Name field. |
| 4 | Observe **Save** button state -- Save stays DISABLED (the empty required field gates Save) ✓ | The Save button remains disabled. |
| 5 | Verify exclamation icon is visible indicating required error | Clearing the required Local Office Name shows the exclamation validation icon AND Save stays DISABLED (the empty required field gates Save - matches the requirement) |

**Expected**: Clearing the required Local Office Name shows the exclamation validation icon AND Save stays DISABLED (the empty required field gates Save — matches the requirement).
**Notes**: Clearing the required name shows the error icon and leaves Save disabled, consistent with the documented invalid-state-disables-Save behavior.
**Automatable**: Yes

---

## TC-LOC-LP-010: Verify Local Office Name Maximum Length (live = 255)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Validation |

**Preconditions**: On Basic Information page for location 1604
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click **Local Office Name** field -- clear existing text | The Local Office Name field is focused and its existing text is cleared. |
| 2 | Read the field's maximum-length limit -- it is **255** ✓ | The Local Office Name field's maximum-length limit reads "255". |
| 3 | The browser enforces the limit on keystroke at 255 characters ✓ | Local Office Name input enforces a maximum length of "255" characters |

**Expected**: Local Office Name input enforces a maximum length of **255** characters
**Data**: `maxLength=255` (live) | `testValue=AAAAAAAAAABBBBBBBBBBCCCCCCCCCCDDDDDDDDDDEEEEEEEEEE` (50-char sample)
**Cleanup**: Restore field to "Parker Palm Springs" and save
**Automatable**: Yes

---

## TC-LOC-LP-011: Verify Active Checkbox Toggle
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Field Interaction |

**Preconditions**: Active is checked (default for location 1604)
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify **Active** checkbox is checked ✓ | The Active checkbox is checked. |
| 2 | Click **Active** -- uncheck it ✓ Observe Save enables | The Active checkbox becomes unchecked. |
| 3 | Click **Save** -- save succeeds | The save completes successfully. |
| 4 | Reload page -- Active shows unchecked ✓ | After reload, the Active checkbox shows unchecked. |
| 5 | Click **Active** -- re-check ✓ Save enables | The Active checkbox becomes checked again. |
| 6 | Click **Save** -- save succeeds | The save completes successfully. |
| 7 | Reload page -- Active shows checked ✓ | After reloading, Active shows checked; the saved state persisted. |

**Expected**: Active checkbox state persists through save-reload cycle in both checked and unchecked states
**Cleanup**: Restore Active to checked and save
**Automatable**: Yes

---

## TC-LOC-LP-012: Verify Union Checkbox Toggle
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Field Interaction |

**Preconditions**: Union is unchecked (default for location 1604)
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify **Union** checkbox is unchecked ✓ | The Union checkbox is unchecked. |
| 2 | Click **Union** -- check it ✓ Save enables | The Union checkbox becomes checked. |
| 3 | Click **Save** -- save succeeds | The save completes successfully. |
| 4 | Reload page -- Union shows checked ✓ | After reload, the Union checkbox shows checked. |
| 5 | Navigate to **Local Information** tab -- verify **ETS Percentage** default value with Union=checked and document the observed value (Union flag affects ETS default) | The Local Information tab displays the ETS Percentage default value that applies when Union is checked. |
| 6 | Return to **Basic Information** tab | The Basic Information tab is displayed again. |
| 7 | Uncheck **Union** -- Save -- reload -- Union shows unchecked ✓ | Union checkbox toggles and persists. ETS Percentage default value is documented for Union=checked vs Union=unchecked |

**Expected**: Union checkbox toggles and persists. ETS Percentage default value is documented for Union=checked vs Union=unchecked.
**Cleanup**: Restore Union to unchecked and save
**Automatable**: Yes

---

## TC-LOC-LP-013: Verify Tax Mode Dropdown Options
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Dropdown |

**Preconditions**: On Basic Information page for location 1604
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click **Tax Mode** dropdown -- dropdown opens ✓ | The Tax Mode dropdown opens. |
| 2 | Verify exactly 2 options: "US" and "International" ✓ | The Tax Mode dropdown lists exactly 2 options: US and International. |
| 3 | Verify current selection is "US" ✓ | The current Tax Mode selection is "US". |
| 4 | Press Escape -- dropdown closes | The dropdown closes when Escape is pressed. |

**Expected**: Tax Mode shows exactly 2 options: US, International
**Data**: `options=[US, International]` | `currentValue=US`
**Automatable**: Yes

---

## TC-LOC-LP-014: Verify Country Dropdown Options
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Dropdown |

**Preconditions**: On Basic Information page for location 1604
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click **Country** dropdown -- opens ✓ | The Country dropdown opens. |
| 2 | Verify exactly 4 options: United States, Mexico, Canada, Bahamas ✓ | The Country dropdown lists exactly 4 options: United States, Mexico, Canada, Bahamas. |
| 3 | Verify current selection is "United States" ✓ | The current Country selection is "United States". |
| 4 | Press Escape -- close | The dropdown closes. |

**Expected**: Country contains exactly 4 options: United States, Mexico, Canada, Bahamas
**Data**: `options=[United States, Mexico, Canada, Bahamas]` | `currentValue=United States`
**Automatable**: Yes

---

## TC-LOC-LP-015: Verify Region Dropdown Options and Selectability
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Dropdown |

**Preconditions**: On Basic Information page for location 1604
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the "Region" dropdown. | The Region dropdown opens. |
| 2 | Verify the dropdown lists options alphabetically (starting with Alabama, Arizona, Atlanta, Boston). | The Region dropdown lists options alphabetically, starting with Alabama, Arizona, Atlanta, Boston. |
| 3 | Verify current selection is "Palm Springs". | The current Region selection is "Palm Springs". |
| 4 | Select "Boston" from the list and verify the Region field updates to "Boston". | The Region field updates to display "Boston". |
| 5 | Reload the page without saving and verify the Region reverts to "Palm Springs". | After reloading without saving, Region reverts to "Palm Springs". |

**Expected**: The Region dropdown offers its full set of region options; the current value for this location is "Palm Springs"; selecting a different region updates the field immediately
**Data**: `optionCount=59` | `currentValue=Palm Springs`
**Automatable**: Yes

---

## TC-LOC-LP-016: Verify Line Of Business is Read-Only (disabled in edit mode)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Dropdown |

**Preconditions**: On Basic Information page for location 1604
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Observe **Line Of Business** dropdown is **disabled** (read-only) ✓ | The Line Of Business dropdown is disabled and read-only. |
| 2 | Verify the dropdown does NOT open (disabled Radix dropdown) | The Line Of Business dropdown does not open when clicked. |
| 3 | Verify displayed value is "Hotel Services Division" ✓ | Line Of Business is "read-only/disabled in EDIT mode" (selectable only at location creation); displays "Hotel Services Division". Both the live site and the baseline site show this field disabled (the original documentation's editable 3-option dropdown was inaccurate) |

**Expected**: Line Of Business is **read-only/disabled in EDIT mode** (selectable only at location creation); displays "Hotel Services Division". Both the live site and the baseline site show this field disabled (the original documentation's editable 3-option dropdown was inaccurate).
**Data**: `options=[Convention and Tradeshow Services Division, Event Services Division, Hotel Services Division]`
**Automatable**: Yes

---

## TC-LOC-LP-017: Verify Servicing Branch Office Dropdown and Required State
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Dropdown |

**Preconditions**: On Basic Information page for location 1604
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the "Servicing Branch Office" dropdown. | The Servicing Branch Office dropdown opens. |
| 2 | Verify the dropdown lists a large number of branch office options (the first option varies by environment, e.g. "1752 -- W Hoboken"). | The Servicing Branch Office dropdown lists a large number of branch office options. |
| 3 | Verify the current field shows "Select Servicing Branch Office" (no selection for this location). | The Servicing Branch Office field shows the placeholder "Select Servicing Branch Office", with no branch office selected. |
| 4 | Select any option and verify the field updates and Save becomes enabled. | The selected option appears in the field and Save becomes enabled. |

**Expected**: The "Servicing Branch Office" dropdown contains a large list of branch office options; no branch office is currently selected for this location; selecting any option enables Save and satisfies the required field validation
**Data**: `optionCount=218 (live 2026-06-03; spec asserts >200, not exact)` | `default=Select Servicing Branch Office (value=0)`
**Notes**: GL Servicing Division corresponds to this field. Validator: `Validators.min(1)` — having no selection means value=0 which fails validation. Whether this prevents Save is consistent with `the invalid state` condition. Last option not asserted (sorted list may vary by environment).
**Automatable**: Yes

---

## TC-LOC-LP-018: Verify Country Change Clears Tax Mode and Region
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Country Cascade |

**Preconditions**: On Basic Information page, Country = United States, Tax Mode = US, Region = Palm Springs
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify Tax Mode = "US", Region = "Palm Springs" ✓ | Tax Mode shows "US" and Region shows "Palm Springs". |
| 2 | Click **Country** -- select "Canada" | The Country field updates to display "Canada". |
| 3 | Observe **Tax Mode** dropdown is now empty (cleared) with exclamation icon ✓ | The Tax Mode dropdown clears to empty and shows an exclamation icon. |
| 4 | Observe **Region** dropdown is now empty (cleared) ✓ | The Region dropdown clears to empty. |
| 5 | Verify Save button is now disabled (Tax Mode is empty) ✓ | The Save button is disabled because Tax Mode is now empty. |

**Expected**: Changing country clears Tax Mode (shows error) and Region; Save becomes disabled because Tax Mode is empty
**Notes**: Tax Mode and Region must be manually re-selected after country change
**Automatable**: Yes

---

## TC-LOC-LP-019: Verify Save Disabled After Country Change (Tax Mode Cleared)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Save Button / Cascade |

**Preconditions**: On Basic Information page; Country = United States, Tax Mode = US, Region = Palm Springs
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click **Country** -- select "Canada", which clears Tax Mode and Region | The Country field updates to "Canada" and both Tax Mode and Region clear to empty. |
| 2 | Verify **Save** button is disabled (Tax Mode is empty) ✓ | The Save button is disabled while Tax Mode is empty. |
| 3 | Click **Tax Mode** -- select "International" ✓ | The Tax Mode field updates to display "International". |
| 4 | Verify **Save** button is now enabled ✓ | The Save button is now enabled. |
| 5 | Re-select Country to a different value -- Tax Mode clears again -- Save disables | Changing Country again clears Tax Mode and Save returns to disabled. |

**Expected**: Save is disabled when Tax Mode is empty; selecting a Tax Mode value re-enables Save (if no other disable conditions present)
**Notes**: An empty Tax Mode is an explicit Save-disabled condition.
**Automatable**: Yes

---

## TC-LOC-LP-020: Verify Tax Mode Not Auto-Restored After Country Change
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Country Cascade |

**Preconditions**: Country changed from United States to Canada (Tax Mode cleared)
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Verify Tax Mode is empty after Canada selection ✓ | The Tax Mode field is empty. |
| 2 | Click **Country** -- select "United States" again | The Country field updates to display "United States". |
| 3 | Observe **Tax Mode** — verify it remains empty (not auto-restored to "US") ✓ | The Tax Mode field remains empty and is not auto-restored to "US". |
| 4 | Observe **Region** — verify it remains empty ✓ | Region remains empty after switching back to United States. |

**Expected**: Switching country back to United States does NOT auto-restore Tax Mode or Region; manual re-selection required every time country changes
**Cleanup**: Reload page to restore pristine state
**Automatable**: Yes

---

## TC-LOC-LP-021: Verify Country = USA Enables Job Costing in Local Information
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Country Cascade / Cross-Tab |

**Preconditions**: On Basic Information page, Country = United States
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click **Local Information** tab -- verify **Enable Job Costing** checkbox is checked ✓ | The Local Information tab shows the Enable Job Costing checkbox as checked. |
| 2 | Return to Basic Information tab | The Basic Information tab is displayed again. |
| 3 | Click **Country** -- select "Canada" | The Country field updates to display "Canada". |
| 4 | Click **Local Information** tab | The Local Information tab is displayed. |
| 5 | Observe **Enable Job Costing** -- verify it is now unchecked ✓ | Enable Job Costing is now unchecked after changing to a non-USA country. |

**Expected**: Enable Job Costing is USA-only; changing to non-USA country automatically unchecks it in Local Information tab
**Automatable**: Yes

---

## TC-LOC-LP-022: Verify Country = Canada Reveals Remit PST Tax in Local Information
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Country Cascade / Cross-Tab |

**Preconditions**: On Basic Information page, Country = United States
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click **Local Information** tab -- verify no "Remit PST Tax" checkbox visible ✓ | The Local Information tab is displayed with no Remit PST Tax checkbox visible. |
| 2 | Return to Basic Information tab | The Basic Information tab is displayed again. |
| 3 | Click **Country** -- select "Canada" | The Country field updates to display "Canada". |
| 4 | Click **Local Information** tab | The Local Information tab is displayed. |
| 5 | Observe **Remit PST Tax** checkbox -- verify it appears (checked by default) ✓ | The Remit PST Tax checkbox appears and is checked by default after setting Country to Canada. |

**Expected**: Remit PST Tax is a Canada-specific field; only appears in Local Information tab when Country = Canada
**Cleanup**: Reload page to restore Country to United States
**Automatable**: Yes

---

## TC-LOC-LP-023: Verify Live Date Button Opens Popover
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Field Interaction |

**Preconditions**: On Basic Information page for location 1604
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Observe **Live Date** rendered as a button (cursor: pointer) showing a date in "Month Dayth, YYYY" format (value-agnostic — 1604's Live Date drifts between runs) ✓ | The Live Date control renders as a clickable button displaying a date in "Month Dayth, YYYY" format. |
| 2 | Click **Live Date** button -- date picker popover opens ✓ | The date picker popover opens. |
| 3 | Verify the date-picker popover opens and shows a calendar (its contents do not depend on the field's value) ✓ | The date-picker popover displays a calendar. |
| 4 | Press Escape or click outside -- popover closes. The date is unchanged. ✓ | Live Date is a clickable button (not a plain text field); clicking opens a date picker popover showing the saved date. The Pay To Address input above it remains read-only regardless |

**Expected**: Live Date is a clickable button (not a plain text field); clicking opens a date picker popover showing the saved date. The Pay To Address input above it remains read-only regardless.
**Notes**: Live Date is volatile on shared office 1604 (assert format, not value). Displayed in "Month Dayth, YYYY" format; the test asserts the format and that the popover opens.
**Automatable**: Yes

---

## TC-LOC-LP-024: Verify Cross-Tab Save Validation — Legal Tab Invalid
| Priority | Status | Type |
|----------|--------|------|
| High | Deferred | Cross-Tab / Save Button |

**Preconditions**: Open the location Settings page; the form has no unsaved changes
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click **Legal** tab -- Legal tab opens showing grid | The Legal tab opens and displays the grid. |
| 2 | Clear a **Service Charge Name** dropdown -- exclamation icon appears ✓ | An exclamation icon appears next to the cleared Service Charge Name dropdown. |
| 3 | Return to **Basic Information** tab (left panel) | The Basic Information tab and left panel are displayed again. |
| 4 | Toggle **Union** checkbox -- Save becomes enabled ✓ | The Save button becomes enabled after the Union checkbox is toggled. |
| 5 | Click **Save** -- observe whether save succeeds or is blocked by Legal validation | Clicking Save shows either a success confirmation or a blocked error state tied to the Legal-tab validation. |
| 6 | Document exact behavior: save blocked (expected per an invalid Legal-tab condition) OR save succeeds with Legal error persisting | Per requirements an invalid Legal-tab condition is a Save disabled condition. Document actual observed behavior for cross-tab save interaction |

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

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set Local Office Name to "Parker Palm Springs QA" | The Local Office Name field displays "Parker Palm Springs QA". |
| 2 | Save + confirm | The save completes and the confirmation is acknowledged. |
| 3 | Reload -- value persists ✓ | After reload, the Local Office Name field still shows "Parker Palm Springs QA". |
| 4 | Restore to "Parker Palm Springs" + save | The name is restored to "Parker Palm Springs" and saved successfully. |

**Expected**: Local Office Name change persists across save+reload; restored to default afterward (no state leak)
**Automatable**: Yes

## TC-LOC-LP-026: Verify Tax Mode Persists Through Save+Reload
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Persistence |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select Tax Mode "International" | The Tax Mode field displays "International". |
| 2 | Save + confirm | The save completes and the confirmation is acknowledged. |
| 3 | Reload -- persists ✓ | After reload, the Tax Mode field still shows "International". |
| 4 | Restore to "US" + save | Tax Mode is restored to "US" and saved successfully. |

**Expected**: Tax Mode change persists across save+reload; restored to default (no state leak)
**Automatable**: Yes

## TC-LOC-LP-027: Verify Region Persists Through Save+Reload
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Persistence |

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Select Region "Boston" | The Region field displays "Boston". |
| 2 | Save + confirm | The save completes and the confirmation is acknowledged. |
| 3 | Reload -- persists ✓ | After reload, the Region field still shows "Boston". |
| 4 | Restore to "Palm Springs" + save | Region is restored to "Palm Springs" and saved successfully. |

**Expected**: Region change persists across save+reload; restored to default (no state leak)
**Automatable**: Yes

---

## Net-new launcher-dialog TCs (2026-06-11 — SUBPLAN_LAUNCHER_DIALOG_GAPS_FCC)

Source catalog: `_internal/field-case-catalogs/launcher-dialogs-2026-06-11.md` (Workstream A — per-launcher gap matrix). The Pay To Address field is a **launcher** opening the "Pay To List" search dialog (5 filters, 13-col sortable table, per-row checkbox, Select-disabled-until-checked, Cancel/Close-X, single page). The 2026-06-03 walk classified it as a plain disabled textbox (RCA `_internal/rca-launcher-dialog-misses-2026-06-11.md`). All cases live-verified 2026-06-11 (Playwright CLI, office 1604); see `_internal/field-inventories/left-panel-basic-information-2026-06-11.md` §Launcher dialogs.

## TC-LOC-LP-028: Pay To Address label opens the "Pay To List" dialog
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Launcher / Dialog |

**Preconditions**: On Basic Information page for location 1604
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the "Pay To Address" label (the "Pay To Address" display field is disabled, so clicking its label is how the dialog is opened) | Clicking the Pay To Address label opens the "Pay To List" dialog. |
| 2 | Verify the "Pay To List" dialog opens | The "Pay To List" dialog is displayed on screen. |
| 3 | Verify the 5 filters (Pay To ID, Pay To Name, Address, Phone, Fax) + "Search" + "Reset" are present | The dialog shows 5 filters (Pay To ID, Pay To Name, Address, Phone, Fax) plus Search and Reset buttons. |
| 4 | Verify the results table renders with rows pre-loaded (the customer's Pay To list) | The results table renders with the customer's Pay To list rows pre-loaded. |
| 5 | Verify the footer "Select" (disabled) + "Cancel" buttons are present | The footer shows a disabled Select button and a Cancel button. |

**Expected**: Clicking the Pay To Address label opens the "Pay To List" search dialog with 5 filters, Search/Reset, a results table, and Select/Cancel
**Data**: office=1604, dialogTitle="Pay To List"
**Notes**: Headline fix for the launcher-blindness false-green (TC-LOC-LP-004 asserted only the disabled input). Launcher = `label:has-text("Pay To Address")`, driven via `dispatchEvent('click')` / `click({force:true})`.
**MCP_VERIFICATION_LOG**: `field-inventories/left-panel-basic-information-2026-06-11.md` §Launcher dialogs → Pay To List (affordance + dialog internals verbatim, 2026-06-11).
**Automatable**: Yes

---

## TC-LOC-LP-029: Pay To List Select button disabled until a row is checked
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Launcher / Dialog |

**Preconditions**: Pay To List dialog open
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the Pay To List dialog | The "Pay To List" dialog opens. |
| 2 | Verify the footer **Select** button is `[disabled]` (no row checked) | The footer Select button is disabled. |
| 3 | Check a row's per-row checkbox | The row's checkbox becomes checked. |
| 4 | Verify **Select** becomes enabled | The Select button becomes enabled. |

**Expected**: Select enables only after a row checkbox is checked (single-select)
**Data**: office=1604
**Notes**: Mirrors the Account List / Select Customer Address Select-gate (TC-LOC-ACC-005/009).
**MCP_VERIFICATION_LOG**: `field-inventories/left-panel-basic-information-2026-06-11.md` §Launcher dialogs → Buttons ("Select `[disabled]` until a row is checked").
**Automatable**: Yes

---

## TC-LOC-LP-030: Pay To List Cancel discards (no field change)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Launcher / Dialog |

**Preconditions**: Pay To List dialog open
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the dialog | The "Pay To List" dialog opens. |
| 2 | Check a row (Select enables) | The Select button becomes enabled. |
| 3 | Click **Cancel** | Clicking Cancel dismisses the "Pay To List" dialog. |
| 4 | Verify the dialog closes | The "Pay To List" dialog is fully closed and no longer visible. |
| 5 | Verify the Pay To Address display still shows "Encore" and the left-panel **Save** stays disabled because nothing was changed | The Pay To Address display still shows "Encore" and Save stays disabled; Cancel made no changes. |

**Expected**: Cancel dismisses the dialog without applying any selection; the form has no unsaved changes
**Data**: office=1604
**Notes**: Discard path — no mutation. Save stays `[disabled]`.
**MCP_VERIFICATION_LOG**: `field-inventories/left-panel-basic-information-2026-06-11.md` §Launcher dialogs → Discard semantics ("Cancel closes the dialog; form stays pristine").
**Automatable**: Yes

---

## TC-LOC-LP-031: Pay To List Close-X and Esc each discard
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Launcher / Dialog |

**Preconditions**: Pay To List dialog open
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the dialog → press **Esc** → verify dialog closes, Pay To still "Encore", Save disabled | The "Pay To List" dialog opens. |
| 2 | Re-open the dialog → click the **Close (X)** button → verify dialog closes, Pay To still "Encore", Save disabled | Both Esc and the Close-X dismiss the dialog without applying a selection (two independent dismiss mechanisms, asserted separately - no OR-expression) |

**Expected**: Both Esc and the Close-X dismiss the dialog without applying a selection (two independent dismiss mechanisms, asserted separately — no OR-expression per LR-051)
**Data**: office=1604
**Notes**: Two sequential open→dismiss cycles; each asserted independently.
**MCP_VERIFICATION_LOG**: `field-inventories/left-panel-basic-information-2026-06-11.md` §Launcher dialogs (Close-X / Esc discard equivalence — confirmed live in BUILDER).
**Automatable**: Yes

---

## TC-LOC-LP-032: Pay To List ID filter returns the matching row
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Launcher / Filter |

**Preconditions**: Pay To List dialog open
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the dialog | The "Pay To List" dialog opens. |
| 2 | Type a Pay To **ID** (e.g. `7`) into the Pay To ID filter | The Pay To ID filter field displays the entered value. |
| 3 | Click **Search** | Clicking Search runs the search and the results table updates accordingly. |
| 4 | Verify the results contain the matching Pay To ("Encore Bahamas" for ID 7) | The Pay To ID filter is a precise filter - searching an ID returns the matching Pay To (this is the restore-anchor mechanism the persistence case relies on). Content/existence asserted, not an exact row count |

**Expected**: The Pay To ID filter is a precise filter — searching an ID returns the matching Pay To (this is the restore-anchor mechanism the persistence case relies on). Content/existence asserted, not an exact row count (LR-022).
**Data**: office=1604, payToId=7 → "Encore Bahamas"
**Notes**: Server-side search endpoint `GET /navigator/api/location/getLocationPayToList` (~4.7s). Proves the ID-anchored restore mechanism for TC-037.
**MCP_VERIFICATION_LOG**: `field-inventories/left-panel-basic-information-2026-06-11.md` §Launcher dialogs → Filters ("Pay To ID … precise match — ID `7` → exactly 1 row").
**Automatable**: Yes

---

## TC-LOC-LP-033: Pay To List Name filter "Encore" returns multiple rows
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Launcher / Filter |

**Preconditions**: Pay To List dialog open
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the dialog | The "Pay To List" dialog opens. |
| 2 | Type `Encore` into the Pay To **Name** filter | The Pay To Name filter field displays "Encore". |
| 3 | Click **Search** | Clicking Search runs the search and the results table updates accordingly. |
| 4 | Verify the results contain more than one "Encore"-named row | The Pay To Name filter is a "contains" search - typing "Encore" returns multiple rows, so the name alone does not identify a single row |

**Expected**: The Pay To Name filter is a "contains" search — typing "Encore" returns multiple rows, so the name alone does not identify a single row.
**Data**: office=1604, name=Encore → ≥2 rows
**Notes**: Establishes WHY restore is ID-anchored, not name-anchored (≥2 "Encore" rows).
**MCP_VERIFICATION_LOG**: `field-inventories/left-panel-basic-information-2026-06-11.md` §Launcher dialogs → Filters ("Pay To Name … server-side contains — `Encore` → 4 rows").
**Automatable**: Yes

---

## TC-LOC-LP-034: Pay To List empty result shows "No results."
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Launcher / Filter |

**Preconditions**: Pay To List dialog open
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the dialog | The "Pay To List" dialog opens. |
| 2 | Type a non-matching Pay To ID (e.g. `99999`) | The Pay To ID filter field displays the entered non-matching value. |
| 3 | Click **Search** | Clicking Search runs the search and the results table updates accordingly. |
| 4 | Verify the table shows the verbatim "No results." message (announced rejection, not silent) | A no-match search returns the verbatim "No results." empty-state - an announced rejection, not silence |

**Expected**: A no-match search returns the verbatim "No results." empty-state — an announced rejection, not silence
**Data**: office=1604, payToId=99999 → "No results."
**Notes**: Verbatim empty-state text per the field-coverage taxonomy (announced, not silent).
**MCP_VERIFICATION_LOG**: `field-inventories/left-panel-basic-information-2026-06-11.md` §Launcher dialogs → Search ("Empty result: `Pay To ID = 99999` → 0 rows + verbatim `No results.`").
**Automatable**: Yes

---

## TC-LOC-LP-035: Pay To List Reset clears filters and restores the full list
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Launcher / Dialog |

**Preconditions**: Pay To List dialog open
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the dialog | The "Pay To List" dialog opens. |
| 2 | Filter by Pay To ID (e.g. `7`) → Search (results narrow) | The Pay To ID filter field displays the entered value and the results table updates accordingly. |
| 3 | Click **Reset** | Clicking Reset clears the filter fields. |
| 4 | Verify the filters clear and the full pre-loaded Pay To list is restored | All filters are cleared and the full unfiltered Pay To list is restored. |

**Expected**: Reset clears all filters and restores the full unfiltered Pay To list (with no leftover changes)
**Data**: office=1604
**Notes**: Reset side-effect check (ACC-007 precedent — defensive reload after if taint is observed live).
**MCP_VERIFICATION_LOG**: `field-inventories/left-panel-basic-information-2026-06-11.md` §Launcher dialogs → Search ("Reset: clears all filters, restores the full list, refs stable, no visible form taint").
**Automatable**: Yes

---

## TC-LOC-LP-036: Pay To selection updates the display and enables Save (no save)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Launcher / Field Interaction |

**Preconditions**: Pay To List dialog open. Pay To Address = "Encore"
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the dialog | The "Pay To List" dialog opens. |
| 2 | Filter/find Pay To ID 7 ("Encore Bahamas") and check its row | The Encore Bahamas row is located and its checkbox becomes checked. |
| 3 | Click **Select** → dialog closes | The dialog closes and the selection is applied. |
| 4 | Verify the Pay To Address display updates to "Encore Bahamas" | The Pay To Address display updates to show "Encore Bahamas". |
| 5 | Verify the left-panel **Save** becomes enabled | The left-panel Save button becomes enabled. |
| 6 | Reload WITHOUT saving → verify the display reverts to "Encore" (no persist without save) | After reloading without saving, the Pay To display reverts to "Encore". |

**Expected**: Selecting a Pay To via the dialog updates the display field and dirties the form (Save enables); reloading without saving discards the change
**Data**: office=1604, alt=PAY_TO_ALTERNATE (ID 7, "Encore Bahamas")
**Notes**: Display-update + Save-enable proof WITHOUT mutating the saved value (discard via reload). Persistence is TC-037.
**MCP_VERIFICATION_LOG**: `field-inventories/left-panel-basic-information-2026-06-11.md` §Launcher dialogs → Selection→field→persistence step 1 ("display textbox updates to 'Encore Bahamas' → page Save enables").
**Automatable**: Yes

---

## TC-LOC-LP-037: Pay To selection persists through save+reload (restore by ID)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Launcher / Persistence |

**Preconditions**: Pay To Address = "Encore" — enforced by per-test baseline
**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Open the dialog and select Pay To ID 7 ("Encore Bahamas"), then Save and confirm the "Save Changes" dialog with Ok | The save completes and the Pay To Address field updates to "Encore Bahamas". |
| 2 | Reload and verify the Pay To Address persists as "Encore Bahamas" | After reload, the Pay To Address field still shows "Encore Bahamas". |
| 3 | Restore: open the dialog, search Pay To ID 1, select that row, Save, confirm with Ok, reload, and verify the Pay To Address is back to "Encore" | A Pay To selection persists through save and reload (unlike the Venue address selection, which does not). Office 1604 is restored to its original Pay To (ID 1) using the ID to search (the name "Encore" is ambiguous - IDs 1 and 4 share it) |

**Expected**: A Pay To selection persists through save and reload (unlike the Venue address selection, which does not). Office 1604 is restored to its original Pay To (ID 1) using the ID to search (the name "Encore" is ambiguous — IDs 1 and 4 share it).
**Data**: office=1604, PAY_TO_ORIGINAL (ID 1, "Encore"), PAY_TO_ALTERNATE (ID 7, "Encore Bahamas")
**Notes**: Implemented via the field-coverage runner (`saveAndVerifyCase`, LR-019 compile-required baseline). Restore-by-ID lives in the case `cleanup` + `finally`. Save endpoint `PUT /navigator/api/location/update-properties` (LR-056). No-leak: post-run office 1604 = payToId 1.
**MCP_VERIFICATION_LOG**: `field-inventories/left-panel-basic-information-2026-06-11.md` §Launcher dialogs → Selection→field→persistence steps 2-4 ("financial.payToId === 7 → persists … restore: payToId === 1 ✅").
**Automatable**: Yes

---

## Deferred coverage (documented (c) per LR-040 — not authored as TCs)

- **Pay To List Address / Phone / Fax filters** (launcher, 2026-06-11): only the Pay To ID + Name filters were exercised live (sufficient for the restore-anchor mechanism + multi-match proof). The 1604 list does not carry Address/Phone/Fax data that distinguishes rows the way ID/Name do; authored only if BUILDER confirms live column data, else not-applicable per the inventory §Launcher dialogs.
- **Pay To List pagination / rows-per-page / column sort** (launcher, 2026-06-11): single page, 7 rows ≤ page-size 20; "go to next/last" buttons all `[disabled]` (`1 / 1`) — not-applicable per inventory.
- **Pay To List re-select-CURRENT (LR-009 net-zero probe)** (launcher, 2026-06-11): not measured in the Phase-1 walk; marginal value over TC-036 (select-alternate→Save-enables) + TC-037 (persist); the net-zero behavior for this launcher is unproven and authoring an assertion either way would be guessing — deferred as a future-walk item, not a bug.
- **Servicing Branch Office save-persist**: required field with no "unselect" option → saving a branch into shared office 1604 would leak (can't restore the unselected baseline). Region persist (TC-027) already proves dropdown-persistence. NOT automated.
- **Live Date save-persist**: date-picker calendar needs multi-step month-nav + day-click with value-precision risk; office 1604's Live Date is volatile (CI bots write to it); TC-023 already proves the popover opens. NOT automated.
- **TC-024 (cross-tab Legal-invalid Save gating)**: see TC-024 note — deferred, flagged for design decision.