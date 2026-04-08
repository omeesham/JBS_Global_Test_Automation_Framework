# PLAN: Fix Filler Tests + Add Pipeline Rules

## Context
After fixing all 12 skipped tests and the AAO-008 failure, 10 "filler" tests remain that only assert hardcoded structural counts. These break on any UI change without testing meaningful behavior. Additionally, 5 pipeline rules need to be added to prevent agents from creating skips or filler tests in the future.

---

## Workstream 1: Fix Filler Tests (10 tests, 4 files)

### Category 1: RELAX count → greaterThan(0) (tests where count is the ONLY assertion)

| Test | File | Line | Current | Fix |
|------|------|------|---------|-----|
| HIS-002 | local-office-history.spec.ts | 19-20 | `expect(columnCount).toBe(42)` | `expect(columnCount).toBeGreaterThan(0)` |
| HIS-005 | local-office-history.spec.ts | 37-38 | `expect(navBtnCount).toBe(4)` | `expect(navBtnCount).toBeGreaterThan(0)` |
| HIS-007 | local-office-history.spec.ts | 46-47 | `expect(sortButtonCount).toBe(38)` | `expect(sortButtonCount).toBeGreaterThan(0)` |
| BAS-033 | local-office-settings.spec.ts | 335 | `expect(options).toHaveLength(12)` | `expect(options.length).toBeGreaterThan(0)` |

### Category 2: REMOVE count, keep content assertions (count is redundant)

| Test | File | Line | Remove | Keep |
|------|------|------|--------|------|
| ECT-002 | local-office-ect.spec.ts | 29 | `expect(options).toHaveLength(1)` | `expect(options[0]).toContain('USD')` → change to `expect(options.some(o => o.includes('USD'))).toBe(true)` |
| ECT-003 | local-office-ect.spec.ts | 35 | `expect(...getEventProfitTargetRowCount()).toBe(9)` | label + isReadOnly assertions |
| ECT-008 | local-office-ect.spec.ts | 93 | `expect(...getLaborCostRowCount()).toBe(66)` | first/last class name + editability assertions |
| ECT-011 | local-office-ect.spec.ts | 133 | `expect(...getSubRentalMatrixRowCount()).toBe(9)` | label + isReadOnly assertions |
| BAS-025 | local-office-settings.spec.ts | 274 | `expect(...getSectionRowCount()).toBe(13)` | `expect(names).toEqual([...DEFAULT_SECTIONS])` already covers count |
| LGL-004 | location-legal.spec.ts | 50 | `expect(options).toHaveLength(LEGAL_SC_OPTION_COUNT)` | `.toContain()` assertions |
| LGL-005 | location-legal.spec.ts | 57 | `expect(options).toHaveLength(LEGAL_TC_OPTION_COUNT)` | `.toContain()` assertions |

### Data file cleanup
- `location-legal.data.ts`: Delete `LEGAL_SC_OPTION_COUNT` and `LEGAL_TC_OPTION_COUNT` constants + their imports in spec.

---

## Workstream 2: Pipeline Rules (5 rules, 2 files)

### AGENT_SHARED_RULES.md — append after ALL-060

**ALL-061: ZERO TOLERANCE FOR test.skip()**
Every `test.skip()` must have a corresponding fix plan or be rewritten to test actual behavior. Skipping a test because "the server rejects changes" is not acceptable — rewrite the test to verify the rejection IS the expected behavior. If the bug blocking the test is later fixed, the test should start failing (documenting the fix).

**ALL-062: NO HARDCODED STRUCTURAL COUNT ASSERTIONS**
Tests must NOT assert exact counts of DOM elements (column headers, rows, options, buttons) unless the count itself is the feature being tested. Instead: (a) assert content/labels, (b) assert behavior (click sort → data reorders), (c) use `greaterThan(0)` for existence checks. Hardcoded counts break on any UI change without catching real bugs.

**ALL-063: VERIFY SERVER BEHAVIOR BEFORE ASSUMING BUGS**
Before skipping a test for "server rejects" or "API 500": run the operation live (MCP or probe test). Server bugs get fixed. What was broken last month may work today. Workflow: un-skip → run AS-IS → if passes, keep original assertions → if still fails, THEN rewrite to test actual behavior.

### CLAUDE.md — append after LR-020

**LR-021: Un-skip before rewrite — always try original logic first**
When fixing a skipped test, FIRST remove the skip and run the original test logic AS-IS. If it passes, the underlying bug was fixed — keep the original assertions. Only rewrite to "test actual behavior" if the original logic STILL fails. This prevents unnecessary test rewrites and catches silently-fixed bugs.
**Trigger**: Any session that involves fixing skipped tests.

**LR-022: No hardcoded structural counts in assertions**
Never assert exact counts of DOM elements (`.toBe(42)`, `.toHaveLength(114)`) unless the count itself is the feature under test. These break on any UI addition/removal without catching real bugs. Use content assertions (`.toContain()`), behavior assertions (click → verify effect), or existence checks (`.toBeGreaterThan(0)`).
**Trigger**: Any test generation or review session.

---

## Execution Order

1. Fix Category 2 fillers (remove count lines) — simple deletions
2. Fix Category 1 fillers (relax counts) — simple edits
3. Delete unused data constants (LEGAL_SC_OPTION_COUNT, LEGAL_TC_OPTION_COUNT)
4. Add pipeline rules to AGENT_SHARED_RULES.md and CLAUDE.md
5. Run full suite → verify zero skips, all green

## Files Modified

| # | File | Change |
|---|------|--------|
| 1 | `local-office-history.spec.ts` | Relax 3 count assertions |
| 2 | `local-office-ect.spec.ts` | Remove 3 count assertions, fix ECT-002 |
| 3 | `local-office-settings.spec.ts` | Remove 1 count, relax 1 |
| 4 | `location-legal.spec.ts` | Remove 2 count assertions |
| 5 | `location-legal.data.ts` | Delete 2 unused count constants |
| 6 | `AGENT_SHARED_RULES.md` | Add ALL-061/062/063 |
| 7 | `CLAUDE.md` | Add LR-021/022 |
