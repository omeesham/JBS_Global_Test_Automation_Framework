# Protocol — Inter-Agent Message Contract

---

## Channel Architecture

```
channel/
├── inbox/
│   ├── RUTVIK_AGENT.md        ← Only Rutvik's agent reads; colleague's agent writes
│   └── COLLEAGUE_AGENT.md    ← Only colleague's agent reads; Rutvik's agent writes
└── broadcast/
    └── BROADCAST.md          ← Both agents read and write
```

**Inbox**: Point-to-point. You write to the other agent's inbox, never your own. You read your own inbox, never theirs.

**Broadcast**: Shared discovery log. Both agents read and append. Used for facts, not conversations.

---

## Message Format

Every message in an inbox file follows this exact structure:

```markdown
---
FROM: RUTVIK_AGENT | COLLEAGUE_AGENT
TO: RUTVIK_AGENT | COLLEAGUE_AGENT | ALL
DATE: 2026-03-12T14:30:00Z
SESSION: <short session identifier, e.g. "plan-30-execution">
TYPE: QUESTION | DECISION | BLOCKER | UPDATE | DISCOVERY | HANDOFF | REVIEW_REQUEST
PRIORITY: LOW | MEDIUM | HIGH | CRITICAL
REQUIRES_RESPONSE: true | false
CONTEXT_SNAPSHOT: <1-line summary of what you were working on when you wrote this>
---

<message body — as detailed as needed, with code blocks, file paths, anything>
```

All fields are required. No exceptions.

---

## Message Types

| Type | When to Use | Requires Response? |
|------|------------|-------------------|
| `QUESTION` | You need information the other agent has | Always `true` |
| `DECISION` | You made a choice that affects shared code | `false` (unless controversial) |
| `BLOCKER` | You are stuck and cannot proceed without the other agent | Always `true`, always `HIGH` or `CRITICAL` |
| `UPDATE` | Status update — what you did, what's next | `false` |
| `DISCOVERY` | You found something non-obvious (also post to broadcast) | `false` |
| `HANDOFF` | You are done with your part, handing off to the other agent | Always `true` |
| `REVIEW_REQUEST` | You want the other agent to review your work | `true` |

---

## Broadcast Format

Broadcast entries are simpler — just numbered discoveries:

```markdown
## #<number> — <title>
**By**: RUTVIK_AGENT | COLLEAGUE_AGENT
**Date**: 2026-03-12
**Context**: <what you were doing when you found this>

<description — concise, factual, with file paths if relevant>
```

Always increment the number. Never edit existing entries.

---

## Good vs Bad Handoff Examples

### Good Handoff

```markdown
---
FROM: RUTVIK_AGENT
TO: COLLEAGUE_AGENT
DATE: 2026-03-12T16:00:00Z
SESSION: plan-28-encore-integration
TYPE: HANDOFF
PRIORITY: HIGH
REQUIRES_RESPONSE: true
CONTEXT_SNAPSHOT: Finished wiring encoreApi.ts into ChatPage.tsx
---

## What I Did
- Created `website/frontend/src/services/encoreApi.ts` with 9 API functions
- Modified `ChatPage.tsx` handleScriptGeneration to call Encore pipeline with SSE fallback
- Fixed EventSource leak (useRef + useEffect cleanup)

## What You Need To Do
- Wire Dashboard, AgentMonitor, Execution, Settings pages to real Encore data (Plan 29)
- Each page should import from `@/services/encoreApi`
- Keep existing mock data as fallback when API calls fail

## Known Issues
- Docker and PostgreSQL not installed — backends can't actually run yet
- `noUnusedLocals: true` in tsconfig — any unused import = build failure

## Files I Changed
- `website/frontend/src/services/encoreApi.ts` (new)
- `website/frontend/src/pages/ChatPage.tsx` (modified lines 539-620)
```

### Bad Handoff

```
hey, I finished the API stuff. ChatPage should work now. Let me know if you have questions.
```

Why it's bad: No file paths, no specifics, no known issues, no context. The receiving agent has to reverse-engineer everything.

---

## When to Ask Human vs Resolve Between Agents

**Ask the human when:**
- Architectural decisions that change the product direction
- Deleting files or removing features
- Spending money (API keys, deployments, services)
- Security decisions (credentials, permissions, auth flows)
- Anything that can't be undone with `git revert`

**Resolve between agents when:**
- Code style disagreements
- Which file to put something in
- Order of operations for non-destructive changes
- Bug fixes where the fix is obvious
- Documentation updates
