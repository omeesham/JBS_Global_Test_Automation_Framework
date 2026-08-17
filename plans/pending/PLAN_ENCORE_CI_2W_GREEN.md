# PLAN — Encore CI 2-Worker Green (Local Verification Before Push)

> **Status**: PENDING (scope reduced — see Audit corrections 2026-05-08)
> **Priority**: P0 — blocks any client-deliverable push.
> **Created**: 2026-05-07

---

## Audit corrections (2026-05-08) — added by PLAN_ENCORE_FULL_TRIAGE_AND_REMEDIATION B4

This plan was authored 2026-05-07 against a 35-fail 1w baseline and 28-fail 2w baseline. Three of
the four hypothesized failure populations have since been **closed by independent stabilization
plans**. This section enumerates what's been superseded so the plan's remaining scope is unambiguous.

| Original scope item | Status | Closed by |
|---|---|---|
| **Phase 1 G-4 — MGH hardcode hunt** (MGH-008..018, ~9 tests at 1w) | **DONE via stabilization plan** (cross-spec follow-up = B1 of triage plan) | `plans/done/PLAN_MGH_STABILIZATION.md` (2026-05-08) + cross-spec MGH-008 Option C truthy patch in `PLAN_ENCORE_FULL_TRIAGE_AND_REMEDIATION.md` Phase B1 |
| **LI 1w cluster** (LI-021/029, 026, 045, 067-069, SKIP-BILLING) | **DONE via stabilization plan** (already noted at line 36, kept) | `plans/done/PLAN_LI_STABILIZATION.md` (2026-05-08) |
| **MGH 1w cluster** (MGH-008..018) | **DONE via stabilization plan** | `plans/done/PLAN_MGH_STABILIZATION.md` (2026-05-08) |
| **PRI 1w cluster** (PRI-015..022) | **DONE via stabilization plan** (executor-deviation noted) | `plans/done/PLAN_PRI_STABILIZATION.md` (2026-05-08) |
| **BAS 1w late cluster** (BAS-025..047) | **DONE via stabilization plan** | `plans/done/PLAN_ONE_GUIDE_SAID_THIS.md` (2026-05-08) |
| **dependencyGate hard-cascade** (Phase 0 step 2 noise) | **DONE — refactor landed** | `plans/done/PLAN_DEPENDENCY_GATE_REMOVAL.md` (2026-05-08) |

**Remaining scope (open work)**:

- **Phase 2.5 (loud-save)** — `clickSaveAndConfirm` propagate-or-throw audit. Still open. Some pages
  (e.g., `local-office-account-address.page.ts:395 clickSave`) propagate; `local-office-settings.page.ts:125 clickSaveAndConfirm` swallows. Inconsistency itself is the bug.
- **Phase 3 (MAX_WORKERS=2 mitigation)** — empirical mitigation pinning. Status-check whether the
  one-day-later fresh full-suite run (Phase A of triage plan, `_lo-only-1w-2026-05-08.txt` +
  `_locations-1w-2026-05-08.txt`) still surfaces 4w-only failures (BAS-022, ACC-019..028, NTS-001).
  If the 1w fresh runs are at ≤5 fails, the 2w mitigation may be unnecessary — re-evaluate scope.
- **Phase 6 (fixtures.ts goto evaluation)** — measurement task; NOT yet executed. Independent of
  the stabilization plans.
- **Phase 7 (closure ceremonies)** — pending Phase 2.5/3/6 completion.
- **Guidelines G-1..G-7** — whether to graduate as new LR-NNN rules is OWNER's call. The
  observations are still valid post-stabilization-plans.

**Recommendation**: do NOT close this plan autonomously. After PLAN_ENCORE_FULL_TRIAGE_AND_REMEDIATION
lands, OWNER decides:

1. Close this plan if Phase A truth shows ≤5 fails at 1w (MGH/LI/PRI/BAS clusters all green) —
   meaning Phase 2.5/3 are no longer load-bearing for green-CI; the residual 4w-only failures will
   be addressed via a future Phase 2.5-only subplan.
2. Keep open and execute Phase 2.5/3/6 if the 4w env on GitHub Actions still trips server 500s.

The decision is **scope-versus-effort** — not a blocker. Surfacing in chat per LR-039.

---
> **Identity**: OWNER
> **Model**: claude-opus-4-8
> **Thinking**: xhi
> **PermissionMode**: auto
> **BrowserTool**: none
> **Depends on**: PATCH 1+2 working tree changes (BAS-001 / LI-001 baseline resets) — already applied, NOT committed; must remain in-tree.
> **Skills**: /execute, /rca (Phase 1, Phase 5), /regression-guard (Phase 2, Phase 6 wraps), /reflect, /final-q

---

## Context

The encore-local-office + encore-locations Playwright suite (309 tests) is failing at unacceptable rates across all worker counts: 37 fails (4w) / 28 fails (2w) / 35 fails (1w). State of RCA: NOT FULLY CONFIRMED at plan-author time. Hypotheses formed from 4w JSON + 1w stdout + spec source reading. Phase 1 of this plan exists to actually verify them by running the failing specs in isolation per LR-018 step 2.

### Updated 3-layer RCA — 2026-05-08 (replaces the 2-RC framing)

The earlier "RC-A env saturation" framing was wrong. `net::ERR_ABORTED` is client-side prefetch cancellation noise, NOT a server-pressure signal. The actual evidence in the 4w JSON for TC-LOC-ACC-019 is a real **server 500** on `/navigator/api/location/update-properties` (line 27 of the JSON's first failure entry). The corrected model:

| Layer | Role | Status | Where to verify |
|---|---|---|---|
| Server 500 on save under concurrent multi-worker load | TRIGGER (proven for ACC-019, inferred for the other 4w-only failures) | Proven for one test, unproven for the other ~9 4w-only failures | 4w JSON `consoleErrors[].text` for ACC-020..028, BAS-022, LI-025, NTS-001 |
| `clickSaveAndConfirm` swallows the failure result | AMPLIFIER #1 — silent save | **PROVEN 2026-05-08**. `local-office-settings.page.ts:125` declares `Promise<void>` and discards the `{success, networkError}` returned by `base-page.ts:347 clickSaveWithDialog`. Other pages propagate (e.g. `location-account-address.page.ts:395 clickSave` returns the result correctly), so the inconsistency itself is the bug. Fix: bring all `clickSaveAndConfirm` wrappers into line with the propagate-or-throw pattern. | `clients/encore/src/pages/base.page.ts:347` (correct) and `clients/encore/src/pages/local-office/local-office-settings.page.ts:125` (broken) |
| Some tests have cleanup OUTSIDE `try/finally` (e.g. BAS-023, BAS-024, BAS-027) | AMPLIFIER #2 — dirty state cascades | Proven by source read (`local-office-settings.spec.ts:325-340`, `:342-355`, `:378-384`) | Spec source itself |

Three failure populations emerge from this model:

1. **~10 4w-only failures** (BAS-022, LI-025, ACC-019..028, NTS-001) — Layer 1 fires under 4-worker concurrency, Layer 2 silences it, the assertion three lines later fails in some unrelated way. Disappears at 1w because Layer 1 doesn't fire. Lower workers is a *mitigation*, not a fix. Real fix = Layer 2 (make save loud).
2. **~19 BAS late cluster** (BAS-025..047 at `local-office-settings.spec.ts`) — Layer 3 cascades dirty state from earlier mutating tests in same spec. Persists at 1w/2w. Real fix = wrap save+verify in try/finally + LR-009-correct restore + reload.
3. **~16 MGH/PRI 1w-only** (MGH-008..018, PRI-015..022) — different mechanism: tests assert hardcoded ROW_1_EXPECTED values for fields BAS save cycles mutate. MGH-008 author admits Country drifts (line 92-94 inline comment) but still hardcodes Phone/Name/etc. anyway. Cross-worker timing masks this at 2w/4w; deterministic 1w sequential exposes it. Real fix = G-4 (don't hardcode mutable values).

### LI cluster at 2w (~7 tests, unverified) — **DONE via PLAN_LI_STABILIZATION (2026-05-08)**

~~Per handoff: LI-021/029, 026, 045, 067-069, SKIP-BILLING fail at 2w but pass at 1w. Suggests cross-worker race between encore-local-office and encore-locations workers writing office 1604 state simultaneously. Not yet reproduced; Phase 5 of this plan handles.~~

**Status superseded** — `plans/done/PLAN_LI_STABILIZATION.md` (2026-05-08) verified LI green at both 1w and 2w retries=0 across three back-to-back runs (35/35 each, 105/105 total) — the 7-test cluster (LI-021/029, 026, 045, 067-069, SKIP-BILLING) all pass at every worker count when LI runs alone. Intra-LI race hypothesis falsified. Cross-project race hypothesis remains untested by design (would require 2-project simultaneous run; out of LI plan scope; framework fixes from PLAN_ONE_GUIDE_SAID_THIS likely already mitigate). Phase 5 of this plan is now **redundant for LI** — re-run only if a future broad-suite regression at 2w reproduces failures.

### Strategy

`MAX_WORKERS=2` is an empirical mitigation that reduces the rate at which Layer 1 fires; it does NOT fix the root cause. The actual fix is multi-layered:

1. **Make save loud** (Phase 2.5 — new) — read `clickSaveAndConfirm`, propagate save failures via throw or boolean return that the caller MUST handle. Removes Layer 2.
2. **Try/finally cleanup** (Phase 2) — applies template from BAS-022 to BAS-023..047 contaminators. Removes Layer 3 for the BAS late cluster.
3. **Workers pinned to 2** (Phase 3) — empirical mitigation of Layer 1 trigger frequency. Documented as mitigation, not root-cause fix.
4. **Hardcode-mutable hunt** (Phase 5 — extended) — fix MGH-008 + similar to read row values dynamically rather than hardcode.

**Out of scope (deliberately)**: refactoring the test architecture to per-worker office isolation (G-7 — the meta-fix; quarter-scale work, not in this plan), web research, ship-to-deliverable workflow.

### What's currently UNPROVEN — must verify in Phase 1

- BAS-022 fails at 4w but passes at 1w (per handoff data, not reproduced by me)
- BAS-025..047 fail in run-all but pass when isolated (LR-018 step 2 — never executed)
- MGH-008..018 + PRI-015..022 fail at 1w in run-all but pass in isolation
- The LI cluster at 2w
- `clickSaveAndConfirm` actually discards the failure signal (G-2 trigger)

Phase 1 runs the 3 failing specs in isolation (each at workers=1, separate processes) to populate this matrix.

### Phase 1 RESULTS (2026-05-08, executed in this session)

3 spec runs at `--workers=1` each, in parallel processes:

- BAS run: a baseline report (path does not resolve — file was never committed) — 38 pass / **20 fail** / 1 flaky / 1 skip / 36.1m
- MGH run: `clients/encore/reports/_mgh-only-2026-05-08.txt` — 8 pass / **9 fail** / 0 flaky / 3 skip / 14.3m
- PRI run: `clients/encore/reports/_pri-only-2026-05-08.txt` — 19 pass / **8 fail** / 1 flaky / 7 skip / 23.7m

**Reproduction matrix:**

| Spec | 1w run-all fails | Isolated fails (this session) | Δ | Verdict |
|---|---|---|---|---|
| BAS | 19 (BAS-025..047) | 20 (same 19 **+ BAS-065 NEW**); BAS-001 went flaky (1 retry) | +1 fail | Same late-cluster pattern. In-spec cumulative contamination from BAS-002..024 still plausible for BAS-025..047. BAS-065 = new finding (state issue late in spec). |
| MGH | 9 (MGH-008..018) | 9 (same exact set) | 0 | **Cross-spec contamination REFUTED.** Tests fail intrinsically. MGH-018 = `tabBasicInformation` selector timeout. MGH-008 etc = stale `ROW_1_EXPECTED` / hardcoded values that don't match office 1604's current cumulative server state (LR-022 / G-4). |
| PRI | 7 (PRI-015..022) | 8 (same 7 **+ PRI-023 NEW**); PRI-001 went flaky (retry-passed) | +1 fail, +1 flaky | **Cross-spec contamination REFUTED.** Tests fail intrinsically. PRI-001 flake = `[data-testid="location-settings-tab-pricing"]` 30s timeout (tab readiness, not contamination). |

**Aggregate: isolated = 37 fails. 1w run-all = 35 fails. Isolation does NOT reduce failures — it slightly INCREASES them.**

### Updated 3-layer RCA — what the data actually says

The data refutes most of my earlier framing. The 1w run-all 35-fail story is NOT primarily contamination. Each spec fails on its own merits:

| Spec | Real cause |
|---|---|
| BAS-025..047 (19 tests) | Likely in-spec cumulative state from BAS-002..024 — same 19 fail in run-all AND isolated. Within-spec minimal-pair grep would confirm which earlier tests are the contaminators. Phase 1.5 work (NOT executed yet). |
| BAS-065 (1 test) | New finding. Late-spec timing or state — `clearAndTab` on Return offset failed `el.click()` after running 60+ prior BAS tests. Cumulative dirty state likely. |
| MGH-008..018 (9 tests) | Stale hardcoded data + selector timeout. `ROW_1_EXPECTED`, `COLUMN_COUNT`, `NON_SORTABLE_COLUMNS` etc. were authored against an older office 1604 state. Cumulative pollution from prior test sessions over days has drifted the server reality. MGH-018 fails on `tabBasicInformation` 10s timeout — selector / page-state issue. |
| PRI-015..022 (7 tests) + PRI-023 (1) | Same shape as MGH: stale hardcoded assertions + tab-readiness flake. PRI-001 is flaky on the same `tabPricing` selector timeout pattern. |
| 4w-only ~10 (BAS-022, LI-25, ACC-019..028, NTS-001) | Hypothesis: server 500 on `/update-properties` under concurrent save load (proven for ACC-019 via console error). NOT reproduced in this session — would need a workers=4 isolated run of just those 10. |
| LI cluster at 2w (~7) | Hypothesis: cross-worker race between encore-local-office and encore-locations workers writing office 1604. NOT reproduced in this session. |

**The plan's Phase 2 (try/finally cleanup for BAS-002..024) addresses ONE of these populations (BAS-025..047 only). Phase 5 (MGH/PRI hardcoded values) is more load-bearing than originally framed — it touches 17+ tests. Phase 2.5 (make-save-loud) addresses the 4w-only population's amplifier #1, doesn't fix the trigger.**

**Tab-readiness selector flakes (BAS-001, MGH-018, PRI-001 / PRI-023) are an unanticipated 4th category** — likely a shared base-page / waitForAngularStable issue, OR cumulative env latency at this time of day. Need separate investigation.

### Status: NOT proceeding with Phase 2/2.5/3 fixes

User direction was: read results, analyze, then STOP. Standing by for user input on which population to fix first.

---

## Bootstrap

- Identity: OWNER (default, non-pipeline). No auto-load needed.
- Skills auto-called: `/regression-guard` wraps every code edit; `/reflect` + `/final-q` close the session.
- Context files (read or already in working memory):
  - `~/.claude/plans/the-problem-ci-runs-clever-parnas.md` — the handoff
  - `clients/encore/tests/local-office/local-office-settings.spec.ts` — BAS spec
  - `clients/encore/tests/locations/location-local-information.spec.ts` — LI spec
  - `clients/encore/.github/workflows/playwright-tests.yml` — CI yml
  - `clients/encore/playwright.config.ci.ts` — workers logic (line 49-51, MAX_WORKERS env)
  - `clients/encore/src/fixtures/pages.fixture.ts:241-250` — fixture goto (probably-revert)
  - `.claude/rules/specs.md` — LR-018 (run-all is truth), LR-019 (baseline reset), LR-024 (clean before RCA)
  - `.claude/rules/angular.md` — LR-009 (restore-to-different-value), LR-026 (Angular dirty state unreliable)
  - `.claude/rules/pipeline.md` — LR-028 (activity-log row), LR-046 (strict plan lines)
- HALT-and-ask conditions: any test added to skip/fixme list, any commit attempted, any non-trivial spec edit (>5 lines), any cleanup that creates net-zero (LR-009).

---

## Phase 0 — Pre-flight (read-only, ~5 min)

1. Confirm PATCH 1+2 are present:
   ```
   git -C clients/encore diff --stat tests/local-office/local-office-settings.spec.ts tests/locations/location-local-information.spec.ts
   ```
   Expected: both files modified (working tree, NOT committed).
2. Confirm `clients/encore/src/fixtures/pages.fixture.ts` worker-startup change is present:
   ```
   git -C clients/encore diff src/fixtures/pages.fixture.ts | grep -c "await page.goto(config.base_url"
   ```
   Expected: ≥1 match. **NOTE — the in-file comment block at the new goto line states it fixes a real "not-stale path starts on about:blank → SELECTOR failures" regression. Phase 6 evaluates whether the fix is still load-bearing; do NOT revert in Phase 0.**
3. Clean stale artifacts before Phase 1 RCA per LR-024:
   ```
   rm -rf clients/encore/reports/test-results/* clients/encore/reports/allure-results/* clients/encore/reports/html-report/*
   ```
4. Take a `/regression-guard` snapshot (signatures of exports/imports/routes for the 3 modified files) so any unintended cross-cutting change in Phase 2 is caught.
5. Verify the CI workflow yml is at `clients/encore/.github/workflows/playwright-tests.yml` (NOT root `.github/`). Confirm current run line:
   `npx playwright test --config=playwright.config.ci.ts --project=encore-local-office --project=encore-locations` (no MAX_WORKERS env set).

**Acceptance**: clean reports/, three working-tree changes confirmed present, regression-guard pre-snapshot saved.

---

## Phase 1 — Reproduce: run each failing SPEC in isolation (Opus, ~30 min)

LR-018 step 2: run failing specs INDIVIDUALLY before any fix. The 3 failing specs from the 1w run:

- `tests/local-office/local-office-settings.spec.ts` (BAS — 19 fails in run-all)
- `tests/locations/location-management-history.spec.ts` (MGH — 9 fails in run-all)
- `tests/locations/location-pricing.spec.ts` (PRI — 7 fails in run-all)

Run each spec as its own process at `--workers=1`, in parallel (3 background bashes), each with `--no-deps` after a single shared setup run. Outputs to `clients/encore/reports/_bas-only-2026-05-08.txt` etc. Build the reproduction matrix:

| Spec | 1w run-all fails | Isolated workers=1 fails | Verdict |
|---|---|---|---|
| BAS | 19 | TBD | Equal → in-spec contamination only (no cross-spec). Lower → cross-spec contamination with another spec (likely LI Save). Higher → in-test bugs surface in isolation too. |
| MGH | 9 | TBD | Equal → in-spec or stable failure. Zero → cross-spec contamination (BAS save cycles mutate row[0]) — confirms G-4 hypothesis. |
| PRI | 7 | TBD | Same logic as MGH. |

If MGH-isolated == 0 fails, that PROVES the cross-spec history mutation hypothesis (G-4 trigger). If BAS-isolated == 19 fails, that PROVES the in-spec contamination is from earlier BAS tests (Layer 3). Then proceed to minimal-pair narrowing within BAS spec.

### Phase 1.5 — Minimal-pair narrowing for BAS late cluster (Opus, ~20 min)

ONLY if Phase 1 confirms BAS-isolated ≈ 19 fails. For each failing late test (BAS-025, 027, 028, 029, 030, 031, 032, 033, 034, 035, 036, 037, 038, 039, 040, 041, 044, 045, 047), run minimal-pair grep — DO NOT GUESS.

For each candidate corrupting test in BAS-002..BAS-024 (any `clickSaveAndConfirm`, `selectComboboxExact` after a `fillAndTab`, or `editSectionName`), run:

```
cd clients/encore && npx playwright test --config=playwright.config.ci.ts --project=encore-local-office --workers=1 --grep "TC-LOS-BAS-001|TC-LOS-BAS-XYZ|TC-LOS-BAS-025"
```

Where `XYZ` is the suspect predecessor. If BAS-025 fails in this triple but passes in `TC-LOS-BAS-001|TC-LOS-BAS-025` alone, XYZ is a contaminator.

Suspect list (highest-likelihood first, based on cleanup outside try/finally OR LR-009 net-zero risk):

- TC-LOS-BAS-023 — PO Number, cleanup `fillAndTab('txtPoNumber', '')` outside try/finally (`:325-340`)
- TC-LOS-BAS-024 — PO Number Label, same pattern (`:342-355`)
- TC-LOS-BAS-027 — Section name edit, cleanup outside try (`:378-384`)
- TC-LOS-BAS-022 — already has try/finally (template — confirm it works)
- Any other test in BAS-002..BAS-021 that mutates state and saves

**Output**: a table mapping each failing late test → the minimal earlier set required to reproduce. File: an RCA report (path does not resolve — file was never committed) (write a small markdown table; do not bloat).

**Acceptance**: every BAS-025..BAS-047 failure in the 1w list has a documented contaminator (or "passes individually with TC-001 only — needs LR-019 baseline strengthening").

---

## Phase 2 — Apply try/finally fixes to identified contaminators (Sonnet-safe, ~30 min)

For each contaminator identified in Phase 1, apply the BAS-022 template (`local-office-settings.spec.ts:306-322`):

- Wrap the mutating action + assertion in `try { ... }`.
- In `finally { ... }`, restore field to a value DIFFERENT from the just-saved value (LR-009). For text fields like `txtPoNumber`, if the test fills `PO_TEST_VALUES.number`, the cleanup `''` is fine ONLY IF the baseline (post BAS-001) is non-empty. If baseline IS already empty, change cleanup to a sentinel (e.g., `' '` then `''`) or simply call `reloadBasicInfo` to discard without saving.
- Cleanup MUST run regardless of try-block outcome.
- After the cleanup save, call `localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO)` so the next test starts from a fresh DOM (LR-026).

**No-no list (per user constraints)**:
- ZERO `test.skip` / `test.fixme` to mask failures.
- ZERO removal of assertions to "make it pass".
- ZERO dependencyGate edits unless an actual dependency is wrong.

**Verify each fix** with the same minimal-pair grep used in Phase 1 — the failing late test should now pass with the contaminator running first.

**HALT-and-ask** if a fix would touch >3 tests or >50 lines total. Surface to user; await direction.

**Acceptance**: every contaminator from Phase 1 has try/finally + correct restore semantics; minimal-pair tests pass.

---

## Phase 2.5 — Make save failures loud (NEW — addresses Layer 2 amplifier) (Sonnet-safe, ~20 min)

Read `clickSaveAndConfirm` page-object source (likely in `clients/encore/src/pages/local-office/...` or shared base-page). Verify whether 500/network errors during save are propagated or swallowed.

If swallowed:
- Update the wrapper to throw on save failure (500, network error, save button never disabled within timeout).
- Re-run BAS spec in isolation. ACC-019..028 / BAS-022 / LI-025 / NTS-001 should now report the actual save failure as the assertion error, not a downstream "wrong value" error.

This addresses G-2 directly. Without it, Phase 3 (workers=2 pin) is masking failures whose mechanism is still hidden.

**Acceptance**: `clickSaveAndConfirm` (and any equivalent wrapper) propagates save failures. New error messages cite the actual 500/network-error trigger, not a downstream value mismatch.

**HALT-and-ask** if the wrapper change would touch >3 callers or change a public contract used outside Encore client.

---

## Phase 3 — Pin MAX_WORKERS=2 in CI workflow as MITIGATION (Sonnet-safe, ~5 min)

NOTE: this is NOT a root-cause fix. It reduces the rate at which Layer 1 (server 500 under concurrent save) fires. The actual root-cause fix is whatever Encore needs to do server-side (or our test architecture needs at G-7 level). This phase is the *empirical mitigation* — accept it as such, document it as such.

Edit `clients/encore/.github/workflows/playwright-tests.yml`:

```yaml
env:
  NAVIGATOR_USERNAME: ${{ secrets.NAVIGATOR_USERNAME }}
  NAVIGATOR_PASSWORD: ${{ secrets.NAVIGATOR_PASSWORD }}
  BASE_URL: ${{ secrets.BASE_URL }}
  CI_ENV: e2e
  MAX_WORKERS: 2          # ← MITIGATION: reduces Layer 1 trigger rate (server 500 on /update-properties under concurrent save). Real fix at framework G-7 (per-worker data isolation). See PLAN_ENCORE_CI_2W_GREEN.md.
```

Update the file's leading comment block to reflect this is mitigation:

> "Worker count pinned to 2 as MITIGATION (not fix) for server-500-under-concurrent-save trigger documented in PLAN_ENCORE_CI_2W_GREEN.md (2026-05-08). Lower workers = lower trigger rate. True fix requires either (a) per-worker office isolation OR (b) Encore server-side concurrency hardening on /update-properties. Until then, 2 workers + Phase 2.5 loud-save error propagation is the verified sweet spot."

**Acceptance**: `MAX_WORKERS: 2` line lands in the env block; comment updated to reflect mitigation framing; no other yml fields change.

---

## Phase 4 — Full-suite verification at 2 workers (~35 min)

Clean artifacts (LR-024) again. Run:

```
cd clients/encore && MAX_WORKERS=2 npx playwright test --config=playwright.config.ci.ts --project=encore-local-office --project=encore-locations
```

Read `reports/test-results.json` (or the agent-reporter `failure-summary.json` if generated) for the final failure count. Compare against:
- Pre-fix baseline: 28 fails at 2w (per handoff).
- Target: ≤5 fails.

If fail count > 5: run a second full 2w run (LR-024 corollary) to confirm determinism, then re-enter Phase 1 for any new contaminator pattern not caught the first round. HARD CAP: 2 RCA→fix→verify cycles. If still > 5, HALT and surface the residual to the user.

**Acceptance**: 2-consecutive 2w runs at ≤5 fails, with the same fail set both runs (deterministic).

---

## Phase 5 — Investigate LI cluster at 2w (Opus, optional, ~30 min)

Only proceed if Phase 4 surfaces LI-021/029, 026, 045, 067, 068, 069, or SKIP-BILLING in the residual fail set. Same minimal-pair RCA pattern as Phase 1, but within `location-local-information.spec.ts`. Apply Phase-2-style fixes if in-spec contamination; HALT-and-ask the user if findings point to cross-worker race (`encore-local-office` worker writing same office state as `encore-locations` worker) — that's a different fix class than RC-B in-spec.

**Acceptance**: LI cluster either fixed (≤1 LI fail in next verification run) or escalated to user with documented evidence.

---

## Phase 6 — Evaluate fixtures.ts worker-startup goto (~10 min)

The change moves a `page.goto(base_url) + Dashboard wait` from inside an `if (stale)` branch to unconditional, with an inline comment explaining it fixes a "not-stale path starts on about:blank → SELECTOR failures" regression. Verify whether this is still needed AFTER Phases 2-4 land:

1. Snapshot current 2w fail set from Phase 4.
2. Stash just the fixtures.ts hunk: `git -C clients/encore stash push src/fixtures/pages.fixture.ts -m "phase6-fixtures-stash"`.
3. Re-run the same 2w command (clean reports first per LR-024). Compare fail count + which tests failed.
4. Two outcomes:
   - **Same or fewer fails** → the unconditional goto is no-op tax for current state; keep stash dropped (don't pop). Update the inline comment in the original codepath if needed.
   - **More fails, especially SELECTOR-class failures on test-1 of any spec** → goto WAS load-bearing. Pop the stash to restore: `git -C clients/encore stash pop`. Document the SELECTOR failures for future reference.
5. `/regression-guard` snapshots before+after this measurement.

**Acceptance**: documented decision (keep / revert) with both runs' fail counts + per-test diff; fixtures.ts in its final state; stash either dropped or popped (no orphan stash).

---

## Phase 7 — Close out (LR-027, LR-028)

1. Append activity-log row to `clients/encore/specs_planning/_internal/agent-activity-log.md`:
   ```
   | 2026-05-07Thh:mm | OWNER | done | clients/encore/.github/workflows/playwright-tests.yml, clients/encore/tests/local-office/local-office-settings.spec.ts, clients/encore/src/fixtures/pages.fixture.ts (per Phase 6 outcome) | PLAN_ENCORE_CI_2W_GREEN: pinned MAX_WORKERS=2; added try/finally to N BAS contaminators; 2w verified at ≤5 fails. |
   ```
2. Update plan: flip Status field to DONE, add Executed YYYY-MM-DD, write Execution Summary section (per LR-027).
3. `git mv plans/pending/PLAN_ENCORE_CI_2W_GREEN.md plans/done/`.
4. `npm run plans:reindex`.
5. Hand-off to user (chat-only, per `feedback_handoff_in_chat_only.md`): two-run verification numbers, fail diff, the JBS colleague needs to manually push the deliverable to `https://github.com/RutviK-JBS/encore_deliverables_test` (per Step D of the handoff).

**Acceptance**: plan in `done/`, INDEX regen-ed, activity-log row visible.

---

## Guidelines (G-1..G-7) — paste into framework rules after this plan lands

These 7 rules, if filed into `.claude/rules/*.md` and `docs/read_only_docs/LEARNED_RULES.md`, would have prevented every category of failure diagnosed in this RCA. They cover triggers (G-1, G-6, G-7), amplifiers (G-2, G-5), and structural prevention (G-3, G-4).

### G-1 — Artifact-first RCA, ALWAYS. No theory before evidence.
**Rule.** Before forming any hypothesis about a failure: open the failure-summary JSON, read the per-test row in full (`networkFailures[].url`, `consoleErrors[].text`, `urlBreadcrumbs`), open at least one error-context.md, read the failing assertion's source. THEN form a hypothesis. Story-shaped framings ("env saturation", "Encore servers", "concurrency") without a quoted artifact line as backing = REJECTED.
**Why.** This very session's first agent called the failure "ERR_ABORTED env saturation" while a 500 on `/update-properties` was sitting in the same JSON object. Stories outrun evidence in agent sessions; the only fix is structural.
**Trigger.** Every `/rca`, every spec-fixing session, every "what's failing" inquiry.

### G-2 — Wrappers may not narrow return types that carry failure information.
**Rule.** If method A returns `{ success: boolean; error?: string }`, no public wrapper of A may declare `Promise<void>` or otherwise discard the result. Either propagate the result, or throw on `success: false`. ESLint rule + framework convention.
**Why.** `clickSaveAndConfirm` discarded `clickSaveWithDialog`'s `{success, networkError}`. Save 500s became silent and surfaced as "wrong saved value" assertion failures three lines later. This pattern hides every Layer-1-trigger failure in the suite.
**Trigger.** Every page-object method authored / reviewed. Audit existing wrappers monthly.

### G-3 — Baseline reset must enumerate, not approximate.
**Rule.** The first test of any spec (LR-019) must reset state by ENUMERATING every field the spec mutates, including indirect server-side mutations (sections added, rooms added, custom names). Adding a new mutating test in the spec is incomplete until BAS-001's reset list is extended to cover it. Pre-commit hook: any new `clickSaveAndConfirm` in a spec triggers a check that the spec's first test references the affected fields/keys.
**Why.** PATCH 1 reset dates/order-type/checkboxes/phone/PO but not sections. BAS-028 (which adds "Test Section") is in the same spec; its mutation isn't in the baseline. Result: "Test Section" persisted on office 1604's server for unknown duration.
**Trigger.** Every new mutating test, every new spec.

### G-4 — Tests must not assert hardcoded values for fields they cannot guarantee aren't mutated.
**Rule.** If field X can be modified by any test in the suite (including in other specs / projects), assertions on X read either (a) the live value via API call, or (b) shape / non-empty / type. NOT a hardcoded literal. Author comments admitting drift ("Country is mutable via other specs' Save cycles") count as acknowledging the rule and must apply it to the WHOLE row, not one cell.
**Why.** MGH-008 hardcodes Phone, Name, etc. — all mutable. The author warned about Country specifically and ignored the same risk for the rest. ROW_1_EXPECTED is a footgun.
**Trigger.** Every assertion on a row from a multi-write history/audit table.

### G-5 — Save-and-verify pattern requires try/finally with restore-to-different-value.
**Rule.** Any test that calls `clickSaveAndConfirm` (or equivalent) followed by an assertion must wrap save+assert in `try`, with `finally` containing a restore that satisfies LR-009 (restore value ≠ just-saved value). No exceptions. If cleanup-by-reload is sufficient (UI-only mutation, no save), the spec marks the test `// no-save-cleanup` so the linter knows to skip the finally requirement.
**Why.** Without this, when ANY assertion in the test throws (including timing flakes), the cleanup is skipped → next-run pollution → G-3 kicks in to compensate, but G-3 isn't perfect, and you're back to BAS-025.
**Trigger.** Every test that saves user input.

### G-6 — Parallelism budget is a contract; tests that fail only above the budget are blocked from running above it.
**Rule.** The suite declares a maximum worker count (`MAX_WORKERS`). Any test that passes at workers≤N and fails at workers>N is filed as concurrency-sensitive and tagged. CI runs at the declared N. Tests are NOT promoted above N until redesigned to be data-isolated.
**Why.** ACC-019..028 fail at 4 workers because 4 browsers all write office 1604's properties simultaneously and the backend 500s. Pretending this is a server problem is dishonest; the test architecture is the problem (shared mutable resource + parallelism). Fix at the architecture, not by lowering globally and forgetting.
**Trigger.** Any test failure that disappears at lower worker count.

### G-7 — Shared mutable resources must be data-isolated OR explicitly serialized.
**Rule.** For a real-environment E2E suite, choose one: (a) per-worker scope (worker N writes office 1604+N), (b) test-level lock on the shared record, (c) strict serialization. The current "all 309 tests touch office 1604" model violates this. Refactoring is non-trivial — but rule applies forward: NEW tests must not assume sole ownership of a shared record they don't have.
**Why.** Most of Layer 1, all of Layer 3, and the cross-spec MGH/PRI failures trace back to one fact: every spec writes to office 1604, no test owns it, no test cleans up perfectly, no two parallel writers can coexist. This is the meta-cause.
**Trigger.** Every new test. Quarterly architecture review.

---

## Acceptance Criteria (Master)

- [ ] Phase 1: 3 isolated-spec runs complete (BAS / MGH / PRI at workers=1 each, parallel processes); reproduction matrix populated with isolated-fail counts.
- [ ] Phase 1.5: minimal-pair narrowing for BAS late cluster contaminators (only if Phase 1 confirms ~19 isolated fails); contamination map saved at an RCA report (path does not resolve — file was never committed).
- [ ] Phase 2: every identified contaminator has try/finally + LR-009-correct cleanup; minimal-pair tests pass.
- [ ] Phase 2.5: `clickSaveAndConfirm` propagates save failures (Layer 2 amplifier removed); error messages cite real trigger not downstream value mismatch.
- [ ] Phase 3: `MAX_WORKERS: 2` lives in `clients/encore/.github/workflows/playwright-tests.yml`, with mitigation framing in the comment block.
- [ ] Phase 4: 2-consecutive 2w full-suite runs at ≤5 fails, deterministic.
- [ ] Phase 5: LI cluster + MGH/PRI hardcoded-mutable-value cluster fixed or escalated to user.
- [ ] Phase 6: fixtures.ts worker-startup goto final state recorded with measurement.
- [ ] Phase 7: activity-log row + plan moved to done/.
- [ ] ZERO `test.skip` or `test.fixme` added.
- [ ] ZERO commits made without user approval.
- [ ] Guidelines G-1..G-7 filed into framework rules (`.claude/rules/*.md` + `docs/read_only_docs/LEARNED_RULES.md`) as LR-051..057 OR equivalent numbering.

---

## Verification Artifact

Run after Phase 4 to confirm. Expected: ≤5 fails, deterministic across 2 runs.

```
cd clients/encore && \
  rm -rf reports/test-results/* reports/allure-results/* reports/html-report/* && \
  MAX_WORKERS=2 npx playwright test \
    --config=playwright.config.ci.ts \
    --project=encore-local-office \
    --project=encore-locations 2>&1 | tee reports/_2w-postfix-2026-05-07-run1.txt && \
  rm -rf reports/test-results/* && \
  MAX_WORKERS=2 npx playwright test \
    --config=playwright.config.ci.ts \
    --project=encore-local-office \
    --project=encore-locations 2>&1 | tee reports/_2w-postfix-2026-05-07-run2.txt
```

Expected output line at end of each tee'd file:
```
N passed (Xm) where N >= 304 (309 - 5 fails); 0-5 failed; 0-2 flaky; 17-33 skipped
```

If both runs are ≤5 fails AND the same tests fail in both → plan is closeable.
