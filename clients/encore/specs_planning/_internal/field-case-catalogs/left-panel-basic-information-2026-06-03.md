---
module: left-panel-basic-information
phase: 2 (field-case catalog + TC parity)
date: 2026-06-03
identity: GIVER
subplan: plans/pending/SUBPLAN_LEFT_PANEL_BASIC_INFORMATION_FCC.md
field_inventory: clients/encore/specs_planning/_internal/field-inventories/left-panel-basic-information-2026-06-03.md
baseline: clients/encore/specs_planning/_internal/old-site-baseline/left-panel-basic-information-2026-06-03.md
---

# Field-Case Catalog — Left Panel (Basic Information)

> **Build-time refinement (BUILDER, 2026-06-03):** the planned 5 net-new persist TCs (§3 below)
> were reduced to **3 built + 2 deferred (c)** to honor the no-state-leak mandate:
> **TC-LOC-LP-025 Local Office Name, TC-LOC-LP-026 Tax Mode, TC-LOC-LP-027 Region** are automated;
> **Servicing Branch persist** → (c) (required field, no "unselect" → saving leaks into 1604; Region
> already proves dropdown-persistence) and **Live Date persist** → (c) (calendar multi-step +
> volatile 1604 value + TC-023 already proves the popover) are documented deferrals, NOT TCs.
> So §3's IDs 026/028/029 are superseded by this mapping. Plus TC-024 deferred (design decision).
> Final: **23 of the 24 original automated (TC-016 corrected to read-only) + 3 net-new = 26 automated; TC-024 deferred.**

## Field-state corrections applied (from live walk, truth hierarchy: live DOM > MD)

| Correction | MD claim | Live truth (2026-06-03) | Baseline agrees? |
|---|---|---|---|
| Line Of Business | editable, 3 options | **disabled / read-only** ("Hotel Services Division") | YES — old-site nav2 LOB also disabled → read-only is intended |
| Field split | 5 read-only + 9 editable | **6 read-only + 8 editable** | YES |
| Live Date value | May 8th, 2007 | **June 15th, 1990** | (old-site shows 05/12/2007 — value is data, not design) |
| Servicing Branch count | 215 (first "0220") | **218** (first "1752 -- W Hoboken") | n/a (data) |

## 1. Coverage ledger — what each of the 24 TCs proves (field, assertion)

| TC | Field(s) | Assertion proven |
|---|---|---|
| TC-LOC-LP-001 | all 14 | baseline default-state of every field (value + enabled/disabled) |
| TC-LOC-LP-002 | Office | read-only/disabled |
| TC-LOC-LP-003 | Local Office | read-only/disabled |
| TC-LOC-LP-004 | Pay To Address | read-only/disabled |
| TC-LOC-LP-005 | eCommerce Active | read-only/disabled checkbox |
| TC-LOC-LP-006 | Enable Productions Orders | read-only/disabled checkbox |
| TC-LOC-LP-007 | Save | disabled on pristine load |
| TC-LOC-LP-008 | Save (via Union) | enables after any change; stays dirty after revert |
| TC-LOC-LP-009 | Local Office Name | required → error icon on clear; Save still enables (live) |
| TC-LOC-LP-010 | Local Office Name | maxLength=50 enforced |
| TC-LOC-LP-011 | Active | checkbox toggle **save+reload persist** (both states) |
| TC-LOC-LP-012 | Union | checkbox toggle **save+reload persist** + ETS cross-tab |
| TC-LOC-LP-013 | Tax Mode | dropdown enumeration (2: US, International) |
| TC-LOC-LP-014 | Country | dropdown enumeration (4: US, Mexico, Canada, Bahamas) |
| TC-LOC-LP-015 | Region | dropdown enumeration (59) + select-then-reload **reverts (non-persist)** |
| TC-LOC-LP-016 | Line Of Business | **CORRECTED** → read-only/disabled assertion (was: 3-option enum — impossible on disabled combobox) |
| TC-LOC-LP-017 | Servicing Branch Office | dropdown enumeration (**218**) + required/unselected default |
| TC-LOC-LP-018 | Country→Tax Mode/Region | cascade clears Tax Mode + Region |
| TC-LOC-LP-019 | Country→Save | Save disabled at TaxModeID=0; re-select Tax Mode re-enables |
| TC-LOC-LP-020 | Country→Tax Mode/Region | not auto-restored on country switch-back |
| TC-LOC-LP-021 | Country→Job Costing | USA-only cross-tab (Local Info) |
| TC-LOC-LP-022 | Country→Remit PST | Canada-only cross-tab (Local Info) |
| TC-LOC-LP-023 | Live Date | popover-open (value **June 15th, 1990** corrected) |
| TC-LOC-LP-024 | Save × Legal | cross-tab invalid-Legal save interaction |

## 2. Gap matrix — 14 fields × taxonomy (a=net-new / b=covered-by-outcome / c=N/A)

| Field | Taxonomy class | Read-state | Enumerate opts | Save+reload persist | Class + disposition |
|---|---|---|---|---|---|
| Office | read-only text | TC-001/002 (b) | n/a (c) | n/a (c) | covered |
| Local Office | read-only text | TC-001/003 (b) | n/a (c) | n/a (c) | covered |
| Local Office Name | plain text | TC-001 (b) | n/a (c) | **(a) TC-025** | required+maxlen covered (009/010); **persist net-new** |
| Active | checkbox | TC-001 (b) | n/a (c) | TC-011 (b) | covered |
| Live Date | date | TC-001/023 (b) | n/a (c) | **(a) TC-026** | popover-open covered (023); **persist net-new** |
| Tax Mode | dropdown | TC-001 (b) | TC-013 (b) | **(a) TC-027** | enum covered; **persist net-new** |
| Country | cascading dropdown | TC-001 (b) | TC-014 (b) | (c) cascade-coupled | enum + cascade covered (014/018-022); persist = (c) high-risk (mutates core office; requires full Tax+Region re-select) — documented deferral |
| Region | dropdown | TC-001 (b) | TC-015 (b) | **(a) TC-028** | enum + non-persist covered; **persist net-new** |
| Servicing Branch Office | dropdown (large) | TC-001 (b) | TC-017 (b) | **(a) TC-029** | enum covered; **persist net-new** |
| Line Of Business | read-only dropdown | TC-001/016 (b) | n/a — disabled (c) | n/a (c) | **read-only — corrected; covered by 016** |
| Pay To Address | read-only text | TC-001/004 (b) | n/a (c) | n/a (c) | covered |
| Union | checkbox | TC-001 (b) | n/a (c) | TC-012 (b) | covered |
| eCommerce Active | read-only checkbox | TC-001/005 (b) | n/a (c) | n/a (c) | covered |
| Enable Productions Orders | read-only checkbox | TC-001/006 (b) | n/a (c) | n/a (c) | covered |

DOM-tamper negative cases → (c) low-ROI (Legal Path D: Radix SC combobox tears down Angular on DOM mutation; no server-reject behavior found for left-panel fields).

## 3. Net-new TC list (minimal-waste — each proves a DISTINCT field's save+reload persistence)

| New TC | Field | Mechanic |
|---|---|---|
| TC-LOC-LP-025 | Local Office Name | edit name → save → reload → persisted → restore "Parker Palm Springs" |
| TC-LOC-LP-026 | Live Date | open popover → pick a different date → save → reload → persisted → restore |
| TC-LOC-LP-027 | Tax Mode | US→International → save → reload → persisted → restore US |
| TC-LOC-LP-028 | Region | Palm Springs→Boston → save → reload → persisted → restore Palm Springs |
| TC-LOC-LP-029 | Servicing Branch Office | select a branch → save → reload → persisted → restore (unselected) |

**Country save-persist deferred (c)**: changing Country cascade-clears Tax Mode + Region, so a Country-persist test would have to re-select Tax Mode + Region + save, materially mutating core office data and overlapping the cascade suite (018-022) which already proves the Country mutation. Documented here as a deliberate (c), not a silent gap (LR-040).

**Total: 24 existing (1 corrected) + 5 net-new = 29 TCs.** TC ID prefix stays `TC-LOC-LP`.
