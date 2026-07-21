# Tier-A Draft — Location Management History pagination collapses to 2-button mode

**Drafted**: 2026-05-08
**Source TC**: TC-LOC-MGH-019 ("Pagination navigation enables with multiple pages")
**Spec**: `clients/encore/tests/specs/setup/locations/location-management-history.spec.ts:212-238` (currently `test.skip`)
**Module**: Setup → Locations → Location Management History (`/navigator/locations/1604/settings/location` — History tab)
**Office**: 1604 (The Parker Palm Springs) — has 2900+ history rows (always multi-page)
**Status**: NOT SENT — ready for user invocation of `/encore-questions`

> **Send protocol**: Per CLAUDE.md routing, `/encore-questions` is EXPLICIT-ONLY. The user invokes it
> when ready. This file is the draft input only. Do NOT auto-fire.

---

## Feature in plain English

The Location Management History tab is a read-only audit table with 87 columns and (for office 1604)
2900+ rows. Users page through history with the standard 4-button pager: **first / previous / next / last**,
plus a "page X of Y" indicator. Default rows-per-page is 20.

Expected behavior on a multi-page table:

- On **page 1**: `first` and `previous` are disabled; `next` and `last` are enabled.
- After clicking **next**: indicator shows page 2; all 4 buttons are enabled.
- After clicking **previous** (returning to page 1): the same 4 buttons should remain present in the DOM — `first`/`previous` disabled again, `next`/`last` enabled.
- On **last page**: `next` and `last` disabled; `first` and `previous` enabled.
- Clicking **first** from any page: returns to page 1; `first`/`previous` disabled.

This is the contract a 4-button pager promises. It works in the standard pattern on every other table
in the app.

## What we observe in the new app (cloudapps-e2e.encoreglobal.com)

After the user clicks **next** (page 1 → page 2), then clicks **previous** (page 2 → page 1):

- The pagination control **collapses to a 2-button mode**: only `previous` and `next` remain in the DOM.
- The `first` and `last` buttons **vanish from the DOM** (not just become disabled — they are removed).
- A subsequent automated `clickPaginationButton('first')` or `clickPaginationButton('last')` cannot find
  the button at all and **times out at 15 s** waiting for the element to be visible.
- The page-X-of-Y indicator continues to show the correct page number (so the underlying paging state
  is fine) — only the UI affordances disappear.

The collapse is **directional**: the buttons exist on first load. They only vanish AFTER a Next→Previous
cycle. We have not been able to recover them without a full page reload.

## Reproduction steps (verbatim from spec body, lines 212–237)

1. Open `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location`.
2. Click the **Location Management History** tab.
3. Verify the pagination row is visible at the bottom of the table; default page size is 20.
4. Confirm: on page 1, `first` is disabled, `previous` is disabled, `next` is enabled, `last` is enabled
   (4 buttons present).
5. Click `next`. Verify the page indicator shows page 2 (`paginationAfterNext` should `toContain('2')`).
6. Click `previous`. Verify the page indicator returns to a `1 / N` shape.
7. **At this point, observe the pagination row.** In our automated runs the row now contains only
   `previous` and `next` — `first` and `last` are gone from the DOM.
8. Click `last`. Expected: indicator shows the final page; `next` and `last` become disabled. Observed:
   the click cannot find the `last` button — Playwright times out at 15 s waiting for it.

The spec was originally authored to assert all 4 buttons across the full cycle (page 1 → next → page 2
→ previous → page 1 → last → final page → first → page 1). It is currently `test.skip(...)` with the
inline comment:

> "pagination bar collapses to 2-button mode after Next→Previous on page 1. Go to first/last buttons
> vanish from DOM; click times out at 15s. Re-enable when bug is fixed."

## Behavior we expected (vs. observed)

| Step | Expected | Observed |
|---|---|---|
| 1. Initial render of page 1 | 4 buttons visible: first (disabled), previous (disabled), next, last | ✓ matches |
| 2. After Next | All 4 buttons enabled; indicator on page 2 | ✓ matches |
| 3. After Previous (back to page 1) | All 4 buttons present; first/previous disabled; next/last enabled | ✗ **only `previous` + `next` remain in DOM; `first` + `last` are removed** |
| 4. Click `last` after step 3 | Navigates to last page | ✗ button does not exist; click times out at 15 s |
| 5. Recovery without reload | n/a | Not possible — only a full `page.reload()` restores all 4 buttons |

## Cross-page comparison (other tables in the app)

The 4-button pagination pattern is used elsewhere (e.g., the search results list in the Add-Location
dialog on the Shared Setup Locations tab). Those tables do NOT collapse after Next→Previous — the 4
buttons remain in the DOM throughout. This rules out a global pagination-component bug; the issue is
specific to the Location Management History tab's pagination wiring.

## Why we are surfacing this

We've automated 18/19 of the History tab's other test cases (TC-LOC-MGH-001 through 018). TC-019 is
the only one we have skipped, and we do not want to delete the assertion or rewrite it to accept
broken behavior. We need confirmation from Encore before we re-enable.

Three possible answers from Encore would each unblock us:

1. **"Bug — fix coming."** We keep `test.skip` with a tracking ticket and re-enable on fix.
2. **"This is intentional — the History pager only shows first/last on initial render."** We rewrite
   TC-019 to assert the 2-button state after a Next→Previous and document the design intent.
3. **"This is environment-specific."** We re-verify on a clean office (no prior pagination state) and
   pursue the env-specific repro path.

## Open questions for Encore

1. Is the pagination-collapse intentional? If so, what's the design intent (perceived performance,
   UX simplification on already-visited tables)?
2. If unintentional, is there an existing Jira ticket (NM-NNNN)? We searched the prefix list in
   `clients/encore/CLAUDE.md` and found nothing similar.
3. The behavior is reproducible on office 1604 (2900+ history rows). Does it reproduce on a smaller
   office (e.g., < 200 history rows)? If not, the trigger may be the row-count threshold for first/last
   to ever render — in which case the bug shape is "first/last render once, then never re-render after
   page changes."
4. If we pivot to assertion shape #2 ("test the 2-button state"), what should the contract be? Today's
   observation: post-Next→Previous, only `previous` and `next` remain — both enabled — and `previous`
   is a no-op (page indicator stays at 1). Is "previous enabled but no-op on page 1" intentional?

## Artifacts

- Spec: `clients/encore/tests/specs/setup/locations/location-management-history.spec.ts:212-237`
  (currently `test.skip` with inline comment).
- Page object: `clients/encore/src/pages/setup/locations/location-management-history.page.ts`
  (`clickPaginationButton`, `isPaginationButtonDisabled`, `getPaginationText`).
- Selectors: `clients/encore/src/selectors/setup/locations/location-management-history.ts`
  (`btnPagFirst`, `btnPagPrevious`, `btnPagNext`, `btnPagLast`).
- This draft: `clients/encore/specs_planning/_internal/encore-questions-drafts/TC-LOC-MGH-019-pagination-collapse-2026-05-08.md`.

---

*Draft only — `/encore-questions` is EXPLICIT-ONLY per `CLAUDE.md` routing. User invokes when ready
to send.*
