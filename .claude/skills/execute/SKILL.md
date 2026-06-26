---
name: execute
description: Execute an approved plan with pre-research, gap analysis, and post-execution audit — never implement blindly. Use when user says "execute", "implement", "build this", "do it".
user-invocable: true
auto-calls: identity, relevant, regression-guard, reflect, final-q
tools: Read, Glob, Grep, Write, Edit, Bash, Agent, TodoWrite, TaskCreate, TaskUpdate, TaskList
---

# /execute — Disciplined Plan Execution

> **LR lookup**: when citing or verifying `LR-NNN` rules, check BOTH root `CLAUDE.md` and `clients/${ACTIVE_CLIENT}/CLAUDE.md`. Client-specific rules use `LR-ENC-NNN` (or `LR-{CLIENT}-NNN`) prefix; framework rules continue `LR-NNN`.

When the user invokes `/execute`, follow this exact workflow. Do NOT skip steps. Do NOT implement blindly.

## When to Use

**Identity**: OWNER, BUILDER. Auto-loaded via Identity Gate.

- User says "execute", "implement", "build this", "do it", "run the plan"
- A plan exists in `plans/pending/` and user wants it implemented
- User provides a plan inline and says to execute it

## Input
The user will reference a plan (from `plans/pending/` or the current conversation). Load it first.

## Identity Gate
Runs `/identity` Step 1.5 with caller=`/execute`. No-op if compatible identity active.

## Phase 0.0: TodoWrite Tagging Contract is now in force (SP02B — option D)

The hook pair `.claude/hooks/todo-injection-gate.sh` (PostToolUse on `TodoWrite|TaskList` + PreToolUse on `Edit|Write|NotebookEdit`) is registered in `.claude/settings.json`. It detects "are we in `/execute`?" by parsing the transcript for a `Skill` tool_use of `execute` with no subsequent `Skill` of `final-q` (option D — no marker file written by the agent; the transcript IS the marker, per the `CLAUDE_SESSION_ID`-not-in-env discovery 2026-04-27 and the `identity-switch-gate.sh` precedent for transcript-driven detection).

While inside `/execute`, every Edit/Write/NotebookEdit is gated:
- TodoWrite must have been called at least once (PostToolUse captures state to `.claude/state/todo-state-${session_id}.json`).
- Every todo entry must carry at least one tag from the 4-type taxonomy (see `.claude/rules/pipeline.md` § "TodoWrite Tagging Contract"):
  - `[/skill:direct|wrap|inform|verify]` — skill match per `/relevant` Step 3
  - `LR-NNN(reason)` — LR-rule match per `/relevant` Step 2.6
  - `[manual](reason)` — no skill / no LR-rule applies; reason explains the work
  - `[ceremony]` — one of the 7 closure obligations (Phase 0 / Phase 0.1 / Phase 0.5 / Phase 2.5 / Phase 3.5 / activity-log / `/final-q` exit)

A denied Edit returns a `permissionDecision: "deny"` with the exact tag formats listed. Override path = LR-043 §A handshake (assistant emits `[OVERRIDE-REQUEST] <path>`, user types `override approved` — one-shot).

**No agent action required at this phase** — the gate activates transparently as soon as the `/execute` Skill invocation lands in the transcript. Continue to Phase 0 below.

---

## Phase 0: Context Loading (MANDATORY — before ANYTHING else)

Before reading the plan, before building todos, before writing a single line — load the repo's institutional memory. Agents that skip this step make the same mistakes documented in these files. Activity logs show 40+ instances of agents skipping context loading and repeating known mistakes.

1. **Read `.claude/context/navigation.md`** FIRST (R00 universal rule). Check §A Decision Tree: is the surface my plan touches in §C Exploration Registry? If YES, open the listed findings file(s) — do NOT re-explore what's mapped. Check §B Routing Table for any "I need to..." patterns relevant to my plan (form interaction, save handling, history reading, etc.) and line up the proven helpers before writing code.
2. **Read `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md`** — categorized rules from past sessions. Search for your task type prefix: ALL-* (shared), GEN-* (generator), HLR-* (healer), AUD-* (audit), PLN-* (planner). Each rule has a Resolution column — follow it.
3. **Read `.claude/context/patterns.md`** — Decision tree patterns for recurring situations (spec-fixing start, Radix UI dropdowns, Angular save→tab race, etc.). If your task matches a pattern, follow the tree.
4. **Scan Learned Rules** — path-scoped rules in `.claude/rules/<topic>.md` (auto-load on matching file edits via `paths:` frontmatter); cross-cutting rules in `docs/read_only_docs/LEARNED_RULES.md`; client-specific rules in `clients/${ACTIVE_CLIENT}/CLAUDE.md`. Each has a Trigger condition. If your current task matches ANY trigger, that rule is ACTIVE. Key ones for test work: LR-007 (MCP-verify claims, `inventory.md`), LR-009 (Angular dirty state, `angular.md`), LR-010 (cross-field async, `angular.md`), LR-018 (run-all is truth, `specs.md`), LR-019 (baseline enforcement, `specs.md`), LR-023 (no networkidle, `LEARNED_RULES.md`), LR-024 (clean before RCA, `specs.md`), LR-026 (Angular form dirty defensive, `angular.md`).
5. **If a master plan or parent plan is referenced in the task** — read it FIRST to understand broader context, gap statuses, and what's blocked vs actionable. Never work on a subplan without understanding the master.

**Checkpoint**: Before proceeding to Phase 0.1, you must be able to answer: "Is my target surface in the Exploration Registry? Which §B routing rows apply to my subtasks? What are the 3 most relevant ALL-* rules and 3 most relevant LR-* rules for THIS specific task?" If you can't, re-read the files.

---

## Phase 0.1: Subplan Identity ↔ §2 Cross-Check (ALL-077 structural gate — LR-043)

**Applies to**: every `/execute` invocation that resolves to a plan file in `plans/pending/` or `plans/done/` with a declared bootstrap `Identity:` field. Ad-hoc `/execute "do X"` with no plan file skips this phase (the PreToolUse hook remains as second-line defense).

**Run**: `node scripts/check-subplan-identity.mjs <plan-file-path>`

**Interpret**:
- Exit 0 + `"ok": true` → declared Identity can write every artifact path per §2; proceed to Phase 0.5.
- Exit 0 + `"skipped": true` → plan has no parseable Identity or no Artifacts section; Phase 0.1 is not applicable. Proceed, relying on the PreToolUse hook.
- Exit 1 + violations list → **HALT before TodoWrite**. Emit the violations + 3 options verbatim to chat. Do NOT build TodoWrite. Do NOT auto-switch identity. Do NOT use `override` to plow through — override is one-shot break-glass, not a workflow for a systemic identity-vs-ownership mismatch.
- Exit 2 → infra error (unreadable plan, unknown identity). HALT; escalate.

**Three resolution options** (ALL-077):
- **(a) Reassign subplan Identity** — edit the bootstrap frontmatter to a compatible identity. Preferred when the subplan was misclassified at authoring time.
- **(b) Update §2 + mirror** — edit `docs/read_only_docs/AGENT_SHARED_RULES.md` §2 to grant the declared identity access, then update `scripts/identity-ownership.mjs` OWNERSHIP_ROWS to match, then re-run `node scripts/check-identity-ownership.mjs` to confirm parity. Preferred when the path class legitimately belongs under that identity.
- **(c) Plan clean mid-session identity switch** — split the subplan into two phases: research/design under declared identity, then switch to an identity that owns the artifact paths for the write phase. Follows `feedback_identity_switch_protocol.md`. Preferred when the subplan genuinely spans two identity scopes.

**Why this is HALT, not auto-switch** (per Q4=a, 2026-04-23 Rutvik directive): silent auto-switch destroys the audit trail of *why* the mismatch happened. HALT forces deliberate classification of the mismatch as (a)/(b)/(c) and documents the choice in chat. The SP-AAE-01 incident (2026-04-23) was resolved via path (c); the next similar subplan may warrant (a) or (b) — the agent cannot know without HALTing first.

---

## Phase 0.5: Build Execution Todo List (TodoWrite)

Before any research or code, create a TodoWrite todo list for THIS plan's internal steps. This makes execution trackable and embeds skill references for each sub-task. **Not optional. Every /execute call starts with this.**

### Post-rename harness: `TaskCreate × N` then `TaskList` once (capture trigger)

Anthropic renamed `TodoWrite` → the `TaskCreate` / `TaskUpdate` / `TaskList` triplet. The PostToolUse capture hook matcher is `TodoWrite|TaskList`:

- **`TaskCreate`** carries a single just-created task per call — useless as a capture trigger (it would overwrite state with a 1-item snapshot every call). Calling `TaskCreate` does **not** fire the SP02B capture.
- **`TaskList`** returns the FULL task list in `tool_response`. The hook reads `tool_response` (an array of `{id, subject, status, owner, blockedBy}`) and writes the SP02B state file.

**Mandatory sequence**:

1. Build the task list with `TaskCreate × N` (one call per task; the tag — `[/skill:matchtype]`, `LR-NNN(reason)`, `[manual](reason)`, or `[ceremony]` — MUST be in the `subject` field because `TaskList`'s response has no `activeForm`).
2. Immediately after the last `TaskCreate`, call `TaskList` **once with no arguments**. This is the capture trigger.
3. The PostToolUse hook reads `tool_response`, scans every `subject` for tags, and writes `.claude/state/todo-state-${session_id}.json` with `{count, tagged_count, untagged_indices, tags_per_item}`.
4. The next Edit/Write/NotebookEdit's PreToolUse validator reads that state file. Without the `TaskList` trigger, the file does not exist and the Edit is denied with "Build TodoWrite first per /execute Phase 0.5".

**Legacy `TodoWrite` callers**: still supported. The PostToolUse hook dispatches on `tool_name` and reads `tool_input.todos[]` for TodoWrite (probe = `content + " " + activeForm`). Skip the extra `TaskList` call — TodoWrite's payload already carries the full list.

**Failure mode** (ALL-084 pre-supersede pattern): if `TaskList` is never called and TodoWrite is unavailable, the state file never exists → every Edit is denied. Bash bridge (`cat > .claude/state/todo-state-${session_id}.json << 'EOF' { ... } EOF`) remains as emergency override path, but it is no longer the routine workflow.

### Auto-call `/relevant` (skill + LR + agent-mistakes + patterns injection)

Before manually building the todo list, run `/relevant` to scan available skills, LR rules, agent-mistakes, and patterns against the plan's subtasks (`/relevant` Steps 1, 2.5, 2.6, 2.7). This is **mandatory** — the SP02B hook gate denies edits when todos are untagged, and `/relevant` is the structural source of skill / LR / pattern tags. (The opt-out clause that previously allowed skipping `/relevant` for "simple plans with obvious skills" was removed — every `/execute` runs `/relevant`. Simple plans get a fast `/relevant` pass; complex ones get the full 3-grep injection.)

### Parse the Plan

Read the plan and decompose it into atomic execution items. Each item gets a todo entry with a skill/action tag in brackets.

### Standard Template (SP02B-compliant tag taxonomy — every entry MUST carry ≥1 tag)

Every /execute run creates AT MINIMUM these items. Tags are the 4 types from `.claude/rules/pipeline.md` § "TodoWrite Tagging Contract". Hook gate denies edits when any entry is untagged.

```
[ceremony] Phase 0 context loading — navigation.md, agent-mistakes.md, patterns.md, LR scan
[ceremony] Phase 0.1 subplan identity ↔ §2 cross-check (LR-043 §D)
[/relevant:inform] Pre-execution skill + LR + agent-mistakes + patterns injection
[manual](pre-flight) Verify test data constants exist in live UI via MCP — Phase 1 BLOCKED until all verified
[/regression-guard:wrap] BEFORE snapshot — [list the key files from the plan]
[manual]([Change group 1 description]) — file1.ts, file2.ts          ← OR [/skill:direct] if a skill matches
[LR-NNN(reason)] [Change group 2 description] — file3.ts              ← OR [/skill:wrap] etc per /relevant
... (one per logical change group from the plan, each with ≥1 tag)
[ceremony] Phase 2.5 Adjacent-Sweep ritual (DO-NOW / SPAWN / APPEND with grep verification)
[/regression-guard:wrap] AFTER snapshot + diff review
[/audit:verify] Post-execution audit — verify plan fulfillment, focus on what was NOT done
[/reflect:verify] Capture learnings from this execution
[ceremony] Phase 3.5 plan finalization — Status DONE + Execution Summary + git mv to done/ + npm run plans:reindex + parent-cascade per LR-027
[ceremony] Activity-log row per LR-028 with LR-037 timestamp gate
[ceremony] /final-q exit with v2 evidence-emission per LR-042 + SP00 Fix 2a/2b
```

Legacy bare tags (`[research]`, `[gap-analysis]`, `[implement]`, `[fix]`, `[pre-flight]`) are NOT in the 4-type taxonomy and will be flagged as untagged by the hook. Convert them: `[research]` → `[/relevant:inform]` or `[manual](research)`; `[implement] X` → `[manual](X)` or `[/skill:direct]`; `[pre-flight]` → `[manual](pre-flight)` or `LR-007(verify before code)`. The point is to force the agent to name *which skill / LR / ceremony / manual reason* governs the work.

### Phase 0.5 Ceremony-Dedup Checklist (SP02B — runs BEFORE the cross-reference check)

For each of the 8 ceremony obligations below:
1. **Grep the plan file** for an existing step that covers it (e.g., `grep -i "activity.log\|LR-028" <plan>` for ceremony #6).
2. **If covered** → add `[ceremony]` tag to the existing TodoWrite entry that maps to that plan step (multi-tag is fine — `[/skill:direct] [ceremony]` works).
3. **If NOT covered** → add a new `[ceremony]` todo for it. Do NOT skip — these are structural closure obligations enforced by the hook + by `/final-q` Step 6.

The 8 ceremony obligations:
1. Phase 0 context loading (navigation.md / agent-mistakes.md / patterns.md / LR scan).
2. Phase 0.1 subplan identity ↔ §2 cross-check (LR-043 §D / SP-IDS-04).
3. Phase 0.5 todo build (this skill, this phase — `[ceremony]` tag on the TodoWrite call itself or on its `/relevant` step).
4. Phase 2.5 Adjacent-Sweep ritual (SP00 Fix 1 — DO-NOW / SPAWN / APPEND with grep verification).
5. Phase 3.5 plan finalization (Status DONE + Execution Summary + `git mv` to `done/` + `npm run plans:reindex` + parent-cascade per LR-027).
6. Activity-log row per LR-028 (LR-037 timestamp gate ≥ all touched-file mtimes).
7. `/final-q` exit with v2 evidence-emission per LR-042 + SP00 Fix 2a/2b.
8. **Per-Identity Matrix Closure Audit** (Phase 3.5 sub-step) — for each row in the plan's `## Per-Identity Satisfaction` matrix, verify the Concrete Deliverable resolves (file exists) OR is `(skipped: <reason ≥20 chars>)` OR `(none)`. Vague-prose cells → HALT. This is the audit-time mirror of closure-check C6 (`.claude/rules/plan-closure.md` LR-055). Tagged `[ceremony]`. (Added 2026-05-28, PLAN_DONE_MEANS_DONE Phase 2.4.)

Failure to enumerate any of the 8 = the SP1 / SP0 closure-half-forgotten failure mode this gate was authored to prevent.

### Context Injection Per Item

After building the todo list, inject relevant context INTO each item. From Phase 0's context loading, tag each todo with its active LR rules, relevant agent-mistakes entries, and guardrails. The context travels WITH the task — not in a separate mental model.

Example: `[implement] Fix test data constants — LR-007(verify before code), GEN-034(run don't assume)`

### Plan-Specific Items

Decompose the plan's "Changes" or "Key Files" sections into logical groups. One `[implement]` todo per group. Examples:
- `[implement] Replace view state with activeModal — ChatPage.tsx`
- `[implement] Add modal overlay pattern — PipelineLaunchCard.tsx, ChatApprovalCard.tsx`
- `[implement] Create pages + page_stage_status tables — schema.sql`

### Cross-Reference Check (MANDATORY before leaving Phase 0.5)

After building the todo list, walk through EVERY bullet/numbered item in the plan's Phase sections and verify each has a corresponding todo item. If a plan bullet has no todo → add it. If you believe a plan deliverable should be skipped → flag it to the user and get explicit approval before proceeding. Self-justification for skipping deliverables ("X is more maintainable") is NOT acceptable — the plan is the contract.

### Rules

1. **Every /execute call creates this todo list** — no exceptions, even for small plans
2. **Mark items `in_progress` one at a time** as you work through them
3. **Mark `completed` only when VERIFIED** — not when code is written, but when it's confirmed working
4. **If you discover new items mid-execution**, add them to the todo list before doing them
5. **The todo list survives the entire /execute lifecycle** — from Phase 0.5 through Phase 3
6. **Plan deliverables are non-negotiable** — you can ADD items the plan missed, but you cannot REMOVE or SUBSTITUTE items the plan specified without user approval

## Phase 1: Pre-Execution Research (MANDATORY)

Before writing a single line of code:

1. **Read the plan thoroughly** — every file path, every change, every justification
2. **Research each file the plan mentions** — read the actual current state, not what the plan assumes it looks like
3. **Gap analysis** — actively hunt for what the plan MISSED:
   - Grep for every string/pattern being changed across the ENTIRE codebase (not just files the plan lists)
   - Check imports, tests, configs, docs, types that reference changed code
   - Check for related files the plan didn't consider
   - Look for edge cases: what happens at boundaries? What if state is null/undefined? What about error paths?
4. **Improvement scan** — can any change be done better while staying aligned with the repo's vision and conventions?
   - Fewer lines? Reuse existing utilities? Better naming?
   - But do NOT scope-creep — improvements must be small and obvious
5. **Record findings and update the todo list** — add newly discovered items from gap analysis, remove items no longer relevant. The todo list must reflect reality:
   - Plan items to execute as-is (already in todo from Phase 0.5)
   - Gaps found → add new `[implement]` or `[fix]` todo items
   - Improvements identified → add if small, skip if scope-creep
   - Items to skip → remove from todo with a note WHY

## Phase 2: Execution

**Auto-call `/regression-guard` BEFORE** — snapshot all files the plan will modify.

### Per-phase identity adoption (Layer 2 — PLAN_IDENTITY_ENFORCEMENT)

If the plan declares **per-phase identities** (e.g. a subplan whose phases run `GIVER → BUILDER → AUDIT`), the FIRST action on entering each phase is to invoke `/identity <role>` for that phase's declared identity. This is not bookkeeping — it is the load-bearing adoption step:

- Invoking `/identity <role>` loads that role's agent file (`.claude/agents/<ROLE>.md`) and emits the Step 6.5 Constraint Extract, so the role's HARD STOPs actually govern the phase's work. Staying silently OWNER skips every one of them.
- **Layer 1 enforces this at write-time.** The PreToolUse identity-gate (`.claude/hooks/lib/check-identity-switch.mjs`) DENIES (mode `deny`) / WARNS + records (mode `announce`, per `.claude/identity-gate-config.json`) an OWNER write to a pipeline-role-owned artifact — test-cases, test-plans, field-inventories, field-case-catalogs, `*.spec.ts`, selectors, `REQUIREMENTS.md` — while inside `/execute`. So a GIVER-phase write to test-cases physically requires `/identity GIVER` first; you cannot blast through the phase as OWNER. Override = the LR-043 §A break-glass handshake (`[OVERRIDE-REQUEST] <path>` + user "override approved", one-shot).
- **Phase 0.1 stays the static pre-check** (subplan identity ↔ §2 ownership, run once before TodoWrite). Layer 1 is the *runtime* enforcement Phase 0.1 always lacked: Phase 0.1 verifies the declared identity *can* write the paths; Layer 1 verifies the role is *actually adopted* at the moment of each write.
- Single-identity plans (whole plan runs as one pipeline identity, or as OWNER doing framework work on OWNER-owned paths) need no per-phase switching — adopt once at the start; OWNER framework paths are never gated (LR-043-safe).

1. Work through each item methodically — one at a time
2. Mark each todo as `in_progress` when starting it, then `completed` only when VERIFIED (not just written, but confirmed working)
3. If you discover something unexpected mid-execution, STOP and assess before continuing. On 2nd failure at same fix type → you're guessing, not fixing. Switch to root-cause trace (read evidence, hypothesize, verify) before attempt #3.
4. **Symptom-triggered guardrail — save/submit flow**: if your fix involves clicking a Save/Submit button AND the first click produces "button disabled + no API call + no toast + form reverts on reload", STOP and run the [`patterns.md` §Save/Submit decision tree](../../context/patterns.md) BEFORE your 2nd attempt. Check the DOM for an `[role="alertdialog"]` / `[role="dialog"]` first, then validation state, then server-side failures, THEN — only then — consider event-trust hypotheses. Do NOT rehypothesize (click-trust, CDP events, Next.js server actions) until you've confirmed there's no open dialog, no invalid field, no server-side error, and no trust gate in the live onClick body. The existing `clickSaveAndConfirm` (`local-office-settings.page.ts:138`) / `clickSaveWithDialog` (`base-page.ts:350`) helpers handle the dialog-gated flow unattended — see navigation.md §C registry row and ALL-076.
5. Keep a mental ledger of every decision: what you did, what you chose NOT to do, and why
6. **App bug gate (LR-034)**: If you discover application behavior that contradicts documented requirements during execution, STOP and follow **LR-034 Bug Filing Protocol** before continuing.

**Auto-call `/regression-guard` AFTER** — re-snapshot, diff, review. If SUSPICIOUS or SILENT BREAK items found, investigate before proceeding.

## Phase 2.5: Adjacent-Sweep (MANDATORY — anti-skip-pattern)

After Phase 2 completes, BEFORE Phase 3's retrospective audit, walk back through items noticed during Phase 2 that are:

- **same identity** as currently active (or recently-active in this session), AND
- **same file or same module** as work just completed, AND
- **5–30 min fix**, AND
- **no user input required** (no design call, no missing data, no ambiguous business rule).

For every such item, pick exactly **one** of:

1. **DO-NOW** — execute it before Phase 3 (context is already loaded; cheapest path).
2. **SPAWN** — `mcp__ccd_session__spawn_task` with a self-contained prompt (file paths + acceptance criteria + minimum context to act cold).
3. **APPEND** — edit a **named pending subplan file** to add a grep-verifiable line item describing the work. **Verify with grep before continuing** (`grep -F "<the line you just wrote>" plans/pending/<file>`). If grep returns 0 hits, the append failed; fix it before moving on.

**FORBIDDEN as the disposition for an Adjacent-Sweep item** (closes LR-040 phantom-handoff hatch + the `skipped`-with-no-recipient hatch):

- "flagged for follow-up"
- "out of scope" (bare, with no named recipient)
- "noted in execution summary"
- "outstanding work"
- "HANDOFF FOR NEW SESSION" (without a corresponding (1)/(2)/(3) above)
- any phrasing that names no recipient subplan, BUG-ID, spawned-task-ID, or user-flagged discussion item

Bare "out of scope" with no recipient = **HALT + ask user**. Do not declare Phase 2 complete until every Adjacent-Sweep item has a (1)/(2)/(3) disposition.

**Why this exists**: every prior skip-pattern incident (LR-027 / LR-031 / LR-040 / LR-044 / SP-DQU-03 A1+A2) shared one trait — the agent identified an adjacent fix in real time, then routed it to a prose deferral instead of doing it while context was hot. Phase 2.5 forces the choice **before** the "scope = work I did" mental model crystallizes in Phase 3.

## Phase 3: Post-Execution Audit (MANDATORY)

After ALL changes are made, do NOT declare done. Instead:

0. **Review the todo list first** — are all items `completed`? Any still `pending` that were forgotten? The todo list IS the audit checklist. Any `pending` items = work not done.
1. **Re-read the original plan** — compare every stated change to what you actually did
2. **Re-read the original prompt/intent** — does the execution fulfill the user's actual ask?
3. **Focus on what you DIDN'T do:**
   - Which files did you skip? Why?
   - Which edge cases did you not handle? Why?
   - Which scenarios did you not consider? Why?
   - Are there related components that should have been updated for consistency?
   - **Implementation Defect Scan** (LR-001 through LR-006, body in `.claude/rules/data.md`):
     a. **Wrong params (LR-001)?** Grep every function call to another file — verify signature matches actual definition
     b. **Missing handlers (LR-002)?** Every catalog/config entry has a corresponding implementation?
     c. **Silent errors (LR-003)?** Grep `catch {` and `catch(() =>` in changed files — all must have real handling
     d. **Resource leaks (LR-004)?** Every timer/listener has cleanup?
     e. **Stale closures (LR-005)?** Every useCallback/useEffect dep array is complete?
     f. **Unsafe access (LR-006)?** Every `foo.bar.baz` on external data has validation?
4. **Verify on live preview** if a server is running — never declare "done" from code alone
5. **Report honestly** — tell the user:
   - What was executed
   - What gaps you found and addressed beyond the plan
   - What you intentionally left out and WHY
   - Any risks or follow-up items

### Learning Completion Checklist (after post-audit)
5. Would a senior engineer approve these changes without modifications?
6. Auto-call `/reflect` — capture any learnings from this execution
7. Any unexpected behavior? Write to `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md`
8. New patterns discovered? Write to relevant memory file

## Phase 3.5: Plan Finalization (MANDATORY — enforced by LR-027/LR-028)

After post-execution audit, before declaring done:

1. **Update plan status**: Edit the plan file:
   - Add `**Executed**: YYYY-MM-DD` to header
   - Change `**Status**:` to `DONE`
   - Add `### Execution Summary` section (see LR-027 for required fields)
   - Document EVERY planned TC: implemented, dropped (with reason), or deferred

2. **Closure validation precondition (LR-055, V6)**: Run `node scripts/validate-plan-closure.mjs --plan <file> --enforce --write-manifest`. PASS required before `git mv`. `--write-manifest` is the manifest-emission gate — used ONLY here. C2/C3/C4/C5 fail → remediate, NOT override. The Status flip + manifest write + `git mv` happen in one commit per M4.

3. **Move plan**: `git mv plans/pending/PLAN_XXX.md plans/done/PLAN_XXX.md` (MUST use `git mv`, NOT plain `mv` — preserves git history and stages the rename atomically).

4. **Regenerate INDEX** (LR-035 — `plans/INDEX.md` is auto-generated, never hand-edit): `npm run plans:reindex`

5. **Update activity log**: Append session entry to `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-activity-log.md`
   Format: `| YYYY-MM-DDThh:mm | {agent} | done | {files} | {description} |`
   LR-037 gate: the `When` timestamp MUST be ≥ the latest mtime of every file in `{files}`. Run `npm run validate:activity-log:preflight` if unsure.

6. **Update agent-mistakes.md**: If ANY unexpected behavior was found during execution
   (MCP showed different behavior than plan assumed, selector didn't match, validation
   didn't fire as expected), add a new rule entry.

Skip Phase 3.5 ONLY if the plan was NOT in plans/pending/ (ad-hoc execution without plan).

## Phase 4: `/final-q` — Mandatory Last Action (NON-NEGOTIABLE — LR-042)

After Phase 3.5 (or after Phase 3 for ad-hoc /execute without a plan file), BEFORE emitting any natural-language wrap-up, BEFORE stopping the session, BEFORE any "complete" / "done" / "shipped" phrasing:

1. **Invoke `/final-q` as your final action.** No prose summary first. No "here's what I did" recap. `/final-q` IS the wrap-up — it produces the verdict line the chain orchestrator parses AND reconstructs the todo ledger.

2. **The `/final-q` output MUST end with the heading `## /final-q audit` followed (within ~3000 chars) by a `**Verdict**: GREEN|YELLOW|RED` line.** This is the contract that `chain-orchestrator.sh` + `parse-verdict.mjs` rely on. Prose summaries do NOT satisfy this — a chain-spawned `/execute` that ends with `"**SP-XXX complete.**"` and no /final-q block causes the orchestrator to pause with `verdict-NONE` (observed 2026-04-23 on SP-DQU-06).

3. **Do NOT try to be efficient by skipping /final-q for "obviously green" runs.** The skill self-mandate is the enforcement — there is no longer a Stop hook to force you (both `final-q-gate.sh` and `rubber-stamp-gate.sh` were removed 2026-04-23 for token cost, see LR-042 strand A). A chain-spawned `/execute` without a /final-q verdict block causes the chain orchestrator to pause with `verdict-NONE` and burn everyone's time. Emit it the first time.

4. **Trivial-session exception**: `/final-q` itself has a "trivial 1-task zero-skip" short-path. Use that short-path rather than skipping /final-q entirely.

**Why this phase exists**: chain orchestration gates advance-vs-pause on the /final-q verdict. A missing verdict = chain pauses = user has to manually resume. More broadly: every ending must be auditable. Prose summaries aren't audit artifacts; verdicts are.

## Auto-Calls

- `/regression-guard` — BEFORE execution (Phase 2 start) and AFTER execution (Phase 2 end)
- `/reflect` — AFTER post-execution audit (Phase 3 end)
- `/final-q` — MANDATORY final action (Phase 4). Non-skippable per LR-042.

## Output

- Execution summary: what was done, gaps found and addressed, decisions made
- Regression guard report (before/after diff verdict)
- Learning items captured (if any)

## Rules
- NEVER trust the plan blindly — the plan is a starting point, not gospel
- NEVER skip pre-research — "the plan already checked" is not an excuse
- NEVER declare done without the post-execution audit
- NEVER end a /execute session without invoking `/final-q` (LR-042 — chain orchestrator requires the verdict block; the former `final-q-gate.sh` Stop hook that auto-blocked stops was removed 2026-04-23, so this is now skill-mandate enforcement only)
- Focus on what's MISSING, not what's present — QA mindset
- If the plan is wrong about something, fix it and note the correction


## Verification Artifact (D23)

Before declaring this skill done, emit one runnable / readable check the user (or next session) can re-run to confirm the output:

- File path + expected content (e.g., `plans/pending/X.md exists with **Status**: Pending`)
- Bash command + expected output (e.g., `git diff --stat ...` shows N files)
- Test command (e.g., `npm run typecheck`, `npx tsc --noEmit`)
- Or a structured expected-output template (≤10 lines)

Verification artifact ≠ prose summary. It is a runnable / readable check that confirms the skill's output. Without it, the work is unaudítable. Anthropic cupcake §786-793 — single highest-leverage tactic for AI-built artifacts.
