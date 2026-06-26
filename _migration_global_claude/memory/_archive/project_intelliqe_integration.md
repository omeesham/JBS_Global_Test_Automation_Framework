---
name: intelliqe-integration
description: Monorepo integration of JBSIntelliQE (colleague's React+Express QA platform) with Encore framework — verified facts and critical findings
type: project
---

## Integration Overview (started 2026-03-12)
- Colleague delivered JBSIntelliQE-develop/ — full React+Express QA platform with JIRA integration
- Merging into encore_framework as `website/` subfolder
- 3-server architecture: Frontend :5173, Express :3001, Fastify :3100
- Vite dual-proxy routes /api/pipeline, /api/events, /api/admin, /health → Encore; /api/* → Express

## Critical Verified Facts
- JBS has NO .git folder — simple rename safe
- JBS backend "dev" script: `tsx watch src/index.ts`
- JBS CORS: wide open (`app.use(cors())`)
- JBS DB: postgres:admin@localhost:5432/postgres, schema JBSTestOpsAI
- Encore .env.server must change: PORT=3100, BACKEND_URL=3100, DATABASE_URL aligned
- CORS_ORIGIN already http://localhost:5173

## ChatPage.tsx Critical Signatures
- `push('tessa', text)` — message function (line 251)
- `updatePipeline(key, status, detail)` — 3 args required
- `handleScriptGeneration` — already async (line 539), only call site: onClick (line 1304)
- Import convention: `@/` alias (tsconfig.app.json `"@/*": ["./src/*"]`)
- tsconfig: `noUnusedLocals: true` — dead code = compile error

## Encore SSE Events (verified from types.ts)
- stage_start: { type, runId, stage, agent, model, attempt, timestamp }
- stage_complete: { type, runId, stage, result, cost, duration, timestamp }
- pipeline_complete: { type, runId, status, totalCost, timestamp }
- artifact_ready: { type, runId, artifactId, name, artifactType, timestamp } — NO content in SSE
- error: { type, runId, message, timestamp }

## Colleague Divergence
INTEGRATION_CONTRACT.md asked for monochrome Encore-pipeline frontend (5 pages, 9 endpoints).
What was built: full QA platform with JIRA, 18 pages, own Express backend, 7 template agents.
This is fine — richer product — but integration connects two independent systems, not a frontend to its expected backend.
