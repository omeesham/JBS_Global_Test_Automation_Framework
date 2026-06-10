# SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2 — Search FCC field-coverage (Wave-2 STUB)

**Status**: DONE
**Executed**: 2026-06-10
**Priority**: P2
**Created**: 2026-06-05
**Identity**: GIVER
**Parent**: PLAN_CORP_PRICING_MASTER.md
**Depends on**: SUBPLAN_CORP_PRICING_W15_99_CLOSURE.md
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a

---

## Context

**WAVE-2 STUB (F18).** FCC (Field-Case-Coverage) field-matrix for the Search page (NM-1445), priority P2 per Doctrine 1 (P1 first, FCC second). This file exists NOW so S1's `(b)` deferrals (BVA / each-option / compound) point at a grep-verifiable recipient (LR-040(b)). Full design is authored **after Wave-1 closes** — it consumes S1's live field-inventory (`field-inventories/corporate-pricing-search-*.md`), so detailing it now would be assumptions (forbidden by Doctrine 1).

**Activation trigger**: Wave-1 (S1/S2/S3 + S4) **and Wave-1.5 (W15_99 closure)** closed; POM shape present; S1's search field-inventory exists.

---

## Bootstrap

**Identity**: GIVER → BUILDER → HEALER → WATCHDOG on activation. Clean re-load at each switch.
**Skills auto-called**: `/identity`, `/regression-guard`, `/relevant`, `/rca` (if failures), `/final-q`.
**Bug doctrine (master Doctrine 2 — applies while field-testing every case below)**: if any behavior looks suspicious or buggy (a control that won't react, a Save that silently no-ops, a field that accepts a negative/invalid value), follow the doctrine — record it as an `/encore-questions` clarification when the cause is unclear (permission-locked? interaction step missing?), or file per LR-034 once it reproduces in the runner (LR-044). Never silently absorb it; at minimum catch the bugs visible in these cases. (W15-0 modeled this — it raised Q-WV15-1 instead of false-filing.)
**Jira defect cross-ref (UNVERIFIED leads — prove each on the live site before it becomes a test expectation OR a filing, LR-044)**: before raising/filing, check `clients/encore/specs_planning/_internal/jira-defect-crossref-2026-06-09.md` for an already-filed `NM-####` match on this screen (NM-2137 sort-current-page-only, NM-2078 Back loses filters, NM-2029 "All" currency empty). It is an external AI's Jira-search output (mixed-env, statuses unreliable, some by-design) — reproduce live first, then cite the `NM-#` instead of re-discovering.
**Context files**: `PLAN_CORP_PRICING_MASTER.md`, `SUBPLAN_CORP_PRICING_1445_SEARCH_P1.md`, `clients/encore/specs_planning/_internal/field-case-generation.md` (FCC taxonomy), the S1 search field-inventory.

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm Wave-1.5 closed (W15_99 DONE; transitively Wave-1) + S1 field-inventory exists + POM shape present. 2. LR scan: LR-ENC-002 (FCC parity structural), LR-040, LR-051/052, LR-022, LR-034/LR-030/LR-044 (bug doctrine). 3. `BrowserTool=cli`, `-s=cpr-search-fcc`.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL)

1. Consume S0 baseline-absent artifact. `## Baseline diff` = "baseline-absent; intent oracle = DOCX NM-1445 + field-case-generation taxonomy".

---

## Phase 1+ — Scope + seed list (full FCC design on activation)

**Seed FCC cases — grep-verifiable deferred items (from S1 `(b)` classification):**
- **Pricebook text filter**: BVA (min/max length), special chars, empty, whitespace, no-match (per `field-case-generation.md` plain-text row).
- **Dropdown each-option**: Pricing Strategy / Location / Currency — exercise EACH option narrows correctly + clears (dropdown row).
- **Checkbox toggle+revert**: Is Internal / Is Labor / Active Only — toggle on→filter, off→restore (checkbox row).
- **Reset idempotency**: reset after compound filters restores full list; double-reset no-op.
- **Compound multi-filter** (deferred from S1 P1, helper `TC-ENC-PRC-1445-030`): combine text + dropdown + checkbox into a single Search submission; assert the server query (`/navigator/api/location/pricing/strategies`) carries all staged params together and the grid narrows by all conditions at once (compound row).
- **Each-option enumeration deferred from S1 P1**: Currency each-option (USD/CAD/MXN beyond the one representative narrows-case), Location each-option (2652 options, LR-025), Pricing Strategy text-filter no-match/special-chars — these are the S1 `(b)` items whose representative case is covered in P1.
- **Client-side network assertions** (D2 verdict from S1 = SERVER-SIDE on Search): confirm no server call while staging (typing/selecting), and the Search-button `/pricing/strategies` query-param shape per filter.
- TC band: `TC-LOC-CPR-0NN` (Search band, FCC slice — continues after S1's P1 IDs).
- **Adjacent micro-dedup (APPENDED 2026-06-09 by SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK Phase 2.5; ALL-026)**: migrate the Search page object's private `setTextFilter` (native value-setter) to the now-shared `CorporatePricingBasePage.setReactInput` helper (extracted to the base on 2026-06-09 for the New Pricebook create flow; behavior-identical). Removes one duplicate of the React-controlled-input fill primitive. Behavior-only refactor, no spec-logic change — do while touching the Search page object on activation.

Full field-case-catalog + test-cases + test-plan + specs authored on activation (FCC two-describe shape per LR-ENC-002).

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY on activation)

Adjacent fixes → DO-NOW (<30 min) or APPEND with grep-verification. Bare deferral = HALT + ask (LR-040/046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline freshness | `(skipped: baseline-absent reused from S0 corporate-pricing-2026-06-05.md; net-new on e2e, no nav2 equivalent per LR-ENC-001)` | grep baseline artifact |
| GIVER | FCC catalog/field-inventory/test-cases/test-plan/XLSX | clients/encore/specs_planning/_internal/field-case-catalogs/corporate-pricing-search-fcc-2026-06-10.md<br>clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-search-2026-06-10.md<br>clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_search_test_cases.md<br>clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_search_test_plan.md<br>clients/encore/test_cases_xlsx/encore_test_cases.xlsx | `npm run check:tc-parity` exit 0 |
| BUILDER | FCC spec + page-object/data/selector touches | clients/encore/tests/corporate-pricing/corporate-pricing-search.spec.ts<br>clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts<br>clients/encore/src/data/corporate-pricing/search.ts<br>clients/encore/src/selectors/index.ts | `npx playwright test --list` resolves TC-LOC-CPR-019..030 |
| HEALER | (none — FCC suite green on first run, no RCA needed) | `(none)` | n/a |
| WATCHDOG | (none — post-exec audit only, no findings artifact produced) | `(none)` | n/a |
| GARDENER | (none — Phase 2.5 micro-dedup folded into the BUILDER file touches above) | `(none)` | n/a |

---

## Acceptance criteria

- [x] **(STUB, superseded)** Held S1's BVA/each-option/compound `(b)` deferrals as the grep-verifiable LR-040(b) recipient — now DISCHARGED by the 12 implemented FCC TCs (see Execution Summary).
- [x] **(ACTIVATED 2026-06-10)** Wave-1 + Wave-1.5 closed; S1 field-inventory consumed; FCC parity structural per LR-ENC-002 (`check:tc-parity` exit 0); the 12 Search FCC TCs green ×2. **Suite note**: the full CPR suite shows 11 failures — 10 in `toolbar-io` (W15-B) + 1 `detail` flake — caused by a live-app behaviour change in the toolbar Import/Export flow (confirmed via probe), not by this subplan's Search changes (Search-only, additive, typecheck-clean; 0 Search failures). User-authorized 2026-06-10 to close on the Search deliverable; toolbar re-verification spawned (`task_054e2fe7`).

---

## Execution Summary

**Executed**: 2026-06-10

**Activation**: gate satisfied — Wave-1 (S1/S2/S3/S4) + Wave-1.5 (W15_99) closed; POM shape present; S1 search field-inventory present.

**TCs implemented (12)** — `TC-LOC-CPR-019..030` (Search band 001–099, continuing after S1's 001–018):
- BVA/negative (Pricebook text): 019 no-match→0, 020 250-char overflow (no maxlength, 0 results, no crash), 021 special chars (literal, URL-encoded, no crash, escapable), 022 whitespace→full list.
- Negative (Pricing Strategy): 023 no-match (corrected server param `pricingStrategyName`).
- Dropdown each-option: 024 Currency USD/CAD/MXN (`currencyId` 1/2/3), 025 Location representative (`locationNo`, LR-025 — representative, not exhaustive).
- Checkbox toggle+revert: 026 Is Internal, 027 Is Labor (a different population, not a narrow), 028 Active Only (omits `isActive` when unchecked).
- Reset 029 (idempotent, 0 server calls, double-reset no further effect) + Combined 030 (single query, all staged params).

**TCs dropped**: 0. Location exhaustive each-option across 2652 options → (c) documented (representative proven, LR-025); DOM-tamper on comboboxes → (c) forbidden (ALL-088); 591-row virtualization-under-compound → `SUBPLAN_CORP_PRICING_EDGE_P3.md`.

**Live walk (Playwright CLI, office 1604, 2026-06-10)** → `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-search-2026-06-10.md`: captured the complete query-param contract (corrected the P1 `strategyName` guess → `pricingStrategyName`; added `currencyId`/`locationNo`); the BVA/special/whitespace server behaviours; checkbox revert symmetry; reset idempotency; compound single-query. 0 app bugs (special chars/overflow handled safely on the plain input; CAD=0 is a legitimate empty result).

**§2.1 rejection-affordance oracle** (graduated 2026-06-10) applied to every BVA/negative case (020/021/022): each asserts no false `aria-invalid` AND a natural Tab escapes — recorded before any cleanup, via `probePricebookBoundary` which never auto-Escapes — plus no client-side exception.

**Artifacts (GIVER + BUILDER)**: FCC field-case-catalog + dated field-inventory + test-cases MD (18→30) + test-plan (FCC scenarios) + XLSX rebuilt (`corporate_pricing_search` = 30 rows, vocab-lint clean) + spec FCC describe + page-object helpers (`probePricebookBoundary`, `selectFirstRealLocation`) + data contract.

**Parity (LR-ENC-002)**: `check:tc-parity` PASS — spec ⊆ MD (634) = XLSX (634); `corporate_pricing_search` 30=30=30; `xlsx:build` self-lint clean. `typecheck` exit 0. regression-guard: 0 exports removed (+2 methods, both new).

**Adjacent-Sweep (Phase 2.5 — master §Stale-slop lines 161-162)**: (1) `selectors/index.ts` CP-exclusion comment corrected — the prior note falsely named `btnSearch`/`btnReset` as colliding Location keys (the CP∩Location key intersection is empty); rewritten to the real by-design reason + the genuine `btnSave` location key. (2) `corporate-pricing-search.page.ts` `open()` literal `'1604'` → `CORPORATE_PRICING_COMMON.office`. (3) `setTextFilter`→`setReactInput` dedup — already landed by SUBPLAN_1440 on 2026-06-09 (verified delegating).

**Test pass (2026-06-10)**: 12 FCC TCs green individually (13 with auth-setup); full Search spec 31 passed (18 P1 + 12 FCC + auth-setup), no cross-describe contamination.

**Deviation — strict "suite green" line**: the full CPR suite is 139 passed / 11 failed. The 11 are 10 `toolbar-io` (TC-602/603/604/605/608/609/610/611/612/613) + 1 `detail` (TC-216) — a confirmed live-app behaviour change in the toolbar Import/Export flow (Import is now a Year+Currency dialog, not a file chooser; Export no longer fires a direct request) plus a detail save-state flake that passes in isolation. The toolbar-io code is byte-identical to its green W15-B closure (2026-06-09); this subplan's changes are Search-only, additive, typecheck-clean, with 0 Search failures. User-authorized 2026-06-10 ("complete what you were supposed to; the failing ones are due to changes in behaviour") to close on the Search FCC deliverable. Toolbar re-verification spawned as `task_054e2fe7` (W15-B scope); detail TC-216 noted (`CPR-DETAIL-BUG-A` area).

---

## Handoff

Wave-2 FCC for Search **delivered** — 12 `TC-LOC-CPR-019..030` green ×2, parity + lint + typecheck clean; S1's `(b)` deferrals discharged. The full CPR suite carries 11 out-of-scope failures from a live-app toolbar I/O behaviour change (W15-B re-verification spawned `task_054e2fe7`) — not this subplan's Search work, user-authorized to close.
