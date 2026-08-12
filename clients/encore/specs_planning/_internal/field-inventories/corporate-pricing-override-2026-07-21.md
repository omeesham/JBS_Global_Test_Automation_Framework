# Field Inventory — Corporate Pricing › Product Group Override (EXPORT walk, NM-2272)

**Module**: corporate-pricing-override
**Client**: encore
**MCP_Session_Date**: 2026-07-21
**MCP_Session_Tool**: Playwright CLI v0.1.8 (agent-CLI, `playwright-cli -s=cpr`, storageState `clients/encore/.auth/encore-state.json`)
**MCP_Tool_Reason**: NM-2272 export-surface walk — 10 export probes across every grid scope dimension plus per-control affordance probes; unattended, grep-over-disk snapshot discipline, and a `playwright-cli` network/download trail is the machine evidence LR-062 condition 5 requires. Chrome was not needed (no visual/CSS question, no human-in-loop step).
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/pg-override
**Test_Entity**: Office **1604** (session office) with the grid driven against offices **1105** (9 Equipment / 2 Labor / 7 active), **1974** (161 Equipment rows — the multi-page bed), and **1604** (which turns out to 500 — see Known App Bugs)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-rewalk-2026-06-19.md
**Baseline_Scope**: baseline-absent (Export/Import is net-new on e2e; intent oracle = Jira NM-1446 master Import/Export story + NM-1463 Override)
**Supersedes**: corporate-pricing-override-2026-06-19.md (its grid/picker findings remain valid; this artifact refreshes the >30-day-stale walk and ADDS the export scope-dimension matrix, the pagination bed, and 5 newly-found defects)
**Coverage_Ratio**: 70/70 (100% dispositioned)
**Walk_State**: office=1604 module=corporate-pricing-override (resting enumeration); probes driven on 1105 / 1974 / 1604
**CrossCheck**: clean

---

## URL(s) visited

| URL | Purpose |
|---|---|
| `…/navigator/locations/1604/settings/corporate-pricing/pg-override` | the Override surface — resting enumeration + every probe |
| `…/navigator/api/location/corporate-price-pg-override?localOfficeId=<id>` | grid data endpoint — driven for 8 offices (blast-radius characterisation) |
| `…/navigator/api/location/corporate-price-pg-override/export?locale=<L>` | export endpoint — driven at 6 locales + 6 malformed locale values |

---

## Live-state caveat

The grid is **location-gated**: with no office selected it reads "No results." / "0 items found".
Row counts below are per-office and reflect the tenant on **2026-07-21**; the export's 8,996 data rows
across 1,782 offices were stable across 4 days (identical to the 2026-07-17 observation), so the
volume assertions in the authored TCs use **dynamic floors** per LR-022, never the literal 8,996.

Office **1604** — the framework's default test office — **cannot load this grid at all** (HTTP 500,
see Known App Bugs). Every probe needing rendered rows therefore ran on 1105 or 1974.

---

## Field Inventory

### Search / filter panel

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Change Local Office launcher | (MISSING — using text `Select a location` / the rendered `<office> - <name>`; tracked in testid-gap-report) | launcher → dialog | `Select a location` (unselected) | none | always enabled | gates the whole grid; **does not gate Export** | `affordance: launcher → "Change Local Office"`; picker lists ~1,800 offices |
| Active only | `pg-active-only` | Radix checkbox | unchecked | none | always enabled | filters grid only | LR-036 4th boolean form — read via `aria-checked`. Grid 9 → 7 on office 1105 |
| Currency : | `pg-ref-currency` | Radix combobox | `ALL` | none | enabled on a healthy office; **`[disabled]` when the grid fetch 500s** — the only visible tell of BUG-CANDIDATE-3 | filters grid only | options ALL / USD / CAD / MXN |
| Collapse search panel | (MISSING — using `aria-label`; tracked in testid-gap-report) | icon button (toggle) | expanded | none | always enabled | none | **`affordance: none` — DEAD CONTROL.** Label flips Collapse⇄Expand; zero layout change (BUG-CANDIDATE-6) |
| More information | (MISSING — using `aria-label`; tracked in testid-gap-report) | info icon | — | none | always enabled | none | `affordance: popover → tooltip "This is the future product group override page"` |

### Action bar

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Save | (MISSING — using role+name; tracked in testid-gap-report) | button | — | commits staged grid edits | **disabled until the grid is dirty** | dirty-state | correct state discipline; contrast with Export |
| **Export** | (MISSING — using role+name; tracked in testid-gap-report) | button → direct CSV download | — | none | **always enabled, even on an empty grid** | **NONE — ignores all 7 grid controls** | the subject of this walk; `GET …/export?locale=en-US`, no filter params |
| Import | (MISSING — using role+name; tracked in testid-gap-report) | button → dialog | — | file required | always enabled | none | dialog title "Import All Pricing Overrides"; owned by NM-2273 |
| Grid Options | `aria-label="Grid Options"` | menu button | — | none | always enabled | column visibility | covered by TC-CPR-OVR-031 |

### Grid controls

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Equipment / Labor tabs | `radix-_r_18_-trigger-Equipment` / `-Labor` | Radix tabs | Equipment selected | none | always enabled | re-scopes grid rows only | 1105: 9 Equipment vs 2 Labor; export identical in both |
| Filter Product Groups Override… | (MISSING — using placeholder text; tracked in testid-gap-report) | text input (client-side filter) | empty | none | always enabled | filters grid only | `Analog` on 1105 → grid 9 → 1; export unchanged |
| Column header sort menu ×10 | `radix-_r_2d_` … `radix-_r_2v_` | dropdown trigger | no active sort | none | always enabled | re-orders grid only | menu = Sort ascending / Sort descending / Hide column. **Header *click* is inert** (TC-CPR-OVR-035); sorting lives on this dropdown |
| Resize column ×10 | (MISSING — using `aria-label="Resize column <field>"`; tracked in testid-gap-report) | drag handle (`cursor: col-resize`, 4×32) | inline `width: 190px` | `min-width: 80px` | always enabled | none | **`affordance: none` — DEAD CONTROL.** Drag rewrites inline width 190→290 px; rendered width stays 116 px (BUG-CANDIDATE-7) |
| Rows per page | (MISSING — using role=combobox; tracked in testid-gap-report) | Radix select | `20` | none | always enabled | page size only | options **10 / 20 / 30 / 40 / 50** (enumerated live) |
| Go to first / previous page | (MISSING — using `aria-label`; tracked in testid-gap-report) | icon buttons | — | none | **disabled on page 1** | page state | 4 → 1 and 2 → 1 both driven live |
| Current page number | (MISSING — using `aria-label`; tracked in testid-gap-report) | textbox | `1` | numeric | always enabled | page state | fill `2` + Enter → page 2, 50 rows |
| Go to next / last page | (MISSING — using `aria-label`; tracked in testid-gap-report) | icon buttons | — | none | **disabled on the last page** | page state | 1974 @ 50/page → page 4 of 4 renders the 11-row remainder |

---

## Labels + Section Names

- Page title: **Product Group Override | Navigator**
- Filter panel: `Change Local Office` · `Select a location` · `Active only` · `Currency :`
- Action bar: `Save` · `Export` · `Import` · `Grid Options` · `<n> items found`
- Tabs: `Equipment` · `Labor`
- Filter placeholder: `Filter Product Groups Override...`
- Grid columns (10): `Location` · `Product Group` · `Product Group Name` · `Currency` · `Current Price` · `Override Price` · `Max Discount %` · `Active` · `Mod Date` · `Updated By`
- Export CSV header (9, en-US): `Location Id,Product Group Id,Product Group Name,Is Labor,Currency,Current Price,Override Price,Override Discount,Is Active`
- Empty state: `No results.` / `0 items found`

**Note the column-name trap**: the grid says `Max Discount %`, the exported file says `Override Discount`. They are the same field; the grid and the file do not share names.

---

## Save-cycle observations

**No save cycle was exercised in this walk.** The export surface is read-only by construction: it
issues a `GET` and downloads a file. `Save` stayed disabled throughout (the grid was never dirtied),
which is deliberate — NM-2272 is export-only and mutating tenant-wide shared data is out of scope.
Save-cycle behavior for the editable grid cells remains covered by `TC-CPR-OVR-025/026/027/028` and
the 2026-06-19 artifact's live cell-edit addendum.

---

## Known App Bugs

| Bug | Surface | Behavior | Status |
|---|---|---|---|
| **BUG-CANDIDATE-3** ⚠ HIGH | grid data endpoint, office **1604** | `GET …?localOfficeId=1604` → **HTTP 500**, `"An item with the same key has already been added. Key: 4543"`. Deterministic 3/3. Offices 1105/1974/9187/9019/9185/1101/1115 all 200. The office's 732 overrides exist and export cleanly; PG 4543 appears nowhere in the export and the file has zero duplicate `(Location, Product Group)` pairs — so the duplicate key is built inside the grid endpoint's own projection. | NEW |
| **BUG-CANDIDATE-3b** ⚠ HIGH | grid error handling | The 500 renders as **"0 items found"** with no error, no toast, no retry — indistinguishable from a legitimately-empty office. A test asserting an empty grid goes **green on a server error**. Only tell: the Currency combobox silently becomes `[disabled]`. | NEW |
| **BUG-CANDIDATE-6** | Collapse search panel | Toggles its own `aria-label` with zero layout change across 60 `<main>` descendants. Dead control. | NEW |
| **BUG-CANDIDATE-7** | column resize ×10 | Drag is tracked and rewrites the inline width, but `table-layout: auto` on a `width: 100%` table discards it — no column ever visibly resizes. | NEW |
| **BUG-CANDIDATE-4** | export `fr-FR` header | `Override Price` → `Prix des commissions indirectes`; `Override Discount` → `Remise de remplacement`. Neither means "override". `es-MX` is correct, so it is a French-catalog error. | NEW |
| **BUG-CANDIDATE-5** | export encoding | UTF-8 **without BOM** while carrying non-ASCII (`≤`, 16 rows) → Excel-on-Windows mojibake. | NEW |
| **BUG-CANDIDATE-1 / 2** | export scope | Export ignores every grid control and always emits the full tenant. **Ruled INTENDED** — no Jira ticket defines filter-scoped export, NM-1446 documents the mechanism, and the dialog is titled "Import All Pricing Overrides". Tests assert it as correct. | classified, not filed |
| **NM-1940** | export content | Exactly one row with an empty `Override Price` (`1115,286,01D Double Screen Set Kit,0,USD,0.00,,,0`) which the app's own import rejects. Unchanged in 4 days. | EXISTING — re-confirmed |
| NM-2044 / NM-2045 | export header | Not reproduced in en-US. Headers DO localize for `fr-FR`/`es-MX`; see BUG-CANDIDATE-4. | not reproduced |
| NM-2206 | export content | Not reproduced — `Current Price` is non-empty and 2-decimal on all 8,996 rows. | not reproduced |

Full machine evidence for every row: `walk-evidence-corporate-pricing-override-export-2026-07-21.md`.

---

## Staleness signal

**Stale-after**: 2026-08-04 (14 days). Re-walk earlier if any of these change: the export endpoint
gains filter parameters; office 1604's grid starts returning 200; the CSV gains a BOM; the fr-FR
header is corrected; or the grid's `table-layout` changes (which would revive column resize).

---

## Coverage Manifest (machine-enumerated)

<!--
Coverage_Ratio: 70/70 (100%)
Walk_State: office=1604 module=corporate-pricing-override
CrossCheck: clean
-->

Machine denominator: **70** element(s) — raw 73, archetype-collapsed. union 70 / intersection 47 /
A△B review-set 23 / CDP-G1 hits 1 / cycles 2 / branches 0. Provenance JSON:
`reports/walk-coverage/1604-corporate-pricing-override.json`.

This reproduces the 2026-06-23 rewalk's denominator (70) **exactly**, on an independent run four
weeks later — an unforced parity confirmation of the enumerator.

Every A△B review-set element is classified below (all 23 fall into the app-shell `out-of-scope`
class, the disabled-global-search class, or the grid-`<th>` `read-only-verified` class), so
`CrossCheck` is **clean**.

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| `id:radix-_r_#_ [archetype×4]` | button | 2026-07-21 | out-of-scope: global Navigator app-shell chrome (left nav / global search list / assistant / user menu / sidebar restore) — owned by app-frame coverage, not the Product Group Override export surface |
| `struct:a|Home|div/div/div/div/ul/li` | a | 2026-07-21 | out-of-scope: global Navigator app-shell chrome (left nav / global search list / assistant / user menu / sidebar restore) — owned by app-frame coverage, not the Product Group Override export surface |
| `struct:a|Inbox|div/div/div/div/ul/li` | a | 2026-07-21 | out-of-scope: global Navigator app-shell chrome (left nav / global search list / assistant / user menu / sidebar restore) — owned by app-frame coverage, not the Product Group Override export surface |
| `id:radix-_r_a_` | button | 2026-07-21 | out-of-scope: global Navigator app-shell chrome (left nav / global search list / assistant / user menu / sidebar restore) — owned by app-frame coverage, not the Product Group Override export surface |
| `id:radix-_r_d_` | button | 2026-07-21 | out-of-scope: global Navigator app-shell chrome (left nav / global search list / assistant / user menu / sidebar restore) — owned by app-frame coverage, not the Product Group Override export surface |
| `id:radix-_r_g_` | button | 2026-07-21 | out-of-scope: global Navigator app-shell chrome (left nav / global search list / assistant / user menu / sidebar restore) — owned by app-frame coverage, not the Product Group Override export surface |
| `struct:button|Order Search|div/div/div/div/ul/li` _(A∖B review)_ _(disabled)_ | button | 2026-07-21 | out-of-scope: global Navigator app-shell chrome (left nav / global search list / assistant / user menu / sidebar restore) — owned by app-frame coverage, not the Product Group Override export surface |
| `struct:a|Job Search|div/div/div/div/ul/li` | a | 2026-07-21 | out-of-scope: global Navigator app-shell chrome (left nav / global search list / assistant / user menu / sidebar restore) — owned by app-frame coverage, not the Product Group Override export surface |
| `struct:a|Asset Search|div/div/div/div/ul/li` | a | 2026-07-21 | out-of-scope: global Navigator app-shell chrome (left nav / global search list / assistant / user menu / sidebar restore) — owned by app-frame coverage, not the Product Group Override export surface |
| `struct:a|Customer Search|div/div/div/div/ul/li` | a | 2026-07-21 | out-of-scope: global Navigator app-shell chrome (left nav / global search list / assistant / user menu / sidebar restore) — owned by app-frame coverage, not the Product Group Override export surface |
| `struct:button|DRO Search|div/div/div/div/ul/li` _(A∖B review)_ _(disabled)_ | button | 2026-07-21 | out-of-scope: global Navigator app-shell chrome (left nav / global search list / assistant / user menu / sidebar restore) — owned by app-frame coverage, not the Product Group Override export surface |
| `struct:button|Payment Search|div/div/div/div/ul/li` _(A∖B review)_ _(disabled)_ | button | 2026-07-21 | out-of-scope: global Navigator app-shell chrome (left nav / global search list / assistant / user menu / sidebar restore) — owned by app-frame coverage, not the Product Group Override export surface |
| `struct:a|Item Search|div/div/div/div/ul/li` | a | 2026-07-21 | out-of-scope: global Navigator app-shell chrome (left nav / global search list / assistant / user menu / sidebar restore) — owned by app-frame coverage, not the Product Group Override export surface |
| `struct:button|ECT Search|div/div/div/div/ul/li` _(A∖B review)_ _(disabled)_ | button | 2026-07-21 | out-of-scope: global Navigator app-shell chrome (left nav / global search list / assistant / user menu / sidebar restore) — owned by app-frame coverage, not the Product Group Override export surface |
| `struct:button|Event Agendas|div/div/div/div/ul/li` _(A∖B review)_ _(disabled)_ | button | 2026-07-21 | out-of-scope: global Navigator app-shell chrome (left nav / global search list / assistant / user menu / sidebar restore) — owned by app-frame coverage, not the Product Group Override export surface |
| `struct:button|Navigator Assistant|div/div/div/div/ul/li` | button | 2026-07-21 | out-of-scope: global Navigator app-shell chrome (left nav / global search list / assistant / user menu / sidebar restore) — owned by app-frame coverage, not the Product Group Override export surface |
| `id:radix-_r_t_` | button | 2026-07-21 | out-of-scope: global Navigator app-shell chrome (left nav / global search list / assistant / user menu / sidebar restore) — owned by app-frame coverage, not the Product Group Override export surface |
| `struct:button|Click to restore sidebar|body/div/div/div/div/div` | button | 2026-07-21 | out-of-scope: global Navigator app-shell chrome (left nav / global search list / assistant / user menu / sidebar restore) — owned by app-frame coverage, not the Product Group Override export surface |
| `struct:button|trigger-button|skip/div/div/div/div/div` | button | 2026-07-21 | out-of-scope: global Navigator app-shell chrome (left nav / global search list / assistant / user menu / sidebar restore) — owned by app-frame coverage, not the Product Group Override export surface |
| `struct:a|Corporate Pricing|div/div/div/div/div/div` | a | 2026-07-21 | out-of-scope: Settings side-nav link back to the Corporate Pricing landing page — module entry navigation, owned by the Corporate Pricing landing coverage rather than the export surface |
| `struct:button|More information|div/div/div/div/div/div` | button | 2026-07-21 | affordance-probed: popover → tooltip "This is the future product group override page" · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2e |
| `id:pg-active-only` | checkbox | 2026-07-21 | covered-by-TC: TC-CPR-OVR-042 (grid filter) + TC-CPR-OVR-070 (export ignores it — 53 inactive rows survive) |
| `id:pg-ref-currency` | combobox | 2026-07-21 | covered-by-TC: TC-CPR-OVR-043 (grid filter) + TC-CPR-OVR-071 (export ignores it — all 3 currencies survive) |
| `struct:button|Collapse search panel|div/div/div/div/div/div` | button | 2026-07-21 | affordance-probed: none — DEAD CONTROL (aria-label flips Collapse⇄Expand with zero layout change across 60 main descendants; BUG-CANDIDATE-6) · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2e |
| `struct:button|Save|div/div/div/div/div/div` _(A∖B review)_ _(disabled)_ | button | 2026-07-21 | covered-by-TC: TC-CPR-OVR-028 (Save dialog + Cancel); disabled in the resting export state, which is the correct state discipline Export does not follow (suggestion S3) |
| `struct:button|Export|div/div/div/div/div/div` | button | 2026-07-21 | covered-by-TC: TC-CPR-OVR-032, 038, 066-084 — the subject of this walk · behavior-cases: result-fidelity,empty-vol,render-state,persistence,pagination,sorting,combination |
| `struct:button|Import|div/div/div/div/div/div` | button | 2026-07-21 | out-of-scope: the Override import dialog is owned exclusively by NM-2273 per its plan line 23; entry-point-only coverage already exists as TC-CPR-OVR-033 |
| `struct:tablist|EquipmentLabor|div/div/div/div/div/div` _(B∖A review)_ | tablist | 2026-07-21 | covered-by-TC: TC-CPR-OVR-068 — the tablist container; both triggers dispositioned individually below |
| `id:radix-_r_18_-trigger-Equipment` | tab | 2026-07-21 | covered-by-TC: TC-CPR-OVR-068 (export ignores the tab) + TC-CPR-OVR-075 (Equipment row count reconciles with Is Labor=0) |
| `id:radix-_r_18_-trigger-Labor` | tab | 2026-07-21 | covered-by-TC: TC-CPR-OVR-068 — Labor tab export is byte-identical to Equipment (E2) |
| `struct:input|Filter Product Groups Override...|div/div/div/div/div/div` | input | 2026-07-21 | covered-by-TC: TC-CPR-OVR-045 (grid filter) + TC-CPR-OVR-072 (export ignores it — grid 9→1, file unchanged) |
| `id:radix-_r_18_-content-Equipment` | tabpanel | 2026-07-21 | covered-by-TC: TC-CPR-OVR-075 · behavior-cases: result-fidelity,pagination,sorting,combination,render-state,empty-vol,persistence — the grid archetype; every §3 family is dispositioned in the walk-evidence case ledger §5 |
| `struct:th|Location|div/div/div/table/thead/tr` _(A∖B review)_ | th | 2026-07-21 | read-only-verified — column header `Location`, no inline edit affordance; sort + hide live on its dropdown button, not the cell · behavior-cases: result-fidelity,render-state · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2 |
| `id:radix-_r_2d_` | button | 2026-07-21 | covered-by-TC: TC-CPR-OVR-046 (header dropdown → Sort ascending/descending) + TC-CPR-OVR-084 (export row order is independent of grid sort) |
| `struct:button|Resize column locationNo|div/div/table/thead/tr/th` | button | 2026-07-21 | affordance-probed: none — DEAD CONTROL (real-mouse drag rewrites inline width 190px→290px but rendered width stays 116px under table-layout:auto; BUG-CANDIDATE-7) · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2e |
| `struct:th|Product Group|div/div/div/table/thead/tr` _(A∖B review)_ | th | 2026-07-21 | read-only-verified — column header `Product Group`, no inline edit affordance; sort + hide live on its dropdown button, not the cell · behavior-cases: result-fidelity,render-state · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2 |
| `id:radix-_r_2f_` | button | 2026-07-21 | covered-by-TC: TC-CPR-OVR-046 (header dropdown → Sort ascending/descending) + TC-CPR-OVR-084 (export row order is independent of grid sort) |
| `struct:button|Resize column productGroupId|div/div/table/thead/tr/th` | button | 2026-07-21 | affordance-probed: none — DEAD CONTROL (real-mouse drag rewrites inline width 190px→290px but rendered width stays 116px under table-layout:auto; BUG-CANDIDATE-7) · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2e |
| `struct:th|Product Group Name|div/div/div/table/thead/tr` _(A∖B review)_ | th | 2026-07-21 | read-only-verified — column header `Product Group Name`, no inline edit affordance; sort + hide live on its dropdown button, not the cell · behavior-cases: result-fidelity,render-state · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2 |
| `id:radix-_r_2h_` | button | 2026-07-21 | covered-by-TC: TC-CPR-OVR-046 (header dropdown → Sort ascending/descending) + TC-CPR-OVR-084 (export row order is independent of grid sort) |
| `struct:button|Resize column productGroupName|div/div/table/thead/tr/th` | button | 2026-07-21 | affordance-probed: none — DEAD CONTROL (real-mouse drag rewrites inline width 190px→290px but rendered width stays 116px under table-layout:auto; BUG-CANDIDATE-7) · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2e |
| `struct:th|Currency|div/div/div/table/thead/tr` _(A∖B review)_ | th | 2026-07-21 | read-only-verified — column header `Currency`, no inline edit affordance; sort + hide live on its dropdown button, not the cell · behavior-cases: result-fidelity,render-state · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2 |
| `id:radix-_r_2j_` | button | 2026-07-21 | covered-by-TC: TC-CPR-OVR-046 (header dropdown → Sort ascending/descending) + TC-CPR-OVR-084 (export row order is independent of grid sort) |
| `struct:button|Resize column currencyId|div/div/table/thead/tr/th` | button | 2026-07-21 | affordance-probed: none — DEAD CONTROL (real-mouse drag rewrites inline width 190px→290px but rendered width stays 116px under table-layout:auto; BUG-CANDIDATE-7) · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2e |
| `struct:th|Current Price|div/div/div/table/thead/tr` _(A∖B review)_ | th | 2026-07-21 | read-only-verified — column header `Current Price`, no inline edit affordance; sort + hide live on its dropdown button, not the cell · behavior-cases: result-fidelity,render-state · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2 |
| `id:radix-_r_2l_` | button | 2026-07-21 | covered-by-TC: TC-CPR-OVR-046 (header dropdown → Sort ascending/descending) + TC-CPR-OVR-084 (export row order is independent of grid sort) |
| `struct:button|Resize column currentPrice|div/div/table/thead/tr/th` | button | 2026-07-21 | affordance-probed: none — DEAD CONTROL (real-mouse drag rewrites inline width 190px→290px but rendered width stays 116px under table-layout:auto; BUG-CANDIDATE-7) · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2e |
| `struct:th|Override Price|div/div/div/table/thead/tr` _(A∖B review)_ | th | 2026-07-21 | read-only-verified — column header `Override Price`, no inline edit affordance; sort + hide live on its dropdown button, not the cell · behavior-cases: result-fidelity,render-state · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2 |
| `id:radix-_r_2n_` | button | 2026-07-21 | covered-by-TC: TC-CPR-OVR-046 (header dropdown → Sort ascending/descending) + TC-CPR-OVR-084 (export row order is independent of grid sort) |
| `struct:button|Resize column price|div/div/table/thead/tr/th` | button | 2026-07-21 | affordance-probed: none — DEAD CONTROL (real-mouse drag rewrites inline width 190px→290px but rendered width stays 116px under table-layout:auto; BUG-CANDIDATE-7) · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2e |
| `struct:th|Max Discount %|div/div/div/table/thead/tr` _(A∖B review)_ | th | 2026-07-21 | read-only-verified — column header `Max Discount %`, no inline edit affordance; sort + hide live on its dropdown button, not the cell · behavior-cases: result-fidelity,render-state · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2 |
| `id:radix-_r_2p_` | button | 2026-07-21 | covered-by-TC: TC-CPR-OVR-046 (header dropdown → Sort ascending/descending) + TC-CPR-OVR-084 (export row order is independent of grid sort) |
| `struct:button|Resize column maxAllowedDiscount|div/div/table/thead/tr/th` | button | 2026-07-21 | affordance-probed: none — DEAD CONTROL (real-mouse drag rewrites inline width 190px→290px but rendered width stays 116px under table-layout:auto; BUG-CANDIDATE-7) · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2e |
| `struct:th|Active|div/div/div/table/thead/tr` _(A∖B review)_ | th | 2026-07-21 | read-only-verified — column header `Active`, no inline edit affordance; sort + hide live on its dropdown button, not the cell · behavior-cases: result-fidelity,render-state · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2 |
| `id:radix-_r_2r_` | button | 2026-07-21 | covered-by-TC: TC-CPR-OVR-046 (header dropdown → Sort ascending/descending) + TC-CPR-OVR-084 (export row order is independent of grid sort) |
| `struct:button|Resize column active|div/div/table/thead/tr/th` | button | 2026-07-21 | affordance-probed: none — DEAD CONTROL (real-mouse drag rewrites inline width 190px→290px but rendered width stays 116px under table-layout:auto; BUG-CANDIDATE-7) · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2e |
| `struct:th|Mod Date|div/div/div/table/thead/tr` _(A∖B review)_ | th | 2026-07-21 | read-only-verified — column header `Mod Date`, no inline edit affordance; sort + hide live on its dropdown button, not the cell · behavior-cases: result-fidelity,render-state · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2 |
| `id:radix-_r_2t_` | button | 2026-07-21 | covered-by-TC: TC-CPR-OVR-046 (header dropdown → Sort ascending/descending) + TC-CPR-OVR-084 (export row order is independent of grid sort) |
| `struct:button|Resize column updatedAt|div/div/table/thead/tr/th` | button | 2026-07-21 | affordance-probed: none — DEAD CONTROL (real-mouse drag rewrites inline width 190px→290px but rendered width stays 116px under table-layout:auto; BUG-CANDIDATE-7) · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2e |
| `struct:th|Updated By|div/div/div/table/thead/tr` _(A∖B review)_ | th | 2026-07-21 | read-only-verified — column header `Updated By`, no inline edit affordance; sort + hide live on its dropdown button, not the cell · behavior-cases: result-fidelity,render-state · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2 |
| `id:radix-_r_2v_` | button | 2026-07-21 | covered-by-TC: TC-CPR-OVR-046 (header dropdown → Sort ascending/descending) + TC-CPR-OVR-084 (export row order is independent of grid sort) |
| `struct:button|Resize column updatedBy|div/div/table/thead/tr/th` | button | 2026-07-21 | affordance-probed: none — DEAD CONTROL (real-mouse drag rewrites inline width 190px→290px but rendered width stays 116px under table-layout:auto; BUG-CANDIDATE-7) · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2e |
| `struct:combobox|20|div/div/div/div/div/div` | combobox | 2026-07-21 | covered-by-TC: TC-CPR-OVR-073 — options 10/20/30/40/50 enumerated live; rendered rows 10→50 on office 1974 while the export stayed byte-identical |
| `struct:button|Go to first page|div/div/div/div/div/div` _(A∖B review)_ _(disabled)_ | button | 2026-07-21 | covered-by-TC: TC-CPR-OVR-085 — click on page 4 returns to page 1; disabled on page 1 · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2e |
| `struct:button|Go to previous page|div/div/div/div/div/div` _(A∖B review)_ _(disabled)_ | button | 2026-07-21 | covered-by-TC: TC-CPR-OVR-085 — page 2→1; disabled on page 1 · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2e |
| `struct:input|Current page number|div/div/div/div/div/span` | input | 2026-07-21 | covered-by-TC: TC-CPR-OVR-085 — fill "2" + Enter jumps to page 2 with 50 rows rendered · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2e |
| `struct:button|Go to next page|div/div/div/div/div/div` _(A∖B review)_ _(disabled)_ | button | 2026-07-21 | covered-by-TC: TC-CPR-OVR-085 — page 1→2, first row changes; disabled on the last page · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2e |
| `struct:button|Go to last page|div/div/div/div/div/div` _(A∖B review)_ _(disabled)_ | button | 2026-07-21 | covered-by-TC: TC-CPR-OVR-085 — jumps to page 4 of 4 with the 11-row remainder (161 = 3×50 + 11) · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2e |
| `struct:section|Notifications alt+T|html/body` _(A∖B review)_ | section | 2026-07-21 | out-of-scope: global Radix toast viewport present on every Navigator page — carries no Override-surface control of its own |
| `struct:div|Change Local OfficeSelect a location|div/div/div/div/div/div` _(A∖B review)_ | div | 2026-07-21 | covered-by-TC: TC-CPR-OVR-030, 039, 040 (picker behavior) + TC-CPR-OVR-069 (export ignores the selected office) · affordance-probed: launcher → "Change Local Office" · provenance: live · evidence: clients/encore/specs_planning/_internal/walk-evidence-corporate-pricing-override-export-2026-07-21.md §2 |

---

## Handoff

Consumed by **SUBPLAN_CORP_PRICING_NM2272_OVERRIDE_EXPORT**. The walk produced 20 new test cases
(`TC-CPR-OVR-066` … `TC-CPR-OVR-085`) covering the full export scope-dimension matrix, CSV structural
and numeric fidelity, the locale axis, the grid-endpoint health guard for BUG-CANDIDATE-3, and the
pagination family. Import-side round-trip stays with **NM-2273**.
