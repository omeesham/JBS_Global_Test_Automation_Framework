# Field Inventory — Local Office Settings

**Module**: local-office-settings
**Client**: encore
**MCP_Session_Date**: 2026-04-27
**MCP_Session_Tool**: Claude in Chrome
**MCP_Tool_Reason**: Promotion of WATCHDOG neutral-eye audit dated 2026-04-23 (within 14-day fresh window) into field-inventories/ for SP-AAE-02 hook + Rule 5 compliance. Source session used Claude in Chrome (auth-heavy SSO + TOTP, network-request inspection for APP-bug evidence). No fresh DOM walk performed today; all field data inherited verbatim from the 2026-04-23 audit at `clients/encore/specs_planning/_internal/neutral-eye-audits/local-office-settings-2026-04-22.md`.
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/local-office
**Test_Entity**: Office 1604 (Parker Palm Springs)

---

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/local-office`

Tabs observed (all on same URL, selected via Radix tablist):

- "Basic Information" (active by default)
- "Location Settings History"
- "ECT Settings"

---

## Live-state caveat

Office 1604 has been heavily modified by prior manual test runs. The values below are observed live state on 2026-04-23, not REQUIREMENTS.md documented defaults.

| Field | Live (2026-04-23) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Strike Date Offset | 555 | 1 | prior test pollution |
| Return Date Offset | 1 (post-audit save from 0) | 1 | audit save during walk |
| Use Fulfillment | checked | unchecked | prior test pollution |
| Use Equipments QC | checked, enabled | unchecked, "always disabled" | prior test pollution + REQUIREMENTS.md inaccuracy (Use Equipments QC is conditional, not always disabled) |
| Default Job to 1 day (Event/Outside/Internal) | all checked | all unchecked | prior test pollution |
| Phone 1 | 555-000-1111 | 760-883-1957 | prior test pollution |
| PO Number | `<script>alert(1)</script>` | empty | prior XSS test |
| PO Number Label | hhhhhhhhh | empty | prior test edit |
| Event Profit Target row 1 Target | 40.0% | 41.0% | prior test pollution |
| ECT Benefits Multiplier | 25.0% | 20.0% | prior test pollution |
| ECT Historical Subrental % | 10.0% | 0.0% | prior test pollution |
| ECT Administrative Fee | 0.00 | (not documented; TC says 35.00) | prior test pollution |

Implication: TCs that hardcode specific numeric defaults are brittle. Either (a) assert field-exists-and-is-editable, (b) read current value before modification and compare to that, or (c) depend on a pre-test slate-clear pattern (Track G of PLAN_DELIVERABLE_QUALITY_UPGRADE).

---

## Field Inventory

### Default Date Offsets (Basic Information tab)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Prep Date Offset (Relative to Start) | `local-office-settings-input-prep-date-offset` | text | -1 | must be <= 0 (positive triggers aria-invalid=true); non-numeric triggers aria-invalid=true synchronously | always enabled | none | Hrs suffix |
| Return Date Offset (Relative to End) | `local-office-settings-input-return-date-offset` | text | 1 | must be >= 0 (negative triggers aria-invalid=true) | always enabled | none | Hrs suffix |
| Set Date Offset (Relative to Start) | `local-office-settings-input-set-date-offset` | text | -1 | must be <= 0 | always enabled | none | Hrs suffix |
| Strike Date Offset (Relative to End) | `local-office-settings-input-strike-date-offset` | text | 1 (live: 555) | must be >= 0 | always enabled | none | Hrs suffix |
| Delivery Date Offset (Relative to Start) | `local-office-settings-input-delivery-date-offset` | text | 0 | must be <= 0 AND must be >= Prep (NM-1264 cross-field) | always enabled | NM-1264: Delivery >= Prep | Hrs suffix |
| Pickup Date Offset (Relative to End) | `local-office-settings-input-pickup-date-offset` | text | 0 | must be >= 0 | always enabled | none | Hrs suffix |

### Misc Settings (Basic Information tab)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Use Fulfillment | `local-office-settings-checkbox-use-fulfillment` | checkbox | unchecked | none | always enabled | enables Use Equipments QC when checked | Radix button + hidden input pair |
| Use Availability | `local-office-settings-checkbox-use-availability` | checkbox | checked | none | always enabled | none | |
| Use Equipments QC | `local-office-settings-checkbox-use-equipments-qc` | checkbox | unchecked | none | conditionally disabled (disabled when Use Fulfillment unchecked; enabled when checked) | depends on Use Fulfillment | |
| Items Filled from Requests Return to Availability | `local-office-settings-checkbox-request-items-return` | checkbox | unchecked | none | always enabled | none | |
| Allow tentative and confirmed Status to have the same priority | `local-office-settings-checkbox-same-priority` | checkbox | unchecked | none | always enabled | none | |
| Print Description (Default) | `local-office-settings-checkbox-print-description` | checkbox | checked | none | always enabled | none | |
| Use ServiceType for Subrental Inventory Sources | `local-office-settings-checkbox-use-subrent-service-type` | checkbox | checked | none | always enabled | none | |
| Phone 1 | `local-office-settings-input-phone-1` | text | 760-883-1957 | required only — NO format validation; any non-empty text accepted | always enabled | none | App accepts any non-empty string including XSS payloads — see BUG-LOS-BAS-016 |
| Phone 2 | `local-office-settings-input-phone-2` | text | empty | none (optional) | always enabled | none | |
| Default new job to 1 day — Event | `local-office-settings-checkbox-default-job-one-day-event` | checkbox | unchecked | none | always enabled | none | |
| Default new job to 1 day — Outside | `local-office-settings-checkbox-default-job-one-day-outside` | checkbox | unchecked | none | always enabled | none | |
| Default new job to 1 day — Internal | `local-office-settings-checkbox-default-job-one-day-internal` | checkbox | unchecked | none | always enabled | none | |
| Default Labor to Hourly | `local-office-settings-checkbox-default-labor-to-hourly` | checkbox | unchecked | none | always enabled | none | Canada-only field per REQUIREMENTS.md |
| Default Order Type | `local-office-settings-select-default-order-type` | combobox | Event | none | always enabled | none | 2 options: Event, Outside |
| PO Number | `local-office-settings-input-po-number` | text | empty | none observed | always enabled | none | No sanitization observed |
| PO Number Label | `local-office-settings-input-po-number-label` | text | empty | none observed | always enabled | none | |

### Section Configuration (Basic Information tab)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Use Section | `local-office-settings-checkbox-use-section` | checkbox | checked | none | always enabled | none | |
| Default (sections) | `local-office-settings-btn-default-section` | button | n/a | n/a | always enabled | none | Reset to system defaults |
| Section row | (none) — use `aria-label="edit name <guid>"` per LR-014 fallback | section-row | varies (live: 14 rows) | none | always enabled | none | Per-row edit-name input + active toggle (SVG checkmark `lucide lucide-check`); row identity by aria-label guid; section names are office-specific from REQUIREMENTS.md, NOT hardcoded |

### Room Configuration (Basic Information tab)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Room row | (none) — use `aria-label="new row name"` for add placeholders | section-row | varies (live: 4 orphan rows for 1604; REQUIREMENTS.md says no rows) | none | always enabled | none | State-dirty for 1604 — Track G slate-clear |

### Default Logo (Basic Information tab)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Quotes (logo) | `local-office-settings-checkbox-use-quote-logo` | checkbox | checked | none | always enabled | none | Label verbatim "Quotes" — NOT "Use Default Proposal Logo" (stale TC text) |
| Rental Orders/DROs (logo) | `local-office-settings-checkbox-use-rental-logo` | checkbox | checked | none | always enabled | none | Label verbatim "Rental Orders/DROs" — NOT "Use Default Convention Services Logo" (stale TC text) |
| Company Logo | `local-office-settings-select-company-logo` | combobox | Encore New Logo | none | always enabled | none | 12 options |
| Logo preview | `local-office-settings-logo-preview` | link | n/a (display) | n/a | n/a | n/a | Preview only |

### Save (Basic Information tab)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Save | `local-office-settings-btn-save` | button | n/a | n/a | disabled at baseline; enables on valid edit; gated by save dialog | depends on form validity + dirty | See Save-cycle observations |

### ECT Settings tab

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Edit/View Commission structure link | (none) — use text "Commission structure" | link | n/a | n/a | always enabled | none | href = `https://navigator.psav.com/#/commissons/commissionstier/:1604/` — broken URL (typo `commissons`, cross-domain, stray colon) — see BUG-LOS-ECT-001 |
| Select Currency | (none) — use combobox by label "Select Currency" | combobox | USD | none | always enabled | none | 1 option for office 1604 |
| Benefits Multiplier | `ect-settings-input-benefits-multiplier` | text | 20.0% (live: 25.0%) | numeric mask | always enabled | none | Decimal raw / percentage display |
| Historical Subrental % | `ect-settings-input-historical-subrental` | text | 0.0% (live: 10.0%) | numeric mask | always enabled | none | Decimal raw / percentage display |
| Save (Fixed Costs) | `ect-settings-btn-save-fixed-costs-btn` | button | n/a | n/a | disabled at baseline; enables on Fixed Costs edit | depends on Fixed Costs section dirty | Independent of Labor Costs save |
| Save (Labor Costs) | `ect-settings-btn-save-labor-costs-btn` | button | n/a | n/a | disabled at baseline; enables on Labor Costs edit | depends on Labor Costs section dirty | Independent of Fixed Costs save |
| Labor Cost row (Administrative Fee) | `ect-settings-input-labor-cost-0` | text | 35.00 (live: 0.00) | numeric mask (incomplete — see BUG-LOS-ECT-010) | always enabled | none | Triple-click + Delete + abc + Tab silently coerces to 0.00 with Save enabled — data corruption risk |
| Labor Cost rows 1..65 | `ect-settings-input-labor-cost-{n}` | text | varies | numeric mask | always enabled | none | 66 total rows; first row = Administrative Fee, last row = zzzFinishing Service |

---

## Labels + Section Names

Verbatim copy from live DOM (2026-04-23 session).

**Basic Information tab — section headings (top-down)**:

- "Default Date Offsets"
- "Misc Settings"
- "Section Configuration"
- "Room Configuration"
- "Default Logo"
- "Discount Exemptions"

**ECT Settings tab — sub-section headings (top-down, verbatim)**:

- "Event Profit Target"
- "Fixed Costs"
- "Labor Cost Assumptions"
- "SubRental Matrix"

**Location Settings History tab — first 15 column headers (verified live)**:

Local Office, Prep Date Offset, Return Date Offset, Set Date Offset, Strike Date Offset, Pickup Date Offset, Delivery Date Offset, Use Fulfillment, Use Availability, "Use Equipment QC" (full word, singular), Print Desc, Use Subrent, Phone1, Phone2, Use Sect.

(REQUIREMENTS.md line 1201 documents col 10 header as "Use Equip QC" abbreviation; live shows "Use Equipment QC" full word — minor doc drift, not a TC defect.)

---

## Save-cycle observations

**Save button behavior (Basic Information)**:

- Default state on fresh load: disabled
- Enables when: any field changes from baseline AND form is valid (no aria-invalid)
- Disables when: save API completes successfully (form transitions to pristine via dialog confirm path)
- testid: `local-office-settings-btn-save`

**Save dialog (Basic Information — gates the actual save)**:

- Triggered by: click of Save button on Basic Information tab
- testid: `location-settings-modal-save-changes`
- Title (verbatim): "Save Changes"
- Body (verbatim): "Are you sure you want to save the changes?"
- Buttons (in order, verbatim): "Cancel", "Save"

**Post-save toast (notification region)**:

- Region locator: aria-label="Notifications alt+T"
- Text (verbatim): "Local office settings updated"
- Duration: transient (auto-dismisses)

**Dirty-state behavior (LR-026)**:

- Tab switch with dirty form: opens "Unsaved changes" alertdialog
- Alertdialog title (verbatim): "Unsaved changes"
- Alertdialog body (verbatim): "Are you sure you want to leave this view? Any unsaved changes will be lost."
- Buttons (in order, verbatim): "Stay", "Discard"

**Save (ECT Fixed Costs)**: no confirmation dialog observed — direct save, button disables on completion. See TC-LOS-ECT-012.

**Save (ECT Labor Costs)**: no confirmation dialog observed — direct save. See TC-LOS-ECT-009.

---

## Observations

### Bugs / Defects

Per LR-034 protocol — three application bugs identified in the 2026-04-23 audit. JSON files filed at `reports/bugs/` by SP-DQU-03 (this subplan).

| Bug ID | Field / Feature | Observed | Expected (per requirements) | Status |
|---|---|---|---|---|
| BUG-LOS-BAS-016 | Phone 1 (`local-office-settings-input-phone-1`) | Accepts any non-empty text including `abcdef` and XSS payloads. No aria-invalid. Save button stays enabled. Toast confirms persistence. | Phone format validation should gate acceptance. (No explicit format-validation requirement in REQUIREMENTS.md — discussion-item gate noted; subplan filing per SP-DQU-03 Step 3.) | open |
| BUG-LOS-ECT-001 | "Edit/View : Commission structure" link | href = `https://navigator.psav.com/#/commissons/commissionstier/:1604/` — typo `commissons` missing 'i', cross-domain (`navigator.psav.com` vs current `cloudapps-e2e.encoreglobal.com`), stray `:1604/` colon. | Link should route to a working commission-structure page on the current Encore Navigator domain with correct path and no typo. | open |
| BUG-LOS-ECT-010 | ECT Labor Cost inputs (`ect-settings-input-labor-cost-*`) | When user triple-clicks the existing value, presses Delete to clear, then types non-numeric `abc` and Tabs out: input value silently becomes `0.00`, Save button becomes ENABLED, no aria-invalid, no warning. Saving would persist `0.00` over the original value. | Non-numeric input should either be rejected (as the "type without clearing" case correctly does) or aria-invalid should fire and Save should be disabled. Current behavior is a silent data-corruption vector. | open |

---

### Suggestions / Improvements

none
## Staleness signal

- **Last verified**: 2026-04-23 (inherited from neutral-eye audit; today's promotion 2026-04-27 is a re-anchor)
- **Fresh-until**: 2026-05-07 (14 days from 2026-04-23 verification)
- **Stale-after**: 2026-05-23 (30 days from 2026-04-23 verification)
- **Refresh triggers**: Encore release announcement; MODULE_REGISTRY.md schema change; spot-check disagreed with this artifact; client-flagged DOM change.

---

## Diff vs CSV

(Promotion of WATCHDOG neutral-eye audit findings — 11 reviewer flags resolved in SP-DQU-03.)

| TC ID | Defect type | Live finding | Fix |
|---|---|---|---|
| TC-LOS-BAS-004 | already-fixed (reviewer flag stale) | TC already uses `-2`; reviewer's `5` flag was for a prior version | Document resolution; no TC change |
| TC-LOS-BAS-005 | missing-assertion | Toast text not asserted | Add toast assertion: "Local office settings updated" |
| TC-LOS-BAS-007 | wording | Expected phrased negatively | Rewrite Expected with positive NM-1264 phrasing |
| TC-LOS-BAS-009 | not-a-defect (reviewer confused) | TC tests Set field; reviewer misread as Return | No TC-009 change; add new TC for Return-rejects-negative |
| TC-LOS-BAS-016 | bug-blocked (no requirement) | Phone 1 has no format validation | File BUG-LOS-BAS-016, rewrite TC, add Status metadata |
| TC-LOS-BAS-025 | stale-default | Hardcoded section names do not exist in live DOM | Replace with structural assertion |
| TC-LOS-BAS-032 | stale-default + wrong-label | Live labels are "Quotes" and "Rental Orders/DROs"; both default checked | Rewrite to actual labels and checked default |
| TC-LOS-ECT-001 | bug-blocked (broken URL) | Commission link href has typo + cross-domain + stray colon | File BUG-LOS-ECT-001, assert href pattern only, add Status metadata |
| TC-LOS-ECT-007 | TC-purpose-mismatch | Reviewer flag misaligned with existing TC purpose | Leave ECT-007 as-is; add TC-LOS-ECT-NEW-1 for sub-section headings |
| TC-LOS-ECT-008 | wrong-value (and brittle) | Live shows 0.00, not 35.00 or 42 | Remove hardcoded value; structural assertion only |
| TC-LOS-ECT-010 | bug-blocked (data corruption) | Triple-click + Delete + abc + Tab coerces to 0.00 with Save enabled | File BUG-LOS-ECT-010, rewrite TC to test buggy sequence, add Status metadata |

---

## Network-request evidence

| Action | API call(s) observed | Status | Inference |
|---|---|---|---|
| Prep `5` invalid | 0 (fetch hook count = 0) | n/a | Client-side validation blocks submit |
| Phone 1 `abcdef` | 0 (no save click during walk) | n/a | Save button enabled — a save click WOULD fire with corrupt data — LR-033 confirms client-allows-invalid |
| Save Return 0->1 | toast appeared | success (200 OK inferred from toast) | API succeeded; fetch hook lost during reload |
| ECT tab navigation | 0 (filter `/api/`) | n/a | Network tracker initialized after most requests |

---

## Known gaps

- Per-row active-state of Section Configuration rows not captured during 2026-04-23 walk (SVG toggle selector heuristics didn't match every row). SP-DQU-03 BAS-025 fix uses structural assertion only.
- Default Order Type combobox text not captured (button textContent returned empty; rendered text wrapped in child element).
- ECT-001 Commission link click not performed (external-URL safety policy). URL-pattern evidence used.
- No fresh-location baseline for Office 1604 (state is dirty from prior tests). Track G pre-test slate-clear addresses.
- Discount Exemptions section not deep-audited (75 service-type rows per REQUIREMENTS.md; no reviewer flag against this section).

---

## Activity-log row (append at session close per LR-028 + LR-037)

`| 2026-04-27T<HH:MM> | OWNER | done | clients/encore/specs_planning/_internal/field-inventories/local-office-settings-2026-04-27.md | Field-inventory artifact promoted from neutral-eye audit (2026-04-23) for SP-DQU-03 / SP-AAE-02 hook + Rule 5 compliance. Inherits 3 tabs, 36 fields, 6 sections, 3 candidate APP bugs. |`
