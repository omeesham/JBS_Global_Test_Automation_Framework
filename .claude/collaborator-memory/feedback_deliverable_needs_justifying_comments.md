---
name: feedback_deliverable_needs_justifying_comments
description: Anything kept in a client deliverable must carry a client-readable comment justifying why it is there; if it cannot be justified in plain English it does not ship
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 97fc2a8f-d682-49e5-ad02-431273e486b4
  modified: 2026-07-30T15:09:59.509Z
---

Every file, folder, and non-obvious block that survives into a client deliverable must carry a
short comment, in the client's own vocabulary, saying **why it is there**. Stated 2026-07-30
during the `encore_deliverables_test` over-ship audit: *"we need to put justifying relevant
comments if its needed!"* — paired with *"ppl wont like to see it there!"*

**Why:** the deliverable's audience is an external QA team with zero knowledge of our repo,
our tickets, our agents, or our process. An unexplained file reads as either a mistake or a
leak, and both cost credibility. The justification comment is the test: if the reason cannot be
written in plain client-facing English, the thing has no business shipping.

**How to apply:**
- Two-outcome gate per item — either (a) it is needed AND carries a plain-English justifying
  comment, or (b) it is dropped. There is no third state of "needed but unexplained".
- The comment explains the value to THEM, not the history to us. No ticket IDs, no internal
  process words ("graft", "lot", "subplan", "walk", "denominator"), no agent or tool names.
- Applies to config blocks and directory-level `README` notes too, not just source comments —
  a `tests/_unit/` folder or an extra Playwright project needs the same justification.
- This is a SHIP-TIME gate, not an authoring-time nicety: run it against the payload that is
  about to leave, because content arrives in the payload from grafts and merges that never
  passed through a normal review.
- Related: [[feedback_endday_strip_agent_framework_language]] (same translate-to-plain-English
  discipline, applied to reports rather than shipped code), and LR-058 in
  `.claude/rules/deliverable.md` (no internal jargon in shipped client source).
