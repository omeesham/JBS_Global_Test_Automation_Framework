# Walk Evidence — Item Search: Product Code field lengths (PCD)

**Module**: item-search-product-code
**Client**: encore
**MCP_Session_Date**: 2026-09-03
**MCP_Session_Tool**: Playwright CLI (`playwright-cli`, session `bva`)
**MCP_Tool_Reason**: Deterministic input-trial probe on a form (type-past-limit, bypass-limit, positive control). LR-038 v2 selects the CLI path — unattended, snapshot-to-disk, no pixel judgement needed.
**Author_Identity**: GIVER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products
**Test_Entity**: Office 1101 - Corporate Office Encore USA SGA
**Walk_Mode**: quick
**Scope**: field-length contract of the Add Product Code and View Product Code dialogs only — a targeted supplement to `walk-evidence-item-search-2026-08-31.md`, not a re-walk of the module.

jira_tickets: [NM-2257, NM-2253, NM-1386, NM-1742, NM-1835, NM-1964]

---

## Why this walk ran

The research pass on NM-2257 quoted NM-1386's field rule — *"the Product Code Name and
Description fields have a limit of 256 characters"* — and proposed boundary cases at 256.
That number was taken from Jira and had never been checked against the DOM. Per LR-ENC-004
every Jira fact is a lead re-verified against render truth before it enters a test case, so
the limit was measured before a single case was written. It is not 256.

## Per-field evidence

| Field (Add dialog, Item segment) | Worker tier | Raw evidence captured | Verdict |
|---|---|---|---|
| Name | Opus-self (single form, adaptive probe) | `maxlength="50"`; typed 60 chars → `value.length === 50`, `aria-invalid="false"`, zero matching error text | accepted — cap 50, silent truncation |
| Item Description | Opus-self | `maxlength="50"`; typed 70 chars → `value.length === 50`, `aria-invalid="false"` | accepted — cap 50, silent truncation |
| Oracle Item Number | Opus-self | `maxlength="10"`; typed 15 digits → `value.length === 10` | accepted — cap 10 |
| Name + Item Description, cap bypassed | Opus-self | native-setter set of 60 chars → `value.length === 60` (attribute does not bind this path); both `aria-invalid="true"`; Save `disabled === true` with Product Type LABOR and Service Type Application Development both chosen | accepted — over-length refused at the model layer |
| **Positive control** for the row above | Opus-self | same native-setter primitive, 20-char name → both `aria-invalid="false"`, Save `disabled === false` | **accepted — primitive proven live**, so the row above is app behaviour, not a dead input method (LR-061 C) |
| Name / Item Description / Oracle Item Number (View dialog) | Opus-self | `maxlength` = `50` / `50` / `10` — identical to the Add dialog | accepted — one contract across both dialogs |

Nothing was saved during this walk. Both dialogs were closed via the footer Close; the
post-close read returned `dialogOpen:false`, `alertdialogs:0`, `rows:50` — the silent-discard
behaviour already recorded on 2026-08-31 held again, and no product code was created.

## Machine evidence artifacts

Snapshots and command output emitted by `playwright-cli` (never hand-authored):

- `.playwright-cli/bva-landing.txt` — search panel with Location already `1101 - Corporate Office Encore USA SGA`
- `.playwright-cli/bva-results.txt` — 50-row result grid for the `Amp` search
- `.playwright-cli/bva-toolbar.txt` — toolbar mounted after row select
- `.playwright-cli/bva-adddlg.txt` — Add dialog, Item segment, required-empty
- `.playwright-cli/bva-t3.txt` … `bva-t6.txt` — type/service selection during the bypass probe
- `.playwright-cli/page-2026-09-03T17-*.yml` — per-action page snapshots across the session

## Requirement reconciliation (intent truth vs render truth)

The DOM says 50. NM-1386 says 256. The divergence is **stale ticket**, not an app bug, and the
chain that settles it is complete:

1. **NM-1742** (Done) — *"Adjust product columns sizes (Name and Description) to match legacy size"*.
   Changed the Product table's `Name` and `Description` columns to `NVARCHAR(50)` because
   *"the Oracle integration and the product sync both require that the column sizes be consistent
   with the legacy values."* ProductGroup got `50`/`100` — the source of the "50/100" phrasing below.
2. **NM-1835** (QA Defect, Done, resolution Done) — QA filed exactly the observation made here,
   that the fields restrict to 50 against NM-1386's 256. Dharmishtha Vekariya replied
   *"as per NM-1742, input field lengths changed from 256 to 50/100 characters to match legacy size"*
   and the ticket was **closed as a rejection**. The 50-character cap is intended behaviour.
3. **NM-1386's own QA sign-off is contradicted by the app.** The 2026-06-04 verification comment
   claims *"Product Code Name and Description fields correctly enforce the 256-character limit."*
   That statement cannot be true of the build measured today, and NM-1742 (2026-05-01) predates it.
   Recorded as a documentation discrepancy, not filed as a defect — the shipped behaviour matches
   the later ratified requirement, so there is nothing wrong with the app.

**Consequence for the case set**: length cases assert 50 / 50 / 10 and cite NM-1742. Any future
reader tempted by NM-1386's 256 should stop here.

**Content validation is deliberately NOT asserted.** On NM-1835 the business analyst
(Rob Strackeljahn) ruled *"The current system allows anything. So `.....` would be valid.
The field size is all that matters."* A dots-only or whitespace-only value is therefore valid by
design; asserting otherwise would encode a rule the product owner explicitly declined. The
`field-case-generation.md` §2 plain-text Negative column (special chars, whitespace-only) is
**out-of-scope for these fields by owner ruling**, recorded here rather than silently skipped.

## Observations

### Bugs / Defects

none — the app behaves correctly at this boundary, and better than the ticket trail suggests.
The limit is enforced in two independent layers: the input stops typing at the cap, and the form
model separately refuses an over-length value if that first guard is bypassed, keeping any
over-length payload away from the `NVARCHAR(50)` columns. The one anomaly found is documentary
(NM-1386's stale 256 plus a QA sign-off asserting a limit the build does not have), not behavioural.

### Suggestions / Improvements

- NM-1386's field-rule line and its 2026-06-04 QA verification comment both still claim 256
  characters. A one-line correction on that ticket pointing at NM-1742 would stop the next reader
  — human or agent — from re-deriving this same investigation.
- The truncation is silent: a user pasting a long name gets it cut at 50 with no message. A short
  hint ("50 characters maximum") would remove the surprise. Low priority, cosmetic.

## Staleness signal

- **Last verified**: 2026-09-03
- **Fresh-until**: 2026-09-17
- **Stale-after**: 2026-10-03
- **Refresh triggers**: any `maxlength` on the three fields ≠ 50/50/10 · an over-length bypass
  starting to enable Save · a visible character-limit hint or error message appearing · NM-1742
  being revised
