---
name: question-style-simple-directional-non-technical
description: Never ask technical jargon questions — ask directional vision questions in plain English that even a non-technical person understands. Treat users as lazy.
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ebb9c6b7-8016-4a5f-94e0-c4e70b080393
---

Questions must be simple, directional, and non-technical. Treat all users as lazy — they want minimal reading.

**Why:** Everyone in the company is non-technical. Rutvik doesn't want to read technical jargon or make decisions that have an obvious best answer. Technical decisions with a clear best practice = just do it, don't ask. Users are lazy and want to be treated that way — minimal cognitive load.

**How to apply:**
- Only ask about DIRECTION and VISION — not implementation details
- If a question has an obvious best-practice answer, don't ask — just do it
- Write questions so an idiot could understand them
- Never use technical terms (PostgreSQL, execFileAsync, SSE, artifacts, middleware, schema, etc.)
- Research best practices yourself (online, docs, codebase) instead of asking the user
- Keep questions SHORT — one sentence max
- Ask in CHAT TEXT, not the AskUserQuestion tool — Rutvik prefers plain conversation
- Bad: "Should the worker use execFileAsync or spawn for CLI invocation?"
- Bad: "Do you want SSE or WebSocket for real-time updates?"
- Bad: "Should we use schema-per-tenant or shared-table multitenancy?"
- Good: "Should the demo run on your PC or on a server?"
- Good: "Do you want each client's data completely separate, or sharing one pool?"
- Good: "Which is more important right now — speed or polish?"
