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

## 📁 Project Structure

```
hybrid_framework/
├── pages/                  # Page Object Model classes
│   ├── login.page.ts
│   ├── landing.page.ts
│   ├── home.page.ts
│   ├── working-screen.page.ts
│   ├── working-screen-audit.page.ts
│   └── index.ts
├── utils/                  # Utility modules
│   ├── logger.ts          # Winston-based logging
│   ├── common-methods.ts  # Validation helpers, CSV loader
│   ├── openai-utils.ts    # AI self-healing locators
│   ├── app-constants.ts   # Application constants
│   └── index.ts           # Barrel exports
├── tests/                  # Test specifications
│   ├── fixtures.ts        # Custom fixtures
│   ├── global-setup.ts    # Global setup hook
│   ├── global-teardown.ts # Global teardown hook
│   └── example.spec.ts    # Example tests
├── configs/                # Configuration files
│   └── config.json        # Application config
├── object_repository/      # Element locators (CSV files)
│   └── Login_Elements.csv
├── types/                  # TypeScript type definitions
│   └── index.d.ts
├── logs/                   # Runtime logs
├── reports/                # Test reports
├── playwright.config.ts    # Playwright configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies & scripts
├── .env.example           # Environment variables template
└── README.md              # This file
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
| `config` | IConfig | Configuration object from .env & config.json |
| `commonMethods` | CommonMethods | Utility methods instance |
| `loginPage` | LoginPage | Login page object |
| `landingPage` | LandingPage | Landing page object |
| `homePage` | HomePage | Home page object |
| `workingScreenPage` | WorkingScreenPage | Working screen page object |
| `workingScreenPageAudit` | WorkingScreenPageAudit | Audit page object |

### Example Usage:

```typescript
test('example', async ({ loginPage, config, page, commonMethods }) => {
  // All fixtures ready to use!
  await loginPage.loginWithMfa(config.username_automation, config.password_automation, config);
  
  // Use common validation methods
  await commonMethods.validateText(page, 'element_key', 'expected_text', 'CSV_FILE');
});
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

### Config JSON (configs/config.json)

Supplements .env with additional config:

```json
{
  "browser": "chrome",
  "url": "https://your-app.com",
  "custom_property": "value"
}
```

### CSV Locators (object_repository/)

Store element locators in CSV files:

```csv
Element Name,Locator
txtUsername,input[formcontrolname='userName']
btnLogin,//button[@type='submit']
```

## 🤖 AI Self-Healing

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

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
name: Playwright Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: reports/
```

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
- See configuration in `.env` and `configs/config.json`
- Review requirements: `../REQUIREMENTS.md`

---

**Version:** 2.0.0  
**Node.js:** 18+  
**Playwright:** 1.58.2  
**TypeScript:** 5.3+
