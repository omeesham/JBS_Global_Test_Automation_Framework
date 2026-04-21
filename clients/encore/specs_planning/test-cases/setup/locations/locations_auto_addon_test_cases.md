# Auto Add-On Test Cases — **Module**: locations | **Total**: 21 | **Status**: Manual
**Updated**: 2026-03-24 | **Page URL**: `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location` (Setup > Location > Auto Add-On tab)

## MCP_VERIFICATION_LOG

| Field | Value |
|-------|-------|
| Date | 2026-03-24 |
| URL | https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location |
| Office/Entity | 1604 Parker Palm Springs |
| Total fields found | 5 checkboxes |
| Total fields tested (edit+save) | 5 — all toggled, saved, reloaded, verified |
| Save dialog | Yes — `alertdialog` heading "Save Changes" \| body "Are you sure you want to save the changes?" \| buttons "Cancel" + "Ok" |
| Unsaved Changes dialog | Yes — `alertdialog` heading "Unsaved changes" \| body "Are you sure you want to leave this view? Any unsaved changes will be lost." \| buttons "Stay" + "Discard" |
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
| Sequential interactions | Sub-tab switch with unsaved Auto Add-On changes → pending state preserved in UI, NO Unsaved Changes dialog triggered |
| Boundary behaviors | Checkbox toggles only — no text input, no numeric fields, no XSS/SQL surface |
| Smart form diff | Reverting toggle to saved state RE-DISABLES Save button (smart diff, not just dirty flag) |
| Items vary per location | Item count and labels are location-specific — 5 items confirmed for location 1604 on 2026-03-24 |
| Selector verification | 10/10 selectors PASS — verified via `browser_evaluate(() => !!document.querySelector(...))` on 2026-03-24 |

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

**Preconditions**: User is on Location Settings page for location 1604. Any sub-tab may be active.

**Steps**:
1. Click **Auto Add-On** tab → Expected: tab becomes selected, tabpanel `[data-testid="location-settings-sub-tab-content-auto-add-on"]` is visible, form `[data-testid="location-settings-form-auto-add-on"]` is present, checkbox list renders

**Expected**: Auto Add-On tabpanel displays with all checkbox items visible. No errors. URL remains `/settings/location`.

**Data**: `tabAutoAddon = [data-testid="location-settings-sub-tab-auto-add-on"]`

---

## TC-LOC-AAO-002: Default State of Checkbox Items (location 1604)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Preconditions**: Fresh page load of location 1604 settings (navigate via `about:blank` then target URL). **Auto Add-On** tab clicked.

**Steps**:
1. Navigate fresh to location 1604 settings → click **Auto Add-On** tab → Expected: 5 checkbox items visible
2. Observe **Encore Music** → Expected: checked (`aria-checked="true"`)
3. Observe **Wireless Presenter** → Expected: checked
4. Observe **Express Content Design Session** → Expected: unchecked (`aria-checked="false"`)
5. Observe **Wordly** → Expected: checked
6. Observe **Labor** → Expected: checked
7. Observe **Save** button → Expected: disabled

**Expected**: 5 items in order: Encore Music (✓), Wireless Presenter (✓), Express Content Design Session (✗), Wordly (✓), Labor (✓). Save disabled.

**Data**: Default state MCP-verified 2026-03-24 from fresh page load per PLN-023.

---

## TC-LOC-AAO-003: Toggle Checked Item to Unchecked — Save Enables

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Preconditions**: **Auto Add-On** tab active. **Encore Music** is checked (default). **Save** is disabled.

**Steps**:
1. Click **Encore Music** checkbox → Expected: becomes unchecked (`aria-checked="false"`)
2. Observe **Save** button → Expected: enabled (no `disabled` attribute)

**Expected**: Unchecking a checked item immediately enables Save.

**Data**: `chkAutoAddonEncoreMusic = [data-testid="location-settings-checkbox-auto-add-on-false_encore music"]`

**Cleanup**: Re-check **Encore Music** → **Save** → **Ok** to restore default.

---

## TC-LOC-AAO-004: Toggle Unchecked Item to Checked — Save Enables

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Preconditions**: **Auto Add-On** tab active. **Express Content Design Session** is unchecked (default). **Save** is disabled.

**Steps**:
1. Click **Express Content Design Session** checkbox → Expected: becomes checked (`aria-checked="true"`)
2. Observe **Save** button → Expected: enabled

**Expected**: Checking an unchecked item immediately enables Save.

**Data**: `chkAutoAddonExpressContentDesignSession = [data-testid="location-settings-checkbox-auto-add-on-false_express content design session"]`

**Cleanup**: Uncheck **Express Content Design Session** → **Save** → **Ok**.

---

## TC-LOC-AAO-005: Revert Toggle Re-Disables Save (Smart Form Diff)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Preconditions**: **Auto Add-On** tab active. **Express Content Design Session** is unchecked (default). **Save** is disabled.

**Steps**:
1. Click **Express Content Design Session** (unchecked → checked) → Expected: Save enables
2. Click **Express Content Design Session** again (checked → unchecked, back to original) → Expected: Save becomes disabled again

**Expected**: Reverting a toggle to its original saved value re-disables Save. The form uses smart diff — it compares to server state, not just tracks events.

**Data**: `btnSave = [data-testid="location-settings-btn-save"]`

---

## TC-LOC-AAO-006: Save Dialog Appears on Save Click

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Preconditions**: **Auto Add-On** tab active. A checkbox has been toggled (Save enabled).

**Steps**:
1. Toggle **Express Content Design Session** (unchecked → checked) → Save enables
2. Click **Save** button → Expected: `alertdialog` appears
3. Observe dialog heading → Expected: "Save Changes"
4. Observe dialog body → Expected: "Are you sure you want to save the changes?"
5. Observe dialog buttons → Expected: "Cancel" (left) and "Ok" (right) present

**Expected**: Save Changes alertdialog appears with exact text and buttons as MCP-verified on 2026-03-24.

**Data**: `dlgSaveChanges = [role="alertdialog"]:has(h2:text-is("Save Changes"))` | Note: dialog has NO `data-testid`

**Cleanup**: Click **Cancel** → revert ECDS.

---

## TC-LOC-AAO-007: Save Dialog Cancel — Dismisses Without Saving

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Preconditions**: Save Changes dialog is open (ECDS toggled, Save clicked).

**Steps**:
1. Toggle **Express Content Design Session** → click **Save** → dialog opens
2. Click **Cancel** → Expected: dialog dismisses
3. Observe **Express Content Design Session** → Expected: still shows toggled state (checked)
4. Observe **Save** button → Expected: still enabled

**Expected**: Cancel closes dialog without saving. Pending change is preserved. Save remains enabled.

**Data**: `btnSaveChangesCancel = [role="alertdialog"]:has(h2:text-is("Save Changes")) button:has-text("Cancel")`

**Cleanup**: Click **Save** → **Ok**, or click ECDS again to revert (Save re-disables).

---

## TC-LOC-AAO-008: Save Dialog Ok — Saves Successfully with Toast

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Preconditions**: **Auto Add-On** tab active. **Express Content Design Session** is unchecked (default).

**Steps**:
1. Click **Express Content Design Session** (unchecked → checked)
2. Click **Save** → dialog appears
3. Click **Ok** → Expected: dialog closes, toast notification appears with text "Local information updated", Save button becomes disabled

**Expected**: Save succeeds. Toast "Local information updated" is shown. Save re-disables after successful save.

**Data**: `btnSaveChangesOk = [role="alertdialog"]:has(h2:text-is("Save Changes")) button:has-text("Ok")`

**Cleanup**: Uncheck ECDS → **Save** → **Ok** to restore default.

---

## TC-LOC-AAO-009: Toggle Persists After Page Reload

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Preconditions**: **Auto Add-On** tab. **Express Content Design Session** is unchecked (default saved state).

**Steps**:
1. Click **Express Content Design Session** (unchecked → checked)
2. Click **Save** → click **Ok** → Expected: toast "Local information updated"
3. Navigate away (e.g., `about:blank`) then back to `locations/1604/settings/location`
4. Click **Auto Add-On** tab → Expected: fresh load
5. Observe **Express Content Design Session** → Expected: checked (`aria-checked="true"`)

**Expected**: Toggled value persists after full page reload — server state was updated.

**Data**: Check `aria-checked="true"` on `[data-testid="location-settings-checkbox-auto-add-on-false_express content design session"]` after reload.

**Cleanup**: Uncheck ECDS → **Save** → **Ok**.

---

## TC-LOC-AAO-010: Save Button Disabled on Fresh Load (No Changes)

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Preconditions**: None.

**Steps**:
1. Navigate fresh to location 1604 settings → click **Auto Add-On** tab
2. Do NOT interact with any checkbox
3. Observe **Save** button → Expected: disabled (`disabled` attribute present, button not clickable)

**Expected**: Save button is disabled on fresh load with no pending changes.

**Data**: `btnSave = [data-testid="location-settings-btn-save"]`

---

## TC-LOC-AAO-011: Multiple Toggles Saved Together

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Preconditions**: **Auto Add-On** tab active. Default: ECDS=unchecked, Encore Music=checked.

**Steps**:
1. Click **Express Content Design Session** (unchecked → checked)
2. Click **Encore Music** (checked → unchecked)
3. Observe **Save** → Expected: enabled
4. Click **Save** → click **Ok** → Expected: save confirmed, toast shown
5. Navigate away then back → click **Auto Add-On** tab
6. Observe **Express Content Design Session** → Expected: checked
7. Observe **Encore Music** → Expected: unchecked

**Expected**: Multiple checkbox changes in a single save all persist correctly after reload.

**Cleanup**: Re-check Encore Music + Uncheck ECDS → **Save** → **Ok** to restore both to defaults.

---

## TC-LOC-AAO-012: Sub-Tab Switch with Unsaved Changes — No Dialog

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional | Yes |

**Preconditions**: **Auto Add-On** tab active. A checkbox toggle has been made (Save enabled).

**Steps**:
1. Toggle **Express Content Design Session** (Save enables)
2. Click **Local Information** sub-tab → Expected: switches to Local Information, NO dialog appears
3. Click **Auto Add-On** sub-tab → Expected: returns to Auto Add-On, pending change still reflects in checkbox state (ECDS checked)

**Expected**: Switching sub-tabs with unsaved changes does NOT trigger the Unsaved Changes dialog. Pending form state is preserved through sub-tab switches.

**Data**: `tabLocalInfo = [data-testid="location-settings-sub-tab-local-information"]`

**Cleanup**: Revert ECDS or Save → Ok.

---

## TC-LOC-AAO-013: Unsaved Changes Dialog Appears on Page Navigation Away

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Preconditions**: **Auto Add-On** tab active. A checkbox toggle has been made WITHOUT saving (Save enabled).

**Steps**:
1. Toggle **Express Content Design Session** (Save enables) — do NOT click Save
2. Click **Home** link in sidebar → Expected: `alertdialog` with heading "Unsaved changes" appears
3. Observe dialog heading → Expected: "Unsaved changes" (note: lowercase 'c')
4. Observe dialog body → Expected: "Are you sure you want to leave this view? Any unsaved changes will be lost."
5. Observe dialog buttons → Expected: "Stay" and "Discard"

**Expected**: Unsaved Changes alertdialog appears when navigating away from the page with pending changes. Exact text must match.

**Data**: `dlgUnsavedChanges = [role="alertdialog"]:has(h2:text-is("Unsaved changes"))` | Note: heading is "Unsaved changes" NOT "Unsaved Changes"

---

## TC-LOC-AAO-014: Unsaved Changes — Stay Button Keeps User on Page

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Preconditions**: Unsaved Changes dialog is open (Auto Add-On has pending ECDS toggle, Home link was clicked).

**Steps**:
1. Toggle ECDS → click **Home** → Unsaved Changes dialog appears
2. Click **Stay** → Expected: dialog closes, URL remains `/settings/location`, Auto Add-On tab still active
3. Observe **Express Content Design Session** → Expected: still shows checked (pending state preserved)
4. Observe **Save** button → Expected: still enabled

**Expected**: Stay closes dialog. User remains on Location Settings page. All pending changes are intact.

**Data**: `btnUnsavedChangesStay = [role="alertdialog"]:has(h2:text-is("Unsaved changes")) button:has-text("Stay")`

**Cleanup**: Revert ECDS or **Save** → **Ok**.

---

## TC-LOC-AAO-015: Unsaved Changes — Discard Button Navigates Away

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional | Yes |

**Preconditions**: Unsaved Changes dialog is open (pending ECDS toggle, Home link clicked).

**Steps**:
1. Toggle ECDS → click **Home** → dialog opens
2. Click **Discard** → Expected: dialog closes, page navigates to Home (`/locations/1604/home`)
3. Navigate back to **Auto Add-On** tab (fresh load)
4. Observe **Express Content Design Session** → Expected: unchecked (original saved state — change was discarded)

**Expected**: Discard navigates to Home page. Unsaved toggle is discarded. DB retains original saved value.

**Data**: `btnUnsavedChangesDiscard = [role="alertdialog"]:has(h2:text-is("Unsaved changes")) button:has-text("Discard")`

---

## TC-LOC-AAO-016: Item Count Is Location-Specific

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Low | Manual | Functional | No |

**Preconditions**: Access to at least two different location settings pages with different add-on configurations.

**Steps**:
1. Navigate to **Auto Add-On** tab for location 1604 → count checkbox items → Expected: 5 items
2. Navigate to **Auto Add-On** tab for a different location → count items → Expected: count may differ from 1604

**Expected**: The Auto Add-On checkbox list is location-specific. Location 1604 has 5 items as of 2026-03-24. Other locations may have different counts and labels.

**Status**: Blocked (Cat-A: requires access to a second location with different add-on configuration from 1604 — environment constraint)

---

## TC-LOC-AAO-017: Wordly Uncheck Persists After Save+Reload

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional (RT) | Yes |

**Preconditions**: **Auto Add-On** tab active. **Wordly** is checked (default for 1604).

**Steps**:
1. Navigate fresh to location 1604 → click **Auto Add-On** tab → Verify **Wordly** is checked
2. Uncheck **Wordly** → Expected: Save enables
3. Click **Save** → **Ok** → Expected: toast shown, save completes
4. Navigate fresh (about:blank → target URL) → click **Auto Add-On** tab
5. Observe **Wordly** → Expected: unchecked (`aria-checked="false"`) — persisted

**Expected**: Unchecking Wordly and saving persists the unchecked state through a full page reload.

**Data**: `chkAutoAddonWordly = [data-testid="location-settings-checkbox-auto-add-on-false_wordly"]`

**Cleanup**: Re-check **Wordly** → **Save** → **Ok** to restore default.

---

## TC-LOC-AAO-018: Labor Uncheck Persists After Save+Reload

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional (RT) | Yes |

**Preconditions**: **Auto Add-On** tab active. **Labor** is checked (default for 1604, isDefault=true testid pattern).

**Steps**:
1. Navigate fresh to location 1604 → click **Auto Add-On** tab → Verify **Labor** is checked
2. Uncheck **Labor** → Expected: Save enables
3. Click **Save** → **Ok** → Expected: toast shown, save completes
4. Navigate fresh (about:blank → target URL) → click **Auto Add-On** tab
5. Observe **Labor** → Expected: unchecked (`aria-checked="false"`) — persisted

**Expected**: Unchecking Labor (isDefault=true testid variant) and saving persists the unchecked state through a full page reload.

**Data**: `chkAutoAddonLabor = [data-testid="location-settings-checkbox-auto-add-on-true_labor"]`

**Cleanup**: Re-check **Labor** → **Save** → **Ok** to restore default.

---

## TC-LOC-AAO-019: Cancel Does Not Persist Toggle

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Functional (Negative) | Yes |

**Preconditions**: **Auto Add-On** tab active. **Express Content Design Session** is unchecked (default).

**Steps**:
1. Navigate fresh to location 1604 → click **Auto Add-On** tab
2. Click **Express Content Design Session** (unchecked → checked) → Expected: Save enables
3. Click **Save** → dialog appears
4. Click **Cancel** → Expected: dialog closes, pending change preserved
5. Navigate fresh (about:blank → target URL) → click **Auto Add-On** tab
6. Observe **Express Content Design Session** → Expected: unchecked (`aria-checked="false"`) — cancel did NOT save

**Expected**: Clicking Cancel in Save dialog does not persist the change. After reload, ECDS returns to its original unchecked state.

**Data**: `chkAutoAddonExpressContentDesignSession`, `btnSaveChangesCancel`

---

## TC-LOC-AAO-020: Bulk Invert All Checkboxes Persists After Save+Reload

| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| Medium | Manual | Functional (RT, Bulk) | Yes |

**Preconditions**: **Auto Add-On** tab active. All 5 checkboxes at default state (Encore Music=✓, Wireless Presenter=✓, ECDS=✗, Wordly=✓, Labor=✓).

**Steps**:
1. Navigate fresh to location 1604 → click **Auto Add-On** tab
2. Invert all 5 checkboxes: uncheck Encore Music, Wireless Presenter, Wordly, Labor; check ECDS → Expected: Save enables
3. Click **Save** → **Ok** → Expected: toast shown, save completes
4. Navigate fresh → click **Auto Add-On** tab
5. Verify all 5 inverted: Encore Music=✗, Wireless Presenter=✗, ECDS=✓, Wordly=✗, Labor=✗

**Expected**: All 5 checkbox inversions persist after save+reload. Covers 100% field-instance persistence.

**Data**: All 5 checkbox selectors from `AUTO_ADDON_DEFAULTS`

**Cleanup**: Restore all 5 to defaults → **Save** → **Ok**.
