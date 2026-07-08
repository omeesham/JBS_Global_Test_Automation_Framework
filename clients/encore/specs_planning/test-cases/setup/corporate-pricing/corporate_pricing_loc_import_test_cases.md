# Corporate Pricing — Loc Pricing Import Test Cases (NM-2305)

**Module**: corporate-pricing | **Submodule**: loc_pricing_import | **Total**: 11 (10 Automated + 1 Manual/large-file boundary) | **Updated**: 2026-07-08

> The REAL Loc Pricing Import upload round-trip: the server applies the file as a per-(location, currency) replace, bounded to a throwaway office (5897). Covers success (flip Primary↔Alternate, verified in a fresh export), partial-update, the in-browser rejections (empty / non-CSV / malformed / header-only), cancel, persistence, import write-scope, and create semantics. LIM-008 is the full/large-file boundary — verified live once (HTTP 500 replace-failure, NM-2407) and documented, not automated.

> Shared toolbar surface reference (MCP verification log, field inventory, validation rules, selector-mapping) lives in the baseline doc `corporate_pricing_toolbar_io_test_cases.md`.

---

## TC-CPR-LIM-001: Loc Pricing Import — a real upload flips a pricebook Primary↔Alternate and the change reflects in a fresh export
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |
**Surface_Family**: result-fidelity (QUICK)

**Depends_On**: TC-CPR-TIO-013
**Automatable**: Yes

**Preconditions**: On the Search screen (office 1604). The throwaway location 5897's current pricebook rows are captured first so they can be restored afterward.

**Steps**:
1. Open "Loc Pricing Import" and upload a minimal single-location CSV containing only office 5897's rows, with one pricebook's Alternate flag flipped from Primary to Alternate.
2. Capture the import request's HTTP status and raw response body, not just the dialog.
3. Re-download the Loc Pricing Export and read office 5897's rows.

**Expected**: The import returns HTTP 200 with a `success: true` body and a "Successfully processed" message; and the re-downloaded export shows the flipped pricebook row now Alternate, with all 11 columns of that row equal to the uploaded values.
**Data**: office=5897, file=valid-update.csv, endpoint=`.../pricing/location-import` (PUT)
**Notes**: NM-2305 real round-trip. A single-location file keeps the mutation bounded to 5897 and avoids the full-file server failure (a full ~38k-row import returns HTTP 500 "Failed to replace document" / NM-2407 — verified live 2026-07-07, see TC-CPR-LIM-008). Restored to the captured baseline afterward. The whole 11-column row is asserted (not a subset) so no field is silently unchecked.

---

## TC-CPR-LIM-002: Loc Pricing Import — a partial file replaces the location set; an omitted row is removed, not merged
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |
**Surface_Family**: result-fidelity (DEEP)

**Depends_On**: TC-CPR-LIM-001
**Automatable**: Yes

**Preconditions**: On the Search screen (office 1604). Office 5897's three rows set to baseline first.

**Steps**:
1. Upload a CSV containing only a SUBSET of office 5897's rows (two of the three) — one flipped Primary→Alternate, the other unchanged; the third row omitted.
2. Re-download the export and read office 5897's rows.

**Expected**: The import REPLACES office 5897's set with exactly the two file rows — the flipped row is now Alternate, the unchanged in-file row is identical, and the row OMITTED from the file is REMOVED (office 5897 now has two rows, not three). Locations absent from the file are untouched.
**Data**: office=5897, file=partial-update.csv
**Notes**: NM-2305 partial-update. Live-verified 2026-07-07: the import is a per-LOCATION replace (the file defines the location's complete pricebook set), NOT a per-row merge — a row omitted from the file for a location present in the file is deleted. The mutation stays bounded to office 5897 because locations absent from the file are untouched; the per-test baseline restores all three rows because baseline.csv carries the office's complete set. Note the response reported "updated 2" without flagging the deleted row — a silent-delete reporting lead (see baseline artifact §4).

---

## TC-CPR-LIM-003: Loc Pricing Import — an empty file is rejected in the browser with a clear message and no import runs
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Negative |
**Surface_Family**: empty-vol (QUICK)

**Depends_On**: TC-CPR-TIO-013
**Automatable**: Yes

**Preconditions**: On the Search screen (office 1604).

**Steps**:
1. Open "Loc Pricing Import" and attach a zero-byte CSV.
2. Observe the dialog and whether any import request fires.

**Expected**: The dialog shows "The selected file does not contain any valid location pricing rows to import.", the Upload button stays disabled, and no import request is sent (nothing is committed).
**Data**: office=5897, file=empty.csv
**Notes**: NM-2305 error path. The app validates the file in the browser before any upload, so an invalid file never mutates data.

---

## TC-CPR-LIM-004: Loc Pricing Import — a non-CSV file is rejected by file type and no import runs
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Negative |
**Surface_Family**: empty-vol (DEEP)

**Depends_On**: TC-CPR-TIO-013
**Automatable**: Yes

**Preconditions**: On the Search screen (office 1604).

**Steps**:
1. Open "Loc Pricing Import" and attach a plain-text `.txt` file.

**Expected**: The dialog shows "Unsupported file type. Allowed: .csv", Upload stays disabled, and no import request fires (nothing is committed).
**Data**: office=5897, file=wrong-format.txt
**Notes**: NM-2305 error path — file-type validation is client-side.

---

## TC-CPR-LIM-005: Loc Pricing Import — a structurally malformed CSV surfaces an error and no import runs
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Negative |
**Surface_Family**: empty-vol (DEEP)

**Depends_On**: TC-CPR-TIO-013
**Automatable**: Yes

**Preconditions**: On the Search screen (office 1604).

**Steps**:
1. Open "Loc Pricing Import" and attach a CSV whose columns do not match the location-pricing schema.

**Expected**: An error is shown in the dialog, Upload stays disabled, and no import request fires (nothing is committed).
**Data**: office=5897, file=malformed.csv
**Notes**: NM-2305 error path. The current error text is a raw parser error rather than a friendly validation message — recorded as an improvement lead. The assertion checks only that an error is surfaced and no import runs, so it stays valid if the message is later improved.

---

## TC-CPR-LIM-006: Loc Pricing Import — opening and dismissing the dialog (no file chosen) runs no import
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Negative |

**Depends_On**: TC-CPR-TIO-013
**Automatable**: Yes

**Preconditions**: On the Search screen (office 1604).

**Steps**:
1. Open "Loc Pricing Import" and close/cancel the dialog WITHOUT choosing a file.
2. Confirm no import request fired and the dialog closed.

**Expected**: No import request is sent; the dialog closes; office 5897 is unchanged.
**Data**: office=5897, file=none (no file chosen)
**Notes**: NM-2305 — live-verified 2026-07-07, the app **auto-submits the import the moment a file is chosen** (no separate Upload click), so a "choose then cancel" window does not exist; the meaningful negative case is that merely opening the import affordance and backing out mutates nothing.

---

## TC-CPR-LIM-007: Loc Pricing Import — an imported change persists on a fresh export and the search grid still renders
| Priority | Status | Type |
|----------|--------|------|
| High | Automated | Functional |
**Surface_Family**: persistence (QUICK)

**Depends_On**: TC-CPR-LIM-001
**Automatable**: Yes

**Preconditions**: On the Search screen (office 1604). Office 5897's rows captured as baseline.

**Steps**:
1. Import a valid single-location file (flip a pricebook to Alternate).
2. Reload the Search page.
3. Re-download the export.

**Expected**: The search grid re-renders with rows (not left blank — guarding against the post-import blank-grid defect) AND the re-downloaded export still shows the imported value (the change is durable, not just an in-memory echo).
**Data**: office=5897, file=valid-update.csv
**Notes**: NM-2305 persistence. Guards NM-2206 (blank grid after import) on the live app.

---

## TC-CPR-LIM-008: Loc Pricing Import — full/large-file boundary (verified-live 500 replace-failure; not safely automatable)
| Priority | Status | Type |
|----------|--------|------|
| Medium | Manual | Negative |
**Surface_Family**: empty-vol (DEEP)

**Depends_On**: TC-CPR-LIM-001
**Automatable**: No

**Preconditions**: On the Search screen.

**Steps**:
1. (Not automated) Import the full ~38k-row exported file.

**Expected**: The full ~38,000-row import fails server-side. The upload stalls part-way through — the dialog progress bar stops near the middle and shows *"Import failed due to a server error. Please try again. If the problem continues, contact support."* The underlying request returns HTTP 500 with a *"Failed to replace … document …"* body — a server-side replace failure, not a gateway timeout. Because the file is re-imported unchanged, no location's values change: office 5897's rows and the total exported row count are identical afterward.
**Data**: the full exported CSV, roughly 38,000 rows — verified once by hand, never in CI.
**Notes**: NM-2305 large-file boundary; the observed failure reproduces NM-2407 ("failed to replace document"), not the NM-2009 / NM-2058 gateway-timeout tickets — verified live once on 2026-07-07 under a one-time user-authorized override of the throwaway-office-only rule. **Not automated** in CI on purpose: a repeating full-file import would re-import ~38k rows against shared data every run, roughly half applied before the 500 fires, so this boundary is verified once and documented rather than wired into the suite. The bounded valid round-trip (TC-CPR-LIM-001/002) is the safe automated coverage. Automate only if the server bug is fixed, or a bounded file that reliably triggers the 500 is found.

---

## TC-CPR-LIM-009: Loc Pricing Import — a header-only CSV (headers, zero data rows) is rejected in the browser and no import runs
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Negative |
**Surface_Family**: empty-vol (DEEP)

**Depends_On**: TC-CPR-TIO-013
**Automatable**: Yes

**Preconditions**: On the Search screen (office 1604).

**Steps**:
1. Open "Loc Pricing Import" and attach a CSV that has the 11 header columns but no data rows.
2. Observe the dialog and whether any import request fires.

**Expected**: The dialog shows "Please check the upload file format.", no import request is sent, and office 5897 is unchanged. This is a DISTINCT input from the zero-byte empty file (TC-CPR-LIM-003) — a header-only file is a separate rejection path with its own message.
**Data**: office=5897, file=header-only.csv
**Notes**: NM-2305 error path. Live-verified 2026-07-07 (office 5897): a header-only file is rejected client-side with "Please check the upload file format." — different from the empty-file message — and no PUT fires.

---

## TC-CPR-LIM-010: Loc Pricing Import — only the Alternate flag is written; Internal/Labor/Production columns are not import-writable
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Functional |
**Surface_Family**: result-fidelity (DEEP)

**Depends_On**: TC-CPR-LIM-001
**Automatable**: Yes

**Preconditions**: On the Search screen (office 1604). Office 5897 reset to its baseline first.

**Steps**:
1. Upload a single-location file that sets ALL FOUR boolean flag columns (IsInternal, IsLabor, IsAlternate, IsProduction) to 1 on one pricebook row.
2. Re-download the export and read that row.

**Expected**: The import returns HTTP 200 success, but the fresh export shows ONLY IsAlternate changed to 1 — IsInternal, IsLabor, and IsProduction stay 0. Of the flag columns, only IsAlternate is applied by the import.
**Data**: office=5897, file=field-writability.csv
**Notes**: NM-2305 write-scope. Live-verified 2026-07-07 (office 5897): flipping all four flags returns "success, updated 3 records", but the export read-back proves only IsAlternate persists — the server reports the other three as "updated" while their values do not change (a silent no-op / inflated "updated" count — an improvement lead). This is a regression guard: if the import ever starts applying the other flags, the test flags the change.

---

## TC-CPR-LIM-011: Loc Pricing Import — a pricebook not already defined in the system is silently dropped; no row is created
| Priority | Status | Type |
|----------|--------|------|
| Medium | Automated | Negative |
**Surface_Family**: result-fidelity (DEEP)

**Depends_On**: TC-CPR-LIM-001
**Automatable**: Yes

**Preconditions**: On the Search screen (office 1604). Office 5897 reset to its baseline first.

**Steps**:
1. Upload a file containing office 5897's three baseline rows PLUS one row for a novel pricebook name that does not exist in the system.
2. Read the import response body and re-download the export.

**Expected**: The import returns success but the response's createdCount is 0, and the novel pricebook does NOT appear in the re-downloaded export — office 5897 still has exactly its three baseline rows. The import updates existing pricebooks; it does not create a new pricebook definition.
**Data**: office=5897, file=create-novel.csv
**Notes**: NM-2305 create-semantics. Live-verified 2026-07-07 (office 5897): a novel pricebook is reported "processed" with createdCount:0 and never appears — while the response's updatedCount counts the dropped row (an inflated-count reporting lead). A previously-removed KNOWN pricebook, by contrast, is re-added on import (the per-test baseline reset relies on this).

---

## Surface-Behavior Coverage (NM-2305 Loc Pricing Import) — Axis-2 disposition

Loc Pricing Import is a file-upload action (choose a CSV → the app auto-submits it → the server replaces, per location, that location's pricebook rows with the file's rows). The re-downloaded export is the oracle (the on-screen search grid is a different, tenant-wide dataset). Disposition of the 7 surface/behavior families:

- **behavior-cases: result-fidelity, empty-vol, persistence**
  - `result-fidelity` — QUICK: TC-CPR-LIM-001 (a flipped pricebook row shows the new value in a fresh export, full 11-column match). DEEP: TC-CPR-LIM-002 (partial file — the location's set is REPLACED by the file's rows; an omitted row is removed, not merged; per-(location,currency)-replace proven, both survivor rows asserted at full 11 columns, and a canary office is asserted untouched), TC-CPR-LIM-010 (write scope — only IsAlternate is applied; Internal/Labor/Production are reported "updated" but do not change), TC-CPR-LIM-011 (create semantics — a novel pricebook is silently dropped, createdCount 0, no row created).
  - `empty-vol` — QUICK: TC-CPR-LIM-003 (empty file rejected in the browser, no import). DEEP: TC-CPR-LIM-004 (non-CSV rejected), TC-CPR-LIM-005 (malformed structure surfaces an error), TC-CPR-LIM-009 (header-only file — a distinct client rejection "Please check the upload file format", no import), TC-CPR-LIM-008 (full/large-file boundary — verified live 2026-07-07: the full ~38k-row import returns HTTP 500 "Failed to replace document" (NM-2407); classification = verified-live boundary, not automated in CI because a repeating full import would load shared data every run; escalate to automate if the server bug is fixed or a bounded 500-trigger is found).
  - `persistence` — QUICK: TC-CPR-LIM-007 (imported value durable on a fresh export after a page reload; the search grid is not left blank — NM-2206 guard).
- `out-of-scope:pagination=Loc Pricing Import is a single upload action with no rows-per-page control; post-import grid paging is a property of the Loc Pricing grid surface, not the import action`
- `out-of-scope:sorting=the import action exposes no sortable column; sort is a property of the underlying Loc Pricing grid, not the import surface`
- `out-of-scope:combination=the import is a single upload action with no filter/sort/paginate controls to compose; post-import filtering belongs to the grid surface, not the import`
- `out-of-scope:render-state=the import-specific render is the upload dialog's progress/error-message state (covered by the error-path cases TC-CPR-LIM-003..005); post-import grid cell rendering belongs to the shared Loc Pricing grid surface`
- `documented-gap:multi-location=a single CSV spanning two offices (present-office replaced + absent-office untouched, in one import) is NOT automated: it requires a SECOND sanctioned throwaway office, which does not exist under the throwaway-office-only mutation-safety rule (office 5897 only). The per-(location,currency) replace scope + TC-CPR-LIM-002's canary-office-untouched assertion cover the "other locations untouched" half; the one-time live multi-location check (2026-07-07 — a single-office import changed only that office) stands as the evidence. Automate if a second safe throwaway office is confirmed. Currency fidelity (CAD/MXN import) is deferred for the same reason (5897 is USD-only).`
