# Encore Framework — Claude Code Configuration

## First-Time Setup (New Collaborators)

**On every session start**, TWO checks:
1. Check if `config/environments/.env.local` exists → if missing, new collaborator onboarding
2. **Identity check**: If the user's request involves pipeline work (requirements, test planning,
   spec generation, test healing, auditing, or maintenance), invoke `/identity` to adopt the
   correct agent persona BEFORE starting. For general framework work, auto-adopt OWNER identity.

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
| 0 | Session start with pipeline work, "/identity", "be the HUNTER/GIVER/etc", "switch identity" | `/identity` | MUST run before pipeline work. Auto-OWNER for general tasks |
| 1 | User explicitly says `/skillname` | That skill | Always highest priority |
| 2 | "RCA", "root cause", "why is this failing", "analyze failure" | `/rca` | Professional artifact-first root cause analysis |
| 3 | "fix bug", "broken", "not working", "error", "crash" | `/bugfix` | General bug fixing with root cause analysis |
| 4 | "deploy", "push to prod", "ship it", "go live" | `/deploy` | Full deployment pipeline |
| 5 | "clean up", "dead code", "remove unused", "orphaned" | `/cleanup` | Codebase hygiene |
| 6 | "review", "check this code", "code review", "PR" | `/review` | PR-style code review |
| 7 | "research", "best practices", "how do others" | `/research` | Multi-source web research |
| 8 | "audit", "find issues", "what's missing", "what broke" | `/audit` | Full-chain execution audit |
| 9 | "plan", "design", "how should we", "approach" | `/planning` | Rigorous plan creation |
| 10 | "run all plans", "execute pending", "chain", "autonomous" | `/chain` | Batch plan execution |
| 11 | "execute", "implement", "build this", "do it" | `/execute` | Disciplined plan execution |
| 12 | "reflect", "what did we learn", "session end" | `/reflect` | Session retrospective |
| 13 | "compile learnings", "graduate patterns" | `/compile-learnings` | Pattern graduation |
| 14 | "questions", "ask me", "steering" | `/questionnaire` | Dynamic Q&A |
| 15 | "KT", "knowledge transfer", "share learnings" | `/share-kt` | Cross-repo KT |
| 16 | "find bugs", "QA", "break it", "stress test", "what could go wrong" | `/find-bugs` | Adversarial bug hunting |
| 17 | "check for regressions", "did anything break", "fingerprint" | `/regression-guard` | Structural before/after diff |

### Multi-Intent Resolution
If the user's message spans multiple intents (e.g., "fix the bug then deploy"):
1. Identify each intent in the order they appear
2. Chain the skills in that order
3. Use `/execute` as the orchestrator if a plan is involved

### Ambiguous Intent
If intent is unclear, DO NOT auto-route. Ask the user which skill applies, or answer directly if no skill is needed.

---

## Identity Enforcement

**Hard rule**: Pipeline-stage work (requirements capture, test planning, spec generation,
test healing, auditing, maintenance sweeps) requires an active identity via `/identity`.
General framework work auto-adopts OWNER (no prompt needed).

**Active identity constrains ALL actions**:
- File writes checked against §2 ownership (AGENT_SHARED_RULES.md)
- Tool usage checked against agent file frontmatter
- Rules filtered to agent's prefix + ALL-* + LR-*
- Self-audit checklist applies at task end and identity switch

**Override**: User says "override" for single-action file ownership bypass (logged).

**Codenames**: HUNTER | GIVER | BUILDER | HEALER | WATCHDOG | GARDENER | OWNER

---

## Skill Dependency Graph (Auto-Calls)

```
/planning ──auto-calls──> /research
/execute  ──auto-calls──> /regression-guard (before+after), /reflect
/bugfix   ──auto-calls──> /regression-guard (before+after), /reflect
/cleanup  ──auto-calls──> /regression-guard (before+after)
/deploy   ──auto-calls──> /regression-guard, /review
/chain    ──auto-calls──> /regression-guard, /reflect, /research
/audit    ──auto-calls──> /reflect

Leaf skills (no auto-calls):
  /identity, /regression-guard, /reflect, /compile-learnings, /research
  /review, /questionnaire, /share-kt, /rca, /find-bugs
```

No circular dependencies exist. `/regression-guard` and `/reflect` are always leaves.

---

## Learned Rules

_Graduated from PLAN_53 chain audit (2026-03-20). 25 bugs found, 6 patterns extracted._

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

### LR-008: Date offset validation — positivity constraints per field type
"Relative to start" fields (Prep, Set, Delivery) must be <= 0.
"Relative to end" fields (Return, Strike, Pickup) must be >= 0.
Delivery has additional NM-1264 constraint: must be >= Prep.
Test values must respect ALL constraints for the field being tested.
**Trigger**: Any test involving date offset fields on Location Settings.

### LR-009: Angular form dirty tracking — never test recovery to original value
When testing "error recovery" (invalid → valid), the recovery value must be
DIFFERENT from the server-saved value. Restoring to the original value makes
Angular detect "no net change" → Save stays disabled → test fails with correct app behavior.
Example: Delivery default=0, invalid=-5, recovery=-1 (NOT 0).
**Trigger**: Any test that validates Save button enables after correcting an error.

### LR-010: Cross-field validation is ALWAYS async — use expect.poll
Angular cross-field validators (NM-1264: Delivery >= Prep) fire asynchronously
after input events. Immediate getAttribute('aria-invalid') returns stale state.
Always use expect.poll(() => isFieldInvalid(key)) or the expectInvalid()/expectValid()
polling helpers from the page object. Same-field validation (e.g., "abc" in numeric) is synchronous.
**Trigger**: Any assertion on aria-invalid after changing a field with cross-field dependencies.

### LR-011: Reload after non-numeric input to clear Angular model corruption
Typing non-numeric values (e.g., "abc") into numeric Angular inputs corrupts the
internal model to NaN. Typing a valid value back does NOT reliably fix the model.
The ONLY safe cleanup is page reload (reloadBasicInfo or safeNavigateTo).
**Trigger**: Any test that enters non-numeric text into a numeric field.

### LR-012: Save dialogs are SHARED unless MCP-proven otherwise
Default assumption: all Location Settings tabs use the shared "Save Changes" dialog
(dlgSaveChanges / btnSaveChangesConfirm from shared.ts). Do NOT create custom dialog
selectors unless MCP verification proves a custom dialog exists.
**Trigger**: Any new page object for Location Settings tabs.

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

### LR-017: Different pages MUST have separate selector namespaces and directories
Pages at different URLs are DIFFERENT pages. Never merge selectors into a shared flat
object or co-locate files in the same directory. Each page group gets its own selector
partition, own directory, and own collision detection boundary.
"Location Settings" (`/settings/location`) ≠ "Local Office Settings" (`/settings/local-office`).
Check REQUIREMENTS.md and docs/MODULE_REGISTRY.md for page boundaries before creating any new page object.
Directory structure mirrors the app navigation hierarchy: `{section}/{module}/`.
**Trigger**: Any new page object or selector file creation.

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
   tab triggers "Unsaved changes" alertdialog even though save succeeded (GEN-033).
2. **Dirty state persists across test boundaries** — save cycle doesn't reset dirty tracking.
   Must reload page between tests that modify and save data (GEN-026).
3. **Net-zero changes not detected** — reverting to original value makes Angular detect
   "no net change" → Save stays disabled. Recovery values must differ from server-saved (LR-009).
Fix patterns:
- After save: wait for button disabled (confirms API done) BUT don't assume form pristine
- Any tab navigation: check for `[role="alertdialog"]` and dismiss with "Discard" if visible
- Between serial tests that save: reload page to reset form state
- Recovery values must differ from the server-saved original
**Trigger**: Any test that saves data then navigates, or any serial test after a save.
**Graduated from**: LR-009, GEN-026, GEN-033, session 2026-04-02
