# PLAN: Requirements-Driven Test Quality Upgrade

**Created**: 2026-04-03
**Status**: Pending (strategic plan — subplans per page created in separate sessions)
**Priority**: P5-PARKED
**Depends on**: Nothing — this is additive
**Does NOT modify**: `PLAN_V2_REQUIREMENTS_GAPS.md` (that plan is approved and ready; its SP items are REFERENCED here, not duplicated)

---

## Context

**Problem**: All 204 test cases across 11 specs were written BLACK-BOX — observing the UI without knowing internal validation rules. No one trusts they're good enough.

**What changed**: We now have WHITE-BOX requirements documents from manual QA and Jira:
1. `Functional Requirements v1` (349KB) — exact validation rules, conditional logic, error messages, dependencies per component
2. `Encore-Requirements-V2` — field-level behaviors, Jira-traced acceptance criteria
3. `PriceGuideInclusion/EnableMultidayPricing` requirements — 2 new checkbox fields

**What this plan does**: Use the new requirements as the specification baseline to find EVERY gap in existing tests, then fill those gaps per-page via subplans.

**What's NOT our scope**:
- `NM-1331` — Unit tests for Location Settings (client's React Testing Library tests, not E2E)
- `NM-1334` — Backend API refactor for Pricebook. Two document versions reviewed (v1 and v7). API response contract to frontend unchanged — internal refactor only. No E2E test impact.
- `Requirements_Document temp Encore.docx` — Empty template, no requirements content

### Already Covered by Existing Tests (no gap)

| Requirement | Coverage | Test Reference |
|-------------|----------|---------------|
| PriceGuideInclusion (editable checkbox on Pricing) | Full: toggle + save + reload persistence | TC-LOC-PRI-024, selector `chkPriceGuideInclusive` |
| Phone1 required (Account & Address) | Full: 5 tests cover required validation | TC-LOC-ACC-015, TC-LOS-BAS-015–018 |
| UseAvailability chain (Local Office) | Full: Fulfillment→QC dependency | TC-LOS-BAS-012/013 |
| EnableIDCBilling basic toggle (Local Info) | Basic dependency: uncheck Intercompany → IDC disabled+unchecked | ACTIVE_DEPENDENCIES loop (spec line 105-114), data entry lines 204-209. **Persistence gap remains.** |

---

## REGRESSION GUARD

**These artifacts are PROTECTED — this plan does NOT modify them:**
- `plans/done/PLAN_V2_REQUIREMENTS_GAPS.md` — approved, ready to implement. SP-01 through SP-06 items are REFERENCED below where they overlap with requirements gaps. When V2 plan executes, those items get checked off in BOTH plans.
- `plans/done/PLAN_ALL_PAGES_TEST_COVERAGE_AUDIT_AND_FIX.md` — its 6-section audit template is REUSED as the skeleton for per-page subplans below, enriched with requirements traceability.
- All existing spec files, page objects, selectors, and test data — NO changes until a subplan is approved.

**Relationship to existing plans:**
| Existing Plan | This Plan's Relationship |
|---------------|-------------------------|
| PLAN_V2_REQUIREMENTS_GAPS (SP-01–SP-06) | REFERENCES items where they overlap. V2 plan executes independently. |
| PLAN_ALL_PAGES_TEST_COVERAGE_AUDIT_AND_FIX | REUSES its audit template. Coverage audit executes as PART of each subplan below. |
| PLAN_PRICING_TEST_COVERAGE_AUDIT_AND_FIX | Pricing already audited separately. This plan adds 3 NEW v1 rules to pricing scope. |

---

## Adversarial Audit Results (2026-04-03)

Before finalizing, every claim was verified against the codebase:

| Claim | Verified | Correction |
|-------|----------|------------|
| "269 test cases" | **FALSE** | Actual: **204 tests** across 11 specs |
| "Phone1 required NOT tested" | **FALSE** | **IS tested** — 5 tests (TC-LOC-ACC-015, TC-LOS-BAS-015–018) |
| "UseAvailability chain NOT tested" | **FALSE** | **IS tested** — Fulfillment→QC chain (TC-LOS-BAS-012/013) |
| "DISABLED_CHECKBOXES = 4 entries" | TRUE | chkSuppressDayRateDiscount, chkCompassIntegration, chkDisplayTax, chkEnableJobCosting |
| "EnableMultidayPricing NOT tested" | TRUE | Zero matches in codebase |
| "Section grid duplicate NOT tested" | TRUE | No duplicate validation test exists |
| "BillingCycleID validation NOT tested" | TRUE | Only disabled-state check exists, no value validation |
| "ThresholdAmount dual-dep NOT fully tested" | TRUE (partial) | TC-LOC-LI-007 tests conditional enablement (AllowDPCD + PromptForApproval), but not all combos or reset-to-0 behavior |
| Coverage audit plan lists 9 specs | TRUE | But test counts in that plan are stale (e.g., local-info shows 12, actual is 16) |

**Gap count after audit: 20 verified items** (down from 22 — Phone1 and UseAvailability removed as false positives).

---

## Extracted Requirements Data (from .docx files — embedded here so future sessions don't need to re-read binary docs)

### SOURCE 1: Functional Requirements v1 (`docs/read_only_docs/Functional Requirement -v1.docx`)

#### Local Information Component (location-detail-local-information.component.ts)

**Field Validations:**

| Field | Rule | Error Key | Condition | Error Message |
|-------|------|-----------|-----------|---------------|
| BillingWayEffectiveDate | Date cannot be in past | pastDate | Date must be >= today (midnight) | ERR_BILLINGWAY_DATE |
| OracleOrgId | Required when SkipBilling disabled | billingReq | !SkipBilling and OracleOrgId < 1 | ERR_REQUIRED |
| OracleProductCode | Required when SkipBilling disabled | — | [required]="!locationDetailForm.get('SkipBilling')?.value", max 25 chars | ERR_REQUIRED |
| OracleDeptCode | Required when SkipBilling disabled | — | Same as OracleProductCode, max 25 chars | ERR_REQUIRED |
| BillingCycleID | Required, cannot be 0 | — | Exclamation icon when value is 0. Disabled if localBillingRan === true. Info: BILLING_CYCLE_MSG | ERR_REQUIRED |

**Conditional Field States:**

| Field | Disabled When | Reset Behavior |
|-------|--------------|----------------|
| LDWPercentage | !canEditLoc OR !IsLDWEnabled | Reset to 0 when IsLDWEnabled disabled |
| CablesAndConsumablesPercentage | !canEditLoc OR !IsCablesAndConsumablesEnabled | Reset to 0 when disabled |
| ETSPercentage | !canEditLoc OR !AllowETS | Default 0.24 if IsUnion=true, 0.23 if IsUnion=false, 0 when disabled |
| ResortTaxPercent | !canEditLoc OR !AllowResortTax | Reset to 0 when disabled or first enabled |
| ThresholdAmount | AllowDPCD OR !PromptForApproval OR !canEditLoc | Reset to 0 when AllowDPCD=true OR PromptForApproval=false |
| AllowDPCD, ShowSubRental | !IsCommReceiver OR !canEditLoc | AllowDPCD resets to false when IsCommReceiver=false |
| DisplayTax | HRIRemitTax OR HRIRemitTax2 OR !canEditLoc | Auto-set to true when HRIRemitTax/HRIRemitTax2 is true |
| EnableIDCBilling | !InternalCompany | Reset to false when InternalCompany=false |
| BillingWayEffectiveDate | !changeBillWayActive | — |
| IsIntegratedWithCOMPASS | !isNew (updating existing location) | — |
| SuppressDayRateDiscount | Always disabled | — |
| ProposalPilot | isNew === true (creating new) | — |

**API-Dependent Validations:**

| Trigger | API Call | On Success | On Error |
|---------|----------|------------|----------|
| BillingWay change | locationService.checkBillWayChange() | Enables BillingWayEffectiveDate, sets to today | Reverts BillingWay to previous value, shows ERR_BILLINGWAY_UNBILLED_ORDERS |
| BillingCycle change | locationService.checkBillCycleChange() | If data > 0: disables BillingCycleID | Shows alert, sets localBillingRan=true |

**Country-Based Rules (countryId):**
- CountryId === 1 (USA): hideRemitTax=true, HRIRemitTax2=false, CheckDiscount=true
- Other countries: hideRemitTax=false, CheckDiscount=false

#### Pricing Component (location-detail-pricing.component.ts)

**Validation Rules:**

| Rule | Details |
|------|---------|
| Date Validation | Custom validator: customDateValidator on StartDate/EndDate. Uses isValidDate() check. |
| IsAlternate Checkbox | On Check: marks IsNew=true. On Uncheck: clears errors, sets IsDeleted=true, UseDate=false, clears dates. |
| UseDate Checkbox | Only editable when IsAlternate=true. On Uncheck: clears StartDate/EndDate. |
| Start/End Date Fields | Editable only when IsAlternate=true AND UseDate=true. Format via NullDateEditor. |
| Corporate Prices Grid | validateCorporatePriceGrid(): checks all filtered price books for errors. Sets form CorporatePrices control to {invalid: true} if errors. |
| Corporate Pricing Toggle | corporatePricebookCheckChanged(): Disables ALL fields when IsCorporatePricingEnabled=false. Enables when true. |
| Cell Edit Restrictions | onBeforeEditCell(): StartDate/EndDate only if IsAlternate && UseDate. UseDate only if IsAlternate. PricebookName not editable. |

#### Legal Component

**Validation Rules:**

| Field | Rule | Error Message | Scope |
|-------|------|---------------|-------|
| ServiceChargeId | LOC_SERVICE_CHARGE_ID_GT_ZERO, cannot be null/empty | SCNAME_IS_REQD | All items in locationDetail.Legals array |
| TermsConditionsId | LOC_TERMS_CONDITION_ID_GT_ZERO, cannot be null/empty | TCNAME_IS_REQD | All items in locationDetail.Legals array |
| Dropdown Options | ServiceChargeNames filtered by LanguageId, sorted alphabetically. Same for TermConditionNames. | — | — |

**On Country Change:** Legal rows must RESET selections and surface fresh errors (NOT testable on office 1604).

#### Currency Component

| Rule | Details |
|------|---------|
| At least 1 selected | isValidCurrency(): CurrencyList.filter(o => o.IsSelected).length > 0 |
| Single default | When setting default: must be selected first, all other IsDefault=false |
| Merchant filtering | Filters merchants by CurrencyId |

#### Parent Component / Save Button

Save button disabled when ANY of these is true:
1. locationDetailForm.pristine (no changes)
2. locationDetailForm.invalid
3. !locationDetail.MasterAddress || !locationDetail.MasterAddress.Line1
4. priceBookHasErrors
5. !canEditLoc
6. !isValidLegalData()
7. locationDetail.CountryID == 0
8. locationDetail.TaxModeID == 0
9. !isValidCurrency()
10. locationDetail.PayToId == 0
11. locationDetail.OracleOrgId == 0

*Note: Conditions 3, 5, 7, 8, 10, 11 are parent-level fields NOT on any page we automate. Conditions 1, 2, 4, 6, 9 ARE testable from within tabs we have specs for.*

#### Local Office Settings — Basic Information (location-setting-basic.component.ts)

**Date Offset Validations:**

| Field | Pattern | MaxLen | Error Message | Business Rule |
|-------|---------|--------|---------------|---------------|
| PrepDateOffset | `^((-[1-9]+)|(0+))$` (neg or zero) | 3 | PREP_OFFSET_EMPTY | Must be <= DeliveryDateOffset AND <= SetDateOffset |
| ReturnDateOffset | `^(\d+?)?$` (positive or empty) | 3 | RETURN_OFFSET_EMPTY | Must be >= PickupDateOffset AND >= StrikeDateOffset |
| SetDateOffset | `^((-[1-9]+)|(0+))$` (neg or zero) | 4 | SET_OFFSET_EMPTY | Must be >= PrepDateOffset AND >= DeliveryDateOffset |
| StrikeDateOffset | `^(\d+?)?$` (positive or empty) | 3 | STRIKE_OFFSET_EMPTY | Must be <= ReturnDateOffset AND <= PickupDateOffset |
| DeliveryDateOffset | `^((-[1-9]+)|(0+))$` (neg or zero) | 4 | DELIVER_OFFSET_EMPTY | Must be >= PrepDateOffset AND <= SetDateOffset |
| PickupDateOffset | `^(\d+?)?$` (positive or empty) | 3 | PICKUP_OFFSET_EMPTY | Must be <= ReturnDateOffset AND >= StrikeDateOffset |
| LoadInDateOffset | `^(-[1-9]\d*|0)$` (neg or zero) | 4 | LOADIN_OFFSET_EMPTY | **HIDDEN — NOT DEPLOYED** |
| LoadOutDateOffset | `^([1-9]\d*|0)$` (positive or zero) | 3 | LOADOUT_OFFSET_EMPTY | **HIDDEN — NOT DEPLOYED** |

**Complex Cross-Validation Logic (Validate() method):**

When PrepDateOffset is empty:
- If both Delivery and Set exist: Set >= Delivery

When PrepDateOffset exists:
- If both Delivery and Set exist: Set >= Prep, Delivery >= Prep, Set >= Delivery
- If only Set exists: Set >= Prep
- If only Delivery exists: Delivery >= Prep

When ReturnDateOffset is empty:
- If both Strike and Pickup exist: Pickup >= Strike

When ReturnDateOffset exists:
- If both Strike and Pickup exist: Return >= Pickup, Return >= Strike, Pickup >= Strike
- If only Strike exists: Return >= Pickup (sic — docs say this but likely means Return >= Strike)
- If only Pickup exists: Return >= Strike (likely means Return >= Pickup)

**Section Grid Validations:**

| Rule | Details |
|------|---------|
| Empty name | Cannot be empty or whitespace. Trims before save. On empty: reverts to previous value (tempName) |
| Duplicate name | No duplicates allowed. Exclamation icon + "Duplicate Name" tooltip. Emits OnSectionDuplicatName.next(true). Disables save. |
| Active toggle | Checkbox, updates Active property, sets IsDirty=true |
| Add new | Rejects empty/whitespace names. Sets IsNew=true, Active=true |
| Delete | Updates DeleteSection form control with comma-separated deleted IDs |
| Default sections | Audio, Video, Lighting, Presenter Support, Staging, Rigging, High Speed Internet Access, Scenic, Labor (only when UseSection=true) |

> **NOTE**: v1 defaults list (9 sections) is OUTDATED. Live state for office 1604 has 13 sections: Audio, Flipcharts, Hybrid Meeting, Labor, Lighting, Power, Presenter Support, Projection, Rigging, Scenic, Staging, Video, Whiteboard. Test data (`local-office-settings.data.ts`, live-verified 2026-03-24) reflects actual state. MCP-verified live state takes precedence for assertions.

**Room Configuration Grid:** Same validation patterns as Section Grid (empty name, duplicates, active toggle, add/delete).

**Discount Exemptions Grid:** Checkbox toggle only (Exempt property), no text validation.

### SOURCE 2: PriceGuideInclusion & EnableMultidayPricing Requirements

| Field | Backend Property | Default | Tab | Editability |
|-------|-----------------|---------|-----|-------------|
| PriceGuideInclusion | pricing.priceGuideInclusion | false | Pricing | **Editable** checkbox |
| EnableMultidayPricing | pricing.enableMultidayPricing | false | Local Information | **Editable** (docs say read-only but MCP shows editable on live) |

### SOURCE 3: Encore-Requirements-V2 (relevant additions beyond v1)

- NM-1453: All 6 date offsets should allow null (clear → save → verify empty, not 0)
- NM-1068: LoadIn/LoadOut — NOT DEPLOYED
- NM-1462/64/65: Auto AddOns country-scoped — can't test on office 1604 without country change

---

## NOT TESTABLE Registry (office 1604 constraints)

| Item | Why Not Testable |
|------|-----------------|
| Country change cascade (Legal reset, TaxMode reset, Region reset) | Destructive for office 1604 |
| BillingWay unbilled orders API check | Can't reliably trigger unbilled orders state |
| LoadIn/LoadOut date offsets | Not deployed on live site |
| Labor Hours conditional fields | Currently hidden |
| ECT Internal/External Labor Cost | Not deployed (NM-1201) |
| RBAC/canEdit variations | Requires non-admin test account |
| Auto AddOns country-scoped | Requires country change (destructive) |
| ETS% union vs non-union defaults | MCP-verified 2026-04-08: Union=unchecked (non-union), Allow ETS=unchecked, ETS%=disabled. Toggling Allow ETS enables ETS% → can test non-union default (0.23). Union path requires toggling Union checkbox first — **TESTABLE with 2-step toggle** |
| EnableIDCBilling InternalCompany dependency | MCP-verified 2026-04-08: Intercompany=checked, Enable IDC Billing=unchecked+editable. **TESTABLE** — toggle IDC Billing and verify persistence |
| Auto Add-On item count location-specific (TC-016) | MCP-verified 2026-04-08: all 3 E2E locations (1604, 1605, 1101) have same 5 items. Default checked states differ (1101: all unchecked). **STILL BLOCKED** — no location with different item list |

### APP BUGS Found During Audit (file as defects)

| Bug | Page | Evidence | v1 Requirement |
|-----|------|----------|---------------|
| SC dropdown options NOT sorted alphabetically | Legal | MCP-verified 2026-04-06: generic names first ("Service Charge", "Administrative Fee"...), then location-specific. 114 options. | "ServiceChargeNames filtered by LanguageId, sorted alphabetically" |
| T&C dropdown options NOT sorted alphabetically | Legal | MCP-verified 2026-04-06: same pattern. 50 options. First: "Service Charges", "Administration Fees"... | "TermConditionNames filtered by LanguageId, sorted alphabetically" |

---

## Verified Gap Analysis Per Page (20 items)

### Local Information (8 gaps + V2 plan SP-01/02/04/05/06)

| # | Gap | Source | V2 Plan Overlap | Known Status | MCP Needed |
|---|-----|--------|-----------------|-------------|------------|
| 1 | BillingCycleID required validation (can't be 0, error icon) | v1 | — | **Cat-B** — FIXME TC-027 (related: shows --Select-- not Weekly for 1604) | Yes: can we trigger on 1604? |
| 2 | BillingCycleID disabled when localBillingRan=true | v1 | — | **Cat-B** — FIXME TC-027 | Yes: is it disabled on 1604? |
| 3 | ETS% default values (0.24 union / 0.23 non-union) | v1 | — | **Cat-A BLOCKED** — FIXME TC-017 (CC%/ETS%/ResortTax% fields disabled on 1604) | Yes: is 1604 union? |
| 4 | ThresholdAmount dual-dependency disable (AllowDPCD=true OR !PromptForApproval) | v1 | — | **Cat-B** — FIXME TC-018 (related: "Threshold step") | Yes: what are current states? |
| 5 | EnableIDCBilling persistence after dependency toggle NOT verified (basic toggle IS tested via ACTIVE_DEPENDENCIES loop: Intercompany→IDC disabled+unchecked). Remaining gap: save→reload→verify still disabled/unchecked. | v1 | — | **MOSTLY COVERED** — basic toggle tested, persistence gap only | Yes: is 1604 internal? |
| 6 | C&C% resets to 0 when IsCablesAndConsumablesEnabled disabled | v1 | — | **Cat-A BLOCKED** — FIXME TC-030/031 (C&C Fee fields disabled on 1604) | No |
| 7 | DisplayTax auto-set behavior PARTIAL: ACTIVE_DEPENDENCIES tests uncheck CompanyRemitTax → DisplayTax becomes editable. NOT covered: (a) check CompanyRemitTax → DisplayTax auto-SET to true, (b) HRIRemitTax2 variant has zero coverage. | v1 | — | **PARTIAL** — uncheck direction covered, auto-set + HRIRemitTax2 NOT | No |
| 8 | ResortTax% resets to 0 when disabled | v1 | — | **Cat-A BLOCKED** — FIXME TC-061 | No |
| 9 | EnableMultidayPricing field + tests | v2/PGI doc | **SP-01, SP-02** | **NEW** | No (already MCP-verified) |
| 10 | BillingWayEffectiveDate past-date validation | v1 + v2 | **SP-04** | **NOT-AUTOMATABLE** — TC-046 in spec FIXME line 305 (Billing/Country — require different office). Subplan should NOT attempt unless MCP-verified on 1604 first. | No |
| 11 | SkipBilling → Oracle conditional required | v1 + v2 | **SP-05** | **Cat-A BLOCKED** — FIXME TC-008 (Skip Billing one-way lock on 1604) | No |
| 12 | DISABLED_CHECKBOXES update (+eSignature, ProductGroup, DiscountGuidance) | v2 | **SP-06** | **PARTIAL** — array update IS doable (data task). Only behavioral toggle testing is Cat-A blocked. | No |

### Pricing (3 gaps)

| # | Gap | Source | Known Status | MCP Needed |
|---|-----|--------|-------------|------------|
| 13 | Custom date validator for Start/End dates (isValidDate) | v1 | **NEW** | Yes: enter invalid date, check error |
| 14 | Corporate grid validation (validateCorporatePriceGrid form error) | v1 | **NEW** | Yes: trigger grid-level error |
| 15 | Cell edit restrictions: dates only editable when IsAlternate && UseDate | v1 | **NEW** — partially covered by cascade tests | No |

### Legal (2 gaps)

| # | Gap | Source | Known Status | MCP Needed |
|---|-----|--------|-------------|------------|
| 16 | ServiceChargeId null→error: Radix Select has no deselect/clear mechanism; keyboard clear has no effect (MCP-verified 2026-04-06). Validation only triggers on country change (destructive on 1604) | v1 | **NOT-AUTOMATABLE** (MCP-verified 2026-04-06) | Done |
| 17 | TermsConditionsId null→error: Same as #16. "Blank" T&C option exists but is a real record (valid ID, no error icon). Keyboard clear has no effect (MCP-verified 2026-04-06) | v1 | **NOT-AUTOMATABLE** (MCP-verified 2026-04-06) | Done |

### Local Office Settings (4 gaps + V2 plan SP-03)

| # | Gap | Source | V2 Plan Overlap | Known Status | MCP Needed |
|---|-----|--------|-----------------|-------------|------------|
| 18 | Section grid: empty name rejection + duplicate name validation (icon + tooltip + save disabled) | v1 | — | **NEW** | No |
| 19 | Room config grid: empty name + duplicate validation (same patterns) | v1 | — | **NEW** | No |
| 20 | Complex 6-field date offset cross-validation (exact Validate() rules now documented) | v1 | Partially **SP-03** (null offsets) | **NEW** | No |

### Gap Status Summary (updated 2026-04-08 — MCP re-verified E2E env)

| Status | Count | Gaps | Implication |
|--------|-------|------|-------------|
| **NEW** | 7 | #9, #13, #14, #15, #18, #19, #20 | Subplans address immediately |
| **Cat-B** (known FIXME, fixable) | 3 | #1, #2, #4 | Already FIXME'd, subplans inherit context |
| **Cat-A BLOCKED → TESTABLE** | 3 | #3, #6, #8 | MCP-verified 2026-04-08: fields disabled by parent toggle, not env. Toggle parent → field enables → testable. Subplans should attempt. |
| **Cat-A BLOCKED** (still) | 1 | #11 | SkipBilling: unchecked+editable on 1604, but toggling is one-way (once enabled, billing skipped permanently). Needs confirmation before testing. |
| **NOT-AUTOMATABLE** | 3 | #10, #16, #17 | #10: BillingWay change needs different office. #16/#17: Radix Select no deselect (MCP-verified 2026-04-06) |
| **MOSTLY COVERED** | 1 | #5 | Basic toggle tested, only persistence gap remains. MCP 2026-04-08: IDC Billing editable, Intercompany=checked. **TESTABLE** |
| **PARTIAL** | 2 | #7, #12 | Some coverage exists, specific sub-behaviors uncovered |

> **E2E Env Update (2026-04-08)**: 3 locations accessible (1604, 1605, 1101). All have same 5 Auto Add-On items. 1101 has all unchecked defaults. Fields previously marked Cat-A BLOCKED because "disabled on 1604" are actually disabled by parent toggles (Apply C&C, Allow ETS, Allow Resort Tax) — toggling parent enables them. SkipBilling is editable (not a one-way lock as previously assumed — **needs re-verification before toggling**).

### Account & Address (1 gap — reduced after audit)

| # | Gap | Source | MCP Needed |
|---|-----|--------|------------|
| — | Phone1 required validation | — | **ALREADY TESTED (5 tests)** — removed |
| 21* | Save button testable conditions (pristine, priceBookHasErrors, !isValidCurrency, !isValidLegalData) | v1 | Yes: verify each condition |

*Item 21 is cross-tab — each condition is tested within its tab's audit, not as a standalone Account & Address item.

### Persistence Gaps (from Coverage Audit plan — no new v1 rules, but unacceptable round-trip coverage)

| Spec | Current RT% | Target |
|------|-------------|--------|
| Currency | **100% field-type** | ~~>50%~~ DONE (4 RT TCs, all 3 mutable field types covered) |
| Shared Setup | 6% | >50% |
| Account & Address | 10% | >50% |
| Auto Add-On | **100% field-instance** | ~~>50%~~ DONE (4 RT TCs, all 5 field instances covered) |
| ECT | **100% field-type** | ~~>40%~~ DONE (7 RT TCs, all 3 editable field types covered) |
| Notes | **42% field-type** | ~~>40%~~ DONE (3 RT TCs + 1 negative-persistence, multi-row + boundary + partial-delete + cancel-negative) |

---

## Subplan Structure (one session per page)

Each subplan follows this workflow:

```
SESSION START:
1. Read THIS plan (the master)
2. Read the relevant extracted requirements section above
3. Read the spec + page object + selectors + test data for that page

AUDIT PHASE (produces plans/pending/PLAN_AUDIT_{PAGE}.md):
4. MCP-verify any items marked "MCP Needed" above
5. Map every v1 rule to existing TC or GAP or UNTESTABLE
6. Apply ISTQB technique audit (round-trip, BVA, decision table, state transition)
7. List prioritized missing TCs

REVIEW:
8. User approves audit plan

EXECUTE PHASE (separate session if needed):
9. Update test-data, page object, spec, REQUIREMENTS.md
10. Run spec individually → fix failures
11. Run all specs together → fix serial contamination
```

### Subplan Execution Order

**Batch 1 (P0 — highest requirements density, validates template):**
- PLAN_AUDIT_LOCAL_INFORMATION.md
- PLAN_AUDIT_LOCAL_OFFICE_SETTINGS.md

**Batch 2 (P1 — moderate density, different page structures):**
- PLAN_AUDIT_LEGAL.md
- PLAN_AUDIT_PRICING.md

**Batch 3 (P2 — mostly persistence gap-fill, low requirements density):**
- PLAN_AUDIT_CURRENCY.md ✅ (executed 2026-04-06: +7 TCs, RT 0%→100% field-type)
- PLAN_AUDIT_ACCOUNT_ADDRESS.md
- PLAN_AUDIT_SHARED_SETUP.md
- PLAN_AUDIT_AUTO_ADDON.md ✅ (executed 2026-04-08: +4 TCs, RT 13%→100% field-instance)
- PLAN_AUDIT_ECT.md ✅ (executed 2026-04-08: +5 TCs, RT 17%→100% field-type)

**Batch 4 (P3 — no v1 rules, persistence only):**
- PLAN_AUDIT_NOTES.md ✅ (executed 2026-04-08: +4 TCs, RT 35%→46% field-type)

---

## Success Criteria

1. Every testable v1 requirement mapped to a test case (or documented BLOCKED + reason)
2. Round-trip persistence above 40% across all specs (from 21%)
3. Negative/validation testing above 15% (from ~7%)
4. Every spec has minimum: 1 validation error test, 1 round-trip test, 1 save-disable test
5. DISABLED_CHECKBOXES arrays match live state
6. Zero undocumented FIXMEs
7. REQUIREMENTS.md reflects all verified v1 rules

---

## Test Count Baseline (verified 2026-04-03)

| Spec | Tests | Active | Skipped |
|------|-------|--------|---------|
| location-pricing | 25 | 22 | 3 |
| location-currency | 26 | 26 | 0 |
| location-legal | 15 | 15 | 0 |
| location-local-information | 16 | 16 | 0 |
| location-auto-addon | 19 | 19 | 0 |
| location-account-address | 20 | 20 | 0 |
| location-notes | 24 | 24 | 0 |
| location-shared-setup-locations | 17 | 17 | 0 |
| local-office-settings | 39 | 39 | 0 |
| local-office-ect | 17 | 17 | 0 |
| local-office-history | 7 | 7 | 0 |
| **TOTAL** | **225** | **222** | **3** |

> **NOTE**: Counts above are SOURCE-LEVEL (each loop = 1 entry). At runtime, data-driven loops expand the count. Loop arrays: ACTIVE_DEPENDENCIES (5), LDW_BOUNDARIES (8), TEXT_FIELD_CONSTRAINTS (2), DROPDOWN_PERSISTENCE_CASES (5 skip), UNSELECTED_CURRENCY_STATES (2), SPECIAL_CONTENT_TESTS (4), UNCHECK_PERSISTENCE_CASES (2), LABOR_COST_RT_ROWS (2). Runtime total ≈ 247. Source-level total = 225.

---

## Reference Files

| Category | Path |
|----------|------|
| Requirements v1 | `docs/read_only_docs/Functional Requirement -v1.docx` |
| Requirements V2 | `docs/read_only_docs/Encore-Requirements-V2.docx` |
| PriceGuide/Multiday | `docs/read_only_docs/Requirements_Document PriceGuideInclusion and EnableMultiDayPricing/` |
| V2 Gaps Plan (protected) | `plans/done/PLAN_V2_REQUIREMENTS_GAPS.md` |
| Coverage Audit Plan (protected) | `plans/done/PLAN_ALL_PAGES_TEST_COVERAGE_AUDIT_AND_FIX.md` |
| Location specs | `tests/specs/setup/locations/*.spec.ts` |
| Local-office specs | `tests/specs/setup/local-office/*.spec.ts` |
| Page objects | `src/pages/setup/locations/`, `src/pages/setup/local-office/` |
| Selectors | `src/selectors/setup/locations/`, `src/selectors/setup/local-office/` |
| Test data | `tests/test-data/setup/locations/`, `tests/test-data/setup/local-office/` |
| REQUIREMENTS.md | `docs/REQUIREMENTS.md` |
