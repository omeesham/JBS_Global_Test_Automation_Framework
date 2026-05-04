# Rutvik's Agent — RUTVIK_AGENT

---

## Identity

- **Human**: Rutvik
- **Agent name**: RUTVIK_AGENT
- **Tool**: Claude Code (CLI)
- **Primary workspace**: `encore_framework/` (repo root)

---

## Ownership

| Area | What |
|------|------|
| Framework source (vendored to clients) | `src/{common,utils,data,framework-contracts}/` (root — ships to `clients/<id>/dist/framework/`) |
| Per-client surface (Encore) | `clients/encore/src/{pages,selectors}/`, `clients/encore/tests/`, `clients/encore/api-testing/`, `clients/encore/config/` |
| Pipeline backend (internal-only) | `pipeline/{orchestrator,server,worker,utils,tests}/` |
| Pipeline agents | `.claude/agents/` (Generator, Healer, Audit, Maintainer, Planner, Requirements) |
| Scripts & tooling | `scripts/`, root `config/` |
| Plans & docs | `plans/`, `docs/` |
| Integration glue | Vite/proxy configs, root `playwright.config*.ts`, per-client `clients/<id>/playwright.config.ts` |

---

## Priorities (as of 2026-03-12)

1. Complete monorepo integration (Plans 24-31)
2. Keep pipeline backend working (Fastify + orchestrator + worker)
3. Maintain Playwright test framework integrity
4. Agent School communication infrastructure

---

## Communication Style

- Direct, no BS
- Prefers minimal code — reduce lines with shared utilities
- Values agent independence — anti-collusion/rubber-stamping is a primary concern
- Trusts autonomous execution when context is understood
- "Fix only real issues, don't blindly change things"

---

## What Colleague's Agent Should Know

- Encore framework has strict `noUnusedLocals: true` — unused imports = compile error
- All selectors are TypeScript-only in `src/selectors/index.ts` — no CSV
- Import convention in website/frontend uses `@/` alias (maps to `src/*`)
- The pipeline has 5 stages, not 6 — requirements, planning, generation, healing, audit
- `handleScriptGeneration` in ChatPage.tsx is already async — don't wrap it again
- `createPipelineRun()` returns `{ runId }` not `{ id }`
