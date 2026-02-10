# Login Authentication Test Cases

**Last Updated**: 2026-02-09
**Module**: Authentication
**Total Test Cases**: 2
**Automated**: 1 (50%)
**Manual**: 1 (50%)

---

## Related Files
- **Requirements**: `REQUIREMENTS.md` (#Login Module section — READ-ONLY reference)
- **Test Plan**: `specs_planning/test-plans/EXAMPLE-login-plan.md`
- **Automation**: `tests/specs/auth/login.spec.ts`
- **Page Object**: `src/pages/login.page.ts`
- **Locators**: `object_repository/Login_Elements.csv`

---

## Test Cases

### TC-LOGIN-001: Standard Login with Valid Credentials

**Priority**: High
**Type**: User-Requested
**Status**: ✅ Automated

**Description**:
Verify that a user with valid credentials can successfully authenticate and access the EspoCRM dashboard.

**Preconditions**:
- User has valid EspoCRM account
- Credentials stored in `.env.{environment}` (ADMIN_USERNAME, ADMIN_PASSWORD)
- Application is accessible at BASE_URL
- User is not currently authenticated

**Test Steps**:
1. Navigate to login page → Login page loads with username/password fields
2. Enter valid username → Username populated in field
3. Enter valid password → Password field shows masked characters
4. Click login button → User authenticated successfully
5. Verify redirect to dashboard → Dashboard page loads with main content visible

**Expected Result**:
User is successfully authenticated and redirected to EspoCRM dashboard. Main content area (#main) is visible.

**Test Data**:
| Field | Value | Source |
|-------|-------|--------|
| Username | admin@example.com | config.admin_username (.env) |
| Password | ******** | config.admin_password (.env) |
| Base URL | https://demo.us.espocrm.com/ | config.base_url (.env) |

**Automation Details** (filled by Generator agent):
- **File**: `tests/specs/auth/login.spec.ts`
- **Test Name**: `Login Tests > should login successfully with valid credentials`
- **Lines**: 15-25
- **CSV Locators Used**: txtUsername, txtPassword, btnLogin

**Last Test Run**: 2026-02-09T14:30:00Z
**Result**: ✅ PASSED

**Test Results** (last 5 runs):
| Run Date | Result | Duration | Notes |
|----------|--------|----------|-------|
| 2026-02-09 14:30 | ✅ PASSED | 2.5s | All elements found successfully |
| 2026-02-09 10:15 | ✅ PASSED | 2.3s | - |
| 2026-02-08 16:45 | ✅ PASSED | 2.7s | - |
| 2026-02-08 11:20 | ❌ FAILED | 5.0s | Timeout on dashboard load (network issue) |
| 2026-02-07 09:30 | ✅ PASSED | 2.4s | - |

**Known Issues**:
- None

**Tags**: `authentication`, `login`, `smoke-test`, `critical`

---

### TC-LOGIN-002: Invalid Credentials Error Handling

**Priority**: High
**Type**: Agent-Discovered
**Status**: ⚠️ Manual

**Description**:
Verify that the system displays an appropriate error message when invalid credentials are provided.

**Preconditions**:
- Application is accessible at BASE_URL
- User is not currently authenticated

**Test Steps**:
1. Navigate to login page → Login page loads
2. Enter invalid username → Username populated
3. Enter invalid password → Password populated
4. Click login button → Error message displays
5. Verify error message → Message indicates invalid credentials
6. Verify user remains on login page → No redirect occurs

**Expected Result**:
Error notification appears with message indicating invalid username or password. User remains on login page.

**Test Data**:
| Field | Value | Source |
|-------|-------|--------|
| Username | invalid@example.com | hardcoded (test data) |
| Password | wrongpassword | hardcoded (test data) |

**Automation Details** (filled by Generator agent):
- **File**: (Pending automation)
- **Test Name**: (Pending automation)
- **Lines**: (Pending automation)
- **CSV Locators Used**: (Pending - need error message locator)

**Last Test Run**: Not yet run
**Result**: N/A

**Test Results** (last 5 runs):
| Run Date | Result | Duration | Notes |
|----------|--------|----------|-------|
| - | - | - | Pending automation |

**Known Issues**:
- Error message locator not yet discovered by Planner agent
- Need to explore EspoCRM error notification mechanism

**Tags**: `authentication`, `login`, `error-handling`, `negative-test`

---

## Future Test Cases

Identified but not yet documented:
- Forgot password flow (click forgot password link → enter email → verify email sent)
- Empty credentials validation (submit without username/password → verify inline validation)
- Remember me functionality (check "remember me" → verify persistent session)
- Logout flow (click user menu → click logout → verify redirect to login)
