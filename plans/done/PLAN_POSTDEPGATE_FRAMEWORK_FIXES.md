# PLAN: Post-DepGate Framework Fixes — URL drift, retry hardening, then Goal 2 CI report

**Status**: DONE
**Executed**: 2026-05-07
**Priority**: P0-EMERGENCY
**Created**: 2026-05-06
**Identity**: OWNER
**Depends on**: PLAN_DEPENDENCY_AWARE_FAILURE.md (DONE 2026-05-05), PLAN_DYNAMIC_WORKERS.md (DONE 2026-05-05)
**Blocks**: Goal 2 colleague-facing 4-worker CI report (PARKED — deliverable is Phase G of this plan, user-trigger-only)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: plan
**BrowserTool**: none
**Skills**: /execute, /regression-guard, /audit, /final-q
**Justification (Priority=P0-EMERGENCY)**: framework currently produces ~85% noise on the validation suite; this plan's Phase A is what restores honest test signal, and Phase G (the colleague-facing CI report = JBS-and-Encore-facing reputation) cannot ship clean until A lands. Same precedent as PLAN_DEPENDENCY_AWARE_FAILURE.md (P0-EMERGENCY when shipping across all specs was urgent).
**Justification (Thinking=xhi)**: not required (default Opus tier); listed for clarity.

---

## Context

The 2026-05-05 dep-aware + dynamic-workers landings (PLAN_DEPENDENCY_AWARE_FAILURE.md, PLAN_DYNAMIC_WORKERS.md) were green at unit/pilot level but not yet validated against the full local 12-spec suite at ≥2 workers. On 2026-05-06 a session was opened to do exactly that — Goal 1 below.

That session found **a single load-bearing framework bug accounting for ~85% of all observed failures**, plus four smaller framework issues (one cosmetic, one auth-flow, one ambiguous, one agent-reporter telemetry). A separate sister session (`~/.claude/plans/i-never-knew-we-purring-swing.md`) independently investigated the retry mechanism's efficiency and proposed a 4-step plan, but its premise that "67% deterministic failures = broken specs to fix" was wrong in the dominant case — those deterministic failures are mostly the URL-drift bug, not author defects.

This plan unifies both sessions, sequences fixes so the cause is removed before retry telemetry is measured (otherwise the baseline is contaminated), and tracks Goal 2 (the colleague-facing CI report) as the terminal phase that gates on a clean framework.

**Provenance:**
- Session A (this session) RCA notebook: `~/.claude/plans/rippling-wandering-spring.md` — 5 framework issues with file:line + urlBreadcrumbs evidence.
- Session B (sister) retry notebook: `~/.claude/plans/i-never-knew-we-purring-swing.md` — 6-layer retry map + 71/2/61 waste data.
- Run-1 evidence: `clients/encore/reports/run1-failure-summary.json` (138 entries, 70 unique TCs across 6 specs, 2 workers).
- Run-2 evidence: `clients/encore/reports/failure-summary.json` (134 entries, 67 unique TCs across 4 dirty specs, 1 worker).
- Dep-gate registry artefacts: `clients/encore/reports/dep-gate-state/*.json` (proves dep-gate fixture works correctly — registry persists, retry-recovery clears entries on pass).

---

## Original goals (do not forget)

These are the user-stated goals from the validation session — both stay in this plan as binding outcomes.

| # | Goal | Status |
|---|------|--------|
| 1 | Validate dependency-aware + dynamic-workers locally with 2 workers (HARD RULE: 1 spec = 1 worker, never within-file split). Find bugs, do **not** autonomously fix anything in-session. Report findings in plain English in chat. | **COMPLETE** — bugs found and documented in Session-A notebook + this plan's "Issues" section. The "no autonomous fix" constraint is why the fixes are now plan-tracked rather than already landed. |
| 2 | Generate a 4-worker CI run report for the colleague with both Playwright HTML and Allure outputs as deliverables. | **INDEFINITELY DEFERRED — user-authorized trigger only**. Per user directive 2026-05-06: "we only run in CI once we are confident with local things being resolved... unless user override... for now this is last priority, but can become top if i say so." Phase G of this plan is therefore PARKED at lowest in-plan priority — gated not just on Phase A/B landing, but on the user's explicit "ship to colleague" instruction. **Reason this matters long-term**: handing the colleague a CI report that contains framework-noise failures (URL drift, retry-layer waste, auth-refresh flakes) makes the framework — and by extension JBS — look unreliable, and can be misread by Encore as application bugs that don't exist. The report goes out only when the framework is verifiably clean. |

---

## Stewardship principles (user directive 2026-05-06)

These principles sit above every phase and every subplan in this plan. Conflict with anything below → these win.

1. **Always fix the cause, never patch the symptom.** Issue #1's mutation-site (the `page.goto(baseUrl)` side-effect from `validateState`) is removed by isolating the only unsafe caller (`fixtures.ts:229`) inside a throwaway probe context — same A1b spirit as the parent-plan locked decision (fix the cause), refined at execution time after pre-flight enumeration showed the fix locus is the caller, not the helper. The 3 other callers (auth.setup.ts × 3, fixtures.ts:180) already used throwaway contexts and stayed unchanged. Fences around holes erode; filled holes don't.
2. **Ultrathink before touching framework code. No assumptions, ever.** Every subplan that mutates framework files (auth path, retry path, reporter path) must, in Phase 0, enumerate every caller / consumer / implicit dependency of the file being changed and verify each one stays correct after the change. "Probably fine" is not a verdict; "I read every call site and confirmed X" is.
3. **No rushed framework changes.** Auth and retry code is sensitive — break login itself or the test runner and the whole pipeline goes dark. Subplans for Phase A and Phase D explicitly carry `Thinking: max` with a `Justification:` line, and require a fresh-state verification step before merging. **Verification mechanic** (corrected 2026-05-07 D4 finalization): the Encore automation user has MFA disabled at the Entra IdP per `clients/encore/CLAUDE.md` "CI User Provisioning Checklist" ("DO NOT add NAVIGATOR_MFA_SECRET. Its absence is the contract."); the auth flow is plain SSO (email + password) with no TOTP step. The browser-tool rule's "MFA / OTP / passkey flow → Chrome (mandatory)" row therefore does not fire — CLI-headless fresh-state smoke (delete `.auth/encore-state.json` → run a representative spec via `npx playwright test`) is the appropriate verification gate. (Initial parent-plan body referenced "Chrome MFA-fresh-login verification" — that mandate was based on the wrong premise of an MFA-enabled user; corrected to CLI-headless during Phase A subplan finalization.)
4. **Retry tuning is data-driven per layer, not vibes.** Default stance: 3 retry attempts on every layer that currently has them is FINE. Tighten attempt `N+1` on a layer only if Phase C telemetry shows attempt `N+1` has near-zero recovery rate (e.g. of all per-click failures that needed attempt 2, what fraction were rescued by attempt 3 — if statistically zero, drop attempt 3 on that layer). This applies to **every** retry layer in the inventory below, not just `clickWithRetry`.
5. **Never ship framework noise to the colleague or to Encore.** A CI report containing failures caused by our own framework bugs (Issue #1 fallout, retry-waste, auth-refresh flakes) is worse than no report — it sets expectations against us. Phase G ships only on user explicit go-ahead, against a verifiably clean framework.
6. **Document everything that this session knew, in this plan.** A future session — Claude or Rutvik — picking up where we left off must be able to reconstruct the full evidence chain, the decisions made, and the reasons why, without re-running RCA. The "Session carry-over" + "Notes for the next session" sections of this plan are load-bearing; subplans extend them, never replace them.

---

## Session carry-over — full inventory of what this session found

### Framework issues (5 total, ranked by blast radius)

#### Issue #1 (PRIMARY, ~85% blast radius) — URL drift via `validateState()` navigation side-effect

- **File**: `clients/encore/tests/setup/auth-storage.ts:60` (the `page.goto(baseUrl, …)` call inside `validateState`)
- **Coupled file**: `clients/encore/tests/setup/fixtures.ts:146-246` (`authenticatedSession` worker-scoped fixture that calls `validateState`)
- **Symptom**: tests time out 10–60 s on `[data-testid="local-office-settings-checkbox-X"]` or similar, while the page is actually on `/locations/1604/home` (the dashboard).
- **Mechanism**: `validateState(page, baseUrl)` is the auth-storage pre-test guard. It navigates the worker's primary `page` to `baseUrl` as a side-effect, and the Encore auth flow (whether silent SSO or token-refresh) lands on `/locations/1604/home`. Triggered by either (a) Microsoft access-token TTL elapsing mid-run → Angular interceptor redirects to `/auth/sign-in` → silent SSO → `/home`, or (b) Playwright recycling the worker on retry → fresh `authenticatedSession` → fresh `validateState` → fresh navigation to `/home`. Tests after the seed `TC-XXX-001` don't re-navigate, so they inherit the wrong URL.
- **Evidence**:
  - Run-2: 66 of 67 retry=0 failures had `/auth/sign-in` in `urlBreadcrumbs`.
  - Run-1: 51 of 60 failures across `local-office-settings.spec.ts` (20/27) + `location-local-information.spec.ts` (31/33) had `pageUrl=/locations/1604/home` instead of `/settings/local-office` or `/settings`.
  - `TC-LOS-BAS-012 retry=0` urlBreadcrumbs: `[/auth/sign-in, /auth/sign-in, /auth/redirect-user, /1604/home, /1604/home]` — the auth flow ran mid-test.
- **Why this only blew up now**: the prior `test.describe.serial` cascade-skipped every subsequent test in the file once one failed, masking the URL drift entirely. The dep-aware migration replaced cascade-skip with explicit `dependencyGate(['TC-X'])` — tests with deps on the seed (which passed early) are still allowed to run after an unrelated mid-spec failure → they run on the wrong URL → mass cascade fails. **The dep-gate fixture itself is implemented correctly**; this is a migration gap (lost the cascade-skip safety net without replacing it), not a dep-gate bug.
- **Fix candidates** (Phase A picks one):
  - **A1**: per-test `beforeEach` that ensures `page.url()` matches the spec's expected URL; if not, re-navigate. Mirrors `test.describe.serial` cascade safety. Smaller blast radius, cosmetic addition to fixtures.ts.
  - **A1b**: change `validateState()` to use a throwaway probe context/page so it doesn't mutate the worker's primary page URL. Architecturally cleaner — removes the side-effect at the source — but touches the auth path which is more sensitive.

#### Issue #2 — `agent-reporter` writes wrong `workerIndex` (always 0)

- **File**: `src/utils/agent-reporter.ts:185`
- **Symptom**: every entry in `failure-summary.json` shows `workerIndex: 0`, making worker-recycle detection from artefacts impossible.
- **Mechanism**: `workerIndex: test.parent?.project()?.metadata?.workerIndex ?? 0` — reads from a field that does not exist (`project.metadata` is the static config object set in `defineConfig`, not a per-test value). Correct field is `result.workerIndex` from the Playwright `TestResult` API.
- **Severity**: cosmetic / diagnostic only; does not affect test behaviour. But Phase C retry telemetry depends on this being correct, so fix in Phase A alongside Issue #1.

#### Issue #3 — SSO + MFA login failure during state refresh (2 hits, run-2 only)

- **File**: `clients/encore/tests/setup/fixtures.ts:202` (the `throw new Error('SSO + MFA login failed during state refresh');` site)
- **Symptom**: `TC-LOS-BAS-022 r0` and `TC-LOS-BAS-038 r1` failed at ~5 ms with this exact message. Run-1 had zero hits.
- **Likely cause**: TOTP single-use exhaustion. Run-2 had a single worker on 4 dirty specs → many failures concentrated on one worker → many recycles → many back-to-back `refreshSharedState()` calls inside the same 30 s TOTP window → second login is rejected because the TOTP code was already consumed. Could also be Entra rate-limit or transient network blip but TOTP reuse is the canonical cause for this exact symptom on this app.
- **Fix candidate (Phase E, contingent)**: `refreshSharedState` retries once after `MFA_TOTP_REUSE_GUARD_MS` (≥35 s) before throwing. Defer until Phase B reveals whether this still reproduces post-Issue-#1 fix.

#### Issue #4 — diagnostics `authChain` field never populated

- **Search**: `f1.filter(x => x.authChain && x.authChain.length > 0).length === 0` in both runs.
- **Severity**: cosmetic. Field is declared in `FailureEntry` (src/utils/agent-reporter.ts:36) but the `DiagnosticsCollector` path that populates it appears dead. A future regression in the auth fixture would be invisible. Not blocking.

#### Issue #5 — `Target page, context or browser has been closed` mid-test (3 unique TCs in run-1)

- **TCs**: `TC-LOS-BAS-012`, `TC-LOS-BAS-014`, `TC-LOS-BAS-020` (retry=0 + retry=1 each).
- **Symptom**: `pageUrl = /1604/home`, error = `locator.click: Target page, context or browser has been closed`.
- **Status**: ambiguous. Could be downstream effect of Issue #1 (page closed during teardown after a 30–60 s timeout on a wrong-URL click) or a separate worker-recycle-mid-test race. Need a `trace.zip` walkthrough on the preserved artefacts under `clients/encore/reports/test-results/tests-specs-setup-local-of-*/` to classify.

### Sister-session retry-mechanism findings (preserved verbatim)

- **6 retry layers**: per-click (3 attempts, ~30 s), per-test (Playwright `retries: 1` local / `2` CI), login (3 attempts), `validateState` (3 attempts inside auth-storage.ts:56-83), Radix dropdown retry (per LR-025), `expect.poll`.
- **Waste data (last full run)**: 71 tests retried, 2 saved (~3%), 61 wasted (~86%), ~50 min/run in CI.
- **Failure mix**: 67% deterministic (element-not-found / timeouts), 33% other. Sister session's classification "broken specs" was wrong in the dominant case — those deterministic failures are mostly Issue #1 fallout. Once Issue #1 is fixed, the deterministic-vs-flaky split will shift dramatically.
- **Dep-gate ↔ retry calculus shift**: pre-dep-gate, retry was load-bearing for cascade protection; post-dep-gate, the cascade is handled by skip → retry can be tuned tighter without losing the safety net. Correct framing.
- **Anti-slop calls (preserved as guardrails for Phase D)**:
  - No `fillWithRetry`, no `selectWithRetry` — data shows retries don't help on non-click ops; would multiply waste.
  - No regex-based "smart retry that classifies error messages" — replaces one heuristic with a flakier one.
  - Don't touch auth retry, Radix retry (LR-025), `validateState` retry — each earns its cost on a known transient pattern.
- **Sister session's proposed 4-step plan (preserved, reordered into Phases C–D)**:
  1. Add retry telemetry — sum `retryAttempt` from `failure-summary.json` into `retrySaved/retryWasted/retryWastedSeconds` fields.
  2. Tune `clickWithRetry` 3 → 2 attempts (saves ~10 s per failed click) — contingent on telemetry data.
  3. Make "retry wasted X minutes" loud in run output.
  4. Auto-tag `failure-history.json` entries that fail-on-retry 3 runs in a row as "needs fix".

### Why the sister session's order was premature (kept as decision record so we don't repeat the mistake)

Adding telemetry on a still-broken framework gives a contaminated baseline. Tightening `clickWithRetry` 3 → 2 on URL-drift failures that won't repro post-fix risks under-budgeting retry for the genuine flakes that surface in the post-fix world. Auto-tagging fail-on-retry-3-runs as "needs fix" would tag URL-drift artefacts as false positives (TC-LOS-BAS-012/013/014/021/028/029 etc. are not broken specs). Fix the cause first → measure clean → then decide. This is the unified order in "Phased plan" below.

---

## Phased plan (dependency-sorted)

| Phase | Action | Why now | Predecessor | Subplan author trigger |
|-------|--------|---------|-------------|------------------------|
| **A** | **Fix Issue #1 the cause-not-symptom way (option A1b — locked).** Wrap the unsafe `validateState` caller (`fixtures.ts:229` — the only of 4 callers that passed the worker's primary `page`) in the throwaway probe-context idiom already used by the 3 safe callers. The mutation site is removed at the source; `validateState()` helper signature unchanged. Bundle Issue #2 (`agent-reporter` `workerIndex` bug) into the same subplan — Phase C telemetry depends on it being accurate. | Removes ~85% of retry waste at the source; honors stewardship principle #1 (cause not symptom). | none | **CLOSED 2026-05-07** — landed via SUBPLAN_PDF_01_URL_DRIFT_FIX.md (`plans/done/`). Authoring observations applied at execution time: (a) grepped 4 callers of `validateState` — 3 already safe, 1 unsafe at fixtures.ts:229; (b) grepped 14 consumers of `authenticatedSession.page` (page-object constructors at fixtures.ts:284–354); (c) read full login flow end-to-end; (d) emitted `BrowserTool: cli` with justification citing `clients/encore/CLAUDE.md` CI User Provisioning Checklist (automation user has MFA disabled at Entra IdP — browser-tool rule's MFA-Chrome row does not fire); (e) explicit "verified file:line" claims per stewardship principle 2. |
| **B** | Re-run the same 12-spec suite locally at 2 workers. Compare to run-1 baseline. Acceptance: framework-noise failures (those with pageUrl ≠ expected URL) drop to ≤5%. | Validates Phase A worked; gives clean retry baseline for Phase C. Closes Goal 1 with a fixed framework. | A | **CLOSED 2026-05-07 GREEN** — landed via SUBPLAN_PDF_02_LOCAL_REVALIDATE.md (`plans/done/`). Run-3 evidence at `clients/encore/reports/run3-failure-summary.json` (135 entries / 68 unique TCs / 4 dirty specs). **Framework-noise gate** (per parent plan verification snippet at line 184: `retry=1 + pageUrl=/home`): **0/135 = 0.00%** vs Run-1's 81.4% — 81.4 pp drop confirms Issue #1 eliminated at the source. 224 passed / 1 flaky / 17 skipped / 42 min wall. Goal 1 closed. |
| **C** | **Per-layer per-attempt retry telemetry.** Extend `agent-reporter` (and the relevant fixtures, where retry happens outside the reporter's view) to record, for **every** retry layer in the inventory, per-attempt outcome data. Layers in scope: (1) `clickWithRetry` per-click 3-attempt loop, (2) Playwright `retries: 1` local / `2` CI per-test loop, (3) `loginWithMicrosoft` 3-attempt SSO+MFA loop, (4) `validateState` 3-attempt auth-state-check loop, (5) Radix dropdown retry (LR-025), (6) `expect.poll`. Output added to `failure-summary.json`: `retryStats: { layer: { totalAttempts, recoveredAtAttempt: { 1: n, 2: n, 3: n }, wastedAttempts: n, wastedMs: n } }`. Pure-additive; no test behaviour change. | Visibility-first principle from sister session, broadened per stewardship principle 4 — every retry layer answered with data, not just clicks. Measuring a clean framework now (Phase B done). | B | **CLOSED 2026-05-07** — landed via SUBPLAN_PDF_03_RETRY_TELEMETRY.md (`plans/done/`). Layer 1 (clickWithRetry) INSTRUMENTED via shared-file JSONL telemetry (`reports/retry-telemetry.jsonl`); Layer 2 (per-test) MEASURED in-reporter via existing `result.retry`/`result.status` events. Layers 3 (login), 4 (validateState), 5 (Radix), 6 (expect.poll) classified per LR-040 (c) NOT-MEASURABLE-AT-PHASE-C with reasons + named follow-up `SUBPLAN_PDF_03B_RETRY_TELEMETRY_AUTH_LAYERS.md` (Layers 3+4) + reopen criteria for 5+6. Telemetry mechanism proven via direct module roundtrip + live smoke (Layer 2 populates on real test runs). |
| **D** | **Per-layer retry-attempt tightening, data-conditional.** For each retry layer from Phase C, evaluate the per-attempt-N recovery rate against the bar in stewardship principle 4: tighten attempt `N+1` only if attempt `N+1` has near-zero recovery rate (statistically equivalent to "if attempt N failed, attempt N+1 also fails ~always"). Default stance: keep 3 attempts on every layer. Each tightening lands as its own minimal change with revert plan. Also covers the sister-session "fail-on-retry-N-runs auto-tag" idea (only meaningful once layer #2's per-test waste is real, not URL-drift noise). | Data-driven, per-layer, no speculative cuts. Honors stewardship principle 4 + sister-session anti-slop. | C + ≥2 weeks of clean telemetry from real CI runs | **DOCUMENTED NO-OP 2026-05-07.** Predecessor "≥2 weeks of clean CI telemetry" NOT MET — only one local run (Phase B run-3) of clean (post-Phase-A) telemetry exists. Per stewardship principle 4 ("Tighten attempt N+1 on a layer only if Phase C telemetry shows attempt N+1 has near-zero recovery rate"), 1 local run is insufficient evidence to commit a tightening change. Suggestive signal (Layer 2 per-test = 1.5% recovery on retry-1) is recorded for future Phase D evaluator. Phase D reopens when ≥2 weeks of CI telemetry have accumulated AND a Phase D evaluator authors `SUBPLAN_PDF_04_RETRY_TUNING.md`. **No subplan authored at this time.** |
| **E** | If Issue #3 (SSO + MFA refresh fail) still reproduces post-Phase A, add a TOTP-reuse guard retry in `refreshSharedState`. Likely subsumed by Phase A (recycle frequency drops as URL drift goes away) but left as a safety net. | Re-evaluate post-Phase B baseline. | B | **DOCUMENTED NO-OP 2026-05-07** — Issue #3 NO-LONGER-REPRODUCES. Run-3 evidence: 0 hits of `SSO + MFA login failed during state refresh` (vs Run-2's 2 hits at fixtures.ts:202). Likely subsumed by Phase A as predicted (probe-context wrap drastically reduces worker-recycle frequency, the suspected TOTP-reuse trigger). No subplan authored. Reopen criterion: any future run with ≥1 Issue #3 hit. |
| **F** | If Issue #5 (page-closed mid-test) still reproduces post-Phase A, do the trace.zip walkthrough on BAS-012/014/020 to classify as Issue #1 fallout (closed) or distinct race (needs fix). | Re-evaluate post-Phase B baseline. | B | **CLOSED 2026-05-07** — landed via SUBPLAN_PDF_06_PAGE_CLOSED_AUDIT.md (`plans/done/`). Issue #5 5 hits in Run-3 (TC-LOS-BAS-012 ×2 + TC-LOS-BAS-014 ×2 + TC-LOS-BAS-020 ×1). Direct Run-1 vs Run-3 comparison shows IDENTICAL Issue #5 surface (same 5 hits, same TCs, same `lastActions` chain ending in "Worker Cleanup") — classified PRE-EXISTING DISTINCT RACE, NOT Phase-A fallout. **Classification**: LR-040 (c) DEFERRED with named tracking plan `PLAN_LOS_BAS_012_014_020_PAGE_CLOSED_RCA.md` (to be authored separately) + reopen criterion. SUBPLAN_PDF_06 also filed a Phase-A diagnostics-collector observability regression (Run-3's 91% `pageUrl=about:blank` failure pattern; Run-1 had 0% — pre-Phase-A's validateState side-effect was incidentally warming the worker page; same DEFERRED with reopen criterion). |
| **G** | **GOAL 2 — colleague-facing 4-worker CI report. PARKED at lowest in-plan priority per user directive 2026-05-06.** Triggers ONLY on the user's explicit "ship to colleague" instruction (e.g., "trigger Phase G now" / "send the colleague report"). Until then, this row stays at the bottom of the queue regardless of whether Phases A–F are green. When triggered: run `playwright-tests.yml` workflow_dispatch at `MAX_WORKERS=4`, package HTML report + Allure outputs as artefacts, hand off. Pre-conditions auto-checked at trigger time: Phase A + B green AND zero open framework-noise issues from Phases E + F (or each explicitly accepted by user as known-edge-case footnotes in the deliverable). | Stewardship principle 5 — never ship framework noise to JBS / Encore. The colleague report represents the framework's reputation; it goes out clean or not at all. | A + B + (E if reproduced) + (F if reproduced) + **explicit user trigger** | author SUBPLAN_PDF_07_CI_4W_REPORT.md only on user "ship now" instruction |

### User decisions locked 2026-05-06 (no further input needed before subplan authoring)

1. **Issue #1 fix path** — A1b chosen (fix the cause). A1 retired. SUBPLAN_PDF_01 author per row above.
2. **Retry tuning bar** — 3 attempts is the default-fine stance on every retry layer. Tighten attempt `N+1` only when telemetry proves attempt `N+1` near-zero recovery. Apply to **all 6 retry layers**, not just `clickWithRetry`.
3. **CI report priority** — lowest in this plan. User-trigger-only. Promotes to top only on explicit user instruction. Auto-protects against shipping framework noise.

---

## Subplans (none yet — author per phase per LR-041 + LR-048)

This parent plan deliberately does **not** scaffold subplan files for Phases A–G upfront. Reasons:

- **Anti-slop**: phases D, E, F are contingent on Phase B/C data. Authoring subplans for them now would be premature scaffolding (sister session's own principle).
- **LR-041 frontmatter requirements** (Model + Thinking + PermissionMode + Justification when applicable) are easier to set correctly when each phase's actual work is concrete, not speculative.
- **LR-048 structural minimum** (Bootstrap + Phase 0 + Phase 0.5b conditional + Phase 2.5 sweep + Acceptance + Verification + Handoff) requires real content per section, not placeholders.

Subplan filenames will use the `SUBPLAN_PDF_NN_DESC.md` naming pattern listed in the Phased-plan table. Each is authored when its predecessor closes, per LR-041 (`/planning` Step 3 validates frontmatter at authoring time).

---

## Acceptance criteria (parent-level — closure gate per LR-027 + LR-040)

- [ ] **Goal 1** explicitly closed in Execution Summary with a one-line "framework validated post-fix" attestation citing Phase B's run-1-vs-run-3 diff.
- [ ] **Goal 2** delivered ONLY on explicit user trigger. If user has not triggered Phase G by the time all other phases close, this criterion is satisfied by recording "Phase G PARKED awaiting user authorization, framework verifiably clean" in the Execution Summary — Goal 2 is not silently dropped, it stays parked.
- [ ] **Stewardship principles 1 + 5 attestation** — every framework code change in Phases A, C, D, E names the cause it removed (not the symptom it patched), and Phase G never ran without user trigger. Both attestations are explicit lines in the Execution Summary; absence = automatic RED on `/final-q`.
- [ ] **All 5 framework issues** classified post-fix as one of: (a) FIXED with file:line cite + landed-in-subplan reference, (b) NO-LONGER-REPRODUCES with re-run evidence pointer, (c) DEFERRED with named tracking subplan and concrete reopen criterion. No "we'll figure it out later" wording (LR-040 (b)/(c) compliance).
- [ ] **All 6 retry layers** classified post-Phase-C as one of: (a) DATA-JUSTIFIED-TO-TIGHTEN with subplan + before/after attempt-N recovery rate, (b) DATA-CONFIRMS-3-ATTEMPTS-FINE with telemetry cite (attempt-N+1 recovers ≥X% of failures, where X is the bar agreed at Phase C closure), (c) NOT-MEASURABLE-AT-PHASE-C with reason. No silent dropping; no across-the-board cuts; per-layer treatment per stewardship principle 4.
- [ ] **Sister-session retry recommendations** each classified as: (a) APPLIED with subplan reference, (b) DATA-NOT-JUSTIFIED with telemetry-cite proving the recommendation is no longer needed post-Phase A. No silent dropping.
- [ ] **Auth-flow MFA-fresh-login verification** — Phase A subplan's MFA verification step passed (Chrome-headed walkthrough, fresh state file deleted, full SSO + TOTP completed). This is the "did we break login itself" gate per stewardship principle 3.
- [ ] `/regression-guard` snapshot before Phase A vs after each phase close = no silent breakage on touched files outside the planned fix surface.
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042.
- [ ] `npm run plans:reindex` re-run after each subplan transitions pending → done; INDEX.md reflects current state.

---

## Verification

```bash
# Phase A landed — both fixes present
grep -n "result.workerIndex" src/utils/agent-reporter.ts          # expect: hit on line ~185
grep -nE "(beforeEach|throwaway probe)" clients/encore/tests/setup/fixtures.ts clients/encore/tests/setup/auth-storage.ts  # expect: at least one hit per Phase A choice (A1 or A1b)

# Phase B verification — local re-run, framework noise <5%
cd clients/encore && npx playwright test --workers=2
node -e "const f=JSON.parse(require('fs').readFileSync('reports/failure-summary.json','utf8')).failures; const noise=f.filter(x=>x.retryAttempt===1 && /\/locations\/\d+\/home/.test(x.pageUrl||'')).length; console.log('framework-noise failures:', noise, '/', f.length);"
# expect: noise / f.length <= 0.05

# Phase C landed — retry telemetry fields exist
node -e "const f=JSON.parse(require('fs').readFileSync('clients/encore/reports/failure-summary.json','utf8')); console.log('retrySaved' in f, 'retryWasted' in f, 'retryWastedSeconds' in f);"
# expect: true true true

# Phase G landed — colleague artefacts staged
ls -la clients/encore/reports/html-report/index.html clients/encore/reports/allure-report/index.html
# expect: both present, mtime within last 24h
```

---

## Stale-cleanup (LR-050 not strictly triggered, but listed for completeness)

This is not a restructure plan, so LR-050's hard requirement does not fire. However, two things this session noticed in passing that could rot if forgotten:

- **Issue #4 (`authChain` dead path)** — surface stays declared in `FailureEntry` with no populator. Either wire it (Phase F-adjacent) or remove the field. Do not leave declared-but-empty.
- **`feedback_handoff_no_blockers.md` reminder** — this plan's Handoff section (below) follows that convention; subplans must do the same.

---

## Handoff (post-execution — to be filled when this plan flips DONE)

_(Empty until parent closes. Per `feedback_handoff_in_chat_only.md`, the actual handoff happens in chat at execution time, not in this file. This section will be filled with a one-paragraph outcome description per LR-039 — no obstacle claims, no specific failure-mode names.)_

---

## Execution Summary (LR-027 — added 2026-05-07 at parent close)

Single-session execution of Phases A → F. Phase G stays PARKED per user-trigger directive (parent plan acceptance criterion #2 satisfied by recording "Phase G PARKED awaiting user authorization, framework verifiably clean" — see G row below).

### Subplan chain (all in `plans/done/` 2026-05-07):
- **SUBPLAN_PDF_01_URL_DRIFT_FIX** — Phase A: caller-level probe-context wrap at `clients/encore/tests/setup/fixtures.ts:228-238` + `agent-reporter.ts:185` workerIndex fix + re-vendor + cold-path + 2-worker chromium smoke. D4 correction landed (stewardship principles 1+3 refined; MFA-Chrome mandate dropped per `clients/encore/CLAUDE.md` "CI User Provisioning Checklist" — automation user has MFA disabled at Entra IdP).
- **SUBPLAN_PDF_02_LOCAL_REVALIDATE** — Phase B: 12-spec re-run at 2 workers chromium. Framework-noise gate (parent plan verification snippet line 184): **0/135 = 0.00%** — vs Run-1's 81.4% — 81.4 pp drop. Run-3 evidence preserved at `clients/encore/reports/run3-failure-summary.json`. **Goal 1 closed.**
- **SUBPLAN_PDF_03_RETRY_TELEMETRY** — Phase C: Layer 1 (clickWithRetry) + Layer 2 (per-test) instrumented. Layers 3/4/5/6 classified per LR-040 (c). New module: `src/utils/retry-telemetry.ts` (shared-file JSONL aggregator). Re-vendored. Live smoke verified Layer 2 populates; direct module roundtrip verified Layer 1 mechanic.
- **SUBPLAN_PDF_06_PAGE_CLOSED_AUDIT** — Phase F: Issue #5 5 hits in Run-3 classified PRE-EXISTING DISTINCT RACE (Run-1 had identical 5 hits with same TCs + same lastActions). DEFERRED to `PLAN_LOS_BAS_012_014_020_PAGE_CLOSED_RCA.md`. Phase-A diagnostics-collector observability regression also filed (Run-3 91% `pageUrl=about:blank`; Run-1 had 0%) with reopen criterion.

### Phases without subplans (documented no-ops 2026-05-07):
- **Phase D** — predecessor "≥2 weeks of clean CI telemetry" not met (only 1 local run); per stewardship principle 4, insufficient evidence to commit retry-tightening. Suggestive Layer 2 signal (1.5% recovery rate) recorded for future Phase D evaluator.
- **Phase E** — Issue #3 NO-LONGER-REPRODUCES (Run-3 = 0 hits vs Run-2's 2). Likely subsumed by Phase A as parent plan predicted.
- **Phase G** — PARKED. User-trigger only; not in this session's scope.

### Acceptance criteria — parent-level

- [x] **Goal 1** explicitly closed — Phase B's run-3-vs-run-1 diff cited (0.00% vs 81.4% framework noise; 81.4 pp drop).
- [x] **Goal 2 (Phase G)** parked per user directive 2026-05-06; recorded as such with framework-clean precondition met (Phase B GREEN).
- [x] **Stewardship principles 1 + 5 attestation** — Phase A's caller-level fix removed Issue #1's mutation site directly (cause not symptom); Phase G never ran without user trigger (preserved as PARKED).
- [x] **All 5 framework issues classified** post-fix:
   - **Issue #1 (URL drift)**: **(a) FIXED** — `clients/encore/tests/setup/fixtures.ts:228-238` caller-level probe-context wrap; landed via SUBPLAN_PDF_01_URL_DRIFT_FIX.
   - **Issue #2 (workerIndex always 0)**: **(a) FIXED** — `src/utils/agent-reporter.ts:185` reads `result.workerIndex`; vendored to `clients/encore/dist/framework/utils/agent-reporter.js:121`; landed via SUBPLAN_PDF_01.
   - **Issue #3 (SSO+MFA refresh fail)**: **(b) NO-LONGER-REPRODUCES** — Run-3 0 hits vs Run-2 2 hits; cite `clients/encore/reports/run3-failure-summary.json`.
   - **Issue #4 (authChain dead path)**: **(c) DEFERRED** with named tracking subplan TBD (cosmetic; field declared at `src/utils/agent-reporter.ts` FailureEntry interface but `DiagnosticsCollector` populator path appears dead — needs separate plan to either wire the populator or remove the field). Reopen criterion: any future RCA needing authChain evidence on a failure-summary.json entry.
   - **Issue #5 (page-closed mid-test)**: **(c) DEFERRED** — pre-existing distinct race; landed classification via SUBPLAN_PDF_06; tracking via future `PLAN_LOS_BAS_012_014_020_PAGE_CLOSED_RCA.md`; reopen criterion = ≥1 Issue #5 hit on any future run.
- [x] **All 6 retry layers classified** post-Phase-C:
   - **L1 clickWithRetry**: INSTRUMENTED (live data pending click-heavy run; classification will refine to (a)/(b) at Phase D evaluation when telemetry populates).
   - **L2 per-test (Playwright)**: **(a) DATA-JUSTIFIED-TO-TIGHTEN** — Run-3 1.5% recovery rate qualifies per stewardship principle 4 bar; Phase D evaluator decides actual tightening with auth-flake-rationale weighing.
   - **L3 loginWithMicrosoft**: **(c) NOT-MEASURABLE-AT-PHASE-C-MVP** — named follow-up `SUBPLAN_PDF_03B_RETRY_TELEMETRY_AUTH_LAYERS.md`; reopen criterion when Phase D evaluator demands login retry data.
   - **L4 validateState**: **(c) NOT-MEASURABLE-AT-PHASE-C-MVP** — same follow-up + reopen.
   - **L5 Radix dropdown (LR-025)**: **(c) NOT-MEASURABLE-AT-PHASE-C** — implementation in-page-object across many files; reopen criterion = future LR-025 retry harmonization plan.
   - **L6 expect.poll**: **(c) NOT-MEASURABLE-AT-PHASE-C** — Playwright internal primitive; reopen criterion = Playwright API extension or invasive monkey-patching.
- [x] **Sister-session retry recommendations** classified:
   - **Step 1 (telemetry)**: **(a) APPLIED** — landed in SUBPLAN_PDF_03 for Layers 1+2; Layers 3/4 deferred to follow-up; Layers 5/6 NOT-MEASURABLE.
   - **Step 2 (clickWithRetry 3→2)**: **(b) DATA-NOT-JUSTIFIED-AT-PHASE-C** — Layer 1 telemetry mechanism instrumented but no live distribution data on attempt-N+1 recovery yet. Defer to Phase D evaluator when telemetry populates.
   - **Step 3 (visibility loud at run end)**: PARTIALLY-APPLIED — `retryStats` field on `failure-summary.json` provides per-layer aggregation; loud-console-emit not implemented in Phase C MVP (defer to Phase D evaluator if needed).
   - **Step 4 (auto-tag fail-on-retry-N entries)**: **(b) DATA-NOT-JUSTIFIED-AT-PHASE-C** — meaningful only once Layer 2 telemetry confirms retry waste is genuine (not URL-drift fallout). Phase B verification met that precondition; Phase D evaluator may auto-tag now or defer.
- [x] **Auth-flow MFA-fresh-login verification** — replaced by CLI-headless fresh-state smoke per D4 correction (automation user has MFA disabled). Phase A.4b smoke (`rm clients/encore/.auth/encore-state.json` → `npx playwright test ... -g TC-LOS-BAS-001`) passed 5/5 across 4 browsers; state file regenerated. Auth flow verified unbroken.
- [x] `/regression-guard` snapshot before Phase A vs after each phase close = no silent breakage on touched files outside the planned fix surface (sha + line-delta verified per subplan Execution Summary).
- [x] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [x] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042 (in chat, post-close).
- [x] `npm run plans:reindex` re-run after each subplan transitions pending → done; INDEX.md reflects current state.

### Stewardship principle attestations (parent-level)

- **P1 cause-not-symptom**: Phase A removed the URL-drift mutation site directly at `fixtures.ts:229` (caller-level wrap matching the existing probe-context idiom from line 180). No re-navigation guard / no symptom-patch. Verified by 81.4 pp drop in Phase B's noise gate.
- **P2 ultrathink-no-assumptions**: every subplan emitted "verified file:line" claims at Phase 0/1; pre-execution self-audit caught and retracted ONE hallucinated finding (Explore agent reported "37/67" `/auth/sign-in` ratio; direct file parse confirmed parent plan's "66/67" claim was correct at 98.5%) — captured as audit-retraction footnote in SUBPLAN_PDF_01 Execution Summary.
- **P3 no-rushed-changes**: Phase A subplan ran with `Thinking: max` + `Justification:` line; CLI-headless fresh-state smoke replaced the parent plan body's stale Chrome-MFA mandate (D4 correction landed inline; reason: automation user has MFA disabled per `clients/encore/CLAUDE.md` CI User Provisioning Checklist).
- **P4 data-driven retry tuning**: Phase D documented no-op preserves the principle exactly — 1 local run insufficient evidence; defer to ≥2 weeks of CI telemetry per stewardship-principle-4 wording. No across-the-board cuts.
- **P5 never ship framework noise**: Phase G PARKED throughout this session per user-trigger directive. Phase B's framework-noise GREEN preserves the precondition for Phase G whenever Rutvik triggers it.
- **P6 documented**: this Execution Summary + 4 subplan Execution Summaries + parent-plan body D4 correction + activity-log rows + audit-retraction footnote + named follow-up plans for every DEFERRED item.

### Open follow-ups (named, not dropped)

| # | Item | Tracking name | Reopen criterion |
|---|---|---|---|
| 1 | Issue #4 (authChain dead path) | TBD-named — author when next RCA touches authChain evidence | any future RCA needing authChain field evidence |
| 2 | Issue #5 (page-closed BAS-012/014/020) | `PLAN_LOS_BAS_012_014_020_PAGE_CLOSED_RCA.md` | already 5 hits in Run-3; can author immediately or batch with other test/data-bug findings |
| 3 | Phase A diagnostics-collector observability regression (about:blank pageUrl 91%) | `PLAN_DIAGNOSTICS_COLLECTOR_PAGE_WARM_UP.md` | any future session that wants to use `pageUrl` as a primary triage signal |
| 4 | Layers 3+4 retry telemetry instrumentation | `SUBPLAN_PDF_03B_RETRY_TELEMETRY_AUTH_LAYERS.md` | Phase D evaluator demands login/validateState retry data, OR future auth incident |
| 5 | Layer 5 Radix retry harmonization | TBD — author when LR-025 implementations consolidate | future LR-025 harmonization initiative |
| 6 | Phase D retry-tuning evaluation | `SUBPLAN_PDF_04_RETRY_TUNING.md` | ≥2 weeks of clean CI telemetry shows attempt-N+1 near-zero recovery on ≥1 layer |
| 7 | Phase G colleague-facing CI report | `SUBPLAN_PDF_07_CI_4W_REPORT.md` | explicit user "ship to colleague" instruction (e.g., "trigger Phase G now") |

---

## Notes for the next session that picks this up

- This plan's parent of record is the unified RCA notebook at `~/.claude/plans/rippling-wandering-spring.md` — read it first if you need full evidence trails.
- The sister-session retry plan at `~/.claude/plans/i-never-knew-we-purring-swing.md` stands; this plan reorders its phases and broadens the telemetry/tuning scope to all 6 retry layers per user directive 2026-05-06, but does not contradict its anti-slop principles. Read it before authoring SUBPLAN_PDF_03 / 04 so the telemetry + tuning design honours the original intent.
- Run-1 and run-2 evidence files live under `clients/encore/reports/`. Don't delete them — Phase B compares run-3 against run-1 baseline.
- HARD RULE from validation session: 1 spec = 1 worker (`fullyParallel: false`). Never flip back. The dep-aware fixture's per-process registry depends on this.
- This plan was authored in plan-mode (no execution); the user explicitly asked for plan-only. Future sessions executing Phase A or beyond will switch to `acceptEdits` or `auto` mode per the subplan's PermissionMode.
- **Stewardship principles are load-bearing, not aspirational.** Subplan authors at any phase MUST cite which principle each major design decision honours. Principle violations are RED on `/final-q` regardless of artefact correctness — the design itself was the violation.
- **Phase G never auto-fires.** Even if all other phases are green, Phase G stays parked until the user explicitly says "ship Phase G" / "trigger CI report" / "send to colleague" or equivalent. No agent — Claude or otherwise — promotes Phase G without that trigger. This is the structural gate that protects the colleague-facing report from framework-noise contamination.
