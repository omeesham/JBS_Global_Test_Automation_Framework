# Plan 05: Shared Rules Update

**Status**: DONE 2026-03-03 — 32 new rules added, 4 rules updated, sync pipeline passed

**Problem**: Several critical behaviors are not mandated by rules. Agents skip planning, skip artifact reading, duplicate code, and don't verify their own output quality.

---

## New Rules to Add to agent-mistakes.md

<!-- SURGICAL EDIT 2026-03-03 by Copilot (@GitHub Copilot)
     WHY: ID collision — PIPELINE_FIX_PLAN.md (applied via PLAN_06 first per execution order)
     already claims ALL-013 through ALL-019 with completely different content.
     Current agent-mistakes.md has ALL-001..012. PLAN_06 runs first → gets ALL-013..019.
     Therefore PLAN_05 shared rules MUST start at ALL-021 (ALL-020 already written by PLAN_04).
     EVIDENCE: grep for '| ALL-0\d+' in PIPELINE_FIX_PLAN.md shows ALL-013/014/015/016/017/018/019.
     ALL-020 written by PLAN_04 (search-before-create with 6 specific BasePage methods).
     REQ-006..009 written by PLAN_06 (URL discipline, scope, phased exploration, user approval).
     Therefore PLAN_05 REQ rules MUST start at REQ-010.
     PLAN_00 execution order: PLAN_06 (step 2) before PLAN_05 (step 4).
     ALSO: Added ALL-024..027 (4 new rules) from surgical gap audit addressing:
       - User concern: MCP/live site = ultimate truth over Jira/TCs/plans
       - User concern: agents don't know how to self-help when stuck
       - User concern: spec-level code duplication allowed
       - User concern: MCP server crashed by agent actions (error 4294967295)
     ALSO: Updated ALL-023 (was ALL-016) — replaced naive "include TC-001" with
       full dependency analysis per reviewer feedback (agents running TC-23 blind).
     ALSO: Expanded ALL-008 update (MCP stability) with concrete crash vectors.
     REVIEWERS: Reviewer 1 + Reviewer 2 both confirmed ID collision is blocking.
     Reviewer 2 caught dependency rule contradiction. Both approved surgical approach. -->

### Shared (ALL agents)

<!-- NOTE 2026-03-03: ALL-020 already exists from PLAN_04 with richer content (lists 6 specific BasePage methods).
     PLAN_05 MUST SKIP ALL-020 — do NOT overwrite. Start adding at ALL-021. -->

```
| ALL-021 | Every agent MUST create a detailed plan before execution in agent mode. Plan includes: what files to read, what to verify, what to create/modify, risks identified, reuse opportunities. No plan = no work | Generator and Planner both jumped to execution without planning, discovered issues mid-flight |
| ALL-022 | Failure artifacts reading order: failure-summary.json → error-context.md → screenshot → trace. MCP browser is LAST RESORT for debugging, not first. Artifacts contain the same info the user sees in headed mode | Generator used MCP 6+ times for an issue clearly visible in error-context.md |
| ALL-023 | Run ONLY failing tests during debug: --grep "TC-ID". For serial blocks: READ the full spec to identify ALL dependency tests (login, navigation, state setup) — build minimum required grep pattern. NEVER assume TC-001 alone is sufficient. NEVER run a mid-spec test without understanding what prior tests set up. Full spec ONLY for final validation | Generator ran full 23-test spec 8+ times during debug. Agents also ran TC-23 in isolation without TC-001 (login) or TC-005 (tab nav) |
| ALL-024 | Truth hierarchy (highest to lowest): Live MCP session DOM > error-context.md snapshot > screenshots > failure-summary.json > REQUIREMENTS.md > test plans > test cases > Jira ticket descriptions. When ANY downstream artifact conflicts with MCP-observed reality, live DOM wins. Agents MUST NEVER follow test plans/cases/Jira blindly — ground reality on the website is always authoritative. If an observation on MCP contradicts a test case, STOP and report the discrepancy. Planner's MCP_VERIFICATION_LOG is presumed correct until a fresh MCP session proves otherwise. On conflict: do not patch spec — report discrepancy and push queue back to pending_planning (see GEN-021 mechanism) | User directive: "MCP session -> live website is greater truth than any test case/plans made from jira ticket description". PLN-020/REQ-006 cover planner/requirements but no ALL-level hierarchy existed |
| ALL-025 | When stuck (first attempt failed), agents MUST consult the Self-Unblocking Map (see PLAN_03 §Self-Unblocking, also referenced in PLAN_02 Phase 0.3 and PLAN_01 Step 1) before retrying. Search the relevant resource for the stuck category. If no match found after searching 2 resources, escalate with evidence of what was searched. Never retry blindly — search then retry | User directive: "agents need to know how to use the data available in the repo to help themselves... must be aware of what things to find and where" |
| ALL-026 | Spec-level code reuse: any setup, navigation, assertion, or cleanup pattern used in 2+ spec files MUST be extracted to a fixture (tests/setup/fixtures.ts) or helper. Priority: page object method > shared fixture > helper in tests/setup/ > duplication in spec. Copy-pasted test blocks across specs = defect. 3+ similar TCs with different data = data-driven test.describe with data array | User directive: "only highly reusable code goes in specs, nothing redundant should ever be allowed". PLAN_04 covers page objects but not spec-level patterns. Fixture system exists (tests/setup/fixtures.ts, 228 lines, 6+ custom fixtures) |
| ALL-027 | MCP crash recovery: (1) NEVER run terminal commands to restart MCP server. (2) NEVER kill node/browser processes. (3) Simply call browser_navigate(url) — it auto-reconnects. (4) If that fails, tell user "MCP server needs restart" and STOP. The #1 crash cause is agents running npx playwright test in terminal while MCP browser is open — they share Playwright infrastructure. Other crash vectors: heavy browser_evaluate scripts (>5 lines), page.goto()/window.location inside evaluate, blanket Stop-Process -Name node | User report: MCP server repeatedly dying with exit code 4294967295 (0xFFFFFFFF = forcible process termination). ALL-008 covers prevention but had no recovery procedure or concurrent-test warning |
```

### Requirements Agent

<!-- NOTE 2026-03-03: REQ-006..009 already exist from PLAN_06 (URL discipline, scope, phased exploration, user approval).
     These are DIFFERENT rules. Renumbered to REQ-010..013 to prevent destructive overwrite.
     See PLAN_06 Change 6B for the existing REQ-006..009 content. -->

```
| REQ-010 | Requirements agent is a HUNTER, not a verifier. The initial prompt is a STARTING POINT — explore EVERYTHING on the page independently. Document every field, every button, every validation, every error state, every save dialog. The prompt data could be wrong — DOM is truth | Planner received incomplete requirements → created incomplete test cases |
| REQ-011 | For every page/tab documented: click Save on MCP, document the exact dialog behavior (heading, text, buttons, or "no dialog"). Every clickSave() in the framework depends on this | Pricing page had undocumented Save Changes confirmation dialog |
| REQ-012 | For every dropdown: open it on MCP, document ALL available options (exact text). For every checkbox: toggle it and document cascade effects. For every grid: count exact rows and columns. Approximate values ("~55 rows") are NEVER acceptable. NOTE: Applies during Phase 2 interactive exploration — see REQ-008 for Phase 1 read-only restrictions | Planner wrote "~55 rows" — actual was 75. "Is Alternative" — actual was "Is Alternate" |
| REQ-013 | Verify HTML tag structure for form elements via browser_evaluate. Is it dt/dd? div/span? table/tr? Different tabs use different component libraries. Document actual structure so planner writes correct selectors | Pricing tab = Radix (div/span/button), Local Info = dt/dd. All pricing selectors were wrong because structure was assumed |
```

### Planner

```
| PLN-018 | Every editable field = its own save+persist TC with specific value. No lumping 5 fields into 1 generic TC. Each TC must specify: exact value to enter, save action, reload step, persistence verification | 5 Primary Pricing dropdowns were 1 TC with "select any option" |
| PLN-019 | Document exact save dialog behavior from MCP. Before marking pending_generation: confirm whether Save button triggers a confirmation dialog, document its structure, verify clickSave() will work | Generator's clickSave() had "no confirmation dialog" comment — dialog exists |
| PLN-020 | All field data (column headers, dropdown options, row counts, checkbox labels) must be EXACT from DOM evaluation — not from REQUIREMENTS.md. Requirements can be wrong. DOM is truth | "Is Alternative" in requirements, "Is Alternate" in DOM. "~55 rows" in TC, 75 rows in DOM |
| PLN-021 | Before writing ANY selector: use browser_evaluate to check actual HTML tag structure. NEVER assume dt/dd or div/span from other tabs. Each tab can use different UI components | Pricing tab uses Radix (div/span), Local Info uses dt/dd. All 8 pricing selectors were wrong |
| PLN-022 | Planner must deliver a "Generator-Ready Package": test cases with MCP_VERIFICATION_LOG, selector file with verified HTML structure, save dialog documentation, complete dropdown options, exact grid details. Missing any = stays at pending_planning | |
```

### Generator

```
| GEN-016 | Phase 0 mandatory: create execution plan before ANY code. Verify planner's MCP log. Map TCs to methods. Check for reusable patterns in BasePage/existing pages. Document risks (date pickers, cascading checkboxes, save dialogs) | |
| GEN-017 | RCA reads artifacts in order: failure-summary.json → error-context.md → screenshot → failing line → MCP (last resort). Never jump to MCP without reading artifacts first | Generator did 6+ MCP sessions for issue visible in error-context.md |
| GEN-018 | Debug runs = --grep "TC-ID" only. For serial blocks: READ the full spec first, trace which prior tests perform login/navigation/state setup, build minimum required dependency set as grep pattern. NEVER assume TC-001 alone is sufficient — a test at position 23 may depend on TC-001 (login) + TC-005 (tab nav) + TC-012 (state toggle). Full spec ONLY for final validation. NEVER run full spec during debug cycle | Generator ran full spec 8+ times during debug. Agents also ran TC-23 in isolation without prior setup tests, then wasted time debugging setup failures instead of the actual bug |
| GEN-019 | Check BasePage for existing methods before creating page object methods. clickSaveWithDialog, navigateToSubTab, getRadixCheckboxState, getComboboxOptions — all in BasePage | 3 pages had duplicate clickSave, tab nav, checkbox toggle |
```

<!-- SURGICAL EDIT 2026-03-03 by Copilot — Added GEN-021 and GEN-022
     WHY GEN-021: No mechanism existed for generator to report when TC conflicts with live DOM.
     Reviewer 2 caught: "Report back to whom, how? Without specifying the mechanism, agents will
     silently skip the TC or try to fix it themselves." Verified: no automated stage push-back exists —
     agents manually edit agent-queue.json stage field. escalate-tooling is log-only convention.
     MECHANISM: Change stage in queue + log reason. Planner sees the discrepancy in queue history.
     User can then just invoke planner and say "fix this" — the evidence is already in the log.
     WHY GEN-022: User directive: "only highly reusable code in specs". No existing rule mandates
     searching existing specs before writing setup/assertion logic. -->

```
| GEN-021 | During RCA or Phase 0, if MCP replication reveals the test case itself was wrong (expected value doesn't match live app, selector targets non-existent element, field behavior differs from TC description): DO NOT fix the spec to match the wrong TC. Instead: (1) Set queue item stage to pending_planning in agent-queue.json, (2) Log in agent-activity-log.md: "TC-XXX conflicts with live DOM: [exact discrepancy]", (3) STOP work on that TC. The planner will see the discrepancy in queue history. The user can invoke planner to fix it — all evidence is in the activity log | No mechanism existed. Reviewer 2: "Without specifying the reporting mechanism, agents will silently skip the TC." Verified: agents manually edit queue JSON, escalate-tooling is log-only |
| GEN-022 | Before writing test.beforeEach, repeated assertion logic, or navigation setup in a spec: grep existing specs (tests/specs/**/*.spec.ts) for the same pattern. If found in 2+ specs, extract to shared fixture (tests/setup/fixtures.ts) or page object method first, then use in both specs. Generator MUST search existing specs before writing setup code | User directive: "only highly reusable code goes in specs". Fixture system exists (tests/setup/fixtures.ts). No prior rule mandated searching existing specs for patterns |
```

### Healer

```
| HLR-009 | Artifact-first RCA: read failure-summary.json → error-context.md → screenshot → failing line → spec step BEFORE any MCP replication. MCP is Step 6 (last resort). Same 7-step protocol as Generator | Generator's 7-step RCA protocol applies identically to Healer |
| HLR-010 | Targeted test runs: `--grep "TC-ID"` for single TC during fix loop. For serial blocks: READ the full spec first, identify minimum required dependency set (login, navigation, state setup tests), build grep pattern with ALL dependencies. NEVER assume TC-001 alone is sufficient. Full spec ONLY for final verification after all fixes | Same efficiency mandate as GEN-018. Updated: naive "include TC-001" replaced with full dependency analysis per reviewer feedback |
| HLR-011 | When replicating failures on MCP: follow the EXACT steps from the spec code (read the spec, find the failing action, reproduce that sequence). Don't browse randomly — replicate precisely what the test does | Generator and Healer both wasted hours on undirected MCP browsing instead of replicating spec steps |
```

### Audit

```
| AUD-011 | Audit agent must audit ITS OWN audits. Check: did I read all relevant files? Did I verify via MCP when possible? Did I surface remediation prompts in chat (not just file them)? Were my findings evidence-backed? | Audit agent caught itself violating AUD-018 — remediation prompts not delivered to user |
| AUD-012 | When auditing planner output: verify MCP_VERIFICATION_LOG exists and is complete. Check every TC has a specific (not generic) expected value. Flag any "any option" or "~N rows" language | Pricing planner output had 7 missing TCs and multiple approximate values |
```

<!-- SURGICAL EDIT 2026-03-03 by Copilot — Added AUD-013
     WHY: Reviewer 1 caught that PLAN_08 checklists only cover up to GEN-019/HLR-011.
     The new surgical rules (ALL-024 truth hierarchy, ALL-026 spec DRY, ALL-027 MCP stability,
     GEN-021 wrong TC reporting, GEN-018/HLR-010 dependency analysis) have no audit coverage.
     Without AUD-013, audit agent won't check for these new behaviors. -->

```
| AUD-013 | When auditing generator/healer transcripts: verify (1) truth hierarchy respected — if MCP showed different data than TC, agent reported discrepancy via GEN-021 mechanism instead of forcing spec to match wrong TC, (2) spec-level DRY followed — no copy-pasted test blocks across specs (ALL-026), (3) full dependency analysis used for --grep — agent read spec to identify setup deps, not just "TC-001" blindly (GEN-018/HLR-010), (4) MCP stability rules followed — no concurrent playwright test + MCP browser, no heavy evaluate scripts, no process kills (ALL-027) | New audit gap: surgical rules added 2026-03-03 had zero audit coverage. Reviewer 1 flagged this |
```

---

## Rules to Update in agent-mistakes.md

### Update ALL-010 (Evidence before code edits)
Current: "Evidence before code edits: no code during Phase A. Complete evidence checklist (10/14 min)."
New: "Evidence before code edits: no code during Phase A. Read failure artifacts in order (failure-summary.json → error-context.md → screenshot). Complete 7-step RCA protocol. MCP is LAST RESORT."

### Update GEN-005 (MCP browser usage)
Current: "MCP browser: never open/close. Snapshot only for pre-flight selector validation. No exploratory browsing beyond Phase 1"
New: "MCP browser: never open/close. Pre-flight selector validation (Phase 1) and last-resort RCA (Phase A Step 6 ONLY after reading all failure artifacts). No exploratory browsing. No MCP before reading failure-summary.json and error-context.md"

### Update GEN-007 (Targeted test runs)
Current: "Targeted test runs: test:grep for single TC during fix loop."
New: "Targeted test runs: `--grep 'TC-ID'` for single TC during fix loop. For serial blocks: READ the full spec to identify minimum dependency set (login, navigation, state setup tests), build `--grep 'TC-001|TC-005|TC-FAILING'` with ALL deps. NEVER assume TC-001 alone is sufficient. Full spec ONLY for final validation. NEVER run full spec during debug cycle."

<!-- SURGICAL EDIT 2026-03-03 by Copilot — Changed GEN-007 update wording
     OLD: "For serial blocks: --grep 'TC-001|TC-FAILING' to include setup"
     NEW: Full dependency analysis — read spec, find minimal deps, build grep
     WHY: Reviewer 2 caught: the old wording was too simplistic. A test at position 23
     may need TC-001 (login) + TC-005 (navigate to tab) + TC-012 (toggle state),
     not just TC-001. The example in PLAN_02 showed cherry-picking but the rule said
     "include TC-001" which is contradictory. Now aligned. -->

### Update ALL-008 (MCP browser stability — expanded)
Current: "MCP browser: never call browser_close (auto-opens on navigate). Wait 3s after navigate before snapshot. Reuse sessions. Never blanket-kill node processes"
New: "MCP server stability is CRITICAL. Rules: (1) NEVER call browser_close. (2) NEVER Stop-Process -Name node or any blanket process kill. (3) NEVER use page.goto(), window.location, or JS navigation inside browser_evaluate. (4) Keep browser_evaluate scripts under 5 lines — complex scripts crash the server. (5) Wait 3s after browser_navigate before snapshot. (6) NEVER run npx playwright test in terminal while actively using MCP browser — they share Playwright infrastructure and conflict. (7) If MCP server exits (error code 4294967295), do NOT restart manually — just call browser_navigate and it auto-recovers. (8) Reuse existing browser sessions."

<!-- SURGICAL EDIT 2026-03-03 by Copilot — Expanded ALL-008 with crash vectors
     WHY: User reported MCP server repeatedly dying (exit code 4294967295 = 0xFFFFFFFF = forcible
     process termination on Windows). Old ALL-008 covered browser_close and node kills but missed:
     - Concurrent playwright test runs conflicting with MCP server
     - Heavy browser_evaluate scripts crashing the server
     - page.goto() inside evaluate (from PIPELINE_FIX_PLAN ALL-016)
     - Recovery procedure (just call browser_navigate to auto-reconnect)
     EVIDENCE: User log showed server dying twice within 3 minutes. -->

---

## Implementation Steps

<!-- SURGICAL EDIT 2026-03-03 by Copilot — Updated step 1 IDs and added steps for new rules -->
1. **Pre-flight**: Verify ALL-013..019 exist from PLAN_06 AND REQ-006..009 exist from PLAN_06 AND ALL-020 exists from PLAN_04 — do NOT overwrite any of these
2. Add new rules (ALL-021 through ALL-027, REQ-010 through REQ-013, PLN-018 through PLN-022, GEN-016 through GEN-022, HLR-009 through HLR-011, AUD-011 through AUD-013) to agent-mistakes.md
3. Update existing rules (ALL-008, ALL-010, GEN-005, GEN-007) with new wording
4. Run `npm run sync:mistakes && npm run build:context && npm run validate:sync`
5. Update ID MASTER LIST comment at top of agent-mistakes.md with new counts (REQ range now REQ-001..013)
6. Verify sync succeeded — all agent prompt files updated
7. **COLLISION GUARD**: ALL-020 (PLAN_04), REQ-006..009 (PLAN_06) are pre-existing — grep to confirm before writing
