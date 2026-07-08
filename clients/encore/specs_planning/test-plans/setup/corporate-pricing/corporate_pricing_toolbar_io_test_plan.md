# Corporate Pricing — Search Toolbar I/O Test Plan — baseline (NM-1604 / NM-1625 / NM-1446)

**Module**: corporate-pricing | **Submodule**: toolbar_io | **Total**: 17 | **Updated**: 2026-07-08

> Baseline toolbar surface plan (Export ▾ / Import ▾ triggers, Loc Pricing Export / Import triggers, Grid Options) + the shared surface reference (live model, selector mapping, page-object contract). The real round-trip plans split to sibling submodule plans: `corporate_pricing_loc_export_test_plan.md` (NM-2262), `corporate_pricing_export_all_test_plan.md` (NM-2264), `corporate_pricing_loc_import_test_plan.md` (NM-2305).

---

## Live model (verified 2026-06-09, `playwright-cli -s=cpr-toolbar-fcc`, office 1604)

- **Export ▾** (`button:text-is("Export")`) → Radix menu, 4 variants. Each variant now opens a shared **"Export" precondition dialog** (Year(s) multi-select 2021–2028 cap 3 + Currency USD/CAD/MXN; Continue disabled until both set; Cancel/Close dismiss). On Continue the export fires `GET /navigator/api/location/pricing/pricing-export?isLabor={t/f}&isMaxDiscount={t/f}&currencyId={1|2|3}&locale=en-US&years={y[,y,y]}` [200] (+ CSV download — a wide product-group × pricebook matrix). `isLabor`/`isMaxDiscount` map 1:1 to the variant; currencyId USD=1/CAD=2/MXN=3 (live 2026-07-07). The menu itself still dismisses on Escape + outside-click.
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
- `openExportVariantDialog(variant)` / `getExportDialogInfo()` / `isExportContinueEnabled()` / `setExportYears([years])` / `attemptExtraExportYear(y)` / `getExportSelectedYears()` / `getExportCurrencyOptions()` / `setExportCurrency(code)` / `cancelExportDialog()` / `closeExportDialog()` / `cancelExportAndCheckNoRequest(...)` — NM-2264 Export dialog gate helpers.
- `continueExportAndCaptureRequest()` — clicks Continue on the configured dialog and returns `{ url, status }` for the param-only tests (currencyId / years / variant flags) without reading the file.
- `downloadExportVariant(variant, years, currency)` — NM-2264 real round-trip: opens Export ▾ → variant → sets Year(s)+Currency in the gate → passes the **post-gate Continue button** as the trigger to the reused `captureCsvDownload`; returns `CsvDownloadResult & { status: number }` (status captured via the backing response; throws if uncaptured — no null escape). Helpers `exportPricebookColumns(headers)` + `exportProductGroupIds(result)` slice the matrix for the pricebook/duplicate cross-checks. (The pre-gate direct-fire helper was removed — that contract no longer exists in the app.)
- `dismissToolbarMenuWithOutsideClick()` — coordinate mouse-click on the heading (locator clicks are obscured by the Radix overlay); returns whether the menu closed.
- `openImportVariantDialog(variant)` / `getImportDialogInfo()` / `closeImportDialog()` — open the upload dialog, read title/buttons/file-input, cancel (no upload).
- `clickLocPricingExportAndCaptureUrl()` — arms `waitForRequest(location-export)`; returns the URL (endpoint-only, TC-CPR-TIO-012).
- `downloadLocPricingExport()` — NM-2262 real round-trip: arms `waitForEvent('download')` + `waitForRequest(location-export)` on the SAME click; reads the file from the browser temp path; returns `{ filename, content, headers, rows, rowCount, requestUrl }` (quote-aware CSV parse). Reusable by the grid-scoped Export variants (NM-2264).
- `openLocPricingImportDialog()` — opens the "Import All Location Pricing" dialog.
- `openGridOptions()` / `getGridOptionColumns()` / `toggleGridColumn(label)` / `closeGridOptions()` / `isGridColumnVisible(label)` / `ensureAllGridColumnsVisible()` — Grid Options menu + grid-header reads + restore.

---

## Scenario: TC-CPR-TIO-001 - Export ▾ opens with all 4 variants
1. Step: Open Export ▾, expected: dropdown opens
2. Step: Read variants, expected: All Equipment Pricing / All Labor Pricing / All Equipment Max Discount / All Labor Max Discount present

## Scenario: TC-CPR-TIO-002 - Export "All Equipment Pricing" dialog + gated endpoint
1. Step: Open Export ▾, click the variant, expected: the "Export" Year(s)+Currency dialog opens (Continue disabled)
2. Step: Set Year(s)=2026 + Currency=USD, Continue, expected: `pricing-export?isLabor=false&isMaxDiscount=false...locale=en-US` [200]

## Scenario: TC-CPR-TIO-003 - Export "All Labor Pricing" dialog + gated endpoint
1. Step: Open the variant dialog, set Year(s)=2026 + Currency=USD, Continue, expected: URL `isLabor=true&isMaxDiscount=false...locale=en-US` [200]

## Scenario: TC-CPR-TIO-004 - Export "All Equipment Max Discount" dialog + gated endpoint
1. Step: Open the variant dialog, set Year(s)=2026 + Currency=USD, Continue, expected: URL `isLabor=false&isMaxDiscount=true...locale=en-US` [200]

## Scenario: TC-CPR-TIO-005 - Export "All Labor Max Discount" dialog + gated endpoint
1. Step: Open the variant dialog, set Year(s)=2026 + Currency=USD, Continue, expected: URL `isLabor=true&isMaxDiscount=true...locale=en-US` [200]

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


## Coverage Index

- TC-CPR-TIO-001 — Export ▾ opens and lists all 4 export variants
- TC-CPR-TIO-002 — Export "All Equipment Pricing" — dialog + gated equipment-pricing export
- TC-CPR-TIO-003 — Export "All Labor Pricing" — dialog + gated labor-pricing export
- TC-CPR-TIO-004 — Export "All Equipment Max Discount" — dialog + gated equipment max-discount export
- TC-CPR-TIO-005 — Export "All Labor Max Discount" — dialog + gated labor max-discount export
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
