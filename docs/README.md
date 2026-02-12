# Playwright TypeScript Automation Framework

A modern TypeScript async Playwright automation framework for maintainable, reliable, and scalable web application testing.

## 🚀 Features

- **TypeScript + Playwright** - Type-safe, fast, reliable browser automation
- **Page Object Model** - Clean, maintainable test architecture
- **CSV Locator Repository** - Centralized element management
- **Allure Reporting** - Beautiful, detailed test reports
- **Multi-browser Support** - Chrome, Chromium, Firefox, WebKit
- **Easy Configuration** - Environment variables + JSON config
- **Modular Structure** - Page objects, utilities, and fixtures
- **MFA/TOTP Support** - Automated time-based OTP generation
- **AI Self-Healing** - Optional OpenAI-powered locator correction
- **CI/CD Ready** - GitHub Actions / Jenkins compatible

## 🤖 Autonomous Agent System

This framework includes a **4+1 agent system** for autonomous test development:

### The Agents

1. **Copilot Intake Agent** (`@github-copilot`)
   - **Role**: Translate user requests into structured test cases
   - **Input**: Plain English test descriptions
   - **Output**: Test case markdown + queue entry (stage: `pending_planning`)
   - **Files created**: `specs_planning/test-cases/{feature}-test-cases.md`

2. **Planner Agent** (`@playwright-test-planner`)
   - **Role**: Explore app, identify selectors, create automation plan
   - **Input**: Queue entry with stage `pending_planning`
   - **Output**: Technical plan + CSV locators + TypeScript selectors
   - **Files created**: `specs_planning/test-plans/{feature}-plan.md`, `object_repository/{Module}_Elements.csv`

3. **Generator Agent** (`@playwright-test-generator`)
   - **Role**: Write spec files, page objects, run tests
   - **Input**: Queue entry with stage `pending_generation`
   - **Output**: `.spec.ts` files + page objects + passing tests
   - **Files created**: `tests/specs/{module}/{feature}.spec.ts`, `src/pages/{module}.page.ts`

4. **Healer Agent** (`@playwright-test-healer`)
   - **Role**: Fix failing tests, update selectors, resolve issues
   - **Input**: Queue entry with stage `healing`
   - **Output**: Fixed tests, updated selectors, root cause analysis

5. **QA Agent** (`@playwright-test-qa`)
   - **Role**: Audit pipeline compliance, verify selector sync, check mistake recurrence
   - **Input**: Completed queue entries
   - **Output**: QA report + updated mistakes registry

### Agent Workflow Pipeline

```
User Request
    ↓
[Copilot] → Test case doc + queue entry (pending_planning)
    ↓
[Planner] → Technical plan + selectors (pending_generation)
    ↓
[Generator] → Spec file + page objects + tests (testing/completed/healing)
    ↓
[Healer] → Fixed tests (if healing needed) (completed)
    ↓
[QA] → Audit report + mistakes registry update
```

### Invoking Agents

```bash
# Step 1: Describe your test to Copilot
@github-copilot "Create tests for user login with MFA validation"

# Step 2: Invoke Planner
@playwright-test-planner

# Step 3: Invoke Generator
@playwright-test-generator

# Step 4: If tests fail, invoke Healer
@playwright-test-healer

# Step 5: Audit the pipeline
@playwright-test-qa
```

### Agent Safety Features

- **Mistake Registry**: All agents read `specs_planning/agent-mistakes.md` before starting
- **Activity Logging**: All work logged to `specs_planning/agent-activity-log.md`
- **Queue Locking**: Prevents concurrent agent conflicts
- **File Ownership**: Agents only edit files they own (enforced)

See [.github/copilot-instructions.md](../.github/copilot-instructions.md) for full agent documentation.

## 📁 Project Structure

```
hybrid_framework/
├── .github/
│   ├── agents/                   # 🤖 4 autonomous test agents
│   │   ├── playwright-test-planner.agent.md
│   │   ├── playwright-test-generator.agent.md
│   │   ├── playwright-test-healer.agent.md
│   │   └── playwright-test-qa.agent.md
│   └── copilot-instructions.md   # Copilot intake agent rules
├── .ci/
│   ├── Jenkinsfile.windows       # Jenkins CI pipeline (Windows)
│   ├── Jenkinsfile.ubuntu        # Jenkins CI pipeline (Ubuntu)
│   └── README.md                 # Jenkins setup guide
├── docs/
│   ├── README.md                 # This file
│   ├── WORKFLOW_DIAGRAMS.md      # Visual workflow guides
│   ├── PLAYWRIGHT_AGENTS_SETUP.md
│   └── read_only_docs/           # Agent reference docs
│       ├── ARCHITECTURE.md
│       ├── AGENT_SHARED_RULES.md
│       ├── QA_AGENT_GUIDE.md
│       └── COMMENTING_STANDARDS.md
├── specs_planning/               # 📋 Test planning & agent coordination
│   ├── agent-queue.json          # Shared work queue for agents
│   ├── agent-mistakes.md         # Verified mistakes registry
│   ├── agent-activity-log.md     # Agent activity audit trail
│   ├── test-cases/               # User-facing test case docs
│   └── test-plans/               # Technical automation plans
├── src/
│   ├── common/                   # Framework base classes
│   │   └── base-page.ts
│   ├── pages/                    # Page Object Model classes
│   │   ├── login.page.ts
│   │   ├── landing.page.ts
│   │   ├── home.page.ts
│   │   ├── working-screen.page.ts
│   │   ├── working-screen-audit.page.ts
│   │   ├── documents.page.ts     # NEW: Document upload/download
│   │   └── index.ts
│   ├── selectors/                # TypeScript selector definitions
│   │   └── index.ts
│   ├── utils/                    # Utility modules
│   │   ├── logger.ts
│   │   ├── common-methods.ts
│   │   ├── app-constants.ts
│   │   ├── file-utils.ts
│   │   └── index.ts
│   ├── data/adapters/            # Data source adapters (Excel, JSON, DB, S3)
│   ├── integrations/             # External integrations (SharePoint)
│   │   └── sharepoint-client.ts
│   └── framework-contracts/      # TypeScript interfaces
│       └── index.d.ts
├── tests/
│   ├── fixtures.ts               # Custom fixtures (8 fixtures)
│   ├── custom-matchers.ts        # Custom assertions
│   ├── global-setup.ts           # Global setup hook
│   ├── global-teardown.ts        # Global teardown hook
│   ├── seed.spec.ts              # EspoCRM context for agents
│   ├── specs/                    # Test specifications
│   │   ├── espocrm/
│   │   └── examples/
│   └── test-data/                # Test data files
├── object_repository/            # CSV locator files
│   ├── Login_Elements.csv
│   ├── Home_Elements.csv
│   ├── Landing_Elements.csv
│   ├── Working_Elements.csv
│   ├── Documents_Elements.csv    # NEW
│   └── CSV_TEMPLATE.md
├── playwright.config.ts          # Playwright configuration
├── playwright.config.ci.ts       # CI-optimized config
├── REQUIREMENTS.md               # Website knowledge base
├── JENKINS_PIPELINE_ENHANCED.groovy
└── package.json
```

## ⚡ Quick Start

### 1. Prerequisites

- **Node.js** 18+ and npm 9+
- **TypeScript** 5+ (installed via npm)

### 2. Setup (First Time)

**Windows:**
```cmd
setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

This will:
- Install all npm dependencies
- Install Playwright browsers
- Create .env file from template

### 3. Configure

Edit `.env` file:
```env
BASE_URL=https://your-app-url.com
HOME_URL=https://your-app-url.com
USERNAME_AUTOMATION=test_user
PASSWORD_AUTOMATION=test_password
MFA_SECRET=YOUR_BASE32_ENCODED_SECRET
```

### 4. Run Tests

```bash
# Run all tests
npm test

# Run with headed browser
npm run test:headed

# Run specific browser
npm run test:chrome
npm run test:firefox
npm run test:webkit

# Debug mode
npm run test:debug

# UI mode (interactive)
npm run test:ui
```

### 5. View Reports

```bash
# View HTML report
npm run report

# Generate & view Allure report
npm run allure:generate
npm run allure:open
```

- **Logs**: `logs/test-execution.log`
- **HTML Report**: `reports/html-report/index.html`
- **Allure Report**: `reports/allure-report/index.html`
- **Screenshots**: `reports/screenshots/` (on failure)

## 📝 Writing New Tests

### Basic Test Structure

Create a new file in `tests/` directory (e.g., `tests/my-feature.spec.ts`):

```typescript
import { test, expect } from './fixtures';
import { Log } from '../utils/logger';

test.describe.serial('My Feature Tests', () => {
  test('should perform action', async ({ loginPage, config, page }) => {
    // Login
    const result = await loginPage.loginWithMfa(
      config.username_automation,
      config.password_automation,
      config
    );
    
    expect(result).toBe(true);
    expect(page.url()).toContain(config.home_url);
  });

  test('should verify something', async ({ homePage }) => {
    const verified = await homePage.verifyContent();
    expect(verified).toBe(true);
  });
});
```

### Key Points:

1. **Import fixtures**: `import { test, expect } from './fixtures'`
2. **Use test.describe.serial()** - For ordered execution
3. **Access fixtures via parameters** - `{ loginPage, config, page }`
4. **All page objects are auto-injected** - No manual instantiation needed
5. **Use async/await** - All page methods are asynchronous
6. **Add logging** - `Log.info('message')` for debugging

## 🎯 Available Fixtures

All fixtures are automatically available in your tests:

| Fixture | Type | Description |
|---------|------|-------------|
| `page` | Page | Playwright page instance |
| `config` | IConfig | Configuration object from .env files |
| `commonMethods` | CommonMethods | Utility methods instance |
| `loginPage` | LoginPage | Login page object |
| `landingPage` | LandingPage | Landing page object |
| `homePage` | HomePage | Home page object |
| `workingScreenPage` | WorkingScreenPage | Working screen page object |
| `workingScreenPageAudit` | WorkingScreenPageAudit | Audit page object |
| `documentsPage` | DocumentsPage | Document upload/download page object |

### Example Usage:

```typescript
test('example', async ({ loginPage, config, page, commonMethods }) => {
  // All fixtures ready to use!
  await loginPage.loginWithMfa(config.username_automation, config.password_automation, config);
  
  // Use common validation methods
  await commonMethods.validateText(page, 'element_key', 'expected_text', 'CSV_FILE');
});
```

### Fixture Scoping & Lifecycle

Fixtures in this framework use Playwright's built-in scoping system, similar to Python Pytest fixtures:

| Scope | TypeScript | Python Equivalent | When to Use |
|-------|-----------|-------------------|-------------|
| **Test** | `{ scope: 'test' }` (default) | `@pytest.fixture(scope='function')` | Fresh instance per test, full isolation |
| **Worker** | `{ scope: 'worker' }` | `@pytest.fixture(scope='session')` | Shared across tests in worker, immutable data |
| **Describe Block** | `test.describe.serial()` + variables | Class-based tests with class attributes | Multi-step workflows, session persistence |

**Fixture Lifecycle:**
1. **Before each test**: `CommonMethods.clearLocatorCache()` clears cached selectors
2. **Test runs**: Fixtures injected as function parameters
3. **After test**: Playwright auto-cleanup (browser context, page instances)

**Example: Worker-scoped config**
```typescript
// In fixtures.ts
config: [async ({}, use) => {
  const config = CommonMethods.initProp();  // Loads once per worker
  await use(config);
}, { scope: 'worker' }],
```

**Example: Class-based pattern (Python-style)**

See [tests/examples/class-based-pattern.spec.ts](../tests/examples/class-based-pattern.spec.ts) for full example.

**Locator Flow: CSV → page objects → fixtures → tests**

```
object_repository/Login_Elements.csv
  ↓ (loaded by)
src/pages/login.page.ts (uses CommonMethods.getSelector())
  ↓ (instantiated in)
tests/fixtures.ts (loginPage fixture)
  ↓ (injected into)
tests/specs/*.spec.ts (test receives ready-to-use loginPage)
```

## 🎯 Creating New Page Objects

### Step 1: Create the Page Class

Create `pages/my-page.page.ts`:

```typescript
import { Page } from '@playwright/test';
import { Log } from '../utils/logger';
import { CommonMethods } from '../utils/common-methods';
import { OpenAIUtils } from '../utils/openai-utils';
import { AppConstants } from '../utils/app-constants';

export class MyPage {
  private page: Page;
  private openaiUtils: OpenAIUtils;

  constructor(page: Page) {
    Log.info('MyPage constructor');
    this.page = page;
    this.openaiUtils = new OpenAIUtils();
  }

  async performAction(param: string): Promise<boolean> {
    try {
      const locator = CommonMethods.getValuesFromCsv(
        'element_name',
        AppConstants.MY_ELEMENTS_CSV
      );

      if (!locator) {
        Log.error('Locator not found');
        return false;
      }

      await this.page.click(locator);
      Log.info('Action completed');
      return true;
    } catch (error) {
      Log.error(`Error: ${error}`);
      return false;
    }
  }
}
```

### Step 2: Add to Barrel Export

Edit `pages/index.ts`:

```typescript
export { MyPage } from './my-page.page';
```

### Step 3: Add Fixture

Edit `tests/fixtures.ts`:

```typescript
import { MyPage } from '../pages/my-page.page';

type MyFixtures = {
  // ... existing fixtures
  myPage: MyPage;
};

export const test = base.extend<MyFixtures>({
  // ... existing fixtures
  myPage: async ({ page }, use) => {
    const myPage = new MyPage(page);
    await use(myPage);
  },
});
```

### Step 4: Use in Tests

```typescript
test('my test', async ({ myPage }) => {
  const result = await myPage.performAction('param');
  expect(result).toBe(true);
});
```

## 🔍 Validation Helpers

The framework provides built-in validation methods:

### Text Validation
```typescript
await CommonMethods.validateText(
  page,
  'lbl_Title',
  'Expected Title',
  AppConstants.LOGIN_ELEMENTS
);
```

### Popup Validation
```typescript
await CommonMethods.validatePopup(
  page,
  'Warning',
  'Warning Message',
  AppConstants.WORKING_ELEMENTS
);
```

### List Options Validation
```typescript
await CommonMethods.validateListOptions(
  page,
  'dropdown_id',
  ['Option 1', 'Option 2', 'Option 3'],
  AppConstants.HOME_ELEMENTS
);
```

### Multiple Fields Validation
```typescript
await CommonMethods.validateFields(page, {
  'lbl_Field1': 'Value 1',
  'lbl_Field2': 'Value 2',
  'lbl_Field3': 'Value 3'
}, AppConstants.WORKING_ELEMENTS);
```

## ⚙️ Configuration

### Environment Variables (.env)

```env
# URLs
BASE_URL=https://your-app.com
HOME_URL=https://your-app.com/home

# Credentials
USERNAME_AUTOMATION=user
PASSWORD_AUTOMATION=pass

# MFA
MFA_SECRET=YOUR_BASE32_SECRET

# OpenAI (optional)
OPENAI_API_KEY=sk-...
ENABLE_OPENAI_SELF_HEALING=false

# Browser
DEFAULT_BROWSER=chrome
HEADLESS=false
```

## 🗂️ Dual Object Repository

The framework uses **two sources** for element locators:

### 1. CSV Locators (`object_repository/`)

Store element locators in CSV files:

```csv
Element Name,Locator
txtUsername,input[formcontrolname='userName']
btnLogin,//button[@type='submit']
```

**Files:**
- `Login_Elements.csv` — Login page selectors
- `Home_Elements.csv` — Home page selectors
- `Landing_Elements.csv` — Landing page selectors
- `Working_Elements.csv` — Working screen selectors
- `Documents_Elements.csv` — Documents module selectors

### 2. TypeScript Selectors (`src/selectors/index.ts`)

Programmatically defined selectors with IntelliSense support:

```typescript
export const Selectors = {
  login: {
    usernameField: 'input[name="username"]',
    submitButton: 'button[type="submit"]'
  }
};
```

### Unified Lookup

Page objects use `CommonMethods.getSelector()` which checks:
1. **CSV first** (if key exists)
2. **TypeScript selectors second** (fallback)
3. Returns the first match found

**When to use CSV vs TypeScript:**
- **CSV**: Generated by agents, easy to update without code changes
- **TypeScript**: Complex dynamic selectors, conditional logic, type safety

## 🤖 AI Self-Healing (Optional Feature)

> **Note**: This feature is **OPTIONAL** and NOT required for framework operation. Tests work with CSV/TypeScript selectors alone.

Enable AI-powered locator correction:

1. Set in `.env`:
```env
OPENAI_API_KEY=sk-your-key-here
ENABLE_OPENAI_SELF_HEALING=true
```

2. The framework will automatically:
   - Try the CSV locator first
   - If it fails, use OpenAI to find a working locator
   - Update the CSV with the new locator

## 📊 Test Reporting

### Playwright HTML Report
```bash
npm test
npm run report
```

### Allure Report
```bash
npm test
npm run allure:generate
npm run allure:open
```

### Custom Reporters

Configured in `playwright.config.ts`:
- List reporter (console)
- HTML reporter
- JSON reporter
- JUnit XML reporter
- Allure reporter

## 🎨 Test Organization

### Test Markers (Tags)

```typescript
test('smoke test @smoke', async ({ loginPage }) => {
  // Smoke test logic
});

test('regression test @regression', async ({ homePage }) => {
  // Regression test logic
});
```

Run by tag:
```bash
npx playwright test --grep @smoke
npx playwright test --grep @regression
```

### Serial vs Parallel

**Serial execution** (tests run in order):
```typescript
test.describe.serial('Ordered Tests', () => {
  test('step 1', async () => { /* ... */ });
  test('step 2', async () => { /* ... */ });
});
```

**Parallel execution** (default):
```typescript
test.describe('Parallel Tests', () => {
  test('test A', async () => { /* ... */ });
  test('test B', async () => { /* ... */ });
});
```

## 🐛 Debugging

### View Logs
```bash
# PowerShell
Get-Content logs\test-execution.log -Wait

# Bash
tail -f logs/test-execution.log
```

### Debug Single Test
```bash
npx playwright test tests/example.spec.ts --debug
```

### UI Mode
```bash
npm run test:ui
```

### VS Code Debugger

1. Install "Playwright Test for VSCode" extension
2. Set breakpoints in your test
3. Click "Run Test" in the sidebar

## 🔄 CI/CD Integration with Jenkins

### Jenkins Pipeline

The framework uses Jenkins for CI/CD with two platform-specific pipelines:
- [.ci/Jenkinsfile.windows](../.ci/Jenkinsfile.windows) — Windows agents
- [.ci/Jenkinsfile.ubuntu](../.ci/Jenkinsfile.ubuntu) — Linux agents

### Jenkins Features

**Parameterized builds:**
- **Environment selection**: `development`, `staging`, `production`
- **Browser selection**: `chromium`, `chrome`, `firefox`, `webkit`
- **Test pattern (grep)**: Run specific tests
- **Debug toggles**: `ENABLE_VIDEO`, `ENABLE_TRACING`, `ENABLE_SCREENSHOTS`
- **Headed mode**: Run with visible browser (local debug)

**Artifacts:**
- **HTML Report** (viewable in browser)
- **JUnit XML** (for trend graphs)
- **Videos**: `test-results/{test-name}/video.webm`
- **Traces**: `test-results/{test-name}/trace.zip` (download → open at [trace.playwright.dev](https://trace.playwright.dev))
- **Screenshots**: `test-results/{test-name}/test-failed-1.png`

### Setup Instructions

1. **Install Jenkins plugins**:
   - HTML Publisher
   - JUnit

2. **Configure pipeline**:
   - **Option A**: Use [JENKINS_PIPELINE_ENHANCED.groovy](../JENKINS_PIPELINE_ENHANCED.groovy) (copy/paste to Pipeline script)
   - **Option B**: Use SCM-based pipeline pointing to `.ci/Jenkinsfile.windows`

3. **Set environment variables**:
   ```groovy
   PROJECT_SRC = "C:\\path\\to\\hybrid_framework"
   ```

4. **Run build** → Select parameters → Build

See [.ci/README.md](../.ci/README.md) for detailed setup guide.

## 📚 Best Practices

1. **Keep tests independent** - Each test should work standalone
2. **Use Page Objects** - Don't put locators in tests
3. **Add logging** - `Log.info()` for debugging
4. **Handle waits** - Use `page.waitForSelector()`, never hard sleeps
5. **Clean up** - Tests should restore state
6. **Use fixtures** - Reuse setup via fixtures
7. **Type everything** - Leverage TypeScript's type system
8. **Serial when needed** - Use `.serial()` for ordered flows

## 🆚 Python vs TypeScript Comparison

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| Test Runtime | @playwright/test |
| Language | TypeScript 5.3+ |
| Browser Automation | Playwright 1.58.2 |
| Fixtures | Custom fixtures.ts |
| CSV Parsing | csv-parse |
| MFA/TOTP | otplib |
| Logging | winston |
| Configuration | dotenv-flow + JSON |
| Reporting | Allure, HTML, JUnit |

## 🔧 Troubleshooting

**Import Errors:**
```bash
npm install
```

**Browser Not Found:**
```bash
npx playwright install
```

**Locator Not Found:**
- Check CSV file in `object_repository/`
- Enable AI self-healing
- Verify element name matches CSV exactly

**TypeScript Errors:**
```bash
npm run typecheck
```

## 📦 Dependencies

Main packages (see `package.json`):
- `@playwright/test` - Browser automation & testing
- `typescript` - TypeScript compiler
- `winston` - Logging
- `allure-playwright` - Test reporting
- `openai` - AI self-healing
- `otplib` - TOTP generation
- `csv-parse` - CSV locator loading
- `dotenv` - Environment configuration

## 📞 Support

- Check logs in `logs/` directory
- Review test reports in `reports/` directory
- See configuration in `.env.*` files
- Review requirements: `../REQUIREMENTS.md`

---

**Version:** 2.0.0  
**Node.js:** 18+  
**Playwright:** 1.58.2  
**TypeScript:** 5.3+
