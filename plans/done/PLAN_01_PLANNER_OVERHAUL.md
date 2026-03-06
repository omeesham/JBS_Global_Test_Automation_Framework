# Plan 01: Planner Agent Overhaul

**Status**: DONE 2026-03-03 — Full Manual QA Protocol added to planner, HUNTER identity added to requirements, Generator-Ready Package added to planner Queue Update

**Core Identity: Planner = GIVER** — Planner's entire purpose is to deliver a complete, MCP-verified package so Generator one-shots spec creation with minimal errors. Generator should NEVER discover DOM structure, selector patterns, save dialog behavior, or field values on its own. Planner provides everything.

**Problem**: Planner creates test cases without properly verifying the live app. Generator then discovers wrong selectors, wrong field counts, missing save dialogs, wrong dropdown values — all things the planner should have caught.

**Root Cause**: Planner's "Deep Exploration Protocol" says "click every field" but doesn't mandate:
1. Actually EDITING and SAVING each field
2. Documenting exact save dialog behavior
3. Documenting exact dropdown option values (not "any option")
4. Documenting exact checkbox cascade behavior
5. Verifying field counts match between DOM and test cases

**Evidence** (from generator transcript):
- `dt:has-text("Corporate Pricing")` selector — planner wrote it, DOM has NO `<dt>` elements on Pricing tab
- `~55 service type rows` — actual DOM has 75 rows (36% off)
- No TC for saving Corporate Pricing toggle state
- No TC for saving Price Guide Inclusive toggle state
- All 5 Primary Pricing dropdowns lumped into 1 generic TC ("select any option")
- Column header "Is Alternative" — actual DOM says "Is Alternate"

---

## Changes to Planner Prompt

### 1. Replace "Deep Exploration Protocol" with "Full Manual QA Protocol"

The planner must act EXACTLY like a manual QA tester. Not "explore" — TEST.

**New protocol** (replaces current Deep Exploration in planner prompt):

```markdown
## Full Manual QA Protocol (MANDATORY before writing ANY test case)

You are a manual QA tester. Before writing a single TC, you must:

### Step 1: Navigate and Document Page Structure
<!-- SURGICAL EDIT 2026-03-03 by Copilot — Added Jira/external data warning + self-unblocking ref
     WHY: User concern: "mcp session -> live website is greater truth than any test case/plans
     made from jira ticket description". Step 1 said "the initial prompt is a STARTING POINT" but
     never explicitly named Jira tickets. Reviewer 2 verified: word "Jira" appears zero times in
     PLAN_01. Protocol text is what agents read BEFORE work (not rules tables which apply post-failure).
     ALSO: Added self-unblocking map cross-ref per Reviewer 2: generators/planners get stuck during
     exploration, not just test failure debugging. Without this ref they won't find the map in PLAN_03. -->
- **Jira ticket descriptions, requirements documents, and test plans are starting points ONLY — live DOM is truth. These external sources may be wrong, incomplete, or outdated. Do NOT trust them blindly.**
- Navigate to the target page via MCP browser
- If stuck on unfamiliar UI patterns or unknown components, consult the Self-Unblocking Map (PLAN_03 §Self-Unblocking) for where to search in the repo
- Wait 5s for full load
- Take a browser_snapshot
- Count and list EVERY visible field, button, checkbox, dropdown, table, tab
- Document the EXACT HTML structure (dt/dd? div/span? table/tr/td?)
- Record the EXACT text of every label (not what you think it says — what the DOM says)

### Step 2: Test EVERY Editable Field (edit + save + verify persistence)
For EACH editable field on the page:
1. Record its current/default value
2. Change it to a new value (specific value, not "any")
3. Click Save
4. If a confirmation dialog appears: document its exact text, button labels, and selectors
5. After save completes: reload the page
6. Navigate back to the same field
7. Verify the new value persisted
8. Restore the original value and save again

### Step 3: Test EVERY Checkbox (3-scenario minimum)
For EACH checkbox:
1. Record default state (checked/unchecked, enabled/disabled)
2. Toggle it → observe what cascades (fields enable/disable, sections show/hide)
3. Save → reload → verify toggle state persisted
4. Toggle back → save → reload → verify restored

### Step 4: Test EVERY Dropdown (document all options)
For EACH dropdown:
1. Click to open it
2. Record ALL available options (exact text, not approximate)
3. Select a specific option
4. Save → reload → verify selection persisted
5. Restore original selection

### Step 5: Test Grid/Table Interactions
For EACH grid:
1. Count total rows (exact number, not approximate)
2. Document all column headers (exact text)
3. Test at least 1 row's interactive elements (checkboxes, date pickers, inputs)
4. Document cascade behavior (e.g., checking "Is Alternate" enables "Use Effective Dates")

### Step 6: Document Save Flow
- Click Save button → document EXACT dialog that appears
- Record: dialog heading, body text, button labels, selector paths
- If NO dialog appears, document that too
- Test both Save success and Save validation failure scenarios

### Output Format
After completing Steps 1-6, create a MCP_VERIFICATION_LOG section at the top of the test cases file:
```
## MCP Verification Log
- Date: YYYY-MM-DD
- URL: [exact URL visited]
- Office/Entity: [ID used]
- Total fields found: N
- Total fields tested (edit+save): N
- Save dialog: [Yes/No] — "[exact dialog text]"
- Column headers: ["exact", "text", "from", "DOM"]
- Dropdown options: { fieldName: ["option1", "option2", ...] }
- Cascade behaviors: { trigger: "effect description" }
```

### Gate: Do NOT write test cases until Steps 1-6 are complete
If any field cannot be tested (disabled, blocked, CORS), document it as:
`Status: Blocked (Cat-A: [reason])` — do NOT silently skip it.
```

### 2. New PLN Rules to Add to agent-mistakes.md

```
| PLN-018 | Every editable field must have a dedicated save+persist TC. "Lumping" 5 fields into 1 generic TC is forbidden. Each field = its own TC with specific value to select/enter, save, reload, verify | Generator RCA: All 5 Primary Pricing dropdowns were 1 TC with "select any option" — generator had no idea what values exist |
| PLN-019 | Document exact save dialog behavior from MCP observation. Every page object's clickSave() depends on knowing whether a confirmation dialog appears and its exact structure | Generator RCA: clickSave() had comment "no confirmation dialog" — dialog exists, blocked all subsequent interactions |
<!-- SURGICAL EDIT 2026-03-03 by Copilot — Expanded PLN-020 to explicitly name Jira as non-authoritative.
     WHY: User concern was specifically about Jira ticket descriptions. Old wording only mentioned
     "requirements doc". Reviewer 2 flagged: "should explicitly say Jira = starting point". -->
| PLN-020 | Column headers, dropdown options, row counts must be EXACT from DOM — not approximate, not from requirements doc, not from Jira tickets, not from test plans. All external data sources are starting points only — DOM is truth. This includes Jira ticket descriptions — they are starting points, not source of truth | Generator RCA: "~55 rows" was actually 75 rows. "Is Alternative" was actually "Is Alternate". All from not reading DOM |
| PLN-021 | Selector HTML verification: before writing any selector, verify the actual HTML tag structure via browser_evaluate. Do NOT assume dt/dd, div/span, table/tr patterns from other tabs — each tab can use different component libraries | Generator RCA: Pricing tab uses Radix UI (div/span/button), not dt/dd like Local Info tab. ALL 8 selectors were wrong |
```

### 3. Planner Must Deliver "Generator-Ready Package"

When planner marks a queue item as `pending_generation`, the following must exist:

| Artifact | Content | Verified By |
|----------|---------|------------|
| Test cases file | All TCs with exact values, exact selectors, exact expected results | MCP_VERIFICATION_LOG at top |
| Test plan file | Matching scenario for every TC | PLN-006 sync check |
| Selector file | All selectors verified against live DOM HTML structure | browser_evaluate proof |
| MCP verification log | Every field tested: edit+save+reload+verify | Embedded in test cases file |
| Save dialog documentation | Exact dialog text, buttons, selectors — or "No dialog" | PLN-019 |
| Dropdown options | Complete list per dropdown from live DOM | browser_snapshot proof |
| Grid details | Exact row count, exact column headers, cascade behavior | browser_evaluate proof |

**If ANY of these are missing, the queue item stays at `pending_planning`.**

---

## Changes to Requirements Agent Prompt

### Requirements Agent = HUNTER, Not Verifier

The Requirements agent gets an initial prompt with data about the target page. That prompt is a STARTING POINT — it could be wrong, incomplete, or outdated. The agent's job is to:
1. **Take the prompt as a hint** — use it to know WHERE to look, not WHAT to find
2. **Hunt for EVERYTHING on the page** — every field, every button, every validation, every error, every dialog
3. **Document what the DOM actually shows** — not what the prompt says should be there
4. **Amplify the prompt's data** — find things the prompt didn't mention, correct things it got wrong

The Requirements agent explores the frontend like a manual QA tester encountering the page for the first time. It uses the prompt to navigate to the right place, then independently discovers and documents EVERYTHING.

Add to REQ rules:
```
| REQ-006 | Requirements agent is a HUNTER. The initial prompt is a STARTING POINT — explore everything on the page independently. Document every field, button, validation, error state, save dialog. Prompt data can be wrong — DOM is truth. Amplify, don't just verify | Planner received incomplete requirements → created incomplete TCs → generator re-discovered everything |
| REQ-007 | For every page/tab: click Save on MCP, document exact dialog behavior (heading, text, buttons, or "no dialog"). Every clickSave() depends on this | Pricing had undocumented Save Changes dialog → generator's clickSave() broke |
| REQ-008 | For every dropdown: open and document ALL options. For every checkbox: toggle and document cascades. For every grid: count exact rows and columns. Approximations NEVER acceptable | "~55 rows" was 75. "Is Alternative" was "Is Alternate" |
| REQ-009 | Verify HTML tag structure for form elements: is it dt/dd? div/span? table/tr? Different tabs can use different component libraries on the same app. Document the actual structure so selectors are correct | Pricing tab uses Radix (div/span/button), Local Info uses dt/dd — all selectors wrong |
```

---

## What This Fixes

| Before | After |
|--------|-------|
| Planner writes selectors from assumptions | Planner verifies HTML structure via browser_evaluate |
| Planner approximates row counts | Planner counts exact rows via DOM evaluation |
| 5 fields lumped in 1 TC with "any option" | 5 separate TCs with exact dropdown values |
| No save dialog documentation | Every save flow documented from MCP observation |
| Generator re-discovers everything via MCP | Generator builds from verified data, MCP only for debugging |
| Column headers guessed from requirements | Column headers taken from live DOM |
