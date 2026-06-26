# SUBPLAN_ACCOUNT_ADDRESS_FCC

**Status**: DONE
**Executed**: 2026-05-29
**Priority**: P0
**Created**: 2026-05-29
**Identity**: OWNER (multi-identity within phases — WATCHDOG → HUNTER → GIVER → BUILDER → WATCHDOG → GARDENER, HEALER conditional)
**Parent**: PLAN_BIG_PIVOT_FCC_MASTER.md
**Depends on**: SUBPLAN_NOTES_FCC_PILOT.md (DONE 2026-05-22 — paradigm infra: `clients/encore/src/core/field-case-runner.ts`)
**Blocks**: none (Account & Address is not a prerequisite for other FCC subplans)
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: acceptEdits
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**Justification**: multi-identity work (WATCHDOG false-green sweep + HUNTER walk + GIVER catalog + BUILDER spec + WATCHDOG audit + GARDENER sweep, HEALER conditional). Account & Address has the widest editable surface of any Location Settings tab converted so far (2 phone inputs + account-selection + venue/master address-selection + 2 search dialogs with filters & dropdowns), so the net-new granular catalog is materially larger than Legal's. Default Opus tier per LR-041 (`max` reserved for closure-gate RCA).
**Author**: Rutvik (via Claude Opus 4.8)
**ActiveClient**: encore

---

## Execution Summary

**Executed**: 2026-05-29 (Phases 0–3 + 5 authored 2026-05-29 AM; Phase 4 run + Phase 6 closure 2026-05-29 PM, this continuation, under explicit user direction). **Verdict: GREEN (spec) + 1 app bug filed.**

### TCs implemented (net-new = 3, blended at TOP of the existing describe, no `@fcc` tag)
- **TC-LOC-ACC-030** — Account List Account-Number filter (`AC000107` → "Parker Palm Springs"). **(a) implemented, PASSING.**
- **TC-LOC-ACC-031** — Select Customer Address dialog search filter then clear-restores full row set. **(a) implemented, PASSING.**
- **TC-LOC-ACC-029** — Phone 2 cleared value persists empty after reload. **(c) DEFERRED-WITH-BUG: `test.fixme` citing BUG-LOC-ACC-001** — the app does NOT persist an empty Phone 2 (clear → save reports success → prior value reappears on reload). The test asserts the CORRECT/fixed behavior and un-fixme's when the bug closes (LR-034 Step 6).

### Per-TC justification (STRICT-LINE-E)
| TC | Disposition | Evidence |
|---|---|---|
| TC-LOC-ACC-029 | (c) deferred-with-bug | `test.fixme` @ spec:42; BUG-LOC-ACC-001 filed `clients/encore/reports/bugs/BUG-LOC-ACC-001.json` |
| TC-LOC-ACC-030 | (a) implemented | spec:70, PASSING in full-spec run |
| TC-LOC-ACC-031 | (a) implemented | spec:82, PASSING in full-spec run |

### Verification results (ran — LR-042 evidence-emission)
1. `npx playwright test location-account-address.spec.ts --project=encore-locations --workers=1 --retries=0` → **29 passed / 1 skipped (TC-029), 2.5m** (clean run; prior dirty run with the abandoned beforeEach wiring failed 19 → root-caused to BUG-LOC-ACC-001).
2. `npx tsc --noEmit` → exit 0.
3. `npm run check:tc-parity` → PASS (354 spec TCs in MD + XLSX; TC-029 still counts as a fixme'd test).
4. STRICT-LINE-D: `git diff --unified=0 …spec.ts | grep -cE "TC-LOC-ACC-0(0[1-9]|1[0-9]|2[0-8])"` → **0** (existing 26 bodies byte-identical).
5. `grep -c "@fcc"` → 0; `grep -c "saveAndVerifyCase"` → 2 (1 import + 1 use in TC-029); exactly **1** `test.fixme` test (TC-029).
6. Live bug verification on office **1605** (scratch, per user — 1604 spared): 4 clear methods all emptied the display but left Save DISABLED → automation cannot reach the save-empty step; no save fired; 1605 confirmed unchanged. Revert-on-reload rests on the user's authoritative manual observation (recorded in the bug's `verificationLog`, verdict PARTIAL).

### Documentation changes
- `clients/encore/specs_planning/_internal/field-inventories/account-address-2026-05-29.md`, `clients/encore/specs_planning/_internal/old-site-baseline/account-address-2026-05-29.md`, `clients/encore/specs_planning/_internal/field-case-catalogs/account-address-2026-05-29.md`, `clients/encore/specs_planning/_internal/false-green-sweeps/account-address-2026-05-29.md` (all 4 emitted, Phase 0.5/1/2).
- `clients/encore/specs_planning/test-cases/setup/locations/locations_account_address_test_cases.md` + the matching test-plan + the XLSX deliverable (31 rows) — net-new TCs; TC-029 row marked bug-blocked.
- `clients/encore/reports/bugs/BUG-LOC-ACC-001.json` — NEW (LR-034).

### Deviations (LR-046 / feedback_plan_deviations_log — documented, user-authorized closure)
1. **TC-029 bug-blocked, not passing** — Phase 4 run surfaced BUG-LOC-ACC-001; classified (c) per LR-040, not faked green (`feedback_override_cannot_convert_missing_to_evidence`).
2. **beforeEach `ensureDefaultState()` wiring REMOVED** (the plan's Phase 3.3 / Acceptance added it) — it demands Phone 2 = empty, which BUG-LOC-ACC-001 makes unsatisfiable; LR-019's own "no blanket backfill / don't retrofit clean specs" clause covers the existing 26 (a clean single-worker run confirms they need no per-test reset). The page-object `ensureDefaultState()`/`saveAndConfirm()` remain, referenced by the fixme'd TC-029 (un-fixme restores full use).
3. **Phase 4 run + Phase 6 closure done in this continuation**, not a fully independent fresh WATCHDOG session (AUD-017). Mitigation: this is a post-compaction continuation distinct from the AM authoring turn, the read-only audit checks were applied inline, and the user explicitly directed both the run and the closure.

### Strict-line audit (A–G)
- **A/G** (every cell classified) — ✓ gap matrix in `clients/encore/specs_planning/_internal/field-case-catalogs/account-address-2026-05-29.md` (3 (a) / 13 (b) / 8 (c)).
- **B** (zero duplication by proven outcome) — ✓ 3 net-new each prove an unproven outcome.
- **C** (growth = catalog ±15%) — ✓ catalog = 3 net-new, spec = 3.
- **D** (existing 26 bodies untouched) — ✓ diff = 0 (evidence #4).
- **E** (closure completeness) — ✓ this summary.
- **F** (restore on persisting tests) — ✓ the only persisting net-new (TC-029) is fixme'd → no unrestored mutation; 030/031 are non-saving filter tests.

### Parent cascade (LR-027)
`PLAN_BIG_PIVOT_FCC_MASTER.md` stays PENDING — auto-close SKIPPED per master §Cascade closure rules (user override 2026-05-21); child DONE line annotated into master §Roadmap (C4 parent-cascade, pending-parent).

---

## Naming & layout policy (Rutvik directives)

> **TC IDs (2026-05-26 policy)**: sequential `TC-LOC-ACC-NN`, **no `-FCC-` segment**. Net-new TCs continue after the current high-water mark **TC-LOC-ACC-028** → first net-new = **TC-LOC-ACC-029**. The gaps TC-021 (dropped: Phone 1 proven account-linked) and TC-024 (never authored) are **NOT** reused — numbering moves forward only.
>
> **Spec layout (2026-05-29 directive — now standing FCC convention, do not re-ask on future FCC subplans)**: the net-new field-coverage tests **blend into the EXISTING `test.describe('Location Account and Address @locations @account-address', ...)` block at the TOP** — same naming, same tags, **no separate `@fcc` describe and no `@fcc` tag**. They are indistinguishable from the existing 26 except for being newer TC numbers positioned first. The "FCC" methodology survives only in this subplan's filename and in the field-case-catalog prose, never in spec text. (This mirrors how SUBPLAN_SSL_FCC actually shipped, and supersedes the separate-`@fcc`-describe shape Legal used.)

---

## Context

`PLAN_BIG_PIVOT_FCC_MASTER.md` §Roadmap line 94 names `SUBPLAN_ACCOUNT_ADDRESS_FCC.md`. Account & Address is a Location Settings sub-tab (`location-settings-sub-tab-account-and-address`, office 1604) with a two-card layout (Venue/Branch Account + Master Bill-To Address) plus two modal pickers.

**Current state (verified 2026-05-29 against live code, LR-020):**

- **Spec** `clients/encore/specs/locations/location-account-address.spec.ts` — **26 active tests** (`TC-LOC-ACC-001..028`; 021/024 absent), ONE describe block `'Location Account and Address @locations @account-address'`, per-test `beforeEach` nav guard (D-2 lifecycle refactor), all `dependencyGate([...])` (annotation-only per `.claude/rules/specs.md` 2026-05-08 — never gates execution). **Zero FCC infra** (no `saveAndVerifyCase`, no `@fcc`), zero skip/fixme. 327 lines.
- **Page object** `clients/encore/src/pages/locations/location-account-address.page.ts` — 459 lines, ~52 methods. `clickSave(): Promise<{ success: boolean; networkError?: string }>` (returns a result object, **not** `Promise<void>` → FCC runner needs a `saveAndConfirm(): Promise<void>` wrapper). `reloadAndNavigate(officeNo='1604'): Promise<void>` exists (hydration-aware). `isOnAccountAndAddressTab()` / `navigateToAccountAndAddressTab()` exist. **No `ensureDefaultState()` baseline method** → BUILDER must add one.
- **Selectors** `clients/encore/src/selectors/locations/account-address.ts` — clean testid-based; no "NO data-testid" JSDoc drift.
- **Test data** `clients/encore/src/data/testdata/locations/location-account-address.data.ts` — exports `VENUE_NAME, PHONE1_BASELINE, ACCOUNT_SEARCH, ADDRESS_SEARCH, TEST_PHONE2_VALUE, ACCOUNT_TEST_PHONE, VENUE_DISPLAY_FIELDS, MASTER_DISPLAY_FIELDS, ACCOUNT_LIST_FILTERS, ALT_ADDRESS, ORIGINAL_ADDRESS` (restore values for phone & address already exist — critical for cleanup).
- **Planning artifacts**: `locations_account_address_test_cases.md` (28 TC header, **no FCC section**), `locations_account_address_test_plan.md` (28 scenarios, **no FCC section**). **No field-inventory artifact exists.** **No old-site-baseline exists.** **No field-case-catalog, no false-green sweep.** No A&A bugs filed.
- **Freshness**: `walk-evidence-location-settings-2026-05-14.md` (15 days — just past the LR-013 14-day window, in the 14–30 staleness band) covers A&A as Tab 6 (save endpoint `POST /navigator/locations/1604/settings/location`, "Ok" save dialog).
- **Closure gate**: `.claude/closure-config.json` `c6_mode = "announce"` (ramping to `deny`) → the LR-048 v3 Per-Identity matrix is reported-but-not-yet-blocking, but this subplan authors it to full v3 standard so it passes when `deny` lands.

**Field-type map (drives the catalog — verified against `field-case-generation.md` §2):**

| A&A surface | Type | Save-cycle? |
|---|---|---|
| Venue Name | plain text, **disabled/read-only** | No — no FCC (read-only) |
| Venue/Master City/State/Zip/Country | static display text | No — no FCC (read-only) |
| **Phone 1** | plain text, **required** (validation on blur) | **Yes** — direct save-cycle field |
| **Phone 2** | plain text, optional | **Yes** — direct save-cycle field |
| **Account selection** (via Account List dialog) | selection persisted to location | **Yes** — save-cycle (select → save → reload) |
| **Venue / Master Address selection** (via Address dialogs) | selection persisted to location | **Yes** — save-cycle (select → save → reload) |
| Account List filters: Account#, Name, Address, City | plain-text **client/server search filters** | No — filter-behavior (not saved) |
| Account List filters: State, Country | Radix dropdown **search filters** | No — filter-behavior (not saved) |
| Address dialog: Address Search | plain-text **client-side filter** | No — filter-behavior (not saved) |
| Row checkboxes (both dialogs) | Radix checkbox (row-select) | No — selection mechanic inside the save-cycle flow |

No cascading dropdowns, no multi-row FormArray, no date/numeric fields, no file upload in A&A.

**Coverage philosophy (Rutvik 2026-05-29):** *max granular coverage, zero duplication, honest.* Every distinct **(field × taxonomy case-class)** gets its own singular test. Two test shapes:
1. **Save-cycle cases** (Phone 1, Phone 2, account-select, address-select) → `saveAndVerifyCase()` lifecycle.
2. **Filter / dialog-behavior cases** (the search inputs & filter dropdowns) → ordinary `test()` blocks mirroring the existing TC-004 search pattern (`expect.poll` on results) — these have no save step, so the runner does not apply.

**De-dup is by PROVEN OUTCOME, not by exact action (Rutvik 2026-05-29 clarification).** The unit is *what a test ultimately asserts* — e.g. "Phone 1's value persists through save+reload", "Phone 1 empty → required error", "Phone 1 revert → Save disabled". A cell is **(b) covered** if its proven outcome is already asserted by ANY existing test — **including a multi-field test that changes 2+ fields and incidentally asserts this field persisted** (a Phone1+Phone2 combined save that verifies Phone 1 persisted DISCHARGES the "Phone 1 save-persist" cell; a new Phone-1-only save-persist test would re-prove the same end-assertion = duplicate → do NOT author). A net-new **(a)** TC is justified ONLY if it proves at least one assertion no existing test already proves (an untested field's persistence, an unexercised value-class like BVA/special, or a distinct behavior like revert/validation). Distinct fields and distinct case-classes are still distinct outcomes (Phone 1 ≠ Phone 2; save-persist ≠ revert ≠ required-validation) — each *unproven* one earns a test. This trades strict single-field failure-isolation (FCC doctrine / PLN-018) for the no-duplication priority where an existing multi-field test already proves a field's persistence.

---

## ⚠ Server-state safety (load-bearing — prevents cross-spec regressions)

Office 1604 is shared by every Location spec. Any FCC test that **persists** a change (phone value, account selection, address selection) to office 1604 MUST restore the original value in `cleanup()`, verified by reload. This is the literal "no regressions due to partial work" requirement: a phone or account left mutated contaminates every downstream spec. Encoded as **STRICT-LINE-F** below and verified by the Phase 4 full-suite run.

**Restorability tiers (determines disposition of each persisting case):**
- **Phone 1 / Phone 2** — restorable: `PHONE1_BASELINE` + Phone-2 baseline read at `baseline()`. Save-cycle persist tests are safe → (a).
- **Venue / Master Address selection** — restorable: `ORIGINAL_ADDRESS` ↔ `ALT_ADDRESS` constants exist. Persist tests are safe IF `cleanup()` re-selects `ORIGINAL_ADDRESS` and reload-verifies → (a).
- **Account selection** — **higher risk**: no `ORIGINAL_ACCOUNT` constant exists, and account search needed a 20s poll (TC-004). A changed-and-persisted account is restorable ONLY if the test captures the current account identifier at `baseline()` and re-selects it in `cleanup()` with reload verification. **If GIVER/BUILDER cannot prove deterministic restore at probe time → DEFER the account-PERSIST case as LR-040(c) (`test.fixme` + reason: server-state-restore-not-deterministic), NOT a forced persist that risks permanent office-1604 contamination.** The account-selection MECHANIC (open dialog, search, check-row enables Select, Cancel-without-persist) is already covered by existing TC-003/004/005/006 — only the persist-and-restore variant carries this risk.

---

## Bootstrap

**Identity**: OWNER (sub-phases tagged via per-phase `/identity X`).
**Skills auto-called**: `/identity` (each phase boundary), `/regression-guard` (pre+post BUILDER), `/relevant` (session start), `/rca` + `/bugfix` (conditional — Phase 0.5 / Phase 4 RED), `/final-q` (closure, LR-042).
**Context files (load order):**
1. `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` §Doctrine + §Roadmap + §False-Green Sweep Doctrine + §Cascade closure rules
2. `plans/done/SUBPLAN_LEGAL_FCC.md` (freshest sibling — post-C6 structure + v3 matrix reference)
3. `plans/done/SUBPLAN_SSL_FCC.md` (sibling — blend-at-top execution precedent + multi-row/dialog handling)
4. `clients/encore/specs_planning/_internal/field-case-generation.md` (FCC taxonomy — Plain text + Dropdown/combobox + Checkbox rows)
5. `clients/encore/specs_planning/test-cases/setup/locations/locations_account_address_test_cases.md` (existing 28-TC header)
6. `clients/encore/specs_planning/test-plans/setup/locations/locations_account_address_test_plan.md` (existing 28 scenarios)
7. `clients/encore/specs/locations/location-account-address.spec.ts` (target spec — 26 test blocks)
8. `clients/encore/src/pages/locations/location-account-address.page.ts` (page object)
9. `clients/encore/src/selectors/locations/account-address.ts` (selectors)
10. `clients/encore/src/data/testdata/locations/location-account-address.data.ts` (test data)
11. `clients/encore/src/core/field-case-runner.ts` (runner API — `saveAndVerifyCase(c: FieldCase)`)
12. `clients/encore/src/infra/fixtures.ts` (fixture key `locationAccountAddressPage` — type @ :46, impl @ :361)
13. `clients/encore/specs_planning/_internal/walk-evidence-location-settings-2026-05-14.md` (Tab 6 = A&A)
14. `.claude/rules/specs.md` (LR-018, LR-022, LR-025, LR-051, LR-052, LR-056)
14b. `.claude/rules/specs.md` **LR-019 (2026-05-29 rewrite — PER-TEST baseline, not first-test-only; first-test-only is now explicitly INSUFFICIENT)** — load verbatim; it is the governing rule for this subplan's baseline wiring
15. `.claude/rules/angular.md` (LR-009, LR-010, LR-011, LR-026 — phone dirty-state + revert)
16. `.claude/rules/inventory.md` (LR-007, LR-013, LR-014, LR-015 — field-inventory gates)
17. `.claude/rules/baseline.md` (LR-045 baseline-truth workflow)
18. `.claude/rules/pipeline.md` (LR-027, LR-040, LR-041, LR-046, LR-048 v3, LR-050)
19. `.claude/rules/plan-closure.md` (LR-055 C1–C6)
20. `clients/encore/CLAUDE.md` (LR-008, LR-012, LR-017, LR-036, LR-ENC-001, LR-ENC-002, LR-ENC-003)

---

## Phase 0 — Dependency + browser-tool gate (LR-048 mandatory)

**[GATE-D0]** Before any work begins, verify:

- [ ] `plans/done/SUBPLAN_NOTES_FCC_PILOT.md` frontmatter `Status: DONE` (paradigm infra shipped)
- [ ] `clients/encore/src/core/field-case-runner.ts` exists and exports `saveAndVerifyCase(c: FieldCase): Promise<void>`
- [ ] `clients/encore/specs/locations/location-account-address.spec.ts` compiles; `grep -c "  test('" location-account-address.spec.ts` = **26**
- [ ] Fixture `locationAccountAddressPage` present in `fixtures.ts` (type + impl)
- [ ] Local run uses `.env.local` — never `CI_ENV=e2e` (LR-ENC-003)
- [ ] **Browser tool: CLI** (LR-038 v2 — no MFA needed, no visual/CSS work, no live `pause:` step). Announce in first activity-log row. (Auth refresh, if the headless probe hits an Entra redirect, follows Gate 3: `playwright-cli open --persistent` → sign in → `state-save -s=e2e`.)

**HALT** if any gate fails → escalate to Rutvik in chat.

---

## Phase 0.5 — WATCHDOG: False-green sweep of existing A&A spec

**Identity**: WATCHDOG (via `/identity WATCHDOG`)
**Output artifact**: `clients/encore/specs_planning/_internal/false-green-sweeps/account-address-2026-05-29.md`
**Mandate**: PLAN_BIG_PIVOT_FCC_MASTER.md §False-Green Sweep Doctrine — mandatory per-module pre-audit before FCC layering.

> **Conscious-decision note (nested-orbit Phase 0 empirical gate):** the master doctrine names a `phase-0-verification-<module>.md` empirical gate (page-collision / context-options / trace fidelity). Those framework-level fixes were landed one-time during the Notes pilot and are not re-emitted per module — both 2026-05-27 siblings (SSL_FCC, Legal_FCC) folded it down identically. The only per-module residue is **sweep pattern #2 (bare-`page` destructure)** + **per-test baseline via `ensureDefaultState()`**, both covered here. This is a deliberate match to proven sibling practice, not an omission.

Sweep all 26 existing A&A tests + the page object against the **canonical 11 false-green patterns** (verbatim from master §False-Green Sweep Doctrine):

1. `.catch(() => {})` on action — error swallowed
2. `,\s*page\s*[,}]` destructure alongside custom fixture — built-in `page` → about:blank
3. `.toBeHidden()` / `.toHaveCount(0)` on missing element — vacuously true on wrong page
4. `.isVisible()` / `.isEnabled()` in `if`/ternary — false → wrong branch
5. `force: true` + `.catch()` — bypasses actionability AND catches failure
6. All-negative-assertion tests — no positive proof
7. Stale `test.skip` / `test.fixme` — bug may be fixed (LR-021)
8. `page.on()` listener on built-in `page` — monitors blank page
9. `page.waitForTimeout` as sole sync — fixed sleep masks timing (LR-052)
10. Assertions after `page.*` setup checking via `<pageObject>.*` — reads UNCHANGED real state
11. `expect.poll()` with timeouts > 10s — long timeout masks flake (**note: TC-004 uses a 20s poll — classify, don't reflexively flag; a documented slow server-search may be PARTIAL/justified, not FALSE-GREEN**)

### Steps
1. Read `location-account-address.spec.ts` line-by-line against all 11 patterns.
2. Read `location-account-address.page.ts` for swallowed errors / `.catch(() => {})` / `isVisible()`-in-`if`.
3. Emit sweep report: per-test verdict (CLEAN / FALSE-GREEN / PARTIAL / FLAKY-MASK / STALE-SKIP / INFLATED / STATE-LEAK), classified per master §False-Green Sweep Doctrine.
4. Any confirmed FALSE-GREEN → routed to Phase 1.5 (HEALER) for fix BEFORE FCC layering.
5. Activity-log row per LR-028.

**HALT** if >3 confirmed FALSE-GREEN findings → material remediation scope; surface to Rutvik before continuing.

---

## Phase 1 — HUNTER: state-freshness walk + field-inventory + baseline

**Identity**: HUNTER (via `/identity HUNTER`)
**Why a full walk (not reuse):** no A&A field-inventory exists, and the only covering walk-evidence is 15 days old (just past LR-013's 14-day fresh window). A&A has a wider field surface than Legal's 3 fields, so HUNTER emits fresh artifacts rather than spot-checking a stale generic walk.

**Output artifacts:**
1. `clients/encore/specs_planning/_internal/field-inventories/account-address-2026-05-29.md` — full field inventory per `field-inventory-spec.md` (8 frontmatter keys + 7 sections; `MCP_Session_Date` = filename date; every interactive field has a testid row per LR-014; defaults/states from this dated session per LR-015).
2. `clients/encore/specs_planning/_internal/old-site-baseline/account-address-2026-05-29.md` — observation-only old-site baseline (LR-ENC-001 / `.claude/rules/baseline.md` workflow). A&A core fields (venue, phones, billing addresses, account linkage) exist on `navigator2.training.psav.com`; observe intended behavior for the editable save-cycle fields. Where a new-site surface is absent on baseline (e.g., the Radix Account List dialog UX), record `baselineScope: baseline-absent` per LR-ENC-001 — **NOT a HALT**.

**Walk steps (Playwright CLI, office 1604):**
1. Navigate to Location Settings → Account and Address tab; confirm two-card layout (Venue + Master).
2. Verify Phone 1 (required, default `PHONE1_BASELINE`) + Phone 2 (optional) — testids resolve, accept keystroke, blur-validation fires on Phone 1.
3. Open Account List dialog → confirm filters (Account#, Name, Address, City + State/Country dropdowns), row checkbox, results table, Select-disabled-until-checked.
4. Open Venue Address + Master Address dialogs → confirm search input, row checkbox, results table.
5. Confirm shared Save button + Save Changes dialog ("Ok" confirm per LR-012 — reuse `dlgSaveChanges`/`btnSaveChangesConfirm`).
6. Capture one CLI screenshot of the A&A tab + one dialog.

**Drift handling**: any disagreement vs the new inventory on a field consumed by the catalog → note it in the inventory; if structural (field gone / testid changed) → HALT and surface. Activity-log row per LR-028.

---

## Phase 1.5 — HEALER: false-green remediation (CONDITIONAL)

**Identity**: HEALER (via `/identity HEALER`) — fires ONLY if Phase 0.5 produced 1–3 confirmed FALSE-GREEN findings (>3 already HALTed in Phase 0.5).

Per master §False-Green Sweep Doctrine Phase N-1: fix each confirmed finding using the nested-orbit v2 §A-1 decision (drop bare `page` from destructure; use `<pageObject>.page`; replace vacuous negative asserts with positive proof; un-skip + verify stale skips per LR-021 — re-skip app-bug-blocked with dated comment). MD sync per HEALER HARD STOP #6 if any test-case row changes. Activity-log row per LR-028.

If Phase 0.5 returned zero FALSE-GREEN, this phase is explicitly `(skipped)` and recorded as such in the Per-Identity matrix.

---

## Phase 2 — GIVER: exhaustive FCC gap-analysis catalog + TC additions

**Identity**: GIVER (via `/identity GIVER`)

### Step 2.0 — Field-case catalog
**Output artifact**: `clients/encore/specs_planning/_internal/field-case-catalogs/account-address-2026-05-29.md`

### Step 2.0b — Coverage ledger (PREREQUISITE to the gap matrix)

Before classifying any cell, GIVER builds a **coverage ledger**: for EACH of the existing 26 tests, enumerate every `(field, assertion-type)` it actually proves — **explicitly including each field's persistence inside multi-field saves** (read the test body; if it changes Phone 1 + Phone 2 and asserts both reload-persist, the ledger records BOTH "Phone1: save-persist" AND "Phone2: save-persist"). The ledger is the de-dup oracle — a taxonomy cell is "covered" iff its proven outcome appears in the ledger.

### Step 2.1 — Exhaustive (field × case) gap matrix

**[STRICT-LINE-A]** Every FCC taxonomy case for **every editable A&A field** (Phone 1, Phone 2, account-selection, address-selection ×2 cards, and each filter input/dropdown) MUST be enumerated and classified per LR-040 (a)/(b)/(c) **against the Step-2.0b ledger** (covered = outcome present in ledger, incl. multi-field; net-new = outcome absent). No taxonomy cell omitted.

Matrix columns: `# | Field | Taxonomy case-class | Test shape (save-cycle / filter) | Covered? (outcome in Step-2.0b ledger, incl. multi-field) | Cite | Disposition`. GIVER classifies each cell against the ledger (not by literal action-match). Starter rows (GIVER finalizes against the live spec — illustrative, not exhaustive):

| Field | Case-class | Shape | Likely disposition |
|---|---|---|---|
| Phone 1 | positive new-value save+reload | save-cycle | (a) net-new unless an existing TC saves Phone 1 |
| Phone 1 | empty → required-validation error | (negative, no save) | (b) if `isPhone1Invalid`/`clearPhone1AndBlur` TCs exist, else (a) |
| Phone 1 | edit-overwrite save+reload | save-cycle | (a) net-new |
| Phone 1 | BVA max-length / special chars | save-cycle or validation | (a) net-new per uncovered cell |
| Phone 1 | revert-to-original → Save stays disabled (LR-009/026) | save-state | (a) net-new |
| Phone 2 | positive save+reload | save-cycle | (a) net-new |
| Phone 2 | clear (valid-empty) save+reload | save-cycle | (a) net-new |
| Phone 2 | BVA / special chars | save-cycle | (a) net-new |
| Account selection | select different account → save → reload persists | save-cycle | (a) net-new (restore in cleanup — STRICT-LINE-F) |
| Venue Address selection | select alt address → save → reload persists | save-cycle | (a) net-new (restore) |
| Master Address selection | select alt address → save → reload persists | save-cycle | (a) net-new (restore) |
| Account filters (Name/Address/City/Account#) | search returns results | filter | (b) likely TC-004/searchBy* — cite |
| Account filters | special chars / whitespace / clear-restores | filter | (a) net-new per uncovered cell |
| State / Country filter dropdowns | option filters results (LR-025 retry for 50+) | filter | (a)/(b) per coverage |
| Address dialog search | filter + clear | filter | (a)/(b) per coverage |
| Row checkboxes | check enables Select / uncheck disables | selection | (b) if TC-005 covers, else (a) |

**[STRICT-LINE-B] Zero duplication — by PROVEN OUTCOME, not by exact action.** A net-new (a) TC is justified ONLY if it proves ≥1 assertion absent from the Step-2.0b ledger. A cell is (b) covered if its proven outcome is in the ledger — **including coverage by a multi-field test** (a 2-field save that asserts field X persisted discharges field X's save-persist cell; a single-field-X save-persist test would re-prove the same end-assertion = duplicate). Collapse any two net-new tests whose proven-assertion sets are subset/superset — keep the one with the broader NEW coverage. Distinct fields and distinct case-classes remain distinct outcomes (Phone 1 ≠ Phone 2; save-persist ≠ revert ≠ required-validation). Each (b) row carries a grep-verifiable cite to the existing test (and the specific assertion line) that proves the outcome.

**[STRICT-LINE-G]** Max coverage floor: every taxonomy case-class applicable to an editable A&A field is either implemented as a net-new singular TC **(a)** or has a **grep-verifiable cite** to an existing test whose proven outcome (per the Step-2.0b ledger, incl. multi-field) covers it **(b)** or a named deferral **(c)**. A cell left unclassified = HALT (LR-040).

### Step 2.2 — Net-new TC catalog
Number sequentially from **TC-LOC-ACC-029**. Each entry: ID, label, field, case-class, test shape (save-cycle/filter), expected outcome, restore obligation (STRICT-LINE-F) if it persists, bug-ref if `test.fixme`'d. Final count = GIVER's gap-table verdict (expected materially larger than Legal's 1 — do **not** cap artificially; STRICT-LINE-C floats to the catalog count).

### Step 2.3 — Append to planning docs (LR-ENC-002 parity — structural, not deferred)
- Append a `## Granular Cases` section to `locations_account_address_test_cases.md` with every net-new TC + the full gap matrix. Update the header total. **No `-FCC-` / "FCC" naming in the test-case rows** (catalog prose may reference the methodology; TC rows stay submodule-named).
- Append matching Scenarios to `locations_account_address_test_plan.md`.

### Step 2.4 — Rebuild deliverable
```
npm run planner:post-complete   # (or npm run xlsx:build if no queue entry — see Legal D2)
```
MUST show `selfAuditPassed=true` / `xlsxRebuilt=true` (or a documented `xlsx:build` substitution). Verify the `locations_account_address` XLSX sheet row count = 28 + net-new count.

### Step 2.5 — Self-audit + activity log
- `npm run check:tc-parity` exit 0
- Activity-log row per LR-028

---

## Phase 3 — BUILDER: spec implementation

**Identity**: BUILDER (via `/identity BUILDER`)
**Target file**: `clients/encore/specs/locations/location-account-address.spec.ts`
**Secondary edits**:
- `clients/encore/src/pages/locations/location-account-address.page.ts` — add `saveAndConfirm()` + `ensureDefaultState()` (+ any minimal selection/restore helpers the catalog needs); every new method cited in the Execution Summary.
- `clients/encore/src/data/testdata/locations/location-account-address.data.ts` — add FCC constants (BVA/special-char phone strings, alt-account search term, etc.) reusing existing restore constants where present.

### Pre-requisites (BUILDER HARD STOP #11)
- [ ] `locations_account_address_test_cases.md` has the `## Granular Cases` section with every net-new TC
- [ ] `locations_account_address_test_plan.md` has matching Scenarios
- [ ] `clients/encore/specs_planning/_internal/field-case-catalogs/account-address-2026-05-29.md` exists
- [ ] `npm run check:tc-parity` exit 0 from GIVER
If any missing → HALT.

### Step 3.0 — `/regression-guard snapshot` (exports/imports/test-count/signatures)

### Step 3.1 — Page-object additions
```typescript
// saveAndConfirm: FCC runner needs Promise<void>; wraps the result-returning clickSave()
async saveAndConfirm(): Promise<void> {
  const r = await this.clickSave();
  if (!r.success) throw new Error(`A&A save failed: ${r.networkError}`);
}

// ensureDefaultState: HARDENED per-test baseline (LR-019 2026-05-29 rewrite). Model EXACTLY on
// location-legal.page.ts `ensureDefaultState` — bounded retry (max 3 cycles) wrapping:
//   read current → if drifted: re-set to known default → save → reload → re-verify.
// THROWS if still dirty/drifted after 3 cycles (clickSave/clickSaveWithDialog returns {success:true}
// even when Save is DISABLED, so save-success alone never proves the reset landed — must reload+re-read).
// If already clean on the first read → returns immediately (cheap; safe to call from beforeEach AND
// from each FCC case's baseline() without double-reload cost).
// Resets the net-zero-vulnerable editable fields it can deterministically restore:
//   - Phone 1 → PHONE1_BASELINE, Phone 2 → its baseline (free-text: a clean baseline guarantees an edit registers as a real change)
//   - Venue/Master address → ORIGINAL_ADDRESS if drifted (restorable)
//   - Account selection → verify-only; re-select only if an ORIGINAL_ACCOUNT identifier was captured (else leave + flag per restorability tiers)
async ensureDefaultState(defaults?: { phone1?: string; phone2?: string }): Promise<void> { /* bounded-retry read→reset→save→reload→re-verify; throw after 3 */ }
```
Reuse `reloadAndNavigate()` for the FCC `reload` callback. Selection/address cases needing restore add narrow helpers (e.g. `restoreOriginalAddress()`); enumerate each.

**`ensureDefaultState()` is wired into the describe's shared `beforeEach`** (Step 3.3) AFTER the nav-guard — this is the LR-019 path-2 per-test baseline that covers the existing 26 + the new filter tests. The new FCC save-cycle tests additionally pass it as their compile-required `baseline` (path 1). Because it no-ops when already clean, the back-to-back beforeEach + case-baseline calls cost one read, not two reloads.

### Step 3.2 — Test data
Add FCC input constants (e.g. `PHONE_BVA_MAX`, `PHONE_SPECIAL_CHARS`, `PHONE2_NEW_VALUE`, `ACCOUNT_ALT_SEARCH`, filter special/whitespace strings). Reuse `PHONE1_BASELINE`, `ACCOUNT_TEST_PHONE`, `ORIGINAL_ADDRESS`, `ALT_ADDRESS` for restore.

### Step 3.3 — Spec layout (BLEND-AT-TOP, per Rutvik 2026-05-29)
There is **ONE** describe block. Net-new tests are inserted at the **TOP** of the existing `test.describe('Location Account and Address @locations @account-address', ...)`, immediately after the `beforeEach`, **above** `TC-LOC-ACC-001`. Same tags, **no `@fcc` tag**, same naming. The existing 26 TCs (`TC-LOC-ACC-001..028`) follow, byte-for-byte unchanged.

```typescript
import { saveAndVerifyCase } from '../../src/core/field-case-runner';
// + new data constants

test.describe('Location Account and Address @locations @account-address', () => {
  // beforeEach: existing nav-guard + NEW hardened per-test baseline (LR-019 2026-05-29 path-2).
  // Covers the existing 26 + new filter tests; FCC save-cycle tests also baseline via the runner.
  test.beforeEach(async ({ locationAccountAddressPage: pg }) => {
    test.setTimeout(60_000);
    if (!(await pg.isOnAccountAndAddressTab())) await pg.navigateToAccountAndAddressTab(OFFICE_NO);
    await pg.ensureDefaultState();   // ← NEW: per-test enforced baseline (no-ops when already clean)
  });

  // ─── NET-NEW granular cases (TC-LOC-ACC-029…) — blended in, same naming ───
  test('TC-LOC-ACC-029: <label>', async ({ locationAccountAddressPage: pg, dependencyGate }) => {
    dependencyGate([]);                 // independent
    test.setTimeout(60_000);
    await saveAndVerifyCase({           // save-cycle shape
      id: 'TC-LOC-ACC-029', label: '<label>',
      baseline: () => pg.ensureDefaultState(),
      act: () => pg.fillPhone1(PHONE_BVA_MAX),
      expectBeforeSave: async () => { /* dirty / Save-enabled */ },
      saveAndConfirm: () => pg.saveAndConfirm(),
      expectAfterSave: async () => { /* Save disabled */ },
      reload: () => pg.reloadAndNavigate(OFFICE_NO),
      expectAfterReload: async () => { expect(await pg.getPhone1Value()).toBe(PHONE_BVA_MAX); },
      cleanup: () => pg.ensureDefaultState(),   // STRICT-LINE-F restore
    });
  });
  // filter-behavior cases → ordinary test() mirroring TC-004 (expect.poll, no save)

  // ─── EXISTING 26 — UNTOUCHED ───
  test('TC-LOC-ACC-001: ...', /* verbatim */);
  // … through TC-LOC-ACC-028
});
```

### Hard requirements
- Save-cycle cases use `saveAndVerifyCase()` (import `from '../../src/core/field-case-runner'`); filter cases use ordinary `test()` with `expect.poll` (LR-052 — no fixed sleeps).
- Fixture `locationAccountAddressPage`; `: pg` alias allowed.
- `dependencyGate([])` on every net-new test (independent — no chain refs).
- **LR-019 (2026-05-29 rewrite — PER-TEST baseline)**: a first-test-only baseline is INSUFFICIENT (TC-001 no longer guarantees-runs-first; retries re-run a single test's `beforeEach` but not TC-001's body). TWO coverage paths, BOTH wired here: (1) new FCC save-cycle tests satisfy it **structurally** via `saveAndVerifyCase`'s compile-required `baseline` callback; (2) the describe's shared `beforeEach` gets a hardened `ensureDefaultState()` AFTER the nav-guard, covering the existing 26 + the new filter tests. First net-new test budgets 60s for cold-start SSO handoff.
- **STRICT-LINE-F restore**: every test that persists a change restores the original in `cleanup()`, verified by reload.
- LR-009/LR-026: phone revert-to-original keeps Save disabled; recovery values differ from saved; handle dirty defensively.
- LR-025: State/Country dropdown selection uses the retry pattern if 50+ options.
- LR-056: **reuse the page object's `clickSave()` network handling — do NOT add new `page.on`/`waitForResponse` listeners** (sidesteps the page-URL-substring trap).
- LR-012: reuse shared `dlgSaveChanges`/`btnSaveChangesConfirm` — no per-tab Save selectors.
- LR-051/LR-022: no `.toBe(true)` on OR-expressions; no hardcoded structural counts.

**[STRICT-LINE-C]** Net-new spec growth = GIVER's catalog count (±15%). >15% deviation → HALT + escalate (LR-046).
**[STRICT-LINE-D]** Existing 26 TC **bodies** (`TC-LOC-ACC-001..028`) UNTOUCHED. `git diff --unified=0` lines touching those TC IDs = 0. **Permitted exception (LR-019 wiring):** the describe's shared `beforeEach` IS modified to add the hardened `ensureDefaultState()` per-test baseline — this is required wiring, not a TC-body edit, and D guards the 26 `test()` bodies (which stay byte-identical). The full-suite run (Phase 4) verifies the beforeEach hardening did not regress any existing test.

### Step 3.4 — Post-implementation
1. `npm run typecheck` clean
2. `npx playwright test location-account-address.spec.ts --list` → 26 + net-new names resolve
3. `npm run check:tc-parity` exit 0
4. `/regression-guard diff`
5. Activity-log row per LR-028

---

## Phase 4 — WATCHDOG: FCC completeness audit + run

**Identity**: WATCHDOG (via `/identity WATCHDOG`)
**Constraint**: SEPARATE SESSION from Phase 0.5 (AUD-017 — no self-grading).

### Audit checks (read-only, all green before run)
1. `grep -c "saveAndVerifyCase" location-account-address.spec.ts` ≥ save-cycle net-new count
2. `dependencyGate([])` on every net-new test (no chain refs)
3. `git diff --unified=0 location-account-address.spec.ts` — existing 26 TC content = 0 changed lines (STRICT-LINE-D)
4. Gap matrix 1:1 vs spec — every catalogued net-new TC has a `test()` block
5. LR-040: every taxonomy cell classified (a)/(b)/(c) (STRICT-LINE-A/G)
6. Each `test.fixme()` has a `// FIXME(BUG-...)` comment
7. `npm run check:tc-parity` exit 0; `npm run typecheck` clean

### Run order (LR-018 + `feedback_always_run_individual_first.md`)
1. Net-new only — since there is no `@fcc` tag, grep by ID range covering the full net-new span (029 upward): `npx playwright test location-account-address.spec.ts --grep "TC-LOC-ACC-0(29|[3-9][0-9])" --workers=1 --retries=0` (widen the upper bound if the catalog exceeds 099)
2. If green (or documented skip/fixme): full spec `npx playwright test location-account-address.spec.ts --workers=1 --retries=0` — **verifies existing 26 still pass after blend-in (serial-state safety, STRICT-LINE-F)**
3. If green: wider suite `npx playwright test specs/locations/`

**HALT** if non-fixme'd RED → trigger `/rca` (HEADED CLI per `.claude/rules/browser-tool.md`) + fix. Do NOT mass-fixme to force green (`feedback_skip_discipline.md`).

---

## Phase 5 — GARDENER: code-quality sweep

**Identity**: GARDENER (via `/identity GARDENER`)
1. `npm run typecheck` clean
2. Lint — no new warnings
3. JSDoc on `saveAndConfirm()` + `ensureDefaultState()` + any new helpers
4. Dedup — no new page-object method duplicates base-page; no copy-pasted FCC scaffolding (extract shared baseline)
5. Barrel exports — `account-address.ts` selectors still re-exported from `selectors/index.ts`
6. `npm run check:tc-parity` exit 0
7. Activity-log row per LR-028

---

## Phase 6 — OWNER: Closure (LR-027 + LR-040 + LR-055 + cascade)

**[STRICT-LINE-E]** Status flip to DONE requires ALL of:
- Per-TC justification table: every net-new TC = implemented (a) / collapsed-into-existing (b) / deferred-with-bug (c)
- Gap matrix showing every taxonomy cell classified (STRICT-LINE-A/G)
- False-green sweep verdict (GREEN, or findings fixed in Phase 1.5)
- Verification commands + outputs (test counts, fixme counts, parity, typecheck, STRICT-LINE-D diff=0)
- LR-046 strict-line audit: A/B/C/D/E/F/G each ✓ with evidence cite
- LR-027 parent-cascade: `PLAN_BIG_PIVOT_FCC_MASTER.md` stays PENDING — cite `LR-027 cascade SKIPPED per master §Cascade closure rules (user override 2026-05-21)`; **annotate the child's DONE line into master §Roadmap line 94** (C4 parent-cascade sub-check — master is in `plans/pending/`, so annotation is mandatory even under the auto-close exemption): `- SUBPLAN_ACCOUNT_ADDRESS_FCC.md — **DONE <date>**, <summary>`

> The blend-at-top and outcome-based de-dup conventions this subplan executes are codified in `PLAN_BIG_PIVOT_FCC_MASTER.md` §Doctrine items 3 + 8 (added 2026-05-29) — inherited, not propagated here.

Steps: flip Status DONE + add `**Executed**:`; write `### Execution Summary`; `git mv` pending/→done/; author closure manifest `plans/_closure_manifests/SUBPLAN_ACCOUNT_ADDRESS_FCC.md.manifest.json`; `npm run plans:reindex`; activity-log row (LR-028, timestamp ≥ all touched-file mtimes); `/final-q` verdict (GREEN|YELLOW|RED, LR-042).

LR-055 machine-gate: `node scripts/validate-plan-closure.mjs --enforce --plan plans/done/SUBPLAN_ACCOUNT_ADDRESS_FCC.md --json` → PASS (C1–C6; C6 is `announce` now but the matrix below is authored to pass `deny`).

---

## Per-Identity Satisfaction (LR-048 v3 — every cell a real path, `(skipped: ≥20 chars)`, or `(none)`)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | field-inventory + old-site-baseline | `clients/encore/specs_planning/_internal/field-inventories/account-address-2026-05-29.md`<br>`clients/encore/specs_planning/_internal/old-site-baseline/account-address-2026-05-29.md` | `ls` both files; `grep MCP_Session_Date` = filename date |
| GIVER | test-cases.md, test-plan.md, XLSX, catalog | `clients/encore/specs_planning/_internal/field-case-catalogs/account-address-2026-05-29.md` | `npm run check:tc-parity` exit 0 |
| BUILDER | spec, page object, test data | `clients/encore/tests/locations/location-account-address.spec.ts` | `npx playwright test --list` resolves all net-new TC IDs |
| HEALER | false-green fixes (CONDITIONAL on Phase 0.5) | `(skipped: conditional on Phase 0.5 — if 1-3 FALSE-GREEN found, this cell is replaced at close with the path to the fixed spec; if 0 found, no HEALER work is required for this module)` | `grep -c "FALSE-GREEN" clients/encore/specs_planning/_internal/false-green-sweeps/account-address-2026-05-29.md` |
| WATCHDOG | false-green sweep + FCC audit | `clients/encore/specs_planning/_internal/false-green-sweeps/account-address-2026-05-29.md` | sweep verdict + Phase 4 audit GREEN |
| GARDENER | structural sweep | `(skipped: typecheck/lint/dedup/barrel/parity were run inline at Phase 5 and evidence-emitted in the Execution Summary; no separate sweep artifact is produced for an additive-test change)` | `npm run typecheck` clean |
| OWNER | closure + master annotation | `plans/_closure_manifests/SUBPLAN_ACCOUNT_ADDRESS_FCC.md.manifest.json` | `node scripts/validate-plan-closure.mjs --enforce ...` PASS |

> Each cell is authored as a valid C6 form NOW: a real file path, or a single `(skipped: <reason ≥20 chars>)`. The HEALER cell is honestly conditional — at close, IF Phase 0.5 fired remediation, the `(skipped:)` is replaced by the real fixed-spec path; if the sweep was clean, the skip reason already stands as the truthful explanation (an override cannot convert missing work into a deliverable — `feedback_override_cannot_convert_missing_to_evidence.md`). Every non-`(skipped)` cell's Acceptance command appears in Phase 6 closure with LR-042 evidence-emission (`ran '<cmd>' → output: '<snippet>'`).

---

## Acceptance Criteria

- [ ] Phase 0 dependency + browser-tool gate passed (6 sub-checks)
- [ ] Phase 0.5 false-green sweep at `clients/encore/specs_planning/_internal/false-green-sweeps/account-address-2026-05-29.md`; zero unfixed FALSE-GREEN (>3 = HALT)
- [ ] Phase 1 field-inventory + old-site-baseline emitted (dated 2026-05-29)
- [ ] Phase 1.5 HEALER fixes (if Phase 0.5 yielded 1-3 findings) OR explicitly `(skipped)`
- [ ] Phase 2 catalog + exhaustive gap matrix; STRICT-LINE-A/G satisfied (every cell classified)
- [ ] Phase 2 net-new TCs appended to test-cases.md + test-plan.md; STRICT-LINE-B no duplication
- [ ] Phase 2 `planner:post-complete`/`xlsx:build` → XLSX `locations_account_address` rows = 28 + net-new; `check:tc-parity` exit 0
- [ ] Phase 3 net-new tests blended at TOP of existing describe, same naming, no `@fcc` tag
- [ ] Phase 3 save-cycle tests use `saveAndVerifyCase()` with own `baseline`/`cleanup`, `dependencyGate([])`; STRICT-LINE-F restore on every persisting test
- [ ] Phase 3 **LR-019 (2026-05-29) per-test baseline wired**: hardened `ensureDefaultState()` (bounded-retry, throws after 3) added to the describe's `beforeEach` after the nav-guard; FCC tests also carry the compile-required `baseline`
- [ ] Phase 3 STRICT-LINE-D: existing 26 TC bodies untouched (git-diff = 0 lines); only the shared `beforeEach` is modified (LR-019 wiring)
- [ ] Phase 4 (SEPARATE SESSION) net-new run green (or documented skip/fixme); **full spec green incl. existing 26**
- [ ] Phase 5 GARDENER sweep clean
- [ ] Phase 6 closure manifest + LR-055 PASS (C1–C6) + master §Roadmap annotation
- [ ] `/regression-guard` before/after = no silent breakage
- [ ] Activity-log row per LR-028 (LR-037 timestamp ≥ touched-file mtimes)
- [ ] `/final-q` verdict block emitted (LR-042)

---

## Handoff (chat-only per `feedback_handoff_in_chat_only.md`)

Rutvik triggers `/execute SUBPLAN_ACCOUNT_ADDRESS_FCC` manually (acceptEdits, per-phase review — not `/chain`). Watches chat for the `/final-q` verdict after each phase boundary. If any STRICT-LINE (A–G) fires HALT → Claude pauses, Rutvik decides next step in chat. Account & Address is the widest-surface FCC conversion to date; its blend-at-top + max-granular catalog become the reference pattern for the remaining `§Roadmap` modules.

---

## Verification (runnable post-execution)

```bash
# Net-new tests blended at top, existing untouched
git diff clients/encore/specs/locations/location-account-address.spec.ts   # FCC tests at top of existing describe; TC-001..028 unchanged
grep -c "saveAndVerifyCase" clients/encore/specs/locations/location-account-address.spec.ts   # = save-cycle net-new count + 1 (import)
grep -c "@fcc" clients/encore/specs/locations/location-account-address.spec.ts                 # expect: 0 (blend-in, no tag)
grep -n "ensureDefaultState" clients/encore/specs/locations/location-account-address.spec.ts   # expect: a hit inside beforeEach (LR-019 per-test baseline wired)
grep -n "ensureDefaultState" clients/encore/src/pages/locations/location-account-address.page.ts # expect: hardened bounded-retry method present
npx playwright test location-account-address.spec.ts --list                                    # 26 existing + net-new
npx playwright test location-account-address.spec.ts --grep "TC-LOC-ACC-0(29|[3-9][0-9])" --workers=1 --retries=0   # net-new green (widen if catalog > 099)
npx playwright test location-account-address.spec.ts --workers=1 --retries=0                   # FULL spec green (existing 26 survive blend-in)
npm run check:tc-parity                                                                        # PASS
npx tsc --noEmit -p clients/encore/tsconfig.json                                               # exit 0
git diff --unified=0 clients/encore/specs/locations/location-account-address.spec.ts | grep -cE "^[+-].*TC-LOC-ACC-0(0[1-9]|1[0-9]|2[0-8])"   # 0 (STRICT-LINE-D)
ls clients/encore/specs_planning/_internal/field-case-catalogs/account-address-2026-05-29.md   # present
ls clients/encore/specs_planning/_internal/false-green-sweeps/account-address-2026-05-29.md     # present
```

---

## Out of scope (anti-rescope guard — LR-046, LR-050)

- FCC conversion of the existing 26 TCs to `saveAndVerifyCase()` lifecycle — separate future subplan if authorized.
- Converting the existing `dependencyGate([...])` chain to independent — out of scope (STRICT-LINE-D keeps existing untouched; dependencyGate is annotation-only anyway).
- App-side bugs surfaced during the walk/sweep — file a `BUG-LOC-ACC-<NNN>` bug JSON under the client bugs directory per LR-034 (this session filed BUG-LOC-ACC-001); do not fix app code.
- Renumbering existing TCs or reusing the 021/024 gaps — forbidden (STRICT-LINE-D + naming policy).
- Cross-module FCC (other Location Settings tabs) — their own `§Roadmap` subplans.

---

## Post-Audit Correction (2026-06-11) — Master Bill To per-launcher coverage gap

The Account & Address tab has three launcher fields. This subplan proved Venue/Branch **Name** and Venue/Branch **Address** GREEN, but **Master Bill To Address** was only half-covered: TC-LOC-ACC-012 proved the shared "Select Customer Address" dialog OPENS via the Master launcher, yet no test selected an address from the Master dialog, verified the Master display fields update, or probed Master-side persistence. Root cause: **shared-dialog conflation** — dialog-level coverage (exercised via the Venue launcher) was silently treated as launcher-level coverage for the Master launcher. The two launchers in fact diverge: Venue address selection does NOT persist through save+reload (TC-LOC-ACC-027), whereas Master Bill To selection DOES persist.

Corrected by **SUBPLAN_LAUNCHER_DIALOG_GAPS_FCC.md** (DONE 2026-06-11, Workstream B): 2 net-new TCs — TC-LOC-ACC-032 (Master row select → Master display fields update, Venue unchanged, Save enables) + TC-LOC-ACC-033 (Master persistence: select-different → save → reload → verify → restore-anchored-original → save → reload → verify). TC-LOC-ACC-012/014 notes extended to point select/persist at the new TCs. RCA: `clients/encore/specs_planning/_internal/rca-launcher-dialog-misses-2026-06-11.md`; walk evidence: `clients/encore/specs_planning/_internal/walk-evidence-account-address-master-bill-to-2026-06-11.md`. Permanent prevention landed in the launcher-dialog subplan (LR-057 — coverage is dedup'd per-LAUNCHER, never per-dialog). No app bug for the Master launcher (it persists correctly).

(Housekeeping note for this closed plan: the BUILDER matrix cell was repointed `specs/`→`tests/` to match the 2026-06-05 POM restructure, and the four 2026-05-29 evidence artifacts + BUG-LOC-ACC-001.json — cleaned from the working tree by specs_planning churn — were restored from git so the closure gate resolves them. No claim of this subplan changed.)
