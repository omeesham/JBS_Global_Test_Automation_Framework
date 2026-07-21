# Neutral-Eye Audit — Local Office Settings

**Date**: 2026-04-23 (session executed 2026-04-23; subplan dated 2026-04-22 per SP-DQU-02 naming)
**Auditor**: WATCHDOG
**Browser tool**: Claude in Chrome — exploratory catalog, auth-heavy (Microsoft SSO + TOTP), user at machine, needed network-request inspection for APP-bug evidence (LR-038). Initial attempt via Claude in Chrome returned "Multiple extensions connected" error; switched to Playwright MCP briefly, then user re-connected Claude in Chrome and remainder of session ran on Claude in Chrome.
**Session office**: 1604 (Parker Palm Springs)

---

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/local-office`

Tabs observed (all on same URL, selected via Radix tablist):
- Basic Information (default)
- Location Settings History
- ECT Settings

---

## Live-state caveat (critical for readers)

Office 1604 has been heavily modified by prior manual test runs. Field values shown below are **observed live state**, not **documented REQUIREMENTS.md defaults**. Specific drift:

| Field | Live (2026-04-23) | REQUIREMENTS.md documented default |
|---|---|---|
| Strike Date Offset | `555` | `1` |
| Return Date Offset | `1` (saved during this audit from `0` to verify save dialog) | `1` |
| Use Fulfillment | checked | unchecked |
| Use Equipments QC | checked, **enabled** | unchecked, "always disabled" |
| Default Job to 1 day — Event/Outside/Internal | all checked | all unchecked |
| Phone 1 | `555-000-1111` | `760-883-1957` |
| PO Number | `<script>alert(1)</script>` (prior XSS test input) | empty |
| PO Number Label | `hhhhhhhhh` (prior test edit) | empty |
| Event Profit Target row 1 Target | `40.0%` | `41.0%` |
| ECT Benefits Multiplier | `25.0%` | `20.0%` |
| ECT Historical Subrental % | `10.0%` | `0.0%` |
| ECT Administrative Fee | `0.00` | (not documented; TC says `35.00`) |

**Implication**: Tests that hardcode specific numeric defaults (e.g., TC-LOS-ECT-008 asserting "Administrative Fee 35.00") are brittle. They should either (a) assert field-exists-and-is-editable, (b) read current value before modification and compare to that, or (c) depend on a pre-test slate-clear pattern (addressed in Track G of PLAN_DELIVERABLE_QUALITY_UPGRADE).

---

## Field inventory (Basic Information tab)

Live-DOM enumerated 2026-04-23 via `document.querySelectorAll('[data-testid]')` inside the active tabpanel.

### Default Date Offsets (6 numeric textboxes, all "Hrs" suffix)

| Name | data-testid | Live value | aria-invalid baseline | Constraint (from live tests) |
|---|---|---|---|---|
| Prep Date Offset (Relative to Start) | `local-office-settings-input-prep-date-offset` | `-1` | false | must be ≤ 0 (positive → aria-invalid=true) |
| Return Date Offset (Relative to End) | `local-office-settings-input-return-date-offset` | `1` (post-audit save) | false | must be ≥ 0 (negative → aria-invalid=true) |
| Set Date Offset (Relative to Start) | `local-office-settings-input-set-date-offset` | `-1` | false | must be ≤ 0 |
| Strike Date Offset (Relative to End) | `local-office-settings-input-strike-date-offset` | `555` | false | must be ≥ 0 |
| Delivery Date Offset (Relative to Start) | `local-office-settings-input-delivery-date-offset` | `0` | false | must be ≤ 0 AND ≥ Prep (NM-1264) |
| Pickup Date Offset (Relative to End) | `local-office-settings-input-pickup-date-offset` | `0` | false | must be ≥ 0 |

### Misc Settings (mix of Radix checkboxes, textboxes, combobox)

| Name | data-testid | Kind | Live value / checked | Notes |
|---|---|---|---|---|
| Use Fulfillment | `local-office-settings-checkbox-use-fulfillment` | checkbox (Radix button+hidden input pair) | aria-checked=true | |
| Use Availability | `local-office-settings-checkbox-use-availability` | checkbox | aria-checked=true | |
| Use Equipments QC | `local-office-settings-checkbox-use-equipments-qc` | checkbox | aria-checked=true, **not disabled** | REQUIREMENTS.md says "always disabled" — live refutes |
| Items Filled from Requests Return to Availability | `local-office-settings-checkbox-request-items-return` | checkbox | aria-checked=false | |
| Allow tentative and confirmed Status same priority | `local-office-settings-checkbox-same-priority` | checkbox | aria-checked=false | |
| Print Description (Default) | `local-office-settings-checkbox-print-description` | checkbox | aria-checked=true | |
| Use ServiceType for Subrental Inventory Sources | `local-office-settings-checkbox-use-subrent-service-type` | checkbox | aria-checked=true | |
| Phone 1 | `local-office-settings-input-phone-1` | text (required) | `555-000-1111` | **No format validation** — see BUG-LOS-BAS-016 |
| Phone 2 | `local-office-settings-input-phone-2` | text (optional) | empty | |
| Default Job to 1 day — Event | `local-office-settings-checkbox-default-job-one-day-event` | checkbox | aria-checked=true | |
| Default Job to 1 day — Outside | `local-office-settings-checkbox-default-job-one-day-outside` | checkbox | aria-checked=true | |
| Default Job to 1 day — Internal | `local-office-settings-checkbox-default-job-one-day-internal` | checkbox | aria-checked=true | |
| Default Labor to Hourly | `local-office-settings-checkbox-default-labor-to-hourly` | checkbox | aria-checked=true | Canada-only field per REQUIREMENTS.md |
| Default Order Type | `local-office-settings-select-default-order-type` | combobox | text empty (likely "--Select--" rendered elsewhere) | |
| PO Number | `local-office-settings-input-po-number` | text | `<script>alert(1)</script>` (stale test edit) | No sanitization observed in value |
| PO Number Label | `local-office-settings-input-po-number-label` | text | `hhhhhhhhh` (stale test edit) | |

### Section Configuration

- `local-office-settings-checkbox-use-section`: aria-checked=true
- `local-office-settings-btn-default-section` ("Default" button) present
- 14 section rows observed (live), with per-row `input[aria-label="edit name <guid>"]`:

| Row | Section Name (live) |
|---|---|
| 1 | AV Services |
| 2 | Flipcharts |
| 3 | Hybrid Meeting |
| 4 | Labor |
| 5 | Lighting |
| 6 | Power |
| 7 | Presenter Support |
| 8 | Projection |
| 9 | Rigging |
| 10 | Scenic |
| 11 | Staging |
| 12 | Test Section *(orphan from prior test runs)* |
| 13 | Video |
| 14 | Whiteboard |

Per-row active toggle: not captured (see "Known gaps" below).

### Room Configuration

4 room rows live (REQUIREMENTS.md says "no rows configured" — stale or state-dirty):
- Ballroom A
- Room Edit Test *(orphan)*
- Room Toggle Test *(orphan)*
- Test Room *(orphan)*

Plus 2 `aria-label="new row name"` empty inputs (add-new placeholders).

### Default Logo

| Element | testid / label | Live value |
|---|---|---|
| "Quotes" checkbox | `local-office-settings-checkbox-use-quote-logo` (label="Quotes" per find tool) | aria-checked=true |
| "Rental Orders/DROs" checkbox | `local-office-settings-checkbox-use-rental-logo` (label="Rental Orders/DROs") | aria-checked=true |

### Save

| Element | testid | Live state |
|---|---|---|
| Save button (Basic Info) | `local-office-settings-btn-save` | disabled at baseline; enables on valid edit; dialog gated — see below |

---

## Default values (baseline, from live DOM on fresh navigate)

Recorded above per-field. Key values:
- Save button disabled on fresh load → form pristine
- No aria-invalid set on any field at baseline
- No Unsaved Changes alertdialog at baseline

---

## Validation behavior (invalid-input table)

Verbatim observations from live DOM (2026-04-23 session):

| Field | Invalid input | Method | Result — value | aria-invalid | Save state | Toast/dialog |
|---|---|---|---|---|---|---|
| Prep Date Offset | `5` (positive, relative-to-start) | native setter + input/change events | stays `5` | **true** | disabled | none |
| Return Date Offset | `-5` (negative, relative-to-end) | native setter | stays `-5` | **true** | disabled | none |
| Prep Date Offset | `abc` (non-numeric) | native setter | stays `abc` | **true** | disabled | none (synchronous same-field invalid) |
| Phone 1 | `abcdef` (non-phone text) | native setter + real keystroke follow-up | stays `abcdef` | **false** | **enabled** | **none** — APP BUG BUG-LOS-BAS-016 |
| ECT Labor Cost (Admin Fee, original 0.00) | type `abc` without clearing | real keystroke | reverts to `0.00` | null | disabled | none (numeric mask rejects) |
| ECT Labor Cost (Audio - Operate/Show, original 37.10) | triple-click + type `abc` | real keystroke | reverts to `37.10` | null | disabled | none (numeric mask rejects) |
| ECT Labor Cost (Audio - Operate/Show, original 37.10) | triple-click + Delete + type `abc` + Tab | real keystroke | **`0.00`** (silent coerce) | null | **ENABLED** | **none** — APP BUG BUG-LOS-ECT-010 |

---

## Section names + labels (verbatim)

**Basic Information tab — section headings (top-down)**:
- "Default Date Offsets"
- "Misc Settings"
- "Section Configuration" (shortened to just "Section" in testid `local-office-settings-section-date-offsets` structure — but visible heading is "Section Configuration" per REQUIREMENTS.md)
- "Room Configuration"
- "Default Logo"
- "Discount Exemptions"

**ECT Settings tab — sub-section headings (verbatim)**:
- "Event Profit Target"
- "Fixed Costs"
- "Labor Cost Assumptions" *(plural; reviewer flag ECT-007 used singular "Labor Cost Assumption")*
- "SubRental Matrix" *(one word in code, "SUB RENTAL MATRIX" when uppercase in skeleton loader)*

**Location Settings History tab — 42 column headers** (first 15 verified live):
Local Office, Prep Date Offset, Return Date Offset, Set Date Offset, Strike Date Offset, Pickup Date Offset, Delivery Date Offset, Use Fulfillment, Use Availability, **"Use Equipment QC"** *(singular)*, Print Desc, Use Subrent, Phone1, Phone2, Use Sect.

Note: REQUIREMENTS.md line 1201 documents col 10 header as `"Use Equip QC"` (abbrev); live shows `"Use Equipment QC"` (full word, singular). Minor doc drift — not a TC defect.

---

## Links + actions

| Element | Click → observed outcome |
|---|---|
| ECT → "Edit/View : Commission structure" link (`<a>`) | href = `https://navigator.psav.com/#/commissons/commissionstier/:1604/`. URL has typo (`commissons`), different domain (`navigator.psav.com` vs current `cloudapps-e2e.encoreglobal.com`), and stray `:1604/` colon artifact. Not clicked during audit (external URL safety). Strongly suggests dead/broken link — see BUG-LOS-ECT-001. |
| Basic Info → "Save" button (after valid edit) | Opens Radix alertdialog (`data-testid="location-settings-modal-save-changes"`) with title "Save Changes", body "Are you sure you want to save the changes?", buttons "Cancel" / "Save". |
| Save confirmation → "Save" button in dialog | Dialog closes; toast "Local office settings updated" shown in notifications region (`region "Notifications alt+T"`); Save button disables (form pristine); edited value persists. |
| Tab switch while form dirty | Opens Radix alertdialog with title "Unsaved changes", body "Are you sure you want to leave this view? Any unsaved changes will be lost.", buttons "Stay" / "Discard". |

---

## Diff vs our CSV

Comparison against `clients/encore/exports/local_office_settings_test_cases.csv` (re-exported 2026-04-20) and MD at `clients/encore/specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md`.

Live observation = canonical; TC = defective when it contradicts.

| TC ID | Reviewer flag | Defect type | Current TC evidence line | Live finding | Fix for SP-DQU-03 |
|---|---|---|---|---|---|
| TC-LOS-BAS-004 | Reviewer: "value `5` on Prep" | already-fixed | MD line 168 + CSV line 17: `type -2` | CONFIRMED — Prep rejects positive (5 → aria-invalid=true). TC already uses `-2`. | No fix needed. Reviewer's flag is stale; a prior sweep already replaced `5` with `-2`. Document resolution in SP-DQU-03 execution summary. |
| TC-LOS-BAS-005 | Reviewer: "value `10` invalid on Prep; missing save dialog + toast text" | missing-assertion | MD line 186–188: dialog text present, toast text absent | Save dialog verbatim: title="Save Changes", body="Are you sure you want to save the changes?", buttons Cancel/Save (testid `location-settings-modal-save-changes`). Toast verbatim: "Local office settings updated". | Add toast assertion to step 4 or new step: "After dialog closes, toast notification 'Local office settings updated' appears in the notifications region." |
| TC-LOS-BAS-007 | Reviewer: "Expected should read 'Delivery Date >= Prep Date'" | wording | MD line 228: "When Delivery offset < Prep offset, Delivery field shows aria-invalid and Save disabled" | Live confirms: Delivery < Prep triggers aria-invalid on Delivery. | Rewrite Expected to positive phrasing: "NM-1264 rule: Delivery Date Offset must be ≥ Prep Date Offset. When Delivery < Prep, Delivery field shows aria-invalid and Save is disabled." Include the rule positively up-front. |
| TC-LOS-BAS-009 | Reviewer: "Return Date accepts 0/positive/empty only — not negatives" | not-a-defect (reviewer confused) | MD line 258 + CSV line 38: uses **Set** field (relative-to-start), type `-10`. Correctly tests negative-valid on relative-to-start. | Live confirms: Return rejects negatives (separate test). Set accepts negatives (what the TC covers). | No fix to TC-LOS-BAS-009 itself. Separately: add a new TC (or expand BAS-011/BAS-012) to cover Return-rejects-negatives. Reviewer's flag targets behavior that's not wrong in the TC; just missing a companion TC for Return. |
| TC-LOS-BAS-016 | Reviewer: "Phone 1 accepts non-phone text, save stays enabled" — APP BUG | missing-bug-gate + assertion | MD line 398: Expected "Phone 1 has no format validation; any non-empty text is accepted" | Live confirms: "abcdef" → aria-invalid=false, Save enabled. Matches current TC expectation. | **File BUG-LOS-BAS-016** (LR-034 protocol) — treat "no format validation" as an APP defect even though TC currently documents it as expected. Add `Status: Blocked by BUG-LOS-BAS-016` metadata line. Rewrite Expected to "Phone 1 should validate phone format (Blocked by BUG-LOS-BAS-016 — currently app accepts any non-empty text)." *(Gate note: reviewer's interpretation assumes a format-validation requirement that is NOT documented in REQUIREMENTS.md — may warrant a "discussion-item" flag per feedback_discussion_item_not_bug.md instead of hard bug. Recommend SP-DQU-03 consult user before filing vs flagging.)* |
| TC-LOS-BAS-025 | Reviewer: "all sections active but section names are different" | stale-default | MD lines 116–118 list hardcoded names: "Audio Visual, Business Center, Decor, Electrical, Event Technology, Floral, Food & Beverage, Internet/Telecom, Lighting, Production & Staging, Rigging, Signage & Graphics, Specialty" (13) | Live shows entirely different set: AV Services, Flipcharts, Hybrid Meeting, Labor, Lighting, Power, Presenter Support, Projection, Rigging, Scenic, Staging, Test Section (orphan), Video, Whiteboard (14 rows, one orphan). TC names do not exist in live DOM. | Remove hardcoded section-name list. Replace with structural assertion: "verify ≥ 1 section row present; Use Section checkbox is checked; each row has an `aria-label='edit name <guid>'` input; section-name values must come from REQUIREMENTS.md §Sections for 1604 table, not embedded in this TC." Either (a) convert to data-driven test reading REQUIREMENTS.md, or (b) assert structural shape only. Also note: office 1604 currently has orphan "Test Section" row from prior test runs — slate-clear handled in Track G. |
| TC-LOS-BAS-032 | Reviewer: "default logo checkboxes changed (Quotes, Rental Orders/DROs now default-on)" | stale-default + wrong-label | MD lines 154–156: labels "Use Default Proposal Logo" and "Use Default Convention Services Logo" | Live shows labels **"Quotes"** and **"Rental Orders/DROs"** — TC labels don't exist in DOM. Both checkboxes aria-checked=true. | Rewrite steps 3–4: "Verify 'Quotes' checkbox (testid `local-office-settings-checkbox-use-quote-logo`) is checked by default. Verify 'Rental Orders/DROs' checkbox (testid `local-office-settings-checkbox-use-rental-logo`) is checked by default." Update Expected: "Both 'Quotes' and 'Rental Orders/DROs' checkboxes default to checked for location 1604." |
| TC-LOS-ECT-001 | Reviewer: "Commission Structure link yields failure message" — APP BUG | missing-bug-gate | MD line 291: "Verify Edit/View label with Commission structure link -> Link present and clickable" | Live href: `https://navigator.psav.com/#/commissons/commissionstier/:1604/`. URL has typo (`commissons` missing 'i'), cross-domain (`navigator.psav.com` vs Encore's current `cloudapps-e2e.encoreglobal.com`), and `:1604/` colon artifact. Strong evidence of broken link. Not clicked (external URL risk). | **File BUG-LOS-ECT-001**. Rewrite TC to assert only href-pattern present (not click outcome). Add `Status: Blocked by BUG-LOS-ECT-001` metadata. Move click-outcome verification into a gated TC after bug fix. |
| TC-LOS-ECT-007 | Reviewer: "sections named 'Event Profit Target' & 'Labor Cost Assumption'" | TC-purpose-mismatch + stale-label | Current TC-LOS-ECT-007 Title: "Two Independent Save Buttons" — tests save-button independence, not sub-section naming. Reviewer's flag targets section-label text. | Live sub-section labels: "Event Profit Target" (matches), "Labor Cost Assumptions" (plural — reviewer used singular "Assumption"), "Fixed Costs", "SubRental Matrix". | Two fixes: (a) Add a new structural TC (e.g., TC-LOS-ECT-001b or rename ECT-001 to cover) that asserts the 4 ECT sub-section headings verbatim: "Event Profit Target", "Fixed Costs", "Labor Cost Assumptions", "SubRental Matrix". (b) Leave TC-LOS-ECT-007 (save buttons) as-is — reviewer's flag is misaligned with existing TC purpose, clarify in SP-DQU-03 execution summary. |
| TC-LOS-ECT-008 | Reviewer: "Administrative Fee value is `42`" | wrong-value (and brittle-value anyway) | MD line 400-ish: "Verify first row: 'Administrative Fee' \| '35.00'" | Live value is **`0.00`** (office 1604 has been test-edited). Reviewer's "42" also doesn't match live. Any hardcoded value is brittle because this field is editable and persists. | Remove hardcoded `35.00` from Step 5. Replace with structural assertion: "Verify first row Labor Class text equals 'Administrative Fee'; verify testid `ect-settings-input-labor-cost-0` is present and editable." Do NOT assert a specific numeric value — office-state dependent. |
| TC-LOS-ECT-010 | Reviewer: "non-numeric input doesn't revert; shows 0.00 with save enabled" — APP BUG | wrong-expectation | MD line 508-ish: Expected "Non-numeric input in labor cost field silently reverts to original value" | **Live CONFIRMS APP BUG** with specific sequence: (1) simple "type abc without clearing" — numeric mask rejects, value unchanged. (2) "triple-click-select-all + Delete + type abc + Tab" — value silently coerces to `0.00`, Save becomes **ENABLED**, no aria-invalid, no warning. Saving would overwrite original value → **data corruption risk**. | **File BUG-LOS-ECT-010**. Rewrite TC to test the buggy sequence: "Clear the field completely (triple-click, Delete), type 'abc', Tab. Expected: value should revert to original AND Save should be disabled. Actual: value becomes 0.00 and Save is enabled (Blocked by BUG-LOS-ECT-010)." Add `Status: Blocked by BUG-LOS-ECT-010` metadata. Include the pre-condition that the field must be cleared first — otherwise numeric mask hides the bug. |

Additional out-of-the-11 diff finding:

| TC | Defect | Fix |
|---|---|---|
| TC-LOS-BAS-017 (Phone 1 Edit, Save, Persist) | Uses hardcoded `555-123-4567` which is NOT the live original; office 1604 Phone 1 is `555-000-1111` post-edit. | TC is OK (it edits to a different value, saves, then restores) — but the "restore original" cleanup step depends on reading live-pre-value, not hardcoding. Recommend slate-clear read-then-restore pattern in Track G. |
| ECT Commission link href typo `commissons` | Not currently tested by any TC | Add dedicated URL-pattern TC under ECT-001 group. |

---

## Suspected APP bugs

| Module | Field / Feature | Observed behavior | Expected (per requirements or reasonable UX) | BUG-*.json filename |
|---|---|---|---|---|
| LOS / Basic Info / Misc Settings | Phone 1 (`local-office-settings-input-phone-1`) | Accepts any non-empty text including `abcdef`. No aria-invalid. Save button stays enabled. No toast. Can be persisted via Save. | Phone format validation should gate acceptance. (No explicit requirement in REQUIREMENTS.md — reviewer assertion.) | `BUG-LOS-BAS-016.json` — **TBD; recommend discussion-item flag before filing per feedback_discussion_item_not_bug.md** — REQUIREMENTS.md doesn't specify format-validation requirement. |
| LOS / ECT Settings | "Edit/View : Commission structure" link | Link href = `https://navigator.psav.com/#/commissons/commissionstier/:1604/`. Typo `commissons` (missing 'i'); cross-domain (`navigator.psav.com` vs `cloudapps-e2e.encoreglobal.com`); stray colon `:1604/`. | Link should route to a working commission-structure page on the current Encore Navigator domain with correct path and no typo. | `BUG-LOS-ECT-001.json` — file per LR-034 in SP-DQU-03. Click-verification pending (not performed this session due to external-URL safety policy). |
| LOS / ECT Settings / Labor Cost Assumptions | ECT Labor Cost inputs (`ect-settings-input-labor-cost-*`) | When user triple-click-selects the existing value, presses Delete to clear, then types non-numeric `abc` and Tabs out: input value becomes `0.00`, Save button becomes **ENABLED**, no aria-invalid, no warning, no toast. Saving would persist `0.00` over the original value. | Non-numeric input should either be rejected entirely (as the "without clearing" case correctly does) or aria-invalid should fire + Save should be disabled. Current behavior is a silent data-corruption vector. | `BUG-LOS-ECT-010.json` — file per LR-034 in SP-DQU-03. |

### Reviewer flags that did NOT reproduce (refuted or partially refuted on live DOM)

- **BAS-004**: reviewer said TC uses `5` on Prep. Live CSV + MD both use `-2`. Already-fixed by prior sweep.
- **BAS-009**: reviewer said Return field test is wrong. Actual TC-LOS-BAS-009 tests **Set** field (correct). Reviewer appears to have misread the TC. Separate gap: no TC currently covers Return-rejects-negative; recommend adding.
- **ECT-007** sub-section labels: reviewer said "Labor Cost Assumption" (singular). Live shows "Labor Cost Assumptions" (plural). Minor wording, TC should use plural.
- **ECT-008** value `42`: live shows `0.00`, not 42. Reviewer's "42" appears to come from an earlier observed state. Either way, TC shouldn't hardcode a specific number.

---

## Suggested TCs (for SP-DQU-03 to consider adding)

Order: SMOKE → POSITIVE → NEGATIVE → UI → REGRESSION

| Suggested TC ID | Type | Title | Priority | Notes |
|---|---|---|---|---|
| TC-LOS-BAS-NEW-1 | NEGATIVE | Return Date Offset rejects negative values | P1 | Covers reviewer BAS-009 concern. Type `-5` into Return, verify aria-invalid + Save disabled. |
| TC-LOS-ECT-NEW-1 | SMOKE / UI | ECT Sub-section Headings Present | P1 | Assert 4 sub-section headings verbatim: "Event Profit Target", "Fixed Costs", "Labor Cost Assumptions", "SubRental Matrix". Covers reviewer ECT-007. |
| TC-LOS-ECT-NEW-2 | NEGATIVE | ECT Labor Cost Clear-then-NonNumeric data corruption (Blocked by BUG-LOS-ECT-010) | P1 | Triple-click + Delete + type abc + Tab. Verify actual buggy state. Gated by bug. |
| TC-LOS-ECT-NEW-3 | REGRESSION | Commission Structure link URL pattern (Blocked by BUG-LOS-ECT-001) | P2 | Assert href contains known-broken pattern until bug fixed; after bug fix, change to positive URL assertion. |
| TC-LOS-BAS-NEW-2 | UI | Save Changes alertdialog text verbatim | P1 | Assert dialog title="Save Changes", body="Are you sure you want to save the changes?", buttons "Cancel" and "Save". Covers BAS-005 missing-assertion. |
| TC-LOS-BAS-NEW-3 | UI | Unsaved Changes alertdialog on tab switch | P2 | Assert dialog title="Unsaved changes", body="Are you sure you want to leave this view? Any unsaved changes will be lost.", buttons "Stay" and "Discard". |

---

## Network-request evidence

The session installed a `window.fetch` hook before Basic Info validation tests. Observations:

- **Prep `5` (invalid)**: 0 API calls. Client-side validation blocked submit. (Hook count = 0.)
- **Phone 1 `abcdef`**: 0 API calls required (no save click), but save button was enabled — meaning a save click WOULD fire a save API with the corrupt data. Save button state is the evidence, not a fired request. LR-033 confirms: empty fetch array + enabled save = "client allows invalid data to reach server."
- **Save of Return=0→1**: toast "Local office settings updated" appeared → API succeeded. Fetch hook was lost after the intervening reload (LR-011 cleanup). Playwright MCP `browser_network_requests` was called AFTER save so no evidence captured there either — known limitation, audit context.
- **ECT tab navigation**: Claude in Chrome `read_network_requests` filter on `/api/` returned empty — network tracker was initialized after most requests; no lingering evidence for ECT-001 click (not performed) or ECT-010 save (deliberately not saved to protect data).

For SP-DQU-03 bug-filing: network-tab inspection should be captured AT THE TIME of click/save during fix session, not retrospectively. This audit relies on DOM-state + control-state as primary evidence, per LR-033.

---

## Known gaps in this audit (honest inventory for SP-DQU-03)

1. **Per-row active-state of Section Configuration rows not captured**: tried to read SVG toggle state programmatically but the inline read returned "no-toggle-found" for every row (toggle likely uses a custom button/icon that didn't match my selector heuristics). Need a dedicated SVG-presence check in SP-DQU-03 when rewriting TC-LOS-BAS-025.
2. **Default Order Type combobox text not captured**: the button element's `textContent` returned empty; the rendered "Event" text may be wrapped in a child element that requires find-tool lookup. Minor — TC-LOS-BAS-NEW for Default Order Type default state should verify via find tool.
3. **ECT-001 Commission link click not performed**: external-URL safety policy + not wanting to leave Encore domain. URL-pattern evidence alone is used. SP-DQU-03 bug-filing should click in a controlled way (or confirm URL broken via curl from a trusted environment).
4. **No fresh-location baseline**: office 1604 state is dirty. Some "defaults" above are test-edits not true defaults. Track G pre-test slate-clear will address.
5. **Location Settings History tab per-row data not deep-dived**: 42 column headers confirmed; first-15 listed; row-count = 20 per page; not verified every header name (REQUIREMENTS.md already catalogs all 42).
6. **Room Configuration toggle behavior not tested**: 4 orphan rooms present; did not test toggle/add/rename during this audit (would pollute state further). Covered by existing TCs.
7. **Discount Exemptions section not audited**: 75 service-type rows per REQUIREMENTS.md; no reviewer flag against this section so deferred to a later neutral-eye pass.

---

## Activity-log row (to be appended with wall-clock timestamp at subplan close per LR-037)

`| 2026-04-23T<HH:MM> | WATCHDOG | done | clients/encore/specs_planning/_internal/neutral-eye-audits/local-office-settings-2026-04-22.md, plans/pending/SUBPLAN_DQU_02_B1_LOS_NEUTRAL_EYE_AUDIT.md | SP-DQU-02: Neutral-eye audit of Local Office Settings (Basic Info + ECT + History tabs). 3 APP bugs confirmed (BUG-LOS-BAS-016 Phone no-format-validation [discussion-item gate], BUG-LOS-ECT-001 Commission link broken URL, BUG-LOS-ECT-010 labor-cost clear-then-abc data corruption). 8 of 11 reviewer flags confirmed; 3 refuted or already-fixed. Diff vs CSV identifies required changes to TC-LOS-BAS-005/007/016/025/032 + ECT-001/007/008/010 for SP-DQU-03. Browser tool: Claude in Chrome (initial Playwright MCP fallback, user reconnected Chrome mid-session). |`
