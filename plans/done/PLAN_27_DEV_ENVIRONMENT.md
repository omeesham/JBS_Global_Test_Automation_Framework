# PLAN 27: Development Environment

**Status**: Pending
**Depends on**: Plans 25, 26
**Goal**: Vite dual-proxy, startup script, Claude Preview config.

---

## Step 1: Update `website/frontend/vite.config.ts`

Replace single proxy `'/api': 'http://localhost:3001'` with ordered dual-proxy:

```typescript
proxy: {
  // Encore Fastify backend — SPECIFIC PATHS FIRST (Vite matches first-wins)
  '/api/pipeline': { target: 'http://localhost:3100', changeOrigin: true },
  '/api/events':   { target: 'http://localhost:3100', changeOrigin: true },
  '/api/admin':    { target: 'http://localhost:3100', changeOrigin: true },
  '/health':       { target: 'http://localhost:3100', changeOrigin: true },
  // JBS Express backend — CATCH-ALL LAST
  '/api':          { target: 'http://localhost:3001', changeOrigin: true },
}
```

**CRITICAL**: If `/api` is first, pipeline calls go to Express and fail silently.

### Route Map
| URL Pattern | Backend | Port |
|---|---|---|
| `/api/pipeline/*` | Encore Fastify | 3100 |
| `/api/events/*` | Encore Fastify | 3100 |
| `/api/admin/*` | Encore Fastify | 3100 |
| `/health` | Encore Fastify | 3100 |
| `/api/*` (catch-all) | JBS Express | 3001 |

---

## Step 2: Create `start-dev.bat` at repo root

Windows startup script:
- Checks Docker/native PG availability
- Starts Encore backend (:3100) via `npm run server:dev`
- Starts Website backend (:3001) via `cd website\backend && npm run dev`
- Starts Frontend (:5173) via `cd website\frontend && npm run dev`
- Prints URLs and login credentials (jbsadmin / Omeesha@19)

---

## Step 3: Create `.claude/launch.json`

```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "frontend", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 5173, "cwd": "website/frontend" },
    { "name": "website-backend", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 3001, "cwd": "website/backend" },
    { "name": "encore-backend", "runtimeExecutable": "npm", "runtimeArgs": ["run", "server:dev"], "port": 3100 }
  ]
}
```

---

## Verification
- Start all 3 servers
- `curl http://localhost:3001/api/health` → OK
- `curl http://localhost:3100/health` → OK
- http://localhost:5173 → landing page loads
