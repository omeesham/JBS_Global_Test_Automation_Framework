# SUBPLAN_CORP_PRICING_W15_0_RECON — Wave-1.5 recon + foundation (newly-surfaced nodes)

**Status**: PENDING
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

1. `baselineScope: baseline-absent` (LR-ENC-001 — net-new on e2e, no nav2 equivalent). 2. `## Baseline diff` = "baseline-absent; intent oracle = **live DOM** (these nodes are NOT in the DOCX — live-discovered, raised as clarifications)". Append/emit `clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-override-<MCP-DATE>.md`.

---

## Phase 1+ — Recon walk + scaffold (HUNTER → GIVER → BUILDER)

**1. Walk + field-inventories (GIVER — 8 frontmatter keys + 7 sections per `field-inventory-spec.md`, LR-014 testid/fallback):**
- `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-override-<MCP-DATE>.md` — Equipment/Labor tabs, location selector, currency filter, Active-only checkbox, every grid column (Location → Mod Date), filter search, Save, the screen's own Export/Import, pagination, empty state. Boolean render (Active) MCP-verified (LR-036). Content-anchored row strategy (LR-022 — no hardcoded counts).
- `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-toolbar-io-<MCP-DATE>.md` — Export ▾ (enumerate the live variants), Import ▾ (live variants), Loc Pricing Export/Import, Grid Options gear (which columns are toggleable). Capture each control's trigger (network endpoint via `playwright-cli network` / navigation), NOT assumed behavior.

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
| HUNTER | baseline-absent note + `/encore-questions` drafts | `clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-override-<MCP-DATE>.md`<br>`clients/encore/specs_planning/_internal/encore-questions-drafts/corporate-pricing-wave15-divergences-<MCP-DATE>.md` | grep artifact freshness |
| GIVER | field-inventories (override + toolbar I/O) | `clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-override-<MCP-DATE>.md`<br>`clients/encore/specs_planning/_internal/field-inventories/corporate-pricing-toolbar-io-<MCP-DATE>.md` | grep inventory 8-key/7-section shape |
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
- [ ] Date placeholders `<MCP-DATE>` resolved to real dates at closure; C6 cells grep-resolve.

---

## Handoff

Wave-1.5 foundation. Produces the inventories + scaffold that WV1.5-A (Override FCC, 5NN) and WV1.5-B (toolbar I/O FCC, 6NN) consume. Runs first in Wave-1.5, before Wave-2.
