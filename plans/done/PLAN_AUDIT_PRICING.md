# PLAN: PRICING Page Audit

**Source**: `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md` — Gaps #13, #14, #15
**Created**: 2026-04-06
**Status**: Executed (2026-04-06). FIX-1/2/3 + TC-033 + TC-035 done. Session 4 (2026-04-06): WATCHDOG audit fixes — TC-033 hard assertion (fallback hypothesis), TC033_DATE_VALUES, enableFullCascade Log.warn, REQUIREMENTS.md annotations. TC-034 blocked on MCP-2. Test verification blocked by API 500 (`getLocationDetail` returns 500). Re-run when API recovers.
**Priority**: P1 (Batch 2)

---

## Context

The master plan identified 3 gaps for the Pricing page. This audit maps every v1 functional requirement to existing test coverage, ran a 3-round enemy audit on its own findings, and produces an actionable execution plan.

**Current state**: 34 Playwright entries (27 active, 7 skipped). 619-line page object. 50-line selectors. 78-line test data.

---

## v1 Requirement-to-Test Mapping (Audit-Corrected)

### Date Validation (`customDateValidator` / `isValidDate`)

| v1 Rule | Existing TC | Status | Audit Note |
|---------|------------|--------|------------|
| Start/End Date must pass `isValidDate()` | TC-018, TC-019 | **COVERED** | readOnly input prevents manual invalid entry; missing-date tooltip tested |
| Missing date shows validation tooltip | TC-018, TC-019, TC-022 | **COVERED** | TC-022 tests ROW-LEVEL tooltip (opens individual popover), NOT grid-level form error |
| Cross-date validation (Start > End) | — | **UNKNOWN** | Needs MCP verification (MCP-2) |

### Is Alternative Checkbox

| v1 Rule | Existing TC | Status | Audit Note |
|---------|------------|--------|------------|
| On Check: enables UseDate | TC-005 | **COVERED** | |
| On Check: marks IsNew=true | — | **NOT UI-TESTABLE** | Backend business logic flag. No UI indicator exists. Not observable via Playwright. |
| On Uncheck: UseDate=false, clears dates | TC-009, TC-010 | **COVERED** | |
| On Uncheck: clears errors | TC-010 (partial) | **PARTIAL** | TC-010 verifies field states reset, but doesn't verify error state cleared |
| On Uncheck: sets IsDeleted=true | — | **NOT UI-TESTABLE** | Backend business logic flag. No UI indicator. |

### Use Effective Date Checkbox

| v1 Rule | Existing TC | Status |
|---------|------------|--------|
| Enabled only when IsAlternative=checked | TC-005, TC-006, TC-008 | **COVERED** |
| On Uncheck: clears Start/End dates | TC-009 | **COVERED** |

### Start Date / End Date

| v1 Rule | Existing TC | Status |
|---------|------------|--------|
| Enabled when IsAlt=checked AND UseDate=checked | TC-007, TC-008 | **COVERED** |
| Disabled otherwise | TC-004, TC-008 | **COVERED** |
| Format MM/DD/YYYY via NullDateEditor | TC-018, TC-019 | **COVERED** (calendar enforces) |

### Corporate Pricing Master Toggle

| v1 Rule | Existing TC | Status |
|---------|------------|--------|
| Unchecked → disables primary pricing dropdowns | TC-011 | **COVERED** |
| Unchecked → grid fields remain editable | TC-012 | **COVERED** |
| Checked → re-enables dropdowns | TC-013 | **COVERED** |
| Toggle persistence | TC-025 (SKIPPED) | **BLOCKED** — app bug |

### Grid-Level Validation (`validateCorporatePriceGrid`)

| v1 Rule | Existing TC | Status | Audit Note |
|---------|------------|--------|------------|
| Row errors → grid form error | — | **GAP** | TC-022 only tests row-level tooltip (opens popover, checks regex). Does NOT check form-level error propagation. |
| Grid errors → Save disabled (`priceBookHasErrors`) | — | **GAP** | Zero tests connect validation error to Save button state. Verified: searched entire spec — none exists. |

### Cell Edit Restrictions (`onBeforeEditCell`)

| v1 Rule | Existing TC | Status |
|---------|------------|--------|
| Start/End: editable only if IsAlt && UseDate | TC-007, TC-008 | **COVERED** |
| UseDate: editable only if IsAlt | TC-005, TC-006 | **COVERED** |
| PricingStrategy: never editable | — | **GAP** (low priority) |

### PriceGuideInclusion

| v1 Rule | Existing TC | Status |
|---------|------------|--------|
| Editable checkbox, persistence | TC-024 | **COVERED** |

---

## Enemy Audit Findings (3 rounds)

### Round 1: Claims That Were WRONG in Draft

| # | Wrong Claim | Correction | Impact |
|---|-------------|-----------|--------|
| E1 | "TC-022 tests multi-row grid-level validation" | TC-022 opens **individual row popovers** and checks tooltip regex. It's ROW-LEVEL, not grid-level. | Gap #14 is larger than initially stated |
| E2 | "IsNew/IsDeleted tested via TC-005/TC-010" | IsNew and IsDeleted are **backend flags** with no UI manifestation. | 2 v1 rules are NOT-TESTABLE via UI |
| E3 | "enableFullCascade handles async cascade" | `enableFullCascade()` does **zero** async waiting between steps. Violates LR-010. | Latent flakiness risk |

### Round 2: Risks Draft Plan MISSED

| # | Risk | Evidence | Impact |
|---|------|----------|--------|
| R1 | **`btnSavePricing` selector is dangerously broad** | Selector: `button:has-text("Save")` — matches ANY save button. Other tabs use `[data-testid="location-settings-btn-save"]`. | All save-related TCs at risk. **MCP-4 mandatory.** |
| R2 | **TC-010 doesn't reload after making form dirty** | Unchecks Is Alternative (dirty) but NO reload/save. LR-026 violation. | TC-011 may inherit dirty form → unsaved dialog cascade |
| R3 | **Triple-layered blocking on persistence tests** | TC-026-030: (1) POST 500, (2) data round-trip failure, (3) clickSaveWithDialog race condition. | 3 SEPARATE bugs must be fixed for persistence |

### Round 3: Scope vs Coverage Audit

| # | Coverage Audit Recommendation | This Plan | Assessment |
|---|------------------------------|-----------|------------|
| S1 | 97/103 fields lack round-trip | Not addressed | **CORRECTLY BLOCKED** — API bugs |
| S2 | Zero negative tests | TC-033 adds first | **PARTIAL** — 1 is better than 0 |
| S3 | Zero BVA for dates | TC-034 conditional | **PARTIAL** — depends on MCP-2 |
| S4 | Zero decision table tests | Not in scope | **ACCEPTED** — P3 priority |
| S5 | Zero accessibility tests | Not in scope | **ACCEPTED** — cross-cutting |

---

## Final Gap Disposition

| Gap # | Description | Disposition | Action |
|-------|------------|-------------|--------|
| #13 | Custom date validator | **COVERED** | MCP-verify cross-date only (MCP-2) |
| #14 | Grid validation → Save disabled | **REAL GAP** | TC-033 (P0). Needs MCP-1 + MCP-4. |
| #15 | Cell edit restrictions | **MOSTLY COVERED** | TC-035 (P2) for read-only columns |
| NEW | IsNew/IsDeleted flags | **NOT UI-TESTABLE** | Document in REQUIREMENTS.md |
| NEW | enableFullCascade LR-010 gap | **LATENT RISK** | FIX-1: add async poll |
| NEW | btnSavePricing too broad | **CRITICAL RISK** | MCP-4 mandatory |
| NEW | TC-010 dirty state leak | **LR-026 VIOLATION** | FIX-2: add reload |

---

## MCP Verification Checklist (Phase 0)

### MCP-1: Grid validation → Save button disabled
Navigate to Pricing → check Is Alternative → check Use Effective Date → do NOT enter dates → check Save button state.
- **Save disabled** → implement TC-033 (validation blocks save)
- **Save enabled** → validation is cosmetic only, adjust TC-033

### MCP-2: Cross-date validation (Start > End)
Full cascade → Start Date 05/01/2026 → End Date 04/01/2026 → check error/Save state.
- **Error** → add TC-034
- **No error** → document, skip TC-034

### MCP-3: Read-only columns non-interactive
Click Pricing Strategy / Pricebook / Currency cells → verify no edit mode.
- **Non-interactive** → add TC-035
- **Interactive** → investigate

### MCP-4 (CRITICAL): btnSavePricing selector scope
Count elements matching `button:has-text("Save")` on Pricing tab. Check for data-testid.
- **Multiple matches** → selector broken, fix before any save work
- **Single match** → document safety, no change
- **data-testid exists** → update selector

---

## New Test Cases

### TC-LOC-PRI-033 (P0): Grid validation errors disable Save button
**Precondition**: Clean page load (reloadPricingTab), Save disabled
**Steps**:
1. Check Is Alternative on PRIMARY_TEST_ROW → poll for UseDate enabled (LR-010)
2. Check Use Effective Date → poll for dates enabled
3. Do NOT enter dates (empty = required validation error)
4. **Verify Save button state** (disabled if validation blocks, enabled if cosmetic)
5. Enter valid Start Date and End Date
6. Verify Save becomes enabled (dirty + no validation errors)
7. Cleanup: resetGridRow + reloadPricingTab (LR-026)

**Depends on**: MCP-1, MCP-4

### TC-LOC-PRI-034 (P1, conditional on MCP-2): Start > End cross-validation
1. enableFullCascade on PRIMARY_TEST_ROW
2. Enter End Date: 04/01/2026, Start Date: 05/01/2026
3. Verify error or Save state
4. Fix dates, verify clears
5. Cleanup: resetGridRow + reloadPricingTab

### TC-LOC-PRI-035 (P2): Read-only columns have no interactive elements
For PRIMARY_TEST_ROW cols 1-3: verify no button/checkbox/input elements.

---

## Existing Code Fixes

### FIX-1: enableFullCascade — add LR-010 async wait
**File**: `src/pages/setup/locations/location-pricing.page.ts` lines 496-500
Add poll for UseDate enabled between checkIsAlternative and checkUseEffectiveDate.

### FIX-2: TC-010 — add reload for LR-026 compliance
**File**: `tests/specs/setup/locations/location-pricing.spec.ts` line ~173
Add `await locationPricingPage.reloadPricingTab(OFFICE_NO);` after assertions.

### FIX-3 (conditional on MCP-4): btnSavePricing selector
**File**: `src/selectors/setup/locations/pricing.ts` line 17
Update to data-testid or scoped selector if MCP-4 finds issues.

---

## BLOCKED Items

| Item | Why Blocked | Layers |
|------|------------|--------|
| Corporate Pricing persistence (TC-025) | Save 200 but reverts on reload | 1: App bug |
| Date persistence (TC-020) | API doesn't return dates | 1: Data round-trip |
| Dropdown persistence (TC-026–030) | POST 500 + data loss + listener race | 3 separate bugs |
| Grid checkbox persistence | Same POST 500 | 3 layers |

## NOT UI-TESTABLE Items

| v1 Rule | Why |
|---------|-----|
| IsNew=true on IsAlternate check | Backend flag, no UI indicator |
| IsDeleted=true on IsAlternate uncheck | Backend flag, no UI indicator |

---

## Files to Modify

| File | Changes |
|------|---------|
| `tests/specs/setup/locations/location-pricing.spec.ts` | Add TC-033; conditionally TC-034, TC-035; FIX-2 (TC-010 reload) |
| `src/pages/setup/locations/location-pricing.page.ts` | FIX-1 (enableFullCascade async wait) |
| `src/selectors/setup/locations/pricing.ts` | Conditional FIX-3 (btnSavePricing) |
| `tests/test-data/setup/locations/location-pricing.data.ts` | CROSS_DATE_VALUES if MCP-2 confirms |
| `docs/REQUIREMENTS.md` | NOT-TESTABLE notes for IsNew/IsDeleted; grid validation→Save rule |

---

## Verification Plan

1. Clean artifacts: `npm run clean`
2. Run pricing spec individually
3. Verify all active tests pass
4. Run ALL location specs together (LR-018)
5. Verify no serial contamination
6. Run pricing spec SECOND time for flakiness (LR-024)

---

## LR Rules Applied

- **LR-007**: 4 MCP gates before writing code
- **LR-010**: FIX-1 (enableFullCascade async wait)
- **LR-018**: Run-all verification
- **LR-019**: TC-001 baseline verified compliant
- **LR-022**: No hardcoded counts
- **LR-023**: No networkidle
- **LR-024**: Clean + double-run
- **LR-026**: FIX-2 + TC-033 cleanup includes reload
