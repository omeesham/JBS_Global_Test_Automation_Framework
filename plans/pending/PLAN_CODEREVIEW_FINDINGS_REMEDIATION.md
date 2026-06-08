> ⚠️ **REVISE ON THIS BRANCH FIRST** (note added 2026-06-08 during stash-recovery): this plan was authored on the frozen `main` branch; its file paths and line numbers describe the PRE-restructure layout. Re-ground every F1–F6 site against THIS branch (`client_deliverable`) before executing any edit — 5 of 7 target files were relocated by the Fri 06-05 POM restructure, and `gap-006-table-at-max.ts` exists in neither committed tree. The 6 findings still hold; only the coordinates (paths + line numbers) need rebuilding.

# PLAN: Code-Review Findings Remediation (CodeQL/Copilot — pre-PR)

**Status**: PENDING
**Priority**: P1 (gates the colleague's next PR review coming back green)
**Created**: 2026-06-08
**Parent**: none
**PermissionMode**: acceptEdits (deterministic file edits + verification run; no commit)

---

## Context

A senior Encore reviewer (CodeQL/Copilot-style automated review) flagged 6 code-quality patterns on
an **older copy** of our deliverable — the pre-restructure version handed to a JBS colleague, who will
put it up in the **next PR**. Yesterday's restructure means our *current* codebase diverged from that
copy, so we must independently confirm every flagged pattern is satisfied **here** before the PR review
runs. Source/design guide: `~/Downloads/instruction_codereview_fix_suggestion.md` — *fix the class not
the line, dedupe into a shared helper at 3+ sites, reuse existing helpers, preserve intent (don't "fix"
path/keyword heuristics), flag newly-dead code, don't commit unless asked.*

**Why it matters:** the reviewer's findings live in our current tree too; if we don't clear them, the
colleague's PR review re-flags them. Goal = green review with zero behavior regressions.

This plan was hardened by a 12-agent adversarial audit + full-repo greps. See **Audit reconciliation**.

---

## Audit reconciliation (ground-truth verified)

**Real gaps the audit caught (folded in):**
- **F1 +1 file:** `clients/encore/scripts/walks/gap-006-table-at-max.ts:120,131` — same host-`.includes()`.
  Repo-grep confirms the F1 universe is the 4 named files **+ this walk script only**.
- **F3 radios:** `local-info.ts:90-96` proves `rdoBillingType*`/`rdoBillingWay*` are `button[role="radio"]`
  — reusing the checkbox helper was wrong; they now read `aria-checked` directly.
- **F4 +1 site (missed by the plan AND all 12 agents; caught by own grep):**
  `clients/encore/tests/setup/global-setup.ts:65` `Log.info('[WARN] Pre-flight WARN…')`.

**Agent false-positives rejected against ground truth:**
- "currency/local-info `.isChecked()` are correct, not Radix" → false (`currency.ts:9`: Radix `button[role="checkbox"]`).
- "`diagnostics-collector.ts:272` is XSS" → false (value wrapped as `[data-testid="${selector}"]`; PW syntax inert).
- "F3/F4/F5 line numbers inaccurate" → false (agent conflated F3 lines ~67-92 with F4 lines 217/229).
- "F5 not applied" → noise (nothing executed; planning stage).
- 4 extra F4 "violations" (currency 228/263, form-helpers 168/185) → rejected: capture/checker logs where
  the "error" is an expected/captured outcome; `info` is correct.

| # | Reviewer finding | Verified status | Action |
|---|---|---|---|
| 1 | URL host matched by `.includes()` | ❌ 20 sites/4 files **+2 in walk script** | Shared helper + refactor |
| 2 | PW selectors → `document.querySelector` | ✅ clean (re-verified) | None |
| 3 | Native actions on Radix widgets | ❌ 13 calls/3 files | Checkboxes→helpers; radios→`aria-checked` |
| 4 | WARN/FAIL logged at `Log.info` | ❌ 5 genuine sites/3 files | Match level to severity |
| 5 | `consoleErrors` filled with info logs | ❌ 1 site | Swap to scoped getter |
| 6 | Dead code left by a fix | ⚠️ falls out of #5 | Remove orphaned getter (flagged) |

**Scope (confirmed w/ user):** both layers (`clients/encore/**` + `src/utils/**`); verify = typecheck + affected specs; no commit.

---

## F1 — Incomplete URL substring sanitization

### New file `src/utils/url-host.ts` (import as `@framework/utils/url-host`)
```ts
export const AUTH_HOSTS = ['login.microsoftonline.com', 'b2clogin.com'];
export function hostnameOf(rawUrl: string): string {
  try { return new URL(rawUrl).hostname.toLowerCase(); } catch { return ''; }
}
/** host === t or proper subdomain of t (.-boundary). */
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

### Transformation rules
- Real URL value → `isAuthUrl(url)`; vs app host string → `urlHostMatches(url, expectedHostname)`.
- Free-text error message → `textMentionsAuthUrl(msg)`.
- **KEEP** keyword heuristics (no host), comment `// keyword heuristic`: `oauth`, `/auth/sign-in`,
  `error=OAuth`, `error=Callback`, `/navigator/locations/`.

### Sites (complete, grep-verified)
- **`clients/encore/src/pages/login.page.ts`** — 108, 120 (host part), 133, 175, 259, 265, 283 (host part), 299.
  Keep `error=OAuth`/`error=Callback` (270) and `/auth/sign-in` (270 & 283).
- **`clients/encore/src/pages/home.page.ts:33`** — `url.includes(expectedHost)` → `urlHostMatches(url, expectedHost)`.
- **`src/utils/diagnostics-collector.ts`** — 72→`isAuthUrl(url)||url.includes('oauth')`; 347-349 (free text)→
  `textMentionsAuthUrl(errorMsg)` + keep `oauth/401/403`; 353→`isAuthUrl(n.url)||n.url.includes('oauth')`; 360→`!isAuthUrl(n.url)`.
- **`src/utils/agent-reporter.ts`** — 218-220→`textMentionsAuthUrl(errorMsg)`; 223→`isAuthUrl(n.url)||n.url.includes('oauth')`; 229→`!isAuthUrl(n.url)`.
- **`clients/encore/scripts/walks/gap-006-table-at-max.ts`** — 120→`isAuthUrl(u.toString())`;
  131→`urlHostMatches(u.toString(), 'cloudapps-e2e.encoreglobal.com')`. Internal walk script (not shipped) but
  under `clients/encore/**` and CodeQL-scannable → in scope.

---

## F2 — Already satisfied (no change)
Re-verified: zero PW-engine selectors (`:has-text`, `text=`, `>>`, `role=`, `:visible`, `:near`, `xpath=`) reach
`document.querySelector`. All `page.evaluate` sites use static literals or safely-wrapped values (incl. `:272`).
*Optional (out of scope):* `location-form-helpers.page.ts:49` `waitForFormReady(selectorKey)` accepts any key; a
future caller could pass a PW-syntax key into `querySelector`. Current callers safe — team note only.

---

## F3 — Radix widgets (checkboxes → helpers; radios → aria-checked)
BasePage has `getRadixCheckboxState(key)` (reads `aria-checked`) + `setRadixCheckbox(key, checked)`
(`base-page.ts:476`/`:489`, `protected`). 4 pages already delegate (auto-addon, pricing, shared-setup,
local-office-settings — confirmed). Fix 3 offenders (13 calls, grep-confirmed complete):
- **`location-currency.page.ts`** (98/107/116, `get/check/uncheckCheckbox`): delegate to `getRadixCheckboxState` /
  `setRadixCheckbox(key, true|false)`.
- **`location-form-helpers.page.ts`** (69/77/82/87/88/89): same three **plus** `toggleCheckbox` → read via
  `getRadixCheckboxState(...).checked`, flip via `setRadixCheckbox(key, !was)`, re-read. Removes all native calls.
- **`location-local-info.page.ts`**:
  - 84, 85 (`chkECommerceActive`/`chkEnableProductionsOrders` = Radix **checkboxes**) → `(await this.getRadixCheckboxState(key)).checked`.
  - 106, 124 (`rdoBillingTypeMaster`/`rdoBillingWayEvent` = Radix **radios**) → read-only, so
    `(await this.getElement(key).getAttribute('aria-checked')) === 'true'`. **MCP/JS-verify `aria-checked` once**
    (LR-016); if absent, leave the working `.isChecked()` (Playwright supports `role="radio"`) rather than regress.

---

## F4 — Log level matches severity (genuine sites only)
- **`base-page.ts:595` & `:598`** — `Log.info('[WARN] Save button did not enable…')` → `Log.warn(...)`.
- **`location-form-helpers.page.ts:217` & `:229`** — `(failures.length > 0 ? Log.warn : Log.info)(…)`.
- **`clients/encore/tests/setup/global-setup.ts:65`** — `Log.info('[WARN] Pre-flight WARN…')` → `Log.warn(...)`.

*Rejected (left as-is, reasoned):* `location-currency.page.ts:228,263` + `location-form-helpers.page.ts:168,185`
are capture/checker logs where the condition is expected/captured (e.g. `hasValidationError()` true = test wants
validation). `file-utils.ts:131` + `tests/examples/*` borderline/non-framework — out of scope.

---

## F5 — `consoleErrors` from the scoped getter
- **`src/utils/diagnostics-collector.ts:241`** — `this.getConsoleLogs()` → `this.getConsoleErrors()` (`:151`, error+warning only).
- Downstream safe (verified): `agent-reporter.ts:213/252`, `scripts/generator-pre-run.ts:453` filter to
  `e.type==='error'`; `scripts/healer-pre-run.ts:89` checks `.length`; `fixtures.ts:119` persists → narrowing is an
  improvement, **no consumer edits**.

## F6 — Remove the orphaned getter (flagged)
After F5, `getConsoleLogs()` (`:156`) loses its only caller (`:241`) → dead. Re-grep callers, then delete method +
`C2:` comment. **Flagged for user veto** in the final summary.

---

## Verification (type-check + affected specs)
1. `npm run typecheck` — clean (import paths + signatures across all edits).
2. `npm run test:chrome -- tests/seed.spec.ts` — auth smoke proves F1 login/home refactor didn't break SSO.
3. Location **Currency** + **Local Information** specs (locate under `clients/encore/tests/**`) — prove F3
   checkbox/radio conversions behave identically.
4. Report pass/fail from the deduped run summary (no stale stdout); RCA any checkbox/radio regression before declaring done.

## Out of scope / flags
- F2: no change (verified clean); `waitForFormReady` signature hardening = optional team note.
- F6 deletion = only removal — flagged for veto.
- No commit/push (ships via colleague's PR). Per LR-028/LR-037, append one `agent-activity-log.md` row at the end.
- Post-execution: capture the audit learning (a monolithic audit agent gave confident false positives; per-class
  adversarial verify + own ground-truth grep was decisive — own grep caught `global-setup:65`).

## Files touched
New: `src/utils/url-host.ts`.
Edit: `login.page.ts`, `home.page.ts`, `src/utils/diagnostics-collector.ts`, `src/utils/agent-reporter.ts`,
`clients/encore/scripts/walks/gap-006-table-at-max.ts`, `clients/encore/src/common/base-page.ts`,
`location-currency.page.ts`, `location-form-helpers.page.ts`, `location-local-info.page.ts`,
`clients/encore/tests/setup/global-setup.ts`.

## Execution Summary
_(to be filled on completion per LR-027)_
