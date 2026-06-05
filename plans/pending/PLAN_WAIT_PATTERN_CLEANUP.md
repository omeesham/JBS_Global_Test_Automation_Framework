# PLAN_WAIT_PATTERN_CLEANUP — Best-practice wait-pattern hardening (runs AFTER timeout centralization)

**Status**: PENDING
**Priority**: P3
**Created**: 2026-06-03
**Identity**: GARDENER
**Depends on**: PLAN_TIMEOUT_CENTRALIZATION.md
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: none
**BrowserToolJustification**: n/a (code refactor + `@playwright/test` spec runs only; if a live confirmation is ever needed, announce a `[BROWSER-SWITCH]` to `cli` per browser-tool.md)

---

## Context

This is the explicitly-deferred cleanup half of the timeout work (split per user decision 2026-06-03: "two plans, one per category"). None of these items is required to centralize timeouts or fix the verified slow-machine flake — they are best-practice hardening with real blast radius, so they ship separately and ONLY after `PLAN_TIMEOUT_CENTRALIZATION.md` is green (it provides the scaled constants these refactors lean on). Three external audits converged that bundling these into the centralization PR would risk breaking passing specs — hence the split.

**Discipline carried over (verified):** the app is React/Next.js (not Angular); `waitForAngularStable` is a silent no-op (handled per-site in the centralization plan's Phase 4a). The items here are: a triple-poll `clickWithRetry` that masks instability, fixed `sleep`-style waits, a Radix `.catch(()=>{})` that swallows a possibly-broken interaction, an inconsistent auth `goto` waitUntil, and a CI flaky-gate. Each is individually gated and abortable.

**Provenance**: split from the approved design `~/.claude/plans/now-find-the-timeouts-moonlit-naur.md` (2026-06-03).

---

## Bootstrap

**Identity**: GARDENER

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/regression-guard` (wrap — BEFORE + AFTER per touched file)
- `/relevant` (Phase 0.5)
- `/final-q` (Phase 4 — LR-042)

**Context files**:
- `~/.claude/plans/now-find-the-timeouts-moonlit-naur.md` (approved design provenance)
- `PLAN_TIMEOUT_CENTRALIZATION.md` (predecessor — must have closed out of pending/ first per Depends-on; provides the `TIMEOUTS`/`TEST_BUDGETS` constants these refactors use)
- `.claude/rules/pipeline.md` (LR-020/027/040/048/050/055)
- `.claude/rules/specs.md` (LR-019/021/022/024)
- `.claude/rules/angular.md` (LR-023 networkidle ban, LR-025 Radix retry)
- `.claude/rules/browser-tool.md` (LR-038 v2 / LR-054)
- `docs/read_only_docs/AGENT_SHARED_RULES.md`; `docs/read_only_docs/LEARNED_RULES.md`
- `clients/encore/CLAUDE.md` (LR-ENC-002/003)

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. **Confirm the predecessor `PLAN_TIMEOUT_CENTRALIZATION.md` has closed (moved out of pending/)** — it provides the scaled constants. If it is still pending → HALT (do not run cleanup on un-centralized timeouts).
2. Read `.claude/context/navigation.md` (R00) — pull wait/Radix/auth findings.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — GARDENER `MNT-*` / `ALL-*`.
4. Read `.claude/context/patterns.md` — esp. "Radix UI Large-Option Dropdown Interaction" (LR-025).
5. LR scan — LR-019/020/022/023/024/025/028/037/048/050/055.
6. **Browser-tool announcement**: `BrowserTool=none` — code refactor + spec runs; switch to `cli` (logged) only if a live confirmation becomes necessary.
7. **Re-grep scope** (working tree changes): `rg -c "clickWithRetry" clients/encore` (verified 2026-06-03: 28 occ / 10 files; incl. the def in `base-page.ts`).
8. **Baseline (LR-018):** `cd clients/encore && npm run clean` → full single-worker run on `.env.local` (LR-ENC-003) → save pass-set + timing. Each item below diffs against this.

---

## Phase 1+ — Cleanup items (each its own verified, abortable change — STOP on regression)

1. **Retire `clickWithRetry` (`base-page.ts:114-141`, ~28 call sites / 10 files) — audit-corrected.** Playwright's `.click()` already auto-waits actionability (visible/stable/enabled/receives-events), so a blanket `toBeEnabled()` adds little — add an explicit postcondition (`toBeEnabled()` or the real expected effect) only where the prior retry was masking a specific enable-race, NOT everywhere. Also: `clickWithRetry` flushes `recordRetryCall('click', …)` telemetry at `base-page.ts:125/132` — retiring it MUST remove/redirect the 'click' telemetry layer and update any `agent-reporter`/retry-telemetry reference, or the layer goes silently dead. Replace with actionability + the scaled `TIMEOUTS.action`. Per call-site, verified individually vs baseline. Highest-blast item — do it first, one batch at a time.
2. **Replace fixed `sleep`-style waits with condition waits.** Each `page.waitForTimeout(...)` / fixed `setTimeout` pause → a concrete condition (`waitFor`/`toBeVisible`/`waitForResponse`). Arm `waitForResponse` BEFORE save-triggering clicks rather than sleeping after. **Ban networkidle** (LR-023).
3. **Make the Radix `.catch(()=>{})` at `base-page.ts:582` VISIBLE — corrected per audit.** This catch is in the retry-CLEANUP path after a FAILED option-click (inside the `:574` `catch` block), **NOT** after a confirmed selection. Surface it by **logging the cleanup failure into the trace while PRESERVING the original interaction error** — do **NOT** rethrow here: rethrowing aborts the LR-025 retry loop and turns a recoverable retry into a hard fail. Evidence proves a swallow EXISTS, not that it causes flake — verify each affected dropdown spec still passes; if surfacing it turns a green spec red, that red is a real finding (file per LR-044), do not re-swallow. Do NOT lean on the multiplier to prop this path up.
4. **Normalize the auth `goto` waitUntil — CONDITIONAL.** `performSsoLogin` (`auth-storage.ts:175`) uses default `load`; `validateState` (`:100`) uses `domcontentloaded`. `load` is the *safer* (waits-more) wait, so changing it is risk-ADDING. **Only** make this change IF auth failures are observed in practice or profiling shows `load` is causing hangs. Otherwise record "left as `load` — no observed auth failure" and skip (not a HALT).
5. **Add `--fail-on-flaky-tests` to the merge gate — BLOCKED on a prior fix (audit-corrected).** The real PR gate is **Azure** (`.ci/azure-pipelines.yml` `pr: main/develop`), NOT the GitHub workflow (`playwright-tests.yml` is `workflow_dispatch`/manual). That Azure gate runs `--project=chrome`/`--project=firefox`, whose `testMatch:[]` in `playwright.config.ts:110/160` means **it executes 0 tests** — so adding `--fail-on-flaky-tests` to it is INERT until the gate is pointed at the real `encore-locations`/`encore-local-office` projects. Therefore this item is blocked on first fixing the dead gate (a SEPARATE CI finding). Flag it; do not bolt the flag onto a gate that runs nothing.

**Leave alone (verified non-issues):** save flow (`clickSaveWithDialog` drains real server responses + records 4xx/5xx), count assertions (paginated ~20/page, not virtualized). `expect.poll`→web-first conversion is a SEPARATE future plan (`SUBPLAN_POLL_TO_WEBFIRST.md`, ~180 calls / 9 files) — NOT in scope here.

---

## Stale-cleanup — what becomes stale (LR-050)

1. **Removed:** `clickWithRetry` method + all call sites — verify `rg -c "clickWithRetry" clients/encore` returns 0 (or only an intentional historical comment) after item 1.
2. **Removed:** fixed `waitForTimeout`/sleep pauses replaced in item 2 — verify `rg "waitForTimeout\(" clients/encore` only matches documented exceptions.
3. **Changed (not removed):** the `.catch(()=>{})` at `base-page.ts:582` becomes a typed catch — verify no bare `.catch(() => {})` remains on that listbox-hidden wait.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

DO-NOW / SPAWN / APPEND for any adjacent (GARDENER, same-file, 5–30 min, no-input) fix. Bare "out of scope" = HALT + ask (LR-040/LR-046).

---

## Per-Identity Satisfaction

This plan modifies `.spec.ts` / page-object files (mechanical wait-pattern swaps, NO change to TC IDs/titles/count/assertions) — parity unaffected (LR-ENC-002 framework-internal). Any inadvertent TC-ID/title change is out of scope and must be reverted.

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline / REQUIREMENTS.md | (none) | (none) |
| GIVER | test-cases / test-plans / XLSX | (none) | (none) |
| BUILDER | specs/**/*.spec.ts | (none) | (none) |
| HEALER | per-fix MD update | (none) | (none) |
| WATCHDOG | findings table | (none) | (none) |
| GARDENER | framework src refactor | clients/encore/src/pages/base.page.ts | `cd clients/encore && npm run typecheck` clean |

> Matrix footnotes (why each `(none)`): HUNTER/GIVER/BUILDER — no requirement/TC added/removed/renamed; mechanical wait-pattern swaps only, parity unaffected. HEALER — proactive cleanup, not RCA-driven (if item 3 surfaces a real bug → file per LR-044). WATCHDOG — not audit-driven.

---

## Acceptance criteria (LR-040 / LR-055 closure gate)

- [ ] Predecessor `PLAN_TIMEOUT_CENTRALIZATION.md` confirmed DONE before any edit.
- [ ] `clickWithRetry` retired; each former call-site passes vs baseline.
- [ ] Fixed sleeps replaced with condition waits; no networkidle introduced (LR-023).
- [ ] Radix `.catch:582` made visible (typed catch); affected dropdown specs pass OR a real bug filed per LR-044 (not re-swallowed).
- [ ] Auth `goto` waitUntil: changed only with observed-failure evidence, else explicitly recorded as left-as-`load`.
- [ ] `--fail-on-flaky-tests` wired into the merge gate.
- [ ] Full suite green vs baseline (MULT=1) + sanity at MULT=2.
- [ ] `/regression-guard` before/after = no silent breakage.
- [ ] Activity-log row per LR-028 with LR-037 timestamp.
- [ ] `/final-q` verdict block per LR-042.

---

## Verification

```bash
cd clients/encore
npm run typecheck                       # expect: clean
rg -c "clickWithRetry" .                # expect: 0 (or only an intentional comment)
rg "waitForTimeout\(" .                 # expect: only documented exceptions
rg "\.catch\(\(\) => \{\}\)" src/pages/base.page.ts   # expect: the :582 listbox-hidden swallow is gone (typed catch)
npm test                                 # expect: full suite green vs baseline
```

---

## Handoff (post-execution)

Chat-only per `feedback_handoff_in_chat_only.md` (no obstacle claims). Summarize: which cleanup items landed, which were skipped-with-reason (esp. the conditional auth `goto`), any real bug surfaced by making the Radix swallow visible, and confirmation the full suite stayed green against the centralization-plan baseline.
