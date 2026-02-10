# {Feature} Test Cases

**Last Updated**: YYYY-MM-DD
**Module**: {Module Name}
**Total Test Cases**: X
**Automated**: X (XX%)
**Manual**: X (XX%)

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
