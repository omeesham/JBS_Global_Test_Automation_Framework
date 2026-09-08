# Item Search — Create new Product Groups Test Plan

**Module**: item-search
**Submodule**: APG (Create new Product Groups — cases stay in the shared TC-ISR-PGR-* sequence)
**Page**: Add Product Group (`/locations/1101/products/product-groups` → Add — a route, not a dialog)
**Test Entity**: Office 1101
**Governing Requirement**: NM-2259 (Automate → Product → Create new Product Groups); parent story NM-2253
**Updated**: 2026-09-08
**Total Scenarios**: 4
**Test Cases**: `item_search_add_product_group_test_cases.md`
**Sibling file**: `item_search_product_groups_test_plan.md` — the group list and search page (NM-2258)

---

## 1. Purpose

Cover the Add Product Group page: its required-empty form, the held-back Save, the two-panel
sub-class picker, and Cancel's silent discard. One case goes the whole way — it completes the
form, saves a new group, and proves it persists by finding it again on the list page.

## 2. Scope

**In scope**: the Add page's field-level form state (required flags, held-back Save, checked
Active, picker structure); Cancel's silent discard; one real create — a completed Add page saves
a new group (sub-class added by double-click) and is found again by search.

**Out of scope, with reasons**:

| Excluded | Reason |
|---|---|
| The group list page, its search, Reset and pagination | A separate sub-task (NM-2258), covered by the sibling Search For Product Groups plan; this plan uses the list page only as the entry point and the search-back oracle |
| The drag path for adding a sub-class | The reliable double-click path is covered by the create case (TC-ISR-PGR-011); drag is flaky and frequently never fires the drop, so it rides the deeper pass |
| The Service Type dropdown's option set | Unenumerated at this tier |
| Editing or deactivating a created group | No hard delete exists and the deactivate-via-edit path was not pinned this pass; it rides the deeper pass |

## 3. Environment and data

Office 1101. The create case builds a per-run unique Name and Description so repeated runs never
collide, chooses `Equipment Rental` as the Service Type, and adds the first available sub-class by
double-click.

## Shared execution constraints

| Constraint | Consequence for execution |
|---|---|
| The Add page is a route, not a dialog | Leaving it is navigation; Cancel is the covered exit |
| Every case enters from the group list page | Each case resets the list first, then clicks Add — the arrival state is always clean |
| Only the create case persists | The other three click no Save; Cancel discards every typed value. TC-ISR-PGR-011 is the single exception — it saves a per-run unique group, proven by search-back (LR-067), leaving the record as accepted e2e residue (LR-ENC-007) |
| A save is proven by reading it back | The toast and the 200 are never the proof; the case searches the new name on the reloaded list |

## 4. Scenarios

| TC ID | Scenario | Axis | Automatable |
|---|---|---|---|
| TC-ISR-PGR-006 | The Add page opens with a held-back Save | Field (Axis 1) | Yes |
| TC-ISR-PGR-007 | The sub-class picker shows its two panels | Field (Axis 1) | Yes |
| TC-ISR-PGR-008 | Cancel leaves the Add page without saving | Field (Axis 1) — guard behavior | Yes |
| TC-ISR-PGR-011 | A completed Add page saves a new product group and it is found again | Field (Axis 1) — create + persistence (LR-067) | Yes |
