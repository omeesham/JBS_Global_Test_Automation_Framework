# Field Inventory — Corporate Pricing / Pricing Strategy ("Locations Using Pricing As Default" grid)

**Module**: corporate-pricing-strategy
**Client**: encore
**MCP_Session_Date**: 2026-06-29
**MCP_Session_Tool**: Playwright CLI (headed-capable; ran headless on refreshed encore-state.json)
**MCP_Tool_Reason**: Functional cross-surface live-verify of the Strategy tab's "Locations Using Pricing As Default" grid + its seeding mechanism; unattended, no visual assertion — CLI per LR-038 v2.
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/details/5f2a4088-9268-b033-4925-a48146afb1cb
**Test_Entity**: Office 1604 — Parker Palm Springs (cross-checked against corporate/master office 1101)

> **Provenance / honest scope**: this artifact TRANSCRIBES a real, dated live Playwright-CLI session
> — recorded verbatim in `walk-evidence-corporate-pricing-2026-06-29.md` — not a fresh walk performed
> at authoring time. That session was a FOCUSED cross-surface verification of the Pricing Strategy
> tab's "Locations Using Pricing As Default" grid and its population path, undertaken because
> `TC-CPR-STR-013` passed vacuously on an empty grid. It is the fresh live-verification anchor for the
> Pricing-Strategy test-case change (TC-CPR-STR-013 rewrite) committed 2026-07-01. The broader Pricing
> Strategy tab field inventory lives in `corporate-pricing-strategy-2026-06-05.md` (now stale) and the
> Pricing Detail / Strategy walk-evidence set. See "Known gaps".

---

## URL(s) visited

- `…/locations/1604/settings/corporate-pricing/details/<GUID>` — Pricebook Details, Pricing Strategy
  tab (fixture pricebook `2022-NP Tier 1`, GUID `5f2a4088…`).
- `…/locations/1101/settings/corporate-pricing` — corporate/master office (LR-ENC-005 cross-check).
- `…/locations/1604/settings/location` → Pricing tab — the seeding surface (Primary Pricing dropdowns).

Tab activation: the "Pricing Strategy" and "Pricing Detail" tabs are in-page Radix tabs on the
Pricebook Details route; Strategy is the default/auto-selected tab and its editor + flags + the
"Locations Using Pricing As Default" table all render on load.

---

## Live-state caveat

| Field | Live (2026-06-29) | Documented default | Drift reason (if known) |
|---|---|---|---|
| "Locations Using Pricing As Default" grid (fixture strategy `2022-NP Tier 1`) | header row only, **0 data rows** | offices `1991` + `7011` (recorded 2026-06-05) | volatile assignment data — the 1991/7011 defaults were reassigned away; the grid is a live back-reference, not a fixed list |

The empty grid on the fixture strategy is a **data-state (seedable), not a defect and not
by-design-empty** — see the positive control below.

---

## Field Inventory

### Pricing Strategy tab — "Locations Using Pricing As Default" grid

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Strategy selector | (none) — use "Total: N" + strategy name | dropdown/list | auto-selects the single strategy (`Total: 1`, `2022-NP Tier 1`) | — | enabled | selects which strategy's grid is shown | — |
| "Locations Using Pricing As Default" table | (none) — use column headers "LOCAL OFFICE" / "LOCAL OFFICE NAME" | read-only grid (section-row) | rows = the offices whose Primary Pricing points at the selected strategy (0 for the fixture strategy this session) | n/a (read-only back-reference) | always rendered; row count varies with cross-surface assignment | populated by Location → Pricing tab "Primary Pricing" selection | Content-anchored rows, e.g. `["1604", "Parker Palm Springs"]` |

### Seeding surface — Location → Pricing tab (Primary Pricing)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Primary Equipment Pricing (USD) | (none) — use label "Primary Equipment Pricing" | dropdown (`PRIMARY_PRICING_DROPDOWNS`) | live read = `2026-Tier 2 Resort B` (office 1604) | — | enabled | selecting a strategy here surfaces this office in that strategy's "Locations Using Pricing As Default" grid | driven by green `TC-LOC-PRI-026..030` |

---

## Labels + Section Names

**Pricing Strategy tab — headings (verbatim)**:

- "Locations Using Pricing As Default"
- table columns: "LOCAL OFFICE", "LOCAL OFFICE NAME"

---

## Save-cycle observations

The "Locations Using Pricing As Default" grid is **read-only** — no direct save on this surface. Its
contents change only via the cross-surface Location → Pricing tab "Primary Pricing" Save (covered by
`TC-LOC-PRI-026..030`). No save dialog on the grid itself. The self-seeded integration test
(TC-CPR-STR-013 rewrite) restores the location's original Primary Pricing selection after asserting.

---

## Known App Bugs

No app bugs identified in this session. The "Locations Using Pricing As Default" grid renders and
populates correctly; the empty grid on the office 1604 fixture strategy is a data-state (no location
currently selects it as Primary Pricing), not a defect. The cross-surface link was proven live: office
1604's `Primary Equipment Pricing` = strategy `2026-Tier 2 Resort B`, and that strategy's grid showed
exactly one row `["1604", "Parker Palm Springs"]` (zero-mutation proof).

---

## Staleness signal

- **Last verified**: 2026-06-29
- **Fresh-until**: 2026-07-13
- **Stale-after**: 2026-07-29
- **Refresh triggers**: Encore release announcement · Pricing Strategy schema change · generator
  spot-check disagreed with this artifact · client-flagged DOM change · Primary Pricing assignment
  churn (the grid contents are volatile).

---

## Known gaps

- This session focused on the "Locations Using Pricing As Default" grid + its seeding path (the
  surface behind the TC-CPR-STR-013 vacuous-pass fix). The full Pricing Strategy tab field inventory
  (strategy editor fields, flags, Pricing Detail tab) is in `corporate-pricing-strategy-2026-06-05.md`
  (now stale) and the Pricing Detail walk-evidence set — read those for the complete field set.
- Grid contents are volatile cross-surface assignment data; any test pinned to fixed offices rots into
  a vacuous pass. The rewritten TC-CPR-STR-013 self-seeds the relationship so it never depends on
  pre-existing assignment data.
