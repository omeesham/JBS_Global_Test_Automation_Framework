# PLAN: Deliverable Quality Upgrade — CSV, Specs, Cleanup, Reporting

> **REBASE NOTE (2026-06-11 · PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT):** that plan executed FIRST (user ruling 2026-06-11) and edits the SAME emitters this one touches. The deliverable is now a single **TestRail step-expanded** `encore_test_cases.xlsx` (13-col first row + continuation step-rows), `Automation Execution`→**`Automation Status`**, `Notes`+reason merged into **`Notes / Reason`** (`Blocked — ` marker), `--with-run` does a REAL run, and `scripts/_gen-testrail.ts` + the `_testrail.xlsx` twin are retired. Re-baseline any column-name / emitter assumptions in this plan against `export_test_cases/{to-xlsx,testrail-format}.ts` + `scripts/xlsx-lint-rules.mjs` before executing.

**Status**: Pending
**Priority**: P0-CYCLE-1
**Created**: 2026-04-22
**Parent**: (root — mega plan)
**Depends on**: none
**Blocks**: HIST column-first pivot (all 31 SUBPLAN_HIST_PIVOT_* subplans paused until this plan closes)
**Skills**: /planning (authoring), /ultrathink (quality gates), /audit (closure), /final-q (exit)

---

## Context

Client colleague audited the Local Office Settings test cases (delivered at the time as `local_office_settings_test_cases.csv`, before the 2026-05-27 CSV→XLSX migration) and flagged **11 specific TC defects** (values violating field constraints, stale defaults, wrong section labels, 3 likely APP bugs that slipped through). Root cause: initial TCs (drafted by copilot/agent early in the project) were authored from an idealized spec, not from live-DOM observation.

Format hygiene (Rules 1-4 in `tc-authoring-rules.md`) was resolved by SP-42 on 2026-04-22. What remains:

1. **Semantic correctness** — defaults, constraints, labels match the actual live app.
2. **Test-type tagging** — colleague asked for `[POSITIVE] [NEGATIVE] [E2E] [UI] [API] [SMOKE] [REGRESSION]`.
3. **Requirements doc sampling-verification** — probabilistic clean-state check (iterate until two consecutive sample sets find zero defects).
4. **QA best-practices benchmark** — compare our approach against industry practice, close gaps.
5. **/simplify + /cleanup** on Encore deliverables + core runtime only (NOT agents, pipeline, orchestrator, website).
6. **Identity ripple sync** — after changes, each agent identity (HUNTER/GIVER/BUILDER/HEALER/WATCHDOG/GARDENER/OWNER) re-checks its owned artifacts for stale "done" claims.
7. **Extend audit to all 11 modules** — Local Office Settings + Local Information first; remaining 9 modules after pattern is proven.
8. **Ship-first ordering** — CSV quality lands before anything else. Client sees clean CSVs even if deeper work (bulletproof specs, cleanup) is still running behind the scenes.

### Core vision

- Test cases that an untrained reviewer can read without jargon, and that match live app behavior.
- Specs that pass full-suite clean. Flakes only on real issues, never on residual human-dirty state (someone manually edited office 1604 between runs).
- Bulletproof pre-test + post-test slate-clearing — specs restore known-good state both ways.
- Deliverables in strict priority: **CSVs (1) → specs clean full-suite (2) → Allure report (3) → bug reports (4, nice-to-have)**.

### The 11 locked reviewer defects (Local Office Settings CSV)

| TC ID | Reviewer flag | Defect type |
|---|---|---|
| TC-LOS-BAS-004 | Value `5` on Prep Date Offset which accepts only negative/zero | Wrong test value |
| TC-LOS-BAS-005 | Value `10` invalid on Prep; missing save dialog text + toast text | Wrong value + missing assertions |
| TC-LOS-BAS-007 | Expected should read "Delivery Date >= Prep Date" | Expected phrasing drift |
| TC-LOS-BAS-009 | Return Date accepts 0/positive/empty only — not negatives | Wrong field-constraint classification |
| TC-LOS-BAS-016 | Phone 1 accepts non-phone text, save stays enabled | **APP BUG candidate** |
| TC-LOS-BAS-025 | All sections active but section names are different | Stale default labels |
| TC-LOS-BAS-032 | Default logo checkboxes changed (Quotes, Rental Orders/DROs now default-on) | Stale defaults |
| TC-LOS-ECT-001 | Commission Structure link yields failure message | **APP BUG candidate** |
| TC-LOS-ECT-007 | Sections named "Event Profit Target" & "Labor Cost Assumption" | Stale labels |
| TC-LOS-ECT-008 | "Administrative Fee" value is `42` | Wrong numeric value |
| TC-LOS-ECT-010 | Non-numeric input doesn't revert; shows 0.00 with save enabled | **APP BUG candidate** (LR-011 violation) |

---

## Locked decisions (do not re-litigate)

| ID | Decision | Rationale |
|---|---|---|
| D1 | 2 modules neutral-eye audited sequentially: Local Office Settings → Local Information. Remaining 9 modules audited AFTER first two are clean (proves the pattern). | User directive 2026-04-22. |
| D2 | Tag placement: rename existing `Specific Field` column → `Tags` in CSV. Zero schema growth. | `Specific Field` is auto-derived from Title by `extractSpecificField()` in `export_test_cases/to-csv.ts:686` — pure redundancy. |
| D3 | Tags authored as 4th column in TC metadata table (Priority \| Status \| Type \| Tags). Converter reads and writes to Tags column. | Matches existing dual-format pattern. |
| D4 | HIST column-first pivot stays at P0 in its own plan. Insert `## P0-EMERGENCY — Deliverable Quality Upgrade` block above HIST in `plans/INDEX.md` — auto-regen script preserves the block if authored in a plan file's Priority field (`P0-EMERGENCY`). | Zero churn on 31 HIST files. |
| D5 | Skills `/today` and `/nextweek` stay private (not in `.claude/skills/INDEX.md`). Copy `/standup` shape. | Matches `/end-day`, `/end-week`, `/standup` private pattern. |
| D6 | Rules 5 (required Tags) + Rule 6 (Live-DOM-first) added to `clients/encore/specs_planning/_internal/tc-authoring-rules.md`. | Root cause of the 11 defects was authoring-from-spec, not authoring-from-DOM. Rule 6 prevents re-occurrence. |
| D7 | Chrome Claude (LR-038 v2) for neutral-eye audits that are auth-heavy / user-at-machine / need live network-request inspection. Playwright CLI for unattended catalog-only passes. MCP retiring. | LR-038 v2 matrix. |
| D8 | Ship-first: Track 1 (CSV quality) closes before any other track blocks on it. Other tracks proceed in parallel behind the scenes. | User explicit: "prio in a way to save ass by delivering the things they really care about first". |
| D9 | /simplify and /cleanup scope: Encore deliverables + Encore-specific runtime code ONLY. Whitelist: specs under `specs/`, page objects under `src/pages/`, selectors under `src/selectors/`, test data under `src/data/`, test-case MDs under `clients/encore/specs_planning/test-cases/`, the deliverable workbook `clients/encore/testcases/encore_test_cases.xlsx`, export scripts `export_test_cases/to-xlsx.ts` (+ its `to-csv.ts` parity oracle). Out of scope: `.github/agents/`, `.claude/`, website/, tools/, config/, orchestrator, pipeline. | User explicit. |
| D10 | Requirements sampling-verification: randomly pick N-item sets from REQUIREMENTS.md, verify on live DOM. Iterate sample sets until 2 consecutive sets find zero defects. Sample size grows across iterations (start 10, grow to 20, then 30). | User directive (point 2). Probabilistic-clean converges to confidence without 100% verification. |
| D11 | **Mandatory baseline-first for every neutral-eye / module-audit subplan** (SP-DQU-12..20 + any future audit). Visit nav2 baseline FIRST per LR-045 row 4 + LR-ENC-001; emit `old-site-baseline/<module>-<YYYY-MM-DD>.md`; produce `## Baseline diff` in findings doc; classify divergences as regression-from-baseline / intentional-UX-change / baseline-absent. ECT and net-new e2e features record `baselineScope: baseline-absent` — NOT a HALT. Every regression-from-baseline → BUG-*.json with `baselineComparison: regression-from-baseline`. | LR-ENC-001 was graduated 2026-04-24, AFTER SP-DQU-02 (LOS audit, 2026-04-22) ran without baseline; the rule was law but the DQU pipeline had already authored without it. SP-DQU-04 (LI audit, 2026-04-27) accidentally used baseline (cited OSB-ACCESS-VERIFY) and caught BUG-LI-001 — proof the workflow works. ~6 of 11 colleague flags could have been pre-caught with a 30-min baseline walk per module. Locked 2026-04-29 after gap analysis. |
| D12 | **Mandatory depth coverage grid in every audit findings doc** — rubric source-of-truth is `clients/encore/specs_planning/_internal/neutral-eye-audits/_TEMPLATE.md` §Coverage depth grid + §Coverage matrix (fully-qualified path; do NOT confuse with `field-inventories/_TEMPLATE.md` which has no coverage rubric). Applies regardless of artifact format the audit emits — neutral-eye findings doc OR field-inventory artifact, the coverage matrix is mandatory output. Every interactive field cross-checked against ISTQB-standard required-TC list (BVA + equivalence partitioning + cross-field + error-guessing) before suggesting new TCs. GAP count > 50 → escalate per LR-040. SP-DQU-05E (NEW) retro-applies this to LOS + LI before HIST starts. | User directive 2026-04-29: "we need enough test cases that cover our ass for these 2 modules such that when we do hist later, we have full in depth coverage". Inline depth rules in template > research subplan (SP-DQU-10 stays P2; depth doesn't block). Path disambiguation added 2026-04-29 post auto-injection health check (Gap A). Locked 2026-04-29. |

---

## Track map

**7 tracks. 35 subplans. Mega plan owns the ordering + ship gate.**

### Track A — Prep (P0, 1 subplan)

| SP | Title | Identity | Skills | Key output |
|---|---|---|---|---|
| SP-DQU-01 | Prep: INDEX block + neutral-eye-audit folder + activity-log row + tmp cleanup | OWNER | none | INDEX P0-EMERGENCY block; `neutral-eye-audits/_TEMPLATE.md` |

### Track B — Neutral-eye audits, first 2 modules (P0, 5 subplans)

| SP | Title | Identity | Skills | Key output |
|---|---|---|---|---|
| SP-DQU-02 | Neutral-eye audit: Local Office Settings (Chrome Claude) | WATCHDOG | /find-bugs, /research | `neutral-eye-audits/local-office-settings-2026-04-22.md` |
| SP-DQU-03 | LOS CSV fixes (11 reviewer flags) + re-export + file 3 APP bugs | HEALER | /bugfix, /regression-guard | Updated MD + CSV + 3 BUG-*.json |
| SP-DQU-04 | Neutral-eye audit: Local Information (Chrome Claude) | WATCHDOG | /find-bugs, /research | `neutral-eye-audits/local-information-2026-04-22.md` |
| SP-DQU-05 | LI CSV fixes + re-export + file any LI APP bugs | HEALER | /bugfix, /regression-guard | Updated MD + CSV + BUG-LI-*.json (count TBD) |
| **SP-DQU-05E** | **LOS + LI deep coverage retro-audit (baseline-first walk + ISTQB depth-grid + gap-fill TCs)** | WATCHDOG → HEALER | /find-bugs, /bugfix, /regression-guard | 2 baseline artifacts + coverage matrix doc + N gap-fill TCs + BUG-* for any regression-from-baseline + 2 re-exported CSVs. **BLOCKS HIST pivot on LOS + LI specs.** |

### Track C — Tag rollout + rules doc update (P0, 3 subplans)

| SP | Title | Identity | Skills | Key output |
|---|---|---|---|---|
| SP-DQU-06 | Converter: rename `Specific Field` → `Tags`; read from metadata table | BUILDER | /simplify, /regression-guard | Modified `export_test_cases/to-csv.ts` |
| SP-DQU-07 | `tc-authoring-rules.md` v2: Rule 5 (Tags required) + Rule 6 (Live-DOM-first) | GARDENER | /simplify | Updated rules doc |
| SP-DQU-08 | Tag rollout: LOS + LI MD files + re-export | BUILDER | none (mechanical) | Tagged MDs + re-exported CSVs |

### Track D — Requirements sampling-verification (P0 parallel, 1 subplan)

| SP | Title | Identity | Skills | Key output |
|---|---|---|---|---|
| SP-DQU-09 | REQUIREMENTS.md sampling-verification loop (probabilistic clean) | WATCHDOG | /audit, /research | Verification log + any REQUIREMENTS.md corrections |

### Track E — QA best-practices benchmark (P1, 1 subplan)

| SP | Title | Identity | Skills | Key output |
|---|---|---|---|---|
| SP-DQU-10 | QA best-practices research + benchmark vs our work | WATCHDOG | /research, /audit | `clients/encore/specs_planning/_internal/qa-benchmark-2026-04-22.md` |

### Track F — Remaining 9 modules neutral-eye audit (P1, 10 subplans)

Proves the pattern on LOS + LI first, then rolls to all.

| SP | Title | Identity | Skills |
|---|---|---|---|
| SP-DQU-11 | Remaining-modules planner: scope, ordering, shared template | WATCHDOG | /planning |
| SP-DQU-12 | Neutral-eye audit: Pricing | WATCHDOG | /find-bugs, /research |
| SP-DQU-13 | Neutral-eye audit: Legal | WATCHDOG | /find-bugs, /research |
| SP-DQU-14 | Neutral-eye audit: Currency | WATCHDOG | /find-bugs, /research |
| SP-DQU-15 | Neutral-eye audit: Notes | WATCHDOG | /find-bugs, /research |
| SP-DQU-16 | Neutral-eye audit: Account & Address | WATCHDOG | /find-bugs, /research |
| SP-DQU-17 | Neutral-eye audit: Shared Setup Locations | WATCHDOG | /find-bugs, /research |
| SP-DQU-18 | Neutral-eye audit: Auto Add-On | WATCHDOG | /find-bugs, /research |
| SP-DQU-19 | Neutral-eye audit: ECT standalone | WATCHDOG | /find-bugs, /research |
| SP-DQU-20 | Neutral-eye audit: Location Management History | WATCHDOG | /find-bugs, /research |

Each produces its own findings MD + CSV fix subplan folded into that subplan's execute phase. File bugs via LR-034.

### Track G — Spec health + bulletproof leftover-state handling (P1, 5 subplans)

Ship-gate: specs must pass full-suite clean with zero flakes. Pre-test + post-test slate-clear mandatory.

| SP | Title | Identity | Skills |
|---|---|---|---|
| SP-DQU-21 | Leftover-state audit: enumerate mutable-state touchpoints per spec | WATCHDOG | /audit, /find-bugs |
| SP-DQU-22 | Pre-test slate-clear pattern design + shared utility | BUILDER | /planning, /simplify |
| SP-DQU-23 | Post-test slate-clear pattern design + shared utility | BUILDER | /planning, /simplify |
| SP-DQU-24 | Apply pre/post slate-clear to all 11 specs | HEALER | /bugfix, /regression-guard |
| SP-DQU-25 | Full-suite clean run + RCA any random failures | HEALER | /rca, /regression-guard |

### Track H — Simplify + Cleanup sweep (P2, 3 subplans)

Scope per D9. No touching agents/pipeline/orchestrator/website.

| SP | Title | Identity | Skills |
|---|---|---|---|
| SP-DQU-26 | Scope definition: whitelist Encore deliverable + runtime code | GARDENER | /simplify, /audit |
| SP-DQU-27 | /simplify sweep on whitelist | GARDENER | /simplify, /regression-guard |
| SP-DQU-28 | /cleanup sweep on whitelist | GARDENER | /cleanup, /regression-guard |

### Track I — Identity ripple sync (P2, 1 subplan)

Every agent has specific task ownership. After our changes, each owner re-checks their artifacts so no stale "done" claims remain.

| SP | Title | Identity | Skills |
|---|---|---|---|
| SP-DQU-29 | Per-identity task re-sync (all 7 agents) | OWNER | /identity, /audit |

### Track J — Reporting (P3, 2 subplans)

| SP | Title | Identity | Skills |
|---|---|---|---|
| SP-DQU-30 | Allure report deliverable (3rd priority) | OWNER | /research |
| SP-DQU-31 | Bug reports consolidation + client-ready format (4th, nice-to-have) | HUNTER | /cleanup |

### Track K — Skills creation (P1 quick wins, 2 subplans)

| SP | Title | Identity | Skills |
|---|---|---|---|
| SP-DQU-32 | Create `/today` skill (private) | OWNER | none |
| SP-DQU-33 | Create `/nextweek` skill (private) | OWNER | none |

### Track L — Delivery + exit gate (P0 at end, 2 subplans)

| SP | Title | Identity | Skills |
|---|---|---|---|
| SP-DQU-34 | Client handoff package: CSVs + Allure + bug reports | OWNER | /deploy, /audit |
| SP-DQU-35 | Exit audit: /audit full-chain + /final-q + diff against 8 asks + LR-040 closure gate | WATCHDOG | /audit, /final-q, /reflect |

---

## Dependency graph

```
SP-01 (Prep)
  │
  ├─► SP-02 (LOS audit) ─► SP-03 (LOS fixes) ─┬─► SP-06 (converter rename)
  │                                            │        ├─► SP-07 (rules doc)
  │                                            │        └─► SP-08 (tag rollout)
  ├─► SP-04 (LI audit) ──► SP-05 (LI fixes) ──┘
  │
  ├─► SP-09 (reqs sampling) ── parallel
  ├─► SP-10 (QA benchmark) ── parallel
  ├─► SP-21 (leftover-state audit) ── parallel
  │      └─► SP-22 → SP-23 → SP-24 → SP-25
  │
  ├─► SP-32 (/today skill) ── parallel quick win
  ├─► SP-33 (/nextweek skill) ── parallel quick win
  │
After SP-08 (tag rollout complete):
  ├─► SP-11 (remaining-modules planner) ─► SP-12..SP-20 (9 module audits, parallelizable)
  ├─► SP-26 (scope def) ─► SP-27 (simplify) ─► SP-28 (cleanup)
  ├─► SP-29 (identity ripple)
  ├─► SP-30 (Allure)
  └─► SP-31 (bug reports consolidation)

Final:
  SP-34 (handoff package) ─► SP-35 (exit audit) ─► DONE ─► HIST pivot resumes
```

---

## Ship-first gate (critical)

**Minimum shippable unit to client**: SP-01 + SP-02 + SP-03 + SP-04 + SP-05 + SP-06 + SP-07 + SP-08.

After SP-08 closes, LOS + LI CSVs are client-ready with:
- 11 reviewer flags fixed (LOS)
- LI audit findings applied
- Tags column replacing Specific Field
- Rules 5 + 6 preventing regression
- All 3 (or more) APP bugs filed per LR-034

SP-30 (Allure) and SP-34 (handoff package) can ship immediately after SP-08 even if Tracks F/G/H/I are still running. User explicit: "we might not be able to do this full task group before time, so prio in a way to save ass".

---

## Success criteria (gate for "plan DONE")

1. **Client-facing**: LOS + LI CSVs reviewed by colleague return zero format or semantic defects.
2. **Schema**: every CSV row has a non-empty `Tags` cell (formerly Specific Field).
3. **Bugs**: every suspected APP bug filed under `reports/bugs/BUG-*.json` with LR-034 required fields; affected TCs carry `Status: Blocked by BUG-*` metadata.
4. **Specs**: full-suite `npm test` run passes clean. No flakes on repeat runs. Leftover-state from prior manual edits cleared pre-test AND post-test.
5. **Rules**: `tc-authoring-rules.md` has Rules 5 + 6 with grep gates; revision log updated.
6. **Requirements**: sampling-verification log shows 2 consecutive clean sets; REQUIREMENTS.md corrections applied.
7. **Skills**: `/today` + `/nextweek` invoke cleanly; output matches KILL LIST + vocabulary discipline from `/standup`.
8. **Identities**: each of 7 agents has a documented task-re-sync row in activity log.
9. **Remaining 9 modules**: each has a neutral-eye audit + applied fixes + bugs filed as needed.
10. **Cleanup**: `/simplify` and `/cleanup` sweeps closed; zero regressions per `/regression-guard` before+after.
11. **Deliverable package**: `clients/encore/testcases/encore_test_cases.xlsx` + Allure report + bug reports bundled for client.
12. **Exit audit**: every one of the 8 user asks has a ✓ in the exit-audit diff OR a logged carryover entry in `agent-activity-log.md`.
13. **LR-040 closure gate**: every planned item classified as (a) MCP-proven, (b) grep-verifiable hand-off, or (c) user-flagged discussion-item. No phantom hand-offs.

---

## Out of scope (explicit)

- HIST column-first pivot (31 subplans) — resumes after SP-35 closes.
- Framework-level rules sweep (SP-K1 in HIST plan) — deferred.
- Agent prompts sweep (SP-K2 in HIST plan) — deferred.
- Website / chat UI bugs — separate plan.
- Multi-tenant restructure — separate plan.
- Playwright CLI adoption — separate plan.
- Any rewrite of agents (HUNTER/GIVER/etc.) — only re-sync their owned artifacts post-changes.
- Website, orchestrator, pipeline code — excluded from /simplify and /cleanup per D9.

---

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Client pushback on column rename (Specific Field → Tags) | Document rename in handoff notes; Specific Field was auto-derived — no human data lost. Optional alias-column for one release cycle if pushback. |
| LI audit surfaces >5 new APP bugs → scope explosion | Hard gate per LR-040: file bugs, re-scope with user before authoring corrective TCs. Don't silently absorb. |
| Full-suite run reveals Angular dirty-state race (LR-026) in slate-clear utility | RCA per LR-033 + LR-024; design utility around reload-based reset (not markAsPristine). |
| /simplify accidentally breaks specs | /regression-guard before + after every sweep subplan. |
| HIST pivot resumption forgotten | Exit audit (SP-35) mandatory last step writes resumption pointer to PLAN_HIST_COLUMN_FIRST_PIVOT.md in `plans/INDEX.md`. |
| Chrome Claude session context bloat on 11-module audit | One module = one Chrome session. Activity-log row between. User at machine per LR-038. |
| Requirements sampling loop never converges (always finds defects) | Hard HALT after 5 iterations. If still dirty, re-scope entire REQUIREMENTS.md as a subplan (new subplan numbered SP-DQU-09b). |
| Over-tagging (everything becomes SMOKE) | Tag definitions in Rule 5 are strict boundaries; spot-check top 10 TCs per module before bulk apply. |

---

## Reference files (read-only dependencies)

- `clients/encore/specs_planning/_internal/tc-authoring-rules.md` — 4 rules + Phase 0 greps + known-leaks.
- `clients/encore/CLAUDE.md (was REQUIREMENTS.md, removed 2026-05-19 per unified-matsumoto plan)` — authoritative functional specs.
- `clients/encore/docs/read_only_docs/Functional Requirement -v1.docx` — binary source for v1 rules.
- `clients/encore/docs/read_only_docs/Encore-Requirements-V2.docx` — v2 additions.
- `export_test_cases/to-csv.ts` — converter (modified in SP-06).
- `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md` — cross-reference for Local Info audit (do NOT duplicate).
- `.claude/skills/standup/SKILL.md` — template for /today + /nextweek.
- `.claude/skills/end-day/SKILL.md` — private-skill pattern reference.
- LR-034 (Bug Filing), LR-037 (activity-log timestamps), LR-038 (browser matrix), LR-040 (closure gate), LR-018 (spec-fixing workflow), LR-024 (artifacts + fresh run before RCA), LR-026 (Angular dirty-state).

---

## Execution contract (for the agent running this mega plan or its chain)

- Follow LR-040 closure gate at every subplan's status flip.
- Announce browser choice per LR-038 v2 on first action of every Chrome-or-CLI session; log `[BROWSER-SWITCH]` on any mid-session tool switch.
- Append activity-log row per LR-037 at every subplan close (current wall-clock, not backdated).
- Run `npm run plans:reindex` after any subplan's status moves (LR-035).
- Run regression-guard before + after any code-touching subplan.
- Handoffs between subplans in CHAT ONLY per `feedback_handoff_in_chat_only.md` — never write handoff notes to files.
- Describe OUTCOMES, not obstacles per LR-039 — if blocked, re-test simplest approach once, then ask user.

## Inherited doctrine-ledger item (PLAN_UNIQUE_CASE_COVERAGE_FLOOR Phase 4)

- **LR-010** (cross-field async, `.claude/rules/angular.md`) — adjudicated **UNENFORCED: S1**. No gate verifies that a spec awaits a dependent field's async recompute before asserting on it; the failure mode is a flake that reads the pre-update value. Recorded by `.claude/doctrine-ledger.json`, which fails until this line exists (LR-040(b) — a recipient nobody can grep is a phantom handoff).

- **Rule id `.claude/rules/baseline.md#preamble`** (`.claude/rules/baseline.md:14`, LR-045) — adjudicated **UNENFORCED: S1**. Nothing checks that a multi-client TC-authoring pipeline actually declares a baseline truth source per client; a new client can be onboarded with no baseline and nothing objects. Recorded by `.claude/doctrine-ledger.json` (LR-040(b)).
