# SUBPLAN_CURRENCY_FCC

**Status**: DONE
**Priority**: P1
**Created**: 2026-06-15
**Identity**: OWNER (multi-identity within phases — WATCHDOG → HUNTER → GIVER → BUILDER → HEALER → WATCHDOG → GARDENER → OWNER)
**Parent**: PLAN_BIG_PIVOT_FCC_MASTER.md
**Depends on**: SUBPLAN_NOTES_FCC_PILOT.md (DONE 2026-05-22 — paradigm infra: `clients/encore/src/utils/field-case-runner.ts`)
**Blocks**: none (Currency is not a prerequisite for other FCC subplans)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**BrowserTool**: cli
**Justification**: multi-identity FCC pass over a 3×4 currency grid (Radix checkboxes + Radix merchant comboboxes + read-only code cells) with three cross-field/grid rules (single-default, at-least-one-selected, Selected→Is-Default enablement) — adaptive grid-state reasoning. Default Opus tier per LR-041 (`max` reserved for closure-gate RCA). CLI per LR-038 v2 (checkbox/dropdown interaction, no MFA, no visual/CSS work, no live `pause:` step).
**Author**: Rutvik (via Claude Opus 4.8)
**ActiveClient**: encore
**Executed**: 2026-06-17

---

## Execution Summary

**Executed**: 2026-06-17 (live walk + build) → closure finalized 2026-06-18. Identity: OWNER orchestrating the seven per-phase identities. Browser: Playwright CLI (auth refreshed once mid-session — 30-day-old state was stale; framework SSO setup project re-authed on attempt 1/3).

### TCs implemented / dropped
- **Net-new: 1** — `TC-LOC-CUR-028` (Reverting a currency selection re-disables Save — the LR-009/LR-026 revert-to-saved smart-diff gap; TC-015 toggled+reverted but never asserted Save re-disables). Behavior test (no save-cycle → no `saveAndVerifyCase` import).
- **Retained unchanged: 27** (TC-LOC-CUR-001..027) — bodies byte-for-byte untouched (STRICT-LINE-D; `git diff --numstat` = 80 insertions / **0 deletions**; the only existing-test change is the shared `beforeEach` baseline wiring).
- **Dropped: 0.**
- **USD-merchant save-cycle** (the plan's illustrative net-new candidate) = **(b) already covered by TC-022** (change→save→reload→assert→restore) — not minted as net-new (STRICT-LINE-B de-dup by proven outcome).

### Gap classification (LR-040 / STRICT-LINE-A/G)
Every editable surface × taxonomy case classified (a)/(b)/(c) in `clients/encore/specs_planning/_internal/field-case-catalogs/currency-2026-06-17.md`: 1 cell (a) net-new (TC-028); all others (b) cited to a proving TC; CAD/MXN merchant save-cycle (c) deferred (data-thin — CAD 1 option, MXN 0 options, office-1604-seeded, steering #2). No unclassified cell.

### Verification (LR-042 evidence-emission)
- `npx tsc --noEmit -p clients/encore/tsconfig.json` → **exit 0**.
- `npx playwright test location-currency.spec.ts --list` → **28 TC IDs** resolve (TC-001..028).
- `git diff --numstat` spec → **16 / 0**; page object → **64 / 0** (insertions-only; STRICT-LINE-D verified — no existing TC body line altered).
- Full spec run #1 → 28 passed + 1 TC-022 reload-timeout flake; run #2 → **29 passed (all 28 TCs, clean)**; TC-022 individually ×2 → both pass. Verdict: GREEN; TC-022 = intermittent `page.reload` timeout in existing untouched code (CI `retries:2` covers it). `beforeEach` hardening did not break the existing 27 (STRICT-LINE-F serial-safety verified).
- `npm run xlsx:build` → `locations_currency` **28 rows**; `npm run check:tc-parity` → **PASS** (all spec TCs present in MD + XLSX).
- LR-058 jargon grep on shipped spec + page object → **0 hits**; `eslint` (client config) → exit 0; barrel export intact.

### Documentation changes
- `locations_currency_test_cases.md` — header reconciled **27/25/2 → 28/28/0** (steering #1: the stale "2 manual" were the loop-parametrized TC-003/004, already automated; zero genuinely-manual TCs); appended `## Granular Cases` (coverage table) + `## TC-LOC-CUR-028`.
- `locations_currency_test_plan.md` — TC-028 Scenario + Coverage Index (27→28).
- XLSX deliverable rebuilt (28 currency rows).

### STRICT-LINE audit
- **A** (every surface×case classified): ✓ catalog gap matrix.
- **B** (zero duplication, by proven outcome): ✓ USD merchant = (b) TC-022, not net-new.
- **C** (net-new growth = catalog count ±15%, floor 0): ✓ catalog=1, spec grew by 1.
- **D** (existing 27 bodies untouched): ✓ git diff 0 deletions; only `beforeEach` + TC-028 added.
- **E** (closure requirements): ✓ this summary + matrix + gates.
- **F** (persisting tests restore baseline): ✓ TC-028 is non-persisting (no save); the per-test `ensureDefaultState()` enforces baseline; run #2 clean confirms serial-state safety.
- **G** (max-coverage floor, every cell a/b/c): ✓ no unclassified cell.

### Per-Identity Matrix closure
All 7 cells resolve to a real existing path (zero `(skipped)` per the full-identity-sweep mandate): HUNTER (field-inventory + old-site-baseline), GIVER (field-case-catalog + parity), BUILDER (spec + page object), HEALER (rca-remediation), WATCHDOG (phase-0-verification + false-green sweep + Phase-5 completeness audit GREEN via fresh subagent — AUD-017 no-self-grading), GARDENER (gardener-sweep), OWNER (this manifest + summary). All artifacts dated **2026-06-17**.

### Deviations (per feedback_plan_deviations_log)
1. **Artifact dates 2026-06-15 → 2026-06-17**: plan authored 2026-06-15 expecting same-day run; execution was 2026-06-17. Per LR-015 (session-date = filename-date), all artifacts + plan path references carry the real walk date 2026-06-17. Authoring/steering/Created dates left at 2026-06-15 (historical, correct).
2. **Net-new = 1, not honest-zero**: the plan's own §2.1 gap matrix flagged the revert→Save-disables cell as `(a)`; the sibling Auto-Add-On suite has this test (its TC-005) while Currency lacked it — a genuine proven gap, not padding. Honest-zero would have left a known, plan-named hole.
3. **Phase 5 ran via a fresh `audit` subagent** (separate context) to honor AUD-017 (the build + audit cannot share a session); verdict GREEN, 0 defects.
4. **MD `Automation File: specs/...` legacy prefix** on TC-028 matches the convention used by all 27 existing rows (a one-off `tests/` change would make it the odd row out); flagged for a future MD-wide cleanup, out of this subplan's scope.

### Cascade (LR-027)
`PLAN_BIG_PIVOT_FCC_MASTER.md` stays PENDING — `LR-027 cascade SKIPPED per master §Cascade closure rules (user override 2026-05-21)`. The child's DONE line is annotated into master §Roadmap line 94 (C4 parent-cascade sub-check).

---

## Context

`PLAN_BIG_PIVOT_FCC_MASTER.md` §Roadmap **line 94** names `SUBPLAN_CURRENCY_FCC.md`. Currency is a
Location Settings sub-tab (office 1604, `/navigator/locations/1604/settings`) rendering a **3-row × 4-column
grid** inside the `<next-location-settings>` shadow root: rows USD / CAD / MXN, columns Currency Code
(read-only) / Selected (Radix checkbox) / Is Default (Radix checkbox) / Merchant (Radix combobox), plus a
shared Save button + shared Save-Changes dialog. Three grid rules govern it: (1) selecting a currency
enables its Is-Default checkbox; (2) only one Is-Default allowed (mutual exclusion); (3) at least one
currency must stay selected.

This is a **gap-fill FCC pass** on a mature module — not greenfield. Existing assets (verified against the
live tree 2026-06-15, LR-020): page object, selectors, test data, spec, planning MD/XLSX all exist. The
dated FCC artifacts (field-inventory, old-site baseline, false-green sweep, field-case catalog) do **not**.
The load-bearing deliverable is the **LR-019 per-test baseline hardening** (the existing spec relies on a
first-test-only TC-001 inline reset + annotation-only `dependencyGate` chains — net-zero-vulnerable under
retry/parallel), plus an honest net-new set for any genuinely-uncovered cells.

### Full-identity-sweep mandate (user directive 2026-06-15 — beats the general FCC convention per LR-046 spirit)

The standard FCC pattern (e.g. `SUBPLAN_ACCOUNT_ADDRESS_FCC.md`) legitimately marks the HEALER and GARDENER
matrix cells `(skipped)` when their work is conditional/inlined. **This subplan does NOT.** Per explicit
user direction, *every one of the seven identities executes its job in full and emits its own dated
deliverable* — so nothing is left partial and no regression slips through an un-owned seam. The two cells
that the general pattern would skip (HEALER, GARDENER) here carry real dated artifacts. This is a
deliberate per-subplan upgrade above the FCC default, recorded here so an audit reads it as intentional,
not as scope-creep.

### Steering decisions (Rutvik 2026-06-15 — recorded so future agents don't re-ask)

1. **"2 manual" TCs** → the test-cases MD **header** claims 27 total / 25 automated / **2 manual**, but the
   live spec automates all 27 (25 literal `test()` blocks + a 2-iteration `UNSELECTED_CURRENCY_STATES`
   loop that parametrizes TC-003 CAD / TC-004 MXN via a backtick title). HUNTER (Phase 1) **reconciles**
   this: if the 2 are already automated (stale header), fix the header to 27/0; if 2 are genuinely manual
   in the per-TC `Status` column, **attempt to automate them** and defer any non-deterministic one with a
   recorded reason. No assumption either way — Phase 1 reads the per-TC `Status` column and the spec.
2. **Merchant save-cycle depth** → **USD only** (restorable via `ALTERNATE_USD_MERCHANT`). CAD has 1 option
   (no alternate to round-trip), MXN has 0 ("No Matches Found") — both data-thin / office-1604-seeded and
   not tracked in History; their merchant save-cycle is deferred LR-040(c) with reason.
3. **Net-new appetite** → **honest-zero is acceptable** (Auto Add-On precedent). Do not manufacture tests;
   the net-new count floats to what the gap matrix proves genuinely uncovered. The value floor is the
   false-green sweep + the LR-019 per-test baseline hardening + the dated artifacts — real even at zero
   net-new.

### Current state (verified 2026-06-15 against live code, LR-020)

- **Spec** `clients/encore/tests/locations/location-currency.spec.ts` — ONE describe block
  `'Location Currency @locations @currency'`; per-test nav-guard `beforeEach` (DOM-presence
  `isOnCurrencyTab()`); **25 literal `test()` blocks + a 2-iteration `UNSELECTED_CURRENCY_STATES` loop =
  27 runtime TCs** (IDs TC-LOC-CUR-001..027). `TC-001` **inlines a first-test-only baseline reset**
  (check USD Selected+IsDefault, set USD merchant, uncheck CAD/MXN, Save) and most TCs carry
  `dependencyGate(['TC-LOC-CUR-001'])` (annotation-only since 2026-05-08 → no longer guarantees order →
  the net-zero/state-leak risk LR-019 targets). **Zero `test.skip`/`test.fixme`. Zero FCC infra** (no
  `saveAndVerifyCase`, no `@fcc`).
- **Page object** `clients/encore/src/pages/locations/location-currency.page.ts` (~275 lines): checkbox
  get/check/uncheck, merchant get/options/select, `isMerchantNoMatchesFound`, `isMerchantDropdownAccessible`,
  `clickSave(): Promise<{success: boolean; networkError?: string}>` (**not `Promise<void>`** → runner needs
  a `saveAndConfirm()` wrapper), `confirmSaveDialog`, `reloadAndNavigateToCurrencyTab(): Promise<void>`
  (**no office arg** — currency-specific signature), `triggerBeforeunloadAndStay`. **No `ensureDefaultState()`
  baseline method** → BUILDER adds one.
- **Selectors** `clients/encore/src/selectors/locations/currency.ts` (`SetupCurrencySelectors`) — clean
  testid-based per-currency keys (`chk{CUR}Selected` / `chk{CUR}IsDefault` / `drp{CUR}Merchant`), column
  headers, `txtNoMatchesFound`. Re-exported from `clients/encore/src/selectors/index.ts:32` (barrel intact).
- **Test data** `clients/encore/src/data/locations/location-currency.ts` — `CURRENCY_COLUMN_HEADERS`,
  `UNSELECTED_CURRENCY_STATES` (CAD/MXN), `MERCHANT_DATA` (usd/bahamas/canada), `ALTERNATE_USD_MERCHANT`,
  `DEFAULT_CURRENCY`. All tied to office 1604.
- **Planning artifacts** — `locations_currency_test_cases.md` (27-TC header + **inline** field inventory
  lines 12-38, NOT a dated standalone artifact; header says "2 manual" — reconcile per steering #1),
  `locations_currency_test_plan.md` (27 scenarios). **No dated field-inventory, no old-site-baseline, no
  field-case-catalog, no false-green sweep, no phase-0-verification.** History coverage already routed to
  the LM-History per-column suite (test-plan lines 250-258) → OUT of scope here.

### Field-type map (drives the catalog — verified against `field-case-generation.md` §2)

| Currency surface | Type | Save-cycle? |
|---|---|---|
| Currency Code (USD/CAD/MXN) | read-only cell | No — `affordance: none` (LR-057) |
| **Selected** checkbox (USD/CAD/MXN) | Radix checkbox | **Yes** — toggle → save → reload |
| **Is Default** checkbox (USD/CAD/MXN) | Radix checkbox, enabled only when Selected | **Yes** — single-default mutual exclusion |
| **Merchant** (USD) | Radix combobox (2 options) | **Yes** — select-alt → save → reload (USD only per steering #2) |
| Merchant (CAD / MXN) | Radix combobox (1 / 0 options) | Deferred (c) — data-thin, office-seeded |
| Grid rule: at-least-one-selected | cross-field required-validation | behavior case (Save-disabled / validation) |
| Grid rule: single-default | cross-field mutual-exclusion | behavior case |
| Grid rule: Selected→Is-Default | cascading enablement | behavior case |

No plain-text/numeric/date/file fields, no multi-row FormArray (fixed 3 rows). De-dup is by **PROVEN
OUTCOME, not literal action** (master Doctrine item 8): a cell is (b)-covered iff its end-assertion appears
in the Step-2.0b coverage ledger (incl. coverage inside a multi-cell/grid test). Net-new (a) only where an
outcome is unproven. Honest-zero is a valid result.

---

## ⚠ Server-state safety (load-bearing — prevents cross-spec regressions)

Office 1604 is shared by every Location spec. Any FCC test that **persists** a grid change (Selected,
Is-Default, USD Merchant) MUST restore the baseline in `cleanup()`, verified by reload. Baseline = USD
Selected + USD Is-Default + CAD/MXN unselected + USD Merchant = `MERCHANT_DATA.usd`. Encoded as
STRICT-LINE-F; verified by the Phase 6 full-suite run.

**Restorability tiers:**
- **Selected / Is-Default** — restorable (deterministic known baseline). Persist tests safe → (a).
- **USD Merchant** — restorable (`MERCHANT_DATA.usd` ↔ `ALTERNATE_USD_MERCHANT`). Safe IF `cleanup()`
  re-selects `MERCHANT_DATA.usd` + reload-verifies → (a).
- **CAD/MXN Merchant** — deferred (c): CAD 1 option (no alternate), MXN 0 options. Not deterministically
  exercisable as a save-cycle on 1604 → `test.fixme` + reason, NOT a forced persist.

---

## Bootstrap

**Identity**: OWNER (sub-phases tagged via per-phase `/identity X`).
**Skills auto-called**: `/identity` (each phase boundary), `/regression-guard` (pre+post BUILDER),
`/relevant` (session start), `/rca` + `/bugfix` (conditional — Phase 5 / Phase 6 RED), `/final-q` (closure, LR-042).
**Context files (load order):**
1. `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` §Doctrine + §Roadmap + §False-Green Sweep Doctrine + §Cascade closure rules
2. `plans/done/SUBPLAN_ACCOUNT_ADDRESS_FCC.md` (freshest widest-surface sibling — blend-at-top + v3 matrix + `ensureDefaultState` reference)
3. `plans/done/SUBPLAN_AUTO_ADDON_FCC.md` (honest-zero + LR-019 `beforeEach` baseline-hardening precedent)
4. `clients/encore/specs_planning/_internal/field-case-generation.md` (FCC taxonomy — Checkbox + Dropdown/combobox + Cascading + Read-only rows; §2.1 Rejection-Affordance Oracle)
5. `clients/encore/specs_planning/_internal/field-inventory-spec.md` (8 frontmatter keys + 7 sections)
6. `clients/encore/specs_planning/test-cases/setup/locations/locations_currency_test_cases.md` (existing 27-TC header + inline inventory)
7. `clients/encore/specs_planning/test-plans/setup/locations/locations_currency_test_plan.md` (existing 27 scenarios)
8. `clients/encore/tests/locations/location-currency.spec.ts` (target spec — 25 literal + 2-loop = 27 runtime)
9. `clients/encore/src/pages/locations/location-currency.page.ts` (page object)
10. `clients/encore/src/selectors/locations/currency.ts` (`SetupCurrencySelectors`)
11. `clients/encore/src/data/locations/location-currency.ts` (test data)
12. `clients/encore/src/utils/field-case-runner.ts` (runner API — `saveAndVerifyCase(c: FieldCase): Promise<void>`)
13. `clients/encore/src/fixtures/pages.fixture.ts` (fixture key `locationCurrencyPage` — type @ :49, impl @ :346)
14. `.claude/rules/specs.md` (LR-018, LR-019 PER-TEST baseline, LR-021, LR-022, LR-025, LR-051, LR-052, LR-056)
15. `.claude/rules/angular.md` (LR-009, LR-010, LR-011, LR-026 — checkbox dirty-state + revert)
16. `.claude/rules/inventory.md` (LR-007, LR-013, LR-014, LR-015, LR-057 — field-inventory + affordance gates)
17. `.claude/rules/baseline.md` (LR-045 baseline-truth workflow)
18. `.claude/rules/deliverable.md` (LR-058 — no internal jargon in shipped client source)
19. `.claude/rules/pipeline.md` (LR-020, LR-027, LR-040, LR-041, LR-046, LR-048 v3, LR-050)
20. `.claude/rules/plan-closure.md` (LR-055 C1–C6)
21. `clients/encore/CLAUDE.md` (LR-008, LR-012, LR-017, LR-036, LR-ENC-001, LR-ENC-002, LR-ENC-003)

---

## Phase 0 — Dependency + browser-tool gate (LR-048 mandatory)

**Identity**: OWNER. **[GATE-D0]** Before any work begins, verify:
- [ ] `plans/done/SUBPLAN_NOTES_FCC_PILOT.md` frontmatter `Status: DONE` (paradigm infra shipped)
- [ ] `clients/encore/src/utils/field-case-runner.ts` exists and exports `saveAndVerifyCase(c: FieldCase): Promise<void>`
- [ ] Spec compiles; `grep -cE "test\('TC-LOC-CUR-" location-currency.spec.ts` = **25** literal + the `UNSELECTED_CURRENCY_STATES` loop = **27** runtime (confirm both)
- [ ] Fixture `locationCurrencyPage` present in `clients/encore/src/fixtures/pages.fixture.ts` (type + impl)
- [ ] Read the MD per-TC `Status` column: record which (if any) TCs are genuinely `Manual` vs the stale-header "2 manual" claim (feeds Phase 1 reconciliation, steering #1)
- [ ] Local run uses `.env.local` — never `CI_ENV=e2e` (LR-ENC-003)
- [ ] **Browser tool: CLI** (LR-038 v2 — no MFA, no visual, no live `pause`). Announce in first activity-log row. Auth refresh (if headless probe hits Entra) follows Gate 3: `playwright-cli open --persistent` → sign in → `state-save -s=e2e`.

**HALT** if any gate fails → escalate to Rutvik in chat.

---

## Phase 0.5 — WATCHDOG: empirical verification gate + false-green sweep

**Identity**: WATCHDOG (via `/identity WATCHDOG`)
**Mandate**: PLAN_BIG_PIVOT_FCC_MASTER.md §False-Green Sweep Doctrine obligations #2 + #3.
**Output artifacts (both dated):**
1. `clients/encore/specs_planning/_internal/phase-0-verification-currency-2026-06-17.md` — empirical gate
   (page-collision / context-options propagation / trace fidelity / per-test baseline presence). **PROCEED
   verdict required** before any spec/page-object change (mirrors `phase-0-verification-auto-addon-2026-06-11.md`).
2. `clients/encore/specs_planning/_internal/false-green-sweeps/currency-2026-06-17.md` — the 12-sweep report.

Sweep all 27 runtime tests + the page object against the **12 false-green patterns** (master table — incl.
Sweep 12 `UNPROBED-AFFORDANCE` / LR-057):
1. `.catch(() => {})` on action  2. `,\s*page\s*[,}]` destructure alongside custom fixture  3. `.toBeHidden()`/`.toHaveCount(0)` on missing element  4. `.isVisible()`/`.isEnabled()` in `if`/ternary  5. `force:true` + `.catch()`  6. all-negative-assertion tests  7. stale `test.skip`/`test.fixme` (LR-021 — spec currently has zero; confirm)  8. `page.on()` on built-in `page`  9. `page.waitForTimeout` as sole sync (LR-052)  10. assertions after `page.*` setup read via `pageObject.*`  11. `expect.poll()` timeout > 10s  12. `UNPROBED-AFFORDANCE` (read-only Currency Code cell / merchant combobox affordance asserted true but never select-cycle-probed).

**Special attention** (this spec's known risk surface): TC-001 inline first-test-only baseline +
annotation-only `dependencyGate(['TC-LOC-CUR-001'])` chains = a **STATE-LEAK / net-zero-vulnerable** class
(Sweep 10 / LR-019). Classify each affected test; route fixes to Phase 1.5 HEALER.

### Steps
1. Read `location-currency.spec.ts` line-by-line against all 12 patterns (classify the
   `UNSELECTED_CURRENCY_STATES` loop tests + the `expect.poll` in TC-005 — do not miscount dynamic titles).
2. Read `location-currency.page.ts` for swallowed errors / `.catch(() => {})` / `isVisible()`-in-`if`.
3. Emit both artifacts: per-test verdict (CLEAN / FALSE-GREEN / PARTIAL / FLAKY-MASK / STALE-SKIP / INFLATED / STATE-LEAK / UNPROBED-AFFORDANCE).
4. Any confirmed FALSE-GREEN / STATE-LEAK → routed to Phase 1.5 (HEALER).
5. Activity-log row per LR-028.

**HALT** if >3 confirmed FALSE-GREEN findings → surface to Rutvik. **Constraint**: this WATCHDOG session is
the *pre-build* half; the Phase 5 FCC-completeness audit is a **SEPARATE** WATCHDOG session (AUD-017 — no self-grading).

---

## Phase 1 — HUNTER: state-freshness walk + field-inventory + baseline + manual-TC reconciliation

**Identity**: HUNTER (via `/identity HUNTER`)
**Why a full walk:** no dated Currency field-inventory exists (only inline in the MD); the grid's
cross-field rules (single-default, at-least-one-selected, enablement cascade) need live re-confirmation; and
the stale "2 manual" header must be reconciled against live spec reality.

**Output artifacts (both dated):**
1. `clients/encore/specs_planning/_internal/field-inventories/currency-2026-06-17.md` — full field inventory
   per `field-inventory-spec.md` (8 frontmatter keys + 7 sections; `MCP_Session_Date` = filename date; every
   interactive cell has a `data-testid` row per LR-014; the 3 read-only Currency Code cells carry
   `affordance: none` per LR-057; defaults/states from this dated session per LR-015). Record live merchant
   option counts (USD=2 / CAD=1 / MXN=0) in §2 Live-state caveat as office-seeded.
2. `clients/encore/specs_planning/_internal/old-site-baseline/currency-2026-06-17.md` — observation-only
   old-site baseline (LR-ENC-001 / `.claude/rules/baseline.md`). Currency on the old site is an embedded
   sub-tab of `/setup/locationdetail/1604`; observe intended grid behavior. The new-site Radix grid UX +
   "Merchant Currency audit column" are baseline-absent → record `baselineScope: baseline-absent` (NOT a HALT,
   per LR-ENC-001).

**Walk steps (Playwright CLI, office 1604):**
1. Navigate to Location Settings → Currency tab; confirm 3 rows (USD/CAD/MXN) × 4 columns.
2. Confirm defaults: USD Selected + USD Is-Default; CAD/MXN unselected; Is-Default disabled until Selected.
3. Exercise the 3 grid rules live: select CAD → its Is-Default enables; check CAD Is-Default → USD Is-Default
   clears (single-default); uncheck all → confirm at-least-one-selected behavior (Save-disabled or validation,
   with the Rejection-Affordance Oracle per field-case-generation §2.1 — announced + escapable).
4. Open USD Merchant → confirm 2 options incl. `ALTERNATE_USD_MERCHANT`; CAD 1; MXN "No Matches Found".
5. Confirm read-only Currency Code cells (no input/contenteditable) — `affordance: none`.
6. Confirm shared Save button + Save-Changes dialog (reuse `dlgSaveChanges`/`btnSaveChangesConfirm` per LR-012).
7. **Manual-TC reconciliation (steering #1):** read the MD per-TC `Status` column. If the header's "2 manual"
   are the loop-parametrized 003/004 (already automated) → flag the header as stale (GIVER fixes it Phase 2).
   If 2 TCs are genuinely `Manual`, walk each live and record whether it is deterministically automatable on 1604.
8. Capture one CLI screenshot of the grid + one merchant dropdown.

**Drift handling**: structural drift (cell gone / testid changed) → HALT + surface. Activity-log row per LR-028.

---

## Phase 1.5 — HEALER: false-green / state-leak remediation + skip-audit (FULL SWEEP — always runs)

**Identity**: HEALER (via `/identity HEALER`)
**Output artifact (dated, unconditional):**
`clients/encore/specs_planning/_internal/rca-currency-baseline-remediation-2026-06-17.md`

Per the full-identity-sweep mandate, HEALER runs **every** time (not "conditional on findings") and emits a
remediation report documenting all three of:

1. **False-green / STATE-LEAK remediation** — fix each confirmed Phase 0.5 finding using the nested-orbit v2
   §A-1 decision (drop any bare `page` from destructure → use `<pageObject>.page`; replace vacuous negative
   asserts with positive proof). The expected primary finding here is the **net-zero-vulnerable inline-TC-001
   baseline + annotation-only `dependencyGate` chains** (LR-019): HEALER's fix is to convert it to a per-test
   `beforeEach` baseline (the actual code lands in BUILDER Phase 2; HEALER owns the RCA + the remediation
   record + verifies the fix resolves the net-zero class). Each existing test that was net-zero-vulnerable is
   listed with its before/after evidence.
2. **LR-021 skip-audit** — the spec currently has **zero** `test.skip`/`test.fixme`. HEALER confirms this
   live (grep + read), records "0 stale skips" with the grep output as evidence. (If the sweep surfaced a
   newly-needed skip for an app bug, HEALER files `BUG-LOC-CUR-<NNN>` per LR-034 and records it here.)
3. **Verdict** — every Phase 0.5 finding is either fixed (with evidence) or classified (a)/(b)/(c). Zero
   unfixed false-green is the gate to Phase 2.

MD sync per HEALER HARD STOP #6 if any test-case row changes. Activity-log row per LR-028.

> This is a REAL deliverable even if the sweep is clean: the report proves HEALER did the job (findings +
> skip-audit + verdict), it is not an empty `(skipped)` cell. An override cannot convert missing work into a
> deliverable (`feedback_override_cannot_convert_missing_to_evidence.md`) — so if there were genuinely zero
> findings AND zero skips, the report says exactly that, with the grep/read evidence that establishes it.

---

## Phase 2 — GIVER: exhaustive FCC gap-analysis catalog + TC additions + parity

**Identity**: GIVER (via `/identity GIVER`)

### Step 2.0 — Field-case catalog
**Output artifact**: `clients/encore/specs_planning/_internal/field-case-catalogs/currency-2026-06-17.md`

### Step 2.0b — Coverage ledger (PREREQUISITE to the gap matrix)
For EACH of the 27 runtime tests (incl. the 2 loop iterations + any newly-automated manual TC), enumerate
every `(surface/grid-rule, assertion-type)` it proves — **including each cell's persistence inside
multi-cell/grid saves**. The ledger is the de-dup oracle.

### Step 2.1 — Exhaustive (surface × case) gap matrix
**[STRICT-LINE-A]** Every taxonomy case for every editable Currency surface — Selected×{USD,CAD,MXN},
Is-Default×{USD,CAD,MXN}, USD Merchant, the 3 grid rules, and the read-only Currency Code assertion —
classified per LR-040 (a)/(b)/(c) against the ledger. No cell omitted.

Matrix columns: `# | Surface | Taxonomy case-class | Test shape (save-cycle / behavior) | Covered? (outcome in ledger) | Cite | Disposition`. Illustrative starter rows (GIVER finalizes against the live spec + ledger):

| Surface | Case-class | Shape | Likely disposition |
|---|---|---|---|
| Selected USD/CAD/MXN | toggle on → save → reload persists | save-cycle | (b) if existing persistence TC proves per-currency persist, else (a) |
| Selected | toggle-then-revert → Save stays disabled (LR-009/026) | behavior | (a) net-new per uncovered currency |
| Is-Default | check enables only when Selected (cascade) | behavior | (b) TC-005, cite line |
| Is-Default | single-default mutual exclusion | behavior | (b) TC-006, cite line |
| Is-Default | unselect → disables + unchecks Is-Default | behavior | (b) TC-007, cite line |
| At-least-one-selected | Save disabled when none selected (Oracle: announced+escapable) | behavior | (b) if TC-013..016 cover, else (a) |
| USD Merchant | select `ALTERNATE_USD_MERCHANT` → save → reload persists → restore | save-cycle | (a) net-new (STRICT-LINE-F) unless an existing TC already proves USD merchant persist |
| CAD/MXN Merchant | select → save → reload | save-cycle | (c) deferred — data-thin/office-seeded (steering #2) |
| Currency Code | read-only assertion (`affordance: none`) | behavior | (b) TC-018, cite line |

**[STRICT-LINE-B] Zero duplication — by PROVEN OUTCOME.** A net-new (a) is justified ONLY if it proves ≥1
assertion absent from the ledger. (b) cells carry a grep-verifiable cite to the proving test + line.
**[STRICT-LINE-G]** Max-coverage floor: every applicable cell is (a) net-new, (b) cited, or (c) named
deferral. Unclassified cell = HALT (LR-040). **Honest-zero (a) is acceptable** if every cell resolves (b)/(c).

### Step 2.2 — Net-new TC catalog
Number sequentially from **TC-LOC-CUR-028** (high-water mark = 027; gaps not reused). Each entry: ID, label,
surface, case-class, shape, expected outcome, restore obligation (STRICT-LINE-F) if it persists, bug-ref if
`test.fixme`'d. Final count = GIVER's gap verdict (**may be zero** — do not pad; STRICT-LINE-C floats to the
catalog count).

### Step 2.3 — Append to planning docs + reconcile the stale header (LR-ENC-002 parity — structural, never deferred)
- Append a `## Granular Cases` section to `locations_currency_test_cases.md` with every net-new TC + the full
  gap matrix; **fix the header** count/automated/manual figures per Phase 1's reconciliation (steering #1);
  flip any newly-automated manual TC's `Status`. No `-FCC-`/"FCC" naming in TC rows.
- Append matching Scenarios to `locations_currency_test_plan.md`.

### Step 2.4 — Rebuild deliverable
`npm run planner:post-complete` (or `npm run xlsx:build` if no queue entry). MUST show `selfAuditPassed=true`
/ `xlsxRebuilt=true`. Verify the `locations_currency` XLSX sheet row count reconciles to the corrected MD total.

### Step 2.5 — Self-audit + activity log
- `npm run check:tc-parity` exit 0
- Activity-log row per LR-028

---

## Phase 3 — BUILDER: spec + page-object + test-data implementation

**Identity**: BUILDER (via `/identity BUILDER`)
**Target file**: `clients/encore/tests/locations/location-currency.spec.ts`
**Secondary edits**:
- `clients/encore/src/pages/locations/location-currency.page.ts` — add `saveAndConfirm(): Promise<void>`
  (wraps `clickSave()`; throws on `!success`) + `ensureDefaultState(): Promise<void>` (HARDENED bounded-retry
  grid baseline) + any narrow restore helpers the catalog needs. Every new method cited in the Execution Summary.
- `clients/encore/src/data/locations/location-currency.ts` — add only constants the catalog needs (reuse
  `MERCHANT_DATA`, `ALTERNATE_USD_MERCHANT`, `DEFAULT_CURRENCY` for restore).

### Pre-requisites (BUILDER HARD STOP #11)
- [ ] `locations_currency_test_cases.md` has `## Granular Cases` with every net-new TC (or an explicit
      "honest-zero net-new" note + the gap matrix proving full (b)/(c) coverage) AND the corrected header
- [ ] `locations_currency_test_plan.md` has matching Scenarios
- [ ] `clients/encore/specs_planning/_internal/field-case-catalogs/currency-2026-06-17.md` exists
- [ ] `npm run check:tc-parity` exit 0 from GIVER
If any missing → HALT.

### Step 3.0 — `/regression-guard snapshot` (exports/imports/test-count/signatures)

### Step 3.1 — Page-object additions
- `saveAndConfirm(): Promise<void>` — wraps `clickSave()`; `if (!r.success) throw new Error(...)` (runner
  needs void).
- `ensureDefaultState(): Promise<void>` — **HARDENED per-test baseline** (LR-019 2026-05-29 rewrite),
  modelled on `location-legal.page.ts` / `location-account-address.page.ts` `ensureDefaultState`: bounded
  retry (max 3) wrapping read-grid → if drifted: set USD Selected+Default, CAD/MXN unselected, USD Merchant =
  `MERCHANT_DATA.usd` → save → **reload via `reloadAndNavigateToCurrencyTab()`** → re-verify; **THROWS** if
  still drifted after 3 (clickSave returns `{success:true}` even when Save is DISABLED, so reload+re-read is
  the only proof). No-ops when already clean.

### Step 3.2 — Test data
Add only what the catalog needs; reuse existing `MERCHANT_DATA` / `ALTERNATE_USD_MERCHANT` / `DEFAULT_CURRENCY`.

### Step 3.3 — Spec layout (BLEND-AT-TOP, master Doctrine item 3)
ONE describe block. Net-new tests (if any) inserted at the **TOP** of
`test.describe('Location Currency @locations @currency', …)` immediately after `beforeEach`, above
TC-LOC-CUR-001. Same tags, **no `@fcc` tag**, same naming. Existing tests follow byte-for-byte unchanged. The
shared `beforeEach` gets the hardened `ensureDefaultState()` AFTER the nav-guard (LR-019 per-test baseline —
**this replaces the obsolete TC-001-inlined first-test-only reset as the guarantee; TC-001's body stays
unchanged**, it just no longer carries sole responsibility). If honest-zero net-new, the ONLY spec changes
are the `beforeEach` hardening + any Phase-1.5 false-green fixes.

```typescript
import { saveAndVerifyCase } from '../../src/utils/field-case-runner';   // correct path (src/utils, not src/core)

test.describe('Location Currency @locations @currency', () => {
  test.beforeEach(async ({ locationCurrencyPage }) => {
    test.setTimeout(60_000);
    if (!(await locationCurrencyPage.isOnCurrencyTab())) {
      await locationCurrencyPage.navigateToCurrencyTab(OFFICE_NO);
    }
    await locationCurrencyPage.ensureDefaultState();   // NEW per-test enforced baseline (no-ops when clean)
  });

  // ─── NET-NEW granular cases (TC-LOC-CUR-028…) — blended at TOP, same naming, no @fcc ───
  // save-cycle example (plain-English comments only — LR-058 forbids LR-### / SUBPLAN_ / codenames in shipped spec):
  test('TC-LOC-CUR-028: <label>', async ({ locationCurrencyPage: pg, dependencyGate }) => {
    dependencyGate([]);
    test.setTimeout(60_000);
    await saveAndVerifyCase({
      id: 'TC-LOC-CUR-028', label: '<label>',
      baseline: () => pg.ensureDefaultState(),
      act: () => pg.selectMerchantOption('drpUSDMerchant', ALTERNATE_USD_MERCHANT.display),
      expectBeforeSave: async () => { /* dirty / Save-enabled */ },
      saveAndConfirm: () => pg.saveAndConfirm(),
      expectAfterSave: async () => { /* Save disabled */ },
      reload: () => pg.reloadAndNavigateToCurrencyTab(),
      expectAfterReload: async () => { expect(await pg.getMerchantValue('drpUSDMerchant')).toContain(ALTERNATE_USD_MERCHANT.id); },
      cleanup: () => pg.ensureDefaultState(),   // STRICT-LINE-F restore
    });
  });
  // behavior cases → ordinary test() with expect.poll (LR-052), no save step

  // ─── EXISTING 27 — UNTOUCHED bodies ───
});
```

### Hard requirements
- Save-cycle cases import `saveAndVerifyCase` from `'../../src/utils/field-case-runner'`; behavior cases use
  ordinary `test()` with `expect.poll` (LR-052).
- Fixture `locationCurrencyPage` (`: pg` alias allowed); `dependencyGate([])` on every net-new test;
  `test.setTimeout(60_000)` on net-new.
- **LR-019 per-test baseline** wired (hardened `ensureDefaultState()` in `beforeEach`; save-cycle tests also
  carry the compile-required `baseline` callback).
- **STRICT-LINE-F restore**: every persisting test restores the grid baseline in `cleanup()`, reload-verified.
- **LR-009/LR-026**: checkbox/merchant revert-to-original keeps Save disabled; recovery values differ from saved.
- **LR-025**: merchant dropdown selection uses the retry pattern if 50+ options (USD has 2 — n/a, keep the guard).
- **LR-056**: reuse the page object's `clickSave()`/`confirmSaveDialog()` network handling — do NOT add new
  `page.on`/`waitForResponse` listeners (sidesteps the page-URL-substring trap).
- **LR-012**: reuse shared `dlgSaveChanges`/`btnSaveChangesConfirm`.
- **LR-051/LR-022**: no `.toBe(true)` on OR-expressions; no hardcoded structural counts as assertions.
- **LR-058 (shipped-source hygiene)**: net-new spec/page-object/test-data comments + test titles use **plain
  English only** — zero `LR-###`, `SUBPLAN_*`, `§`, identity codenames, `_internal`/`field-inventor*`
  tokens. The write-time `jargon-gate.sh` hook DENIES otherwise.

**[STRICT-LINE-C]** Net-new spec growth = GIVER's catalog count (±15%, **floor 0** — honest-zero is in-contract). >15% over → HALT (LR-046).
**[STRICT-LINE-D]** Existing test **bodies** (TC-LOC-CUR-001..027, incl. the loop) UNTOUCHED.
`git diff --unified=0` lines touching existing TC IDs = 0. **Permitted exception:** the shared `beforeEach`
is modified for the LR-019 baseline (required wiring, not a TC-body edit) + any Phase-1.5 false-green fix to
a specifically-named test.

### Step 3.4 — Post-implementation
1. `npm run typecheck` clean
2. `npx playwright test location-currency.spec.ts --list` → existing 27 + net-new names resolve
3. `npm run check:tc-parity` exit 0
4. `/regression-guard diff`
5. Activity-log row per LR-028

---

## Phase 4 — GARDENER: code-quality sweep (FULL SWEEP — emits its own artifact)

**Identity**: GARDENER (via `/identity GARDENER`)
**Output artifact (dated)**: `clients/encore/specs_planning/_internal/gardener-sweep-currency-2026-06-17.md`

Per the full-identity-sweep mandate, GARDENER emits a real dated sweep report (not an inlined `(skipped)`
cell) recording each check + outcome + any refactor:
1. `npm run typecheck` clean — paste exit code
2. Lint — no new warnings
3. JSDoc on `saveAndConfirm()` + `ensureDefaultState()` + any new helpers
4. Dedup — no new page-object method duplicates `BasePage`; no copy-pasted FCC scaffolding (extract shared baseline)
5. Barrel exports — `currency.ts` selectors still re-exported from `selectors/index.ts:32`
6. LR-058 spot-check — grep the touched shipped files for banned tokens → 0 hits
7. `npm run check:tc-parity` exit 0
8. Activity-log row per LR-028

Structural refactoring allowed; business-logic changes NOT (GARDENER scope). Any refactor is cited in the report.

---

## Phase 5 — WATCHDOG: FCC completeness audit + run (SEPARATE SESSION)

**Identity**: WATCHDOG (via `/identity WATCHDOG`)
**Constraint**: SEPARATE SESSION from Phase 0.5 (AUD-017 — no self-grading).

### Audit checks (read-only, all green before run)
1. `grep -c "saveAndVerifyCase" location-currency.spec.ts` ≥ save-cycle net-new count (0 if honest-zero — consistent with no import)
2. `dependencyGate([])` on every net-new test
3. `git diff --unified=0 location-currency.spec.ts` — existing TC bodies = 0 changed lines (STRICT-LINE-D; `beforeEach`-only + named-fix exceptions)
4. Gap matrix 1:1 vs spec — every catalogued net-new TC has a `test()`; honest-zero ⇒ every cell (b)/(c)
5. LR-040: every taxonomy cell classified (a)/(b)/(c) (STRICT-LINE-A/G)
6. Each `test.fixme()` has a `// FIXME(BUG-…)` or `// deferred: <reason>` comment (CAD/MXN merchant + any non-automatable manual TC) — plain English per LR-058
7. `npm run check:tc-parity` exit 0; `npm run typecheck` clean

### Run order (LR-018 + `feedback_always_run_individual_first` + LR-024 clean-first)
1. Net-new only (if any) — `npx playwright test location-currency.spec.ts --grep "TC-LOC-CUR-0(2[89]|[3-9][0-9])" --workers=1 --retries=0`
2. Full spec — `npx playwright test location-currency.spec.ts --workers=1 --retries=0` — **verifies the 27 existing survive the `beforeEach` hardening (serial-state safety, STRICT-LINE-F)**; run TWICE per LR-024 corollary
3. If green: wider suite — `npx playwright test tests/locations/`

**HALT** if non-fixme RED → `/rca` (HEADED CLI per `.claude/rules/browser-tool.md`) + Phase 6 HEALER fix. Do
NOT mass-fixme to force green (`feedback_skip_discipline`).

---

## Phase 6 — OWNER: Closure (LR-027 + LR-040 + LR-055 + cascade)

**Identity**: OWNER. **[STRICT-LINE-E]** Status flip to DONE requires ALL of:
- Per-TC justification table: every net-new TC implemented (a) / collapsed-into-existing (b) / deferred-with-reason (c); honest-zero ⇒ the gap matrix is the justification (every cell (b)/(c))
- Gap matrix showing every taxonomy cell classified (STRICT-LINE-A/G)
- False-green sweep verdict (GREEN) + HEALER remediation report verdict + phase-0-verification PROCEED
- Verification commands + outputs (test counts, fixme counts, parity, typecheck, STRICT-LINE-D diff=0) per LR-042 evidence-emission
- LR-046 strict-line audit: A/B/C/D/E/F/G each ✓ with evidence cite
- **Per-Identity Matrix Closure Audit**: all 7 cells resolve to a real existing path (no `(skipped)` in this subplan per the full-sweep mandate) — `Test-Path` each at close
- LR-027 parent-cascade: `PLAN_BIG_PIVOT_FCC_MASTER.md` stays PENDING — cite `LR-027 cascade SKIPPED per master §Cascade closure rules (user override 2026-05-21)`; **annotate the child's DONE line into master §Roadmap line 94** (C4 parent-cascade sub-check — mandatory even under the auto-close exemption)

Steps: flip Status DONE + add `**Executed**:`; write `### Execution Summary`; `git mv` pending/→done/;
author closure manifest `plans/_closure_manifests/SUBPLAN_CURRENCY_FCC.md.manifest.json`; `npm run
plans:reindex`; activity-log row (LR-028, timestamp ≥ all touched-file mtimes); `/final-q` verdict
(GREEN|YELLOW|RED, LR-042).

LR-055 machine-gate: `node scripts/validate-plan-closure.mjs --enforce --plan plans/done/SUBPLAN_CURRENCY_FCC.md --json` → PASS (C1–C6; C6 `announce` now, matrix authored to pass `deny`).

---

## Per-Identity Satisfaction (LR-048 v3 — FULL SWEEP: every cell a REAL existing path, zero `(skipped)`)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | field-inventory + old-site-baseline + manual-TC reconciliation | `clients/encore/specs_planning/_internal/field-inventories/currency-2026-06-17.md`<br>`clients/encore/specs_planning/_internal/old-site-baseline/currency-2026-06-17.md` | `ls` both; `grep MCP_Session_Date` = filename date |
| GIVER | test-cases.md, test-plan.md, XLSX, catalog (+ header reconcile) | `clients/encore/specs_planning/_internal/field-case-catalogs/currency-2026-06-17.md` | `npm run check:tc-parity` exit 0 |
| BUILDER | spec, page object, test data | `clients/encore/tests/locations/location-currency.spec.ts` | `npx playwright test --list` resolves all TC IDs (incl. net-new; honest-zero ⇒ 27 resolve + `beforeEach` hardened) |
| HEALER | false-green/state-leak remediation + LR-021 skip-audit | `clients/encore/specs_planning/_internal/rca-currency-baseline-remediation-2026-06-17.md` | `grep -c "FALSE-GREEN\|STATE-LEAK" clients/encore/specs_planning/_internal/false-green-sweeps/currency-2026-06-17.md` reconciles to report |
| WATCHDOG | phase-0-verification + false-green sweep + FCC completeness audit | `clients/encore/specs_planning/_internal/phase-0-verification-currency-2026-06-17.md`<br>`clients/encore/specs_planning/_internal/false-green-sweeps/currency-2026-06-17.md` | PROCEED verdict + sweep verdict + Phase 5 audit GREEN |
| GARDENER | structural sweep (typecheck/lint/dedup/barrel/parity/jargon) | `clients/encore/specs_planning/_internal/gardener-sweep-currency-2026-06-17.md` | `npm run typecheck` clean |
| OWNER | closure manifest + master annotation + execution summary | `plans/_closure_manifests/SUBPLAN_CURRENCY_FCC.md.manifest.json` | `node scripts/validate-plan-closure.mjs --enforce … ` PASS |

> Per the user's full-identity-sweep directive (2026-06-15), **no cell is `(skipped)`** — every identity
> produces and is gated on a real dated artifact. HEALER and GARDENER, which the general FCC pattern would
> mark `(skipped: inlined)`, here own dedicated dated reports so their work is proven, not assumed. This is
> the deliberate upgrade noted in §Context.

---

## Acceptance Criteria

- [ ] Phase 0 dependency + browser-tool gate passed (incl. MD `Status`-column read for manual-TC reconciliation)
- [ ] Phase 0.5 phase-0-verification PROCEED + false-green sweep emitted (dated); zero unfixed FALSE-GREEN/STATE-LEAK (>3 = HALT)
- [ ] Phase 1 field-inventory + old-site-baseline emitted (dated 2026-06-17); read-only cells carry `affordance: none` (LR-057)
- [ ] Phase 1 manual-TC reconciliation recorded (stale-header fix vs genuine-manual automation, steering #1)
- [ ] Phase 1.5 HEALER remediation report emitted (false-green fixes + LR-021 skip-audit + verdict) — REAL artifact, runs unconditionally
- [ ] Phase 2 catalog + exhaustive gap matrix; STRICT-LINE-A/G satisfied (every cell (a)/(b)/(c)); honest-zero permitted
- [ ] Phase 2 net-new TCs (if any) + corrected header + any newly-automated manual TCs appended to test-cases.md + test-plan.md; STRICT-LINE-B no duplication
- [ ] Phase 2 `planner:post-complete` / `xlsx:build` → XLSX `locations_currency` rows reconcile to corrected MD total; `check:tc-parity` exit 0
- [ ] Phase 3 net-new tests blended at TOP, same naming, no `@fcc` tag; shipped comments plain-English (LR-058)
- [ ] Phase 3 LR-019 per-test baseline wired: hardened `ensureDefaultState()` in `beforeEach` (relieves the TC-001 inline reset of sole responsibility; TC-001 body unchanged)
- [ ] Phase 3 save-cycle tests use `saveAndVerifyCase()` (import `src/utils/field-case-runner`) with own `baseline`/`cleanup`, `dependencyGate([])`; STRICT-LINE-F restore
- [ ] Phase 3 USD merchant save-cycle covered if uncovered; CAD/MXN merchant deferred (c) with reason (steering #2)
- [ ] Phase 3 STRICT-LINE-D: existing 27 TC bodies untouched (git-diff = 0); only `beforeEach` + named Phase-1.5 fixes modified
- [ ] Phase 4 GARDENER sweep report emitted (dated); typecheck/lint/dedup/barrel/parity/jargon all green
- [ ] Phase 5 (SEPARATE SESSION) net-new run green (or documented fixme); full spec green incl. existing 27, run twice (LR-024)
- [ ] Phase 6 closure manifest + LR-055 PASS (C1–C6) + master §Roadmap line-94 annotation + all-7 matrix cells `Test-Path` True
- [ ] `/regression-guard` before/after = no silent breakage
- [ ] Activity-log row per LR-028 (LR-037 timestamp ≥ touched-file mtimes)
- [ ] `/final-q` verdict block emitted (LR-042)

---

## Out of scope (anti-rescope guard — LR-046, LR-050)

- FCC conversion of the existing 27 TCs to `saveAndVerifyCase()` lifecycle — separate future subplan if authorized (STRICT-LINE-D keeps existing bodies untouched; the `beforeEach` baseline + named false-green fixes are the only existing-test changes).
- CAD/MXN merchant save-cycle coverage — deferred (c) per steering #2 (data-thin / office-1604-seeded).
- Currency History / Merchant-audit-column tracking — routed to `SUBPLAN_HIST_PER_COLUMN_FCC` + BUG-LOC-MGH-002/003; not re-litigated here.
- App-side bugs surfaced during walk/sweep — file `BUG-LOC-CUR-<NNN>` under the client bugs dir per LR-034; do not fix app code.
- Renumbering existing TCs / reusing any ID gap — forbidden (STRICT-LINE-D + naming policy).
- Cross-module FCC (other Location Settings tabs) — their own §Roadmap subplans.

---

## Handoff (chat-only per `feedback_handoff_in_chat_only.md`)

Rutvik triggers `/execute SUBPLAN_CURRENCY_FCC` manually (acceptEdits, per-phase review — not `/chain`).
Watches chat for the `/final-q` verdict after each phase boundary. If any STRICT-LINE (A–G) fires HALT →
Claude pauses, Rutvik decides next step in chat. Currency is a grid-shaped FCC conversion; **honest-zero
net-new is a fully valid outcome** — the load-bearing deliverables are the LR-019 per-test baseline
hardening, the false-green sweep, and the seven dated identity artifacts (full-identity-sweep mandate). No
identity's job is skipped, so partial-work regressions have no seam to slip through.

---

## Verification (runnable post-execution)

```bash
# Net-new (if any) blended at top, existing 27 untouched
git diff clients/encore/tests/locations/location-currency.spec.ts
grep -c "saveAndVerifyCase" clients/encore/tests/locations/location-currency.spec.ts   # save-cycle net-new (+1 import) or 0
grep -c "@fcc" clients/encore/tests/locations/location-currency.spec.ts                # 0
grep -n "ensureDefaultState" clients/encore/tests/locations/location-currency.spec.ts  # hit inside beforeEach
grep -n "ensureDefaultState\|saveAndConfirm" clients/encore/src/pages/locations/location-currency.page.ts  # both present
npx playwright test location-currency.spec.ts --list
npx playwright test location-currency.spec.ts --workers=1 --retries=0                   # FULL spec green (×2 per LR-024)
npm run check:tc-parity                                                                 # PASS
npx tsc --noEmit -p clients/encore/tsconfig.json                                        # exit 0
# All seven identity artifacts exist
ls clients/encore/specs_planning/_internal/field-inventories/currency-2026-06-17.md
ls clients/encore/specs_planning/_internal/old-site-baseline/currency-2026-06-17.md
ls clients/encore/specs_planning/_internal/field-case-catalogs/currency-2026-06-17.md
ls clients/encore/specs_planning/_internal/rca-currency-baseline-remediation-2026-06-17.md
ls clients/encore/specs_planning/_internal/phase-0-verification-currency-2026-06-17.md
ls clients/encore/specs_planning/_internal/false-green-sweeps/currency-2026-06-17.md
ls clients/encore/specs_planning/_internal/gardener-sweep-currency-2026-06-17.md
```
