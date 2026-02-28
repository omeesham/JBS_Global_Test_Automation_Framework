# MCP Browser Exploration Guide

> **READ THIS** before any MCP Playwright session. Violations map to PLN-045 through PLN-054.

---

## 0. Two MCP Servers — KNOW THE DIFFERENCE

This project uses TWO separate MCP servers. Do NOT confuse them.

| | `playwright-browser` (Exploration) | `playwright-test` (Test Runner) |
|---|---|---|
| Package | `@playwright/mcp` (standalone) | `playwright run-test-mcp-server` |
| How to start | `browser_navigate(url)` — auto-opens browser | Needs active Playwright test context |
| Session | Persists across tool calls + MCP restarts | Fresh per worker via authenticatedSession |
| Auth | `--user-data-dir .auth/chrome-profile` — login persists on disk | Automatic via `.auth/session.json` |
| Purpose | DOM inspection, selector validation, screenshots | `test_run`, `test_list`, `test_debug`, `browser_generate_locator` |
| Used by | Requirements, Planner, Generator, Audit | Healer only |
| State shared? | NO — separate from test runner | NO — separate from MCP browser |

### Which agents use which server

| Agent | `playwright-browser` | `playwright-test` | Notes |
|-------|:---:|:---:|-------|
| Requirements | ✓ | — | DOM exploration only |
| Planner | ✓ | — | DOM exploration only |
| Generator | ✓ | — | Pre-flight via MCP browser; test execution via terminal |
| Healer | — | ✓ | Needs `test_run`/`test_debug` in same browser context |
| Audit | ✓ | — | DOM inspection only |

### Starting an MCP browser session
1. `browser_navigate(url)` — that's it. Browser opens automatically.
2. `browser_wait_for(time:3)`
3. `browser_snapshot()`

There is NO setup tool. There is NO seed spec to run for MCP. `browser_navigate` IS the setup.

Login persistence: `--user-data-dir .auth/chrome-profile` stores Chrome profile on disk. Login once → cookies survive MCP restarts. No re-auth needed.

### Running tests (separate concern)
Test execution uses the terminal: `npx playwright test <spec> --reporter=list`

Do NOT run spec files through MCP. Do NOT use MCP browser tools to run tests.

---

## 1. Mandatory Navigate → Wait → Snapshot Sequence

```
browser_navigate(url)  →  browser_wait_for(time:3)  →  browser_snapshot()
```

**NEVER** snapshot immediately after navigate — the page needs time to render. Minimum 3s wait.

After clicking a tab or triggering content load:
```
browser_click(ref)  →  browser_wait_for(time:2)  →  browser_snapshot()
```

---

## 2. Complete Tool Reference

| Tool | When to Use | Notes |
|------|-------------|-------|
| `browser_navigate` | First page load, URL changes | Auto-opens browser if none exists |
| `browser_wait_for` | After navigate, click, or tab switch | `time:2-3` for most pages |
| `browser_snapshot` | Read current DOM accessibility tree | Returns full tree — can be large |
| `browser_click` | Click buttons, tabs, checkboxes, links | Use `ref` from snapshot |
| `browser_type` | Type into text inputs | Use `ref` from snapshot |
| `browser_fill_form` | Fill multiple form fields at once | Batch input operations |
| `browser_hover` | Hover for tooltips, dropdown menus | Triggers hover-only UI |
| `browser_select_option` | Select dropdown option | Use `ref` + `value` |
| `browser_press_key` | Keyboard actions (Enter, Tab, Escape) | After focus on element |
| `browser_evaluate` | Run JS in page context | **Best for data-heavy pages** |
| `browser_take_screenshot` | Visual capture of current page | For evidence/documentation |
| `browser_tabs` | List open browser tabs | For multi-tab workflows |
| `browser_console_messages` | Read console logs/errors | Debug JS issues |
| `browser_network_requests` | Inspect API calls | Debug data loading |
| `browser_close` | **NEVER USE** unless user explicitly asks | R16 violation |

---

## 3. Data-Heavy Page Strategy

When a page has grids, tables, or many fields (snapshot > 500 lines):

**DO**: Use `browser_evaluate` for targeted DOM queries:
```javascript
browser_evaluate(() => {
  const fields = document.querySelectorAll('input, select, textarea');
  return Array.from(fields).map(f => ({
    label: f.closest('label')?.textContent || f.getAttribute('aria-label') || '',
    type: f.tagName + (f.type ? ':' + f.type : ''),
    value: f.value,
    id: f.id,
    disabled: f.disabled,
    checked: f.checked
  }));
})
```

**DON'T**: Take full snapshot then read 150-line chunks serially (PLN-048).

---

## 4. Snapshot Reading Best Practices

| ✗ NEVER | ✓ DO |
|---------|------|
| Read snapshot 150-400 lines at a time | Read 500+ lines in one range |
| Re-read full snapshot for refs already seen | Track refs from first read, click directly |
| Assume page content from memory | Always take fresh snapshot before editing TCs |

After reading a snapshot:
1. **Extract all clickable refs** for tabs/buttons you'll need
2. **Note field values** (defaults, checked states, disabled states)
3. **Count total fields** (for TC reconciliation later)

---

## 5. Tab Exploration Protocol

For pages with multiple tabs (e.g., Local Information, Currency, Pricing):

1. Navigate to page → wait 3s → snapshot (captures default tab)
2. Extract ALL tab refs from snapshot
3. For each tab:
   - `browser_click(tabRef)` → `browser_wait_for(time:2)` → `browser_snapshot()`
   - Record all field names, values, states
4. **One trip per tab** — no double-navigating

---

## 6. Session Reuse Rules

<!-- SYNC:MCP_CRITICAL:START -->
- `browser_navigate` auto-opens a browser if none exists — no manual setup needed
- **NEVER** call `browser_close` unless user explicitly requests it
- **REUSE** same browser context to avoid Microsoft auth/2FA re-prompts
- **User explicit requests override ALL agent rules** — always obey the user
- Always `browser_wait_for(time:3)` between navigate and snapshot (PLN-045)
- **Full MCP guide**: `docs/read_only_docs/MCP_BROWSER_GUIDE.md`
<!-- SYNC:MCP_CRITICAL:END -->

---

## 7. Terminal Commands (PowerShell)

All terminal commands run in **Windows PowerShell 5.1**:

| ✗ Unix (NEVER) | ✓ PowerShell (DO) |
|-----------------|-------------------|
| `tail -n 20 file` | `Get-Content file \| Select-Object -Last 20` |
| `grep "pattern" file` | `Select-String -Path file -Pattern "pattern"` |
| `cat file` | `Get-Content file` |
| `wc -l file` | `(Get-Content file).Count` |
| `node -e "ts code"` | `npx ts-node -e "ts code"` |

---

## 8. Common Pitfalls

| Pitfall | Correct |
|----|-------------|---------|
| Navigate → immediate snapshot → empty | Navigate → wait 3s → snapshot |
| Click tab → immediate snapshot → timeout | Click tab → wait 2s → snapshot |
| Full snapshot of 30K+ line page | browser_evaluate for targeted queries |
| Serial 150-line chunk reads | One 500+ line read or browser_evaluate |
| Unix commands in PowerShell | Use PowerShell cmdlets |
| `node -e` with TypeScript syntax | `npx ts-node -e` for TS |
| Double-navigate same URL (empty first try) | One navigate + wait + snapshot |
| Re-read snapshot for already-captured refs | Track refs, click directly |
| multi_replace missing required fields | Validate all objects have oldString/newString/filePath |
| Edit TCs without visiting live site | Fresh snapshot BEFORE any TC editing |

---

## 8.5 Failure Debugging Protocol (§15 Phase A, Steps A13-A14)

When debugging a test failure, MCP browser replicates the failure — not guesses at fixes.

### Replication Sequence (A13)
1. Read `pageUrl` and `lastActions[]` from `failure-summary.json`
2. `browser_navigate(pageUrl)` → `browser_wait_for(time:3)` → `browser_snapshot()`
3. Reproduce each action from `lastActions[]`:
   - Click → `browser_click(ref)` on same element
   - Fill → `browser_type(ref, text)` with same value
   - Navigate → `browser_navigate(url)`
4. After reproducing: `browser_snapshot()` — observe actual DOM state
5. Compare observed state with expected state from test assertion

### Selector Verification (A14)
6. Extract the failing CSS selector from `fullError`
7. `browser_evaluate(() => document.querySelector('<selector>'))` — does it match?
8. If null: `browser_evaluate(() => document.querySelectorAll('[data-testid]'))` — find alternatives
9. Compare snapshot accessibility tree with selector expectation

### Evidence Capture
10. Document findings in evidence checklist rows A13 + A14
11. ONLY after A1-A14 complete → proceed to code fix (§15 Phase B)

### Applies To
- **Generator**: Phase 4 fix loop (uses `playwright-browser` MCP)
- **Healer**: All diagnosis (uses `playwright-test` MCP — `test_debug` → `browser_snapshot`)

---

## 9. Office Separation

| Office | ID | Purpose | Used by |
|--------|-----|---------|--------|
| Execution | `1604` (Parker Palm Springs) | `npx playwright test` only | Generator (test runs), Healer (re-runs) |
| Exploration | `0220` (Test Location) | MCP DOM inspection only | Requirements, Planner, Generator (pre-flight) |

**Rule**: When using `browser_navigate` for DOM exploration, always navigate to office `EXPLORATION_OFFICE_NO` (0220). Never navigate to `EXECUTION_OFFICE_NO` (1604) during generation/planning — that office is reserved for test execution.

**Env vars** (in all `config/environments/.env.*` files):
```
EXECUTION_OFFICE_NO=1604
EXPLORATION_OFFICE_NO=0220
```

**Prerequisite**: Office 0220 must be verified via MCP to confirm DOM structure matches 1604 before agents begin using it. See `new.md` Step 4 verification gate.

---

## 10. Pre-TC-Editing Checklist

Before writing or editing ANY test case:

- [ ] Navigated to live URL via `browser_navigate`
- [ ] Waited 3s via `browser_wait_for`
- [ ] Took `browser_snapshot` of current page state
- [ ] Verified all field default values from snapshot
- [ ] Clicked each relevant tab and captured its state
- [ ] Counted fields in DOM vs existing TCs

**If you haven't done all of these → STOP and explore first.**

---

**Referenced by**: AGENT_SHARED_RULES.md R16, copilot-instructions.md § 9, task-context-builder.ts CRITICAL_REMINDERS

**Updated**: 2026-02
