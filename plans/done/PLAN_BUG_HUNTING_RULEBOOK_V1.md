# PLAN: Bug Hunting System — 4-Category Rulebook + All-Agent Line of Defense

## Context

**Problem**: Bug detection is currently Healer-centric. Only the Healer has explicit bug filing (Phase 0 Triage → `reports/bugs/BUG-*.json`). But bugs surface at EVERY pipeline stage — Requirements discovers UI contradictions, Planner finds stale selectors, Generator hits walkthrough mismatches (GEN-021 gap), Healer classifies test failures, Audit verifies everyone's work. Each agent is a **line of defense** that must detect, classify, and route bugs according to the rulebook.

**Rutvik's 4-Category Rulebook**:
1. **Feature changed, small** → Heal framework + spec autonomously, notify other agents
2. **Feature changed, big** → Agent DENIES work, escalates to previous agents for rework
3. **Test-ID missing/gone** → Report bug (autonomous). Test-ID changed → Report + adapt, user reviews
4. **Feature intact but failure** → This IS a bug, report it

**Regression Guard findings** (13 issues): Hardcoded disposition values in frontend (TriagePanel, ChatTriageCard), missing SHARED_PATHS for notifications, FailureEntry timing issue (bugHuntCategory set post-test not during), DB migration path undefined, agent prompt changes need precise text. All addressed in subplans below.

**Key Decision**: `disposition` (BUG/FEATURE_CHANGE/TEST_DEFECT/UNCERTAIN) **coexists** with new `bugHuntCategory` — old field stays for backward compat, new field adds specificity. Frontend reads `bugHuntCategory` when present, falls back to `disposition`.

---

## Self-Audit Findings (16 issues, all resolved below)

Critical fixes embedded in subplans:
1. **B and C execute SEQUENTIALLY** (not parallel) — B defines bug report format, C stores it
2. **AGENT_SHARED_RULES.md** must be updated with universal rules ALL-053..058
3. **Requirements READ-ONLY contradiction** fixed — removed clicking check from B1
4. **Generator→BugHuntCategory mapping** added to B3 (ALL-043 maps to BugHuntCategory)
5. **Escalation rework API chain** specified in F1 (POST /api/escalations/:id/rework → orchestrator creates queue item)
6. **First-run baseline** — TESTID_CHANGED impossible on first run, only PRESENT/MISSING
7. **PLN-034 uses selector-registry-validator.ts** — one implementation, not two
8. **FLAKE→BUG auto-promotion** when same errorHash flakes 3+ times
9. **Chat actions for bug lifecycle** added to C5 (show_bugs, mark_bug_fixed, verify_bug_fix)
10. **Escalation targets MINIMUM agent** — page-scoped, not run-scoped
11. **HAR capture**: configurable cap, default = failed requests + 5 surrounding
12. **Visual regression**: noted as future scope (out of this plan)

---

## Master Plan Structure

```
SUBPLAN_A: Foundation (types, config, regression-safe scaffolding)
SUBPLAN_B: All-Agent Bug Awareness (Requirements → Planner → Generator → Healer → Audit)
SUBPLAN_C: Backend API + DB (migration, new endpoints, SSE events)
SUBPLAN_D: Frontend UX (4-category triage, escalation, test-ID review, bug detail)
SUBPLAN_E: RCA Enhancements (DOM diff, selector validation, HAR, historical correlation)
SUBPLAN_F: Pipeline Wiring (escalation flow, notification propagation, test-ID lifecycle)
SUBPLAN_G: Testing + Validation
SUBPLAN_H: AGENT_SHARED_RULES.md universal rules (ALL-053..058)
```

Execution order (REVISED — B before C, not parallel):
```
A (Foundation) ──> B (All-Agent) ──> C (Backend) ──> F (Pipeline Wiring)
       │                                    │
       └──> E (RCA)                         └──> D (Frontend)
                                                      │
                                             G (Testing) ←──┘
H (Shared Rules) runs WITH B (same files, same time)
```
**Why sequential B→C**: B defines the bug report format and classification logic. C must implement storage that matches. Parallel would cause format mismatch.

---

## SUBPLAN_A: Foundation — Types, Config, Regression Safety

**Files to modify**:
- `src/framework-contracts/diagnostics.ts` — new types
- `scripts/shared-types.ts` — extend QueueItem + SHARED_PATHS
- `config/pipeline-config.json` — bugHuntingRulebook section

### A1. New types in `diagnostics.ts`
```
BugHuntCategory: FEATURE_CHANGED_SMALL | FEATURE_CHANGED_BIG | TESTID_MISSING | TESTID_CHANGED | UNCHANGED_FAILURE | FLAKE | INFRASTRUCTURE_TRANSIENT
ChangeSize: SMALL | BIG
TestIdStatus: PRESENT | MISSING | CHANGED
AutonomyDecision: AUTONOMOUS | HUMAN_REVIEW
AgentNotification: { id, fromAgent, toAgent, type: 'stale_artifact'|'selector_change'|'big_change_escalation', affectedFiles[], changeSummary, timestamp, acknowledged: boolean }
EscalationRequest: { id, sourceAgent, targetAgent, reason, changeScopeFiles[], blockedItemId, status: 'open'|'resolved'|'overridden', createdAt }
TestIdTracker: { selectorKey, expectedTestId, actualTestId: string|null, status: TestIdStatus, lastVerified, pageUrl }
```

**REGRESSION FIX**: Extend `TriageResult` with OPTIONAL new fields (backward compat):
```
bugHuntCategory?: BugHuntCategory
changeSize?: ChangeSize
testIdStatus?: TestIdStatus
autonomyDecision?: AutonomyDecision
```
Keep `disposition` field — both coexist. `bugHuntCategory` is the detailed classification, `disposition` is the coarse one (mapped: UNCHANGED_FAILURE→BUG, TESTID_MISSING→BUG, TESTID_CHANGED→FEATURE_CHANGE, FEATURE_CHANGED_*→FEATURE_CHANGE).

### A2. Extend `shared-types.ts`
- Add `notifications` to SHARED_PATHS: `path.join(..., 'agent-notifications.json')`
- Add `escalationsFile` to SHARED_PATHS: `path.join(..., 'agent-escalations.json')`
- Extend QueueItem with OPTIONAL fields: `bugHuntCategory?`, `escalationReason?`, `blockedByBigChange?`, `awaitingPriorAgentRework?`
- **REGRESSION FIX**: Existing `blocked`/`blockedBy`/`blockedReason` are for audit blocks; new `blockedByBigChange` is separate gate

### A3. Pipeline config
Add `bugHuntingRulebook` section with thresholds and autonomy rules.

### A4. Create `src/utils/agent-notification-writer.ts` (NEW)
- `writeNotification(notification: AgentNotification): void`
- `readPendingNotifications(forAgent: string): AgentNotification[]`
- `ackNotification(id: string): void`
- Format: JSON array in file, acknowledged items filtered on read

### A5. Create `src/utils/bug-hunt-classifier.ts` (NEW)
Pure functions:
- `classifyBugHuntCategory(failure, signals, selectorRegistry) → { bugHuntCategory, changeSize, testIdStatus, autonomyDecision, disposition }`
- Maps BOTH bugHuntCategory AND disposition (backward compat)
- `classifyChangeSize(affectedSelectors[], affectedFiles[], config) → ChangeSize`
- `determineAutonomy(category, confidence) → AutonomyDecision`

**Verify**: `npx tsc --noEmit` passes, no import breaks

---

## SUBPLAN_B: All-Agent Bug Awareness — Line of Defense

**VISION**: Every agent that touches the live application or reads test artifacts is a bug detector. The pipeline is a gauntlet — bugs get harder to miss at each stage. Each agent has a specific bug detection mandate based on what it can see.

### B1. Requirements Agent — First Line of Defense
**File**: `.github/agents/playwright-requirements.agent.md`

**Current gap**: Documents what it sees but has NO escalation mechanism for bugs found during exploration.

**Add**:
- New rule `REQ-014: BUG DETECTION MANDATE` — During Phase 1 live exploration (READ-ONLY, no clicking):
  - If you see a console error in browser via `browser_console_messages` → file ESC-REQ entry to `agent-escalations.json` with evidence
  - If UI shows error state visually (red borders, error messages, broken images) → document as `[POSSIBLE_BUG]` tag in REQUIREMENTS.md
  - If form fields show inconsistent state in snapshot (e.g., label says "Required" but no asterisk) → document as `[POSSIBLE_BUG]`
  - **NOTE**: Requirements is READ-ONLY (REQ-008). It observes but does NOT click/type. Interaction bugs (button does nothing, save fails) are detected by Planner (B2) and Generator (B3) who DO interact.
  - If ANY interactive element visible in DOM lacks a `data-testid` attribute → note in requirements as `[MISSING_TESTID]` for downstream agents
- New rule `REQ-015: TESTID INVENTORY` — During exploration, capture ALL `data-testid` attributes found via `browser_evaluate(() => [...document.querySelectorAll('[data-testid]')].map(el => el.dataset.testid))`. Write to `specs_planning/_internal/testid-inventory-{page}.json`. This becomes the baseline for test-ID change detection.
- New rule `REQ-016: NETWORK MONITORING` — After every navigation and interaction, check `browser_network_requests` for 4xx/5xx. Log as `[NETWORK_ERROR]` tags in requirements.

**GUIDANCE FOR EXECUTING AGENT**: The Requirements agent is READ-ONLY (REQ-008). It cannot fix bugs. Its job is to DOCUMENT them so downstream agents know what they're walking into. Every `[POSSIBLE_BUG]` and `[MISSING_TESTID]` tag becomes actionable input for Planner and Generator. The testid-inventory file is the BASELINE — without it, we can't detect test-ID changes later.

### B2. Planner Agent — Second Line of Defense
**File**: `.github/agents/playwright-test-planner.agent.md`

**Current gap**: Phase 2 QA is thorough but doesn't explicitly file bugs. PLN-027 selector verification isn't a hard gate.

**Add**:
- New rule `PLN-033: BUG DETECTION MANDATE` — During Phase 2 manual QA:
  - If save/submit produces a 500 error → file ESC-PLN to `agent-escalations.json`, do NOT create TC for broken feature
  - If validation error message is wrong/misleading → file as `[APP_BUG]` in test case notes
  - If dropdown/field is empty when it should have options → `[APP_BUG]`
  - If `data-testid` from Requirements inventory is MISSING on live DOM → `[TESTID_MISSING_BUG]` in TC + escalation
- New rule `PLN-034: MANDATORY SELECTOR HARD GATE` — Every selector referenced in TCs MUST be validated using the same logic as `selector-registry-validator.ts` → `validateSelectorsLive(page, registry)`. Concretely: `browser_evaluate(() => !!document.querySelector('[data-testid="X"]'))` for each. If verify fails → do NOT finalize TC, escalate as selector issue. **ONE IMPLEMENTATION**: Planner uses the same validation approach that the framework utility uses — never two independent checks.
- New rule `PLN-035: UPSTREAM VALIDATION` — Cross-check Requirements `[POSSIBLE_BUG]` tags. If Requirements flagged something as buggy, Planner MUST verify on live DOM. If confirmed → file bug report via escalation. If resolved → note as `[BUG_CLEARED]`.
- New rule `PLN-036: NOTIFICATION CHECK` — At session start, read `agent-notifications.json` for stale_artifact notifications. If found, update affected TCs FIRST.

**GUIDANCE FOR EXECUTING AGENT**: The Planner sees the app through the lens of test case creation. It's uniquely positioned to find bugs that only manifest during specific user flows (multi-step saves, dialog sequences, field dependencies). The hard gate on selector verification (PLN-034) is the CRITICAL addition — it catches test-ID issues BEFORE they reach Generator/Healer. Without this gate, bad selectors propagate downstream and waste cycles.

### B3. Generator Agent — Third Line of Defense
**File**: `.github/agents/playwright-test-generator.agent.md`

**Current gap**: GEN-021 explicitly says "no mechanism existed for generator to report TC conflicts." Phase 0.5 walkthrough finds issues but classification is best-effort.

**Add**:
- New rule `GEN-033: BUG DETECTION MANDATE` — During Phase 0.5 walkthrough:
  - Classify EVERY mismatch using `ALL-043` categories, then MAP to BugHuntCategory:

  | ALL-043 Category | Maps to BugHuntCategory | Action |
  |---|---|---|
  | `APP_BUG` | `UNCHANGED_FAILURE` | STOP. File bug report to `reports/bugs/BUG-{MOD}-{NNN}.json`. Check dedup via `errorHash` first. Mark TC as `bug-blocked`. Do NOT generate spec. |
  | `PLANNER_GAP` | _(not a bug — escalation)_ | File ESC-GEN to `agent-escalations.json` targeting Planner. Continue with corrected values but flag. |
  | `TC_CORRECTION` | _(not a bug — inline fix)_ | Fix inline, document in WALKTHROUGH_LOG |
  | `SEQUENCE_SIDE_EFFECT` | _(not a bug — spec fix)_ | Document, add cleanup step to spec |

  **DEDUP**: Before filing any bug, compute `errorHash` (hash of testName + category + truncatedError) and call `findExistingBug(errorHash)` in `reports/bugs/`. If exists → UPDATE with Generator evidence, don't create duplicate.
- New rule `GEN-034: TESTID VERIFICATION DURING WALKTHROUGH` — For every selector used in TC, verify `data-testid` exists on live DOM during walkthrough. If missing → classify as `TESTID_MISSING` using bug-hunt-classifier. If changed from Planner's value → classify as `TESTID_CHANGED`.
- New rule `GEN-035: NOTIFICATION CHECK` — At session start, read `agent-notifications.json`. Stale artifacts = priority update.
- **FIX GEN-021**: Generator now HAS a mechanism to report TC conflicts — file ESC-GEN escalation for `PLANNER_GAP` and bug report for `APP_BUG`.

**GUIDANCE FOR EXECUTING AGENT**: The Generator is where theory meets reality. Planner documents expected behavior, Generator walks through it on the LIVE app. This is the moment of truth — every mismatch is signal. The executing agent MUST implement the WALKTHROUGH_LOG classification rigorously. The bug filing format should match Healer's `reports/bugs/` structure exactly so downstream tools can process both sources identically. The GEN-021 fix is a CRITICAL gap closure — without it, Generator discovers issues but has no way to route them.

### B4. Healer Agent — Primary Defense (4-Category Rulebook)
**File**: `.github/agents/playwright-test-healer.agent.md`

**This is the CORE of the rulebook**. Healer already has Phase 0 Triage. Enhance it with the 4-category system.

**Replace Phase 0 Step 0.4 disposition table with**:

```
┌────────────────────────────────────┬──────────────────────┬────────────┬─────────────────────────────────────────────────┐
│ Evidence Pattern                   │ BugHuntCategory      │ Autonomy   │ Action                                          │
├────────────────────────────────────┼──────────────────────┼────────────┼─────────────────────────────────────────────────┤
│ No change signals + console error  │ UNCHANGED_FAILURE    │ AUTONOMOUS │ Bug report → reports/bugs/. test.skip('bug-     │
│ / network 5xx / value mismatch     │                      │            │ blocked'). Do NOT heal.                         │
├────────────────────────────────────┼──────────────────────┼────────────┼─────────────────────────────────────────────────┤
│ data-testid gone / never existed   │ TESTID_MISSING       │ AUTONOMOUS │ Bug report (critical). test.skip('bug-blocked') │
├────────────────────────────────────┼──────────────────────┼────────────┼─────────────────────────────────────────────────┤
│ data-testid value changed          │ TESTID_CHANGED       │ HUMAN_     │ Report + adapt selector. Send to triage for     │
│                                    │                      │ REVIEW     │ user review ("could be known change or bug")    │
├────────────────────────────────────┼──────────────────────┼────────────┼─────────────────────────────────────────────────┤
│ Feature change, ≤3 files +         │ FEATURE_CHANGED_     │ AUTONOMOUS │ Heal framework + spec. Write notification to    │
│ ≤5 selectors affected              │ SMALL                │            │ agent-notifications.json for Gen/Planner.        │
├────────────────────────────────────┼──────────────────────┼────────────┼─────────────────────────────────────────────────┤
│ Feature change, >3 files OR        │ FEATURE_CHANGED_     │ HUMAN_     │ DENY working. Write escalation. Set             │
│ >5 selectors affected              │ BIG                  │ REVIEW     │ blockedByBigChange=true. Previous agents need   │
│                                    │                      │            │ rework first.                                   │
├────────────────────────────────────┼──────────────────────┼────────────┼─────────────────────────────────────────────────┤
│ Mixed/insufficient signals         │ (keep as UNCERTAIN)  │ HUMAN_     │ Phase A for more evidence. If still uncertain   │
│                                    │                      │ REVIEW     │ → triage to user.                               │
└────────────────────────────────────┴──────────────────────┴────────────┴─────────────────────────────────────────────────┘
```

**Add rules**:
- `HLR-018`: After healing SMALL change → `writeNotification({ type: 'stale_artifact', toAgent: 'generator' })` AND `writeNotification({ type: 'stale_artifact', toAgent: 'planner' })` with affected files + change summary
- `HLR-019`: For BIG changes → write escalation to `agent-escalations.json` with `{ targetAgent: <whichever prior agent's work is affected>, changeScopeFiles, reason }`. Set queue item `blockedByBigChange: true`. Do NOT attempt healing.
- `HLR-020`: Use `classifyBugHuntCategory()` from `src/utils/bug-hunt-classifier.ts` — do NOT classify manually. The function ensures consistent classification and populates BOTH `bugHuntCategory` AND `disposition` fields.
- `HLR-021`: **BUG VERIFICATION** — At session start, check `reports/bugs/` for bugs with status `fixed`. For each, run the bug-blocked test via `--grep "TC-ID"`. If passes → update to `verified`, remove `test.skip`. If fails → back to `in_progress`.
- `HLR-022`: **FIRST-RUN BASELINE** — On first run for a page (no `test_id_registry` entries), TESTID_CHANGED is impossible. Only PRESENT or MISSING can be detected. All detected testids populate the registry as baseline for future comparison.

**GUIDANCE FOR EXECUTING AGENT**: The Healer is the SPECIALIST. Its Phase 0 triage is the most critical decision point in the pipeline — it determines whether a failure is a real bug, a feature change, or a test issue. The executing agent must ensure the Healer prompt text is PRECISE and unambiguous. Every signal combination must map to exactly one category. The small/big threshold (3 files, 5 selectors) should be configurable via pipeline config, not hardcoded in the prompt. The notification mechanism is the backbone of inter-agent communication — if it fails, other agents work with stale data.

### B5. Audit Agent — Final Line of Defense (Meta-Verification)
**File**: `.github/agents/playwright-pipeline-audit.agent.md`

**Current gap**: Mode 5 Triage trusts failure-summary classification (ALL-047 warns it can be wrong). Doesn't verify other agents' bug detection compliance.

**Add**:
- New rule `AUD-023: BUG DETECTION COMPLIANCE AUDIT` — When auditing ANY agent, verify:
  1. Did agent check `agent-notifications.json` at start? (Check activity log)
  2. Did agent file escalations when upstream issues found? (Check `agent-escalations.json`)
  3. Did agent use correct `bugHuntCategory` classification? (Verify against evidence)
  4. If agent found APP_BUG, did it file to `reports/bugs/`?
  5. If Generator, did Phase 0.5 walkthrough classify ALL mismatches?
  6. If Planner, did selector hard gate (PLN-034) pass for ALL selectors?
- New rule `AUD-024: MODE 5 PRE-FLIGHT` — Before trusting `failureCategory` in failure-summary.json, re-read the raw artifacts (error-context.md, consoleErrors, networkFailures) and verify classification matches. Override if wrong.
- New rule `AUD-025: TESTID INVENTORY RECONCILIATION` — Compare Requirements agent's `testid-inventory-{page}.json` against current selector registry (`src/selectors/index.ts`). Report discrepancies.
- New rule `AUD-026: BUG HUNT CATEGORY DISTRIBUTION ANALYSIS` — After all triage items classified, produce summary: "X autonomous bug reports, Y human-review items, Z escalations." If autonomous ratio is suspiciously high (>80%) or low (<20%), flag for user attention.

**GUIDANCE FOR EXECUTING AGENT**: The Audit agent is the LAST line of defense. If a bug slipped through Requirements, Planner, Generator, and Healer, Audit must catch it. The compliance audit (AUD-023) is the most important addition — it ensures every agent actually DID their bug detection job, not just claimed to. The Mode 5 pre-flight (AUD-024) fixes the known weakness where auto-classification in failure-summary.json can be wrong. The testid reconciliation (AUD-025) closes the loop on the test-ID lifecycle.

---

## SUBPLAN_C: Backend API + DB

**Files to modify**:
- `website/backend/src/services/tenant.service.ts` — DB migration
- `website/backend/src/routes/bug-reports.routes.ts` — rewrite to DB-backed
- `website/backend/src/routes/test-ids.routes.ts` — NEW
- `website/backend/src/routes/escalations.routes.ts` — NEW
- `website/backend/src/index.ts` — register new routes
- `website/backend/src/services/chatbot.service.ts` — ACTION_CATALOG

### C1. DB Tables
Add to tenant schema creation in `tenant.service.ts`:
- `bug_reports` (id, test_case_id, module, feature, severity, title, description, steps_to_reproduce JSONB, expected_behavior, actual_behavior, page_url, screenshot_path, failure_category, bug_hunt_category, triage_result JSONB, rca_evidence JSONB, status, run_id, source_agent, website_id, created_at, updated_at)
- `test_id_registry` (id, selector_key UNIQUE per website, test_id_value, page_url, status, first_seen_run, last_verified_run, last_verified_at, change_history JSONB, website_id)
- `failure_history` (id, test_name, test_file, error_hash, failure_category, bug_hunt_category, run_id, website_id, created_at)

### C2. Rewrite `bug-reports.routes.ts`
- DB-backed CRUD (file-based as fallback if DB unavailable)
- **REGRESSION FIX**: Keep existing endpoint shapes, add `bugHuntCategory` as optional field
- New: `GET /api/bugs/history?testName=X` — count failures across runs
- New: `GET /api/bugs/correlation?runId=X` — cross-run pattern detection

### C3. New routes
- `test-ids.routes.ts`: GET list, POST verify (bulk), PATCH update, GET changes-since
- `escalations.routes.ts`: POST create, GET list, PATCH resolve, POST rework-complete

### C4. SSE events
- `escalation_required` — emitted when big change escalation created
- `agent_notification` — emitted when stale_artifact notification written
- `testid_change_detected` — emitted when test-ID registry shows changes

### C5. ACTION_CATALOG entries
Pipeline management:
- `view_escalations` (all roles) — "show open escalations"
- `resolve_escalation` (admin+) — "resolve escalation X / send back to planner"
- `view_test_id_changes` (all) — "show test-ID changes from last run"

Bug lifecycle (chat-first actions):
- `show_bugs` (all) — "show me open bugs" / "list bugs for settings module"
- `mark_bug_fixed` (admin+) — "mark BUG-SET-001 as fixed"
- `verify_bug_fix` (admin+) — "retest BUG-SET-001" (triggers Healer HLR-021 for that bug)
- `view_bug_history` (all) — "how many times has TC-SET-001 failed?"
- `reclassify_bug` (admin+) — "change BUG-SET-001 from flake to real bug"
- `show_flaky_tests` (all) — "which tests are flaky?"

**GUIDANCE FOR EXECUTING AGENT**: The DB migration is the riskiest part. tenant.service.ts creates schemas dynamically per client. The executing agent MUST read the current schema creation code and follow the exact same pattern for new tables. The bug_reports table intentionally has `source_agent` column — bugs can come from Generator (walkthrough), Healer (triage), or Planner (QA). This field is critical for analytics. Keep file-based fallback alive — the pipeline scripts write to `reports/` directly, and the DB sync happens in the backend layer.

---

## SUBPLAN_D: Frontend UX

**Files to modify**:
- `website/frontend/src/components/dashboard/TriagePanel.tsx`
- `website/frontend/src/components/chat/ChatTriageCard.tsx`
- `website/frontend/src/components/dashboard/BugDiscoveryPanel.tsx`
- `website/frontend/src/components/dashboard/BugDetailModal.tsx` — NEW
- `website/frontend/src/components/dashboard/TestIdChangePanel.tsx` — NEW
- `website/frontend/src/components/pipeline/EscalationBanner.tsx` — NEW
- `website/frontend/src/services/escalationApi.ts` — NEW
- `website/frontend/src/services/testIdApi.ts` — NEW

### D1. TriagePanel.tsx — 4-Category Grouping
**REGRESSION FIX**: Add `bugHuntCategory` mapping alongside existing `disposition` mapping. Read `bugHuntCategory` when present, fall back to `disposition`:
```
UNCHANGED_FAILURE → { label: 'Bug (Feature Intact)', color: red, icon: Bug, auto: true }
FEATURE_CHANGED_SMALL → { label: 'Small Change (Auto-heal)', color: blue, icon: Wrench, auto: true }
FEATURE_CHANGED_BIG → { label: 'Big Change (Escalated)', color: amber, icon: AlertTriangle, auto: false }
TESTID_MISSING → { label: 'Test-ID Missing (Bug)', color: red, icon: Bug, auto: true }
TESTID_CHANGED → { label: 'Test-ID Changed (Review)', color: amber, icon: Search, auto: false }
UNCERTAIN → { label: 'Needs Review', color: gray, icon: HelpCircle, auto: false }
```
Add "Autonomous Action Log" section: green "Auto-decided" badge vs amber "Your decision needed" badge.

### D2. ChatTriageCard.tsx — Escalation + Test-ID Review
- For `FEATURE_CHANGED_BIG`: show escalation card with affected files, target agent, "Approve Escalation" / "Override: Heal Anyway"
- For `TESTID_CHANGED`: show old/new value, "Known Change" / "This is a Bug" toggle

### D3. BugDetailModal.tsx (NEW)
- Full RCA evidence display: steps, expected/actual, screenshot, console errors, network failures, DOM diff, historical failure count, source agent

### D4. TestIdChangePanel.tsx (NEW)
- Registry diff table: selector key, old testid, new testid, status, action toggle

### D5. EscalationBanner.tsx (NEW)
- Pipeline-level banner when escalations block progress
- Shows blocked stage, reason, action buttons

### D6. BugDiscoveryPanel.tsx — Analytics
- Autonomous vs manual ratio, failure trends (last 10 runs), flaky test detection (3+ failures same test)

**GUIDANCE FOR EXECUTING AGENT**: The frontend must feel EFFORTLESS. Users are non-technical. Every category should be instantly recognizable by color and icon — no reading required. The "Auto-decided" vs "Your decision needed" split is the CORE UX innovation — users see at a glance what the system handled and what needs their brain. The escalation card must NOT block chat (per feedback_chat_not_blocked.md). Use modal or inline card, never view replacement.

---

## SUBPLAN_E: RCA Enhancements

**Files**:
- `src/utils/dom-diff.ts` — NEW
- `src/utils/selector-registry-validator.ts` — NEW
- `src/utils/diagnostics-collector.ts` — extend
- `src/utils/agent-reporter.ts` — extend

### E1. DOM Diff (`dom-diff.ts`)
- `captureDomSnapshot(page)` — serialize DOM with data-testid, text, structure
- `diffDomSnapshots(before, after)` — element-level diff
- `classifyDomChanges(diffs)` — categorize: selector changes, content changes, layout changes → feeds into changeSize classification

### E2. Selector Registry Validator (`selector-registry-validator.ts`)
- `buildSelectorRegistry()` — parse `src/selectors/index.ts` + sub-modules
- `validateSelectorsLive(page, registry)` — check each selector against live DOM → PRESENT/MISSING/CHANGED
- `detectTestIdChanges(prev, current)` — diff two validation runs

### E3. DiagnosticsCollector extension
- Optional HAR capture — **smart capture**: store only FAILED requests (4xx/5xx) + 5 requests before/after failure for context. Configurable cap via env var `HAR_MAX_SIZE` (default 1MB, set higher for debugging). Full HAR available via `FULL_HAR=true` for local debugging.
- Full DOM state serialization at failure point
- Both fields OPTIONAL in DiagnosticSnapshot to avoid breaking existing consumers
- **Visual regression note**: Screenshot comparison (pixel diff) is OUT OF SCOPE for this plan. Future enhancement: integrate with Playwright's `toHaveScreenshot()` for visual regression.

### E4. AgentReporter extension
**REGRESSION FIX**: `bugHuntCategory`, `testIdStatus`, `changeSize` are set to `null` during test execution (reporter doesn't know yet). They get populated POST-RUN by Healer Phase 0. Add `failureCount` via local file history check.

**GUIDANCE FOR EXECUTING AGENT**: The RCA tools are what separate our platform from basic test runners. A manual QA engineer has: the page, the network tab, the console, the DOM inspector, and their memory of what it looked like before. Our agents need ALL of that plus historical correlation. The DOM diff is the most complex piece — it needs to be meaningful (not just "everything changed") by focusing on testid-bearing elements and visible text content. The selector validator is the BASELINE for test-ID change detection — it compares our selector registry against the live app.

---

## SUBPLAN_F: Pipeline Wiring

**Files**:
- `scripts/healer-post-complete.ts` — escalation + notification gates
- `scripts/generator-pre-run.ts` — notification check
- `scripts/planner-pre-run.ts` — notification check
- `scripts/healer-pre-run.ts` — check for resolved escalations
- `website/backend/src/services/chatbot.service.ts` — ACTION_CATALOG

### F1. Healer post-complete escalation flow
- If `bugHuntCategory === FEATURE_CHANGED_BIG` → don't transition to `pending_audit`, emit `escalation_required` SSE
- User reviews → "Send back to [agent]" or "Force continue"

**Rework API chain** (complete specification):
1. Frontend calls `POST /api/escalations/:id/rework` with `{ targetAgent: 'planner', pageId, injectedContext }`
2. Backend `escalations.routes.ts` validates, updates escalation status to `rework_in_progress`
3. Backend calls orchestrator: `POST /api/pipeline/run` with `{ startStage: 'planning', pageId, injectedContext: { escalationId, changeSummary, staleArtifacts } }`
4. Orchestrator creates queue item for target agent with escalation context
5. Target agent runs, completes rework
6. Target agent's post-complete script calls `POST /api/escalations/:id/rework-complete`
7. Backend updates escalation to `resolved`, emits SSE `escalation_resolved`
8. Original blocked pipeline resumes from where it stopped

**Escalation target selection** (minimum necessary agent, page-scoped):
- If ONLY test case values are stale → target: `planner` (just rework TCs)
- If page structure changed (layout, navigation, new sections) → target: `requirements` + `planner`
- Escalation is ALWAYS page-scoped: `{ pageId, affectedSelectors[] }`. Other pages in same run are NOT blocked.
- User can override target in frontend (e.g., choose to only send to planner even if requirements suggested)

### F2. Pre-run notification checks (all agents)
- Generator: check notifications → prioritize stale artifact updates
- Planner: check notifications → update affected TCs
- Healer: check if previously-blocked escalation resolved → proceed

### F3. Test-ID lifecycle
- After healer run: persist selector validation results to `test_id_registry` table
- Next run: compare current validation against registry → detect changes

**GUIDANCE FOR EXECUTING AGENT**: The pipeline wiring is where all the pieces connect. The most critical integration is the escalation flow — when Healer says "this change is too big," the pipeline MUST stop, the user MUST see it, and the rework path MUST be clear. Test this end-to-end: Healer blocks → SSE fires → frontend shows banner → user clicks "send back to planner" → planner queue item created → planner runs → rework-complete → healer unblocked. If any link in this chain breaks, the whole system fails silently.

---

## SUBPLAN_G: Testing + Validation

- Unit tests for `bug-hunt-classifier.ts` — every category combo + edge cases
- Unit tests for `agent-notification-writer.ts` — write/read/ack cycle
- Unit tests for `selector-registry-validator.ts` — PRESENT/MISSING/CHANGED detection
- Integration test: escalation flow (block → SSE → review → unblock)
- API tests: bug CRUD + test-ID registry + escalation lifecycle + historical correlation
- Agent prompt dry-run: verify each agent's bug detection mandate produces correct output for test scenarios

---

---

## AUDIT GAP FIXES (7 critical gaps found during self-audit)

### GAP 1: Bug Deduplication
**Problem**: Generator finds APP_BUG during walkthrough, files report. Later, Healer classifies same failure as UNCHANGED_FAILURE, files second report. Duplicate.

**Fix**: Add dedup logic to bug filing:
- Every bug report gets an `errorHash` (hash of: testName + failureCategory + truncatedError)
- Before filing, check `reports/bugs/` for existing report with same `errorHash`
- If found: UPDATE existing report with new evidence (add source_agent, append to evidence chain), don't create new
- DB: UNIQUE constraint on (error_hash, website_id, status != 'fixed')
- Implementation: Add `findExistingBug(errorHash)` to bug-hunt-classifier.ts

### GAP 2: Retry/Flake Awareness + FLAKE→BUG Auto-Promotion
**Problem**: Test fails on attempt 1 (transient 500) but passes on attempt 2. FailureEntry has `retryAttempt` field but plan ignores it. Could classify transient failure as UNCHANGED_FAILURE (bug) incorrectly.

**Fix**: Add retry-awareness to classification:
- If `retryAttempt > 0` AND test eventually passed → classify as `FLAKE`, not `UNCHANGED_FAILURE`
- If `retryAttempt > 0` AND test still fails → classify normally (persistent = real)
- Add `FLAKE` to BugHuntCategory enum: `FLAKE` → autonomous, log but do NOT file bug report. Add to `failure_history` for flake tracking.
- Frontend: Add "Flaky" category with yellow color in TriagePanel
- Flake threshold: Same test flakes 3+ times in 5 runs → escalate to user ("this test is unreliable, investigate or stabilize")

**FLAKE→BUG auto-promotion**:
- If same test flakes 3+ times in last 5 runs AND errorHash is consistent (same error pattern) → auto-promote from FLAKE to UNCHANGED_FAILURE (real bug)
- Implementation in `bug-hunt-classifier.ts`: `checkFlakePromotion(testName, errorHash, failureHistory) → boolean`
- If promoted → file bug report automatically, mark as "promoted from flake pattern"
- User can also manually reclassify via chat action `reclassify_bug`

### GAP 3: Bug Lifecycle (Discovery → Resolution)
**Problem**: Plan covers bug DISCOVERY but not the full lifecycle. When is a bug closed? Who verifies the fix? How does `test.skip('bug-blocked')` get removed?

**Fix**: Add bug lifecycle state machine:
```
open → confirmed → in_progress → fixed → verified → closed
                                       ↘ wont_fix
                                       ↘ not_a_bug
```
- `open`: Auto-filed by agent
- `confirmed`: Human reviews and confirms it's real
- `in_progress`: Developer is fixing (tracked externally or via Jira integration)
- `fixed`: Developer says fixed
- `verified`: **Healer re-runs the bug-blocked test**. If passes → verified. If fails → back to `in_progress`.
- `closed`: Verified and `test.skip('bug-blocked')` annotation REMOVED from spec

**Add to Healer**: New rule `HLR-021: BUG VERIFICATION` — At session start, check `reports/bugs/` for bugs with status `fixed`. For each, run the bug-blocked test via `--grep "TC-ID"`. If passes → update to `verified`, remove `test.skip`. If fails → update to `in_progress` with "fix didn't work" note.

**Add to Frontend**: Bug detail view shows lifecycle timeline. "Verify Fix" button triggers re-test.

### GAP 4: Escalation Timeout / SLA
**Problem**: Big change escalation blocks pipeline. User doesn't review for hours/days. Pipeline stuck indefinitely.

**Fix**:
- Escalation has `createdAt` timestamp
- After 24 hours with no action → SSE emits `escalation_stale` event
- Frontend shows warning: "Escalation pending for 24h+ — pipeline blocked"
- After 48 hours → auto-escalate to super_admin notification
- User can configure SLA thresholds in pipeline config: `escalationSLA: { warningHours: 24, criticalHours: 48 }`
- NO auto-resolution — human must act. But visibility increases with time.

### GAP 5: Force-Continue Consequences
**Problem**: User clicks "Override: Force Continue" on big change escalation. Downstream agents (Healer, Audit) work with potentially stale data.

**Fix**:
- When force-continued, inject `forceOverrideContext` into queue item: `{ overriddenAt, overriddenBy, originalEscalation, staleArtifacts[] }`
- Healer sees this → adds warning to triage: "This run was force-continued past a big change escalation. Results may be unreliable."
- Audit sees this → mandatory finding: "Force-override used — verify all test results against current app state"
- Frontend: "Force-continued" badge on run in RunTable (amber warning)
- Bug reports from force-continued runs get `confidence: 'LOW'` automatically

### GAP 6: Parallel Worker Race Conditions
**Problem**: File-based `agent-notifications.json` and `agent-escalations.json` can have race conditions with multiple workers.

**Fix**:
- Use file locking: `fs.writeFile` with `{ flag: 'wx' }` for creation, read-modify-write with lockfile for updates
- Better: Use atomic append pattern — each notification/escalation is a separate file: `agent-notifications/{timestamp}-{agent}.json`
- Reader globs all files, filters by `forAgent`, acknowledges by deleting file
- This eliminates read-modify-write race entirely
- Implementation: Update `agent-notification-writer.ts` to use per-file pattern instead of single array file

### GAP 7: Transient Network Failures → False Positive Bug Reports
**Problem**: Server has momentary 500 during test. No feature change, no selector issue. Classified as UNCHANGED_FAILURE → auto-filed as bug. But it's infra, not a real bug.

**Fix**: Add signal weighting to classification:
- `SIG-NETWORK-500` alone (no console error, no value mismatch) → check `INFRASTRUCTURE` category first
- If ONLY network signal + no DOM evidence of bug → classify as `INFRASTRUCTURE_TRANSIENT`, not `UNCHANGED_FAILURE`
- `INFRASTRUCTURE_TRANSIENT` → auto-retry the test once. If passes → `FLAKE`. If fails again → `UNCHANGED_FAILURE` (persistent = real bug)
- Add to `bug-hunt-classifier.ts`: network-only failures get one retry before bug classification

---

## SUBPLAN_H: AGENT_SHARED_RULES.md — Universal Bug Detection Rules

**File**: `docs/read_only_docs/AGENT_SHARED_RULES.md`

Add new universal rules that ALL agents must follow:

- `ALL-053: NOTIFICATION CHECK AT SESSION START` — Every agent MUST read `agent-notifications/` directory for pending notifications addressed to them. Stale artifact notifications = priority work before user task.
- `ALL-054: ESCALATION FILING PROTOCOL` — When discovering upstream agent mistakes or app bugs beyond your scope, file escalation to `agent-escalations.json` with: evidence (file:line or MCP snapshot), target agent, severity, affected artifacts. Never silently correct another agent's output without filing.
- `ALL-055: BUG REPORT FORMAT` — All bug reports (from any agent) use identical format in `reports/bugs/BUG-{MOD}-{NNN}.json`: `{ id, testCaseId, module, feature, severity, title, description, stepsToReproduce, expectedBehavior, actualBehavior, pageUrl, screenshotPath, failureCategory, bugHuntCategory, sourceAgent, errorHash, rcaEvidence, status, runId, createdAt }`. Dedup via errorHash before creating new.
- `ALL-056: TESTID VERIFICATION` — Any agent that navigates to a page and reads DOM MUST check for `data-testid` presence on interactive elements. Missing testids = `[MISSING_TESTID]` tag or escalation. This is the foundation of automation testing best practices.
- `ALL-057: BUGhunt CATEGORY MAPPING` — When an agent classifies a failure or issue, it MUST use BugHuntCategory enum (UNCHANGED_FAILURE, FEATURE_CHANGED_SMALL, FEATURE_CHANGED_BIG, TESTID_MISSING, TESTID_CHANGED, FLAKE, INFRASTRUCTURE_TRANSIENT) AND set the legacy disposition field for backward compat.
- `ALL-058: FIRST-RUN BASELINE` — On first pipeline run for a page, there is no historical data. TESTID_CHANGED cannot be detected. All data collected becomes the BASELINE for future comparison. Agents must not classify anything as "changed" without a previous value to compare against.

**GUIDANCE FOR EXECUTING AGENT**: These rules go in AGENT_SHARED_RULES.md § (new section after §12). They MUST be added alongside SUBPLAN_B agent-specific rules. Run `npm run validate:sync` after updating to ensure cross-references are valid. Every agent prompt that references ALL-0xx rules will pick these up automatically via the shared rules import.

---

## E2E User Journeys & Scenarios

### Journey 1: Happy Path — All Tests Pass
```
Requirements → explores app, captures testid inventory, no bugs found
Planner → creates TCs, all selectors verify via PLN-034 gate
Generator → Phase 0.5 walkthrough matches TCs, generates spec, first run PASSES
Audit → all checks pass, no findings
Result: Pipeline complete, no bugs, no triage needed
```

### Journey 2: Small Feature Change Detected by Healer
```
Generator → spec generated, first run has 2 failures (button label changed from "Save" to "Submit")
Healer → Phase 0 triage:
  - SIG-LABEL-CHANGE (meaningful, not typo)
  - SIG-SELECTOR-MOVED (button same testid, different text)
  - Affected: 1 file, 2 selectors → SMALL change
  - Category: FEATURE_CHANGED_SMALL, Autonomy: AUTONOMOUS
  - Action: Heal spec (update assertion from "Save" to "Submit"), heal framework if selector text changed
  - Write notification to Generator + Planner: "Button label changed Save→Submit on /settings page"
Audit → verifies heal, checks notification was written
NEXT RUN: Generator reads notification → updates TC expected values first → generates updated spec
Result: Self-healing pipeline, no human needed
```

### Journey 3: Big Feature Change → Escalation → Rework
```
Healer → Phase 0 triage:
  - SIG-LAYOUT-CHANGE (entire form restructured)
  - SIG-SELECTOR-GONE (5 selectors missing)
  - SIG-LABEL-CHANGE (multiple fields renamed)
  - Affected: 4 files, 8 selectors → BIG change
  - Category: FEATURE_CHANGED_BIG, Autonomy: HUMAN_REVIEW
  - Action: DENY healing. Write escalation targeting Planner (TCs need rework) and Requirements (exploration outdated)
Pipeline BLOCKS → SSE: escalation_required
Frontend → EscalationBanner: "Big change on /settings — 8 selectors affected. Planner + Requirements need rework."
User clicks "Send back to Planner" → creates planner queue item with injected context about changes
Planner re-explores → updates TCs → Generator regenerates → Healer now has valid input → PASSES
Result: Orderly rework, no wasted cycles
```

### Journey 4: Test-ID Missing → Bug Report
```
Generator → Phase 0.5 walkthrough:
  - TC says click [data-testid="btnSaveSettings"]
  - browser_evaluate: document.querySelector('[data-testid="btnSaveSettings"]') === null
  - Check testid-inventory from Requirements: "btnSaveSettings" was NEVER in inventory
  - Category: TESTID_MISSING, Autonomy: AUTONOMOUS
  - Action: File bug report BUG-SET-001: "Missing data-testid on Save Settings button"
  - test.skip('bug-blocked: BUG-SET-001')
  - Continue with remaining TCs
Healer → skips bug-blocked test, heals others
Audit → verifies bug report has evidence, testid inventory checked
Frontend → BugDiscoveryPanel: new bug BUG-SET-001 (critical, testid missing)
LATER: Developer adds data-testid → marks bug as "fixed"
NEXT RUN: Healer checks fixed bugs → runs bug-blocked test → PASSES → removes test.skip → status: verified
Result: Full lifecycle from discovery to resolution
```

### Journey 5: Test-ID Changed → Human Review
```
Healer → Phase 0 triage:
  - Selector [data-testid="drpCurrency"] not found
  - DOM shows [data-testid="drpCurrencySelector"] exists (similar name)
  - SIG-SELECTOR-MOVED (testid changed, not removed)
  - Category: TESTID_CHANGED, Autonomy: HUMAN_REVIEW
  - Action: Triage item created, adapt selector provisionally, ask user to review
Frontend → ChatTriageCard:
  - "Test-ID changed: drpCurrency → drpCurrencySelector"
  - Toggle: "Known change (adapt)" / "This is a bug (report)"
User clicks "Known change" → selector adapted in registry, no bug filed
Result: Human confirms, system adapts
```

### Journey 6: Feature Intact, Test Fails → Real Bug
```
Healer → Phase 0 triage:
  - SIG-CONSOLE-ERROR: "TypeError: Cannot read property 'map' of undefined" at settings.js:142
  - SIG-NETWORK-500: POST /api/settings returns 500
  - No change signals (selectors present, layout same, labels same)
  - Category: UNCHANGED_FAILURE, Autonomy: AUTONOMOUS
  - Action: Bug report BUG-SET-002: "500 error on settings save — TypeError in settings.js:142"
  - test.skip('bug-blocked: BUG-SET-002')
  - RCA evidence: console error text, network response body, DOM snapshot, screenshot
Frontend → BugDiscoveryPanel: new bug BUG-SET-002 (high severity, server error)
Result: Real bug caught and documented with full evidence
```

### Journey 7: Transient Network Failure → Not a Bug
```
Test run: POST /api/data returns 503 (server overloaded momentarily)
Healer → Phase 0 triage:
  - SIG-NETWORK-500 (but only network signal, no console error, no DOM issue)
  - Classify: INFRASTRUCTURE_TRANSIENT → auto-retry
  - Retry: test passes on second attempt
  - Final: FLAKE (transient, not persistent)
  - Action: Log to failure_history for flake tracking, do NOT file bug
  - If same test flakes 3+ times in 5 runs → escalate to user
Result: No false positive bug report
```

### Journey 8: Same Bug Found by Multiple Agents → Dedup
```
Generator → Phase 0.5 walkthrough: finds /settings 500 error → files BUG-SET-002 (errorHash: abc123)
Healer → Phase 0 triage: same test fails with same 500 error → attempts to file bug
  - findExistingBug(abc123) → found BUG-SET-002 from Generator
  - Action: UPDATE BUG-SET-002 with Healer's additional evidence, don't create duplicate
Result: One bug report, multiple evidence sources
```

### Journey 9: Force-Continue Past Big Change
```
Big change escalation blocking pipeline
User clicks "Override: Force Continue" (needs confirmation dialog)
Pipeline resumes with forceOverrideContext injected
Healer → heals what it can, but adds warning: "Force-continued past big change"
Audit → mandatory finding about force-override
Bug reports from this run → confidence: LOW
RunTable → amber "Force-continued" badge on this run
Result: User chose speed over accuracy, system documents the risk
```

### Journey 10: Bug Verified After Fix
```
BUG-SET-001 (testid missing) → developer adds testid → marks as "fixed"
Next pipeline run → Healer HLR-021:
  - Check reports/bugs/ for status="fixed" bugs
  - Run: --grep "TC-SET-001"
  - Test PASSES → update BUG-SET-001 to "verified"
  - Remove test.skip('bug-blocked: BUG-SET-001') from spec
  - Update test_id_registry: btnSaveSettings status → PRESENT
Result: Full closed-loop bug lifecycle
```

---

## Edge Cases Matrix

| Edge Case | Category | Handling |
|-----------|----------|----------|
| Test-ID never existed (new feature, dev forgot) | TESTID_MISSING | Requirements REQ-015 catches in inventory. If not in inventory AND not in DOM → bug report |
| Feature change affects test DATA, not selectors | FEATURE_CHANGED_* | SIG-VALUE-MISMATCH detects. Change size = count affected assertions, not just selectors |
| Big + small changes simultaneously in same run | Mixed | Classify per-failure, not per-run. Some failures may be SMALL, others BIG. If ANY is BIG → pipeline blocks for that TC only |
| Notification file corrupted | INFRASTRUCTURE | Use per-file pattern (GAP 6 fix). If glob fails → log error, continue without notifications |
| Escalation targets agent not in pipeline | CONFIG_ERROR | Validate targetAgent against pipeline-definition.json agent list. If invalid → escalate to user |
| DB unavailable during bug filing | FALLBACK | File-based fallback always active. DB sync catches up when available |
| User reviews TESTID_CHANGED as "Known change" but it's actually a bug | HUMAN_ERROR | Audit AUD-024 can catch: if selector was adapted but test still fails → flag contradiction |
| Test passes on retry but underlying bug is real (race condition) | FLAKE + BUG | If test flakes 3+ times → user review regardless. Historical correlation reveals pattern |
| Multiple workers writing notifications simultaneously | RACE | Per-file pattern (GAP 6): each write is unique file, no read-modify-write needed |
| Healer heals small change incorrectly → makes things worse | REGRESSION | Phase B has max 2 cycles. If both fail → escalate to user, don't keep trying. Post-complete gate verifies spec still compiles |
| Bug report from run that was later cancelled | ORPHAN | Bug reports tied to run_id. If run cancelled → bug report status stays "open" but gets `run_cancelled: true` flag |
| Same test fails with DIFFERENT errors across runs | CORRELATION | errorHash differs → separate bug reports. Historical correlation groups by testName for trend analysis |
| Feature changed back (reverted) → old test works again | FEATURE_REVERT | Healer detects: previously FEATURE_CHANGED, now passes → clear stale notification, update registry |
| Selector exists in DOM but wrong element type (button→div) | SELECTOR_DRIFT | Selector validator checks testid presence. Type change = separate signal. Planner hard gate PLN-034 catches via `browser_evaluate` |

---

## Verification Checklist (End-to-End)

### Agent Line of Defense
1. [ ] Requirements: captures `[POSSIBLE_BUG]`, `[MISSING_TESTID]` tags + testid inventory
2. [ ] Planner: hard gate PLN-034 (all selectors verified), upstream validation PLN-035
3. [ ] Generator: Phase 0.5 classifies ALL mismatches, files bugs for APP_BUGs (GEN-021 fixed)
4. [ ] Healer: correct bugHuntCategory for all 5 categories + FLAKE + INFRASTRUCTURE_TRANSIENT
5. [ ] Audit: compliance audit AUD-023, Mode 5 pre-flight AUD-024, testid reconciliation AUD-025

### 4-Category Rulebook
6. [ ] Small feature change → auto-heal + notification → picked up on next run
7. [ ] Big feature change → pipeline blocked → escalation → rework → unblocked
8. [ ] Test-ID missing → autonomous bug report
9. [ ] Test-ID changed → human review triage
10. [ ] Feature intact + failure → autonomous bug report
11. [ ] Retry/flake → not classified as bug

### Bug Lifecycle
12. [ ] Bug filed → confirmed → fixed → verified (re-test) → closed (test.skip removed)
13. [ ] Dedup: same bug from multiple agents → one report, merged evidence
14. [ ] Historical correlation: 3+ failures same test → flagged

### Escalation Flow
15. [ ] Escalation blocks pipeline → SSE → frontend banner → user action → unblock
16. [ ] Timeout: 24h warning, 48h critical notification
17. [ ] Force-continue: downstream agents warned, confidence LOW, audit finding mandatory

### Frontend
18. [ ] TriagePanel: all categories with distinct colors/icons/badges
19. [ ] Auto-decided vs human-review clearly separated
20. [ ] BugDetailModal: full RCA evidence + lifecycle timeline
21. [ ] EscalationBanner: doesn't block chat
22. [ ] TestIdChangePanel: review workflow

### RCA
23. [ ] DOM diff produces meaningful change list
24. [ ] Selector validator: PRESENT/MISSING/CHANGED detection
25. [ ] HAR capture for full request/response replay
26. [ ] Historical failure correlation across runs

### Safety
27. [ ] File-based fallback when DB unavailable
28. [ ] Per-file notification pattern (no race conditions)
29. [ ] `npx tsc --noEmit` passes at every phase
30. [ ] All existing tests still pass (no regression)
31. [ ] Backward compat: disposition field coexists with bugHuntCategory
