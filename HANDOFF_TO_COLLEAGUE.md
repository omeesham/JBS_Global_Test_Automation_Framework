# Handoff to Colleague — Multi-Tenant Repo

**Created**: 2026-04-17
**Last updated**: 2026-04-21 (bundle operational hardening — see `plans/done/PLAN_BUNDLE_OPERATIONAL_HARDENING.md` + `reports/bundle-op-hardening-2026-04-21.md`)
**Source plan**: `plans/done/SUBPLAN_MT_07_DELIVERY_PACKAGER.md`
**Predecessors**: SP-MT-01 through SP-MT-06 (multi-tenant restructure complete)
**Bundle definition**: `BUNDLE_MANIFEST.md` (authoritative inclusion/exclusion list)

This document is the boundary marker between our scope (a clean multi-tenant repo) and yours
(deciding what reaches the end-client). We do **not** package, scrub, or curate. You take the
repo as-is on `main` and route the right pieces into client bundles.

---

## 1. Repo boundary

**`clients/<CLIENT>/`** — everything client-specific:
- `src/` (pages, selectors, common, utils that wrap client UI)
- `tests/` (specs, setup, test-data, seed.spec.ts)
- `config/` (allure categories, environments)
- `docs/` (REQUIREMENTS.md, MODULE_REGISTRY.md, read_only_docs)
- `specs_planning/` (test-cases, test-plans, audits, `_internal/` agent state)
- `exports/`, `api-testing/`
- `CLAUDE.md` (client-specific LRs and rules), `README.md`

**Repo root (outside `clients/`)** — framework, reusable across clients:
- `src/` (framework-contracts, data adapters, common, utils, orchestrator, server, worker)
- `scripts/` (pipeline + framework scripts)
- `.github/agents/`, `.github/copilot-instructions.md` (pipeline agent prompts)
- `.claude/` (skills, commands, identity, context)
- `plans/` (cross-client roadmap)
- `docs/` (framework docs, `read_only_docs/AGENT_SHARED_RULES.md`)
- `website/` (our SaaS frontend/backend)
- `playwright.config.ts`, `playwright.config.ci.ts`, `tsconfig*.json`, `package.json`

---

## 2. What we hand over

The whole repo, in the new multi-tenant layout, on `main` once SP-MT-06 has merged green.
**No pre-scrubbing. No curation. No client-facing variant.** You pull, audit, and slice.

---

## 3. IP inventory (informational — paths you will likely **exclude** from a client bundle)

This is a starting checklist, not an exhaustive rule. Refresh when major work lands.

- `.claude/` — Claude-side skills, identity, commands, context
- `.github/agents/` — pipeline agent prompts (HUNTER/GIVER/BUILDER/HEALER/WATCHDOG/GARDENER)
- `.github/copilot-instructions.md`
- `.githooks/`
- `plans/` — cross-client roadmap and execution history
- `docs/read_only_docs/AGENT_SHARED_RULES.md` — agent contract (anti-collusion §11, file ownership §2)
- `clients/<CLIENT>/specs_planning/_internal/` — agent state: agent-mistakes.md, agent-activity-log.md, queue, performance, escalations, learnings, test-id-registry
- `clients/<CLIENT>/specs_planning/audits/` — audit reports
- `scripts/` pipeline-internal entries:
  - `planner-*.ts`, `generator-*.ts`, `healer-*.ts`, `audit-*.ts`, `requirements-*.ts`
  - `sync-agent-mistakes.ts`, `sync-copilot-session.ts`
  - `validate-activity-log.mjs`, `validate-agent-sync.ts`, `validate-queue-integrity.ts`
  - `validation-gates.ts`, `capture-mistake.ts`, `agent-metrics.ts`
  - `task-context-builder.ts`, `pipeline-orchestrator.ts`, `archive-queue.ts`
  - `detect-duplication.ts`, `lint-test-cases.ts`, `build-test-id-registry.ts`, `check-tc-parity.ts`
  - `generate-selector-catalog.ts`, `generator-validate-selectors.ts`
  - `agent-channel.mjs`, `plans-reindex.mjs`, `scan-fixmes.ts`
  - `clean-root.ts`, `audit-block.ts`
- `src/orchestrator/`, `src/worker/`, `src/server/` — unless the client explicitly consumes them
- `website/` — our SaaS frontend/backend (separate product surface)
- `specs_planning/` at repo root — legacy templates and `_internal/` schema; not client-consumable
- `CLAUDE.md` (root) — has framework rules and skill routing; client doesn't need it
- `cli and mcp in our repo.md` — internal note

---

## 4. Client-consumable inventory (informational — paths a client bundle plausibly **keeps**)

You decide. This is a starting list of what a typical client bundle would include:

- Root configs: `playwright.config.ts`, `playwright.config.ci.ts`, `tsconfig.json`, `tsconfig.build.json`, `tsconfig.server.json`, `package.json`, `package-lock.json`, `.eslintrc.json`, `.prettierrc.json`
- `src/framework-contracts/` — public framework interfaces
- `src/data/adapters/{excelAdapter,jsonAdapter,dbAdapter,s3Adapter,adapterFactory,IAdapter}.ts` — Excel/JSON/DB/S3 adapters reached by the fixture chain. (The barrel `src/data/adapters/index.ts` was pruned 2026-04-21 — unreached.)
- `src/common/credential-loader.ts`
- `src/utils/` — reached-only subset: `logger.ts`, `common-methods.ts`, `diagnostics-collector.ts`, `agent-reporter.ts`. (Pruned 2026-04-21: `file-utils.ts`, `dom-diff.ts`, `bug-hunt-classifier.ts`, `index.ts` — all unreached by any entry point. `agent-notification-writer.ts` remains excluded — pipeline-only.)
- `src/index.ts` — framework library barrel (used by `tsconfig.build.json`; edited 2026-04-21 to drop the `FileUtils` re-export after the file was pruned)
- Shipping scripts (4 operational helpers, pure `fs`/`path`): `scripts/ensure-report-dirs.js`, `scripts/preserve-allure-history.js`, `scripts/archive-allure.js`, `scripts/archive-html.js`. Plus `scripts/shared-paths.ts` / `.mjs` / `shared-types.ts` if the client runs any `shared-paths`-aware tooling. (The `scripts/cleanup-logs.ts` pre-test hook was stripped from `package.json` 2026-04-21 — `global-setup.ts`'s `require('../../../../scripts/cleanup-logs')` remains as a harmless silent-catch.)
- `clients/<CLIENT>/` — wholesale (this is the client's own surface; Encore pruned 2026-04-21: `clients/encore/src/pages/index.ts`, `clients/encore/src/selectors/setup/locations/index.ts`, `clients/encore/src/utils/selector-registry-validator.ts`, `clients/encore/api-testing/api-contracts/common.api.ts`)
- `config/environments/` — env templates (strip secrets per your release policy)
- Root `README.md` (replace contents for client audience)
- `start-dev.sh`, `start-dev.bat` — only if the client runs the dev stack

---

## 5. Existing `scripts/client-package.ts`

- The file exists at `scripts/client-package.ts`.
- Its path constants predate the multi-tenant restructure (SP-MT-03 moved content under
  `clients/encore/`), so its include/exclude lists are stale.
- **We explicitly leave it untouched.** You own the packager: audit, rewrite, or delete.
- The `package.json` script `client:package` is left as-is for the same reason.
- If you don't need a packager (e.g., you script bundles outside this repo), feel free to delete.

---

## 6. Environment variables

- `ACTIVE_CLIENT` — selects which `clients/<CLIENT>/` directory the framework, pipeline, and
  scripts resolve against. Defaults to `'encore'` (see `scripts/shared-paths.ts` and
  `scripts/shared-paths.mjs`) so the single-tenant case keeps working with no config.
- Override via `config/environments/.env.local` or shell:
  ```bash
  ACTIVE_CLIENT=acme npm test
  ```
- After SP-MT-04, all pipeline scripts resolve client paths through `SHARED_PATHS` —
  no hard-coded `clients/encore/` strings remain in framework code. After SP-MT-06,
  the agent prompts read product context from the active client's docs (REQUIREMENTS.md,
  MODULE_REGISTRY.md), not from inlined Encore knowledge.

Note: do **not** change `ACTIVE_CLIENT` mid-process — `shared-paths` caches at module load.
Switch by spawning a new process / new shell.

---

## 7. Onboarding a second client (your roadmap)

1. Scaffold:
   ```bash
   mkdir -p clients/acme/{src,tests,config,docs,specs_planning,exports}
   mkdir -p clients/acme/specs_planning/{test-cases,test-plans,audits,_internal}
   ```
2. Adapt `CLAUDE.md`:
   ```bash
   cp clients/encore/CLAUDE.md clients/acme/CLAUDE.md
   ```
   Strip Encore-specific LRs (`LR-ENC-*`), add `LR-ACME-*` rules as discovered.
3. Seed docs: copy/adapt `clients/encore/docs/REQUIREMENTS.md` and `MODULE_REGISTRY.md`
   templates, then refill with acme product surface.
4. Seed env: add an acme entry under `config/environments/` (template per your release policy).
5. Set `ACTIVE_CLIENT=acme` for the session.
6. Framework + pipeline agents run against the new client with **zero changes** in `src/` or
   `scripts/` (this is the contract SP-MT-04 and SP-MT-06 establish).

---

## 8. Pipeline state

- After **SP-MT-04**: pipeline scripts resolve all paths through `SHARED_PATHS` and respect
  `ACTIVE_CLIENT`. No client hardcodes remain in framework code.
- After **SP-MT-06**: agent prompts (`.github/agents/*.agent.md`) are parameterized — they
  read product context from the active client's `docs/REQUIREMENTS.md` and `MODULE_REGISTRY.md`
  rather than inlining Encore knowledge.
- You can run the pipeline as-is against the existing Encore client, or skip it and use the
  repo purely as a Playwright test harness.
- Pipeline state lives under `clients/<CLIENT>/specs_planning/_internal/` (queue, mistakes,
  activity log, performance metrics). All of it is IP — see §3.

---

## Notes

- This document is **not** a CI gate or an executable scrub. It is the colleague-to-colleague
  contract for what we built and where the seam is.
- IP inventory is a point-in-time snapshot (2026-04-17, §3 refreshed 2026-04-21). Treat it as a
  starting checklist; if new pipeline scripts or agent state directories land later, refresh §3 in
  the same PR.
- **2026-04-21 bundle hardening**: ran `PLAN_BUNDLE_OPERATIONAL_HARDENING` which (a) stripped the
  `pretest` hook so bare `npm test` exits 0, (b) added `scripts/archive-{allure,html}.js` for
  timestamped daily archival, (c) added `npm run test:daily` as the recommended daily chain
  (history → clean → run → generate → archive), (d) reordered `clients/encore/config/allure/categories.json`
  so specific regex buckets match before the "Product Defects" catch-all, (e) deleted 9 unreached
  files (4 barrel `index.ts` files + 4 standalone utilities + 1 API contract) that were shipping
  as dead weight. `BUNDLE_MANIFEST.md` and this doc are now aligned with post-hardening reality.
- If you need a packager script (or anything else past the seam), file it as a new plan against
  this repo and we'll scope it explicitly. Don't pre-build for a need that hasn't surfaced.
