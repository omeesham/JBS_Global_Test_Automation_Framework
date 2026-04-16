# SUBPLAN: Client Delivery Quick Build (V1) — SUPERSEDED

**Status**: SUPERSEDED
**Priority**: P0 (was blocking colleague)
**Parent**: MASTER_REPO_CLEANUP
**Created**: 2026-04-16
**Executed**: 2026-04-16 (reverted before completion)
**Superseded by**: `PLAN_MULTI_TENANT_RESTRUCTURE.md` + `SUBPLAN_MT_01..07`
**Absorbs**: PLAN_CLIENT_REPO_DELIVERY (structure portion only)
**Excludes**: website/, node_modules/ — out of scope per user directive.

---

## Execution Summary

- **Outcome**: SUPERSEDED (not executed). Planned quick duplicate-carve approach was pivoted mid-session.
- **Work done**: ~5 files were copied into a staged `encore_delivery/` folder (root configs + `config/allure/categories.json` + `.env.example`). All 5 files reverted via `rm -rf encore_delivery/` when the pivot decision was made. No files were modified or deleted from the rest of the repo.
- **Pivot reason**: user pointed out that duplicate carves will be thrown away the moment a second client arrives. The correct model is a structural restructure where each client's work lives inside `clients/{name}/` and the framework stays constant. This change serves the long-term SaaS vision (per `project_saas_vision.md` memory) where future clients self-serve and the packaging is mechanical.
- **What replaces this SP**: the 7-subplan `PLAN_MULTI_TENANT_RESTRUCTURE.md` sequence. SP-MT-07 is the automated packager that ships the colleague's bundle — same outcome as this SP would have produced, on a clean foundation.
- **Consequences**:
  - Colleague blocker extends by the execution time of SP-MT-01..07 (~7 sessions). User accepted this trade-off after seeing the duplicate-work cost of proceeding with the quick carve.
  - `PLAN_MASTER_REPO_CLEANUP.md` SP-09 (Client Delivery Polish V2) is also absorbed by SP-MT-07.
- **Verification**: `ls encore_delivery/` returns "No such file or directory" (reverted). No residue in the source tree.

No TCs were implemented. No code was modified beyond the creation + deletion of the scratch folder.

## Goal (original, retained for context)

Create `encore_delivery/` at repo root with minimum files to run Playwright tests. Sloppy code OK — colleague needs this NOW to wire her FE (show test cases, trigger runs, display reports). We fix slop later, ship polished V2 via SP-09.

## Delivery Model

1. NOW: package min-req files into `encore_delivery/` folder, push
2. Colleague takes folder, wires FE while we clean repo
3. After cleanup: ship polished V2 replacement
4. Colleague gives client the delivery folder — NO node_modules (they install themselves)

## What Goes IN (traced from actual Playwright imports)

```
encore_delivery/
  package.json, playwright.config.ts, tsconfig.json
  config/allure/categories.json + config/environments/.env.example
  tests/specs/setup/{locations,local-office}/*.spec.ts (12 specs)
  tests/setup/ (fixtures.ts, global-setup.ts, global-teardown.ts, custom-matchers.ts)
  tests/test-data/ (per-module .data.ts files)
  src/pages/ (login, home, setup/locations/*, setup/local-office/*)
  src/selectors/ (all selector files)
  src/common/ (base-page.ts, credential-loader.ts)
  src/utils/ (logger, common-methods, diagnostics-collector, app-constants, agent-reporter)
  src/framework-contracts/ (IConfig, diagnostics types)
  exports/ (11 test case CSVs)
  specs_planning/test-cases/ + specs_planning/test-plans/ (MD docs)
  reports/ (.gitkeep only — populated after runs)
```

## What Stays OUT (our IP)

`.claude/`, `.github/`, `CLAUDE.md`, `scripts/`, `src/orchestrator/`, `src/worker/`, `website/`, `plans/`, `specs_planning/_internal/`, `specs_planning/audits/`, `docs/read_only_docs/`, `tests/examples/`, `export_test_cases/`, `node_modules/`

## FE Contract for Colleague

- Test cases to display: `exports/*.csv` (11 CSVs) + `specs_planning/test-cases/*.md`
- Run all tests: `npx playwright test`
- Run one module: `npx playwright test tests/specs/setup/locations/location-pricing.spec.ts`
- List available specs: `npx playwright test --list`
- Reports after run: `reports/html-report/`, `reports/allure-results/`, `reports/test-results.json`, `reports/junit-results.xml`
- Setup: `npm install && npx playwright install`, copy `.env.example` to `.env.local`, fill creds

## Verification

- `cd encore_delivery && npm install && npx playwright test --list` shows specs
- `grep -r "orchestrator\|\.claude\|agents\|pipeline\|worker" encore_delivery/` returns 0 matches
