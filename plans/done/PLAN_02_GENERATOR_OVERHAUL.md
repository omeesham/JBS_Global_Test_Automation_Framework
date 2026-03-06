# Plan 02: Generator Agent Overhaul

**Status**: DONE 2026-03-03 — Phase 0, Phase A RCA, Test Execution Rules added to generator prompt

**Core Identity: Generator = MOST IMPORTANT AGENT** — The generator is the production engine. It receives verified data from planner, one-shots spec creation, and uses artifact-first RCA when things fail. Every other agent exists to make generator's job easier.

**Problem**: Generator wastes hours going in circles — fake RCA, running full spec repeatedly, not reading failure artifacts, not knowing how to replicate failures efficiently.

**Root Cause**:
1. Generator receives garbage from planner (wrong selectors, wrong data) and has to rediscover everything
2. RCA protocol exists but generator doesn't follow it systematically — jumps to "fix" before understanding failure
3. Generator runs full spec file every time instead of just the failing test
4. Generator doesn't read traces/screenshots/error-context that Playwright already captures
5. No mandate to create a detailed plan before writing code

---

## Changes to Generator Prompt

### 1. Mandatory Pre-Execution Plan (NEW — before ANY code)

Add to Generator prompt as Phase 0 (before current Phase 1):

```markdown
## Phase 0: Detailed Execution Plan (MANDATORY)

Before writing ANY code, create a plan that covers:

### 0.1 Verify Planner's MCP Verification Log
- Read the test cases file's MCP_VERIFICATION_LOG section
- If it doesn't exist or is incomplete → STOP. Log: "Planner did not complete MCP verification. Cannot proceed." Set queue stage back to pending_planning
- Cross-check: Do the selectors in the selector file match the HTML structure documented in the log?

### 0.2 Map Test Cases to Implementation
For each TC, document:
- Which page object method(s) are needed
- Whether the method already exists in BasePage or needs creation
- Which selectors are used (verify they exist in index.ts)
- Expected assertion type (toEqual, toBeTruthy, toContain, etc.)

### 0.3 Identify Reusable Patterns
- Are there existing page objects with similar methods? (Search base-page.ts first)
- Are there data-driven opportunities? (3+ similar TCs = data array)
- Does clickSave() already exist with dialog handling?
- **If stuck on unfamiliar UI patterns**: consult the Self-Unblocking Map (PLAN_03 §Self-Unblocking) for where to search in the repo
- **Search existing specs** (tests/specs/**/*.spec.ts) for similar setup/assertion patterns before writing new ones (ALL-026)

### 0.4 Identify Risk Areas
- Date pickers (readOnly inputs, calendar popovers)
- Cascading checkboxes (state dependencies between fields)
- Save dialogs (confirmation required?)
- Grid interactions (scroll visibility, dynamic rows)

### 0.5 Write the Plan
Document the plan in a comment block at the top of the spec file (remove before final commit).
Get it right on paper before touching code.
```

### 2. Fix RCA to Use Existing Artifacts (Replace Current Phase A)

Current problem: Generator does "RCA" by running tests, seeing failures, then guessing. It ignores:
- `reports/test-results/{test-name}/error-context.md` — Playwright's failure snapshot
- `reports/test-results/{test-name}/test-failed-1.png` — screenshot at failure
- `reports/test-results/{test-name}/trace.zip` — full execution trace
- `reports/failure-summary.json` — structured failure data with category, selector, console errors

```markdown
## Phase A: RCA Protocol (on ANY test failure)

### Step 1: Read failure-summary.json (MANDATORY FIRST)
```
Get-Content reports/failure-summary.json | ConvertFrom-Json
```
Extract: testName, failureCategory, selector, pageUrl, consoleErrors, networkFailures, fullError

### Step 2: Read error-context.md for the failing test
```
Get-Content "reports/test-results/{test-dir}/error-context.md"
```
This contains the FULL accessibility snapshot at the moment of failure — the exact state of the app when the test broke.

### Step 3: Check screenshot
```
Read the test-failed-1.png screenshot from the test results directory
```
This shows exactly what the user would see at failure time.

### Step 4: Identify the Failing Line
From fullError, extract:
- Exact file + line number of the assertion/action that failed
- The spec test step that was executing
- The page object method that was called

### Step 5: Determine What the Test Was Trying to Do
Read the spec at the failing line. Trace back to understand:
- What state should the app be in?
- What action was attempted?
- What was expected vs what happened?

### Step 6: Replicate on MCP (ONLY if Steps 1-5 don't give root cause)
Navigate to the same URL shown in pageUrl.
Execute the same steps the test was doing (from spec code).
Observe: does the selector exist? Is the element visible? Is there an overlay?

### Step 7: Fix with Evidence
State the root cause citing evidence from Steps 1-6.
Make the fix.
Run ONLY the failing test: `npx playwright test --grep "TC-ID" --project=chrome --headed`

### NEVER:
- Skip Steps 1-5 and jump straight to MCP
- Run the full spec file during debug (use --grep)
- Declare a fix without evidence from failure artifacts
- Go in circles trying different fixes without understanding the root cause
```

### 3. Run ONLY Failing Tests (Enforce GEN-007/GEN-027)

Replace vague guidance with explicit commands:

<!-- SURGICAL EDIT 2026-03-03 by Copilot — Replaced naive "include TC-001" with full Dependency Analysis
     WHY: User concern: "agents are idiots, they run spec test number 23 directly without thinking
     what other previous tests are needed to achieve proper setup for the 23rd spec to run cleanly".
     Old text said "If the failing test depends on prior tests for navigation/state: Use this instead
     to run from TC-001 to the failing test" — this is too simplistic. A test at position 23 may need
     TC-001 (login) + TC-005 (tab nav) + TC-012 (state toggle), NOT everything from 001 to 023.
     Reviewer 2 caught: the old rule said "ALL prior tests" but the example cherry-picked 3.
     That's a direct contradiction. Fixed: minimum required dependency set.
     EVIDENCE: All 3 production specs use test.describe.serial. authenticatedSession fixture
     handles login at worker level, but tab navigation and state setup are done by prior tests.
     ALSO: Added MCP/terminal conflict warning per user's MCP crash concern. -->

```markdown
## Test Execution Rules

### Before Running --grep: Dependency Analysis (MANDATORY)

When you need to run a specific failing test (e.g., TC-023):
1. READ the full spec file top to bottom
2. Identify what test.beforeAll / test.beforeEach / authenticatedSession fixture does
3. Trace TC-023's dependencies: does it assume navigation done by a prior test?
   Does it assume state set by TC-005? Does it need tab setup from TC-001?
4. Build the --grep pattern to include ONLY the minimum required dependency tests:
   npx playwright test --grep "TC-001|TC-005|TC-023" --project=chrome --headed {spec}
5. If the spec uses test.describe.serial: identify which specific prior tests set up
   navigation or state needed by the failing test — don't include ALL prior tests,
   just the ones that matter
6. NEVER run a mid-spec test in isolation without reading the spec first

WRONG: --grep "TC-023"  (runs #23 in isolation, fails because page isn't navigated)
WRONG: --grep "TC-001|TC-023"  (includes login but misses TC-005 that sets up the tab)
RIGHT: Read spec -> identify TC-001 (nav+baseline), TC-005 (tab setup), TC-023 (target) ->
       --grep "TC-001|TC-005|TC-023"

### During development (Phase 1-2):
npx playwright test {spec} --project=chrome --headed
# Full run, one browser, observe behavior

### After first failure (Phase 3-4):
# Run dependency analysis above, then:
npx playwright test --grep "TC-LOC-PRI-001|TC-LOC-PRI-005|TC-LOC-PRI-020" --project=chrome --headed {spec}

### WARNING: Do NOT have npx playwright test running in terminal while using MCP browser.
### They share Playwright infrastructure — concurrent use causes MCP server exit code 4294967295.
### Run your --grep test FIRST, read the failure artifacts, THEN go to MCP if needed (not simultaneously).

### After fix verified on single test:
# Run full spec once to confirm no side effects:
npx playwright test {spec} --project=chrome --headed

### Final validation (all browsers):
npx playwright test {spec}
```

### 4. New GEN Rules to Add to agent-mistakes.md

```
| GEN-016 | Before writing any code, create Phase 0 execution plan. Verify planner's MCP verification log exists. Map TCs to methods. Identify reuse. Document risks. Plan on paper, then code | Pricing transcript: Generator started coding immediately, discovered all selector issues mid-flight, wasted hours |
| GEN-017 | RCA must read failure artifacts in order: failure-summary.json → error-context.md → screenshot → failing line → spec step → MCP replication (last resort only). Never skip to MCP without reading artifacts first | Pricing transcript: Generator ran 6+ MCP evaluation sessions for an issue that was visible in error-context.md (alert dialog overlay clearly shown in snapshot) |
| GEN-018 | Run ONLY failing tests during debug: `--grep "TC-ID"`. For serial blocks: READ the full spec first, trace which prior tests perform login/navigation/state setup, build minimum required dependency set as grep pattern. NEVER assume TC-001 alone is sufficient. Full spec run ONLY for final validation | Pricing transcript: Generator ran full 23-test spec 8+ times during debug. Each run = 1.3 minutes. Total wasted: 10+ minutes. Agents also ran TC-23 blind without prior setup tests |
| GEN-019 | Check if method already exists in BasePage before creating in page object. Check if similar page object already implements the pattern. Search-before-create is mandatory (ALL §1) | Pricing transcript: clickSave(), checkbox toggle, dropdown read — all duplicated from existing pages |
```

---

## What This Fixes

| Before | After |
|--------|-------|
| Generator starts coding immediately | Phase 0 plan catches issues before any code is written |
| RCA = random MCP browsing for hours | RCA reads structured artifacts first, MCP only as last resort |
| Full spec run every debug cycle (1.3min each) | `--grep "TC-ID"` runs single test (5-10 seconds) |
| Duplicated methods across page objects | Search-before-create finds existing implementations |
| Generator discovers planner's wrong selectors mid-flight | Phase 0 validates planner's MCP verification log first |
