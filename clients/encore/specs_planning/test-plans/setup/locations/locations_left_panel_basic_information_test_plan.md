# Location - Left Panel (Basic Information) Test Plan

**Module**: locations (left_panel_basic_information)
**Test Cases**: specs_planning/test-cases/setup/locations/locations_left_panel_basic_information_test_cases.md
**Location Under Test**: 1604 (Parker Palm Springs)
**Implemented**: clients/encore/specs/locations/location-left-panel-basic-information.spec.ts (2026-06-03; 26 of 27 automated, full run 27 passed ×2)

> **Live corrections (2026-06-03, LR-020)**: Line Of Business is READ-ONLY in edit mode (NM-831/NM-1140 — see TC-016); Servicing Branch has 218 options (not 215); Live Date is volatile on shared office 1604 (assert format, not value); Local Office Name maxlength = 255 (not 50, flagged to Encore); clearing the required name DISABLES Save (not enables); reverting a change is net-zero → Save disables (LR-009/LR-026). TC-024 deferred (design decision).

---

## Scenario: TC-LOC-LP-001 — Baseline Field State
1. Navigate: `page.goto('locations/1604/settings')` -- wait for tabpanel "Basic Information"
2. Assert: `txtOffice` has value "1604" and is disabled
3. Assert: `txtLocalOffice` has value "1604" and is disabled
4. Assert: `txtLocalOfficeName` has value "Parker Palm Springs"
5. Assert: `chkActive` has `data-state="checked"`
6. Assert: `btnLiveDate` text matches the "Month Dayth, YYYY" format (value-agnostic — 1604 Live Date drifts; live 2026-06-03 = "June 15th, 1990")
7. Assert: `drpTaxMode` shows "US"
8. Assert: `drpCountry` shows "United States"
9. Assert: `drpRegion` shows "Palm Springs"
10. Assert: `drpServicingBranchOffice` shows "Select Servicing Branch Office"
11. Assert: `drpLineOfBusiness` shows "Hotel Services Division"
12. Assert: `txtPayToAddress` has value "Encore" and is disabled
13. Assert: `chkUnion` has `data-state="unchecked"`
14. Assert: `chkECommerceActive` has `data-state="checked"` and `data-disabled=""`
15. Assert: `chkEnableProductionsOrders` has `data-state="checked"` and `data-disabled=""`

## Scenario: TC-LOC-LP-002 — Office Always Disabled
1. Assert: `txtOffice` has attribute `disabled`
2. Click `txtOffice` -- verify no focus or cursor

## Scenario: TC-LOC-LP-003 — Local Office Always Disabled
1. Assert: `txtLocalOffice` has attribute `disabled`
2. Click `txtLocalOffice` -- verify no focus

## Scenario: TC-LOC-LP-004 — Pay To Address Always Disabled
1. Assert: `txtPayToAddress` has attribute `disabled`
2. Verify Pay To Address label may be clickable link (address picker)

## Scenario: TC-LOC-LP-005 — eCommerce Active Permanently Disabled
1. Assert: `chkECommerceActive` `data-state="checked"` and `data-disabled=""`
2. Click `chkECommerceActive` -- assert state unchanged (still "checked")

## Scenario: TC-LOC-LP-006 — Enable Productions Orders Permanently Disabled
1. Assert: `chkEnableProductionsOrders` `data-state="checked"` and `data-disabled=""`
2. Click -- assert unchanged

## Scenario: TC-LOC-LP-007 — Save Disabled on Pristine
1. Navigate fresh to location 1604
2. Assert: `btnSave` (left panel) has `disabled` attribute on page load

## Scenario: TC-LOC-LP-008 — Save Enables on Form Change
1. Assert `btnSave` disabled
2. Click `chkUnion` -- toggle
3. Assert `btnSave` is enabled (no `disabled` attribute)
4. Click `chkUnion` again -- restore (net-zero revert)
5. Assert `btnSave` returns to DISABLED (Angular detects no net change; LR-009/LR-026 — corrected per LR-020)

## Scenario: TC-LOC-LP-009 — Local Office Name Required Validation
1. Click `txtLocalOfficeName` -- Ctrl+A -- Delete -- Tab
2. Assert: exclamation icon `img` appears adjacent to field
3. Assert: `btnSave` is DISABLED (empty required field gates Save — corrected per LR-020; the original "Save enables on empty" anomaly no longer reproduces)

## Scenario: TC-LOC-LP-010 — Local Office Name maxlength (live = 255)
1. Read the `txtLocalOfficeName` `maxlength` attribute
2. Assert: maxlength = 255 (live 2026-06-03; the original MD's "50" was stale — corrected per LR-020, flagged to Encore)

## Scenario: TC-LOC-LP-011 — Active Checkbox Toggle
1. Assert `chkActive` `data-state="checked"`
2. Click `chkActive` -- assert `data-state="unchecked"`
3. Click `chkActive` -- assert `data-state="checked"`
4. Click `btnSave` -- wait for save success
5. Reload -- assert `chkActive` `data-state="checked"` (if re-checked before save)

## Scenario: TC-LOC-LP-012 — Union Checkbox Toggle
1. Assert `chkUnion` `data-state="unchecked"`
2. Click -- assert "checked"
3. Click `btnSave` -- save success
4. Reload -- assert `chkUnion` "checked"
5. Click -- uncheck -- Save -- reload to restore

## Scenario: TC-LOC-LP-013 — Tax Mode Dropdown Options
1. Click `drpTaxMode` -- listbox appears
2. Assert role="option" count = 2
3. Assert options: ["US", "International"]
4. Assert current selected = "US"
5. Escape -- close

## Scenario: TC-LOC-LP-014 — Country Dropdown Options
1. Click `drpCountry` -- listbox appears
2. Assert option count = 4
3. Assert options: ["United States", "Mexico", "Canada", "Bahamas"]
4. Assert selected = "United States"
5. Escape

## Scenario: TC-LOC-LP-015 — Region Dropdown 59 Options
1. Click `drpRegion` -- listbox
2. Assert option count = 59
3. Assert options are alphabetical (first = "Alabama")
4. Assert current = "Palm Springs"
5. Select "Boston" -- assert field updates

## Scenario: TC-LOC-LP-016 — Line Of Business Read-Only (corrected — was "3-option dropdown")
1. Assert `drpLineOfBusiness` is DISABLED (read-only in edit mode — Encore NM-831/NM-1140, selectable only at creation)
2. Assert displayed value = "Hotel Services Division"

## Scenario: TC-LOC-LP-017 — Servicing Branch Office Dropdown
1. Click `drpServicingBranchOffice` -- listbox
2. Assert count > 200 (live 2026-06-03 = 218; LR-022 — exact count not asserted)
3. Assert option[0] is a non-empty string (first option varies by environment — do NOT assert a fixed value; the spec asserts only `options[0]` truthy)
4. Select any option -- field updates, Save enables

## Scenario: TC-LOC-LP-018 — Country Change Clears Tax Mode + Region
1. Assert Tax Mode = "US", Region = "Palm Springs"
2. Click `drpCountry` -- select "Canada"
3. Assert `drpTaxMode` value is empty; exclamation icon visible
4. Assert `drpRegion` value is empty
5. Assert `btnSave` is disabled (`data-disabled=""`)

## Scenario: TC-LOC-LP-019 — Save Disabled When TaxModeID = 0
1. Change Country to Canada (Tax Mode clears)
2. Assert `btnSave` disabled
3. Click `drpTaxMode` -- select "International"
4. Assert `btnSave` is enabled

## Scenario: TC-LOC-LP-020 — Tax Mode Not Auto-Restored on Country Change
1. Change Country to Canada (Tax Mode clears)
2. Change Country back to United States
3. Assert `drpTaxMode` is still empty (not "US")
4. Assert `drpRegion` is still empty (not "Palm Springs")

## Scenario: TC-LOC-LP-021 — USA Enables Job Costing in Local Info
1. Click tab "Local Information" -- Assert `chkEnableJobCosting` `data-state="checked"`
2. Return to "Basic Information" tab
3. Change Country to Canada
4. Click "Local Information" tab -- Assert `chkEnableJobCosting` `data-state="unchecked"`

## Scenario: TC-LOC-LP-022 — Canada Reveals Remit PST Tax
1. Click "Local Information" tab -- verify no "Remit PST Tax" element
2. Return to "Basic Information" -- change Country to Canada
3. Click "Local Information" tab -- Assert "Remit PST Tax" checkbox visible + checked

## Scenario: TC-LOC-LP-023 — Live Date Popover
1. Click `btnLiveDate` -- popover/calendar opens
2. Assert calendar/popover visible
3. Assert the popover is visible (date-agnostic — 1604 Live Date is volatile; the spec asserts only that the popover opens, not a fixed month/year)
4. Escape -- popover closes

## Scenario: TC-LOC-LP-024 — Cross-Tab Save: Legal Invalid (DEFERRED)
DEFERRED (c) — not automated. Driving the Legal tab invalid (clearing the required Service Charge) has
no UI "clear" affordance on the Radix required select AND risks Legal state-leak (Legal Path D teardown).
Save-gating on an invalid Basic-Information state is already proven by TC-019. Flagged for a design decision.

## Scenario: TC-LOC-LP-025 — Local Office Name Persists Through Save+Reload (net-new)
1. Set `txtLocalOfficeName` to "Parker Palm Springs QA" (keystrokes — fill() bypasses Angular dirty)
2. Save + confirm "Ok" dialog -- wait for Save to re-disable (save landed)
3. Reload -- assert `txtLocalOfficeName` = "Parker Palm Springs QA"
4. Restore to "Parker Palm Springs" + save (no state leak)

## Scenario: TC-LOC-LP-026 — Tax Mode Persists Through Save+Reload (net-new)
1. Select Tax Mode "International" -- Save + confirm -- Reload -- assert "International"
2. Restore to "US" + save

## Scenario: TC-LOC-LP-027 — Region Persists Through Save+Reload (net-new)
1. Select Region "Boston" -- Save + confirm -- Reload -- assert "Boston"
2. Restore to "Palm Springs" + save
