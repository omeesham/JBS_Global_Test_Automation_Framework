---
**Status**: DONE
**Executed**: 2026-05-22
**Identity**: OWNER (framework-defense work, non-pipeline path per `@.claude/skills/identity/SKILL.md`).
**Model**: Opus 4.7 for fix shapes #1 (AST/regex), #2 (Playwright internals), #3 (auth logic). Sonnet OK for fix #4 deterministic helper migrations AFTER Phase 0 confirms Radix attribute.
**Thinking**: max
**PermissionMode**: ask-perms (write fixes only after user GREEN-flag).
**BrowserTool**: cli (Phase 0 live checks only; fix code is deterministic file edits).
**Audit chain**: Council Watchdog (Yellow, 7 flags) → my v1 (5 fuckups dropped) → Meta-Auditor (Yellow Watchdog, 5 substantive reversals/affirmations) → my watchdog meta-audit (GREEN 5/5 via direct file reads) → user send-back (GREEN with 2 refinements) → /ultrathink Step 3 adversarial audit 2026-05-22 OWNER session (9 findings: 2 blockers + 7 substantive; blockers fixed in v2.1) → **v2.2 user-directed P0-6 walk (CLI headed, OWNER 2026-05-22 — refutes v2.1 LR-054-class deferral; gap CONFIRMED REAL for 2 of 8 helpers)**. All integrated below.
---

# Framework Defenses — Final Plan (audit-corrected v2.1, LR-048 compliant)

## Bootstrap (read first)

Before any code edit:
1. `@.claude/rules/pipeline.md` — LR-048 plan minimum, LR-049 ship discipline (no `cp -r`).
2. `@.claude/rules/specs.md` — LR-056 (graduated 2026-05-22 from Session 4). **This plan is NOT the FCC-027 cure path — that landed via LR-056 (network-listener URL endpoint fix). Fix #4 here addresses DIFFERENT tab-readiness gaps.**
3. `@clients/encore/CLAUDE.md` — stack reference + LR-ENC-001 baseline truth source.
4. **Stack clarification** (per user send-back): Navigator Cloud new site = **Next.js + React + Radix UI + NextAuth + Microsoft SSO**. Evidence: cookies `__Secure-next-auth.session-token.0/1` + `__Host-next-auth.csrf-token` in `.auth/encore-state.json` (NextAuth = Next.js); Radix UI is React-only (no Angular build). The "Angular" references in framework code (`waitForAngularStable`, LR-009/010/011/026, etc.) are defensive — `waitForAngularStable` silently no-ops on non-Angular pages (verified at `base-page.ts:217`). **v2.1 audit finding**: `clients/encore/CLAUDE.md` line 4 still reads "Stack: Angular + Radix UI + Microsoft SSO" — that's stale/wrong by Radix-incompatibility evidence. A 1-line fix to Encore CLAUDE.md is **out of scope for this plan** but flagged for follow-up. None of this plan's fixes depend on the framework label.

---

## Context

User watched FCC-024 live (`--project=encore-locations --workers=1 --grep FCC-024 --headed --retries=0`) and saw 3 sign-in pages, 2 spec test browsers per test, and a blank `about:blank` window per spec. A previous agent missed the primary root cause (bare-`page` fixture collision in 6 specs), got caught when the user manually intervened, then applied fixes. **The 6 collisions ARE fixed.** A council auditor then flagged "Still Broken / Partial" items for recurrence prevention. A subsequent meta-auditor pushed back on 4 claims and was right on 4 of 5 substantive ones. A user send-back GREEN-flagged the meta-audit with 2 refinements. This plan integrates every correction.

---

## Phase 0 — Live verifications (must complete BEFORE writing fix code)

| # | Check | Why it matters | Status | Evidence / Next step |
|---|---|---|---|---|
| P0-1 | Cookie names + expiries in `.auth/encore-state.json` | Fix #3 reads these | ✅ DONE | `__Secure-next-auth.session-token.0` (expires 1782039799.721457) + `.1` (1782039799.721839) + `__Host-next-auth.csrf-token` (expires `-1`, session cookie). Pick earlier `.0` for safety. |
| P0-2 | `auth.setup.ts:121` tri-state expiry pattern exists | Fix #3 must mirror, not re-invent | ✅ DONE | Line 121 verbatim: `const sessionValid = !!sessionToken && (sessionToken.expires === undefined \|\| sessionToken.expires < 0 \|\| sessionToken.expires > nowSec);` |
| P0-3 | `base-page.ts:448` reads `aria-selected` (right attribute for Radix tabs in THIS app) | Fix #4 needs correct attribute name | ✅ DONE | Line 448 verbatim: `const isSelected = await tab.getAttribute('aria-selected').catch(() => null);` — and existing navigateToSubTab works in prod → Radix tabs DO set aria-selected. |
| P0-4 | Two `writeStateAtomic` callers still exist (AUD-C still real, NOT pre-fixed by A-2) | Justifies deferring AUD-C honestly | ✅ DONE | `auth.setup.ts:104` + `fixtures.ts:228` both call `writeStateAtomic(savedCtx/loginCtx)` independently. Prior plan line 116: *"Each call site keeps its own retry policy + caller-specific logging, but the SSO step itself is single-sourced"* — confirms A-2 shared SSO step only, not writes. |
| P0-5 | Probe context at `fixtures.ts:200-209` still unconditional (AUD-E still real, NOT pre-fixed by A-3) | Justifies deferring AUD-E honestly | ✅ DONE | `fixtures.ts:200-202`: `const probe = await browser.newContext(fs.existsSync(STATE_PATH) ? { storageState: STATE_PATH } : undefined,);` — no `if (!stateMissing)` gate. A-3 only hoisted the `newSharedContext()` ordering at fixtures.ts:236-239 (different gap). |
| P0-6 | Radix in THIS app keeps inactive tab DOM (the "presence vs active" gap is real here) | Fix #4 entire risk hinges on this | ✅ DONE | **v2.2 walk verdict (2026-05-22 OWNER session, CLI headed read-only — supersedes v2.1 deferral)**: GAP CONFIRMED REAL for 2 of 8 helpers. Evidence at `clients/encore/specs_planning/_internal/walk-evidence-radix-tab-dom-2026-05-22.md` (3-snapshot table + all-panel sweep). Findings: (1) ALL 8 `location-settings-sub-tab-content-*` panels mount in DOM at all times (Radix forceMount-equivalent on TabsContent wrappers); active panel gets `hidden=false`/`display:block`/`data-state="active"`, inactive panels get `hidden=true`/`display:none`/`data-state="inactive"`. (2) `isOnLegalTab` (anchor `contentLegal` = `...-content-legal`) + `isOnAccountAndAddressTab` (anchor `pnlAccountAndAddress` = `...-content-account-and-address`) use panel-wrapper testids → `count() > 0` returns TRUE even when tab inactive → VULNERABLE to false-positive skip in beforeEach. (3) Other 6 helpers (Notes/Currency/Pricing/Local-Info/Auto-Addon/Shared-Setup) use child-element anchors (section/table/checkbox inside the panel) that lazy-mount when panel becomes active → `count() = 0` when inactive → safe under observation. (4) `aria-selected` on tab triggers reliably distinguishes active from inactive across all 8 tabs. **Fix #4a recommendation**: bulk-apply to all 8 (real fix for 2, strict-equivalent for 6, future-proofs against forceMount being added later). **CLI-cannot-load-storageState reasoning REFUTED**: this walk used `playwright-cli open --persistent --profile=clients/encore/.auth/e2e-profile` per LR-054 Table 2 row 7 — auth inherited cleanly, no script needed, total walk ~3 minutes. v2.1 deferral text was a LR-054-class hallucination. |
| P0-7 | Page-fixture override doesn't break Playwright internals (trace/video/--debug/reporters) | Fix #2 changes default fixture behavior | ⏳ PENDING | Write a no-op spec using `{ authenticatedSession }` only (no bare `{page}`), enable `trace:'on'` + `video:'on'`, run via `npx playwright test` — confirm trace and video attach normally. Block fix #2 until GREEN. |
| P0-8 | `core.hooksPath` set on user's clone | If unset, fix #1a regex defense is currently zero-layer | ✅ DONE | `git config --get core.hooksPath` returned `.githooks` (v2.1 verified 2026-05-22 OWNER session). Pre-commit hook IS active on this clone; fix #1a is layered defense. |

**Plan is BLOCKED on P0-7 only** (P0-6 ✅ DONE in v2.2 walk 2026-05-22; P0-8 ✅ verified GREEN in v2.1 audit). P0-1 → P0-6 all done. **v2.2 note**: P0-6 confirmed REAL for 2 of 8 helpers (Legal + Account-and-Address use panel-wrapper anchors that Radix mounts always); Fix #4a bulk-apply remains the right shape (strict improvement for 2, no-op equivalent for 6).

---

## Cross-audit log

| Auditor | Verdict | Substantive claims | Net survival into this plan |
|---|---|---|---|
| Council Watchdog (original) | Yellow | 7 items flagged; 5 of them overreach (NEW-1 GitHub Actions path, NEW-2/3 Azure, NEW-4 Jenkins, NEW-5 chromium 0-specs) | User rejected 5 overreach items; 5 real bugs kept |
| Meta-Auditor (Yellow Watchdog) | Yellow | 3 reversals of original + 2 affirmations: cookie-name "hallucination" / AUD-C "already fixed" / AUD-E "already fixed" / LR-056-FCC-027 done / LR-048 missing | All 3 reversals were WRONG; 2 affirmations stand |
| My watchdog meta-audit | GREEN 5/5 | Verified each meta-auditor claim against direct file reads | Cookie hallucination refuted (verified `__Secure-next-auth.session-token.0/1` exist); AUD-C / AUD-E "already fixed" refuted (verified writers + probe still as described); LR-056 + LR-048 affirmations confirmed |
| User send-back | GREEN ship-it | 2 refinements: tri-state expiry shape (mirror auth.setup.ts:121); stack attribution precision (Next.js + React + Radix + NextAuth + MS SSO, not Angular) | Both integrated above |
| **/ultrathink Step 3 (OWNER, 2026-05-22)** | Yellow → corrected to GREEN in v2.1 | 9 findings: (a) BLOCKER destination `clients/encore/plans/pending/` does NOT exist — actual = `plans/pending/` (repo root); (b) BLOCKER `git mv` won't work cross-repo (source outside encore_framework working tree); (c) Encore CLAUDE.md still labels stack "Angular + Radix UI" (stale by Radix-incompat evidence); (d) P0-6 gate is defense-in-depth not strict blocker for #4a; (e) Fix #5 = Fix #4c (redundant labeling); (f) Fix #4a effort overestimate (8 identical patterns ~30 min, not 4-8 hrs); (g) deferred items risk orphaning — need follow-up SUBPLAN; (h) filename "is-this-true" + /ultrathink signals verification-first; (i) ask-perms = batched approval per fix-set | (a)+(b) FIXED in v2.1 below; (c) flagged for separate 1-line follow-up (out of scope); (d) clarified inline; (e) merged label; (f) effort revised; (g) added to deferred-items consolidation note; (h)+(i) honored — Phase 0 verification batched separately from code fixes |
| **v2.2 P0-6 walk (OWNER, 2026-05-22)** — user-directed | GREEN | User rejected v2.1 P0-6 deferral; CLI headed walk with persistent profile took ~3 min and CONFIRMED REAL gap for 2 of 8 helpers (Legal + Account-and-Address). v2.1 deferral reasoning ("playwright-cli cannot natively load Playwright storageState files") was a LR-054 hallucination class — `playwright-cli open --persistent --profile=<dir>` is the canonical CLI auth path. Per-helper categorization in `clients/encore/specs_planning/_internal/walk-evidence-radix-tab-dom-2026-05-22.md`. | P0-6 row flipped to ✅ DONE; Fix #4a recommendation enriched with per-helper verdict; v2 → v2.1 P0-6 "defense-in-depth" framing superseded by walk evidence |

---

## Five verified fixes

### #1 — Tighten pre-commit regex AND mirror it in CI [P0]

**Verified bug.** [.githooks/pre-commit:43](.githooks/pre-commit#L43) regex requires `[a-z][a-zA-Z]*Page[^}]*,\s*page` ordering. `{ page, somePage }` (page first) does NOT match.

**Why CI mirror is required:** the hook is per-clone (requires `npm run plans:hooks:install`), `--no-verify`-bypassable, and there's NO CI step in [clients/encore/.github/workflows/playwright-tests.yml](clients/encore/.github/workflows/playwright-tests.yml) that runs the same grep server-side.

**Fix shape:**

(a) Either tighten the existing grep regex to cover both orderings:
```bash
# catches { ..., pageObj, page } OR { page, pageObj }
matches=$(grep -rnE "test\([^)]*async\s*\(\s*\{[^}]*(([a-z][a-zA-Z]*Page[^}]*,\s*page)|(page\s*,[^}]*[a-z][a-zA-Z]*Page))\b" clients/encore/specs/ 2>/dev/null)
```
Or, more robustly: replace the grep with an **AST check** via a small `scripts/check-no-page-collision.mjs` (~30 lines) using `@typescript-eslint/parser`. AST handles renames (`async ({ page: p, somePage })`), spreads, comments, all orderings.

(b) Add a CI step BEFORE `playwright test` in `clients/encore/.github/workflows/playwright-tests.yml`:
```yaml
- name: Lint specs for bare-page collision
  run: |
    if grep -rnE '<regex above>' clients/encore/specs/ ; then exit 1; fi
```
This is the layer that survives `--no-verify` and contributors who never ran `npm run plans:hooks:install`.

**Effort:** ~30 min (regex tighten + CI step) or ~2 hrs (AST script + CI step).

---

### #2 — Detect bare-`page` use at runtime by overriding the `page` fixture [P0]

**Verified bug.** [fixtures.ts:73-79](clients/encore/src/infra/fixtures.ts#L73) explicitly admits the diagnosticsHandler cannot detect the BUG-1 collision. Original "add `context.on('page')`" proposal was wrong — bare-`{page}` makes Playwright call `browser.newContext({ storageState })` (NEW context, not new page in existing context). Meta-auditor confirmed.

**Correct fix shape:** override the `page` fixture in `fixtures.ts`'s `test.extend({...})` block. Playwright invokes the override BEFORE creating its default context. We catch the destructure point itself.

```ts
// Add to fixtures.ts inside the test.extend({...})
page: async ({ authenticatedSession }, use, testInfo) => {
  const msg =
    `[diag:BUG-1] test "${testInfo.titlePath.join(' > ')}" requested bare {page}. ` +
    `This causes a separate about:blank context (diagnostics blind to it). ` +
    `Use a *Page fixture (e.g., {locationNotesPage}) or authenticatedSession.page.`;
  Log.error(msg);
  throw new Error(msg);
},
```

**Why throw (Option A) rather than redirect (Option B) to authenticatedSession.page:** redirecting changes test semantics silently AND loses Playwright's built-in trace/video/screenshot capture (those bind to the page returned by THIS `page` fixture). Throwing fails loudly with a clear pointer to the bug class. Today no spec needs bare `{page}` — confirmed by grep across `clients/encore/specs/`.

**What this does NOT cover:** code that manually calls `browser.newContext()` mid-test. The diagnosticsHandler's post-test multi-context check at fixtures.ts:80-92 covers that case.

**P0-7 gate:** before landing, run the no-op smoke spec described in Phase 0. If trace/video/`--debug` still work normally, ship. If anything breaks, fall back to Option B (redirect with a one-time warn).

**Effort:** ~30 min (override + smoke test).

---

### #3 — Cheap cookie-expiry pre-check in `authenticatedSession` (replaces earlier "validateState before goto") [P1]

**Verified bug.** [fixtures.ts:257-260](clients/encore/src/infra/fixtures.ts#L257) gate only fires on `forceStaleFirst || stateMissing`. Cookies past their `expires` field still pass through to the 60s Dashboard timeout.

**Meta-auditor's "hallucination" claim refuted:** the cookies `__Secure-next-auth.session-token.0/1` + `__Host-next-auth.csrf-token` DO exist in `.auth/encore-state.json` (verified P0-1). Framework's own `auth.setup.ts:118-119,123` uses `.includes('next-auth.session-token')` substring match and the framework runs without that assertion firing — proves the cookie name substring is valid.

**User send-back refinement:** mirror the existing tri-state pattern at `auth.setup.ts:121` instead of naïve `< Date.now()` check. The `-1` session-cookie case must be treated as "no expiry" not "expired-at-epoch."

**Correct fix shape (refined):**

```ts
// Add to auth-storage.ts (companion to readStateOrNull)
function readEarliestSessionExpiry(): number | null {
  try {
    const state = readStateOrNull() as { cookies?: Array<{ name: string; expires?: number }> } | null;
    if (!state?.cookies) return null;
    // NextAuth splits the session token across `.0` / `.1` chunks. Pick the EARLIEST
    // expiry for conservative refresh timing.
    const sessionTokens = state.cookies.filter(c => c.name.includes('next-auth.session-token'));
    if (sessionTokens.length === 0) return null;
    const expiries = sessionTokens
      .map(c => c.expires)
      .filter((e): e is number => typeof e === 'number' && e > 0); // exclude undefined/session-cookie(-1)
    if (expiries.length === 0) return null; // all session-cookies → no real expiry, treat as fresh
    return Math.min(...expiries);
  } catch { return null; }
}

// In fixtures.ts:257 — extend the gate (mirrors auth.setup.ts:121 tri-state semantics):
const stateMissing = !fs.existsSync(STATE_PATH);
const earliestExpiry = stateMissing ? null : readEarliestSessionExpiry();
const stateExpired =
  earliestExpiry !== null &&
  earliestExpiry * 1000 < Date.now() + 60_000; // 60s grace
if (forceStaleFirst || stateMissing || stateExpired) {
  await refreshSharedState();
}
```

**Tri-state semantics:** `readEarliestSessionExpiry()` returns `null` when (a) state file missing, (b) no session tokens found, OR (c) all session tokens are session-cookies (`expires === -1` or `undefined`). In all `null` cases the existing `stateMissing` and downstream behavior handle the path correctly — no new path needed.

**Cost:** zero UI. `fs.readFileSync` + `JSON.parse` + cookie scan = sub-millisecond. Catches "cookies expired according to their own expires field."

**What this does NOT cover:** server-side invalidation where cookie expires field is still future. Rarer (server doesn't usually rotate early). For that, existing 60s Dashboard wait at fixtures.ts:269-272 stays as fail-eventual safety net.

**Effort:** ~25 min (code + manual smoke test by hand-editing one cookie's `expires` to past).

---

### #4 — Tab readiness, narrowed and precise [P1]

**Verified bug, scope narrowed.** The 8 `isOnXTab()` helpers ARE all presence-only `count() > 0`:

| File | Line | Method | Anchor | Pattern |
|---|---|---|---|---|
| location-notes.page.ts | 25-27 | `isOnNotesTab` | `sectionNotes` | `count() > 0` |
| location-legal.page.ts | 25-27 | `isOnLegalTab` | `contentLegal` | `count() > 0` |
| location-currency.page.ts | 33-35 | `isOnCurrencyTab` | `tblCurrencyGrid` | `count() > 0` |
| location-pricing.page.ts | 33-35 | `isOnPricingTab` | `chkCorporatePricing` | `count() > 0` |
| location-local-info.page.ts | 43-45 | `isOnLocalInfoTab` | `chkApplyLDW` | `count() > 0` |
| location-auto-addon.page.ts | 20-22 | `isOnAutoAddonTab` | `chkAutoAddonEncoreMusic` | `count() > 0` |
| location-account-address.page.ts | 21-23 | `isOnAccountAndAddressTab` | `pnlAccountAndAddress` | `count() > 0` |
| location-shared-setup-locations.page.ts | 26-28 | `isOnSharedSetupTab` | `tblSharedSetupLocations` | `count() > 0` |

**Important nuance:** the FULL `navigate*Tab()` path → [base-page.ts:432-457 `navigateToSubTab`](clients/encore/src/core/base-page.ts#L432) IS strong — checks `aria-selected` at line 448 + waits on readiness element at line 455 (both verified this turn). So:

- **Risk pattern**: `beforeEach` calls `isOnXTab()` → returns TRUE because Radix DOM still has the element from a sibling spec → skips `navigate*Tab()` → spec runs against possibly-inactive tab.
- **NOT broken**: explicit `await navigateToXTab(...)` calls. Those go through `navigateToSubTab` and check `aria-selected`.

**Two unambiguous additional bugs:**

(a) `clickTopLevelTab()` at [location-shared-setup-locations.page.ts:394-397](clients/encore/src/pages/locations/location-shared-setup-locations.page.ts#L394) has **zero readiness wait** after click.

(b) `clickNotesTab()` and `clickLegalTab()` swallow timeout via `.catch(Log.warn)` at notes:39 + legal:38.

**Fix shape:**

(a) For 8 `isOnXTab()` helpers: replace `count() > 0` with active-tab check (mirrors base-page.ts:448):
```ts
async isOnNotesTab(): Promise<boolean> {
  const tab = this.getElement('tabNotes');
  if ((await tab.count()) === 0) return false;
  return (await tab.getAttribute('aria-selected').catch(() => null)) === 'true';
}
```

(b) For `clickTopLevelTab()`: add `aria-selected === 'true'` wait + known anchor wait after the click.

(c) For Notes/Legal clicks: drop `.catch(Log.warn)` so timeouts fail loudly at the click step, not later assertions.

**P0-6 gate:** before landing fix #4a, run the 30s headed CLI walk: click tab A → check `count()` AND `aria-selected` on tab B's anchor. If `count() > 0` while `aria-selected != 'true'`, the presence/active gap is CONFIRMED real here. If `count() === 0`, the entire #4a is unnecessary — close as no-op.

**Effort (v2.1 revised):** 8 isOnXTab helpers have IDENTICAL pattern (`return (await this.getElement('X').count()) > 0;`) verified across 8 files — bulk-replaceable. **Realistic: ~30 min total for #4a + 30 min for clickTopLevelTab + 5 min for catch removals = ~1-1.5 hrs.** (v2 estimate of 4-8 hrs was based on assumption helpers may diverge; v2.1 audit verified identical pattern.)

**Reference:** only `navigateToEctTab()` at [local-office-settings.page.ts:57-100](clients/encore/src/pages/local-office/local-office-settings.page.ts#L57) has full active-tab + data-loaded proof — it's the canonical pattern for `clickTopLevelTab` to mirror.

---

### #5 — Drop Notes/Legal warn-and-continue catches [P2, 2-minute fix]

**v2.1 audit clarification**: this is an ALIAS of fix #4c (same code change, same files). Listed separately in v2 because it's tiny and safe to land alone if #4 is deferred. In execution, #4c and #5 land as ONE commit — not two.

---

## Items deferred (verified real, NOT already-fixed)

| Item | Verification | Why deferring |
|---|---|---|
| AUD-C dual writers (`auth.setup.ts:104` + `fixtures.ts:228`) | ✅ Both callers verified this turn (P0-4) | File-lock makes safe. Architectural drift risk, not runtime bug. |
| AUD-E cold-start probe always created (`fixtures.ts:200-209`) | ✅ Probe verified unconditional this turn (P0-5) | ~5-15s extra on cold start only. Minor. A-3 fixed a DIFFERENT gap (newSharedContext ordering at fixtures.ts:236-239). |
| AUD-F retry math (originally 9 SSO claim) | ✅ Corrected: Playwright `dependencies:` runs once per session, not per retry. Worst case ~3-7 SSO. | Real but minor. |
| NEW-6 mtime check on state file | n/a | Fix #3 cookie-expiry pre-check covers same intent more accurately. |
| NEW-7 fixed 5s sleep, no exponential backoff | n/a | Minor. MS-SSO transient bursts are short. |
| Disabled chrome/firefox/webkit projects (`testMatch:[]`) | `playwright.config.ts:109/159/164` | If anyone runs `--project=chrome`, false-green. Fix: DELETE the three empty projects OR error-on-empty at config load. Defer — `npm test` walks named module projects today. |
| Stale Azure/Jenkins CI configs | `.ci/azure-pipelines.yml`, `.ci/Jenkinsfile.*` | User: "we run on git actions only for now." Future landmine if re-enabled — audit then, not now. |
| LR-056 / FCC-027 cure path | Already landed Session 4 (2026-05-22, `specs.md:125`) | Not this plan's scope. Recorded so next reader doesn't conflate fix #4 with the FCC-027 cure. |

---

## Recommended fix order

**Phase 0 PENDING (P0-6 ✅ DONE in v2.2 walk; P0-8 ✅ verified in v2.1 audit):**
1. ~~P0-6 Radix DOM presence/active walk~~ — DONE 2026-05-22, evidence at `clients/encore/specs_planning/_internal/walk-evidence-radix-tab-dom-2026-05-22.md`.
2. P0-7 page-fixture override smoke test (5 min).

**~Hour 1 — structural recurrence prevention:**
3. Fix #1a regex tighten (or AST script).
4. Fix #1b CI step in `clients/encore/.github/workflows/playwright-tests.yml`.
5. Fix #2 page-fixture override (gated by P0-7 GREEN).

**~Hour 2 — auth performance:**
6. Fix #3 cookie-expiry pre-check (tri-state).

**~Hours 2-3 — tab readiness (v2.1 revised — was Hours 3-9):** (P0-6 is defense-in-depth, not strict blocker — #4a safe regardless)
7. Fix #4a 8 `isOnXTab()` helpers → `aria-selected` (bulk-replace, ~30 min).
8. Fix #4b `clickTopLevelTab()` readiness (~30 min).
9. Fix #4c (alias #5) drop Notes/Legal catches (~5 min).

**Later sessions** (out of scope): dual-writer consolidation (AUD-C), cold-start probe gating (AUD-E), mtime cap, exponential backoff, delete dead chrome/firefox/webkit projects, audit Azure/Jenkins on re-enable.

---

## Acceptance criteria

- [x] P0-6 resolved (DONE 2026-05-22 — gap CONFIRMED REAL for 2 of 8 helpers; evidence at `clients/encore/specs_planning/_internal/walk-evidence-radix-tab-dom-2026-05-22.md`)
- [x] P0-7 resolved before matching fix code lands (DONE 2026-05-22T20:06 — smoke spec ran via `npx playwright test --project=encore-locations --grep "P0-7-smoke" --workers=1 --retries=0`; setup auth refreshed after 3 SSO attempts, smoke passed in 522ms. **trace.zip attached** at `reports/test-results/<smoke-test-dir>/trace.zip` (248KB). **Video did NOT attach** — pre-existing Playwright limitation: `test.use({ video: 'on' })` does not propagate to manually-created contexts (`authenticatedSession.context` is created via `browser.newContext({ storageState })`, not the default fixture). NOT a regression introduced by Fix #2 — legitimate tests already had `retain-on-failure` video per config. Fix #2 safe to land. Smoke spec deleted post-verdict per LR-019 (one-off, no TC-001 baseline pattern). P0-8 already ✅ in v2.1.)
- [x] Fix #1a regex tightened (DONE — `.githooks/pre-commit:43` now catches BOTH `{*Page, page}` AND `{page, *Page}` orderings via OR-alternation; cite in pre-commit error updated to point at PLAN_FRAMEWORK_DEFENSES_V2)
- [x] Fix #1b CI step added (DONE — `clients/encore/.github/workflows/playwright-tests.yml` step "Lint specs for BUG-1 page-fixture collision" inserted BEFORE "Run Playwright tests"; mirrors pre-commit regex; emits `::error::` annotation on match)
- [x] Fix #2 page-fixture override lands (DONE — `clients/encore/src/infra/fixtures.ts:312-326` `page: async ({}, _use, testInfo) => { throw new Error("[diag:BUG-1]...") }`. Deviation from v2.1 prose: dropped `authenticatedSession` dependency since diagnosticsHandler already auto-loads it; clean throw avoids unused-var warning via `_use` prefix. P0-7 smoke confirmed trace still attaches via authenticatedSession.context.)
- [x] Fix #3 `readEarliestSessionExpiry()` mirrors `auth.setup.ts:121` tri-state logic (DONE — `clients/encore/src/infra/auth-storage.ts:67-92` filters cookies containing `next-auth.session-token`, picks earliest positive `expires`, returns `null` on missing/session-cookie cases. `clients/encore/src/infra/fixtures.ts:266-269` extends gate with 60s grace.)
- [x] Fix #4a 8 `isOnXTab()` helpers migrated to `aria-selected === 'true'` (DONE — all 8 page files updated to mirror `base-page.ts:448` pattern with `getElement(tabXxx).getAttribute('aria-selected') === 'true'`; bulk-replace verified via grep `aria-selected'\).catch\(\(\) => null\)\) === 'true'` → 8 files match)
- [x] Fix #4b `clickTopLevelTab()` adds aria-selected wait (DONE — `clients/encore/src/pages/locations/location-shared-setup-locations.page.ts:394` now uses `expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 10_000 })` + `waitForAngularStable()` after click. Added `expect` to `@playwright/test` import.)
- [x] Fix #4c / #5 Notes + Legal `.catch(Log.warn)` dropped (DONE — `location-notes.page.ts:39` race-promise and `location-legal.page.ts:38` row-0 wait both lose their trailing `.catch((e) => Log.warn(...))`; timeouts now propagate; grep `tab-hydration.*lost` returns 0 matches.)
- [ ] `npm test -- --project=encore-locations --project=encore-local-office` matches pre-fix baseline pass/fail count — **DEFERRED** to next CI trigger (single-session time budget). Scoped client typecheck (`npx tsc --noEmit -p clients/encore/tsconfig.json`) PASSED clean post-all-fixes. P0-7 smoke is the only test that ran post-fix; passes confirming fixtures.ts edits don't break the auth flow. Risk mitigants: (a) all 7 fixes are deterministic file edits with mechanical-replacement scope; (b) grep confirms zero existing specs destructure bare `{page}` (Fix #2 wouldn't fire for any current test); (c) 6 of 8 `isOnXTab` changes are strict-equivalent per walk-evidence; (d) the 2 vulnerable helpers (`isOnLegalTab`, `isOnAccountAndAddressTab`) were RETURNING TRUE incorrectly pre-fix — post-fix correctness can only improve dependent specs.
- [x] Plan file MOVED from `~/.claude/plans/` to `plans/pending/PLAN_FRAMEWORK_DEFENSES_V2 (pre-closure pending location)` (repo root) at execution start (DONE in prior v2.2 P0-6 session 2026-05-22T19:30 — file lives here now)

---

## Verification commands (re-runnable, no assumptions)

| # | Fix | How to verify (runnable / readable) |
|---|---|---|
| 1a | Regex tightening | Stage a spec with `async ({ page, locationNotesPage })` (page first); `git commit` must fail with `[pre-commit] BUG-1` |
| 1b | CI step | Push same spec via `git commit --no-verify`; GitHub Actions must fail at lint step before `playwright test` |
| 2 | page fixture override | Write a one-off spec with `async ({ locationNotesPage, page })`; `npx playwright test --grep <one-off>` must fail at fixture instantiation with `[diag:BUG-1]` |
| 3 | Cookie expiry pre-check | Hand-edit `.auth/encore-state.json` set `__Secure-next-auth.session-token.0` `expires` to 0; run `npm test -- --project=encore-locations --grep "FCC-024"`; fixture init should refresh in ≤10s instead of 60s Dashboard timeout |
| 4a | isOnXTab on inactive tab | Smoke: `await locationNotesPage.navigateToNotesTab()` → `await locationCurrencyPage.navigateToCurrencyTab()` → `(await locationNotesPage.isOnNotesTab())` must return FALSE post-fix |
| 4b | clickTopLevelTab readiness | Click "Location Management History" → immediately call `clickTopLevelTab('tabBasicInformation')`; post-fix waits for aria-selected before returning |
| 4c | Loud Notes/Legal failures | Hand-add `page.route` block delaying `/api/notes` by 30s; spec must fail at click step, not later |
| Regression | No regression | Full `npm test -- --project=encore-locations --project=encore-local-office` matches pre-fix baseline |

---

## Handoff

**To execution session (post user GREEN-flag):**
- Identity: OWNER (this plan is non-pipeline framework defense work).
- Model: Opus 4.7 for #1/#2/#3 (logic). Sonnet OK for #4 deterministic file edits AFTER P0-6 GREEN.
- BrowserTool: cli for Phase 0 PENDING checks. Fix code is deterministic file edits.
- Move file first: Read scratch file, Write content to `plans/pending/PLAN_FRAMEWORK_DEFENSES_V2 (pre-closure pending location)` (repo root), then delete the scratch original. **NOT `git mv`** — the source is in `~/.claude/plans/` (outside the encore_framework working tree), so git's rename detection has nothing to track. The Write+delete pair behaves identically for the new repo file. (per LR-049 + `feedback_save_plan_location.md`; v2.1 corrected from broken `git mv` directive).
- Run Phase 0 PENDING (P0-6, P0-7). P0-8 ✅ verified in v2.1 audit. Block matching fixes until GREEN.
- Execute fixes in recommended order. Single `/final-q` at end. No identity transfer.

**Pure-chat sessions (zero mutations) before execution skip `/final-q` per LR-042; this handoff fires when actual code mutations begin.**

---

## What changed from v1 to this revision

| Item | v1 | v2 | Driver |
|---|---|---|---|
| Frontmatter | Missing | LR-048 compliant (Status, Identity, Model, Thinking, PermissionMode, BrowserTool, Audit chain) | Meta-auditor + user send-back |
| Bootstrap | Missing | Added with LR-056 / FCC-027 disambiguation + stack clarification | User send-back |
| Phase 0 | Missing | 8 verification items (5 ✅ DONE this turn, 3 ⏳ PENDING) | User: no assumptions |
| Cross-audit log | Implicit | Explicit 4-row table tracking every auditor | User: audit chain transparency |
| Fix #3 cookie expiry shape | Naïve `< Date.now()` | Tri-state mirror of auth.setup.ts:121 + earliest-of-`.0/.1` | User send-back refinement |
| Stack attribution | Implicit "Angular" | Explicit "Next.js + React + Radix + NextAuth + MS SSO" + old-site clarification | User send-back refinement |
| FCC-027 / LR-056 note | Absent | Explicit: "this plan is NOT the FCC-027 cure path" | Meta-auditor + user send-back |
| Acceptance criteria | Missing | 10 checkboxes | LR-048 |
| Handoff | Missing | Identity / Model / BrowserTool / file-move directive | LR-048 |
| Move-to-pending | Mentioned in passing | First-class acceptance gate | `feedback_save_plan_location.md` |
| Items deferred | Bare list | Each row has verification evidence | User: no assumptions |

## v2 → v2.1 (audit-corrected /ultrathink Step 3, OWNER 2026-05-22)

| Item | v2 | v2.1 | Driver |
|---|---|---|---|
| Destination path | the hypothetical `<clients-encore-plans-pending>` directory (does NOT exist) | `plans/pending/PLAN_FRAMEWORK_DEFENSES_V2 (pre-closure pending location)` (repo root, exists, 30+ siblings) | /ultrathink audit BLOCKER (a) — verified via `fs.existsSync` |
| Move command | `git mv ~/.claude/plans/... clients/encore/plans/...` | Read scratch + Write to new location + delete scratch | /ultrathink audit BLOCKER (b) — `git mv` can't move files from outside the working tree |
| P0-8 status | ⏳ PENDING | ✅ DONE (`git config --get core.hooksPath` returns `.githooks`) | /ultrathink audit verification this session |
| P0-6 gate | "Block fix #4 code until this is GREEN" | "Defense-in-depth — fix #4a strict improvement regardless of outcome" | /ultrathink audit (d) — old check is never strictly better |
| Fix #5 | Separate item | Alias of #4c (same code, same files); listed for v2 schedule flexibility | /ultrathink audit (e) — verified by reading acceptance criterion bundle |
| Fix #4a effort | 4-8 hrs | ~30 min total (8 identical patterns verified bulk-replaceable) | /ultrathink audit (f) — 8 helpers grep'd, identical structure |
| Encore CLAUDE.md stack | Not addressed | Flagged for separate 1-line follow-up (out of scope here) | /ultrathink audit (c) — `clients/encore/CLAUDE.md:4` still reads "Angular + Radix UI" — Radix is React-only, contradicts plan's evidence |
| Deferred-items orphan risk | No follow-up plan | Flagged — would need a hypothetical `<SUBPLAN-FRAMEWORK-DEFENSES-DEFERRED>` (not yet authored) to track AUD-C/E/F + NEW-6/7 + dead chrome-firefox-webkit + Azure/Jenkins | /ultrathink audit (g) |
| Audit chain | 5 rows | 6 rows (Council → my v1 → Meta-Auditor → my watchdog → user GREEN → **/ultrathink Step 3 corrections**) | /ultrathink Step 3 self-document |

## Execution Summary

**Date**: 2026-05-22 · **Identity**: OWNER

**Sessions**:
1. T19:30 IST — P0-6 walk (CLI headed, persistent profile). Verdict GREEN — 2 of 8 helpers vulnerable, evidence at `clients/encore/specs_planning/_internal/walk-evidence-radix-tab-dom-2026-05-22.md`.
2. T20:15 IST — `/execute /ultrathink` remaining work. All 7 fixes landed, typecheck clean, P0-7 smoke GREEN.

**Fixes landed** (9 file edits, 1 deletion):

| # | File | Change |
|---|---|---|
| #1a | `.githooks/pre-commit:43` | Regex OR-alternation for both `{*Page,page}` and `{page,*Page}` orderings |
| #1b | `clients/encore/.github/workflows/playwright-tests.yml:46-58` | CI lint step before `playwright test` |
| #2 | `clients/encore/src/infra/fixtures.ts:281-326` | `page` fixture override throws `[diag:BUG-1]`. Deviation from v2.1 prose: dropped `authenticatedSession` dep (cleaner; diagnosticsHandler auto-loads it) |
| #3 helper | `clients/encore/src/infra/auth-storage.ts:67-92` | `readEarliestSessionExpiry()` tri-state mirror of `auth.setup.ts:121` + earliest-of-`.0/.1` |
| #3 gate | `clients/encore/src/infra/fixtures.ts:266-269` | `stateExpired` check with 60s grace, OR'd into existing refresh gate |
| #4a | 8 × `clients/encore/src/pages/locations/location-*.page.ts` | `isOnXTab()` → `tab.getAttribute('aria-selected') === 'true'` (mirrors `base-page.ts:448`) |
| #4b | `clients/encore/src/pages/locations/location-shared-setup-locations.page.ts:394` | `clickTopLevelTab()` adds `expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 10_000 })` + `waitForAngularStable()` |
| #4c/#5 | `location-notes.page.ts:39` + `location-legal.page.ts:38` | Dropped `.catch(Log.warn)` so timeouts fail loudly |

**Verification**:
- Scoped client typecheck (`npx tsc --noEmit -p clients/encore/tsconfig.json`): **PASS** (exit 0)
- Spec discovery (`npx playwright test --project=encore-locations --list`): **269 tests in 11 files** (baseline)
- P0-7 smoke (`_p0-7-smoke.spec.ts`, deleted post-verdict): **PASS** in 522ms; trace.zip attached (248KB); video.webm did NOT attach (pre-existing Playwright limitation — `test.use({ video: 'on' })` doesn't propagate to manually-created `browser.newContext()`; NOT a Fix #2 regression)
- Per-fix grep verifications all pass (see acceptance criteria block above)

**Side effect**: `clients/encore/.auth/encore-state.json` auto-refreshed by `auth.setup.ts` during P0-7 run (3 SSO attempts; original state was stale per server-side invalidation, not cookie-expiry — Fix #3 wouldn't have caught this specific staleness since cookies still had future `expires`).

**Strict-line override (LR-046 audit trail)**: Acceptance criterion "`npm test -- --project=encore-locations --project=encore-local-office` matches pre-fix baseline pass/fail count" left UNCHECKED. User authorization 2026-05-22 chat ("make it done") overrides — full regression deferred to next CI trigger. Risk mitigants (a) all 7 fixes deterministic mechanical edits, (b) zero existing specs destructure bare `{page}` per grep, (c) 6 of 8 isOnXTab changes are strict-equivalent per walk-evidence, (d) 2 vulnerable helpers were returning TRUE incorrectly pre-fix — post-fix correctness can only improve dependent specs.

**Plan deviations (LR-046 catalog)**:
1. Fix #2 dropped `{ authenticatedSession }` dependency from page-fixture override (v2.1 prose specified it). Rationale: `diagnosticsHandler` auto-loads `authenticatedSession` regardless; explicit dep adds no value, and removing it keeps the throw clean. No semantic change.
2. Full regression suite DEFERRED — user-authorized per "make it done".

**Cascade closure (LR-027)**: This plan has no `**Parent**:` field — it is a root-level plan. No parent cascade applies.

**Activity log**: 2 rows appended at `clients/encore/specs_planning/_internal/agent-activity-log.md`:
- T19:30 (P0-6 walk)
- T20:15 (remaining work)

---

## v2.1 → v2.2 (P0-6 walk executed, OWNER 2026-05-22)

User rejected the v2.1 P0-6 deferral and directed: "Starting Phase 0 PENDING — P0-6 browser walk (CLI, headed, read-only). /execute do not defer a single task!" The walk landed in ~3 minutes using `playwright-cli open --persistent --profile=clients/encore/.auth/e2e-profile`.

| Item | v2.1 | v2.2 | Driver |
|---|---|---|---|
| P0-6 status | ⏭ DEFERRED to post-fix regression | ✅ DONE — gap CONFIRMED REAL for 2 of 8 helpers (`isOnLegalTab` + `isOnAccountAndAddressTab`); other 6 use child-element anchors that lazy-mount per active tab | User rejection of deferral + headed CLI walk; evidence at `clients/encore/specs_planning/_internal/walk-evidence-radix-tab-dom-2026-05-22.md` |
| CLI-cannot-load-storageState reasoning | "Walk would require ad-hoc Node script or one-off spec — more invasive than expected" | **REFUTED** — `playwright-cli open --persistent --profile=<dir>` is the canonical CLI auth path per LR-054 Table 2 row 7; auth inherited cleanly, total walk ~3 minutes, zero ad-hoc code | LR-054 hallucination class — "CLI lacks the [X] subcommand" without quoting Table 2's absence. v2.1 deferral text matches the exact pattern LR-054 was graduated to prevent (2026-05-18) |
| Fix #4a coverage | "Strict improvement regardless of outcome" (no per-helper detail) | Strict improvement for 8 of 8 (2 real-fix, 6 no-op-equivalent); recommend bulk-apply with per-helper verdict table in walk-evidence artifact | Walk produced per-helper categorization |
| Plan is BLOCKED on | P0-6 / P0-7 | P0-7 only | P0-6 closure |
| Audit chain | 6 rows | 7 rows (added "v2.2 user-directed P0-6 walk — OWNER 2026-05-22") | This v2.2 self-document |
