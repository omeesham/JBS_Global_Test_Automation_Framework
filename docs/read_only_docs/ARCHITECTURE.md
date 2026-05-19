<!-- Trimmed per mega.md Phase 1B. File inventory, class hierarchy, selector architecture preserved. -->
# Framework Architecture & Integrations

**Purpose**: Framework directory structure, component relationships, integration points  
**Last Updated**: 2026-02-18

---

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Component Breakdown](#component-breakdown)
3. [Class Hierarchy](#class-hierarchy)
4. [Selector Architecture](#selector-architecture)
5. [Build & Distribution](#build--distribution)
6. [Quick Reference](#quick-reference)

---

## High-Level Overview

Hybrid Playwright TypeScript framework: UI + API testing, multi-source data-driven, manual + AI-generated tests.

### Directory Structure

```
encore_framework/
├── src/                    # Framework implementation (reusable)
│   ├── common/             # Base classes (BasePage, credential-loader)
│   ├── data/               # Data adapters (Excel, JSON, DB, S3)
│   ├── framework-contracts/# TypeScript type definitions (IConfig, ILocator)
│   ├── integrations/       # External integrations (SharePoint)
│   ├── pages/              # Page objects (LoginPage, HomePage)
│   ├── selectors/          # TypeScript selector repository
│   ├── utils/              # Utilities (logger, common-methods)
│   └── index.ts            # Barrel export (single entry point)
├── dist/                   # Compiled output (tsc → dist/)
├── tests/                  # Test specifications (.spec.ts files)
├── api-testing/            # API test framework (helpers, contracts, tests)
├── config/                 # Environment configuration
├── docs/                   # Documentation
├── specs_planning/         # Test plans (Markdown for Playwright Agents)
├── export_test_cases/      # CSV/JSON/Jira/TestMo converters
├── scripts/                # Build, packaging, pipeline tooling
├── .github/                # GitHub automation (CI/CD workflows)
└── [config files]          # playwright.config.ts, tsconfig.json, etc.
```

`src/` = reusable framework code, `tests/` = test implementations.

---

## Component Breakdown

### `src/core/` — Base Classes

| File | Purpose | Extended By |
|------|---------|-------------|
| `base-page.ts` | UI base: `clickWithRetry`, `fillWithValidation`, `getLocator` | All page objects |
| `credential-loader.ts` | Multi-source credential loading | — |
| `ui-common.ts` | Shared UI utilities | — |

#### `base-page.ts` — Key Methods

```typescript
export class BasePage {
  protected clickWithRetry(elementName: string): Promise<boolean>
  protected fillWithValidation(elementName: string, value: string): Promise<boolean>
  protected waitForElement(elementName: string): Promise<boolean>
  protected getLocator(elementName: string): string  // Resolves via getTsSelector()
}
```

### `src/pages/` — Page Object Model

> **Path note (post-2026-04-30 rebuild)**: Root `src/{common,utils,data,framework-contracts}/` is the framework source-of-truth and ships to clients via vendoring. Per-client page objects, selectors, and tests live at `clients/<id>/src/{pages,selectors}/` and `clients/<id>/tests/`. The vendored framework runtime is mirrored to `clients/<id>/dist/framework/` at delivery time. Snippets below show the *pattern*; actual files live under the active client (e.g. `clients/encore/src/pages/...`).

All page objects extend `BasePage`. No direct `page.click()` / `page.fill()` — selector resolution via `BasePage.getLocator()` → `clients/<id>/src/selectors/index.ts`.

```typescript
export class LoginPage extends BasePage {
  async login(username: string, password: string): Promise<boolean> {
    await this.fillWithValidation('txtUsername', username);
    await this.fillWithValidation('txtPassword', password);
    return await this.clickWithRetry('btnLogin');
  }
}
```

| File | Purpose |
|------|---------|
| `login.page.ts` | Login interactions (Microsoft SSO) |
| `home.page.ts` | Home/dashboard page |

### `src/data/` — Data Source Adapters

Factory pattern: `AdapterFactory.createAdapter('excel', {...})` creates the correct adapter implementing `IAdapter`. DB/S3 adapters use stub mode if credentials are missing.

```typescript
const adapter = AdapterFactory.createAdapter('excel', {
  filePath: './data/users.xlsx',
  sheetName: 'TestUsers'
});
const result = await adapter.load();
```

| File | Purpose |
|------|---------|
| `IAdapter.ts` | Interface contract (`load()` method) |
| `adapterFactory.ts` | Factory for creating adapters |
| `excelAdapter.ts` | Excel/CSV file loading |
| `jsonAdapter.ts` | JSON file/URL loading |
| `dbAdapter.ts` | Database query execution |
| `s3Adapter.ts` | AWS S3 object loading |

### `src/utils/` — Utilities

| File | Purpose |
|------|---------|
| `logger.ts` | Centralized logging (console + file) |
| `common-methods.ts` | Config loading (`initProp`) |
| `app-constants.ts` | Timeouts, feature flags |

#### Key Method Signatures

```typescript
// logger.ts
export class Log {
  static info(message: string): void
  static error(message: string): void
  static warn(message: string): void
}

// common-methods.ts
export class CommonMethods {
  static initProp(configPath?: string): IConfig
}
```

### `src/framework-contracts/` — Type Definitions

`IConfig`, `ILocator`, `TestMarker`, etc. in `src/framework-contracts/index.ts` (renamed from `.d.ts` for compilation to `dist/`).

### `api-testing/` — API Test Framework

Inheritance: `base-api.ts` (generic HTTP/axios) → extended by domain clients.

```typescript
// api-testing/api-helpers/auth-api.ts
export class AuthApiClient extends BaseApiClient {
  async login(username: string, password: string): Promise<LoginResponse> {
    return await this.post('/api/auth/login', { username, password });
  }
}
```

| Path | Purpose |
|------|---------|
| `api-testing/api-helpers/base-api.ts` | Base HTTP client (axios, retries, logging) |
| `api-testing/api-helpers/auth-api.ts` | Auth endpoints (login, logout, refresh) |
| `api-testing/api-contracts/common.api.ts` | TypeScript interfaces for API responses |
| `api-testing/api-tests/` | API test specs |

---

## Class Hierarchy

### UI Layer

```
BasePage (src/core/base-page.ts)
├── clickWithRetry(elementName)
├── fillWithValidation(elementName, value)
├── waitForElement(elementName)
└── getLocator(elementName) → src/selectors/index.ts
    ↑ extends
    ├── LoginPage (src/pages/auth/login.page.ts)
    ├── HomePage (src/pages/auth/home.page.ts)
    └── LocationFormHelpers (src/pages/locations/location-form-helpers.page.ts) [abstract]
        ↑ extends
        ├── LocationLocalInfoPage (src/pages/locations/location-local-info.page.ts)
        └── LocationCurrencyPage (src/pages/locations/location-currency.page.ts)
```

### API Layer

```
BaseApiClient (api-testing/api-helpers/base-api.ts)
├── get(), post(), put(), delete()
├── Auth headers, retry logic, logging
    ↑ extends
    ├── AuthApiClient (api-testing/api-helpers/auth-api.ts)
    └── [future API clients]
```

**Integration flow**: Tests → Page Objects / API Clients → Base Classes → Selectors / Utils → Playwright / Axios

---

## Selector Architecture

All selectors centralized in `src/selectors/index.ts`. Page objects reference by name; `BasePage.getLocator()` resolves via `getTsSelector()`.

```typescript
// src/selectors/index.ts
export const LoginSelectors = {
  txtUsername: 'input[name="username"]',
  btnLogin: 'button[type="submit"]',
} as const;

export function getTsSelector(elementName: string): string | null {
  return ALL_SELECTORS[elementName] ?? null;
}
```

**Resolution flow**: Test → Page Object method → `BasePage.getLocator(name)` → `getTsSelector(name)` → selector string → `page.locator(selector)`

---

## Build & Distribution

Compilation pipeline: `tsconfig.build.json` → `tsc` → `src/` compiled to `dist/` (JS + `.d.ts`) → `scripts/client-package.ts` → `client-delivery/`.


| Command | Purpose |
|---------|---------|
| `npm run build` | Compile `src/` → `dist/` |
| `npm run build:clean` | Clean `dist/` + rebuild |
| `npm run client:package` | 7-step packaging → `client-delivery/` |

**Key files**: `tsconfig.build.json` (build config), `src/index.ts` (barrel export), `scripts/client-package.ts` (packaging pipeline).

**Includes**: `dist/`, `tests/`, `config/`, `scripts/setup/`  
**Excludes**: `src/`, `specs_planning/`, `.github/agents/`

`dist/`, `client-delivery/`, `test-results/` hidden from VS Code explorer via `files.exclude`.

### Agent Integration

Agents modify selectively: `src/selectors/index.ts` (Planner adds), `src/pages/**/*.page.ts` (Generator adds methods), `tests/specs/*.spec.ts` (Generator creates, Healer fixes).

Agents never modify: `src/core/`, `src/utils/`, `src/security/`, `config/`.

#### Test Fixture Pattern

Tests consume page objects via Playwright fixtures (never `new LoginPage(page)`):

```typescript
import { test, expect } from '../../setup/fixtures';
test('should login successfully', async ({ loginPage, config }) => {
  expect(await loginPage.login(config.username, config.password)).toBe(true);
});
```

---

## Quick Reference

### Where to Put New Code

| What are you adding? | Where does it go? | Example |
|---------------------|-------------------|---------|
| New page object | `src/pages/{module}/` | `locations/contacts.page.ts` |
| New API endpoint | `api-testing/api-helpers/` | `contacts-api-client.ts` |
| New API response type | `api-testing/api-contracts/` | `contact-response.ts` |
| New data adapter | `src/data/adapters/` | `graphqlAdapter.ts` |
| New utility function | `src/utils/` | `crypto-utils.ts` |
| New base class | `src/core/` | `base-api-page.ts` |
| New test | `tests/specs/` | `contact-crud.spec.ts` |
| New element selectors | `src/selectors/index.ts` | Add to appropriate selector group |
| New environment config | `.env.{environment}` | `.env.e2e` |

---

## Related Documentation

- [REQUIREMENTS.md](../REQUIREMENTS.md) — Feature specifications
- [README.md](./README.md) — Framework quick start

---

**Last Updated**: 2026-02-18
