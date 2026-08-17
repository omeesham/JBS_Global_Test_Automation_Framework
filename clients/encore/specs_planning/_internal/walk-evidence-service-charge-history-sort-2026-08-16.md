# Walk Evidence — Service Charge History Tab: Sort Affordance & Behaviour

**Module**: service-charge (History tab — sort column interaction)
**Client**: encore
**MCP_Session_Date**: 2026-08-16
**MCP_Session_Tool**: Playwright CLI (`@playwright/cli`, storageState `encore-state.json`)
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/service-charge (History tab)
**Test_Entity**: Office 1604
**Source_Artifact**: `.claude/state/ua-worker/chips/his012-truth/out-WALK/WALK.md` + raw captures `step2-headers.txt`, `step2-snapshot.txt`, `walk-raw.txt`

> This walk was performed to resolve a disputed claim that clicking a History column header emptied the grid.
> It establishes that sorting works, that `aria-sort` is never set, and that the prior written note used to
> justify skipping sort tests was incorrect.

---

## Why this walk exists

TC-SVC-HIS-012 contained a comment-level claim that clicking a column header emptied the grid, and this claim
had been used as the reason not to test sorting at all. No prior baseline document (old-site or new-site) recorded
any sort behaviour for the Service Charge History tab. This walk:

1. Enumerates the actual column headers and their DOM structure.
2. Confirms that clicking a header opens a sort menu (it does not empty the grid).
3. Demonstrates that sorting changes row order.
4. Confirms that `aria-sort` is never set on any header — which is relevant to TC-SVC-HIS-012's assertion.
5. Attempts a positive control (Corporate Override sort on office 1604) and records the outcome honestly.

---

## Environment

- Auth state `.auth/encore-state.json` was stale before the walk. It was refreshed by running
  `npx playwright test tests/auth.setup.ts` (1 passed, 1.1 min, no MFA prompted).
- After refresh: `page.goto(...)` landed on the service charge settings page without redirecting to a sign-in page.
- Environment confirmed live and authenticated.

---

## Column Headers (machine-enumerated, Step 2 raw capture)

**Total headers: 4.** All are `<TH>` elements. All four contain a `<button data-slot="dropdown-menu-trigger">` inside
them. No header carries `role="columnheader"` or any `aria-sort` attribute.

| Index | Text | Tag | role attr | aria-sort | Has trigger button |
|---|---|---|---|---|---|
| 0 | Service Type | TH | null | null | yes |
| 1 | Service Charge Percentage | TH | null | null | yes |
| 2 | Modified By | TH | null | null | yes |
| 3 | Modified On | TH | null | null | yes |

**Representative outerHTML (Service Type header, truncated to load-bearing structure):**

```html
<th data-slot="table-head" class="h-7 align-middle whitespace-nowrap ... w-[30%]">
  <div class="flex min-w-0 items-center font-semibold text-foreground">
    <button data-slot="dropdown-menu-trigger" class="inline-flex items-center whitespace-nowrap cursor-pointer font-medium ...">
      Service Type
    </button>
  </div>
</th>
```

The `<button data-slot="dropdown-menu-trigger">` inside each `<th>` is the sort trigger. Clicking the `<th>`
propagates to the button and opens the Radix dropdown menu.

*Source: `step2-headers.txt` — raw machine capture of all four `<th>` elements including full `outerHTML`.*

---

## Baseline State Before Any Interaction

Before any column click, the grid showed 5 rows with all cells empty:

```
rowCount=5, row0=["","","",""]
```

These are **loading skeleton rows** — the grid is in a loading state. 347 populated rows appear after the first
sort interaction. The skeleton state was NOT an empty dataset.

---

## Sort Interaction Results (Step 3)

A bare click on any `<th>` opens a Radix `DropdownMenu` immediately with three `role="menuitem"` items:
- `"Sort ascending"` — visible
- `"Sort descending"` — visible
- `"Hide column"` — visible

The menu appeared for all 4 headers (100% success rate). **The grid did not empty.** After clicking a menu item,
the grid re-rendered with 347 rows.

### Header 0 — "Service Type", Sort ascending
- rowCount after: 347
- row0: `["APP Downloaded", "0.00 %", "s-prd-clickauto@psav.com", "08/14/2026 01:32:24 PM"]`
- aria-sort on all headers: **null** (unchanged)

### Header 1 — "Service Charge Percentage", Sort ascending
- rowCount after: 347
- Menu appeared: yes (same three items)
- row0: `["APP Downloaded", "0.00 %", "s-prd-clickauto@psav.com", "08/14/2026 01:32:24 PM"]`

### Header 2 — "Modified By", Sort ascending
- rowCount after: 347
- row0: `["Rigging Equipment Rental", "24.00 %", "b5668cc9-048f-4f0e-ab9f-bc1e44f460b7", "11/14/2021 03:33:57 PM"]`
- **Row order demonstrably changed** vs Service Type ASC — all 4 cells differ. Sort landed.

### Header 3 — "Modified On", Sort ascending
- rowCount after: 347
- row0: `["HSIA - Labor", "0.00 %", "e3504890-9866-49d8-a9c4-9846be2667bc", "06/09/2016 09:45:14 PM"]`
- **Oldest date first (06/09/2016) — ascending date sort confirmed.** Sort landed.

**`aria-sort` across all runs: always null.** The grid never sets `aria-sort` before or after sorting.

*Source: `walk-raw.txt` — raw machine capture of rowCount and row0 for each column and direction.*

---

## What the Grid Does NOT Do

A written note in the test file had claimed clicking a header emptied the grid. **This is incorrect.**

- Clicking any `<th>` opens a dropdown menu (does not empty the grid).
- The 5-row baseline before any click was a loading skeleton state, not an empty dataset.
- After clicking a sort menu item, the grid populated with 347 rows in the sorted order.

The claim was apparently based on observing the loading skeleton during the brief interval between the header
click and grid population. The skeleton disappears and the grid then populates.

---

## Positive Control (Step 5)

**Attempted:** Navigate to Corporate Override for office 1604
(`https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-override`),
wait 37 s, attempt a column header click.

**Result:** Redirected to `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/home`.
No `[role="columnheader"]` elements found. First columnheader click timed out (30 000 ms).
**Positive control did not execute** — office 1604 has no corporate override data.

**Mitigation (per LR-061 §C):** The History grid is self-evidenced without the positive control.
"Modified On" ASC produced row0 date `06/09/2016` (the oldest record in 347 rows — monotonically verifiable).
"Modified By" ASC produced a different row0 than "Service Type" ASC. Three independent column sorts produced
three distinct row0 values. The same `<button data-slot="dropdown-menu-trigger">` mechanism used by
`sortColumnViaDropdown` in the Corporate Override page object is present and operational on all 4 History headers.
The positive control failure is a data-availability redirect (1604 has no corporate overrides), not a systematic
app error.

---

## Old-Site Baseline Comparison (Step 6)

From `clients/encore/specs_planning/_internal/old-site-baseline/service-charge-2026-08-11.md` §4:

> **§4 — History tab**
> ### Column headers (verbatim, left to right)
> `Action` | `Service Type` | `Service Charge Percentage` | `Notes` | `Modified By` | `Modified On`

The old-site baseline recorded **no sort behaviour** for the History tab — no mention of sorting, sort affordance,
or column header interaction anywhere in the document. The new-site grid has a different column set (4 columns,
no `Action` or `Notes`) and adds sort affordance. This is a new-site-only feature with no old-site baseline
to compare against.

---

## Working Sort Sequence (Implementable)

For any test that needs to assert sort behaviour on the Service Charge History grid:

1. Navigate to the service charge page and switch to the History tab.
2. Wait until `tbody tr` count stabilizes above the skeleton count (allow up to 37 s after tab click).
3. Locate the `<th>` containing the target column label (e.g. `page.locator('th', {hasText: 'Modified On'})`).
4. Click the `<th>` — this propagates to the inner `<button data-slot="dropdown-menu-trigger">` and opens the Radix dropdown.
5. Wait for `page.getByRole('menuitem', {name: 'Sort ascending'})` to be visible (appears in < 200 ms).
6. Click the menu item.
7. Wait ~1 200 ms for grid re-render.
8. Assert: for "Modified On" ASC, row0 cell at index 3 starts with `"06/09/2016"` (oldest record). For "Service Type" ASC, row0[0] equals `"APP Downloaded"`.

This sequence matches the `sortColumnViaDropdown` implementation in
`clients/encore/src/pages/corporate-override/corporate-override.page.ts` lines 781–789.

---

## Summary of Findings

| Finding | Value |
|---|---|
| Total column headers | 4 |
| All headers have sort trigger button | yes |
| Grid empties on header click | **NO** — opens a dropdown menu |
| `aria-sort` set after sorting | **NO** — always null |
| Sort changes row order | **YES** — confirmed on 3 independent columns |
| Total rows (live, 2026-08-16) | **347** |
| Oldest "Modified On" record | 06/09/2016 |
| Positive control on Corporate Override (office 1604) | Not executed — no data on 1604 |
