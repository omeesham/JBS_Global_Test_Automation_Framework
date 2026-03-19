# PLAN 32: Scope Revert — Production Config & Code Fallback Defaults

**Status**: PENDING
**Created**: 2026-03-12
**Priority**: P0

---

## Context

Plans 24-30 were executed in rapid succession on 2026-03-12 to integrate the colleague's React frontend into the Encore monorepo. The integration itself is sound — but three specific changes in Plan 26's execution exceeded their authorized scope by touching **production deployment config** and **code-level fallback defaults** when only the `.env.server` file needed updating.

### The Principle Violated

**Configuration governance has three tiers:**

| Tier | Example | Who decides | Risk of wrong change |
|------|---------|-------------|---------------------|
| Dev config | `.env.server`, `.env.development` | Any agent, any plan | Low — local only |
| Code defaults | `process.env.PORT \|\| '3001'` | Deliberate decision | Medium — affects all envs without override |
| Production config | `render.yaml`, `.env.production` | Human + deployment understanding | **High** — can break live service |

Plan 26 was authorized to fix the PORT conflict (Express on 3001 vs Encore on 3001). The correct fix was:
- `.env.server`: PORT=3100 — **Done correctly**
- Code fallbacks: Leave at 3001 (original developer intent) — **Changed to 3100 — exceeded scope**
- `render.yaml`: Don't touch — **Changed to 3100 — exceeded scope**

### Why This Matters

1. **`render.yaml` PORT**: Render.com provides PORT via environment variable. Hardcoding 3100 in the blueprint could conflict with Render's port assignment. The previous value (3001) was chosen by the original developer with knowledge of the deployment pipeline.

2. **Code fallback defaults**: The fallback `process.env.PORT || '3001'` only fires when `.env.server` fails to load. In that failure case, 3001 is safer because:
   - It's the original Fastify convention
   - `.env.server` correctly handles the 3100 override
   - If env loading breaks, falling back to 3100 silently masks the real problem

3. **Agent School verdict**: A separate audit confirmed the Agent School (Plan 30) IS the right solution for stateless sequential agents. It is the memory layer between sessions. **Do not revert Agent School.**

---

## Changes (3 edits + 1 verification)

### Change 1: `render.yaml` line 20 — Restore PORT to 3001

**File**: `render.yaml`
**Current**: `value: "3100"`
**Target**: `value: "3001"`
**Commit**: `fix(revert): restore render.yaml PORT to 3001 — production config not in scope`

### Change 2: `src/server/index.ts` line 24 — Restore fallback to 3001

**File**: `src/server/index.ts`
**Current**: `const PORT = parseInt(process.env.PORT || '3100', 10);`
**Target**: `const PORT = parseInt(process.env.PORT || '3001', 10);`
**Commit**: `fix(revert): restore server PORT fallback to 3001 — env file handles override`

### Change 3: `src/worker/index.ts` lines 14, 29 — Restore fallback to 3001

**File**: `src/worker/index.ts`
**Line 14 current**: `BACKEND_URL        — Backend API URL (default: http://localhost:3100)`
**Line 14 target**: `BACKEND_URL        — Backend API URL (default: http://localhost:3001)`
**Line 29 current**: `const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3100';`
**Line 29 target**: `const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';`
**Commit**: `fix(revert): restore worker PORT fallback to 3001 — env file handles override`

### Verification: `config/environments/.env.server` line 7 — DATABASE_URL prefix

**Check**: Must be `postgresql://postgres:admin@localhost:5432/postgres`
**Status**: ALREADY CORRECT — has `postgresql://` prefix. No change needed.

---

## What NOT to revert

| Item | Status | Reason |
|------|--------|--------|
| `.claude/` Agent School (all 11+ files) | KEEP | Viable and correct for stateless agent workflow |
| `.gitignore` changes | KEEP | Correct for monorepo structure |
| `website/` rename | KEEP | Clean folder structure |
| `.env.server` PORT=3100 | KEEP | Correct dev config override |
| `.env.server` BACKEND_URL | KEEP | Correct dev config |
| Vite dual-proxy config | KEEP | Correct for dual-backend routing |

---

## Post-Change Verification

1. `.env.server` still has PORT=3100 (untouched)
2. `render.yaml` has PORT=3001
3. `src/server/index.ts` fallback is '3001'
4. `src/worker/index.ts` fallback is 'http://localhost:3001'
5. DATABASE_URL has `postgresql://` prefix
6. `grep -rn "3100" src/server/index.ts src/worker/index.ts render.yaml` → zero matches
7. `grep -rn "3100" config/environments/.env.server` → PORT=3100 and BACKEND_URL (correct — env file is the override)

---

## Governance Lesson

**New rule for future plans**: Code defaults and production configs are not in scope for dev-environment plans. Only `.env.*` files and dev tooling (Vite, launch.json, docker-compose) are fair game. Anything touching `render.yaml`, `.env.production`, or code-level fallback defaults requires explicit human authorization.
