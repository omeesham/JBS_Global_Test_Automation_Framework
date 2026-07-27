# Auto Add-On Test Cases — **Module**: locations | **Total**: 20 | **Status**: Complete

**Module**: locations
**Updated**: 2026-06-11 | **Page URL**: `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location` (Setup > Location > Auto Add-On tab)

## MCP_VERIFICATION_LOG

| Field | Value |
|-------|-------|
| Date | 2026-06-11 (live re-walk via Playwright CLI, office 1604 — SUBPLAN_AUTO_ADDON_FCC) |
| URL | https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location |
| Office/Entity | 1604 Parker Palm Springs |
| Total fields found | 5 checkboxes |
| Total fields tested (edit+save) | 5 — all toggled, saved, reloaded, verified |
| Save dialog | Yes — `confirmation dialog` heading "Save Changes" \| body "Are you sure you want to save the changes?" \| buttons "Cancel" + "Ok" |
| Unsaved Changes dialog | Yes — `confirmation dialog` heading "Unsaved changes" \| body "Are you sure you want to leave this view? Any unsaved changes will be lost." \| buttons "Stay" + "Discard" |
| Checkbox items (location 1604) | Encore Music (checked), Wireless Presenter (checked), Express Content Design Session (unchecked), Wordly (checked), Labor (checked) |
| Cascade behaviors | None — simple independent toggles, no field dependencies |
| Input attribute types | `button[role="checkbox"]` \| testid pattern: `location-settings-checkbox-auto-add-on-{isDefault}_{lowercase item name}` |
| Validation error patterns | None — no validation, any toggle is valid |
| Filtering mechanism | N/A — no filter/search on this tab |
| API loading | Readiness: wait for `[data-testid="location-settings-checkbox-auto-add-on-false_encore music"]` to appear |
| Strict mode risks | `chkAutoAddonAll` selector matches 5 elements — use specific testid selectors per item for assertions |
| Form structure | Save button: shared left-panel `[data-testid="location-settings-btn-save"]` — disabled when no changes, unique on page |
| Dialog side effects | Save dialog Cancel = safe (pending change preserved, Save still enabled) |
| Post-reload timing | All 5 checkboxes load simultaneously — no async stagger observed |
| Readiness signal | Wait for `[data-testid="location-settings-checkbox-auto-add-on-false_encore music"]` to be present |
| Sequential interactions | Sub-tab switch with unsaved Auto Add-On changes → pending state preserved in UI, NO Unsaved Changes dialog triggered (re-confirmed live 2026-06-11) |
| Boundary behaviors | Checkbox toggles only — no text input, no numeric fields, no XSS/SQL surface |
| Smart form diff | Reverting toggle to saved state RE-DISABLES Save button (smart diff, not just dirty flag) |
| Item list scope | Item list is **country-scoped**, not location-specific — loads via `GET /navigator/api/core/auto-addon-types?countryId=1`; constant within a country (5 items for US incl. 1604). Premise corrected 2026-06-11 (prior "varies per location" was wrong); nav2 baseline shows the same 5 items. |
| Save endpoint | `PUT /navigator/api/location/update-properties` (+ `POST /navigator/api/location/pricebook/upsert-location-pricebook`). LR-056: filter network listeners on `/navigator/api/`, never the page URL (`?_rsc=` GETs are RSC framework fetches). |
| History side effect | Auto Add-On saves produce NO Location Management History rows (user-fact, Rutvik 2026-06-11). |
| Selector verification | 10/10 selectors PASS — verified via `browser_evaluate(=> !!document.querySelector(.))` |

---

## FIELD INVENTORY

| Field | Type | Default (1604) | State | data-testid |
|---|---|---|---|---|
| Encore Music | checkbox | checked | enabled | `location-settings-checkbox-auto-add-on-false_encore music` |
| Wireless Presenter | checkbox | checked | enabled | `location-settings-checkbox-auto-add-on-false_wireless presenter` |
| Express Content Design Session | checkbox | unchecked | enabled | `location-settings-checkbox-auto-add-on-false_express content design session` |
| Wordly | checkbox | checked | enabled | `location-settings-checkbox-auto-add-on-false_wordly` |
| Labor | checkbox | checked | enabled | `location-settings-checkbox-auto-add-on-true_labor` |

## Validation Rules

N/A — Auto Add-On tab contains checkboxes only. No numeric, text, or date fields requiring validation rules.

---

## TC-LOC-AAO-001: Navigate to Auto Add-On Tab

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: none (baseline-enforcement per LR-019)
**Preconditions**: User is on Location Settings page for location 1604. Any sub-tab may be active.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the "Auto Add-On" tab and verify the tab becomes selected, the Auto Add-On panel is visible, the Auto Add-On form is present, and the checkbox list renders. | The Auto Add-On panel displays with all checkbox items visible. No errors. The page stays on the Auto Add-On panel |

**Expected**: The Auto Add-On panel displays with all checkbox items visible. No errors. The page stays on the Auto Add-On panel.

**Data**: `tabAutoAddon = [data-testid="location-settings-sub-tab-auto-add-on"]`

---

## TC-LOC-AAO-002: Default State of Checkbox Items (location 1604)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-AAO-001
**Preconditions**: Fresh page load of location 1604 settings. **Auto Add-On** tab clicked.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate fresh to location 1604 settings, click the "Auto Add-On" tab, and verify 5 checkbox items are visible. | The Auto Add-On panel displays 5 checkbox items: Encore Music, Wireless Presenter, Express Content Design Session, Wordly, and Labor. |
| 2 | Observe the "Encore Music" checkbox and verify it is checked. | The Encore Music checkbox is checked. |
| 3 | Observe the "Wireless Presenter" checkbox and verify it is checked. | The Wireless Presenter checkbox is checked. |
| 4 | Observe the "Express Content Design Session" checkbox and verify it is unchecked. | The Express Content Design Session checkbox is unchecked. |
| 5 | Observe the "Wordly" checkbox and verify it is checked. | The Wordly checkbox is checked. |
| 6 | Observe the "Labor" checkbox and verify it is checked. | The Labor checkbox is checked. |
| 7 | Observe the "Save" button and verify it is disabled. | 5 items in order: Encore Music (checked), Wireless Presenter (checked), Express Content Design Session (unchecked), Wordly (checked), Labor (checked). Save disabled |

**Expected**: 5 items in order: Encore Music (checked), Wireless Presenter (checked), Express Content Design Session (unchecked), Wordly (checked), Labor (checked). Save disabled.

**Data**: Default state MCP-verified from fresh page load per PLN-023.

---

## TC-LOC-AAO-003: Toggle Checked Item to Unchecked — Save Enables

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-AAO-001
**Preconditions**: **Auto Add-On** tab active. **Encore Music** is checked (default). **Save** is disabled.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the "Encore Music" checkbox and verify it becomes unchecked. | The Encore Music checkbox becomes unchecked. |
| 2 | Observe the "Save" button and verify it is enabled. | Unchecking a checked item immediately enables Save |

**Expected**: Unchecking a checked item immediately enables Save.

**Data**: `chkAutoAddonEncoreMusic = [data-testid="location-settings-checkbox-auto-add-on-false_encore music"]`

**Cleanup**: Re-check "Encore Music", click "Save", click "Ok" to restore default.

---

## TC-LOC-AAO-004: Toggle Unchecked Item to Checked — Save Enables

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-AAO-001
**Preconditions**: **Auto Add-On** tab active. **Express Content Design Session** is unchecked (default). **Save** is disabled.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click the "Express Content Design Session" checkbox and verify it becomes checked. | The Express Content Design Session checkbox becomes checked. |
| 2 | Observe the "Save" button and verify it is enabled. | Checking an unchecked item immediately enables Save |

**Expected**: Checking an unchecked item immediately enables Save.

**Data**: `chkAutoAddonExpressContentDesignSession = [data-testid="location-settings-checkbox-auto-add-on-false_express content design session"]`

**Cleanup**: Uncheck "Express Content Design Session", click "Save", click "Ok".

---

## TC-LOC-AAO-005: Revert Toggle Re-Disables Save

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-AAO-001
**Preconditions**: **Auto Add-On** tab active. **Express Content Design Session** is unchecked (default). **Save** is disabled.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Express Content Design Session" to check it and verify Save enables. | The Express Content Design Session checkbox becomes checked and the Save button becomes enabled. |
| 2 | Click "Express Content Design Session" again to uncheck it (back to original) and verify Save becomes disabled again. | Reverting a toggle to its original saved value re-disables Save. The form compares against the saved state, not just whether a change event fired |

**Expected**: Reverting a toggle to its original saved value re-disables Save. The form compares against the saved state, not just whether a change event fired.

**Data**: `btnSave = [data-testid="location-settings-btn-save"]`

---

## TC-LOC-AAO-006: Save Dialog Appears on Save Click

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-AAO-001
**Preconditions**: **Auto Add-On** tab active. A checkbox has been toggled (Save enabled).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Express Content Design Session" to check it and verify Save enables. | The Express Content Design Session checkbox becomes checked and the Save button becomes enabled. |
| 2 | Click the "Save" button and verify the "Save Changes" dialog appears. | The Save Changes dialog is displayed. |
| 3 | Observe the dialog heading and verify it reads "Save Changes". | The dialog heading reads "Save Changes". |
| 4 | Observe the dialog body and verify it reads "Are you sure you want to save the changes?" | The dialog body reads "Are you sure you want to save the changes?" |
| 5 | Observe the dialog buttons and verify "Cancel" and "Ok" are both present. | Save Changes dialog appears with exact text and buttons |

**Expected**: Save Changes dialog appears with exact text and buttons as MCP-verified.

**Data**: `dlgSaveChanges = [an alert dialog]:has(h2:text-is("Save Changes"))` | Note: dialog has NO `data-testid`

**Cleanup**: Click "Cancel", then uncheck "Express Content Design Session".

---

## TC-LOC-AAO-007: Save Dialog Cancel — Dismisses Without Saving

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-AAO-001
**Preconditions**: Save Changes dialog is open (Express Content Design Session toggled, Save clicked).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Express Content Design Session" to check it, then click "Save" and verify the dialog opens. | The Express Content Design Session checkbox becomes checked and the Save Changes dialog opens. |
| 2 | Click "Cancel" and verify the dialog dismisses. | The Save Changes dialog closes. |
| 3 | Observe "Express Content Design Session" and verify it still shows checked. | The Express Content Design Session checkbox still shows checked. |
| 4 | Observe the "Save" button and verify it is still enabled. | Cancel closes dialog without saving. Pending change is preserved. Save remains enabled |

**Expected**: Cancel closes dialog without saving. Pending change is preserved. Save remains enabled.

**Data**: `btnSaveChangesCancel = [an alert dialog]:has(h2:text-is("Save Changes")) button:has-text("Cancel")`

**Cleanup**: Click "Save", then "Ok", or click "Express Content Design Session" again to revert.

---

## TC-LOC-AAO-008: Save Dialog Ok — Saves Successfully with Toast

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-AAO-001
**Preconditions**: **Auto Add-On** tab active. **Express Content Design Session** is unchecked (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Express Content Design Session" to check it. | The Express Content Design Session checkbox becomes checked. |
| 2 | Click "Save" and verify the dialog appears. | The Save Changes dialog is displayed. |
| 3 | Click "Ok" and verify the dialog closes, a toast "Local information updated" appears, and Save becomes disabled. | Save succeeds. Toast "Local information updated" is shown. Save re-disables after successful save |

**Expected**: Save succeeds. Toast "Local information updated" is shown. Save re-disables after successful save.

**Data**: `btnSaveChangesOk = [an alert dialog]:has(h2:text-is("Save Changes")) button:has-text("Ok")`

**Cleanup**: Uncheck "Express Content Design Session", click "Save", click "Ok" to restore default.

---

## TC-LOC-AAO-009: Toggle Persists After Page Reload

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-AAO-001
**Preconditions**: **Auto Add-On** tab. **Express Content Design Session** is unchecked (default saved state).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Express Content Design Session" to check it. | The Express Content Design Session checkbox becomes checked. |
| 2 | Click "Save", then click "Ok" and verify the toast "Local information updated" appears. | A toast reading "Local information updated" is displayed. |
| 3 | Navigate away then back to the location 1604 settings page. | The Location Settings page for location 1604 is displayed. |
| 4 | Click the "Auto Add-On" tab and verify it loads fresh. | The Auto Add-On panel loads fresh with the updated saved values. |
| 5 | Observe "Express Content Design Session" and verify it is checked. | Toggled value persists after full page reload - server state was updated |

**Expected**: Toggled value persists after full page reload — server state was updated.

**Data**: Check `aria-checked="true"` on `[data-testid="location-settings-checkbox-auto-add-on-false_express content design session"]` after reload.

**Cleanup**: Uncheck "Express Content Design Session", click "Save", click "Ok".

---

## TC-LOC-AAO-010: Save Button Disabled on Fresh Load (No Changes)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOC-AAO-001
**Preconditions**: None.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate fresh to location 1604 settings and click the "Auto Add-On" tab. | The Auto Add-On panel is displayed with the default checkbox values loaded. |
| 2 | Do NOT interact with any checkbox. | The checkbox states remain unchanged with no pending edits. |
| 3 | Observe the "Save" button and verify it is disabled. | Save button is disabled on fresh load with no pending changes |

**Expected**: Save button is disabled on fresh load with no pending changes.

**Data**: `btnSave = [data-testid="location-settings-btn-save"]`

---

## TC-LOC-AAO-011: Multiple Toggles Saved Together

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOC-AAO-001
**Preconditions**: **Auto Add-On** tab active. Default: Express Content Design Session = unchecked, Encore Music=checked.

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Express Content Design Session" to check it. | The Express Content Design Session checkbox becomes checked. |
| 2 | Click "Encore Music" to uncheck it. | The Encore Music checkbox becomes unchecked. |
| 3 | Observe the "Save" button and verify it is enabled. | The Save button is enabled. |
| 4 | Click "Save", then click "Ok" and verify the save completes and a toast appears. | The save completes and a confirmation toast is displayed. |
| 5 | Navigate away then back and click the "Auto Add-On" tab. | The Auto Add-On panel loads fresh with the updated saved values. |
| 6 | Observe "Express Content Design Session" and verify it is checked. | The Express Content Design Session checkbox is checked. |
| 7 | Observe "Encore Music" and verify it is unchecked. | Multiple checkbox changes in a single save all persist correctly after reload |

**Expected**: Multiple checkbox changes in a single save all persist correctly after reload.

**Cleanup**: Re-check "Encore Music" and uncheck "Express Content Design Session", click "Save", click "Ok" to restore both to defaults.

---

## TC-LOC-AAO-012: Sub-Tab Switch with Unsaved Changes — No Dialog

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Depends_On**: TC-LOC-AAO-001
**Preconditions**: **Auto Add-On** tab active. A checkbox toggle has been made (Save enabled).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Express Content Design Session" to check it and verify Save enables. | The Express Content Design Session checkbox becomes checked and the Save button becomes enabled. |
| 2 | Click the "Local Information" sub-tab and verify it switches with no dialog appearing. | The Local Information sub-tab becomes active and no dialog is displayed. |
| 3 | Click the "Auto Add-On" sub-tab and verify it returns to Auto Add-On with "Express Content Design Session" still checked. | Switching sub-tabs with unsaved changes does NOT trigger the Unsaved Changes dialog. Pending form state is preserved through sub-tab switches. The dialog fires only on full page navigation away, not on a sub-tab switch |

**Expected**: Switching sub-tabs with unsaved changes does NOT trigger the Unsaved Changes dialog. Pending form state is preserved through sub-tab switches. The dialog fires only on full page navigation away, not on a sub-tab switch.

**Data**: `tabLocalInfo = [data-testid="location-settings-sub-tab-local-information"]`

**Cleanup**: Uncheck "Express Content Design Session" or click "Save", then "Ok".

---

## TC-LOC-AAO-013: Unsaved Changes Dialog Appears on Page Navigation Away

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-AAO-001
**Preconditions**: **Auto Add-On** tab active. A checkbox toggle has been made WITHOUT saving (Save enabled).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Express Content Design Session" to check it and verify Save enables — do NOT click Save. | The Express Content Design Session checkbox becomes checked and the Save button becomes enabled. |
| 2 | Click the "Home" link in the sidebar and verify the "Unsaved changes" dialog appears. | The Unsaved Changes dialog is displayed. |
| 3 | Observe the dialog heading and verify it reads "Unsaved changes" (lowercase 'c'). | The dialog heading reads "Unsaved changes" with a lowercase c. |
| 4 | Observe the dialog body and verify it reads "Are you sure you want to leave this view? Any unsaved changes will be lost." | The dialog body displays the exact confirmation message warning that unsaved changes are lost if the user leaves. |
| 5 | Observe the dialog buttons and verify "Stay" and "Discard" are both present. | Unsaved Changes dialog appears when navigating away from the page with pending changes. Exact text must match |

**Expected**: Unsaved Changes dialog appears when navigating away from the page with pending changes. Exact text must match.

**Data**: `dlgUnsavedChanges = [an alert dialog]:has(h2:text-is("Unsaved changes"))` | Note: heading is "Unsaved changes" NOT "Unsaved Changes"

---

## TC-LOC-AAO-014: Unsaved Changes — Stay Button Keeps User on Page

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-AAO-001
**Preconditions**: Unsaved Changes dialog is open (Auto Add-On has a pending Express Content Design Session toggle, Home link was clicked).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Express Content Design Session" to check it, then click the "Home" link — verify the "Unsaved changes" dialog appears. | The Express Content Design Session checkbox becomes checked and the Unsaved Changes dialog is displayed. |
| 2 | Click "Stay" and verify the dialog closes, the URL remains on the settings page, and the "Auto Add-On" tab is still active. | The dialog closes, the URL remains on the Location Settings page, and the Auto Add-On tab stays active. |
| 3 | Observe "Express Content Design Session" and verify it still shows checked. | The Express Content Design Session checkbox still shows checked. |
| 4 | Observe the "Save" button and verify it is still enabled. | Stay closes dialog. User remains on Location Settings page. All pending changes are intact |

**Expected**: Stay closes dialog. User remains on Location Settings page. All pending changes are intact.

**Data**: `btnUnsavedChangesStay = [an alert dialog]:has(h2:text-is("Unsaved changes")) button:has-text("Stay")`

**Cleanup**: Uncheck "Express Content Design Session" or click "Save", then "Ok".

---

## TC-LOC-AAO-015: Unsaved Changes — Discard Button Navigates Away

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Depends_On**: TC-LOC-AAO-001
**Preconditions**: Unsaved Changes dialog is open (pending Express Content Design Session toggle, Home link clicked).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Click "Express Content Design Session" to check it, then click the "Home" link — verify the dialog opens. | The Express Content Design Session checkbox becomes checked and the Unsaved Changes dialog opens. |
| 2 | Click "Discard" and verify the dialog closes and the page navigates to Home. | The dialog closes and the page navigates to Home. |
| 3 | Navigate back to the "Auto Add-On" tab for a fresh load. | The Auto Add-On panel loads fresh with the original saved values. |
| 4 | Observe "Express Content Design Session" and verify it is unchecked (change was discarded). | Discard navigates to Home page. Unsaved toggle is discarded. DB retains original saved value |

**Expected**: Discard navigates to Home page. Unsaved toggle is discarded. DB retains original saved value.

**Data**: `btnUnsavedChangesDiscard = [an alert dialog]:has(h2:text-is("Unsaved changes")) button:has-text("Discard")`

---

## TC-LOC-AAO-016: Item List Is Country-Scoped (Same Across Locations)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Low | Manual | Functional | No |

**Depends_On**: TC-LOC-AAO-001
**Preconditions**: Office 1604 (United States).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to the "Auto Add-On" tab for location 1604 and count checkbox items — verify 5 items: Encore Music, Wireless Presenter, Express Content Design Session, Wordly, Labor. | The Auto Add-On panel displays 5 checkbox items: Encore Music, Wireless Presenter, Express Content Design Session, Wordly, and Labor. |
| 2 | Navigate to a different location in the same country and count items — verify the same 5 items appear (the list does not change per location). | The Auto Add-On checkbox list does NOT change per location - it is the same set for every location within a country (5 items for United States locations including 1604). A different country could present a different set, but that variation is not reachable from a single United States office |

**Expected**: The Auto Add-On checkbox list does NOT change per location — it is the same set for every location within a country (5 items for United States locations including 1604). A different country could present a different set, but that variation is not reachable from a single United States office.
**Notes**: Country-scoped item list — the set is constant within a country. Cross-country variation is out of scope for a United States office.

---

## TC-LOC-AAO-017: Wordly Uncheck Persists After Save+Reload

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional (RT) | Yes |

**Depends_On**: TC-LOC-AAO-001
**Preconditions**: **Auto Add-On** tab active. **Wordly** is checked (default for 1604).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate fresh to location 1604, click the "Auto Add-On" tab, and verify "Wordly" is checked. | The Wordly checkbox is checked. |
| 2 | Uncheck "Wordly" and verify Save enables. | The Wordly checkbox becomes unchecked and the Save button becomes enabled. |
| 3 | Click "Save", then "Ok" and verify the toast appears and save completes. | The save completes and a confirmation toast is displayed. |
| 4 | Navigate fresh to the location settings page and click the "Auto Add-On" tab. | The Auto Add-On panel loads fresh with the updated saved values. |
| 5 | Observe "Wordly" and verify it is unchecked. | Unchecking Wordly and saving persists the unchecked state through a full page reload |

**Expected**: Unchecking Wordly and saving persists the unchecked state through a full page reload.

**Data**: `chkAutoAddonWordly = [data-testid="location-settings-checkbox-auto-add-on-false_wordly"]`

**Cleanup**: Re-check "Wordly", click "Save", click "Ok" to restore default.

---

## TC-LOC-AAO-018: Labor Uncheck Persists After Save+Reload

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional (RT) | Yes |

**Depends_On**: TC-LOC-AAO-001
**Preconditions**: **Auto Add-On** tab active. **Labor** is checked (checked by default for office 1604).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate fresh to location 1604, click the "Auto Add-On" tab, and verify "Labor" is checked. | The Labor checkbox is checked. |
| 2 | Uncheck "Labor" and verify Save enables. | The Labor checkbox becomes unchecked and the Save button becomes enabled. |
| 3 | Click "Save", then "Ok" and verify the toast appears and save completes. | The save completes and a confirmation toast is displayed. |
| 4 | Navigate fresh to the location settings page and click the "Auto Add-On" tab. | The Auto Add-On panel loads fresh with the updated saved values. |
| 5 | Observe "Labor" and verify it is unchecked. | Unchecking Labor and saving persists the unchecked state through a full page reload |

**Expected**: Unchecking Labor and saving persists the unchecked state through a full page reload.

**Data**: `chkAutoAddonLabor = [data-testid="location-settings-checkbox-auto-add-on-true_labor"]`

**Cleanup**: Re-check "Labor", click "Save", click "Ok" to restore default.

---

## TC-LOC-AAO-019: Cancel Does Not Persist Toggle

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional (Negative) | Yes |

**Depends_On**: TC-LOC-AAO-001
**Preconditions**: **Auto Add-On** tab active. **Express Content Design Session** is unchecked (default).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate fresh to location 1604 and click the "Auto Add-On" tab. | The Auto Add-On panel is displayed with the default checkbox values loaded. |
| 2 | Click "Express Content Design Session" to check it and verify Save enables. | The Express Content Design Session checkbox becomes checked and the Save button becomes enabled. |
| 3 | Click "Save" and verify the dialog appears. | The Save Changes dialog is displayed. |
| 4 | Click "Cancel" and verify the dialog closes with the pending change preserved. | The dialog closes and the Express Content Design Session checkbox remains checked. |
| 5 | Navigate fresh to the location settings page and click the "Auto Add-On" tab. | The Auto Add-On panel loads fresh with the original saved values. |
| 6 | Observe "Express Content Design Session" and verify it is unchecked — cancel did not save. | Clicking Cancel in Save dialog does not persist the change. After reload, Express Content Design Session returns to its original unchecked state |

**Expected**: Clicking Cancel in Save dialog does not persist the change. After reload, Express Content Design Session returns to its original unchecked state.

**Data**: `chkAutoAddonExpressContentDesignSession`, `btnSaveChangesCancel`

---

## TC-LOC-AAO-020: Bulk Invert All Checkboxes Persists After Save+Reload

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional (RT, Bulk) | Yes |

**Depends_On**: TC-LOC-AAO-001
**Preconditions**: **Auto Add-On** tab active. All 5 checkboxes at default state (Encore Music=checked, Wireless Presenter=checked, Express Content Design Session=unchecked, Wordly=checked, Labor=checked).

**Steps**:
| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate fresh to location 1604 and click the "Auto Add-On" tab. | The Auto Add-On panel is displayed with the default checkbox values loaded. |
| 2 | Uncheck "Encore Music", "Wireless Presenter", "Wordly", and "Labor", then check "Express Content Design Session" and verify Save becomes enabled. | All 5 checkboxes reflect the new inverted values and the Save button becomes enabled. |
| 3 | Click "Save", then "Ok" and verify the toast appears and save completes. | The save completes and a confirmation toast is displayed. |
| 4 | Navigate fresh and click the "Auto Add-On" tab. | The Auto Add-On panel loads fresh with the updated saved values. |
| 5 | Verify all 5 are inverted: Encore Music unchecked, Wireless Presenter unchecked, Express Content Design Session checked, Wordly unchecked, Labor unchecked. | All 5 checkbox inversions persist after save+reload. Covers 100% field-instance persistence |

**Expected**: All 5 checkbox inversions persist after save+reload. Covers 100% field-instance persistence.

**Data**: All 5 checkbox selectors from `AUTO_ADDON_DEFAULTS`

**Cleanup**: Restore all 5 to defaults, click "Save", click "Ok".
