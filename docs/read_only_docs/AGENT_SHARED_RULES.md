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
| R10 | Max 2 FIX cycles then STOP (§15 Phase B only). Phase A evidence gathering is unlimited | Infinite loop |
| R11 | REQUIREMENTS.md = READ-ONLY for all agents except Requirements Agent | Unauthorized edit |
| R12 | No raw page.* in specs | POM violation |
| R13 | All selectors in index.ts | Scattered selectors |
| R14 | Use fixtures, not direct constructors | Architecture violation |
| R15 | Trust rules over other agents | Collusion |
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
| Page method | `src/pages/*.page.ts` | Add to page object |
| Selector | `src/selectors/index.ts` | Add property |
| Constant | `src/utils/app-constants.ts` | Add to AppConstants |
| Matcher | `tests/setup/custom-matchers.ts` | Add + type declaration |
| Fixture | `tests/setup/fixtures.ts` | Add fixture |
| Test file | `tests/specs/{module}/` | Create in module folder |

---

## §2. File Ownership (Compact)

**Agent-Maintained**:
| Path | Req | Pln | Gen | Heal | Audit |
|------|-----|-----|-----|------|-------|
| `tests/specs/**/*.spec.ts` | — | — | CREATE | FIX | READ |
| `src/pages/*.page.ts` | — | READ | ADD | FIX | READ |
| `src/selectors/index.ts` | — | ADD | ADD | FIX | READ |
| `src/utils/common-methods.ts` | — | READ | ADD | FIX | READ |
| `docs/REQUIREMENTS.md` | UPDATE | READ | READ | READ | READ |
| `specs_planning/agent-queue.json` | CREATE | RW | RW | RW | RW |
| `specs_planning/test-cases/**` | — | CREATE | UPDATE | UPDATE | READ |
| `specs_planning/test-plans/**` | — | CREATE | READ | READ | READ |
| `specs_planning/agent-mistakes.md` | APPEND | APPEND | APPEND | APPEND | RW (quality gate) |
| `specs_planning/agent-activity-log.md` | APPEND | APPEND | APPEND | APPEND | APPEND |

**Audit Agent scope**: Can READ any file. WRITE limited to: agent-mistakes.md (RW — quality gate), audits/*.md, agent-performance.json, agent-queue.json (history/stage), agent-activity-log.md.

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
- **R10**: Max 2 FIX retries per issue (§15 Phase B). Phase A evidence gathering has no iteration cap.
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

**Tracking**: `specs_planning/agent-performance.json`

---

## §8. Session Protocol

Replaces former §8 (3-layer self-audit), §9 (learning protocol), §10 (context self-load), §11 (sync protocol), §16 (halt-and-learn), §17 (learning yield).

### START (before any work)

<!-- SYNC:CONTEXT_LOAD:START -->
1. **Context Self-Load (R25)**: Read your rules (inline in agent file) + own entry in `agent-performance.json` (trust level, unresolved defects, learning debt) + BASE_URL from config
<!-- SYNC:CONTEXT_LOAD:END -->
2. **Pre-flight (§18)**: Run pre-flight checks. HALT on failure.
3. **Log start**: Activity log entry with HH:MM timestamp.

### WORK

4. **Do the task**.
5. **On failure**: Search agent-mistakes.md Resolution column by failure category. Apply solution if match → retry. If no match → proceed, but capture learning after.
6. **On novel pattern**: Append rule to your section in agent-mistakes.md → run `npm run sync:mistakes && npm run build:context && npm run validate:sync`.

### COMPLETE

7. **Self-audit checklist**: Answer your 5-item checklist (see below). Produce reconciliation table (min 3 rows: claim | evidence source | verified result).
8. **Log end**: Activity log entry. Include: outcome, learning count, self-audit result.
9. **Sync** (if rules written): Run sync pipeline. validate:sync must exit 0.

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

### Phase A: Evidence Collection (NO code edits)

| # | Data Source | Action |
|---|------------|--------|
| A1 | failureCategory | Read classification |
| A2 | fullError | Read FULL error (not truncated) |
| A3 | networkFailures[] | Count + 4xx/5xx URLs |
| A4 | consoleErrors[] | List error entries |
| A5 | authChain[] | Check for 400+ status |
| A6 | pageUrl + urlBreadcrumbs[] | Final URL + redirect path |
| A7 | domSnippet | Element presence/absence |
| A8 | screenshotPath | Visual state |
| A9 | tracePath | Last actions before failure |
| A10 | per-spec diagnostics | Cross-test patterns |
| A11 | agent-mistakes.md | Search Resolution column by category |
| A12 | MCP browser replication | Reproduce test action sequence |
| A13 | selector evaluation | browser_evaluate/snapshot for exact CSS |

**Gate**: 10/13 rows checked (N/A with reason counts). A12 mandatory for SELECTOR/TIMING.

### Phase B: Fix (R10 — max 2 cycles)

1. Map hypothesis to file:line → ONE surgical edit → targeted test
2. Pass → done. Fail (different error) → mini Phase A. Fail (same) → one more fix
3. Max 2 cycles. Then STOP + report.

### Category → Action Routing

| Category | First Action | NEVER Do |
|----------|-------------|----------|
| AUTH | Check auth chain, OAuth responses | Don't touch selectors |
| NETWORK | Check networkFailures, API bodies | Don't blame selectors |
| SELECTOR | MCP replication, evaluate in DOM | Don't increase timeouts |
| TIMING | Network timing, page load indicators | Diagnose what's slow first |
| APPLICATION | Console errors, SPA crash traces | Don't retry — app broken |
| DATA | Test data source, env-specific values | Don't blame selectors/auth |
| INFRASTRUCTURE | Pre-flight, worker cascade, browser state | Escalate — no code fix |

**8 Categories**: AUTH · NETWORK · SELECTOR · TIMING · APPLICATION · DATA · INFRASTRUCTURE · UNKNOWN

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
