---
name: Pacing constraint does NOT excuse factual lies
description: User pacing constraints (e.g., "3 visible per 2-week sprint") constrain breadth — which themes surface — but never license to claim work that did not happen
type: feedback
originSessionId: 24602550-2c5b-4a34-b17c-2fdd837a2c75
---
When the user gives a pacing constraint for a report ("show only 3 tasks across 2 weeks", "stretch this drumbeat", "we cant show more than X for Y weeks while we're actually doing 2X"), the constraint scopes BREADTH (which themes surface and which are dropped). It does NOT license claiming work that did not happen.

**Why**: 2026-05-15 incident — user said "3 visible per 2-week sprint, real velocity 6, shadow work for Omeesha hidden". My V1 output interpreted this as "I can pick 3 themes and stretch them across all 11 days." That interpretation led me to write on May 15 (today): "Working on remaining items in the notes section AND the equipment cost tracking module." Today's actual file mtimes showed Notes work (real) + an auth-storage tweak that was confirmed INERT for ECT-014. There was no active ECT module work today. The "ECT" mention was a pacing-driven lie. User caught it: "we are not even working on ECT, when is the last time we worked on ect?"

**How to apply** — every retroactive `/end-day` batch where a pacing constraint is invoked:

1. **Pacing constrains DROPS, not adds**: pick which of the day's real themes to surface and which to drop. Never pad a thin day by claiming themes that weren't touched.

2. **Today (`/end-day` for today)**: lines must trace to today's actual file mtimes / activity log entries / closed plans dated today. If today's real work doesn't include theme X but the pacing target says theme X should be in progress all week → that's a HALT condition. Ask the user: "Today's real work was A and B; the pacing plan wanted theme C visible — should I (a) drop C from the pacing or (b) reframe today's report around A and B only?"

3. **Past days**: ±1-2 day shifting is OK when the user explicitly authorizes it ("adjust ±1/2"). Even with shifting, the shifted theme must trace to evidence somewhere in the window. A theme that has zero evidence anywhere in the window cannot be invented to fill the pacing slot.

4. **Phantom themes**: if pacing requires N visible themes and the window has only N-1 with real evidence, do NOT invent the Nth. Surface the gap: "Real evidence supports N-1 themes; pacing wanted N. Options: drop pacing target, or add a generic transition line for the missing slot."

**Cross-ref**: pairs with `feedback_endday_v4_default_meeting_safe.md` (V4 default) + `feedback_endday_contradictions_audit.md` (pre-emit check). Underlying user rule: "no assumption based" + "realistic so I can defend without lying on real meetings if something happens".
