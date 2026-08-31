# Field Inventory — Item Search: Product Code dialogs (PCD)

**Module**: item-search-product-code
**Client**: encore
**MCP_Session_Date**: 2026-08-31
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: Agent-driven dialog walk (multi-step states beyond the one-click machine branches) with grep-over-disk YAML snapshots; LR-038 v2 selects the Playwright CLI path (`playwright-cli`, session isr2).
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products (dialogs mount over the searched grid with a row selected)
**Test_Entity**: Office 1101 - Corporate Office Encore USA SGA
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/item-search-2026-08-31.md
**Walk_Mode**: quick

> **Denominator note (deliberate, §20-Q)**: the Product Code dialogs are **multi-step states**
> (search → row click → toolbar button) that `enumerate-page.mjs`'s one-click branch mechanism
> cannot reach — so this artifact carries **no machine Coverage Manifest**. The machine-bound
> denominators for this module live in the sibling artifacts (`item-search-product-search-2026-08-31.md`,
> `item-search-product-groups-2026-08-31.md`); the toolbar OPENERS to these dialogs are
> dispositioned there. This artifact is the §20-Q opener-frontier walk record for what is BEHIND
> those openers: an agent-driven element census with per-element snapshot evidence
> (`.playwright-cli/isr-2026-08-31/dlg-*.yml`, `caret-*.yml`, `add-*.yml`), cross-verified in
> `walk-evidence-item-search-2026-08-31.md`. Nothing was saved: every dialog was closed without
> persisting (close-discards proven).

jira_tickets: [NM-2253, NM-1921, NM-1982, NM-1983, NM-2077, NM-2100, NM-2111]
baselineScope: baseline-absent (environment-blocked — see Baseline_Artifact)

---

## URL(s) visited

- Products page (office 1101), searched grid, row selected → toolbar:
  - **View Product Code** → "Product Code Details" dialog, 3 tabs (Item / Product Code History / Translations), default scope Item.
  - **View caret** → segment menu (Item / Sub Class / Class / Sub Category / Category) rescoping the dialog (first tab renames).
  - **Add Product Code** → same-named dialog, single tab, new-entry form for the chosen segment.
  - **Add caret** → same 5-segment menu for the add flow.
  - **View Availability** → no UI response (defect candidate under the owner's dates-not-functional ruling; see Observations).

## Live-state caveat

| Field | Live (2026-08-31) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Dialog field values (View) | the selected row's hierarchy chain | row-dependent | The dialog renders the selected product's data; nothing here is a fixed default except the Add form's empty state. |
| Save (both dialogs) | disabled | disabled until the form is valid (Add) / enablement condition undetermined (View) | Typing into the View dialog's Name changed the value but Save stayed disabled after blur — view-mode vs validity-gate is undetermined on a row whose required chain is incomplete. Never asserted either way. |

## Field Inventory

### View Product Code — "Product Code Details" dialog, Item tab (snapshot dlg-view-pc.yml)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Category section (Name / Product Type / Service Type) | `(none)` | read-only text trio | selected row's category chain | n/a | static | n/a | `affordance: none` (display trio). |
| Sub-Category Name | `(none) — combobox in the Sub Category section` | Dropdown / combobox (Radix) | row value | starred (required) | enabled | its Service Type pairs with it | `affordance: none` beyond selection. |
| Sub-Category Service Type | `(none)` | Dropdown / combobox (Radix) | row value | starred | enabled | n/a | |
| Class Name / Class Service Type | `(none)` | Dropdown / combobox (Radix) ×2 | row values | starred | enabled | n/a | |
| Sub-Class Name | `(none)` | Dropdown / combobox (Radix) | "Please select" on the probed row | starred | enabled | **cascade**: while unset, the Sub-Class Service Type below is disabled | Cascade evidenced at rest in this dialog. |
| Sub-Class Service Type | `(none)` | Cascading dropdown | "Select service type" | starred | **disabled** until Sub-Class Name chosen | cascades from Sub-Class Name | |
| Barcodeable | `(none)` | Checkbox (native + Radix) | unchecked (probed row) | n/a | **disabled** | n/a | |
| Product Organization (section + item) | `(none) — "Open popover" trigger` | Dropdown / multi-select popover | None | n/a | enabled | n/a | Same country checklist as the search panel. |
| Item Name | `(none) — placeholder "Enter name"` | Plain text | row value | starred | enabled | n/a | Typed "X" → value committed, Save stayed disabled (see caveat). |
| Item Description | `(none) — placeholder "Enter item description"` | Plain text | row value | starred | enabled | n/a | |
| Oracle Item Number | `(none) — placeholder "Enter oracle item number"` | Plain text | empty (probed row) | none observed | enabled | n/a | |
| Item Product Type | `(none)` | Dropdown / combobox (Radix) | row value (CONSUMABLE on probed row) | starred | enabled | pairs with Item Service Type | |
| Item Service Type | `(none)` | Dropdown / combobox (Radix) | row value | starred | enabled | n/a | |
| Active | `(none)` | Checkbox (native + Radix) | checked (probed row) | n/a | enabled | n/a | |
| Product Code ID | `(none)` | read-only text | row value (73753 probed) | n/a | static | n/a | `affordance: none`. |
| Save | `(none) — text "Save"` | *(action)* | disabled | n/a | disabled (see caveat) | n/a | Never clicked. |
| Close (footer) + Close (X) | `(none) — text/name "Close"` | *(action)* ×2 | n/a | n/a | enabled | n/a | Both close; a dirty form closes silently (no prompt) — probed. |

### Product Code History tab (snapshot dlg-pc-history.yml)

15-column read-only audit grid: Action, Parent Name, Product Name, Product Description, Product Type, Service Type Name, Product Group, Barcodeable, Weight, Eligible, Oracle Item Number, Active, Product Organization, Modified By, Modified Date — plus the tab's OWN Grid Options button (per-state chrome, separate from the page-level one). Column menus/resize as on the main grid. Deep-tier: in-dialog grid behaviors.

### Translations tab (snapshot dlg-pc-translations.yml)

"Translations for Item" — 4 rows (English (Canada), US English, Spanish (Mexico), French (Canada)) × editable Name + Description textboxes. Save-cycle deep-tier (nothing typed was saved).

### Segment caret menus (View + Add; snapshots caret-view-pc.yml / caret-add-pc.yml)

Both menus list: Item · Sub Class · Class · Sub Category · Category. Selecting rescopes the dialog (first tab renames to the segment). **View → Category silently no-ops** (3 attempts, varied waits, console + network clean; every sibling opens; Add → Category opens) — defect candidate recorded in walk-evidence Observations; TC-ISR-PCD-005 covers the working segments and notes the defect.

### Add Product Code — dialog, Item scope (snapshot dlg-add-pc2.yml)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Ancestor chain (Category → Sub Class) | `(none)` | read-only text sections | selected row's chain ("—" where absent) | n/a | static | n/a | |
| Name | `(none) — placeholder "Enter name"` | Plain text | empty, flagged invalid at rest | required | enabled | n/a | Error icon adjacent while empty. |
| Item Description | `(none) — placeholder "Enter item description"` | Plain text | empty, flagged invalid | required | enabled | n/a | |
| Oracle Item Number | `(none)` | Plain text | empty | none observed | enabled | n/a | |
| Product Type | `(none) — "Select product type"` | Dropdown / combobox (Radix) | placeholder | required | enabled | **cascade parent** for Service Type | 10 options: EQUIPMENT, CONSUMABLE, FREIGHT, LABOR, EXPENSE, SERVICE CHARGE, DAMAGE WAIVER, EVENT TECHNOLOGY SUPPORT, FEE, CABLES AND CONSUMABLE. |
| Service Type | `(none) — "Select service type"` | Cascading dropdown | placeholder | required | **disabled at rest**; enables on Product Type selection | filtered by the chosen Product Type (LABOR → labor-specific list of 15+: Application Development, Operator Labor, Rigging Labor, Setup Charges, …) | Cascade proven live both halves (enable + filter). |
| Product Organization | `(none) — "Open popover"` | Dropdown / multi-select popover | None | n/a | enabled | n/a | |
| Product Code ID | `(none)` | read-only text | "—" | n/a | static | n/a | |
| Save | `(none)` | *(action)* | disabled | validity-gated | disabled while required fields incomplete | n/a | Never clicked — nothing persisted. |
| Close (footer + X) | `(none)` | *(action)* | n/a | n/a | enabled | n/a | Dirty close (Product Type selected) discarded silently — probed. |

## Labels + Section Names

- Dialog: "Product Code Details" · tabs "Item" / "Product Code History" / "Translations" (View) — single scoped tab (Add).
- Sections: "Category" · "Sub Category" · "Class" · "Sub Class" · "Item"; per-section "…Name*" · "Product Type" · "Service Type*"; "Barcodeable" · "Product Organization" · "Product Code ID" · "Oracle Item Number" · "Active".
- Footer: "Save" · "Close".
- Toolbar (openers): "View Product Code" · "Add Product Code" · "View Availability" · "Product Group" · "Grid Options".

## Save-cycle observations

### Save button behavior
Both dialogs: Save disabled at rest. Add: validity-gated (stays disabled while required fields incomplete). View: stayed disabled after a committed text edit + blur on a row with an incomplete required chain — enablement condition undetermined (view-mode vs validity-gate); deliberately not asserted.

### Save dialog
Not observed — no save executed anywhere in this walk. Unknown, not absent.

### Post-save toast
Not observed — same reason.

### Dirty-state behavior
No unsaved-changes guard on either dialog: dirty View (edited Name) and dirty Add (selected Product Type) both closed silently on Close. TC-ISR-PCD-009 asserts the actual discard behavior.

## Observations

### Bugs / Defects
- **View Product Code → Category silent no-op** — full evidence + positive controls in `walk-evidence-item-search-2026-08-31.md` § Observations item 1; bug filing assigned to the audit phase (GIVER cannot write the bug register). TC-ISR-PCD-005 notes it.
- **View Availability inert** (both a labor row and an equipment row, zero network) — owner-ruling-adjacent (dates not functional yet); walk-evidence item 2. TC-ISR-PCD-010 asserts presence/enabled only.

### Suggestions / Improvements
- Add an unsaved-changes prompt to both dialogs (silent discard of edits).
- Disable or hide View Availability while the availability feature is non-functional.

## Staleness signal

- **Last verified**: 2026-08-31
- **Fresh-until**: 2026-09-14
- **Stale-after**: 2026-09-30
- **Refresh triggers**: tab set ≠ 3 · segment menu set ≠ 5 · the Category segment starts opening (defect fixed — re-walk + extend TC-ISR-PCD-005) · availability goes functional (owner ruling lifts) · Save enablement condition determined (View dialog).
