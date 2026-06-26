---
description: Spec authoring + spec-fixing workflow discipline
paths:
  - "clients/*/tests/**/*.spec.ts"
  - "clients/*/src/pages/**/*.ts"
---

# Spec Authoring & Spec-Fixing Discipline

Path-scoped rule pack — loads when authoring or fixing Playwright specs and page objects.

## LR-018: Spec-fixing workflow — run-all is the only truth

When fixing failing specs, follow this exact order:

1. Run ALL specs together → identify failures
2. Run each failing spec INDIVIDUALLY → classify as "run-all only" vs "always fails"
3. Fix "always fails" specs first (selector, logic, timeout issues)
4. Run fixed specs individually → confirm fix
5. Run ALL specs together again → check for serial contamination
6. If spec passes individually but fails in run-all → RCA is serial state, timing, or auth
7. Iterate until run-all is green

**Trigger**: Any spec-fixing session. Enforced by healer/maintainer agents.

## LR-019: Every test MUST start from an enforced baseline — PER-TEST, not first-test-only

A test that sets a **fixed-set** value (checkbox / combobox / radio) then asserts Save-enables or
persistence-after-reload is **net-zero-vulnerable**: if the page starts dirty (a prior crashed run,
OR a per-test retry that re-runs one test without TC-001), the "change" is a net-zero no-op → Save
never enables → the assertion fails against correct app behavior. Baseline MUST therefore be reset
**per-test in `beforeEach`** — a first-test-only (TC-001) baseline is **INSUFFICIENT**.

Why first-test-only rots: serial blocks + `dependencyGate` were dropped 2026-05-08 (annotation-only
since), so TC-001 no longer guarantees-runs-first; and `retries` re-run a single failed test **plus
its `beforeEach` but NOT TC-001's body**. The 2026-05-27 Legal failures (TC-LGL-009/011/013…) are the
graduating incident — TC-001 *had* a baseline, yet a retry of TC-009 alone skipped it.

How to satisfy it:

1. **Preferred (compile-enforced):** author new CRUD/save tests via the FCC runner
   (`saveAndVerifyCase`, `clients/encore/src/utils/field-case-runner.ts`). Its `baseline` field is
   **required at compile time** — a case literally cannot exist without one. This is the only
   *structural* guarantee; prefer it for all new CRUD.
2. **Non-FCC describe:** wire a hardened `ensureDefaultState(defaults)` into the describe's
   `beforeEach` (after the nav-guard). Use the proven Legal pattern
   (`clients/encore/src/pages/locations/location-legal.page.ts` `ensureDefaultState` — bounded retry
   wrapping read → re-select → save → reload → re-verify; **throws** if still dirty after 3 cycles,
   because `clickSaveWithDialog` returns `{success:true}` when Save is disabled, so save-success
   alone never proves the reset landed).

**Scope of work (no blanket backfill):** apply this to any spec you **ADD or do CRUD on** — wire the
spec you're touching, cleanly, in the same change. Do **NOT** retro-fit untouched specs: a clean
single-worker run (2026-05-29) showed **zero** current baseline failures, so this is *preventive*
discipline for new work + CI's parallel/retry runs, not a repair of a broken suite.

**Trigger**: Every new spec, AND every time you add/modify a CRUD/save test in an existing spec.

## LR-021: Un-skip before rewrite — always try original logic first

When fixing a skipped test, FIRST remove the skip and run the original test logic AS-IS.
If it passes, the underlying bug was fixed — keep the original assertions.
Only rewrite to "test actual behavior" if the original logic STILL fails.
This prevents unnecessary test rewrites and catches silently-fixed bugs.

**Corollary — atomic un-skip + harden (2026-06-18)**: when you un-skip a test, apply its LR-019
per-test baseline hardening (`ensureDefaultState` / `saveAndConfirm`) in the **same change**. An
un-skipped-but-unhardened test is MORE fragile than a skipped one — it now runs but flakes under
serial/retry execution. (2026-06-18 Pricing RC-7: TC-020 + TC-026..030 were un-skipped without the
per-test baseline, leaving the suite worse than when they were skipped.) Never split un-skip and
harden across changes. Mirrored as Anti-Assumption Gate 5 in `PLAN_BIG_PIVOT_FCC_MASTER.md`.

**Trigger**: Any session that involves fixing skipped tests.

## LR-061: No generalization from a single observation; no "un-drivable" without verify-first

Two anti-assumption gates that turn the SUPREME "NEVER ASSUME" rule + `feedback_stop_guessing.md`
into spec / page-object discipline. Sibling of LR-059 (no "works / verified" claim without driving
the real counterpart) — this is the **negative-claim** side ("corrupt", "un-drivable").

**A. N≥2 evidence before any generalization about app behavior.** A claim that data is "corrupt",
an office is "atypical", a defect is "app-wide", or a divergence is a "regression" requires ≥2
independent evidence sources — a SECOND office, OR the baseline (old site). One office is a single
data point: it cannot distinguish office-specific data state from app behavior. (2026-06-18 Pricing:
"1604 is corrupt" was asserted from one office; the user had to force a 1605 isolation test +
baseline check.)

**B. Verify-before-blocked.** Before declaring any control un-drivable / not-automatable / "won't
accept input" / blocked, do ALL of:
1. Clear leftover overlays + reload (a stuck modal from a prior bad keystroke blocks every later click).
2. Diff the page object's EXISTING selectors against the live DOM — UI text drifts and a stale
   selector (`getByRole('textbox', {name:'Search pricebooks...'})` vs live `'Search pricing
   strategies...'`) silently never resolves (LR-029 class).
3. Inspect the actual DOM structure (target the option `<button>`, not an inner `<span>`; use the
   search box of a cmdk command palette).
4. Try the documented interaction method (page-object helper / `.claude/context/patterns.md` node).
Only after all 4 may a control be classed un-drivable — and the evidence (what was tried) is
recorded. (2026-06-18 Pricing: the dropdown was wrongly called un-drivable; the real cause was a
stuck overlay + a stale `'Search pricebooks...'` selector — a one-line fix.)

**C. Positive-control before any negative/terminal verdict on a control (2026-06-19).** Section B
makes you *try harder*; section C makes you *prove your tool works*. Before recording ANY
"inert / defensive / un-drivable / does-not-add / control-does-nothing / no-add-affordance" verdict,
you MUST prove the **same primitive** you used can mutate a **known-positive case** — a control, row,
or mode where that action is *expected* to succeed:
- Primitive fires on the known-positive case but NOT on the control under test → the verdict can
  stand (it is the control/app, not your driver).
- Primitive does NOT fire on the known-positive case → your **driver** is the problem, not the app —
  fix the primitive and re-test BEFORE any verdict.

A no-op recorded with **no positive control is unsound evidence** and may not be cited to skip a
test, mark NOT-AUTOMATABLE, file a "no add affordance" bug, or close a surface. This is the M1
miss-class: Detail drag "proven" not-to-add via `.dragTo()`; Override "inert cells" concluded from a
raw-JS `.click()`; `New ▾` reached by URL and never clicked — each a primitive that silently never
fired, accepted as app behavior.

**Two known-bad primitives (these specific no-ops MUST never become a verdict):**
1. **React onClick** — a raw-JS `element.click()` / `dispatchEvent(new Event('click'))` does NOT
   reliably fire a React (synthetic-event) `onClick`. Use Playwright's `.click()` (it dispatches the
   full trusted pointer sequence). The Override "inert cells / RBAC" call was a raw-JS `.click()`; a
   Playwright `.click()` revealed the active `spinbutton` (W15-A 2026-06-09). Raw-JS click is for
   reads/probes, never the basis for a "control does nothing" verdict.
2. **Drag-and-drop** — NEVER assert "drag does not add" via Playwright `.dragTo()` or a single
   dispatched drag event; `.dragTo()` frequently never fires HTML5/React DnD at all. A DnD verdict
   requires the **full pointer sequence** (`mouse.move(source) → mouse.down() → mouse.move(target,
   {steps:N}) → mouse.up()`, or `page.dragAndDrop(src, tgt, {steps:N})`), verified against a
   positive control where a drag IS expected to add (e.g. create/New-Pricebook mode, where the same
   drag DOES add — proving the management-mode no-add is real, not a dead primitive).

**Trigger**: any session about to (a) classify app behavior as corrupt / atypical / app-wide /
regression, (b) mark a control un-drivable / not-automatable / skip a test citing "can't drive it",
or (c) record an inert / defensive / does-not-add / control-does-nothing verdict via a click or drag
primitive. Enforced by `PLAN_BIG_PIVOT_FCC_MASTER.md` §Anti-Assumption Gates + per-agent HARD STOPs
(REQUIREMENTS / PLANNER / GENERATOR / HEALER / WATCHDOG all carry the verify-before-blocked +
positive-control embed) + the patterns.md "Before declaring a control un-drivable" node + master
Sweep 13 (`ASSUMPTION-UNISOLATED`).
**Graduated from**: 2026-06-18 Pricing FCC session (RC-1 + RC-2) for A/B; the positive-control
corollary C from PLAN_CORP_PRICING_REWALK_REMEDIATION RCA (2026-06-19, M1 — the drag/inert-cell/New▾
false-negative class; see `clients/encore/specs_planning/_internal/agent-mistakes.md`). Same family
as LR-059, LR-021, LR-032 (MCP test don't theorize), LR-029 (verify selectors vs live DOM), LR-057
(affordance probe).

## LR-022: No hardcoded structural counts in assertions

Never assert exact counts of DOM elements (`.toBe(42)`, `.toHaveLength(114)`) unless
the count itself is the feature under test. These break on any UI addition/removal
without catching real bugs. Use content assertions (`.toContain()`), behavior assertions
(click → verify effect), or existence checks (`.toBeGreaterThan(0)`).
**Trigger**: Any test generation or review session.

## LR-024: Clean artifacts and run fresh BEFORE any RCA — never diagnose from stale data

When fixing failing specs:

1. Clean ALL artifacts (`npm run clean`, clear `.auth/`)
2. Run the spec fresh
3. THEN RCA from the actual failure evidence

Stale diagnostics accumulate from multiple prior runs and will lead to wrong root causes.
Historical example: stale diagnostics said LGL-010 was an SSO reload issue. Fresh run showed
LGL-013 failed (Radix dropdown instability). Second fresh run showed LGL-010 failed with
the SAME Radix issue. The stale diagnostics were 100% wrong about the root cause.

**Corollary**: Run the failing spec TWICE before RCA to confirm the failure is consistent
and identify whether it's deterministic or intermittent (same test vs different test each time).
**Trigger**: Any spec-fixing session. Complements LR-018 workflow.

## Annotation: dependencyGate is annotation-only (2026-05-08)

`dependencyGate(['TC-...'])` is annotation-only as of 2026-05-08 (PLAN_DEPENDENCY_GATE_REMOVAL); never gates execution. Tests surface their own failures via per-test `test.beforeEach` nav guards in each spec (mirrors local-office-settings.spec.ts:33). Dep declarations remain visible in Allure as `dependsOn` annotations; the prior `depGateSkipped` cascade is gone.

## LR-025: Radix UI large-option dropdowns need retry on option selection

Radix UI Select with many options (50+) auto-scrolls to the checked item on open.
Options above the scroll position become "not stable" (bounding box changing during
scroll animation) then "detached from DOM" (portal re-render). This is intermittent —
depends on timing, browser load, and how far the target option is from the checked one.

Fix pattern: wrap open+click in a retry loop (max 3). On failure: press Escape to close
the listbox, wait for hidden, re-open, `scrollIntoViewIfNeeded()`, then click.
Reduce per-attempt timeout (5s) so retries stay within total budget.

**Trigger**: Any combobox/select interaction with 50+ options in Radix UI.

## LR-051: No `.toBe(true)` on boolean OR-expressions — failure diagnostics are opaque

Forbidden: `expect(a === x || a === y).toBe(true)` — on failure the report reads
`expected false to be true` with no signal of what `a` actually was.

Permitted: a branching assertion that forces a structured diff
(`if (a !== x && a !== y) { expect(a).toBe(x); }`), or `expect([x, y]).toContain(a)`
where `.toContain` is allowed by the spec's catalog rule.

**Reason**: opaque diagnostics in CI cost more debugging time than the assertion costs to write.
**Trigger**: any assertion against a tested value with 2+ valid forms (encoding variants,
race-condition valid states, documented placeholder/auto-empty behaviors).

## LR-052: No fixed `waitForTimeout` inside count/state polling loops

Forbidden: `while (count > 0) { ...; await page.waitForTimeout(N); count = await ...; }`

Permitted: `await page.waitForFunction(...)` that polls for the actual transition
(e.g., `document.querySelectorAll(sel).length < previousCount`).

**Reason**: fixed sleeps compound linearly across N iterations, flake on slow CI, and
never confirm the transition actually happened.
**Trigger**: any while/for loop containing a Playwright action followed by a count or
state recheck.

## LR-053: No strict row-count assertions when an auto-empty-row bug is documented

When the test cases doc warns about an auto-empty placeholder row (BUG-LOC-NTS-003 class),
do NOT use `getRowCount() === N` after save+reload. Assert per-row content for rows
`0..N-1` instead.

**Reason**: the test cases doc warning is canonical; ignoring it produces flake when the
underlying bug fires.
**Trigger**: any post-save/reload assertion on Angular form-array tabs with a documented
placeholder behavior.

## LR-056: Network listener URL filters target the backend save endpoint — never substring-match the page URL

`page.on('request', ...)`, `page.waitForRequest(...)`, and `page.waitForResponse(...)`
listeners that observe save behavior MUST filter on the actual backend API endpoint, not
on a substring that overlaps with the page URL.

**Forbidden**: `req.url().includes('/settings/location')` on Encore (or any equivalent
substring that matches the page path). Modern frameworks (Next.js App Router, RSC) fire
POSTs to the page URL for server-component renders and hydration cascades — these run
0-8s after any `page.reload()` and are NOT data saves. A page-URL-substring filter
captures them as false positives, indistinguishable from real saves.

**Required**: filter on the backend API path (e.g., `req.url().includes('/navigator/api/')`)
or the exact endpoint (`'/navigator/api/location/update-properties'`). Real saves go
through the backend API; framework hydration POSTs do not.

**Discovery procedure** (before authoring any network listener):
1. Inspect a known-passing save test's network log via `playwright-cli network` after a
   real save, OR
2. HEADED CLI walk: fill form → click Save → confirm → observe `window.fetch` interception
   to capture the actual save request URL, OR
3. Read the existing page-object's save method or its `clickSaveWithDialog` invocation
   to find the documented endpoint.

**Reason**: graduated from PLAN_FRAMEWORK_LIFECYCLE_NOTES_PILOT_V2 Session 4 closure
(2026-05-22). FCC-027 used `req.url().includes('/settings/location')` and captured
Next.js 15 App-Router RSC framework POSTs as save POSTs. Three sessions investigated
before mama-led /rca (Subagent A timeline + Subagent B HEADED CLI 9-variation walk)
identified the real save endpoint as `PUT /navigator/api/location/update-properties`.
A page-URL-overlap filter is undetectable from the test's perspective — it always
looks correct in isolation, then fails in run-all when prior tests trigger reload
cascades.

**Trigger**: any spec authoring or modification that attaches `page.on('request', ...)`,
`page.waitForRequest(...)`, `page.waitForResponse(...)`, or `page.route(...)` for the
purpose of asserting save behavior. Also fires on `find-bugs` / `bugfix` sessions that
add request observers to a spec.
