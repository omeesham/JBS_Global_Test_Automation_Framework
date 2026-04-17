# API Testing Requirements

**Purpose**: Tracks API-specific requirements separate from UI testing  
**Format**: Same REQ-XXX pattern as main REQUIREMENTS.md  
**Scope**: API endpoints, response formats, authentication flows  
**Last Updated**: 2026-02-08

---

## About This Document

**Why Separate from REQUIREMENTS.md?**
- **Clarity**: API testing requirements don't mix with UI requirements
- **Team Focus**: API testers see only relevant features
- **Faster AI Prompting**: AI agents find API requirements faster
- **Non-Technical**: Designed for prompters, not programmers

**How AI Agents Use This**:
1. User pastes DevTools data
2. Agent reads existing API requirements here
3. Agent creates/updates test files automatically
4. Agent updates this document with new REQ-API-XXX section

---

## Quick Reference

| REQ ID | Feature | Status | Location |
|--------|---------|--------|----------|
| REQ-API-001 | Authentication API | ✅ Implemented | api-testing/api-tests/auth/ |

---

## API Requirements

### REQ-API-001: Authentication API Testing
**Date Added**: 2026-02-08  
**Requested By**: User (Initial framework setup)  
**Status**: ✅ Implemented

**Original User Request**:
> "Create API tests for login, logout, and user info endpoints - no browser needed, test the API directly"

**Specifications**:
- **Endpoints Covered**:
  - `POST /api/auth/login` - User authentication
  - `POST /api/auth/logout` - Session termination
  - `GET /api/auth/me` - Current user info

- **Test Coverage**:
  - ✅ Successful login (valid credentials)
  - ✅ Invalid credentials rejection
  - ✅ Empty credentials validation
  - ✅ JWT token format validation
  - ✅ Complete user data structure check

- **Files Created**:
  - `api-testing/api-helpers/auth-api.ts` - Auth API connector
  - `api-testing/api-contracts/common.api.ts` - Generic response formats (not auth-specific yet)
  - `api-testing/api-tests/auth/authentication.spec.ts` - Authentication test suite

**Implementation Approach**:
1. **API Helper** (`auth-api.ts`):
   - Extends `BaseApiClient` for HTTP operations
   - Methods: `login()`, `logout()`, `getCurrentUser()`
   - Auto-manages JWT token in headers

2. **Response Contracts** (defined in `auth-api.ts` for now):
   - `LoginRequest` interface (username, password, mfaCode?)
   - `LoginResponse` interface (success, token?, user?, message?)
   - TypeScript validates structure at compile time

3. **Test Suite** (`authentication.spec.ts`):
   - 5 test scenarios covering happy path + edge cases
   - No browser dependency (faster execution)
   - Validates HTTP status codes, response structure, token format

**Rationale**:
- **Speed**: API tests 10x faster than UI tests (no browser overhead)
- **Isolation**: Tests API logic independent of UI changes
- **Hybrid Support**: Can use `auth-api.ts` in UI tests for faster setup
- **Token Testing**: Validates JWT generation (critical for security)

**Acceptance Criteria**:
- [x] POST /api/auth/login works with valid credentials
- [x] Invalid credentials return 401 status
- [x] Empty credentials return 400/422 (validation error)
- [x] Response includes valid JWT token (3-part format)
- [x] User object has id, username, email fields
- [x] Tests run independently (no browser needed)
- [x] TypeScript compilation passes (no type errors)

**Dependencies**:
- `axios` - HTTP client library
- `@playwright/test` - Test runner (API mode)
- Environment variables: `BASE_URL`, `USERNAME_AUTOMATION`, `PASSWORD_AUTOMATION`

**Related Documentation**:
- [api-testing/README.md](../api-testing/README.md) - Non-technical guide
- [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - API structure explanation
- [REQUIREMENTS.md](../REQUIREMENTS.md) - UI requirements (separate)

**Future Enhancements**:
- [ ] Create auth-specific contracts file (`api-contracts/auth.api.ts`)
- [ ] Add MFA flow tests (when MFA endpoint available)
- [ ] Add token refresh tests
- [ ] Add password reset API tests

---

## Template for New API Requirements

```markdown
### REQ-API-XXX: {Feature Name}
**Date Added**: YYYY-MM-DD  
**Requested By**: User (Name or role)  
**Status**: ⏳ Planned / 🔄 In Progress / ✅ Implemented

**Original User Request**:
> "{Paste user's exact request - quote format}"

**Specifications**:
- **Endpoints Covered**:
  - `HTTP_METHOD /api/path` - Description
  - `HTTP_METHOD /api/path2` - Description

- **DevTools Paste** (if provided):
  ```
  {Paste user's DevTools data here}
  ```

- **Test Coverage**:
  - [ ] Happy path scenario 1
  - [ ] Happy path scenario 2
  - [ ] Edge case 1
  - [ ] Error handling 1

- **Files to Create/Update**:
  - `api-testing/api-helpers/{feature}-api.ts` - API connector
  - `api-testing/api-contracts/{feature}.api.ts` - Response formats
  - `api-testing/api-tests/{module}/{scenario}.spec.ts` - Test suite

**Implementation Approach**:
1. **Extract from DevTools**:
   - Request URL → Endpoint path in helper
   - Request Body → Input interface in contracts
   - Response Body → Output interface in contracts
   - Status Codes → Expected assertions in tests

2. **Create Connector** (`{feature}-api.ts`):
   - Method for each endpoint
   - Input/output types from contracts
   - Error handling with try-catch
   - Logging all calls

3. **Create Tests** (`{feature}.spec.ts`):
   - One test per scenario
   - Cleanup in afterEach hooks
   - Assertions for EXACT structure from DevTools
   - Use environment variables (no hardcoded data)

**Rationale**:
{Why this API testing is needed - benefits of testing at API level vs UI level}

**Acceptance Criteria**:
- [ ] All endpoints callable via helper methods
- [ ] Response structure matches DevTools exactly
- [ ] Tests pass with real API
- [ ] TypeScript compilation successful
- [ ] Cleanup (delete test data) works properly
- [ ] Environment variables used (no hardcoded URLs/credentials)

**Dependencies**:
- {List npm packages needed}
- {List environment variables needed}
- {List prerequisite test data}

**Related Documentation**:
- [api-testing/README.md](../api-testing/README.md)
- [Other REQ-API-XXX sections if related]

**Future Enhancements**:
- [ ] {Potential improvements}
```

---

## DevTools Paste Examples

### Example 1: Login API

**What to Paste**:
```
Request URL: https://demo.us.espocrm.com/api/v1/auth/login
Request Method: POST
Status Code: 200 OK

Request Headers:
Content-Type: application/json

Request Payload:
{
  "username": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_123456",
    "username": "user@example.com",
    "email": "user@example.com"
  },
  "message": "Login successful"
}
```

**What AI Agent Will Do**:
1. Create `LoginRequest` interface from Request Payload
2. Create `LoginResponse` interface from Response
3. Create `login()` method in `auth-api.ts`
4. Create tests asserting exact response structure

---

### Example 2: Contact Creation

**What to Paste**:
```
Request URL: https://demo.us.espocrm.com/api/v1/contacts
Request Method: POST
Authorization: Bearer {token}
Content-Type: application/json

Request Payload:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890"
}

Response:
{
  "success": true,
  "data": {
    "id": "cnt_789012",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "createdAt": "2026-02-08T14:30:00Z",
    "updatedAt": "2026-02-08T14:30:00Z"
  }
}
```

**What AI Agent Will Do**:
1. Create `CreateContactRequest` interface
2. Create `CreateContactResponse` interface
3. Create `contacts-api.ts` connector
4. Create test with cleanup (delete contact in afterEach)

---

## Best Practices for API Requirements

### ✅ DO:
- Paste complete DevTools data (request + response)
- Include HTTP status codes
- Show error responses too (not just success)
- Mention if authentication required
- Specify cleanup needs (e.g., "delete created contact after test")

### ❌ DON'T:
- Assume agent knows API structure - paste it!
- Skip error responses (400, 401, 500 cases important)
- Hardcode sensitive data (use env vars in prompts)
- Forget to mention dependent endpoints (e.g., "login first, then create contact")

---

## Related Files

### Test Plans
- `specs_planning/test-plans/` - Technical automation plans (generated by Planner Agent)
- `specs_planning/test-cases/` - Detailed test scenarios (can include API tests)

### UI Requirements
- `REQUIREMENTS.md` - UI/browser-based testing requirements (separate)

### Architecture
- `api-testing/README.md` - Non-technical prompter guide
- `docs/ARCHITECTURE.md` - Framework structure + API integration

---

**Maintained By**: AI Agents + Development Team  
**Next REQ-API ID**: REQ-API-002 (auto-increment)
