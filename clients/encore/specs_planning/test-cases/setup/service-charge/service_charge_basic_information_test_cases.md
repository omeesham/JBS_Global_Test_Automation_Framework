# Service Charge — Basic Information Test Cases

**Module**: service-charge
**Submodule**: BAS
**Page**: Location Settings → Service Charge (`/settings/service-charge`) — Basic Information tab
**Test Entity**: Office 1604
**Updated**: 2026-08-10
**Total TCs**: 30
**Coverage mode**: QUICK (L1)

**Governing Requirement**: NM-3344
**Verified against**: field inventory `service-charge-basic-information-2026-08-10.md` (environment degraded at walk time — all inputs were disabled; cases marked NEEDS-LIVE-CONFIRM require a live-enabled environment before spec build)

---

## FIELD INVENTORY

| Field | data-testid | Control Type | Default Value |
|---|---|---|---|
| Service Type (label column) | none — read-only label | Static text | Row-specific service type name |
| Service Charge Percentage (rows 0–78) | `service-charge-percentage-0` … `service-charge-percentage-78` | Decimal text input (`inputmode="decimal"`) | Row-specific; e.g. `0.00 %` for row 0, `24.00 %` for row 8 |
| Save | `service-charge-save` | Button | Disabled at rest |

The representative field used for boundary and negative cases is `service-charge-percentage-8` (Audio Conferencing, default `24.00 %`). Cases that need a zero-start use `service-charge-percentage-0` (APP Downloaded, default `0.00 %`).

---

## Validation Rules

| Rule | Behaviour |
|---|---|
| Decimal input accepts `inputmode="decimal"` values | `aria-invalid` channel present (`aria-invalid="false"` at rest) |
| No declarative min, max, step, maxlength, or pattern | Application-logic enforced; exact rejection thresholds NEEDS-LIVE-CONFIRM |
| Save is disabled at rest | Enables after any edit; NEEDS-LIVE-CONFIRM: whether saving requires valid values only |
| Net-zero edit does not dirty the form | Reverting a field to its original value must return Save to disabled (LR-009) |
| Percent suffix rendered as `number space %` | Whether user types only the number or must include ` %` is NEEDS-LIVE-CONFIRM |

---

## MCP_VERIFICATION_LOG

| # | Verified | Result |
|---|---|---|
| 1 | Page loads on office 1604 | Attempted 2026-08-10; environment degraded — `Local Office : -` header; all inputs observed `disabled` |
| 2 | Column headers on Basic Information tab | `Service Type` \| `Service Charge Percentage` |
| 3 | Row count | 79 rows (indices 0–78) |
| 4 | Representative field testid | `service-charge-percentage-8` resolves; `outerHTML` captured in walk evidence |
| 5 | Save button testid | `service-charge-save` observed with `disabled` attribute |
| 6 | Default value row 8 | `24.00 %` (Audio Conferencing) |
| 7 | Default value row 0 | `0.00 %` (APP Downloaded) |
| 8 | Input affordance | Inline always-visible input (no click-to-reveal); `aria-invalid="false"` at rest |
| 9 | History tab | Present; not successfully walked (environment degraded) |

---

## TC-SVC-BAS-001: Editing a percentage field to a valid mid-range value is accepted

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604 and the page is in its default state.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Service Charge page on the Basic Information tab | The tab loads and 79 rows are visible |
| 2 | Click the percentage input for Audio Conferencing (`service-charge-percentage-8`, default `24.00 %`) and clear the value | The field is empty and focus is in the field |
| 3 | Type `50.00` into the field and move focus away | The field retains `50.00` and Save becomes enabled |
| 4 | Restore: clear the field, type `24.00`, and save | The field reverts to `24.00 %` and Save becomes disabled after reload |

**Notes**: Positive mid-range case. Confirms the field accepts a valid decimal value and that Save enables on any edit.

---

## TC-SVC-BAS-002: Editing a percentage field to 0.00 is accepted and enables Save

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604 with the Audio Conferencing row showing `24.00 %`.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Service Charge page on the Basic Information tab | The tab loads and 79 rows are visible |
| 2 | Click the percentage input for Audio Conferencing and clear the value | The field is empty |
| 3 | Type `0.00` and move focus away | The field retains `0.00` and Save becomes enabled |
| 4 | Restore: clear the field, type `24.00`, and save | The field is restored to `24.00 %` |

**Notes**: Minimum boundary positive case. `0.00` is a valid entry (row 0 defaults to `0.00 %`).

---

## TC-SVC-BAS-003: Editing a percentage field to 100.00

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Service Charge page on the Basic Information tab | The tab loads |
| 2 | Click the percentage input for Audio Conferencing and clear the value | The field is empty |
| 3 | Type `100.00` and move focus away | The field accepts the value: input.value shows "100.00 %", `aria-invalid` is absent, and Save becomes enabled |
| 4 | Restore: return the field to its original value and save | The field is restored |

**Notes**: Maximum boundary case. Observed live: 100.00 is accepted without restriction — no cap enforced at 100.

---

## TC-SVC-BAS-004: Saved percentage value persists after page reload

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604 and the Audio Conferencing percentage (`service-charge-percentage-8`) has its default value `24.00 %`.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Service Charge page on the Basic Information tab | The tab loads |
| 2 | Click the percentage input for Audio Conferencing, clear it, and type `30.00` | The field shows `30.00` and Save is enabled |
| 3 | Click Save | Save completes without error |
| 4 | Reload the page and re-open the Basic Information tab | The Audio Conferencing percentage reads `30.00 %` |
| 5 | Restore: click the field, clear it, type `24.00`, click Save, and reload | The field is restored to `24.00 %` |

**Notes**: Persistence verification via reload and DOM read. Confirms the value was actually persisted server-side, not just held in local state.

---

## TC-SVC-BAS-005: Entering a value just below zero (negative boundary)

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | The tab loads |
| 2 | Click the percentage input for Audio Conferencing and clear the value | The field is empty |
| 3 | Type `-0.01` while the field remains focused | The value remains in the field and the field is marked invalid while focused with `aria-invalid="true"` |
| 4 | Press Tab to move focus away and observe the Save button | After focus leaves, the app may restore the stored value and clear the invalid marking; Save remains disabled |

**Notes**: BVA min-1 case. Observed live: the rejection marking is reliable while focused, may clear after blur, and Save remains disabled after blur.

---

## TC-SVC-BAS-006: Entering a value just above 100

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | The tab loads |
| 2 | Click the percentage input for Audio Conferencing and clear the value | The field is empty |
| 3 | Type `100.01` while the field remains focused | The value remains in the field and the field is marked invalid while focused with `aria-invalid="true"` |
| 4 | Press Tab to move focus away and observe the Save button | After focus leaves, the app may restore the stored value and clear the invalid marking; Save remains disabled |

**Notes**: BVA max+1 case. Observed live: the rejection marking is reliable while focused, may clear after blur, and Save remains disabled after blur.

---

## TC-SVC-BAS-007: Entering a value with three decimal places

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | The tab loads |
| 2 | Click the percentage input for Audio Conferencing and clear the value | The field is empty |
| 3 | Type `24.005` and move focus away | The value is silently rounded to "24.00 %" — the third decimal is discarded; `aria-invalid` is absent |

**Notes**: Decimal-step boundary case. Observed live: the application rounds silently to two decimal places without any rejection signal.

---

## TC-SVC-BAS-008: Reverting an edited field to its original value keeps Save disabled

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604 with the zero-default field APP Downloaded (`service-charge-percentage-0`) at `0.00 %`.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | The tab loads and Save is disabled |
| 2 | Click the APP Downloaded percentage input and clear the value | Save may enable or remain disabled during the clear |
| 3 | Type `0.00` and move focus away | Save returns to disabled — reverting to the original value must not enable Save |

**Notes**: LR-009 revert-to-original probe. Revert-to-original must disable Save for numeric percentage inputs.

---

## TC-SVC-BAS-009: Entering alphabetic text into a percentage field is flagged while focused

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | The tab loads |
| 2 | Click the row-0 percentage field for App Quality Assurance and type `abc` | The letters are accepted into the field |
| 3 | While the field is still focused, observe its invalid state | The field is flagged invalid while focused: `aria-invalid="true"`, red border, and error icon are shown |
| 4 | Press Tab to move focus away and observe the Save button | After focus moves away, the app may restore the stored value and clear the invalid flag; Save remains disabled throughout |

**Notes**: Negative case. Observed live: alpha input is accepted at entry, invalid while focused, and may be restored after blur; Save remains disabled.

---

## TC-SVC-BAS-010: Entering a malformed decimal value is flagged while focused

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | The tab loads |
| 2 | Click the percentage input for Audio Conferencing and type `1.2.3` | The string appears verbatim in the field |
| 3 | While the field is still focused, observe its invalid state | The string remains verbatim in the field and the field is marked invalid while focused with `aria-invalid="true"` |
| 4 | Press Tab to move focus away and observe the Save button | After focus leaves, the app may restore the stored value and clear the invalid marking; Save remains disabled |

**Notes**: Negative case — malformed decimal. Observed live: `1.2.3` is kept verbatim and marked invalid while focused; after blur, Save remains disabled.

---

## TC-SVC-BAS-011: Entering a negative number into a percentage field

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | The tab loads |
| 2 | Click the percentage input for Audio Conferencing and type `-5` | The value remains in the field |
| 3 | While the field is still focused, observe its invalid state | The field is marked invalid while focused with `aria-invalid="true"` |
| 4 | Press Tab to move focus away and observe the Save button | After focus leaves, the app may restore the stored value and clear the invalid marking; Save remains disabled |

**Notes**: Negative case — sign constraint. Observed live: the rejection marking is reliable while focused, may clear after blur, and Save remains disabled after blur.

---

## TC-SVC-BAS-012: Entering a leading-zero number

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | The tab loads |
| 2 | Click the percentage input for APP Downloaded and type `024` | The characters appear in the field |
| 3 | Move focus away | The value is normalised to "24.00 %" — leading zero stripped, standard two-decimal format applied; `aria-invalid` is absent |

**Notes**: Leading-zero edge case. Observed live: "024" normalises to "24.00 %" without rejection.

---

## TC-SVC-BAS-013: Entering scientific notation

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to the Basic Information tab | The tab loads |
| 2 | Click the Audio Conferencing percentage input and type `2e1` | The characters appear |
| 3 | Move focus away | `aria-invalid` is absent — the validator accepts scientific notation as a valid numeric value; display format after normalisation is not specified |

**Notes**: Scientific notation case. Observed live: validator accepts "2e1" (aria-invalid absent). Display format was ambiguous in the probe and is not asserted.

---

## TC-SVC-BAS-014: Clearing a percentage field completely

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to the Basic Information tab | The tab loads |
| 2 | Click the Audio Conferencing percentage input and select all text | All text selected |
| 3 | Delete the selection (keyboard clear via fill) and move focus away | The application normalises the cleared field to "0.00 %" — the field does not remain empty; `aria-invalid` is absent |

**Notes**: Empty value case. Keyboard-path observation: clearing via fill causes the application to restore the default "0.00 %" format. aria-invalid absent.

---

## TC-SVC-BAS-015: Entering whitespace only into a percentage field

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to the Basic Information tab | The tab loads |
| 2 | Click the Audio Conferencing percentage input, clear it, and type spaces | Whitespace appears or is stripped |
| 3 | Move focus away | `aria-invalid` is absent — the validator does not flag whitespace-only input |

**Notes**: Whitespace-only case. Observed live: whitespace preserved in input.value; aria-invalid absent.

---

## TC-SVC-BAS-016: Pasting a very long numeric string into a percentage field

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to the Basic Information tab | The tab loads |
| 2 | Click the APP Downloaded percentage input, clear it, and paste a 50-digit numeric string (`12345678901234567890123456789012345678901234567890`) | The full 50-digit string stays in the field verbatim while focused |
| 3 | While the field is still focused, observe its invalid state | The field is marked invalid while focused with `aria-invalid="true"` |
| 4 | Press Tab to move focus away and observe the Save button | After focus leaves, the app may restore the stored value and clear the invalid marking; Save remains disabled |

**Notes**: Very long input case. Observed live: no truncation or scientific-notation conversion while focused; the field keeps the full string verbatim, marks it invalid while focused, and Save remains disabled after blur.

---

## TC-SVC-BAS-017: The percent suffix is rendered by the application, not typed by the user

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604 with inputs enabled.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to the Basic Information tab | The tab loads and inputs are enabled |
| 2 | Read the raw `input.value` of `service-charge-percentage-0` (APP Downloaded) without clicking it | input.value contains " %" — the application appends the percent suffix; user types the number only |

**Notes**: Format suffix observation. Observed live: input.value is "0.00 %" at rest — the percent sign is app-rendered, not user-typed.

---

## TC-SVC-BAS-018: Editing any percentage field enables the Save button

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604 and Save is disabled (no unsaved edits).

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | Save (`service-charge-save`) is disabled |
| 2 | Click the percentage input for Audio Conferencing, clear it, and type `50.00` | Save transitions from disabled to enabled |
| 3 | Reload the page without saving | Changes are discarded and Save is disabled again |

**Notes**: Save-cycle dirty-state case. Confirms the form enters a dirty state immediately on any edit.

---

## TC-SVC-BAS-019: Reverting an edited percentage field to its original value disables Save

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604 and Save is disabled.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | Save is disabled |
| 2 | Click the Audio Conferencing percentage input, clear it, and type `50.00` | Save becomes enabled |
| 3 | Clear the field again and type `24.00` (the original value) and move focus away | Save returns to disabled — reverting to the original value must not leave the form dirty |

**Notes**: LR-009 revert-to-original-disables-Save. The original value must be known (from inventory or a prior read); `24.00` is the documented default for row 8.

---

## TC-SVC-BAS-020: Saving an edited percentage field persists the new value after reload

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604 and the Audio Conferencing field shows `24.00 %`.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | The tab loads with Audio Conferencing showing `24.00 %` |
| 2 | Click the percentage input for Audio Conferencing, clear it, and type `30.00` | The field shows `30.00` and Save enables |
| 3 | Click Save | Save completes; no error dialog |
| 4 | Reload the page and re-open the Basic Information tab | Audio Conferencing shows `30.00 %` |
| 5 | Click the field, clear it, type `24.00`, and click Save | The field is restored to `24.00 %` and Save completes |

**Notes**: Save-cycle new-fill case with Tier 1 baseline restore. Step 5 restores the shared environment to the documented default so subsequent test runs start from the same baseline.

---

## TC-SVC-BAS-021: Overwriting an edited value before saving persists the second value

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604 and Audio Conferencing shows `24.00 %`.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | The tab loads |
| 2 | Click the Audio Conferencing percentage input and type `30.00` | Save enables |
| 3 | Without saving, clear the field again and type `40.00` | The field shows `40.00`; Save remains enabled |
| 4 | Click Save | Save completes |
| 5 | Reload the page | Audio Conferencing shows `40.00 %` — only the final pre-save value was persisted |
| 6 | Restore: click the field, clear it, type `24.00`, and click Save | The field is restored to `24.00 %` |

**Notes**: Edit-overwrite save-cycle case. Confirms that intermediate values are not persisted.

---

## TC-SVC-BAS-022: Navigating away from the page with unsaved edits triggers a confirmation prompt

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | The tab loads |
| 2 | Edit any percentage field so that Save enables | Save is enabled (form is dirty) |
| 3 | Press the browser Back button | The browser's native leave-page dialog appears (type: `beforeunload`). Browser-back triggers the browser's native dialog; in-app tab navigation shows the application's "Unsaved changes" modal (Stay / Discard). Both behaviours were confirmed on the live site. |
| 4 | Dismiss the dialog (stay on page) | Navigation is cancelled; the page remains open with the edit still present. Reload or discard the edit to restore clean state. |

**Notes**: Browser-back fires the browser's native `beforeunload` dialog. In-app tab navigation (e.g. clicking the History tab) shows the application's own "Unsaved changes" modal instead — that path is covered by TC-SVC-HIS-014.

---

## TC-SVC-BAS-023: Saving edits to multiple percentage fields in a single Save action

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | The tab loads |
| 2 | Edit the Audio Conferencing field to `30.00` | Save enables |
| 3 | Edit the Equipment Rental field (`service-charge-percentage-23`) to `25.00` | Save remains enabled |
| 4 | Click Save | Save completes without error |
| 5 | Reload the page and re-open the Basic Information tab | Both Audio Conferencing reads `30.00 %` and Equipment Rental reads `25.00 %` |
| 6 | Restore: return both fields to their original values (`24.00 %` each) and click Save | Both fields are restored |

**Notes**: Bulk save-cycle case. Confirms there is no partial-save behaviour when multiple fields are edited simultaneously.

---

## TC-SVC-BAS-024: Service Type column renders correct labels

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | The tab loads |
| 2 | Read the Service Type label for row index 8 | The label reads "Audio Conferencing" — matches the inventory-catalogued name for that index |
| 3 | Read the Service Type label for row index 0 | The label reads "APP Downloaded" |

**Notes**: Render-state assertion for the read-only label column. Verifies the label column is populated with the correct service type names and is not truncated or empty.

---

## TC-SVC-BAS-025: Clicking a Service Type label cell does not open any editor or dialog

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | The tab loads |
| 2 | Click the Service Type label cell for Audio Conferencing | No editor opens, no dialog appears, and Save remains disabled |
| 3 | Click the Service Type label cell for APP Downloaded | Same result — the cell is static and non-interactive |

**Notes**: Affordance check. Inventory records `affordance: none` for the Service Type column; this case confirms the classification is correct. Save must remain disabled because no data was changed.

---

## TC-SVC-BAS-026: Save button is disabled on page load with no edits

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page for office 1604 has just been loaded with no prior unsaved changes.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | The page loads |
| 2 | Without making any edit, read the disabled state of the Save button (`service-charge-save`) | The Save button has the `disabled` attribute — it is not clickable |

**Notes**: Save-state at rest. Confirms the default clean state.

---

## TC-SVC-BAS-027: Save button enables after any percentage edit

**Automatable**: Yes
**Preconditions**: The Service Charge Basic Information page is open for office 1604 and Save is disabled.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | Save is disabled |
| 2 | Click the Audio Conferencing percentage input, clear it, and type `50.00` | Save loses its `disabled` attribute and becomes clickable |
| 3 | Reload the page without saving | Changes are discarded and Save is disabled again |

**Notes**: Save enablement after a single edit. Confirms the dirty-state detection fires on any field change.

---

## TC-SVC-BAS-028: Column headers render with correct labels

**Automatable**: Yes
**Surface_Family**: render-state (QUICK)
**Preconditions**: The Service Charge Basic Information page is open for office 1604.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | The tab loads |
| 2 | Read the text of the two column headers | The headers read exactly `Service Type` and `Service Charge Percentage` (two columns, no extra columns, no truncation) |

**Notes**: QUICK must-assert for the render-state surface family. Verbatim column header check. Values sourced from the field inventory walk.

---

## TC-SVC-BAS-029: All 79 rows render and a named row is readable without scrolling

**Automatable**: Yes — NEEDS-LIVE-CONFIRM: verify no pagination control is present on the page when the environment is stable
**Surface_Family**: empty-vol (QUICK)
**Preconditions**: The Service Charge Basic Information page is open for office 1604.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | The tab loads |
| 2 | Count the total number of data rows in the table | 79 rows are present |
| 3 | Locate the row with Service Type "Audio Conferencing" using a content anchor | The row is readable and its percentage input (`service-charge-percentage-8`) is accessible |
| 4 | NEEDS-LIVE-CONFIRM: verify that no pagination control or "load more" button is present | No pagination control exists — all 79 rows are displayed at once |

**Notes**: QUICK must-assert for the empty-vol surface family. Confirms the table is fully populated and no row is hidden behind pagination or virtualization. Content-anchored row read (not row-index) per LR-022.

---

## TC-SVC-BAS-030: A saved value persists after page reload (surface persistence)

**Automatable**: Yes — NEEDS-LIVE-CONFIRM: verify no column sort affordance exists when the page is enabled
**Surface_Family**: persistence (QUICK)
**Preconditions**: The Service Charge Basic Information page is open for office 1604.

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Navigate to Location Settings for office 1604 and open the Basic Information tab | The tab loads |
| 2 | Edit the Audio Conferencing percentage to a new value and click Save | Save completes |
| 3 | Reload the page and re-open the Basic Information tab | The edited value is still shown — the change survived a full page reload |
| 4 | NEEDS-LIVE-CONFIRM: verify that no column sort affordance (sortable column header) is present | No sort control is present — row order is application-defined and fixed |
| 5 | Restore: return the field to its original value and save | The field is restored |

**Notes**: QUICK must-assert for the persistence surface family. Confirms saved data survives a reload. Also carries the sorting-absence verification from the catalog's out-of-scope note (NEEDS-LIVE-CONFIRM pending a live enabled walk).
