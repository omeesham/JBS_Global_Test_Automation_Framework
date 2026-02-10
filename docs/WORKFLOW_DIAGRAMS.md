# Framework Workflow - Visual Guide

**Purpose**: Visual flow diagrams showing how to use the Playwright Test Agents framework  
**Audience**: Developers who didn't build the framework  
**Last Updated**: 2026-02-07

---

## 1. Overall Agent Workflow

```mermaid
graph TB
    Start([New Feature Request]) --> CheckReq{Feature in<br/>REQUIREMENTS.md?}
    
    CheckReq -->|Yes| UseExisting[Use existing implementation]
    CheckReq -->|No| Planner
    
    Planner[🎭 PLANNER AGENT<br/>User: Create test plan for feature]
    Planner --> PlannerExplore[Agent: Opens browser<br/>Navigates EspoCRM<br/>Explores UI]
    PlannerExplore --> PlannerWrite[Agent: Creates Markdown plan<br/>FILE: specs_planning/feature.md]
    
    PlannerWrite --> UserReview{User reviews<br/>test plan}
    UserReview -->|Changes needed| PlannerExplore
    UserReview -->|Approved| Generator
    
    Generator[🎭 GENERATOR AGENT<br/>User: Generate tests from plan]
    Generator --> GenSetup[Agent: Runs seed test<br/>READS: tests/seed.spec.ts]
    GenSetup --> GenExecute[Agent: Executes each step<br/>in real browser]
    GenExecute --> GenWrite[Agent: Generates TypeScript test<br/>FILE: tests/specs/feature.spec.ts]
    
    GenWrite --> UserRun[User: npm test]
    UserRun --> TestPass{Tests pass?}
    
    TestPass -->|Yes| UpdateReq[📝 UPDATE test-cases/*.md<br/>Mark as ✅ Automated]
    TestPass -->|No| Healer
    
    Healer[🎭 HEALER AGENT<br/>User: Fix failing tests]
    Healer --> HealDebug[Agent: Runs tests<br/>Captures errors]
    HealDebug --> HealAnalyze[Agent: Analyzes failures<br/>Takes screenshots<br/>Checks locators]
    HealAnalyze --> HealFix[Agent: Updates test code<br/>MODIFIES: tests/specs/*.spec.ts]
    HealFix --> HealVerify[Agent: Re-runs tests]
    
    HealVerify --> TestPass
    
    UpdateReq --> Done([Feature Complete])
    UseExisting --> Done
    
    style Start fill:#e1f5ff
    style Planner fill:#fff4e1
    style Generator fill:#ffe1f5
    style Healer fill:#e1ffe1
    style UpdateReq fill:#ffe1e1
    style Done fill:#d4edda
```

---

## 2. File CRUD Operations by Agent

```mermaid
graph LR
    subgraph "PLANNER AGENT"
        P1[📖 READ<br/>tests/seed.spec.ts] --> P2[🌐 Browser Interaction<br/>Real-time exploration]
        P2 --> P3[📝 CREATE<br/>specs_planning/feature.md]
    end
    
    subgraph "GENERATOR AGENT"
        G1[📖 READ<br/>specs_planning/feature.md] --> G2[📖 READ<br/>tests/seed.spec.ts]
        G2 --> G3[🌐 Execute Steps<br/>in Browser]
        G3 --> G4[📝 CREATE<br/>tests/specs/feature.spec.ts]
    end
    
    subgraph "HEALER AGENT"
        H1[📖 READ<br/>tests/specs/*.spec.ts] --> H2[▶️ RUN TESTS<br/>Capture failures]
        H2 --> H3[🌐 Debug in Browser<br/>Analyze locators]
        H3 --> H4[✏️ UPDATE<br/>tests/specs/*.spec.ts]
    end
    
    subgraph "USER ACTIONS"
        U1[✏️ UPDATE<br/>test-cases/*.md<br/>Mark ✅ Automated] --> U2[📖 CREATE<br/>object_repository/*.csv<br/>If new page elements]
        U2 --> U3[✏️ CREATE<br/>src/pages/*.page.ts<br/>If new page object]
    end
    
    P3 -.->|User approves| G1
    G4 -.->|Tests fail| H1
    H4 -.->|Tests pass| U1
    
    style P3 fill:#fff4e1
    style G4 fill:#ffe1f5
    style H4 fill:#e1ffe1
    style U1 fill:#ffe1e1
```

---

## 3. First-Time Setup Flow

```mermaid
sequenceDiagram
    participant User
    participant Terminal
    participant VSCode
    participant Copilot
    participant MCP
    
    User->>Terminal: npm install && npx playwright install
    Terminal-->>User: ✅ Dependencies installed
    
    User->>Terminal: cp .env.example .env
    User->>User: Edit .env (BASE_URL, credentials)
    
    User->>VSCode: Open GitHub Copilot Settings
    Note over User,VSCode: GitHub > Settings > Copilot > MCP configuration
    User->>Copilot: Add MCP JSON config
    
    User->>VSCode: Ctrl+Shift+P → Reload Window
    VSCode->>MCP: Initialize MCP server
    MCP-->>VSCode: ✅ Agents ready
    
    User->>Copilot: @playwright-test-planner discover pending tests
    Copilot->>MCP: Execute browser commands
    MCP-->>Copilot: Browser state & snapshots
    
    Note over User,MCP: ✅ Framework ready to use
```

---

## 4. Daily Test Development Flow

```mermaid
stateDiagram-v2
    [*] --> CheckRequirements: New feature needed
    
    CheckRequirements --> FeatureExists: Check REQUIREMENTS.md
    FeatureExists --> UseCode: Feature already implemented
    FeatureExists --> CreatePlan: New feature
    
    CreatePlan --> CopilotPlanner: @playwright-test-planner<br/>explore [feature] module
    
    CopilotPlanner --> AgentExplores: Agent opens browser<br/>Navigates EspoCRM<br/>Captures snapshots
    
    AgentExplores --> PlanCreated: Agent writes specs_planning/plan.md
    
    PlanCreated --> UserReviews: User reviews Markdown plan
    UserReviews --> PlanCreated: Needs changes
    UserReviews --> GenerateTests: Plan approved
    
    GenerateTests --> CopilotGenerator: @playwright-test-generator<br/>generate pending tests
    
    CopilotGenerator --> AgentExecutes: Agent runs seed test<br/>Executes each step<br/>in real browser
    
    AgentExecutes --> TestsCreated: Agent writes<br/>tests/specs/feature.spec.ts
    
    TestsCreated --> RunTests: npm test
    
    RunTests --> TestsPassed: All tests pass
    RunTests --> TestsFailed: Some tests fail
    
    TestsFailed --> CopilotHealer: @playwright-test-healer<br/>fix failing tests
    
    CopilotHealer --> AgentDebug: Agent runs tests<br/>Captures errors<br/>Analyzes locators
    
    AgentDebug --> AgentFix: Agent updates test code
    
    AgentFix --> RunTests
    
    TestsPassed --> UpdateRequirements: Update test-cases/*.md<br/>Mark ✅ Automated
    
    UpdateRequirements --> [*]: Feature complete
    UseCode --> [*]: Use existing code
```

---

## 5. Page Object Creation Flow

```mermaid
flowchart TD
    Start([Need new page interaction]) --> CheckExisting{Page object<br/>exists?}
    
    CheckExisting -->|Yes| UseExisting[Use existing page object<br/>from src/pages/]
    CheckExisting -->|No| CreateCSV
    
    CreateCSV[📝 CREATE CSV<br/>object_repository/PageName_Elements.csv]
    CreateCSV --> CSVFormat[Add element entries:<br/>Element Name,Locator<br/>btnLogin,button.submit<br/>txtEmail,input#email]
    
    CSVFormat --> CreatePage[📝 CREATE PAGE OBJECT<br/>src/pages/pagename.page.ts]
    
    CreatePage --> PageTemplate[```typescript<br/>export class PageNamePage extends BasePage {<br/>  private csvFile = 'PageName_Elements.csv';<br/>  <br/>  async clickButton(): Promise&lt;boolean&gt; {<br/>    return await this.clickElement('btnLogin', this.csvFile);<br/>  }<br/>}```]
    
    PageTemplate --> UpdateIndex[✏️ UPDATE<br/>src/pages/index.ts<br/>export * from './pagename.page';]
    
    UpdateIndex --> UseInTest[Use in test:<br/>const page = new PageNamePage(page, config);<br/>await page.clickButton();]
    
    UseInTest --> Done([Ready to use])
    UseExisting --> Done
    
    style CreateCSV fill:#fff4e1
    style CreatePage fill:#ffe1f5
    style UpdateIndex fill:#e1ffe1
```

---

## 6. Environment Management Flow

```mermaid
graph TB
    subgraph "Local Development"
        L1[File: .env.development] --> L2[npm test]
        L2 --> L3[Tests run on dev environment]
    end
    
    subgraph "Staging Testing"
        S1[File: .env.staging] --> S2[CI_ENV=staging npm test]
        S2 --> S3[Tests run on staging environment]
    end
    
    subgraph "Production Testing"
        P1[File: .env.production] --> P2[NODE_ENV=production npm test]
        P2 --> P3[Tests run on production environment]
    end
    
    subgraph "Configuration Loading"
        C1[config/env.ts] --> C2{Check CI_ENV<br/>or NODE_ENV}
        C2 -->|development| L1
        C2 -->|staging| S1
        C2 -->|production| P1
        C2 -->|not set| L1
    end
    
    L3 --> R[All env vars in process.env]
    S3 --> R
    P3 --> R
    
    style L1 fill:#e1f5ff
    style S1 fill:#fff4e1
    style P1 fill:#ffe1e1
```

---

## 7. Data-Driven Testing Flow

```mermaid
flowchart LR
    Start([Need test data]) --> Source{Data source?}
    
    Source -->|Excel/CSV| Excel[AdapterFactory.createAdapter 'excel']
    Source -->|JSON file| JSON[AdapterFactory.createAdapter 'json']
    Source -->|Database| DB[AdapterFactory.createAdapter 'db']
    Source -->|AWS S3| S3[AdapterFactory.createAdapter 's3']
    
    Excel --> Load[adapter.load]
    JSON --> Load
    DB --> Load
    S3 --> Load
    
    Load --> Result{result.success?}
    
    Result -->|true| Loop[Loop through result.data]
    Result -->|false| Stub[Use stub data<br/>Tests still run]
    
    Loop --> Test[Run test with data row:<br/>record.username<br/>record.password<br/>record.expected]
    
    Stub --> Test
    
    Test --> Next{More data?}
    Next -->|Yes| Loop
    Next -->|No| Done([All data tested])
    
    style Excel fill:#e1f5ff
    style JSON fill:#fff4e1
    style DB fill:#ffe1f5
    style S3 fill:#e1ffe1
```

---

## 8. Test Execution & Reporting Flow

```mermaid
sequenceDiagram
    participant User
    participant NPM
    participant Playwright
    participant Browser
    participant PageObject
    participant CSV
    participant Logger
    participant Reporter
    
    User->>NPM: npm test
    NPM->>Playwright: Run tests in playwright.config.ts
    
    Playwright->>Playwright: Load .env.{environment}
    Playwright->>Playwright: Initialize global-setup.ts
    
    loop For each test
        Playwright->>Browser: Launch browser (chrome/firefox/webkit)
        Playwright->>PageObject: Create page object instance
        PageObject->>CSV: Read locators from object_repository/*.csv
        CSV-->>PageObject: Return selectors
        
        PageObject->>Browser: Execute actions (click, fill, etc.)
        Browser-->>PageObject: Action result
        
        PageObject->>Logger: Log action (info/error)
        Logger-->>Logger: Write to logs/test-{date}.log
        
        alt Test passes
            Playwright->>Reporter: Record success
        else Test fails
            Browser->>Playwright: Take screenshot
            Playwright->>Reporter: Record failure + screenshot
        end
    end
    
    Playwright->>Playwright: Run global-teardown.ts
    Playwright->>Reporter: Generate HTML report
    Reporter-->>User: Open reports/html-report/index.html
    
    User->>NPM: npm run allure:generate
    NPM->>Reporter: Generate Allure report
    Reporter-->>User: Open reports/allure-report/index.html
```

---

## 9. Quick Command Reference

```mermaid
graph TD
    subgraph "Setup Commands"
        S1[npm install &&<br/>npx playwright install] --> S2[cp .env.example .env]
        S2 --> S3[Edit .env file]
    end
    
    subgraph "Test Commands"
        T1[npm test<br/>All tests, all browsers] --> T2[npm run test:chrome<br/>Chrome only]
        T2 --> T3[npm run test:headed<br/>Visible browser]
        T3 --> T4[npm run test:debug<br/>Debug mode]
        T4 --> T5[npm run test:ui<br/>Interactive UI mode]
    end
    
    subgraph "Agent Commands via Copilot Chat"
        A1[@playwright-test-planner<br/>discover pending tests] --> A2[@playwright-test-generator<br/>generate pending tests]
        A2 --> A3[@playwright-test-healer<br/>fix failing tests]
    end
    
    subgraph "Report Commands"
        R1[npm run report<br/>Open Playwright report] --> R2[npm run allure:generate<br/>Generate Allure report]
        R2 --> R3[npm run allure:open<br/>View Allure report]
    end
    
    subgraph "Maintenance Commands"
        M1[npm run typecheck<br/>TypeScript validation] --> M2[npm run clean<br/>Remove reports/logs]
        M2 --> M3[npm run lint<br/>ESLint check]
    end
    
    style S3 fill:#e1f5ff
    style T5 fill:#fff4e1
    style A3 fill:#ffe1f5
    style R3 fill:#e1ffe1
    style M3 fill:#ffe1e1
```

---

## 10. Error Resolution Flow

```mermaid
flowchart TD
    Error([Test fails]) --> ErrorType{Error type?}
    
    ErrorType -->|Element not found| Locator
    ErrorType -->|Timeout| Timeout
    ErrorType -->|Assertion failure| Assertion
    ErrorType -->|Environment issue| Env
    
    Locator[🔍 Check CSV locators]
    Locator --> LocatorFix{Locator correct?}
    LocatorFix -->|No| UpdateCSV[✏️ UPDATE<br/>object_repository/*.csv]
    LocatorFix -->|Yes| UseHealer
    
    Timeout[⏱️ Check wait conditions]
    Timeout --> TimeoutFix{Need more time?}
    TimeoutFix -->|Yes| UpdateConfig[✏️ UPDATE<br/>playwright.config.ts<br/>Increase timeout]
    TimeoutFix -->|No| UseHealer
    
    Assertion[📋 Check expected values]
    Assertion --> AssertionFix{Expectation correct?}
    AssertionFix -->|No| UpdateTest[✏️ UPDATE<br/>test code]
    AssertionFix -->|Yes| UseHealer
    
    Env[🌍 Check environment config]
    Env --> EnvFix{Config correct?}
    EnvFix -->|No| UpdateEnv[✏️ UPDATE<br/>.env.{environment}]
    EnvFix -->|Yes| UseHealer
    
    UseHealer[@workspace Use<br/>playwright-test-healer]
    UpdateCSV --> Retest
    UpdateConfig --> Retest
    UpdateTest --> Retest
    UpdateEnv --> Retest
    UseHealer --> Retest[npm test]
    
    Retest --> Success{Tests pass?}
    Success -->|No| Error
    Success -->|Yes| Done([✅ Fixed])
    
    style UseHealer fill:#e1ffe1
    style Done fill:#d4edda
```

---

## Legend

### File Operations
- 📝 **CREATE** - New file created
- 📖 **READ** - File read/accessed
- ✏️ **UPDATE** - Existing file modified
- ❌ **DELETE** - File removed

### Agents
- 🎭 **PLANNER** - Creates test plans (Markdown)
- 🎭 **GENERATOR** - Creates executable tests (TypeScript)
- 🎭 **HEALER** - Fixes failing tests

### Symbols
- 🌐 **Browser** - Real browser interaction via MCP
- ▶️ **RUN** - Execute tests
- ⏱️ **TIMEOUT** - Wait/delay operations
- 🔍 **SEARCH** - Find elements

---

## Usage Tips

1. **Start with Planner** - Always create test plan first (specs_planning/*.md)
2. **Review before generating** - Check Markdown plan makes sense
3. **Let agents explore** - They use real browser, not screenshots
4. **REQUIREMENTS.md is READ-ONLY** - Agents read it for context, never modify it
5. **Use Healer for fixes** - Don't manually fix broken locators
6. **CSV locators always** - Never hardcode selectors in page objects
7. **BasePage for all pages** - All page objects extend BasePage
8. **Environment files for secrets** - Never hardcode URLs/credentials

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-07
