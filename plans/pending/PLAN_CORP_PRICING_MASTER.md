# PLAN: Corporate Pricing — net-new module automation (DOCX-first, FCC second, edge third)

**Status**: PENDING
**Priority**: P0-EMERGENCY
**Created**: 2026-06-05
**Identity**: OWNER
**Depends on**: none
**Blocks**: SUBPLAN_CORP_PRICING_00_FOUNDATION.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: plan
**BrowserTool**: none

---

## Context

Corporate Pricing is a **brand-new, multi-page module** on the Encore e2e site (`/navigator/locations/<office>/settings/corporate-pricing`) — a peer to `locations` and `local-office`, NOT a tab inside them (LR-017: distinct URL = distinct page = distinct module). Source of truth #1 is the Jira-extracted DOCX (`Pricing-Functional Details-JIRA STORIES 1.docx`, 5 stories: NM-1445/1440/1441/1443/1444). Source #2 is a hand-built helper workbook (`jira_pricing_test_cases.xlsx`, 110 DOC-DERIVED + FCC-tagged cases) — **treated as helpers to verify/correct on live DOM, never as gospel**. The goal: automate **everything the DOCX describes** for the screens that are actually built, then add the FCC field-coverage matrix, then edge cases — in that strict priority order, delivering P1 completely first to protect the deadline.

This plan was authored after a **live read-only recon of the e2e site** (2026-06-05, `playwright-cli -s=encore` on `clients/encore/.auth/encore-state.json`). The recon grounds every scope decision below, BUT it is **provisional until S0 emits the dated `walk-evidence-corporate-pricing-2026-06-05.md` artifact** (F19): the Divergence Ledger D1–D8 are recon *findings*, not yet artifact-backed, and the gated deferrals (1440 not-built, 1444 absent) become load-bearing only after S0 confirms them on live DOM. No assumptions are *baked in* — every divergence is re-verified in S0 before any P1 assertion depends on it.

**Provenance**: user emergency directive 2026-06-05 — "automate this new page at any cost, without messing anything up, all identities satisfied, high quality, no rushed shit; DOCX is prio 1, FCC prio 2, edge prio 3; deliver prio 1 first then the rest from behind."

---

## Bootstrap

**Identity**: OWNER (plan authoring + module registration). Child subplans run their own pipeline identities (HUNTER/GIVER/BUILDER/HEALER/WATCHDOG/GARDENER) per their frontmatter.

**Skills auto-called**: `/identity` (gate), `/execute` (per child), `/ultra-agents` (goal-scoped cap lift for parallel submodule execution), `/audit` (closure), `/final-q` (each child exit).

**Context files**:
- `.claude/rules/pipeline.md` (LR-020, LR-027, LR-040, LR-041, LR-046, LR-048, LR-049, LR-050)
- `.claude/rules/plan-closure.md` (LR-055 C1–C6)
- `.claude/rules/baseline.md` (LR-045 baseline-first; baseline-absent path)
- `.claude/rules/browser-tool.md` (LR-038 v2, LR-054 — CLI default)
- `.claude/rules/inventory.md` (LR-007/013/014/015 field-inventory discipline)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership, ALL-* rules)
- `clients/encore/CLAUDE.md` (LR-ENC-001 baseline truth, LR-ENC-002 FCC parity, LR-ENC-003 env, LR-008/012/017/036)
- `clients/encore/specs_planning/_internal/field-case-generation.md` (FCC taxonomy)
- `clients/encore/specs_planning/_internal/field-inventory-spec.md` (artifact schema)

---

## Doctrine (every child subplan obeys)

1. **Priority is strict and horizontal.** P1 = DOCX functional coverage across ALL built screens, delivered and green FIRST. P2 = FCC field-coverage matrix (BVA / negative / save-cycle / each-option). P3 = edge (compound filters, virtualization stress, drag-drop edges, cross-field, a11y, RBAC). We do not start P2 until P1 is green; we do not start P3 until P2 is green. "Rest from behind, not all at once."
2. **DOCX intent is gospel; live DOM wins for assertions; every divergence is RAISED, never silently absorbed.** For every DOCX-named primary element (each column, each tab, each nav link / route-param), the child MUST (a) **verify the element is present / covered** — the non-negotiable gospel-coverage obligation; (b) **assert live reality** so the test is green (never a deliberately-failing test for a non-defect); and (c) **raise the divergence as an `/encore-questions` clarification** (ALL-078), or file per LR-034 if it looks like a real defect. Silently encoding the live shape as the expectation (e.g. "assert 9 columns", "assert History absent") is FORBIDDEN where it overrides a DOCX primary requirement. **No DOCX "Must" may be bare-deferred** — a deferral requires coverage now OR a grep-verifiable line item in an existing `plans/pending/` recipient (LR-040(b)). The DOCX remains the oracle for *intent* on ambiguous cases. **FCC field-testing extends this duty (added 2026-06-08).** The same raise-or-file obligation applies to ANY suspicious or buggy behavior an agent notices while exercising an ordinary FCC field case — not only DOCX-named divergences. Default to honest classification: record an open question (`/encore-questions`) when the cause is unclear (permission-lock? missing interaction step?), and file per LR-034 only once it reproduces in the runner (LR-044) — never false-file, never silently absorb. At minimum, catch the bugs visible in the cases being run. (W15-0 modeled this exactly: it raised Q-WV15-1 rather than mis-filing the non-reacting Override fields as a bug.)
3. **Baseline-absent, not baseline-skipped.** Corporate Pricing is net-new on e2e with no old-site (nav2) equivalent. Each baseline-touching child records `baselineScope: baseline-absent` per LR-ENC-001 — this is NOT a HALT.
4. **Sparse-testid reality drives the selector strategy.** The live module has near-zero `data-testid` coverage (Search page: 5 `e2e-*` testids; Details/Strategy/Detail pages: 0). Selectors are text/role/structure/grid-column-header anchored, with content-anchored row lookup (per `feedback_history_content_anchored_lookup.md`), NOT `data-testid`. This is the single biggest difference from the Location Settings modules and is a first-class design task in S0. Any missing-testid gaps that block automation are reported to the Encore team per LR-029 (verify on live DOM, never from selector files alone).
5. **Helpers, not gospel.** The 110 XLSX cases seed GIVER. GIVER verifies each against live DOM, corrects every `[ASSUMPTION]` flag, re-IDs to the repo convention (`TC-LOC-CPR-NNN` — a planning convention validated only by `check-tc-parity.ts` `TC_PATTERN` for set-membership; NOT defined by `tc-authoring-rules`, which is text-hygiene only — F9), and drops/adds cases as live reality dictates.
6. **All identities, every screen.** HUNTER (intake/baseline-absent/requirements) → GIVER (field-inventory + test-cases + test-plan + catalog + XLSX) → BUILDER (selectors + page object + test data + specs) → HEALER (RCA + fix) → WATCHDOG (parity + audit) → GARDENER (dedup/structural). No identity skipped; FCC parity is structural per LR-ENC-002 (MD + test-plan + XLSX land in the SAME change as the spec — never "later").
7. **Mutation safety.** e2e is the test environment (whole env is fair game), but real-looking data exists (591 pricebooks in office 1604). Read-only assertions run against existing data. Save-cycle / mutation tests run against a designated fixture and restore it with a bounded-retry `ensureDefaultState()`. **S0 designates TWO distinct fixtures (F1): `strategyFixture` (S2 only) + `detailFixture` (S3 only)** — different pricebook records, so the parallel `cpr-mgmt`/`cpr-detail` sessions AND the `workers:2` S4 suite run never mutate the same row. Never mutate arbitrary production-like books. (Wave-1.5 pages each get their own dedicated fixture, same isolation rule.)
8. **JIRA/DOCX is PARTIAL (user 2026-06-08).** The ticket describes only *some* of what's built; the **LIVE DOM is the complete oracle**. Verify each page's build-status on the live walk — "not in the ticket" ≠ "not built", and coverage is never limited to DOCX-named elements. (This is why **1440 is unblocked** — S0/D3 already confirmed it BUILT.)

---

## Divergence Ledger (live recon 2026-06-05 — the grounding)

| # | DOCX says | Live e2e shows | Disposition |
|---|---|---|---|
| D1 | Search table = 8 columns incl. "Productions Currency" | **9 columns** (live splits "Productions Currency" → `Is Productions` + `Currency`) | Per Doctrine 2: cover all 8 DOCX-named columns (verify present), assert the live count, and RAISE the 8↔9 split as an `/encore-questions` clarification (likely benign UI expansion, not a defect). Provisional pending S0 re-verify (F2a/F19). |
| D2 | Filtering is client-side, "no API calls" | Page has a **Search button** + Reset; 591 items; virtualized grid | GIVER VERIFIES via `playwright-cli network` whether typing filters client-side vs Search-button calls server. Classify; don't assume. |
| D3 | "New Pricing" / "Price Over-ride" links; New Pricing **MUST pass equipment/labor route-param** (R1445-4, line 18); URLs "to be created"/"TBD" | Buttons **present** (`New`, `Pricing Override`, plus `Loc Pricing Export/Import`, `Export`, `Import`, `Grid Options`); "New" click did **not navigate** in recon | NM-1440 **likely-not-built** → S0 confirms (F19). Route-param "Must" (F2c): IF S0 finds New Pricing navigates with a param, S1 asserts equipment/labor route-param as P1; ELSE defer to gated `SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK.md` stub with the DOCX line-18 citation (grep-verifiable, F18). Extra buttons → presence/affordance P1, deeper behavior P3. |
| D4 | Pricebook Management entry = click a price-book link | Confirmed: clicking a grid name → `/corporate-pricing/details/<guid>`, title "Pricebook Details" | Built. S2 scope. |
| D5 | Management tabs = Pricing Strategy / Pricing Detail / **History** | Live shows **Pricing Strategy + Pricing Detail only** — no History tab | Per Doctrine 2: cover the DOCX 3-tab intent, assert the live 2 tabs, RAISE History-absent as an `/encore-questions` clarification (the DOCX itself labels History "(Placeholder) NM-1444", so live-absent is expected-not-yet-built, not a defect). Gated `SUBPLAN_CORP_PRICING_1444_HISTORY.md` stub (F18). Provisional pending S0 (F19). |
| D6 | Pricing Details grid: Override Price, Override Discount, Base Price; detail API returns base price, **staging price**, max allowed discount (R1441-13) | Live grid headers: `ID, Product Group Name, Price, New Price, Max Discount` (Base→`Price`, Override Price→`New Price`, Override Discount→`Max Discount`; DOCX "staging price" → `New Price` — F14) | Live wins. GIVER maps doc terms→live headers, incl. the staging-price→New-Price mapping. |
| D7 | (implied normal page) | Pricing Detail tab has **~3707 draggables, ~4861 inputs**, virtualized — extremely heavy | S3 is HIGH complexity; virtualization + content-anchored reads mandatory (LR-053). |
| D8 | Rich data-testids (assumed from other modules) | **5 testids on Search (`e2e-*`), 0 on Details/Strategy/Detail** | Selector strategy = text/role/grid-header/content-anchor (Doctrine 4). |
| D9 | (not in DOCX) | **"Pricing Override" → "Product Group Override" screen is LIVE** (Equipment/Labor tabs, location + currency filters, Active-only, 9-col grid incl. `Override Price` / `Max Discount %`, Save/Export/Import). Wave-1 deferred its button as "URL: TBD" (D3) — **destination now BUILT** (recon-stale). | **Wave-1.5 (WV1.5-0/A)**: live = oracle, full FCC; RAISE **Q-WV15-1** (undocumented screen — story ID NM-1442? intended Override-Price/Max-Discount validation?). Re-confirm BUILT on walk. |
| D10 | (not in DOCX) | **Export ▾ / Import ▾ each expose 4 variants** (`All Equipment Pricing`, `All Labor Pricing`, `All Equipment Max Discount`, `All Labor Max Discount`); `Loc Pricing Export/Import` + `Grid Options` present | **Wave-1.5 (WV1.5-B)**: trigger+variant FCC; RAISE **Q-WV15-2** (undocumented variant behavior/format); real file I/O round-trip → EDGE_P3. |

---

## Roadmap (children)

### Wave 0 — Foundation (sequential, blocks everything)
- **[SUBPLAN_CORP_PRICING_00_FOUNDATION.md](../done/SUBPLAN_CORP_PRICING_00_FOUNDATION.md)** — **DONE 2026-06-05** — P0-EMERGENCY. HUNTER intake (baseline-absent artifact, MODULE_REGISTRY.md verify/reconcile [NOT REQUIREMENTS.md — agent-read-only, F17], `agent-queue.json` entry) + live field-inventory walk of all 3 built screens + confirm 1440/1444 build status + designate **two** mutation fixtures (F1) + BUILDER shared scaffolding (module dirs, selector namespace + grid/text/role strategy, base page object [`corporate-pricing.page.ts`, F3] with route+tab navigation, fixtures wiring, common test-data file). **Blocks S1/S2/S3.** _Outcome: D1–D8 live-verified; **D3 CORRECTED — NM-1440 New Pricebook is BUILT** (route-param `?type=equipment|labor`); NM-1444 History absent; scaffolding typecheck-green._

### Wave 1 — P1 DOCX functional coverage (parallelizable, one subagent per screen)
- **[SUBPLAN_CORP_PRICING_1445_SEARCH_P1.md](../done/SUBPLAN_CORP_PRICING_1445_SEARCH_P1.md)** — **DONE 2026-06-05** — 18/18 `TC-LOC-CPR-001..018` green ×2 (`--workers=1 --retries=0`); parity + LR-ENC-004 lint clean. _Live findings: Corporate Pricing is **React/Next.js** (not Angular); **D2 — filtering is SERVER-SIDE on the Search button, NOT client-side per DOCX** (raised `/encore-questions`); **D1 — 8 DOCX cols → 9 live** (Productions Currency split) raised; 30 helpers classified 27→P1 / 3 (b)→FCC-P2 (007/008/030) / 1 (c) Price-Override-dest "URL TBD". Original scope: Search/filter/results-table, Reset, client-vs-server classification, columns (8 DOCX + live 9 + 8↔9, F2a), boolean cells, nav-button + New-Pricing route-param (F2c), row→details (D4); verified the 30 XLSX 1445 helpers._
- **[SUBPLAN_CORP_PRICING_1441_MGMT_STRATEGY_P1.md](../done/SUBPLAN_CORP_PRICING_1441_MGMT_STRATEGY_P1.md)** — **DONE 2026-06-05** — 25/25 `TC-LOC-CPR-101..125` green (fixture restore proven across 3 runs); rows parity-clean (spec↔MD 1:1 + LR-ENC-004 lint-clean), global parity → S4. _Original scope: Details route, read-only header, tabs render, strategy list/columns/location-mapping, strategy select/edit/add/remove (isNew Remove logic), dirty/clean, Save batch; verified the 25 XLSX 1441 helpers._
- **[SUBPLAN_CORP_PRICING_1443_PRICING_DETAIL_P1.md](../done/SUBPLAN_CORP_PRICING_1443_PRICING_DETAIL_P1.md)** — **DONE 2026-06-05** — 20/20 `TC-LOC-CPR-201..220` green ×full-suite (Management mode; override restore proven + `detailFixture` CLI-verified clean, no drift); 30 helpers classified 13 mgmt-P1 / 10 New-Pricebook-mode→1440 / 6 numeric-FCC→1443_DETAIL_FCC_P2 / 2 expand-collapse→clarification; parity + LR-ENC-004 lint clean. _Live findings: New Price = staging override → becomes Price on Save; Save dialog-gated + batch-commits-all-rows; grid FLAT (no item hierarchy in mgmt mode, CPR-DETAIL-Q3); New-Price-only edit doesn't reliably enable Save (CPR-DETAIL-BUG-A candidate). Original scope: product-group source list, grid, edit New Price/Max Discount, Base Price read-only, Save; Management-mode defensive (no double-click/drag add)._

### Wave 1 closure
- **[SUBPLAN_CORP_PRICING_99_AUDIT_CLOSURE.md](../done/SUBPLAN_CORP_PRICING_99_AUDIT_CLOSURE.md)** — **DONE 2026-06-05**, Wave-1 closure: DO-OR-DIE multi-agent audit (8 dimensions B1–B8, fresh-context adversarial skeptics ≥3/PASS) → VERIFIED-CLEAN after one full remediation round (10 defects fixed at MD-source / tooling / page-object / draft layers, re-audited fresh-context). 64 passed (63 `TC-LOC-CPR-*` + auth-setup), 0 fail/flaky/skip from this-run deduped summary; parity 63=63=63 + LR-ENC-004 workbook lint clean; GARDENER dedup → 5 shared primitives in `CorporatePricingBasePage` (typecheck clean); missing-testid report filed (LR-029). P1 milestone delivered — parent stays PENDING per F16.

### POM restructure (between waves — DONE)
- **[PLAN_ENCORE_POM_RESTRUCTURE.md](PLAN_ENCORE_POM_RESTRUCTURE.md)** — landed after Wave-1. `clients/encore/` moved to standard POM shape: `specs/`→`tests/`, `src/data/testdata/<mod>/*.data.ts`→`src/data/<mod>/*.ts`, `src/infra/fixtures.ts`→`src/fixtures/pages.fixture.ts`, `src/core/{base-page,field-case-runner}`→`src/pages/base.page.ts` / `src/utils/`. Wave-1 code rode the move (tsc-gated); **all Wave-1.5+ children author into POM shape** and carry a Phase-0 POM-shape gate (HALT if half-moved).

### Wave 1.5 — full FCC for every built page (runs BEFORE Wave 2; F-WV15)
The priority wave: each built page gets full per-field FCC, driven by the LIVE walk (Doctrine 8 — JIRA is partial), divergences RAISED (ledger D9/D10). TC bands `5NN` (Override) / `6NN` (toolbar I/O) / `3NN` (New Pricebook):
- [SUBPLAN_CORP_PRICING_W15_0_RECON.md](../done/SUBPLAN_CORP_PRICING_W15_0_RECON.md) — **DONE 2026-06-08**, recon walk (Override + toolbar) + 2 dated field-inventories + Override scaffold (page object/selectors/data/fixture, typecheck-clean) + Q-WV15-1/2 raised. Confirmed Override **BUILT** at `/pg-override` (10-col grid — recon said 9, +Updated By; Active = Radix checkbox, **LR-036 4th render format**; edit-activation unresolved → W15-A). Blocks W15-A/B.
- [SUBPLAN_CORP_PRICING_W15_A_OVERRIDE_FCC.md](../done/SUBPLAN_CORP_PRICING_W15_A_OVERRIDE_FCC.md) — **DONE 2026-06-09** — Product Group Override full FCC. **Q-WV15-1 RESOLVED** (grid IS editable for the automation user — the recon's "inert cells / RBAC" was a false negative); 28 `TC-LOC-CPR-501..528` green ×2 (29 individual + 122-test CPR suite clean, no contamination); full save-cycle via `saveAndVerifyCase()` + `ensureDefaultState()` restore (no drift). Live findings: edit = click-cell→spinbutton→native-set+Enter; Save dialog matched via CSS `[role=alertdialog]` (Playwright `getByRole` misses it); **Max Discount % capped at 100**; LR-036 4th render (Radix checkbox). 7 Jira-lead verdicts recorded (NM-1463/2126/1870/1889/1675/1932/1961 — none filed). Parity + workbook lint clean.
- [SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK.md](../done/SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK.md) — **DONE 2026-06-09** — **core "add" JIRA story, de-gated → PRIORITY** (BUILT per S0/D3): New Pricebook create flow, FCC each option (Equipment / Labor); 25 XLSX helpers (+`1443-010`) verified → 30 green `TC-LOC-CPR-301..330` (×2: individual + full-suite), no-commit (create is UI-irreversible), 5 divergences raised (CPR-1440-Q1..Q5). XLSX/parity-green deferred to chip `task_6ac2db33` (pre-existing cross-module vocab + MGH-md debt, not this subplan). Self-closed via its own Phase-4 audit.
- [SUBPLAN_CORP_PRICING_W15_B_TOOLBAR_IO_FCC.md](../done/SUBPLAN_CORP_PRICING_W15_B_TOOLBAR_IO_FCC.md) — **DONE 2026-06-09** — Search toolbar I/O trigger-level FCC. 17 green `TC-LOC-CPR-601..617` ×2 (individual + the 139-test CPR suite, 0 fail/flaky/skip). Export ▾ 4 variants → `pricing-export?isLabor&isMaxDiscount&locale=en-US` (Q-WV15-2 / NM-1604 confirmed-live); Import ▾ 4 variants → custom "Import …" upload dialogs (NOT a native chooser, no network on trigger); Loc Pricing Export → `location-export`; Grid Options = `aria-label` icon button → column toggle + persist-on-reload + restore. Real file I/O round-trip deferred to EDGE_P3 (LR-040(b)). Parity + lint clean.
- [SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md](../done/SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md) — **DONE 2026-06-09** — Wave-1.5 do-or-die multi-agent audit (mirrors S4) of the new-scaffold subplans (Override + toolbar). **VERIFIED-CLEAN after 2 remediation rounds**: round-1 found B1 (XLSX internal-jargon leak in client-facing cells); round-2 fresh-context skeptics found B7 (`ovrBtnGridOptions` shipped the known-broken `:text-is("Grid Options")` for an sr-only icon button → corrected to `aria-label`, live-Override-AX-grounded + LR-029) + B2 (LR-019 per-test value baseline missing on the override edit-behavior describe). All 3 found-and-fixed this session; full Wave-1.5 suite 46/46, override edit-behavior 9/9, parity+lint+typecheck clean. Annotates this master "P1.5 milestone"; does NOT flip (F16).

### Wave 2 — FCC field-coverage (lightweight PENDING **stubs authored now** for grep-verifiable deferral per LR-040(b)/F18; full test design AFTER Wave 1 closes — needs P1's live field-inventories, so detailing now would be assumptions). **Now gated on Wave-1.5 closure (W15_99) — runs after Wave 1.5.**
- [SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2.md](../done/SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2.md) — **DONE 2026-06-10**, 12 `TC-LOC-CPR-019..030` green ×2 (Pricebook BVA/special/whitespace, Strategy no-match, Currency/Location each-option, Is Internal/Labor/Active Only toggle+revert, reset idempotency, combined multi-filter); §2.1 rejection-affordance oracle on every BVA; full query-param contract live-verified (corrected P1's `strategyName`→`pricingStrategyName`, added `currencyId`/`locationNo`); parity+lint+typecheck clean; S1's `(b)` deferrals discharged. The full CPR suite carries 11 out-of-scope failures from a live toolbar I/O behaviour change (W15-B re-verify spawned `task_054e2fe7`) — not this Search work.
- `SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md` — multi-row FormArray (strategies add/edit/remove/delete-all), save-cycle revert (LR-009), each strategy-type option.
- `SUBPLAN_CORP_PRICING_1443_DETAIL_FCC_P2.md` — numeric BVA/negative/save-cycle for New Price + Max Discount (per `field-case-generation.md` numeric row), empty→Base-Price fallback, currency-format validation, read-only Base Price.

### Wave 2.5 — Cross-field/cross-page dependency map (blocks Wave 3; F-DEP)
- `SUBPLAN_CORP_PRICING_PRE_EDGE.md` — GIVER live walk that maps EVERY Corp Pricing field's within-page + cross-page dependencies into one auditable artifact (every field classified `depends-on` / `independent-verified` / `blocked-pending-question` — no misses per LR-031), ingesting the 5 existing field-inventories as seed (no re-mapping) and raising/filing bugs per Doctrine 2. **Depends-on the 3 Wave-2 FCC subplans; blocks EDGE_P3**, which consumes the map to author its cross-field integration tests. Carries CPR-DETAIL-BUG-A + Q-WV15-1.

### Wave 3 — Edge (lightweight PENDING **stub authored now** per F18; full design AFTER Wave 2)
- `SUBPLAN_CORP_PRICING_EDGE_P3.md` — compound multi-filter, 591-row virtualization stress + content-anchored integrity, drag-drop edge (when 1440 ships), cross-field, accessibility, **Export/Import real file I/O round-trip (deferred from Wave-1.5 WV1.5-B; trigger+variant + Grid Options owned by Wave-1.5, NOT re-covered)**, RBAC (Revenue Management role gate).

### Gated (lightweight PENDING stub; activate full design when its screen ships)
- `SUBPLAN_CORP_PRICING_1444_HISTORY.md` — GATED on a History tab existing (D5). *(1440 de-gated → Wave-1.5 priority, BUILT per S0/D3.)*

---

## Execution model (how Wave 1 actually runs — `/ultra-agents` goal-scoped)

- **S0 first, alone** (blocking). Run in the main Opus session or one Opus subagent; it produces the shared scaffolding + field-inventories every Wave-1 child consumes.
- **S1/S2/S3 in parallel**, one **Opus subagent per screen** (the user's "one subagent per submodule" vision). Recon proved **Opus and Haiku subagents spawn; Sonnet currently hits a 1M-context credit gate**. So: Opus subagents do the live-walk/field-inventory/RCA/judgment work (Opus-only per model guardrails); Haiku subagents do mechanical fan-out only (file scaffolding copies, snapshot capture). If the user enables usage credits, Sonnet `hi` can take deterministic BUILDER codegen — until then, Opus covers it.
- **Per-subagent browser sessions**: each parallel subagent uses its own `playwright-cli -s=<screen>` session (`-s=cpr-search`, `-s=cpr-mgmt`, `-s=cpr-detail`) to avoid collisions; all load `clients/encore/.auth/encore-state.json`.
- **Spec runs**: `npm test` locally (LR-ENC-003 — `.env.local`, never `CI_ENV=e2e`). Run the individual new spec first, then the suite (per `feedback_always_run_individual_first.md`).
- **S4 closure** after S1–S3 are green.

---

## Per-Identity Satisfaction

(F12 — the master is an ORCHESTRATOR; it authors no test artifacts itself. Every identity's concrete work is delegated to a child subplan and proven by C6 at that child's closure. This matrix records the delegation honestly per LR-048 v3 / C6 — proving all 7 identities are accounted for, per your "all /identity works, nothing skipped" demand.)

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (delegated to S0) | `(skipped: HUNTER intake — baseline-absent + walk-evidence + queue — delivered by SUBPLAN_CORP_PRICING_00_FOUNDATION.md; master authors none)` | child closure C6 |
| GIVER | (delegated to S1/S2/S3/S4) | `(skipped: field-inventories + test-cases + test-plans delivered by S1/S2/S3, parity by S4; master authors none)` | `npm run check:tc-parity` exit 0 |
| BUILDER | (delegated to S0/S1/S2/S3) | `(skipped: scaffolding by S0, selectors/pages/specs by S1/S2/S3; master authors no code)` | `npm run typecheck` exit 0 |
| HEALER | (delegated to S1/S2/S3) | `(skipped: conditional RCA/fix by S1/S2/S3 on first-run failures only; master authors none)` | child suite green |
| WATCHDOG | (delegated to S1/S2/S3/S4) | `(skipped: per-child Phase 4 + S4 neutral-eye/parity/false-green; master authors no findings)` | `npm run check:tc-parity` exit 0 |
| GARDENER | (delegated to S4) | `(skipped: dedup sweep by S4 per ALL-026 if 2+ repetition; master authors no refactor)` | `npm run typecheck` exit 0 |
| OWNER | master plan closure + parent cascade | `plans/pending/PLAN_CORP_PRICING_MASTER.md` | LR-027 Execution Summary present at DONE-flip |

### Per-module delivery map (screen × identity → owning child)

| Screen | HUNTER | GIVER | BUILDER | HEALER | WATCHDOG |
|---|---|---|---|---|---|
| Foundation (all) | S0 (baseline-absent + registry verify + queue + inventories — NOT REQUIREMENTS, F17) | S0 (inventory shape) | S0 (scaffolding) | (none) | S0 self-audit |
| 1445 Search | S0 inventory | S1 | S1 | S1 | S1 + S4 |
| 1441 Mgmt/Strategy | S0 inventory | S2 | S2 | S2 | S2 + S4 |
| 1443 Pricing Detail | S0 inventory | S3 | S3 | S3 | S3 + S4 |
| Product Group Override (Wave-1.5) | W15-0 inventory | W15-A | W15-A | W15-A | W15-A + W15-99 |
| Toolbar I/O (Wave-1.5) | W15-0 inventory | W15-B | W15-B | W15-B | W15-B + W15-99 |
| Closure (parity/dedup) | (none) | S4 (Wave-1) / W15-99 (Wave-1.5) | (none) | (none) | S4 + W15-99 + GARDENER |

---

## Stale-slop / housekeeping (LR-050 — net-new module, minimal but enumerated)

This is additive (new module), not a restructure, so there is little to retire. The required housekeeping IS in-scope and enumerated:
1. **Register the module**: verify/reconcile the existing `corporate-pricing` row in `clients/encore/docs/MODULE_REGISTRY.md` (S0 — already present at line 27, F10). Functional facts go to walk-evidence + queue, **NOT `REQUIREMENTS.md`** (agent-read-only per its own header line 5, F17).
2. **Selector namespace isolation** (LR-017): new dir `clients/encore/src/selectors/corporate-pricing/` + namespace `CorporatePricingSelectors`, registered in `src/selectors/index.ts` (`buildAllSelectors` collision boundary). MUST NOT touch the existing `selectors/locations/pricing.ts` (that is the per-location *Pricing tab*, a different module — confirmed via grep 2026-06-05).
3. **Plan registration**: `npm run plans:reindex` after authoring + after each child closes; parent-cascade per LR-027.
4. **No `cp -r`, ship via git-archive only** (LR-049) — not in scope for this plan (no delivery step), noted for downstream.
5. **Wave-1 closure adjacent-sweep (deferred to the Wave-2 GARDENER pass — APPEND per Phase 2.5 / LR-040(b); grep-verified non-blockers from the S4 DO-OR-DIE audit, classified CLEAN on B3/B4/B5 but flagged as optional polish).** Executed by the FCC subplans that already touch these exact files; no behavior change:
   - `clients/encore/src/selectors/index.ts:106-108` — the ALL_SELECTORS-exclusion comment names `btnSearch`/`btnReset` as "colliding" Location-Settings keys; correct the comment to name keys that actually exist in the location partitions (comment-only; no selector-code impact). → `SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2.md`.
   - `clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts:29` — `open(office: string = '1604')` literal default → `CORPORATE_PRICING_COMMON.office` (behavior-identical today: base `gotoSearch` already config-defaults and the constant resolves to `1604`; removes the duplicate literal). → `SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2.md`.
   - normText idiom `(await x.innerText()).replace(/\s+/g,' ').trim()` repeated 8× across the 3 CPR page objects (detail 1 / search 5 / base 2) — optional consolidation into a `protected normText(s)` base helper alongside `readAllTexts` (ALL-026 micro-dedupe; the major repetitions were already extracted in the S4 dedup). → `SUBPLAN_CORP_PRICING_1443_DETAIL_FCC_P2.md` (touches the heaviest reader set).

---

## Acceptance criteria (this master plan)

- [ ] All Wave-0 + Wave-1 child subplans authored in `plans/pending/` and LR-048-structurally-valid per `/planning` Step 3 + `/audit` §REVIEW 2.6 + closure-check C6 (NOT `check-subplan-identity.mjs`, which only checks identity↔§2 ownership and skips when no `## Artifacts produced` heading exists — F7).
- [ ] Dependency graph acyclic: S0 blocks S1/S2/S3; S1/S2/S3 block S4.
- [ ] Wave-2/Wave-3/gated children authored as **lightweight PENDING stubs** so every deferral is grep-verifiable per LR-040(b) (F18); full design deferred by Doctrine 1.
- [ ] `## Per-Identity Satisfaction` matrix present + C6-valid (proves all 7 identities accounted for — F12).
- [ ] `npm run plans:reindex` clean; each child `**Parent**: PLAN_CORP_PRICING_MASTER.md`.
- [ ] Divergence Ledger reflected in each child's GIVER verification steps; D1–D8 confirmed against live DOM in S0 before any P1 assertion depends on them (F19).
- [ ] Activity-log row per LR-028; `/final-q` verdict block per LR-042 at master closure.

---

## Closure & parent-cascade (LR-027)

Auto-close exemption: **YES (F16 — user directive: P1 first, THEN FCC, THEN edge; the module is NOT "done" after only P1).** This parent stays PENDING until **Wave-1.5 (newly-surfaced nodes) AND Wave-2 (FCC) AND Wave-3 (edge) are authored AND closed** — not when only Wave-1 (P1) closes. (Precedent: `PLAN_BIG_PIVOT_FCC_MASTER` §Cascade closure rules — user-authorized auto-close suppression under LR-027.) When Wave-1 closes, S4 records a **"P1 milestone delivered"** annotation in this body but does **NOT** flip the parent to DONE; the FCC + edge stub subplans remain pending and gate closure. Each child annotates its DONE line in this body while this parent is still in `plans/pending/`. The parent flips to DONE only when the LAST pending `SUBPLAN_CORP_PRICING_*` across all three waves closes.

### ✅ P1.5 milestone delivered (2026-06-09)

Wave-1.5 (the newly-surfaced built nodes — **Product Group Override full FCC** + **Search toolbar I/O FCC**) is **complete, audited do-or-die, and parity-clean**. The parent remains **PENDING** per F16 — this annotation records the milestone, it does NOT close the module.

- **Coverage**: 45 `TC-LOC-CPR-*` automated + green — Override `501–528` (W15-A, 28) + Toolbar I/O `601–617` (W15-B, 17). Full Wave-1.5 suite **46 passed**, 0 fail / flaky / skip (fresh run).
- **Parity / deliverable**: spec ⊆ MD `628` = XLSX `628` (`check:tc-parity` exit 0); workbook builds + lints clean (LR-ENC-004); shipped workbook re-scanned → 0 internal-jargon tokens.
- **Closure audit**: W15-99 DO-OR-DIE multi-agent `Workflow` audit (9 dimensions, fresh-context, ≥3 adversarial skeptics per PASS) → **VERIFIED-CLEAN after two remediation rounds**. The skeptics caught 3 real defects the single-pass missed — **B1** (XLSX jargon leak), **B7** (`ovrBtnGridOptions` broken sr-only `:text-is` selector → `aria-label`, live-AX-grounded), **B2** (LR-019 per-test value baseline) — all found-and-fixed this session, then re-verified (suite 46/46, edit-behavior 9/9, typecheck clean).
- **Divergences raised (not absorbed)**: Q-WV15-1 (undocumented Override screen → RESOLVED: grid editable), Q-WV15-2 (Export/Import variant behavior), CPR-WV15-Q3 (Max Discount capped at 100) staged as `/encore-questions` drafts; real file I/O round-trip deferred to EDGE_P3 (LR-040(b)).

### ✅ P1 milestone delivered (2026-06-05)

Wave-1 (DOCX-functional P1) is **complete, audited, and parity-clean** across all three built screens. The parent remains **PENDING** per F16 — this annotation records the milestone, it does NOT close the module.

- **Coverage**: 63 `TC-LOC-CPR-*` automated + green — Search `001–018` (S1, 18), Pricing Strategy `101–125` (S2, 25), Pricing Detail `201–220` (S3, 20). Full scoped suite: **64 passed** (63 CPR + 1 shared auth-setup), 0 fail / 0 flaky / 0 skip, from this-run deduped `test-results.json`.
- **Parity / deliverable**: spec ↔ MD ↔ XLSX **63 = 63 = 63** (`check:tc-parity` exit 0); workbook builds + lints clean (LR-ENC-004, `xlsx:build` + `xlsx:lint`).
- **Structure**: GARDENER dedup extracted 5 shared primitives (`isSaveEnabled`, `clickSaveButtonOrThrow`, `confirmSaveDialogIfPresent`, `isVisibleSafe`, `readAllTexts`) + the init-log into `CorporatePricingBasePage` (ALL-026); `typecheck` clean; regression-guard 0 API removed.
- **Closure audit**: S4 DO-OR-DIE multi-agent `Workflow` audit (8 dimensions, fresh-context, ≥3 adversarial skeptics per PASS) → **VERIFIED-CLEAN** after one remediation round.
- **Divergences raised (not absorbed)**: D1 (8↔9 columns), D2 (server-side filtering), D5/CPR-STRAT-Q1 (History absent), CPR-DETAIL-Q3 (flat grid), CPR-DETAIL-Q4 (New-Price override) staged as `/encore-questions` drafts.
- **Children in `plans/done/`**: S0/S1/S2/S3/S4, **`W15_0_RECON` (2026-06-08 — Wave-1.5 recon+foundation)**, **`1440_NEW_PRICEBOOK` (2026-06-09 — New Pricebook create flow, 30 green `TC-LOC-CPR-301..330`; XLSX/parity-green deferred to chip `task_6ac2db33` on pre-existing cross-module debt)**, **`W15_A_OVERRIDE_FCC` (2026-06-09 — Product Group Override full FCC, 28 green `TC-LOC-CPR-501..528` ×2 / 122-test suite clean; Q-WV15-1 RESOLVED, Max Discount cap-at-100, parity+lint clean)**, **`W15_B_TOOLBAR_IO_FCC` (2026-06-09 — Search toolbar I/O trigger-level FCC, 17 green `TC-LOC-CPR-601..617` ×2 / 139-test CPR suite clean; Export ▾/Import ▾ 4 variants + Loc Pricing Export/Import + Grid Options persist; real file I/O→EDGE_P3; Q-WV15-2/NM-1604 confirmed-live; parity+lint clean)**, **`W15_99_CLOSURE` (2026-06-09 — Wave-1.5 do-or-die closure audit, VERIFIED-CLEAN after 2 remediation rounds: B1 XLSX jargon leak + B7 broken sr-only Grid Options selector + B2 LR-019 baseline found & fixed; suite 46/46, edit-behavior 9/9, parity+lint+typecheck clean)**. **`1445_SEARCH_FCC_P2` (2026-06-10 — Search FCC, 12 green `TC-LOC-CPR-019..030`; parity+lint clean; toolbar I/O app-change → `task_054e2fe7`)**. **Still gating closure (PENDING)**: Wave-2 FCC (`1441_STRATEGY_FCC_P2`, `1443_DETAIL_FCC_P2`), Wave-2.5 (`PRE_EDGE`), Wave-3 edge (`EDGE_P3`), gated stub (`1444_HISTORY`).

---

## Execution Summary (when Status: DONE)

**Executed**: <YYYY-MM-DD>

<Per LR-027: children completed, TCs implemented (count + ID ranges per screen), TCs dropped (count + IDs + justification), live divergences confirmed/filed, parity result, suite pass confirmation, deviations.>
