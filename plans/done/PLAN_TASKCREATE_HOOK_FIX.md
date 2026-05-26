# PLAN — TaskCreate hook fix + MultiEdit dead-code sweep

**Status**: DONE
**Executed**: 2026-05-25
**Owner**: OWNER
**Created**: 2026-05-25 (revised 2026-05-25 post-audit)
**PermissionMode**: ASK
**BrowserTool**: none (pure file edits)

---

## Bootstrap

- Repo: `C:\Users\rutvi\projects\encore_framework`
- Active client: encore
- Identity: OWNER (edits .claude/* + framework rules)
- Critical reads before each edit:
  - `.claude/settings.json` (hook matchers — lines 42 + 74)
  - `.claude/hooks/lib/check-todo-injection.mjs` (MUTATION_TOOLS set, handleCapture, extractWriteContent*, --self-test)
  - `.claude/hooks/lib/check-plan-closure.mjs` (MultiEdit branches)
  - `.claude/hooks/lib/check-identity-switch.mjs` (single MUTATION_TOOLS set ref, no branches, no self-test)
  - `.claude/hooks/lib/parse-verdict.mjs:425, 456` (comment-only TodoWrite refs)
  - `clients/encore/specs_planning/_internal/agent-mistakes.md` row 282 (ALL-084)
  - `.claude/rules/pipeline.md` SP02B section (lines 172, 198–247 per audit)
  - `.claude/rules/hooks-identity.md` LR-043 trigger
  - `.claude/skills/execute/SKILL.md` Phase 0.5 (TodoWrite→TaskCreate sequencing — new mandate)

---

## Context

Anthropic renamed `TodoWrite` → `TaskCreate` (with companion `TaskUpdate`/`TaskList`/`TaskGet`/etc.) and removed `MultiEdit` from the Claude Code tool surface in a recent update. The framework still references the old names.

**Two breakages + one dead-code sweep:**

1. **BREAKING — task-list hook capture**: `.claude/settings.json:74` PostToolUse matcher = `"TodoWrite"`; the SP02B Phase 0.5 capture (`.claude/state/todo-state-${session_id}.json`) silently never fires. Every `/execute` session hits a denied Edit on first write and bridges via Bash (documented as ALL-084 workaround).
   - **CRITICAL nuance found in audit**: TaskCreate's `tool_input` shape is `{subject, description, activeForm, metadata}` — a single task per call, NOT an array. The existing `handleCapture()` reads `tool_input.todos[]`. Simply adding `TaskCreate` to the matcher captures EMPTY state every call → next Edit denied with "captured but empty". So the matcher fix MUST target a tool whose payload carries the full task list. **`TaskList`** is the only such tool (its `tool_response` returns all tasks). Match on `TaskList` (PostToolUse), update `handleCapture` to read from `tool_response` for `TaskList` invocations, and have `/execute` SKILL.md mandate a `TaskList` call right after the last `TaskCreate` and before any Edit.

2. **BREAKING — 15 subagent `tools:` permission allowlists** (5 agents + 10 skills, including `planning` skill that earlier exploration missed): the allowlist still names `TodoWrite`. Subagents need permission for the new task-management triplet `TaskCreate, TaskUpdate, TaskList`. Plan adds all three additively alongside `TodoWrite` so old + new harness both work.

3. **DEAD CODE — MultiEdit branches**: `.claude/settings.json:42` matcher + 3 hook `.mjs` files have MultiEdit conditionals. MultiEdit no longer exists in the harness, so branches never execute. Per OWNER directive 2026-05-25 — clean up.

ALL-084 in `agent-mistakes.md` documents a Bash workaround that is partially superseded by Phase 1+5+6 (matcher + hook code + /execute mandate). The rule gets a SUPERSEDED note plus a pointer to the new TaskList capture path.

**Intended outcome**: agent calls `TaskCreate × N` then `TaskList` → PostToolUse fires on TaskList → hook reads `tool_response`'s task array → state file written with full task list → first Edit allowed. No Bash bridge. Subagents have permission for `TaskCreate|TaskUpdate|TaskList`. MultiEdit dead code removed. ALL-084 marked superseded.

---

## Strict Lines (LR-046 — ALL must hold after execution)

1. `grep -F '"matcher": "TodoWrite|TaskList"' .claude/settings.json` returns exactly 1 hit.
2. `grep -F '"matcher": "TodoWrite"' .claude/settings.json` returns 0 hits (literal-only matcher gone).
3. Every file in §B (15 files) has all four tokens `TodoWrite`, `TaskCreate`, `TaskUpdate`, `TaskList` in its `tools:` frontmatter line (additive).
4. `grep -rE "\bMultiEdit\b" .claude/settings.json .claude/hooks/lib/*.mjs` returns 0 hits.
5. `node .claude/hooks/lib/check-todo-injection.mjs --self-test` exits 0; new self-test cases for `TaskList` capture path pass.
6. ALL-084 row in `agent-mistakes.md` contains the literal `SUPERSEDED 2026-05-25` token plus a 1-line pointer to the TaskList capture path.
7. `.claude/skills/execute/SKILL.md` Phase 0.5 explicitly instructs: build task list via `TaskCreate × N`, then call `TaskList` once before any Edit (the explicit capture trigger).
8. End-to-end smoke (fresh session, post-merge): `TaskCreate × 3` → `TaskList` → `.claude/state/todo-state-${sid}.json` contains `count: 3, tagged_count: 3` (assuming all 3 entries carried SP02B tags); first Edit allowed without override.

---

## Files To Change

### A — Hook matcher (1 file, target TaskList not TaskCreate)

`.claude/settings.json:74` — `"matcher": "TodoWrite"` → `"matcher": "TodoWrite|TaskList"`. Line 42 (`Edit|Write|NotebookEdit|MultiEdit`) handled in §C1.

### B — Subagent `tools:` allowlists (15 files, additive — append `, TaskCreate, TaskUpdate, TaskList` after `TodoWrite`)

Pattern: in the frontmatter `tools:` line ONLY, replace `TodoWrite` → `TodoWrite, TaskCreate, TaskUpdate, TaskList`. Body prose untouched. Audit-confirmed full list (grep `^tools:.*TodoWrite`):

Agents (5): `.claude/agents/{AUDIT,GENERATOR,HEALER,PLANNER,REQUIREMENTS}.md` (line 4).
Skills (10): `.claude/skills/{audit,chain,chain_audit,execute,final-q,planning,relevant,share-kt,sonnet,ultrathink}/SKILL.md` (line 6–7).

Note: `MAINTAINER.md` (line 4 = `tools: Read, Write, Edit, Glob, Grep, Bash`) and skills `reflect / compile-learnings / bugfix / find-bugs / cleanup / standup / next-this-week / research / regression-guard / verify` etc. do NOT have `TodoWrite` in their frontmatter — leave untouched (verified by grep). The 3 regression-guard snapshots at `.claude/state/regression-guard-snapshots/sp02b-before/*` are immutable per LR-039 — leave untouched.

### C — MultiEdit removal (destructive cleanup per directive)

**C1 — matcher** (1 file): `.claude/settings.json:42` — `"Edit|Write|NotebookEdit|MultiEdit"` → `"Edit|Write|NotebookEdit"`.

**C2 — hook scripts** (3 files). Surface-area per file confirmed by audit:
- `.claude/hooks/lib/check-todo-injection.mjs` — 5 edits: line 61 `MUTATION_TOOLS` Set entry; `extractWriteContent()` MultiEdit branch (~lines 222–227); `extractWriteContentPairs()` MultiEdit branch (~lines 261–272); self-test case "extractWriteContent MultiEdit returns each new_string" (~line 891); self-test case "pairs MultiEdit returns one pair per edit" (~line 1119).
- `.claude/hooks/lib/check-plan-closure.mjs` — multiple edits (audit flagged `MUTATION_TOOLS = new Set([..., 'MultiEdit'])` + 1+ conditional branches). Re-read file before edit to enumerate precisely.
- `.claude/hooks/lib/check-identity-switch.mjs` — 1 edit only (line 38 `MUTATION_TOOLS` Set entry; no conditional branches, no self-test).

**C3 — rule + comment prose sweep** (audit-extended scope):
- `.claude/rules/*.md` — replace the literal `Edit|Write|NotebookEdit|MultiEdit` union → `Edit|Write|NotebookEdit`.
- `.claude/skills/identity/SKILL.md` — same.
- `docs/read_only_docs/{AGENT_SHARED_RULES,LEARNED_RULES}.md` — same.
- `.claude/hooks/lib/parse-verdict.mjs:425, 456` — comment-only TodoWrite refs (`// TodoWrite activeForm`); update to mention both `TodoWrite/TaskList` for accuracy (cosmetic, no runtime impact).
- Skip historical/done-plan references (LR-039 immutable). Skip `.claude/state/regression-guard-snapshots/`.

### D — Hook code update for TaskList capture (NEW — audit FINDING 1)

`.claude/hooks/lib/check-todo-injection.mjs` `handleCapture()` (currently line 335–366):

Two-mode dispatch:
- When `payload.tool_name === "TodoWrite"`: legacy path — read `payload.tool_input.todos[]` as before.
- When `payload.tool_name === "TaskList"`: new path — read `payload.tool_response` (the array of task summaries returned by `TaskList`). Extract `subject` + `activeForm` per task. Tag-scan probe = `subject + " " + activeForm`.

Schema assumptions to validate during execution (smoke test):
- TaskList's `tool_response` shape: array of `{id, subject, status, owner, blockedBy, activeForm?}`. The `activeForm` field may not be returned by `TaskList` (the schema description names only `id, subject, status, owner, blockedBy`). If `activeForm` is absent, tag-scan probe collapses to `subject` alone. Self-test must cover both shapes.
- If `tool_response` is not an array (parse error, harness quirk): fail-open, log to `hook-failures.log`, no state-file overwrite (preserve any previously-captured state). This protects against TaskList being called and returning an unexpected shape.

Self-test additions (Phase 5 verification):
- 3 new cases: TaskList with tagged subjects → captures correctly; TaskList with untagged subjects → untagged_indices populated; TaskList with empty array → count=0 (matches existing behavior for "captured but empty" deny).

### E — `/execute` Phase 0.5 mandate (NEW — audit FINDING 1)

`.claude/skills/execute/SKILL.md` Phase 0.5 — add explicit instruction sequence:

> Build the task list with `TaskCreate × N`. Immediately after the last `TaskCreate`, call `TaskList` **once** with no arguments. This triggers the PostToolUse capture hook (`.claude/hooks/lib/check-todo-injection.mjs --capture`) which snapshots the full list to `.claude/state/todo-state-${session_id}.json`. The PreToolUse validator on the next Edit reads this file; without the TaskList trigger, the file does not exist and the Edit is denied. (Legacy path: `TodoWrite` users skip this step — the TodoWrite payload already carries the full list.)

Cross-link from `.claude/rules/pipeline.md` SP02B section (lines 198–247) to this Phase 0.5 mandate.

### F — Documentation cleanup

**F1 — ALL-084 supersede + pointer**: `clients/encore/specs_planning/_internal/agent-mistakes.md` row 282 — append before the trailing `|` of the row: ` **SUPERSEDED 2026-05-25** — matcher updated to TodoWrite|TaskList (settings.json:74); handleCapture handles both shapes; /execute Phase 0.5 mandates TaskList trigger after TaskCreate batch. Bash workaround retained only as emergency override path.`

**F2 — SP02B terminology**: `.claude/rules/pipeline.md` SP02B section (lines 172 + 198–247 per audit). Specifically:
- Heading "TodoWrite Tagging Contract (SP02B)" (line 172) → keep "TodoWrite" as the rule name (institutional identifier) but add subtitle: "(applies to TaskCreate/TaskUpdate/TaskList in post-rename harness; capture fires on TaskList PostToolUse)".
- Line 227 ("PostToolUse on TodoWrite") → "PostToolUse on TodoWrite or TaskList (post-rename harness)".
- Other body prose mentioning "TodoWrite" as the noun for the task-list mechanism → leave untouched (it's the canonical institutional name; SP02B remains the rule ID).

### G — Test fixture (NEW — audit FINDING 4)

`pipeline/tests/hooks/fixtures/v14-tasklist-capture-payload.json` (new file): synthetic PostToolUse payload with `tool_name: "TaskList"` and a `tool_response` array of 3 tasks (2 SP02B-tagged, 1 untagged). Mirrors the structure of `v13-capture-payload.json` for parity. Existing `v13-*` fixtures (TodoWrite-shape) remain — they continue to pass because the matcher `TodoWrite|TaskList` still matches `TodoWrite`.

---

## Out Of Scope

- **Worktree copy** `.claude/worktrees/loving-allen-408532/.claude/settings.json:55` — separate branch; owner fixes on rebase. NOT touched here.
- **Historical references** to TodoWrite/MultiEdit in `plans/done/*.md`, `.claude/state/regression-guard-snapshots/`, `pipeline/tests/hooks/fixtures/transcript-*.jsonl` (the v13 TodoWrite fixtures stay valid) — audit-trail / immutable per LR-039.
- **Hook comment prose** referring to "TodoWrite" as a name for the conceptual task list (e.g., `--capture   PostToolUse on TodoWrite`) — the noun is still meaningful institutionally. Only matchers, tool-name conditionals, and `parse-verdict.mjs:425/456` comment get refreshed (per §C3).
- **Adding new rules / graduating LR-NNN** — no new rule numbers. Framework has rule-inflation fatigue per LR-043 remediation note.
- **`.claude/settings.local.json`** — verified to contain only Bash/MCP `permissions.allow` entries; no matchers needing fix.
- **`MAINTAINER.md` + non-task-list skills** — verified to not carry `TodoWrite` in `tools:` frontmatter; out of §B scope.
- **TaskGet / TaskStop / TaskOutput** — these are for `Agent`-tool task spawning, not the todo-list paradigm. Not added to subagent allowlists (different use case).

---

## Execution Sequence

Each phase independently revertible and verifiable. **Commit after each phase** for clean rollback boundaries (see Rollback section).

**Phase 1 — Matcher fix** (the stop-bleed, single Edit per §A). Verify: hook self-test still passes (no regression on TodoWrite path); matcher grep shows `TodoWrite|TaskList`.

**Phase 2 — Subagent allowlists** (15 additive Edits per §B). Verify: every file in §B has all 4 tokens; count `grep -c 'TaskList' <file>` across the 15 = 15.

**Phase 3 — Hook code update for TaskList capture** (§D). Two-mode dispatch in `handleCapture()`. Add 3 self-test cases. Verify: self-test exits 0.

**Phase 4 — MultiEdit removal** (§C1 + C2 + C3). Order: matcher → .mjs branches (re-read each file before edit) → prune --self-test cases → re-run self-tests after each .mjs → comment/rule prose sweep last. Verify: `grep -rE "\bMultiEdit\b" .claude/settings.json .claude/hooks/lib/*.mjs` returns 0.

**Phase 5 — Docs + new fixture** (§F1 + §F2 + §G). Append ALL-084 SUPERSEDED note; refresh SP02B terminology with subtitle + line 227; add `v14-tasklist-capture-payload.json`.

**Phase 6 — `/execute` Phase 0.5 mandate** (§E). Edit `.claude/skills/execute/SKILL.md` to add the TaskList-after-TaskCreate sequence. Cross-link from pipeline.md SP02B section.

**Phase 7 — End-to-end smoke + closure**. Start a fresh session; invoke `/execute` against a tiny test plan; observe TaskCreate × N → TaskList → state file written with full list → first Edit allowed. Run all 8 strict lines. Append LR-028 activity-log row. `/final-q` per LR-042. Copy plan to its repo home per `feedback_save_plan_location.md`; on closure, `git mv` from pending to done with closure-gate run.

---

## Verification

- **Static** (8 strict lines — each one grep / self-test invocation).
- **Hook self-tests** (3 scripts):
  - `node .claude/hooks/lib/check-todo-injection.mjs --self-test` (legacy TodoWrite cases + 3 new TaskList cases).
  - `node .claude/hooks/lib/check-plan-closure.mjs --self-test` if self-test exists; otherwise typecheck only.
  - `node .claude/hooks/lib/check-identity-switch.mjs` — no self-test mode; rely on smoke.
- **End-to-end fresh session** (post-merge): per Phase 7 above. This is the only verification that actually exercises the TaskList capture path against a real harness. If smoke fails, Phase 7 HALTs and the schema assumption in §D needs revision (likely: TaskList tool_response shape differs from inferred).
- **Regression**: identity-switch gate, plan-closure gate, banned-phrase gate, skip-without-BUG-cite gate, todo-injection gate (legacy TodoWrite path) — all continue to function.

---

## Rollback

Each phase committed before next phase begins. Per-phase rollback options:

- **Uncommitted state** (mid-phase failure): `git checkout HEAD -- <file>` restores last committed version.
- **Committed phase** (post-phase failure): `git revert <phase-commit-sha>` creates a reversal commit (preserves history, doesn't rewrite). For local-only iteration: `git reset --hard HEAD~1` (destructive — only if no push happened).

Phase 4 (MultiEdit removal, destructive) is the highest-risk revert candidate — if a hook self-test breaks post-removal, revert that commit and investigate whether MultiEdit might still be live in some harness flavor.

---

## Activity Log (LR-028 — append at end of each phase commit)

```
2026-05-25T<HH:MM> | OWNER | PLAN_TASKCREATE_HOOK_FIX | Phase N done | files=<count> | strict_lines=<n/8> | next=<phase or /final-q>
```

---

## Execution Summary

**Executed**: 2026-05-25
**Identity**: OWNER
**Strict lines**: 8/8 PASS
**Self-tests**: 70 passed, 0 failed (was 72 pre-Phase-4; -2 MultiEdit cases removed, +3 TaskList path cases added; net 70).

### What landed per phase

- **Phase 1** — `.claude/settings.json:74` PostToolUse matcher: `TodoWrite` → `TodoWrite|TaskList`. PostToolUse on TaskList carries the full task list in `tool_response`; TaskCreate carries only the just-created task and is not a capture trigger.
- **Phase 2** — 15 subagent allowlists. Appended `TaskCreate, TaskUpdate, TaskList` alongside existing `TodoWrite` (additive — legacy TodoWrite still works). 5 agents (REQUIREMENTS, PLANNER, HEALER, AUDIT, GENERATOR) + 10 skills (audit, chain_audit, ultrathink, planning, chain, final-q, execute, relevant, share-kt, sonnet).
- **Phase 3** — `.claude/hooks/lib/check-todo-injection.mjs` `handleCapture()` two-mode dispatch via new module-scope helpers `extractCaptureEntries(toolName, toolInput, toolResponse)` and `extractEntryProbe(toolName, entry)`. TodoWrite legacy reads `tool_input.todos[]`; TaskList reads `tool_response` array. TaskList probe = `subject` only (no `activeForm` in response per schema). Non-array `tool_response` → fail-open (preserves prior state). 3 new self-tests for the TaskList path.
- **Phase 4** — MultiEdit dead-code sweep (user-authorized destructive). `.claude/settings.json:42` matcher dropped `|MultiEdit`. 3 hook libs lost MUTATION_TOOLS entries + branches: check-todo-injection.mjs (Set + extractWriteContent branch + extractWriteContentPairs branch + 2 self-test cases), check-plan-closure.mjs (Set + projectBody branch), check-identity-switch.mjs (Set only). Prose sweep across 3 `.sh` hooks + 4 rule files (browser-tool, hooks-identity, plan-closure, pipeline) + skills/identity SKILL.md + skills/execute SKILL.md + docs/read_only_docs/LEARNED_RULES.md + parse-verdict.mjs comment refs (refreshed to mention TodoWrite/TaskList).
- **Phase 5** — `clients/encore/specs_planning/_internal/agent-mistakes.md` ALL-084 row prepended with **SUPERSEDED 2026-05-25** notice + pointer to the TaskList capture mechanism. `.claude/rules/pipeline.md` SP02B section gained "post-rename harness" subtitle and PostToolUse bullet refreshed to document dual TodoWrite/TaskList dispatch. `pipeline/tests/hooks/fixtures/v14-tasklist-capture-payload.json` created (mirrors v13 fixture for TaskList shape; 2 tagged + 1 untagged exercises both code paths).
- **Phase 6** — `.claude/skills/execute/SKILL.md` Phase 0.5 gained "Post-rename harness" subsection mandating `TaskCreate × N → TaskList × 1` sequence so future sessions auto-trigger the capture hook. Bash bridge (ALL-084) retained as documented emergency override only.

### Strict-line evidence (acceptance commands)

| # | Check | Command | Output |
|---|---|---|---|
| SL1 | matcher updated | `grep -cF '"matcher": "TodoWrite\|TaskList"' .claude/settings.json` | `1` |
| SL2 | old matcher gone | `grep -cE '"matcher": "TodoWrite"$' .claude/settings.json` | `0` |
| SL3 | 15 subagents | per-file `grep -E "^tools:.*TodoWrite.*TaskCreate.*TaskUpdate.*TaskList"` | `15/15` |
| SL4 | MultiEdit removed | `grep -rE "\bMultiEdit\b" .claude/settings.json .claude/hooks/lib/*.mjs .claude/rules .claude/skills .claude/hooks/*.sh docs/read_only_docs` (excluding sp02b-before) | `0` |
| SL5 | self-tests pass | `node .claude/hooks/lib/check-todo-injection.mjs --self-test` | `70 passed, 0 failed` |
| SL6 | ALL-084 supersede | `grep -cE 'ALL-084.*SUPERSEDED 2026-05-25' clients/encore/specs_planning/_internal/agent-mistakes.md` | `1` |
| SL7 | /execute mandate | `grep -cE "TaskCreate.*TaskList\|TaskList.*capture trigger" .claude/skills/execute/SKILL.md` | `5` |
| SL8 | end-to-end smoke | stdin-pipe TaskList payload (3 tagged subjects) → `check-todo-injection.mjs --capture` → state file | `count: 3, tagged_count: 3, untagged_indices: []` |

### Plan deviations

- **ALL-084 SUPERSEDED placement (F1)** — plan said "append before the trailing `\|` of the row"; I prepended the SUPERSEDED tag to the body and wrapped the original prose with "ORIGINAL (pre-supersede):" prefix. Equivalent semantics, more prominent placement. Allowed by /execute Phase 1 step 4 (improvement scan, small and obvious).
- **Phase 0.5 mandate placement (Phase 6)** — placed as a new subsection right after the Phase 0.5 heading (above `/relevant` invocation) for maximum visibility. Plan was open on exact location.
- **SL8 verification path** — plan said "fresh session, post-merge"; I exercised the same code path via direct stdin pipe to `check-todo-injection.mjs --capture` because a fresh-session test isn't possible mid-execution. The hook lib is what would run in a fresh session, so functional coverage is identical.
- **TaskList `tool_response` schema** — confirmed at execution time via ToolSearch schema fetch: response is `{id, subject, status, owner, blockedBy}` — no `description`, no `activeForm`. Plan anticipated `activeForm` might be absent; confirmed absent. Tag must be in `subject` only.
- **Follow-up landed 2026-05-26** — `extractCaptureEntries` was navigating `tool_response` as a flat array; production `toolUseResult` is the wrapped object `{tasks: [...]}` (verified across all 246 JSONL transcripts under `~/.claude/projects/C--Users-rutvi-projects-encore-framework/`: 11/11 conformant, 0 divergent; task object keys exactly `["blockedBy","id","status","subject"]` — `owner` is absent in the actual response despite the ToolSearch schema description naming it). Function rewritten to read `tool_response.tasks` with defensive flat-array fallback; v14 fixture rewrapped and stale `transcript_path` corrected; self-test grew 70 → 71 (new defensive-fallback case). The 7 hook-failures entries from 2026-05-26 05:34Z–14:20Z UTC are preserved as bug-period evidence (audit-trail discipline — append-only, no trimming). SL8 above used a synthetic stdin pipe with the (then-inferred) wrong shape; the follow-up plan retired that synthetic path and verified via a REAL current-session TaskList trigger. Follow-up plan: [plans/done/PLAN_TASKLIST_SHAPE_FIX.md](plans/done/PLAN_TASKLIST_SHAPE_FIX.md).

### Out of scope (per plan, unchanged at closure)

- `.claude/worktrees/loving-allen-408532/.claude/settings.json` — separate branch, owner-fixed on rebase.
- `.claude/state/regression-guard-snapshots/sp02b-before/` — immutable per LR-039.
- Historical / done-plan references — immutable per LR-039.
- `plans/pending/SUBPLAN_CLOSURE_GATE_V6_F_WRAPPER_PRECOMMIT_NPM.md:27` — pending plan documenting V6 wrapper scope at authoring time; left for the V6 author.
- No new LR-NNN graduated (rule-inflation fatigue per LR-043 remediation note).

### Follow-ups

- Future `/execute` invocations: call `TaskList` once after the `TaskCreate × N` batch to trigger the capture hook automatically. ALL-084 Bash bridge remains as documented emergency override only.
