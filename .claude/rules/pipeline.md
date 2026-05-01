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
**Trigger**: Any plan that references rule numbers, test counts, or other plan filenames.

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

Labels like "TRACKED (by inference)" / "NOT-TRACKED (inferred)" / "scope-pushed" on their own are NOT sufficient — they must be backed by (b) or (c).

**HALT condition**: if ANY planned item cannot be classified into (a)/(b)/(c) at Status-flip time, HALT and ask the user. Do not flip Status on prose-only deferral. LR-027 guards the Execution Summary text; LR-040 guards the Status field itself.

**How to apply** — at every catalog / discovery / MCP subplan's closure, BEFORE editing Status:

1. List every planned item.
2. For each, assign (a), (b), or (c).
3. For (b): grep the recipient file. Missing → add the line item there first, then close.
4. For (c): confirm the named flag / bug-ID / Pending-decision entry exists in the target file. Missing → add first.
5. Any item not (a)/(b)/(c) → HALT + ask user.

**Trigger**: every SP-B-*, SP-C-*, SP-D-*, and any future subplan whose Step-by-Step enumerates parents / columns / TCs.
**Graduated from**: SP-B-LM-2 (2026-04-22) premature-DONE incident.

## LR-041: Conservative model + thinking selection — every subplan declares Model + Thinking + PermissionMode

Every NEW subplan MUST declare in frontmatter:

- `**Model**: claude-opus-4-7` | `claude-sonnet-4-6`
- `**Thinking**: mid | hi | xhi | max` (authoring scale; maps 1:1 to CLI `--effort medium|high|xhigh|max`)
- `**PermissionMode**: auto | plan | acceptEdits | bypassPermissions` (default `auto`). Planning-type plans (whose output is another plan file — typically `PLAN_*` that spawns subplans, or any plan with `Skills: /planning`) MUST use `plan`. Execution-type (produces code/config) uses `auto` / `acceptEdits` / `bypassPermissions` per need.

**Allowed combinations** (forbidden → promote):

- **Sonnet** (3 effective tiers): `mid` (mechanical only — file moves, INDEX regen, tag rollouts; requires `**Justification**:` frontmatter line) or `hi` (general default). FORBIDDEN: `lo` (under-thinks), `max` (silently clamps to `high` — authoring as `max` is wishful thinking).
- **Opus** (5 tiers): `hi` (low-complexity Opus), `xhi` (default for most Opus work), or `max` (RCA / closure gates / multi-rule judgment; requires `**Justification**:` frontmatter line). FORBIDDEN: `lo`/`mid` (if `mid` is enough, the task is Sonnet `hi`).

**Tier vocabulary**: accept both authoring form (`lo`/`mid`/`hi`/`xhi`/`max`) and CLI form (`low`/`medium`/`high`/`xhigh`/`max`) — same tier, both parseable.

**CLI version gate**: `xhigh` requires Claude Code v2.1.111+. On older CLI, chain-orchestrator clamps `xhi → high` at spawn with a log line. Run `claude update` to unlock Opus 4.7 `xhigh`. `bypassPermissions` requires `**RiskAcknowledged**: true` in frontmatter (orchestrator refuses otherwise per D26).

**How to apply** — at every `/planning` Step 3 validation AND at every `/chain` queue-build (dual gate; authored + runtime):

1. Grep each new subplan for `**Model**:` / `**Thinking**:` / `**PermissionMode**:`. All three required.
2. Reject Sonnet `lo`/`low`/`max` and Opus `lo`/`low`/`mid`/`medium` — forbidden combos are HARD-rejected. `/planning` HALTs before Step 4; `/chain` pauses queue-build.
3. Sonnet `mid`/`medium` and Opus `max` require a structural `**Justification**:` frontmatter line (not prose elsewhere — greppable, unambiguous). Missing = HALT.
4. `bypassPermissions` requires `**RiskAcknowledged**: true` frontmatter line. Missing = orchestrator refuses to spawn (D26).

**Trigger**: every new subplan authored via `/planning`. Enforced by `/planning` SKILL.md Step 3 `[GATE]` (D18) AND by `/chain` SKILL.md queue-build PRESENT-value validator.

## LR-044: Bug Verification Protocol — read verbatim → follow exactly → minimize

Any agent (filer or verifier) interacting with a filed `reports/bugs/BUG-*.json` — verifying, RCAing, fixing, closing, skipping tests against, or surfacing in any report — follows this sequence. Filed bugs are tooling, NOT an oracle.

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

## TodoWrite Tagging Contract (SP02B — structural enforcement via hook pair)

Every TodoWrite entry created during a `/execute` invocation MUST carry at least one tag from the closed taxonomy below. The tag travels with the entry — context is on the task, not in a separate mental model. Enforced structurally by `.claude/hooks/todo-injection-gate.sh` + `.claude/hooks/lib/check-todo-injection.mjs` (PostToolUse on `TodoWrite` captures state, PreToolUse on `Edit|Write|NotebookEdit|MultiEdit` denies when state shows untagged or zero todos and the session is currently inside `/execute`).

### Tag taxonomy (4 types — closed list)

| Tag | Format | Use when |
|---|---|---|
| **Skill** | `[/skill:matchtype]` where matchtype ∈ `direct` \| `wrap` \| `inform` \| `verify` | Per `/relevant` Step 3 — subtask matches a skill. `direct` = subtask IS the skill's job. `wrap` = skill runs before+after. `inform` = skill runs first for context. `verify` = skill runs after to check. |
| **LR-rule** | `LR-NNN(reason)` — parens MANDATORY, reason non-empty | `/relevant` Step 2.6 (path-glob LR-rule match). Names the rule that informs HOW to do this todo (e.g., `LR-007(verify before code)`). |
| **Manual** | `[manual](reason)` — parens MANDATORY, reason non-empty | No skill / no LR-rule applies (documentation edits, raw file mutations, one-off shell). Reason explains the work. |
| **Ceremony** | `[ceremony]` — bare, no parens | One of the 7 closure obligations below. Tagged onto the existing TodoWrite entry that covers it (Phase 0.5 dedup checklist), or added as a new todo when the plan didn't enumerate it. |

Multiple tags per entry allowed (e.g., `[/skill:wrap] LR-009(angular dirty)` when `/regression-guard` wraps an Angular-form edit governed by LR-009).

### 7 mandatory ceremony obligations (every `/execute` invocation)

These are the structural closure obligations. `/execute` Phase 0.5 enumerates each, greps the plan for existing coverage, tags covered steps `[ceremony]` in-place, adds new `[ceremony]` todos for uncovered ones. Failure to enumerate = failure to close = the SP1/SP0 closure-half-forgotten failure mode this rule was authored to prevent.

1. **Phase 0** — context loading (navigation.md, agent-mistakes.md, patterns.md, LR scan).
2. **Phase 0.1** — subplan identity ↔ §2 cross-check (LR-043 §D / SP-IDS-04).
3. **Phase 0.5** — `/relevant` skill + LR + agent-mistakes + patterns.md grep injection (this contract's own gate).
4. **Phase 2.5** — Adjacent-Sweep ritual (DO-NOW / SPAWN / APPEND with grep verification, SP00 Fix 1).
5. **Phase 3.5** — plan finalization (Status DONE + Execution Summary + `git mv` to `done/` + `npm run plans:reindex` + parent-cascade per LR-027).
6. **Activity-log row** — per LR-028, with LR-037 timestamp ≥ all touched-file mtimes.
7. **`/final-q` exit** — v2 evidence-emission format per LR-042 + SP00 Fix 2a/2b (every cross-check has `ran '<cmd>' → output: '<snippet>'`).

### Hook enforcement behavior

- **PostToolUse on `TodoWrite`** — `.claude/hooks/todo-injection-gate.sh --capture` parses `tool_input.todos`; for each entry runs the tag regex against `content + " " + activeForm`; persists `{count, tagged_count, untagged_indices, tags_per_item}` to `.claude/state/todo-state-${session_id}.json` (atomic write via tmp+rename). Always exits 0; observational only.
- **PreToolUse on `Edit|Write|NotebookEdit|MultiEdit`** — `.claude/hooks/todo-injection-gate.sh --validate`:
  1. Reads `transcript_path` from stdin JSON; walks back ≤80 messages for a `Skill` tool_use of `execute` with no subsequent `Skill` of `final-q`. If not in `/execute` → emit allow.
  2. If in `/execute` → reads `.claude/state/todo-state-${session_id}.json`. Missing OR `count == 0` → deny ("Build TodoWrite first per /execute Phase 0.5"). `untagged_indices.length > 0` → deny ("entry #N missing required tag"). Otherwise → allow.
- **Fail-OPEN policy** — any uncaught exception logged to `.claude/state/hook-failures.log`; hook returns allow. A broken gate must never wedge the session. `/final-q` Step 4.5 cross-checks the log per session and floors the verdict to YELLOW if non-empty (silent hook bug detected).

### Override handshake (LR-043 §A precedent — same one-shot break-glass pattern)

When the gate would deny but the agent has a legitimate reason to bypass (rare — e.g., adding the very first ceremony todo when capture hasn't fired yet, or recovering from an aborted TodoWrite call), the override path mirrors LR-043 §A's identity-gate handshake:

1. Agent emits `[OVERRIDE-REQUEST] <target-path>` (line-anchored — must start a line, optionally with markdown wrappers like `>` or `*`) referencing the EXACT file path the next Edit will mutate.
2. User types one of the authorization phrases verbatim in chat: `override approved` / `override ok` / `approve override` / `authorized to override` / `i authorize` / `you are authorized`.
3. Within 3 assistant turns, the next Edit/Write/NotebookEdit/MultiEdit on that path is allowed (one-shot — every override consumes the handshake; subsequent edits need a new request).

Override is **discretionary, not workflow** (per LR-043 remediation note). If the same path needs override repeatedly, the right fix is fixing the todo list (call TodoWrite with proper tags), not repeated handshakes.

### Why this contract exists

Both SP1 and SP0 just demonstrated the closure-ceremony-not-in-todos failure mode. SP1 built todos from its 14 plan steps → finished them → handed off ceremony items it never todo'd. SP0 built todos from its 11 plan steps → finished them → admitted post-`/final-q` that Phase 3.5 was "missing from the todo list entirely." Same failure twice in a row. Until the universal ceremony is structurally injected into TodoWrite at `/execute` startup (not relying on the plan author to remember to list it), every subplan keeps shipping with the closure half forgotten. This contract converts the closure obligations from skill prose + LR rules into hook-enforced TodoWrite tags.

**Trigger**: every TodoWrite invocation during a `/execute` session (capture); every Edit/Write/NotebookEdit/MultiEdit call (validate). Path-scoped — `paths:` frontmatter already covers `plans/**` and `.claude/skills/**/SKILL.md`, so this rule auto-loads when authoring plans or modifying skills.

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
7. **Acceptance criteria** — checkboxes; for catalog/MCP-driven subplans (LR-040 trigger: `SP-B-*`, `SP-C-*`, `SP-D-*`, or any subplan whose Step-by-Step enumerates parents / columns / TCs), classify every enumerated item as (a)/(b)/(c) per LR-040. Non-catalog subplans use ordinary checkbox acceptance criteria.
8. **Handoff** — chat-only per `feedback_handoff_in_chat_only.md`; describes outcomes per LR-039 (no obstacle claims).

**Skeleton reference**: `plans/pending/_TEMPLATE_SUBPLAN.md` is the canonical copy-paste source (Status: `TEMPLATE-DRAFT`). New subplans copy from there, drop the leading `_`, flip Status to `PENDING`, then fill placeholders.

**Trigger**: every new subplan authored under `plans/pending/SUBPLAN_*.md` or `plans/pending/PLAN_*.md`. Enforced by:
- This rule's path-scope (auto-loads on plan-file edits via `paths: plans/**/*.md`).
- `/planning` Step 3 validation (cross-checks new plan against this section).
- GARDENER sweeps periodically per `PLAN_PLANS_GARDENER_SWEEP.md`.

**Graduated from**: 2026-04-29 — repo-wide auto-injection audit found 9 SP-DQU-12..20 subplans inconsistent in their Phase 0.5b structure (some had it, some didn't, until amended in the same audit). LR-048 prevents recurrence by codifying the minimum. Co-landed with `reports/bugs/**/*.json` glob added to `.claude/rules/baseline.md` paths frontmatter (closes the bug-filing auto-load gap so any agent editing a `BUG-*.json` sees `baselineComparison` per LR-034).

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

**Trigger**: any chat mention of "ship", "deliver", "package", "send to client", "give them", "make a deliverable", "zip the encore folder", "copy clients/encore to". Agent must verify the operator is invoking the ship script, not `cp` / `tar` / `zip` directly.

**Override**: requires explicit user authorization phrase per the LR-043 break-glass pattern: `override approved` / `override ok` / `i authorize`. One-shot, per-delivery.

**Graduated from**: 2026-04-30 incident — manual `git init && git add . && git push` shipped 195 files including the entire pipeline runtime (orchestrator + backend server + agent worker), agent-only `CLAUDE.md`, and internal `specs_planning/` to a private repo, bypassing the colleague-as-packager assumption (SP-MT-07). PLAN_CLIENT_DELIVERABLE_REBUILD restructured to Path A (vendored framework + git-archive ship) and codified this rule as the agent layer.
