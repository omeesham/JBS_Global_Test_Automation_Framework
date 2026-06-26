# Field Inventory — Corporate Pricing › Product Group Override (Wave-1.5, live-discovered)

**Module**: corporate-pricing-override
**Client**: encore
**MCP_Session_Date**: 2026-06-08
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: Playwright CLI v0.1.8+ (agent-CLI, `playwright-cli -s=cpr-w15-recon`, storageState `clients/encore/.auth/encore-state.json`) — sparse-testid (0 testids) read-only catalog walk of a net-new, DOCX-absent screen; unattended; logged under the legacy `Playwright MCP` enum per the frozen field-inventory-spec pending SP-PWC2-05 normalization (`.claude/rules/browser-tool.md`).
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/pg-override
**Test_Entity**: Office 1604 (Parker Palm Springs)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-override-2026-06-08.md
**Baseline_Scope**: baseline-absent (net-new on e2e; DOCX-absent — intent oracle = live DOM; raised Q-WV15-1)

---

## URL(s) visited

- **Product Group Override**: `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/pg-override` — reached by clicking the **"Pricing Override"** action-bar button on the Corporate Pricing Search screen (`/settings/corporate-pricing`); navigation **CONFIRMED BUILT 2026-06-08** (recon-stale "destination unbuilt" risk cleared). Title `Product Group Override | Navigator`; H1 `Product Group Override`.
- **In-page tabs**: `Equipment` / `Labor` — `role="tab"` with `aria-selected` (Equipment selected by default). Activated by clicking the tab button; `aria-selected` flips reliably. Switching tab **resets the grid** (the location selection / grid reloads per tab; Labor showed `0 items found` for office 1604 — either no Labor overrides for this location or a per-tab location reset).
- **Location picker dialog**: opened by clicking the left-panel **"Select a location"** card; a modal table dialog (search + checkbox-per-row + `Select`/`Cancel`/`Close`).

---

## Live-state caveat

**Stack**: Next.js / React (App Router, RSC) + shadcn/Radix, NOT Angular (`waitForAngularStable()` is a no-op settle; the grid loads async — wait for `tbody tr` / `th`, never a footer). Content renders inside **shadow roots**; a raw `document.querySelector` in `eval` does NOT pierce — a recursive `shadowRoot` walk is required (Playwright locators pierce automatically). Same stack characteristics as the Search / Detail screens (registry rows 97/98).

| Field | Live (2026-06-08) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Grid (Equipment tab, office 1604) | `8 items found`, 8 rows after location-select; empty (`No results.` / `0 items found`) before a location is selected | (none — DOCX-absent) | Grid is location-gated; assert by content anchor, never by count (LR-022) |
| Grid column count | **10 columns** | recon (master D9) said **9** | **DIVERGENCE**: live adds a 10th column **`Updated By`** beyond the recon's 9 (`Location…Mod Date`). Live wins (Doctrine 2); raised in Q-WV15-1. |
| `Active` column render | Radix checkbox `button[role=checkbox][aria-checked]` | (none) | **NEW LR-036 render format** — see `## Boolean encoding registry`. NOT a Unicode ✔ (Search grid) nor SVG `lucide-check` (History). |
| Override Price / Max Discount % cells | `div[role=button][tabindex=0]` (display text, e.g. `445.00` / `—`) | (none) | Click-to-edit cells; the inline-edit **input did NOT reveal** via single-click / double-click / Enter this session — edit-activation mechanism unresolved (see `## Known gaps` + Q-WV15-1). |

---

## Field Inventory

### Top controls — tabs + filters (left panel)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Equipment tab | (none) — use `[role="tab"]:has-text("Equipment")` | Radix tab (`role=tab`) | `aria-selected="true"` (default active) | n/a | always enabled | switching resets grid + location scope | Equipment is the default tab |
| Labor tab | (none) — use `[role="tab"]:has-text("Labor")` | Radix tab (`role=tab`) | `aria-selected="false"` | n/a | always enabled | independent from Equipment; grid empty for 1604 Labor this session | `aria-selected` flips on click (assert it for the active-tab guard) |
| Select a location | (none) — use text `Select a location` (clickable card `div.bg-card`, cursor:pointer) | card trigger → opens picker dialog | placeholder `Select a location` (no location chosen → grid empty) | a location MUST be selected before the grid populates | always enabled | gates the entire grid | Opens the location picker dialog (see below) |
| Location picker — search | (none) — use `input[placeholder="Search by Location Name, Number"]` | text input (typeahead) | `""` | n/a | enabled inside dialog | filters the picker table | Live-filters the picker rows (typed `1604` → Parker Palm Springs row) |
| Location picker — row select | (none) — use `tbody tr:has-text("<office name>") [role="checkbox"]` | Radix checkbox per row | unchecked | exactly one row selected before `Select` | enabled inside dialog | picker cols: `""`(checkbox), `Local Office`, `Local Office Name` | Check the row, then click `Select` to confirm |
| Location picker — Select / Cancel / Close | (none) — use `button:text-is("Select")` / `"Cancel"` / `"Close"` | buttons | n/a | n/a | `Select` confirms; `Cancel`/`Close` dismiss | n/a | `Select` loads the chosen location's grid |
| Currency filter | (none) — use `button[role="combobox"]:has-text("ALL")` | Radix combobox | `ALL` | n/a | always enabled | filters grid rows by currency | Options: **ALL, USD, CAD, MXN** (4) |
| Active only | (none) — use `[role="checkbox"]` near label `Active only` | Radix checkbox | `unchecked` (`aria-checked="false"`) | n/a | always enabled | filters grid to active overrides when checked | Default OFF (differs from Search-screen `Active Only` which defaults ON) |
| Filter Product Groups Override | (none) — use `input[placeholder="Filter Product Groups Override..."]` | text input | `""` | n/a | always enabled | **client-side** live filter of the rendered grid (no Search button) | Typing `House` narrowed 8 → 7 rows live (no network submit) |

### Grid columns (Equipment tab, 10 columns — content-anchored)

Row anchor = the unique **Product Group** ID + **Product Group Name** (e.g. `2605` / `House Video Monitor - Specialty`). Live anchors observed 2026-06-08: `2605 House Video Monitor - Specialty` (Override 445.00), `2606 House Video Monitor LED 40"-49"` (470.00), `2607 House Video Monitor LED 50"-59"` (600.00) — all Currency USD, Current Price 0.00, Max Discount —, Active=true, Updated By `jonathan.ferrera`.

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Location | (none) — use cell text, col 1 | read-only `<td>` text | e.g. `1604` | n/a | always read-only | none | Office number of the override row |
| Product Group | (none) — use cell text, col 2 | read-only `<td>` text | e.g. `2605` | n/a | always read-only | pairs with Name as content anchor | Product-group ID (stable anchor) |
| Product Group Name | (none) — use cell text, col 3 | read-only `<td>` text | e.g. `House Video Monitor - Specialty` | n/a | always read-only | primary content anchor | Names observed unique within the location |
| Currency | (none) — use cell text, col 4 | read-only `<td>` text | e.g. `USD` | n/a | always read-only | Currency filter narrows by this | USD observed; CAD/MXN are filter options |
| Current Price | (none) — use cell text, col 5 | **read-only** `<td>` text | e.g. `0.00` | n/a | always read-only — no input | the base reference price | DOCX-absent screen; analogous to Detail's read-only base "Price" |
| Override Price | (none) — use `td:nth-child(6) [role="button"]` of the anchored row | `div[role=button][tabindex=0]` **click-to-edit** | e.g. `445.00` | currency/numeric expected (UNVERIFIED — Q-WV15-1) | appears editable (cursor:pointer, not disabled) but **input did NOT reveal** via click/dblclick/Enter this recon | none observed | **GAP** — edit-activation mechanism unresolved; W15-A MUST resolve before save-cycle FCC |
| Max Discount % | (none) — use `td:nth-child(7) [role="button"]` of the anchored row | `div[role=button][tabindex=0]` **click-to-edit** | e.g. `—` (em-dash = none) | percentage; rules UNVERIFIED (Q-WV15-1) | same as Override Price (edit-reveal unresolved) | none observed | `—` rendered when no discount set |
| Active | (none) — use `td:nth-child(8) [role="checkbox"]` of the anchored row | **Radix checkbox** (`button[role=checkbox]`) | `aria-checked="true"` / `data-state="checked"` (observed rows active) | n/a | rendered NOT-disabled, BUT a click did **NOT** toggle it this recon (read-only-in-view or edit-mode-gated — GAP) | none observed | **LR-036 NEW render format** — see Boolean encoding registry |
| Mod Date | (none) — use cell text, col 9 | read-only `<td>` text | e.g. `12/29/2025, 04:28 PM` | n/a | always read-only | none | Audit column; format `MM/DD/YYYY, hh:mm AM/PM` (VOLATILE — assert format, not value) |
| Updated By | (none) — use cell text, col 10 | read-only `<td>` text | e.g. `jonathan.ferrera` | n/a | always read-only | none | Audit column; **the 10th column the recon (D9, "9 cols") missed** |

### Toolbar + pagination (Override screen's own)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Save | (none) — use `button:text-is("Save")` | button | **disabled** on clean load | n/a | enables only when the grid is dirtied (no edit could be staged this recon → stayed disabled) | commits dirty override rows | Dialog-gated by pattern (see §Save-cycle); shares the Corporate Pricing base `confirmSaveDialogIfPresent` |
| Export | (none) — use `button:text-is("Export")` | button (direct action) | n/a | n/a | always enabled | n/a | **Direct download — NO variant dropdown** (distinct from the Search-screen `Export ▾` 4-variant menu) |
| Import | (none) — use `button:text-is("Import")` | button (direct action) | n/a | n/a | always enabled | n/a | Direct (opens a file chooser); NO variant dropdown |
| Grid Options | (none) — use `button:text-is("Grid Options")` | button → popover | n/a | n/a | always enabled | column show/hide/reorder | Popover uses non-standard markup (not captured via menu/checkbox roles) — W15-B details the toggleable columns |
| Rows per page | (none) — use `button[role="combobox"]:has-text("20")` | Radix combobox | `20` | n/a | always enabled | grid page size | Options: **10, 20, 30, 40, 50** |
| Page navigation | (none) — use the `/N` page input near the grid footer | page input/control | `/1` | n/a | enabled when >1 page | none | Standard rows-per-page pagination |

---

## Labels + Section Names

- **Page heading** (verbatim): "Product Group Override"
- **Tabs** (verbatim): "Equipment", "Labor"
- **Left panel** (verbatim): "Select a location", "Active only", "Currency :"
- **Filter input** placeholder (verbatim): "Filter Product Groups Override..."
- **Location picker** dialog: search placeholder "Search by Location Name, Number"; columns "Local Office", "Local Office Name"; buttons "Select", "Cancel", "Close"
- **Grid column headers** (verbatim, in order): "Location", "Product Group", "Product Group Name", "Currency", "Current Price", "Override Price", "Max Discount %", "Active", "Mod Date", "Updated By"
- **Empty state** (verbatim): "No results." / "0 items found"
- **Toolbar buttons** (verbatim): "Save", "Export", "Import", "Grid Options"

---

## Save-cycle observations

**Save button behavior**: a single page-level `Save` button (`button:text-is("Save")`), **disabled** on clean load. It is expected to enable when an override row is dirtied. This recon could **not stage a dirty change** — neither the Override Price / Max Discount click-to-edit cells nor the Active checkbox responded to click/double-click/Enter (see §Known App Bugs + §Known gaps) — so Save remained disabled throughout and **zero changes were staged or committed** (read-only recon; mutation-safety honored).

**Save dialog**: NOT triggered this recon (could not dirty the form). By pattern, the Corporate Pricing screens use a shared "Save Changes" alertdialog (`role=alertdialog`, buttons "Cancel"/"Save") driven by `CorporatePricingBasePage.confirmSaveDialogIfPresent()` — the Strategy + Detail screens confirm this. **The Override screen's verbatim dialog text + confirm flow MUST be captured by W15-A on its first save-cycle test** (deferred, not assumed).

**Post-save toast**: not observed (no save performed). Detail/Strategy surface a success toast in the Notifications region — likely the same here (UNVERIFIED).

**Dirty-state behavior**: Save disabled on clean. The edit-activation mechanism for Override Price / Max Discount % / Active is unresolved (GAP) — W15-A must establish how the grid is mutated (and whether it is RBAC-gated for the automation user) before authoring any save-cycle assertion.

---

## Known App Bugs

| Bug ID | Field / Feature | Observed | Expected (per requirements) | Status |
|---|---|---|---|---|
| (none filed — candidate) | Override grid edit-activation | Override Price / Max Discount `div[role=button]` cells did not reveal an input via click/dblclick/Enter; Active `role=checkbox` (not disabled) did not toggle on click — in a read-only CLI recon | Editable override fields should enter edit mode / toggle for an authorized user | candidate — NOT filed. Could be RBAC (automation user may lack Revenue-Management edit rights), an edit-mode gate, or a non-standard interaction. W15-A reproduces in the `@playwright/test` runner (fresh context) BEFORE filing (LR-044) — do not file from a single CLI session. Tracked as Q-WV15-1. |

No confirmed app bugs in this session.

---

## Staleness signal

- **Last verified**: 2026-06-08
- **Fresh-until**: 2026-06-22
- **Stale-after**: 2026-07-08
- **Refresh triggers**: `/pg-override` route or grid-column change; Override edit-activation mechanism resolved (GAP closes); an answer to Q-WV15-1 establishing documented intent; Active-checkbox render or boolean-encoding change.

---

## Network-request evidence

| Action | API call(s) observed | Status | Inference |
|---|---|---|---|
| Select location | grid loads asynchronously (~seconds) after `Select`; "0 items found" → "8 items found" | n/a | The grid is server-loaded per (location, tab). **Exact endpoint NOT captured this recon** (`playwright-cli network` not run on this screen) — likely the `/navigator/api/...pricing...` family (per Search/Detail). W15-A captures the exact endpoint + filters on `/navigator/api/`, never the page URL (LR-056). |
| Click `Export` (Override screen) | a file DOWNLOAD fired — `ProductGroupOverrides-<YYYYMMDD-HHMMSS>UTC.csv` landed in the download dir | n/a | **Override `Export` = a direct CSV download** (no variant menu). Format = **CSV** (partially answers Q-WV15-2). Read-only (no app mutation). W15-A/EDGE captures the exact endpoint + the file's column shape. |

---

## Known gaps

- **Override Price / Max Discount % edit-activation mechanism** — `div[role=button][tabindex=0]` cells did not reveal an `<input>` via click/dblclick/Enter. → W15-A resolves (try focus+type, keyboard, or confirm RBAC gating) before save-cycle FCC. Raised Q-WV15-1.
- **Active checkbox toggle** — `button[role=checkbox]` (not disabled) did not toggle on click. → W15-A resolves (same hypotheses).
- **Save dialog verbatim text + post-save toast** — not triggered (could not dirty). → W15-A captures on first save-cycle.
- **Grid Options popover structure** (which columns toggleable) — non-standard markup, not captured via menu/checkbox roles. → owned by W15-B (toolbar I/O).
- **Override screen Export/Import file format** — direct actions; round-trip file I/O deferred to EDGE_P3 (per master).
- **Labor tab data** — 0 overrides for office 1604 Labor this session; W15-A confirms whether Labor is genuinely empty for 1604 or needs a different fixture location.
- **Exact grid-load + save endpoints** — not captured (see Network-request evidence).

---

## Boolean encoding registry

| Source field | Target column | Encoding | Detection pattern |
|---|---|---|---|
| Override row active flag | Override grid `Active` column (col 8) | **Radix checkbox** `<button role="checkbox" aria-checked="true\|false" data-state="checked\|unchecked">` | `(await cell.locator('[role="checkbox"]').getAttribute('aria-checked')) === 'true'` → TRUE. **NOT** `textContent` (returns empty) and **NOT** `lucide-check` innerHTML. |

**LR-036 extension (4th render format)**: the Override grid's `Active` column is the **first observed Radix-checkbox boolean render** in the Encore app — distinct from (1) Search-grid Unicode `✔`, (2) Local-Office/LM-History SVG `lucide-check`, (3) old-site Glyphicon. Any boolean reader on this grid MUST branch on `aria-checked`, never `textContent`/`innerHTML`. Flagged for the LR-036 rule body — see Q-WV15 drafts + the missing-testid report.
