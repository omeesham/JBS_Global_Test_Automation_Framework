---
module: Discount Optimization
date: 2026-08-11
office: 1604
environment: cloudapps-e2e.encoreglobal.com
url: /navigator/locations/1604/settings/discount-optimization-settings
evidence:
  - reports/walk-coverage/dop-tab1.json  (148 entries, tab1 resting state)
  - reports/walk-coverage/dop-tab2.json  (148 entries, tab2 resting state)
---

# data-testid Gap Report — Discount Optimization

> **Column re-labelling, 2026-08-12** — after this artifact was recorded, the application re-labelled two
> grid columns: *No Implied Discount* → **Allow Special Rate**, and *No Implied Start* → **Special Rate
> Start Date**. This is a display-label change only; the underlying field and its Yes/No values are
> unchanged. The observations below are preserved verbatim as recorded on their date and deliberately keep
> the original column names.

**Date:** 2026-08-11 | **Office:** 1604 | **Environment:** cloudapps-e2e.encoreglobal.com

## 1. Current testid coverage

Across both tabs the module exposes exactly **one** `data-testid`:

| testid | element | covers |
|---|---|---|
| `discount-optimization-settings-table-container` | `div` | outer table container (Tab 1 only) |

Every other interactive control — both tabs, all search inputs, Save, Add, Cancel, column headers, column-resize handles, and all per-row controls — has no `data-testid`. Automation anchors on role, label text, placeholder text, or structural path fallbacks.

## 2. Critical: tab IDs are auto-generated Radix IDs

The two tab trigger elements carry IDs of the form `radix-_r_v_-trigger-locations` and `radix-_r_v_-trigger-serviceTypeExemptions`. The middle segment (`_r_v_`) is a Radix render-order counter that changes between page renders. These IDs **cannot be used as stable selectors**. This is the single highest-priority item in this request: stable testids on the two tabs would immediately eliminate the most fragile locator in the module.

## 3. Bucket A — controls that could and should carry a testid

These are application controls owned by the Encore dev team. Naming follows the one existing testid's convention: `discount-optimization-settings-{element}`.

### Tab 1: Discount Optimization

| # | Control | Tab | Role | Anchor used today | Requested `data-testid` |
|---|---|---|---|---|---|
| 1 | Discount Optimization tab | Both | `tab` | `id:radix-_r_v_-trigger-locations` (unstable Radix ID) | `discount-optimization-settings-tab-discount-optimization` |
| 2 | Special Rate Exemptions by Service Type tab | Both | `tab` | `id:radix-_r_v_-trigger-serviceTypeExemptions` (unstable Radix ID) | `discount-optimization-settings-tab-special-rate-exemptions` |
| 3 | Search by location number or name input | Tab 1 | `input` | `struct:input\|Search by location number or location na\|…` | `discount-optimization-settings-location-search` |
| 4 | Save button | Tab 1 | `button` | `struct:button\|Save\|radix-_r_v_-content-locations/…` | `discount-optimization-settings-location-save` |
| 5 | Add button | Tab 1 | `button` | `struct:button\|Add\|radix-_r_v_-content-locations/…` | `discount-optimization-settings-add` |
| 6 | Column header — ID | Tab 1 | `th` | `struct:th\|ID\|…/table/thead/tr` | `discount-optimization-settings-col-header-id` |
| 7 | Column header — Location Name | Tab 1 | `th` | `struct:th\|Location Name\|…/table/thead/tr` | `discount-optimization-settings-col-header-location-name` |
| 8 | Column header — No Implied Discount | Tab 1 | `th` | `struct:th\|No Implied Discount\|…/table/thead/tr` | `discount-optimization-settings-col-header-no-implied-discount` |
| 9 | Column header — No Implied Start | Tab 1 | `th` | `struct:th\|No Implied Start\|…/table/thead/tr` | `discount-optimization-settings-col-header-no-implied-start` |
| 10 | Column resize handle — locationNo | Tab 1 | `button` | `struct:button\|Resize column locationNo\|…/thead/tr/th` | `discount-optimization-settings-col-resize-location-no` |
| 11 | Column resize handle — locationName | Tab 1 | `button` | `struct:button\|Resize column locationName\|…/thead/tr/th` | `discount-optimization-settings-col-resize-location-name` |
| 12 | Column resize handle — allowSpecialRate | Tab 1 | `button` | `struct:button\|Resize column allowSpecialRate\|…/thead/tr/th` | `discount-optimization-settings-col-resize-no-implied-discount` |
| 13 | Column resize handle — startAllowSpecialRate | Tab 1 | `button` | `struct:button\|Resize column startAllowSpecialRate\|…/thead/tr/th` | `discount-optimization-settings-col-resize-no-implied-start` |
| 14 | Per-row Remove button *(row archetype × 36 rows)* | Tab 1 | `button` | `struct:button\|Remove <location name>\|…/tbody/tr/td/div` | `discount-optimization-settings-row-remove` |
| 15 | Per-row No Implied Discount toggle *(row archetype × 36 rows)* | Tab 1 | `button` | `struct:button\|No implied discount for <location name>\|…/tbody/tr/td/div` | `discount-optimization-settings-row-no-implied-discount-toggle` |
| 16 | Per-row date input *(row archetype)* | Tab 1 | `input` | `struct:input\|Select date\|tr/td/div/div/div/div` | `discount-optimization-settings-row-date-input` |
| 17 | Per-row Open calendar button *(row archetype)* | Tab 1 | `button` | `struct:button\|Open calendar\|td/div/div/div/div/div` | `discount-optimization-settings-row-open-calendar` |

### Tab 2: Special Rate Exemptions by Service Type

| # | Control | Tab | Role | Anchor used today | Requested `data-testid` |
|---|---|---|---|---|---|
| 18 | Search by service type input | Tab 2 | `input` | `struct:input\|Search by service type\|div/…` | `discount-optimization-settings-service-type-search` |
| 19 | Cancel button | Tab 2 | `button` | `struct:button\|Cancel\|div/div/radix-_r_v_-content-serviceTypeExemptions/…` | `discount-optimization-settings-service-type-cancel` |
| 20 | Save button | Tab 2 | `button` | `struct:button\|Save\|div/div/radix-_r_v_-content-serviceTypeExemptions/…` | `discount-optimization-settings-service-type-save` |
| 21 | Column header — Service Type | Tab 2 | `th` | `struct:th\|Service Type\|…/table/thead/tr` | `discount-optimization-settings-col-header-service-type` |
| 22 | Column sort button — Service Type | Tab 2 | `button` | `id:radix-_r_2e_` (unstable Radix ID) | `discount-optimization-settings-col-sort-service-type` |
| 23 | Column header — Exempt | Tab 2 | `th` | `struct:th\|Exempt\|…/table/thead/tr` | `discount-optimization-settings-col-header-exempt` |
| 24 | Column sort button — Exempt | Tab 2 | `button` | `id:radix-_r_2g_` (unstable Radix ID) | `discount-optimization-settings-col-sort-exempt` |
| 25 | Column resize handle — serviceTypeName | Tab 2 | `button` | `struct:button\|Resize column serviceTypeName\|…/thead/tr/th` | `discount-optimization-settings-col-resize-service-type` |
| 26 | Column resize handle — isSpecialRateAllowed | Tab 2 | `button` | `struct:button\|Resize column isSpecialRateAllowed\|…/thead/tr/th` | `discount-optimization-settings-col-resize-exempt` |
| 27 | Per-row Exempt checkbox *(row archetype × 29 rows)* | Tab 2 | `checkbox` | `struct:checkbox\|Exempt <service type name>\|…/tbody/tr/td` | `discount-optimization-settings-row-exempt-checkbox` |

**Total Bucket A: 27 distinct control types** (tabs counted once; per-row archetypes counted once each with row counts noted).

**Naming convention followed:** `discount-optimization-settings-{scope}-{element}`, mirroring the one existing testid (`discount-optimization-settings-table-container`). Tab-scoped controls are prefixed `location-` or `service-type-` to distinguish same-named controls (e.g. Save) that appear on both tabs.

## 4. Bucket B — app shell chrome (excluded from the client ask)

These controls appear in the enumeration because the enumerator walks the full page DOM, but they belong to the application shell, not to this module. The Discount Optimization dev team does not own them and should not annotate them.

| Control | Anchor key | Reason excluded |
|---|---|---|
| Office switcher button (×7 archetype) | `id:radix-_r_#_` | App shell — office selector |
| Home | `struct:a\|Home\|…/ul/li` | Left nav link |
| Inbox | `struct:a\|Inbox\|…/ul/li` | Left nav link |
| Tax nav button | `id:radix-_r_a_` | Left nav group |
| Setup nav button | `id:radix-_r_d_` | Left nav group |
| Studio nav button | `id:radix-_r_g_` | Left nav group |
| Order Search | `struct:button\|Order Search\|…/ul/li` | Left nav search link |
| Job Search | `struct:a\|Job Search\|…/ul/li` | Left nav search link |
| Asset Search | `struct:a\|Asset Search\|…/ul/li` | Left nav search link |
| Customer Search | `struct:a\|Customer Search\|…/ul/li` | Left nav search link |
| DRO Search | `struct:button\|DRO Search\|…/ul/li` | Left nav search link |
| Payment Search | `struct:button\|Payment Search\|…/ul/li` | Left nav search link |
| Item Search | `struct:a\|Item Search\|…/ul/li` | Left nav search link |
| ECT Search | `struct:button\|ECT Search\|…/ul/li` | Left nav search link |
| Event Agendas | `struct:button\|Event Agendas\|…/ul/li` | Left nav link |
| Navigator Assistant | `struct:button\|Navigator Assistant\|…/ul/li` | Left nav link |
| User menu button (PCprd click auto) | `id:radix-_r_t_` | App shell — user menu |
| Sidebar toggle (Click to restore sidebar) | `struct:button\|Click to restore sidebar\|…` | App shell — layout control |
| Trigger button | `struct:button\|trigger-button\|…` | App shell — unrelated trigger |
| Notifications region | `struct:section\|Notifications alt+T\|…` | App shell — notifications |

**Total Bucket B: 20 items** (all app shell; none are Discount Optimization module controls).

## 5. Impact

Automation against this module runs today on role, label text, placeholder text, and structural path fallbacks. These anchors work, but they are fragile in two specific ways. First, the two tab triggers use Radix auto-generated IDs whose middle counter changes between renders — any test that needs to click a tab must locate it by display text, which breaks silently if a tab is renamed. Second, the column sort buttons on Tab 2 also use unstable Radix IDs, so sorting assertions have no stable anchor at all. The remaining controls (search inputs, Save, Add, Cancel, per-row buttons) rely on label text or placeholder text; these are durable as long as copy does not change, but a wording update to any heading or button label would silently break every test that touches that control with no compile-time warning. Adding the 27 testids listed in §3 would make all selectors rename-proof and eliminate the Radix ID instability on the tabs and sort buttons. Automation is proceeding on tracked fallbacks; this report is the request to make it durable.

## 6. Addendum 2026-08-19 — Change Local Office drawer

Tab 1's **Add** button opens a **Change Local Office** drawer (enumerated on office 1604 this session; denominator 95, 3 direct controls). Its controls carry no `data-testid`; automation anchors as below. Two are fragile text-anchored gaps (rename-breaks-silently); the launcher has a stable element id.

| # | Control | Current anchor | Preferred `data-testid` |
|---|---|---|---|
| 28 | Change Local Office — Cancel button | `button:text-is("Cancel")` (text-anchored, fragile) | `discount-optimization-change-office-cancel` |
| 29 | Change Local Office — Update/confirm button | `button:text-is("Update")` (text-anchored, fragile; disabled on the current office) | `discount-optimization-change-office-update` |
| — | Change Local Office — "Select a Location" launcher | `#discount-optimization-location` (stable element id — durable, no gap) | (already anchorable) |

These roll into the same client ask as §3: the two fragile drawer controls would become rename-proof with the testids above. The nested location picker the launcher opens is empty on office 1604 (no selectable data), so its row-level controls could not be enumerated here.
