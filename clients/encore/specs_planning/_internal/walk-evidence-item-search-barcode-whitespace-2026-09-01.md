---
artifact: walk-evidence-item-search-barcode-whitespace
client: encore
session_date: 2026-09-01 (UTC; 2026-09-02 local)
session_tool: playwright-cli 0.1.15 (headless, .auth/encore-state.json refreshed this session)
author_identity: HUNTER
page_url_new: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products
page_url_old: n/a — navigator2 rejects automated browsers (TLS middlebox), baseline env-blocked
test_entity: office 1101
parent_subplan: plans/done/SUBPLAN_ITEM_SEARCH_BARCODE_COVERAGE.md
jira_tickets: [NM-1494]
question: does the barcode field's leading-vs-trailing whitespace asymmetry come from the app, and does any barcode in the data contain a space?
---

# Barcode whitespace asymmetry — root cause, and the enumeration attempt

The owner asked whether any barcode in the data contains a space, to decide which side of the
asymmetry (leading space returns nothing, trailing space matches) is the defect. This session
answers the first question definitively and reports honestly that the second is not answerable
from any surface this application exposes.

## 1. The asymmetry is server-side, not an app trim

The Products page's barcode box calls
`POST /navigator/api/location/navigator-legacy/getItemSearchByBarcodeAction`
with the raw string in a `Barcode` field. Calling that endpoint directly — bypassing the UI
entirely, so no client-side trimming can be involved — reproduces the asymmetry:

| `Barcode` sent | rows returned |
|---|---|
| `"5052320"` | 1 |
| `"5052320 "` (one trailing space) | **1** |
| `" 5052320"` (one leading space) | **0** |
| `"  5052320  "` (both ends) | 0 |
| `"505 2320"` (internal space) | 0 |
| `"DFW0082529"` | 1 |
| `"DFW0082529 "` | **1** |
| `" DFW0082529"` | **0** |

Two different barcodes, one numeric and one site-prefixed, behave identically. The request body
carries the string untrimmed in every case, so the application is not trimming either end — the
difference is produced downstream of the request.

**Most likely mechanism**: this is the standard SQL character-comparison rule. Under ANSI padding
semantics a comparison ignores trailing blanks, so `= '5052320 '` matches the stored `'5052320'`,
while leading blanks are significant and `= ' 5052320'` matches nothing. That makes the asymmetry
inherited database behaviour rather than a decision anyone made in this feature.

**Confidence**: the *behaviour* is proven (eight direct API calls, two barcodes). The *mechanism*
is a strong inference from the shape of the result, not something this session verified against the
database or the query text — nobody should cite the ANSI-padding explanation as established fact
without confirming it with whoever owns the legacy query.

## 2. Matching is genuinely exact — no wildcards

Sent through the same endpoint: `"%"` → 0, `"% %"` → 0, `"_"` → 0, `"505232%"` → 0. The query does
not append wildcards and does not honour explicit ones, which confirms the exact-match behaviour
TC-ISR-PRS-027 asserts and rules out using the endpoint to enumerate.

One incidental finding: an **empty** `Barcode` (`""`) returns **1001** rows — the unfiltered product
list. So empty means "no barcode filter", not "no match". The UI cannot reach this state (the
Search button requires criteria), so it is not a defect, but it is worth knowing that the parameter
is skipped rather than matched when blank.

## 3. Why "does a barcode with a space exist?" could not be answered

It is not answerable from this application. Two independent reasons, both verified:

- **The barcode endpoint returns products, not barcodes.** Its response carries ProductCodeID,
  Item, Category, price and availability — there is no barcode field anywhere in the payload. A
  barcode is only ever an input.
- **No surface lists barcodes.** The location's routes are home / inbox / orders / fulfillments /
  assets / customers / packages / products. The Assets grid — reached from both the sidebar's
  "Asset Search" and `/locations/1101/assets`, which are the same page — has columns Asset Id,
  Serial Number, Name, Category, Current Status, Current Location, Last Order, Last Scanned. There
  is no Barcode column, so even a fully populated Assets grid would not show one.

So the answer is not "no space-containing barcode exists" — it is that **this application cannot be
asked the question**. Answering it needs a database query or an export, not a UI walk. Recording
this as a negative finding about the data would be exactly the unsupported-absence claim the
loading-window rule warns against.

## 4. Why the decision does not actually depend on it

A barcode with a **leading** space is already unfindable through this search (section 1 proves the
lookup returns nothing for one). So:

- If such barcodes exist, the search is already broken for them today, and trimming the input
  cannot make that worse — it would be a separate, larger defect (an asset nobody can look up).
- If they do not exist, trimming costs nothing.

Either way, trimming the input before the lookup is safe, and it removes the asymmetry. What the
missing data answer would change is whether there is an ADDITIONAL bug to file, not whether the
straightforward fix is safe to recommend.

## Observations

**Bugs/Defects**

- `BUG-CANDIDATE` (Item Search, the subject of this walk): pasting a barcode with a leading space —
  an ordinary outcome of copying from a spreadsheet or a scanner readout — silently returns "no
  results" with no indication that whitespace was the cause, while the same paste with a trailing
  space works. Not filed pending the owner's ruling on which side is correct; the asymmetry itself
  is not defensible in either direction.
- `BUG-CANDIDATE` (Assets module, **outside this walk's scope — not filed, needs its own
  verification**): submitting a search on `/locations/1101/assets` blanked the page twice in a row
  — the grid, the toolbar and the whole main region unmounted, leaving only the navigation shell
  (body text 318 chars), and it did not recover after 10s and 12s waits. Two reproductions is a
  signal, not a verdict: this surface was never walked, the waits were not varied per the
  lazy-loading rule, and Assets belongs to another module's coverage. Recorded here so it is not
  lost; whoever picks up Assets should re-drive it first.

**Suggestions/Improvements**

- Trimming the barcode input before the lookup would remove the asymmetry and cannot break any
  lookup that works today (section 4). It is the smallest safe change if the owner rules that
  barcodes do not legitimately contain leading or trailing spaces.
- If the ruling needs the data answer, the route is a database query or an asset export against the
  barcode column — not a UI walk. Worth asking whoever owns the legacy schema, since the same
  person can confirm or correct the ANSI-padding mechanism in section 1.
