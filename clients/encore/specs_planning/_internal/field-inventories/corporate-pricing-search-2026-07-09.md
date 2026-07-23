# Field Inventory — Corporate Pricing › Search / Grid Options (fold-refresh 2026-07-09)

**Module**: corporate-pricing-search
**Client**: encore
**MCP_Session_Date**: 2026-07-09
**MCP_Session_Tool**: Playwright CLI + spec-driven live re-verification (`playwright-cli`, storageState `clients/encore/.auth/encore-state.json`)
**MCP_Tool_Reason**: Surface re-verified live 2026-07-09 via the `4-new-test E2E` spec run (TC-CPR-SRC-057: Every grid column toggle is enabled (checked) by default; TC-CPR-SRC-058: Toggling a hidden column back ON restores its header — exit 0, 5 passed, 58.1s). Field-level detail carried forward from corporate-pricing-toolbar-io-2026-06-08.md (Grid Options row) and corporate-pricing-search-2026-06-05.md (grid column list). No fresh exhaustive DOM walk performed today — a targeted spec-driven re-verification confirmed the Grid Options surface is structurally intact.
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing
**Test_Entity**: Office 1604 (Parker Palm Springs)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md
**Baseline_Scope**: baseline-absent (net-new on e2e; Grid Options popover behavior DOCX-absent — intent oracle = live DOM)

---

## URL(s) visited

- **Corporate Pricing Search** (the toolbar host): `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing`. The action bar carries the `Grid Options` button; this inventory documents the **Grid Options column show/hide/persist surface** (default-all-on, toggle-off-then-on-restores).
- No tab navigation — single-screen action bar.

---

## Live-state caveat

> **Fold provenance**: surface relocated from the dissolved toolbar_io module on 2026-07-09; field detail carried forward from corporate-pricing-toolbar-io-2026-06-08.md and re-verified live 2026-07-09 (TC-CPR-SRC-057, TC-CPR-SRC-058).

Next.js / React + shadcn/Radix (same stack as the Search grid; `:text-is` can miss action-bar labels → shadow-walk `textContent`). The action bar overflows at a headless viewport, so some buttons are present-but-not-visible — assert **presence**, not visibility (matches the Search page object `getAllButtonTexts()` pattern).

| Field | Live (2026-06-08, re-verified 2026-07-09) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Grid Options | column show/hide/reorder popover; all toggles enabled (checked) by default | DOCX-absent | Popover markup not captured via standard menu/checkbox roles on 2026-06-08 recon; toggle behavior confirmed by TC-CPR-SRC-057/058 on 2026-07-09 |

---

## Field Inventory

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Grid Options | (none) — use `button:text-is("Grid Options")` | button → column popover | n/a | n/a | always enabled | toggles grid column visibility/order | Popover contains per-column toggles; all checked by default (TC-CPR-SRC-057) |

> **Grid column list** (from corporate-pricing-search-2026-06-05.md — the 9 toggleable columns):
> Price Book · Price Book Strategy · Price Year · Is GSO · Is Internal · Is Labor · Is Active · Is Productions · Currency
>
> **Default state** (TC-CPR-SRC-057, confirmed 2026-07-09): every grid column toggle is enabled (checked) by default — all 9 columns visible on initial load.
>
> **Toggle-restore behavior** (TC-CPR-SRC-058, confirmed 2026-07-09): toggling a hidden column back ON restores its header in the grid.

> **NOTE — scope boundary**: the action bar's filter checkboxes (`Is Internal` / `Is Labor` / `Active Only`) are **Search-filter** controls, NOT Grid-Options column toggles, and belong to the Search filter inventory (`corporate-pricing-search-2026-06-05.md` / `corporate-pricing-search-2026-06-10.md`) — do not conflate them with Grid Options.

---

## Labels + Section Names

- **Grid Options trigger** (verbatim): "Grid Options"
- **Grid column headers** (verbatim, the toggleable set): "Price Book", "Price Book Strategy", "Price Year", "Is GSO", "Is Internal", "Is Labor", "Is Active", "Is Productions", "Currency"

---

## Save-cycle observations

**Save button behavior**: n/a — Grid Options toggle column visibility in the grid, NOT a form save. There is no Save button on this surface.
**Save dialog**: n/a.
**Post-save toast**: n/a.
**Dirty-state behavior**: column visibility state persists within the session (carried-fwd; see source — persistence mechanism not exhaustively verified in the 2026-06-08 walk).

---

## Observations

### Bugs / Defects

No app bugs identified in this session.

---

### Suggestions / Improvements

none
## Staleness signal

- **Last verified**: 2026-07-09
- **Fresh-until**: 2026-07-23
- **Stale-after**: 2026-08-06
- **Refresh triggers**: Grid Options popover redesign; column list change (add/remove columns); toggle persistence behavior change; column reorder implementation change.

---

## Network-request evidence

| Action | API call(s) observed | Status | Inference |
|---|---|---|---|
| Open Grid Options popover | carried-fwd (see source) | n/a | Popover open is client-side (no network call observed in toolbar-io-2026-06-08 walk) |
| Toggle column off/on | carried-fwd (see source) | n/a | Column visibility toggle is client-side (grid re-renders without a server call) |

---

## Known gaps

- **Grid Options toggleable-column list** — the popover markup was not captured via standard roles in the 2026-06-08 recon. The 9-column list is inferred from the grid headers (corporate-pricing-search-2026-06-05.md). W15-B enumerates against live DOM (LR-029).
- **Column reorder behavior** — Grid Options is described as "show/hide/reorder" but only show/hide was verified (TC-CPR-SRC-057/058). Reorder mechanism (drag? up/down?) not exercised.
- **Persistence scope** — whether column visibility state persists across page reloads or sessions is not confirmed.
