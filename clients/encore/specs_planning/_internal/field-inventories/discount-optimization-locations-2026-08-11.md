**Module**: discount-optimization-locations
**Client**: encore
**MCP_Session_Date**: 2026-08-11
**MCP_Session_Tool**: Playwright CLI / script family
**MCP_Tool_Reason**: Unattended multi-surface catalog walk of a 2154-row grid plus a second tab; token-efficient grep-over-disk on machine-emitted manifests. No visual or CSS work required.
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/discount-optimization-settings
**Test_Entity**: Office 1604 (Parker Palm Springs)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/discount-optimization-2026-08-10.md
**Coverage_Ratio**: 108/108 (100%)
**Walk_State**: office=1604 module=discount-optimization-locations walked=[resting]
**CrossCheck**: clean
**Completion_Record**: reports/walk-coverage/dop-tab1.json (status=complete, elements=148)

---

# Field Inventory — Setup → Discount Optimization Settings (Locations tab)

> **Column re-labelling, 2026-08-12** — after this artifact was recorded, the application re-labelled two
> grid columns: *No Implied Discount* → **Allow Special Rate**, and *No Implied Start* → **Special Rate
> Start Date**. This is a display-label change only; the underlying field and its Yes/No values are
> unchanged. The observations below are preserved verbatim as recorded on their date and deliberately keep
> the original column names.
>
> **Re-verified 2026-08-18** — the live e2e grid still renders these two columns as **Allow Special Rate**
> and **Special Rate Start Date**; the 2026-08-12 re-labelling above is still current and no further drift
> has occurred. Evidence: `TC-DOP-OPT-002` in
> `clients/encore/tests/discount-optimization/discount-optimization-locations.spec.ts` asserts this exact
> four-header set and passes. Corroborated by a live enumeration on the same date, which emitted the header
> keys `struct:th|Allow Special Rate|...` and `struct:th|Special Rate Start Date|...`, and by the app's
> own internal field names `allowSpecialRate` / `startAllowSpecialRate`, which never changed. The
> observation rows below remain deliberately preserved under their original column names, per the note above.

This file covers **Tab 1 — Discount Optimization (the Locations grid)**. The companion file
`discount-optimization-exemption-2026-08-11.md` covers Tab 2 — Special Rate Exemptions by Service Type.
Both tabs share one route; switching tabs does not change the URL.

---

## URL(s) visited

- `/navigator/locations/1604/settings/discount-optimization-settings` — hosts both tabs. Switching tabs
  does not change the URL, so both surfaces share one route.

Enumeration runs: `reports/walk-coverage/dop-tab1.json` and `dop-tab2.json` (148 elements each — the
enumerator self-expands across both tabs, so either file carries the union).

---

## Live-state caveat

**This surface takes roughly 22 seconds to paint its grid.** The list API
`GET /navigator/api/discount/optimization?skipPagination=true` returns HTTP 200 with 2154 rows
immediately on load, but the UI shows `0 locations found` behind skeleton placeholders until it renders.

Three separate probe runs produced false readings by sampling inside that window — they reported an
empty grid, a read-only surface, and zero sortable headers. All three were wrong. **Automation against
this page must wait on a content condition** (the row count becoming non-zero), never on a fixed
timeout and never on `networkidle`.

An earlier enumeration run sampled the same window and produced a 30-element denominator that contained
no grid columns at all. It was discarded rather than accepted — a 100% ratio over that shell would have
been a false green.

---

## Field Inventory

Denominator: **108** elements assigned to this file (21 shared page-level elements + 87 Locations-tab-specific elements). Source denominator across both tabs: 148.

**Disposition honesty note**: rows marked `covered-by-TC` name the case IDs that Phase 7 will author.
Those cases **do not exist yet** — this inventory is the authoring contract, and it is not closed until
each cited ID resolves to a real case. No row claims `affordance-probed` or `read-only-verified`,
because per-row live-probe evidence was not captured for every element, and using an
observation-claiming disposition without that evidence would be a fabrication.

| element-key | role | disposition |
|---|---|---|
| `id:radix-_r_#_ [archetype×7]` | button | out-of-scope: presentational container carrying no independent user-facing behaviour |
| `struct:a|Home|div/div/div/div/ul/li` | a | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |
| `struct:a|Inbox|div/div/div/div/ul/li` | a | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |
| `id:radix-_r_a_` | button | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |
| `id:radix-_r_d_` | button | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |
| `id:radix-_r_g_` | button | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |
| `struct:button|Order Search|div/div/div/div/ul/li` | button | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |
| `struct:a|Job Search|div/div/div/div/ul/li` | a | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |
| `struct:a|Asset Search|div/div/div/div/ul/li` | a | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |
| `struct:a|Customer Search|div/div/div/div/ul/li` | a | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |
| `struct:button|DRO Search|div/div/div/div/ul/li` | button | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |
| `struct:button|Payment Search|div/div/div/div/ul/li` | button | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |
| `struct:a|Item Search|div/div/div/div/ul/li` | a | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |
| `struct:button|ECT Search|div/div/div/div/ul/li` | button | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |
| `struct:button|Event Agendas|div/div/div/div/ul/li` | button | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |
| `struct:button|Navigator Assistant|div/div/div/div/ul/li` | button | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |
| `id:radix-_r_t_` | button | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |
| `struct:button|Click to restore sidebar|body/div/div/div/div/div` | button | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |
| `struct:button|trigger-button|skip/div/div/div/div/div` | button | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |
| `struct:tablist|Discount OptimizationSpecial Rate Exempt|div/div/div/div/div/div` | tablist | covered-by-TC: TC-DOP-OPT-001 |
| `id:radix-_r_v_-trigger-locations` | tab | covered-by-TC: TC-DOP-OPT-001 |
| `id:radix-_r_v_-content-locations` | tabpanel | covered-by-TC: TC-DOP-OPT-001 |
| `testid:discount-optimization-settings-table-container` | div | covered-by-TC: TC-DOP-OPT-002 + behavior-cases: result-fidelity, sorting, render-state, empty-vol, persistence |
| `struct:input|Search by location number or location na|div/div/discount-optimization-settings-table-container/d` | input | covered-by-TC: TC-DOP-OPT-005 |
| `struct:button|Save|radix-_r_v_-content-locations/div/div/discount-optimization-settings-table-container/div/di` | button | covered-by-TC: TC-DOP-OPT-050 |
| `struct:button|Add|radix-_r_v_-content-locations/div/div/discount-optimization-settings-table-container/div/div` | button | covered-by-TC: TC-DOP-OPT-060 |
| `struct:th||div/div/div/table/thead/tr` | th | covered-by-TC: TC-DOP-OPT-002 |
| `struct:th|ID|div/div/div/table/thead/tr` | th | covered-by-TC: TC-DOP-OPT-002 |
| `struct:button|Resize column locationNo|div/div/table/thead/tr/th` | button | covered-by-TC: TC-DOP-OPT-010 |
| `struct:th|Location Name|div/div/div/table/thead/tr` | th | covered-by-TC: TC-DOP-OPT-002 |
| `struct:button|Resize column locationName|div/div/table/thead/tr/th` | button | covered-by-TC: TC-DOP-OPT-010 |
| `struct:th|No Implied Discount|div/div/div/table/thead/tr` | th | covered-by-TC: TC-DOP-OPT-002 |
| `struct:button|Resize column allowSpecialRate|div/div/table/thead/tr/th` | button | covered-by-TC: TC-DOP-OPT-010 |
| `struct:th|No Implied Start|div/div/div/table/thead/tr` | th | covered-by-TC: TC-DOP-OPT-002 |
| `struct:button|Resize column startAllowSpecialRate|div/div/table/thead/tr/th` | button | covered-by-TC: TC-DOP-OPT-010 |
| `struct:button|Remove The Abbey Resort|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for The Abbey Resort|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:input|Select date|tr/td/div/div/div/div` | input | covered-by-TC: TC-DOP-OPT-040 |
| `struct:button|Open calendar|td/div/div/div/div/div` | button | covered-by-TC: TC-DOP-OPT-040 |
| `struct:button|Remove InterContinental Chicago|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for InterContinental|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove The Dagny|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for The Dagny|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Boston Marriott Copley Place|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for Boston Marriott |div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Hotel del Coronado|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for Hotel del Corona|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Hitlon Arlington National Landing|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for Hitlon Arlington|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Sheraton Stamford Hotel deactivat|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for Sheraton Stamfor|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Renaissance Baton Rouge Hotel|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for Renaissance Bato|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Hilton Dallas/Park Cities|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for Hilton Dallas/Pa|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove The St. Regis Bal Harbour Resort|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for The St. Regis Ba|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Sheraton Pentagon City Hotel|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for Sheraton Pentago|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove The Westin New York Grand Central|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for The Westin New Y|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove The Westin Kansas City at Crown C|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for The Westin Kansa|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Sheraton Kansas City Hotel at Cro|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for Sheraton Kansas |div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Fairmont Olympic Hotel, Seattle|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for Fairmont Olympic|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove The Kahala Hotel & Resort|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for The Kahala Hotel|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Hyatt Regency Valencia|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for Hyatt Regency Va|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Hilton Columbus Downtown|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for Hilton Columbus |div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Seaview, A Dolce Hotel|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for Seaview, A Dolce|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove The Westin St. Francis on Union S|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for The Westin St. F|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Viewline Snowmass|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for Viewline Snowmas|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Salt Palace Convention Center|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for Salt Palace Conv|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove The Westin Bonaventure Hotel & Su|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for The Westin Bonav|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove DoubleTree by Hilton Hotel Philad|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for DoubleTree by Hi|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove The Bellevue Hotel|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for The Bellevue Hot|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove The Westin Cincinnati Fountain Sq|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for The Westin Cinci|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove InterContinental Los Angeles Cent|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|Remove The Maxwell NYC Hotel - Deactivat|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for The Maxwell NYC |div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Hilton DFW Lakes Executive Confer|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for Hilton DFW Lakes|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Hilton Anatole|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for Hilton Anatole|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Hyatt Regency Coconut Point Resor|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for Hyatt Regency Co|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Condado Vanderbilt Hotel|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for Condado Vanderbi|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Ocean Place Resort & Spa- DEACTIV|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for Ocean Place Reso|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Hyatt Regency Columbus|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|Remove The Sheraton Columbus onCapitol S|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for The Sheraton Col|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:button|Remove Hyatt Regency Princeton|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-020 |
| `struct:button|No implied discount for Hyatt Regency Pr|div/table/tbody/tr/td/div` | button | covered-by-TC: TC-DOP-OPT-030 |
| `struct:section|Notifications alt+T|html/body` | section | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |

---

## Labels + Section Names

Tab labels, verbatim: `Discount Optimization`, `Special Rate Exemptions by Service Type`.

Tab 1 columns: `ID`, `Location Name`, `No Implied Discount`, `No Implied Start`.
The app's own field names, exposed through the per-column resize controls:
`locationNo`, `locationName`, `allowSpecialRate`, `startAllowSpecialRate`.

Per-row controls are named after the location, e.g. `Remove The Abbey Resort` and
`No implied discount for The Abbey Resort`. The date cell exposes `Select date` and `Open calendar`.

Search placeholder: `Search by location number or location name`.

---

## Save-cycle observations

- Save is disabled on arrival (pristine form) **and** while a value is invalid; it enables on a valid
  change. A greyed Save on this surface therefore means pristine-or-invalid, never "no permission".
- An invalid date renders a red border plus an error icon on the cell and holds Save disabled.
- A valid date change (`08/08/2019` to `09/09/2019`) was accepted and enabled Save.
- **No save was ever committed during this walk** — every dirty state was discarded.

---

## Observations

### Bugs / Defects

`none` — no behaviour defect is confirmed.

Three candidate findings were investigated and all three dissolved under measurement: the "empty grid"
was a slow render, the "read-only account" was an invalid input holding Save disabled, and "no sorting"
was a selector miss against 8 real sortable headers. Filing any of them would have been a false report
against the client.

### Suggestions / Improvements

- The ~22-second first paint on a 2154-row grid is worth raising as a performance discussion item.
- The two tabs carry **no stable test IDs** — the enumerator fell back to auto-generated `radix-*` ids
  that change between renders, so automation must use accessible role plus visible text. Recorded as a
  test-ID gap to raise with the dev team.

---

## Surface behaviour families (grid axis)

Tab 1 is a 2154-row grid, so it carries surface behaviours that live between elements, not on any single
control. Families applied and why:

| Family | Disposition |
|---|---|
| result-fidelity | `covered-by-TC: TC-DOP-OPT-002` — the grid must render the row set the list API returned (2154). |
| sorting | `covered-by-TC: TC-DOP-OPT-010` — 8 sortable headers exist; each must reorder rows, not merely be present. |
| render-state | `covered-by-TC: TC-DOP-OPT-002` — the skeleton-to-data transition is the defining behaviour of this surface. |
| empty-vol | `covered-by-TC: TC-DOP-OPT-005` — search-to-no-match is the reachable empty state; 2154 rows is the volume case. |
| persistence | `covered-by-TC: TC-DOP-OPT-050` — a saved change must survive reload. |
| pagination | `out-of-scope: pagination=this grid renders all 2154 rows at once with no pager on either the current or the legacy site` |
| combination | `out-of-scope: combination=only one filter control exists (search), so there is no second dimension to combine it with` |

---

## Staleness signal

Re-walk if any of these change: the tab set, the tab-1 column set, the ~22-second load characteristic,
or the tab-2 service-type list (changes there may affect shared chrome). Otherwise this artifact is good
for 14 days from 2026-08-11.

---

## Coverage Manifest

Machine-derived keys cross-referenced against field inventory dispositions. Source: reports/walk-coverage/dop-tab1.json (148 entries). Rows for the Locations tab are listed here; Tab 2 rows are in the companion file.

| element-key | disposition |
|---|---|
| `id:radix-_r_#_ [archetype×7]` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:a\|Home\|div/div/div/div/ul/li` | `out-of-scope: outside-module global application shell, not owned by Discount Optimization surface` |
| `struct:a\|Inbox\|div/div/div/div/ul/li` | `out-of-scope: outside-module global application shell, not owned by Discount Optimization surface` |
| `id:radix-_r_a_` | `out-of-scope: outside-module global application shell, not owned by Discount Optimization surface` |
| `id:radix-_r_d_` | `out-of-scope: outside-module global application shell, not owned by Discount Optimization surface` |
| `id:radix-_r_g_` | `out-of-scope: outside-module global application shell, not owned by Discount Optimization surface` |
| `struct:button\|Order Search\|div/div/div/div/ul/li` | `out-of-scope: outside-module global application shell, not owned by Discount Optimization surface` |
| `struct:a\|Job Search\|div/div/div/div/ul/li` | `out-of-scope: outside-module global application shell, not owned by Discount Optimization surface` |
| `struct:a\|Asset Search\|div/div/div/div/ul/li` | `out-of-scope: outside-module global application shell, not owned by Discount Optimization surface` |
| `struct:a\|Customer Search\|div/div/div/div/ul/li` | `out-of-scope: outside-module global application shell, not owned by Discount Optimization surface` |
| `struct:button\|DRO Search\|div/div/div/div/ul/li` | `out-of-scope: outside-module global application shell, not owned by Discount Optimization surface` |
| `struct:button\|Payment Search\|div/div/div/div/ul/li` | `out-of-scope: outside-module global application shell, not owned by Discount Optimization surface` |
| `struct:a\|Item Search\|div/div/div/div/ul/li` | `out-of-scope: outside-module global application shell, not owned by Discount Optimization surface` |
| `struct:button\|ECT Search\|div/div/div/div/ul/li` | `out-of-scope: outside-module global application shell, not owned by Discount Optimization surface` |
| `struct:button\|Event Agendas\|div/div/div/div/ul/li` | `out-of-scope: outside-module global application shell, not owned by Discount Optimization surface` |
| `struct:button\|Navigator Assistant\|div/div/div/div/ul/li` | `out-of-scope: outside-module global application shell, not owned by Discount Optimization surface` |
| `id:radix-_r_t_` | `out-of-scope: outside-module global application shell, not owned by Discount Optimization surface` |
| `struct:button\|Click to restore sidebar\|body/div/div/div/div/div` | `out-of-scope: outside-module global application shell, not owned by Discount Optimization surface` |
| `struct:button\|trigger-button\|skip/div/div/div/div/div` | `out-of-scope: outside-module global application shell, not owned by Discount Optimization surface` |
| `struct:tablist\|Discount OptimizationSpecial Rate Exempt\|div/div/div/div/div/div` | `covered-by-TC: TC-DOP-OPT-001` |
| `id:radix-_r_v_-trigger-locations` | `covered-by-TC: TC-DOP-OPT-001` |
| `id:radix-_r_v_-content-locations` | `covered-by-TC: TC-DOP-OPT-001` |
| `testid:discount-optimization-settings-table-container` | `covered-by-TC: TC-DOP-OPT-002` |
| `struct:input\|Search by location number or location na\|div/div/discount-optimization-settings-table-container/div/div/div` | `covered-by-TC: TC-DOP-OPT-005` |
| `struct:button\|Save\|radix-_r_v_-content-locations/div/div/discount-optimization-settings-table-container/div/div` | `covered-by-TC: TC-DOP-OPT-050` |
| `struct:button\|Add\|radix-_r_v_-content-locations/div/div/discount-optimization-settings-table-container/div/div` | `covered-by-TC: TC-DOP-OPT-060` |
| `struct:th\|\|div/div/div/table/thead/tr` | `covered-by-TC: TC-DOP-OPT-002` |
| `struct:th\|ID\|div/div/div/table/thead/tr` | `covered-by-TC: TC-DOP-OPT-002` |
| `struct:button\|Resize column locationNo\|div/div/table/thead/tr/th` | `covered-by-TC: TC-DOP-OPT-010` |
| `struct:th\|Location Name\|div/div/div/table/thead/tr` | `covered-by-TC: TC-DOP-OPT-002` |
| `struct:button\|Resize column locationName\|div/div/table/thead/tr/th` | `covered-by-TC: TC-DOP-OPT-010` |
| `struct:th\|No Implied Discount\|div/div/div/table/thead/tr` | `covered-by-TC: TC-DOP-OPT-002` |
| `struct:button\|Resize column allowSpecialRate\|div/div/table/thead/tr/th` | `covered-by-TC: TC-DOP-OPT-010` |
| `struct:th\|No Implied Start\|div/div/div/table/thead/tr` | `covered-by-TC: TC-DOP-OPT-002` |
| `struct:button\|Resize column startAllowSpecialRate\|div/div/table/thead/tr/th` | `covered-by-TC: TC-DOP-OPT-010` |
| `struct:button\|Remove The Abbey Resort\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for The Abbey Resort\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:input\|Select date\|tr/td/div/div/div/div` | `covered-by-TC: TC-DOP-OPT-040` |
| `struct:button\|Open calendar\|td/div/div/div/div/div` | `covered-by-TC: TC-DOP-OPT-040` |
| `struct:button\|Remove InterContinental Chicago\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for InterContinental\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove The Dagny\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for The Dagny\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Boston Marriott Copley Place\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for Boston Marriott \|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Hotel del Coronado\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for Hotel del Corona\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Hitlon Arlington National Landing\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for Hitlon Arlington\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Sheraton Stamford Hotel deactivat\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for Sheraton Stamfor\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Renaissance Baton Rouge Hotel\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for Renaissance Bato\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Hilton Dallas/Park Cities\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for Hilton Dallas/Pa\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove The St. Regis Bal Harbour Resort\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for The St. Regis Ba\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Sheraton Pentagon City Hotel\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for Sheraton Pentago\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove The Westin New York Grand Central\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for The Westin New Y\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove The Westin Kansas City at Crown C\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for The Westin Kansa\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Sheraton Kansas City Hotel at Cro\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for Sheraton Kansas \|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Fairmont Olympic Hotel, Seattle\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for Fairmont Olympic\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove The Kahala Hotel & Resort\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for The Kahala Hotel\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Hyatt Regency Valencia\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for Hyatt Regency Va\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Hilton Columbus Downtown\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for Hilton Columbus \|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Seaview, A Dolce Hotel\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for Seaview, A Dolce\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove The Westin St. Francis on Union S\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for The Westin St. F\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Viewline Snowmass\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for Viewline Snowmas\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Salt Palace Convention Center\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for Salt Palace Conv\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove The Westin Bonaventure Hotel & Su\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for The Westin Bonav\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove DoubleTree by Hilton Hotel Philad\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for DoubleTree by Hi\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove The Bellevue Hotel\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for The Bellevue Hot\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove The Westin Cincinnati Fountain Sq\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for The Westin Cinci\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove InterContinental Los Angeles Cent\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|Remove The Maxwell NYC Hotel - Deactivat\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for The Maxwell NYC \|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Hilton DFW Lakes Executive Confer\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for Hilton DFW Lakes\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Hilton Anatole\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for Hilton Anatole\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Hyatt Regency Coconut Point Resor\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for Hyatt Regency Co\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Condado Vanderbilt Hotel\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for Condado Vanderbi\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Ocean Place Resort & Spa- DEACTIV\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for Ocean Place Reso\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Hyatt Regency Columbus\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|Remove The Sheraton Columbus onCapitol S\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for The Sheraton Col\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:button\|Remove Hyatt Regency Princeton\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-020` |
| `struct:button\|No implied discount for Hyatt Regency Pr\|div/table/tbody/tr/td/div` | `covered-by-TC: TC-DOP-OPT-030` |
| `struct:section\|Notifications alt+T\|html/body` | `out-of-scope: outside-module notification chrome, not owned by Discount Optimization surface` |
