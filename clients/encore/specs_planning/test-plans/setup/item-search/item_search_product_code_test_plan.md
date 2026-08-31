# Item Search — Product Code Test Plan

**Module**: item-search
**Submodule**: PCD
**Page**: Products (`/locations/1101/products`) — row-selection toolbar + Product Code Details dialogs
**Test Entity**: Office 1101
**Governing Requirement**: NM-2253
**Updated**: 2026-08-31
**Total Scenarios**: 10
**Test Cases**: `item_search_product_code_test_cases.md`

---

## 1. Purpose

Cover the product-code layer behind the result grid: the selection-driven toolbar, the
"Product Code Details" dialog in view and add flows, its three tabs (Item, Product Code History,
Translations), the five-segment scoping menus on both split buttons, the type/service pairing
rule in the add form, and the dialogs' close-discards behavior. Nothing is ever saved.

## 2. Scope

**In scope**: toolbar mounting on selection; view dialog structure and values on the Item tab;
History and Translations tab renders; segment rescoping via both caret menus (the four working
view segments + the add-side Category); add form's required-empty state; the Product Type →
Service Type unlock-and-filter rule; silent discard on close; the availability button's presence.

**Out of scope, with reasons**:

| Excluded | Reason |
|---|---|
| Saving anything (view edits, adds, translations) | Creates permanent catalog data; the quick pass is read/field-level by design |
| The view menu's Category entry | Currently opens nothing — a defect record accompanies this module; the case covers the working segments and is extended when the fix lands |
| Availability behavior | Availability is driven by the date fields, which the product owner ruled not functional yet; only presence is asserted |
| In-dialog History grid behaviors (its own sorting/options) | Per-state duplicate of the page grid; deeper pass |
| When the view dialog's Save enables | Undetermined on rows with an incomplete required chain — asserting either way would guess |

## 3. Environment and data

Office 1101. The probed row was a labor product with a complete Category→Class chain and an
unset Sub Class (which is what proved the paired-selector lock at rest). Cases select whatever
first row the executed search returns — assertions are structural (sections, tabs, states),
not value-bound to a specific product.

## Shared execution constraints

| Constraint | Consequence for execution |
|---|---|
| The toolbar mounts only with a selected row | Every case clicks a row first and re-selects after any full grid re-render |
| Dialog controls re-render on tab switches | Element references are re-resolved after each tab click |
| Close discards edits silently | Cases relying on a clean dialog reopen it rather than trusting prior state |
| Nothing may be persisted | Save is never clicked; any typed value is discarded by Close and verified gone |

## 4. Scenarios

| TC ID | Scenario | Axis | Automatable |
|---|---|---|---|
| TC-ISR-PCD-001 | Selecting a row reveals the product-code toolbar | Surface — render/readiness | Yes |
| TC-ISR-PCD-002 | View Product Code opens the details dialog on the Item tab | Field (Axis 1) | Yes |
| TC-ISR-PCD-003 | The History tab shows the audit grid | Surface — render detail | Yes |
| TC-ISR-PCD-004 | The Translations tab lists four editable languages | Field (Axis 1) | Yes |
| TC-ISR-PCD-005 | The View segment menu rescopes the dialog | Field (Axis 1) | Yes |
| TC-ISR-PCD-006 | Add Product Code opens a required-empty form with Save held back | Field (Axis 1) | Yes |
| TC-ISR-PCD-007 | Choosing a Product Type unlocks and filters Service Type | Field (Axis 1) — paired selectors | Yes |
| TC-ISR-PCD-008 | The Add segment menu opens per-segment forms | Field (Axis 1) | Yes |
| TC-ISR-PCD-009 | Closing a dialog with edits discards them silently | Field (Axis 1) — guard behavior | Yes |
| TC-ISR-PCD-010 | View Availability is present and enabled with a row selected | Field (Axis 1) — presence only | Yes |
