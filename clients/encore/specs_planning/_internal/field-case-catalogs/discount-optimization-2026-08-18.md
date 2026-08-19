---
artifact: field-case-catalog
module: discount-optimization
client: encore
session_date: 2026-08-18
author_identity: GIVER
field_inventory_tab1: clients/encore/specs_planning/_internal/field-inventories/discount-optimization-locations-2026-08-11.md
field_inventory_tab2: clients/encore/specs_planning/_internal/field-inventories/discount-optimization-exemption-2026-08-11.md
walk_evidence: inventories above; live re-verification note in both artifacts dated 2026-08-18
baseline_artifact: clients/encore/specs_planning/_internal/old-site-baseline/discount-optimization-2026-08-10.md
jira_tickets: [NM-2917, NM-2918, NM-3063, NM-3066, NM-3067, NM-3210, NM-3340]
tc_band: TC-DOP-OPT-001.. (Tab 1 — Locations), TC-DOP-EXM-001.. (Tab 2 — Exemptions)
coverage_mode: quick
depth: L1 (QUICK) — L2/L3 deferred to a subsequent DEEP catalog
---

# Field-Case Catalog — Discount Optimization (2026-08-18)

Two axes per `field-case-generation.md`:
**Axis 1** = per-field-type cases (§2).
**Axis 2** = surface-behavior cases (§3, LR-065), QUICK depth only.

**Governing inventories**:
- Tab 1: `discount-optimization-locations-2026-08-11.md` — 2154-row grid; fields: ID (read-only), Location Name (read-only), Allow Special Rate (toggle button), Special Rate Start Date (date input + calendar picker); plus Search, Save, Add, and per-row Remove controls.
- Tab 2: `discount-optimization-exemption-2026-08-11.md` — 29-row grid; fields: Service Type (read-only label), Exempt (checkbox per row); plus Search, Save, and Cancel controls.

**Column label note**: The inventories record the original column names `No Implied Discount` / `No Implied Start`; the live app re-labelled them to `Allow Special Rate` / `Special Rate Start Date` (2026-08-12, re-verified 2026-08-18). This catalog uses the current live labels throughout.

---

## TAB 1 — Discount Optimization (Locations Grid)

### Field: ID column

**Inventory source**: `discount-optimization-locations-2026-08-11.md`, field `locationNo`, read-only text cells.
**§2 field type**: Read-only label (no editable input).

| Family | TC | Coverage |
|---|---|---|
| render-state | TC-DOP-OPT-003 | Locations grid rows show ID and Location Name values |
| save-cycle | out-of-scope: ID is application-generated read-only text; no save-cycle dimension exists |
| BVA | out-of-scope: ID is application-generated read-only text; no boundary condition exists for user input |
| negative | out-of-scope: ID is application-generated read-only text; no user input is possible |

---

### Field: Location Name column

**Inventory source**: `discount-optimization-locations-2026-08-11.md`, field `locationName`, read-only text cells.
**§2 field type**: Read-only label (no editable input).

| Family | TC | Coverage |
|---|---|---|
| render-state | TC-DOP-OPT-003 | Locations grid rows show ID and Location Name values |
| save-cycle | out-of-scope: Location Name is application-managed read-only text; no save-cycle dimension exists |
| BVA | out-of-scope: Location Name is application-managed read-only text; no boundary condition exists for user input |
| negative | out-of-scope: Location Name is application-managed read-only text; no user input is possible |

---

### Field: Allow Special Rate (toggle button per row)

**Inventory source**: `discount-optimization-locations-2026-08-11.md`, field `allowSpecialRate`, role `button` (`No implied discount for <Location>` per row).
**§2 field type**: Checkbox (native + Radix) — boolean toggle rendered as a per-row toggle button.

| Family | TC | Coverage |
|---|---|---|
| Positive — toggle on enables Save | TC-DOP-OPT-020 | Allow Special Rate toggle — toggling on enables Save |
| Positive — toggle off re-disables Save | TC-DOP-OPT-021 | Allow Special Rate toggle — reverting the toggle re-disables Save |
| toggle on→save+reload persists | TC-DOP-OPT-050 | Save — disabled when pristine, enabled on valid change, persists after reload |
| Save stays disabled on pristine | TC-DOP-OPT-022 | Allow Special Rate toggle — Save stays disabled on pristine load |
| regression lock | TC-DOP-OPT-072 | Allow Special Rate toggle enables Save — regression lock |
| revert-to-original disables Save (LR-009) | TC-DOP-OPT-021 | Reverting the toggle re-disables Save |
| BVA | out-of-scope: toggle is binary on/off; no numeric boundary condition applies to a boolean control |
| negative | out-of-scope: toggle is binary; no invalid input is possible via the affordance |

---

### Field: Special Rate Start Date (date input + calendar picker)

**Inventory source**: `discount-optimization-locations-2026-08-11.md`, fields `startAllowSpecialRate` — `input` (`Select date`) + `button` (`Open calendar`).
**§2 field type**: Date / offset.

| Family | TC | Coverage |
|---|---|---|
| Positive — valid date accepted, Save enabled | TC-DOP-OPT-030 | Valid date accepted and Save enabled |
| Positive — calendar picker selects date | TC-DOP-OPT-032 | Calendar picker opens and selects a date |
| Positive — manual entry segments correct | TC-DOP-OPT-033 | Manual entry does not shift digits between segments |
| BVA — invalid format rejected (red border) | TC-DOP-OPT-031 | Invalid entry shows red border and Save stays disabled (§2.1: announced via red border + icon; Tab-blur escapability NEEDS-LIVE-CONFIRM) |
| save-cycle — valid date persists after reload | TC-DOP-OPT-092 | Special Rate Start Date date change persists after reload |
| negative — invalid offset sign per LR-008 | deferred-to-DEEP: LR-008 sign-constraint applicability requires live verification; field's positive/negative offset classification cannot be determined from the inventory alone |
| negative — cross-field Delivery < Prep (NM-1264) | out-of-scope: NM-1264 applies to order-form date-offset fields; no cross-field partner date exists on this location-settings surface |

---

### Control: Search input (Tab 1)

**Inventory source**: `discount-optimization-locations-2026-08-11.md`, field `struct:input|Search by location number or location na`, role `input`.
**§2 field type**: Plain text (search/filter input).

| Family | TC | Coverage |
|---|---|---|
| Positive — filters grid; clear restores; no-match empty state | TC-DOP-OPT-005 | Search filters the grid; clearing restores all rows; no-match shows empty state |
| Positive — case-insensitive | TC-DOP-OPT-006 | Search is case-insensitive on location name |
| Positive — deactivated locations returned | TC-DOP-OPT-070, TC-DOP-OPT-071 | Search includes and returns deactivated locations |
| BVA — empty input clears filter | TC-DOP-OPT-005 | Clearing the search restores all rows |
| negative (special chars, whitespace, very long) | deferred-to-DEEP: search-input negative/BVA cases require live filter-input boundary testing; deferred as L2 DEEP |

---

### Control: Save button (Tab 1)

**Inventory source**: `discount-optimization-locations-2026-08-11.md`, field `struct:button|Save` (scoped to Tab 1 panel).

| Family | TC | Coverage |
|---|---|---|
| Disabled on pristine | TC-DOP-OPT-022, TC-DOP-OPT-050 | Save stays disabled on pristine |
| Enabled on valid change | TC-DOP-OPT-020, TC-DOP-OPT-050 | Toggle or date change enables Save |
| Persists changes after reload (Tier 1) | TC-DOP-OPT-050, TC-DOP-OPT-092 | Saved values survive reload |
| Multiple dirty rows all persist | TC-DOP-OPT-052 | Two dirty rows both persist after a single save |
| Enabled after Add | TC-DOP-OPT-051 | Save remains enabled after adding a location |
| Rejected save surfaces failure | TC-DOP-OPT-090 | Rejected save surfaces the failure and keeps the change pending |
| Dirty → Navigate-Away (tab switch) → Prompt | TC-DOP-OPT-067, TC-DOP-OPT-068 | Unsaved-changes prompt fires on tab switch with pending edit |

---

### Control: Add button (Tab 1)

**Inventory source**: `discount-optimization-locations-2026-08-11.md`, field `struct:button|Add`.

| Family | TC | Coverage |
|---|---|---|
| Opens add affordance; Cancel discards cleanly | TC-DOP-OPT-060 | Add opens the add affordance; Cancel discards cleanly |
| Button visible on tab | TC-DOP-OPT-061 | Add button is present and visible on the Locations tab |
| Cancelling incomplete Add leaves Save disabled | TC-DOP-OPT-091 | Cancelling an incomplete Add leaves Save disabled |
| Add full save path (commit + persist) | deferred-to-DEEP: committing an Add and verifying row persists after reload requires a write; deferred to DEEP to limit QUICK data side-effects |

---

### Control: Per-row Remove button (Tab 1)

**Inventory source**: `discount-optimization-locations-2026-08-11.md`, field `struct:button|Remove <Location>` (archetype across rows).

| Family | TC | Coverage |
|---|---|---|
| Confirmation dialog; Cancel preserves row | TC-DOP-OPT-040 | Per-row remove — confirmation dialog appears; Cancel leaves the row intact |
| Save enables after cancelling remove | TC-DOP-OPT-041 | Save enables after cancelling remove |
| Destructive path (confirm + persist) | deferred-to-DEEP: committing a remove and verifying row absent after reload requires irreversible data write; deferred to avoid QUICK data side-effects |

---

## TAB 2 — Special Rate Exemptions by Service Type

### Field: Service Type column (read-only label)

**Inventory source**: `discount-optimization-exemption-2026-08-11.md`, field `struct:th|Service Type`, read-only label cells per row.
**§2 field type**: Read-only label.

| Family | TC | Coverage |
|---|---|---|
| render-state | TC-DOP-EXM-001 | Tab activates and surface renders with expected columns and rows |
| save-cycle | out-of-scope: Service Type is read-only; no editable save-cycle dimension exists |
| BVA | out-of-scope: Service Type column carries no user-editable input |
| negative | out-of-scope: Service Type column carries no user-editable input |

---

### Field: Exempt checkbox per row (29 rows)

**Inventory source**: `discount-optimization-exemption-2026-08-11.md`, fields `struct:checkbox|Exempt <ServiceType>` (29 rows), internal field name `isSpecialRateAllowed`, role `checkbox`.
**§2 field type**: Checkbox (native + Radix) — boolean toggle per row.

| Family | TC | Coverage |
|---|---|---|
| Positive — toggle on (exempt) | TC-DOP-EXM-020 | Save cycle — enabled by valid change, change persists after reload; Cancel discards |
| Positive — toggle off (un-exempt) | TC-DOP-EXM-020 | Same save-cycle case covers both directions |
| toggle on→save+reload persists | TC-DOP-EXM-020 | Change persists after reload |
| Save disabled on pristine | TC-DOP-EXM-002 | Save is disabled when no changes have been made |
| Cancel discards multiple simultaneous changes | TC-DOP-EXM-021 | Cancel discards multiple simultaneous checkbox changes |
| revert-to-original disables Save (LR-009) | deferred-to-DEEP: dedicated revert-disables-Save probe for checkbox; deferred to keep QUICK scope minimal |
| BVA | out-of-scope: Exempt is a binary checkbox; no numeric boundary condition applies |
| negative | out-of-scope: Exempt is a binary checkbox; no invalid input is possible via the affordance |

---

### Control: Search input (Tab 2)

**Inventory source**: `discount-optimization-exemption-2026-08-11.md`, field `struct:input|Search by service type`, role `input`.
**§2 field type**: Plain text (search/filter input).

| Family | TC | Coverage |
|---|---|---|
| Positive — filters rows; clearing restores list; no-match empty state | TC-DOP-EXM-010 | Search box filters service-type rows; clearing restores the full list; no-match shows empty state |
| Positive — case-insensitive | TC-DOP-EXM-011 | Search is case-insensitive |
| BVA — empty input clears filter | TC-DOP-EXM-010 | Clearing the search restores full list |
| negative (special chars, whitespace) | deferred-to-DEEP: search-input negative/BVA cases require live filter-input boundary testing; deferred as L2 DEEP |

---

### Control: Save button (Tab 2)

**Inventory source**: `discount-optimization-exemption-2026-08-11.md`, field `struct:button|Save` (scoped to Tab 2 panel).

| Family | TC | Coverage |
|---|---|---|
| Disabled on pristine | TC-DOP-EXM-002 | Save is disabled when no changes have been made |
| Enabled on valid change + persists | TC-DOP-EXM-020 | Save cycle — enabled by valid change, change persists after reload |

---

### Control: Cancel button (Tab 2)

**Inventory source**: `discount-optimization-exemption-2026-08-11.md`, field `struct:button|Cancel` (scoped to Tab 2 panel).

| Family | TC | Coverage |
|---|---|---|
| Discards uncommitted changes | TC-DOP-EXM-020 | Cancel discards (part of save-cycle case) |
| Discards multiple simultaneous changes | TC-DOP-EXM-021 | Cancel discards multiple simultaneous checkbox changes |

---

## Axis 2 — Surface-Behavior Cases (§3 families, LR-065)

### OPT — Tab 1 (Locations Grid, 2154 rows, no pagination)

| Family | Applicable | TC | QUICK must-assert |
|---|---|---|---|
| **render-state** | YES | TC-DOP-OPT-002 | Grid renders all four column headers (ID, Location Name, Allow Special Rate, Special Rate Start Date) and non-zero rows after the ~22 s first paint; skeleton-to-data transition is the defining behaviour |
| **sorting** | YES | TC-DOP-OPT-010, TC-DOP-OPT-011, TC-DOP-OPT-012, TC-DOP-OPT-013 | Each of the 4 column headers opens a sort menu (Sort ascending / Sort descending); activating sort reorders the grid (content-anchored assertion, never row index) |
| **empty-vol** | YES | TC-DOP-OPT-005 | Search-to-no-match is the reachable empty state; 2154 rows is the volume case — asserted as non-zero pattern, not a frozen exact count (LR-022) |
| **result-fidelity** | YES | TC-DOP-OPT-002 | Grid renders the row set returned by the list API (non-zero; known content rows visible) |
| **persistence** | YES | TC-DOP-OPT-050, TC-DOP-OPT-052, TC-DOP-OPT-092 | Saved changes survive page reload (Tier 1 per §1) |
| **pagination** | NO | — | `out-of-scope: pagination=grid renders all 2154 rows at once via skipPagination=true; no pager observed on current or legacy site` |
| **combination** | NO | — | `out-of-scope: combination=only one filter control (search box) exists; no second filter or paginate dimension available to combine` |

**Surface_Family**: render-state (QUICK) — TC-DOP-OPT-002
**Surface_Family**: sorting (QUICK) — TC-DOP-OPT-010, TC-DOP-OPT-011, TC-DOP-OPT-012, TC-DOP-OPT-013
**Surface_Family**: empty-vol (QUICK) — TC-DOP-OPT-005
**Surface_Family**: result-fidelity (QUICK) — TC-DOP-OPT-002
**Surface_Family**: persistence (QUICK) — TC-DOP-OPT-050

---

### EXM — Tab 2 (Special Rate Exemptions Grid, 29 rows, no pagination)

| Family | Applicable | TC | QUICK must-assert |
|---|---|---|---|
| **render-state** | YES | TC-DOP-EXM-001 | Tab activates; surface renders columns Service Type and Exempt plus all service-type rows |
| **result-fidelity** | YES | TC-DOP-EXM-010 | Grid renders all service-type rows (non-zero; known rows visible — exact count not frozen per NM-3340) |
| **empty-vol** | YES | TC-DOP-EXM-010 | Search-to-no-match is the reachable empty state; no-results message present |
| **persistence** | YES | TC-DOP-EXM-020 | Saved checkbox change survives page reload (Tier 1 per §1) |
| **sorting** | NO | — | `out-of-scope: sorting=no sortable column headers were enumerated on Tab 2; column headers carry no sort affordance` |
| **pagination** | NO | — | `out-of-scope: pagination=29 rows render at once via skipPagination=true; no pager observed on Tab 2` |
| **combination** | NO | — | `out-of-scope: combination=only one filter control (search box) exists; no second dimension to combine with` |

**Surface_Family**: render-state (QUICK) — TC-DOP-EXM-001
**Surface_Family**: result-fidelity (QUICK) — TC-DOP-EXM-010
**Surface_Family**: empty-vol (QUICK) — TC-DOP-EXM-010
**Surface_Family**: persistence (QUICK) — TC-DOP-EXM-020

---

## State-Transition Coverage (both tabs, §3 model)

| Transition | TC |
|---|---|
| Clean → Dirty (toggle) | TC-DOP-OPT-020 |
| Clean → Dirty (date) | TC-DOP-OPT-030 |
| Dirty → Saving → Save-OK | TC-DOP-OPT-050, TC-DOP-OPT-092, TC-DOP-EXM-020 |
| Dirty → Saving → Save-Failed | TC-DOP-OPT-090 |
| Edit-to-original-value → Save-disabled (LR-009) | TC-DOP-OPT-021 |
| Dirty → Tab-Switch → Prompt → Stay | TC-DOP-OPT-067 |
| Dirty → Tab-Switch → Prompt → Leave | TC-DOP-OPT-067, TC-DOP-OPT-068 |
| Clean → Tab-Switch → No prompt | TC-DOP-OPT-065, TC-DOP-OPT-066 |
| Dirty → Cancel → Clean (Tab 2) | TC-DOP-EXM-020, TC-DOP-EXM-021 |
| Pending edit survives scroll out of view | TC-DOP-OPT-053 |

---

## L2/L3 DEEP deferral summary

- `deferred-to-DEEP: Special Rate Start Date LR-008 sign-constraint verification — cannot classify positive/negative offset from inventory alone; requires live BVA probe`
- `deferred-to-DEEP: Search Tab 1 negative cases (special chars, whitespace-only, very long string) — L2 filter-input BVA`
- `deferred-to-DEEP: Search Tab 2 negative cases (special chars, whitespace-only) — L2 filter-input BVA`
- `deferred-to-DEEP: Per-row Remove destructive path (confirm + persist) — irreversible data write avoided in QUICK run`
- `deferred-to-DEEP: Add button full save path (commit + persist after reload) — write avoided in QUICK run`
- `deferred-to-DEEP: Exempt checkbox revert-to-original-disables-Save dedicated case (LR-009 probe, Tab 2)`
- `deferred-to-DEEP: Allow Special Rate revert-to-original dedicated LR-009 sequence (toggle-on/off/revert chain)`
- `deferred-to-DEEP: Sorting exhaustive pairwise per-column asc/desc matrix for all 4 OPT columns`
- `deferred-to-DEEP: Volume/scroll integrity — off-screen OPT row readable by content anchor after scroll (virtualized grid)`
- `deferred-to-DEEP: Persistence of sort/search state across reload and browser-back — OPT and EXM tabs`

---

## Totals

- **Tab 1 (OPT) Axis 1 — fields/controls mapped**: 6 (ID, Location Name, Allow Special Rate, Special Rate Start Date, Search, Save, Add, Remove)
- **Tab 1 (OPT) Axis 2 SBC — families covered**: 5 (render-state, sorting, empty-vol, result-fidelity, persistence); 2 out-of-scope (pagination, combination)
- **Tab 2 (EXM) Axis 1 — fields/controls mapped**: 5 (Service Type, Exempt checkbox, Search, Save, Cancel)
- **Tab 2 (EXM) Axis 2 SBC — families covered**: 4 (render-state, result-fidelity, empty-vol, persistence); 3 out-of-scope (sorting, pagination, combination)
- **Existing TCs cross-referenced — OPT**: TC-DOP-OPT-001..006, 010..013, 020..022, 030..033, 040..041, 050..053, 060..061, 065..068, 070..072, 090..092
- **Existing TCs cross-referenced — EXM**: TC-DOP-EXM-001, 002, 010, 011, 020, 021
- **deferred-to-DEEP entries**: 10
- **out-of-scope entries**: 12
