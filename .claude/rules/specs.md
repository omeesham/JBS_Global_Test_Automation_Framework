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

**Structural enforcement (2026-07-01).** LR-019 is no longer rule-only — a 2026-06-30 audit found the
rule had rotted on five save-capable specs (`location-local-information`, `local-office-settings`,
`local-office-ect`, the non-FCC describes of `location-notes` + `location-shared-setup-locations`),
each carrying its baseline only in the first test's body. Defense in depth now mirrors LR-066/LR-067:

1. **Gate (`scripts/check-per-test-baseline.mjs`, wired into `.githooks/pre-commit` Gate 5e / `npm run
   check:per-test-baseline`).** Registry-driven: every save-capable describe must carry a recognised
   per-test mechanism (`ensureDefaultState`/`ensureEmptyState`/`ensureClean*` in `beforeEach`, the FCC
   runner `saveAndVerifyCase({ baseline })`, or a fresh `open()`) — a first-test-only baseline fails.
   The known gaps are **WAIVED** (with a ≥20-char reason) pending each submodule's FCC subplan; a new
   unguarded save-spec **fails the commit**; the glob WARN pass flags any save-capable spec missing
   from the registry. The gate credits all three mechanisms, so it does not false-flag FCC / fresh-open
   describes (the false-positive class that misled the first-pass audit).
2. **Agent HARD STOPs** — GENERATOR #16 + HEALER #11: wire the baseline AND register/waive the spec in
   the SAME change.
3. **Backlog** — three deferred fixes remain (`location-local-information`, `local-office-settings`,
   `local-office-ect`), recorded in `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` (per-test-baseline
   section); each FCC subplan lands its fix and removes that spec's gate waiver. A waiver is a tracked
   promise, not a fix — the gap stays real until the FCC subplan closes it. The other two of the
   original five — the non-FCC describes of `location-notes` + `location-shared-setup-locations` — plus
   `location-account-address` were wired to a per-test `beforeEach` reset in place on 2026-07-01 and are
   now ENFORCED (account-address uses a dedicated non-empty Phone 2 baseline that side-steps the open
   empty-Phone-2 persistence issue).

**Trigger**: Every new spec, AND every time you add/modify a CRUD/save test in an existing spec.

### LR-019 amendment — wiring a reset REQUIRES a full-suite run + a chain scan (2026-07-02)

Graduated from the 2026-07-01 SSL-013→014→015 break: a `beforeEach` reset (`ensureCleanSSLTable`)
was added to `location-shared-setup-locations`, but it wiped an UNSAVED row that TC-013 left for
TC-014/015 to consume — a hidden output→input chain. The change was verified only by a bounded
grep-smoke (`--grep TC-LOC-ACC-017|TC-LOC-NTS-001|TC-LOC-SSL-001`, 4 passed) while the plan required
the FULL `location-shared-setup-locations` suite. The one behavioural check that covered the chain
was silently narrowed to a sibling that could not hit it (an LR-046 strict-line rescope with no HALT).
Every automated gate is structural (regex) and cannot see a runtime chain break — only a full run can.

Two obligations, both non-optional, whenever you wire or change a per-test reset in a save-capable
describe:

1. **Chain scan BEFORE.** Grep the describe for cross-test coupling — `// Depends on`, prior-state
   reads, an unsaved row/state one test leaves for the next — before adding a reset. If a chain
   exists, either make each test self-contained (re-establish its own precondition) or scope the reset
   so it cannot wipe a live precondition. A reset "normally a no-op" is exactly the false-assumption
   that shipped this break.
2. **Full-suite run AFTER.** Run the ENTIRE spec file (not `--grep` a subset) after wiring the reset —
   that is the ONLY check that exercises inter-test order. A bounded grep-smoke does **not** satisfy
   this line: if the plan/verification step says "run the full spec", narrowing it to a subset is a
   silent rescope (LR-046) and must HALT-and-ask, not proceed. `/final-q` cross-checks the plan's
   verification-step text against the command actually run and flags a narrowed run.

Cross-refs: LR-018 (run-all is truth), LR-046 (strict-line HALT-not-rescope), LR-060 (no silent
checkpoint), and the pre-commit spec-sleeps / unfailable-assertion / swallowed-failure gates (which
catch the *structural* failure classes this rule's *runtime* class complements).

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

## LR-066: Save-route parity — every save-capable route exercises a real Save

When a module exposes **N sibling create/save routes that share one page** — they differ only by a
route param or mode (e.g. `…/add?type=equipment` vs `…/add?type=labor`) — EACH route must have ≥1
test that **drives a real Save**, not merely a load + field-enable check:

- **Dialog-reach minimum**: a test that clicks Save and asserts the confirmation dialog appears, then
  Cancels (`clickSaveExpectDialog` / `clickSaveWithDialog` / `saveAndConfirm`).
- **Commit where the primary route commits**: if any sibling route has a commit-and-persist test, every
  sibling must too (`confirmSaveAndGetNewId` / `saveAndVerifyCase`), OR carry an explicit
  `parity-waived: <reason ≥20 chars>` marker explaining why that route legitimately cannot commit.

A save-capable route closed on **load + field-enable checks alone** does NOT satisfy this — "the field
enables Save" is not "Save works." The thin route is synced, green, and exists, so the structural gates
(TC counts, MD/XLSX sync, file-exists, pass/fail) never flag it — none measures behavioral depth.

**Why this is load-bearing, with proof**: the 2026-06-30 NM-2263 Labor gap. The Equipment route had a
full Save flow (dialog→Cancel + commit→persist→Search); the Labor route had only a Save-*enable* check.
Adding the missing Labor commit test (TC-CPR-NPB-052) immediately surfaced a **real behavioral
divergence the thin route had hidden**: the Corporate Pricing Search screen hides Labor pricebooks
unless the "Is Labor" filter is on — so "does a Labor pricebook save and become findable?" was not just
untested, it was *non-obvious*. An enable-only sibling is exactly where route-specific behavior goes
undiscovered. (It is also a quiet LR-046 break — a strict "Equipment + Labor" acceptance line silently
rescoped to enable-only without a HALT.)

**Trigger**: any spec authoring or modification for a module with ≥2 route-param/mode siblings on a
shared save page. Enforced by `scripts/check-save-route-parity.mjs` (a registry-driven gate wired into
`.githooks/pre-commit` as Gate D) + the WATCHDOG audit checklist (`/audit` review mode + `AUDIT.md`).
**Graduated from**: 2026-06-30 — SUBPLAN_CORP_PRICING_LABOR_SAVE_AND_ROUTE_PARITY_GATE, after the
NM-2263 Labor enable-only gap shipped through every structural gate undetected.

## LR-067: Reverting or persisting shared server state MUST verify persistence — never trust the save call

Any page-object method that reverts or sets state on the shared test server — names matching
`restore* | reset* | revert* | cleanup* | ensureDefault* | ensureAll*`, plus any per-test baseline helper — MUST
prove the change landed: re-read the persisted value after a reload, with bounded retry. Use the
shared `BasePage.saveAndVerifyPersisted({ isAtTarget, applyMutation, save, reload })` helper rather
than re-implementing the loop. (DOM-only conveniences that intentionally do NOT save — e.g. a
between-assertion grid uncheck — are exempt, but their comment must say so, and the authoritative
per-test reset that DOES persist must verify.)

Two failure modes this closes (both live in the office-1604 Pay To leak that persisted "Encore
Bahamas" to the shared server and cascaded the whole left-panel spec during the 2026-06-30 cold-run
of the locations deliverable):

1. **The save call lies.** `clickSaveWithDialog` (and its hand-copied twins) returns `{success:true}`
   when the Save button is DISABLED — a no-op indistinguishable from a real persisted save — and
   returns `{success:false}` on a 4xx/5xx that a caller can silently ignore. So save-success alone
   never proves anything persisted. No save primitive may report success/ok on a branch where no save
   ran: signal the no-op distinctly (`saved:false`, or a dedicated `'disabled'` result) so a caller
   can tell "saved" from "did nothing." The post-reload re-read is the load-bearing check, not the
   boolean.

2. **A verify-only guard that throws is NOT enough when self-heal is possible.** A guard may throw on
   drift ONLY when repair is genuinely impossible. "Reading the value back is ambiguous" is NOT such a
   reason when an ID-/value-anchored re-set exists (e.g. Pay To reads the ambiguous name "Encore" but
   can be re-set by ID 1) — there, self-heal via the hardened restore, and throw only if THAT fails.

**Structural enforcement (2026-07-01).** This is no longer rule-only — a BLOCKING gate
(`scripts/check-save-honesty.mjs`, wired into `.githooks/pre-commit` Gate 5f; framework-side, never
ships) fires on every staged `clients/*/src/pages/**.ts` and FAILS the commit if (1) a non-query method
reports success on an `isDisabled()` branch without signalling the no-op (`saved:false` / `'disabled'`),
or (2) a `restore* | reset* | revert* | cleanup* | ensureDefault* | ensureEmpty* | ensureClean* | ensureAll*` method
calls a save helper but neither uses `saveAndVerifyPersisted` nor a retry loop. The gate is fail-green
(zero flags on the clean tree before it was wired to block) and carries one escape valve: a method that
legitimately persists-then-verifies by a path the gate cannot see, or a DOM-only reset, declares
`// save-verify-exempt: <reason>` in its body. Sibling of the LR-066 save-route-parity gate (Gate 5d)
and the LR-019 per-test-baseline gate (Gate 5e).

**Trigger**: any new or modified page-object method that reverts/persists shared server state, and any
new save primitive. **Graduated from**: 2026-06-30 — the office-1604 Pay To "Encore Bahamas" leak
found during the independent cold-run of the locations deliverable; one weak one-shot restore plus
duplicated lying save primitives. Cross-ref LR-019 (per-test baseline mandatory), LR-009/LR-026
(Angular dirty state), LR-059 (no "verified" without driving the real thing).

## LR-068: No silent partial coverage — every asserted record's fields are all covered or all explained

When a test validates a structured record (a CSV row, a JSON object, an API response body, any payload
with a fixed field set), every field is either asserted OR carries an explicit, evidence-based
documented reason for being excluded (data-blocked — no sample exists to check a format against;
domain-unknown-after-research — the field's meaning could not be confirmed even after checking the
live data + Jira/Confluence). "I don't know this field's format" is a research trigger — go look at a
real sample, check the spec doc — never a free pass to leave it silently unasserted while the
surrounding test still reports green.

This is the sibling of LR-031: LR-031 catches an agent writing an explicit `test.skip` /
`NOT-AUTOMATABLE` without exhausting investigation first. LR-068 catches the quieter failure — a test
that never skips anything, passes green, and still leaves part of the record unchecked because nobody
noticed the gap. A passing test with silently narrower coverage than its own record shape is exactly as
dangerous as an unjustified skip, and harder to catch, because nothing about the test run signals that
anything is missing.

**How to apply**: before finalizing an assertion over a structured record, list every field the record
actually carries (read a live sample, not just the fields the plan mentioned) and account for each one —
asserted, or excluded with a one-line reason naming what was checked (a live sample / the spec doc) and
why it can't be asserted yet. If the reason is "no populated sample exists for this field's non-default
state," that is a legitimate data-blocked exclusion — write it down next to the assertion, don't leave it
unmentioned.

**Deliberately no gate/hook**: detecting "this test should have asserted field X" from static analysis
is heuristic and false-positive prone — the noise from a naive "are all record fields referenced
somewhere in this test" check would be worse than the problem it catches. This rule is enforced by
agent awareness (this entry + the paired memory note) at authoring time, not a structural gate.

**Trigger**: any spec authoring or modification that asserts against a structured record (CSV row / JSON
object / API response) with a fixed, known field set.
**Graduated from**: 2026-07-07 — TC-CPR-TIO-023 (NM-2262 Loc Pricing Export) asserted 8 of the CSV's 11
columns and silently left the 3 date columns (`UseDate`/`StartDate`/`EndDate`) unasserted; the gap
surfaced only because the user asked directly, not because any structural check caught it. Root cause:
"unknown date format" was treated as a free skip instead of a research trigger, and LR-031 only covers
explicit skips, not silent under-assertion inside an otherwise-green test.

### LR-068 corollary — assertion strength (assert the strongest KNOWN oracle)

LR-068 says *cover every field*; this corollary says *cover each one at full strength*. A field that is
"asserted" by a weak oracle is only cosmetically covered — a real regression still sails through. Three
concrete forms, all from the 2026-07-07 NM-2264 Export-All council review:

- **(a) Literal over comparison when the true value is KNOWN.** If the expected value is knowable (an
  empty scope is `0`, a fixed set is `[2026,2027,2028]`), assert the literal (`toBe(0)`), never a weaker
  relative comparison (`toBeLessThan(other)`). The test's own name is the spec — a test titled "CAD
  Equipment has no pricebooks" whose oracle is `cadCols < usdCols` still passes when CAD wrongly returns
  1..N columns. (Council #1: TC-040 CAD-Equipment empty-scope asserted comparatively, not `=== 0`.)
- **(b) Collection VALUE, not just length.** An array / repeated-query-param / `getAll(...)` oracle must
  assert membership or the exact set, not only `.toHaveLength(n)`. Wrong values with the right count pass
  a length-only check. Prefer `expect([...vals].sort()).toEqual([...expected].sort())` (sort-agnostic
  unless order is proven meaningful). (Council #3: TC-031/038 `getAll('years')` asserted count-only.)
  This one has a **warn-only structural net** — the `getall-length-only` kind in
  `scripts/check-unfailable-assertions.mjs` (ratcheting toward enforce), escape `// length-only-ok:`.
- **(c) Every field of the structured record** — the core LR-068, restated: a CSV row / query-param set /
  JSON body asserts each field or documents the exclusion. (Council #5/#6: the wide-matrix body's
  currency row + per-row width, and the download-tied request's `currencyId`/`years`/`locale`, were
  silently uncovered.)

**Mandatory adversarial self-pass** for any TC asserting an export / CSV / structured record / captured
request: before calling it done, re-read each assertion and ask "what wrong value would STILL pass this?"
— the exact pass a cross-vendor reviewer runs. Then run `npm run check:spec-quality` on the **working
tree** (LR-060) — a commit-time-only gate does not run on uncommitted work, and green ≠ strong.

**Gate coverage is partial by design**: (b) is netted warn-only; (a) and (c) are heuristic/FP-prone and
stay gate-less per LR-068's "deliberately no gate" reasoning — they are caught by this awareness + the
self-pass + the paired memory note, not by regex.
