---
artifact: restructure-map
module: clients/encore (whole-client POM reshape)
date: 2026-06-05
author: OWNER (Claude Opus 4.8, /execute PLAN_ENCORE_POM_RESTRUCTURE)
plan: plans/pending/PLAN_ENCORE_POM_RESTRUCTURE.md
source_spec: POM_RESTRUCTURE_INSTRUCTIONS (Downloads, person-supplied; satisfy RESULT not letter)
signoff: STANDING — Rutvik authorized "full send" 2026-06-05 (explicit go + standing sign-off; TestRail content pass confirmed done). No separate HALT round-trip.
counts_refreshed: 2026-06-05 post-content tree — 91 .ts files, 156 `../`-prefixed imports (recon "235" counted `./` too), keystone SHARED_PATHS confirmed (4 moving keys).
excludes: .claude/worktrees/**, .work/** (per plan Phase-0 + RF-12)
---

# Encore POM Restructure — OLD → NEW Move Map (Phase 1 intake artifact)

Pure relocation: `git mv` + import/path edits. **No symbol renames** (`CommonMethods` kept). **No behavioral change.** History preserved. Non-moving dirs untouched: `src/selectors/`, `src/types/`, `src/utils/{logger,credential-loader,diagnostics-collector,retry-telemetry}`, `config/allure/`, `test_cases_xlsx/`, `specs_planning/`, `docs/`, `.auth/`.

## A. File move map (`git mv`, all under `clients/encore/`)

| Phase | OLD | NEW | rename? | layer(s) |
|---|---|---|---|---|
| 2 Pages | `src/core/base-page.ts` | `src/pages/base.page.ts` | file | 1,5 |
| 2 Pages | `src/pages/locations/location-form-helpers.page.ts` | `src/pages/components/location-form-helpers.component.ts` | file (mixin reclass; resolves LR-017 coupling) | 1,5 |
| 3 Fixtures | `src/infra/fixtures.ts` | `src/fixtures/pages.fixture.ts` | file | 1,2,3,5 |
| 3 Fixtures | `src/infra/dependency-gate.ts` | `src/fixtures/dependency-gate.ts` | dir | 1 |
| 4 Utils+kill core | `src/core/app-constants.ts` | `src/utils/constants.ts` | file | 1 |
| 4 | `src/core/field-case-runner.ts` | `src/utils/field-case-runner.ts` | dir | 1,2,5 |
| 4 | `src/infra/auth-storage.ts` | `src/utils/auth-storage.ts` | dir | 1 |
| 4 | `src/utils/common-methods.ts` | `src/utils/env-config.ts` | file (KEEP `CommonMethods` export) | 1 |
| 4 | _rmdir_ `src/core` | — | — | — |
| 5 Setup | `src/infra/global-setup.ts` | `src/setup/global-setup.ts` | dir | 2,3 |
| 6 Reporter | `src/utils/agent-reporter.ts` | `src/reporter/agent-reporter.ts` | dir (rewrite `./retry-telemetry`→`../utils/retry-telemetry`) | 1,3 |
| 7 Data | `src/data/testdata/common.data.ts` | `src/data/common.ts` | file | 1 |
| 7 Data | `src/data/testdata/{locations,local-office,corporate-pricing}/*.data.ts` | `src/data/<module>/*.ts` | dir+suffix (drop `.data`) | 1 |
| 7 Data | _rmdir_ `src/data/testdata` | — | — | — |
| 8 specs→tests | `specs/` | `tests/` | dir | 1,2,5 |
| 8 | `src/infra/auth.setup.ts` | `tests/auth.setup.ts` | dir (depth −1 → imports gain `../src/`) | 1 |
| 8 | _rmdir_ `src/infra` | — | — | — |
| 9 env→root | `config/environments/.env.e2e` | `.env.e2e` (client root) | dir | 2,3,4-anchor |
| 9 | `config/environments/.env.local` | `.env.local` (client root) | dir | 2,3 |
| 9 | _rmdir_ `config/environments` (keep `config/allure/`) | — | — | — |

**MOOT (staged-for-deletion on disk — commit deletion, do NOT move):** `src/infra/custom-matchers.ts`, `src/infra/global-teardown.ts`, `src/selectors/locations/left-panel.ts`, `src/data/testdata/downloads/.gitkeep` (downloads mid-deletion), `config/{allure,environments}/.gitkeep`, `specs/locations/history/location-hist-notes.spec.ts`.

## B. Import-cascade rewrite (Layer 1 — tsc-gated)

**Global (scripted, all `.ts` under `src`+`tests`):**
- `'../../core/base-page'` → `'../base.page'` (13 importers, all `src/pages/<m>/`)
- `'../../core/app-constants'` → `'../../utils/constants'` (1: `login.page.ts`)
- `'../../src/core/field-case-runner'` → `'../../src/utils/field-case-runner'` (4 specs)
- `'../../src/infra/fixtures'` → `'../../src/fixtures/pages.fixture'` (16 specs)
- form-helpers: `'./location-form-helpers.page'` → `'../components/location-form-helpers.component'` (5); `'../locations/location-form-helpers.page'` → `'../components/location-form-helpers.component'` (1, local-office-settings); `'../pages/locations/location-form-helpers.page'` → `'./components/location-form-helpers.component'` (1, base.page)
- `'../utils/common-methods'` → `'../utils/env-config'` (fixtures; auth.setup corrected below)
- data: `data/testdata/` → `data/`; strip trailing `.data` in import specifiers (covers spec `../../src/data/...` + page `../../data/...` + `./common.data` forms)
- malformed: `'../../../../src/selectors'` → `'../../selectors'` (location-local-info.data.ts)

**Per-file specials (Edit after script — depth changers):**
- `tests/auth.setup.ts` (was `src/infra/`, depth −1): `../utils/env-config`→`../src/utils/env-config`; `../utils/credential-loader`→`../src/utils/credential-loader`; `../utils/retry-telemetry`→`../src/utils/retry-telemetry`; `./auth-storage`→`../src/utils/auth-storage`
- `src/utils/auth-storage.ts`: `'../utils/retry-telemetry'`→`'./retry-telemetry'`
- `src/reporter/agent-reporter.ts`: `'./retry-telemetry'`→`'../utils/retry-telemetry'`
- `src/fixtures/pages.fixture.ts`: `'./auth-storage'`→`'../utils/auth-storage'` (dependency-gate moved with it → `'./dependency-gate'` unchanged)

Unchanged-by-design (same-depth moves): base.page `../utils/*`, `../selectors`, `../types`; global-setup `../utils/*`; fixtures page imports `../pages/*`; auth-storage `../pages/auth/login.page` + `../types`.

## C. Ref layers 2–5

- **Keystone** `scripts/shared-paths.ts` + `.mjs`: `specs`→`clientPath('tests')`; `fixtures`→`src/fixtures/pages.fixture.ts`; `testData`→`src/data`; `envDir`→`clientRoot()` (env at root). Refresh the "post-2026-05-19" comment block.
- **tsconfig** `clients/encore/tsconfig.json` `include`: `specs/**`→`tests/**`. **Root** `tsconfig.json` `@client-tests/*`: repoint to `clients/encore/tests/*` (or kill).
- **Hooks** `.githooks/pre-commit:43` + `:58-59` (`clients/encore/specs/` / `^clients/[^/]+/specs/.*\.spec\.ts$`) → `tests/`; audit `.githooks/pre-push`.
- **playwright.config.ts**: testDir/testMatch (`specs/**`→`tests/**`)/testIgnore/globalSetup (`src/infra/global-setup`→`src/setup/global-setup`)/reporter (`src/utils/agent-reporter`→`src/reporter/agent-reporter`)/dotenv (`config/environments`→`__dirname`).
- **3 rule globs** (`specs.md`, `angular.md`, `browser-tool.md`): `clients/*/specs/**/*.spec.ts` → `clients/*/tests/**/*.spec.ts`. (`inventory.md`/`baseline.md` glob `specs_planning` — untouched.)
- **.ci/** (Jenkins/Azure): verify each — patch only if it names a moving path (`specs/`/`config/environments`/`src/infra`). `.github/` does NOT exist (CI is `.ci/` only).
- **Layer-5 contracts**: client `CLAUDE.md` (LR-017 dir contract + LR-ENC-001/003 `config/environments/.env.local` + `src/infra/fixtures.ts` + `src/infra/global-setup.ts` refs), root `CLAUDE.md` repo-structure, `field-case-generation.md` runner path, `shared-paths.ts` comment, agent prompts `GENERATOR.md`/`HEALER.md`/`MAINTAINER.md`, `specs.md:42`, `navigation.md` (rows referencing `src/data/testdata`, `src/infra/fixtures`, `src/core/base-page`, `config/environments/.env.local`).
- **.gitignore** per-client: drop `config/environments/` prefix from `.env` ignore lines; `git rm --cached` anything newly ignored.

## D. Live-forward pending-plan classification (LR-050 permanence; grep = 35 token-carriers 2026-06-05)

5 token classes rewritten in LIVE plans: `src/infra/fixtures`→`src/fixtures/pages.fixture`; `src/data/testdata/`→`src/data/`; `src/core/field-case-runner`→`src/utils/field-case-runner`; `src/core/base-page`→`src/pages/base.page`; `clients/encore/specs/`+`specs/{locations,local-office,corporate-pricing}/`→`tests/...`. Leave `selectors`/`specs_planning`/`docs` refs untouched.

**EXCLUDE — frozen, no rewrite, guard-exempt (3):**
1. `PLAN_ENCORE_POM_RESTRUCTURE.md` — self; documents old→new by design.
2. `PLAN_DELIVERABLE_RESTRUCTURE_2026_05_19.md` — historical record of the PRIOR restructure (its tokens document how things moved INTO the layout this plan dismantles; rewrite would falsify history). Done-plan rotting in pending/.
3. `PLAN_CODEBASE_CLEANUP.md` — **reclassified DEAD during execution** (pre-client-split March-2026 plan; its bare `src/core/base-page.ts` etc. reference the obsolete *root* framework layout two restructures stale, not the client shape). Swap reverted to authored state; guard-exempt.

> **Count correction (execution-time):** broad detection (incl. bare `specs/<mod>/` + `${ACTIVE_CLIENT}/specs/`) found **37 token-carriers incl. self** — the narrow Phase-1 grep missed `SUBPLAN_DQU_21_G1_LEFTOVER_STATE_AUDIT` + `SUBPLAN_OPI_E_MIGRATE_SSL_AND_HISTORY` (both live-forward, rewritten). **34 rewritten · 3 frozen-excluded.**

**REWRITE — 34 token-carriers** (live-forward OR dead-but-forward; rewrite correct for live, harmless for dead): PLAN_56_HIDE_LEFT_PANEL_FROM_ALLURE, PLAN_BIG_PIVOT_FCC_MASTER, PLAN_DELIVERABLE_QUALITY_UPGRADE, PLAN_EMERGENCY_01_HIST_ARCH_AND_BUG_GUARDS_2026_05_15, PLAN_ENCORE_CI_2W_GREEN, PLAN_FULL_SUITE_RUN_CLEAN_REPORTS, PLAN_GENERATOR_AUDIT_AUTO_ADDON, PLAN_LM_HISTORY_COVERAGE, PLAN_MAINTAINER_SWEEP, PLAN_P0_ENCORE_QA_BUG_FOLLOWUPS, PLAN_PER_WORKER_OFFICE_POOL_PARALLEL_ISOLATION, PLAN_PLAYWRIGHT_CLI_ADOPTION, PLAN_RCA_NOTES_SPEC_2026-05-21, PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE, PLAN_SPEC_FIX_HIST_SSL_ACC_REENABLE_2026_06_02, PLAN_TEST_DATA_CSV_CONVERSION, PLAN_WAIT_PATTERN_CLEANUP, SUBPLAN_DQU_19_F1h_ECT_STANDALONE_AUDIT, SUBPLAN_DQU_22_G2_PRE_TEST_SLATE_CLEAR, SUBPLAN_DQU_26_H1_SCOPE_DEFINITION, SUBPLAN_DQU_29_I1_IDENTITY_RIPPLE_SYNC, SUBPLAN_OPI_A_INFRA_FOUNDATION, SUBPLAN_OPI_C_MIGRATE_LEGAL_PILOT, SUBPLAN_OPI_D_MIGRATE_LOCATIONS_BATCH, SUBPLAN_OPI_F_MIGRATE_LOCAL_OFFICE, SUBPLAN_PARITY_W1_04_SPEC_FIXES_VERDICT_INDEPENDENT, SUBPLAN_PARITY_W1_05_CI_LOCAL_VALIDATORS, SUBPLAN_PARITY_W2_06_SHADY_PASS_LIVE_AUDIT, SUBPLAN_PARITY_W2_07_FIELD_INVENTORIES_NEUTRAL_EYE, SUBPLAN_PARITY_W2_08_SPEC_FIXES_VERDICT_DEPENDENT, SUBPLAN_PARITY_W2_09_FULL_SUITE_CI_WIRE_FINAL_PARITY, SUBPLAN_REPO_12_TEST_INFRASTRUCTURE_AUDIT, SUBPLAN_DQU_21_G1_LEFTOVER_STATE_AUDIT, SUBPLAN_OPI_E_MIGRATE_SSL_AND_HISTORY.

**Guard** `verify-no-stale-live-refs.mjs`: greps live layer (excl `plans/done`, dated artifacts, `.claude/worktrees`, `.work`, the 3 EXCLUDE plans above) for the 5 token classes → expects 0.

## E. New permanent guard scripts (SILENT→LOUD)

- `scripts/verify-rules-fire.mjs` — every `.claude/rules/*.md` `paths:` glob matches ≥1 live file.
- `scripts/verify-protected-names.mjs` — plant temp forbidden file at each protected dir/file in NEW tree, assert `verify-no-forbidden` catches, clean up.
- extend `scripts/shared-paths.test.mjs` — assert every `SHARED_PATHS` value resolves + full `.ts`↔`.mjs` parity.
- `scripts/verify-no-stale-live-refs.mjs` — per §D.
- Wire all into `npm run pipeline:validate`.

## F. Revert safety

New branch off `client_deliverable`; `git add -A` (all 156 WIP incl. staged deletions + untracked) committed as clean revert SHA BEFORE any `git mv` (plan Step 1).
