---
name: No-rush discipline at session end (plan + skills, even when "almost done")
description: When the last todo in a session is non-trivial work (e.g., "do the upgrade after this"), inject full skill discipline into the TodoWrite (planning, questionnaire, execute, audit, final-q) — do NOT collapse it to a single "do the upgrade" line. Pressure to wrap up is the highest-risk moment.
type: feedback
originSessionId: 2ab77cbd-56f9-4e32-b1f3-753708c1ff4c
---
When a multi-phase session ends with deferred work ("after the subplan, do the upgrade"), the deferred work MUST get the same skill discipline as fresh work — explicit /planning, /questionnaire, /execute, /audit, /final-q items in TodoWrite. NOT a single line that says "do the upgrade work."

**Why:** Rutvik directive 2026-04-23 during SP-AAE-01 setup: "when u do the self upgrades in last todo, do not rush, plan and use all relevant skills.. inject this into the todo list itself so u dont fuckup at the end". The end of a session is when context budget is tight, attention is degraded, and the temptation to "just do it real quick" is highest. Single-line todos at the end of a long list are routinely converted into rushed implementations that skip /planning + /questionnaire and produce buggy or under-scoped output. Multiple prior sessions ended exactly this way (chain of plan→execute→done degrades to plan→done at the tail).

**How to apply** (whenever the user defers a follow-up task to the end of the session):

1. **Decompose the deferred work into separate todos** — minimum 4 items: /planning (or /research first if novel territory), /questionnaire (or /audit if no user input needed), /execute, /final-q. Each gets its own line in TodoWrite.
2. **Tag each item with the skill name in brackets** — `[UPGRADE-PHASE] /planning — design the X`, `[UPGRADE-PHASE] /questionnaire — gate Rutvik's input`, etc. The bracket prefix makes it greppable + makes "skipping a skill" visible.
3. **Inject the user's "do not rush" instruction into the first item** — e.g., `[UPGRADE-PHASE — DO NOT RUSH] /planning — design the identity-switch enforcement upgrade. Use /research first if needed (web for hook patterns; repo for existing hooks)`.
4. **Add a context-budget checkpoint todo** between subplan completion and upgrade phase — `[HANDOFF-OR-CONTINUE] Decide: handoff to fresh session OR continue with upgrade work (check token usage; threshold ~400k soft per LR-042 partner rule)`. This forces a deliberate decision instead of automatic continuation.
5. **Keep the discipline even if the upgrade looks simple** — single-line "small" upgrades have a long track record of becoming multi-hour debugging sessions. Plan first.

**Trigger:** any session where the user defers a non-trivial follow-up task to "after this", or any TodoWrite with >2 phases of work where the second phase risks being collapsed into one line.

**Companion preference:** [feedback_question_quality.md](feedback_question_quality.md) (high-impact steering only — questionnaire still needs to filter, not pile on noise). [feedback_planning_workflow.md](feedback_planning_workflow.md) (planning before execution is non-negotiable).

**Anti-pattern to avoid:** todo list ending with a single `Then upgrade the X` line. Every time that has shipped, the upgrade was rushed and incomplete. Instead, end with `[UPGRADE-PHASE] /final-q for upgrade phase — separate verdict block from subplan verdict` — explicit closure marker.
