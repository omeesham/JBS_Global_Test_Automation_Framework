# Currency Tab Audit - Requirements & Planner
**Date**: 2026-02-17  
**Auditor**: Pipeline Audit Agent  
**Scope**: Location Currency feature (TC-LOC-CUR-001 through TC-LOC-CUR-020)  
**Agents**: Requirements Agent, Planner Agent  

---

## FILES REVIEWED
- [docs/REQUIREMENTS.md](../docs/REQUIREMENTS.md) Lines 300-342
- [specs_planning/test-cases/locations/locations_currency_test_cases.md](../test-cases/locations/locations_currency_test_cases.md)
- [specs_planning/test-plans/locations/locations_currency_test_plan.md](../test-plans/locations/locations_currency_test_plan.md)
- [src/selectors/index.ts](../../src/selectors/index.ts) Lines 161-185
- [export_test_cases/exports/locations_currency_test_cases.csv](../../export_test_cases/exports/locations_currency_test_cases.csv)

---

## EXECUTIVE SUMMARY
**Overall Quality**: 85/100  
**Critical Issues**: 0  
**Medium Issues**: 2 (missing selectors)  
**Low Issues**: 2 (minor selector gaps)  
**Blockers**: YES - 4 selectors required before Generator stage  

**Verdict**: Requirements accurate, test planning comprehensive, but incomplete selector mapping blocks automation. NOT READY for generation.

---

## FINDINGS

### 1. INCOMPLETE: Column Header Selectors (Medium) ⚠️
**Location**: [test-plans/locations/locations_currency_test_plan.md#L7](../test-plans/locations/locations_currency_test_plan.md)  
**Test Case**: TC-LOC-CUR-001 Step 2  
**Expected**: Verify 4 column headers individually:
- `columnheader[Currency Code]`
- `columnheader[Selected]`
- `columnheader[Is Default]`
- `columnheader[Merchant]`

**Actual in selectors**: NONE

**Test Plan Code**:
```
Step: Verify table columnheader[Currency Code], columnheader[Selected], 
      columnheader[Is Default], columnheader[Merchant], 
      expected: 4 column headers visible
```

**Missing Selectors**:
```typescript
colHeaderCurrencyCode: 'th:has-text("Currency Code")',
colHeaderSelected: 'th:has-text("Selected")',
colHeaderIsDefault: 'th:has-text("Is Default")',
colHeaderMerchant: 'th:has-text("Merchant")'
```

**Impact**: Generator cannot implement TC-LOC-CUR-001 Step 2 without these  
**Violation**: AUD-002 (missing selectors), PLN-029 (no selector validation before completion)

---

### 2. INCOMPLETE: "No Matches Found" Selector (Medium) ⚠️
**Location**: [test-plans/locations/locations_currency_test_plan.md#L78](../test-plans/locations/locations_currency_test_plan.md)  
**Test Case**: TC-LOC-CUR-010 Step 3  
**Expected**: Verify listbox text "No Matches Found"

**Actual in selectors**: Only `optMerchant` exists (for populated options)

**Test Plan Code**:
```
Step: Verify listbox text "No Matches Found", expected: message displayed
```

**Missing Selector**:
```typescript
txtNoMatchesFound: '[role="listbox"]:has-text("No Matches Found")'
```

**Impact**: Cannot verify MXN merchant dropdown empty state  
**Violation**: AUD-002, PLN-029

---

### 3. INCOMPLETE: Save Confirmation Dialog Selectors (Low) ⚠️
**Location**: [test-plans/locations/locations_currency_test_plan.md#L112](../test-plans/locations/locations_currency_test_plan.md), Line 138  
**Test Cases**: TC-LOC-CUR-014 Step 4, TC-LOC-CUR-017 Step 5  
**Expected**: Verify save confirmation dialog with message

**Test Plan Code**:
```
Step: Click button[Save], expected: alertdialog[Save Changes] appears
Step: Verify dialog paragraph "Are you sure you want to save the changes?", 
      expected: confirmation message (no validation error)
```

**Current State**: Generic `dlgErrorDialog` exists but not specific confirmation dialog

**Missing Selectors**:
```typescript
dlgSaveConfirmation: '[role="alertdialog"]:has-text("Save Changes")',
txtSaveConfirmMessage: '[role="alertdialog"] p:has-text("Are you sure")'
```

**Impact**: Cannot distinguish confirmation dialogs from error dialogs  
**Violation**: AUD-002

---

### 4. INCOMPLETE: Error Notification Selector (Low) ⚠️
**Location**: [test-cases/locations/locations_currency_test_cases.md#L141](../test-cases/locations/locations_currency_test_cases.md)  
**Test Case**: TC-LOC-CUR-013 Step 2-3  
**Expected**: Error notification with message "At least one currency must be selected"

**Current State**: Generic `dlgErrorDialog`, `dlgErrorMessage` exist but not verified for notification vs dialog

**Recommendation**: Verify if existing selectors work, or add:
```typescript
notifError: '[role="alert"]:has-text("At least one currency")'
```

**Impact**: Minor - may work with existing selectors  
**Violation**: AUD-002

---

## POSITIVE FINDINGS ✓

### Requirements Document
- ✓ 4 columns documented correctly (Currency Code, Selected, Is Default, Merchant)
- ✓ Field types accurate (1 static, 2 checkboxes, 1 dropdown)
- ✓ Testing strategy comprehensive
- ✓ Validation rules marked "to be discovered" (appropriate delegation)
- ✓ Expected currencies: USD, CAD, "Additional (TBD)" - allows Planner to discover

### Test Cases
- ✓ 20 test cases created (comprehensive coverage)
- ✓ All 3 currencies discovered (USD, CAD, MXN)
- ✓ Merchant options documented (USD=2, CAD=1, MXN=0)
- ✓ Validation rule confirmed ("At least one currency must be selected")
- ✓ Logic rules captured:
  - Selecting currency enables "Is Default"
  - Only 1 default allowed (auto-uncheck previous)
  - Merchant value persists when currency unselected
  - Save allowed without default currency
- ✓ No DISCOVER_ placeholders (AUD-005 ✓)
- ✓ No uncertain language "if exists", "TBD" (AUD-010 ✓)
- ✓ No scope violations (AUD-011 ✓)
- ✓ Consistent format across all TCs
- ✓ Office=1604 test data specified

### Test Plan
- ✓ Aligns with test cases
- ✓ Accessibility-aware (uses `columnheader`, `alertdialog`, `listbox` roles)
- ✓ Detailed step-by-step automation instructions
- ✓ Clear expected results

### Selectors
- ✓ Generic parameterized selectors (currency-agnostic)
- ✓ Specific currency selectors (USD, CAD, MXN)
- ✓ Save button selector
- ✓ Grid table selector
- ✓ Merchant option selector
- ⚠️ Missing 4 selectors (see findings above)

---

## OUT-OF-SCOPE BUG: CSV Export Preconditions

**File**: [export_test_cases/to-csv.ts#L376-L379](../../export_test_cases/to-csv.ts)

**Bug**:
```typescript
if (id.includes('TC-LOC')) {
  preconditions.push('Office 1604 is open in Navigator');
  preconditions.push('Local Information tab is active'); // ← WRONG for Currency
}
```

**Result in CSV**:
```csv
Preconditions,Office 1604 is open in Navigator. Local Information tab is active.
```

**Should be**:
```csv
Preconditions,Office 1604 is open in Navigator. Currency tab is active.
```

**Impact**: CSV exports show incorrect preconditions for Currency tab tests

**Not Agent Fault**: This is export tooling bug. MD test cases correctly navigate to Currency tab in Steps section. Neither Requirements nor Planner should be fixing export scripts.

**Recommendation**: Fix export logic to detect tab from test case ID or Steps content:
```typescript
if (id.includes('TC-LOC-CUR')) {
  preconditions.push('Currency tab is active');
} else if (id.includes('TC-LOC-')) {
  preconditions.push('Local Information tab is active');
}
```

---

## RECOMMENDATIONS

### Immediate Actions (Blocks Generator)
1. Add 4 column header selectors to [src/selectors/index.ts](../../src/selectors/index.ts)
2. Add "No Matches Found" selector
3. Add save confirmation dialog selectors
4. Verify error notification selector coverage

### Process Improvements
1. Add PLN-029 to Planner NEVER DO section (done)
2. Add selector validation step to Planner workflow
3. Fix CSV export precondition logic (Engineering task)

### Stage Assessment
**Current Stage**: `planning` (completed)  
**Recommendation**: **HOLD** at `planning` until selectors added  
**Next Stage**: `pending_generation` (after selector completion)

---

## MISTAKE PATTERN ADDED
```
PLN-029 | Complete test planning without selector validation | Verify all TC steps have corresponding selectors in src/selectors/index.ts before marking stage complete
```

---

## AGENT SCORES

### Requirements Agent
**Score**: 95/100  
**Strengths**: Accurate documentation, appropriate delegation, clear structure  
**Weaknesses**: None - requirements were correctly specified

### Planner Agent
**Score**: 80/100  
**Strengths**: Comprehensive exploration, accurate rule discovery, 20 quality TCs  
**Weaknesses**: Missed selector validation step, left 4 selector gaps  
**Deduction**: -20 for missing selectors that block next stage

---

## CONCLUSION
Requirements and Planning work is **high quality** with **accurate documentation** and **comprehensive test coverage**. The only significant issue is incomplete selector mapping, which is procedural rather than conceptual. Once 4 missing selectors are added, pipeline can proceed to Generator stage.

**Overall Assessment**: 85/100  
**Blocker Severity**: MEDIUM (fixable in <10 minutes)  
**Agent Performance**: Requirements (excellent), Planner (good with process gap)

---

**Audit Status**: COMPLETE  
**Follow-up Required**: YES (add selectors)  
**Next Audit Trigger**: After selectors added, before Generator starts
