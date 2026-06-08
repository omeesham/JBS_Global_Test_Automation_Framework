# PLAN: Code-Review Findings Remediation — RE-GROUNDED for `client_deliverable`

**Status**: DONE
**Executed**: 2026-06-08
**Priority**: P1 (gates the colleague's next PR review coming back green)
**Created**: 2026-06-08 (re-grounded from the stale `main`-branch draft)
**Parent**: none
**Branch**: `client_deliverable` (post-POM-restructure — commits `604a467a` + `7e7da32c`)
**PermissionMode**: acceptEdits (deterministic file edits + verification run; no commit)

---

## Context

A senior Encore reviewer (CodeQL/Copilot-style) flagged 6 code-quality patterns on an **older,
pre-restructure copy** of our deliverable handed to a JBS colleague, who will submit it in the
**next PR**. We must independently confirm every flagged pattern is satisfied in the **current**
deliverable so the colleague's PR review comes back green — **without regressing working code**.

**Why this plan was rebuilt:** the prior version of this plan was authored against the frozen `main`
branch. The Fri 06-05 POM restructure relocated/renamed most target files and changed every line
number. Re-grounding against `client_deliverable` (this session, 2026-06-08) overturned several of the
old plan's assumptions (see "What changed"). The 6 finding *classes* still hold; the coordinates and a
few *verdicts* did not.

**User steer (binding):** *"only do if it's truly applicable to current branch — do not nuke our
branch just because of an AI-generated code review."* Conservative scope; no regressions.

---

## Decisions locked (this session)

- **Q1 (F3 scope) = Conservative (Option A).** Convert the flagged **reads** (`.isChecked()` →
  `getRadixCheckboxState`); **keep native writes** (`.check()/.uncheck()/.click()`) because the
  framework's `setRadixCheckbox` clicks *without* verifying (the documented **TC-008** "click
  focuses but doesn't toggle" race). Leave the two files that already document this with a comment.
- **Q2 (copy scope) = Both.** Apply the F1 fix to the deliverable copy
  (`clients/encore/src/reporter/agent-reporter.ts`) **and** the internal copy
  (`src/utils/agent-reporter.ts`), so they don't drift.

---

## What changed vs the stale `main`-branch draft (honest reconciliation)

| Old-plan claim | Reality on `client_deliverable` | Action |
|---|---|---|
| F1 site `gap-006-table-at-max.ts` | **File does not exist on this branch** | **Dropped** (phantom) |
| F1 site `home.page.ts:33` | **No `home.page.ts` exists** | **Dropped** (phantom) |
| F1 in `src/utils/diagnostics-collector.ts` | Only copy is `clients/encore/src/utils/…` | Path corrected |
| F1 NEW site | `clients/encore/src/utils/auth-storage.ts:103,118` | **Added** |
| Helper at `src/utils/url-host.ts`, import `@framework/...` | Client tsconfig has **no path aliases**; client ships alone via `git archive` | Helper goes in **each tree**, imported **relatively** |
| F4 sites `location-form-helpers 217/229` | Those ternary sites **don't exist** here | **Dropped** |
| F3 "convert writes to helper" | `setRadixCheckbox` is click-**without**-verify (TC-008) | **Keep native writes** (Option A) |
| F5 `diagnostics-collector.ts:241` | Actual site is **`:184`** | Line corrected |

Files were relocated/renamed by the restructure: `pages/auth/login.page.ts`,
`pages/locations/location-currency.page.ts`, `pages/locations/location-local-info.page.ts`,
`pages/components/location-form-helpers.component.ts` (was `.page.ts`), `pages/base.page.ts`
(was `common/base-page.ts`), `setup/global-setup.ts` (was `tests/setup/…`), `reporter/agent-reporter.ts`.

---

## F1 — Incomplete URL substring sanitization  ✅ GENUINELY APPLICABLE

CodeQL `js/incomplete-url-substring-sanitization`: `url.includes('login.microsoftonline.com')`
matches `login.microsoftonline.com.attacker.net` or a query-param. Parse host, compare exact-or-subdomain.

### New helper (TWO copies — trees are self-contained, cannot share one file)
- `clients/encore/src/utils/url-host.ts` (deliverable) — imported **relatively**
  (`../../utils/url-host` from pages, `./url-host` from utils, `../utils/url-host` from reporter).
- `src/utils/url-host.ts` (internal framework) — for the internal agent-reporter copy.

```ts
export const AUTH_HOSTS = ['login.microsoftonline.com', 'b2clogin.com'];
export function hostnameOf(rawUrl: string): string {
  try { return new URL(rawUrl).hostname.toLowerCase(); } catch { return ''; }
}
/** host === t or a proper subdomain of t (.-boundary). */
export function urlHostMatches(rawUrl: string, host: string): boolean {
  const h = hostnameOf(rawUrl), t = host.toLowerCase();
  return h !== '' && (h === t || h.endsWith(`.${t}`));
}
export function isAuthUrl(rawUrl: string): boolean { return AUTH_HOSTS.some(h => urlHostMatches(rawUrl, h)); }
/** Free text that may EMBED a URL (error messages). */
export function textMentionsAuthUrl(text: string): boolean {
  return (text.match(/https?:\/\/[^\s'"]+/gi) ?? []).some(isAuthUrl);
}
```

### Rules
- Real URL value → `isAuthUrl(url)` / `urlHostMatches(url, appHost)`.
- Free-text error message → `textMentionsAuthUrl(msg)` **+ keep a bare-host keyword fallback** so we
  don't lose messages that name the host without an `http(s)://` scheme (verify via auth smoke).
- **KEEP** path/keyword heuristics (no host → CodeQL won't flag): `oauth`, `/auth/sign-in`, `401`, `403`.

### Sites (grep-verified on this branch)
- **`clients/encore/src/pages/auth/login.page.ts`** — 100, 113 (`expectedHostname` → `urlHostMatches`), 155, 197, 237.
- **`clients/encore/src/reporter/agent-reporter.ts`** — 259-260 (free text → `textMentionsAuthUrl`), 264, 270.
- **`clients/encore/src/utils/diagnostics-collector.ts`** — 56 (keep `|| url.includes('oauth')`).
- **`clients/encore/src/utils/auth-storage.ts`** — 103, 118 (keep `|| ….includes('/auth/sign-in')`).
- **`src/utils/agent-reporter.ts`** (internal, per Q2=both) — 263-264, 268, 274. (No other F1 site in `src/`.)

---

## F2 — Playwright selectors → `document.querySelector`  ⚠ RE-TRACE, fix only if reachable

Selector files **do** contain PW-engine syntax (`:has-text`, `text=/…/`, `:text-is`, `:has()`), and
this branch has ~6 `document.querySelector(variable)` sites (more than the old "clean" verdict assumed):
`diagnostics-collector.ts:207` (value wrapped as `[data-testid="${selector}"]` → **inert/safe**),
`location-form-helpers.component.ts:41`, `location-notes.page.ts:284/301/353`,
`location-account-address.page.ts:40/281`, `location-shared-setup-locations.page.ts:233`.

**Action (conservative):** trace the actual call sites of each. If every caller passes a plain-CSS
selector key → **no change + one-line team note** (don't touch working code). If any caller can pass a
PW-engine key → fix **that path only** by routing through the Playwright `Locator`
(`getElement(key).waitFor(...)` / `expect(locator).toBeEnabled()`), which understands PW syntax.
Do **not** blanket-rewrite.

---

## F3 — Native actions on Radix widgets  ◑ PARTIAL (Option A: reads only)

`getRadixCheckboxState(key)` reads `aria-checked` (pure, safe). `setRadixCheckbox(key,checked)` clicks
**without re-verifying** — the TC-008 race. So: adopt the helper for **reads**; keep **writes** native.

**Convert reads (remove flagged `.isChecked()`):**
- `location-local-info.page.ts` — 79, 80 (checkboxes `chkECommerceActive`/`chkEnableProductionsOrders`;
  the sibling `location-left-panel-basic-information.page.ts:90-91` already reads them via the helper →
  this is the genuine cross-file inconsistency) → `(await this.getRadixCheckboxState(key)).checked`.
- `location-currency.page.ts` — 92, 101, 110 (`.isChecked()` reads) → `getRadixCheckboxState`.
  Leave the `el.click()` writes at 102/111 as-is.
- `location-form-helpers.component.ts` — 56, 64, 69, 74, 76 read guards → `getRadixCheckboxState`.
  Keep the `.check()/.uncheck()` writes (native auto-verifies; safer than the helper here).

**Radios (NOT checkboxes — `local-info.ts:90,94` = `button[role="radio"]`):**
- `location-local-info.page.ts` — 101, 119 → read `aria-checked` directly
  (`(await this.getElement(key).getAttribute('aria-checked')) === 'true'`). MCP/JS-verify once (LR-016);
  if `aria-checked` absent, leave the working `.isChecked()` rather than regress.

**Leave untouched (documented, deliberate — keep the existing intent comment so the reviewer sees it):**
- `corporate-pricing-search.page.ts:174-175` — comment already explains `.check()/.uncheck()` auto-verify ARIA.
- `location-left-panel-basic-information.page.ts:125-131` — comment already cites TC-008.
- `corporate-pricing-strategy.page.ts:156` — `.isChecked()` read; convert only if cheap + same Radix pattern (verify first).

**Note for reviewer (carry into PR):** native `.check()/.uncheck()/.isChecked()` are valid on
`role="checkbox"`/`role="radio"` in modern Playwright; writes are kept native intentionally because
they auto-verify state (helper does not — TC-008). *If the reviewer is a strict unsuppressable bot,
escalate to "Option B": harden `setRadixCheckbox` to poll `aria-checked` post-click, then route all
writes through it.*

---

## F4 — Log level matches severity  ✅ APPLICABLE (3 sites, trivial)

- `clients/encore/src/setup/global-setup.ts:55` — `Log.info('[WARN] Pre-flight WARN…')` → `Log.warn(...)`.
- `clients/encore/src/pages/base.page.ts:636` & `:639` — `Log.info('[WARN] Save button did not enable…')` → `Log.warn(...)`.

(Old plan's form-helpers 217/229 ternary sites don't exist here. No other WARN/FAIL-at-info site found.)

---

## F5 — `consoleErrors` from the scoped getter  ✅ APPLICABLE (1 site, low risk)

- `clients/encore/src/utils/diagnostics-collector.ts:184` — `consoleErrors: this.getConsoleLogs()` →
  `this.getConsoleErrors()`. (`getConsoleErrors` = error+warning, `:122`; `getConsoleLogs` = error+warning+**info**, `:126`.)
- **Verify consumers tolerate the narrowing** (they classify/display errors, so dropping `info` is the intended fix):
  deliverable `agent-reporter.ts:230,254`, `pages.fixture.ts:153`; pre-run scripts already filter `type==='error'`.

---

## F6 — Remove the now-dead getter  ⚠ FLAGGED FOR VETO

After F5, `getConsoleLogs()` (`:126`) has **no remaining caller** (grep-confirmed: only caller was `:184`).
Re-grep at execution, then delete the method. **Hold for user veto** before deleting.

---

## Verification (type-check + affected specs; no commit)

1. `npm run typecheck` — clean (new imports, helper signatures, narrowed return types).
2. `npm run test:chrome -- tests/seed.spec.ts` — auth smoke proves the F1 login/auth-storage refactor
   didn't break SSO sign-in/redirect detection.
3. Location **Currency** + **Local Information** specs (`clients/encore/tests/locations/**`) — prove the
   F3 read-conversions + radio reads behave identically.
4. Report pass/fail only from the deduped run summary (no stale stdout); RCA any checkbox/radio
   regression before declaring done (LR-024).

## Out of scope / flags

- F2: default = no change + team note unless a PW-engine selector genuinely reaches a `querySelector` site.
- F6 deletion is the only removal — held for veto.
- No commit/push (ships via the colleague's PR). Append one `agent-activity-log.md` row at end (LR-028/LR-037).
- Two `url-host.ts` copies + two `agent-reporter.ts` copies is inherent to the self-contained-client
  architecture (client ships alone), not new debt — noted, not "fixed."

## Files touched

**New:** `clients/encore/src/utils/url-host.ts`, `src/utils/url-host.ts`.
**Edit (F1):** `pages/auth/login.page.ts`, `reporter/agent-reporter.ts`, `utils/diagnostics-collector.ts`,
`utils/auth-storage.ts` (all under `clients/encore/src/`), `src/utils/agent-reporter.ts`.
**Edit (F3):** `pages/locations/location-local-info.page.ts`, `pages/locations/location-currency.page.ts`,
`pages/components/location-form-helpers.component.ts`.
**Edit (F4):** `setup/global-setup.ts`, `pages/base.page.ts`.
**Edit (F5/F6):** `utils/diagnostics-collector.ts`.

## Execution Summary

**Executed**: 2026-06-08 (OWNER). **Branch**: `client_deliverable`. **No commit/push** (ships via colleague's PR).

### Per-finding outcome
- **F1 — DONE (9 sites + helper).** Created `clients/encore/src/utils/url-host.ts` (`AUTH_HOSTS`, `hostnameOf`, `urlHostMatches`, `isAuthUrl`, `textMentionsAuthUrl`), imported relatively. Converted every genuine URL-typed host-substring check:
  - `pages/auth/login.page.ts` — **8** sites (plan said 5; full read found 88/100/113×2/155/197/203/221/237) → `urlHostMatches(x,'login.microsoftonline.com')`/`urlHostMatches(x,expectedHostname)`. Kept keyword/path/param checks (`oauth`, `/auth/sign-in`, `error=OAuth`, `/navigator/locations/`).
  - `reporter/agent-reporter.ts` — free-text 259-260 → `textMentionsAuthUrl(errorMsg)`; netFails 264 → `isAuthUrl(n.url)`; P2 270 → `urlHostMatches`. Kept `oauth`/`401`/`403`.
  - `utils/auth-storage.ts` 103/118 → `urlHostMatches`; kept `/auth/sign-in`.
  - `utils/diagnostics-collector.ts` :56 → `isAuthUrl(url)`; kept `|| url.includes('oauth')`.
- **F2 — NO CHANGE (verified safe).** Traced every `document.querySelector(variable)` site (diagnostics:208 inert `[data-testid="${selector}"]` wrap; form-helpers:41 only ever receives `chkApplyLDW`/`chkSkipBilling`; notes 284/301/353 = `getLocator('btnSaveNotes')`=`[data-testid…]`; account-address 40/281 + shared-setup:233 = data-testid + standard CSS combinators). Every site receives plain CSS — additionally proven by these sites living in passing specs (a PW-engine selector would throw `SyntaxError` in browser-native `querySelector`). Team-note convention: PW-engine selectors (`:has-text`/`:text-is`/`:has()`) must route through Playwright Locators, never `querySelector`.
- **F3 — DONE (Option A: reads only).** `getRadixCheckboxState`/`aria-checked` for reads; native writes (`.check()/.uncheck()/.click()`) kept (dodges TC-008). Files: `location-local-info.page.ts` (checkboxes 79/80 → helper; radios 101/119 → direct `aria-checked`), `location-currency.page.ts` (92/101/110 reads → helper; `el.click()` writes kept), `location-form-helpers.component.ts` (getCheckboxState/checkCheckbox/uncheckCheckbox/toggleCheckbox reads → helper; `.check()/.uncheck()` kept). Documented files (corporate-pricing-search:174-175, left-panel:125-131, corp-pricing-strategy:156) left untouched per plan.
- **F4 — DONE (3 sites).** `global-setup.ts:55` + `base.page.ts:636,639` `Log.info('[WARN] …')` → `Log.warn('…')` (logger auto-tags level; redundant `[WARN]` prefix dropped).
- **F5 — DONE.** `diagnostics-collector.ts:184` `getConsoleLogs()` → `getConsoleErrors()`. Safe narrowing (classifier line 293 already filters `type==='error'`; consumers display/classify errors).
- **F6 — DONE (deleted, user-approved).** `getConsoleLogs()` removed (zero callers after F5; user vetoed-in the deletion 2026-06-08).

### Deviations from plan (what + why)
1. **Internal `src/utils/agent-reporter.ts` SKIPPED (Q2 revised from "both" → "deliverable only").** Phase-1 research found it is an explicitly DEPRECATED no-op orphan ("nothing imports this file"), does NOT ship to Encore (only `clients/encore/` ships), and its deletion is already tracked by PLAN_ROOT_CLIENT_DEDUPE.md. User re-decided "skip it" 2026-06-08 (new info not known when Q2=both was chosen). No `src/utils/url-host.ts` created (only the deliverable copy).
2. **login.page.ts: 8 sites converted, not 5** (plan under-counted). Completing the same finding class — leaving 88/203/221 would keep CodeQL red. Not scope creep.
3. **F2 = no change** (plan default for un-reachable PW-engine selectors); confirmed none reachable.
4. **Stale verification commands**: plan's `npm run test:chrome -- tests/seed.spec.ts` is stale on this branch (seed.spec deleted by PLAN_DELIVERABLE_RESTRUCTURE; no `test:chrome` client script). Substituted the real path: `encore-locations` project run of the Currency + Local-Info specs (auth `setup` dependency exercises the F1 SSO path).

### Verification
- `npm run typecheck` (client) — **clean**.
- Live `encore-locations` run (real Microsoft SSO): **60/62 passed**. F1 proven end-to-end — fresh SSO login + `isLoggedIn()`/`validateState()` (both edited) returned `[OK] Authenticated`. F3 proven — `captureLeftPanelBaseline` (helper) read `{eCommerceActive:true, enableProductionsOrders:true}`; default-state assertions `13/20/7 checked, 0 failures`; all currency checkbox reads/toggles + 7 currency persistence tests + Billing radio test pass.
- **2 non-passes, both pre-existing & proven independent of these changes:**
  - `TC-LOC-LI: LDW% = 0.50` — flaky (spinbutton value race, `setSpinValue` untouched); passed on retry.
  - `TC-LOC-LI-071` (Multiday Pricing persist) — pre-existing flake: LR-019 net-zero (assumes unchecked-default, no per-test baseline) + unreliable app-side multiday persistence on shared office 1604. RCA across 4 runs proved outcome-independence of the read change (Playwright `isChecked()` reads the same `aria-checked` as `getRadixCheckboxState` for `role="checkbox"`; original code failed identically on dirty start). SPAWNed follow-up `task_95c5306a`.

### Out-of-scope flag (not caused by this work, not committing)
- Two tracked docs (`clients/encore/docs/Pricing-Functional Details-JIRA STORIES 1.docx`, `…/jira_pricing_test_cases.xlsx`) show as **unstaged working-tree deletions**. They were present at session start, not deleted by any command run here (only file ops were the F1–F6 edits + a 2-file stash/pop); concurrent external file activity (linter/editor) was flagged by the harness. Left untouched (restoring could undo intentional user action); not committing, so they don't reach the deliverable.
