---
module: corporate-pricing
screen: product-group-override
type: defect-verify-staging
ticket: TICKET-cp-f2-override-0713
walk-date: 2026-07-13
walker: council-worker (claude-sonnet-4.6)
auth: encore-state.json (valid — no Entra redirect)
env: cloudapps-e2e.encoreglobal.com
evidence-dir: evidence-cp-override-2026-07-13/
jira-crossref: clients/encore/specs_planning/_internal/jira-defect-crossref-2026-06-09.md
rovo_available: false
---

# Corporate Pricing — Product Group Override Defect Verification 2026-07-13

Staged findings for A12 and C7 from the QA tracker. Live-verified 2026-07-13 per LR-044.

---

## A12 — Product Group Override: office 1604 grid empty / Export mismatch

### Live Repro Verdict: CONFIRMED (2026-07-13)

**Steps followed** (verbatim per LR-044):
1. Navigate to `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/corporate-pricing/pg-override`
2. Open "Select a location" picker → search "1604" → checkbox on "1604 - Parker Palm Springs" → click "Select"
3. Observe grid: **"0 items found" / "No results."** — Currency=ALL, Active Only=unchecked
4. Click "Export" toolbar button → observe network
5. Direct API fetch: `GET /api/location/corporate-price-pg-override?localOfficeId=1604`

**Raw evidence** (verbatim):
- Grid body: `0 items found … No results.` (see `evidence-cp-override-2026-07-13/raw-evidence.md` E1)
- Grid API HTTP 500 error body:
  ```json
  {"success":false,"validationErrors":{"exception":["An item with the same key has already been added. Key: 4543"]},"message":"An item with the same key has already been added. Key: 4543"}
  ```
- Export API: HTTP 200, tenant-wide CSV, **731 rows for location 1604** (NOT 8 as previously claimed — the claim appears outdated; today's export count is 731)
- Export note: The export endpoint `/export?locale=en-US` does NOT filter by selected office (tenant-wide dump). Product group 4543 does NOT appear in the export for 1604.

**Control (office 1606)**:
- Grid API: HTTP 200, `success: true`, 7 overrides
- Grid body: `7 items found` — populated correctly
- Confirms: the HTTP 500 is specific to office 1604, not a global outage

**RCA classification** (per SKILL.md / data vs code investigation):
- NOT a data-state issue: 731 rows for 1604 exist in export → data is present in the backend
- IS a **server-side code bug**: the endpoint `GET /api/location/corporate-price-pg-override?localOfficeId=1604` throws a .NET/C# `Dictionary.Add()` duplicate-key exception for product group 4543 when building the response for 1604. This is a code defect in the API layer, not a data cleanup issue.
- The export works because it uses a different code path (`/export`) that does not encounter the duplicate key

**Import sub-claims**:
- `data-blocked: no safe import fixture for override-pg Import screen`
- Existing `src/data/corporate-pricing/fixtures/import-all/` has only `empty.csv` + `malformed.csv` — not valid override data
- Indirect evidence: the ticket's claimed import raw error ("An item with the same key has already been added. Key: 4543") is IDENTICAL to the grid API HTTP 500 error body, confirming same root cause

**Jira dedup**:
- NM-1961 ("Newly added override rows not shown in grid until refresh") — NOT a match. NM-1961 describes a freshness/visibility bug on a successful (200) response; A12 is an HTTP 500 server crash on the grid endpoint. Different class.
- No other NM-# from jira-defect-crossref-2026-06-09.md describes an HTTP 500 on the grid endpoint.
- Jira live check: `jira: UNCHECKED-BY-WORKER` (Rovo/Atlassian MCP not available in this execution context)

**Proposed color**: 🔴 **RED**
- Severity: HIGH — the entire Product Group Override grid for office 1604 is completely broken; no row can be viewed or edited; the server throws a 500 on every load
- Impact: Any QA test or real user on office 1604 using this screen gets an empty grid
- Blocker: Fixture spec was re-anchored to office 1606 precisely because of this bug (see `src/data/corporate-pricing/override.ts` comment)

**Finalized tracker row** (9-column format):
| ID | Screen | Description | Offices | Evidence | Grid API | Export | RCA Class | Verdict |
|---|---|---|---|---|---|---|---|---|
| A12 | Product Group Override | Grid shows 0 items for 1604; API returns HTTP 500: "An item with the same key has already been added. Key: 4543" | 1604 (broken), 1606 (control OK) | raw-evidence.md E1–E7 | 500 | 200 (731 rows, tenant-wide) | Server code bug: duplicate key PG-4543 in API response builder | 🔴 RED CONFIRMED 2026-07-13 |

---

## C7 — Product Group Override: office 1604 data provenance question

### Classification: DATA-PROVENANCE QUESTION (YELLOW) — NOT a separate defect

**Steps followed**:
- Same walk as A12 (C7 is the "why/what-next" paired question, not a separate repro)
- Additional: checked export to verify whether 1604 data was deleted/cleaned

**Raw evidence**:
- Export (2026-07-13): **731 rows for 1604** — data IS present in the backend
- Grid shows 0 items due to HTTP 500, NOT due to data deletion
- Product group 4543 (the duplicate-key culprit) has 0 rows in the export for 1604 — yet it appears in the backend's internal data structure in a way that triggers a duplicate on dictionary build

**Answer to C7's question** ("Was 1604's override data intentionally cleaned/reset, and can it be restored?"):
- **NO** — data was NOT cleaned. 731 rows for 1604 are present in the export as of 2026-07-13.
- The grid appears empty because the server throws HTTP 500 when building the grid response for 1604 (duplicate key in backend data model for PG-4543)
- Restoration is NOT needed — data exists. The fix required is a server-side code fix to resolve the duplicate-key condition for product group 4543 on office 1604's backend records.

**A12 vs C7 dedup**: A12 = the code defect (HTTP 500 / duplicate key). C7 = the data-provenance question answered by the same evidence. They are NOT double-counted as two separate bugs.

**Jira dedup**: Same as A12 — no matching NM-# for an HTTP 500 duplicate-key server error. `jira: UNCHECKED-BY-WORKER`

**Proposed color**: 🟡 **YELLOW**
- This is a question answered by the A12 investigation: data is intact, fix is code-level
- No action on data (no import/restore needed)

**Finalized tracker row** (9-column format):
| ID | Screen | Description | Offices | Evidence | Grid API | Export | RCA Class | Verdict |
|---|---|---|---|---|---|---|---|---|
| C7 | Product Group Override | Data provenance Q: was 1604 data cleaned? NO — 731 rows in export. Grid empty due to HTTP 500 code bug, not data deletion. | 1604 | raw-evidence.md E3 | 500 (same as A12) | 200 (731 rows, tenant-wide) | DATA-PROVENANCE QUESTION — data intact, fix is server-side code | 🟡 YELLOW answered 2026-07-13 |

---

## Notes for Encore Product Team

1. The raw server error for 1604's grid load is: `"An item with the same key has already been added. Key: 4543"` — this is a C#/.NET `Dictionary<K,V>.Add()` exception indicating product group ID 4543 appears more than once in 1604's backend data structure.
2. The export endpoint is unaffected (different code path).
3. Office 1606 (and presumably other offices) are unaffected.
4. The duplicate key condition does NOT appear in the export rows for 1604 (product group 4543 has 0 rows in the export for 1604), suggesting the duplicated entry may be in a non-exported table or the export aggregates differently.
5. All import tests for 1604 should be treated as blocked until the server-side duplicate is resolved.
