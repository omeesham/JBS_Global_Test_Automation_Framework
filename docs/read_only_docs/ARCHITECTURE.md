# Framework Architecture & Integrations

**Purpose**: Explains the framework's directory structure, component relationships, and integration points  
**Audience**: Developers, AI agents, new team members  
**Last Updated**: 2026-02-07

---

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Why `src/` Exists](#why-src-exists)
3. [Inside `src/` - Component Breakdown](#inside-src---component-breakdown)
4. [The API Confusion Explained](#the-api-confusion-explained)
5. [Component Integration Map](#component-integration-map)
6. [Data Flow Patterns](#data-flow-patterns)
7. [Common Questions Answered](#common-questions-answered)

---

## High-Level Overview

### Framework Philosophy

This is a **hybrid** Playwright TypeScript framework, meaning:
- **Hybrid #1**: UI automation + API testing (both supported)
- **Hybrid #2**: Data-driven testing with multiple data sources (Excel, JSON, DB, S3)
- **Hybrid #3**: Manual test creation + AI-generated tests (Playwright Agents)

### Directory Structure (30,000 ft View)

```
hybrid_framework/
├── src/                    # ⭐ SOURCE CODE - Framework implementation
├── tests/                  # Test specifications (.spec.ts files)
├── object_repository/      # CSV locator files (element selectors)
├── config/                 # Environment configuration
├── docs/                   # Documentation
├── specs_planning/                  # Test plans (Markdown for Playwright Agents)
├── .github/                # GitHub automation (CI/CD, Copilot agents)
└── [config files]          # playwright.config.ts, tsconfig.json, etc.
```

**Key Principle**: `src/` = reusable framework code, `tests/` = test implementations using that code.

---

## Why `src/` Exists

### The Problem Without `src/`

Without a dedicated source folder:
```
❌ BAD STRUCTURE
project/
├── login.page.ts           # Page object
├── api-client.ts           # API client
├── logger.ts               # Utility
├── login.spec.ts           # Test
├── config.ts               # Config
└── [everything mixed]
```

**Issues**:
- Tests mixed with framework code
- No clear separation of concerns
- Hard to reuse components
- Difficult to navigate for AI agents

### The Solution: `src/` for Framework Code

```
✅ GOOD STRUCTURE
project/
├── src/                    # Framework implementation (reusable)
│   ├── pages/              # Page objects
│   ├── api/                # API clients
│   ├── utils/              # Utilities
│   └── common/             # Base classes
├── tests/                  # Test implementations (use src/)
└── config/                 # Configuration
```

**Benefits**:
- Clear separation: framework vs tests
- Reusable components via `import { LoginPage } from '@pages/login.page'`
- Easy to understand for new developers and AI agents
- TypeScript path aliases work cleanly (`@pages`, `@utils`, `@api`)

---

## Inside `src/` - Component Breakdown

### 📁 `src/api/` - Domain-Specific API Implementations

**Purpose**: API testing and hybrid UI+API test support

**Structure**:
```
src/api/
├── clients/                # Domain-specific API clients
│   └── auth-api.ts  # Authentication API endpoints
└── models/                 # TypeScript interfaces for API responses
    └── common.api.ts     # LoginResponse, UserData, etc.
```

**What Lives Here**:
- **API Clients**: Classes that call specific API endpoints (login, CRUD operations)
- **API Models**: TypeScript interfaces defining API request/response shapes

**Example**:
```typescript
// api-testing/api-helpers/auth-api.ts
export class AuthApiClient extends BaseApiClient {
  async login(username: string, password: string): Promise<LoginResponse> {
    // Calls POST /api/auth/login
  }
}

// api-testing/api-contracts/common.api.ts
export interface LoginResponse {
  success: boolean;
  token: string;
  user: UserData;
}
```

**Used By**:
- API tests (`api-testing/api-tests/auth/*.spec.ts`)
- Hybrid tests that need API setup before UI testing
- Page objects that need to make API calls

---

### 📁 `src/common/` - Reusable Base Classes

**Purpose**: Shared foundational classes that other components extend

**Structure**:
```
src/common/
├── base-page.ts            # Parent class for all page objects
├── api-client.ts           # Parent class for all API clients
├── credential-loader.ts    # Multi-source credential loading
└── ui-common.ts            # Shared UI utilities
```

**What Lives Here**:
- **Base Classes**: SuperClasses that provide common functionality
- **Shared Utilities**: Functions used across multiple components
- **Integration Helpers**: Code that bridges different parts of framework

**Key Files Explained**:

#### `base-page.ts` - UI Base Class
```typescript
export class BasePage {
  // Common page operations ALL page objects inherit
  protected clickElement(name: string, csvFile: string): Promise<boolean>
  protected fillField(name: string, csvFile: string, value: string): Promise<boolean>
  protected waitForElement(name: string, csvFile: string): Promise<boolean>
}
```
**Extended by**: All page objects (`LoginPage`, `HomePage`, etc.)

#### `api-client.ts` - API Base Class
```typescript
export class BaseApiClient {
  // Common HTTP operations ALL API clients inherit
  protected get(url: string): Promise<AxiosResponse>
  protected post(url: string, data: any): Promise<AxiosResponse>
  protected put(url: string, data: any): Promise<AxiosResponse>
  protected delete(url: string): Promise<AxiosResponse>
}
```
**Extended by**: All API clients (`AuthApiClient`, `UserApiClient`, etc.)

**Used By**: Everything! This is the foundation layer.

---

### 📁 `src/data/` - Data Source Adapters

**Purpose**: Load test data from multiple sources (Excel, JSON, DB, S3, CSV)

**Structure**:
```
src/data/
└── adapters/
    ├── IAdapter.ts         # Interface contract (all adapters implement this)
    ├── adapterFactory.ts   # Factory pattern for creating adapters
    ├── excelAdapter.ts     # Excel/CSV file loading
    ├── jsonAdapter.ts      # JSON file/URL loading
    ├── dbAdapter.ts        # Database query execution
    ├── s3Adapter.ts        # AWS S3 object loading
    └── __tests__/          # Adapter unit tests
```

**What Lives Here**:
- **Adapter Interface**: `IAdapter` defines `load()` method contract
- **Concrete Adapters**: Implementations for different data sources
- **Factory**: `AdapterFactory.createAdapter('excel', {...})` creates correct adapter

**Example Usage**:
```typescript
// Load users from Excel
const adapter = AdapterFactory.createAdapter('excel', {
  filePath: './data/users.xlsx',
  sheetName: 'TestUsers'
});

const result = await adapter.load();
for (const user of result.data) {
  // user.username, user.password, user.email
}
```

**Key Feature**: **Graceful Degradation**
- DB/S3 adapters enter "stub mode" if credentials missing
- Tests still run with dummy data instead of failing
- Logged to help debug in CI

**Used By**:
- Data-driven tests (`tests/specs/examples/data-driven-login.spec.ts`)
- Tests that need bulk test data
- Credential loading (`src/common/credential-loader.ts`)

---

### 📁 `src/pages/` - Page Object Model

**Purpose**: UI page abstractions following Page Object Model pattern

**Structure**:
```
src/pages/
├── login.page.ts           # Login page interactions
├── home.page.ts            # Home/dashboard page
├── landing.page.ts         # Post-login landing page
├── working-screen.page.ts  # Main work area
└── index.ts                # Barrel exports (export all pages)
```

**What Lives Here**:
- **Page Objects**: Classes representing UI pages
- **Page Methods**: User actions abstracted as methods

**Critical Pattern**: ALL page objects extend `BasePage`
```typescript
export class LoginPage extends BasePage {
  private csvFile = 'Login_Elements.csv';
  
  async login(username: string, password: string): Promise<boolean> {
    await this.fillField('txtUsername', this.csvFile, username);
    await this.fillField('txtPassword', this.csvFile, password);
    return await this.clickElement('btnLogin', this.csvFile);
  }
}
```

**Why This Pattern**:
- No direct `page.click()` or `page.fill()` calls
- All selectors in CSV files (`object_repository/`)
- Consistent error handling and logging via BasePage
- Easy to update selectors without touching code

**Used By**:
- UI tests (`tests/specs/auth/login.spec.ts`)
- Playwright Agents (generated tests use page objects)
- Hybrid tests (UI + API)

---

### 📁 `src/utils/` - Framework Utilities

**Purpose**: Helper functions and shared utilities

**Structure**:
```
src/utils/
├── logger.ts               # Winston-based logging
├── common-methods.ts       # CSV reading, config loading, MFA
├── app-constants.ts        # Framework constants & feature flags
├── openai-utils.ts         # AI self-healing locators (optional)
└── index.ts                # Barrel exports
```

**What Lives Here**:
- **Logger**: Centralized logging to files and console
- **Common Methods**: Reusable functions (CSV parsing, TOTP generation)
- **Constants**: Environment URLs, timeouts, feature flags
- **AI Utils**: Optional OpenAI integration for self-healing

**Key Files Explained**:

#### `logger.ts` - Centralized Logging
```typescript
export class Log {
  static info(message: string): void
  static error(message: string): void
  static warn(message: string): void
  static debug(message: string): void
}
```
**Used everywhere**: All page objects, API clients, adapters log here

#### `common-methods.ts` - Shared Utilities
```typescript
export class CommonMethods {
  static getValuesFromCsv(elementName: string, csvFile: string): string
  static initProp(configPath?: string): IConfig
  static generateMfaCode(secret: string): string
}
```
**Used By**: BasePage (CSV reading), tests (config loading), login flows (MFA)

#### `app-constants.ts` - Framework Constants
```typescript
export class AppConstants {
  static readonly DEFAULT_TIMEOUT = 30000;
  static readonly ENABLE_AI_HEALING = true;
  static readonly LOG_LEVEL = 'info';
}
```
**Used By**: playwright.config.ts, page objects, global setup

**Used By**: Everything! Utilities are called from all layers.

---

## The API Confusion Explained

### Common Question: "Why is API code in TWO places?"

**Answer**: It's not duplication - it's **inheritance hierarchy**

```
api-testing/api-helpers/base-api.ts        ← BASE CLASS (generic HTTP)
         ↑
         | extends
         |
api-testing/api-helpers/auth-api.ts   ← SPECIFIC CLASS (auth endpoints)
api-testing/api-helpers/user-api-client.ts   ← SPECIFIC CLASS (user CRUD)
api-testing/api-helpers/crm-api-client.ts    ← SPECIFIC CLASS (CRM operations)
```

### Breakdown

#### `api-testing/api-helpers/base-api.ts` - The Foundation
**What it is**: Generic HTTP client (axios wrapper)
**What it does**: 
- Handles authentication headers
- Implements retry logic
- Logs all requests/responses
- Provides `get()`, `post()`, `put()`, `delete()` methods

**Example**:
```typescript
export class BaseApiClient {
  protected async post(url: string, data: any): Promise<AxiosResponse> {
    // Generic POST with auth, retries, logging
  }
}
```

**Never used directly** - Always extended by specific clients

---

#### `api-testing/api-helpers/*.ts` - Specific Implementations
**What they are**: Domain-specific API clients
**What they do**:
- Extend `BaseApiClient`
- Implement business logic for API endpoints
- Define request/response types

**Example**:
```typescript
export class AuthApiClient extends BaseApiClient {
  async login(username: string, password: string): Promise<LoginResponse> {
    // Uses inherited post() method from BaseApiClient
    return await this.post('/api/auth/login', { username, password });
  }
  
  async logout(token: string): Promise<void> {
    return await this.post('/api/auth/logout', { token });
  }
}
```

**Used directly** in tests and page objects

---

#### `api-testing/api-contracts/*.ts` - Type Definitions
**What they are**: TypeScript interfaces for API contracts
**What they do**: Define shapes of API requests and responses

**Example**:
```typescript
export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}
```

**Used by**: API clients and tests for type safety

---

### Visual Hierarchy

```
┌─────────────────────────────────────┐
│  api-testing/api-helpers/base-api.ts           │
│  (BaseApiClient)                    │
│  - Generic HTTP operations          │
│  - Auth headers                     │
│  - Retry logic                      │
│  - Logging                          │
└──────────────┬──────────────────────┘
               │
               │ extends
               │
    ┌──────────┴────────────────────────────────┐
    │                                           │
┌───▼──────────────────────┐    ┌──────────────▼───────────────┐
│ api-testing/api-helpers/         │    │ api-testing/api-helpers/             │
│ auth-api.ts       │    │ user-api-client.ts           │
│                          │    │                              │
│ - login()                │    │ - getUser()                  │
│ - logout()               │    │ - updateUser()               │
│ - refreshToken()         │    │ - deleteUser()               │
└──────────────────────────┘    └──────────────────────────────┘
```

---

## Component Integration Map

### How Everything Connects

```
┌─────────────────────────────────────────────────────────────┐
│                         TESTS                                │
│              tests/specs/**/*.spec.ts                        │
└──────────┬─────────────────────────┬────────────────────────┘
           │                         │
           │ imports                 │ imports
           │                         │
    ┌──────▼──────┐          ┌──────▼──────────┐
    │ src/pages/  │          │ api-testing/api-helpers/│
    │ *.page.ts   │          │ *.ts            │
    └──────┬──────┘          └──────┬──────────┘
           │                         │
           │ extends                 │ extends
           │                         │
    ┌──────▼──────────────────┐ ┌───▼─────────────────┐
    │ src/common/             │ │ src/common/         │
    │ base-page.ts            │ │ api-client.ts       │
    └──────┬──────────────────┘ └───┬─────────────────┘
           │                         │
           │ uses                    │ uses
           │                         │
    ┌──────▼──────────────────┐ ┌───▼─────────────────┐
    │ src/utils/              │ │ src/utils/          │
    │ common-methods.ts       │ │ logger.ts           │
    │ logger.ts               │ └─────────────────────┘
    └──────┬──────────────────┘
           │
           │ reads
           │
    ┌──────▼──────────────────┐
    │ object_repository/      │
    │ *_Elements.csv          │
    └─────────────────────────┘
```

### Data Flow Example: User Login Test

```
1. Test imports LoginPage
   tests/specs/auth/login.spec.ts
         ↓
2. LoginPage extends BasePage
   src/pages/login.page.ts
         ↓
3. BasePage uses CommonMethods to read CSV
   src/common/base-page.ts → src/utils/common-methods.ts
         ↓
4. CommonMethods reads selectors
   object_repository/Login_Elements.csv
         ↓
5. BasePage uses Logger to log actions
   src/utils/logger.ts
         ↓
6. Log written to file
   logs/test-2026-02-07.log
```

---

## Data Flow Patterns

### Pattern 1: UI Test Flow

```
Test File (tests/specs/auth/login.spec.ts)
    ↓ imports
Page Object (src/pages/login.page.ts)
    ↓ extends
BasePage (src/common/base-page.ts)
    ↓ uses
CommonMethods (src/utils/common-methods.ts)
    ↓ reads
CSV Locators (object_repository/Login_Elements.csv)
    ↓ returns selector to
Playwright (page.locator(selector).click())
```

### Pattern 2: API Test Flow

```
Test File (api-testing/api-tests/auth/authentication.spec.ts)
    ↓ imports
API Client (api-testing/api-helpers/auth-api.ts)
    ↓ extends
BaseApiClient (api-testing/api-helpers/base-api.ts)
    ↓ uses axios with
Logger (src/utils/logger.ts)
    ↓ makes HTTP request to
API Endpoint (https://api.example.com/auth/login)
    ↓ returns
Typed Response (api-testing/api-contracts/common.api.ts)
```

### Pattern 3: Data-Driven Test Flow

```
Test File (tests/specs/examples/data-driven-login.spec.ts)
    ↓ calls
AdapterFactory (src/data/adapters/adapterFactory.ts)
    ↓ creates
ExcelAdapter (src/data/adapters/excelAdapter.ts)
    ↓ implements
IAdapter (src/data/adapters/IAdapter.ts)
    ↓ loads data from
Excel File (config/test-data/users.xlsx)
    ↓ returns
AdapterResult (normalized test data)
    ↓ loops through
Test executes for each row
```

### Pattern 4: Hybrid UI+API Test Flow

```
Test File (tests/specs/hybrid/user-management.spec.ts)
    ↓ 1. Setup via API
API Client (api-testing/api-helpers/user-api-client.ts)
    ↓ creates test user in DB
    ↓ 2. Verify via UI
Page Object (src/pages/user-profile.page.ts)
    ↓ checks UI shows new user
    ↓ 3. Cleanup via API
API Client (api-testing/api-helpers/user-api-client.ts)
    ↓ deletes test user
```

---

## Common Questions Answered

### Q1: Why is there both `src/common/` and `src/utils/`?

**Answer**: Different purposes

- **`src/common/`** = **Base Classes** (BasePage, BaseApiClient)
  - Things that are **extended** by other classes
  - Inheritance hierarchy
  
- **`src/utils/`** = **Utility Functions** (Logger, CommonMethods)
  - Things that are **called/used** directly
  - No inheritance

**Example**:
```typescript
// common/ - EXTENDED
export class BasePage {
  // Other classes extend this
}

// utils/ - CALLED
export class Log {
  static info(msg: string) { }  // Called directly: Log.info('...')
}
```

---

### Q2: Why are page objects in `src/pages/` not just in `tests/`?

**Answer**: Reusability and separation of concerns

- **Page Objects** = Framework code (reusable across tests)
- **Tests** = Test implementations (use page objects)

**Example**:
```typescript
// src/pages/login.page.ts - REUSABLE
export class LoginPage extends BasePage {
  async login(user: string, pass: string) { }
}

// tests/specs/auth/login.spec.ts - TEST 1
test('valid login', async () => {
  await loginPage.login('user1', 'pass1');
});

// tests/specs/auth/mfa-login.spec.ts - TEST 2
test('MFA login', async () => {
  await loginPage.login('user2', 'pass2');
  // ... MFA steps
});
```

Both tests reuse the same `LoginPage` class.

---

### Q3: What's the difference between `config/` and `src/`?

**Answer**: Configuration vs Implementation

- **`config/`** = Environment settings, test data files
  - `.env` files
  - `config.json`
  - `test-data/users.xlsx`
  
- **`src/`** = Framework implementation code
  - TypeScript classes
  - Business logic
  - Reusable functions

**Rule**: `config/` = data, `src/` = code

---

### Q4: Why is `object_repository/` separate from `src/`?

**Answer**: Element locators are data, not code

- **`object_repository/`** = CSV files with element selectors
  - Editable by non-developers (QA team can update selectors)
  - Version controlled like data
  
- **`src/`** = TypeScript code
  - Requires TypeScript knowledge
  - Developers maintain this

**Example**:
```csv
# object_repository/Login_Elements.csv - DATA
Element Name,Locator
txtUsername,input[name='username']
btnLogin,button[type='submit']
```

```typescript
// src/pages/login.page.ts - CODE
await this.fillField('txtUsername', 'Login_Elements.csv', 'user');
```

QA can change CSS selectors in CSV without touching code.

---

### Q5: Do I put new API endpoints in `src/api/` or `src/common/`?

**Answer**: Depends on if it's generic or specific

- **`api-testing/api-helpers/base-api.ts`** - Only for generic HTTP methods
  - New HTTP verb? (e.g., PATCH) → Add to BaseApiClient
  - Generic retry logic? → Add to BaseApiClient
  
- **`api-testing/api-helpers/`** - For business logic
  - New API endpoint? → Create new client or extend existing
  - New response type? → Add to `api-testing/api-contracts/`

**Example**:
```typescript
// ❌ WRONG - Don't add specific logic to BaseApiClient
export class BaseApiClient {
  async loginToApp() { }  // Too specific!
}

// ✅ CORRECT - Create specific client
export class EspoCRMApiClient extends BaseApiClient {
  async login() { }  // Domain-specific logic
}
```

---

### Q6: Where do I put a new utility function?

**Decision Tree**:

1. **Is it a base class other classes extend?**
   - Yes → `src/common/`
   - No → Continue

2. **Is it page-related?**
   - Yes → `src/pages/`
   - No → Continue

3. **Is it API-related?**
   - Yes → `api-testing/api-helpers/` or `api-testing/api-contracts/`
   - No → Continue

4. **Is it a data adapter?**
   - Yes → `src/data/adapters/`
   - No → Continue

5. **Is it a reusable utility?**
   - Yes → `src/utils/`

---

### Q7: How do Playwright Agents integrate with this structure?

**Answer**: Agents generate tests, not framework code

```
Playwright Agents Workflow:
1. Planner Agent → Creates specs_planning/feature.md (test plan)
2. Generator Agent → Creates tests/specs/feature.spec.ts (uses src/)
3. Healer Agent → Fixes tests/specs/*.spec.ts (modifies tests)

Agents NEVER modify:
- src/ (framework code)
- object_repository/ (CSV locators)
- config/ (environment settings)

Agents ALWAYS create/modify:
- tests/specs/*.spec.ts (test implementations)
```

**Why**: Framework is stable foundation, tests are generated/repaired.

---

## Quick Reference

### Where to Put New Code

| What are you adding? | Where does it go? | Example |
|---------------------|-------------------|---------|
| New page object | `src/pages/` | `contacts.page.ts` |
| New API endpoint | `api-testing/api-helpers/` | `contacts-api-client.ts` |
| New API response type | `api-testing/api-contracts/` | `contact-response.ts` |
| New data adapter | `src/data/adapters/` | `graphqlAdapter.ts` |
| New utility function | `src/utils/` | `crypto-utils.ts` |
| New base class | `src/common/` | `base-api-page.ts` |
| New test | `tests/specs/` | `contact-crud.spec.ts` |
| New element selectors | `object_repository/` | `Contacts_Elements.csv` |
| New environment config | `.env.{environment}` | `.env.staging` |

### Import Path Aliases

```typescript
// Configured in tsconfig.json
import { LoginPage } from '@pages/login.page';      // src/pages/
import { Log } from '@utils/logger';                 // src/utils/
import { BasePage } from '@common/base-page';        // src/common/
import { AuthApiClient } from '@api/clients/auth-api';  // api-testing/api-helpers/
import { AdapterFactory } from '@data/adapters/adapterFactory'; // src/data/adapters/
```

---

## Related Documentation

- [REQUIREMENTS.md](../REQUIREMENTS.md) - Feature specifications and implementation decisions
- [.github/copilot-instructions.md](../.github/copilot-instructions.md) - AI agent coding guidelines
- [WORKFLOW_DIAGRAMS.md](./WORKFLOW_DIAGRAMS.md) - Visual workflow diagrams
- [PLAYWRIGHT_AGENTS_SETUP.md](./PLAYWRIGHT_AGENTS_SETUP.md) - Playwright Test Agents setup
- [README.md](./README.md) - Framework documentation and quick start

---

**Last Updated**: 2026-02-07  
**Framework Version**: 1.0.0  
**Maintained By**: AI Agents + Development Team
