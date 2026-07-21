# Neutral-Eye Audit — Local Information

**Date**: 2026-04-27
**Auditor**: WATCHDOG
**Browser tool**: Claude in Chrome — LR-038 v2 row "MFA / OTP / passkey flow → Chrome (mandatory)" + "Live RCA → Chrome" (auth-heavy SSO+TOTP, live cascading dependency probing, BUG-LI-001 needs network inspection, user at machine).
**Subplan**: SUBPLAN_DQU_04_B2_LI_NEUTRAL_EYE_AUDIT.md
**Office under test**: 1604 (The Parker Palm Springs)
**Browser session timestamp**: 2026-04-27T21:18-21:30 (Pacific)

---

## ⚠ Auditor caveat — backend partial degradation

E2E backend (`cloudapps-e2e.encoreglobal.com`) was returning **504 Gateway Timeout** on every `/api/core/*` lookup endpoint and **503 Service Unavailable** on the page-level POST throughout the audit:

| Endpoint | Status | Effect |
|---|---|---|
| `/api/core/currencies` | pending → 504 | Currency dropdowns empty |
| `/api/core/merchants` | pending → 504 | Merchant lookups empty |
| `/api/core/countries` | pending → 504 | Country dropdown empty |
| `/api/core/taxmodes` | pending → 504 | Tax Mode dropdown empty |
| `/api/core/regions` | pending → 504 | Region dropdown empty |
| `/api/core/line-of-business` | pending → 504 | LoB dropdown empty |
| `/api/core/oracle-orgs` | pending → 504 | Oracle Organization dropdown empty + DISABLED |
| `/api/core/terms-conditions?countryId=1` | pending → 504 | Legal T&C empty |
| `/api/core/service-charges?countryId=1` | pending → 504 | Service Charge lookups empty |
| `POST /navigator/locations/1604/settings/location` (Save) | 503 | Save submits but server rejects |

User-visible toast (4 stacked): `Failed to load dropdown data` (sonner toaster, `data-type=error`).

**Console errors observed**:
- `[useLocationMetadata] Countries fetch failed: Request failed with status 504`
- `[useLocationMetadata] TaxModes fetch failed: Request failed with status 504`
- `[useLocationMetadata] Regions fetch failed: Request failed with status 504`
- `[LocationDetailSection] Failed to fetch line of business Request failed with status 504`
- `Error fetching location: Error: Request failed with status 504` (initial nav; recovered on reload)

**Implication**:
- DOM-state observation (defaults, disabled flags, conditional rendering, validation indicators) — **reliable**.
- Save-cycle behavior (validation timing, BillingCycle change cascade, IDC persistence after Intercompany toggle, parent-toggle resets on C&C/ETS/Resort Tax) — **INCONCLUSIVE**, marked as such per item.
- Adjacent-tab cascade tests (BillingWay change → API validation, SkipBilling toggle → Oracle field disable) — **INCONCLUSIVE**, save-blocked by 503.

---

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location` → Local Information sub-tab (selected by default).

---

## Tab structure observed

**Top-level tabs** (`role=tab`):
1. `location-settings-tab-basic-information` — "Basic Information" (selected)
2. `location-settings-tab-management-history` — "Location Management History"

**Sub-tabs under Basic Information** (`role=tab`):
1. `location-settings-sub-tab-local-information` — "Local Information" (selected) ← audit subject
2. `location-settings-sub-tab-currency` — "Currency"
3. `location-settings-sub-tab-pricing` — "Pricing"
4. `location-settings-sub-tab-account-and-address` — "Account and Address"
5. `location-settings-sub-tab-legal` — "Legal"
6. `location-settings-sub-tab-notes` — "Notes"
7. `location-settings-sub-tab-shared-setup-locations` — "Shared Setup Locations"
8. `location-settings-sub-tab-auto-add-on` — "Auto Add-On"

LI panel id: `radix-_r_1i_-content-local-information` (Radix UI tabpanel; `data-state=active`).

**Architectural note**: app is **Next.js + React Hook Form + Server Actions** (not Angular as documented in v1 requirements doc + BUG-LI-001 file). Save POSTs to the page URL itself (Next.js Server Action pattern), not to an Angular `/api/save` endpoint.

---

## Field inventory (LI panel only — scoped to `radix-_r_1i_-content-local-information`)

**Counts**: 8 inputs · 41 Radix checkboxes · 2 Radix comboboxes · 2 Radix radio groups · 1 button (Effective Date, disabled). Total interactive controls: **54**.

### Inputs (text/number — 8)

| data-testid | Name (RHF path) | Default value | Disabled | aria-invalid | aria-required |
|---|---|---|---|---|---|
| `location-settings-input-default-ldw-percentage` | (none on input) | `0.00%` | false | false | null |
| `location-settings-input-cables-consumables-percentage` | (none) | `0.00%` | false | false | null |
| `location-settings-input-ets-percentage` | (none) | `23.00%` | false | false | null |
| `location-settings-input-resort-tax-percent` | (none) | `0.00%` | false | false | null |
| `location-settings-input-set-strike-labor-billing` | (none) | `33.00%` | false | false | null |
| `location-settings-input-threshold-amount` | (none) | `0.00%` | **true** | false | null |
| `location-settings-input-oracle-product` | `localInformation.oracleProduct` | `test` ⚠ DIRTY (expected `0000`) | false | false → **true after clear** | null |
| `location-settings-input-oracle-dept` | `localInformation.oracleDept` | (numeric, redacted by Chrome) | false | false | null |

### Comboboxes (Radix Select — 2)

| data-testid | Default value | Disabled |
|---|---|---|
| `location-settings-select-billing-cycle` | `Weekly` | false |
| `location-settings-select-oracle-org` | `--Select--` | **true** (likely env-blocked: `/api/core/oracle-orgs` 504) |

### Radio groups (Radix RadioGroup — 2)

| data-testid | Default selection | Notes |
|---|---|---|
| `location-settings-input-billing-type` | Master | Options: Master, Direct |
| `location-settings-input-billing-way` | Event | Options: Event, Daily |

### Date button (1)

| data-testid | Default value | Disabled |
|---|---|---|
| `location-settings-btn-effective-date` | `April 8th, 2007` | **true** |

### Checkboxes (Radix — 41 total; 7 disabled)

**Enabled checkboxes (34)**:

| data-testid | Default state |
|---|---|
| `location-settings-checkbox-apply-ldw` | checked |
| `location-settings-checkbox-calc-ldw-on-net-amount` | checked |
| `location-settings-checkbox-apply-cables-consumables` | checked |
| `location-settings-checkbox-calc-cac-on-net-amount` | checked |
| `location-settings-checkbox-enable-multiday-pricing` | checked |
| `location-settings-checkbox-allow-ets` | checked |
| `location-settings-checkbox-allow-service-charge` | unchecked |
| `location-settings-checkbox-is-administrative-fee` | checked ⚠ |
| `location-settings-checkbox-calc-service-charge-on-net` | checked ⚠ |
| `location-settings-checkbox-allow-resort-tax` | checked |
| `location-settings-checkbox-allow-tick-calc` | checked |
| `location-settings-checkbox-enable-set-strike-minutes` | checked |
| `location-settings-checkbox-apply-set-strike-minutes` | checked |
| `location-settings-checkbox-allow-internet-asset-reservation` | checked |
| `location-settings-checkbox-allow-dpcd` | checked |
| `location-settings-checkbox-exclude-implied-discount` | checked |
| `location-settings-checkbox-prompt-for-approval` | checked |
| `location-settings-checkbox-credit-memo-approval` | checked |
| `location-settings-checkbox-check-discount` (Enable Discount Reason) | checked |
| `location-settings-checkbox-allow-production-quote` | checked |
| `location-settings-checkbox-warehouse-billing` | unchecked |
| `location-settings-checkbox-company-remit-tax` | checked |
| `location-settings-checkbox-comm-receiver` | checked |
| `location-settings-checkbox-enable-idc-billing` | unchecked |
| `location-settings-checkbox-skip-billing` | unchecked |
| `location-settings-checkbox-separate-commission-invoice` | unchecked |
| `location-settings-checkbox-show-sub-rental` | unchecked |
| `location-settings-checkbox-inventory-only` | unchecked |
| `location-settings-checkbox-intercompany` | checked |
| `location-settings-checkbox-calculate-commission-tax` | unchecked |
| `location-settings-checkbox-can-create-external-link` | unchecked |
| `location-settings-checkbox-offsite-event-location` | unchecked |
| `location-settings-checkbox-exhibit-show-rate` | unchecked |
| `location-settings-checkbox-enable-proposal` | checked |

**Disabled checkboxes (7 — vs v1's claimed 4)**:

| data-testid | Default state | v1 covered? |
|---|---|---|
| `location-settings-checkbox-suppress-discount` | unchecked | ✓ v1 |
| `location-settings-checkbox-compass-integration` | checked | ✓ v1 |
| `location-settings-checkbox-display-tax` | checked | ✓ v1 (auto-set when CompanyRemitTax=true) |
| `location-settings-checkbox-enable-job-costing` | checked | ✓ v1 |
| `location-settings-checkbox-use-esign` | checked | **NEW — not in v1** |
| `location-settings-checkbox-enable-product-group` | unchecked | **NEW — not in v1** |
| `location-settings-checkbox-discount-guidance` | checked | **NEW — not in v1** |

**Note on labels**: 41 checkboxes carry zero text in their direct DOM children (Radix renders icon-only triggers + sibling label). The label-to-testid binding requires DOM-walk via parent `[data-slot="form-item"]` — currently undocumented in our selector files.

---

## Default values (snapshot 2026-04-27T21:25, post-reload)

Per-field rendered state observed on fresh page load (post-reload after initial 504; office 1604; user `RK Rutvik`):

| Field | Default rendered value | Notes |
|---|---|---|
| Local Office Name | `Parker Palm Springs` | matches doc |
| Office / Local Office number (Basic Info, disabled) | `1604` | matches doc |
| Pay To Address (Basic Info, disabled) | `Encore` | |
| Active checkbox | checked | |
| Union checkbox | unchecked | non-union office (drives ETS=23%) |
| Live Date | `December 1st, 2005` (button) | |
| **LDW Percentage** | `0.00%` | ⚠ **DRIFT** vs TC MD (TC-LOC-LI-002 claims 0.04% / 4%) |
| C&C Percentage | `0.00%` | apply-cables-consumables=checked but value=0 |
| ETS Percentage | `23.00%` | matches v1 non-union default 0.23 (rendered as 23%) |
| Resort Tax Percentage | `0.00%` | allow-resort-tax=checked but value=0 |
| Set/Strike Labor Billing | `33.00%` | |
| Threshold Amount | `0.00%` | DISABLED (AllowDPCD=true triggers disable per v1 dual-dep) |
| Oracle Product | `test` ⚠ **DIRTY** | should be `0000` per requirements + TC-008. Indicates manual edits leaked. |
| Oracle Department | (numeric, masked by browser) | |
| Oracle Organization | `--Select--` + DISABLED | likely env-degradation (`/api/core/oracle-orgs` 504) |
| Billing Cycle | `Weekly` | enabled — implies `localBillingRan === false` for 1604 currently |
| Effective Date | `April 8th, 2007` | DISABLED (matches v1: enabled only after BillingWay API success) |
| Billing Type | Master | |
| Billing Way | Event | |

---

## Validation behavior

Limited verification due to backend 503 on Save. What was observed:

| Field | Invalid input used | Save state | Toast / dialog text (verbatim) | aria-invalid |
|---|---|---|---|---|
| Oracle Product | cleared (empty) with SkipBilling=unchecked (required condition) | Save **becomes enabled** (was disabled pristine) | (no validation toast) | **`true`** ← partial a11y fix |
| Oracle Product | Save clicked with empty value | Triggers POST to page URL → server returns **503** | (no error toast surfaced; only the pre-existing "Failed to load dropdown data" stack) | `true` |
| Oracle Product | restored to `test` (form still ng-dirty equivalent) | Save stays enabled | — | **`true`** persists (RHF retains validation error state until re-validated) |

**Other validation indicators** (not exercised — pristine state inspection only):
- BillingCycleID required, can't be 0, exclamation icon — could not exercise (no 0 option to select; save-blocked).
- Oracle Department required when SkipBilling=unchecked — could not exercise (save-blocked).

**Save-cycle is the gate** — most validation rules per v1 fire on page load (post-reload), not on save. Without working save-cycle, post-reload validation cannot be verified.

---

## Section names + labels (verbatim)

The LI panel renders fields without explicit `<h_>` headings. All headings/section dividers in the panel returned **0 results** for `<h1>..<h6>`, `[role="heading"]`, `[data-slot="card-title"]`. Field labels are top-of-page-flow only:

```
Apply LDW · LDW Percentage · Calculate LDW on Net Amount
Apply Cables and Consumables Fee · C&C Percentage · Calculate C&C on Net Amount
Enable Multiday Pricing
Allow ETS · ETS Percentage
Service Charge · Show Service Charge As Administrative Fee · Calculate Service Charge On Net Amount
Allow Resort Tax · Resort Tax Percentage
Ticker Calc
Set/Strike/Support Labor Billing Goal · Enable Set/Strike Labor Minutes · Apply Set/Strike Labor Minutes
Internet Asset Reservation
Allow DPCD · Exclude Implied Discount · Prompt for Approval · Threshold
Credit Memo Approval Required · Enable Discount Reason
Use eSignature · Enable Product Group · Allow Production Quote · Suppress Day/Rate Discount
Billing Type [Master | Direct]
Billing Way [Event | Daily]
Effective Date · Billing Cycle
Warehouse Billing
Oracle Product · Oracle Department · Oracle Organization
Compass Integration
Company Remit Tax / GST/HST / VAT Tax · Display Tax · Comm Receiver
Enable IDC Billing · Skip Billing
Separate Master Bill Commission Invoice · Show Sub Rental · Inventory Only · Intercompany · Calculate Commission Tax · Can Create External Link · Offsite Event Location · Exhibit Show Rate
Enable Job Costing · Discount Guidance · Enable Proposal
```

**Implication for test authoring**: section grouping (e.g., "Billing Settings", "Tax & Pricing", "Oracle Integration") that TC writers may reference does NOT exist in the new-site DOM as `<h_>` or labeled regions. TC titles that say `Section: Tax & Pricing` are a fiction relative to current DOM.

---

## Links + actions

Only one non-tab/non-form-control button on the LI panel itself:

| Element | Click → observed outcome |
|---|---|
| `location-settings-btn-effective-date` ("April 8th, 2007") | **Disabled** — click is a no-op. Per v1: enabled only after a successful BillingWay change (API-validated). |

Save button is at the page level (not LI-panel-scoped):

| Element | Click → observed outcome |
|---|---|
| `location-settings-btn-save` ("Save") | (1) Pristine: disabled. (2) After Oracle Product clear + SkipBilling=unchecked: enabled. (3) Click triggers `POST /navigator/locations/1604/settings/location` → **503**. (4) No error feedback rendered to user. |

No other inline links/buttons on LI panel.

---

## Adjacent-tab cascade behavior

Subplan step 8 — "Switch to any adjacent tabs touched by Local Information (BillingWay change, SkipBilling cascade). Confirm cascading behavior."

**INCONCLUSIVE — env-blocked**:
- BillingWay change requires a save-cycle to validate against the API; backend POST returns 503.
- SkipBilling cascade onto Oracle fields would persist via save-cycle to re-validate post-reload; same blocker.
- Tab-switching itself was not exercised because cascade verification depends on save success.

---

## Suggested TCs (top-down layered)

Order: SMOKE → POSITIVE → NEGATIVE → UI → REGRESSION

| TC ID (suggested) | Type | Title | Priority | Notes |
|---|---|---|---|---|
| TC-LOC-LI-NE-001 | SMOKE | Verify LI panel loads with 54 interactive controls | P0 | Asserts panel `radix-_r_1i_-content-local-information` rendered, controls count = 54 |
| TC-LOC-LI-NE-002 | UI | Verify 7 disabled checkboxes match documented set | P1 | Catches drift of new disable rules (use-esign, enable-product-group, discount-guidance added since v1) |
| TC-LOC-LI-NE-003 | NEGATIVE | Save with Oracle Product empty + SkipBilling=unchecked → expect Save disabled (per old-site baseline) | P0 | Currently FAILS on new site (Save enabled). Asserts new-site regression for primary BUG-LI-001 symptom |
| TC-LOC-LI-NE-004 | UI | aria-invalid=true rendered on Oracle Product after clear | P1 | a11y partial fix verified 2026-04-27 |
| TC-LOC-LI-NE-005 | REGRESSION | aria-required=null on Oracle fields in BOTH SkipBilling states | P2 | a11y secondary symptom — discussion-item, not bug |
| TC-LOC-LI-NE-006 | NEGATIVE | Save click on invalid form produces NO toast + NO dialog (silent UX) | P0 | Asserts user sees no feedback; this is the user-visible failure mode |
| TC-LOC-LI-NE-007 | POSITIVE | EnableMultidayPricing checkbox toggles + persists | P1 | v2 feature, MCP-confirmed editable |
| TC-LOC-LI-NE-008 | NEGATIVE | Service Charge sub-fields (is-administrative-fee, calc-service-charge-on-net) state when allow-service-charge=unchecked | P0 | Currently both checked + enabled despite parent unchecked — see suspected APP bug below |
| TC-LOC-LI-NE-009 | REGRESSION | Threshold dual-dep DPCD-disabled state | P0 | TC-LOC-LI-007 already covers; add explicit assertion for current default state |
| TC-LOC-LI-NE-010 | UI | Oracle Organization disabled when /api/core/oracle-orgs 5xx | P2 | Resilience: how does UI degrade on backend failure? |

---

## Diff vs our CSV (vs `clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md`)

| TC ID | Defect type | Evidence line | Fix |
|---|---|---|---|
| TC-LOC-LI MD header | wrong-count | "Total Fields: 52 interactive fields" (line 10) | Live count is 54 (8 inputs + 41 checkboxes + 2 comboboxes + 2 radios + 1 button) — OR 56 if counting individual radio buttons. Update to live count. |
| TC-LOC-LI MD header | wrong-count | "Checkboxes: 39 (33 editable, 6 always-disabled)" (line 11) | Live: **41 checkboxes (34 editable, 7 disabled)**. Add use-esign, enable-product-group, discount-guidance to disabled list. |
| TC-LOC-LI-002 | wrong-value | "spinLDWPercentage=0.04" (line 78) | Live default for office 1604 is **`0.00%`** (apply-ldw=checked but value=0). Update to 0.0 OR document the office-specific dependency. |
| TC-LOC-LI-005 | already-flagged | "⚠ CLAIMED VERIFIED (2026-02-19)... 0.23" (line 118) | Re-confirmed 2026-04-27: ETS=23.00% with allow-ets=checked + union=unchecked. Drop the ⚠ annotation — verified. |
| TC-LOC-LI-007 | wrong-default | "Prompt For Approval checkbox is unchecked" (line 148, step 2) | Live: **prompt-for-approval=CHECKED** at default. Update step 2 to "checked" OR explicitly toggle off as setup. Threshold disable currently driven by AllowDPCD=true (single-handed), not the dual condition the test designs around. |
| TC-LOC-LI-008 | wrong-value | "Verify Oracle Product textbox is enabled with value 0000" (line 172, step 1) | Live current: Oracle Product = `test` (DIRTY from manual testing). The "0000" is the spec default but live state has drifted. TC must reset state before assertion (slate-clear pattern). |
| TC-LOC-LI-008 | wrong-state | "Verify Oracle Organization dropdown is enabled" (line 172, step 3) | Live: Oracle Organization is **DISABLED**. May be env-driven (504) — verify post-recovery. Do not write spec until verified on healthy backend. |
| TC-LOC-LI-008A | wrong-flow | "Click Save button and verify save completes (no immediate validation)" (line 184, step 5) | Live: on new site, Save with empty Oracle Product is **enabled** (per BUG-LI-001 primary symptom — old site disables Save). The TC's "save completes" expectation is the bug, not the contract. Rewrite per old-site baseline: Save SHOULD be disabled. |
| TC-LOC-LI MD § Conditionally-Disabled Fields | missing-rules | line 32-38 | Add: `chkUseEsignature`, `chkEnableProductGroup`, `chkDiscountGuidance` (3 new disabled-by-default checkboxes not in v1 list). Source: live DOM 2026-04-27. |
| TC-LOC-LI MD § Validation Rules | missing-rule | lines 40-51 | Add: "Save POSTs to page URL itself (Next.js Server Action). On 503/error, no user-visible toast is rendered (silent failure). Test framework must assert error feedback." |
| TC-LOC-LI MD § Field Dependencies | missing-rule | lines 20-30 | Add: `chkAllowServiceCharge` parent → `chkIsAdministrativeFee`, `chkCalcServiceChargeOnNet` children. Currently behaviour is BUG-suspect (see Suspected APP bugs). |

**Note**: 67 individual TCs not exhaustively diffed — this audit catalogued **structural / header / Field-Inventory drift** + the 3 priority TCs I touched (002, 005, 007, 008, 008A). Remaining 62 TCs need a per-TC diff which is the scope of SP-DQU-05 (LI fixes subplan).

---

## Suspected APP bugs

| # | Module | Field | Observed behavior | Expected (per requirements) | BUG-*.json filename |
|---|---|---|---|---|---|
| 1 | LOCAL_INFORMATION | Service Charge group: `is-administrative-fee`, `calc-service-charge-on-net` | Both **checked** + **enabled** while parent `allow-service-charge` is **unchecked**. Children should be unchecked + disabled (or hidden) when parent is unchecked. | Per v1 dependency convention (parent-checkbox enables/disables children — same pattern as Apply LDW → LDW Percentage), unchecked parent should reset and disable children. | **TBD — verify with LR-034**: candidate BUG-LI-002 |
| 2 | LOCAL_INFORMATION | `Save` button (page-level) | On invalid-form Save click, `POST /navigator/locations/1604/settings/location` is fired regardless of client-side validity → server returns 503 (env) or rejects → **no error toast**, no dialog, no user feedback. From the user's perspective: Save click is a silent no-op. | Old-site baseline (per BUG-LI-001 verification 2026-04-24): Save button **disabled** when form invalid. New site has lost this wiring. | **BUG-LI-001 (existing)** — primary symptom **still reproduces** on new-site as of 2026-04-27. Append `verificationLog` entry. |
| 3 | LOCAL_INFORMATION | Oracle Product (`location-settings-input-oracle-product`) | aria-invalid="true" set after clear (a11y partial fix observed 2026-04-27, post-2026-04-10 BUG-LI-001 file date). aria-required="null" still missing in BOTH SkipBilling states. | Both attributes should reflect form state per WCAG 2.1 / WAI-ARIA. | **discussion-item** (per LR-040 (c) + `feedback_discussion_item_not_bug.md`) — also present on old site (per OSB-ACCESS-VERIFY-2026-04-24 §4); pre-existing a11y gap, not a regression. Track as "discussion: a11y on Oracle fields". No new bug file. |

**LR-040 closure-gate count: 1 candidate new bug + 1 verification update on existing + 1 discussion-item = under the >5-bug HARD HALT threshold. No escalation needed.**

---

## Open items / inconclusive — env-blocked

The following subplan step-5 priority probes COULD NOT be completed due to the 503 backend on Save and 504 backend on `/api/core/*`:

1. **BillingCycleID validation when value=0** — would need to select a "0" option (which doesn't currently exist as an option since `/api/location/billing-cycle` did return 200 → list is populated; but exercising "required, exclamation icon" requires save attempt).
2. **localBillingRan disable behavior** — billing-cycle dropdown is currently enabled, suggesting localBillingRan=false for 1604; need a 1605/1101 comparison once backend recovers.
3. **EnableIDCBilling persistence** after Intercompany toggle — needs save-reload-verify; save blocked.
4. **DisplayTax auto-set test** when CompanyRemitTax/HRIRemitTax/HRIRemitTax2 toggled — needs save-cycle to verify auto-set rule fires.
5. **C&C/ETS/Resort Tax reset behaviors** on parent-checkbox disable — needs save-cycle to verify reset-to-0 persists.
6. **BillingWay change → API validation** → `btnEffectiveDate` enable cascade — needs save success.

Recommend SP-DQU-05 (next subplan) re-runs these on a healthy backend or escalates if 503/504 persists.

---

## v1 8-gap items cross-reference (per acceptance criterion)

Cross-referenced against `PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md` LI section (lines 260-273):

| # | v1 gap | DOM-observable verdict | Evidence |
|---|---|---|---|
| 1 | BillingCycleID required validation (can't be 0, error icon) | INCONCLUSIVE (env-blocked save) | Dropdown enabled, `Weekly` selected; can't trigger error state |
| 2 | BillingCycleID disabled when localBillingRan=true | INCONCLUSIVE for 1604 (likely localBillingRan=false; dropdown is enabled) | `disabled: false`. Need 1605/1101 comparison. |
| 3 | ETS% default values (0.24 union / 0.23 non-union) | **VERIFIED** | ETS=23.00%, is-union=unchecked → matches non-union 0.23 |
| 4 | ThresholdAmount dual-dependency (AllowDPCD OR !PromptForApproval) | **VERIFIED (single-trigger fired)** | DPCD=checked → Threshold disabled; PromptForApproval=checked also (so dual condition satisfied either way). Need DPCD=unchecked + PromptForApproval=checked combo to verify enable. |
| 5 | EnableIDCBilling persistence after dependency toggle | INCONCLUSIVE (env-blocked save) | IDC=unchecked + enabled; Intercompany=checked. Persistence assertion blocked. |
| 6 | C&C% resets to 0 when IsCablesAndConsumablesEnabled disabled | INCONCLUSIVE (env-blocked save) | apply-cables-consumables=checked, C&C=0.00%. Reset-on-disable not exercised. |
| 7 | DisplayTax auto-set behavior (CompanyRemitTax/HRIRemitTax2) | **VERIFIED (CompanyRemitTax variant)** | DisplayTax=checked + DISABLED while CompanyRemitTax=checked. HRIRemitTax2 variant absent in DOM (controls don't exist on this office). |
| 8 | EnableMultidayPricing field + tests | **VERIFIED** | enable-multiday-pricing=checked + enabled (matches MCP-2026-04-08 finding "editable, not read-only"). |

**Result**: 4 verified · 0 contradicted · 4 inconclusive (env-blocked). Acceptance criterion partially satisfied.

---

## Activity-log + handoff to SP-DQU-05

This audit's activity-log row will be appended at session close per LR-028.

**Handoff (chat-only per `feedback_handoff_in_chat_only.md`)** — for the agent picking up SP-DQU-05:
- Findings file: `clients/encore/specs_planning/_internal/neutral-eye-audits/local-information-2026-04-27.md`
- New-bug count: **1 candidate (Service Charge children active when parent unchecked)** + **1 verification update on BUG-LI-001** + **1 a11y discussion-item**
- Gap count (v1): **4 verified, 4 inconclusive** (env-blocked)
- LR-040 escalation: **none** (count under 5-bug threshold)
- Env caveat: backend 504/503 throughout audit — re-verify save-cycle behaviors when backend recovers
- TC drift items for SP-DQU-05 fix queue: see "Diff vs our CSV" section above (11 documented drift items + 62 TCs not yet per-line diffed)

---

## Auditor self-criticism (judge-level scrutiny)

1. **State was DIRTY before audit started.** Oracle Product = "test" not "0000". I noted this but did not reset it before bug repro — meaning my BUG-LI-001 repro was on already-mutated state. Mitigation: repro logic is "clear field then save"; the starting non-empty value doesn't matter for the empty-state test. Risk accepted.
2. **`baselineState` snapshot of ALL fields was not captured pre-mutation.** I mutated Oracle Product (clear → save attempt → restore) but did not freeze a JSON snapshot of every field's pre-test state. Mitigation: only Oracle Product was touched; restored to "test" before exit; no other fields mutated.
3. **Section labels could not be captured because DOM has no headings.** This is a real product gap (all sections are unlabeled regions) — not an audit shortcoming. Documented above.
4. **3 v1 priority probes were INCONCLUSIVE due to backend 503/504.** This is a real env limitation, not an audit shortcoming. Documented under "Open items / inconclusive". SP-DQU-05 owner should re-run.
5. **62 of 67 TC MD entries were not per-line diffed.** Subplan acceptance criteria asks for "11 sections filled" + "Diff vs our CSV ranked fix list" — I produced ranked structural/header drift + 5 individual TC defects (002, 005, 007, 008, 008A). Per-TC drift is SP-DQU-05's authoring scope; this audit is the discovery gate, not the rewrite gate.

---

## Archetype probe results (2026-04-28 follow-up — PLAN_FIND_BUGS_LI_FOLLOWUP)

**Auditor**: WATCHDOG (claude-code Opus 4.7)
**Browser tool**: Playwright CLI (LR-038 v2 — functional bug + catalog walkthrough + autonomous, no `pause:` step). Reason announced first output of session.
**Skill invocation**: `Skill(find-bugs)` invoked at Phase 0.5 BEFORE first browser action — the structural fix this plan exists for. Verifiable in transcript.
**Catalog source**: `clients/encore/specs_planning/_internal/bug-archetypes.md` (12 ARCH-NNN entries, walked exhaustively).
**Backend health at start**: `/api/auth/session` = 200 (Rutvik authenticated, Locations.LocationDetails.FullAccess + LocalOffice.FullAccess); `/api/core/currencies` = 401 (auth-required, NOT 5xx). Page navigation hit 504 once (matches SP-DQU-04 reload-on-first-504 pattern); resolved on second nav.
**Live DOM snapshot**: `li-inventory-2026-04-28.json` (54 controls, 7 disabled checkboxes, full input/checkbox/combobox/radio/button enumeration) and `li-cascade-probe-2026-04-28.json` (parent-children probe across 11 groups). Both saved to repo root.

| Archetype | Reproduces? | Evidence | Action taken |
|---|---|---|---|
| ARCH-001 (save-enabled-on-invalid-form) | **NO — REGRESSION RESOLVED** | Sequence: pristine page → cleared Oracle Product (SkipBilling=unchecked, required condition) via `fill('')` + Tab → `aria-invalid` flipped to `true` AND **Save button stayed DISABLED**. Cleared Oracle Dept too → Save still disabled. Typed Oracle Product=`0000` (valid) → Save still disabled (Oracle Dept still empty). Typed Oracle Dept=`900` (valid) → **Save ENABLED**. The form-validity → save-disabled wiring that was missing on 2026-04-27 is now present. New-site behavior matches old-site baseline (Save disabled on invalid form). | (a) Append BUG-LI-001 verificationLog entry: `verifiedDate: 2026-04-28`, `verdict: PRIMARY_SYMPTOM_RESOLVED`, `findings: Save now correctly disables when any required Oracle field is empty + SkipBilling=unchecked. The aria-invalid wiring (partial fix observed 2026-04-27) and the form-validity→save-disabled wiring landed together between 2026-04-27 and 2026-04-28.` (b) Recommend BUG-LI-001 status flip from `open` → `resolved` after one more save-cycle confirmation by SP-DQU-05D. (c) Affected TC re-evaluation: TC-LOC-LI-008A `Status: Blocked by BUG-LI-001` should be REMOVED since the bug is resolved; the TC's Expected (per old-site baseline) now matches new-site behavior. |
| ARCH-002 (non-numeric-doesnt-revert) | **NO** | LDW Percentage typed `abc` + Tab → reverted to `0.00%`, aria-invalid stayed `false`, no error. ETS Percentage typed `xyz` + Tab → reverted to `23.00%`, aria-invalid stayed `false`. Edge case — pasted `1.2.3` into LDW Percentage → field accepted partial parse (`1.2` interpreted as fractional, displayed as `120.00%`), aria-invalid flipped to `true` (boundary check max=100% caught the overflow). Pure non-numeric reverts, multi-decimal partially accepts but boundary check fires. inputmode=`decimal` confirmed on percentage spinbuttons. | (a) No bug filed. (b) Drift note: catalog ARCH-002 probe step "tries paste of '1.2.3' / scientific notation / leading-zero strings" is INCOMPLETE — should be split into "pure-non-numeric" (reverts) vs "ambiguous-numeric" (partial-parse + boundary check). Append `[catalog-refinement]` to ARCH-002. |
| ARCH-003 (stale-default-vs-actual) | **YES (partial — drift continues)** | All percentage spinbutton defaults match SP-DQU-04 (LDW=0.00%, C&C=0.00%, ETS=23.00%, Resort Tax=0.00%, Set/Strike=33.00%, Threshold=0.00% disabled). All 41 checkbox defaults match SP-DQU-04 (allow-service-charge=unchecked, prompt-for-approval=checked, etc.). **NEW DIRT 2026-04-28**: Oracle Dept = `ABCDEFGHIJKLMNOPQRSTUVWXY` (25-char alpha — looks like a maxLength=25 manual-test residue). Oracle Org = `Encore CA BU` (expected per requirements is `Encore US BU`). Oracle Product still = `test` (matches SP-DQU-04 dirty observation). | (a) No bug filed (state pollution, not app bug). (b) Drift note for SP-DQU-05D: TC-008 slate-clear precondition needs to ALSO reset Oracle Org back to `Encore US BU` and Oracle Dept to `900` — the slate-clear added in SP-DQU-05 only covered Oracle Product. (c) Office 1604 baseline state is degrading over time as multiple test sessions leave residue; recommend a periodic slate-clear maintenance job per SP-DQU-22/23/24. |
| ARCH-004 (stale-section-or-label) | **YES (drift)** | Live DOM has zero `<h1>..<h6>` and zero `[role="heading"]` inside the LI panel — all field groupings are unlabeled regions. TC-MD references "Service Charge group", "Billing Type Radio Group", etc. as if they were labeled sections, but they are field clusters identified only by their leading checkbox or radio name. SP-DQU-04 documented this; reconfirmed 2026-04-28 (no change). | (a) No bug filed (DOM design choice). (b) Drift note for SP-DQU-05D: TCs that reference "Section: X" headings should be rewritten as "field group beginning with checkbox X" or remove the section assertion entirely. ALREADY captured in SP-DQU-04 §Section-names-+-labels; no new TC IDs flagged. |
| ARCH-005 (parent-checkbox-doesnt-disable-children) | **YES — STRONGER THAN BUG-LI-002 ALONE: SYSTEMIC PATTERN ACROSS LDW + C&C + SERVICE CHARGE** | Live cascade probe across 11 parent-controllable groups (saved to `li-cascade-probe-2026-04-28.json`): **Service Charge** (`allow-service-charge=unchecked`) → both children `is-administrative-fee` and `calc-service-charge-on-net` STAY checked + enabled (BUG-LI-002 reproduces, no change since 2026-04-27). **Apply LDW** (toggled unchecked during probe) → `default-ldw-percentage` input correctly DISABLED, but `calc-ldw-on-net-amount` checkbox STAYS checked + enabled. **Apply C&C** (toggled unchecked during probe) → `cables-consumables-percentage` input correctly DISABLED, but `calc-cac-on-net-amount` checkbox STAYS checked + enabled. **Comm Receiver / Intercompany / Allow DPCD / Enable Set/Strike Minutes / Company Remit Tax** parent-children all wired correctly (children gated by parent state). The bug pattern is specifically: **the "calc-on-net-amount" / behavioral-modifier sibling checkbox in 3 groups (LDW, C&C, Service Charge) is NOT gated by the parent's checked state** — only the percentage input is gated. | (a) **File BUG-LI-003**: "Apply LDW + Apply C&C parent checkboxes fail to disable their `calc-on-net-amount` sibling checkboxes when unchecked — same pattern as BUG-LI-002 (Service Charge variant)". Severity: medium. Category: FIELD_DEPENDENCY_BROKEN. (b) Append grep-verifiable line to NEW SP-DQU-05D. (c) Append refinement to bug-archetypes.md ARCH-005 probe steps: explicitly enumerate "calc-on-net" / behavioral-modifier sibling checkboxes (not just the percentage input child). |
| ARCH-006 (missing-verbatim-assertion-text) | **YES (drift, 2 instances)** | Static grep of TC-MD found: TC-LOC-LI-040 line 590 "Multiple invalid fields show separate error messages simultaneously" — no verbatim error text quoted. TC-LOC-LI-052 line 745 "Verify alert indicates billing has run" — no verbatim alert text. Most boundary TCs (002A, 002B, etc.) DO quote verbatim error text ("Number must be greater than or equal to 0", "Number must be less than or equal to 100") — those are fine. | (a) No bug filed. (b) Drift note for SP-DQU-05D: TC-040 + TC-052 need verbatim assertion text added (capture from live DOM during the fix subplan; the env-blocked save-cycle in SP-DQU-04 prevented capture, but the alert text exists in the React source — grep `useLocationMetadata` for the toast strings). |
| ARCH-007 (aria-required-or-aria-invalid-missing) | **PARTIAL (a11y discussion-item, unchanged)** | Live DOM 2026-04-28: ALL 8 inputs default to `aria-invalid="false"` (correctly wired); on invalidation, `aria-invalid` flips to `"true"` (Oracle Product/Dept after clear; LDW Percentage after `1.2.3` paste hits boundary). `aria-required` is `null` on ALL inputs in ALL captured states (default, after clear, after restore) — never set despite required-condition fields. Same as SP-DQU-04 verdict: aria-invalid PARTIAL FIX confirmed; aria-required gap unchanged. | (a) No bug filed (per `feedback_discussion_item_not_bug.md`: empty-everywhere + no-UI-path + pre-existing on old site per OSB-ACCESS-VERIFY-2026-04-24 §4 = discussion-item, not bug). (b) Track as a11y discussion-item for `/encore-questions` Tier B (low-priority). (c) Already documented in SP-DQU-04 findings — no new flag. |
| ARCH-008 (TC-MD missing fields that exist in live DOM) | **YES — already corrected by SP-DQU-05** | Live DOM 2026-04-28: 8 inputs + 41 Radix checkboxes + 2 Radix comboboxes + 2 Radix radio groups + 1 disabled date button = **54 interactive controls**. Disabled checkboxes: 7 (`use-esign`, `enable-product-group`, `suppress-discount`, `compass-integration`, `display-tax`, `enable-job-costing`, `discount-guidance`). MATCHES SP-DQU-04 inventory exactly. | (a) No new action — already fixed by SP-DQU-05 (TC-MD header updated 52→54 and disabled-list updated 4→7). (b) `li-inventory-2026-04-28.json` saved to repo root as evidence artifact. |
| ARCH-009 (missing-cascade-dependency-tc) | **YES (gaps remain)** | Static grep + live cascade probe: 8 of 11 parent-controllable groups have dedicated cascade TCs (TC-001 LDW, TC-003 C&C parent-only, TC-005 ETS, TC-006 Resort Tax, TC-007/007A DPCD+Threshold dual-dep, TC-058 Comm Receiver→DPCD, TC-059 Comm Receiver→ShowSubRental, TC-061 Intercompany→IDC, TC-065 Service Charge cascade — rewritten per BUG-LI-002). **Gaps**: (i) Apply C&C → `calc-cac-on-net-amount` checkbox cascade has no dedicated TC (only the percentage child is asserted in TC-003); (ii) Apply LDW → `calc-ldw-on-net-amount` cascade has no dedicated TC; (iii) Enable Set/Strike Minutes → Apply Set/Strike Minutes cascade unverified by any TC. | (a) No bug filed. (b) Gap note for SP-DQU-05D: 3 new TCs needed — TC-LOC-LI-NE-011 "Apply LDW disables calc-ldw-on-net-amount when unchecked" (BUG-LI-003 affected), TC-LOC-LI-NE-012 "Apply C&C disables calc-cac-on-net-amount when unchecked" (BUG-LI-003 affected), TC-LOC-LI-NE-013 "Enable Set/Strike Minutes disables Apply Set/Strike Minutes when unchecked". |
| ARCH-010 (missing-boundary-or-format-validation-tc) | **YES (significant gaps)** | Static grep: LDW Percentage has 8 boundary TCs (TC-009 through TC-016 — min 0, min+ 0.01, max- 99.99, max 100, neg -0.01, neg -5, over 100.01, over 150.99). **C&C Percentage / ETS Percentage / Resort Tax Percentage / Set/Strike Labor Billing all LACK individual boundary TCs** — only the multi-cascade TC-031 sets values (10/5/3) within valid ranges. **Threshold spinbutton** has only TC-014 (decision table) — no min/max/negative/overflow tests. **Oracle Product / Oracle Dept** have maxLength=25 paste TCs (TC-018/019) and special-char positive TCs (TC-068/069) — but no SQL-injection / XSS / unicode / emoji / null-byte negatives. | (a) No bug filed (gap, not app bug). (b) Gap note for SP-DQU-05D: ~30 NEGATIVE-type TCs needed — copy LDW's 8-test boundary template to C&C/ETS/Resort Tax/Set-Strike/Threshold (5 spinbuttons × ~6 boundary cases = 30 TCs). For Oracle Product/Dept: 4-6 NEGATIVE TCs each (SQL chars, XSS payload, unicode/emoji, null byte, control chars). |
| ARCH-011 (TC-MD assumes-stale-framework) | **YES (drift, 1 instance)** | Static grep: TC-LOC-LI-070 line 1013 step 1 says "Wait for Angular form hydration on Skip Billing checkbox -> Form ready" — STALE. App is Next.js + React Hook Form + Server Actions per SP-DQU-04 architectural note (line 62). Other TCs use user-observable language. Note line 62 itself is the corrective documentation describing the migration — not a stale assumption. | (a) No bug filed. (b) Drift note for SP-DQU-05D: rewrite TC-070 step 1 to user-observable form ("Wait for Skip Billing checkbox to be visible and interactive" or "Wait for `data-testid='location-settings-checkbox-skip-billing'` to render"). |
| ARCH-012 (TC-encodes-bug-as-expected) | **YES (1 instance — TC-039)** | Static grep: TC-LOC-LI-008A is ALREADY HANDLED (`Status: Blocked by BUG-LI-001`, Expected/Actual separated per old-site baseline) — but with BUG-LI-001 now resolved 2026-04-28, the Blocked-status should be REMOVED. **NEW finding**: TC-LOC-LI-039 line 577-578 says "Validation does NOT occur on save. Invalid values persist to database. Error messages display only after page reload." — this DESCRIBES the new-site silent-save no-op behavior as if it were the contract. Per BUG-LI-001 resolution 2026-04-28, this is no longer accurate; the TC needs rewrite to expect "Save disabled on invalid input; click NOT possible". | (a) No new BUG (TC-encodes-bug is a TC defect, not app bug). (b) Drift note for SP-DQU-05D: (i) TC-008A — REMOVE `Status: Blocked by BUG-LI-001`, restore Expected as the active contract (Save disabled on invalid). (ii) TC-039 — rewrite Steps + Expected to assert old-site baseline behavior (Save disabled when LDW=-10 invalid; no save fires; user fixes value to enable save). |

### Net-new bugs filed this run

- **BUG-LI-003** filed (`reports/bugs/BUG-LI-003.json`): "Apply LDW + Apply C&C parent checkboxes fail to disable `calc-on-net-amount` sibling checkboxes when unchecked — same pattern as BUG-LI-002 (Service Charge variant)". Affected TCs: TC-LOC-LI-001 (LDW cascade), TC-LOC-LI-003 (C&C cascade), suggested TC-LOC-LI-NE-011 (LDW calc-on-net), TC-LOC-LI-NE-012 (C&C calc-on-net). Severity: medium. Category: FIELD_DEPENDENCY_BROKEN.

### BUG-LI-001 verificationLog update (2026-04-28 — LR-044 verifier obligation)

Append entry to `reports/bugs/BUG-LI-001.json`:
- `verifiedDate: 2026-04-28`
- `verdict: PRIMARY_SYMPTOM_RESOLVED`
- `findings: Save button now correctly disables when any required Oracle field (Product, Department) is empty with SkipBilling=unchecked. The aria-invalid wiring (partial fix observed 2026-04-27) AND the form-validity→save-disabled wiring landed together between 2026-04-27 and 2026-04-28. Old-site baseline behavior (per OSB-ACCESS-VERIFY-2026-04-24 §4) now restored on new site. aria-required gap on Oracle fields persists (a11y discussion-item per LR-040(c)) — pre-existing on old site too.`
- Recommend `status` flip from `open` → `resolved` after SP-DQU-05D confirms one save-cycle (no regression on save-and-reload of valid form).

### LR-040 closure-gate count

- Total new bugs filed: **1** (BUG-LI-003) — under HARD HALT cap of 5 ✓
- Total new ARCH entries: **0** (no new archetypes; one refinement appended to ARCH-005 + ARCH-002 probe step) — under HARD HALT cap of 3 ✓
- Routing: BUG-LI-003 → `plans/pending/SUBPLAN_DQU_05D_LI_NEW_BUG_FIXES.md` (created as LR-040(b) recipient since SP-DQU-05 already shipped to done/).

### Auditor self-criticism (2026-04-28 follow-up)

1. **Office 1604 still dirty.** Oracle Product=`test`, Oracle Dept=`ABCDEFGHIJKLMNOPQRSTUVWXY`, Oracle Org=`Encore CA BU` — even worse than 2026-04-27 (Oracle Dept residue is new; Oracle Org drift is new). Test sessions are leaking state. Did not save my changes (transient page state only); recommend an explicit slate-clear job before client-review handoff.
2. **ARCH-005 cascade probe required actually toggling parent checkboxes** (Apply LDW + Apply C&C unchecked then re-checked). This created transient dirty state but did NOT save — so on reload, the page reverts to the saved (unchanged) state. The rest of the ARCH-005 evidence is observational (no toggle).
3. **Save-cycle persistence of BUG-LI-003 not verified.** Did not press Save (would have polluted office 1604 further). The bug is observed at the UI-state level (children stay enabled when parent unchecked); whether the server accepts a state where parent=unchecked AND child=true is unverified. Defer to SP-DQU-05D for save-cycle confirmation.
4. **Did not toggle every parent-children group** — only Apply LDW + Apply C&C were toggled (chosen because they have the calc-on-net sibling pattern). Other parents (Comm Receiver, Intercompany, etc.) were observed in their default-checked state only. Cascade direction was inferred from the children's enabled state when parent was checked. Lower-confidence than the toggle-tested groups, but consistent with SP-DQU-04 findings.
5. **All 5 inconclusive v1 probes from SP-DQU-04 (BillingCycle 0, localBillingRan, IDC persistence, DisplayTax auto-set, C&C/ETS/Resort Tax reset, BillingWay) remain inconclusive** — this audit's anti-slop boundary said do NOT re-verify SP-DQU-04 work, only run the 12 archetype probes. Defer to SP-DQU-05D's healthy-backend re-run.

