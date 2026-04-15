# SESSION 1 FINDINGS — Comprehensive data-testid DOM Scan
**Date**: 2026-04-09
**Plan**: PLAN_FIX_FALSE_POSITIVE_SELECTORS_AND_TESTID_CSV.md
**Method**: Live DOM scan via Playwright MCP (browser_evaluate / browser_run_code)
**Location tested**: 1604 (Parker Palm Springs)
**Status**: COMPLETE — all 11 tabs scanned

---

## Key Technique Notes
- Tabpanels use `hidden` attribute — inactive tabs have `hidden: true` and empty content
- Inactive tab panels are mounted in DOM but hidden; content only renders when tab is active
- `aria-hidden: true` + `tabIndex: -1` = Radix UI internal elements (NOT real missing testids)
- Use `page.evaluate()` from document root, NOT `page.locator().evaluateAll()` — locator drops hidden panels

---

## TAB 1+2: Left Panel + Local Information (default view)

**URL**: `/navigator/locations/1604/settings/location`
**Total testids on page**: 90

### Testids found — match our selectors ✓
All left-panel.ts and local-info.ts testid selectors are present and working.

### NEW testids in DOM — NOT in our selector files (Encore added, we never adopted)
| Testid | Tag | Notes |
|--------|-----|-------|
| `location-settings-page` | div | Page wrapper — not needed |
| `location-settings-tabs` | div | Tab container — not needed |
| `location-settings-tab-management-history` | button/tab | Management history tab — not in left-panel.ts |
| `location-settings-tab-content-basic-information` | tabpanel | Content wrapper — not in selectors |
| `location-settings-section-details` | div | Section wrapper — not needed |
| `location-settings-input-location-name` | input | Local Office Name field — not in left-panel.ts |
| `location-settings-checkbox-active` | checkbox | Active toggle — not in left-panel.ts |
| `location-settings-select-country` | combobox | Country — not in left-panel.ts |
| `location-settings-select-region` | combobox | Region — not in left-panel.ts |
| `location-settings-select-servicing-branch` | combobox | Servicing Branch — not in left-panel.ts |
| `location-settings-checkbox-is-union` | checkbox | Is Union — not in left-panel.ts |
| `location-settings-sub-tabs` | div | Sub-tab container — not needed |
| `location-settings-sub-tab-content-local-information` | tabpanel | Local info panel — not in local-info.ts |
| `location-settings-enable-multiday-pricing` | div | Enable Multiday Pricing wrapper — NEW |
| `location-settings-checkbox-enable-multiday-pricing` | checkbox | **NEW checkbox — not in local-info.ts!** |
| `location-settings-tab-content-management-history` | tabpanel | History panel — not in selectors |

### GENUINELY MISSING testids — Left Panel scope (not global nav)
| Element | Current Selector | Notes |
|---------|-----------------|-------|
| Live Date datepicker button | `(none — not in our selectors)` | Left panel field, Encore bug |
| Tax Mode combobox | `(none — not in our selectors)` | Left panel field, Encore bug |
| Line of Business combobox | `(none — not in our selectors)` | Left panel field, Encore bug |

### GENUINELY MISSING testids — Local Information tab scope
| Element | Current Selector | Notes |
|---------|-----------------|-------|
| Effective Date datepicker button | `dt:has-text("Effective Date") + dd button` | CSS fallback — Encore bug |
| Billing Type Master radio | `[data-testid="location-settings-input-billing-type"] button[role="radio"][value="true"]` | Radiogroup has testid but individual radios don't |
| Billing Type Direct radio | `[data-testid="location-settings-input-billing-type"] button[role="radio"][value="false"]` | Same |
| Billing Way Event radio | `[data-testid="location-settings-input-billing-way"] button[role="radio"][value="true"]` | Same |
| Billing Way Daily radio | `[data-testid="location-settings-input-billing-way"] button[role="radio"][value="false"]` | Same |
| HRI Remit Tax 2 checkbox | `dt:has-text("HRI Remit Tax 2") + dd button[role="checkbox"]` | NOT visible on location 1604 (location-specific field) |

### Selector correctness — Local Info
All 140 local-info.ts testid-based selectors verified present in DOM. ✓

---

## TAB 3: Currency

**Panel**: `location-settings-sub-tab-content-currency`
**Testids found**: 10 — all match currency.ts selectors ✓

### Radix internals (NOT real bugs)
9 elements (`input` + `select`) all have `aria-hidden: true` + `tabIndex: -1` → internal Radix implementation of the Merchant combobox. These are NOT Encore's responsibility to add testids to.

### GENUINELY MISSING testids — column headers
| Header text | Testid | Current selector |
|-------------|--------|-----------------|
| Currency Code | NONE | `[data-testid="location-settings-table-currency"] th:has-text("Currency Code")` |
| Selected | NONE | `[data-testid="location-settings-table-currency"] th:has-text("Selected")...` |
| Is Default | NONE | `[data-testid="location-settings-table-currency"] th:has-text("Is Default")` |
| Merchant | NONE | `[data-testid="location-settings-table-currency"] th:has-text("Merchant")` |

**Note**: Our current selectors for these use the table testid as scope + th text. They work. But th elements themselves lack testids (Encore bug).

---

## TAB 4: Pricing

**Panel**: `location-settings-sub-tab-content-pricing`
**Testids found**: 4

### CONFIRMED FALSE POSITIVES (testid exists in DOM, our selector uses CSS fallback)
| Key | DOM testid | Our current selector |
|-----|-----------|---------------------|
| `chkCorporatePricing` | `location-settings-checkbox-corporate-pricing` | `div.flex:has(> span:text-is("Corporate Pricing")) button[role="checkbox"]` |
| `chkPriceGuideInclusive` | `location-settings-checkbox-price-guide-inclusion` | `div.flex:has(> span:text-is("Include Service Fee in Price Guides")) button[role="checkbox"]` |
| `drpCurrencyFilter` | `location-settings-select-pricing-currency` | `div.flex:has(> span:text-is("Currency")) [role="combobox"]` |

### NEW testid in DOM — NOT in our selectors
| Testid | Tag | Notes |
|--------|-----|-------|
| `location-settings-btn-toggle-settings-panel` | button | Toggle button for settings panel (right side of pricing tab) |

### GENUINELY MISSING testids — primary pricing dropdowns
| Element | Current Selector |
|---------|-----------------|
| Primary Labor Pricing | `div:has(> span:text-is("Primary Labor Pricing")) button[role="combobox"]` |
| Primary Equipment Pricing | `div:has(> span:text-is("Primary Equipment Pricing")) button[role="combobox"]` |
| Primary Internal Equipment Pricing | `div:has(> span:text-is("Primary Internal Equipment Pricing")) button[role="combobox"]` |
| Primary Production Labor Pricing | `div:has(> span:text-is("Primary Production Labor Pricing")) button[role="combobox"]` |
| Primary Production Equip. Pricing | `div:has(> span:text-is("Primary Production Equip. Pricing")) button[role="combobox"]` |

### GENUINELY MISSING testids — secondary pricing table
| Element | Current Selector | Notes |
|---------|-----------------|-------|
| Secondary pricing table | `[role="tabpanel"] table` | No data-testid on table element |
| Column header: Pricing Strategy | `th:has-text("Pricing Strategy")` | NONE |
| Column header: Pricebook | `th:has-text("Pricebook")` | NONE |
| Column header: Currency | `th:has-text("Currency")` | NONE |
| Column header: Is Alternate | `th:has-text("Is Alternate")` | NONE |
| Column header: Use Effective Dates | `th:has-text("Use Effective Dates")` | NONE |
| Column header: Start Date | `th:has-text("Start Date")` | NONE |
| Column header: End Date | `th:has-text("End Date")` | NONE |
| Per-row: Is Alternate checkbox | *(per row, no testid)* | ~38 rows × 1 = ~38 elements |
| Per-row: Use Effective Dates checkbox | *(per row, no testid)* | ~38 rows × 1 = ~38 elements |
| Per-row: Start Date input | *(per row, no testid)* | ~38 rows × 1 = ~38 elements |
| Per-row: End Date input | *(per row, no testid)* | ~38 rows × 1 = ~38 elements |
| Column options button | text "Column options" | 1 button per column, no testid |

**Total missing in pricing**: 166 interactive elements (confirmed via DOM scan).

---

## TAB 5: Account & Address

**Panel**: `location-settings-sub-tab-content-account-and-address`
**Testids found**: 4

### CONFIRMED FALSE POSITIVE
| Key | DOM testid | Our current selector |
|-----|-----------|---------------------|
| `txtAccPhone2` | `location-settings-input-contact-phone-2` | `input[name="accountAndAddress.contactPhone2"]` |

### NEW testids in DOM — NOT in our selectors
| Testid | Tag | Notes |
|--------|-----|-------|
| `location-settings-section-venue-address` | div | Venue address section wrapper |
| `location-settings-section-bill-to-address` | div | Bill-to address section wrapper |

### GENUINELY MISSING testids (static page, no dialogs)
| Element | Current Selector | Notes |
|---------|-----------------|-------|
| Venue Name input | `input[name="accountAndAddress.venueName"]` | NONE testid |
| Phone 1 input | `input[name="accountAndAddress.contactPhone1"]` | NONE testid |
| Venue Address button (first) | `[data-testid="location-settings-sub-tab-content-account-and-address"] dt:has-text("Address") button` | NONE testid |
| Master Address button (second) | `SCOPED_IN_PAGE_OBJECT` | NONE testid |

**Note**: Account List Dialog and Select Customer Address Dialog elements NOT scanned here — dialogs require triggering. These will be covered in Session 2.

---

## TAB 6: Shared Setup Locations

**Panel**: `location-settings-sub-tab-content-shared-setup-locations`
**Testids found**: 1 — `location-settings-table-shared-setup` ✓

### BLOCKER: API 504 Error
Server returned 504 during data fetch → table shows empty state ("No shared setup locations added yet."). No row data rendered → row-indexed testids cannot be verified.

### GENUINELY MISSING testids — column headers
| Header text | Testid |
|-------------|--------|
| Local Office | NONE |
| Local Office Name | NONE |
| Primary Office | NONE |
| Shares Inventory | NONE |
| (actions column) | NONE |

### Claimed false positives — UNVERIFIABLE (504 blocked row rendering)
| Claimed testid | Status |
|----------------|--------|
| `location-settings-checkbox-shared-location-0-primary` | UNVERIFIABLE — not in DOM (no rows) |
| `location-settings-checkbox-shared-location-0-shares-inventory` | UNVERIFIABLE — not in DOM (no rows) |
| `location-settings-btn-delete-shared-location-0` | UNVERIFIABLE — not in DOM (no rows) |
| `location-settings-btn-add-shared-location-1` | UNVERIFIABLE — not in DOM (no rows) |

**Action for Session 3**: Re-visit Shared Setup Locations on a location that has shared setup data OR retry location 1604 on a different server request (504 is transient).

---

## TAB 7: Notes

**Panel**: `location-settings-sub-tab-content-notes`
**Testids found (within panel)**: 1 — `location-settings-section-notes` ✓

### GENUINELY MISSING testids (empty state — "No Notes Available")
| Element | Current Selector | Notes |
|---------|-----------------|-------|
| Notes table | `[data-testid="location-settings-section-notes"] table` | Table has no testid — confirmed by DOM notes |
| Add button | `[data-testid="location-settings-section-notes"] button:has-text("Add")` | **Found in DOM scan, confirmed NONE testid** |

### Not rendered (empty state — need notes to exist)
These are genuinely missing per previous DOM notes, but not rendered in current state:
- Textarea (`name="notes.notes.0.note"`) — NO testid
- Delete button — NO testid
- Character counter div — NO testid
- Progress bar (`role="progressbar"`) — NO testid

---

## TAB 8: Legal

**Panel**: `location-settings-sub-tab-content-legal`
**Testids found**: 3 — all match legal.ts selectors ✓

### GENUINELY MISSING testids — column headers
| Header text | Testid |
|-------------|--------|
| Language Name | NONE |
| Service Charge Name | NONE |
| Terms and Conditions Name | NONE |

**Note**: 0 missing interactive elements — all comboboxes and the table have testids ✓

---

## TAB 9: Auto Add-On

**Panel**: `location-settings-sub-tab-content-auto-add-on`
**Testids found**: 6 — all match auto-addon.ts selectors ✓
**Missing interactive**: 0 ✓

### All testids confirmed
- `location-settings-form-auto-add-on` ✓
- `location-settings-checkbox-auto-add-on-false_encore music` ✓
- `location-settings-checkbox-auto-add-on-false_wireless presenter` ✓
- `location-settings-checkbox-auto-add-on-false_express content design session` ✓
- `location-settings-checkbox-auto-add-on-false_wordly` ✓
- `location-settings-checkbox-auto-add-on-true_labor` ✓

---

## TAB 10: Local Office — Basic Information

**URL**: `/navigator/locations/1604/settings/local-office`
**Total testids on page**: 69 — all match local-office-settings.ts selectors ✓
**Missing interactive**: 18

### GENUINELY MISSING testids — inline table inputs
| Element | aria-label / placeholder | Notes |
|---------|------------------------|-------|
| Section row name inputs (13) | `edit name <UUID>` | Per-row editable section names in Sections table |
| Sections "Add New..." input | `placeholder="Add New..."`, `aria-label="new row name"` | Add row input in Sections table |
| Room Config row name inputs (3) | `edit name 1`, `edit name 2`, `edit name 3` | Per-row editable room names |
| Room Config "Add New..." input | `placeholder="Add New..."`, `aria-label="new row name"` | Add row input in Room Config table |

**Total**: 18 missing (13 + 1 + 3 + 1)

### NEW testids in DOM — NOT in our selectors (extra metadata added by Encore)
`local-office-settings-section-title-*` — title divs for each section. Not needed for our tests.
`local-office-settings-field-*` — field wrapper divs. Not needed.

---

## TAB 11: Local Office — ECT Settings

**Panel**: `local-office-settings-tab-content-ect-settings`
**Testids found**: 105
**Missing interactive**: 0 ✓

### Critical finding — hardcoded bypass IS using valid testids
The page object bypass at `local-office-settings.page.ts:569` uses `ect-settings-input-labor-cost-${rowIndex}`. Confirmed in DOM:
- `ect-settings-input-labor-cost-0` through `ect-settings-input-labor-cost-65` ALL EXIST (66 inputs)
- This is NOT a missing testid issue — testids exist and pattern is correct
- It IS a code quality issue: the page object hardcodes the pattern instead of using dynamic.ts

---

## Summary Table

| Tab | Testids Found | False Positives Confirmed | Genuinely Missing Interactive | Column Headers Missing | Blockers |
|-----|--------------|--------------------------|------------------------------|----------------------|---------|
| Left Panel | 90 (page) | 0 | 3 LP fields + 5 LI fields | — | HRI Remit Tax 2 not visible |
| Local Information | (above) | 0 | 6 (see above) | — | |
| Currency | 10 | 0 | 0 (Radix internals excluded) | 4 | |
| Pricing | 4 | **3 CONFIRMED** | 5 dropdowns + 166 table row elements | 7 | |
| Account & Address | 4 | **1 CONFIRMED** | 4 | — | Dialog elements deferred to S2 |
| Shared Setup Loc. | 1 | 0 (UNVERIFIABLE) | 0 visible | 5 | **API 504 blocked row data** |
| Notes | 1 | 0 | 1 (Add button + 4 not rendered) | — | Empty state |
| Legal | 3 | 0 | 0 | 3 | |
| Auto Add-On | 6 | 0 | 0 | — | |
| LO Basic Info | 69 | 0 | **18** (inline inputs) | — | |
| LO ECT | 105 | 0 | 0 | — | |

### Confirmed false positives (for Session 3 full verification)
1. `chkCorporatePricing` → `location-settings-checkbox-corporate-pricing` EXISTS ✓
2. `chkPriceGuideInclusive` → `location-settings-checkbox-price-guide-inclusion` EXISTS ✓
3. `drpCurrencyFilter` → `location-settings-select-pricing-currency` EXISTS ✓
4. `txtAccPhone2` → `location-settings-input-contact-phone-2` EXISTS ✓

### Unverifiable (Session 3 must retry)
- 4 Shared Setup Locations row testids — blocked by API 504

### NEW testids found that we should adopt (not in our selector files)
| Testid | Tab | Priority |
|--------|-----|----------|
| `location-settings-checkbox-enable-multiday-pricing` | Local Info | Medium — new checkbox not in local-info.ts |
| `location-settings-btn-toggle-settings-panel` | Pricing | Low — panel toggle, not tested |
| `location-settings-section-venue-address` | Acct & Addr | Low — section wrapper |
| `location-settings-section-bill-to-address` | Acct & Addr | Low — section wrapper |

---

## Breadcrumbs

<!-- [S] + SESSION_1_FINDINGS.md | plans/pending/ | per:plan§SESSION1,LR-029 — all 11 tabs scanned, findings documented -->
<!-- [S] ~ currency tab | DOM verified | per:plan§SESSION1 — 9 aria-hidden Radix internals confirmed NOT bugs, 4 headers missing -->
<!-- [S] ~ pricing tab | DOM verified | per:plan§SESSION1 — 3 false positives CONFIRMED, 5 primary dropdowns + 166 table elements missing -->
<!-- [S] ~ account-address tab | DOM verified | per:plan§SESSION1 — 1 false positive CONFIRMED (phone2), 4 genuinely missing -->
<!-- [S] ~ shared-setup tab | DOM verified | per:plan§SESSION1 | risk:medium — 504 API error blocked row verification, 4 false positives UNVERIFIABLE -->
<!-- [S] ~ ect tab | DOM verified | per:plan§SESSION1 — hardcoded bypass at page.ts:569 uses valid testids, NOT a missing testid issue -->
