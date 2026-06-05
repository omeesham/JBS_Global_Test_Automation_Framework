# SUBPLAN_CORP_PRICING_1445_SEARCH_P1 — Search page P1 DOCX coverage (GIVER → BUILDER → HEALER → WATCHDOG)

**Status**: DONE
**Executed**: 2026-06-05
**Priority**: P1
**Created**: 2026-06-05
**Identity**: GIVER
**Parent**: PLAN_CORP_PRICING_MASTER.md
**Depends on**: SUBPLAN_CORP_PRICING_00_FOUNDATION.md
**Blocks**: SUBPLAN_CORP_PRICING_99_AUDIT_CLOSURE.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a

---

## Context

P1 (DOCX-functional) coverage for the **Corporate Pricing Search page** (NM-1445), the only screen with confirmed `e2e-*` testids and a 591-row virtualized grid. Seeds from the 30 XLSX helper cases (`TC-ENC-PRC-1445-*`), each verified/corrected on live DOM and re-IDed to `TC-LOC-CPR-0NN` (Search band). Honors the parent Divergence Ledger per Doctrine 2 (cover DOCX intent + assert live + raise divergence): **columns** — cover all 8 DOCX-named, assert the live count, raise the 8↔9 split as an `/encore-questions` clarification (D1/F2a — do NOT silently assert 9); client-vs-server filter classification (D2); **navigation** — the pricebook-row→details click IS built (D4) and is covered here (also exercised in S2); the New-Pricing equipment/labor **route-param** is a DOCX "Must" (R1445-4, line 18) covered per F2c; only genuinely-unbuilt destination pages are deferred, citing DOCX line 22 "URL: TBD" (D3/F2d). Read-only screen — no mutation, so no fixture-restore needed.

---

## Bootstrap

**Identity**: GIVER (Phase 1) → BUILDER (Phase 2) → HEALER (Phase 3, conditional) → WATCHDOG (Phase 4). Clean identity re-load at each switch.

**Skills auto-called**: `/identity` (gate + switches), `/regression-guard` (wrap Phase 2), `/relevant` (Phase 0.5), `/rca` (Phase 3 if failures), `/final-q` (exit).

**Context files**:
- `PLAN_CORP_PRICING_MASTER.md` (parent — Doctrine + Divergence Ledger)
- `SUBPLAN_CORP_PRICING_00_FOUNDATION.md` (scaffolding + base page + selector namespace + TC-ID bands)
- `.claude/rules/inventory.md` (LR-007/013/014/015), `.claude/rules/specs.md`, `.claude/rules/angular.md`, `.claude/rules/browser-tool.md` (LR-038/054), `.claude/rules/data.md`
- `clients/encore/CLAUDE.md` (LR-ENC-001/002/003, LR-017, LR-036 boolean render, LR-029 testid audit)
- `clients/encore/specs_planning/_internal/field-case-generation.md`, `field-inventory-spec.md`

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `SUBPLAN_CORP_PRICING_00_FOUNDATION.md` is DONE in `plans/done/`.
2. Read navigation.md §C (consume S0's registry row), agent-mistakes.md (PLN-*/GEN-*/ALL-*), patterns.md.
3. LR scan: LR-007/013/014/015, LR-036, LR-051/052/053 (no OR-asserts / no fixed waits / no strict-count-with-placeholder), LR-ENC-002.
4. **Browser-tool announcement**: `BrowserTool=cli`, `playwright-cli -s=cpr-search` on `clients/encore/.auth/encore-state.json`.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL — output drives TC corrections)

1. Consume S0's `clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md` (`baselineScope: baseline-absent`, ≤14 days → no re-walk per LR-013). `## Baseline diff` for this screen = "baseline-absent; intent oracle = DOCX NM-1445".

---

## Phase 1 — GIVER: field-inventory + test cases (live)

1. **Field-inventory walk** (`-s=cpr-search`) → emit `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-search-<MCP-DATE>.md` (8 frontmatter keys + 7 sections; testid OR text/role fallback for every field per LR-014). Capture: each filter (Pricebook text; Pricing Strategy, Location, Currency dropdowns — option lists; Is Internal, Is Labor, Active Only checkboxes — DEFAULT states), Reset, Search; the grid columns in order — verify all 8 DOCX-named present + record the live render count (D1/F2a); boolean cell render format per LR-036 (✔ vs SVG vs glyph — MCP-verify, do not assume); item count; virtualization behavior; nav buttons (New, Pricing Override, Loc Pricing Export/Import, Export, Import, Grid Options) + whether `New` navigates with an equipment/labor route-param (F2c).
2. **Verify the 30 XLSX helpers vs live** — for each `TC-ENC-PRC-1445-*`: confirm, correct, or drop. Resolve every `[ASSUMPTION]` flag (Active Only default; dropdown sources; max-length). **Classify D2**: capture `playwright-cli network` while typing in Pricebook filter and while selecting dropdowns → is filtering client-side (doc) or does it hit the server (Search button)? Record verdict; assertions follow live truth.
3. **Author P1 functional cases** (re-IDed `TC-LOC-CPR-0NN`, Search band): component load + single list call; **cover all 8 DOCX columns present + order, assert the live count, and file the 8↔9 divergence via `/encore-questions` (F2a — do NOT silently assert 9)**; boolean columns render (LR-036); Pricebook filter narrows; one dropdown filter narrows + clears; each checkbox filters; Reset clears all + restores full list; nav-button presence + affordance; **pricebook-row→details navigation (built per D4 — assert it routes to `/corporate-pricing/details/<guid>`)**; **New-Pricing equipment/labor route-param (DOCX line 18 "Must", F2c): IF S0 confirmed `New` navigates with a param → assert the equipment/labor route-param here as P1; ELSE defer to `SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK.md` with the line-18 citation as a grep-verifiable item (LR-040(b)) — never bare-defer**; only genuinely-unbuilt destination pages deferred citing DOCX line 22 "URL: TBD"; item-count integrity. (BVA/special/each-option/compound = P2, deferred (b) to the existing Wave-2 FCC stub `SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2.md`.)
4. Write `corporate_pricing_search_test_cases.md` + `corporate_pricing_search_test_plan.md` (with Selector Mapping table) under `specs_planning/{test-cases,test-plans}/setup/corporate-pricing/`; emit P1 slice of field-case-catalog. Run `npm run planner:post-complete` (rebuilds XLSX) → `npm run check:tc-parity` exit 0.

---

## Phase 2 — BUILDER: selectors + page object + specs (identity switch)

> Re-load BUILDER. Spot-check 2–3 inventory fields on live DOM (LR-007). `/regression-guard` BEFORE.

1. `src/selectors/corporate-pricing/search.ts` — filters/buttons/columns via `e2e-*` testids where present, else text/role/grid-header; content-anchored row locator. Register in the module `index.ts`.
2. `src/pages/corporate-pricing/corporate-pricing-search.page.ts extends CorporatePricingBasePage` — `applyTextFilter`, `selectDropdownFilter`, `toggleCheckbox`, `clickReset`, `clickSearch`, `getColumnHeaders()`, `getVisibleRowCount()`, `readBooleanCell(row,col)` (LR-036 branch), `getRowByContent(...)`, nav-button presence getters.
3. `src/data/testdata/corporate-pricing/search.data.ts` — the 8 DOCX-named column headers + the live render count (F2a), currency options (USD/CAD/MXN), a stable filter-match dataset (MCP-verified values, LR-015), expected default checkbox states.
4. `specs/corporate-pricing/corporate-pricing-search.spec.ts` — `@corporate-pricing @search`; per-test nav guard; P1 cases. No `data-testid` assumptions; no fixed `waitForTimeout` (LR-052); no hardcoded structural row count against the 591-row virtualized grid (LR-022 — F8; LR-053 only applies if S0 finds the auto-empty placeholder-row bug class) — use content anchors.
5. `npm run typecheck` clean → `npx playwright test --list` (**run from `clients/encore/`** — returns 0 tests from repo root, F4) resolves all `TC-LOC-CPR` search IDs → run the spec alone (`npm test -- corporate-pricing-search` — filename filter, NOT a name-grep, F5; `.env.local`) → `check:tc-parity` exit 0. `/regression-guard` AFTER.

---

## Phase 3 — HEALER: RCA + fix (conditional, 2-cycle)

1. On any failure: artifact-first (`/rca` — read trace/error-context BEFORE re-running, LR-024); CLI headed walk per browser-tool.md RCA row. Fix surgically; sync test-cases MD status if an assertion changes (HEALER HARD STOP #6). Re-run individual `--retries=0`. Max 2 cycles → escalate.

---

## Phase 4 — WATCHDOG: structural audit + parity (identity switch)

1. `check:tc-parity` exit 0; `--list` resolves every spec ID; FCC-block/structure conventions; LR-051/052/053 scan; confirm no false-green (read assertions actually assert live values). Findings → Execution Summary (defer master neutral-eye to S4).

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Adjacent same-module fixes → DO-NOW (<30 min) or APPEND to a named subplan with grep-verification. Bare deferral = HALT + ask (LR-040/046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline/REQUIREMENTS freshness | `(skipped: reused S0 clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md per LR-013 14-day window; net-new baseline-absent)` | grep baseline artifact |
| GIVER | test-cases.md, test-plan.md, XLSX | `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_search_test_cases.md`<br>`clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_search_test_plan.md` | `npm run check:tc-parity` exit 0 |
| BUILDER | spec, page object, selectors, data | `clients/encore/specs/corporate-pricing/corporate-pricing-search.spec.ts`<br>`clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts` | `npx playwright test --list` resolves search IDs |
| HEALER | per-fix MD status sync (if RCA-driven) | `(skipped: HEALER ENGAGED — 6 evidence-driven in-place fixes to the page object/spec (readiness wait, React-setter text-fill, cache-served broaden, virtualized-dropdown poll, action-bar textContent, corrected menu retry); no separate artifact, MD assertions unchanged so no status re-sync needed)` | `npm run check:tc-parity` exit 0 |
| WATCHDOG | structural audit | `(skipped: parity + structural scan run inline Phase 4, evidence in Execution Summary; master neutral-eye deferred to S4)` | `npm run check:tc-parity` exit 0 |
| GARDENER | (none) — dedup sweep in S4 | `(none)` | n/a |

---

## Acceptance criteria

- [x] Field-inventory artifact emitted (8 keys + 7 sections; LR-014 testid/fallback complete). → `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-search-2026-06-05.md`
- [x] All 30 XLSX 1445 helpers verified/corrected/dropped; every `[ASSUMPTION]` resolved on live DOM; D2 client-vs-server verdict recorded (= **SERVER-SIDE on Search**). Mapping table in test-cases MD.
- [x] P1 functional cases authored + automated (18, TC-LOC-CPR-001..018); columns cover 8 DOCX-named + 8↔9 divergence filed (F2a); row→details navigation asserted (D4); route-param "Must" covered as P1 (F2c — 1440 BUILT per S0); every taxonomy item classified (a)/(b)/(c) per LR-040 (007/008/030 → (b) `SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2.md`; Price-Override-dest → (c) DOCX "URL TBD").
- [x] `check:tc-parity` exit 0 (spec ⊆ MD ⊆ XLSX); spec alone green; suite green (**19 passed ×2**, `--workers=1 --retries=0`).
- [x] `/regression-guard` before/after clean; activity-log row (LR-028); `/final-q` block (LR-042).

---

## Verification

```bash
npm test -- corporate-pricing-search        # filename filter (NOT name-grep, F5); all P1 search TCs pass (.env.local)
npm run check:tc-parity                      # expect: exit 0
cd clients/encore && npx playwright test --list | grep TC-LOC-CPR   # MUST run from client root (F4 — 0 tests from repo root); every authored search ID resolves
```

---

## Handoff

Search (1445) P1 green. S4 inherits the spec for the suite run + parity. Wave-2 FCC (search) inherits the field-inventory + the (b)-classified deferred case list.

---

## Execution Summary

**Executed**: 2026-06-05

S1 (Search, NM-1445) P1 DOCX-functional coverage delivered. **18 TCs (`TC-LOC-CPR-001..018`) automated and GREEN — 19 passed ×2** consecutive full runs (`--workers=1 --retries=0`, `.env.local`). `npm run typecheck` clean; `npx playwright test --list` resolves all 18 (from client root, F4); `check:tc-parity` exit 0 (spec ⊆ MD ⊆ XLSX); `xlsx:build` self-lint PASS (LR-ENC-004, 0 vocab/integrity violations); `corporate_pricing_search` XLSX sheet = 18 rows.

**Helper verification (all 30 `TC-ENC-PRC-1445-*`, source `clients/encore/docs/jira_pricing_test_cases.xlsx` re-provided by user):** 27 → P1 cases (CONFIRM/CORRECT); 3 → (b) FCC-P2 (`SUBPLAN_CORP_PRICING_1445_SEARCH_FCC_P2.md`, seed-list appended, grep-verified): 007 Pricebook-overflow, 008 special-chars, 030 compound-filter; 1 → (c) Price-Override navigation destination (DOCX line 22 "URL: TBD", unbuilt — presence covered in TC-018). Every `[ASSUMPTION]` resolved live. Full mapping table in the test-cases MD.

**Live divergences RAISED (Doctrine 2 — asserted as live, never silently absorbed; `clients/encore/specs_planning/_internal/encore-questions-drafts/corporate-pricing-search-divergences-2026-06-05.md`):**
- **D1** — DOCX names 8 columns; live renders **9** ("Productions Currency" → `Is Productions` + `Currency`). Tests verify all 8 DOCX names present + assert live count 9.
- **D2** — DOCX says filtering is client-side ("no API calls"); live filtering is **SERVER-SIDE, on the Search button** (`GET /navigator/api/location/pricing/strategies?<staged params>`; verified by trace). Typing/toggling/selecting only STAGES (no call); Reset restores the full list from cache (no call). Tests assert the live staging+server-query model.

**Key live findings (consumed by S2/S3 + Wave-2):** Corporate Pricing is a **React/Next.js** module (`corporate-pricing-container.tsx`), NOT Angular — `waitForAngularStable()` is a no-op; the grid loads async (~400ms) after navigation and the "0 items found" footer paints before data, so readiness waits on `tbody tr`/`th`, not the footer. Component-load fires `/pricing/strategies` exactly once. Currency options = All Currencies/USD/CAD/MXN; Location = searchable popover, 2652 options (virtualized → never assert the count, LR-022/025). Grid = real `<table>` (`tbody tr`/`td`/`th`, 9 cols, 50 rendered/591), booleans Unicode ✔ (LR-036), pricebook-name cell `<button class="cursor-pointer">` → `/details/<guid>` (D4). New split-button → `[role=menuitem]` Equipment/Labor → `/add?type=equipment|labor` (F2c, R1445-4 satisfied).

**Artifacts produced:** `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-search-2026-06-05.md` (+ `.png`); `clients/encore/specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_search_test_cases.md`; `clients/encore/specs_planning/test-plans/setup/corporate-pricing/corporate_pricing_search_test_plan.md` (Selector Mapping table); `clients/encore/specs_planning/_internal/field-case-catalogs/corporate-pricing-search-2026-06-05.md`; `clients/encore/specs_planning/_internal/encore-questions-drafts/corporate-pricing-search-divergences-2026-06-05.md`; `clients/encore/src/selectors/corporate-pricing/search.ts` (hardened — real `<table>` selectors, not ARIA-role); `clients/encore/src/pages/corporate-pricing/corporate-pricing-search.page.ts`; `clients/encore/src/data/testdata/corporate-pricing/search.data.ts`; `clients/encore/src/infra/fixtures.ts` (+`corporatePricingSearchPage`); `clients/encore/specs/corporate-pricing/corporate-pricing-search.spec.ts`; XLSX rebuilt (`clients/encore/test_cases_xlsx/encore_test_cases.xlsx`).

**TCs dropped:** none. **NOT-AUTOMATABLE:** none. **Deferred:** 007/008/030 → (b) FCC-P2; Price-Override-dest → (c) DOCX-TBD; Location each-option → (b)/(c).

**HEALER:** engaged on first-run failures (10 → 4 → 2 → 0). Six evidence-driven in-place fixes (no separate artifact): (1) grid-readiness waits for `tbody tr`/`th` not the "0 items found" footer; (2) React controlled-input text-fill via native value-setter + input/change (NOT `pressSequentially`/`fill` — Angular-oriented ALL-089 doesn't apply to React; verified via trace); (3) broaden-to-default served from cache → no response-wait; (4) virtualized Location dropdown → poll-to-populate + `allInnerTexts`, assert populates not count; (5) action-bar presence via shadow-pierced `textContent` (Playwright `:text-is` misses the labels); (6) New menu open via `waitFor`-based retry (`isVisible({timeout})` ignores its timeout) + 15s nav window.

**Deviations (per `feedback_plan_deviations_log`):**
1. **Helper/DOCX source files were missing** at start (not in repo/git/disk) — user re-provided them to `clients/encore/docs/`; the literal "verify 30 helpers" step then ran as planned (user-approved path).
2. **React native-setter for text fills** instead of `pressSequentially` (ALL-089) — ALL-089 is Angular-specific; this module is React and the setter is the verified-reliable method (trace-confirmed it commits state so Search submits the new query).
3. **Auth state refreshed from the live CLI session** (user-approved) after the automated SSO re-login failed mid-session (`loginWithMicrosoft returned false`) — equivalent to a normal auth refresh, same user/fresh cookies.
4. **HEALER ran 3 fix-cycles** (over the nominal 2-cycle budget) — each evidence-driven (artifact/trace/live-eval), narrowing 10→0; not blind looping.
5. **Source docs at `clients/encore/docs/` are not gitignored** (ship-leak risk, LR-049) — flagged via spawned follow-up task `task_611a545c` (relocate to `read_only_docs/` or `.gitignore`); not committed.
6. **XLSX/typecheck shared with parallel S2/S3 sessions** — both closed during this session; final `xlsx:build` + `typecheck` clean across all corporate-pricing sheets.

**Verification (re-runnable):**
```bash
cd clients/encore && npm test -- corporate-pricing-search --workers=1 --retries=0   # 19 passed
cd clients/encore && npx playwright test --list | grep -c corporate-pricing-search   # 18
npm run check:tc-parity                                                              # PASS
npm run xlsx:build                                                                   # xlsx-lint PASS; corporate_pricing_search 18 rows
```

**Parent:** `PLAN_CORP_PRICING_MASTER.md` stays PENDING (auto-close exempt — Wave-2 FCC + Wave-3 edge gate closure); this child's DONE line is annotated in the master body. S1/S2/S3 all P1-green; S4 (Wave-1 closure) is the remaining Wave-1 child.
