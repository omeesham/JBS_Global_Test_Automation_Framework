# PLAN: Runnable Bundle Smoke Test (colleague validation)

**Status**: PENDING
**Priority**: P1 (second only to your current top-priority task; MT audit is parked behind this)
**Created**: 2026-04-20
**Parent**: none (peer to `PLAN_MT_AUDIT.md`)
**Blocks**: `PLAN_MT_AUDIT.md` execution decision (its fate depends on this outcome)

---

## Context

Colleague asked (verbatim, 2026-04-20):

> *"Give claude request to separate the code with executable files only that are required to run the test scripts and try to save in different folder and open using another VS code window and try to install playwright and run `npx playwright test`"*

**Model (clarified 2026-04-20)**:
- **Deliverable = `clients/encore/` + framework root**. The multi-tenant restructure IS the deliverable. **No duplicate folder inside the repo.** Colleague pulls the whole repo, gitignores the parts they don't need (per `HANDOFF_TO_COLLEAGUE.md` §3), and ships what remains to Encore.
- **This plan is validation-only**. A *temporary, ephemeral* sandbox OUTSIDE the repo proves that the runnable subset stands alone. Sandbox is deleted after the smoke test.

**Why**: static checks (`PLAN_MT_AUDIT.md`) are a proxy; a working `npx playwright test` in an isolated folder is ground truth. If the sandbox runs green, the restructure is provably clean and colleague's gitignore list is directly derivable from what we copied. If it fails, failures self-diagnose the exact leakage.

---

## Goal

Produce a new artifact: **`BUNDLE_MANIFEST.md`** at repo root, listing the exact minimal set of paths required to run the encore test suite in isolation, plus a **smoke-test report** proving that list works. Colleague consumes the manifest to know what to keep vs gitignore.

**Not goals**: permanent packager; committing sandbox to git; modifying `clients/encore/` contents; running the MT audit.

---

## Definitive inclusion list (post-research 2026-04-20)

Grounded in reads of `playwright.config.ts`, `tsconfig.json`, `clients/encore/tests/setup/fixtures.ts`, `src/utils/index.ts`, `src/utils/diagnostics-collector.ts`, `src/utils/agent-reporter.ts`, `src/common/credential-loader.ts`, `package.json`.

### KEEP — framework root
- `playwright.config.ts` (imports `./src/utils/agent-reporter.ts`, reads `./${CLIENT_ROOT}/config/allure/categories.json`, resolves `globalSetup`/`globalTeardown` at `${CLIENT_ROOT}/tests/setup/`)
- `playwright.config.ci.ts`
- `tsconfig.json` (path aliases `@framework/*` → `src/*`, `@client/*` → `clients/encore/src/*`, `@client-tests/*` → `clients/encore/tests/*`)
- `package.json`, `package-lock.json`
- `.gitignore`

### KEEP — `src/` (framework runtime only)
- `src/framework-contracts/**` — all contracts; types imported transitively via `diagnostics-collector.ts` and `agent-reporter.ts`
- `src/utils/index.ts` — barrel
- `src/utils/logger.ts` — Log, Logger (re-exported)
- `src/utils/common-methods.ts` — CommonMethods (re-exported; fixtures)
- `src/utils/file-utils.ts` — FileUtils (re-exported)
- `src/utils/diagnostics-collector.ts` — imported by fixtures; no pipeline deps (verified — imports only `@playwright/test` + framework-contracts)
- `src/utils/agent-reporter.ts` — referenced by `playwright.config.ts` reporter; no pipeline deps (verified)
- `src/utils/bug-hunt-classifier.ts`, `src/utils/dom-diff.ts` — include defensively (small; may be imported transitively)
- `src/common/credential-loader.ts` — imported by fixtures
- `src/data/**` IF present and has non-test runtime code (adapters for data-driven specs). Verify during Step 1 of execution.

### KEEP — `clients/encore/`
- `clients/encore/src/**` — pages, selectors, common, utils (includes the moved `AppConstants`)
- `clients/encore/tests/**` — specs + setup (`fixtures.ts`, `global-setup.ts`, `global-teardown.ts`, `custom-matchers.ts`, `seed.spec.ts`)
- `clients/encore/api-testing/**` IF present (listed in `testMatch`)
- `clients/encore/config/environments/.env.development` — creds (plain-text by design per root CLAUDE.md §Security Rules)
- `clients/encore/config/environments/.env.example`
- `clients/encore/config/allure/categories.json` — required by `playwright.config.ts` reporter

### EXCLUDE — NEVER copy
- `src/utils/agent-notification-writer.ts` — writes to `specs_planning/_internal/`, pipeline-only
- `src/orchestrator/`, `src/worker/`, `src/server/` — SaaS-side, not test runtime
- `src/data/adapters/__tests__/` — framework unit tests, not encore runtime
- `.claude/`, `.github/`, `plans/`, `docs/` (root), `website/`
- All `scripts/*` EXCEPT `scripts/cleanup-logs.ts` if keeping the `pretest` hook (simpler: strip pretest hook from package.json copy; see Step 2)
- `clients/encore/CLAUDE.md` — agent-only
- `clients/encore/docs/**` — agent-/planning-only (REQUIREMENTS, MODULE_REGISTRY, AGENT_RULES_ENCORE, read_only_docs). Verified: no runtime imports.
- `clients/encore/specs_planning/**` — internal agent state + test-cases/test-plans/audits
- `clients/encore/exports/**` — CSVs; non-runtime
- `HANDOFF_TO_COLLEAGUE.md`, root `CLAUDE.md`, root `AGENT_SHARED_RULES.md`, all `*.agent.md`
- `.auth/`, `reports/`, `test-results/`, `allure-results/`, `allure-report/`, `logs/`, `playwright-report/`, `.build/`, `node_modules/`, `.git/`
- `tsconfig.build.json`, `tsconfig.server.json` (only used by `build` and `build:server` scripts, both pipeline-class)

### MODIFY — `package.json` in sandbox
Two options, pick during Step 2 execution:
- **Minimal** (recommended): copy as-is; only the `test`, `test:chrome`, `setup`, `setup:browsers`, `clean`, `clean:reports`, `report`, `allure:*` scripts matter; others will simply fail if invoked (not invoked during smoke test).
- **Pruned**: strip `scripts` block down to test-essentials; remove `pretest` hook (eliminates need for `scripts/cleanup-logs.ts`).

Either is fine for smoke test. Pruning only matters if colleague plans to read `package.json` as documentation.

---

## Approach (execute in next session)

### Step 1 — Sandbox location
Destination: `C:\Users\rutvi\projects\encore_bundle_sandbox\` (sibling of `encore_framework/`). Confirmed outside repo. Deleted after smoke test. Do NOT commit to git.

### Step 2 — Copy
Use Git Bash `cp -rp` (safer on Windows than robocopy for path-alias paths). Preserve relative layout — `clients/encore/...` must resolve at the same relative paths in the sandbox.

Script outline (not executed here):
```bash
SRC=/c/Users/rutvi/projects/encore_framework
DST=/c/Users/rutvi/projects/encore_bundle_sandbox
mkdir -p "$DST"
# Root files
cp -p "$SRC"/{playwright.config.ts,playwright.config.ci.ts,tsconfig.json,package.json,package-lock.json,.gitignore} "$DST/"
# Framework src (selective)
mkdir -p "$DST/src"
cp -rp "$SRC/src/framework-contracts" "$SRC/src/common" "$DST/src/"
mkdir -p "$DST/src/utils"
# utils minus agent-notification-writer
for f in "$SRC"/src/utils/*.ts; do
  base=$(basename "$f")
  [[ "$base" == "agent-notification-writer.ts" ]] && continue
  cp -p "$f" "$DST/src/utils/"
done
# src/data — conditional, if exists and has non-test runtime code
[ -d "$SRC/src/data" ] && cp -rp "$SRC/src/data" "$DST/src/" && rm -rf "$DST/src/data/adapters/__tests__" 2>/dev/null
# Client content
mkdir -p "$DST/clients"
cp -rp "$SRC/clients/encore" "$DST/clients/"
# Strip non-runtime from client copy
rm -rf "$DST/clients/encore/specs_planning"
rm -rf "$DST/clients/encore/docs"
rm -rf "$DST/clients/encore/exports"
rm -f "$DST/clients/encore/CLAUDE.md"
```

### Step 3 — Fresh install
```bash
cd /c/Users/rutvi/projects/encore_bundle_sandbox
npm install          # uses package-lock.json for reproducibility
npx playwright install chromium    # ~500MB; chromium only to save time
```

### Step 4 — Smoke tests (order matters)
```bash
# 4a — typecheck (catches path alias / missing module errors before runtime)
npx tsc --noEmit

# 4b — spec discovery
ACTIVE_CLIENT=encore npx playwright test --list | tail -40

# 4c — seed (auth smoke; proves SSO + creds + fixtures work in isolation)
ACTIVE_CLIENT=encore npx playwright test clients/encore/tests/seed.spec.ts --project=chromium

# 4d — ONE real spec end-to-end (pick a fast one, e.g. location-currency or shared-setup)
ACTIVE_CLIENT=encore npx playwright test clients/encore/tests/specs/setup/locations/location-currency.spec.ts --project=chromium --reporter=line
```

If 4a-4c pass, bundle is validated. 4d is confirmation.

### Step 5 — Capture outcome
Write two files BACK IN THE MAIN REPO:

**5a** — `BUNDLE_MANIFEST.md` at repo root:
- Final inclusion list (post-Step-1 refinement)
- Final exclusion list
- Rationale per excluded category (why it's safe to exclude)
- One-line usage: *"Colleague: pull the repo, gitignore everything NOT in this manifest, ship."*

**5b** — `reports/bundle-smoke-2026-04-<DD>.md`:
- npm install tail (exit code, warnings)
- typecheck result (errors if any)
- Spec discovery count
- Seed-spec pass/fail
- Real-spec pass/fail + runtime
- Any absolute or relative path in sandbox pointing OUTSIDE the sandbox (leakage — indicates restructure gap)
- Sandbox path for reproduction

### Step 6 — Cleanup
Delete `C:\Users\rutvi\projects\encore_bundle_sandbox\` after report is written. Add to `.gitignore` in case anyone recreates with that name inside the repo by accident.

### Step 7 — Feed back to colleague
Forward `BUNDLE_MANIFEST.md` + smoke-test report. Colleague validates by repeating Steps 2–4 themselves.

### Step 8 — Decide MT audit fate
- **Bundle all green** → move `PLAN_MT_AUDIT.md` to `done/` with execution summary *"superseded by bundle smoke test — bundle outcome IS the correctness proof"*. Skip audit.
- **Bundle any red** → resume `PLAN_MT_AUDIT.md` execution per its patched INVOCATION. Use bundle failures to seed audit findings.

---

## Acceptance criteria

Bundle is **validated** when all:
1. `npm install` exits 0.
2. `npx playwright install chromium` exits 0.
3. `npx tsc --noEmit` shows zero errors (path aliases resolve).
4. `npx playwright test --list` discovers ≥ 12 specs.
5. `seed.spec.ts` passes.
6. One real spec passes.
7. `grep -rnE "(\.\./)+(encore_framework|\.claude|\.github|^plans/)" sandbox --include='*.ts' --include='*.json'` returns zero code-referencing hits (comments/docs allowed).

If ≥ 1 fails: report specifics, do NOT patch proactively. User decides scope.

---

## Critical files

**Read during execution (this repo)**:
- `playwright.config.ts`, `tsconfig.json`, `package.json`
- `clients/encore/tests/setup/fixtures.ts` (confirm import set hasn't shifted)
- `src/utils/index.ts`

**Write during execution**:
- Sandbox: `C:\Users\rutvi\projects\encore_bundle_sandbox\**` (ephemeral, outside repo)
- In repo: `BUNDLE_MANIFEST.md` (new, root), `reports/bundle-smoke-2026-04-<DD>.md` (new)
- Append: `clients/encore/specs_planning/_internal/agent-activity-log.md` (LR-028 row)

**Do NOT modify**:
- `clients/encore/**` contents (except reading)
- `src/**` contents
- Any other plan file

---

## Risks

- **`src/utils/agent-reporter.ts` pipeline coupling** — it's referenced by `playwright.config.ts` reporter chain. Verified to import only `fs`, `path`, `@playwright/test/reporter`, `../framework-contracts/diagnostics`. No `specs_planning/` writes at runtime. Safe to include.
- **`pretest` hook** (`ts-node scripts/cleanup-logs.ts`) — runs before `npm test`. If `scripts/cleanup-logs.ts` is excluded, `npm test` fails. Mitigation: either include `scripts/cleanup-logs.ts` OR use `npx playwright test` directly (bypasses pretest hook) — the Step 4 commands already use `npx playwright test` directly.
- **Windows path length** — nested paths like `clients/encore/specs_planning/_internal/...` are excluded anyway. Sibling folder keeps worst-case path length manageable.
- **Credentials in `.env.development`** — bundle includes plain-text creds for local smoke test. Sandbox is local and deleted; no exfiltration risk. Flag in manifest that colleague must re-issue before client handoff.
- **`.auth/` regen** — not copied; first seed run does full SSO flow (~30s). Subsequent runs reuse sandbox-local `.auth/`.
- **Disk space** — sandbox `node_modules/` ~400MB + Playwright browser ~500MB. Ensure 1GB free in `C:\Users\rutvi\projects\`.
- **`testMatch` in config** — uses `${CLIENT_ROOT}/tests/...` with `CLIENT_ROOT = clients/${ACTIVE_CLIENT}`. Sandbox must keep the same layout; confirmed by Step 2 copy preserving `clients/encore/` path.
- **Path aliases require `ts-node` or Playwright to resolve them at runtime** — Playwright uses its own transpile pipeline; ts-config paths DO resolve. Verified via spec files that already import via `@client/*` and run in the main repo.

---

## Verification summary

Run order in next session:
1. `npm run plans:reindex:check` — confirm INDEX doesn't already think this plan is stale
2. Step 1–4 copy + install + tests
3. Step 5 write manifest + report
4. Step 6 delete sandbox
5. Step 7 forward to colleague
6. Step 8 decide MT audit fate

Budget: 60–90 min (mostly `npm install` + Playwright browser download).
