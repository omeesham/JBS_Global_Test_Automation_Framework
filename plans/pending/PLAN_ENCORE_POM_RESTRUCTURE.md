# PLAN: Encore POM Restructure (`clients/encore/` → standard Page-Object layout)

**Status**: PENDING
**Priority**: P0
**Created**: 2026-06-04 · **Revised**: 2026-06-05 (audit reconciliation — verified all 17 RFs first-hand)
**Identity**: OWNER (cross-cutting: code + config + ship + agent-context layers)
**Depends on**: Rutvik-signed-off OLD→NEW move map (Phase 1 intake artifact) + explicit "go" before any `git mv`.
**Model**: claude-opus-4-8 · **Thinking**: xhi · **PermissionMode**: acceptEdits
**BrowserTool**: none (file/ref surgery; one representative spec run uses the `@playwright/test` runner, not a browser tool)
**Skills**: /execute, /regression-guard, /audit, /final-q
**Story Points**: 21

> Provenance: 39-agent read-only recon (2026-06-04, run `wf_6b503752-7f1`) + the person's `POM_RESTRUCTURE_INSTRUCTIONS` spec, **reconciled against an external audit (2026-06-05)** whose findings were each re-verified against the live tree (15/17 accepted, 2 sub-claims rejected on evidence; 1 of my OWN over-corrections reversed after re-verification — `NAVIGATOR_MFA_SECRET` is live at `credential-loader.ts:98`, not a phantom — see "Audit reconciliation" at end). Scratch origin `~/.claude/plans/your-goal-we-will-imperative-hippo.md` (transient).

---

## Context

`clients/encore/` is being restructured into a conventional Page-Object-Model layout an external reviewer approved (`POM_RESTRUCTURE_INSTRUCTIONS` — derived from the shipped Encore *Notes* deliverable). **Nothing is added or removed — it is a pure relocation** (`git mv` + import/path edits; history preserved). The reshape itself is trivial; the danger is the **web of references** to old paths across five layers. History proves it: every prior restructure (`PLAN_CLIENT_DELIVERABLE_REBUILD` 2026-04-30 → 26 remediation fixes; `PLAN_DELIVERABLE_RESTRUCTURE_2026_05_19`; `PLAN_ROOT_CLIENT_DEDUPE`) bled the **same four wounds**: import-path cascade, `.gitignore` that doesn't untrack already-tracked files, the ship deny-list silently ceasing to match, and `.claude/rules/*.md` `paths:` globs that quietly stop firing.

**The bar (from Rutvik):** (a) all references for **current + future code** perfectly CRUD'd; (b) **works now** and **keeps working after future agents touch it** — no agent breaks the restructure because it was *blind*; (c) **leave dead history alone** (`plans/done/`, dated artifacts).

**Decisions locked:**
- **Sample = `POM_RESTRUCTURE_INSTRUCTIONS`** — deliverable-shaped + **generic/advisory**. We satisfy its RESULT, not its letter; the author has zero visibility into our agent/automation layer.
- **PERMANENCE is the primary goal**, not the one-time move: the framework must *keep producing* this POM layout so future agents/generators/rules/templates never regenerate `src/core`, `src/infra`, `specs/`, or `data/testdata`.
- **Satisfy what SHIPS; don't nuke our repo.** Apply POM to the shippable surface; keep agent-only/internal structure sane for us.
- **Keep our `docs/`** (agent-only, gitignored, deny-list-anchored). Do NOT rename `docs/`→`doc/` — it breaks the deny-list + leaks agent-only content.
- **Do NOT rename exported symbols** (e.g. `CommonMethods`) — file renames only (the doc itself bans symbol renames, §7).
- **On-disk state = baseline.** WIP (`corporate-pricing`, `left-panel-basic-information`, modified + staged-deletion files) is fine as-is. **Commit the full on-disk tree FIRST** (revert SHA), then restructure on top.
- History frozen: `plans/done/` + dated artifacts out of scope. Live-layer drift (Tier-1) folded in.

---

## Bootstrap

- **Identity**: OWNER (touches pipeline-owned paths — LR-028 activity-log row required per `feedback_owner_activity_log`).
- **Skills auto-called**: `/regression-guard` (pre+post), `/audit` (post-execution), `/final-q` (exit).
- **Context files**: `POM_RESTRUCTURE_INSTRUCTIONS` (reference, not gospel) · `.claude/rules/pipeline.md` (LR-020/027/028/041/046/049/050) · `.claude/rules/plan-closure.md` (LR-055) · `.claude/rules/{angular,specs,inventory,baseline,browser-tool}.md` · `clients/encore/CLAUDE.md` (LR-017, LR-ENC-001) · root `CLAUDE.md` · `scripts/shared-paths.ts`+`.mjs`+`.test.mjs` · `scripts/verify-no-forbidden.mjs` · `scripts/ship-client.sh` · `.githooks/{pre-commit,pre-push}` · `clients/encore/{playwright.config.ts,tsconfig.json,.gitignore,package.json}` · root `tsconfig.json`/`package.json` · `field-inventory-spec.md`/`field-case-generation.md` · `.claude/context/navigation.md` · `.claude/agents/*.md`.

---

## Phase 0 — Dependency + browser-tool gate

- **Browser tool**: `none`. The single representative spec run in Step 11 uses `npx playwright test`.
- **Dependencies**: the Phase-1 OLD→NEW map must be produced and **Rutvik-signed-off** before any `git mv`; execution gated on explicit "go."
- **Sequencing (cross-workstream):** the TestRail retitle/renumber content pass (Notes ID renumber to close gaps 028–032/038 + 13-module plain-English titles + throwaway demo xlsx) runs **FIRST on the CURRENT (old) shape** — its edits are content (titles/IDs) that ride the `git mv` forward unchanged, and it targets old paths that match disk today. This restructure executes into a **quiet tree AFTER that pass commits** (POM doc §6: "schedule when nobody has WIP touching `src/**`/`specs/**`"). Corp-Pricing **Wave-2** runs **AFTER** this restructure, against the rewritten live plans (below). It collides on `location-notes.spec.ts`/`location-notes.data.ts` + every module's specs/data, so the two cannot interleave — order is forced.
- **Halt conditions**: live tree diverged from recon snapshot → re-snapshot, refresh map. A protected directory NAME (`specs_planning`, `.auth`, `docs/read_only_docs`, `docs/REQUIREMENTS.md`, `docs/MODULE_REGISTRY.md`, `CLAUDE.md`) would be renamed → HALT, confirm deny-list lockstep.

---

## The keystone insight (why this is clean, not thousands of hand-edits)

1. **`scripts/shared-paths.ts` + `.mjs`** export a frozen `SHARED_PATHS` map that **30+ pipeline scripts (verified 32 importers)** resolve through. Of its keys, only `specs`, `fixtures` (`src/infra/fixtures.ts`), `testData` (`src/data/testdata`), and `envDir` (`config/environments`) move in this reshape — **update those + the `.mjs` sibling once → the script layer follows.** (`pages`/`selectors`/`specs_planning`/`docs`/`test_cases_xlsx` keys are unchanged.)
2. **`clients/encore` uses 100% relative imports, zero path aliases** → `tsc --noEmit` is a **loud gate on the `.ts` import cascade** (within `.ts` scope only — see Layer 7 caveat).

---

## Recon results — 39-agent read-only sweep (2026-06-04, counts re-verified 2026-06-05)

258 findings; **18/19 hot findings held under adversarial re-verification**. By break-mode: SILENT_ROT 68 · SILENT_RUNTIME 59 · LOUD_SCRIPT 42 · LOUD_TSC 33 · EXISTING_DRIFT 33 · SILENT_SECURITY 20. **Security check PASSED today:** `git ls-files clients/encore/` (**83** tracked) + `git check-ignore` confirm **zero** tracked files match any deny pattern — nothing agent-only currently ships.

**Corners the first pass missed (folded in):**
- **`.ci/` directory** — `Jenkinsfile.ubuntu`, `Jenkinsfile.windows`, `azure-pipelines.yml` (hardcode `clients/encore` working-dir/`playwright.config.ts`; verify whether they reference a *moving* path at exec).
- **Already-dead rule glob** — `.claude/rules/baseline.md` `reports/bugs/**/*.json` matches **zero** files today (silent rot already live).
- **`shared-paths.test.mjs` only checks `.ts`↔`.mjs` `activityLog` parity** — does NOT assert paths exist.
- **Worktree shadow risk** — `.claude/worktrees/loving-allen-408532/` holds a DUPLICATE `clients/`,`scripts/`,configs; exclude `.claude/worktrees/` + `.work/` from every grep/move.

---

## The reference map — layers by break-mode

### Layer 1 — LOUD at `tsc` (import cascade)
- **~235 relative-import statements across 91 `.ts` files** in `clients/encore/{src,specs}` (verified 2026-06-05; this drives the 21-pt estimate). Specs→`../../src/...`; pages/infra→`../../...`. Recompute the deepest chain against the *surviving* tree (the prior `specs/locations/history/*.spec.ts` example is staged for deletion).
- `clients/encore/tsconfig.json` `include: ["src/**/*.ts","specs/**/*.ts"]` — `specs`→`tests`.
- **Opportunistic fix:** malformed `../../../../src/selectors` in `src/data/testdata/locations/location-local-info.data.ts` (→ `../../selectors`).
- **Gate:** `npm run typecheck` → **zero errors**.

### Layer 2 — LOUD at script/CI run — ONLY the surfaces that touch a MOVING path
The reshape moves `src/core`, `src/infra`, `specs/`, `src/data/testdata/`, `config/environments/`. Script/CI breakers limited to:
| File | What changes |
|---|---|
| `scripts/shared-paths.ts` + `.mjs` | keystone keys `specs`/`fixtures`/`testData`/`envDir` → new paths; `.mjs` kept in sync (`shared-paths.test.mjs`) |
| `.githooks/pre-commit` | **`:43`** (`grep … clients/encore/specs/`) **and `:58-59`** (`^clients/[^/]+/specs/.*\.spec\.ts$`) → `tests/`. Both go **FAIL-OPEN** on `specs→tests` if missed. (`:75` workbook NOT at risk — `test_cases_xlsx/` doesn't move.) Audit `pre-push` likewise. |
| `clients/encore/tsconfig.json` | `include` specs→tests |
| `clients/encore/playwright.config.ts` | testDir/testMatch/testIgnore/globalSetup/reporter/dotenv (Layer 3) |
| `.ci/{Jenkinsfile.ubuntu,Jenkinsfile.windows,azure-pipelines.yml}` | verify each: if it only `cd clients/encore && npm test` it's safe; if it names `specs/`/`config/environments`/`src/infra` → patch |
| root `tsconfig.json` | `@client-tests/* → clients/encore/tests/*` — was dead (`tests/` removed 2026-05-19); `tests/` is RE-CREATED by this reshape ⇒ **repoint or kill explicitly** |
- **Gate:** `npm run pipeline:validate` green.
- **NOT in this restructure's scope (pre-existing single-tenant debt — Tier-2):** the `clients/encore` hardcoders in `scripts/{audit-lo-parity,migrate-queue-csv-to-xlsx,sp00-audit-v5,xlsx-dump,xlsx-freshness,xlsx-vocab-lint}.*`, `export_test_cases/{to-csv,to-xlsx,sp00-augment-logic}.ts`, `ship-client.sh` — they target `test_cases_xlsx/`·`test_cases_csv/`·`specs_planning/`, **dirs this reshape does NOT move**. They break only on a future wrapper-move/multi-client onboarding, not here. (Audit RF-09 reconciled — see end.)

### Layer 3 — SILENT at runtime (only a real spec run catches these)
`process.cwd()`/`__dirname` string paths that survive *iff* cwd stays `clientRoot` + relative offsets preserved:
- `playwright.config.ts`: `testDir`, `testMatch: specs/**`, project `testDir`/`testIgnore` (`specs/locations`, `specs/local-office`), `storageState: .auth/encore-state.json`, reporter (`./src/utils/agent-reporter.ts`, `reports/*`), `require('./config/allure/categories.json')`, `globalSetup: require.resolve('./src/infra/global-setup')`, dotenv `path.join(__dirname,'config','environments')`.
- `src/infra/global-setup.ts`, `src/infra/auth-storage.ts`, `src/utils/{logger,agent-reporter,retry-telemetry}.ts`, `src/infra/fixtures.ts`.
- **Gate:** representative live spec run.

### Layer 4 — SILENT at ship (security)
- `verify-no-forbidden.mjs` `DENY_GLOBS` are **substring-anchored on directory NAMES** (`specs_planning/`, `.auth/`, `CLAUDE.md`, `docs/read_only_docs/`, `docs/REQUIREMENTS.md`, `docs/MODULE_REGISTRY.md`, `.env.local`, …). Survive *deeper* moves but **die the instant a protected name is renamed** ⇒ silent ship. `isClientShipping()`/`checkClient()` + `isBannedPhraseTarget()` + `BANNED_EXEMPT_PATHS` anchor on `^clients/<id>/` and literal `specs_planning/_internal/`.
- **Mitigating fact:** protected agent-only folders are gitignored ⇒ absent from sample ⇒ *not* renamed by the reviewer. Keep their names. Residual risk only if *we* rename them or the wrapper changes.
- **Gate:** `verify-protected-names` planted-file proof + ship dry-run on a clean archive extract. **Confirmed safe today.**

### Layer 5 — SILENT rot = future-agent blindness (THE core fear)
- **`.claude/rules/*.md` `paths:` globs** — **exactly 3 globs break on `specs→tests`**: `clients/*/specs/**/*.spec.ts` in **`specs.md`, `angular.md`, `browser-tool.md`** → `clients/*/tests/**/*.spec.ts`. (`inventory.md`/`baseline.md` glob `specs_planning` — unaffected; `src/pages`/`src/selectors` globs unaffected.)
- **Structural-assertion contracts that become lies** (line-level checklist, Phase 7): `clients/encore/CLAUDE.md` LR-017 + LR-ENC-001; root `CLAUDE.md` "Repo Structure"; `field-case-generation.md` (runner path); `shared-paths.ts` comment.
- **Live agent/nav refs to OLD paths (verified, enumerate in Phase 7):** `.claude/agents/GENERATOR.md:43,50`, `HEALER.md:57`, `MAINTAINER.md:29` (`src/core/field-case-runner`, `src/data/testdata/`), `.claude/rules/specs.md:42` (`src/core/field-case-runner`), `.claude/context/navigation.md:41,63,86` (`src/data/testdata`, `src/infra/fixtures`, `src/core/base-page`).
- **Gate:** `verify-rules-fire` + `verify-no-stale-live-refs`.

### Layer 7 — `tsc` coverage caveat
`tsc` gates only the `.ts` import graph. Blind to `.ci/` (Groovy/YAML), plain `.js` (`clients/encore/scripts/*.js`), and dynamic/string paths — those rely on Layer-2 grep + the new guard scripts.

> **Explicitly OUT (frozen):** `plans/done/**`, dated artifacts (walk-evidence, old-site-baseline, agent-mistakes rows), and **dead** `plans/pending/**` (superseded/abandoned — will never execute). We do not chase the ~3,600 historical references.
> **IN-SCOPE (live-forward pending plans):** any `plans/pending/**` that **will still execute *after* this restructure** must have its old-path tokens rewritten — else its next executor recreates the old shape (re-introduces `specs/`, `src/data/testdata/`, `src/core`, `src/infra`), defeating permanence. **"Stale" ≠ "pending"** — stale = done + dated + dead-pending only. Phase 1 classifies which is which (verified 2026-06-05: the plan's own 4-class grep returns **36** pending files carrying old-path tokens — **35** real candidates once this restructure plan itself is excluded). The blast radius spans **far beyond pricing** — Corp-Pricing Wave-2, the OPI migration batch, PARITY W1/W2, and `BIG_PIVOT_FCC` are all token-carrying and likely-live. This corrects an over-broad freeze in an earlier revision (and the Corp-Pricing handoff, which spotted the direction but undercounted it as 7 CP-only plans).

---

## Phase 1 — Intake: produce the OLD→NEW map (Rutvik sign-off gate)

1. Snapshot the live `clients/encore/` tree (`rg`/`fd` with `-g '!.claude/worktrees/**' -g '!.work/**'`). Confirm against recon baseline; **refresh the counts — recon (83 tracked / 91 `.ts` / 235 imports) predates Corp-Pricing Wave-1 (~13 new CP files + `src/infra/fixtures.ts` lines 17-20/60-63/437-469 + `src/selectors/index.ts` registrations) AND the TestRail retitle/renumber content pass; both land before this restructure.** Re-derive the map against the post-content tree.
2. Treat `POM_RESTRUCTURE_INSTRUCTIONS` as the target SHAPE (not literal). Build OLD→NEW for the shippable surface + fold in on-disk WIP (`corporate-pricing`, `left-panel-basic-information`). *(If auditability is wanted, commit the POM doc to `clients/encore/readable_externals/`.)*
3. **Place agent-only folders** (absent from sample, names preserved): `specs_planning/`, `.auth/`, `docs/` (KEEP plural — not `doc/`), `CLAUDE.md`. List each placement; default = keep.
4. **Classify live-forward vs dead pending plans — EXHAUSTIVELY, not pricing-only.** Run `grep -rlE "src/infra/fixtures|src/data/testdata|src/core/(base-page|field-case-runner)|clients/encore/specs/" plans/pending/` (**36** hits 2026-06-05 incl. this restructure plan itself — which legitimately documents old→new tokens and is EXCLUDED from both rewrite and guard → **35** candidates). **Classify ALL 35** — for each decide **WILL-EXECUTE-POST-RESTRUCTURE** (live → in-scope: rewrite tokens + guard covers it) vs **DEAD** (frozen, skip). **Do NOT wave non-pricing plans through as dead by default** — verified token-carriers that are PENDING/GATED and likely-live: the OPI migration batch (`SUBPLAN_OPI_{A,C,D,E,F}`), PARITY (`SUBPLAN_PARITY_W1_{04,05}`, `SUBPLAN_PARITY_W2_{06,07,08,09}` — 08/09 are GATED but still execute once unblocked), `PLAN_BIG_PIVOT_FCC_MASTER`, AND the 9 Corp-Pricing plans (`PLAN_CORP_PRICING_MASTER`, `SUBPLAN_CORP_PRICING_{1440,1441,1443,1444,1445,EDGE_P3}`, `PLAN_PRICING_TEST_COVERAGE_AUDIT_AND_FIX`, `SUBPLAN_DQU_12_F1a_PRICING_AUDIT`). Emit the FULL live list into the map artifact.
5. Emit `clients/encore/specs_planning/_internal/restructure-map-<YYYY-MM-DD>.md` (`OLD | NEW | layer(s) | rename? Y/N`) **plus the live-forward-plan list**. **HALT for Rutvik sign-off on BOTH the path map AND the live-plan list before any `git mv`.**

---

## Concrete move map — Layer A (inside `clients/encore/`, verified on-disk 2026-06-04)

| Phase | `git mv` (all paths under `clients/encore/`) |
|---|---|
| 2 Pages | `src/core/base-page.ts`→`src/pages/base.page.ts`; `src/pages/locations/location-form-helpers.page.ts`→`src/pages/components/location-form-helpers.component.ts` (shared mixin / `CheckboxState` owner — also resolves the LR-017 cross-module coupling) |
| 3 Fixtures | `src/infra/fixtures.ts`→`src/fixtures/pages.fixture.ts`; `src/infra/dependency-gate.ts`→`src/fixtures/dependency-gate.ts`. *(matchers.ts MOOT — `custom-matchers.ts` staged for deletion)* |
| 4 Utils + kill `core/` | `src/core/app-constants.ts`→`src/utils/constants.ts`; `src/core/field-case-runner.ts`→`src/utils/field-case-runner.ts`; `src/infra/auth-storage.ts`→`src/utils/auth-storage.ts`; `src/utils/common-methods.ts`→`src/utils/env-config.ts` (KEEP `CommonMethods` export); rmdir `src/core` |
| 5 Setup | `src/infra/global-setup.ts`→`src/setup/global-setup.ts` + config globalSetup path. *(global-teardown MOOT — staged for deletion)* |
| 6 Reporter | `src/utils/agent-reporter.ts`→`src/reporter/agent-reporter.ts` + config reporter path. **`retry-telemetry.ts` STAYS in `src/utils/`** → rewrite agent-reporter's `./retry-telemetry` import to `../utils/retry-telemetry` (loud / tsc-caught). |
| 7 Data | `src/data/testdata/common.data.ts`→`src/data/common.ts`; `src/data/testdata/{locations,local-office,corporate-pricing}/*.data.ts`→`src/data/<module>/*.ts` (drop `.data`); rmdir `testdata`; fix malformed `../../../../src/selectors`→`../../selectors`. *(`downloads/` is mid-deletion — do NOT move it.)* |
| 8 specs→tests | `specs/`→`tests/`; `src/infra/auth.setup.ts`→`tests/auth.setup.ts`; rmdir `src/infra`; update config testMatch/testIgnore/testDir + tsconfig include + auth.setup import depth |
| 9 env→root | `config/environments/.env.*`→`clients/encore/.env.*`; rmdir `config/environments` (keep `config/allure/`); update config + global-setup dotenv paths + per-client `.gitignore` |

Keep `src/selectors/` top-level (we have the `ALL_SELECTORS` collision map — doc's own default). Keep `src/types/`.

---

## Permanence — the new layout must self-perpetuate (the actual deliverable)

After the move, every file-CREATING surface must target POM by default:
- **GENERATOR/BUILDER agent prompts**: page objects → `src/pages/{module}/{page}.page.ts` extending `src/pages/base.page.ts`; specs → `tests/{module}/`; data → `src/data/{module}/<name>.ts` (no `.data`); selectors → `src/selectors/{module}/`; shared mixins → `src/pages/components/`.
- **LR-017 directory contract** (`clients/encore/CLAUDE.md`) — rewrite to the POM hierarchy.
- **`navigation.md` routing** + plan/subplan `_TEMPLATE*` + `field-inventory-spec` + field-case-runner path → POM.
- **`scripts/shared-paths.ts`** SHARED_PATHS — machine source of truth.
- **`verify-no-stale-live-refs` + `verify-rules-fire`** wired into `pipeline:validate` — CI fails any agent that reintroduces an old-shape path. This is what makes it *permanent*.

---

## Execution sequence (one-shot, gated — fires only after map sign-off + explicit "go")

1. **Pre-flight (REVERT POINT FIRST):** new branch off `client_deliverable`; **commit the FULL on-disk tree as-is — `git add -A` incl. all WIP + modified + staged-deletion files — clean revert SHA before any move.** Baseline `npm run typecheck`; `/regression-guard` snapshot. Record protected-name set. **All greps/moves exclude `.claude/worktrees/` + `.work/`** (e.g. `rg -g '!.claude/worktrees/**' -g '!.work/**'`). Build the env-var matrix (`.ci/` + `.github/` secret/var names).
2. **`git mv` every file** per the map — **never delete+add** (preserves history; LR-049 `git archive` substrate).
3. **Update refs as one block, immediately after moves (no guard runs mid-window):** rewrite relative imports (fix the malformed 4-level); update `shared-paths.ts`+`.mjs` keystone keys; `clients/encore/tsconfig.json` include; root `tsconfig.json` `@client-tests` (repoint/kill); the **3** rule globs (`specs.md`/`angular.md`/`browser-tool.md` → `tests/`); **iff** a protected name changed, `verify-no-forbidden.mjs` anchors in lockstep.
4. **`tsc --noEmit` → zero errors** (Layer-1 gate). *(Reordered per audit RF-02 — moves precede config/glob updates so nothing points at a not-yet-existent path mid-flight.)*
5. **Layer 2 surfaces:** `.githooks/pre-commit:43` + `:58-59` → `tests/` (audit pre-push); `playwright.config.ts` paths; `.ci/` files (only if they name a moving path); `clients/encore/package.json`.
6. **Layer 3:** recompute `__dirname`/relative offsets where depth changed (playwright.config, global-setup, auth-storage, logger, agent-reporter, retry-telemetry, fixtures).
7. **Layer 5 (future-agent-safety) — line-level checklist:** LR-017 + LR-ENC-001 (`clients/encore/CLAUDE.md`), root `CLAUDE.md` repo-structure, `field-case-generation.md` runner path, `shared-paths.ts` comment; agent refs `GENERATOR.md:43,50`/`HEALER.md:57`/`MAINTAINER.md:29`/`specs.md:42`; `navigation.md:41,63,86`. **Plus: rewrite the 5 token classes (Tier-1 register) in the live-forward pending plans from the Phase-1 classification** — leave selectors / `specs_planning` / `docs` refs untouched.
8. **`.gitignore` + untrack trap:** `git rm --cached` anything that should now be ignored (the 2026-04-30 leak lesson).
9. **Tier-1 drift fixes** (register below) folded in.
10. **Guard scripts:** `verify-rules-fire`, `verify-protected-names`, `shared-paths.test.mjs` (extended), `verify-no-stale-live-refs`; **verify each is wired into `pipeline:validate`**; ship dry-run (`verify-no-forbidden --client=encore` **and** `--target` on a clean `git archive HEAD | tar -x` extract).
11. **Works-now + ship-SHAPE proof:** representative live spec run; then the decisive test — `git archive HEAD clients/encore/ | tar -x --strip-components=2` and assert the extract exposes the **POM SHAPE** (`src/pages/{module}/`, `src/fixtures/`, `src/selectors/`, `src/data/{module}/`, `tests/`, env files at root) and `tsc` passes. *(A recursive content `diff` vs the Notes sample is NOT used — Notes is one module, encore is multi-module; per audit RF-01 the shape assertion is the correct, runnable gate.)*
12. **Closure:** activity-log row (LR-028), Execution Summary (LR-027), `/final-q`, `/reflect`.

---

## New permanent guard scripts to BUILD (converts SILENT → LOUD forever)

- `scripts/verify-rules-fire.mjs` — every `.claude/rules/*.md` `paths:` glob matches ≥1 live file; fail on any dead glob.
- `scripts/verify-protected-names.mjs` — plant a temp forbidden file at each protected dir/file in the **new** tree, run `verify-no-forbidden`, assert caught, clean up.
- **extend `scripts/shared-paths.test.mjs`** — assert every `SHARED_PATHS` value resolves to an existing path (would have caught the `test_cases_csv` deletion) + full `.ts`↔`.mjs` parity (not just `activityLog`).
- `scripts/verify-no-stale-live-refs.mjs` — grep the **live** layer only (excludes `plans/done`, dated artifacts, **dead-pending** plans, `.claude/worktrees/`, `.work/`) for old path tokens → zero. **Includes the live-forward pending plans** classified in Phase 1 (so a leftover old path in a plan that still executes fails loud — this is what makes the live-plan rewrite permanent, not one-time). **Excludes this restructure plan itself** (`PLAN_ENCORE_POM_RESTRUCTURE.md` documents the old→new map by design, so it legitimately contains old tokens — else the guard self-trips).
- *(optional)* `scripts/verify-env-var-matrix.mjs` — inventory `process.env.*` across `scripts/`,`src/`,`.ci/`,`.github/workflows/`,`.env.*`; flag orphans.
- **Wire the mandatory guards into `npm run pipeline:validate`** (acceptance verifies each is invoked).

---

## Stale-cleanup IN-SCOPE (LR-050)

Enumerated in the **Existing drift register** below (Tier 1 in-scope; Tier 2 flag-only). Plus: refresh the "post-2026-05-19" comment in `shared-paths.ts`, and anything `verify-no-stale-live-refs` surfaces. **Frozen history** excluded per Rutvik.

---

## Existing drift register (verified 2026-06-05) — fix live-layer rot in the SAME pass (LR-050)

**Tier 1 — fix in-scope:**
- Dead `test_cases_csv/` (deleted 2026-05-27) still referenced by `scripts/sp00-audit-v5.mjs:30`, `scripts/audit-lo-parity.mjs:12`, `export_test_cases/to-csv.ts:746`. *(These are non-moving-dir refs but are genuinely dead → clean.)*
- `@client-tests/*` alias + consumers `pipeline/tests/examples/{basic-test-pattern,data-driven-pattern,session-reuse-pattern}.spec.ts` — resolve when `tests/` is recreated (Step 3).
- Dead rule glob `reports/bugs/**/*.json` in `.claude/rules/baseline.md` (matches nothing).
- `CheckboxState` cross-module coupling — `src/core/base-page.ts` + `src/pages/local-office/local-office-settings.page.ts` import from the **locations** module (LR-017). Phase-2 component move resolves it.
- Malformed `../../../../src/selectors` import in `location-local-info.data.ts`.
- **Live-forward pending plans carrying old-path tokens** (classified in Phase-1 step 4; **36** grep hits 2026-06-05 / **35** candidates excl. this plan — spans pricing + OPI migrations + PARITY W1/W2 + `BIG_PIVOT_FCC`, **not pricing-only**). In the **live** ones rewrite ONLY these 5 token classes: `src/infra/fixtures`→`src/fixtures/pages.fixture`; `src/data/testdata/<mod>/<x>.data`→`src/data/<mod>/<x>`; `src/core/field-case-runner`→`src/utils/field-case-runner`; `src/core/base-page`→`src/pages/base.page`; `specs/<mod>/*.spec.ts`→`tests/<mod>/*.spec.ts`. Leave selectors / `specs_planning` / `docs` refs untouched. Dead-pending plans stay frozen.

**Tier 2 — flag-only (cosmetic; not required):**
- Unused `@client`/`@framework` aliases; duplicate `IConfig`/`FailureCategory` type defs; dead `vendor:build`/`vendor:build:all` scripts; dead deny-glob `api-testing/REQUIREMENTS_API.md`; naming drift `location-local-information.spec.ts` vs `location-local-info.data.ts`; `REQUIREMENTS.md` "Next.js" wording; staged-for-deletion `custom-matchers.ts`/`global-teardown.ts` (confirmed unreferenced — just commit the deletion).

- **`NAVIGATOR_MFA_SECRET`** is still read LIVE at `clients/encore/src/utils/credential-loader.ts:98` (`process.env.NAVIGATOR_MFA_SECRET || process.env.MFA_SECRET`). `src/utils/` is NOT relocated by this reshape → the move does NOT break it → **out-of-scope here**; pre-existing MFA-purge debt (`plans/done/PLAN_PURGE_MFA.md` targeted the old `src/common/` path; the client copy survived). The `.env.example` half of the original recon item IS correctly dropped (file confirmed absent).

> **Correction (2026-06-05):** an earlier revision wrongly marked `NAVIGATOR_MFA_SECRET` a phantom ("zero hits") — that came from a **backgrounded grep read mid-run** (incomplete output). Re-verified with ripgrep: it IS present at `credential-loader.ts:98`. The external audit (and its Agent 5) were right; reclassified to Tier-2 above. Lesson: never treat absence in partial/streaming output as zero (cf. `feedback_clean_full_run_integrity`).

---

## Per-Identity Satisfaction (LR-048 v3)

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | — | (none) | (none) |
| GIVER | — | (none) — specs only relocate; no TC/MD/XLSX authoring | (none) |
| BUILDER | `tests/**/*.spec.ts` (relocated only) | `(skipped: pure git-mv relocation of existing specs; content-identical post-move, no spec logic created or modified)` | `npx playwright test --list` resolves all TC IDs post-move |
| HEALER | — | (none) | (none) |
| WATCHDOG | — | (none) — `/audit` runs post-execution, authors no spec/MD/XLSX | (none) |
| GARDENER | structural relocation + ref edits + guard scripts | `scripts/verify-rules-fire.mjs <br> scripts/verify-protected-names.mjs <br> scripts/verify-no-stale-live-refs.mjs` <br> `(skipped: restructure-map produced at Phase 1; exact filename carries a runtime date, resolved at sign-off)` | `npm run typecheck` clean + `npm run pipeline:validate` green |

---

## Risks → mitigations

| Risk (when it bit) | Mitigation |
|---|---|
| Import cascade — 1 missed rewrite | 100% relative + `tsc --noEmit` zero-error gate (Step 4) |
| `.gitignore` ships already-tracked files (2026-04-30) | `git rm --cached` (Step 8) |
| Deny-list silently stops matching on rename | lockstep anchors + `verify-protected-names` planted-file proof (Steps 3, 10) |
| Rule `paths:` glob silently stops firing (2026-05-04) | `verify-rules-fire` wired into `pipeline:validate` |
| Docs/agent prompts/contracts lie → agents blind | Layer-5 line-level rewrite (Step 7) + `verify-no-stale-live-refs` |
| pre-commit guards go fail-open on specs→tests | enumerate `:43`+`:58-59`→`tests/` (Step 5) — audit RF-03 |
| ship gate can't pass | shape assertion not content diff (Step 11) — audit RF-01 |
| config points at not-yet-existent path | moves precede ref-updates (Steps 2→3) — audit RF-02 |
| WIP lost / unrevertable | commit full on-disk tree as revert SHA FIRST (Step 1) |

---

## Acceptance criteria

- [ ] OLD→NEW map produced + Rutvik-signed-off before any move; revert SHA committed first.
- [ ] `npm run typecheck` → 0 errors.
- [ ] `verify-rules-fire` → every glob live; `verify-protected-names` → every protected name caught; `shared-paths.test.mjs` → all paths resolve; `verify-no-stale-live-refs` → 0 stale tokens.
- [ ] `grep -rn "data/testdata|src/core|src/infra" clients/encore/CLAUDE.md CLAUDE.md .claude/agents .claude/rules .claude/context` → **0** (permanence proof).
- [ ] Ship dry-run (`--client` + `--target` on clean extract) passes deny-list.
- [ ] Archive extract exposes the POM **shape** (`src/pages/{module}/`,`src/fixtures/`,`src/selectors/`,`src/data/{module}/`,`tests/`, root env files) + `tsc` passes.
- [ ] Representative live specs green; report emitted — **one Angular module (`encore-locations`) AND one Corp-Pricing spec (`tests/corporate-pricing/corporate-pricing-search.spec.ts`, React/Next.js — exercises content-anchored selectors + 4-fixture wiring post-move).**
- [ ] Zero old-shape tokens in the live-forward pending plans classified in Phase-1 step 4 (covered by `verify-no-stale-live-refs`; dead-pending plans exempt).
- [ ] Each guard script wired into `pipeline:validate` (verified invoked).
- [ ] Tier-1 drift cleared; `src/core/` + `src/infra/` gone; no `data/testdata/` in source or comments.
- [ ] LR-027 Execution Summary + LR-028 activity-log row. `plans/done/` + dated artifacts untouched.

---

## Verification (E2E)

```bash
npm run typecheck                                   # Layer 1 (.ts cascade)
node scripts/verify-rules-fire.mjs                  # Layer 5 (new)
node scripts/verify-protected-names.mjs             # Layer 4 (new)
node scripts/shared-paths.test.mjs                  # keystone (extended: existence + parity)
node scripts/verify-no-stale-live-refs.mjs          # Layer 5 (new)
grep -rn "data/testdata\|src/core\|src/infra" clients/encore/CLAUDE.md CLAUDE.md .claude/agents .claude/rules .claude/context  # expect 0
npm run pipeline:validate                           # Layer 2 + wired guards
node scripts/verify-no-forbidden.mjs --client=encore
T=$(mktemp -d); git archive HEAD clients/encore/ | tar -x -C "$T" --strip-components=2
node scripts/verify-no-forbidden.mjs --target="$T"  # Layer 4 ship-safety
find "$T" -maxdepth 2 -type d                        # ship-SHAPE assertion (pages/fixtures/selectors/data/tests)
grep -rEn "src/infra/fixtures|data/testdata|src/core/(base-page|field-case-runner)|specs/(locations|local-office|corporate-pricing)" <live-forward-plan-list from Phase-1>  # expect 0 (post-rewrite)
npx playwright test --project=encore-locations --grep <one TC>                  # Layer 3 (Angular module)
npx playwright test tests/corporate-pricing/corporate-pricing-search.spec.ts    # Layer 3 (CP — React/Next.js)
```

---

## Audit reconciliation (2026-06-05) — every RF re-verified first-hand

External audit raised 17 RFs. Re-verified against the live tree (not blindly applied — the audit can drift too):

- **ACCEPTED (15):** RF-01 (shape assertion not content diff), RF-02 (mv before ref-updates), RF-03 (pre-commit `:43`/`:58-59` fail-open), RF-04 (line-level contract checklist), RF-05 (enumerated agent/nav refs), RF-06 (3 globs not 5), RF-07 (tsc `.ts`-only), RF-10 (retry-telemetry stays in utils), RF-11 (.env.example absent; history/downloads mid-deletion), RF-12 (worktree exclusion flags), RF-13 (Model→opus-4-8), RF-14 (matrix cells exact), RF-15 (guards wired), RF-16 (points 8→21), RF-17 (acceptEdits prompt note).
- **REJECTED on evidence (2):** RF-08 importer sub-claim — "~12" is FALSE, verified **32** importers → "30+" stands (the 235/91/83 counts ARE right and are fixed). RF-09 bypasser correction — `xlsx-freshness`/`xlsx-dump`/`to-xlsx`/`sp00-augment-logic` do NOT use SHARED_PATHS (they hardcode); deeper truth: most hardcoders target non-moving dirs → out of scope (Layer 2 reframed).
- **SELF-CORRECTION REVERSED (2026-06-05):** I earlier marked `NAVIGATOR_MFA_SECRET` a phantom — **WRONG** (conclusion drawn from a partial backgrounded-grep read). Re-verified with ripgrep: present at `credential-loader.ts:98`. Auditor RF-11 was fully correct. Reclassified to Tier-2 out-of-scope (`src/utils/` not relocated; the `.env.example` half is correctly dropped — file absent).
- **CORP-PRICING HANDOFF FOLDED (2026-06-05):** an external agent flagged that the freeze swallows live Corp-Pricing plans whose Wave-2 runs post-restructure. Verified on disk: **CORRECT in direction** (live forward plan-bodies are an uncovered future-agent surface) but **undercounted** — it said "7 CP plans"; disk shows **9** CP-touching pending plans and **36** pending files (35 excl. this plan) carrying old-path tokens — spanning OPI migrations, PARITY W1/W2, and `BIG_PIVOT_FCC`, **not pricing-only**. Generalized (not CP-only): redefined the freeze (frozen = done + dated + dead-pending), added Phase-1 step 4 (EXHAUSTIVE live-vs-dead classification of all 35 + sign-off), Tier-1 rewrite of the 5 token classes in live plans, `verify-no-stale-live-refs` coverage (excl. this plan itself), a CP representative-run spec, and a count-refresh note (recon predates CP Wave-1 + the TestRail content pass). **A second-pass auditor caught that the first amendment spotlighted only the 9 pricing plans as "confirmed-live" — pricing-blinkered; re-verified on disk (OPI_{C,D,F}, PARITY_W2_{08,09}, BIG_PIVOT_FCC all carry tokens + are PENDING/GATED) and de-blinkered.** Also corrected the count "37"→"36 incl self / 35 candidates" (the plan's own 4-class grep). Handoff is **additive, not conflicting**.

---

## Handoff (chat-only, per `feedback_handoff_in_chat_only.md`)

On close: restructure-map path, revert SHA, what moved per phase, guards added + wired, Tier-1 drift cleared, ship-shape assertion result. No obstacle claims (LR-039). Execution gated on Phase-1 map sign-off + explicit "go".
