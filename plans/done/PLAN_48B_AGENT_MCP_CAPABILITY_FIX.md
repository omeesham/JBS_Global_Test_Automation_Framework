# PLAN 48B: Agent MCP & Capability Fix

## Status: PENDING
## Priority: P0-CRITICAL
## Depends On: Nothing

## Problem

Healer uses `playwright-test` MCP (test runner only) — has `browser_snapshot` and `browser_evaluate` but NO `browser_navigate`, `browser_click`, `browser_hover`, `browser_type`. It cannot navigate to a page or interact with UI. Its prompt instructs "Navigate to pageUrl" and "Reproduce EXACT steps on MCP" — impossible with current tools.

User feedback: "it said it cant create mcp session or touch any buttons when i tried"

---

## Changes

### File: `.github/agents/playwright-test-healer.agent.md`

1. Add `playwright-browser` MCP server alongside `playwright-test`:
```yaml
mcp-servers:
  playwright-test:
    type: stdio
    command: npx
    args:
      - playwright
      - run-test-mcp-server
  playwright-browser:
    type: stdio
    command: npx
    args:
      - "@playwright/mcp@latest"
      - "--browser"
      - "chrome"
      - "--user-data-dir"
      - ".auth/chrome-profile"
```

2. Add browser tools to tools list:
```yaml
tools:
  ['vscode', 'execute', 'read/readFile', 'agent', 'edit', 'search', 'web',
   'playwright-test/test_run', 'playwright-test/test_debug', 'playwright-test/test_list',
   'playwright-test/browser_console_messages', 'playwright-test/browser_evaluate',
   'playwright-test/browser_generate_locator', 'playwright-test/browser_network_requests',
   'playwright-test/browser_snapshot',
   'playwright-browser/browser_click', 'playwright-browser/browser_navigate',
   'playwright-browser/browser_snapshot', 'playwright-browser/browser_type',
   'playwright-browser/browser_hover', 'playwright-browser/browser_evaluate',
   'playwright-browser/browser_wait_for', 'playwright-browser/browser_press_key',
   'playwright-browser/browser_select_option',
   'playwright-browser/browser_console_messages', 'playwright-browser/browser_network_requests',
   'todo']
```

3. Add MCP conflict warning rule:
```
| HLR-MCP | playwright-test and playwright-browser share Playwright infrastructure. NEVER use both simultaneously. Finish test runs and close test runner BEFORE opening browser for triage verification. |
```

### File: `.github/agents/playwright-pipeline-audit.agent.md`

4. Add missing interaction tools for hands-on verification:
```yaml
# Add to existing tools list:
'playwright-browser/browser_select_option',
'playwright-browser/browser_drag',
'playwright-browser/browser_file_upload',
'playwright-browser/browser_handle_dialog'
```

---

## Verification

- Invoke Healer agent in VS Code Copilot
- Verify it can: `browser_navigate` to a URL, `browser_click` an element, `browser_snapshot` the page
- Verify `playwright-test/test_run` still works for running tests

## Files

- `.github/agents/playwright-test-healer.agent.md` — add playwright-browser MCP, add browser tools
- `.github/agents/playwright-pipeline-audit.agent.md` — add missing interaction tools
