# Discount Matrix — Company Matrix (Tab 1) Test Cases

**Module**: discount-matrix

| Module | Test Cases | Automated | Pending Automation | Out of Scope | Updated |
|--------|------------|-----------|--------------------|--------------|---------|
| Discount Matrix — Company Matrix | 42 | 42 (100%) | 0 (0%) | 0 (0%) | 2026-08-20 |

> **Tab 1 (Company Matrix)** coverage `TC-DSM-CMX-001..042`, authored from a live walk of office 1604 on
> the e2e environment (2026-08-19), a live reconciliation of all twelve Jira defects filed against this
> tab, and the product contract in NM-2219. **CoverageMode: quick** — Axis-2 surface families are covered
> at L1 must-assert depth only. The grid is a **read-only display surface**: all 189 percentage values are
> static text and every edit happens in the **Edit Tier dialog**, so the per-field FCC cases target the
> dialog, not the grid. **Export** and **Add Tier** were walked on 2026-08-19 and are covered in Section D;
> **Delete Tier** and **Import** remain unwalked and carry no cases, as does the commit half of Add Tier —
> see *Deferred / not-yet-walked* at the foot of this file. Every case
> below traces to measured live evidence; nothing is inferred from a screenshot or a ticket alone.

---

## FIELD INVENTORY & DISCOVERY

**Live walk 2026-08-19 (Playwright CLI, office 1604, `cloudapps-e2e`).** Route:
`/navigator/locations/1604/settings/discount-matrix`. Angular + Radix UI. Evidence artifact:
`clients/encore/specs_planning/_internal/walk-evidence/discount-matrix-company-matrix-2026-08-19.md`.

**Selector discipline for this surface** — three rules, each learned the hard way on the sibling
Discount Optimization page:
- Tab triggers carry auto-generated `radix-*` ids whose middle segment changes between renders. **Select
  tabs by `[role="tab"]` plus visible text, never by id.**
- The grid container exists in the DOM **before** its data arrives. **Wait on a non-zero row count**,
  never on the container — waiting on the container produced three false "grid is empty" findings.
- Locate a tier row by its **visible range text** (`0 - 1500`), never by row index. Row order is not a
  contract.

**Three tabs on one route** (Company Matrix is active on load):

| # | Tab label | Default |
|---|-----------|---------|
| 1 | Company Matrix | ✓ |
| 2 | Region Weekly Peaks | — |
| 3 | Location Activation | — |

**Header / criteria bar** — shared across all three tabs:

| Control | Type | Rendered on 1604 | Notes |
|---|---|---|---|
| Country | `[role="combobox"]` | `United States` | part of the grid key |
| Currency | `[role="combobox"]` | `USD` | part of the grid key |
| Business Tier | `[role="combobox"]` | `Standard` | part of the grid key |
| GAV Discount Threshold | text input | `15%` (placeholder `0%`) | **header Save persists only this** |

The Company Matrix grid is keyed by `(countryId, currencyId, businessTierTypeId)` and loads rows only
when all three are set — product contract, NM-2219 AC1. Header **Save** persists **only** the GAV
threshold (`PUT .../countries/{countryId}/currencies/{currencyId}/threshold`); each tab saves itself
independently. This is the mechanism behind the header×submodule cases in Section A.

**Grid structure** (machine-counted, three independent runs):

| Element | Count |
|---|---|
| Tier rows | 9 |
| Column groups | 3 — `Non-Peak Booking Windows Days`, `Standard Booking Windows Days`, `Peak Booking Windows Days` |
| Day buckets per group | 7 — `0-15`, `16-30`, `31-60`, `61-90`, `91-180`, `181-365`, `365 +` |
| Percentage columns | 21 |
| Percentage value cells | 189 — **all static text, zero `<input>` elements in `tbody`** |
| Page controls | 2 `input`, 44 `button`, 0 `select`, 3 `[role="combobox"]` |

Tier ranges as rendered: `0 - 1500`, `1501 - 3000`, `3001 - 5000`, `5001 - 15000`, `15001 - 25000`,
`25001 - 50000`, `50001 - 75000`, `75001 - 100000`, `100001 - 20000000`.

**Edit Tier dialog** — opened from a row's `button[title="Edit"]` (the row's second button; the first is
`title="Delete"`). Title renders `Editing <range>`, e.g. `Editing 0 - 1500`.

| Property | Value |
|---|---|
| Inputs | 21 — one per percentage column, all `type="text"` `inputmode="decimal"`, placeholder `0` |
| Buttons | `Cancel`, `Update` |
| Revenue Tier start/end | **ABSENT** — the dialog exposes percentages only |

**Measured percentage-field contract** (clean-method runs with blur committal proven via
`document.activeElement`):

| Input | Renders | Valid? | Update |
|---|---|---|---|
| `14`, `1`, `100` (whole) | `14%`, `1%`, `100%` — `%` appended unchanged | yes | enabled |
| `0.14`, `0.5` (decimal < 1) | `14%`, `50%` — **multiplied by 100** | yes | enabled |
| `12.5` (decimal > 1) | `12.5%` — fraction kept | yes | enabled |
| `101`, `150`, `3456` | `101%`, `150%`, `3456%` — renders with `%` | **no** (`aria-invalid=true`) | disabled |
| `-1` | `-` keypress refused by the input handler; value unchanged | n/a | n/a |
| empty, `abc` | empty | **no** | disabled |

**Two tooling gotchas for the spec author**, both measured on this surface:

1. **Never use `fill()` on these fields.** It sets the value in one synthetic event that the field's
   formatter mis-parses. Proven by holding the input string constant and varying only the method:
   `fill("20%")` rendered `15.2%`, while typing the same characters rendered `20%`. Use
   character-by-character typing (`pressSequentially` in a spec, `type` from the command line). The
   page object already does; do not "simplify" it back.
2. **`playwright-cli fill` parses a leading `-` as a command-line flag.** Negative input must be driven
   with `press Minus` + `press Digit1`.

---

## MCP_VERIFICATION_LOG

| Field | Value |
|---|---|
| Date | 2026-08-19 |
| Tool | Playwright CLI (office 1604) |
| Page | Discount Matrix — Company Matrix (tab 1) |
| Stack | Angular + Radix UI; tab trigger and panel IDs are auto-generated per render, so tabs are selected by role and visible text, never by ID |
| Tabs | Three on one route — Company Matrix, Region Weekly Peaks, Location Activation. Switching tabs does not change the URL |
| Criteria bar | Country, Currency and Business Tier dropdowns plus the discount-threshold field. It sits at page level, outside every tab panel, which is why the Save button is a page header control |
| Grid | 9 tier rows by 23 columns once loaded. Placeholder rows paint first, so readiness is judged by the placeholders disappearing rather than by a row count |
| Edit Tier dialog | 21 percentage inputs, rendered into a portal outside the tab panel |
| Save cycle | Disabled while pristine; enables on a valid change. The button disables on click before the write completes, so a save is confirmed by reloading and re-reading, never by waiting on the button |
| Unsaved changes | This surface shows no in-app unsaved-changes prompt. A pending threshold edit survives a tab switch and is discarded only by a reload |
| Old-site baseline | `clients/encore/specs_planning/_internal/old-site-baseline/discount-matrix-2026-08-19.md` |
| Suite verification | 43 cases, green on two consecutive full runs on office 1604 with retries disabled |

---

## Validation Rules

**Percentage inputs (Edit Tier dialog)**: valid range is 0 to 100. An out-of-range value sets the invalid state on the input and holds Update disabled. No user-visible message is rendered to explain the rejection — TC-DSM-CMX-019 asserts that absence deliberately as evidence of a defect, so a future message will surface as a failure to be re-baselined rather than a regression.

**Empty and non-numeric input disagree across two fields of the same class.** In the dialog, clearing a percentage field or typing letters resolves silently to `0%`, leaves the field valid, and keeps Update enabled — so an unintended zero discount can be committed with no warning. The criteria-bar threshold field reverts to its previous value for the same input. Both behaviours are asserted as observed; the disagreement is the finding.

**Negative values**: the minus key is refused by the input handler in both the dialog and the criteria bar. In the threshold field the sign is dropped and the remaining digits are processed, so `-5` becomes `5`.

**Upper boundary**: the threshold field accepts exactly 100 as valid.

**Display format**: the first percentage field in the dialog renders its raw decimal value while the remaining twenty render as percentages. Same underlying value, two formats in one dialog — TC-DSM-CMX-022 asserts this as defect evidence.

**Cancel**: cancelling the Edit Tier dialog discards every pending edit and leaves the row byte-identical to its recorded baseline.

**Grid re-key**: changing Country, Currency or Business Tier re-keys the grid. Row content must be re-read after any header change rather than reused from a prior snapshot.

---

## Section A — Header × Submodule

*Every header control participates in the grid key, so each one is exercised against this submodule
rather than tested once in isolation.*

## TC-DSM-CMX-001: Grid loads when all three header keys are set
**Steps**: Open the route at office 1604. Wait for a non-zero tier-row count.
**Expected**: Company Matrix is the active tab; the grid renders its tier rows with all 21 percentage
columns populated. Header reads Country `United States`, Currency `USD`, Business Tier `Standard`.

## TC-DSM-CMX-002: Changing Country re-keys the grid
**Steps**: Record the current tier-range list and the first row's 21 values. Change **Country** to a
different option. Wait for the grid to settle on a non-zero row count **or** an empty state.
**Expected**: The grid re-queries for the new key. Either the tier set/values differ from the recorded
baseline, or a documented empty state renders. The grid must **not** silently retain the previous
country's data.

## TC-DSM-CMX-003: Changing Currency re-keys the grid
**Steps**: As TC-002, changing **Currency**.
**Expected**: Grid re-queries against the new `(country, currency, tier)` key; stale rows are not retained.

## TC-DSM-CMX-004: Changing Business Tier re-keys the grid
**Steps**: As TC-002, changing **Business Tier**.
**Expected**: Grid re-queries against the new key; stale rows are not retained.

## TC-DSM-CMX-005: Header Save persists only the GAV threshold
**Steps**: Record the first tier row's 21 values. Edit **GAV Discount Threshold** to a valid new
percentage. Click the header **Save**. Reload the route.
**Expected**: The GAV threshold persists at its new value; the Company Matrix grid values are **unchanged**.
Header Save must not write matrix rows.
**Restore**: return GAV to its original value and save.

## TC-DSM-CMX-006: Empty state when a header key is not set
**Steps**: Drive the header to a `(country, currency, businessTier)` combination that has no matrix rows.
**Expected**: A documented empty state renders. This is **correct behaviour per NM-2219 AC1**, not a data
gap — the tab loads rows only when all three keys resolve to data.

## TC-DSM-CMX-007: Unsaved dialog edit is not carried across a header change
**Steps**: Open Edit Tier on `0 - 1500`, change one percentage to a valid new value, **Cancel**. Then
change a header control. Reload.
**Expected**: No value from the cancelled edit is persisted or carried into the re-keyed grid.
**Note**: measured 2026-08-19 — this surface shows **no in-app Unsaved-Changes prompt**. Neither
clicking Export nor switching tabs while dirty produced one; only the browser's own beforeunload guard
fires, and only on a full page unload. Do not write this case expecting a prompt. If one ever does
appear, record its exact text rather than dismissing it — that would be a behaviour change worth
reporting.

---

## Section B — Grid surface (Axis 2, L1 must-asserts)

## TC-DSM-CMX-008: Column structure is exactly 3 groups × 7 buckets *(result-fidelity)*
**Expected**: Three group headers render in order — `Non-Peak Booking Windows Days`,
`Standard Booking Windows Days`, `Peak Booking Windows Days`. Each carries the seven buckets `0-15`,
`16-30`, `31-60`, `61-90`, `91-180`, `181-365`, `365 +`, in that order. Total 21 percentage columns.

## TC-DSM-CMX-009: Tier ranges are contiguous and non-overlapping *(result-fidelity)*
**Expected**: Every rendered tier range's start equals the previous range's end + 1. No overlap and no
gap across the full ordered set.
**Why**: NM-3239 and NM-3435 are both boundary-integrity defects; this is the standing invariant they
violate.

## TC-DSM-CMX-010: Percentage cells are read-only in the grid *(render-state)*
**Expected**: `tbody` contains **zero** `<input>` elements. All 189 percentage values are static text.
Editing is reachable only through the Edit Tier dialog.

## TC-DSM-CMX-011: Grid readiness is data-driven, not container-driven *(render-state)*
**Expected**: The grid container is present in the DOM before data arrives. A readiness check must wait
for a **non-zero row count**; waiting on the container alone must not be treated as "loaded".
**Why**: this exact mistake produced three false "grid is empty" findings on the sibling page.

## TC-DSM-CMX-012: Every tier row exposes Delete and Edit controls *(result-fidelity)*
**Expected**: Each tier row carries `button[title="Delete"]` and `button[title="Edit"]`, in that DOM
order. Locate rows by visible range text, never index.

---

## Section C — Edit Tier dialog (Axis 1, per-field FCC)

## TC-DSM-CMX-013: Dialog roster
**Steps**: Open Edit on the row `0 - 1500`.
**Expected**: Title reads `Editing 0 - 1500`. Exactly **21** inputs, all `type="text"`
`inputmode="decimal"`, placeholder `0`. Buttons `Cancel` and `Update`. **No Revenue Tier start/end
fields** — tier boundaries are not editable here.

## TC-DSM-CMX-014: Whole numbers get `%` appended unchanged
**Steps**: In Non-Peak `0-15`, clear, type `14`, Tab.
**Expected**: Renders `14%`; `aria-invalid=false`; **Update enabled**.
**Regression link**: NM-3235 — filed symptom was `1400%`. Must not recur.

## TC-DSM-CMX-015: Decimals below 1 are multiplied by 100
**Steps**: Trial `0.14`, then `0.5`, each in a fresh dialog.
**Expected**: `0.14` renders `14%`, `0.5` renders `50%`; both valid, Update enabled.
**Regression link**: NM-3235's Expected Result asked for exactly this.

## TC-DSM-CMX-016: Single-digit `1` renders `1%`, not `100%`
**Steps**: Clear Non-Peak `0-15`, type `1`, Tab.
**Expected**: Renders **`1%`**; `aria-invalid=false`; Update enabled.
**Regression link**: NM-3387 — filed symptom was `1` → `100%`. Must not recur.

## TC-DSM-CMX-017: Upper boundary: 100 accepted, 101 rejected
**Steps**: Trial `100`, then `101`, each in a fresh dialog.
**Expected**: `100` → `100%`, valid, Update **enabled**. `101` → `aria-invalid=true`, Update **disabled**.

## TC-DSM-CMX-018: Out-of-range values disable Update and are never persisted
**Steps**: Type `150`, Tab, observe, then **Cancel**. Re-read the grid row.
**Expected**: `aria-invalid=true`, Update disabled; after Cancel the row is byte-identical to its
pre-trial values.

## TC-DSM-CMX-019: Out-of-range rejection shows no user-visible message ⚠ **BUG EVIDENCE**
**Steps**: Type `101`, Tab. Query every element matching
`[aria-live],[class*=error],[class*=Error],[class*=invalid],[role=alert]` and collect their text.
**Observed**: all matching elements return an **empty string**; the value still renders as
`101%` as though accepted; Update is silently disabled.
**Expected (correct behaviour)**: a visible message explains why the value is rejected.
**Status**: intentionally asserts the defect — see DEFECT-1 in the walk-evidence artifact. Confirmed on
`101`, `150` and `3456`, clean method, blur committal proven.

## TC-DSM-CMX-020: Negative values cannot be entered
**Steps**: Clear the field, `press Minus`, read the value **before** any Tab, then `press Digit1`, Tab.
**Expected**: The `-` keypress is refused by the input handler — the value is unchanged by it — and the
resulting value is `1` → `1%`. Negative entry is impossible by keyboard.
**Note**: by design for `inputmode="decimal"`; asserted so a future change to the input handler is caught.

## TC-DSM-CMX-021: Empty and non-numeric input silently resolve to zero percent
**Steps**: Clear the field and Tab. Separately, clear the field, type `abc`, and Tab.
**Expected (measured live, with a passing control alongside)**: both render **`0%`**, `aria-invalid` is
**`false`**, **Update stays enabled**, and no message appears.

| Trial | Before | After blur | `aria-invalid` | Update |
|---|---|---|---|---|
| cleared | `17%` | **`0%`** | `false` | **enabled** |
| `abc` | `17%` | **`0%`** | `false` | **enabled** |
| `14` (control) | `17%` | `14%` | `false` | enabled |

**This case previously read "both leave the field empty with `aria-invalid=true` and Update disabled."**
That came from a single unreplicated walk observation and is **refuted**: the field is not rejecting
anything, it is substituting zero. The control trial passed in the same run, so the harness is not in
question.

**Status**: asserts **observed** behaviour, not agreed-correct behaviour. A user who mistypes into a
percentage field gets a silent `0%` with Save still available, so an unintended zero discount can be
committed with no warning. Note the criteria-bar threshold field **reverts to its previous value** for
the same input — see TC-039 — so two fields of the same class on one screen disagree.

## TC-DSM-CMX-022: Field 0 opens in a different format from fields 1–20 ⚠ **BUG EVIDENCE**
**Steps**: Open the dialog fresh and, **before touching anything**, read the `value` of all 21 inputs.
**Observed**: index 0 renders raw **`0.17`**; indices 1–20 render `%`-formatted (`17%`, `20%`, `12%`, `15%`, `7%`, `10%`). Same underlying value, two formats in one dialog.
**Expected (correct behaviour)**: all 21 render in one consistent format.
**Status**: intentionally asserts the defect — see DEFECT-2. Reproduced across three independent runs and
eleven fresh dialog opens.

## TC-DSM-CMX-023: Repeated focus cycling does not alter an invalid value
**Steps**: Type `3456`, Tab; then click back into the field and Tab out, twice more (three cycles total, real pointer and keyboard).
**Expected**: Value, `aria-invalid` and the Update state are **identical after every cycle**. No
progressive conversion.
**Regression link**: NM-3390 — filed symptom was progressive division until the value became saveable.

## TC-DSM-CMX-024: Cancel discards every pending edit
**Steps**: Record the row's 21 values. Open Edit, change several fields to valid new values, click
**Cancel**. Re-read the row.
**Expected**: The row is byte-identical to the recorded baseline. Nothing is persisted.

---

## Section D — Toolbar surfaces: Export and Add Tier

Walked 2026-08-19 in runs `dsm-cmx-toolbar2-0819` (Add Tier, cancel-only) and `dsm-cmx-export-0819`
(Export, two independent clicks with native network capture). Both were previously listed as deferred.

## TC-DSM-CMX-025: Export downloads a workbook named from the current criteria
**Steps**: Load the tab and wait for a non-zero tier-row count. Click **Export** and capture the
download event.
**Expected**: A download occurs. The filename follows `DiscountMatrix-{country}-{currency}-{tier}.xlsx`
— for the default criteria (United States / USD / Standard) it is
`DiscountMatrix-US-USD-Standard.xlsx`. The name must be **derived from the criteria bar**, not asserted
as a fixed literal, so a currency or tier change is covered by the same assertion.
**Regression link**: NM-3255 — filed symptom was a raw timestamp filename
(`DiscountMatrixExport_7_27_2026, 9_41_48 AM.xlsx`). Verified fixed 2026-08-19.

## TC-DSM-CMX-026: Export completes successfully and returns a spreadsheet
**Steps**: Capture network traffic, click **Export**, inspect the export request and its response.
**Expected**: The request to `/navigator/api/discount/company-matrix/export` returns **HTTP 200** with
`content-type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` and a
`content-disposition: attachment` header. It is a **POST** whose body carries the criteria
(`countryId`, `currencyId`, `businessTierId`, `locale`) — the criteria are **not** in the query string.
**Regression link**: NM-3062 — filed symptom was HTTP 500. Verified fixed 2026-08-19.
**Note for the implementer**: the endpoint answers **405** to GET and HEAD. It is POST-only. Do not
assert the export by issuing a bare GET to the URL — that measures the wrong thing and reads as a
server error. Drive the real button and capture what it sends.

## TC-DSM-CMX-027: Exported values match the grid, cell for cell
**Steps**: Read all 21 percentage values for each of the 9 tier rows from the rendered grid. Export.
Parse the workbook. Diff every cell.
**Expected**: All **189** cells match. The grid renders `17%`; the workbook stores the bare integer
`17` — normalise the `%` before comparing rather than treating the difference as a mismatch.
**Surface family**: result-fidelity. This is the assertion that catches a column-group mis-mapping,
which a header-only check would miss entirely.

## TC-DSM-CMX-028: Exported workbook keeps its round-trip template shape
**Steps**: Export and inspect the workbook structure.
**Expected**: One sheet, `DiscountMatrix`. Row 1 is the editing instruction the Import flow depends on.
Row 2 carries `ID`, `Country`, `Currency`, `Revenue Tier` and the three group headers
(`Non-Peak` / `Standard` / `Peak` `Booking Windows by Days`). Row 3 carries the 7 day-bucket
sub-headers per group. Rows 4 onward are one row per tier, in grid order.
**Why it matters**: the export is the Import template. A shape change breaks round-tripping even when
every value is correct.

## TC-DSM-CMX-029: Export identifier column carries the platform identifier
**Steps**: Export and read the `ID` column.
**Expected**: Each row's ID is a 36-character hyphenated identifier
(e.g. `92a1f836-08f9-5c2f-160b-2aed8c995165`).
**Regression link**: NM-3236 filed this as a defect ("shows a GUID instead of a legacy numeric ID"),
but a 2026-07-27 developer comment on NM-2219 confirms the identifier is **expected** after the platform
migration, and the ticket is closed. This case therefore asserts the **current agreed contract**, not a
defect. Do not write a case expecting a sequential integer.

## TC-DSM-CMX-030: Add Tier opens with one End Tier field and a disabled confirm
**Steps**: Click **Add Tier**. Read the dialog without typing.
**Expected**: Title is `Adding Tier`. Exactly **one** input, labelled `End Tier`
(id `discount-matrix-tier-end`, numeric input mode). There is **no Start Tier field** — the new tier's
start is derived. Buttons are `Cancel` and `Add Tier`, and the confirm button is **disabled on open**.
**Why it matters**: this dialog is the only route to creating a tier boundary; the Edit dialog exposes
percentages only. Any case that expects to set a tier's start here is written against a control that
does not exist.

## TC-DSM-CMX-031: End Tier validation is submit-time, not blur-time
**Steps**: Open Add Tier. Enter `30000000` (above the current maximum of `20000000`). Press Tab.
Read the state **without clicking confirm**.
**Expected**: No inline validation appears on blur — the value renders as typed, `aria-invalid` is
absent, no message renders — and the **`Add Tier` button becomes enabled**. The range rejection happens
on submit.
**Regression link**: NM-3237 — filed symptom was "Invalid End Tier value" on clicking Add.
**Status**: **deliberately stops before the confirm click.** If the defect is fixed, clicking confirm
creates a real tier on a live office. Completing this case end-to-end requires an explicit decision to
mutate plus a cleanup path (delete the created tier); until then it asserts the pre-commit state only,
and that limit is the point, not an omission.

## TC-DSM-CMX-032: End Tier silently refuses non-numeric input
**Steps**: Open Add Tier. Attempt to type `abc` into End Tier. Press Tab.
**Expected**: The field stays **empty** — the characters never reach the value (numeric input mode plus
a digits-only pattern) — `aria-invalid` is absent, no message renders, and the confirm button stays
**disabled**. The same holds for an empty field.
**Note**: the refusal is silent by design at the input layer. This case asserts that the control cannot
be driven into an invalid state, not that an error message appears.

## TC-DSM-CMX-033: Cancelling Add Tier leaves the grid untouched
**Steps**: Record the tier row count and the full ordered range list. Open Add Tier, enter a value,
click **Cancel**. Re-read the grid.
**Expected**: 9 rows, the same ordered ranges, ending `100001 - 20000000`. Nothing was created.
**Why it matters**: every Add Tier case above is cancel-only, so this is the guard that proves those
cases are non-mutating and the suite is re-runnable.

---

## Section E — GAV Discount Threshold field

*The header's only free-text field. It participates in the grid key's sibling contract and is the sole
value the header Save persists, so its input contract is asserted directly.*

## TC-DSM-CMX-034: Threshold accepts a whole number and renders it as a percentage
**Steps**: Type `20` into GAV Discount Threshold with real keystrokes, press Tab.
**Expected**: Renders `20%`. `aria-invalid` is false. No validation message.
**Implementer note**: this field must be driven with character-by-character typing. Playwright's
`fill()` corrupts it — filling `20%` renders `15.2%` while typing the same characters renders `20%`.
The page object already types; do not "simplify" it back to a fill.

## TC-DSM-CMX-035: Threshold multiplies a decimal below one by a hundred
**Steps**: Type `0.2`, Tab.
**Expected**: Renders `20%`, valid, Save available. Matches the Edit Tier dialog's contract for the
same input class.

## TC-DSM-CMX-036: Threshold keeps a fractional value above one
**Steps**: Type `12.5`, Tab.
**Expected**: Renders `12.5%`, valid. The fraction is not rounded away.

## TC-DSM-CMX-037: Threshold marks an out-of-range value invalid without saying why
**Steps**: Type `101`, Tab. Sweep the page for any validation message.
**Expected**: Renders `101%` with `aria-invalid="true"`, and **no visible message anywhere**.
**Status**: intentionally asserts the defect. This is DEFECT-1 in its second location — the same
silent-rejection behaviour already recorded for the Edit Tier dialog's percentage fields, confirming it
is a surface-wide pattern rather than one control's bug.

## TC-DSM-CMX-038: Threshold treats zero and empty as zero percent
**Steps**: Type `0`, Tab. Then clear the field entirely, Tab.
**Expected**: Both render `0%` and are valid. An emptied field does not stay blank and is not
flagged invalid.

## TC-DSM-CMX-039: Threshold refuses non-numeric input, but an emptied field becomes zero
**Steps**: two paths, because they give different results and only together characterise the field.
1. **Refusal** — select the existing value and type `abc` over it **without deleting first**, Tab.
2. **Empty** — clear the field, then type `abc`, Tab.

**Expected (both measured live)**:
- Path 1 → the value is **unchanged** (`15%`); the characters never reach the field. `aria-invalid`
  stays false, no message.
- Path 2 → renders **`0%`**; the field was genuinely empty before `abc` was refused, and an empty
  threshold commits as zero. `aria-invalid` stays false, no message.

**Why the distinction matters**: the original case asserted only path 1 while driving path 2, and failed.
Both readings were correct all along — `Control+A` then typing leaves the selection intact when the
keystrokes are refused, whereas `Control+A` + `Delete` leaves the field empty. Any helper that clears
before typing will therefore never observe the refusal.

**Implementer note**: path 1 is meaningless if the field already reads `0%`, so the case asserts a
non-zero starting value before typing.

**Cross-reference**: the Edit Tier dialog's percentage inputs resolve **both** paths to `0%` (TC-021).
The two fields are inconsistent, and the dialog's variant is the one that can silently zero a discount.

## TC-DSM-CMX-040: An unsaved threshold survives a tab switch and is discarded only by a reload
**Steps**: Record the threshold. Type a different valid value, Tab, and — **without saving** — click the
Region Weekly Peaks tab, then return to Company Matrix. Then reload the route.
**Expected (measured live)**:
- After the tab round trip → the typed value is **still there**. No Unsaved-Changes prompt appears on
  the way out or back.
- After the reload → the threshold is back to its original value. Nothing was persisted.

**This case previously expected the tab switch itself to discard the edit.** It does not. The threshold
lives in the page-level criteria bar, **outside** every tab panel — the same reason the Save button is a
page header control — so switching tabs never unmounts it. The earlier "the value is gone" reading was
taken after a **fresh navigation**, not after switching back, and the two were conflated.

**Status**: asserts **observed** behaviour, not agreed-correct behaviour. A reported reproduction implies a prompt should exist here and none does; whether that absence is intentional or a regression is
unresolved. A user can leave a pending edit on screen, wander to another tab and come back with no
indication anything is unsaved. Treat a future prompt as a change worth reporting, not a failure.
**Status**: this asserts **observed** behaviour, not agreed-correct behaviour. A reported reproduction implies a prompt should exist here. Whether its absence is an intentional change or a regression is unresolved —
see the walk evidence. Treat a future appearance of a prompt as a change worth reporting, not a failure.

## TC-DSM-CMX-041: Threshold accepts exactly 100 as the valid upper boundary
**Steps**: Type `100`, Tab.
**Expected (measured live)**: Renders `100%`. `aria-invalid` is false. Save button enabled. No
validation message visible. Value reverts to `15%` after reload — nothing was saved.
**Why it matters**: TC-037 covers `101` as invalid but nothing previously asserted that `100` itself
is accepted. The boundary must be walked, not inferred.

## TC-DSM-CMX-042: Threshold silently refuses a negative sign and processes the remaining digits
**Steps**: Type `-5`, Tab.
**Expected (measured live)**: The minus sign is refused at the input layer. Only `5` reaches the
field, which renders as `5%`. `aria-invalid` is false. Save button enabled. No validation message.
Value reverts to `15%` after reload — nothing was saved.
**Why it matters**: negative input is covered for the Edit Tier dialog but was untested for this
field. The refusal is silent — the same pattern already recorded for non-numeric input (TC-039).

---

## Deferred / not-yet-walked — NO cases authored, deliberately

These surfaces exist on the tab and are **in scope for the module**, but were not walked in the
2026-08-19 session. No test cases are written for them, because a case authored against an unwalked
surface is fabrication. Each names the concrete unlock.

| Surface | Why no cases yet | Unlock |
|---|---|---|
| **Add Tier — the commit half** | The dialog is now walked (TC-030 … TC-033), but every case stops before the confirm click. NM-3237's rejection is submit-time, so proving it needs a real submit. | An explicit decision to mutate office 1604, plus a cleanup path to delete whatever tier gets created. This is a call for the plan owner, not a technical blocker. |
| **Delete Tier** | Never exercised. NM-3239 (recalculation after deleting a split tier) and NM-3435 (duplicate-tier delete error) both live here. | Walk the delete confirmation affordance; the destructive step needs an explicit mutation decision. |
| **Import** | Never exercised. Server-side validated with a row-level error list per NM-2219 AC4; mutating by nature. | Needs a decision on a safe office and fixture files before any trial. |
| **Export while dirty** | NM-3256 — modifying the threshold without saving, clicking Export, then Discard on the Unsaved Changes prompt, reportedly aborts the download. Not exercised: it needs a dirty state, which means typing into the criteria bar. | Drive the threshold field to dirty, click Export, take Discard, and assert the download still completes. Non-mutating if Discard is taken, so this is cheap once someone sequences it. |
| **Permission gating** | NM-2219 AC6 disables editing when `!canEdit`; §1.6 documents `ROLE_FUNCTION_REVENUEMGMT` at Read(2) vs Edit(3). | Requires a second, read-only test account — none is configured. |
| **UI↔DB column mapping** | **CLOSED as far as this surface allows.** The exported payload uses the same three UI names in the same order (`Non-Peak` / `Standard` / `Peak`), and all 189 exported cells match the grid, so no divergence is observable here. | Nothing further from the UI. A true DB-internal naming check would need the API schema, which is out of scope for a UI walk. |

## Regression bank — live reconciliation 2026-08-19

All twelve Jira defects filed against this tab are **closed**; this is a pure regression bank, so any row
that still reproduces is a **reopened regression**, not a known-open bug. Every one was originally filed
against office **1101** on `cloudapps-dev`/`cloudapps-trn` — **not** our target — so a non-repro here is
only meaningful where the precondition was confirmed present.

| Ticket | Status | Verified on 1604 today | Covered by |
|---|---|---|---|
| NM-3235 | Done | **FIXED-CONFIRMED** | TC-014, TC-015 |
| NM-3387 | Done (Blocker) | **FIXED-CONFIRMED** | TC-016 |
| NM-3390 | Done (Blocker) | **FIXED-CONFIRMED** | TC-023 |
| NM-3239 | Done *(plan said "QA open" — drifted)* | precondition present, **not exercised** | deferred — Delete Tier |
| NM-3237 | Done | **PARTIAL** — the blur-time half is measured: `30000000` produces no inline error and *enables* confirm, so the validation is submit-time. The submit itself was not clicked. | TC-031 (pre-commit only); commit half deferred |
| NM-3435 | Done (Blocker) | not exercised | deferred — Delete Tier |
| NM-3236 | Done | **not a defect** — the identifier is present and is a GUID; ruled expected by product in NM-2219 | TC-029 asserts the agreed contract |
| NM-3255 | Done *(drifted from "Review")* | **FIXED-CONFIRMED** — filename is `DiscountMatrix-US-USD-Standard.xlsx`, matching the documented convention | TC-025 |
| NM-3256 | Done *(drifted from "Review")* | not exercised — needs a dirty state first | deferred — Export while dirty |
| NM-3062 | Done | **FIXED-CONFIRMED** — POST returns 200 with a spreadsheet body, on two independent clicks | TC-026 |
| NM-3229 | Done | **out of behavioural scope** — icon identity is presentation, not behaviour | no TC |
| NM-3233 | Done *(drifted from "QA")* | **out of behavioural scope** — button placement | no TC |
