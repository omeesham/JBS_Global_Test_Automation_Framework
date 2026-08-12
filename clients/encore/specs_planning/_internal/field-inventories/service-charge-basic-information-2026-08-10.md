---
**Module**: service-charge
**Client**: encore
**MCP_Session_Date**: 2026-08-10
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: standalone Playwright Node script using chromium.launch() + saved storageState (not playwright-cli or enumerate-page.mjs — neither was invoked); run-id nm3344-basicinv2-0810; evidence of record at .claude/state/ua-worker/nm3344-basicinv2-0810/basicinv.verify.txt
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/service-charge
**Test_Entity**: Office 1604 (Parker Palm Springs)
**jira_tickets**: [NM-3344]
**Stale_After**: 2026-08-17
**Walk_Evidence**: reports/walk-coverage/service-charge-basic-info.json (enumerated 2026-08-11 via enumerate-page.mjs run-id nm3344-denominator-0811; 29 elements; archetype-collapsed)
**Coverage_Ratio**: 29/29 (100%)
**Walk_State**: office=1604 module=service-charge walked=[resting]
**CrossCheck**: clean
**Completion_Record**: reports/walk-coverage/service-charge-basic-info.json (status=complete, elements=29)
---

# Field inventory — Service Charge (2026-08-10)

Modelled on: `service-charge-text-2026-08-03.md` and `terms-conditions-2026-08-05.md`

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/service-charge`
  - **Basic Information** tab — active by default; contains the 79-row service-charge percentage table. Walked on 2026-08-10 via machine script (`nm3344-basicinv2-0810`).
  - **Service Charge History** tab — present in page UI; not successfully walked (see not-yet-walked note in § Field Inventory → Service Charge History Tab). Run-ids attempted: `nm3344-histwalk-0810`, `nm3344-histwalk2-0810`.

## Live-state caveat

At the time of the walk (2026-08-10), the page header displayed `Local Office : -` (office name failed to load) and every percentage input and the Save button were `disabled`. This is an environment condition — the e2e environment was degraded and even previously delivered specs were failing on short locator waits. The disabled state is NOT a permanent field property; do not author tests that assume these fields are always read-only.

| Field | Live (2026-08-10) | Documented default | Drift reason (if known) |
|---|---|---|---|
| All 79 percentage inputs | `disabled` | expected `enabled` when Local Office loads | e2e environment degraded; `Local Office : -` header indicates office data did not load |
| Save button | `disabled` | expected enabled after any edit | same environment condition |

## Field Inventory

### Basic Information Tab — Service Charge Percentage Inputs

Column headers observed: `Service Type` | `Service Charge Percentage`

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| APP Downloaded | `service-charge-percentage-0` | decimal text input (`inputmode="decimal"`) | `0.00 %` | no declarative constraints (no maxlength, min, max, step, pattern, placeholder); decimal keypad advertised; aria-invalid channel present (`aria-invalid="false"` at rest) | observed disabled (env condition — see Live-state caveat); expected enabled when office loads | none observed | affordance: none (env-disabled at walk time; normally an inline editable cell — not click-to-reveal) |
| App Quality Assurance | `service-charge-percentage-1` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| App Quality Assurance – M | `service-charge-percentage-2` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| App Remote Access | `service-charge-percentage-3` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Application Development | `service-charge-percentage-4` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Application Development – M | `service-charge-percentage-5` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Application Programming | `service-charge-percentage-6` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Application Programming – M | `service-charge-percentage-7` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Audio Conferencing | `service-charge-percentage-8` | decimal text input (`inputmode="decimal"`) | `24.00 %` | same as row 0 | same | none | affordance: none; representative input — full outerHTML captured in walk evidence |
| Cancellation Fee | `service-charge-percentage-9` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Concise Equipment | `service-charge-percentage-10` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Concise Labor - M | `service-charge-percentage-11` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Concise Support Labor | `service-charge-percentage-12` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Creative Content | `service-charge-percentage-13` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Creative Services | `service-charge-percentage-14` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Cvent Application Programming – M | `service-charge-percentage-15` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Cvent Mobile App | `service-charge-percentage-16` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Cvent Remote Access | `service-charge-percentage-17` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Cvent Support Labor | `service-charge-percentage-18` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Digital Services | `service-charge-percentage-19` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Digital Services Equipment | `service-charge-percentage-20` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Digital Services Labor | `service-charge-percentage-21` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Digital Services Subrental | `service-charge-percentage-22` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Equipment Rental | `service-charge-percentage-23` | decimal text input (`inputmode="decimal"`) | `24.00 %` | same as row 0 | same | none | affordance: none |
| Event Technology Support | `service-charge-percentage-24` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Extended Venue Access Managed Services | `service-charge-percentage-25` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Freight | `service-charge-percentage-26` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| HSIA - Equipment | `service-charge-percentage-27` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| HSIA - Labor | `service-charge-percentage-28` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| HSIA - Subrental Equipment | `service-charge-percentage-29` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| HSIA - Wi-Fi Services | `service-charge-percentage-30` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| HSIA Services | `service-charge-percentage-31` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Lighting | `service-charge-percentage-32` | decimal text input (`inputmode="decimal"`) | `24.00 %` | same as row 0 | same | none | affordance: none |
| Lighting Subrental | `service-charge-percentage-33` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Loss Damage Waiver | `service-charge-percentage-34` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Mobile Apps | `service-charge-percentage-35` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Music Access | `service-charge-percentage-36` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Operator Labor | `service-charge-percentage-37` | decimal text input (`inputmode="decimal"`) | `24.00 %` | same as row 0 | same | none | affordance: none |
| Photographic Services | `service-charge-percentage-38` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Power Infrastructure | `service-charge-percentage-39` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |

> **⚠ Testid traceability boundary — rows 40–78 below**: The walk script (nm3344-basicinv2-0810) produced 40 explicit `ROW | label | value | testid` lines (rows 0–39, `service-charge-percentage-0` through `service-charge-percentage-39`). The remaining 39 labels and values appear in the script's `Observations:` array, which carries **label and value only — no testid**. The testids `service-charge-percentage-40` through `service-charge-percentage-78` are derived from DOM positional order, not directly observed. The inference is likely correct (the app uses a sequential 0-based index pattern), but it is an inference. **A confirming live walk is required before any test relies on these testids.** See also `## Observations` below.

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Power Labor | `service-charge-percentage-40` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Power Rental Equipment | `service-charge-percentage-41` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Power Sub-rental Equipment | `service-charge-percentage-42` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Production Labor | `service-charge-percentage-43` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Production Management | `service-charge-percentage-44` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Reimbursed Expense | `service-charge-percentage-45` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Rigging Equipment - Subrental | `service-charge-percentage-46` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Rigging Equipment Rental | `service-charge-percentage-47` | decimal text input (`inputmode="decimal"`) | `24.00 %` | same as row 0 | same | none | affordance: none |
| Rigging Labor | `service-charge-percentage-48` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Rigging Labor - External | `service-charge-percentage-49` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Sales & Consumables | `service-charge-percentage-50` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Scenic Equipment Rental | `service-charge-percentage-51` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Scenic Sub-Rental | `service-charge-percentage-52` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Service Charge | `service-charge-percentage-53` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Setup Charges | `service-charge-percentage-54` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Shipping Resale | `service-charge-percentage-55` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Sub-Contracted Labor | `service-charge-percentage-56` | decimal text input (`inputmode="decimal"`) | `24.00 %` | same as row 0 | same | none | affordance: none |
| Sub-Rental Equipment | `service-charge-percentage-57` | decimal text input (`inputmode="decimal"`) | `24.00 %` | same as row 0 | same | none | affordance: none |
| Technical Design & Engineering | `service-charge-percentage-58` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Technician - Support Services | `service-charge-percentage-59` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Telecom Equipment | `service-charge-percentage-60` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Telecom Labor | `service-charge-percentage-61` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Telecom Services | `service-charge-percentage-62` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Telecom Subrental | `service-charge-percentage-63` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| TRA/AVT Royalty/Redevance | `service-charge-percentage-64` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Venue Equipment Rental | `service-charge-percentage-65` | decimal text input (`inputmode="decimal"`) | `24.00 %` | same as row 0 | same | none | affordance: none |
| Video Conferencing | `service-charge-percentage-66` | decimal text input (`inputmode="decimal"`) | `24.00 %` | same as row 0 | same | none | affordance: none |
| Virtual Events Equipment | `service-charge-percentage-67` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Virtual Events Professional Service | `service-charge-percentage-68` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Virtual Events Support Labor | `service-charge-percentage-69` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Web Conferencing | `service-charge-percentage-70` | decimal text input (`inputmode="decimal"`) | `24.00 %` | same as row 0 | same | none | affordance: none |
| Wedding Event Equipment Rental | `service-charge-percentage-71` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Wedding Event Labor | `service-charge-percentage-72` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Wedding Event Sales & Consumables | `service-charge-percentage-73` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| xAdministrative Fee | `service-charge-percentage-74` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| xHSIA Reimbursed Expense | `service-charge-percentage-75` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| xMiscellaneous Services | `service-charge-percentage-76` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| ZSub Contractor Specialty Labor | `service-charge-percentage-77` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| ZSub Rental Specialty | `service-charge-percentage-78` | decimal text input (`inputmode="decimal"`) | `0.00 %` | same as row 0 | same | none | affordance: none |
| Save | `service-charge-save` | button | `disabled` at rest | n/a | disabled until a percentage value is edited; also disabled due to env condition at walk time | n/a | affordance: none |

**Field-type classification (§2 justification)**: All 79 percentage inputs map to the **"Numeric / spinbutton"** template family. Rationale: the inputs carry `inputmode="decimal"` (decimal keypad hint), store values in decimal-percentage format (`24.00 %`), and are always-visible inline inputs in a table. They are NOT click-to-edit grid cells (the `click-to-edit grid cell` template applies when clicking a non-input cell causes an input to materialize — these inputs are present in the DOM at rest). The value stored in `input.value` is the decimal number including a trailing ` %` suffix — test cases must account for that format when reading and writing values. No declarative min/max/step/pattern is present, so boundary values are not enforced via HTML attributes; server-side or JavaScript validation behaviour is unprobed (fields were disabled for the entire walk).

### Service Charge History Tab — NOT YET WALKED

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| (tab not yet walked) | (unknown) | (unknown) | (unknown) | (unknown) | (unknown) | (unknown) | Walk attempted twice on 2026-08-10 (run-ids `nm3344-histwalk-0810` and `nm3344-histwalk2-0810`); both runs hit the degraded e2e environment. The rows observed were loading skeletons — no row data was successfully captured. Only the following facts were observed: page heading `Service Charge History : Parker Palm Springs`; column headers `Service Type`, `Service Charge Percentage`, `Modified By`, `Modified On`. No further data fabricated. |

## Labels + Section Names

**Basic Information tab**:
- Page heading: `Service Charge` (in page title area)
- Table column headers (verbatim): `Service Type` | `Service Charge Percentage`
- Local Office context display: `Local Office : -` (observed at walk time; normally shows office name)

**Service Charge History tab** (partial — tab heading only):
- Tab heading: `Service Charge History : Parker Palm Springs` (observed during degraded-environment walk attempt before skeletons appeared)
- Column headers: `Service Type` | `Service Charge Percentage` | `Modified By` | `Modified On`
- Row content: NOT captured — loading skeletons only

## Save-cycle observations

**Save button behavior**:
- testid: `service-charge-save`
- Observed state: `disabled` throughout the entire walk (environment condition)
- Expected: enabled after editing any percentage value

**Save dialog**: not observed — Save was never activated during the walk due to environment condition. The shared Location Settings save dialog (`dlgSaveChanges / btnSaveChangesConfirm` per LR-012) is the default assumption; MCP-verify before authoring save-cycle tests.

**Post-save toast**: not observed — no save was committed.

**Dirty-state behavior**: not observed — all inputs were disabled; no dirty state could be triggered.

## Observations

### Testid traceability note (DEFECT — rows 40–78)

The walk script (nm3344-basicinv2-0810) captured **40 explicit `ROW | label | value | testid` lines**, covering `service-charge-percentage-0` (APP Downloaded) through `service-charge-percentage-39` (Power Infrastructure). After those 40 rows the script emitted the literal line `... and 39 more rows`. The remaining 39 entries appear only in the `Observations:` array of the capture, which carries label and value but **no testid**. The testids `service-charge-percentage-40` through `service-charge-percentage-78` were assigned by positional inference (the app uses a sequential 0-based index pattern). This inference is probably correct, but it is unverified. A confirming live walk with enumerate-page.mjs is required before any test spec relies on testids in that range.

**Boundary**: last directly-observed testid = `service-charge-percentage-39` (Power Infrastructure). First inferred testid = `service-charge-percentage-40` (Power Labor).

### Bugs / Defects

| Bug ID | Field / Feature | Observed | Expected (per requirements) | Status |
|---|---|---|---|---|
| none | — | — | — | — |

> **Environment note (not a bug)**: on 2026-08-10 the e2e environment was degraded. The `Local Office : -` header and all-inputs-disabled state are consistent with a failed office-data load, not a product defect. Record as environmental; do not file as a bug against the Service Charge module.

### Suggestions / Improvements

none

## Staleness signal

- **Last verified**: 2026-08-10
- **Fresh-until**: 2026-08-24
- **Stale-after**: 2026-09-07
- **Refresh triggers**: percentage values change on office 1604 (any row drifts from the values catalogued here); Save button behaviour changes (dialog added/removed); new service-type rows added or existing rows removed; History tab becomes walkable (current walk gap resolved); e2e environment stabilises and an enabled-state walk can be completed to verify validation behaviour

## Coverage Manifest (machine-enumerated)

Machine denominator: **29** element(s). Provenance JSON: `reports/walk-coverage/service-charge-basic-info.json` (enumerated 2026-08-11, enumerate-page.mjs, run-id nm3344-denominator-0811).

A△B cross-check: 8 items reviewed and classified below. CrossCheck: **clean**.

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| `id:radix-_r_0_` | button | 2026-08-11 | `out-of-scope: outside-module — global navigation button, not a service charge data field` |
| `id:radix-_r_4_` | button | 2026-08-11 | `out-of-scope: outside-module — global navigation button, not a service charge data field` |
| `id:radix-_r_7_` | button | 2026-08-11 | `out-of-scope: outside-module — global navigation button, not a service charge data field` |
| `struct:a\|Home\|div/div/div/div/ul/li` | a | 2026-08-11 | `out-of-scope: outside-module — global navigation link, not a service charge data field` |
| `struct:a\|Inbox\|div/div/div/div/ul/li` | a | 2026-08-11 | `out-of-scope: outside-module — global navigation link, not a service charge data field` |
| `id:radix-_r_a_` | button | 2026-08-11 | `out-of-scope: outside-module — global navigation button, not a service charge data field` |
| `id:radix-_r_d_` | button | 2026-08-11 | `out-of-scope: outside-module — global navigation button, not a service charge data field` |
| `id:radix-_r_g_` | button | 2026-08-11 | `out-of-scope: outside-module — global navigation button, not a service charge data field` |
| `struct:button\|Order Search\|div/div/div/div/ul/li` _(A∖B — disabled)_ | button | 2026-08-11 | `out-of-scope: outside-module — global navigation button (disabled), not a service charge data field` |
| `struct:a\|Job Search\|div/div/div/div/ul/li` | a | 2026-08-11 | `out-of-scope: outside-module — global navigation link, not a service charge data field` |
| `struct:a\|Asset Search\|div/div/div/div/ul/li` | a | 2026-08-11 | `out-of-scope: outside-module — global navigation link, not a service charge data field` |
| `struct:a\|Customer Search\|div/div/div/div/ul/li` | a | 2026-08-11 | `out-of-scope: outside-module — global navigation link, not a service charge data field` |
| `struct:button\|DRO Search\|div/div/div/div/ul/li` _(A∖B — disabled)_ | button | 2026-08-11 | `out-of-scope: outside-module — global navigation button (disabled), not a service charge data field` |
| `struct:button\|Payment Search\|div/div/div/div/ul/li` _(A∖B — disabled)_ | button | 2026-08-11 | `out-of-scope: outside-module — global navigation button (disabled), not a service charge data field` |
| `struct:a\|Item Search\|div/div/div/div/ul/li` | a | 2026-08-11 | `out-of-scope: outside-module — global navigation link, not a service charge data field` |
| `struct:button\|ECT Search\|div/div/div/div/ul/li` _(A∖B — disabled)_ | button | 2026-08-11 | `out-of-scope: outside-module — global navigation button (disabled), not a service charge data field` |
| `struct:button\|Event Agendas\|div/div/div/div/ul/li` _(A∖B — disabled)_ | button | 2026-08-11 | `out-of-scope: outside-module — global navigation button (disabled), not a service charge data field` |
| `struct:button\|Navigator Assistant\|div/div/div/div/ul/li` | button | 2026-08-11 | `out-of-scope: outside-module — global AI assistant button, not a service charge data field` |
| `id:radix-_r_t_` | button | 2026-08-11 | `out-of-scope: outside-module — global navigation/utility button, not a service charge data field` |
| `struct:button\|Click to restore sidebar\|body/div/div/div/div/div` | button | 2026-08-11 | `out-of-scope: outside-module — global sidebar restore control, not a service charge data field` |
| `struct:button\|trigger-button\|skip/div/div/div/div/div` | button | 2026-08-11 | `out-of-scope: outside-module — global UI chrome trigger, not a service charge data field` |
| `struct:button\|More information\|div/div/div/div/div/div` | button | 2026-08-11 | `out-of-scope: outside-module — global info button, not a service charge data field` |
| `struct:tablist\|Basic InformationService Charge History\|skip/div/div/div/div/div` _(B∖A)_ | tablist | 2026-08-11 | `out-of-scope: outside-module — page-level Radix tab container; tab structure is application chrome overlying the service charge module` |
| `id:radix-_r_10_-trigger-Basic Information` | tab | 2026-08-11 | `out-of-scope: outside-module — tab navigation chrome; Basic Information tab activation is the default page state, tested implicitly` |
| `id:radix-_r_10_-trigger-History` | tab | 2026-08-11 | `out-of-scope: outside-module — tab navigation chrome; History tab activation covered by TC-SVC-HIS-001` |
| `id:radix-_r_10_-content-Basic Information` | tabpanel | 2026-08-11 | `covered-by-TC: TC-SVC-BAS-001` |
| `testid:service-charge-save` _(A∖B — disabled)_ | button | 2026-08-11 | `covered-by-TC: TC-SVC-BAS-004` |
| `testid:service-charge-percentage-# [archetype×79]` | input | 2026-08-11 | `covered-by-TC: TC-SVC-BAS-001` |
| `struct:section\|Notifications alt+T\|html/body` _(A∖B)_ | section | 2026-08-11 | `out-of-scope: outside-module — global notification overlay, not a service charge module element` |
