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

### Triage & Bug Detection Rules (ALL-032..034)

| ID | Rule | Violation = |
|----|------|-------------|
| ALL-032 | Triage before healing: classify every failure as BUG/FEATURE_CHANGE/TEST_DEFECT/UNCERTAIN before code changes | Bug laundering |
| ALL-033 | Bug-blocked tests use `test.skip('bug-blocked: BUG-XXX')`. Must NOT be removed until bug is confirmed fixed. | Lost regression detection |
| ALL-034 | `reports/bugs/` directory = structured bug report storage. Each BUG-{MOD}-{NNN}.json has evidence, TC source, MCP verification. | Bug tracking integrity |

### Escalation Enforcement Rules (ALL-035..037)

| ID | Rule | Violation = |
|----|------|-------------|
| ALL-035 | MANDATORY ESCALATION: When finding upstream agent's mistake that is NOT in your file scope, you MUST create an escalation entry in `specs_planning/_internal/agent-escalations.json`. Skipping = collusion. | Agent coverup |
| ALL-036 | RESOLVE FIRST: At session start, check pending escalations. Fix ALL open items assigned to you BEFORE new work. | Ignored feedback |
| ALL-037 | ESCALATION EVIDENCE: Every escalation must include file:line or MCP evidence proving the issue. No hearsay. | False accusation |

### Upstream Quality Rules (ALL-038..041)

| ID | Rule | Violation = |
|----|------|-------------|
| ALL-038 | Code-producing agents must prove reuse search before creating methods/interfaces/constants | Duplicate code |
| ALL-039 | Post-write quality self-check mandatory for .spec.ts or .page.ts modifications | Quality regression |
| ALL-040 | Generator MUST use Planner's existing selector files. Creating new selectors from scratch when Planner already delivered them = critical pipeline failure | 2-hour waste, wrong selectors |
| ALL-041 | Planner MUST document input attribute types, validation error UI patterns, input masks, filtering mechanisms, API loading behavior, strict mode risks for EVERY field/dialog | Generator flies blind without this |

### Universal Bug Detection Rules (ALL-042..044)

| ID | Rule | Violation = |
|----|------|-------------|
| ALL-042 | Any agent using MCP MUST check `browser_network_requests` after API-triggering interactions. 4xx/5xx = potential APP_BUG. Never silently ignore. | Silent API error |
| ALL-043 | When walkthrough reveals behavior contradicting MCP_VERIFICATION_LOG: classify (PLANNER_GAP / APP_BUG / TC_CORRECTION / SEQUENCE_SIDE_EFFECT) and escalate. Never silently proceed. | Unclassified mismatch |
| ALL-044 | Bug detection is EVERY agent's responsibility. Planner finds 500 error → file it. Generator finds form mutation → file it. Healer finds broken API → file it. All go to `agent-escalations.json`. | Agent ignoring bugs outside their scope |

### Agent Self-Audit Checklists (5 items each, binary yes/no)

**Generator**:
1. All tests pass? (0 failures in test output)
2. All selectors from index.ts? (no inline selectors)
3. No hardcoded waits? (no waitForTimeout)
4. Post-complete gate passes? (`npm run generator:post-complete`)
5. Novel patterns captured? (retries occurred → learnings logged)
6. Escalations created for upstream issues found? (ALL-035)
7. Pending escalations assigned to me resolved? (ALL-036)

**Planner**:
1. All TCs have matching test plan scenarios?
2. All TC-referenced selectors exist in index.ts?
3. lint:testcases passes with 0 errors?
4. Checklist fields true only with supporting TCs?
5. Novel patterns captured?
6. Escalations created for upstream issues found? (ALL-035)
7. Pending escalations assigned to me resolved? (ALL-036)

**Healer**:
1. All fixed tests pass? (targeted run → 0 failures)
2. Evidence checklist completed before code edits?
3. Fix uses correct failure category diagnosis?
4. Removed tests logged as missing-coverage?
5. Novel patterns captured?
6. Escalations created for upstream issues found? (ALL-035)
7. Pending escalations assigned to me resolved? (ALL-036)

**Audit**:
1. Every finding has agent + fix prompt?
2. Registry updated with new patterns?
3. Scope anchored to last audit entry?
4. Field counts reconciled (DOM ↔ TCs ↔ plan)?
5. Zero-finding justified (if applicable)?
6. Escalation discipline verified? (AUD-022: agents created escalations when needed)
7. Pending escalations assigned to me resolved? (ALL-036)

**Requirements**:
1. All fields verified via browser_snapshot?
2. Screenshots taken for new sections?
3. Error messages triggered live?
4. REQUIREMENTS.md updated with evidence?
5. Novel patterns captured?
6. Escalations created for upstream issues found? (ALL-035)
7. Pending escalations assigned to me resolved? (ALL-036)

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
| **D** | Bug-blocked — application bug, test is correct | Healer | `test.skip('bug-blocked: BUG-XXX')`. Bug fixed by dev team. Exit = bug confirmed fixed, test unskipped. |

**Generator**: Categorize every fixme as A/B/C in activity log before completing.

---

## §11. Exploration Scope

| Agent | Scope | Protocol |
|-------|-------|----------|
| Requirements | Full DOM exploration | Discovers all fields, documents in REQUIREMENTS.md |
| Planner | Targeted selector validation | browser_snapshot to verify selectors. Does NOT re-discover all fields |
| Generator | Phase 0.5 TC walkthrough + pre-flight selector validation | Walks through every TC step on MCP before writing code. Also validates selectors. |
| Healer | SELECTOR/ASSERTION: mandatory MCP. Others: artifact-first | MCP diagnostic at Step 3 for selector/assertion failures. Last resort for others. |

---

## §12. Root Cause Analysis Protocol

**Mandatory for**: Generator (fix loop), Healer (all diagnosis), Copilot (framework debugging).
**Replaces**: Former 13-item checklist. Now 7-step mandatory sequence — no shortcuts.
**Note**: Healer must run Phase 0 Triage (HLR-015) BEFORE this protocol. Triage classifies BUG/FEATURE_CHANGE/TEST_DEFECT/UNCERTAIN. Phase A RCA only runs for FEATURE_CHANGE, TEST_DEFECT, and UNCERTAIN cases.

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

### RCA Decision Trees (ALL-045)

After reading artifacts (Steps 1-3), walk the appropriate tree. At each node, cite the artifact field that answers the question.

**TimeoutError tree:**
1. Does element exist in domSnippet/error-context.md? → NO = selector issue (check selector key in selectors/*.ts)
2. Element exists but not visible? → Check consoleErrors for JS errors preventing render
3. Element visible but not actionable? → Check if disabled (form state), covered (modal/overlay), or outside viewport
4. Element actionable but timeout? → Timing issue — check duration, add waitFor or expect.poll

**Assertion failure tree:**
1. Expected X got Y — is Y from a different test? → State leakage (check lastActions of prior test in serial block)
2. Is the actual value close but not exact? → Timing (element still loading) or format difference
3. Is the actual value completely wrong? → App behavior differs from Planner docs → verify on MCP → file escalation if Planner was wrong

**Dialog error tree ("Cannot accept dialog which is already handled"):**
1. Check: is there a `page.once('dialog')` or `page.on('dialog')` handler registered?
2. Check: does Playwright auto-handle this dialog type? (beforeunload = auto-accepted on navigation)
3. Fix: remove redundant handler OR use `page.on()` + `removeListener` pattern (never `page.once()` on worker-scoped pages)

**Network failure tree:**
1. Check networkFailures array — what status code?
2. 401/403 = auth issue → check authChain
3. 500+ = backend error → not test issue, log and retry
4. 0 (no response) = connectivity → check urlBreadcrumbs for redirect loops

### Evidence-Based Fixes (ALL-046)

Every fix MUST cite its evidence source. Format:
```
RCA | TC-XXX | category: TIMING | evidence: failure-summary.json.duration=45000ms (>30s timeout) | fix: add waitFor before assertion
```
Fixes without evidence citations are GUESSES and will be flagged by Audit.

### Failure Classification Accuracy (ALL-047)

The `failureCategory` in failure-summary.json is auto-classified by pattern matching. It can be WRONG. Always verify against actual artifacts.
Common misclassifications:
- 404 on favicon → classified NETWORK but actual issue is APPLICATION or DATA
- Timeout on page load → classified TIMING but actual issue is AUTH (redirect loop)
- Selector not found → classified SELECTOR but actual issue is APPLICATION (element conditionally rendered)

### MCP Replication — Last Resort (ALL-048)

Use MCP browser replication ONLY when:
1. Artifacts are missing or insufficient (domSnippet empty, no trace)
2. You need to verify a Planner behavioral claim that contradicts test results
3. The failure classification is UNKNOWN after artifact analysis
4. You need to test a specific interaction sequence not captured in artifacts

When needed: navigate to exact pageUrl from urlBreadcrumbs → reproduce exact step sequence from lastActions → browser_snapshot at failure point → browser_evaluate to check element state → compare to artifacts → document finding.

### State-Aware Testing (ALL-049)

When documenting or asserting page states:
- **Default state** = what you see on FRESH page load (full URL navigation, no prior interaction)
- **Post-action state** = what you see after save/delete/edit (NOT the default)
- **Transient state** = what you see during animation/loading (NOT stable)
Always label which type of state you're documenting. Never confuse them. Planner pollution (testing default state after own save-empty cycle) has caused multi-day debugging sessions.

### Pareto-Ordered Investigation (ALL-050)

When investigating failures, check the most common categories FIRST:
1. **Timing/race conditions** (45% of UI test failures) — missing waits, Angular change detection
2. **Selector issues** (25%) — element changed, selector too fragile, wrong scope
3. **Environment/infra** (15%) — CI differences, auth, network
4. **Test data** (10%) — state leakage, pollution from prior tests in serial blocks
5. **Real app bugs** (5%) — actual application defect

### Enhanced Artifact Catalog (ALL-051)

Full fields available in `reports/failure-summary.json` per failure:

| Field | What it contains | Use for |
|-------|-----------------|---------|
| `error` / `fullError` | Error message + stack trace | Initial classification |
| `failureCategory` | AUTO: AUTH/NETWORK/SELECTOR/TIMING/APPLICATION/DATA/INFRASTRUCTURE/UNKNOWN | Starting point (may be wrong — ALL-047) |
| `selector` | Extracted selector that failed | Selector drift check |
| `lastActions` | Last 5 Playwright steps before failure | Sequence reconstruction |
| `consoleErrors` | Browser console errors + warnings with location | JS errors, app-level errors |
| `networkFailures` | HTTP 4xx/5xx responses + failed requests (2KB body) | API/backend issues |
| `pageErrors` | Uncaught JS exceptions | Runtime crashes |
| `domSnippet` | First 50KB of page DOM at failure | Element existence check |
| `urlBreadcrumbs` | Navigation history with timestamps | Route/redirect issues |
| `authChain` | OAuth/SSO response chain | Auth flow failures |
| `screenshotPath` | Full-page screenshot at failure | Visual state verification |
| `tracePath` | Playwright trace .zip (timeline + DOM + network + console) | Deep investigation |
| `duration` | Test execution time | Timeout analysis |
| `retryAttempt` | Which retry this was | Flakiness signal |

Per-spec diagnostics in `reports/diagnostics/*.diagnostics.json`: full console log, network failure list, auth chain details.

### Beforeunload Dialog Defense (ALL-052)

When using MCP browser on pages with unsaved edits (dirty form state), the browser fires a `beforeunload` dialog ("Leave site?") on navigation/reload. This blocks the agent.

**NEVER** call `browser_evaluate(() => window.location.reload())` — it triggers beforeunload which the agent cannot dismiss inline.

**Safe navigation pattern (ALL-052):**
1. `browser_navigate("about:blank")` — triggers beforeunload on the dirty page
2. If beforeunload dialog fires → `browser_handle_dialog(accept: true)` to leave
3. `browser_navigate(targetUrl)` — clean fresh load of the target page
4. `browser_wait_for(time: 5)` — wait for page load

**If stuck on beforeunload:** Call `browser_handle_dialog(accept: true)` immediately, then re-navigate.

This applies to ALL agents during MCP exploration. The Encore website fires beforeunload whenever form edits are made without clicking Save.

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

---

## §15. Escalation Routing by File Ownership

When finding a mistake in another agent's owned files, create an escalation entry with the correct `pendingFor` agent:

| Mistake Found In | Owner (pendingFor) | Category |
|-----------------|-------------------|----------|
| REQUIREMENTS.md wrong | requirements | wrong-requirement |
| Test cases (specs_planning/test-cases/) | planner | stale-tc |
| Test plan (specs_planning/test-plans/) | planner | stale-tc |
| Selectors wrong in index.ts | planner (if new) or healer (if fix) | wrong-selector |
| Spec file (.spec.ts) logic wrong | generator | logic-error |
| Page object method wrong | generator (if new) or healer (if fix) | logic-error |
| MCP_VERIFICATION_LOG outdated | planner | outdated-artifact |
| Agent rules wrong | audit | logic-error |
| Framework code (base-page, utils) | maintainer | logic-error |

Rule: ALWAYS escalate to the agent who OWNS the file, not the one who last touched it.

---

## §14. Autonomy & Efficiency (ALL-054..055)

### Autonomy Mode (ALL-AGENTS)

When running in pipeline mode (invoked by orchestrator, not manual Copilot chat):
- Do NOT wait for user approval at any phase boundary
- Do NOT present findings and pause — log them and continue
- Do NOT ask "should I proceed?" — always proceed to next phase
- Complete your FULL workflow end-to-end without stopping
- Only stop when: (a) task fully complete, or (b) HARD STOP error condition
- No one is watching. Pausing = pipeline timeout = wasted money.
- Never ask for tool permissions — execute all tools directly.

### Self-Audit Evidence (ALL-054)

Every self-audit claim MUST cite the actual value, not just pass/fail:
- ❌ "TC count matches" → ✅ "TC count: 15 in header, 15 actual (TC-001..TC-015)"
- ❌ "Selectors verified" → ✅ "Selectors: 10 in legal.ts, all 10 in index.ts, 0 collisions"
- ❌ "Lint passes" → ✅ "Lint: 0 errors, 2 pre-existing warnings (notes, currency)"

Uncited claims = unverified = will be flagged by Audit.

### Learning Debt Resolution (ALL-055)

If `learningDebt > 0` in your agent-performance.json entry, you MUST resolve it before queue unlock:
1. Write learnings to agent-mistakes.md
2. Run `npm run sync:mistakes && npm run build:context`
3. Verify learningDebt = 0
4. Only THEN set stage to complete

---

### Mistake Detection Triggers (ALL-056)

Any time one of these 6 triggers fires, the agent MUST immediately log an entry to `specs_planning/_internal/agent-mistakes.md`. This is BLOCKING — stop current work, log, then resume.

| # | Trigger | What to Log |
|---|---------|-------------|
| 1 | **User corrects you** | What was wrong, what the user said, the correction applied |
| 2 | **Retry was needed** (first attempt failed) | What failed, why it failed, what fixed it |
| 3 | **Unexpected state encountered** | What was expected vs. what was actually found |
| 4 | **Output doesn't match evidence** | What you claimed vs. what the code/page actually shows |
| 5 | **Command errors out** | The command, the error message, the resolution |
| 6 | **Approach changed mid-task** | Original approach, why it was abandoned, new approach taken |

**Format**: `| R-[next] | [trigger #] — [one-line rule] | LRN: [what happened, resolution] |`

**Why these 6 and not more**: These are the exact moments where the agent's mental model diverged from reality. Capturing them builds the mistake registry that `/compile-learnings` graduates into permanent rules. Without explicit triggers, agents under-report and the learning loop stalls.
