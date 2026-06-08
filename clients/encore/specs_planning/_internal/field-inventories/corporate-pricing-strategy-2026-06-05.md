# Field Inventory — Corporate Pricing → Pricebook Management → Pricing Strategy tab (NM-1441)

**Module**: corporate-pricing-strategy
**Client**: encore
**MCP_Session_Date**: 2026-06-05
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: Playwright CLI v0.1.8 (agent-CLI, `playwright-cli -s=cpr-mgmt`) — sparse-testid (0 testids) field-inventory walk, unattended; logged under the legacy `Playwright MCP` enum per the frozen field-inventory-spec pending SP-PWC2-05 normalization (`.claude/rules/browser-tool.md`).
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/details/5f2a4088-9268-b033-4925-a48146afb1cb
**Test_Entity**: Office 1604 (Parker Palm Springs) — pricebook `2022-NP Tier 1` (`strategyFixture`, GUID `5f2a4088-9268-b033-4925-a48146afb1cb`, Active)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md
**Baseline_Scope**: baseline-absent (Corporate Pricing is net-new on e2e; no nav2 equivalent — intent oracle = DOCX NM-1441)

---

## URL(s) visited

- Primary: `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/details/5f2a4088-9268-b033-4925-a48146afb1cb` — "Pricebook Details" for `2022-NP Tier 1` (`strategyFixture`).
- In-page tabs (rendered inside the `corporate-pricing-container` standalone web component; **AX snapshot pierces, `document.querySelector` does NOT** — used recursive `shadowRoot` walk for `eval`):
  - **Pricing Strategy** — active on load; activated by clicking the `<button>` whose text is "Pricing Strategy" (plain button, NO `role`/`aria-selected`/`data-state` — active state is CSS-class-only; detect via visible Strategy editor content).
  - **Pricing Detail** — clicking the `<button>` text "Pricing Detail" (NM-1443 content; out of S2 scope).
  - **History** — DOCX NM-1441 §2 names a 3rd "History" tab (Placeholder NM-1444); **ABSENT on live DOM** (only 2 tab buttons render). See §2.

---

## Live-state caveat

| Field | Live (2026-06-05) | Documented default (DOCX NM-1441) | Drift reason (if known) |
|---|---|---|---|
| Tab count | **2 tabs** (Pricing Strategy, Pricing Detail) | **3 tabs** (Pricing Strategy, Pricing Detail, History) | History tab not built — DOCX itself labels it "(Placeholder) NM-1444". Expected-not-yet-built, NOT a defect. RAISE via `/encore-questions` (Doctrine 2 / D5). |
| Add-New strategy flow | "Add" (+) icon button opens a **"New Pricing Strategy" modal dialog** (Strategy Name + 4 flag checkboxes + Add/Cancel/Close); "Add" then appends the row to the list | DOCX §3 implies an inline "Add New" button that appends a fresh strategy row directly | Live is modal-gated (richer). Refinement, not a defect — corrects helper TC-ENC-PRC-1441-015. |
| Header editability | All 5 header fields render as read-only `<p>` paragraphs / `<h2>` (no inputs) | DOCX §1: header fields "serve as the primary **reference**" (editability not explicit) | INFERENCE confirmed: header is reference-only (resolves the `[ASSUMPTION]` on helper TC-ENC-PRC-1441-007). |
| `Is Internal`, `Is GSO` editor checkboxes | **disabled** on `strategyFixture` (2022-NP Tier 1) | DOCX lists them as strategy flags (no disabled-state detail) | Likely state-dependent (this strategy has `Is Productions` checked); not asserted as a hard default — see §3 Notes. |
| Save dialog | Save is a **direct button** (disabled when clean, enables on dirty); no shared "Save Changes" dialog was probed (Save NOT clicked — fixture-mutation avoidance) | DOCX §4: Save commits + confirmation feedback | Confirm mechanism (direct vs dialog) deferred to the spec save-cycle test with `ensureDefaultState` restore (LR-012 — do not assume). |

---

## Field Inventory

### Context Header (reference-only — DOCX §1 "primary reference")

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Price Book Name | (none) — use heading[level=2] text | text (read-only `<h2>`) | "2022-NP Tier 1" (fixture) | n/a | always read-only | — | Identity of the pricebook being managed |
| Type (Labor/Equipment) | (none) — use label "Labor/Equipment" → sibling paragraph | text (read-only `<p>`) | "Equipment" | n/a | always read-only | — | Label/value paragraph pair |
| Year | (none) — use label "Year" → sibling paragraph | text (read-only `<p>`) | "2022" | n/a | always read-only | — | Label/value paragraph pair |
| Currency | (none) — use label "Currency" → sibling paragraph | text (read-only `<p>`) | "USD" | n/a | always read-only | — | Label/value paragraph pair |
| Active Status | (none) — use text content "Active" | text/badge (read-only) | "Active" | n/a | always read-only | — | Badge; no separate label cell |

### Tabs

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Pricing Strategy tab | (none) — use button text "Pricing Strategy" | button (tab) | active/selected on load | n/a | always enabled | — | Plain `<button>`, no `role`/`aria-selected`; active = CSS class + Strategy editor visible |
| Pricing Detail tab | (none) — use button text "Pricing Detail" | button (tab) | inactive | n/a | always enabled | — | NM-1443 content (out of S2 scope) |
| History tab | (none) — N/A (absent) | — (not rendered) | ABSENT on live | n/a | n/a | — | DOCX 3rd tab; live-absent (NM-1444 placeholder) → `/encore-questions` |

### Left pane — Price Strategies list

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Search strategies | (none) — use placeholder "Search strategies..." | textbox | "" (empty) | (none observed) | always enabled | — | Filters the strategy list |
| Strategy list item | (none) — use button text = strategy name | button | "2022-NP Tier 1" (the 1 strategy) | n/a | always enabled | — | Content-anchored; clicking loads the strategy into the editor |
| Strategy total | (none) — use text `/Total:\s*\d+/` | text (read-only) | "Total: 1" | n/a | n/a | — | Live count of strategies on this pricebook |
| Add New strategy | (none) — icon button in "Price Strategies" pane header | button (icon, empty aria-label) | n/a | n/a | always enabled | — | Opens the "New Pricing Strategy" modal dialog |
| Remove (per-strategy) | (none) — nested icon button inside a NEW strategy's list item | button (icon) | n/a | n/a | **visible ONLY for isNew strategies; absent for legacy** | bound to `isNew` | Live-confirmed: new strategy list-item contains a nested Remove icon; legacy "2022-NP Tier 1" has none |

### Right pane — Strategy editor

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Strategy Name (editor) | (none) — use textbox under label "Pricing Strategy" | textbox | "2022-NP Tier 1" (selected strategy) | (none observed) | enabled (editable) | — | Editing enables the top Save button (dirty signal) |
| Is Productions | (none) — use checkbox aria-label "Is Productions" | checkbox | checked (this fixture) | (none observed) | enabled | When checked, `Is Internal` + `Is GSO` observed disabled | Form checkbox (renders ✓ img when checked) |
| Is Internal | (none) — use checkbox aria-label "Is Internal" | checkbox | unchecked (this fixture) | (none observed) | **disabled** on this fixture | gated by `Is Productions` (inferred) | Live-disabled; not asserted as a hard default |
| Is GSO | (none) — use checkbox aria-label "Is GSO" | checkbox | unchecked (this fixture) | (none observed) | **disabled** on this fixture | gated by `Is Productions` (inferred) | Live-disabled; not asserted as a hard default |
| Is Active | (none) — use checkbox aria-label "Is Active" | checkbox | checked (this fixture) | (none observed) | enabled | — | Editor flag (renders ✓ img when checked) |

### Locations Using Pricing As Default

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Locations table | (none) — use table with `th:text-is("Local Office")` | table (read-only) | rows: `1991 / Premier Global Events`, `7011 / Production` | n/a | always read-only | depends on selected strategy | 2 columns: "Local Office", "Local Office Name"; content-anchored row reads |

### New Pricing Strategy dialog (opened by Add New)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Strategy Name (dialog) | (none) — use dialog textbox "Strategy Name" (placeholder `e.g. 2026-Tier 4 Urban A`) | textbox | "" (empty) | required to create a meaningful strategy | enabled | — | In `[role="dialog"]` titled "New Pricing Strategy" |
| Is GSO / Is Active / Is Internal / Is Productions (dialog) | (none) — use checkbox aria-labels | checkbox ×4 | `Is Active` checked by default; others unchecked | (none observed) | enabled | — | Order in dialog: GSO, Active, Internal, Productions |
| Add / Cancel / Close (dialog) | (none) — use button text "Add" / "Cancel" / "Close" | button ×3 | n/a | n/a | enabled | — | "Add" appends the new (isNew) row to the list + enables top Save; Cancel/Close discard |

---

## Labels + Section Names

**Pricing Strategy tab** (verbatim DOM text):
- Page heading: "Corporate Pricing Details" (breadcrumb link "Corporate Pricing")
- Tab labels: "Pricing Strategy", "Pricing Detail"
- Header value labels: "Labor/Equipment", "Year", "Currency" (Name + "Active" render without a label)
- Left pane heading: "Price Strategies"; search placeholder "Search strategies..."; count "Total: 1"
- Editor label: "Pricing Strategy" (above the strategy-name textbox)
- Editor checkbox labels: "Is Productions", "Is Internal", "Is GSO", "Is Active"
- Locations section heading: "Locations Using Pricing As Default" (level 4); columns "Local Office", "Local Office Name"
- Top action: "Save"

**New Pricing Strategy dialog** (verbatim):
- Title: "New Pricing Strategy"
- Field label: "Strategy Name"
- Checkbox labels: "Is GSO", "Is Active", "Is Internal", "Is Productions"
- Buttons: "Cancel", "Add", "Close"

---

## Save-cycle observations

**Save button behavior**:
- A single top-level "Save" `<button>` governs the whole Strategy tab (header + editor + new strategies).
- State: `disabled` when the form is clean; becomes enabled (the `disabled` attribute clears) on any dirtying change (edit strategy name, toggle an enabled checkbox, or Add a new strategy).
- Reverting all changes (e.g. removing a just-added new strategy) returns Save to `disabled` (clean) — net-zero dirty handling, consistent with LR-009/LR-026.

**Save dialog**:
- NOT probed in this session — Save was deliberately NOT clicked to avoid mutating the shared `strategyFixture` (persistence is verified in the spec under `ensureDefaultState` restore).
- Per LR-012, the confirm mechanism (direct save vs shared "Save Changes" alertdialog) is NOT assumed. The page object's `saveAndConfirm()` MUST be defensive: click Save, optionally confirm a `[role="alertdialog"]` if one appears, then wait for Save to disable.

**Post-save toast**:
- DOCX §4 specifies confirmation feedback ("Price Book configuration has been updated"). Exact toast text NOT captured (Save not clicked). The spec save-cycle test should capture/assert the success indicator (Notifications region `region "Notifications alt+T"` is present in the DOM).

**Dirty-state behavior**:
- Dirty signal = the top Save button's enabled state (no separate textual "dirty/clean" badge was observed — resolves the `[ASSUMPTION]` on helpers TC-ENC-PRC-1441-020/021/022/025: the indicator IS the Save button enable state).
- Switching tabs while dirty: NOT probed this session; treat per LR-026 (an "Unsaved changes" alertdialog may fire on tab switch — `clickTab` / `switchTab` must dismiss it defensively).

---

## Known App Bugs

No app bugs identified in this session. The two live divergences from the DOCX (History tab absent; Add-New is modal-gated rather than inline) are **expected-not-yet-built / UI refinements**, not defects — routed to `/encore-questions` clarification per Doctrine 2, not filed as `BUG-*` per LR-034.

---

## Staleness signal

- **Last verified**: 2026-06-05
- **Fresh-until**: 2026-06-19
- **Stale-after**: 2026-07-05
- **Refresh triggers**: any change to the Corporate Pricing Pricebook Details page, the Pricing Strategy tab layout, the New Pricing Strategy dialog, the strategy-editor checkbox set, or the Save/dirty mechanism; OR if `strategyFixture` (2022-NP Tier 1) is deleted/renamed; OR a History (NM-1444) tab ships.

---

## Known gaps

- **Save persistence + toast text** — not walked (Save not clicked to protect the shared fixture). Picked up by the S2 spec save-cycle test (`corporate-pricing-strategy.spec.ts`) with `ensureDefaultState` bounded-retry restore.
- **Tab-switch-while-dirty "Unsaved changes" dialog** — not probed; handled defensively in the page object per LR-026 and verified by the spec.
- **Strategy-editor checkbox interdependency** (why `Is Internal`/`Is GSO` are disabled when `Is Productions` is checked) — multi-row / each-flag FCC behavior is deferred to `SUBPLAN_CORP_PRICING_1441_STRATEGY_FCC_P2.md` (LR-040 (b)).
- **History tab behavior** — gated to `SUBPLAN_CORP_PRICING_1444_HISTORY.md` (live-absent).
