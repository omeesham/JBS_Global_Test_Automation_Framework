# {Feature} Test Cases

**Last Updated**: YYYY-MM-DD
**Module**: {Module Name}
**Total Test Cases**: X
**Automated**: X (XX%)
**Manual**: X (XX%)

---

## ⚠️ CRITICAL AGENT RULES — READ BEFORE CREATING TEST CASES

**When Copilot creates initial test case documentation:**

1. **ALWAYS mark Status as `⚠️ Manual`** — Tests are NOT automated until Generator runs them successfully
   - ❌ WRONG: `**Status:** ✅ Automated` (code exists but not validated)
   - ✅ CORRECT: `**Status:** ⚠️ Manual` (awaiting automation)

2. **DO NOT add "Automation File" field** — Generator adds this AFTER tests pass
   - ❌ WRONG: `**Automation File:** tests/specs/module/test.spec.ts` (premature)
   - ✅ CORRECT: Omit field entirely until Generator confirms tests pass

3. **DO NOT fill "Actual Results"** — Leave as `(Pending execution by Generator agent)`
   - ❌ WRONG: `✅ PASS - Test succeeded on YYYY-MM-DD` (tests not run yet)
   - ✅ CORRECT: `(Pending execution by Generator agent)`

4. **Automation Coverage must reflect reality:**
   - ❌ WRONG: `**Automation Coverage:** 100%` (when Status = Manual)
   - ✅ CORRECT: `**Automation Coverage:** 0% (awaiting automation)`

**When Copilot creates queue entry in agent-queue.json:**

1. **ALWAYS use `stage: "pending_planning"`** — NOT "completed"
   - ❌ WRONG: `"stage": "completed"` (nothing completed yet)
   - ✅ CORRECT: `"stage": "pending_planning"` (awaiting Planner)

2. **DO NOT add these fields prematurely:**
   - ❌ `"completedAt"` — Only when stage = "completed"
   - ❌ `"testResults"` — Only after Generator runs tests
   - ❌ Multiple history entries — One entry when creating queue

**Status Flow (DO NOT SKIP STAGES):**
```
Copilot creates:     stage: "pending_planning", Status: ⚠️ Manual
                              ↓
Planner explores:    stage: "planning" → "pending_generation"
                              ↓
Generator builds:    stage: "generation", runs tests
                              ↓
Tests PASS:          stage: "completed", Status: ✅ Automated ← ONLY NOW
Tests FAIL:          stage: "pending_healing", Status: 🔴 Failed
```

**Why This Matters:**
- Planner searches for `"pending_planning"` — won't find "completed" items
- Generator changes Status to ✅ only after tests pass — ensures accuracy
- Premature "Automated" status creates false reporting and confusion

---

## Related Files
- **Requirements**: `REQUIREMENTS.md` (#{Module} Module section — READ-ONLY reference)
- **Test Plan**: `specs_planning/test-plans/{feature}-plan.md`
- **Automation**: `tests/specs/{module}/{feature}.spec.ts`
- **Page Object**: `src/pages/{module}.page.ts`
- **Locators**: `object_repository/{Module}_Elements.csv`

---

## Test Cases

### TC-{MODULE}-001: {Test Case Title}

**Priority**: High | Medium | Low
**Type**: User-Requested | Agent-Discovered
**Status**: ⚠️ Manual | 🚧 In Progress | ✅ Automated

**Description**:
{1-2 sentence description of what this test validates}

**Preconditions**:
- {Condition 1}
- {Condition 2}

**Test Steps**:
1. {Action 1} → {Expected result 1}
2. {Action 2} → {Expected result 2}
3. {Action 3} → {Expected result 3}

**Expected Result**:
{1-2 sentences describing overall success criteria}

**Test Data**:
| Field | Value | Source |
|-------|-------|--------|
| {Field name} | {Example value} | {env, CSV, config} |

**Automation Details** (filled by Generator agent):
- **File**: `tests/specs/{module}/{feature}.spec.ts`
- **Test Name**: `{describe block} > {test name}`
- **Lines**: {start}-{end}
- **CSV Locators Used**: {element1}, {element2}, {element3}

**Last Test Run**: YYYY-MM-DDTHH:mm:ssZ
**Result**: ✅ PASSED | ❌ FAILED

**Test Results** (last 5 runs):
| Run Date | Result | Duration | Notes |
|----------|--------|----------|-------|
| YYYY-MM-DD HH:mm | ✅ PASSED | X.Xs | {Note if any} |

**Known Issues**:
- {Issue description if any}

**Tags**: `{tag1}`, `{tag2}`, `{tag3}`

---

### TC-{MODULE}-002: {Another Test Case Title}

(Repeat structure above for each test case)

---

## Future Test Cases

Identified but not yet documented:
- {Future test case 1}
- {Future test case 2}
