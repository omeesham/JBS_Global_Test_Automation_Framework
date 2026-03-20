# Encore Framework — Claude Code Configuration

## First-Time Setup (New Collaborators)

**On every session start**, check if `config/environments/.env.local` exists.
If it does NOT exist, this is a new collaborator. Run onboarding BEFORE any other work.

### Onboarding Flow

**Step 1 — Personalize your agent identity**

Ask the user: "What's your name?" Then:
- Copy `.claude/agents/COLLEAGUE.agent.md` → `.claude/agents/<NAME>.agent.md`
- In the new file: replace placeholder name with the user's actual name
- Replace `COLLEAGUE_AGENT` with `<NAME>_AGENT` throughout
- Update ownership sections based on what areas the user will work on
- Commit and push the new agent file so the team knows who they are

**Step 2 — Set up Encore credentials (Navigator Cloud SSO)**

Each collaborator needs their OWN Navigator Cloud test account. Ask the user for:
- Their Navigator Cloud email (Microsoft SSO)
- Their Navigator Cloud password
- Their MFA secret (Base32 TOTP seed, if MFA is enabled)

Then create their personal encrypted vault:
```bash
npm run vault:init                                        # Prompts for a NEW passphrase — pick your own, remember it
npm run vault:set NAVIGATOR_USERNAME your_email@domain.com
npm run vault:set NAVIGATOR_PASSWORD your_password
npm run vault:set NAVIGATOR_MFA_SECRET your_mfa_base32    # if MFA enabled
```

This creates `config/secrets/.vault.enc` encrypted with THEIR passphrase.
The vault file is gitignored — each developer has their own.

**Step 3 — Create `.env.local`**

```bash
cp config/environments/.env.example config/environments/.env.local
```

Edit `.env.local` and set:
- `VAULT_PASSPHRASE=<the passphrase you chose in Step 2>`
- All other defaults are fine for local development

**Step 4 — Install Claude CLI** (required for pipeline worker)

```bash
npm install -g @anthropic-ai/claude-code
claude login
```

Each person needs their own Claude subscription. Follow the auth prompts.

Verify:
```bash
claude --version
claude -p "respond with OK" --model haiku --max-turns 1
```

**Step 5 — Install dependencies + browsers**

```bash
npm install
npx playwright install
```

**Step 6 — Verify Encore pipeline works**

```bash
npm test -- --project=chrome tests/seed.spec.ts
```

This runs the auth smoke test. If it passes, Navigator Cloud credentials + vault are working.

**Step 7 — Full stack setup** (for website + pipeline UI work)

```bash
cp config/environments/.env.server.example config/environments/.env.server
# Edit .env.server: set ENCRYPTION_SECRET (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
cd website/frontend && npm install && cd ../..
cd website/backend && npm install && cd ../..
docker compose up -d                    # PostgreSQL
npm run server:start                    # Encore backend (port 3100)
cd website/backend && npm run dev       # Website backend (port 3001)
cd website/frontend && npm run dev      # Frontend (port 5173)
```

### SECURITY — NON-NEGOTIABLE
- NEVER commit `.env.local`, `.env.server`, or `.vault.enc` (all gitignored)
- NEVER hardcode credentials in any tracked file
- Each developer has their OWN vault with their OWN passphrase — never share
- If you find credentials in any tracked file, flag it immediately

---

## Skill Auto-Routing

When the user's message matches an intent pattern below, auto-invoke the corresponding skill.
If multiple intents match, use the FIRST matching rule. If the user explicitly names a skill (e.g., `/audit`), use that skill regardless of intent matching.

| Priority | Intent Pattern | Skill | Notes |
|----------|---------------|-------|-------|
| 1 | User explicitly says `/skillname` | That skill | Always highest priority |
| 2 | "fix bug", "broken", "not working", "error", "crash" | `/bugfix` | General bug fixing with root cause analysis |
| 3 | "deploy", "push to prod", "ship it", "go live" | `/deploy` | Full deployment pipeline |
| 4 | "clean up", "dead code", "remove unused", "orphaned" | `/cleanup` | Codebase hygiene |
| 5 | "review", "check this code", "code review", "PR" | `/review` | PR-style code review |
| 6 | "research", "best practices", "how do others" | `/research` | Multi-source web research |
| 7 | "audit", "find issues", "what's missing", "what broke" | `/audit` | Full-chain execution audit |
| 8 | "plan", "design", "how should we", "approach" | `/planning` | Rigorous plan creation |
| 9 | "run all plans", "execute pending", "chain", "autonomous" | `/chain` | Batch plan execution |
| 10 | "execute", "implement", "build this", "do it" | `/execute` | Disciplined plan execution |
| 11 | "reflect", "what did we learn", "session end" | `/reflect` | Session retrospective |
| 12 | "compile learnings", "graduate patterns" | `/compile-learnings` | Pattern graduation |
| 13 | "questions", "ask me", "steering" | `/questionnaire` | Dynamic Q&A |
| 14 | "KT", "knowledge transfer", "share learnings" | `/share-kt` | Cross-repo KT |
| 15 | "find bugs", "QA", "break it", "stress test", "what could go wrong" | `/find-bugs` | Adversarial bug hunting |
| 16 | "check for regressions", "did anything break", "fingerprint" | `/regression-guard` | Structural before/after diff |

### Multi-Intent Resolution
If the user's message spans multiple intents (e.g., "fix the bug then deploy"):
1. Identify each intent in the order they appear
2. Chain the skills in that order
3. Use `/execute` as the orchestrator if a plan is involved

### Ambiguous Intent
If intent is unclear, DO NOT auto-route. Ask the user which skill applies, or answer directly if no skill is needed.

---

## Skill Dependency Graph (Auto-Calls)

```
/planning ──auto-calls──> /research
/execute  ──auto-calls──> /regression-guard (before+after), /reflect
/bugfix   ──auto-calls──> /regression-guard (before+after), /reflect
/cleanup  ──auto-calls──> /regression-guard (before+after)
/deploy   ──auto-calls──> /regression-guard, /review
/chain    ──auto-calls──> /regression-guard, /reflect, /research
/audit    ──auto-calls──> /reflect

Leaf skills (no auto-calls):
  /regression-guard, /reflect, /compile-learnings, /research
  /review, /questionnaire, /share-kt
```

No circular dependencies exist. `/regression-guard` and `/reflect` are always leaves.

---

## Learned Rules

_Graduated from PLAN_53 chain audit (2026-03-20). 25 bugs found, 6 patterns extracted._

### LR-001: Verify function signatures before calling (3+ occurrences)
Before calling ANY function from another module: read its actual signature (params, types, return).
Never assume from the plan or memory. Wrong param = wrong data = silent corruption.
**Trigger**: Any plan that calls functions across files.

### LR-002: Catalog ↔ Implementation parity (1 occurrence, CRITICAL)
When adding entries to a catalog/registry/config (ACTION_CATALOG, route tables, SSE events):
MUST add corresponding implementation (case handler, route handler, event listener).
Catalog entry without implementation = advertised but broken feature.
**Trigger**: Any addition to lookup tables, switch statements, event maps.

### LR-003: No empty catch blocks (4+ occurrences)
FORBIDDEN: `catch { }`, `catch(() => {})`, `catch { /* ignore */ }`.
Every catch MUST: (1) re-throw, (2) set error state for UI, or (3) log + documented fallback.
Silent swallowing hides failures users can't diagnose.
**Trigger**: Every try/catch in new code.

### LR-004: React cleanup audit (1 occurrence)
Every setInterval, setTimeout, addEventListener, EventSource in React:
verify cleanup in useEffect return / useRef. No cleanup = memory leak.
**Trigger**: Any React component using timers/listeners/subscriptions.

### LR-005: useCallback/useEffect dependency audit (2 occurrences)
Before finalizing React hooks: verify every variable referenced in the body
is either (a) in the dependency array, or (b) accessed via useRef.
Stale closure = renders with old data = invisible bugs.
**Trigger**: Any useCallback, useMemo, useEffect in new code.

### LR-006: Validate external data structure before access (1 occurrence, CRITICAL)
Before accessing nested properties on data from APIs, files, or DB:
check structure exists first. Use optional chaining + fallback.
Never assume shape from plan/memory — the source may have changed format.
**Trigger**: Any code parsing API responses, file reads, or DB JSONB.
