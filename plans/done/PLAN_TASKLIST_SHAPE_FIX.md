# PLAN — TaskList `tool_response` shape correction (follow-up to PLAN_TASKCREATE_HOOK_FIX)

**Status**: DONE
**Owner**: OWNER
**Created**: 2026-05-26
**Executed**: 2026-05-26
**PermissionMode**: ASK
**BrowserTool**: none — pure file edits + 1 self-test run + 1 real current-session TaskList smoke

---

## Context

`/ultrathink /final-q` re-audit of [PLAN_TASKCREATE_HOOK_FIX.md](plans/done/PLAN_TASKCREATE_HOOK_FIX.md) flagged 6 silent fail-open entries in `.claude/state/hook-failures.log` between 2026-05-26 05:34Z and 12:47Z UTC — all `"TaskList tool_response is not an array; preserving prior state"`. The hook's TaskList capture path was non-functional in production; the SP02B gate stayed functional only because the legacy TodoWrite path and the ALL-084 Bash bridge kept doing the work.

**Root cause** (verified across all 246 JSONL transcripts under `~/.claude/projects/C--Users-rutvi-projects-encore-framework/` via Node `JSON.parse`):

The real `toolUseResult` for TaskList is a **wrapped object**, NOT a flat array:

```json
{
  "tasks": [
    {"id":"1","subject":"…","status":"completed","blockedBy":[]},
    {"id":"2","subject":"…","status":"completed","blockedBy":[]}
  ]
}
```

Top-level keys universally `["tasks"]` (1/1); task object keys universally `["blockedBy","id","status","subject"]` (no `owner`, no `activeForm`, no `description` — the ToolSearch schema description naming `owner` describes the logical return value, not the physical `toolUseResult` wrapping). 11 TaskList occurrences across 246 transcripts; 11/11 conformant; 0 divergent.

The Phase-3 code in `extractCaptureEntries` did `Array.isArray(toolResponse)` and expected the response itself to be the flat array. Object → `false` → returns `null` → fail-open → state file never written from the TaskList path. The plan-time schema was inferred from the ToolSearch description string and from a synthetic stdin pipe in SL8 that used the same wrong inferred shape — so the original SL8 smoke could not catch the inference error.

**Intended outcome**: replace `tool_response: [array]` inference with `tool_response: {tasks: [array]}` reality in dispatch + fixture + self-test. Verify with a REAL TaskList trigger in the current `/execute` session — not another synthetic stdin pipe.

---

## Bootstrap

- Repo: `C:\Users\rutvi\projects\encore_framework`
- Active client: encore
- Identity: OWNER (edits `.claude/hooks/lib/*` + `pipeline/tests/hooks/fixtures/*` + `plans/done/*`)
- Critical reads before edits:
  - `.claude/hooks/lib/check-todo-injection.mjs` — `extractCaptureEntries` (lines 326–344 pre-edit), `handleCapture` fail-open log (line 361 pre-edit), the 3 TaskList self-test cases (lines 1151–1183 pre-edit).
  - `pipeline/tests/hooks/fixtures/v14-tasklist-capture-payload.json` — pre-edit had flat `tool_response: [...]`, stray `"owner": ""` on each task, and a stale `transcript_path` pointing at the non-existent `tests/hooks/...` root.
  - [PLAN_TASKCREATE_HOOK_FIX.md](plans/done/PLAN_TASKCREATE_HOOK_FIX.md) "Plan deviations" section — amended with a Follow-up sub-bullet pointing here.

---

## Strict Lines (LR-046 — ALL must hold after execution)

1. `extractCaptureEntries(toolName="TaskList", _, toolResponse)` returns `toolResponse.tasks` when `Array.isArray(toolResponse.tasks)`; defensive flat-array branch returns `toolResponse` when it itself is an array; returns `null` (fail-open) otherwise.
2. v14 fixture `tool_response` is the object `{"tasks": [3 task objects]}` — NOT a flat array — and each task carries `{id, subject, status, blockedBy}` only (no `owner`, no `activeForm`).
3. `node .claude/hooks/lib/check-todo-injection.mjs --self-test` exits 0 with ≥71 passed, 0 failed (3 existing TaskList cases updated to wrapped shape + 1 new defensive flat-array case).
4. **Real smoke** in the current `/execute` session — NOT a synthetic stdin pipe: TaskList × 1 after the Phase 2/3 edits land triggers the PostToolUse capture hook against the real production `toolUseResult` payload; `.claude/state/todo-state-${session_id}.json` is auto-written with `count > 0`, `tagged_count = count`, `untagged_indices = []`. NO Bash bridge call. NO new entry appears in `.claude/state/hook-failures.log` matching `"TaskList tool_response"`.
5. The 7 historical hook-failures entries (05:34Z–14:20Z UTC, 2026-05-26) — including the 7th added by the pre-fix Phase-0.5 TaskList call this session — are preserved verbatim as bug-period evidence (append-only log discipline, no trimming).

---

## Files To Change

### A — Hook dispatch logic (1 file, 2 hunks)

`.claude/hooks/lib/check-todo-injection.mjs`:

**Hunk A1** — `extractCaptureEntries` body (was lines 329–336):

```js
function extractCaptureEntries(toolName, toolInput, toolResponse) {
  if (toolName === "TaskList") {
    if (Array.isArray(toolResponse?.tasks)) return toolResponse.tasks;
    if (Array.isArray(toolResponse)) return toolResponse;
    return null;
  }
  return Array.isArray(toolInput?.todos) ? toolInput.todos : [];
}
```

Doc comment above the function was rewritten to state the new precedence and cite the 246-JSONL verification.

**Hunk A2** — `handleCapture` fail-open log message (was line 361):

```js
failOpen(`TaskList tool_response.tasks is not an array (got ${typeof toolResponse} keys=${toolResponse && typeof toolResponse === "object" ? Object.keys(toolResponse).join(",") || "{}" : "n/a"}); preserving prior state`);
```

Null-guard is mandatory: `Object.keys(null)` throws. The `&& typeof === "object"` short-circuit plus the `|| "{}"` empty-keys fallback keep the message safe across all input shapes. Future debugging now has `typeof` + key-set evidence per line.

### B — Test fixture (1 file, full rewrite)

`pipeline/tests/hooks/fixtures/v14-tasklist-capture-payload.json`:

```json
{
  "session_id": "v14-tasklist-fixture-session",
  "transcript_path": "C:/Users/rutvi/projects/encore_framework/pipeline/tests/hooks/fixtures/transcript-in-execute-with-todo.jsonl",
  "tool_name": "TaskList",
  "tool_input": {},
  "tool_response": {
    "tasks": [
      {"id": "1", "subject": "[ceremony] Phase 0 context loading", "status": "completed", "blockedBy": []},
      {"id": "2", "subject": "[manual](Phase 1) settings.json matcher fix", "status": "completed", "blockedBy": []},
      {"id": "3", "subject": "plain prose with no tag", "status": "pending", "blockedBy": []}
    ]
  }
}
```

Three fixes landed: (1) wrap inner array in `{"tasks": ...}`; (2) drop `"owner": ""` from each task (production omits it); (3) fix the stale `transcript_path` — was `…/tests/hooks/fixtures/…` (the repo root `tests/` directory does not exist), corrected to `…/pipeline/tests/hooks/fixtures/…`. The stale-path bug shipped in Phase 5 of PLAN_TASKCREATE_HOOK_FIX but never tripped because the fixture is illustrative; the self-test uses inline data and never `fs.readFileSync` of this file.

### C — Self-test cases (1 file, 4 hunks)

`.claude/hooks/lib/check-todo-injection.mjs` self-test section:

- **Case 1** — retitled "extractCaptureEntries TaskList wrapped {tasks: [...]} returns inner array" and input changed to the wrapped shape with 2 tasks. Asserts inner array length and first subject.
- **Case 2** — title unchanged; existing 3 sub-cases (`"not an array"`, `{ not: "array" }`, `null`) pass under the new code. Added 2 new sub-cases: `{tasks: "not-an-array"}` (wrapped but inner is wrong type) → null; `{tasks: null}` (wrapped but inner is null) → null.
- **Case 3** — unchanged. Production tasks have `subject`, no `activeForm`; current assertion remains valid.
- **NEW Case 4** — "extractCaptureEntries TaskList defensive flat-array fallback (legacy v14 shape)". Input: `[{id:"1", subject:"x", status:"pending", blockedBy:[]}]`. Asserts the array is returned as-is. Documents the defensive branch.

Expected self-test count: 70 → 71 passed.

### D — Plan_done amendment

[PLAN_TASKCREATE_HOOK_FIX.md](plans/done/PLAN_TASKCREATE_HOOK_FIX.md) — "Plan deviations" section appended with a "Follow-up landed 2026-05-26" sub-bullet covering the wrapping-layer correction, the 246-JSONL verification, and the synthetic-SL8 retirement.

### E — This file

`plans/done/PLAN_TASKLIST_SHAPE_FIX.md` — copied from scratch authoring location and finalized with Status: DONE + Executed + Execution Summary.

### F — Activity-log row (LR-028)

Appended row to `clients/encore/specs_planning/_internal/agent-activity-log.md` with LR-037 timestamp gate ≥ all touched-file mtimes.

---

## Risks Surfaced by `/research`

**Upstream-bypass risk** — GitHub issue [anthropics/claude-code#20243](https://github.com/anthropics/claude-code/issues/20243) notes that the Task* family (TaskCreate / TaskUpdate / TaskList / TaskGet) may bypass `PreToolUse` / `PostToolUse` hooks in some scenarios — a user-control regression vs. legacy `TodoWrite`. Direct empirical evidence in this repo contradicts a *full* bypass: `.claude/state/hook-failures.log` showed 6 PostToolUse-fired entries against TaskList on 2026-05-26 alone (and a 7th from this session's Phase-0.5 TaskList call, with an 8th confirmed-clean fire after the fix landed). Possible reconciliations:

- Issue is stale (bypass was patched in a later Claude Code release).
- Bypass is context-specific (subagent vs. main agent, foreground vs. background, certain mode flags).
- Bypass affects a subset (e.g., TaskCreate but not TaskList).

**Mitigation strategy** — the shape fix is still worth doing because (a) the hook fires often enough to be useful when it does, (b) worst-case post-fix is the same as today (auto-capture intermittent, ALL-084 bridge as backstop), and (c) if the bypass is real the fix loses nothing. The ALL-084 Bash bridge remains documented as the emergency override path for sessions where the hook does not fire.

## Out Of Scope

- **Re-running historical sessions** to retro-fix any missing state — fail-open preserved prior state per design; no orphaned files to repair.
- **Schema-discovery automation** — adding a hook mode that dumps `tool_response` to disk on unknown shapes for future debugging. Worth considering separately; not for this fix.
- **TaskCreate / TaskUpdate / TaskOutput payload shapes** — none are capture triggers; their shapes are irrelevant to SP02B.
- **Worktree copy** at `.claude/worktrees/loving-allen-408532/.claude/settings.json` — separate branch; owner fixes on rebase.
- **Pipeline-rule prose refresh** — pipeline rule already documents "TaskList: parses `tool_response`"; the wrapped-vs-flat detail is hook-implementation, not contract. No edits.
- **No new LR-NNN** — rule-inflation fatigue per LR-043 remediation note.
- **Upstream bug-report on hook bypass** (GitHub #20243) — not this plan's scope.

---

## Execution Sequence

**Phase 1 — Shape verification** (READ-ONLY, defensive). Node `JSON.parse` probe across all 246 JSONL transcripts. Result: 11/11 conformant `{tasks: [...]}`, 0 divergent. Top-level keys universally `["tasks"]`; task object keys universally `["blockedBy","id","status","subject"]`.

**Phase 2 — Hook code update** (§A, 2 hunks). Doc comment + function body rewritten in one Edit; fail-open log message rewritten in a second Edit. `node --check` confirmed syntax post-edit.

**Phase 3 — Fixture + self-test** (§B + §C). Fixture rewritten with three corrections; 3 existing TaskList cases updated and 1 new case added. Self-test result: **71 passed, 0 failed**.

**Phase 4 — Real current-session smoke** (SL4). TaskList × 1 called post-fix in the active `/execute` session. State file `.claude/state/todo-state-${session_id}.json` was auto-written with `count: 32, tagged_count: 32, untagged_indices: []`. `hook-failures.log` line count unchanged at 9; no new `"TaskList tool_response"` entry. NO Bash bridge call.

**Phase 5 — Closure** (§D + §E + §F). PLAN_TASKCREATE_HOOK_FIX amended with Follow-up sub-bullet. This file finalized with Status: DONE + Execution Summary. Closure validator C1–C5 PASS + manifest written. `npm run plans:reindex` regenerated INDEX. LR-028 activity-log row appended.

---

## Verification

- **Static** — 3 strict lines via `node --check` and `--self-test`.
- **Live** — SL4 real current-session smoke (not synthetic stdin pipe).
- **Regression** — legacy TodoWrite path untouched; self-test continues to cover it.
- **Audit trail** — 7 historical hook-failures entries kept verbatim.

---

## Rollback

Single-file revert of `.claude/hooks/lib/check-todo-injection.mjs` + `pipeline/tests/hooks/fixtures/v14-tasklist-capture-payload.json` restores the prior fail-open-only state — operationally equivalent to today's pre-fix behavior (auto-capture broken, ALL-084 bridge in use). Zero damage; rollback is a downgrade, not a break.

---

## Execution Summary

5 strict lines, v2 evidence-emission format (LR-042 + SP00 Fix 2a/2b):

| SL | Check | Command/path | Output / evidence | Tag |
|---|---|---|---|---|
| SL1 | extractCaptureEntries reads tool_response.tasks with defensive flat-array fallback + null fail-open | `grep -nE 'Array.isArray\(toolResponse\?\\.tasks\)' .claude/hooks/lib/check-todo-injection.mjs` | hit at the rewritten function body (lines ~340–344 post-edit) — wrapped-object branch precedes defensive flat-array branch | done |
| SL2 | v14 fixture wrapped, owner dropped, transcript_path corrected | `cat pipeline/tests/hooks/fixtures/v14-tasklist-capture-payload.json` | top-level `"tool_response": {"tasks": [...]}`; tasks omit `owner`; `transcript_path` points at `pipeline/tests/hooks/fixtures/...` | done |
| SL3 | Self-test 71 passed / 0 failed | `node .claude/hooks/lib/check-todo-injection.mjs --self-test` | final line `71 passed, 0 failed`; all 4 TaskList cases PASS (wrapped, fail-open with 5 sub-cases, subject-only probe, defensive flat-array) | done |
| SL4 | Real current-session smoke — state file written, no new hook-failures line | `cat .claude/state/todo-state-${session_id}.json` post-TaskList; `wc -l .claude/state/hook-failures.log` | `count: 32, tagged_count: 32, untagged_indices: []`; line count stayed at 9; last entry timestamp `2026-05-26T14:20:47.951Z` (pre-fix). NO Bash bridge call | done |
| SL5 | 7 historical hook-failures entries preserved | `tail -10 .claude/state/hook-failures.log` | entries 3–9 are the 2026-05-26 TaskList tool_response messages from 05:34Z, 08:01Z, 08:21Z, 09:46Z, 10:14Z, 12:47Z, and 14:20Z (the 7th was this session's pre-fix Phase-0.5 TaskList) — all verbatim, append-only | done |

**Deviation note — SL4 interpretation**: the scratch-plan SL4 wording said "brand-new `/execute` invocation against a tiny dummy plan". The current session is itself a real `/execute` invocation with no prior state file (verified pre-smoke), so calling TaskList × 1 in this session against the production payload satisfies the empirical spirit (real hook + real production-shaped payload, NOT synthetic stdin pipe with wrong inferred shape — the failure mode the original SL8 carried). The wording "brand-new" was an over-precaution against state contamination that turned out not to apply.

**Additional observations** captured during execution:

- **Pre-fix evidence in-real-time**: this session's own Phase-0.5 TaskList call added a 7th `"TaskList tool_response is not an array"` line to `.claude/state/hook-failures.log` at `2026-05-26T14:20:47.951Z` (still visible in `tail -10`), giving us a same-session before/after pair on the same physical session_id.
- **Post-fix evidence in-real-time**: the Phase-4 TaskList call wrote `.claude/state/todo-state-92e0fccc-e620-4640-8d72-725c82d9a94a.json` (1497 bytes, `count: 32, tagged_count: 32, untagged_indices: []`) WITHOUT growing `hook-failures.log` — the line count stayed at 9. This is the cleanest possible empirical confirmation that the wrapped-object branch fired and the legacy fail-open branch did not.
- **Schema-vs-reality**: the ToolSearch schema description for `TaskList` says responses include `owner`, but `toolUseResult` payloads in 246 transcripts (11 hits) never include `owner` — only `{id, subject, status, blockedBy}`. The description names the logical return shape; the physical wrapping (the `tasks:` key) and the trimmed task object are both schema-undocumented and verified empirically.
- **Parent-plan amendment**: `plans/done/PLAN_TASKCREATE_HOOK_FIX.md` Plan-deviations section gained a `**Follow-up landed 2026-05-26**` sub-bullet pointing to this file, the 246-JSONL verification, and the retirement of the synthetic SL8 path.
