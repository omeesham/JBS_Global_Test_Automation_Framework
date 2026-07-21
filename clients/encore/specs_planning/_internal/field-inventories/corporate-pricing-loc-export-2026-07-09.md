# Field Inventory — Corporate Pricing › Loc Pricing Export (fold-refresh 2026-07-09)

**Module**: corporate-pricing-loc-export
**Client**: encore
**MCP_Session_Date**: 2026-07-09
**MCP_Session_Tool**: Playwright CLI + spec-driven live re-verification (`playwright-cli`, storageState `clients/encore/.auth/encore-state.json`)
**MCP_Tool_Reason**: Surface re-verified live 2026-07-09 via the corporate-pricing-toolbar-io spec suite run (TC-CPR-TIO-012: Loc Pricing Export fires the endpoint passed; unrelated stale Import cases TC-CPR-TIO-008..011 failed). Field-level detail carried forward from corporate-pricing-toolbar-io-2026-06-08.md (the dissolved toolbar_io module's inventory). No fresh exhaustive DOM walk performed today — a targeted spec-suite re-verification confirmed the Loc Pricing Export surface.
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing
**Test_Entity**: Office 1604 (Parker Palm Springs)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md
**Baseline_Scope**: baseline-absent (net-new on e2e; loc-export is a direct CSV download, no baseline endpoint)

---

## URL(s) visited

- **Corporate Pricing Search** (the toolbar host): `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing`. The action bar carries `Loc Pricing Export`; this inventory documents the **Loc Pricing Export button → direct CSV download** surface, including endpoint capture and the locale param on the download request.
- No tab navigation — single-screen action bar.

---

## Live-state caveat

> **Fold provenance**: surface relocated from the dissolved toolbar_io module on 2026-07-09; field detail carried forward from corporate-pricing-toolbar-io-2026-06-08.md and re-verified live 2026-07-09 via TIO-012.

Next.js / React + shadcn/Radix (same stack as the Search grid; `:text-is` can miss action-bar labels → shadow-walk `textContent`). The action bar overflows at a headless viewport, so some buttons are present-but-not-visible — assert **presence**, not visibility (matches the Search page object `getAllButtonTexts()` pattern).

| Field | Live (2026-06-08, re-verified 2026-07-09) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Loc Pricing Export | direct action (no menu, no dialog) → CSV download | DOCX-absent | Distinct from Export ▾ — this is a single-action location-pricing export button |

---

## Field Inventory

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Loc Pricing Export | (none) — use `button:text-is("Loc Pricing Export")` | button (direct action) | n/a | n/a | always enabled | n/a | Direct — **NO menu/dialog** opened on click (triggers a location-pricing export) |

---

## Labels + Section Names

- **Loc Pricing Export button** (verbatim): "Loc Pricing Export"

---

## Save-cycle observations

**Save button behavior**: n/a — the Loc Pricing Export control performs a direct export action, NOT a form save. There is no Save button on this surface.
**Save dialog**: n/a.
**Post-save toast**: a Loc Pricing Export click triggers a file download (no toast captured).
**Dirty-state behavior**: n/a — no form state on the export button.

---

## Known App Bugs

No app bugs identified. Loc Pricing Export is a direct CSV download; unrelated stale Import cases TC-CPR-TIO-008..011 failed in the 2026-07-09 toolbar-io-suite run.

---

## Staleness signal

- **Last verified**: 2026-07-09
- **Fresh-until**: 2026-07-23
- **Stale-after**: 2026-08-06
- **Refresh triggers**: Loc Pricing Export becoming menu-driven; download filename pattern change; endpoint path change; locale parameter removal/change; CSV format documentation or file schema change.

---

## Network-request evidence

| Action | API call(s) observed | Status | Inference |
|---|---|---|---|
| Click `Loc Pricing Export` | a file DOWNLOAD fired — `LocationPricebooks-<YYYYMMDD-HHMMSS>UTC.csv` landed in the download dir; request path includes `/navigator/api/location/pricing/location-export`; request carries `locale=en-US` | n/a | **`Loc Pricing Export` = a direct CSV download** of location pricebooks (distinct scope from the Export ▾ variants). Format = **CSV** (partially answers Q-WV15-2 file-format). Read-only. W15-B captures the endpoint; EDGE_P3 asserts file content. |

---

## Known gaps

- **Loc Pricing Export** vs **Export ▾** semantic difference — both present; the distinction (location-scoped vs grid-scoped) is inferred from labels and download behavior, not old-site baseline documentation. → Q-WV15-2 / W15-B.
- **Exact endpoint query beyond locale** — carried-fwd (see source); this fold-refresh records the known location-export path fragment and `locale=en-US` parameter without fabricating additional query parameters.
