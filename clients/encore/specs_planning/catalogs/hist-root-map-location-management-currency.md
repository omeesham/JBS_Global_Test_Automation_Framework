# Hist Root Map — Location Management History / Currency Tab

**Session**: 2026-04-22
**Agent**: HUNTER (rutvik), Opus 4.7
**Browser tool**: Claude in Chrome (LR-038 default — exploratory catalog, auth-heavy, token-efficient). Mid-session switch to Playwright MCP during transient Azure B2C outage 2026-04-22 09:42–09:51 UTC (3 correlation IDs captured); switched back to Claude in Chrome after tenant recovery.
**Office**: 1604 (Parker Palm Springs), `cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location`
**Scope**: Currency sub-tab parents → 87-col Location Management History
**Reference**: [SUBPLAN_HISTORY_01_MCP_FINDINGS.md §1](../../../../plans/pending/SUBPLAN_HISTORY_01_MCP_FINDINGS.md) for 87-col header list; [SUBPLAN_HIST_PIVOT_08_B_LM_1_CURRENCY_CATALOG.md](../../../../plans/pending/SUBPLAN_HIST_PIVOT_08_B_LM_1_CURRENCY_CATALOG.md) for method; [hist-root-map-local-office-basic-info.md](./hist-root-map-local-office-basic-info.md) for format precedent.

---

## Summary

- **9/9 Currency parents cataloged** via 9 save-cycles + 3 negative cases.
- **1/9 parents TRACKED**: the combined "Selected" state of USD/CAD/MXN maps to col 5 "Currency" as a fixed-code-order comma-separated code list.
- **8/9 parents NOT-TRACKED**:
  - 3 IsDefault checkboxes (USD/CAD/MXN) — silently dropped; candidates CUR-BUG-A.
  - 3 Merchant comboboxes (USD/CAD/MXN) — silently dropped; candidates CUR-BUG-B.
  - USD Merchant **directly proven** via phantom-row save-cycle (save 8); CAD Merchant and MXN Merchant classified by inference + DOM inventory (no alternate option data on office 1604).
- **Col 5 "Currency" serialization rule** (new, MCP-observed this session): comma-space-joined code list in **fixed code order USD, CAD, MXN** (not insertion order, not alphabetical). All 7 valid Selected-subsets MCP-verified (see §State-space matrix below).
- **Col 63 "Currency" (duplicate header) cross-contamination guard**: confirmed **zero cross-contamination** across all 9 Currency-tab saves. Col 63 stayed `""` (empty) throughout. Col 63 is Pricing-owned; future Pricing tab catalog (SP-B-LM-2) will exercise col 63.
- **Baseline restored**: all 9 Currency parents match pre-session state. Office 1604 Currency tab safe to hand off.

---

## Parent → Column Map

| # | Parent field | Parent testid | Control type | State space | Target col (0-idx, header) | Status | Encoding | Evidence (change save → row timestamp) |
|---|---|---|---|---|---|---|---|---|
| P1 | Currency Selected (combined USD/CAD/MXN) | `location-settings-checkbox-currency-{USD,CAD,MXN}-selected` | 3× checkboxes, multi-select (must have ≥1 selected to Save) | {USD},{CAD},{MXN},{USD,CAD},{USD,MXN},{CAD,MXN},{USD,CAD,MXN} — 7 valid non-empty subsets | col 5 "Currency" | **TRACKED** | plain text, fixed code order, comma+space separated (e.g. `"USD, CAD"`, `"USD, CAD, MXN"`) | Saves 1–7, 9 (see §State-space matrix) |
| P2 | USD IsDefault | `location-settings-checkbox-currency-USD-default` | checkbox (radio-exclusive across the 3 IsDefault checkboxes — setting one auto-unsets the other two) | {true, false} | **NO TARGET COL** | **NOT-TRACKED** | n/a | Save 4 (2026-04-22 10:50:39 AM): USD Default TRUE→FALSE as part of 3-field save; full-row diff shows only col 5 change + Modified On. Save 9 (10:59:43 AM): FALSE→TRUE as part of restore, full-row diff shows only col 5 + Modified On + unrelated drift. CUR-BUG-A candidate. |
| P3 | CAD IsDefault | `location-settings-checkbox-currency-CAD-default` | checkbox (enabled iff CAD Selected=TRUE; radio-exclusive with USD/MXN defaults) | {true, false} | **NO TARGET COL** | **NOT-TRACKED** | n/a | Save 4 (10:50:39 AM): CAD Default FALSE→TRUE, no col reflects. Save 6 (10:52:25 AM): CAD Default TRUE→FALSE cascading from CAD Sel deselect, no col reflects. CUR-BUG-A candidate. |
| P4 | MXN IsDefault | `location-settings-checkbox-currency-MXN-default` | checkbox (enabled iff MXN Selected=TRUE; radio-exclusive) | {true, false} | **NO TARGET COL** | **NOT-TRACKED** | n/a | Save 6 (10:52:25 AM): MXN Default FALSE→TRUE, no col reflects. Save 7 (10:54:12 AM): MXN Default TRUE→FALSE cascading, no col reflects. CUR-BUG-A candidate. |
| P5 | USD Merchant | `location-settings-select-currency-USD-merchant` | combobox, 2 options available on office 1604 (`316370 - PSAV US/USD`, `316426 - Encore Bahamas/USD`). Combobox remains editable even when USD Selected=FALSE. | any merchant ID paired to USD | **NO TARGET COL** | **NOT-TRACKED** | n/a | Save 8 (10:55:49 AM): isolated USD Merchant change `316370 → 316426`, no other field dirty. Full 87-col diff vs prior row shows **ONLY Modified On** changed. Full-row substring scan for `316370/316426/316446/PSAV/Bahamas/Merchant` → **zero hits outside Modified By column** (`v-rutvik.khosariya@psav.com` is unrelated). Textbook phantom-row evidence. CUR-BUG-B candidate. |
| P6 | CAD Merchant | `location-settings-select-currency-CAD-merchant` | combobox, **1 option on office 1604** (`316446 - PSAV Canada/CAD`) | single value; change cannot be driven on this office | **NO TARGET COL** | **NOT-TRACKED (by pattern inference)** | n/a | No alternate option available → direct save-cycle not possible on office 1604. Classified NOT-TRACKED by (a) same combobox testid pattern as USD Merchant (P5, directly proven), (b) no col 64/65/66+ reflects merchant values across saves 1–9, (c) prior 2026-04-17 MCP finding. CUR-BUG-B candidate. Retry on an office with multiple CAD merchants if required. |
| P7 | MXN Merchant | `location-settings-select-currency-MXN-merchant` | combobox, **0 options on office 1604** (empty listbox when opened regardless of MXN Selected state) | no valid values available | **NO TARGET COL** | **NOT-TRACKED (by inference + DOM-untestable)** | n/a | 0 options available → cannot drive a save-cycle on office 1604. Same reasoning as P6 (CAD Merchant). Additional DOM observation: MXN Merchant baseline is `""` (empty); combobox opens but shows empty `role="option"` list. CUR-BUG-B candidate + also a data-completeness observation (MXN merchant table not populated for this tenant/office). |
| P8 | USD Selected | `location-settings-checkbox-currency-USD-selected` | checkbox, component of the combined-Selected parent P1. Deselecting USD is only permitted when USD is not the current default. | {true, false} | col 5 "Currency" (via P1 set membership) | **TRACKED via P1** | plain text | Saves 1–9 all exercise toggles of individual Selected checkboxes; col 5 reflects the resulting set. Individual-parent decomposition is a presentation detail — the app persists the Selected SET, not per-currency booleans. |
| P9 | CAD Selected | `location-settings-checkbox-currency-CAD-selected` | checkbox, component of P1 | {true, false} | col 5 "Currency" (via P1) | **TRACKED via P1** | plain text | Same as P8. |
| P10 | MXN Selected | `location-settings-checkbox-currency-MXN-selected` | checkbox, component of P1 | {true, false} | col 5 "Currency" (via P1) | **TRACKED via P1** | plain text | Same as P8. |

> **Parent count normalization vs subplan**: the subplan §Scope lists "9 total" parents (3× Selected + 3× IsDefault + 3× Merchant). This catalog decomposes "Selected" into the combined state P1 (for column-mapping purposes, since the app tracks the SET not per-currency bits) and P8/P9/P10 (for parent-level traceability). Net unique parents still equals 9; the P1 entry is the authoritative one for test-writing (SP-D1).

---

## State-space coverage matrix (col 5 "Currency")

All 7 valid non-empty subsets of `{USD, CAD, MXN}` MCP-verified in a single session. The **0-subset** (all deselected) is structurally prevented by the app (Save button stays disabled); see §Negative case 3.

| Combo # | Selected set | Default set via | Save # | Save timestamp | Resulting col 5 value |
|---|---|---|---|---|---|
| C1 | {USD} | USD-default | baseline + Save 9 (restore) | 10:59:43 AM | `"USD"` |
| C2 | {CAD} | CAD-default | Save 7 | 10:54:12 AM | `"CAD"` |
| C3 | {MXN} | MXN-default | Save 6 | 10:52:25 AM | `"MXN"` |
| C4 | {USD, CAD} | USD-default | Save 1 | 10:45:28 AM | `"USD, CAD"` |
| C5 | {USD, MXN} | USD-default | Save 3 | 10:49:25 AM | `"USD, MXN"` |
| C6 | {CAD, MXN} | CAD-default | Save 5 | 10:51:40 AM | `"CAD, MXN"` |
| C7 | {USD, CAD, MXN} | USD-default (Save 2), CAD-default (Save 4) | Saves 2 + 4 | 10:48:53 AM / 10:50:39 AM | `"USD, CAD, MXN"` |

**Derived serialization rule** (MCP-observed, must be codified into any SP-D1 assertions):
- Separator: `", "` (comma + single space).
- Order: **fixed code order `USD, CAD, MXN`** for the 3 codes this office supports — not alphabetical (`CAD, MXN, USD` would be alphabetical), not insertion order (C4 is always `"USD, CAD"` regardless of whether USD or CAD was selected first in the session).
- Empty / zero-subset: unreachable (validation-blocked — see §Negative cases).
- Col 5 value **ignores** the IsDefault choice (C7 via Save 2 with USD-default and via Save 4 with CAD-default both produced `"USD, CAD, MXN"`).

---

## NOT-TRACKED registry (feeds SP-E-LM-CUR)

### Confirmed via direct save-cycle evidence (this session)

| Parent field | Control type | MCP evidence | Bug candidate ID |
|---|---|---|---|
| USD IsDefault | checkbox | Save 4 (10:50:39 AM): USD Default TRUE→FALSE during 3-field save; history diff = col 5 + Modified On only. Save 9 (10:59:43 AM): FALSE→TRUE during baseline restore; history diff = col 5 + Modified On + unrelated multi-user drift on cols 33/37, no IsDefault-specific col. | **CUR-BUG-A (a)** |
| CAD IsDefault | checkbox | Save 4 (10:50:39 AM): CAD Default FALSE→TRUE as part of 3-field save; history diff = col 5 + Modified On only. Save 6 (10:52:25 AM): CAD Default TRUE→FALSE via cascade from CAD Sel deselect; history diff = col 5 + Modified On only. | **CUR-BUG-A (b)** |
| MXN IsDefault | checkbox | Save 6 (10:52:25 AM): MXN Default FALSE→TRUE as part of 2-field save; history diff = col 5 + Modified On only. Save 7 (10:54:12 AM): MXN Default TRUE→FALSE via cascade; history diff = col 5 + Modified On only. | **CUR-BUG-A (c)** |
| USD Merchant | combobox | Save 8 (10:55:49 AM): **isolated** Merchant change `316370 → 316426` (no Selected change, no IsDefault change, no other dirty field). Full 87-col diff vs prior row = ONLY Modified On. Full-row substring scan for merchant IDs / vendor names / "Merchant" keyword = zero hits outside Modified By. | **CUR-BUG-B (a)** |

### Classified by inference + DOM (no alternate-option data this session)

| Parent field | Control type | Why inference rather than save-cycle | Bug candidate ID |
|---|---|---|---|
| CAD Merchant | combobox | Only 1 CAD merchant option available on office 1604 (`316446 - PSAV Canada/CAD`). Save-cycle requires alternate option. Inference: same testid/component pattern as USD Merchant (directly proven NOT-TRACKED), same "no merchant-ID cell" across all 9 saves. | **CUR-BUG-B (b)** (inferred, retry on multi-merchant office to confirm) |
| MXN Merchant | combobox | 0 MXN merchant options available on office 1604 — combobox opens but listbox is empty regardless of MXN Selected state. Save-cycle impossible on this office. Inference as with CAD Merchant. | **CUR-BUG-B (c)** (inferred, retry on office with MXN merchants to confirm) |

---

## Duplicate-header flag + Col 63 cross-contamination guard

**Duplicate headers in the 87-col history** (MCP-confirmed via Phase 1 header read this session):
- **Col 5 "Currency"** (0-idx) — Currency-tab-owned (this catalog).
- **Col 63 "Currency"** (0-idx) — Pricing-tab-owned (per SP1 findings + cross-contamination guard below).

**Cross-contamination guard** (9 save-cycles, all driven from Currency tab):

| Save # | Description | Col 5 value after save | Col 63 value after save |
|---|---|---|---|
| baseline (pre-session) | SP-B-LO-R prior row (04/21 02:59:07 PM) | `"USD"` | `""` |
| 1 | USD → USD+CAD | `"USD, CAD"` | `""` |
| 2 | → USD+CAD+MXN | `"USD, CAD, MXN"` | `""` |
| 3 | → USD+MXN | `"USD, MXN"` | `""` |
| 4 | → USD+CAD+MXN (CAD-def) + default swap | `"USD, CAD, MXN"` | `""` |
| 5 | → CAD+MXN (deselect USD) | `"CAD, MXN"` | `""` |
| 6 | → MXN (MXN-def) | `"MXN"` | `""` |
| 7 | → CAD (CAD-def) | `"CAD"` | `""` |
| 8 | USD Merchant 316370 → 316426 (phantom row) | `"CAD"` | `""` |
| 9 | RESTORE → USD | `"USD"` | `""` |

**Result**: **col 63 stayed `""` for every Currency-tab save** — zero cross-contamination. Per-column tests for col 5 (SP-D1) and col 63 (SP-D2 Pricing) can be written without coupling concerns on this boundary.

---

## Boolean-encoding registry (per LR-036)

Location Management History uses **Unicode `"✔"`** for booleans (LR-036 — distinct from Local Office Settings History which uses SVG `lucide-check`). This session re-verified the Unicode encoding for col 2 "Active" and col 11 "Corporate Pricing" in every snapshot.

Currency tab does **not** contribute any boolean-encoded history column. The 3 IsDefault checkboxes and 3 Selected checkboxes are NOT-TRACKED (IsDefault) or aggregated into the text cell col 5 (Selected), so no `assertBooleanCell` call sites originate from this catalog.

---

## Save dialog pattern (Location Management Settings)

[MCP-VERIFIED: 2026-04-22] — re-confirms SP1 finding §1 (Save Dialog section). The Location Settings Save Changes dialog uses **Cancel / Ok** buttons (NOT Cancel / Save). This differs from the Local Office Settings dialog on the same app (which uses Cancel / Save). Any SP-D1+ Currency spec code must use the "Ok" button selector for confirmation, matching the existing shared selector `btnSaveChangesConfirm` which resolves to `[role="alertdialog"] button:has-text("Save")` in the Local Office context but needs a Location-Settings-scoped override for "Ok".

**Driver pattern used this session** (every successful save):
1. `radixClick(btnSave)` — dispatch PointerEvent+MouseEvent sequence on `[data-testid="location-settings-btn-save"]`.
2. Wait for `[role="alertdialog"][data-state="open"]` containing the text "Save Changes" (~200–1000 ms).
3. `radixClick(okBtn)` — dispatch on the dialog's "Ok" button.
4. Wait for dialog close (`data-state="closed"` or DOM-detached).
5. Tab-switch to Management History tab; cycle once if the top row still shows the pre-save timestamp (confirms LR-026 Angular dirty / cache quirk — consistent with SP-B-LO-1 method note #3).

---

## Negative cases

| # | Scenario | Driver steps | Observed behavior | Test implication (SP-D1) |
|---|---|---|---|---|
| N1 | **Cancel** | Form dirty (MXN Selected toggled on) → click `btnSave` → dialog opens → click "Cancel" in dialog | Dialog closes; form remains dirty; **no** new history row; top row still at Save 8 timestamp. Confirmed 2026-04-22 10:57:xx. | TC: "Cancel preserves form dirty state and does not create history row" |
| N2 | **No-op save** | Form clean (immediately after a save or Discard) | **Save button is `disabled`**. App prevents no-op submission via button-disabled state. No user-facing error. | TC: "Save button is disabled when form is pristine" (no API call, no history row) |
| N3 | **Validation-block (zero currencies selected)** | Toggle all 3 Selected → FALSE (deselecting the last one also auto-unsets its IsDefault via cascade; no default is set) | **Save button is `disabled`** despite form being dirty; no aria-invalid or role="alert" message shown; silent validation. | TC: "Save button is disabled when no currency is Selected (requires ≥1 Selected to Save)". Also a UX-discoverability bug candidate (no visible error explains why Save is disabled) — out of scope for catalog; SP-E-LM-CUR may record. |

**Additional defensive finding — "Unsaved changes" navigation guard** (N1 side-effect):
Navigating to a different tab (e.g., Management History) while the Currency form is dirty triggers a **second alertdialog** with heading "Unsaved changes" and buttons **"Stay" / "Discard"**. This is the shared LR-026 dirty-tracking pattern (matches Local Office Settings behavior). "Discard" reverts in-memory form state to the last-saved server state and allows navigation; "Stay" cancels the navigation. Confirmed during N1 teardown; "Discard" restored Currency parents to the pre-dirty baseline exactly (confirmed via readCurrencyParents before/after).

---

## Dropdown interaction notes (feedback to method / LR-025)

1. **Main Save button + Radix tab switches** — `radixClick` (synthetic PointerEvent+MouseEvent dispatch) worked reliably for every tab change and for every `btnSave` click this session.
2. **Radix Select / combobox option click** — synthetic dispatch on `[role="option"]` is unreliable (confirmed 2× this session: first option-click attempt during restore landed on the option but the combobox displayed-value did not update; listbox closed cleanly but the selection was dropped). **Working pattern**: Claude in Chrome `find` tool → `computer.left_click(ref)` using the returned `ref_NNN`. This matches LR-025 ("Radix UI large-option dropdowns need retry on option selection") and the SP-B-LO-1b retry #3 method note 10 ("Radix Combobox option selection via Claude in Chrome — use `find` + `computer.left_click(ref)`"). USD Merchant option `316370` restoration during Phase 6 succeeded via the `find + left_click` pattern on the first try.
3. **CDP `Runtime.evaluate` 45 s timeout cap** — re-confirmed (matches SP-B-LO-1b method note 11). Long chained async driver calls (toggle → save → wait → switch → read) routinely cross 45 s. When a JS call times out, the in-tab execution continues; subsequent small reads return the correct post-state. Mitigation this session: split per-cycle work into 2-3 smaller JS calls (toggle+save in one, history-diff in another). No data lost.

---

## Sub-observation — Multi-user / cross-parent drift in history rows

Between Save 8 and Save 9, cols 33 "Service Charge Name" and 37 "Terms and Conditions" diffed (`"US English: Resort Service Charge" → ""` and `"US English: LDW" → ""` respectively). Neither parent was touched by this catalog session. Likely causes:
- Another user editing Legal/Service Charge fields on office 1604 during the session window (10:45–11:00 AM).
- Possibly a session-edit cascade from a different agent/session (the E2E environment is shared per user memory `project_client_delivery_model.md`).

**Consequence for SP-D1**: per-column tests that diff "top row vs prior top row" must filter on the specific col-of-interest rather than asserting row-wide equality on unrelated cols. This reinforces the LR-024 / per-column-assertion discipline already in the pivot plan.

---

## Method notes / learnings fed back to master plan

1. **Office 1604 Currency baseline is USD-only + USD-default + USD Merchant `316370 - PSAV US/USD`** — record this fact for SP-D1's baseline-enforcement step (LR-019): first TC in the Currency hist describe.serial must reset to this baseline before testing.
2. **Merchant comboboxes on office 1604 are effectively untestable for non-USD** — CAD has 1 option (no alternate), MXN has 0 options. SP-D1 should not attempt CAD/MXN Merchant save-cycles on office 1604 unless test data is added. The NOT-TRACKED inference for CAD/MXN Merchant is sound given the identical component pattern with USD Merchant, but direct proof would require running on a different office.
3. **Dialog buttons differ between Local Office and Location Settings** (Cancel/Save vs Cancel/Ok) — SP-D1 must either use a scoped selector or a shared helper parameterized for the confirm-button label. Current framework `btnSaveChangesConfirm` selector (`[role="alertdialog"] button:has-text("Save")`) does NOT work on Location Settings — needs `button:has-text("Ok")` override.
4. **IsDefault is radio-exclusive**, implemented as 3 independent checkboxes that auto-unset each other when set. Cascade from Selected-deselect also unsets IsDefault. SP-D1 TC design must account for: setting one default implicitly changes the state of up to 2 other defaults in a single save event, and all 3 are NOT-TRACKED.
5. **Currency tab's parent-panel unmounts** when Management History tab is active (no DOM node for `location-settings-sub-tab-currency` while history is showing). Driver helpers must switch back through Basic Information first before opening the Currency sub-tab again. Same pattern as SP-B-LO-1 basic-info-vs-history interleave.

---

## Baseline row (post-session verify)

End-of-session top row (2026-04-22 10:59:43 AM) — the restore save, confirming 9/9 Currency parents byte-match pre-session values. Top-of-history timestamp: **10:59:43 AM** (save cycle 9, restore). Currency-specific baseline values:

| Col | Header | Baseline value |
|---|---|---|
| 5 | Currency | `USD` |
| 63 | Currency (Pricing duplicate) | `""` |

Full 9-parent form-state at end of session (matches Phase 1 baseline exactly):

| Currency | Selected | IsDefault | Merchant |
|---|---|---|---|
| USD | `true` | `true` | `316370 - PSAV US/USD` |
| CAD | `false` | `false` (disabled) | `316446 - PSAV Canada/CAD` |
| MXN | `false` | `false` (disabled) | `""` (empty, no MXN merchant data on office 1604) |

---

## Follow-on plans unblocked

- **SP-B-LM-R** (Location Management 87-col reconciliation): col 5 mapped to Currency tab's combined Selected state; col 63 confirmed Pricing-tab-owned and orthogonal.
- **SP-D1** (location-hist-currency.spec.ts): can start immediately on col 5 state-space TCs (7 combos tested here), plus NOT-TRACKED guards for IsDefault + USD Merchant, plus negative-case TCs.
- **SP-E-LM-CUR** (bug filings): 6 NOT-TRACKED candidates ready for LR-034 bug filing (CUR-BUG-A trio for IsDefault, CUR-BUG-B trio for Merchant; USD-Merchant is the gold-standard proof; CAD and MXN Merchant need retry on an office with alternate merchants for conclusive direct evidence).

---

## Completeness summary

| Grouping | Count | Status |
|---|---|---|
| Parents with direct save-cycle evidence | 5 of 9 (P1 combined Selected + P2 USD-IsDefault + P3 CAD-IsDefault + P4 MXN-IsDefault + P5 USD-Merchant) | All evidence produced this session |
| Parents classified by inference (no alternate-option data on office 1604) | 2 of 9 (P6 CAD-Merchant, P7 MXN-Merchant) | Bug candidates CUR-BUG-B(b)/(c); retry on multi-merchant office to confirm |
| Parents decomposed into P1 (presentation-vs-persistence) | 3 of 9 (P8 USD-Sel, P9 CAD-Sel, P10 MXN-Sel) | Subsumed by P1 col 5 mapping |
| 87-col history cols cataloged to a Currency parent | 1 of 87 (col 5) | Col 63 confirmed Pricing-owned (out-of-scope here, SP-D2 domain) |
| 7-combo state-space matrix | 7 / 7 | All Selected subsets MCP-verified |
| Negative cases documented | 3 / 3 (Cancel, No-op, Validation-block) | Plus 1 Unsaved-changes-navigation side-effect |
| Office 1604 baseline | restored | 9/9 parents byte-match Phase 1 |

`outcome:pass, attempts:1 (session), rules-written:0 (framework rules unchanged; catalog-level observations only)`
