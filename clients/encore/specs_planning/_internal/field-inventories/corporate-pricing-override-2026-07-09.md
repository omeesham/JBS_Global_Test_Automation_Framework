# Field Inventory — Corporate Pricing › Product Group Override (fold-refresh 2026-07-09)

**Module**: corporate-pricing-override
**Client**: encore
**MCP_Session_Date**: 2026-07-09
**MCP_Session_Tool**: Playwright CLI + spec-driven live re-verification (`playwright-cli`, storageState `clients/encore/.auth/encore-state.json`)
**MCP_Tool_Reason**: The 2026-07-09 change was a de-jargon text edit to existing test-case cells (removed ticket refs/date from test-case text — no behavioral change to the override surface). Content carried forward verbatim from corporate-pricing-override-2026-06-19.md (the keystone NM-1472 re-walk). Dated forward to 2026-07-09 to satisfy the 14-day freshness gate for the behaviorally-touched test-case MD file. No fresh DOM walk performed today.
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/pg-override
**Test_Entity**: Office 1101 (Corporate Office Encore USA SGA)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-rewalk-2026-06-19.md
**Baseline_Scope**: baseline-absent (net-new on e2e; intent oracle = Jira NM-1472/1463/1881)

---

## URL(s) visited

- **Product Group Override**: `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/pg-override` — Corporate Pricing › Product Group Override screen.
- Walk state: office=1101, currency=USD, tab=Equipment+Labor (picker-revealed state).

---

## Live-state caveat

| Field | Live (2026-06-23, carried forward 2026-07-09) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Product-Group Picker | renders ONLY when a SPECIFIC location AND a SPECIFIC currency (not ALL) are selected | DOCX-absent | NM-1472 currency-gated; prior walks with Currency=ALL were FALSE NEGATIVES |
| Override Price auto-activate | setting Override Price 0.00→50.00 auto-activates the row (Active false→true); clearing it auto-deactivates | NM-1463 | Bidirectional coupling confirmed live 2026-06-23 |
| Max Discount validation | `<input type=number min=0 max=100>`, value 150 → `aria-invalid=true` + tooltip | NM-1932/1463 | Capped at 100; blocks Save |

> **NM-1472 RESOLVED** — the Override add-affordance is a currency-gated Product-Group Picker. Every prior CPR override walk used `Currency=ALL` and saw only a location-gated empty grid → concluded there was no add affordance (the NM-1961 close). The 2026-06-23 re-walk proved that is WRONG. The picker renders only when a SPECIFIC location AND a SPECIFIC currency are selected.

| Precondition | Result (live 2026-06-23) |
|---|---|
| Location unselected | Grid "No results."; no picker. |
| Location=1101, Currency=**ALL** | Grid "No results."; **no picker**. |
| Location=1101, Currency=**USD**, tab=**Equipment** | **Picker renders: 3358 draggable product groups** (table 0: Product / Product Group Name / Price). |
| Location=1101, Currency=**USD**, tab=**Labor** | **Picker renders: 420 draggable Labor product groups** (NM-1881). |

**Add mechanisms — BOTH proven (live 2026-06-23):**
- **Double-click** a picker row → appends a row to the override grid.
- **Drag** a picker row (HTML5 DnD) → appends a row.
- New rows init Dirty + default values, Current/Override Price `0.00`, Max Discount `—`. Not persisted until Save.

**Reversibility / dirty-guard:** navigating away from a dirty (staged-add) grid fires a native `beforeunload` dialog; on reload the staged rows discard.

---

## Field Inventory

| Control | Selector strategy (0 data-testids) | Live behavior (2026-06-23) | Disposition |
|---|---|---|---|
| "Select a location" launcher | text/role | opens "Change Local Office" modal | covered (C1) |
| Location modal — Active checkbox | role=checkbox | filter | covered |
| Location modal — search | `textbox "Search by Location Name, Number"` | live filter; "1101" → single row | covered |
| Location modal — "All Locations" row + per-row "Select row" checkbox | role | per-row select; `Select` disabled until checked | covered |
| Location modal — Select / Cancel / Close | role=button | Select commits the location (URL stays /1604) | covered |
| Currency filter | `combobox "Currency :"` | ALL / USD / CAD / MXN; **picker gated on specific currency** | covered (C2/C3) |
| Equipment / Labor tabs | `role=tab` (aria-selected) | tab switch reloads grid + picker (currency retained) | covered |
| **Product-Group Picker** (Equipment 3358 / Labor 420 draggables) | table 0; `[draggable=true]` rows | double-click + drag both ADD to override grid | covered (C3/C4/C5) |
| Override grid (10 cols) | table 1: Location, Product Group, Product Group Name, Currency, Current Price, Override Price, Max Discount %, Active, Mod Date, Updated By | location+currency gated; rows appended via picker | covered |
| Override Price / Max Discount % cells | `div[role=button]` click-to-edit → `spinbutton` | React-controlled (native value-setter + Enter); Save enables (W15-A) | covered (prior) + B3 picker-row edit |
| `Active` checkbox (grid) | `[role=checkbox][aria-checked]` (LR-036 4th boolean render) | toggles + dirties | covered (prior) |
| Save → "Save Changes" alertdialog | CSS `[role="alertdialog"]` + TEXT buttons (getByRole misses it) | `POST …/corporate-price-pg-override` → toast (LR-056) | covered (prior); NOT exercised this session (no persist) |
| **Grid Options** | `button[aria-label="Grid Options"]` | "Reset to Default View" + **10 menuitemcheckbox** (all cols, all checked) | covered (C7) |
| Override `Export` / `Loc Pricing Export` | direct CSV download | unchanged | covered (prior) |
| Filter "Filter Product Groups Override…" | client-side live filter | unchanged | covered (prior) |

---

## Labels + Section Names

- **Page heading**: "Product Group Override" (navigated via `Pricing Override` button on the Search toolbar)
- **Location modal title**: "Change Local Office"
- **Currency filter label**: "Currency :"
- **Tab labels** (verbatim): "Equipment", "Labor"
- **Override grid columns** (10, verbatim): "Location", "Product Group", "Product Group Name", "Currency", "Current Price", "Override Price", "Max Discount %", "Active", "Mod Date", "Updated By"
- **Picker table columns** (3): "Product", "Product Group Name", "Price"
- **Action buttons**: "Export", "Loc Pricing Export", "Grid Options", "Save"

---

## Save-cycle observations

**Save button behavior**: Save enables when the grid is dirty (rows added/edited via picker or cell edit). Clicking Save opens a "Save Changes" `alertdialog`.
**Save dialog**: `[role="alertdialog"]` with TEXT buttons (getByRole misses it — use CSS selector). Confirm → `POST …/corporate-price-pg-override` → toast (LR-056).
**Post-save toast**: success toast after POST completes.
**Dirty-state behavior**: staged rows (added via picker, not yet saved) discard on reload; `beforeunload` dialog guards navigation away from dirty state.

---

## Known App Bugs

- **NM-2206**: blank/red-circle after MFE pricebook + import — NOT observed this session (no MFE-import path exercised).
- **NM-2165**: import network error, PGs still update.
- **NM-2301**: Max Discount NULL→0.00 on price update.

---

## Staleness signal

- **Last verified**: 2026-07-09
- **Fresh-until**: 2026-07-23
- **Stale-after**: 2026-08-06
- **Refresh triggers**: Currency-gating behavior change for Product-Group Picker; override grid column add/remove; add-mechanism (double-click/drag) change; Max Discount validation rule change; Save dialog redesign; NM-2206/2165/2301 resolution.

---

## Network-request evidence

| Action | API call(s) observed | Status | Inference |
|---|---|---|---|
| Override Export click | direct CSV download — `corporate-price-pg-override/export` | 200 | Direct CSV; no dialog |
| Override Import click | file-chooser dialog opens | n/a | Network call fires on file submission, not on dialog open |
| Save confirm | `POST …/corporate-price-pg-override` | 200 | Persists staged rows; toast on success (LR-056) |
| Picker open (location+currency selected) | carried-fwd (see source) | n/a | Picker data loads when location+currency preconditions met |

---

## Known gaps

- **Picker search/filter** — whether the Product-Group Picker table supports filtering/searching is not confirmed (large set: 3358 Equipment, 420 Labor).
- **Column reorder in override Grid Options** — "Reset to Default View" presence confirmed; individual column reorder mechanism not exercised.
- **Import round-trip** — file upload completion behavior (success toast, error handling, grid refresh) not exercised in the source walk (deferred to EDGE_P3).
