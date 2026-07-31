---
name: Bug pattern learning cycle
description: When finding bugs, extract the pattern and sweep the entire codebase for similar instances — bugs repeat in different forms
type: feedback
---

Every bug found is a pattern to learn, not just an instance to fix.

**The cycle**: check → verify → learn → fix → repeat

**Why:** Bugs repeat in different forms. A §12 duplicate numbering bug in shared rules means ALL numbered sections across ALL docs could have the same issue. A stale `SetupSelectors` reference in one test plan means every test plan could have stale references. One area having a bug type means similar areas probably do too.

**How to apply:**
1. When you find a bug, immediately extract the PATTERN (not just the instance)
2. That pattern becomes a test case — sweep the ENTIRE codebase for similar instances
3. Store learned patterns in the /find-bugs skill's mental model for future sessions
4. Even if the subject is completely different, if it CAN have this type of bug, CHECK it
5. Never declare "found 2 bugs" without asking "could this same pattern exist in 50 other places?"

**Examples of pattern extraction:**
- Found: stale rename in 1 doc → Pattern: after any rename, grep ALL files (not just code)
- Found: duplicate section numbering → Pattern: after adding numbered items, verify sequence integrity
- Found: selector collision in 1 file → Pattern: after dedup, verify ALL consumers still resolve correctly
- Found: import path wrong after move → Pattern: after file moves, verify EVERY importer updated

**MANDATORY GATE**: Before declaring a bug count final, ask: "For each bug I found, did I sweep the codebase for the same pattern in different forms?" If NO for any bug → go back and sweep. The report is incomplete.

This principle applies to /find-bugs, /audit, /bugfix, and ANY skill that discovers issues. See also: [feedback_respect_plan_mode.md](feedback_respect_plan_mode.md) — the plan mode violation was itself a bug whose pattern (constraint rationalization) should have been swept.

This is CRITICAL to the /find-bugs skill (Step 5 in SKILL.md). The skill isn't "find bugs in what changed" — it's "find the pattern, then hunt it everywhere."
