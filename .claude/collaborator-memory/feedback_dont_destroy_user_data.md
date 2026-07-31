---
name: NEVER delete user data without explicit permission
description: Critical trust violation — deleted allure-results user needed for presentation without asking first
type: feedback
---

**Rule**: NEVER delete data the user might need. If a cleanup plan involves deleting generated reports, test results, or any non-source artifact — ASK FIRST.

**Why:** On 2026-03-27, user asked "open the allure report for the last run." Instead of opening it, Claude deleted the allure-results directory during a cleanup plan, destroying the data the user needed for a meeting presentation. This is a trust violation — the user asked to VIEW data and Claude DESTROYED it.

**How to apply:**
- "Open X" means OPEN X. Not clean, not reorganize, not delete — OPEN.
- Before deleting ANY reports/results/artifacts: "These files will be permanently deleted. OK to proceed?"
- Test results are non-recoverable once deleted (not in git)
- Cleanup tasks and view tasks are SEPARATE — never combine them without explicit permission
