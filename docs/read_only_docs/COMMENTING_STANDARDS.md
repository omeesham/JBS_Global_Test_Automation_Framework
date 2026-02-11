# Code Commenting Standards

## Purpose
This guide defines how to write **optimized, beginner-friendly comments** throughout the framework. Comments should make code understandable by non-programmers without overwhelming with repetition.

**Philosophy**: 1 concise comment per logical code block, focus on WHY/WHERE, skip obvious WHAT.

---

## Core Principles

### 1. **Use JSDoc for All Public APIs**
- **Classes, interfaces, methods** → JSDoc (shows in IDE tooltips on hover)
- **Private methods, local variables** → Regular `//` comments (if needed)

### 2. **Optimize Comment Density**
- **1 comment per logical block** (2-3 code lines)
- **Group related operations** under one comment
- **Don't repeat obvious code** ("increments counter" for `i++`)

### 3. **Focus Hierarchy**
1. **WHY** - Why does this code exist? What problem does it solve?
2. **WHERE** - Where does it connect? (file paths, line numbers, related methods)
3. **WHAT** - What does it do? (only if non-obvious)

### 4. **Inline Concept Explanations**
- **Embed analogies** in JSDoc (e.g., "Promise = pager at restaurant")
- **Explain jargon** first time it appears
- **Don't repeat** - reference earlier explanation in subsequent uses

### 5. **Hyperlink Everything**
- Use `{@link ClassName}` for clickable IDE navigation
- Use `@see` tags for related files/docs
- Include file paths with line numbers where helpful

---

## Comment Templates

### **File Headers** (All TypeScript/JavaScript files)

```typescript
/**
 * FILE: src/path/to/file.ts
 * 
 * PURPOSE: One-line description of what this file does
 * 
 * WHY NECESSARY: Why this file exists, what problem it solves (1-2 sentences)
 * 
 * USED BY:
 * - Specific file paths that import/use this
 * - Test files, page objects, etc.
 * 
 * HOW IT WORKS:
 * 1. Step-by-step explanation (3-5 steps)
 * 2. Key algorithms or patterns used
 * 3. Integration points with other components
 * 
 * @see {@link RelatedClass} - Related code (with file path)
 * @see docs/ARCHITECTURE.md#relevant-section - Architecture docs
 */
```

**Example**:
```typescript
/**
 * FILE: api-testing/api-helpers/auth-api.ts
 * 
 * PURPOSE: API client for authentication endpoints (login, logout, user info)
 * 
 * WHY NECESSARY: Provides standardized way to authenticate via API instead of UI.
 * Useful for API-only tests and hybrid tests that need faster login.
 * 
 * USED BY:
 * - tests/specs/auth/login.spec.ts (API authentication tests)
 * - Hybrid UI+API tests that skip browser login for speed
 * 
 * HOW IT WORKS:
 * 1. Extends {@link BaseApiClient} to inherit HTTP methods
 * 2. login() sends credentials, receives JWT token
 * 3. Token stored in headers for authenticated requests
 * 4. logout() invalidates token, clears headers
 * 
 * @see {@link BaseApiClient} - Parent class (api-testing/api-helpers/base-api.ts)
 * @see docs/ARCHITECTURE.md#the-api-confusion-explained - API client inheritance
 */
```

---

### **Import Statements**

```typescript
// Import description (what it provides) - file path
import { Something } from './path';
```

**Examples**:
```typescript
// Import HTTP client base (provides get/post/put/delete + auth header management) - api-testing/api-helpers/base-api.ts
import { BaseApiClient, ApiClientOptions } from '../../common/api-client';

// Import logger (writes to logs/app.log for debugging/reports) - src/utils/logger.ts
import { Log } from '../../utils/logger';

// Import CSV parsing library (parses comma-separated value files, supports comments with #)
import { parse } from 'csv-parse/sync';
```

---

### **Interfaces**

```typescript
/**
 * Interface description - what it defines
 * 
 * Concept explanation if needed (e.g., "Interface = contract TypeScript checks")
 * 
 * @example
 * const example: InterfaceName = { field1: 'value', field2: 123 };
 */
export interface InterfaceName {
  /** Property description (required/optional, type, constraints) */
  propertyName: string;
  
  /** Property with optional marker - "?" means can be omitted */
  optionalProp?: number;
}
```

**Example**:
```typescript
/**
 * Login credentials interface - defines required/optional fields for authentication
 * 
 * Interface = "contract" that TypeScript checks before code runs (prevents missing fields)
 * 
 * @example
 * const creds: LoginRequest = {
 *   username: 'john@example.com',
 *   password: 'SecurePass123!',
 *   mfaCode: '123456'  // Optional - only if user has 2FA enabled
 * };
 */
export interface LoginRequest {
  /** User's email or username (required) */
  username: string;
  
  /** Account password (required, sent encrypted over HTTPS, never logged) */
  password: string;
  
  /** 6-digit MFA code from authenticator app (optional - "?" means can be omitted) */
  mfaCode?: string;
}
```

---

### **Classes**

```typescript
/**
 * Class description - what it does
 * 
 * Concept explanation (e.g., "Class = blueprint for objects")
 * 
 * @extends {ParentClass} - Inheritance explanation if applicable
 * 
 * @example Create and use
 * const instance = new ClassName(options);
 * await instance.method();
 * 
 * @see {@link ParentClass} - Parent class (file path)
 * @see docs/file.md#section - Related documentation
 */
export class ClassName extends ParentClass {
  // ...
}
```

**Example**:
```typescript
/**
 * Authentication API Client
 * 
 * Handles login, logout, and user info retrieval via EspoCRM API.
 * Extends {@link BaseApiClient} to inherit HTTP methods and add auth-specific operations.
 * 
 * Class = "blueprint for objects" - create instances to interact with auth endpoints
 * 
 * @extends {BaseApiClient}
 * 
 * @example Create and use auth client
 * const authClient = new AuthApiClient({ baseURL: process.env.BASE_URL });
 * const response = await authClient.login({ username: 'user@example.com', password: 'pass' });
 * if (response.success) console.log('Token:', response.token);
 */
export class AuthApiClient extends BaseApiClient {
  // ...
}
```

---

### **Methods**

```typescript
/**
 * Method description - what it does (1 sentence)
 * 
 * Concept explanation if needed (e.g., "Promise = pager at restaurant")
 * 
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 * @throws {Error} Error conditions
 * 
 * @example Basic usage
 * const result = await instance.method(param);
 * 
 * @example Advanced usage (if needed)
 * const result = await instance.method({ option: value });
 * 
 * @see {@link RelatedMethod} - Related method (file path)
 */
async method(paramName: Type): Promise<ReturnType> {
  // Implementation
}
```

**Example**:
```typescript
/**
 * Login via API - authenticates user, stores JWT token for future requests
 * 
 * Promise = "pager at restaurant" (buzzes when data ready, can do other things while waiting)
 * async/await = "pause and wait" for server response before continuing
 * 
 * @param {LoginRequest} credentials - { username, password, mfaCode? }
 * @returns {Promise<LoginResponse>} Server response with token and user info
 * @throws {Error} Network error, invalid credentials, or server error
 * 
 * @example Basic login
 * const response = await client.login({ username: 'user@example.com', password: 'SecurePass123!' });
 * if (response.success) console.log('Logged in as:', response.user.username);
 * 
 * @example Login with MFA
 * const response = await client.login({ username: 'user@example.com', password: 'pass', mfaCode: '123456' });
 * 
 * @see {@link LoginRequest} - Credentials format
 * @see {@link LoginResponse} - Response format
 * @see {@link BaseApiClient.post} - Underlying HTTP POST method (api-testing/api-helpers/base-api.ts)
 */
async login(credentials: LoginRequest): Promise<LoginResponse> {
  // Implementation
}
```

---

### **Inline Comments** (Inside Method Bodies)

**Pattern**: `// What it does + where it connects (file:line) + why`

```typescript
// Group related operations under one comment
const result = await this.post('/endpoint', data);
if (result.success) {
  this.store(result.token);
}
```

**Examples**:
```typescript
// Good - concise, explains WHY/WHERE
Log.info(`API Login: ${credentials.username}`); // Log attempt to logs/app.log for debugging

// Good - groups related logic
// POST to /api/auth/login - "await" pauses until server responds (1-5 seconds)
// Uses inherited this.post() from BaseApiClient (api-testing/api-helpers/base-api.ts line 78)
const response = await this.post<LoginResponse>('/api/auth/login', credentials);

// Good - explains non-obvious behavior
if (response.data.token) {
  this.setAuthToken(response.data.token); // Store token in headers for future requests (BaseApiClient.setAuthToken - line 89)
  Log.info('✅ API login successful, token stored');
}

// Bad - too obvious
const username = credentials.username; // Get username from credentials

// Bad - too verbose
// This line of code takes the username property from the credentials object
// and assigns it to a new variable called username for later use
const username = credentials.username;
```

---

### **Constructors**

```typescript
/**
 * Constructor - brief description of initialization
 * 
 * @param {Type} paramName - Parameter description
 * 
 * @example
 * const instance = new ClassName({ option: value });
 */
constructor(paramName: Type) {
  super(paramName); // Call parent constructor - what it sets up (file path)
}
```

**Example**:
```typescript
/**
 * Constructor - initializes HTTP client via parent class
 * 
 * @param {ApiClientOptions} options - Config: { baseURL, timeout?, headers? }
 * 
 * @example
 * const client = new AuthApiClient({ baseURL: 'https://demo.us.espocrm.com/api/v1', timeout: 60000 });
 */
constructor(options: ApiClientOptions) {
  super(options); // Call BaseApiClient constructor - sets up axios, baseURL, interceptors (api-testing/api-helpers/base-api.ts)
}
```

---

## Concept Translations (Inline in JSDoc)

Embed these **once** where concept first appears, don't repeat:

| Code Concept | Human Translation |
|--------------|-------------------|
| **Promise** | "Pager at restaurant" (buzzes when data ready, can do other things while waiting) |
| **async/await** | "Pause and wait" for operation to complete before continuing |
| **try/catch** | "Safety net" - try risky code, catch errors to handle gracefully |
| **Interface** | "Contract" or "Blueprint" that TypeScript checks before code runs |
| **Class** | "Blueprint for objects" or "Factory machine" that creates instances |
| **extends** | "Inherits from" - gets all parent's methods/properties automatically |
| **void** | "No return value" - function completes but doesn't give data back |
| **?** (optional) | "Can be omitted" - field is not required |
| **any** | "Anything goes" - TypeScript won't check type (use sparingly) |
| **const** | "Constant" - value can't change after assignment |
| **let** | "Variable" - value can change |
| **arrow function** | "Shorthand function" - `(x) => x + 1` same as `function(x) { return x + 1; }` |
| **destructuring** | "Unpacking" - `const { name } = user` pulls `name` out of `user` object |
| **spread operator** | "Copy and expand" - `{ ...original, new: value }` copies original, adds new field |
| **template string** | "String with variables" - \`Hello ${name}\` inserts `name` into string |

**Usage Example**:
```typescript
/**
 * Fetch data from API
 * 
 * Promise = "pager at restaurant" (buzzes when data ready)
 * async/await = "pause and wait" for server response
 * 
 * @returns {Promise<Data>} Promise that resolves to data object
 */
async fetchData(): Promise<Data> {
  // "await" pauses here until server responds (1-5 seconds)
  const response = await this.get('/data');
  return response.data;
}
```

---

## Comment Length Guidelines

### **JSDoc (Class/Method Headers)**
- **Purpose**: 1 sentence
- **Concept**: 1 line (if needed)
- **@param**: 1 line each
- **@returns**: 1 line
- **@throws**: 1 line (if applicable)
- **@example**: 1-3 lines
- **@see**: 1-2 lines
- **Total**: 5-15 lines max per method

### **Inline Comments**
- **1 line per logical block** (2-4 code lines)
- **Format**: `// Action + connection (file:line) + reason`
- **Skip obvious**: Don't comment self-explanatory code

### **Import Comments**
- **1 line**: `// What it provides - file path`

---

## When to Comment

### ✅ **Always Comment**
- **File headers** (all files)
- **Public classes, interfaces** (JSDoc)
- **Public methods** (JSDoc with examples)
- **Complex logic** (loops, conditionals, async operations)
- **Non-obvious code** (regex, algorithms, workarounds)
- **Integration points** (where file connects to others)
- **Imports** (what they provide + file path)

### ⚠️ **Comment if Helpful**
- **Private methods** (if logic complex)
- **Constants** (if purpose unclear)
- **Type assertions** (why needed)

### ❌ **Don't Comment**
- **Obvious code** (`i++`, `return true`)
- **Self-explaining variable names** (`const userId = user.id`)
- **Standard patterns** (after explaining once)

---

## Examples by File Type

### **Page Objects** (src/pages/*.page.ts)

```typescript
/**
 * FILE: src/pages/login.page.ts
 * 
 * PURPOSE: Page object for login page interactions (UI automation)
 * 
 * WHY NECESSARY: Encapsulates login page elements and actions for reusable test code.
 * Follows Page Object Model pattern - no direct Playwright calls in tests.
 * 
 * USED BY:
 * - tests/specs/auth/login.spec.ts
 * - Hybrid tests that need UI login
 * 
 * HOW IT WORKS:
 * 1. Extends {@link BasePage} for common page operations
 * 2. Reads element selectors from CSV (object_repository/Login_Elements.csv)
 * 3. Provides high-level methods (login, enterUsername, clickLoginButton)
 * 4. Returns booleans for success/failure (true = action succeeded)
 * 
 * @see {@link BasePage} - Parent class (src/common/base-page.ts)
 * @see object_repository/Login_Elements.csv - Element locators
 */

// Import Playwright page object - provides browser automation API
import { Page } from '@playwright/test';
// Import base page class (provides clickElement, fillField helpers) - src/common/base-page.ts
import { BasePage } from '../common/base-page';

/**
 * Login Page Object
 * 
 * @extends {BasePage}
 */
export class LoginPage extends BasePage {
  private readonly csvFile = 'Login_Elements.csv'; // Element locators file in object_repository/
  
  /**
   * Login with username and password
   * 
   * @param {string} username - User's email or username
   * @param {string} password - Account password
   * @returns {Promise<boolean>} true if login succeeded, false if failed
   * 
   * @example
   * const loginPage = new LoginPage(page);
   * const success = await loginPage.login('user@example.com', 'SecurePass123!');
   */
  async login(username: string, password: string): Promise<boolean> {
    await this.fillField('txtUsername', this.csvFile, username); // Fill username field from CSV locator
    await this.fillField('txtPassword', this.csvFile, password); // Fill password field from CSV locator
    return await this.clickElement('btnLogin', this.csvFile); // Click login button, return success/failure
  }
}
```

### **Utilities** (src/utils/*.ts)

```typescript
/**
 * FILE: src/utils/common-methods.ts
 * 
 * PURPOSE: Shared utility methods used across framework (CSV reading, config loading, MFA)
 * 
 * WHY NECESSARY: Centralized helpers avoid code duplication in page objects and tests
 * 
 * USED BY:
 * - BasePage (CSV reading)
 * - Tests (config loading, MFA generation)
 * - Global setup/teardown
 * 
 * @see {@link BasePage} - Main consumer of CSV methods
 */

/**
 * Read value from CSV element repository
 * 
 * @param {string} elementName - Element name (first column in CSV)
 * @param {string} csvFileName - CSV file name (e.g., 'Login_Elements.csv')
 * @returns {string} Element locator value (second column in CSV)
 * @throws {Error} If element not found in CSV or file doesn't exist
 * 
 * @example
 * const locator = CommonMethods.getValuesFromCsv('btnLogin', 'Login_Elements.csv');
 * // Returns: "//input[@class='loginFormBtn']"
 */
static getValuesFromCsv(elementName: string, csvFileName: string): string {
  // Read CSV file from object_repository/ directory
  const csvPath = path.join('object_repository', csvFileName);
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  
  // Parse CSV with comment support (lines starting with # are ignored)
  const records = parse(fileContent, {
    columns: true,      // Use first row as column names
    skip_empty_lines: true,  // Ignore blank lines
    trim: true,         // Remove whitespace
    comment: '#'        // Treat # lines as comments (enables CSV documentation)
  });
  
  // Find element by name (case-sensitive match on first column)
  const element = records.find(r => r['Element Name'] === elementName);
  if (!element) throw new Error(`Element "${elementName}" not found in ${csvFileName}`);
  
  return element['Locator']; // Return locator value (second column)
}
```

### **Tests** (tests/specs/**/*.spec.ts)

```typescript
/**
 * FILE: tests/specs/auth/login.spec.ts
 * 
 * PURPOSE: Authentication tests for login functionality (UI + API)
 * 
 * USED BY: CI/CD pipeline, manual test execution
 * 
 * @see src/pages/login.page.ts - Login page object
 * @see api-testing/api-helpers/auth-api.ts - Auth API client
 */

import { test, expect } from '../fixtures'; // Custom fixtures (provides authenticated context)

test.describe('Login Authentication', () => {
  /**
   * UI Login Test - validates standard username/password login flow
   */
  test('should login successfully via UI', async ({ page, loginPage }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Perform login using page object (encapsulates element interactions)
    const success = await loginPage.login('user@example.com', 'password123');
    
    // Verify login succeeded and redirected to home page
    expect(success).toBeTruthy();
    await expect(page).toHaveURL(/\/home/);
  });
});
```

---

## Checklist for Commenting

Before committing new/modified files:

- [ ] File header present with PURPOSE, WHY, USED BY, HOW IT WORKS
- [ ] All imports have 1-line comment (what + file path)
- [ ] Public classes/interfaces have JSDoc with description + example
- [ ] Public methods have JSDoc with @param, @returns, @example
- [ ] Complex logic has inline comments explaining WHY/WHERE
- [ ] Concepts explained first time they appear (Promise, async, Interface, etc.)
- [ ] `{@link}` used for cross-references to other classes/methods
- [ ] `@see` tags reference related files/docs
- [ ] Comments are concise (1 line per block, not repeating code)
- [ ] No obvious comments ("increment i" for `i++`)

---

## References

- **Best Example File**: [api-testing/api-helpers/auth-api.ts](../api-testing/api-helpers/auth-api.ts)
- **Architecture Context**: [docs/ARCHITECTURE.md](ARCHITECTURE.md)
- **Framework Patterns**: [.github/copilot-instructions.md](../.github/copilot-instructions.md)
- **JSDoc Guide**: https://jsdoc.app/
- **TypeScript JSDoc**: https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html

---

**Version**: 1.0  
**Last Updated**: 2026-02-07  
**Maintained By**: AI Agent (GitHub Copilot)
