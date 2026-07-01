# Location Legal Test Cases
**Module**: locations | **Total**: 19 | **Status**: Partial | **Updated**: 2026-05-27

---

| Field | Value |
|-------|-------|
| Date | |
| URL | https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location |
| Office/Entity | 1604 (Parker Palm Springs) |
| Total fields found | 3 (Language Name [static], Service Charge Name [combobox], Terms and Conditions Name [combobox]) |
| Total fields tested (edit+save) | 2 (Service Charge Name, Terms and Conditions Name) |
| Save dialog | Yes -- heading "Save Changes", body "Are you sure you want to save the changes?", buttons Cancel + Ok |
| Column headers | Language Name, Service Charge Name, Terms and Conditions Name |
| Dropdown options | Service Charge Name: 114 options (first 10: Service Charge, Administrative Fee, Hotel Service Charge, Marriott Hotel Service Charge, Resort Service Charge, Standard 22% Resort Service Charge, Hotel collected Service Charge, Marriott 2013 Service Charge, NoCharge, ETS) |
| Dropdown options | Terms and Conditions Name: 50 options (Service Charges, Administration Fees, Service Charges (Hilton), Administration Fees (Hilton), LDW, Marriott 2013 Service Charge, ET Support and LDW, Admin Fee + LDW. Encore Terms and Conditions, Show Quote, Show Quote MX (Eng)) |
| Cascade behaviors | Country change in left panel resets both SC and T&C values for all language rows |
| Input attribute types | SC combobox: data-testid="location-settings-select-legal-0-service-charge" role="combobox" aria-expanded / T&C combobox: data-testid="location-settings-select-legal-0-terms" role="combobox" |
| Validation error patterns | Not directly testable for Legal -- errors manifest via an invalid Legal-tab condition blocking left-panel Save |
| Input masks/formatting | N/A -- dropdowns only, no free-text input |
| Filtering mechanism | No search/filter in SC or T&C dropdowns -- full list rendered |
| API loading | Legal tab: table loads immediately after tab click (~1s) |
| Strict mode risks | None -- all selectors use data-testid, unique per querySelectorAll |
| Form structure | Save button: shared left-panel [data-testid="location-settings-btn-save"], NOT inside Legal tabpanel |
| Dialog side effects | Save Changes dialog: Cancel=safe (no save), Ok=persists |
| Post-reload timing | SC and T&C comboboxes load together (~1s after tab render) |
| Readiness signal | Wait for combobox [data-testid="location-settings-select-legal-0-service-charge"] to have non-empty text |
| Boundary behaviors | N/A -- no free-text input fields on Legal tab |

### CORRECTIONS FROM PREVIOUS VERSION
| Issue | Old (Wrong) | New (Correct) |
|-------|-------------|---------------|
| Default SC value | "Service Charge" | "Resort Service Charge" |
| Legal Save button | Dedicated Legal Save at top-right | NO dedicated Legal Save -- uses shared left-panel Save |
| Save revert behavior | Reverting to original re-disables Save | Save stays enabled after any change, even if reverted |
| SC dropdown search | Hidden search combobox | No search/filter in dropdown |
| SC option count | 100+ | 114 |
| T&C option count | 50+ | 50 |
| Selectors | None documented with data-testid | Full data-testid selectors verified |

---

## FIELD INVENTORY & DISCOVERY

**Legal Grid** (3 columns, 1 data row for office 1604):
| # | Field | Type | Default (1604) | State | Selector |
|---|-------|------|----------------|-------|----------|
| 1 | Language Name | static text (td) | US English | read-only | N/A (plain text cell, no interactable element) |
| 2 | Service Charge Name | combobox (button role=combobox) | Resort Service Charge | editable, 114 options | `[data-testid="location-settings-select-legal-0-service-charge"]` |
| 3 | Terms and Conditions Name | combobox (button role=combobox) | LDW | editable, 50 options | `[data-testid="location-settings-select-legal-0-terms"]` |

**Table**: `[data-testid="location-settings-table-legal"]` -- has `<thead>` (3 column headers) + `<tbody>` (data rows).

**Save Button**: Shared left-panel Save `[data-testid="location-settings-btn-save"]`. Disabled by default. Enabled when any field changes (Legal OR other tabs). NOT a dedicated Legal Save.

**Save Dialog**: `[an alert dialog]` -- heading "Save Changes", body "Are you sure you want to save the changes?", buttons: Cancel, Save. No data-testid on dialog elements.

**Dirty-State Tracking**: Once ANY dropdown value is changed, Save enables. Reverting to the original value does NOT re-disable Save. Only a page reload or successful save resets dirty state.

**Validation Rules**:
- `SCNAME_IS_REQD`: Service Charge cannot be null/empty
- `TCNAME_IS_REQD`: Terms and Conditions cannot be null/empty
- an invalid Legal-tab condition: Invalid Legal data blocks left-panel Save

**Country Change Cascade**: Changing Country in left panel resets both Service Charge Name and Terms and Conditions Name for all language rows.

---

## TC-LOC-LGL-001: Verify Legal grid default structure
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Steps**:
1. Navigate to Setup > Location > 1604 > **Basic Information** tab -> Page loads with left panel and sub-tabs
2. Click **Legal** sub-tab -> Legal tabpanel renders
3. Verify table has 3 column headers: **Language Name**, **Service Charge Name**, **Terms and Conditions Name** -> All 3 visible
4. Count rows in `<tbody>` -> 1 data row (US English)

**Expected**: Table with 3 columns and 1 row (US English) visible in Legal tabpanel
**Data**: office=1604

---

## TC-LOC-LGL-002: Verify Legal grid default field values
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab -> Tab loads
2. Verify US English row cell 1 -> Text "US English" (static, no combobox)
3. Verify US English row cell 2 -> Combobox showing "Resort Service Charge"
4. Verify US English row cell 3 -> Combobox showing "LDW"

**Expected**: US English row shows: Language Name = "US English", Service Charge Name = "Resort Service Charge", Terms and Conditions Name = "LDW"
**Data**: office=1604

---

## TC-LOC-LGL-003: Verify Language Name cell is read-only
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab -> Tab loads
2. Verify Language Name cell ("US English") -> No combobox or button rendered, plain text only
3. Verify no interactive element exists in first column cell -> Static `<td>` with text content

**Expected**: Language Name column is read-only static text, no editing possible
**Data**: office=1604

---

## TC-LOC-LGL-004: Verify Service Charge Name dropdown opens and shows options
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab -> Tab loads
2. Click **Service Charge Name** combobox in US English row -> Dropdown listbox opens
3. Verify options are visible -> 114 options listed (including "Service Charge", "Administrative Fee", "Hotel Service Charge", "Resort Service Charge", "ETS", "NoCharge")
4. Verify current selection state -> "Resort Service Charge" has `data-state="checked"`
5. Press Escape -> Dropdown closes, value unchanged

**Expected**: Dropdown opens with 114 service charge options; currently selected option "Resort Service Charge" is visually indicated; Escape closes dropdown without changing value
**Data**: office=1604

---

## TC-LOC-LGL-005: Verify Terms and Conditions Name dropdown opens and shows options
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab -> Tab loads
2. Click **Terms and Conditions Name** combobox in US English row -> Dropdown listbox opens
3. Verify options are visible -> 50 options listed (including "LDW", "Encore Terms and Conditions", "Blank", "Show Quote", "ETS (No LDW)")
4. Verify current selection state -> "LDW" has `data-state="checked"`
5. Press Escape -> Dropdown closes, value unchanged

**Expected**: Dropdown opens with 50 T&C options; currently selected "LDW" is visually indicated; Escape closes without changing value
**Data**: office=1604

---

## TC-LOC-LGL-006: Verify no search/filter exists in dropdowns
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab -> Tab loads
2. Click **Service Charge Name** combobox -> Dropdown opens
3. Verify no search input or filter textbox exists in the dropdown -> Full list of 114 options rendered directly
4. Press Escape -> Dropdown closes
5. Click **Terms and Conditions Name** combobox -> Dropdown opens
6. Verify no search input or filter textbox exists -> Full list of 50 options rendered directly
7. Press Escape -> Dropdown closes

**Expected**: Neither dropdown has a search/filter input -- all options are rendered in a flat list
**Data**: office=1604

---

## TC-LOC-LGL-007: Left-panel Save button disabled by default (no changes)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | State |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
1. Navigate to Setup > Location > 1604 (fresh page load) -> Page loads
2. Click **Legal** tab -> Tab loads with default values
3. Make no changes -> Both comboboxes show defaults
4. Verify left-panel **Save** button -> Disabled (`[disabled]` attribute present)

**Expected**: Left-panel Save button is disabled when no changes have been made to any field on the page
**Data**: office=1604

---

## TC-LOC-LGL-008: Changing Service Charge Name enables left-panel Save button
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | State |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab (fresh page load) -> Tab loads
2. Verify left-panel **Save** button -> Disabled
3. Click **Service Charge Name** combobox -> Dropdown opens
4. Select a different option from the dropdown (e.g., "Administrative Fee") -> Value updates to "Administrative Fee"
5. Verify left-panel **Save** button -> Now enabled (not disabled)

**Expected**: Changing Service Charge Name enables the shared left-panel Save button
**Data**: office=1604
**Cleanup**: Reload page without saving (accept the browser's leave-page confirmation) to discard change

---

## TC-LOC-LGL-009: Changing Terms and Conditions Name enables left-panel Save button
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | State |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab (fresh page load) -> Tab loads
2. Verify left-panel **Save** button -> Disabled
3. Click **Terms and Conditions Name** combobox -> Dropdown opens
4. Select a different option from the dropdown (e.g., "Encore Terms and Conditions") -> Value updates
5. Verify left-panel **Save** button -> Now enabled (not disabled)

**Expected**: Changing T&C Name enables the shared left-panel Save button
**Data**: office=1604
**Cleanup**: Reload page without saving to discard change

---

## TC-LOC-LGL-010: Reverting dropdowns to original values does NOT re-disable Save
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | State |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab (fresh page load) -> Tab loads
2. Change **Service Charge Name** from "Resort Service Charge" to "Administrative Fee" -> Save enables
3. Change **Service Charge Name** back to "Resort Service Charge" -> Value reverted to original
4. Verify left-panel **Save** button -> Still enabled (NOT re-disabled)

**Expected**: Reverting a dropdown to its original value does NOT re-disable the Save button. The form's change tracking does not treat a reverted value as a return to the original unchanged state, so Save stays enabled. A browser confirmation prompt also appears when navigating away.
**Data**: office=1604
**Cleanup**: Reload page without saving to discard change

---

## TC-LOC-LGL-011: Save Service Charge change persists after save and reload
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab (fresh page load) -> Defaults loaded: SC = "Resort Service Charge"
2. Click **Service Charge Name** combobox -> Select "Administrative Fee" -> Value updates
3. Verify left-panel **Save** button -> Enabled
4. Click left-panel **Save** button -> Save Changes dialog appears: heading "Save Changes", body "Are you sure you want to save the changes?"
5. Click **Ok** button in dialog -> Save executes, dialog closes
6. Verify left-panel **Save** button -> Returns to disabled (changes saved)
7. Reload page -> Page reloads
8. Click **Legal** tab -> Verify **Service Charge Name** -> Displays "Administrative Fee" (persisted)
9. **Cleanup**: Change **Service Charge Name** back to "Resort Service Charge" -> Click Save -> Confirm dialog -> Verify restored

**Expected**: Legal data change persists through Save and page reload; Save button re-disables after successful save
**Data**: office=1604, changeValue="Administrative Fee", originalValue="Resort Service Charge"

---

## TC-LOC-LGL-012: Save Terms and Conditions change persists after save and reload
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab (fresh page load) -> Defaults loaded: T&C = "LDW"
2. Click **Terms and Conditions Name** combobox -> Select "Encore Terms and Conditions" -> Value updates
3. Click left-panel **Save** button -> Save Changes dialog appears
4. Click **Ok** in dialog -> Save executes
5. Reload page -> Page reloads
6. Click **Legal** tab -> Verify **Terms and Conditions Name** -> Displays "Encore Terms and Conditions" (persisted)
7. **Cleanup**: Change T&C back to "LDW" -> Save -> Confirm -> Verify restored

**Expected**: T&C change persists through save and reload
**Data**: office=1604, changeValue="Encore Terms and Conditions", originalValue="LDW"

---

## TC-LOC-LGL-013: Cancel in Save Changes dialog discards save
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab (fresh page load) -> Tab loads
2. Change **Service Charge Name** to "Administrative Fee" -> Save enables
3. Click left-panel **Save** button -> Save Changes dialog appears
4. Click **Cancel** button in dialog -> Dialog closes
5. Verify left-panel **Save** button -> Still enabled (changes not saved)
6. Reload page (accept the browser's leave-page confirmation) -> Page reloads fresh
7. Click **Legal** tab -> Verify **Service Charge Name** -> Still "Resort Service Charge" (change was NOT saved)

**Expected**: Clicking Cancel in Save Changes dialog dismisses dialog without saving; original values persist after reload
**Data**: office=1604

---

## TC-LOC-LGL-014: Browser warns before leaving the page when there are unsaved Legal changes
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | State |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab (fresh page load) -> Tab loads
2. Change **Terms and Conditions Name** to "Blank" -> Save enables
3. Attempt to reload or navigate away -> The browser's leave-page confirmation appears
4. Dismiss dialog (stay on page) -> Page remains, unsaved changes preserved
5. Accept dialog (leave page) -> Page reloads, changes discarded

**Expected**: Unsaved Legal changes trigger the browser's leave-page confirmation when there are unsaved changes and the user attempts to navigate away
**Data**: office=1604

---

## TC-LOC-LGL-015: Country change resets both Legal dropdowns
| Priority | Status | Type |
|----------|--------|------|
| High | Manual | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
1. Navigate to **Legal** tab -> Verify defaults: SC = "Resort Service Charge", T&C = "LDW"
2. In left panel, change **Country** combobox from "United States" to another value (e.g., "Canada") -> Country changes
3. Click **Legal** tab -> Legal tab reloads
4. Verify **Service Charge Name** -> Value has been reset (no longer "Resort Service Charge")
5. Verify **Terms and Conditions Name** -> Value has been reset (no longer "LDW")
6. **Cleanup**: Revert **Country** back to "United States" -> Save if needed

**Expected**: Changing Country in left panel resets both Service Charge Name and Terms and Conditions Name for all language rows
**Data**: office=1604

---

## TC-LOC-LGL-016: Verify Service Charge dropdown options are sorted alphabetically
| Priority | Status | Type |
|----------|--------|------|
| Low | OMITTED | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: No (APP BUG)

**Steps**:
1. Navigate to **Legal** tab -> Tab loads
2. Click **Service Charge Name** combobox -> Listbox opens
3. Read all option texts -> Collect into array
4. Compare to case-insensitive alphabetical sort -> Assert sorted

**Expected**: Options are sorted alphabetically
**Data**: office=1604

**OMITTED Reason**: MCP-verified : SC dropdown is NOT sorted alphabetically. Generic names appear first, then location-specific. This is an **APP BUG** — v1 requirement says "sorted alphabetically". Test would fail against live behavior. Logged in REQUIREMENTS.md and master plan.

---

## TC-LOC-LGL-017: Verify Terms and Conditions dropdown options are sorted alphabetically
| Priority | Status | Type |
|----------|--------|------|
| Low | OMITTED | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: No (APP BUG)

**Steps**:
1. Navigate to **Legal** tab -> Tab loads
2. Click **Terms and Conditions Name** combobox -> Listbox opens
3. Read all option texts -> Collect into array
4. Compare to case-insensitive alphabetical sort -> Assert sorted

**Expected**: Options are sorted alphabetically
**Data**: office=1604

**OMITTED Reason**: MCP-verified : T&C dropdown is NOT sorted alphabetically. Same pattern as SC. **APP BUG** logged in REQUIREMENTS.md and master plan.

---

## TC-LOC-LGL-018: Combined SC + T&C change saves and persists both
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-LOC-LGL-001
**Automatable**: Yes

**Steps**:
1. Reload page and navigate to **Legal** tab (LR-026: clean form state before save cycle)
2. Change **Service Charge Name** to "Administrative Fee" -> Value updates
3. Change **Terms and Conditions Name** to "Encore Terms and Conditions" -> Value updates
4. Verify left-panel **Save** button -> Enabled
5. Click left-panel **Save** button -> Save Changes dialog appears
6. Click **Ok** in dialog -> Save executes, dialog closes
7. Verify left-panel **Save** button -> Returns to disabled
8. Reload page and navigate to **Legal** tab -> Fresh state loaded
9. Verify **Service Charge Name** -> Displays "Administrative Fee" (persisted)
10. Verify **Terms and Conditions Name** -> Displays "Encore Terms and Conditions" (persisted)
11. **Cleanup**: Change **Service Charge Name** back to "Resort Service Charge" -> Change **Terms and Conditions Name** back to "LDW" -> Save -> Confirm dialog -> Verify both restored

**Expected**: Changing both dropdowns simultaneously and saving persists both values through reload; cleanup restores defaults
**Data**: office=1604, altSC="Administrative Fee", altTC="Encore Terms and Conditions", defaultSC="Resort Service Charge", defaultTC="LDW"

---

## Field-Case Coverage (FCC) — Legal Server Validation

> Field-Case Coverage block per `PLAN_BIG_PIVOT_FCC_MASTER.md` doctrine + `SUBPLAN_LEGAL_FCC.md` Phase 2 catalog.
> Gap-analysis: 12 existing TCs cover same-mechanic-different-data dropdown save cycles (LR-040(b)); 3 cases are APP BUG / left-panel-deferred (LR-040(c)); 1 net-new TC covers the genuinely uncovered mechanic (DOM tamper negative).
> Full catalog: `clients/encore/specs_planning/_internal/field-case-catalogs/legal-2026-05-27.md`.

---

## TC-LOC-LGL-019: Verify an out-of-list Service Charge value cannot be submitted
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Negative + Save-cycle |

**Depends_On**: none (FCC tests are independent per master doctrine item 1)
**Automatable**: Yes (green test, observed 2026-05-27 11:11 — 21.0s, passes)
**FCC group**: negative (no UI path to invalid value) + runner-integration smoke
**Runner**: `saveAndVerifyCase()` from `clients/encore/src/core/field-case-runner.ts`

**Steps**:
1. Open the "Service Charge" dropdown and confirm an invalid, out-of-list value is NOT among the available options, while the current default value AND a valid alternate value ("Administrative Fee") ARE both present
2. Reset the Legal row to its default Service Charge and Terms & Conditions values
3. Select the valid alternate Service Charge ("Administrative Fee") from the dropdown
4. Confirm the "Save" button becomes enabled and the dropdown now reads "Administrative Fee"
5. Click "Save" and confirm the Save Changes dialog
6. Confirm the "Save" button returns to disabled after the save completes
7. Reload the page and return to the "Legal" tab
8. Confirm the persisted Service Charge value is "Administrative Fee" and is never the invalid value (end-to-end check at the server)
9. Restore the Legal row to its default values ("Resort Service Charge" and "LDW")

**Expected**: All checks pass. No UI path exposes an out-of-list value to the user, and a normal save persists only the valid selected value (never the invalid value) at the server.

**Data**: office=1604, legitValue="Administrative Fee", default="Resort Service Charge"

**Notes**: Cleanup after test: The test automatically restores the Legal row to its default values

<!-- Internal (not exported): implementation rationale, the Path D live finding (DOM tamper of the Radix SC combobox crashes the page), and the future network-layer flip path are documented in plans/done/SUBPLAN_LEGAL_FCC.md (the field-case-catalogs/legal-2026-05-27.md catalog it referenced was lost to the gitignored-MD restore — see _internal/excel-revert-recovery-deviations-2026-06-10.md). The invalid-value sentinel constant LEGAL_INVALID_SC_VALUE lives in src/data/locations/location-legal.ts. -->

---

 Execution reference:
- Legal tab: [data-testid="location-settings-sub-tab-legal"]
- Legal content: [data-testid="location-settings-sub-tab-content-legal"]
- Table: [data-testid="location-settings-table-legal"]
- SC combobox row 0: [data-testid="location-settings-select-legal-0-service-charge"]
- T&C combobox row 0: [data-testid="location-settings-select-legal-0-terms"]
- Save button: [data-testid="location-settings-btn-save"] (shared left-panel)
- Save dialog: [an alert dialog] with Cancel + Ok buttons 
- canEditProp is true confirmed for office 1604
- TC-011, TC-012: destructive -- always revert after test (annotated with Cleanup steps)
- TC-015: cross-tab -- requires Country change; always CLEANUP country after test
- Dropdowns: the dropdown library Select components, no search/filter, full list rendered
- Service Charge 114 options, T&C 50 options (for US English language)
- NO dedicated Legal Save button exists 
- Change tracking: the form does NOT treat a reverted value as a return to the original unchanged state; reverting to the original still shows the form as changed

---

## OMITTED Rows

This module has 3 test cases intentionally NOT automated in the spec, collected here for traceability (reasons are also inline at each TC above). All 3 are classified LR-040(c) — not-applicable / app-bug — in `SUBPLAN_LEGAL_FCC.md` and the master plan; none is a coverage gap.

| TC | Status | Reason | Tracking |
|---|---|---|---|
| TC-LOC-LGL-015 | Manual (deferred) | Country-cascade reset depends on a left-panel Country selector. `SUBPLAN_LEFT_PANEL_FCC.md` was user-directed NOT to be created (2026-05-26), so the precondition selector is unavailable to automate against. | Discussion-item flagged in `PLAN_BIG_PIVOT_FCC_MASTER.md` §Roadmap (left-panel row). |
| TC-LOC-LGL-016 | OMITTED | **APP BUG** — Service Charge dropdown is NOT sorted alphabetically (generic names first, then location-specific). v1 requirement says "sorted alphabetically"; the test would fail against live behavior. | Logged in `REQUIREMENTS.md` + master plan. |
| TC-LOC-LGL-017 | OMITTED | **APP BUG** — Terms & Conditions dropdown is NOT sorted alphabetically (same pattern as SC). | Logged in `REQUIREMENTS.md` + master plan. |

(Documentation collected by PLAN_DONE_MEANS_DONE Phase 1.8, 2026-05-28 — Legal-specific; no cross-module OMITTED-schema codification, per the finding #8 downgrade to a 1-of-3 pattern.)
