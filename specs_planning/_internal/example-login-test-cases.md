# Login Test Cases

**Module**: auth | **Total**: 2 | **Automated**: 1 | **Manual**: 1

---

## TC-LOGIN-001: Standard Login with Valid Credentials

| Priority | Status | Type |
|----------|--------|------|
| High | ✅ Automated | User-Requested |

**Description**: Verify valid credentials authenticate and redirect to dashboard.

**Steps**:
1. Navigate to login → Login page loads
2. Enter valid username → Field populated
3. Enter valid password → Field masked
4. Click login → User authenticated
5. Verify dashboard → Main content visible

**Expected**: User authenticated, redirected to dashboard.

**Data**: `username=config.admin_username` | `password=config.admin_password`

**Automation**: `tests/specs/auth/login.spec.ts` L15-25

---

## TC-LOGIN-002: Invalid Credentials Error

| Priority | Status | Type |
|----------|--------|------|
| High | ⚠️ Manual | Agent-Discovered |

**Description**: Verify error message displays for invalid credentials.

**Steps**:
1. Navigate to login → Page loads
2. Enter invalid username → Field populated
3. Enter invalid password → Field populated
4. Click login → Error displays
5. Verify error message → "Invalid username or password"

**Expected**: Error notification, user stays on login page.

**Data**: `username=invalid@example.com` | `password=wrongpassword`
