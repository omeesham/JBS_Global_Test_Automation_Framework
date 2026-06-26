# Field Inventory — Location Settings Left Panel (Basic Information) — Pay To launcher refresh

**Module**: left-panel-basic-information
**Client**: encore
**MCP_Session_Date**: 2026-06-11
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: Playwright CLI (`@playwright/cli` v0.1.8, binary `playwright-cli`, session `-s=e2e`, storageState `clients/encore/.auth/encore-state.json`). Targeted refresh under SUBPLAN_LAUNCHER_DIALOG_GAPS_FCC Phase 1 to correct the **Pay To Address** field — the 2026-06-03 walk recorded it as a plain disabled textbox; it is a **launcher** opening the "Pay To List" search dialog. Token-efficient CLI over Chrome per LR-038 v2 (dialog walkthroughs + unattended save-restore; no visual/CSS, no pause step). `MCP_Session_Tool` enum reads "Playwright MCP" pending SP-PWC2-05 value-normalization.
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location
**Test_Entity**: Office 1604 (Parker Palm Springs)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/left-panel-basic-information-2026-06-11.md

> Supersedes the 2026-06-03 inventory **only for the Pay To Address row + the new `## Launcher dialogs` section**. The other 13 fields are unchanged from 2026-06-03 (re-confirmed live this session via the initial left-panel snapshot — same testids, same states). A supervised save-restore probe WAS committed against office 1604 this session (Pay To ID 1 → ID 7 → ID 1) and **verified back to original** (`financial.payToId === 1` post-restore reload). Page is React/Next + shadcn (`data-slot="form-label"`, `peer-disabled:`), not Angular.

---

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location` — Location Settings; the **left panel** (location-attributes card) is shared across all sub-tabs; **Basic Information** is the default landing.

---

## Live-state caveat

| Field | Live (2026-06-11) | Prior record | Drift reason |
|---|---|---|---|
| Pay To Address | **launcher** → opens "Pay To List" dialog; display textbox `[disabled]` shows current Pay To **name** only ("Encore") | "plain disabled textbox" (2026-06-03 inventory + BL-DIV-4) | **CORRECTED — the disabled input is only the display; the field LABEL is a clickable launcher. Total miss in prior walk (no affordance probe).** |
| Pay To value (1604) | name "Encore", **payToId = 1** (API `financial.payToId`) | name "Encore" (ID never captured) | display shows name only; ID requires the API payload (two "Encore" rows exist) |

---

## Field Inventory — corrected Pay To row (others unchanged from 2026-06-03)

### Read-only / launcher fields (Pay To Address row corrected)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Pay To Address | display input: `location-settings-input-pay-to-name` (`[disabled]`); **launcher: NO testid** — use `label:has-text("Pay To Address")` (the `<label for>` points at the disabled input; React onClick on the label opens the dialog) | **launcher** (read-only display input + search dialog) | name "Encore" (payToId=1) | n/a on display; dialog enforces single-row select before Select enables | display input always disabled; **launcher always active** | none direct; selection updates `financial.payToId` + persists | `affordance: launcher → "Pay To List"`. **Playwright `.click()` on the label is BLOCKED** (actionability: label bound to a disabled input → "element is not enabled"). Drive via `dispatchEvent('click')` / `click({force:true})` / JS `label.click()`. This is the exact launcher-blindness that fooled TC-LOC-LP-004's "click → no focus" oracle. |

All other rows (Office, Local Office, Line Of Business, eCommerce Active, Enable Productions Orders read-only; Local Office Name, Active, Live Date, Tax Mode, Country, Region, Servicing Branch Office, Union editable) = **unchanged from `left-panel-basic-information-2026-06-03.md`** (re-confirmed live; see that artifact for full rows).

**Save button**: `location-settings-btn-save` — `[disabled]` when pristine; enables when the Pay To selection (or any editable field) dirties the form.

---

## Launcher dialogs

### Pay To List (Workstream A — the headline fix)

**Affordance**: clicking the **label** "Pay To Address" (`<label data-slot="form-label" for="_r_…-form-item">`, `cursor-pointer`) fires a React `onClick` that opens the dialog. The `for` id is dynamic — anchor by label text, NOT by `for`. Standard Playwright click is blocked (disabled-input association); use a forced/dispatched click.

**Dialog** (verbatim): `dialog` with heading **"Pay To List"** (level 2). Renders ~7 rows pre-loaded **without** any Search (the customer's Pay To list).

**Filters** (5 textboxes, label : verbatim):
| Filter | Notes |
|---|---|
| Pay To ID | **auto-focused** on open (`[active]`); precise match — ID `7` → exactly 1 row |
| Pay To Name | server-side **contains** — `Encore` → 4 rows (IDs 1, 4, 6, 7) |
| Address | textbox |
| Phone | textbox |
| Fax | textbox |

**Buttons**: `Search`, `Reset` (in the filter bar); `Select` (footer, **`[disabled]` until a row is checked**), `Cancel` (footer), `Close` (X, top-right).

**Results table** — 13 columns: `[Select-row checkbox]`, ID, Pay To Name, Address 1, Address 2, Address 3, City, State, Country, Zip Code, Phone, Fax, Active. **All 12 data headers are sortable buttons** (cursor=pointer). Row selection control = **per-row `checkbox "Select row"`** (single-select observed — checking one leaves others unchecked; Select then enables).

**Rows pre-loaded (office 1604, 2026-06-11)** — 7 rows, single page:
| ID | Pay To Name | Address 1 | City | State | Country | Zip | Active |
|---|---|---|---|---|---|---|---|
| 1 | Encore | 23918 Network Place | Chicago | IL | US | 60673-1239 | Yes |
| 2 | Audio Visual Services (Canada) Corporation | 2360 Tedlo Street | Mississauga | Ontario | CA | L5A 3V3 | Yes |
| 3 | Conference Systems, Inc. | 28078 Network Place | Chicago | IL | US | 60673 | Yes |
| 4 | Encore | 1500 W Shure Dr, Suite 175 | Arlington Heights | IL | US | 60004 | Yes |
| 5 | Presentation Services SA de CV | Montes Urales No. 505 … | Ciudad de Mexico | Estado de México | MX | 11000 | Yes |
| 6 | ENCORE EVENT TECHNOLOGIES MEXICO S DE RL DE CV | AV COLOSIO MZA 30 … | CANCUN | QUINTANA ROO | MX | 77560 | Yes |
| 7 | Encore Bahamas | Goodman's Bay Corporate Center, West Bay Street | Nassau | (—) | BS | 00000 | Yes |

**Pagination**: rows-per-page combobox = `20`; "Go to first/previous/next/last" buttons **all `[disabled]`** (single page; `1 / 1`). → pagination & rows-per-page cases are **(c) not-applicable** (≤ page size, only 7 rows).

**Search**: endpoint `GET /navigator/api/location/getLocationPayToList`; round-trip ≈ **4.7 s** (fill+click+settle) → poll budget ~15 s, far below ACC-030's 29 s. **Empty result**: `Pay To ID = 99999` → 0 rows + verbatim **"No results."** (announced, not silent). **Reset**: clears all filters, restores the full list, refs stable, no visible form taint.

**Discard semantics**: **Cancel** closes the dialog; form stays pristine (Save `[disabled]`), `payToId` unchanged. (Close-X / Esc to be confirmed identical in BUILDER.)

**Selection → field → persistence (supervised probe, 2026-06-11)**:
1. Check ID 7 (Encore Bahamas) → **Select enables** → click Select → dialog closes → display textbox updates to **"Encore Bahamas"** → page **Save enables** (form dirty).
2. Save → **"Save Changes" alertdialog** (Cancel · **Ok**) → Ok → `PUT /navigator/api/location/update-properties` (200).
3. Reload → `financial.payToId === 7`, name "Encore Bahamas" → **Pay To selection PERSISTS** through save+reload. (Contrast: ACC-027 Venue-address selection does NOT persist — per-launcher divergence.)
4. **Restore**: open dialog → check ID 1 → Select → Save → Ok → reload → `financial.payToId === 1` ✅ office 1604 returned to original.

**Restore anchor (frozen)**: `financial.payToId = 1` (API `GET /navigator/api/location/1604`). `PAY_TO_ALTERNATE` = ID 7 "Encore Bahamas" (uniquely named).

---

## Save-cycle observations

- **Save dialog**: shared "Save Changes" alertdialog, **Cancel · Ok** (Ok confirms) — consistent with the Location Settings sub-tab pattern (walk-evidence-location-settings-2026-05-14).
- **Save endpoint**: `PUT /navigator/api/location/update-properties` (LR-056 — filter on `/navigator/api/`, ignore `?_rsc=` RSC GETs).

---

## Known App Bugs

None for Pay To. Pay To selection updates the model and persists correctly. (The 2026-06-03 launcher MISS is a process/coverage gap, not an app defect — see `rca-launcher-dialog-misses-2026-06-11.md`.)

---

## Staleness signal

- **Last verified**: 2026-06-11
- **Fresh-until**: 2026-06-25
- **Stale-after**: 2026-07-11
- **Refresh triggers**: any change to the Pay To launcher affordance/testid; any new Pay To List dialog filter/column; the search endpoint or save endpoint changing; the office-1604 Pay To list contents changing materially.

---

## Known gaps (deferred to BUILDER live confirmation)

- Pay To List dialog **testid** (if any) — not captured; selector strategy = role+text fallback (`[role="dialog"]:has-text("Pay To List")`) with FIXME if absent, per the `dlgSelectAddress` precedent (account-address). BUILDER confirms live.
- Close-X / Esc discard equivalence to Cancel — assumed, BUILDER confirms.
- Address / Phone / Fax filter behavior — only ID + Name exercised live (sufficient for the restore-anchor mechanism + multi-match proof); Address/Phone/Fax authored as (c) unless BUILDER confirms live data carries those columns.
