# Field Inventory — Corporate Pricing Search (NM-1445)

**Module**: corporate-pricing-search
**Client**: encore
**MCP_Session_Date**: 2026-06-05
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: Playwright CLI (`@playwright/cli` v0.1.8, binary `playwright-cli`, session `-s=cpr-search`, storageState `clients/encore/.auth/encore-state.json`). Unattended catalog walk + network classification of a sparse-testid virtualized grid — token-efficient CLI over Chrome per LR-038 v2 (no visual/CSS work, no live pause step). The `MCP_Session_Tool` enum still reads "Playwright MCP" pending SP-PWC2-05 value-normalization for the CLI (browser-tool.md legacy footnote); the CLI is literally "run playwright mcp commands from terminal".
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing
**Test_Entity**: Office 1604 (Parker Palm Springs)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md

> Walk performed under SUBPLAN_CORP_PRICING_1445_SEARCH_P1 Phase 1 **GIVER** phase identity; umbrella session identity OWNER (the enum's accepted value). Corporate Pricing is a **React/Next.js** module (component `corporate-pricing-container.tsx`), NOT Angular — content renders inside a nested **shadow root** (`document.querySelector` does NOT pierce; a recursive deep-pierce helper traversing `.shadowRoot` was used for `eval` reads; Playwright `click`/`fill`/`snapshot` pierce automatically). **No data mutation committed** — this is a read-only Search screen (only the in-page filter form state was exercised, then Reset-restored).
>
> **Baseline**: `baselineScope: baseline-absent` — Corporate Pricing is purely an e2e feature with NO navigator2 equivalent (user-confirmed 2026-06-05, see companion `old-site-baseline/corporate-pricing-2026-06-05.md`). Intent oracle = DOCX NM-1445.

---

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing` — Corporate Pricing **Search** screen (h1 "Corporate Pricing"; page title "Corporate Pricing | Navigator"). Single-screen page (no in-page tabs). Navigation builds URL as `{base}locations/{office}/settings/corporate-pricing` (`CorporatePricingBasePage.gotoSearch`).
- Row→details affordance reached `/navigator/locations/1604/settings/corporate-pricing/details/<guid>` (h1 "Corporate Pricing Details") — confirmed, walked back. (Details screen is S2/S3 scope.)
- New split-button → `/navigator/locations/1604/settings/corporate-pricing/add?type=equipment|labor` (route-param) — confirmed via the New menu (not deep-walked; S2/1440 scope).

---

## Live-state caveat

| Field | Live (2026-06-05) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Search filtering | **Server-side, on Search-button click** (each filter is a query param of `GET /navigator/api/location/pricing/strategies`) | DOCX NM-1445 §Search Criteria: "All filtering client-side. No API calls when typing or selecting." | **MAJOR DIVERGENCE (D2)** — live filters are STAGED on input (no call, no grid change) and submitted SERVER-SIDE on Search. Only the *act of typing/selecting* fires no call (the DOCX's narrow claim is true); the *filtering itself* is a server query, not client-side. Asserted as live; raised via `/encore-questions` (`encore-questions-drafts/corporate-pricing-search-divergences-2026-06-05.md`). |
| Results columns | **9 columns** (Is Productions + Currency as separate columns) | DOCX lists **8** (incl. "Productions Currency" as one column) | **DIVERGENCE (D1)** — live splits "Productions Currency" → `Is Productions` + `Currency`. Likely benign UI expansion. Cover all 8 DOCX-named (verify present), assert the live 9, raise the 8↔9 split via `/encore-questions`. |
| Component-load endpoint | `GET /navigator/api/location/pricing/strategies` | DOCX placeholder `[/api/Pricebook/All/List]` | DOCX endpoint names are placeholders; live endpoint is `/pricing/strategies`. No defect — placeholder→real. |
| Pricing Strategy filter | **text input** (placeholder "Enter strategy") | XLSX helpers 009/010 assumed a **dropdown** | Helper assumption wrong — it is a free-text filter, same pattern as Pricebook. Corrected. |

---

## Field Inventory

Selector strategy (Doctrine 4 / D8 / LR-029): near-zero automation-grade `data-testid` (live shadow-pierced audit: 3 generic only — `e2e-card-header`, `e2e-card-title`, `e2e-checkbox`; none field-specific). Selectors are text / role / placeholder / grid-`<th>` / content-anchored, plus the per-column `button[aria-label="Resize column <key>"]` handle.

### Search Criteria filters (7)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Pricebook | (none) — use `input[placeholder="Enter name"]` | text input | (empty) | none observed | always enabled | none | Staged; on Search → server param `pricebookName=<value>`. Verified: "2021-PB6" → 1 row. |
| Pricing Strategy | (none) — use `input[placeholder="Enter strategy"]` | text input | (empty) | none observed | always enabled | none | **CORRECTED to text input** (helpers assumed dropdown). Staged; on Search → server param (strategyName by symmetry). |
| Location | (none) — use `button[role="combobox"]:has-text("All Locations")` | combobox (Radix, searchable popover) | All Locations | none observed | always enabled | none | **2652 options** (first "Clear selection", then `<office#> - <name>`) → LR-025 large-dropdown. Options loaded once at mount via `POST /location/location-lookup`. |
| Currency | (none) — use `button[role="combobox"]:has-text("All Currencies")` | combobox (Radix) | All Currencies | none observed | always enabled | none | Options: **All Currencies, USD, CAD, MXN** (4). Loaded once via `GET /core/currencies`. |
| Is Internal | (none) — use `div:has(> *:text-is("Is Internal")) [role="checkbox"]` | checkbox (Radix `button[role="checkbox"]`, `data-state`) | unchecked (`aria-checked=false`) | none | always enabled | none | Staged; on Search → server param `isInternal=true`. Verified: → 3 rows. |
| Is Labor | (none) — use `div:has(> *:text-is("Is Labor")) [role="checkbox"]` | checkbox (Radix) | unchecked | none | always enabled | none | Staged; on Search → server param `isLabor`. |
| Active Only | (none) — use `div:has(> *:text-is("Active Only")) [role="checkbox"]` | checkbox (Radix) | **checked** (`aria-checked=true`) | none | always enabled | none | **DEFAULT CHECKED** (resolves helper-003 [ASSUMPTION]). On Search → server param `isActive`. Load URL carries `isActive=true`. |

### Search Criteria actions (2)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Search | (none) — use `button:text-is("Search")` | button | n/a | n/a | always enabled | submits all staged filters | Fires `GET /navigator/api/location/pricing/strategies?<staged params>` → grid re-queries server-side + narrows. |
| Reset | (none) — use `button:text-is("Reset")` | button | n/a | n/a | always enabled | clears all filters | Restores defaults (Active Only re-checked, text cleared) AND restores grid to full 591 **client-side** (no server call — cached original list). |

### Results grid (9 columns — real HTML `<table>`)

| Column header (verbatim) | Internal key (resize-handle aria) | Type | Boolean render | Notes |
|---|---|---|---|---|
| Price Book | pricebookName | text (clickable) | n/a | cell = `<button class="cursor-pointer hover:underline">` → navigates to `/details/<guid>` (D4) |
| Price Book Strategy | strategyName | text | n/a | |
| Price Year | strategyYear | text | n/a | |
| Is GSO | isGSO | boolean | Unicode ✔ / empty | LR-036 Unicode |
| Is Internal | isInternal | boolean | Unicode ✔ / empty | |
| Is Labor | isLabor | boolean | Unicode ✔ / empty | |
| Is Active | isActive | boolean | Unicode ✔ / empty | |
| Is Productions | isProduction | boolean | Unicode ✔ / empty | **D1 split** — DOCX "Productions Currency" → this + Currency |
| Currency | currencyAbbrv | text | n/a | **D1 split** — e.g. USD |

- **Grid container**: `table` (one). **Rows**: `tbody tr` (50 rendered at a time — **virtualized** of 591). **Cells**: `td` (9 per row). **Headers**: `th` (9).
- **Per-column anchor**: `button[aria-label="Resize column <internalKey>"]` (stable, one per column).
- **Boolean TRUE cell**: `<span class="text-primary font-bold">✔</span>` inside `<td>`; **FALSE** = empty `<td>` (LR-036 Unicode `✔`; readable via `textContent`).
- **Item count**: text `"591 items found"` (VOLATILE — shared office 1604; assert the pattern `/\d[\d,]*\s+items found/`, never the exact number — LR-022).

### Action bar (above grid)

| Button | Selector | Notes |
|---|---|---|
| New | `button:text-is("New")` | **split-button** → pointer-sequence opens `role="menu"` with `[role="menuitem"]` "Equipment Pricing" + "Labor Pricing" → `/add?type=equipment|labor` (route-param "Must", DOCX R1445-4) |
| Pricing Override | `button:text-is("Pricing Override")` | presence (deep behavior P3) |
| Loc Pricing Export | `button:text-is("Loc Pricing Export")` | presence |
| Loc Pricing Import | `button:text-is("Loc Pricing Import")` | presence |
| Export | `button:text-is("Export")` | presence |
| Import | `button:text-is("Import")` | presence |
| Grid Options | `button:text-is("Grid Options")` | presence |

> **Note on "Price Over-ride" (DOCX NM-1445 §Navigation Links)**: the DOCX lists a "Price Over-ride" link with destination "TBD". Live shows a **`Pricing Override`** button (presence asserted). Its navigation destination is unbuilt (DOCX line 22 "URL: TBD") → deep navigation deferred (c).

---

## Labels + Section Names

**Search screen (verbatim):**
- Heading: "Corporate Pricing"
- Filter labels (top→bottom): "Pricebook", "Pricing Strategy", "Location", "Currency", "Is Internal", "Is Labor", "Active Only"
- Filter actions: "Reset", "Search"
- Grid headers: "Price Book", "Price Book Strategy", "Price Year", "Is GSO", "Is Internal", "Is Labor", "Is Active", "Is Productions", "Currency"
- Action bar: "Pricing Override", "Loc Pricing Export", "Loc Pricing Import", "New", "Export", "Import", "Grid Options"
- New menu items: "Equipment Pricing", "Labor Pricing"
- Footer: "591 items found"

---

## Save-cycle observations

**Save button behavior**: **N/A** — the Search screen is read-only (no Save). The only mutating affordances (New, Pricing Override) navigate AWAY to other screens (1440 / unbuilt). Filter state is transient UI state (not persisted; Reset clears it).

**Save dialog**: N/A (no save on Search).

**Post-save toast**: N/A.

**Dirty-state behavior**: N/A — no form persistence. Filter inputs stage and are cleared by Reset; navigating away does not prompt (no dirty guard observed on the Search filter form).

---

## Observations

### Bugs / Defects

No app bugs identified in this session. The two divergences (D1 8↔9 columns; D2 server-side-vs-DOCX-client-side filtering) are **specification/requirements clarifications**, not application defects — the live behavior is internally consistent and correct-looking; the DOCX is a pre-build placeholder. Both raised via `/encore-questions` (see `encore-questions-drafts/corporate-pricing-search-divergences-2026-06-05.md`), NOT filed as `BUG-*`.

---

### Suggestions / Improvements

none
## Staleness signal

- **Last verified**: 2026-06-05
- **Fresh-until**: 2026-06-19
- **Stale-after**: 2026-07-05
- **Refresh triggers**: any change to the Corporate Pricing Search markup; any new field-specific `data-testid`; grid column add/remove (esp. resolution of the 8↔9 split); change to the filter submission model (client-side vs server-side); change to the `/pricing/strategies` query-param contract; New split-button menu / route-param change.

---

## Network-request evidence (D2 classification — LR-033 / LR-056)

Captured via `playwright-cli -s=cpr-search network` (filter `/navigator/api/`):

| Action | API call(s) observed | Status | Inference |
|---|---|---|---|
| Component load (mount) | `GET /navigator/api/location/pricing/strategies?isActive=true&isInternal=false&isLabor=false&pageNumber=1&pageSize=50` (exactly 1); plus `GET /core/currencies`, `POST /location/location-lookup`, `GET /env`, `GET /auth/session` | 200 | **Single list call** populates the grid (helper 001 ✓). Default query reflects the default filter state (`isActive=true` = Active Only checked; `pageSize=50` = server pagination). Dropdown sources loaded once. |
| Type in Pricebook filter | (none) | — | **No call** — typing is staged client-side (helper 024 ✓). |
| Toggle Is Internal checkbox | (none) | — | **No call**, grid unchanged — checkbox toggle is staged (helper 015/016 corrected). |
| Open/select dropdown (Currency/Location) | (none) | — | **No call** — options cached from mount; selection staged (helper 025 ✓). |
| Click **Search** | `GET /navigator/api/location/pricing/strategies?isActive=true&isInternal=true&isLabor=false&pageNumber=1&pageSize=50` | 200 | **Server re-query** with staged params → grid narrowed to "3 items found". Filtering is SERVER-SIDE on Search (D2 verdict). |
| Click Search (Pricebook="2021-PB6") | `...&pricebookName=2021-PB6&...` | 200 | Text filter is server param `pricebookName`; narrowed to "1 items found" (2021-PB6). |
| Click **Reset** | (none) | — | Grid restored to 591 + form to defaults **client-side** (cached original list; no server call). |

**D2 verdict**: filtering is **server-side, submitted by the Search button** — NOT client-side as the DOCX claims. The act of typing/selecting fires no network (the DOCX's narrow "no API calls when typing/selecting" claim is true), but the filtering itself is a server query. Raised via `/encore-questions`.

---

## Known gaps

- **Pricing Strategy / Location / Currency / Is Labor / Active Only individual server narrowing** not each exhaustively driven this session — Is Internal (→3) + Pricebook text (→1) prove the staging+Search-server-query model; the remaining filters use the identical staging mechanic and the same `/pricing/strategies` param contract (params observed in the load URL). Per-filter narrowing assertions are authored in P1; exhaustive each-option enumeration → FCC P2 (b).
- **Location each-option** (2652 options) — only the default + option shape walked; each-option exercise → FCC P2 (b).
- **New Pricebook destination** (`/add?type=…`) and **Pricing Override destination** — only entry/route-param walked (read-only); full destination coverage is 1440 / P3 scope.
