---
name: Handoff content belongs in chat, never in files
description: When Sonnet creates a handoff for Opus (MCP-blocked work), output it in chat — never write it to plans/ or any repo file
type: feedback
---

Never save Opus handoffs or "blocked work" summaries to the repository.

**Why:** A file in plans/pending/ is worthless — it adds repo noise, can't be copy-pasted directly, and won't be found by Opus without extra navigation. The user wants to copy-paste directly from chat to an Opus session.

**How to apply:** When Sonnet completes a partial execution and needs to hand off MCP-blocked steps:
1. Do all the Sonnet-safe file edits in the repo (selectors, test data, spec changes)
2. At the end, OUTPUT the full handoff in chat text (markdown, fenced code blocks, whatever is needed)
3. NEVER write `PLAN_*_OPUS_HANDOFF.md` or any handoff file to disk
4. If you already wrote a handoff file — delete it and re-output in chat
