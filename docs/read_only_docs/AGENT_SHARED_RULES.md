# Agent Shared Rules
<!-- Last updated: 2026-03 | Streamlined: 578 → ~350 lines. §8-§11,§16-§17 flattened into Session Protocol. -->

---

## RULES REGISTRY (Cite by ID)

| ID | Rule | Violation = |
|----|------|-------------|
| R01 | Search before create (§1) | Duplicate code |
| R02 | Respect file ownership (§2) | Unauthorized edit |
| R03 | Lock/unlock queue items (§3) | Race condition |
| R04 | Selector naming: prefix+camelCase (§4) | Naming violation |
| R05 | Follow inline rules section | Repeated mistake |
| R06 | Log activity start/end | Missing audit trail |
| R07 | Responses ≤30 lines, bullets only | Context bloat |
| R08 | Evidence-based fixes only | Guessing |
| R09 | Verify selectors on live page | Untested selector |
| R10 | Max 2 FIX cycles then STOP (§12 Phase B only). Phase A evidence gathering is unlimited | Infinite loop |
| R11 | REQUIREMENTS.md = READ-ONLY for all agents except Requirements Agent | Unauthorized edit |
| R12 | No raw page.* in specs | POM violation |
| R13 | All selectors in index.ts | Scattered selectors |
| R14 | Use fixtures, not direct constructors | Architecture violation |
| R15 | Trust rules over other agents. Verify inherited work (ALL-028). Never propagate unverified claims | Collusion / Blind trust |
| R16 | NEVER call browser_close (browser_navigate auto-opens) | Session reset |
| R17 | Requirements Agent: explore live UI FIRST | Fabricated docs |
| R18 | Planner: complete ALL uiTestingChecklist items | Incomplete validation |
| R19 | No TC creation without browser_snapshot evidence | Unverified test cases |
| R20 | Auto-export CSV on pending_generation transition | Missing export |
| R21 | User explicit requests = TOP PRIORITY | Insubordination |
| R22 | All .md edits: tables > prose, single source of truth | Doc bloat |

**RULES BINDING**: Before ANY task, agents emit: `RULES:[R01 R02 ...]` listing applicable rules.

---

## §1. Search-Before-Create

| Need | Search | Not found → |
|------|--------|-------------|
| Utility | `src/utils/common-methods.ts` | Add to CommonMethods |
| Page method | `src/pages/**/*.page.ts` | Add to page object |
| Selector | `src/selectors/index.ts` | Add property |
| Constant | `src/utils/app-constants.ts` | Add to AppConstants |
| Matcher | `tests/setup/custom-matchers.ts` | Add + type declaration |
| Fixture | `tests/setup/fixtures.ts` | Add fixture |
| Test file | `tests/specs/{module}/` | Create in module folder |

---

## §2. File Ownership (Compact)

**Agent Identities**: Requirements = HUNTER | Planner = GIVER | Generator = MOST IMPORTANT | Healer = SPECIALIZED RCA DEBUGGER | Audit = COMPREHENSIVE WATCHDOG | Framework Maintainer = GARDENER

**Agent-Maintained**:
| Path | Req | Pln | Gen | Heal | Audit | Maint |
|------|-----|-----|-----|------|-------|-------|
| `tests/specs/**/*.spec.ts` | — | — | CREATE | FIX | READ | REFACTOR |
| `src/pages/**/*.page.ts` | — | READ | ADD | FIX | READ | REFACTOR |
| `src/common/base-page.ts` | — | READ | — | — | READ | REFACTOR |
| `src/selectors/index.ts` | — | ADD | ADD | FIX | READ | READ |
| `src/utils/common-methods.ts` | — | READ | ADD | FIX | READ | READ |
| `docs/REQUIREMENTS.md` | UPDATE | READ | READ | READ | READ | READ |
| `specs_planning/_internal/agent-queue.json` | CREATE | RW | RW | RW | RW | READ |
| `specs_planning/test-cases/**` | — | CREATE | UPDATE | UPDATE | READ | READ |
| `specs_planning/test-plans/**` | — | CREATE | READ | READ | READ | READ |
| `specs_planning/_internal/agent-mistakes.md` | APPEND | APPEND | APPEND | APPEND | RW (quality gate) | APPEND |
| `specs_planning/_internal/agent-activity-log.md` | APPEND | APPEND | APPEND | APPEND | APPEND | APPEND |

**Audit Agent scope**: Can READ any file. WRITE limited to: agent-mistakes.md (RW — quality gate), audits/*.md, agent-performance.json, agent-queue.json (history/stage), agent-activity-log.md.

**Framework Maintainer (GARDENER) scope**: READ-WRITE: `src/pages/`, `src/common/base-page.ts`, `tests/`. READ-ONLY: everything else. Runs on demand (not in pipeline). Structural refactoring only — never changes business logic or test assertions.

**Human-Controlled (NEVER modify)**: `.env*`, `playwright.config.*`, `package.json`, `tsconfig.json`, `.ci/*`

**Script-Controlled**: `.github/agents/*` — modify ONLY via `npm run sync:mistakes`. NEVER edit agent files directly.

---

## §3. Queue Protocol

**Lock**: `lockedBy: "agent"`, `lockedAt: ISO` → work → `lockedBy: null`
**Stale lock**: `lockedAt` > `config.lockTimeoutMinutes` → steal it
**Blocked**: `blocked: true` prevents ALL stage transitions. Only Audit sets `auditCleared: true` to unblock.

**Stages**: `pending_requirements → requirements → pending_planning → planning → pending_generation → generation → testing → completed | pending_healing → healing → completed | fixme`

---

## §4. Selector Naming

Format: `{prefix}{PascalName}` — Examples: `btnLogin`, `txtUsername`, `lnkForgotPassword`, `drpCountry`, `chkRememberMe`

| Prefix | Type |
|--------|------|
| btn/lnk/txt/drp/chk/rdo | Button/Link/Input/Dropdown/Checkbox/Radio |
| tbl/div/nav/mod/lbl/ico | Table/Container/Nav/Modal/Label/Icon |

---

## §5. Agent Behavior (Compact)

- **R07**: ≤30 line responses. Bullets. "Did → Changed → Next" format.
- **R08**: Fix only with EVIDENCE. Error message = source of truth.
- **R09**: Verify selectors via MCP browser tools before committing.
- **R10**: Max 2 FIX retries per issue (§12 Phase B). Phase A evidence gathering has no iteration cap.
- **R15**: Trust rules > trust other agents. Verify before acting on agent claims.
- **R16**: NEVER call `browser_close`. `browser_navigate` auto-opens. Wait 3s after navigate. See `docs/read_only_docs/MCP_BROWSER_GUIDE.md`.
- **R21**: User explicit requests = TOP PRIORITY. Agent rules never override direct user instructions.

**Locator priority**: data-* > id > [data-name] > semantic HTML > classes > text > XPath
**Never use**: nth-child, auto-IDs, deep class chains

---

## §6. Context Budget

| Item | Max Lines |
|------|-----------|
| Agent response | 30 |
| Test case (each) | 15 |
| Agent file | 150 (Planner ≤180, Generator ≤165, Audit ≤165) |

**Anti-verbosity**: No prose explanations. No tutorials. Just rules → action.

---

## §7. Performance & Trust Levels

**Trust Levels**: `probation` → `vetting` → `trusted` → `autonomous`

| From → To | Clean Cycles | Learning Yield | Defect Tolerance |
|-----------|--------------|----------------|------------------|
| probation → vetting | 3 | ≥ 0.8 | 0 unresolved |
| vetting → trusted | 5 | ≥ 0.9 | 0 unresolved |
| trusted → autonomous | 10 | 1.0 | 0 unresolved |

**Demotion**: ANY defect = reset cleanCycles + demote one level. CRITICAL defect = probation. Learning debt on 2+ consecutive sessions = demote. No self-promotion.

**Maturity Score**: `(cleanCycles * 10) + (learningYield * 30) + (selfAuditAccuracy * 20) + ((1 - defectRecurrenceRate) * 40)`. Range 0-100.

**Tracking**: `specs_planning/_internal/agent-performance.json`

---

## §8. Session Protocol

Replaces former §8 (3-layer self-audit), §9 (learning protocol), §10 (context self-load), §11 (sync protocol), §16 (halt-and-learn), §17 (learning yield).

### START (before any work)

<!-- SYNC:CONTEXT_LOAD:START -->
1. **Context Self-Load (§8)**: Read your rules (inline in agent file) + own entry in `agent-performance.json` (trust level, unresolved defects, learning debt) + BASE_URL from config
<!-- SYNC:CONTEXT_LOAD:END -->
2. **Pre-flight (§13)**: Run pre-flight checks. HALT on failure.
2b. **Inheritance Verification (ALL-028)**: If this task builds on another agent's output (test cases from Planner, spec from Generator, requirements from Requirements Agent):
    - Read the inherited artifact fully
    - Spot-check >=3 claims against source files or live DOM
    - If ANY claim is wrong: fix if in scope, else create escalation (ALL-031)
    - Log: `inheritance-check | <artifact> | verified: N | issues: N`
3. **Log start**: Activity log entry with HH:MM timestamp.

### WORK

4. **Do the task**.
4b. **Mid-Phase Checkpoint (ALL-029)**: After each major work phase (exploration->documentation, TC drafting->finalization, code->test run):
    - Does this match user's original intent?
    - Am I building on correct assumptions from prior agent?
    - Log: `mid-check | phase: <name> | intent-aligned: yes/no | corrections: N`
5. **On failure**: Search agent-mistakes.md Resolution column by failure category. Apply solution if match -> retry. If no match -> proceed, but capture learning after.
6. **On ANY mistake or novel pattern (MANDATORY -- not optional)**: STOP current task. Append rule to your section in agent-mistakes.md with next available ID. Run `npm run sync:mistakes && npm run build:context && npm run validate:sync`. Validate exit 0. THEN resume task. Do NOT skip this step. Do NOT defer to self-audit. Mistakes come before task completion.

### COMPLETE

7. **Self-audit checklist (ALL-030)**: Answer your 5-item checklist (see below). Be CRITICAL -- ask "what did I get WRONG?" not "did I get it right?"
   Produce reconciliation table (min 3 rows: claim | evidence source | verified result).
   Zero issues on non-trivial work (3+ steps) is suspicious -- justify explicitly.
8. **Log end**: Activity log entry. Include: outcome, learning count, self-audit result.
9. **Sync** (if rules written): Run sync pipeline. validate:sync must exit 0.
10. **Escalation check (ALL-031)**: Read `specs_planning/_internal/agent-escalations.json`. If any entry has `pendingFor` matching your agent name AND `status: "open"` -> include those fixes in your current work. After fixing: update the entry's `status` to `"resolved"`, add `resolvedBy`, `resolvedAt`, `resolution`.

### Agent Self-Audit Checklists (5 items each, binary yes/no)

**Generator**:
1. All tests pass? (0 failures in test output)
2. All selectors from index.ts? (no inline selectors)
3. No hardcoded waits? (no waitForTimeout)
4. Post-complete gate passes? (`npm run generator:post-complete`)
5. Novel patterns captured? (retries occurred → learnings logged)

**Planner**:
1. All TCs have matching test plan scenarios?
2. All TC-referenced selectors exist in index.ts?
3. lint:testcases passes with 0 errors?
4. Checklist fields true only with supporting TCs?
5. Novel patterns captured?

**Healer**:
1. All fixed tests pass? (targeted run → 0 failures)
2. Evidence checklist completed before code edits?
3. Fix uses correct failure category diagnosis?
4. Removed tests logged as missing-coverage?
5. Novel patterns captured?

**Audit**:
1. Every finding has agent + fix prompt?
2. Registry updated with new patterns?
3. Scope anchored to last audit entry?
4. Field counts reconciled (DOM ↔ TCs ↔ plan)?
5. Zero-finding justified (if applicable)?

**Requirements**:
1. All fields verified via browser_snapshot?
2. Screenshots taken for new sections?
3. Error messages triggered live?
4. REQUIREMENTS.md updated with evidence?
5. Novel patterns captured?

---

## §9. Detection Boundary

Self-audit checklists catch formatting and process errors. They do NOT catch reasoning errors (wrong selector choice, incorrect test logic). For reasoning validation:
- **Audit agent** remains the external verification layer
- **Hard gates** (post-complete scripts) catch artifact-specific issues
- **Queue integrity validator** cross-checks claims vs artifacts

**Remaining gap**: Agent that provides false evidence to checklist questions. Audit agent can verify by checking entries against failure-summary.json data.

---

## §10. Fixme Lifecycle

| Cat | Description | Owner | Exit Condition |
|-----|-------------|-------|----------------|
| **A** | Office-limited — feature disabled/locked for execution office | Planner | Parameterize with TEST_OFFICE + per-office data |
| **B** | DB state / ordering — serial mutations corrupt state | Generator | Fix ordering: destructive tests last. Add restore steps |
| **C** | Genuinely untestable — different role/precondition needed | Planner | TC `Automatable: No` with reason. Removed from test count |

**Generator**: Categorize every fixme as A/B/C in activity log before completing.

---

## §11. Exploration Scope

| Agent | Scope | Protocol |
|-------|-------|----------|
| Requirements | Full DOM exploration | Discovers all fields, documents in REQUIREMENTS.md |
| Planner | Targeted selector validation | browser_snapshot to verify selectors. Does NOT re-discover all fields |
| Generator | Pre-flight check only | Validates selectors exist in index.ts + match DOM. No browsing |
| Healer | Diagnostic only | Explores DOM only when tests fail, to diagnose |

---

## §12. Root Cause Analysis Protocol

**Mandatory for**: Generator (fix loop), Healer (all diagnosis), Copilot (framework debugging).
**Replaces**: Former 13-item checklist. Now 7-step mandatory sequence — no shortcuts.

### 7-Step Mandatory Sequence

**Step 1: Read failure-summary.json (MANDATORY FIRST)**
Extract: failureCategory, testName, selector, pageUrl, fullError, consoleErrors[], networkFailures[], authChain[]

| Category | Route | Skip To |
|----------|-------|---------|
| AUTH | Check authChain[] → SSO/token issue | Escalate |
| NETWORK | Check networkFailures[] → API down/CORS | Document |
| INFRASTRUCTURE | Browser crashed → retry once | Escalate |
| SELECTOR / TIMING / DATA / APPLICATION | Proceed to Step 2 | — |

**Step 2: Read error-context.md (SELECTOR/TIMING failures)**
Path: `reports/test-results/{test-dir}/error-context.md` — accessibility snapshot at failure time

| Finding | Diagnosis |
|---------|-----------|
| Element EXISTS in snapshot | TIMING — appeared but test didn't wait |
| Element MISSING from snapshot | SELECTOR — wrong selector or not rendered |
| OVERLAY/DIALOG visible | BLOCKING — dialog/modal/loading covering target |

**Step 3: Read screenshot (test-failed-1.png)**
Visual confirmation: unexpected dialogs, error messages, loading spinners, wrong page.

**Step 4: Identify the failing spec line**
From fullError → extract file:line → read spec → trace to page object method → read method code.

**Step 5: Form hypothesis (with evidence citations)**
Format: "The failure is [CATEGORY] because [evidence from Steps 1-4]"
Cite specific file names and line numbers. Example: "SELECTOR failure: error-context.md line 42 shows alertdialog overlay blocking pointer events to checkbox."

**Step 6: Replicate on MCP (ONLY if Steps 1-5 inconclusive)**
Navigate to pageUrl → execute same spec steps → observe DOM → `browser_evaluate` to test CSS selector.

> **WARNING**: Do NOT have `npx playwright test` running concurrently with MCP browser. They share Playwright infrastructure — concurrent use causes exit code 4294967295. Run test FIRST → read artifacts → THEN MCP (not simultaneously).

**Step 7: Fix**
Apply fix based on confirmed root cause → run ONLY failing test: `--grep "TC-ID" --project=chrome --headed`.
Pass → full spec regression. Fail (same) → one more attempt (max 2). Fail (different) → new RCA from Step 1.

### Phase B: Fix Cycles (R10 — max 2)

1. Map hypothesis to file:line → ONE surgical edit → targeted `--grep` test
2. Pass → done. Fail (different error) → mini Phase A (Steps 1-3 minimum). Fail (same) → one more fix
3. Max 2 cycles. Then STOP + report

### Category → Action Routing

| Category | First Action | NEVER Do |
|----------|-------------|----------|
| AUTH | Check authChain[], OAuth responses | Don't touch selectors |
| NETWORK | Check networkFailures[], API bodies | Don't blame selectors |
| SELECTOR | MCP replication, evaluate in DOM | Don't increase timeouts |
| TIMING | Network timing, page load indicators | Diagnose what's slow first |
| APPLICATION | Console errors, SPA crash traces | Don't retry — app broken |
| DATA | Test data source, env-specific values | Don't blame selectors/auth |
| INFRASTRUCTURE | Pre-flight, worker cascade, browser state | Escalate — no code fix |

**8 Categories**: AUTH · NETWORK · SELECTOR · TIMING · APPLICATION · DATA · INFRASTRUCTURE · UNKNOWN

### Failure Artifact Locations

| Artifact | Path | Content |
|----------|------|---------|
| Failure summary | `reports/failure-summary.json` | Structured: category, selector, errors, URL |
| Error context | `reports/test-results/{test-slug}-{browser}/error-context.md` | Accessibility snapshot at failure |
| Screenshot | `reports/test-results/{test-slug}-{browser}/test-failed-1.png` | Screenshot at failure |
| Trace | `reports/test-results/{test-slug}-{browser}/trace.zip` | Full trace (`npx playwright show-trace`) |
| HTML report | `reports/html-report/index.html` | Interactive visual report |
| Framework logs | `reports/logs/{spec-name}/test-execution.log` | All Log.info/error calls |

### Planner Selector Verification (RCA subset)

1. Navigate to page via MCP → `browser_evaluate` to test exact CSS selector
2. null → wrong selector → inspect actual DOM structure
3. Find what DOES exist: `document.querySelectorAll('button[role="checkbox"]').length`
4. Build selector from actual DOM — NEVER copy patterns from other tabs/pages

### Healer RCA Addendum

Same 7-step sequence, plus after Step 4:
- Selector change → verify new selector via `browser_evaluate` on MCP
- Timing change → add explicit wait, not just timeout increase
- Test logic change → verify against TC document (TC wrong or spec wrong?)

---

## §13. Pre-Flight Competency Gate

### Universal (ALL agents)

| # | Check | Fail → |
|---|-------|--------|
| PF-01 | Queue file exists and parses | HALT |
| PF-02 | agent-mistakes.md exists and readable | HALT |
| PF-03 | Activity log exists | WARN |
| PF-04 | BASE_URL in config | HALT |
| PF-05 | Own performance entry exists | WARN (create if missing) |

### Agent-Specific

| Agent | # | Check | Fail → |
|-------|---|-------|--------|
| Generator | PF-G1 | TypeScript compiles | HALT |
| Generator | PF-G2 | fixtures.ts exists | HALT |
| Generator | PF-G3 | selectors/index.ts exists | HALT |
| Generator | PF-G4 | test-data/ dir exists | WARN |
| Healer | PF-H1 | failure-summary.json exists | WARN |
| Healer | PF-H2 | MCP test server available | HALT |
| Planner | PF-P1 | REQUIREMENTS.md exists | HALT |
| Planner | PF-P2 | MCP browser available | HALT |
| Planner | PF-P3 | SELECTOR_CATALOG.md exists | WARN |
| Requirements | PF-R1 | MCP browser available | HALT |

**Enforcement**: `probation`/`vetting` = ALL checks HARD. `trusted` = agent-specific SOFT. `autonomous` = skip.
Generator pre-flight automated: `generator-pre-run.ts` validates PF-G1..G4 programmatically.

---

## §14. Self-Unblocking Map

**Referenced by**: PLAN_01 Step 1 (planner), PLAN_02 Phase 0.3 (generator), ALL-025 rule.
Applies to ALL agents during exploration, code writing, selector discovery, or any phase — not just test failure RCA.

| Stuck On | Search What | Where | When | Example Search |
|----------|-------------|-------|------|----------------|
| Unknown selector | SELECTOR_CATALOG.md → partition files | `src/selectors/SELECTOR_CATALOG.md` | Before writing ANY new selector | `grep -r "btnSave" src/selectors/` |
| UI pattern unknown (Radix, date picker, combobox) | Existing page objects with same component | `src/pages/`, `src/common/base-page.ts` | Before creating new page object method | `grep -r "role=\"checkbox\"" src/pages/` |
| Same failure repeating after fix | Resolution column in agent-mistakes.md | `specs_planning/_internal/agent-mistakes.md` | After first failed fix attempt | `grep "SELECTOR" specs_planning/_internal/agent-mistakes.md` |
| Auth/login issues | authChain + env files | `reports/failure-summary.json`, `config/environments/` | When tests fail with auth errors | `cat reports/failure-summary.json \| grep authChain` |
| Don't know what methods exist | BasePage + existing page objects | `src/common/base-page.ts`, `docs/read_only_docs/ARCHITECTURE.md` | Before writing ANY new method | `grep "async.*(" src/common/base-page.ts` |
| TC seems wrong vs live app | Truth hierarchy: MCP > all docs (GEN-021) | `docs/REQUIREMENTS.md` then MCP | When spec assertion fails but app looks correct | Navigate MCP to same URL, verify DOM |
| Don't know fixture/helper exists | Fixture definitions + test setup | `tests/setup/fixtures.ts`, `src/index.ts` | Before creating test setup code | `grep "test.extend" tests/setup/fixtures.ts` |
| Previous agent output incomplete | Queue item history + activity log | `specs_planning/_internal/agent-queue.json`, `specs_planning/_internal/agent-activity-log.md` | When inheriting work from previous stage | Read queue item's `history` array |
| Spec-level pattern already exists | Existing specs for same setup/assertion | `tests/specs/**/*.spec.ts` | Before writing beforeEach or repeated assertions | `grep -r "navigateTo.*Tab" tests/specs/` |

**NOTE**: `agent-learnings.md` is an empty stub — all learnings merged into agent-mistakes.md Resolution column. Do NOT reference it as primary source.
