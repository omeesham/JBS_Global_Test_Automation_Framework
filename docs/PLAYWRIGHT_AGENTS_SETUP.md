# Playwright Test Agents - Official Setup ✅

**Status**: Production-Ready | Following Official Playwright Documentation  
**Reference**: https://playwright.dev/docs/test-agents  
**VS Code Version**: v1.109.0 (Required: v1.105+)  
**Playwright Version**: v1.58.2

---

## 🎯 What Are Playwright Test Agents?

Playwright comes with **three AI-powered test agents** that work together to create and maintain browser tests:

1. **🎭 Planner** - Explores your app and produces Markdown test plans
2. **🎭 Generator** - Transforms test plans into executable Playwright tests  
3. **🎭 Healer** - Automatically repairs failing tests

These agents use **MCP (Model Context Protocol)** to interact with real browsers, making them far more accurate than screenshot-based approaches.

---

## ✅ Setup Complete (Official Method)

This project was configured using the **official Playwright command**:

```powershell
npx playwright init-agents --loop=vscode
```

### What Was Created:

✅ **Agent Definitions** (`.github/agents/`):
   - `playwright-test-generator.agent.md`
   - `playwright-test-planner.agent.md`
   - `playwright-test-healer.agent.md`

✅ **MCP Configuration** (`.vscode/mcp.json`):
   - Automatic MCP server setup for VS Code
   - No manual user settings required

✅ **Test Structure**:
   - `specs_planning/` - Directory for human-readable test plans (Markdown)
   - `tests/seed.spec.ts` - EspoCRM-specific environment bootstrap

✅ **CI/CD Workflow** (`.github/workflows/copilot-setup-steps.yml`)

---

## 🔧 EspoCRM Seed Test Customization

The seed test provides agents with EspoCRM context and navigation patterns:

**File**: [tests/seed.spec.ts](tests/seed.spec.ts)

```typescript
import { test, expect } from '@playwright/test';

test.describe('EspoCRM Environment Setup', () => {
  test('seed', async ({ page }) => {
    await page.goto('https://demo.us.espocrm.com');
    await expect(page).toHaveTitle(/Free CRM/);
    
    // Navigate to login page
    const signInLink = page.locator('text=Sign In').first();
    if (await signInLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await signInLink.click();
    }
    
    // Verify form elements exist
    await expect(page.locator('input[name="email"]').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[name="password"]').first()).toBeVisible();
  });
});
```

**Why This Matters**: Agents use this seed test to understand EspoCRM's structure, navigation flows, and element selectors.

---

## 🚀 Using Playwright Agents in GitHub Copilot

### Step 1: Configure GitHub Copilot (One-Time Setup)

Add MCP server configuration to **GitHub > Settings > Copilot > Coding agent > MCP configuration**:

```json
{
  "mcpServers": {
    "playwright-test": {
      "type": "stdio",
      "command": "npx",
      "args": ["playwright", "run-test-mcp-server"],
      "tools": ["*"]
    }
  }
}
```

### Step 2: Reload VS Code

```
Ctrl+Shift+P → "Developer: Reload Window"
```

### Step 3: Verify Agents Are Active

In **GitHub Copilot Chat**, type:
```
@workspace Which Playwright agents are available?
```

Expected response: Lists 🎭 planner, 🎭 generator, 🎭 healer

---

## 📝 Agent Workflows (Professional Usage)

### Workflow 1: Create Test Plan
```
@workspace Generate a comprehensive test plan for EspoCRM contact management:
1. Adding new contacts
2. Editing existing contacts  
3. Deleting contacts
4. Searching for contacts

Save the plan to specs_planning/contact-management.md
```

**Result**: Agent explores EspoCRM, creates detailed test plan in `specs_planning/`

---

### Workflow 2: Generate Executable Tests
```
@workspace Use the test plan from specs_planning/contact-management.md to generate Playwright tests.
Save to tests/specs/contacts/
```

**Result**: Agent creates working `.spec.ts` files with proper selectors

---

### Workflow 3: Heal Failing Tests
```
@workspace The test in tests/specs/espocrm/login.spec.ts is failing. 
Debug and fix the locators automatically.
```

**Result**: Agent re-runs test, finds updated selectors, patches the test

---

## 🛠️ MCP Browser Tools Available

Agents have access to these browser automation tools:

| Tool | Description | Example |
|------|-------------|---------|
| `browser_navigate` | Navigate to URLs | Go to EspoCRM login page |
| `browser_snapshot` | Get accessibility tree | Inspect page structure |
| `browser_click` | Click elements | Click "Sign In" button |
| `browser_type` | Type into inputs | Fill email field |
| `browser_verify_element_visible` | Check visibility | Verify error message shows |
| `browser_verify_text_visible` | Check text content | Confirm "Welcome" text |
| `browser_evaluate` | Run JavaScript | Get computed styles |
| `browser_wait_for` | Wait for conditions | Wait for page load |

*Full list: See `.github/agents/playwright-test-generator.agent.md`*

---

## 📂 Project Structure (Official Convention)

```
hybrid_framework/
├── .github/
│   ├── agents/                    # Agent definitions (auto-generated)
│   │   ├── playwright-test-generator.agent.md
│   │   ├── playwright-test-planner.agent.md
│   │   └── playwright-test-healer.agent.md
│   └── workflows/
│       └── copilot-setup-steps.yml
├── specs_planning/                          # Human-readable test plans (Markdown)
│   └── README.md
├── tests/
│   ├── seed.spec.ts               # EspoCRM environment bootstrap
│   └── specs_planning/                      # Generated Playwright tests
│       ├── espocrm/
│       ├── auth/
│       └── ...
├── .vscode/
│   └── mcp.json                    # MCP server config (auto-generated)
└── playwright.config.ts
```

---

## 🔍 Verification & Troubleshooting

### Check TypeScript Compilation
```powershell
npm run typecheck  # Should show 0 errors
```

### Test Seed File Manually
```powershell
npx playwright test tests/seed.spec.ts --project=chrome --headed
```

### Verify MCP Server
```powershell
npx playwright run-test-mcp-server --help
```

### Common Issues

**Issue**: Agents not showing in Copilot Chat  
**Solution**: 
1. Verify VS Code v1.105+: `code --version`
2. Add MCP config to GitHub Copilot settings
3. Reload VS Code window

**Issue**: Seed test fails  
**Solution**: Check EspoCRM is accessible, verify selectors in seed test

**Issue**: MCP server not starting  
**Solution**: Run `npx playwright install` to ensure browsers are installed

---

## 🎯 Professional Best Practices

### 1. Keep Seed Tests Updated
- Update `tests/seed.spec.ts` when EspoCRM UI changes
- Agents learn from seed test structure

### 2. Regenerate Agents on Playwright Updates
```powershell
npx playwright init-agents --loop=vscode
```

### 3. Review Generated Tests
- Agents create good tests but review for business logic
- Add custom assertions for domain-specific validation

### 4. Use Descriptive Plan Names
```
specs_planning/
├── auth-login-logout.md           # ✅ Clear
├── contact-crud-operations.md     # ✅ Clear  
└── test-plan-1.md                 # ❌ Vague
```

### 5. Chain Agents Sequentially
```
Planner → Generator → Healer
```
Let planner explore, generator create tests, healer fix failures.

---

## 📚 Additional Resources

- **Official Docs**: https://playwright.dev/docs/test-agents
- **MCP Protocol**: https://modelcontextprotocol.io/
- **Agent Files**: [.github/agents/](.github/agents/)
- **MCP Config**: [.vscode/mcp.json](.vscode/mcp.json)
- **Seed Test**: [tests/seed.spec.ts](tests/seed.spec.ts)

---

**Status**: ✅ Production-Ready | Ready for EspoCRM Test Generation  
**Last Updated**: February 8, 2026  
**Setup Method**: Official Playwright Command
