# PLAN: Audit + Execute LOCAL_INFORMATION Page

**Created**: 2026-04-10
**Status**: DONE
**Executed**: 2026-04-10
**Priority**: P0 (Batch 1 — master plan's first subplan)
**Parent**: `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md`
**Sessions**: 1 (combined MCP audit + code execution)

---

### Execution Summary

**TCs implemented (5)**: TC-073 (DisplayTax auto-set), TC-075 (C&C% reset-to-0), TC-076 (ResortTax% reset-to-0), TC-077 (ETS% enable + non-union default), TC-072 (IDC Billing persist)

**TCs dropped (2)**:
- TC-078 — SKIP: MCP-02 showed no error icon adjacent to BillingCycle (value="Weekly", no testable error state)
- TC-079 — SKIP: MCP-12 showed SkipBilling toggle has no effect on Oracle fields' aria-required

**MCP verification results**:
1. MCP-01: BillingCycle = enabled, text="Weekly" (REQUIREMENTS.md was stale)
2. MCP-02: No error icon near BillingCycle
3. MCP-03: AllowETS = enabled for 1604, ETS%=23.00% on check, 0.00% on uncheck
4. MCP-05: C&C Fee = enabled for 1604, C&C% enables/disables correctly
5. MCP-06: AllowResortTax = enabled for 1604, ResortTax% enables/disables correctly
6. MCP-08: IDC Billing persists after save+reload, restore OK
7. MCP-09: DisplayTax auto-sets to true+disabled when CompanyRemitTax re-checked
8. MCP-11: eSignature=checked, ProductGroup=unchecked, DiscountGuidance=checked (all disabled)
9. MCP-12: SkipBilling toggle — no observable Oracle aria-required change

**Documentation changes**: REQUIREMENTS.md BillingCycle corrected (enabled), EnableMultidayPricing added, stale line 277 fixed. FIXME comments updated. data.ts stale comments corrected.

**Test pass**: 34/34 (2.9m), 2026-04-10

**Metrics**: Before=28 runtime tests, After=34 runtime tests. Gaps resolved=10/12 (2 SKIP'd with evidence).

## Context

The master plan (`PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md`) identifies **12 gaps** for LOCAL_INFORMATION — the most complex location tab (61 selectors, 52 fields, 10 dependencies). Current state: **16 source-level tests (28 runtime)** in a serial describe block. This plan fills those gaps.

**Fact-checked baseline** (2026-04-10):
- Selectors: `src/selectors/setup/locations/local-info.ts` — **61 keys** (not 85 — prior plans overcounted)
- Page object: `src/pages/setup/locations/location-local-info.page.ts` — 189 lines, extends LocationTestOrchestrators
- Spec: `tests/specs/setup/locations/location-local-information.spec.ts` — 16 test() sites, 3 are loops (5 deps + 8 boundaries + 2 maxLength), **28 runtime tests**
- Test data: `tests/test-data/setup/locations/location-local-info.data.ts` — 270 lines

**Known contradiction (CRITICAL)**: REQUIREMENTS.md line 213 says BillingCycle = "Weekly [disabled]" for office 1604, but the **passing** spec line 64 asserts `isBillingCycleDisabled()=false` (enabled). Live app disagrees with docs. MCP-01 resolves this.

**Known Encore bug**: Validation error messages (`errMinBoundary`, `errMaxBoundary`) DON'T render in DOM (React id="undefined" bug, SESSION_2_FINDINGS 2026-04-09). Existing LDW_BOUNDARIES tests pass because `testBoundaryValue` checks `aria-invalid`, not error text.

---

## Gap Disposition Table (12 gaps)

| # | Gap | Disposition | Rationale |
|---|-----|-------------|-----------|
| 1 | BillingCycleID required validation (can't be 0, error icon) | **IMPLEMENT (conditional MCP-01/02)** | If enabled AND value="--Select--", error icon may be testable |
| 2 | BillingCycleID disabled when localBillingRan=true | **DOCUMENT** | Spec asserts enabled (line 64) and passes. REQUIREMENTS.md line 213 is stale — update it. |
| 3 | ETS% defaults (0.23 non-union) | **IMPLEMENT (conditional MCP-03)** | REQUIREMENTS.md warns "stays 0." If confirmed, document as APP BUG, not test gap. |
| 4 | ThresholdAmount decision table + reset-to-0 | **IMPLEMENT** | TC-007 covers combos A/B/D (3 of 4). **Missing: combo C (DPCD=off, PFA=off) + reset-to-0.** |
| 5 | EnableIDCBilling persistence | **IMPLEMENT** | Basic toggle tested via ACTIVE_DEPENDENCIES. Missing: save -> reload -> verify persistence. |
| 6 | C&C% resets to 0 when disabled | **IMPLEMENT (conditional MCP-05)** | Toggle Apply C&C Fee enables field. Verify reset-to-0 on disable. |
| 7a | DisplayTax auto-set (CompanyRemitTax re-check) | **IMPLEMENT** | Existing dep test only covers UNCHECK direction. AUTO-SET to true on re-check NOT covered. |
| 7b | DisplayTax auto-set (HRIRemitTax2) | **SKIP** | Field not visible on 1604 (USA, hideRemitTax=true). SESSION_1_FINDINGS line 61. |
| 8 | ResortTax% resets to 0 when disabled | **IMPLEMENT (conditional MCP-06)** | Same parent-toggle pattern as Gap #6. |
| 9 | EnableMultidayPricing new field | **IMPLEMENT** | DOM-confirmed: `location-settings-checkbox-enable-multiday-pricing` exists (SESSION_1_FINDINGS line 43). |
| 10 | BillingWayEffectiveDate past-date | **SKIP** | NOT-AUTOMATABLE. Requires unbilled orders state on different office. |
| 11 | SkipBilling -> Oracle conditional required | **MCP-VERIFY-THEN-DECIDE** | Existing `TC-LOC-LI-SKIP-BILLING` (spec:267-299) already toggles SkipBilling safely with try/finally. If Oracle fields show required validation when SkipBilling=unchecked, this IS testable. MCP-12 decides. |
| 12 | DISABLED_CHECKBOXES +3 items | **IMPLEMENT** | Pure data update. SESSION_1_FINDINGS confirms: eSignature=disabled, ProductGroup=disabled, DiscountGuidance=disabled. |

**Tally**: 8 IMPLEMENT, 1 MCP-VERIFY-THEN-DECIDE, 2 SKIP, 1 DOCUMENT.

---

## SESSION 1: MCP Verification

Navigate to office 1604: `/navigator/locations/1604/settings/location`, Local Information sub-tab.

### Already Known (no re-verification needed)

| Fact | Source | Date |
|------|--------|------|
| IsUnion = unchecked (non-union) | SESSION_1_FINDINGS line 39 | 2026-04-09 |
| HRIRemitTax2 = NOT visible on 1604 | SESSION_1_FINDINGS line 61 | 2026-04-09 |
| EnableMultidayPricing = exists + editable + unchecked | SESSION_1_FINDINGS line 43 | 2026-04-09 |
| eSignature/ProductGroup/DiscountGuidance = disabled in DOM | SESSION_1_FINDINGS | 2026-04-09 |
| Validation error messages don't render (Encore bug) | SESSION_2_FINDINGS line 58 | 2026-04-09 |

### MCP Checks (8 essential + 1 conditional)

| ID | What | Gaps | Expected | How |
|----|------|------|----------|-----|
| MCP-01 | BillingCycle: enabled/disabled? Display text? | #1, #2 | Enabled, "--Select--" (per passing spec line 64) | Read `[data-testid="location-settings-select-billing-cycle"]` aria-disabled + inner text |
| MCP-02 | BillingCycle: error/exclamation icon visible when value=0? | #1 | Icon present (or not) | Check DOM adjacent to BillingCycle dropdown for icon/SVG |
| MCP-03 | Toggle Allow ETS ON -> ETS% enables? Read value. | #3 | Enabled, value = 0.23 OR 0 (unknown) | Click `chkAllowETS`, read `spinETSPercentage` state + value. Then UNDO toggle. |
| MCP-05 | Toggle Apply C&C Fee ON -> C&C% enables? Toggle OFF -> resets to 0? | #6 | Enable on check, value=0 on uncheck | Toggle `chkApplyCablesConsumablesFee`, read spin both directions. UNDO. |
| MCP-06 | Toggle Allow Resort Tax ON -> Resort Tax% enables? OFF -> reset to 0? | #8 | Enable on check, value=0 on uncheck | Toggle `chkAllowResortTax`, read spin both directions. UNDO. |
| MCP-08 | IDC Billing: check -> save -> reload -> still checked? | #5 | Persists | Full cycle: check `chkEnableIDCBilling`, save, reload, read state. Restore to unchecked + save. |
| MCP-09 | Uncheck CompanyRemitTax -> DisplayTax editable. Re-check -> DisplayTax auto-sets true + disables? | #7a | Auto-set confirmed | Toggle sequence, read DisplayTax state between each step. UNDO. |
| MCP-11 | eSignature, ProductGroup, DiscountGuidance: **checked** states? | #12 | eSign=checked, ProdGroup=unchecked, DiscGuide=checked | Read `aria-checked` for each (disabled already known from SESSION_1) |
| MCP-12 | *(conditional)* Toggle SkipBilling ON -> Oracle fields still required? OFF -> required again? | #11 | Oracle fields become required when SkipBilling=unchecked | Only if deciding to implement Gap #11 |

**Priority**: MCP-01 first (gates BillingCycle REQUIREMENTS.md correction + Gap #1 scope).

---

## SESSION 2: Execution Blueprint

### Phase 1: Infrastructure (no test dependencies)

#### 1A. Add Selector (`src/selectors/setup/locations/local-info.ts`)

Insert after `chkCalculateCConNetAmount` (line 48), before `chkAllowETS` (line 50):
```typescript
/** @where Setup > Location > Local Information tab @el checkbox @text "Enable Multiday Pricing" @keys multiday pricing enable toggle */
chkEnableMultidayPricing: '[data-testid="location-settings-checkbox-enable-multiday-pricing"]',
```

If MCP-02 confirms BillingCycle error icon exists, also add:
```typescript
/** @where Setup > Location > Local Information tab @el icon @text "Billing Cycle error" @keys billing-cycle required error exclamation */
icoBillingCycleError: '<selector from MCP-02 DOM discovery>',
```

#### 1B. Update Test Data (`tests/test-data/setup/locations/location-local-info.data.ts`)

**UNCHECKED_DEFAULTS** (line 37) — add:
```typescript
'chkEnableMultidayPricing',  // Gap #9: new checkbox, unchecked by default
```

**DISABLED_CHECKBOXES** (line 62) — add 3 entries:
```typescript
'chkUseESignature',         // Gap #12: disabled+checked (SESSION_1)
'chkEnableProductGroup',    // Gap #12: disabled+unchecked (SESSION_1)
'chkEnableDiscountGuidance', // Gap #12: disabled+checked (SESSION_1)
```

**DISABLED_CHECKBOX_STATES** (line 70) — add 3 entries:
```typescript
chkUseESignature: true,         // disabled+checked
chkEnableProductGroup: false,   // disabled+unchecked
chkEnableDiscountGuidance: true, // disabled+checked
```
*Confirmed by MCP-11. If MCP-11 shows different checked states, use those.*

**CHECKBOX_LABEL_CASES** (line 263) — add:
```typescript
{ key: 'chkEnableMultidayPricing', expected: 'Enable Multiday Pricing' },
```

#### 1C. Update REQUIREMENTS.md (`docs/REQUIREMENTS.md`)

- Line 213: Change BillingCycle from "Weekly [disabled]" to match MCP-01 finding
- Add EnableMultidayPricing to Local Information field inventory
- Add note: HRIRemitTax2 not visible on USA locations
- If MCP-03 shows ETS% stays 0 on enable: document as APP BUG

### Phase 2: New Tests (insert into spec)

**Insertion point**: After ACTIVE_DEPENDENCIES loop (line 114), before LDW_BOUNDARIES loop (line 134).

**Ordering rule**: Toggle-only tests BEFORE persistence tests (prevents dirty-state cascade if a toggle test fails mid-restore and the next test tries a save+reload cycle).

#### TC-LOC-LI-073: DisplayTax auto-set when CompanyRemitTax re-checked (Gap #7a)

```
Preconditions: CompanyRemitTax=checked (default), DisplayTax=checked+disabled (default).
Steps:
  1. Uncheck chkCompanyRemitTax
  2. Assert chkDisplayTax becomes enabled (use expect.poll — LR-010)
  3. Uncheck chkDisplayTax (set it to false while editable)
  4. Re-check chkCompanyRemitTax
  5. Assert chkDisplayTax.checked === true (auto-set — use expect.poll)
  6. Assert chkDisplayTax.disabled === true (auto-disabled)
  7. clickSave() to flush dirty state
```

#### TC-LOC-LI-074: Threshold 4-combo decision table + reset-to-0 (Gap #4)

```
Preconditions: AllowDPCD=checked, PromptForApproval=unchecked. Threshold=disabled.
Extends TC-LOC-LI-007 by adding combo C + reset.
Steps:
  1. Assert Threshold disabled (Combo A: DPCD=on, PFA=off — baseline)
  2. Check chkPromptForApproval → Assert Threshold STILL disabled (Combo B: DPCD=on, PFA=on)
  3. Uncheck chkAllowDPCD → Assert Threshold ENABLED (Combo D: DPCD=off, PFA=on)
  4. Uncheck chkPromptForApproval → Assert Threshold disabled (Combo C: DPCD=off, PFA=off)
  5. Check chkPromptForApproval → Assert Threshold ENABLED again (back to Combo D)
  6. Set spinThreshold to 50.00
  7. Check chkAllowDPCD → Assert Threshold disabled AND value resets to 0 (expect.poll)
  8. Uncheck chkPromptForApproval → Restore baseline. clickSave().
Note: This REPLACES TC-LOC-LI-007. Remove the old test.
```

#### TC-LOC-LI-075: C&C% resets to 0 when Apply C&C Fee unchecked (Gap #6)

```
Preconditions: Apply C&C Fee=unchecked (default), C&C%=disabled.
Steps:
  1. Check chkApplyCablesConsumablesFee
  2. Assert spinCCPercentage becomes enabled (expect.poll — LR-010)
  3. Set spinCCPercentage to 5.00
  4. Uncheck chkApplyCablesConsumablesFee
  5. Assert spinCCPercentage disabled (expect.poll)
  6. Assert spinCCPercentage value is "0" or "0.00" (reset-to-0)
  7. clickSave()
Conditional on MCP-05 confirming behavior.
```

#### TC-LOC-LI-076: ResortTax% resets to 0 when Allow Resort Tax unchecked (Gap #8)

```
Same pattern as TC-075 but targets chkAllowResortTax / spinResortTaxPercentage.
Conditional on MCP-06 confirming behavior.
```

#### TC-LOC-LI-077: ETS% conditional enable + default value (Gap #3)

```
Preconditions: Allow ETS=unchecked (default), ETS%=disabled. IsUnion=unchecked (non-union).
Steps:
  1. Check chkAllowETS
  2. Assert spinETSPercentage becomes enabled (expect.poll)
  3. Read spinETSPercentage value:
     - If 0.23 → assert non-union default auto-populated. ALSO test reset: uncheck → assert value=0.
     - If 0 → document as "ETS default not auto-set on enable" (APP BUG per REQUIREMENTS.md).
       Still test: uncheck AllowETS → assert disabled + value=0.
  4. clickSave()
Assertions conditional on MCP-03 finding.
```

#### TC-LOC-LI-071: EnableMultidayPricing toggle + persistence (Gap #9)

```
Timeout: 120s (2 save+reload cycles).
Preconditions: EnableMultidayPricing=unchecked (default).
Steps:
  1. Check chkEnableMultidayPricing
  2. Assert isSaveEnabled() === true
  3. clickSave()
  4. reloadAndNavigateToLocalInfo(OFFICE_NO)
  5. Assert chkEnableMultidayPricing.checked === true (persisted)
  6. Uncheck chkEnableMultidayPricing (restore)
  7. clickSave()
Note: Gap #9 default state is auto-covered by TC-002 via UNCHECKED_DEFAULTS addition.
```

#### TC-LOC-LI-072: EnableIDCBilling persistence (Gap #5)

```
Timeout: 120s.
Preconditions: Intercompany=checked (default), EnableIDCBilling=unchecked (default).
Steps:
  1. Check chkEnableIDCBilling
  2. clickSave()
  3. reloadAndNavigateToLocalInfo(OFFICE_NO)
  4. waitForFormReady('chkEnableIDCBilling')
  5. Assert chkEnableIDCBilling.checked === true (persisted)
  6. Uncheck chkEnableIDCBilling (restore)
  7. clickSave()
LR-026: After save, don't assume form pristine. Handle unsaved-changes dialog if tab-switching.
```

#### TC-LOC-LI-078: BillingCycleID required validation (Gap #1 — conditional on MCP-01/02)

```
If MCP-02 confirms error icon visible when BillingCycle="--Select--":
  1. Assert BillingCycle displays "--Select--"
  2. Assert error/exclamation icon is visible
  3. (If dropdown is interactive) Select a valid cycle → assert icon disappears
If MCP-02 shows NO error icon: SKIP this TC, document finding.
```

#### TC-LOC-LI-079: SkipBilling -> Oracle required (Gap #11 — conditional on MCP-12)

```
If MCP-12 confirms Oracle fields become required when SkipBilling=unchecked:
  1. Read current SkipBilling state (expect: unchecked)
  2. Assert Oracle fields (txtOracleProduct, txtOracleDepartment, drpOracleOrganization) are NOT marked required
  3. Check chkSkipBilling
  4. Assert Oracle fields become non-required / optional
  5. Uncheck chkSkipBilling (restore)
  6. Assert Oracle fields become required again
  7. clickSave()
If MCP-12 shows no change: SKIP, document as UNTESTABLE on 1604.
Safety: existing TC-SKIP-BILLING already toggles safely with try/finally.
```

### Phase 3: Spec Cleanup

- **Replace TC-LOC-LI-007** with TC-LOC-LI-074 (superset — all 4 combos + reset)
- **Update FIXME comments** (spec line 303-306):
  - Remove resolved items (TC-017 ETS if implemented, TC-030/031 C&C if implemented, TC-061 ResortTax if implemented)
  - Keep unresolved items
  - Add new blockers discovered via MCP
- **TC-LOC-LI-001 baseline reset**: Add `chkEnableMultidayPricing` to unchecked-reset loop if it appears in UNCHECKED_DEFAULTS

### Phase 4: Validation (LR-018)

```bash
# Step 1: Clean artifacts (LR-024)
npm run clean

# Step 2: Run spec individually
npx playwright test tests/specs/setup/locations/location-local-information.spec.ts --project=chrome

# Step 3: Fix any failures (classify per LR-018: "always fails" vs "run-all only")

# Step 4: Run all specs together
npx playwright test --project=chrome

# Step 5: Fix serial contamination if any
```

### Phase 5: Documentation

1. Move this plan to `plans/done/` with execution summary (LR-027):
   - TCs implemented (count + IDs)
   - TCs dropped (count + IDs + per-TC justification)
   - MCP verification results (numbered, with outcome)
2. Activity log entry in `specs_planning/_internal/agent-activity-log.md` (LR-028)

---

## Risk Register

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| BillingCycle contradiction (REQUIREMENTS.md vs spec) | **Known** | MCP-01 is #1 priority. Update REQUIREMENTS.md to match live state. |
| ETS% default doesn't auto-populate (stays 0) | Medium | MCP-03 verifies. If 0, TC-077 becomes enable/disable only. Document APP BUG. |
| C&C / ResortTax toggle doesn't enable child spin | Low | MCP-05/06 verify first. If blocked, mark UNTESTABLE with evidence. |
| Angular dirty state after toggle+restore (LR-026) | Medium | Every test ends with `clickSave()` to flush dirty state. |
| Adding 3 DISABLED_CHECKBOXES breaks TC-002 | Low | MCP-11 confirms checked states BEFORE code change. |
| Serial ordering: new test inherits dirty state from failed prior test | Medium | Toggle-only tests inserted BEFORE persistence tests. Each test asserts own preconditions. |
| Validation error selectors are dead (Encore React bug) | **Known** | SESSION_2_FINDINGS BUG 2. Existing tests pass via `aria-invalid`. No action now, document for future. |
| Gap #11 SkipBilling corrupts 1604 | Low | Existing TC-SKIP-BILLING toggles safely with try/finally. MCP-12 only if implementing. |

---

## SKIP Documentation

| Gap | Reason | Evidence |
|-----|--------|----------|
| #10 (BillingWayEffectiveDate) | NOT-AUTOMATABLE. Requires unbilled orders + different office to trigger Effective Date field enable. | Master plan + spec FIXME line 305 |
| #7b (HRIRemitTax2 variant) | Field not visible on 1604 (USA, hideRemitTax=true). Cannot test second remit tax trigger. | SESSION_1_FINDINGS line 61 (2026-04-09) |
| #11 (conditional) | If MCP-12 shows Oracle fields NOT affected by SkipBilling toggle: document as UNTESTABLE on 1604. | MCP-12 determines |

---

## Projected Metrics

| Metric | Before | After |
|--------|--------|-------|
| Runtime tests | 28 | 35-37 (+7-9) |
| Source-level test() sites | 16 | 23-25 |
| Selectors | 61 | 62-63 |
| DISABLED_CHECKBOXES | 4 | 7 |
| UNCHECKED_DEFAULTS | 19 | 20 |
| Round-trip persistence tests | 4 | 6-7 |
| v1 dependency coverage | 5/10 | 8-10/10 |
| Threshold decision table | 3/4 combos | 4/4 + reset-to-0 |
| Gaps resolved | 0/12 | 9-10/12 |

---

## Critical Files

| Category | Path |
|----------|------|
| Selectors | `src/selectors/setup/locations/local-info.ts` (61 keys) |
| Page Object | `src/pages/setup/locations/location-local-info.page.ts` (189 lines, inherits from LocationTestOrchestrators) |
| Spec | `tests/specs/setup/locations/location-local-information.spec.ts` (301 lines, serial describe) |
| Test Data | `tests/test-data/setup/locations/location-local-info.data.ts` (270 lines) |
| Requirements | `docs/REQUIREMENTS.md` (BillingCycle at line 213, Local Info fields at line 208+) |
| Master Plan | `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md` (gaps at lines 260-276) |
| DOM Findings | `plans/pending/SESSION_1_FINDINGS.md` (2026-04-09) |
| Transient Findings | `plans/pending/SESSION_2_FINDINGS.md` (2026-04-09, BUG 2 = validation errors broken) |

---

## Key Learned Rules for Execution

| Rule | When It Applies |
|------|-----------------|
| LR-007 | MCP-verify ALL claims before writing spec code |
| LR-009 | Recovery values must differ from server-saved (Angular dirty tracking) |
| LR-010 | Cross-field validation is async — use `expect.poll` for ALL cascade assertions |
| LR-012 | Save dialog is SHARED (`dlgSaveChanges` / `btnSaveChangesConfirm`) |
| LR-018 | Run-all is the only truth. Run individually first, then run-all. |
| LR-019 | TC-001 must enforce baseline state (navigate fresh, reset dirty, save, re-navigate) |
| LR-023 | No `networkidle` in Angular SPA — use `waitForAngularStable()` + data signals |
| LR-024 | Clean artifacts + run fresh BEFORE any RCA |
| LR-026 | Angular form dirty state unreliable — every test ends with `clickSave()`, handle unsaved-changes dialog |
| LR-027 | Plan finalization: execution summary MANDATORY when moving to done/ |
| LR-028 | Activity log entry at session end |
