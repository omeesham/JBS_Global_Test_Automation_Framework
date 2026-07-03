# Framework Lifecycle Refactor + Notes Spec Pilot (v2)

**Status**: DONE
**Executed**: 2026-05-21
**Closure note**: YELLOW closure — D-4 strict line missed at user-authorized RED disposition; see Execution Summary section below. (two sessions — 21:57 IST executor + ~22:30 IST closure)
**Phase 0 verdict**: `clients/encore/specs_planning/_internal/phase-0-verification-2026-05-21.md` (PROCEED with A-4 dropped — empirically refuted)
**Phase 0 baseline**: `clients/encore/specs_planning/_internal/notes-pilot-baseline-2026-05-21.md`
**Date**: 2026-05-21 (v2 — incorporates 3 independent audit passes)
> **Co-parent**: `~/.claude/plans/c-users-rutvi-claude-plans-glittery-tumb-false-green-sweep.md` (SSL onward false-green sweep + FCC_MASTER)
> **Origin slug**: `~/.claude/plans/c-users-rutvi-claude-plans-glittery-tumb-nested-orbit.md` (scratch — this file is the repo canonical copy)
**Scope**: holistic fixture-lifecycle refactor + project matrix + observability + spec hygiene sweep + CI config + Notes pilot
**PermissionMode**: full (multi-group refactor + spec/page-object edits + fixture changes + project-matrix config changes + CI text replacement)
**BrowserTool**: cli (spec execution via `npx playwright test`; trace inspection via `playwright show-trace`; no live-walk required)
**Supersedes**: v1 of this plan file (2026-05-21 morning) — same path, overwritten this PM after the 3-pass audit.

---

## Context — Why v2

V1 was independently reviewed by 3 passes:

1. **Council audit (2 auditors)** — produced a merged-findings report. Surfaced 9 verified bugs; v1 covered 4 fully + 3 partial + missed 4.
2. **Reviewer audit (in-session)** — confirmed Council gaps + flagged one misattribution in v1 (a quote attributed to `clients/encore/CLAUDE.md` was actually from `plans/pending/PLAN_ROOT_CLIENT_DEDUPE.md:152`).
3. **Auditor cross-verification (3 parallel Opus agents on direct file reads)** — verified all reviewer findings against actual code; **expanded Council Flag 1**: `browser.newContext()` skips `use:` propagation entirely — not only trace/video but viewport, locale, timezoneId, permissions.

### Convergence (3-of-3 agreement)
- BUG-1 (page fixture collision) is real — structurally provable from Playwright DI semantics + verified at 6 destructure sites.
- v1 BUG-12 (observability) was too narrow — must include the context-options gap.
- 4 missed bugs: wasted blank context (P1-4), URL-only tab guards (P2-7), unscoped tab lookup (P2-8), missing CI config (P2-9).
- v1 "14 framework bugs" framing inflated; real distinct active count ≈ 7.
- Treat BUG-1 + BUG-13 + P1-4 + context-options as ONE fixture-lifecycle refactor (Council Flag 2).
- Phase 0 empirical verification mandatory before any code change.

### V2 changes from v1
1. Drop "Remediation" from title; professional language.
2. Honest bug count (7), not inflated 14.
3. Add Phase 0 empirical verification (page-collision theory, context-options gap, trace fidelity, TC-mapping baseline).
4. Add 4 missing bugs from Council.
5. Reframe BUG-1 + BUG-13 + P1-4 + context-options gap as Group A (one workstream).
6. Pick options for previously-vague fixes (BUG-2/3/4 in Group B; access pattern in A-1).
7. Notes pilot scope includes FCC-022 (app bug) + TC-009 (concrete `Promise.race` fix).
8. Stale-slop cleanup enumerated per LR-050: diagnostics-collector duplication, dormant fixtures, stale npm script, deleted CLI snapshots.
9. Demote BUG-5/6/8/9/10/11 from "fix" list — preserve as latent/cleanup notes.

---

## Phase 0 — Empirical Verification (MANDATORY before any code change)

If any check returns unexpected output, halt and re-RCA. Do not proceed to fixes on theory alone.

### 0.1 — Page-collision theory
Insert into `location-notes.spec.ts` FCC-024 body, run `--headed --retries=0 --grep "FCC-024"`:
```typescript
console.log('PAGE-IDENTITY:', page === locationNotesPage.page, 'URL:', await page.url());
```
- **Theory holds** if output is `false ... about:blank`.
- **Theory fails** if `true ... <anything>` (no collision possible) OR `false <real app URL>` (collision exists but bare page navigated somewhere — investigate fixture chain).

### 0.2 — Context-options propagation (Council Flag 1 expanded)
Insert into any test using `locationNotesPage`:
```typescript
const vp = await locationNotesPage.page.viewportSize();
const lang = await locationNotesPage.page.evaluate(() => navigator.language);
console.log('CTX-OPTIONS:', vp, lang);
```
Project `use:` config has `viewport: 1920×1080` + `locale: 'en-US'`.
- **Gap confirmed** if viewport ≠ 1920×1080 OR language ≠ `en-US`.
- **Gap absent** if both match → A-4 scope shrinks.

### 0.3 — Trace fidelity for manual context
Run FCC-024 with `--trace=on`. Open the resulting trace.zip in `playwright show-trace`.
- **Auto-attach works** if trace shows real-app DOM operations on authenticatedSession.page.
- **Auto-attach fails** if trace is empty / shows only about:blank → A-4 must also add manual `tracing.start`/`stop` for the worker context.

### 0.4 — TC-mapping baseline (LR-024 evidence)
Run each TC individually `--headed --retries=0 --grep "<TC-ID>"`. Capture pass/fail + error message + screenshot for: FCC-022, FCC-024, FCC-025, FCC-026, FCC-027, FCC-029, TC-LOC-NTS-009, SSL-029.

Write the baseline to `clients/encore/specs_planning/_internal/notes-pilot-baseline-2026-05-21.md`. Without this artifact, any "false-green" classification is speculation.

### 0.5 — Phase 0 gate
After 0.1–0.4, write a one-page verdict at `clients/encore/specs_planning/_internal/phase-0-verification-2026-05-21.md`:
- Each check pass/fail with evidence quote.
- Final verdict: **PROCEED** (all checks confirm scope) or **HALT** (re-plan based on what's actually true).

Plan execution gated on a PROCEED verdict.

---

## Group A — Fixture-Lifecycle Refactor (one workstream, one PR)

Council Flag 2: A-1 + A-2 + A-3 + A-4 + A-5 are all symptoms of one architectural problem — `authenticatedSession` doing context lifecycle + auth refresh + probe validation + primary navigation + (skipped) context-options in one 100-line worker fixture. Treat as one refactor.

### A-1: Page fixture collision (was v1 BUG-1)
**Symptom**: 6 tests destructure built-in `page` alongside `*Page` fixture. Playwright DI creates a second test-scoped context+page (about:blank). All `page.*` operations target the wrong page.

**Verified sites**:
| File | Line | TC |
|---|---|---|
| `clients/encore/specs/locations/location-notes.spec.ts` | 471 | FCC-024 |
| `clients/encore/specs/locations/location-notes.spec.ts` | 491 | FCC-025 |
| `clients/encore/specs/locations/location-notes.spec.ts` | 512 | FCC-026 |
| `clients/encore/specs/locations/location-notes.spec.ts` | 539 | FCC-027 |
| `clients/encore/specs/locations/location-notes.spec.ts` | 593 | FCC-029 |
| `clients/encore/specs/locations/location-shared-setup-locations.spec.ts` | 484 | SSL-029 |

**Fix decision (resolves v1 vagueness)**: **rewrite the six tests to drop `page` from destructure; use `locationNotesPage.page` (or page-object equivalent)**. Reasoning over the "override `page` fixture" alternative:
- Override conflicts with intentional R14 exception at `fixtures.ts:263` (commonMethods uses bare `page`).
- Override doesn't fix A-4 (same manual context underneath).
- Spec-level rewrite surfaces the access pattern; pairs with E-1 lint rule.

**Implementation**: expose `public readonly page: Page` (or `get page()`) on the LocationNotesPage / LocationSharedSetupLocationsPage classes if not already exposed. Replace `page.*` calls in the 6 tests with `locationNotesPage.page.*` / `pg.page.*`. Each rewrite is mechanical; verify with `--retries=0 --headed` per test (LR-021: try original logic first; only restructure if still fails after fixture access is correct).

### A-2: refreshSharedState duplicates auth.setup.ts (was v1 BUG-13)
**Symptom**: Two distinct SSO login code paths — `auth.setup.ts:65-106` and `fixtures.ts:171-212` — diverge on logging, retry, error surfacing. Bug fixes in one don't propagate to the other.

**Fix**: extract `performSsoLogin(browser, config, credentials): Promise<{ ctx, state }>` into `clients/encore/src/infra/auth-storage.ts` (next to `validateState`/`writeStateAtomic`). Both call sites consume it. Each call site keeps its own retry policy + caller-specific logging, but the SSO step itself is single-sourced.

### A-3: Wasted blank context on cold-start (was Council P1-4)
**Symptom**: `fixtures.ts:214` creates a context via `newSharedContext()` before checking `stateMissing` at `:234`. If state is missing, that context is closed at `:236` and recreated at `:238`.

**Severity refinement (per auditor)**: cold-start only, once per worker. Bounded impact. Lightweight fix.

**Fix**: hoist the `stateMissing` check above `newSharedContext()`. If `stateMissing || forceStaleFirst`, run `refreshSharedState()` FIRST, then call `newSharedContext()` once.

### A-4: ~~Manual newContext skips use: propagation~~ — **DROPPED 2026-05-21 PM (Phase 0.2 + 0.3 empirically refuted)**

**Hypothesis**: `browser.newContext({ storageState })` skips `viewport`/`locale`/`timezoneId`/`permissions`/`trace` propagation from project `use:`.

**Empirical evidence (Phase 0.2)**: console.log inside FCC-024 captured viewport/locale/timezone from BOTH `locationNotesPage.page` (authenticatedSession) AND bare `page` (built-in fixture). Result:
```
PHASE0_CTX_OPTIONS_REAL: {"width":1920,"height":1080} en-US tz= America/New_York
PHASE0_CTX_OPTIONS_BARE: {"width":1920,"height":1080} en-US tz= America/New_York
```
Both contexts have identical use: settings applied. Hypothesis is wrong for Playwright Test runtime — the test runner intercepts `browser.newContext()` calls and applies the project's use: config.

**Empirical evidence (Phase 0.3)**: `trace.zip` captured with `--trace=on` shows real-app URLs from `https://cloudapps-e2e.encoreglobal.com/navigator/...` in `1-trace.network` AND navigation events to `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location` in `1-trace.trace`. The authenticatedSession context IS being traced.

**Disposition**: no action needed. Framework is already correct on this axis. SHARED_CONTEXT_OPTIONS bundle NOT introduced; manual `tracing.start/stop` NOT wired.

**Implication for strict line**: honest bug count drops from 7 to 6 (see Honest Bug Count section below). This is Phase-0-gate-authorized adjustment, NOT rescope-via-APPEND.

### A-5: Probe context leak in refreshSharedState (was v1 BUG-7)
**Symptom**: `fixtures.ts:176-181` — `probe.close()` is on the happy path. If `validateState()` throws, probe leaks.

**Fix**: try/finally around the probe block. ~5-line change.

---

## Group B — Project Matrix (was v1 BUG-2/3/4)

### B-1: Chrome/Firefox/WebKit projects auto-match without auth setup
**Verified**:
- `playwright.config.ts:96-115` (chrome): no `dependencies: ['setup']`, no `storageState`, no testMatch override.
- `playwright.config.ts:140-147` (firefox/webkit): same gap.
- Global testMatch `'specs/**/*.spec.ts'` → every spec runs unauthenticated under each.

**Fix decision (resolves v1 vagueness)**: **Option (b) — add `testMatch: []` to chrome/firefox/webkit project definitions**. Keeps them invokable via explicit `--project=chrome` for manual debugging, removes them from default `npm test`. ALSO **delete the `test:chrome` npm script at `package.json:10`** (no use case — always unauthenticated).

### B-2: chromium overlaps encore-locations + encore-local-office
**Verified**: chromium has no testIgnore. encore-locations testDir `./specs/locations`. encore-local-office testDir `./specs/local-office`. Both match location/local-office specs simultaneously — duplicate execution.

**Fix decision**: **add `testIgnore: ['specs/locations/**', 'specs/local-office/**']` to the chromium project**. Chromium becomes the generic catch-all for non-module-scoped specs; module-scoped projects own their dirs. No env-var gating, no removal — simplest fix preserving current intent.

---

## Group C — Observability (was v1 BUG-12, expanded)

### C-1: Page-topology logging in diagnosticsHandler
Add at test START in the auto-use `diagnosticsHandler` fixture (`clients/encore/src/infra/fixtures.ts:68`):
```typescript
const ctxList = authenticatedSession.context.browser()?.contexts() ?? [];
if (ctxList.length > 1) {
  Log.warn(`[diag] multi-context detected count=${ctxList.length} test="${testInfo.title}"`);
  for (const ctx of ctxList) {
    const tag = ctx === authenticatedSession.context ? 'auth' : 'other';
    for (const pg of ctx.pages()) {
      Log.warn(`[diag]   ctx=${tag} url=${pg.url()}`);
    }
  }
}
```
Catches BUG-1-class collisions in all future specs.

### C-2: Context-attached trace/video (gated on Phase 0.3)
Already covered by A-4 conditional. If Phase 0.3 confirms auto-attach works, skip. If it fails, A-4 wires the manual `tracing.start`/`stop`.

---

## Group D — Spec Hygiene Sweep

### D-1: Tab-readiness hydration race (was Council P2-6 / v1 BUG-14)
**Concrete fix (no longer "needs investigation")** in `clients/encore/src/pages/locations/location-notes.page.ts` — `clickNotesTab` method. After existing section-visible wait, add:
```typescript
await Promise.race([
  this.getElement('txtNoteInputAll').first().waitFor({ state: 'visible', timeout: 15_000 }),
  this.getElement('lblNoNotesAvailable').waitFor({ state: 'visible', timeout: 15_000 }),
]).catch((e) => Log.warn(`[tab-hydration] race lost: ${e?.message}`));
```
Same pattern for `clickLegalTab` in `location-legal.page.ts` (grep confirmed presence). Investigate other tab-navigation methods in: location-currency.page.ts, location-local-info.page.ts, location-auto-addon.page.ts, location-account-address.page.ts — fix where the wait is on a wrapper rather than content.

> **Adversarial-audit amend (2026-05-21 PM)**: silent `.catch(() => {})` replaced with `.catch((e) => Log.warn(...))` so race-lost timeouts are diagnosable. Otherwise both hydration anchors timing out becomes invisible.

### D-2: URL-only tab guards (was Council P2-7)
**Verified vulnerable beforeEach blocks (8 across 7 files)**:
- `location-account-address.spec.ts:14`
- `location-auto-addon.spec.ts:10`
- `location-legal.spec.ts:15`
- `location-currency.spec.ts:10`
- `location-local-information.spec.ts:22`
- `location-notes.spec.ts:35` AND `:640` (Notes has TWO describe blocks)
- `location-shared-setup-locations.spec.ts:15`

**Canonical fix exists** at `location-pricing.spec.ts:35-48` — uses DOM-presence check via `isOnPricingTab()`. Propagate the pattern:
- Add `isOn<Tab>Tab()` method on each page object (mirror `isOnPricingTab()`).
- Replace `url.includes('settings/location')` with `await page.isOn<Tab>Tab()` in each beforeEach.

**Page-object enumeration (adversarial-audit amend 2026-05-21 PM)**: each beforeEach maps to one page object — add `isOnAccountAddressTab` / `isOnAutoAddonTab` / `isOnLegalTab` / `isOnCurrencyTab` / `isOnLocalInfoTab` / `isOnNotesTab` / `isOnSharedSetupTab` mirroring `isOnPricingTab`'s DOM-presence pattern.

### D-3: SSL getActiveTopLevelTab unscoped (was Council P2-8)
**Verified**: `location-shared-setup-locations.page.ts:395-398` uses `.first()` on `[role="tab"][aria-selected="true"]` — matches sub-tabs (Currency/Notes/etc.) too. Currently masked by DOM ordering; brittle.

**Fix**: scope the locator. Read live aria-label of top-level tablist (via Phase 0 walk or MCP), then:
```typescript
async getActiveTopLevelTab(): Promise<string> {
  const list = this.page.locator('[role="tablist"]').first(); // verify aria-label live
  const active = list.locator('> [role="tab"][aria-selected="true"]').first();
  return ((await active.textContent()) ?? '').trim();
}
```
Or use the dedicated selector keys `tabBasicInformation` / `tabLocationManagementHistory` to scope. Verify live before commit.

### D-4: Notes Pilot — six FCC tests + TC-009 + FCC-022 + SSL-029
After Group A/B/C and D-1/D-2/D-3 land, per LR-021 try ORIGINAL test logic first; only restructure if still failing.

| TC | Action |
|---|---|
| FCC-022 | `test.fixme()` with citation `[BUG-LOC-NTS-004: Delete button vanishes on single empty row]` + file the bug at `clients/encore/reports/bugs/BUG-LOC-NTS-004.json` per LR-034 |
| FCC-024 | A-1 rewrite → `page.reload()` runs on real page → LR-021 verify |
| FCC-025 | A-1 rewrite → `page.keyboard.press('Escape')` on real page → LR-021 verify |
| FCC-026 | A-1 rewrite → `page.mouse.click(2, 2)` on real page → LR-021 verify |
| FCC-027 | A-1 rewrite → `page.locator(...).click({force:true})` on real disabled button → LR-021 verify. The `.catch(() => {})` may need re-evaluation if click now genuinely fires. |
| FCC-029 | A-1 rewrite → currency tab click on real page → LR-021 verify |
| TC-LOC-NTS-009 | D-1 hydration fix → LR-021 verify |
| SSL-029 | A-1 rewrite → `page.on('console')` attaches to real page → LR-021 verify |

Each test passes individually `--retries=0 --headed`. Run-all green per LR-018 — `npx playwright test specs/locations/location-notes.spec.ts --project=encore-locations --workers=1` shows 57 passed + 1 fixme. Update FCC catalog for Notes (`clients/encore/specs_planning/catalogs/...`) to reflect what each test ACTUALLY tests after the collision is gone.

---

## Group E — Lint Guard (prevent regression)

Add a pre-commit grep that fails on any test destructuring `page` alongside any `*Page` fixture in encore specs:
```bash
# .husky/pre-commit or pre-push
if grep -rnE "test\([^)]*async\s*\(\s*\{[^}]*[a-z][a-zA-Z]*Page[^}]*,\s*page\b" clients/encore/specs/; then
  echo "ERROR: spec destructures built-in 'page' alongside a *Page fixture (see A-1 in PLAN_FRAMEWORK_LIFECYCLE_NOTES_PILOT_V2)"
  exit 1
fi
```
Optional ESLint variant if the project later adopts a custom rule plugin.

---

## Group F — Make the One Config CI-Aware (v3 — corrected approach)

**History (per Rutvik, 2026-05-21 clarification)**: the deletion of `playwright.config.ci.ts` was **deliberate, not accidental**. A JBS colleague decided Encore ships **one config**, not two, and removed the `.ci.ts` variant on purpose. Goal was right; execution was incomplete — the colleague stopped at step 1 of a 3-step cleanup.

What the deleted `.ci.ts` actually did:
- It was a thin override on top of `playwright.config.ts`.
- Its only job: **strip out the `allure-playwright` reporter** so that Allure's `GitCommitInfo` plugin (which tries to read git history) didn't time out on CI runners with shallow clones / locked-down git access.

What the cleanup forgot:
1. Fold the Allure-skip behavior into the surviving `playwright.config.ts`.
2. Update the 4 stale references in `.ci/Jenkinsfile.ubuntu:67`, `.ci/Jenkinsfile.windows:152`, `.ci/azure-pipelines.yml:74` and `:122` to point at `playwright.config.ts` instead of the deleted file.

**Phase 0 pre-check (this session, 2026-05-21 PM)**: executor verified Allure's GitCommitInfo timeout on CI is real (not stale assumption); deferred F to avoid a naive "consolidate" that would have left Allure enabled on CI and reintroduced the original bug. Good catch.

### Fix decision (corrected — honors colleague's one-config intent)

**Do NOT recreate `playwright.config.ci.ts`.** Make the one surviving config CI-aware via a `process.env.CI` guard, and update the 4 stale references.

**Step 1 — Update `clients/encore/playwright.config.ts:44-67`** (reporter array). Replace the static `allure-playwright` entry with a runtime guard:

```ts
reporter: [
  ['list'],
  ['./src/utils/agent-reporter.ts'],
  ['html', { outputFolder: 'reports/html-report', open: 'never' }],
  ['json', { outputFile: 'reports/test-results.json' }],
  ['junit', { outputFile: 'reports/junit-results.xml' }],
  // Skip Allure on CI — GitCommitInfo plugin times out on shallow-clone runners.
  ...(process.env.CI ? [] : [['allure-playwright', { ... }]] as const),
],
```

(Cast `as const` keeps Playwright's reporter tuple type happy with the spread.)

**Step 2 — Update 4 stale CI references**. Each one currently points at the deleted `playwright.config.ci.ts`; swap to `playwright.config.ts`:
- `.ci/Jenkinsfile.ubuntu:67`
- `.ci/Jenkinsfile.windows:152`
- `.ci/azure-pipelines.yml:74`
- `.ci/azure-pipelines.yml:122`

Read each line first before edit; verify it's a string reference, not a comment.

**Step 3 — Verification**:
1. `grep -rn "playwright.config.ci" .ci/` → zero matches (CI dir clean; historical references in activity-log + handoff snapshots preserved as audit trail).
2. Local run: `cd clients/encore && npx playwright test --list` → completes; reporter array via `as const` typechecks.
3. CI sim: `cd clients/encore && CI=true npx playwright test --list` → no errors.
4. (Optional, when in real CI) confirm: pipeline completes without GitCommitInfo timeout.

### Why this beats "recreate the file"

- **Respects colleague's one-config intent** — Encore still ships exactly one Playwright config.
- **No file to keep in sync** — the CI behavior lives inline in the same file as the local behavior; one place to read, one place to edit.
- **Self-documenting** — the inline `process.env.CI ? [] : [...]` makes the "no Allure on CI" decision visible at the reporter array, not hidden in a separate file someone else can delete again.
- **Reversible without resurrection** — if Allure ever fixes GitCommitInfo on shallow clones, the guard becomes `[allure-playwright ...]` unconditionally; no file to delete.

**Note (corrects v1 mis-citation)**: the "non-functional .ci/" quote comes from `plans/pending/PLAN_ROOT_CLIENT_DEDUPE.md:152`, NOT `clients/encore/CLAUDE.md`. V1 of this plan misattributed it. (The v2 "consolidate to .ts" framing was also wrong — left Allure on for CI; v3 above corrects.)

---

## Stale-Slop Cleanup In-Scope (LR-050)

Enumerated. Each item bundled with the closest workstream PR.

1. **`diagnostics-collector.ts` duplication** — file exists at BOTH `clients/encore/src/utils/diagnostics-collector.ts` AND `src/utils/diagnostics-collector.ts`. **Grep result (2026-05-21 PM)**: root `src/utils/diagnostics-collector.ts` has ZERO importers (only `fixtures.ts` + `login.page.ts` import, both relative-resolve into `clients/encore/src/utils/`). Safe to delete root copy. Bundle with Group C PR.
2. **Stale `.playwright-cli/page-*.yml` snapshots** — 30+ deleted in git status (uncommitted). Commit the deletion as part of any Group A PR.
3. **`test:chrome` npm script** at `package.json:10` — remove (Group B-1 makes it inert).
4. **Dormant fixtures**: `commonMethods` (`fixtures.ts:262`), `loginPage` (`:275`), `homePage` (`:284`) — grep confirmed zero spec usage. Default: delete; restore from git if needed later. Bundle with Group A PR.
5. **v1 BUG-9/BUG-10/BUG-11** — were consequences of B-1/B-2, not standalone. Neutralized by Group B fixes. No separate action.

---

## Latent / Future (documented; not in scope)

- **v1 BUG-8 (diagnostics collector listener accumulation)** — LOW impact. Address when worker test counts exceed ~50.
- **v1 BUG-5/BUG-6 (dormant fixture bare-page traps)** — dropped from "fix" via stale-slop item 4 above (delete instead).
- **Broader false-green sweep beyond Notes + SSL-029** — handed off to scratch slug `glittery-tumb-false-green-sweep` (e.g., located at `~/.claude/plans/c-users-rutvi-claude-plans-glittery-tumb-false-green-sweep`).

---

## Execution Order

| Order | Group | Risk | Notes |
|---|---|---|---|
| 1 | Phase 0 (verify) | Zero — adds console.log only | Gate on `phase-0-verification-2026-05-21.md` PROCEED verdict |
| 2 | Group B (project matrix) | Low — config-only | Eliminates duplicate execution; sets clean baseline |
| 3 | Group C-1 (logging) | Low — adds warnings only | Provides detection BEFORE the refactor lands |
| 4 | Group A (refactor) | Medium — fixture changes | One PR, A-1 through A-5 together; full Notes regression after |
| 5 | Group D-1, D-2, D-3 | Low — independent helpers | Mergeable independently |
| 6 | Group D-4 (Notes pilot) | Medium — relies on A + D-1/D-2 | Per-TC `--headed --retries=0` per LR-021/LR-018 |
| 7 | Group E (lint) | Low — preventive | Last, prevents regression |
| 8 | Group F (CI-aware single config) | Low — 1 reporter-array edit + 4 stale-ref updates | Independent; any time. Do NOT recreate `.ci.ts` — colleague's deletion was deliberate (one-config-to-ship intent); fold Allure-skip into surviving `playwright.config.ts` per `process.env.CI` guard. |
| 9 | Stale-slop cleanup | Low | Bundled into adjacent PRs |

---

## Final Verification

After all groups land:
- `cd clients/encore && npx playwright test --project=chromium --workers=1 --retries=0` — Notes module shows 57 passed + 1 fixme (FCC-022). SSL-029 passes with real console capture.
- Phase 0.1 rerun → `PAGE-IDENTITY: false ... <real app URL>` (collision gone because spec no longer destructures bare `page`).
- Phase 0.2 rerun → `CTX-OPTIONS: {1920, 1080} en-US` (A-4 applied).
- C-1 logging shows `ctxCount === 1` for every test in the run.
- BUG-LOC-NTS-004 file exists at `clients/encore/reports/bugs/`.
- Activity log row per LR-028.

---

## Out of Scope (handoff to co-parent)

- False-green sweep for SSL beyond SSL-029, Currency, Pricing, Local Info, Local Office, ECT, HIST → scratch slug `glittery-tumb-false-green-sweep` (e.g., at `~/.claude/plans/c-users-rutvi-claude-plans-glittery-tumb-false-green-sweep`)
- FCC paradigm rollout per-module → `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md`
- Cross-project state-leakage detection
- Timeout baseline re-tuning post-duplicate-execution-removal

---

## Honest Bug Count (LR-046 strict line)

**6 distinct active bugs** (was 7 pre-Phase-0; A-4 refuted empirically 2026-05-21 PM):
1. A-1 page fixture collision
2. A-2 SSO duplication (auth.setup ↔ refreshSharedState)
3. A-3 cold-start wasted context
4. ~~A-4 manual newContext context-options gap~~ — **REFUTED EMPIRICALLY** (Phase 0.2 + 0.3)
5. A-5 probe context leak
6. B project matrix (B-1 + B-2 — one effective workstream)
7. F deleted-but-incomplete CI config cleanup (v3 = make-one-config-CI-aware)

---

## Execution Summary

> Per LR-027.

**Two sessions, same calendar day 2026-05-21**:
- **Session 1 (executor, 21:57 IST)** — Phase 0 + Group A (3-of-4) + Group B + Group C-1 + Group E + Stale-slop 1. Activity log row at 21:57 IST documents per-TC verification.
- **Session 2 (closure, ~22:30 IST)** — Deferred items: Stale-slop 4 + D-3 + D-2 + D-1 + D-4 (RED, strict line missed) + A-2 + F (v3 corrected per user clarification) + BUG-LOC-NTS-004 baseline (deferred — nav2 auth refresh exceeds budget).

### Group-by-group disposition

| Group | Status | Session | Evidence |
|---|---|---|---|
| Phase 0 (verify) | DONE | 1 | `phase-0-verification-2026-05-21.md` PROCEED-with-A4-dropped + `notes-pilot-baseline-2026-05-21.md` |
| Group A-1 (6 spec rewrites) | DONE | 1 | Per-TC `--retries=0 --headed`: ALL 6 PASS; final A-1 regression grep this session: 0 matches |
| Group A-2 (SSO extract) | DONE | 2 | `performSsoLogin` in `auth-storage.ts:113+`; both callsites wired; setup project smoke PASS attempt 1/3; TC-LOC-NTS-001 smoke PASS |
| Group A-3 (hoist stateMissing) | DONE | 1 | `fixtures.ts:246-270` comment block + smoke |
| Group A-4 (context-options bundle) | **DROPPED-EMPIRICALLY** | 1 | Phase 0.2 + 0.3 refuted hypothesis; Playwright Test runner intercepts `browser.newContext()` and applies `use:` config |
| Group A-5 (probe try/finally) | DONE | 1 | `fixtures.ts:201-213` try/finally + smoke |
| Group B-1 (testMatch:[] chrome/firefox/webkit) | DONE | 1 | `playwright.config.ts` chrome:96-115/firefox+webkit:140-147 + `npx playwright test --list` verifies |
| Group B-2 (chromium testIgnore) | DONE | 1 | Verified locations + local-office overlap removed |
| Group C-1 (multi-context warning) | DONE | 1 | `fixtures.ts:84-96` with documented BUG-1-class limitation (Group E is structural defense) |
| Group C-2 (manual trace) | **DROPPED** | 1 | Merged into A-4 drop |
| Group D-1 (hydration race) | DONE | 2 | `clickNotesTab` Promise.race textarea vs empty-state + `clickLegalTab` row-0 dropdown wait; both with Log.warn diagnostics |
| Group D-2 (URL-only guards → isOnXxxTab) | DONE | 2 | 7 page objects + 8 spec beforeEach blocks updated; `grep "url.includes('settings/location')" specs/locations/` = 0 |
| Group D-3 (SSL top-level scope) | DONE | 2 | `getActiveTopLevelTab` scoped to `tabBasicInformation` / `tabLocationManagementHistory` keys instead of `.first()` |
| **Group D-4 (Notes pilot run-all)** | **RED — strict line MISSED** | 2 | Result: 56 passed + 1 fixme + 2 failed (FCC-027, NTS-016). LR-046 strict line "57 + 1 fixme" NOT MET. User authorized RED disposition. Both failures are serial-contamination class, NOT artifact-of-A-1 (verified executor 21:57 per-TC individual passes). Failures: FCC-027 second-save fires 1 POST (form-dirty leak); NTS-016 prepareEmptyRow leaves 1 Delete button visible. Per LR-021 ("only restructure if root cause is artifact-of-A-1"), neither qualifies for in-scope restructure. |
| Group E (lint guard) | DONE | 1 | `.githooks/pre-commit` regex; A-1 regression grep this session: 0 matches |
| Group F (CI-aware single config) | DONE (v3) | 2 | `playwright.config.ts:54-67` `process.env.CI ? [] : [allure-playwright] as const`; 4 stale `.ci.ts` refs swapped in Jenkinsfile.ubuntu/windows + azure-pipelines.yml; `grep ".ci.ts" .ci/` = 0; v2 "consolidate" framing corrected to v3 "fold-Allure-skip-into-one-config" per user clarification (colleague deleted .ci.ts deliberately, one-config-to-ship intent). |
| Stale-slop 1 (diagnostics-collector dedup) | DONE | 1 | Root `src/utils/diagnostics-collector.ts` deleted (zero importers) |
| Stale-slop 2 (.playwright-cli snapshots) | DEFERRED | — | Pre-existing git-status deletions; commit will handle |
| Stale-slop 3 (test:chrome npm script) | DONE | 1 | Removed as part of B-1 |
| Stale-slop 4 (dormant fixtures) | DONE | 2 | `commonMethods` / `loginPage` / `homePage` fixture defs + type entries + unused `HomePage` import + unused `Logger` import removed from `fixtures.ts`. Side-effect: `Logger.setSpecContext` call lost — was already dormant (zero spec usage of `commonMethods` fixture), no behavior change. |
| Stale-slop 5 (v1 BUG-9/10/11) | NO-OP | — | Neutralized by Group B |
| BUG-LOC-NTS-004 baseline check | **DEFERRED-PENDING-NAV2-AUTH** | 2 | Headless CLI try-it landed on Microsoft sign-in (no cached nav2 auth state in session). Updated `baselineEvidence` field with attempt details + `verificationLog`. baselineComparison stays "not-checked". Next session with nav2 auth can complete in <5 min. |
| R-3 (per-test topology check) | **SKIPPED** | — | Not in user's narrow-continue authorization. Current C-1 post-use is intentional limitation; Group E lint is structural BUG-1 defense. Adding per-test pre-use Log.warn = new behavior, scope expansion. |

### Strict-line accounting (LR-046)

- Original D-4 acceptance: **57 passed + 1 fixme**.
- Actual D-4 result: **56 passed + 1 fixme + 2 failed** (FCC-027, NTS-016).
- Gap: 2 TCs (both serial-contamination class, not artifact-of-A-1).
- User authorization recorded: "Continue A-2/F/BUG, document RED for D-4 (Recommended)" via AskUserQuestion this session.
- Disposition: RED at /final-q per LR-046. No APPEND rescope. No silent fix. Honest scorecard.

### Follow-up plan (FUTURE session, not in scope here)

A separate plan should address:
1. **Serial-contamination architectural fix** — strengthen `ensureEmptyState` / `prepareEmptyRow` cleanup helpers; consider per-test page reload baseline. Affects FCC-027 + NTS-016 + likely other run-all-only failures.
2. **BUG-LOC-NTS-004 baseline completion** — open headed CLI with `.auth/nav2-profile`, complete Microsoft SSO, `state-save -s=nav2`, navigate `/locations/1604/settings/location` Notes sub-tab, attempt delete on single empty row, update `baselineComparison` to one of (matches-baseline / regression-from-baseline / baseline-absent).
3. **R-3 per-test topology check** — if observability is desired beyond Group E lint.
4. **`Logger.setSpecContext` migration to auto-use fixture** — currently dead code after Stale-slop 4.

### Typecheck + smoke evidence

- `npx tsc --noEmit` clean throughout all 5 work-order edits (pre-existing `build-framework-vendor.ts` syntax errors unrelated; filtered).
- A-2 smoke: setup project fresh login PASS attempt 1/3 ; TC-LOC-NTS-001 PASS 7.2s.
- A-1 regression grep (`rg "test\\([^)]*async\\s*\\(\\s*\\{[^}]*[a-z][a-zA-Z]*Page[^}]*,\\s*page\\b" clients/encore/specs/`): 0 matches.
- D-4 run-all: 56 passed + 1 skipped + 2 failed (timestamp 2026-05-21 18:00 IST).

Plus: 3 spec-hygiene patterns (D-1/D-2/D-3) — code quality, not new "bugs"
Plus: 1 observability addition (C) — capability, not a bug
Plus: 1 prevention measure (E) — guard, not a bug
Plus: 5 stale-slop items — cleanup, not bugs

**This count is the strict-line claim per LR-046. Do NOT rescope via APPEND without HALT-and-ask.**
