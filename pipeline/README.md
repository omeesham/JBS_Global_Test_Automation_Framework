# pipeline/ — Internal-Only Runtime

**Never ships to clients.**

This directory holds the 5-agent pipeline runtime that powers requirements gathering,
planner work, generator work, healer/RCA, and audit closures. None of it is part of any
client deliverable.

## What lives here

| Subdir | Purpose |
|---|---|
| `orchestrator/` | 5-agent dependency-aware queue runner (gate-runner, dependency-engine, failure-classifier, artifact-validator). |
| `server/` | Fastify backend + Postgres queries + REST routes that serve the agent UI. |
| `worker/` | Agent worker runtime — SDK executor, progress extractor, worker manager. |
| `utils/` | Pipeline-only helpers. Currently just `agent-notification-writer.ts`. Agent-public reporters live per-client at `clients/<id>/src/utils/agent-reporter.ts`. |
| `scripts/` | Pipeline scripts — healer-post-complete, etc. |
| `tests/` | Pipeline unit tests + hook fixtures + framework example specs. |
| `tsconfig.json` | Pipeline-only tsconfig (was repo-root `tsconfig.server.json`). |

## Why it's NOT in `src/`

Pipeline ↔ client separation (post-2026-05-19 notes-structure mirror):

- **`pipeline/`** is "internal by default" — orchestrator, server, worker, agent-notification-writer. Never ships, never appears in `git archive HEAD clients/<id>/`.
- **`clients/<id>/src/`** is "shippable by default" — each client's framework code lives self-contained inside its own directory.
- **Root `src/`** is shared infrastructure used by `pipeline/` (and historically vendored to clients pre-2026-05-19). No longer vendored — `PLAN_ROOT_CLIENT_DEDUPE.md` tracks orphan-cleanup.

The directory boundary is the rule — anything under `pipeline/` is excluded from client deliverables by `git archive HEAD clients/<id>/` mechanically.

## Running pipeline pieces

From repo root:

```
npm run server:start    # Fastify backend (entry: pipeline/server/index.ts)
npm run worker:start    # Agent worker (entry: pipeline/worker/index.ts)
npm run db:migrate      # Schema bootstrap (uses pipeline/server/db/client.ts)
```

Cross-references that resolve to `pipeline/` are tracked in `package.json` scripts and
the npm `build:server` config (`tsc -p pipeline/tsconfig.json`).
