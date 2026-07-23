# Field Inventory — Corporate Pricing → Pricebook Management → Pricing Detail tab (NM-1443)

**Module**: corporate-pricing-detail
**Client**: encore
**MCP_Session_Date**: 2026-06-05
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: Playwright CLI v0.1.8 (agent-CLI, `playwright-cli -s=cpr-detail`, storageState `clients/encore/.auth/encore-state.json`) — sparse-testid (0 testids), virtualized/heavy grid field-inventory walk + controlled save-cycle probe on the designated `detailFixture`, unattended; logged under the legacy `Playwright MCP` enum per the frozen field-inventory-spec pending SP-PWC2-05 normalization (`.claude/rules/browser-tool.md`).
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/details/91acb5ca-20e2-ce8e-a9ab-8c370925fd65
**Test_Entity**: Office 1604 (Parker Palm Springs) — pricebook `2021-PB6` (`detailFixture`, GUID `91acb5ca-20e2-ce8e-a9ab-8c370925fd65`, Inactive)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-2026-06-05.md
**Baseline_Scope**: baseline-absent (Corporate Pricing is net-new on e2e; no nav2 equivalent — intent oracle = DOCX NM-1443)

---

## URL(s) visited

- Pricebook Details (default Pricing Strategy tab): `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/details/91acb5ca-20e2-ce8e-a9ab-8c370925fd65`
- **Pricing Detail tab**: same URL, in-page tab. Activated by clicking the `Pricing Detail` button (plain `<button>` with exact text — NOT a Radix `role="tab"`; no `aria-selected` on the live DOM). The base page object's `switchTab('Pricing Detail')` drives it.

---

## Live-state caveat

Stack note: the new site is **Next.js / React (App Router, RSC)** with a shadcn/Radix table (`<tr data-slot="table-row">` / `<td data-slot="table-cell">`), NOT Angular — despite `waitForAngularStable()` being used as the generic settle helper. Module content renders inside **shadow roots**; a raw `document.querySelector` in `eval` does NOT pierce them (a recursive `shadowRoot` walk is required), but Playwright locators DO pierce automatically.

| Field | Live (2026-06-05) | Documented default | Drift reason (if known) |
|---|---|---|---|
| Grid rows (`detailFixture` 2021-PB6) | 2430 product-group data rows, fully rendered in DOM | (none documented) | Heavy-but-not-windowed; assert by content anchor, never by count (LR-022) |
| Source list (Available Product Groups) | 3707 draggable `<div role="button">` items | (none documented) | Catalog of all product groups; assert presence/`> 0`, not exact count |
| `Balloon Light Decor` (ID 277) Max Discount | `0.00 %` after this session | originally empty `""` | This session's controlled save-cycle probe wrote then restored the override; an over-write of an override saves Max Discount as `0.00 %` (no-discount) rather than empty. Benign — `0%` ≡ no discount (DOCX). Price + New Price fully restored (see §Known gaps). |
| `Analog Mixer 12 - 23 Ch` (ID 280) Max Discount | `0.00 %` after this session | originally empty `""` | Same as above — restored to base 195.00 / no-discount. |

---

## Field Inventory

### Pricing Detail grid (management workspace — right side, DOCX §2)

The grid is a single HTML `<table>`. Header row = 5 `<th>`; each data row = 5 `<td>`. Row anchor = the unique **Product Group Name** (e.g. `Balloon Light Decor`) via `tr:has-text("<name>")`. Within a row: New Price input = `td:nth(3) input`, Max Discount input = `td:nth(4) input`.

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| ID | (none) — use cell text in column 1 | read-only `<td>` text | e.g. `277` | n/a | always read-only | none | Product-group identifier; pairs with Name as the content anchor |
| Product Group Name | (none) — use cell text in column 2 | read-only `<td>` text | e.g. `Balloon Light Decor` | n/a | always read-only | none | Primary content anchor (names observed unique); maps DOCX "product group" |
| Price (= Base Price) | (none) — use cell text in column 3 | **read-only** `<td>` text (NO input) | e.g. `615.00` / `0.00` | n/a | always read-only — cannot be typed into | reflects the saved New-Price override after save (see §Save-cycle) | DOCX §2 "Base Price (read-only reference)" maps here. DIVERGENCE: live value updates to the saved override, it does NOT stay pinned to the original global price (CPR-DETAIL-Q2) |
| New Price (= Override Price / staging price) | (none) — use `td:nth(3) input` of the anchored row | editable `<input type="text">` | `""` (empty on clean) | currency-format expected (DOCX §3); not enforced live in this walk | editable (not readonly/disabled) | on Save, its value becomes the Price column value; input clears after save | DOCX "Override Price" + "staging price" (D6/F14). **Dirty-tracking does NOT reliably fire on a New-Price-only edit — see §Known App Bugs (CPR-DETAIL-BUG-A)** |
| Max Discount (= Override Discount) | (none) — use `td:nth(4) input` of the anchored row | editable `<input type="text">`, displays `N.NN %` | `0.00 %` (or empty on a never-touched row) | numeric; rendered as a percentage | editable (not readonly/disabled) | none observed | DOCX "Override Discount". Editing it **reliably** enables Save (the dependable dirty lever for the grid) |

### Available Product Groups source list (left side, DOCX §1)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Source list items | (none) — use `[draggable="true"][role="button"]` | draggable `<div role="button" tabindex="0">` | 3707 items (ID+Name text, e.g. `271 Lift 0'-40' Boom - Daily`) | n/a | clickable + draggable | none | Catalog of product groups. In Management mode, single-click selects/displays (no visible `data-state=selected` change observed); double-click + drag do NOT add (defensive — confirmed live) |
| Source list filter | (none) — use `input[placeholder="Search ID or Name..."]` | text input | `""` | n/a | always enabled | filters the source list | DOCX-implied "browse" affordance; placeholder verbatim `Search ID or Name...` |

### Page-level Save (shared across both Details tabs)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Save | (none) — use `button:text-is("Save")` | button | disabled on clean load | n/a | **disabled when the grid is clean; enables on a dirty change** | one Save commits ALL dirty rows in the grid at once (batch) | Dialog-gated (see §Save-cycle). Same Save button across Pricing Strategy + Pricing Detail tabs |

---

## Labels + Section Names

- **Pricing Detail tab**: tab button text "Pricing Detail"
- **Grid column headers** (verbatim, in order): "ID", "Product Group Name", "Price", "New Price", "Max Discount"
- **Source list filter** placeholder (verbatim): "Search ID or Name..."
- **Save confirm dialog** title (verbatim): "Save Changes"
- **Save confirm dialog** body (verbatim): "Are you sure you want to save the changes?"
- **Save confirm dialog** buttons (verbatim, in order): "Cancel", "Save"

---

## Save-cycle observations

**Save button behavior**: a single page-level button `Save` (`button:text-is("Save")`), `disabled` when the grid is clean. It enables when the form is dirty. One Save commits **all** dirty rows at once (the grid POSTs the whole state).

**Save dialog**:
- Triggered by: click of the Save button
- testid: (none) — role `alertdialog`
- Title (verbatim): "Save Changes"
- Body (verbatim): "Are you sure you want to save the changes?"
- Buttons (in order, verbatim): "Cancel", "Save"
- Confirm path: click the dialog's "Save" button. The base page `clickSave()` / the Detail page `saveAndConfirm()` handle it defensively (LR-012).

**Post-save toast**: a Notifications region surfaces a success indicator (best-effort, non-fatal text — same as the Strategy tab).

**Save endpoint** (LR-056 — the backend save, distinct from page-URL Next.js RSC POSTs): `POST /navigator/api/location/pricing/save` ⇒ 200. The grid LOAD endpoints are `GET /navigator/api/location/pricebook-details?pricebookId=<guid>` and `GET /navigator/api/pricing/product-groups?isLabor=false`. **Do NOT** attach a save-assertion network listener filtered on the page URL — Next.js App-Router fires RSC POSTs to the page URL for seconds after any reload (LR-056). The load-bearing save assertion is **persistence-after-reload**, not a network call.

**Override / staging behavior (KEY)**: "New Price" is a staging override. Typing a value into a row's New Price and saving causes that value to become the row's **Price** column value after reload, and the New Price input clears (it stages the next change). This matches the DOCX "staging price → New Price" (D6/F14) and "Override Price supersedes the base value" (§2).

**Dirty-state behavior** (LR-026 / LR-009 / ALL-089):
- Clean grid → Save disabled.
- **Editing Max Discount reliably enables Save.**
- **Editing New Price does NOT reliably enable Save** — see §Known App Bugs CPR-DETAIL-BUG-A. The New Price *value* still commits when the form is saved (e.g. via a Max Discount touch), but a New-Price-only edit frequently leaves Save disabled (form not marked dirty). Observed reliably across `fill`, `pressSequentially`, native-React-setter dispatch, and select-then-edit; it dirtied only on the literal first interaction of a fresh page.
- Navigating away from a dirty form triggers the browser's native `beforeunload` modal — reload only after Save is disabled (clean), or restore first.

---

## Observations

### Bugs / Defects

| Bug ID | Field / Feature | Observed | Expected (per requirements) | Status |
|---|---|---|---|---|
| CPR-DETAIL-BUG-A (candidate) | New Price (Override Price) input | Editing only the New Price cell frequently does NOT enable the Save button (form not marked dirty), so a user cannot save a New-Price-only override; editing Max Discount on the same row reliably enables Save and the New Price value then commits on Save. Asymmetric with Max Discount. | Editing the Override Price should mark the form dirty and enable Save (DOCX §2 "Override Price: enter a new price that supersedes the base value"). | candidate — pending test-runner confirmation + `/encore-questions`; tracked in test-cases Clarifications (CPR-DETAIL-Q1). Not filed as `BUG-*.json` yet — first reproduce in the `@playwright/test` runner (fresh per-test context) to rule out a stale-CLI-session artifact (LR-044). |

---

### Suggestions / Improvements

none
## Staleness signal

- **Last verified**: 2026-06-05
- **Fresh-until**: 2026-06-19
- **Stale-after**: 2026-07-05
- **Refresh triggers**: NM-1443 grid/override behavior change; New Price Save-enable fix lands (CPR-DETAIL-BUG-A); New-Pricebook mode (NM-1440) drag/drop ships; grid framework change (currently shadcn HTML table); a Pricing Detail change in REQUIREMENTS.md.

---

## Network-request evidence

| Action | API call(s) observed | Status | Inference |
|---|---|---|---|
| Open Detail tab | `GET /navigator/api/location/pricebook-details?pricebookId=<guid>`, `GET /navigator/api/pricing/product-groups?isLabor=false` | 200 | Grid + source list load from the backend on tab activation (DOCX [GET_PRICING_DETAILS_API] + [GET_PRODUCT_GROUPS_API]) |
| Confirm Save | `POST /navigator/api/location/pricing/save` | 200 | The real backend save (DOCX [UPDATE_PRICING_DETAILS_API]). Page-URL POSTs alongside it are Next.js RSC renders — ignore for save assertions (LR-056) |

---

## Known gaps

- **Expand/collapse hierarchy NOT present in the management grid** (DOCX §2 "Product Groups, which can be expanded to show Individual Items/Products"). Live grid renders FLAT — 2430 product-group rows, no per-row expand chevron, `treegrid` role absent, 0 buttons inside the table. (The 7 `aria-expanded` / chevron elements on the page are the app's left NAV sidebar — "Actions", "Tax", "Setup" — NOT grid expanders.) → raised as Clarification CPR-DETAIL-Q3; helpers TC-ENC-PRC-1443-016/017 (expand/collapse) classified (c). Picked up by `/encore-questions` + (if a real hierarchy ships) the FCC-P2 subplan.
- **New-Pricebook-mode add (double-click / drag-drop ADD, items 001–010 of the 1443 helpers)** — only meaningful in create mode (NM-1440); deferred (b) to `plans/pending/SUBPLAN_CORP_PRICING_1440_NEW_PRICEBOOK.md`.
- **Numeric BVA / non-numeric / per-cell FCC (helpers 019/020/021/024/025)** — deferred (b) to `plans/pending/SUBPLAN_CORP_PRICING_1443_DETAIL_FCC_P2.md`.
- **Currency-format validation surfacing (helper 029)** — DOCX §3 requires numeric/currency validation; the exact "blocks Save with a message" surfacing was NOT exercised destructively this session (labeled inference); covered as a P1 case asserting valid currency persists, with the negative/invalid path deferred (b) to FCC-P2.
- **`detailFixture` selection** = `2021-PB6` (Inactive — lowest blast radius), as designated by S0. Two content anchors used for mutation/restore: `Balloon Light Decor` (ID 277, base 615.00) and `Analog Mixer 12 - 23 Ch` (ID 280, base 195.00); both Price + New Price restored and verified on fresh reload (residual: Max Discount shows `0.00 %` = no-discount vs original empty — benign).
