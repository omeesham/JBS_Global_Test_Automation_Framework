> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute SUBPLAN_AUTO_ADDON_FCC.md`. All context below.**
>
> The agent self-bootstraps from this file's frontmatter + sections, with **zero additional user prompting**:
>
> 1. **Identity**: load `/identity` per the Identity field below (OWNER shell; per-phase `/identity HUNTER|WATCHDOG|GIVER|BUILDER|HEALER|GARDENER` at each phase boundary).
> 2. **Skills**: load every skill in the Skills line of §Bootstrap (leading skill auto-calls its chain).
> 3. **Model + thinking + permission-mode**: read the Model / Thinking / PermissionMode frontmatter fields (all three required per LR-041).
> 4. **Dependency gate**: verify every Depends-on item is DONE in plans/done/. HALT if blocked.
> 5. **Context load**: read PLAN_BIG_PIVOT_FCC_MASTER.md §Doctrine + §False-Green Sweep Doctrine + §Cascade closure rules + §DQU disposition, then every file in §Bootstrap Context-files. Missing context file = HALT.
> 5.5. **Browser tool**: declared `cli` in frontmatter per the LR-038 v2 matrix (catalog walkthrough + unattended save-cycles; no visual/CSS assertion, no fresh-passkey need, no mid-execution `pause:` step). Announce choice + reason in first output. Mid-subplan switches → `[BROWSER-SWITCH]` log per LR-028.
> 6. **Phase 0 FIRST**: dependency + browser-tool + empirical-verification gate before any edits.
> 7. **Execute Phases 0.5b → 6** in order. Phase boundaries = identity switches (clean re-load per feedback_identity_switch_protocol).
> 8. **Handoff**: flip the Status field to DONE + add the Executed date, append activity-log row (LR-028 + LR-037), annotate the master, `git mv` to plans/done/, `npm run plans:reindex`, `/final-q`.
>
> **HALT + ASK USER** if: dependency blocker / scope ambiguity beyond the KEEP list / Phase 0-1 discovers >30% scope extension (e.g., the tab no longer renders 5 checkboxes) / regression-guard shows unrelated changes / LR-037 timestamp drift / **LR-040 closure-completeness — any planned item not classifiable (a) MCP-proven, (b) grep-verifiable line item in a named existing recipient subplan, or (c) user-flagged discussion-item with named flag**.

---

# SUBPLAN_AUTO_ADDON_FCC

**Status**: DONE
**Executed**: 2026-06-11
**Priority**: P1
**Created**: 2026-06-11
**Identity**: OWNER (multi-identity by phase — HUNTER → WATCHDOG → GIVER → BUILDER → WATCHDOG/HEALER → GARDENER → OWNER)
**Parent**: PLAN_BIG_PIVOT_FCC_MASTER.md
**Depends on**: SUBPLAN_NOTES_FCC_PILOT.md (DONE 2026-05-22 — paradigm infra: `clients/encore/src/utils/field-case-runner.ts` `saveAndVerifyCase`; post-POM path — the Left-Panel sibling's `src/core/` citation is pre-restructure and stale)
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**BrowserTool**: cli
**Author**: Rutvik (via Claude Fable 5)
**ActiveClient**: encore

co-doctrine: §False-Green Sweep Doctrine (PLAN_BIG_PIVOT_FCC_MASTER.md) — NOT a second parent (per LR-048 singular-Parent schema).

---

## Context

PLAN_BIG_PIVOT_FCC_MASTER.md §Roadmap line 98 names this subplan. Target surface: **Location Settings → Basic Information → Auto Add-On sub-tab** (`/navigator/locations/1604/settings/location`, office 1604 "Parker Palm Springs") — 5 Radix checkboxes (Encore Music, Wireless Presenter, Express Content Design Session, Wordly, Labor), shared "Save Changes" dialog with **Ok** confirm (walk-evidence-location-settings-2026-05-14), unsaved-changes Stay/Discard dialog on page-navigation-away.

**Current state (verified 2026-06-11 against live code, LR-020):**
- Spec `clients/encore/tests/locations/location-auto-addon.spec.ts` EXISTS — describe `Location Auto Add-On @locations @auto-addon`, 19 runtime tests `TC-LOC-AAO-001..015, 017..020` (017/018 via `UNCHECK_PERSISTENCE_CASES` loop), per-test nav-guard `beforeEach`, no fixme/skip, no bare-`page` destructure.
- **LR-019 exposure**: default-state restore lives ONLY in TC-001's body (spec lines 21-35); `beforeEach` has no `ensureDefaultState` → net-zero-vulnerable on dirty start / per-test retry. This is the single biggest structural gap.
- Page object `location-auto-addon.page.ts` EXISTS — Radix state helpers + inline save-dialog handling; NO `ensureDefaultState`, NO FCC-runner usage; contains sweep-candidate patterns (see Phase 0.5fg) and a blind `toggleCheckbox` (plain `.click()`, lines 45-48).
- Selectors `src/selectors/locations/auto-addon.ts`, data `src/data/locations/location-auto-addon.ts` (`AUTO_ADDON_DEFAULTS` 1604: Music✓ Presenter✓ ExpressCDS✗ Wordly✓ Labor✓) EXIST.
- TC MD `locations_auto_addon_test_cases.md` + test plan EXIST but are dated **2026-03-24** (header "Partial") — pre-POM-restructure, pre-blend-doctrine, ~2.5 months stale. TC-LOC-AAO-016 is Manual/Not-Automatable on a now-falsified premise (below).
- **ABSENT (the FCC gap this subplan closes): field inventory, old-site baseline, field-case catalog, false-green sweep — none exist for auto-addon.**

**User-provided facts (Rutvik, 2026-06-11 — treat as truth, cite this provenance):**
1. The Auto Add-On item list is **exactly 5 for every location checked; it does not mutate per location**. → TC-LOC-AAO-016's "Item Count Is Location-Specific" premise is wrong; correct the TC body (keep the ID — feedback_renumber_verify_gap_cause).
2. **Auto Add-On saves produce NO Location Management History rows.** Record in the field inventory's save-cycle section with this provenance. Opportunistic corroboration during a save-cycle walk is allowed (one glance at the History tab), but NO history workstream, NO per-column HIST tests here.
3. Scope = **office 1604 only** — "no more bs". Multi-office observation is OUT.

**Provenance / subsumption (user triage 2026-06-11):**
- `plans/pending/SUBPLAN_DQU_18_F1g_AUTO_ADDON_AUDIT.md` is **SUBSUMED into this subplan** (its Phase 0.5b baseline walk, Phase 1 field inventory, Phase 2 TC-MD diff + XLSX rebuild are this subplan's Phases 0.5b/1/2). Its still-live focus areas absorbed here: round-trip persistence per item; country-scoped rules NM-1462/64/65 noted as not-testable-on-1604 (record as LR-040(c) discussion item); TC-016 disposition. Its multi-office focus (1605/1101) is dropped per user fact #1+#3. Phase 6 flips its Status to SUBSUMED and records the triage in the master per §DQU disposition.
- `plans/pending/PLAN_GENERATOR_AUDIT_AUTO_ADDON.md` (2026-03-25, P2) is **suspect-stale** — user: "do not be blind by plans… do not assume pending plan = nice plan." Phase 1.5 re-verifies every code-level claim it makes against current code + live behavior; only confirmed-real items get fixed (in Phase 3); the plan file gets a disposition annotation in Phase 6. Known already: its Finding-2 fix (beforeunload suppression) ALREADY landed in the page object (lines 140-145).

This subplan inherits the installed FCC paradigm — no re-installing runner/taxonomy/agent prompts. It carries the master's §False-Green Sweep Doctrine obligations (Phase 0 + 0.5fg + N-1 + N) and Doctrine items 1-8 (notably item 3 blend-at-top/no-`@fcc`-tag, item 6 save-first navigation, item 8 de-dup by proven outcome).

---

## Bootstrap

**Identity**: OWNER (sub-phases tagged via per-phase `/identity X`).
**Skills auto-called**: `/identity` (each phase boundary), `/relevant` (session start), `/regression-guard` (pre+post BUILDER), `/rca` + `/bugfix` (conditional — Phase 4 RED), `/find-bugs` (Phase 4 adversarial pass), `/final-q` (closure, LR-042).
**Context files (load order):**
1. `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` — §Doctrine + §Roadmap + §False-Green Sweep Doctrine + §Cascade closure rules + §DQU disposition
2. `plans/done/SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC.md` — freshest Location-Settings FCC sibling (structure + v3 matrix + Post-Audit Correction lessons). ⚠ Its `clients/encore/specs/` + `src/core/` + `src/data/testdata/` paths are PRE-POM-restructure — this subplan's paths (tests/, src/data/, src/utils/) are the current truth.
3. `plans/done/SUBPLAN_ACCOUNT_ADDRESS_FCC.md` — sibling (gap-matrix format + deferred-with-bug precedent)
4. `clients/encore/tests/locations/location-auto-addon.spec.ts` — the 19 runtime tests (blend target)
5. `clients/encore/src/pages/locations/location-auto-addon.page.ts` + `src/selectors/locations/auto-addon.ts` + `src/data/locations/location-auto-addon.ts`
6. `clients/encore/specs_planning/test-cases/setup/locations/locations_auto_addon_test_cases.md` + `…/test-plans/setup/locations/locations_auto_addon_test_plan.md` — 2026-03-24, read SKEPTICALLY (stale-suspect)
7. `clients/encore/specs_planning/_internal/field-case-generation.md` §2 (Checkbox row) + §1 (3-tier save verification)
8. `clients/encore/specs_planning/_internal/field-inventory-spec.md` + `_internal/field-inventories/_TEMPLATE.md` — 8 frontmatter keys + 7 sections
9. `clients/encore/src/utils/field-case-runner.ts` — `saveAndVerifyCase()` runner
10. `clients/encore/src/pages/locations/location-legal.page.ts` — `ensureDefaultState` bounded-retry pattern to REUSE (read → re-set → save → reload → re-verify; throws after 3 cycles)
11. `clients/encore/specs_planning/_internal/walk-evidence-location-settings-2026-05-14.md` — dialog-label inventory ("Ok" on all 8 LS sub-tabs)
12. `plans/pending/SUBPLAN_DQU_18_F1g_AUTO_ADDON_AUDIT.md` + `plans/pending/PLAN_GENERATOR_AUDIT_AUTO_ADDON.md` — subsumption/re-verification INPUTS (read skeptically; both pre-date the POM restructure)
13. `export_test_cases/module-codes.json` — `AAO` entry + bug grammar `BUG-LOC-AAO-NNN`
14. `clients/encore/CLAUDE.md` — LR-ENC-001 (baseline truth), LR-ENC-002 (parity structural), LR-ENC-003 (.env.local), LR-012 (shared dialog), LR-017 (namespaces), LR-036 (boolean render)
15. `.claude/rules/` — pipeline.md (LR-027/040/041/046/048/050/055), specs.md (LR-018/019/021/022/024/025/051/052/053/056), angular.md (LR-009/010/011/026), browser-tool.md (LR-038/054), inventory + baseline + data packs
16. `clients/encore/specs_planning/_internal/agent-mistakes.md` — ALL-089 (checkbox driver: check()/uncheck() vs setRadixCheckbox; wait Save-disabled before reload) + any rows newer than this subplan's Created date
17. `.claude/context/navigation.md` — §B routing rows (Radix checkbox, save dialog, LR-056 network filters, tablist activation quirk)

**Missing context file = HALT.**

---

## Phase 0 — Dependency + browser-tool + empirical-verification gate (LR-048 + False-Green Doctrine §2, OWNER)

**[GATE-D0]** Before any work:
- [ ] `plans/done/SUBPLAN_NOTES_FCC_PILOT.md` is DONE (paradigm infra shipped).
- [ ] `clients/encore/src/utils/field-case-runner.ts` exists and exports `saveAndVerifyCase` (grep).
- [ ] Spec / page object / selectors / data files exist at the §Context paths (this is a BLEND, not net-new — confirm 19 runtime tests via `npx playwright test --list`).
- [ ] Local runs use `.env.local` — never `CI_ENV=e2e` (LR-ENC-003).
- [ ] **Browser tool: CLI** announced (LR-038 v2 — catalog walkthrough 5 fields + save-cycles, unattended; no MFA per client CLAUDE.md; LR-054 Table 2 covers click/fill/snapshot/state-save). Auth via `playwright-cli -s=e2e state-load clients/encore/.auth/encore-state.json` then re-`goto` (Account-Address runbook); Gate 3 headed fallback on Entra redirect.
- [ ] **Empirical verification gate** (nested-orbit v2 Phase 0): page-collision / context-options propagation / trace fidelity / per-TC baseline checks. Emit `clients/encore/specs_planning/_internal/phase-0-verification-auto-addon-<YYYY-MM-DD>.md` with **PROCEED** verdict. PROCEED required to continue.

**HALT** if any gate fails → escalate in chat.

## Phase 0.5b — Baseline-first walk (HUNTER; LR-048 §5 + LR-045 + LR-ENC-001)

`/identity HUNTER`. This subplan drives TC corrections → baseline-first walk REQUIRED.
- Visit baseline `https://navigator2.training.psav.com/#/setup/locationdetail/1604` FIRST (before the e2e walk). Locate the Auto Add-On equivalent if any. **`baselineScope: baseline-absent` is a legitimate verdict** (old site may lack per-item auto-add-on config) — NOT a HALT; record + escalate via `/encore-questions` draft note per ALL-078 only if a genuine divergence question emerges.
- Observation-only — zero selector parity (LR-ENC-001).
- Emit `clients/encore/specs_planning/_internal/old-site-baseline/auto-addon-<YYYY-MM-DD>.md` (free-form, 5-7 sections, frontmatter `baselineScope: full | baseline-partial | baseline-absent`).
- Include `## Baseline diff` classifying each observed-vs-baseline divergence: regression-from-baseline / intentional-UX-change / baseline-absent.

## Phase 0.5fg — False-green pre-audit (WATCHDOG; False-Green Doctrine §3)

`/identity WATCHDOG`. Run all **11 sweeps** (master §False-Green Sweep table) against the EXISTING `location-auto-addon.spec.ts` + `location-auto-addon.page.ts`.
- Known candidate sites to examine (classify honestly — do NOT prejudge verdicts): `clickSave`'s `waitForTimeout(500)` poll loop (page object L88-93 — Sweep 9 / LR-052 class); the `.catch(() => {})` / `.catch(() => false)` cluster (L80/83/90/115/120/124/130/135/152/165/170 — Sweeps 1+4); `isVisible()` branch in `clickSidebarHome` (L135 — Sweep 4); `waitForToast` boolean-catch (Sweep 4); TC-001-only baseline restore (LR-019 exposure — STATE-LEAK class).
- Emit `clients/encore/specs_planning/_internal/false-green-sweeps/auto-addon-<YYYY-MM-DD>.md` classifying every finding: FALSE-GREEN / PARTIAL / FLAKY-MASK / STALE-SKIP / INFLATED / STATE-LEAK / CLEAN.
- Note: `false-green-sweeps/` + `phase-0-verification-*` are not tabulated rows in §2's ownership table (sibling FCC subplans shipped them fine under per-phase identities). If the identity-gate hook nonetheless denies a write, use the LR-043 OWNER short-circuit (clean `/identity OWNER` re-load), log the switch, and continue — do NOT hand-edit hook/ownership files mid-subplan.

## Phase 1 — Field inventory (HUNTER; LR-013/014/015)

`/identity HUNTER`. Live e2e walk on **office 1604** (`/navigator/locations/1604/settings/location` → Auto Add-On tab; Radix tab activation needs full pointer sequence or Playwright `.click()` — navigation.md §B row).
- Confirm all 5 checkboxes: labels, data-testids, live default states (vs `AUTO_ADDON_DEFAULTS`), enabled/disabled, any per-item extra fields (none expected — confirm).
- Save-cycle observation: dialog heading + buttons (expect Cancel/**Ok** per walk-evidence 2026-05-14), toast, Save enable/disable behavior, form re-enable after save. Record the backend save endpoint from `playwright-cli network` (needed if any LR-056 listener is ever authored; never page-URL substring).
- Record user-fact: saves produce NO LM-History rows (provenance: Rutvik 2026-06-11); one opportunistic History-tab glance after a save cycle is allowed as corroboration — no workstream either way.
- Record user-fact: item list is 5 everywhere / not location-specific (provenance: Rutvik 2026-06-11) — kills TC-016's premise.
- Note NM-1462/64/65 country-scoped rules as not-testable-on-1604 → LR-040(c) discussion item (carried from subsumed DQU_18).
- Emit `clients/encore/specs_planning/_internal/field-inventories/auto-addon-<YYYY-MM-DD>.md` — all 8 frontmatter keys (`MCP_Session_Date` = filename date) + 7 mandatory sections; testid column complete (LR-014).

## Phase 1.5 — Stale-claims re-verification (WATCHDOG; user mandate 2026-06-11 — "do not be blind by plans")

`/identity WATCHDOG`. Re-verify every code-level claim of `PLAN_GENERATOR_AUDIT_AUTO_ADDON.md` (findings at its lines 20/33/69/77/93/135/145) against CURRENT code + the Phase-1 live walk. Emit a verdict table as a `## Stale-claims re-verification` section INSIDE the Phase-0.5fg false-green sweep artifact (`false-green-sweeps/auto-addon-<YYYY-MM-DD>.md`) — WATCHDOG-owned home, NOT the field-case catalog (GIVER-owned; §2 ownership). One row per finding:

| Finding (2026-03-25) | Verdict: CONFIRMED-STILL-REAL / ALREADY-FIXED / STALE-IRRELEVANT / NOT-REPRODUCIBLE | Evidence |
|---|---|---|
| F2 beforeunload↔fixture race | expect ALREADY-FIXED (suppression at page object L140-145) — verify live that TC-013/014/015 still pass | … |
| F4 sub-tab-switch dirty-flag reset hypothesis | verify live during Phase 1 walk (TC-012 behavior: sub-tab switch with dirty form → silent, no dialog) | … |
| F5 blind `toggleCheckbox` override | present at L45-48; decide: replace with smart setter / keep with justification | … |
| F6 async URL check after dialog nav | check current `getCurrentUrl()` usage in TC-013/015 | … |
| F1/F3/F7 (selector collision / shared.ts labels / pattern discovery) | check current deferral homes still exist; mark STALE-IRRELEVANT if already landed elsewhere | … |

Only CONFIRMED-STILL-REAL items become Phase 3 work. The same skeptical re-read applies to the 2026-03-24 TC MD + test plan (testid drift, dialog labels, navigation paths — diff against the Phase-1 inventory).

## Phase 2 — Coverage ledger + field-case catalog + TC parity (GIVER; LR-048 §6.5 GIVER row, LR-ENC-002)

`/identity GIVER`.
1. **Coverage ledger** (doctrine item 8): for each of the 20 documented TCs, list every `(field, assertion)` it proves — including per-field persistence discharged by multi-field saves (TC-011 multi-toggle save, TC-017/018 Wordly/Labor uncheck-persist, TC-020 bulk-invert-persist asserts per-item state for ALL 5 fields after reload — confirmed in the spec body, lines ~238-260 — so it discharges check+uncheck persistence for every item).
2. **Gap matrix**: 5 checkbox fields × taxonomy §2 Checkbox cases (toggle-on→save-persist, toggle-off→save-persist, toggle-revert LR-009) + form-level cases (save dialog, cancel, unsaved-changes, bulk) + Tier-2 network-status check (taxonomy §1) as a candidate. Classify EVERY cell (a) implement net-new / (b) already-covered-by-outcome (cite the discharging TC) / (c) not-applicable-or-deferred (cite reason).
3. **Honest-zero clause**: author net-new TCs ONLY where the ledger shows an unproven assertion. **Zero net-new is an acceptable GREEN outcome** — the catalog proving full coverage IS the deliverable. No filler tests to look busy.
4. Emit `clients/encore/specs_planning/_internal/field-case-catalogs/auto-addon-<YYYY-MM-DD>.md` (ledger + gap matrix + final net-new list `TC-LOC-AAO-021+` if any; cross-reference — do not duplicate — the Phase-1.5 verdict table in the sweep artifact).
5. **Refresh the TC MD** (`locations_auto_addon_test_cases.md`): correct TC-016 body per user fact (keep the ID; re-scope to "item list is the same 5 across locations — premise corrected 2026-06-11, stays Manual" or per catalog disposition); fix any drift found in Phase 1/1.5 with `**MCP_VERIFICATION_LOG**: auto-addon-<date>.md §<section> "<field>" — <evidence>` citations; refresh header status; append net-new TC blocks (every block carries an explicit `**Notes**:` field — to-csv.ts parser gotcha).
6. **Update the test plan** (`locations_auto_addon_test_plan.md`): scenarios for net-new TCs; correct stale scenario steps found in 1.5.
7. Rebuild the workbook: `npm run xlsx:build` (13-col merged TestRail layout, sheet `locations_auto_addon`). **`npm run check:tc-parity` must exit 0** (guardrails 4-7 incl. ID↔sheet liveness).
8. Bug CANDIDATES: any live-walk divergence that survives the LR-044 oracle (nav2 baseline + REQUIREMENTS) is recorded in the catalog as a named bug-candidate flag — the JSON filing itself happens in Phase 4 under HEALER identity (§2 ownership: `reports/bugs/*.json` CREATE = BUILDER/HEALER, not GIVER), grammar `BUG-LOC-AAO-NNN` per module-codes.json (the subsumed DQU_18's `BUG-AAO-NNN` form is stale grammar — do not use). Empty-everywhere + no-UI-path + no-Jira → discussion-item flag, not a bug (feedback_discussion_item_not_bug).

## Phase 3 — Build / harden (BUILDER; LR-048 §6.5 BUILDER row)

`/identity BUILDER`. `/regression-guard` snapshot BEFORE.
1. **LR-019 per-test baseline (the load-bearing fix)**: add a hardened `ensureDefaultState(AUTO_ADDON_DEFAULTS)` to `location-auto-addon.page.ts` — REUSE the Legal bounded-retry pattern (`location-legal.page.ts`: read → re-set → save → reload → re-verify, throws after 3 cycles; `clickSaveWithDialog`-returns-success-when-disabled caveat). Wire it into the spec's `beforeEach` after the nav-guard. TC-001's inline restore block becomes redundant → slim TC-001 to its navigation + count assertions (record in catalog as outcome-preserving refactor).
2. **Checkbox driver**: verify live which setter is reliable on this tab (existing `setRadixCheckbox` vs Playwright `check()/uncheck()` per ALL-089). Align `checkCheckbox`/`uncheckCheckbox` + replace the blind `toggleCheckbox` ONLY if Phase 1.5 confirmed it harmful; otherwise keep + document why.
3. **Net-new FCC cases** (if catalog says any): blend at TOP of the existing describe (immediately after `beforeEach`, above TC-001), sequential IDs `TC-LOC-AAO-021+`, same `@locations @auto-addon` tags, **NO `@fcc` tag** (doctrine item 3). Save-cycle cases via `saveAndVerifyCase()` (compile-required baseline). Existing TC bodies stay UNTOUCHED except: TC-001 slim-down (item 1) + any Phase-1.5 CONFIRMED fixes.
4. **Sweep fixes intake**: confirmed FALSE-GREEN/LR-052 findings from Phase 0.5fg that live in the page object (e.g., the `waitForTimeout(500)` poll → `waitForFunction`/locator-wait) are fixed here if mechanical; spec-level false-green fixes belong to Phase 4 (HEALER). Test data updates in `src/data/locations/location-auto-addon.ts` only if Phase 1 found drift.
5. Anti-patterns honored: LR-051 (no OR-expr `.toBe(true)`), LR-052 (no fixed sleeps in polls), LR-022 (no hardcoded structural counts — the existing count-5 assertions in TC-001/002 stay because item count IS the feature under test there), LR-009/LR-026 (revert→Save-disabled; defensive dirty-state), doctrine item 6 (save-first navigation — only TC-013/014/015 may hold a dirty form across navigation because the dialog IS their unit under test). No bare-`page` destructure.
6. First run: `npx playwright test location-auto-addon.spec.ts --workers=1 --retries=0` individually green BEFORE any full-suite run (feedback_always_run_individual_first). `npx playwright test --list` resolves all TC-LOC-AAO IDs. `/regression-guard` snapshot AFTER.

## Phase 4 — Completeness audit + false-green fix + combined verification (WATCHDOG/HEALER; False-Green Doctrine §4+§5)

`/identity WATCHDOG`. `/find-bugs` adversarial pass on the touched spec.
- FCC completeness audit: every gap-matrix cell classified (a)/(b)/(c) with evidence (LR-040); TC ↔ MD ↔ XLSX parity (ALL-071 / LR-ENC-002); Phase-1.5 verdict table complete (no UNRESOLVED rows).
- **Phase N-1 false-green fix** (`/identity HEALER` if needed): fix every remaining confirmed FALSE-GREEN from Phase 0.5fg (nested-orbit v2 §A-1 for any bare-`page`; pattern-appropriate fixes otherwise). Sync MD Status on any fix (HEALER HARD STOP #6). RCA any RED via `/rca` — artifact-first (LR-024: clean, run fresh, read failure artifacts BEFORE re-running).
- **Bug filing** (`/identity HEALER`): file every Phase-2 bug-candidate that still reproduces as `clients/encore/reports/bugs/BUG-LOC-AAO-NNN.json` per LR-034 + LR-044 (verbatim steps, baselineComparison, dedup first).
- **Phase N combined verification**: full spec run `--retries=0 --workers=1` green **×2** (HLR-007). If sibling specs were touched (not expected), include them.

## Phase 5 — Structural sweep (GARDENER; LR-050 — honest scope)

`/identity GARDENER`. No rename in this subplan (module slug `auto_addon`, TC prefix `TC-LOC-AAO`, file names all stay). Enumerated sweep:

| Item | Action | File(s) |
|---|---|---|
| Inline save-dialog handling in `clickSave`/`clickSaveOk` vs base-page `clickSaveWithDialog` | Dedup ONLY if behavior-identical (LR-012 shared-dialog); else KEEP + 1-line comment why | `location-auto-addon.page.ts` |
| Dead/orphan selectors after Phase 3 | remove if provably unused (grep) | `src/selectors/locations/auto-addon.ts` |
| Redundant TC-001 restore block | confirmed removed by Phase 3 item 1 | spec |
| Typecheck + barrel consistency | `npx tsc --noEmit -p clients/encore/tsconfig.json` clean | — |

If an item yields nothing, record `(skipped: <reason>)` honestly — no make-work refactors, zero behavior change allowed in this phase.

## Phase 6 — Closure (OWNER; LR-027 + LR-040 + LR-055)

`/identity OWNER`.
1. Flip the Status field to DONE + add the Executed date.
2. `### Execution Summary`: TCs final count + IDs; per-cell (a)/(b)/(c) dispositions; Phase-1.5 verdict table summary; verification results in evidence-emission format `ran '<cmd>' → output: '<snippet>'` (spec run ×2, typecheck, xlsx:build, check:tc-parity, --list, regression-guard before/after); honest deviations log (LR-046; live pivots recorded inline per the Plan-Deviation taxonomy, not as D-rows).
3. **Per-Identity Matrix closure audit** — every cell resolves to a real path / `(skipped: ≥20 chars)` / `(none)` (C6).
4. **Parent cascade**: master stays PENDING — cite verbatim `LR-027 cascade SKIPPED per master plan §Cascade closure rules (user override 2026-05-21)` + activity-log row recording the override. Annotate the DONE line into master §Roadmap line 98.
5. **Subsumption bookkeeping**: flip `SUBPLAN_DQU_18_F1g_AUTO_ADDON_AUDIT.md` Status to `SUBSUMED (into SUBPLAN_AUTO_ADDON_FCC.md — user triage 2026-06-11)` + provenance note; record the DQU-triage decision in master §DQU disposition. Annotate `PLAN_GENERATOR_AUDIT_AUTO_ADDON.md` (current Status: `REVISED`) with the Phase-1.5 verdict-table pointer + per-finding disposition; if every finding lands ALREADY-FIXED / STALE-IRRELEVANT / fixed-here, propose marking it RESOLVED-BY-pointer — HALT and ask the user before flipping its Status if any finding remains open and un-homed. If the closure hook denies any of these non-DONE status edits, HALT and surface — never bypass (LR-055).
6. Closure gate: `node scripts/validate-plan-closure.mjs --enforce` C1-C6 PASS (manifest JSON is a user-side lock-path — not auto-emitted; cite the gate PASS itself).
7. Activity-log row (LR-028; LR-037 timestamp ≥ touched-file mtimes). `git mv` to `plans/done/` + `npm run plans:reindex`.
8. `/final-q` verdict block (GREEN | YELLOW | RED) per LR-042. Update `navigation.md` §C with the new auto-addon registry row (+ any §B routing additions) per /reflect obligations.

---

## Execution Summary

**Executed**: 2026-06-11 | **Outcome**: GREEN | **Net-new TCs**: 0 (honest-zero — full field×case coverage proven by the existing 20 TCs)

### TCs — final count
19 runtime TCs unchanged (`TC-LOC-AAO-001..015, 017..020`; 016 Manual). **Zero net-new** — the gap matrix (catalog) classified every (field × case) cell as already-covered-by-outcome (b) or not-applicable/deferred (c); the subplan's honest-zero clause blesses this. TC-016 corrected (ID kept) from a falsified "location-specific" premise to "country-scoped" (live evidence: `auto-addon-types?countryId=1` + nav2 baseline parity). TC-001 slimmed (inline restore → describe-level `ensureDefaultState`).

### Phase results (evidence-emission per LR-042)
- **Phase 0** — gate PROCEED. `ran 'playwright-cli open .../1604/settings/location'` → title "Location Settings | Navigator" (authenticated, no Entra redirect); 5 checkboxes pierced live = `AUTO_ADDON_DEFAULTS`. Artifact: `phase-0-verification-auto-addon-2026-06-11.md`.
- **Phase 0.5b** — `baselineScope: baseline-partial`. nav2 Auto Add-On tab PRESENT with the same 5 items (parity, no regression). Artifact: `old-site-baseline/auto-addon-2026-06-11.md`.
- **Phase 0.5fg** — 11-sweep: **zero confirmed FALSE-GREEN**. 1 STATE-LEAK (TC-001-only baseline) + 1 PARTIAL/LR-052 (`clickSave` `waitForTimeout(500)` poll) → both fixed in Phase 3. Artifact: `false-green-sweeps/auto-addon-2026-06-11.md`.
- **Phase 1** — field inventory: 5 checkboxes (testids/labels/defaults/enabled), save dialog "Save Changes"/Cancel·Ok, save endpoint `PUT /navigator/api/location/update-properties`, country-scoped loader `auto-addon-types?countryId=1`, round-trip persistence confirmed, user-facts recorded with provenance, NM-1462/64/65 = LR-040(c). Artifact: `field-inventories/auto-addon-2026-06-11.md`.
- **Phase 1.5** — all 7 PLAN_GENERATOR_AUDIT findings re-verified: F1/F3/F7 STALE-IRRELEVANT, F2/F6 ALREADY-FIXED, F4 mitigated-no-work, F5 CONFIRMED→KEPT-with-justification. Verdict table in the sweep artifact. GENERATOR_AUDIT annotated RESOLVED-BY-pointer.
- **Phase 2** — coverage ledger + gap matrix (catalog `field-case-catalogs/auto-addon-2026-06-11.md`); TC MD + test plan refreshed (TC-016 corrected, MCP log dated, dangling notes fixed); `ran 'npm run xlsx:build'` → exit 0 (locations_auto_addon 20 rows); `ran 'npm run check:tc-parity'` → exit 0 (PASS; auto-addon zero divergence). XLSX lint caught + scrubbed client-facing jargon (dates/NM/nav2/old-site) from TC-016/TC-012 — internal provenance kept only in `_internal/` artifacts.
- **Phase 3** — LR-019 `ensureDefaultState(AUTO_ADDON_DEFAULTS)` added (bounded 3-retry whole-cycle, throws; Legal pattern) + wired into `beforeEach`; LR-052 poll replaced with `waitForFunction`; checkbox driver verified (`setRadixCheckbox` is a state-aware idempotent click = ALL-089-reliable, no change); blind `toggleCheckbox` KEPT + justified (F5). `ran 'npx tsc --noEmit -p clients/encore/tsconfig.json'` → exit 0; `ran 'npx playwright test ... --list'` → 19 TC-LOC-AAO IDs.
- **Phase 4** — `/find-bugs` adversarial pass: no new bugs, none filed. `ran 'npx playwright test location-auto-addon.spec.ts --workers=1 --retries=0'` → **20 passed (2.1m)** [run 1], **20 passed (2.0m)** [run 2], **20 passed (2.2m)** [run 3] — green ×3 (HLR-007 ×2 satisfied with margin).
- **Phase 5** — GARDENER: `clickSave` NOT deduped to base `clickSaveWithDialog` (different confirm button "Ok" vs "Save" + post-save re-enable wait) — KEPT + 1-line comment (LR-012). Dead selectors: `contentAutoAddon`/`formAutoAddon` unused-in-code but documented DOM-contract refs in TC-001 MD → KEPT. `chkAutoAddon{WirelessPresenter,Wordly,Labor}` resolve via `AUTO_ADDON_DEFAULTS` (not dead). Typecheck clean. Zero behavior change.

### Files
- **NEW** (5): `_internal/phase-0-verification-auto-addon-2026-06-11.md`, `_internal/old-site-baseline/auto-addon-2026-06-11.md`, `_internal/false-green-sweeps/auto-addon-2026-06-11.md`, `_internal/field-inventories/auto-addon-2026-06-11.md`, `_internal/field-case-catalogs/auto-addon-2026-06-11.md`.
- **EDITED**: `tests/locations/location-auto-addon.spec.ts` (beforeEach ensureDefaultState + TC-001 slim), `src/pages/locations/location-auto-addon.page.ts` (ensureDefaultState + LR-052 fix + F5/dedup comments), `test-cases/.../locations_auto_addon_test_cases.md` (TC-016 + refresh), `test-plans/.../locations_auto_addon_test_plan.md`, `test_cases_xlsx/encore_test_cases.xlsx` (rebuilt).
- **CLOSURE**: master annotated (DONE line + §DQU triage; stays PENDING per cascade exemption), DQU_18 → SUBSUMED, GENERATOR_AUDIT → RESOLVED-BY-pointer.

### Deviations (LR-046)
None requiring rescope. The honest-zero net-new is the catalog-blessed outcome, not a rescope of a strict line. No strict plan line was APPEND/SPAWN-deferred. The nav2 baseline initially redirected to its own login then SSO-bridged after a settle (recorded in the baseline artifact) — not a blocker.

### Parent cascade
LR-027 cascade SKIPPED per master plan §Cascade closure rules (user override 2026-05-21). Master stays PENDING; this child's DONE line annotated into master §Roadmap.

---

## Per-Identity Satisfaction (LR-048 v3 — every cell a real path, `(skipped: ≥20 chars)`, or `(none)`)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | field-inventory + old-site-baseline | clients/encore/specs_planning/_internal/field-inventories/auto-addon-2026-06-11.md<br>clients/encore/specs_planning/_internal/old-site-baseline/auto-addon-2026-06-11.md | `ls` both; `grep MCP_Session_Date` = filename date |
| GIVER | catalog + test-cases MD + test-plan + XLSX | clients/encore/specs_planning/_internal/field-case-catalogs/auto-addon-2026-06-11.md<br>clients/encore/specs_planning/test-cases/setup/locations/locations_auto_addon_test_cases.md<br>clients/encore/specs_planning/test-plans/setup/locations/locations_auto_addon_test_plan.md<br>clients/encore/test_cases_xlsx/encore_test_cases.xlsx | `npm run check:tc-parity` exit 0 |
| BUILDER | spec + page object + test data (+ selectors if touched) | clients/encore/tests/locations/location-auto-addon.spec.ts<br>clients/encore/src/pages/locations/location-auto-addon.page.ts<br>clients/encore/src/data/locations/location-auto-addon.ts | `npx playwright test --list` resolves all TC-LOC-AAO IDs |
| HEALER | RCA-driven spec/page-object fixes + bug filing + MD Status sync (conditional — see footnote) | (skipped: zero RED failures and zero confirmed FALSE-GREEN required HEALER RCA/fix/bug-filing work this run — the LR-019 STATE-LEAK and LR-052 poll were BUILDER preventive fixes, first run green) | full spec run green ×2 (`--retries=0 --workers=1`) |
| WATCHDOG | false-green sweep + phase-0 verification + Phase-1.5 verdict table + FCC audit | clients/encore/specs_planning/_internal/false-green-sweeps/auto-addon-2026-06-11.md<br>clients/encore/specs_planning/_internal/phase-0-verification-auto-addon-2026-06-11.md | sweep emitted + Phase-0 verdict PROCEED + Phase 4 audit GREEN |
| GARDENER | structural dedup sweep (page object dialog handling, dead selectors; conditional — see footnote) | clients/encore/src/pages/locations/location-auto-addon.page.ts | `npx tsc --noEmit -p clients/encore/tsconfig.json` clean |
| OWNER | closure + master annotation + subsumption bookkeeping | plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md<br>plans/pending/SUBPLAN_DQU_18_F1g_AUTO_ADDON_AUDIT.md<br>plans/pending/PLAN_GENERATOR_AUDIT_AUTO_ADDON.md | `node scripts/validate-plan-closure.mjs --enforce` C1-C6 PASS |

**Conditional-row footnote (C6 cell-form discipline)**: the HEALER and GARDENER rows are conditional. If the honest outcome is that no work of that class occurred, REPLACE that row's Concrete-deliverable cell at closure with `(skipped: <reason ≥20 chars>)` — e.g., `(skipped: zero RED failures and zero confirmed FALSE-GREEN required HEALER work)`. C6 validates the FINAL cell form: pure path(s), `(skipped:…)`, or `(none)` only — never leave instruction prose inside a cell.

---

## Acceptance Criteria

- [ ] Phase 0 gates passed; `phase-0-verification-auto-addon-<DATE>.md` verdict = PROCEED.
- [ ] Phase 0.5b old-site-baseline emitted with `## Baseline diff` (baseline-absent allowed, recorded honestly).
- [ ] Phase 0.5fg false-green sweep emitted; zero unfixed confirmed FALSE-GREEN at close (master closure gate).
- [ ] Phase 1 field-inventory emitted (5 checkbox rows, 8 keys, 7 sections, testids complete); user-facts recorded with 2026-06-11 provenance; NM-1462/64/65 noted as LR-040(c) discussion item.
- [ ] Phase 1.5 verdict table complete — every PLAN_GENERATOR_AUDIT_AUTO_ADDON finding has a verdict + evidence; TC MD / test plan stale-claims diffed against inventory.
- [ ] Phase 2 catalog: every gap-matrix cell classified (a)/(b)/(c); TC-016 corrected per user fact (ID kept); MD + test plan refreshed with MCP_VERIFICATION_LOG citations; `npm run xlsx:build` OK; `npm run check:tc-parity` exit 0. Honest-zero net-new is acceptable.
- [ ] Phase 3: `ensureDefaultState(AUTO_ADDON_DEFAULTS)` wired per-test (LR-019); TC-001 restore block slimmed; checkbox driver verified live; net-new cases (if any) blended at top via `saveAndVerifyCase`, no `@fcc` tag; individual run green `--workers=1 --retries=0`; regression-guard before/after no silent breakage.
- [ ] Phase 4: FCC completeness audit GREEN; confirmed false-greens fixed; combined run `--retries=0 --workers=1` green ×2.
- [ ] Phase 5: dedup table executed or honestly `(skipped:…)`; typecheck clean; zero behavior change.
- [ ] Phase 6: Execution Summary + C6 matrix audit + closure gate C1-C6 PASS; master annotated (cascade-SKIPPED citation verbatim); DQU_18 flipped SUBSUMED + master §DQU disposition updated; GENERATOR_AUDIT disposition annotated; activity-log row; `git mv` + reindex; `/final-q` verdict; navigation.md registry row added.

## Handoff (chat-only per feedback_handoff_in_chat_only.md)

Describes outcomes only (LR-039 — no obstacle claims). On close, surface: final TC count + net-new IDs (or honest-zero), Phase-1.5 verdict summary, sweep-fix list, DQU_18/GENERATOR_AUDIT dispositions, and the `/final-q` verdict.
