---
name: ultra-agents
description: Goal-scoped authorization that lifts the worker/subagent concurrency caps (default max-5 → up to 20 where the local worker extension defines the lever; plus the generic ≤current-model-class and LR-041 thinking-tier caps) so the agent can fan out wide and exhaustively find and update every deeply-hidden thing a shallow pass would miss. Lapses when the core goal changes. Explicit-invoke only.
user-invocable: true
disable-model-invocation: true
auto-calls: none
tools: Read, Glob, Grep, Bash, Edit, Write, Agent, TodoWrite
---

# /ultra-agents — Wide Fan-Out Authorization (goal-scoped)

A permission-opener, not a forced army. It AUTHORIZES a wide worker fan-out for the current
core goal and tells you to use it with judgment — so Rutvik no longer has to motivate
"go deep, no limits" by hand each time. Invocation = his approval for the lifted caps.

## When to Use
- **Identity**: ALL. Orthogonal to identity — identity controls WHAT you touch, this controls
  HOW WIDE you may search. Does NOT bypass identity §2 ownership or any safety/audit rail.
- **Explicit only**: user types `/ultra-agents`. Never auto-routes (ambient phrases like
  "get an army on this" must not auto-spawn unlimited agents).
- **Goal-scoped**: authorizes the wide fan-out for the CURRENT CORE GOAL (the task in the message
  that invoked it). Stays valid for follow-ups on the SAME goal. When the core goal CHANGES,
  authorization LAPSES — revert to normal caps and ask the user to re-invoke for the new goal.
  Record the authorized goal in TodoWrite so it survives context compression.

## What it lifts — and what it does NOT

> **Read this first.** Everything below about "workers" depends on an optional local file,
> `.claude/skills/ultra-agents/worker-ext.md`. **If that file is not on disk — the normal case —
> there is no worker fleet and the worker bullet below is INERT.** Do not wait for workers, do not
> hunt for a dispatch wrapper, and never treat "delegate it" as a precondition for starting: fan out
> with ordinary Claude subagents and do the work yourself. Every other bullet still applies normally.

**Lifts (self-imposed policy caps only):**
- **Worker concurrency (PRIMARY — applies ONLY when `worker-ext.md` exists on disk; otherwise this
  bullet is INERT, skip it)**: the default worker cap (5) → up to a hard ceiling of **20** for this
  goal. The worker extension defines the concrete lever; without that file, standard subagent
  fan-out is the path.
- `CLAUDE.md` "max 5 parallel" subagent cap → no fixed parallel cap (use judgment + resource
  sanity; very high counts cause host I/O thrash). Note: where the local worker extension is
  active, worker delegation is the default path and direct subagent spawns stay guarded.
- `CLAUDE.md` "≤ current model class" → spawn any class (Haiku / Sonnet / Opus) per task fit.
  Platform allows higher-class subagents; the ≤-parent rule was self-imposed.
- `LR-041` subagent thinking-tier restrictions, for this goal's spawned work.

**Does NOT lift (these serve the same don't-cut-corners goal):**
- Identity §2 file ownership · NEVER-ASSUME · REMEMBER→ASK→AUDIT→EXECUTE.
- LR-028 activity log · LR-027/040/046/050 closure discipline · honesty / evidence rules.
- Sonnet HALT guardrails (no RCA / browser / hypothesis on Sonnet workers — adaptive work
  stays on Opus).
- Destructive-action safety: the army is for DISCOVERY + UPDATES, never bulk deletion or
  irreversible ops without explicit user ok.

## Use the army intelligently
- Benefits from breadth/depth (ripple-effect hunts, repo-wide convention sweeps, exhaustive
  reference/dependency tracing, "find everything that needs updating after X") → fan out hard.
- Trivial single-file / obvious local edit → just do it inline. Spawning here is waste, not
  thoroughness — and waste is its own kind of corner-cut (noise + cost).

## Local worker extension (load on EVERY invocation)
FIRST ACTION when this skill is invoked — before planning the work, fanning out, or answering
questions about delegation: if `.claude/skills/ultra-agents/worker-ext.md` exists on disk, Read it.
On this machine it defines local-only worker-delegation DEFAULTS (worker types, when they are the
default path, how to verify their output) that take precedence over this skill's generic fan-out
guidance. If the file is absent, ignore this section.

## The core job — catch what a shallow pass misses
When something changes, fan out parallel subagents along DIFFERENT search angles so nothing
hides: by direct reference (imports/calls/usages) · by name + naming-convention variants ·
by sibling/parallel-file pattern · by config/env · by docs/comments · by tests/specs ·
by type/contract. Then:
1. dedup → synthesize findings,
2. run a **completeness-critic** pass ("which angle/modality did we NOT search? which claim is
   unverified?"),
3. **loop until a round surfaces nothing new** (loop-until-dry — don't stop at first results),
4. apply the updates,
5. **adversarially verify** each change (a skeptic worker tries to prove it wrong).
Subagents can't spawn subagents — orchestrate waves yourself.

## Model-awareness (1M-context gate — research-backed, no assumptions)
Read your own model from session context.
- Subagent model is selectable (`model: sonnet|opus|haiku|inherit`); a subagent CAN run a
  higher class than you. The ≤-parent rule was self-imposed, not a platform limit.
- If YOU (orchestrator) are on a **1M-context** variant: a subagent of a different model
  silently inherits the 1M tier — a separate billing SKU. If that SKU lacks extra-usage, the
  subagent fails with a HARD error (not a silent downgrade):
  `Extra usage is required for 1M context · run /extra-usage to enable, or /model to switch to standard context`.
- Behavior: attempt the model class the task needs. On THAT specific error → do NOT drop the
  work. Fall back to `model: inherit` (your model) or Haiku for that worker, **LOG the
  downgrade in chat**, and tell the user they can `/extra-usage` (enable the SKU) or `/model`
  to standard (non-1M) context to unlock free cross-class spawning. On a non-1M parent,
  cross-class subagents spawn normally — no gate. Never hard-code "Haiku-only": detect,
  attempt, fall back + log.

## Rules
- Authorization is goal-scoped: same goal = army valid across follow-ups; goal change = lapse
  + re-invoke.
- Be smart: army for breadth/depth; inline for trivial. Unnecessary spawning = a corner-cut.
- Keeps ALL correctness / identity / audit / safety rails. Lifts only count / class / tier caps.
- Never destructive without explicit ok — discovery + updates, not deletion sprees.
- Never routes to `/slop`: the army MAXIMIZES coverage; `/slop` MINIMIZES surface — antithetical
  inside this skill's run. (The user may still run `/slop` separately on the resulting diff.)
- Honesty: log every model fallback; never claim coverage you didn't achieve (loop-until-dry
  must actually run, not be asserted).
