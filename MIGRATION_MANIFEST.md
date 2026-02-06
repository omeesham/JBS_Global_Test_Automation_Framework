# PYTHON TO TYPESCRIPT MIGRATION - COMPLETE FEATURE MANIFEST
**Framework:** Playwright Test Automation  
**Source:** Python + Playwright  
**Target:** TypeScript + Playwright  
**Date:** February 6, 2026

---

## 📋 EXECUTIVE SUMMARY

### Codebase Statistics
- **Total Python Files:** 10 Python source files
- **Total Configuration Files:** 4 (pytest.ini, config.properties, requirements.txt, 2 setup scripts)
- **Total Page Objects:** 5 (LoginPage, LandingPage, HomePage, WorkingScreenPage, WorkingScreenPageAudit)
- **Total Utility Classes:** 6 (PlaywrightFactory, Logger, CommonMethods, AllureHelper, OpenAIUtils, AppConstants)
- **Total CSV Locator Files:** 1 (Login_Elements.csv)
- **Total Lines of Code:** ~1500+ lines

### Migration Complexity Assessment
- **Framework Patterns:** Page Object Model, Factory Pattern, Fixture Pattern
- **Async/Await:** Heavy async usage throughout
- **Custom Decorators:** @step decorator for test ordering
- **External Dependencies:** 15+ packages
- **Design Patterns:** Singleton, Factory, Helper/Utility pattern

---

## 🗂️ DIRECTORY STRUCTURE INVENTORY

### Complete Directory Tree (TO BE REPLICATED IN TYPESCRIPT)

```
hybrid_framework/
├── .git/                           # Git repository (preserve)
├── .gitignore                      # Git ignore rules
├── artifacts/                      # New directory for big change prep
├── tasks/                          # New directory for big change prep
│   └── .locks/
├── tools/                          # New directory for big change prep
├── AGENT_MISTAKES.md               # New tracking file
├── REQUIREMENTS_TRACKER.json       # New tracking file
├── pytest.ini                      # CONVERT → playwright.config.ts + jest.config.js (if needed)
├── README.md                       # UPDATE for TypeScript
├── requirements.txt                # CONVERT → package.json
├── setup.bat                       # UPDATE for npm/pnpm setup
├── setup.sh                        # UPDATE for npm/pnpm setup
├── configs/
│   ├── config.properties          # CONVERT → config.json or .env + config.ts
│   └── test_data/                 # Preserve structure (historical data)
│       └── .gitkeep
├── hybrid_typescript_converted/    # OUTPUT DIRECTORY (existing)
├── logs/                          # Runtime logs directory
│   └── .gitkeep
├── object_repository/              # CSV locator files
│   ├── .gitkeep
│   └── Login_Elements.csv         # PRESERVE CSV FORMAT or convert to JSON
├── pages/                          # Page Object Model classes
│   ├── __init__.py                # NOT NEEDED in TypeScript
│   ├── login_page.py              # → login.page.ts
│   ├── landing_page.py            # → landing.page.ts
│   ├── home_page.py               # → home.page.ts
│   ├── working_screen_page.py     # → working-screen.page.ts
│   └── working_screen_page_audit.py # → working-screen-audit.page.ts
├── reports/                        # Test reports output
│   └── .gitkeep
├── tests/                          # Test suite
│   ├── __init__.py                # NOT NEEDED in TypeScript
│   └── conftest.py                # → global test fixtures/setup
└── utils/                          # Utility modules
    ├── __init__.py                # NOT NEEDED in TypeScript
    ├── playwright_factory.py      # → playwright-factory.ts
    ├── logger.py                  # → logger.ts
    ├── common_methods.py          # → common-methods.ts
    ├── openai_utils.py            # → openai-utils.ts
    ├── app_constants.py           # → app-constants.ts
    └── local_imports.py           # → index.ts (barrel exports)
```

---

## 📦 DEPENDENCY MAPPING

### Python Dependencies → TypeScript/Node Equivalents

| Python Package | Version | TypeScript Equivalent | Notes |
|---------------|---------|----------------------|-------|
| playwright | 1.40.0 | @playwright/test | Use Playwright's native TypeScript runner |
| pytest | 7.4.3 | @playwright/test OR jest | Playwright Test recommended |
| pytest-playwright | 0.4.3 | N/A | Built into @playwright/test |
| pytest-asyncio | 0.21.1 | N/A | Native async/await in TS |
| pytest-html | 4.1.1 | playwright-html-reporter | HTML reporting |
| pytest-ordering | 0.6 | Custom implementation | Test.describe.serial() for ordering |
| allure-pytest | 2.13.2 | allure-playwright | Allure reporting |
| openai | 1.3.7 | openai (npm) | OpenAI SDK for Node.js |
| jproperties | 2.1.1 | properties-reader OR dotenv | Config file parsing |
| python-dotenv | 1.0.0 | dotenv (npm) | Environment variables |
| Pillow | 10.1.0 | sharp (npm) | Image manipulation |
| pyotp | 2.9.0 | otplib (npm) | TOTP/MFA code generation |

**Package.json Dependencies:**
```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "allure-playwright": "^2.10.0",
    "playwright-html-reporter": "^1.2.0"
  },
  "dependencies": {
    "dotenv": "^16.0.0",
    "openai": "^4.20.0",
    "otplib": "^12.0.1",
    "csv-parse": "^5.5.0",
    "winston": "^3.11.0"
  }
}
```

---

## 🔧 UTILITY CLASSES - DETAILED INVENTORY

### 1. PlaywrightFactory (utils/playwright_factory.py)

**Purpose:** Browser lifecycle management, singleton pattern for Playwright instances

**Key Features:**
- ✅ Context variables for async support (ContextVar pattern)
- ✅ Singleton browser instance management
- ✅ Multi-browser support (Chrome, Chromium, Firefox, Safari/WebKit)
- ✅ Browser launch options (headless, channel, args)
- ✅ Browser context creation with no viewport
- ✅ Automatic page navigation to config URL
- ✅ Screenshot capability
- ✅ Proper cleanup (close browser, page, context)
- ✅ Property initialization from config file

**Methods:**
1. `__init__()` - Initialize factory
2. `get_playwright()` - Get Playwright instance (class method)
3. `get_browser()` - Get Browser instance (class method)
4. `get_browser_context()` - Get BrowserContext instance (class method)
5. `get_page()` - Get Page instance (class method)
6. `init_browser(props, browser_name)` - Initialize browser with config
7. `init_prop()` - Load properties from config file
8. `take_screenshot()` - Capture full page screenshot (class method)
9. `close_browser()` - Cleanup all browser resources (class method)

**TypeScript Considerations:**
- Replace ContextVar with class static properties
- Use Playwright Test's built-in fixtures instead of manual management
- Implement proper TypeScript interfaces for config types

---

### 2. Logger (utils/logger.py)

**Purpose:** Centralized logging utility with file and console output

**Key Features:**
- ✅ Singleton logger instance
- ✅ Log levels: INFO, ERROR, WARN, DEBUG
- ✅ Console handler with formatting
- ✅ File handler (logs/test_execution.log)
- ✅ Automatic logs directory creation
- ✅ Thread-safe logging
- ✅ Custom timestamp format (YYYY-MM-DD HH:MM:SS)
- ✅ UTF-8 encoding support

**Methods:**
1. `_get_logger()` - Get or create logger instance (private, class method)
2. `info(message)` - Log info message (class method)
3. `error(message)` - Log error message (class method)
4. `warn(message)` - Log warning message (class method)
5. `debug(message)` - Log debug message (class method)

**TypeScript Considerations:**
- Use Winston or Pino for structured logging
- Maintain same log format and file structure
- Consider adding log rotation

---

### 3. CommonMethods (utils/common_methods.py)

**Purpose:** Shared utility methods for framework operations

**Key Features:**
- ✅ CSV locator loading and caching
- ✅ Locator file management (read, write, update)
- ✅ Properties file loading (jproperties)
- ✅ TOTP code generation (pyotp)
- ✅ Screenshot capture
- ✅ Text validation helpers
- ✅ Popup/dialog validation
- ✅ List/dropdown options validation
- ✅ Multi-field validation
- ✅ Search list validation
- ✅ Date normalization (multiple formats)
- ✅ Class-level state management (static variables)

**Properties:**
- `_page` - Current page instance (class variable)
- `_props` - Configuration properties (class variable)
- `_locators` - Cached locator dictionary (class variable)
- `_loaded_files` - Set of loaded CSV files (class variable)

**Methods:**
1. `__init__(page)` - Initialize with page instance
2. `take_screenshot()` - Capture screenshot to reports/ (static)
3. `init_prop()` - Load config.properties file (static)
4. `get_values_from_csv(element_name, file_name)` - Retrieve locator from CSV (static)
5. `update_locator(element_name, locator, file_name)` - Update locator in CSV (static)
6. `_save_locators(locators, file_name)` - Save locators to CSV (static, private)
7. `_load_csv(file_name)` - Load CSV file (static, private)
8. `generate_totp_code(secret)` - Generate TOTP code (static)
9. `validate_text(page, csv_key, expected, csv_file, timeout)` - Validate element text (static, async)
10. `validate_popup(page, expected_title, expected_message, csv_file, timeout)` - Validate popup (static, async)
11. `validate_list_options(page, csv_key, expected_options, csv_file, timeout)` - Validate list (static, async)
12. `validate_fields(page, fields, csv_file, timeout)` - Validate multiple fields (static, async)
13. `validate_search_list(page, csv_file, timeout)` - Validate search list (static, async)
14. `normalize_date(date_str)` - Normalize date format (static)

**TypeScript Considerations:**
- Use csv-parse/csv-stringify for CSV handling
- Implement proper typing for all methods
- Use otplib for TOTP generation
- Consider converting CSV to JSON for better TypeScript support

---

### 4. AllureHelper (utils/common_methods.py)

**Purpose:** Allure reporting integration

**Key Features:**
- ✅ Attach text to Allure reports
- ✅ Before/after test attachments
- ✅ Graceful degradation (no-op if Allure not installed)

**Methods:**
1. `before(message, name)` - Attach info before test (static)
2. `after(message)` - Attach info after test (static)

**TypeScript Considerations:**
- Use allure-playwright package
- Map Python allure.attach to TypeScript equivalent

---

### 5. OpenAIUtils (utils/openai_utils.py)

**Purpose:** AI-powered self-healing locators (stub implementation currently)

**Key Features:**
- ✅ OpenAI API integration
- ✅ Enabled/disabled via AppConstants
- ✅ Locator verification and fallback
- ✅ CSV locator update capability

**Methods:**
1. `__init__()` - Initialize with API key and enabled flag
2. `verify_and_get_locators_using_ai(page, element_name, csv_file)` - Get/verify locator (async)

**TypeScript Considerations:**
- Use openai npm package
- Implement proper async/await patterns
- Add error handling for API calls

---

### 6. AppConstants (utils/app_constants.py)

**Purpose:** Application-wide constants and configuration

**Key Features:**
- ✅ API keys
- ✅ Feature flags (ENABLE_OPENAI_SELF_HEALING)
- ✅ CSV filename constants

**Constants:**
1. `API_KEY` - OpenAI API key
2. `ENABLE_OPENAI_SELF_HEALING` - Feature toggle (boolean)
3. `LOGIN_ELEMENTS` - Login CSV filename
4. `SEARCH_LIST` - (Referenced but not defined - may be in full version)
5. `LANDING_ELEMENTS` - (Referenced but not defined)
6. `WORKING_ELEMENTS` - (Referenced but not defined)

**TypeScript Considerations:**
- Create TypeScript enum or const object
- Use environment variables for sensitive data (.env)
- Type-safe constant definitions

---

### 7. LocalImports (utils/local_imports.py)

**Purpose:** Centralized import aggregation ("barrel" pattern)

**Key Features:**
- ✅ Single import for all framework dependencies
- ✅ Custom @step decorator
- ✅ Re-exports of common types
- ✅ Framework utilities aggregation

**Exports:**
- pytest, asyncio, re
- Type hints (List, Dict, Optional, Any, Tuple)
- Playwright types (Page, TimeoutError)
- Framework classes (Log, CommonMethods, allure, OpenAIUtils, AppConstants)
- Custom decorator: @step(order)

**@step Decorator:**
- Combines @pytest.mark.order(n) and @pytest.mark.asyncio
- Simplifies test ordering

**TypeScript Considerations:**
- Create index.ts barrel file
- Export all types and classes
- Replace custom decorator with TypeScript decorators or helper functions

---

## 📄 PAGE OBJECT MODEL - DETAILED INVENTORY

### 1. LoginPage (pages/login_page.py)

**Purpose:** Login page interactions and MFA handling

**Properties:**
- `page` - Playwright Page instance
- `openai_utils` - OpenAIUtils instance

**Methods:**
1. `__init__(page)` - Initialize with page
2. `is_forgot_pwd_link_exist()` - Check if forgot password link visible (async)
3. `is_login_using_azure_ad_link_exist()` - Check if Azure AD link visible (async)
4. `login_with_mfa(username, password, config)` - Login with MFA support (async)
   - ✅ Fills username/password from CSV locators
   - ✅ Clicks login button
   - ✅ Detects MFA page automatically
   - ✅ Generates TOTP code from config secret
   - ✅ Submits MFA code
   - ✅ Verifies successful login via URL check
   - ✅ Allure reporting integration
   - ✅ Error handling and logging
5. `logout()` - Logout from application (async)
   - ✅ Handles "Later" button if visible
   - ✅ Clicks profile icon
   - ✅ Clicks logout link
   - ✅ Verifies return to login page
   - ✅ Allure reporting integration

**CSV Locators Used:**
- txtUsername, txtPassword, btnLogin
- txtMfaCode, btnMfaSubmit
- lnkForgotPassword, lnkAzureAd

**TypeScript Considerations:**
- Create LoginPage class
- Proper typing for all parameters
- Async/await pattern
- Interface for config object

---

### 2. LandingPage (pages/landing_page.py)

**Purpose:** Landing page after login (stub implementation)

**Properties:**
- `page` - Playwright Page instance
- `openai_utils` - OpenAIUtils instance

**Methods:**
1. `__init__(page)` - Initialize with page
2. `perform_action()` - Placeholder action (async)

**TypeScript Considerations:**
- Implement actual landing page functionality
- Add proper methods based on application requirements

---

### 3. HomePage (pages/home_page.py)

**Purpose:** Home page interactions (stub implementation)

**Properties:**
- `page` - Playwright Page instance
- `openai_utils` - OpenAIUtils instance

**Methods:**
1. `__init__(page)` - Initialize with page
2. `verify_content()` - Placeholder verification (async)

**TypeScript Considerations:**
- Implement actual home page functionality
- Add verification methods

---

### 4. WorkingScreenPage (pages/working_screen_page.py)

**Purpose:** Working screen interactions (stub implementation)

**Properties:**
- `page` - Playwright Page instance
- `openai_utils` - OpenAIUtils instance

**Methods:**
1. `__init__(page)` - Initialize with page
2. `perform_work()` - Placeholder work method (async)

**TypeScript Considerations:**
- Implement actual working screen functionality

---

### 5. WorkingScreenPageAudit (pages/working_screen_page_audit.py)

**Purpose:** Audit-specific working screen (stub implementation)

**Properties:**
- `page` - Playwright Page instance
- `openai_utils` - OpenAIUtils instance

**Methods:**
1. `__init__(page)` - Initialize with page
2. `perform_audit()` - Placeholder audit method (async)

**TypeScript Considerations:**
- Implement actual audit screen functionality
- Maintain separation from regular working screen

---

## 🧪 TEST INFRASTRUCTURE - DETAILED INVENTORY

### conftest.py (tests/conftest.py)

**Purpose:** Pytest configuration, fixtures, hooks

**Key Features:**
- ✅ Class-scoped browser setup
- ✅ Automatic page object injection via fixtures
- ✅ Browser parameter from command line (--browser)
- ✅ Property file loading
- ✅ Screenshot on test failure
- ✅ Allure integration
- ✅ Test ordering support
- ✅ Locator cache clearing between test classes

**Fixtures:**
1. `browser_setup(request)` - Main browser setup fixture (class-scoped, async)
2. `page(browser_setup)` - Page instance fixture (class-scoped, async)
3. `config(browser_setup)` - Configuration dictionary fixture (class-scoped, async)
4. `common_methods(page)` - CommonMethods instance fixture (class-scoped, async)
5. `login_page(page)` - LoginPage instance fixture (class-scoped, async)
6. `landing_page(page)` -LandingPage instance fixture (class-scoped, async)
7. `home_page(page)` - HomePage instance fixture (class-scoped, async)
8. `working_screen_page(page)` - WorkingScreenPage instance fixture (class-scoped, async)
9. `working_screen_page_audit(page)` - WorkingScreenPageAudit instance fixture (class-scoped, async)
10. `setup_pages(...)` - Auto-inject all fixtures into test class (class-scoped, autouse, async)

**Hooks:**
1. `pytest_runtest_makereport(item, call)` - Screenshot on failure hook
2. `pytest_configure(config)` - Register custom markers

**TypeScript Considerations:**
- Use Playwright Test's built-in fixtures
- Create custom fixtures file
- Implement beforeEach/afterEach hooks
- Create global setup/teardown
- Screenshot on failure via Playwright Test config

---

## ⚙️ CONFIGURATION FILES - DETAILED INVENTORY

### 1. pytest.ini

**Purpose:** Pytest configuration

**Configuration:**
- Test discovery patterns (test_*.py, Test*, test_*)
- Markers (order, smoke, regression, audit, prospective)
- Asyncio mode (auto)
- Output options (verbose, short traceback)
- HTML report generation
- Allure results directory
- Test paths (tests/)
- Logging configuration (CLI and file)

**TypeScript Equivalent:**
- playwright.config.ts (primary)
- Optional: jest.config.js if using Jest

---

### 2. config.properties

**Purpose:** Application configuration

**Properties:**
- browser (default browser to use)
- url (application URL)
- home_url (home page URL)
- username_automation (test username)
- password_automation (test password)
- mfa_secret (for TOTP - referenced but not in default file)

**TypeScript Equivalent:**
- .env file for sensitive data
- config.ts for typed configuration
- config.json for structured data

---

### 3. requirements.txt

**Purpose:** Python dependencies

**TypeScript Equivalent:**
- package.json (dependencies + devDependencies)

---

### 4. setup.bat / setup.sh

**Purpose:** Environment setup scripts

**Actions:**
- Check Python installation
- Create virtual environment
- Install dependencies
- Install Playwright browsers

**TypeScript Equivalent:**
- npm install or pnpm install
- npx playwright install
- Update scripts to use Node.js/npm

---

### 5. README.md

**Purpose:** Framework documentation

**Sections:**
- Features overview
- Project structure
- Quick start guide
- Running tests
- Writing new tests
- Fixtures explanation
- Creating page objects
- Validation helpers
- Configuration
- CI/CD integration
- Best practices

**Actions Required:**
- UPDATE for TypeScript syntax
- UPDATE commands (pytest → npx playwright test)
- UPDATE file paths and extensions
- PRESERVE all documentation structure

---

## 📊 CSV LOCATOR REPOSITORY

### Login_Elements.csv

**Purpose:** Login page element locators

**Elements:**
1. txtUsername - `input[formcontrolname='userName']`
2. txtPassword - `//input[@name='password']`
3. btnLogin - `//input[@class='loginFormBtn']`
4. txtMfaCode - `input[name='mfaScanedCode']`
5. btnMfaSubmit - `input.mfaVerifyBtn`
6. lnkForgotPassword - `//a[@routerlink='forgot']`
7. lnkAzureAd - `//a[contains(@href,'azureadlogin')]`
8. lblLoginUnsuccessful - `//div[@class='loginErrorData']//p[1]`
9. lblLoginUnsuccessfulMessage - `//div[@class='loginErrorData']//p[2]`
10. lblForgotSuccessTitle - `//div[@class='loginInfoData']//p[1]`
11. lblForgotSuccessMessage - `//div[@class='loginInfoData']//p[2]`
12. lblForgotPasswordMessage - `.loginInfoData>p`

**TypeScript Considerations:**
- OPTION 1: Keep CSV format, use csv-parse
- OPTION 2: Convert to JSON for better typing
- OPTION 3: Create TypeScript locator objects

---

## 🎯 DESIGN PATTERNS USED

### 1. Page Object Model (POM)
- **Location:** pages/ directory
- **Implementation:** Each page as a separate class
- **Benefits:** Maintainability, reusability

### 2. Factory Pattern
- **Location:** PlaywrightFactory class
- **Implementation:** Centralized browser instance creation
- **Benefits:** Singleton pattern, resource management

### 3. Singleton Pattern
- **Location:** Logger, PlaywrightFactory
- **Implementation:** Class-level static variables
- **Benefits:** Single instance, shared state

### 4. Helper/Utility Pattern
- **Location:** CommonMethods, AllureHelper
- **Implementation:** Static method collections
- **Benefits:** Code reuse, separation of concerns

### 5. Fixture Pattern
- **Location:** conftest.py
- **Implementation:** Pytest fixtures for dependency injection
- **Benefits:** Setup/teardown automation, test isolation

### 6. Barrel Export Pattern
- **Location:** local_imports.py
- **Implementation:** Single import point
- **Benefits:** Clean imports, easier refactoring

---

## 🔒 CRITICAL FEATURES (MUST PRESERVE)

### 1. MFA/TOTP Support
- **Location:** LoginPage.login_with_mfa(), CommonMethods.generate_totp_code()
- **Dependency:** pyotp → otplib
- **Critical:** MUST maintain exact TOTP generation logic

### 2. CSV Locator Management
- **Location:** CommonMethods (get_values_from_csv, update_locator, _load_csv, _save_locators)
- **Critical:** MUST preserve CSV read/write capability
- **Caching:** MUST maintain locator caching mechanism

### 3. Allure Reporting
- **Location:** AllureHelper, conftest hooks
- **Critical:** MUST maintain report attachments

### 4. Screenshot on Failure
- **Location:** conftest.pytest_runtest_makereport
- **Critical:** MUST capture screenshots on test failure

### 5. Multi-Browser Support
- **Location:** PlaywrightFactory.init_browser
- **Browsers:** Chrome, Chromium, Firefox, WebKit
- **Critical:** MUST support all browser types

### 6. Async/Await Pattern
- **Location:** All page methods, fixtures
- **Critical:** MUST maintain async nature

### 7. Test Ordering
- **Location:** @step decorator, pytest-ordering
- **Critical:** MUST preserve test execution order

### 8. Fixture Injection
- **Location:** conftest.setup_pages
- **Critical:** MUST auto-inject page objects into test classes

### 9. Configuration Management
- **Location:** config.properties, CommonMethods.init_prop
- **Critical:** MUST load config from file

### 10. Validation Helpers
- **Location:** CommonMethods (validate_text, validate_popup, validate_list_options, etc.)
- **Critical:** MUST preserve all validation methods

---

## 🚨 KNOWN ISSUES & GAPS

### Issues Found:
1. **OpenAIUtils:** Was a stub/incomplete implementation
   - ✅ **RESOLVED:** Created stub implementation
   - **Action:** Implement full AI self-healing logic in TypeScript

2. **Page Objects:** 4 out of 5 page objects were stubs
   - ✅ **RESOLVED:** Created stub implementations for:
     - LandingPage
     - HomePage
     - WorkingScreenPage
     - WorkingScreenPageAudit
   - **Action:** Implement actual page logic in TypeScript migration

3. **Missing CSV Files:** Referenced but not present:
   - LANDING_ELEMENTS (referenced in login_page logout method)
   - WORKING_ELEMENTS (referenced in login_page logout method)
   - **Action:** Create these CSV files or update code to use correct CSV names

4. **Missing Constants:** Referenced in CommonMethods but not defined in AppConstants:
   - SEARCH_LIST
   - SEARCH_LIST_AUDITOR
   - SEARCH_LIST_PROSPECTIVE
   - **Action:** Define these constants in TypeScript

### Gaps to Address:
1. No test files found in tests/ directory (only conftest.py and __init__.py)
   - **Action:** May need to create example tests or user will provide

2. Environment variables handling (.env files) not explicitly configured
   - **Action:** Set up dotenv in TypeScript

3. CI/CD configuration files not present (GitHub Actions, Jenkins, etc.)
   - **Action:** Create TypeScript-compatible CI/CD configs

---

## ✅ MIGRATION CHECKLIST

### Phase 1: Project Setup ✅
- [ ] Initialize TypeScript project with npm/pnpm
- [ ] Create package.json with all dependencies
- [ ] Set up tsconfig.json
- [ ] Set up playwright.config.ts
- [ ] Create directory structure matching Python project
- [ ] Set up .env file handling

### Phase 2: Utility Migration
- [ ] Migrate logger.py → logger.ts
- [ ] Migrate app_constants.py → app-constants.ts
- [ ] Migrate common_methods.py → common-methods.ts
- [ ] Migrate playwright_factory.py → playwright-factory.ts (or use native fixtures)
- [ ] Migrate openai_utils.py → openai-utils.ts
- [ ] Create index.ts (barrel exports)
- [ ] Migrate AllureHelper → allure-helper.ts

### Phase 3: Page Object Migration
- [ ] Migrate login_page.py → login.page.ts
- [ ] Migrate landing_page.py → landing.page.ts
- [ ] Migrate home_page.py → home.page.ts
- [ ] Migrate working_screen_page.py → working-screen.page.ts
- [ ] Migrate working_screen_page_audit.py → working-screen-audit.page.ts

### Phase 4: Test InfrastructureMigration
- [ ] Migrate conftest.py → global-setup.ts + fixtures.ts
- [ ] Create TypeScript test base class (if needed)
- [ ] Set up screenshot on failure
- [ ] Set up Allure integration
- [ ] Create test ordering mechanism

### Phase 5: Configuration Migration
- [ ] Migrate config.properties → config.ts + .env
- [ ] Update setup scripts → package.json scripts
- [ ] Update README.md for TypeScript
- [ ] Create .env.example

### Phase 6: CSV Locator Handling
- [ ] Decide: Keep CSV or convert to JSON
- [ ] Migrate Login_Elements.csv
- [ ] Create missing CSV files (LANDING_ELEMENTS, WORKING_ELEMENTS)
- [ ] Implement CSV/JSON loader in TypeScript

### Phase 7: Feature Verification
- [ ] Verify MFA/TOTP generation
- [ ] Verify CSV locator loading
- [ ] Verify multi-browser launch
- [ ] Verify screenshot capture
- [ ] Verify Allure reporting
- [ ] Verify logging
- [ ] Verify configuration loading
- [ ] Verify all validation helpers
- [ ] Verify test ordering
- [ ] Verify fixture injection

### Phase 8: Documentation
- [ ] Update README.md completely
- [ ] Create TypeScript usage examples
- [ ] Document any Python→TypeScript differences
- [ ] Create migration notes document

---

## 📝 TYPESCRIPT MIGRATION NOTES

### Key Differences:
1. **No __init__.py files** - Not needed in TypeScript/Node
2. **async/await** - Native in TypeScript (no decorators needed)
3. **Type annotations** - Required for TypeScript (interfaces, types)
4. **Imports** - ES6 import/export instead of Python import
5. **Static methods** - Can become class methods or module exports
6. **Properties files** - Use .env + JSON or TypeScript objects
7. **CSV handling** - Use csv-parse/csv-stringify libraries
8. **Fixtures** - Use Playwright Test's native fixture system

### Naming Conventions:
- **Files:** kebab-case (login.page.ts, common-methods.ts)
- **Classes:** PascalCase (LoginPage, CommonMethods)
- **Methods:** camelCase (loginWithMfa, validateText)
- **Constants:** UPPER_SNAKE_CASE (API_KEY, ENABLE_OPENAI_SELF_HEALING)
- **Interfaces:** PascalCase with I prefix (IConfig, ILocator)

---

## 🎯 SUCCESS CRITERIA

Migration is considered successful when:

1. ✅ All 10 Python files have TypeScript equivalents
2. ✅ All 5 page objects are fully functional
3. ✅ All 6 utility classes work correctly
4. ✅ All CSV locators are loadable
5. ✅ MFA/TOTP generation works identically
6. ✅ Multi-browser support (4 browsers)
7. ✅ Screenshot on failure works
8. ✅ Allure reports generate correctly
9. ✅ Configuration loading from file works
10. ✅ All validation helper methods work
11. ✅ Test ordering mechanism works
12. ✅ Logging to file and console works
13. ✅ All async operations function correctly
14. ✅ Setup scripts work for new users
15. ✅ README documentation is complete

---

## 📅 NEXT STEPS

**AWAITING USER APPROVAL OF THIS MANIFEST**

Once approved, I will proceed with:
1. Phase 2: TypeScript Framework Setup
2. Phase 3: File-by-File Migration
3. Phase 4: Feature Verification

**DO NOT PROCEED WITHOUT USER CONFIRMATION**

---

**Document Version:** 1.0  
**Created:** February 6, 2026  
**Status:** Awaiting Approval  
**Total Features Cataloged:** 100+  
**Estimated Migration Effort:** Large (Multi-day project)
