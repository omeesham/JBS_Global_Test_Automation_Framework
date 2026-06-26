---
name: Skill routing for tasks
description: Always use /planning, /questionnaire, /audit, /execute skills based on task context — never do raw work without the appropriate skill
type: feedback
---

When Rutvik gives a task, automatically route through the right skill(s):

- **`/planning`** — when the task requires designing an approach or creating a plan
- **`/questionnaire`** — when gaps/ambiguities exist and questions need answering before proceeding
- **`/audit`** — when reviewing work, verifying completeness, or post-execution scrutiny is needed
- **`/execute`** — when implementing/executing an approved plan

**Why:** Rutvik built these skills with specific discipline baked in (enemy audits, gap analysis, pre-research, etc.). Doing raw work without them bypasses that discipline and leads to sloppy output.

**How to apply:** For every task, assess which skill(s) apply and invoke them. Typical flows:
- New feature/change: `/planning` → `/questionnaire` → `/execute` → `/audit`
- Bug fix: `/questionnaire` (if unclear) → `/execute` → `/audit`
- Review/verify: `/audit`
- Be smart — not every task needs all four. Match the skill to what the task actually requires.
