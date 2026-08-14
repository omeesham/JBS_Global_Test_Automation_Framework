# BUG-DOP-EXM-001 — Exempt toggle: API reports success for a change it does not persist

**severity**: High
**tab**: Tab 2 (Special Rate Exemptions by Service Type)
**baselineComparison**: baseline-absent (Tab 2 has no old-site counterpart)
**status**: OPEN
**date**: 2026-08-14
**office**: 1604
**environment**: `cloudapps-e2e.encoreglobal.com`
**foundBy**: TC-DOP-EXM-020, then isolated by direct network capture (T85 → T86 → T87 → T88)

---

## Summary

Toggling a service type's **Exempt** checkbox and saving does not persist. The change is lost on
reload.

The serious part is not that the save fails — it is that **the API affirmatively reports success**.
The `PUT` returns `200` with `"success": true`, `"count": 1` and `"failures": []`, and the UI disables
the Save button, so both the automation and a human user are told the change was saved. It was not.

A user who unchecks a service type here will believe the exemption was removed. It has not been.

## Reproduction — by hand, no test code required

Anyone with access to the e2e environment can run this in a browser. No automation, no test harness.

1. Sign in to `https://cloudapps-e2e.encoreglobal.com/navigator/` and open office **1604**.
2. Navigate to **Setup → Discount Optimization Settings**, or go directly to:
   `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/discount-optimization-settings`
3. **Wait for the page to finish loading.** First paint on this screen is slow — roughly 22–35 seconds.
   The locations grid footer reads `0 locations found` until it finishes; when loaded it reads
   `2154 locations found`. Do not proceed until it does.
4. Click the second tab, labelled **"Special Rate Exemptions by Service Type"**.
5. Find the row **Equipment Rental** in the service-type list.
6. **Write down the current state of its checkbox in the Exempt column** — whether it is ticked or not.
   (At time of filing the API reported `isSpecialRateAllowed: true` for this row. Record what you see
   rather than relying on that; the point of the test is the *change*, not the starting value.)
7. Click that checkbox so it flips to the opposite state.
8. Observe that the **Save** button becomes enabled.
9. Click **Save**. Observe that the Save button becomes **disabled** again — the screen's normal
   indication that the change was saved. No error is shown.
10. **Reload the page** (F5) and wait again for the slow first paint.
11. Return to the **"Special Rate Exemptions by Service Type"** tab and look at the **Equipment Rental**
    row.

**Expected**: the checkbox shows the value set in step 7.
**Actual**: the checkbox shows the ORIGINAL value from step 6. The change is gone, and at no point was
any error, warning, or failure message displayed.

To confirm it is not a display-only problem, open the browser's Network tab before step 9 and watch the
`PUT` described below — it returns `200` with `"success": true`. Then watch the `GET` after the reload:
it returns the old value. The wire traffic for both is quoted verbatim in the next section.

> **A note on polarity.** This report deliberately does not claim what a ticked box *means*
> (exempt vs not-exempt). The column is labelled **Exempt** and the API field is
> `isSpecialRateAllowed`, and the mapping between them was not verified. The defect does not depend on
> it: whatever the checkbox means, the value the user sets is not the value that comes back.

## Evidence — raw, from the wire

**The save request is correct.** The front end sends the right service type and the right new value:

```
PUT https://cloudapps-e2e.encoreglobal.com/navigator/api/discount/optimization/service-types
{"updates":[{"serviceTypeId":3,"isSpecialRateAllowed":false}]}
```

**The server reports success:**

```
HTTP 200
{"success":true,"message":"All service type special rate exemptions updated successfully.","count":1,"failures":[]}
```

`count: 1` and `failures: []` are an explicit claim that one record was updated and nothing failed.

**The value did not change.** After reload:

```
GET https://cloudapps-e2e.encoreglobal.com/navigator/api/discount/optimization/service-types?skipPagination=true
HTTP 200
... {"id":"0da3678a-8af9-0cc8-1ed9-606683c4b635","serviceTypeId":3,"serviceTypeName":"Equipment Rental","isSpecialRateAllowed":true} ...
```

`isSpecialRateAllowed` is still `true` — the value sent was `false`.

Captured state around the cycle:

| field | value |
|---|---|
| `originalState` | `true` |
| `stateAfterToggle` | `false` |
| `saveDisabled` (after clicking Save) | `true` |
| `stateAfterReload` | `true` |

## Why this is a product defect and not a test artifact

Each alternative explanation was tested and eliminated:

- **Not the `fill()` trap** that caused [BUG-DOP-LOC-001](BUG-DOP-LOC-001-search-no-filter.md) to be
  retracted. This path toggles a Radix checkbox; no text input is involved, and the `PUT` demonstrably
  carries the correct payload — the app clearly received the interaction.
- **Not test isolation.** `TC-DOP-EXM-020` captures the original state at the start of its own run and
  asserts against that captured value, not a hardcoded one.
- **Not an early assertion.** The assertion happens after a full page reload and tab switch.
- **Not a front-end defect.** The request fires with the correct body. The failure is entirely on the
  server side of that call.

Reproduced in two independent runs plus Playwright's automatic retries — four observations — and then
directly with a standalone network capture.

## How the automated check reports it

The automated regression check for this screen's save cycle fails at the step that re-reads the value
after reloading the page:

```
Expected: false
Received: true
```

It set the value to `false`, reloaded, and read back `true` — the same result a person gets doing it by
hand, as described in the reproduction steps above.

## This is not an isolated case — it is the fourth instance of a known pattern

`clients/encore/testcases/encore-qa-tracker.xlsx` already carries three entries describing the same
symptom on three unrelated screens, all still logged as *"Product bug (pending confirmation)"*:

| # | Area | Observed (verbatim from the tracker) |
|---|---|---|
| A1 | Local Office Settings – ECT Settings | "Saving reports success, but after reload the Benefits Multiplier returns to its previous figure." Tracker's own note: *"The value appears to be accepted by the save but not stored."* |
| A7 | Location Settings – Account & Address | "Saving reports success, but after reload the previous Phone 2 value reappears." |
| A9 | Location Settings – Notes | "Saving appears to succeed, but the note is still present after reloading." |

All three were raised from **observed UI behaviour** and remained "to confirm" because nobody had shown
what the server actually did.

**This bug supplies that missing piece.** It is the first instance of the pattern captured at the wire:
the endpoint returns `HTTP 200` with `"success": true, "count": 1, "failures": []` for a write that is
not stored. That makes "the save silently does nothing" a *measured* server behaviour on this platform
rather than a repeated user impression — and it means A1, A7 and A9 should be re-tested the same way
(read the value back after reload; do not treat a success response as proof of persistence) before any
of them is dismissed.

Whether all four share one root cause is **not** established here — four different screens, four
different endpoints. What is established is that the pattern is real on at least one of them.

## Related — a prior closure that should be revisited

[BUG-DOP-LOC-002](BUG-DOP-LOC-002-persistence-finding-update.md) (Tab 1, Special Rate date not
persisting) was **closed as test isolation**, on the stated grounds that its save fired a `PUT 200`
and survived reload. That reasoning treated `PUT 200` as evidence of persistence.

This bug shows that on this surface **a `PUT 200` is not evidence of persistence** — the server returns
`200` with `"success": true` for a write it discards. That does not automatically reopen LOC-002, which
is a different tab and a different endpoint, but it does invalidate the inference used to close it.
**LOC-002 should be re-verified by reading the value back after reload, not by trusting the status
code.** Tracked so it is not silently inherited.

## Existing-ticket check — done 2026-08-14, no duplicate found

Checked before filing, so this is not a re-report of something already known. A search of the NM
project for issues whose summary mentions "Discount Optimization" returned **20 issues**, and none of
them describes a save that reports success without storing the change.

The search itself was sanity-checked first: a narrow query returned nothing, so a deliberately broad one
was run to confirm the search was actually capable of returning results. It returned all 20 — so the
empty narrow result is a real absence, not a broken query.

Nearest existing tickets, and why none of them is this defect:

| Ticket | Summary | Why it is not this |
|---|---|---|
| NM-3064 | Discount Optimization – LocationSpecialRateSetting – publish message to shared environment | A backend work item, not a defect report. Flagged for the reader because it concerns propagating this setting to a shared environment, which is adjacent to a write that reports success but cannot be read back. Possible relevance; not established. |
| NM-3340 | Service Type Exemptions – limit list to applicable service types | Concerns which service types appear in the list, not whether a change to one is saved. |
| NM-2918 | Save button is enabled without any changes | About when the Save button becomes enabled, not about persistence. |
| NM-2917 | Update button remains disabled after toggling Implied Discount | The opposite symptom — a button failing to enable. |
| NM-3394 | Special Rate field editability incorrectly synced with configuration | About whether a field can be edited, not whether an edit is stored. |

**Conclusion: no duplicate. This can be logged as a new defect.**

## Evidence

Every value quoted in this report was captured from the live environment and is reproduced verbatim
above, so this report stands on its own — no other file is needed to assess it:

- the save request line and its JSON body,
- the save response: `200` with `{"success":true,...,"count":1,"failures":[]}`,
- the reload response line for the same service type, showing the old value,
- the before / after-toggle / after-reload states.

The supporting capture files and suite-run logs are retained with the QA team's working records and can
be supplied on request.

## Suggested question for the client

Does `PUT /api/discount/optimization/service-types` validate that the caller may change
`isSpecialRateAllowed` for this office, and if the change is refused (permission, business rule, or
office scope), should it still return `200` with `"success": true, "count": 1, "failures": []`? The
current response shape gives the client no way to detect that nothing was written.
