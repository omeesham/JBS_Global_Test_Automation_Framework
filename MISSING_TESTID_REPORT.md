# Missing `data-testid` Attribute Report -- Navigator Cloud

**Report Date**: 2026-04-08
**Application**: Navigator Cloud (Angular / Radix UI)
**Tested Pages**: Setup > Location Settings (9 tabs), Setup > Local Office Settings (3 tabs)
**Framework**: Playwright + TypeScript

---

## 1. Executive Summary

We audited **287 selectors** across 13 selector definition files and **125+ inline locators** across 10 page object files in our Playwright test automation framework. Every selector was classified by its targeting strategy.

| Metric | Count | Percentage |
|--------|-------|------------|
| Elements using `data-testid` | 200 | 70% |
| Elements using fallback selectors | 89 | 30% |
| Excluded (third-party / structural) | 25 | -- |
| **Missing `data-testid` (this report)** | **100** | -- |

**100 interactive elements** across 10 modules lack `data-testid` attributes. These elements are currently targeted using fragile fallback strategies (text matching, CSS class selectors, positional `nth-child`, role+text combinations) that break on internationalization changes, DOM restructuring, or UI copy updates.

Adding `data-testid` attributes to these elements will make test automation significantly more reliable and maintainable.

---

## 2. Methodology

**What was audited:**
- 13 selector definition files in `src/selectors/`
- 10 page object files in `src/pages/`
- Every selector was classified by strategy: `data-testid`, `role`, `:has-text()`, `nth-child`, `placeholder`, `input[name]`, CSS class, or combination

**How items were classified:**
- **CRITICAL**: Positional selectors (`nth-child`, `:first-child`, `:last-child`, `.nth()`) that break when rows/columns are added, removed, or reordered
- **HIGH**: Text-matching selectors (`:has-text()`, `:text-is()`, `button:has-text()`) that break on i18n, copy edits, or text truncation
- **MEDIUM**: Role-based or attribute selectors (`[role="alertdialog"]`, `input[name=...]`) that are stable but not as explicit as `data-testid`
- **LOW**: Elements scoped within a `data-testid` container where text/role uniquely identifies them -- functional but could be more robust

**What was excluded:**
- Microsoft SSO login page (third-party, not Encore-owned)
- Structural queries (`tbody tr` for row counting, `thead th` for header counting) that don't target specific elements

---

## 3. Self-Audit Results

Before filing this report, we audited our own selector usage to confirm we are using every available `data-testid` and not misattributing gaps.

### 3a. Excluded -- Third-Party Elements

| Count | Component | Reason |
|-------|-----------|--------|
| 10 | Microsoft SSO Login Page | Third-party (`login.microsoftonline.com`). Inputs, buttons, and error elements are Microsoft-owned. Not Encore's responsibility. |

### 3b. Excluded -- Structural Queries

| Count | Pattern | Usage |
|-------|---------|-------|
| ~15 | `tbody tr`, `thead th`, `.locator('table')` | Row counting, header enumeration, table existence checks. These query structure, not identity. No individual testid needed. |

### 3c. Our Fix -- Dynamic Selector Mismatch

We identified and corrected an inconsistency in our own codebase where `src/selectors/dynamic.ts` referenced currency testids with a shortened pattern (`currency-usd-selected`) that did not match the actual application testids (`location-settings-checkbox-currency-USD-selected`). We updated our dynamic selectors to match the actual `data-testid` values in the application. This was our bug, not Encore's.

---

## 4. Priority Summary

Sorted by severity. "Missing Count" = elements on this module that need `data-testid` attributes.

| Priority | Module / Section | Missing | Risk |
|----------|-----------------|---------|------|
| CRITICAL | Pricing Tab | 16 | Zero `data-testid` on business logic elements. All 5 pricing dropdowns, 2 checkboxes, 1 table, and 7 column headers use text matching or positional selectors |
| CRITICAL | Shared Setup Locations Tab | 11 | Row checkboxes and buttons use `nth-child` positional selectors. Dialog elements use generic role selectors |
| CRITICAL | Dynamic Grid Rows (Pricing) | 8 | Price book grid cells use `td:nth-child(N)` within text-matched rows. Breaks on column reorder |
| HIGH | Shared Dialogs (all tabs) | 10 | Error, Save Changes, and Unsaved Changes dialogs serve all Location Settings tabs. Zero `data-testid`. All use role + text matching |
| HIGH | Account & Address Tab | 27 | Two full dialogs (Account List, Select Customer Address) with zero `data-testid` on inputs, buttons, tables, and row checkboxes |
| MEDIUM | Local Information Tab | 6 | Validation error messages, Effective Date button, HRI checkbox, and toast notification use text matching |
| MEDIUM | Local Office Settings Dialogs | 8 | Save Changes and Unsaved Changes dialogs use role + text matching. "Add New..." inputs use placeholder text |
| MEDIUM | Auto Add-On Dialogs | 3 | Unsaved Changes (Stay/Discard variant) dialog uses role + text matching |
| LOW | Notes Tab | 6 | Buttons, counter, progress bar, and table within `data-testid`-scoped section. Current selectors work but testids would be more explicit |
| LOW | Currency Tab | 5 | Column headers within `data-testid`-scoped table. Empty state message uses role + text |

**Total: 100 elements** (some items are shared across tabs -- fixing shared dialogs once benefits all tabs)

---

## 5. Module-by-Module Breakdown

Each table lists every element missing a `data-testid` attribute, what selector strategy we currently use, and a suggested `data-testid` value following the application's existing naming convention.

---

### 5.1 Pricing Tab

**Page**: Setup > Location Settings > Pricing tab
**Current coverage**: 1 of 17 selectors use `data-testid` (6%) -- lowest of all modules
**Impact**: All pricing business logic elements lack testids

| ID | Element | Type | Current Selector | Strategy | Priority | Suggested `data-testid` |
|----|---------|------|-----------------|----------|----------|------------------------|
| PRI-001 | Corporate Pricing toggle | checkbox | `div.flex:has(> span:text-is("Corporate Pricing")) button[role="checkbox"]` | CSS + text match | CRITICAL | `location-settings-checkbox-corporate-pricing` |
| PRI-002 | Include Service Fee in Price Guides toggle | checkbox | `div.flex:has(> span:text-is("Include Service Fee in Price Guides")) button[role="checkbox"]` | CSS + text match | CRITICAL | `location-settings-checkbox-price-guide-inclusive` |
| PRI-003 | Currency filter dropdown | combobox | `div.flex:has(> span:text-is("Currency")) [role="combobox"]` | CSS + text match + role | CRITICAL | `location-settings-select-pricing-currency-filter` |
| PRI-004 | Primary Labor Pricing dropdown | combobox | `div:has(> span:text-is("Primary Labor Pricing")) button[role="combobox"]` | CSS + text match + role | CRITICAL | `location-settings-select-primary-labor-pricing` |
| PRI-005 | Primary Equipment Pricing dropdown | combobox | `div:has(> span:text-is("Primary Equipment Pricing")) button[role="combobox"]` | CSS + text match + role | CRITICAL | `location-settings-select-primary-equipment-pricing` |
| PRI-006 | Primary Internal Equipment Pricing dropdown | combobox | `div:has(> span:text-is("Primary Internal Equipment Pricing")) button[role="combobox"]` | CSS + text match + role | CRITICAL | `location-settings-select-primary-internal-equipment-pricing` |
| PRI-007 | Primary Production Labor Pricing dropdown | combobox | `div:has(> span:text-is("Primary Production Labor Pricing")) button[role="combobox"]` | CSS + text match + role | CRITICAL | `location-settings-select-primary-production-labor-pricing` |
| PRI-008 | Primary Production Equipment Pricing dropdown | combobox | `div:has(> span:text-is("Primary Production Equip. Pricing")) button[role="combobox"]` | CSS + text match + role | CRITICAL | `location-settings-select-primary-production-equipment-pricing` |
| PRI-009 | Secondary Pricing grid table | table | `[role="tabpanel"] table` | Generic role + tag | CRITICAL | `location-settings-table-secondary-pricing` |
| PRI-010 | Column: Pricing Strategy | th | `th:has-text("Pricing Strategy")` | Text match | HIGH | `location-settings-th-pricing-strategy` |
| PRI-011 | Column: Pricebook | th | `th:has-text("Pricebook")` | Text match | HIGH | `location-settings-th-pricebook` |
| PRI-012 | Column: Currency | th | `th:has-text("Currency")` | Text match | HIGH | `location-settings-th-pricing-currency` |
| PRI-013 | Column: Is Alternative | th | `th:has-text("Is Alternate")` | Text match | HIGH | `location-settings-th-is-alternative` |
| PRI-014 | Column: Use Effective Dates | th | `th:has-text("Use Effective Dates")` | Text match | HIGH | `location-settings-th-use-effective-dates` |
| PRI-015 | Column: Start Date | th | `th:has-text("Start Date")` | Text match | HIGH | `location-settings-th-start-date` |
| PRI-016 | Column: End Date | th | `th:has-text("End Date")` | Text match | HIGH | `location-settings-th-end-date` |

---

### 5.2 Shared Dialogs (Location Settings -- All Tabs)

**Scope**: These 3 dialogs (Error, Save Changes, Unsaved Changes) are shared UI components rendered by all Location Settings tabs. Adding `data-testid` to these elements once will benefit automation across every tab.
**Current coverage**: 0 of 10 elements use `data-testid` (0%)

| ID | Element | Type | Current Selector | Strategy | Priority | Suggested `data-testid` |
|----|---------|------|-----------------|----------|----------|------------------------|
| DLG-001 | Error dialog container | alertdialog | `[role="alertdialog"]:has(h2:has-text("Error"))` | Role + nested text | HIGH | `location-settings-dialog-error` |
| DLG-002 | Error dialog message | paragraph | `[role="alertdialog"] p` | Role + tag | HIGH | `location-settings-dialog-error-message` |
| DLG-003 | Error dialog "Ok" button | button | `[role="alertdialog"] button:has-text("Ok")` | Role + text match | HIGH | `location-settings-dialog-btn-error-ok` |
| DLG-004 | Save Changes dialog container | alertdialog | `[role="alertdialog"]:has-text("Save Changes")` | Role + text match | HIGH | `location-settings-dialog-save-changes` |
| DLG-005 | Save Changes dialog message | paragraph | `[role="alertdialog"]:has-text("Save Changes") p` | Role + text + tag | HIGH | `location-settings-dialog-save-changes-message` |
| DLG-006 | Save Changes "Cancel" button | button | `[role="alertdialog"]:has-text("Save Changes") button:has-text("Cancel")` | Role + text match | HIGH | `location-settings-dialog-btn-save-cancel` |
| DLG-007 | Save Changes "Ok" button | button | `[role="alertdialog"]:has-text("Save Changes") button:has-text("Ok")` | Role + text match | HIGH | `location-settings-dialog-btn-save-ok` |
| DLG-008 | Unsaved Changes dialog container | alertdialog | `[role="alertdialog"]:has-text("Any unsaved changes will be lost")` | Role + long text match | HIGH | `location-settings-dialog-unsaved-changes` |
| DLG-009 | Unsaved Changes "OK" button | button | `[role="alertdialog"]:has-text("Any unsaved changes will be lost") button:has-text("OK")` | Role + text match | HIGH | `location-settings-dialog-btn-unsaved-ok` |
| DLG-010 | Unsaved Changes "Cancel" button | button | `[role="alertdialog"]:has-text("Any unsaved changes will be lost") button:has-text("Cancel")` | Role + text match | HIGH | `location-settings-dialog-btn-unsaved-cancel` |

---

### 5.3 Account and Address Tab

**Page**: Setup > Location Settings > Account and Address tab
**Current coverage**: 5 of 32 selectors use `data-testid` (16%)
**Impact**: Two full dialogs (Account List, Select Customer Address) have zero `data-testid` on internal elements

| ID | Element | Type | Current Selector | Strategy | Priority | Suggested `data-testid` |
|----|---------|------|-----------------|----------|----------|------------------------|
| AA-001 | Venue Name input | input | `input[name="accountAndAddress.venueName"]` | Form name attribute | MEDIUM | `location-settings-input-venue-name` |
| AA-002 | Venue Address button | button | `[data-testid="..."] dt:has-text("Address") button` | Testid scope + text + tag | HIGH | `location-settings-btn-venue-address` |
| AA-003 | Phone 1 input | input | `input[name="accountAndAddress.contactPhone1"]` | Form name attribute | MEDIUM | `location-settings-input-phone-1` |
| AA-004 | Phone 2 input | input | `input[name="accountAndAddress.contactPhone2"]` | Form name attribute | MEDIUM | `location-settings-input-phone-2` |
| AA-005 | Master Bill To Address button | button | `dt:has-text("Address") button` + `.nth(1)` | Text + positional index | CRITICAL | `location-settings-btn-master-address` |
| AA-006 | Account List dialog container | dialog | `[role="dialog"]:has-text("Account List")` | Role + text match | HIGH | `location-settings-dialog-account-list` |
| AA-007 | Account List: Account Number input | input | `[role="dialog"]:has-text("Account List") input[placeholder="Account Number"]` | Role + text + placeholder | HIGH | `location-settings-dialog-input-account-number` |
| AA-008 | Account List: Account Name input | input | `[role="dialog"]:has-text("Account List") input[placeholder="Account Name"]` | Role + text + placeholder | HIGH | `location-settings-dialog-input-account-name` |
| AA-009 | Account List: Address input | input | `[role="dialog"]:has-text("Account List") input[placeholder="Address"]` | Role + text + placeholder | HIGH | `location-settings-dialog-input-address` |
| AA-010 | Account List: City input | input | `[role="dialog"]:has-text("Account List") input[placeholder="City"]` | Role + text + placeholder | HIGH | `location-settings-dialog-input-city` |
| AA-011 | Account List: State dropdown | combobox | `[role="dialog"]:has-text("Account List") [role="combobox"]:near(:text("State"))` | Role + text + `:near()` proximity | HIGH | `location-settings-dialog-select-state` |
| AA-012 | Account List: Country dropdown | combobox | `[role="dialog"]:has-text("Account List") [role="combobox"]:near(:text("Country"))` | Role + text + `:near()` proximity | HIGH | `location-settings-dialog-select-country` |
| AA-013 | Account List: "Search" button | button | `[role="dialog"]:has-text("Account List") button:has-text("Search")` | Role + text match | HIGH | `location-settings-dialog-btn-account-search` |
| AA-014 | Account List: "Reset" button | button | `[role="dialog"]:has-text("Account List") button:has-text("Reset")` | Role + text match | HIGH | `location-settings-dialog-btn-account-reset` |
| AA-015 | Account List: "Cancel" button | button | `[role="dialog"]:has-text("Account List") button:has-text("Cancel")` | Role + text match | HIGH | `location-settings-dialog-btn-account-cancel` |
| AA-016 | Account List: "Close" button | button | `[role="dialog"]:has-text("Account List") button:has-text("Close")` | Role + text match | HIGH | `location-settings-dialog-btn-account-close` |
| AA-017 | Account List: Row select checkbox | checkbox | `[role="dialog"]:has-text("Account List") tbody tr:first-child td:first-child button[role="checkbox"]` | Role + text + positional | CRITICAL | `location-settings-dialog-checkbox-account-row` (per-row) |
| AA-018 | Account List: Results table | table | `[role="dialog"]:has-text("Account List") table` | Role + text + tag | HIGH | `location-settings-dialog-table-account-list` |
| AA-019 | Select Address dialog container | dialog | `[role="dialog"]:has-text("Select Customer Address")` | Role + text match | HIGH | `location-settings-dialog-select-address` |
| AA-020 | Select Address: Search input | input | `[role="dialog"]:has-text("Select Customer Address") input[placeholder="Search..."]` | Role + text + placeholder | HIGH | `location-settings-dialog-input-address-search` |
| AA-021 | Select Address: "Select" button | button | `[role="dialog"]:has-text("Select Customer Address") button:has-text("Select")` | Role + text match | HIGH | `location-settings-dialog-btn-address-select` |
| AA-022 | Select Address: "Cancel" button | button | `[role="dialog"]:has-text("Select Customer Address") button:has-text("Cancel")` | Role + text match | HIGH | `location-settings-dialog-btn-address-cancel` |
| AA-023 | Select Address: "Save" button | button | `[role="dialog"]:has-text("Select Customer Address") button:has-text("Save")` | Role + text match | HIGH | `location-settings-dialog-btn-address-save` |
| AA-024 | Select Address: "Close" button | button | `[role="dialog"]:has-text("Select Customer Address") button:has-text("Close")` | Role + text match | HIGH | `location-settings-dialog-btn-address-close` |
| AA-025 | Select Address: Row select checkbox | checkbox | `[role="dialog"]:has-text("Select Customer Address") tbody tr:first-child td:first-child button[role="checkbox"]` | Role + text + positional | CRITICAL | `location-settings-dialog-checkbox-address-row` (per-row) |
| AA-026 | Select Address: Results table | table | `[role="dialog"]:has-text("Select Customer Address") table` | Role + text + tag | HIGH | `location-settings-dialog-table-address-list` |
| AA-027 | Select Address: "Total Addresses" label | text | `:text("Total Addresses")` | Text pseudo-selector | HIGH | `location-settings-dialog-label-total-addresses` |

---

### 5.4 Shared Setup Locations Tab

**Page**: Setup > Location Settings > Shared Setup Locations tab
**Current coverage**: 2 of 13 selectors use `data-testid` (15% -- tab and table only)
**Impact**: All row-level elements and the "Change Local Office" dialog use positional or text-based selectors

| ID | Element | Type | Current Selector | Strategy | Priority | Suggested `data-testid` |
|----|---------|------|-----------------|----------|----------|------------------------|
| SSL-001 | Self-row: Primary Office checkbox | checkbox | `[data-testid="...table..."] tbody tr:first-child td:nth-child(3) [role="checkbox"]` | Testid scope + nth-child positional | CRITICAL | `location-settings-checkbox-shared-setup-primary-office` (per-row with location identifier) |
| SSL-002 | Self-row: Shares Inventory checkbox | checkbox | `[data-testid="...table..."] tbody tr:first-child td:nth-child(4) [role="checkbox"]` | Testid scope + nth-child positional | CRITICAL | `location-settings-checkbox-shared-setup-shares-inventory` (per-row with location identifier) |
| SSL-003 | Self-row: Delete button | button | `[data-testid="...table..."] tbody tr:first-child td:nth-child(5) button` | Testid scope + nth-child positional | CRITICAL | `location-settings-btn-shared-setup-delete` (per-row with location identifier) |
| SSL-004 | Add button | button | `[data-testid="...table..."] tbody tr:last-child button` | Testid scope + `:last-child` positional | CRITICAL | `location-settings-btn-shared-setup-add` |
| SSL-005 | Change Local Office dialog container | dialog | `[role="dialog"]:has(h2)` | Generic role + has heading | HIGH | `location-settings-dialog-change-local-office` |
| SSL-006 | Dialog heading | heading | `[role="dialog"] h2` | Role + tag | HIGH | `location-settings-dialog-heading-change-local-office` |
| SSL-007 | Dialog search input | input | `[role="dialog"] input[placeholder="Search by Location Name, Number"]` | Role + placeholder | HIGH | `location-settings-dialog-input-search-location` |
| SSL-008 | Dialog results table | table | `[role="dialog"] table` | Role + tag | HIGH | `location-settings-dialog-table-locations` |
| SSL-009 | Dialog "Select" button | button | `[role="dialog"] button:has-text("Select")` | Role + text match | HIGH | `location-settings-dialog-btn-location-select` |
| SSL-010 | Dialog "Cancel" button | button | `[role="dialog"] button:has-text("Cancel")` | Role + text match | HIGH | `location-settings-dialog-btn-location-cancel` |
| SSL-011 | Dialog "Close" button | button | `[role="dialog"] button:last-of-type` | Role + `:last-of-type` positional | CRITICAL | `location-settings-dialog-btn-location-close` |

**Note on SSL-001 through SSL-003**: These row-level elements ideally need per-row `data-testid` values that include a row identifier (e.g., location number). This allows targeting specific rows without positional selectors. Suggested pattern: `location-settings-shared-setup-row-{locationNumber}-primary-office`.

---

### 5.5 Local Information Tab

**Page**: Setup > Location Settings > Local Information tab
**Current coverage**: 55 of 61 selectors use `data-testid` (90%)
**Impact**: Validation messages, one date picker, one checkbox, and the save toast use text-based selectors

| ID | Element | Type | Current Selector | Strategy | Priority | Suggested `data-testid` |
|----|---------|------|-----------------|----------|----------|------------------------|
| LI-001 | Save success toast notification | notification | `li:has-text("Local information updated")` | Text match on list item | MEDIUM | `location-settings-toast-local-info-updated` |
| LI-002 | Validation error: generic | paragraph | `p:has-text("Number must be")` | Text match | MEDIUM | `location-settings-error-validation-message` |
| LI-003 | Validation error: min boundary | paragraph | `p:has-text("Number must be greater than or equal to 0")` | Text match | MEDIUM | `location-settings-error-min-boundary` |
| LI-004 | Validation error: max boundary | paragraph | `p:has-text("Number must be less than or equal to 100")` | Text match | MEDIUM | `location-settings-error-max-boundary` |
| LI-005 | Effective Date picker button | button | `dt:has-text("Effective Date") + dd button` | Text + CSS adjacency | MEDIUM | `location-settings-btn-effective-date` |
| LI-006 | HRI Remit Tax 2 checkbox | checkbox | `dt:has-text("HRI Remit Tax 2") + dd button[role="checkbox"]` | Text + CSS adjacency + role | MEDIUM | `location-settings-checkbox-hri-remit-tax-2` |

---

### 5.6 Local Office Settings -- Dialogs

**Page**: Setup > Local Office Settings
**Current coverage**: 81 of 87 selectors use `data-testid` (93%) -- excellent coverage overall
**Impact**: Save Changes and Unsaved Changes dialogs on this page lack `data-testid`. Additionally, the "Add New..." input fields in Sections and Room Configuration tables use placeholder-based selectors

| ID | Element | Type | Current Selector | Strategy | Priority | Suggested `data-testid` |
|----|---------|------|-----------------|----------|----------|------------------------|
| LOS-001 | Save Changes dialog container | alertdialog | `[role="alertdialog"]:has-text("Save Changes")` | Role + text match | MEDIUM | `local-office-settings-dialog-save-changes` |
| LOS-002 | Save Changes "Save" button | button | `[role="alertdialog"]:has-text("Save Changes") button:has-text("Save")` | Role + text match | MEDIUM | `local-office-settings-dialog-btn-save-confirm` |
| LOS-003 | Save Changes "Cancel" button | button | `[role="alertdialog"]:has-text("Save Changes") button:has-text("Cancel")` | Role + text match | MEDIUM | `local-office-settings-dialog-btn-save-cancel` |
| LOS-004 | Unsaved Changes dialog container | alertdialog | `[role="alertdialog"]:has-text("Any unsaved changes will be lost")` | Role + long text match | MEDIUM | `local-office-settings-dialog-unsaved-changes` |
| LOS-005 | Unsaved Changes "Stay" button | button | `[role="alertdialog"] button:has-text("Stay")` | Role + text match | MEDIUM | `local-office-settings-dialog-btn-unsaved-stay` |
| LOS-006 | Unsaved Changes "Discard" button | button | `[role="alertdialog"] button:has-text("Discard")` | Role + text match | MEDIUM | `local-office-settings-dialog-btn-unsaved-discard` |
| LOS-007 | Sections table "Add New..." input | input | `[data-testid="...tblSections"] input[placeholder="Add New..."]` | Placeholder text match | MEDIUM | `local-office-settings-input-sections-add-new` |
| LOS-008 | Room Configuration "Add New..." input | input | `[data-testid="...tblRoomConfig"] input[placeholder="Add New..."]` | Placeholder text match | MEDIUM | `local-office-settings-input-rooms-add-new` |

---

### 5.7 Auto Add-On -- Unsaved Changes Dialog

**Page**: Setup > Location Settings > Auto Add-On tab
**Current coverage**: 9 of 13 selectors use `data-testid` (69%)
**Impact**: The Auto Add-On tab uses a different Unsaved Changes dialog variant with "Stay" / "Discard" buttons (not the shared "OK" / "Cancel" variant in Section 5.2). This dialog triggers only on full page navigation away, not on sub-tab switching.

| ID | Element | Type | Current Selector | Strategy | Priority | Suggested `data-testid` |
|----|---------|------|-----------------|----------|----------|------------------------|
| AAO-001 | Unsaved Changes dialog container | alertdialog | `[role="alertdialog"]:has(h2:text-is("Unsaved changes"))` | Role + heading text match | MEDIUM | `location-settings-dialog-auto-addon-unsaved` |
| AAO-002 | Unsaved Changes "Stay" button | button | `[role="alertdialog"]:has(h2:text-is("Unsaved changes")) button:has-text("Stay")` | Role + text match | MEDIUM | `location-settings-dialog-btn-auto-addon-stay` |
| AAO-003 | Unsaved Changes "Discard" button | button | `[role="alertdialog"]:has(h2:text-is("Unsaved changes")) button:has-text("Discard")` | Role + text match | MEDIUM | `location-settings-dialog-btn-auto-addon-discard` |

---

### 5.8 Dynamic Grid Elements (Pricing Tab Rows)

**Page**: Setup > Location Settings > Pricing tab > Secondary Pricing grid
**Impact**: Price book grid rows are identified by text content, and individual cells within rows use `nth-child` column positions. Any column reorder breaks all cell selectors.

| ID | Element | Type | Current Selector | Strategy | Priority | Suggested `data-testid` |
|----|---------|------|-----------------|----------|----------|------------------------|
| DYN-001 | Price book row container | tr | `tr:has(td:has-text("{priceBookName}"))` | Text match on cell content | HIGH | `location-settings-pricing-row-{pricebook-name}` |
| DYN-002 | Price book: Is Alternative checkbox | checkbox | `tr:has(td:has-text("...")) td:nth-child(4) button[role="checkbox"]` | Text + nth-child(4) positional | CRITICAL | `location-settings-pricing-checkbox-{pricebook}-is-alternative` |
| DYN-003 | Price book: Use Effective Date checkbox | checkbox | `tr:has(td:has-text("...")) td:nth-child(5) button[role="checkbox"]` | Text + nth-child(5) positional | CRITICAL | `location-settings-pricing-checkbox-{pricebook}-use-effective-date` |
| DYN-004 | Price book: Start Date input | datepicker | `tr:has(td:has-text("...")) td:nth-child(6) input[data-slot="input"]` | Text + nth-child(6) positional | CRITICAL | `location-settings-pricing-input-{pricebook}-start-date` |
| DYN-005 | Price book: End Date input | datepicker | `tr:has(td:has-text("...")) td:nth-child(7) input[data-slot="input"]` | Text + nth-child(7) positional | CRITICAL | `location-settings-pricing-input-{pricebook}-end-date` |
| DYN-006 | Merchant dropdown option | option | `[role="listbox"] [role="option"]:has-text("{merchantName}")` | Role + text match | LOW | `location-settings-option-merchant-{merchant-name}` |
| DYN-007 | Currency filter option | option | `[role="listbox"] [role="option"]:has-text("{currency}")` | Role + text match | LOW | `location-settings-option-currency-{currency-code}` |
| DYN-008 | Office code navigation link | link | `a:has-text("{officeCode}")` | Tag + text match | LOW | `location-search-link-office-{office-code}` |

**Note on DYN-001 through DYN-005**: These elements repeat for each price book row in the grid. The `{pricebook-name}` placeholder should be replaced with a sanitized identifier (e.g., kebab-case price book name or a numeric row ID). This eliminates both text matching and positional column selectors.

---

### 5.9 Currency Tab

**Page**: Setup > Location Settings > Currency tab
**Current coverage**: 11 of 16 selectors use `data-testid` (69%)
**Impact**: Column headers and empty state message. Column headers are scoped within the table's `data-testid` container, making current selectors reasonably stable.

| ID | Element | Type | Current Selector | Strategy | Priority | Suggested `data-testid` |
|----|---------|------|-----------------|----------|----------|------------------------|
| CUR-001 | Column: Currency Code | th | `[data-testid="location-settings-table-currency"] th:has-text("Currency Code")` | Testid scope + text match | LOW | `location-settings-th-currency-code` |
| CUR-002 | Column: Selected | th | `[data-testid="location-settings-table-currency"] th:has-text("Selected"):not(:has-text("Is Default"))` | Testid scope + text match + negation | LOW | `location-settings-th-currency-selected` |
| CUR-003 | Column: Is Default | th | `[data-testid="location-settings-table-currency"] th:has-text("Is Default")` | Testid scope + text match | LOW | `location-settings-th-currency-is-default` |
| CUR-004 | Column: Merchant | th | `[data-testid="location-settings-table-currency"] th:has-text("Merchant")` | Testid scope + text match | LOW | `location-settings-th-currency-merchant` |
| CUR-005 | Empty state: No Matches Found | text | `[role="listbox"]:has-text("No Matches Found")` | Role + text match | LOW | `location-settings-label-no-matches` |

---

### 5.10 Notes Tab

**Page**: Setup > Location Settings > Notes tab
**Current coverage**: 5 of 12 selectors use `data-testid` (42%)
**Impact**: Action buttons, counters, progress bar, and table are scoped within the section's `data-testid` container. Current selectors are functional but rely on text, CSS class, or role within the scope.

| ID | Element | Type | Current Selector | Strategy | Priority | Suggested `data-testid` |
|----|---------|------|-----------------|----------|----------|------------------------|
| NOT-001 | Notes table | table | `[data-testid="location-settings-section-notes"] table` | Testid scope + tag | LOW | `location-settings-table-notes` |
| NOT-002 | Empty state: "No Notes Available" | td | `[data-testid="location-settings-section-notes"] td:has-text("No Notes Available")` | Testid scope + text match | LOW | `location-settings-label-no-notes` |
| NOT-003 | "Add" button | button | `[data-testid="location-settings-section-notes"] button:has-text("Add")` | Testid scope + text match | LOW | `location-settings-btn-notes-add` |
| NOT-004 | "Delete" button | button | `[data-testid="location-settings-section-notes"] button:has-text("Delete")` | Testid scope + text match | LOW | `location-settings-btn-notes-delete` |
| NOT-005 | Character counter label | div | `[data-testid="location-settings-section-notes"] div.text-\[11px\]` | Testid scope + Tailwind CSS class | MEDIUM | `location-settings-label-notes-char-counter` |
| NOT-006 | Character usage progress bar | progressbar | `[data-testid="location-settings-section-notes"] [role="progressbar"]` | Testid scope + role | LOW | `location-settings-progressbar-notes` |

**Note on NOT-005**: The character counter is currently targeted using a Tailwind CSS utility class (`text-[11px]`). This is the most fragile selector in this module -- any font size change in the UI will break it. Prioritize this element.

---

## 6. Naming Convention Reference

All suggested `data-testid` values in this report follow the patterns already established in the application. This table documents the convention for consistency when adding new attributes.

| Pattern | Example (existing in app) | When to Use |
|---------|--------------------------|-------------|
| `{page}-btn-{action}` | `location-settings-btn-save` | Action buttons (Save, Cancel, Add, Delete) |
| `{page}-checkbox-{feature}` | `location-settings-checkbox-apply-ldw` | Toggle checkboxes |
| `{page}-input-{field}` | `location-settings-input-oracle-product` | Text inputs, spinbuttons |
| `{page}-select-{field}` | `location-settings-select-billing-cycle` | Dropdown / combobox elements |
| `{page}-table-{name}` | `location-settings-table-currency` | Data tables |
| `{page}-sub-tab-{name}` | `location-settings-sub-tab-notes` | Tab trigger elements |
| `{page}-sub-tab-content-{name}` | `location-settings-sub-tab-content-notes` | Tab panel containers |
| `{page}-section-{name}` | `location-settings-section-notes` | Section wrapper elements |
| `{page}-form-{name}` | `location-settings-form-auto-add-on` | Form wrapper elements |
| `{page}-dialog-{name}` | *(new -- proposed)* | Dialog / alertdialog containers |
| `{page}-dialog-btn-{action}` | *(new -- proposed)* | Buttons within dialogs |
| `{page}-dialog-input-{field}` | *(new -- proposed)* | Inputs within dialogs |
| `{page}-dialog-table-{name}` | *(new -- proposed)* | Tables within dialogs |
| `{page}-th-{column}` | *(new -- proposed)* | Table column headers |
| `{page}-label-{description}` | *(new -- proposed)* | Static text labels, counters, status |
| `{page}-toast-{event}` | *(new -- proposed)* | Toast notification elements |
| `{page}-error-{type}` | *(new -- proposed)* | Validation error messages |

**Page prefixes in use:**
- `location-settings` -- Location Settings page (`/settings/location`)
- `local-office-settings` -- Local Office Settings page (`/settings/local-office`)
- `ect-settings` -- ECT Settings tab within Local Office Settings

**Dynamic row elements:**
For grid rows that repeat (pricing rows, shared setup rows, dialog result rows), include a row identifier in the `data-testid`:
- Pattern: `{page}-{element}-{row-identifier}-{field}`
- Example: `location-settings-pricing-row-us-labor-is-alternative`

---

## 7. Quick Wins -- Highest ROI Fixes

These three areas cover the most missing elements with the least development effort:

### 7a. Shared Dialogs (10 elements -- benefits ALL tabs)

The Error, Save Changes, and Unsaved Changes dialogs are shared components used by every Location Settings tab. Adding `data-testid` to these 10 elements (3 dialogs x ~3 elements each) eliminates fragile selectors across 9 automated test modules. **Fix once, benefit everywhere.**

Items: DLG-001 through DLG-010

### 7b. Pricing Tab (16 elements -- single worst module)

The Pricing tab has 6% `data-testid` coverage -- the lowest of any module. Only the Save button has a testid. All 5 pricing dropdowns, 2 checkboxes, the secondary pricing table, and all 7 column headers lack testids. This is the single largest cluster of missing attributes.

Items: PRI-001 through PRI-016

### 7c. Account List Dialog (12 elements -- shared dialog for account lookup)

The Account List dialog contains 4 search inputs, 2 dropdowns, 4 action buttons, a results table, and a row checkbox -- all without testids. This dialog is reused wherever account selection is needed.

Items: AA-006 through AA-018

**Combined quick win**: Fixing these 3 areas (38 elements) would raise overall `data-testid` coverage from 70% to approximately 83%.

---

## 8. Statistics

| Category | Count |
|----------|-------|
| Total selectors audited | 412 (287 static + 125 inline) |
| Using `data-testid` | 200 (70% of static selectors) |
| Excluded (third-party + structural) | 25 |
| **Missing `data-testid` filed in this report** | **100** |
| CRITICAL priority | 21 |
| HIGH priority | 45 |
| MEDIUM priority | 21 |
| LOW priority | 13 |

**Coverage projection after fixes:**

| Scenario | Coverage |
|----------|----------|
| Current state | 70% |
| After Quick Wins (38 elements) | ~83% |
| After all CRITICAL + HIGH fixes (66 elements) | ~93% |
| After all fixes (100 elements) | ~97% |

The remaining ~3% would be structural queries and third-party elements that intentionally do not use `data-testid`.

---

*Report generated by QA Automation Team. For questions about specific elements or selector strategies, contact the test automation team.*
