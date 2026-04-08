> **SUPERSEDED**: Content absorbed into `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md`. SP items referenced as gaps #9, #10, #11, #12, #20.

# PLAN: V2 Requirements Gaps — New Fields & Test Coverage

**Source**: `docs/read_only_docs/Encore-Requirements-V2.docx` (client Jira agent full doc retrieval, 2026-03-30)
**Priority**: P1 (new field coverage)
**Status**: Pending

---

## Context

Client's Jira agent produced a full requirements spec (V2) for Location Settings + Local Office Settings under the NM-10 epic. We audited V2 against our specs, REQUIREMENTS.md, and the live E2E site via MCP on 2026-03-30.

**V2 is ~70% reality, ~30% aspirational/not-yet-deployed.**

---

## MCP Verification Results (2026-03-30, live on E2E)

| V2 Claim | Jira | Live? | Details |
|---|---|---|---|
| LoadIn/LoadOut offsets visible | NM-1068 | **NO** | Only 6 offsets on page (Prep, Return, Set, Strike, Delivery, Pickup). Not deployed. |
| EnableMultidayPricing readonly on Local Info | NM-1335/1336 | **YES but EDITABLE** | Field "Enable Multiday Pricing" exists between "Calculate C&C on Net Amount" and "Allow ETS". V2 says readonly — live shows editable (cursor=pointer). Unchecked for office 1604. |
| PriceGuideInclusion editable on Pricing | NM-1293/1337 | **YES** | Live label = "Include Service Fee in Price Guides". Already in REQUIREMENTS.md as "Price Guide Inclusive". Checked by default. No gap. |
| Null handling for offsets | NM-1453 | **UNKNOWN** | Can't verify save behavior without data modification. |
| Auto AddOns country-scoped | NM-1462/64/65 | **UNKNOWN** | Would need country change to verify. |

---

## Actionable Items (execute when ready)

### SP-01: Add "Enable Multiday Pricing" to REQUIREMENTS.md
- Location: Local Information tab, left column, between "Calculate C&C on Net Amount" and "Allow ETS"
- Type: checkbox, unchecked default (office 1604)
- State: editable (cursor=pointer) despite V2 claiming readonly
- Add to field inventory table in REQUIREMENTS.md

### SP-02: Create test cases for Enable Multiday Pricing
- Planner should document field behavior (dependencies, save behavior)
- Generator should create tests: default state, toggle on/off, persistence after save+reload
- Check if toggling affects any other fields (V2 doesn't mention dependencies)

### SP-03: Add null-offset test cases for Local Office date offsets
- Per NM-1453: all 6 date offsets should allow null (clear field -> save -> verify empty roundtrip)
- Test: clear each offset field -> save -> reload -> verify still empty (not 0)
- Test: clear one of two related fields (e.g., Prep but not Delivery) -> verify no cross-field validation error fires
- Add to local-office-settings.spec.ts

### SP-04: Add past-date validation test for BillingWayEffectiveDate
- V2 confirms: date cannot be in the past (validateBillWayDate, error key: pastDate)
- We document this in REQUIREMENTS.md but have NO spec test for it
- Test: change Billing Way -> enter past date in Effective Date -> verify validation error

### SP-05: Add SkipBilling conditional required tests for Oracle fields
- V2 confirms: OracleOrgId, OracleProductCode, OracleDeptCode required when SkipBilling=false
- We have maxLength tests but NOT the conditional required validation
- Test: toggle SkipBilling on -> verify Oracle fields no longer required -> toggle off -> verify required again

---

## NOT Actionable (pending deployment or destructive)

- **LoadIn/LoadOut offsets** (NM-1068): Not on live site. Re-check periodically.
- **Country-scoped Auto AddOns** (NM-1462/64/65): Cannot test on office 1604 without destructive country change.
- **canEdit/permission tests** (NM-979): Would require non-admin test account.
- **Legal tab country-change reset** (NM-957): Destructive for office 1604.

---

## What V2 Confirms We Already Cover Well

- All 8 Location Settings tabs have baseline coverage (~264 tests)
- Billing Way/Cycle cascade and API-dependent behaviors
- LDW boundary testing, conditional enables/resets
- Pricing grid Is Alternative -> Use Effective Date -> dates cascade
- Legal/Currency/Account & Address/Notes/Shared Setup/Auto Add-On core flows
- Local Office date offset validation (6 offsets, cross-field rules)
- Unsaved changes dialog, Save button enable/disable logic
- Sections/Room Config grid CRUD operations

---

## What's Irrelevant in V2 (for our test automation)

- RBAC model internals (canEdit propagation in code)
- Core Service data sourcing architecture
- EOS-4749 validator strategy (implementation detail)
- API endpoint patterns (backend concern)
- MFE unit test guidance NM-1252 (client's unit tests, not our E2E)
- Data model mapping guides (schema details)
- Jira methodology/traceability (project management)
- Legacy parity discussion (context for devs)
- **Document is duplicated** — sections 1-8 repeat verbatim in the second half

---

---

## AUDIT FINDINGS (2026-03-30) — Session Self-Audit

### REQUIREMENTS.md vs Live MCP Discrepancies (verified 2x on 2026-03-30)

Field state differences confirmed across two independent MCP sessions.

| Field | REQUIREMENTS.md Says | MCP Shows (2026-03-30) | Spec Status | Severity |
|---|---|---|---|---|
| **Billing Cycle** | "Weekly" [disabled] | "--Select--" [ENABLED] | **ALREADY KNOWN** — spec line 42 asserts `isDisabled=false`, FIXME Cat-B TC-027 documents "--Select--" | LOW (spec correct, REQUIREMENTS.md stale) |
| **Oracle Organization** | "Encore US BU" | "--Select--" [disabled] | Unknown — no spec assertion on value | MEDIUM (REQUIREMENTS.md stale) |
| **Use eSignature** | checked, "independent" | checked, **disabled** | **KNOWN** — FIXME Cat-A TC-040 | LOW (known, not in DISABLED_CHECKBOXES array) |
| **Enable Product Group** | unchecked, "independent" | unchecked, **disabled** | **NOT KNOWN** — no FIXME, not in DISABLED_CHECKBOXES | MEDIUM (needs adding) |
| **Enable Job Costing** | checked, "independent" | checked, **disabled** | **KNOWN** — already in DISABLED_CHECKBOXES array + DISABLED_CHECKBOX_STATES | LOW (spec correct) |
| **Enable Discount Guidance** | checked, "independent" | checked, **disabled** | **NOT KNOWN** — no FIXME, not in DISABLED_CHECKBOXES | MEDIUM (needs adding) |

**Key insight**: The specs are MOSTLY AHEAD of REQUIREMENTS.md — they already adapted to these state changes. But two disabled fields (Enable Product Group, Enable Discount Guidance) are NOT tracked in the test data's `DISABLED_CHECKBOXES` array.

**Current DISABLED_CHECKBOXES array** (in `tests/test-data/setup/locations/location-local-info.data.ts:63`):
- chkSuppressDayRateDiscount, chkCompassIntegration, chkDisplayTax, chkEnableJobCosting

**Should also include**:
- chkUseESignature (disabled+checked, Cat-A FIXME exists but not in array)
- chkEnableProductGroup (disabled+unchecked, NOT tracked anywhere)
- chkEnableDiscountGuidance (disabled+checked, NOT tracked anywhere)

### SP-06: Update DISABLED_CHECKBOXES + REQUIREMENTS.md
- Add chkUseESignature, chkEnableProductGroup, chkEnableDiscountGuidance to DISABLED_CHECKBOXES array
- Add matching entries to DISABLED_CHECKBOX_STATES
- Update REQUIREMENTS.md field inventory: Billing Cycle, Oracle Org, eSignature, Product Group, Job Costing, Discount Guidance
- Priority: P1 (specs partially adapted already, no urgent failures)

### ADDITIONAL NOT-DEPLOYED V2 ITEMS (caught during audit)

| V2 Claim | Jira | Live? | Details |
|---|---|---|---|
| ECT Internal/External Labor Cost fields | NM-1201 | **NO** | ECT tab has no "Internal Labor Cost" or "External Labor Cost" fields. Only existing fixed cost fields + labor class grid. |
| ECT layout alignment with legacy | NM-1201 | **UNKNOWN** | Would need legacy screenshot to compare. Can't verify from MCP alone. |

---

## PROCESS AUDIT: How This Session Went

### What was done RIGHT
1. V2 doc extracted successfully via PowerShell (114KB, 635 lines)
2. V2 content read in full — all 8 sections plus consolidated catalog
3. V2 is duplicated (sections 1-8 repeat in second half) — correctly identified
4. 3 key new-field claims verified against live MCP with specific evidence
5. Correct identification that PriceGuideInclusion = "Include Service Fee in Price Guides" = existing "Price Guide Inclusive"
6. V2 doc saved to docs/read_only_docs/ with correct file size
7. Pending plan created with actionable items

### What was MISSED (caught by this audit)
1. **6 field state discrepancies** between REQUIREMENTS.md and live MCP — I was looking only at V2's NEW claims and didn't compare V2's EXISTING field assertions against live state
2. **NM-1201 ECT missing fields** — mentioned briefly as "EPT/ECT Save Sequencing" but didn't verify on MCP until this audit
3. **Billing Cycle is the most critical** — if this changed, existing specs may be broken
4. **V2 extraction had a minor error** on line 1-2 (PowerShell syntax leak into bash stdout) but didn't affect content completeness

### Risk Assessment
- **HIGH RISK**: Billing Cycle state change could mean existing local-information tests fail on next run
- **MEDIUM RISK**: Multiple "independent" checkboxes now disabled — may affect toggle/save tests
- **LOW RISK**: V2 extraction quality — content was complete despite line 1-2 garbage

---

## Reference

- V2 doc: `docs/read_only_docs/Encore-Requirements-V2.docx`
- Our requirements: `docs/REQUIREMENTS.md`
- Key Jira tickets: NM-1335, NM-1336, NM-1068, NM-1453, NM-1293, NM-1337, NM-958, NM-1462, NM-1201, NM-979
