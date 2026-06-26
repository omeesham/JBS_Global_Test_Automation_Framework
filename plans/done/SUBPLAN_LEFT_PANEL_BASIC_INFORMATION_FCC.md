# SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC

**Status**: DONE
**Executed**: 2026-06-03
**Priority**: P1
**Created**: 2026-06-01
**Identity**: OWNER (multi-identity by phase — HUNTER → GIVER → BUILDER → WATCHDOG → GARDENER → OWNER; HEALER conditional)
**Parent**: PLAN_BIG_PIVOT_FCC_MASTER.md
**Depends on**: SUBPLAN_NOTES_FCC_PILOT.md (DONE 2026-05-22 — paradigm infra: clients/encore/src/core/field-case-runner.ts saveAndVerifyCase)
**Blocks**: none
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: acceptEdits
**BrowserTool**: cli
**Author**: Rutvik (via Claude Opus 4.7)
**ActiveClient**: encore

co-doctrine: §False-Green Sweep Doctrine (PLAN_BIG_PIVOT_FCC_MASTER.md) — NOT a second parent (per LR-048 singular-Parent schema).

---

## Context

PLAN_BIG_PIVOT_FCC_MASTER.md §Roadmap line 102 names the left-panel FCC subplan (was `SUBPLAN_LEFT_PANEL_FCC.md`; **renamed this subplan to `_LEFT_PANEL_BASIC_INFORMATION_` per user 2026-06-01**). The left panel is the **Basic Information** tab's left card on Location Settings (`/settings/location`, office 1604).

**Current state (verified 2026-06-01 against live code + user screenshots, LR-020):**
- **14 fields** — 5 read-only (Office, Local Office, Pay To Address, eCommerce Active, Enable Productions Orders) + 9 editable (Local Office Name, Active, Live Date, Tax Mode, Country, Region, Servicing Branch Office, Line Of Business, Union). Checkboxes are `button[role="checkbox"]` with `data-state` (NOT native inputs) per `locations_left_panel_test_cases.md` + LR-036.
- **24 documented manual TCs** (`TC-LOC-LP-001..024`) at `clients/encore/specs_planning/test-cases/setup/locations/locations_left_panel_basic_information_test_cases.md` (renamed) — was **0% automated**, now 26/27 automated.
- Selector file `clients/encore/src/selectors/locations/left-panel-basic-information.ts` (renamed) — originally exported only **5 read-only field selectors** + tab-nav + Save button; 8 editable + the LOB read-only selector were added.
- **No spec, page object, test data, field-inventory, or baseline artifact** for the left panel.
- `captureLeftPanelBaseline()` / `LeftPanelBaseline` exist in `location-local-info.page.ts` (read 5 read-only fields) and are exercised by `location-local-information.spec.ts` for cross-tab invariance — reuse, do not duplicate.

**Honest gap**: the 24 TCs cover read-only "always disabled" assertions, dropdown option enumerations, the Country cascade, Save-button enable/disable, and Active/Union save-persist. They do NOT cover **save-and-reload persistence for the editable dropdowns/fields** (Tax Mode, Country, Region, Line Of Business, Servicing Branch Office, Live Date, Local Office Name) — the GIVER catalog fills exactly these gaps, de-duped by proven outcome (doctrine item 8), no filler.

**Provenance**: routed from PLAN_MD_CSV_SPEC_PARITY_AND_LOCAL_OFFICE_SPLIT.md SP07 (24 TCs, "Mark Manual-only rejected"). Deferred by user 2026-05-26 ("do not create it"); **reversed 2026-06-01** (user directive to author + automate). Sequencing: authored **independent of** SUBPLAN_LOCAL_INFORMATION_FCC (un-authored) per user 2026-06-01 — deviates from master line 93 stated order; cross-tab cases only READ live Local Information fields, requiring no Local Information FCC spec.

This subplan renames the module → `left_panel_basic_information`; the rename is a restructure touch → stale-slop enumerated in-scope per LR-050 (see Phase 5).

---

## Bootstrap

**Identity**: OWNER (sub-phases tagged via per-phase `/identity X`).
**Skills auto-called**: `/identity` (each phase boundary), `/relevant` (session start), `/regression-guard` (pre+post BUILDER and pre+post rename), `/rca` + `/bugfix` (conditional — Phase 0.5fg / Phase 4 RED), `/find-bugs` (Phase 4 adversarial pass), `/final-q` (closure, LR-042).
**Context files (load order):**
1. plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md — §Doctrine + §Roadmap + §False-Green Sweep Doctrine + §Cascade closure rules
2. plans/done/SUBPLAN_ACCOUNT_ADDRESS_FCC.md — freshest sibling (structure + v3 matrix + naming policy + state-cleanup precedent)
3. plans/done/SUBPLAN_LEGAL_FCC.md — sibling (ensureDefaultState per-test baseline reset; LGL-015 omission context at location-legal.spec.ts:257-258)
4. plans/done/SUBPLAN_SSL_FCC.md — sibling (multi-row/dialog + blend execution precedent)
5. clients/encore/specs_planning/test-cases/setup/locations/locations_left_panel_basic_information_test_cases.md — the 24 TCs (renamed)
6. clients/encore/specs_planning/test-plans/setup/locations/locations_left_panel_basic_information_test_plan.md — test plan (renamed)
7. clients/encore/specs_planning/_internal/field-case-generation.md — FCC taxonomy §2 (Plain text, Checkbox, Dropdown/combobox, Cascading dropdown, Date rows)
8. clients/encore/specs_planning/_internal/field-inventory-spec.md — 8 frontmatter keys + 7 sections
9. clients/encore/src/core/field-case-runner.ts — saveAndVerifyCase() runner
10. clients/encore/src/pages/locations/location-legal.page.ts + location-account-address.page.ts — ensureDefaultState bounded-retry pattern (commit 5c081c9) to REUSE
11. clients/encore/src/selectors/locations/left-panel-basic-information.ts — selector file (renamed)
12. clients/encore/src/pages/locations/location-local-info.page.ts — captureLeftPanelBaseline()/LeftPanelBaseline to reuse
13. clients/encore/src/selectors/index.ts — barrel (rename ripple: 4 refs)
14. clients/encore/docs/MODULE_REGISTRY + clients/encore/docs/REQUIREMENTS — module map + left-panel spec (rename targets; both gitignored agent-only docs, absent from non-agent trees)
15. clients/encore/CLAUDE.md — LR-ENC-001 (baseline truth, office 1604), LR-ENC-002 (parity structural), LR-008 (date offsets), LR-012 (shared save dialog), LR-017 (selector namespaces), LR-036 (boolean render)
16. .claude/rules/ — pipeline.md (LR-027/040/041/046/048/050/055), specs.md (LR-019 per-test baseline, LR-025 Radix large-dropdown), angular.md (LR-009/011/026), inventory.md (LR-007/013/014/015), baseline.md (LR-045), browser-tool.md (LR-038/054), data.md (LR-002 catalog↔impl parity)

**Missing context file = HALT.**

---

## Phase 0 — Dependency + browser-tool + empirical-verification gate (LR-048 + False-Green Doctrine §2 mandatory)

**[GATE-D0]** Before any work:
- [ ] plans/done/SUBPLAN_NOTES_FCC_PILOT.md frontmatter `Status: DONE` (paradigm infra shipped).
- [ ] clients/encore/src/core/field-case-runner.ts exists and exports `saveAndVerifyCase`.
- [ ] No pre-existing `location-left-panel*.spec.ts` (confirm net-new spec).
- [ ] Local run uses `.env.local` — never `CI_ENV=e2e` (LR-ENC-003).
- [ ] **Browser tool: CLI** (LR-038 v2 — catalog walkthrough 14 fields + cascade, unattended, no MFA per CLAUDE.md "no second-factor configured"; LR-054 Table 2 confirms click/fill/select/snapshot/state-save all available).
- [ ] **Empirical verification gate** (nested-orbit v2 Phase 0): page-collision / context-options propagation / trace fidelity / per-TC baseline checks. Emit `clients/encore/specs_planning/_internal/phase-0-verification-left-panel-basic-information-2026-06-03.md` with **PROCEED** verdict. PROCEED required to continue.

**HALT** if any gate fails → escalate in chat.

## Phase 0.5b — Baseline-first walk (HUNTER; LR-048 §5 + LR-045 row 1)

`/identity HUNTER`. This subplan drives TC corrections → baseline-first walk REQUIRED.
- Visit baseline `https://navigator2.training.psav.com/#/` (`/setup/locationdetail/1604`, Basic Information). Observe the left-panel fields' intended behavior (Country cascade, Save-disable conditions, field states). Observation-only — zero selector parity (LR-ENC-001).
- Emit `clients/encore/specs_planning/_internal/old-site-baseline/left-panel-basic-information-2026-06-03.md` (free-form, 5–7 sections). `baselineScope: baseline-absent` allowed for any net-new-on-e2e field (NOT a HALT).
- Produce a `## Baseline diff` classifying every observed-vs-baseline divergence: (a) regression-from-baseline, (b) intentional UX change, (c) baseline-absent.

## Phase 0.5fg — False-green pre-audit (WATCHDOG; False-Green Doctrine §3)

`/identity WATCHDOG`. Run all **11 sweeps** against the left-panel touch-surface. Since no left-panel spec exists yet, the existing target is the `captureLeftPanelBaseline()` usage in `location-local-information.spec.ts` + any bare-`page` destructure in sibling locations specs that the new spec will sit beside.
- Emit `clients/encore/specs_planning/_internal/false-green-sweeps/left-panel-basic-information-2026-06-03.md`, classifying each finding: FALSE-GREEN / PARTIAL / FLAKY-MASK / STALE-SKIP / INFLATED / STATE-LEAK / CLEAN. Honestly record `baseline-absent` for the not-yet-written spec; the binding obligation is forward-looking (Phase N below).

## Phase 1 — Field inventory (HUNTER; LR-013/014/015)

`/identity HUNTER`. Live new-site walk on **office 1604** (`/settings/location`, Basic Information):
- Confirm all **14 fields**, types, testids, enabled/disabled state. **Resolve the 1604-vs-1605 default discrepancy**: the user's screenshots are office 1605 (St. Regis SF, Live Date Nov 1 2005, Region San Francisco); the 24-TC MD is office 1604 (Parker Palm Springs, May 8 2007). Capture **office-1604** defaults fresh; record the 1605 values as a cross-reference only. Do not switch the test office without escalation.
- Verify dropdown option counts live (Tax Mode 2 / Country 4 / Region 59 / LOB 3 / Servicing Branch 215) with LR-025 large-dropdown handling; confirm Country cascade (clears Tax Mode + Region, disables Save on TaxModeID=0) and cross-tab effects (Job Costing USA-only, Remit PST Tax Canada-only).
- **Confirm the Country dropdown exists** → resolves master's "W2-08 discovery" → enables LGL-015 subsumption (Phase 5).
- Emit `clients/encore/specs_planning/_internal/field-inventories/left-panel-basic-information-2026-06-03.md` — all 8 frontmatter keys + 7 sections; testid column complete (LR-014); 14 rows; MCP_Session_Date = filename date.

## Phase 2 — Field-case catalog + TC parity (GIVER; LR-048 §6.5 GIVER row, LR-ENC-002)

`/identity GIVER`.
1. Build the **coverage ledger** (doctrine item 8): for each of the 24 TCs, list every `(field, assertion)` it proves.
2. Build the **gap matrix**: 14 fields × taxonomy (`field-case-generation.md` §2 — Plain text / Checkbox / Dropdown / Cascading dropdown / Date / read-only). Classify EVERY taxonomy cell as (a) implement net-new / (b) already-covered-by-outcome / (c) not-applicable. **Minimal-waste rule**: author (a) ONLY where the cell proves an assertion no existing TC proves. Expected net-new ≈ **save-and-reload persistence for each distinct editable field not already proven** (Local Office Name, Tax Mode, Country, Region, Line Of Business, Servicing Branch Office, Live Date) — each proves a DISTINCT field's persistence (not duplicates). DOM-tamper negative cases default to (c) low-ROI unless HUNTER found a real server-reject behavior.
3. Emit catalog `clients/encore/specs_planning/_internal/field-case-catalogs/left-panel-basic-information-2026-06-03.md` (ledger + gap matrix + final net-new list `TC-LOC-LP-025..NNN`).
4. **Rename + update the test-case MD**: `locations_left_panel_test_cases.md` → `locations_left_panel_basic_information_test_cases.md`; flip all 24 `Status` Manual→Automated (post-BUILDER) and append the net-new TCs. TC ID prefix stays `TC-LOC-LP`.
5. **Rename + update the test plan**: `locations_left_panel_test_plan.md` → `locations_left_panel_basic_information_test_plan.md`; add Scenarios for net-new TCs.
6. Rebuild the XLSX deliverable: `npm run xlsx:build` (rebuilds `clients/encore/test_cases_xlsx/encore_test_cases.xlsx`). **`npm run check:tc-parity` must exit 0.**

## Phase 3 — Build (BUILDER; LR-048 §6.5 BUILDER row)

`/identity BUILDER`. `/regression-guard` snapshot BEFORE.
1. **Selectors** — rename file `left-panel.ts` → `left-panel-basic-information.ts`, export `SetupLeftPanelSelectors` → `SetupLeftPanelBasicInformationSelectors` (keys unchanged); **add the 9 missing editable selectors** (Local Office Name, Active, Live Date trigger, Tax Mode, Country, Region, Servicing Branch Office, Line Of Business, Union) using the `button[role="checkbox"]` + `label:text-is(...) ~ ...` patterns (LR-036). Update barrel `selectors/index.ts` (4 refs). Per-context entries, no hardcoded env (per feedback_no_hardcoded_env_in_selectors).
2. **Page object** — new `clients/encore/src/pages/locations/location-left-panel-basic-information.page.ts` extending `LocationFormHelpers`/base-page; methods for read/set of the 9 editable fields + dropdown option readers (LR-025 retry for Region/Servicing Branch) + Country-cascade helper. **Reuse** `captureLeftPanelBaseline()`/`LeftPanelBaseline` (import the renamed selector export; keep the method where it is to avoid breaking `location-local-information.spec.ts`). **Reuse the `ensureDefaultState` bounded-retry baseline-reset** pattern from `location-legal.page.ts`/`location-account-address.page.ts` (commit 5c081c9) — do NOT reinvent.
3. **Test data** — new `clients/encore/src/data/testdata/locations/location-left-panel-basic-information.data.ts` (office-1604 defaults from the dated field-inventory; LR-015).
4. **Spec** — new `clients/encore/specs/locations/location-left-panel-basic-information.spec.ts`, one `test.describe('Location Left Panel — Basic Information @locations @left-panel-basic-information')`, **all 24 existing TCs automated + the net-new TC-LOC-LP-025+**. No `@fcc` tag (doctrine item 3). Each save-cycle case via `saveAndVerifyCase()` (baseline→act→save→reload→verify→cleanup). **Per-test enforced baseline (LR-019)**, NOT first-test-only.
   - **State-leak guard (CRITICAL — user "no regressions" mandate)**: every state-mutating case (Active, Union, dropdown save-persist, and especially **Country cascade** which mutates 1604's Country/Tax Mode/Region + downstream Job Costing/Remit-PST/Legal) MUST restore office-1604 defaults via `ensureDefaultState` with bounded retry on cleanup. No mutation may leak into sibling specs.
   - **No bare `page` destructure** alongside the custom fixture (False-Green closure gate). LR-051 (no OR-expr asserts), LR-052 (no fixed waitForTimeout in polls), LR-022 (no hardcoded counts) honored.
5. First run: `npx playwright test location-left-panel-basic-information.spec.ts --project=encore-locations --workers=1 --retries=0`. `npx playwright test --list` must resolve all TC IDs (24 + net-new). `/regression-guard` snapshot AFTER.

## Phase 4 — Completeness audit + false-green fix + combined verification (WATCHDOG/HEALER; False-Green Doctrine §4+§5)

`/identity WATCHDOG`. `/find-bugs` adversarial pass on the new spec.
- FCC completeness audit: every gap-matrix cell classified (a)/(b)/(c) (LR-040); every TC ↔ MD ↔ XLSX parity (AUD-003 field/selector reconciliation; ALL-071).
- **Phase N-1 false-green fix** (`/identity HEALER` if needed): fix every confirmed FALSE-GREEN from Phase 0.5fg via nested-orbit v2 §A-1 (drop bare `page`; use `<pageObject>.page`). Sync MD Status on any fix (HEALER HARD STOP #6).
- **Phase N combined verification**: full run `--retries=0 --workers=1` over the new spec + any touched sibling spec — all pass. RCA any RED via `/rca` (artifact-first) before fixing.

## Phase 5 — Structural sweep + rename ripple cleanup (GARDENER; LR-050 stale-slop IN-SCOPE)

`/identity GARDENER`. Enumerated rename + cleanup (every item in-scope — never defer):

| Old reference | New | File(s) |
|---|---|---|
| `left-panel.ts` / `SetupLeftPanelSelectors` | `left-panel-basic-information.ts` / `SetupLeftPanelBasicInformationSelectors` | selector file + `selectors/index.ts` (lines 3,21,40,74) |
| `locations_left_panel_test_cases.md` | `locations_left_panel_basic_information_test_cases.md` | test-cases dir |
| `locations_left_panel_test_plan.md` | `locations_left_panel_basic_information_test_plan.md` | test-plans dir |
| `left_panel` module entry | `left_panel_basic_information` | MODULE_REGISTRY.md, REQUIREMENTS.md left-panel section |
| `SUBPLAN_LEFT_PANEL_FCC.md` (roadmap line 102) | `SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC.md` | PLAN_BIG_PIVOT_FCC_MASTER.md (so LR-027 parent-cascade finds it) |
| LGL-015 omission comment | "covered by TC-LOC-LP-018..022 (left-panel-basic-information spec)" | location-legal.spec.ts:257-258 + master roadmap line 102 note |

- **KEEP** `captureLeftPanelBaseline()`/`LeftPanelBaseline` names (stable; renaming = importer churn) — only update their selector import. **KEEP** `TC-LOC-LP` ID prefix.
- `npm run typecheck` clean (confirms no broken imports from the rename). Lint clean. Barrel exports consistent. No dead/duplicate selectors.
- Verify rename completeness: `grep -r "left-panel\b\|left_panel\b\|SetupLeftPanelSelectors\|locations_left_panel_test"` returns only intentional/historical (done-plan audit-trail) hits.

## Phase 6 — Closure (OWNER; LR-027 + LR-040 + LR-055)

`/identity OWNER`.
1. Status → DONE + `**Executed**: 2026-06-01`.
2. `### Execution Summary`: TCs automated (24 + net-new IDs); per-TC (a)/(b)/(c) justification (STRICT-LINE-E); verification results (test pass counts, typecheck, check:tc-parity, regression-guard before/after) in evidence-emission format `ran '<cmd>' → output: '<snippet>'`; rename ripple confirmation; LGL-015 subsumption note.
3. **Per-Identity Matrix closure audit** — every cell resolves to a real path / `(skipped: ≥20 chars)` / `(none)` (C6).
4. **Parent cascade**: master stays PENDING — `LR-027 cascade SKIPPED per master plan §Cascade closure rules (user override 2026-05-21)`; annotate the DONE line into master §Roadmap (line 102).
5. Closure manifest auto-generated at `plans/_closure_manifests/SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC.md.manifest.json` (validate-plan-closure C1–C6 PASS).
6. Activity-log row (LR-028, LR-037 timestamp ≥ touched-file mtimes). `git mv` to `done/` + `npm run plans:reindex`.
7. `/final-q` verdict block (GREEN | YELLOW | RED) per LR-042.

---

## Per-Identity Satisfaction (LR-048 v3 — every cell a real path, `(skipped: ≥20 chars)`, or `(none)`)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | field-inventory + old-site-baseline | clients/encore/specs_planning/_internal/field-inventories/left-panel-basic-information-2026-06-03.md<br>clients/encore/specs_planning/_internal/old-site-baseline/left-panel-basic-information-2026-06-03.md | `ls` both; `grep MCP_Session_Date` = filename date |
| GIVER | catalog + test-cases MD + test-plan + XLSX | clients/encore/specs_planning/_internal/field-case-catalogs/left-panel-basic-information-2026-06-03.md<br>clients/encore/specs_planning/test-cases/setup/locations/locations_left_panel_basic_information_test_cases.md<br>clients/encore/specs_planning/test-plans/setup/locations/locations_left_panel_basic_information_test_plan.md | `npm run check:tc-parity` exit 0 |
| BUILDER | spec + page object + selectors + test data | clients/encore/tests/locations/location-left-panel-basic-information.spec.ts<br>clients/encore/src/pages/locations/location-left-panel-basic-information.page.ts<br>clients/encore/src/selectors/locations/left-panel-basic-information.ts<br>clients/encore/src/data/locations/location-left-panel-basic-information.ts | `npx playwright test --list` resolves all TC-LOC-LP IDs |
| HEALER | RCA-driven fixes for the 4 first-run RED failures (TC-008/009/010/025) | clients/encore/tests/locations/location-left-panel-basic-information.spec.ts<br>clients/encore/src/pages/locations/location-left-panel-basic-information.page.ts | full spec run 27 passed ×2 |
| WATCHDOG | false-green sweep + Phase-0 verification + FCC audit | clients/encore/specs_planning/_internal/false-green-sweeps/left-panel-basic-information-2026-06-03.md<br>clients/encore/specs_planning/_internal/phase-0-verification-left-panel-basic-information-2026-06-03.md | sweep verdict + Phase 4 audit GREEN |
| GARDENER | rename ripple + structural sweep | clients/encore/src/selectors/index.ts<br>export_test_cases/to-xlsx.ts | `npm run typecheck` clean; rename-completeness grep |
| OWNER | closure + master annotation | plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md | `node scripts/validate-plan-closure.mjs --enforce` PASS (C1–C6; manifest JSON not auto-emitted — user-only lock-path, see Post-Audit Correction) |

---

## Acceptance Criteria

- [ ] Phase 0 dependency + browser-tool + empirical-verification gate passed; phase-0-verification artifact verdict = PROCEED.
- [ ] Phase 0.5b old-site-baseline emitted (dated 2026-06-01) with `## Baseline diff`.
- [ ] Phase 0.5fg false-green sweep emitted; zero unfixed FALSE-GREEN at close.
- [ ] Phase 1 field-inventory emitted (14 rows, 8 keys, 7 sections); 1604-vs-1605 default discrepancy resolved; Country dropdown existence confirmed.
- [ ] Phase 2 catalog: every taxonomy cell classified (a)/(b)/(c); net-new list finalized; test-cases MD + test-plan renamed & updated; XLSX rebuilt; `check:tc-parity` exit 0.
- [ ] Phase 3: 9 editable selectors added; new spec automates **all 24 existing TCs + net-new**; per-test baseline (LR-019); state-leak guard via ensureDefaultState on every mutating case; no bare-`page` destructure; first run green.
- [ ] Phase 4: FCC completeness audit GREEN; false-green Phase N-1 fixed; Phase N combined run `--retries=0 --workers=1` all pass.
- [ ] Phase 5: full rename ripple applied (table above); LGL-015 disposition corrected — NOT subsumed, open gap now automatable (Legal comment + master roadmap + legal TC :514 updated 2026-06-03; see Post-Audit Correction); `typecheck` clean; rename-completeness grep clean.
- [ ] Phase 6: Execution Summary + Per-Identity matrix C6 + closure gate C1–C6 PASS (manifest JSON is a user-side lock-path per R2, not auto-emitted — see Post-Audit Correction); master annotated (cascade SKIPPED cited); activity-log row; reindex; `/final-q` verdict emitted.
- [ ] `/regression-guard` before/after = no silent breakage (selector rename + new spec).

## Handoff (chat-only per feedback_handoff_in_chat_only.md)

Describes outcomes only (LR-039 — no obstacle claims). On close, surface: TCs automated count, net-new IDs, LGL-015 disposition, rename confirmation, and the /final-q verdict.

---

### Execution Summary

**Executed 2026-06-03 (OWNER, per-phase HUNTER/WATCHDOG/GIVER/BUILDER/HEALER/GARDENER). Verdict: GREEN.**

**TCs automated: 26 of 27.** Spec `clients/encore/specs/locations/location-left-panel-basic-information.spec.ts` — TC-LOC-LP-001..023 (TC-016 corrected to a read-only assertion) + 3 net-new persistence TC-LOC-LP-025/026/027. **TC-LOC-LP-024 deferred (c)** — design decision (below).

**Verification (evidence-emission, LR-042):**
- ran `npm test -- --project=encore-locations location-left-panel-basic-information.spec.ts --workers=1 --retries=0` → **`27 passed (2.1m)`**, then a 2nd confirming run → **`27 passed (2.2m)`** (≥2 green, HLR-007).
- ran `npx tsc --noEmit -p clients/encore/tsconfig.json` → **exit 0** (BEFORE + AFTER the selector rename — regression-guard: 0 silent breakage).
- ran `npm run xlsx:build` → `OK → encore_test_cases.xlsx` (14 sheets, incl. `locations_left_panel_basic_info`).
- ran `npm run check:tc-parity` → **`PASS: All spec TCs are present in both markdown and XLSX deliverable.`**
- ran `npx playwright test --list` → resolves all TC-LOC-LP IDs (001-023, 025-027).
- ran rename-completeness grep (`SetupLeftPanelSelectors` / old `left-panel.ts` paths in src+specs) → **0 hits**.

**Per-TC disposition (a/b/c):** TC-001..023 = (a) implemented; net-new TC-025 Local Office Name / TC-026 Tax Mode / TC-027 Region = (a) save-persist; **deferred (c):** TC-024 cross-tab Legal-invalid (no UI "clear" on the required Radix select + Legal Path D state-leak; Save-gating already proven by TC-019), Servicing-Branch persist (required field, no "unselect" → would leak into 1604; Region persist covers dropdown-persistence), Live-Date persist (calendar multi-step + 1604 Live Date is volatile; TC-023 proves the popover). All (c) documented in the field-case catalog + test-cases MD per LR-040.

**Live corrections to the original MD/plan (LR-020 — live DOM + old-site baseline are truth):**
1. **Line Of Business is read-only/disabled in edit mode** (not editable) — confirmed by user via Encore **NM-831/NM-1140** (disabled when editing an existing location, by design). Field split corrected to **6 read-only + 8 editable** (was 5+9). TC-016 → read-only assertion.
2. **Servicing Branch = 218 options** (not 215).
3. **Live Date is volatile** on shared office 1604 (CI bots write to it — observed June 15 1990 / Sep 6 1989 / Aug 28 1989) → spec asserts the date FORMAT, not a fixed value.
4. **Local Office Name maxlength = 255** (not 50) — flagged to Encore as a question.
5. **Clearing the required name DISABLES Save** (matches the requirement; the MD's "Save enables on empty" anomaly no longer reproduces). Reverting a change is net-zero → Save disables (LR-009/LR-026).
6. **GL Service Divisions** present old-site, absent new-site (intentional removal).

**Deviations (LR-046 — all evidence-backed fix-and-log or user-confirmed, none a strict-line rescope):**
- Artifact dates **2026-06-01 → 2026-06-03** (execution slipped; backdating would falsify MCP_Session_Date + fail staleness/LR-037).
- Net-new **5 planned → 3 built + 2 deferred (c)** (no-state-leak mandate; build-time refinement noted in catalog).
- **TC-024 deferred** — flagged to the user mid-execution; user said "go continue".
- **LOB read-only** — surfaced to the user; user confirmed via Jira (NM-831/NM-1140), so no bug filed.
- **MODULE_REGISTRY.md / REQUIREMENTS.md** had no renamable `left_panel` module *slug* (REQUIREMENTS' "Left Panel" refs are accurate UI descriptions) — the plan's Phase 5 assumption was incorrect; nothing to rename there.

**Rename ripple (Phase 5):** `left-panel.ts` → `left-panel-basic-information.ts` (+ export `SetupLeftPanelSelectors` → `SetupLeftPanelBasicInformationSelectors`, barrel `selectors/index.ts` ×4, old file `git rm`'d); test-cases + test-plan MD renamed + corrected; XLSX sheet `locations_left_panel_basic_info` (+ `to-xlsx.ts` SHEET_NAMES mapping, 31-char cap); `captureLeftPanelBaseline`/`LeftPanelBaseline` + `TC-LOC-LP` prefix KEPT. **LGL-015 is NOT subsumed** by TC-LOC-LP-018..022 — corrected 2026-06-03 (see Post-Audit Correction below): those tests share the Country selector but never open the Legal tab, so the Legal-tab SC/T&C reset stays an open coverage gap (Legal spec comment + master roadmap line 102 + legal test-cases :514 all corrected to say so).

**Per-Identity Matrix closure audit (C6):** HUNTER (field-inventory + old-site-baseline -2026-06-03) ✓; GIVER (catalog -2026-06-03 + renamed MD/test-plan + XLSX, check:tc-parity PASS) ✓; BUILDER (spec + page object + selectors + data, --list resolves) ✓; HEALER (4-failure RCA + fixes landed in the spec/page object — check()/uncheck(), saveAndConfirm save-wait, pressSequentially setter, value-agnostic Live Date) ✓; WATCHDOG (false-green-sweep + phase-0-verification -2026-06-03, 2 green runs) ✓; GARDENER (selectors/index.ts + to-xlsx.ts rename ripple, typecheck clean) ✓; OWNER (this summary + master annotation; manifest JSON is a user-side lock-path, not auto-emitted — see Post-Audit Correction) ✓.

---

## Post-Audit Correction (2026-06-03)

An adversarial audit after closure found stale/false claims that this subplan's execution wrote (and the same-session self-review missed). This section corrects the record. No live-site interaction was involved — every correction is a doc/comment edit plus a local XLSX rebuild.

**1. LGL-015 is NOT subsumed — open coverage gap, now automatable.**
The original Execution Summary + Phase-5 acceptance line, the Legal spec comment, master roadmap line 102, and the legal test-cases OMITTED row all claimed TC-LOC-LGL-015 (Country change resets the Legal-tab Service Charge + Terms & Conditions) was "subsumed" by TC-LOC-LP-018..022. It is not. LP-018..022 exercise the same left-panel Country selector but only assert left-panel Tax Mode/Region clearing + the cross-tab Local-Information Job Costing / Remit-PST effects — they never open the Legal tab, so the Legal-tab reset is left unverified. Corrected at five sites: `clients/encore/specs/locations/location-legal.spec.ts`, `plans/pending/PLAN_BIG_PIVOT_FCC_MASTER.md`, `clients/encore/specs_planning/test-cases/setup/locations/locations_legal_test_cases.md`, and this subplan's Execution Summary + acceptance lines. The Country selector now exists and is proven by LP-018..022, so LGL-015 is automatable and remains an open coverage gap — a candidate for its own Legal-tab test (deferred P1).

**2. Stale test-case bodies + test-plan corrected; XLSX deliverable rebuilt.**
Six TC bodies in `clients/encore/specs_planning/test-cases/setup/locations/locations_left_panel_basic_information_test_cases.md` (TC-001/008/009/010/017/023) and the matching scenarios in `clients/encore/specs_planning/test-plans/setup/locations/locations_left_panel_basic_information_test_plan.md` contradicted the green spec — they still asserted "Save enables on empty", "stays dirty after revert", "max 50 chars", "215 options / first 0220", and a hardcoded Live Date. Aligned to the spec + data file (empty/required name → Save DISABLED; net-zero revert → Save DISABLED; maxlength 255; >200 Servicing Branch options; value-agnostic Live Date), and `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` was regenerated via `npm run xlsx:build` so the shipped workbook no longer carries the stale values.

**3. Closure manifest was never emitted — the GREEN rests on the C1–C6 gate PASS, not a manifest file.**
The OWNER Per-Identity row + Phase-6 acceptance originally read as if a closure manifest JSON had been emitted by the gate on flip. No such manifest exists (`plans/_closure_manifests/` holds none for this subplan). The manifest is a user-only lock-path (R2 per LR-055) — the agent has no write path to it. What actually backs this subplan's GREEN is `node scripts/validate-plan-closure.mjs --enforce` returning C1–C6 PASS (re-confirmed 2026-06-03). Manifest emission, if wanted, is a user-side follow-up (`npm run plans:validate-closure:write-manifest`).

**4. Scope honesty.**
These corrections make the documentation internally consistent with the green spec and the corroborating live artifacts (field-inventory, data file, the test-cases header, and the test-plan's own correction note — all of which already agreed). They do NOT independently re-prove the TC-008/009 live behavior; that is the deferred P1 clean single-worker re-run against office 1604. No live-site interaction was performed in this correction pass.

## Post-Audit Correction (2026-06-11) — Pay To Address launcher miss

This subplan's 2026-06-03 Left Panel FCC walk classified **Pay To Address** as a plain disabled textbox (testid `location-settings-input-pay-to-name`, value "Encore"). It is actually a **launcher**: the field's `<label>` opens a "Pay To List" search dialog (5 filters, sortable results table with a per-row checkbox, Select/Cancel/close-X). The miss had ZERO coverage — no dialog inventory, no TCs, no selectors, no page-object support — and the field-inventory + TC-LOC-LP-004 asserted only that the *input* is disabled (true, but blind to the launcher). Root cause: coverage was reasoned from the field's resting appearance, not its exercised affordance; the old-site baseline's BL-DIV-4 ("interactive on baseline / static on new") was closed as "intentional UX change" without a new-site click-probe.

Corrected by **SUBPLAN_LAUNCHER_DIALOG_GAPS_FCC.md** (DONE 2026-06-11, Workstream A): 10 net-new launcher TCs (TC-LOC-LP-028…037), full Pay To List dialog selectors + page-object methods, ID-anchored save-restore (Pay To selection PERSISTS), and TC-LOC-LP-004 corrected in place (KEPT its ID; launcher affordance now in its steps/notes). RCA: `clients/encore/specs_planning/_internal/rca-launcher-dialog-misses-2026-06-11.md`. Permanent prevention landed there (LR-057 affordance-probe mandate + four more structural layers). No edit to this subplan's spec/data was needed beyond the cross-reference above — the correction work lives in the launcher-dialog subplan. (Stale path note: the matrix/body paths above were also repointed `specs/`→`tests/` and `src/data/testdata/`→`src/data/` to match the 2026-06-05 POM restructure, so the closure gate resolves them.)
