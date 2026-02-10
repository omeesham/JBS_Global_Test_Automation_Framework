# AI Agent Instructions - Autonomous Hybrid Playwright Framework

## Mission & Philosophy

This is a **fully autonomous hybrid Playwright TypeScript framework** for EspoCRM test automation. "Hybrid" means:
- **Page Object Model (POM)** for UI interactions
- **Dual Object Repository** (CSV + TypeScript selectors)
- **Data Adapters** for flexible test data sources (Excel, JSON, Database, S3, CSV)
- **Playwright Test Agents** (Planner, Generator, Healer) with autonomous work discovery
- **Multi-environment support** (development, staging, production)
- **Work Queue System** for inter-agent communication

**Core Principle**: MINIMUM USER INTERVENTION, MAXIMUM AGENT EFFICIENCY, MAXIMUM AUTONOMY.

---

## 0. User Intake — How Tests Enter the Pipeline

Users describe test flows in **plain English** to Claude Code or any Copilot agent. No formal tables, no file paths, no selectors needed.

**Example user input:**
> "I want to test forgot password. User clicks 'Forgot Password?' on login page. New page opens with email field. User enters email and clicks Submit. If email is valid → success message. If email not found → error. If empty → validation error."

**What the intake agent (Copilot agent) does:**

1. **Updates `REQUIREMENTS.md`** if the user describes a new feature/module or refines existing ones:
   - Before ANY edit, show the user a short summary of proposed changes (ADD / UPDATE / REMOVE)
   - User reviews and approves before the file is touched
   - ADD: New module sections, new behaviors, new fields
   - UPDATE: Refine existing descriptions when user provides better info
   - REMOVE: Only if user confirms a feature no longer exists in the app — be cautious
   - Once edited, REQUIREMENTS.md stays as-is until user provides new data or clarification
2. Creates `specs_planning/test-cases/{feature}-test-cases.md` using TEMPLATE.md format
   - Each scenario → test case with ID, priority, steps, expected results
   - Marked as `Type: User-Requested`, `Status: ⚠️ Manual`
3. Adds entry to `specs_planning/agent-queue.json` with `stage: "pending_planning"`
4. Tells user: "Ready — invoke the agents"

**User then invokes agents (manual trigger, autonomous execution):**
- `@playwright-test-planner` → Reads queue, explores website, creates detailed plan
- `@playwright-test-generator` → Reads queue, generates .spec.ts, runs tests
- `@playwright-test-healer` → Runs tests, finds failures, fixes them

**Tips for describing flows:**
- Describe what user DOES and what they SEE at each step
- Include happy path + negative cases + edge cases
- Agents discover selectors, file paths, and technical details automatically
- You can describe multiple flows in one message

---

## 1. Critical Rules — Read First

### 1.1 REQUIREMENTS.md Access Rules

**REQUIREMENTS.md describes the EspoCRM website** — its modules, features, user flows, and expected behaviors.

**Playwright Agents (Planner, Generator, Healer): READ-ONLY — NEVER modify.**
- Agents MUST read REQUIREMENTS.md before exploring for website context.
- Element discoveries, selector details, test results → `specs_planning/test-cases/*.md`

**Copilot Agents (Claude Code, GitHub Copilot, etc.): CAN update on user request, with approval.**
- When user describes a new feature or refines existing info, copilot agents update REQUIREMENTS.md
- **Before ANY edit**: Show user a short summary of proposed changes for verification
- **ADD**: New module sections, new behaviors, new fields described by user
- **UPDATE**: Refine existing entries when user provides better/newer info
- **REMOVE**: Only when user confirms a feature no longer exists — be cautious
- Once edited, the file stays as-is until user provides new data or clarification
- **Critical**: Show changes for approval BEFORE saving — user can catch mistakes

### 1.2 Work Queue System

**`specs_planning/agent-queue.json`** is the shared state for all agents. Schema: `specs_planning/agent-queue.schema.json`.

**Stage transitions**:
```
pending_planning → planning → pending_generation → generation → pending_testing → testing
  → completed (all pass)
  → pending_healing → healing → completed (healed) OR fixme (gave up)
```

**Lock protocol**: Before working on a queue item, set `lockedBy` to your agent name and `lockedAt` to current timestamp. When done, set `lockedBy: null`. If `lockedAt` is older than `config.lockTimeoutMinutes`, the lock is stale — steal it.

### 1.3 Search-Before-Create Protocol

**EVERY agent MUST follow this before creating ANY new code/file**:

```
NEED UTILITY FUNCTION?
  → Search src/utils/common-methods.ts
  → FOUND exact match? Import and use
  → FOUND similar? Can you ADJUST safely without breaking callers? → Adjust
  → NOT FOUND? Add to CommonMethods class — NEVER create new util files

NEED PAGE METHOD?
  → Search src/pages/*.page.ts
  → FOUND? Use via fixture
  → FOUND but needs tweaking? Adjust if safe, else add new variant
  → NOT FOUND? Add to relevant page object

NEED LOCATOR/SELECTOR?
  → Search src/selectors/index.ts (TypeScript — fast, no I/O)
  → Search object_repository/*.csv (CSV — fallback)
  → FOUND? Use existing
  → NOT FOUND? Add to BOTH TypeScript AND CSV

NEED CONSTANT?
  → Search src/utils/app-constants.ts
  → FOUND? Use
  → NOT FOUND? Add to AppConstants class

NEED CUSTOM ASSERTION?
  → Search tests/custom-matchers.ts
  → FOUND? Use via expect(x).toBeXxx()
  → NOT FOUND? Add to custom-matchers.ts + add type declaration in framework-contracts/index.d.ts

NEED FIXTURE?
  → Search tests/fixtures.ts
  → FOUND? Use existing fixture
  → NOT FOUND? Add new fixture definition + import page object

NEED TEST FILE?
  → Search tests/specs/**/*.spec.ts
  → FOUND? Add test cases to existing file
  → NOT FOUND? Create in tests/specs/{module}/
```

### 1.4 File Ownership Matrix

**Philosophy**: Agents are autonomous workers who build everything — but humans control the framework foundation. **Code once, reuse everywhere** — agents search for existing solutions first, adjust if safe, create new only in the right existing file.

#### Agent-Maintained: Tests, Page Objects, Selectors

| File | Planner | Generator | Healer | Notes |
|------|---------|-----------|--------|-------|
| `tests/specs/**/*.spec.ts` | — | **CREATE** | **FIX/fixme** | Generator builds tests, Healer fixes failures |
| `src/pages/*.page.ts` | READ | **ADD methods** | **FIX methods** | Generator extends, Healer repairs |
| `src/pages/index.ts` | READ | **UPDATE exports** | — | Generator updates barrel file |
| `object_repository/*.csv` | **ADD rows** | **ADD rows** | **FIX rows** | All agents maintain selectors (add/fix) |
| `src/selectors/index.ts` | **ADD props** | **ADD props** | **FIX props** | Keep synced with CSV always |

#### Agent-Maintained: Reusable Code (code once, reuse everywhere)

| File | Planner | Generator | Healer | Notes |
|------|---------|-----------|--------|-------|
| `src/utils/common-methods.ts` | READ | **ADD / ADJUST** | **FIX** | ALL utilities here. Add new, adjust existing safely. Never delete. Never create new util files. |
| `src/utils/app-constants.ts` | READ | **ADD** | **FIX** | Constants. Add new, fix incorrect. Never delete. |
| `src/utils/file-utils.ts` | READ | **ADD** | **FIX** | File ops. Add new, fix broken. Never delete. |
| `src/utils/index.ts` | READ | **UPDATE** | READ | Barrel exports. Generator updates when adding. |
| `src/common/base-page.ts` | READ | **ADD helpers** | **FIX** | Base POM patterns. Generator adds, Healer fixes. |
| `src/common/ui-common.ts` | READ | **ADD methods** | **FIX** | Shared workflows (login, nav). |
| `tests/custom-matchers.ts` | READ | **ADD matchers** | **FIX** | Domain assertions via expect.extend(). |
| `tests/fixtures.ts` | READ | **ADD fixtures** | **FIX** | Test fixtures. Generator adds, Healer fixes wiring. |
| `src/framework-contracts/index.d.ts` | READ | **ADD types** | **FIX** | Type declarations for matchers, interfaces. |

#### Agent-Maintained: Documentation & Queue

| File | Planner | Generator | Healer | Notes |
|------|---------|-----------|--------|-------|
| `specs_planning/agent-queue.json` | **READ-WRITE** | **READ-WRITE** | **READ-WRITE** | All agents lock/unlock/update |
| `specs_planning/test-cases/*.md` | **CREATE+UPDATE** | **UPDATE status** | **UPDATE results** | Planner creates, others update metadata |
| `specs_planning/test-plans/*.md` | **CREATE** | READ | READ | Planner creates technical plans |

#### Human-Controlled (agents READ-ONLY or NEVER)

| File | Agents | Why |
|------|--------|-----|
| `REQUIREMENTS.md` | **Playwright agents: READ-ONLY. Copilot agents: UPDATE on user request (show changes first)** | Website knowledge base |
| `tests/global-setup.ts` | READ-ONLY | Global hooks — report issues to user |
| `tests/global-teardown.ts` | READ-ONLY | Global hooks — report issues to user |
| `tests/seed.spec.ts` | READ-ONLY | Context seed for agents |
| `src/utils/logger.ts` | READ-ONLY | Logging infrastructure — use Log.*, don't reconfigure |
| `src/data/adapters/*` | READ-ONLY | Data layer — user configures data sources |
| `src/integrations/*` | READ-ONLY | SharePoint etc — user configures integrations |
| `specs_planning/TEMPLATE.md` | READ-ONLY | Templates are user-owned |
| `specs_planning/agent-queue.schema.json` | READ-ONLY | Schema — user defines queue structure |
| `.env*` | **NEVER** | Credentials and secrets |
| `.ci/*`, `.github/workflows/*` | **NEVER** | CI/CD infrastructure |
| `.github/agents/*.agent.md` | **NEVER** | Agent instructions — agents never rewrite own rules |
| `.github/copilot-instructions.md` | **NEVER** | Master instructions — user-owned |
| `playwright.config.ts` | **NEVER** | Test execution config |
| `tsconfig.json`, `package.json` | **NEVER** | Framework config and dependencies |
| `docs/*`, `README.md` | **NEVER** | Documentation |
| `export_test_cases/*` | **NEVER** | Export tooling |
| `scripts/*` | **NEVER** | Build/deploy scripts |

### 1.5 Never Break These Patterns

- **NO direct Playwright `page` methods in tests** → Use page object methods
- **NO hardcoded element selectors** → Use dual object repository (CSV + TS)
- **NO hardcoded environment URLs/credentials** → Use `.env.{environment}` files
- **NO spreading `devices` in playwright.config.ts** → Causes `deviceScaleFactor` conflict
- **ALL page objects MUST extend BasePage**
- **ALL new website features described in REQUIREMENTS.md** (by team, not agents)

---

## 2. Architecture & File Structure

```
hybrid_framework/
├── .github/
│   ├── agents/                        # Playwright Test Agents (autonomous)
│   │   ├── playwright-test-planner.agent.md
│   │   ├── playwright-test-generator.agent.md
│   │   └── playwright-test-healer.agent.md
│   └── copilot-instructions.md        # This file
├── .ci/
│   ├── Jenkinsfile.ubuntu             # Linux CI pipeline + SharePoint upload
│   └── Jenkinsfile.windows            # Windows CI pipeline + SharePoint upload
├── object_repository/                 # CSV locator files (dual repo - CSV side)
│   ├── Login_Elements.csv
│   ├── Home_Elements.csv
│   ├── Landing_Elements.csv
│   └── Working_Elements.csv
├── specs_planning/                    # Agent work coordination
│   ├── agent-queue.json               # Shared work queue (all agents R/W)
│   ├── agent-queue.schema.json        # Queue validation schema
│   ├── test-cases/                    # Jira-exportable test cases
│   │   ├── TEMPLATE.md
│   │   └── {feature}-test-cases.md
│   └── test-plans/                    # Technical automation plans
│       └── {feature}-plan.md
├── src/
│   ├── selectors/                     # TypeScript selectors (dual repo - TS side)
│   │   └── index.ts                   # All selectors as const objects + getTsSelector()
│   ├── pages/                         # Page Object Model classes (all extend BasePage)
│   │   ├── login.page.ts
│   │   ├── home.page.ts
│   │   ├── landing.page.ts
│   │   ├── working-screen.page.ts
│   │   ├── working-screen-audit.page.ts
│   │   └── index.ts
│   ├── common/
│   │   ├── base-page.ts               # Parent POM class (getLocator uses dual repo)
│   │   ├── credential-loader.ts
│   │   └── ui-common.ts
│   ├── integrations/
│   │   └── sharepoint-client.ts       # SharePoint upload via Microsoft Graph
│   ├── data/adapters/                 # Data-driven testing adapters
│   ├── utils/                         # 5 files only (consolidated)
│   │   ├── common-methods.ts          # ALL utilities: CSV, scroll, timing, validation
│   │   ├── app-constants.ts           # Constants and CSV filenames
│   │   ├── file-utils.ts              # File/download/Excel operations
│   │   ├── logger.ts                  # Winston logging
│   │   └── index.ts                   # Barrel exports
│   └── framework-contracts/
│       └── index.d.ts                 # Types + custom matcher declarations
├── tests/
│   ├── seed.spec.ts                   # EspoCRM context for agents
│   ├── fixtures.ts                    # Fixtures + custom matchers import
│   ├── custom-matchers.ts             # expect.extend() — toBeLoggedIn, toBeOnModule, etc.
│   ├── specs/                         # ONLY .spec.ts files
│   │   ├── auth/
│   │   └── dashboard/
│   ├── global-setup.ts
│   └── global-teardown.ts
├── scripts/
│   └── upload-to-sharepoint.ts        # Jenkins → SharePoint upload CLI
├── REQUIREMENTS.md                    # Website knowledge base (READ-ONLY for agents)
└── package.json
```

**File location rules**:
- Test documentation (.md): ONLY in `specs_planning/test-cases/`
- Technical plans (.md): ONLY in `specs_planning/test-plans/`
- Executable tests (.spec.ts): ONLY in `tests/specs/`
- NEVER: `.md` files in `tests/specs/`
- NEVER: `.spec.ts` files in `specs_planning/`

---

## 3. Key Patterns & Conventions

### 3.1 Dual Object Repository (CSV + TypeScript)

**TypeScript side** (`src/selectors/index.ts`):
```typescript
export const LoginSelectors = {
  txtUsername: '#field-userName',
  btnLogin: '#btn-login',
} as const;

export function getTsSelector(elementName: string): string | null {
  return ALL_SELECTORS[elementName] ?? null;
}
```

**CSV side** (`object_repository/Login_Elements.csv`):
```csv
Element Name,Locator
txtUsername,#field-userName
btnLogin,#btn-login
```

**Unified lookup** (`CommonMethods.getSelector()`):
```typescript
// TypeScript first (fast, no I/O), CSV fallback
static getSelector(elementName: string, csvFile?: string): string | null
```

**BasePage uses dual repo automatically**:
```typescript
protected getLocator(elementName: string, csvFile: string): string {
  return CommonMethods.getSelector(elementName, csvFile);
}
```

**When adding new selectors**: Add to BOTH `src/selectors/index.ts` AND the CSV file.

### 3.2 Page Object Model

```typescript
// CORRECT: All page objects extend BasePage
export class LoginPage extends BasePage {
  constructor(page: Page, config?: IConfig) {
    super(page, config);
  }

  async loginWithMfa(username: string, password: string): Promise<boolean> {
    // Uses CSV locators via CommonMethods or BasePage helpers
    const btn = CommonMethods.getValuesFromCsv('btnLogin', AppConstants.LOGIN_ELEMENTS);
    await this.page.click(btn!);
    return true;
  }
}
```

### 3.3 Test Structure (2-10 lines)

```typescript
import { test, expect } from '../../fixtures';
import { Log } from '../../../src/utils/logger';

test.describe('Login Tests', () => {
  test.beforeEach(async ({ page, config }) => {
    await page.goto(config.base_url);
  });

  test('should verify forgot password link', async ({ loginPage }) => {
    Log.info('TEST: Verify forgot password link');
    const linkExists = await loginPage.isForgotPwdLinkExist();
    expect(linkExists).toBe(true);
    Log.info('✅ Forgot password link verified');
  });
});
```

### 3.4 Custom Assertions

```typescript
// Available via tests/custom-matchers.ts (auto-loaded by fixtures.ts)
await expect(page).toBeLoggedIn();
await expect(page).toHaveNotification('Success');
await expect(page).toBeOnModule('Contact');
expect(downloadsDir).toHaveFileDownloaded('report.xlsx');
```

### 3.5 SharePoint Integration

```typescript
// src/integrations/sharepoint-client.ts
const client = new SharePointClient(); // Config from .env
await client.authenticate();
await client.uploadFile('downloads/report.xlsx');
await client.uploadDirectory('downloads/');
```

Jenkins uploads via: `npx ts-node scripts/upload-to-sharepoint.ts --dir=downloads`

### 3.6 Available Fixtures

```typescript
test('example', async ({
  loginPage,           // LoginPage instance
  homePage,            // HomePage instance
  landingPage,         // LandingPage instance
  workingScreenPage,   // WorkingScreenPage instance
  workingScreenPageAudit, // Audit page instance
  commonMethods,       // CommonMethods utilities
  config,              // IConfig environment variables
  page                 // Direct Playwright Page (use only when fixture unavailable)
}) => {
  // Test implementation
});
```

---

## 4. Playwright Test Agents — Autonomous Workflow

### 4.1 Agent Invocation

**Agent Picker in VS Code Copilot Chat**:
1. Open Copilot Chat (Ctrl+Alt+I)
2. Click @ → Select agent
3. Type request (or just invoke for auto-discovery)

**Auto-discover commands** (no file paths needed):
- `@playwright-test-planner` → Reads queue, processes all pending_planning
- `@playwright-test-generator` → Reads queue, processes all pending_generation
- `@playwright-test-healer` → Runs all tests, heals failures

### 4.2 Three-Stage Pipeline

```
Planner (explore → plan → queue)
    ↓ pending_generation
Generator (plan → code → test → queue)
    ↓ completed / pending_healing
Healer (debug → fix → retest → queue)
    ↓ completed / fixme
```

### 4.3 Agent Self-Updating Rules

**Planner**: Creates/updates `specs_planning/test-cases/*.md` and `specs_planning/test-plans/*.md`
**Generator**: Updates test case status from ⚠️ Manual → ✅ Automated, creates `.spec.ts` files
**Healer**: Updates test results, timestamps, known issues in test case files

**All agents**: Update `specs_planning/agent-queue.json` with stage transitions and history

---

## 5. Consolidated Utilities Reference

### src/utils/common-methods.ts (single utility class)

**CSV/Selectors**: `getValuesFromCsv()`, `getSelector()`, `updateLocator()`, `clearLocatorCache()`
**Config**: `initProp()`
**MFA**: `generateTotpCode()`
**Screenshot**: `takeScreenshot()`
**Validation (page)**: `validateText()`, `validatePopup()`, `validateListOptions()`, `validateFields()`
**Validation (data)**: `validateEmail()`, `validatePhone()`, `validateDate()`, `validateUrl()`, `matchesPattern()`
**Text**: `compareTexts()`, `extractNumbers()`, `normalizeDate()`, `formatDate()`
**Scroll**: `scrollIntoView()`, `scrollToTop()`, `scrollToBottom()`, `scrollBy()`, `scrollUntil()`, `getScrollPosition()`
**Timing**: `retryWithBackoff()`, `waitForCondition()`, `sleep()`, `executeWithTimeout()`, `poll()`

### src/utils/file-utils.ts

**File ops**: `downloadFile()`, `validateExcelFile()`, `readExcelAsJson()`, `deleteFileIfExists()`, `waitForFile()`, `fileExists()`, `getFileExtension()`

---

## 6. Environment Configuration

```bash
npm test                    # All tests
npm run test:chrome         # Chrome only
npm run test:headed         # With browser visible
npm run test:debug          # Debug mode
npm run typecheck           # TypeScript validation
npm run upload:sharepoint   # Upload downloads to SharePoint
```

Environment switching: `CI_ENV=staging npm test`

---

## 7. Common Pitfalls

| Problem | Cause | Solution |
|---------|-------|----------|
| `deviceScaleFactor` error | Spreading `devices['Desktop Chrome']` | Remove device spread, keep only `viewport: null` |
| Element not found | Missing from CSV AND TS selectors | Add to both `src/selectors/index.ts` AND CSV file |
| Env vars not loading | Wrong `.env.{environment}` file | Check `CI_ENV` matches filename |
| Agents not in Copilot | MCP not configured | See `docs/PLAYWRIGHT_AGENTS_SETUP.md` |

---

## 8. Documentation Hierarchy

1. **REQUIREMENTS.md** → Website knowledge base (READ-ONLY for agents)
2. **This file** → How to work in this codebase
3. **specs_planning/agent-queue.json** → Work queue (agents read/write)
4. **specs_planning/test-cases/** → Test documentation (agents maintain)
5. **docs/** → Architecture, commenting standards, setup guides
6. **File headers** → PURPOSE, WHY NECESSARY, HOW IT WORKS, USED BY

---

**Last Updated**: 2026-02-10
