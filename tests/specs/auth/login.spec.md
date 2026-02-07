# Login - Authentication Spec

**Feature:** User Authentication

**User Story:** As a user, I want to securely log into the application so that I can access my account

**Priority:** High 

**Test Environment:** Dev/Staging/Production

---

## Scenarios

### Scenario 1: Successful Login with Valid Credentials

**Description:** Verify user can log in with valid username and password

**Prerequisites:**  
- User account exists in system
- Application login page is accessible

**Test Steps:**
1. Navigate to login page
2. Enter valid username
3. Enter valid password
4. Click "Login" button

**Expected Results:**
- User redirected to home/dashboard page
- Welcome message displayed with username
- Session token created

**Test Data:**
- Username: test_user_001
- Password: ValidPass123!

---

### Scenario 2: Login with MFA

**Description:** Verify MFA authentication flow works correctly

**Prerequisites:**  
- User has MFA enabled on account
- TOTP secret configured

**Test Steps:**
1. Navigate to login page
2. Enter valid username and password
3. System prompts for MFA code
4. Enter valid TOTP code
5. Click "Verify" button

**Expected Results:**
- MFA prompt appears after initial credentials
- Valid TOTP code grants access
- User redirected to dashboard

**Test Data:**
- Username: test_user_mfa
-  Password: ValidPass123!
- MFA Secret: [from config]

---

### Scenario 3: Forgot Password Flow

**Description:** Verify password reset request functionality

**Prerequisites:**  
- User account exists
- Email service working

**Test Steps:**
1. Navigate to login page
2. Click "Forgot Password?" link
3. Enter registered email address
4. Click "Send Reset Link" button

**Expected Results:**
- Success message displayed
- Password reset email sent
- Reset link valid for 24 hours

**Test Data:**
- Email: testuser@example.com

---

### Scenario 4: Invalid Credentials

**Description:** Verify appropriate error message for wrong credentials

**Prerequisites:**  
- Login page accessible

**Test Steps:**
1. Navigate to login page
2. Enter invalid username
3. Enter invalid password
4. Click "Login" button

**Expected Results:**
- Login fails
- Error message: "Invalid username or password"
- User remains on login page
- No sensitive information revealed

**Test Data:**
- Username: invalid_user
- Password: WrongPass123

---

### Scenario 5: Azure AD SSO Login

**Description:** Verify Azure AD single sign-on integration

**Prerequisites:**  
- Azure AD configured
- User exists in Azure AD

**Test Steps:**
1. Navigate to login page
2. Click "Sign in with Microsoft" button
3. Redirect to Azure AD login
4. Enter Azure credentials
5. Grant consent (if first time)

**Expected Results:**
- Redirect to Azure AD successful
- After auth, return to application
- User logged in without additional password
- Profile synced from Azure AD

**Test Data:**
- Azure Email: azureuser@company.com
- Azure Password: [from Azure config]

---

## Acceptance Criteria

- [ ] Valid credentials allow login
- [ ] Invalid credentials show error message
- [ ] MFA flow works end-to-end
- [ ] Password reset email sent successfully
- [ ] Azure AD SSO integration functional
- [ ] Session persists across page reloads
- [ ] Logout clears session completely

## Tags: @smoke @auth @critical @regression

---

## Notes

- Account lockout after 5 failed attempts (test separately)
- Password must meet complexity requirements
- Session timeout: 30 minutes of inactivity
