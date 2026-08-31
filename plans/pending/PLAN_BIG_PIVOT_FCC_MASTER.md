# PLAN: Big Pivot — Master Field-Case Coverage (FCC) Paradigm — All-Modules Strategic Tracker

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-05-19
**Updated**: 2026-05-29 (v4 — §Doctrine item 3 amended to blend-at-top/no-`@fcc`-tag; added item 8 outcome-based de-dup + coverage ledger) | 2026-05-21 PM (v3 — absorbed False-Green Sweep doctrine; nested-orbit v2 nomenclature; verified counts)
**Identity**: OWNER
**Depends on**: none
**Blocks**: per-module FCC subplans (named in §Roadmap below)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: plan
**BrowserTool**: none
**Skills**: /execute (children only), /audit, /final-q
**Author**: Rutvik (via Claude Opus 4.7)
**Justification**: master/tracker plan whose body is strategic doctrine + module roadmap; the executable work is delegated to children subplans (Notes is next — see §Roadmap). This file itself is `plan` PermissionMode because its only "work" is reading + emitting other plan filenames; the children carry their own `auto` mode.

---

## 🚦 Status 2026-05-21 PM — SSL pilot DONE; Notes child is queue position #1

**SSL pilot completed** — all 5 SSL pilot subplans are in `plans/done/` (closure manifests in `plans/_closure_manifests/`). SSL FCC coverage shipped by user as part of the DQU pilot chain; the existing 30 SSL TCs are grandfathered (see §SSL grandfather below).

**PLAN_DQU_V6.md is DONE** (in `plans/done/`). 27 `SUBPLAN_DQU_*.md` files remain in `plans/pending/` orphaned by their parent's closure — pending OWNER triage (subsume into FCC rollout / keep as standalone / drop). See §DQU disposition.

**Notes pilot is queue position #1** — first executable child of this master:

- [SUBPLAN_NOTES_FCC_PILOT.md](SUBPLAN_NOTES_FCC_PILOT.md) — paradigm install (one-time, framework-wide) + Notes pilot.

When Notes closes GREEN, the paradigm is installed for every subsequent module. Master remains open until every module in §Roadmap has its own FCC subplan closed.

**Framework bugs co-doctrine** — `~/.claude/plans/c-users-rutvi-claude-plans-glittery-tumb-nested-orbit.md` (v2, 2026-05-21 PM, post-3-pass-audit) is the sibling doctrine for fixture-lifecycle + project-matrix + spec-hygiene fixes. Phase 0 empirical verification gate is MANDATORY before any per-test code touches lands. The False-Green Sweep doctrine in §False-Green Sweep below is co-doctrine, NOT a co-parent (see M-FCC-2 note in §Cascade closure rules).

**2026-05-22 PM — SSL grandfather revoked via user override** — Rutvik authorized (3-question steering chat 2026-05-22): (a) retroactive false-green sweep against the 30 existing SSL TCs is authorized despite the prior grandfather exemption; (b) SSL false-green sweep precedes `SUBPLAN_LOCAL_INFORMATION_FCC.md` (sweep is retroactive WATCHDOG/HEALER work; Notes pilot remains queue position #1); (c) the override is recorded durably here + in §SSL grandfather revocation block below. Execution closed GREEN 2026-05-22 via [`SUBPLAN_SSL_FALSE_GREEN_SWEEP.md`](SUBPLAN_SSL_FALSE_GREEN_SWEEP.md) (sweep report: `clients/encore/specs_planning/_internal/false-green-sweeps/shared-setup-locations-2026-05-22.md`; Phase 0 verification: `clients/encore/specs_planning/_internal/phase-0-verification-shared-setup-locations-2026-05-22.md`). Three master-plan strict lines were overridden by this authorization — full audit trail in the subplan's `### Strict-line override audit trail (LR-046)` block.

**2026-05-28 — closure-discipline meta-child DONE**: [PLAN_DONE_MEANS_DONE.md](plans/done/PLAN_DONE_MEANS_DONE.md) — **DONE 2026-05-28**. Spawned from the WATCHDOG audit of `SUBPLAN_LEGAL_FCC.md` (8 ghost-deliverable findings); added closure-check C6 (Per-Identity Satisfaction Matrix delivery, LR-048 v3) + a C4 parent-cascade sub-check in **announce-only** rollout, retroactively cleansed the SUBPLAN_LEGAL_FCC matrix, and appended ARCH-015. It declares this master as `**Parent**:`, so this is the LR-027 parent-cascade annotation (pending-parent). It does NOT auto-close this master — the §Cascade closure rules exemption stands; the 3 master acceptance gates are unaffected.

---

## Context

The user is pivoting framework testing posture from **form-level saves** (fill many fields, click Save once) to **field-level cases** (every field change is independently saved, refreshed, and verified). Goal: per-case failure isolation — one case failing must not block the next. Mandate phrase: "seriously polished" coverage — no case left uncovered for the pilot module.

Cross-references:
- External QA framework guide digested 2026-05-19 ("Architecting Autonomous Quality Assurance: A Comprehensive Framework for Web Field Validation, Test Generation, and Coverage Maximization"). The paradigm doctrine in §Doctrine below is its actionable distillation.
- Existing in-repo coverage: ~90% of the guide is already encoded as bug-archetypes (ARCH-002/005/009/010/013/014) + LR rules (LR-009/010/022/026/051/052/053). The ~10% gap is **per-field-type coverage-generation templates** — captured in the new `field-case-generation.md` taxonomy doc (installed by the Notes subplan, Phase 1).

This is a "restructure plan" per LR-050 (changes the testing paradigm framework-wide). Stale-slop cleanup is enumerated below in §Stale-slop and the bulk is executed by the Notes subplan; the master tracks the remaining strategic items.

---

## Doctrine (the FCC paradigm — applies to every module)

1. **Per-case independence**. Each FCC test = one independent `test()` block. Own baseline, own cleanup, no `dependencyGate(['TC-...'])` chain inside the FCC describe block.
2. **Lifecycle**. Every FCC test runs the same shape: `baseline → act → expectBeforeSave? → save → expectAfterSave? → reload → expectAfterReload → cleanup`. Orchestrated by the single runner `clients/encore/src/utils/field-case-runner.ts` `saveAndVerifyCase()`.
3. **Block placement (amended 2026-05-29 — blend-at-top, supersedes the separate-`@fcc`-describe shape)**. Net-new FCC tests blend into the module's **EXISTING** `test.describe(...)` block at the **TOP** (immediately after `beforeEach`, above the first existing TC), using the **same naming** (sequential `TC-<MOD>-NN` past the high-water mark) and **same tags** — **NO separate `@fcc` describe and NO `@fcc` tag** in spec text. Existing TC bodies stay **UNTOUCHED**; only the shared `beforeEach` may be hardened (per-test baseline, LR-019). The "FCC" name lives only in the subplan filename + field-case-catalog prose, never in spec text. "Don't ruin already hard work" constraint. (Rutvik 2026-05-29: "blend in while at top, keep naming/etc same" — SSL_FCC precedent; do not re-ask on future FCC subplans.)
4. **Taxonomy-driven**. Every module's FCC catalog is derived from `clients/encore/specs_planning/_internal/field-case-generation.md` §2 per-field-type templates. New field types → append a row to the taxonomy doc + grow the catalog.
5. **3-tier save verification** (per taxonomy §1):
   - Tier 1 (mandatory): UI reload + DOM read of persisted value (always done today).
   - Tier 2 (recommended, partial): network 2xx + response payload structure check (today's `clickSaveWithDialog` catches errors but doesn't structurally validate payload — FCC follow-up).
   - Tier 3 (future): direct DB query — out of current framework scope; aspirational.
6. **Save-first navigation — prefer test-and-save over test-and-dirty**. When a test's next step is anything other than the dirty-state dialog itself, **save the field first, then navigate**. Operational corollary of item #2 Lifecycle. Never leave the form dirty across a navigation boundary unless the dirty-state dialog IS the unit under test.

   *Case study (SSL `TC-028`, [`plans/done/SUBPLAN_DQU_V6_PILOT_SSL_C.md`](plans/done/SUBPLAN_DQU_V6_PILOT_SSL_C.md))*: TC-028 edits a field → leaves form dirty → switches tab → asserts no Unsaved-Changes dialog. Three structural problems surfaced by the post-SP-C audit (2026-05-20):
   - **PO-helper trap** — any defensive `clickTopLevelTab` auto-dismiss (LR-026 reflex) silently masks the very regression TC-028 exists to catch.
   - **Cleanup gymnastics** — a dirty form forces explicit `discardAndReturn` on cleanup, multiplying race-condition surface.
   - **Intent ambiguity** — "no dialog" is not the load-bearing assertion; what matters is "field persisted + next step valid."

   *Anti-pattern* (forbidden in any future module-level FCC subplan): `edit → don't save → navigate → assert-no-dialog`. Dialog presence/absence is its own isolated test class — at most ONE dedicated TC per module if at all, never a sidecar in field-coverage tests.

7. **Anti-patterns** (binding):
   - LR-051: no `.toBe(true)` on OR-expressions in FCC asserts.
   - LR-052: no fixed `waitForTimeout` inside polling loops.
   - LR-053: no strict row-count assertions where placeholder bugs are documented (e.g. BUG-LOC-NTS-003).
   - LR-022: no hardcoded structural counts as assertions.

8. **De-dup by proven outcome, not literal action (added 2026-05-29)**. Before authoring net-new FCC cases, build a **coverage ledger**: for each existing test, list every `(field, assertion)` it proves — **including each field's persistence inside multi-field saves**. A taxonomy cell is already covered if its end-assertion appears in the ledger (a 2-field save that asserts field X persisted DISCHARGES the "field X save-persist" cell; a single-field-X save-persist test would re-prove the same end-assertion = duplicate). Author a net-new case ONLY if it proves an assertion no existing test proves. Trades strict single-field failure-isolation (PLN-018) for no-duplication. (Rutvik 2026-05-29.)

---

## Anti-Assumption Gates (binding for every FCC subplan — added 2026-06-18)

Graduated from the Pricing FCC session (2026-06-18), where assumptions were recorded as facts: "office 1604 corrupt" was claimed from one office with no baseline; a dropdown was declared "un-drivable" when the real cause was a stuck overlay + a stale page-object selector never diffed against live DOM; the mandatory Phase 0.5b baseline walk was skipped silently; a bug was filed with an invalid `baselineComparison`; and env instability was used to defer env-independent work while leaving the plan PENDING (a "silent checkpoint"). RCA: `clients/encore/specs_planning/_internal/agent-mistakes.md` (2026-06-18 ALL-* entries).

Every per-module FCC subplan (and its `/execute`) is bound by these 6 gates. They are enforced by LR-061 + LR-060 (`.claude/rules/`), the execution-completion Stop-hook + bug-baseline PreToolUse validator (`.claude/hooks/`), per-agent HARD STOPs, and the per-module closure gate below.

1. **Baseline-first is a HARD GATE, not authoring decoration.** Phase 0.5b MUST *execute* and emit `old-site-baseline/<module>-<DATE>.md` BEFORE any behavior classification, "atypical/corrupt" claim, TC correction, or bug filing. A baseline *read* is browser observation, not a suite run — env instability never excuses skipping it. (LR-045, LR-ENC-001, LR-048 §5)
2. **N≥2 evidence before any generalization.** Any claim of "data corrupt / office atypical / app-wide / regression" requires ≥2 independent sources (2 offices, OR new-site + baseline). One office is a single data point, never a conclusion. (LR-061)
3. **Verify-before-blocked.** Before declaring any control un-drivable / not-automatable / blocked: (a) clear overlays + reload, (b) diff the page object's existing selectors against the live DOM (stale-selector check), (c) inspect actual DOM structure, (d) try the documented interaction method. Only then may a control be classed un-drivable, with the evidence recorded. (LR-061, LR-021, LR-032)
4. **No env-rationalized deferral of env-independent work.** Env instability may defer ONLY the specifically env-blocked step (e.g. the ×2 full-suite run). Baseline walk / catalog / MD-XLSX / spec edits / `/review` are env-independent and may NOT be deferred citing env. (LR-060)
5. **Atomic un-skip + harden.** Never un-skip a test without applying its per-test baseline (LR-019) hardening in the SAME change — an un-skipped-but-unhardened test is more fragile than a skipped one. (LR-021 corollary)
6. **No silent checkpoint.** An FCC `/execute` either completes all phases OR records an explicit user-signed `## Deferral Authorization` block in the subplan. Leaving the plan PENDING with mandated phases unexecuted and no recorded authorization is an audit finding — the closure gates key on the `Status: DONE` flip, so this is the one path they cannot catch; the execution-completion Stop-hook flags it. (LR-060)
7. **Machine-enumerated walk denominator (LR-062).** No field-inventory / baseline walk for an FCC module is "done" until scripts/walk-coverage/enumerate-page.mjs has produced the denominator, every union element is dispositioned, CrossCheck: clean, and Coverage_Ratio 100%. Self-labeled PARTIAL is not a stopping point. Closure check Cx enforces this at Status flip.

---

## Per-test baseline (LR-019) — pending fixes (added 2026-07-01)

**Status update 2026-07-01:** three of the original five are now fixed in place and ENFORCED by the gate — the non-FCC describes of `location-notes` + `location-shared-setup-locations` got their `ensureEmptyState()` / `ensureCleanSSLTable()` reset wired into `beforeEach`, and `location-account-address` got an `ensureDefaultState({ phone2 })` reset on a dedicated non-empty Phone 2 baseline (which side-steps the open empty-Phone-2 persistence bug, BUG-LOC-ACC-001 — that bug now blocks only TC-LOC-ACC-029, not the baseline). **Three remain deferred** to their FCC subplans: `location-local-information`, `local-office-settings`, `local-office-ect` (table below, trimmed to those three). The Shared Setup helper still gets a robustness harden (bounded-retry + post-reload re-verify) tracked separately; the `beforeEach` wiring itself is done.

A 2026-06-30 audit found the per-test-baseline mandate (LR-019) had rotted on five save-capable specs whose submodules have not yet had their FCC upgrade: each carries its baseline only in the FIRST test's body, which a single-test retry / parallel run skips (the later test then starts dirty and its "Save enables / persists after reload" assertion fails net-zero against correct app behavior). Per Rutvik's steer, these are **not** patched one-off — each fix is bundled into that submodule's FCC subplan, done properly alongside the FCC work.

**Standing instruction (binding on every FCC subplan for a submodule below):** wire a per-test baseline into the describe's `test.beforeEach` (after the nav guard) — or use the FCC runner `saveAndVerifyCase({ baseline })` — in the SAME change, then **remove that spec's waiver** from `scripts/check-per-test-baseline.mjs` (the gate flips it from WAIVED to ENFORCED once the real mechanism is present). The verified office-1604 defaults are listed below so the subplan author does not re-derive them.

| Submodule / spec | Gap | Owed fix in its FCC subplan | Verified office-1604 defaults |
|---|---|---|---|
| Local Information — `location-local-information.spec.ts` | baseline inline in TC-001 body; `beforeEach` nav-guard-only | author `ensureDefaultState` via `BasePage.saveAndVerifyPersisted`; wire `beforeEach`; drop TC-001 inline | checkbox `CHECKED_DEFAULTS`/`UNCHECKED_DEFAULTS`; LDW% = 4.00 (set decimal `'0.04'`); cascade spins (Threshold/ETS/CC/ResortTax) = 0; Oracle Product `'0000'`, Oracle Dept `'900'`; Billing Type `Master` — all in `src/data/locations/location-local-info.ts`, asserted by TC-002 |
| Local Office Settings — `local-office-settings.spec.ts` | comprehensive baseline inline in BAS-001 body | author `ensureDefaultState` (no helper exists); wire `beforeEach` | `DATE_OFFSET_DEFAULTS` (Prep -1, Return 1, Set -1, Strike 1, Delivery 0, Pickup 0); `CHECKBOX_DEFAULTS` (all false); `DEFAULT_PHONE_1` = 760-883-1957; Default Order Type `Event`; PO fields empty — all in `src/data/local-office/local-office-settings.ts` |
| ECT Settings — `local-office-ect.spec.ts` | partial baseline (Benefits Multiplier only) inline in ECT-001 body | author `ensureDefaultState`; wire `beforeEach` | Benefits Multiplier = 0.2; Historical Subrental = 0 (both in `src/data/local-office/local-office-ect.ts`). **Labor Cost carve-out — see below** |

**Carve-out 1 — ECT Labor Cost has no canonical default.** The Labor Cost rows are read-current in the existing tests (no constant). The ECT FCC subplan must either (a) capture office-1604's Labor Cost default via a live read and add a constant before baseline-resetting it, or (b) scope the ECT baseline to Benefits Multiplier + Historical Subrental and leave Labor Cost on its read-current pattern (documented). Do not guess a value.

**Carve-out 2 — account-address RESOLVED 2026-07-01 (was a documented exception).** `location-account-address.spec.ts` now resets per-test via `ensureDefaultState({ phone2: PHONE2_BASELINE })` in `beforeEach`, where `PHONE2_BASELINE` is a dedicated NON-EMPTY value. The earlier blocker was that clearing the optional Phone 2 field and saving does not persist the empty value (`BUG-LOC-ACC-001`); a non-empty baseline never clears Phone 2, so it does not fight that bug. Rutvik confirmed the bug by manual walk on 2026-07-01 (authoritative per LR-ENC-001) and it remains open, blocking only TC-LOC-ACC-029 (which asserts an empty Phone 2 persists — kept `test.fixme`). A Jira check on 2026-07-01 (encore.atlassian.net project NM) found the persistence behavior **not filed and not fixed** — related tickets ([NM-852](https://encore.atlassian.net/browse/NM-852) Phone 2 required→optional, [NM-994](https://encore.atlassian.net/browse/NM-994) remove Phone validation) are Done but address a different aspect. Intended empty-field persistence semantics are still to be escalated via `/encore-questions`.

**Tracking + enforcement.** The three still-deferred specs above are registered WAIVED in `scripts/check-per-test-baseline.mjs` (pre-commit Gate 5e / `npm run check:per-test-baseline`), with a reason pointing here. The waiver is a tracked promise, not a fix — the gap stays real until the FCC subplan lands the baseline and removes the waiver. The three fixed 2026-07-01 (`location-notes`, `location-shared-setup-locations`, `location-account-address`) are now registered ENFORCED, so a future edit that strips their `beforeEach` reset fails the gate. The redundant in-body reset calls in those now-ENFORCED specs were intentionally kept — for Shared Setup they keep the table clean so the per-test `beforeEach` reset stays a no-op; any future de-duplication rides each submodule's FCC pass. New unguarded save-specs fail the gate outright (GENERATOR HARD STOP #16 / HEALER HARD STOP #11). The COMPLIANT save specs already satisfy LR-019 via `ensureDefaultState`-in-`beforeEach` (legal, pricing, auto-addon, currency, left-panel) or the FCC runner (all corporate-pricing) and need no FCC-subplan baseline work.

---

## Roadmap (children subplans)

### Pilot (next executable)
- [SUBPLAN_NOTES_FCC_PILOT.md](SUBPLAN_NOTES_FCC_PILOT.md) — **P0-EMERGENCY**, queue position #1 (post SSL-pilot-done re-sort). Paradigm install (Phase 1, one-time) + Notes pilot (Phases 2–7). **26 net-new FCC tests implemented + 1 DEFERRED (FCC-005)**: 32 authored − 5 duplicates of existing TCs (FCC-003/004/011/030/031) − 1 deferred = 26 in spec. Verified by grep of `location-notes.spec.ts` FCC IDs (001/002/006-010/012-022/023-029/032).

### False-green sweep complete (per user override 2026-05-22 — supersedes "Already shipped (no further subplan needed)" heading)
- **SSL (Shared Setup Locations)** — shipped via DQU pilot chain `SUBPLAN_DQU_V6_PILOT_SSL_A/B/C/D/E.md` (all in `plans/done/`, closed 2026-05-18 through 2026-05-20). **30 existing TCs preserved** (TC-001 through TC-030 verified via spec grep). **Retroactive 11-sweep false-green audit completed 2026-05-22 via [`SUBPLAN_SSL_FALSE_GREEN_SWEEP.md`](SUBPLAN_SSL_FALSE_GREEN_SWEEP.md)** — GREEN verdict (zero unfixed FALSE-GREEN findings; 3 Sweep 7 STALE-SKIP entries handled per LR-021 corollary; master line 143 bare-`page` strict zero gate met). Sweep report: `clients/encore/specs_planning/_internal/false-green-sweeps/shared-setup-locations-2026-05-22.md`. See §SSL grandfather below for the durable revocation record.

### Future per-module subplans (named for parent-cascade closure, not yet authored)

Authored AFTER Notes subplan closes GREEN. One subplan per module, each ~200–400 lines using the paradigm. Files will be created with this exact naming (so parent-cascade per LR-027 finds them):

- `SUBPLAN_LOCAL_INFORMATION_FCC.md` — **NEXT after Notes** (sequencing note: SSL false-green sweep precedes LOCAL_INFORMATION_FCC per user override 2026-05-22; see [`SUBPLAN_SSL_FALSE_GREEN_SWEEP.md`](SUBPLAN_SSL_FALSE_GREEN_SWEEP.md). The override does NOT promote LOCAL_INFORMATION_FCC ahead of Notes — Notes pilot remains queue position #1; SSL sweep was authored as a retroactive WATCHDOG/HEALER half against the already-shipped SSL pilot.)
- [SUBPLAN_CURRENCY_FCC.md](plans/done/SUBPLAN_CURRENCY_FCC.md) — **DONE 2026-06-17**, blend of the existing 27-TC Currency spec: LR-019 hardened `ensureDefaultState` wired into `beforeEach` (the load-bearing fix — STATE-LEAK from the TC-001-inline-only baseline + annotation-only `dependencyGate` closed), 1 net-new (TC-LOC-CUR-028: revert-to-saved re-disables Save — the LR-009/026 smart-diff gap; sibling Auto-Add-On had it, Currency lacked it), USD-merchant save-cycle already covered (TC-022, not minted — STRICT-LINE-B), CAD/MXN merchant deferred (c) data-thin (1/0 options on 1604), false-green sweep GREEN (0 unfixed), full-identity sweep (7 dated artifacts, zero `(skipped)`), full spec green ×2 (29 passed; 1 TC-022 reload-flake classified). LR-055 C1–C6 PASS.
- [SUBPLAN_PRICING_FCC.md](plans/done/SUBPLAN_PRICING_FCC.md) — **DONE 2026-06-19**, resumed from the 2026-06-18 partial pass. Blend of the existing Pricing spec (the one Location-Settings tab "never automated due to API failures"): the save API is confirmed healthy — 6 of 7 documented skips re-enabled green (TC-020 dates + TC-026..030 dropdown persistence), TC-025 stays skipped against the one real app defect (Corporate Pricing uncheck saves HTTP 200 but reverts on reload, app-wide 1604+1605, `BUG-LOC-PRI-001`). LR-019 `ensureDefaultState` + `saveAndConfirm` wired into the `beforeEach` (superseding the ad-hoc self-heal); `waitForPricingDataLoaded` LR-052-converted to `waitForFunction`. **3 net-new multi-currency TCs on office 1605** (TC-036 all-15-dropdowns render; TC-037/038 MXN Labor/Equipment select+persist) — live walk proved only 2 of 10 CAD/MXN dropdowns carry selectable strategies, so render-coverage is the honest ceiling for the other 8 (empty option lists). Data-drift fix: 2 dead grid rows remapped to live-verified rows (had been silently false-passing 2 tests). Fresh-context `/audit` GREEN; full spec green ×2 (37 passed / 1 skipped). DQU_12 SUBSUMED here; coverage-audit Parts 1-4 addressed, Part 5 left as a user-decision discussion-item. `LR-027 cascade SKIPPED per master plan §Cascade closure rules (user override 2026-05-21)`.
- [SUBPLAN_ACCOUNT_ADDRESS_FCC.md](plans/done/SUBPLAN_ACCOUNT_ADDRESS_FCC.md) — **DONE 2026-05-29**, 2 net-new filter TCs (TC-LOC-ACC-030 Account# filter, -031 address-search clear-restores) implemented + passing; TC-LOC-ACC-029 (Phone 2 clear-persist) deferred-with-bug as `test.fixme` citing BUG-LOC-ACC-001 (app does not persist an empty Phone 2). Full spec 29 passed / 1 skipped.
- [SUBPLAN_LEGAL_FCC.md](plans/done/SUBPLAN_LEGAL_FCC.md) — **DONE 2026-05-27**, 1 net-new FCC test (TC-LOC-LGL-019 negative listbox enumeration + save-cycle); 12 cases LR-040(b) deferred (same mechanic, different data, already covered by existing 15 TCs); 3 cases LR-040(c) not applicable (2 APP BUGs sort-order, 1 missing left-panel selector).
- [SUBPLAN_AUTO_ADDON_FCC.md](plans/done/SUBPLAN_AUTO_ADDON_FCC.md) — **DONE 2026-06-11**, blend of the existing 19-TC Auto Add-On spec: LR-019 per-test `ensureDefaultState` wired into `beforeEach` (the load-bearing fix; STATE-LEAK closed), LR-052 fixed-sleep poll replaced, TC-016 corrected to country-scoped (premise was wrong), false-green sweep GREEN (0 unfixed), Phase-1.5 re-verified all 7 generator-audit findings (already-fixed/stale/mitigated), **honest-zero net-new** (full field×case coverage proven by existing 20 TCs incl. TC-020 bulk-invert), full spec green ×3. DQU_18 SUBSUMED here.
- `SUBPLAN_LOCAL_OFFICE_BASIC_INFO_FCC.md`
- `SUBPLAN_ECT_SETTINGS_FCC.md`
- `SUBPLAN_HIST_PER_COLUMN_FCC.md` (covers Location Management History spec restructure if needed)
- [SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC.md](plans/done/SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC.md) — **DONE 2026-06-03**, 26 of 27 TCs automated (TC-LOC-LP-001..023 with 016 corrected to read-only + 3 net-new persistence 025/026/027; TC-024 deferred), full spec 27 passed ×2. Renamed from `SUBPLAN_LEFT_PANEL_FCC` (module `left_panel` → `left_panel_basic_information`). **W2-08 RESOLVED**: the Country dropdown DOES exist (4 opts, live-verified) → cascade automated; **LGL-015 NOT subsumed** by TC-LOC-LP-018..022 — those tests exercise the Country selector but only assert left-panel Tax Mode/Region + cross-tab Job Costing/Remit-PST, never opening the Legal tab; the Legal-tab Service Charge + Terms reset (LGL-015) is an open coverage gap, now automatable (post-audit correction 2026-06-03). Routed from `PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` SP07; revived per user 2026-06-01.
- [SUBPLAN_LAUNCHER_DIALOG_GAPS_FCC.md](plans/done/SUBPLAN_LAUNCHER_DIALOG_GAPS_FCC.md) — **DONE 2026-06-11**, two launcher-dialog coverage gaps closed together (user escalation 2026-06-11): **A** Pay To Address launcher / "Pay To List" dialog (total miss in the 2026-06-03 left-panel walk) — 10 net-new TC-LOC-LP-028..037, ID-anchored save-restore, selection PERSISTS; **B** Master Bill To per-launcher gap on Account & Address (shared-dialog conflation) — 2 net-new TC-LOC-ACC-032/033, Master selection PERSISTS (diverges from Venue's non-persist, TC-ACC-027). 0 bugs (both launchers correct). Permanent prevention: **LR-057** affordance-probe mandate + per-launcher coverage clause + no-taxonomy-row HALT (inventory.md), field-inventory-spec + field-case-generation amendments, PLANNER #18 / REQUIREMENTS #9, master **Sweep 12 (`UNPROBED-AFFORDANCE`)**. Both DONE siblings carry a 2026-06-11 Post-Audit Correction. `LR-027 cascade SKIPPED per master plan §Cascade closure rules (user override 2026-05-21)`.

Each future subplan inherits the paradigm — no re-installing the runner, taxonomy, or agent prompt sections. Each does only: HUNTER baseline freshness → GIVER catalog + TCs → BUILDER spec FCC block + page-object helpers + data → WATCHDOG completeness audit → GARDENER sweep → OWNER closure. **Plus** the False-Green Sweep doctrine obligations below.

### Location Products (distinct surface — added 2026-06-22)

> **2026-08-31 — superseded-for-NM-2253**: the Products wave now ships via `plans/pending/PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md` (office **1101** per the NM-2253 ticket ruling; module code `ISR`, submodules `PRS`/`PCD`/`PGR`). `SUBPLAN_PRODUCTS_00_FOUNDATION.md` + `SUBPLAN_PRODUCTS_FCC.md` are **SUPERSEDED** (five staleness epochs: 1604 target, pre-two-axis, pre-LR-072, old LR-014, pre-LR-ENC-009). `SUBPLAN_PRODUCTS_DQU.md` is **RETAINED** as the deferred-to-DEEP recipient, Depends-on repointed.

Products is **not** a Location-Settings tab — it is a separate top-level URL
`/locations/{id}/products` (old-site nav2 equivalent: "item search"), so `navigateToSubTab()` does NOT
apply and Save-dialog / rendering parity must be walked, not assumed. This master now spans **multiple
surfaces**, not Location-Settings-only. Net-new (zero prior coverage), built in 3 priority-tiered subplans
so a partial execution ships the basic batch first (corp-pricing model):

- `SUBPLAN_PRODUCTS_00_FOUNDATION.md` — **P0**, Depends-on `PLAN_SELF_HELP_RESEARCH_MANDATE.md` +
  `PLAN_TIERED_DELEGATED_WALK.md`. Baseline (both sites) + Rovo Jira research → field-inventory via the TDW
  engine (LR-064; LR-062 100%) → register `PRD` code → net-new scaffolding (page object direct-nav,
  selectors, data, fixture). No tests.
- `SUBPLAN_PRODUCTS_FCC.md` — **P1 (SHIP-FIRST)**, Depends-on Foundation. phase-0-verification +
  field-case-catalog (Jira-enriched) + FCC TC catalog (MD + test-plan + XLSX) → BUILDER FCC describe
  (blend-at-top) → WATCHDOG false-green sweep + FCC-completeness audit (separate session) → GARDENER →
  OWNER closure. Should-have-but-missing-testid fields ship `test.fixme` (Task 0a / LR-014).
- `SUBPLAN_PRODUCTS_DQU.md` — **P2 (GATED stub)**, Depends-on FCC. Deep-quality: cross-field/cascade,
  grid/cell-edit, compound, neutral-eye, a11y/RBAC/real file-I/O. Full design post-FCC.

Two framework preconditions land FIRST and auto-apply to every future module:
`PLAN_SELF_HELP_RESEARCH_MANDATE.md` (Rovo/Jira self-help before asking the user) and
`PLAN_TIERED_DELEGATED_WALK.md` (the default walk engine — Opus judges, Haiku/Sonnet click). Both block
`SUBPLAN_PRODUCTS_00_FOUNDATION.md`.

---

## False-Green Sweep Doctrine (absorbed from former co-parent, 2026-05-21 PM)

### Why this doctrine exists

During Notes pilot execution (2026-05-21), Rutvik observed in a headed run: login opens 3x, spec runs 2x, blank `about:blank` tabs alongside real test windows. A 3-pass audit (Council + reviewer + auditor) on the framework-bugs sibling plan (`nested-orbit` v2) verified ~7 distinct active framework bugs across config/fixtures/observability + identified a class of **false-green tests** in Notes + SSL that pass green in CI while testing nothing (`.catch(() => {})` swallowing wrong-page failures, `.toHaveCount(0)` vacuously passing on blank pages, `.isVisible()` returning false → wrong branch taken). The original "5 Opus agents / 14 bugs" framing was corrected to a single sequential audit session + honest count of 7 distinct bugs. See [nested-orbit v2](~/.claude/plans/c-users-rutvi-claude-plans-glittery-tumb-nested-orbit.md) for the framework fix workstream.

### Patterns that make false-green possible (reference table)

| Pattern | Why it passes on wrong page | Sweep |
|---------|---------------------------|-------|
| `.catch(() => {})` on action | "Element not found" swallowed silently | Sweep 1 |
| `,\s*page\s*[,}]` destructure alongside custom fixture | Built-in `page` lands on about:blank | Sweep 2 |
| `.toBeHidden()` / `.toHaveCount(0)` on missing element | Vacuously true on wrong page | Sweep 3 |
| `.isVisible()` / `.isEnabled()` in `if`/ternary | Returns false → wrong branch | Sweep 4 |
| `force: true` + `.catch()` | Bypasses actionability AND catches failure | Sweep 5 |
| All-negative-assertion tests | No positive proof of behavior | Sweep 6 |
| Stale `test.skip` / `test.fixme` | Framework bug may have been fixed | Sweep 7 |
| `page.on()` event listener on built-in `page` | Monitors blank page → empty arrays | Sweep 8 |
| `page.waitForTimeout` as sole sync | Fixed sleep masks real timing | Sweep 9 |
| Assertions after `page.*` setup checking via `<pageObject>.*` | Setup on wrong page → assertion reads UNCHANGED real state | Sweep 10 |
| `expect.poll()` with timeouts > 10s | Long timeout masks underlying flake | Sweep 11 |
| Passing assertion on a field whose label/launcher affordance — or whose per-launcher select-cycle — was never exercised | A disabled-display / read-only field hides an interactive launcher, or a shared dialog behaves differently per launcher; the assertion is true but blind | Sweep 12 (`UNPROBED-AFFORDANCE`; LR-057) |
| A finding / behavior-classification (corrupt / atypical / app-wide / regression) resting on ONE office or with NO baseline comparison | A single-office observation or unbaselined state is asserted as a general truth; it may be office data state, not app behavior | Sweep 13 (`ASSUMPTION-UNISOLATED`; LR-061, added 2026-06-18) |

### Per-module FCC subplan obligations (binding for SSL-onward, except SSL grandfather)

Every per-module FCC subplan in §Roadmap MUST:

1. **Frontmatter** declares a single `**Parent**: PLAN_BIG_PIVOT_FCC_MASTER.md` (per LR-048 schema — singular key). Reference false-green doctrine in prose as `co-doctrine: §False-Green Sweep Doctrine (this file)`, NOT as a second parent.

2. **Phase 0 — empirical verification gate**: before any spec/page-object change, run nested-orbit v2 Phase 0 checks (page-collision theory + context-options propagation + trace fidelity + per-TC baseline) and write the verification artifact at `clients/encore/specs_planning/_internal/phase-0-verification-<MODULE>-<YYYY-MM-DD>.md`. PROCEED verdict required before continuing.

3. **Phase 0.5 — false-green pre-audit**: run all 13 sweeps (table above) against the target module's existing spec(s). Emit a dated report at `clients/encore/specs_planning/_internal/false-green-sweeps/<MODULE>-<YYYY-MM-DD>.md` (note: subdirectory `false-green-sweeps/` — repo convention). Classify each finding as: FALSE-GREEN / PARTIAL / FLAKY-MASK / STALE-SKIP / INFLATED / STATE-LEAK / UNPROBED-AFFORDANCE / ASSUMPTION-UNISOLATED / CLEAN.

4. **Phase N-1 — false-green fix**: before closure, fix every confirmed false-green finding from Phase 0.5 using the **nested-orbit v2 §A-1 fix decision** (rewrite test to drop bare `page` from destructure; use `<pageObject>.page`). NOT a getter or override — those alternatives were explicitly rejected in v2 (conflicts with R14 exception comment + doesn't fix context-options gap).

5. **Phase N — combined verification**: final run with `--retries=0 --workers=1` exercises BOTH the new FCC catalog AND the formerly-false-green tests. All pass.

### Closure gate (per-module FCC subplan)

Cannot close GREEN if any of:
- Phase 0 verification artifact missing OR verdict ≠ PROCEED.
- Any false-green finding from Phase 0.5 unfixed AND not classified per LR-040 (a)/(b)/(c).
- Any stale skip/fixme from Sweep 7 not un-skipped and verified (LR-021) — except app-bug-blocked skips (re-skip with updated comment per LR-021 corollary).
- Any test in the module destructures the built-in `page` alongside a custom fixture.
- **Phase 0.5b baseline artifact missing** when the subplan drives TC corrections or files bugs (Anti-Assumption Gate 1).
- Any **"corrupt / atypical / app-wide / regression" claim resting on <2 evidence sources** (Sweep 13 / Gate 2 unmet).
- Any bug filed with `baselineComparison` outside the LR-034 enum, or any test **un-skipped without LR-019 hardening** (Gates 5–6).

### Two-subplan variant (if combined exceeds ~400 lines)

Split into `SUBPLAN_<MODULE>_REMEDIATION.md` (WATCHDOG/HEALER — false-green audit + fix, closes first) + `SUBPLAN_<MODULE>_FCC.md` (HUNTER/GIVER/BUILDER — FCC catalog + implementation, consumes cleaned baseline). Both list each other in `**Depends on**:`; REMEDIATION closes first; both must close before module is shipped.

### SSL grandfather

SSL pilot (5 SP-A/B/C/D/E subplans) closed **2026-05-18 through 2026-05-20**, which **predates this doctrine** (added 2026-05-21 PM). Pilot did not run the 11-sweep Phase 0.5 pre-audit and is **explicitly exempted** from retroactive sweep here.

**Known false-green**: SSL-029 at `location-shared-setup-locations.spec.ts:484` is fixed by nested-orbit v2 §A-1 (it's in the 6-test rewrite set; same file as Notes false-greens). No separate SSL sweep subplan required.

If future regression on SSL surfaces additional false-green tests, address via a targeted one-off subplan, NOT a retroactive Phase 0.5 sweep against the closed pilot.

**REVOKED 2026-05-22 by user override.** Retroactive 11-sweep audit + fix authorized + executed via [`SUBPLAN_SSL_FALSE_GREEN_SWEEP.md`](SUBPLAN_SSL_FALSE_GREEN_SWEEP.md). Prior grandfather text preserved above for historical record. The retroactive sweep produced a GREEN verdict (zero unfixed FALSE-GREEN findings; 3 Sweep 7 STALE-SKIP entries handled per LR-021 corollary) — sweep report at `clients/encore/specs_planning/_internal/false-green-sweeps/shared-setup-locations-2026-05-22.md`.

### Known skip inventory (baseline 2026-05-21 — VERIFIED via spec grep)

10 lexical skip/fixme sites across 4 files (runtime count higher where loops apply):
- `location-shared-setup-locations.spec.ts:76, 420, 510` — 3 app-bug fixmes (Shares Inventory dirty-state, Miami exclusion, Delete non-clickable).
- `local-office-settings.spec.ts:773` — TC-LOS-BAS-048 (Room toggle round-trip).
- `location-management-history.spec.ts:85, 93, 211` — 3 skips (2900+ rows, zero-history requirement, pagination).
- `location-pricing.spec.ts:386, 477, 520` — 3 skips. **Note**: line 520 is inside a `for (... of DROPDOWN_PERSISTENCE_CASES)` loop — runtime count is loop-length, not 1. Total runtime skipped = 8 + loop-length.

App-bug skips MUST NOT be force-un-skipped (LR-021 corollary): verify the app bug is still present via live DOM check; if still present, re-skip with updated comment citing verification date.

---

## SUPERSEDED / archived (no longer separate plans)

- **False-Green Spec Sweep** (formerly `~/.claude/plans/c-users-rutvi-claude-plans-glittery-tumb-false-green-sweep.md`) — absorbed into §False-Green Sweep Doctrine above. Stub remains at the original path pointing here. Reasons for absorption (per 3-pass audit verdict): (a) home-dir path broke LR-027 parent-cascade structurally; (b) `**Parents**:` plural key not in LR-048 schema; (c) ~50% content duplication with nested-orbit v2; (d) internal staleness vs nested-orbit v2 nomenclature.

---

## DQU disposition (parent done, 27 children orphaned)

`PLAN_DQU_V6.md` is in `plans/done/`. The 27 `SUBPLAN_DQU_*.md` files remaining in `plans/pending/` are orphaned by their parent's closure — they were originally scoped as DQU work that overlaps with the FCC paradigm rollout.

**Current disposition**: chat-only deferral. No `/execute` of DQU subplans until master triages. Future agents MUST consult this master before `/execute SUBPLAN_DQU_*`. OWNER triages each remaining DQU subplan after Notes pilot closes: **subsume into FCC rollout / keep as standalone / drop**. Triage decision recorded in this master's eventual Execution Summary (per LR-027).

**Triage log**:
- `SUBPLAN_DQU_12_F1a_PRICING_AUDIT.md` → **SUBSUMED** into `SUBPLAN_PRICING_FCC.md` (user triage 2026-06-15; closed 2026-06-19). Its still-live focus areas — IsAlternate→UseDate→Start/End cascade, Corporate-grid validation, Corporate-Pricing-toggle-disables-fields, cell-edit restrictions, Price-Guide-inclusion default, EnableMultidayPricing tab-placement — were absorbed into the Pricing FCC pass and verified live (precedent: DQU_18 → Auto Add-On). DQU_12 flipped to SUBSUMED.
- `SUBPLAN_DQU_18_F1g_AUTO_ADDON_AUDIT.md` → **SUBSUMED** into `SUBPLAN_AUTO_ADDON_FCC.md` (user triage 2026-06-11). Its Phase 0.5b baseline walk, Phase 1 field inventory, and Phase 2 TC-MD diff + XLSX rebuild WERE the Auto Add-On FCC subplan's Phases 0.5b/1/2; its still-live focus areas (round-trip persistence per item, country-scoped rules NM-1462/64/65 as not-testable-on-1604, TC-016 disposition) were absorbed. Its multi-office focus (1605/1101) was dropped per user fact (item list is country-scoped, not per-location; 1604-only scope). DQU_18 flipped to SUBSUMED.

---

## Cascade closure rules (resolved ambiguity)

This master is a **long-running tracker**. Child subplans are authored lazily (each lands when its module's turn comes). At any closure point during the rollout, the grep for `**Parent**: PLAN_BIG_PIVOT_FCC_MASTER.md` may return zero pending siblings — this would normally trigger LR-027's parent-cascade clause and auto-close the master.

**LR-027 auto-cascade is EXEMPTED for this master** (user-authorized 2026-05-21). Master closes ONLY when **all three** acceptance gates fire:

1. Every module in §Roadmap "Future per-module subplans" has its subplan in `plans/done/` (excludes SSL — grandfathered).
2. SSL pilot is already shipped (✓ — completed 2026-05-20).
3. DQU triage decision recorded (per remaining DQU subplan: subsumed / kept / dropped).

**How child subplans cite this exemption**: every closing child subplan MUST include in its Phase 7.3 (Parent-cascade check) the line `LR-027 cascade SKIPPED per master plan §Cascade closure rules (user override 2026-05-21)` + emit an activity-log row recording the override. Failure to cite = audit finding under LR-027.

**No conflict with co-doctrine**: the False-Green Sweep doctrine in §False-Green Sweep is a **doctrine section in this file**, not a separate parent. There is no second parent to cascade with. When the three gates fire, this master closes; no other plan needs to close in lockstep (the framework-bugs sibling `nested-orbit` is independent — closes on its own Phase 0 + Groups A-F completion).

---

## Strategic sequencing (one-paragraph summary for context-loaded agents)

SSL already shipped via DQU pilot chain (grandfathered from false-green sweep). Notes ships next as the FCC paradigm pilot; then every other module gets its own FCC subplan (one per module, see §Roadmap) — each carrying the False-Green Sweep doctrine obligations (§Phase 0 + Phase 0.5 + Phase N-1 + Phase N). DQU resumes (or is dropped per triage) only after every module is FCC-covered. The runner, taxonomy doc, and agent prompt updates installed by the Notes subplan are framework-wide one-time work.

---

## Stale-slop cleanup (LR-050)

Cleanup enumerated and **assigned to the Notes subplan** (executed there, not re-listed in future module subplans):

1. **Field-inventory testid drift** (`notes-2026-05-11.md` claims 3 fields have no testid; selectors file shows they do) — assigned to Notes subplan Phase 3.
2. **CLAUDE.md @-refs missing the taxonomy doc row** — assigned to Notes subplan Phase 1.2.
3. **AGENT_SHARED_RULES.md §2 missing `field-case-catalogs/` ownership row** — assigned to Notes subplan Phase 1.3.
4. **6 agent prompts (REQUIREMENTS / PLANNER / GENERATOR / HEALER / AUDIT / MAINTAINER) lack FCC Paradigm section** — assigned to Notes subplan Phase 1.4 + sync 1.5.
5. **No `src/utils/field-case-runner.ts`** — assigned to Notes subplan Phase 4.1.
6. **No `field-case-catalogs/` directory** — created by Notes subplan Phase 3.1.
7. **No FCC TC namespace in any test-cases markdown** — Notes adds the first instance Phase 3.2; other modules follow per their own subplans.
8. **3-artifact testid drift universe for Notes** — `clients/encore/src/selectors/locations/notes.ts` JSDoc lines 10-13 claim "NO data-testid" for Add/Counter/Progress; selector definitions on lines 45/51/53 USE testids. Same staleness propagated into `clients/encore/specs_planning/_internal/field-inventories/notes-2026-05-11.md` rows AND `clients/encore/specs_planning/test-cases/setup/locations/locations_notes_test_cases.md` lines 69-76 (testid drift + line 76 dialog button label drift "Save" → "Ok"). Assigned to Notes subplan Phase 3.3 — fix all three artifacts together.
9. **Phantom `clients/encore/reports/bugs/` directory** — referenced by nested-orbit v2 (BUG-LOC-NTS-NNN filing path) and PLAN_RCA_NOTES_SPEC; directory does not exist on disk. First bug-filing session creates with `mkdir -p clients/encore/reports/bugs/`. Note added per M-FCC-1 audit finding 2026-05-21.

Out-of-scope (deferred to named follow-up plans, NOT this master's cascade):

- **BUG-LOC-NTS-002 dialog "Ok" vs "Save"** page-scoped selector helper — escalation filed by the Notes subplan in `agent-escalations.json` Phase 3.4. If escalation results in real spec failures, follow-up plan `PLAN_LOC_SETTINGS_OK_DIALOG_HELPER.md` will be authored separately.
- **Identity skill table stale path reference** (`.github/agents/playwright-*.agent.md` vs actual `.claude/agents/*.md`) — pre-existing drift unrelated to FCC.
- **`field-case-runner.ts` propagation to additional clients** via per-client `clients/<id>/src/core/` copy when 2nd client lands — taxonomy §4 promotion criterion.

---

## Acceptance criteria (master-level — closes when ALL true)

- [ ] Notes subplan closed GREEN with all **26 net-new FCC tests implemented** + **1 DEFERRED (FCC-005)** = **27 planned** in catalog. Existing **32 main-spec TCs** (28 explicit `test()` blocks + 4-test `SPECIAL_CONTENT_TESTS` for-loop at line 181) unchanged + **6 HIST-spec TCs** (TC-LOC-NTS-028..032, 038 — consolidated 2026-06-05 into `location-management-history.spec.ts` `@notes-hist` describe per PLAN_NOTES_HIST_CONSOLIDATION; formerly a separate `history/location-hist-notes.spec.ts`) unchanged. Total runtime in Notes spec post-Notes-pilot = 32 main + 26 FCC = 58 tests; HIST = 6 tests (now in the LM-History spec).
- [ ] SSL FCC coverage shipped (✓ — already done via DQU pilot chain, 30 SSL TCs grandfathered).
- [ ] SSL false-green sweep subplan closed GREEN (✓ — completed 2026-05-22 per user override; sweep report at `clients/encore/specs_planning/_internal/false-green-sweeps/shared-setup-locations-2026-05-22.md`; see [`SUBPLAN_SSL_FALSE_GREEN_SWEEP.md`](SUBPLAN_SSL_FALSE_GREEN_SWEEP.md) Execution Summary).
- [ ] Every module in §Roadmap "Future per-module subplans" has a subplan in `plans/done/`.
- [ ] Location Products (distinct surface): **superseded-for-NM-2253 (2026-08-31)** — QUICK coverage ships via `PLAN_NM2253_ITEM_SEARCH_COVERAGE_QUICK.md` (`SUBPLAN_PRODUCTS_00_FOUNDATION` + `_FCC` SUPERSEDED, never executed); remaining checkbox scope = `SUBPLAN_PRODUCTS_DQU.md` (retained DEEP recipient) in `plans/done/`.
- [ ] DQU triage decision recorded (per remaining DQU subplan: subsumed / kept / dropped) in a follow-up plan or in this master's Execution Summary.
- [ ] `/regression-guard` snapshot before/after = no silent breakage in framework-wide artifacts touched by paradigm install.
- [ ] Activity-log row appended per LR-028 for each child subplan closure.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042 at master closure.

---

## Verification (runnable from any future session)

```bash
# Confirm paradigm doc exists
ls clients/encore/specs_planning/_internal/field-case-generation.md  # expect: file present

# Confirm runner exists and has the saveAndVerifyCase export
grep -n "export async function saveAndVerifyCase" clients/encore/src/utils/field-case-runner.ts  # expect: 1 hit

# Confirm 6 agent prompts have the FCC Paradigm section
grep -l "## FCC Paradigm" .claude/agents/{REQUIREMENTS,PLANNER,GENERATOR,HEALER,AUDIT,MAINTAINER}.md  # expect: 6 paths

# Confirm CLAUDE.md @-ref row (it's in root CLAUDE.md table)
grep -n "field-case-generation.md" CLAUDE.md  # expect: 1+ hits

# Confirm field-case-catalogs directory exists with at least the Notes catalog
ls clients/encore/specs_planning/_internal/field-case-catalogs/  # expect: notes-2026-05-19.md (plus future modules)

# Confirm Notes spec has the FCC describe block at TOP (currently at line 31)
grep -n "Location Notes — FCC" clients/encore/tests/locations/location-notes.spec.ts

# Confirm 26 FCC-paradigm tests landed (post-Notes-pilot)
# Note: TC IDs were renamed to canonical NTS-NN form by SUBPLAN_XLSX_PREP_01 (2026-05-26 naming policy — no -FCC- segment in IDs);
# the @fcc describe tag survives as the FCC-paradigm marker.
grep -cE "^  test\('TC-LOC-NTS-(039|040|041|042|043|044|045|046|047|048|049|050|051|052|053|054|055|056|057|058|060|061|062|063|064):" clients/encore/tests/locations/location-notes.spec.ts  # expect: 25 (FCC-028 dropped as HIST duplicate of NTS-038; NTS-059 backfill not in FCC describe block)

# Confirm SSL false-green sweep artifact exists (per user override 2026-05-22)
ls clients/encore/specs_planning/_internal/false-green-sweeps/shared-setup-locations-2026-05-22.md  # expect: file present

# Confirm SSL spec retains 3 Sweep-7 fixmes with 2026-05-22 verification comments
grep -c "2026-05-22" clients/encore/tests/locations/location-shared-setup-locations.spec.ts  # expect: >= 3

# Confirm zero bare-`page` destructures alongside custom fixture (master line 143 strict zero gate)
grep -cE "\{[^}]*,\s*page\s*[,}]" clients/encore/tests/locations/location-shared-setup-locations.spec.ts  # expect: 0
```

---

## Handoff (chat-only per feedback_handoff_in_chat_only.md)

This master plan governs the FCC paradigm rollout across all modules. SSL is shipped (grandfathered from false-green sweep). The Notes subplan is the next executable; it installs the paradigm and ships the Notes pilot. Every subsequent module gets a future subplan per §Roadmap, each carrying the §False-Green Sweep Doctrine obligations. DQU's 27 orphaned children await OWNER triage post-Notes. Master closes when all 3 acceptance gates fire (every future module done + SSL ✓ + DQU triage recorded).
