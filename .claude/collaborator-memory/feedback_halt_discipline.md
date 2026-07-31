---
name: HALT discipline — pause only for scope/ambiguity, not for obvious fixes
description: When to HALT-and-ask vs. when to fix-and-log during multi-step R1-style fix passes. Wrong direction = wasted round-trips on every typecheck error.
type: feedback
originSessionId: 849dfb50-6af8-469d-9172-2f9f4035fcdf
---
# HALT discipline

If you can write the fix and recommend it in the same message as describing the bug, **just write it, log it as a deviation row, and keep moving**. Don't ask permission for the fix you're about to recommend.

**Why**: Auditor calibration 2026-05-01 (during PLAN_CLIENT_DELIVERABLE_REBUILD R1 fix pass). I HALTed at a 1-line typecheck error in `scripts/build-framework-vendor.ts:122` and presented Fix A vs. Fix B with a recommendation. Rutvik's reframe: "A typecheck error caught by the typecheck I asked you to run is not a surprise — it's the typecheck doing its job. You proposing Fix B with reasoning and then pausing for permission on it is a wasted round-trip."

**How to apply**:

**Worth halting** (genuine scope or ambiguity):
- Ship pipeline non-determinism beyond expected drift (`.vendor-meta.json` `builtAt` is expected; anything else is real).
- `npm test` failing with a real spec failure (not a config / import issue).
- Typecheck error that needs actual refactoring / scope discussion / multi-file coordination.
- Vendor build emits unexpected file structure.
- Anything where you genuinely don't know the right answer.
- Anything that changes plan scope / contract / acceptance criteria.

**NOT worth halting** (write the fix in the same breath):
- 1-line type fix with an obvious correct answer.
- Missing import / renamed reference.
- Defensive null check on a variable that's already guarded.
- Anything you'd write the fix for in the same message describing the bug.
- Defects in code authored *this same session* — fix and log; the deviation log is the audit trail.

**Rule of thumb**: when about to ask "may I apply Fix B?", ask yourself "could I have written the fix in the same message as describing the bug?" — if yes, do that instead. Bring a checkpoint at the END of the planned work block, not a permission check at every minor surprise.

**Pairs with**: `feedback_plan_deviations_log.md` — the deviation log is where fix-and-keep-moving decisions get audited after the fact, NOT in real-time chat.
