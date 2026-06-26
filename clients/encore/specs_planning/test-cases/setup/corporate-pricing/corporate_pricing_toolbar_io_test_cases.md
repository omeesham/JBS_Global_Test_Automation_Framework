# Corporate Pricing — Search Toolbar I/O Test Cases (NM-1604/1625/1446, Wave-1.5-B FCC)

**Module**: corporate-pricing | **Total**: 17 | **Status**: Automated | **Updated**: 2026-06-09

---

## MCP_VERIFICATION_LOG — Search Toolbar I/O (Export ▾ / Import ▾ / Loc Pricing / Grid Options)

| Field | Value |
|-------|-------|
| Date | 2026-06-09 |
| URL | https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing |
| Office/Entity | 1604 (Parker Palm Springs); Search grid = 591 items, 9 columns |
| Intent oracle | **baseline-absent + DOCX-absent** — toolbar I/O behavior is undocumented (Q-WV15-2); live DOM is the sole intent oracle. Jira leads NM-1604/1625/1446 (unconfirmed, cross-ref note). Consumes `field-inventories/corporate-pricing-toolbar-io-2026-06-08.md` (W15-0 recon, which captured variant LABELS only — this session exercised the per-variant TRIGGERS). |
| Tool | Playwright CLI v0.1.8+ (`playwright-cli -s=cpr-toolbar-fcc`, storageState `clients/encore/.auth/encore-state.json`) — read-only trigger enumeration + network capture |
| Scope | **TRIGGER + VARIANT level ONLY.** Real download/upload round-trip (file content, import validation/error/success) is DEFERRED to `SUBPLAN_CORP_PRICING_EDGE_P3.md` (LR-040(b) grep-verifiable). No fixture files / download-dir infra built here. |
| Stack | React/Next.js (App Router, RSC); `waitForAngularStable` is a no-op (wait for `tbody tr`/`th`). Action bar overflows at narrow viewports — config runs at 1920×1080 so all 7 buttons are clickable. |
| **Export ▾** | `button:text-is("Export")` → Radix menu, **4 variants** (All Equipment Pricing / All Labor Pricing / All Equipment Max Discount / All Labor Max Discount). Each variant fires **`GET /navigator/api/location/pricing/pricing-export?isLabor={t/f}&isMaxDiscount={t/f}&locale=en-US`** + a direct CSV download (EquipmentPricings.csv / LaborPricings.csv / EquipmentMaxDiscounts.csv / LaborMaxDiscounts.csv). `isLabor`+`isMaxDiscount` map 1:1 to the variant. Menu dismisses on Escape AND outside-click. |
| **Import ▾** | `button:text-is("Import")` → Radix menu, **same 4 variants**. Each variant click opens a **custom in-app dialog** titled "Import &lt;variant&gt;" (e.g. "Import All Equipment Pricing") with prompt "Choose a file to import data.", buttons Browse/Cancel/Upload/Close, and an `input[type=file]`. **NOT a native OS file chooser; NO network fires on trigger** (the upload POST fires only after a file is chosen + Upload — EDGE_P3). |
| **Loc Pricing Export** | `button:text-is("Loc Pricing Export")` → **`GET /navigator/api/location/pricing/location-export?locale=en-US`** + CSV download (`LocationPricebooks-*.csv`). A location-scoped export distinct from the grid-scoped Export ▾. |
| **Loc Pricing Import** | `button:text-is("Loc Pricing Import")` → opens the dialog titled **"Import All Location Pricing"** (same Browse/Upload/Cancel/Close + file-input shape). No network on trigger. |
| **Grid Options** | **`button[aria-label="Grid Options"]`** — a 32×32 ICON button (its "Grid Options" label is sr-only, so `:text-is` cannot match it; LR-029 live correction). `aria-haspopup="menu"` → Radix menu with **9 `menuitemcheckbox`** (one per grid column: Price Book, Price Book Strategy, Price Year, Is GSO, Is Internal, Is Labor, Is Active, Is Productions, Currency), **all checked by default**. Toggling a column OFF removes its `<th>` from the grid; the hidden state **persists across reload** (server-persisted per-user preference); toggling back ON restores it. |
| data-testid coverage | **ZERO** on the toolbar (text/role/aria-label-anchored — Doctrine 4). |
| Mutation safety | Exports are read-only downloads (auto-discarded; CSVs gitignored). Imports are cancelled uncommitted (no file uploaded). Grid Options column-visibility persists per user → the @mutation describe restores all columns to visible in before/afterEach via `ensureAllGridColumnsVisible()`. |

### Clarifications (RAISED — Doctrine 2; Jira leads live-verified per LR-044) — see `encore-questions-drafts/corporate-pricing-wave15-divergences-2026-06-08.md`

| # | Intent / lead | Live reality (2026-06-09, trigger-level) | Disposition |
|---|---|---|---|
| Q-WV15-2 | Export ▾ / Import ▾ variant behavior + file format | Export = `GET pricing-export?isLabor&isMaxDiscount&locale=en-US` → CSV (4 variants); Import = custom upload dialog per variant | **PARTIALLY ANSWERED at trigger level** (endpoint + locale + CSV + dialog). Payload/dedupe/row-counts = EDGE_P3 (real I/O). Still RAISED for documented intent. |
| NM-1604 | 4 export variants + locale | 4 variants confirmed; every export carries `locale=en-US` | **confirmed-live (2026-06-09)** at trigger level (endpoint + locale params). |
| NM-1625 / NM-1446 | import payload / dedupe / counts | Import opens an upload dialog (trigger only); payload not exercised | **deferred-to-EDGE_P3** (requires a real upload — out of this subplan's scope). |
| NM-2126 | non-Revenue-Management users can still export/import (RBAC gap) | The automation user CAN open Export/Import + fire the export endpoints | **not-reproducible-single-account** — the role gate cannot be proven/disproven with one account (no RM vs non-RM comparison). Trigger verdict: export/import available to this user; RBAC negative is NOT-AUTOMATABLE. |
| NM-2164 | Max Discount import rounds decimals to whole numbers | requires inspecting an imported payload | **deferred-to-EDGE_P3** (payload-level, real upload). |
| NM-1986 | import caps ~50 rows / single pricebook | requires a real multi-row upload | **deferred-to-EDGE_P3**. |
| NM-1997 / NM-1998 / NM-2005 | export includes duplicate product groups / wrong/missing dataset | requires inspecting downloaded CSV content | **deferred-to-EDGE_P3** (file-content assertions). |

> Trigger-level scope cannot confirm/deny the payload-level defects (NM-2164/1986/1997/1998/2005) — they manifest only in the downloaded/uploaded FILE content, which EDGE_P3 owns. They are recorded here as live-proof-gated leads, not encoded as expectations (LR-044).

---

## FIELD INVENTORY — Search Toolbar I/O

ZERO toolbar data-testids; text/role/aria-label-anchored. Consumes `field-inventories/corporate-pricing-toolbar-io-2026-06-08.md`.

| Affordance | Trigger selector | Control type | Trigger behavior | Notes |
|---|---|---|---|---|
| Export ▾ | `button:text-is("Export")` | dropdown → 4 menuitems | opens variant menu | dismisses on Escape + outside-click |
| Export variant | `[role="menuitem"]` (menu open) | menuitem ×4 | `GET pricing-export?isLabor&isMaxDiscount&locale` + CSV | params map 1:1 to variant |
| Import ▾ | `button:text-is("Import")` | dropdown → 4 menuitems | opens variant menu | same 4 labels as Export |
| Import variant | `[role="menuitem"]` (menu open) | menuitem ×4 | opens "Import &lt;variant&gt;" dialog | no network on trigger |
| Import dialog | `[role="dialog"], [role="alertdialog"]` (prompt "Choose a file to import data") | dialog | Browse/Cancel/Upload/Close + `input[type=file]` | upload = EDGE_P3 |
| Loc Pricing Export | `button:text-is("Loc Pricing Export")` | button (direct) | `GET location-export?locale=en-US` + CSV | location-scoped |
| Loc Pricing Import | `button:text-is("Loc Pricing Import")` | button (direct) | opens "Import All Location Pricing" dialog | no network on trigger |
| Grid Options | `button[aria-label="Grid Options"]` | icon button → menu | menu of 9 `menuitemcheckbox` | sr-only label; LR-029 correction |
| Grid column toggle | `[role="menuitemcheckbox"]` (menu open) | checkbox ×9 | toggle hides/shows `<th>`; persists on reload | all checked by default |

## Validation Rules

- **Export variant → endpoint**: each of the 4 variants fires `pricing-export` with the matching `isLabor`/`isMaxDiscount` pair + `locale=en-US`. Assert on the backend API path, never the page URL (LR-056).
- **Import variant → dialog**: opens a custom upload dialog (NOT a native chooser); the dialog title is variant-specific. No upload performed (EDGE_P3).
- **Loc Pricing Export → endpoint**: `location-export?locale=en-US` (distinct from the grid Export ▾ `pricing-export`).
- **Grid Options**: every grid column is a toggle, all on by default; toggling off hides the `<th>` and persists across reload; restore by toggling back on (mutation safety).
- **No hardcoded structural counts** in assertions (LR-022) — assert each expected variant/column label is present, behavior on toggle, and endpoint params; never `.toHaveLength(N)`.

## Selector-Mapping (spec ↔ selector)

| Spec helper | Selector key (`CorporatePricingSearchSelectors`) | Value |
|---|---|---|
| `openExportMenu()` | `btnExport` | `button:text-is("Export")` |
| `openImportMenu()` | `btnImport` | `button:text-is("Import")` |
| `getMenuVariants()` / variant click | `mnuToolbarVariant` | `[role="menuitem"]` |
| `clickLocPricingExportAndCaptureUrl()` | `btnLocPricingExport` | `button:text-is("Loc Pricing Export")` |
| `openLocPricingImportDialog()` | `btnLocPricingImport` | `button:text-is("Loc Pricing Import")` |
| `getImportDialogInfo()` | `dlgImport` | `[role="dialog"], [role="alertdialog"]` (scoped by prompt text) |
| `openGridOptions()` | `btnGridOptions` | `button[aria-label="Grid Options"]` (LR-029 corrected) |
| `getGridOptionColumns()` / `toggleGridColumn()` | `mnuGridColumn` | `[role="menuitemcheckbox"]` |

---

## TC-CPR-TIO-001: Export ▾ opens and lists all 4 export variants
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: Authenticated on office 1604; Corporate Pricing Search grid loaded.

**Steps**:
1. Click the Export ▾ button -> the dropdown menu opens
2. Read the menu items -> All Equipment Pricing, All Labor Pricing, All Equipment Max Discount, All Labor Max Discount

**Expected**: The Export ▾ dropdown opens and lists all 4 export variants.
**Data**: office=1604

---

## TC-CPR-TIO-002: Export "All Equipment Pricing" fires the equipment-pricing export endpoint
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-TIO-001
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
1. Open Export ▾ and click "All Equipment Pricing" -> a download begins
2. Capture the export request -> the pricing-export call fires for the Equipment, standard-pricing scope, in the en-US locale

**Expected**: The "All Equipment Pricing" variant fires the pricing-export action scoped to Equipment standard pricing (en-US locale), asserted on the backend export call (not the page URL). File content is out of scope (EDGE_P3).
**Data**: office=1604

---

## TC-CPR-TIO-003: Export "All Labor Pricing" fires the labor-pricing export endpoint
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-TIO-001
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
1. Open Export ▾ and click "All Labor Pricing"
2. Capture the export request -> the pricing-export call fires for the Labor, standard-pricing scope, in the en-US locale

**Expected**: The "All Labor Pricing" variant fires the pricing-export action scoped to Labor standard pricing (en-US locale), asserted on the backend export call.
**Data**: office=1604

---

## TC-CPR-TIO-004: Export "All Equipment Max Discount" fires the equipment-max-discount export endpoint
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-TIO-001
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
1. Open Export ▾ and click "All Equipment Max Discount"
2. Capture the export request -> the pricing-export call fires for the Equipment, max-discount scope, in the en-US locale

**Expected**: The "All Equipment Max Discount" variant fires the pricing-export action scoped to Equipment max-discount data (en-US locale), asserted on the backend export call.
**Data**: office=1604

---

## TC-CPR-TIO-005: Export "All Labor Max Discount" fires the labor-max-discount export endpoint
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-TIO-001
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
1. Open Export ▾ and click "All Labor Max Discount"
2. Capture the export request -> the pricing-export call fires for the Labor, max-discount scope, in the en-US locale

**Expected**: The "All Labor Max Discount" variant fires the pricing-export action scoped to Labor max-discount data (en-US locale), asserted on the backend export call.
**Data**: office=1604

---

## TC-CPR-TIO-006: Export ▾ menu dismisses on outside-click
| Priority | Status | Type |
|----------|--------|------|
| Low | Automated | Functional |

**Depends_On**: TC-CPR-TIO-001
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
1. Open Export ▾ (menu confirmed open)
2. Click outside the menu (on the page heading) -> the menu closes

**Expected**: The Export ▾ menu dismisses on an outside-click (standard dropdown behavior).
**Data**: office=1604

---

## TC-CPR-TIO-007: Import ▾ opens and lists all 4 import variants
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
1. Click the Import ▾ button -> the dropdown menu opens
2. Read the menu items -> the same 4 variants as Export ▾

**Expected**: The Import ▾ dropdown opens and lists all 4 import variants (identical labels to Export ▾).
**Data**: office=1604

---

## TC-CPR-TIO-008: Import "All Equipment Pricing" opens its titled upload dialog (no native file chooser)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-TIO-007
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
1. Open Import ▾ and click "All Equipment Pricing" -> a dialog opens (NOT a native OS file chooser)
2. Read the dialog -> title "Import All Equipment Pricing", prompt "Choose a file to import data.", buttons Browse/Cancel/Upload/Close, a file input present
3. Close the dialog (no file uploaded)

**Expected**: The Import variant opens a custom in-app upload dialog titled for the variant, carrying a file input and Browse/Upload controls. The actual upload is out of scope (EDGE_P3).
**Data**: office=1604

---

## TC-CPR-TIO-009: Import "All Labor Pricing" opens its titled upload dialog
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-TIO-007
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
1. Open Import ▾ and click "All Labor Pricing" -> dialog "Import All Labor Pricing" opens with a file input
2. Close the dialog

**Expected**: The variant opens its titled upload dialog with a file input.
**Data**: office=1604

---

## TC-CPR-TIO-010: Import "All Equipment Max Discount" opens its titled upload dialog
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-TIO-007
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
1. Open Import ▾ and click "All Equipment Max Discount" -> dialog "Import All Equipment Max Discount" opens with a file input
2. Close the dialog

**Expected**: The variant opens its titled upload dialog with a file input.
**Data**: office=1604

---

## TC-CPR-TIO-011: Import "All Labor Max Discount" opens its titled upload dialog
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-TIO-007
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
1. Open Import ▾ and click "All Labor Max Discount" -> dialog "Import All Labor Max Discount" opens
2. Read the dialog buttons -> Browse, Upload, Cancel, Close present; file input present
3. Close the dialog

**Expected**: The variant opens its titled upload dialog with the full Browse/Upload/Cancel/Close control set and a file input.
**Data**: office=1604

---

## TC-CPR-TIO-012: Loc Pricing Export fires the location-export endpoint
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
1. Click "Loc Pricing Export" (direct, no menu) -> a download begins
2. Capture the request -> `GET .../pricing/location-export?locale=en-US`

**Expected**: Loc Pricing Export fires the location-scoped export endpoint (`location-export`, distinct from the grid Export ▾ `pricing-export`) with `locale=en-US`. File content is out of scope (EDGE_P3).
**Data**: office=1604

---

## TC-CPR-TIO-013: Loc Pricing Import opens the "Import All Location Pricing" dialog
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded.

**Steps**:
1. Click "Loc Pricing Import" (direct, no menu) -> a dialog opens
2. Read the dialog -> title "Import All Location Pricing", Browse/Upload controls, a file input present
3. Close the dialog

**Expected**: Loc Pricing Import opens the "Import All Location Pricing" upload dialog (same shape as the Import ▾ variant dialogs). Upload is out of scope (EDGE_P3).
**Data**: office=1604

---

## TC-CPR-TIO-014: Grid Options opens and lists every grid column, all enabled by default
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: none (baseline-enforcement per LR-019)
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded; all columns visible (baseline).

**Steps**:
1. Click the Grid Options gear (icon button, `aria-label="Grid Options"`) -> the column menu opens
2. Read the column toggles -> one `menuitemcheckbox` per grid column (Price Book, Price Book Strategy, Price Year, Is GSO, Is Internal, Is Labor, Is Active, Is Productions, Currency), all checked

**Expected**: The Grid Options menu lists every grid column as a toggle, all enabled (checked) by default.
**Data**: office=1604

---

## TC-CPR-TIO-015: Toggling a column OFF removes its header from the grid
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-TIO-014
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded; "Price Year" column visible.

**Steps**:
1. Confirm the "Price Year" header is present
2. Open Grid Options, uncheck "Price Year", close the menu -> the "Price Year" header is gone from the grid

**Expected**: Toggling a column OFF immediately removes its header from the grid. (afterEach restores all columns.)
**Data**: office=1604, column="Price Year"

---

## TC-CPR-TIO-016: A hidden column stays hidden after a page reload (persists)
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |

**Depends_On**: TC-CPR-TIO-015
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded; "Price Year" visible (baseline).

**Steps**:
1. Open Grid Options, uncheck "Price Year", close -> header gone
2. Reload + re-navigate to the Search screen -> the "Price Year" header is STILL absent

**Expected**: The column-visibility preference persists across reload (server-persisted per user). (afterEach restores all columns.)
**Data**: office=1604, column="Price Year"

---

## TC-CPR-TIO-017: Toggling a hidden column back ON restores its header
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |

**Depends_On**: TC-CPR-TIO-015
**Automatable**: Yes

**Preconditions**: On the Search screen with the grid loaded; "Price Year" visible (baseline).

**Steps**:
1. Open Grid Options, uncheck "Price Year", close -> header gone
2. Open Grid Options, re-check "Price Year", close -> the header reappears

**Expected**: Toggling a hidden column back ON restores its header (mutation safety — the grid returns to its all-columns-visible baseline).
**Data**: office=1604, column="Price Year"
