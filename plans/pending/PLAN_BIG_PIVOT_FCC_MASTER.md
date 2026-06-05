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

**SSL pilot completed** — all 5 of `SUBPLAN_DQU_V6_PILOT_SSL_A/B/C/D/E.md` are in `plans/done/` (closure manifests in `plans/_closure_manifests/`). SSL FCC coverage shipped by user as part of the DQU pilot chain; the existing 30 SSL TCs are grandfathered (see §SSL grandfather below).

**PLAN_DQU_V6.md is DONE** (in `plans/done/`). 27 `SUBPLAN_DQU_*.md` files remain in `plans/pending/` orphaned by their parent's closure — pending OWNER triage (subsume into FCC rollout / keep as standalone / drop). See §DQU disposition.

**Notes pilot is queue position #1** — first executable child of this master:

- [SUBPLAN_NOTES_FCC_PILOT.md](SUBPLAN_NOTES_FCC_PILOT.md) — paradigm install (one-time, framework-wide) + Notes pilot.

When Notes closes GREEN, the paradigm is installed for every subsequent module. Master remains open until every module in §Roadmap has its own FCC subplan closed.

**Framework bugs co-doctrine** — `~/.claude/plans/c-users-rutvi-claude-plans-glittery-tumb-nested-orbit.md` (v2, 2026-05-21 PM, post-3-pass-audit) is the sibling doctrine for fixture-lifecycle + project-matrix + spec-hygiene fixes. Phase 0 empirical verification gate is MANDATORY before any per-test code touches lands. The False-Green Sweep doctrine in §False-Green Sweep below is co-doctrine, NOT a co-parent (see M-FCC-2 note in §Cascade closure rules).

**2026-05-22 PM — SSL grandfather revoked via user override** — Rutvik authorized (3-question steering chat 2026-05-22): (a) retroactive false-green sweep against the 30 existing SSL TCs is authorized despite the prior grandfather exemption; (b) SSL false-green sweep precedes `SUBPLAN_LOCAL_INFORMATION_FCC.md` (sweep is retroactive WATCHDOG/HEALER work; Notes pilot remains queue position #1); (c) the override is recorded durably here + in §SSL grandfather revocation block below. Execution closed GREEN 2026-05-22 via [`SUBPLAN_SSL_FALSE_GREEN_SWEEP.md`](SUBPLAN_SSL_FALSE_GREEN_SWEEP.md) (sweep report: `clients/encore/specs_planning/_internal/false-green-sweeps/shared-setup-locations-2026-05-22.md`; Phase 0 verification: `clients/encore/specs_planning/_internal/phase-0-verification-shared-setup-locations-2026-05-22.md`). Three master-plan strict lines were overridden by this authorization — full audit trail in the subplan's `### Strict-line override audit trail (LR-046)` block.

**2026-05-28 — closure-discipline meta-child DONE**: [PLAN_DONE_MEANS_DONE.md](../done/PLAN_DONE_MEANS_DONE.md) — **DONE 2026-05-28**. Spawned from the WATCHDOG audit of `SUBPLAN_LEGAL_FCC.md` (8 ghost-deliverable findings); added closure-check C6 (Per-Identity Satisfaction Matrix delivery, LR-048 v3) + a C4 parent-cascade sub-check in **announce-only** rollout, retroactively cleansed the SUBPLAN_LEGAL_FCC matrix, and appended ARCH-015. It declares this master as `**Parent**:`, so this is the LR-027 parent-cascade annotation (pending-parent). It does NOT auto-close this master — the §Cascade closure rules exemption stands; the 3 master acceptance gates are unaffected.

---

## Context

The user is pivoting framework testing posture from **form-level saves** (fill many fields, click Save once) to **field-level cases** (every field change is independently saved, refreshed, and verified). Goal: per-case failure isolation — one case failing must not block the next. Mandate phrase: "shiny as fuck" coverage — no case left uncovered for the pilot module.

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

   *Case study (SSL `TC-028`, [`plans/done/SUBPLAN_DQU_V6_PILOT_SSL_C.md`](../done/SUBPLAN_DQU_V6_PILOT_SSL_C.md))*: TC-028 edits a field → leaves form dirty → switches tab → asserts no Unsaved-Changes dialog. Three structural problems surfaced by the post-SP-C audit (2026-05-20):
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

## Roadmap (children subplans)

### Pilot (next executable)
- [SUBPLAN_NOTES_FCC_PILOT.md](SUBPLAN_NOTES_FCC_PILOT.md) — **P0-EMERGENCY**, queue position #1 (post SSL-pilot-done re-sort). Paradigm install (Phase 1, one-time) + Notes pilot (Phases 2–7). **26 net-new FCC tests implemented + 1 DEFERRED (FCC-005)**: 32 authored − 5 duplicates of existing TCs (FCC-003/004/011/030/031) − 1 deferred = 26 in spec. Verified by grep of `location-notes.spec.ts` FCC IDs (001/002/006-010/012-022/023-029/032).

### False-green sweep complete (per user override 2026-05-22 — supersedes "Already shipped (no further subplan needed)" heading)
- **SSL (Shared Setup Locations)** — shipped via DQU pilot chain `SUBPLAN_DQU_V6_PILOT_SSL_A/B/C/D/E.md` (all in `plans/done/`, closed 2026-05-18 through 2026-05-20). **30 existing TCs preserved** (TC-001 through TC-030 verified via spec grep). **Retroactive 11-sweep false-green audit completed 2026-05-22 via [`SUBPLAN_SSL_FALSE_GREEN_SWEEP.md`](SUBPLAN_SSL_FALSE_GREEN_SWEEP.md)** — GREEN verdict (zero unfixed FALSE-GREEN findings; 3 Sweep 7 STALE-SKIP entries handled per LR-021 corollary; master line 143 bare-`page` strict zero gate met). Sweep report: `clients/encore/specs_planning/_internal/false-green-sweeps/shared-setup-locations-2026-05-22.md`. See §SSL grandfather below for the durable revocation record.

### Future per-module subplans (named for parent-cascade closure, not yet authored)

Authored AFTER Notes subplan closes GREEN. One subplan per module, each ~200–400 lines using the paradigm. Files will be created with this exact naming (so parent-cascade per LR-027 finds them):

- `SUBPLAN_LOCAL_INFORMATION_FCC.md` — **NEXT after Notes** (sequencing note: SSL false-green sweep precedes LOCAL_INFORMATION_FCC per user override 2026-05-22; see [`SUBPLAN_SSL_FALSE_GREEN_SWEEP.md`](SUBPLAN_SSL_FALSE_GREEN_SWEEP.md). The override does NOT promote LOCAL_INFORMATION_FCC ahead of Notes — Notes pilot remains queue position #1; SSL sweep was authored as a retroactive WATCHDOG/HEALER half against the already-shipped SSL pilot.)
- `SUBPLAN_CURRENCY_FCC.md`
- `SUBPLAN_PRICING_FCC.md`
- [SUBPLAN_ACCOUNT_ADDRESS_FCC.md](../done/SUBPLAN_ACCOUNT_ADDRESS_FCC.md) — **DONE 2026-05-29**, 2 net-new filter TCs (TC-LOC-ACC-030 Account# filter, -031 address-search clear-restores) implemented + passing; TC-LOC-ACC-029 (Phone 2 clear-persist) deferred-with-bug as `test.fixme` citing BUG-LOC-ACC-001 (app does not persist an empty Phone 2). Full spec 29 passed / 1 skipped.
- [SUBPLAN_LEGAL_FCC.md](../done/SUBPLAN_LEGAL_FCC.md) — **DONE 2026-05-27**, 1 net-new FCC test (TC-LOC-LGL-019 negative listbox enumeration + save-cycle); 12 cases LR-040(b) deferred (same mechanic, different data, already covered by existing 15 TCs); 3 cases LR-040(c) not applicable (2 APP BUGs sort-order, 1 missing left-panel selector).
- `SUBPLAN_AUTO_ADDON_FCC.md`
- `SUBPLAN_LOCAL_OFFICE_BASIC_INFO_FCC.md`
- `SUBPLAN_ECT_SETTINGS_FCC.md`
- `SUBPLAN_HIST_PER_COLUMN_FCC.md` (covers Location Management History spec restructure if needed)
- [SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC.md](../done/SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC.md) — **DONE 2026-06-03**, 26 of 27 TCs automated (TC-LOC-LP-001..023 with 016 corrected to read-only + 3 net-new persistence 025/026/027; TC-024 deferred), full spec 27 passed ×2. Renamed from `SUBPLAN_LEFT_PANEL_FCC` (module `left_panel` → `left_panel_basic_information`). **W2-08 RESOLVED**: the Country dropdown DOES exist (4 opts, live-verified) → cascade automated; **LGL-015 NOT subsumed** by TC-LOC-LP-018..022 — those tests exercise the Country selector but only assert left-panel Tax Mode/Region + cross-tab Job Costing/Remit-PST, never opening the Legal tab; the Legal-tab Service Charge + Terms reset (LGL-015) is an open coverage gap, now automatable (post-audit correction 2026-06-03). Routed from `PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md` SP07; revived per user 2026-06-01.

Each future subplan inherits the paradigm — no re-installing the runner, taxonomy, or agent prompt sections. Each does only: HUNTER baseline freshness → GIVER catalog + TCs → BUILDER spec FCC block + page-object helpers + data → WATCHDOG completeness audit → GARDENER sweep → OWNER closure. **Plus** the False-Green Sweep doctrine obligations below.

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

### Per-module FCC subplan obligations (binding for SSL-onward, except SSL grandfather)

Every per-module FCC subplan in §Roadmap MUST:

1. **Frontmatter** declares a single `**Parent**: PLAN_BIG_PIVOT_FCC_MASTER.md` (per LR-048 schema — singular key). Reference false-green doctrine in prose as `co-doctrine: §False-Green Sweep Doctrine (this file)`, NOT as a second parent.

2. **Phase 0 — empirical verification gate**: before any spec/page-object change, run nested-orbit v2 Phase 0 checks (page-collision theory + context-options propagation + trace fidelity + per-TC baseline) and write the verification artifact at `clients/encore/specs_planning/_internal/phase-0-verification-<MODULE>-<YYYY-MM-DD>.md`. PROCEED verdict required before continuing.

3. **Phase 0.5 — false-green pre-audit**: run all 11 sweeps (table above) against the target module's existing spec(s). Emit a dated report at `clients/encore/specs_planning/_internal/false-green-sweeps/<MODULE>-<YYYY-MM-DD>.md` (note: subdirectory `false-green-sweeps/` — repo convention). Classify each finding as: FALSE-GREEN / PARTIAL / FLAKY-MASK / STALE-SKIP / INFLATED / STATE-LEAK / CLEAN.

4. **Phase N-1 — false-green fix**: before closure, fix every confirmed false-green finding from Phase 0.5 using the **nested-orbit v2 §A-1 fix decision** (rewrite test to drop bare `page` from destructure; use `<pageObject>.page`). NOT a getter or override — those alternatives were explicitly rejected in v2 (conflicts with R14 exception comment + doesn't fix context-options gap).

5. **Phase N — combined verification**: final run with `--retries=0 --workers=1` exercises BOTH the new FCC catalog AND the formerly-false-green tests. All pass.

### Closure gate (per-module FCC subplan)

Cannot close GREEN if any of:
- Phase 0 verification artifact missing OR verdict ≠ PROCEED.
- Any false-green finding from Phase 0.5 unfixed AND not classified per LR-040 (a)/(b)/(c).
- Any stale skip/fixme from Sweep 7 not un-skipped and verified (LR-021) — except app-bug-blocked skips (re-skip with updated comment per LR-021 corollary).
- Any test in the module destructures the built-in `page` alongside a custom fixture.

### Two-subplan variant (if combined exceeds ~400 lines)

Split into `SUBPLAN_<MODULE>_UNFUCK.md` (WATCHDOG/HEALER — false-green audit + fix, closes first) + `SUBPLAN_<MODULE>_FCC.md` (HUNTER/GIVER/BUILDER — FCC catalog + implementation, consumes cleaned baseline). Both list each other in `**Depends on**:`; UNFUCK closes first; both must close before module is shipped.

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
