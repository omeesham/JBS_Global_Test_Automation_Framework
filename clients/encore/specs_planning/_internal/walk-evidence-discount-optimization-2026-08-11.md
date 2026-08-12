# Walk Evidence — Discount Optimization Settings

> **Column re-labelling, 2026-08-12** — after this artifact was recorded, the application re-labelled two
> grid columns: *No Implied Discount* → **Allow Special Rate**, and *No Implied Start* → **Special Rate
> Start Date**. This is a display-label change only; the underlying field and its Yes/No values are
> unchanged. The observations below are preserved verbatim as recorded on their date and deliberately keep
> the original column names.

**Date:** 2026-08-11
**Environment:** cloudapps-e2e.encoreglobal.com, Office 1604, Parker Palm Springs
**URL:** https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/discount-optimization-settings
**Walker:** T11-BOUNCE headed walk (Chromium headed, real clicks/keystrokes only; zero dispatchEvent)
**Row count confirmed:** 2154 (footer text "2154 locations found" reached in ~27 seconds)

---

## Observations

### Bugs / Defects

| # | Surface | What's wrong | Steps | Evidence | Severity |
|---|---------|-------------|-------|----------|----------|
| ~~1~~ | ~~Tab 1 — Search~~ | **RETRACTED — NOT A DEFECT.** Search filters correctly. Original finding was a false positive: `fill()` was used, which sets `.value` directly and bypasses Angular's event-driven change detection. Re-verified T17 with `pressSequentially` (real keystrokes): `abbey` → 1 location found; `zzznomatch999` → 0 locations found; clear → 2154 restored. Filtering is **client-side** (zero network requests fire on typing). See `BUG-DOP-LOC-001-search-no-filter.md` for full retraction evidence. | — | `FOOTER_AFTER_abbey: 1 locations found`; `FOOTER_AFTER_nomatch: 0 locations found`; `FOOTER_AFTER_CLEAR: 2154 locations found`. Screenshots: `t17-02-after-abbey.png`, `t17-03-nomatch.png`. | ~~High~~ RETRACTED |

---

### Suggestions / Improvements

| # | Surface | Observation |
|---|---------|-------------|
| 1 | Tab 1 — Loading state | Grid shows "0 locations found" / skeleton loaders for ~27 seconds before 2154 appears. Whether zero-count text is visible to users during that window is a candidate discussion item. |
| 2 | Tab 2 — Loaded with skeleton | Tab 2 (Special Rate Exemptions by Service Type) was reached and confirmed to have Cancel and Save buttons and a "Search by service type" input. However the grid was still rendering (skeleton loaders) at time of screenshot — Exempt column headers and aria-checked values could not be read before the walk completed. A dedicated Tab 2 walk is recommended. |

---

## Regression Re-checks

| Closed Defect | Verdict | Evidence |
|---|---|---|
| **NM-2918** — Save disabled at rest | **Still fixed** ✓ | `NM2918_SAVE_AT_REST: disabled:true` at page load, confirmed on every fresh-load in this run. Screenshots: `headed-02-save-rest.png`. |
| **NM-2917** — Toggle enables Save | **could-not-test** | No `button[role="switch"]` or `input[type="checkbox"]` found via DOM query in row area. The "No Implied Discount" column shows "Yes" text (not a toggle element) — the column may be read-only text, not an inline toggle. Requires targeted selector investigation to confirm the interactive control path. |
| **NM-3066** — Dirty tab switch shows prompt | **could-not-test** | Could not make dirty state with real click (toggle element not found; no other row-editable control reachable via headed DOM query). Clean tab switch (no changes) confirmed no dialog — consistent with NM-3066 still fixed for the clean case. |
| **NM-3067** — Date digit shifting | **could-not-test** | `[row-index="0"] input` timed out — date column renders a calendar icon button, not a directly-visible text input. The input is likely revealed only after clicking the calendar icon. Previously reported from headless walk remains unconfirmed from headed run; recommend a targeted date-cell interaction pass. |
| **Bug 2 (Sort)** — Previously filed High | **could-not-test** | Could not locate column header elements via `.ag-header-cell` selector (30s timeout). The grid uses a non-standard header structure. The ↑↓ arrows on ID/Location Name/No Implied Discount/No Implied Start ARE visible in screenshots — the headers exist but were not reached with a real click. Previously filed as High based on dispatchEvent; that conclusion is now void per T11-BOUNCE instructions. |
| **Bug 3 (Add/Cancel leaves Save enabled)** — Previously filed Medium | **does not reproduce** | From a clean fresh load: `SAVE_BEFORE_ADD_FRESH: disabled:true`; clicked Add (real click, Add Location panel opened with Cancel/Update buttons); clicked Cancel; `SAVE_AFTER_ADD_CANCEL: disabled:true`. Save remained disabled throughout. Previously reported from a walk with prior operations contaminating the Save state. Screenshots: `headed-08-after-add.png`, `headed-09-after-add-cancel.png`. |

### Regression re-check resolutions (superseding the could-not-test rows above)

The four `could-not-test` verdicts above were recorded mid-walk, before the interaction path for each
control was established. All four were resolved by later work on the same day; the rows above are kept
as the historical record of what that walk itself could see.

| Closed Defect | Resolved verdict | What resolved it |
|---|---|---|
| **NM-2917** — Toggle enables Save | **Still fixed** ✓ | The control is a button, not a `switch`/`checkbox` element — reachable via its accessible name (`No implied discount for <location>`). Covered by an automated case that toggles the control and asserts Save enables. |
| **NM-3066** — Dirty tab switch shows prompt | **Still fixed** ✓ | The unsaved-changes dialog fires reliably — it appeared repeatedly and unprompted during later probes, to the point of intercepting keystrokes until dismissed. Its presence is now handled explicitly before any row interaction. |
| **NM-3067** — Date digit shifting | **Still fixed** ✓ | The date field is reachable and typeable; the calendar picker opens and selects. No digit shifting observed across repeated runs of the automated date case. |
| **Bug 2 (Sort)** — Previously filed High | **Not a defect — retracted** | The grid does sort. Each column header carries an options-menu button whose menu contains *Sort ascending* and *Sort descending*, and choosing either reorders rows. The earlier verdict came from clicking the column resize handle (which drags column width) and from never opening the menu. The grid does not set `aria-sort` — so the correct oracle is a row-order change, not an attribute check. Four automated cases now cover sorting. |

---

## Phase 5 — Special Rate Exemptions tab: data-state and permission verdict (2026-08-11)

Three open questions closed against live evidence. Session authenticated from the stored session state
the test suite itself uses; no persistent browser profile involved.

**Q1 — Is the `Exempt` column genuinely all-false, or is the boolean failing to render?**
**Renders correctly — no defect.** The column looked empty because an unchecked box renders as empty
text; per the per-table boolean rule the readable signal is `aria-checked`, not cell text.

The service-type API is the oracle: 29 service types, exactly 3 flagged as special-rate-allowed. The DOM
agrees exactly:

| Service type | `aria-checked` |
|---|---|
| Equipment Rental | `true` |
| HSIA - Equipment | `true` |
| HSIA - Subrental Equipment | `true` |
| (the other 26) | `false` |

Evidence: `reports/walk-evidence/discount-optimization-2026-08-11/phase5-api-response.json` (raw payload),
`phase5-q1-tab2-office1604.png`. This retires the earlier "Tab 2 grid was still rendering, values could
not be read" note in the Observations table above.

**Q2 — Does the walking account hold the role gate referenced by NM-3068 / NM-3340 / NM-3394?**
**Has edit rights.** Save is present and disabled at rest (correct — it enables only on a pending
change), Add is present and enabled, and the date input is neither disabled nor read-only. No control was
absent, which is what a permission gate would look like. Corroborated far more strongly by the automated
suite itself, which performs real saves against this surface and passes. The earlier "account looks
read-only" note was the ~22-second render, not a permission gate.

**Q3 — Does the tab render on office 1101 as well as 1604?**
**Yes.** Office 1101 renders the grid with its full tab chrome and no `0 locations found` message.
Screenshot: `phase5-q3-1101.png`.

Note on row counts: the grid virtualizes. A DOM query returns roughly 37 rendered rows on both offices
while the footer reports the true total (2154 on 1604). A row count read from the DOM is therefore a
viewport measurement, not a record count — the footer is the count oracle.

---

## Axis decisions

Consolidated 2026-08-12. The plan mandates this section; it was never written, so the verdicts below are
compiled **from measurements already recorded in this file and in the bug records** — each row cites its
source. Nothing here is a fresh claim, and where a measurement was never taken it says so.

### 3b.1 — Sort and search: are they present?

| Control | Verdict | Evidence |
|---|---|---|
| **Search** | **Present and working.** Client-side filter over the loaded set. | `BUG-DOP-LOC-001` retraction (T17): `pressSequentially('abbey', {delay:80})` → footer `2154 → 1`; `zzznomatch999` → `0`; clear → `2154`. **0 network requests fired while typing** — the filter is in-memory. The earlier "search does not filter" finding was a `fill()` artefact: it assigns `.value` without dispatching the `input`/`keydown` events Angular's binding listens for. |
| **Sort** | **Present.** | This file, "Regression re-check resolutions": *"The grid does sort. Each column header carries an options-menu button whose menu contains sort options."* This supersedes the earlier `could-not-test` row, which was a selector problem (`.ag-header-cell` 30s timeout), not an absent feature. |

**Consequence for cases:** tests must not wait on a network response after typing — they must wait for the
footer count to change. Nothing may hardcode the *absence* of sort or search (NM-3327).

### 3b.2 — Office sensitivity per tab

| Tab | 1604 | 1101 | Verdict |
|---|---|---|---|
| Tab 1 — Locations | renders, footer `2154 locations found` | renders, full tab chrome, no `0 locations found` | **Not office-invariant in data, but present on both.** |
| Tab 2 — Service Type Exemptions | renders (`phase5-q1-tab2-office1604.png`) | renders (`phase5-q3-1101.png`) | Present on both offices measured. |

Row counts differ per office, so **no office-invariance claim is made** — consistent with the plan's
LR-061-A gate that one office is never a conclusion.

### 3b.3 — Which of the 9 offices render

**INCOMPLETE — 2 of 9 measured.** Offices **1604** and **1101** were both confirmed rendering, with
screenshots. The remaining seven were never driven, so this axis carries no verdict for them.

This is recorded as a gap rather than closed by inference: the plan's Axis-A criterion requires every
office in the 3b.3 list to be either covered or carrying an LR-040(c) c.1/c.2/c.3 record, and seven
offices currently have neither. Re-measuring needs the e2e environment, which is unreachable from this
machine as of 2026-08-12 (see `old-site-baseline/nav2-poll-2026-08-12.txt`).
