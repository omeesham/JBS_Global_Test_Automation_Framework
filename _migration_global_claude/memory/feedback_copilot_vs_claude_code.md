---
name: Pipeline execution must use Claude Code, not Copilot
description: Copilot simulates the framework but can't enforce skills, TodoWrite, or identity loading — pipeline execution tasks must run on Claude Code
type: feedback
---

Pipeline execution (multi-file, multi-identity tasks like /execute, /chain, /ultrathink) must run on Claude Code, not GitHub Copilot.

**Why:** Copilot session on 2026-04-13 scored 62/100 executing SUBPLAN_HISTORY_02 despite the framework having every rule needed. Copilot can't enforce: Skill tool (reads full SKILL.md), TodoWrite (tracks items externally), identity loading (reads agent files), or context management (compression strategy). The model "simulated" the framework from pattern matching and skipped deliverables, ignored Phase 3.5 file moves, and self-justified substitutions.

**How to apply:** Copilot is fine for: code reviews, simple file edits, answering questions. Pipeline execution (/execute, /chain, /ultrathink, /planning with complex plans) should only run on Claude Code where tools enforce the workflow structurally.
