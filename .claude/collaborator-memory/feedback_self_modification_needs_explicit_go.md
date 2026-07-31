---
name: feedback-self-modification-needs-explicit-user-go
description: "Claude Code's permission classifier blocks agent writes to its own hook/permission layer (~/.claude/hooks, settings.json hook registration) even after plan approval — needs the user's direct in-chat go or a Bash permission rule"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 13db75ca-25ea-40ee-bf91-e834882822d7
---

Plan approval (ExitPlanMode accept, /execute) is NOT sufficient authorization for the agent to modify its own permission/hook system — the auto-mode classifier denied `mkdir ~/.claude/hooks` (prep for a PreToolUse guard hook) as [Self-Modification] on 2026-07-06, reasoning the user "never specifically requested a hook-based gate" even though the hook was an approved plan item (R6b, ultra-agents worker guard).

**Why:** hooks gate the agent's own tool calls; the classifier requires the USER to specifically request that class of change, not just approve a plan that contains it.

**How to apply:** when a plan includes writing/registering hooks (or editing `~/.claude/settings.json` / `.claude/settings*.json` hook blocks), tell the user up front that this step will need their explicit in-chat go (or a Bash permission rule) at execution time — ask for it at plan approval, don't discover the block mid-execute. Related: [[feedback-respect-plan-mode]].
