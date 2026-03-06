# Plan 07: Healer Agent Overhaul

**Status**: DONE 2026-03-03 -- all changes applied to healer agent file + agent-mistakes.md + sync pipeline run

**Core Identity: Healer = SPECIALIZED RCA DEBUGGER** — Healer debugs failing tests using the same artifact-first 7-step RCA as Generator. It reads failure data, forms hypotheses with evidence, and only goes to MCP as a last resort. It follows the EXACT steps from the spec code when replicating failures — no random browsing.

**Problem**: Healer has a "Two-Phase Debugging" protocol but it doesn't enforce artifact-first debugging. It jumps to MCP replication (Step 5) before reading error-context.md or screenshots. It doesn't use `--grep` for targeted test runs. It replicates failures by browsing randomly instead of following the spec's action sequence.

**Root Cause**:
1. Phase A Step 5 says "Replicate failure in MCP" — this is too early, should be last resort
2. No mandate to read error-context.md (the accessibility snapshot at failure time)
3. No mandate to identify the exact spec line that failed and trace to page object method
4. No targeted test execution — healer runs full spec or `test:failed` instead of `--grep "TC-ID"`
5. MCP replication is undirected — "reproduce the EXACT action sequence" but doesn't say to READ the spec code first

---

## Changes to Healer Prompt

### 1. Replace Phase A with Artifact-First 7-Step RCA

Current Phase A (diagnosis):
```
1. Read ALL failure-summary.json fields
2. Open screenshotPath — describe what you see
3. Read per-spec diagnostics
4. Search agent-learnings.md + agent-mistakes.md
5. Replicate failure in MCP    ← TOO EARLY
6. Evaluate selector in live DOM
7. Write evidence checklist
8. State hypothesis
```

**New Phase A** (same 7-step protocol as Generator in PLAN_02/PLAN_03):

```markdown
## Phase A: 7-Step RCA Protocol (NO code edits)

### Step 1: Read failure-summary.json (MANDATORY FIRST)
Extract: testName, failureCategory, selector, pageUrl, fullError, consoleErrors, networkFailures, authChain
ROUTE by category:
- AUTH → check authChain[] → escalate (not a code fix)
- NETWORK → check networkFailures[] → document (API issue)
- INFRASTRUCTURE → escalate
- SELECTOR/TIMING/ASSERTION/DATA/APPLICATION → proceed to Step 2

### Step 2: Read error-context.md
`reports/test-results/{test-dir}/error-context.md` — this is the ACCESSIBILITY SNAPSHOT at the moment of failure
- Search for the failing selector/element in the snapshot
- Element EXISTS → TIMING issue (element appeared but test didn't wait)
- Element MISSING → SELECTOR issue (wrong selector or not rendered)
- OVERLAY/DIALOG visible → something blocking the element (dialog, modal, loading spinner)

### Step 3: Read screenshot (test-failed-1.png)
Visual confirmation of app state. Look for: unexpected dialogs, error messages, loading spinners, wrong page

### Step 4: Identify the Failing Spec Line
From fullError, extract file:line → read the spec at that line → trace to page object method → read method code
Understand: what state should the app be in? What action was attempted? What was expected vs actual?

### Step 5: Form Hypothesis with Evidence Citations
"The failure is [CATEGORY] because [evidence from Steps 1-4]"
Example: "SELECTOR failure: error-context.md shows alertdialog overlay (line 1113) blocking pointer events. The Save dialog appeared but clickSave() doesn't handle it."
Cite specific file names and line numbers.

### Step 6: Replicate on MCP (LAST RESORT — ONLY if Steps 1-5 inconclusive)
- Navigate to pageUrl from failure-summary.json
- READ the spec code first — find the exact steps the test was executing
- Reproduce those EXACT steps on MCP (not random browsing)
- Use browser_evaluate to test the exact CSS selector
- Observe: does the element exist? What's the actual DOM structure?

### Step 7: Fix with Evidence
- Apply fix based on confirmed root cause
- Run ONLY the failing test: `--grep "TC-ID" --project=chrome --headed`
- Pass → done. Fail (same error) → one more fix attempt. Fail (different error) → new RCA from Step 1
- Max 2 fix cycles then remove test + report
```

### 2. Add Targeted Test Execution

Replace current test execution with specific commands:

<!-- SURGICAL EDIT 2026-03-03 by Copilot — Same Dependency Analysis fix as PLAN_02
     WHY: Identical problem. Healer's old text said "For serial blocks where failing test depends
     on prior tests" but just showed TC-001|TC-015 without explaining how to find the right deps.
     User concern: "agents are idiots, they run spec test number 23 directly without thinking
     what other previous tests are needed". Healer is the agent most likely to hit this — it
     inherits failing tests mid-spec and has no context about setup dependencies.
     ALSO: Added MCP/terminal conflict warning since Healer uses MCP replication (Step 6). -->

```markdown
## Test Execution Rules

### Before Running --grep: Dependency Analysis (MANDATORY)

When you need to run a specific failing test (e.g., TC-015):
1. READ the full spec file top to bottom
2. Identify what test.beforeAll / test.beforeEach / authenticatedSession fixture does
3. Trace TC-015's dependencies: does it assume navigation done by a prior test?
   Does it assume state set by TC-005? Does it need tab setup from TC-001?
4. Build the --grep pattern to include ONLY the minimum required dependency tests:
   npx playwright test --grep "TC-001|TC-005|TC-015" --project=chrome --headed {spec}
5. If the spec uses test.describe.serial: identify which specific prior tests set up
   navigation or state needed by the failing test — don't include ALL prior tests,
   just the ones that matter
6. NEVER run a mid-spec test in isolation without reading the spec first

WRONG: --grep "TC-015"  (runs #15 in isolation, fails because page isn't navigated)
WRONG: --grep "TC-001|TC-015"  (includes nav but misses TC-005 that sets up the tab)
RIGHT: Read spec -> identify TC-001 (nav+baseline), TC-005 (tab setup), TC-015 (target) ->
       --grep "TC-001|TC-005|TC-015"

### Initial discovery run:
npx playwright test {spec} --project=chrome --headed

### During fix loop (after first failure):
# Run dependency analysis above, then:
npx playwright test --grep "TC-LOC-CUR-001|TC-LOC-CUR-005|TC-LOC-CUR-015" --project=chrome --headed {spec}

### WARNING: Do NOT have npx playwright test running in terminal while using MCP browser.
### They share Playwright infrastructure — concurrent use causes MCP server exit code 4294967295.
### Run your --grep test FIRST, read the failure artifacts, THEN go to MCP if needed (not simultaneously).

### After fix verified on single test:
# Full spec once for regression check:
npx playwright test {spec} --project=chrome --headed
```

### 3. Add Failure Artifact Locations Reference

```markdown
## Failure Artifact Locations (Quick Reference)

reports/
├── failure-summary.json          ← STRUCTURED: category, selector, errors, URL
├── test-results/
│   └── {test-name-slug}-{browser}/
│       ├── error-context.md      ← ACCESSIBILITY SNAPSHOT at failure
│       ├── test-failed-1.png     ← SCREENSHOT at failure
│       └── trace.zip             ← FULL EXECUTION TRACE
├── html-report/
│   └── index.html                ← INTERACTIVE: open in browser
└── logs/
    └── {spec-name}/
        └── test-execution.log    ← FRAMEWORK LOGS
```

### 4. New HLR Rules to Add to agent-mistakes.md

```
| HLR-009 | Artifact-first RCA: read failure-summary.json → error-context.md → screenshot → failing line → spec step BEFORE any MCP replication. MCP is Step 6 (last resort). Same 7-step protocol as Generator | Generator's 7-step RCA protocol applies identically to Healer |
| HLR-010 | Targeted test runs: `--grep "TC-ID"` for single TC during fix loop. For serial blocks: READ the full spec first, identify minimum required dependency set (login, navigation, state setup tests), build grep pattern with ALL dependencies. NEVER assume TC-001 alone is sufficient. Full spec ONLY for final verification after all fixes | Same efficiency mandate as GEN-018. Updated: naive "include setup TC" replaced with full dependency analysis per reviewer feedback |
| HLR-011 | When replicating failures on MCP: follow the EXACT steps from the spec code (read the spec, find the failing action, reproduce that sequence). Don't browse randomly — replicate precisely what the test does | Generator and Healer both wasted hours on undirected MCP browsing instead of replicating spec steps |
```

---

## What This Fixes

| Before | After |
|--------|-------|
| Healer jumps to MCP at Step 5 | MCP is Step 6 (last resort) — read artifacts first |
| No mention of error-context.md | Step 2 reads accessibility snapshot at failure time |
| Undirected MCP browsing | Read spec code first, then replicate exact steps |
| Runs full spec or test:failed | `--grep "TC-ID"` for targeted single-test runs |
| No hypothesis with evidence citations | Step 5 requires citing file:line from artifacts |
| No failure artifact location guide | Quick reference for where every artifact lives |

---

## Implementation Steps

1. Replace Phase A in `playwright-test-healer.agent.md` with 7-Step RCA Protocol above
2. Add Test Execution Rules section after Phase B
3. Add Failure Artifact Locations reference
4. Add HLR-009, HLR-010, HLR-011 to `specs_planning/agent-mistakes.md`
5. Update NEVER DO table: add entries for HLR-014 (skip artifacts), HLR-015 (full spec during debug), HLR-016 (random MCP browsing)
6. Run `npm run sync:mistakes && npm run build:context && npm run validate:sync`
