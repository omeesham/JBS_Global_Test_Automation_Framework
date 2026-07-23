# Field Inventory — Corporate Pricing › Loc Pricing Import (fold-refresh 2026-07-09)

**Module**: corporate-pricing-loc-import
**Client**: encore
**MCP_Session_Date**: 2026-07-09
**MCP_Session_Tool**: Playwright CLI + spec-driven live re-verification (`playwright-cli`, storageState `clients/encore/.auth/encore-state.json`)
**MCP_Tool_Reason**: Surface re-verified live 2026-07-09 via the `4-new-test E2E` spec run (TC-CPR-LIM-012: Loc Pricing Import opens the "Import All Location Pricing" dialog — exit 0, 5 passed, 58.1s). Field-level detail carried forward from corporate-pricing-toolbar-io-2026-06-08.md (the dissolved toolbar_io module's inventory). No fresh exhaustive DOM walk performed today — a targeted spec-driven re-verification confirmed the Loc Pricing Import surface is structurally intact.
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing
**Test_Entity**: Office 1604 (Parker Palm Springs)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md
**Baseline_Scope**: baseline-absent (net-new on e2e; Import variant behavior DOCX-absent — intent oracle = live DOM; raised Q-WV15-2)

---

## URL(s) visited

- **Corporate Pricing Search** (the toolbar host): `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing`. The action bar carries `Loc Pricing Import` and `Import ▾`; this inventory documents the **Loc Pricing Import button → "Import All Location Pricing" dialog** and the **Import ▾ dropdown (trigger + 4 variants)**.
- No tab navigation — single-screen action bar.

---

## Live-state caveat

> **Fold provenance**: surface relocated from the dissolved toolbar_io module on 2026-07-09; field detail carried forward from corporate-pricing-toolbar-io-2026-06-08.md and re-verified live 2026-07-09 (TC-CPR-LIM-012).

Next.js / React + shadcn/Radix (same stack as the Search grid; `:text-is` can miss action-bar labels → shadow-walk `textContent`). The action bar overflows at a headless viewport, so some buttons are present-but-not-visible — assert **presence**, not visibility (matches the Search page object `getAllButtonTexts()` pattern).

| Field | Live (2026-06-08, re-verified 2026-07-09) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Import ▾ menu | same 4 variants as Export ▾ | DOCX-absent | Live-discovered (D10) |
| Loc Pricing Import | direct action → "Import All Location Pricing" dialog | DOCX-absent | Distinct from Import ▾ — this is a single-action button that opens a dialog |

---

## Field Inventory

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Loc Pricing Import | (none) — use `button:text-is("Loc Pricing Import")` | button (direct action) | n/a | file format UNVERIFIED (Q-WV15-2) | always enabled | n/a | Opens the "Import All Location Pricing" dialog (TC-CPR-LIM-012 confirmed 2026-07-09) |
| Import ▾ | (none) — use `button:text-is("Import")` | dropdown trigger → 4 menuitems | n/a | file format UNVERIFIED (Q-WV15-2) | always enabled | opens variant menu | Same 4 variants as Export ▾ |
| Import ▾ › variants | (none) — use `[role="menuitem"]` within the open Import menu | menuitems (×4) | n/a | n/a | enabled in menu | each imports a different scope | **All Equipment Pricing · All Labor Pricing · All Equipment Max Discount · All Labor Max Discount** |

> **"Import All Location Pricing" dialog** (TC-CPR-LIM-012): clicking `Loc Pricing Import` opens a dialog titled "Import All Location Pricing" with Browse/Upload/file-input affordances. Re-verified live 2026-07-09 (spec passed). Dialog internals (Browse button, Upload button, file input control) — carried-fwd (see source); detailed selectors for dialog sub-controls not enumerated in the 2026-06-08 toolbar-io walk.

---

## Labels + Section Names

- **Loc Pricing Import button** (verbatim): "Loc Pricing Import"
- **Import ▾ trigger** (verbatim): "Import"
- **Import ▾ variants** (verbatim, 4 menuitems): "All Equipment Pricing", "All Labor Pricing", "All Equipment Max Discount", "All Labor Max Discount"
- **Dialog title** (verbatim, TC-CPR-LIM-012): "Import All Location Pricing"

---

## Save-cycle observations

**Save button behavior**: n/a — the Import controls perform import actions, NOT a form save. There is no Save button on this surface.
**Save dialog**: n/a.
**Post-save toast**: an Import opens a file chooser/dialog; completion behavior not exercised.
**Dirty-state behavior**: n/a — no form state on the import controls.

---

## Observations

### Bugs / Defects

No app bugs identified. Import variant behavior is undocumented, not defective — raised as Q-WV15-2, not filed.

---

### Suggestions / Improvements

none
## Staleness signal

- **Last verified**: 2026-07-09
- **Fresh-until**: 2026-07-23
- **Stale-after**: 2026-08-06
- **Refresh triggers**: Import ▾ variant list change; Loc Pricing Import becoming menu-driven (instead of direct-to-dialog); file format documentation (answer to Q-WV15-2); "Import All Location Pricing" dialog redesign.

---

## Network-request evidence

| Action | API call(s) observed | Status | Inference |
|---|---|---|---|
| Open Import ▾ | none (client-side menu open) | n/a | Variant menu is client-side; the actual import network call fires on a variant click (NOT exercised — real file I/O round-trip deferred to EDGE_P3 per master) |
| Click `Loc Pricing Import` | dialog opens — no network call observed on open (the upload network call fires on file submission) | n/a | **`Loc Pricing Import` opens "Import All Location Pricing" dialog** (TC-CPR-LIM-012). The network call for the actual file upload was NOT exercised. |

---

## Known gaps

- **Import ▾ per-variant behavior + file format** — only the variant LABELS were enumerated; what each imports and the file format are undocumented. → Q-WV15-2; trigger+variant level owned by W15-B (6NN), real file I/O round-trip deferred to EDGE_P3.
- **"Import All Location Pricing" dialog sub-controls** — the dialog title and existence confirmed (TC-CPR-LIM-012); individual Browse/Upload/file-input selectors and validation behavior not exhaustively enumerated in the source walk.
- **Loc Pricing Import** vs **Import ▾** semantic difference — both present; the distinction (location-scoped vs grid-scoped import) is inferred from labels, not confirmed. → Q-WV15-2 / W15-B.
