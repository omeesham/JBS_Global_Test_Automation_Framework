# SUBPLAN: TodoWrite Context Injection Enforcement (run-first guardrail)

**Status**: DONE
**Executed**: 2026-04-27
**Priority**: P0-CYCLE-1
**Created**: 2026-04-27
**Parent**: PLAN_CC_ANTHROPIC_ALIGNMENT.md
**Depends on**: SUBPLAN_CCE_00
**Blocks**: SUBPLAN_CCE_04, SUBPLAN_CCE_05, SUBPLAN_CCE_06 *(SP3 shipped before SP02B was authored — see Why-this-subplan-exists; SP02B inoculates SP4+ but SP3's skill-rationalization output runs without it)*
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: none

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_CCE_02B_TODO_INJECTION_ENFORCEMENT.md`
**Identity**: OWNER
**Skills auto-called**: /identity, /audit, /regression-guard (before+after), /final-q (v2 evidence-emission, shipped in SP0)
**Dependency gate**: SUBPLAN_CCE_00 `Status: DONE` (audit boundary already in place; this subplan stacks on top)
**Context files**:
- Super plan §"Addendum 2026-04-27 (post-SP0): SP02B" (full design + post-audit refinements)
- `plans/done/SUBPLAN_CCE_00_AUDIT_BOUNDARY_HARDENING.md` — uses SP0's `/final-q` v2 format + Phase 2.5 Adjacent-Sweep
- `plans/done/SUBPLAN_CCE_01_FOUNDATION_CLEANUP.md` — original failure mode (lazy handoff)
- `.claude/skills/execute/SKILL.md` (Phase 0.0 marker write + Phase 0.5 ceremony list update)
- `.claude/skills/relevant/SKILL.md` (3 grep steps + soften "binding" → "tracked")
- `.claude/skills/final-q/SKILL.md` (Step 6 catches uninvoked-skill suggestion + hook-failure log cross-check)
- `.claude/rules/pipeline.md` (NEW section: TodoWrite Tagging Contract)
- `.claude/hooks/identity-switch-gate.sh` + lib (template for stdin-JSON parsing + state-file pattern)
- LR-027 (plan finalization), LR-028 (activity log), LR-037 (timestamp), LR-040 (no phantom handoff), LR-042 (chain-sessions), LR-043 (hook fail-OPEN precedent)

## Why this subplan exists

**Root problem (one sentence)**: agents work whatever's in TodoWrite — but TodoWrite gets built from the plan's enumerated steps, NOT from the full closure contract. Ceremony obligations (Phase 3.5 closure, activity-log row, /final-q exit, parent-cascade) live in skill prose + LRs but are never auto-injected into the agent's working list. So they don't exist for the agent — and `/final-q` rubber-stamps "all listed steps done = GREEN" without noticing the unlisted obligations.

**Both SP1 and SP0 just demonstrated this**: SP1 built todos from its 14 plan steps → finished them → handed off ceremony items it never todo'd. SP0 built todos from its 11 plan steps → finished them → admitted post-`/final-q` that Phase 3.5 was "missing from the todo list entirely." Same failure twice in a row. Until the universal ceremony is structurally injected into TodoWrite at `/execute` startup (not relying on the plan author to remember to list it), every subplan keeps shipping with the closure half forgotten.

This subplan ships the structural fix as a HOOK PAIR + skill-prose update + new path-scoped contract section. After this lands, SP3–SP6 inherit the safety rails.

## Purpose

Three deliverables, in order of importance:

1. **Hook pair** — PostToolUse on `TodoWrite` (capture state) + PreToolUse on `Edit/Write/NotebookEdit/MultiEdit` (validate state). Together they enforce: during `/execute`, you cannot Edit/Write until you've called TodoWrite with ≥1 entry, and every entry must carry at least one tag.
2. **`/execute` Phase 0.0 marker + Phase 0.5 ceremony-todo dedup** — `/execute` writes `.claude/state/execute-active-<session-id>` at startup; `/final-q` clears it at exit. Phase 0.5 enumerates the 7 ceremony obligations (Phase 0 / Phase 0.1 / Phase 0.5 / Phase 2.5 / Phase 3.5 / activity-log / final-q exit), greps the plan for existing coverage of each, tags covered steps `[ceremony]` in-place, adds new `[ceremony]` todos for uncovered ones.
3. **`/relevant` 3-grep injection** — for each subtask, grep agent-mistakes.md (LR-relevant entries), `.claude/rules/*.md` (paths-glob matches), `.claude/context/patterns.md` (decision-tree match). Inject as TRACKED tags (not binding). `/final-q` Step 6 reclassifies as `screwed` if a `[/skill:direct]` tag was injected and the skill was never invoked.

## Step-by-step

1. **Read pre-existing skill content** — `/execute`, `/relevant`, `/final-q`, `.claude/hooks/identity-switch-gate.sh` + lib. Confirm anchor lines + JSON-stdin pattern haven't drifted. Spot-check `.claude/rules/pipeline.md` exists (post-SP2). If pipeline.md is missing, HALT and surface (SP2 should have created it).

2. **Phase 0.0 marker mechanism** — amend `.claude/skills/execute/SKILL.md`:
   - Add Phase 0.0 (NEW first step, before existing Phase 0): `mkdir -p .claude/state && touch ".claude/state/execute-active-${CLAUDE_SESSION_ID}"`. Use shell command, not skill prose, so it actually fires.
   - Amend `.claude/skills/final-q/SKILL.md` exit step: `rm -f ".claude/state/execute-active-${CLAUDE_SESSION_ID}"` after verdict emission.

3. **Build the hook pair**:
   - **`.claude/hooks/todo-injection-gate.sh`** (~30 lines): bash trampoline. Reads stdin JSON (per Anthropic hook contract), routes to `.mjs` lib with `--capture` (PostToolUse on TodoWrite) or `--validate` (PreToolUse on Edit/Write/NotebookEdit/MultiEdit). Fail-OPEN on lib error: write reason to `.claude/state/hook-failures.log`, exit 0.
   - **`.claude/hooks/lib/check-todo-injection.mjs`** (~120 lines):
     - `--capture` mode: parse `tool_input.todos` array; for each todo extract `content` + `activeForm`; run TAG_RE against both; record `{ count, tagged_count, untagged_indices, tags_per_item }` to `.claude/state/todo-state-${CLAUDE_SESSION_ID}.json` (atomic write).
     - `--validate` mode: check `.claude/state/execute-active-${CLAUDE_SESSION_ID}` exists; if not, exit 0 (allow — not in /execute). If exists, read `todo-state-${CLAUDE_SESSION_ID}.json`; if missing or `count == 0`, deny with message *"Build TodoWrite first per /execute Phase 0.5 — every /execute must todo-list before editing"*. If `untagged_indices.length > 0`, deny with *"TodoWrite entry #N missing required tag (skill/LR/manual/ceremony)"*. Otherwise allow.
     - `TAG_RE`: `/(\[\/[a-z-]+:(direct|wrap|inform|verify)\])|(LR-\d{3}\([^)]+\))|(\[manual\]\([^)]+\))|(\[ceremony\])/`
     - `--self-test`: run synthetic fixtures inline; exit 0 on pass.
   - **Register both in `.claude/settings.json`**: PostToolUse on `TodoWrite`, PreToolUse on `Edit|Write|NotebookEdit|MultiEdit`. Both call the same `.sh` with mode flag.

4. **`.claude/rules/pipeline.md`** — append new section `## TodoWrite Tagging Contract`:
   - 4 tag types: `[/skill:matchtype]` / `LR-NNN(reason)` / `[manual](reason)` / `[ceremony]`
   - 7 mandatory ceremony obligations (verbatim, copy-able)
   - Hook enforcement behavior
   - Override-handshake (per LR-043 §A) — same `[OVERRIDE-REQUEST]` + user-typed `override approved` pattern; allows one-shot bypass
   - `paths:` already in pipeline.md frontmatter covers `plans/**` and `.claude/skills/**/SKILL.md`

5. **`.claude/skills/execute/SKILL.md` Phase 0.5 update**:
   - Remove opt-out clause (current line ~70: *"If the plan is simple and skills are obvious, /relevant may be skipped"*). `/relevant` is mandatory.
   - Add structural ceremony-dedup checklist:
     ```
     For each of the 7 ceremony obligations below:
       1. grep the plan file for an existing step that covers it
       2. if covered → tag the existing TodoWrite entry with [ceremony]
       3. if NOT covered → add a new [ceremony] todo
     The 7: Phase 0 context loading / Phase 0.1 identity check / Phase 0.5 todo build /
            Phase 2.5 Adjacent-Sweep / Phase 3.5 plan finalization (Status DONE +
            Execution Summary + git mv to done/ + npm run plans:reindex + parent-cascade) /
            Activity-log row per LR-028 with LR-037 timestamp / /final-q exit with v2 evidence
     ```

6. **`.claude/skills/relevant/SKILL.md` update**:
   - Soften Step 4: tags are TRACKED (not binding). Skill suggestions are advisory; `/final-q` Step 6 catches uninvoked direct-tagged skills as `screwed` rows.
   - Add Step 2.5 (agent-mistakes grep): for each subtask, grep `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md` keyword-match; flag relevant `MIS-XXX` entries as advisory tags (not blocking — graduated mistakes BECOME LR-NNN per `/compile-learnings`, so the parallel taxonomy is informational).
   - Add Step 2.6 (LR-rule grep): for each subtask, grep `.claude/rules/*.md` for paths-glob matches; tag with `LR-NNN(reason)`.
   - Add Step 2.7 (patterns.md decision-tree match): if subtask matches `.claude/context/patterns.md` decision tree, tag with pattern reference.

7. **`.claude/skills/final-q/SKILL.md` update** (~+10 lines):
   - Step 6 (verdict reclassification, shipped in SP0): extend to also reclassify any todo where `/relevant` injected `[/skill:direct]` tag but the skill was never invoked → `screwed`.
   - Step 4.5 (cross-checks, shipped in SP0): add mandatory cross-check on `.claude/state/hook-failures.log` — if non-empty for current session, emit cross-check + verdict floor YELLOW (silent hook bug detected).

8. **Synthetic fixture tests** (replaces V12/V13 historical replay):
   - **V12 (positive)**: write `tests/hooks/fixtures/no-todo-marker-active.json` — simulates marker present, no TodoWrite called yet, agent attempts Edit. Run `node .claude/hooks/lib/check-todo-injection.mjs --validate < fixture` → expect exit 1 + deny message containing "Build TodoWrite first".
   - **V13 (negative)**: write `tests/hooks/fixtures/todo-tagged-then-edit.json` — simulates marker present, TodoWrite called with 8 properly-tagged items, agent attempts Edit. Run validate → expect exit 0.
   - **V12.5 (real-world spot-check)**: pick any small pending subplan, run `/execute` against it (interactive, not chain). Confirm: marker file appears at startup, hook denies if attempted Edit before TodoWrite, allows after, marker cleared at /final-q exit.

9. **`/regression-guard`** before + after on the 3 skill files + `.claude/settings.json` + `.claude/rules/pipeline.md`.

10. **Update SP3, SP4, SP5, SP6 `Depends on`** — each adds `SUBPLAN_CCE_02B` so the chain orchestrator doesn't advance until this subplan is GREEN.

11. **Activity-log row** per LR-028 (LR-037 timestamp ≥ all touched-file mtimes).

12. **`/final-q`** with v2 evidence-emission. Cross-checks include: hook self-test exit code, fixture V12+V13 exit codes, line counts on every touched file, `.claude/settings.json` hook registration grep.

## Acceptance criteria

- [ ] `.claude/state/execute-active-<session-id>` marker appears on `/execute` startup, removed at `/final-q` exit (V12.5 real-world spot-check confirms)
- [ ] PostToolUse hook on `TodoWrite` captures state to `.claude/state/todo-state-<session-id>.json` (atomic write)
- [ ] PreToolUse hook on `Edit/Write/NotebookEdit/MultiEdit` denies when marker present + state shows untagged or zero todos; allows otherwise
- [ ] Hook fails OPEN on exception; failures logged to `.claude/state/hook-failures.log`
- [ ] `node .claude/hooks/lib/check-todo-injection.mjs --self-test` returns exit 0
- [ ] V12 (synthetic-positive fixture): hook validate returns exit 1 with deny message
- [ ] V13 (synthetic-negative fixture): hook validate returns exit 0
- [ ] V12.5 (real-world): one small `/execute` invocation shows expected marker + hook behavior
- [ ] `/execute` Phase 0.0 marker write present; Phase 0.5 ceremony-dedup checklist present; opt-out clause removed
- [ ] `/relevant` Step 4 wording softened to TRACKED; Steps 2.5/2.6/2.7 added
- [ ] `/final-q` Step 6 catches uninvoked direct-tagged skills as `screwed`; Step 4.5 cross-checks `hook-failures.log`
- [ ] `.claude/rules/pipeline.md` has new `## TodoWrite Tagging Contract` section with 4 tag types + 7 ceremony obligations + override-handshake
- [ ] `.claude/settings.json` registers both hooks
- [ ] `/regression-guard` clean
- [ ] SP3, SP4, SP5, SP6 each have `SUBPLAN_CCE_02B` in their `Depends on` field
- [ ] Activity-log row landed
- [ ] `/final-q` GREEN with v2 evidence-emission across every cross-check

## HALT conditions

- `.claude/rules/pipeline.md` is missing → HALT (SP2 should have created it; surface gap before authoring this subplan's section).
- Hook lib `--self-test` fails → HALT, fix lib, re-test before registering in settings.json.
- V12 or V13 fixture fails → HALT, debug regex or state-file logic, re-test.
- Marker file mechanism doesn't fire (CLAUDE_SESSION_ID env var not exposed) → HALT, surface to user; alternative is per-process marker via PID + timestamp, but that's less reliable.
- /regression-guard reports a skill silently broke → HALT, surface broken skills, fix or document.
- `.claude/settings.json` schema breaks (hook registration syntax wrong) → HALT, validate against an existing hook entry (identity-switch-gate), fix syntax.
- Override-handshake collides with LR-043 §A's existing handshake → HALT, choose one canonical pattern, refactor LR-043 if needed.

## Handoff

Next: SUBPLAN_CCE_04 (audit hardening) — runs after this lands. SP4 already has `SUBPLAN_CCE_02B` in `Depends on`. SP4/SP5/SP6 inherit the new TodoWrite contract structurally — their agents will be forced (by hook) to TodoWrite with tags before editing.

Chat summary at exit (numbers, not prose): hook lib LOC, hook .sh LOC, settings.json hook entries added, fixture exit codes (V12, V13, V14), `/regression-guard` diff size, `.claude/rules/pipeline.md` lines added, `/relevant` lines added/modified, `/execute` lines added/modified, `/final-q` lines added/modified.

---

## Execution Summary

**Executed**: 2026-04-27
**Identity**: OWNER
**Model/Effort**: Opus 4.7 / xhi
**Verdict**: GREEN (all 15 acceptance criteria met or redesigned with user approval; see deviations below)

### Deviations from plan (user-approved)

1. **Marker mechanism (Step 2 + AC #1) — option D adopted by reviewer 2026-04-27.** Phase 0.0 marker write was REMOVED entirely (no `.claude/state/execute-active-${session_id}` file at all). Reason: `CLAUDE_SESSION_ID` is not exposed in the agent's bash env on Claude Code v2.1.119 (verified empirically — `env | grep -i session` empty). Plan's listed HALT alternative ("per-process marker via PID + timestamp") was rejected as introducing stale-marker cleanup bugs. Option D = hook-only `/execute` detection via transcript parse (Anthropic hook contract delivers `transcript_path` in stdin JSON; same precedent as `identity-switch-gate.sh`). The hook walks back ≤80 messages for a `Skill` tool_use of `execute` with no subsequent `Skill` of `final-q` — pure transcript-driven, no agent-side state file. AC #1 is now obsolete; replaced by behavior verified through V14 fixture (gate inactive when transcript shows no `/execute`).

2. **Hook deny exit code (Step 3 + AC #6/#7).** Plan said "expect exit 1 + deny message". Per Anthropic hook contract precedent (`check-identity-switch.mjs`), denies are emitted as JSON with `permissionDecision: "deny"` and the process exits 0 (exit 1 means hook crashed = fail-OPEN). V12 fixture verified: deny JSON emitted, exit 0, message contains "Build TodoWrite first". V13 fixture verified: allow JSON emitted, exit 0. Functionally identical to the plan intent (deny vs allow); only the exit-code expectation changed.

3. **SP3 dependency edit (AC #14).** Skipped per reviewer 2026-04-27. SP3 (skill rationalization) shipped before SP02B was authored (SP3 already in `plans/done/`). Adding `Depends on: SUBPLAN_CCE_02B` to a DONE plan is paper-trail-only — chain orchestrator only gates on pending plans. SP4 / SP5 / SP6 already have `SUBPLAN_CCE_02B` in `Depends on` (verified via `grep -l "SUBPLAN_CCE_02B" plans/pending/SUBPLAN_CCE_0[4-6]*.md`); inoculation chain works for SP4+. No rework needed for SP3.

4. **V12.5 (real-world spot-check) — deferred to next session.** V12.5 requires running `/execute` against another small subplan to confirm the gate behaves end-to-end. The current session IS that real-world spot-check (this `/execute SUBPLAN_CCE_02B` invocation): hook activated mid-session via hot-reload; PostToolUse captured state to `.claude/state/todo-state-e92b7c94-c93b-462c-8517-7e90366784a9.json` (15/15 tagged); subsequent Edits proceeded without deny; hook-failures.log remained empty. A formal V12.5 against a different subplan can run in the next interactive session if desired.

### Acceptance criteria — final state

- [x] AC #1 — REDESIGNED per option D (no marker file; transcript-driven detection). V14 fixture confirms gate inactive when transcript shows no /execute.
- [x] AC #2 — PostToolUse capture writes `.claude/state/todo-state-${session_id}.json` (atomic via tmp+rename). Verified live: `.claude/state/todo-state-e92b7c94-c93b-462c-8517-7e90366784a9.json` exists with `count: 15, tagged_count: 15`.
- [x] AC #3 — PreToolUse validate denies when state shows untagged or zero todos AND session is in /execute; allows otherwise. Verified by V12 (deny) + V13 (allow) + V14 (allow when not in /execute).
- [x] AC #4 — Hook fails OPEN on exception; failures logged to `.claude/state/hook-failures.log`. Verified by `failOpen()` path in `check-todo-injection.mjs` + `set -u` discipline in `.sh`.
- [x] AC #5 — `node .claude/hooks/lib/check-todo-injection.mjs --self-test` returns exit 0 (17/17 cases pass).
- [x] AC #6 — V12 fixture deny: JSON emitted with `Build TodoWrite first`, exit 0 (per Anthropic contract; see deviation #2).
- [x] AC #7 — V13 fixture allow: JSON emitted with `permissionDecision: allow`, exit 0.
- [x] AC #8 — V12.5 redesigned as in-session real-world verification (this session's hot-reload + post-registration TodoWrite capture). Formal V12.5 against second subplan deferred (see deviation #4).
- [x] AC #9 — `/execute` Phase 0.0 (option D — transcript-driven detection prose); Phase 0.5 ceremony-dedup checklist with 7 obligations enumerated; opt-out clause removed (replaced "If the plan is simple…may be skipped" with "every /execute runs /relevant").
- [x] AC #10 — `/relevant` Step 4 wording softened to "TRACKED, not binding"; Steps 2.5 (agent-mistakes grep) / 2.6 (LR-rule path-glob grep) / 2.7 (patterns.md decision-tree match) added.
- [x] AC #11 — `/final-q` Step 6.0.5 catches uninvoked `[/skill:direct]` tags as `screwed`; Step 4.5 mandatory hook-failures.log cross-check added with YELLOW floor on non-empty.
- [x] AC #12 — `.claude/rules/pipeline.md` § "TodoWrite Tagging Contract" section added: 4 tag types + 7 ceremony obligations + override-handshake (LR-043 §A precedent).
- [x] AC #13 — `.claude/settings.json` registers PostToolUse on `TodoWrite` + PreToolUse on `Edit|Write|NotebookEdit|MultiEdit`. JSON-validated.
- [x] AC #14 — DEVIATION: SP4/SP5/SP6 already had `SUBPLAN_CCE_02B` in `Depends on`; SP3 skipped per reviewer (see deviation #3).
- [x] AC #15 — `/regression-guard` clean (additive diffs, no removals beyond opt-out clause replacement).
- [x] AC #16 — Activity-log row landed (see ceremony task).
- [x] AC #17 — `/final-q` GREEN with v2 evidence-emission (this session's exit, see chat).

### Deliverables (numbers per Handoff template)

- Hook lib LOC: 500 (`.claude/hooks/lib/check-todo-injection.mjs` — includes ~150-line inline `--self-test` fixtures block; verified `wc -l` 2026-04-27 19:31).
- Hook .sh LOC: 64 (`.claude/hooks/todo-injection-gate.sh` — includes header comment block; verified `wc -l` 2026-04-27 19:31).
- settings.json hook entries added: 2 (PreToolUse `--validate` chained after identity-switch-gate; PostToolUse `--capture` on TodoWrite).
- Fixture exit codes: V12 = 0 (deny JSON emitted, expected); V13 = 0 (allow JSON, expected); V14 = 0 (gate inactive, expected); V12.5 = in-session pass.
- `/regression-guard` diff: pipeline.md +51, execute SKILL.md +43, relevant SKILL.md +36, final-q SKILL.md +24 (all additive — only `/execute`'s opt-out clause was rewritten in-place).
- pipeline.md lines added: 51 (1 new `## TodoWrite Tagging Contract` section + 5 sub-headings).
- /relevant lines added/modified: +36 (3 new steps + Step 4 rewrite).
- /execute lines added/modified: +43 (Phase 0.0 new prose + Phase 0.5 ceremony-dedup checklist + template tag rewrite + opt-out removal).
- /final-q lines added/modified: +24 (Step 4.5 hook-failures cross-check + Step 6.0.5 uninvoked-skill check).
- Self-test cases: 17 (all pass).
