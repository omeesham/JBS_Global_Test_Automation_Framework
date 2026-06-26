# Corporate Pricing — Drift / Gap Ledger (keystone re-walk)

**Subplan**: SUBPLAN_CORP_PRICING_REWALK_AUDIT.md (Phase 2, WATCHDOG classification)
**Parent**: PLAN_CORP_PRICING_REWALK_REMEDIATION.md
**Ledger date**: 2026-06-19 (dated family) · **Live walk executed**: 2026-06-23
**FULL e2e WALK COMPLETION (2026-06-23)**: every control previously *classified-from-oracle* is now **live-driven** — see the LR-064 proof-of-work trail `clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-2026-06-23.md` (per-control raw DOM/network evidence + Opus verdict). The rows updated to LIVE this pass: Override cell-edit validations (C8/C9 below), the Toolbar Export▾/Import▾ **post-Continue** path (A1/A2), the Strategy **New Pricing Strategy** dialog, the New-Pricebook **create-mode** add (double-click + drag), and the **History** tab (confirmed absent — feature-blocked, NM-1444).
**Browser tool**: Playwright CLI v0.1.8 (`playwright-cli -s=cpr`, storageState `clients/encore/.auth/encore-state.json`); HEADED-equivalent unattended walk. Drag re-verify used the manual pointer-primitive sequence + `drag`/`dblclick` (NOT `.dragTo()`-only).
**Machine denominators (LR-062, `npm run walk:enumerate`)**: Search **79** · Strategy **35** · Detail **38** · New-Pricebook **33** · Override(1604) **70** · Override(1101) **70**. Provenance JSON under `reports/walk-coverage/`.

> **Cold-start finding (operational, for B1/B2/B3 + the enumerator owner):** the FIRST authenticated load of any CPR page in a cold Playwright session renders BLANK — a `next-auth` `CLIENT_FETCH_ERROR` on `/navigator/api/auth/session` at first paint leaves the React app unmounted (body = only the notification region). It does NOT redirect to login, so the enumerator's login-abort never fires → it captured `denominator=1` on the first Search run. A reload / a fresh `npm run walk:enumerate` process recovers (Search re-run = **79**). **Re-run any walk that returns denominator=1.** A direct in-page fetch of `/api/auth/session` returns **200 with a valid token** (`s-prd-clickauto@psav.com`) — auth is NOT expired; this is a first-paint render race, not an auth failure. (Candidate enumerator hardening: a reload-retry when the post-`waitReady` denominator is ≤1. Flagged in Phase 2.5 → SUBPLAN_CORP_PRICING_REWALK_AUDIT not the owner of the script; routed below.)

---

## Verdict legend

`STILL-GREEN` (re-verified, no change) · `DRIFTED-RED` (app changed; existing tests now wrong/red) · `FALSE-NEGATIVE` (prior conclusion was wrong; positive control proves it) · `MISSED` (never covered) · `DEFERRED` (named recipient, not done here).

---

## A. Toolbar / Search action-bar — live re-walk 2026-06-23

| # | Surface / control | Live behavior (2026-06-23) | vs prior (W15-B / registry) | Verdict | TC IDs | Fixing subplan |
|---|---|---|---|---|---|---|
| A1 | **`Export ▾`** (4 variants: All Equipment Pricing / All Labor Pricing / All Equipment Max Discount / All Labor Max Discount) | Each variant opens an **"Export" dialog**: *"Select between 1 and 3 years and choose a currency to continue"* — `Year(s)` multi-select popover + `Currency` combobox + **`Continue` (disabled until both chosen)** + `Cancel` + `Close`. **No direct download on variant click.** | W15-B: direct `GET …/pricing-export?isLabor=…&isMaxDiscount=…` CSV download per variant. **Behavior REPLACED.** | **DRIFTED-RED** | TC-CPR-TIO-002/603/604/605 (+ the Export-side of the 10 stale) | **B1** TOOLBAR |
| A2 | **`Import ▾`** (4 variants, same names) | Each variant opens an **"Import" dialog**: same *"Select between 1 and 3 years and choose a currency to continue"* Year(s)+Currency gate, `Cancel`/`Continue`(disabled)/`Close`. **Not** a file-chooser. | W15-B: in-app file-chooser dialog ("Choose a file to import data", Browse/Upload). **Behavior REPLACED.** | **DRIFTED-RED** | TC-CPR-TIO-608/609/610/611/612/613 | **B1** TOOLBAR |
| A3 | **`New ▾`** split menu | Caret reveals 2 menuitems — **"Equipment Pricing"** → navigates `/add?type=equipment`; **"Labor Pricing"** → `/add?type=labor`. Confirmed by **real menu clicks** (not URL). | Prior: route reached by URL only, dropdown never clicked (parent "MISSED"). | **STILL-GREEN** (now click-verified) | TC-CPR-NPB-* (routes), New-▾ menu now covered | B1 (annotate covered) |
| A4 | **`Pricing Override`** link | Navigates to `…/corporate-pricing/pg-override` (the Override surface, section C). | Parent: zero coverage ("MISSED"). | **MISSED → now reached** | new TC needed (nav assert) | B1 / B3 |
| A5 | **`Loc Pricing Export`** | **Direct CSV download** `LocationPricebooks_<ts>.csv` via `GET …/pricing/location-export?locale=en-US`. No dialog. | Same as W15-B. | **STILL-GREEN** | TC-CPR-TIO-* (loc export) | — |
| A6 | **`Loc Pricing Import`** | File-chooser dialog **"Import All Location Pricing"** — *"Choose a file to import data"*, Browse / No file selected / Upload progress 0% / Cancel / Upload. | Same as W15-B (did NOT adopt the Year+Currency gate). | **STILL-GREEN** | TC-CPR-TIO-* (loc import) | — |
| A7 | **Search Grid Options** | `button[aria-label="Grid Options"]` → menu: **"Reset to Default View"** + **9 `menuitemcheckbox`** (Price Book, Price Book Strategy, Price Year, Is GSO, Is Internal, Is Labor, Is Active, Is Productions, Currency — all checked). | Same as W15-B (9-col). | **STILL-GREEN** | TC-CPR-TIO-* (grid opts) | — |
| A8 | Search grid + filters (9 cols, Pricebook/Strategy/Location/Currency/Is Internal/Is Labor/Active-Only, Reset/Search, "593 items found") | Renders + server-side filter on Search button (unchanged contract; see SUBPLAN_1445 query-param contract). | Same. | **STILL-GREEN** (re-verify only) | TC-CPR-SRC-001..030 | — |

**Net for B1:** the 10 stale `TC-CPR-TIO-*` toolbar tests are red because **`Export ▾` and `Import ▾` both adopted a shared `Year(s)`(1–3) + `Currency` precondition dialog** (`Continue` disabled until both set). `Loc Pricing Export/Import` and `Grid Options` did NOT change. B1 re-writes the Export/Import-variant TCs against the new dialog; the `Continue`-enabled path (download for Export, file-upload step for Import) is the new contract to capture.

**POST-CONTINUE PATH — LIVE 2026-06-23 (was the open B1 unknown; now driven):** Year options `2021–2028`, Currency `USD/CAD/MXN`, `Continue` enables only when both set. **Export Continue** → `GET …/api/location/pricing/pricing-export?isLabor=false&isMaxDiscount=false&currencyId=1&locale=en-US&years=2026` → **[200]** (variant → `isLabor`/`isMaxDiscount` params; no second dialog). **Import Continue** → a **SECOND** file-chooser dialog "Import All Equipment Pricing — Browse / Upload progress 0% / Upload" (`input[type=file]`). Full raw evidence in `walk-evidence-corporate-pricing-2026-06-23.md` §B.

---

## B. Pricing Detail — drag/double-click (NM-1443), live re-walk 2026-06-23

**Fixture**: `91acb5ca-20e2-ce8e-a9ab-8c370925fd65` = 2021-PB6 (Inactive), **management mode**. Pricing Detail tab (clicked via `button:has-text("Pricing Detail")` — the text tab has no testid). Grid = **2430 rows** (ID / Product Group Name / Price / New Price / Max Discount); separate **source panel = 3707 draggable** product groups.

| # | Test | Method | Grid rows before → after | Verdict |
|---|---|---|---|---|
| B1 | Drag source → grid (mgmt) | **manual full-pointer sequence** (`mousemove`→`mousedown`→`mousemove×3`→`mouseup`, src 271 "Lift 0'-40' Boom - Daily" → grid) | 2430 → **2430** (no add) | no-add |
| B2 | Drag source → grid (mgmt) | playwright `drag` (HTML5 DnD events) | 2430 → **2430** (no add) | no-add |
| B3 | Double-click source (mgmt) | `dblclick` | 2430 → **2430** (no add) | no-add |

**POSITIVE CONTROL (same session, same primitives — the M1 requirement):** on the **Override Product-Group Picker** (section C), the SAME `dblclick` and the SAME playwright `drag` **DID add** rows (0→1 via dblclick; 1→2 via drag). So the drag/double-click primitives **demonstrably fire HTML5 DnD in this app this session** — the Detail mgmt-mode no-add is therefore **genuine defensive-by-design behavior, NOT a weak-primitive false-negative.** Corroborated by SUBPLAN_CORP_PRICING_1440 (documented: double-click ADDS in New-Pricebook **create** mode).

**Verdict — Detail mgmt drag/dbl-click:** **STILL-GREEN / CONCLUSION-CONFIRMED, evidence now SOUND.** Matches NM-1443 (mgmt = no add by design). The prior `TC-CPR-DET-008/009/010` conclusion was *right* but `.dragTo()`-only (unsound); it is now backed by a positive control + a manual pointer sequence + a 3-method cross-check.

**Human contra-observation (a real-drag add in mgmt):** **NOT reproduced** — all three independent methods failed to add in mgmt mode. No app-vs-spec divergence found; NM-1443 holds. → **B2** DETAIL_DRAGDROP updates `TC-CPR-DET-008/009/010` to cite this positive-control evidence (replace the `.dragTo()`-only proof); no bug to file.

---

## C. Product Group Override — currency-gated picker (NM-1472), live re-walk 2026-06-23

**Page**: `…/1604/settings/corporate-pricing/pg-override`. h1 "Product Group Override". Tabs **Equipment**[default] / **Labor** (`role=tab`). 10-col grid (Location, Product Group, Product Group Name, Currency, Current Price, Override Price, Max Discount %, Active, Mod Date, Updated By). Location-gated: **"No results."** until a location is selected.

| # | Surface / control | Live behavior (2026-06-23) | Verdict | Fixing subplan |
|---|---|---|---|---|
| C1 | **Location picker modal** ("Change Local Office") | `Active` checkbox + search "Search by Location Name, Number" + "All Locations" row + per-row "Select row" checkbox + `Select`(disabled until a row checked) + `Cancel`/`Close`. Selecting **1101** sets the override target (URL stays `/1604/…` — location is internal filter state, not URL). | **MISSED → COVERED** (controls enumerated) | **B3** OVERRIDE_GAPS |
| C2 | **Currency filter** | Options **ALL / USD / CAD / MXN**. At **ALL** → grid "No results" + **NO picker**. | location-gated; matches NM-1463 | **B3** |
| C3 | **⭐ Product-Group Picker (NM-1472)** | Selecting a **SPECIFIC** currency (USD) on 1101 **reveals the picker**: Equipment tab → **3358 draggable** product groups (table 0: Product / Product Group Name / Price). The override grid (table 1) stays "No results" until you add. **The picker was INVISIBLE at Currency=ALL** — which is exactly why every prior walk (Currency=ALL) concluded "no add affordance". | **FALSE-NEGATIVE RESOLVED** (NM-1961 "no add affordance" close was WRONG) | **B3** OVERRIDE_GAPS |
| C4 | **Picker add — Equipment** | **Double-click** picker row 271 → override grid **0→1** row ("1101 \| 271 \| Lift 0'-40' Boom - Daily \| USD \| 0.00 \| 0.00 \| —"). **Drag** picker row 273 → grid **1→2** ("…273 Lift 41'-79' Boom - Daily…"). **Both mechanisms ADD.** | **MISSED → COVERED + PROVEN** | **B3** |
| C5 | **Picker add — Labor (M4 closure)** | Switch to **Labor** tab (currency stays USD) → picker shows **420 draggable** Labor product groups. **Double-click** first Labor item → grid **0→1** ("1101 \| 400 \| Banners Design \| USD …"). **Labor add via picker WORKS.** | **MISSED → COVERED + PROVEN** | **B3** |
| C6 | **Non-persistence / reversibility** | Staged add rows are Dirty + unsaved; navigating away fires a native **`beforeunload`** dialog; on reload the staged rows **discard** (grid back to "No results", location reset). I did **NOT** click Save → nothing persisted. | safe reversible probe | — |
| C7 | **Override Grid Options** | `button[aria-label="Grid Options"]` → **"Reset to Default View"** + **10 `menuitemcheckbox`** (all 10 columns, all checked). | **MISSED → COVERED** (10-col + Reset) | **B3** |
| C8 | Override-Discount-requires-Price (NM-1932/1463) — **LIVE 2026-06-23** | **Auto-activate CONFIRMED LIVE + bidirectional**: Override Price 0.00→50.00 flips Active **false→true**; clearing it to empty flips Active **true→false**. The "discount-requires-price" is enforced via this **Active↔Override-Price coupling** — Max Discount commits at cell level independent of price (10% on a 0.00-price row → "10.00 %", aria-invalid=0), but a row is only Active with a set Override Price (0.00 counts; empty does not), so a discount cannot *take effect* without a price. | **LIVE-CONFIRMED** (was Jira-oracle) | **B3** (build TC) |
| C9 | `TC-CPR-OVR-023` >100 cap — **LIVE 2026-06-23** | Max Discount input = `<input type=number min=0 max=100 step=0.01>`. Entering **150** → `aria-invalid="true"` + warning tooltip *"Please enter a valid percentage… Enter 0.0 for no discount."*; value does NOT commit; **blocks Save** while invalid. | **LIVE-CONFIRMED** (was DEFERRED) | **B3** (build TC) |
| C10 | NM-2206 blank / red-circle | **NOT observed** this session — Override rendered normally throughout (other than the cold-start first-paint blank in §header, which is auth-render-race not NM-2206). | not reproduced (no MFE-import path exercised) | watch (B3) |
| C11 | Override **Export / Import** (own toolbar) — **LIVE 2026-06-23** | **Export = direct CSV download** `ProductGroupOverrides_<ts>.csv` via `GET …/corporate-price-pg-override/export?locale=en-US` [200], no dialog. **Import = file-chooser dialog** "Import All Pricing Overrides" (Browse/Upload). Distinct from the Search toolbar's Year+Currency gate. | **LIVE-CONFIRMED** | **B3** |
| C12 | Override **currency-gated picker across currencies** + filters — **LIVE 2026-06-23** | Picker renders for EVERY specific currency on 1101: **USD=3358, CAD=1, MXN=1** products; hidden ONLY at ALL. Active-only (`#pg-active-only`) toggles; grid filter (`Filter Product Groups Override...`) accepts input. | **LIVE-CONFIRMED** | **B3** |

**M4 CLOSED — Labor population path (LR-040(c)):** the Override **Labor** tab is NOT empty-by-default-forever. **c.1 population path** = a location with Labor product groups (office **1101**, NM-1881) **+** a **specific currency** (not ALL) → Labor tab → picker renders **420** draggable Labor product groups → double-click/drag adds an override row. **c.2 classification** = `data-blocked` (Labor data exists on 1101; testable once the location+currency precondition is met — NOT feature-blocked, NOT by-design-empty). **c.3** = no escalation needed; path resolved live this session. The original "Labor tab empty, never investigated" miss is closed.

---

## D. Re-verify-only surfaces (parent ledger "✅ green")

| Surface | Verdict | Evidence |
|---|---|---|
| Search FCC (TC-CPR-SRC-001..030) | **STILL-GREEN (live 2026-06-23)** | 593 items found; 9 headers + filters render; Grid Options = Reset + 9 toggles. walk-evidence §A |
| Strategy FCC (TC-CPR-STR-*) | **STILL-GREEN (live 2026-06-23)** | New Pricing Strategy dialog DRIVEN live (Strategy Name + Is GSO/Is Active[true]/Is Internal/Is Productions; Cancel/Add/Close); identical in create + management mode. walk-evidence §C |
| Detail edit-save FCC (TC-CPR-DET-001..220) | **STILL-GREEN (live 2026-06-23)** | grid 2430 rows; New Price + Max Discount inline `<input>` editable; trusted-keyboard edit New Price→"45.00" **enables Save** (positive control). walk-evidence §D |
| New-Pricebook FCC (TC-CPR-NPB-*) | **STILL-GREEN (live 2026-06-23)** | create form (name/Type=Equipment-fixed/Year/Currency=USD); 3707-item catalog; **double-click AND drag both ADD** (grid 0→1→2); Save reachable after +1 strategy. walk-evidence §E |
| 1444 History | **GATED — LIVE-ABSENT (2026-06-23)** | Details tabs = Pricing Strategy + Pricing Detail ONLY; zero "History" text on Details/Search. **c.1** = pricebook History not built in new UI; **c.2** = feature-blocked (NM-1444); **c.3** = NM-1444 tracks it, leave gated. walk-evidence §G |

---

## E. Gap → recipient routing (LR-040 (a)/(b)/(c))

| Item | Class | Recipient |
|---|---|---|
| Export ▾ / Import ▾ drift (10 red TCs) | (b) | **SUBPLAN_CORP_PRICING_TOOLBAR_REMEDIATION** (B1) |
| Detail mgmt drag — re-evidence TC-CPR-DET-008/009/010 with positive control | (b) | **SUBPLAN_CORP_PRICING_DETAIL_DRAGDROP_REMEDIATION** (B2) |
| Override picker (Equipment+Labor add), location modal, Grid Options 10-col, discount-requires-price, OVR-023 cap, NM-2206 watch | (b) | **SUBPLAN_CORP_PRICING_OVERRIDE_GAPS_REMEDIATION** (B3) |
| Enumerator cold-start blank → denominator=1 (reload-retry hardening) | (b) | Phase 2.5 disposition → see SUBPLAN_CORP_PRICING_REMEDIATION_CLOSURE (D) handles enumerator/guard ramp; line appended there |

---

## Handoff

Every parent-ledger surface carries a live verdict above. Keystone settlements: **(1)** Override add-affordance is REAL and currency-gated (NM-1472) — proven on Equipment (3358) AND Labor (420, office 1101, M4 closed); **(2)** Toolbar `Export ▾`/`Import ▾` DRIFTED to a Year+Currency dialog (B1); **(3)** Detail mgmt no-add CONFIRMED defensive-by-design with a same-session positive control (no `.dragTo()`-only conclusion). Consumed by B1/B2/B3 + the absorbed FCC-P2/EDGE stubs.
