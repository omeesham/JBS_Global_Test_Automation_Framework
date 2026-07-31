---
name: agent-cost-frugality
description: "CORE GOAL: save Claude tokens by every means that doesn't cost orchestration quality — delegation is the mechanism, token thrift is the point"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 774fd71b-8ed5-4be0-8a89-258efc16690f
---

**2026-07-14 — Rutvik states the core goal, above the task:** *"our core goal = save as much tokens for claude as possible in every sense without loosing claude's brain which helps orchestrate the delegation to copilot… anything that can help claude save tokens without loosing quality due to smartness in delegation = win"*

**Why:** Claude tokens are the scarce resource (5hr limit); the copilot council is flat-rate. So delegation is not a discipline ritual or a flow preference — **it is the token-saving mechanism, and token thrift is the goal it serves.** This reframes every enforcement artifact: the labor-gate that denies inline `npx playwright test` is not merely flow compliance — a suite's raw output flooding the context window is the single largest token drain in the loop. **Gate = token saver.**

The one thing NOT to economize on: Claude's orchestration brain — intent-reading, ticket authorship, interrogation of returns, final judgment. Cutting there is a false save; a bad ticket costs a re-run.

**How to apply:**
- Rank token drains and delegate the biggest first: raw suite/test output > browser walks + DOM dumps > verification batteries > drafting > diff line-reading.
- Read digests and named report sections, never whole reports; never line-read a diff after a green cross-family review.
- Prefer ONE targeted read-only command feeding an immediate dispatch decision over exploratory reading.
- Lean fan-outs; caps are ceilings, not targets. On any cost complaint mid-run: TaskStop, salvage from the journal, don't re-run completed stages.
- Earlier corrections that this supersedes-and-includes (2026-07-11, 31-agent deep-research): *"be slow on the damn trigger, my limits are going like crazy!"*

Related: [[copilot-takeover-system]], [[two-chiefs-always-default]], [[chat-simple-compaction]].
