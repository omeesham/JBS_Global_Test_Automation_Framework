> ⚠ **ID-RENAME 2026-06-11** (PLAN_ID_NAMING_AUDIT_AND_REMEDIATION): TC-LOC-CPR-* → TC-CPR-{SRC,STR,DET,NPB,OVR,TIO}-* (001-based per screen); TC-LOC-LI-NE-011..047 → TC-LOC-LI-078..114; TC-LOC-LI-SKIP-BILLING → TC-LOC-LI-070; BUG-CPR-001 → BUG-CPR-OVR-001; BUG-LOC-SHR-001 → BUG-LOC-SSL-001. IDs in this dated artifact are PRE-rename; map: _internal/id-audit-2026-06-10/id-rename-map.csv

# Field Inventory — Corporate Pricing → New Pricebook create flow (NM-1440)

**Module**: corporate-pricing-new-pricebook
**Client**: encore
**MCP_Session_Date**: 2026-06-09
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: Playwright CLI v0.1.8 (agent-CLI, `playwright-cli -s=cpr-newpricebook`, storageState `clients/encore/.auth/encore-state.json`) — sparse-testid create-page field-inventory walk of BOTH route options (Equipment + Labor) incl. one controlled save-cycle probe, unattended; logged under the legacy `Playwright MCP` enum per the frozen field-inventory-spec pending SP-PWC2-05 normalization (`.claude/rules/browser-tool.md`).
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/add?type=equipment
**Test_Entity**: Office 1604 (Parker Palm Springs) — create mode (no pre-existing fixture record; New Pricebook starts empty)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md
**Baseline_Scope**: baseline-absent (Corporate Pricing is net-new on e2e; no nav2 equivalent — intent oracle = DOCX NM-1440)

---

## URL(s) visited

- **Equipment** create flow: `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/add?type=equipment` (page title "New Pricebook | Navigator", h1 "New Pricebook").
- **Labor** create flow: `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/add?type=labor` (same shell; the `?type=` route param is the only difference — see §2).
- **In-page tabs** (both flows): `Pricing Strategy` (default) and `Pricing Detail` — plain `<button>`s with exact text (NOT Radix `role="tab"`; no `aria-selected`), driven by the base page object's `switchTab(...)`. The header (Name / Type / Year / Currency) is shared above both tabs.
- **Reached from**: the Search page `+ New ▾` split-button → `Equipment Pricing` / `Labor Pricing` (already covered by TC-LOC-CPR-016/017; this artifact owns only the create-flow destination page).

---

## Live-state caveat

Stack note: New Pricebook is **Next.js / React (App Router, RSC)** — `waitForAngularStable()` is a generic settle no-op. Unlike the Location Settings modules and the Pricing Detail tab, **the create-form content renders in LIGHT DOM** (the only shadow host is `next-route-announcer`); a raw `document.querySelector` reaches every field. React inputs are **controlled** — Playwright `.fill()` sets the visible value but does NOT update React state, so the form stays un-savable; the **native value-setter + `input`/`change` events** is the canonical update (proven — see §3 Notes + the Search page's `setTextFilter`).

| Field | Live (2026-06-09) | Documented default (DOCX NM-1440 / XLSX helper) | Drift reason (if known) |
|---|---|---|---|
| Price Book Type (`Labor / Equipment`) | combobox is **disabled / read-only**, value fixed by the `?type=` route param (`Equipment` or `Labor`) | helpers 007/008/009 assume an in-page selectable dropdown listing Equipment + Labor | **CPR-1440-Q1**: the type choice is made at the Search `+ New ▾` toolbar; on the create page Type is display-only. Not a defect — UI splits the choice to the entry point. |
| New Pricing Strategy dialog fields | Strategy Name + 4 boolean flags (Is GSO / **Is Active=checked** / Is Internal / Is Productions) | helpers 016/020 assume "Strategy Name + **Type**" | **CPR-1440-Q2**: no separate strategy "Type" field; the flags express the strategy classification (mirrors the Pricing Strategy editor). |
| Price Year | accepts a **decimal** ("20.5") and a **2-digit** ("12") value at the client save-gate (Save stays enabled); rejects alpha (input reverts to last valid) | helper 013 expects decimals rejected; helper 010 implies a 4-digit year | **CPR-1440-Q3**: client does NOT enforce integer/4-digit; server-side validation on commit is unverified (no-commit design). Raised. |
| Save enablement | Save requires Pricebook Name + Price Year + **≥1 strategy** | DOCX R1440-9 "Empty-Shell" refers to empty **product groups**, not empty strategies | **CPR-1440-Q5**: a strategy is mandatory to save; product groups are optional (Empty-Shell = zero product groups, still ≥1 strategy). |
| Delete / deactivate a created pricebook | **absent everywhere** (create→Details page, Search action bar, Actions menu, row-level) | (not in DOCX) | **CPR-1440-Q4**: a committed New Pricebook is irreversible via UI → drives the **no-commit** test design (see §5 + §Known gaps). |
| Whitespace-only Pricebook Name | treated as empty → Save disabled | helper 005 (expected) | Matches intent — no drift. |

**Stray record note (mutation-safety transparency)**: the single controlled save-cycle probe (§Network-request evidence) committed one pricebook `QA-AUTODEL-20260609-EQ` (GUID `ecf3a7cd-34e4-44e6-8a8f-b007447e2a73`, office 1604) to learn the save endpoint + post-save behavior (LR-056 discovery procedure). Because no UI delete exists (CPR-1440-Q4), it persists in the e2e env. Flagged here + in the `/encore-questions` draft; the authored spec never commits (it cancels the confirm dialog), so CI never accretes records.

---

## Field Inventory

### Header (shared across both tabs)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Pricebook Name | (none) — use `input[placeholder="Pricebook..."]` (label text "Pricebook Name") | text input (React controlled) | `""` | mandatory — empty OR whitespace-only ⇒ Save disabled; 1-char accepted; 250-char accepted (no client truncation); special chars accepted | always enabled | one of 3 Save preconditions (Name + Year + ≥1 strategy) | fill via native value-setter + input/change (`.fill()` alone does not commit React state) |
| Price Book Type (`Labor / Equipment`) | (none) — use `[role="combobox"]` near label "Labor / Equipment" | combobox (shadcn Select) | `Equipment` on `?type=equipment`; `Labor` on `?type=labor` | n/a (read-only) | **DISABLED** (route-param-fixed) | route param `?type=` | CPR-1440-Q1 — display-only; not user-changeable in-page |
| Price Year | (none) — use `input[placeholder="e.g. 2026"]` (label text "Price Year") | text input (React controlled, numeric-sanitized) | `""` | mandatory — empty ⇒ Save disabled; alpha rejected (reverts to last valid); decimal + 2-digit accepted client-side (CPR-1440-Q3) | always enabled | one of 3 Save preconditions | numeric sanitizer rejects letters; allows `.` |
| Currency | (none) — use `[role="combobox"]` near label "Currency" | combobox (shadcn Select) | `USD` | n/a | enabled | none | options exactly `USD`, `CAD`, `MXN` |

### Pricing Strategy tab (default) — strategy list + add dialog

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| New Pricing Strategy (+) | (none) — use `getByRole('button', { name: 'New Pricing Strategy' })` | icon button (aria-label, empty visible text) | — | — | enabled | — | opens the "New Pricing Strategy" dialog |
| Strategy list / count | (none) — use text `/Total:\s*\d+/` + empty-state "No strategies yet" | read display | `Total: 0` / "No strategies yet" | — | — | — | content-anchored count |
| Search strategies | (none) — use `input[placeholder="Search strategies..."]` | text input | `""` | — | enabled | — | filters the appended strategy list |
| Strategy Name (dialog) | `#new-strategy-name` (also `getByRole('textbox',{name:'Strategy Name'})`) | text input | `""` | empty ⇒ "Add" is a no-op (dialog stays open, Total unchanged) | enabled | — | the one usable `id` on the page |
| Is Active (dialog) | (none) — use `getByRole('checkbox',{name:'Is Active'})` | checkbox (Radix) | **checked** | — | enabled | — | default-checked |
| Is GSO / Is Internal / Is Productions (dialog) | (none) — use `getByRole('checkbox',{name})` | checkbox (Radix) | unchecked | (per Strategy FCC — Is Internal/Is GSO disable when Is Productions checked) | enabled | Is Productions ⇒ others | flag interdependency owned by Strategy FCC P2 |
| Add / Cancel (dialog) | (none) — use `getByRole('dialog').getByRole('button',{name})` | button | — | "Add" appends an in-session strategy; "Cancel" discards | enabled | — | dialog = `[role="dialog"]:has-text("New Pricing Strategy")` |

### Pricing Detail tab (create mode) — product-group ADD

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Product Groups source list | (none) — use `[draggable="true"]` rows (ID + GROUP NAME) | draggable list (virtual-ish, fully rendered) | Equipment ≈3707 items / Labor ≈547 items | — | enabled | route `?type=` selects the catalog | **type-specific catalog** (Equipment vs Labor differ); assert `> 0` / content, never count (LR-022) |
| Search ID or Name | (none) — use `input[placeholder="Search ID or Name..."]` | text input | `""` | — | enabled | — | filters the source list |
| Pricebook detail grid | (none) — use `table` (headers ID / Product Group Name / Price / New Price / Max Discount) | HTML `<table>` | empty | — | — | — | destination; rows added via double-click |
| Add a product group | (none) — **double-click** a source `[draggable="true"]` row | interaction | — | adds row with Price `0.00` + editable New Price + Max Discount | enabled (create mode) | — | New-Pricebook-mode ADD works (DOCX R1443-2/9); contrast Management mode where double-click/drag is defensive/no-op |
| Save | (none) — use `button:has-text("Save")` (exact "Save") | button | **disabled** | enabled only when Name + Year + ≥1 strategy present | disabled until savable | Name + Year + strategy | text flips Save→"Saving..."→Save during commit; settle on toast, not text |

---

## Labels + Section Names

**Header (verbatim, both tabs)**: "New Pricebook" (h1) · "Pricebook Name" · "Labor / Equipment" · "Price Year" · "Currency"

**Pricing Strategy tab**: "Pricing Strategy" (tab) · "Price Strategies" · "Total: 0" · "No strategies yet" · "Click + to add a pricing strategy"

**New Pricing Strategy dialog**: "New Pricing Strategy" (title) · "Strategy Name" · "Is GSO" · "Is Active" · "Is Internal" · "Is Productions" · buttons "Cancel", "Add", "Close"

**Pricing Detail tab**: "Pricing Detail" (tab) · "Product Groups" · grid headers "ID", "Product Group Name", "Price", "New Price", "Max Discount"

**Save dialog**: "Save Changes" (title) · "Are you sure you want to save the changes?" · buttons "Cancel", "Save"

---

## Save-cycle observations

**Save button behavior**: a single top-level `Save` button. **Disabled** until all three preconditions are met (Pricebook Name non-empty/non-whitespace + Price Year non-empty + ≥1 strategy in the list). During commit the button's TEXT flips `Save` → `Saving...` → `Save` (so a `text-is("Save")` disable-wait mismatches mid-save — settle on the post-save redirect/toast instead).

**Save dialog**:
- Triggered by: click of the enabled `Save` button.
- Selector: `[role="alertdialog"]` (shared LR-012 "Save Changes" dialog).
- Title (verbatim): "Save Changes"
- Body (verbatim): "Are you sure you want to save the changes?"
- Buttons (in order, verbatim): "Cancel", "Save"

**Post-save toast / navigation**: confirming the dialog fires `POST /navigator/api/location/pricing/save` → `200`, then **redirects to the new pricebook's Details page** `/settings/corporate-pricing/details/<new-guid>`. (The created record then shows in the Search grid: `<name> <strategy> <year> ✔ USD`, Unicode ✔ boolean per LR-036.)

**Dirty-state behavior**: a dirty create form triggers a browser **`beforeunload` "unsaved changes" guard** on navigate-away (the `pages.fixture` auto-accepts `beforeunload` by default). No separate dirty badge — Save's disabled state is the clean indicator.

---

## Observations

### Bugs / Defects

No app bugs filed in this session. Five behaviors diverge from the XLSX helper expectations and are **raised as `/encore-questions` clarifications** (Doctrine 2 — not silently absorbed, not false-filed), tracked in `clients/encore/specs_planning/_internal/encore-questions-drafts/corporate-pricing-newpricebook-divergences-2026-06-09.md`:

| ID | Field / Feature | Observed (live 2026-06-09) | Expected (per DOCX/helper) | Disposition |
|---|---|---|---|---|
| CPR-1440-Q1 | Price Book Type | disabled/display-only on create page (route-param-fixed) | selectable Equipment/Labor dropdown (helpers 007/008/009) | RAISED — likely intentional (choice at `+New ▾` toolbar) |
| CPR-1440-Q2 | New strategy dialog | Name + 4 boolean flags, no "Type" field | "Strategy Name + Type" (helpers 016/020) | RAISED — flags express classification |
| CPR-1440-Q3 | Price Year | decimal + 2-digit accepted client-side | decimal rejected / 4-digit year (helpers 010/013) | RAISED — possible client-validation gap; server unverified |
| CPR-1440-Q4 | Created pricebook | no UI delete/deactivate anywhere | (not in DOCX) | RAISED — irreversible create; drives no-commit design |
| CPR-1440-Q5 | Save precondition | ≥1 strategy mandatory to save | not stated (Empty-Shell = empty product groups) | RAISED — clarify strategy-required rule |

---

### Suggestions / Improvements

none
## Network-request evidence

| Action | API call(s) observed | Status | Inference |
|---|---|---|---|
| Confirm "Save Changes" on a valid Equipment create | `POST /navigator/api/location/pricing/save` | 200 | the real save endpoint (same as the Pricing Detail save); page then redirects to `/details/<new-guid>` |
| (framework noise during save) | `POST .../corporate-pricing/add?type=equipment` ×several | 200 | **Next.js App-Router RSC POSTs to the page URL** — the LR-056 false-positive class. Any save-assertion network filter MUST target `/navigator/api/location/pricing/save`, NEVER the page URL. |

---

## Known gaps

- **Actual persistence assertions (helpers 018 "5 strategies persist", 022 "Save commits", 023 "save success feedback")** — NOT-AUTOMATED-IN-CI. A create has no reversible fixture (CPR-1440-Q4 — no UI delete), so committing in CI accretes permanent records. The spec asserts commit *reachability* (Save enabled → "Save Changes" dialog appears → Cancel) instead. Recipient for any future disposable-fixture commit test: `SUBPLAN_CORP_PRICING_EDGE_P3.md`.
- **RBAC role-gate (helper 025 — Revenue Management role required)** — NOT-AUTOMATABLE with the single automation account (no role-less second account to prove the negative). The positive (automation user CAN access + save) is proven by the controlled save-cycle probe.
- **Drag-drop ADD** — the source items are HTML5 `draggable="true"`; double-click ADD is the verified, automatable mechanic and is what the spec uses. Native drag-drop is the documented alternative, not separately automated (flaky over a virtual list).

---

## Staleness signal

- **Last verified**: 2026-06-09
- **Fresh-until**: 2026-06-23
- **Stale-after**: 2026-07-09
- **Refresh triggers**: New Pricebook page redesign; Type/Currency control change; strategy-dialog field change; appearance of a delete/deactivate affordance (would re-open commit-test design); save-endpoint change.
