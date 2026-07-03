# Decision Tree Patterns

Graduated from agent-mistakes.md. Practical decision trees for recurring situations.

## Pattern: Spec-Fixing Session Start
**When you see**: User says "fix failing spec", "spec broken", "tests failing"
**Do**:
1. `npm run clean` + `rm -rf .auth/chrome-profile`
2. Run failing spec fresh (headed) — observe actual failure
3. Run it AGAIN — confirm consistent vs intermittent
4. THEN read diagnostics and do RCA from fresh evidence
**Because**: Stale diagnostics from accumulated runs point to wrong root causes. Session 2026-04-02: stale data said SSO reload issue, reality was Radix dropdown instability.
**Graduated from**: LR-024, session 2026-04-02

## Pattern: Radix UI Large-Option Dropdown Interaction
**When you see**: Combobox/Select with 50+ options, `getByRole('option')` click, "not stable" or "detached from DOM"
**Do**: Wrap open+click in retry loop (max 3). On failure: Escape → wait hidden → re-open → `scrollIntoViewIfNeeded()` → click. 5s per-attempt timeout.
**Because**: Radix auto-scrolls to checked item on open. Options above scroll position shift (not stable) then detach during portal re-render.
**Graduated from**: LR-025, GEN-032, session 2026-04-02

## Pattern: Angular Save → Tab Navigation Race Condition
**When you see**: "Unsaved changes" alertdialog appearing AFTER a successful save (toast visible, save button disabled)
**Do**:
1. Save methods: wait for save button to disable (confirms API done), but DON'T assume form is pristine
2. Any `clickTab()` or tab navigation: check for `[role="alertdialog"]` after click, dismiss with "Discard" if visible
3. Retry loops (e.g. navigateToEctTab): always check state AFTER the last retry, not only at loop start
**Because**: Angular doesn't always call `markAsPristine()` after save. Button disables because save handler explicitly disables it — but `FormControl.dirty` is separate. Tab navigation dirty guard fires → dialog. The dialog auto-resolves if save response arrives later (explaining "box removed from frontend for some reason").
**Graduated from**: GEN-033, session 2026-04-02

## Pattern: Don't Over-Plan Spec Fixing — Just Run It
**When you see**: User says "fix failing spec" and you want to write a formal plan
**Do**: Skip the /planning ceremony. Just: clean → run → run again → RCA from evidence → fix → verify.
**Because**: Session 2026-04-02 — user corrected "the plan is to run the spec". Elaborate planning delays action and the root cause is unknown until you see the actual failure. Plan AFTER you have evidence, not before.
**Graduated from**: User correction, session 2026-04-02

## Pattern: Save/Submit button disables but nothing persists
**When you see** (any 2+ co-occurring): button transitions enabled → disabled in <500ms · no toast appears · no row in history tab · `window.__api` / fetch hook captures zero save-endpoint calls · form reverts on reload.

**Do** (execute IN ORDER, stop at first hit — do NOT skip ahead):
1. `document.querySelectorAll('[role="alertdialog"], [role="dialog"]:not([aria-hidden="true"])')` — any hits? → **use the existing `clickSaveAndConfirm` / `clickSaveWithDialog` helper** (navigation.md §B row; `local-office-settings.page.ts:138` wraps `base-page.ts:350`). DO NOT hand-roll a click driver.
2. `document.querySelectorAll('[aria-invalid="true"], .text-destructive, [data-invalid]')` — any hits? → form validation is blocking save. Fix the invalid field.
3. `window.__api` / fetch-hook shows a save-endpoint call with 4xx/5xx status? → server-side issue. File via LR-034.
4. Read the live onClick body: `btn[Object.getOwnPropertyNames(btn).find(k=>k.startsWith('__reactProps'))].onClick.toString()` — contains an `isTrusted` / `user-activation` gate? → only NOW consider trust-event workarounds.
5. None of the above apply → halt + ask the user. Do **not** self-invent framework-risk rules before exhausting 1–4.

**Because**: SP-B-LO-1b retry #2 (2026-04-20) spent ~15 automation attempts concluding the Save button was blocked by a synthetic-event trust gate at the framework level, and wrote a fiction rule (original ALL-076). The actual cause was a missed Radix AlertDialog that the existing `clickSaveAndConfirm` helper already drives — 15+ passing spec calls prove the pattern works unattended. Six guardrails (LR-012, navigation.md §B, ALL-073 repo-first, `clickSaveAndConfirm` helper, navigation.md §C registry, ALL-024 DOM-truth) each would have caught this on attempt 2. The gap wasn't the rules — it was that no symptom-triggered decision tree existed at the moment of failure.

**Graduated from**: ALL-076 (rewrite), RCA session 2026-04-21

## Pattern: Before declaring a control "un-drivable" / "won't accept input"
**When you see**: a click/fill does nothing, an option won't commit, a search box "won't accept input", or you're about to skip a test / mark NOT-AUTOMATABLE citing "can't drive it".
**Do** (ALL of, before concluding — LR-061 verify-before-blocked):
1. Reload the page — a stuck modal/overlay from a prior bad keystroke (a `key Escape` that didn't fire, a left-open listbox) modally blocks every later click. Clear it first.
2. Diff the page object's EXISTING selector against the live DOM — UI text drifts (`getByRole('textbox', {name:'Search pricebooks...'})` vs live `'Search pricing strategies...'`). A stale name silently never resolves (LR-029 class).
3. Inspect the real DOM: target the option `<button>`, not an inner `<span>`; for a cmdk command palette, `fill` the search input (it filters live), THEN click the filtered option button. (`playwright-cli type` crashes on a CSS selector — use `fill`.)
4. Try the page-object's documented helper.
Only after all 4 may you record "un-drivable" — with the evidence of what was tried.
**Because**: 2026-06-18 Pricing — TC-026..030 dropdowns were declared "un-drivable" after a few failed clicks. Real causes: a stuck currency-filter listbox (bad Escape) + a stale `'Search pricebooks...'` page-object selector + targeting the wrong element + never using the search box. A one-line selector fix re-enabled all 5. The user caught it ("you're assuming too much, not putting in enough effort").
**Graduated from**: LR-061, RC-2, session 2026-06-18

## Pattern: Before calling app behavior "corrupt" / "atypical" / "app-wide" / a "regression"
**When you see**: one office/page shows unexpected data (empty dropdowns, disabled fields, a value that won't persist) and you're about to conclude the data is corrupt, the office is atypical, the bug is app-wide, or it's a regression.
**Do** (LR-061 N≥2 evidence + LR-045 baseline):
1. Test a SECOND office — does it reproduce? Same on 2 offices → app-wide; different → office data state, not app behavior. **Pick the right alternate**: corporate-only surfaces (Commission, Labor) live on office **1101** ("Corporate Office"); currency/pricing variety lives on **1605**. Re-check the right one before concluding missing/corrupt (LR-ENC-005).
2. Check the BASELINE (old site) — is the state present there too? Present on baseline → intended/expected, not a bug. Absent → candidate regression.
3. Classify only after ≥2 independent sources agree.
**Because**: 2026-06-18 Pricing — "1604 is corrupt" was asserted from one office with no baseline; the disabled date-grid + empty dropdowns were never baseline-checked ("is it disabled in baseline? did you even check?" — no). The Corp-Pricing revert turned out app-wide (reproduced on 1605); the disabled cascade was expected behavior. One data point can't tell these apart.
**Graduated from**: LR-061, RC-1/RC-4, session 2026-06-18
