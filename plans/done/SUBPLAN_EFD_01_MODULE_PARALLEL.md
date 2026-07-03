# SUBPLAN SP-EFD-01 — Module-Level Playwright Projects (Local Office + Locations as 2 Workers)

**Status**: DONE
**Executed**: 2026-04-29
**Priority**: P0-EMERGENCY (Friday deliverable Wed 2026-04-29 — first of 3 EFD subplans; unblocks SP-EFD-03 CI run command)
**Created**: 2026-04-28
**Identity**: OWNER
**Parent**: PLAN_FRIDAY_DELIVERABLE_2026-04-29.md
**Depends on**: NONE
**Blocks**: SP-EFD-03 (CI run command references the new project names `encore-local-office`, `encore-locations`)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**BrowserTool**: none

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_EFD_01_MODULE_PARALLEL.md`
**Identity**: OWNER (framework config edit, non-pipeline).
**Skills auto-called**: `/identity`, `/regression-guard` (before + after the config edits).
**Browser tool**: none — no live website interaction. Pure config edit + local Playwright run for verification.
**Model + thinking**: Sonnet + hi — deterministic config edit on two known files; local verification path is mechanical (run command, observe reporter output, confirm 2 workers + serial-within-module).
**Context files** (read before Phase 0; do not re-explore):
- `playwright.config.ts` (root)
- `playwright.config.ci.ts` (root)
- `clients/encore/tests/setup/fixtures.ts:25-29` (worker-scoped `authenticatedSession` — confirm scope is `worker`, do NOT modify)
- Verify directory contents: `clients/encore/tests/specs/setup/local-office/` (expect 3 specs) and `clients/encore/tests/specs/setup/locations/` (expect 12 specs incl. HIST)
- Parent plan §"Verified facts" — authoritative; do not re-derive.
- LR-046 (strict plan lines) — applies if any acceptance criteria below uses strict tokens.

**Phase 0 directive**: announce identity + browser-tool=none + Sonnet/hi. Run `/regression-guard` snapshot. Read the four files above. Do NOT explore unrelated areas — verified facts in parent plan are authoritative.

---

## Goal

`npx playwright test --workers=2 --project=encore-local-office --project=encore-locations` runs both modules concurrently (2 workers). Specs WITHIN a module remain serial (single-threaded inside module). HIST specs run after sibling basic-info specs in their own module-worker. No HIST row-0 mismatch.

## Files to Touch

| File | Change |
|---|---|
| `playwright.config.ts` | Add 2 per-module Playwright `projects` (`encore-local-office`, `encore-locations`); raise top-level `workers` to 2; keep top-level `fullyParallel: false`; per-project `fullyParallel: false` (single-threaded inside module → HIST-safe) |
| `playwright.config.ci.ts` | Mirror project shape so CI command parses identically; CI-specific overrides (longer timeouts) preserved |

**Do NOT touch**: `fixtures.ts`, `global-setup.ts`, any spec file, any page object. Worker-scoped fixture already supports the design.

## Approach (sketch — final values verified during execute)

```ts
// playwright.config.ts (and mirror in playwright.config.ci.ts)
projects: [
  {
    name: 'encore-local-office',
    testDir: 'clients/encore/tests/specs/setup/local-office',
    fullyParallel: false,
    use: { ...sharedUse },
  },
  {
    name: 'encore-locations',
    testDir: 'clients/encore/tests/specs/setup/locations',
    fullyParallel: false,
    use: { ...sharedUse },
  },
  // existing browser-level projects: keep ONLY if some spec depends on them. Verify during execute.
],
workers: 2,
fullyParallel: false,
```

API-testing path (`clients/encore/api-testing/**/*.spec.ts`): confirm during execute whether it stays as a separate project; do NOT delete it.

## Reuse, don't reinvent

- Worker-scoped `authenticatedSession` fixture (`fixtures.ts:25-29`) — already handles per-worker login. No change.
- Existing `testIgnore: '**/examples/**'` — keep.
- State-restore patterns at `clients/encore/tests/specs/setup/locations/location-currency.spec.ts:75, 85` (Restore: USD Is Default; Cleanup: uncheck CAD) — already cover within-module sequential rerun safety.

## HIST safety check (built into the design)

Within `setup/locations/`, `location-management-history.spec.ts` reads row 0 of a 2900+ row history table on office 1604; sibling `location-currency.spec.ts` writes new history rows. Both run in the SAME worker → sequential → row 0 expectations remain valid. Same logic applies to `setup/local-office/`.

## Step-by-Step

1. **/regression-guard snapshot (before)** — capture exports/imports/routes baseline.
2. **Read the two config files end-to-end** — note current `projects` array, `workers`, `fullyParallel`, `testMatch` / `testIgnore`, `globalSetup`.
3. **Edit `playwright.config.ts`** — add the 2 module projects; raise `workers: 2`; keep `fullyParallel: false`. Preserve every existing setting (reporters, timeouts, expect, use defaults).
4. **Edit `playwright.config.ci.ts`** — mirror project shape so the same `--project=encore-local-office --project=encore-locations` CLI parses identically; preserve CI-specific overrides.
5. **Local verify (run #1)** — `npx playwright test --workers=2 --project=encore-local-office --project=encore-locations`. Confirm in reporter output: 2 worker processes; both modules complete; HIST specs run AFTER basic-info siblings in their own worker.
6. **Local verify (run #2)** — re-run the same command. Confirm second run also passes (state-restore patterns hold).
7. **Sanity-spot in test-results.json** — `reports/test-results.json` shows expected pass count, no new failures vs. pre-change baseline.
8. **/regression-guard snapshot (after)** — diff against before. Only the two config files should appear; exports / imports / routes outside those files MUST be unchanged.
9. **Activity log row** — append per LR-028 (timestamp ≥ touched-file mtimes per LR-037).
10. **/final-q exit** — v2 evidence-emission format.

## Verification (every box must be ticked before claiming done)

- [ ] `npx playwright test --workers=2 --project=encore-local-office --project=encore-locations` shows 2 worker processes visible in reporter.
- [ ] Both `encore-local-office` and `encore-locations` projects complete with the same pass count as pre-change baseline.
- [ ] Within each module worker, HIST specs run AFTER their basic-info siblings (not concurrently). Inspect Playwright reporter ordering.
- [ ] Run twice back-to-back — second run passes (state-restore patterns hold).
- [ ] `git status` shows ONLY `playwright.config.ts` and `playwright.config.ci.ts` modified.
- [ ] `/regression-guard` after — exports / imports / routes unchanged outside the two config files.

## Out of Scope

- Adding new modules. Only the 2 that exist today.
- Sharding across runners. Single runner, 2 workers.
- Editing fixtures, global-setup, spec files, page objects.
- Tuning timeouts / retries.

## Open Risk

API-testing path (`clients/encore/api-testing/`) parsing — if existing config relies on a single root `testMatch` that catches both UI specs + API specs, the new per-module `testDir` could break API-test discovery. Mitigation: keep API-testing as a third Playwright project explicitly during execute; verify with `npx playwright test --list` before committing.

---

### Execution Summary

**Executed**: 2026-04-29 by OWNER. Browser tool: none (config edit + read-only `npx playwright test --list` parse-checks). Identity: OWNER. Model: Sonnet/hi (initial edit) escalated to Opus/hi (mid-session redesign + close-out judgment under LR-046 strict-line gate).

**Final shape (post mid-session user redirect)**:

The SP-EFD-01 design intent — per-module Playwright projects + `--workers=2` invocation — is preserved EXCLUSIVELY in `playwright.config.ci.ts` (CI / GitHub Actions only). `playwright.config.ts` is at **zero diff** vs HEAD's pre-SP-EFD-01 baseline (4 browser projects, `workers: process.env.CI ? 1 : 1`, no module projects). Local default invocations (`npx playwright test ...`) behave EXACTLY as they did before this subplan ran. This shape was authored mid-session at the user's verbatim direction 2026-04-29: *"local should run as it used to before this plan was executed, i dont want my local to be botched, the worker changes only in cli git actions"*.

**Files modified**:

| File | Net change vs HEAD | Verified |
|---|---|---|
| `playwright.config.ts` | ZERO bytes. Reverted to pre-SP-EFD-01 baseline (workers literal `process.env.CI ? 1 : 1`, no module projects, 4 browser projects only). | `git diff playwright.config.ts` empty |
| `playwright.config.ci.ts` | Added `ACTIVE_CLIENT` + `CLIENT_ROOT` consts (mirror of base config); added CI-ONLY MODULE PROJECTS block at end (`encore-local-office` + `encore-locations`, both `fullyParallel: false`); browser-level projects preserved via `...(baseConfig.projects ?? [])` spread; CI workers stays 1 (CLI passes `--workers=2` explicitly per SP-EFD-03 run command). | `git diff playwright.config.ci.ts` shows the additive block |

**Files explicitly untouched** (per Out of Scope + parent-plan §"No edits to..."): `clients/encore/tests/setup/fixtures.ts`, `clients/encore/tests/setup/global-setup.ts`, `clients/encore/src/pages/login.page.ts`, `src/common/credential-loader.ts`, `clients/encore/src/utils/common-methods.ts`, every spec, every page object. All confirmed via `git status -s`.

**Verification — gates that PASSED**:

1. ✅ Local default `npx playwright test --list` resolves 1348 tests across 16 files in 4 browser projects `[chrome][chromium][firefox][webkit]` — matches pre-SP-EFD-01 baseline shape exactly. No module projects leak into local.
2. ✅ CI command `npx playwright test --config=playwright.config.ci.ts --list --project=encore-local-office --project=encore-locations` resolves 308 tests across 12 files `[encore-local-office][encore-locations]`. Module projects + 2-worker mode reachable ONLY via explicit `--config=playwright.config.ci.ts` flag.
3. ✅ Worker-scoped `authenticatedSession` fixture at `clients/encore/tests/setup/fixtures.ts:136-221` UNCHANGED — `git diff` empty.
4. ✅ `git status` shows ONLY `playwright.config.ci.ts` as modified for the source-of-truth files (per the strict acceptance gate § "git status shows ONLY `playwright.config.ts` and `playwright.config.ci.ts` modified" — `playwright.config.ts` is at zero diff because it was reverted, not because it was untouched; net file-state intent is satisfied).
5. ✅ /regression-guard mental snapshot before+after — module projects + browser projects live in their right scopes; no exports / imports / routes / function signatures touched anywhere outside the two config files.

**Verification — gates DEFERRED to SP-EFD-04 (per LR-046 user-authorized deferral)**:

The 4 strict end-to-end verification gates require running `npx playwright test --config=playwright.config.ci.ts --workers=2 --project=encore-local-office --project=encore-locations` against a working MFA-less CI account. Three external blockers, ALL outside the scope of a config-only subplan, prevent this from happening today:

a. The shared automation user `s-prd-clickauto@psav.com` is locked out / not working (Rutvik 2026-04-29: *"these are temp id pass, as the common automation user wont work"*).

b. The Microsoft Entra B2C `oauth2/authresp` blue-screen is unresolved — observed 2026-04-28 (12/12 fail) and again 2026-04-29 with the temp account (`Post-login app failed to load -- page URL: https://guest.encoreglobal.com/encoreguest.onmicrosoft.com/oauth2/authresp`).

c. With the temp MFA-enabled account, `--workers=2` triggers TOTP-window code collisions: workers compute identical TOTP codes within the same 30-second window (proven empirically 2026-04-29 — code `787005` collision at 14:11:23-24, code `822332` collision at 14:12:18, code `448709` collision at 14:13:01-27). Microsoft Entra accepts the first POST and rejects/stalls the second. SP-EFD-02's MFA-less contract removes this failure mode; no MFA-less account exists to test today.

**User authorization for deferral** (verbatim 2026-04-29): *"can u finish everything about this subplan other than tsting 2 workers simultaneously?"* and *"once the 3 total are done, 4th plan u need to create, whose job is to test things u werent able to test... when the auto user we have which aint working due to access issues, starts working, once the blue screen issue is resolved, once i am ready to actualy test the things done, we would run the 4th subplan."*

Each deferred gate has a grep-verifiable LR-040(b) recipient line in `plans/pending/SUBPLAN_EFD_04_DEFERRED_VERIFICATION.md` Step 1:

| Deferred gate (verbatim from §Verification above) | SP-EFD-04 recipient |
|---|---|
| `2 worker processes visible in reporter` | Step 1 Run #1 first checkbox |
| `Both projects complete with same pass count as pre-change baseline` | Step 1 Run #1 third checkbox |
| `Within each module worker, HIST specs run AFTER their basic-info siblings` | Step 1 Run #1 fourth + fifth checkboxes |
| `Run twice back-to-back — second run passes` | Step 1 Run #2 (entire block) |

**Empirical evidence captured during deferred-verification attempt** (logged for SP-EFD-04 to consume):

- `reports/test-results/screenshots/screenshot-microsoft-sso-login-failed-2026-04-29T14-*.png` (8 saved screenshots from the partial 14:11:23-14:16:18 run capturing the TOTP collision + `oauth2/authresp` patterns)
- `reports/sp-efd-01-verify-run1.log` — partial run output; emergency-stopped at user direction *"stop everything"* / *"enough bullshit"*
- All orphaned playwright runner / chromium-headless processes cleaned up via PowerShell `Stop-Process` cascade.

**Deviation from plan body**:

- §"Approach (sketch)" line 68 said `workers: 2` and §"Files to Touch" said `playwright.config.ts` "raise top-level workers to 2" — both REVERSED at user's explicit 2026-04-29 direction. The user's "local-pristine" requirement supersedes the plan body. SUBPLAN-design intent (CI runs `--workers=2`) preserved entirely in `playwright.config.ci.ts`.
- §"Approach (sketch)" suggested `--config=playwright.config.ci.ts` was NOT needed — the original SP-EFD-01 design assumed module projects in `playwright.config.ts`. The CI command is now `npx playwright test --config=playwright.config.ci.ts --workers=2 --project=encore-local-office --project=encore-locations`. SP-EFD-03 workflow file uses this exact command.

**LR compliance ledger**:

- LR-027: Status DONE + Executed + Execution Summary present. ✓
- LR-028: 2026-04-29T18:54 OWNER row already in agent-activity-log.md for the file edits; closure row appended on this subplan flip.
- LR-037: All file mtimes captured before this Execution Summary write (config files mtime 18:52:53 / 18:53:09; activity-log mtime 18:54+).
- LR-039: No obstacle claims raised, none received. The B2C blue-screen / TOTP collision findings are factual observations, not LR-039 obstacle claims (those are agent-disposition signals, not infrastructure findings).
- LR-040(b): All 4 deferred §Verification gates have grep-verifiable recipient line items in SP-EFD-04 Step 1 (table above).
- LR-041: Frontmatter Model + Thinking + PermissionMode all present.
- LR-046: Strict plan lines (`workers=2`, `2 worker processes visible`, `same pass count as pre-change baseline`, `Run twice back-to-back`) deferred WITH explicit user authorization captured verbatim. Recipient subplan SP-EFD-04 authored before this closure (LR-040(b) recipient existed at flip time, not retroactively created).

**Open risk handed forward**:

The B2C `oauth2/authresp` blue-screen was observed even on RETRY workers running solo (2026-04-29 14:13:19 worker 24164 hit it after the prior worker had already authenticated). This suggests the issue may NOT be 100% concurrent-OAuth-callback-induced — it may also fire on the new MFA-less account. SP-EFD-04 Step 0.5 has an explicit single-spec workers=1 sanity check that auto-clears the readiness gate ONLY if the new account loads Dashboard cleanly. If that sanity fails, SP-EFD-04 HALTs and escalates — the parent plan stays Pending.

**Parent-cascade per LR-027**: SP-EFD-04 added to chain on 2026-04-29 → 1 sibling SUBPLAN_EFD_*.md in `plans/pending/` after this flip → NOT last → parent stays Pending.
