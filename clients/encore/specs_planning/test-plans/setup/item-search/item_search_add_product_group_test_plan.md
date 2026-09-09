# Item Search — Create new Product Groups Test Plan

**Module**: item-search
**Submodule**: APG (Create new Product Groups — cases stay in the shared TC-ISR-PGR-* sequence)
**Page**: Add Product Group (`/locations/1101/products/product-groups` → Add — a route, not a dialog)
**Test Entity**: Office 1101
**Governing Requirement**: NM-2259 (Automate → Product → Create new Product Groups); parent story NM-2253. Behaviour rules from NM-1757, NM-2050, NM-1907; landing-page contradiction with NM-2043 / NM-2055 recorded on TC-ISR-PGR-011
**Updated**: 2026-09-09
**Total Scenarios**: 23
**Test Cases**: `item_search_add_product_group_test_cases.md`
**Sibling file**: `item_search_product_groups_test_plan.md` — the group list and search page (NM-2258)
**Field inventory**: `_internal/field-inventories/item-search-add-product-group-2026-09-09.md` (full re-walk)

---

## 1. Purpose

Cover the Add Product Group page completely: the form's required set and Save gating, both text
fields' boundaries and negative inputs, the Service Type option set, the server's uniqueness rules,
the sub-class picker's own controls (search, Labor filter, sort order, Reset, collapse) and both ways
of adding an item (double-click and drag), the Active flag's effect on the saved group, and both
exits (Cancel, browser Back). Three cases save for real and prove it by finding the group again on
the list page.

## 2. Scope

**In scope**: everything on the Add page that a user can touch — the eight form controls, the six
picker controls and the divider toggle — plus the server rules the Save exercises (required set,
name and description uniqueness, trimming, special characters, the Active status) and the post-save
landing.

**Out of scope, with reasons**:

| Excluded | Reason |
|---|---|
| The group list page's own search, Reset, pagination and Status rendering | A separate sub-task (NM-2258), covered by the sibling plan; this plan uses the list page only as the entry point and as the search-back oracle |
| Saving each of the 90 Service Type options | Every option's presence and order is asserted (TC-ISR-PGR-017); first and last are saved (011, 028). Ninety saves would leave ninety groups per run with no delete path — a per-option save adds no new mechanism to prove |
| Editing or deactivating a created group | The Edit page is a different route with its own form; no delete exists, so residue is accepted rather than cleaned |
| Role-based access (NM-2036) | The suite runs one automation user; the `rbac` surface family is a deferred family with no Encore template yet |
| Picker pagination / render-state | The catalog is one scrolling list (no pagination control) of plain-text rows (no links, booleans or badges) — neither family applies |
| Cross-office behaviour | Product groups are an admin feature pinned to office 1101 by the parent plan |

## 3. Environment and data

Office 1101 only. Values live in `src/data/product-groups/product-groups.ts`:

- create cases build a per-run unique Name (`ZZ E2E Group <timestamp>` and variants) and Description so reruns never collide;
- the duplicate cases reuse the fixture group **`ZZ E2E Walk 2026-09-09 A` / `walk probe A`** created by the 2026-09-09 walk — it is never edited, and if it is renamed or removed those two cases fail loudly, which is the intended signal;
- the Service Type oracle is the full 90-option list recorded in the inventory; the picker search word is `Scenery`; the catalog count, first row and last row are always read live before they are asserted on — never hard-coded (the catalog is data).

## Shared execution constraints

| Constraint | Consequence for execution |
|---|---|
| The Add page is a route, not a dialog | Leaving it is navigation; Cancel and browser Back are the covered exits, both silent |
| Every case enters from the group list page | Each case resets the list first, then clicks Add — the arrival state is always a fresh, empty form |
| Three cases persist | TC-ISR-PGR-011 (active create), 027 (inactive create) and 028 (special-character create) each leave one group per run — accepted residue on the writable e2e environment (LR-ENC-007). Every other case leaves through Cancel with nothing saved; the two duplicate cases are rejected by the server by design |
| A save is proven by reading it back | The toast and the 200 are never the proof; the case searches the new name on the list page after the landing |
| The catalog is large and fully rendered | 7,394 rows on 2026-09-09; counts are read live, and the list-count waits key on the rendered rows, never on a fixed sleep |
| The picker's collapsed inputs keep a DOM box | TC-ISR-PGR-026 asserts through the form's geometry and the toggle's label, never through an element-visible check |
| Post-save landing is the list page (observed) | Jira NM-2043 / NM-2055 say details page; the inventory carries the BUG-CANDIDATE. If the app changes, 011 / 027 / 028 fail at the landing step — the intended signal |

## 4. Scenarios

| TC ID | Scenario | Axis | Automatable |
|---|---|---|---|
| TC-ISR-PGR-006 | The Add page opens with a held-back Save | Field (Axis 1) | Yes |
| TC-ISR-PGR-007 | The sub-class picker shows its two panels | Field (Axis 1) | Yes |
| TC-ISR-PGR-008 | Cancel leaves the Add page without saving | Field (Axis 1) — guard behavior | Yes |
| TC-ISR-PGR-011 | A completed Add page saves a new product group and it is found again | Field (Axis 1) — create + persistence (LR-067) | Yes |
| TC-ISR-PGR-012 | Name accepts exactly 50 characters and drops the rest silently | Field (Axis 1) — BVA max / max+1 | Yes |
| TC-ISR-PGR-013 | Description accepts exactly 100 characters and drops the rest silently | Field (Axis 1) — BVA max / max+1 | Yes |
| TC-ISR-PGR-014 | Clearing a filled Name by either method holds Save back and marks the box invalid | Field (Axis 1) — required clear, NM-1907 | Yes |
| TC-ISR-PGR-015 | A whitespace-only Name counts as empty; a padded Name is accepted | Field (Axis 1) — negative | Yes |
| TC-ISR-PGR-016 | Every required field gates Save, and Active does not | Field (Axis 1) — required set | Yes |
| TC-ISR-PGR-017 | The Service Type list offers its 90 options with no search box, and first, middle and last all select | Field (Axis 1) — dropdown set + BVA first/last | Yes |
| TC-ISR-PGR-018 | A name already used by another group is rejected, with or without a trailing space | Field (Axis 1) — server rule, NM-1757 + trim | Yes |
| TC-ISR-PGR-019 | A description already used by another group is rejected even with a new name | Field (Axis 1) — server rule (undocumented) | Yes |
| TC-ISR-PGR-020 | The picker search filters the catalog by substring regardless of case and empties on no match | Surface (Axis 2) — result-fidelity + empty-vol | Yes |
| TC-ISR-PGR-021 | The Labor filter narrows the catalog and unchecking restores it | Interaction (Axis 3) — filter delta | Yes |
| TC-ISR-PGR-022 | Sort order flips the catalog between ascending and descending | Surface (Axis 2) — sorting | Yes |
| TC-ISR-PGR-023 | Reset clears the picker's search, filter and sort but keeps an added sub-class | Surface (Axis 2) — combination; NM-2050 | Yes |
| TC-ISR-PGR-024 | Double-click adds an item once and the × control removes it | Interaction (Axis 3) — dual-list add/remove | Yes |
| TC-ISR-PGR-025 | Dragging an item onto the Sub Classes area adds it | Interaction (Axis 3) — drag-and-drop source row | Yes |
| TC-ISR-PGR-026 | The divider button collapses and expands the sub-class panel | Interaction (Axis 3) — toggle delta | Yes |
| TC-ISR-PGR-027 | A group saved with Active cleared is created inactive and found with the list's Active filter cleared | Field (Axis 1) — checkbox save-cycle | Yes |
| TC-ISR-PGR-028 | Special characters in the name are stored verbatim and the last Service Type saves | Field (Axis 1) — negative + dropdown last-option save-cycle | Yes |
| TC-ISR-PGR-029 | Browser Back leaves the Add page without saving or warning | Surface (Axis 2) — persistence (navigate-away) | Yes |
| TC-ISR-PGR-030 | The breadcrumb leaves the Add page without saving or warning | Surface (Axis 2) — persistence (navigate-away, breadcrumb) | Yes |

### Surface families for the picker list (LR-065)

- **result-fidelity** → TC-ISR-PGR-020 · **sorting** → 022 · **combination** → 023 · **empty-vol** → 020 (zero rows, no message) · **persistence** → 029, 030 (no navigate-away guard; the page holds no stored state to survive a reload)
- `out-of-scope:pagination=the catalog is a single scrolling list with no pagination control`
- `out-of-scope:render-state=the catalog rows are plain text — no links, booleans or badges to render`
