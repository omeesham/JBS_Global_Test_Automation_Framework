# Location Auto Add-On Test Plan
**Module**: locations | **Updated**: 2026-03-24
**Test Cases**: specs_planning/test-cases/locations/locations_auto_addon_test_cases.md
**Page URL**: `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location`
**Navigation**: sidebar Setup button → "Location" menu item (NOT "Local Office Settings") → click "Auto Add-On" sub-tab

## Selector Mapping

| TC ID | Selector Keys Used |
|---|---|
| TC-LOC-AAO-001 | tabAutoAddon, contentAutoAddon, formAutoAddon, chkAutoAddonAll |
| TC-LOC-AAO-002 | tabAutoAddon, chkAutoAddonEncoreMusic, chkAutoAddonWirelessPresenter, chkAutoAddonExpressContentDesignSession, chkAutoAddonWordly, chkAutoAddonLabor, btnSave |
| TC-LOC-AAO-003 | tabAutoAddon, chkAutoAddonEncoreMusic, btnSave |
| TC-LOC-AAO-004 | tabAutoAddon, chkAutoAddonExpressContentDesignSession, btnSave |
| TC-LOC-AAO-005 | tabAutoAddon, chkAutoAddonExpressContentDesignSession, btnSave |
| TC-LOC-AAO-006 | tabAutoAddon, chkAutoAddonExpressContentDesignSession, btnSave, dlgSaveChanges, btnSaveChangesCancel, btnSaveChangesOk |
| TC-LOC-AAO-007 | tabAutoAddon, chkAutoAddonExpressContentDesignSession, btnSave, dlgSaveChanges, btnSaveChangesCancel |
| TC-LOC-AAO-008 | tabAutoAddon, chkAutoAddonExpressContentDesignSession, btnSave, dlgSaveChanges, btnSaveChangesOk, toastLocalInfoUpdated |
| TC-LOC-AAO-009 | tabAutoAddon, chkAutoAddonExpressContentDesignSession, btnSave, dlgSaveChanges, btnSaveChangesOk |
| TC-LOC-AAO-010 | tabAutoAddon, btnSave |
| TC-LOC-AAO-011 | tabAutoAddon, chkAutoAddonEncoreMusic, chkAutoAddonExpressContentDesignSession, btnSave, dlgSaveChanges, btnSaveChangesOk |
| TC-LOC-AAO-012 | tabAutoAddon, chkAutoAddonExpressContentDesignSession |
| TC-LOC-AAO-013 | tabAutoAddon, chkAutoAddonExpressContentDesignSession, dlgUnsavedChanges, btnUnsavedChangesStay, btnUnsavedChangesDiscard |
| TC-LOC-AAO-014 | tabAutoAddon, chkAutoAddonExpressContentDesignSession, dlgUnsavedChanges, btnUnsavedChangesStay |
| TC-LOC-AAO-015 | tabAutoAddon, chkAutoAddonExpressContentDesignSession, dlgUnsavedChanges, btnUnsavedChangesDiscard |
| TC-LOC-AAO-016 | tabAutoAddon, chkAutoAddonAll |

## UI Testing Checklist

| Check | Status |
|---|---|
| selectorReconciliation | PASS — Shadow DOM eliminated (2026-03-23). All checkboxes in main DOM as React/Radix UI. data-testid pattern: `location-settings-checkbox-auto-add-on-{isDefault}_{lowercase item name}`. All selectors PLN-027 verified. |
| explorationCleanup | PASS — ECDS toggled during live verification, restored to unchecked; no save performed |
| saveButtonBehavior | PASS — Smart form diff: Save re-disables on revert to original state |
| dialogInventory | PASS — Save Changes: role=alertdialog, heading "Save Changes", buttons Cancel + Ok. Unsaved changes: role=alertdialog, heading "Unsaved changes" (lowercase c), buttons Stay + Discard. |
| fieldCountReconciliation | PASS — 5 items for office 1604 (2026-03-24): Encore Music, Wireless Presenter, Express Content Design Session, Wordly, Labor |
| tcPlanSync | PASS — All 16 scenarios match TC titles and steps 1:1 (re-synced 2026-03-24) |

---

## Scenario: TC-LOC-AAO-001 - Navigate to Auto Add-On Tab
0. Step: page.goto(`{BASE_URL}locations/1604/settings/location`), expected: Location Settings page loads
1. Step: tabAutoAddon.click(), expected: tab becomes selected; contentAutoAddon is visible; formAutoAddon is present; wait for chkAutoAddonEncoreMusic to appear
2. Step: Verify contentAutoAddon is visible, expected: tabpanel container rendered
3. Step: Verify at least 1 item from chkAutoAddonAll is present, expected: checkbox list renders

---

## Scenario: TC-LOC-AAO-002 - Default State of Checkbox Items (location 1604)
0. Step: Navigate fresh (about:blank -> target URL), expected: clean page load per PLN-023
1. Step: tabAutoAddon.click(), expected: 5 checkbox items visible
2. Step: Verify chkAutoAddonEncoreMusic.getAttribute("aria-checked"), expected: "true"
3. Step: Verify chkAutoAddonWirelessPresenter.getAttribute("aria-checked"), expected: "true"
4. Step: Verify chkAutoAddonExpressContentDesignSession.getAttribute("aria-checked"), expected: "false"
5. Step: Verify chkAutoAddonWordly.getAttribute("aria-checked"), expected: "true"
6. Step: Verify chkAutoAddonLabor.getAttribute("aria-checked"), expected: "true"
7. Step: Verify btnSave.isDisabled(), expected: true

---

## Scenario: TC-LOC-AAO-003 - Toggle Checked Item to Unchecked — Save Enables
1. Step: tabAutoAddon.click(), expected: tabpanel loads; Encore Music is checked
2. Step: chkAutoAddonEncoreMusic.click(), expected: aria-checked changes to "false"
3. Step: Verify btnSave.isDisabled(), expected: false (enabled)
4. Step: Cleanup: chkAutoAddonEncoreMusic.click(), expected: re-checked; btnSave re-disables via smart diff

---

## Scenario: TC-LOC-AAO-004 - Toggle Unchecked Item to Checked — Save Enables
1. Step: tabAutoAddon.click(), expected: tabpanel loads; ECDS is unchecked
2. Step: chkAutoAddonExpressContentDesignSession.click(), expected: aria-checked changes to "true"
3. Step: Verify btnSave.isDisabled(), expected: false (enabled)
4. Step: Cleanup: chkAutoAddonExpressContentDesignSession.click(), expected: unchecked; btnSave re-disables

---

## Scenario: TC-LOC-AAO-005 - Revert Toggle Re-Disables Save (Smart Form Diff)
1. Step: tabAutoAddon.click(), expected: ECDS unchecked; btnSave disabled
2. Step: chkAutoAddonExpressContentDesignSession.click(), expected: checked; btnSave enabled
3. Step: chkAutoAddonExpressContentDesignSession.click(), expected: unchecked (reverted to original)
4. Step: Verify btnSave.isDisabled(), expected: true (re-disabled — smart form diff, no net change)

---

## Scenario: TC-LOC-AAO-006 - Save Dialog Appears on Save Click
1. Step: tabAutoAddon.click(); chkAutoAddonExpressContentDesignSession.click(), expected: checked; Save enabled
2. Step: btnSave.click(), expected: dlgSaveChanges appears (role=alertdialog)
3. Step: Verify heading text in dlgSaveChanges, expected: "Save Changes"
4. Step: Verify body text, expected: "Are you sure you want to save the changes?"
5. Step: Verify btnSaveChangesCancel and btnSaveChangesOk present, expected: "Cancel" + "Ok" buttons visible
6. Step: Cleanup: btnSaveChangesCancel.click(); chkAutoAddonExpressContentDesignSession.click()

---

## Scenario: TC-LOC-AAO-007 - Save Dialog Cancel — Dismisses Without Saving
1. Step: tabAutoAddon.click(); chkAutoAddonExpressContentDesignSession.click(), expected: checked; Save enabled
2. Step: btnSave.click(), expected: dlgSaveChanges appears
3. Step: btnSaveChangesCancel.click(), expected: dialog dismisses
4. Step: Verify chkAutoAddonExpressContentDesignSession.getAttribute("aria-checked"), expected: "true" (pending state preserved)
5. Step: Verify btnSave.isDisabled(), expected: false (still enabled — change not saved)
6. Step: Cleanup: chkAutoAddonExpressContentDesignSession.click() to revert

---

## Scenario: TC-LOC-AAO-008 - Save Dialog Ok — Saves Successfully with Toast
1. Step: tabAutoAddon.click(); chkAutoAddonExpressContentDesignSession.click(), expected: checked; Save enabled
2. Step: btnSave.click(), expected: dlgSaveChanges appears
3. Step: btnSaveChangesOk.click(), expected: dialog closes; toastLocalInfoUpdated appears with text "Local information updated"; btnSave becomes disabled
4. Step: Cleanup: chkAutoAddonExpressContentDesignSession.click(); btnSave.click(); btnSaveChangesOk.click()

---

## Scenario: TC-LOC-AAO-009 - Toggle Persists After Page Reload
1. Step: tabAutoAddon.click(); chkAutoAddonExpressContentDesignSession.click(), expected: checked
2. Step: btnSave.click(); btnSaveChangesOk.click(), expected: saved; toast shown
3. Step: Navigate away (about:blank) then back to office 1604, expected: fresh page load
4. Step: tabAutoAddon.click(), expected: tabpanel loads fresh
5. Step: Verify chkAutoAddonExpressContentDesignSession.getAttribute("aria-checked"), expected: "true" (persisted)
6. Step: Cleanup: chkAutoAddonExpressContentDesignSession.click(); btnSave.click(); btnSaveChangesOk.click()

---

## Scenario: TC-LOC-AAO-010 - Save Button Disabled on Fresh Load (No Changes)
1. Step: Navigate fresh to office 1604, expected: location detail loads
2. Step: tabAutoAddon.click(), expected: tabpanel loads; no interaction
3. Step: Verify btnSave.isDisabled(), expected: true (disabled, no pending changes)

---

## Scenario: TC-LOC-AAO-011 - Multiple Toggles Saved Together
1. Step: tabAutoAddon.click(), expected: ECDS=unchecked, Encore Music=checked
2. Step: chkAutoAddonExpressContentDesignSession.click(), expected: checked
3. Step: chkAutoAddonEncoreMusic.click(), expected: unchecked
4. Step: Verify btnSave.isDisabled(), expected: false (enabled — 2 changes)
5. Step: btnSave.click(); btnSaveChangesOk.click(), expected: saved
6. Step: Navigate away then back; tabAutoAddon.click(), expected: fresh load
7. Step: Verify chkAutoAddonExpressContentDesignSession.getAttribute("aria-checked"), expected: "true"
8. Step: Verify chkAutoAddonEncoreMusic.getAttribute("aria-checked"), expected: "false"
9. Step: Cleanup: revert both; btnSave.click(); btnSaveChangesOk.click()

---

## Scenario: TC-LOC-AAO-012 - Sub-Tab Switch with Unsaved Changes — No Dialog
1. Step: tabAutoAddon.click(); chkAutoAddonExpressContentDesignSession.click(), expected: checked; Save enabled
2. Step: Click Local Information sub-tab, expected: switches to Local Information; NO dialog appears
3. Step: tabAutoAddon.click(), expected: returns to Auto Add-On; ECDS pending state preserved (checked)
4. Step: Cleanup: chkAutoAddonExpressContentDesignSession.click() to revert

---

## Scenario: TC-LOC-AAO-013 - Unsaved Changes Dialog Appears on Page Navigation Away
1. Step: tabAutoAddon.click(); chkAutoAddonExpressContentDesignSession.click(), expected: checked; Save enabled — do NOT save
2. Step: Click Home link in sidebar, expected: dlgUnsavedChanges appears (role=alertdialog)
   NOTE: Sub-tab switching does NOT trigger this — must be full page/sidebar navigation
3. Step: Verify heading "Unsaved changes" (lowercase 'c'), expected: exact text match
4. Step: Verify body "Are you sure you want to leave this view? Any unsaved changes will be lost.", expected: exact text
5. Step: Verify btnUnsavedChangesStay and btnUnsavedChangesDiscard present, expected: "Stay" + "Discard"

---

## Scenario: TC-LOC-AAO-014 - Unsaved Changes — Stay Button Keeps User on Page
1. Step: tabAutoAddon.click(); chkAutoAddonExpressContentDesignSession.click(), expected: checked
2. Step: Click Home in sidebar, expected: dlgUnsavedChanges appears
3. Step: btnUnsavedChangesStay.click(), expected: dialog closes; URL stays at /settings/location; Auto Add-On tab active
4. Step: Verify chkAutoAddonExpressContentDesignSession.getAttribute("aria-checked"), expected: "true" (pending state preserved)
5. Step: Verify btnSave.isDisabled(), expected: false (still enabled)
6. Step: Cleanup: chkAutoAddonExpressContentDesignSession.click() to revert

---

## Scenario: TC-LOC-AAO-015 - Unsaved Changes — Discard Button Navigates Away
1. Step: tabAutoAddon.click(); chkAutoAddonExpressContentDesignSession.click(), expected: checked; Save enabled
2. Step: Click Home in sidebar, expected: dlgUnsavedChanges appears
3. Step: btnUnsavedChangesDiscard.click(), expected: dialog closes; navigates to Home
4. Step: Navigate back to office 1604; tabAutoAddon.click(), expected: fresh load
5. Step: Verify chkAutoAddonExpressContentDesignSession.getAttribute("aria-checked"), expected: "false" (original — change was discarded)

---

## Scenario: TC-LOC-AAO-016 - Item Count Is Location-Specific
1. Step: Navigate to office 1604; tabAutoAddon.click(); count chkAutoAddonAll, expected: 5 items
2. Step: Navigate to a different location; tabAutoAddon.click(); count chkAutoAddonAll, expected: may differ from 5
3. Step: Verify item list is location-specific, expected: different locations may have different items/counts
NOTE: Status: Blocked (Cat-A: requires second location with different add-on config)
