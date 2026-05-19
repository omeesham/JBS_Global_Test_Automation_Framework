> **ARCHIVED — DO NOT EXECUTE.** Completed work, historical reference only.

---

# SUBPLAN SP-B-LO-V: MCP Live Verification — Jira Claims vs Our Catalog

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2.5 (Verification gate — sits between Discovery and Reconciliation)
**Status**: DONE
**Executed**: 2026-04-22
**Priority**: P0 (blocks SP-B-LO-R, SP-C1, SP-C2, SP-E-LO)
**Created**: 2026-04-21
**Depends on**: SP-B-LO-1 DONE, SP-B-LO-1b DONE, SP-B-LO-2 DONE, SP-B-LO-2b DONE
**Identity**: HUNTER (MCP live DOM drive, potential bug evidence capture)
**Skills**: `/research` (MCP exploration) + `/identity`
**Estimated**: one session (~45 min — five discrete probes, serial)

---

## Cause

Five Jira tickets (summarised in `.claude/plans/this-jira-desc-for-noble-map.md`) surfaced claims about the Location History surface that differ from what our 1604-based catalog has been saying. Before folding any of those claims into SP-B-LO-R, SP-C1, SP-C2, or SP-E-LO, each claim must be live-verified on the Jira-named locations. Absorbing un-verified Jira claims into pending subplans would propagate assumptions into specs — exactly what the SUPREME RULE forbids. This subplan is a 45-minute gate that either promotes claims to "confirmed, absorb downstream" or demotes them to "refuted, discard."

---

## Scope

**Locations**: Navigator loc `1145` (Jira-validated for Location Settings History) and loc `1186` (Jira-validated for Location Management History). NO work on 1604 in this subplan.
**Target surface**: Both the 42-col Local Office Settings History table and the Location Management History table, as they actually render on 1145 / 1186.
**Output**: A single "Findings" section appended to this file. No catalog edits, no bug filings, no TC rewrites — findings get absorbed downstream.

**Explicitly out of scope**:
- Editing catalogs (hist-root-map-*.md) — frozen during verification
- Filing new bugs — findings may seed bug filings in SP-E-LO, not here
- Any 1604 work — comparisons happen in SP-B-LO-R, not here
- The Jira UI styling bug (Jira ticket 3) — cosmetic, different surface

---

## The 5 Probes

Each probe is a discrete phase. Keep them serial and independent — a failure in one does not block the next.

### Probe 1 — `isCorporate` flag on POST payloads

Question: is there an `isCorporate` boolean on the save POST body, and does it correctly toggle between Location Settings (corporate) and Local Office Settings (non-corporate) contexts?

Steps:
1. Navigate to loc 1145 → Local Office Settings → Basic Information tab.
2. Open DevTools Network tab (or use `browser_network_requests`). Filter to XHR.
3. Change one low-risk field (e.g., Phone 2 from current value to current+" V"). Click Save.
4. Capture the POST request body. Record: endpoint path, full JSON payload, HTTP status.
5. Restore Phone 2 to original. Save.
6. Navigate to Location Management → Basic Information (corporate scope).
7. Change one low-risk field (whatever is editable — TBD from DOM). Save.
8. Capture the POST body same way.
9. Restore and save.

Findings to record:
- Does `isCorporate` appear in either payload? With what values?
- Endpoint names for both saves (exact URLs).
- If flag missing entirely — that's a finding (Jira claim refuted or flag is server-side only).

### Probe 2 — Column count on live history table

Question: does loc 1145's Location Settings History table actually render 8 date-offset columns (Prep, Return, Set, Strike, Pickup, Delivery, Load In, Load Out), or 6 (our catalog + Jira ticket 5 spec)?

Steps:
1. On loc 1145, navigate to Location Settings History tab.
2. Horizontally scroll the table end-to-end. Take a screenshot of each viewport segment.
3. Read all column headers via `document.querySelectorAll('thead th').forEach(t => console.log(t.innerText))` (Claude in Chrome javascript_tool).
4. Record the ordered column list with exact header text.
5. Diff against our 42-col catalog column list (see context load).

Findings to record:
- Exact live column count.
- Any columns present in live DOM that are absent from our catalog (candidates: Load In / Load Out offsets).
- Any columns in our catalog that are absent in live DOM.

### Probe 3 — ECT NOT-TRACKED reproduction on loc 1145

Question: our BUG-LOC-ECT-001 / BUG-LOS-ECT-A evidence was captured on 1604. Does the same NOT-TRACKED behavior reproduce on Jira-validated loc 1145, or is it 1604-specific data?

Steps:
1. On loc 1145 → Local Office Settings → ECT Settings tab.
2. Read current Benefits Multiplier (BM) and Historical Subrental % (HS) values. Record.
3. Read top row (r0) of the 42-col history table. Record timestamp + pagination count.
4. Edit BM to a distinctive value (e.g., current+5%). Click Fixed Costs Save. Wait for Save button disabled (LR-026).
5. Force hard reload. Re-read BM — did it persist? (LR-033 persistence check.)
6. Re-read r0 of history + pagination count. Diff against step 3.
7. Edit BM back to original. Save. Verify restored.

Findings to record:
- Did BM persist on 1145 after save+reload? (Silent write-failure check from BUG-LOC-ECT-001.)
- Did a new history row appear? (NOT-TRACKED reproduction check.)
- If BM persists AND history row appears on 1145, but neither on 1604 → 1604 is corrupt data; bug is partial.
- If neither persists nor tracks on 1145 → BUG-LOC-ECT-001 is framework-wide; strengthen the bug in SP-E-LO.

### Probe 4 — 90-day rolling window

Question: is the history actually limited to the rolling 90-day window claimed by Jira ticket 2?

Steps:
1. On loc 1145 → Location Settings History. Paginate to the LAST page.
2. Read the timestamp on the oldest (bottom) row.
3. Compute delta from today (2026-04-21 or current date at execution).
4. Repeat on loc 1186 → Location Management History.

Findings to record:
- Oldest row timestamp on each surface.
- Delta in days from today.
- If oldest is <90 days → window claim plausible but unproven (we'd need saves >90 days old to exist and be missing — which requires seeding, out of scope here).
- If oldest is >90 days → window claim is REFUTED (data older than the rolling window is present).

### Probe 5 — Endpoint name verification

Question: does the UI actually hit `GET /api/Location/GetLocCorpHistoryRolling90Days` as Jira ticket 2 claims, or a different endpoint?

Steps:
1. On loc 1186 (corporate scope), clear Network tab.
2. Reload the Location Management History tab (or click away and back).
3. Capture the GET request(s) that fetch history data.
4. Record the exact URL(s), query params, and response shape (first record).
5. Repeat on loc 1145 → Location Settings History (this one should be non-corporate — different endpoint expected per Jira ticket 4's Cosmos container design).

Findings to record:
- Exact GET URL for corporate history fetch.
- Exact GET URL for non-corporate history fetch.
- Whether either matches `GetLocCorpHistoryRolling90Days`.
- Response record shape — does it include timestamp, changedBy, changeType, fieldName, previousValue, newValue per Jira ticket 2?

---

## Findings

Executed 2026-04-22 by HUNTER (Opus 4.7, Claude in Chrome per LR-038). Tab 1279543486 used for loc 1186 (Location Settings, corporate), tab 1279543487 used for loc 1145 (Local Office Settings, non-corporate). All saves persisted via the real dialog-gated flow; no fabrication.

| Probe | Claim | Result | Evidence | Downstream action |
|-------|-------|--------|----------|-------------------|
| 1 | `isCorporate` flag exists on POST | **MIXED** — REFUTED on save PUTs; CONFIRMED on history fetch POST | **Saves, `isCorporate` ABSENT:** Local Office save (loc 1145 Phone 2): `PUT /navigator/api/location/navigator-settings` status 200, 59 data keys, `"phone1":"214-368-0400","phone2":"214-691-3157"` — no isCorporate anywhere. Location Settings save (loc 1186 isUnion): `PUT /navigator/api/location/update-properties` status 200, top-level keys include `corporateOffice:false` + `isCorporatePricingEnabled:true` but NO `isCorporate` discriminator. **History fetch, `isCorporate` REQUIRED:** `POST /navigator/api/location/get-location-setting-history` body `{locationNo:"1145", isCorporate:false}` → 36493 bytes (2 history records); same endpoint with `{..., isCorporate:true}` → 53 bytes (empty). Validates Jira ticket 4 Cosmos single-container + flag design at the fetch layer — flag is NOT a save-side thing; it's a Cosmos partition filter. | **SP-C1/C2**: per-column TCs should assert history POST body includes `isCorporate:false` for Local Office and `isCorporate:true` for Location Settings. Do NOT try to assert isCorporate on save PUTs — it's not there. **SP-E-LO / SP-B-LO-R**: add `isCorporate` handling to catalog's endpoint section. |
| 2 | 8 date-offset columns on live DOM (Jira screenshot showed Load In + Load Out) | **REFUTED** | Loc 1145 → Location Settings History tab rendered **exactly 42 columns** byte-for-byte matching `hist-root-map-local-office-basic-info.md` 42-col catalog. Headers (in order): Local Office, Prep Date Offset, Return Date Offset, Set Date Offset, Strike Date Offset, Pickup Date Offset, Delivery Date Offset, Use Fulfillment, Use Availability, Use Equipment QC, Print Desc, Use Subrent, Phone1, Phone2, Use Sect., Section Name, Sect. Action, Logo Name, Use On Quote, Use On Rental, Service Type - Exempt, ST Action, Action, Notes, Marriott PMS Account Enabled, Default Job to 1 day for Event Orders, Default Job to 1 day for Outside Orders, Default Job to 1 day for Internal Orders, Default Labor to Hourly, Allow tentative and confirmed Status to have the same priority, Items Filled from Requests Return to Availability, Default Order Type, Regular Hours, Regular Hours Multiplier, Over Time Hours, OverTime Hours Multiplier, Double Time Hours, DoubleTime Hours Multiplier, Holiday Multiplier, Recalc Labor Hours, Modified By, Modified On. NO `Load In Date Offset` or `Load Out Date Offset` columns present — only 6 date offsets (Prep / Return / Set / Strike / Pickup / Delivery). Jira screenshot was stale or screenshotted a different surface. | **SP-B-LO-R**: no catalog extension needed; 42-col schema stands. **SP-C1/C2**: proceed with 6-date-offset assertions as catalog already says. Mark Jira ticket 5 screenshot as stale in any future reconciliation. |
| 3 | ECT NOT-TRACKED reproduces on 1145 | **SPLIT VERDICT** — class-level NOT-TRACKED CONFIRMED on 1145; field-level silent-write (BUG-LOC-ECT-001) REFUTED on 1145 | **NOT-TRACKED (class-level) confirmed on 1145:** pre-save history had 2 rows (07:50:17 + 07:48:35 — both my Phone 2 probes). BM changed 20.0% → 25.0%, Fixed Costs Save clicked, toast "ECT values saved" appeared, save button disabled (save completed). Hard-reload, re-read history: **still 2 rows, identical timestamps** (07:50:17 + 07:48:35). ECT save produced ZERO new history rows on 1145 — matches BUG-LOS-ECT-A / BUG-LOC-ECT-001 class-level finding framework-wide. **BM silent-write-failure (field-level) REFUTED on 1145:** post-save BM displayed 25.0%; hard-reload re-read BM = **25.0%** (PERSISTED, not reverted). Unlike 1604 where BM silently reverts to 0.0% after save, on 1145 the server actually stores the value. The BUG-LOC-ECT-001 silent-write-failure is 1604-data-specific, not framework-wide. **Side-effect**: 1145's BM is now 25.0% (up from 20.0% baseline). Restore attempt failed — Angular FormControl on the ECT BM input refused to dirty via any driver pattern in-session; follow-up chip spawned. | **SP-E-LO**: strengthen BUG-LOC-ECT-001 with a new "Scope" section: class-level NOT-TRACKED reproduces on 1145 + 1604 (framework-wide); field-level BM silent-write appears 1604-specific (not reproduced on 1145 in this probe). Keep BUG open but narrow severity of the field-level part. **SP-C1/C2**: no change needed (ECT TCs already deferred behind BUG-LOC-ECT-001). **Outside scope**: 1145 BM drift 20.0% → 25.0% (need one manual restore cycle, not a framework problem). |
| 4 | 90-day rolling window is enforced | **INCONCLUSIVE** — insufficient history data on both Jira-validated locs | Loc 1145 Location Settings History: 2 rows, oldest timestamp `04/22/2026 07:48:35 AM` (same day as execution — 0 days old). Loc 1186 Location Management History: 1 row, timestamp `04/22/2026 07:53:47 AM` (same day — 0 days old). Both locs have near-empty history with no data older than today; can't prove the window is enforced (no rows at day-80/day-91 to test boundary) nor refute it (no rows at day-100+ that would escape a 90-day filter). | **SP-C1/C2**: do NOT add window-aware assertions until a location with real 100+ day history is identified. Window claim is a future-SP-F probe, not blocking anything here. **SP-E-LO / SP-B-LO-R**: note in catalog that 1145 + 1186 are too fresh for window testing. |
| 5 | Endpoint is `GetLocCorpHistoryRolling90Days` | **REFUTED** (name wrong) / **single-endpoint design CONFIRMED** | Real endpoint observed on both locs: `POST /navigator/api/location/get-location-setting-history` (same path for 1186 corporate + 1145 non-corporate). Returns status 200 with body shape `{success: true, data: {history: [...31-key records...], totalCount: N}}`. History record keys include `id, locationId, locationNo, locationName, primaryLocationNo, billToAddress, physicalAddress, regionId, countryId, lineOfBusinessId, appConfigId, contact, financial, operations, billing, pricing, features, navigator, metaData, currencySetting, defaultInventoryLocationNo, isWarehouse, notes, legals, autoAddOnSettings, updatedBy, updatedAt, locSettingAction, stAction`. Record is the full location snapshot at save time (not a diff). NO `changeType` / `fieldName` / `previousValue` / `newValue` per Jira ticket 2 claim — the whole location document is the audit record. `GetLocCorpHistoryRolling90Days` name is **not visible at the browser layer** (may still exist as an internal REST call from the Next.js Server Action to the backend, but that's server-to-server). | **SP-E-LO**: cite `POST /navigator/api/location/get-location-setting-history` + `{locationNo, isCorporate}` body shape in bug reports (not Jira's claimed name). **SP-C1/C2**: assert the real endpoint + request shape, not `GetLocCorpHistoryRolling90Days`. **Jira ticket 2 refinement**: its `changeType/fieldName/previousValue/newValue` shape is NOT what comes back at this layer; whoever wrote ticket 2 may have been describing a different response view. |

---

## Verification that this subplan did its job

Before moving this file to `plans/done/`:

1. All 5 probes have a row in the Findings table with a definitive verdict (CONFIRMED / REFUTED / INCONCLUSIVE + evidence). No blanks.
2. Zero catalog files (hist-root-map-*.md) were modified.
3. Zero bug JSON files in reports/bugs/ were modified.
4. Zero test-case markdown files in clients/encore/specs_planning/test-cases/ were modified.
5. A one-paragraph summary is posted to chat (per `feedback_handoff_in_chat_only.md`) listing which Jira claims absorbed, which discarded, and which need a re-probe.
6. `npm run validate:activity-log:preflight` passes.
