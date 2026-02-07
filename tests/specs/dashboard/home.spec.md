# Home - Dashboard Spec

**Feature:** Home Page/Dashboard

**User Story:** As an authenticated user, I want to see my dashboard after login so that I can access my workspace and navigate the application

**Priority:** High

**Test Environment:** Dev/Staging/Production

---

## Scenarios

### Scenario 1: Home Page Load After Successful Login

**Description:** Verify home page loads correctly after user authenticates

**Prerequisites:**  
- User has valid credentials
- Application is accessible
- User is not already logged in

**Test Steps:**
1. Navigate to application login page
2. Enter valid credentials (username/password)
3. Submit MFA code (if applicable)
4. System redirects to home page

**Expected Results:**
- URL contains `/home` or `/dashboard`
- Page loads within 3 seconds
- Page title is displayed correctly
- No loading errors or broken elements
- User sees dashboard widgets/content

**Test Data:**
- Username: [from config - username_automation]
- Password: [from config - password_automation]

---

### Scenario 2: User Session Persistence

**Description:** Verify user session remains active on home page without unexpected logouts

**Prerequisites:**  
- User is already logged in
- Home page is loaded

**Test Steps:**
1. Load home page after login
2. Wait for page to fully render
3. Check for logged-in indicators (profile icon, username)
4. Verify URL does not redirect to login page

**Expected Results:**
- User remains logged in (no unexpected redirects)
- Profile icon or username visible
- URL stays on home/dashboard page
- No session timeout errors
- No redirect to `/login` or `/auth` paths

**Test Data:**
- Session: Active from previous login

---

### Scenario 3: Dashboard Widgets/Components Rendering

**Description:** Verify dashboard displays expected widgets and content areas

**Prerequisites:**  
- User logged in
- Home page accessible
- User has data/permissions to view widgets

**Test Steps:**
1. Navigate to home page after login
2. Wait for page load complete
3. Check for presence of dashboard widgets
4. Verify content areas render correctly

**Expected Results:**
- Dashboard widgets/cards load successfully
- No broken or missing components
- Content is user-specific (if applicable)
- All navigation menus visible

**Test Data:**
- User: Standard user with default permissions

---

### Scenario 4: Navigation Elements Availability

**Description:** Verify primary navigation elements (sidebar, top nav, profile menu) are accessible

**Prerequisites:**  
- User logged in
- Home page loaded

**Test Steps:**
1. Load home page
2. Check for sidebar navigation (if applicable)
3. Check for top navigation bar
4. Check for profile menu icon
5. Verify all navigation links are clickable

**Expected Results:**
- Sidebar navigation visible (if applicable)
- Top navigation bar displayed
- Profile menu accessible
- Navigation links functional
- No broken navigation elements

**Test Data:**
- Navigation elements: Defined in CSV locators

---

## Acceptance Criteria

- [ ] Home page loads successfully after login
- [ ] User session persists without unexpected logouts
- [ ] Dashboard widgets/components render correctly
- [ ] Navigation elements are visible and functional
- [ ] Page title matches expected value
- [ ] URL contains `/home` or `/dashboard`
- [ ] No console errors or broken resources

## Tags: @smoke @dashboard @critical @regression

---

## Notes

- Home page performance target: <3 second load time
- Session timeout: 30 minutes of inactivity (configurable)
- Dashboard content may vary based on user role/permissions
- Some tests marked as `.skip` until navigation elements are fully configured

