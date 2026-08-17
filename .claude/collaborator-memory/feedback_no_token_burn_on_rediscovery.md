---
name: No token-burn on rediscovery — save artifacts, never relearn
description: When a workflow has been worked out once (ship-to-deliverable, push-pattern, etc.), persist it as a runbook/doc at the right scope (gitignored if internal). Future sessions read the runbook and execute, do NOT re-derive from scratch.
type: feedback
originSessionId: 24490f27-0129-4c8b-bffc-6b8e1626d79f
---
When Claude solves a multi-step operational workflow (deliverable push, force-push pattern, GA workflow trigger, etc.), the next time the same task comes up Claude must NOT re-explore + re-research + re-design. That's wasted tokens and wasted minutes.

**Why**: Rutvik 2026-05-04 — "remember that approach, never burn tokens again, keep things /simplify and /slop free... i dont want u burn 10 mins and damn tokens on doing one thing more than once".

**How to apply**:
- After solving any operational workflow that took >5 commands or >5 min of research, write a concise runbook (≤80 lines) capturing the exact commands.
- Place it at the **correct scope**:
  - **Per-client + internal-only** (e.g. ship-to-Encore): `clients/<id>/docs/read_only_docs/<NAME>.md` (gitignored at per-client level — `docs/read_only_docs/` is in `clients/<id>/.gitignore`).
  - **Cross-client framework workflow**: `docs/read_only_docs/<NAME>.md`.
  - **Identity / ownership / process**: graduate to `.claude/rules/` if it becomes a recurring rule.
- First example: `clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md` — push remediated deliverable + verify GA run, 6 commands.
- Future sessions: navigation.md routing entry → "I need to ship to Encore" → read the runbook, run the commands, done.
- If the workflow changes, **edit the runbook**. Never re-derive.

**Counter-pattern to avoid**: re-running 3 parallel research agents to figure out where the deliverable repo is, what branch is the GA target, how the push works, when the activity log already documented it 4 days ago. That's lazy — not researching, but lazy persistence.
