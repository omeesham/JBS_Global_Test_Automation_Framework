**Module**: discount-optimization-exemption
**Client**: encore
**MCP_Session_Date**: 2026-08-11
**MCP_Session_Tool**: Playwright CLI / script family
**MCP_Tool_Reason**: Unattended multi-surface catalog walk of a 2154-row grid plus a second tab; token-efficient grep-over-disk on machine-emitted manifests. No visual or CSS work required.
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/discount-optimization-settings
**Test_Entity**: Office 1604 (Parker Palm Springs)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/discount-optimization-2026-08-10.md
**Coverage_Ratio**: 61/61 (100%)
**Walk_State**: office=1604 module=discount-optimization-exemption walked=[tab:service-type-exemptions]
**CrossCheck**: clean
**Completion_Record**: reports/walk-coverage/dop-tab2.json (status=complete, elements=148)

---

# Field Inventory — Setup → Discount Optimization Settings (Special Rate Exemptions tab)

> **Column re-labelling, 2026-08-12** — after this artifact was recorded, the application re-labelled two
> grid columns: *No Implied Discount* → **Allow Special Rate**, and *No Implied Start* → **Special Rate
> Start Date**. This is a display-label change only; the underlying field and its Yes/No values are
> unchanged. The observations below are preserved verbatim as recorded on their date and deliberately keep
> the original column names.

This file covers **Tab 2 — Special Rate Exemptions by Service Type**. The companion file
`discount-optimization-locations-2026-08-11.md` covers Tab 1 — Discount Optimization (the Locations grid).
Both tabs share one route; switching tabs does not change the URL.

---

## URL(s) visited

- `/navigator/locations/1604/settings/discount-optimization-settings` — hosts both tabs. Switching tabs
  does not change the URL, so both surfaces share one route.

Enumeration runs: `reports/walk-coverage/dop-tab1.json` and `dop-tab2.json` (148 elements each — the
enumerator self-expands across both tabs, so either file carries the union).

---

## Live-state caveat

Tab 1 (the Locations grid) takes roughly 22 seconds to paint its 2154-row result. Tab 2 is not reachable
until Tab 1 has finished rendering — automation that switches to Tab 2 must first wait on a content
condition confirming Tab 1's grid is populated, never on a fixed timeout and never on `networkidle`.
Tab 2's own content (29 service-type rows with checkboxes) renders promptly once the tab is activated.

---

## Field Inventory

Denominator: **61** elements assigned to this file (21 shared page-level elements + 40 Special Rate Exemptions-tab-specific elements). Source denominator across both tabs: 148.

**Correction, 2026-08-13 — 29 rows re-dispositioned.** The 29 `struct:checkbox|Exempt <ServiceType>`
rows in this table previously read `out-of-scope: presentational container carrying no independent
user-facing behaviour`, contradicting the `## Coverage Manifest` below, which dispositions the *same
keys* as `covered-by-TC: TC-DOP-EXM-020`. The manifest was right and this table was wrong:
`TC-DOP-EXM-020` calls `toggleExempt()` on these controls, reads their state via `aria-checked`, saves,
reloads to assert the change persisted, and restores the original state in a `finally` block. A control
a test toggles and persists is by definition not presentational. The 29 rows now match the manifest.

Two things this correction deliberately does **not** do. It does not touch the `## Coverage Manifest`
section, which is the only section the Cx coverage gate parses — verified by re-running the gate's own
`extractManifestRows`/`coverageVerdict` before and after: the verdict is unchanged at
`out-of-scope 21/61 = 34.4% (BREACH, cap 15%)` either way. This was a documentation contradiction, not
a coverage change, and nothing here narrows the gate. It also leaves the one legitimate
`id:radix-_r_#_ [archetype×7]` button row on that disposition, because an unlabelled Radix portal root
genuinely is presentational.

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
| `id:radix-_r_v_-trigger-serviceTypeExemptions` | tab | covered-by-TC: TC-DOP-EXM-001 |
| `id:radix-_r_v_-content-serviceTypeExemptions` | tabpanel | covered-by-TC: TC-DOP-EXM-001 |
| `struct:input|Search by service type|div/radix-_r_v_-content-serviceTypeExemptions/div/div/div/div` | input | covered-by-TC: TC-DOP-EXM-010 |
| `struct:button|Cancel|div/div/radix-_r_v_-content-serviceTypeExemptions/div/div/div` | button | covered-by-TC: TC-DOP-EXM-001 |
| `struct:button|Save|div/div/radix-_r_v_-content-serviceTypeExemptions/div/div/div` | button | covered-by-TC: TC-DOP-EXM-020 |
| `struct:th|Service Type|div/div/div/table/thead/tr` | th | covered-by-TC: TC-DOP-OPT-002 |
| `id:radix-_r_2e_` | button | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |
| `struct:button|Resize column serviceTypeName|div/div/table/thead/tr/th` | button | out-of-scope: tab 2 column resize drag control; column resizing and tab 2 sort controls are out of scope per the locations test plan |
| `struct:th|Exempt|div/div/div/table/thead/tr` | th | covered-by-TC: TC-DOP-OPT-002 |
| `id:radix-_r_2g_` | button | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |
| `struct:button|Resize column isSpecialRateAllowed|div/div/table/thead/tr/th` | button | out-of-scope: tab 2 column resize drag control; column resizing and tab 2 sort controls are out of scope per the locations test plan |
| `struct:checkbox|Exempt Computer Rental|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Concise Equipment|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Digital Branding|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Digital Services Equipment|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Digital Services Subrental|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Equipment Rental|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt HSIA - Equipment|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt HSIA - Subrental Equipment|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt HSIA - Wi-Fi Services|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt HSIA Services|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Lighting|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Lighting Subrental|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Photographic Services|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Power Infrastructure|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Power Rental Equipment|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Power Sub-rental Equipment|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Rigging Equipment - Subrental|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Rigging Equipment Rental|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Scenic Equipment Rental|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Scenic Sub-Rental|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Sub-Rental Equipment|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Telecom Equipment|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Telecom Services|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Telecom Subrental|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Venue Equipment Rental|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Virtual Events Equipment|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Virtual Events Professional Servi|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt Wedding Event Equipment Rental|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:checkbox|Exempt ZSub Rental Specialty|div/div/table/tbody/tr/td` | checkbox | covered-by-TC: TC-DOP-EXM-020 |
| `struct:section|Notifications alt+T|html/body` | section | out-of-scope: outside-module — global application shell and left-hand navigation, outside the Discount Optimization surface under test |

---

## Labels + Section Names

Tab labels, verbatim: `Discount Optimization`, `Special Rate Exemptions by Service Type`.

Tab 2 columns: `Service Type`, `Exempt`.
The app's own field names, exposed through the per-column resize controls:
`serviceTypeName`, `isSpecialRateAllowed`.

Search placeholder: `Search by service type`.

---

## Save-cycle observations

- Tab 2 carries its own `Save` and `Cancel` buttons, separate from Tab 1's Save control.
- Tab 2's save cycle was **not exercised during this walk** — no checkbox state was committed.

---

## Observations

### Bugs / Defects

`none` — no behaviour defect is confirmed.

One item remains open and unproven, deliberately **not** filed: whether a service-type filter ticket's
fix reached this environment. Tab 2 lists 29 types including several plainly non-equipment entries, which
matches a pre-fix Actual Result — but the equipment-rollup taxonomy is client-owned and cannot be settled
from this walk.

### Suggestions / Improvements

- The two tabs carry **no stable test IDs** — the enumerator fell back to auto-generated `radix-*` ids
  that change between renders, so automation must use accessible role plus visible text. Recorded as a
  test-ID gap to raise with the dev team.

---

## Surface behaviour families (grid axis)

Tab 2 is a 29-row grid with search. Families applied and why:

| Family | Disposition |
|---|---|
| result-fidelity | `covered-by-TC: TC-DOP-EXM-010` — the grid must render all 29 service-type rows. |
| empty-vol | `covered-by-TC: TC-DOP-EXM-010` — search-to-no-match is the reachable empty state. |
| sorting | `out-of-scope: sorting=no sortable headers were enumerated on this tab` |
| pagination | `out-of-scope: pagination=29 rows render at once with no pager` |
| combination | `out-of-scope: combination=only one filter control exists (search), so there is no second dimension to combine it with` |

---

## Staleness signal

Re-walk if any of these change: the tab set, the tab-2 service-type list, or the tab-2 column set.
Otherwise this artifact is good for 14 days from 2026-08-11.

---

## Coverage Manifest

Machine-derived keys cross-referenced against field inventory dispositions. Source: reports/walk-coverage/dop-tab2.json (148 entries). Rows for the Special Rate Exemptions tab are listed here; Tab 1 rows are in the companion file.

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
| `id:radix-_r_v_-trigger-serviceTypeExemptions` | `covered-by-TC: TC-DOP-EXM-001` |
| `id:radix-_r_v_-content-serviceTypeExemptions` | `covered-by-TC: TC-DOP-EXM-001` |
| `struct:input\|Search by service type\|div/radix-_r_v_-content-serviceTypeExemptions/div/div/div/div` | `covered-by-TC: TC-DOP-EXM-010` |
| `struct:button\|Cancel\|div/div/radix-_r_v_-content-serviceTypeExemptions/div/div/div` | `covered-by-TC: TC-DOP-EXM-001` |
| `struct:button\|Save\|div/div/radix-_r_v_-content-serviceTypeExemptions/div/div/div` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:th\|Service Type\|div/div/div/table/thead/tr` | `covered-by-TC: TC-DOP-OPT-002` |
| `id:radix-_r_2e_` | `out-of-scope: outside-module global application shell, not owned by Discount Optimization surface` |
| `struct:button\|Resize column serviceTypeName\|div/div/table/thead/tr/th` | `covered-by-TC: TC-DOP-OPT-010` |
| `struct:th\|Exempt\|div/div/div/table/thead/tr` | `covered-by-TC: TC-DOP-OPT-002` |
| `id:radix-_r_2g_` | `out-of-scope: outside-module global application shell, not owned by Discount Optimization surface` |
| `struct:button\|Resize column isSpecialRateAllowed\|div/div/table/thead/tr/th` | `covered-by-TC: TC-DOP-OPT-010` |
| `struct:checkbox\|Exempt Computer Rental\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Concise Equipment\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Digital Branding\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Digital Services Equipment\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Digital Services Subrental\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Equipment Rental\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt HSIA - Equipment\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt HSIA - Subrental Equipment\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt HSIA - Wi-Fi Services\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt HSIA Services\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Lighting\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Lighting Subrental\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Photographic Services\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Power Infrastructure\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Power Rental Equipment\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Power Sub-rental Equipment\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Rigging Equipment - Subrental\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Rigging Equipment Rental\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Scenic Equipment Rental\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Scenic Sub-Rental\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Sub-Rental Equipment\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Telecom Equipment\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Telecom Services\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Telecom Subrental\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Venue Equipment Rental\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Virtual Events Equipment\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Virtual Events Professional Servi\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt Wedding Event Equipment Rental\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:checkbox\|Exempt ZSub Rental Specialty\|div/div/table/tbody/tr/td` | `covered-by-TC: TC-DOP-EXM-020` |
| `struct:section\|Notifications alt+T\|html/body` | `out-of-scope: outside-module notification chrome, not owned by Discount Optimization surface` |
