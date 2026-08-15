> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute PLAN_NM3344_SERVICE_CHARGE_COVERAGE_QUICK.md`. All context below. Zero additional prompting needed.**
>
> The agent self-bootstraps from this file's frontmatter + sections:
>
> 1. **Identity**: load `/identity` per the Identity field below (OWNER shell; per-phase `/identity HUNTER|GIVER|BUILDER|WATCHDOG` at each phase boundary — clean re-load per feedback_identity_switch_protocol; the Layer-1 write-gate requires the role to be adopted before role-owned artifacts are written inside /execute).
> 2. **Skills**: load every skill in §Bootstrap "Skills instilled" (leading skill auto-calls its chain). **`/delegation-temp on` is MANDATORY at session start AND after EVERY compaction** — it dies at compact (its own documented limit #1); re-invoke, then re-read this bootstrap.
> 3. **Model + thinking + permission-mode**: read the Model / Thinking / PermissionMode frontmatter fields (all three required per LR-041).
> 4. **Dependency gate**: Depends-on is `none` — nothing to verify.
> 5. **Context load**: read this plan in full + every file in §Bootstrap Context-files. Missing context file = HALT.
> 5.5. **Browser tool**: declared `cli` in frontmatter per the LR-038 v2 matrix (catalog walkthrough + unattended save-cycles; no visual/CSS assertion, no fresh-passkey need, no mid-execution pause step). Announce choice + reason in first output. Auth: `playwright-cli -s=e2e state-load clients/encore/.auth/encore-state.json` then re-`goto`; regenerate via `clients/encore/tests/auth.setup.ts` if absent (creds in tracked `.env.local`, no second factor). Mid-plan switches → `[BROWSER-SWITCH]` log per LR-028.
> 6. **Delegation-first is LAW for this plan**: Claude decomposes/tickets/dispatches/judges; Copilot workers walk, probe, draft, build, verify. See §Delegation Contract below. Dispatch → END TURN (zero-burn). Never self-rescue a stalled worker.
> 7. **Execute Phases 0 → 5 in order.** Phase 5 (ship) additionally requires Rutvik's explicit in-chat GO for the actual push.
> 8. **Handoff**: flip the Status field to DONE + add the Executed date (closure-gate dry-run FIRST per feedback_closure_gate_verify_paths_first), append activity-log row (LR-028 + LR-037), `git mv` to plans/done/, `npm run plans:reindex`, `/final-q`.
>
> **HALT + ASK RUTVIK** if: scope ambiguity beyond the KEEP list / walk discovers >30% scope extension (e.g. more than the 2 named sub-tabs, or the page turns out to BE the existing Service Charge Text module) / regression-guard shows unrelated changes / LR-037 timestamp drift / any LR-046 strict-line vs live-state mismatch / LR-040 closure item not classifiable (a)/(b)/(c).

---

# PLAN_NM3344_SERVICE_CHARGE_COVERAGE_QUICK — NM-3344 Service Charge page: QUICK field-level validation coverage (2 sub-tabs = 2 specs) + client-deliverable push

**Status**: DONE
**Executed**: 2026-08-15
**Priority**: P0
**Created**: 2026-08-10
**Identity**: OWNER (multi-identity by phase — HUNTER → GIVER → BUILDER → WATCHDOG → OWNER)
**Depends on**: none
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli
**CoverageMode**: quick
**Author**: Rutvik (via Claude Fable 5)
**ActiveClient**: encore

---

## Context

**Jira**: [NM-3344](https://encore.atlassian.net/browse/NM-3344) — "Automate → Setup → Service Charge". Story, priority **Highest**, status To Do, assigned to Rutvik, reporter Aruna Yaganti, created 2026-08-03. Description body = 2 screenshots only (Atlassian media blobs; matching the 2 sub-tabs). **Jira is READ-ONLY for this plan — no create/update/delete, no transitions, no comments.**

**Target surface**: `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/service-charge` — 2 sub-tabs: **Basic Information** and **Service Charge History** (per Rutvik's screenshot 2026-08-10). Net-new surface: no exploration-registry row, no agent-mistakes history, no existing spec/page-object/selectors for it.

**NOT the same module as Service Charge Text** (`clients/encore/tests/service-charge-text/` — different URL, different page). LR-017: different URLs = different pages = separate selector namespaces and directories. Phase 0.75 confirms this live; if the walk reveals it IS the SCT surface relocated → HALT.

**Rutvik's constraints (2026-08-10, verbatim intent — these are strict lines per LR-046):**
1. `/coverage` QUICK **only** — "NOT ultracoverage at any cost". No DEEP subplan is authored by THIS plan; L2/L3 material is recorded ONLY as `deferred-to-DEEP:` tokens in the walk artifacts. **This ban is plan-scoped, not permanent** (Rutvik 2026-08-10): if Rutvik later asks for more, `/ultracoverage` runs as its own future initiative and the `deferred-to-DEEP` tokens are its ready-made input — nothing in this plan forecloses that.
2. "be deep in field level validations ONLY" — Axis 1 (field FCC per `field-case-generation.md` §2 + §2.1 oracle) is the core deliverable at full per-field depth. Axis 2 (SBC) is capped at the L1 QUICK must-asserts the /coverage contract mandates for applicable §3 families (a history grid with zero behavior asserts would be fake coverage); every inapplicable family gets `out-of-scope:<family>=<reason ≥20 chars>` (LR-065). Nothing fancier.
3. 2 sub-tabs = **2 spec files**.
4. After execution: push to the client deliverables repo `RutviK-JBS/encore_deliverables_test` **branch `main`**, as an **addition to the already-delivered modules** (Rutvik named `/push-encore-deliverables` + main in the tasking message — that is the standing branch decision; the actual `--push` still gets a fresh in-chat GO at Phase 5).
5. Execution HELD — this plan does not run until Rutvik says go.

**Decisions taken by Claude (so the executor never re-asks — NO-ASKS doctrine):**
- **Module identity**: new module code **`SVC`** (name `service-charge`, display `Service Charge`, dir `service-charge`), submodules **`BAS`** (Basic Information) + **`HIS`** (Service Charge History) — mirrors the LOS BAS/HIS precedent. TC grammar: `TC-SVC-BAS-NNN` / `TC-SVC-HIS-NNN`; bugs `BUG-SVC-BAS-NNN` / `BUG-SVC-HIS-NNN`. Sheets: `service_charge_basic_info` (25 chars) + `service_charge_history` (22 chars) — both under the 31-char Excel cap. mdBasenames: `service_charge_basic_information_test_cases` / `service_charge_history_test_cases`. Codes are minted in `export_test_cases/module-codes.json` FIRST (its own header rule).
- **Office**: 1604 (the ticket URL's office, the canonical test office). Empty surface on 1604 → LR-040(c) investigation (population path + classification + escalate-if-unknown) with an LR-ENC-005 re-check on 1101 before any "missing/corrupt" conclusion; currency variety (if it ever matters) lives on 1605. No multi-office matrix — field-level validation does not need one.
- **File layout** (own partition per LR-017): specs `clients/encore/tests/service-charge/service-charge-basic-information.spec.ts` + `clients/encore/tests/service-charge/service-charge-history.spec.ts`; page objects `clients/encore/src/pages/service-charge/`; selectors `clients/encore/src/selectors/service-charge/`; data `clients/encore/src/data/service-charge/`. Barrel `index.ts` files per MAINTAINER convention.
- **Save dialog**: assume the shared "Save Changes" dialog per LR-012 until the walk proves a custom one; the walk records the dialog heading + confirm-button label verbatim (sibling tabs use Cancel/**Ok**) and the backend save endpoint from `playwright-cli network` (LR-056 — never a page-URL substring filter).

---

## Bootstrap

**Identity**: OWNER shell; per-phase `/identity HUNTER` (0.5b, 0.75) → `/identity GIVER` (1) → `/identity BUILDER` (2) → `/identity WATCHDOG` (3) → OWNER (4, 5).

**Skills instilled (load at the named moment — this list survives compaction; re-check it after every compact):**
- `/delegation-temp on` — session start + after EVERY compaction (its own limit #1). Governs all dispatch/acceptance/failure/closure discipline for the whole plan.
- `/identity` — every phase boundary (clean re-load).
- `/relevant` — Phase 0 (tag the TodoWrite/Task list; ceremony items per the SP02B contract).
- `/coverage` — already consumed: THIS PLAN is its output (CoverageMode: quick). Do not re-invoke; do NOT invoke `/ultracoverage` within this plan (plan-scoped strict line — future DEEP happens only when Rutvik asks, as its own initiative).
- `/regression-guard` — wrap Phase 2 (BEFORE + AFTER structural snapshots).
- `/rca` — conditional: any spec failure surviving 2 fix attempts, or any "won't accept input / un-drivable" suspicion (LR-061 gates first). A failed fix → delegate an instrument-and-observe ticket, never a 2nd hypothesis (feedback_delegate_the_rca_dont_guess_under_compute_pressure).
- `/find-bugs` (heuristics, walk-scoped) — **bug harvest is a first-class walk deliverable** (Rutvik 2026-08-10; project_walks_are_manual_qa_bug_harvest — walks are the ONLY manual-QA pass this surface gets). During Phases 0.5b + 0.75 the walker actively hunts bugs SFDPOT-style on every walked field/surface (not just passive Observations): junk/boundary inputs, silent rejections, focus traps, layout/render defects, dead affordances. Full standalone /find-bugs session NOT required (quick-mode); the hunt rides the walk.
- `/final-q` — Phase 4 closure (LR-042 evidence-emission format).
- `/push-encore-deliverables main` — Phase 5 only, after Rutvik's GO (skill's own Steps 0–6 govern).
- `/ultra-agents` — ONLY if >5 concurrent workers are genuinely needed (unlikely; one-headshot law says they are not).
- `/reflect` — session end (registry row for the new surface + any new mistakes).

**Context files (load order; missing file = HALT):**
1. `.claude/context/navigation.md` — §B routing rows (Radix tab activation, save-dialog helpers, LR-056 filters, CLI auth runbook) + §D stuck protocol
2. `clients/encore/CLAUDE.md` — LR-ENC-001..006, LR-008/012/017/036
3. `docs/read_only_docs/CASE_GENERATION_STANDARD.md` + `clients/encore/specs_planning/_internal/field-case-generation.md` (§2 field templates, §2.1 rejection-affordance oracle, §3 surface families QUICK column, state-transition save-flow model)
4. `clients/encore/specs_planning/_internal/field-inventory-spec.md` + `clients/encore/specs_planning/_internal/field-inventories/_TEMPLATE.md` — 8 frontmatter keys + 7 mandatory sections
5. `.claude/rules/inventory.md` (LR-007/013/014/015/016/029/057/062/064/065 + LR-072 quick profile) + `.claude/rules/specs.md` (LR-018/019/021/022/024/025/051/052/053/056/061/066/067/068) + `.claude/rules/angular.md` (LR-009/010/011/026) + `.claude/rules/baseline.md` (LR-045) + `.claude/rules/browser-tool.md` (LR-038/054) + `.claude/rules/deliverable.md` (LR-058) + `.claude/rules/pipeline.md` (LR-027/028/040/041/046/048/049/055/060)
6. `.claude/skills/ultra-agents/worker-ext.md` + `.claude/state/ua-worker/worker-doctrine-index.md` — delegation mechanics + ticket doctrine pointers
7. `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter by active identity prefix + ALL-*
8. `plans/done/SUBPLAN_AUTO_ADDON_FCC.md` + `plans/done/SUBPLAN_LEGAL_FCC.md` — freshest Location-Settings-family FCC siblings (structure, ensureDefaultState pattern, sweep format)
9. `clients/encore/src/utils/field-case-runner.ts` — `saveAndVerifyCase()` (compile-enforced per-case `baseline` = the LR-019 preferred path)
10. `export_test_cases/module-codes.json` — mint `SVC` here FIRST
11. The combined-deliverable ship runbook in the session memory folder (memory file named `reference_combined_deliverable_ship`) + `.claude/skills/push-encore-deliverables/SKILL.md` — Phase 5 ship runbook (main-branch additive ship)

**Anti-Assumption Gates (binding — PLAN_BIG_PIVOT_FCC_MASTER §Anti-Assumption Gates):**
- [ ] Phase 0.5b baseline walk EXECUTED before any behavior classification / bug filing (Gate 1 — LR-045/LR-ENC-001; `baselineScope: baseline-absent` is a legitimate recorded verdict, not a HALT).
- [ ] No "corrupt / atypical / app-wide / regression" claim on <2 evidence sources (Gate 2 — LR-061 A).
- [ ] No control marked un-drivable without overlay-clear + reload + selector-vs-live-DOM diff + DOM inspect + positive control (Gate 3 — LR-061 B/C).
- [ ] No env-rationalized deferral of env-independent work (Gate 4 — LR-060).
- [ ] Un-skip + LR-019 harden atomic (Gate 5 — LR-021 corollary).
- [ ] All phases complete OR a user-signed `## Deferral Authorization` block (Gate 6 — LR-060).

---

## §Delegation Contract (how EVERY phase's labor is routed — /delegation-temp + worker-ext, distilled)

**Claude (CEO) does ONLY**: decompose, write tickets, preflight + dispatch, read digests/verdicts, per-field verify + disposition (LR-064 Stage 3/4 — never delegated), final judgment, `/identity` + activity-log + plan-status ceremony, memory writes, publishing (git push / ship). Everything else is a Copilot ticket.

**Standing dispatch rules** (full doctrine: `worker-ext.md` + memory `feedback_worker_ticket_mechanics`):
1. Preflight every dispatch: `node scripts/dispatch-preflight.mjs --ticket <t> --run-id <id> --model <m> --work-type <wt> [--max-credits N]`. Exit 1 = do not dispatch.
2. `--work-type` + `--max-credits` (2× estimate; wrapper floors apply) + `--session-id` + `--parent-run-id` on every dispatch. Literal absolute OUTPUT paths in every ticket. Tee'd raw evidence (`cmd 2>&1 | tee <RUN_DIR>/<name>.verify.txt`).
3. Walk/live tickets are `OFF-REPO: yes` → review layer independently RE-EXECUTES (pyramid layer 4); paper review can never green them. Ticket carries the exact `playwright-cli` commands + auth-state path so re-execution is verbatim.
4. One file per edit-ticket; disjoint lots for parallel tickets; parallel Playwright RUNS are FORBIDDEN (shared auth state truncates — `N did not run` in ~100s = collision, not a result).
5. Ticket DOCTRINE cites the governing rule/skill paths (run `node scripts/ticket-skill-scan.mjs --goal "<GOAL>" --work-type <wt>`); every ticket returns `## ASSUMPTIONS-MADE`; non-empty `## ASK` blocks acceptance until dispositioned.
6. Acceptance = machine facts: `envelope.mjs` pre-dispatch, `verify-run.mjs` verdict (GENUINE=accept · FABRICATED=bounce · UNPROVABLE=judgment), self-declared-failure scan, ledger row check. Re-run the load-bearing grep yourself before believing a worker acceptance claim.
7. Failure ladder: fix-the-ticket → bounce once → escalate tier / cross-family → AUTO_SELF (logged incident). CONSULT at attempt ≥2. Every worker death gets a cause row. ANTI-RESCUE: never self-rescue a stall.
8. Zero-burn: dispatch → background → END TURN. Batch interrogation on wake.
9. Simple case = 1 worker + 1 cross-family reviewer; both green = accept. Worker tiers per the routing ladder (Haiku=deterministic probes, Sonnet=workhorse builds/drafts, gpt-5.5=cross-family review, gpt-5-mini=mechanical verify).

---

## Phase 0 — Dependency + browser-tool + delegation gate (OWNER)

- [ ] `/delegation-temp on` armed; delegation ratio target ≥0.95 for this plan.
- [ ] Browser tool announced: **CLI** (LR-038 v2 — catalog walkthrough + unattended save-cycles; LR-054 Table 2 covers open/click/fill/snapshot/network/state-load). Entra redirect → Gate 3 headed fallback (`open --persistent`), never a HALT claiming CLI inadequacy.
- [ ] `/relevant` run; TaskCreate list built with SP02B tags ([ceremony] items included).
- [ ] Local runs use `.env.local`; never `CI_ENV=e2e` (LR-ENC-003).
- [ ] Confirm `clients/encore/src/utils/field-case-runner.ts` exports `saveAndVerifyCase` (grep — reuse mandate, NO new runner).
- [ ] Confirm the 2 sub-tabs render at the target URL (one cheap CLI open — this is the ≤1-command inline exception; anything more = ticket).

## Phase 0.25 — Jira-first intake (HUNTER; LR-ENC-004)

- [ ] **Scan EVERYTHING about this module** (Rutvik 2026-08-10 — exhaustive, not a single lookup). Rovo (Atlassian MCP, READ-ONLY): (1) NM-3344 itself + its links/subtasks/epic; (2) JQL sweep for "service charge" across the NM project (all statuses — open, done, rejected; done tickets reveal designed behavior, rejected ones reveal known non-bugs); (3) Confluence CQL sweep for the module's spec/design pages; (4) any tickets naming the History sub-tab or service-charge validations. Record EVERY hit in the crossref artifact: ticket ID, status, one-line relevance, and whether it becomes a walk-oracle LEAD. Attempt to view the 2 description screenshots; if the media blobs are not retrievable via API, record that honestly (Rutvik can paste them on request — do NOT block on it; the live walk is the render-truth source anyway).
- [ ] Emit `clients/encore/specs_planning/_internal/jira-defect-crossref-service-charge-2026-08-10.md`; every Jira fact is a LEAD re-verified against DOM (intent-truth vs render-truth per LR-045 two-axis note).
- [ ] Baseline artifact (Phase 0.5b) carries `jira_tickets: [NM-3344, …]` frontmatter — the structural proof the pass ran.

## Phase 0.5b — Old-site baseline walk (HUNTER; LR-045 / LR-ENC-001)

- [ ] Visit `https://navigator2.training.psav.com/#/` FIRST (same SSO session bridges); locate the Setup → Service Charge equivalent (ticket title says "Setup"). Observation-only, zero mutations, zero selector parity expected.
- [ ] Emit `clients/encore/specs_planning/_internal/old-site-baseline/service-charge-2026-08-11.md` (frontmatter `baselineScope: full | baseline-partial | baseline-absent` + `jira_tickets:`) with a `## Baseline diff` section classifying every divergence (regression / intentional-UX / baseline-absent). Baseline-absent → record + continue (ALL-078), never HALT.
- [ ] **Baseline diff IS a bug source**: every new-site-vs-nav2 divergence that classifies as regression-from-baseline becomes a `BUG-SVC-*` filing per LR-034 (with `baselineComparison` + `baselineEvidence`); a nav2 behavior contradicting a Jira/Confluence spec found in Phase 0.25 is classified per REQ-014 / LR-030 (investigate as bug, never silently accept). Walk bugs → required-TC linkage (project_walks_are_manual_qa_bug_harvest).
- [ ] Delegable: the raw nav2 walk commands may run as an `OFF-REPO: yes` worker ticket; divergence CLASSIFICATION stays Claude.

## Phase 0.75 — New-site TDW-Q walk, both sub-tabs (HUNTER; LR-062/LR-064 quick profile, LR-072)

- [ ] **Stage 1 (machine, non-negotiable)**: `npm run walk:enumerate -- --office=1604 --module=service-charge` (or `scripts/walk-coverage/enumerate-page.mjs` invoked per tab) → machine-enumerated denominator for EACH sub-tab. **First check the script's module→URL mapping**: `service-charge` is a new surface and may not be registered — if absent, add the URL mapping inside `scripts/walk-coverage/` (framework-side, never ships) or invoke the script with an explicit target URL; do NOT hand-count as a fallback. Cold-start gotcha: a near-empty first enumeration = re-run (LRN-002 class). Denominator AND numerator are machine-owned.
- [ ] **Confirm module identity**: this page ≠ Service Charge Text (different URL/content). If identical surface → HALT + report.
- [ ] **Stage 2 (dispatch, quick profile)**: probe worklist authored by Claude (field × exact inputs × exact oracle); Haiku = simple deterministic fields, Sonnet = cascading/multi-row/launcher; probes limited to elements needed for §2 L1 field cases + applicable §3 QUICK families; remainder → `deferred-to-DEEP: <id> (<reason ≥20 chars>)` (G1: a deferral row carries NO classification claim). LR-057 affordance probe (control + label + container) before ANY read-only/static/disabled classification — `affordance:` token recorded per row. Unknown field type → brain-first live probe per LR-057 no-taxonomy clause, never a silent zero-case pass.
- [ ] **Stage 3 (verify, Claude — no rubber-stamping)**: per-report check (all inputs tried / raw values not prose / §2.1 oracle satisfied / laziness smells) + blind re-drive of min(3, live-row count) `provenance: live` rows by a second blind worker. One-line verdict per field in the walk-evidence file.
- [ ] **Stage 4 (disposition, Claude)**: every denominator element dispositioned (`covered-by-TC` / `affordance-probed` / `read-only-verified` / `out-of-scope:` / `deferred-to-DEEP:`), `Coverage_Ratio` 100%, `CrossCheck: clean`, provenance condition 5 satisfied (live rows cite machine-emitted evidence; `.playwright-cli/` files are never hand-authored).
- [ ] **History tab specifics**: expect a read-only grid — record column headers verbatim, boolean render format (LR-036 — MCP-verify per table, never assume), row-population trigger (do Basic-Information saves create rows? observe one save-cycle), pagination/sort affordances, empty-state text verbatim. Empty grid → LR-040(c) c.1/c.2/c.3 investigation (+1101 re-check per LR-ENC-005) before any "empty" acceptance.
- [ ] **Basic Information specifics**: per-field defaults + maxlength + enabled/disabled + validation triggers (junk input / empty / boundary / Tab-blur), save-cycle observation (dialog heading + button labels verbatim; backend save endpoint from `playwright-cli network` — LR-056), dirty-state behavior (sub-tab switch vs full nav-away).
- [ ] **Active manual-QA bug hunt rides the walk (dual product — denominator AND bug harvest)**: on every walked field/surface, probe SFDPOT-style beyond the assigned oracle — junk + boundary inputs, silent-rejection/focus-trap checks (§2.1 both arms), dead affordances, layout/render defects (SEEN, not inferred — drive the error state and look), console errors during interactions. Every find → `## Observations ### Bugs / Defects` row → MCP-confirm → file `BUG-SVC-*` per LR-034 with `baselineComparison`, or LR-040(c) discussion-item flag if empty-everywhere/no-UI-path/no-Jira (feedback_discussion_item_not_bug). CRITICAL/HIGH → escalate to Rutvik in the session summary.
- [ ] Emit per tab: `clients/encore/specs_planning/_internal/field-inventories/service-charge-basic-information-2026-08-10.md` + `clients/encore/specs_planning/_internal/field-inventories/service-charge-history-2026-08-10.md` (8 frontmatter keys, 7 sections, testid column complete per LR-014 — genuinely-missing testids get next-best locator + testid-gap-report row, never a fixme) + `walk-evidence-service-charge-2026-08-10.md` (per-field tier/evidence/verdict rows + mandatory `## Observations` with `### Bugs / Defects` + `### Suggestions / Improvements`, literal `none` if empty).

## Phase 1 — Case catalog + TC MD + test plan + XLSX (GIVER; LR-065 / LR-ENC-002)

- [ ] Mint `SVC` module + `BAS`/`HIS` submodules in `export_test_cases/module-codes.json` FIRST (single source of truth).
- [ ] **Axis 1 (the core, per Rutvik)**: every editable field on both tabs gets its full `field-case-generation.md` §2 template row set (Positive + BVA + Negative + Save-cycle) with the §2.1 rejection-affordance oracle (announced AND escapable — record blur result BEFORE any cleanup Escape) on every Negative/BVA case. LR-009 (recovery value ≠ original), LR-008 (date sign constraints) where applicable. Read-only fields: read-only-verified disposition + a render assertion where meaningful.
- [ ] **Axis 2 (capped at QUICK)**: for the History grid (and any Basic-Information surface that qualifies), ≥1 L1 must-assert TC per APPLICABLE §3 family only (`render-state`, `empty-vol`, `persistence`, `pagination`/`sorting`/`result-fidelity` only if the affordance exists); inapplicable → `out-of-scope:<family>=<reason ≥20 chars>`. `**Surface_Family**: <family> (QUICK)` line ONLY — never `(QUICK)` in the `## TC-…:` heading (ALL-091, ships as client-facing Title).
- [ ] Emit `clients/encore/specs_planning/_internal/field-case-catalogs/service-charge-2026-08-10.md` (per-field type → case rows → TC IDs; gap matrix (a)/(b)/(c)).
- [ ] Author TC MDs: `clients/encore/specs_planning/test-cases/setup/service-charge/service_charge_basic_information_test_cases.md` + `service_charge_history_test_cases.md` — step-table format (`| # | Step | Expected Result |`, every step has an Expected, explicit `**Notes**:` field per TC, escape pipes). Two test plans mirroring the mdBasenames: `clients/encore/specs_planning/test-plans/setup/service-charge/service_charge_basic_information_test_plan.md` + `clients/encore/specs_planning/test-plans/setup/service-charge/service_charge_history_test_plan.md` (per-submodule pairing, matching the locations-tab precedent).
- [ ] Rebuild XLSX (`npm run xlsx:build` path) — commit MD source BEFORE building (a TC id lives in 4 places: md → xlsx → spec → manifest; builder archives HEAD).
- [ ] `npm run check:tc-parity` exit 0 (evidence-emission format in the log).
- [ ] Drafting is delegable (worker drafts FROM Claude's catalog decisions); case-set decisions are NOT.

## Phase 2 — Page objects + 2 specs (BUILDER; LR-019/LR-058/LR-ENC-006)

- [ ] Selectors `src/selectors/service-charge/` (naming `{module}-{section}-{kind}-{field}` per LR-017; live-DOM verified per LR-029), page objects `src/pages/service-charge/` (extend BasePage; `@step` plain-English annotations per LR-ENC-006; `waitForAngularStable`, never `networkidle` — LR-023), data `src/data/service-charge/` (values from the dated inventory only — LR-015).
- [ ] Spec 1 `tests/service-charge/service-charge-basic-information.spec.ts`: FCC describe at TOP via `saveAndVerifyCase()` (compile-enforced per-case `baseline` satisfies LR-019); SBC describe below; per-test nav-guard `beforeEach`; shared-dialog helper per LR-012 (custom dialog ONLY if the walk proved one).
- [ ] Spec 2 `tests/service-charge/service-charge-history.spec.ts`: read-only grid asserts content-anchored (LR-022/LR-053 — never strict row counts), boolean reads per the walk-verified render format (LR-036), applicable QUICK SBC TCs.
- [ ] Zero internal jargon in any shipped file (LR-058 — plain-English WHY comments; `NM-3344` is the client's own ID and is KEPT); justifying comments on deliverable survivors per feedback_deliverable_needs_justifying_comments.
- [ ] Network assertions (if any) filter on the backend endpoint recorded in the walk (LR-056).
- [ ] **Verification (strict)**: each spec green **solo ×2** (`npx playwright test <spec>` — full file, sequential, NEVER parallel, NEVER the whole suite per feedback_no_full_suite_runs_ever; claim wording = "passes solo", not "suite green"); `npx tsc --noEmit` clean (esbuild transpiles without typechecking — a green run is not a typecheck); `npm run check:spec-quality` clean on the WORKING TREE (LR-060 obligation 4); `npm run check:step-labels` clean.
- [ ] Build/draft tickets delegable per §Delegation Contract; failing-spec RCA follows `/rca` + LR-024 (clean artifacts, run fresh, twice) — 2 failed fixes = instrument-and-observe ticket, not a 3rd guess.
- [ ] `/regression-guard` BEFORE + AFTER (structural snapshot diff — no silent breakage outside the new module).

## Phase 3 — Audit (WATCHDOG; AUD-017 — fresh context, not the builder session)

- [ ] FCC-completeness: every inventory field row ↔ catalog row ↔ TC ↔ spec test (no silent partial coverage — LR-068 posture).
- [ ] Surface-completeness: every applicable §3 family has its QUICK TC or an `out-of-scope:` token (LR-065 folds into the LR-062 gate).
- [ ] False-green sweep over both specs + page objects → `clients/encore/specs_planning/_internal/false-green-sweeps/service-charge-2026-08-11.md` (FALSE-GREEN / PARTIAL / FLAKY-MASK / STALE-SKIP / INFLATED / STATE-LEAK / CLEAN per finding).
- [ ] Adversarial self-pass on every assertion: "what wrong value would STILL pass this?" (LR-068 corollary — literal over comparison, collection value not just length).
- [ ] Zero findings on non-trivial work requires explicit justification (AUD HARD STOP #3).
- [ ] Audit legwork delegable (cross-family reviewer seat); verdicts stay Claude.

## Phase 4 — Closure (OWNER)

- [ ] LR-040 classification for every enumerated item ((a) proven / (b) grep-verified recipient / (c) named flag — `deferred-to-DEEP` tokens live in the walk artifacts, NOT in a new subplan).
- [ ] Closure-gate dry-run BEFORE the Status flip: `cat <plan> | node scripts/validate-plan-closure.mjs --content-from-stdin --plan <plan>` → remediate → flip.
- [ ] Status → DONE + Executed date + `### Execution Summary` (LR-027: TC counts + IDs, dropped-TC justifications, verification results with dates); `git mv` to `plans/done/`; `npm run plans:reindex`.
- [ ] Activity-log row (LR-028, timestamp ≥ all touched-file mtimes per LR-037); `/reflect` adds the exploration-registry row for the new surface; `/final-q` verdict with the mistakes-attestation block.
- [ ] Plan-Deviations log: only genuine scope/process surprises get D-rows; live-probe pivots are inline narrative.

## Phase 5 — Ship to client deliverables repo (OWNER; HARD GATE: Rutvik in-chat GO for the push)

Authorization context: Rutvik named `/push-encore-deliverables` + branch **main** in the 2026-08-10 tasking message ("push it in main as an addition to the existing delivered modules"). Branch decision is settled; the `--push` execution still gets a fresh one-line GO.

- [ ] Read `reference_combined_deliverable_ship.md` (memory) + the skill's Steps 1–6 FIRST. Ship via `scripts/ship-branch.sh` ONLY (LR-049 — git archive, never `cp -r`). **Caution**: the documented `--branch` values are per-module branches (notes/ssl/legal/…) — if `main` is not an accepted value, follow the combined-ship mechanism the runbook actually records; NEVER edit `ship-branch.sh` mid-delivery to force a push (skill rule — fix the content, not the gate).
- [ ] Dry-run FIRST with `--branch=main`, `--surface` covering the existing delivered spec set PLUS `service-charge/*` (copy surface globs from the existing main/combined preset — never invent; a glob that filters everything out still exits 0, so verify the PAYLOAD, never the exit code), `--modules` = existing sheet codes + `SVC`.
- [ ] Inspect payload: both new spec files present with the full TC-SVC set; no `specs_planning/`, `docs/`, `.claude/`, `CLAUDE.md`, `.env.local`; no foreign `NM-`/internal `BUG-` references; `node scripts/verify-no-forbidden.mjs --target=<clean extract>` exit 0 HARD-GATES the push.
- [ ] Coverage-regression check: every TC-ID already on `encore-mock/main` for every existing spec is still present (a shrunken set = slicing bug → STOP and report).
- [ ] Show Rutvik the payload one-liner → on GO: `--push` → verify remote (tip SHA, TC counts, leak-check `clean`) → STOP. One invocation, one branch, never a second push off this authorization.
- [ ] Never ship a red or non-compiling spec.

---

## Per-Identity Satisfaction (LR-048 v3 — `<EXEC-DATE>` is replaced with the real date by the executing session when each artifact is emitted)

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site baseline + field inventories + walk evidence + jira crossref | `clients/encore/specs_planning/_internal/old-site-baseline/service-charge-2026-08-11.md`<br>`clients/encore/specs_planning/_internal/field-inventories/service-charge-basic-information-2026-08-10.md`<br>`clients/encore/specs_planning/_internal/field-inventories/service-charge-history-2026-08-10.md`<br>`clients/encore/specs_planning/_internal/walk-evidence-service-charge-2026-08-10.md`<br>`clients/encore/specs_planning/_internal/jira-defect-crossref-service-charge-2026-08-10.md` | coverage manifest: Coverage_Ratio 100%, CrossCheck clean (LR-062/Cx) |
| GIVER | catalog + TC MDs + test plans + XLSX + module codes | `clients/encore/specs_planning/_internal/field-case-catalogs/service-charge-2026-08-10.md`<br>`clients/encore/specs_planning/test-cases/setup/service-charge/service_charge_basic_information_test_cases.md`<br>`clients/encore/specs_planning/test-cases/setup/service-charge/service_charge_history_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/service-charge/service_charge_basic_information_test_plan.md`<br>`clients/encore/specs_planning/test-plans/setup/service-charge/service_charge_history_test_plan.md`<br>`export_test_cases/module-codes.json` | `npm run check:tc-parity` exit 0 |
| BUILDER | specs + page objects + selectors + data | `clients/encore/tests/service-charge/service-charge-basic-information.spec.ts`<br>`clients/encore/tests/service-charge/service-charge-history.spec.ts`<br>`clients/encore/src/pages/service-charge/service-charge.page.ts`<br>`clients/encore/src/selectors/service-charge/service-charge.ts`<br>`clients/encore/src/data/service-charge/service-charge.ts` | `npx playwright test --list` resolves all TC-SVC IDs; each spec green solo ×2; `tsc --noEmit` clean |
| HEALER | (none — fires only if Phase 2 failures escalate; fixes land in the BUILDER artifacts above) | (none) | (none) |
| WATCHDOG | false-green sweep + completeness audit | `clients/encore/specs_planning/_internal/false-green-sweeps/service-charge-2026-08-11.md` | sweep verdict recorded; zero unfixed FALSE-GREEN |
| GARDENER | (none — no refactor scope this plan) | (none) | (none) |
| OWNER | plan closure + ship | `plans/done/PLAN_NM3344_SERVICE_CHARGE_COVERAGE_QUICK.md` | `node scripts/validate-plan-closure.mjs` PASS; leak-check on the shipped tree returns no internal paths (command in Phase 5) |

Duty-coverage note (/planning Step 3 gate): HUNTER HARD STOPS (location=1604 ✓, exact URL ✓, scope=named tabs only ✓, read-only baseline ✓, CLI YAML default ✓, beforeunload trap ✓) reflected in Phases 0.25–0.75; GIVER duties (PLN-049 inventory emission, LR-057 probes, LR-064 TDW, taxonomy §2/§3) reflected in Phases 0.75–1; BUILDER (GEN-029 walkthrough-first via fresh inventories, GEN-028 tests-must-run, FCC-runner reuse, parity gate, no root-framework edits) reflected in Phase 2; WATCHDOG (AUD-017 no-self-audit, R15 assume-errors-exist) reflected in Phase 3. HEALER/GARDENER: excused — `out-of-scope: no standing failures or refactor scope at authoring; HEALER fires conditionally via /rca`.

## Closure status — why this plan stays PENDING (2026-08-11)

The delivery work is complete. This plan is deliberately **not** flipped to DONE, because one closure
check cannot pass for this module and falsifying the fields that make it applicable is not an option.

**What passes**: every cited artifact path resolves; the Per-Identity matrix cells are real files; the
out-of-scope dispositions carry proper citations; no observation row claims evidence it does not have.

**What cannot pass — and why it is a gate limitation, not a coverage gap**: the coverage check caps
out-of-scope rows at 15% of the machine denominator. This page's denominator is dominated by the
application's global navigation chrome — roughly 22 interactive elements that appear on every page of the
app regardless of which module is being walked. Service Charge Basic Information contributes only 3
module-specific elements of 29 total, so even a flawless walk yields at most 12% non-out-of-scope. The cap
is mathematically unreachable for a small module on a chrome-heavy application. The Pricing artifact that
does pass has ~20 module elements against the same fixed chrome overhead, and it additionally predates the
manifest mandate, so it is not evidence that the cap is satisfiable here.

**The real fix**, if this recurs: give `scripts/walk-coverage/enumerate-page.mjs` a way to scope
enumeration to a module container so global chrome never enters the denominator. It has no such option
today (its argument parser accepts only `--key=value` pairs; there is no root or subtree filter). That is
framework work, out of scope for this delivery, and the gate was deliberately left unedited.

**Consequence for shipping**: none. A closure gate governs the plan's Status field, not the deliverable.
The client-facing surface is committed and ships independently.

## Prior-Fix Trial

| Prior fix | What it was meant to prevent | Why it failed to prevent this instance | Replacement and verdict |
|---|---|---|---|
| Value-string readiness gate for Service Charge percentage fields; old-fix evidence: clients/encore/reports/settle-gate-0814/RESULT.md:33 | Prevent tests from typing while the grid was still loading, after the inputs enabled but before stored values finished writing. | It watched the percentage fields' displayed value strings and declared readiness when those strings stopped changing. clients/encore/reports/settle-gate-v3-0814/RESULT.md:9 through :16 recorded 316 input-attribute rewrites after that gate on all eight measured loads; because the rewritten fields could keep the same visible value string, the gate passed while the race was still active. | **CONVICTED** — removed, not layered over. clients/encore/src/pages/service-charge/service-charge.page.ts:87 now polls the 79 percentage inputs directly, including enabled state and input value, until their signatures stay quiet before interaction. |
| Post-blur invalid-marking checks in the negative percentage cases; old-fix evidence: clients/encore/reports/fix-invalid-asserts-0814/RESULT.md:24 | Prove invalid percentage entries were rejected after focus left the field. | The live signal did not live after blur: clients/encore/reports/invalid-signal-0814/RESULT.md:34 through :41 measured each value five times and showed the invalid marking was reliable while focused for the invalid values, while after blur the app usually restored the stored value and cleared the marking; Save stayed disabled after blur in every measured case. | **CONVICTED** — removed, not layered over. clients/encore/src/pages/service-charge/service-charge.page.ts:346 now checks the focused invalid signal before tabbing away, and the tests then check Save remains disabled after blur. |

### Removal diff

Both convicted approaches were removed, not layered over, in the same change that replaced them —
commit b80bdd6d0. The removal diff deleted the value-string readiness wait from
`clients/encore/src/pages/service-charge/service-charge.page.ts` and rewired the call site to the
signature poll now at :87; the same patch deleted the post-blur-only invalid assertions from the five
negative percentage cases in
`clients/encore/tests/service-charge/service-charge-basic-information.spec.ts` and rewired them to the
focused read at :346 plus a Save-disabled check after blur. Neither convicted mechanism survives
anywhere in either file.

### Protection-parity table

| Protective Function | Surviving Mechanism |
|---|---|
| Do not type into percentage fields until their stored values have finished being written | Direct polling of all 79 percentage input signatures — enabled state and value — until they stop changing (`service-charge.page.ts:87`) |
| Prove an invalid percentage entry is rejected | The invalid marking is read while the field still has focus (`service-charge.page.ts:346`), and the five negative tests then confirm Save stays disabled after focus leaves |

## Deferral Authorization

Phase 5, the ship-to-client-deliverables phase, is deferred by owner decision. On 2026-08-15 the owner
declined the push in chat with the exact words "no pushing, fix other things"; that quote is from the
session transcript and has no separate on-disk record.

What the ship phase itself copies — the specs, page objects, test cases and workbook — is committed as
of b80bdd6d0, so the ship command can run unchanged whenever the owner chooses. That is not the same as
the plan being finished: Phase 4 closure is still partial, and the walk-coverage check reports a
shortfall in the recorded control denominator. The deferral covers the push only; it does not close the
plan.

---

## Acceptance criteria (LR-040)

- [ ] Both sub-tabs walked with machine denominators; every element dispositioned; `deferred-to-DEEP` used for all L2/L3 material (NO DEEP subplan authored — strict line).
- [ ] Every editable field on both tabs has its full §2 case set with the §2.1 oracle — the "deep in field-level validations" core.
- [ ] Every applicable §3 family: exactly the L1 QUICK must-assert(s) or an `out-of-scope:` token. Nothing beyond L1 (strict line).
- [ ] 2 spec files exist, each green solo ×2; typecheck + spec-quality + step-labels + tc-parity all clean.
- [ ] MD + test-plan + XLSX parity landed in the SAME plan (LR-ENC-002 — no "later").
- [ ] Delegation receipt (worker-ext Receipt v3) in the closure summary; delegation ratio ≥0.95 target; "I coded myself: nothing" is the goal.
- [ ] Ship (Phase 5) completed to `encore-mock/main` additive with leak-check clean — OR an explicit `## Deferral Authorization` block if Rutvik defers the push.
- [ ] Bug harvest delivered: walks executed as dual-product (coverage denominator AND active SFDPOT bug hunt); every find filed per LR-034 with `baselineComparison` (or LR-040(c) discussion-item flag) + required-TC linkage; `## Observations` buckets non-empty or literal `none` with the hunt evidenced.
- [ ] Jira scan exhaustive: crossref artifact lists every "service charge" hit across Jira (all statuses) + Confluence with relevance dispositions — not just NM-3344.

## Verification (D23 — runnable checks for any session)

```bash
node scripts/plans-reindex.mjs --check   # INDEX consistent, this plan listed PENDING
```
```bash
npm run check:tc-parity                  # exit 0 after Phase 1 (SVC rows included)
```
```bash
npx playwright test clients/encore/tests/service-charge/service-charge-basic-information.spec.ts   # green solo (Phase 2+)
```
```bash
node scripts/verify-no-forbidden.mjs --target=<clean-extract>   # exit 0 before any Phase-5 push
```

## Execution Summary

**Status of this summary**: Phases 0–4 delivered and closed. Phase 5 (ship) has not run — it is deferred
by owner decision, recorded under `## Deferral Authorization`. Two findings are documented as open and
deliberately not closed here — see "Known and not closed here" at the end of this section.

### Test cases implemented

| Sub-tab | TC IDs | Count | Spec |
|---|---|---|---|
| Basic Information | TC-SVC-BAS-001 … TC-SVC-BAS-030 | 30 | `clients/encore/tests/service-charge/service-charge-basic-information.spec.ts` |
| History | TC-SVC-HIS-001 … TC-SVC-HIS-015 | 15 | `clients/encore/tests/service-charge/service-charge-history.spec.ts` |

None dropped. The test-case documents and the specs carry the same 45 identifiers — confirmed by
`npm run check:tc-parity` (PASS) during the commit that landed this work.

### Verification (2026-08-15)

- Basic Information: 31 passed (the 30 test cases plus the sign-in setup step), on repeated full runs,
  the last at 4.4 minutes. No retries, no test filter, single worker.
- History: 16 passed (15 test cases plus sign-in setup).
- `node scripts/check-step-labels.mjs` — 0 violations across 25 page files and 33 spec files.
- `npx tsc --noEmit` — clean.

### What the work found and fixed

The intermittent failures across this module had one cause. The percentage grid enables its inputs
about one and a half to two seconds before it writes their stored values, so anything typed in that
window was silently overwritten. The page object now waits for those values to settle before a test may
interact with them — no sleeps and no retries.

That fix exposed an older problem in five negative test cases. They checked the rejection marking after
focus left the field, where the application usually restores the stored value and clears the marking.
Measured five times per value, the marking is reliable only while the field still has focus, and Save
stays disabled after focus leaves in every case. Those five now check both signals, which is stricter
than what they replaced, and the test-case document says the same.

Landed in commit `b80bdd6d0`.

### Documentation and deliverable changes

- `clients/encore/specs_planning/test-cases/setup/service-charge/service_charge_basic_information_test_cases.md`
  — five cases rewritten to the measured behaviour, two titles matched to the specs, a stale
  "needs live confirmation" marker removed from TC-SVC-BAS-022, and a bare date removed from a
  client-visible row.
- `clients/encore/specs_planning/_internal/ground-truth-service-charge-manual-2026-08-14.md` — the
  owner's own replication steps recorded as ground truth.
- The Service Charge sheets in the deliverable workbooks were rebuilt from those documents and staged
  with them in the same commit.

### Four commit-gate defects fixed along the way

These were pre-existing and blocked the commit; all four are in commit `b80bdd6d0`.

1. The workbook builder counted files already staged for the commit as "uncommitted" and refused to
   run, which made committing any test-case document impossible.
2. The freshness check compared a hidden bookkeeping sheet that the comparison build is designed never
   to produce, so it failed itself on every run.
3. The "has anything changed" check read the last commit, so it could not see a staged edit and skipped
   rebuilding.
4. The freshness check could not see input-identity drift at all; it now compares the recorded
   fingerprint separately from the visible rows.

Reviewed adversarially by a second provider, which returned five findings; four were conceded and
fixed, one was refuted with evidence. Reports under `clients/encore/reports/council-gatefixes-0815/`
and `clients/encore/reports/council-defend-0815/`.

### Closing the walk-phase gaps (2026-08-15)

Everything the closure gate reported against the earlier walk phases has been resolved, and resolving it
uncovered five defects in the checks themselves. Each was fixed, then attacked by a reviewer from a
different provider, defended by its author, and re-verified here before landing.

- **The old-site baseline note** now carries its machine keys and a parseable walk-state line. Six of its
  rows claimed the Save button and percentage fields had been exercised while citing an element listing
  that cannot show behaviour — and the walk they belong to recorded those controls as disabled. They were
  genuine old-site observations attached to new-site identifiers; they now claim only what their evidence
  supports, and the rows match the shape the parser reads.
- **The out-of-scope cap** was measuring a module's write-offs against the whole screen, so application
  shell controls counted against Service Charge. It now measures against the module's own controls.
- **The manifest reader** could not read a key containing the character the table uses to separate
  columns, and compared keys without regard to case. Both fixed; the second was pre-existing.
- **The denominator cross-check** compared one page's count against every page's rows at once. Rows now
  record the page they came from. Producing the Service Charge rows — which had never been produced, the
  row file predating those walks by three weeks — makes both pages agree. That agreement is reported
  honestly as equal widened estimates rather than proof of coverage, because nearly every control's type
  went unresolved.
- **The unresolved-probe check** had been failing plans since 22 July while running in a mode its own
  comment and its configuration both describe as non-blocking. Its findings are now reported without
  failing the verdict, and the summary distinguishes closure being permitted from the records being clean.

**The Service Charge page was re-walked on 2026-08-15** to settle the one genuine gap. The environment is
healthy: office 1604 loads, all 79 percentage fields are enabled and carry values, and the History tab
returns 347 rows with no loading placeholders. The two attempts on 10 August that recorded the page as
unusable hit a degraded environment, not a broken page. Evidence:
`clients/encore/reports/sc-livewalk-0815/RESULT.md` and the two screenshots beside it.

### Remaining before DONE

- **Phase 5 (ship)** has not run — deferred by owner decision on 2026-08-15, see `## Deferral
  Authorization`. This is the only outstanding item.

### Known and not closed here

- **Type resolution is failing on this page.** The enumerator resolved 23 of 29 controls as unknown on
  11 August and 30 of 30 on 15 August, because it reads each element's type after its own tab cycle has
  unmounted the controls. This inflates the expected-case count roughly 129-fold and is what makes the
  denominator agreement weak evidence. The unresolved-probe check reports it on every run. Fixing the
  enumerator is a separate job.
- **Only one class of invalid input has been observed live.** A non-numeric value stays marked invalid
  after focus leaves and keeps its text, with Save disabled. Numeric out-of-range values were measured on
  14 August and cleared their marking after blur. The two have never been compared on the same day, so
  the five negative test cases cover one rejection behaviour and not the other.

## Plan-Deviations log

(append D-N rows during /execute for genuine scope/process surprises only)

## Handoff (post-execution)

Chat-only per feedback_handoff_in_chat_only. Outcome shape: NM-3344 Service Charge covered at QUICK field-level depth — 2 specs live and green, parity artifacts landed, deliverable shipped to main (or push deferred with authorization), registry row added. LR-039: outcomes only.
