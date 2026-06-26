---
name: Planning Workflow Requirements
description: When user says "create a plan" or uses /planning, must follow create → validation checklist → intent review → save to plans/pending/ workflow
type: feedback
---

When creating any plan, follow this strict workflow — no shortcuts:

1. **Create** the plan based on the request
2. **Validate** — single pass with embedded checklist:
   - [ ] Reference check (compare against recent completed plan)
   - [ ] Rules applied (every listed rule reflected in plan body)
   - [ ] Mistakes check (grep agent-mistakes.md for target module)
3. **Review** — re-read original intent word by word, compare to plan, fix all gaps
4. **Save** to `plans/pending/PLAN_XX_<NAME>.md`

**Why:** Rutvik found that first-draft plans consistently miss files and edge cases. The validation checklist catches these before execution. Originally 3 separate rounds (2026-03-15), collapsed to 1 atomic checklist (2026-04-09) for efficiency — same checks, fewer passes.

**How to apply:** Every time the user asks for a plan, or when using `/planning` skill. The `/planning` skill at `.claude/skills/planning/SKILL.md` codifies this workflow. "Ultrathink" in the user's message is a signal to apply this methodology.
