---
name: feedback-build-first-review-last
description: "Under delivery pressure Rutvik wants build-first / review-last — cut review seats during build, ship, then deep-review and run specs"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 9155d849-19ce-4d79-aa95-696777b3dc97
  modified: 2026-07-27T14:57:59.646Z
---

**2026-07-27, standing until the corporate-override + test-case-restructure work ships:** cut the amount of reviewing done *during* build. Get things done first, review at the end. Ship as fast as possible, then do the deep reviews and the spec runs.

His words: "reduce the amt of reviews, focus on getting things done first, then review at last so we increase speed by not wasting time in reviewing everything done... i would also suggest shipping as fast as we can and then doing the reviews more in depth and the runs, etc.... we are under serious delivery pressure". He added "dont kill whats going on" — in-flight review work finishes, it just isn't waited on.

**Why:** delivery pressure. Review-per-artifact serialises the build behind a reviewer seat; the same review done once at the end catches the same defects at a fraction of the wall clock.

**How to apply:**
- Build dispatches get ONE worker, no paired reviewer seat. Accept on machine facts (`exit`, `ok`, `deliverable`) plus the static gates.
- Do not block a dependent wave on a review verdict. Fold late-arriving findings in when they land.
- Keep the cheap machine gates — typecheck, `--list`, generator build, deny-list scan. Those are gates, not reviews, and they are what stops a broken ship.
- The deep review and the spec runs move to AFTER the push, as their own pass.
- The push itself still halts for his explicit go — this speeds up building, not publishing.
- This overrides [[feedback_two_chiefs_always_default]] and the per-artifact cross-family review pairing **for the duration of this delivery only**. Two-seat review is the default again once shipped.
- Scales the same instinct as [[feedback_agent_cost_frugality]]: spend the budget where it changes the outcome.
