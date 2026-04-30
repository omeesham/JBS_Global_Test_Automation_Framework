# PLAN: Friday Deliverable 2026-04-29 — CI Scaffold + Module-Parallel + MFA-less User

**Status**: Pending
**Priority**: P0-EMERGENCY (Friday deliverable shown Thursday EOD per Encore cadence; landing date Wed 2026-04-29; scaffold proves CI pattern we hand to Encore — overrides P0-CYCLE-1 because miss = client-visible miss)
**Created**: 2026-04-28
**Identity**: OWNER
**Model**: claude-opus-4-7
**Thinking**: hi
**PermissionMode**: auto
**BrowserTool**: none

---

## Why this exists

Three small framework deliverables are due Wed 2026-04-29 EOD so they can be demoed Thu 2026-04-30 (Encore cadence: Friday deliverables shown one day ahead):

1. **GitHub Actions scaffold** — Encore Playwright suite runs unattended in CI on **manual trigger only** (`workflow_dispatch`), Ubuntu + Chromium. Proof-of-pattern handed to Encore — their real production CI lives on their infra; ours just demonstrates the wiring works.
2. **Module-level parallelism** — Local Office and Locations modules run **concurrently as 2 workers**. Specs **within a module** stay serial because they share office 1604 / append to the same HIST tables — running them in parallel within a module would corrupt HIST row-0 expectations.
3. **MFA-less user contract** — Suite logs in with username/password from GitHub secrets, with **no MFA step**. User is being provisioned soon; we need an operational path to disable MFA on it the moment it lands so CI can verify green that day.

## Verified facts (Phase 1 explore — do not re-research in subplans)

- `.github/workflows/playwright-tests.yml` already exists (113 lines) but **does not pass any secrets / env vars** → currently fails auth in CI. This is a fix, not greenfield.
- `LoginPage.loginWithMicrosoft()` (`clients/encore/src/pages/login.page.ts:82, 215`) **already** branches on `mfaSecret` presence: when undefined, MFA step is silently skipped (logs `MFA not required`). **Zero code change needed** for MFA-less login.
- `CredentialLoader._loadEnvRecord()` (`src/common/credential-loader.ts:102`) returns `mfaSecret: undefined` when the env var is unset. Propagates correctly.
- Modules today: only **two** — `clients/encore/tests/specs/setup/local-office/` (3 specs) and `clients/encore/tests/specs/setup/locations/` (12 specs). HIST specs (`*-history.spec.ts`) live INSIDE each parent module dir.
- Current root `playwright.config.ts`: `workers: 1`, `fullyParallel: false`, browser-level projects only, no per-module projects.
- `authenticatedSession` fixture (`fixtures.ts:25-29`) is already worker-scoped → one SSO login reused per worker. Compatible with module-projects design.

## Subplan chain (dependency-ordered)

| ID | File | Depends on | Effort | Status |
|---|---|---|---|---|
| SP-EFD-01 | `SUBPLAN_EFD_01_MODULE_PARALLEL.md` | none | hi | DONE 2026-04-29 (logic; E2E verify deferred → SP-EFD-04) |
| SP-EFD-02 | `SUBPLAN_EFD_02_MFA_LESS_CONTRACT.md` | none | mid | DONE 2026-04-28 |
| SP-EFD-03 | `SUBPLAN_EFD_03_CI_WORKFLOW.md` | SP-EFD-01 | hi | DONE 2026-04-29 (logic; Phase A + Phase B deferred → SP-EFD-04) |
| SP-EFD-04 | `SUBPLAN_EFD_04_DEFERRED_VERIFICATION.md` | SP-EFD-01 + SP-EFD-02 + SP-EFD-03 all DONE | hi | Pending (gated on MFA-less user provisioning + B2C blue-screen resolution + user "ready" signal) |

**Wed run order** (executed): SP-EFD-01 + SP-EFD-02 first (parallel-eligible — different files, no shared state). Then SP-EFD-03. Real-secret CI run waits on user-arrival.

**Post-Wed update (2026-04-29)**: SP-EFD-04 added to the chain at user direction after the SP-EFD-01 verification attempt revealed three stacked external blockers (shared CI account locked out, B2C `oauth2/authresp` blue-screen unresolved, single-account TOTP collisions on `--workers=2`). All three subplans' logic has shipped to `done/`; parent plan stays Pending until SP-EFD-04 lands its end-to-end verification (which can only run when the MFA-less account exists and the user types `ready`).

## Out of Scope (parent-level — applies to all subplans)

- Push / PR / nightly cron triggers — DEFERRED.
- Windows / Firefox / Webkit CI jobs — DEFERRED.
- Sharding across runners — DEFERRED.
- Allure history preservation in CI — DEFERRED.
- Parallelism finer than module level — **forbidden** by HIST shared-state constraint.
- Provisioning the M365 user — owned by Rutvik / Encore admin.
- Programmatic MFA-disable — manual M365 admin step only.
- Editing `login.page.ts`, `credential-loader.ts`, `common-methods.ts`, `fixtures.ts`, `global-setup.ts` — already correct.

## Verification (parent-level — every subplan must satisfy these before parent closes)

- [ ] All 3 subplans `Status: DONE` with Execution Summary per LR-027.
- [ ] CI run with real secrets (post user-arrival): green. HTML report artifact downloadable. Run URL captured for Thu demo.
- [ ] Local: `npx playwright test --workers=2 --project=encore-local-office --project=encore-locations` shows 2 workers, both modules complete, no HIST row-0 mismatches.
- [ ] `git status` shows ONLY the files in each subplan's "Files to Touch" modified.
- [ ] No edits to `login.page.ts`, `credential-loader.ts`, `common-methods.ts`, `fixtures.ts`, `global-setup.ts`.

## Open Risk

User-arrival timing. If the new user does not land Wed AM, we lose the green-CI verification step. Mitigation: ship Deliverables 1, 2, 3 wiring on placeholders Wed AM/PM; flag the run-with-real-secrets verification as carried-over to early Thu AM, still in time for Thu EOD demo. Demo fallback = Phase A clean-auth-failure run + a recorded local 2-worker run.
