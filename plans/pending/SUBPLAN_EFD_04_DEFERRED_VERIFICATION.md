# SUBPLAN SP-EFD-04 — Deferred Verification (Run When Ready)

**Status**: Pending
**Priority**: P1-GATED (parent plan PLAN_FRIDAY_DELIVERABLE_2026-04-29 cannot close until this runs; gated on three external prerequisites — see Step 0)
**Created**: 2026-04-29
**Identity**: OWNER
**Parent**: PLAN_FRIDAY_DELIVERABLE_2026-04-29.md
**Depends on**: SP-EFD-01 DONE, SP-EFD-02 DONE, SP-EFD-03 DONE
**Blocks**: PLAN_FRIDAY_DELIVERABLE_2026-04-29.md closure (parent-cascade per LR-027 fires when this closes — last subplan in chain).
**Model**: claude-opus-4-7
**Thinking**: hi
**PermissionMode**: auto
**BrowserTool**: cli
**Justification**: Opus required for run-failure RCA if Phase A/B regress; Sonnet under-thinks multi-symptom auth-failure debug.
**Encore-deliverables repo URL**: `<set-at-Step-0.6>` (substitute everywhere `<DELIV_REPO>` appears)

---

## Context

Three Friday-deliverable subplans (SP-EFD-01 module-parallel, SP-EFD-02 MFA-less contract, SP-EFD-03 GitHub Actions workflow) shipped their **logic** on 2026-04-28 / 2026-04-29 but deferred their **end-to-end live verification** because of three stacked blockers:

1. **Shared automation user broken** — `s-prd-clickauto@psav.com` locked out (Rutvik 2026-04-29: *"the common automation user wont work"*). Until Encore IT fixes it, runs use Rutvik's personal MFA account (`TEMP_RUTVIK_EXPERIMENT` marker; creds in `.env.development.local` locally, GitHub secrets in CI).
2. **B2C `oauth2/authresp` blue-screen** — observed 2026-04-28/29 (`ConnectionTimeOut: An exception has occurred`). Independent of MFA; happens between auth-code consumption and the Navigator Cloud redirect. `auth.setup.ts` mitigates via 3-attempt locked retry; persistent failure across all 3 = HALT.
3. **TOTP collision under `--workers=2`** — proven 2026-04-29 (codes `787005` / `822332` / `448709` collided in lockstep). **SOLVED 2026-04-30 by EXP-AUTH-STATE-SHARED**: the new `setup` Playwright project does ONE login per run, writes `.auth/encore-state.json`, every worker reuses it. Files: `clients/encore/tests/setup/auth.setup.ts`, `auth-storage.ts`, `playwright.config.ts` (setup project + chromium dependencies/storageState wiring), `fixtures.ts authenticatedSession`.

This subplan exists so that the moment Rutvik is ready (or the auto-user lands), one greppable file captures every deferred gate with a HARD GATE at Step 0. When this lands DONE, parent plan auto-cascades closed per LR-027.

## Bootstrap

**Invoke**: `/execute SUBPLAN_EFD_04_DEFERRED_VERIFICATION.md`
**Identity**: OWNER (verification-only).
**Skills auto-called**: `/identity`, `/regression-guard` (before only — confirm SP-EFD-01/02/03 file landings still match recorded state), `/rca` (only if Phase A/B regress).
**Browser tool**: Playwright CLI. If the test account requires fresh MFA refresh outside `auth.setup.ts`'s 3-attempt budget → `[BROWSER-SWITCH]` to Chrome for one-time refresh per LR-038 v2, state-save, back to CLI.
**Phase 0 directive**: announce identity + browser-tool=cli + Opus/hi + readiness gate. `/regression-guard` snapshot. Read context files. Do NOT run tests until Step 0 gate clears.

**Context files** (read before Phase 0):

| File | Why | What to grep |
|---|---|---|
| `plans/done/SUBPLAN_EFD_01_MODULE_PARALLEL.md` | Execution Summary lists deferred gates | `Deferred gate` |
| `plans/done/SUBPLAN_EFD_03_CI_WORKFLOW.md` | Lists Phase A / Phase B as deferred | `Phase A` / `Phase B` |
| `playwright.config.ci.ts` | Confirm module projects wire `dependencies: ['setup']` + `storageState` | `dependencies.*setup\|storageState.*encore-state` |
| `playwright.config.ts` | Confirm `setup` project exists + chromium wiring | `name: 'setup'\|dependencies` |
| `clients/encore/tests/setup/auth.setup.ts` | 3-attempt locked login flow | `MAX_ATTEMPTS\|acquireLock` |
| `clients/encore/tests/setup/auth-storage.ts` | `STATE_PATH` resolves to `.auth/encore-state.json` | `STATE_PATH` |
| `clients/encore/tests/setup/fixtures.ts` | `authenticatedSession` reads `STATE_PATH` directly | `authenticatedSession\|STATE_PATH` |
| `.github/workflows/playwright-tests.yml` | SP-EFD-03 wiring + temp `NAVIGATOR_MFA_SECRET` env | `NAVIGATOR_MFA_SECRET\|TEMP_RUTVIK_EXPERIMENT` |
| `clients/encore/CLAUDE.md` | "Temporary credentials" + "CI User Provisioning Checklist" present | `TEMP_RUTVIK_EXPERIMENT` |

---

## Goal

End-to-end verify SP-EFD-01/02/03 against ONLY Encore deliverables, with **clean Playwright HTML + Allure HTML reports + a full run** (not partial).

### Hard scope rule (Rutvik directive 2026-04-30, verbatim)

> "we have to only work on the encore deliverables, we test only on separated encore deliverables in git, nothing else... we push the encore deliverables into a new git shit, then set the secrets and run it there, i expect a full run, i expect a clean playwright and allure html reports"

GitHub Actions verification (Phase A/B) AND local pre-flight runs (Step 1) MUST run from a NEW, SEPARATE git repo (call it `<DELIV_REPO>`) — NOT from `RutviK-JBS/qa_agentic_framework_global` (the framework monorepo). The framework monorepo is the AUTHORING surface (plans, agents, hooks, cross-client framework). The Encore-deliverables repo is the EXECUTION surface (minimal, demo-clean, no internal scaffolding).

| Ships into `<DELIV_REPO>` | Does NOT ship |
|---|---|
| `clients/encore/**` | `plans/`, `.claude/`, `docs/read_only_docs/` |
| `src/**` (framework support) | `agent-mistakes.md`, `agent-activity-log.md`, `_internal/`, `field-inventories/`, `neutral-eye-audits/` |
| `playwright.config.ts` + `playwright.config.ci.ts` | Other clients (`clients/<other>/`) |
| `.github/workflows/playwright-tests.yml` | Framework-internal `scripts/` (plans-reindex, archive-allure, etc.) |
| `package.json`, `package-lock.json`, `tsconfig*.json` | |
| `.gitignore` (with `.auth/`, `.env.*.local`, `reports/`) + `.env.example` | |

### Account paths

- **Today** — temp MFA account via `.env.development.local` (local) / GitHub secrets in `<DELIV_REPO>` (CI). Setup project does ONE MFA login; all workers reuse `.auth/encore-state.json`.
- **Future** — once auto-user lands, swap creds + drop `NAVIGATOR_MFA_SECRET` per the removal checklist in `clients/encore/CLAUDE.md` § "Temporary credentials". Verification re-runs identically; only delta is `auth.setup.ts` skipping TOTP step.

---

## Step −1 — Pre-flight code prerequisites (verify or apply BEFORE the deliverables repo is created)

These edits must land in the framework monorepo first; the deliverables repo split copies them forward.

| Edit | Where | Why | Grep verification |
|---|---|---|---|
| Module projects declare `dependencies: ['setup']` + `use: { storageState: '.auth/encore-state.json' }` | `playwright.config.ci.ts` (`encore-local-office` + `encore-locations`) | Without this, GA `--project=encore-local-office --project=encore-locations` never fires `setup` project → fresh-login-per-worker → MFA collision returns | `grep -cE "dependencies:.*\['setup'\]" playwright.config.ci.ts` ≥ 2 |
| `NAVIGATOR_MFA_SECRET: ${{ secrets.NAVIGATOR_MFA_SECRET }}` (TEMP_RUTVIK_EXPERIMENT marker comment) in workflow env block | `.github/workflows/playwright-tests.yml` | Temp account has MFA enabled; setup project's TOTP step needs the secret | `grep -c "NAVIGATOR_MFA_SECRET:" .github/workflows/playwright-tests.yml` = 1 |

If either grep fails → HALT, apply the missing edit, re-grep. Do NOT advance to Step 0.

---

## Step 0 — HARD READINESS GATE (HALT until cleared)

Agent MUST NOT proceed past this step until ALL prerequisites are confirmed in the same chat as `/execute`:

| # | Prereq | Confirmation phrases (any one) |
|---|---|---|
| 1 | Operational test account exists — EITHER MFA temp account in `.env.development.local` OR MFA-less auto-user provisioned | `temp account ready` / `auto user ready` / `account is fixed` |
| 2 | B2C `oauth2/authresp` blue-screen verified non-blocking — either user confirms OR Step 0.5 single-spec sanity passes | `blue screen resolved` / `b2c fixed` (or auto-clear via Step 0.5) |
| 3 | `<DELIV_REPO>` exists — Rutvik created the new git repo with ONLY the §"Ships into" files | `deliverables repo ready` / `new repo created` |
| 4 | GitHub secrets present in `<DELIV_REPO>` — `NAVIGATOR_USERNAME` / `NAVIGATOR_PASSWORD` / `BASE_URL` (+ `NAVIGATOR_MFA_SECRET` for temp-account path only) | `secrets in repo` / `gh secrets ready` |
| 5 | User explicitly says go | `ready` / `start verification` / `green to verify` |

If ANY prereq missing → HALT, name the missing one, do NOT proceed.

## Step 0.5 — Single-spec sanity (auto-clears Step 0 #2 if green)

Run from a local clone of `<DELIV_REPO>` — NOT from this monorepo:

```bash
git clone <DELIV_REPO> ~/encore-deliv && cd ~/encore-deliv && npm ci
npx playwright test --config=playwright.config.ci.ts --workers=1 --project=encore-local-office \
  clients/encore/tests/specs/setup/local-office/local-office-settings.spec.ts -g "first test name"
```

Creds are picked up from `.env.development.local` automatically (do NOT inline-export — bypasses dotenv-flow layering).

- **Pass** → setup log shows `[auth.setup] login succeeded on attempt N/3` + `state saved` + `state validates from fresh context`. Step 0 #2 cleared.
- **Fail with `oauth2/authresp` URL across all 3 setup retries** → blue-screen persistent → HALT, escalate (auth-design redesign ticket).
- **Fail any other way** → `/rca` skill before retrying.

## Step 0.6 — Capture `<DELIV_REPO>` slug

Once Step 0 #3 clears, capture the actual repo slug (e.g., `RutviK-JBS/encore-playwright-deliverables`) into the frontmatter `**Encore-deliverables repo URL**` line above. Substitute every `<DELIV_REPO>` placeholder in this file before proceeding.

## Step 1 — SP-EFD-01 deferred gates (LOCAL workers=2 from `<DELIV_REPO>` clone)

From `~/encore-deliv` (the clone from Step 0.5; if Step 0.5 was skipped, clone fresh now):

```bash
npx playwright test --config=playwright.config.ci.ts --workers=2 \
  --project=encore-local-office --project=encore-locations
```

**Run #1 acceptance** (verbatim from SP-EFD-01 §Verification deferred gates — LR-040(b) recipient line items):

- [ ] Reporter shows `Running <N> tests using 2 workers`.
- [ ] Both `encore-local-office` (3 specs) AND `encore-locations` (12 specs) projects complete; pass/fail tally per project captured.
- [ ] Pass count matches the SP-EFD-01 pre-change baseline (last green run before SP-EFD-01 config edit). If no recorded baseline exists → HALT and ask user; do NOT silently rebaseline.
- [ ] HIST ordering preserved: in `encore-locations` worker, `location-management-history.spec.ts` runs AFTER its sibling write-specs. In `encore-local-office`, `local-office-history.spec.ts` runs after siblings. Inspect Playwright reporter ordering OR `reports/test-results.json` `tests[].startTime`.

**Run #2 (idempotency)** — re-run the EXACT same command:

- [ ] Same pass count as Run #1.
- [ ] State-restore patterns hold (`location-currency.spec.ts` "Restore: USD Is Default" + "Cleanup: uncheck CAD" produce identical post-test state).

If EITHER run fails on auth → confirm `oauth2/authresp` root cause; if yes, HALT to Step 0 #2. If pass-count drift between runs → RCA before closing.

## Step 2 — SP-EFD-03 Phase A (CI wiring proof in `<DELIV_REPO>`)

Goal: prove the workflow file is plumbed correctly in `<DELIV_REPO>` without requiring real-account green.

- [ ] `.github/workflows/playwright-tests.yml` is on the default branch of `<DELIV_REPO>` — `gh workflow view playwright-tests.yml --repo <DELIV_REPO>` parses, shows `workflow_dispatch` only.
- [ ] If real secrets NOT yet in repo: `gh workflow run playwright-tests.yml --repo <DELIV_REPO>`. Expected = clean auth failure (`Sign in failed: invalid credentials` OR `[auth.setup] SSO + MFA login failed after 3 attempts`).
- [ ] Reject any failure mode that is NOT auth — YAML parse error / `npm ci` fail / project-name mismatch / artifact-upload step error / missing dependency at runtime (e.g., framework support file forgotten in the repo split) = deliverables repo broken; HALT and RCA before Phase B.

If real secrets ARE already in repo, Phase A and Phase B collapse → proceed directly to Phase B.

## Step 3 — SP-EFD-03 Phase B (real secrets, full green, in `<DELIV_REPO>`)

`gh workflow run playwright-tests.yml --repo <DELIV_REPO>` with all secrets loaded.

| # | Assertion | Command | Pass | Fail action |
|---|---|---|---|---|
| 1 | Run completes green | `gh run list --repo <DELIV_REPO> --limit 1` | shows ✓ | RCA failure |
| 2 | 2 workers in GA | `gh run view <RUN_ID> --repo <DELIV_REPO> --log \| grep -E 'using 2 workers'` | ≥1 hit | Workflow CLI `--workers=2` not honored — HALT |
| 3 | Both module projects ran | `gh run view <RUN_ID> --repo <DELIV_REPO> --log \| grep -E '\[encore-(local-office\|locations)\]'` | both tags present | Project filter broken or specs not discovered |
| 4 | All 4 artifacts present | `gh run view <RUN_ID> --repo <DELIV_REPO>` Artifacts list | `html-report` + `test-results` + `allure-results` + `allure-report` | Workflow regression vs Option A shape |
| 5 | **Clean Playwright HTML** | `gh run download <RUN_ID> --name html-report --repo <DELIV_REPO>`; open `index.html` | renders, all suites visible, no broken assets, no console errors | Re-render or file bug |
| 6 | **Clean Allure HTML** | `gh run download <RUN_ID> --name allure-report --repo <DELIV_REPO>`; open `index.html` | Overview + Suites populated with both module projects, no broken charts, no console errors | `npm run allure:generate` step regressed |
| 7 | **Full run, not partial** | `gh run view <RUN_ID> --repo <DELIV_REPO> --log` | ALL specs in `encore-local-office` (3) + `encore-locations` (12) executed; no `Worker process exited unexpectedly`; no silent `test.fixme()` skip | Investigate worker crash or skip |
| 8 | Setup project login markers | `gh run view <RUN_ID> --repo <DELIV_REPO> --log \| grep -E '\[auth\.setup\]'` | `login succeeded on attempt N/3` + `state saved` + `state validates from fresh context` | Setup project failed; check Phase A |
| 9 | Storage-state reused (proves shared-state worked) | grep for `[OK] Authenticated session ready via shared storageState` | ≥2 hits (one per worker) | `dependencies: ['setup']` wiring drift |
| 10 | TOTP step ran exactly ONCE (temp-account path) | grep `Generated TOTP code:` | exactly 1 hit | If >1, setup project ran multiple times = wiring drift |
| 11 | Run URL captured | — | URL recorded for parent plan Execution Summary | — |

## Step 4 — Document residual findings

If any of Steps 1-3 surfaced unexpected behavior: file `reports/bugs/BUG-AUTH-NNN.json` per LR-034 schema (in monorepo, NOT `<DELIV_REPO>`), append a row to `clients/encore/specs_planning/_internal/agent-mistakes.md` (also monorepo). Do NOT block closure unless `oauth2/authresp` is persistent across all 3 setup attempts (= auth-design redesign ticket).

## Step 5 — Auto-user removal hook + Parent-cascade closure

**Switch back to the framework monorepo for this step** — `plans/` lives here, not in `<DELIV_REPO>`.

If auto-user landed between Step 0 readiness clearance and now: run the removal checklist in `clients/encore/CLAUDE.md` § "Temporary credentials (2026-04-30 — REMOVE WHEN AUTO-USER WORKS)" verbatim. That single source of truth covers: `grep -r 'TEMP_RUTVIK_EXPERIMENT'` (run in BOTH monorepo AND `<DELIV_REPO>` clone), GitHub-secret swap, workflow YAML edit, `.env.development.local` cleanup, `.auth/encore-state.json` deletion, CLAUDE.md subsection deletion. Re-run Step 1 + Step 3 against the auto-user to confirm green parity. Decision (keep or revert EXP-AUTH-STATE-SHARED scaffolding) recorded in this subplan's Execution Summary.

**Parent-cascade per LR-027** (always runs, regardless of auto-user removal):

- [ ] `grep -lE '^\*\*Parent\*\*:.*PLAN_FRIDAY_DELIVERABLE_2026-04-29\.md' plans/pending/` → expected zero matches.
- [ ] If zero matches: close `plans/pending/PLAN_FRIDAY_DELIVERABLE_2026-04-29.md` per LR-027 (Status DONE, Executed today, Execution Summary citing the SP-EFD-01/02/03/04 chain), `git mv` to `plans/done/`.
- [ ] `npm run plans:reindex`.

## Verification (every box ticked before claiming done)

- [ ] Verification target was `<DELIV_REPO>`, NOT this monorepo (per 2026-04-30 hard-scope directive). `<DELIV_REPO>` URL captured in Execution Summary.
- [ ] Step −1 pre-flight grep verifications both passed in monorepo before the deliverables repo split.
- [ ] Step 0 readiness gate cleared with verbatim user signal.
- [ ] Step 1 Run #1 + Run #2 completed from a `<DELIV_REPO>` clone; reporter showed `using 2 workers` in both runs; HIST ordering preserved; pass-count tally captured.
- [ ] Step 2 Phase A wiring proof (clean auth failure OR Phase B collapsed in).
- [ ] Step 3 — all 11 assertions passed; clean Playwright + clean Allure HTML; full run.
- [ ] Step 4 — residual findings logged or "none" recorded.
- [ ] Step 5 — auto-user removal hook ran (or skipped with reason); parent-cascade closed PLAN_FRIDAY_DELIVERABLE_2026-04-29.md.
- [ ] `git status` (in monorepo) shows ONLY: this subplan moved to `done/`, parent plan moved to `done/`, `plans/INDEX.md` regenerated.
- [ ] `/regression-guard` after — zero structural change anywhere outside `plans/`.

## Out of Scope

- Authoring new specs / page objects / fixtures.
- Auth-design redesign (storageState shared-login alternatives, per-worker accounts, globalSetup-based) — separate ticket if `oauth2/authresp` is persistent.
- Provisioning / programmatic-MFA-disable of the M365 user (Rutvik / Encore IT).
- Inventing the `<DELIV_REPO>` repo or doing the file split (Rutvik does this manually before Step 0).

## Provenance

Created 2026-04-29 by OWNER as the LR-040(b) recipient for SP-EFD-01 + SP-EFD-03 deferred verification gates. Amended 2026-04-30 per Rutvik's hard-scope directive (verbatim in §Goal) requiring an isolated Encore-deliverables repo as the verification target + clean Playwright/Allure HTML + full-run expectation. Every deferred SP-EFD-01/03 acceptance criterion has a grep-verifiable line item in Steps 1-3 above; the 2026-04-30 amendment lives in §Goal §"Hard scope rule" + the §"Ships into / Does NOT ship" table + Step 0 #3 + Step 0.6 + every `<DELIV_REPO>` reference.
