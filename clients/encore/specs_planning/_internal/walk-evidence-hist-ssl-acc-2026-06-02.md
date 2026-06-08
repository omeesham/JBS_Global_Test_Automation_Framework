# Walk Evidence — HIST / SSL / ACC re-enable + de-flake (2026-06-02)

**Plan**: `PLAN_SPEC_FIX_HIST_SSL_ACC_REENABLE_2026_06_02`
**Office**: 1604 (Parker Palm Springs)
**Browser tool**: Playwright CLI (`playwright-cli` 0.1.8, agent-CLI — NOT `npx playwright`, per LR-054). Session `-s=e2e`, auth via `state-load clients/encore/.auth/encore-state.json`.
**Walk date**: 2026-06-02 (~20:1x local)
**Purpose**: Phase 0.5 mandatory live DOM-forensics walk. Every fix below had a DOM assumption that had to be confirmed live BEFORE editing code (the 2026-06-01 fixme/bound decisions were artifact-only, no live walk — this corrects that).

---

## 0.5a — MGH read-only structure (fix: TC-LOC-MGH-015)

Surface: Location Management History tab (`/locations/1604/settings/location` → tab `location-settings-tab-management-history`).

| Probe | Result |
|---|---|
| `[data-testid="location-settings-table-management-history"]` tag | **`DIV`** (wrapper, not a `<table>`) |
| Nested `<table>` inside the wrapper | **present** (`hasInnerTable: true`) |
| Inputs inside the wrapper div (`input:not([type=hidden]), textarea`) | **1** |
| That 1 input | `type=text`, `aria-label="Current page number"` (the paginator), `inWrap: true` |
| Inputs inside the **nested `<table>`** | **0** |
| Is the paginator input inside the nested `<table>`? | **false** (it lives in the wrapper div, OUTSIDE the table) |
| Data rows in nested table | 20 |
| Panel-wide input count (what current `isReadOnly()` measures) | 1 (the paginator) |

**Decision**: The current `isReadOnly()` counts inputs across `[role="tabpanel"]` → catches the paginator → returns false. The paginator input is **inside the `tblMgmtHistory` wrapper div but outside the nested `<table>`**, so scoping to `tblMgmtHistory` alone is INSUFFICIENT (would still count 1). The honest fix is to scope the input count to the **nested data `<table>`** — `tblMgmtHistory > table` — which has genuinely **0** inputs. Assert `=== 0` (no `<=1`, no constant subtraction). Sibling TC-016 already proves data cells are non-interactive, so 0 is the true value. **Not a §HALT-(a)** — the data region cleanly excludes the paginator.

## 0.5b — MGH pagination DOM + full Next→Prev→Last→First walk (fix: TC-LOC-MGH-019)

Pagination bar structure (page 1):
- Current-page indicator = **`<input aria-label="Current page number" value="1">`** (NOT a `<span>`).
- Total-pages indicator = a single standalone `<span>` with text **`/522`** (the page input's parent textContent is exactly `/522`). Across the entire tab content there is **exactly one** span matching `/^\/\s*\d+$/` — no date-fragment false positives.
- Four nav buttons present: `Go to first page`, `Go to previous page`, `Go to next page`, `Go to last page`.

Live navigation sequence (button enabled/disabled + page input value):

| Step | page input | first | prev | next | last |
|---|---|---|---|---|---|
| Page 1 (start) | 1 | disabled | disabled | enabled | enabled |
| after **Next** | 2 | enabled | enabled | enabled | enabled |
| after **Previous** | 1 | **disabled** | **disabled** | enabled | enabled |
| after **Last** | 522 | enabled | enabled | disabled | disabled |
| after **First** | 1 | disabled | disabled | enabled | enabled |

**Decision (REFUTES the skip-comment app-bug claim)**: The skip comment claimed *"pagination bar collapses to 2-button mode after Next→Previous on page 1; first/last buttons vanish from DOM; click times out at 15s."* The live walk shows **all four buttons remain in the DOM throughout** — after Next→Previous the first/last buttons are present and correctly disabled (not absent). The actual failure is **OUR selector bug**: `getPaginationText()` looks for a `<span>` matching `/^\d+\s*\/\s*\d+$/`, but the indicator is an `<input value=current>` + a separate `<span>/522</span>` → it returns `''` → `expect(...).toContain('2')` fails. This is the plan's "buttons stay → our bug" branch (NOT §HALT-(c) revert). Fix `getPaginationText()` to read the input value + the `/N` span and return `"<current> / <total>"`; keep `getApproximateTotalRowCount()` working (its regex `/\d+\s*\/\s*(\d+)/` matches `"1 / 522"` → 522).

## 0.5c — LOS read-only structure (fix: TC-LOS-HIS-006)

Surface: Local Office Settings → Location Settings History (`/locations/1604/settings/local-office` → tab `local-office-settings-tab-location-settings-history`).

| Probe | Result |
|---|---|
| `[data-testid="local-office-settings-history-table"]` tag | **`TABLE`** (the table itself — NOT a wrapper; differs from MGH per LR-036) |
| Inputs inside `tblHistory` | **0** |
| Panel-wide input count (what current `isHistoryTabReadOnly()` measures) | **1** = the `aria-label="Current page number"` paginator input |
| Is the paginator input inside `tblHistory`? | **false** (outside the table) |
| Save button in panel | 0 |
| Data rows | 20 |

**Decision**: `tblHistory` IS the `<table>` and the paginator input is a sibling OUTSIDE it. So scope the input count to `tblHistory` directly (no nested `table` step needed, unlike MGH) → genuinely **0**. Keep the Save-button check panel-wide. LR-036 vindicated: LOS structure ≠ MGH structure — verified independently.

## 0.5d — ACC-030 Account-Number filter latency + account existence (fix: TC-LOC-ACC-030)

Surface: Account & Address tab → Name button (`location-settings-btn-lookup-venue`) → Account List dialog → Account Number filter `AC000107` → Search.

| Probe | Result |
|---|---|
| Dialog opened | yes (`location-settings-modal-account-list`) |
| Account Number filled | `AC000107` |
| **Time-to-first-result** (Search click → first data cell non-empty) | **28,852 ms (~29 s)** |
| Result row count | **1** |
| Contains "Parker Palm Springs" | **true** |
| First row text | `AC000107  Parker Palm Springs  4200 E PALM CANYON DR  PALM SPRINGS  CA  United States` |

**Decision (REFUTES the brief's "account doesn't exist")**: `AC000107 → Parker Palm Springs` exists and the filter returns exactly 1 correct row. The failure is purely **backend latency (~29 s)** vs the page-object's two 15 s inner waits in `searchAccountByFilter` (lines 269 + 280) and the test's 20 s poll (line 77) — all three time out before the ~29 s response. Honest fix: raise the inner waits to an evidence-based budget (45 s, ~1.5× the measured 28.85 s) and the test poll to match (≥ inner budget so the test owns the deadline), and raise ACC-030's `test.setTimeout` to 90 s to fit. `searchAccountByFilter` is shared by ACC-004/025/026/028/030 — raising the ceiling only extends patience for slow searches; fast searches resolve as soon as results land (no regression). NOT a data swap, NOT §HALT-(d) (filter works; account present). Observation flagged: ~29 s is a slow backend response for a single-account exact filter — performance note, not a functional defect (correct result returned).

---

## Summary → branch decisions

| Item | Live verdict | Fix branch |
|---|---|---|
| MGH-015 | paginator input inside wrapper, outside nested table; nested table = 0 inputs | scope to `tblMgmtHistory > table`, assert `=== 0` |
| MGH-019 | all 4 buttons stay; indicator is input+`/522` span; `getPaginationText()` is the bug | our-bug branch: fix `getPaginationText()`, keep assertions intact |
| HIS-006 | `tblHistory` IS the table; paginator outside; 0 inputs in table | scope to `tblHistory`, assert `=== 0` |
| ACC-030 | account exists, filter returns 1 correct row; backend ~29 s | raise inner waits + poll to 45 s, `test.setTimeout` 90 s |

No item requires a verbatim revert (§HALT-c) or a data fabrication (§HALT-d). No assertion is weakened. SSL-035 + ACC-020 are deterministic spec-side fixes that did not require a live walk (relative-assertion + per-test-baseline) and are executed per §5.
