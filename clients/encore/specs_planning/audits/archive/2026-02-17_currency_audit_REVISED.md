# Currency Tab Audit - REVISED
**Date**: 2026-02-17 (Revision 2)  
**Auditor**: Pipeline Audit Agent  
**Scope**: Location Currency feature (TC-LOC-CUR-001 through TC-LOC-CUR-020)  
**Revision**: External audit verification + mistake injection system audit

---

## EXECUTIVE SUMMARY
**Overall Quality**: 70/100 (revised down from 85)  
**Critical Issues**: 2 (test case mismatch + process failure)
**Medium Issues**: 5 (4 selector gaps + 1 precondition ambiguity)  
**Low Issues**: 3 (missing notes, unverified assumptions)  
**Blockers**: YES - content errors + process failure

---

## PART 1: EXTERNAL AUDIT VERIFICATION

### Issue 1: TC-LOC-CUR-013 Step Wording — ⚠️ CRITICAL CONFIRMED

**External claim**: Step says "Uncheck all Selected checkboxes (USD, CAD, MXN)" but only USD is checked initially.

**Verification**:
- TC-002: USD Selected = checked (initial)
- TC-003: CAD Selected = unchecked (initial)
- TC-004: MXN Selected = unchecked (initial)

**WORSE**: Test plan is CORRECT but test case is WRONG:
- **Test plan** (correct):
  ```
  1. Uncheck USD row checkbox[Selected], expected: unchecked
  2. Verify CAD row checkbox[Selected], expected: unchecked (already)
  3. Verify MXN row checkbox[Selected], expected: unchecked (already)
  ```
- **Test case** (wrong):
  ```
  1. Uncheck all **Selected** checkboxes (USD, CAD, MXN) ✓ All unchecked
  ```

**Root cause**: Test case incorrectly summarizes the test plan steps.

**Impact**: CSV export shows wrong steps, manual testers confused.

---

### Issue 2: TC-LOC-CUR-009 Precondition Ambiguity — ⚠️ MEDIUM CONFIRMED

**External claim**: TC-009 doesn't specify whether CAD needs to be selected before clicking merchant dropdown.

**Verification**:
- TC-009: "1. Click CAD **Merchant** dropdown" (no CAD selection step)
- TC-019: "1. CAD **Selected** unchecked (initial)" (explicitly tests unselected state)

**Problem**: 
- TC-009 implicitly tests dropdown when CAD is unselected
- TC-019 explicitly tests the same scenario
- Redundant OR TC-009 is missing precondition

**Recommendation**: Add "Select CAD **Selected** checkbox" as step 1 in TC-009

---

### Issue 3: TC-LOC-CUR-010 Missing Note — ⚠️ LOW CONFIRMED

**External claim**: "No Matches Found" for MXN should have a note questioning if zero merchants is intentional.

**Verification**: No Notes field in test case. Expected Result just says "MXN Merchant dropdown shows no available merchants".

**QA concern**: Selectable currency with no merchants can't process payments. Is this:
- Expected test data gap?
- Real defect?
- Intentional (MXN not supported)?

**Recommendation**: Add Notes field with data context.

---

### Issue 4: TC-018/019 Unverified — ⚠️ LOW PARTIALLY CONFIRMED

**External claim**: These are assumptions since agent never actually tested clicking Currency Code field.

**Verification**:
- Planner claims "All selectors verified via live DOM"
- BUT: 4 selectors are missing
- No explicit verification evidence

**Assessment**: Planner's claim is questionable. May need retest.

---

## PART 2: SELECTOR GAPS (Previous Audit - Still Valid)

| # | Missing Selector | Severity | Blocks TC |
|---|------------------|----------|-----------|
| 1 | Column headers (4) | Medium | TC-001 |
| 2 | "No Matches Found" | Medium | TC-010 |
| 3 | Save confirmation dialog | Low | TC-014, TC-017 |
| 4 | Error notification | Low | TC-013 |

---

## PART 3: MISTAKE INJECTION SYSTEM — ⚠️ CRITICAL PROCESS FAILURE

### Finding: Rule Sync Gap

**agent-mistakes.md** has PLN-001 through PLN-029 (29 rules)
**playwright-test-planner.agent.md** has only PLN-001 through PLN-018 + PLN-023

**Missing from agent file (NOT BEING ENFORCED)**:
- PLN-019 through PLN-022
- PLN-024 through PLN-029

**Root cause**: agent-mistakes.md header says:
```
SYNC OWNERSHIP: When adding a rule here, MUST also update:
  - .github/agents/{agent}.agent.md NEVER DO section
```
This sync step is being skipped.

**Impact**: 10 rules exist in registry but are NOT enforced!

---

## PART 4: CSV EXPORT BUG (Tooling Issue)

**Bug**: Preconditions say "Local Information tab is active" for Currency tab tests.

**Fix needed in to-csv.ts**:
```typescript
if (id.includes('TC-LOC-CUR')) {
  preconditions.push('Currency tab is active');
}
```

---

## PART 5: NEW MISTAKES TO ADD

| ID | NEVER DO | Correct |
|----|----------|---------|
| PLN-030 | Mismatched test plan vs test case wording | Sync test case Steps with test plan Steps |
| PLN-031 | Implicit preconditions when field state matters | Explicitly state field's initial state |
| PLN-032 | Data anomalies without explanatory notes | Add Notes for unusual data states |
| AUD-014 | Skip rule sync verification | Verify agent NEVER DO sections match registry |

---

## PART 6: REVISED SCORES

| Agent | Original | Revised | Reason |
|-------|----------|---------|--------|
| Requirements | 95/100 | 95/100 | Clean |
| Planner | 80/100 | 65/100 | TC mismatch, missing selectors, precondition issues |
| Audit (self) | N/A | 75/100 | Missed these issues in first pass |

---

## CONCLUSION + FIX PLAN

**Original audit missed**:
1. Test plan vs test case content mismatch (CRITICAL)
2. Precondition ambiguity
3. Missing data context notes
4. Mistake injection sync gap (PROCESS CRITICAL)

**External audit was correct** on all 4 issues.

---

**Audit Status**: REVISED  
**Stage**: BLOCKED until fixes applied  
**See**: FIX PLAN below
