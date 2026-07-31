---
name: Embed enforcement at point of action, never in a separate rules list
description: When creating enforcement (rules, gates, checks), embed it AS a step in the skill phase where the violation would happen — not as an LR rule in CLAUDE.md that gets forgotten under pressure.
type: feedback
---

Rules in a list (CLAUDE.md Learned Rules section) get forgotten under pressure. Rules that ARE the step get executed because the step IS the rule.

**Why:** SSL session 2026-04-07 proved this. LR-007 (verify before code) existed since 2026-03-20. Both Sonnet and Opus violated it because it's in CLAUDE.md — not in /execute's phase steps. The rule was 80 lines away from the action point. Under pressure, nobody scrolls up to re-read the rules list.

**How to apply:**
- When graduating a pattern via /compile-learnings: ask "should this be an LR rule (passive) or an embedded step (structural)?" If the pattern was violated DESPITE existing as a rule → it needs embedding, not another LR entry.
- When creating enforcement in /planning: embed the check AS a numbered step in the relevant skill phase. Use existing patterns: checkpoint questions, template items, clause extensions.
- The pipeline's 3 hard enforcement patterns: (1) phase sequence dependency, (2) verdict-driven blocking (BLOCKED/CLEAN), (3) tool-level HALT. Use these, don't invent new ones.
- This principle also applies to PLANS: embed constraints in each plan step, not in a "rules to follow" preamble that gets skipped.
