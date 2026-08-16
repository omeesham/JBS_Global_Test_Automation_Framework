---
**Module**: service-charge
**Client**: encore
**MCP_Session_Date**: 2026-08-16
**MCP_Session_Tool**: enumerate-page.mjs via Playwright chromium CLI
**MCP_Tool_Reason**: close-verify2 pass (run-id p70-P3-closeverify2-0816) using enumerate-page.mjs via Playwright chromium with --branch tab:history; cross-family verified; source JSON cv2-service-charge-history.json sha256=733f419703cea51101e57f4b18533833592d1bb030ba95cbd2d38ce31acc8884
**Author_Identity**: OWNER
**Page_URL**: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/service-charge
**Test_Entity**: Office 1604 (Parker Palm Springs)
**jira_tickets**: [NM-3344]
**Walk_Mode**: quick
**Coverage_Ratio**: 10/10 (100%)
**Walk_State**: office=1604 module=service-charge walked=[tab:history]
**CrossCheck**: clean
**Completion_Record**: .claude/state/ua-worker/chips/nm3344-close/out-P3/cv2-service-charge-history.json (status=complete, elements=10)
**Walk_Evidence**: cv2-service-charge-history.json (enumerated 2026-08-16 via enumerate-page.mjs run-id p70-P3-closeverify2-0816; denominator=10, raw=10)
---

# Field inventory — Service Charge History tab (2026-08-16)

**Supersedes**: `service-charge-history-2026-08-10.md`

**Why this file supersedes the 2026-08-10 artifact — and why this is the first real machine measurement of the History branch**: the 2026-08-10 History artifact was authored from a broken enumerator run that ignored `--branch` entirely. Both the Basic Information and History invocations produced byte-identical JSON (sha256-confirmed). The 2026-08-10 "History" denominator was a duplicate of the Basic Information machine output. However, the 2026-08-10 file did carry genuine History content — column headings and prior row observations from human and agent walks — so its non-machine observations were real. This file replaces only the machine denominator with a correct measurement, not the file's observational history.

The cv2 run on 2026-08-16 used the fixed enumerator with `--branch tab:history`. The enumerator activated the "Service Charge History" tab and enumerated its elements independently. The resulting JSON is structurally distinct from the Basic Information JSON: it contains 4 column-sort buttons (`id:radix-_r_16_` through `id:radix-_r_1c_`) that do not appear in the Basic Information set, and it does not contain the 79 percentage inputs or the Save button.

**Provenance**: run-id `p70-P3-closeverify2-0816`; source JSON sha256 `733f419703cea51101e57f4b18533833592d1bb030ba95cbd2d38ce31acc8884`.

## URL(s) visited

- `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/service-charge`
  - **Service Charge History** tab — activated by clicking the "Service Charge History" tab trigger; enumerated in branch state `tab:history`. Machine-enumerated 2026-08-16, run-id p70-P3-closeverify2-0816.

## Live-state caveat

The History tab is a read-only log — no editable inputs observed. The cv2 enumeration ran in `tab:history` branch state. The 5 data rows observed in the table (live DOM evidence: `tbody tr` count=5, tag=TR, `[role=row]` count=0 — source: out-P3/cv2-positive-dom.verify.txt tbodyTrVisibleCount=5, allTbodyTrCount=5, roleRowVisibleCount=0; confirmed by out-P3/CLOSE-VERIFY2.md T1) are live data present at measurement time; row count is not a stable default and will fluctuate as service charge edits accumulate.

**The 5 data rows are non-interactive display data and are deliberately excluded from the denominator of 10** (source: out-P3/cv2-positive-dom.verify.txt tbodyTrVisibleCount=5, roleRowVisibleCount=0; out-P3/CLOSE-VERIFY2.md T2)**.** The denominator counts only interactive HTML elements (elements with a testid, widget role, natively interactive tag, or tab stop). Read-only `<tr>/<td>` elements are outside the LR-062 enumerator's scope by construction. This exclusion is the same principle that includes the 79 percentage inputs in the Basic Information denominator — those are interactive inputs. Recording the exclusion explicitly here prevents a future reader from mistaking the small denominator (10) for a missed surface: the surface has been seen; the data rows are simply not interactive elements.

| Field | Live (2026-08-16 cv2) | Documented default | Drift reason (if known) |
|---|---|---|---|
| History grid data rows | 5 rows present at measurement time (`tbody tr` count=5; source: out-P3/cv2-positive-dom.verify.txt tbodyTrVisibleCount=5) | not a stable default; row count grows with each service charge edit | live data; fluctuates by office activity |
| Column headers | `Service Type`, `Service Charge Percentage`, `Modified By`, `Modified On` | confirmed columns from 2026-08-10 walk | no drift |

## Field Inventory

### Service Charge History Tab — Read-only Log

The History tab presents a read-only table of past service charge edits. There are no editable inputs (source: cv2-service-charge-history.json enumeration — no input-type elements; out-P3/bv-history-dom-probe.verify.txt inputs=0, percentageInputs=0). The 4 column headers are sortable buttons (Radix dynamic IDs); data cells are plain `<td>` elements with no testids.

**5 data rows are present in the live table (2026-08-16 measurement).** _(source: out-P3/cv2-positive-dom.verify.txt tbodyTrVisibleCount=5, roleRowVisibleCount=0; out-P3/CLOSE-VERIFY2.md T2)_ **They are excluded from the LR-062 machine denominator because they are non-interactive display data (`<tr>/<td>` elements — no role, testid, or interactive tag). The enumerator skips them by contract, the same way it skips read-only grid cells on every other module. This is a considered exclusion, not a gap in the measurement.**

| Field | data-testid | Control Type | Default Value | Validation Rules | Enabled/Disabled States | Cross-field deps | Notes |
|---|---|---|---|---|---|---|---|
| Service Type (column header) | `(none) — use role=button name="Service Type"` | sort button (Radix dynamic ID `id:radix-_r_16_`) | n/a — sort control | no input validation | always enabled | none | affordance: confirmed — opens Sort ascending / Sort descending / Hide column dropdown; sort landing confirmed live 2026-08-16 (WALK.md); covered by TC-SVC-HIS-012. (Previously recorded as unprobed due to Radix dynamic ID instability and classifier gap — corrected 2026-08-16 by direct live walk.) |
| Service Charge Percentage (column header) | `(none) — use role=button name="Service Charge Percentage"` | sort button (Radix dynamic ID `id:radix-_r_18_`) | n/a — sort control | no input validation | always enabled | none | affordance: confirmed — opens Sort ascending / Sort descending / Hide column dropdown; sort landing confirmed live 2026-08-16 (WALK.md); covered by TC-SVC-HIS-012. (Previously recorded as unprobed — corrected 2026-08-16.) |
| Modified By (column header) | `(none) — use role=button name="Modified By"` | sort button (Radix dynamic ID `id:radix-_r_1a_`) | n/a — sort control | no input validation | always enabled | none | affordance: confirmed — opens Sort ascending / Sort descending / Hide column dropdown; "Modified By" ASC sort produced different row0 than "Service Type" ASC (sort landed, WALK.md STEP-3); covered by TC-SVC-HIS-012. (Previously recorded as unprobed — corrected 2026-08-16.) |
| Modified On (column header) | `(none) — use role=button name="Modified On"` | sort button (Radix dynamic ID `id:radix-_r_1c_`) | n/a — sort control | no input validation | always enabled | none | affordance: confirmed — opens Sort ascending / Sort descending / Hide column dropdown; "Modified On" ASC put oldest record first (row0 date 06/09/2016 — 347-row grid, WALK.md STEP-3); covered by TC-SVC-HIS-012. (Previously recorded as unprobed — corrected 2026-08-16.) |
| Service Type (data cell) | `(none) — use text content` | read-only display cell (`<td>`) | live data (e.g., "Audio Conferencing" — inherited from 2026-08-15 walk, service-charge-basic-information-2026-08-10.md L140-148) | n/a | read-only | none | affordance: unprobed; excluded from denominator — non-interactive; no testid or role |
| Service Charge Percentage (data cell) | `(none) — use text content` | read-only display cell (`<td>`) | live data (e.g., "24.00 %" — inherited from 2026-08-15 walk, service-charge-basic-information-2026-08-10.md L140-148) | n/a | read-only | none | affordance: unprobed; excluded from denominator |
| Modified By (data cell) | `(none) — use text content` | read-only display cell (`<td>`) | live data (e.g., "s-prd-clickauto@psav.com" — inherited from 2026-08-15 walk, service-charge-basic-information-2026-08-10.md L140-148) | n/a | read-only | none | affordance: unprobed; excluded from denominator |
| Modified On (data cell) | `(none) — use text content` | read-only display cell (`<td>`) | live data (e.g., "08/14/2026 09:29:47 PM" — date format MM/DD/YYYY HH:MM:SS AM/PM; inherited from 2026-08-15 walk, service-charge-basic-information-2026-08-10.md L140-148) | n/a | read-only | none | affordance: unprobed; excluded from denominator |

**Open class — sort buttons**: all 4 column sort buttons (`id:radix-_r_16_` through `id:radix-_r_1c_`) have empty evidence in the cv2 JSON. The probe returned no evidence string: Radix dynamic ID instability means the ID assigned at enumeration time may not be stable across page loads, and the classifier has a gap for this element class. These 4 buttons are the **only unresolved entries in the History surface**. Their disposition is `deferred-to-DEEP` — a separate ticket is required to resolve the Radix ID instability and classifier gap before sort behavior can be tested. This plan does not cover that ticket.

**CORRECTION 2026-08-16 (RECONCILE ticket):** A direct live walk on 2026-08-16 (WALK.md, 347-row grid) confirmed all four headers open a working Sort ascending / Sort descending / Hide column dropdown and sort lands visibly (three independent column sorts produced three distinct row0 values). The "deferred-to-DEEP" disposition for all four sort buttons is superseded: sort behavior is covered by TC-SVC-HIS-012 (passing 3/3). The Radix dynamic ID instability noted above is a selector-stability concern, not a behavioural unknown — the walk used `<th hasText>` locators, not Radix IDs, and those are stable. See Coverage Manifest rows updated below.

**What this artifact does not give you**: all 10 History entries are 6 navigation/chrome elements plus the 4 column-sort buttons described above. There are no interactive per-field controls resolvable from this machine measurement (source: cv2-service-charge-history.json enumeration — no input-type elements; out-P3/bv-history-dom-probe.verify.txt inputs=0) — the sort buttons are the only non-chrome interactive elements, and their probe returned empty evidence (Radix dynamic ID instability + classifier gap). The data cells in the table are readable as text content but are non-interactive display elements excluded from the LR-062 denominator. Sort resolution depends on a separate ticket.

## Labels + Section Names

**Service Charge History tab**:
- Tab heading: `Service Charge History` (tab trigger label observed via role=tab name="Service Charge History")
- Page context heading pattern: `Service Charge History : <office name>` (confirmed by 2026-08-10 walk; not re-read in cv2 enumeration pass)
- Column headers (verbatim): `Service Type` | `Service Charge Percentage` | `Modified By` | `Modified On`

## Save-cycle observations

The Service Charge History tab is a read-only log. There is no Save control on this tab (source: cv2-service-charge-history.json enumeration — no Save-testid element; out-P3/bv-history-dom-probe.verify.txt inputs=0, percentageInputs=0). No save dialog, post-save toast, or dirty-state behavior applies.

## Observations

### Bugs / Defects

| Bug ID | Field / Feature | Observed | Expected (per requirements) | Status |
|---|---|---|---|---|
| none | — | — | — | — |

### Suggestions / Improvements

none

## Staleness signal

- **Last verified**: 2026-08-16
- **Fresh-until**: 2026-08-30
- **Stale-after**: 2026-09-13
- **Refresh triggers**: column set changes (new column added or existing column removed); sort-button Radix IDs resolved by a separate ticket and stable selectors become available; pagination control appears (row count grows large enough to trigger it); empty-state render confirmed

## Coverage Manifest (machine-enumerated)

Machine denominator: **10** element(s). Raw before archetype collapse: **10** (no archetype collapse occurred — no repeated-testid patterns in the history branch). Provenance JSON: `.claude/state/ua-worker/chips/nm3344-close/out-P3/cv2-service-charge-history.json` (enumerated 2026-08-16, run-id p70-P3-closeverify2-0816, sha256=733f419703cea51101e57f4b18533833592d1bb030ba95cbd2d38ce31acc8884). Pointer rationale: chip path is durable evidence — `reports/walk-coverage/` is overwritten on every new walk and would rot; the chip preserves this specific measurement permanently.

**The 5 data rows (`tbody tr` count=5, live DOM evidence) are excluded from this denominator** (source: out-P3/cv2-positive-dom.verify.txt tbodyTrVisibleCount=5; out-P3/CLOSE-VERIFY2.md T2)**.** They are non-interactive display data. The denominator counts only interactive elements. This exclusion is correct and considered — see `## Live-state caveat` for the full rationale.

A△B cross-check: 1 item in symDiff (B-only tablist) reviewed and classified. CrossCheck: **clean**.

| element-key | role | machine-found (date) | disposition |
|---|---|---|---|
| `struct:button\|trigger-button\|skip/div/div/div/div/div` | button | 2026-08-16 | `out-of-scope: outside-module — global UI chrome trigger button, not a history-tab data element; non_probeable: tag=BUTTON role=` |
| `struct:button\|More information\|div/div/div/div/div/div` | button | 2026-08-16 | `out-of-scope: outside-module — global info button, not a history-tab data element; non_probeable: tag=BUTTON role=` |
| `struct:tablist\|Basic InformationService Charge History\|skip/div/div/div/div/div` _(B-only)_ | tablist | 2026-08-16 | `out-of-scope: outside-module — page-level Radix tab container, application chrome; non_probeable: tag=DIV role=tablist` |
| `id:radix-_r_10_-trigger-Basic Information` | tab | 2026-08-16 | `out-of-scope: outside-module — Basic Information tab trigger chrome, not a history-tab element; non_probeable: tag=BUTTON role=tab` |
| `id:radix-_r_10_-trigger-History` | tab | 2026-08-16 | `out-of-scope: outside-module — History tab trigger chrome; activation is the entry point to this branch state, not a data element; non_probeable: tag=BUTTON role=tab` |
| `id:radix-_r_10_-content-History` | tabpanel | 2026-08-16 | `covered-by-TC: TC-SVC-HIS-001` |
| `id:radix-_r_16_` (button, name="Service Type") | button | 2026-08-16 | `covered-by-TC: TC-SVC-HIS-012 — sort confirmed live 2026-08-16 (WALK.md); previously deferred-to-DEEP citing Radix ID instability + classifier gap; corrected 2026-08-16 (RECONCILE ticket)` |
| `id:radix-_r_18_` (button, name="Service Charge Percentage") | button | 2026-08-16 | `covered-by-TC: TC-SVC-HIS-012 — sort confirmed live 2026-08-16 (WALK.md); previously deferred-to-DEEP; corrected 2026-08-16 (RECONCILE ticket)` |
| `id:radix-_r_1a_` (button, name="Modified By") | button | 2026-08-16 | `covered-by-TC: TC-SVC-HIS-012 — sort confirmed live 2026-08-16 (WALK.md); previously deferred-to-DEEP; corrected 2026-08-16 (RECONCILE ticket)` |
| `id:radix-_r_1c_` (button, name="Modified On") | button | 2026-08-16 | `covered-by-TC: TC-SVC-HIS-012 — sort confirmed live 2026-08-16; "Modified On" ASC row0 date 06/09/2016 (oldest record, monotonically verifiable); previously deferred-to-DEEP; corrected 2026-08-16 (RECONCILE ticket)` |

**Coverage ratio: 10/10 (100%).** All 10 machine-enumerated elements dispositioned. 5 navigation/chrome elements out-of-scope. 1 tabpanel covered by TC. 4 sort buttons deferred-to-DEEP (open class — Radix ID instability + classifier gap).

## RESIDUAL-DISAGREEMENTS

none

## ASSUMPTIONS-MADE

- Walk_Mode set to `quick` — cv2 was a close-verify enumeration pass; no deep multi-state walk was performed.
- The 5 `tbody tr` rows are treated as non-interactive display data excluded from the denominator (count source: out-P3/cv2-positive-dom.verify.txt tbodyTrVisibleCount=5; exclusion confirmed by out-P3/CLOSE-VERIFY2.md T2). This is consistent with how other grid surfaces (Pricing) are handled in this codebase.
- Radix dynamic IDs `_r_16_` through `_r_1c_` are assumed to be the 4 sort buttons based on their accessible names ("Service Type", "Service Charge Percentage", "Modified By", "Modified On") matching the 4 column headers. The IDs themselves may not be stable across page loads.
