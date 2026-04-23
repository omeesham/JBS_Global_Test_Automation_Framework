# Encore Framework — Claude Code Configuration

## 🧭 FIRST-STEP NAVIGATION (read BEFORE any exploration)

**Universal rule for every agent, every session, every task**: before you `grep`, open MCP, or read more than 1 file to understand a problem, consult **[.claude/context/navigation.md](.claude/context/navigation.md)**.

It answers:
1. **Has this surface been explored?** (§C Exploration Registry) — if yes, read the findings file instead of re-exploring.
2. **How do I solve common problem X?** (§B Routing Table) — proven helper / rule / file for every recurring task.
3. **What do I do when stuck?** (§D Stuck Protocol) — 2+ failed attempts = stop, check, ask.

At session end (via `/reflect`), update the registry if you explored new territory. Stale map = repeated mistakes.

---

## First-Time Setup (New Collaborators)

**On every session start**, TWO checks:
1. Check if `config/environments/.env.local` exists → if missing, new collaborator onboarding
2. **Identity check**: Auto-detected by skill Identity Gates. For non-skill pipeline work,
   `/identity` Step 1.6 detects from keywords. Manual `/identity` still available. OWNER is default.

### Step 1 — Create your agent identity
Ask: "What's your name?" Copy `.claude/agents/COLLEAGUE.agent.md` → `.claude/agents/<NAME>.agent.md`, replace all `<YOUR_NAME>` placeholders, commit + push.

### Step 2 — Credentials are pre-configured
Credentials are stored directly in `config/environments/.env.development` (committed to git).
No vault setup needed — clone and run.

### Step 3 — (Optional) Create `.env.local` for overrides
Only needed if you want to override defaults (e.g., different browser, timeouts).
```bash
cp config/environments/.env.example config/environments/.env.local
```

### Step 4 — Install Claude CLI
```bash
npm install -g @anthropic-ai/claude-code && claude login
```
Each person needs their own Claude subscription.

### Step 5 — Install deps + browsers
```bash
npm install && npx playwright install
```

### Step 6 — Verify
```bash
npm test -- --project=chrome tests/seed.spec.ts
```
Passes = Navigator Cloud credentials are working.

### Step 7 — Full stack (optional, for website/UI work)
```bash
cp config/environments/.env.server.example config/environments/.env.server
# Set ENCRYPTION_SECRET: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
cd website/frontend && npm install && cd ../..
cd website/backend && npm install && cd ../..
docker compose up -d && npm run server:start
```

### Security Rules
- `.env.local` and `.env.server` are gitignored (for personal overrides)
- Credentials are stored in plain text in `.env` files by design (clone-and-run)

---

## Skill Auto-Routing

When the user's message matches an intent pattern below, auto-invoke the corresponding skill.
If multiple intents match, use the FIRST matching rule. If the user explicitly names a skill (e.g., `/audit`), use that skill regardless of intent matching.

| Priority | Intent Pattern | Skill | Notes |
|----------|---------------|-------|-------|
| 0 | Session start with pipeline work, "/identity", "be the HUNTER/GIVER/etc", "switch identity" | `/identity` | Auto-detected by Identity Gates. Manual invoke shows menu. |
| 0.5 | "ultrathink", "ultra think", "ultrathink this" | `/ultrathink` | Quality-gated wrapper — fires before task routing |
| 1 | User explicitly says `/skillname` | That skill | Always highest priority |
| 2 | "RCA", "root cause", "why is this failing", "analyze failure" | `/rca` | Professional artifact-first root cause analysis |
| 3 | "fix bug", "broken", "not working", "error", "crash" | `/bugfix` | General bug fixing with root cause analysis |
| 4 | "deploy", "push to prod", "ship it", "go live" | `/deploy` | Full deployment pipeline |
| 5 | "clean up", "dead code", "remove unused", "orphaned" | `/cleanup` | Codebase hygiene |
| 6 | "review", "check this code", "code review", "PR" | `/review` | PR-style code review |
| 7 | "research", "best practices", "how do others" | `/research` | Multi-source web research |
| 8 | "audit", "find issues", "what's missing", "what broke" | `/audit` | Full-chain execution audit |
| 9 | "plan", "design", "how should we", "approach" | `/planning` | Rigorous plan creation |
| 10 | "run all plans", "execute pending", "chain", "autonomous", "chain status", "chain resume", "chain stop", "chain skip", "chain reset" | `/chain` | Per-session background chain orchestration (sub-commands dispatch) |
| 10.5 | "chain audit", "audit next done plan", "walk through done plans", "chain_audit", "audit plan execution" | `/chain_audit` | Linear single-session audit walker through `plans/done/` (one plan per invocation) |
| 11 | "execute", "implement", "build this", "do it" | `/execute` | Disciplined plan execution |
| 12 | "reflect", "what did we learn", "session end" | `/reflect` | Session retrospective |
| 13 | "compile learnings", "graduate patterns" | `/compile-learnings` | Pattern graduation |
| 14 | "questions", "ask me", "steering" | `/questionnaire` | Dynamic Q&A |
| 15 | "KT", "knowledge transfer", "share learnings" | `/share-kt` | Cross-repo KT |
| 16 | "find bugs", "QA", "break it", "stress test", "what could go wrong" | `/find-bugs` | Adversarial bug hunting |
| 17 | "check for regressions", "did anything break", "fingerprint" | `/regression-guard` | Structural before/after diff |
| 18 | Complex multi-step task, "what skills should I use", "check skills" | `/relevant` | Pre-task skill injection |
| 19 | "does this apply", "upgrade check", "check current work" | `/upgrade` | Self-referential improvement check |
| 20 | "use sonnet", "sonnet mode", "/sonnet" | `/sonnet` | Model-aware guardrails activation |

### Multi-Intent Resolution
If the user's message spans multiple intents (e.g., "fix the bug then deploy"):
1. Identify each intent in the order they appear
2. Chain the skills in that order
3. Use `/execute` as the orchestrator if a plan is involved

### Ambiguous Intent
If intent is unclear, DO NOT auto-route. Ask the user which skill applies, or answer directly if no skill is needed.

---

## Identity Enforcement

**Auto-detected**: Every non-leaf skill auto-calls `/identity` via Identity Gate as its first step.
The right identity is loaded from the Step 4 mapping table — no manual invocation needed.

**Priority Chain**: Explicit `/identity X` > Active+Compatible (skip) > Auto-Load Default

**Task-level fallback**: When no skill is matched, `/identity` Step 1.6 detects identity
from keywords in the user's message. OWNER is the safe default.

**Active identity constrains ALL actions**:
- File writes checked against §2 ownership (AGENT_SHARED_RULES.md)
- Tool usage checked against agent file frontmatter
- Rules filtered to agent's prefix + ALL-* + LR-*
- Self-audit checklist applies at task end and identity switch

**Override**: User says "override" for single-action file ownership bypass (logged).

**Codenames**: HUNTER | GIVER | BUILDER | HEALER | WATCHDOG | GARDENER | OWNER

---

## Model-Aware Guardrails

**Sonnet task boundaries** — same HALT mechanism as /identity file ownership:
- **[HALT]** Sonnet + MCP browser tools = BLOCKED. Write handoff note, skip step.
- **[HALT]** Sonnet + RCA/debugging/hypothesis = BLOCKED. Flag with [?], skip step.
- **SAFE**: Page objects, specs, test data, selectors, docs (deterministic file edits).
- Plans tag steps [SONNET-SAFE] or [OPUS-ONLY]. Sonnet skips [OPUS-ONLY] with handoff.

**Activation**: `/sonnet` or "sonnet mode". **Deactivation**: `/sonnet off`.
Full guardrails (checklists, breadcrumbs, handoff format): see `/sonnet` SKILL.md.

---

## Skill Dependency Graph (Auto-Calls)

```
/identity (universal gate — auto-called by all non-leaf skills as first step)

/planning ──auto-calls──> /identity, /research
/execute  ──auto-calls──> /identity, /relevant (Phase 0.5), /regression-guard (before+after), /reflect
/bugfix   ──auto-calls──> /identity, /regression-guard (before+after), /reflect
/cleanup  ──auto-calls──> /identity, /regression-guard (before+after)
/deploy   ──auto-calls──> /identity, /regression-guard, /review
/chain    ──auto-calls──> /identity
/chain    spawns per-subplan ──> `claude -p "/execute SP.md"` (background sessions; each runs /regression-guard, /reflect, /final-q per LR-041 frontmatter)
/chain_audit ──auto-calls──> /identity, /audit (per invocation, scoped to one done plan)
/ultrathink ──auto-calls──> /identity, /planning, /execute, /audit, /reflect
/audit    ──auto-calls──> /identity, /reflect
/rca      ──auto-calls──> /identity
/review   ──auto-calls──> /identity
/find-bugs──auto-calls──> /identity
/compile-learnings ──auto-calls──> /identity
/research ──auto-calls──> /identity
/share-kt ──auto-calls──> /identity

Leaf skills (inherit parent identity, no /identity auto-call):
  /reflect, /regression-guard, /questionnaire

Utility skills (no auto-calls, available to all identities):
  /relevant, /upgrade, /sonnet
```

No circular dependencies. `/identity` is always a leaf — it never auto-calls other skills.
`/upgrade` is embedded as a step within `/reflect` (Step 4.5) and `/compile-learnings` — not auto-called.

---

## Learned Rules

_Graduated from PLAN_53 chain audit (2026-03-20). 25 bugs found, 6 patterns extracted._

**Framework-level rules only.** Client-specific rules (naming client product surfaces, business validations, or client-specific URL patterns) live in `clients/${ACTIVE_CLIENT}/CLAUDE.md` — for Encore, that's `clients/encore/CLAUDE.md`.

**Numbering convention**: existing `LR-NNN` numbers are grandfathered; new framework rules continue `LR-038`, `LR-039`, … ; new client-specific rules use `LR-ENC-NNN` (or `LR-{CLIENT}-NNN` for other clients) to prevent collision. When looking up any `LR-NNN` reference, check both this file and `clients/${ACTIVE_CLIENT}/CLAUDE.md`.

### LR-001: Verify function signatures before calling (3+ occurrences)
Before calling ANY function from another module: read its actual signature (params, types, return).
Never assume from the plan or memory. Wrong param = wrong data = silent corruption.
**Trigger**: Any plan that calls functions across files.

### LR-002: Catalog ↔ Implementation parity (1 occurrence, CRITICAL)
When adding entries to a catalog/registry/config (ACTION_CATALOG, route tables, SSE events):
MUST add corresponding implementation (case handler, route handler, event listener).
Catalog entry without implementation = advertised but broken feature.
**Trigger**: Any addition to lookup tables, switch statements, event maps.

### LR-003: No empty catch blocks (4+ occurrences)
FORBIDDEN: `catch { }`, `catch(() => {})`, `catch { /* ignore */ }`.
Every catch MUST: (1) re-throw, (2) set error state for UI, or (3) log + documented fallback.
Silent swallowing hides failures users can't diagnose.
**Trigger**: Every try/catch in new code.

### LR-004: React cleanup audit (1 occurrence)
Every setInterval, setTimeout, addEventListener, EventSource in React:
verify cleanup in useEffect return / useRef. No cleanup = memory leak.
**Trigger**: Any React component using timers/listeners/subscriptions.

### LR-005: useCallback/useEffect dependency audit (2 occurrences)
Before finalizing React hooks: verify every variable referenced in the body
is either (a) in the dependency array, or (b) accessed via useRef.
Stale closure = renders with old data = invisible bugs.
**Trigger**: Any useCallback, useMemo, useEffect in new code.

### LR-006: Validate external data structure before access (1 occurrence, CRITICAL)
Before accessing nested properties on data from APIs, files, or DB:
check structure exists first. Use optional chaining + fallback.
Never assume shape from plan/memory — the source may have changed format.
**Trigger**: Any code parsing API responses, file reads, or DB JSONB.

### LR-007: MCP-verify ALL planner claims before writing spec code (Generator Phase 0.5)
Before writing ANY test assertion, verify the planner's claim on the live DOM.
Planner says "Save dialog shows X"? Click Save on MCP and read the actual dialog.
Planner says "value X triggers validation"? Type X on MCP and check aria-invalid.
Never trust planner data without live verification. The planner is OFTEN wrong.
Even Opus skipped this step and it caused 5 of 8 generator failures.
**Trigger**: Every generator session start. Enforced by PF-G5 gate.

### LR-009: Angular form dirty tracking — never test recovery to original value
When testing "error recovery" (invalid → valid), the recovery value must be
DIFFERENT from the server-saved value. Restoring to the original value makes
Angular detect "no net change" → Save stays disabled → test fails with correct app behavior.
Example: Delivery default=0, invalid=-5, recovery=-1 (NOT 0).
**Trigger**: Any test that validates Save button enables after correcting an error.

### LR-010: Cross-field validation is ALWAYS async — use expect.poll
Angular cross-field validators (e.g., a field that must be >= another field) fire asynchronously
after input events. Immediate getAttribute('aria-invalid') returns stale state.
Always use expect.poll(() => isFieldInvalid(key)) or the expectInvalid()/expectValid()
polling helpers from the page object. Same-field validation (e.g., "abc" in numeric) is synchronous.
**Trigger**: Any assertion on aria-invalid after changing a field with cross-field dependencies.

### LR-011: Reload after non-numeric input to clear Angular model corruption
Typing non-numeric values (e.g., "abc") into numeric Angular inputs corrupts the
internal model to NaN. Typing a valid value back does NOT reliably fix the model.
The ONLY safe cleanup is page reload (reloadBasicInfo or safeNavigateTo).
**Trigger**: Any test that enters non-numeric text into a numeric field.

### LR-013: Generator Phase 0.5 is MANDATORY — walkthrough before code
Generator MUST complete Phase 0.5 walkthrough as its FIRST action before writing
any spec code, page object, or test data. The pre-run gate (PF-G5) WILL halt on
retry if walkthrough is missing or invalid. On first run the gate warns — but
skipping Phase 0.5 guarantees failure. Even Opus skipped this and caused 47 spec
issues on local-office-settings (2026-03-24).
**Trigger**: Every generator session start. Enforced by PF-G5 gate.

### LR-014: FIELD INVENTORY testid column must be complete
Every row in planner's FIELD INVENTORY must have a non-empty data-testid value
or explicit fallback strategy "(no testid — use aria-label/text)". Blank testid
cells cause generator to guess selectors → spec failures. Planner rule PLN-039.
**Trigger**: Every planner session producing FIELD INVENTORY.

### LR-015: Default values and states come from dated MCP sessions only
Default field values, enabled/disabled states, and dropdown option lists must come
from a DOM read on a dated MCP session. The FIELD INVENTORY date is the timestamp.
Structural counts (tab count, column headers) must match FIELD INVENTORY but don't
need separate tags. Never hardcode a server-data value without MCP proof.
**Trigger**: Any test data constant or assertion on default state.

### LR-016: Accessibility tree element types do NOT match actual HTML tags
The Playwright accessibility tree reports `img` for SVG elements, `row` for `<tr>`,
`cell` for `<td>`, etc. NEVER derive CSS selectors from accessibility tree element types.
Always verify actual HTML tag via `browser_evaluate(() => el.tagName)` before writing
selectors like `svg`, `img`, `tr`, `td`. The accessibility tree is for FINDING elements,
not for understanding their DOM structure.
**Trigger**: Any Phase 0.5 walkthrough or healer session examining DOM structure.

### LR-018: Spec-fixing workflow — run-all is the only truth
When fixing failing specs, follow this exact order:
1. Run ALL specs together → identify failures
2. Run each failing spec INDIVIDUALLY → classify as "run-all only" vs "always fails"
3. Fix "always fails" specs first (selector, logic, timeout issues)
4. Run fixed specs individually → confirm fix
5. Run ALL specs together again → check for serial contamination
6. If spec passes individually but fails in run-all → RCA is serial state, timing, or auth
7. Iterate until run-all is green
**Trigger**: Any spec-fixing session. Enforced by healer/maintainer agents.

### LR-019: First test in describe.serial MUST enforce baseline state
The first test (TC-001) in any serial block must:
1. Navigate to the page fresh
2. Read current state from DOM (not assume defaults)
3. Reset any dirty state from prior runs (toggle checkboxes, clear fields)
4. Save if needed to persist clean baseline
5. Re-navigate to ensure clean state
Never hardcode expected initial values without baseline enforcement.
**Trigger**: Every new spec with describe.serial. Generator must implement.

### LR-020: Verify all plan claims against actual codebase before finalizing
Plans are artifacts — they drift from reality the moment they're written.
Before finalizing ANY plan: verify rule numbers (grep agent files for last PLN/REQ/ALL),
verify test counts (grep spec files for `test(`), verify file references exist,
verify cross-references between plans match current filenames.
Rule numbering collisions silently overwrite existing rules. Stale test counts
undermine the audit's credibility. Stale filenames break cross-plan traceability.
**Trigger**: Any plan that references rule numbers, test counts, or other plan filenames.

### LR-021: Un-skip before rewrite — always try original logic first
When fixing a skipped test, FIRST remove the skip and run the original test logic AS-IS.
If it passes, the underlying bug was fixed — keep the original assertions.
Only rewrite to "test actual behavior" if the original logic STILL fails.
This prevents unnecessary test rewrites and catches silently-fixed bugs.
**Trigger**: Any session that involves fixing skipped tests.

### LR-022: No hardcoded structural counts in assertions
Never assert exact counts of DOM elements (`.toBe(42)`, `.toHaveLength(114)`) unless
the count itself is the feature under test. These break on any UI addition/removal
without catching real bugs. Use content assertions (`.toContain()`), behavior assertions
(click → verify effect), or existence checks (`.toBeGreaterThan(0)`).
**Trigger**: Any test generation or review session.

### LR-023: No networkidle in Angular SPA — use waitForAngularStable + data signals
Never use `waitForLoadState('networkidle')` or `waitUntil: 'networkidle'` in Playwright
page objects for Angular apps. Angular's zone.js micro-tasks keep the network "active"
indefinitely or resolve prematurely between route change and API response.
Replace with: `waitForAngularStable()` (calls `getAllAngularTestabilities().whenStable()`)
for general stability, and poll for concrete data-loaded signals (dropdown text, grid
rows, checkbox aria-checked) for assertions that depend on API-persisted values.
For page reloads: `waitUntil: 'domcontentloaded'` + `waitForAngularStable()`.
**Trigger**: Any page object or spec that needs to wait for page/data readiness.

### LR-024: Clean artifacts and run fresh BEFORE any RCA — never diagnose from stale data
When fixing failing specs: (1) clean ALL artifacts (`npm run clean`, clear `.auth/`),
(2) run the spec fresh, (3) THEN RCA from the actual failure evidence.
Stale diagnostics accumulate from multiple prior runs and will lead to wrong root causes.
In this session: stale diagnostics said LGL-010 was an SSO reload issue. Fresh run showed
LGL-013 failed (Radix dropdown instability). Second fresh run showed LGL-010 failed with
the SAME Radix issue. The stale diagnostics were 100% wrong about the root cause.
**Corollary**: Run the failing spec TWICE before RCA to confirm the failure is consistent
and identify whether it's deterministic or intermittent (same test vs different test each time).
**Trigger**: Any spec-fixing session. Complements LR-018 workflow.

### LR-025: Radix UI large-option dropdowns need retry on option selection
Radix UI Select with many options (50+) auto-scrolls to the checked item on open.
Options above the scroll position become "not stable" (bounding box changing during
scroll animation) then "detached from DOM" (portal re-render). This is intermittent —
depends on timing, browser load, and how far the target option is from the checked one.
Fix pattern: wrap open+click in a retry loop (max 3). On failure: press Escape to close
the listbox, wait for hidden, re-open, `scrollIntoViewIfNeeded()`, then click.
Reduce per-attempt timeout (5s) so retries stay within total budget.
**Trigger**: Any combobox/select interaction with 50+ options in Radix UI.

### LR-026: Angular form dirty state is unreliable — always handle defensively
Angular's form dirty state (`FormControl.dirty`) does NOT reliably reset after save.
Three known manifestations:
1. **Save button disables but form stays dirty** — the app explicitly disables the button
   after save API completes, but doesn't call `markAsPristine()`. Navigating to another
   tab triggers "Unsaved changes" alertdialog even though save succeeded.
2. **Dirty state persists across test boundaries** — save cycle doesn't reset dirty tracking.
   Must reload page between tests that modify and save data.
3. **Net-zero changes not detected** — reverting to original value makes Angular detect
   "no net change" → Save stays disabled. Recovery values must differ from server-saved (see LR-009).
Fix patterns:
- After save: wait for button disabled (confirms API done) BUT don't assume form pristine
- Any tab navigation: check for `[role="alertdialog"]` and dismiss with "Discard" if visible
- Between serial tests that save: reload page to reset form state
- Recovery values must differ from the server-saved original
**Trigger**: Any test that saves data then navigates, or any serial test after a save.
**Graduated from**: LR-009 + Angular dirty-state manifestations observed across multiple spec sessions.

### LR-027: Plan finalization — execution summary MANDATORY before move to done/
When moving a plan from `plans/pending/` to `plans/done/`:
1. Update status field: `**Status**: DONE`
2. Add `**Executed**: YYYY-MM-DD` date
3. Write `### Execution Summary` section with:
   - TCs implemented (count + IDs)
   - TCs dropped (count + IDs + per-TC justification citing MCP finding)
   - MCP verification results (numbered, with outcome)
   - Documentation changes made
   - Test pass confirmation with date
4. If ANY planned TC is not implemented, it MUST have one of:
   - `NOT-AUTOMATABLE` — with MCP evidence why
   - `DEFERRED` — with reason and tracking reference
   - `APP BUG` — with documentation in REQUIREMENTS.md
   A TC with no justification = audit finding.
**Trigger**: Any plan movement from pending/ to done/.
**Graduated from**: WATCHDOG audit 2026-04-06 (F-002, F-003, F-004).

### LR-028: Session bookkeeping — activity log entry at session end
Before ending any session that modified pipeline artifacts (specs, page objects, selectors,
test data, test cases, test plans, REQUIREMENTS.md):
1. Append entry to `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-activity-log.md`
   Format: `| YYYY-MM-DDThh:mm | agent | done | file1, file2, ... | DESCRIPTION |`
2. If unexpected behaviors were discovered → write to `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md`
3. If MCP findings contradicted plan assumptions → update the plan's execution summary
Activity log is the audit trail. Missing entry = invisible session = audit finding.
**Trigger**: End of any session that touched pipeline files.
**Graduated from**: WATCHDOG audit 2026-04-06 (F-001).

### LR-029: Never audit selectors without live DOM verification
When auditing data-testid coverage or generating missing-testid reports:
NEVER audit selector files alone — always verify against the LIVE DOM via MCP.
Selector files show what WE USE, not what EXISTS in the app.
The app may have data-testids we never adopted, or testids may have been added since
we wrote our selectors. Auditing files without DOM = false positives = embarrassment.
Pattern: navigate to each page/tab, run `document.querySelectorAll('[data-testid]')`,
cross-reference against our selector values.
**Trigger**: Any task involving testid coverage analysis or bug reporting to external teams.
**Graduated from**: Session 2026-04-09 — 17 false positives found in MISSING_TESTID_REPORT.md.

### LR-030: Requirement contradiction = investigate as bug, never silently update docs
When live DOM contradicts a documented requirement:
1. Find the requirement's ORIGINAL SOURCE (Jira, spec docs, Functional Requirement .docx)
2. If source confirms the requirement is intentional → the DOM behavior is a potential APP BUG
3. TEST the discrepancy yourself via MCP (don't hand off "Steps to Replicate")
4. File bug report with evidence if confirmed
5. Only update docs AFTER completing investigation — and document the investigation trail
NEVER silently overwrite docs to match DOM. That destroys evidence of expected behavior.
ALL-024 says "DOM is truth" for conflict resolution, but it also says "STOP and report the
discrepancy." Both halves of that rule must be followed — observe AND report.
**Trigger**: Any MCP finding that contradicts REQUIREMENTS.md or plan expectations.
**Graduated from**: Copilot session audit 2026-04-10 — BillingCycle "disabled" overwritten to "enabled"
without investigating why the requirement existed. ALL-024 half-applied (DOM wins, but no report).

### LR-031: SKIP requires exhaustive investigation — no lazy escapes
Before marking ANY TC as SKIP or NOT-AUTOMATABLE:
1. Verify you ACTUALLY tested the precondition (not just read the current state)
2. If the plan says "when value = X" → change the value to X first, then test
3. If expected DOM change is missing → that's evidence of a BUG, not evidence of "untestable"
4. Clear the field / change state / click Save — test what happens when things go WRONG
5. Monitor network activity during any "nothing happens" scenario (hook fetch, check API calls)
6. File bug report if behavior contradicts documented requirements
7. SKIP is ONLY for genuinely untestable conditions AFTER exhausting ALL investigation paths
A TC skipped without trying the error condition = audit finding.
**Trigger**: Any TC being marked as SKIP or NOT-AUTOMATABLE.
**Graduated from**: Copilot session audit 2026-04-10 — TC-078 SKIP'd without changing BillingCycle
to "--Select--" (plan explicitly said to). TC-079 SKIP'd without clearing Oracle Product to test
save behavior. Both were lazy escapes that missed a confirmed UX/a11y bug (BUG-LI-001).

### LR-032: MCP agents must investigate, not theorize
When you have browser/MCP access:
- TEST hypotheses live instead of writing "Steps to Replicate" for the user
- Use network interception (`window.fetch` wrapper or `page.on('request')`) to distinguish
  "client blocked" vs "server rejected" vs "API error"
- 30 seconds of live testing > 30 lines of theory
- If you write "Steps to Replicate" while the browser is open on the page = you failed
**Trigger**: Any RCA or bug investigation while MCP browser is available.
**Graduated from**: Copilot session audit 2026-04-10 — had MCP browser open on exact page,
wrote theory document instead of clearing Oracle Product and clicking Save (30 seconds).
Rutvik had to test it manually and discover the silent no-op bug himself.

### LR-033: Network RCA checklist — always check API activity during debugging
When debugging ANY "nothing happens" or unexpected behavior:
1. **In test artifacts**: Read `failure-summary.json` → `networkFailures[]` array FIRST.
   - 5xx = APP BUG (file report, don't fix test code)
   - 4xx on auth URL = AUTH issue (escalate, not code fix)
   - 4xx on business API = bad test data OR app validation bug
   - Empty array + timeout = client-side blocking (form validation, JS error)
2. **In MCP live debugging**: Use `browser_network_requests` after every save/submit/navigation.
   Zero requests after button click = client blocked the action (Angular `if (!form.valid) return;`).
3. **Fetch interception** (for silent no-ops):
   ```javascript
   // Before the action:
   () => { window._apiCalls = []; const orig = window.fetch;
     window.fetch = (...a) => { window._apiCalls.push(a[0]); return orig(...a); }; }
   // After the action:
   () => window._apiCalls  // length 0 = no API fired
   ```
4. **HAR context**: DiagnosticsCollector captures 5 requests before/after each failure.
   When multiple APIs failed, the FIRST failure in the HAR window is the root cause.
5. **Auth chain**: `failure-summary.json.authChain[]` shows OAuth redirect sequence.
   Loop or 401 from auth provider = session expired, not test bug.
The framework captures ALL of this automatically via DiagnosticsCollector. USE IT.
**Trigger**: Any test failure, any "button does nothing" scenario, any save/submit investigation.
**Graduated from**: Copilot session audit 2026-04-10 — agent had MCP access but never checked
network activity during Oracle/Save investigation. Tooling existed (Grade A) but knowledge
transfer was Grade C — agents knew tools existed but had no procedural RCA path.

### LR-034: Bug Filing Protocol — how to confirm and file an app bug
When you suspect an application bug (not a test defect) during ANY work, follow these steps:

**Step 1 — Verify requirement exists**: Find the original source (REQUIREMENTS.md, Functional
Requirement .docx, Jira, spec docs). If no documented requirement, behavior may be intentional — ask user before filing.

**Step 2 — MCP-confirm the bug**: Reproduce on live DOM. Use `browser_network_requests` or fetch
interception to prove client-side vs server-side. Screenshot the evidence. MANDATORY — no bug filed on theory alone.

**Step 3 — Dedup check**: Scan `reports/bugs/BUG-*.json` for existing report on same module + same
symptom. If found, add new evidence to existing report instead of filing duplicate.

**Step 4 — Generate ID**: `BUG-{MODULE}-{NNN}` where MODULE = 2-3 letter code (e.g., LI=LocalInformation,
PRC=Pricing, SSL=SharedSetupLocations), NNN = next sequential number for that module.

**Step 5 — Write JSON** to `reports/bugs/BUG-{MODULE}-{NNN}.json`:
```json
{
  "id": "BUG-{MODULE}-{NNN}",
  "title": "one-line summary",
  "module": "MODULE_NAME",
  "severity": "critical|high|medium|low",
  "status": "open",
  "discoveredDate": "YYYY-MM-DD",
  "requirementSource": "doc name + specific binding/rule",
  "stepsToReproduce": ["step 1", "step 2"],
  "expectedBehavior": "what requirement says should happen",
  "actualBehavior": "what actually happens (with MCP evidence)",
  "mcpEvidence": { "sessionDate": "YYYY-MM-DD", "findings": "what MCP showed" },
  "affectedTests": ["TC-IDs — optional"],
  "networkEvidence": "API calls or lack thereof — optional"
}
```
Required: id, title, module, severity, status, discoveredDate, requirementSource,
stepsToReproduce, expectedBehavior, actualBehavior, mcpEvidence.

**Step 6 — Update affected specs**: Any TC blocked by this bug gets
`test.skip('bug-blocked: BUG-{MODULE}-{NNN}')`. Update FIXME comments to reference bug ID.

**Step 7 — Report to user**: Output bug summary in chat — bug ID, title, severity, requirement
source, MCP evidence summary.

**Trigger**: Any of the following during ANY agent work:
- DOM contradicts documented requirement (LR-030 fires first, LR-034 for the actual filing)
- "Nothing happens" on button click (LR-033 network check, LR-034 if confirmed app bug)
- Expected DOM change missing after action (LR-031 investigation, LR-034 if confirmed)
- Test failure classified as APPLICATION or DATA by failure-summary.json
**Graduated from**: Copilot session audit 2026-04-10 — LR-030/031/032/033 told agents to
investigate and file bugs but gave no procedural HOW. This fills the gap.

### LR-035: plans/INDEX.md is auto-generated — never hand-edit
`plans/INDEX.md` is regenerated from filesystem state by `scripts/plans-reindex.mjs`.
Any manual edits will be overwritten. To update the index:
1. Edit the plan's own `**Status**`, `**Created**`, `**Executed**`, `**Priority**`, `**Parent**` fields
2. Move files between `plans/pending/` and `plans/done/` as needed
3. Run `npm run plans:reindex` (or install the pre-commit hook: `npm run plans:hooks:install`)
CI/agents can gate on staleness with `npm run plans:reindex:check`.
**Trigger**: Any work that adds, completes, or reorganizes plan files.

### LR-037: Activity log timestamps must be ≥ referenced file mtimes — no backdating
Every row appended to `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-activity-log.md` must have a `When`
timestamp that is at or after the latest mtime (and git commit time, if tracked) of every
file listed in the `Files` column. Backdating a row — writing 09:00 at 14:32 for files
created at 14:32 — poisons every downstream gate that anchors on activity-log timestamps
(AUD-008 temporal anchoring, audit chain-of-custody).

Validation:
- `npm run validate:activity-log` — full report (noisy for historical rows; shared files
  like CLAUDE.md get legitimately touched later and appear as false positives)
- `npm run validate:activity-log:preflight` — `--latest-per-file --recent=5`, scoped to
  current-session additions; fails hard if the most recent rows are backdated
- Runs automatically as part of `npm run pipeline:preflight`
- Flags: `--recent=N` (last N rows), `--latest-per-file` (per-file scoping),
  `--baseline=YYYY-MM-DD`, `--json`

Tolerance: 1 minute. When appending a row, use the current wall clock at the moment of
the append, not the time work "started". If work was started earlier, say so in the notes.
**Trigger**: Any agent appending to agent-activity-log.md. Preflight enforces automatically.
**Graduated from**: Audit 2026-04-15 (expressive-booping-fountain F-003) — Copilot wrote
an SP3 row claiming 2026-04-14T09:00 while the referenced files have mtimes 14:32-20:47
(6-12 hour backdating). Baseline scan found 49 historical violations; new rows must validate clean.

### LR-038: Browser tool selection — Claude in Chrome vs Playwright MCP
When any session needs to interact with a live website (exploration, locator discovery,
MCP verification, bug investigation, catalog work, live DOM reads/clicks/saves), choose
the browser tool **before** first browser call. Announce the choice + reason in the first
output or activity-log row of the session.

**Gate 1 — Agent type**
- **Claude Code (Opus or Sonnet)** → continue to Gate 2. You can call `mcp__Claude_in_Chrome__*`.
- **Copilot / Cursor / other non-Claude AI** → use Playwright MCP. STOP here. You do NOT
  have Claude in Chrome tools. Do not pretend you do.
- **Self-check for Claude Code**: if you can see any `mcp__Claude_in_Chrome__*` tool in
  your tool list, Gate 1 passes.

**Gate 2 — Task classification (Claude Code only)**

Default: **Claude in Chrome** unless Playwright MCP criteria clearly apply.

Use **Claude in Chrome** when any of these apply:
- Exploratory / catalog / locator-discovery work (you are LEARNING the DOM, not running tests)
- Auth-heavy app (Microsoft SSO + TOTP — Claude in Chrome inherits the user's live Chrome session; Playwright MCP's profile cache is fragile, autonomous re-auth is essentially infeasible)
- You need `read_network_requests` to distinguish "client blocked" vs "server rejected" vs "API silently dropped" (per LR-033)
- Context budget is tight (read_page returns compact accessibility summary; browser_snapshot burns ~4k tokens per call and needs a fresh snapshot after every DOM mutation)
- Read-heavy DOM traversal (table extraction via javascript_tool, header enumeration, etc.)
- Live bug investigation — "what happens when I click X on the real app, right now"
- User is at the machine (can intervene if something unexpected happens; you can share the tab via tabs_create_mcp)

Use **Playwright MCP** when any of these apply:
- Long unattended CI-style run (no human nearby to intervene)
- Framework spec execution or anything driven by our `authenticatedSession` fixture — that runs under `npm test`, not MCP (so this criterion mostly excludes itself — if you're running our specs, you're not calling MCP tools at all)
- Determinism is critical (exact event timing, pixel-perfect reproducibility, no risk of user interference on shared tab)
- Multi-tab isolation with guarantee of no user interference
- Claude in Chrome is unavailable (extension not installed, tab closed, etc.) — fall-back mode

**Default for Claude Code when uncertain**: **Claude in Chrome**. It is cheaper in tokens, faster in iteration, and rides the user's live auth session. Switch to Playwright MCP only when a specific criterion above applies.

**Mandatory announcement** (accountability)
First output or activity-log row of any browser-interacting session must declare the
choice and the reason, e.g.:
> "Browser tool: Claude in Chrome. Reason: exploratory catalog, ≤15 fields, auth-heavy, user at machine."
> "Browser tool: Playwright MCP. Reason: unattended nightly run, no user available."

**Mid-session switch**: allowed. Log the switch + reason in activity-log notes.

**Trigger**: Every session whose plan or request involves any of:
- `/research` with a live-DOM phase
- `/rca` Phase 5 (MCP Replication)
- `/find-bugs` with live app interaction
- `/bugfix` when reproducing on live app
- Any subplan whose Skills field includes `/research` + MCP, or whose Step-by-Step involves "live DOM", "MCP session", "catalog", "locator discovery", "live verification"

**Graduated from**: Session 2026-04-20 — Claude Code agent executing SP-B-LO-1 defaulted to Playwright MCP, burned 4k-token `browser_snapshot`s per mutation, hit context pressure, and had to self-diagnose + switch mid-session. User directive: encode the selection logic at the framework layer so no future agent has to reactively decide.

### LR-040: Subplan closure completeness gate — every gap needs a concrete destination
`Status: DONE` on any catalog / discovery / MCP-driven subplan requires, for **every** planned item (parent, column, TC — whatever the subplan enumerates), one of:

(a) **Directly MCP-proven** — cited save-cycle timestamp + row diff in the Execution Summary.
(b) **Inference-classified** with a **grep-verifiable line item** in a named downstream subplan file that currently exists in `plans/pending/` or `plans/done/`. The agent MUST grep the recipient file for the specific item text before closing. "Scope-pushed to SP-X" without a grep-verifiable line item in SP-X's file = **phantom hand-off = audit finding**.
(c) **User-flagged** with a named bug-candidate ID (e.g., `PRC-BUG-C`) AND a "Pending decisions" entry in the gated SP-E-* subplan, OR marked as a **discussion-item** per `feedback_discussion_item_not_bug.md` (empty-everywhere + no-UI-path + no-Jira). Discussion-items do NOT need a bug ID — they need a named flag in the catalog + Execution Summary.

Labels like "TRACKED (by inference)" / "NOT-TRACKED (inferred)" / "scope-pushed" on their own are NOT sufficient — they must be backed by (b) or (c).

**HALT condition**: if ANY planned item cannot be classified into (a)/(b)/(c) at Status-flip time, HALT and ask the user. Do not flip Status on prose-only deferral. LR-027 guards the Execution Summary text; LR-040 guards the Status field itself.

**Why**: SP-B-LM-2 (2026-04-22) closed DONE with 4 gaps — 2 lazy-deferred but agent-doable in-session (Use-Eff-Dates + BUG-HIS-001 re-verify); 1 scope-pushed to SP-B-LM-3a/3b whose files contained zero mention of the handed-off work (phantom hand-off); 1 structurally-blocked discussion-item without a named flag. LR-027 passed on prose; LR-040 would have HALTed.

**How to apply** — at every catalog / discovery / MCP subplan's closure, BEFORE editing Status:
1. List every planned item.
2. For each, assign (a), (b), or (c).
3. For (b): grep the recipient file. Missing → add the line item there first, then close.
4. For (c): confirm the named flag / bug-ID / Pending-decision entry exists in the target file. Missing → add first.
5. Any item not (a)/(b)/(c) → HALT + ask user.

**Trigger**: every SP-B-*, SP-C-*, SP-D-*, and any future subplan whose Step-by-Step enumerates parents / columns / TCs.

**Graduated from**: SP-B-LM-2 (2026-04-22) premature-DONE incident. Tracked in `plans/done/PLAN_SP_B_LM_2_CLOSURE_AND_COMPLETENESS_GATE.md`.

### LR-041: Conservative model + thinking selection — every subplan declares Model + Thinking + PermissionMode
Per [PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md](plans/pending/PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md) §Model + Thinking Selection Rubric (D17/D18/D19). Every NEW subplan MUST declare in frontmatter:

- `**Model**: claude-opus-4-7` | `claude-sonnet-4-6`
- `**Thinking**: mid | hi | xhi | max` (authoring scale; maps 1:1 to CLI `--effort medium|high|xhigh|max`)
- `**PermissionMode**: auto | acceptEdits | bypassPermissions` (default `auto`)

**Allowed combinations** (forbidden → promote):
- **Sonnet**: `mid` (mechanical only — file moves, INDEX regen, tag rollouts; subplan body MUST justify) or `hi` (general default). FORBIDDEN: `lo` (under-thinks), `max` (silently clamps to `high` — authoring as `max` is wishful thinking).
- **Opus**: `hi` (low-complexity Opus), `xhi` (default for most Opus work), or `max` (RCA / closure gates / multi-rule judgment). FORBIDDEN: `lo`/`mid` (if `mid` is enough, the task is Sonnet `hi`).

**CLI version gate**: `xhigh` requires Claude Code v2.1.111+ (per `code.claude.com/docs/en/model-config`). On older CLI, chain-orchestrator clamps `xhi → high` at spawn with a log line. Run `claude update` to unlock Opus 4.7 `xhigh`. `bypassPermissions` requires `**RiskAcknowledged**: true` in frontmatter (orchestrator refuses otherwise per D26).

**Why**: user directive 2026-04-22 — "always better to burn budget of tokens via better models and think than save it and have trouble later debugging." Eliminates under-thinking on judgment-heavy tasks.

**How to apply** — at every `/planning` Step 3 validation:
1. Grep each new subplan for `**Model**:` / `**Thinking**:` / `**PermissionMode**:`. All three required.
2. Reject Sonnet `lo`/`max` and Opus `lo`/`mid` without a promote-to justification.
3. Sonnet `mid` and Opus `max` require a one-sentence justification in the subplan body.

**Trigger**: every new subplan authored via `/planning`. Enforced by `/planning` SKILL.md Step 3 checklist (D18).

**Graduated from**: PLAN_CHAIN_PER_SESSION_ORCHESTRATION D17/D18/D19 — chain orchestrator needs per-subplan model/effort/permission-mode; rubric lives at authoring time so runtime has a self-documenting source of truth.

### LR-042: Chain artifact discipline — /final-q mandatory + chain-sessions/* move only via /chain_audit GREEN
Two enforcement strands for headless chain execution. Both are structural (hooks / skill steps), not advisory.

**A. `/final-q` is non-skippable before any session ends.**

- `/execute` SKILL.md Phase 4 mandates `/final-q` as the final action — no prose summary, no "done" phrasing in place of it. The output MUST end with `## /final-q audit` heading + (within ~3000 chars) `**Verdict**: GREEN|YELLOW|RED`.
- `.claude/hooks/final-q-gate.sh` enforces the above via `.claude/hooks/lib/check-finalq-required.mjs`: if ANY file-modifying tool_use (Edit / Write / NotebookEdit / MultiEdit) appeared in the transcript AND no `/final-q` invocation is present (Skill tool_use, `/final-q` slash command, or `## /final-q audit` heading), the Stop hook blocks with a reminder. Mechanism (tool_use count), not phrase-matching — phrase lists missed "SP-XXX complete.", "done.", "✅", etc.
- Pure-chat sessions (zero mutations) are exempt. Trivial single-task sessions use `/final-q`'s own short-path, but still invoke `/final-q`.
- For chain-spawned children: without a parseable verdict, the chain orchestrator pauses with `verdict-NONE`. LR-042 eliminates that class of pause by guaranteeing emission at the authoring + execution + stop-hook layers.

**B. Chain-sessions artifacts move only via `/chain_audit` GREEN + explicit user approval.**

- The LIVE queue of headless runs lives in `.claude/state/chain-sessions/<plan>.log` (+ `.pid`), and their JSONL transcripts in `~/.claude/projects/c--Users-rutvi-projects-encore-framework/<uuid>.jsonl`. These are the "chain-spawned, human never saw them live" artifacts.
- The ONLY path that may move these files out is `/chain_audit` when it (a) verdicts GREEN AND (b) receives explicit user "yes" in the interactive chat. On that two-gate condition, the `.log`, the `.pid`, and the matching `~/.claude/projects` JSONL transcript all move to `.claude/state/chain-sessions-green/` (sibling of `chain-sessions/` and `chain-archive/`).
- YELLOW / RED → nothing moves; artifacts stay in `chain-sessions/` so the user can fix and re-audit.
- FORBIDDEN paths (no matter how tidy it looks):
  - manual `mv`/`rm` of `chain-sessions/*.log` or `.pid` (violated 2026-04-23 in this session → triggered this rule)
  - `/chain reset` touching `chain-sessions/` (reset archives `chain.json` only)
  - agent cleanup passes, `/cleanup` skill, end-of-session tidy-up
  - orchestrator hooks (`chain-orchestrator.sh` writes to chain-sessions, never moves out)

**Why**: the chain-sessions folder IS the audit queue. Pre-emptive archival destroys the queue. Only human-gated `/chain_audit` may approve removal, because only a human can confirm the headless run was actually correct.

**Trigger**:
- Any code path that touches `.claude/state/chain-sessions/*` → must be `/chain_audit` GREEN-approval path OR blocked.
- Any new `/execute` SKILL.md work must preserve Phase 4.
- Any new Stop hook or pre-stop skill must preserve the `final-q-gate.sh` behavior.

**Graduated from**: session 2026-04-23 — (1) SP-DQU-06 real-chain dry-run produced correct code but ended in prose (not `/final-q`), causing orchestrator to pause with verdict-NONE; (2) I manually `mv`'d `chain-sessions/` into `chain-archive/` during setup without any audit — classic "tidy up the queue" violation. Rule encodes both gaps so future sessions can't repeat either.
