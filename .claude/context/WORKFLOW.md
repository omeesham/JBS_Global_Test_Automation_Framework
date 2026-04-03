# Workflow — Git Rules & Directory Ownership

---

## Token Passing Model

Only one person pushes at a time. The push token is tracked in `CURRENT_OWNER.md`.

**Rules:**
1. Before you push, check `CURRENT_OWNER.md`. If it's not you, **do not push**.
2. When you receive the token (via HANDOFF message or direct assignment), update `CURRENT_OWNER.md` to your name.
3. When you're done with your batch of changes, write a HANDOFF message to the other agent's inbox and update `CURRENT_OWNER.md` to their name.
4. If you need the token urgently, write a `BLOCKER` message with `PRIORITY: CRITICAL` to the other agent's inbox. Do not force-take the token.

---

## Directory Ownership

| Directory | Owner | Can Modify |
|-----------|-------|-----------|
| `src/` (all subdirectories) | Rutvik's agent | Rutvik's agent only |
| `tests/` | Rutvik's agent | Rutvik's agent only |
| `scripts/` | Rutvik's agent | Rutvik's agent only |
| `config/` | Rutvik's agent | Rutvik's agent only |
| `.github/agents/` | Rutvik's agent | Rutvik's agent only |
| `docs/` | Rutvik's agent | Rutvik's agent only |
| `plans/` | Rutvik's agent | Rutvik's agent only |
| `website/frontend/` | Colleague's agent | Both (shared integration surface) |
| `website/backend/` | Colleague's agent | Colleague's agent only |
| `.claude/` | Shared | Both (append-only for channel files) |
| Root config files | Rutvik's agent | Rutvik's agent only |

**Shared integration surface**: `website/frontend/` is where the two systems meet. Both agents may need to modify files here (e.g., Rutvik wiring `encoreApi.ts`, colleague building UI components). Coordinate via HANDOFF messages before touching the other agent's recent work.

**Identity enforcement**: In Claude Code sessions, directory ownership is enforced by the `/identity` skill. See `AGENT_SHARED_RULES.md §2.1` for rules ALL-066 through ALL-069. Pipeline identities map to the §2 ownership columns. OWNER identity has RW on framework/infra paths.

---

## Branch Strategy

**Single branch: `main`**. No feature branches, no PRs between agents.

Why: Two agents on one branch is simpler than merge conflicts across branches. The token model prevents concurrent pushes. If something breaks, `git revert` is one command away.

---

## Pre-Push Checklist

Before pushing, verify:

1. `CURRENT_OWNER.md` says it's your turn
2. `git pull` — incorporate any changes from the other agent
3. No build errors (`npm run build` or `npx tsc --noEmit` for relevant workspace)
4. No unintended file changes (`git diff --stat`)
5. Commit message follows convention (below)
6. Update `CURRENT_STATE.md` with what you did
7. If handing off: write HANDOFF message, update `CURRENT_OWNER.md`

---

## Commit Message Convention

```
<type>(<scope>): <short description>

<optional body — what changed and why>

Agent: RUTVIK_AGENT | COLLEAGUE_AGENT
Plan: <plan number if applicable>
```

**Types**: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`

**Scopes**: `encore`, `website`, `pipeline`, `agents`, `config`, `school`

**Examples:**
```
feat(website): wire Dashboard to Encore admin API

Added getAdminUsage() and listPipelineRuns() calls with mock fallback.

Agent: RUTVIK_AGENT
Plan: 29
```

```
fix(encore): correct worker heartbeat interval

Was polling every 30s, should be 5s per pipeline-definition.json.

Agent: COLLEAGUE_AGENT
```
