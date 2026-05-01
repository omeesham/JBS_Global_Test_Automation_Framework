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
| `utils/` | Pipeline-only helpers. Currently just `agent-notification-writer.ts`. Agent-public reporters stay at `src/utils/agent-reporter.ts`. |
| `scripts/` | Pipeline scripts — healer-post-complete, etc. |
| `tests/` | Pipeline unit tests + hook fixtures + framework example specs. |
| `tsconfig.json` | Pipeline-only tsconfig (was repo-root `tsconfig.server.json`). |

## Why it's NOT in `src/`

Path A contract (`PLAN_CLIENT_DELIVERABLE_REBUILD`):

- **`src/`** is "publishable by default" — every file in `src/` ends up in
  `clients/<id>/dist/framework/` via `scripts/build-framework-vendor.ts`.
- **`pipeline/`** is "internal by default" — never gets vendored, never ships,
  never appears in `git archive HEAD clients/<id>/`.

Putting pipeline runtime under `pipeline/` rather than `src/` means
`scripts/build-framework-vendor.ts` doesn't have to maintain an exclude list.
The directory boundary is the rule.

## Running pipeline pieces

From repo root:

```
npm run server:start    # Fastify backend (entry: pipeline/server/index.ts)
npm run worker:start    # Agent worker (entry: pipeline/worker/index.ts)
npm run db:migrate      # Schema bootstrap (uses pipeline/server/db/client.ts)
```

Cross-references that resolve to `pipeline/` are tracked in `package.json` scripts and
the npm `build:server` config (`tsc -p pipeline/tsconfig.json`).
