# SUBPLAN_CORP_PRICING_W15_0_RECON — Wave-1.5 recon + foundation (newly-surfaced nodes)

**Status**: DONE
**Executed**: 2026-06-08
**Priority**: P1
**Created**: 2026-06-05
**Identity**: HUNTER
**Parent**: PLAN_CORP_PRICING_MASTER.md
**Depends on**: SUBPLAN_CORP_PRICING_99_AUDIT_CLOSURE.md
**Blocks**: SUBPLAN_CORP_PRICING_W15_A_OVERRIDE_FCC.md, SUBPLAN_CORP_PRICING_W15_B_TOOLBAR_IO_FCC.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: n/a

---

## Context

**WAVE-1.5 (F-WV15).** Post-Wave-1, live screenshots surfaced Corporate-Pricing nodes that Wave-1 covered **presence-only** (TC-LOC-CPR-018) or not at all — and which are **absent from the source DOCX** (live-discovered, not specced):

1. **Product Group Override** screen — reached via the **"Pricing Override"** toolbar button. Wave-1 deferred it as "URL: TBD / destination unbuilt" (D3); the destination is **now built** (recon-stale → re-confirm). Live shape (observed, to verify on walk): breadcrumb `Corporate Pricing > Product Group Override`; **Equipment | Labor** tabs; left panel `Change Local Office / Select a location` + `Active only` checkbox + `Currency:` dropdown; 9-col grid `Location, Product Group, Product Group Name, Currency, Current Price, Override Price, Max Discount %, Active, Mod Date`; `Filter Product Groups Override…` search; `Save / Export / Import`; rows-per-page pagination; `No results` empty state.
2. **Export ▾** / **Import ▾** dropdowns — 4 variants each (observed): `All Equipment Pricing`, `All Labor Pricing`, `All Equipment Max Discount`, `All Labor Max Discount`.
3. **Loc Pricing Export** / **Loc Pricing Import** toolbar buttons.
4. **Grid Options** gear (column show/hide/reorder).

This subplan is the Wave-1.5 **RECON + FOUNDATION**: walk each node live, emit dated field-inventories, scaffold the Override page object + selectors + data + fixture, and **RAISE the undocumented surfaces as `/encore-questions` clarifications** (master Doctrine 2 — live = oracle, but every divergence is RAISED, never silently encoded). It authors **NO FCC test cases** — those are WV1.5-A (Override) / WV1.5-B (toolbar I/O), which consume the inventories this produces. Detailing cases now = assumptions (forbidden by Doctrine 1).

Runs **after Wave-1 closed (S0–S4 in `done/`) and after the POM restructure landed** — so all scaffolding targets POM shape.

**Activation trigger**: immediate (the screens are live now); no app-ship gate.

---

## Bootstrap

**Identity**: HUNTER (walk/baseline/clarifications) → GIVER (field-inventories) → BUILDER (scaffold). Clean re-load at each switch.
**Skills auto-called**: `/identity`, `/regression-guard`, `/relevant`, `/encore-questions` (undocumented-surface clarifications), `/final-q`.
**Context files**: `PLAN_CORP_PRICING_MASTER.md`, `clients/encore/specs_planning/_internal/field-inventory-spec.md`, `field-case-generation.md`, the Wave-1 page objects `clients/encore/src/pages/corporate-pricing/{corporate-pricing,corporate-pricing-search,corporate-pricing-detail}.page.ts` (reuse targets), `clients/encore/src/selectors/corporate-pricing/*.ts` (toolbar selectors already mapped), `clients/encore/CLAUDE.md` (LR-ENC-001 baseline-absent, LR-017 namespace, LR-036 boolean render), `.claude/rules/{inventory,browser-tool,data}.md`.

---

## Phase 0 — Dependency + browser-tool + POM-shape gate (MANDATORY)

1. Confirm Wave-1 closed: S0–S4 in `plans/done/`. 2. **POM-shape gate**: assert the restructure landed — `clients/encore/tests/corporate-pricing/` + `clients/encore/src/data/corporate-pricing/` + `clients/encore/src/fixtures/pages.fixture.ts` all exist; old `src/infra/fixtures.ts` / `src/data/testdata/` / `src/core/` GONE. **HALT if the tree is half-moved** (never scaffold into a mixed layout). 3. LR scan: LR-ENC-001, LR-017, LR-029 (missing-testid report), LR-036, LR-040. 4. `BrowserTool=cli`, `-s=cpr-w15-recon` on `clients/encore/.auth/encore-state.json`.

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL — net-new, live-discovered)

1. `baselineScope: baseline-absent` (LR-ENC-001 — net-new on e2e, no nav2 equivalent). 2. `## Baseline diff` = "baseline-absent; intent oracle = **live DOM** (these nodes are NOT in the DOCX — live-discovered, raised as clarifications)". Append/emit `clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-override-2026-06-08.md`.

---

## Phase 1+ — Recon walk + scaffold (HUNTER → GIVER → BUILDER)

**1. Walk + field-inventories (GIVER — 8 frontmatter keys + 7 sections per `field-inventory-spec.md`, LR-014 testid/fallback):**
- `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-override-2026-06-08.md` — Equipment/Labor tabs, location selector, currency filter, Active-only checkbox, every grid column (Location → Mod Date), filter search, Save, the screen's own Export/Import, pagination, empty state. Boolean render (Active) MCP-verified (LR-036). Content-anchored row strategy (LR-022 — no hardcoded counts).
- `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-toolbar-io-2026-06-08.md` — Export ▾ (enumerate the live variants), Import ▾ (live variants), Loc Pricing Export/Import, Grid Options gear (which columns are toggleable). Capture each control's trigger (network endpoint via `playwright-cli network` / navigation), NOT assumed behavior.

**2. Scaffold (BUILDER — POM shape, reuse-first per ALL-026):**
- `clients/encore/src/pages/corporate-pricing/corporate-pricing-override.page.ts` — `CorporatePricingOverridePage extends CorporatePricingBasePage`; **reuse** base `readGridRowsByContent` / `findGridRowByContent` / `switchTab` / `clickSave` / `confirmSaveDialogIfPresent` / `readAllTexts`; add only Override-specific accessors.
- `clients/encore/src/selectors/corporate-pricing/override.ts` — Override-screen partition (tabs, filters, grid columns by header text, Save). Register the namespace in `clients/encore/src/selectors/corporate-pricing/index.ts` + `src/selectors/index.ts` `buildAllSelectors` (LR-017 collision boundary). MUST NOT touch `selectors/locations/pricing.ts`. Zero hardcoded env (currency/office/locale) in selectors.
- `clients/encore/src/data/corporate-pricing/override.ts` — Override common data + designate a **dedicated Override mutation fixture** (distinct GUID from `strategyFixture`/`detailFixture`, F1-style isolation; no cross-fixture row collision under `workers:2`).
- Register the Override page-object fixture in `clients/encore/src/fixtures/pages.fixture.ts`.
- No specs, no FCC cases here. `npm run typecheck` clean.

**3. RAISE clarifications (HUNTER — `/encore-questions` drafts under `specs_planning/_internal/encore-questions-drafts/`):**
- **Q-WV15-1** — Product Group Override screen is live but **absent from the DOCX**: story ID (NM-1442?), and the intended **Override Price / Max Discount %** validation rules (so WV1.5-A asserts intent, not just observed behavior).
- **Q-WV15-2** — Export/Import **4-variant** behavior is undocumented: what each variant exports/imports + file format.

**4. Reserve TC bands + hand off (LR-040(b) grep-verifiable):** `5NN` = Override (WV1.5-A consumes `corporate-pricing-override-*` inventory), `6NN` = toolbar I/O (WV1.5-B consumes `corporate-pricing-toolbar-io-*` inventory).

**5. Missing-testid report** (LR-029): file/append any selector gaps observed on these nodes for the Encore team.

---

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Adjacent fixes → DO-NOW (<30 min) or APPEND with grep-verification. Bare deferral = HALT + ask (LR-040/046).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | baseline-absent note + `/encore-questions` drafts | `clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-override-2026-06-08.md`<br>`clients/encore/specs_planning/_internal/encore-questions-drafts/corporate-pricing-wave15-divergences-2026-06-08.md` | grep artifact freshness |
| GIVER | field-inventories (override + toolbar I/O) | `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-override-2026-06-08.md`<br>`clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-toolbar-io-2026-06-08.md` | grep inventory 8-key/7-section shape |
| BUILDER | Override page object + selectors + data + fixture reg | `clients/encore/src/pages/corporate-pricing/corporate-pricing-override.page.ts`<br>`clients/encore/src/selectors/corporate-pricing/override.ts`<br>`clients/encore/src/data/corporate-pricing/override.ts` | `npm run typecheck` exit 0 |
| HEALER | (none — recon, no failing spec) | `(none)` | n/a |
| WATCHDOG | (none — closure is WV1.5-99) | `(none)` | n/a |
| GARDENER | (none) | `(none)` | n/a |

---

## Acceptance criteria

- [ ] POM-shape gate passed (tests/ + src/data/corporate-pricing/ + src/fixtures/ present; old paths gone).
- [ ] Two dated field-inventories emitted (override + toolbar-io), 8-key/7-section, LR-036 boolean render MCP-verified, LR-022 content-anchored (no hardcoded counts).
- [ ] Override scaffolding (page object + selectors + data + fixture) typecheck-clean; LR-017 namespace registered; zero hardcoded env in selectors.
- [ ] Dedicated Override mutation fixture designated (distinct GUID; no collision with strategy/detail fixtures).
- [ ] `/encore-questions` Q-WV15-1 (Override screen undocumented) + Q-WV15-2 (Export/Import variants undocumented) raised — NOT silently encoded (Doctrine 2).
- [ ] Date placeholders `2026-06-08` resolved to real dates at closure; C6 cells grep-resolve.

---

## Execution Summary

**Executed**: 2026-06-08

**Type**: RECON + FOUNDATION (Wave-1.5). Authors **zero** FCC test cases by design — those are W15-A (Override, 5NN) / W15-B (toolbar I/O, 6NN), which consume the inventories + scaffold this subplan produces (Doctrine 1: detailing cases now would be assumptions).

**TCs implemented**: 0 (by design — recon+foundation). TC bands reserved for downstream: `5NN` Override → W15-A, `6NN` toolbar I/O → W15-B (added to `tcBands` in `src/data/corporate-pricing/common.ts`; grep-verifiable references confirmed in both recipient subplans per LR-040(b)).

**Live walk** (Playwright CLI `-s=cpr-w15-recon`, office 1604, auth via `clients/encore/.auth/encore-state.json`):
1. **F-A pre-flight PASSED** — the "Pricing Override" toolbar button NAVIGATES to a BUILT Product Group Override screen (`/corporate-pricing/pg-override`, H1 "Product Group Override"). The Wave-1 recon-stale "destination unbuilt" (D3) risk is cleared.
2. **Override screen**: Equipment|Labor `role=tab` (aria-selected; tab-switch reloads grid); location-gated grid (empty until the "Select a location" modal picker → search + per-row checkbox + Select); Currency filter ALL/USD/CAD/MXN; Active-only default OFF; client-side "Filter Product Groups Override..." (8→7 rows on "House"); rows-per-page 10/20/30/40/50.
3. **DIVERGENCE (D9 recon-stale)**: the grid is **10 columns** (recon said 9) — live adds **Updated By**. Live wins (Doctrine 2); raised Q-WV15-1.
4. **LR-036 NEW (4th) boolean render**: the Active column is a Radix checkbox (`[role=checkbox][aria-checked]`) — distinct from Unicode ✔ / SVG lucide-check / Glyphicon. Recorded in the override inventory's Boolean encoding registry; flagged as an LR-036 graduation candidate.
5. **Edit-activation finding**: Override Price / Max Discount % (`div[role=button]` click-to-edit) did not reveal an input via click/dblclick/Enter, and the Active checkbox did not toggle — Save stayed disabled, so **zero** changes were staged or committed (read-only recon, mutation-safe per the "without messing anything up" directive). Mechanism (possibly RBAC) deferred to W15-A; raised Q-WV15-1 item 5.
6. **Toolbar I/O**: Search `Export ▾` / `Import ▾` each expose the SAME 4 variants (All Equipment Pricing / All Labor Pricing / All Equipment Max Discount / All Labor Max Discount); `Loc Pricing Export/Import` + the Override `Export/Import` are direct CSV downloads (`LocationPricebooks-*.csv` / `ProductGroupOverrides-*.csv` observed — file format = CSV, partially answering Q-WV15-2); the Grid Options popover uses non-standard markup, owned by W15-B.

**Deliverables produced** (all exist on disk — C6 mirror verified):
- HUNTER: `clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-override-2026-06-08.md` (baseline-absent) + `clients/encore/specs_planning/_internal/encore-questions-drafts/corporate-pricing-wave15-divergences-2026-06-08.md` (Q-WV15-1 + Q-WV15-2 RAISED, Doctrine 2).
- GIVER: `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-override-2026-06-08.md` + `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-toolbar-io-2026-06-08.md` (both 8-key/7-section, LR-036 boolean registry, LR-022 content-anchored).
- BUILDER: `corporate-pricing-override.page.ts` (extends CorporatePricingBasePage, reuses base helpers per ALL-026) + `selectors/corporate-pricing/override.ts` (`ovr`-prefixed, LR-017 namespace registered in the module barrel + top-level collision check) + `data/corporate-pricing/override.ts` (Override common data + dedicated Override mutation fixture, isolated by construction from the strategy/detail GUID fixtures) + fixture registered in `pages.fixture.ts`. `npm run typecheck` exit 0.
- LR-029: missing-testid report appended (Override + toolbar I/O, live-DOM verified, zero testids).

**Acceptance criteria**: all 6 met (POM-shape gate passed; 2 dated inventories 8-key/7-section with LR-036 + LR-022; scaffold typecheck-clean + LR-017 namespace + zero hardcoded env; dedicated Override fixture isolated; Q-WV15-1/2 raised not encoded; date placeholders resolved + C6 cells grep-resolve).

**Deviations / beyond-plan**: (1) the plan's "9-col grid" + "distinct GUID fixture" assumptions were corrected to live reality (10 cols; Override is not pricebook-GUID-based — isolation rationale documented instead). (2) Phase 2.5 DO-NOW: removed stray export-download CSVs + added `.playwright-cli/*.csv|*.xlsx` to root `.gitignore` (the Export buttons download live client pricing data — IP-protective, LR-049 spirit). (3) Override edit-activation mechanism + Save dialog verbatim text + exact grid/save endpoints + Grid Options popover structure are deferred to W15-A/W15-B (each a grep-verifiable named recipient).

**Flagged for user/maintainer**: the `agent-mistakes.md` mistake log is **absent** from the client `specs_planning/_internal` directory (it is referenced by `navigation.md` §B + the client CLAUDE.md, but no such file exists on disk); this session relied on the canonical LR-rule layer instead. Recreate-vs-relocated is a maintainer decision (not silently recreated — the prior content is unknown).

---

## Handoff

Wave-1.5 foundation. Produces the inventories + scaffold that WV1.5-A (Override FCC, 5NN) and WV1.5-B (toolbar I/O FCC, 6NN) consume. Runs first in Wave-1.5, before Wave-2.
