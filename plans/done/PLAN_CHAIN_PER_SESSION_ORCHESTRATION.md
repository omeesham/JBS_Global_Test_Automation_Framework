# PLAN: /chain Per-Session Orchestration with Stop-Hook /final-q Gating

**Status**: DONE
**Executed**: 2026-04-23 (landed) / 2026-07-16 (closure paperwork)
**Priority**: P0-CYCLE-1
**Created**: 2026-04-22
**Parent**: (root — framework infra)
**Depends on**: none
**Blocks**: any future autonomous chain run (current `/chain` is single-session and burns context)
**Skills**: `/planning` (authoring), `/review` (post-draft), `/execute` (implementation), `/final-q` (exit)
**Identity**: OWNER

---

## 🛑 MANDATORY PHASE 0 — AUDIT EVERY WORD BEFORE EXECUTING

**This plan is ~3+ days old. Reality may have drifted. Your FIRST action is NOT execution — it is audit.**

Before touching any file described below, do this (max thinking, ultra-deep dive):

1. **Read every word of this plan end-to-end.** No skimming.
2. **For every claim in this plan, verify against current repo state**: grep for the files, functions, rules, hooks, scripts, paths, line numbers named here. If a line number is wrong, a file has moved, or a mechanism was already graduated — flag it BEFORE proceeding.
3. **Check `.claude/hooks/`, `.claude/state/chain-sessions/`, `scripts/chain-*.sh`, `scripts/chain-*.mjs`** — parts of this plan may already be implemented. Do not re-do what exists.
4. **Check sibling plans**: `PLAN_AGENT_AUTHORING_EFFICIENCY.md`, `PLAN_DELIVERABLE_QUALITY_UPGRADE.md`, `godsplan.md`, any SP-AAE-* / SP-DQU-* that touch the chain or /final-q or Stop hooks. If another plan is building the same orchestration logic, STOP and ask the user which to keep. We do NOT want two parallel chain orchestrators.
5. **Check LR-041 (model/thinking/permission-mode frontmatter), LR-042 (chain artifact discipline), LR-043 (identity discipline via hooks)** — these already encode parts of what this plan wants. Do not re-author them here.
6. **Slop-prevention gate**: before writing any new hook, grep `.claude/hooks/` for it. Before writing any new script, grep `scripts/` for it. Before adding any rule, grep `agent-mistakes.md` + `AGENT_SHARED_RULES.md` + root `CLAUDE.md` for the substance.

**Output of Phase 0**: a short audit note (in chat, not a file) listing:
- Claims verified ✓
- Claims found stale / wrong / drifted
- Overlaps with existing hooks / scripts / rules / other plans
- Recommendation: proceed as written | proceed with deltas | halt and replan

Only after the user acknowledges the audit note may you begin execution. No drift. No duplicate work. No two agents fixing one thing.

---

## Context

The current `/chain` skill (`.claude/skills/chain/SKILL.md`) runs every plan in a **single session** with 7 phases per plan and a 3-layer "context compaction" between plans. In practice the model carries forward residue (assumptions, momentum, half-loaded mental state) that the compaction protocol cannot fully clear. With 21 master plans + 77 subplans pending, a single-session chain is guaranteed to either context-overflow or rubber-stamp later plans.

User wants:

1. **Each subplan = its own session** (true fresh context, not "cleared" context).
2. **Session end → Stop hook fires `/final-q` verification** of that subplan's completeness.
3. **GREEN verdict → auto-spawn next subplan in fresh background session.** No human in the loop.
4. **YELLOW/RED verdict OR HALT condition → pause chain.** Wait until user comes back, helps unblock, then resumes.
5. **Branch stays constant.** No random Claude-managed branches; no worktrees. Chain runs on the branch the user kicked it from.
6. **Per-session model + thinking + permission-mode are configurable.** Subplan can request `claude-opus-4-8 --thinking high --permission-mode acceptEdits`, etc.
7. **Daily/weekly caps** to prevent burning subscription limits or shipping a day's worth of work in one autonomous burst:
   - First `/chain` invocation per day: cap = **10 subplans**.
   - Each subsequent `/chain resume` (after user acknowledges day-cap or pause): cap = **5 subplans**.
   - Weekly budget = **50 subplans** (configurable via state).
   - Hook refuses to advance past cap; chain enters `paused-cap-reached`.

Existing infra to extend (not replace):

- `.claude/hooks/final-q-gate.sh` (Stop hook that blocks session-end if completion phrases appear without `/final-q`) — keep as-is. New `chain-orchestrator.sh` runs **after** it.
- `/final-q` skill output format (`**Verdict**: GREEN|YELLOW|RED`) is parseable by grep.
- `.claude/settings.json` `hooks.Stop` array supports multiple hooks — append, don't replace.
- `plans/INDEX.md` is the authoritative execution-order source (LR-035: never hand-edit; always `npm run plans:reindex`).
- `plans/pending/SUBPLAN_*.md` files all carry SESSION BOOTSTRAP blocks — spawned sessions invoke `/execute <filename>` and self-bootstrap.

---

## Locked decisions (do not re-litigate)

| ID | Decision | Rationale |
|---|---|---|
| D1 | Per-subplan sessions spawned via `nohup claude -p "/execute $SUBPLAN" --permission-mode acceptEdits ... > .claude/state/chain-sessions/$SUBPLAN.log 2>&1 &` (background). | Truly fresh context. `mcp__scheduled-tasks__create_scheduled_task` is delay-based (overkill for event-driven advance). Foreground spawn would tie up user's terminal. |
| D2 | First subplan in `/chain` invocation runs in a NEWLY-SPAWNED background session (NOT the current conversation). Current conversation prints status + PIDs + log paths and exits. | Decouples chain orchestration from user's interactive session. User can keep using their conversation while chain runs autonomously in background. |
| D3 | Stop hook is the only orchestration trigger. No polling, no daemon. | Event-driven; no idle CPU; matches existing `/final-q` gate model. |
| D4 | Chain state lives at `.claude/state/chain.json` (gitignored). One active chain at a time per repo. Concurrent invocations refuse with "chain already running". | One source of truth. Prevents two background chains racing on the same plans. |
| D5 | Hook reads `/final-q` verdict by grepping the just-finished session's transcript (last ~400 lines) for `\*\*Verdict\*\*: (GREEN\|YELLOW\|RED)`. Falls back to RED if no verdict found. | Zero IPC required. Same approach as final-q-gate.sh transcript scanning. |
| D6 | Daily cap = **10**. Resume cap = **5**. Weekly budget = **50**. Hardcoded into `chain-orchestrator.sh` (configurable via env vars `CHAIN_DAILY_CAP`, `CHAIN_RESUME_CAP`, `CHAIN_WEEKLY_BUDGET` for power users). | User directive 2026-04-22. Protect Claude subscription and prevent overwork mismatch with end-day reporting cadence. |
| D7 | Per-subplan config (model, thinking, permission-mode) read from **REQUIRED** frontmatter fields on every subplan: `**Model**:`, `**Thinking**:`, `**PermissionMode**:`. Defaults applied only if missing AND subplan is grandfathered (existing files): Sonnet → `hi`; Opus → `xhi`; permission-mode `auto`. NEW subplans created by `/planning` MUST declare all three explicitly (validated by Step 6 of `/planning` SKILL — see D18). The CLI flag for thinking is **`--effort`** (verified via `claude --help` 2026-04-22; valid CLI values: `low|medium|high|max`). The CLI flag for permission-mode is **`--permission-mode`** (valid choices: `acceptEdits|bypassPermissions|default|dontAsk|plan|auto` — verified). | Subplans already carry `**Identity**` and `**Skills**`. Model/thinking elevated to first-class. Stored in the subplan = self-documenting; no central config table to drift. Defaults are deliberately on the high side per D17. `auto` permission-mode lets the agent decide ask-vs-proceed (matches user's "auto mode to avoid intervention" directive 2026-04-22). |
| D8 | Branch guard: chain state records `branch` at start. Hook re-checks `git rev-parse --abbrev-ref HEAD` before every spawn. If drifted, chain enters `paused-branch-drift`. | User directive: "no random Claude branches in spawned sessions". Belt-and-suspenders: we never `git checkout`, AND we verify nobody else did. |
| D9 | Subplan allowlist guard: hook only spawns subplans that were in the **original queue snapshot** (recorded in `chain.json.queue[]` at `/chain` start). New plans added to `plans/pending/` mid-chain are NOT auto-picked-up. | Prevents drift into unintended work. New plans require a fresh `/chain` invocation. |
| D10 | `STOP marker file` (`.claude/state/chain.STOP`) is the panic-kill. Hook checks for it before every spawn; if present, chain enters `aborted` and the file is deleted. | User can `touch .claude/state/chain.STOP` from any terminal to kill the chain immediately, even mid-spawn. |
| D11 | `/chain` skill gets sub-commands: `/chain` (start), `/chain resume`, `/chain status`, `/chain stop`, `/chain reset`. Same SKILL.md, dispatched on first arg. | Single skill, single mental model. Matches `/sonnet on` / `/sonnet off` pattern. |
| D12 | Activity log row appended **per subplan** by the spawned session (it runs `/execute` which already does this per LR-028 + LR-037). Chain orchestrator does NOT write to activity log itself. | Don't double-log. Source of truth = the session that did the work. |
| D13 | Hook never invokes `claude` for `/final-q` itself — relies on the spawned session having run `/final-q` before stopping (enforced by existing `final-q-gate.sh`). If a session stops without `/final-q`, `final-q-gate.sh` already blocks; chain-orchestrator sees no verdict and pauses. | No nested `claude` calls from inside hooks. Stays simple, stays fast. |
| D14 | Daily counter resets at **local midnight** (system timezone). Weekly counter resets **Monday 00:00 local**. Tracked in `chain.json.budget`. | Match user's natural day/week rhythm. Local time = whatever the machine clock says. |
| D15 | When chain pauses (any reason), it prints a one-screen status block to `.claude/state/chain-sessions/PAUSE_NOTICE.md` (overwritten each pause). User runs `/chain status` or `/chain resume` next session to see + act. | User won't be in the conversation when a pause happens. File-based notice is the only reliable channel. |
| D16 | YELLOW/RED verdict pause requires a deliberate user action — either `/chain skip` (mark current as `skipped`, stays paused, user must `/chain resume` to actually fire next) OR `/chain reset` + new `/chain` after fixing the underlying cause. No silent skip. | YELLOW/RED is the model saying "I'm not sure I delivered." Auto-advance past that = rubber-stamping = user's primary anti-pattern. |
| D17 | **Conservative model + thinking selection (universal rule).** **Per-model effort tiers (from `claude --help` + Claude Code docs `code.claude.com/docs/en/model-config`, verified 2026-04-23):** Opus 4.7 supports **5 levels**: `low, medium, high, xhigh, max`. Sonnet 4.6 supports **3 effective levels**: `low, medium, high` (CLI also accepts `max` but it silently clamps to `high` on Sonnet, so we treat Sonnet as 3-tier to avoid wishful-thinking authoring). Haiku does not support effort at all. **Silent-clamp behavior**: passing an unsupported level (e.g., `--effort xhigh` on Sonnet) clamps DOWN to highest supported level — no error. Internal authoring scale matches CLI 1:1: `lo=low`, `mid=medium`, `hi=high`, `xhi=xhigh`, `max=max`. **Sonnet** allowed: `mid` (mechanical work only — INDEX regen, file moves, tag rollouts) or `hi` (general default). **Sonnet `lo` and `max` are FORBIDDEN** (lo = under-thinking; max is a clamped no-op). **Opus** allowed: `hi` (low-complexity Opus), `xhi` (default — most Opus work), or `max` (RCA, exit audits, multi-rule judgment). **Opus `lo` and `mid` are FORBIDDEN** (if a task is small enough for Opus mid, promote it to Sonnet hi instead). Rationale per user 2026-04-22: "always better to burn budget of tokens via better models and think than save it and have trouble later debugging." | Eliminates under-thinking on judgment-heavy tasks. Tier counts are evidence-based (docs + CLI probe). Sonnet's 3-tier ceiling is a deliberate authoring contract, not a model limitation — keeps the rubric honest. |
| D18 | `/planning` skill SKILL.md Step 6 is amended: every new subplan MUST declare `**Model**:` and `**Thinking**:` in its frontmatter, with values from the D17 scale. The bootstrap block template is updated to include lookup of these fields. The `/planning` skill validation pass adds a new checklist item: "Model + Thinking selected per D17 rubric — no Sonnet `lo`, no Opus `lo`/`mid`. If Sonnet `mid`, the subplan body justifies why the task is mechanical." | Without this, new subplans drift back to "default medium" and the orchestrator can't enforce conservative defaults. The rule lives at authoring time, not runtime. |
| D19 | Model + Thinking Selection Rubric (D17 lookup table — see new §Model + Thinking Selection Rubric below) is the canonical authoring guide. Embedded in `/planning` SKILL.md, referenced from `CLAUDE.md` LR section as a new framework rule (LR-041 — proposed; final number assigned at execution time per LR-020). | Centralizes the rubric so it survives re-reads of stale plans. |
| D20 | **Stop-hook firing in `claude -p` mode is a Phase-0 spike, not an assumption.** Before any orchestrator code is written, Step 0 of execution is: spawn `nohup claude -p "echo hello"` redirected to a temp spike log, observe whether `final-q-gate.sh` fires (instrument it temporarily to write a heartbeat file in the state dir), confirm or refute. If hooks DON'T fire in `-p`, fall back to one of: (a) `claude` interactive with `--permission-mode auto` + a session-end signal in the prompt, (b) `mcp__scheduled-tasks__create_scheduled_task` with 0 delay as the spawn primitive, (c) PowerShell `Start-Job` wrapping interactive `claude`. | Evidence-driven design — no orchestration code lands until the trigger mechanism is verified. |
| D21 | **Per-batch counter `executedThisBatch` + `batchCap` added to state schema.** `executedThisBatch` resets to 0 on every `/chain` and `/chain resume`. `batchCap` set to `dailyCap` (10) on `/chain` start, `resumeCap` (5) on every `/chain resume`. Cap check is `executedThisBatch < batchCap` AND `executedToday < dailyCap` AND `executedThisWeek < weeklyBudget` (all three must pass). | Without per-batch tracking, the resume cap is unenforceable after a daily-cap pause. |
| D22 | **State writes are flock-protected.** Every read-modify-write of `chain.json` wraps in `flock .claude/state/chain.lock`. Lock file added to `.gitignore`. `flock` is available in Git Bash via util-linux package; if unavailable on a given Windows install, fallback is mkdir-based atomic locking (`mkdir .claude/state/chain.lock.d` returns nonzero if exists). | Two hooks can fire near-simultaneously (e.g., user's interactive session ends while a background subplan also ends); without locking, one update is lost. |
| D23 | **Verdict regex anchored on `## /final-q audit` heading.** Parse: find LAST occurrence of `^## /final-q audit` in the transcript, then within the next 30 lines look for `^\*\*Verdict\*\*:[[:space:]]*(GREEN\|YELLOW\|RED)\b`. Take that match. If no `## /final-q audit` heading exists in transcript, treat as `NONE` → pause with reason `verdict-missing`. | Eliminates false positives from chat text mentioning "verdict" or stale earlier verdicts. Authority is the audit block, not free-form mentions. |
| D24 | **Day/week counters incremented at SPAWN time (not completion time).** A subplan spawned at 23:59 Sunday counts toward Sunday's daily total and that week's weekly total, even if it completes at 00:01 Monday. | Removes ambiguity at boundaries; matches "what we committed to do today" semantics. |
| D25 | **Precondition before chain ever runs: verify `/execute` SKILL.md performs `git mv` (not `mv`) + `npm run plans:reindex` + activity-log row.** Evidence as of 2026-04-22: `/execute` SKILL.md line 173 uses a plain `mv` for the pending→done plan move (not `git mv`) and contains zero references to `plans:reindex`. This is a **pre-existing gap in `/execute`** that violates LR-035 (INDEX auto-regen). Chain orchestration depends on `/execute` doing its closure work; therefore Step 0b of execution is to patch `/execute` SKILL.md before any chain code lands. | Verified by grep on 2026-04-22 — see Bash output in /review trail. Don't fix this in `/chain` — fix it in `/execute` where it belongs. |
| D26 | **`acceptEdits` and `auto` permission-modes do NOT bypass destructive operations.** `acceptEdits` auto-confirms file edits; destructive ops (rm -rf, git push --force, dropping DB tables) still require explicit confirmation per CLAUDE.md "Executing actions with care". A subplan that wants `bypassPermissions` MUST declare `**RiskAcknowledged**: true` in its frontmatter; orchestrator refuses to spawn `bypassPermissions` without this field. | Belt-and-suspenders: permission-mode is the harness gate; RiskAcknowledged is the chain-layer gate. Both must agree before destructive autonomy is granted. |
| D27 | **`.gitignore` additions extended.** Final list: `.claude/state/*.json`, `.claude/state/*.log`, `.claude/state/*.lock`, `.claude/state/chain.STOP`, `.claude/state/chain-sessions/`, `.claude/state/chain-archive/` (preserve `.claude/state/.gitkeep`). | Covers all runtime artifacts including the new lock file (D22) and archive dir (D11). |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  USER invokes /chain in interactive session                          │
│    → /chain skill builds queue from plans/INDEX.md + plans/pending/  │
│    → writes .claude/state/chain.json (queue, branch, caps, status)   │
│    → spawns FIRST subplan as background session, prints PIDs, exits  │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│  BACKGROUND session N                                                │
│    claude -p "/execute SUBPLAN_X.md" --model M --thinking T          │
│    → loads identity, skills (per subplan bootstrap)                  │
│    → executes Step-by-Step                                           │
│    → runs /final-q at end (Verdict: GREEN/YELLOW/RED)                │
│    → session ends                                                    │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                       Stop hook chain fires:
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│  HOOK 1: final-q-gate.sh (existing)                                  │
│    → if completion claim made without /final-q → block stop          │
│    → else exit 0                                                     │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│  HOOK 2: chain-orchestrator.sh (NEW)                                 │
│    → read .claude/state/chain.json                                   │
│    → if no active chain → exit 0 (no-op)                             │
│    → grep transcript for **Verdict**: GREEN|YELLOW|RED               │
│    → check guards: branch, allowlist, daily cap, weekly budget,      │
│      STOP marker, /final-q ran                                       │
│    → on GREEN + all guards pass:                                     │
│         - update chain.json (mark done, increment counters)          │
│         - if more subplans + cap not hit:                            │
│             nohup claude -p "/execute SUBPLAN_NEXT.md"               │
│               --model M --thinking T                                 │
│               --permission-mode P                                    │
│               > chain-sessions/SUBPLAN_NEXT.log 2>&1 &               │
│         - else: write PAUSE_NOTICE.md, set status                    │
│    → on YELLOW/RED OR guard failure:                                 │
│         - update chain.json (status=paused, pauseReason=...)         │
│         - write PAUSE_NOTICE.md with diagnostic                      │
│         - do NOT spawn next                                          │
│    → exit 0                                                          │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                       (loops via spawned sessions until pause/done)
```

---

## State schema: `.claude/state/chain.json`

```jsonc
{
  "schemaVersion": 1,
  "chainId": "chain-2026-04-22T14-30-00",
  "createdAt": "2026-04-22T14:30:00-04:00",
  "updatedAt": "2026-04-22T15:42:11-04:00",
  "branch": "client_deliverable",                  // captured at /chain start; guard
  "status": "running",                              // running | paused | done | aborted
  "pauseReason": null,                              // populated when status=paused
  "currentIndex": 3,                                // index into queue[]
  "queue": [
    {
      "file": "SUBPLAN_DQU_01_A1_PREP_AND_INDEX_BLOCK.md",
      "deps": [],
      "wave": 1,
      "model": "claude-sonnet-4-6",
      "effort": "high",                            // CLI value (low|medium|high|xhigh|max)
      "permissionMode": "acceptEdits",
      "status": "completed",                        // pending | running | completed | failed | skipped
      "verdict": "GREEN",
      "sessionLog": ".claude/state/chain-sessions/SUBPLAN_DQU_01_A1_PREP_AND_INDEX_BLOCK.log",
      "pid": 12345,
      "startedAt": "2026-04-22T14:30:01-04:00",
      "endedAt":   "2026-04-22T14:38:22-04:00"
    },
    { "file": "SUBPLAN_DQU_02_B1_LOS_NEUTRAL_EYE_AUDIT.md", /* ... */ }
  ],
  "budget": {
    "dailyCap":      10,                            // first /chain start → 10
    "resumeCap":      5,                            // each /chain resume → 5
    "weeklyBudget":  50,
    "executedToday":  3,                            // resets at local midnight
    "executedThisWeek": 9,                          // resets Monday 00:00 local
    "dayResetAt":   "2026-04-23T00:00:00-04:00",
    "weekResetAt":  "2026-04-27T00:00:00-04:00",
    "lastInvocationKind": "start"                   // start | resume → controls cap selection
  },
  "history": [
    // append-only audit trail of all spawns + verdicts
    { "subplan": "...", "spawnedAt": "...", "verdict": "GREEN", "endedAt": "...", "log": "..." }
  ]
}
```

Files alongside in `.claude/state/`:

- `chain-sessions/<SUBPLAN>.log` — stdout/stderr from each spawned session (gitignored).
- `.claude/state/chain-sessions/PAUSE_NOTICE.md` — overwritten on every pause; what user sees on next `/chain status`.
- `chain.STOP` — panic kill marker; presence aborts chain on next hook fire; auto-deleted after abort.

---

## Files to create/modify

### NEW

| Path | Purpose |
|---|---|
| `.claude/state/.gitkeep` | Directory marker (only file tracked in `.claude/state/`). |
| `.claude/hooks/chain-orchestrator.sh` | Stop hook that reads chain.json, parses /final-q verdict, applies guards, spawns next or pauses. |
| `.claude/hooks/chain-pause-notice.sh` | **(D28)** SessionStart hook — on interactive `claude` open, if `chain.json.status=paused`, prints PAUSE_NOTICE.md + reminder of `/chain status` / `/chain resume`. Silent if no chain or status≠paused. |
| `.claude/hooks/lib/chain-state.sh` | Bash helpers: `read_state`, `write_state`, `update_field` (jq-based; jq is already a repo dep — verify in Step 0 of execution). |
| `.claude/hooks/lib/chain-guards.sh` | Bash helpers: `check_branch`, `check_cap`, `check_allowlist`, `check_stop_marker`, `parse_verdict`. |
| `.claude/skills/chain/SKILL.md` | **REWRITE** — new orchestration model. Sub-commands: start (default), resume, status, stop, skip, reset. |

### MODIFIED

| Path | Change |
|---|---|
| `.claude/settings.json` | Append `bash .claude/hooks/chain-orchestrator.sh` to `hooks.Stop[0].hooks[]` (after final-q-gate.sh). Add new `hooks.SessionStart[0]` entry: `bash .claude/hooks/chain-pause-notice.sh` (D28). Add both hook commands to `permissions.allow`. |
| `.gitignore` | Add `.claude/state/*.json`, `.claude/state/*.log`, `.claude/state/*.lock`, `.claude/state/chain.STOP`, `.claude/state/chain-sessions/`, `.claude/state/chain-archive/` (preserve `.claude/state/.gitkeep`). |
| `.claude/skills/INDEX.md` | Update `/chain` row: triggers add `chain status`, `chain resume`, `chain stop`, `chain skip`. Mark as DIRECT-or-RESUME. |
| `.claude/skills/final-q/SKILL.md` | Add note in Integration section: "When invoked inside a `/chain` background session, the `**Verdict**:` line in the `## /final-q audit` block is parsed by `chain-orchestrator.sh` (per D23 regex) to decide whether to advance. The LAST `## /final-q audit` block in transcript is authoritative." |
| `.claude/skills/planning/SKILL.md` | **Step 6 amendment** (per D18): every new subplan MUST declare `**Model**:` / `**Thinking**:` / `**PermissionMode**:` frontmatter, validated against the §Model + Thinking Selection Rubric (D17). Add Step 3 checklist item: "Model + Thinking selected per D17 — no Sonnet `lo`/`max`, no Opus `lo`/`mid`. Sonnet `mid` and Opus `max` require one-sentence justification in subplan body." Update bootstrap-block template to read these fields. |
| `.claude/skills/execute/SKILL.md` | **Pre-chain precondition fix (per D25, evidence: line 173 today says `mv` not `git mv`; zero `plans:reindex` references — verified by grep 2026-04-22).** Phase 3.5 step 2: change `mv` → `git mv`. Phase 3.5 add step 2.5: `npm run plans:reindex`. This patches a pre-existing LR-035 violation; it is a chain prerequisite, not a chain feature. |
| `CLAUDE.md` | Update `/chain` auto-routing entry: triggers add "chain status", "chain resume", "chain stop", "chain skip". Update Skill Dependency Graph: `/chain` no longer auto-calls `/regression-guard` etc. directly — those are called per-subplan by `/execute`. Add **LR-041** (proposed) — "Conservative model + thinking selection per D17 rubric. Reference: PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md §Model + Thinking Selection Rubric." Final LR number assigned at execution time per LR-020. |
| `.claude/context/navigation.md` | Add "Chain orchestration" entry to §B Routing Table. Reference `.claude/state/chain.json` schema. Add §C Exploration Registry entry pointing to this plan as the authoritative chain design doc. |

**Total: 6 new + 8 modified = 14 files.** Growth from v1 (11): +chain-pause-notice.sh (D28), +`/execute` precondition fix (D25), +`/planning` skill amendment (D18). Net new orchestration code = 6 files; additional 3 modifications are framework rules / pre-existing-bug fixes that chain depends on. User flagged 10-file plans as scope-review trigger — flagged here for explicit acknowledgement.

---

## /chain skill rewrite — sub-command dispatch

### `/chain [N]` — START (optional positional `N` = trial limit)

**Invocation forms:**
- `/chain` — uses default `dailyCap` (10)
- `/chain 2` — overrides `batchCap` for THIS batch to 2 (trial run); does NOT change `dailyCap` of 10 going forward (so subsequent resume still defaults to `resumeCap` = 5)
- `/chain N` where N is any integer 1..10 — overrides `batchCap` for this batch only

1. **Identity gate** → OWNER (auto-call `/identity`).
2. **Concurrency check** — if `.claude/state/chain.json` exists with `status=running`, refuse: "Chain already active. Use `/chain status` or `/chain stop` first."
3. **Parse trial limit**: if first arg is an integer 1..10 → set `batchCap` to that value; else `batchCap = dailyCap` (10). Reject N > 10 with "Trial limit cannot exceed dailyCap=10. Use env `CHAIN_DAILY_CAP` to lift the ceiling."
4. **Build queue**:
   - Read `plans/INDEX.md` Execution Queue table.
   - For each row, read the plan file, extract `Depends on` field, optional `Model` / `Thinking` / `PermissionMode` fields.
   - Topologically sort into waves (existing logic from current SKILL.md Phase 0).
   - Filter to subplans that have all deps DONE OR are themselves in the queue ahead of dependents.
   - Take the first **batchCap** subplans (from step 3).
4. **Snapshot branch**: `git rev-parse --abbrev-ref HEAD`.
5. **Write `chain.json`** with `status=running`, `currentIndex=0`, queue[], budget defaults.
6. **Spawn first subplan**:
   ```bash
   nohup claude -p "/execute ${queue[0].file}" \
     --model "${queue[0].model}" \
     --effort "${queue[0].effort}" \
     --permission-mode "${queue[0].permissionMode}" \
     > ".claude/state/chain-sessions/${queue[0].file}.log" 2>&1 &
   echo $! > ".claude/state/chain-sessions/${queue[0].file}.pid"
   ```
7. **Print status to user** (current conversation):
   ```
   Chain started.
   Queued: 7 subplans (capped at dailyCap=10)
   First subplan: SUBPLAN_DQU_02_B1_LOS_NEUTRAL_EYE_AUDIT.md (PID 12345)
   Log:    .claude/state/chain-sessions/<SUBPLAN>.log (gitignored runtime artifact, per D27)
   Status: tail -f .claude/state/chain-sessions/*.log
   Stop:   touch .claude/state/chain.STOP
   ```
8. **Exit current conversation cleanly.** Chain runs in background.

### `/chain resume [N]`

1. Identity gate → OWNER.
2. Read `chain.json`. Refuse if `status` is `running` or `done`.
3. Parse optional positional N (1..5): `batchCap = N` for this batch; default `batchCap = resumeCap` (5). Reject N > 5 with "Resume batch cannot exceed resumeCap=5. Override via env `CHAIN_RESUME_CAP`."
4. Reset `lastInvocationKind=resume`, `executedThisBatch=0`. Take next `batchCap` subplans from where queue left off (`currentIndex`).
5. Re-snapshot branch (HALT if drifted from recorded `branch`).
6. Set `status=running`. Spawn next subplan. Print + exit (same as start).

### `/chain status`

1. Read `chain.json`.
2. Print summary table: each subplan row with status, verdict, PID, log path.
3. If `status=paused`, print contents of `.claude/state/chain-sessions/PAUSE_NOTICE.md`.
4. Print budget: `executedToday / dailyCap (or resumeCap)`, `executedThisWeek / weeklyBudget`, next reset times.
5. No state changes.

### `/chain stop`

1. Read `chain.json`.
2. `touch .claude/state/chain.STOP` (orchestrator picks this up next hook fire).
3. For any `status=running` subplan with a live PID, print kill instructions (don't auto-kill — user decision).
4. Set `chain.json.status=aborted`.

### `/chain reset`

1. Refuse if `status=running` (must `/chain stop` first).
2. Archive `chain.json` to `.claude/state/chain-archive/chain-<chainId>.json`.
3. Delete current `chain.json`. Clear `chain-sessions/` (keep `.gitkeep`).

---

## chain-orchestrator.sh — Stop hook logic (pseudo-code)

```bash
#!/usr/bin/env bash
# chain-orchestrator.sh — Stop hook that advances chain after /final-q verdict.
# Runs AFTER final-q-gate.sh (which guarantees /final-q was invoked).
# Emits no JSON (doesn't block stop); side-effects only (state update + spawn).

set -u
. .claude/hooks/lib/chain-state.sh
. .claude/hooks/lib/chain-guards.sh

input=$(cat 2>/dev/null || true)

# 1. Skip if recursive
printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true' && exit 0

# 2. Read state — bail if no active chain
[ -f .claude/state/chain.json ] || exit 0
status=$(read_state '.status')
[ "$status" = "running" ] || exit 0

# 3. Extract transcript path
transcript=$(printf '%s' "$input" | sed -n 's/.*"transcript_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)
[ -f "$transcript" ] || { pause_chain "transcript-not-found"; exit 0; }

# 4. Parse /final-q verdict (last ~400 lines)
verdict=$(parse_verdict "$transcript")  # GREEN | YELLOW | RED | NONE

# 5. Identify which subplan this session ran (from chain.json.queue[currentIndex])
current_file=$(read_state '.queue[.currentIndex].file')

# 6. Mark current subplan in state
case "$verdict" in
  GREEN)
    update_field ".queue[.currentIndex].status" '"completed"'
    update_field ".queue[.currentIndex].verdict" '"GREEN"'
    update_field ".queue[.currentIndex].endedAt" "\"$(date -Iseconds)\""
    update_field ".budget.executedToday" "$(($(read_state '.budget.executedToday') + 1))"
    update_field ".budget.executedThisWeek" "$(($(read_state '.budget.executedThisWeek') + 1))"
    ;;
  YELLOW|RED|NONE)
    update_field ".queue[.currentIndex].status" '"failed"'
    update_field ".queue[.currentIndex].verdict" "\"$verdict\""
    pause_chain "verdict-${verdict,,}: $current_file"
    exit 0
    ;;
esac

# 7. Guard cascade — any guard failure → pause
check_stop_marker     || { pause_chain "STOP marker"; exit 0; }
check_branch          || { pause_chain "branch drift"; exit 0; }
check_cap "daily"     || { pause_chain "daily-cap-reached"; exit 0; }
check_cap "weekly"    || { pause_chain "weekly-budget-reached"; exit 0; }

# 8. Advance index. If past end of queue → done.
new_index=$(($(read_state '.currentIndex') + 1))
queue_len=$(read_state '.queue | length')
if [ "$new_index" -ge "$queue_len" ]; then
  update_field ".status" '"done"'
  write_completion_notice
  exit 0
fi
update_field ".currentIndex" "$new_index"

# 9. Spawn next subplan
next_file=$(read_state ".queue[$new_index].file")
next_model=$(read_state ".queue[$new_index].model")
next_effort=$(read_state ".queue[$new_index].effort")
next_perm=$(read_state ".queue[$new_index].permissionMode")
mkdir -p .claude/state/chain-sessions
nohup claude -p "/execute $next_file" \
  --model "$next_model" \
  --effort "$next_effort" \
  --permission-mode "$next_perm" \
  > ".claude/state/chain-sessions/${next_file}.log" 2>&1 &
echo $! > ".claude/state/chain-sessions/${next_file}.pid"
update_field ".queue[$new_index].status" '"running"'
update_field ".queue[$new_index].pid" "$!"
update_field ".queue[$new_index].startedAt" "\"$(date -Iseconds)\""

exit 0
```

Helper sketches:

- `read_state '.path'` → `jq -r '.path' .claude/state/chain.json`
- `update_field '.path' value` → atomic via `jq … > tmp && mv tmp .claude/state/chain.json`
- `parse_verdict $transcript` → `tail -n 400 "$transcript" | grep -oE '\*\*Verdict\*\*:[[:space:]]*(GREEN|YELLOW|RED)' | tail -n 1 | awk '{print $NF}'` (defaults to NONE)
- `check_branch` → compare `git rev-parse --abbrev-ref HEAD` against `.branch`
- `check_cap daily` → `[ "$(read_state .budget.executedToday)" -lt "$(read_state .budget.dailyCap)" ]` (also resets counter if past `dayResetAt`)
- `check_stop_marker` → `[ ! -f .claude/state/chain.STOP ]`; on hit, also `rm` it after pausing
- `pause_chain "$reason"` → set status=paused, pauseReason=$reason, write PAUSE_NOTICE.md

---

## Model + Thinking Selection Rubric (D17/D19 canonical guide)

Authoring matrix — every new subplan picks ONE row:

| Authoring tag | Model | CLI `--effort` | When to pick |
|---|---|---|---|
| **Sonnet mid** | claude-sonnet-4-6 | medium | Pure mechanical work: file moves, INDEX regeneration, tag rollouts across many rows, tmp cleanup, find-replace renames where pattern is unambiguous. Subplan body MUST justify why no judgment is required. |
| **Sonnet hi** | claude-sonnet-4-6 | high | General Sonnet default. Spec writing from a clear plan, page-object scaffolding, deterministic MD edits with multiple sections, code refactors with tests as guardrail, schema fills (LR-034 bug JSONs), mechanical hook wiring. |
| **Opus hi** | claude-opus-4-8 | high | Low-complexity Opus tasks: scope-check audits where most items are likely "covered by another SP", short audits with narrow surface, ordering/prioritization without exploration. |
| **Opus xhi** | claude-opus-4-8 | xhigh | **Default for Opus work.** Chrome Claude / MCP / live-DOM exploration, neutral-eye audits, code-quality judgment (`/simplify`), cross-identity coordination, client-visible deliverables, requirements sampling-verification, design work. |
| **Opus max** | claude-opus-4-8 | max | RCA, full-suite intermittents debugging, exit audits / closure gates / LR-040 enforcement across many subplans, pre/post slate-clear API design (LR-026 Angular dirty-state subtleties). Reserved for top-tier judgment. |

**Forbidden combinations:**
- Sonnet `low` — under-thinks; promote to `medium` or use `high`.
- Sonnet `max` — silently clamps to `high` per docs; use `high` and document intent.
- Opus `low` / `medium` — wasteful model+effort mismatch; if `medium` is enough, the task is Sonnet `high`.

**Validation gate (dual-enforced: `/planning` Step 3 `[GATE]` + `/chain` queue-build PRESENT-value validator):**
- Every new subplan declares `**Model**:`, `**Thinking**:`, `**PermissionMode**:` in frontmatter. Missing = HALT (authored) / default-apply conservative tier (grandfathered).
- Forbidden PRESENT values HARD-REJECT: Sonnet `lo`/`low`/`max`, Opus `lo`/`low`/`mid`/`medium`. `/planning` HALTs before Step 4; `/chain` pauses queue-build.
- Sonnet `mid`/`medium` requires structural `**Justification**:` frontmatter line (e.g., `**Justification**: Mechanical — applies fixed regex to N files, no semantic decisions.`).
- Opus `max` requires structural `**Justification**:` frontmatter line (e.g., `**Justification**: RCA across 11 specs requires LR-018+024+033 chain reasoning.`).
- `bypassPermissions` requires `**RiskAcknowledged**: true` frontmatter line (D26; orchestrator-enforced).
- Tier vocabulary: authoring form (`lo`/`mid`/`hi`/`xhi`/`max`) and CLI form (`low`/`medium`/`high`/`xhigh`/`max`) are both parseable and treated as the same tier.

**Worked example — DQU 35-subplan distribution (user-supplied 2026-04-23, treated as the canonical example for the rubric):**

| SP | Title (short) | Model | Thinking | Why |
|---|---|---|---|---|
| 01 | Prep + INDEX block + cleanup | Sonnet | mid | Trivial file ops, INDEX regen, tmp delete |
| 02 | LOS neutral-eye audit (Chrome) | Opus | hi | Adaptive DOM exploration + network RCA + bug classification |
| 03 | LOS fixes + re-export + 3 BUG-*.json | Sonnet | mid | Deterministic MD edits + LR-034 schema fill |
| 04 | LI neutral-eye audit (Chrome) | Opus | xhi | Biggest module, 8 v1 gaps + 3 known APP-bug candidates, highest defect density |
| 05 | LI fixes + re-export + LI bugs | Sonnet | hi | More volume than SP-03; still deterministic |
| 06 | Converter rename `Specific Field` → `Tags` | Sonnet | mid | TypeScript refactor, tests guard |
| 07 | Rules doc v2 (Rules 5 + 6) | Sonnet | mid | Text editing + grep-gate extension |
| 08 | Tag rollout LOS + LI + re-export | Sonnet | mid | Mechanical per-row tag application (NOTE: user table said `lo` — promoted to `mid` per D17 forbidden-Sonnet-low rule) |
| 09 | REQUIREMENTS.md sampling-verification | Opus | hi | Live DOM judgment + iterate-until-clean loop |
| 10 | QA best-practices benchmark | Opus | hi | Research synthesis + gap analysis |
| 11 | Remaining-modules planner | Opus | mid (BUMP to hi per D17) | Forbidden Opus mid → bumped to **Opus hi** |
| 12 | Pricing audit | Opus | hi | Complex validation rules, client-visible |
| 13 | Legal audit | Opus | mid (BUMP to hi per D17) | Forbidden Opus mid → bumped to **Opus hi** |
| 14 | Currency audit | Opus | mid (BUMP to hi per D17) | Forbidden Opus mid → bumped to **Opus hi** |
| 15 | Notes audit | Opus | mid (BUMP to hi per D17) | Forbidden Opus mid → bumped to **Opus hi** |
| 16 | Account & Address audit | Opus | hi | Client-visible, money-adjacent |
| 17 | Shared Setup audit | Opus | hi | Largest RT gap, needs discovery |
| 18 | Auto Add-On audit | Opus | mid (BUMP to hi per D17) | Forbidden Opus mid → bumped to **Opus hi** |
| 19 | ECT standalone audit | Opus | lo (BUMP to hi per D17) | Forbidden Opus low → bumped to **Opus hi** |
| 20 | Mgmt History audit | Opus | hi | BUG-HIS-CDWNA-001 filing + known-leaks sweep |
| 21 | Leftover-state audit (spec static analysis) | Opus | hi | State-matrix categorization judgment |
| 22 | Pre-test slate-clear design + utility | Opus | xhi | LR-026 Angular dirty-state is subtle; API shape matters |
| 23 | Post-test slate-clear design + utility | Opus | xhi | Same as SP-22 mirror; Angular + LR-026 |
| 24 | Slate-clear rollout to 11 specs | Sonnet | hi | Mechanical hook wiring per spec |
| 25 | Full-suite clean run + RCA intermittents | Opus | max | LR-018 + LR-024 + LR-033 + LR-026 full stack, RCA judgment |
| 26 | /simplify+/cleanup scope whitelist | Sonnet | mid | File enumeration + sanity-check |
| 27 | /simplify sweep on whitelist | Opus | hi | Per-file code-quality judgment; user's "simple but best" bar |
| 28 | /cleanup sweep on whitelist | Sonnet | hi | Grep-driven deletions, tests as guardrail |
| 29 | Identity ripple sync (7 agents) | Opus | hi | Cross-identity coordination + ownership judgment |
| 30 | Allure report deliverable | Sonnet | mid | Script + package, user-gate on rm |
| 31 | Bug reports client packaging | Sonnet | hi | Translate internal → client-readable prose |
| 32 | /today skill | Sonnet | mid | Template + vocabulary discipline |
| 33 | /nextweek skill | Sonnet | mid | Template + 5-day forward window |
| 34 | Client handoff package + README | Sonnet | hi | Assembly + cold-readable README |
| 35 | Exit audit (/audit + /final-q + LR-040) | Opus | max | Closure gate on 34 subplans + 8-ask diff + HIST resumption |

**Distribution after D17 normalization** (user's original `lo`/`mid` Opus entries promoted to `hi`):
- Opus max: 2 · Opus xhi: 3 · Opus hi: 16 · Sonnet hi: 5 · Sonnet mid: 9 · Total: 35.

The DQU subplans themselves are NOT in scope of THIS plan — they're flagged here only as the canonical worked example for the rubric. Updating those 35 subplan files to declare `**Model**:` / `**Thinking**:` frontmatter is a downstream task (track in a separate SP under PLAN_DELIVERABLE_QUALITY_UPGRADE).

---

## Per-subplan config — frontmatter additions

Subplans MUST declare (for new subplans authored after this plan lands):

```markdown
**Model**: claude-opus-4-8        # claude-opus-4-8 | claude-sonnet-4-6 (Haiku not used for chain)
**Thinking**: xhi                 # Sonnet: mid | hi   ;   Opus: hi | xhi | max
**PermissionMode**: auto          # auto (default — classifier) | acceptEdits | bypassPermissions+RiskAcknowledged
```

If absent (grandfathered files only) → orchestrator applies defaults: Sonnet → `hi`; Opus → `xhi`; permission-mode `auto`. New subplans missing these fields fail `/planning` Step 3 validation (per D18).

Mapping to CLI when spawning:
- `--model claude-opus-4-8` (or `claude-sonnet-4-6`)
- `--effort low|medium|high|xhigh|max` (mapped from authoring scale per D17 — `xhi → xhigh`)
- `--permission-mode auto|acceptEdits|bypassPermissions`

---

## Caps + safety summary

| Guard | Trigger | Result |
|---|---|---|
| `dailyCap` (10 on start, 5 on resume) | hook tries to spawn 11th (or 6th on resume) subplan in same day | pause `daily-cap-reached`; PAUSE_NOTICE explains "user must `/chain resume` to continue (next batch capped at 5)" |
| `weeklyBudget` (50) | hook tries to spawn 51st subplan in same Mon-Sun week | pause `weekly-budget-reached`; resumes only after Monday rollover OR user manually edits `chain.json.budget.executedThisWeek` |
| `STOP marker` | user `touch .claude/state/chain.STOP` | abort immediately; no further spawns |
| `branch drift` | `git rev-parse` ≠ recorded branch | pause `branch-drift`; user investigates (likely chain ran while user changed branches) |
| `subplan allowlist` | hook would spawn a file not in `chain.json.queue[]` | impossible by construction (orchestrator only iterates queue), but defensive check rejects + pauses |
| `verdict ≠ GREEN` | `/final-q` returned YELLOW/RED OR no verdict at all | pause with verdict in pauseReason |
| `final-q-gate.sh` (existing) | session tried to stop without running `/final-q` | blocks stop; spawned session keeps going until `/final-q` runs (then orchestrator hook fires next) |
| Concurrency | second `/chain` invoked while one running | refuse with "chain already active" |
| Resume on `running` | `/chain resume` while status is `running` | refuse with "chain not paused" |

---

## Verification (how to test end-to-end)

**Phase 0 spike (BLOCKS all other implementation per D20)**:

0a. **Stop hook fires in `claude -p` mode?** Instrument `final-q-gate.sh` to write a heartbeat timestamp file in the state dir on every invocation. Run `nohup claude -p "say hello"` redirected to a temp spike log. Wait for the log to populate. Check the heartbeat file. PASS = file exists with timestamp ≥ spike start. FAIL = redesign spawn primitive (D20 fallback options).

0b. **`/execute` precondition met?** Grep `.claude/skills/execute/SKILL.md` for `git mv` AND `plans:reindex`. PASS = both present. FAIL = patch per D25 before any chain code lands.

0c. **`flock` available in this Git Bash?** Run `flock --version`. PASS = util-linux flock present. FAIL = use mkdir-based atomic locking per D22 fallback.

0d. **`--effort` per-model levels behave as documented?** Spike Sonnet with `--effort xhigh` (should clamp to high), Opus 4.7 with `--effort xhigh` (should be honored). Verify via behavior, not just exit code.

After implementation (only proceed past this point if 0a-0d all PASS):

1. **Unit-level (no real chain)**:
   - `bash .claude/hooks/chain-orchestrator.sh` fed a stop-hook-input fixture with no `chain.json` → exits 0, no side effects.
   - Same with `chain.json` status=paused → exits 0, no spawn.
   - Same with status=running + transcript containing `**Verdict**: GREEN` → updates state, mock-spawns (replace `nohup claude` with `echo`).

2. **One-subplan smoke**:
   - Create a trivial `SUBPLAN_CHAIN_TEST_001.md` that just appends a line to a tmp file and exits with /final-q GREEN.
   - `/chain` → background session fires → log appears → state updates to done → no further spawn (queue had 1).

3. **Two-subplan happy path**:
   - Two trivial subplans. Second depends on first.
   - `/chain` → first spawns → completes GREEN → orchestrator spawns second → completes GREEN → status=done.
   - Verify: both log files exist, both subplans moved to `plans/done/`, INDEX.md regenerated, activity log has 2 rows (one per `/execute`).

4. **YELLOW/RED pause**:
   - Subplan that intentionally outputs `**Verdict**: YELLOW`.
   - Chain pauses after first subplan. PAUSE_NOTICE.md describes verdict.
   - `/chain status` shows paused state.
   - `/chain resume` advances past the YELLOW (user-acknowledged) — wait, NO: resume should NOT skip a YELLOW automatically. Resume applies to caps + manual unblocks; YELLOW/RED requires user to either fix the underlying issue or `/chain skip` (NOT in scope for v1; user manually edits queue if they want to skip).
   - **Decision (D16)**: v1 has no `/chain skip`. YELLOW/RED pause requires user to either fix and re-run via `/chain reset` + new `/chain`, OR hand-edit `chain.json` to mark the offender `skipped` and `/chain resume`.

5. **Daily cap pause**:
   - Set `CHAIN_DAILY_CAP=2` env. Queue 5 subplans. After 2 GREEN, chain pauses `daily-cap-reached`. `/chain resume` adds 5 more (resumeCap), but at most until queue empty.

6. **Branch drift pause**:
   - Start chain on branch A. From another terminal, `git checkout B` in the same repo.
   - Next subplan finishes → orchestrator detects drift → pauses.

7. **STOP marker**:
   - During a multi-subplan run, `touch .claude/state/chain.STOP` from another terminal.
   - Next subplan finishes → orchestrator sees marker → aborts; subsequent subplans never spawn.

8. **`/chain status`**:
   - Run mid-chain; verify table format and budget display.

9. **Activity log + reindex (LR-035, LR-037)**:
   - After 3 subplans complete, verify each `/execute` ran `npm run plans:reindex` and appended its own activity-log row with wall-clock timestamps. Orchestrator hook itself wrote nothing to activity log.

10. **Real chain dry-run** (final acceptance):
    - Pick 3 small pending subplans (e.g., SP-DQU-01, SP-DQU-02, SP-DQU-03).
    - `/chain`. Walk away for ~30 min. Return.
    - Hard pass criteria:
      - 3 subplans moved to `plans/done/` via `git mv`
      - `chain-sessions/` contains 3 logs, each ending with a `## /final-q audit` block whose `**Verdict**:` is GREEN
      - `git log --since='30 min ago' --oneline` shows ≥3 commits (one per subplan)
      - 3 rows appended to `clients/encore/specs_planning/_internal/agent-activity-log.md` with wall-clock timestamps ≥ touched-file mtimes (LR-037 preflight passes)
      - `plans/INDEX.md` regenerated (each subplan's `/execute` ran `npm run plans:reindex`)
      - `.claude/state/chain.STOP` does NOT exist
      - `chain.json.status = done`
      - `/chain status` shows `done` and the budget summary
      - Branch unchanged: `git rev-parse --abbrev-ref HEAD` matches `chain.json.branch`

11. **Cap enforcement scenarios**:
    - Set `CHAIN_DAILY_CAP=2` env. Queue 5 subplans. After 2 GREEN: pause `daily-cap-reached`. State: `executedThisBatch=2`, `executedToday=2`, `batchCap=2`.
    - `/chain resume` → `batchCap` resets to `5` (resumeCap default), `executedThisBatch` resets to 0. Queue advances. Stops again at min(remaining, batchCap, dailyCap-executedToday).
    - Verify NO subplan spawned past either cap.

12. **`/chain skip` flow**:
    - Force YELLOW verdict on subplan 2 of 5. Chain pauses.
    - `/chain skip` → marks subplan 2 `skipped`, advances index, status stays `paused`.
    - `/chain resume` → spawns subplan 3.
    - Verify subplan 2 is in `plans/pending/` still (not moved), with no Status flip.

---

## NOT touched (out of scope, by design)

- `/execute` skill — unchanged. Spawned sessions invoke it; it already handles per-subplan bootstrap, regression-guard, activity log, INDEX regen.
- `/regression-guard`, `/audit`, `/reflect`, `/relevant`, `/research`, `/identity`, `/questionnaire` — unchanged.
- `final-q-gate.sh` — unchanged (chain-orchestrator runs after it).
- `plans/INDEX.md` schema, `plans-reindex.mjs` — unchanged.
- Subplan SESSION BOOTSTRAP block format — unchanged (existing subplans need no edits to be chain-compatible; Model/Thinking/PermissionMode are optional).
- Activity log format / `validate:activity-log:preflight` — unchanged.
- LR-027, LR-035, LR-037, LR-038, LR-040 — all still apply per-subplan via `/execute`; chain doesn't bypass them.
- Existing `mcp__scheduled-tasks__*` and `CronCreate` infra — unused by this design (event-driven via Stop hook is sufficient).
- Worktrees / branching / git checkout — chain never touches these. Branch guard verifies the user / other tools haven't either.

---

## Active rules applied

- **LR-027** (Execution Summary per item): each spawned `/execute` writes its own per-LR-027 summary; chain doesn't bypass.
- **LR-035** (INDEX.md auto-generated): each spawned `/execute` runs `npm run plans:reindex` after `git mv`; orchestrator never edits INDEX.md.
- **LR-037** (activity log timestamp gate): each spawned `/execute` appends its own row with wall-clock ≥ mtime; orchestrator never writes to activity log.
- **LR-038** (browser tool selection): unchanged — applies inside subplans, not at chain layer.
- **LR-040** (closure completeness gate): each subplan's own `/execute` enforces this at its closure; chain just checks `/final-q` verdict.
- **LR-024** (clean before RCA): not applicable — chain orchestration isn't an RCA.
- **CLAUDE.md "NEVER ASSUME"**: orchestrator pauses on ANY ambiguity (no verdict, branch drift, missing transcript). User adjudicates.

---

## Resolved during /review + /research (2026-04-23)

- `/chain skip` IS in v1 (D16, D11). YELLOW/RED no longer requires hand-editing JSON.
- Counters are per-day-globally in `chain.json.budget`, plus a per-batch counter for cap enforcement (D21). Single source of truth = `chain.json`.
- `claude --effort` flag confirmed (`low|medium|high|xhigh|max`). Per-model tier counts: Opus 4.7 = 5, Sonnet 4.6 = 3 effective (D17).
- `--permission-mode auto` confirmed as a real CLI choice. Default for spawned sessions (D7).
- **D20 (Stop hook in `-p` mode)**: high-confidence YES based on offline evidence — `claude --help` documents `--bare` as "skip hooks", proving hooks are opt-out (default-on) regardless of `-p`. Spike downgraded from blocking gate to 30-second confirmation step. Implementation can proceed in parallel with the spike.
- **D28 (Q1 — SessionStart hook for PAUSE_NOTICE auto-display)**: APPROVED. Add `.claude/hooks/chain-pause-notice.sh` registered under `hooks.SessionStart`. On every interactive `claude` open, the hook checks `chain.json.status` — if `paused`, prints PAUSE_NOTICE.md content + reminder of `/chain status` / `/chain resume`. ~10-line bash script. SessionStart hook event confirmed available per earlier `.claude/hooks/` inventory.
- **D29 (Q3 — env inheritance)**: APPROVED full inheritance via `nohup`. POSIX/bash default is full parent-env passthrough; sanitization would require explicit `env -i`. Spawned chain sessions inherit `ENCORE_*` from `.env.local`, PATH, plus any user-set vars. Documented in `chain-orchestrator.sh` header.
- **D30 (Q4 — DQU 35-subplan retrofit)**: this plan stays framework-only. DQU retrofit (adding `**Model**:` / `**Thinking**:` / `**PermissionMode**:` frontmatter to the 35 existing DQU subplan files) becomes a new downstream SP authored under PLAN_DELIVERABLE_QUALITY_UPGRADE. Out of scope here.
- **D31 (`/chain resume` explicit subplan list)**: NO for v1. Strictly continue from `currentIndex`. Explicit override (`/chain resume SP-X SP-Y`) deferred to v2 if a real need emerges.

## Open questions

None blocking. All prior questions resolved via offline evidence + locked-decision rationale. If user wants to override any of D28-D31, they can flag before `/execute`.

---

### Execution Summary

**Closed**: 2026-07-16 — **the plan is fully landed, deployed, and battle-tested; this closure is paperwork catching up with reality** (navigation.md line 95 already recorded it "Complete, landed 2026-04-23"). Closure evidence gathered by a read-only Claude-side Opus verification pass (2026-07-16) over every declared deliverable; the chain runtime itself was left untouched (PAUSED, HELD by user, NM2305 armed — read-only inspection only).

- **TCs implemented**: 0 — none planned (framework-infrastructure plan; no TC scope).
- **TCs dropped**: 0 — n/a.
- **MCP verification**: n/a — no live-site scope.
- **Test pass confirmation**: runtime evidence instead of a spec suite — two archived real chain runs in `.claude/state/chain-archive/` (2026-04-23, incl. SP-DQU-06) plus the live NM2305 chain state (`.claude/state/chain.json` status `paused`, PAUSE_NOTICE.md + session log present), and `parse-verdict.mjs --self-test` embedded cases.
- **Documentation changes**: `.claude/skills/chain/SKILL.md` (full sub-command dispatch), `.claude/skills/INDEX.md` chain row, `.claude/skills/final-q/SKILL.md` D23 note, `.claude/skills/planning/SKILL.md` D18 gate, `.claude/skills/execute/SKILL.md` D25 git-mv+reindex, `.claude/context/navigation.md` rows 56/57/95, LR-041 authored in `.claude/rules/pipeline.md`.

**Deliverables landed (all verified on disk 2026-07-16)** — NEW: `.claude/state/.gitkeep`, `.claude/hooks/chain-orchestrator.sh` (evolved: D1/D5/D7/D8/D10/D17/D21-D26/D29 + post-plan hardening), `.claude/hooks/chain-pause-notice.sh` (D28, wired SessionStart), `.claude/hooks/lib/chain-state.sh`, `.claude/hooks/lib/chain-guards.sh`, `.claude/skills/chain/SKILL.md`, plus implementation-chosen node backends `.claude/hooks/lib/chain-state.mjs` + `.claude/hooks/lib/parse-verdict.mjs`. MODIFIED: `.claude/settings.json` (Stop + SessionStart wiring), `.gitignore` (chain state entries + extensions), the five skill/docs files above, root `CLAUDE.md` (LR-041 reference; `/chain` routing lives in `.claude/skills/INDEX.md` — structural relocation, not a gap).

**Drifts — resolved differently than written (LR-020 disposition, not defects)**:
1. `final-q-gate.sh` ordering assumption (D3/D13) — that hook was deleted 2026-04-23 (LR-042 §A); `chain-orchestrator.sh` is now the FIRST Stop hook; enforcement moved to `/execute` Phase 4 + pause-on-verdict-NONE.
2. jq-based state helpers (D22) — jq unavailable on this box; helpers are node-backed (`chain-state.mjs`), renamed `cs_get/cs_set/cs_inc/cs_pause`.
3. bash `parse_verdict` (D5/D23) — superseded by `parse-verdict.mjs` (JSONL support, `--owns-subplan` RC-2 guard, atomic `--record-outcome`).
4. `--thinking` flag → `--effort` (self-corrected in-plan D7/D17; runtime uses `map_effort_for_cli`).
5. `claude-opus-4-7` → `claude-opus-4-8` (LR-041 bump 2026-06-05).
6. `check_allowlist` in chain-guards.sh — deliberately deleted 2026-07-16 as dead code (PBUG-11), not drift.

**Post-plan hardening (landed after the plan, recorded so the summary matches reality)**: SP-CCE-05 idempotency spawn-markers + double-fire SHA-256 guard + atomic record/prep + fail-closed policy (2026-04-27); LR-042 §C RC-1 `MSYS2_ARG_CONV_EXCL` path-mangling guard + RC-2 session-ownership guard (2026-07-07); PLAN_UPLINK_PROTOCOL P5.3 uplink `## ASK` surfacing in PAUSE_NOTICE (2026-07-12); adjacent growth: `/chain_audit` skill + `chain-audit.json` + `chain-sessions-green/`, COMPLETE_NOTICE done-path.

**Spun-out items (LR-040(b) recipients verified)**: D30 DQU 35-subplan Model/Thinking/PermissionMode retrofit → downstream SP under PLAN_DELIVERABLE_QUALITY_UPGRADE (explicitly out of scope here, recorded in §Locked decisions); SP-CCE-05 → already landed in `plans/done/`.

**Why closed without re-execution**: re-running the phases as written would rebuild already-shipped hooks and REGRESS the RC-1/RC-2/idempotency/uplink hardening with the plan's first-draft implementations. Verification chain: Claude-side Opus read-only verifier (per-deliverable table, 2026-07-16) + dispatcher spot-checks; chain runtime untouched throughout.
