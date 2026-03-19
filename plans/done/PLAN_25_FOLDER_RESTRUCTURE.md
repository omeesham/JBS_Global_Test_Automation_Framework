# PLAN 25: Folder Restructure

**Status**: Pending
**Depends on**: Plan 24
**Goal**: Clean monorepo — `website/` for JBS, Encore at root.

---

## Verified Facts
- JBSIntelliQE-develop/ has NO .git folder — simple rename safe
- No JBSIntelliQE-main/ exists

## Steps

### 1. Rename
```bash
mv JBSIntelliQE-develop website
```

### 2. Update `.gitignore` — append:
```
# Website (JBS IntelliQE)
website/frontend/node_modules/
website/backend/node_modules/
website/frontend/dist/
website/backend/dist/
website/frontend/.env
website/backend/.env
```

### 3. npm install in new locations
```bash
cd website/frontend && npm install
cd ../backend && npm install
```

---

## Result Structure
```
encore_framework/
├── website/              ← Colleague's React+Express app
│   ├── frontend/         ← Vite + React (port 5173)
│   └── backend/          ← Express (port 3001)
├── src/                  ← Encore framework
│   ├── server/           ← Fastify API (port 3100)
│   ├── orchestrator/     ← Pipeline engine
│   ├── worker/           ← Agent task executor
│   ├── pages/            ← Playwright page objects
│   └── selectors/        ← Test selectors
├── tests/                ← Playwright test specs
└── config/               ← Environment configs
```

## Verification
- `ls website/frontend/package.json` exists
- `ls website/backend/node_modules` exists
