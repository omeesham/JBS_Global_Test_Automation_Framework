# Data-Driven Login Spec

**Feature:** Data-Driven Testing - Multi-User Login

**User Story:** As a QA engineer, I want to test login functionality with multiple user datasets so that I can verify the system handles various user types and credential formats

**Priority:** Medium

**Test Environment:** Dev/Staging

---

## Scenarios

### Scenario 1: Login with Multiple Users from Excel

**Description:** Verify login works for multiple users loaded from Excel spreadsheet

**Prerequisites:**  
- Excel file exists at `config/test-data/users.csv` or similar
- Excel contains columns: `username`, `password`, `role` (or similar)
- All users in Excel have active accounts
- ExcelAdapter configured and working

**Test Steps:**
1. Load test data from Excel file using AdapterFactory
2. For each user in Excel:
   - Navigate to login page
   - Enter username from Excel
   - Enter password from Excel
   - Submit login
   - Verify successful authentication

**Expected Results:**
- All users from Excel successfully log in
- Each user redirected to appropriate dashboard
- No authentication failures
- System handles different user roles correctly
- Data loaded without errors

**Test Data:**
- Source: Excel file at `config/test-data/users.csv`
- Columns: username, password, role, expected_landing_page
- Sample rows: 
  - admin_user, AdminPass123, admin, /admin/dashboard
  - standard_user, UserPass123, user, /home

---

### Scenario 2: Login with Multiple Users from JSON

**Description:** Verify login works for users loaded from JSON file

**Prerequisites:**  
- JSON file exists at `config/test-data/test-users.json`
- JSON contains array of user objects with `username`, `password` properties
- All users in JSON have active accounts
- JsonAdapter configured and working

**Test Steps:**
1. Load test data from JSON file using AdapterFactory
2. Parse JSON array of users
3. For each user in JSON:
   - Navigate to login page
   - Enter username from JSON
   - Enter password from JSON
   - Submit login
   - Verify successful authentication

**Expected Results:**
- All users from JSON successfully log in
- Each user redirected to home/dashboard
- JSON parsing works correctly
- No authentication failures
- System handles JSON data structure correctly

**Test Data:**
- Source: JSON file at `config/test-data/test-users.json`
- Format:
  ```json
  [
    { "username": "user1", "password": "Pass123", "role": "user" },
    { "username": "user2", "password": "Pass456", "role": "admin" }
  ]
  ```

---

### Scenario 3: Data-Driven Login with Parameterization

**Description:** Verify framework supports parameterized login tests with multiple data sources

**Prerequisites:**  
- AdapterFactory supports multiple adapters (Excel, JSON, DB, S3)
- Test data available in at least 2 formats
- Credential-loader configured

**Test Steps:**
1. Define test to accept data source as parameter
2. Run test with Excel data source
3. Run test with JSON data source
4. Verify both executions succeed
5. Compare results

**Expected Results:**
- Tests run successfully with different data sources
- Results are consistent regardless of source format
- No data adapter errors
- Framework handles format differences transparently

**Test Data:**
- Source 1: Excel (`config/test-data/users.csv`)
- Source 2: JSON (`config/test-data/test-users.json`)

---

### Scenario 4: Invalid Credentials from Data File

**Description:** Verify system correctly handles invalid credentials from data file

**Prerequisites:**  
- Test data file contains mix of valid and invalid credentials
- Expected results column indicates which should fail

**Test Steps:**
1. Load data file with mix of valid/invalid credentials
2. For each user:
   - Attempt login
   - Check if login succeeded or failed
   - Compare result with expected outcome from data file

**Expected Results:**
- Valid credentials authenticate successfully
- Invalid credentials show appropriate error messages
- System does not crash or hang on invalid data
- Error messages are user-friendly
- Failed attempts logged appropriately

**Test Data:**
- Data file includes:
  - Valid credentials (expected: success)
  - Invalid username (expected: failure)
  - Invalid password (expected: failure)
  - Empty credentials (expected: validation error)

---

## Acceptance Criteria

- [ ] Excel data source loads correctly
- [ ] JSON data source loads correctly
- [ ] Multiple users can log in from single data source
- [ ] AdapterFactory correctly selects appropriate adapter
- [ ] Invalid credentials are handled gracefully
- [ ] Test execution logs clearly show data-driven iterations
- [ ] Framework supports adding new data source types

## Tags: @data-driven @excel @json @smoke @integration

---

## Notes

- **Data-Driven Testing**: Uses AdapterFactory pattern to support multiple data sources
- **Adapter Support**: Excel, JSON, Database, S3, Environment variables
- **Credential Loader**: Implemented in `src/common/credential-loader.ts`
- **CSV Note**: Despite file extension `.csv`, Excel adapter is used (supports both CSV and XLSX)
- **Performance**: Large datasets (>100 users) should use parallel execution
- **Data Isolation**: Each test iteration should be independent and not affect others

