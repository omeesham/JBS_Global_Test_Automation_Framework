# Login Authentication - Test Plan

**Module**: auth | **Test Cases**: `_internal/example-login-test-cases.md`

---

## Scenarios

### 1. Standard Login with MFA
- Navigate to `config.base_url` → Enter username/password → Click login
- MFA popup appears → Enter code → Verify redirect to home
- **Selectors**: txtUsername, txtPassword, btnLogin, txtMfaCode, btnMfaSubmit
- **Method**: `UiCommon.navigateToAuthenticatedPage()`

### 2. Forgot Password Link
- Navigate to login → Verify link visible
- **Method**: `loginPage.isForgotPwdLinkExist()`
- **Selector**: lnkForgotPassword

### 3. Azure AD Login Option
- Navigate to login → Verify SSO option visible
- **Method**: `loginPage.isLoginUsingAzureAdLinkExist()`
- **Selector**: lnkAzureAd

### 4. Invalid Credentials Error
- Enter invalid credentials → Click login → Verify error message
- **Method**: `loginPage.isLoginUnsuccessfulMsgDisplayed()`
- **Selector**: lblLoginUnsuccessful

---

## Accessibility

- **Keyboard**: Tab order: username → password → login → forgot password
- **Screen Reader**: All inputs have aria-labels

---

## Generator Notes

**Page Object**: `src/pages/login.page.ts`
**Output**: `tests/specs/auth/login.spec.ts`

```typescript
import { test, expect } from '../../setup/fixtures';

test('should login with MFA', async ({ loginPage, config }) => {
  expect(await loginPage.login(config.admin_username, config.admin_password)).toBe(true);
});
```
