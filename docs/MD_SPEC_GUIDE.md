# Markdown Spec Guide

## Overview

This guide explains how to create and maintain `.spec.md` (Markdown Specification) files alongside your Playwright test scripts (`.spec.ts`). These markdown files provide human-readable test documentation that complements automated test code.

---

## Why Use .md Specs?

**Benefits:**
1. **Non-Technical Readability**: Product owners, BAs, and stakeholders can understand test scenarios without reading code
2. **Living Documentation**: Specs stay up-to-date since they're version-controlled alongside tests
3. **Requirements Traceability**: Clear mapping between user stories and test scenarios
4. **Onboarding**: New team members understand test intent quickly
5. **Review**: Easier for non-developers to review test coverage

---

## File Naming Convention

**Rule**: Markdown spec filename must match the corresponding TypeScript test file.

**Examples:**
- `login.spec.ts` → `login.spec.md`
- `home.spec.ts` → `home.spec.md`
- `data-driven-login.spec.ts` → `data-driven-login.spec.md`
- `example.spec.ts` → `example.spec.md`

**Location**: Place .md spec in the same directory as the .ts test file.

```
tests/
├── example.spec.ts
├── example.spec.md        ← Same folder
└── specs/
    ├── auth/
    │   ├── login.spec.ts
    │   └── login.spec.md  ← Same folder
    └── dashboard/
        ├── home.spec.ts
        └── home.spec.md   ← Same folder
```

---

## Spec File Structure

Use the template from `tests/specs/TEMPLATE.md` as your starting point. Every spec should include:

### 1. Header Section
```markdown
# [Test Suite Name] - [Category] Spec

**Feature:** [Feature being tested]
**User Story:** As a [role], I want [action] so that [benefit]
**Priority:** [High/Medium/Low]
**Test Environment:** [Dev/Staging/Production]
```

**Purpose**: Provides context for why these tests exist and their business value.

### 2. Scenarios Section

Each scenario documents one test case:

```markdown
### Scenario N: [Descriptive Name]

**Description:** [What this scenario tests in 1-2 sentences]

**Prerequisites:**  
- [Prerequisite 1]
- [Prerequisite 2]

**Test Steps:**
1. [Action 1]
2. [Action 2]
3. [Action 3]

**Expected Results:**
- [Expected outcome 1]
- [Expected outcome 2]

**Test Data:**
- Field 1: [value or source]
- Field 2: [value or source]
```

**Guidelines:**
- **Scenario Name**: Should match the test name in .spec.ts (or close variant)
- **Description**: High-level summary of test purpose
- **Prerequisites**: System state, data, or config required before test runs
- **Test Steps**: Numbered actions in logical order (user perspective)
- **Expected Results**: What should happen after steps execute
- **Test Data**: Actual values OR references to data sources (e.g., "from config", "from Excel")

### 3. Acceptance Criteria

```markdown
## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
```

**Purpose**: High-level checklist that all tests in this spec must satisfy. NOT the same as expected results (which are per-scenario).

### 4. Tags

```markdown
## Tags: @smoke @auth @critical @regression
```

**Purpose**: Categorize tests for selective execution. Common tags:
- `@smoke` - Quick sanity tests
- `@regression` - Full regression suite
- `@critical` - Business-critical paths
- `@auth` - Authentication tests
- `@data-driven` - Data-driven tests
- `@api` - API tests (vs UI tests)

### 5. Notes Section

```markdown
## Notes

[Additional context, edge cases, known issues, performance targets, etc.]
```

**Purpose**: Capture information that doesn't fit elsewhere but is important for understanding the tests.

---

## Writing Effective Scenarios

### ✅ DO

**Use business language, not technical jargon:**
```markdown
**Test Steps:**
1. Navigate to login page
2. Enter valid username
3. Click "Login" button
```

**Be specific about expected results:**
```markdown
**Expected Results:**
- User redirected to /home/dashboard
- Welcome message displays: "Welcome, [username]"
- Session cookie created with 30-minute expiry
```

**Reference data sources clearly:**
```markdown
**Test Data:**
- Username: [from config - username_automation]
- Password: [from config - password_automation]
- User List: Excel file at config/test-data/users.csv
```

### ❌ DON'T

**Don't use code in scenarios:**
```markdown
<!-- WRONG -->
**Test Steps:**
1. Call page.goto(config.base_url)
2. await loginPage.loginWithMfa(username, password)
```

**Don't be vague:**
```markdown
<!-- WRONG -->
**Expected Results:**
- Login works
- Page loads
```

**Don't hardcode sensitive data:**
```markdown
<!-- WRONG -->
**Test Data:**
- Username: admin@company.com
- Password: SuperSecret123!
```

---

## Mapping .md Scenarios to .ts Tests

### Example Alignment

**.spec.md:**
```markdown
### Scenario 1: Successful Login with MFA

**Test Steps:**
1. Navigate to login page
2. Enter valid credentials
3. Submit MFA code
4. Verify redirect to home page
```

**.spec.ts:**
```typescript
test('should login successfully with valid credentials and MFA', async ({ config, page }) => {
  const result = await UiCommon.navigateToAuthenticatedPage(
    page, 
    config.base_url, 
    { type: 'env' }, 
    config
  );
  
  expect(result.authenticated).toBe(true);
  expect(page.url()).toContain(config.home_url);
});
```

**Notice**: 
- .md uses human language ("Navigate to login page")
- .ts uses code (`UiCommon.navigateToAuthenticatedPage()`)
- .md explains WHAT and WHY
- .ts implements HOW

---

## Maintaining Specs

### When to Update .md Specs

**Update Required:**
- ✅ New test added → Add new scenario to .md
- ✅ Test removed → Remove scenario from .md
- ✅ Test steps changed → Update scenario steps
- ✅ Expected results changed → Update expected results section
- ✅ Prerequisites changed → Update prerequisites

**No Update Needed:**
- ❌ Code refactoring (if behavior unchanged)
- ❌ Variable renaming
- ❌ Performance optimizations
- ❌ Comment updates in .ts file

### Review Process

**Before Merging PR:**
1. Check that all .spec.ts files have corresponding .spec.md files
2. Verify scenario count matches test count (approximately)
3. Ensure new tests have documented scenarios
4. Confirm test data references are accurate

---

## Templates and Examples

### Available Templates

- **`tests/specs/TEMPLATE.md`** - Generic test spec template
- **`tests/specs/auth/login.spec.md`** - Comprehensive authentication example
- **`tests/specs/dashboard/home.spec.md`** - Dashboard/page load example
- **`tests/specs/examples/data-driven-login.spec.md`** - Data-driven test example
- **`tests/example.spec.md`** - Simple framework usage example

### Using Templates

1. Copy `tests/specs/TEMPLATE.md`
2. Rename to match your .spec.ts file
3. Fill in all sections (replace `[placeholders]`)
4. Delete sections marked "optional" if not needed
5. Commit both .spec.ts and .spec.md together

---

## Best Practices

### 1. Keep Specs in Sync

**Problem**: Specs get outdated when tests change.

**Solution:**
- Update .md spec in the same commit as .ts test changes
- Add "spec update" to PR checklist
- Use code review to catch missing updates

### 2. Focus on Behavior, Not Implementation

**Wrong (too technical):**
```markdown
Uses UiCommon.navigateToAuthenticatedPage() workflow method with credential-loader 
to fetch credentials from .env and perform login via loginPage.loginWithMfa()
```

**Right (behavior-focused):**
```markdown
User logs in with valid credentials and MFA code, then is redirected to home page
```

### 3. Use Consistent Language

**Terminology:**
- "Navigate to [page]" (not "go to", "visit", "open")
- "Click [button]" (not "press", "select button")
- "Enter [data]" (not "type", "input", "fill")
- "Verify [condition]" (not "check", "ensure", "assert")

### 4. Reference Framework Features

**In Notes Section, explain framework-specific concepts:**
```markdown
## Notes

- **Thin Test Pattern**: Tests use UiCommon workflow methods to keep test code <10 lines
- **Credential Loader**: Credentials fetched dynamically from .env (not hardcoded)
- **CSV Locators**: Element locators defined in CSV files for non-technical updates
```

---

## Tooling and Automation

### Generating .md Specs

**Manual Creation** (recommended for now):
- Copy TEMPLATE.md
- Fill in sections based on test code
- Review with team

**Future Automation** (TODO):
- Script to detect .spec.ts files without .spec.md
- Linter to validate .md spec format
- Generator to create draft .md from .ts test names

### Validation Scripts

**Check for missing specs:**
```powershell
# Find .spec.ts files without corresponding .spec.md
Get-ChildItem -Recurse -Filter "*.spec.ts" | ForEach-Object {
  $mdFile = $_.FullName -replace "\.spec\.ts$", ".spec.md"
  if (-not (Test-Path $mdFile)) {
    Write-Host "Missing: $mdFile"
  }
}
```

---

## FAQs

### Q: Do I need .md specs for every test file?

**A:** Yes, every .spec.ts should have a .spec.md. Even simple tests benefit from documented scenarios for non-technical reviewers.

### Q: What if my test has 10 scenarios but 20 test cases?

**A:** Group similar test cases into scenarios. Example: "Login with invalid credentials" scenario can cover multiple test cases (wrong username, wrong password, empty fields).

### Q: Can I skip .md specs for skipped tests?

**A:** No. Document skipped tests with a note explaining why they're skipped and when they'll be enabled.

### Q: How detailed should "Test Data" section be?

**A:** Reference where data comes from ("from config.json", "from Excel users.csv"). Don't hardcode sensitive data.

### Q: What if automated test does more than the scenario describes?

**A:** Acceptable. .md describes user-facing behavior. .ts may include setup/teardown not in .md. Keep .md focused on business value.

---

## Conclusion

Markdown specs bridge the gap between technical test code and business requirements. By maintaining both .spec.ts (automated tests) and .spec.md (human-readable specs), we ensure:

- **Developers** understand test implementation
- **QA** understands test scenarios coverage
- **Product Owners** understand what's being validated
- **Stakeholders** can review without reading code

**Remember:** .md specs are living documentation. Keep them updated, and they'll provide immense value to your team.

---

**Related Documentation:**
- `tests/specs/TEMPLATE.md` - Copy this to create new specs
- `docs/REQUIREMENTS_TRACKER.md` - Maps requirements to tests
- `tests/specs/auth/login.spec.md` - Example of comprehensive spec
- `README.md` - Framework overview and getting started

