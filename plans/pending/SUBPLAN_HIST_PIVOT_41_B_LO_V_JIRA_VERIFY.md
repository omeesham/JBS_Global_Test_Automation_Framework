> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute <this-filename>`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: load `/identity` per the `**Identity**` field below.
> 2. **Skills**: load every skill in `**Skills**` field below (the leading skill auto-calls its chain).
> 3. **Model + thinking tier**: Opus + think hard. This session is pure live DOM verification — five independent probes, no catalog mutations until findings are in. Bump to ultrathink only for Probe 3 (ECT NOT-TRACKED reproduction) since the finding changes downstream bug severity.
> 4. **Dependency gate**: SP-B-LO-1, SP-B-LO-1b, SP-B-LO-2, SP-B-LO-2b must all be DONE in `plans/done/`. If any is pending → HALT + report to user.
> 5. **Context load**: read `C:/Users/rutvi/.claude/plans/this-jira-desc-for-noble-map.md` (Jira findings doc — source of the 5 probes) + `clients/encore/specs_planning/catalogs/hist-root-map-local-office-basic-info.md` (42-col baseline to diff against) + `reports/bugs/BUG-LOC-ECT-001.json` (existing bug to possibly strengthen).
> 5.5 **Browser tool selection (LR-038)**: Claude in Chrome, mandatory. Reason: exploratory verification on two fresh locations (1145, 1186), auth-heavy SSO, need `read_network_requests` to capture POST payloads + endpoint names, and user is at the machine. Do NOT use Playwright MCP `browser_snapshot` (token cost kills 5-probe iteration).
> 6. **Phase 0 FIRST**: announce browser tool choice per LR-038 before first browser call. Then execute probes in order.
> 7. **Execute Phases 1–5** (one phase per probe) per Step-by-Step in order. Each probe is independent — if one fails or is inconclusive, record it and move on; do NOT block downstream probes.
> 8. **Handoff**: on completion, write a findings section at the bottom of this file (not a separate doc — chat output for the summary per `feedback_handoff_in_chat_only.md`). Set Status: DONE + Executed date. Append activity-log row (LR-028 + LR-037 wall-clock ≥ mtime). `git mv` to `plans/done/`. Run `npm run plans:reindex`. One bounded commit per LR-027.
>
> **HALT + ASK USER** if:
> - Any dependency (SP-B-LO-1/1b/2/2b) is not DONE.
> - Loc 1145 or 1186 cannot be opened (permission, data error, 403/404) — this is itself a finding; do NOT fabricate data on 1604 as a substitute.
> - Any probe produces a result that overturns an existing catalog finding — the catalog is frozen; write it up and escalate, do NOT edit catalogs in this subplan.

---

# SUBPLAN SP-B-LO-V: MCP Live Verification — Jira Claims vs Our Catalog

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2.5 (Verification gate — sits between Discovery and Reconciliation)
**Status**: PENDING
**Executed**: —
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

(Fill this section on execution. Template below.)

| Probe | Claim | Result | Evidence | Downstream action |
|-------|-------|--------|----------|-------------------|
| 1 | `isCorporate` flag exists on POST | CONFIRMED / REFUTED / INCONCLUSIVE | (paste exact payload snippet) | Absorb into SP-C1/C2 / discard / re-probe |
| 2 | 8 date-offset columns on live DOM | CONFIRMED / REFUTED / INCONCLUSIVE | (paste column list) | Extend catalog in SP-B-LO-R / no action / re-probe |
| 3 | ECT NOT-TRACKED reproduces on 1145 | CONFIRMED / REFUTED / INCONCLUSIVE | (BM before/after, history row diff) | Strengthen BUG in SP-E-LO / demote to 1604-specific / re-probe |
| 4 | 90-day rolling window is enforced | CONFIRMED / REFUTED / INCONCLUSIVE | (oldest row timestamps) | Add window-aware assertions to SP-C1/C2 / discard / re-probe |
| 5 | Endpoint is `GetLocCorpHistoryRolling90Days` | CONFIRMED / REFUTED / INCONCLUSIVE | (exact URLs) | Cite endpoint in SP-E-LO bug reports / discard / re-probe |

---

## Verification that this subplan did its job

Before moving this file to `plans/done/`:

1. All 5 probes have a row in the Findings table with a definitive verdict (CONFIRMED / REFUTED / INCONCLUSIVE + evidence). No blanks.
2. Zero catalog files (hist-root-map-*.md) were modified.
3. Zero bug JSON files in reports/bugs/ were modified.
4. Zero test-case markdown files in clients/encore/specs_planning/test-cases/ were modified.
5. A one-paragraph summary is posted to chat (per `feedback_handoff_in_chat_only.md`) listing which Jira claims absorbed, which discarded, and which need a re-probe.
6. `npm run validate:activity-log:preflight` passes.
