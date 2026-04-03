# Agent School — Orientation

> Two humans, two Claude Code agents, one shared repo. This is how we talk.

---

## What This Project Builds

Encore Framework is a Playwright TypeScript test automation system with a 5-stage AI pipeline (requirements, planning, generation, healing, audit) backed by a Fastify server, PostgreSQL, and a local worker. It generates, runs, and self-heals E2E tests for Navigator4, a Microsoft SSO enterprise web application.

IntelliQE (website/) is a React+Express QA platform built by a colleague. It provides the chat-based UI, JIRA integration, test case generation via keyword-matching templates, and all frontend chrome. The two systems merge into one monorepo: IntelliQE drives the UI, Encore drives the automation pipeline behind "Generate Automation Scripts."

---

## Who You Are Talking To

You are not talking to a human. You are talking to **another Claude Code agent** — one running in a different session, possibly on a different machine, with different context. Everything you write in channel files must be self-contained. No "as we discussed" — there was no discussion. No "you know the one" — they don't.

---

## School Rules

1. **Share discoveries immediately.** If you learn something non-obvious (a port conflict, an undocumented API shape, a build quirk), write it to `channel/broadcast/BROADCAST.md`.
2. **Flag uncertainty honestly.** "I think" and "I'm not sure" are acceptable. Fabricating confidence is not.
3. **Own your mistakes.** If you broke something, say what you broke, what you tried, and what state you left it in. The other agent will waste hours if you hide this.
4. **Read before writing.** Before modifying any shared file, read it. Your context is stale the moment the other agent pushes.
5. **Never overwrite inbox messages.** Append only. Messages are immutable once written.
6. **Use the protocol.** Every message in `channel/` follows the format in `PROTOCOL.md`. No freeform.
7. **Know your identity.** Before pipeline work, set identity via `/identity`. Your identity determines what files you can write, what tools you can use, and which rules apply. Operating without identity on pipeline tasks = unscoped edits = audit violations.

---

## Navigation

| File | What It Contains |
|------|-----------------|
| [`PROTOCOL.md`](PROTOCOL.md) | Message format, types, channel architecture |
| [`context/VISION.md`](context/VISION.md) | Product vision (2 paragraphs) |
| [`context/CURRENT_STATE.md`](context/CURRENT_STATE.md) | Live project status — updated every session |
| [`context/WORKFLOW.md`](context/WORKFLOW.md) | Git rules, token passing, directory ownership |
| [`context/CURRENT_OWNER.md`](context/CURRENT_OWNER.md) | Who holds the push token right now |
| [`agents/RUTVIK.agent.md`](agents/RUTVIK.agent.md) | Rutvik's agent persona, ownership, priorities |
| [`agents/COLLEAGUE.agent.md`](agents/COLLEAGUE.agent.md) | Template — copy and personalize for new collaborators |
| [`channel/inbox/RUTVIK_AGENT.md`](channel/inbox/RUTVIK_AGENT.md) | Messages for Rutvik's agent |
| [`channel/inbox/COLLEAGUE_AGENT.md`](channel/inbox/COLLEAGUE_AGENT.md) | Messages for colleague's agent |
| [`channel/broadcast/BROADCAST.md`](channel/broadcast/BROADCAST.md) | Discoveries visible to all agents |

---

## Pre-Flight: Environment Check

Before the startup sequence, verify the user has a working environment:

1. Check `config/environments/.env.local` exists → if missing, follow the First-Time Setup in `CLAUDE.md`
2. Check `config/environments/.env.server` exists → if missing, copy from `.env.server.example`
3. Check Docker is running: `docker ps` should show `intelliqe_postgres`
4. Check dependencies: `node_modules/` should exist in root, `website/frontend/`, and `website/backend/`

If ANY check fails, resolve it before proceeding to the startup sequence.

---

## Startup Sequence (Read In This Order)

1. **This file** — you're here
2. **`context/VISION.md`** — understand what we're building
3. **`context/CURRENT_STATE.md`** — understand where we are right now
4. **`context/WORKFLOW.md`** — understand how we coordinate
5. **Your agent file** (`agents/RUTVIK.agent.md` or `agents/<YOUR_NAME>.agent.md`) — understand your role. If your personal agent file doesn't exist yet, create one from `agents/COLLEAGUE.agent.md` template.
5b. **Set your identity** — If doing pipeline work, run `/identity` to adopt the correct agent persona (HUNTER, GIVER, BUILDER, HEALER, WATCHDOG, GARDENER). For general framework work, `/identity OWNER`. This enforces file ownership, tool restrictions, and rules filtering for your session.
6. **`channel/inbox/<YOUR_NAME>.md`** — check for messages
7. **`channel/broadcast/BROADCAST.md`** — catch up on discoveries

Only after reading all 7 should you start working. If `CURRENT_STATE.md` mentions a blocker, resolve it before doing anything else.

---

## CLI Quick Reference

```bash
node scripts/agent-channel.mjs school                       # Print this orientation
node scripts/agent-channel.mjs state                        # Print CURRENT_STATE.md
node scripts/agent-channel.mjs inbox [rutvik|colleague]      # Read your inbox
node scripts/agent-channel.mjs broadcast                    # Read all discoveries
node scripts/agent-channel.mjs token [rutvik|colleague]      # Check or pass the push token
node scripts/agent-channel.mjs handoff                      # Generate a HANDOFF message template
node scripts/agent-channel.mjs send <to> <TYPE> "<subject>" # Start composing a message
```
