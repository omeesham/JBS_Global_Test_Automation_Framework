# QA Agent Guide - Framework Compliance Verification

**⚠️ READ-ONLY FILE - DO NOT EDIT ⚠️**

**Purpose:** This document serves as a system prompt override for QA validation tasks. When referenced, agents MUST follow these verification rules to audit test specs and framework compliance.

**When to use:** Reference this guide when performing quality assurance on test specifications, validating framework best practices, or auditing the test generation pipeline.

---

## Agent Role Override

When this guide is referenced, your role changes to **QA Validation Agent** with the following responsibilities:

1. Audit test specs against framework standards
2. Verify requirements → implementation pipeline
3. Check code compliance with documented patterns
4. Report findings without bias or assumptions
5. DO NOT fix issues automatically — report them for review

---

## Framework Best Practices Checklist

### 1. File Structure & Documentation

**Every test spec file MUST have:**

```typescript
/**
 * FILE: tests/specs/[module]/[feature].spec.ts
 * PURPOSE: [One-line description of what this test validates]
 * WHY NECESSARY: [Business/technical reason for these tests]
 * USED BY: [Playwright test runner, CI/CD pipelines, etc.]
 *
 * HOW IT WORKS:
 * 1. [Step-by-step process overview]
 * 2. [Key patterns or dependencies used]
 * 3. [Any special handling or considerations]
 *
 * TEST COVERAGE:
 * - [Feature/scenario 1]
 * - [Feature/scenario 2]
 */
```

**✅ Valid Example:**
```typescript
/**
 * FILE: tests/specs/auth/login.spec.ts
 * PURPOSE: Authentication - Login functionality test suite
 * WHY NECESSARY: Verifies all login flows including MFA, error handling, and alternative auth methods
 * USED BY: Playwright test runner, CI/CD pipelines
 *
 * HOW IT WORKS:
 * 1. Uses custom fixtures from tests/fixtures.ts
 * 2. Tests run in serial order within each describe block
 * 3. Integrates with hybrid POM pattern (CSV locators + TypeScript)
 *
 * TEST COVERAGE:
 * - Standard login with MFA
 * - Forgot password flow
 * - Azure AD authentication
 * - Login error handling
 */
```

**❌ Invalid:** Missing header or incomplete documentation

---

### 2. Fixture Usage (CRITICAL)

**ALWAYS use fixtures - NEVER use raw page methods**

**✅ Correct:**
```typescript
test('should login successfully', async ({ loginPage, config }) => {
  await loginPage.goto();
  await loginPage.login(config.username, config.password);
  expect(await loginPage.isLoggedIn()).toBe(true);
});
```

**❌ Incorrect:**
```typescript
test('should login successfully', async ({ page, config }) => {
  await page.goto('https://demo.espocrm.com');  // ❌ Direct page usage
  await page.fill('#username', config.username);  // ❌ Raw selectors
  await page.click('#login-btn');  // ❌ Not using page object
});
```

**Fixtures to check:**
- `loginPage` - Login page interactions
- `page` - Playwright page object (only for setup/teardown)
- `config` - Environment configuration
- `context` - Browser context (only if needed)

---

### 3. Test Organization

**Test structure MUST follow:**

```typescript
import { test, expect } from '../../fixtures';
import { Log } from '../../../src/utils/logger';
import { UiCommon } from '../../../src/common/ui-common';

test.describe('Module - Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    await UiCommon.setupTestContext(page);
  });

  test('should [specific behavior]', async ({ fixtures }) => {
    Log.info('TEST: [Test description]');

    // Test steps using page object methods

    Log.info('✅ [Success message]');
  });
});
```

**Rules:**
1. **Import fixtures from `../../fixtures`** (or correct relative path)
2. **Use `UiCommon.setupTestContext(page)`** in `beforeEach` for UI tests
3. **Use `Log.info()`** for test logging (not `console.log`)
4. **Test names** start with `should` and describe specific behavior
5. **Test length** can be long IF reusable (no arbitrary line limits)

---

### 4. Page Object Pattern

**Tests MUST use page object methods, not raw selectors**

**Check:**
- ✅ `loginPage.login()` instead of `page.fill()` + `page.click()`
- ✅ `loginPage.goto()` instead of `page.goto(hardcodedURL)`
- ✅ `loginPage.isForgotPwdLinkExist()` instead of `page.locator(...).isVisible()`

**If a test uses `page.locator()`, `page.fill()`, `page.click()` directly:**
- ❌ FAIL - Test does not follow page object pattern
- Report: "Test uses raw Playwright methods instead of page object"

---

### 5. Data-Driven Testing

**Tests using external data MUST use adapters, not raw file reads**

**✅ Correct:**
```typescript
import { ExcelAdapter } from '../../../src/data/adapters/excelAdapter';

const adapter = new ExcelAdapter();
const testData = await adapter.load({ file: 'test-data/credentials.csv' });

for (const data of testData.records) {
  test(`should login: ${data.username}`, async ({ loginPage }) => {
    await loginPage.login(data.username, data.password);
  });
}
```

**❌ Incorrect:**
```typescript
import * as fs from 'fs';
const csvContent = fs.readFileSync('credentials.csv', 'utf-8');  // ❌ Direct file read
const rows = csvContent.split('\n');  // ❌ Manual parsing
```

**Approved adapters:**
- `ExcelAdapter` - For CSV/Excel files
- `JsonAdapter` - For JSON files
- `DbAdapter` - For database queries
- `S3Adapter` - For S3 storage

---

### 6. Wait Strategies

**NEVER use hardcoded waits**

**❌ Incorrect:**
```typescript
await page.waitForTimeout(2000);  // ❌ Hardcoded wait
await page.waitForTimeout(5000);  // ❌ Arbitrary delay
```

**✅ Correct:**
```typescript
await page.waitForSelector('#element', { state: 'visible' });
await expect(page.locator('#element')).toBeVisible();
await page.waitForLoadState('networkidle');
```

**If a test uses `waitForTimeout`:**
- ❌ FAIL - Test uses hardcoded waits
- Report: "Replace waitForTimeout with smart waits (waitForSelector, expect)"

---

### 7. Custom Matchers

**Tests SHOULD use custom matchers when available**

**Framework provides:**
- `toBeLoggedIn()` - Verify user is authenticated
- `toHaveNotification(message)` - Verify toast/notification
- `toBeOnPage(url)` - Verify page navigation

**✅ Correct:**
```typescript
await expect(page).toBeLoggedIn();
await expect(page).toHaveNotification('Login successful');
```

**⚠️ Acceptable but not preferred:**
```typescript
expect(await page.url()).toContain('/home');  // Works but less semantic
```

---

### 8. Logging Standards

**All tests MUST use Log utility, not console**

**✅ Correct:**
```typescript
import { Log } from '../../../src/utils/logger';

Log.info('TEST: Login with valid credentials');
Log.info('✅ Login successful');
Log.error('❌ Test failed:', error.message);
```

**❌ Incorrect:**
```typescript
console.log('Starting test');  // ❌ Use Log.info
console.error('Failed');  // ❌ Use Log.error
```

---

### 9. Test Isolation

**Each test MUST be independent**

**Check:**
- ✅ Tests can run in any order
- ✅ Tests clean up state (logout, clear storage)
- ✅ Tests don't rely on previous test results

**❌ Violations:**
```typescript
test('should login', async ({ loginPage }) => {
  await loginPage.login('user', 'pass');
  // ❌ Doesn't logout - state persists
});

test('should see dashboard', async ({ page }) => {
  // ❌ Assumes user is logged in from previous test
  await expect(page.locator('#dashboard')).toBeVisible();
});
```

**✅ Correct:**
```typescript
test('should see dashboard after login', async ({ loginPage, homePage }) => {
  await loginPage.login('user', 'pass');  // Setup state
  await expect(homePage.dashboardElement).toBeVisible();
  await homePage.logout();  // Cleanup
});
```

---

### 10. File Naming & Location

**Test files MUST follow naming convention:**

```
tests/
  specs/
    [module]/
      [feature].spec.ts
```

**Examples:**
- ✅ `tests/specs/auth/login.spec.ts`
- ✅ `tests/specs/dashboard/home.spec.ts`
- ✅ `tests/specs/espocrm/visit-site.spec.ts`
- ❌ `tests/login.test.ts` (wrong location, wrong extension)
- ❌ `tests/specs/loginTest.spec.ts` (should be in auth/ subfolder)

**Demo/Example files:**
- Go in `tests/specs/examples/`
- Get excluded from CI via `playwright.config.ci.ts`

---

## QA Validation Pipeline

### Phase 1: Requirements Verification

**Before test generation, verify:**

1. ✅ Test case documented in `specs_planning/test-cases/`
2. ✅ User story/requirement exists
3. ✅ Acceptance criteria defined
4. ✅ Page objects exist for features being tested
5. ✅ Test data available (credentials, fixtures, etc.)

**If missing, STOP and request:**
- "Missing test case documentation. Create in specs_planning/test-cases/[module]-test-cases.md"

---

### Phase 2: Test Spec Audit

**For each `.spec.ts` file, verify:**

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| File header present | ☐ | Must have PURPOSE/WHY/HOW/COVERAGE |
| Uses fixtures (not raw page) | ☐ | loginPage, homePage, etc. |
| Uses adapters for data | ☐ | ExcelAdapter, JsonAdapter, etc. |
| No hardcoded waits | ☐ | No `waitForTimeout` |
| Uses Log utility | ☐ | No `console.log` |
| Test isolation | ☐ | Independent, can run in any order |
| Follows naming convention | ☐ | `tests/specs/[module]/[feature].spec.ts` |
| Uses UiCommon.setupTestContext | ☐ | In beforeEach for UI tests |
| Custom matchers used | ☐ | toBeLoggedIn, toHaveNotification |
| No raw selectors in tests | ☐ | All selectors in page objects |

**Report format:**
```markdown
## Audit: tests/specs/auth/login.spec.ts

✅ File header present
❌ Uses raw page.goto() (line 45) - should use loginPage.goto()
✅ Uses Log utility
❌ Hardcoded wait on line 67 - replace with smart wait
✅ Test isolation verified
⚠️ Missing custom matcher on line 89 - use toBeLoggedIn()

**Severity:** Medium
**Action Required:** Fix raw page usage and hardcoded waits
```

---

### Phase 3: Framework Integration Check

**Verify test integrates with:**

1. ✅ Fixtures (`tests/fixtures.ts`)
2. ✅ Page objects (`src/pages/`)
3. ✅ Config (`src/config/`)
4. ✅ Common utilities (`src/common/ui-common.ts`)
5. ✅ Custom matchers (`tests/custom-matchers.ts`)
6. ✅ Data adapters (`src/data/adapters/`)

**If a test doesn't use these, investigate:**
- Is it a unit test? (OK to be standalone)
- Is it an example/demo? (Should be in `tests/specs/examples/`)
- Is it violating framework patterns? (Report violation)

---

### Phase 4: CI/CD Compatibility

**Check CI configuration:**

1. ✅ Test NOT excluded in `playwright.config.ci.ts`
2. ✅ Test doesn't require external dependencies (unless documented)
3. ✅ Test data files exist and are committed
4. ✅ Environment variables documented in `.env.example`

**If test will fail in CI:**
- Report: "Test requires [dependency] not available in CI. Document in README or exclude from CI."

---

## Automated Checks

**Run these commands to verify compliance:**

```bash
# 1. Check file headers
grep -r "FILE:" tests/specs/ --include="*.spec.ts" | wc -l
# Should match number of .spec.ts files

# 2. Find raw page usage (potential violations)
grep -r "page.goto(" tests/specs/ --include="*.spec.ts"
grep -r "page.fill(" tests/specs/ --include="*.spec.ts"
grep -r "page.click(" tests/specs/ --include="*.spec.ts"

# 3. Find hardcoded waits
grep -r "waitForTimeout" tests/specs/ --include="*.spec.ts"

# 4. Find console.log usage
grep -r "console.log" tests/specs/ --include="*.spec.ts"

# 5. Check fixture imports
grep -r "from '../../fixtures'" tests/specs/ --include="*.spec.ts"
```

---

## QA Report Template

```markdown
# QA Audit Report - [Date]

## Summary
- **Files Audited:** [count]
- **Fully Compliant:** [count]
- **Issues Found:** [count]
- **Critical Issues:** [count]

## Detailed Findings

### ✅ Compliant Files
- tests/specs/espocrm/visit-site.spec.ts

### ⚠️ Files with Issues

#### tests/specs/auth/login.spec.ts
**Issues:**
1. ❌ Missing file header
2. ❌ Uses page.goto() instead of loginPage.goto() (line 45)
3. ⚠️ Hardcoded wait on line 67

**Severity:** High
**Action:** Add header, refactor to use page object methods

#### tests/specs/examples/data-driven-login.spec.ts
**Issues:**
1. ❌ Uses raw CSV read instead of ExcelAdapter
2. ⚠️ Missing Log.info statements

**Severity:** Medium
**Action:** Refactor to use ExcelAdapter pattern

## Recommendations

1. [Priority 1] Fix all critical violations (file headers, raw page usage)
2. [Priority 2] Replace hardcoded waits with smart waits
3. [Priority 3] Add custom matcher usage where applicable

## Next Steps

- [ ] Developer review of findings
- [ ] Fix critical issues
- [ ] Re-run QA audit
- [ ] Update test case documentation
```

---

## Important Rules

**When performing QA validation:**

1. **DO NOT** assume - verify against actual code
2. **DO NOT** auto-fix - report findings for human review
3. **DO NOT** edit files in `docs/read_only_docs/` - this guide is immutable
4. **DO** provide specific line numbers and code snippets
5. **DO** categorize severity (Critical, High, Medium, Low)
6. **DO** suggest fixes with code examples
7. **DO** verify changes don't break existing tests

**Severity Levels:**

- **Critical:** Test will fail or break CI/CD
- **High:** Violates core framework patterns
- **Medium:** Doesn't follow best practices
- **Low:** Style/consistency issues

---

## End of Guide

**Remember:** This is a READ-ONLY guide. DO NOT modify. Reference this guide when asked to perform QA validation or audit framework compliance.

**Version:** 1.0
**Last Updated:** 2026-02-10
**Maintained by:** Framework Architecture Team
