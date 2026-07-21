---
module: corporate-pricing
surface: Pricing Strategy → "Locations Using Pricing As Default" grid
date: 2026-06-29
browser_tool: playwright-cli (headed-capable; ran headless on refreshed encore-state.json)
office_primary: 1604
office_cross_check: 1101
plan: SUBPLAN_CORP_PRICING_COVERAGE_FOLLOWUPS.md (Phase B)
classification: data-blocked (seedable via cross-surface Primary Pricing; link proven live)
---

# Walk evidence — Corporate Pricing "Locations Using Pricing As Default" grid (2026-06-29)

**Browser tool**: Playwright CLI. **Reason**: cross-surface functional live-verify of the
Strategy tab's "Locations Using Pricing As Default" grid + its seeding mechanism; unattended,
no visual assertion. Auth via the test-runner-refreshed `clients/encore/.auth/encore-state.json`
(order: open → state-load → goto).

## Why this walk
`TC-CPR-STR-013` ("Selected strategy displays its assigned locations") loops over the grid's rows
and asserts per-row, but **passes vacuously when the grid is empty** (the loop body never runs).
The committed `STRATEGY.expectedLocations` (`src/data/corporate-pricing/strategy.ts:41-44`,
recorded 2026-06-05 as offices `1991` + `7011`) is volatile assignment data. This walk verifies
whether the grid is **seedable** (data-blocked, real) or **by-design empty**, per LR-040(c) +
LR-ENC-005 (re-check 1101, not only 1604).

## Walk findings

### 1. Fixture strategy on office 1604 — grid currently EMPTY
- URL: `/locations/1604/settings/corporate-pricing/details/5f2a4088-9268-b033-4925-a48146afb1cb`
  (fixture pricebook `2022-NP Tier 1`, GUID `5f2a4088…`).
- `Total: 1` strategy (`2022-NP Tier 1`), auto-selected; editor + flags + the
  "Locations Using Pricing As Default" table all render.
- **The grid shows only its header row (`LOCAL OFFICE` / `LOCAL OFFICE NAME`) and ZERO data rows.**
  The `1991` / `7011` defaults recorded on 2026-06-05 have been reassigned away.
- ⇒ This is exactly the vacuous-pass condition: `TC-CPR-STR-013` loops over 0 rows → asserts nothing → green.

### 2. Office 1101 (corporate / master, LR-ENC-005) — corporate pricing data present
- `/locations/1101/settings/corporate-pricing` → **596 items found** (596 corporate pricebooks).
- Confirms corporate pricing data is not absent; the empty 1604 fixture grid is a data-state, not a
  missing feature.

### 3. Seeding mechanism — Location → Pricing tab "Primary Pricing" dropdowns
- The grid is a read-only back-reference: a location selecting a strategy as its **Primary Pricing**
  (Location Settings → Pricing tab, `PRIMARY_PRICING_DROPDOWNS`, driven by green `TC-LOC-PRI-026..030`)
  causes that office to appear in the strategy's "Locations Using Pricing As Default" grid.
- Live read of office 1604's Pricing tab: `Primary Equipment Pricing (USD)` = `2026-Tier 2 Resort B`.

### 4. Positive control — the cross-surface link HOLDS (zero-mutation proof, LR-061 C)
- Office 1604's `Primary Equipment Pricing` = strategy `2026-Tier 2 Resort B`.
- Located that strategy via Corporate Pricing search (1604): pricebook `2026-PB5`
  (GUID `d4f8d502-ca92-5fdf-91d6-5b1bee109f54`), strategy `2026-Tier 2 Resort B` (Equipment, USD, Active).
- Opened it and read the "Locations Using Pricing As Default" grid → **exactly one row:
  `["1604", "Parker Palm Springs"]`.**
- ⇒ The office whose Primary Pricing points at a strategy DOES surface in that strategy's grid.
  The grid is real, populated by the cross-surface Primary Pricing selection, and the link is proven.
- No mutation was made during this walk (the Equipment dropdown was read, opened, and Escaped;
  re-read confirmed it still showed `2026-Tier 2 Resort B`).

## Classification (LR-040 c)
- **c.1 population path**: a Location selecting the strategy as its Primary Pricing on the
  Location → Pricing tab (`selectPrimaryDropdownOption`, MCP-verified; `TC-LOC-PRI-026..030`).
- **c.2 classification**: **data-blocked / seedable** — the grid holds real cross-surface
  assignment data; it is empty for the fixture strategy only because no location currently points at
  it. NOT by-design-empty, NOT feature-blocked.
- **c.3 escalate-if-unknown**: not needed — the population path is known and proven (§4).

## Disposition
Seedable ⇒ the plan's "if seedable" path. `TC-CPR-STR-013` is rewritten as a **self-seeded
cross-surface integration test** (ALL-092: the test controls the data so the loop is never empty):
set office 1604's Primary Equipment Pricing to a known strategy + Save, open that strategy, assert
office 1604 appears in the grid (≥1 row, content-anchored), then restore the location's original
selection. The vacuous 0-row-tolerant assertion is removed.

## Observations

### Bugs / Defects
none — the "Locations Using Pricing As Default" grid renders and populates correctly. The empty grid
on the office 1604 fixture strategy is a data-state (no location currently selects it as Primary
Pricing), not a defect — classified data-blocked / seedable in the walk findings above. The
cross-surface link is proven live (the office whose Primary Pricing points at a strategy does surface
in that strategy's grid).

### Suggestions / Improvements
- The previously-recorded default offices (1991 / 7011, captured 2026-06-05) are volatile assignment
  data that drifts as locations change their Primary Pricing. A test pinned to those fixed offices
  rots silently into a vacuous pass once they reassign. The rewritten test now self-seeds the
  relationship so it never depends on pre-existing assignment data.
