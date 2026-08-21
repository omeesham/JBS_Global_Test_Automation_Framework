---
module: discount-matrix
submodule: company_matrix
moduleCode: DSM
submoduleCode: CMX
office: 1604 (Parker Palm Springs)
environment: cloudapps-e2e.encoreglobal.com
walkDate: 2026-08-19
provenance: live
evidence: .tmp/delegation-out/dsm-cmx-navwalk2-0819/navwalk.md
producedBy: copilot worker run dsm-cmx-navwalk2-0819 (T2 sonnet), dispatched under SUBPLAN_DISCOUNT_MATRIX_COMPANY_MATRIX
verifiedBy: UNVERIFIED-BY-OWNER — Claude RE-READ the worker output; it did NOT re-run it (labor-gate denies Claude every playwright-cli command). Independent re-derivation is pending. Claim class per PLAN_75-TEMP §3: OBSERVATION, single-source, unreplicated.
CrossCheck: PENDING — no independent re-drive yet; no canary was seeded in the producing run
scopeOfFrontmatter: the original walk only (sections up to the regression-bank dispositions). Sections 9–11 were added 2026-08-19/20 and carry their own provenance — they were derived by OWNER directly from Playwright trace artefacts (`trace.network`, `trace.trace`) and from probe runs `dsm-cmx-discrim-0819` and `dsm-cmx-valscope-0820`, not re-read from a worker's prose.
---

# Walk evidence — Discount Matrix › Company Matrix (office 1604, e2e, 2026-08-19)

Landed URL, verified stable across polls:
`https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/discount-matrix`
Page title: `Discount Matrix | Navigator`.

Navigation technique: `state-load` of the freshly-refreshed `clients/encore/.auth/encore-state.json`,
then `eval`-driven `window.location.href` (worker `goto`/`open` are sandbox-blocked). No SSO bounce.

## Machine denominator (LR-062)

| Element class | Count | How counted |
|---|---|---|
| Tabs (`[role="tab"]`) | 3 | Company Matrix (active), Region Weekly Peaks, Location Activation |
| Tier rows (`tbody tr`) | **9** | prior said 10 — **prior corrected, measurement wins** |
| Column groups | 3 | Non-Peak / Standard / Peak Booking Windows Days |
| Day buckets per group | 7 | `0-15`, `16-30`, `31-60`, `61-90`, `91-180`, `181-365`, `365 +` |
| Percentage columns | 21 | 3 × 7 — prior confirmed |
| Percentage value cells | 189 | 21 × 9, all **static text**, not inputs |
| `input` (whole page) | 2 | GAV Discount Threshold + 1 unidentified — see gap G1 |
| `button` | 44 | includes app chrome; tab-scoped toolbar = Add Tier, Export, Import, Save |
| `select` | 0 | none — the app uses Radix comboboxes |
| `[role="combobox"]` | 3 | Country, Currency, Business Tier |

## Structural finding that changes the coverage shape

**The grid is a read-only display surface.** `input[type=number]` in `tbody` = 0, `tbody input` = 0,
`tbody [role="spinbutton"]` = 0. Every one of the 189 percentage values is static `td` text.
Editing happens in the **Edit Tier dialog**, which matches the repro steps in NM-3235 and NM-3387
("click the Edit (pencil) icon for an existing Revenue Tier"). Consequence: FCC per-field cases target
the **dialog's** percentage fields, NOT inline grid cells. Any plan text assuming 21 editable inputs per
row is wrong.

## Criteria bar as rendered

| Control | Rendered value |
|---|---|
| Country | `United States` |
| Currency | `USD` |
| Business Tier | `Standard` |
| GAV Discount Threshold | `15%` (placeholder `0%`) |

## Observed tier ranges (all 9, in order)

`0 - 1500` · `1501 - 3000` · `3001 - 5000` · `5001 - 15000` · `15001 - 25000` · `25001 - 50000` ·
`50001 - 75000` · `75001 - 100000` · `100001 - 20000000`

**This settles two PRECONDITION questions from the Phase 2 Jira reconciliation:**
- NM-3237 needs a current max End Tier of `20,000,000` → **PRESENT on 1604**, so the row is testable here.
- NM-3239 needs the `100001 - 20000000` range to split at `400000` → **PRESENT on 1604**, testable here.
Neither can be dispositioned `PRECONDITION-ABSENT` on this office.

## Full percentage matrix (189 cells, as rendered)

| Revenue Tier | NP 0-15 | NP 16-30 | NP 31-60 | NP 61-90 | NP 91-180 | NP 181-365 | NP 365+ | ST 0-15 | ST 16-30 | ST 31-60 | ST 61-90 | ST 91-180 | ST 181-365 | ST 365+ | PK 0-15 | PK 16-30 | PK 31-60 | PK 61-90 | PK 91-180 | PK 181-365 | PK 365+ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 - 1500 | 17% | 17% | 17% | 17% | 20% | 20% | 20% | 12% | 12% | 12% | 12% | 15% | 15% | 15% | 7% | 7% | 7% | 7% | 10% | 10% | 10% |
| 1501 - 3000 | 17% | 17% | 17% | 20% | 20% | 22% | 22% | 12% | 12% | 12% | 15% | 15% | 17% | 17% | 7% | 7% | 7% | 10% | 10% | 10% | 10% |
| 3001 - 5000 | 17% | 17% | 20% | 20% | 22% | 22% | 22% | 12% | 12% | 15% | 15% | 17% | 17% | 17% | 7% | 7% | 10% | 10% | 10% | 12% | 12% |
| 5001 - 15000 | 17% | 20% | 20% | 22% | 22% | 22% | 25% | 12% | 15% | 15% | 17% | 17% | 17% | 20% | 7% | 10% | 10% | 12% | 12% | 12% | 12% |
| 15001 - 25000 | 20% | 20% | 22% | 22% | 22% | 25% | 25% | 15% | 15% | 17% | 17% | 17% | 20% | 20% | 10% | 10% | 12% | 12% | 12% | 15% | 15% |
| 25001 - 50000 | 20% | 22% | 22% | 22% | 25% | 25% | 27% | 15% | 17% | 17% | 17% | 20% | 20% | 22% | 10% | 12% | 12% | 12% | 15% | 17% | 17% |
| 50001 - 75000 | 22% | 22% | 22% | 25% | 25% | 27% | 27% | 17% | 17% | 17% | 20% | 20% | 22% | 22% | 12% | 12% | 12% | 15% | 15% | 17% | 17% |
| 75001 - 100000 | 22% | 22% | 25% | 25% | 27% | 27% | 30% | 17% | 17% | 20% | 20% | 22% | 22% | 22% | 12% | 12% | 15% | 15% | 15% | 17% | 20% |
| 100001 - 20000000 | 22% | 25% | 25% | 27% | 27% | 30% | 30% | 17% | 20% | 20% | 22% | 22% | 22% | 25% | 12% | 15% | 15% | 15% | 17% | 20% | 20% |

## Open gaps carried forward (not closed by this walk)

- **G1** — the 2nd `input` on the page is unidentified (one is GAV Discount Threshold). Resolve before
  the field inventory closes; do not assume it is decorative.
- **G2** — the Edit Tier dialog was NOT opened (this walk was read-only by ticket scope). Its field
  roster, input types, and rejection affordances are the real FCC surface and remain unwalked.
- **G3** — UI↔DB column mapping (UI `Non-Peak / Standard / Peak` vs DB `NonPeak/Peak/SuperPeak`) is
  still unmeasured; it needs a real payload from the export or the API, not the rendered table.

---

# Edit Tier dialog — field inventory (closes gap G2)

Source: worker run `dsm-cmx-dialog-0819`, same session/office/date. `INTEGRITY: CLEAN` — the `0 - 1500`
row was re-read after every trial and never changed; no Update/Save/Delete/Import was ever clicked.

Opened via: the `tbody tr` containing text `0 - 1500` → `button[title="Edit"]` (the row's second button;
the first is `title="Delete"`). Dialog title renders verbatim: **`Editing 0 - 1500`**.

| Property | Value |
|---|---|
| Inputs in dialog | **21** — one per percentage column, all `type="text"` `inputmode="decimal"`, placeholder `0` |
| Buttons | `Cancel`, `Update` |
| Revenue Tier start/end fields | **ABSENT** — the Edit dialog exposes percentages ONLY |
| Disabled / readonly inputs | none |

**Structural consequence.** Revenue-tier boundary editing is NOT reachable from Edit Tier. Tier ranges are
created only through **Add Tier**, so NM-3237 (End Tier rejection) and NM-3239 (split/delete
recalculation) must be exercised through Add Tier and the row Delete control — never through this dialog.
Any TC that plans to edit a tier boundary here will fail on a surface that does not exist.

## Regression-bank dispositions from live trials

**Claim class (PLAN_75-TEMP §3): OBSERVATION — single worker run, NOT independently re-derived.** Claude
could not re-run these (labor-gate). Preconditions were present in every case (dialog opens, fields accept
input), so PRECONDITION-ABSENT is ruled out — but "fixed" stays PROVISIONAL until an independent re-drive
with a seeded canary confirms it. Prior wording said these were
`FIXED-CONFIRMED`, not `PRECONDITION-ABSENT`.

| Ticket | Filed symptom | Observed 2026-08-19 on 1604/e2e | Disposition |
|---|---|---|---|
| NM-3235 | `14` → `1400%` + validation error | `14` → **`14%`**, `aria-invalid=false`, no message, Update **enabled** | FIXED-PROVISIONAL (single run, unreplicated) |
| NM-3235 (2nd half) | `0.14` → `14%` | `0.14` → stays **`0.14`**, no `%`, Update **disabled** | BEHAVIOUR-CHANGED (provisional) — see OBS-1 |
| NM-3387 | `1` → `100%` | `1` → stays **`1`**, no `%`, Update **disabled** | FIXED-PROVISIONAL for the stated symptom; see OBS-1 |
| NM-3390 | `3456` progressively divided over repeated focus, eventually saveable | `3456` held across **3** focus cycles, Update **disabled** throughout | FIXED-PROVISIONAL (single run, unreplicated) |

## New observations (candidates — NOT yet filed, pending the boundary battery)

**OBS-1 — low values are rejected with no rejection affordance.** `1` (= 1%) and `0.14` both leave the
Update button disabled while `aria-invalid` stays `false` and **no validation message renders**. `14` by
contrast is accepted and reformatted to `14%`. Two problems are tangled here and the boundary battery
(`dsm-cmx-boundary-0819`) separates them: (a) *is* rejecting `1` correct, given 1% is a legitimate
discount and `7%` already exists in this very grid; (b) regardless of (a), a rejection that shows the user
nothing is a rejection-affordance defect under the FCC §2.1 oracle. Do not file until the accept/reject
rule is measured — "rejects 1" may be one end of a deliberate boundary.

**OBS-2 — inconsistent value formatting on dialog open.** Input index 0 (Non-Peak `0-15`) opens showing
raw **`0.17`** while inputs 1–20 open `%`-formatted (`17%`, `20%`, …). Same underlying value, two render
formats in one dialog. Reproduced on four separate fresh opens during the dialog walk; being re-confirmed
independently as Q3/Q4 of the boundary battery before any filing.

Both are behaviour/rendering defects, not DOM-markup findings — they are fileable once characterised.

---

# Two-run reconciliation (PLAN_75-TEMP §3 claim typing)

Two independent runs measured the Edit Tier percentage field with **different methods**:
- **Run A** `dsm-cmx-dialog-0819` — real interaction, fresh dialog per trial, per-trial row check.
- **Run B** `dsm-cmx-boundary-0819` — `nativeInputValueSetter` + synthetic `input`/`change`/`blur`,
  **15 trials inside ONE dialog open** (ticket required fresh opens; worker cited credit constraints and
  disclosed the deviation), single row check at the end.

Run B's own ASSUMPTIONS 2 and 5 admit prior values persisted between trials, and its `-1` / `abc` rows
report a previous trial's lingering value rather than a clean result. Its method is therefore **not
authoritative for the disputed cells** — but its disclosure was complete and honest, which is why the
conflict is visible at all.

## AGREED across both runs — claim class OBSERVATION, independently re-derived, method-diverse

| Fact | Run A | Run B |
|---|---|---|
| Dialog holds **21** inputs, `type=text`, `inputmode=decimal`; buttons `Cancel` + `Update` | ✓ | ✓ |
| **No Revenue Tier start/end fields** in the Edit dialog | ✓ | ✓ |
| `14` → renders **`14%`**, `aria-invalid=false`, Update **enabled** | ✓ | ✓ |
| **No validation message renders on any rejection** | ✓ | ✓ (qualified — see below) |
| `0 - 1500` row unchanged; nothing saved | ✓ | ✓ |
| **Input 0 opens raw `0.17`; inputs 1–20 open `%`-formatted** | ✓ 4 fresh opens | ✓ 3 fresh opens, all 21 listed |

**OBS-2 is now CONFIRMED** — two runs, different methods, seven fresh dialog opens between them, and
Run B enumerated all 21 values (`0:0.17 | 1:17% | 2:17% | … | 20:10%`). Exactly one input renders raw
decimal. This is a behaviour/rendering defect and is **fileable**.

Caveat carried forward on the "no validation message" row: Run B's ASSUMPTION 4 states its scan was a
leaf-node text sweep (`p,span,div`, no children, <200 chars) and would miss an error rendered through a
different DOM shape. Run A reported none by separate means. Treat as **strongly indicated, not proven** —
a filing on the rejection-affordance defect must first confirm the app has no error channel elsewhere.

## DISPUTED — resolution pending run `dsm-cmx-tiebreak-0819`

| Input | Run A | Run B | Why it matters |
|---|---|---|---|
| `1` | stays `1`, Update **disabled** | **`100%`**, Update **enabled** | Run B's result IS the NM-3387 filed symptom — i.e. the bug would still be live |
| `0.14` | stays `0.14`, Update **disabled** | **`14%`**, Update **enabled** | Run B's result IS the NM-3235 decimal symptom |

**Consequence: the NM-3235 / NM-3387 `FIXED-PROVISIONAL` dispositions above are NOT SAFE to rely on.**
Run B's rule ("values ≤ 1 are multiplied by 100 on render") would mean the fraction-interpretation defect
is still live and merely differently shaped. Do not author any TC asserting either behaviour, and do not
report either ticket as fixed, until the tie-breaker lands. The tie-breaker constrains method explicitly:
real keystrokes via `fill`/`type` + real `Tab`, fresh dialog per trial, per-trial row verification,
synthetic value injection forbidden.

## Single-source, UNREPLICATED — Run B only, do not treat as settled

`0`→`0%` · `5`→`5%` · `7`→`7%` · `10`→`10%` · `13`→`13%` · `15`→`15%` · `50`→`50%` · `99`→`99%` ·
`100`→`100%` all accepted; **`101` → `aria-invalid=true`, Update disabled** (upper bound appears to be
100); `12.5`→`12.5%` accepted; `(empty)` and `abc` rejected. `-1` is **INCONCLUSIVE** — the synthetic
method never delivered the `-` character, so the prior value persisted. A negative-value trial by real
keystroke is still owed.

---

# RESOLVED by tie-breaker `dsm-cmx-tiebreak-0819` (real keystrokes, fresh dialog per trial)

Method: `Ctrl+A` → `playwright-cli type` → `playwright-cli press Tab`; dialog reopened for every trial;
grid row re-read after every Cancel. Synthetic value injection was forbidden by the ticket and not used.

| Input | Run A | Run B | **Tie-breaker (authoritative)** |
|---|---|---|---|
| `14` | `14%` enabled | `14%` enabled | **`14%` enabled** — 3/3 agree |
| `0.14` | `0.14` disabled | `14%` enabled | **`14%` enabled** — agrees with B |
| `1` | `1` disabled | `100%` enabled | **`1%` enabled** — agrees with neither |
| `0.5` | not run | `50%` enabled | **`50%` enabled** — agrees with B |

**Measured transform rule**: whole numbers get `%` appended unchanged; decimals strictly below 1 are
multiplied by 100 before the `%`. Self-consistent across all four trials.

## Run A carried a method defect — re-scrutinise its other results

Run A's two disputed cells reported the **raw typed text with no `%` and Update disabled** (`1`, `0.14`).
That is the signature of a field whose blur never committed, not of a rejection: the formatter never ran
and the control stayed mid-edit. The tie-breaker typing the identical characters with a real `Tab` got
`1%` and `14%`, both valid and enabled. **Run A's blur did not fire.**

**Consequence — NM-3390 is now UNRESOLVED, not fixed.** Run A is the only run that tested it, and its
result ("`3456` unchanged across 3 focus cycles, Update disabled throughout") is precisely what an
uncommitted field also produces. It cannot be distinguished from the method defect above. The earlier
`FIXED-PROVISIONAL` on NM-3390 is **withdrawn** pending a clean-method re-test.

## Dispositions after the tie-breaker

| Ticket | Disposition | Basis |
|---|---|---|
| NM-3235 | **FIXED-CONFIRMED** | `14`→`14%` on all three runs; `0.14`→`14%` on the two clean-method runs. The ticket's own Expected Result asked for exactly both. |
| NM-3387 | **FIXED** — filed symptom `1`→`100%` does not occur; observed `1`→`1%` | Tie-breaker only. Method-authoritative but **uncorroborated** — the one cell where all three runs disagreed. Corroborate before it reaches a client-facing report. |
| NM-3390 | **UNRESOLVED** — withdrawn | Sole source (Run A) is method-defective; see above |

## OBS-2 strengthened to three runs

Tie-breaker read input 0 as `0.17` on open in **all four** of its fresh dialog opens, independently of
Run A (4 opens) and Run B (3 opens + all-21 enumeration). **Eleven fresh opens across three runs, three
different methods, same result.** OBS-2 is settled and fileable.

## Rejection affordance remains SINGLE-SOURCE — not fileable

The tie-breaker searched `[aria-live],[class*=error],[class*=Error],[class*=invalid]` — a much better
error-channel probe than Run B's leaf-node sweep — and found nothing. **But every tie-breaker input was
ACCEPTED**, so no rejection ever occurred and no message was due. It therefore says nothing about
rejection affordance. Only Run B exercised rejections (`101`, empty, `abc`), with the weaker scan.
A rejection-with-no-message filing still needs one clean-method rejection trial using the tie-breaker's
selector set.

---

# FINAL dispositions — after `dsm-cmx-close-0819` (clean method, blur proven per trial)

That run required `document.activeElement` after every Tab, so a non-committing blur could not
masquerade as data. It reported `INPUT, index 1 (blur committed)` on every single trial. It also carried
a proper `## METHOD DELTA`: `playwright-cli fill` rejects args beginning with `-` (parsed as a flag), so
the negative trial used `press Minus` + `press Digit1` as real key events, and focus cycling used real
`click`, not JS `.focus()`.

| Ticket | FINAL | Evidence |
|---|---|---|
| NM-3235 | **FIXED-CONFIRMED** | `14`→`14%` on 3 runs; `0.14`→`14%` on 2 clean-method runs. Ticket's own Expected Result asked for exactly both. |
| NM-3387 | **FIXED-CONFIRMED** | `1`→**`1%`** (not the filed `100%`). Three clean observations: tie-breaker, close-probe G2, close-probe G4. Earlier "uncorroborated" caveat is now discharged. |
| NM-3390 | **FIXED-CONFIRMED** | `3456` held at `3456%`, `aria-invalid=true`, Update disabled, **identical across 3 real click+Tab focus cycles**, blur proven each time. No progressive division. Run A's suspect result is independently vindicated by clean method. |

## Measured field contract (for the Axis-1 FCC cases)

- Whole numbers: `%` appended unchanged — `14`→`14%`, `1`→`1%`, `100`→`100%`.
- Decimals below 1: multiplied by 100 — `0.14`→`14%`, `0.5`→`50%`.
- Decimals above 1 keep their fraction — `12.5`→`12.5%` (Run B, single-source).
- Out of range (`101`, `150`, `3456`): value still **renders with `%`**, `aria-invalid=true`, Update
  **disabled**. Upper bound is 100 (`100` accepted — Run B, single-source).
- Empty and non-numeric (`abc`): rejected, `aria-invalid=true`, Update disabled (Run B, single-source).
- **Negative values cannot be entered at all** — the input handler rejects the `Minus` keypress; the
  field value is unchanged by it. Independently verified against a `5` baseline. This is consistent with
  `inputmode="decimal"` and is **by-design, not a defect** — but it deserves a TC asserting refusal.

## DEFECT-1 — out-of-range values are blocked with no user-visible explanation (FILEABLE)

**Claim class: OBSERVATION — multi-trial, clean-method, blur-proven, independently corroborated.**

Typing `101`, `150`, or `3456` into a percentage field leaves it rendering `101%` / `150%` / `3456%`,
sets `aria-invalid=true`, and **disables Update** — while **every** element matching
`[aria-live],[class*=error],[class*=Error],[class*=invalid],[role=alert]` returns an empty string
(22 matching elements checked on the `101` trial). The user is prevented from saving and told nothing.

This is a **behaviour** defect, not a markup/accessibility one: `aria-invalid` is set correctly, so the
semantics are present — what is missing is any visible message. The earlier single-source caveat is
discharged: three out-of-range values, clean method, strong selector set, blur proven committed.

Worth noting for the eventual bug write-up: the field **displays** the out-of-range value with a `%`
suffix as though accepted, which makes the silent disabling harder to attribute.

## DEFECT-2 — inconsistent value format on dialog open (FILEABLE)

**Claim class: OBSERVATION — three runs, three methods, 11+ fresh dialog opens.**

Input index 0 (Non-Peak `0-15`) opens rendering raw **`0.17`**; inputs 1–20 open `%`-formatted
(`17%`, `20%`, `12%`, `15%`, `7%`, `10%`). Run B enumerated all 21 on a fresh open and confirmed exactly
one is raw-decimal. Same underlying value, two render formats in one dialog. Behaviour/rendering defect.

---

# Export surface — measured 2026-08-19 (closes G3, refutes an earlier 405 claim)

## How this was measured

Run `dsm-cmx-toolbar2-0819` first reported that clicking **Export** produced an **HTTP 405**. That
report read its status from a console line emitted by its own `fetch` patch, not from a captured
response, and inferred the HTTP method rather than measuring it. It was **not filed**. A corroboration
run `dsm-cmx-export-0819` was dispatched with a stricter contract: real `playwright-cli click`, capture
through the CLI's own request/response commands, method measured not inferred, two independent clicks.

## The 405 is REFUTED

| Claim under test | Verdict | Measured |
|---|---|---|
| Export request carries `?locationId=…&currencyCode=…&countryCode=…&pricingType=…` | **RE-DERIVED-REFUTE** | URL has **no query string**; the criteria travel in the POST body as `{"countryId":1,"currencyId":1,"businessTierId":3,"locale":"en-US"}` |
| Export returns HTTP 405 | **RE-DERIVED-REFUTE** | **POST … /navigator/api/discount/company-matrix/export → 200**, on both clicks |
| No file is downloaded | **RE-DERIVED-REFUTE** | `DiscountMatrix-US-USD-Standard.xlsx`, 4,142 bytes, downloaded on both clicks |

Both clicks agreed on every field. The earlier `405`s were **HEAD and GET** requests to that endpoint
left in the capture buffer by the earlier run's own JS probing — the endpoint legitimately rejects those
verbs. The button issues a POST, and the POST succeeds. The earlier run's self-described "control"
(a pre-patch click also giving 405) was itself a scripted call, not a real click, so it controlled for
nothing.

**Lesson for this module's tickets: a status read from your own console log is not a captured response,
and a control that uses the same defective mechanism is not a control.**

## Bank rows this settles

| Ticket | Filed symptom | Observed 2026-08-19 | Disposition |
|---|---|---|---|
| NM-3062 | Export returned HTTP 500 | POST → **200**, twice, real clicks, captured responses | **FIXED-CONFIRMED** (two independent clicks, one run, method-clean) |
| NM-3255 | Filename was a raw timestamp (`DiscountMatrixExport_7_27_2026, 9_41_48 AM.xlsx`) | `content-disposition: attachment; filename=DiscountMatrix-US-USD-Standard.xlsx` — matches the documented `DiscountMatrix-{country}-{currency}-{tier}.xlsx` convention | **FIXED-CONFIRMED** |
| NM-3236 | Export ID column shows a Cosmos GUID, not a legacy numeric ID | GUID **still present** — `92a1f836-08f9-5c2f-160b-2aed8c995165`, … | **SYMPTOM-PRESENT, BY-DESIGN — not fileable.** A 2026-07-27 dev comment on NM-2219 states the GUID is expected post-Cosmos-migration, and NM-3236 is closed Done. Recorded as measured behaviour, not a defect. |

## Exported workbook structure (closes G3)

Single sheet `DiscountMatrix`, range `A1:Y12`.

- Row 1 — an instruction string: `Edit only the Discount percent for each booking window. No formatting
  just numbers`. This is a round-trip template, which is what the Import button consumes.
- Row 2 — headers: `ID`, `Country`, `Currency`, `Revenue Tier`, then three group headers
  `Non-Peak Booking Windows by Days`, `Standard Booking Windows by Days`, `Peak Booking Windows by Days`.
- Row 3 — day-bucket sub-headers, 7 per group: `0-15`, `16-30`, `31-60`, `61-90`, `91-180`, `181-365`,
  `365+`.
- Rows 4–12 — the 9 tier rows.

**G3 resolution.** G3 asked whether the payload exposes a DB-internal `NonPeak/Peak/SuperPeak` naming
distinct from the UI's `Non-Peak/Standard/Peak`. It does not: the export uses the **same three UI
names, in the same order**. G3 is closed as far as this surface can close it — the export is not a
window onto DB-internal column naming, so no UI↔DB divergence is observable from here. Anything further
would need the API schema, which is out of scope for a UI walk.

Two rendering differences between grid and export, both benign and worth asserting:
- The export writes percentages as bare integers (`17`), where the grid renders `17%`.
- `Country` exports as the numeric id `1`, not `United States`; `Currency` exports as `USD`.

## Full-payload fidelity check — 189/189

The exported values were diffed **cell by cell** against the 189-cell rendered matrix recorded earlier
in this document, by script rather than by eye:

```
CELLS-COMPARED=189 DIFFS=0
```

Every one of the 9 tiers × 21 columns matches the grid exactly. The export is faithful; there is no
value-mapping defect.

**A transcription error was caught here and must not propagate.** The probe run's own report
mis-transcribed the first data row, printing the Non-Peak block three times so that all three column
groups appeared identical — which, if believed, looked like a serious export defect. Re-parsing the
`.xlsx` directly showed the real row is
`17,17,17,17,20,20,20 | 12,12,12,12,15,15,15 | 7,7,7,7,10,10,10`, matching the grid. The claim died on
re-derivation. **No bug was filed, and none should be.**

**Claim class: OBSERVATION → machine-verified.** The 189-cell diff is the one result in this document
re-derived by the dispatcher directly from the artifact rather than read out of a worker report.

---

# GAV Discount Threshold — input contract, and a tooling trap (2026-08-19)

## The trap: `fill()` corrupts this app's formatted numeric inputs

A dirty-state run filled the threshold with `20%` and the field rendered **`15.2%`** — neither the typed
value nor the `15%` it started from. A dedicated probe isolated the cause by holding the input string
constant and varying only the method:

| Method | Input string | Rendered after blur |
|---|---|---|
| `playwright-cli fill` | `20%` | **`15.2%`** ✗ |
| real keystrokes (`type`) | `20%` | `20%` ✓ |
| real keystrokes (`type`) | `20` | `20%` ✓ |

Same field, same string, different method, different result. **Verdict: the tool, not the field.**
`fill()` sets the value in one synthetic event and the field's own formatter mis-parses it.

**This is the second distinct `fill()` failure mode on this app** — the first being that
`playwright-cli fill` reads a leading `-` as a command-line flag, which is why negative-value trials on
the dialog percentage fields must use `press Minus`. Treat `fill()` as unsafe on any formatted numeric
input in this application; use character-by-character typing.

**Consequence for shipped source**: the page object was authored with `input.fill(value)` in both of its
setter methods, including the one that drives the Edit Tier dialog's 21 percentage inputs — the same
formatted-input class. Both were converted to `pressSequentially` with a delay. Had this probe not run,
every percentage-setting test case would have asserted against a silently corrupted value.

## The field's measured contract

Selector `input[name="gavDiscountThreshold"]` — resolves to exactly 1. `type="text"`,
`inputmode="decimal"`, placeholder `0%`, **no** `pattern`, no `maxlength`, not disabled, not readonly.
Baseline on 1604: `15%`.

All trials below used real keystrokes with a fresh navigation before each:

| Typed | Renders | `aria-invalid` | Message |
|---|---|---|---|
| `20` | `20%` | false | none |
| `20%` | `20%` | false | none |
| `0.2` | `20%` — **multiplied by 100** | false | none |
| `12.5` | `12.5%` | false | none |
| `101` | `101%` | **true** | **none** |
| `0` | `0%` | false | none |
| *(empty)* | `0%` | false | none |
| `abc` | reverts to `15%` — silently refused | false | none |

This mirrors the Edit Tier dialog's percentage contract exactly: decimals below 1 are ×100, values above
100 set `aria-invalid` with **no visible message**, and non-numeric input is silently refused. The
no-visible-message behaviour on `101` is the same defect already recorded as DEFECT-1, now confirmed to
extend to the header field as well — same behaviour, second location.

## There is no in-app unsaved-changes prompt on this surface

NM-3256 describes an Unsaved Changes prompt appearing when Export is clicked while dirty. Two exit paths
were tested with the header field dirty:

| Exit path | In-app prompt? | Outcome |
|---|---|---|
| Click **Export** | **No** | Export ran normally: POST → 200, file downloaded, every field identical to the clean control run |
| Switch to the **Region Weekly Peaks** tab | **No** | Tab switched immediately. No dialog, no overlay. The edit was silently discarded. |
| Full page unload | — | The **browser's** native beforeunload guard fired and blocked evaluation until accepted |

So the app **does** track dirty state — enough to arm the browser guard — but shows the user **nothing**
when they leave via an in-app path. On a tab switch the unsaved threshold edit disappears without a word.

**Disposition: OBSERVATION, single-run, NOT filed.** Two reasons to hold. First, it is unreplicated.
Second, and more important, NM-3256's own repro asserts the prompt exists, so either it was removed
deliberately (an intentional UX change, not a defect) or the grid-dirty path — editing a tier and
clicking Update — arms a prompt that the header-dirty path does not. **The grid-dirty path is untested
and cannot be tested without a decision to mutate**, because it is not yet known whether Update writes
to the server or only to local grid state. That unknown is the blocker, and naming it is the unlock.

**NM-3256 disposition: NOT-REPRODUCIBLE on the header-dirty path; UNTESTED on the grid-dirty path.**
Not "fixed" — the defect's own precondition (the prompt) never appeared, so there was nothing to
reproduce.

---

# Automation-run corrections — measured 2026-08-19 (post-authoring)

Everything below was measured by **executing the authored spec against the live office**, not by a
manual walk. Several entries **overturn earlier statements in this document**. Where they do, the
automation reading wins: it was reproduced, instrumented, and in two cases carried a passing control.

## 1. The grid paints skeleton rows — a row count is not a readiness gate

Read from inside the test runner immediately after navigation:

| State | Rows | Cells per row | Cell text |
|---|---|---|---|
| Loading | 6 | 24 | all `""` |
| Settled | 9 | 23 | real values |

Each loading cell holds `<div data-slot="skeleton" class="bg-accent animate-pulse …">`. A gate polling
for a non-zero row count completed in **12 ms** and never waited at all.

The correct gate is *rows present **and** zero `[data-slot="skeleton"]` in the panel*, evaluated as one
predicate. Two sequential waits have a hole: before first paint there are neither rows nor skeletons, so
a skeletons-gone check passes vacuously.

This also produced two **vacuous passes** — tests looping over an empty label array reported green
without asserting anything. Any loop over a discovered collection must assert the collection is
non-empty first.

## 2. Body row layout — the tier label is not the first cell

23 cells per data row, confirmed on rows 1 and 2:

| Index | Contents |
|---|---|
| `0` | Empty text; holds **both** row buttons (Delete and Edit) |
| `1` | Tier-range label, e.g. `0 - 1500` |
| `2`–`22` | The 21 percentage values, left to right across all three groups |

Header row 2 mirrors it: index 0 empty, index 1 `Revenue Tier`, indices 2–22 the seven day buckets
repeated per group. Header row 1 holds 4 cells: empty, then the three group headers.

**The rendered group headers are full phrases** — `Non-Peak Booking Windows Days`, not `Non-Peak`. The
export writes `Non-Peak Booking Windows by Days` (with "by"). The grid renders the bucket `365 +` with a
space; the export writes `365+` without. Compare these with whitespace normalised, never exactly.

## 3. The empty state renders a placeholder row, and lives on Currency

Switching **Currency to `CAD`** empties the grid directly (9 rows → 0 data rows). Business Tier does not
produce it on this office.

The empty state still renders a `tr`, but that row has **no cell at index 1**. A reader addressing
`td` index 1 blocks for its full timeout and then throws. Row readers must skip rows with fewer cells
rather than assume every matched row is a data row.

### Empty-surface disposition (LR-040(c))

An empty surface may not be recorded as "empty, refresh later". The three required cells:

**c.1 — Population path.** The Company Matrix is **keyed** by Country × Currency × Business Tier; the
grid shows the tier rows defined for the currently selected key. A `CAD` grid populates when tiers are
defined against that key — the in-UI path is **Add Tier** while Currency is set to `CAD`, which is the
same affordance that populates any other key. This is not an admin-only or super-admin path, and it needs
no data seeding outside the UI.

**c.2 — Classification: `by-design`.** Not `data-blocked` and not `feature-blocked`. The feature works —
the same grid renders 9 rows under `USD` on the same office in the same session, and the re-key POST
returns 200 for `CAD` exactly as it does for `USD`. The surface is legitimately empty until a user defines
tiers for that key, which is the `by-design` case in LR-040(c).

**c.3 — What was not checked, stated rather than implied.** Whether some *other* office already has `CAD`
tiers configured was **not** verified — only offices 1604 and 1101 were visited, and the cross-office check
run against them covered the default `USD` key. So "no office has CAD tiers" is **not** claimed here. If a
future session needs a populated non-`USD` grid rather than a created one, that hunt is the first step and
is cheap.

No escalation to `/encore-questions` is raised: c.1 and c.2 are both answered from evidence, so the
escalate-if-unknown branch does not fire.

## 4. Re-keying posts to the page's own route — there is no `/api/` call

Instrumented across all three criteria-bar dropdowns:

```
POST https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/discount-matrix  → 200
```

Country produced 5 such POSTs, Business Tier 3. **No request to any `/api/…` path occurred.** This is an
Angular BFF pattern — the client posts back to its own page URL. The Export button's
`/navigator/api/discount/company-matrix/export` is the exception, not the rule; do not generalise from it.

**Effect of each control on the grid:**

| Control | Change | Rows | Data |
|---|---|---|---|
| Country | `United States` → `Mexico` | 9 → 2 | Different ranges and values |
| Currency | `USD` → `CAD` | 9 → 0 | Empty state |
| Business Tier | `Standard` → `Las Vegas` | 9 → 9 | **Byte-identical** |

Business Tier re-queried (3 POSTs) and the server returned the same rows. **A data diff is therefore not
a sound staleness oracle** — two different keys can legitimately return identical data. The POST is the
oracle.

## 5. Header Save does persist the threshold — and disables optimistically

Verdict `PERSISTS`, measured end to end: typed `20` → Save → fresh navigation → read `20%`; restored
`15` → confirmed `15%`.

- Save is **disabled on page load** and becomes **enabled on the first keystroke** into the threshold
  field, before blur. Confirmed across six conditions.
- The Save click issues `POST /navigator/locations/1604/settings/discount-matrix`.
- Save flips to disabled **immediately on click**, before the server answers — an optimistic UI reset.
  **The button going disabled is not proof of a completed save.** Only the POST response is. Navigating
  before that response arrives cancels the write, which is exactly how this looked like a persistence
  defect for three runs.

The earlier claim in this document that Save "persists the GAV Discount Threshold" was an inference from
the button's position and had never been tested — the threshold probe was explicitly forbidden from
clicking it. It is now measured, and it is correct.

## 6. Dialog and threshold input contracts — two corrections

**Empty and non-numeric input are NOT rejected in the Edit Tier dialog.** Measured with a passing
control:

| Trial | Before | After blur | `aria-invalid` | Update |
|---|---|---|---|---|
| cleared | `17%` | **`0%`** | `false` | **enabled** |
| `abc` | `17%` | **`0%`** | `false` | **enabled** |
| `14` (control) | `17%` | `14%` | `false` | enabled |

This **refutes** the earlier single-source Run B claim of "rejected, `aria-invalid=true`, Update
disabled". The field substitutes zero rather than rejecting, and Save remains available — so a mistyped
entry can commit a 0% discount with no warning.

**The threshold field's `abc` behaviour depends on the path**, and both earlier readings were correct:

- select-all then type (no delete) → value **unchanged**; refused keystrokes cannot replace a selection.
- select-all, delete, then type → field is genuinely empty, and empty commits as **`0%`**.

Any helper that clears before typing can never observe the refusal. The two fields are inconsistent: the
dialog resolves both paths to `0%`, the threshold only the second.

## 7. An unsaved threshold survives a tab switch

Switching to Region Weekly Peaks and back leaves the typed value **in place**; only a reload discards it.
The criteria bar sits outside every tab panel, so a tab switch never unmounts it. The earlier reading
that the value was "gone" was taken after a fresh navigation and conflated the two paths.

## 8. Open contradiction — Country option count is timing-sensitive

One probe enumerated **only one** Country option (`United States`) on office 1604; another switched
Country to `Mexico` on the same office minutes earlier, and the test asserting that passed.

Most likely the options populate asynchronously and an early read returns only the current value. This
matters for coverage: three tests **skip themselves** when a dropdown offers one option, so a slow load
would silently drop them while the suite still reports green. **Unresolved — carried forward.**

---

## 9. Save-completion race — root cause from trace evidence (2026-08-19, post-GREEN2)

`TC-DSM-CMX-005` passed on the first full-suite run and failed on the second with
`Expected: 20 / Received: 15` — the threshold did not persist. Root-caused from the failing run's
Playwright trace (`trace.network` + `trace.trace`), not from re-running.

### Evidence

**The page route carries far more than saves.** The trace captured **48** POSTs to
`…/navigator/locations/1604/settings/discount-matrix` across ~38 s. The application posts to its own page
route rather than to a distinct API path, so URL alone cannot identify a save.

That 38-second window spans page load, grid hydration and the test's own activity — it is **not** an idle
rate. A later dedicated probe measured a genuinely idle page at **1 POST per 15 s**. The traffic is dense
exactly when a test is working, which is when it matters.

**Action timeline, offsets relative to the first traced action:**

| Offset | Action | Duration |
|---|---|---|
| 6077.4 ms | response waiter armed (`waitForEventInfo`) | resolved in **55 ms** |
| 6077.6 ms | `click` on Save | 59 ms |
| 6140.5 ms | Angular-stable evaluate | 3 ms |
| 6147.8 ms | `goto about:blank` | 19 ms |
| 6156.2 ms | `Dialog.accept` — **`type: "beforeunload"`** | — |

**Three facts follow directly:**

1. The save waiter resolved in **55 ms**. At one heartbeat POST every ~0.8 s, it resolved on unrelated
   traffic, not on the save response. The waiter is not a save-completion oracle.
2. Navigation to `about:blank` began **70 ms after the Save click**.
3. A **`beforeunload`** dialog fired at that navigation. The browser only raises `beforeunload` when a
   page registers an active unload guard, so the application still considered the form **dirty** — the
   save had not committed. Accepting the dialog let the navigation proceed and cancelled the in-flight
   write.

Exactly one `beforeunload` event appears in the whole trace, at the post-save navigation — the earlier
navigations in the same test raised none.

### Why it passed once and failed once

The write and the teardown are in a ~70 ms race. The first run's save committed inside that window; the
second run's did not. Nothing about the application changed between runs.

### Consequence for the harness

`clickSave()`'s `waitForResponse` matched on URL alone, so any data request to the same route could
satisfy it — and one did. Any test that saves and then navigates inherits this race.

`TC-DSM-CMX-005`'s **restore** block was already verified and self-healing (reload-and-read, two
attempts) and did its job — the live value read `15%` with 9 rows after the failing run, so no live data
was left modified. The **primary** save path had no equivalent guarantee.

---

## 10. What distinguishes a save from ordinary page traffic (measured 2026-08-20)

Probe `dsm-cmx-discrim-0819`: a non-mutating idle baseline, then one instrumented Save, then a verified
restore. Final live value `15%` — the office was left as found.

### The discriminator is the request body

| Request | Body |
|---|---|
| ordinary data request | `[]` — exactly two characters |
| **the Save** | `[{"countryId":1,"currencyId":1,"gavThreshold":0.2}]` |

Both use the same URL, the same method, and the same header **names**. The save is simply the POST that
carries a payload. A matcher requiring a non-empty body that is not `[]` selects the save and rejects the
data requests.

The `next-action` request header also differs (`7f2095…` for the data request, `7f3552…` for the save),
but it is a build-generated token with no cross-build stability, so it must **not** be used as a matcher.

Timing: the save request is issued about **58 ms** after the click.

### The form reports clean about 1.5 s after the click

Polling a cancelable unload-warning event every 500 ms after the Save click:

| Offset from click | still blocking unload? |
|---|---|
| 517 ms | yes |
| 1034 ms | yes |
| **1551 ms** | **no — first clean reading** |
| 2067 ms → 10318 ms | no, for every remaining sample |

So the form *does* clear its unsaved-changes state once the save lands — it just takes roughly **1.5
seconds**, and the failing run navigated away at **70 ms**. This refines the previously recorded Encore
trap: on this surface the dirty flag is not permanently stuck after a save, it is simply slow to clear,
and code that navigates inside that window loses the write.

That gives a second, independent completion oracle: wait until the page stops blocking unload. The probe
dispatched the synthetic event 20 times against the live page with **no dialogs and no side effects**.

### Applied

Both gates were added to `clickSave()` — match the save by its payload body, then wait for the form to
report clean before returning.

---

## 11. The validation-message sweep was page-wide (measured 2026-08-20)

A second intermittent surfaced once the save race was fixed: `TC-DSM-CMX-039` failed on one full-suite
run having passed the two before it. The assertion was "no validation message must be visible when the
field resolved to zero", and the sweep had returned exactly one string:

> `"Discount Matrix"`

That is the page's own title, not a validation message. Recovered from the run's trace, not re-run.

### The element was not identified

The failure snapshot is captured after the page has already moved on — the threshold field is not even
present in it — so it held no evidence. A dedicated probe then reloaded the page five times and sampled
the same selector every 100 ms for 8 s each time: **405 samples, nothing caught.** The element is
transient and page-level, and it remains unidentified. That is recorded as an open unknown rather than
guessed at.

### Why the sweep was wrong regardless

The sweep applied its candidate selector to the **whole document**. A validation message about the
threshold field belongs beside that field, so any page-level element that happens to match — an
announcement region, a toast, a heading with a matching utility class — is a false positive waiting to
happen. This is the second false positive from this one selector: it previously matched styling utility
classes on interactive controls and returned `["United States","USD","Save","Export", …]`.

### The container, measured

Walking up from `input[name="gavDiscountThreshold"]`:

| # | class | inputs | buttons | comboboxes | contains grid? |
|---|---|---|---|---|---|
| 1 | `flex items-center gap-2` | 1 | 0 | 0 | no |
| 2 | `flex flex-wrap items-center gap-x-3 gap-y-2` | 1 | 3 | 3 | no |
| 3 | `flex w-full justify-between items-center gap-2 px-4 py-2 border-b bg-muted/30` | 1 | 4 | 3 | **no** |
| 4 | `flex h-full min-h-0 w-full flex-col …` | 2 | 28 | 3 | **yes** |
| 5 | `flex h-full flex-col min-h-0 flex-1 overflow-hidden` | 2 | 28 | 3 | yes |
| 6 | `flex h-full flex-col` | 2 | 30 | 3 | yes |

Ancestor 3 is the criteria bar — every header control, no grid. Ancestor 4 is the first that swallows the
grid.

Scoping to ancestor **1** would also exclude the grid while making the assertion incapable of ever
failing, so the scope is expressed as a rule rather than a depth: *the last ancestor of the threshold
input that does not contain an `Add Tier` button*. The class strings above are styling utilities and are
deliberately **not** used as selectors.

A guard rejects a scope that lacks the threshold input or holds fewer than three comboboxes, so a scope
that silently collapses to the bare field fails loudly instead of returning an empty array forever.

The seven assertions on this sweep now print what they found, so a recurrence identifies itself instead
of reporting only a length mismatch.

---

## 12. A seven-hour "the module is dead" scare that was a degraded session (2026-08-20)

**Nothing is wrong with this surface.** Re-verified 2026-08-20 16:54–17:01 after refreshing the session:
office 1604 renders **9 real tier rows, 0 skeletons, threshold `15%`**; office 1101 the same. Controls in
the same run: service-charge 79 rows on 1604, 80 on 1101. A screenshot of the working 1604 grid is at
`.tmp/delegation-out/dsm-cmx-wA-0820/url1.png`.

This section exists because an earlier chain of measurements concluded the opposite, a critical bug was
filed on it, and the bug was wrong. The failure is worth more than the finding was.

### What actually happened

The stored `clients/encore/.auth/encore-state.json` had **partially** decayed. A partially-valid session
on this app does not fail loudly:

| Symptom | What it looks like | What it is |
|---|---|---|
| Shell, criteria bar, tab strip, all 23 column headers render | a working page | static/RSC content that needs no live data |
| Grid holds 6 placeholder rows forever, threshold reads empty | a broken module | the data server action silently not returning |
| POSTs return **HTTP 200** | a healthy backend | Next.js server actions return 200 even when they redirect |
| Some modules still serve data | proof it is not auth | modules lose their data path at different decay points |

That last row is the trap. `service-charge` served 79 rows in the *same* session where
`discount-matrix` served none, and that single fact was used to rule auth out. It does not rule auth out.

Running `npx playwright test --project=setup` — the project's own non-interactive refresh — restored
everything at once.

### Why it took four runs to not find out

Every probe controlled for the wrong variables. Launch args, viewport, locale, timezone, an
`about:blank` pre-navigation, office identity, module identity, elapsed time — all varied and eliminated.
**Session freshness was never varied**, because one worker reported that `auth.setup.ts` had already
performed a fresh SSO login and the test failed anyway. That claim was never re-derived. It was the only
load-bearing fact in the whole chain, and it was false.

A second worker in the same council then reported `git status --porcelain clients/encore scripts` as
empty. The real output is 17 lines. Same run also read a sandbox `Permission denied` error as proof the
app session had expired. Both were caught only because the claims were re-run rather than re-read.

### The rule this earns

**A "module is broken" claim requires a session-freshness control before it is filed.** Concretely, before
attributing any missing-data symptom to the application:

1. Run `npx playwright test --project=setup` and confirm it exits 0.
2. Re-measure on the state file that run wrote, checking its mtime is newer than the failing measurement.
3. Only if the symptom survives step 2 is it a defect.

A sibling module still serving data does **not** substitute for step 1. Neither does an HTTP 200, nor an
absent console error, nor a `"error": null` in an RSC payload — all four were present here while the
session was the entire problem.

### Still true from the earlier runs

Two measurements from that chain stand on their own and are worth keeping:

- Live POST response bodies are unreadable — `resp.text()`, `resp.body()` and
  `request().response().text()` all throw `Protocol error (Network.getResponseBody): No data found for
  resource with given identifier`, because these are RSC streams that CDP does not retain. **Read the
  trace, not the live response.**
- A signed-out session on this app surfaces as `Application error: a client-side exception has occurred`
  plus a console `Error: NEXT_REDIRECT`, landing on `/navigator/auth/sign-in?callbackUrl=…` on the app's
  own host — not on a Microsoft host. Useful signature to recognise on sight.

---
## 13. LR-062 machine denominator — 21, with one named gap (2026-08-20)

Produced by `node scripts/walk-coverage/enumerate-page.mjs --office=1604 --module=discount-matrix`, run
on a session refreshed in the same run (`--project=setup`, exit 0, auth mtime 2026-08-20 17:07:38).
Provenance JSON: `reports/walk-coverage/1604-discount-matrix.json`.

Re-derived by the dispatcher directly from that JSON rather than read out of the worker's report.

```
denominator                : 21
rawBeforeArchetypeCollapse : 21
element entries            : 21
branches                   : dialog:add-tier  addedKeys=3  ok=true
                             dialog:edit-tier addedKeys=3  ok=true
```

Grid health confirmed inside the same run: `struct:button|Delete|…tbody/tr/td` and
`struct:button|Edit|…tbody/tr/td` each carry `occurrences=9`, matching the 9 live tier rows. No
placeholder rows were present, so this denominator was measured against real content.

`cross-check.mjs --self-test` → 18 passed, 0 failed, 18 total.

### The gap, stated precisely

Only **two** of the 21 entries are input-bearing:

| key | occurrences | note |
|---|---|---|
| `name:gavDiscountThreshold\|input` | 1 | the criteria-bar threshold |
| `role:input:` | **absent** | shared by `dialog:add-tier` and `dialog:edit-tier` |

The Edit Tier dialog's **21 percentage inputs do not appear individually, and `role:input:` carries no
`occurrences` field at all** — so they contribute 1 to the denominator, not 21. The enumerator opens the
first row's dialog, scans its portal, and collapses every input it finds into one `role:`-keyed entry
that has no ancestor path, which is also why its type cannot be probed.

Both input entries come back `type: null, resolved: false`. For `role:input:` that is structural — a
`role:`-keyed entry carries no CSS path to probe. For `name:gavDiscountThreshold|input` the probe ran
after the dialog had closed and the selector was unavailable.

### Disposition

**21 is the honest machine denominator for the resting surface plus dialog *presence*.** It is not a
count of dialog *fields*, and this artifact does not claim it is.

The missing per-field enumeration of the Edit Tier dialog is filed as **D14** in
`plans/pending/PLAN_DISCOUNT_MATRIX_DEEP_COVERAGE.md`. It is a limitation of
`enumerate-page.mjs`'s portal scan, not of this surface and not of this subplan's coverage: the 21
percentage inputs are themselves covered behaviourally by `TC-DSM-CMX-022` and the Edit Tier cases, which
read all 21 values directly from the dialog.

Whether PLAN_70's cause 3 (`type=null` + `inputmode=decimal` with no classifier rule) applies to these
inputs **remains unanswerable from this run**, because the entry never reaches the classifier — it fails
earlier, at selector derivation. That is a sharper statement of the open question than PLAN_70 currently
carries, and D14 records it.

---
## Observations

Mandatory per ALL-045. Both buckets are populated; neither is `none`. Behaviour defects only — DOM and
markup accessibility findings are **not** filed here as bugs, per the standing owner rule.

### Bugs / Defects

| # | Surface | What is wrong | Status |
|---|---|---|---|
| 1 | Edit Tier dialog, percentage fields | An out-of-range percentage silently disables **Update** with no message, while still rendering the value as though it were accepted. The user is given no reason the dialog will not commit. | **BUG-DSM-CMX-001** filed |
| 2 | Edit Tier dialog, first percentage field | The first percentage field opens as a raw decimal while the other twenty open percent-formatted. | **BUG-DSM-CMX-002** filed |
| 3 | Header Save → immediate navigation | Clicking **Save** and navigating away within ~1.5 s **silently loses the write**. Measured: the save request is issued ~58 ms after the click, but the form still reports unsaved changes until ~**1551 ms**; a navigation inside that window raises the unsaved-changes prompt and, once dismissed, cancels the in-flight write. The value reverts with no error. 1.5 s is well inside human click-through speed — a user who saves and immediately switches tab can lose the change and be told only that they had "unsaved changes". | **BUG-CANDIDATE** — measured 2026-08-20; **not filed**, see triage note |

Finding 3 came out of automation, not the original walk: it is the same defect that made `TC-DSM-CMX-005`
pass one suite run and fail the next. The harness now waits for the form to report clean, so the test is
stable — **but the underlying application behaviour is unchanged and is what a real user would hit.**
Fixing the test did not fix the product.

**Triage note for finding 3 — why it is not filed as a bug.** A bug filing requires a
`baselineComparison` against the old site, and **no baseline exists for this module**: the baseline walk
(`dsm-cmx-baseline2-0819`) was stopped at a Microsoft account picker on an 8-day-old `nav2` session, and
no credential was typed. So this module is `baselineScope: baseline-absent`, and the standing triage rule
routes a baseline-absent finding to `/encore-questions` rather than to a regression filing.

**The unlock needs no human, and calling it human-blocked was the error.**
`clients/encore/CLAUDE.md` § *"When encore needs fresh login session"* states that the repository's own
unattended session mechanism covers **both** the e2e and the nav2 environments, that the automation
account has no second factor, and — verbatim — that *"asking a human to log in manually is a defect"*.
The two 2026-08-19 attempts stopped at an account picker and reported a blocker without consulting that
section; that conclusion is withdrawn.

The real unlock is to reach nav2 through that documented mechanism and capture the session, after which
finding 3 can be compared against the old site and either filed as a regression or documented as
by-design. Until that comparison exists it stays a measured candidate with its evidence attached — not
quietly dropped, and not filed on a guess. Tracked as **D13** in
`plans/pending/PLAN_DISCOUNT_MATRIX_DEEP_COVERAGE.md`.

### Suggestions / Improvements

| # | Surface | Observation | Disposition |
|---|---|---|---|
| 1 | GAV Discount Threshold | Clearing the field commits as **`0%`** with `aria-invalid` absent and Save enabled — a user who empties the field and saves silently sets the threshold to zero, with no confirmation. Whether empty *should* be rejected is not stated in NM-2219. | **Discussion item** → `/encore-questions`. Not filed as a bug: no requirement establishes empty as invalid, and inventing that threshold would be a guess. |
| 2 | GAV Discount Threshold | A leading minus is refused at the input layer: typing `-5` leaves `5`, rendered `5%`. The refusal is silent — no message, no invalid state. Consistent with the Edit Tier dialog's documented `-1` behaviour, so it reads as deliberate input masking rather than a defect. | **Discussion item** — recorded, not filed. |
| 3 | Criteria bar and grid toolbar | Several controls carry no `data-testid` and are addressed by role plus visible text. This is a locator-stability risk, not a behaviour defect. | Tracked as a testid gap per the standing report policy — **not** filed as a bug. |

### Not filed, and why

- **NM-3233** is a layout observation and is recorded as such, not filed as a behaviour case.
- No DOM or markup accessibility finding is filed anywhere in this artifact — standing owner rule.

### Interrogation note

This tab carries twelve filed defects, so "nothing found" would have been a signal to look harder rather
than a clean bill. Three defects and three discussion items were recorded; two of the three defects
pre-date this session and one was discovered by automation.
