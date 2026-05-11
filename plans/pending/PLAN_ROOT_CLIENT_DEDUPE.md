# PLAN: Root-vs-Client Slop Dedupe — kill leftover encore-only-era duplicates at repo root

**Status**: PENDING (subplans authored 2026-05-07 — awaiting subplan execution)
**Priority**: P0-EMERGENCY
**Created**: 2026-05-06
**Subplans authored**: 2026-05-07 (A/B/C)
**Identity**: OWNER
**Depends on**: none
**Blocks**: none
**Model**: claude-opus-4-7
**Thinking**: xhi
**Justification**: architectural judgment across 8 file classes (configs, scripts, envs, package.json, tsconfig, reports, logs, cruft); each demands a keep/delete/merge decision with cross-cutting impact on CI, ship pipeline, and local dev — not mechanical
**PermissionMode**: plan
**BrowserTool**: none
**Skills**: /execute (per subplan), /regression-guard, /audit, /final-q
**Subplans (run in order)**:
- [SUBPLAN_RCD_A_KILL_ROOT_PLAYWRIGHT_CONFIGS.md](SUBPLAN_RCD_A_KILL_ROOT_PLAYWRIGHT_CONFIGS.md) — kill root playwright configs + delegate root test scripts + update `.ci/` refs + `ship-smoke.yml` trigger
- [SUBPLAN_RCD_B_DEDUPE_SCRIPTS.md](SUBPLAN_RCD_B_DEDUPE_SCRIPTS.md) — dedupe root `scripts/archive-*.js` + strip dead allure scripts from root `package.json`
- [SUBPLAN_RCD_C_ENV_REPORTS_CRUFT.md](SUBPLAN_RCD_C_ENV_REPORTS_CRUFT.md) — demote root `tsconfig.json` to framework-only + relocate root `reports/` to client + sweep `.env.server` + 12 cruft files

---

## Context

The repo moved from "encore-only" to client-architecture (`clients/<id>/` self-contained per root `CLAUDE.md` "Repo Structure" section, 2026-04-30 rebuild). Client folder is the canonical surface for per-client artifacts: own `package.json`, `playwright.config.ts`, `tsconfig.json`, tests, scripts, config.

Anything at repo root that **also** defines per-client surface is leftover scaffolding from the encore-only era. Today it duplicates files in `clients/encore/` with subtle drift — the slop already broke the dependencyGate hard-rule once.

**Concrete drift caught 2026-05-06** that triggered this plan:
- `playwright.config.ts:66` (root) = `fullyParallel: true` (leftover from AUTH-STATE-SHARED experiment, never reverted).
- `clients/encore/playwright.config.ts:33` = `fullyParallel: false` with explicit "Do not flip back to true" comment (required by dependencyGate per-process registry, landed 2026-05-05).
- Result: `npm test` from repo root violates the hard rule; `npm test` from `clients/encore/` honors it. Same command, two answers, depending on cwd. Silent slop.

**Canonical going forward**: `clients/encore/<file>` is the single source of truth for per-client surface. Root duplicates die. Root keeps only framework (`src/`), pipeline (`pipeline/`), build/ship tooling, and infra (`docker-compose.yml`, `render.yaml`).

---

## Scope (8 file classes)

### Tier 1 — Direct config dups (DRIFTED)

| Root | Client | Drift | Disposition |
|---|---|---|---|
| `playwright.config.ts` | `clients/encore/playwright.config.ts` | `fullyParallel: true` vs `false` | DELETE root (SUBPLAN_RCD_A) |
| `playwright.config.ci.ts` | `clients/encore/playwright.config.ci.ts` | duplicated; same `encore-local-office` + `encore-locations` projects (root references TS-source reporter; client references vendored JS) | DELETE root (SUBPLAN_RCD_A) |
| `tsconfig.json` | `clients/encore/tsconfig.json` | NOT a semantic dup — root is multi-tenant IDE config (`@framework/*`, `@client/*`, `@client-tests/*` aliases); client is client-scoped (`@client/*` → `./src/*`, `@framework/*` → `./dist/framework/*`). Different concerns. | DEMOTE to framework-only (SUBPLAN_RCD_C Phase 1 — drop `@client/*` + `@client-tests/*`, add `@pipeline/*`) |

**Review correction (2026-05-07)**: original framing of `tsconfig.json` as "semantic dup" was incorrect. Root tsconfig serves repo-internal IDE/typecheck for `src/` + `pipeline/`; client tsconfig serves the vendored deliverable. Per user choice "Demote root tsconfig to framework-only" → it stays at root with reduced scope.

### Tier 2 — `package.json` test scripts (root)

**Review correction (2026-05-07)**: original "13 scripts… run encore specs" claim is wrong for `test:adapters` (line 20) — that script runs `src/data/adapters/__tests__/**/*.spec.ts` (FRAMEWORK adapter tests, NOT encore specs). Reclassified below.

**12 scripts to STRIP/DELEGATE** (run encore specs via root config):
- Lines 13–19: `test`, `test:headed`, `test:chrome`, `test:firefox`, `test:webkit`, `test:debug`, `test:ui`
- Line 22: `report:pdf` (runs `scripts/report-to-pdf.spec.ts` against root config)
- Line 31: `test:daily`
- Lines 85–87: `test:failed`, `test:grep`, `test:spec-grep`

`test` and `test:daily` get DELEGATED to client (`npm test --prefix clients/encore`); the other 10 get DELETED. Per user choice (Open Q1) — Delegate.

**1 script to KEEP + REPOINT** (framework-internal, NOT encore):
- Line 20: `test:adapters` — runs `src/data/adapters/__tests__/**/*.spec.ts` (framework adapter unit tests; 5 spec files: `adapterFactory`, `dbAdapter`, `excelAdapter`, `jsonAdapter`, `s3Adapter`). DOES depend on root `playwright.config.ts` (verified /audit 2026-05-07). Per user choice "Option A" 2026-05-07, `test:adapters` is repointed to a NEW `playwright.config.framework.ts` at repo root (created in SUBPLAN_RCD_A Phase 4.6, scoped to `src/data/adapters/__tests__/` only). Zero CI dependency confirmed (no refs in `.github/` or `.ci/`). See Q9 below for full rationale.

Client `clients/encore/package.json` defines the test surface against the correct config; delegation routes there.

### Tier 3 — `scripts/` dups (drifted by comments only)

Root `scripts/` and `clients/encore/scripts/` both contain:
- `archive-allure.js` (drift: comment line 8)
- `archive-html.js`
- `ensure-report-dirs.js` (drift: comment line 1)
- `preserve-allure-history.js`

### Tier 4 — Empty/stale env

| Root | Client |
|---|---|
| `config/environments/.env.server` (1113 bytes, frozen 2026-03-15) | `config/environments/.env.e2e`, `.env.local` (live, last touched 2026-05-04) |

### Tier 5 — Reports/logs at both layers

**Review correction (2026-05-07)**: original "two mutually-stale artifact stores" framing was incomplete. Root `reports/` contains BOTH stale test outputs AND live referenced artifacts:

| Artifact (root) | Class | Disposition (SUBPLAN_RCD_C Phase 4) |
|---|---|---|
| `reports/{allure-*, html-report, test-results, diagnostics, dep-gate-state, batch-suite.log, *.json, *.xml}` | stale test outputs | DELETE — `clients/encore/reports/` has fresh versions |
| `reports/bugs/**/*.json` (10 BUG files) | LIVE — referenced by `.claude/rules/baseline.md:7` path-glob + 57 file refs | MOVE → `clients/encore/reports/bugs/`; UPDATE path-glob to `clients/*/reports/bugs/` |
| `reports/activity-log-baseline-2026-04-15.json` | LIVE snapshot | MOVE → `clients/encore/specs_planning/_internal/` |
| `reports/{bundle-*,client-handoff-*,client-deliverable-ready-*}.md` | LIVE plan-execution evidence | MOVE → `clients/encore/readable_externals/agent/` |
| `reports/cce-alignment/V0-V11-summary-2026-04-27.md` | LIVE audit | MOVE → `clients/encore/specs_planning/_internal/` |
| `logs/test-execution.log` | stale (regenerated at next run inside `clients/encore/logs/`) | DELETE root |

Per user signal 2026-05-07: "the whole root reports is just for encore, why is it even at root?" → all encore-bound artifacts move to client; nothing stays at root.

**Highest-risk step**: relocating `reports/bugs/` requires rewriting live-code refs (57 hits, but plans/done/ refs are historical and stay verbatim per LR-027). SUBPLAN_RCD_C Phase 3 enumerates the rewrite.

### Tier 6 — Stray cruft at root

**12 files to DELETE** (per user choice: delete-after-grep-verifies-zero-refs):
- `sb-basicinfo.yml`, `sb2.yml`, `sb3.yml`, `sb4.yml`, `sb5.yml`, `sb6.yml`, `snap-save-test.yml` (Apr 20 mtimes — scratch / probe outputs)
- `alert-state.png` (Apr 24 — random screenshot)
- `li-cascade-probe-2026-04-28.json`, `li-inventory-2026-04-28.json` (dated one-off probes)
- `cli and mcp in our repo.md` (stray doc)
- `grep.exe.stackdump` (Apr 27 — Windows crash dump)

**1 file to KEEP** (review correction 2026-05-07):
- `BUNDLE_MANIFEST.md` — documented runtime artifact (header: "Generated 2026-04-30 (post-PLAN_CLIENT_DELIVERABLE_REBUILD)"). Explains the ship model. NOT cruft.

---

## NOT in scope (root has legitimate reason)

Per `CLAUDE.md` "Repo Structure":
- `src/` — publishable framework (vendored into `clients/<id>/dist/framework/`)
- `pipeline/` — internal runtime, never ships
- `dist/` — framework build output
- `tsconfig.build.json`, `jest.config.ts` — framework build/test
- `docker-compose.yml`, `render.yaml`, `start-dev.{bat,sh}` — pipeline/server infra
- `package.json` framework-only scripts: `build`, `build:clean`, `build:server`, `client:ship`, `build:context*`, `test:tc-*`, `test:fieldinventory-*`, `test:shared-paths`
- `scripts/` framework-internal: `build-framework-vendor*.{ts,mjs}`, `ship-client.sh`, `clean-root.ts`, `audit-*.ts`, `agent-metrics.ts`, etc.

---

## Subplans (authored 2026-05-07)

The 3-subplan approach was authored as discrete files in `plans/pending/` — each with LR-048 structural minimum, LR-041 Model/Thinking/PermissionMode declarations, and LR-046 strict-line preflight gates. Run in order via separate `/execute` invocations:

| Order | File | Goal | Depends on |
|---|---|---|---|
| 1 | [SUBPLAN_RCD_A_KILL_ROOT_PLAYWRIGHT_CONFIGS.md](SUBPLAN_RCD_A_KILL_ROOT_PLAYWRIGHT_CONFIGS.md) | kill root playwright configs + delegate `npm test` to client + update `.ci/` refs (3 files) + update `.github/workflows/ship-smoke.yml` trigger paths | none |
| 2 | [SUBPLAN_RCD_B_DEDUPE_SCRIPTS.md](SUBPLAN_RCD_B_DEDUPE_SCRIPTS.md) | dedupe root `scripts/{archive-allure,archive-html,preserve-allure-history,ensure-report-dirs}.js` + strip 8 dead allure scripts from root `package.json` | A |
| 3 | [SUBPLAN_RCD_C_ENV_REPORTS_CRUFT.md](SUBPLAN_RCD_C_ENV_REPORTS_CRUFT.md) | demote root `tsconfig.json` to framework-only + delete `.env.server` + relocate root `reports/` artifacts (incl. `reports/bugs/` move + path-glob update) + delete root `reports/` + `logs/` + 12 cruft files | B |

**Per LR-027 parent-cascade**: this PLAN closes (Status DONE + Execution Summary + git mv to `plans/done/`) automatically when SUBPLAN_RCD_C closes (the last subplan in the chain).

**Strict-line acceptance** (LR-046) carries through to subplan acceptance criteria — see each subplan's "Verification" section for runnable bash assertions.

---

## Open questions — RESOLVED 2026-05-07

1. **Bundle A backwards-compat**: ✅ **DELEGATE** (per user). Root `npm test` → `npm test --prefix clients/encore`. Devs need `npm run vendor:build` once per pull (reporter path uses `./dist/framework/...`).
2. **Bundle C reports/logs**: ✅ **CLIENT-ONLY** (per user "the whole root reports is just for encore, why is it even at root?"). All encore-bound artifacts move to `clients/encore/`; nothing stays at root.
3. **Stray YAMLs**: ✅ **DELETE AFTER GREP** (per user). 12 cruft files enumerated in Tier 6.
4. **Root `tsconfig.json`**: ✅ **DEMOTE TO FRAMEWORK-ONLY** (per user). Drop `@client/*` and `@client-tests/*` aliases; add `@pipeline/*`; per-client `tsc` from `clients/<id>/`.

## Additional questions answered 2026-05-07 (uncovered during /review)

5. **PermissionMode ambiguity** (`PermissionMode: plan` vs `/execute` invocation): ✅ **AUTHOR 3 SUBPLANS FIRST** (per user). Files written; user re-invokes `/execute` per subplan as separate sessions.
6. **`.ci/` workflows scope** (Azure DevOps + Jenkinsfile.{ubuntu,windows} reference root config; not in original plan): ✅ **KEEP `.ci/` BUT UPDATE REFS** (per user). User clarified: ".ci/ files are not functional anywhere in the repo as of now, only for future... encore never will have these, they use GA". Files stay as future templates; refs updated to `clients/encore/playwright.config.ci.ts` so they STAY accurate.
7. **`.github/workflows/ship-smoke.yml` trigger paths**: include the now-doomed root `playwright.config*.ts`. Mitigation baked into SUBPLAN_RCD_A Phase 4 — update trigger to `clients/*/playwright.config*.ts`.

## Additional questions answered 2026-05-07 (uncovered during honest /audit + /review on the 3-subplan chain)

8. **Sc3 — vendor:build dev-loop documentation gap**: `npm test` from root post-delegation requires prior `npm run vendor:build:all` (client config reporter path uses `./dist/framework/utils/agent-reporter.js`). `docs/SETUP.md` and root `README.md` had ZERO mentions of `vendor:build` or `dist/framework` (verified via grep 2026-05-07). ✅ **SUBPLAN_RCD_A Phase 4.5** added — updates both files with an "After every pull" subsection mandating `npm run vendor:build:all`. Acceptance criteria: `grep -c "vendor:build:all" docs/SETUP.md README.md` ≥1 per file.

9. **test:adapters config dependency post-deletion**: The original SUBPLAN_RCD_A Phase 2 step 3 said "KEEP test:adapters unchanged", but the script uses `--config=playwright.config.ts` (root) which Phase 5 deletes. Verified state 2026-05-07: 5 framework adapter spec files exist (`adapterFactory`, `dbAdapter`, `excelAdapter`, `jsonAdapter`, `s3Adapter`); each imports `@playwright/test`; header comments say `USED BY: npm run test:adapters`; zero refs in `.github/` or `.ci/` (local-only). Three options considered: (A) new framework playwright config at root, (B) delete test:adapters (orphans 5 working test files — REJECTED), (C) convert to Jest (5-file refactor — REJECTED). ✅ **Option A locked** — `playwright.config.framework.ts` created at root in SUBPLAN_RCD_A Phase 4.6, scoped to `src/data/adapters/__tests__/` only; `test:adapters` repointed in Phase 2 step 3. Defensible: framework has its own Playwright config because it has its own tests; client config stays scoped to client tests; each config has one job.

---

## Critical files to inspect before executing

- `playwright.config.ts` (root) + `playwright.config.ci.ts` (root) — confirm zero unique behavior vs client equivalents (line-by-line diff).
- `package.json` (root) — lines 13–22, 31, 85–87 (scripts to strip).
- `.github/workflows/ship-smoke.yml` — root (only GA workflow at root post-/audit 2026-05-07; `playwright-tests.yml` exists ONLY at `clients/encore/.github/workflows/` as the shipped copy, contrary to original plan claim — fictional reference fixed via /audit finding #1).
- `scripts/build-framework-vendor*.{ts,mjs}`, `scripts/ship-client.sh` — confirm no dependency on root playwright configs.
- `pipeline/` — grep for any `require('../../playwright.config')` or `../../scripts/archive-*`.

---

## Verification (end-to-end)

After SUBPLAN A:
- `npm test` from repo root → routes to client config → `fullyParallel: false` everywhere; 1 spec stays on 1 worker.
- `npm test` from `clients/encore/` → identical behavior.
- CI workflow → still green; one config, one source of truth.
- `grep -r "playwright.config.ts" --include="*.json" --include="*.yml"` returns ZERO root-config references.

After SUBPLAN B:
- `npm run reports:archive` from `clients/encore/` still works.
- Zero `clients/encore/scripts/<name>` references back to `../../scripts/<dup>.js`.

After SUBPLAN C:
- `find . -maxdepth 1 -type f \( -name "*.yml" -o -name "*.png" -o -name "*.stackdump" \)` returns only `docker-compose.yml`, `render.yaml` (infra).
- `ls config/environments/` returns empty (or moved to `pipeline/config/`).
- No `reports/` or `logs/` at repo root.

---

## Cross-references

- Source: scratch report at `~/.claude/plans/do-u-know-what-sorted-bubble.md` (2026-05-06 chat session).
- Architecture authority: root `CLAUDE.md` "Repo Structure" section.
- Related (overlap to reconcile): `SUBPLAN_REPO_04_DUPLICATE_JUNK_PURGE.md` (pending, 19d stale, P1) and `SUBPLAN_REPO_11_SCRIPTS_CONFIG_AUDIT.md` (pending, 21d stale, P1-CYCLE-2) — both predate this plan; this PLAN's 3 subplans absorb their scope. After SUBPLAN_RCD_C closes, mark REPO_04 and REPO_11 as superseded (Status DONE with "Superseded by PLAN_ROOT_CLIENT_DEDUPE 3-subplan chain") in their parent `PLAN_MASTER_REPO_CLEANUP.md`.
- Triggering bug: `playwright.config.ts:66` `fullyParallel: true` violates dependencyGate hard rule (`clients/encore/playwright.config.ts:28-32`). Eliminated by SUBPLAN_RCD_A Phase 5 (root config deleted).
- LR-050 graduation: this plan's existence is the proof — `PLAN_CLIENT_DELIVERABLE_REBUILD` (2026-04-30) restructured to client-architecture without enumerating "delete leftover root duplicates"; LR-050 codifies the "stale-cleanup must be IN-SCOPE" rule that would have prevented the 8-class drift caught here.

## Authoring trail

| Date | Author | Action | Notes |
|---|---|---|---|
| 2026-05-06 | OWNER | initial plan | scratch report → 8-tier scope, 4 open questions |
| 2026-05-07 | OWNER (this session) | review + Q&A + 3 subplans authored | 11 review findings (5C/4H/2N) addressed; 7 user questions answered; SUBPLAN_RCD_A/B/C written per LR-048 |
| 2026-05-07 | OWNER (audit follow-up, same session) | self-/audit + corrective edits | Verified 11/11 fuckups REAL via claim-vs-artifact cross-check; closed 2 gaps (Sc3 dev-loop docs, test:adapters config dependency) via SUBPLAN_RCD_A Phase 4.5 + 4.6; locked test:adapters Option A (new framework playwright config); added Q8/Q9; fixed fictional `.github/workflows/playwright-tests.yml` ref in line 160 |
