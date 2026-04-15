# PLAN: History Integration Testing — Cross-Tab Save Verification

**Created**: 2026-04-13
**Status**: Pending
**Priority**: P1 (trust-building — verifies saves actually record audit trail)
**Depends on**: PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE (master plan)
**Scope**: Both Location Management History (87 cols) AND Local Office Settings History (42 cols)
**Parent Plan**: [PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md](PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md)
**Audited**: 2026-04-13 (WATCHDOG multi-agent audit — 13 gaps found, all resolved below)
**Updated**: 2026-04-13 (v4-final — simplified: removed HistoryVerifier/SaveTracker/BugTaxonomy, MCP-first with contingency branches, zero blast radius to existing tests)

---

## Pipeline Agent Responsibilities

This plan requires coordinated work across all pipeline agents. Each phase specifies its agent.

| Agent | Identity | Phase(s) | Deliverables |
|---|---|---|---|
| **HUNTER** (Requirements) | `@playwright-requirements` | 0.5 | REQUIREMENTS.md update: history tracking rules, NOT-TRACKED registry, oral-vs-formal comparison |
| **GIVER** (Planner) | `@playwright-test-planner` | 0.7 | Integration TCs in test case files, test plan updates, CSV re-export |
| **BUILDER** (Generator) | `@playwright-test-generator` | 1.0, 1.1, 1.2, 2.1–2.10 | Structural spec (19 TCs), page objects, selectors, fixtures, integration TCs in all 10 specs |
| **HEALER** (Healer) | `@playwright-test-healer` | 3A.3 (if needed) | Fix integration test failures, serial contamination |
| **WATCHDOG** (Audit) | `@playwright-pipeline-audit` | 3A.4 | Post-execution audit, field mapping accuracy, SELECTOR_CATALOG update |

---

## Context

**Problem**: All 11 specs across Locations and Local Office perform saves and verify persistence via reload, but **ZERO specs** verify that saves produce history entries. History is the audit trail — if it's broken, saved changes are unverifiable by manual QA.

**Oral Requirement (from client's manual QA)**: All things in ECT/Basic Info that can be saved need to appear in history. This is not currently true — there are missing items, possible duplicate columns. These are bugs to find and report.

**Two History Systems**:

| System | Columns | Location | Tracks Changes From | Spec Status |
|--------|---------|----------|---------------------|-------------|
| Location Management History | 87 [MCP-CONFIRMED] | Outer tab on Location Settings page (`/settings/location`) | Local Info, Pricing, Currency, Legal, Account & Address, Shared Setup, Auto Add-On, Notes | **NOT YET IMPLEMENTED** (pending_generation in pipeline queue) |
| Location Settings History | 42 [MCP-CONFIRMED] | Tab within Local Office Settings page (`/settings/local-office`) | Basic Information, ECT Settings | **EXISTS** — 7 TCs (structural tests only, no save verification) |

**History Type Dropdown** (both systems):
- Default: "Location Management History" [MCP-CONFIRMED: both pages default to this]
- Second option: "Location Management Legacy History" [MCP-CONFIRMED]
- ~~"Location Settings History"~~ [MCP-CONTRADICTED: this option does NOT exist. Both pages use identical dropdown options: "Location Management History" + "Location Management Legacy History". The tab name ≠ dropdown option name. SP1 §7.]
- **Legacy History is OUT OF SCOPE** — ignore entirely per user instruction

**Key Constraint**: ~~Location 1604's Local Office History is EMPTY~~ [MCP-CONTRADICTED: 2026-04-13 — History has 61 pages (~1204 rows). TC-LOS-HIS-003 was stale/wrong. Causality confirmed: saves DO create history entries. SP1 §3, §10.]

---

## REGRESSION GUARD

**These artifacts are PROTECTED — this plan does NOT modify them:**
- All existing spec files — integration tests are ADDITIVE (new TCs appended at end of serial blocks)
- [plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md](PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md) — master plan is REFERENCED, not modified
- Existing history spec [tests/specs/setup/local-office/local-office-history.spec.ts](../../tests/specs/setup/local-office/local-office-history.spec.ts) — 7 structural TCs are untouched
- `docs/REQUIREMENTS.md` — READ-ONLY for all agents except HUNTER (R11). Phase 0.5 delegates to HUNTER.
- Existing test case / test plan files — only GIVER adds new TCs (Phase 0.7)

---

## Existing History Artifacts Inventory

### Local Office Settings History (IMPLEMENTED — Basic)

| Artifact | Path | Status |
|----------|------|--------|
| Spec | `tests/specs/setup/local-office/local-office-history.spec.ts` | 7 TCs (structural only) |
| Page Object | `src/pages/setup/local-office/local-office-settings.page.ts` | Basic methods exist (lines 517-642) |
| Selectors | `src/selectors/setup/local-office/local-office-settings.ts` | 4 history selectors (lines 119-127) |
| Test Data | `tests/test-data/setup/local-office/local-office-history.data.ts` | Combobox options only |

**Existing Selectors**:
- `secHistoryTypeSelector`: `[data-testid="local-office-settings-history-type-selector"]`
- `drpHistoryType`: `[data-testid="local-office-settings-history-select-type"]`
- `secHistoryTableContainer`: `[data-testid="local-office-settings-history-table-container"]`
- `tblHistory`: `[data-testid="local-office-settings-history-table"]`

**Existing Page Object Methods**:
- `navigateToHistoryTab()` — clicks tab, waits for table visible
- `getHistoryColumnHeaderCount()` — counts `<th>` elements
- `isHistoryTableEmpty()` — checks for "No results." text
- `getHistorySortButtonCount()` — counts `<th> button` elements
- `isHistoryTabReadOnly()` — verifies no inputs/save buttons
- `getHistoryPaginationText()` — reads "N / N" pagination
- `getHistoryPaginationButtonCount()` — counts pagination buttons

**Existing Tests** (TC-LOS-HIS-001 through HIS-007):
1. Tab navigation + type selector + table visible
2. Column headers > 0
3. Table has data (office 1604)
4. Type selector has 2 options
5. Pagination controls present
6. Read-only (no Save, no editable fields)
7. Sort buttons present

### Location Management History (NOT IMPLEMENTED)

| Artifact | Path | Status |
|----------|------|--------|
| Spec | `tests/specs/setup/locations/location-management-history.spec.ts` | **MISSING** |
| Page Object | `src/pages/setup/locations/location-management-history.page.ts` | **MISSING** |
| Selectors | `src/selectors/setup/locations/history.ts` | **MISSING** |
| Test Data | `tests/test-data/setup/locations/location-management-history.data.ts` | **MISSING** |
| Test Cases | `specs_planning/test-cases/setup/locations/locations_management_history_test_cases.md` | 19 TCs documented |
| Test Plan | `specs_planning/test-plans/setup/locations/locations_management_history_test_plan.md` | Full plan exists |
| Queue Entry | `specs_planning/_internal/agent-queue.json` (id: `location-management-history`) | `pending_generation` |

**REQUIREMENTS.md Sections**:
- Location Management History: lines 826-960 (87-column spec)
- Local Office Settings History: lines 1103-1161 (42-column spec)

---

## Field Mapping: Location Management History → Source Tab (87 columns)

> **UNVERIFIED REFERENCE** — These mappings are derived from REQUIREMENTS.md, NOT live DOM.
> Execution agent MUST validate column headers against live DOM in Phase 0 Task 0.6.
> Column order, header text, and count may differ. Do NOT hardcode column indices from this table.

| Col# | History Column | Source Tab | Source Field/Selector | Testable via Spec? |
|------|----------------|-----------|----------------------|--------------------|
| 1 | Local Office ID | Parent | Office identifier | No (parent-level) |
| 2 | Local Office Name | Parent | Office name | No (parent-level) |
| 3 | Active | Parent | Active status | No (parent-level) |
| 4 | Live Date | Parent | Live date | No (parent-level) |
| 5 | Country | Parent | Country dropdown | No (destructive) |
| 6 | Currency | Currency | Primary currency | Yes — location-currency |
| 7 | Tax Mode Name | Parent | Tax mode | No (parent-level) |
| 8 | Region Name | Parent | Region | No (parent-level) |
| 9 | Servicing Branch Office | Parent | Branch office | No (parent-level) |
| 10 | Pay To | Parent | Pay to | No (parent-level) |
| 11 | Union | Local Info | chkUnion | Yes — location-local-information |
| 12 | Corporate Pricing | Pricing | chkCorporatePricing | Yes — location-pricing |
| 13 | Billing Type | Local Info | Billing Type radio | Yes — location-local-information |
| 14 | Billing Cycle | Local Info | drpBillingCycle | Yes — location-local-information |
| 15 | Billing Way | Local Info | drpBillingWay | Yes — location-local-information |
| 16 | Billing Way Active Date | Local Info | BillingWayEffectiveDate | No (NOT-AUTOMATABLE) |
| 17 | Labor Pricing | Pricing | Labor pricebook | Yes — location-pricing |
| 18 | Equip. Pricing | Pricing | Equip pricebook | Yes — location-pricing |
| 19 | Internal Equip. Pricing | Pricing | Internal equip pricebook | Yes — location-pricing |
| 20 | Production Labour Pricing | Pricing | Production labor pricebook | Yes — location-pricing |
| 21 | Production Equip. Pricing | Pricing | Production equip pricebook | Yes — location-pricing |
| 22 | Allow DPCD | Local Info | chkAllowDPCD | Yes — location-local-information |
| 23 | Exclude Implied Discount | Local Info | chkExcludeImpliedDiscount | Yes — location-local-information |
| 24 | Prompt For Approval | Local Info | chkPromptForApproval | Yes — location-local-information |
| 25 | Threshold | Local Info | txtThresholdAmount | Yes — location-local-information |
| 26 | Apply LDW | Local Info | chkIsLDWEnabled | Yes — location-local-information |
| 27 | LDW Percentage | Local Info | txtLDWPercentage | Yes — location-local-information |
| 28 | Calculate LDW on Net Amount | Local Info | chkCalculateLDWonNetAmount | Yes — location-local-information [MCP-CONTRADICTED: renders correctly as "Calculate LDW on Net Amount", NOT i18n key. SP1 §4 disproved bug.] |
| 29 | ETS | Local Info | chkAllowETS | Yes — location-local-information |
| 30 | ETS Percent | Local Info | spinETSPercentage | Yes — location-local-information |
| 31 | Service Charge | Local Info | chkServiceCharge | Yes — location-local-information |
| 32 | Show SC As Admin Fee | Local Info | chkShowSCAsAdminFee | Yes — location-local-information |
| 33 | Calculate SC On Net Amount | Local Info | chkCalcSCOnNetAmount | Yes — location-local-information |
| 34 | Service Charge Name | Legal | drpLegalServiceCharge | Yes — location-legal |
| 35 | Apply C&C Fee | Local Info | chkApplyCablesConsumablesFee | Yes — location-local-information |
| 36 | C&C Percentage | Local Info | spinCCPercentage | Yes — location-local-information |
| 37 | Calculate CAC on Net Amount | Local Info | chkCalcCACOnNetAmount | Yes — location-local-information |
| 38 | Terms and Conditions | Legal | drpLegalTerms | Yes — location-legal |
| 39 | Allow Ticker Calc | Local Info | chkAllowTickerCalc | Yes — location-local-information |
| 40 | Set/Strike/Support Labor Billing Goal | Local Info | txtSetStrikeSupportGoal | Yes — location-local-information |
| 41 | Enable Set/Strike Labor Minutes | Local Info | chkApplySetStrikeLaborMinutes | Yes — location-local-information [MCP-CONTRADICTED: header is "Enable Set/Strike Labor Minutes", NOT duplicate of col 40. SP1 §4 disproved bug.] |
| 42 | Apply Set/Strike Labor Minutes | Local Info | chkApplySetStrikeLaborMinutes | Yes — location-local-information |
| 43 | Credit Memo Approval Required | Local Info | chkCreditMemoApproval | Yes — location-local-information |
| 44 | Display Tax | Local Info | chkDisplayTax | Yes — location-local-information |
| 45 | Company Remit Tax / GST/HST / VAT | Local Info | chkCompanyRemitTax | Yes — location-local-information |
| 46 | Remit PST Tax | Local Info | chkRemitPSTTax | Yes — location-local-information |
| 47 | Comm Receiver | Local Info | chkIsCommReceiver | Yes — location-local-information |
| 48 | Enable IDC Billing | Local Info | chkEnableIDCBilling | Yes — location-local-information |
| 49 | Skip Billing | Local Info | chkSkipBilling | Caution (one-way lock risk) |
| 50 | Show SubRental | Local Info | chkShowSubRental | Yes — location-local-information |
| 51 | Inventory Only | Local Info | chkInventoryOnly | Yes — location-local-information |
| 52 | Intercompany | Local Info | chkInternalCompany | Yes — location-local-information |
| 53 | Calculate Commission Tax | Local Info | chkCalcCommissionTax | Yes — location-local-information |
| 54 | Can Create External Customer Link | Local Info | chkExternalCustomerLink | Yes — location-local-information |
| 55 | Venue/Branch Account Name | Account & Address | venue name | Yes — location-account-address |
| 56 | Venue/Branch Account Phone1 | Account & Address | txtPhone1 | Yes — location-account-address |
| 57 | Venue/Branch Account Phone2 | Account & Address | txtPhone2 | Yes — location-account-address |
| 58 | Master Bill To Address Name | Account & Address | address name | Yes — location-account-address |
| 59 | Action of Shared Setup Location | Shared Setup | action column | Yes — location-shared-setup |
| 60 | Shared Setup Location ID | Shared Setup | location ID | Yes — location-shared-setup |
| 61 | Shared Setup Location Name | Shared Setup | location name | Yes — location-shared-setup |
| 62 | Include SC in Price Guides | Pricing | chkPriceGuideInclusive | Yes — location-pricing |
| 63 | Pricing Strategy | Pricing | pricebook name | Yes — location-pricing |
| 64 | Currency | Pricing | pricebook currency | Caution [MCP-CONFIRMED: both col 6 and col 64 ARE named "Currency". Use index-based access for col 64. SP1 §4 confirmed.] |
| 65 | Pricing Action | Pricing | action (add/delete/modify) | Yes — location-pricing |
| 66 | Is Alternate | Pricing | chkIsAlternate | Yes — location-pricing |
| 67 | Use Effective Dates | Pricing | chkUseDate | Yes — location-pricing |
| 68 | Start Date | Pricing | start date | Yes — location-pricing |
| 69 | End Date | Pricing | end date | Yes — location-pricing |
| 70 | Notes | Notes | note content | Yes — location-notes |
| 71 | Modified By | System | auto-generated | Read-only (verify present) |
| 72 | Modified On | System | auto-generated | Read-only (verify present, sort by) |
| 73 | Oracle Product Code | Local Info | txtOracleProduct | Yes — location-local-information |
| 74 | Oracle Department Code | Local Info | txtOracleDepartment | Yes — location-local-information |
| 75 | Oracle Organization | Local Info | drpOracleOrganization | Yes — location-local-information |
| 76 | Allow Resort Tax | Local Info | chkAllowResortTax | Yes — location-local-information |
| 77 | Resort Tax Percentage | Local Info | spinResortTaxPercentage | Yes — location-local-information |
| 78 | Discount Reason | Local Info | discount reason | Yes — location-local-information |
| 79 | Offsite Event Location | Local Info | chkOffsiteEventLocation | Yes — location-local-information |
| 80 | Use eSignature | Local Info | chkUseESignature | Yes — location-local-information |
| 81 | Separate Master Bill Commission Invoice | Local Info | chkSeparateMasterBillCI | Yes — location-local-information |
| 82 | Enable Product Group | Local Info | chkEnableProductGroup | Yes — location-local-information |
| 83 | Allow Production Quote | Local Info | chkAllowProductionQuote | Yes — location-local-information |
| 84 | Enable Job Costing | Local Info | chkEnableJobCosting | Yes — location-local-information |
| 85 | Enable Discount Guidance | Local Info | chkEnableDiscountGuidance | Yes — location-local-information |
| 86 | Internet Asset Reservation | Local Info | chkInternetAssetReservation | Yes — location-local-information |
| 87 | Warehouse Billing | Local Info | chkWarehouseBilling | Yes — location-local-information |

**Source Tab Distribution**: Local Info: ~45 cols | Pricing: ~12 cols | Account & Address: 4 cols | Legal: 2 cols | Shared Setup: 3 cols | Currency: 1 col | Notes: 1 col | System: 2 cols | Parent (untestable): ~10 cols

---

## Field Mapping: Local Office Settings History → Source (42 columns)

> **UNVERIFIED REFERENCE** — Same disclaimer as above. Validate on live DOM before using.

| Col# | History Column | Source Section | Source Field | Testable via Spec? |
|------|----------------|---------------|-------------|--------------------|
| 1 | Local Office | Parent | Office ID | No (identifier) |
| 2 | Prep Date Offset | Date Offsets | txtPrepDateOffset | Yes — local-office-settings |
| 3 | Return Date Offset | Date Offsets | txtReturnDateOffset | Yes — local-office-settings |
| 4 | Set Date Offset | Date Offsets | txtSetDateOffset | Yes — local-office-settings |
| 5 | Strike Date Offset | Date Offsets | txtStrikeDateOffset | Yes — local-office-settings |
| 6 | Pickup Date Offset | Date Offsets | txtPickupDateOffset | Yes — local-office-settings |
| 7 | Delivery Date Offset | Date Offsets | txtDeliveryDateOffset | Yes — local-office-settings |
| 8 | Use Fulfillment | Misc Settings | chkUseFulfillment | Yes — local-office-settings |
| 9 | Use Availability | Misc Settings | chkUseAvailability | Yes — local-office-settings |
| 10 | Use Equip QC | Misc Settings | chkUseEquipmentQC | Yes — local-office-settings |
| 11 | Print Desc | Misc Settings | chkPrintDesc | Yes — local-office-settings |
| 12 | Use Subrent | Misc Settings | chkUseSubrent | Yes — local-office-settings |
| 13 | Phone1 | Misc Settings | txtPhone1 | Yes — local-office-settings |
| 14 | Phone2 | Misc Settings | txtPhone2 | Yes — local-office-settings |
| 15 | Use Sect. | Section | chkUseSection | Yes — local-office-settings |
| 16 | Section Name | Section Grid | section name | Yes — local-office-settings |
| 17 | Sect. Action | Section Grid | action (add/edit/delete) | Yes — local-office-settings |
| 18 | Logo Name | Default Logo | logo name | Read-only check |
| 19 | Use On Quote | Default Logo | chkUseOnQuote | Read-only check |
| 20 | Use On Rental | Default Logo | chkUseOnRental | Read-only check |
| 21 | Service Type - Exempt | Discount Exemptions | exempt checkboxes | Yes — local-office-settings |
| 22 | ST Action | Discount Exemptions | action | Yes — local-office-settings |
| 23 | Action | Parent | overall action | Read-only verify |
| 24 | Notes | — | change notes? | TBD — MCP verify |
| 25 | Marriott PMS Account Enabled | Misc Settings | chkMarriottPMS | Yes — local-office-settings |
| 26 | Default Job to 1 day Event | Misc Settings | chkDefaultJob1DayEvent | Yes — local-office-settings |
| 27 | Default Job to 1 day Outside | Misc Settings | chkDefaultJob1DayOutside | Yes — local-office-settings |
| 28 | Default Job to 1 day Internal | Misc Settings | chkDefaultJob1DayInternal | Yes — local-office-settings |
| 29 | Default Labor to Hourly | Misc Settings | chkDefaultLaborToHourly | Yes — local-office-settings |
| 30 | Allow tentative+confirmed same priority | Misc Settings | chkAllowTentativeConfirmed | Yes — local-office-settings |
| 31 | Items Filled Return to Availability | Misc Settings | chkItemsReturnAvailability | Yes — local-office-settings |
| 32 | Default Order Type | Misc Settings | drpDefaultOrderType | Yes — local-office-settings |
| 33 | Regular Hours | ECT | Regular Hours | **UNCERTAIN** — field is read-only on ECT. MCP verify |
| 34 | Regular Hours Multiplier | ECT | Regular Hours Multiplier | **UNCERTAIN** — read-only on ECT |
| 35 | Over Time Hours | ECT | Over Time Hours | **UNCERTAIN** — read-only on ECT |
| 36 | OverTime Hours Multiplier | ECT | OverTime Hours Multiplier | **UNCERTAIN** — read-only on ECT |
| 37 | Double Time Hours | ECT | Double Time Hours | **UNCERTAIN** — read-only on ECT |
| 38 | DoubleTime Hours Multiplier | ECT | DoubleTime Hours Multiplier | **UNCERTAIN** — read-only on ECT |
| 39 | Holiday Multiplier | ECT | Holiday Multiplier | **UNCERTAIN** — read-only on ECT |
| 40 | Recalc Labor Hours | ECT | Recalc Labor Hours | **UNCERTAIN** — read-only on ECT |
| 41 | Modified By | System | auto-generated | Read-only (verify present) |
| 42 | Modified On | System | auto-generated | Read-only (verify present, sort by) |

**Source Section Distribution**: Date Offsets: 6 cols | Misc Settings: 14 cols | Section Grid: 2 cols | Default Logo: 3 cols | Discount Exemptions: 2 cols | ECT Labor: 8 cols | System: 2 cols | Parent: 1 col | TBD: 1+ cols

**Key Observation**: ECT-specific editable fields (`BenefitsMultiplier`, `HistoricalSubrental`, `PeakLaborAdjustment`) do NOT have corresponding columns in the 42-column history. Only the labor hour fields (cols 33-40) which are READ-ONLY on the ECT page are tracked. This means ECT editable saves may NOT produce history entries — or they may map to unlabeled/different columns. **MCP verification required.**

---

## Saves Per Spec — What Should Appear in History

### Local Office Settings Spec (17+ saves)

| Test ID | Field(s) Saved | Expected History Columns |
|---------|----------------|------------------------|
| TC-LOS-BAS-005 | PrepDateOffset (-3, -2) | Col 2: Prep Date Offset |
| TC-LOS-BAS-013 | chkUseFulfillment (ON) | Col 8: Use Fulfillment |
| TC-LOS-BAS-014 | chkDefaultLaborToHourly (ON) | Col 29: Default Labor to Hourly |
| TC-LOS-BAS-017 | txtPhone1 (test format) | Col 13: Phone1 |
| TC-LOS-BAS-022 | drpDefaultOrderType (Outside) | Col 32: Default Order Type |
| TC-LOS-BAS-023 | txtPoNumber | **NO COLUMN — possible gap** |
| TC-LOS-BAS-024 | txtPoNumberLabel | **NO COLUMN — possible gap** |
| TC-LOS-BAS-039 | txtPoNumber (XSS payload) | **NO COLUMN — possible gap** |
| TC-LOS-BAS-048 | Room toggle active/inactive | **Room not in 42 cols — possible gap** |
| TC-LOS-BAS-049 | Room name rename | **Room not in 42 cols — possible gap** |
| TC-LOS-BAS-064 | PrepDateOffset (cleared to empty) | Col 2: Prep Date Offset (empty) |
| TC-LOS-BAS-065 | ReturnDateOffset (cleared to empty) | Col 3: Return Date Offset (empty) |
| TC-LOS-BAS-067 | All 6 offsets (cleared) | Cols 2-7: all empty |

### Local Office ECT Spec (5 saves)

| Test ID | Field(s) Saved | Expected History Columns |
|---------|----------------|------------------------|
| TC-LOS-ECT-005 | BenefitsMultiplier (0.3) | **NO COLUMN in 42 — possible gap** |
| TC-LOS-ECT-009 | LaborCost row 0 | **NO COLUMN in 42 — possible gap** |
| TC-LOS-ECT-013 | HistoricalSubrental | **NO COLUMN in 42 — possible gap** |
| TC-LOS-ECT-014/015 | LaborCost rows | **NO COLUMN in 42 — possible gap** |
| TC-LOS-ECT-016 | BenefitsMultiplier + HistoricalSubrental | **NO COLUMN in 42 — possible gap** |

### Location Local Information Spec (9+ saves)

| Test ID | Field(s) Saved | Expected History Columns |
|---------|----------------|------------------------|
| TC-LOC-LI-071 | chkEnableMultidayPricing (ON) | **NO COLUMN in 87 — possible gap** |
| TC-LOC-LI-072 | chkEnableIDCBilling (ON) | Col 48: Enable IDC Billing |
| TC-LOC-LI-025 | Billing Type (Direct) | Col 13: Billing Type |
| TC-LOC-LI-021/029 | txtOracleProduct + chkCalcLDW | Col 73 + Col 28 |
| TC-LOC-LI-068 | txtOracleProduct (special chars) | Col 73: Oracle Product Code |
| TC-LOC-LI-069 | txtOracleDepartment | Col 74: Oracle Department Code |
| TC-LOC-LI-073 | chkCompanyRemitTax + chkDisplayTax | Cols 45, 44 |
| TC-LOC-LI-077 | chkAllowETS + spinETSPercentage | Cols 29, 30 |
| TC-LOC-LI-075 | chkApplyC&C + spinCCPercentage | Cols 35, 36 |
| TC-LOC-LI-076 | chkAllowResortTax + spinResortTaxPct | Cols 76, 77 |

### Location Pricing Spec (3 saves — most BLOCKED by API 500)

| Test ID | Field(s) Saved | Expected History Columns |
|---------|----------------|------------------------|
| TC-LOC-PRI-024 | chkPriceGuideInclusive | Col 62: Include SC in Price Guides |

### Location Currency Spec (5 saves)

| Test ID | Field(s) Saved | Expected History Columns |
|---------|----------------|------------------------|
| TC-LOC-CUR-021 | chkCADSelected (ON) | Col 6/64: Currency |
| TC-LOC-CUR-022 | drpUSDMerchant (Bahamas) | **Merchant not in 87 cols — possible gap** |
| TC-LOC-CUR-023 | CAD selected + default cascade | Col 6/64 |
| TC-LOC-CUR-024 | CAD + merchant (multi-field) | Col 6/64 + **merchant gap** |
| TC-LOC-CUR-027 | chkUSDIsDefault (uncheck) | Col 6/64 |

### Location Legal Spec (3 saves)

| Test ID | Field(s) Saved | Expected History Columns |
|---------|----------------|------------------------|
| TC-LOC-LGL-011 | drpLegalServiceCharge0 | Col 34: Service Charge Name |
| TC-LOC-LGL-012 | drpLegalTerms0 | Col 38: Terms and Conditions |
| TC-LOC-LGL-018 | Both SC + T&C | Cols 34, 38 |

### Location Account & Address Spec (2 saves)

| Test ID | Field(s) Saved | Expected History Columns |
|---------|----------------|------------------------|
| TC-LOC-ACC-019/020 | txtPhone2 | Col 57: Venue/Branch Account Phone2 |

### Location Shared Setup Spec (7+ saves)

| Test ID | Field(s) Saved | Expected History Columns |
|---------|----------------|------------------------|
| TC-LOC-SSL-008 | chkSharesInventory (self-row ON) | Cols 59-61 |
| TC-LOC-SSL-018 | Add location row | Cols 59-61 |
| TC-LOC-SSL-019 | Non-self toggle OFF | Cols 59-61 |
| TC-LOC-SSL-020 | Delete row | Cols 59-61 |
| TC-LOC-SSL-021 | Combined (self toggle + add) | Cols 59-61 |

### Location Notes Spec (saves exist)

| Field(s) Saved | Expected History Columns |
|----------------|------------------------|
| Note content | Col 70: Notes |

### Location Auto Add-On Spec (saves exist)

| Field(s) Saved | Expected History Columns |
|----------------|------------------------|
| Add-on checkbox toggles | **NO COLUMN in 87 — possible gap** |

---

## MCP-Supreme-Truth Protocol

> **RULE**: MCP live DOM findings are the SUPREME TRUTH. Every assumption in this plan — from column counts, to
> field mappings, to save-to-row granularity — is a HYPOTHESIS until MCP-verified. If MCP contradicts this plan,
> the plan is WRONG and must be updated. Not the other way around.

**Execution agent obligations**:
1. Before implementing ANY Phase 1+ code, complete ALL Phase 0 MCP verification
2. After Phase 0, review EVERY section of this plan and mark assumptions as `[MCP-CONFIRMED]` or `[MCP-CONTRADICTED]`
3. If MCP contradicts a field mapping, column count, or granularity assumption — update the plan FIRST, then proceed
4. Do NOT write test code that asserts something MCP has not confirmed
5. Do NOT trust column indices from this plan without verifying header text on live DOM
6. Record all MCP findings with timestamp: `[MCP-VERIFIED: YYYY-MM-DD HH:MM] finding text`

**What MCP must verify (minimum)** — *[SP1 verification status added 2026-04-13]*:
- Actual column count (87? 42? different?) — [MCP-CONFIRMED: 87 and 42 exact]
- Actual column header TEXT at each index (do NOT trust field mapping table — verify) — [MCP-CONFIRMED: all headers documented in SP1 §1-§2]
- Row granularity (1 save = ? rows) — [MCP-CONFIRMED: 1 save = 1 row (full snapshot). SP1 §3]
- Whether history is populated or empty for test location — [MCP-CONFIRMED: populated. 147 pages (Loc Mgmt), 61 pages (Local Office). SP1 §1-§2]
- Whether tab navigation triggers unsaved-changes dialog — [MCP-CONFIRMED: dirty form → History tab = "Unsaved changes" dialog (Stay/Discard). Post-save = no dialog. SP1 §11]
- How boolean values render ("true"/"false" vs "Yes"/"No" vs checkbox icon) — [MCP-CONFIRMED: Loc Mgmt = Unicode ✔/empty. Local Office = SVG lucide-check/empty (textContent="" for both). SP1 §2-§3]
- How timestamps render (format, timezone) — [MCP-CONFIRMED: format "MM/DD/YYYY HH:MM:SS AM/PM". Timezone undetermined — use time-window matching. SP1 §3]
- How null/empty values render (blank cell vs "null" vs "-" vs "N/A") — [MCP-CONFIRMED: empty string "". SP1 §4]
- How percentage values render (0.30 raw vs "30%" display vs "0.3" stripped) — [MCP-CONFIRMED: raw decimal (e.g., "0.30"). SP1 §4]
- Whether row count changes after a save (verify causality, not just presence) — [MCP-CONFIRMED: row count increases by 1 per save. SP1 §3]

---

## What to Watch For (Awareness Checklist)

> Not coded infrastructure — just a reference for the execution agent when reading history rows.
> Document anything unexpected as a finding. File bug reports only when user authorizes Phase 3B.

| Check | What to Look For |
|-------|-----------------|
| **Row exists?** | After save, does a new row appear? If not → NOT-TRACKED or app bug |
| **Value correct?** | Does the column show what we saved? Watch for: old value shown instead of new, i18n key leaks, precision loss, "null" literal for empty fields |
| **Modified By/On present?** | Every row should have a user and timestamp |
| **Boolean format?** | "true"/"false" vs "Yes"/"No" vs checkmark — MCP discovers actual format, use consistently |
| **Percentage format?** | Raw decimal (0.30) vs display (30%) — MCP discovers actual format |
| **Duplicate headers?** | Known: cols 41, 64. Check if values are in the expected column or swapped |
| **Table refresh?** | Does the table show fresh data after tab switch, or does it need a page reload? |
| **Horizontal scroll?** | With 87 columns, are off-screen columns in DOM or do we need to scroll before reading? |
| **Vertical scroll?** | With many history rows, are off-screen rows in DOM or lazily loaded? Check if `getRowCount()` returns total or only visible rows. |
| **Row granularity?** | Does 1 save = 1 row, or 1 changed field = 1 row? Multi-field saves reveal this. |
| **Async write delay?** | If row doesn't appear immediately, wait 5s and retry before concluding "missing" |
| **Cascade side-effects?** | Toggling a parent checkbox may cascade to children — does that create extra rows? |

**Known bugs (pre-existing — updated per SP1 MCP findings 2026-04-13)**:
- ~~Col 28: renders untranslated i18n key~~ [MCP-CONTRADICTED: renders correctly as "Calculate LDW on Net Amount". Bug disproved.]
- ~~Col 41: duplicate header~~ [MCP-CONTRADICTED: header is "Enable Set/Strike Labor Minutes", not a duplicate of col 40. Bug disproved.]
- Col 64: duplicate column name "Currency" (secondary pricing currency) [MCP-CONFIRMED: both col 6 and col 64 are named "Currency". Genuine duplicate — use index-based access for col 64.]

---

## Phase Plan

### Phase 0: MCP Discovery (HARD GATE — must complete before Phase 1)

> **STATUS**: Phase 0 Sub-Plan 1 (MCP Discovery) COMPLETE — executed 2026-04-13, audited 2026-04-13.
> All 10 MCP verification items confirmed. All contingency branches resolved.
> Findings documented in [SP1_MCP_FINDINGS.md](SP1_MCP_FINDINGS.md).
> Phase 0 gate PASSED — Phase 1 may proceed.

> Phase 0 is the MOST IMPORTANT phase. Everything after it is conditional on what MCP reveals.
> Do not rush past this. The agent doing this work must complete ALL 8 tasks and record findings
> before any code is written.

**8 concrete MCP tasks**:

| # | Task | Where to Go | What to Do | What to Record |
|---|------|-------------|------------|----------------|
| 0.1 | Check Location Mgmt History exists | Location 1604 → History outer tab | Count `<th>`, read first row if any | Column count, populated or empty |
| 0.2 | Check Local Office History exists | Local Office 1604 → History tab | Count `<th>`, check "No results." | Column count, populated or empty |
| 0.3 | Test causality: does save create row? | Any tab → change a field → save → History tab | Count rows before and after | Does row appear? How many? If not immediately, wait 5s and retry. |
| 0.4 | Read one complete row | History tab → latest row (after 0.3 save) | Read ALL column values in that row | Boolean format, date format, number format, empty cell format, old-vs-new value, full-snapshot-vs-changed-only |
| 0.5 | Test multi-field save granularity | Change 2 fields at once → save → History | Count new rows | 1 row per save? Or 1 row per field? |
| 0.6 | Read all column headers | History tab → every `<th>` text, L-to-R | Document actual header at each position | Compare against mapping tables. Update tables if different. Flag duplicate headers with their indices. |
| 0.7 | Test table refresh on tab switch | Save on Tab A → switch to History (no reload) | Does new row appear immediately? | Stale = need page reload before every history check. Also verify: click sort on Modified On column — does it actually reorder rows? Note default sort direction and rows-per-page count. |
| 0.8 | Test horizontal scrolling (87 cols) | History tab → scroll right | Check if off-screen columns are in DOM | Virtual scroll = need `scrollToColumn()` in page object |

**Phase 0 outputs** (required before proceeding):
- `[MCP-VERIFIED: YYYY-MM-DD HH:MM]` tag on every finding
- Contingency branch selected (see below)
- Column mapping tables updated if MCP contradicts them
- NOT-TRACKED registry: fields with saves but no corresponding history column

**Contingency Branches** (selected based on MCP findings — *SP1 selections added 2026-04-13*):

| Finding | Action | SP1 Result |
|---|---|---|
| History empty AND save doesn't create row | File as BUG. Cancel integration tests for that history system. | **NOT triggered** — both systems populated, saves create rows |
| History is per-field (1 field = 1 row) | Phase 2 verification checks N rows per N-field save | **NOT triggered** — per-save (full snapshot) |
| History is per-save (full snapshot row) | Phase 2 verification checks 1 row per save | **SELECTED** — SP1 §3 confirmed |
| History table doesn't refresh on tab switch | All history checks preceded by page reload | **NOT triggered** — tab switch = live data |
| 87 columns use virtual horizontal scroll | Page object adds `scrollToColumn(headerText)` method | **NOT triggered** — DOM-based, all cols present |
| Modified On format is relative ("2 min ago") | Cannot use timestamp matching — use row-count delta + value matching only | **NOT triggered** — absolute format "MM/DD/YYYY HH:MM:SS AM/PM" |

**0.9 — Determine "Not Tracked" fields**:
- Cross-reference all saved fields (from "Saves Per Spec" tables) against actual column headers from Task 0.6
- Fields with no matching column → NOT-TRACKED registry
- Suspected list: PO Number, PO Number Label, Room Config, BenefitsMultiplier, HistoricalSubrental, LaborCosts, EnableMultidayPricing, Merchant currency, Auto Add-On checkboxes

**0.10 — Search requirements docs for formal history rules**:
- Check `Functional Requirements v1` + `Encore-Requirements-V2` for explicit history recording rules
- **Deliverable**: oral requirement vs formal doc vs live DOM comparison table

**0.5 — Delegate to HUNTER (`@playwright-requirements`)** *(Agent: Requirements)*:
- Input: Phase 0 MCP findings, NOT-TRACKED field list, oral-vs-formal comparison
- HUNTER updates REQUIREMENTS.md with history tracking rules, NOT-TRACKED registry
- **HARD GATE**: REQUIREMENTS.md must be updated before Planner creates integration TCs

**0.6-W — Phase 0.5 Walkthrough (Generator pre-work)** *(LR-013 compliance)*:
- Phase 0 MCP findings serve as the structured walkthrough
- Document in generator-walkthrough format per PF-G5 gate

**0.7-P — Delegate to GIVER (`@playwright-test-planner`)** *(Agent: Planner)*:
- Based on VERIFIED Phase 0 findings (not pre-MCP assumptions)
- GIVER appends 1-2 `TC-XXX-HIST` integration TCs to each module's test case file
- GIVER updates test plans with "Integration: History Verification" section
- GIVER re-exports CSVs: `npm run planner:export-all`

### Phase 1: Infrastructure (Page Objects + Selectors) *(Agent: BUILDER)*

**1.0 — Generate `location-management-history.spec.ts` from 19 existing TCs** *(HARD DEPENDENCY for Phase 2.3–2.10)*:
- Queue item `location-management-history` at `pending_generation` → transition to `generation → testing`
- Output: `tests/specs/setup/locations/location-management-history.spec.ts`
- This spec tests History tab UI independently (pagination, sorting, columns, read-only)
- **Can run in parallel with Phase 0** — structural spec doesn't need MCP findings
- Post-generation: `npm run generator:post-complete location-management-history` (validates spec output)

**1.1 — Create Location Management History artifacts**:
- Selector file: `src/selectors/setup/locations/history.ts`
- Page object: `src/pages/setup/locations/location-management-history.page.ts`
- Test data: `tests/test-data/setup/locations/location-management-history.data.ts`
- Update barrel: `src/selectors/setup/locations/index.ts`
- Register fixture in `tests/setup/fixtures.ts`
- Key methods (simple — no HistoryVerifier):
  - `navigateToHistoryTab()` — clicks tab, waits for table
  - `getColumnHeaders(): Promise<string[]>` — reads all `<th>` text
  - `getColumnByHeader(rowIndex: number, headerText: string): Promise<string>` — finds column by header name, reads cell value (**robust against column reordering**). For known duplicate headers (cols 41/64), returns first match — caller uses distinct adjacent column values to disambiguate if needed.
  - `getLatestRowValues(headerTexts: string[]): Promise<Record<string, string>>` — reads multiple columns from latest row by header name
  - `getRowCount(): Promise<number>`
  - `sortByModifiedOnDesc(): Promise<void>`
  - If MCP found horizontal scroll → add `scrollToColumn(headerText): Promise<void>`

**1.2 — Enhance Local Office History page object**:
- Add same simple methods to existing `local-office-settings.page.ts`:
  - `getHistoryColumnByHeader(rowIndex, headerText)`, `getLatestHistoryValues(headerTexts[])`, `getHistoryColumnHeaders()`, `sortHistoryByModifiedOnDesc()`

**1.3 — Validation & Catalog**:
- `npm run typecheck` (COP-002)
- `npm run selectors:catalog` (ALL-006)
- Activity log entry (LR-028)

### Phase 2: Integration Tests Per Spec *(Agent: BUILDER)*

**Approach**: ONE new test appended at end of each spec's `describe.serial` block. Zero changes to existing tests.

**Why this works**: Each spec's test plan documents exactly what fields are saved. The history test uses that static knowledge — no runtime tracking needed.

**Design pattern**:
```typescript
// Appended as LAST test in describe.serial block
test('TC-XXX-HIST: Verify saves appear in history', async ({ page, pageName, historyPage }) => {
  test.setTimeout(60_000);

  // Clear dirty state + handle unsaved-changes dialog (LR-026)
  await page.reload({ waitUntil: 'domcontentloaded' });
  await pageName.waitForAngularStable();
  const dialog = page.locator('[role="alertdialog"]');
  if (await dialog.isVisible({ timeout: 2000 }).catch(() => false)) {
    await page.getByRole('button', { name: 'Discard' }).click();
    await dialog.waitFor({ state: 'hidden' });
  }

  // Navigate to history tab
  await historyPage.navigateToHistoryTab();
  await historyPage.sortByModifiedOnDesc();

  // Read latest row by HEADER TEXT (not column index — robust against reordering)
  const latest = await historyPage.getLatestRowValues([
    'Prep Date Offset',  // expected: value from TC-XXX-005
    'Use Fulfillment',   // expected: value from TC-XXX-013
    'Modified By',       // expected: present (non-empty)
    'Modified On',       // expected: present (non-empty)
  ]);

  // Assert expected values using soft assertions (report ALL mismatches)
  expect.soft(latest['Modified By'], 'Modified By should be present').toBeTruthy();
  expect.soft(latest['Modified On'], 'Modified On should be present').toBeTruthy();
  expect.soft(latest['Prep Date Offset'], 'Prep Date Offset').toBe('-2');
  expect.soft(latest['Use Fulfillment'], 'Use Fulfillment').toBe('true'); // format from MCP Phase 0
});
```

**Key design decisions**:
- `expect.soft()` for each check — reports ALL mismatches, not just first
- Column access by **header text** — robust against column reordering (no hardcoded indices)
- **Zero changes to existing tests** — no `recordSave()`, no tracker, no blast radius
- Expected values are **static** from the test plan (we know what each TC saves)
- Exact expected values and formats filled in AFTER Phase 0 MCP verification
- For boolean and percentage columns, use the exact format discovered in Phase 0 Task 0.4 — do not assume `'true'`/`'false'` or decimal vs percentage display. Consult Task 0.4 findings before writing any assertion value for non-text columns.
- If Phase 0 Task 0.3 reveals async write delay (row doesn't appear immediately after save), the execution agent must add an appropriate polling wait. Phase 0 should document the observed delay and recommend the strategy — do not add speculative polling code before Phase 0 confirms the problem exists.
- If Phase 0 found stale-tab behavior → add `page.reload()` before navigating to history

**Per-Spec plan**:

| # | Spec | History System | Key Columns to Verify | Priority |
|---|------|---------------|----------------------|----------|
| 2.1 | local-office-settings | Local Office History | Date offsets, misc checkboxes, phone, order type | P0 |
| 2.2 | local-office-ect | Local Office History | ECT labor fields (if tracked — Phase 0 determines) | P1 |
| 2.3 | location-local-information | Location Mgmt History | Billing, LDW, ETS, SC, C&C, Oracle fields, misc checkboxes | P0 |
| 2.4 | location-pricing | Location Mgmt History | Price guide inclusive, pricebook fields | P1 |
| 2.5 | location-currency | Location Mgmt History | Currency columns | P2 |
| 2.6 | location-legal | Location Mgmt History | Service Charge Name, Terms & Conditions | P2 |
| 2.7 | location-account-address | Location Mgmt History | Phone fields | P2 |
| 2.8 | location-shared-setup | Location Mgmt History | Shared setup action/ID/name | P2 |
| 2.9 | location-notes | Location Mgmt History | Notes column | P3 |
| 2.10 | location-auto-addon | Location Mgmt History | TBD — may be NOT-TRACKED | P3 |

### Phase 3A: Validation *(Agent: BUILDER + HEALER if failures)*

**3A.1**: `npm run typecheck` — ensure all new/modified files compile (COP-002)
**3A.2**: Run each spec individually → confirm history integration test passes
**3A.3**: Run all specs together → fix serial contamination (delegate to HEALER if failures)
**3A.4**: `npm run planner:export-all` — regenerate all CSV exports to reflect new integration TCs (COP-005)
**3A.5**: Activity log entry: `specs_planning/_internal/agent-activity-log.md` (LR-028)
**3A.6**: Post-execution audit by WATCHDOG — verify field mapping accuracy, selector catalog completeness, CSV freshness

### Phase 3B: Bug Documentation (**GATED — user must authorize**) *(Agent: OWNER)*

> **HALT**: Do NOT execute Phase 3B until user explicitly says "create the bug reports now."
> This respects the original requirement: "these things are bugs, u have to find, but not right now"
> and "at last when i tell u, create a bug report with all bugs u found." (R21 — user explicit requests = top priority)

**3B.1**: Compile NOT-TRACKED registry — all fields that save but produce no history entry
**3B.2**: Create bug reports for all confirmed history discrepancies:

**Known Bugs (pre-existing)**:
- Col 28: renders untranslated i18n key `locations.history.CalcDamageWaiverOnNetAmount`
- Col 41: duplicate header "Set/Strike/Support Labor Billing Goal"
- Col 64: duplicate column name "Currency" (secondary pricing currency)

**Suspected Bugs (to confirm via Phase 0 MCP)**:
- PO Number/PO Number Label changes not tracked in Local Office History
- Room Configuration changes not tracked in Local Office History
- BenefitsMultiplier/HistoricalSubrental changes not tracked in Local Office History
- EnableMultidayPricing changes not tracked in Location Mgmt History
- Merchant currency changes not tracked in Location Mgmt History
- Auto Add-On checkbox changes not tracked in Location Mgmt History

**3B.3**: File bug reports per LR-034 protocol to `reports/bugs/BUG-HIS-{NNN}.json`
**3B.4**: Update affected specs with `test.skip('bug-blocked: BUG-HIS-NNN')` where applicable

---

## Sub-Plan Completion Gate

**MANDATORY** — every sub-plan must pass these 5 checks before the executing agent marks it DONE.
Added after SP1 Round 2 audit found 14 fuckups from 3 root causes: handoff blindness, checklist blindness, undocumented observations.

| # | Check | Prevents | What to Do |
|---|---|---|---|
| 1 | **Handoff audit** | Discovery ≠ handoff (7 of 14 fuckups) | Re-read your deliverables as the NEXT agent who has ZERO context and NO MCP access. Can they implement from your output alone? If a BUILDER can't write an assertion from your format description, it's incomplete. |
| 2 | **Parent plan cross-check** | Checklist blindness (3 of 14) | Re-read the master plan's "What MCP must verify," "What to Watch For," and "Execution agent obligations." Is every item relevant to your phase covered? Uncovered item = audit finding. |
| 3 | **Observation log** | Undocumented surprises (4 of 14) | Document EVERY unexpected finding — format surprises, UI workarounds, behaviors that contradicted the plan. Even minor ones. If you worked around something, write it down. |
| 4 | **Format precision** | Downstream failures | Every data format must be EXACT and copy-pasteable. "Boolean column" is NOT sufficient. "SVG lucide-check icon, detect via `innerHTML.includes('lucide-check')`, textContent='' for both true and false" IS sufficient. |
| 5 | **Activity log** | Invisible sessions | Entry per LR-028 with files modified and key findings. |

---

## Success Criteria

1. Phase 0 MCP findings documented with `[MCP-VERIFIED]` tags — all 8 tasks completed
2. Column mapping tables updated to match live DOM (or marked NOT-TRACKED)
3. Every spec with saves has a final history verification test appended
4. Integration tests pass individually and in full suite (no serial contamination)
5. NOT-TRACKED registry documents all confirmed untracked fields
6. REQUIREMENTS.md updated by HUNTER with verified history rules
7. All new page objects/selectors registered, `npm run typecheck` passes
8. Fresh CSV exports generated via `npm run planner:export-all` — reflect all new integration TCs
9. Discovered bugs collected — filed only when user authorizes Phase 3B

---

## Risk Register

| # | Risk | Mitigation |
|---|------|------------|
| R1 | History empty and stays empty after save | Phase 0 Task 0.3 is hard gate. If confirmed → file BUG, cancel integration tests for that system |
| R2 | Column order differs from REQUIREMENTS.md | Use header-text-based column access, never hardcoded indices |
| R3 | History table doesn't refresh on tab switch | Phase 0 Task 0.7 detects. If true → page reload before every history check |
| R4 | Granularity is per-field not per-save | Phase 0 Task 0.5 determines. Adjust row-reading logic accordingly |
| R5 | 87 columns use virtual horizontal scroll | Phase 0 Task 0.8 detects. If true → add scrollToColumn() to page object |
| R6 | Async history write (row not immediately visible) | Add polling wait after save. 5s retry in Phase 0 Task 0.3 tests this |
| R7 | Angular dirty state dialog blocks history tab navigation | All history checks start with page reload + dialog dismiss (LR-026) |
| R8 | Location Mgmt History spec generation delayed (pending_generation) | Phase 1.0 runs in parallel with Phase 0 — doesn't need MCP findings |

---

## Reference Files

| Category | Path |
|----------|------|
| Master Plan | `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md` |
| REQUIREMENTS.md (Location Mgmt History) | `docs/REQUIREMENTS.md` lines 826-960 |
| REQUIREMENTS.md (Local Office History) | `docs/REQUIREMENTS.md` lines 1103-1161 |
| Location Mgmt History Test Cases | `specs_planning/test-cases/setup/locations/locations_management_history_test_cases.md` |
| Location Mgmt History Test Plan | `specs_planning/test-plans/setup/locations/locations_management_history_test_plan.md` |
| Local Office History Spec | `tests/specs/setup/local-office/local-office-history.spec.ts` |
| Local Office History Test Data | `tests/test-data/setup/local-office/local-office-history.data.ts` |
| Local Office Page Object | `src/pages/setup/local-office/local-office-settings.page.ts` (history methods lines 517-642) |
| Local Office Selectors | `src/selectors/setup/local-office/local-office-settings.ts` (history selectors lines 119-127) |
| Pipeline Queue Entry | `specs_planning/_internal/agent-queue.json` (id: `location-management-history`, stage: `pending_generation`) |
| Requirements v1 | `docs/read_only_docs/Functional Requirement -v1.docx` |
| Requirements V2 | `docs/read_only_docs/Encore-Requirements-V2.docx` |
| Location Specs | `tests/specs/setup/locations/*.spec.ts` (8 files) |
| Local Office Specs | `tests/specs/setup/local-office/*.spec.ts` (3 files) |
| All Page Objects | `src/pages/setup/locations/`, `src/pages/setup/local-office/` |
| All Selectors | `src/selectors/setup/locations/`, `src/selectors/setup/local-office/` |
| All Test Data | `tests/test-data/setup/locations/`, `tests/test-data/setup/local-office/` |
| Fixtures | `tests/setup/fixtures.ts` |
| Selector Catalog | `src/selectors/SELECTOR_CATALOG.md` |
| Activity Log | `specs_planning/_internal/agent-activity-log.md` |
| Agent Mistakes Registry | `specs_planning/_internal/agent-mistakes.md` |
| Module Registry | `docs/MODULE_REGISTRY.md` |

---

## Audit Trail

| Date | Auditor | Action | Gaps Found | Status |
|------|---------|--------|------------|--------|
| 2026-04-13 | WATCHDOG (multi-agent) | Full-chain audit against original prompt + all 5 agent perspectives | 13 gaps (G-01..G-13) | All resolved in plan v2 |
| 2026-04-13 | WATCHDOG (v3) | Bug taxonomy + save tracker + MCP-supreme-truth + RCA assertions | 14 new questions, 4 new risks, save-tracker architecture | Applied in plan v3 |
| 2026-04-13 | OWNER (v4 audit) | Simplification: removed over-engineered HistoryVerifier/SaveTracker/BugTaxonomy, added contingency branches, zero blast radius | 6 critical findings (F-001..F-006) | Applied in plan v4 |
| 2026-04-13 | OWNER (v4-final) | Applied 6 micro-edits from 2 external audit rounds: vertical scroll row, duplicate header flagging, sort verification, duplicate disambiguation note, boolean/percentage format anchor, async delay note | 6 micro-edits | Final — ready for execution |

**v4 Changes Summary**:
- **Removed**: HistoryVerifier utility class, SaveRecord/SavedField interfaces, 28-type Bug Taxonomy, RCA error message templates, Phase 1.4 (history-verifier.ts), `recordSave()` injection into existing tests
- **Added**: 8 concrete MCP tasks (replaces 14 abstract questions), contingency branches for Phase 0 findings, horizontal scroll + table refresh checks, UNVERIFIED disclaimers on mapping tables
- **Changed**: Column access by header text (not index), one new test per spec (not tracker), success criteria 15→8, risks 12→8
- **Why**: v3 built speculative infrastructure on unverified assumptions. MCP findings should determine approach, not up-front architecture.

**Gaps Resolved (v1-v3)**:
- G-01/G-02: HUNTER delegation added (Phase 0.5) — REQUIREMENTS.md ownership respected (R11)
- G-03/G-04/G-05: GIVER delegation added (Phase 0.7) — test cases + test plans + CSV export
- G-06: Structural spec generation added (Phase 1.0) — hard dependency for location integration
- G-07: Fixture registration added to Phase 1.1
- G-08: Phase 0.5 walkthrough mapped (Phase 0.6-W) — satisfies LR-013 / PF-G5 gate
- G-09: `npm run typecheck` added (Phase 1.3, Phase 3A.1)
- G-10: Unsaved Changes dialog handling in Phase 2 design pattern (LR-026)
- G-11: `page.reload()` baseline enforcement in Phase 2 design pattern (LR-019)
- G-12: Phase 3 split into 3A (validation) + 3B (bug docs, GATED on user approval) — respects R21
- G-13: `npm run selectors:catalog` + activity log entries (Phase 1.3, Phase 3A.4)
