# Plan 03: Unified RCA Protocol

**Status**: DONE 2026-03-04 — unified 7-step RCA in §12, Self-Unblocking Map in §14, all §15 refs fixed

**Problem**: RCA is theoretically documented in §15 but agents don't follow it. Generator went through 6+ MCP sessions for an issue visible in error-context.md. Planner writes wrong selectors because it doesn't verify HTML structure. Healer has a protocol but it references diagnostics files that may not exist.

**Root Cause**:
1. RCA protocol is vague — "10/13 checklist items" without specifying which are mandatory
2. No clear sequence of operations — agents jump around
3. Failure artifacts are generated but agents don't know where to find them or how to read them
4. No distinction between "what the user sees in headed mode" vs "what the agent has access to"

---

## Unified RCA Protocol (Replaces §15 in Shared Rules)

### The Core Problem This Solves

When a user runs tests in `--headed` mode, they SEE the exact moment of failure — the browser state, the dialog that appeared, the element that's missing. Agents need the same ability. Playwright ALREADY captures this data:

| What User Sees | Agent Equivalent | Location |
|---------------|-----------------|----------|
| Browser state at failure | Accessibility snapshot | `reports/test-results/{test-dir}/error-context.md` |
| Visual appearance | Screenshot | `reports/test-results/{test-dir}/test-failed-1.png` |
| Full interaction replay | Execution trace | `reports/test-results/{test-dir}/trace.zip` |
| Console errors | Console log entries | `reports/failure-summary.json` → consoleErrors[] |
| Network failures | Request log | `reports/failure-summary.json` → networkFailures[] |
| Auth flow | OAuth chain | `reports/failure-summary.json` → authChain[] |
| Test step that failed | Error stack trace | `reports/failure-summary.json` → fullError |
| App URL at failure | Page URL | `reports/failure-summary.json` → pageUrl |

### Mandatory Sequence (ALL agents — no shortcuts)

```
STEP 1: READ failure-summary.json
  → Extract: failureCategory, testName, selector, pageUrl, fullError
  → Extract: consoleErrors[], networkFailures[], authChain[]
  → ROUTE by category:
    AUTH → check authChain[] → likely SSO/token issue → escalate
    NETWORK → check networkFailures[] → API down or CORS → document
    SELECTOR → proceed to Step 2
    TIMING → proceed to Step 2
    DATA → check expected vs received in fullError → likely test data wrong
    APPLICATION → check consoleErrors[] → uncaught exception
    INFRASTRUCTURE → browser crashed → retry once, then escalate

STEP 2: READ error-context.md (for SELECTOR/TIMING failures)
  → This is the accessibility snapshot at failure time
  → Search for the failing selector/element in the snapshot
  → If element EXISTS in snapshot → TIMING issue (element appeared but test didn't wait)
  → If element MISSING from snapshot → SELECTOR issue (wrong selector or element not rendered)
  → If OVERLAY/DIALOG visible in snapshot → something blocking the element (dialog, modal, loading)

STEP 3: READ screenshot (test-failed-1.png)
  → Visual confirmation of app state
  → Look for: unexpected dialogs, error messages, loading spinners, wrong page

STEP 4: IDENTIFY the failing spec line
  → From fullError, extract file:line
  → Read that line in the spec
  → Trace: what page object method was called? What selector does it use?
  → Read the page object method code

STEP 5: FORM HYPOTHESIS (with evidence citations)
  → "The failure is [CATEGORY] because [evidence from Steps 1-4]"
  → Example: "SELECTOR failure: error-context.md shows alertdialog overlay (line 1113)
    blocking pointer events to the checkbox. The Save dialog appeared but clickSave()
    doesn't handle it."
  → Cite specific line numbers and file names

STEP 6: REPLICATE ON MCP (ONLY if Steps 1-5 are inconclusive)
  → Navigate to pageUrl from failure-summary.json
  → Execute the same steps the spec was doing (read from spec code)
  → Observe: does the element exist? What's the actual DOM structure?
  → Use browser_evaluate to test the exact CSS selector

STEP 7: FIX
  → Apply the fix based on confirmed root cause
  → Run ONLY the failing test: --grep "TC-ID" --project=chrome --headed
  → If fix works → run full spec for regression check
  → If fix fails with SAME error → one more attempt (max 2 per failure)
  → If fix fails with DIFFERENT error → new RCA from Step 1
```

### What Makes This Different from Current §15

| Current §15 | New Protocol |
|-------------|-------------|
| 13-item checklist, any 10/13 | 7-step sequence, mandatory order |
| "Open screenshotPath" (generic) | "Read error-context.md" (specific — accessibility snapshot) |
| MCP replication is Step 6 of 13 | MCP replication is LAST RESORT (Step 6 of 7) |
| "Write evidence checklist" (format undefined) | Hypothesis with evidence citations (file:line) |
| No distinction between failure categories | Route by category at Step 1 — AUTH/NETWORK skip to escalate |
| No mention of trace.zip | Step 3 includes screenshot, trace available if needed |
| "10/13 rows checked" (vague gate) | All steps 1-5 mandatory, Step 6 only if inconclusive |

### RCA for Planner (Selector Verification)

When planner needs to verify a selector works:

```
1. Navigate to the page via MCP
2. Use browser_evaluate to test the EXACT CSS selector:
   document.querySelector('your-selector-here')
3. If null → the selector is wrong. Inspect the actual DOM structure
4. Use browser_evaluate to find what element DOES exist:
   document.querySelectorAll('button[role="checkbox"]').length
5. Build selector from actual DOM, not from assumptions about HTML structure
6. NEVER copy selector patterns from other tabs/pages — each page can use different components
```

### RCA for Healer (Test Healing)

Same 7-step sequence, plus:
```
- After Step 4: Check if the fix is a selector change, timing change, or test logic change
- Selector change → verify new selector via browser_evaluate on MCP
- Timing change → add explicit wait, not just timeout increase
- Test logic change → verify against test case document (was the TC wrong or the spec?)
```

---

## Failure Artifact Locations (Quick Reference)

```
reports/
├── failure-summary.json          ← STRUCTURED: category, selector, errors, URL
├── test-results/
│   └── {test-name-slug}-{browser}/
│       ├── error-context.md      ← ACCESSIBILITY SNAPSHOT at failure
│       ├── test-failed-1.png     ← SCREENSHOT at failure
│       └── trace.zip             ← FULL EXECUTION TRACE (open with: npx playwright show-trace)
├── html-report/
│   └── index.html                ← INTERACTIVE: open in browser for visual debugging
└── logs/
    └── {spec-name}/
        └── test-execution.log    ← FRAMEWORK LOGS: all Log.info/error calls
```

---

<!-- SURGICAL EDIT 2026-03-03 by Copilot — Added Self-Unblocking Map + MCP/terminal warning
     WHY (Self-Unblocking Map):
       User concern: "agents need to know how to use the data available in the repo to help themselves.
       agents must be aware of what things to find and where to find and when should they search."
       Current state: §8 Step 5 says "search agent-mistakes.md" but no structured lookup table exists.
       Agents don't know WHERE to find info for non-failure blocks (unknown UI patterns, missing
       selectors, unfamiliar page structure during code writing or exploration — not just test failures).
       Reviewer 2 caught: this map was originally scoped to PLAN_03 (RCA = failures only), but agents
       get stuck during Phase 0/1 code writing and exploration too. Fixed by cross-referencing this
       section from PLAN_01 Step 1 and PLAN_02 Phase 0.3 so all agents can find it.
       NOTE: agent-learnings.md is an EMPTY STUB (all learnings merged into agent-mistakes.md
       Resolution column during 2026-03 audit). Do NOT reference it as a primary source.
     WHY (MCP/terminal warning):
       User reported MCP server dying repeatedly (exit code 4294967295). Root cause is concurrent
       npx playwright test + MCP browser sharing Playwright infrastructure. Step 6 (MCP replication)
       is exactly where agents would do this — run test, see it fail, jump to MCP while test is still
       running. Warning placed here to catch them at the moment of the mistake. -->

## Self-Unblocking Map — When Stuck, Search Here

**Referenced by**: PLAN_01 Step 1 (planner), PLAN_02 Phase 0.3 (generator), ALL-025 rule

This map applies to ALL agents, not just during test failure RCA. If you're stuck during exploration, code writing, selector discovery, or any other phase — use this table.

| Stuck On | Search What | Where | When | Example Search |
|----------|-------------|-------|------|----------------|
| Unknown selector / element not found | SELECTOR_CATALOG.md first, then partition files | `src/selectors/SELECTOR_CATALOG.md` | Before writing ANY new selector | `grep -r "btnSave" src/selectors/` |
| UI pattern unknown (Radix, date picker, combobox) | Existing page objects that handle same component | `src/pages/`, `src/common/base-page.ts` | Before creating new page object method | `grep -r "role=\"checkbox\"" src/pages/` |
| Same failure repeating after fix attempt | Resolution column in agent-mistakes.md (canonical source — agent-learnings.md is empty stub) | `specs_planning/agent-mistakes.md` | After first failed fix attempt | `grep "SELECTOR" specs_planning/agent-mistakes.md` |
| Auth/login issues | authChain in failure-summary, env files | `reports/failure-summary.json`, `config/environments/` | When tests fail with auth errors | `cat reports/failure-summary.json \| grep authChain` |
| Don't know what methods exist | BasePage method list + existing page objects | `src/common/base-page.ts`, `docs/read_only_docs/ARCHITECTURE.md` | Before writing ANY new method | `grep "async.*(" src/common/base-page.ts` |
| Test case seems wrong vs live app | Truth hierarchy: MCP > all docs. Report via GEN-021 mechanism | `docs/REQUIREMENTS.md` then MCP session | When spec assertion fails but app looks correct | Navigate MCP to same URL, verify DOM |
| Don't know fixture/helper exists | Fixture definitions + test setup | `tests/setup/fixtures.ts`, `src/index.ts` | Before creating test setup code | `grep "test.extend" tests/setup/fixtures.ts` |
| Previous agent output seems incomplete | Queue item history + activity log | `specs_planning/agent-queue.json`, `specs_planning/agent-activity-log.md` | When inheriting work from previous stage | Read queue item's `history` array |
| Spec-level pattern already exists | Existing spec files for same setup/assertion | `tests/specs/**/*.spec.ts` | Before writing beforeEach or repeated assertions | `grep -r "navigateTo.*Tab" tests/specs/` |

---

## MCP Replication Warning (applies to Step 6 of RCA)

> **WARNING**: When using MCP for Step 6 replication, do NOT have a concurrent `npx playwright test` running in terminal. The test runner and MCP server share the same Playwright infrastructure — concurrent use causes MCP server exit code 4294967295 (forcible process termination). **Workflow**: Run your targeted `--grep` test FIRST → read the failure artifacts (Steps 1-5) → THEN go to MCP if needed. Never simultaneously.

---

## What This Fixes

| Before | After |
|--------|-------|
| Agent jumps to MCP for every failure | Agent reads existing artifacts first, MCP only as last resort |
| "RCA" means browsing randomly on MCP | 7-step sequence with mandatory order |
| No evidence citations in hypothesis | Every hypothesis cites file:line from artifacts |
| AUTH failures get same treatment as SELECTOR | Category-based routing at Step 1 |
| Agent can't "see" what user sees in headed mode | error-context.md = accessibility snapshot at failure moment |
| Trace files generated but never read | Explicit mention of trace.zip in protocol |
