# Field Inventory — Corporate Pricing › Product Group Override (Wave-1.5-A, edit-mechanism RESOLVED)

**Module**: corporate-pricing-override
**Client**: encore
**MCP_Session_Date**: 2026-06-09
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: Playwright CLI v0.1.8+ (agent-CLI, `playwright-cli -s=cpr-override-fcc`, storageState `clients/encore/.auth/encore-state.json`) — W15-A live walk that RESOLVED the Q-WV15-1 edit-activation gap the 2026-06-08 recon left open; sparse-testid (0 grid testids) screen; unattended; logged under the legacy `Playwright MCP` enum per the frozen field-inventory-spec pending SP-PWC2-05 normalization.
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/pg-override
**Test_Entity**: Office 1604 (Parker Palm Springs), Equipment tab (8 override rows); Labor tab = 0 rows for 1604
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/corporate-pricing-override-2026-06-08.md
**Baseline_Scope**: baseline-absent (net-new on e2e; DOCX-absent — intent oracle = live DOM; Q-WV15-1 resolved on live DOM this session)
**Supersedes**: corporate-pricing-override-2026-06-08.md (recon — its "edit-activation UNRESOLVED / possible RBAC" GAP is CLOSED here)

---

## ⭐ Q-WV15-1 RESOLVED — the Override grid IS editable for the automation user (recon "inert cells" was a FALSE NEGATIVE)

The 2026-06-08 recon reported the Override Price / Max Discount % click-to-edit cells did not reveal an input and the Active checkbox did not toggle — concluding a possible RBAC read-only gate (NM-2126). **W15-A live-proved this is WRONG.** A single Playwright-CLI `click` (full pointer sequence) on the cell `button` reveals the editor; the recon's negative was almost certainly a raw-JS `.click()` that did not fire React's `onClick`, or a too-early interaction. The full, verified edit→save→persist cycle (office 1604, Equipment, row 2605 fixture, 2026-06-09):

| Step | Mechanism (live-verified) |
|---|---|
| 1. Enter edit mode | **Click** the Override Price / Max Discount % cell — rendered as `button` (role=button, cursor:pointer) — reveals an **active `spinbutton`** (numeric input) in that cell. Display `445.00` → editor shows `445` (trailing decimals stripped for edit). `—` (Max Discount unset) → empty editor. |
| 2. Set value | The spinbutton is **React-controlled**: Playwright `.fill()` / `pressSequentially` set the visible value but do **NOT** commit React state (Save stays disabled) — the module-wide pattern. The **native value-setter + `input`/`change` dispatch** (`CorporatePricingBasePage.setReactInput`) is required. |
| 3. Commit cell | Press **`Enter`** → the spinbutton closes and the new value commits to the row model; **Save button ENABLES** (form dirty). |
| 4. Active toggle | **Click** the Active `checkbox` (`role=checkbox`, `aria-checked`) → toggles `true`↔`false`, dirties the form, **Save enables**. |
| 5. Save | Click the page-level **Save** → shared **"Save Changes" alertdialog** (heading `Save Changes`, body `Are you sure you want to save the changes?`, buttons `Cancel`/`Save` + an X). Confirm with the dialog's **Save**. |
| 6. Persist | **`POST /navigator/api/location/corporate-price-pg-override` → 200** (the DATA save). Toast: **"Pricing overrides saved successfully."** Grid updates: Override Price value, **Mod Date** → now, **Updated By** → `s-prd-clickauto@psav.com` (the automation user) — definitive proof of edit rights, NOT RBAC-blocked. |
| 7. Reversible | Re-edit restores prior value (round-trip `445.00`→`446.00`→`445.00` verified). Save-cycle FCC restores the fixture via this same path. |
| 8. Dirty-nav guard | Navigating away from a **dirty** form fires a native **`beforeunload`** dialog (accept = discard + leave). |

**LR-056 (save endpoint)**: the real save = `POST /navigator/api/location/corporate-price-pg-override`. The many `POST .../settings/corporate-pricing/pg-override` (page URL) are **Next.js RSC framework POSTs** — the LR-056 trap; never filter the listener on the page URL. Persistence in tests is asserted by **reload + DOM re-read** (Tier 1), never a page-URL listener.

---

## Live-state caveat

**Stack**: Next.js / React (App Router, RSC) + shadcn/Radix, NOT Angular (`waitForAngularStable()` is a no-op settle; wait for `tbody tr`/`th`). Grid content renders inside **shadow roots** — a raw `document.querySelector` in `eval` does NOT pierce; Playwright locators + `click`/`fill`/`run-code .evaluate` DO. Same stack as Search/Detail/New-Pricebook.

| Field | Live (2026-06-09) | Notes |
|---|---|---|
| Grid (Equipment, 1604) | `8 items found`, 8 rows after location-select; empty (`No results.`) before a location is selected | location-gated; assert by content anchor, never count (LR-022) |
| Grid (Labor, 1604) | **`0 items found`**, 0 rows; 10 headers still render | Labor has no overrides for 1604 → editable-cell FCC is **Equipment-only** for this fixture |
| Grid column count | **10 columns** (recon "9" — adds `Updated By`) | confirmed |
| `Active` column | Radix `button[role=checkbox][aria-checked]` (`data-state=checked`) — **toggleable + saveable** | LR-036 4th render format |
| Override Price / Max Discount cells | `button` (cursor:pointer) → click reveals `spinbutton` | EDIT CONFIRMED |
| Current Price | renders `0.00` (a value, not blank) | NM-1870 not-reproduced; NM-1675 computed→0.00 |

---

## Field Inventory

### Top controls — tabs + filters (left panel)

| Field | data-testid | Control Type | Default | Validation | States | Notes |
|---|---|---|---|---|---|---|
| Equipment tab | (none) — `[role="tab"]:has-text("Equipment")` | Radix tab | `aria-selected="true"` (default) | n/a | always enabled | switching reloads grid |
| Labor tab | (none) — `[role="tab"]:has-text("Labor")` | Radix tab | `aria-selected="false"` | n/a | always enabled | 0 rows for 1604 (headers render); `aria-selected` flips on click |
| Select a location | (none) — `text=Select a location` (clickable card) | card → "Change Local Office" dialog | placeholder (grid empty until chosen) | a location MUST be selected before grid populates | always enabled | gates the grid |
| Location picker — search | `location-settings-modal-change-local-office-input-search` (SHARED modal has a testid) | text input | `""` | n/a | enabled in dialog | shared "Change Local Office" modal; live-filters rows |
| Location picker — row checkbox | (none) — `tbody tr:has-text("<office>") [role="checkbox"]` | Radix checkbox per row | unchecked | exactly one row before Select | enabled in dialog | check row → Select enables |
| Location picker — Select/Cancel/Close | (none) — `button:text-is("Select"|"Cancel"|"Close")` | buttons | n/a | Select disabled until a row is checked | n/a | Select loads the grid |
| Currency filter | (none) — `button[role="combobox"]:has-text("ALL")` | Radix combobox | `ALL` | n/a | always enabled | options **ALL/USD/CAD/MXN** (4, verified) |
| Active only | (none) — `[role="checkbox"]` near label `Active only` | Radix checkbox | `unchecked` (default OFF) | n/a | always enabled | toggles `true`↔`false` (all 8 1604 rows are active → no row reduction this fixture) |
| Filter Product Groups Override | (none) — `input[placeholder="Filter Product Groups Override..."]` | text input | `""` | n/a | always enabled | **client-side** live filter; matches **Product Group ID + Name ONLY** (verified: `House Video`→7, `2605`→1, `jonathan`→0, `USD`→0). No-match → empty grid (0 rows), NOT the "No results." text |

### Grid columns (Equipment, 10 columns — content-anchored; internal field IDs from resize-column buttons)

| Field | Internal id | Control Type | Editable? | Notes |
|---|---|---|---|---|
| Location | `locationNo` | read-only `<td>` | no | e.g. `1604` |
| Product Group | `productGroupId` | read-only `<td>` | no | e.g. `2605` (stable anchor) |
| Product Group Name | `productGroupName` | read-only `<td>` | no | primary content anchor |
| Currency | `currencyId` | read-only `<td>` | no | `USD` observed |
| Current Price | `currentPrice` | read-only `<td>` | no | renders `0.00` (computed per NM-1675; NM-1870 not-reproduced) |
| Override Price | `price` | `button` → click reveals `spinbutton` | **YES** | numeric; native-set + Enter to commit; large values render with thousands separators ("999,999.00") |
| Max Discount % | `maxAllowedDiscount` | `button` → click reveals `spinbutton` | **YES** | `—` when unset; renders "N.00 %"; **capped at 100 — entering >100 is REJECTED** (editor refuses to commit); 0–100 incl. decimals commit |
| Active | `active` | `checkbox` (Radix) | **YES** | LR-036 4th format; click toggles + dirties |
| Mod Date | `updatedAt` | read-only `<td>` | no | `MM/DD/YYYY, hh:mm AM/PM` — **VOLATILE** (assert format, not value) |
| Updated By | `updatedBy` | read-only `<td>` | no | username — **VOLATILE** after any save (assert presence/non-empty, not value) |

### Toolbar + pagination

| Field | Selector | Notes |
|---|---|---|
| Save | `button:text-is("Save")` | disabled on clean; enables on any dirty cell; dialog-gated ("Save Changes") |
| Export | `button:text-is("Export")` | direct CSV download (`ProductGroupOverrides-*.csv`); NO variant menu (W15-B/EDGE) |
| Import | `button:text-is("Import")` | direct (file chooser); NO variant menu |
| Grid Options | `button:text-is("Grid Options")` | column show/hide popover (W15-B) |
| Rows per page | `button[role="combobox"]:has-text("20")` | **10/20/30/40/50**, default 20 (verified) |
| Empty state | `text=No results.` | shown before a location is selected (NOT for a no-match client filter) |

---

## Boolean encoding registry

| Source | Column | Encoding | Detection |
|---|---|---|---|
| Override row active flag | `Active` (col 8) | **Radix checkbox** `<button role="checkbox" aria-checked="true\|false" data-state="checked\|unchecked">` | `getAttribute('aria-checked') === 'true'` → TRUE. NOT `textContent`/`lucide-check`. **LR-036 4th render format** (distinct from Search Unicode ✔ / LOS+LM SVG lucide-check / old-site Glyphicon). |

---

## Network-request evidence

| Action | API call | Inference |
|---|---|---|
| Select location | `GET /navigator/api/location/corporate-price-pg-override?localOfficeId=1604` → 200; `POST /navigator/api/location/location-lookup` (picker) | grid is server-loaded per (location); GET fetches override rows |
| Save override | **`POST /navigator/api/location/corporate-price-pg-override` → 200** | the DATA save (LR-056). Page-URL `POST .../pg-override` = RSC framework noise, NOT the save |
| Export (Override) | `ProductGroupOverrides-<ts>UTC.csv` direct download | read-only; round-trip → EDGE_P3 |

---

## Jira defect-lead verdicts (LR-044 live-proof gate — dated 2026-06-09)

| NM-# | Claim | Verdict (live 2026-06-09) |
|---|---|---|
| **NM-1463** | Override story + edit flow | **confirmed-mechanism** — this screen edits EXISTING rows via click-to-edit cell (NOT the AI-paraphrased "drag/double-click to add"; there is no source-list add affordance on `/pg-override`). Actual Jira story-ownership unconfirmed (lead). |
| **NM-2126** | RBAC `canEdit` gates editing | **not-reproduced** — `s-prd-clickauto@psav.com` edits + saves successfully (Updated By proves it). The RBAC *negative* (a non-RM user blocked) is **NOT-AUTOMATABLE** (single automation account, no role-less account). |
| **NM-1870** | Current Price not displayed | **not-reproduced** — Current Price column renders `0.00` (a value). |
| **NM-1889** | Override search matches unintended columns | **not-reproduced** — client filter scoped to Product Group ID + Name only (`USD`→0, `jonathan`→0). |
| **NM-1675** | Current Price computed, not stored | **consistent** — Current Price = `0.00` (no stored value). Proving the cross-page recompute requires editing a location's default pricebook (Location Settings › Pricing — outside the 5 CPR screens) → PRE_EDGE, not W15-A. |
| **NM-1932** | Saves Max Discount % without required Override Price | **blocked-data** — all 8 1604 rows already have an Override Price; no row with a blank Override Price exists on this fixture to test the "without Override Price" path. Both cells edit independently. Deferred as a clarification (cannot cleanly reproduce on available data). |
| **NM-1961** | New override rows not shown until refresh | **not-applicable** — `/pg-override` edits EXISTING rows; no "add new override row" affordance on this screen (the add path, if any, is elsewhere). |

---

## Staleness signal

- **Last verified**: 2026-06-09
- **Fresh-until**: 2026-06-23
- **Stale-after**: 2026-07-09
- **Refresh triggers**: `/pg-override` route or grid-column change; save endpoint change; Active render change; a Labor fixture with rows appears for editable-cell coverage; a row with blank Override Price appears (unblocks NM-1932).

---

## Known gaps (remaining)

- **NM-1932** validation (Max Discount without Override Price) — no blank-Override-Price row on 1604 to test; clarification.
- **NM-1675** cross-page recompute — requires a Location Settings › Pricing edit (PRE_EDGE scope).
- **Labor editable-cell coverage** — 0 Labor rows for 1604; Labor FCC limited to tab-switch + empty-state + headers.
- **Grid Options popover** + **Export/Import file round-trip** — owned by W15-B / EDGE_P3.

## Observations

### Bugs / Defects

none (retrofitted — original walk did not record findings)

### Suggestions / Improvements

none (retrofitted — original walk did not record findings)
