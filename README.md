# Encore Framework — Multi-Tenant Playwright Harness

Framework-level README for maintainers and the colleague routing bundles to end-clients. **This is not the client-facing runbook** — that lives at [`clients/encore/README.md`](clients/encore/README.md) and travels with the bundle.

---

## Audience

- **Framework maintainers** (us) — everything in this repo, including `src/`, `scripts/`, `plans/`, `.claude/`, `.github/`, `docs/`.
- **Colleague packaging bundles** — see [`HANDOFF_TO_COLLEAGUE.md`](HANDOFF_TO_COLLEAGUE.md) for the repo ↔ client seam, IP inventory, and what ships vs. what stays.
- **End-client** (Encore) — does **not** read this file; they get the stripped bundle + [`clients/encore/README.md`](clients/encore/README.md).

---

## Quick start (framework-level)

```bash
npm install
npx playwright install
# create clients/encore/config/environments/.env.local with your SSO creds — see docs/SETUP.md Step 2
npm test
```

Credentials are not committed — create `.env.local` (see [docs/SETUP.md](docs/SETUP.md) Step 2) and fill in the Microsoft SSO automation user. (Encore is the default client — `ACTIVE_CLIENT=encore`.)

---

## Running tests

`npm test` from repo root delegates to `clients/encore` (post-2026-05-07 client-architecture restructure). The client is self-contained at `clients/encore/src/` — Playwright loads sources directly (built-in TypeScript support), no pre-build step.

---

## Repo structure

- `src/` — framework runtime (adapters, credential loader, logger, diagnostics, reporter)
- `clients/<id>/` — per-client surface (pages, selectors, tests, config, docs, planning)
- `scripts/` — pipeline, validation, and operational scripts
- `plans/` — cross-client planning artifacts (pending/done + auto-regenerated INDEX)
- `.claude/` — Claude Code agent skills, context, identity, commands
- `.github/` — pipeline agent prompts + Copilot instructions
- `website/` — separate SaaS product surface (frontend + backend)
- `docs/` — framework documentation

See [`BUNDLE_MANIFEST.md`](BUNDLE_MANIFEST.md) for the authoritative list of what ships to a client bundle vs. what stays internal.

---

## Documentation

- [Complete Framework Documentation](docs/README.md)
- [Architecture Overview](docs/read_only_docs/ARCHITECTURE.md)
- [Agent Shared Rules](docs/read_only_docs/AGENT_SHARED_RULES.md)
- [Commenting Standards](docs/read_only_docs/COMMENTING_STANDARDS.md)
- [MCP Browser Guide](docs/read_only_docs/MCP_BROWSER_GUIDE.md)

Client-specific: [`clients/encore/docs/`](clients/encore/docs/) (REQUIREMENTS.md, MODULE_REGISTRY.md, AGENT_RULES_ENCORE.md).

---

## Multi-tenant

- `ACTIVE_CLIENT` env var selects `clients/<id>/`. Defaults to `encore` via `scripts/shared-paths.ts` / `.mjs`.
- All pipeline scripts resolve client paths through `SHARED_PATHS`. No hard-coded client strings remain in framework code.
- Agent prompts (`.github/agents/*.agent.md`) read product context from the active client's `docs/REQUIREMENTS.md` and `MODULE_REGISTRY.md`.
- To onboard a second client: see [`HANDOFF_TO_COLLEAGUE.md §7`](HANDOFF_TO_COLLEAGUE.md).

---

## Client deliverable

The `client_deliverable` branch is the shippable state. Colleague pulls that branch, gitignores everything NOT in [`BUNDLE_MANIFEST.md`](BUNDLE_MANIFEST.md), and hands the result to the client's deployment team. The client's runbook is [`clients/encore/README.md`](clients/encore/README.md) and travels with the `clients/encore/` folder wholesale.

---

**Framework:** Playwright + TypeScript
**Status:** Production — bundle operationally hardened 2026-04-21 (see `plans/done/PLAN_BUNDLE_OPERATIONAL_HARDENING.md`, `reports/bundle-op-hardening-2026-04-21.md`)
