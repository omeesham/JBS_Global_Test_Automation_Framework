# Field Inventory — Auto Add-On (Location Settings)

**Module**: auto-addon
**Client**: encore
**MCP_Session_Date**: 2026-06-11
**MCP_Session_Tool**: Playwright CLI
**MCP_Tool_Reason**: Catalog walkthrough (5 checkboxes) + unattended save-cycle; token-efficient grep-over-disk; no visual/CSS assertion (LR-038 v2; LR-054 Table 2).
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location
**Test_Entity**: Office 1604 (Parker Palm Springs)

---

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location`

Tabs observed (Radix tablist — top-level + sub-tabs):

- Top-level: `Basic Information` (active by default), `Location Management History`
- Sub-tabs (under Basic Information): `Local Information` (active by default), `Currency`, `Pricing`, `Account and Address`, `Legal`, `Notes`, `Shared Setup Locations`, **`Auto Add-On`**

Auto Add-On activation: real Playwright `click` on `[data-testid="location-settings-sub-tab-auto-add-on"]` (raw-JS `.click()` does NOT flip `aria-selected` — Radix needs the full pointer sequence; navigation.md §B). Post-`goto` render is async — poll for the checkbox testid before asserting.

---

## Live-state caveat

| Field | Live (2026-06-11) | Documented default | Drift reason |
|---|---|---|---|
| Encore Music | checked | checked (`AUTO_ADDON_DEFAULTS`) | — |
| Wireless Presenter | checked | checked | — |
| Express Content Design Session | unchecked | unchecked | — |
| Wordly | checked | checked | — |
| Labor | checked | checked | — |

No drift observed — live matches `AUTO_ADDON_DEFAULTS` / REQUIREMENTS-level expectation. (1604 restored to this exact default state at end of walk after the save-cycle observation.)

---

## Field Inventory

### Auto Add-On checkbox items (location 1604)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Encore Music | `location-settings-checkbox-auto-add-on-false_encore music` | checkbox | checked (`aria-checked="true"`) | none — any toggle valid | always enabled | none | testid `{isDefault}_{name}` pattern; `isDefault=false` |
| Wireless Presenter | `location-settings-checkbox-auto-add-on-false_wireless presenter` | checkbox | checked | none | always enabled | none | `isDefault=false` |
| Express Content Design Session | `location-settings-checkbox-auto-add-on-false_express content design session` | checkbox | unchecked (`aria-checked="false"`) | none | always enabled | none | `isDefault=false`; the only default-unchecked item |
| Wordly | `location-settings-checkbox-auto-add-on-false_wordly` | checkbox | checked | none | always enabled | none | `isDefault=false` |
| Labor | `location-settings-checkbox-auto-add-on-true_labor` | checkbox | checked | none | always enabled | none | `isDefault=`**`true`** — the only `true_` testid; the `true_`/`false_` prefix encodes the item's isLabor/default flag |

No per-item extra fields (no quantity, no rate, no sub-config) — each item is a single boolean checkbox. Item names in the testid are LOWERCASE WITH SPACES (not kebab-case).

`chkAutoAddonAll` (`[data-testid^="location-settings-checkbox-auto-add-on-"]`) matched exactly 5 on 1604.

---

## Labels + Section Names

**Auto Add-On — section headings (top-down)**:

- (no section heading — the tabpanel renders the 5 checkbox rows directly inside `[data-testid="location-settings-sub-tab-content-auto-add-on"]` / `[data-testid="location-settings-form-auto-add-on"]`)

Checkbox labels verbatim: "Encore Music", "Wireless Presenter", "Express Content Design Session", "Wordly", "Labor".

---

## Save-cycle observations

**Save button behavior**:

- Default state on fresh load: **disabled**
- Enables when: any checkbox changes from its server-saved state (smart form diff — reverting to saved state RE-DISABLES Save; verified live by toggle→enable, and the existing TC-005 asserts revert→disable)
- Disables when: save completes successfully, OR form reverts to baseline
- testid: `location-settings-btn-save` (shared left-panel Save button)

**Save dialog**:

- Triggered by: click of Save button (with at least one pending change)
- testid: `(none)` — `[role="alertdialog"]`, no data-testid (target via `:has(h2:text-is("Save Changes"))`)
- Title (verbatim): "Save Changes"
- Body (verbatim): "Are you sure you want to save the changes?"
- Buttons (in order, verbatim): "Cancel", "Ok"

**Post-save toast**:

- Region testid: `toastLocalInfoUpdated` (canonical in `local-info.ts`; page object waits on it)
- Text (verbatim): "Local information updated" (carried from 2026-03-24 MCP log; the spec's TC-008 asserts the toast appears live — passing spec = live proof)
- Duration: transient

**Dirty-state behavior** (LR-026):

- **Sub-tab switch** with dirty form: switches **silently** — NO "Unsaved changes" dialog (TC-012 asserts this; re-confirmed live)
- **Full page navigation away** (e.g., sidebar Home) with dirty form: opens "Unsaved changes" alertdialog
- Alertdialog title (verbatim): "Unsaved changes" (lowercase 'c')
- Alertdialog body (verbatim): "Are you sure you want to leave this view? Any unsaved changes will be lost."
- Buttons (in order, verbatim): "Stay", "Discard"
- The app fires a native `beforeunload`; the page object suppresses it (`window.onbeforeunload=null` + `stopImmediatePropagation`, L140-145) so the in-app React routing-guard dialog mounts instead of the browser's native prompt.

---

## Known App Bugs

No app bugs identified in this session. (Round-trip persistence confirmed: ECDS check→Save→Ok→reload still checked; uncheck→Save→Ok→reload back to unchecked. Save enables/disables per smart diff. No silent no-op, no 4xx/5xx.)

---

## Staleness signal

- **Last verified**: 2026-06-11
- **Fresh-until**: 2026-06-25
- **Stale-after**: 2026-07-11
- **Refresh triggers**: Encore release announcement; MODULE_REGISTRY.md schema change; generator spot-check disagreed with this artifact; client-flagged DOM change to the Auto Add-On tab.

---

## Network-request evidence

| Action | API call(s) observed | Status | Inference |
|---|---|---|---|
| Open Auto Add-On tab | `GET /navigator/api/core/auto-addon-types?countryId=1` | 200 | **item list is COUNTRY-scoped** (`countryId=1`=USA → 5 items). Constant within a country, NOT per-location. Corroborates user-fact #1; explains NM-1462/64/65 as country-scoped (not testable on the single US office 1604). |
| Toggle ECDS + Save + Ok | `PUT /navigator/api/location/update-properties` 200 + `POST /navigator/api/location/pricebook/upsert-location-pricebook` 200 | 200 | **save endpoint = `/navigator/api/location/update-properties`** (+ pricebook upsert). LR-056: any network listener MUST filter on `/navigator/api/`, NEVER the page URL — the `?_rsc=` GETs to `/locations/1604/{home,inbox,assets,...}` are Next.js App-Router RSC framework fetches (0-8s post-reload), not saves. |

---

## Known gaps

- **NM-1462 / NM-1464 / NM-1465** country-scoped Auto Add-On rules: NOT testable on office 1604 (single US office; item set is fixed at 5 for countryId=1). Recorded as an **LR-040(c) discussion item** (carried from the subsumed `SUBPLAN_DQU_18_F1g_AUTO_ADDON_AUDIT.md`). No UI path to a non-US country on 1604; no Jira repro; empty-everywhere → discussion-item, not a bug (feedback_discussion_item_not_bug). Pick-up: a future multi-country test office, out of this subplan's 1604-only scope (user-fact #3).
- **LM History rows from Auto Add-On saves**: user-fact (Rutvik 2026-06-11) = Auto Add-On saves produce **NO Location Management History rows**, treated as truth with provenance. One opportunistic glance was NOT performed as a clean proof because the shared CI-active 1604's 87-col LM History interleaves rows from concurrent saves (and my own 2 walk-saves), making single-row isolation of an auto-addon-only save unreliable — consistent with the subplan's "no history workstream either way." No HIST workstream, no per-column tests.

---

## Provenance (user-facts, Rutvik 2026-06-11 — treat as truth)

1. Item list is exactly 5 for every location; does not mutate per location. → corroborated live: country-scoped loader + nav2 item-list parity (same 5). **Kills TC-016's "location-specific" premise.**
2. Auto Add-On saves produce NO LM-History rows. → recorded here; no workstream.
3. Scope = office 1604 only; multi-office observation OUT.
