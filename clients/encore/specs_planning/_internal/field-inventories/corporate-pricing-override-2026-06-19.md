# Field Inventory — Corporate Pricing › Product Group Override (RE-WALK; NM-1472 currency-gated Picker RESOLVED)

**Module**: corporate-pricing-override
**Client**: encore
**MCP_Session_Date**: 2026-06-19
**MCP_Session_Tool**: Playwright CLI v0.1.8 (agent-CLI, `playwright-cli -s=cpr`, storageState `clients/encore/.auth/encore-state.json`)
**MCP_Tool_Reason**: keystone re-walk (SUBPLAN_CORP_PRICING_REWALK_AUDIT) — the prior override inventories (2026-06-08 recon, 2026-06-09 W15-A) walked with `Currency=ALL` and never rendered the **Product-Group Picker**; this re-walk drives a location + a **specific** currency to enumerate the picker add-affordance (NM-1472) on Equipment AND Labor. Live walk ran 2026-06-23; artifact dated to the subplan/deliverable family (2026-06-19).
**Author_Identity**: HUNTER (OWNER multi-identity span)
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/pg-override
**Test_Entity**: Office **1101** (Corporate Office Encore USA SGA) — the Labor-data office (NM-1881); currency **USD**. Equipment picker = 3358 product groups, Labor picker = 420.
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-rewalk-2026-06-19.md
**Baseline_Scope**: baseline-absent (net-new on e2e; intent oracle = Jira NM-1472/1463/1881)
**Supersedes**: corporate-pricing-override-2026-06-09.md (W15-A — its grid edit-cycle findings remain valid; this artifact ADDS the currency-gated Picker that 2026-06-09 did not see because it used Currency=ALL)
**Coverage_Ratio**: 70/70 (100% dispositioned) — every union element carries a disposition: **30 covered** (override-surface controls) + **40 `out-of-scope`** (global Navigator app-shell chrome). `out-of-scope` IS a disposition per LR-062, so the dispositioned-ratio Cx reads is 100%.
**Walk_State**: office=1101 currency=USD tab=Equipment+Labor (picker-revealed state)
**CrossCheck**: clean (every override-surface element dispositioned; app-shell chrome out-of-scope with reason)

> **Live cell-edit addendum (2026-06-23)** — the row-edit validations were DRIVEN live this pass (no longer Jira-oracle): **Override Price** edit `0.00→50.00` auto-activates the row (Active false→true), clearing it auto-deactivates (true→false) — NM-1463 bidirectional; **Max Discount** = `<input type=number min=0 max=100>`, value 150 → `aria-invalid=true` + tooltip "Please enter a valid percentage… Enter 0.0 for no discount." + blocks Save (OVR-023); a discount commits at cell level independent of price but only takes effect via the Active↔price coupling; **Export** = direct CSV (`corporate-price-pg-override/export`), **Import** = file-chooser dialog; **non-persistence** = staged rows discard on reload (beforeunload guard; never Saved). Full raw evidence: `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-2026-06-23.md` §F.

---

## ⭐ NM-1472 RESOLVED — the Override add-affordance is a currency-gated Product-Group Picker (prior "no add affordance" was a FALSE NEGATIVE)

Every prior CPR override walk used **`Currency=ALL`** and saw only a location-gated empty grid → concluded there was **no add affordance** (the NM-1961 close). **This re-walk proves that is WRONG.** The add affordance — a **Product-Group Picker** (a left source table of draggable product groups beside the override grid) — renders **only when a SPECIFIC location AND a SPECIFIC currency (not ALL) are selected**, exactly per NM-1472.

| Precondition | Result (live 2026-06-23) |
|---|---|
| Location unselected | Grid "No results."; no picker. |
| Location=1101, Currency=**ALL** | Grid "No results."; **no picker** (this is the state the prior walks stopped at). |
| Location=1101, Currency=**USD**, tab=**Equipment** | **Picker renders: 3358 draggable product groups** (table 0: Product / Product Group Name / Price). |
| Location=1101, Currency=**USD**, tab=**Labor** | **Picker renders: 420 draggable Labor product groups** (M4 — Labor population path closed, NM-1881). |

**Add mechanisms — BOTH proven (live, this session):**
- **Double-click** a picker row → appends a row to the override grid. Equipment: 0→1 (`1101 | 271 | Lift 0'-40' Boom - Daily | USD | 0.00 | 0.00 | —`). Labor: 0→1 (`1101 | 400 | Banners Design | USD | …`).
- **Drag** a picker row (HTML5 DnD) → appends a row. Equipment: 1→2 (`…273 Lift 41'-79' Boom - Daily…`).
- New rows init **Dirty + default values**, Current/Override Price `0.00`, Max Discount `—`. Not persisted until **Save** (this session did NOT Save — see reversibility).

**Reversibility / dirty-guard:** navigating away from a dirty (staged-add) grid fires a native **`beforeunload`** dialog (`dialog-accept` = discard + leave); on reload the staged rows discard (grid returns to "No results", location resets). Confirms staged adds are non-persistent until Save.

---

## Field / control inventory (override surface)

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

## Designed validations (Jira oracle — B3 builds the TCs)

- **Override Price auto-activates the row** (NM-1463). **Override Discount (0–100) cannot exist without an Override Price** (NM-1932/1463) — designed validation, NOT blocked-data. Max Discount % **capped at 100** (W15-A; `TC-CPR-OVR-023`).
- "New" location list **excludes locations that already have an override** (NM-1463).
- Live bugs to expect (not "no data"): NM-2206 (blank/red-circle after MFE pricebook + import), NM-2165 (import network error, PGs still update), NM-2301 (Max Discount NULL→0.00 on price update). NM-2206 **not observed** this session (no MFE-import path exercised).

---

## Coverage Manifest (machine-enumerated, LR-062)

<!--
Coverage_Ratio: 70/70 (100% dispositioned: 30 covered + 40 out-of-scope app-chrome)
Walk_State: office=1101 currency=USD tab=Equipment+Labor
CrossCheck: clean
-->

Machine denominator: **70** element(s) (identical raw set on 1604 and 1101 resting state). Provenance JSON: `reports/walk-coverage/1101-corporate-pricing-override.json` (+ `1604-corporate-pricing-override.json`). The resting enumeration captures the location-gated EMPTY state (location launcher + currency filter + Equipment/Labor tabs + 10 grid headers + global app-shell chrome); the **picker** add-controls are NOT in the resting denominator (they render only post location+currency, per NM-1472 — enumerated interactively this session, dispositioned below).

**Disposition by class** (the 70 union elements collapse to these classes; the app-shell chrome is the bulk):

| class | count | disposition |
|---|---|---|
| Override-surface controls (location launcher, currency filter, Equipment/Labor tabs, 10 grid `<th>`, Grid Options, action buttons) | ~30 | **covered** — this re-walk + W15-A inventory (rows above) |
| Global app-shell chrome (left nav: Home/Inbox/Actions/Commissions/Tax/Setup/Studio/Assistant + sidebar restore + user menu + Radix `radix-_r_*` trigger buttons) | ~40 | **out-of-scope: global Navigator app-shell, not the Product Group Override surface — owned by app-frame coverage, not this module walk** |

**Picker add-controls** (3358 Equipment / 420 Labor draggables, location+currency-gated) are NOT counted in the resting 70-denominator — they are a separate dynamically-revealed state, **covered + add-proven** above (C3/C4/C5). Per LR-062 the resting machine denominator + the interactive picker disposition together give a `CrossCheck: clean` for the override surface; all 70 resting elements are dispositioned (30 covered override controls + 40 app-frame chrome correctly `out-of-scope`), so the dispositioned-ratio = 100%. (Cx in `announce` mode 2026-06-19.)

---

## Handoff

NM-1472 currency-gated Picker RESOLVED on Equipment (3358) + Labor (420, office 1101 — M4 closed). Override surface controls fully enumerated. Consumed by **SUBPLAN_CORP_PRICING_OVERRIDE_GAPS_REMEDIATION (B3)** — builds the picker-add TCs (Equipment + Labor), location-modal TCs, Grid Options 10-col TCs, and the designed discount-requires-price/auto-activate validation TCs. The drift ledger (`corp-pricing-drift-ledger-2026-06-19.md`) carries the cross-surface classification.

## Observations

### Bugs / Defects

none (retrofitted — original walk did not record findings)

### Suggestions / Improvements

none (retrofitted — original walk did not record findings)
