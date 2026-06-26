# Field-Case Catalog — Launcher Dialogs (Pay To Address + Master Bill To Address)

**Date**: 2026-06-11
**Identity**: GIVER
**Subplan**: SUBPLAN_LAUNCHER_DIALOG_GAPS_FCC Phase 2
**Modules**: left-panel-basic-information (Workstream A — Pay To Address launcher) + account-address (Workstream B — Master Bill To Address launcher)
**Taxonomy row**: `Lookup launcher (read-only display + search dialog)` — `field-case-generation.md` §2 (landed Phase 5.5, LR-057)
**Evidence**:
- A: `_internal/field-inventories/left-panel-basic-information-2026-06-11.md` (`## Launcher dialogs`)
- B: `_internal/walk-evidence-account-address-master-bill-to-2026-06-11.md`
- Sweep: `_internal/false-green-sweeps/launcher-dialogs-2026-06-11.md`; RCA: `_internal/rca-launcher-dialog-misses-2026-06-11.md`
**Prior art (cross-ref)**: `_internal/field-case-catalogs/left-panel-basic-information-2026-06-03.md` (the walk that MISSED Pay To), `_internal/field-case-catalogs/account-address-2026-05-29.md` (the walk that covered the shared dialog only via Venue).
**Dedup law (doctrine item 8, amended)**: outcome-dedup operates **per-LAUNCHER, never per-dialog** (LR-057). A Venue-launcher TC can NOT discharge a Master-launcher cell; a display-value TC can NOT discharge a launcher cell.

---

## Workstream A — Pay To Address (Pay To List dialog)

### A.1 Coverage ledger — what the EXISTING TCs prove about Pay To

| TC | Proves | Does NOT prove |
|---|---|---|
| TC-LOC-LP-001 | display textbox shows the Pay To **name** "Encore" | nothing about the launcher/dialog |
| TC-LOC-LP-004 | display **input** is `[disabled]` (TRUE) + value "Encore" | blind to the clickable label launcher (the UNPROBED-AFFORDANCE the title "always disabled" masked) |
| TC-LOC-LP-023 | incidental disabled re-check of `txtPayToAddress` inside the Live Date test | nothing — incidental |

**Net**: the Pay To **launcher → "Pay To List" dialog** (5 filters, 13-col sortable table, per-row checkbox, Select-disabled-until-checked, Cancel/Close-X, single page) has **ZERO** prior coverage. This is the headline gap.

### A.2 Gap matrix — every case-class classified (a) net-new / (b) covered / (c) not-applicable

| # | Case-class (Lookup-launcher taxonomy) | Disposition | TC / reason |
|---|---|---|---|
| A1 | launcher opens dialog (render: title "Pay To List", 5 filters, Search/Reset, table headers, Select/Cancel) | **(a)** | **TC-LOC-LP-028** — headline fix |
| A2 | Select disabled until a row is checked | **(a)** | **TC-LOC-LP-029** |
| A3 | Cancel discards (no field change, Save stays disabled, payToId unchanged) | **(a)** | **TC-LOC-LP-030** |
| A4 | Close-X + Esc each discard | **(a)** | **TC-LOC-LP-031** (two independent dismiss cycles, no OR-expr per LR-051) |
| A5 | Pay To **ID** filter → exactly 1 row (the restore-anchor mechanism) | **(a)** | **TC-LOC-LP-032** (ID `7` → 1 row; LR-022 — existence/precision, not exact count) |
| A6 | Pay To **Name** filter → multiple rows (`Encore` → IDs 1/4/6/7) | **(a)** | **TC-LOC-LP-033** (`toContain`, server-side contains, LR-022) |
| A7 | empty-result state (verbatim "No results.", announced not silent) | **(a)** | **TC-LOC-LP-034** (ID `99999` → 0 rows + "No results.") |
| A8 | Reset clears filters / restores full list (form-taint check, ACC-007 precedent) | **(a)** | **TC-LOC-LP-035** |
| A9 | row select → display field updates ("Encore Bahamas") + Save enables (no save) | **(a)** | **TC-LOC-LP-036** |
| A10 | select-different → Save → reload → **persists** → restore-by-ID anchor → Save → reload → verify | **(a)** | **TC-LOC-LP-037** via `saveAndVerifyCase` (compile-required baseline, LR-019); restore by ID 1 (name ambiguous — 2 "Encore" rows) |
| A11 | Address / Phone / Fax filters | **(c)** | only ID + Name exercised live (sufficient for restore-anchor + multi-match proof); the 7-row 1604 list does not carry filter-distinguishing Address/Phone/Fax data the way ID/Name do — authored only if BUILDER confirms live column data, else not-applicable per walk evidence §Filters |
| A12 | pagination / rows-per-page / column sort | **(c)** | single page, **7 rows ≤ page-size 20**; "go to next/last" buttons all `[disabled]` (`1 / 1`) — not-applicable per inventory §Pagination |
| A13 | re-select-CURRENT value (LR-009 net-zero probe, ACC-028 interplay) | **(c)** | not measured in the Phase-1 walk; marginal value over A9 (select-alternate→Save-enables) + A10 (persist); deferred — the LR-009 net-zero behavior for this launcher is unproven, and authoring an assertion either way would be guessing (no live answer). Recorded as a future-walk item, not a bug. |

**Workstream A net-new = 10** (TC-LOC-LP-028..037). Plus 1 correction: **TC-LOC-LP-004** keeps its ID + input-disabled assertion (still TRUE) but its title/steps are corrected to state the launcher affordance (false-green sweep finding #1).

---

## Workstream B — Master Bill To Address (Select Customer Address dialog, Master launcher)

### B.1 Coverage ledger — what the EXISTING TCs prove about the MASTER launcher

| TC | Launcher exercised | Proves | Does NOT prove |
|---|---|---|---|
| TC-LOC-ACC-012 | **Master** (`btnAccMasterAddress`) | the shared "Select Customer Address" dialog **OPENS** from Master (7 rows) | never selects via Master; never checks Master `dd` update; never measures Master persistence |
| TC-LOC-ACC-014 | — | the Master display `dd` fields are read-only **in place** (can't type) | blind to the fact the **launcher** mutates them |
| TC-LOC-ACC-008/009/010/011/031 | **Venue** | the dialog's open / Select-gate / client-search / Save-always-disabled / search-clear-restores — **all via the Venue launcher** | per LR-057 a Venue TC CANNOT discharge a Master cell |
| TC-LOC-ACC-027 | **Venue** | Venue address selection updates display but does **NOT persist** through save+reload | says nothing about Master — and the Phase-1 walk proved **Master DOES persist** (opposite per launcher) |

**Net**: the Master launcher's `select → Master-field-update → persist` cycle has **ZERO** prior coverage. Dialog-level coverage via Venue could never have revealed the per-launcher persistence divergence (Master persists; Venue does not — `walk-evidence-account-address-master-bill-to-2026-06-11.md` §Key finding).

### B.2 Gap matrix

| # | Case-class | Disposition | TC / reason |
|---|---|---|---|
| B1 | Master dialog row-select → Select → **Master** `dd` fields update (City WEST HOLLYWOOD→PALM SPRINGS) + **Venue unchanged** + Save enables (no save) | **(a)** | **TC-LOC-ACC-032** — the missing core per-launcher case |
| B2 | Master persistence: select-different → Save → reload → **persists** → restore anchored original → Save → reload → verify all-5 Master values | **(a)** | **TC-LOC-ACC-033** via `saveAndVerifyCase`; anchor `8899 Beverly Blvd Ste 412` (unique in the 7-row list); per Phase-1 walk Master PERSISTS (NOT the ACC-027 Venue non-persist) |
| B3 | Master launcher opens the shared dialog | **(b)** | TC-LOC-ACC-012 (open-only via Master) — extended in MD notes; the OPEN itself is per-launcher discharged |
| B4 | Master display fields read-only in place | **(b)** | TC-LOC-ACC-014 — extended in MD notes (values are launcher-mutable) |
| B5 | Cancel / Esc / Close-X discard from the Master-opened dialog | **(b)** | the dialog is a **single instance**; discard is **dialog-level** (no model mutation), proven via the Venue-opened dialog (TC-ACC-008..011 cancel paths). LR-057's per-launcher mandate scopes to **select→field-update(→persist)** (where the divergence was proven), NOT to non-mutating discard. Cited honestly as (b)-dialog-level, distinct from B1/B2 which ARE per-launcher (a). |
| B6 | Master dialog filters / Save-always-disabled / Select-gate | **(b)** | dialog-instance-level, proven via Venue TC-ACC-009/010/011; not a per-launcher select cycle |

**Workstream B net-new = 2** (TC-LOC-ACC-032..033). Plus note extensions to **TC-LOC-ACC-012** (open-only stays; Master select/persist now covered by 032/033) and **TC-LOC-ACC-014** (values launcher-mutable).

---

## Final net-new TC list (contiguous from the Phase-0-confirmed next-free numbers)

**Workstream A — Left Panel (next-free was TC-LOC-LP-028):**
- TC-LOC-LP-028 — Pay To Address launcher opens "Pay To List" dialog (render)
- TC-LOC-LP-029 — Pay To List Select disabled until a row is checked
- TC-LOC-LP-030 — Pay To List Cancel discards (no field change)
- TC-LOC-LP-031 — Pay To List Close-X + Esc discard
- TC-LOC-LP-032 — Pay To List ID filter returns exactly the matching row
- TC-LOC-LP-033 — Pay To List Name filter "Encore" returns multiple rows
- TC-LOC-LP-034 — Pay To List empty result shows "No results."
- TC-LOC-LP-035 — Pay To List Reset clears filters / restores full list
- TC-LOC-LP-036 — Pay To select updates display + enables Save (no save)
- TC-LOC-LP-037 — Pay To selection persists through save+reload (restore by ID)

**Workstream B — Account & Address (next-free was TC-LOC-ACC-032):**
- TC-LOC-ACC-032 — Master Bill To selection updates Master display + leaves Venue unchanged + enables Save
- TC-LOC-ACC-033 — Master Bill To selection persists through save+reload (restore anchored original)

**Totals**: 12 net-new (10 LP + 2 ACC). 1 LP correction (TC-LP-004 wording, ID kept). 2 ACC note extensions (TC-ACC-012/014).

---

## Bug candidates (filing = Phase 4 HEALER per §2)

- **A (Pay To)**: NONE. Selection persists correctly (`financial.payToId` 1→7→1 verified). No missing filters vs baseline (old-site Pay To picker is the same launcher → PARITY per the re-classified BL-DIV-4). The 2026-06-03 launcher MISS is a process/coverage gap, not an app defect (RCA).
- **B (Master)**: NONE. Master persistence WORKS. The **Venue** non-persist (ACC-027) is the pre-existing documented behavior; whether IT is a defect is the open question for the account-address audit (`SUBPLAN_DQU_16_F1e_ACCOUNT_ADDRESS_AUDIT.md`), **NOT** this subplan — dedup per `feedback_discussion_item_not_bug.md` (Master persists, so nothing to file). Cross-referenced in the Execution Summary for a user triage decision (overlap awareness, per subplan §Context fact 6).

## Cross-reference to prior-art catalogs (per-launcher dedup audit trail)

- `left-panel-basic-information-2026-06-03.md`: classified Pay To as a static disabled textbox — **superseded for the Pay To row** by this catalog + `field-inventories/left-panel-basic-information-2026-06-11.md`. The 2026-06-03 catalog's other 13 fields stand.
- `account-address-2026-05-29.md`: its gap matrix dedup'd the Select-Customer-Address dialog **per-dialog** (covered via Venue). This catalog corrects that to **per-launcher**: the Master launcher's select/persist cycle was an (a) gap, not (b) covered. The 2026-05-29 Venue coverage stands.
