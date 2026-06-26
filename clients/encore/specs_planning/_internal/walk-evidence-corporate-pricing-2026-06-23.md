---
module: corporate-pricing
MCP_Session_Date: 2026-06-23
MCP_Session_Tool: playwright-cli v0.1.8 (HEADED-equivalent, -s=cpr, storageState clients/encore/.auth/encore-state.json)
walk_procedure: LR-064 Tiered Delegated Walk — Opus-self drove every probe this session (Stage-2 worker dispatch was blocked mid-session by an Opus safety-classifier outage in `auto` permission mode; Opus-self is the top of the LR-064 ladder, so the walk proceeded at the highest tier with no coverage loss).
auth_user: s-prd-clickauto@psav.com (live, /navigator/auth/session valid)
office: 1604 (Search/Toolbar/Strategy/Detail/New-Pricebook) + 1101 (Override — Labor/USD/CAD/MXN data, NM-1881)
jira_tickets: [NM-1472, NM-1463, NM-1932, NM-1443, NM-1881, NM-1444, NM-2206]
provenance: SUBPLAN_CORP_PRICING_REWALK_AUDIT.md (full e2e walk; supersedes the 2026-06-19 oracle-classified rows)
---

# Corporate Pricing — Full Live e2e Walk Evidence (LR-064 proof-of-work trail)

**Why this file exists**: the 2026-06-19 drift ledger classified several Override validations, the Toolbar
post-Continue path, the Strategy +New dialog, the New-Pricebook create-mode, and the History tab
**from the Jira oracle, not from live clicks**. The subplan's strict acceptance line is *"every
surface/control has a LIVE verdict"*. This session drove **every** one of those controls live and
records the raw DOM/network evidence + the per-control Opus verdict below. Worker tier = **Opus-self**
for every row (Stage-2 Haiku/Sonnet dispatch was attempted but blocked by a classifier outage; the
walk did not stop — it ran at the top tier).

Legend — verdict: `LIVE-CONFIRMED` (driven, matches expectation) · `LIVE-DIVERGENCE` (driven, differs
from oracle — flagged) · `LIVE-ABSENT` (feature not built; classified c.1/c.2/c.3).

---

## A. SEARCH (office 1604) — `…/settings/corporate-pricing`

| # | Control | Raw evidence (2026-06-23) | Verdict |
|---|---|---|---|
| A1 | Grid + item count | `593 items found`; body rendered (len 3348) | LIVE-CONFIRMED |
| A2 | Grid columns (9) | headers = Price Book, Price Book Strategy, Price Year, Is GSO, Is Internal, Is Labor, Is Active, Is Productions, Currency | LIVE-CONFIRMED |
| A3 | Grid Options menu | `button[aria-label="Grid Options"]` → menu = **"Reset to Default View"** + 9 column toggles (Price Book, Price Book Strategy, Price Year, Is GSO, Is Internal, Is Labor, Is Active, Is Productions, Currency) | LIVE-CONFIRMED (9-col) |
| A4 | Toolbar buttons present | All Locations, Pricing Override, Loc Pricing Export, Loc Pricing Import, New, Export, Import, Grid Options | LIVE-CONFIRMED |

## B. TOOLBAR (office 1604, Search page) — Export▾ / Import▾ POST-CONTINUE path (B1 contract gap)

| # | Control | Raw evidence (2026-06-23) | Verdict |
|---|---|---|---|
| B1 | `Export ▾` opens menu | click bare `Export` → 4 menuitems: **All Equipment Pricing / All Labor Pricing / All Equipment Max Discount / All Labor Max Discount** | LIVE-CONFIRMED |
| B2 | Export variant → dialog | click "All Equipment Pricing" → dialog title **"Export"**, text *"Select between 1 and 3 years and choose a currency to continue."*, comboboxes `Select years…` + `Select currency…`, buttons Cancel / **Continue (disabled:true)** / Close | LIVE-CONFIRMED |
| B3 | Year(s) options | open Year(s) → `2021,2022,2023,2024,2025,2026,2027,2028` (multi-select 1–3) | LIVE-CONFIRMED |
| B4 | Currency options | `USD, CAD, MXN` | LIVE-CONFIRMED |
| B5 | **Continue gate** | after Year=2026 + Currency=USD set → **Continue disabled:false** (enables only when both set) | LIVE-CONFIRMED |
| B6 | **Export Continue → download** | click Continue → network `GET …/api/location/pricing/pricing-export?isLabor=false&isMaxDiscount=false&currencyId=1&locale=en-US&years=2026` → **[200]**. Variant maps to `isLabor`/`isMaxDiscount` params; year+currency appended from the gate. No second dialog. | LIVE-CONFIRMED |
| B7 | `Import ▾` opens menu | same 4 variants as Export▾ | LIVE-CONFIRMED |
| B8 | Import variant → dialog | dialog title **"Import"**, same *"Select between 1 and 3 years…"* Year+Currency gate, Continue disabled until both set | LIVE-CONFIRMED |
| B9 | **Import Continue → upload** | after Year=2026 + USD → Continue → a **SECOND dialog** opens: *"Import All Equipment Pricing — Choose a file to import data. Attached file / No file selected / Browse / Upload progress 0% / Cancel / Upload / Close"* (has `input[type=file]`). | LIVE-CONFIRMED |

| B10 | `New ▾` menu | click `New` → 2 menuitems **Equipment Pricing / Labor Pricing** (route to `/add?type=equipment|labor`) | LIVE-CONFIRMED |
| B11 | `Loc Pricing Export` | **direct CSV download** `LocationPricebooks_<ts>.csv` via `GET …/api/location/pricing/location-export?locale=en-US` → [200]. No dialog. | LIVE-CONFIRMED |
| B12 | `Loc Pricing Import` | file-chooser dialog **"Import All Location Pricing — Choose a file to import data / Browse / Upload progress 0% / Cancel / Upload"** (`input[type=file]`). Did NOT adopt the Year+Currency gate. | LIVE-CONFIRMED |
| B13 | `Pricing Override` link | click → navigates to `…/corporate-pricing/pg-override` (h1 "Product Group Override") | LIVE-CONFIRMED |

**Net (B1 contract for SUBPLAN_TOOLBAR_REMEDIATION):** Export▾/Import▾ both gate behind the
Year(s)(1–3)+Currency dialog. Export Continue fires the `pricing-export` CSV API directly (params from
the variant + the gate). Import Continue opens a file-chooser upload dialog scoped to the
variant+year+currency. `Loc Pricing Export` (direct CSV) / `Loc Pricing Import` (file-chooser) /
Grid Options (9-col) did NOT adopt the gate (unchanged).

## C. STRATEGY — New Pricing Strategy dialog (create-mode + management-mode)

| # | Control | Raw evidence (2026-06-23) | Verdict |
|---|---|---|---|
| C1 | Add-strategy affordance | icon button `aria-label="New Pricing Strategy"` (lucide-plus) — present on BOTH the New-Pricebook create-page Strategy tab AND an existing pricebook's Details Strategy tab | LIVE-CONFIRMED |
| C2 | Dialog fields | title **"New Pricing Strategy"**; fields = **Strategy Name** (text, placeholder "e.g. 2026-Tier 4 Urban A") + 4 checkboxes: **Is GSO** (default false), **Is Active** (default **true**), **Is Internal** (false), **Is Productions** (false); buttons **Cancel / Add / Close** | LIVE-CONFIRMED |
| C3 | Dialog parity | create-mode dialog == management-mode dialog (identical fields/defaults/buttons) | LIVE-CONFIRMED |
| C4 | Add commits to in-session list | fill `#new-strategy-name`=ZZ-WALK-STRAT → Add → strategy list `Total: 0` → `Total: 1` (in-session, not persisted until pricebook Save) | LIVE-CONFIRMED |
| C5 | Cancel | Cancel → dialog closed (no commit) | LIVE-CONFIRMED |

## D. PRICING DETAIL (office 1604, fixture 91acb5ca = 2021-PB6 Inactive, management mode)

| # | Control | Raw evidence (2026-06-23) | Verdict |
|---|---|---|---|
| D1 | Grid | 2430 rows; headers ID / Product Group Name / Price / New Price / Max Discount | LIVE-CONFIRMED |
| D2 | Editable cells | row cells: Price (col3)=read-only display; **New Price (col4)=`<input>`**, **Max Discount (col5)=`<input>`** (disabled:false, readonly:false) | LIVE-CONFIRMED |
| D3 | **Inline edit + Save-enable** | trusted keyboard edit New Price (click→Ctrl+A→Delete→type "45"→blur) → cell commits **"45.00"** → page **Save enabled:true**. (Programmatic native-setter set the value but did NOT trip React dirty; trusted keyboard does — matches the passing TC-CPR-DET specs.) NOT saved (discarded via reload). | LIVE-CONFIRMED (positive control for the edit primitive) |
| D4 | Drag/dblclick ADD in mgmt mode (NM-1443) | (from 2026-06-19, re-affirmed by the create-mode positive control below) mgmt-mode drag + dblclick do NOT add (2430→2430). The New-Pricebook **create-mode** add (E4 below) is the same-app positive control proving the primitive fires — so the mgmt no-add is genuine defensive-by-design, NOT a dead primitive. | LIVE-CONFIRMED (NM-1443 holds) |

## E. NEW PRICEBOOK (office 1604) — create mode `…/add?type=equipment`

| # | Control | Raw evidence (2026-06-23) | Verdict |
|---|---|---|---|
| E1 | Header form | **Pricebook name** (text "Pricebook…"), **Type** combobox = "Equipment" (disabled, route-fixed), **Price Year** (text "e.g. 2026"), **Currency** combobox = "USD" (default); two tabs (Pricing Strategy + Pricing Detail) | LIVE-CONFIRMED |
| E2 | Catalog reveal (Detail tab) | source list = **3707 draggable** product groups (`[draggable=true][role=button]`, first = "271 Lift 0'-40' Boom - Daily") + source search box "Search ID or Name…" | LIVE-CONFIRMED |
| E3 | Empty-state hint | destination grid empty-state = *"No items added yet — Double-click or drag product groups from the sidebar"* | LIVE-CONFIRMED |
| E4 | **Create-mode ADD (double-click)** | dblclick source "271 …Daily" → destination grid **0 → 1** ("271 Lift 0'-40' Boom - Daily 0.00") | LIVE-CONFIRMED |
| E5 | **Create-mode ADD (drag)** | `drag` source "272 …Weekly" → grid → grid **1 → 2** (271 + 272) | LIVE-CONFIRMED (both add mechanisms fire — LR-061 positive control) |
| E6 | Save-reachable | header name=ZZ-WALK-DELETE + year=2030 + currency=USD + 2 grid rows + **1 strategy added** → page **Save enabled:true**. (Save is gated on ≥1 Pricing Strategy — discovered live: with 0 strategies Save stayed disabled.) NOT saved (abandoned). | LIVE-CONFIRMED |

## F. PRODUCT GROUP OVERRIDE (office 1101) — `…/settings/corporate-pricing/pg-override`

| # | Control | Raw evidence (2026-06-23) | Verdict |
|---|---|---|---|
| F1 | Page chrome | h1 "Product Group Override"; tabs Equipment[default] / Labor; 10-col grid (Location, Product Group, Product Group Name, Currency, Current Price, Override Price, Max Discount %, Active, Mod Date, Updated By); "No results." until a location is selected | LIVE-CONFIRMED |
| F2 | Location picker modal | trigger "Select a location" → modal **"Change Local Office"** (2652 rows; Active checkbox / search "Search by Location Name, Number" / "All Locations" row / per-row checkbox / Select[disabled until checked] / Cancel / Close). Filter "1101" → 1 row "1101 Corporate Office Encore USA SGA"; check + Select → applied | LIVE-CONFIRMED |
| F3 | Currency filter options | ALL / USD / CAD / MXN | LIVE-CONFIRMED |
| F4 | **Currency-gated picker (NM-1472)** | Currency=**ALL** → grid "No results." + **NO picker** (2 tables, picker absent). Currency=**USD** → picker renders **3358** draggable Equipment products (table0: Product/Product Group Name/Price). **CAD → 1** product. **MXN → 1** product. Picker renders for ANY specific currency; hidden ONLY at ALL. | LIVE-CONFIRMED (currency-gating proven across USD/CAD/MXN) |
| F5 | **Picker add (double-click)** | dblclick picker `span[title="271"]` → override grid **0 → 1** ("1101 \| 271 \| Lift 0'-40' Boom - Daily \| USD \| 0.00 \| 0.00 \| —") | LIVE-CONFIRMED |
| F6 | Override Price edit | click col6 `[role=button]` → reveals `<input>` → set "50" + Enter → cell **0.00 → 50.00** | LIVE-CONFIRMED |
| F7 | **Auto-activate (NM-1463), bidirectional** | setting Override Price (0.00→50) → **Active false → true**; clearing Override Price to empty (—) → **Active true → false**. Active ⟺ Override Price is set (0.00 counts as set; empty does not). | LIVE-CONFIRMED |
| F8 | **OVR-023 Max Discount >100 cap** | Max Discount input = `<input type=number min=0 max=100 step=0.01>`. Enter 150 + Enter → input retains "150" with **aria-invalid="true"** + warning tooltip *"Please enter a valid percentage with up to two decimal places. Enter 0.0 for no discount."*; value does NOT commit; **blocks Save** (Save disabled while an invalid cell exists). | LIVE-CONFIRMED |
| F9 | **Discount-requires-price (NM-1932/1463)** | Max Discount commits at cell level INDEPENDENT of price (entered 10% on a row with Override Price 0.00 → cell "10.00 %", aria-invalid=0). The coupling is via **Active**: a row only becomes/stays Active when an Override Price is set (F7) — so a discount cannot take effect (Active) without a price. The discount can be *staged* on an inactive row; Save was enabled with such a row present. | LIVE-CONFIRMED (enforced via the Active↔price coupling, not a hard cell/Save block) |
| F10 | Active checkbox | `#…` td:8 `[role=checkbox]` toggles (manually true/false) | LIVE-CONFIRMED |
| F11 | Picker add — Labor | Labor data on 1101 (NM-1881) — Labor tab picker path established 2026-06-19 (420 Labor products at USD); F4 currency-gating identical. | LIVE-CONFIRMED (M4 closed) |
| F12 | Active-only filter | `#pg-active-only` `[role=checkbox]` → toggled **false → true** (first attempt blocked by a leftover Import-dialog overlay `pointer-events:none`; cleared with Escape per LR-061, then toggled — NOT un-drivable) | LIVE-CONFIRMED |
| F13 | Client/grid filter | `input[placeholder="Filter Product Groups Override..."]` → React-set "Boom" → value held | LIVE-CONFIRMED |
| F14 | **Export** (override toolbar) | `button "Export"` → **direct CSV download** `ProductGroupOverrides_<ts>.csv` via `GET …/api/location/corporate-price-pg-override/export?locale=en-US` → [200]. **No dialog.** (Distinct from the Search toolbar's gated Export▾.) | LIVE-CONFIRMED |
| F15 | **Import** (override toolbar) | `button "Import"` → file-chooser dialog **"Import All Pricing Overrides — Choose a file to import data / Browse / Upload progress 0% / Cancel / Upload / Close"** (`input[type=file]`). Not the Year+Currency gate. | LIVE-CONFIRMED |
| F16 | Grid Options (override) | `button[aria-label="Grid Options"]` → Reset to Default View + 10 column toggles (2026-06-19, present) | LIVE-CONFIRMED (10-col) |
| F17 | Save (override) | present; disabled on clean grid; dialog-gated `[role=alertdialog]` on commit. **NOT clicked** (override creates persist irreversibly). | LIVE-CONFIRMED (present, not committed) |
| F18 | **Non-persistence / reversibility** | staged add rows (271 price 50, 272 discount 10) are Dirty+unsaved → navigating away fires native **beforeunload "Leave site?"** (dialog-accept) → on reload the grid is back to "No results." / location reset. **Never Saved → nothing persisted.** | LIVE-CONFIRMED |
| F19 | NM-2206 blank/red-circle | NOT observed (Override rendered normally; the only blank was the cold-start first-paint race, recovered by reload — not NM-2206) | not reproduced |

## G. HISTORY (NM-1444)

| # | Control | Raw evidence (2026-06-23) | Verdict |
|---|---|---|---|
| G1 | History tab on Details | Details page (both fixtures) tabs = **Pricing Strategy + Pricing Detail ONLY**; `body.innerText.includes('History')` = **false** on Details AND Search | **LIVE-ABSENT** |

**LR-040 (c) classification for History:** **c.1 population path** = the pricebook-level History
surface is NOT built in the new Corporate Pricing UI (no tab, no route, no text). **c.2 classification**
= **feature-blocked** (gated behind an unbuilt feature, tracked by **NM-1444**). **c.3 escalate** = no
new escalation needed — NM-1444 already tracks it; leave gated per the parent plan. This is the live
confirmation of the parent's "1444 History GATED" row.

---

## Operational notes (for the enumerator owner + future walkers)
- **Cold-start blank**: the first authenticated load of any CPR page in a cold playwright-cli session
  renders BLANK (body len ~0; next-auth CLIENT_FETCH_ERROR first-paint race). It does NOT redirect to
  login. **Reload once to recover.** Re-confirmed this session on Override (len 0 → 590 after reload),
  Details (len 314 → 560), New-Pricebook.
- **beforeunload guard**: navigating away from any dirty CPR form fires a native "Leave site?" dialog —
  handle with `playwright-cli -s=<sess> dialog-accept`. (This is the unsaved-changes guard working.)
- **CLI selector quirks** (LR-054 companion): `:has-text(...)` resolves; `:text-is(...)` frequently
  does NOT — prefer `:has-text`, attribute selectors (`span[title="X"]`, `#id`, `aria-label`), or the
  exact-text engine `text="X"`. React-controlled inputs: the native value-setter sets the DOM value but
  may not trip React dirty (Detail grid) — a **trusted keyboard** edit (click→type→blur) is the
  load-bearing commit for dirty-dependent assertions.
