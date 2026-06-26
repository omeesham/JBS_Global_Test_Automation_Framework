# Field Inventory — Corporate Pricing › Search toolbar I/O (Export ▾ / Import ▾ / Loc Pricing / Grid Options)

**Module**: corporate-pricing-toolbar-io
**Client**: encore
**MCP_Session_Date**: 2026-06-08
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: Playwright CLI v0.1.8+ (agent-CLI, `playwright-cli -s=cpr-w15-recon`, storageState `clients/encore/.auth/encore-state.json`) — read-only enumeration of action-bar dropdown variants on a DOCX-absent toolbar; unattended; logged under the legacy `Playwright MCP` enum per the frozen field-inventory-spec pending SP-PWC2-05 normalization (`.claude/rules/browser-tool.md`).
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing
**Test_Entity**: Office 1604 (Parker Palm Springs)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md
**Baseline_Scope**: baseline-absent (net-new on e2e; Export/Import variant behavior DOCX-absent — intent oracle = live DOM; raised Q-WV15-2)

---

## URL(s) visited

- **Corporate Pricing Search** (the toolbar host): `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing`. The action bar carries: `New` (split), `Pricing Override`, `Loc Pricing Export`, `Loc Pricing Import`, `Export ▾`, `Import ▾`, `Grid Options`. Entry-point button selectors were already mapped in Wave-1 (`src/selectors/corporate-pricing/search.ts`); this inventory documents the **dropdown variants + trigger behavior** behind them (Wave-1 captured presence-only, master ledger D10).
- No tab navigation — single-screen action bar.

---

## Live-state caveat

Next.js / React + shadcn/Radix (same stack as the Search grid; `:text-is` can miss action-bar labels → shadow-walk `textContent`). The action bar overflows at a headless viewport, so some buttons are present-but-not-visible — assert **presence**, not visibility (matches the Search page object `getAllButtonTexts()` pattern).

| Field | Live (2026-06-08) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Export ▾ menu | 4 variants (Equipment/Labor × Pricing/Max-Discount) | DOCX-absent | Live-discovered (D10); raised Q-WV15-2 — variant behavior + file format undocumented |
| Import ▾ menu | same 4 variants | DOCX-absent | Live-discovered (D10) |
| Loc Pricing Export / Import | direct action (no menu, no dialog) | DOCX-absent | Distinct from Export ▾/Import ▾ — these are single-action buttons |
| Grid Options | column show/hide/reorder popover | DOCX-absent | Popover markup not captured via standard menu/checkbox roles this recon |

---

## Field Inventory

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| New (split button) | (none) — use `button:text-is("New")` | split button → menu | n/a | n/a | always enabled | opens New menu | Already mapped (`btnNew`); menu items below |
| New › Equipment Pricing | (none) — use `[role="menuitem"]:text-is("Equipment Pricing")` | menuitem | n/a | n/a | enabled in menu | navigates `/add?type=equipment` | Route-param `type=equipment` (NM-1440; owned by `SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK`) |
| New › Labor Pricing | (none) — use `[role="menuitem"]:text-is("Labor Pricing")` | menuitem | n/a | n/a | enabled in menu | navigates `/add?type=labor` | Route-param `type=labor` |
| Pricing Override | (none) — use `button:text-is("Pricing Override")` | button (navigation) | n/a | n/a | always enabled | navigates `/corporate-pricing/pg-override` | **CONFIRMED navigates 2026-06-08** → Product Group Override screen (see `corporate-pricing-override-2026-06-08.md`) |
| Loc Pricing Export | (none) — use `button:text-is("Loc Pricing Export")` | button (direct action) | n/a | n/a | always enabled | n/a | Direct — **NO menu/dialog** opened on click (triggers a location-pricing export) |
| Loc Pricing Import | (none) — use `button:text-is("Loc Pricing Import")` | button (direct action) | n/a | file format UNVERIFIED (Q-WV15-2) | always enabled | n/a | Direct — opens a file chooser (no variant menu) |
| Export ▾ | (none) — use `button:text-is("Export")` | dropdown trigger → 4 menuitems | n/a | n/a | always enabled | opens variant menu | Variants below |
| Export ▾ › variants | (none) — use `[role="menuitem"]` within the open Export menu | menuitems (×4) | n/a | n/a | enabled in menu | each exports a different scope | **All Equipment Pricing · All Labor Pricing · All Equipment Max Discount · All Labor Max Discount** |
| Import ▾ | (none) — use `button:text-is("Import")` | dropdown trigger → 4 menuitems | n/a | file format UNVERIFIED (Q-WV15-2) | always enabled | opens variant menu | Same 4 variants as Export ▾ |
| Import ▾ › variants | (none) — use `[role="menuitem"]` within the open Import menu | menuitems (×4) | n/a | n/a | enabled in menu | each imports a different scope | **All Equipment Pricing · All Labor Pricing · All Equipment Max Discount · All Labor Max Discount** |
| Grid Options | (none) — use `button:text-is("Grid Options")` | button → column popover | n/a | n/a | always enabled | toggles grid column visibility/order | Popover structure not captured via standard roles — W15-B enumerates the toggleable columns against live DOM |

> **NOTE — scope boundary**: the action bar's filter checkboxes (`Is Internal` / `Is Labor` / `Active Only`) are **Search-filter** controls, NOT Grid-Options column toggles, and belong to the Wave-1 Search inventory (`corporate-pricing-search-2026-06-05.md`) — do not conflate them with Grid Options when authorizing W15-B.

---

## Labels + Section Names

- **Action-bar buttons** (verbatim): "New", "Pricing Override", "Loc Pricing Export", "Loc Pricing Import", "Export", "Import", "Grid Options"
- **New menu items** (verbatim): "Equipment Pricing", "Labor Pricing"
- **Export ▾ / Import ▾ variants** (verbatim, identical lists): "All Equipment Pricing", "All Labor Pricing", "All Equipment Max Discount", "All Labor Max Discount"

---

## Save-cycle observations

**Save button behavior**: n/a — the toolbar I/O controls perform export/import/navigation actions, NOT a form save. There is no Save button on this surface.
**Save dialog**: n/a.
**Post-save toast**: an Export click likely triggers a file download (no toast captured); Import opens a file chooser.
**Dirty-state behavior**: n/a — no form state on the toolbar.

---

## Known App Bugs

No app bugs identified in this session. (Export/Import variant behavior is undocumented, not defective — raised as Q-WV15-2, not filed.)

---

## Staleness signal

- **Last verified**: 2026-06-08
- **Fresh-until**: 2026-06-22
- **Stale-after**: 2026-07-08
- **Refresh triggers**: Export ▾ / Import ▾ variant list change; Loc Pricing Export/Import becoming menu-driven; Grid Options popover redesign; an answer to Q-WV15-2 establishing documented variant/file-format intent.

---

## Network-request evidence

| Action | API call(s) observed | Status | Inference |
|---|---|---|---|
| Open Export ▾ / Import ▾ | none (client-side menu open) | n/a | Variant menus are client-side; the actual export/import network call fires on a variant click (NOT exercised — real file I/O round-trip deferred to EDGE_P3 per master) |
| Click `Loc Pricing Export` | a file DOWNLOAD fired — `LocationPricebooks-<YYYYMMDD-HHMMSS>UTC.csv` landed in the download dir | n/a | **`Loc Pricing Export` = a direct CSV download** of location pricebooks (distinct scope from the Export ▾ variants). Format = **CSV** (partially answers Q-WV15-2 file-format). Read-only. W15-B captures the endpoint; EDGE_P3 asserts file content. |
| Per Export ▾ variant click | NOT exercised this recon (only the menu was opened) | n/a | Each of the 4 variants is expected to download a scoped CSV (cf. the `Loc Pricing Export` → CSV observation); W15-B captures per-variant endpoint, EDGE_P3 the round-trip. |

---

## Known gaps

- **Export ▾ / Import ▾ per-variant behavior + file format** — only the variant LABELS were enumerated; what each exports/imports and the file format are undocumented. → Q-WV15-2; trigger+variant level owned by W15-B (6NN), real file I/O round-trip deferred to EDGE_P3.
- **Grid Options toggleable-column list** — popover markup not captured via standard roles. → W15-B enumerates against live DOM (LR-029).
- **Loc Pricing Export/Import** vs **Export/Import** semantic difference — both present; the distinction (location-scoped vs grid-scoped) is inferred from labels, not confirmed. → Q-WV15-2 / W15-B.
