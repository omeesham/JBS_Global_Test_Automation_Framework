# Field Inventory — Corporate Pricing › Export All (fold-refresh 2026-07-09)

**Module**: corporate-pricing-export-all
**Client**: encore
**MCP_Session_Date**: 2026-07-09
**MCP_Session_Tool**: Playwright CLI + spec-driven live re-verification (`playwright-cli`, storageState `clients/encore/.auth/encore-state.json`)
**MCP_Tool_Reason**: Surface re-verified live 2026-07-09 via the `4-new-test E2E` spec run (TC-CPR-EXA-017: Export menu dismisses on outside-click — exit 0, 5 passed, 58.1s). Field-level detail carried forward from corporate-pricing-toolbar-io-2026-06-08.md (the dissolved toolbar_io module's inventory). No fresh exhaustive DOM walk performed today — a targeted spec-driven re-verification confirmed the Export ▾ surface is structurally intact.
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing
**Test_Entity**: Office 1604 (Parker Palm Springs)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md
**Baseline_Scope**: baseline-absent (net-new on e2e; Export variant behavior DOCX-absent — intent oracle = live DOM; raised Q-WV15-2)

---

## URL(s) visited

- **Corporate Pricing Search** (the toolbar host): `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing`. The action bar carries the `Export ▾` dropdown trigger; this inventory documents the **dropdown trigger + 4 variants + outside-click dismiss behavior**.
- No tab navigation — single-screen action bar.

---

## Live-state caveat

> **Fold provenance**: surface relocated from the dissolved toolbar_io module on 2026-07-09; field detail carried forward from corporate-pricing-toolbar-io-2026-06-08.md and re-verified live 2026-07-09 (TC-CPR-EXA-017).

Next.js / React + shadcn/Radix (same stack as the Search grid; `:text-is` can miss action-bar labels → shadow-walk `textContent`). The action bar overflows at a headless viewport, so some buttons are present-but-not-visible — assert **presence**, not visibility (matches the Search page object `getAllButtonTexts()` pattern).

| Field | Live (2026-06-08, re-verified 2026-07-09) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Export ▾ menu | 4 variants (Equipment/Labor × Pricing/Max-Discount) | DOCX-absent | Live-discovered (D10); raised Q-WV15-2 — variant behavior + file format undocumented |

---

## Field Inventory

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Export ▾ | (none) — use `button:text-is("Export")` | dropdown trigger → 4 menuitems | n/a | n/a | always enabled | opens variant menu | Variants below |
| Export ▾ › variants | (none) — use `[role="menuitem"]` within the open Export menu | menuitems (×4) | n/a | n/a | enabled in menu | each exports a different scope | **All Equipment Pricing · All Labor Pricing · All Equipment Max Discount · All Labor Max Discount** |

> **Outside-click dismiss** (TC-CPR-EXA-017): clicking outside the open Export ▾ menu closes the dropdown without triggering any export action. Re-verified live 2026-07-09 (spec passed).

---

## Labels + Section Names

- **Export ▾ trigger** (verbatim): "Export"
- **Export ▾ variants** (verbatim, 4 menuitems): "All Equipment Pricing", "All Labor Pricing", "All Equipment Max Discount", "All Labor Max Discount"

---

## Save-cycle observations

**Save button behavior**: n/a — the Export ▾ control performs export actions, NOT a form save. There is no Save button on this surface.
**Save dialog**: n/a.
**Post-save toast**: an Export variant click likely triggers a file download (no toast captured).
**Dirty-state behavior**: n/a — no form state on the export dropdown.

---

## Known App Bugs

No app bugs identified. Export variant behavior is undocumented, not defective — raised as Q-WV15-2, not filed.

---

## Staleness signal

- **Last verified**: 2026-07-09
- **Fresh-until**: 2026-07-23
- **Stale-after**: 2026-08-06
- **Refresh triggers**: Export ▾ variant list change; variant file format being documented (answer to Q-WV15-2); dropdown dismiss behavior redesign.

---

## Network-request evidence

| Action | API call(s) observed | Status | Inference |
|---|---|---|---|
| Open Export ▾ | none (client-side menu open) | n/a | Variant menu is client-side; the actual export network call fires on a variant click (NOT exercised — real file I/O round-trip deferred to EDGE_P3 per master) |
| Per Export ▾ variant click | NOT exercised this recon (only the menu was opened) | n/a | Each of the 4 variants is expected to download a scoped CSV (cf. the `Loc Pricing Export` → CSV observation); W15-B captures per-variant endpoint, EDGE_P3 the round-trip. |

---

## Known gaps

- **Export ▾ per-variant behavior + file format** — only the variant LABELS were enumerated; what each exports and the file format are undocumented. → Q-WV15-2; trigger+variant level owned by W15-B (6NN), real file I/O round-trip deferred to EDGE_P3.
