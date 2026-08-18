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

Hybrid Playwright TypeScript framework: client-specific UI tests plus shared framework and pipeline tooling.

### Directory Structure

```
encore_framework/
├── src/                    # Shared framework helpers and contracts
│   ├── common/             # Shared credential loading
│   ├── data/               # Data adapters (Excel, JSON, DB, S3)
│   ├── framework-contracts/# TypeScript type definitions
│   ├── utils/              # Shared utilities
│   └── index.ts            # Framework barrel export
├── clients/<id>/           # Client-owned Playwright surface
│   ├── src/pages/          # Page objects and components
│   ├── src/selectors/      # Selector repositories
│   ├── src/data/           # Client test data
│   ├── src/fixtures/       # Playwright fixtures
│   ├── tests/              # Test specifications
│   └── config/             # Client report/config assets
├── pipeline/               # Internal orchestration runtime
├── config/                 # Framework/pipeline configuration
├── docs/                   # Documentation
├── export_test_cases/      # XLSX (primary deliverable) / JSON / Jira / TestMo converters
├── scripts/                # Build, packaging, pipeline tooling
├── .claude/agents/         # Pipeline agent prompts
└── [config files]          # playwright.config.ts, tsconfig.json, etc.
```

`src/` = shared framework code, `clients/<id>/` = client implementation and tests.

---

## Component Breakdown

### Client page base classes

| File | Purpose | Extended By |
|------|---------|-------------|
| `clients/<id>/src/pages/base.page.ts` | UI base: `clickWithRetry`, `fillWithValidation`, `getLocator` | Client page objects |
| `clients/<id>/src/pages/components/location-form-helpers.component.ts` | Shared Location Settings helpers | Location Settings page objects |

#### `clients/<id>/src/pages/base.page.ts` — Key Methods

```typescript
export class BasePage {
  protected clickWithRetry(elementName: string): Promise<boolean>
  protected fillWithValidation(elementName: string, value: string): Promise<boolean>
  protected waitForElement(elementName: string): Promise<boolean>
  protected getLocator(elementName: string): string  // Resolves via getTsSelector()
}
```

### `clients/<id>/src/pages/` — Page Object Model

Each client is self-contained under `clients/<id>/src/{pages,selectors,data,fixtures,types,utils}/` plus `clients/<id>/tests/`. Root `src/` is shared framework code and is not where client page objects live.

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
| `clients/encore/src/pages/auth/login.page.ts` | Login interactions (Microsoft SSO) |
| `clients/encore/src/pages/locations/location-local-info.page.ts` | Location Settings Local Information tab |
| `clients/encore/src/pages/locations/location-currency.page.ts` | Location Settings Currency tab |

### Data sources

Root `src/data/adapters/` contains reusable data adapters. Client-specific test data lives under `clients/<id>/src/data/`.

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
| `excelAdapter.ts` | Excel / CSV test-data loading (boundary: separate concern from `test_cases_xlsx/encore_test_cases.xlsx` workbook, which is the client deliverable) |
| `jsonAdapter.ts` | JSON file/URL loading |
| `dbAdapter.ts` | Database query execution |
| `s3Adapter.ts` | AWS S3 object loading |

### Utilities

| File | Purpose |
|------|---------|
| `src/utils/logger.ts` | Shared framework logging |
| `src/utils/common-methods.ts` | Shared config loading (`initProp`) |
| `clients/<id>/src/utils/logger.ts` | Client test logging |

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

### `src/framework-contracts/` — Shared Type Definitions

`IConfig`, `ILocator`, `TestMarker`, etc. in `src/framework-contracts/index.ts` (renamed from `.d.ts` for compilation to `dist/`).

## Class Hierarchy

### UI Layer

```
BasePage (clients/encore/src/pages/base.page.ts)
├── clickWithRetry(elementName)
├── fillWithValidation(elementName, value)
├── waitForElement(elementName)
└── getLocator(elementName) → clients/encore/src/selectors/index.ts
    ↑ extends
    ├── LoginPage (clients/encore/src/pages/auth/login.page.ts)
    ├── LocationFormHelpers (clients/encore/src/pages/components/location-form-helpers.component.ts) [abstract]
        ↑ extends
        └── LocationLocalInfoPage (clients/encore/src/pages/locations/location-local-info.page.ts)
    └── LocationCurrencyPage (clients/encore/src/pages/locations/location-currency.page.ts)
```

### API Layer

No tracked API-client layer exists in the current repository.

**Integration flow**: Tests → Page Objects → BasePage → Selectors / Utils → Playwright

---

## Selector Architecture

Client selectors are centralized in `clients/<id>/src/selectors/index.ts`. Page objects reference by name; `BasePage.getLocator()` resolves via `getTsSelector()`.

```typescript
// clients/encore/src/selectors/index.ts
export const MicrosoftLoginSelectors = {
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

Build pipeline: `tsconfig.build.json` → `tsc` → root framework output. Client delivery uses `npm run client:ship` → `scripts/ship-client.sh`.


| Command | Purpose |
|---------|---------|
| `npm run build` | Compile `src/` → `dist/` |
| `npm run build:clean` | Clean `dist/` + rebuild |
| `npm run client:ship` | Archive a self-contained `clients/<id>/` bundle to the requested output path |

**Key files**: `tsconfig.build.json` (build config), `src/index.ts` (barrel export), `scripts/ship-client.sh` (client shipping pipeline).

**Includes**: `clients/<id>/src/`, `clients/<id>/tests/`, `clients/<id>/config/`, client package/config files.  
**Excludes**: client-planning artifacts, auth state, local server env files, and internal framework/pipeline directories.

`dist/`, `client-delivery/`, `test-results/` hidden from VS Code explorer via `files.exclude`.

### Agent Integration

Agents modify selectively: `clients/<id>/src/selectors/index.ts`, `clients/<id>/src/pages/**/*.page.ts`, and `clients/<id>/tests/**/*.spec.ts`.

Agents never modify unrelated framework internals or client configuration without an explicit ticket.

#### Test Fixture Pattern

Tests consume page objects via Playwright fixtures (never `new LoginPage(page)`):

```typescript
import { test, expect } from '../../src/fixtures/pages.fixture';
test('should login successfully', async ({ loginPage, config }) => {
  expect(await loginPage.login(config.username, config.password)).toBe(true);
});
```

---

## Quick Reference

### Where to Put New Code

| What are you adding? | Where does it go? | Example |
|---------------------|-------------------|---------|
| New page object | `clients/<id>/src/pages/{module}/` | `locations/contacts.page.ts` |
| New data adapter | `src/data/adapters/` | `graphqlAdapter.ts` |
| New client utility | `clients/<id>/src/utils/` | `grid-utils.ts` |
| New shared utility | `src/utils/` | `crypto-utils.ts` |
| New test | `clients/<id>/tests/{module}/` | `contact-crud.spec.ts` |
| New element selectors | `clients/<id>/src/selectors/{module}/` | Add to appropriate selector group |
| New client data | `clients/<id>/src/data/{module}/` | `contacts.ts` |

---

## Related Documentation

- [REQUIREMENTS.md](../../clients/encore/docs/REQUIREMENTS.md) — Encore feature specifications
- [README.md](./README.md) — Framework quick start

---

**Last Updated**: 2026-02-18
