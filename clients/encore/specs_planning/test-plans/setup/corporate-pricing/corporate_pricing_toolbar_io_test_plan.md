# Corporate Pricing — Search Toolbar I/O Test Plan (NM-1604/1625/1446, Wave-1.5-B FCC)

**Module**: corporate-pricing
**Test Cases**: specs_planning/test-cases/setup/corporate-pricing/corporate_pricing_toolbar_io_test_cases.md
**Field Inventory**: specs_planning/_internal/field-inventories/corporate-pricing-toolbar-io-2026-06-08.md
**Divergences**: specs_planning/_internal/encore-questions-drafts/corporate-pricing-wave15-divergences-2026-06-08.md
**Spec**: clients/encore/tests/corporate-pricing/corporate-pricing-toolbar-io.spec.ts
**Updated**: 2026-06-09 (toolbar I/O trigger-level FCC — Export/Import variants + Loc Pricing + Grid Options)

## Scope boundary

This plan owns the **Corporate Pricing Search action-bar I/O affordances** at **trigger + variant level only**: Export ▾ (4 variants → endpoint), Import ▾ (4 variants → upload dialog), Loc Pricing Export (→ endpoint), Loc Pricing Import (→ upload dialog), and Grid Options (column show/hide + persist-on-reload). **baseline-absent + DOCX-absent** → live DOM is the intent oracle (Q-WV15-2).

**Explicitly OUT of scope (DEFERRED to `SUBPLAN_CORP_PRICING_EDGE_P3.md`, LR-040(b))**: the real download/upload round-trip — asserting downloaded CSV file content/format per variant (`waitForEvent('download')` + parse), real import upload of fixture files, and import validation/error/success. No download-dir or fixture-file infra is built here. Payload-level Jira leads (NM-2164 decimal rounding, NM-1986 row cap, NM-1997/1998/2005 export dataset) are file-content defects → EDGE_P3.

**NOT re-covered**: the `+New ▾` split-button (already FULL P1 — TC-CPR-SRC-016/017; create-flow owned by `SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK`).

**Read-only / mutation safety**: Export tests trigger real CSV downloads (Playwright auto-discards them; `.playwright-cli/*.csv` is gitignored). Import tests open the upload dialog and Cancel without uploading. Grid Options column-visibility is a **server-persisted per-user preference** → the `@mutation` describe restores all columns to visible via `ensureAllGridColumnsVisible()` in before/afterEach (LR-019 baseline + cleanup).

## Live model (verified 2026-06-09, `playwright-cli -s=cpr-toolbar-fcc`, office 1604)

- **Export ▾** (`button:text-is("Export")`) → Radix menu, 4 variants. Each fires `GET /navigator/api/location/pricing/pricing-export?isLabor={t/f}&isMaxDiscount={t/f}&locale=en-US` (+ CSV download). The `isLabor`/`isMaxDiscount` pair maps 1:1 to the variant. Dismisses on Escape + outside-click.
- **Import ▾** (`button:text-is("Import")`) → same 4 variants; each opens a **custom in-app dialog** "Import &lt;variant&gt;" (Browse/Cancel/Upload/Close + `input[type=file]`). NOT a native OS chooser; no network on trigger.
- **Loc Pricing Export** → `GET .../pricing/location-export?locale=en-US` (+ CSV). **Loc Pricing Import** → "Import All Location Pricing" dialog.
- **Grid Options** (`button[aria-label="Grid Options"]` — icon button, sr-only label, LR-029 correction) → Radix menu of 9 `menuitemcheckbox` (one per grid column, all checked). Toggle hides the `<th>`; persists across reload; toggle back restores.

## Selector Mapping

> ZERO toolbar data-testids (Doctrine 4) → text/role/aria-label-anchored. Keys mirror `clients/encore/src/selectors/corporate-pricing/search.ts`. Endpoint constants live in `clients/encore/src/data/corporate-pricing/toolbar-io.ts`.

| Key | Selector | Element |
|-----|----------|---------|
| btnExport | `button:text-is("Export")` | Export ▾ trigger |
| btnImport | `button:text-is("Import")` | Import ▾ trigger |
| btnLocPricingExport | `button:text-is("Loc Pricing Export")` | Loc Pricing Export (direct) |
| btnLocPricingImport | `button:text-is("Loc Pricing Import")` | Loc Pricing Import (direct) |
| btnGridOptions | `button[aria-label="Grid Options"]` | Grid Options gear (icon; sr-only label) |
| mnuToolbarVariant | `[role="menuitem"]` | Export/Import variant items (menu open) |
| mnuGridColumn | `[role="menuitemcheckbox"]` | Grid Options column toggles (menu open) |
| dlgImport | `[role="dialog"], [role="alertdialog"]` (scoped by "Choose a file to import data") | Custom import dialog |
| (export endpoint) | `/navigator/api/location/pricing/pricing-export` | grid-scoped export (LR-056 — API path, not page URL) |
| (loc export endpoint) | `/navigator/api/location/pricing/location-export` | location-scoped export |

## Page-object contract (`CorporatePricingSearchPage` toolbar helpers)

- `openExportMenu()` / `openImportMenu()` — Radix-retry open (mirrors `openNewMenu`).
- `getMenuVariants()` — variant labels in the open menu.
- `clickExportVariantAndCaptureUrl(variant)` — arms `waitForRequest(pricing-export)` before the variant click; returns the export URL (params asserted by the spec).
- `dismissToolbarMenuWithOutsideClick()` — coordinate mouse-click on the heading (locator clicks are obscured by the Radix overlay); returns whether the menu closed.
- `openImportVariantDialog(variant)` / `getImportDialogInfo()` / `closeImportDialog()` — open the upload dialog, read title/buttons/file-input, cancel (no upload).
- `clickLocPricingExportAndCaptureUrl()` — arms `waitForRequest(location-export)`; returns the URL.
- `openLocPricingImportDialog()` — opens the "Import All Location Pricing" dialog.
- `openGridOptions()` / `getGridOptionColumns()` / `toggleGridColumn(label)` / `closeGridOptions()` / `isGridColumnVisible(label)` / `ensureAllGridColumnsVisible()` — Grid Options menu + grid-header reads + restore.

---

## Scenario: TC-CPR-TIO-001 - Export ▾ opens with all 4 variants
1. Step: Open Export ▾, expected: dropdown opens
2. Step: Read variants, expected: All Equipment Pricing / All Labor Pricing / All Equipment Max Discount / All Labor Max Discount present

## Scenario: TC-CPR-TIO-002 - Export "All Equipment Pricing" endpoint
1. Step: Open Export ▾, click the variant (arms waitForRequest), expected: download begins
2. Step: Inspect the export URL, expected: `pricing-export?isLabor=false&isMaxDiscount=false&locale=en-US`

## Scenario: TC-CPR-TIO-003 - Export "All Labor Pricing" endpoint
1. Step: Click the variant, expected: URL `isLabor=true&isMaxDiscount=false&locale=en-US`

## Scenario: TC-CPR-TIO-004 - Export "All Equipment Max Discount" endpoint
1. Step: Click the variant, expected: URL `isLabor=false&isMaxDiscount=true&locale=en-US`

## Scenario: TC-CPR-TIO-005 - Export "All Labor Max Discount" endpoint
1. Step: Click the variant, expected: URL `isLabor=true&isMaxDiscount=true&locale=en-US`

## Scenario: TC-CPR-TIO-006 - Export ▾ dismisses on outside-click
1. Step: Open Export ▾ (confirm open), expected: variants visible
2. Step: Click outside the menu (heading), expected: menu closes

## Scenario: TC-CPR-TIO-007 - Import ▾ opens with all 4 variants
1. Step: Open Import ▾, expected: dropdown opens
2. Step: Read variants, expected: same 4 labels as Export ▾

## Scenario: TC-CPR-TIO-008 - Import "All Equipment Pricing" upload dialog
1. Step: Open Import ▾, click the variant, expected: a dialog opens (not a native chooser)
2. Step: Read the dialog, expected: title "Import All Equipment Pricing", Browse/Upload buttons, file input present
3. Step: Close the dialog, expected: no upload

## Scenario: TC-CPR-TIO-009 - Import "All Labor Pricing" upload dialog
1. Step: Open the variant dialog, expected: title "Import All Labor Pricing", file input present; close

## Scenario: TC-CPR-TIO-010 - Import "All Equipment Max Discount" upload dialog
1. Step: Open the variant dialog, expected: title "Import All Equipment Max Discount", file input present; close

## Scenario: TC-CPR-TIO-011 - Import "All Labor Max Discount" upload dialog
1. Step: Open the variant dialog, expected: title "Import All Labor Max Discount", Browse/Upload/Cancel/Close + file input; close

## Scenario: TC-CPR-TIO-012 - Loc Pricing Export endpoint
1. Step: Click "Loc Pricing Export" (arms waitForRequest), expected: download begins
2. Step: Inspect the URL, expected: `location-export?locale=en-US`

## Scenario: TC-CPR-TIO-013 - Loc Pricing Import dialog
1. Step: Click "Loc Pricing Import", expected: dialog "Import All Location Pricing" with Browse/Upload + file input; close

## Scenario: TC-CPR-TIO-014 - Grid Options lists every column, all enabled
1. Step: Open Grid Options (gear), expected: menu opens
2. Step: Read column toggles, expected: 9 columns present (Price Book … Currency), all checked

## Scenario: TC-CPR-TIO-015 - Toggling a column OFF hides its header
1. Step: Confirm "Price Year" header present, expected: visible
2. Step: Open Grid Options, uncheck "Price Year", close, expected: header gone

## Scenario: TC-CPR-TIO-016 - Hidden column persists after reload
1. Step: Uncheck "Price Year", expected: header gone
2. Step: Reload + re-navigate, expected: header still absent (server-persisted)

## Scenario: TC-CPR-TIO-017 - Toggling back ON restores the column
1. Step: Uncheck "Price Year", expected: header gone
2. Step: Re-check "Price Year", expected: header restored

## Coverage Index (regenerated 2026-06-11 from the test-cases file)

Authoritative current case list (17 cases). Scenario prose above may lag; this index is mechanically regenerated.

- TC-CPR-TIO-001 — Export ▾ opens and lists all 4 export variants
- TC-CPR-TIO-002 — Export "All Equipment Pricing" fires the equipment-pricing export endpoint
- TC-CPR-TIO-003 — Export "All Labor Pricing" fires the labor-pricing export endpoint
- TC-CPR-TIO-004 — Export "All Equipment Max Discount" fires the equipment-max-discount export endpoint
- TC-CPR-TIO-005 — Export "All Labor Max Discount" fires the labor-max-discount export endpoint
- TC-CPR-TIO-006 — Export ▾ menu dismisses on outside-click
- TC-CPR-TIO-007 — Import ▾ opens and lists all 4 import variants
- TC-CPR-TIO-008 — Import "All Equipment Pricing" opens its titled upload dialog (no native file chooser)
- TC-CPR-TIO-009 — Import "All Labor Pricing" opens its titled upload dialog
- TC-CPR-TIO-010 — Import "All Equipment Max Discount" opens its titled upload dialog
- TC-CPR-TIO-011 — Import "All Labor Max Discount" opens its titled upload dialog
- TC-CPR-TIO-012 — Loc Pricing Export fires the location-export endpoint
- TC-CPR-TIO-013 — Loc Pricing Import opens the "Import All Location Pricing" dialog
- TC-CPR-TIO-014 — Grid Options opens and lists every grid column, all enabled by default
- TC-CPR-TIO-015 — Toggling a column OFF removes its header from the grid
- TC-CPR-TIO-016 — A hidden column stays hidden after a page reload (persists)
- TC-CPR-TIO-017 — Toggling a hidden column back ON restores its header
