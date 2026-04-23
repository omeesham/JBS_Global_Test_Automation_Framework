---
name: chain
description: Autonomously execute pending subplans by spawning each one in its own background Claude session. Stop hook parses /final-q verdict and auto-advances on GREEN. Pauses on YELLOW/RED, daily/batch/weekly cap, branch drift, or STOP marker. Sub-commands — `/chain` (start), `/chain resume`, `/chain status`, `/chain stop`, `/chain skip`, `/chain reset`. `/chain N` overrides the batch cap (1..10). Use when the user says "chain", "run all plans", "execute pending", "resume chain", "chain status", or similar.
user-invocable: true
auto-calls: identity
tools: Read, Glob, Grep, Write, Edit, Bash, TodoWrite
---

# /chain — Per-Session Background Chain Orchestration

> **Design authority**: [PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md](../../../plans/pending/PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md) — 31 locked decisions (D1–D31). Do not re-litigate.
>
> **State lives at** `.claude/state/chain.json` (gitignored). One active chain per repo.
>
> **Model+thinking+permissionMode** come from subplan frontmatter per LR-041 (fallback defaults: Sonnet→`hi`, Opus→`xhi`, permissionMode=`auto`). `xhigh` needs Claude Code v2.1.111+ — older CLI clamps `xhi→high`.

---

## When to Use

**Identity**: OWNER. Auto-loaded via Identity Gate.

Triggered by any of:
- User says "chain", "run all plans", "execute pending", "autonomous pipeline", "batch execute"
- User says "chain status", "chain resume", "chain stop", "chain skip", "chain reset"
- User says "run N plans" or asks for a trial run

## Architecture (quick read)

```
/chain → writes chain.json → spawns first subplan as `nohup claude -p "/execute SP.md" &`
                                                          │
                                            subplan runs → /final-q → session stops
                                                          │
                                            Stop hook: final-q-gate.sh → chain-orchestrator.sh
                                                          │
                                   chain-orchestrator parses last "## /final-q audit" verdict
                                                          │
                                GREEN → advance, spawn next      YELLOW/RED → pause
                                all guards pass? (STOP / branch / caps)
```

The hook is event-driven. No polling, no daemon. Your interactive conversation ends after printing the spawn status; the chain continues in background.

---

## Sub-command dispatch

The skill dispatches on the first positional arg:

| Invocation | Action |
|---|---|
| `/chain` | START a new chain, batchCap=dailyCap (10) |
| `/chain N` (1..10) | START with trial batchCap=N |
| `/chain resume` | RESUME paused chain, batchCap=resumeCap (5) |
| `/chain resume N` (1..5) | RESUME with batchCap=N |
| `/chain status` | Print state table; no mutations |
| `/chain stop` | Abort chain (writes STOP marker) |
| `/chain skip` | Mark current subplan skipped, advance index, stay paused |
| `/chain reset` | Archive `chain.json` only. Does NOT touch `chain-sessions/` (LR-042 — those artifacts are the `/chain_audit` queue) |

Env override ceilings (power users):
- `CHAIN_DAILY_CAP` (default 10)
- `CHAIN_RESUME_CAP` (default 5)
- `CHAIN_WEEKLY_BUDGET` (default 50)

---

## `/chain [N]` — START

1. **Identity gate** → OWNER.
2. **Concurrency check** — refuse if `chain.json.status=running` with "Chain already active. Use `/chain status` / `/chain stop` first."
3. **Parse trial limit N** — if first arg is an integer 1..10, set `batchCap=N`; else `batchCap = $CHAIN_DAILY_CAP` (default 10). Reject N>10 with "Trial limit cannot exceed dailyCap=10. Override with env `CHAIN_DAILY_CAP`."
4. **Build queue**:
   - Read `plans/INDEX.md` Execution Queue.
   - For each row: read the subplan file, extract `**Depends on**`, `**Model**`, `**Thinking**`, `**PermissionMode**`, `**RiskAcknowledged**` (bypassPermissions only).
   - Default-apply per LR-041 if missing: Sonnet → `hi`; Opus → `xhi`; PermissionMode `auto`.
   - Topologically sort into waves.
   - Filter to subplans whose dependencies are all DONE or themselves queue-ahead.
   - Take first `batchCap` subplans.
5. **Snapshot branch**: `git rev-parse --abbrev-ref HEAD`.
6. **Write `chain.json`** via `node .claude/hooks/lib/chain-state.mjs init '<initial-state>'`:
   - `status=running`, `currentIndex=0`
   - `queue[i] = { file, deps, wave, model, effort, permissionMode, riskAcknowledged, status: "pending" }`
   - `budget = { dailyCap, resumeCap, weeklyBudget, executedToday: 0, executedThisWeek: 0, executedThisBatch: 0, batchCap, lastInvocationKind: "start" }`
7. **Spawn first subplan** via `nohup claude -p "/execute <first>" --model <m> --effort <cli-value> --permission-mode <p> > .claude/state/chain-sessions/<first>.log 2>&1 &`. Use `.claude/hooks/lib/chain-guards.sh::map_effort_for_cli` to clamp `xhi→high` if CLI < v2.1.111.
8. **Print status** to user (this conversation):
   ```
   Chain started.
   Queue: N subplans (batchCap=X, dailyCap=10, weeklyBudget=50)
   First:  SUBPLAN_XXX.md (PID 12345, model=..., effort=..., permissionMode=...)
   Log:    .claude/state/chain-sessions/SUBPLAN_XXX.log
   Status: /chain status   (or: tail -f .claude/state/chain-sessions/*.log)
   Stop:   touch .claude/state/chain.STOP   (or: /chain stop)
   ```
9. **Exit this conversation cleanly**. The chain continues in background via Stop hooks.

---

## `/chain resume [N]` — RESUME

1. Identity gate → OWNER.
2. Read `chain.json`. Refuse if `status ∈ {running, done}`.
3. Parse optional N (1..5): `batchCap=N`; default `batchCap=$CHAIN_RESUME_CAP` (5). Reject N>5 with env-override hint.
4. Reset `budget.lastInvocationKind="resume"`, `budget.executedThisBatch=0`, `budget.batchCap=<resolved N>`.
5. Re-snapshot branch — HALT if drifted from recorded `.branch` (surfaces via `/chain status` + PAUSE_NOTICE).
6. Set `status=running`. Spawn next subplan at `queue[currentIndex]`. Print + exit (same format as start).

**YELLOW/RED restriction**: if last verdict was YELLOW or RED, resume WILL still fire the next spawn — the user's action to `/chain resume` is their acknowledgement. If they want to skip the offender instead, they run `/chain skip` first (which advances currentIndex without firing next).

---

## `/chain status` — READ-ONLY

1. Read `chain.json`.
2. Render table:
   ```
   idx | file                             | status     | verdict | pid    | started                    | ended
   ----+----------------------------------+------------+---------+--------+----------------------------+----------------------------
    0  | SUBPLAN_XXX.md                   | completed  | GREEN   | 12345  | 2026-04-23T14:30:01-04:00  | 2026-04-23T14:38:22-04:00
    1  | SUBPLAN_YYY.md                   | running    | -       | 13010  | 2026-04-23T14:38:22-04:00  | -
    2  | SUBPLAN_ZZZ.md                   | pending    | -       | -      | -                          | -
   ```
3. Print budget summary: `executedThisBatch/batchCap`, `executedToday/dailyCap`, `executedThisWeek/weeklyBudget`, reset times.
4. If `status=paused`, print `chain-sessions/PAUSE_NOTICE.md` content inline.
5. If `status=done`, print `chain-sessions/COMPLETE_NOTICE.md` content inline.
6. No mutations.

---

## `/chain stop` — ABORT

1. Read `chain.json`.
2. `touch .claude/state/chain.STOP` — the orchestrator picks this up on next hook fire and aborts.
3. For any `status=running` subplan with a live PID, print `kill <pid>` as a copy-pasteable command (do NOT auto-kill; user decides).
4. Set `chain.json.status=aborted` directly (don't wait for hook).

---

## `/chain skip` — MARK CURRENT SKIPPED, ADVANCE INDEX

Only valid while `status=paused`.

1. Refuse if status ≠ paused.
2. `node chain-state.mjs set .queue.$(currentIndex).status '"skipped"'`
3. Advance: `node chain-state.mjs inc .currentIndex` (or explicit `set`).
4. Status stays `paused`. User must call `/chain resume` to fire the now-current subplan.
5. Verify the skipped subplan stays in `plans/pending/` (not moved to done/).

---

## `/chain reset` — CLEAR STATE (chain.json only — LR-042)

1. Refuse if `status=running` — must `/chain stop` first.
2. `mv .claude/state/chain.json .claude/state/chain-archive/chain-$(chainId).json`.
3. **Do NOT touch `.claude/state/chain-sessions/`.** Those `.log` + `.pid` files are the headless-run artifacts awaiting `/chain_audit`. Per LR-042 they may move ONLY via `/chain_audit` GREEN + explicit user approval (into `.claude/state/chain-sessions-green/`). Reset clears the live chain queue (`chain.json`); it does NOT destroy the audit queue.
4. Print "Chain state reset. `/chain` to start a new one. (chain-sessions/ preserved — run /chain_audit to walk through un-audited headless runs.)"

---

## Cap + guard semantics

| Guard | Trigger | Action |
|---|---|---|
| `batchCap` | N-th spawn attempt in this batch | pause `batch-cap-reached` |
| `dailyCap` (10) | 11th spawn in same day | pause `daily-cap-reached` |
| `weeklyBudget` (50) | 51st spawn in same Mon-Sun week | pause `weekly-budget-reached` |
| `STOP marker` | user `touch .claude/state/chain.STOP` | abort; marker deleted |
| `branch drift` | `git rev-parse --abbrev-ref HEAD` ≠ chain.json .branch | pause `branch-drift` |
| `bypassPermissions` without RiskAcknowledged | subplan declares permissionMode=bypassPermissions but missing `**RiskAcknowledged**: true` | pause with explicit message |
| Verdict ≠ GREEN | `/final-q` returned YELLOW/RED or no verdict found | pause `verdict-<X>` |
| Concurrency | second `/chain` while one running | refuse with guidance |

Counters reset:
- `executedToday` resets at local midnight
- `executedThisWeek` resets Monday 00:00 local
- `executedThisBatch` resets on every `/chain` and `/chain resume`

Counts are incremented at SPAWN time (D24), not completion — a subplan spawned at 23:59 counts toward that day's total even if it completes at 00:01.

---

## Test-only env overrides

- `CHAIN_STATE_DIR` — override `.claude/state` (used by unit tests; don't ship set)
- `CHAIN_SPAWN_CMD` — replaces `nohup claude -p` (e.g., `CHAIN_SPAWN_CMD="echo MOCK"` for dry-run)
- `CHAIN_QUEUE_OVERRIDE` — path to a JSON queue file, bypasses `plans/INDEX.md` read (tests only)
- `CHAIN_DAILY_CAP` / `CHAIN_RESUME_CAP` / `CHAIN_WEEKLY_BUDGET` — ceiling overrides

---

## What this skill does NOT do

- Does NOT run `/execute` itself — each spawned session runs its own `/execute`.
- Does NOT write to activity log — each `/execute` writes its own row per LR-028 + LR-037.
- Does NOT regenerate `plans/INDEX.md` — each `/execute` runs `npm run plans:reindex` on its own close.
- Does NOT auto-call `/regression-guard` at chain level — each `/execute` does it per-subplan.
- Does NOT switch branches, create worktrees, or touch git refs beyond reading HEAD for the branch guard.

## Auto-Calls

- `/identity` — first step. OWNER required.

## Rules applied

- **LR-027** (Execution Summary) — spawned `/execute` handles per-subplan.
- **LR-035** (INDEX auto-generation) — spawned `/execute` runs `plans:reindex`.
- **LR-037** (activity-log timestamp gate) — spawned `/execute` writes its own row.
- **LR-038** (browser tool selection) — applies inside subplans, not at chain layer.
- **LR-040** (closure completeness gate) — each subplan's `/execute` enforces at its own closure.
- **LR-041** (Model + Thinking selection rubric) — queue build reads each subplan's frontmatter.

## Output

- State file `.claude/state/chain.json` (schema v1).
- Per-subplan logs `.claude/state/chain-sessions/SUBPLAN_*.log`.
- `PAUSE_NOTICE.md` / `COMPLETE_NOTICE.md` on pause/done.
- Commits happen inside each spawned `/execute` session; chain orchestrator never commits.
