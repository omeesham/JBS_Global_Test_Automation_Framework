# PLAN 48I: Test Case Diversity

## Status: PENDING
## Priority: P1-HIGH
## Depends On: 48H (Planner behavioral documentation must work first)

## Problem

All TCs are type "Functional" or "Validation". In a meeting we were asked: "does the repo test security, performance, accessibility?" Answer: no. Planner only creates functional test cases because its Phase 2 only tests edit/save/reload cycles. We need comprehensive test coverage across multiple testing domains — whatever is possible to do on the visible elements, we should be doing.

---

## Changes

### 1. Expand TC Type Categories (PLN-029)

**File**: `.github/agents/playwright-test-planner.agent.md`

Add to Phase 2 — after functional TCs are created, generate additional TC types from what's visible on the page:

| Type | What to Test | Example TC |
|------|-------------|------------|
| Functional | Core CRUD, field edit/save/reload persistence | "Edit Phone 1, save, reload, verify persisted" |
| Validation | Required fields, boundary values, format constraints | "Clear required Phone 1, verify aria-invalid" |
| Boundary | Min/max lengths, special chars, emoji, SQL injection strings, XSS payloads in inputs | "Type `<script>alert(1)</script>` in Name field, verify sanitized/rejected" |
| Negative | Invalid operations, unauthorized actions, error recovery | "Click Save with empty required field, verify blocked" |
| Accessibility | Keyboard navigation, ARIA labels, focus order, screen reader | "Tab through all fields, verify focus order matches visual order" |
| State | Page reload persistence, back-button behavior, concurrent edits, unsaved changes dialog | "Edit field, navigate away without saving, verify unsaved changes dialog" |
| Performance | Slow API response handling, large dataset rendering, timeout behavior | "Open address dialog with 50+ rows, verify table renders within 5s" |
| Integration | Cross-tab dependencies, cascading field updates, multi-dialog flows | "Change account in Account List → verify address fields update" |

**Minimum per module**:
- ALL applicable Functional TCs (current behavior — keep)
- ALL applicable Validation TCs (current behavior — keep)
- 2+ Boundary TCs (test dangerous inputs)
- 1+ Accessibility TC (keyboard nav + ARIA)
- 1+ State TC (unsaved changes / reload)
- Integration TCs for any cross-section dependencies
- Negative TCs for every error path discovered
- Performance TCs only when page has large datasets or known slow APIs

### 2. TC Metadata Update

**File**: `.github/agents/playwright-test-planner.agent.md`

Update TC template metadata row. Valid types: `Functional`, `Validation`, `Boundary`, `Negative`, `Accessibility`, `State`, `Performance`, `Integration`

```
| Priority | Status | Type | Automatable |
|----------|--------|------|-------------|
| High | Manual | Boundary | Yes |
```

### 3. Boundary & Security TC Step (PLN-030)

**File**: `.github/agents/playwright-test-planner.agent.md`

Add to Phase 2 as new Step 8:

```
### Step 8: BOUNDARY & SECURITY TCs (PLN-030)
For every text input discovered:
8a. Type XSS payload: `<script>alert(1)</script>` → document: rejected? sanitized? rendered?
8b. Type SQL injection: `'; DROP TABLE --` → document: rejected? sanitized? passed to API?
8c. Type max-length string (500+ chars) → document: truncated? overflow? error?
8d. Type emoji/unicode: `🎉 café résumé` → document: preserved? stripped? corrupted?
8e. Type empty string + spaces only → document: validation catches it?

For every numeric input:
8f. Type negative number, zero, MAX_SAFE_INTEGER → document behavior
8g. Type decimal with many places → document rounding

Document results in MCP_VERIFICATION_LOG under "Boundary behaviors" row.
Create TC for each behavior that is NOT "rejected with clear error" (those are the interesting bugs).
```

### 4. Accessibility TC Step (PLN-031)

**File**: `.github/agents/playwright-test-planner.agent.md`

Add to Phase 2 as new Step 9:

```
### Step 9: ACCESSIBILITY TCs (PLN-031)
For the page under test:
9a. Tab through ALL interactive elements → document focus order (matches visual order?)
9b. Check every input has associated label (aria-label, aria-labelledby, or <label for>)
9c. Check every button has accessible name
9d. Check every dialog has aria-role and aria-label
9e. Check color contrast of error states (if possible via MCP evaluate)

Create 1-2 Accessibility TCs per module documenting keyboard navigation flow.
```

---

## Files

- `.github/agents/playwright-test-planner.agent.md` — PLN-029..031, Phase 2 Steps 8-9, TC type enum expansion
- `docs/read_only_docs/AGENT_SHARED_RULES.md` — Update §4 TC standards with type categories

## Verification

1. Run Planner on a new module → verify TCs include Boundary, Accessibility, State types (not just Functional/Validation)
2. Spot-check: at least 1 XSS input TC, 1 keyboard nav TC, 1 unsaved changes TC per module
