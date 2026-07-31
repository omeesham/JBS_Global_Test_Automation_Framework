---
name: execute-not-over-plan
description: When a handoff says "/execute /ultrathink FOO.md", the new session should START IMPLEMENTATION, not draft another handoff file. /ultrathink already wraps /planning + /execute; writing both adjacently invites sequential misinterpretation.
type: feedback
originSessionId: d16e2c8c-6b50-429d-9709-1be237a63eed
---
Handoffs to new sessions must be unambiguous about executing code, not re-planning. When I wrote `/execute /ultrathink PLAN_XXX.md` in a prior handoff, the next session treated them as two sequential dispatches: ran the /planning leg (wrote another handoff file), called ExitPlanMode, and stopped — producing a hand-off-of-a-hand-off with zero code landed.

**Why**: `/ultrathink` is a wrapper skill that auto-calls `/planning → /execute → /audit → /reflect`. Prefixing it with `/execute` is redundant and ambiguous. Separately, a new session that surfaces real adjudication items (e.g., CLI flag version mismatch, missing trial subplans, tool absences) must RESOLVE them in 5 minutes and keep going — not bottle them up into another handoff. The rubber-stamp-your-own-laziness pattern (ALL-030) is the failure mode; "I found issues" becomes an excuse to stop.

**How to apply**:
- When writing a handoff: prefer a single skill invocation (e.g., `/ultrathink FOO.md`), not chained skills. If the chain is necessary, label each explicitly ("Phase A: /planning", "Phase B: /execute").
- Include an explicit "DO NOT write another plan or call ExitPlanMode without /execute running first. Deliverable is code landed." sentence in the handoff's First Actions.
- When receiving a handoff and surfacing new adjudication items: resolve them (probe + fix + document) and keep executing. Handoffs only if genuinely blocked (e.g., needs user pick for a subplan choice that mutates specs).
- If context has already produced a full plan file, the next session's FIRST action is Phase 1 of that plan's execution, not Phase 0 of a replanning exercise.

**Example** (2026-04-23): user wrote "/execute /ultrathink PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md" — prior session drafted `handoff-for-new-session-glowing-popcorn.md` and ExitedPlanMode. User reprimanded both prior session (80%) and handoff wording (20%). Current session executed phases 0-8 directly and resolved adjudication items inline (xhigh CLI version clamp, jq absence → node, flock absence → mkdir lock).
