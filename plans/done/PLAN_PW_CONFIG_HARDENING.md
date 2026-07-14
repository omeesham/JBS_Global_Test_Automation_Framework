# PLAN_PW_CONFIG_HARDENING — Playwright config/fixture hardening (GPT+Opus council audit → Fable adjudication)

**Status**: DONE
**Executed**: 2026-07-10
**Priority**: P1
**Created**: 2026-07-08
**Identity**: GARDENER
**Depends on**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**BrowserTool**: none
**BrowserToolJustification**: n/a — verification runs via `npx playwright test` (the test runner, not a browser-tool choice) and `npm run typecheck`. No live-DOM exploration in this plan.

---

## Context

A 12-worker council (GPT-5.5 + Opus-4.6, via `/ultra-agents`) audited the manual-era Playwright framework configuration in `clients/encore/` — `playwright.config.ts`, fixtures, `tsconfig.json`, `package.json`, env loading, auth setup — against best practices. Rutvik's explicit rationale: a different LLM vendor can surface things Claude alone keeps missing. 22 findings came back (F1–F22), split so each item was scored independently by both models.

Fable (this session) then re-verified every contested claim BLIND against source before ruling — reading the actual files, not trusting either model's word. Fable additionally verified the two models' own DROP list (Tier-4, both-agreed) and found all 9 of those hold up.

**Driving constraint (Rutvik, 2026-07-08):** Encore runs these tests in **their own CI**, from the shipped deliverable. When a test flakes there, we (JBS) cannot reproduce it locally — there is no "run it again and watch." Evidence has to be captured **at the moment of the flake, in their CI**, and shipped back to us in artifacts. This reframes flaky-vs-hard-fail: **flaky = failure** (a bug that happens to fire less often), and the triage decision (worth fixing or not) can only be made **after** artifact-first RCA — never assumed away because "it passed on retry."

This reframing elevated one finding (F1 — no trace/video/screenshot capture on the real page) to the linchpin of the whole plan, and surfaced three gaps neither council model caught (see below).

### What Fable's independent re-verification caught (both models missed all three)

1. `src/reporter/agent-reporter.ts` records the failing attempt of a flaky test but never marks whether the test eventually passed on a later attempt — the shipped evidence can't distinguish "flaked, later passed" from "hard failure."
2. `scripts/share-for-debugging.js` (the zip bundler run before sending evidence back) omits `test-results.json (under reports/)` — the one file that carries Playwright's own official flaky-vs-failed status.
3. The `chrome`/`firefox`/`webkit` projects' comment claims they're "kept invokable for manual `--project=<name>` debugging" — false: each has `testMatch: []`, so invoking them runs **zero** tests. The stated purpose cannot work as written.

### Full verdict table (12 contested findings — GPT vs Opus vs Fable)

| # | Finding | GPT-5.5 | Opus-4.6 | Fable ruling | Why |
|---|---|---|---|---|---|
| F1 | No trace/video/screenshot on the real (manually-created) page | KEEP | KEEP | **FIX** | Linchpin — un-replicable CI flakes need captured evidence, this is the only source |
| F2 | Flaky tests reported as plain failures, no distinct status | KEEP | DROP | **FIX** | Both missed: attempts are recorded but never labeled flaky; zip drops the one file that has Playwright's real flaky status |
| F3 | `as any` casts on artifact env-var settings | flag | DROP | **FOLD into F1** | Standalone it's cosmetic; the real fix lives in the fixture rework, not the cast |
| F7 | Dead `chrome`/`firefox`/`webkit` projects | KEEP (delete) | DROP (documented debug templates) | **FIX (delete)** | Opus's own premise is false — `testMatch:[]` means they run 0 tests, so "manual debug" cannot work |
| F9 | No `globalTimeout` | KEEP | DROP | **FIX (dynamic)** | We don't control Encore's CI job timeout; a wedged serial suite can burn hours with nothing stopping it |
| F10 | No `maxFailures` | KEEP | DROP | **DROP** | Would truncate the full failure picture from a CI run we can't reproduce — directly against the evidence-capture goal |
| F11 | `playwright.config.ts` excluded from `tsconfig.json` | KEEP | KEEP | **FIX** | Real gate hole — config type errors pass `npm run typecheck` today |
| F13 | Auth-state "valid" check is Dashboard-heading-only | KEEP | DROP | **DROP** | CI runners always take the fresh-login path (no persisted state to reuse); hardening adds brittleness we can't debug remotely |
| F16 | `MAX_WORKERS=<non-numeric>` silently becomes `NaN` | KEEP | KEEP | **FIX** | Real — `Math.max(1, NaN)` is `NaN`, passed straight to Playwright |
| F18 | Dummy `test_user`/`test_password` fallback credentials | KEEP | DROP | **DROP (cleanup)** | Grep-verified: nothing reads these fields; real login uses `CredentialLoader` and preflight fail-closes on missing creds |
| F19 | Chromium project bypasses TLS certificate checks | KEEP | DROP | **FIX (delete)** | 13 of 19 spec files (`tests/locations/**` + `tests/local-office/**`, via the `encore-locations`/`encore-local-office` projects) already run with no cert-bypass flags against the same host and pass daily — the bypass is unneeded and hides real TLS breakage. It only affects the 6 `tests/corporate-pricing/**` files, which run under the `chromium` project |
| F22 | Preflight readiness accepts any 2xx/3xx redirect | KEEP | DROP | **DROP** | Documented liveness-only probe by design; a captive portal would fail loudly at SSO seconds later anyway |

### Tier-4 — both models said DROP, Fable independently re-verified all 9, all hold

F4 (worker-shared session — mitigated by per-test `beforeEach` reset, confirmed present in all 19 specs), F5 (diagnostics-file race — impossible; every spec basename is unique and Playwright never splits one file across workers), F6 (annotation-only dependency gate — intentional, a runtime skip would false-skip), F8 (`--project=chromium` skips module specs — standard, documented project partitioning), F12 (caret-pinned `@playwright/test` — **verified** `package-lock.json` is git-tracked, so it ships and pins), F14 (cookie-only auth validation — documented MSAL/sessionStorage reason for dropping browser-replay), F15 (hardcoded baseURL fallback — **verified** `global-setup.ts` fail-closes on missing `BASE_URL`), F20 (`testIdAttribute` not set — `data-testid` is Playwright's own default already), F3 folded above.

### Ratified scope defaults (Rutvik confirmed 2026-07-08 — no open questions)

- F18: delete the dead credential fields — confirmed yes (zero consumers, typecheck proves it).
- F9: **dynamic** formula, not a fixed number — `globalTimeout` computed from spec-file count × 15 min at config load, so it auto-scales as specs are added and never needs manual retuning.
- F19: remove both cert-bypass flags outright — no opt-in env var. If an Encore environment genuinely needs it, the failure is loud (clear TLS error) and the one-line re-add is trivial; not worth the extra config surface.
- F7: delete all three dead projects outright — wiring one for real manual debugging is speculative scope nobody asked for.

---

## Bootstrap

**Identity**: GARDENER (framework/config hardening — no spec/TC/test-plan files touched)

**Skills auto-called**:
- `/identity` (Step 1.5 gate, fires on launch)
- `/regression-guard` (wrap — BEFORE + AFTER snapshots on every touched file: exports, imports, function signatures)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/final-q` (mandatory exit per LR-042)

**Context files**:
- `~/.claude/plans/no-trace-screenshot-on-zany-flurry.md` (source plan — full council transcript provenance, superseded by this file as the canonical copy)
- `.claude/rules/pipeline.md` (LR-020 verify-claims, LR-027/040/048/050/060 closure + structure)
- `.claude/rules/deliverable.md` (LR-058 — NO internal rule IDs / plan IDs / codenames in shipped `clients/encore/` comments; write-time jargon-gate hook enforces)
- `.claude/rules/plan-closure.md` (LR-055 close-gate C1–C6)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership, ALL-* rules)
- `docs/read_only_docs/LEARNED_RULES.md` (LR-028 activity-log, LR-037 timestamps, LR-035 INDEX auto-gen)
- `clients/encore/CLAUDE.md` (LR-ENC-003 `.env.e2e` is CI-only)

## Phase 0 — Dependency + browser-tool gate

- Depends on: none. No prerequisite plan.
- Browser tool: none needed — this plan is pure code (config/fixture/reporter) hardening; verification is `npm run typecheck` + `npx playwright test` runs, not live-DOM interaction.

## Phase 1 — WS1: capture flake evidence at the failing attempt (F1 + F3, the linchpin)

File: `clients/encore/src/fixtures/pages.fixture.ts`

- In the `authenticatedSession` worker fixture, right after the shared context is created (~line 290): start context-level tracing once per worker (`context.tracing.start({ screenshots: true, snapshots: true, sources: true })`).
- In the test-scoped `diagnosticsHandler` fixture (already has `testInfo`; add a dependency on `authenticatedSession` to reach `context`):
  - Setup: start a trace **chunk** per test (`context.tracing.startChunk({ title: testInfo.title })`).
  - Teardown: if `testInfo.status !== 'passed'` → stop the chunk **with** a path (`testInfo.outputPath('trace.zip')`) and attach it under the exact name `'trace'`; also take a full-page screenshot to `testInfo.outputPath('failure-screenshot.png')` and attach it under the exact name `'screenshot'`. If passed → stop the chunk with no path (discard).
  - The attachment names matter: `agent-reporter.ts` looks up attachments named exactly `'screenshot'` and `'trace'` to populate the shipped `failure-summary.json`'s `screenshotPath`/`tracePath` fields — this wiring is what makes that file point at real artifacts for the first time.
- This gives per-attempt retain-on-failure semantics: a flake (fails, then passes on retry) still leaves behind the failing attempt's trace, even though the test ends green overall. This solves the earlier `on-first-retry` problem (which only captures the passing retry) entirely at the fixture level — no config trace-mode change needed.
- Tracing is always-on at the fixture level, so env toggles can no longer silently disable CI capture (this is where F3 folds in — the `as any` cast on the config-level trace/video/screenshot settings becomes moot once the fixture, not the config, governs the real page).
- Fix the misleading comment near the manual-context creation that currently claims trace/video "still attach" automatically — replace with an accurate, plain-English note (no internal rule IDs; this file ships to the client).
- Video: not feasible per-test on a shared worker-scoped context (Playwright's `recordVideo` is fixed at context-creation time; one giant per-worker video spanning many tests is not useful evidence). Document this limitation in one plain-English comment line instead of leaving the false claim in place.

## Phase 2 — WS2: make flakes first-class in the shipped evidence channel (F2)

- `clients/encore/src/reporter/agent-reporter.ts`: add a `finalOutcome: 'failed' | 'flaky'` field to each failure entry. Track outcome per test across its `onTestEnd` events; if a test's LAST attempt passed, mark all its recorded failing-attempt entries `'flaky'` instead of `'failed'`. Every failing-attempt entry is kept (the evidence stays) — this only makes the triage-worthy distinction explicit for whoever reads `failure-summary.json`.
- `clients/encore/scripts/share-for-debugging.js`: add `test-results.json (under reports/)` to the bundle candidates (one line) — this ships Playwright's own official flaky/failed/passed status back with the debug zip.
- `clients/encore/README.md`: add a short section instructing Encore's CI to run `npm run share-for-debugging` and archive the resulting `reports/share-for-debugging-*.zip` after every run (pass, fail, or flaky). We do not control their CI runner — without this instruction, the captured evidence never leaves their machine.

## Phase 3 — WS3: config hardening (F7, F9, F11, F16, F19)

File: `clients/encore/playwright.config.ts` (+ `tsconfig.json`)

- **F11**: add `"playwright.config.ts"` to `tsconfig.json`'s `include` array; remove the now-unused `import * as path` at the top of the config if it trips `noUnusedLocals` after the change. Confirm zero new typecheck errors.
- **F16**: replace the current `Math.max(1, parseInt(process.env.MAX_WORKERS, 10))` expression with strict validation — if `MAX_WORKERS` is set and is not a positive integer, **throw** a clear config-time error naming the bad value. Fail-fast beats a silent `NaN` reaching Playwright. No artificial upper bound (the multi-worker override stays an intentional opt-in).
- **F9 (dynamic, per ratified default)**: add a CI-only `globalTimeout` computed at config load — count `tests/**/*.spec.ts` files via a cheap filesystem glob, multiply by 15 minutes per spec file. This auto-scales with the suite; nobody has to retune a constant as specs are added. At execute time, sanity-check the resulting value against the most recent real full-run duration in `test-results.json (under reports/)` (must land at ≥3× observed) — if it doesn't, adjust the per-spec-file minutes constant, not the formula shape.
- **F7**: delete the three dead `chrome`/`firefox`/`webkit` project blocks entirely (each currently has `testMatch: []`).
- **F19**: delete the `--ignore-certificate-errors` and `--ignore-certificate-errors-spki-list` launch args from the `chromium` project.

## Phase 4 — WS4: dead-code cleanup (F18, ratified in-scope)

- Delete the unused `username_automation`/`password_automation` fields from `clients/encore/src/utils/env-config.ts` and their type declarations in `clients/encore/src/types/index.ts` (grep-verified: zero consumers anywhere in the codebase). `npm run typecheck` proves nothing broke.

## Constraints

- Every file touched in this plan ships to the client (everything under `clients/encore/` that survives the ship deny-globs). Comments must be plain English only — zero internal rule IDs, plan IDs, or pipeline codenames. The write-time jargon gate will deny any violation; don't fight it, just write plainly.
- No `.spec.ts`, test-case, test-plan, or XLSX files are touched → no LR-048 Per-Identity Satisfaction Matrix required (this section intentionally omitted — trigger condition not met).
- Activity-log row required at session end per LR-028 (owner edits to shipped-file paths).
- If the identity write-gate blocks an edit mid-execution, adopt the identity it names rather than bypassing.

## Acceptance criteria

- [ ] `npm run typecheck` passes, now covering `playwright.config.ts` (F11).
- [ ] Deliberate-fail probe: force one spec assertion to fail → `reports/test-results/**/trace.zip` and `failure-screenshot.png` exist, `failure-summary.json`'s matching entry has non-null `tracePath`/`screenshotPath`, and `npx playwright show-trace <path>` opens the trace (F1).
- [ ] Flake probe: force a test to fail on attempt 0 and pass on retry (one-off, env-guarded) → the attempt-0 trace is retained AND the failure-summary entry for it reads `finalOutcome: 'flaky'` (F1 + F2).
- [ ] After F7/F19: `npx playwright test --list` shows only `setup`/`chromium`/`encore-local-office`/`encore-locations` projects (no chrome/firefox/webkit); one corporate-pricing spec run stays green on the `chromium` project with the cert-bypass flags removed.
- [ ] `MAX_WORKERS=abc npx playwright test --list` throws a clear, named error — not a silent `NaN` (F16).
- [ ] `npm run share-for-debugging` output zip contains `failure-summary.json`, `test-results/`, `test-results.json`, `diagnostics/`, and `logs/` (F2).
- [ ] One module's spec-run wall-clock time compared before/after tracing-always-on, to confirm acceptable overhead.
- [ ] `npm run typecheck` clean after the F18 dead-field deletion.

## Execution Summary

**Executed**: 2026-07-10 · **Identity**: GARDENER · **Method**: `/execute` + `/ultrathink`; implementation delegated to a Copilot worker (T2 `claude-sonnet-4.6`, ticket `pwch-1`), every diff orchestrator-audited at file:line; one worker slop defect self-fixed under a logged, scoped grant.

### Findings implemented (all live-verified)

- **WS1 (F1+F3) — per-attempt failure evidence [linchpin]**: `clients/encore/src/fixtures/pages.fixture.ts` — worker context starts `tracing.start({screenshots,snapshots,sources})` once per worker; `diagnosticsHandler` starts a per-test `startChunk` and, on non-pass, stops it to `trace.zip` + captures `failure-screenshot.png`, attaching both under the exact names `trace` / `screenshot`. Passing tests discard their chunk. The false "P0-7 gate / trace+video still attach" comment was replaced with an accurate plain-English note; the per-test-video infeasibility (recordVideo is fixed at context creation) is documented in one line. **PROVEN LIVE**: deliberate-fail + flake probe → `failure-summary.json` entries carry non-null `tracePath`/`screenshotPath`; the trace zip is a valid Playwright trace (`trace.trace` + `trace.network` + snapshot resources).
- **WS2 (F2) — flaky first-class**: `agent-reporter.ts` gained `finalOutcome: 'failed' | 'flaky'` on `FailureEntry`, tracked per `test.id` and promoted to `flaky` in `onEnd` when the test's final attempt passed (failing-attempt evidence retained). `scripts/share-for-debugging.js` now bundles `test-results.json` (Playwright's official flaky/failed status). `README.md` gained CI artifact-collection guidance (run share-for-debugging on every run incl. `if: always()`; flaky-evidence note). **PROVEN LIVE**: flake probe's attempt-0 entry reads `finalOutcome: flaky`; bundled `test-results.json` stats show `"flaky":1`.
- **WS3 — config hardening** (`playwright.config.ts`): F16 → `parseMaxWorkers` throws on a non-positive-integer `MAX_WORKERS` (verified: `MAX_WORKERS=abc` → clear error, exit 1; `=2` → exit 0). F9 → CI-only `globalTimeout = countSpecFiles(tests) × 15min` (23 spec files → ~5.75h cap; auto-scales). F7 → deleted the three dead `chrome`/`firefox`/`webkit` projects + their false comment (list now shows only `setup`/`chromium`/`encore-local-office`/`encore-locations`). F19 → deleted both `--ignore-certificate-errors*` args (a corporate-pricing spec runs 7/7 green on `chromium` without them).
- **WS4 (F18) — dead-field cleanup**: removed `username_automation`/`password_automation` from `clients/encore/src/utils/env-config.ts` + `src/types/index.ts`; repointed the one example consumer `pipeline/tests/examples/session-reuse-pattern.spec.ts` to `config.url`. Grep confirms zero remaining consumers under `clients/encore/src` + `pipeline/tests`; typecheck clean.
- **Adjacent (`.env.e2e`, README chrome row)**: corrected the stale "workers (4)" comment; removed the dead `--project=chrome` README row.

### Deviations

- **F11 — tsconfig include: NO-OP (already satisfied)**. The plan assumed `tsconfig.json` needed `"*.ts"` added to `include` and an unused `import path` removed. A prior session (commit `a3328f15`) already added `"*.ts"`, so the config was already in the typecheck net; and the new `countSpecFiles` helper legitimately *uses* `import * as path`, so there is no unused import. F11's intent (config type-checked) is satisfied — proven by `npm run typecheck` passing over the config's new `fs`/`path` code. `tsconfig.json` was correctly left untouched.
- **F9 sanity-check basis**: the ≥3×-observed check was assessed against per-spec timings (loc-export 8 tests ≈ 80–96s incl. SSO), not a fresh full 739-test serial run (not run this session). The 5.75h CI-only cap is conservatively ≥3× any realistic full-suite duration and, being CI-only + generous by design, cannot kill a legitimate run.

### Verification (all 8 acceptance criteria GREEN)

1. `npm run typecheck` exit 0 (covers `playwright.config.ts`). 2. deliberate-fail → `trace.zip` + `failure-screenshot.png` on disk, non-null paths, valid trace. 3. flake → attempt-0 trace retained + `finalOutcome: flaky`. 4. no chrome/firefox/webkit projects + corp-pricing green on chromium sans cert-bypass. 5. `MAX_WORKERS=abc` throws (exit 1). 6. share bundle contains failure-summary.json + test-results/ + test-results.json + diagnostics/ + logs/. 7. tracing overhead negligible (after 80.3s vs baseline 95.9s, same 7-pass/1-skip). 8. typecheck clean post-F18.

### Adjacent-Sweep (Phase 2.5)

- **SPAWN** `task_85e9112d` — the root shared-framework copies (`src/utils/common-methods.ts`, `src/framework-contracts/index.ts`) still carry the same dead cred fields; out of this plan's `clients/encore/` scope → spawned as a self-contained follow-up (grep-then-delete once zero consumers confirmed).

### Non-goals honored

F10/F13/F18-hardening/F22 dropped as planned; no maxFailures, no validateState hardening, no preflight redirect validation, no version pinning, no testIdAttribute, no diagnostics-file locking, no touching the config `use.trace/video/screenshot` lines.

## Explicitly out of scope (non-goals)

`maxFailures` (F10 — would truncate the evidence we need from un-replicable CI runs), `validateState` hardening (F13), preflight redirect-target validation (F22), exact Playwright version pinning (F12 — lockfile already pins), `testIdAttribute` (F20 — already Playwright's default), diagnostics-file locking (F5 — proven impossible at current spec-naming), runtime dependency-gate enforcement (F6 — intentional annotation-only design).

## Handoff

Chat-only, no separate handoff file. This plan is ready for `/execute`. Full council transcript + Fable's blind re-verification live in this session's history and in `~/.claude/plans/no-trace-screenshot-on-zany-flurry.md` (scratch copy, superseded by this canonical repo copy).
