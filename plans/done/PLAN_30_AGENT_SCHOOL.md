# PLAN 30: Agent School — Inter-Agent Communication System

**Status**: Pending
**Depends on**: Nothing (can be done in parallel with Plans 24-28)
**Goal**: Build a git-tracked communication system for cross-agent collaboration.

---

## Why It Exists
Rutvi and her colleague both work with their own Claude Code agents. The agents talk to each other through structured markdown files that travel via git push/pull. No Slack, no emails — just structured files.

---

## File Structure

```
.claude/
├── AGENT_SCHOOL.md              ← Orientation (what, who, rules, nav table, startup sequence)
├── PROTOCOL.md                  ← Message contract (format, types, channel architecture)
├── launch.json                  ← (created in Plan 27)
├── context/
│   ├── VISION.md                ← Product vision (2 paragraphs)
│   ├── CURRENT_STATE.md         ← Live status (updated every session)
│   ├── WORKFLOW.md              ← Git rules (token passing, directory ownership)
│   └── CURRENT_OWNER.md         ← Who holds the push token
├── agents/
│   ├── RUTVI.agent.md           ← Rutvi's agent persona, ownership, priorities
│   └── COLLEAGUE.agent.md       ← Colleague's agent persona and onboarding
└── channel/
    ├── inbox/
    │   ├── RUTVI_AGENT.md       ← Messages for Rutvi's agent
    │   └── COLLEAGUE_AGENT.md   ← Messages for colleague's agent (seeded with HANDOFF)
    └── broadcast/
        └── BROADCAST.md         ← Discoveries for all agents (seeded with 5 findings)
```

---

## File Contents

### AGENT_SCHOOL.md
- What this project builds (2-paragraph vision)
- Who agents are talking to (other agents, not humans)
- School rules (share discoveries, flag uncertainty, own mistakes, read before writing)
- Navigation table pointing to every other file
- Startup sequence: what to read in what order

### PROTOCOL.md
- Channel architecture (inbox vs broadcast)
- Message format: FROM, TO, DATE, SESSION, TYPE, PRIORITY, REQUIRES_RESPONSE, CONTEXT_SNAPSHOT + body
- Message types: QUESTION, DECISION, BLOCKER, UPDATE, DISCOVERY, HANDOFF, REVIEW_REQUEST
- Good vs bad handoff examples
- When to ask human vs resolve between agents

### WORKFLOW.md
- Token passing model (one person pushes at a time)
- CURRENT_OWNER.md as the live token file
- Directory ownership table
- Single-branch strategy (main only)
- Pre-push checklist, commit conventions

### Seed BROADCAST.md with 5 discoveries:
1. Port conflict: both backends defaulted to 3001
2. DB credential mismatch: Encore used `postgres:postgres`, JBS uses `postgres:admin`
3. Template generation is NOT mock — it's keyword matching + templates, runs in <100ms
4. Vite proxy order matters — specific paths BEFORE catch-all
5. 5 mock pages are intentional — don't wire them to APIs

### Seed COLLEAGUE_AGENT.md inbox with HANDOFF:
FROM: RUTVI_AGENT, TYPE: HANDOFF, asking 4 questions about integration readiness

---

## CLI Tool: `scripts/agent-channel.mjs`

Node.js ESM script:
```
node scripts/agent-channel.mjs school                      ← onboarding
node scripts/agent-channel.mjs state                       ← current state
node scripts/agent-channel.mjs inbox [rutvi|colleague]     ← read inbox
node scripts/agent-channel.mjs broadcast                   ← read broadcast
node scripts/agent-channel.mjs token [rutvi|colleague]     ← check/pass token
node scripts/agent-channel.mjs handoff                     ← generate template
node scripts/agent-channel.mjs send <to> <TYPE> "<subject>"← start message
```

---

## Verification
- All .claude/ files exist and are readable
- `node scripts/agent-channel.mjs school` prints onboarding summary
- `node scripts/agent-channel.mjs inbox colleague` shows the seeded HANDOFF
- `node scripts/agent-channel.mjs broadcast` shows 5 seeded discoveries
