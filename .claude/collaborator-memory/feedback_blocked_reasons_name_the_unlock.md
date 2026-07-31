---
name: blocked-reasons-name-the-unlock
description: "A blocked/skipped test's reason must name the exact thing that would unblock it — not just assert it's impossible"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 487a8434-ae27-4514-8b9c-c30db5738943
  modified: 2026-07-20T11:43:56.570Z
---

When a test case is permanently blocked, the skip reason must state **the specific unlock** — the exact resource, access, or condition that would make it automatable — not merely that it is blocked or impossible.

**Why:** 2026-07-20, TC-CPR-OVR-041 (Non-Revenue-Management user sees a read-only Override grid) was permanently blocked because every automation account we hold has equivalent access. Claude framed it as "cannot be asserted, permanent deadlock." Rutvik corrected the framing: it is not impossible — *"if in future someone says we need to automate that case by giving us the required automation 2nd user with required access/denies, we can potentially automate."* The blocker is unblockable-by-us, not impossible. A reason that says "impossible" closes the door; one that names the unlock keeps the ask ready for whenever a client conversation opens it.

**How to apply:** write blocked reasons as `[blocked: <what is missing> — <what would unlock it>]`, e.g. "no non-Revenue-Management login exists on any account we hold; a second automation account without the 1101 RM role would make this automatable immediately." Same wording goes in the coverage-gap flag to Rutvik, so the ask is pre-written. Do not delete a permanently-blocked test that has a named unlock — keep it skipped as a documented deadlock (his call). Pairs with [[feedback_surface_coverage_gaps_loudly]] and [[feedback_discussion_item_not_bug]].
