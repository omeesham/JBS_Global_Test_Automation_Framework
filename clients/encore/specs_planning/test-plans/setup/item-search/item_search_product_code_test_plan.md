# Item Search — Product Code Test Plan

**Module**: item-search
**Submodule**: PCD
**Page**: Products (`/locations/1101/products`) — row-selection toolbar + Product Code Details dialogs
**Test Entity**: Office 1101
**Governing Requirement**: NM-2253 (View Product Code NM-2255 / availability NM-2256); field lengths per NM-1742
**Updated**: 2026-09-03
**Total Scenarios**: 7
**Test Cases**: `item_search_product_code_test_cases.md`
**Sibling file**: `item_search_add_product_code_test_plan.md` — the Add Product Code cases (NM-2257), same TC-ISR-PCD-* sequence.
**On pickup of NM-2255**: narrow TC-ISR-PCD-009 (and TC-ISR-PCD-001) to the View dialog only; the Add dialog's discard is owned by TC-ISR-PCD-015 in the sibling plan. Until then the two overlap on the Add half by design.

---

## 1. Purpose

Cover the product-code layer behind the result grid: the selection-driven toolbar, the
"Product Code Details" dialog in its view flow, its three tabs (Item, Product Code History,
Translations), the five-segment scoping menu on the View split button, the dialogs' close-discards
behavior, and the availability button's presence. Nothing here saves. The Add Product Code flow
is a separate sub-task and lives in the sibling plan.

## 2. Scope

**In scope**: toolbar mounting on selection; view dialog structure and values on the Item tab;
History and Translations tab renders; segment rescoping via the View caret menu (all five segments);
silent discard on close; the availability button's presence.

**Out of scope, with reasons**:

| Excluded | Reason |
|---|---|
| The Add Product Code flow | A separate sub-task (NM-2257) — its dialog, cascade rule, field lengths and two real saves live in `item_search_add_product_code_test_plan.md`, same TC-ISR-PCD-* sequence |
| Saving view-dialog edits and translations | The View surface's own edit path (NM-2255); when the view dialog's Save enables is undetermined, so this pass asserts nothing about it |
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
| Nothing here saves | Every case clicks no Save and verifies typed values are discarded by Close; the saving cases moved to the Add plan |
| Field lengths, when this file gains cases for them | The View dialog carries the same 50 / 50 / 10 limits as the Add dialog; they are asserted in the Add plan. NM-1386's "256 characters" is stale — superseded by NM-1742 and confirmed when NM-1835 was closed as a rejection |

## 4. Scenarios

| TC ID | Scenario | Axis | Automatable |
|---|---|---|---|
| TC-ISR-PCD-001 | Selecting a row reveals the product-code toolbar | Surface — render/readiness | Yes |
| TC-ISR-PCD-002 | View Product Code opens the details dialog on the Item tab | Field (Axis 1) | Yes |
| TC-ISR-PCD-003 | The History tab shows the audit grid | Surface — render detail | Yes |
| TC-ISR-PCD-004 | The Translations tab lists four editable languages | Field (Axis 1) | Yes |
| TC-ISR-PCD-005 | The View segment menu rescopes the dialog | Field (Axis 1) | Yes |
| TC-ISR-PCD-009 | Closing a dialog with edits discards them silently | Field (Axis 1) — guard behavior | Yes |
| TC-ISR-PCD-010 | View Availability is present and enabled with a row selected | Field (Axis 1) — presence only | Yes |
