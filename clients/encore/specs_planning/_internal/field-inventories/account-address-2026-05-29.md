# Field Inventory — Location Account and Address

**Module**: account-address
**Client**: encore
**MCP_Session_Date**: 2026-05-29
**MCP_Session_Tool**: Playwright MCP
**MCP_Tool_Reason**: Playwright CLI (`@playwright/cli` v0.1.8, binary `playwright-cli`, session `-s=e2e`, storageState loaded from clients/encore/.auth/encore-state.json). Unattended catalog walk of the widest-surface Location Settings sub-tab (2 phones + account-select + 2 address dialogs + 2 large dropdowns) — token-efficient CLI over Chrome per LR-038 v2 (no visual/CSS work, no live pause step). The `MCP_Session_Tool` enum still reads "Playwright MCP" pending SP-PWC2-05 value-normalization for the CLI (browser-tool.md legacy footnote); the CLI is literally "run playwright mcp commands from terminal".
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location
**Test_Entity**: Office 1604 (Parker Palm Springs)
**Baseline_Artifact**: clients/encore/specs_planning/_internal/old-site-baseline/account-address-2026-05-29.md

> Walk performed under the SUBPLAN_ACCOUNT_ADDRESS_FCC Phase 1 **HUNTER** phase identity; the umbrella session identity is OWNER (the enum's accepted value). Read-only walk — NO destructive save was performed against office 1604 (the existing spec + walk-evidence-location-settings-2026-05-14 supply verbatim save-flow text). All field/default/state values below are live DOM reads on 2026-05-29 via the deep shadow-piercing helper (content renders inside the `<next-location-settings>` shadow root; raw `document.querySelector` does NOT pierce it).

---

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location` — Location Settings (8 Radix sub-tabs share this single URL).

Tabs observed (Radix tablist; URL is shared across sub-tabs — DOM-presence/`aria-selected` is the only reliable active-tab signal, NOT `url.includes`):

- `Account and Address` (`[data-testid="location-settings-sub-tab-account-and-address"]`) — activated by **click** on the tab trigger (Playwright `.click()` flips `aria-selected="true"`; confirmed `aria-selected=true` after click). Not active by default — the page lands on a sibling sub-tab; this tab must be clicked.

Two cards within the panel (`location-settings-sub-tab-content-account-and-address`): **Venue/Branch Account** and **Master Bill To Address**. Two modal dialogs reachable from the cards: **Account List** (Name button) and **Select Customer Address** (Venue Address + Master Address buttons → same dialog).

---

## Live-state caveat

No drift observed — live matches REQUIREMENTS.md.

Verification detail (recorded so future readers don't misread the live address): office 1604's venue **name** is "Parker Palm Springs" but its venue/master **billing address** displays "8899 Beverly Blvd Ste 412, WEST HOLLYWOOD, CA 90048" — this is the documented baseline (`ORIGINAL_ADDRESS` + `VENUE_DISPLAY_FIELDS`/`MASTER_DISPLAY_FIELDS` in `location-account-address.data.ts`), NOT leftover state from a prior run. The address-dialog table shows **7** data rows with footer "Total Addresses: 7" (matches `ADDRESS_SEARCH.totalRows = 7`; a naive visible-row count returns 8 because of a non-data header/select-all row — use the `td:nth-child(2)`-non-empty predicate as the page object does). Phone 1 live value `760-883-1957` matches `PHONE1_BASELINE`. Office 1604 is in a clean baseline state at walk time.

---

## Field Inventory

### Venue/Branch Account card

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Venue Name | location-settings-input-venue-name | text | "Parker Palm Springs" | (none — read-only) | always disabled | reflects selected account | TC-002; `disabled=true` |
| Phone 1 | location-settings-input-contact-phone-1 | text | "760-883-1957" | required; phone mask transforms input; clearing → `aria-invalid=true` + error icon, but Save is NOT blocked (TC-015/023) | always enabled (`aria-invalid=false` at baseline) | account-linked (value reverts to account phone on save+reload) | **save-persist NOT-AUTOMATABLE** — TC-021 dropped: save completes but value always reverts to the account phone on reload |
| Phone 2 | location-settings-input-contact-phone-2 | text | "" (empty) | optional phone mask; no validation when empty (`aria-invalid=false`, TC-016) | always enabled | (none) | **save-persist PROVEN** by TC-019 (save) + TC-020 (reload-persist) |
| Name (account lookup) | location-settings-btn-lookup-venue | button | (n/a) | (none) | always enabled | opens Account List dialog | TC-003 |
| Venue Address (lookup) | location-settings-btn-venue-address | button | (n/a) | (none) | always enabled | opens Select Customer Address dialog | TC-008 |
| Venue City / State / Zip / Country (display) | (none) — use `dd` static text (positional: dd[2..5]) | section-row | "WEST HOLLYWOOD" / "CA" / "90048" / "United States" | (none — read-only) | always read-only (no inner inputs) | reflects selected account address | TC-013; `dd` without `dt` labels — positional index; address selection updates display but does NOT persist through save+reload (TC-027) |

### Master Bill To Address card

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Master Address (lookup) | location-settings-btn-master-address | button | (n/a) | (none) | always enabled | opens the SAME Select Customer Address dialog | TC-012 |
| Master City / State / Zip / Country (display) | (none) — use `dd` static text | section-row | "WEST HOLLYWOOD" / "CA" / "90048" / "United States" | (none — read-only) | always read-only | same values as venue for office 1604 | TC-014 |

### Save (left-panel, shared across Location Settings tabs)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Save | location-settings-btn-save | button | `disabled=true` (no pending changes at rest) | (none) | disabled when form clean; enables on dirty (TC-018); disables after save API completes | reflects form dirty state | shared left-panel Save; LR-012 shared Save Changes dialog; TC-017 |

### Account List dialog (opens from Venue "Name" button — testids PRESENT)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Account List dialog | location-settings-modal-account-list | dialog | (closed) | (none) | opens on Name button click | (none) | TC-003; testid confirmed present |
| Account Number filter | location-settings-input-account-number | text | "" | search filter (not saved) | always enabled | (none) | filter-behavior |
| Account Name filter | location-settings-input-account-name | text | "" | search filter; "Parker" → "Parker Palm Springs" | always enabled | (none) | TC-004 (20s server-search poll) |
| Address filter | location-settings-input-account-address | text | "" | search filter; "Beverly" → matching rows | always enabled | (none) | TC-025 (20s poll) |
| City filter | location-settings-input-account-city | text | "" | search filter; "LOS ANGELES" → matching rows | always enabled | (none) | TC-026 (20s poll) |
| State filter | location-settings-select-account-state | dropdown | (unset) | **59 options** (AK…WY) | always enabled | (none) | **LR-025 retry required** (50+ options); Radix Select |
| Country filter | location-settings-select-account-country | dropdown | (unset) | **255 options** (Afghanistan…Zimbabwe) | always enabled | (none) | **LR-025 retry required** (50+ options); Radix Select |
| Search button | location-settings-btn-search-account | button | enabled | (none) | always enabled | (none) | runs server search |
| Reset button | location-settings-btn-reset-account-search | button | enabled | (none) | always enabled | clears filters + Angular `accountId` binding (reload needed after — TC-007) | TC-007 |
| Select button | location-settings-btn-select-account | button | `disabled=true` | (none) | disabled until a result row checkbox is checked | depends on row-checkbox state | TC-005 |
| Cancel button | location-settings-btn-cancel-account-search | button | enabled | (none) | always enabled | closes without persisting | TC-006 |
| Result row checkbox | `[data-testid=location-settings-modal-account-list] tbody tr:first-child td:first-child button[role="checkbox"]` | checkbox | unchecked | (none) | always enabled | checking enables Select | TC-005 |
| Results table | `[data-testid=location-settings-modal-account-list] table` | section-row | "No results." (pre-search) | (none) | (n/a) | (none) | server-side search results |

### Select Customer Address dialog (opens from Venue/Master Address buttons — testids ABSENT, role+text selectors)

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Address dialog | (none) — use `[role="dialog"]:has-text("Select Customer Address")` | dialog | (closed) | (none) | opens on Venue/Master Address button | (none) | **LR-029 re-verified 2026-05-29: container `data-testid` STILL absent** (`dialogContainerTestids: []`) — role+text fallback in `account-address.ts:74-94` remains correct; no selector upgrade needed |
| Address search | (none) — use `input[placeholder="Search..."]` inside dialog | text | "" | client-side row filter | always enabled | filters table rows | TC-010 |
| Address row checkbox | (none) — use `tbody tr:first-child td:first-child button[role="checkbox"]` inside dialog | checkbox | unchecked | (none) | always enabled | checking enables Select | TC-009 |
| Address Select button | (none) — use `button:has-text("Select")` inside dialog | button | `disabled=true` | (none) | disabled until a row is checked | depends on row-checkbox state | TC-009 |
| Address Save button | (none) — use `button:has-text("Save")` inside dialog | button | `disabled=true` | (none) | **ALWAYS disabled** (invariant) | (none) | TC-011 |
| Address results table | (none) — use `[role="dialog"] table` inside dialog | section-row | 7 data rows ("Total Addresses: 7") | (none) | client-side filter hides rows | (none) | TC-008; row[0] = "8899 Beverly Blvd Ste 412 WEST HOLLYWOOD CA 90048 United States" |

---

## Labels + Section Names

**Account and Address tab — section headings (top-down)**:

- "Venue/Branch Account"
- "Master Bill To Address"

**Account List dialog — labels**:

- "Account List" (dialog)
- "Account Number", "Account Name", "Address", "City", "State", "Country" (filter labels)
- "Search", "Reset", "Select", "Cancel" (buttons)
- "No results." (empty-table text, pre-search)

**Select Customer Address dialog — labels**:

- "Select Customer Address" (dialog title)
- "Search..." (search-bar placeholder)
- "Select", "Save", "Cancel" (buttons)
- "Total Addresses: 7" (footer)

---

## Save-cycle observations

> NOT freshly triggered this session (read-only walk — no destructive save against office 1604). Text below is the documented save flow from `walk-evidence-location-settings-2026-05-14.md` (A&A = Tab 6) + the page object's `clickSaveWithDialog('btnSaveAccountAddress')` + the shared `dlgSaveChanges`/`btnSaveChangesConfirm` selectors (LR-012). Live-confirmed this session: Save button is `disabled=true` at rest.

**Save button behavior**:

- Default state on fresh load: `disabled` (no pending changes — live-confirmed `disabled=true`).
- Enables when: any editable field (Phone 1, Phone 2, account selection, address selection) changes from baseline → form dirty (TC-018).
- Disables when: save API completes successfully (the app explicitly disables the button; LR-026 — `FormControl.dirty` may remain true).
- testid: `location-settings-btn-save` (shared left-panel Save).

**Save dialog**:

- Triggered by: click of the left-panel Save button.
- Selector: shared `dlgSaveChanges` (`[role="alertdialog"]`); message via `[role="alertdialog"]:has-text("Save Changes") p` (container `data-testid` absent — `account-address.ts:98-100` FIXME, LR-029 still-absent 2026-05-29).
- Confirm button (verbatim): **"Ok"** (per walk-evidence-2026-05-14 — all 8 Location Settings sub-tabs on `/settings/location` use "Ok"; LO Basic Information on `/settings/local-office` uses "Save").
- Cancel button (verbatim): "Cancel" (`btnSaveChangesCancel`) — discards without persisting (TC-022).
- Save endpoint: `POST /navigator/locations/1604/settings/location` (per walk-evidence-2026-05-14).

**Post-save toast**: Not separately captured this read-only session; the spec asserts save success via Save button re-disable (TC-019), not toast text. (No post-save toast assertion exists in the spec.)

**Dirty-state behavior** (LR-026):

- Reset in the Account List dialog clears the Angular `accountId` binding in addition to the filter UI → reload required to restore a clean form model before subsequent saves (TC-007, documented in spec).
- Address selection updates the display fields and dirties the form (Save enables), but does NOT persist through save+reload — the Angular form model doesn't serialize the new address (TC-027). Reverted via reload.
- Phone 1 save completes but the value reverts to the account-linked phone on reload (TC-021 dropped — NOT-AUTOMATABLE).

---

## Observations

### Bugs / Defects

No app bugs identified in this session.

Documented app-limitations carried from prior sessions (NOT newly filed as `BUG-*.json` — pre-documented in spec comments; classification bug-vs-by-design is uncertain, so flagged as discussion-items per `feedback_discussion_item_not_bug.md`, not filed):

| Behavior | Field / Feature | Observed | Disposition |
|---|---|---|---|
| Phone 1 account-linked revert | Phone 1 (`txtAccPhone1`) | Save completes but Phone 1 reverts to the account's phone on reload | TC-021 dropped NOT-AUTOMATABLE (pre-documented). GIVER classifies Phone-1 positive-save-persist cell as (c) NOT-AUTOMATABLE. |
| Address selection non-persist | Venue/Master address selection | Selection updates display + dirties form, but does NOT survive save+reload (form model doesn't serialize) | TC-027 tests display-change only (pre-documented). GIVER classifies address save-persist cells as (c) / display-only. |
| Phone 1 required does not block Save | Phone 1 (`txtAccPhone1`) | Cleared Phone 1 → `aria-invalid=true` + error icon, but Save stays ENABLED (Angular doesn't block) | TC-023 asserts indicators only (pre-documented). Required-validation is indicator-only, not save-blocking. |

---

### Suggestions / Improvements

none
## Staleness signal

- **Last verified**: 2026-05-29
- **Fresh-until**: 2026-06-12
- **Stale-after**: 2026-06-28
- **Refresh triggers**: Encore release announcement | MODULE_REGISTRY.md schema change | generator/auditor spot-check disagreed with this artifact | Select-Customer-Address dialog testids land (currently absent — would upgrade `account-address.ts` role-based selectors) | client-flagged DOM change.

---

## Known gaps

- **Save-cycle dialog text not freshly re-triggered** this session (read-only walk to avoid mutating office 1604). Verbatim "Ok"/"Save Changes" text inherited from `walk-evidence-location-settings-2026-05-14.md` (15 days old, but the shared Save dialog is module-invariant and re-confirmed by 26 passing A&A tests). A destructive re-trigger happens naturally in Phase 4's spec run.
- **Account List State/Country option lists** enumerated by count (59 / 255) + first/last samples, not exhaustively dumped — sufficient for LR-025 applicability (both >50). Full option enumeration is not required by any planned TC.
