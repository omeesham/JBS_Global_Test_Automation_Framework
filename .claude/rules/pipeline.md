---
description: Plan / subplan authoring + execution + closure discipline
paths:
  - "plans/**/*.md"
  - ".claude/skills/**/SKILL.md"
---

# Pipeline / Plan Authoring Discipline

Path-scoped rule pack — loads when authoring or modifying plans, subplans, or skill definitions.

## LR-020: Verify all plan claims against actual codebase before finalizing

Plans are artifacts — they drift from reality the moment they're written.
Before finalizing ANY plan:

- Verify rule numbers (grep agent files for last PLN/REQ/ALL)
- Verify test counts (grep spec files for `test(`)
- Verify file references exist
- Verify cross-references between plans match current filenames

Rule numbering collisions silently overwrite existing rules. Stale test counts undermine the audit's credibility. Stale filenames break cross-plan traceability.

**Data-flow corollary (2026-07-12 — graduated at 3rd occurrence: PLAN_UPLINK_PROTOCOL A1 + D7 + D8 / R-530, R-531)**: verifying a cited `file:line` anchor means confirming the **state the plan uses exists and holds AT that line** — not merely that the line exists. Per anchor class: (1) *injection anchor* — is the variable/buffer the plan injects into already built at that line? (A1: advisory inject cited copilot-worker.sh:96–98; `$PROMPT` isn't built until :235). (2) *write anchor* — is the record the plan wants to enrich still unwritten at this point? (D7: `ask_open` worded at the report-copy step :499; the ledger row it must land in is appended at :480). (3) *edit anchor* — does the cited file DEFINE the function being edited, or only call it? (D8: `write_pause_notice` edit targeted chain-orchestrator.sh:158 — a call site; the definition lives in chain-guards.sh:108). Address-exists is necessary, never sufficient. Also: never reuse an audit/recon report's label namespace (D1/D2/…) inside an implementation plan — the target file's own comments may already use those labels (`# D1:` copilot-worker.sh:324); rename to a fresh namespace (UW-1..4 precedent).
**Trigger**: Any plan that references rule numbers, test counts, or other plan filenames; **plus any plan citing file:line anchors for injections, record enrichment, or function edits (data-flow corollary)**.

## LR-027: Plan finalization — execution summary MANDATORY before move to done/

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

**Parent-cascade clause** (added 2026-04-24): Immediately after moving a SUBPLAN to `done/`, grep `plans/pending/` for any other `SUBPLAN_*.md` whose `**Parent**:` field points at this subplan's parent PLAN. If zero matches, YOU are the last subplan — close the parent PLAN too (same Status/Executed/Execution Summary treatment, summary cites the subplan chain). If matches exist, do nothing — the current last-at-state will handle closure when its own turn comes. Responsibility moves as subplans are added; the filesystem grep resolves "who is last" correctly without explicit hand-off. Skipping the cascade when pending-subplan count is zero = LR-027 violation (repeat-offense pattern: parent plans rotting in `pending/` after all work is done).

**Parent-cascade annotation extension** (added 2026-05-28, PLAN_DONE_MEANS_DONE Phase 2.7 — plugs finding #4 gap): distinct from the auto-close clause above, **every child closure MUST annotate its DONE line in the parent's body IFF the parent is still in `plans/pending/`** — regardless of how many sibling subplans remain pending. Format = `- [<child>.md](../done/<child>.md) — **DONE <YYYY-MM-DD>**, <one-line summary>`. The two cascades are different obligations: *annotation* = "mark this child DONE inside a pending parent's body"; *auto-close* = "flip the pending parent to DONE when zero siblings remain". A parent may carry an explicit auto-close EXEMPTION (e.g., `PLAN_BIG_PIVOT_FCC_MASTER.md` §Cascade closure rules, user-authorized 2026-05-21) and STILL require per-child annotation — the exemption suppresses only the flip, not the annotation. **Scope guardrail (P2)**: the annotation requirement does NOT fire when the parent is already in `plans/done/` — done-parents are inert (their Execution Summary froze reality at close time; back-patching annotations into them would thrash already-closed plans every time a stray late child closes). Enforcement: `scripts/validate-plan-closure.mjs` C4 parent-cascade sub-check — if the closing plan declares a `**Parent**:` resolving to a `plans/pending/` file and that parent's body does not mention the child filename with a `DONE` token within 7 lines → C4 sub-failure. Activation rides the C6 rollout knob (`c6_mode`): FAIL under `deny`, reported-WARN under `announce`/`--dry-run`, not computed under `off` — so the new check ramps in lockstep with C6 rather than retroactively blocking every existing done-plan-with-pending-parent on its next edit.

## LR-028: Session bookkeeping — activity log entry at session end

Before ending any session that modified pipeline artifacts (specs, page objects, selectors, test data, test cases, test plans, REQUIREMENTS.md):

1. Append entry to `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-activity-log.md`
   Format: `| YYYY-MM-DDThh:mm | agent | done | file1, file2, ... | DESCRIPTION |`
2. If unexpected behaviors were discovered → write to `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md`
3. If MCP findings contradicted plan assumptions → update the plan's execution summary

Activity log is the audit trail. Missing entry = invisible session = audit finding.
**Trigger**: End of any session that touched pipeline files.
**Graduated from**: WATCHDOG audit 2026-04-06 (F-001).

## LR-040: Subplan closure completeness gate — every gap needs a concrete destination

`Status: DONE` on any catalog / discovery / MCP-driven subplan requires, for **every** planned item (parent, column, TC — whatever the subplan enumerates), one of:

(a) **Directly MCP-proven** — cited save-cycle timestamp + row diff in the Execution Summary.
(b) **Inference-classified** with a **grep-verifiable line item** in a named downstream subplan file that currently exists in `plans/pending/` or `plans/done/`. The agent MUST grep the recipient file for the specific item text before closing. "Scope-pushed to SP-X" without a grep-verifiable line item in SP-X's file = **phantom hand-off = audit finding**.
(c) **User-flagged** with a named bug-candidate ID (e.g., `PRC-BUG-C`) AND a "Pending decisions" entry in the gated SP-E-* subplan, OR marked as a **discussion-item** per `feedback_discussion_item_not_bug.md` (empty-everywhere + no-UI-path + no-Jira). Discussion-items do NOT need a bug ID — they need a named flag in the catalog + Execution Summary.

**(c) empty-surface extension — investigate HOW it populates before flagging empty (M4, 2026-06-19).** An empty surface (an empty tab, a "No results." grid, a blank list) may NOT be flagged `empty` + "refresh later" / "no data" and closed without first investigating how it is *supposed* to populate. Before assigning an empty surface to (c), record ALL three:
- **c.1 — population path**: HOW does the surface get data? Name the concrete enabler — the UI path that adds a row, the governing Jira ID, the admin/super-admin setup step, or **which office actually has data** (e.g. Labor product groups repro on office 1101, NM-1881 — not the default 1604). "It was empty on 1604" is a data-state observation, never a population-path.
- **c.2 — classification**: is the emptiness `data-blocked` (real data exists elsewhere / needs setup — testable once populated), `feature-blocked` (the surface is gated behind an unbuilt/disabled feature), or `by-design` (legitimately empty until a user acts)? The three have different dispositions; an unclassified "empty" is not a disposition.
- **c.3 — escalate-if-unknown**: if the population path is unknown after a real dig (live UI affordance probe + Jira/Confluence per LR-ENC-004 + a second office), escalate via `/encore-questions` — do NOT silently accept the empty state. An empty surface with no c.1/c.2/c.3 record is the M4 miss (Labor override tab accepted empty, never investigated; the picker was currency-gated per NM-1472 and Labor data lived on office 1101 per NM-1881).

Labels like "TRACKED (by inference)" / "NOT-TRACKED (inferred)" / "scope-pushed" on their own are NOT sufficient — they must be backed by (b) or (c).

**HALT condition**: if ANY planned item cannot be classified into (a)/(b)/(c) at Status-flip time, HALT and ask the user. Do not flip Status on prose-only deferral. LR-027 guards the Execution Summary text; LR-040 guards the Status field itself.

**How to apply** — at every catalog / discovery / MCP subplan's closure, BEFORE editing Status:

1. List every planned item.
2. For each, assign (a), (b), or (c).
3. For (b): grep the recipient file. Missing → add the line item there first, then close.
4. For (c): confirm the named flag / bug-ID / Pending-decision entry exists in the target file. Missing → add first. **For any EMPTY surface (empty tab / "No results." grid / blank list): confirm the c.1 population-path + c.2 classification + c.3 escalate-if-unknown record exists. Missing → investigate (live affordance probe + Jira per LR-ENC-004 + 2nd office) or escalate via `/encore-questions`; never close on "empty / refresh later".**
5. Any item not (a)/(b)/(c) → HALT + ask user.

**Trigger**: every SP-B-*, SP-C-*, SP-D-*, and any future subplan whose Step-by-Step enumerates parents / columns / TCs; **plus any walk/catalog that encounters an empty surface (empty tab / "No results." grid / blank list) — the (c) empty-surface extension fires (record c.1/c.2/c.3)**.
**Graduated from**: SP-B-LM-2 (2026-04-22) premature-DONE incident. The (c) empty-surface extension added 2026-06-19 by PLAN_CORP_PRICING_REWALK_REMEDIATION M4 (Labor override tab accepted empty, never investigated — the picker was currency-gated per NM-1472, Labor data lived on office 1101 per NM-1881). Cross-refs LR-057 (affordance probe), LR-061 (verify-before-blocked), LR-ENC-004 (Jira-first).

## LR-041: Conservative model + thinking selection — every subplan declares Model + Thinking + PermissionMode

Every NEW subplan MUST declare in frontmatter:

- `**Model**: claude-opus-4-8` | `claude-sonnet-4-6` (bumped 2026-06-05 from `claude-opus-4-7`, which remains valid for already-closed `plans/done/` history)
- `**Thinking**: mid | hi | xhi | max` (authoring scale; maps 1:1 to CLI `--effort medium|high|xhigh|max`)
- `**PermissionMode**: auto | plan | acceptEdits | bypassPermissions` (default `auto`). Planning-type plans (whose output is another plan file — typically `PLAN_*` that spawns subplans, or any plan with `Skills: /planning`) MUST use `plan`. Execution-type (produces code/config) uses `auto` / `acceptEdits` / `bypassPermissions` per need.

**Allowed combinations** (forbidden → promote):

- **Sonnet** (3 effective tiers): `mid` (mechanical only — file moves, INDEX regen, tag rollouts; requires `**Justification**:` frontmatter line) or `hi` (general default). FORBIDDEN: `lo` (under-thinks), `max` (silently clamps to `high` — authoring as `max` is wishful thinking).
- **Opus** (5 tiers): `hi` (low-complexity Opus), `xhi` (default for most Opus work), or `max` (RCA / closure gates / multi-rule judgment; requires `**Justification**:` frontmatter line). FORBIDDEN: `lo`/`mid` (if `mid` is enough, the task is Sonnet `hi`).

**Tier vocabulary**: accept both authoring form (`lo`/`mid`/`hi`/`xhi`/`max`) and CLI form (`low`/`medium`/`high`/`xhigh`/`max`) — same tier, both parseable.

**CLI version gate**: `xhigh` requires Claude Code v2.1.111+. On older CLI, chain-orchestrator clamps `xhi → high` at spawn with a log line. Run `claude update` to unlock Opus 4.8 `xhigh`. `bypassPermissions` requires `**RiskAcknowledged**: true` in frontmatter (orchestrator refuses otherwise per D26).

**How to apply** — at every `/planning` Step 3 validation AND at every `/chain` queue-build (dual gate; authored + runtime):

1. Grep each new subplan for `**Model**:` / `**Thinking**:` / `**PermissionMode**:`. All three required.
2. Reject Sonnet `lo`/`low`/`max` and Opus `lo`/`low`/`mid`/`medium` — forbidden combos are HARD-rejected. `/planning` HALTs before Step 4; `/chain` pauses queue-build.
3. Sonnet `mid`/`medium` and Opus `max` require a structural `**Justification**:` frontmatter line (not prose elsewhere — greppable, unambiguous). Missing = HALT.
4. `bypassPermissions` requires `**RiskAcknowledged**: true` frontmatter line. Missing = orchestrator refuses to spawn (D26).

**Trigger**: every new subplan authored via `/planning`. Enforced by `/planning` SKILL.md Step 3 `[GATE]` (D18) AND by `/chain` SKILL.md queue-build PRESENT-value validator.

## LR-044: Bug Verification Protocol — read verbatim → follow exactly → minimize

Any agent (filer or verifier) interacting with a filed `clients/${ACTIVE_CLIENT}/reports/bugs/BUG-*.json` — verifying, RCAing, fixing, closing, skipping tests against, or surfacing in any report — follows this sequence. Filed bugs are tooling, NOT an oracle.

1. **Read `stepsToReproduce` VERBATIM first** — no paraphrasing, no shortcuts, no "I think I know what they meant." Classical manual-QA discipline: the verifier starts by following the filer's exact recipe, not an improvised alternative.

2. **Follow the filed steps EXACTLY on a fresh page.** Observe at each step: DOM state (`read_page` / `javascript_tool`), network activity (`read_network_requests` — critical per LR-033 for "client blocked vs server rejected"), console errors (`read_console_messages`), form dirty/pristine state. Do not skip setup steps on the first pass.
   - **Symptom does NOT appear → verdict `FALSE`.** Classify RCA category before closing — do NOT prejudge:
     - `ISOLATION` — field saves fine alone; filer mistook concurrent-edit interaction for field-under-test bug.
     - `HALLUCINATION` — symptom never reproduces, even following exact steps.
     - `MISREAD` — symptom exists but filer misinterpreted DOM/network/error evidence.
     - `ENVIRONMENTAL` — was real then, not now (fix shipped, data setup differs).
     - `STALE` — LR-024 violation (filer ran RCA on artifacts from a different test run).
     - `ROLE/OFFICE-DEPENDENT` — bug real but only under different admin/office/data setup.

3. **If confirmed → MINIMIZE (find the shortest repro).** Remove one setup step at a time; re-run; observe. Reconstruct the minimal sequence from only the necessary steps. A minimized repro saves hours for every future agent, test writer, or developer reading the bug.

4. **Update the bug JSON** with findings:
   - Minimal repro found → update `stepsToReproduce` to the simpler version, preserve the original in a new `stepsToReproduceOriginal` field, append a `verificationLog` entry (`{verifierAgent, verifiedDate, verdict, minimalRepro, RCA_category?}`).
   - `FALSE` verdict → update `status` per RCA category: `invalid` for ISOLATION/HALLUCINATION/MISREAD/STALE; `resolved` for ENVIRONMENTAL; keep `open` + annotate for ROLE-OR-OFFICE-DEPENDENT.
   - `CONFIRMED` without minimization gain → append `verificationLog` entry confirming reproducibility on the verification date.

**Filer obligations** (complements verifier obligations above): per LR-034 Step 5 schema, `stepsToReproduce` MUST be a numbered array of concrete actions. Vague prose ("try toggling a few things") is a filing defect — verifiers should refuse to re-verify until the filer upgrades the steps.

**Trigger**: every `/bugfix` run on a filed bug, every `/rca` Phase 5 (MCP replication), every `/find-bugs` live interaction, every `/encore-questions` Phase 5 invocation, any agent about to close a bug, any agent about to skip a test citing a bug, any agent quoting a filed bug's evidence in a plan / report / client-facing artifact.

## LR-046: Strict plan lines beat general rules — HALT-and-ask before rescoping

When executing a plan and an item's contract specifies a strict numeric/boolean condition (`zero hits`, `all N TCs`, `every parent`, `100%`, `must equal X`, `every row`, `no exceptions`), and the live file state would require materially more work to satisfy that condition than the plan body's other items combined, this is a **HALT condition** — NOT a scope-judgment moment.

The strict line beats every general rule (Sweep obligation §140 incremental cleanup, LR-040 closure-gate (b)/(c) options, "common sense" incremental sweeps, etc.) for the duration of THIS plan's execution. General rules describe what's normally OK; the strict line describes what THIS plan author chose to upgrade above normal. **Plan author's specific upgrade > framework's general default.**

Two-part response when this fires:

1. **Stop.** Do NOT pick an APPEND/SPAWN/DO-NOW disposition unilaterally. Do NOT close the parent plan with a YELLOW verdict citing the APPEND.
2. **ASK** the user via `AskUserQuestion` (or chat in plain prose). Present: (a) the strict plan line verbatim, (b) the actual file-state count vs. the strict requirement, (c) the rough scope explosion (1-2 hour estimate), (d) 2–3 options with your recommendation. Wait for the answer before acting.

### APPEND-and-close is forbidden

APPEND-and-close (LR-040 (b) form) is forbidden as the response to a strict-line-vs-state mismatch, **even when the APPEND recipient subplan exists in `plans/pending/` with grep-verifiable line items**. LR-040 governs *closure-gate completeness for items the plan author scoped to the subplan*; LR-046 governs *items the plan author scoped to be strictly satisfied within the subplan*. **Different layer.**

The fact that an APPEND recipient *can be created in 30 seconds* does not undo the fact that the strict line said `zero` and you closed at `N>0`. That is a phantom-handoff with cosmetics — a real recipient file exists, but the plan-contract gap is real.

### Verdict floor for violations

Any `/final-q` audit where a strict plan line was rescoped via APPEND/SPAWN/DO-NOW without prior user authorization = **automatic RED** verdict, regardless of whether the dispositional recipient is grep-verifiable. The verdict floor is structural — the auditor cannot "round up" to YELLOW citing artifact correctness; the closure decision itself was the violation.

### Scope of "strict"

A plan line is "strict" if it contains any of these tokens (case-insensitive, word-boundary):

- `zero` (e.g., "zero hits", "zero failures")
- `all N` where N is a literal number (e.g., "all 87 columns", "all 11 fixes")
- `every` followed by a noun (e.g., "every parent", "every TC", "every row")
- `100%` / `none` / `no exceptions`
- `must equal X` / `must be X` where X is concrete
- An explicit numeric assertion in an Acceptance Criteria checkbox (`- [ ] N=0`)

If the plan line is qualitative ("clean up dirty bits", "reasonable coverage"), LR-046 does not fire — agent judgment applies as usual under §140 / LR-040.

### Trigger

Every `/execute` invocation; every `/final-q` Step 3 audit (cross-check todos against plan body for strict-line satisfaction). Future hook enforcement (SP-DQU-05C) will fire at the moment a TodoWrite entry is updated to status `completed` AND the entry's content references a strict numeric/boolean line that the live file state demonstrably does not satisfy.

### Graduated from

SP-DQU-05 (2026-04-27) — Step 5 "zero hits required" closed with 470 pre-existing hits via SP-DQU-05A APPEND without user authorization. Same pattern as the prior session's `[/find-bugs:direct]` skip — different layer, same shape (strict contract → tidy out → post-hoc rationalization). SP-DQU-05B (2026-04-28) authored this rule + cleaned the 470 hits + filed SP-DQU-05C for hook enforcement.

## LR-050: Restructure plans must enumerate stale-slop cleanup IN-SCOPE — never defer to "discover later"

Any plan whose body restructures architecture (file moves, vendoring, client-split, multi-tenant pivot, deliverable rebuild, ship-pipeline change, framework promotion) MUST enumerate, as in-scope tasks within the SAME plan body:

1. **What becomes stale** — files, configs, scripts, `package.json` entries, env files, doc references, CI workflow steps the prior layout assumed.
2. **What gets removed/migrated/merged** — concrete delete/move/dedupe tasks at file:line level.
3. **Verification** — grep / `find` / `ls -la` per class of stale artifact in acceptance criteria.

Deferring to "follow-up subplan" / "discover-later sweep" / "TODO clean up someday" is FORBIDDEN. Plan author has perfect knowledge at authoring time of the prior layout; encode it as cleanup tasks before the plan flips PENDING. Once the restructure lands, "obvious leftover" becomes "discover by accident later."

### Trigger + enforcement

Fires on every plan under `plans/pending/PLAN_*.md` whose title, frontmatter, or first 100 lines contain any of: `restructure`, `rebuild`, `migrate`, `vendoring`, `client-split`, `multi-tenant`, `deliverable`, `promote`, `consolidate`, `move-to-`, `flatten`, `unify`, `dedupe`, `cleanup`. Also: plans introducing a new top-level directory or changing a `package.json` boundary. `/planning` Step 3 HALTs if such a plan lacks an explicit "Stale-cleanup" / "What becomes stale" / "Removal tasks" section.

### Graduated from

2026-05-06 — root `playwright.config.ts:66` still at `fullyParallel: true` 6 days after `clients/encore/playwright.config.ts:33` was set to `false` as a dependencyGate hard rule. `PLAN_CLIENT_DELIVERABLE_REBUILD` (2026-04-30) restructured the repo to client-architecture without enumerating "delete leftover root duplicates" — 8 file classes drifted; `PLAN_ROOT_CLIENT_DEDUPE.md` cleans up retroactively. Repeat-offense pattern: `SUBPLAN_REPO_04/05/06/07` (2026-04-16, all stale 19+ days) are retroactive evidence of the same lazy-restructure shape.

Cross-refs: pairs with `feedback_restructure_plans_include_cleanup.md`; LR-027, LR-040, LR-046.

## LR-060: Execution-completion discipline — no silent checkpoint; env defers only the env-blocked step

Every closure gate (LR-055 C1–C6, the Per-Identity Matrix audit, LR-040) keys on the `Status: DONE`
flip. An `/execute` that does partial work, leaves the plan PENDING, writes a chat summary, and stops
trips NONE of them — mandated phases can be silently skipped. This rule + its Stop-hook close that hole.

**Four obligations:**

1. **No silent checkpoint.** An `/execute` of a plan file either (a) completes every mandated phase
   (each declared artifact exists), or (b) records an explicit, user-signed `## Deferral Authorization`
   block in the plan body naming what is deferred and why. Ending a session with the plan PENDING,
   mandated-phase artifacts missing, and NO Deferral Authorization block is an audit finding. The
   block requires a REAL user authorization (chat "yes" / "defer X" quoted in it) — the agent may not
   self-author it (an override cannot convert missing evidence into evidence, per
   `feedback_override_cannot_convert_missing_to_evidence.md`).

2. **Env defers only the env-blocked step.** When the environment genuinely blocks a step (e.g. a flaky
   server dropping connections during a long ×2 full-suite run), that SPECIFIC step may be deferred
   (HALT-and-ask or a recorded Deferral Authorization). Env instability does NOT license deferring
   env-INDEPENDENT work — baseline walks (browser observation, not a suite run), catalog / MD-XLSX
   authoring, spec edits, `/review`, `/audit` are env-independent. Citing "env / next session" to defer
   them is the 2026-06-18 Pricing RC-5 rationalization. Distinguish legitimate-blocker (HALT-ask) from
   avoidable-deferral (forbidden).

3. **No DONE flip with red owned-tests deferred to a task chip (M3, 2026-06-19).** A plan MUST NOT flip
   `Status: DONE` while spec tests it owns are red/failing, UNLESS a `## Deferral Authorization` block
   (a) names the red TC IDs verbatim AND (b) points to a **PENDING recipient subplan** that exists in
   `plans/pending/` to carry them. A **transient task chip is NEVER a valid recipient** — it evaporates
   when the session ends, leaving the red tests with no durable owner (the M3 miss: 10 red
   `TC-CPR-TIO-*` toolbar tests deferred to a task chip on a DONE flip, then never run). This governs
   the **test-status axis** specifically: a closure-gate that checks artifacts (C1–C6) or env-deferral
   (obligations 1–2) does NOT catch "DONE while red, routed to a chip." A task chip is the right tool
   for an *out-of-scope adjacent fix* (Phase 2.5 SPAWN), never for *red tests the plan was meant to land
   green*. Distinct from LR-040(b): LR-040(b) only requires a recipient to *exist*, and a task chip
   technically exists — obligation 3 closes that hatch by demanding a PENDING *plan file*, not a chip.

4. **Spec-quality gates run on the WORKING TREE before any "done" / "green" / "verified" claim.** The
   pre-commit spec-quality gates (`check-unfailable-assertions`, `check-swallowed-failures`,
   `check-spec-sleeps`, `check-reload-wait`) fire at COMMIT time on `git diff --cached` — so
   **uncommitted** spec / page-object work is UNGATED, and a green spec RUN is not the same as a
   strong-assertion audit. Any session that touches `clients/*/tests/**` or `clients/*/src/pages/**`
   MUST run `npm run check:spec-quality` (the aggregate that runs those gates in `--enforce` over the
   working tree) and see it pass BEFORE claiming done / verified / green. A commit-time-only gate is NOT
   a substitute. The 2026-07-07 NM-2264 Export-All miss is the graduating incident: six weak /
   silent-swallow assertions shipped past a "green ×2" claim precisely because the gates never ran on the
   uncommitted tree — the same authoring-layer gap as LR-058 (a gate that only fires at commit/ship time,
   nothing at the moment of the claim).

**Enforcement (detective + forcing-function):** `.claude/hooks/execution-completion-gate.sh` (Stop
hook) + `lib/check-execution-completion.mjs` warn on session end when an active `/execute` of a plan
file has a mandated `_internal` artifact missing, the plan is not DONE, and no `## Deferral
Authorization` block exists; the warning persists to
`.claude/state/execution-completion-warnings-<sid>.json`, which `/final-q` + `/audit` read and floor
the verdict. A Stop hook cannot hard-block session end — this is a detective control + forcing-function,
not a veto. (The DENY-capable preventive for the sibling bug-baseline class is `check-bug-baseline.mjs`,
LR-034.) **Obligation 3 (test-status) is additionally enforced at DONE-flip time by closure-check Ct**
(`scripts/validate-plan-closure.mjs`, NON-overridable, rolling out via `test_status_mode` in
`.claude/closure-config.json` — landed `announce`, ramp to `deny`): Ct FAILS a `Status: DONE` plan that
cites a task chip alongside red/failing-test language, OR a `## Deferral Authorization` about test
status that omits the red TC IDs or a `plans/pending/` recipient subplan. Ct keys on the documented
deferral evidence in the plan body (the validator cannot run tests); silently-shipped red is still
caught by the suite-run acceptance criterion + `/final-q`.

**FCC scope note:** for FCC subplans this is Anti-Assumption Gates 4 + 6 in
`PLAN_BIG_PIVOT_FCC_MASTER.md`. LR-050 forbids deferring stale-slop cleanup in restructure plans;
LR-060 forbids deferring mandated phases / env-independent work in execution plans — different layer,
same anti-defer spirit.

**Trigger**: every `/execute` of a plan file; every session-end Stop while an `/execute` window is
open; every decision to defer a plan phase citing "env" / "next session" / "stable env"; **every
`Status: DONE` flip while owned spec tests are red — and every attempt to route red tests to a task
chip instead of a PENDING recipient subplan (obligation 3)**; **every "done" / "verified" / "green"
claim on a session that touched `clients/*/tests/**` or `clients/*/src/pages/**` — run
`npm run check:spec-quality` on the working tree first (obligation 4)**.
**Graduated from**: 2026-06-18 Pricing FCC session (RC-3 baseline-walk skipped silently + RC-5
env-rationalized deferral of env-independent work + checkpoint-as-stopping-point; see
`clients/encore/specs_planning/_internal/agent-mistakes.md`). Obligation 3 (no-red-close test-status
deferral) added 2026-06-19 by PLAN_CORP_PRICING_REWALK_REMEDIATION M3 (10 red `TC-CPR-TIO-*` toolbar
tests flipped DONE to a task chip). Pairs with LR-055 (closure DONE-flip gate + Ct), LR-040 (closure
completeness — obligation 3 closes its task-chip-recipient hatch), LR-050 (restructure no-defer),
LR-046 (strict-line HALT).

## TodoWrite Tagging Contract (SP02B — structural enforcement via hook pair)

> **Post-rename harness (2026-05-25)**: applies to `TaskCreate` / `TaskUpdate` / `TaskList` too — capture fires on `TaskList` PostToolUse (its `tool_response` carries the full task list; `TaskCreate` carries a single just-created task and is not a capture trigger). Rule name stays "TodoWrite" as the institutional identifier; "SP02B" remains the rule ID. Legacy `TodoWrite` callers continue to work — the hook dispatches on `tool_name`.

Every TodoWrite entry created during a `/execute` invocation MUST carry at least one tag from the closed taxonomy below. The tag travels with the entry — context is on the task, not in a separate mental model. Enforced structurally by `.claude/hooks/todo-injection-gate.sh` + `.claude/hooks/lib/check-todo-injection.mjs` (PostToolUse on `TodoWrite|TaskList` captures state, PreToolUse on `Edit|Write|NotebookEdit` denies when state shows untagged or zero todos and the session is currently inside `/execute`).

### Tag taxonomy (4 types — closed list)

| Tag | Format | Use when |
|---|---|---|
| **Skill** | `[/skill:matchtype]` where matchtype ∈ `direct` \| `wrap` \| `inform` \| `verify` | Per `/relevant` Step 3 — subtask matches a skill. `direct` = subtask IS the skill's job. `wrap` = skill runs before+after. `inform` = skill runs first for context. `verify` = skill runs after to check. |
| **LR-rule** | `LR-NNN(reason)` — parens MANDATORY, reason non-empty | `/relevant` Step 2.6 (path-glob LR-rule match). Names the rule that informs HOW to do this todo (e.g., `LR-007(verify before code)`). |
| **Manual** | `[manual](reason)` — parens MANDATORY, reason non-empty | No skill / no LR-rule applies (documentation edits, raw file mutations, one-off shell). Reason explains the work. |
| **Ceremony** | `[ceremony]` — bare, no parens | One of the 8 closure obligations below. Tagged onto the existing TodoWrite entry that covers it (Phase 0.5 dedup checklist), or added as a new todo when the plan didn't enumerate it. |

Multiple tags per entry allowed (e.g., `[/skill:wrap] LR-009(angular dirty)` when `/regression-guard` wraps an Angular-form edit governed by LR-009).

### 8 mandatory ceremony obligations (every `/execute` invocation)

These are the structural closure obligations. `/execute` Phase 0.5 enumerates each, greps the plan for existing coverage, tags covered steps `[ceremony]` in-place, adds new `[ceremony]` todos for uncovered ones. Failure to enumerate = failure to close = the SP1/SP0 closure-half-forgotten failure mode this rule was authored to prevent.

1. **Phase 0** — context loading (navigation.md, agent-mistakes.md, patterns.md, LR scan).
2. **Phase 0.1** — subplan identity ↔ §2 cross-check (LR-043 §D / SP-IDS-04).
3. **Phase 0.5** — `/relevant` skill + LR + agent-mistakes + patterns.md grep injection (this contract's own gate).
4. **Phase 2.5** — Adjacent-Sweep ritual (DO-NOW / SPAWN / APPEND with grep verification, SP00 Fix 1).
5. **Phase 3.5** — plan finalization (Status DONE + Execution Summary + `git mv` to `done/` + `npm run plans:reindex` + parent-cascade per LR-027).
6. **Activity-log row** — per LR-028, with LR-037 timestamp ≥ all touched-file mtimes.
7. **`/final-q` exit** — v2 evidence-emission format per LR-042 + SP00 Fix 2a/2b (every cross-check has `ran '<cmd>' → output: '<snippet>'`).
8. **Per-Identity Matrix Closure Audit** (Phase 3.5 sub-step) — for each row in the plan's Per-Identity Satisfaction Matrix, verify the Concrete Deliverable resolves (file exists) OR is `(skipped: <reason ≥20 chars>)` OR `(none)`. Flag vague-prose rows as HALT. Tagged `[ceremony]` in TodoWrite. (Added 2026-05-28, PLAN_DONE_MEANS_DONE Phase 2.4 — the audit-time companion to closure-check C6.)

### Hook enforcement behavior

- **PostToolUse on `TodoWrite|TaskList`** (post-rename harness) — `.claude/hooks/todo-injection-gate.sh --capture` dispatches on `tool_name`. **TodoWrite**: parses `tool_input.todos`; probe = `content + " " + activeForm`. **TaskList**: parses `tool_response` (array of `{id, subject, status, owner, blockedBy}`); probe = `subject` only (no `activeForm` in TaskList response). For each entry runs the tag regex against the probe; persists `{count, tagged_count, untagged_indices, tags_per_item}` to `.claude/state/todo-state-${session_id}.json` (atomic write via tmp+rename). Non-array `tool_response` for TaskList → fail-open (preserves prior state). Always exits 0; observational only.
- **PreToolUse on `Edit|Write|NotebookEdit`** — `.claude/hooks/todo-injection-gate.sh --validate`:
  1. Reads `transcript_path` from stdin JSON; walks back ≤80 messages for a `Skill` tool_use of `execute` with no subsequent `Skill` of `final-q`. If not in `/execute` → emit allow.
  2. If in `/execute` → reads `.claude/state/todo-state-${session_id}.json`. Missing OR `count == 0` → deny ("Build TodoWrite first per /execute Phase 0.5"). `untagged_indices.length > 0` → deny ("entry #N missing required tag"). Otherwise → allow.
- **Fail-OPEN policy** — any uncaught exception logged to `.claude/state/hook-failures.log`; hook returns allow. A broken gate must never wedge the session. `/final-q` Step 4.5 cross-checks the log per session and floors the verdict to YELLOW if non-empty (silent hook bug detected).

### Override handshake (LR-043 §A precedent — same one-shot break-glass pattern)

When the gate would deny but the agent has a legitimate reason to bypass (rare — e.g., adding the very first ceremony todo when capture hasn't fired yet, or recovering from an aborted TodoWrite call), the override path mirrors LR-043 §A's identity-gate handshake:

1. Agent emits `[OVERRIDE-REQUEST] <target-path>` (line-anchored — must start a line, optionally with markdown wrappers like `>` or `*`) referencing the EXACT file path the next Edit will mutate.
2. User types one of the authorization phrases verbatim in chat: `override approved` / `override ok` / `approve override` / `authorized to override` / `i authorize` / `you are authorized`.
3. Within 3 assistant turns, the next Edit/Write/NotebookEdit on that path is allowed (one-shot — every override consumes the handshake; subsequent edits need a new request).

Override is **discretionary, not workflow** (per LR-043 remediation note). If the same path needs override repeatedly, the right fix is fixing the todo list (call TodoWrite with proper tags), not repeated handshakes.

### Why this contract exists

Both SP1 and SP0 just demonstrated the closure-ceremony-not-in-todos failure mode. SP1 built todos from its 14 plan steps → finished them → handed off ceremony items it never todo'd. SP0 built todos from its 11 plan steps → finished them → admitted post-`/final-q` that Phase 3.5 was "missing from the todo list entirely." Same failure twice in a row. Until the universal ceremony is structurally injected into TodoWrite at `/execute` startup (not relying on the plan author to remember to list it), every subplan keeps shipping with the closure half forgotten. This contract converts the closure obligations from skill prose + LR rules into hook-enforced TodoWrite tags.

**Trigger**: every TodoWrite invocation during a `/execute` session (capture); every Edit/Write/NotebookEdit call (validate). Path-scoped — `paths:` frontmatter already covers `plans/**` and `.claude/skills/**/SKILL.md`, so this rule auto-loads when authoring plans or modifying skills.

## LR-048: Subplan Structural Minimum

Every NEW subplan in `plans/pending/` MUST include these sections in this order:

1. **Title** + **Frontmatter** — Status / Priority / Created / Identity / Parent (subplans only) / Depends on / Model / Thinking / PermissionMode / BrowserTool (per `.claude/rules/browser-tool.md` if any browser work).
2. **Context** — why this subplan exists; provenance line if revived/superseded.
3. **Bootstrap** — Identity, Skills auto-called, Context files (every rule the subplan depends on must be in this list, including parent plan path).
4. **Phase 0** — Dependency + browser-tool gate. Mandatory.
5. **Phase 0.5b — Baseline-first walk** — CONDITIONAL: REQUIRED when ANY of:
   - Identity = WATCHDOG
   - Skills includes `/find-bugs`
   - Title contains "audit" / "neutral-eye" / "find-bugs" / "module audit"
   - Subplan output drives TC corrections

   Phase 0.5b emits or consumes `clients/${ACTIVE_CLIENT}/specs_planning/_internal/old-site-baseline/<module>-<YYYY-MM-DD>.md` per LR-045 row 4. `baselineScope: baseline-absent` is allowed (NOT a HALT) when the feature is net-new on the active site.
6. **Phase 1+** — actual work, identity-scoped.
6.5. **Per-Identity Satisfaction Matrix** (LR-048 v3 — added 2026-05-25 as v2, amended 2026-05-28 to v3 — FCC mistake prevention) — REQUIRED whenever a subplan's body or downstream effects produce, modify, or delete any of: `.spec.ts`, `test-cases/*.md`, `test-plans/*.md`, the XLSX deliverable at `test_cases_xlsx/encore_test_cases.xlsx` (post-2026-05-27 — legacy CSV exports under `test_cases_csv/` are retired in Phase D of PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION), `field-case-catalogs/*.md`, `field-inventories/*.md`, `REQUIREMENTS.md`, `agent-mistakes.md`, or `_internal/old-site-baseline/*.md`.

   The subplan body MUST contain a section `## Per-Identity Satisfaction` with this table:

   | Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
   |---|---|---|---|
   | HUNTER | old-site-baseline / REQUIREMENTS.md (if new behavior) | dated baseline artifact OR explicit `(none)` | grep artifact freshness |
   | GIVER | test-cases.md, test-plans.md, XLSX workbook via planner:post-complete (rebuilds clients/${ACTIVE_CLIENT}/test_cases_xlsx/encore_test_cases.xlsx) | FCC block + Scenarios + post-complete run | `npm run check:tc-parity` exit 0 |
   | BUILDER | specs/<module>/*.spec.ts | FCC describe block at top + first-run pass | `npx playwright test --list` resolves all FCC TC IDs |
   | HEALER | per-fix MD update (if RCA-driven) | MD row Status sync | `npm run check:tc-parity` exit 0 |
   | WATCHDOG | findings table (if audit-driven) | mode-specific output; no spec/MD/XLSX edits | per-mode acceptance |
   | GARDENER | refactor citation (if refactor-driven) | structural change only; no spec logic | `npm run typecheck` clean |

   **Rules for the matrix**:
   - Any cell marked `(none)` is acceptable AND must be EXPLICITLY MARKED. Silence ≠ "no work for that identity" — silence = LR-048 violation.
   - Each non-`(none)` cell's Acceptance command MUST appear in the subplan's Phase 3.5 closure step (per LR-027) with evidence-emission format (`ran '<cmd>' → output: '<snippet>'` per LR-042).
   - At Status flip to DONE, every non-`(none)` cell is classified (a)/(b)/(c) per LR-040 — if (b) "downstream subplan", that recipient must already exist in `plans/pending/` with grep-verifiable line items per LR-040 §b.

   **Concrete Deliverable cell format (v3 — added 2026-05-28, PLAN_DONE_MEANS_DONE Phase 2.1)**: every "Concrete deliverable" cell MUST be EXACTLY one of three explicit forms. Vague prose is rejected at authoring time (`/planning` Step 3 gate) AND at closure time (closure-check C6 — `.claude/rules/plan-closure.md` LR-055):

   | Cell form | Example | Validator behavior |
   |---|---|---|
   | **File path (repo-relative or absolute)** | `clients/encore/specs_planning/_internal/walk-evidence-legal-2026-05-27.md` | Grep at closure; missing file → DENY |
   | **`(skipped: <reason ≥20 chars>)`** | `(skipped: reused walk-evidence-location-settings-2026-05-14 per LR-013)` | Reason regex `\(skipped:\s*.{20,}\)` — non-empty reason ≥20 chars; trim allowed |
   | **`(none)`** | `(none)` — explicitly no work for this identity | No check; the `(none)`-must-be-explicit rule above already governs |

   **Forbidden** (this WAS the failure mode): vague prose like `spot-check log (3 fields)`, `typecheck + lint + parity outputs`, `inline claims`, `proof of work`, `verification logs`.

   **Multi-line cells**: a single Concrete Deliverable cell MAY list multiple file paths separated by `<br>` (or newline). C6 splits and validates each line independently; the cell passes only if ALL lines pass. This lets an OWNER row that touches many files express its multi-deliverable nature without breaking the one-row-per-identity convention.

   **Why v3**: SUBPLAN_LEGAL_FCC (2026-05-27) shipped a matrix whose 6-of-6 Concrete-deliverable cells were vague prose, and C1–C5 passed because vague prose is not a forbidden token. v3 + C6 close that hole — every cell now proves itself (file exists / honest skip with reason / explicit none).

   **Why this exists**: SUBPLAN_NOTES_FCC_PILOT (2026-05-21) added 26 Notes FCC TCs to specs but did not enumerate the GIVER's deliverables (MD FCC block, test-plan Scenarios, deliverable rebuild — originally CSV re-export, post-2026-05-27 `npm run xlsx:build`). Same gap on SUBPLAN_SSL_FCC_PILOT (14 SSL FCC TCs). Without a structural matrix, those items silently became "future cleanup" — exactly what PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT retroactively remediates. The matrix is the structural prevention.

   **Cross-refs**: LR-040 (closure-gate completeness); LR-050 (restructure plans enumerate stale-slop cleanup); LR-027 (execution summary mandatory); ALL-071 (spec-MD parity); LR-ENC-002 (Encore client-level summary); BUILDER HARD STOP #11 (per-agent enforcement).

   **Trigger**: every NEW subplan under `plans/pending/SUBPLAN_*.md` or `plans/pending/PLAN_*.md` whose body / downstream effects touch any of the listed artifact paths. Enforced by `/planning` Step 3 validation (vague-prose gate) + `/audit` §REVIEW Step 2.6 matrix-delivery cross-check + closure-check C6 (LR-055) + LR-040 closure gate at Status flip.

   **Graduated from**: PLAN_AGENT_IDENTITY_REALIGNMENT_AND_FCC_STRUCTURAL_CURE (2026-05-25) — Layer 4. Co-landed with BUILDER HARD STOP #11, pre-commit Gate A (check:tc-parity), and LR-ENC-002.
7. **Acceptance criteria** — checkboxes; for catalog/MCP-driven subplans (LR-040 trigger: `SP-B-*`, `SP-C-*`, `SP-D-*`, or any subplan whose Step-by-Step enumerates parents / columns / TCs), classify every enumerated item as (a)/(b)/(c) per LR-040. Non-catalog subplans use ordinary checkbox acceptance criteria.
8. **Handoff** — chat-only per `feedback_handoff_in_chat_only.md`; describes outcomes per LR-039 (no obstacle claims).

**Skeleton reference**: `plans/pending/_TEMPLATE_SUBPLAN.md` is the canonical copy-paste source (Status: `TEMPLATE-DRAFT`). New subplans copy from there, drop the leading `_`, flip Status to `PENDING`, then fill placeholders.

**Trigger**: every new subplan authored under `plans/pending/SUBPLAN_*.md` or `plans/pending/PLAN_*.md`. Enforced by:
- This rule's path-scope (auto-loads on plan-file edits via `paths: plans/**/*.md`).
- `/planning` Step 3 validation (cross-checks new plan against this section).
- GARDENER sweeps periodically per `PLAN_PLANS_GARDENER_SWEEP.md`.

**Graduated from**: 2026-04-29 — repo-wide auto-injection audit found 9 SP-DQU-12..20 subplans inconsistent in their Phase 0.5b structure (some had it, some didn't, until amended in the same audit). LR-048 prevents recurrence by codifying the minimum. Co-landed with `clients/${ACTIVE_CLIENT}/reports/bugs/**/*.json` glob added to `.claude/rules/baseline.md` paths frontmatter (closes the bug-filing auto-load gap so any agent editing a `BUG-*.json` sees `baselineComparison` per LR-034).

## LR-049: Ship-via-git-archive only — never `cp -r` for client delivery

Client deliverables ship through one and only one path: `npm run client:ship -- --client=<id> --out=<path>`.

The script wraps `git archive HEAD clients/<id>/`, which:

- Includes only files tracked in git (gitignored content is structurally excluded).
- Refuses if vendored framework is stale or if any forbidden pattern is staged.
- Runs a `npx playwright test --list` smoke against the output.

`cp -r clients/<id> /target/` is FORBIDDEN as a delivery mechanism. It copies the entire working tree including gitignored agent artifacts (CLAUDE.md, specs_planning/, .auth/, etc.) and bypasses the vendor-fresh check. Doing this leaks framework IP.

**Defense in depth (3 layers)**:

1. Per-client `.gitignore` (e.g., `clients/encore/.gitignore`) — structural fence; agent artifacts are absent from `git archive` output.
2. This rule (LR-049) — agent-layer guidance; `cp -r` triggers HALT.
3. Pre-push hook `.githooks/pre-push` + `scripts/verify-no-forbidden.mjs` — runtime enforcement; refuses pushes that would leak forbidden patterns.

If any one layer fails, the others catch.

**Caveat — scratch-init pushes silently drop layer 3** (graduated from the 2026-06-02 leak): when you push from a fresh `git init` in a ship-output/scratch dir (the `SHIP_TO_ENCORE.md` Step 4 pattern, and every notes-only variant), the repo's `core.hooksPath` is NOT inherited, so `.githooks/pre-push` never runs — layer 3 is silently absent. Same exposure if you trim or edit the archive AFTER `client:ship`'s deny-list already ran. In those cases the manual check is the ONLY net, so two things are mandatory:
- (a) Run `node scripts/verify-no-forbidden.mjs --target=<DIR>` against a CLEAN extract of the FINAL content — `git archive HEAD | tar -x` into a fresh temp dir, NOT the scratch dir itself (whose `node_modules/` + `.git/` produce false-positive `JBS` / `OWNER` / `.claude/` marker hits that mask the real result).
- (b) The `git push` MUST be conditional on that exit code (`node …verify-no-forbidden… || exit 1`). Echo-and-continue once shipped internal `specs_planning/…` comment paths to the mock `notes` branch before it was caught.

**Trigger**: any chat mention of "ship", "deliver", "package", "send to client", "give them", "make a deliverable", "zip the encore folder", "copy clients/encore to". Agent must verify the operator is invoking the ship script, not `cp` / `tar` / `zip` directly.

**Override**: requires explicit user authorization phrase per the LR-043 break-glass pattern: `override approved` / `override ok` / `i authorize`. One-shot, per-delivery.

**Graduated from**: 2026-04-30 incident — manual `git init && git add . && git push` shipped 195 files including the entire pipeline runtime (orchestrator + backend server + agent worker), agent-only `CLAUDE.md`, and internal `specs_planning/` to a private repo, bypassing the colleague-as-packager assumption (SP-MT-07). PLAN_CLIENT_DELIVERABLE_REBUILD restructured to Path A (vendored framework + git-archive ship) and codified this rule as the agent layer.
