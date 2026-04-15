# PLAN: Fix False Positive Selectors + Generate Clean Missing data-testid CSV

**Status**: DONE
**Priority**: P0 (client-facing bug report depends on this)
**Created**: 2026-04-09
**Updated**: 2026-04-09
**Executed**: 2026-04-09
**Identity**: OWNER

---

## Context

We generated `MISSING_TESTID_REPORT.md` claiming 100 UI elements lack `data-testid`. The report was built by auditing our SELECTOR FILES, not the live DOM. A manual check on the very first item (Corporate Pricing toggle) proved it was a false positive — the DOM HAS `data-testid="location-settings-checkbox-corporate-pricing"` but we use `div.flex:has(> span:text-is("Corporate Pricing")) button[role="checkbox"]` instead.

An MCP DOM audit on 2026-04-09 confirmed **17 false positives** — elements where `data-testid` EXISTS in the DOM but our selectors use CSS/text/positional fallbacks. This is our bug, not Encore's. We need to verify everything, fix our selectors, then generate a clean CSV with only genuinely missing items.

**LR-029** (already in CLAUDE.md): Never audit selectors without live DOM verification.

---

## 5-Session Pipeline

| Session | Purpose | Output | Depends On |
|---------|---------|--------|------------|
| **1** | Comprehensive missing data-testid scan — every page/tab | Raw findings per tab | — |
| **2** | MCP-verify ~39 transient selectors (dialogs, toasts, validation) | Disposition per selector | Session 1 |
| **3** | Audit the 17 claimed false positives — verify each on live DOM | Confirmed/rejected per claim | Session 2 |
| **4** | Re-verify ALL findings from scratch, produce CSV | Clean `MISSING_TESTID_REPORT.csv` | Session 3 |
| **5** | Fix all selectors in our repo, run specs, cleanup | Code changes + spec verification | Session 4 |

**Sessions 1-3 = VERIFICATION ONLY. Zero code changes. Zero CSV generation.**
**Session 4 = Final verification + CSV.**
**Session 5 = Code changes + cleanup.**

---

## Inventory (verified 2026-04-09)

**14 selector files, 342 keys total:**
- Login: `login.ts` (9 keys)
- Left Panel: `left-panel.ts` (12 keys)
- Local Info: `local-info.ts` (140 keys)
- Currency: `currency.ts` (16 keys)
- Pricing: `pricing.ts` (14 keys)
- Account & Address: `account-address.ts` (23 keys)
- Shared Dialogs: `shared.ts` (9 keys)
- Shared Setup Locations: `shared-setup-locations.ts` (10 keys)
- Notes: `notes.ts` (10 keys)
- Legal: `legal.ts` (8 keys)
- Auto Add-On: `auto-addon.ts` (13 keys)
- Local Office Settings: `local-office-settings.ts` (85 keys — separate namespace)
- Dynamic: `dynamic.ts` (10 parameterized functions)
- Barrel: `index.ts` (no keys — merge + collision detection)

**3 hardcoded selector bypasses in page objects:**
1. `src/pages/setup/local-office/local-office-settings.page.ts:569` — `ect-settings-input-labor-cost-${rowIndex}`
2. `src/pages/setup/locations/location-account-address.page.ts:131` — `location-settings-sub-tab-content-account-and-address`
3. `src/pages/setup/locations/location-account-address.page.ts:40` — `input[name="accountAndAddress.contactPhone1"]`

---

## SESSION 1: Comprehensive Missing data-testid Scan

**Goal**: For every page/tab we test, find ALL interactive/meaningful UI elements that LACK `data-testid`. This is the raw bug list for Encore.

**Method per page/tab**:
1. Navigate to the page/tab
2. Get ALL elements that SHOULD have data-testid:
   ```javascript
   const interactive = document.querySelectorAll(
     'input, button, select, textarea, [role="checkbox"], [role="combobox"], ' +
     '[role="radio"], [role="radiogroup"], [role="switch"], [role="tab"], ' +
     '[role="tabpanel"], [role="dialog"], [role="alertdialog"], [role="table"], ' +
     '[role="progressbar"], [role="spinbutton"], a[href]'
   );
   const missing = [...interactive].filter(el => !el.dataset.testid);
   ```
3. Get all elements that DO have data-testid:
   ```javascript
   const existing = document.querySelectorAll('[data-testid]');
   existing.forEach(el => console.log(el.dataset.testid, el.tagName));
   ```
4. Cross-reference against our selector values
5. Document per tab: what has testid, what's missing, what we use but shouldn't

**Pages/tabs to scan:**

| # | Page/Tab | URL / Trigger | Selector File |
|---|----------|--------------|---------------|
| 1 | Left Panel | `/navigator/locations/1604/settings/location` (always visible) | left-panel.ts |
| 2 | Local Information | Sub-tab: `location-settings-sub-tab-local-information` | local-info.ts |
| 3 | Currency | Sub-tab: `location-settings-sub-tab-currency` | currency.ts |
| 4 | Pricing | Sub-tab: `location-settings-sub-tab-pricing` | pricing.ts |
| 5 | Account & Address | Sub-tab: `location-settings-sub-tab-account-and-address` | account-address.ts |
| 6 | Shared Setup Locations | Sub-tab: `location-settings-sub-tab-shared-setup-locations` | shared-setup-locations.ts |
| 7 | Notes | Sub-tab: `location-settings-sub-tab-notes` | notes.ts |
| 8 | Legal | Sub-tab: `location-settings-sub-tab-legal` | legal.ts |
| 9 | Auto Add-On | Sub-tab: `location-settings-sub-tab-auto-add-on` | auto-addon.ts |
| 10 | Local Office - Basic Info | `/navigator/locations/1604/settings/local-office` | local-office-settings.ts |
| 11 | Local Office - ECT | Tab: `local-office-settings-tab-ect-settings` | local-office-settings.ts |

**Output**: Document per tab with element counts and lists.

**Quality Gate**: Every tab visited, every interactive element catalogued.

---

## SESSION 2: MCP-Verify ~39 Transient Selectors

**Goal**: Trigger every transient UI element (dialog, toast, validation error) and verify whether it has `data-testid`. These are NOT visible in the default DOM.

### 2A. Save Changes Dialog — shared.ts (3 selectors)
```
1. Navigate to Local Info tab
2. Toggle any checkbox (e.g., chkApplyLDW): [data-testid="location-settings-checkbox-apply-ldw"]
3. Click Save: [data-testid="location-settings-btn-save"]
4. Dialog appears → document.querySelector('[role="alertdialog"]')?.dataset?.testid
5. Check buttons: document.querySelectorAll('[role="alertdialog"] button').forEach(b => console.log(b.textContent, b.dataset?.testid))
6. Click Cancel to dismiss WITHOUT saving
7. Toggle checkbox back
```

### 2B. Unsaved Changes Dialog — shared.ts (3 selectors)
```
1. Toggle checkbox on Local Info (don't save)
2. Click Currency tab: [data-testid="location-settings-sub-tab-currency"]
3. Dialog appears → inspect same way as 2A
4. Click Cancel to stay, toggle checkbox back
```

### 2C. Validation Errors — local-info.ts (3 selectors)
```
1. On Local Info, find LDW Percentage: [data-testid="location-settings-input-default-ldw-percentage"]
2. Clear, type "150", Tab → error appears
3. document.querySelectorAll('p').forEach(p => { if(p.textContent.includes('Number must be')) console.log(p.textContent, p.dataset?.testid) })
4. Type "-5" for min boundary → check
5. Restore original value
```

### 2D. Auto Add-On Save Dialog — auto-addon.ts (1 selector)
```
1. Navigate to Auto Add-On tab
2. Toggle any checkbox, click Save → dialog
3. Inspect [role="alertdialog"] for testid
4. Cancel, undo toggle
```

### 2E. Auto Add-On Unsaved Dialog — auto-addon.ts (3 selectors)
```
1. Toggle checkbox, navigate away (goto /navigator/locations/1604/home)
2. Stay/Discard dialog → inspect
3. Click Stay, undo toggle
```

### 2F. Local Office Settings Save Dialog — local-office-settings.ts (3 selectors)
```
1. Navigate to /settings/local-office
2. Toggle Use Fulfillment: [data-testid="local-office-settings-checkbox-use-fulfillment"]
3. Click Save: [data-testid="local-office-settings-btn-save"] → dialog
4. Inspect, Cancel, undo toggle
```

### 2G. Local Office Settings Unsaved Dialog — local-office-settings.ts (3 selectors)
```
1. Toggle checkbox, click ECT tab: [data-testid="local-office-settings-tab-ect-settings"]
2. Unsaved dialog → inspect
3. Click Stay, undo toggle
```

### 2H. Select Customer Address Dialog — account-address.ts (8 selectors)
```
1. Navigate to Account & Address tab
2. Click Address button under Venue section (first Address button)
3. "Select Customer Address" dialog → inspect ALL elements for testid
4. Cancel (NO data modification)
```

### 2I. Change Local Office Dialog — shared-setup-locations.ts (7 selectors)
```
1. Navigate to Shared Setup Locations tab
2. Click Add button
3. "Change Local Office" dialog → inspect ALL elements for testid
4. Cancel (NO data modification)
```

### 2J. Toast Notification — local-info.ts (1 selector)
```
WARNING: MODIFIES DATA
1. Toggle checkbox, Save, Confirm
2. Toast appears briefly (~5 sec) → inspect immediately
3. document.querySelector('li:has-text("Local information updated")')?.dataset?.testid
4. Toggle back and Save again to restore
```

### 2K. HRI Remit Tax 2 — local-info.ts (1 selector)
```
1. NOT visible on location 1604. Search DOM:
   document.querySelectorAll('dt').forEach(d => { if(d.textContent.includes('HRI')) console.log(d.textContent, d.nextElementSibling) })
2. If not found, try other locations
3. If unfindable → "(location-specific, not visible on test locations)"
```

### 2L. Error Dialog — shared.ts (3 selectors)
```
1. Hardest to trigger — requires API error
2. If untriggerable → "(same Radix alertdialog component as Save Changes, high confidence same behavior)"
```

**Output per item**: `HAS_TESTID: <value>` | `MISSING` | `UNVERIFIABLE: <reason>`

**Quality Gate**: All ~39 items have a disposition. Zero "unverified" items. Data restored.

---

## SESSION 3: Audit the 17 Claimed False Positives

**Goal**: Previous agent claims these 17 elements have `data-testid` in DOM but our selectors use fallbacks. **Don't trust it.** Verify each one live.

**Method**: Navigate to correct tab, run `document.querySelector('[data-testid="<claimed-value>"]')`.
- Returns element → `CONFIRMED FALSE POSITIVE` (our selector is wrong)
- Returns null → `PREVIOUS AGENT WRONG` (genuinely missing — Encore bug)

### 3A. Pricing Tab (3 claims)
| Key | Claimed data-testid |
|-----|-------------------|
| `chkCorporatePricing` | `location-settings-checkbox-corporate-pricing` |
| `chkPriceGuideInclusive` | `location-settings-checkbox-price-guide-inclusion` |
| `drpCurrencyFilter` | `location-settings-select-pricing-currency` |

### 3B. Account & Address Tab — static elements (3 claims)
| Key | Claimed data-testid |
|-----|-------------------|
| `txtAccPhone2` | `location-settings-input-contact-phone-2` |
| (2 more on the static page if applicable) | |

### 3C. Account & Address Tab — Account List Dialog (7 claims)
**Must trigger dialog first**: click Account List button to open dialog.
| Key | Claimed data-testid |
|-----|-------------------|
| `txtAccListAccountNumber` | `location-settings-input-account-number` |
| `txtAccListAccountName` | `location-settings-input-account-name` |
| `txtAccListAddress` | `location-settings-input-account-address` |
| `txtAccListCity` | `location-settings-input-account-city` |
| `drpAccListState` | `location-settings-select-account-state` |
| `drpAccListCountry` | `location-settings-select-account-country` |
| `btnAccListSearch` | `location-settings-btn-search-account` |
| `btnAccListReset` | `location-settings-btn-reset-account-search` |
| `btnAccListCancel` | `location-settings-btn-cancel-account-search` |

### 3D. Shared Setup Locations Tab (4 claims)
| Key | Claimed data-testid |
|-----|-------------------|
| `chkSelfPrimaryOffice` | `location-settings-checkbox-shared-location-0-primary` |
| `chkSelfSharesInventory` | `location-settings-checkbox-shared-location-0-shares-inventory` |
| `btnSelfDelete` | `location-settings-btn-delete-shared-location-0` |
| `btnSharedAdd` | `location-settings-btn-add-shared-location-1` |

**Output per item**: `CONFIRMED FALSE POSITIVE` or `PREVIOUS AGENT WRONG`

**Quality Gate**: All 17 individually verified. Any "PREVIOUS AGENT WRONG" documented with evidence.

---

## SESSION 4: Re-Verify All + Generate CSV

**Goal**: Fresh session, fresh eyes. Re-verify EVERYTHING found in Sessions 1-3 against live DOM. Then produce the final clean CSV.

1. Read findings from Sessions 1, 2, 3
2. Navigate to each page/tab and spot-check findings
3. For every item going into CSV: confirm it's genuinely missing on live DOM
4. Generate `MISSING_TESTID_REPORT.csv` at repo root:
   ```csv
   Module,Sub Module,Element,Current Selector
   ```
5. Spot-check 5 random CSV entries from different modules

**Quality Gate**: Every CSV row MCP-verified. Zero false positives.

---

## SESSION 5: Fix All Selectors + Cleanup

**Goal**: All verification done. Now make code changes.

### 5A. Fix confirmed false positive selectors
For each `CONFIRMED FALSE POSITIVE` from Session 3, swap the selector value to `[data-testid="<verified-value>"]`. Keys stay the same — page objects and specs unaffected.

**Known 17 (pending Session 3 confirmation):**

Pricing tab — `src/selectors/setup/locations/pricing.ts`:
| Line | Key | CURRENT | REPLACE WITH |
|------|-----|---------|--------------|
| 11 | `chkCorporatePricing` | `'div.flex:has(> span:text-is("Corporate Pricing")) button[role="checkbox"]'` | `'[data-testid="location-settings-checkbox-corporate-pricing"]'` |
| 13 | `chkPriceGuideInclusive` | `'div.flex:has(> span:text-is("Include Service Fee in Price Guides")) button[role="checkbox"]'` | `'[data-testid="location-settings-checkbox-price-guide-inclusion"]'` |
| 15 | `drpCurrencyFilter` | `'div.flex:has(> span:text-is("Currency")) [role="combobox"]'` | `'[data-testid="location-settings-select-pricing-currency"]'` |

Account & Address tab — `src/selectors/setup/locations/account-address.ts`:
| Line | Key | CURRENT | REPLACE WITH |
|------|-----|---------|--------------|
| 33 | `txtAccPhone2` | `'input[name="accountAndAddress.contactPhone2"]'` | `'[data-testid="location-settings-input-contact-phone-2"]'` |
| 47 | `txtAccListAccountNumber` | `'[role="dialog"]:has-text("Account List") input[placeholder="Account Number"]'` | `'[data-testid="location-settings-input-account-number"]'` |
| 49 | `txtAccListAccountName` | `'[role="dialog"]:has-text("Account List") input[placeholder="Account Name"]'` | `'[data-testid="location-settings-input-account-name"]'` |
| 51 | `txtAccListAddress` | `'[role="dialog"]:has-text("Account List") input[placeholder="Address"]'` | `'[data-testid="location-settings-input-account-address"]'` |
| 53 | `txtAccListCity` | `'[role="dialog"]:has-text("Account List") input[placeholder="City"]'` | `'[data-testid="location-settings-input-account-city"]'` |
| 55 | `drpAccListState` | `'[role="dialog"]:has-text("Account List") [role="combobox"]:near(:text("State"))'` | `'[data-testid="location-settings-select-account-state"]'` |
| 57 | `drpAccListCountry` | `'[role="dialog"]:has-text("Account List") [role="combobox"]:near(:text("Country"))'` | `'[data-testid="location-settings-select-account-country"]'` |
| 59 | `btnAccListSearch` | `'[role="dialog"]:has-text("Account List") button:has-text("Search")'` | `'[data-testid="location-settings-btn-search-account"]'` |
| 61 | `btnAccListReset` | `'[role="dialog"]:has-text("Account List") button:has-text("Reset")'` | `'[data-testid="location-settings-btn-reset-account-search"]'` |
| 65 | `btnAccListCancel` | `'[role="dialog"]:has-text("Account List") button:has-text("Cancel")'` | `'[data-testid="location-settings-btn-cancel-account-search"]'` |

Shared Setup Locations tab — `src/selectors/setup/locations/shared-setup-locations.ts`:
| Line | Key | CURRENT | REPLACE WITH |
|------|-----|---------|--------------|
| 33 | `chkSelfPrimaryOffice` | `'[data-testid="location-settings-table-shared-setup"] tbody tr:first-child td:nth-child(3) [role="checkbox"]'` | `'[data-testid="location-settings-checkbox-shared-location-0-primary"]'` |
| 35 | `chkSelfSharesInventory` | `'[data-testid="location-settings-table-shared-setup"] tbody tr:first-child td:nth-child(4) [role="checkbox"]'` | `'[data-testid="location-settings-checkbox-shared-location-0-shares-inventory"]'` |
| 37 | `btnSelfDelete` | `'[data-testid="location-settings-table-shared-setup"] tbody tr:first-child td:nth-child(5) button'` | `'[data-testid="location-settings-btn-delete-shared-location-0"]'` |
| 41 | `btnSharedAdd` | `'[data-testid="location-settings-table-shared-setup"] tbody tr:last-child button'` | `'[data-testid="location-settings-btn-add-shared-location-1"]'` |

### 5B. Run affected specs
```bash
npm test -- --project=chrome tests/specs/setup/locations/location-pricing.spec.ts
npm test -- --project=chrome tests/specs/setup/locations/location-account-address.spec.ts
npm test -- --project=chrome tests/specs/setup/locations/location-shared-setup-locations.spec.ts
```

### 5C. Cleanup
1. Delete `MISSING_TESTID_REPORT.md` from repo root
2. Update JSDoc dates on fixed selectors to `2026-04-09`
3. Update this plan: status → DONE, add execution summary (LR-027)
4. Activity log entry (LR-028)

### 5D. Verification
- `npx tsc --noEmit` — zero errors
- `git diff --stat` — only selector files + CSV changed, no page objects or specs
- Specs pass (or documented as blocked by external issue)

---

## Confirmed Missing Items (from 2026-04-09 session — pending re-verification in Session 4)

```csv
Module,Sub Module,Element,Current Selector
Location Settings,Pricing,Primary Labor Pricing dropdown,"div:has(> span:text-is(""Primary Labor Pricing"")) button[role=""combobox""]"
Location Settings,Pricing,Primary Equipment Pricing dropdown,"div:has(> span:text-is(""Primary Equipment Pricing"")) button[role=""combobox""]"
Location Settings,Pricing,Primary Internal Equipment Pricing dropdown,"div:has(> span:text-is(""Primary Internal Equipment Pricing"")) button[role=""combobox""]"
Location Settings,Pricing,Primary Production Labor Pricing dropdown,"div:has(> span:text-is(""Primary Production Labor Pricing"")) button[role=""combobox""]"
Location Settings,Pricing,Primary Production Equipment Pricing dropdown,"div:has(> span:text-is(""Primary Production Equip. Pricing"")) button[role=""combobox""]"
Location Settings,Pricing,Secondary Pricing table,"[role=""tabpanel""] table"
Location Settings,Pricing,Column: Pricing Strategy,"th:has-text(""Pricing Strategy"")"
Location Settings,Pricing,Column: Pricebook,"th:has-text(""Pricebook"")"
Location Settings,Pricing,Column: Currency,"th:has-text(""Currency"")"
Location Settings,Pricing,Column: Is Alternate,"th:has-text(""Is Alternate"")"
Location Settings,Pricing,Column: Use Effective Dates,"th:has-text(""Use Effective Dates"")"
Location Settings,Pricing,Column: Start Date,"th:has-text(""Start Date"")"
Location Settings,Pricing,Column: End Date,"th:has-text(""End Date"")"
Location Settings,Local Information,Effective Date button,"dt:has-text(""Effective Date"") + dd button"
Location Settings,Currency,Column: Currency Code,"th:has-text(""Currency Code"")"
Location Settings,Currency,Column: Selected,"th:has-text(""Selected"")"
Location Settings,Currency,Column: Is Default,"th:has-text(""Is Default"")"
Location Settings,Currency,Column: Merchant,"th:has-text(""Merchant"")"
Location Settings,Legal,Column: Language Name,"th:has-text(""Language Name"")"
Location Settings,Legal,Column: Service Charge Name,"th:has-text(""Service Charge Name"")"
Location Settings,Legal,Column: Terms and Conditions Name,"th:has-text(""Terms and Conditions Name"")"
Location Settings,Notes,Notes table,"[data-testid=""location-settings-section-notes""] table"
Location Settings,Notes,Add button,"[data-testid=""location-settings-section-notes""] button:has-text(""Add"")"
Location Settings,Notes,Character usage progress bar,"[data-testid=""location-settings-section-notes""] [role=""progressbar""]"
Location Settings,Notes,Character counter label,"[data-testid=""location-settings-section-notes""] div.text-\[11px\]"
Location Settings,Account and Address,Venue Name input,"input[name=""accountAndAddress.venueName""]"
Location Settings,Account and Address,Phone 1 input,"input[name=""accountAndAddress.contactPhone1""]"
Location Settings,Account and Address,Venue Address button (first),"dt:has-text(""Address"") + dd button (first)"
Location Settings,Account and Address,Master Address button (second),"dt:has-text(""Address"") + dd button (second)"
Location Settings,Account List Dialog,Dialog container,"[role=""dialog""]:has-text(""Account List"")"
Location Settings,Account List Dialog,Results table,"[role=""dialog""]:has-text(""Account List"") table"
Location Settings,Account List Dialog,Close button,"[role=""dialog""]:has-text(""Account List"") button:has-text(""Close"")"
Location Settings,Shared Setup Locations,Column: Local Office,"th (no text match — positional)"
Location Settings,Shared Setup Locations,Column: Local Office Name,"th (no text match — positional)"
Location Settings,Shared Setup Locations,Column: Primary Office,"th (no text match — positional)"
Location Settings,Shared Setup Locations,Column: Shares Inventory,"th (no text match — positional)"
Local Office Settings,Sections Table,Add New input,"input[placeholder=""Add New...""]"
Local Office Settings,Room Configuration,Add New input,"input[placeholder=""Add New...""]"
```

### Items pending from Session 2 verification
- Save Changes dialog (3) — shared.ts
- Unsaved Changes dialog (3) — shared.ts
- Error dialog (3) — shared.ts
- Toast notification (1) — local-info.ts
- Validation errors (3) — local-info.ts
- HRI Remit Tax 2 (1) — local-info.ts
- Select Customer Address dialog (8) — account-address.ts
- Change Local Office dialog (7) — shared-setup-locations.ts
- Auto Add-On dialogs (4) — auto-addon.ts
- Local Office Settings dialogs (6) — local-office-settings.ts

**Estimated final CSV: 37 confirmed + ~30 from Session 2 = ~67 genuinely missing** (down from 100 claimed)

---

## Critical Files

- `src/selectors/setup/locations/pricing.ts` — Session 1 scan, Session 3 audit, Session 5 fix
- `src/selectors/setup/locations/account-address.ts` — Session 1 scan, Session 3 audit, Session 5 fix
- `src/selectors/setup/locations/shared-setup-locations.ts` — Session 1 scan, Session 3 audit, Session 5 fix
- `src/selectors/setup/locations/shared.ts` — Session 2 transient verification
- `src/selectors/setup/locations/local-info.ts` — Session 1 scan, Session 2 transient verification
- `src/selectors/setup/locations/notes.ts` — Session 1 scan (all genuinely missing)
- `src/selectors/setup/locations/auto-addon.ts` — Session 2 transient verification
- `src/selectors/setup/locations/currency.ts` — Session 1 scan (headers genuinely missing)
- `src/selectors/setup/locations/legal.ts` — Session 1 scan (headers genuinely missing)
- `src/selectors/setup/local-office/local-office-settings.ts` — Session 1 scan, Session 2 transient verification
- `src/selectors/dynamic.ts` — Session 1 scan (grid selectors genuinely missing)
- `MISSING_TESTID_REPORT.md` — DELETE in Session 5
- `MISSING_TESTID_REPORT.csv` — CREATE in Session 4

---

### Execution Summary (Session 5 — 2026-04-09)

**Selectors fixed**: 16 of 17 confirmed false positives swapped to `[data-testid="..."]`

**Files modified**:
- `src/selectors/setup/locations/pricing.ts` — 3 swaps (chkCorporatePricing, chkPriceGuideInclusive, drpCurrencyFilter)
- `src/selectors/setup/locations/account-address.ts` — 10 swaps (txtAccPhone2, txtAccListAccountNumber, txtAccListAccountName, txtAccListAddress, txtAccListCity, drpAccListState, drpAccListCountry, btnAccListSearch, btnAccListReset, btnAccListCancel)
- `src/selectors/setup/locations/shared-setup-locations.ts` — 3 swaps (chkSelfPrimaryOffice, chkSelfSharesInventory, btnSelfDelete)

**Dropped (1)**:
- `btnSharedAdd` — REVERTED. Testid `location-settings-btn-add-shared-location-1` is row-index-based. After adding/removing shared locations, the index changes (e.g., becomes `-2`, `-3`). The positional selector `tbody tr:last-child button` adapts to any row count. TC-LOC-SSL-024 proved this: after adding a Miami location, the Add button moved to index 2, breaking the testid selector. NOT-AUTOMATABLE with static testid — requires dynamic selector.

**Test results** (2026-04-09, single unified run):
- `location-pricing.spec.ts`: 27 passed, 7 skipped
- `location-shared-setup-locations.spec.ts`: 24 passed, 0 skipped
- `location-account-address.spec.ts`: 26 passed, 0 skipped
- **Total: 77 passed, 7 skipped, 0 failed**

**Cleanup**:
- Deleted `MISSING_TESTID_REPORT.md` (old false-positive-contaminated report)
- `MISSING_TESTID_REPORT.csv` (clean, Session 4 output) retained
- Allure report generated clean — 77 passed, 7 skipped, 0 ghost entries
- JSDoc `@verified 2026-04-09` dates added to all swapped selectors
