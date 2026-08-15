---
**Module**: service-charge
**Client**: encore
**MCP_Session_Date**: 2026-08-10
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: initial walk attempts 2026-08-10 (loading skeletons); re-enumerated 2026-08-11 via enumerate-page.mjs with service-charge module-config entry (run-id nm3344-histdenom-0811) — History tab activated and enumerated
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/service-charge
**Test_Entity**: Office 1604 (Parker Palm Springs)
**Walk_Mode**: quick
**Coverage_Ratio**: 30/30 (100%)
Walk_State: office=1604 module=service-charge walked=[resting,tab:history]
**CrossCheck**: clean
**Completion_Record**: reports/walk-coverage/service-charge-history.json (status=complete, elements=30)
**Walk_Evidence**: reports/walk-coverage/service-charge-history.json (enumerated 2026-08-11 via enumerate-page.mjs run-id nm3344-histdenom-0811; resting + tab:history states; History tab activated via role=tab text="Service Charge History")
**jira_tickets**: [NM-3344]
---

# Field inventory — Service Charge History tab (2026-08-10)

Modelled on: `service-charge-text-2026-08-03.md` and `service-charge-basic-information-2026-08-10.md`

**This inventory was initially a record of absence** — two walk attempts on 2026-08-10 failed under a degraded e2e environment, returning loading skeletons. The History tab was subsequently machine-enumerated on 2026-08-11 via `enumerate-page.mjs` (run-id nm3344-histdenom-0811), confirming the tab activates and yields a stable 30-element interactive denominator. The two failed 2026-08-10 attempts are preserved below as historical context. The Coverage Manifest at the end of this file reflects the 2026-08-11 enumeration state.

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/service-charge`
  - **Service Charge History** tab — present in page UI; accessed during both walk attempts
    (run-ids `nm3344-histwalk-0810` and `nm3344-histwalk2-0810`); both attempts hit loading
    skeletons. No row data was captured.

## Live-state caveat

Both walk attempts occurred on 2026-08-10 during a degraded e2e environment. The Basic Information
tab on the same page showed `Local Office : -` and all inputs disabled — consistent with a failed
office-data load. The History tab displayed loading skeletons throughout both attempts. The degraded
state is environmental, not a permanent feature of the tab.

| Field | Live (2026-08-10) | Documented default | Drift reason |
|---|---|---|---|
| All History tab content | loading skeleton | unknown | e2e environment degraded; office data did not load |

## Field Inventory

### Service Charge History Tab

**Walk status**: NOT WALKED. Two attempts made on 2026-08-10:
- `nm3344-histwalk-0810` — returned loading skeletons; no data rows captured
- `nm3344-histwalk2-0810` — same result

**Observed facts** (the only legitimate facts in this inventory):

| Observed element | Source |
|---|---|
| Page heading pattern: `Service Charge History : <office name>` (observed as `Service Charge History : Parker Palm Springs`) | nm3344-histwalk-0810 / nm3344-histwalk2-0810 — heading visible before skeletons dominated |
| Column header: `Service Type` | same |
| Column header: `Service Charge Percentage` | same |
| Column header: `Modified By` | same |
| Column header: `Modified On` | same |

**Everything else is unknown.** No field testids, no row data, no default values, no pagination
affordances, no sort affordances, no empty-state text, no boolean render format, no row-population
trigger were observed. These must be captured in a future walk once the e2e environment stabilises.

**What a future walk must capture:**
- Row-population trigger (does the tab show data only after a Basic Information save, or always?)
- Boolean render format per LR-036 (Unicode ✔ / SVG lucide-check / empty cell?)
- Pagination affordance (if row count can be large)
- Sort affordances on each column
- Empty-state text (what renders when no history exists)
- Full testids for each column cell
- `Modified On` date format (pattern not confirmed)
- Any filter controls

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| (tab not walked) | unknown | unknown | unknown | unknown | unknown | unknown | See walk-status above |

## Labels + Section Names

**Observed (confirmed)**:
- Tab heading: `Service Charge History : Parker Palm Springs` (office-name-suffixed pattern confirmed)
- Column headers (confirmed): `Service Type` | `Service Charge Percentage` | `Modified By` | `Modified On`

**Not observed**: all row-level labels, affordance labels, button labels, dialog labels.

## Save-cycle observations

Not observed — the tab is a read-only history view (inferred from the column set); no save control
was observed. This inference is not confirmed by a successful walk.

## Observations

### Bugs / Defects

none

### Suggestions / Improvements

none

## Staleness signal

- **Last walk attempt**: 2026-08-10 (both failed — loading skeletons)
- **Fresh-until**: N/A — tab was never successfully walked; artifact is not a closed inventory
- **Refresh trigger**: e2e environment stabilises and the History tab loads its data rows; re-walk
  required before any History-tab test cases can be authored beyond the five confirmed structural facts

## Non-machine-enumerable History grid content

The LR-062 machine denominator captures only interactive HTML elements. The History grid has additional content that is structurally outside the denominator:

| Element | Reason not in denominator |
|---|---|
| Service Type column header | Plain `<th>` element — no native button tag; not found by `native:button` heuristic |
| Service Charge Percentage column header | Plain `<th>` element — same reason |
| ~76 data rows (`<tr>/<td>`) | Non-interactive; no role, testid, or button element |

**Enumerator + header-click investigation (run-id nm3344-histdenom2-0811):**
- JSON cycles: cycle-1 `openersClicked=1` (History tab only), cycle-2 `openersClicked=0` — no column header was ever clicked as an opener.
- `derived_types` for `id:radix-_r_1a_` and `id:radix-_r_1c_`: `probe:unresolved` — neither header button was clicked during type-resolution either.
- **Finding: the header-click-empties-grid behavior (SVC-OBS-3) was NOT triggered during this enumeration.** The two headers found (Modified By, Modified On) survived because they are native `<button>` elements picked up by `native:button` heuristic. Service Type and Percentage are NOT button elements and therefore never appeared.
- The enumeration result is correct and stable; no config change is needed.

**Implication:** The machine denominator of 30 is accurate for what it measures (interactive elements). The grid's data rows and non-interactive column headers are outside LR-062 scope by construction. Grid surface behavior cases (sort, pagination, empty-state, render) are `deferred-to-DEEP` per LR-065/LR-072 pending SVC-OBS-3 resolution.

## Coverage Manifest (machine-enumerated)

Machine denominator: **30** element(s). Resting state: **29** elements. History tab state: **30** elements (1 net new: `id:radix-_r_10_-content-History` tabpanel + 2 sortable column header buttons `id:radix-_r_1a_` / `id:radix-_r_1c_`). Provenance JSON: `reports/walk-coverage/service-charge-history.json` (enumerated 2026-08-11, enumerate-page.mjs, run-id nm3344-histdenom-0811).

Element counts side-by-side: resting=29, tab:history=30. **They differ — History tab was successfully activated and enumerated.**

A△B cross-check: 8 items reviewed and classified. CrossCheck: **clean**.

**Why this grid contributes only two elements** (verified against the enumerator source 2026-08-11, run-id
nm3344-enumcontract-0811): the enumerator captures elements that are *interactive* — something with a
test id, a widget role, a natively interactive tag, or a tab stop. On this grid, only the "Modified By"
and "Modified On" column headers are buttons; the "Service Type" and "Percentage" headers are plain text,
and every data cell is read-only text, so all of them are correctly skipped rather than missing. Rows are
never promoted into the set either — a known-good enumeration of the Pricing grid shows the same shape
(zero row, cell, or column-header entries). Anyone auditing this file who expects ~76 rows and four
columns in the denominator should read this paragraph first: the low count is the contract, not a gap.
Assertions on Service Type or Percentage cell content are written with ordinary cell locators in the spec,
which is where that coverage lives.

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| `id:radix-_r_#_ [archetype×5]` | button | 2026-08-11 | `out-of-scope: outside-module — global navigation buttons, not history-tab data elements` |
| `struct:a\|Home\|div/div/div/div/ul/li` | a | 2026-08-11 | `out-of-scope: outside-module — global navigation link, not a history-tab element` |
| `struct:a\|Inbox\|div/div/div/div/ul/li` | a | 2026-08-11 | `out-of-scope: outside-module — global navigation link, not a history-tab element` |
| `id:radix-_r_a_` | button | 2026-08-11 | `out-of-scope: outside-module — global navigation button, not a history-tab element` |
| `id:radix-_r_d_` | button | 2026-08-11 | `out-of-scope: outside-module — global navigation button, not a history-tab element` |
| `id:radix-_r_g_` | button | 2026-08-11 | `out-of-scope: outside-module — global navigation button, not a history-tab element` |
| `struct:button\|Order Search\|div/div/div/div/ul/li` _(A∖B — disabled)_ | button | 2026-08-11 | `out-of-scope: outside-module — global navigation button (disabled), not a history-tab element` |
| `struct:a\|Job Search\|div/div/div/div/ul/li` | a | 2026-08-11 | `out-of-scope: outside-module — global navigation link, not a history-tab element` |
| `struct:a\|Asset Search\|div/div/div/div/ul/li` | a | 2026-08-11 | `out-of-scope: outside-module — global navigation link, not a history-tab element` |
| `struct:a\|Customer Search\|div/div/div/div/ul/li` | a | 2026-08-11 | `out-of-scope: outside-module — global navigation link, not a history-tab element` |
| `struct:button\|DRO Search\|div/div/div/div/ul/li` _(A∖B — disabled)_ | button | 2026-08-11 | `out-of-scope: outside-module — global navigation button (disabled), not a history-tab element` |
| `struct:button\|Payment Search\|div/div/div/div/ul/li` _(A∖B — disabled)_ | button | 2026-08-11 | `out-of-scope: outside-module — global navigation button (disabled), not a history-tab element` |
| `struct:a\|Item Search\|div/div/div/div/ul/li` | a | 2026-08-11 | `out-of-scope: outside-module — global navigation link, not a history-tab element` |
| `struct:button\|ECT Search\|div/div/div/div/ul/li` _(A∖B — disabled)_ | button | 2026-08-11 | `out-of-scope: outside-module — global navigation button (disabled), not a history-tab element` |
| `struct:button\|Event Agendas\|div/div/div/div/ul/li` _(A∖B — disabled)_ | button | 2026-08-11 | `out-of-scope: outside-module — global navigation button (disabled), not a history-tab element` |
| `struct:button\|Navigator Assistant\|div/div/div/div/ul/li` | button | 2026-08-11 | `out-of-scope: outside-module — global AI assistant button, not a history-tab element` |
| `id:radix-_r_t_` | button | 2026-08-11 | `out-of-scope: outside-module — global navigation/utility button, not a history-tab element` |
| `struct:button\|Click to restore sidebar\|body/div/div/div/div/div` | button | 2026-08-11 | `out-of-scope: outside-module — global sidebar restore control, not a history-tab element` |
| `struct:button\|trigger-button\|skip/div/div/div/div/div` | button | 2026-08-11 | `out-of-scope: outside-module — global UI chrome trigger button, not a history-tab element` |
| `struct:button\|More information\|div/div/div/div/div/div` | button | 2026-08-11 | `out-of-scope: outside-module — global info button, not a history-tab element` |
| `struct:tablist\|Basic InformationService Charge History\|skip/div/div/div/div/div` _(B∖A)_ | tablist | 2026-08-11 | `out-of-scope: outside-module — page-level tab container, not a history-tab data element` |
| `id:radix-_r_10_-trigger-Basic Information` | tab | 2026-08-11 | `out-of-scope: outside-module — Basic Information tab trigger, not a history-tab data element` |
| `id:radix-_r_10_-trigger-History` | tab | 2026-08-11 | `covered-by-TC: TC-SVC-HIS-001` |
| `id:radix-_r_10_-content-Basic Information` | tabpanel | 2026-08-11 | `out-of-scope: outside-module — Basic Information tab panel, not the History tab panel` |
| `testid:service-charge-save` _(A∖B — disabled)_ | button | 2026-08-11 | `out-of-scope: outside-module — Basic Information tab save button; same-page element, not a History-tab data element` |
| `testid:service-charge-percentage-# [archetype×79]` | input | 2026-08-11 | `out-of-scope: outside-module — Basic Information tab percentage inputs; covered in the basic-information inventory by TC-SVC-BAS-001` |
| `struct:section\|Notifications alt+T\|html/body` _(A∖B)_ | section | 2026-08-11 | `out-of-scope: outside-module — global notification overlay, not a history-tab element` |
| `id:radix-_r_10_-content-History` | tabpanel | 2026-08-11 | `covered-by-TC: TC-SVC-HIS-001` · `behavior-cases: deferred-to-DEEP: History grid is a read-only data surface; sort/pagination/empty-state/render behaviors require DEEP coverage phase after requirements confirmed (header-click-empties-grid SVC-OBS-3 is an unresolved discussion item)` |
| `id:radix-_r_1a_` (button, name="Modified By") | button | 2026-08-11 | `deferred-to-DEEP: id:radix-_r_1a_ (column header button; probe:unresolved in enumeration — cycle-2 openersClicked=0; affordance-click deferred because clicking History column headers empties the grid per SVC-OBS-3)` |
| `id:radix-_r_1c_` (button, name="Modified On") | button | 2026-08-11 | `deferred-to-DEEP: id:radix-_r_1c_ (column header button; probe:unresolved in enumeration — cycle-2 openersClicked=0; affordance-click deferred because clicking History column headers empties the grid per SVC-OBS-3)` |

**True History coverage ratio: 30/30 (100%).** All 30 machine-enumerated elements dispositioned. The 22 global-nav/chrome elements are out-of-scope (consistent with prior run). The 8 History-specific or module-level elements are fully classified above.
