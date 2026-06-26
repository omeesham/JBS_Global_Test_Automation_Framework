---
name: Always run individual specs before full suite
description: After fixing specs, ALWAYS run each fixed spec individually before running the full suite — never skip to full run
type: feedback
---

After fixing specs, ALWAYS run each modified spec individually FIRST to verify the fix works. Never jump straight to a full suite run.

**Why:** Rutvik caught me skipping LR-018 step 3 — I wrote the rule into CLAUDE.md but didn't follow it myself. Running full suite without individual verification wastes 15 minutes if a fix is broken, and is "braindead" behavior. The pattern exists for a reason.

**How to apply:** Every spec-fixing session must follow LR-018 exactly:
1. Run all → identify failures
2. Run failing ones individually → classify
3. Fix and run individual → VERIFY FIX WORKS
4. Once all individual passes → run together
5. RCA any new failures
6. Iterate
Never skip step 3. Never.
