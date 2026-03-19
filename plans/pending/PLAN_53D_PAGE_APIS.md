# Plan 53D: Page + Artifact API Endpoints

**Priority**: 4
**Depends on**: 53B + 53C
**Parent**: PLAN_53_PIPELINE_UX_OVERHAUL.md

---

## Goal

Full CRUD for pages, artifacts, batch runs, and mode switching.

## New Route File: `src/server/routes/pages.ts`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/pages` | GET | List pages with stage statuses `?clientId=X&module=Y` |
| `/api/pages` | POST | Register a page |
| `/api/pages/:id` | GET | Page detail + stages + artifacts per stage |
| `/api/pages/:id` | PUT | Update page metadata |
| `/api/pages/:id` | DELETE | Delete page (cascades) |
| `/api/pages/:id/stages` | GET | Stage statuses for page |
| `/api/pages/:id/permit-explore` | POST | Grant explore-without-reqs `{ permittedBy }` |
| `/api/pages/tree` | GET | Tree structure `?clientId=X` |

## Artifact Mutation (add to pipeline routes)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/artifacts/:id` | PUT | Update content (creates version) |
| `/api/artifacts/:id` | DELETE | Soft-delete |
| `/api/artifacts/:id/versions` | GET | Version history |

## Batch + Mode Switch

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/pipeline/batch-run` | POST | Run stage for multiple pages `{ pageIds[], targetStage, mode, intent }` |
| `/api/pipeline/:id/mode` | PATCH | Switch auto↔manual mid-run |

## Modified Endpoints
- `POST /api/pipeline/run` — accepts `pageId`
- `GET /api/pipeline/list` — accepts `?pageId=X&batchId=X`
- `GET /api/pipeline/:id` — includes page object

## Frontend — `encoreApi.ts` + `types/index.ts`
- Add all page API functions + types
- Update `createPipelineRun()` to accept `pageId`

## New SSE Events — `types.ts`
- `page_stage_updated`, `cascade_progress`, `artifact_updated`, `mode_switched`

## Key Files
- Create: `src/server/routes/pages.ts`
- Modify: `src/server/index.ts`, `src/server/routes/pipeline.ts`, `encoreApi.ts`, `types/index.ts`, `orchestrator/types.ts`

## Guidance
- `listPages` JOIN query, not N+1
- Batch: validate per-page, return `{ started: [], skipped: [] }`
- Mode switch auto→manual: next stage waits. manual→auto: auto-approve if awaiting
- Register routes in `src/server/index.ts`
