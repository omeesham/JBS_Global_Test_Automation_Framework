---
name: rca
description: Professional Root Cause Analysis for test failures. Artifact-first, evidence-driven, no assumptions. Combines Kepner-Tregoe IS/IS-NOT, Fishbone categories, 5 Whys, and Playwright trace analysis. Use when tests fail and you need to understand WHY before fixing.
user-invocable: true
auto-calls: []
tools: Read, Glob, Grep, Bash, Agent, WebSearch
---

# /rca — Professional Root Cause Analysis

Systematic, evidence-driven root cause analysis for automated test failures. Combines industry-standard frameworks (Kepner-Tregoe IS/IS-NOT, Fishbone/Ishikawa, 5 Whys) with Playwright-specific artifact analysis.

**Core principle**: NO assumptions, NO blind patches, NO code edits until root cause is PROVEN with cited evidence.

## When to Use

**Identity**: OWNER, HEALER. Auto-loaded via Identity Gate.

- **Manual**: user says "RCA", "root cause", "why is this failing", "analyze this failure"
- Before any bug fix that involves test failures
- When a fix attempt failed and you need to restart analysis from scratch
- When MCP can't reproduce a failure (the delta between IS and IS-NOT is the clue)

## Anti-Patterns (NEVER do these)

- Jump to MCP before reading artifacts
- Apply a fix based solely on error message text
- Assume a root cause without citing artifact evidence
- Run full spec suite during debug (use --grep)
- Go in fix-rerun circles without understanding the cause
- Guess that "timing" or "flaky" is the cause without proving it

---

## Identity Gate
Runs `/identity` Step 1.5 with caller=`/rca`. No-op if compatible identity active.

## Phase 0: Collect Artifacts (READ ONLY — no edits, no MCP)

### Step 0.1: Read failure-summary.json
```
Extract ALL fields:
- testName, failureCategory, selector
- pageUrl, fullError (first 500 chars)
- consoleErrors (filter out favicon 404s)
- networkFailures (filter out favicon 404s)
- authChain, duration, lastActions
- workerIndex, retryAttempt
```

**Route by category:**
| Category | Next Step |
|----------|-----------|
| AUTH | Check authChain → escalate-tooling (NOT a code fix) |
| NETWORK | → Step 0.1b: Network RCA Procedure |
| INFRASTRUCTURE | escalate-tooling |
| SELECTOR/TIMING/ASSERTION/DATA/APPLICATION/BLOCKING | → Step 0.2 |

### Step 0.1b: Network RCA Procedure (when category = NETWORK or networkFailures non-empty)

**For each entry in `networkFailures[]`:**
1. Read `status`, `url`, `statusText`, `body` (first 2KB captured)
2. Classify:
   - **5xx** (500, 502, 503, 504) → **APP BUG**. File `reports/bugs/BUG-{MOD}-{NNN}.json`. Do NOT fix test code. Document and escalate.
   - **4xx on auth URL** (login.microsoftonline.com, b2clogin.com, oauth) → **AUTH issue**. Check `authChain[]` for redirect loop or token expiry. Escalate as infrastructure, not code fix.
   - **4xx on business API** (navigator API endpoints) → Check `body` for validation error message. Could be: bad test data (fix data), missing prerequisite state (fix test setup), OR app validation bug (file bug report).
   - **Empty `networkFailures[]` + test timed out** → **Client-side blocking**. The action never reached the API. Common cause: Angular form validation (`if (!form.valid) return;`). Check `error-context.md` for invalid fields, disabled buttons. On MCP: use fetch interception to prove zero API calls.

**For "button does nothing" scenarios (zero network activity):**
1. On MCP: inject fetch interceptor BEFORE clicking:
   ```javascript
   () => { window._apiCalls = []; const orig = window.fetch;
     window.fetch = (...a) => { window._apiCalls.push(a[0]); return orig(...a); }; }
   ```
2. Click the button, wait 2s
3. Read `window._apiCalls` — if length 0, client blocked the action
4. Check `form.valid` state: `document.querySelector('form')?.checkValidity()` or Angular-specific: check for `aria-invalid="true"` fields
5. This is likely a **UX bug** (button enabled but form invalid, zero feedback to user). File bug report.

**HAR context window**: DiagnosticsCollector captures 5 requests before/after each failure via `captureHar()`. When multiple APIs failed, the FIRST failure in the HAR window is the root cause — later failures may be cascading.

### Step 0.2: Read error-context.md
`reports/test-results/{test-slug}-{browser}/error-context.md`

This is a structured DOM analysis captured at the exact moment of failure. It contains page state, blocking elements (dialogs/overlays/alerts), selector existence checks, invalid fields, disabled buttons, and a raw DOM snapshot. Search for:
- **Failing selector/element**: Does it exist in the snapshot?
  - EXISTS → TIMING (appeared but test didn't wait) or BLOCKING (overlay/dialog)
  - MISSING → SELECTOR (wrong selector or element not rendered)
- **Unexpected elements**: alertdialog, overlay, loading spinner, error banner
- **Form state**: Are inputs populated? Are buttons enabled/disabled?

### Step 0.3: Read screenshot
`reports/test-results/{test-slug}-{browser}/test-failed-1.png`

Visual confirmation. Look for:
- Unexpected dialogs or modals
- Wrong page or tab
- Error messages in the UI
- Loading state that didn't complete

### Step 0.4: Open trace.zip (if available)
`npx playwright show-trace reports/test-results/{test-slug}-{browser}/trace.zip`

Or analyze programmatically:
- Compare Before/After DOM snapshots at the failing action
- Check network tab for failed API requests during the test
- Check console tab for JavaScript errors
- Identify the LAST SUCCESSFUL action before the failure

### Step 0.4b: Check video recording (TIMING/BLOCKING only)
`reports/test-results/{test-slug}-{browser}/video.webm`

If the failure is TIMING or BLOCKING, the video shows the exact visual sequence — flickering, race conditions, animations blocking interaction. Only retained on failure.

### Step 0.5: Read the failing spec code
From `fullError`, extract file:line → read spec at that line → trace to page object method → read method code.

Map: **What state should the app be in? What action was attempted? What was expected vs actual?**

### Supplementary Reads
- **Framework logs**: `logs/{spec-name}/test-execution.log` — page object actions with timestamps (checkbox states, button enabled/disabled, tab activations, save operations). Shows what the test *thought* it did.
- **Per-spec diagnostics**: `reports/diagnostics/{spec-name}.diagnostics.json` — contains ALL tests in the spec (not just failures). Useful for serial failure analysis: compare test N-1 state vs test N.

---

## Phase 1: IS / IS-NOT Analysis (Kepner-Tregoe)

This is the most powerful technique for narrowing root cause. Fill in this table:

| Dimension | IS (fails) | IS NOT (works) | Therefore... |
|-----------|-----------|----------------|--------------|
| **WHERE** (which test) | TC-XXX in serial block | TC-YYY in isolation | Serial state pollution |
| **WHERE** (which env) | Playwright run | MCP browser | Playwright-specific event handling |
| **WHEN** (timing) | After ECT-007 runs | On fresh page load | ECT-007 leaves dirty state |
| **WHEN** (frequency) | 3/3 runs | Never passes | Deterministic, not flaky |
| **WHAT** (symptom) | Click blocked by overlay | Selector not found | Overlay is the blocker |
| **WHAT** (scope) | Only labor cost input | All ECT inputs | Specific to this element |

**The root cause lives in the DELTA between IS and IS-NOT.**

If it fails in Playwright but not MCP → the cause is in how Playwright interacts differently (event types, timing, dialog handling).
If it fails after test X but not in isolation → test X leaves state that causes the failure.
If it fails 1/3 times → timing/race condition. If 3/3 → deterministic logic/state issue.

---

## Phase 2: Fishbone Categorization

When IS/IS-NOT doesn't immediately point to root cause, brainstorm using 6 categories adapted for test automation:

```
                    ┌── Method (test logic, assertion order, cleanup sequence)
                    ├── Machine (browser version, CI runner, memory pressure)
TEST FAILURE ───────├── Material (server data state, DB values, API responses)
                    ├── Measurement (selector accuracy, timing thresholds, poll intervals)
                    ├── Environment (auth tokens, network latency, feature flags)
                    └── Man (prior test state pollution, agent error, wrong assumption)
```

For each branch, ask: "Could this cause the observed IS/IS-NOT pattern?" If yes, check the artifact evidence.

---

## Phase 3: 5 Whys Drill-Down

Once you have a candidate cause from Phase 1 or 2, drill down:

```
Why did ECT-009 fail?
  → Click blocked by "Unsaved changes" alertdialog overlay

Why was the alertdialog present?
  → A prior test left the ECT form in dirty state

Why was the form dirty?
  → ECT-007 filled Benefits Multiplier with 0.21 then restored 0.2 without saving

Why didn't the cleanup clear the dirty state?
  → Angular tracks intermediate edits even when final value matches original

Why didn't the reload fix it?
  → reloadBasicInfo navigates to BAS tab, but navigateToEctTab clicks ECT tab
    which triggers the Radix dialog before the fresh page state loads
```

Stop when you reach a cause you can ACT on (code change, config change, or skip decision).

---

## Phase 4: Flaky vs Deterministic Classification

If initial RCA is inconclusive, run the failing test in isolation 3 times:
```bash
npx playwright test --grep "TC-ID" --project=chrome --headed --repeat-each=3
```

| Result | Classification | Next Step |
|--------|---------------|-----------|
| 0/3 pass | DETERMINISTIC | Logic/state bug — fix or skip |
| 1-2/3 pass | FLAKY | Timing/race — investigate async behavior |
| 3/3 pass | SERIAL_DEPENDENCY | Prior test pollutes state — investigate cleanup |

---

## Phase 5: MCP Replication (Category-Dependent)

| Failure Category | MCP Required? | When |
|-----------------|---------------|------|
| SELECTOR | MANDATORY | Before hypothesis |
| ASSERTION | MANDATORY | Before hypothesis |
| BLOCKING | RECOMMENDED | After IS/IS-NOT analysis |
| TIMING | RECOMMENDED | After hypothesis |
| APPLICATION | RECOMMENDED | After hypothesis |
| AUTH/NETWORK/INFRA | LAST RESORT | Only if Steps 0-4 inconclusive |

**MCP replication rules:**
1. READ the spec code FIRST — find the exact steps
2. Reproduce those EXACT steps on MCP (not random browsing)
3. Use `browser_evaluate` to test CSS selectors
4. Use `browser_network_requests` after failing steps
5. Document what MCP shows vs what the test sees (feeds back into IS/IS-NOT)

---

## Phase 6: Evidence Summary & Fix Decision

**App bug gate (LR-034)**: If root cause is APPLICATION or DATA (app defect, not test defect) — follow **LR-034 Bug Filing Protocol** to file to `reports/bugs/`. Do NOT fix test code for app bugs. Then proceed to Phase 7.

Write a structured RCA summary before ANY code edit:

```
## RCA: TC-XXX

### Classification
[SELECTOR | TIMING | ASSERTION | DATA | APPLICATION | AUTH | NETWORK | INFRA | BLOCKING]

### Evidence Chain
1. failure-summary.json: [specific field = specific value]
2. error-context.md: [specific element state]
3. screenshot: [visual observation]
4. trace.zip: [before/after diff]
5. spec code: [line N does X, expects Y]

### IS/IS-NOT
| IS | IS-NOT | Delta |
|----|--------|-------|
| [where/when/what it fails] | [where/when/what it works] | [the difference] |

### 5 Whys
1. Why? → [answer citing evidence]
2. Why? → [answer citing evidence]
3. Why? → [actionable root cause]

### Root Cause
[One sentence: "The failure is caused by X because Y (evidence: Z)"]

### Fix
[Specific code change OR skip decision with justification]
```

---

## Phase 7: Fix with Evidence

1. ONE fix mapped to proven root cause
2. Run ONLY the failing test: `--grep "TC-ID" --project=chrome --headed`
3. Pass → run the full serial block to check for regressions
4. Fail (different error) → mini Phase 0 (Steps 0.1-0.3 minimum)
5. Fail (same error) → one more fix cycle
6. Max 2 fix cycles. Then `test.skip()` with documented RCA + evidence

**Document every fix attempt** — even failed ones. The evidence accumulates.

---

## Quick Reference: 8 Failure Categories

| Category | Signature | Typical Fix |
|----------|-----------|-------------|
| SELECTOR | Element not found, locator timeout | Update selector, verify on DOM |
| TIMING | Element found but action failed, timeout on poll | Add expect.poll(), increase timeout |
| ASSERTION | Value mismatch (expected X, got Y) | Fix expected value or test logic |
| DATA | Server state doesn't match test assumption | Dynamic read or reload before test |
| APPLICATION | App error, console errors, broken UI | File app bug, skip test |
| AUTH | SSO failure, login timeout | Retry or escalate infra |
| NETWORK | API 4xx/5xx, net::ERR_ABORTED | Check API health, retry |
| BLOCKING | Click intercepted by overlay/dialog/spinner | Dismiss blocker or wait for it to clear |
| INFRASTRUCTURE | Browser crash, CI timeout, resource exhaustion | Escalate tooling |
