---
name: ultrathink enforcement
description: When user says "ultrathink" — /ultrathink skill auto-fires via priority 0.5 routing, creating quality gates and wrapping sub-skills with adversarial audits
type: feedback
---

The `/ultrathink` skill now handles this structurally via auto-routing (priority 0.5 in CLAUDE.md).

When "ultrathink" is detected in a user message, the skill auto-fires and:
1. Creates TodoWrite quality gates as FIRST action (Step 0)
2. Delegates to /planning, /execute, /audit as needed (Steps 1-4)
3. Runs adversarial plan audit between planning and execution (Step 3)
4. Verifies all gates completed before declaring done (Step 5)
5. Runs /reflect + LR-028 (Step 6)

**Why:** On 2026-04-08, "ultrathink" was said but all quality gates were skipped. Initial fix was a feedback memory (this file) — but that's a reference, not an embedded step, violating feedback_embed_not_reference.md. A SKILL with auto-routing IS structural enforcement: the skill fires before task thinking begins, no voluntary compliance needed.

**How to apply:** Auto-routing handles it. If the skill somehow doesn't fire (edge case), fallback: create TodoWrite items manually for the 3 gates BEFORE starting any other work.
