# BUG-DOP-LOC-001 — Search does not filter the Locations grid

**severity**: ~~High~~
**tab**: Tab 1 (Locations)
**baselineComparison**: baseline-absent
**status**: RETRACTED
**date**: 2026-08-11
**retractedDate**: 2026-08-11
**retractedBy**: T17 positive-control re-verification

---

## ⚠️ RETRACTION — This bug does not exist

The search input **works correctly**. T17 re-verified using `pressSequentially` (real keystroke
delivery, 80 ms delay between characters). The original finding was a false positive caused by
using `fill()` — a raw DOM value assignment — which bypasses Angular's change detection and
never triggers the component's filter logic. The app never received usable input events.

**Root cause of false finding**: `fill()` sets `.value` directly on the DOM element without
dispatching `input` / `keydown` / `keyup` events. Angular's reactive form binding listens for
those events; `fill()` produces none, so the filter never ran.

**No overlay was involved** — `alert-dialog-overlay` was absent at rest and after clicking the
input. The overlay theory (from the sibling save-investigation) does not apply here.

---

## Retraction evidence (T17, 2026-08-11)

- **Positive control**: `GET /navigator/api/discount/optimization?skipPagination=true → 200` confirmed before typing.
- **Footer at load**: `2154 locations found` ✓
- **Overlay at rest**: absent (`alert-dialog-overlay` not present; top element at search input was the INPUT itself).
- **Overlay after click**: absent.
- **Input method**: `pressSequentially('abbey', { delay: 80 })` — real keystroke sequence, not `fill()`.
- `INPUT_VALUE_after_abbey: "abbey"` — text landed in the box.
- `FOOTER_AFTER_abbey: 1 locations found` — grid narrowed to 1 row (The Abbey Resort, ID 1115). ✓
- `FOOTER_AFTER_nomatch ("zzznomatch999"): 0 locations found` ✓
- `FOOTER_AFTER_CLEAR: 2154 locations found` — full count restored on clear. ✓
- **Network requests fired during typing**: 0 — filtering is **client-side** (no server round-trip needed).
- Screenshots: `t17-01-loaded.png`, `t17-02-after-abbey.png`, `t17-03-nomatch.png`
  (in `reports/walk-evidence/discount-optimization-2026-08-11/`)

## filterMechanism
Client-side — Angular component filters the already-loaded 2154-row dataset in memory.
No network request fires on typing. Tests must NOT wait for a network response after typing;
they should wait for the footer count to change.

## originalFalseEvidence (kept for audit trail)
- `SEARCH_ROWS_BEFORE: 2154`
- `SEARCH_ROWS_AFTER_abbey: 2154` — caused by `fill()` bypassing Angular events.
- `SEARCH_ROWS_NOMATCH: 2154` — same cause.
- Original screenshots `headed-03-search-abbey.png`, `headed-04-search-nomatch.png` show text
  in the box but no filtering — consistent with `fill()` artefact.

## relatedTests
TC-DOP-OPT-010, TC-DOP-OPT-011, TC-DOP-OPT-012 (search filter behaviour) — these TCs describe
correct expected behaviour; the feature works, so these TCs are valid and testable.
