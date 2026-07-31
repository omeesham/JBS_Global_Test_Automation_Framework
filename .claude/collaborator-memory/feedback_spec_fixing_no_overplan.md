---
name: Don't over-plan spec fixing
description: When fixing failing specs, skip /planning ceremony — just run, observe, RCA from evidence, fix
type: feedback
---

When user says "fix failing spec", do NOT invoke /planning with elaborate ceremony.
Just do: clean → run → run again → RCA from evidence → fix → verify.

**Why:** Session 2026-04-02 — user corrected with "the plan is to run the spec, find failures, run again, find failures, /rca and fix it". Elaborate planning delays action and the root cause is completely unknown until you see the actual failure. You can't plan a fix for something you haven't observed.

**How to apply:** For spec-fixing sessions, skip /planning formality. Go straight to clean + run. Only plan AFTER you have fresh evidence of the actual failure. The evidence IS the plan.
