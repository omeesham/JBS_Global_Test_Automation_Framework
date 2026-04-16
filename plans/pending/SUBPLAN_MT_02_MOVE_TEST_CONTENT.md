# SUBPLAN MT-02: Move Encore Test Content

**Status**: PENDING
**Priority**: P0
**Parent**: PLAN_MULTI_TENANT_RESTRUCTURE
**Created**: 2026-04-16
**Depends on**: SP-MT-01 (scaffold, aliases, env var must exist)
**Blocks**: SP-MT-03

---

## Goal

Relocate all encore-specific test code into `clients/encore/` and rewrite imports via aliases. After this subplan: the active code layout is multi-tenant; every spec lives under `clients/encore/tests/specs/...`; framework-shared code still at root; everything still runs.

---

## Scope

### 1. `git mv` file relocations

**Source code** (encore-specific):
- `src/pages/*` → `clients/encore/src/pages/*` (13 files: login.page, home.page, index.ts, setup/locations/*.page.ts, setup/local-office/*.page.ts)
- `src/selectors/*` → `clients/encore/src/selectors/*` (17 files including SELECTOR_CATALOG.md, dynamic.ts, login.ts, setup/...)
- `src/common/base-page.ts` → `clients/encore/src/common/base-page.ts`
- `src/utils/app-constants.ts` → `clients/encore/src/utils/app-constants.ts`

**Tests** (encore-specific):
- `tests/setup/fixtures.ts` → `clients/encore/tests/setup/fixtures.ts`
- `tests/setup/global-setup.ts` → `clients/encore/tests/setup/global-setup.ts`
- `tests/setup/global-teardown.ts` → `clients/encore/tests/setup/global-teardown.ts`
- `tests/setup/custom-matchers.ts` → `clients/encore/tests/setup/custom-matchers.ts`
- `tests/specs/setup/locations/` → `clients/encore/tests/specs/setup/locations/` (9 specs)
- `tests/specs/setup/local-office/` → `clients/encore/tests/specs/setup/local-office/` (3 specs)
- `tests/test-data/common.data.ts`, `test.xlsx`, `downloads/` → `clients/encore/tests/test-data/`
- `tests/test-data/setup/locations/`, `tests/test-data/setup/local-office/` → `clients/encore/tests/test-data/setup/...`
- `tests/seed.spec.ts` → `clients/encore/tests/seed.spec.ts`

**Keep at root**:
- `src/utils/` everything except `app-constants.ts` (incl. logger, common-methods, file-utils, diagnostics-collector, agent-reporter, selector-registry-validator, bug-hunt-classifier, dom-diff, agent-notification-writer, index.ts barrel — minus the app-constants export)
- `src/common/credential-loader.ts` (generic env-driven)
- `src/framework-contracts/*`, `src/orchestrator/*`, `src/worker/*`, `src/data/*`, `src/server/*`
- `tests/examples/`, `tests/unit/` (if any)

**Investigate during session** (audit, don't pre-decide):
- `api-testing/` — if all contents reference encore APIs, move to `clients/encore/api-testing/`; else leave at root.
- `src/server/` — check for encore-specific models/routes; leave at root if generic.
- `src/utils/index.ts` barrel — prune `app-constants` re-export; verify no other consumer breaks.

### 2. Import rewrites

**Pattern changes**:
- Specs: `import { test, expect } from '../../../setup/fixtures'` — path depth identical within client, stays `../../../setup/fixtures`.
- Pages → framework utilities: rewrite `../../../utils/logger` → `@framework/utils/logger`.
- Pages → framework base contracts: `../../../framework-contracts` → `@framework/framework-contracts`.
- Pages → client selectors: `../../../selectors` → `@client/selectors` (or keep relative — pick one convention and apply uniformly).
- Pages → base-page: `../../../common/base-page` → `@client/common/base-page` (base-page is now client).
- Fixtures → pages: `../../src/pages/*` → `@client/pages/*`.
- Fixtures → framework utils: `../../src/utils/*` → `@framework/utils/*`.
- Fixtures → framework common: `../../src/common/credential-loader` → `@framework/common/credential-loader`.
- test-data with selector import (`location-local-info.data.ts`): `../../../../src/selectors` → `@client/selectors`.

**Rule**: use aliases for cross-tier imports (client ↔ framework). Within the same tier, relative imports are fine.

### 3. Alias resolution update

Flip `tsconfig.json` alias targets from SP-MT-01 placeholders to final:
- `@framework/*` → `["src/*"]` (unchanged)
- `@client/*` → `["clients/encore/src/*"]`
- `@client-tests/*` → `["clients/encore/tests/*"]`

If a future 2nd client needs different resolution, that's SP-MT-06/07 territory; SP-MT-02 hardcodes `encore`.

### 4. `playwright.config.ts` updates

- `testDir`: derive from `process.env.ACTIVE_CLIENT` → `clients/encore/tests`.
- `globalSetup`: `./clients/encore/tests/setup/global-setup`.
- `globalTeardown`: `./clients/encore/tests/setup/global-teardown`.
- `testMatch`: unchanged pattern.
- Reporter `./src/utils/agent-reporter.ts`: unchanged (framework).
- Allure categories path: unchanged this subplan (SP-MT-03 moves the file).

---

## Verification

```
# 1. Types
npm run typecheck

# 2. Specs listed correctly
npx playwright test --list | grep -c 'clients/encore/tests/specs/' # expect 12 (non-seed specs)

# 3. One module end-to-end
npm test -- --project=chrome clients/encore/tests/specs/setup/locations/location-pricing.spec.ts

# 4. Full test suite
npm test

# 5. Git sanity
git status | grep -v 'clients/\|tsconfig.json\|playwright.config.ts\|src/utils/index.ts' | grep 'modified\|renamed\|deleted'
# expect no unexpected touches
```

All specs that passed before SP-MT-02 must still pass after. Diff-only changes are import paths.

---

## Out of scope

- Moving docs, specs_planning, exports, config/environments, config/allure — SP-MT-03.
- Refactoring scripts to use `shared-paths.ts` — SP-MT-04 (pipeline scripts will still reference old `specs_planning/` paths; those paths haven't moved yet).
- Splitting CLAUDE.md — SP-MT-05.
- Parameterizing agents — SP-MT-06.

---

## Risks

- **`fixtures.ts` dependency graph**: imports 14 page classes. Move one-at-a-time with typecheck between each `git mv` to catch depth miscounts early.
- **Barrel exports**: `src/utils/index.ts` currently re-exports `AppConstants`. After the move, either (a) delete the re-export and update downstream consumers, or (b) create a parallel barrel at `clients/encore/src/utils/index.ts` that re-exports `app-constants` alongside framework re-exports. Recommendation: (a) — fewer places for stale re-exports to accumulate.
- **Playwright test discovery on Windows**: case-sensitive imports under different path depth sometimes miscompile. Verify specifically on Windows shell.
- **Circular alias risk**: `@client` → `@framework` → ??? If any framework file ends up importing `@client/*`, that's a design bug. Grep `src/` for `@client` after migration — should be zero hits.
- **VS Code / IDE tooling**: some IDEs cache tsconfig paths. Document in README: "Reload TypeScript server after alias changes."

---

## Critical files (touch list)

**Moved** (~60 files via `git mv`).

**Edited**:
- `tsconfig.json` (alias targets flipped to clients/encore)
- `playwright.config.ts` (testDir, globalSetup, globalTeardown)
- `src/utils/index.ts` (prune AppConstants export)
- Every spec, page, fixture, and test-data file with updated imports (~39 TS files)

**New**: none beyond what SP-MT-01 created.

---

## Session checklist

- [ ] Move in small batches (pages first, then selectors, then fixtures, then specs). Typecheck after each batch.
- [ ] Alias flip committed as its own step so a rollback is cheap.
- [ ] Verification 1–5 all green.
- [ ] Activity log entry (LR-028, LR-037).
- [ ] Status DONE, move to `plans/done/` (LR-027) with execution summary.
- [ ] `npm run plans:reindex`.
