---
name: pipeline-execution-must-use-claude-code-not-copilot
description: "Copilot simulates the framework but can't enforce skills, TodoWrite, or identity loading — pipeline execution tasks must run on Claude Code"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 13db75ca-25ea-40ee-bf91-e834882822d7
---

Pipeline execution (multi-file, multi-identity tasks like /execute, /chain, /ultrathink) must run on Claude Code, not GitHub Copilot.

**Why:** Copilot session on 2026-04-13 scored 62/100 executing SUBPLAN_HISTORY_02 despite the framework having every rule needed. Copilot can't enforce: Skill tool (reads full SKILL.md), TodoWrite (tracks items externally), identity loading (reads agent files), or context management (compression strategy). The model "simulated" the framework from pattern matching and skipped deliverables, ignored Phase 3.5 file moves, and self-justified substitutions.

**How to apply:** Copilot is fine for: code reviews, simple file edits, answering questions. Pipeline execution (/execute, /chain, /ultrathink, /planning with complex plans) should only run on Claude Code where tools enforce the workflow structurally.

**Scope note (2026-07-06):** this rule is about the 5-agent PIPELINE running ON Copilot (the 2026-04-13 62/100 incident). It does NOT mean Copilot is never used. `/ultra-agents` has a LOCAL-ONLY, git-excluded worker extension (`.claude/skills/ultra-agents/worker-ext.md`) where a Claude-orchestrated, Claude-gated Copilot CLI council (Opus 4.6 drafts → GPT-5.5 adversarially reviews → Claude final-gates) is the DEFAULT for critical artifacts. Claude stays orchestrator + gatekeeper — the pipeline itself still never runs on Copilot. Before answering any question about /ultra-agents delegation, READ that worker-ext.md file first; do not answer from this memory alone.
