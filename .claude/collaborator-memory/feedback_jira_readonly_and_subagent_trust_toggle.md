---
name: feedback_jira_readonly_and_subagent_trust_toggle
description: Assistant-layer arms default to Claude (trusted more than subagents); Jira is READ-ONLY with no write grant; subagent access to any arm is off-by-default toggle
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e564a2f1-93bf-4e23-961c-0c6daa3a566e
---

Two standing rules for the assistant delegation layer's "arms & legs" (A4), set by Rutvik 2026-07-13:

1. **Jira/Confluence = READ-ONLY.** No write grant at all — Rutvik holds Jira edit (comments, transitions, create) himself until he explicitly lifts the hold. Claude never calls an Atlassian write tool; workers get zero Atlassian access.
2. **Trust Claude over subagents.** Every arm (Atlassian-read, `--add-dir`, `--allow-url`, web research) defaults to CLAUDE doing it. Worker/subagent access to any arm ships **toggle OFF by default** and is enabled only if/when Rutvik explicitly asks ("keep it as a toggle for future if I ask"). Structurally aligned: the dispatch wrapper already confines worker paths to the repo, so out-of-repo arms are worker-unreachable without a protected wrapper edit.

**Why:** "make sure its read only, edit i do not want to give for now ... i do not trust subagents as much as claude ... keep it as a toggle for future if i ask." He wants capability built but defaulting to the trusted actor, with worker-enablement gated behind his explicit go.

**How to apply:** when wiring or using any delegated capability, route it through Claude by default; treat worker-enablement as a documented, off-by-default toggle needing Rutvik's ask. Never grant Jira write. Deny-boundaries live in `~/.claude/delegation/arms-inventory.md`. Relates to [[feedback_copilot_vs_claude_code]] and [[feedback_agent_cost_frugality]].
