# Corporate Pricing — Product Group Override: Dependency Map
**Date**: 2026-07-18
**Source inventory**: `field-inventories/corporate-pricing-override-2026-06-09.md` (25 fields) +
  1 newly confirmed control from `walk-evidence-corporate-pricing-override-2026-07-17-C.md`
  (picker Active checkbox — not present in the 2026-06-09 inventory, confirmed live 2026-07-17)
**fields mapped = 27 == inventory total**
**Ticket**: NM-2268 (SUBPLAN_CORP_PRICING_NM2268_LOC_SEARCH)
**Author**: BUILDER+WATCHDOG (claude-opus-4.6 max)

---

## Completeness Header

| Metric | Value |
|--------|-------|
| Fields in 2026-06-09 inventory | 26 |
| Newly confirmed fields (walk-evidence-C 2026-07-17) | 1 |
| **Fields mapped** | **27** |
| **Inventory total** | **27** |
| Gap | 0 |

---

## Dependency Map

### 1. Equipment tab
- **depends-on**: none (independent — always visible once page loads)
- **effect**: gates the grid type (Equipment rows vs Labor rows); switching reloads the grid from the server
- **verified**: TC-CPR-OVR-001, TC-CPR-OVR-002 (walk-evidence-A)

### 2. Labor tab
- **depends-on**: none (independent)
- **effect**: switches grid to Labor override rows; office 1606 has 0 Labor rows so shows empty state
- **verified**: TC-CPR-OVR-002, TC-CPR-OVR-008

### 3. Select a location card (Change Local Office trigger)
- **depends-on**: none
- **effect**: gates the ENTIRE grid — no data renders until a location is selected via the picker
- **verified**: TC-CPR-OVR-003, TC-CPR-OVR-004, TC-CPR-OVR-030

### 4. Currency filter dropdown
- **depends-on**: Select a location (grid must be populated)
- **effect**: narrows grid rows to the selected currency; ALL shows all rows (ALL/USD/CAD/MXN observed)
- **verified**: TC-CPR-OVR-009 (options); effect not exercised (1606 rows are all USD — no visible change)

### 5. Active only checkbox (main page)
- **depends-on**: Select a location
- **effect**: when checked, hides inactive rows (rows where Active cell = false); when unchecked, shows all rows
- **verified**: TC-CPR-OVR-010 (toggle); row-filter effect verified on office 1105 (walk-evidence-A: 9→7 rows)

### 6. Filter Product Groups Override (text input)
- **depends-on**: Select a location
- **effect**: client-side filter on Product Group ID + Name columns only; no API call per keystroke
- **verified**: TC-CPR-OVR-012 (name match), TC-CPR-OVR-013 (ID match), TC-CPR-OVR-014 (scoped to ID+Name), TC-CPR-OVR-015 (no-match empty), TC-CPR-OVR-016 (special chars)

### 7. Rows per page control
- **depends-on**: Select a location
- **effect**: controls pagination (10/20/30/40/50 rows per page); 1606 has 7 rows, pagination not exercised
- **verified**: TC-CPR-OVR-011 (options list)

---

### Picker Dialog: Change Local Office

#### 8. Picker — Active filter checkbox *(newly confirmed, walk-evidence-C 2026-07-17)*
- **depends-on**: Picker dialog is open
- **effect**: fires a new POST /api/location/location-lookup on every toggle (evidence: job3b-post-toggle-network.verify.txt)
- **BUG-CONFIRMED-B**: the server ignores the activeOnly parameter — both CHECKED and UNCHECKED states return the
  identical 2,651 active-only location set (inactiveCount:0). Office 1222 ("Hyatt Fairfax at Fair Lakes") is
  confirmed inactive via GET /api/location/1222 (active:false) yet never appears in either checkbox state.
  Evidence chain: walk-evidence-corporate-pricing-override-2026-07-17-F.md Step 5.
- **verified**: TC-CPR-OVR-040 (NM-2268 scope — new)
- **default state**: UNCHECKED (aria-checked=false, data-state=unchecked)

#### 9. Picker — Search textbox (data-testid: location-settings-modal-change-local-office-input-search)
- **depends-on**: Picker dialog is open
- **effect**: client-side text filter on location name + number (no API call per keystroke, walk-evidence-C Job 3e)
- **verified**: TC-CPR-OVR-039 (NM-2268 scope — new); TC-CPR-OVR-030 uses it for locate-and-select

#### 10. Picker — Row selection checkboxes (tbody tr [role="checkbox"])
- **depends-on**: Picker dialog is open (+ optional search/Active filter applied)
- **effect**: checking a row enables the Select button
- **verified**: TC-CPR-OVR-030

#### 11. Picker — Select button
- **depends-on**: at least one row checkbox is checked
- **effect**: fires GET /api/location/corporate-price-pg-override?localOfficeId={id} and loads the grid
- **verified**: TC-CPR-OVR-004, TC-CPR-OVR-030

#### 12. Picker — Cancel button
- **depends-on**: none
- **effect**: closes dialog, no location applied to the grid
- **verified**: TC-CPR-OVR-030, TC-CPR-OVR-039, TC-CPR-OVR-040

#### 13. Picker — Close button (X)
- **depends-on**: none
- **effect**: closes dialog, equivalent to Cancel
- **verified**: independent-verified (walk-evidence-A dialog structure)

---

### Grid Columns — Read-only

#### 14. Location column
- **depends-on**: location selected via picker
- **effect**: shows the applied office number; read-only
- **verified**: TC-CPR-OVR-005

#### 15. Product Group column
- **depends-on**: location selected
- **effect**: product group ID; read-only; used as filter target (TC-013)
- **verified**: TC-CPR-OVR-005

#### 16. Product Group Name column
- **depends-on**: location selected
- **effect**: product group display name; read-only; primary content anchor + filter target
- **verified**: TC-CPR-OVR-004, TC-CPR-OVR-005

#### 17. Currency column
- **depends-on**: location selected
- **effect**: currency code per row; read-only; cross-references Currency filter
- **verified**: TC-CPR-OVR-005

#### 18. Current Price column
- **depends-on**: location selected
- **effect**: computed current price; read-only; NM-1870 not-reproduced (renders a value)
- **verified**: TC-CPR-OVR-006, TC-CPR-OVR-036

---

### Grid Columns — Editable

#### 19. Override Price cell (div[role="button"] → spinbutton)
- **depends-on**: location selected; click-to-edit activates spinbutton
- **effect**: native-value-setter + Enter commits; dirties the form (enables Save); reverting net-zeroes Save; editing an inactive row auto-activates it (NM-1463)
- **verified**: TC-CPR-OVR-017 through TC-CPR-OVR-022, TC-CPR-OVR-025, TC-CPR-OVR-034

#### 20. Max Discount % cell (div[role="button"] → spinbutton)
- **depends-on**: location selected
- **effect**: native-value-setter + Enter; capped at 100 (>100 rejected: aria-invalid + red border + focus-trap BUG-CPR-OVR-001); dirties form
- **verified**: TC-CPR-OVR-023 (skip, defect), TC-CPR-OVR-026, TC-CPR-OVR-037

#### 21. Active cell (Radix checkbox, aria-checked)
- **depends-on**: location selected
- **effect**: LR-036 4th render format; toggles aria-checked; dirties form
- **verified**: TC-CPR-OVR-007, TC-CPR-OVR-024, TC-CPR-OVR-027

---

### Grid Columns — Volatile (read-only)

#### 22. Mod Date column
- **depends-on**: a save has occurred
- **effect**: updated timestamp after save; volatile — assert format only, not value
- **verified**: TC-CPR-OVR-005 (presence in header set)

#### 23. Updated By column
- **depends-on**: a save has occurred
- **effect**: username of last editor; volatile after any save
- **verified**: TC-CPR-OVR-005 (presence in header set)

---

### Toolbar Controls

#### 24. Save button
- **depends-on**: at least one editable cell (Override Price, Max Discount %, Active) is dirty
- **effect**: opens "Save Changes" alertdialog (dialog-gated) → POST /navigator/api/location/corporate-price-pg-override → toast "Pricing overrides saved successfully." → net-zero (revert to saved value re-disables Save)
- **verified**: TC-CPR-OVR-018, TC-CPR-OVR-019, TC-CPR-OVR-025, TC-CPR-OVR-026, TC-CPR-OVR-027, TC-CPR-OVR-028

#### 25. Export button
- **depends-on**: none (tenant-wide export, not scoped to the selected location)
- **effect**: direct CSV download ProductGroupOverrides_<timestamp>UTC.csv via GET /api/location/corporate-price-pg-override/export?locale=en-US; no dialog
- **verified**: TC-CPR-OVR-032, TC-CPR-OVR-038

#### 26. Import button
- **depends-on**: none
- **effect**: opens "Import All Pricing Overrides" dialog (Browse / Upload / Cancel / Close); upload applies to all offices
- **verified**: TC-CPR-OVR-033; BUG NM-2186 (stuck "Uploading… 50%" UI — applies in background, walk-evidence-E)

#### 27. Grid Options button
- **depends-on**: none
- **effect**: opens column visibility menu (10 toggles + "Reset to Default"); column hidden state persists server-side across reload
- **verified**: TC-CPR-OVR-031

---

## Known Bugs / Open Questions

| ID | Surface | Status | Evidence |
|----|---------|--------|----------|
| NM-2011 | 1604 duplicate key 4543 HTTP 500 | LIVE (wrongly closed "could not recreate") | walk-evidence-C Job 1 |
| NM-1940 | Export CSV fails re-import on empty Override Price row | LIVE | walk-evidence-E |
| NM-2186 | Import UI stuck "Uploading… 50%", applies in background | LIVE | walk-evidence-E |
| BUG-CONFIRMED-B | activeOnly ignored server-side (1222 evidence) | LIVE | walk-evidence-F Step 5 |
| BUG-CPR-OVR-001 | Max Discount % >100 silent focus-trap | LIVE | TC-CPR-OVR-023 (skip) |
| NM-2126 | RBAC RM role gate | not-automatable (single account) | TC-CPR-OVR-041 (skip) |

---

## Adjacent-Sweep Findings (NM-2268 Phase 2.5)

No additional DO-NOW fixes identified during the Phase 2 walk. Bug findings above are pre-documented
in walk-evidence files; no new bugs surfaced during dependency-map construction.
