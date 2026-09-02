# Field-Case Catalog — Item Search (NM-2253) — 2026-08-31

**Module**: item-search (PRS + PCD + PGR bands)
**CoverageMode**: quick (L1 — §2 field floor + §3 QUICK family must-asserts; L2/L3 deferred to DEEP)
**Sources**: field inventories `item-search-product-search-2026-08-31.md`, `item-search-product-code-2026-08-31.md`, `item-search-product-groups-2026-08-31.md`; walk evidence `walk-evidence-item-search-2026-08-31.md`; crossref `jira-defect-crossref-item-search-2026-08-31.md` (owner rulings OR-1..OR-6 honored).
**Prior coverage**: none — the module enters the pipeline with zero existing TCs; every ID below is net-new.

## §2 field-type mapping (Axis 1 — FCC)

| Field (band) | §2 type | Existing | Net-new coverage (QUICK) | Deferred to DEEP |
|---|---|---|---|---|
| Keyword Search radio (PRS) | Checkbox (native + Radix) — single-option radio | none | TC-ISR-PRS-002 (default selected via Reset) | multi-option behavior if more search types ship |
| Any Field (PRS) | Plain text | none | TC-ISR-PRS-003 (positive filter + fidelity) | length/char-class boundary battery (no validation observed to bound) |
| Barcode (PRS) | Plain text | none | TC-ISR-PRS-013 (no-match empty state) | positive filter — CONSUMES OWNER-PROVIDED barcode numbers (OR-4, pending, non-blocking) |
| Quantity Greater Than Zero (PRS) | Checkbox | none | TC-ISR-PRS-002 (default) + TC-ISR-PRS-012 (filter effect) | — |
| Active (PRS) | Checkbox | none | TC-ISR-PRS-002 (default checked) | inactive-set assertion (needs known-inactive product data) |
| Location (PRS) | Dropdown / combobox (Radix, typeahead) | none | TC-ISR-PRS-007 (options render) + TC-ISR-PRS-009 (exclusivity) | typeahead filtering; selecting a foreign office (result reshaping) |
| Region (PRS) | Dropdown / combobox | none | TC-ISR-PRS-008 + TC-ISR-PRS-009 | region-scoped result assertions (needs region-tagged expectations) |
| Product Organization (PRS) | Multi-select popover | none | TC-ISR-PRS-010 (itemization) + TC-ISR-PRS-032 (filter effect delta — added 2026-09-02) | — (the earlier "needs org-tagged data" gap is CLOSED: tagged data exists on 1101 and the effect is deterministic; see the inventory's Product Organization row) |
| Prep / Return Date Time (PRS) | Date/offset | none | TC-ISR-PRS-011 (field-level open/structure — OR-1) | ALL date-driven behavior (owner ruling: not functional yet) |
| View dialog editable set (PCD) | Plain text ×3, Dropdown ×6, Checkbox ×2, popover | none | TC-ISR-PCD-002 (render + values + Save state) | per-field save-cycles (nothing may be persisted at QUICK without owner data) |
| Sub-Class Service Type (PCD) | Cascading dropdown | none | TC-ISR-PCD-002 (disabled-at-rest evidence in View) | full cascade drive in View dialog |
| Add form Product Type → Service Type (PCD) | Cascading dropdown | none | TC-ISR-PCD-006 (rest state) + TC-ISR-PCD-007 (enable + filter) | per-type option-set matrix (10 × lists) |
| Translations grid (PCD) | Multi-row editable grid | none | TC-ISR-PCD-004 (structure) | translation save-cycle |
| Search Product Groups (PGR) | Plain text | none | TC-ISR-PGR-002 (positive) + TC-ISR-PGR-003 (empty-criteria live contract) | — |
| Active (PGR) | Checkbox | none | TC-ISR-PGR-005 (survives Reset) | inactive-groups view |
| Add form Name / Description (PGR) | Plain text ×2 | none | TC-ISR-PGR-006 (required-empty + Save disabled) | save-cycle (creates data) |
| Add form Service Type (PGR) | Dropdown / combobox | none | TC-ISR-PGR-006 (presence) | option-set enumeration |
| Sub Classes picker (PGR) | Drag-and-drop source row (dual-list) | none | TC-ISR-PGR-007 (structure + instruction) | drag path + double-click add (mutating) |

§2.1 rejection-affordance note: no field in this module surfaced an inline rejection at QUICK depth (free-text search fields accept anything; required-field invalid flags render at rest in the Add dialogs and are asserted by TC-ISR-PCD-006 / TC-ISR-PGR-006). The boundary battery that would drive rejections is DEEP-tier here.

## §3 Surface-Behavior Cases (SBC)

### Products result grid (PRS band)

| Family | QUICK TC | Note |
|---|---|---|
| result-fidelity | TC-ISR-PRS-003 | "Amp" rows all match; count drops from the unfiltered total |
| pagination | TC-ISR-PRS-015 + TC-ISR-PRS-016 | move + rows-per-page options |
| sorting | TC-ISR-PRS-014 | menu-driven flip (descending → Video-first) + restore |
| empty-vol | TC-ISR-PRS-013 | "0 products found" + "No results" |
| persistence | TC-ISR-PRS-018 | executed criteria + results + sort survive leave-and-return (storage-based; ticketed URL-param design absent on this build) |
| combination | TC-ISR-PRS-009 + TC-ISR-PRS-012 | location/region exclusivity + additive checkbox filter |
| render-state | out-of-scope:render-state=no link-cells or state-badge cells in this grid; all cells plain text/numeric, none navigates |

### Product Groups grid (PGR band)

| Family | QUICK TC | Note |
|---|---|---|
| result-fidelity | TC-ISR-PGR-002 | "Audio" → 82 found, rows match |
| pagination | TC-ISR-PGR-004 | 20/page default; move |
| empty-vol | TC-ISR-PGR-003 | live zero-on-empty contract (discussion item noted) |
| persistence | TC-ISR-PGR-009 | executed search survives leave-and-return |
| render-state | TC-ISR-PGR-010 | Status column renders Active under the active filter |
| sorting | out-of-scope:sorting=per-column menus unprobed on this grid at this tier; colmenu deferral rows carry the family to DEEP |
| combination | out-of-scope:combination=single text filter plus one checkbox; no multi-criteria intersection exists to combine |

### In-dialog History grid (PCD band)

Render-only at QUICK (TC-ISR-PCD-003); its own sorting/pagination/options behaviors are deep-tier (per-state chrome duplicate of the page grid).

## Net-new TC namespaces

- `TC-ISR-PRS-001 … -019` (19) — item_search_product_search_test_cases.md
- `TC-ISR-PCD-001 … -010` (10) — item_search_product_code_test_cases.md
- `TC-ISR-PGR-001 … -010` (10) — item_search_product_groups_test_cases.md

Total: 39. Every §2 row above maps to at least one QUICK TC or an explicit DEEP deferral; every applicable §3 family carries its L1 must-assert or an `out-of-scope:` reason.
