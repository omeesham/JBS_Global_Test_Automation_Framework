---
module: Discount Matrix
date: 2026-08-20
office: 1604
environment: cloudapps-e2e.encoreglobal.com
url: /navigator/locations/1604/settings/discount-matrix
submodule: company-matrix
selectors_file: clients/encore/src/selectors/discount-matrix/company-matrix.ts
walk_evidence: clients/encore/specs_planning/_internal/walk-evidence/discount-matrix-company-matrix-2026-08-19.md
walk_coverage: reports/walk-coverage/1604-discount-matrix.json (denominator: 21 elements)
---

# data-testid Gap Report — Discount Matrix › Company Matrix

**Date:** 2026-08-20 | **Office:** 1604 | **Environment:** cloudapps-e2e.encoreglobal.com

## 1. Current testid coverage

The module **does not expose any `data-testid` attributes**. Across the entire surface — both visible tabs (Company Matrix, Region Weekly Peaks, Location Activation) and both dialogs (Add Tier, Edit Tier) — automation anchors exclusively on role, label text, accessible name, placeholder text, or structural path fallbacks.

Two controls carry stable element attributes:
- `input[name="gavDiscountThreshold"]` — the GAV Discount Threshold input (stable `name` attribute)
- `#discount-matrix-tier-end` — the End Tier input in the Add Tier dialog (stable element `id`)

All other interactive controls have no stable anchor.

## 2. Critical: tab IDs are auto-generated Radix IDs

The three tab trigger elements (`Company Matrix`, `Region Weekly Peaks`, `Location Activation`) carry IDs of the form `radix-_r_10_-trigger-company-matrix` (the numeric segment `10` is a Radix render-order counter that changes between page renders). These IDs **cannot be used as stable selectors**. Today's selectors use `[role="tab"]:has-text("Company Matrix")`, which is fragile: a tab rename silently breaks the test with no compile-time warning.

This is the single highest-priority item in this request.

## 3. Bucket A — controls that could and should carry a testid

These are application controls owned by the Discount Matrix dev team. Naming follows `discount-matrix-company-matrix-{element}` convention, matching the existing file structure and URL segment.

### Tab Navigation

| # | Control | Tab | Role | Anchor used today | Requested `data-testid` | Fragility |
|---|---|---|---|---|---|---|
| 1 | Company Matrix tab | Company Matrix | `tab` | `[role="tab"]:has-text("Company Matrix")` | `discount-matrix-company-matrix-tab` | Text-anchored; rename breaks silently. |
| 2 | Region Weekly Peaks tab | Region Weekly Peaks | `tab` | `[role="tab"]:has-text("Region Weekly Peaks")` | `discount-matrix-region-weekly-peaks-tab` | Text-anchored; rename breaks silently. |
| 3 | Location Activation tab | Location Activation | `tab` | `[role="tab"]:has-text("Location Activation")` | `discount-matrix-location-activation-tab` | Text-anchored; rename breaks silently. |

### Company Matrix Tab — Criteria Bar

| # | Control | Role | Anchor used today | Requested `data-testid` | Fragility |
|---|---|---|---|---|---|---|
| 4 | Country combobox | `combobox` | `label:text-is("Country:") + [role="combobox"]` | `discount-matrix-country-combobox` | Adjacent-sibling match; brittle if label layout changes. |
| 5 | Currency combobox | `combobox` | `label:text-is("Currency:") + [role="combobox"]` | `discount-matrix-currency-combobox` | Adjacent-sibling match; brittle if label layout changes. |
| 6 | Business Tier combobox | `combobox` | `label:text-is("Business Tier:") + [role="combobox"]` | `discount-matrix-business-tier-combobox` | Adjacent-sibling match; brittle if label layout changes. |

### Company Matrix Tab — Toolbar

| # | Control | Role | Anchor used today | Requested `data-testid` | Fragility |
|---|---|---|---|---|---|---|
| 7 | Add Tier button | `button` | `button:text-is("Add Tier")` scoped to tab panel | `discount-matrix-add-tier-button` | Text-anchored; rename breaks silently. Opens Add Tier dialog. |
| 8 | Export button | `button` | `button:text-is("Export")` scoped to tab panel | `discount-matrix-export-button` | Text-anchored; rename breaks silently. |
| 9 | Import button | `button` | `button:text-is("Import")` scoped to tab panel | `discount-matrix-import-button` | Text-anchored; rename breaks silently. |
| 10 | Save button (criteria bar) | `button` | `button:text-is("Save")` page-level | `discount-matrix-save-button` | Text-anchored; rename breaks silently. Persists GAV Discount Threshold. |

### Company Matrix Tab — Grid

| # | Control | Role | Anchor used today | Requested `data-testid` | Fragility |
|---|---|---|---|---|---|---|
| 11 | Per-row Delete button *(archetype × 9 rows)* | `button` | `button[title="Delete"]` scoped to row locator | `discount-matrix-row-delete-button` | Title-anchored; title change breaks silently. |
| 12 | Per-row Edit button *(archetype × 9 rows)* | `button` | `button[title="Edit"]` scoped to row locator | `discount-matrix-row-edit-button` | Title-anchored; opens Edit Tier dialog; title change breaks silently. |

### Edit Tier Dialog

| # | Control | Role | Anchor used today | Requested `data-testid` | Fragility |
|---|---|---|---|---|---|---|
| 13 | Percentage input fields *(21 per dialog × measured once)* | `input` | Collection by `inputmode="decimal"` ordered by DOM position; no stable id | `discount-matrix-edit-tier-percentage-input` | Positional collection; fragile if column order changes or new columns are added; no stable anchor. |
| 14 | Cancel button (Edit dialog) | `button` | `button:text-is("Cancel")` scoped to dialog | `discount-matrix-edit-tier-cancel-button` | Text-anchored; rename breaks silently. |
| 15 | Update button (Edit dialog) | `button` | `button:text-is("Update")` scoped to dialog | `discount-matrix-edit-tier-update-button` | Text-anchored; rename breaks silently. Disabled until valid input. |

### Add Tier Dialog

| # | Control | Role | Anchor used today | Requested `data-testid` | Fragility |
|---|---|---|---|---|---|---|
| 16 | End Tier input | `input` | `#discount-matrix-tier-end` (stable element id) | (already stable) | Uses element `id` — durable. No gap. |
| 17 | Cancel button (Add dialog) | `button` | `button:text-is("Cancel")` scoped to dialog | `discount-matrix-add-tier-cancel-button` | Text-anchored; rename breaks silently. |
| 18 | Add Tier confirm button (Add dialog) | `button` | `button:text-is("Add Tier")` scoped to dialog (exact text match) | `discount-matrix-add-tier-confirm-button` | Text-anchored; rename breaks silently. Disabled until valid End Tier entered. |

**Total Bucket A: 17 distinct control types** (tabs × 3, criteria comboboxes × 3, toolbar buttons × 4, grid row buttons × 2 archetypes, edit dialog × 3, add dialog × 2; End Tier input already durable, not counted as a gap).

**Naming convention followed:** `discount-matrix-{element}`, with tab/dialog scopes inlined (e.g. `discount-matrix-edit-tier-cancel-button`). This mirrors the existing selectors file structure and the URL segment `discount-matrix`.

## 4. Bucket B — app shell chrome (excluded from the client ask)

These controls appear in the enumeration but belong to the application shell, not to the Discount Matrix module. The Discount Matrix dev team should not annotate them.

| Control | Why excluded |
|---|---|
| Office switcher button | App shell — office selector |
| Home, Inbox, search nav links | Left nav chrome |
| Tax, Commissions, Setup, Studio nav buttons | Left nav groups |
| All Order/Job/Asset/Customer/DRO/Payment/Item/ECT Search nav buttons | Left nav searches |
| User menu button | App shell — user menu |
| Sidebar toggle | App shell — layout control |
| Trigger button (unrelated) | App shell — unrelated trigger |

**Total Bucket B: 13+ items** (all app shell; none are Discount Matrix controls).

## 5. Machine denominator (measured, reproducible)

From `reports/walk-coverage/1604-discount-matrix.json` (21 elements total):

| Element class | Count | Status |
|---|---|---|
| Tabs | 3 | Company Matrix, Region Weekly Peaks, Location Activation — all use unstable Radix IDs |
| Comboboxes | 3 | Country, Currency, Business Tier — text-anchored via adjacent sibling match |
| Toolbar buttons (tab-scoped) | 4 | Add Tier, Export, Import, Save — all text-anchored |
| Row action buttons (per-row archetype) | 2 | Delete, Edit — title-anchored |
| Dialog inputs | 22 | 21 percentage inputs (Edit Tier) + 1 End Tier (Add Tier) — 1 stable (End Tier), 21 positional |
| Dialog buttons | 5 | Add Tier, Edit Tier, Location Activation tabs + Edit/Add dialogs: 1 Save, 2 Cancel, 1 Update, 1 Add Tier confirm |
| **Stable existing anchors** | 2 | `input[name="gavDiscountThreshold"]`, `#discount-matrix-tier-end` |

## 6. Impact

Automation against this module runs today on role, label text, title attribute, and structural path fallbacks. These anchors work, but they are fragile:

- **Tab navigation** relies on `:has-text()` matching — any tab rename breaks silently.
- **Toolbar and dialog buttons** rely on `:text-is()` matching — any button label change breaks silently.
- **Combobox selection** relies on adjacent-sibling label matching — layout changes break silently.
- **Row action buttons** rely on `title=` attributes — any title update breaks silently.
- **Edit Tier percentage inputs** are accessed by positional collection — any column reordering breaks silently.

Adding the 17 testids listed in §3 would eliminate all these fragilities and make every selector rename-proof. Automation is proceeding on tracked fallbacks; this report is the request to make it durable.

---

## END-OF-REPORT 17
