# Corporate Pricing — Loc Pricing Import Test Plan (NM-2305)

**Module**: corporate-pricing | **Submodule**: loc_pricing_import | **Total**: 11 (10 Automated + 1 Manual/large-file boundary) | **Updated**: 2026-07-08

> Shared toolbar surface reference (live model, selector mapping, page-object contract) is now consolidated per-ticket; the toolbar_io submodule was dissolved and its coverage folded into the delivered tickets.

---

## Scope

**Loc Pricing Import real round-trip — NOW IN SCOPE (NM-2305, added 2026-07-07)**: TC-CPR-LIM-001..011 drive the real upload. The import is `PUT .../pricing/location-import`; the app auto-submits the file the moment it is chosen (no separate Upload click), and the server applies it as a per-(location, currency) replace — the rows the file carries for a location-and-currency REPLACE that location's existing rows in that currency (a row omitted within a currency the file touches is removed), while any location — and any currency partition — absent from the file is untouched (all live-verified: a USD-only file leaves a location's CAD rows intact). Live-observed write scope: only IsAlternate is import-writable (Internal/Labor/Production are reported updated but do not change), and a novel pricebook is silently dropped (createdCount 0). TC-CPR-LIM-009 (header-only rejection), TC-CPR-LIM-010 (write scope), TC-CPR-LIM-011 (create semantics) were added 2026-07-07 after a cross-vendor review. A minimal single-location file therefore bounds the mutation to a throwaway office (5897) and avoids the full-file server failure; the per-test baseline restores all of 5897's rows because baseline.csv carries the office's complete set. Coverage: success (flip Primary↔Alternate, verified in a fresh export), partial-update, the three in-browser rejections (empty / non-CSV / malformed), cancel, persistence (imported value durable + grid not left blank, guarding NM-2206), and the full/large-file boundary verified live once (2026-07-07, authorized override): the full ~38k-row import returns **HTTP 500** "Failed to replace LocationPricebook document …" (NM-2407) — a 500 replace-failure, **not** the 503/504 timeout the NM-2009/NM-2058 tickets describe. That boundary is documented, not automated (a repeating full import would load shared data every run). The re-downloaded export is the oracle, not the on-screen grid.

## Loc Pricing Import — real upload round-trip (NM-2305)

> The import uploads a CSV the server applies as a per-(location, currency) replace, bounded to throwaway office 5897. Every test resets 5897 to its all-Primary baseline before and after, and the reset is persistence-verified by re-reading a fresh export (not trusted from the upload's own success flag). The re-downloaded export is the oracle, not the on-screen grid. Axis-2 surface-family disposition lives in the test-cases file.

## Scenario: TC-CPR-LIM-001 - A real upload flips a pricebook Primary↔Alternate; the change reflects in a fresh export
1. Step: Reset office 5897 to its all-Primary baseline (upload baseline.csv), expected: the 3 baseline rows are restored (verified by re-reading a fresh export)
2. Step: Upload a minimal single-location file that flips one pricebook to Alternate, expected: the PUT location-import returns success
3. Step: Re-download the export and read the office's rows, expected: the flipped pricebook now reads IsAlternate=1

## Scenario: TC-CPR-LIM-002 - A partial file replaces the location set; an omitted row is removed, not merged
1. Step: Upload a file carrying only a subset of the office's USD rows, expected: success
2. Step: Re-download + read, expected: the file's rows are present, a row omitted within the touched currency is gone (replace, not merge), and rows in an untouched currency partition are intact

## Scenario: TC-CPR-LIM-003 - An empty file is rejected in the browser and no import runs
1. Step: Choose an empty (zero-byte) file, expected: a clear in-browser rejection message; no location-import request fires
2. Step: Re-download, expected: office rows unchanged

## Scenario: TC-CPR-LIM-004 - A non-CSV file is rejected by file type and no import runs
1. Step: Choose a .txt file, expected: rejected by type; no import request fires; office rows unchanged

## Scenario: TC-CPR-LIM-005 - A structurally malformed CSV surfaces an error and no import runs
1. Step: Choose a malformed CSV, expected: an error surfaces; no import request fires; office rows unchanged

## Scenario: TC-CPR-LIM-006 - Opening and dismissing the dialog (no file chosen) runs no import
1. Step: Open the Loc Pricing Import dialog and dismiss it without choosing a file, expected: no import request fires; office rows unchanged

## Scenario: TC-CPR-LIM-007 - An imported change persists on a fresh export after reload and the search grid still renders
1. Step: Upload a valid change, reload the page, re-download, expected: the imported value is durable and the search grid still renders (guards NM-2206)

## Scenario: TC-CPR-LIM-008 - Full/large-file boundary (Manual — verified-live 500 replace-failure, not automated)
1. Step: (Manual, one-time authorized) Upload the full ~38k-row export, expected: HTTP 500 "Failed to replace LocationPricebook document" (NM-2407); documented, not wired into CI (a repeating full import loads shared data every run)

## Scenario: TC-CPR-LIM-009 - A header-only CSV (headers, zero data rows) is rejected in the browser and no import runs
1. Step: Choose a header-only CSV, expected: an in-browser rejection; no import request fires; office rows unchanged

## Scenario: TC-CPR-LIM-010 - Only the Alternate flag is written; Internal / Labor / Production columns are not import-writable
1. Step: Upload a file that sets Internal / Labor / Production plus Alternate on a row, expected: success
2. Step: Re-download, expected: only IsAlternate changed; Internal / Labor / Production are unchanged from baseline

## Scenario: TC-CPR-LIM-011 - A pricebook not already defined in the system is silently dropped; no row is created
1. Step: Upload a file containing a novel pricebook name, expected: success and the response createdCount is 0
2. Step: Re-download, expected: the novel pricebook does not appear; the office row set is unchanged

## Coverage Index

- TC-CPR-LIM-001 — Loc Pricing Import — a real upload flips a pricebook Primary↔Alternate and reflects in a fresh export
- TC-CPR-LIM-002 — Loc Pricing Import — a partial file replaces the location set; an omitted row is removed, not merged
- TC-CPR-LIM-003 — Loc Pricing Import — an empty file is rejected in the browser with a clear message and no import runs
- TC-CPR-LIM-004 — Loc Pricing Import — a non-CSV file is rejected by file type and no import runs
- TC-CPR-LIM-005 — Loc Pricing Import — a structurally malformed CSV surfaces an error and no import runs
- TC-CPR-LIM-006 — Loc Pricing Import — opening and dismissing the dialog (no file chosen) runs no import
- TC-CPR-LIM-007 — Loc Pricing Import — an imported change persists on a fresh export and the search grid still renders
- TC-CPR-LIM-008 — Loc Pricing Import — full/large-file boundary (verified-live HTTP 500 "Failed to replace document" / NM-2407; documented, not automated)
- TC-CPR-LIM-009 — Loc Pricing Import — a header-only CSV is rejected client-side ("Please check the upload file format"), no import
- TC-CPR-LIM-010 — Loc Pricing Import — only the Alternate flag is written; Internal/Labor/Production are not import-writable
- TC-CPR-LIM-011 — Loc Pricing Import — a novel pricebook is silently dropped (createdCount 0); import updates, never creates
