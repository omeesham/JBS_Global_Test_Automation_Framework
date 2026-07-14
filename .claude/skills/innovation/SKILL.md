---
name: innovation
description: Anti-over-delegation law for novel work — the frontier model in the loop authors the novel thinking itself; delegation only speeds it up (evidence gathering, mechanical verification, drafting FROM a Claude-authored design), never the design/synthesis/doctrine core. Use when the task is "innovate", "novel", "first of its kind", "design a new system/doctrine/pattern", or greenfield with no repo precedent.
---

# /innovation — Novel thinking stays with the frontier model

> **Identity**: OWNER. WRAP type (modifies HOW work is done, not WHAT). No auto-calls.
> **Origin**: Rutvik directive (chat, 2026-07-12) — innovation must NOT be delegated away; frontier-model raw capability does the novel thinking, delegation only speeds it up. Landed by PLAN_UPLINK_PROTOCOL Phase 6.

## Core law (the whole skill)

**The frontier model in the loop authors the novel thinking itself.** Delegation is allowed only for *speed* — evidence gathering, mechanical verification, and drafting FROM a Claude-authored design. It is NEVER allowed for the design, the synthesis, or the doctrine core.

This is the deliberate, sanctioned exception to delegation-first. Delegation-first stays law for all non-novel work; `/innovation` is the exception lane for genuinely novel work — **not a gate bypass**.

## The litmus (apply per unit of work)

> "Would the worker's output **REPLACE** my thinking, or **FEED** it?"

- **REPLACE** (the worker would produce the novel design/synthesis/decision itself) → **inline**. Claude does it. Delegating it is the failure this skill exists to kill.
- **FEED** (the worker gathers evidence, runs a probe, verifies a claim, or drafts implementation FROM a design Claude already authored) → **delegate**. This is speed, and speed is allowed.

## When to use

Triggers: "innovate" / "innovation", "novel", "first of its kind", "design a new system / doctrine / pattern / architecture", greenfield work with no repo precedent.

## While active

- Delegated tickets MUST be evidence-feeder work-types: `research` / `walk` / `probe` / `verify` / read-style / draft-FROM-a-Claude-design.
- A `build` / `draft` ticket whose **GOAL is the innovation core itself** = an **inverse routing incident**. Log it to `~/.claude/delegation/self_incidents.log` tagged `INVERSE` (the mirror of the ordinary "I coded myself" incident — here the sin is delegating the thinking, not doing the labor).
- The design / synthesis / doctrine you produce is Claude-authored; workers implement it and prove it, they do not invent it.

## Honesty (deliberately prose-tier — LR-069 S3)

No deterministic hook can classify "innovation-class" work — the boundary is a judgment call. Enforcement is therefore doctrine + `INVERSE`-incident visibility in `self_incidents.log` + Rutvik's receipt read. This is a conscious S3 posture (judgment call, no gate), not an oversight. `worker-ext.md` CLAUDE-ONLY item 9 carries the same non-delegable-class rule at the delegation layer.

## Precedent case

PLAN_UPLINK_PROTOCOL is its own first precedent: the uplink DESIGN was Claude-authored inline; workers built the repo-side `mjs` + drafts FROM that design and re-executed acceptance E2Es — feed, never replace.
