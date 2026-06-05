# PLAN — Create the `/ultra-agents` skill

**Status**: DONE
**Priority**: P3-ADHOC
**Created**: 2026-06-04
**Executed**: 2026-06-04
**Identity**: OWNER
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits

## Context

When a task genuinely benefits from a large fan-out of subagents to exhaustively catch
hidden ripple effects, the operator previously had to manually motivate the agent each time
("go deep, no limits, spawn an army"). The default framework caps fight this: root `CLAUDE.md`
"Subagent rules" enforce `max 5 parallel` and `≤ current model class`, and LR-041 constrains
subagent thinking tiers. The need: a lean, saved prompt-as-skill that, on invocation, opens
permission for the current agent to fan out a large multi-class army for the current goal —
so it can trace and fix the updates buried too deep for a shallow pass to find. Per the
operator: "it's nothing more than a prompt, but it lives in a skill so I don't have to type."

## Approach (locked via clarifying Q&A)

1. Lift only the self-imposed count / model-class / thinking-tier caps; keep all
   correctness / identity / audit / safety rails (those serve the same don't-cut-corners goal).
2. Be model-aware, not assumption-based: detect the orchestrating model and handle the
   1M-context extra-usage spawn gate with an honest fallback + log, never a Haiku-only hard-code.
3. Goal-scoped authorization opener, explicit-invoke only (`disable-model-invocation: true`);
   persists across follow-ups on the same goal, lapses when the core goal changes.
4. Lean — repo-native Agent fan-out, no new heavy infra, no LR rule, no alias; non-destructive.

## Execution Summary

**Executed**: 2026-06-04 by OWNER (Opus 4.8, 1M context).

What was built (3 files):
- Created `.claude/skills/ultra-agents/SKILL.md` — a lean goal-scoped subagent-army
  authorization skill (~74 lines), modeled on the existing `.claude/skills/sonnet/SKILL.md`
  mode-toggle. Frontmatter: `user-invocable: true`, `disable-model-invocation: true`,
  `auto-calls: none`; Match Type WRAP.
- Edited `.claude/skills/INDEX.md` — added the `/ultra-agents` row, bumped the skill count
  from 28 to 29, and listed the skill under the disable-model-invocation explicit-only group.
- Edited root `CLAUDE.md` — added one cross-reference line inside the "Subagent rules"
  section pointing at the new skill as the cap-lifting override.

Decisions encoded in the skill: lift only the count / class / LR-041-tier caps; retain every
identity, audit, and safety rail; model-aware 1M-context extra-usage fallback (research-backed,
cited inline); goal-scoped authorization that lapses on goal change; never routes to `/slop`.

Research finding (grounds the model-aware clause, cited not assumed): subagent `model` is
freely selectable and a subagent may run a higher class than its parent; the "only Haiku
spawns" blocker is specific to a 1M-context parent's per-SKU extra-usage gate, not a universal
law. On a standard (non-1M) parent, cross-class subagents spawn normally.

Slop check: ran `/audit slop` on `.claude/skills/ultra-agents/SKILL.md` — verdict essentially
MINIMAL (the skill is leaner than both sibling mode-skills and adds zero new infrastructure);
trimmed one duplicate TodoWrite phrase from the Rules recap.

Verification: grep confirmed registration — `.claude/skills/INDEX.md` shows both the table row
and the disable-model-invocation entry; `CLAUDE.md` shows the cross-reference line; the skill
frontmatter keys (name / user-invocable / disable-model-invocation / auto-calls) verified.

Documentation changes: `.claude/skills/INDEX.md` and the `CLAUDE.md` Subagent-rules cross-ref.

Test confirmation: no spec or test changes — this was a skill-authoring task only.

## Handoff

The skill is live and invocable as `/ultra-agents`. No follow-up work required.
