---
name: Execute and Audit Discipline
description: Never implement plans blindly — always research first, find gaps, then audit post-execution focusing on what was NOT done
type: feedback
---

Two mandatory disciplines when working with plans:

**Execution (`/execute` skill):**
- NEVER implement a plan blindly — research every file it mentions first
- Hunt for gaps: grep changed patterns across ENTIRE codebase, not just listed files
- Find missed items, overlooked files, edge cases, improvements
- Post-execution: audit against plan AND original intent before declaring done

**Audit (`/audit` skill):**
- Compare the full chain: original prompt → intent → vision → plan → changes to plan → execution → post-execution
- Focus on what was NOT done, not what was done — QA mindset
- Why were files skipped? Why were cases skipped? Why were scenarios missed?
- Every audit produces a structured verdict with chain integrity, missing items, risks, recommendation

**Why:** Rutvik found that plans get implemented with blind trust, missing files and edge cases that a proper QA review would catch. The execution phase needs its own research step, and audit must trace back to original intent. Formalized 2026-03-15.

**How to apply:** Every time executing a plan (regardless of source) or auditing completed work. Skills live at `.claude/skills/execute/SKILL.md` and `.claude/skills/audit/SKILL.md`. "Ultrathink" in user's message signals to apply maximum rigor.
