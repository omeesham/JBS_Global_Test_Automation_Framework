# Field Inventory — Discount Matrix: Search Criteria (CRT)

**Module**: discount-matrix-criteria
**Client**: encore
**MCP_Session_Date**: 2026-08-25
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: Unattended catalog walk over the resting state with grep-over-disk snapshots; no visual/CSS assertion and no fresh-passkey need, so LR-038 v2 selects the CLI path.
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/discount-matrix
**Test_Entity**: Office 1604
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/discount-matrix-2026-08-25.md
**Walk_Mode**: quick

Coverage_Ratio: 17/17 (100%) — the resting-state denominator: 11 shared-chrome controls (criteria bar + tab strip, present in all three tab states) plus the 6 Company Matrix rows, which are out-of-scope because NM-3343 owns that tab. 30 cases authored (TC-DSM-CRT-001 … -030). State scoping (recorded 2026-08-27): the CRT band drives the bar on the LANDING tab only — its interaction with the other two tab states is covered by the sibling bands (TC-DSM-RWP-025/-026, TC-DSM-LOA-012/-013; probes `dsm-critbar-rwp-probe.json` / `dsm-critbar-loa-probe.json`, which also measured the Country→Currency cascade the CRT rows do not assert).
Completion_Record: reports/walk-coverage/dsm-crt-skelgate.json (status=complete, elements=17)
Walk_State: module=discount-matrix-criteria walked=[resting]
CrossCheck: clean — both A△B review-set elements in this state are classified (see Coverage Manifest notes)
jira_tickets: [NM-3530, NM-3485, NM-3475, NM-3441, NM-3440, NM-3435, NM-3391, NM-3294, NM-3293, NM-3275, NM-3256, NM-3253, NM-3238, NM-3234, NM-3232, NM-3230, NM-3229, NM-3062]
baselineScope: complete

> **Restructure note (2026-08-27)**: this artifact was split out of the module-wide
> `discount-matrix-2026-08-25.md`, which covered all three tabs in one file. Every other module in
> this client pairs one inventory per submodule (matching its test-case file), so the module-wide
> form was the outlier. Content, dates, denominators and dispositions are carried over unchanged
> from the 2026-08-25 walk; only the file boundary moved. The sibling artifacts are
> `discount-matrix-region-weekly-peaks-2026-08-25.md` and
> `discount-matrix-location-activation-2026-08-25.md`.

---

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/discount-matrix` — single route; all three sub-tabs share it, and the criteria bar sits above all of them.
  - **Company Matrix** — the default panel on load. Activated by `role=tab, name="Company Matrix"`. **Out of scope (NM-3343).**
  - The two sibling tabs (Region Weekly Peaks, Location Activation) have their own artifacts.

## Live-state caveat

| Field | Live (2026-08-25) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Business Tier | `Standard` | *(the plan's 2026-07-31 screenshot recorded it **empty**)* | The screenshot was read before hydration completed. Hydration on this surface finishes at t=91–100s; anything read earlier shows unpopulated controls. Not app drift — an observation error, corrected here. |
| GAV Discount Threshold | `0%` at the 17:31 machine walk, `15%` on a live read the same evening | *(no assertable default)* | The field keeps whatever the last save left. Read-then-restore, never assert a fixed value. |

## Field Inventory

### Search Criteria (CRT) — shared chrome, present in all three tab states

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Country | `(none) — use text content` | Dropdown / combobox (Radix) | `United States` | not probed (QUICK depth) | enabled at rest | re-keys the grid on change | `<button role="combobox">` with no accessible name — `getByRole('combobox', {name})` cannot resolve it. Structural anchor only. LR-029 row 1. |
| Currency | `(none) — use text content` | Dropdown / combobox (Radix) | `USD` | not probed (QUICK depth) | enabled at rest | re-keys the grid on change | Same nameless-combobox constraint. LR-029 row 2. |
| Business Tier | `(none) — use text content` | Dropdown / combobox (Radix) | `Standard` | not probed (QUICK depth) | enabled at rest | re-keys the grid on change | Same nameless-combobox constraint. LR-029 row 3. Corrected from "empty" — see Live-state caveat. |
| GAV Discount Threshold | `(none) — use name="gavDiscountThreshold"` | Numeric / spinbutton — accepted range measured `0`–`100`, one decimal place, `type="text"` with `inputmode="decimal"` so no browser-level validation applies (probe 2026-08-25) | **No assertable default** — `0%` at the 17:31 machine walk, `15%` on a live read the same evening. The field keeps whatever the last save left; read-then-restore, never assert a fixed value. | not probed (QUICK depth) | enabled at rest | Header Save persists this field only | The **only** CRT control with a stable non-structural locator. Percentage-formatted — never `fill()` it, type character by character. Last control to hydrate (t=91–100s); it is this surface's readiness marker. |
| Save (criteria) | `(none) — use text content` | *(action — not one of the 13 field types)* | n/a | n/a | **disabled at rest** | enables on a criteria edit | `affordance: none` — observed disabled at rest in all three walked states. |
| Left-panel collapse toggle | `(none) — use text content` | *(action — not one of the 13 field types)* | n/a | n/a | enabled | none | Enumerated as `trigger-button` under a `skip` ancestor. `affordance: none` — page chrome, not module behaviour. |
| More information | `(none) — use aria-label="More information"` | *(action — not one of the 13 field types)* | n/a | n/a | enabled | none | Header info icon. `affordance: popover → More information` — **not opened** in this QUICK walk; the token records the expected shape only. Presence is covered by TC-DSM-CRT-013; opening the popover is on the opener frontier (see the frontier note below). |

## Labels + Section Names

- **Criteria bar (all tabs)**: "Discount Matrix" · "Country" · "Currency" · "Business Tier" · "GAV Discount Threshold" · "Save"
- **Tab strip**: "Company Matrix" · "Region Weekly Peaks" · "Location Activation"
- **Company Matrix** *(out of scope, NM-3343 — recorded only so tab-strip assertions have verbatim text)*: "Add Tier" · "Export" · "Import"

## Save-cycle observations

### Save button behavior
The criteria bar carries its own Save, independent of the two per-tab Saves. It is **disabled at rest** in every state walked, and it persists the GAV Discount Threshold only. No Save was pressed during this walk.

### Save dialog
**Not observed.** No save was executed during the walk, so no confirmation dialog was reached. Unknown, not absent. *(Established later by the authored cases: the threshold save commits without a confirmation dialog.)*

### Post-save toast
**Not observed.** Same reason.

### Dirty-state behavior
**Not observed** during the walk. No value was edited; dropdowns were opened and closed with Escape only. Application state is unchanged by this walk. The app-wide Angular save/dirty trap — Save disables optimistically on click while the dirty flag persists, so tab navigation still raises Unsaved — is documented for sibling modules on this app and should be assumed to apply here until probed.

## Observations

### Bugs / Defects
none — no defect was confirmed on the criteria bar during this walk or the same-day probes.

Per this client's standing policy, the criteria bar's missing accessible names and absent `data-testid` are **not** filed as bugs — they are recorded as a selector-strategy constraint and in the LR-029 report below.

### Suggestions / Improvements
- Add a `data-testid` to each of the four criteria controls. They are the module's single largest selector-stability risk and the only reason CRT cannot use role-based locators. Region Weekly Peaks already does this correctly (`region-weekly-peaks-year` / `-region`), which shows the pattern is available to the app team.

## LR-029 missing-testid report

Every control below was verified against live DOM by the enumerator on 2026-08-25, not from a static grep.

| Control | Surface | Has testid | Next-best stable anchor |
|---|---|---|---|
| Country / Currency / Business Tier | CRT | no | **none** — `<button role="combobox">` with no accessible name; structural path only |
| GAV Discount Threshold | CRT | no | `name="gavDiscountThreshold"` |
| Save (criteria) | CRT | no | text content |
| More information | CRT | no | `aria-label="More information"` |
| Left-panel collapse toggle | CRT | no | text content |

**Zero `data-testid` attributes exist anywhere on this module.** The three tab triggers carry stable Radix `id`s; nothing on the criteria bar has a non-structural anchor.

## Staleness signal

- **Last verified**: 2026-08-25
- **Fresh-until**: 2026-09-08
- **Stale-after**: 2026-09-24
- **Refresh triggers**: the criteria controls gain `data-testid` · the GAV threshold's accepted range changes from the measured `0`–`100` · hydration timing shifts such that the threshold no longer resolves within 180s · a fourth criteria control appears in the bar

## Coverage Manifest (machine-enumerated)

Machine denominator: **17** — the resting state. Provenance: `reports/walk-coverage/dsm-crt-skelgate.json` (17, resting).
Composition: 11 shared chrome + 6 Company Matrix.

All 17 rows below are dispositioned. **Coverage_Ratio: 17/17.**

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| `struct:button\|trigger-button\|skip/div/div/div/div/div` | button | 2026-08-25 | covered-by-TC: TC-DSM-CRT-014 |
| `struct:button\|More information\|div/div/div/div/div/div` | button | 2026-08-25 | covered-by-TC: TC-DSM-CRT-013 |
| `struct:combobox\|United States\|div/div/div/div/div/div` | combobox | 2026-08-25 | covered-by-TC: TC-DSM-CRT-002 |
| `struct:combobox\|USD\|div/div/div/div/div/div` | combobox | 2026-08-25 | covered-by-TC: TC-DSM-CRT-003 |
| `struct:combobox\|Standard\|div/div/div/div/div/div` | combobox | 2026-08-25 | covered-by-TC: TC-DSM-CRT-004 |
| `name:gavDiscountThreshold\|input` | input | 2026-08-25 | covered-by-TC: TC-DSM-CRT-011 |
| `struct:button\|Save\|div/div/div/div/div/div` *(A△B review)* | button | 2026-08-25 | covered-by-TC: TC-DSM-CRT-005 |
| `struct:tablist\|Company MatrixRegion Weekly PeaksLocatio\|…` *(A△B review)* | tablist | 2026-08-25 | out-of-scope: not-interactive — structural container only; the three tab triggers it holds carry the behaviour and are dispositioned individually below |
| `id:radix-_r_10_-trigger-company-matrix` | tab | 2026-08-25 | affordance-probed: affordance: navigation → Company Matrix panel · provenance: live · evidence: reports/walk-coverage/dsm-crt-skelgate.json (2026-08-25, base_state.atRest=[Company Matrix]) |
| `id:radix-_r_10_-trigger-region-weekly` | tab | 2026-08-25 | affordance-probed: affordance: navigation → Region Weekly Peaks panel · provenance: live · evidence: reports/walk-coverage/dsm-rwp--tab-region-weekly-peaks.json (2026-08-25, branches[0].ok=true addedKeys=20) |
| `id:radix-_r_10_-trigger-location-activation` | tab | 2026-08-25 | affordance-probed: affordance: navigation → Location Activation panel · provenance: live · evidence: reports/walk-coverage/dsm-loa--tab-location-activation.json (2026-08-25, branches[0].ok=true addedKeys=20) |
| `id:radix-_r_10_-content-company-matrix` | tabpanel | 2026-08-25 | out-of-scope: NM-3343 owns the Company Matrix panel under this plan's Scope lock; it is not read or written here |
| `struct:button\|Add Tier\|…content-company-matrix…` | button | 2026-08-25 | out-of-scope: NM-3343 owns this Company Matrix control under this plan's Scope lock; not read or written here |
| `struct:button\|Export\|…content-company-matrix…` | button | 2026-08-25 | out-of-scope: NM-3343 owns this Company Matrix control under this plan's Scope lock; not read or written here |
| `struct:button\|Import\|…content-company-matrix…` | button | 2026-08-25 | out-of-scope: NM-3343 owns this Company Matrix control under this plan's Scope lock; not read or written here |
| `struct:button\|Delete\|div/div/table/tbody/tr/td` | button | 2026-08-25 | out-of-scope: NM-3343 owns this Company Matrix tier-row control under this plan's Scope lock; not read or written here |
| `struct:button\|Edit\|div/div/table/tbody/tr/td` | button | 2026-08-25 | out-of-scope: NM-3343 owns this Company Matrix tier-row control under this plan's Scope lock; not read or written here |

### A△B review-set classification (CrossCheck)

Two of the module's six symmetric-difference elements belong to this state. Both are classified, so `CrossCheck: clean`:

| element | lens | classification |
|---|---|---|
| `Save` (criteria bar) | A∖B | Real control. One lens misses it because it is `disabled` at rest; the other reads it structurally. Kept in the denominator. |
| `tablist` | B∖A | Real container. Kept, and dispositioned out-of-scope as structural. |

The A lens under-reports controls that are `disabled` at rest — the single cause behind this class. Both elements are genuine and neither was dropped from the denominator.

### §3 surface families (LR-065)

The criteria bar carries **no grid, list, table, or result surface** — it is a row of single-value controls above the tab strip, and the only table in this walked state (the Company Matrix tier grid) is out-of-scope under NM-3343. LR-065 therefore contributes no surface families to this submodule. The two sibling artifacts carry the module's grid surfaces.

### Opener frontier (state-graph exhaustion)

Recorded 2026-08-26 per the acceptance requirement that the frontier state be written down either way — it is **not empty**:

- **Out-of-module**: `dsm-crt-skelgate.json` `stateGraphExhaustion: {containersFound: 23, neverOpened: 23}` — all 23 are app-shell chrome (office switcher, Home, Inbox, Actions, Commissions, Tax menus). Enumerated, deliberately not opened: page chrome, outside the module denominator.
- **In-module unopened opener**: the **More-information popover** — presence asserted by TC-DSM-CRT-013; opening it is DEEP-tier.
