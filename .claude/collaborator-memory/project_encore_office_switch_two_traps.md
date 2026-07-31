---
name: project-encore-office-switch-two-traps
description: Navigator Cloud office switching has two opposite traps — URL routing changes the URL but not the grid data; the dialog changes the data but not the URL
metadata: 
  node_type: memory
  type: project
  originSessionId: 0a493e2b-a8df-4b02-8548-f6d52e6fbf95
  modified: 2026-07-30T14:48:15.153Z
---

Changing the local office in Navigator Cloud has **two opposite traps**, established by live walks on
2026-07-30 (offices 1169 and 1137, Corporate Pricing → Product Group Override).

**Trap 1 — URL navigation changes the URL, not the data.** Setting `window.location.href` (or
URL-routing to `/locations/<id>/...`) updates the address bar and the page header while the Angular
component stays half-initialised. In one run the grid did fire fresh `localOfficeId=1169` requests, all
HTTP 200, and rows rendered — **and the footer still read the previous office's `0 items found`**. A
walk that trusts the header or the footer here measures the wrong office while looking clean. This
burned three runs and produced a false "no data anywhere" conclusion.

**Trap 2 — the dialog changes the data, not the URL.** Switching through the **Change Local Office**
dialog re-initialises the component properly and the footer updates correctly (`18 items found` →
`16 items found` under the Active filter). But **the URL does not change at all** — it stayed at
`/locations/1169/...` for the entire 1137 walk.

**So neither the URL nor the page header is ever a valid source for "which office am I looking at."**

**Trap 3 — an inherited session carries the previous run's pollution (added 2026-07-30, after this cost
three more runs).** Workers attach to a session the CEO left open, so they inherit whatever office, tab
and filter state the last run left behind. One run's URL read `1169` while its grid held **`4107`** data,
and it wrote that reading into a file it named `network-1137.verify.txt`. The next run then found the
Labor tab *already active* from that polluted run, could not click it, and reported its contents as a
finding. Both readings were worthless and one nearly shipped as a defect.

Two sub-lessons, both load-bearing:
- **The network log is a HISTORY, not a state.** Grepping it for `localOfficeId=<want>` will happily match
  a request from ten minutes and two offices ago. Read the **most recent** grid request, not any match.
- **A walk needs a control reading.** Before trusting a new number, re-read a *known* one on the same
  session (e.g. "Equipment must read 18 for 1137"). If the control is wrong, the session is polluted and
  every other number in that run is void.

**The mechanism, finally established 2026-07-30 after six attempts.** Four runs died on "Select stays
disabled" because the recorded technique was wrong. The actual control:

- The **"Select a location"** panel on the PG Override page is a clickable shadcn **Card** titled
  *Change Local Office*. Clicking it opens a Radix dialog `data-testid="location-settings-modal-change-local-office"`
  containing an Active checkbox, a search input, a table, and
  `data-testid="location-settings-modal-change-local-office-btn-select"`.
- **Selection is the per-row CHECKBOX** (`button[role=checkbox]` inside the `<tr>`), **not a click on the
  row.** Dispatching `mousedown/mouseup/click` at the `<tr>` or `<td>` leaves Select disabled forever.
  This — not the event sequence — was the root cause of every failed switch.
- **Select is deliberately disabled when the chosen row is already the current office.** You cannot
  re-select the office you are on. To land on office X you must switch *away* to another office first,
  then pick X. Non-obvious and it looks exactly like a broken control.
- **Never query the whole document while the dialog is open.** The office header itself contains the
  office number, so a document-wide `textContent.includes('1137')` matches an element *behind* the
  dialog. Scope every query to the dialog container.
- Clicking Select may return a Playwright **TimeoutError** (`pointer-events: none; opacity: 50%` during
  the Radix animation) while still having taken effect. Wait ~3s and re-read rather than retrying.
- **The in-app link to this page is labelled "Pricing Override", not "Product Group Override".** One run
  grepped a 1030-line snapshot for "pg-override"/"Product Group Override"/"PG", found nothing, and
  concluded no navigation path existed. It was there under a different name.

**How to apply:**

- **Every walk ticket re-scopes the session itself, through the dialog, even when the URL already shows
  the target office.** Never inherit a scope. The URL is evidence of session liveness and nothing else.
- **Change office through the dialog.** It is the only route observed to refresh the grid correctly, and
  it is the path a real user takes.
- **Read the scope from the network log** — the `localOfficeId` on the grid's own *latest* request.
  Enforced by the `scope-match` oracle in `scripts/check-interaction-coverage.mjs`, added because of trap 1.
- **Click tabs and controls by `ref`, not by text.** `tab:has-text('Labor')` matched nothing on this page
  even with the tab plainly present in the snapshot.
- **Reconcile the footer against the API before trusting it.** Trap 1 shows a stale footer surviving a
  correct data load.
- Known obstacle: after one dialog switch the header button's ref goes stale and its accessible name
  changes, so the dialog resists re-opening. **Plan one switch per run** unless a re-open method is
  worked out.

Related: [[feedback_real_verification]], [[project_encore_e2e_multi_location_offices]],
[[feedback_never_conclude_from_redacted_or_name_only_match]].
