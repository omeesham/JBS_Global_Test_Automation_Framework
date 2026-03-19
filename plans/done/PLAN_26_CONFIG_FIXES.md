# PLAN 26: Configuration Fixes (CRITICAL)

**Status**: Pending
**Depends on**: Plan 25
**Goal**: Fix port conflict + DB alignment so both backends coexist.

---

## The Problem
- Both backends default to port 3001 → crash on startup
- Encore DB: `postgres:postgres@localhost:5432/encore_db`
- JBS DB: `postgres:admin@localhost:5432/postgres`, schema `JBSTestOpsAI`
- Worker polls wrong BACKEND_URL

## File: `config/environments/.env.server`

### Surgical Changes (preserve all other variables):

| Variable | Current | New | Why |
|---|---|---|---|
| PORT | 3001 | **3100** | Avoid conflict with JBS Express |
| BACKEND_URL | http://localhost:3001 | **http://localhost:3100** | Worker polls correct port |
| DATABASE_URL | postgresql://postgres:postgres@localhost:5432/encore_db | **postgresql://postgres:admin@localhost:5432/postgres** | Match JBS credentials + shared DB |

### Variables that stay unchanged:
- WORKER_SECRET=dev-secret
- CORS_ORIGIN=http://localhost:5173 (already correct)
- HOST=0.0.0.0
- NODE_ENV=development
- LOG_LEVEL=info
- AUTO_MIGRATE=true
- WORKER_ID=local-worker-1

---

## Schema Safety
- JBS tables in schema `JBSTestOpsAI` (set via `SET search_path` in db.ts)
- Encore tables in schema `public` (default)
- Both use `IF NOT EXISTS` — zero collision

## Verification
```bash
grep "PORT\|DATABASE_URL\|BACKEND_URL" config/environments/.env.server
# Expected:
# PORT=3100
# BACKEND_URL=http://localhost:3100
# DATABASE_URL=postgresql://postgres:admin@localhost:5432/postgres
```
