# Field Inventory — Location Settings Left Panel (Basic Information)

**Module**: left-panel-basic-information
**Client**: encore
**MCP_Session_Date**: 2026-06-03
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: Playwright CLI (`@playwright/cli` v0.1.8, binary `playwright-cli`, session `-s=encore`, storageState `clients/encore/.auth/encore-state.json` refreshed this session). Unattended catalog walk of the shared left-panel card (14 fields + 4 live dropdowns + Country cascade) — token-efficient CLI over Chrome per LR-038 v2 (no visual/CSS work, no live pause step). The `MCP_Session_Tool` enum still reads "Playwright MCP" pending SP-PWC2-05 value-normalization for the CLI (browser-tool.md legacy footnote); the CLI is literally "run playwright mcp commands from terminal".
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location
**Test_Entity**: Office 1604 (Parker Palm Springs)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/left-panel-basic-information-2026-06-03.md

> Walk performed under SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC Phase 1 **HUNTER** phase identity; umbrella session identity OWNER (the enum's accepted value). Content renders inside a nested shadow root — `document.querySelector` does NOT pierce; a recursive deep-pierce helper (`deep(root,sel,acc)` traversing `.shadowRoot`) was used for `eval` reads, and Playwright `click`/`fill`/`snapshot` pierce automatically. **No save was committed** against office 1604; the Country-cascade probe was reverted via a native unsaved-changes dialog (accept = leave/discard) → server state intact (verified Country=United States / Region=Palm Springs / Save disabled post-revert).

---

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location` — Location Settings. The **left panel** (location-attributes card) is shared across all sub-tabs; **Basic Information** is the default landing. Navigation builds URL as `{base}locations/{office}/settings/location` (base-page `navigateToSubTab`).

---

## Live-state caveat

| Field | Live (2026-06-03) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Live Date | June 15th, 1990 | "May 8, 2007" (24-TC MD) | MD value stale; old-site nav2 1604 shows 05/12/2007 — value differs by site/data, NOT an app regression. New-site June 15th 1990 is truth. |
| Line Of Business | Hotel Services Division (**disabled**) | "editable, 3 options" (subplan claim) | **Plan claim WRONG** — LOB is read-only/disabled on BOTH new-site AND old-site. Re-classified read-only. |
| Servicing Branch Office | (unselected — "Select Servicing Branch Office") | (populated, old-site) | new-site 1604 has no servicing branch selected; old-site had one selected. Data difference. |
| Servicing Branch option count | 218 | 215 (subplan claim) | live count is 218 (not virtualized — first+last both captured); subplan count stale by 3. |
| Office | (empty — placeholder "No office available") | 1604 (old-site) | new-site `primary-location-no` renders empty for 1604; Local Office shows 1604. |
| GL Service Divisions | (absent) | (present, old-site, 7 opts) | field exists on old-site only; intentionally removed on new-site (BL-DIV-3). Out of left-panel scope. |

---

## Field Inventory

**Field-state correction (LR-020):** the subplan assumed **5 read-only + 9 editable** with Line Of Business editable. Live reality is **6 read-only + 8 editable** — Line Of Business is `[disabled]`/read-only. The 9th "editable" selector the subplan asked for (LOB) is a read-only getter, not a setter.

### Read-only fields (6)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Office | location-settings-input-primary-location-no | textbox | (empty) — placeholder "No office available" | n/a | always disabled | none | primary location no; renders empty for 1604 |
| Local Office | location-settings-input-location-no | textbox | 1604 | n/a | always disabled | none | — |
| Line Of Business | (none) — use label-anchored `div:has(> label:text-is("Line Of Business")) button[role="combobox"]` | combobox (Radix) | Hotel Services Division | n/a | **always disabled** | none | **CORRECTED to read-only — subplan claimed editable** |
| Pay To Address | location-settings-input-pay-to-name | textbox | Encore | n/a | always disabled | none | — |
| eCommerce Active | location-settings-checkbox-use-ecommerce | checkbox (Radix button[role="checkbox"]) | aria-checked=true | n/a | always disabled | none | — |
| Enable Productions Orders | location-settings-checkbox-enable-productions-orders | checkbox (Radix button[role="checkbox"]) | aria-checked=true | n/a | always disabled | none | — |

### Editable fields (8)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Local Office Name | location-settings-input-location-name | textbox | Parker Palm Springs | (none observed) | always enabled | none | dirties form on edit |
| Active | location-settings-checkbox-active | checkbox (Radix button[role="checkbox"]) | aria-checked=true | none | always enabled | none | toggle |
| Live Date | (none) — use label-anchored `div:has(> label:text-is("Live Date")) button:has-text("Open popover")` | button → date popover | June 15th, 1990 | valid date | always enabled | none | opens a calendar popover; value text "June 15th, 1990" |
| Tax Mode | (none) — use label-anchored `div:has(> label:text-is("Tax Mode")) button[role="combobox"]` | combobox (Radix) | US | required (Save disabled when TaxModeID=0) | always enabled | **cleared when Country changes** | 2 options: US, International |
| Country | location-settings-select-country | combobox (Radix) | United States | required | always enabled | **changing clears Tax Mode + Region** | 4 options: United States, Mexico, Canada, Bahamas |
| Region | location-settings-select-region | combobox (Radix) | Palm Springs | required | always enabled | **cleared when Country changes** | 59 options (Alabama…West Florida) |
| Servicing Branch Office | location-settings-select-servicing-branch | combobox (Radix) | (unselected) | (none observed) | always enabled | none | **218 options** — LR-025 large-dropdown retry |
| Union | location-settings-checkbox-is-union | checkbox (Radix button[role="checkbox"]) | aria-checked=false | none | always enabled | none | toggle |

**Save button**: `location-settings-btn-save` — `[disabled]` when the form is pristine; enables when dirtied AND valid.

---

## Labels + Section Names

**Basic Information tab — left panel labels (verbatim, top→bottom):**
- "Office", "Local Office", "Local Office Name", "Active", "Live Date", "Tax Mode", "Country", "Region", "Servicing Branch Office", "Line Of Business", "Pay To Address", "Union", "eCommerce Active", "Enable Productions Orders"
- Tabs: "Basic Information" (default) + sub-tabs "Local Information" (selected by default in the right panel), "Currency", "Pricing", … (right-panel tablist; out of left-panel scope)

---

## Save-cycle observations

**Save button behavior**: the shared left-panel Save (`location-settings-btn-save`). `[disabled]` on a pristine form (verified live). Enables when any editable left-panel field is dirtied AND the form is valid. The cascade-invalid state (Country changed → Region/Tax Mode cleared) keeps Save **disabled** even though the form is dirty (validation gate).

**Save dialog**: shared "Save Changes" dialog `location-settings-modal-save-changes` (LR-012). Per registry row 90 (walk-evidence-location-settings-2026-05-14), the 8 Location Settings sub-tabs confirm with the **"Ok"** button (NOT "Save"). No save was committed this session (read-only walk); verbatim dialog text is supplied by walk-evidence-location-settings-2026-05-14 + reused via `clickSaveWithDialog`/`base-page`.

**Post-save toast**: not observed this read-only session; existing sibling specs (legal/account-address) supply the toast pattern.

**Dirty-state behavior** (LR-026):
- Navigating away (`goto`/route change) on a **dirty** form fires a **native browser "unsaved changes" dialog** (beforeunload). Observed live: a `goto` on a dirty form blocked with `modal state` — `dialog-accept` (= leave/discard) reverts to server state. Spec cleanup must handle this (reload-then-dismiss or set form pristine before nav).
- **Country cascade**: selecting a different Country clears Region (Palm Springs → empty) and resets Tax Mode (TaxModeID=0) → Save stays disabled. Verified live (Country→Mexico cleared Region). State-leak guard: any cascade-mutating test MUST restore office-1604 defaults (Country=United States, Region=Palm Springs, Tax Mode=US) via `ensureDefaultState` whole-cycle retry (pattern at `location-legal.page.ts:161-198`).

---

## Observations

### Bugs / Defects

No app bugs identified in this session. (Line-Of-Business-disabled and Live-Date-value are documentation drift / data differences, not application defects. Country cascade behaves per requirements.)

---

### Suggestions / Improvements

none
## Staleness signal

- **Last verified**: 2026-06-03
- **Fresh-until**: 2026-06-17
- **Stale-after**: 2026-07-03
- **Refresh triggers**: any change to Location Settings left-panel markup; any new `location-settings-*` testid; field-state change (editable/disabled); dropdown option-count change (Region/Servicing Branch); Country-cascade behavior change.

---

## Known gaps

- Live Date popover internals (calendar widget structure for date-set) not deep-walked this session — the spec authors a date-set via the popover trigger; the calendar control mechanics are walked during BUILDER if a date-set TC is authored.
- Post-save toast verbatim text reused from sibling specs (no save committed here).
