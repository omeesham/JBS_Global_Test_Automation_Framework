# Bundle Manifest — Encore Runnable Subset

**Generated**: 2026-04-21  
**Smoke test**: `reports/bundle-smoke-2026-04-21.md`  
**Purpose**: Defines the minimal set of paths required to run the Encore test suite in isolation.

---

## One-line usage

> **Colleague**: pull the repo, gitignore everything NOT in this manifest, ship to Encore.

---

## KEEP — Root files

| Path | Why needed |
|------|-----------|
| `playwright.config.ts` | Main test runner config; imports `dotenv-flow`, reads `clients/encore/config/allure/categories.json`, resolves `globalSetup`/`globalTeardown` |
| `playwright.config.ci.ts` | CI variant of the config |
| `tsconfig.json` | Path aliases: `@framework/*` → `src/*`, `@client/*` → `clients/encore/src/*`, `@client-tests/*` → `clients/encore/tests/*`; required by all TypeScript compilation |
| `package.json` | Dependencies + test scripts (`test`, `test:chrome`, `setup:browsers`, `clean`, `report`, `allure:*`, `test:daily`, `reports:archive`) |
| `package-lock.json` | Reproducible install |
| `.gitignore` | Prevents committing `node_modules/`, `.auth/`, `reports/`, etc. |

> **Root `README.md` does NOT ship to the client.** It is a framework-level doc for maintainers + the colleague. The client-facing runbook is `clients/encore/README.md` (travels with the `clients/encore/` folder wholesale).

---

## KEEP — Operational scripts (small, self-contained, pure `fs`/`path`)

These four scripts are referenced by client-facing npm commands (`clean`, `clean:reports`, `allure:history`, `test:daily`, `reports:archive`). They have no transitive dependencies on pipeline-internal code.

| Path | Why needed |
|------|-----------|
| `scripts/ensure-report-dirs.js` | Recreates `reports/` sub-directories after `clean`/`clean:reports`; 5 lines, `fs`/`path` only |
| `scripts/preserve-allure-history.js` | Copies `allure-report/history/` → `allure-results/history/` before clean — enables Allure Trend widget; 45 lines, `fs`/`path` only |
| `scripts/archive-allure.js` | Timestamped snapshot of `reports/allure-report/` to `reports/allure-archive/<ts>/`; opt-in pruning via `ALLURE_ARCHIVE_MAX_DAYS`; `fs`/`path` only |
| `scripts/archive-html.js` | Timestamped snapshot of `reports/html-report/` to `reports/html-archive/<ts>/`; opt-in pruning via `HTML_ARCHIVE_MAX_DAYS`; `fs`/`path` only |

---

## KEEP — `src/` (framework runtime only)

| Path | Why needed |
|------|-----------|
| `src/framework-contracts/**` | Type contracts imported by `diagnostics-collector.ts`, `agent-reporter.ts`, `fixtures.ts` |
| `src/utils/logger.ts` | `Log`, `Logger` — imported everywhere |
| `src/utils/common-methods.ts` | `CommonMethods` — imported by fixtures |
| `src/utils/diagnostics-collector.ts` | Attached to every test page; imported by fixtures |
| `src/utils/agent-reporter.ts` | Custom Playwright reporter referenced in `playwright.config.ts` |
| `src/common/credential-loader.ts` | Loads MSO credentials from `.env.development`; imported by fixtures |
| `src/data/adapters/{excel,json,db,s3}Adapter.ts` | Data adapters (reached from `adapterFactory.ts`) |
| `src/data/adapters/adapterFactory.ts` | Factory used by fixtures for data-driven test adapters |

**Excluded from `src/`**:
- `src/utils/agent-notification-writer.ts` — writes to `specs_planning/_internal/`; pipeline-only, never called at test runtime
- `src/orchestrator/**` — SaaS pipeline orchestrator, not test runtime
- `src/worker/**` — SaaS worker, not test runtime
- `src/server/**` — SaaS API server, not test runtime
- `src/data/adapters/__tests__/**` — framework unit tests, not encore runtime

---

## KEEP — `clients/encore/`

| Path | Why needed |
|------|-----------|
| `clients/encore/src/**` | Page objects, selectors, utils (AppConstants), common helpers |
| `clients/encore/tests/**` | Specs + setup: `fixtures.ts`, `global-setup.ts`, `global-teardown.ts`, `custom-matchers.ts`, `seed.spec.ts`, all spec files |
| `clients/encore/api-testing/**` | API test specs (listed in `testMatch`) |
| `clients/encore/config/environments/.env.development` | Credentials (username, password, MFA secret, BASE_URL, CI_ENV) — plain-text by design (see root CLAUDE.md §Security Rules) |
| `clients/encore/config/environments/.env.example` | Template for new collaborators |
| `clients/encore/config/allure/categories.json` | Required by `playwright.config.ts` allure reporter |
| `clients/encore/README.md` | Client-facing runbook (daily run, reports, CI/CD integration, troubleshooting) — ships with the deliverable |

**Excluded from `clients/encore/`**:
- `clients/encore/CLAUDE.md` — agent-only instructions
- `clients/encore/docs/**` — REQUIREMENTS.md, MODULE_REGISTRY.md, AGENT_RULES_ENCORE.md; no runtime imports (verified)
- `clients/encore/specs_planning/**` — agent state: test-cases, test-plans, audits, activity logs
- `clients/encore/exports/**` — CSV exports; non-runtime

---

## EXCLUDE — Repository-level artifacts (never copy)

| Path | Why excluded |
|------|-------------|
| `.claude/**` | Claude Code agent configuration; not needed to run tests |
| `.github/**` | GitHub Actions; not needed |
| `plans/**` | Agent planning artifacts |
| `docs/**` (root) | Framework documentation; no runtime imports |
| `website/**` | SaaS frontend/backend; completely separate codebase |
| `scripts/**` (except the four operational scripts listed under KEEP) | Pipeline scripts, agent tooling, TS utilities; not needed at test runtime. `global-setup.ts` gracefully skips the missing `cleanup-logs` import. |
| `tests/unit/**` | Framework-internal Jest unit tests (`agent-notification-writer.test.ts`); imports the excluded `src/utils/agent-notification-writer.ts` and has no client runtime value |
| `jest.config.ts` (root) | Jest runner config paired with `tests/unit/**`; client stack is Playwright, no Jest runtime |
| `HANDOFF_TO_COLLEAGUE.md` | Internal transition document |
| `README.md` (root) | Framework-level README for maintainers + colleague; client gets `clients/encore/README.md` instead |
| `CLAUDE.md` (root) | Agent instructions |
| `AGENT_SHARED_RULES.md` (root) | Agent rules |
| `.auth/**` | Saved auth state — regenerated on first `npx playwright test` run |
| `reports/**` | Test output — regenerated on each run |
| `test-results/**` | Test output |
| `allure-results/**`, `allure-report/**` | Test reporting |
| `logs/**` | Runtime logs |
| `playwright-report/**` | HTML report output |
| `.build/**` | TypeScript build output |
| `node_modules/**` | Installed by `npm install` |
| `.git/**` | Git history |

---

## Known warnings (non-blocking)

1. **`config/environments` in global-setup** — `global-setup.ts` calls `dotenvFlow.config({ path: ...config/environments... })` pointing at a non-existent root-level `config/`. Silently ignored (`silent: true`). `playwright.config.ts` already loaded env vars from the correct `clients/encore/config/environments/` path.
2. **npm audit vulnerabilities** — 18 pre-existing vulnerabilities (3 moderate, 12 high, 3 critical). All inherited from main repo's `package-lock.json`. Not introduced by the bundle.

---

## Security note

`clients/encore/config/environments/.env.development` contains plain-text credentials (username, password, MFA secret). This is **by design** for the E2E environment (see root `CLAUDE.md §Security Rules`). Colleague must re-issue/rotate credentials before any client-facing handoff.

---

## Reproduction steps for colleague

```bash
# 1. Clone the repo
git clone <repo_url>
cd encore_framework

# 2. Install dependencies
npm install
npx playwright install chromium   # or: npx playwright install (all browsers)

# 3. Run the smoke test
npx playwright test clients/encore/tests/seed.spec.ts --project=chromium

# 4. Run all tests
npx playwright test --project=chromium

# 5. View reports
npm run report            # Playwright HTML report (last run)
npm run allure:report     # Allure report (last run, opens in browser)
```

### Daily run (recommended chain)

`npm run test:daily` runs the full chain end-to-end:
1. Preserve Allure history (seeds Trend widget)
2. Clean `reports/` directories
3. Run the chromium full suite
4. Generate the Allure report
5. Archive both HTML + Allure reports under `reports/{html,allure}-archive/<timestamp>/`

After each daily run, `reports/html-report/` and `reports/allure-report/` always reflect the latest run; past runs are preserved in the `<type>-archive/<timestamp>/` dirs for review.

Env vars (optional):
- `ALLURE_ARCHIVE_MAX_DAYS` — prune Allure archives older than N days (default `0` = never prune)
- `HTML_ARCHIVE_MAX_DAYS` — prune HTML archives older than N days (default `0` = never prune)

If you want to gitignore the non-runnable parts, exclude everything NOT listed in the KEEP sections above.
