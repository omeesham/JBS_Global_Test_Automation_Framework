> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute SUBPLAN_PRICING_FCC.md`. All context below.**
>
> The agent self-bootstraps from this file's frontmatter + sections, with **zero additional user prompting**:
>
> 1. **Identity**: load `/identity` per the Identity field below (OWNER shell; per-phase `/identity HUNTER|WATCHDOG|GIVER|BUILDER|HEALER|GARDENER` at each phase boundary).
> 2. **Skills**: load every skill in the Skills line of §Bootstrap (leading skill auto-calls its chain).
> 3. **Model + thinking + permission-mode**: read the Model / Thinking / PermissionMode frontmatter fields (all three required per LR-041).
> 4. **Dependency gate**: verify every Depends-on item is DONE in plans/done/. HALT if blocked.
> 5. **Context load**: read PLAN_BIG_PIVOT_FCC_MASTER.md §Doctrine + §False-Green Sweep Doctrine + §Cascade closure rules + §DQU disposition, then every file in §Bootstrap Context-files. Missing context file = HALT.
> 5.5. **Browser tool**: declared `cli` in frontmatter per the LR-038 v2 matrix (catalog walkthrough + unattended save-cycle re-verification; no visual/CSS assertion, no fresh-passkey need, no mid-execution `pause:` step). Announce choice + reason in first output. Mid-subplan switches → `[BROWSER-SWITCH]` log per LR-028.
> 6. **Phase 0 FIRST**: dependency + browser-tool + empirical-verification gate before any edits.
> 7. **Execute Phases 0.5b → 6** in order. Phase boundaries = identity switches (clean re-load per feedback_identity_switch_protocol).
> 8. **Handoff**: flip the Status field to DONE + add the Executed date, append activity-log row (LR-028 + LR-037), annotate the master, `git mv` to plans/done/, `npm run plans:reindex`, `/final-q`.
>
> **HALT + ASK USER** if: dependency blocker / scope ambiguity beyond the KEEP list / Phase 0-1 discovers >30% scope extension / regression-guard shows unrelated changes / LR-037 timestamp drift / **LR-040 closure-completeness — any planned item not classifiable (a) MCP-proven, (b) grep-verifiable line item in a named existing recipient subplan, or (c) user-flagged discussion-item with named flag** / **any of the 7 documented skips cannot be classified PASSES-NOW or STILL-FAILS-WITH-FRESH-BUG after live re-verification (LR-021)** / **`PLAN_EXHAUSTIVE_WALK_GUARANTEE.md` (Depends-on) is not DONE in `plans/done/` OR its Phase-0 pilot artifact lacks a PROCEED verdict — the Phase 0.5b + Phase 1 walks REQUIRE its machine-enumerated manifest machinery (enumerator + cross-check + LR-062), so HALT until it lands; do NOT fall back to the old re-verify-known-fields rushed walk**.

---

# SUBPLAN_PRICING_FCC

**Status**: DONE
**Executed**: 2026-06-19
**Priority**: P1
**Created**: 2026-06-15
**Identity**: OWNER (multi-identity by phase — HUNTER → WATCHDOG → GIVER → BUILDER → WATCHDOG/HEALER → GARDENER → OWNER)
**Parent**: PLAN_BIG_PIVOT_FCC_MASTER.md
**Depends on**: SUBPLAN_NOTES_FCC_PILOT.md (DONE 2026-05-22 — FCC paradigm infra: `clients/encore/src/utils/field-case-runner.ts` `saveAndVerifyCase`), PLAN_EXHAUSTIVE_WALK_GUARANTEE.md (run FIRST — its machine-enumerated coverage manifest makes Phase 0.5b + Phase 1 walks exhaustive by construction, not rushed-partial)
**Blocks**: SUBPLAN_PRICING_EDGE_P3.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: acceptEdits
**BrowserTool**: cli
**Author**: Rutvik (via Claude Opus 4.8)
**ActiveClient**: encore

co-doctrine: §False-Green Sweep Doctrine (PLAN_BIG_PIVOT_FCC_MASTER.md) — NOT a second parent (LR-048 singular-Parent schema).

---

## Resume note (2026-06-18) — partial execution; resume at Phase 0.5b

A first `/execute` pass (2026-06-18) completed **Phase 0** (PROCEED verdict), **Phase 1** (field inventory, partial), and **Phase 1.5** (all 7 skips classified: 6 re-enabled — TC-020 + TC-026..030; 1 app bug — TC-025, filed `BUG-LOC-PRI-001`). It then made the mistakes catalogued in `clients/encore/specs_planning/_internal/agent-mistakes.md` (2026-06-18 ALL-* entries) and was checkpointed PENDING. **Resume at Phase 0.5b.**

**Outstanding on resume:**
- **Use the exhaustive-walk machinery (depends-on `PLAN_EXHAUSTIVE_WALK_GUARANTEE.md`, run FIRST).** Both the Phase 0.5b baseline walk AND the Phase 1 field inventory MUST be driven by the machine-enumerated coverage manifest (self-expanding to fixpoint, every element dispositioned, `Coverage_Ratio: N/N (100%)`) — NOT the old re-verify-known-fields rushed walk that produced the 2026-06-18 `coverageScope: PARTIAL`. The closure gate (LR-062 Cx) will DENY this subplan's DONE flip if either walk artifact is < 100% / undispositioned.
- **Phase 0.5b baseline walk was SKIPPED — do it FIRST** (Anti-Assumption Gate 1). It is the only thing that answers whether the disabled date-grid (Use Effective Date + Start/End) and the empty 1604 primary dropdowns match baseline. After the walk, reclassify `BUG-LOC-PRI-001.baselineComparison` (currently `not-checked`) to the correct LR-034 enum + add `baselineEvidence` pointing at the new `old-site-baseline/pricing-2026-06-19.md`.
- **RC-7 spec half-state**: TC-020 + TC-026..030 are un-skipped in `location-pricing.spec.ts` but NOT yet LR-019-hardened (`ensureDefaultState` / `saveAndConfirm`). Phase 3 must harden them atomically (Anti-Assumption Gate 5) — until then the suite is more fragile than when skipped.
- Phases 2–6 (catalog/parity, spec hardening, fresh-context review/audit, ×2 green on a stable env, closure) outstanding.

## Anti-Assumption Gates (binding — per `PLAN_BIG_PIVOT_FCC_MASTER.md` §Anti-Assumption Gates)

1. **Baseline-first HARD GATE** — Phase 0.5b executes before any classification / bug filing (LR-045 / LR-ENC-001 / LR-048 §5).
2. **N≥2 evidence** before any "corrupt / atypical / app-wide / regression" claim — 2 offices OR new-site+baseline (LR-061).
3. **Verify-before-blocked** — overlay-clear + reload + PO-selector-vs-live-DOM diff + DOM-inspect before "un-drivable" (LR-061 / LR-021).
4. **No env-rationalized deferral** of env-independent work; env defers only the ×2 full-suite run (LR-060).
5. **Atomic un-skip + LR-019 harden** in the same change (LR-021 corollary).
6. **No silent checkpoint** — all phases done OR a user-signed `## Deferral Authorization` block (LR-060).

---

## Deferral Authorization (2026-06-18)

Stage 3 of the prevention plan (`drifting-forging-honey.md`) — the resume of this subplan: Phase 0.5b baseline walk → `BUG-LOC-PRI-001` reclassification → Phases 2–6 → ×2-green → closure — is **deferred to a focused next session, user-authorized**.

> User (2026-06-18): "defer stage 3, give put a chip for it to continue in next session"

Per LR-060 this is an explicit, recorded deferral — NOT a silent checkpoint (the execution-completion Stop-hook reads this block and stays silent). Scope deferred: the full pricing closure (baseline walk + catalog/parity + spec hardening incl. the RC-7 un-skip+harden remediation + fresh-context `/audit` + ×2-green on a stable env + Phase 6 closure). Resume with `/execute SUBPLAN_PRICING_FCC.md` — it self-bootstraps baseline-first under the new Anti-Assumption Gates. A background task chip tracks this.

---

## Context

PLAN_BIG_PIVOT_FCC_MASTER.md §Roadmap line 95 reserves this subplan's filename. Target surface: **Location Settings → Pricing sub-tab** (`/navigator/locations/1604/settings/location`, office 1604 "Parker Palm Springs"; Angular + Radix). It is a **sibling** of the already-FCC'd Account & Address / Basic Information / Legal / Auto Add-On tabs. It is **NOT** the standalone Corporate Pricing module (`/settings/corporate-pricing`) — that is separate and already covered.

Pricing is the one Location-Settings sub-tab "never really automated due to API failures." User (2026-06-15): the API "seems fixed now"; this subplan **measures** that rather than assuming it.

**Current state (verified against live code 2026-06-15, LR-020):**
- Spec `clients/encore/tests/locations/location-pricing.spec.ts` EXISTS — `describe('Location Pricing @locations @pricing')`, **~26 runtime tests passing + 7 hard-skipped**. IDs `TC-LOC-PRI-001..035` with gaps (no 020/034 active; 020/025 + 026..030 skipped).
- Page object `location-pricing.page.ts` (622 lines, 80+ helpers: cascade, Radix calendar popovers, save dialog, currency filter). **No `ensureDefaultState`** (the `beforeEach` only ad-hoc self-heals Corporate Pricing) and **no `saveAndConfirm` FCC-runner wrapper** — both are BUILDER gaps.
- Selectors `src/selectors/locations/pricing.ts` (2 checkboxes, currency filter, **5 USD** primary dropdowns + secondary grid + 7 column headers) — CAD/MXN dropdown keys NOT yet enumerated.
- Test data `src/data/locations/location-pricing.ts` (office-1604 pricebook rows, `DROPDOWN_PERSISTENCE_CASES`, currency options).
- TC-MD `test-cases/setup/locations/locations_pricing_test_cases.md` + test-plan `test-plans/setup/locations/locations_pricing_test_plan.md` **EXIST but are stale/pre-FCC** — GIVER reconciles, does not author from scratch.
- **ABSENT (the FCC gap this closes): field inventory, old-site baseline, field-case catalog, false-green sweep** — none exist for Pricing.

**The 7 skips have TWO distinct root causes (the heart of the "API fixed" claim):**
1. **Server 500** on `POST update-location-pricing` → `TC-LOC-PRI-026..030` (5 dropdown-persistence tests). The spec's own SKIP RCA block (`location-pricing.spec.ts:507-518`) documents this AND a **latent framework race** in `base.page.ts` `clickSaveWithDialog` (~L387): `page.off` removes the network listener after `waitForAngularStable`, before the slow 500 arrives → `clickSave` falsely reports `{success:true}`. **Affects ALL page objects** — spun off to a separate verified-first task chip; NOT fixed here.
2. **Save-200-but-reverts** (data doesn't round-trip) → `TC-LOC-PRI-020` (dates) + `TC-LOC-PRI-025` (Corporate Pricing checkbox). App-level, distinct from the 500.

**User-provided facts (Rutvik, 2026-06-15 — treat as truth, cite this provenance):**
1. **What's fixed → live-verify each, evidence decides** (LR-021 + LR-044). Do not assume which class is fixed. Re-enable every skip that now passes; re-skip + file a bug (fresh evidence) for any that still fail.
2. **Multi-currency → do not assume USD-only.** All locations share the **same currency page, same options, same data sets.** The field inventory must enumerate the REAL currency-filter option set + per-currency primary-pricing dropdowns (USD/CAD/MXN as they render); CAD/MXN are **in-scope for this MAIN subplan**, not deferred.
3. **Quality bar →** full identity sweep, every /identity job done IN this subplan, nothing partial (no regression gap), no corners, no assumptions, read before concluding, explicit /review + /audit gate.
4. **Framework race →** spun off as a separate **verification-first** task chip (the new agent must independently confirm the race is real before any fix — no hallucinated handoff).

**Provenance / subsumption (user triage 2026-06-15):**
- `plans/pending/SUBPLAN_DQU_12_F1a_PRICING_AUDIT.md` is **SUBSUMED into this subplan** (precedent: DQU_18 → Auto Add-On). Its still-live focus areas are absorbed: IsAlternate→UseDate→Start/End cascade; Corporate-grid validation (`validateCorporatePriceGrid`); Corporate-Pricing-toggle-disables-fields; cell-edit restrictions (`onBeforeEditCell`); PriceGuideInclusion default; **EnableMultidayPricing tab-placement** (Pricing vs Local Information — live-resolve). Phase 6 flips its Status to SUBSUMED and records the triage in the master per §DQU disposition.
- `plans/pending/PLAN_PRICING_TEST_COVERAGE_AUDIT_AND_FIX.md` is **CONSUMED** as Phase-2 gap input (Parts 1-4: persistence / decision-table / state-transition / BVA / a11y / error-guessing gap lists). Its **Part 5** (framework-wide planner-rule changes PLN-043..047, WARN→HARD-GATE) is **framework-pipeline scope, NOT module scope** → recorded as a separate **discussion-item** decision; HALT-and-ask the user before any framework agent-rule edit. Do NOT fold it into this module plan.

This subplan inherits the installed FCC paradigm — no re-installing runner/taxonomy/agent prompts. It carries the master's §False-Green Sweep Doctrine obligations (Phase 0 + 0.5fg + N-1 + N) and Doctrine items 1-8 (notably item 3 blend-at-top/no-`@fcc`-tag, item 6 save-first navigation, item 8 de-dup by proven outcome).

---

## Bootstrap

**Identity**: OWNER (sub-phases tagged via per-phase `/identity X`).
**Skills auto-called**: `/identity` (each phase boundary), `/relevant` (session start), `/regression-guard` (pre+post BUILDER), `/rca` + `/bugfix` (conditional — Phase 1.5 / Phase 4 RED), `/find-bugs` (Phase 4 adversarial pass), `/review` + `/audit` (Phase 4 fresh-context gate), `/final-q` (closure, LR-042).
**Context files (load order):**
1. `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md` — §Doctrine 1-8 + §Roadmap + §False-Green Sweep Doctrine + §Cascade closure rules + §DQU disposition
2. `plans/done/SUBPLAN_AUTO_ADDON_FCC.md` — freshest Location-Settings FCC sibling (structure + honest-zero clause + v3 matrix + DQU-subsumption pattern + Post-Audit lessons)
3. `plans/done/SUBPLAN_ACCOUNT_ADDRESS_FCC.md` — sibling (deferred-with-bug precedent + restorability tiers + saveAndConfirm wrapper)
4. `clients/encore/tests/locations/location-pricing.spec.ts` — blend target (26 pass + 7 skip; SKIP RCA block L507-518)
5. `clients/encore/src/pages/locations/location-pricing.page.ts` + `src/selectors/locations/pricing.ts` + `src/data/locations/location-pricing.ts`
6. `plans/pending/SUBPLAN_DQU_12_F1a_PRICING_AUDIT.md` + `plans/pending/PLAN_PRICING_TEST_COVERAGE_AUDIT_AND_FIX.md` — subsumption / gap INPUTS (read SKEPTICALLY; both pre-FCC)
7. `clients/encore/specs_planning/_internal/field-case-generation.md` — §2 rows: Checkbox, Dropdown/combobox (Radix), Cascading dropdown, Date/offset + §2.1 rejection-affordance oracle + §1 (3-tier save verification)
8. `clients/encore/specs_planning/_internal/field-inventory-spec.md` + `_internal/field-inventories/_TEMPLATE.md` — 8 frontmatter keys + 7 sections
9. `clients/encore/src/utils/field-case-runner.ts` — `saveAndVerifyCase()` runner
10. `clients/encore/src/pages/locations/location-legal.page.ts` — `ensureDefaultState` bounded-retry pattern to REUSE (read → re-set → save → reload → re-verify; throws after 3 cycles)
11. `clients/encore/specs_planning/_internal/walk-evidence-location-settings-2026-05-14.md` — dialog-label inventory ("Ok" confirm on the LS sub-tabs)
12. `export_test_cases/module-codes.json` — `PRI` entry + bug grammar `BUG-LOC-PRI-NNN`
13. `clients/encore/CLAUDE.md` — LR-ENC-001 (baseline truth), LR-ENC-002 (parity structural), LR-ENC-003 (.env.local), LR-008 (date positivity), LR-012 (shared dialog), LR-017 (namespaces), LR-036 (boolean render)
14. `.claude/rules/` — pipeline.md (LR-020/027/040/041/046/048/050/055), specs.md (LR-018/019/021/022/024/025/051/052/053/056), angular.md (LR-009/010/011/026), browser-tool.md (LR-038/054), inventory.md (LR-007/013/014/015/057), baseline.md (LR-045), data.md
15. `clients/encore/specs_planning/_internal/agent-mistakes.md` — ALL-089 (checkbox driver), ALL-086 (network filter), + any rows newer than this subplan's Created date
16. `.claude/context/navigation.md` — §B routing rows (Radix dropdown LR-025, save dialog, LR-056 network filter, Radix tab activation, date popover)

**Missing context file = HALT.**

---

## Phase 0 — Dependency + browser-tool + empirical-verification gate (OWNER; LR-048 + False-Green Doctrine §2)

**[GATE-D0]** Before any work:
- [x] `plans/done/SUBPLAN_NOTES_FCC_PILOT.md` is DONE; `clients/encore/src/utils/field-case-runner.ts` exists and exports `saveAndVerifyCase` (grep).
- [x] Spec / page object / selectors / data / TC-MD / test-plan exist at the §Context paths (this is a BLEND + reconcile, not net-new — confirm 26 pass + 7 skip via `npx playwright test location-pricing.spec.ts --list`).
- [x] Local runs use `.env.local` — never `CI_ENV=e2e` (LR-ENC-003).
- [x] **Browser tool: CLI** announced (LR-038 v2 — catalog walkthrough + save-cycle re-verification, unattended; no MFA per client CLAUDE.md; LR-054 Table 2 covers click/fill/snapshot/network/state-save). Auth via `playwright-cli -s=e2e state-load clients/encore/.auth/encore-state.json` then re-`goto`; Gate-3 headed fallback on Entra redirect.
- [x] **Empirical verification gate** (nested-orbit v2 Phase 0): page-collision / context-options propagation / trace fidelity / per-TC baseline checks. Emit `clients/encore/specs_planning/_internal/phase-0-verification-pricing-2026-06-19.md` with **PROCEED** verdict. PROCEED required to continue.

**HALT** if any gate fails → escalate in chat.

## Phase 0.5b — Baseline-first walk (HUNTER; LR-048 §5 + LR-045 + LR-ENC-001)

`/identity HUNTER`. This subplan drives TC corrections → baseline-first walk REQUIRED.
- Visit baseline `https://navigator2.training.psav.com/#/setup/locationdetail/1604` FIRST; locate the embedded **Pricing** sub-tab. Observation-only — zero selector parity (LR-ENC-001).
- **EnableMultidayPricing / Merchant Currency are baseline-absent** per LR-ENC-001 — record `baselineScope` honestly, do NOT HALT; `/encore-questions` draft note only if a genuine divergence question emerges (ALL-078).
- **Office: 1604** (matches the active-site TC office per §Context; single office sufficient per the currency-uniform user fact 2026-06-15). Record `Walk_State: office=1604`.
- **Drive this walk with `PLAN_EXHAUSTIVE_WALK_GUARANTEE`'s machine enumerator** (self-expand to fixpoint, every element dispositioned, `Coverage_Ratio: N/N (100%)`, `CrossCheck: clean`) using the **M2-Baseline key scheme** for the testid-less old site (`name=`/`id=`/ancestor-path — navigator2 has zero data-testids per LR-ENC-001). NOT the old re-verify-known-fields rushed walk. The closure gate (LR-062 Cx) DENIES this subplan's DONE flip if this baseline artifact is < 100% / undispositioned.
- Emit `clients/encore/specs_planning/_internal/old-site-baseline/pricing-2026-06-19.md` (free-form, 5-7 sections, frontmatter `baselineScope: full | baseline-partial | baseline-absent` + `Coverage_Ratio` + `Walk_State`).
- `## Baseline diff`: classify each observed-vs-baseline divergence regression-from-baseline / intentional-UX-change / baseline-absent. **HALT gate**: regression-from-baseline count > 5 → STOP, escalate per LR-040.

## Phase 0.5fg — False-green pre-audit (WATCHDOG; False-Green Doctrine §3 — all 12 sweeps)

`/identity WATCHDOG`. Run all **12 sweeps** (master §False-Green Sweep table) against EXISTING `location-pricing.spec.ts` + `location-pricing.page.ts`. Classify honestly — do NOT prejudge. Known candidate sites:
- The ad-hoc `beforeEach` Corporate-Pricing self-heal (STATE-LEAK class — no full `ensureDefaultState`, LR-019 exposure).
- The 3 lexical skip sites (`:386, 477, 520` — Sweep 7 STALE-SKIP; line 520 is inside a `DROPDOWN_PERSISTENCE_CASES` loop so runtime skip count = loop length). These MUST be live-re-verified in Phase 1.5 (LR-021).
- `clickSave().success` reliance given the documented base-page race (Sweep 8 / INFLATED).
- Date-popover `hasDateValidationError` branches + any `isVisible()`/`isEnabled()` in `if`/ternary (Sweep 4).
- `expect.poll` timeouts >10s (Sweep 11).
- Emit `clients/encore/specs_planning/_internal/false-green-sweeps/pricing-2026-06-19.md` classifying every finding: FALSE-GREEN / PARTIAL / FLAKY-MASK / STALE-SKIP / INFLATED / STATE-LEAK / UNPROBED-AFFORDANCE / CLEAN.
- Note: `false-green-sweeps/` + `phase-0-verification-*` are not tabulated ownership rows; if the identity-gate hook denies a write, use the LR-043 OWNER short-circuit (clean `/identity OWNER` re-load), log the switch, continue — do NOT hand-edit hook/ownership files mid-subplan.

## Phase 1 — Field inventory (HUNTER; LR-013/014/015/057)

`/identity HUNTER`. Live e2e walk on **office 1604** (Pricing tab; Radix tab activation per navigation.md §B — full pointer sequence or Playwright `.click()`). **Drive it with `PLAN_EXHAUSTIVE_WALK_GUARANTEE`'s machine enumerator** (self-expand to fixpoint, cascade-aware, every element dispositioned, `Coverage_Ratio: N/N (100%)`, `CrossCheck: clean`) — record `Walk_State: office=1604, currency=USD` (1604 is USD-only → only 5 USD primary dropdowns render; CAD/MXN dropdowns render only on a multi-currency office and are walked on **1605** in Phase 2/3 as their own `Walk_State`). Capture for every enumerated element: label, data-testid (LR-014 — complete column or explicit fallback), control type, live default (LR-015), validation, enabled/disabled, cross-field dependencies, `affordance:` probe token (LR-057).

**Mandatory coverage (kills assumptions — per user facts):**
- **Currency filter**: enumerate the REAL option set live (do NOT assume `['All','USD']`) + the filter→grid effect. Per user fact, the currency page/options/data are uniform across locations.
- **Per-currency primary dropdowns**: confirm whether **USD AND CAD AND MXN** dropdown fields render; capture each testid (note CAD/MXN selector keys for BUILDER to add). Option counts → LR-025 if ≥50.
- **Grid cascade**: Is Alternative → Use Effective Date → Start/End Date (Radix readOnly date inputs, calendar-only); record exact enable/clear cascade + cross-field Start>End validation (LR-008/LR-010).
- **Corporate Pricing toggle**: confirm unchecking disables the 5 primary dropdowns (carried from DQU_12); confirm it does NOT disable grid fields.
- **EnableMultidayPricing**: resolve its tab placement (Pricing vs Local Information) — carried from DQU_12.
- **Save-cycle**: dialog heading + buttons (expect "Save Changes"/Cancel·Ok per walk-evidence 2026-05-14), toast, Save enable/disable, **the real save endpoint(s)** via `playwright-cli network` (LR-056 — never page-URL substring; note the documented dual-call `POST update-location-pricing` + `PUT update-properties`).
- Emit `clients/encore/specs_planning/_internal/field-inventories/pricing-2026-06-19.md` — all 8 frontmatter keys (`MCP_Session_Date` = filename date) + 7 mandatory sections; testid column complete (LR-014); defaults live-read (LR-015).

## Phase 1.5 — Un-skip re-verification + stale-claims (WATCHDOG/HEALER; LR-021 + LR-044 + LR-024 — USER-CENTRAL)

`/identity WATCHDOG` (→ `/identity HEALER` for any bug filing). For **each** of the 7 skips, follow LR-021 (un-skip → run original logic AS-IS) on the live app, artifact-first per LR-024 (clean, run fresh, read failure artifacts before re-running):

| Skip | Documented cause | Re-verify action |
|---|---|---|
| TC-020 (dates persist) | save-200-but-reverts | un-skip, run; if round-trips now → re-enable; else re-skip with FRESH evidence + file/refresh `BUG-LOC-PRI-NNN` (LR-044 verbatim steps, baselineComparison) |
| TC-025 (Corp Pricing persist) | save-200-but-reverts | same protocol |
| TC-026..030 (5 dropdown persist) | POST 500 + clickSaveWithDialog race | un-skip, run; capture `playwright-cli network` to confirm whether the 500 still fires; if gone + round-trips → re-enable all 5; else re-skip with fresh 500 evidence + bug |

- Emit a `## Un-skip re-verification` verdict table (one row per skip: PASSES-NOW-RE-ENABLED / STILL-FAILS-BUG-<id> / FLAKY) INSIDE the false-green sweep artifact (WATCHDOG-owned home).
- Also diff the stale TC-MD + DQU_12 focus-area claims against the Phase-1 inventory (testid drift, dialog labels, navigation paths, EnableMultidayPricing placement, corporate-grid validation).
- **The framework race is NOT fixed here** — it is the spun-off chip; this phase only records whether it still masks Pricing saves (if the 500 is gone the race no longer bites these tests). If a skip cannot be classified PASSES-NOW or STILL-FAILS-WITH-FRESH-BUG → HALT + ASK USER (bootstrap HALT condition).

## Phase 2 — Coverage ledger + field-case catalog + TC/MD/test-plan/XLSX parity (GIVER; LR-048 §6.5, LR-ENC-002)

`/identity GIVER`.
1. **Coverage ledger** (doctrine item 8): for each existing TC, list every `(field, assertion)` it proves — including per-field persistence discharged by multi-field saves.
2. **Gap matrix** grounded in the field-type → taxonomy mapping: Checkbox (Corporate Pricing, Price Guide Inclusive, grid Is Alternative / Use Effective Date) / Dropdown-combobox (5 primary × USD/CAD/MXN) / Cascading dropdown (Is Alt→Use Eff Date→dates) / Date-offset (Start/End, cross-field Start>End) + read-only columns — each negative/BVA case carrying the §2.1 rejection-affordance oracle (announced + escapable). Classify EVERY cell **(a)** implement net-new / **(b)** covered-by-outcome (cite discharging TC) / **(c)** deferred-with-reason. Consume `PLAN_PRICING_TEST_COVERAGE_AUDIT_AND_FIX.md` Parts 1-4 as candidate cells; mark each MAIN vs EDGE.
3. **MAIN-scope coverage target (no corners)**: every saveable field has a round-trip persist case; the documented cascade + Corporate-Pricing→dropdowns-disable as state-transition tests; cross-field date validation (Start>End, missing-date-blocks-Save); per-currency dropdown each-option-save; read-only columns non-interactive; save-dialog cancel/confirm; unsaved-changes dialog. **Honest-zero net-new is acceptable ONLY where the ledger proves the assertion already exists** — never as a corner-cut.
4. **DEFER to EDGE** (record as (c) with recipient `SUBPLAN_PRICING_EDGE_P3.md`, grep-verifiable per LR-040(b)): leap-year / year-rollover date BVA, exhaustive pairwise multi-row combinatorics, full W3C a11y audit, error-guessing (rapid double-click race / concurrent edit / save-failure injection + retry / dropdown-load-failure recovery), Tier-2 network-payload structural assertions.
5. Emit `clients/encore/specs_planning/_internal/field-case-catalogs/pricing-2026-06-19.md` (ledger + gap matrix + net-new list `TC-LOC-PRI-036+`).
6. **Reconcile the EXISTING (stale, pre-FCC) TC-MD + test-plan** — `test-cases/setup/locations/locations_pricing_test_cases.md` + `test-plans/setup/locations/locations_pricing_test_plan.md`: diff against the live spec + Phase-1 inventory, correct stale claims, bring to full parity (existing + re-enabled + net-new), each TC block with explicit `**Notes**:` (to-csv parser gotcha) + `**MCP_VERIFICATION_LOG**: pricing-2026-06-19.md §<section> "<field>" — <evidence>` citations.
7. Rebuild workbook `npm run xlsx:build` (sheet `locations_pricing`); **`npm run check:tc-parity` exit 0** (guardrails 4-7 incl. ID↔sheet liveness).
8. Bug CANDIDATES from Phase 1.5 recorded as named flags in the catalog; JSON filing happens Phase 4 under HEALER (grammar `BUG-LOC-PRI-NNN` per module-codes.json). Empty-everywhere + no-UI-path + no-Jira → discussion-item flag, not a bug (feedback_discussion_item_not_bug).

## Phase 3 — Build / harden (BUILDER; LR-019/022/025/051/052 + LR-058)

`/identity BUILDER`. `/regression-guard` snapshot BEFORE.
1. **LR-019 per-test baseline (load-bearing)**: add a hardened `ensureDefaultState(PRICING_DEFAULTS)` to `location-pricing.page.ts` — REUSE the Legal bounded-retry pattern (read → re-set → save → reload → re-verify; throws after 3 cycles; `clickSaveWithDialog`-returns-success-when-disabled caveat). Reset the net-zero-vulnerable fields (2 checkboxes + grid rows via existing `resetGridRow`). Wire into the spec's `beforeEach` after the nav-guard; supersede the ad-hoc Corporate-Pricing self-heal block.
2. **`saveAndConfirm()` wrapper** for the FCC runner (Promise<void>, throws on save failure) — mirror Account & Address.
3. **Re-enable** the skips Phase 1.5 marked PASSES-NOW; keep STILL-FAILS as `test.fixme` with the fresh bug citation (LR-021 corollary — re-skip with updated comment + verification date).
4. **Net-new FCC cases** (per catalog): blend at the TOP of the existing describe (immediately after `beforeEach`, above TC-001), sequential `TC-LOC-PRI-036+`, same `@locations @pricing` tags, **NO `@fcc` tag** (doctrine item 3). Save-cycle cases via `saveAndVerifyCase()` (compile-required baseline). Add CAD/MXN selector keys + per-currency data if Phase 1 confirmed they render. Existing TC bodies UNTOUCHED except the `beforeEach` hardening + any Phase-1.5 CONFIRMED fixes.
5. **Sweep fixes intake**: mechanical FALSE-GREEN / LR-052 findings that live in the page object are fixed here; spec-level false-green → Phase 4 (HEALER). Honor LR-022 (the documented `PRICING_COLUMN_HEADERS` equality stays — structure IS the feature there), LR-025 (Radix retry on per-currency dropdowns), LR-051/052, LR-009/026 (revert→Save-disabled; defensive dirty-state), doctrine item 6 (save-first navigation — only the dirty-state-dialog test may hold a dirty form across navigation). No bare-`page` destructure. **LR-058**: zero internal jargon in shipped spec/page-object comments/strings/titles.
6. First run individual `npx playwright test location-pricing.spec.ts --workers=1 --retries=0` green BEFORE any full-suite run (feedback_always_run_individual_first). `npx playwright test --list` resolves all TC-LOC-PRI IDs. `/regression-guard` snapshot AFTER.

## Phase 4 — Completeness audit + /review + /audit + false-green fix + combined verification (WATCHDOG/HEALER; AUD-017 fresh-context)

`/identity WATCHDOG`. `/find-bugs` adversarial pass on the touched spec.
- **FCC completeness audit**: every gap-matrix cell classified (a)/(b)/(c) with evidence (LR-040); TC ↔ MD ↔ XLSX parity (ALL-071 / LR-ENC-002); Phase-1.5 verdict table has zero UNRESOLVED rows.
- **`/review`** on the diff + **`/audit`** (Pipeline + FCC-Completeness modes). **Per AUD-017 the final completeness audit must be fresh-context** — a spawned `audit` subagent OR a separate `/execute` session, NOT self-graded in the same build context. Do not self-certify.
- **Phase N-1 false-green fix** (`/identity HEALER`): fix every confirmed FALSE-GREEN from Phase 0.5fg (nested-orbit v2 §A-1 for any bare-`page`; pattern-appropriate otherwise). Sync MD Status on any fix (HEALER HARD STOP #6). RCA any RED via `/rca` — artifact-first (LR-024).
- **Bug filing** (`/identity HEALER`): file every Phase-1.5/Phase-2 candidate that still reproduces as `clients/encore/reports/bugs/BUG-LOC-PRI-NNN.json` per LR-034 + LR-044 (verbatim steps, baselineComparison, dedup first).
- **Phase N combined verification**: full spec run `--retries=0 --workers=1` green **×2** (HLR-007).

## Phase 5 — Structural sweep (GARDENER; LR-050 — honest scope)

`/identity GARDENER`. No rename (module slug `pricing`, TC prefix `TC-LOC-PRI`, file names stay). Enumerated sweep:

| Item | Action | File(s) |
|---|---|---|
| Inline save-dialog handling vs base-page `clickSaveWithDialog` | Dedup ONLY if behavior-identical (LR-012 shared-dialog); else KEEP + 1-line comment why | `location-pricing.page.ts` |
| Ad-hoc Corporate-Pricing `beforeEach` self-heal | confirm removed (superseded by `ensureDefaultState`) | spec |
| Dead/orphan selectors after Phase 3 (incl. unused CAD/MXN keys) | remove if provably unused (grep) | `src/selectors/locations/pricing.ts` |
| Typecheck + barrel consistency | `npx tsc --noEmit -p clients/encore/tsconfig.json` clean | — |

If an item yields nothing, record `(skipped: <reason>)` honestly — no make-work refactors, zero behavior change in this phase.

## Phase 6 — Closure (OWNER; LR-027 + LR-040 + LR-055)

`/identity OWNER`.
1. Flip the Status field to DONE + add the Executed date.
2. `### Execution Summary`: final TC count + IDs; re-enabled vs still-bug-blocked skips; per-cell (a)/(b)/(c) dispositions; Phase-1.5 verdict-table summary; verification results in evidence-emission format `ran '<cmd>' → output: '<snippet>'` (spec run ×2, typecheck, xlsx:build, check:tc-parity, --list, regression-guard before/after); honest deviations log (LR-046; live pivots recorded inline per the Plan-Deviation taxonomy, not as D-rows).
3. **Per-Identity Matrix closure audit** — every cell resolves to a real path / `(skipped: ≥20 chars)` / `(none)` (C6).
4. **Parent cascade**: master stays PENDING — cite verbatim `LR-027 cascade SKIPPED per master plan §Cascade closure rules (user override 2026-05-21)` + activity-log row recording the override. Annotate the DONE line into master §Roadmap line 95.
5. **Subsumption bookkeeping**: flip `SUBPLAN_DQU_12_F1a_PRICING_AUDIT.md` Status to `SUBSUMED (into SUBPLAN_PRICING_FCC.md — user triage 2026-06-15)` + provenance note; record the DQU-triage decision in master §DQU disposition. Annotate `PLAN_PRICING_TEST_COVERAGE_AUDIT_AND_FIX.md`: Parts 1-4 addressed by this subplan; **Part 5 framework-rule recommendations remain a separate discussion-item** — HALT and ask the user before any framework agent-rule edit; do NOT flip its Status unilaterally if Part 5 is unresolved. If the closure hook denies any non-DONE status edit, HALT and surface — never bypass (LR-055).
6. Closure gate: `node scripts/validate-plan-closure.mjs --enforce` C1-C6 PASS.
7. Activity-log row (LR-028; LR-037 timestamp ≥ touched-file mtimes). `git mv` to `plans/done/` + `npm run plans:reindex`.
8. `/final-q` verdict block (GREEN | YELLOW | RED) per LR-042. Update `navigation.md` §C with the new pricing registry row (+ any §B routing additions) per /reflect obligations.

---

## Per-Identity Satisfaction (LR-048 v3 — every cell a real path, `(skipped: ≥20 chars)`, or `(none)`; `2026-06-19` filled at execution)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | field-inventory + old-site-baseline | clients/encore/specs_planning/_internal/field-inventories/pricing-2026-06-19.md<br>clients/encore/specs_planning/_internal/old-site-baseline/pricing-2026-06-19.md | `ls` both; `grep MCP_Session_Date` = filename date |
| GIVER | catalog + reconciled test-cases MD + test-plan + XLSX | clients/encore/specs_planning/_internal/field-case-catalogs/pricing-2026-06-19.md<br>clients/encore/specs_planning/test-cases/setup/locations/locations_pricing_test_cases.md<br>clients/encore/specs_planning/test-plans/setup/locations/locations_pricing_test_plan.md<br>clients/encore/test_cases_xlsx/encore_test_cases.xlsx | `npm run check:tc-parity` exit 0 |
| BUILDER | spec + page object + data + selectors (CAD/MXN) | clients/encore/tests/locations/location-pricing.spec.ts<br>clients/encore/src/pages/locations/location-pricing.page.ts<br>clients/encore/src/data/locations/location-pricing.ts<br>clients/encore/src/selectors/locations/pricing.ts | `npx playwright test --list` resolves all TC-LOC-PRI IDs |
| HEALER | un-skip re-verify + false-green fix + bug filing + MD sync | clients/encore/specs_planning/_internal/false-green-sweeps/pricing-2026-06-19.md<br>clients/encore/reports/bugs/BUG-LOC-PRI-001.json | full spec green ×2 `--retries=0 --workers=1` |
| WATCHDOG | false-green sweep + phase-0 verification + Phase-1.5 verdict + FCC/`/audit` | clients/encore/specs_planning/_internal/false-green-sweeps/pricing-2026-06-19.md<br>clients/encore/specs_planning/_internal/phase-0-verification-pricing-2026-06-19.md | sweep + Phase-0 PROCEED + fresh-context `/audit` GREEN |
| GARDENER | structural dedup sweep | clients/encore/src/pages/locations/location-pricing.page.ts | `npx tsc --noEmit -p clients/encore/tsconfig.json` clean |
| OWNER | closure + master annotation + subsumption bookkeeping | plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md<br>plans/pending/SUBPLAN_DQU_12_F1a_PRICING_AUDIT.md<br>plans/pending/PLAN_PRICING_TEST_COVERAGE_AUDIT_AND_FIX.md | `node scripts/validate-plan-closure.mjs --enforce` C1-C6 PASS |

**Conditional-row footnote (C6 cell-form discipline)**: the HEALER row is conditional. If every skip re-enables green and no false-green needed a fix, REPLACE its Concrete-deliverable cell at closure with `(skipped: <reason ≥20 chars>)`; if any skip still fails or a false-green is fixed, the false-green-sweep + bug JSON paths are the deliverable. C6 validates the FINAL cell form: pure path(s), `(skipped:…)`, or `(none)` only.

---

## Acceptance Criteria

- [x] Phase 0 gates passed; `phase-0-verification-pricing-2026-06-19.md` verdict = PROCEED.
- [x] Phase 0.5b old-site-baseline emitted with `## Baseline diff` (baseline-absent allowed for EnableMultidayPricing/Merchant Currency, recorded honestly).
- [x] Phase 0.5fg false-green sweep emitted (12 sweeps); zero unfixed confirmed FALSE-GREEN at close (master closure gate).
- [x] Phase 1 field-inventory emitted (8 keys, 7 sections, testids complete); **currency option-set + per-currency (USD/CAD/MXN) dropdowns enumerated LIVE, not assumed**; cascade + Corporate-toggle behavior + EnableMultidayPricing placement recorded.
- [x] Phase 1.5 un-skip verdict table complete — all 7 skips classified PASSES-NOW-RE-ENABLED or STILL-FAILS-BUG-<id> (LR-021); stale TC-MD / DQU_12 claims diffed.
- [x] Phase 2 catalog: every gap-matrix cell (a)/(b)/(c); MAIN-vs-EDGE split recorded; stale TC-MD + test-plan reconciled with MCP_VERIFICATION_LOG citations; `npm run xlsx:build` OK; `npm run check:tc-parity` exit 0. Honest-zero net-new acceptable only where ledger-proven.
- [x] Phase 3: `ensureDefaultState(PRICING_DEFAULTS)` wired per-test (LR-019) + `saveAndConfirm()` added; re-enabled skips live; net-new blended at top via `saveAndVerifyCase`, no `@fcc` tag; CAD/MXN selectors+data added if rendered; individual run green `--workers=1 --retries=0`; regression-guard before/after no silent breakage.
- [x] Phase 4: FCC completeness audit GREEN; fresh-context `/review` + `/audit` (AUD-017); confirmed false-greens fixed; bugs filed for still-failing skips; combined run `--retries=0 --workers=1` green ×2.
- [x] Phase 5: dedup table executed or honestly `(skipped:…)`; typecheck clean; zero behavior change.
- [x] Phase 6: Execution Summary + C6 matrix audit + closure gate C1-C6 PASS; master annotated (cascade-SKIPPED citation verbatim); DQU_12 flipped SUBSUMED + master §DQU disposition updated; coverage-audit Part-5 left as discussion-item (HALT-and-ask before any framework-rule change); activity-log row; `git mv` + reindex; `/final-q` verdict; navigation.md registry row added.

## Out of scope (anti-rescope guard, LR-046)

- The Corporate Pricing module (`/settings/corporate-pricing`) — separate, already covered.
- `PLAN_PRICING_TEST_COVERAGE_AUDIT_AND_FIX.md` **Part 5** framework-wide planner-rule changes (PLN-043..047, WARN→HARD-GATE) — framework-pipeline scope; separate discussion-item, HALT-and-ask before any agent-rule edit.
- Multi-office observation (1605/1101) — office 1604 only (currency data uniform per user fact).
- The framework-race fix itself — spun off to the verification-first task chip.
- Advanced edge techniques (leap-year/year-rollover BVA, exhaustive pairwise, full a11y, error-guessing, Tier-2 payload assertions) — deferred to `SUBPLAN_PRICING_EDGE_P3.md`.

## Handoff (chat-only per feedback_handoff_in_chat_only.md)

Describes outcomes only (LR-039 — no obstacle claims). On close, surface: final TC count + re-enabled skip IDs + any still-bug-blocked skip IDs (with bug numbers), net-new FCC IDs (or honest-zero), Phase-1.5 verdict summary, sweep-fix list, DQU_12 subsumption + coverage-audit Part-5 disposition, and the `/final-q` verdict.

---

## Execution Summary

**Executed**: 2026-06-19 (resumed from the 2026-06-18 partial pass per the Deferral Authorization above). Identity sweep: HUNTER (Phase 0.5b/1) → WATCHDOG (0.5fg/1.5) → GIVER (2) → BUILDER (3) → WATCHDOG/HEALER (4, fresh-context) → GARDENER (5) → OWNER (6). Browser tool: Playwright CLI (multi-currency 1605 walk + save-cycle re-verification, unattended).

### Final test inventory — 38 tests (37 pricing + 1 auth setup)
- **Office 1604 describe (34 tests)**: TC-LOC-PRI-001..033, 035 (no 034 — reserved gap). 33 runtime + TC-025 skipped.
- **Office 1605 multi-currency describe (3 net-new)**: TC-036 (all 15 primary dropdowns render + enabled), TC-037 (MXN Labor select+persist), TC-038 (MXN Equipment select+persist).

### 7-skip un-skip verdict (Phase 1.5, LR-021)
6 PASSES-NOW-RE-ENABLED (TC-020 dates persist; TC-026..030 dropdown persist) — all green in the ×2 run. 1 STILL-FAILS-BUG: TC-025 (Corporate Pricing uncheck saves HTTP 200 but reverts on reload — app defect, reproduced offices 1604+1605), kept `test.skip` citing `BUG-LOC-PRI-001`.

### Net-new (a) — CAD/MXN multi-currency (the only MAIN net-new gap)
Live walk of office 1605 (2026-06-19): all 15 primary dropdowns render + enabled, but only **2 of 10** CAD/MXN dropdowns carry selectable pricing strategies — MXN Labor (100+ options) and MXN Equipment (88). The 5 CAD + 3 other MXN dropdowns render but their option lists are empty ("No pricing strategy found."), so select+persist is impossible for them. Net-new accordingly = render-all-15 (TC-036) + the 2 verified MXN persist round-trips (TC-037/038, both driven live: select → save 200 → reload → persisted → restored to unset, office left clean). Honest scope correction recorded in catalog §3 (the earlier "all 10 select+persist" assumption was wrong).

### Gap-matrix dispositions (catalog §2, every cell a/b/c)
All checkbox / cascade / date / read-only / save-dialog / currency-filter cells = (b) covered-by-existing-TC. Dropdown CAD/MXN = (a) net-new implemented. EDGE deferrals = (c) → `SUBPLAN_PRICING_EDGE_P3.md` (leap-year/year-rollover BVA, Start>End exhaustive boundary, Grid Options menu, error-guessing, Tier-2 payload assertions, full a11y, the remaining 2 LR-052 calendar poll sites). Honest-zero NOT claimed (real net-new existed).

### Build (Phase 3)
- `waitForPricingDataLoaded` rewritten: two fixed-sleep poll loops → `waitForFunction` (grid-rows readiness signal) — fixes LR-052 + the reset-perf prerequisite. The other 2 LR-052 sites stay EDGE-deferred.
- Added `saveAndConfirm()` (throws on save failure) + lean `ensureDefaultState()` (bounded-retry whole-cycle; happy path returns after reads only, no save/reload) + `clearPrimaryDropdown()` (Radix toggle-off for the MXN persist cleanup).
- Wired `ensureDefaultState(PRICING_DEFAULTS, OFFICE_NO)` into the office-aware `beforeEach`, superseding the ad-hoc Corporate-Pricing self-heal (LR-019).
- Selectors: +10 CAD/MXN keys. Data: `PRICING_DEFAULTS`, `MULTI_CURRENCY_OFFICE_NO`, `PRIMARY_PRICING_DROPDOWNS_CAD/_MXN`, `MXN_PRIMARY_PERSISTENCE_CASES`.

### Plan deviations (LR-046 — honest log; all evidence-backed, none rescoped a strict line)
1. **CAD/MXN net-new scope corrected** — only 2 of 10 dropdowns select+persist-testable (live evidence); render coverage is the honest ceiling for the 8 empty ones. Not a corner-cut.
2. **Net-new in a separate office-1605 describe** rather than blended into the 1604 describe (doctrine item 3 "blend at top") — required because the 1604 `beforeEach` hardwires office 1604. Doctrine intent preserved (no `@fcc` tag, sequential IDs, same file, not segregated-as-AI).
3. **TC-001 body simplified** to pure default-state assertions — its prior manual navigate/cleanup/save/reload baseline is now owned by the `beforeEach`; the redundant double-work was the cause of the prior 60s `beforeEach` timeout. Plan-aligned ("supersede the ad-hoc self-heal").
4. **`waitForPricingDataLoaded` LR-052 conversion done here** (catalog §2 had deferred all LR-052 polls to EDGE) — it was the load-bearing perf prerequisite for the per-test reset. The remaining 2 calendar-timing poll sites stay EDGE-deferred.
5. **Data-drift fix** — `SECONDARY_TEST_ROW`/`ECOMMERCE_TEST_ROW` (`2022-eCommerce`, `2022-NP LB1`) no longer exist in office 1604's live grid; remapped to live-verified rows (`2022-Zone 5 A`, `2022-Zone 1 A`) and renamed `ECOMMERCE_TEST_ROW` → `TERTIARY_TEST_ROW`. Surfaced by RCA of the first full-run's 3 failures (TC-008/021/022 click-timeouts); the dead rows had been silently making TC-004/006 false-pass (catch handlers returned the expected defaults).
6. **Phase 2 doc reconcile executed after Phase 3 build** — doc parity must reflect the final spec including net-new IDs. Sequencing only, not scope.

### Verification (evidence-emission)
- `ran 'npx tsc --noEmit -p clients/encore/tsconfig.json'` → output: exit 0 (clean).
- `ran 'npx playwright test location-pricing.spec.ts --list'` → output: '38 tests' (37 pricing TC-LOC-PRI IDs + auth setup; all IDs resolve).
- `ran 'npx playwright test location-pricing.spec.ts --workers=1 --retries=0'` ×2 → run A '37 passed, 1 skipped (4.6m)'; run B '37 passed, 1 skipped (4.4m)' — ×2 GREEN (HLR-007).
- `ran 'npm run xlsx:build'` → output: 'locations_pricing 37 rows; xlsx-lint PASS, vocab hits: 0'.
- `ran 'npm run check:tc-parity'` → output: 'PASS: All spec TCs are present in both markdown and XLSX deliverable.' (zero pricing divergences).
- Fresh-context `/audit` (spawned `audit` subagent, AUD-017) → **GREEN** (all hard gates pass; 2 MINOR internal-metadata notes both resolved).
- `/regression-guard` AFTER → 4 tracked pricing files changed (data/page/selectors/spec) + XLSX; no unrelated changes, no silent breaks.

### Doc changes
- `field-inventories/pricing-2026-06-19.md` (79/79 100%, CrossCheck clean), `old-site-baseline/pricing-2026-06-19.md` (## Baseline diff, BL-PRI-3), `false-green-sweeps/pricing-2026-06-19.md` (12 sweeps + 7-skip verdict), `field-case-catalogs/pricing-2026-06-19.md` (ledger + gap matrix + corrected net-new scope), `phase-0-verification-pricing-2026-06-19.md` (PROCEED).
- `locations_pricing_test_cases.md` + `locations_pricing_test_plan.md` fully reconciled (37 TCs, per-TC MCP citations, live row names); `encore_test_cases.xlsx` rebuilt.
- `BUG-LOC-PRI-001.json` baseline reclassification + verificationLog entry.

### Bugs
No new bug filed this session. `BUG-LOC-PRI-001` (filed 2026-06-18) re-confirmed + baseline-reclassified; TC-025 stays skipped against it. BL-PRI-3 (new-site 1604 primary pricebooks unset vs old-site set) recorded as a baseline data-state observation, not a bug.

### Provenance / subsumption
`SUBPLAN_DQU_12_F1a_PRICING_AUDIT.md` flipped to SUBSUMED (user triage 2026-06-15). `PLAN_PRICING_TEST_COVERAGE_AUDIT_AND_FIX.md` Parts 1-4 addressed; **Part 5 (PLN-043..047 framework planner-rule changes) left as a discussion-item — NOT actioned; requires user sign-off before any framework agent-rule edit** (plan Out-of-scope guard).

### Parent cascade
`LR-027 cascade SKIPPED per master plan §Cascade closure rules (user override 2026-05-21)` — master `PLAN_BIG_PIVOT_FCC_MASTER.md` stays PENDING; this subplan's DONE line is annotated into master §Roadmap line 111 + §DQU disposition per the per-child annotation obligation.
