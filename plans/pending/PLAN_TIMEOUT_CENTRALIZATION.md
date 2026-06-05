# PLAN_TIMEOUT_CENTRALIZATION — One source of truth for timeouts + env multiplier + auth-budget fix

**Status**: PENDING
**Priority**: P1
**Created**: 2026-06-03
**Identity**: GARDENER
**Depends on**: none
**Blocks**: PLAN_WAIT_PATTERN_CLEANUP.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: none
**BrowserToolJustification**: pure code refactor + `@playwright/test` spec runs only (no live DOM walk). Spec runs are the test runner, not a browser-tool choice. If a live confirmation ever becomes necessary, announce a `[BROWSER-SWITCH]` to `cli` per `.claude/rules/browser-tool.md`.

---

## Context

Encore's suite passes on our machine but flaked on a slower one. Timeouts today are scattered hardcoded literals across two parallel systems: `AppConstants` (4 `*_MS` fields, consumed only by `login.page.ts`) and raw literals everywhere else. There is no `globalTimeout` and no env knob, so a degraded box has no single lever.

This plan creates ONE environment-scalable source of truth for the **reusable** timeout tiers + a `TIMEOUT_MULTIPLIER` knob, and fixes the verified auth-budget bug — **without changing local behaviour at MULT=1 except for the explicitly-listed deltas, and without regressing any existing spec.**

### What this plan does NOT do (audit-corrected 2026-06-03 — read before executing)

A three-round external audit (all 10 findings code-verified against actual files + the closure validator + the failure log) proved the earlier draft bundled the goal with a **wrong flake diagnosis** and **unsafe/inert extras**. Those are removed:

- **The Notes flake is NOT a timeout/hydration problem.** The recorded failure (the failing run's `_cli-run.log` ~line 4145 + the `failure-summary.json` TC-LOC-NTS-039 entry) is the *wrong top-level tab active* ("Location Management History" instead of "Basic Information"), so the Notes sub-tab was never mounted and a wait sat on a nonexistent element. That wait is **already 30s** (`base-page.ts:447`). Timeout changes cannot fix it. **The flake RCA is PARKED as a separate item per user (2026-06-03) — not in this plan.**
- **No "wait for data" / `waitForTabInteractive` helper** — it would reject valid empty states (e.g. a location with no notes; `location-notes.page.ts:44` already races content-or-empty correctly) and the `waitForAngularStable` call sites are heterogeneous (navigation, save, sort, dropdown) — they can't route through one tab helper.
- **No "zero hardcoded literals" claim.** Genuine one-offs (the 45s account-search at `location-account-address.page.ts:275`, the 4s SSL dialog probe at `location-shared-setup-locations.page.ts:73`, `waitForTimeout(...)` sleeps, `Date.now()+N` deadlines, default-parameter timeouts) are NOT reusable tiers — they stay in place with a clarifying comment. We centralize the reusable tiers + the 6 named optional waits.
- **No `waitForAngularStable` behaviour change, no Radix `.catch` change, no `clickWithRetry` retirement, no `--fail-on-flaky-tests` gate** — all are `PLAN_WAIT_PATTERN_CLEANUP.md` (which itself needs correction; see its file).

**Headline (true, but informational only here):** the app is **React/Next.js, not Angular** (`auth-storage.ts:74` filters `next-auth.session-token`; Radix/shadcn/lucide; `location-notes.spec.ts:554` "Next.js 15 App-Router RSC"), so `waitForAngularStable()` (`base-page.ts:222`) is a silent no-op. We do NOT delete those calls in this plan — we only centralize their `10_000` default *number*. `clients/encore/CLAUDE.md:4` ("Angular + Radix UI") is stale; fixing that string is the one app-stack correction in scope.

**Provenance**: corrected design at `~/.claude/plans/now-find-the-timeouts-moonlit-naur.md` (2026-06-03). All counts below were verified 2026-06-03 but the working tree is changing → Phase 0 re-greps as authoritative.

---

## Bootstrap

**Identity**: GARDENER

**Skills auto-called**:
- `/identity` (Step 1.5 gate, fires on launch)
- `/regression-guard` (wrap — BEFORE + AFTER snapshots on every touched file)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/final-q` (Phase 4 — mandatory exit per LR-042)

**Context files**:
- `~/.claude/plans/now-find-the-timeouts-moonlit-naur.md` (corrected design provenance)
- `.claude/rules/pipeline.md` (LR-020 verify-claims, LR-027/040/048/050 closure + structure)
- `.claude/rules/specs.md` (LR-018 baseline-workflow, LR-024 clean-before-RCA, LR-052 no-fixed-sleep-in-poll)
- `.claude/rules/browser-tool.md` (LR-038 v2 / LR-054)
- `.claude/rules/plan-closure.md` (LR-055 close-gate C1–C6; matrix-cell C6 format)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership, ALL-* rules)
- `docs/read_only_docs/LEARNED_RULES.md` (LR-018 baseline, LR-028 activity-log, LR-037 timestamps, LR-035 INDEX auto-gen)
- `clients/encore/CLAUDE.md` (LR-ENC-002 framework-internal scope, LR-ENC-003 `.env.local` for local runs)

---

## Phase 0 — Gate + truth + baseline (MANDATORY)

1. `Depends on: none` — proceed.
2. Read `.claude/context/navigation.md` (R00) — pull timeout/wait/auth findings instead of re-discovering.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter GARDENER `MNT-*` / `ALL-*` (esp. MNT-010 describe-level setTimeout default).
4. LR scan — LR-018/020/024/027/028/037/048/050/055, LR-ENC-002/003.
5. **Browser-tool announcement** (LR-038 v2): `BrowserTool=none` — code edits + `@playwright/test` spec runs only.
6. **Re-grep authoritative scope** (counts verified 2026-06-03, re-confirm — tree is changing):
   - `rg -n "15_?000" clients/encore/src` → split into **readiness/content/grid/table-visibility waits** (promote to 30s) vs **everything else** (login flow, checkbox actions, `Date.now()+15_000` deadline at `location-auto-addon.page.ts:88`, default param `waitForRecentTopRow(... = 15_000)` at `location-management-history.page.ts:325`) — the latter are NOT promoted.
   - `rg -nc "timeout:\s*\d" clients/encore/src clients/encore/specs` (reusable-tier literals to migrate)
   - `rg -nc "\.setTimeout\(" clients/encore/specs` (verified 154 / 14 files — test budgets)
   - Confirm the one-offs to LEAVE: `location-account-address.page.ts:275` (45s), `location-shared-setup-locations.page.ts:73` (4s), `waitForTimeout(...)` sites (~20), `Date.now()+N` (~3).
7. **Baseline (LR-018):** `cd clients/encore && npm run clean` → full single-worker run on `.env.local` (LR-ENC-003 — **never** `CI_ENV=e2e` locally) under the SHIPPING config (retries unchanged `CI?2:1`) → save the pass-set + per-spec timing as the regression baseline. Every later phase diffs against this.

---

## Phase 1 — SoT module + multiplier (eval-order-correct) + config wiring

Extend the EXISTING `clients/encore/src/core/app-constants.ts` (no new file — already holds the timeout constants, imported by `login.page.ts`, imports nothing). Add the constants below.

```ts
const BASE = {
  // playwright.config defaults (preserved)
  test: process.env.CI ? 60_000 : 30_000, expect: 5_000, action: 10_000, navigation: 30_000,
  // element / form / dialog (preserved)
  elementVisible: 5_000, formInput: 10_000, saveEnablePoll: 10_000,
  fieldValidation: 5_000, dialogWait: 5_000, dialogHidden: 10_000,
  // tab/content readiness — the genuinely-15s content/grid/table waits → 30s (deliberate; see Phase 2)
  tabReadiness: 30_000, pageReload: 30_000,
  // waitForAngularStable default (number only; behaviour unchanged — base-page.ts:222)
  angularStable: 10_000,
  // Radix (values preserved; .catch BEHAVIOUR is PLAN_WAIT_PATTERN_CLEANUP, not here)
  radixOpen: 3_000, radixClick: 5_000, radixHidden: 3_000, radixHiddenFast: 2_000,
  // the 6 named optional waits — centralized at current values (honors user "All 6")
  scrollInto: 3_000, spinnerHidden: 5_000, notificationProbe: 3_000, healthCheck: 10_000,
  // auth/login — values PRESERVED, no silent cut
  loginPageLoad: 60_000, loginAction: 15_000, loginElementWait: 20_000,
  authGoto: 78_000, authValidateGoto: 90_000,
  ssoDashboard: 60_000,      // performSsoLogin Dashboard wait (auth-storage:187)
  validateDashboard: 30_000, // validateState wait — DISTINCT, NOT 60s (auth-storage:112)
} as const;

const TEST_BUDGET_BASE = {
  standard: 60_000, extended: 90_000, heavy: 120_000, bulk: 180_000, bulkMax: 240_000,
  authSetup: 300_000,   // auth.setup.ts:26
  authWorker: 300_000,  // fixtures.ts:296 worker fixture
} as const;
```

**[Finding #4 — eval-order fix, MANDATORY] The multiplier must be read AFTER env files load.** `playwright.config.ts:8` calls `dotenvFlow.config()` *after* its import block, so a top-level `const MULT = Number(process.env.TIMEOUT_MULTIPLIER)` frozen at import time would read `undefined` for a multiplier set in a `.env` file → silently ignored at config-level AND runtime. Fix with ONE of:
- **(a) preferred** — expose a getter/function so the multiplier is read at access time: `export const TIMEOUTS = new Proxy({}, { get: (_, k) => Math.round(BASE[k] * mult()) })` (or a `t('action')` helper), where `mult()` reads `process.env.TIMEOUT_MULTIPLIER` each call. Config reads inside `defineConfig()` (after dotenv ✓); page objects read at runtime (after dotenv ✓).
- **(b) alternative** — `app-constants.ts` calls `dotenvFlow.config({ path: …, node_env: process.env.CI_ENV||'local', silent: true })` at its top before computing `MULT` (it is imported first; dotenv-flow won't override real shell vars).

Pick whichever is cleaner in review; **the verification test (Phase 3) that sets `TIMEOUT_MULTIPLIER` in the `.env` file and asserts a config-level AND a runtime timeout both scale is the gate** — it must pass.

**Value-preserving migration map** (login currently: `PAGE_LOAD_TIMEOUT_MS`=60s `:28`, `ACTION_TIMEOUT_MS`=15s `:71`, `ELEMENT_WAIT_TIMEOUT_MS`=20s `:162`, `NAVIGATION_TIMEOUT_MS`=30s `:89,:156`):

| Old AppConstants field | New constant | Value | Note |
|---|---|---|---|
| `PAGE_LOAD_TIMEOUT_MS` (60s) | `loginPageLoad` | 60s | |
| `ACTION_TIMEOUT_MS` (15s) | `loginAction` | 15s | **NOT** `action` (10s) |
| `ELEMENT_WAIT_TIMEOUT_MS` (20s) | `loginElementWait` | 20s | **NOT** `elementVisible` (5s) |
| `NAVIGATION_TIMEOUT_MS` (30s) | `navigation` | 30s | already 30s — clean |

Remove the 4 `*_MS` static fields after repointing `login.page.ts`. (Note 2026-06-03: `AppConstants.NOTIFICATION_SELECTORS` and `custom-matchers.ts` were removed by the deliverable slop audit — the old "keep NOTIFICATION_SELECTORS"/"repoint custom-matchers.ts:39 → notificationProbe" steps are now moot; `notificationProbe` is no longer needed unless a future consumer wants it.) **Wire `playwright.config.ts`**: `timeout`/`expect.timeout`/`actionTimeout`/`navigationTimeout` → the constants, add `globalTimeout`. **Do NOT change `retries`** (leave `CI?2:1`). **Do NOT touch `trace`** — already `on-first-retry` at `:79`.

**Gate:** `npm run typecheck` clean + 2 representative specs pass vs baseline.

---

## Phase 2 — Migrate reusable-tier literals (per file, value-preserving) + the 15s→30s readiness promotion

Every **reusable-tier** timeout literal → the matching constant at its CURRENT value (incl. the 6 named waits + `base-page.ts:208` spinner 5s, `:536/582` listbox-hidden 3s/2s, `:568` scroll 3s, `:222` angularStable 10s; `global-setup.ts:106,120` health-check 10s).

**The ONLY deliberate value change** — promote the genuinely-15s **content/grid/table-visibility readiness** waits to `tabReadiness` (30s). Authoritative list from Phase-0 grep (verified 2026-06-03): `location-notes.page.ts:38/45/46/218`, `location-currency.page.ts:54`, `location-legal.page.ts:38/45/71/80`, `local-office-history.page.ts:36`, `location-management-history.page.ts:34/71`, `location-left-panel-basic-information.page.ts:174`. **This is a consistency/robustness change, explicitly NOT the flake fix** (the recorded flake is at an already-30s wait). Do NOT promote: `login.page.ts:51` (login flow → `loginElementWait`-class), the checkbox actions `location-left-panel-basic-information.page.ts:127/131` (action), `location-auto-addon.page.ts:79/124` (dialog/checkbox → `dialogWait`/`elementVisible`), and the non-tier one-offs (`:88` `Date.now()+15_000`, `:325` default param) — those keep their current value (centralized as the matching tier where one fits, else left with a comment).

**No bulk find-replace.** Per file: identify each literal's semantic role → map to the named constant → `npm run typecheck` + run that file's spec individually vs the Phase-0 baseline. Regression → STOP + RCA (LR-024) before continuing.

---

## Phase 3 — Test budgets + auth-budget fix (BLOCKING gate)

1. Centralize the ~154 `.setTimeout(` calls → `TEST_BUDGETS.*` + describe-level defaults per MNT-010 **where the value is unconditional**. **Conditional `setTimeout`s stay conditional** — e.g. `location-local-information.spec.ts:298` `if (bc.valid) test.setTimeout(90_000)` becomes `if (bc.valid) test.setTimeout(TEST_BUDGETS.extended)` (swap the number; do NOT move to a describe default — a describe default can't express the `if`). Per-file typecheck + spec run vs baseline.
2. **[BLOCKING] Auth-budget fix — math against the REAL call graph (Finding #1).** Earlier math modeled ONE `validateState` and a non-existent fixtures retry loop. Verified reality:
   - `auth.setup.ts` can run `validateState` **twice** in one setup: fast-path `:34`, then under-lock re-check `:51` (on the stale→peer-refresh path) — *before* `performSsoLogin` (3-attempt loop, `:73-92`).
   - `fixtures.ts` worker path has **NO retry loop**: `refreshSharedState` (`:200`) does one `validateState` `:213` + one `performSsoLogin` `:230`, then the primary `goto(78s)` `:286` + Dashboard `waitFor(60s)` `:289`, inside `{ scope:'worker', timeout: 300_000 }` `:296`.
   - Note: gotos use fast `waitUntil` (`domcontentloaded` for `validateState`), so a stale check resolves at ~`goto(fast)+validateDashboard` (~32s), not the full 90s cap — but the budget proof must still model **both** `validateState` calls + the SSO loop, not assume the 90s cap.
   - **Fix:** scale `authSetup`+`authWorker` via the multiplier; cap `validateState` `MAX_TRIES` 3→2 (this IS a resilience change — list it in deltas); write the worst case for the two-call `auth.setup` path AND the single-pass `fixtures` path at MULT=1 **and** MULT=2 into the Execution Summary; **verify empirically** (force-stale run) before rollout. (The 78s `load`→`domcontentloaded` change is OUT — `PLAN_WAIT_PATTERN_CLEANUP`.)
3. **[Finding #4 verification]** Add/run a check: set `TIMEOUT_MULTIPLIER=2` **in the `.env` file** (not just the shell) and assert a config-level timeout (e.g. `actionTimeout`) AND a runtime timeout both scale to 2×. Then document `TIMEOUT_MULTIPLIER` (default 1; >1 for a degraded box only — NEVER the standard CI value) in `config/environments/.env.e2e` comment + `clients/encore/README.md`.
4. Full suite once at MULT=1, once at MULT=2 (sanity) vs baseline.

---

## Stale-cleanup — what becomes stale (LR-050)

1. **Removed:** the 4 `AppConstants.*_MS` static fields — verify `rg "PAGE_LOAD_TIMEOUT_MS|ACTION_TIMEOUT_MS|NAVIGATION_TIMEOUT_MS|ELEMENT_WAIT_TIMEOUT_MS" clients/encore` returns 0 after Phase 1.
2. **Corrected:** `clients/encore/CLAUDE.md:4` stack line "Angular + Radix UI" → React/Next.js + next-auth. Verify the string no longer claims the app stack is Angular.
3. **Replaced:** reusable-tier literals → named constants — verify `rg "timeout:\s*\d" clients/encore/src clients/encore/specs` matches only `app-constants.ts` + the documented one-offs (45s account-search, 4s SSL probe, `Date.now()+N`, default params, `waitForTimeout` sleeps), each carrying a clarifying comment.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

For any adjacent fix noticed that is (GARDENER) + (same file/module) + (5–30 min) + (no user input): DO-NOW / SPAWN (`mcp__ccd_session__spawn_task`) / APPEND (grep-verified line into a named pending plan). Bare "out of scope" with no recipient = HALT + ask (LR-040/LR-046). Wait-pattern items (clickWithRetry, sleeps, Radix `.catch`, 78s goto) → recipient `PLAN_WAIT_PATTERN_CLEANUP.md`. The Notes flake → recipient: the parked flake-RCA item (do NOT fold into this plan).

---

## Per-Identity Satisfaction

This plan modifies `.spec.ts` files, so the matrix is required (LR-048 v3). All spec edits are **mechanical timeout-literal/`setTimeout` swaps with NO change to TC IDs, titles, count, or assertions** — FCC/MD/XLSX parity unaffected (LR-ENC-002 framework-internal). Any inadvertent `test('TC-...')` ID/title change is out of scope and must be reverted. (Cell explanations live in the footnote below, not in the cell — C6 requires the cell to be exactly a path / `(skipped: …)` / `(none)`.)

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | old-site-baseline / REQUIREMENTS.md | (none) | (none) |
| GIVER | test-cases / test-plans / XLSX | (none) | (none) |
| BUILDER | specs/**/*.spec.ts | (none) | (none) |
| HEALER | per-fix MD update | (none) | (none) |
| WATCHDOG | findings table | (none) | (none) |
| GARDENER | framework src refactor | clients/encore/src/core/app-constants.ts | `cd clients/encore && npm run typecheck` clean |

> Matrix footnotes (why each `(none)`): HUNTER/GIVER/BUILDER — no requirement/TC added/removed/renamed; only mechanical timeout-literal & `setTimeout` swaps, parity unaffected. HEALER — not RCA-driven (the Notes flake RCA is parked separately). WATCHDOG — not audit-driven.

---

## Acceptance criteria (LR-040 / LR-055 closure gate)

- [ ] Behaviour-preserving at MULT=1 **except these listed deltas**: (a) the genuinely-15s content/grid/table readiness waits → 30s; (b) an inert `globalTimeout` ceiling (fires only past 60min); (c) `validateState` `MAX_TRIES` 3→2 (resilience change); (d) the multiplier eval-order code change. Baseline pass-set otherwise unchanged.
- [ ] Value-preserving migration: login keeps 15s/20s/60s/30s; `validateState` keeps **30s** (distinct from the 60s SSO wait).
- [ ] Reusable tiers + the 6 named waits resolve to constants; the documented one-offs (45s account-search, 4s SSL probe, `Date.now()+N`, default params, `waitForTimeout` sleeps) remain with a clarifying comment (NOT a "zero hardcoded" claim).
- [ ] **Multiplier works from a `.env` file** (Finding #4): config-level + runtime timeouts both scale — proven by the Phase-3 test.
- [ ] Auth budget: worst-case < scaled budget at MULT=1 AND MULT=2, math written against the two-call `auth.setup` path + single-pass `fixtures` path in the Execution Summary; worker path verified empirically.
- [ ] `TIMEOUT_MULTIPLIER` documented as default 1 / never standard CI.
- [ ] `/regression-guard` before/after = no silent breakage on touched files.
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] `node scripts/validate-plan-closure.mjs plans/done/PLAN_TIMEOUT_CENTRALIZATION.md --enforce` C6 PASS before Status→DONE (matrix cells are bare `(none)`).
- [ ] `/final-q` verdict block (GREEN | YELLOW | RED) per LR-042.

---

## Explicitly OUT of scope (parked — not drift)

- **Notes flake RCA** (wrong-parent-tab navigation gap) — separate item, parked per user 2026-06-03.
- `waitForAngularStable` call-site removal, Radix `.catch:582` behaviour, `clickWithRetry` retirement, fixed-sleep→condition swaps, `--fail-on-flaky-tests` gate — all `PLAN_WAIT_PATTERN_CLEANUP.md`.
- The dead Azure PR gate (`.ci/azure-pipelines.yml` runs `--project=chrome`/`firefox` whose `testMatch:[]` → 0 tests) — separate CI finding, not a timeout job.
- `expect.poll`→web-first conversion (~180 calls / 9 files) — separate future plan.

---

## Verification

```bash
cd clients/encore
npm run typecheck                                   # expect: clean
rg "PAGE_LOAD_TIMEOUT_MS|ACTION_TIMEOUT_MS|NAVIGATION_TIMEOUT_MS|ELEMENT_WAIT_TIMEOUT_MS" .   # expect: 0 (fields removed)
rg -n "timeout:\s*\d" src specs                     # expect: only app-constants.ts + documented commented one-offs
TIMEOUT_MULTIPLIER=1 npm test                        # expect: baseline pass-set unchanged
# .env-file multiplier test (Finding #4): set TIMEOUT_MULTIPLIER=2 in .env.local, then:
npm test                                             # expect: still green (slower); config+runtime timeouts scaled; no auth-setup timeout
node ../../scripts/validate-plan-closure.mjs ../../plans/pending/PLAN_TIMEOUT_CENTRALIZATION.md --dry-run --json   # expect: C6 PASS (C2 fills at closure)
```

---

## Handoff (post-execution)

Chat-only per `feedback_handoff_in_chat_only.md` (no obstacle claims). Summarize: SoT landed in `app-constants.ts`; reusable literals/`setTimeout`s centralized; login values preserved; multiplier proven to work from a `.env` file; auth budget fixed and proven at ×1 and ×2 against the real call graph; the documented one-offs left with comments. Confirm the Notes flake was NOT touched (parked) and `PLAN_WAIT_PATTERN_CLEANUP.md` inherits the centralized constants.
