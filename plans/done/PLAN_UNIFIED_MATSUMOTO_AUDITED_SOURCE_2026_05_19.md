# PLAN — Trim `clients/encore/` to lean shape + clean notes reference (revised post-audit)

> Revised plan incorporating audit findings from adversarial review of the original
> `c-users-rutvi-projects-notes-checkout-th-foamy-sedgewick.md`. All decisions locked via Q&A.

---

## 0. Session intent

Rutvik previously created a lean reference deliverable at `C:\Users\rutvi\projects\notes` — a
single-module demo that represents what actually gets shipped to clients. He then had an agent
draft a plan to trim `clients/encore/` to match that shape.

This session's job was to **audit that plan hard** — adversarial review of every claim, every
file, every decision against three things: (1) what Rutvik originally asked for, (2) what the
notes folder actually contains on disk, and (3) what the encore folder actually contains on disk.

The audit found **5 critical issues** (unnecessary 24-file import rewrite when a tsconfig change
sufficed, missing otplib awareness, commit ordering bug creating broken intermediate state,
CI workflow update missing from execution steps, notes reference having the same dep bloat it
claimed to fix) plus **4 high** and **6 medium** findings.

During Q&A on the audit findings, Rutvik made three scope-expanding decisions:
1. **Relative imports** — don't just remap aliases, remove ALL tsconfig path aliases and rewrite
   every import to bare relative paths. Most vanilla possible. No aliases at all.
2. **Match notes' directory structure exactly** — rename `src/common/` → `src/core/`,
   `tests/setup/` → `tests/infra/`, move auth pages to `src/pages/auth/`, seed spec to
   `tests/specs/smoke/`. The encore folder structure must mirror notes.
3. **Update everywhere** — not just client code but all framework docs, agent configs, pipeline
   examples, and pending plans that reference the old paths. Frozen history (`plans/done/`) stays.

The result is this plan: 5 commits that transform encore from a framework-vendoring, alias-heavy,
custom-scripted deliverable into a self-contained, relative-import, notes-structured project that
a scrutinizing external reviewer can understand without asking "why is there so much shit."

Parallel track: trim notes itself of the same unused dep bloat and dead config entries.

---

## 1. Context

Rutvik approved a lean reference deliverable at `C:\Users\rutvi\projects\notes`. The current
`clients/encore/` ships with a 55-file compiled `dist/framework/` vendor layer, 6 custom report
scripts, a separate CI config, unused dependencies, and tsconfig path aliases that obscure what
code lives where. Client reviewers are readability-first and will question anything custom.

An adversarial audit of the original plan surfaced 5 critical, 4 high, and 6 medium issues.
Key corrections: (1) import paths rewrite to **relative paths** (most vanilla, no aliases),
(2) skip TOTP/otplib porting (encore doesn't use it), (3) fix commit ordering to avoid broken
intermediate states, (4) add missing files (diagnostics types, gitignore entries), (5) trim notes
reference too (same unused dep bloat + dead config entries).

---

## 2. Decisions locked

| # | Decision | Source |
|---|---|---|
| D1 | Drop `dist/framework/` entirely; inline only what specs use as plain `src/` files | Original plan Q1 |
| D2 | Keep the test-daily concept as `test:cli` with ~25-line stock Allure script | Original plan Q2 |
| D3 | Keep `dependency-gate.ts` + `fullyParallel: false` (LR-019) with header comments | Original plan Q3 |
| D4 | Drop `api-testing/` and `test.xlsx` | Original plan Q4 |
| D5 | **Relative imports** — remove ALL tsconfig path aliases, rewrite every import to relative paths | Audit Q3 |
| D6 | **Skip TOTP** — port only `initProp()` from repo-root, not notes' `generateTotpCode` + `otplib` | Audit Q2 |
| D7 | **Trim notes too** — remove 5 unused deps + dead config entries from `C:\Users\rutvi\projects\notes` | Audit Q1 + Q4 |
| D8 | **Granular clean script** — keep current selective `rimraf` list, not shotgun `rimraf reports logs` | Audit F6 |
| D9 | **Match notes' directory structure** — rename `src/common/` → `src/core/`, `tests/setup/` → `tests/infra/`, move auth pages to `src/pages/auth/`, seed spec to `tests/specs/smoke/` | User directive |
| D10 | **Update ALL live references** — framework docs, agent configs, pending plans, pipeline examples. DON'T touch `plans/done/` (frozen history) | User directive |

---

## 3. End state — what `clients/encore/` looks like after trim

```
clients/encore/
├── .github/workflows/playwright-tests.yml   (config ref updated)
├── .gitignore                                (expanded: notes' entries added)
├── README.md                                 (updated for new scripts + paths)
├── package.json                              (deps trimmed; scripts trimmed; test:cli)
├── playwright.config.ts                      (merged single config; paths to tests/infra/)
├── tsconfig.json                             (NO path aliases; clean includes)
├── config/
│   ├── allure/categories.json
│   ├── allure/.gitkeep
│   ├── environments/.env.e2e
│   └── environments/.gitkeep
├── scripts/
│   └── test-cli.js                           (NEW ~25 lines; replaces 6 custom scripts)
├── src/
│   ├── core/                                 (RENAMED from src/common/)
│   │   ├── app-constants.ts                  (MOVED from src/utils/)
│   │   └── base-page.ts                      (imports rewritten to relative)
│   ├── pages/
│   │   ├── auth/                             (NEW subdirectory)
│   │   │   ├── home.page.ts                  (MOVED from src/pages/)
│   │   │   └── login.page.ts                 (MOVED from src/pages/)
│   │   └── setup/                            (13 module page-object files; imports rewritten)
│   ├── selectors/                            (16 files + SELECTOR_CATALOG.md — untouched)
│   ├── types/
│   │   ├── index.ts                          (NEW — IConfig interface)
│   │   └── diagnostics.ts                    (NEW — FailureCategory, NetworkFailure, etc.)
│   └── utils/
│       ├── common-methods.ts                 (NEW — initProp only, no TOTP)
│       ├── credential-loader.ts              (NEW — from notes)
│       ├── diagnostics-collector.ts          (NEW — from notes)
│       ├── logger.ts                         (NEW — from notes)
│       └── retry-telemetry.ts                (NEW — from repo-root)
└── tests/
    ├── infra/                                (RENAMED from tests/setup/)
    │   ├── auth-storage.ts                   (imports rewritten to relative)
    │   ├── auth.setup.ts                     (imports rewritten to relative)
    │   ├── custom-matchers.ts                (kept)
    │   ├── dependency-gate.ts                (header comment added — LR-019)
    │   ├── fixtures.ts                       (imports rewritten to relative)
    │   ├── global-setup.ts                   (imports rewritten; 7-day cleanup ported)
    │   └── global-teardown.ts                (imports rewritten to relative)
    ├── specs/
    │   ├── setup/                            (13 specs; untouched — no alias imports)
    │   └── smoke/
    │       └── seed.spec.ts                  (MOVED from tests/seed.spec.ts)
    └── test-data/
        ├── common.data.ts                    (kept)
        └── setup/                            (14 .data.ts files — kept)
```

**Now matches notes' directory structure:**
- `src/core/` (was `src/common/`) — base-page + app-constants together
- `src/pages/auth/` (was `src/pages/`) — auth pages in own subdirectory
- `tests/infra/` (was `tests/setup/`) — test infrastructure
- `tests/specs/smoke/` (was `tests/`) — seed spec in smoke subdirectory

**Removed** (compared to current state):
- `dist/framework/` (entire — 55 compiled files)
- `api-testing/` (entire — 4 files)
- `playwright.config.ci.ts`
- `scripts/preserve-allure-history.js`, `preserve-failure-summary.js`, `archive-allure.js`, `archive-html.js`, `ensure-report-dirs.js`, `run-test-daily.js` (6 files)
- `tests/test-data/test.xlsx`
- 5 deps from `package.json`: `@aws-sdk/client-s3`, `axios`, `exceljs`, `knex`, `xlsx`
- ALL tsconfig path aliases (`@framework/*`, `@client/*`, `@client-tests/*`)

**Only structural difference from notes kept**:
- `fullyParallel: false` global (notes: `true` global, `false` per-project) — functionally equivalent, fewer lines

---

## 4. Execution sequence (5 commits, each independently green)

### Commit 1 — Create local utility files (additive only)

Create 8 new files. Do NOT yet delete `dist/framework/`, change imports, rename directories,
or modify tsconfig. Both old paths (via existing `@framework/*` alias to `dist/framework/`) and
the new local files coexist.

**Files to CREATE** (8):

1. **`clients/encore/src/utils/logger.ts`** — port from `C:\Users\rutvi\projects\notes\src\utils\logger.ts`
2. **`clients/encore/src/utils/diagnostics-collector.ts`** — port from `C:\Users\rutvi\projects\notes\src\utils\diagnostics-collector.ts`
3. **`clients/encore/src/utils/common-methods.ts`** — port from repo-root `src/utils/common-methods.ts` (33 lines, **NOT** notes — skip TOTP per D6)
4. **`clients/encore/src/utils/credential-loader.ts`** — port from `C:\Users\rutvi\projects\notes\src\utils\credential-loader.ts`
5. **`clients/encore/src/types/index.ts`** — port from `C:\Users\rutvi\projects\notes\src\types\index.ts`
6. **`clients/encore/src/types/diagnostics.ts`** — port from `C:\Users\rutvi\projects\notes\src\types\diagnostics.ts` (original plan missed this)
7. **`clients/encore/src/utils/retry-telemetry.ts`** — port from repo-root `src/utils/retry-telemetry.ts` (notes doesn't have this)
8. **`clients/encore/scripts/test-cli.js`** — NEW, ~25 lines, stock Allure history pattern

**Verify**: `npm run typecheck` passes. No existing files edited.

---

### Commit 2 — Rename directories + rewrite imports + delete framework + merge configs

The big commit — atomically restructures encore to match notes' directory layout, rewrites
every import to relative paths, removes the framework vendor layer, and merges configs.

**Part A: Directory renames (D9)**

| Old path | New path | Files moved |
|---|---|---|
| `src/common/` | `src/core/` | `base-page.ts` |
| `src/utils/app-constants.ts` | `src/core/app-constants.ts` | 1 file (joins base-page in core/) |
| `src/pages/home.page.ts` | `src/pages/auth/home.page.ts` | 1 file |
| `src/pages/login.page.ts` | `src/pages/auth/login.page.ts` | 1 file |
| `tests/setup/` | `tests/infra/` | 7 files (auth-storage, auth.setup, custom-matchers, dependency-gate, fixtures, global-setup, global-teardown) |
| `tests/seed.spec.ts` | `tests/specs/smoke/seed.spec.ts` | 1 file |

**Part B: Rewrite ALL imports to relative paths**

All files with `@framework/*` or `@client/*` imports get rewritten to relative paths pointing
at the NEW directory locations. Since directories moved, the relative paths reflect the final structure.

**Import mapping rules** (examples from new locations):
- From `src/core/base-page.ts`: `../utils/logger`, `../utils/retry-telemetry`, `../types`
- From `src/pages/auth/home.page.ts`: `../../utils/logger`, `../../types`
- From `src/pages/setup/locations/*.page.ts`: `../../../utils/logger`, `../../../types`
- From `tests/infra/fixtures.ts`: `../../src/utils/logger`, `../../src/pages/auth/login.page`, etc.
- From `tests/infra/auth.setup.ts`: `../../src/utils/credential-loader`, `../../src/pages/auth/login.page`
- From `tests/infra/global-setup.ts`: `../../src/utils/logger`, `../../src/utils/credential-loader`

**Files to modify (23 unique in client code)**:

*In `src/` (within-tree, short relative paths):*
- `src/core/base-page.ts` — `../utils/logger`, `../utils/retry-telemetry`, `../types`
- `src/pages/auth/home.page.ts` — `../../utils/logger`, `../../types`
- `src/pages/auth/login.page.ts` — same
- `src/pages/setup/local-office/local-office-settings.page.ts` — `../../../utils/logger`, `../../../types`
- `src/pages/setup/locations/*.page.ts` (11 files) — `../../../utils/logger`, `../../../types`

*In `tests/` (cross-tree, `../../src/`):*
- `tests/infra/auth.setup.ts` — `../../src/utils/*`, `../../src/pages/auth/login.page`
- `tests/infra/auth-storage.ts` — `../../src/utils/retry-telemetry`
- `tests/infra/fixtures.ts` — ALL `@client/*` + `@framework/*` → relative (biggest file: ~17 imports)
- `tests/infra/global-setup.ts` — `../../src/utils/logger`, `../../src/utils/credential-loader`
- `tests/infra/global-teardown.ts` — `../../src/utils/logger`

*Specs need update if they import from `../setup/`*: grep `tests/specs/` for `../setup/` and rewrite to `../../infra/`.

**Part C: Delete vendoring**

- Delete `clients/encore/dist/framework/` (entire — 55 files)
- Delete `clients/encore/playwright.config.ci.ts`

**Part D: Modify configs**

**`tsconfig.json`**:
- Remove ALL `paths` entries: `@client/*`, `@framework/*`, `@client-tests/*` — entire `paths` object
- Remove `"dist/framework/**/*.d.ts"` from `include`
- Remove `"api-testing/**/*.ts"` from `include`

**`playwright.config.ts`**:
- Update `globalSetup` path: `./tests/setup/global-setup` → `./tests/infra/global-setup`
- Update `globalTeardown` path: `./tests/setup/global-teardown` → `./tests/infra/global-teardown`
- Remove `['./dist/framework/utils/agent-reporter.js']` from reporter array
- Remove `'api-testing/**/*.spec.ts'` from `testMatch`
- Add CI-specific branches from `playwright.config.ci.ts`:
  - `testIgnore: process.env.CI ? ['**/examples/**', '**/api-testing/**'] : ['**/examples/**']`
  - `timeout: process.env.CI ? 60 * 1000 : 30 * 1000`
  - `trace: getArtifactSetting('ENABLE_TRACING', process.env.CI ? 'on-first-retry' : 'retain-on-failure')`
  - Add `encore-local-office` and `encore-locations` module projects (from CI config)
- Unexport `getArtifactSetting` (was only exported for CI config import)

**`.github/workflows/playwright-tests.yml`** (line 45):
- Change `--config=playwright.config.ci.ts` to `--config=playwright.config.ts`

**`.gitignore`** — add entries notes has that encore is missing:
```
CLAUDE.md
specs_planning/
readable_externals/
docs/read_only_docs/
exports/
.auth/
config/environments/.env.server
```

**Verify**: `npm run typecheck` passes. `npx playwright test --list` succeeds.

---

### Commit 3 — Update ALL framework/doc references to new paths (D10)

Mechanical find-and-replace across the repo for the 4 path changes. Historical
documents (`plans/done/`, `reports/`) are NOT touched — they're frozen audit trail.

**Path substitutions**:
- `tests/setup/` → `tests/infra/`
- `src/common/` → `src/core/`
- `src/pages/home.page` → `src/pages/auth/home.page`
- `src/pages/login.page` → `src/pages/auth/login.page`

**Files to update (17)**:

*Framework docs (4):*
- `docs/read_only_docs/AGENT_SHARED_RULES.md`
- `docs/read_only_docs/ARCHITECTURE.md`
- `docs/read_only_docs/COMMENTING_STANDARDS.md`
- `docs/README.md`

*Agent/context configs (1):*
- `.claude/context/navigation.md`

*Framework scripts (2):*
- `scripts/identity-ownership.mjs`
- `scripts/generator-pre-run.ts`

*Pipeline examples (3):*
- `pipeline/tests/examples/basic-test-pattern.spec.ts`
- `pipeline/tests/examples/data-driven-pattern.spec.ts`
- `pipeline/tests/examples/session-reuse-pattern.spec.ts`

*Active pending plans (7 — only those not superseded by this plan):*
- `plans/pending/PLAN_DQU_V6_PILOT_SHARED_SETUP.md`
- `plans/pending/PLAN_EMERGENCY_01_HIST_ARCH_AND_BUG_GUARDS_2026_05_15.md`
- `plans/pending/PLAN_ENCORE_CI_2W_GREEN.md`
- `plans/pending/SUBPLAN_DQU_22_G2_PRE_TEST_SLATE_CLEAR.md`
- `plans/pending/SUBPLAN_REPO_12_TEST_INFRASTRUCTURE_AUDIT.md`
- `plans/pending/PLAN_MAINTAINER_SWEEP.md`
- `plans/pending/PLAN_GENERATOR_AUDIT_AUTO_ADDON.md`
  (3 more pending plans reference these paths — `SUBPLAN_REPO_10`, `PLAN_PLAYWRIGHT_CLI_ADOPTION`, `PLAN_CODEBASE_CLEANUP` — update those too)

**NOT updated (frozen history — 40+ files):**
- `plans/done/*.md` — historical records, paths were correct at time of writing
- `reports/*.md` — historical reports

**Verify**: grep `tests/setup/` and `src/common/` across all non-done, non-report files returns zero hits.

---

### Commit 4 — Replace scripts + trim deps + drop api-testing + test.xlsx

All removals in one commit — no broken intermediate state.

**Files to DELETE**:
- `clients/encore/scripts/archive-allure.js`
- `clients/encore/scripts/archive-html.js`
- `clients/encore/scripts/ensure-report-dirs.js`
- `clients/encore/scripts/preserve-allure-history.js`
- `clients/encore/scripts/preserve-failure-summary.js`
- `clients/encore/scripts/run-test-daily.js` (untracked-on-disk; delete from disk)
- `clients/encore/api-testing/` (entire — 4 files)
- `clients/encore/tests/test-data/test.xlsx`

**Modify `clients/encore/package.json`**:

Scripts section:
```json
{
  "test":           "playwright test --config=playwright.config.ts",
  "test:headed":    "playwright test --config=playwright.config.ts --headed",
  "test:chrome":    "playwright test --config=playwright.config.ts --project=chrome",
  "test:debug":     "playwright test --config=playwright.config.ts --debug",
  "test:ui":        "playwright test --config=playwright.config.ts --ui",
  "test:failed":    "playwright test --config=playwright.config.ts --last-failed",
  "test:grep":      "playwright test --config=playwright.config.ts --grep",
  "test:cli":       "node scripts/test-cli.js",
  "report":         "playwright show-report reports/html-report",
  "allure:generate":"npx allure generate reports/allure-results --clean -o reports/allure-report",
  "allure:open":    "npx allure open reports/allure-report",
  "allure:report":  "npm run allure:generate && npm run allure:open",
  "setup":          "npm install && npx playwright install",
  "setup:browsers": "npx playwright install chromium firefox webkit",
  "clean":          "rimraf reports/allure-results reports/allure-report reports/diagnostics reports/walkthrough reports/html-report reports/test-results reports/test-results.json reports/failure-summary.json reports/junit-results.xml logs/test-execution.log",
  "typecheck":      "tsc --noEmit"
}
```

Removed scripts: `test:firefox`, `test:webkit` (unnecessary convenience — `npx playwright test --project=firefox` works), `test:daily`, `reports:archive`, `clean:reports`, `clean:results`, `build:framework`.

Dependencies — remove:
- `@aws-sdk/client-s3` (unused — no S3 adapter after dist/framework/ deletion)
- `axios` (unused — api-testing deleted this commit)
- `exceljs` (unused — no Excel adapter after dist/framework/ deletion)
- `knex` (unused — no DB adapter after dist/framework/ deletion)
- `xlsx` (unused — same reason)

Keep: `dotenv-flow`, `proper-lockfile` (still used by `tests/setup/auth-storage.ts`).
Do NOT add `otplib` (D6 — encore doesn't use TOTP).

**Verify**: `npm install` succeeds. `npm run typecheck` passes. `npx playwright test --list`.

---

### Commit 5 — Survival comments + README update + 7-day diagnostics cleanup

**ADD header comments** (Decision D3 — survive moron-review):

1. Top of `clients/encore/tests/setup/dependency-gate.ts`:
   ```typescript
   /**
    * DO NOT DELETE: LR-019 Baseline-Reset Gate.
    *
    * Several Encore specs follow a "TC-001 resets baseline -> TC-002+ tests
    * variations" pattern (Location Settings tabs, History views). Without
    * this gate, Playwright's default parallel ordering would run TC-002+
    * against whatever state the previous run left behind, producing random
    * intermittent failures that look like product bugs.
    *
    * This gate forces TC-001 to complete first inside each spec file, and
    * pairs with `fullyParallel: false` in playwright.config.ts.
    *
    * If removing: first prove every spec is stateless. Start with
    * location-management-history.spec.ts and location-currency.spec.ts
    * (both observed to fail without the gate).
    */
   ```

2. Verify `playwright.config.ts` `fullyParallel: false` comment (lines 28-34) is intact after Commit 2 merge.

3. Top of `clients/encore/src/utils/diagnostics-collector.ts`:
   ```typescript
   /**
    * Captures DOM snippet, console messages, and network failures on test
    * failure. Attached to every page via the diagnosticsHandler fixture in
    * tests/setup/fixtures.ts. Output aged out after 7 days by global-setup.ts.
    */
   ```

4. Port 7-day diagnostics cleanup from `C:\Users\rutvi\projects\notes\tests\infra\global-setup.ts`
   into `clients/encore/tests/setup/global-setup.ts` if not already present. Add comment:
   ```typescript
   // Age out diagnostic snapshots older than 7 days. Without this, the
   // reports/diagnostics/ folder grows unbounded on long-lived CI agents.
   ```

**Update `clients/encore/README.md`**:
- Replace `npm run test:daily` with `npm run test:cli`
- Remove mention of `api-testing/` if any
- Remove mention of the 5 deleted report scripts
- Remove mention of `dist/framework/` or `build:framework`
- Confirm documented commands match new `package.json` scripts

**Verify**: Full verification suite (section 5).

---

## 5. Parallel track — Clean notes reference (`C:\Users\rutvi\projects\notes`)

**Separate changes in the notes project** (D7):

**Modify `package.json`** — remove unused deps:
- `@aws-sdk/client-s3`, `axios`, `exceljs`, `knex`, `xlsx`
- Remove `build:framework` script (dead — no vendored framework in notes)

**Modify `playwright.config.ts`**:
- Remove `'api-testing/**/*.spec.ts'` from `testMatch` (no api-testing directory exists)

**Modify `tsconfig.json`**:
- Remove `"api-testing/**/*.ts"` from `include` (no api-testing directory exists)

**Verify**: `npm install && npm run typecheck && npx playwright test --list`.

---

## 6. End-to-end verification (after all 5 encore commits)

1. **TypeScript clean**: `cd clients/encore && npm run typecheck` — no errors
2. **Playwright dry list**: `npx playwright test --list` — all specs listed, no resolution failures
3. **No alias remnants**: grep entire `clients/encore/src` and `clients/encore/tests` for `@framework/`, `@client/`, `@client-tests/` — zero hits
4. **No old-path remnants in client code**: grep `clients/encore/` for `tests/setup/`, `src/common/`, `src/pages/home.page`, `src/pages/login.page` — zero hits
5. **No old-path remnants in live docs**: grep `docs/`, `.claude/`, `scripts/`, `pipeline/`, `plans/pending/` for `tests/setup/`, `src/common/` — zero hits (done plans exempted)
6. **Directory structure matches notes**: verify `src/core/` exists (not `src/common/`), `tests/infra/` exists (not `tests/setup/`), `src/pages/auth/` contains home+login, `tests/specs/smoke/seed.spec.ts` exists
7. **Local CLI run**: `npm run test:cli` — tests execute, Allure report generates
8. **History preservation**: Run `npm run test:cli` twice. Second run shows 2 data points in Allure Trend
9. **Ship dry-run**: `npm run client:ship -- --client=encore --out=/tmp/encore-trimmed-dryrun --force`
   - No `dist/framework/`, `api-testing/`, `test.xlsx`, deleted scripts in output
   - No `CLAUDE.md`, `specs_planning/`, `exports/`, `readable_externals/` in output
   - `npm install && npx playwright test --list` inside output folder succeeds
10. **Straggler grep audit** — each returns zero hits in `clients/encore/`:
    - `@framework/`, `@client/`, `@client-tests/` (alias remnants)
    - `dist/framework`, `agent-reporter`
    - `preserve-allure-history`, `archive-allure`, `archive-html`, `run-test-daily`
    - `api-testing`, `test.xlsx`, `exceljs`, `xlsx`, `knex`, `@aws-sdk/client-s3`

---

## 7. Things flagged as out-of-scope (from original plan, still valid)

1. **JSON test-data files** — notes has hybrid pattern (.json + .data.ts); encore is all-.data.ts. Separate refactor.
2. **CI Allure history retention** — `simple-elf/allure-report-action` for cross-run history in GitHub Actions. Opt-in addition.
3. **Pre-commit hooks / linting** — neither has ESLint/Prettier/husky. Separate addition if reviewer demands.
4. **CONTRIBUTING.md** — neither has one. README is the only entry point.
5. **LICENSE file** — both say `"license": "UNLICENSED"` with no LICENSE file. Flag for legal.

---

## 8. Audit findings addressed (traceability)

| Finding | Severity | Resolution in this plan |
|---|---|---|
| F1 Import rewrite over-engineered | CRITICAL | User chose relative paths (D5) — rewrite happens but to relative, not @client/* |
| F2 otplib/TOTP mismatch | CRITICAL | Skip TOTP (D6) — port only initProp() from repo-root |
| F3 Commit ordering bug | CRITICAL | Merged deps+api-testing deletion into one commit (Commit 3) |
| F4 CI workflow update missing | CRITICAL | Explicit step in Commit 2 Part C |
| F5 Notes has same dep bloat | CRITICAL | Trim notes too (D7, section 5) |
| F6 Clean script downgraded | HIGH | Keep granular script (D8) |
| F7 .gitignore gaps | HIGH | Add all missing entries in Commit 2 |
| F8 Missing diagnostics.ts | HIGH | Added to Commit 1 as file #6 |
| F9 getArtifactSetting export | HIGH | Unexport in Commit 2 Part C |
| F10 Source ambiguity | MEDIUM | Rule: notes for everything notes has, repo-root for retry-telemetry only |
| F11 test:firefox reasoning | MEDIUM | Corrected reasoning in Commit 3 script section |
| F12 Dead api-testing config refs | MEDIUM | Removed from tsconfig include in Commit 2 |
| F13 fullyParallel difference | MEDIUM | Acknowledged in section 3 (structural differences) |
| F14 Directory structure diffs | MEDIUM | Acknowledged in section 3 (kept as-is with rationale) |
| F15 dist/framework include | MEDIUM | Removed in Commit 2 (was already in original plan) |

---

## 9. Critical files reference

**Port sources (read before creating)**:
- `C:\Users\rutvi\projects\notes\src\utils\logger.ts` → Commit 1 file #1
- `C:\Users\rutvi\projects\notes\src\utils\diagnostics-collector.ts` → Commit 1 file #2
- `C:\Users\rutvi\projects\encore_framework\src\utils\common-methods.ts` (repo-root, NOT notes) → Commit 1 file #3
- `C:\Users\rutvi\projects\notes\src\utils\credential-loader.ts` → Commit 1 file #4
- `C:\Users\rutvi\projects\notes\src\types\index.ts` → Commit 1 file #5
- `C:\Users\rutvi\projects\notes\src\types\diagnostics.ts` → Commit 1 file #6
- `C:\Users\rutvi\projects\encore_framework\src\utils\retry-telemetry.ts` (repo-root) → Commit 1 file #7
- `C:\Users\rutvi\projects\notes\tests\infra\global-setup.ts` (7-day cleanup block) → Commit 4

**Configs to modify**:
- `clients/encore/tsconfig.json` — Commit 2 (remove paths, includes)
- `clients/encore/playwright.config.ts` — Commit 2 (merge CI config, drop reporter + testMatch)
- `clients/encore/playwright.config.ci.ts` — Commit 2 (read then delete)
- `clients/encore/.github/workflows/playwright-tests.yml` — Commit 2 (config reference)
- `clients/encore/.gitignore` — Commit 2 (add entries)
- `clients/encore/package.json` — Commit 3 (deps + scripts)
- `clients/encore/README.md` — Commit 4

**Files to delete** (total):
- `clients/encore/dist/framework/` (55 files) — Commit 2
- `clients/encore/playwright.config.ci.ts` — Commit 2
- `clients/encore/scripts/archive-allure.js` — Commit 3
- `clients/encore/scripts/archive-html.js` — Commit 3
- `clients/encore/scripts/ensure-report-dirs.js` — Commit 3
- `clients/encore/scripts/preserve-allure-history.js` — Commit 3
- `clients/encore/scripts/preserve-failure-summary.js` — Commit 3
- `clients/encore/scripts/run-test-daily.js` — Commit 3
- `clients/encore/api-testing/` (4 files) — Commit 3
- `clients/encore/tests/test-data/test.xlsx` — Commit 3

---

## 10. Done definition

- All 5 commits land green (typecheck + `--list` + `client:ship` smoke each commit)
- All straggler greps in section 6 (items 3-5, 10) return zero results
- Directory structure matches notes exactly: `src/core/`, `src/pages/auth/`, `tests/infra/`, `tests/specs/smoke/`
- `npm run test:cli` runs locally + Allure trend data after 2nd run
- Shipped deliverable contains NO internal artifacts (CLAUDE.md, specs_planning, exports, etc.)
- `README.md` documents `test:cli` and no deleted scripts
- Header comments in place on dependency-gate + diagnostics-collector + global-setup
- Notes reference also trimmed (section 5 changes applied)
- Zero path aliases remain in tsconfig — all imports are relative
- All 17 live doc/config/pending-plan files updated with new paths (Commit 3)
- Zero references to old paths (`tests/setup/`, `src/common/`) in live (non-done) files
