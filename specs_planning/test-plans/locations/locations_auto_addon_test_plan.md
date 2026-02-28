# Location Auto Add-On Test Plan
**Module**: locations | **Updated**: 2026-02-19
**Test Cases**: specs_planning/test-cases/locations/locations_auto_addon_test_cases.md

## Selector Mapping

| TC ID | Selector Keys Used |
|---|---|
| TC-LOC-AAO-001 | tabAutoAddOn, pnlAutoAddOn |
| TC-LOC-AAO-002 | tabAutoAddOn, pnlAutoAddOn, chkAutoAddOnItem (dynamic) |
| TC-LOC-AAO-003 | tabAutoAddOn, chkAutoAddOnEncoreMusic, chkAutoAddOnWirelessPresenter, chkAutoAddOnWordly, chkAutoAddOnLabor |
| TC-LOC-AAO-004 | tabAutoAddOn, chkAutoAddOnExpressContentDesign |
| TC-LOC-AAO-005 | tabAutoAddOn, btnSave |
| TC-LOC-AAO-006 | tabAutoAddOn, chkAutoAddOnEncoreMusic, btnSave |
| TC-LOC-AAO-007 | tabAutoAddOn, chkAutoAddOnExpressContentDesign, btnSave |
| TC-LOC-AAO-008 | tabAutoAddOn, chkAutoAddOnEncoreMusic, btnSave |
| TC-LOC-AAO-009 | tabAutoAddOn, chkAutoAddOnExpressContentDesign, btnSave, dlgSaveChanges, btnSaveChangesCancel, btnSaveChangesConfirm |
| TC-LOC-AAO-010 | tabAutoAddOn, chkAutoAddOnExpressContentDesign, btnSave, dlgSaveChanges, btnSaveChangesCancel |
| TC-LOC-AAO-011 | tabAutoAddOn, chkAutoAddOnExpressContentDesign, btnSave, dlgSaveChanges, btnSaveChangesConfirm |
| TC-LOC-AAO-012 | tabAutoAddOn, chkAutoAddOnEncoreMusic, chkAutoAddOnExpressContentDesign, chkAutoAddOnWordly, btnSave |
| TC-LOC-AAO-013 | tabAutoAddOn, chkAutoAddOnExpressContentDesign, btnSave, btnBackToLocationSearch, dlgUnsavedChanges, btnUnsavedChangesCancel, btnUnsavedChangesOk |
| TC-LOC-AAO-014 | tabAutoAddOn, chkAutoAddOnExpressContentDesign, btnBackToLocationSearch, dlgUnsavedChanges, btnUnsavedChangesOk |
| TC-LOC-AAO-015 | tabAutoAddOn, pnlAutoAddOn, btnSave |
| TC-LOC-AAO-016 | tabAutoAddOn, pnlAutoAddOn |

## UI Testing Checklist

| Check | Status |
|---|---|
| selectorReconciliation | ✓ Shadow DOM pierced — checkboxes confirmed as `button[data-slot="checkbox"]` inside `next-location-settings`; label-to-button association verified; dynamic selectors required (items vary per location) |
| explorationCleanup | ✓ Express Content Design Session toggled twice during exploration — restored to original unchecked state; no save performed |
| saveButtonBehavior | ✓ Verified live: Save disabled on load; activates on first toggle; does NOT reset after revert |
| fieldCountReconciliation | ✓ 5 items for office 1604 verified live (userNotes said 6 — "Test Labor - Jonathan" not present in current live state; documented as removed or location-specific) |

---

## Scenario: TC-LOC-AAO-001 - Verify Auto Add-On tab navigation and panel load
1. Step: tab[Auto Add-On].click(), expected: tabpanel "Auto Add-On" becomes active
2. Step: Verify next-location-settings shadow host is present, expected: element visible in DOM
3. Step: Verify at least 1 button[data-slot="checkbox"] present inside shadow host, expected: checkbox items rendered

---

## Scenario: TC-LOC-AAO-002 - Verify correct item count displayed for location 1604
1. Step: tab[Auto Add-On].click(), expected: tabpanel loads
2. Step: Count all button[data-slot="checkbox"] inside next-location-settings, expected: 5 elements
3. Step: Verify label text for each item, expected: "Encore Music", "Wireless Presenter", "Express Content Design Session", "Wordly", "Labor"

---

## Scenario: TC-LOC-AAO-003 - Verify checked items show checked state on load
1. Step: tab[Auto Add-On].click(), expected: tabpanel loads
2. Step: Verify chkAutoAddOnItem("Encore Music").getAttribute("aria-checked"), expected: "true"
3. Step: Verify chkAutoAddOnItem("Wireless Presenter").getAttribute("aria-checked"), expected: "true"
4. Step: Verify chkAutoAddOnItem("Wordly").getAttribute("aria-checked"), expected: "true"
5. Step: Verify chkAutoAddOnItem("Labor").getAttribute("aria-checked"), expected: "true"

---

## Scenario: TC-LOC-AAO-004 - Verify unchecked item shows unchecked state on load
1. Step: tab[Auto Add-On].click(), expected: tabpanel loads
2. Step: Verify chkAutoAddOnItem("Express Content Design Session").getAttribute("aria-checked"), expected: "false"
3. Step: Verify data-state attribute, expected: "unchecked"

---

## Scenario: TC-LOC-AAO-005 - Verify Save button is disabled on initial tab load
1. Step: Navigate fresh to office 1604, expected: location detail loads
2. Step: tab[Auto Add-On].click(), expected: tabpanel loads with no user interaction
3. Step: Verify button:has-text("Save").isDisabled(), expected: true

---

## Scenario: TC-LOC-AAO-006 - Toggle checked item to unchecked — Save button activates
1. Step: tab[Auto Add-On].click(), expected: tabpanel loads
2. Step: chkAutoAddOnItem("Encore Music").click(), expected: aria-checked changes to "false"
3. Step: Verify btnSave.isDisabled(), expected: false (now enabled)
4. Step: Cleanup: chkAutoAddOnItem("Encore Music").click(), expected: aria-checked back to "true"

---

## Scenario: TC-LOC-AAO-007 - Toggle unchecked item to checked — Save button activates
1. Step: tab[Auto Add-On].click(), expected: tabpanel loads
2. Step: chkAutoAddOnItem("Express Content Design Session").click(), expected: aria-checked changes to "true"
3. Step: Verify btnSave.isDisabled(), expected: false (now enabled)
4. Step: Cleanup: chkAutoAddOnItem("Express Content Design Session").click(), expected: aria-checked back to "false"

---

## Scenario: TC-LOC-AAO-008 - Toggle and revert — Save button remains enabled
1. Step: tab[Auto Add-On].click(), expected: tabpanel loads
2. Step: chkAutoAddOnItem("Encore Music").click(), expected: aria-checked="false"; btnSave enabled
3. Step: chkAutoAddOnItem("Encore Music").click(), expected: aria-checked="true" (reverted)
4. Step: Verify btnSave.isDisabled(), expected: false (still enabled — event-based tracking)
5. Step: Navigate away without saving to discard, expected: return to search list

---

## Scenario: TC-LOC-AAO-009 - Click Save with unsaved changes — confirmation dialog appears
1. Step: tab[Auto Add-On].click(), expected: tabpanel loads
2. Step: chkAutoAddOnItem("Express Content Design Session").click(), expected: aria-checked="true"; btnSave enabled
3. Step: btnSave.click(), expected: dlgSaveChanges appears (role=alertdialog)
4. Step: Verify heading "Save Changes" and body "Are you sure you want to save the changes?", expected: exact text matches
5. Step: Verify Cancel and Save buttons present in dlgSaveChanges, expected: two buttons visible
6. Step: Cleanup: btnSaveChangesCancel.click(); chkAutoAddOnItem("Express Content Design Session").click()

---

## Scenario: TC-LOC-AAO-010 - Cancel save dialog — no change persisted
1. Step: tab[Auto Add-On].click(); chkAutoAddOnItem("Express Content Design Session").click(), expected: checked; Save enabled
2. Step: btnSave.click(), expected: dlgSaveChanges appears
3. Step: btnSaveChangesCancel.click(), expected: dialog closes; tab still active
4. Step: Verify chkAutoAddOnItem("Express Content Design Session").getAttribute("aria-checked"), expected: "true" (UI state unchanged)
5. Step: page.reload(), expected: page reloads
6. Step: tab[Auto Add-On].click(); verify chkAutoAddOnItem("Express Content Design Session"), expected: aria-checked="false" (original state)

---

## Scenario: TC-LOC-AAO-011 - Confirm save — changes persist after page reload
1. Step: tab[Auto Add-On].click(); chkAutoAddOnItem("Express Content Design Session").click(), expected: checked; Save enabled
2. Step: btnSave.click(), expected: dlgSaveChanges appears
3. Step: btnSaveChangesConfirm.click(), expected: dialog closes; changes saved
4. Step: page.reload(), expected: page reloads for office 1604
5. Step: tab[Auto Add-On].click(), expected: tabpanel loads
6. Step: Verify chkAutoAddOnItem("Express Content Design Session").getAttribute("aria-checked"), expected: "true"
7. Step: Cleanup: chkAutoAddOnItem("Express Content Design Session").click(); btnSave.click(); btnSaveChangesConfirm.click()

---

## Scenario: TC-LOC-AAO-012 - Toggle multiple items — all tracked as single unsaved state
1. Step: tab[Auto Add-On].click(), expected: tabpanel loads
2. Step: chkAutoAddOnItem("Encore Music").click(), expected: unchecked; btnSave enabled
3. Step: chkAutoAddOnItem("Express Content Design Session").click(), expected: checked; btnSave still enabled
4. Step: chkAutoAddOnItem("Wordly").click(), expected: unchecked; btnSave still enabled
5. Step: Verify all 3 changes reflected in aria-checked values, expected: "false", "true", "false" respectively
6. Step: Cleanup: revert all 3; navigate away without saving

---

## Scenario: TC-LOC-AAO-013 - Navigate away with unsaved changes — discard prompt
1. Step: tab[Auto Add-On].click(); chkAutoAddOnItem("Express Content Design Session").click(), expected: checked; Save enabled
2. Step: btnBackToLocationSearch.click(), expected: dlgUnsavedChanges appears (no role=dialog; custom div)
3. Step: Verify h2:has-text("Unsaved Changes") is visible, expected: heading "Unsaved Changes" present
4. Step: Verify p:has-text("leave this view") body, expected: "Any unsaved changes will be lost."
5. Step: Verify Cancel and OK buttons present (NOT Save), expected: btnUnsavedChangesCancel + btnUnsavedChangesOk

---

## Scenario: TC-LOC-AAO-014 - Discard unsaved changes — original state restored
1. Step: tab[Auto Add-On].click(); chkAutoAddOnItem("Express Content Design Session").click(), expected: checked
2. Step: btnBackToLocationSearch.click(), expected: dlgUnsavedChanges appears
3. Step: btnUnsavedChangesOk.click(), expected: dialog closes; navigates to location search list
4. Step: Navigate back to office 1604 -- Auto Add-On tab, expected: tabpanel loads
5. Step: Verify chkAutoAddOnItem("Express Content Design Session").getAttribute("aria-checked"), expected: "false" (original state unchanged)

---

## Scenario: TC-LOC-AAO-015 - No add-on items — verify empty state or empty list
1. Step: Navigate to location with no Auto Add-On items configured, expected: location detail loads
2. Step: tab[Auto Add-On].click(), expected: tabpanel loads
3. Step: Count button[data-slot="checkbox"] inside next-location-settings, expected: 0
4. Step: Verify panel displays empty state gracefully (no error, blank or placeholder), expected: no checkboxes, no JS error
5. Step: Verify btnSave.isDisabled(), expected: true

---

## Scenario: TC-LOC-AAO-016 - Items vary per location — different location shows different list
1. Step: Open office 1604 -- Auto Add-On tab, count items, expected: 5 items
2. Step: Navigate to second location -- Auto Add-On tab, count items, expected: different count or different labels than 1604
3. Step: Verify item list is location-specific, expected: lists differ across locations
