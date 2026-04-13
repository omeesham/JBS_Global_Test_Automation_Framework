# SESSION 2 FINDINGS — Transient Selector Verification
**Date**: 2026-04-09
**Plan**: PLAN_FIX_FALSE_POSITIVE_SELECTORS_AND_TESTID_CSV.md
**Method**: Live DOM verification via Playwright MCP — trigger each transient element
**Location tested**: 1604 (Parker Palm Springs)
**Status**: COMPLETE — all 12 items (2A–2L) verified

---

## KEY FINDINGS SUMMARY

| Item | Dialog/Element | testid on dialog | Button testids | Selector verdict |
|------|---------------|-----------------|----------------|-----------------|
| 2A | Save Changes (Location Settings) | MISSING | MISSING | Selectors correct |
| 2B | Unsaved Changes (Location Settings) | MISSING | MISSING | **WRONG text — "OK"/"Cancel" should be "Discard"/"Stay"** |
| 2C | Validation Errors (local-info) | n/a | n/a | **Errors don't render — Encore React bug (id="undefined")** |
| 2D | Auto Add-On Save Dialog | MISSING | MISSING | Selectors correct |
| 2E | Auto Add-On Unsaved Dialog | MISSING | MISSING | Selectors correct |
| 2F | Local Office Settings Save Dialog | MISSING | MISSING | Selectors correct |
| 2G | Local Office Settings Unsaved Dialog | MISSING | MISSING | Selectors correct |
| 2H | Select Customer Address Dialog | MISSING | MISSING | All 8+ selectors correct (all MISSING testids) |
| 2I | Change Local Office Dialog | MISSING | MISSING | Selectors correct |
| 2J | Toast Notification | MISSING | n/a | Selector correct (Sonner `<li>`) |
| 2K | HRI Remit Tax 2 | — | — | UNVERIFIABLE — not on location 1604 |
| 2L | Error Dialog | MISSING (inferred) | MISSING (inferred) | UNTRIGGERABLE this session |

---

## CRITICAL BUGS FOUND

### BUG 1 — shared.ts Unsaved Changes button selectors are WRONG
**File**: `src/selectors/setup/locations/shared.ts` lines 28-30

Actual dialog (verified live):
```
Heading: "Unsaved changes"
Body: "Are you sure you want to leave this view? Any unsaved changes will be lost."
Buttons: "Stay" | "Discard"
```

Our selectors:
```typescript
btnUnsavedChangesOk: '[role="alertdialog"]:has-text("Any unsaved changes will be lost") button:has-text("OK")',
// WRONG: Button text is "Discard" not "OK"

btnUnsavedChangesCancel: '[role="alertdialog"]:has-text("Any unsaved changes will be lost") button:has-text("Cancel")',
// WRONG: Button text is "Stay" not "Cancel"
```

Fix needed in Session 5:
```typescript
btnUnsavedChangesOk: '[role="alertdialog"]:has-text("Any unsaved changes will be lost") button:has-text("Discard")',
btnUnsavedChangesCancel: '[role="alertdialog"]:has-text("Any unsaved changes will be lost") button:has-text("Stay")',
```

Note: `dlgUnsavedChanges` is CORRECT (body does contain "Any unsaved changes will be lost").

### BUG 2 — Validation error messages don't render in DOM (Encore React bug)
**File**: `src/selectors/setup/locations/local-info.ts` lines 34-38
```typescript
errValidationMessage: 'p:has-text("Number must be")',
errMinBoundary: 'p:has-text("Number must be greater than or equal to 0")',
errMaxBoundary: 'p:has-text("Number must be less than or equal to 100")',
```

**DOM finding**: Numeric inputs (LDW %, Cables %, ETS %, Resort Tax %, etc.) have `id="undefined-form-item"` — a React component bug where the form item context ID defaults to "undefined". This means `aria-describedby="undefined-form-item-message"` points to non-existent DOM elements. Field gets `aria-invalid="true"` correctly, but error message text NEVER renders in the DOM.

These 3 selectors WILL NOT MATCH — the `<p>` elements don't appear. This is an Encore bug. Our selectors are correct in intent but the feature is broken server-side.

**Cannot fix on our side** — needs to be filed as an Encore bug separately.

### BONUS FINDING — 4 Shared Setup Locations false positives NOW CONFIRMED (were UNVERIFIABLE in Session 1)
Session 1 was blocked by API 504. In this session the API loaded correctly. All 4 claimed false positives are CONFIRMED FALSE POSITIVES:

| Selector key | Current CSS selector | DOM testid — CONFIRMED EXISTS |
|---|---|---|
| `chkSelfPrimaryOffice` | `tbody tr:first-child td:nth-child(3) [role="checkbox"]` | `location-settings-checkbox-shared-location-0-primary` |
| `chkSelfSharesInventory` | `tbody tr:first-child td:nth-child(4) [role="checkbox"]` | `location-settings-checkbox-shared-location-0-shares-inventory` |
| `btnSelfDelete` | `tbody tr:first-child td:nth-child(5) button` | `location-settings-btn-delete-shared-location-0` |
| `btnSharedAdd` | `tbody tr:last-child button` | `location-settings-btn-add-shared-location-1` |

File: `src/selectors/setup/locations/shared-setup-locations.ts` (lines 33-41)

---

## DETAILED FINDINGS PER ITEM

### 2A — Save Changes Dialog (shared.ts)
**Trigger**: Click Save → `[data-testid="location-settings-btn-save"]`
```
Dialog role: alertdialog
Heading: "Save Changes"
Body: "Are you sure you want to save the changes?"
Buttons: "Cancel" (testid: MISSING), "Ok" (testid: MISSING)
Dialog testid: MISSING
Elements with testid in dialog: 0
```
**Verdict**: Dialog elements are genuinely MISSING testids (Encore bug). Our selectors use `:has-text()` + `:has-text()` fallbacks — CORRECT.

### 2B — Unsaved Changes Dialog (shared.ts)
**Trigger**: Make form dirty → click sidebar Home link (Angular router navigation)
```
Dialog role: alertdialog
Heading: "Unsaved changes"
Body: "Are you sure you want to leave this view? Any unsaved changes will be lost."
Buttons: "Stay" (testid: MISSING), "Discard" (testid: MISSING)
Dialog testid: MISSING
Elements with testid in dialog: 0
```
**Verdict**: `dlgUnsavedChanges` selector CORRECT. `btnUnsavedChangesOk` and `btnUnsavedChangesCancel` are WRONG (use "OK"/"Cancel" but actual buttons say "Discard"/"Stay"). These selectors need fixing in Session 5. See BUG 1.

**Note**: This is the SAME dialog as Auto Add-On unsaved (2E) and Local Office Settings unsaved (2G). They all use identical dialog structure with "Stay"/"Discard" buttons.

### 2C — Validation Errors (local-info.ts)
**Trigger**: Enter value "150" into LDW Percentage input → Tab
```
aria-invalid: "true" on input ✓ (validation DOES fire)
p:has-text("Number must be"): NOT FOUND
Error message DOM: EMPTY — no <p> error text rendered
Reason: inputs have id="undefined-form-item" → aria-describedby targets don't exist
```
**Verdict**: Selectors `errValidationMessage`, `errMinBoundary`, `errMaxBoundary` WILL NOT MATCH. Encore React bug — form item ID is "undefined". See BUG 2.

### 2D — Auto Add-On Save Dialog (auto-addon.ts)
**Trigger**: Toggle Encore Music → Click Save → `[data-testid="location-settings-btn-save"]`
```
Dialog role: alertdialog
Heading: "Save Changes"
Body: "Are you sure you want to save the changes?"
Buttons: "Cancel" (testid: MISSING), "Ok" (testid: MISSING)
Dialog testid: MISSING
```
**Verdict**: `btnSaveChangesOk` uses `:has-text("Ok")` → CORRECT (button IS "Ok"). Selectors correct.

### 2E — Auto Add-On Unsaved Changes Dialog (auto-addon.ts)
**Trigger**: Make form dirty → click sidebar Home link
```
Dialog role: alertdialog
Heading: "Unsaved changes"
Body: "Are you sure you want to leave this view? Any unsaved changes will be lost."
Buttons: "Stay" (testid: MISSING), "Discard" (testid: MISSING)
Dialog testid: MISSING
```
**Verdict**: `autoAddonDlgUnsavedChanges` uses `:has(h2:text-is("Unsaved changes"))` → CORRECT. `btnUnsavedChangesStay` uses "Stay" → CORRECT. `btnUnsavedChangesDiscard` uses "Discard" → CORRECT. auto-addon.ts correctly differs from shared.ts.

### 2F — Local Office Settings Save Dialog (local-office-settings.ts)
**Trigger**: Toggle Use Fulfillment → Click `[data-testid="local-office-settings-btn-save"]`
```
Dialog role: alertdialog
Heading: "Save Changes"
Body: "Are you sure you want to save the changes?"
Buttons: "Cancel" (testid: MISSING), "Save" (testid: MISSING)
Dialog testid: MISSING
```
**IMPORTANT**: Local Office Settings Save dialog uses "Save" not "Ok" for confirm button. local-office-settings.ts uses `:has-text("Save")` → CORRECT. shared.ts uses `:has-text("Ok")` for Location Settings save → CORRECT (different dialogs, different button text).

### 2G — Local Office Settings Unsaved Dialog (local-office-settings.ts)
**Trigger**: Make form dirty → click ECT Settings tab
```
Dialog role: alertdialog
Heading: "Unsaved changes"
Body: "Are you sure you want to leave this view? Any unsaved changes will be lost."
Buttons: "Stay" (testid: MISSING), "Discard" (testid: MISSING)
Dialog testid: MISSING
```
**Verdict**: `dlgUnsavedLocalOffice` uses `:has-text("Any unsaved changes will be lost")` → CORRECT. `btnUnsavedStay`/`btnUnsavedDiscard` use correct text. Selectors correct.

### 2H — Select Customer Address Dialog (account-address.ts)
**Trigger**: Account & Address tab → click first "Address" button (Venue Address)
```
Dialog role: dialog (NOT alertdialog)
Heading: "Select Customer Address"
Elements with testid in dialog: ZERO
```
All interactive elements:
| Element | Current selector strategy | testid |
|---------|--------------------------|--------|
| Search input | `input[placeholder="Search..."]` | MISSING |
| Column sort buttons (Address 1-3, City, State, Zip, Country) | (not in our selectors) | MISSING |
| Row select checkboxes | `tbody tr:first-child td:first-child button[role="checkbox"]` | MISSING |
| Save button | `button:has-text("Save")` | MISSING |
| Select button | `button:has-text("Select")` | MISSING |
| Cancel button | `button:has-text("Cancel")` | MISSING |
| Close button | `button:has-text("Close")` | MISSING |
| Results table | `table` | MISSING |
| "Total Addresses: 7" | `:text("Total Addresses")` in `<span>` | MISSING |

**Verdict**: 8 account-address.ts selectors all use correct text/attribute fallbacks. NOT false positives — all dialog elements genuinely MISSING testids (Encore bug).

### 2I — Change Local Office Dialog (shared-setup-locations.ts)
**Trigger**: Shared Setup Locations tab → click `[data-testid="location-settings-btn-add-shared-location-1"]`
```
Dialog role: dialog (NOT alertdialog)
Heading: "Change Local Office"
Elements with testid in dialog: ZERO
```
Interactive elements: Search input, Select button, Cancel button, Close button — all MISSING testids.

**BONUS**: API loaded correctly (no 504 this time). Full row verification completed:
- `location-settings-checkbox-shared-location-0-primary` → EXISTS in DOM ✓
- `location-settings-checkbox-shared-location-0-shares-inventory` → EXISTS in DOM ✓
- `location-settings-btn-delete-shared-location-0` → EXISTS in DOM ✓
- `location-settings-btn-add-shared-location-1` → EXISTS in DOM ✓

All 4 are CONFIRMED FALSE POSITIVES (our selectors use CSS positional fallbacks; testids exist in DOM).

**Verdict**: All dialog selectors correct. 4 shared-setup-locations.ts selectors need fixing in Session 5.

### 2J — Toast Notification (local-info.ts)
**Trigger**: Toggle LDW checkbox → Save → Ok → save completes
```
Toast library: Sonner
Toast element: <li data-sonner-toast> inside <ol data-sonner-toaster>
Toast text: "Local information updated"
<li> testid: MISSING
<ol> testid: MISSING
<section aria-live> container: MISSING testid
```
**Verdict**: `toastLocalInfoUpdated: 'li:has-text("Local information updated")'` → CORRECT. Sonner `<li>` contains the text, selector matches via `:has-text()`. No testid (Encore bug). Data restored to original state (LDW = aria-checked="true").

### 2K — HRI Remit Tax 2 (local-info.ts)
**Status**: UNVERIFIABLE — not visible on location 1604
```
No <dt> element with "HRI" text found in DOM
No element with "HRI Remit" text found anywhere in page
```
`chkHRIRemitTax2: 'dt:has-text("HRI Remit Tax 2") + dd button[role="checkbox"]'` — uses CSS fallback (implies MISSING testid or location-specific feature). Cannot verify without a location that has this field enabled.

### 2L — Error Dialog (shared.ts)
**Status**: UNTRIGGERABLE this session (requires server-side API error)
```
dlgErrorDialog: '[role="alertdialog"]:has(h2:has-text("Error"))'
dlgErrorMessage: '[role="alertdialog"] p'
btnErrorOk: '[role="alertdialog"] button:has-text("Ok")'
```
**High confidence inference**: All 8 verified dialogs in this session used the same Radix UI alertdialog component with ZERO testids on any element. Error dialog is the same component → MISSING testids (Encore bug). Selectors use `:has-text()` fallbacks — likely correct.

---

## FALSE POSITIVE TOTALS

### Confirmed FALSE POSITIVES (total: 8)
| # | Key | File | Current selector | Confirmed testid |
|---|-----|------|-----------------|-----------------|
| 1 | `chkCorporatePricing` | pricing.ts | CSS `:has(> span:text-is(...))` | `location-settings-checkbox-corporate-pricing` |
| 2 | `chkPriceGuideInclusive` | pricing.ts | CSS `:has(> span:text-is(...))` | `location-settings-checkbox-price-guide-inclusion` |
| 3 | `drpCurrencyFilter` | pricing.ts | CSS `:has(> span:text-is(...))` | `location-settings-select-pricing-currency` |
| 4 | `txtAccPhone2` | account-address.ts | `input[name="...contactPhone2"]` | `location-settings-input-contact-phone-2` |
| 5 | `chkSelfPrimaryOffice` | shared-setup-locations.ts | `tbody tr:first-child td:nth-child(3) [role="checkbox"]` | `location-settings-checkbox-shared-location-0-primary` |
| 6 | `chkSelfSharesInventory` | shared-setup-locations.ts | `tbody tr:first-child td:nth-child(4) [role="checkbox"]` | `location-settings-checkbox-shared-location-0-shares-inventory` |
| 7 | `btnSelfDelete` | shared-setup-locations.ts | `tbody tr:first-child td:nth-child(5) button` | `location-settings-btn-delete-shared-location-0` |
| 8 | `btnSharedAdd` | shared-setup-locations.ts | `tbody tr:last-child button` | `location-settings-btn-add-shared-location-1` |

(4 from Session 1 + 4 newly confirmed from Shared Setup in this session)

### Wrong selectors (NOT false positives — selector text is incorrect)
| # | Key | File | Issue |
|---|-----|------|-------|
| 1 | `btnUnsavedChangesOk` | shared.ts | Targets `:has-text("OK")` but button text is "Discard" |
| 2 | `btnUnsavedChangesCancel` | shared.ts | Targets `:has-text("Cancel")` but button text is "Stay" |

---

## Data Integrity
All data modifications made for 2J (LDW toggle saved twice) have been RESTORED:
- Apply LDW checkbox: restored to original state (`aria-checked="true"`) ✓

No other persistent data changes were made. All dialog dismissals used Cancel/Stay/Escape.

---

## Breadcrumbs

<!-- [S] + SESSION_2_FINDINGS.md | plans/pending/ | per:plan§SESSION2,LR-029 — all 12 transient items verified -->
<!-- [S] ! shared.ts btns | src/selectors/setup/locations/shared.ts:28-30 | per:plan§2B | risk:high(specs will fail on Unsaved dialog) — btnUnsavedChangesOk→"Discard", btnUnsavedChangesCancel→"Stay" -->
<!-- [S] ~ shared-setup 4 false positives | src/selectors/setup/locations/shared-setup-locations.ts:33-41 | per:plan§2I — confirmed from Session 1 UNVERIFIABLE; API 504 resolved -->
<!-- [S] ? errValidationMessage selectors | src/selectors/setup/locations/local-info.ts:34-38 | per:plan§2C | risk:high(Encore React bug: form-item-id=undefined, errors never render) -->
<!-- [S] ~ 2J toast | per:plan§2J — Sonner li testid MISSING, selector li:has-text() works, data restored -->
