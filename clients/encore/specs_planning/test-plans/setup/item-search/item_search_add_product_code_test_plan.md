# Item Search — Add Product Code Test Plan

**Module**: item-search
**Submodule**: APC (Add Product Code — cases stay in the shared TC-ISR-PCD-* sequence)
**Page**: Products (`/locations/1101/products`) — row-selection toolbar + Add Product Code dialog
**Test Entity**: Office 1101
**Governing Requirement**: NM-2257 (Automate → Product → Add Product Code); feature spec NM-1386; field lengths per NM-1742
**Updated**: 2026-09-03
**Total Scenarios**: 8
**Test Cases**: `item_search_add_product_code_test_cases.md`
**Sibling file**: `item_search_product_code_test_plan.md` — View Product Code and availability (NM-2255 / NM-2256)

---

## 1. Purpose

Cover the Add Product Code flow end to end: the dialog's required-empty state, the Product Type →
Service Type pairing rule, the five per-segment forms behind the split button's menu, the maximum
lengths of its three text boxes including what happens when the typing limit is bypassed, the
silent discard on close, and two real saves — an ordinary name and a name at the exact length limit,
each proven by finding the created code again.

## 2. Scope

**In scope**: the Add Product Code dialog on the Item segment — required-empty render, Save gating,
the Product Type → Service Type unlock-and-filter rule, the segment menu opening per-segment forms,
Name / Item Description / Oracle Item Number maximum lengths, refusal of an over-length pasted value,
discard-on-close, and creation with search-back persistence.

**Out of scope, with reasons**:

| Excluded | Reason |
|---|---|
| The View Product Code dialog, its three tabs and its segment menu | A separate sub-task (NM-2255), covered by the sibling Product Code plan |
| The View Availability button | A separate sub-task (NM-2256); the feature is tied to the date fields, which the product owner has ruled are not functional yet |
| The toolbar-reveal case | Selecting a row is a precondition of every case here rather than a case of its own; the toolbar-reveal case (TC-ISR-PCD-001) lives in the sibling Product Code plan |
| Saving from the four non-Item Add segments | Sub Class / Class / Sub Category / Category each open their own hierarchy-level form and create catalog-classification nodes, not product codes — a catalog-management feature outside this epic. Waived with the live probe recorded in the field inventory; the menu itself is still covered |
| Content or character-class validation on the text boxes | The business analyst ruled on NM-1835 that any characters are acceptable and only field size matters, so a value such as `.....` is valid by design |
| Translations on create | Removed from the Add flow during development (NM-1386): product managers do not set translations at creation, and translations are edit-only |

## 3. Shared execution constraints

| Constraint | Consequence for execution |
|---|---|
| The Add button mounts only with a selected row | Every case runs a search and selects a row first |
| Service Type is locked until a Product Type is chosen | Cases fill the form in that order; the pairing rule is asserted rather than worked around |
| Close discards edits silently | Cases needing a clean form reopen the dialog rather than trusting prior state |
| Two cases persist | TC-ISR-PCD-011 and TC-ISR-PCD-014 each save a per-run unique code and prove it by search-back. A product code has no hard delete, so each run leaves its record on office 1101 as accepted test residue; the reversal would be a deactivate, which this pass does not exercise |
| Field lengths are the ratified legacy sizes | Length cases assert 50 (Name, Item Description) and 10 (Oracle Item Number). NM-1386's "256 characters" is stale — superseded by NM-1742's `NVARCHAR(50)` column change and confirmed when NM-1835 was closed as a rejection |

## 4. Scenarios

| TC ID | Scenario | Axis | Automatable |
|---|---|---|---|
| TC-ISR-PCD-006 | Add Product Code opens a required-empty form with Save held back | Field (Axis 1) — default state + Save gating | Yes |
| TC-ISR-PCD-007 | Choosing a Product Type unlocks and filters Service Type | Field (Axis 1) — cascade pair | Yes |
| TC-ISR-PCD-008 | The Add segment menu opens per-segment forms | Field (Axis 1) — segment scoping | Yes |
| TC-ISR-PCD-011 | A completed Add Product Code form saves and the new code is found again | Field (Axis 1) — create + persistence | Yes |
| TC-ISR-PCD-012 | The text fields stop accepting input at their maximum lengths | Field (Axis 1) — boundary, max / max+1 by typing | Yes |
| TC-ISR-PCD-013 | An over-length value that bypasses the typing limit cannot be saved | Field (Axis 1) — boundary, max+1 by paste + positive control | Yes |
| TC-ISR-PCD-014 | A name at exactly the 50-character limit saves and reads back complete | Field (Axis 1) — boundary at max + persistence | Yes |
| TC-ISR-PCD-015 | Closing the Add dialog with a part-filled form discards it silently | Field (Axis 1) — guard behavior | Yes |
