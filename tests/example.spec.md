# Example Tests - Framework Demonstration

**Feature:** Framework Usage Examples

**User Story:** As a new developer or QA engineer, I want example tests demonstrating framework capabilities so that I can quickly learn how to write effective tests

**Priority:** Low (Documentation/Learning)

**Test Environment:** Dev/Staging

---

## Scenarios

### Scenario 1: Basic Login with MFA

**Description:** Demonstrates standard login flow using framework's thin test pattern

**Prerequisites:**  
- User has valid credentials in .env file
- MFA configured (if required)
- Application login page accessible

**Test Steps:**
1. Use `UiCommon.navigateToAuthenticatedPage()` workflow method
2. Pass credential source (type: 'env')
3. Verify authentication result
4. Check URL contains home page path

**Expected Results:**
- User successfully authenticated
- Result object has `authenticated: true`
- Page redirected to home/dashboard
- Session created

**Test Code Example:**
```typescript
const result = await UiCommon.navigateToAuthenticatedPage(
  page, 
  config.base_url, 
  { type: 'env' }, 
  config
);
expect(result.authenticated).toBe(true);
```

**Test Data:**
- Credentials: From `.env` file (username_automation, password_automation)

---

### Scenario 2: Forgot Password Link Verification

**Description:** Demonstrates element verification using page object methods

**Prerequisites:**  
- Login page accessible
- Forgot password link implemented

**Test Steps:**
1. Use `UiCommon.setupTestContext()` for initialization
2. Navigate to login page
3. Call `loginPage.isForgotPwdLinkExist()` method
4. Verify link existence

**Expected Results:**
- Forgot password link exists on page
- Link is visible to user
- Test passes with boolean assertion

**Test Code Example:**
```typescript
await UiCommon.setupTestContext(page);
await page.goto(config.base_url);
const linkExists = await loginPage.isForgotPwdLinkExist();
expect(linkExists).toBe(true);
```

**Test Data:**
- None (structural test)

---

### Scenario 3: Azure AD Login Option Verification

**Description:** Demonstrates SSO link verification using page object pattern

**Prerequisites:**  
- Login page has Azure AD SSO option
- Link configured in page object

**Test Steps:**
1. Setup test context
2. Navigate to login page
3. Check for Azure AD link using page object method
4. Assert link exists

**Expected Results:**
- Azure AD login link exists
- Method returns true
- Test demonstrates page object method usage

**Test Code Example:**
```typescript
await UiCommon.setupTestContext(page);
await page.goto(config.base_url);
const linkExists = await loginPage.isLoginUsingAzureAdLinkExist();
expect(linkExists).toBe(true);
```

**Test Data:**
- None (structural test)

---

### Scenario 4: Validation Helper Usage

**Description:** Placeholder example for using validation helper methods

**Prerequisites:**  
- Validation helpers implemented in CommonMethods
- CSV locators configured

**Test Steps:**
1. Setup test context
2. Navigate to page with element to validate
3. Use validation helper methods (placeholder)
4. Assert validation passes

**Expected Results:**
- Demonstrates framework's validation patterns
- Shows how to use CommonMethods utilities
- Placeholder for actual validation logic

**Test Code Example:**
```typescript
await UiCommon.setupTestContext(page);
// Example placeholder - implement actual validation logic
expect(true).toBe(true);
```

**Test Data:**
- Placeholder (to be defined when implementing actual validations)

---

## Acceptance Criteria

- [ ] Example tests demonstrate key framework features
- [ ] Tests use thin test pattern (<10 lines per test)
- [ ] Workflow methods from UiCommon class are showcased
- [ ] Page object pattern usage is clear
- [ ] New developers can understand and replicate patterns
- [ ] Tests are well-commented and self-explanatory

## Tags: @example @documentation @learning @smoke

---

## Notes

- **Purpose**: These tests serve as living documentation for the framework
- **Thin Test Pattern**: Each test <10 lines (excluding comments) per Req #9
- **Workflow Methods**: Leverage `UiCommon` class for common operations
- **Credential Loader**: Uses `credential-loader.ts` for dynamic credential fetching
- **CSV Locators**: Uses hybrid POM pattern (CSV + TypeScript page objects)
- **Learning Resource**: New team members should review these tests first
- **Maintenance**: Keep these tests updated as framework evolves
- **Running**: Execute with `npx playwright test example`

