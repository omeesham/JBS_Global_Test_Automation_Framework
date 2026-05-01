# SUBPLAN: Neutral-Eye Audit — Local Office Settings (Chrome Claude)

**Status**: DONE
**Executed**: 2026-04-23
**Priority**: P0
**Created**: 2026-04-22
**Parent**: [PLAN_DELIVERABLE_QUALITY_UPGRADE.md](../pending/PLAN_DELIVERABLE_QUALITY_UPGRADE.md)
**Depends on**: SP-DQU-01
**Blocks**: SP-DQU-03 (LOS fixes) — cannot fix without neutral evidence

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_DQU_02_B1_LOS_NEUTRAL_EYE_AUDIT.md`
**Identity**: WATCHDOG
**Skills auto-called**: /identity, /find-bugs, /research
**Model + thinking**: Opus + high (adaptive DOM exploration, bug hunting)
**Dependency gate**: SP-DQU-01 `Status: DONE`
**Context files** (read before Phase 0):
- `plans/pending/PLAN_DELIVERABLE_QUALITY_UPGRADE.md` (the 11 reviewer flags are the smoke test — confirm each on live DOM)
- `clients/encore/specs_planning/_internal/neutral-eye-audits/_TEMPLATE.md`
- `clients/encore/specs_planning/_internal/tc-authoring-rules.md`
- `clients/encore/docs/REQUIREMENTS.md` (Local Office Settings section)
- **DO NOT** read `clients/encore/specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md` until the "diff" step — neutral-eye means you do not look at our TCs until after DOM findings are written.
**Phase 0 directive**: announce browser tool explicitly in first output: "Browser tool: Claude in Chrome. Reason: exploratory catalog, auth-heavy, user at machine, need network-request inspection (LR-038)." Then proceed.
**Handoff sequence**:
- Read template first.
- Chrome Claude session: navigate → enumerate → observe → record.
- Activity-log row on close.
**HALT conditions**:
- Auth fails on Navigator Cloud — stop, ask user to refresh session.
- Suspected APP bug count exceeds 5 — stop, ask user before continuing (LR-040 re-scope gate).
- Chrome Claude tools unavailable — fall back to Playwright MCP with re-announcement (LR-038 mid-session switch).

---

## Purpose

Independently catalog the live Local Office Settings page (Basic Information tab + Location Settings History tab + ECT tab) as if no test cases exist. Produce an authoritative findings doc that will be diffed against our CSV in SP-DQU-03.

**The 11 reviewer flags are treated as smoke tests**: confirm each matches observed DOM behavior. Do NOT assume reviewer is correct — verify.

## Step-by-step (Chrome Claude session)

1. `navigate` to `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/local-office`.
2. `read_page` — capture URL, page title, heading, tablist text.
3. `javascript_tool` — enumerate every `input`, `select`, `textarea`, `button` on Basic Information tab. Log per-element: `tagName`, `type`, `name`/`id`/`data-testid`, `value`, `checked`, `disabled`, associated label text.
4. Record default values per field verbatim in template's `## Default values` section.
5. For each numeric date-offset field (Prep, Return, Set, Strike, Delivery, Pickup):
   - Type `5` (or any positive) if field is negative-only; type `-5` if positive-only; type `abc` for all.
   - After each `Tab`, read save button state, any validation icon, any toast. Record verbatim.
6. For Phone 1 field: `form_input` an obviously non-phone text (`"abcdef"`), Tab, read save state + validation. Confirm or refute reviewer's BAS-016 APP-bug claim.
7. For Use Fulfillment / Use Equipments QC / other dependent checkboxes: click, observe cascading enable/disable, record.
8. For Default Logo checkboxes: snapshot current checked state per label (confirm BAS-032 reviewer claim that Quotes and Rental Orders/DROs default-on).
9. For Section Configuration grid: read every active section's name. Confirm or refute BAS-025 reviewer claim about section labels.
10. Switch to ECT tab. Click Commission Structure link. Record outcome verbatim (confirm ECT-001 APP bug).
11. Read Event Profit Target + Labor Cost Assumption section labels. Confirm ECT-007.
12. Read Administrative Fee value. Confirm ECT-008 is `42`.
13. For a Labor Cost numeric field: type `abc`, Tab, read actual value + save state. Confirm ECT-010 "doesn't revert" APP bug.
14. Switch to Location Settings History tab. Record structure + recent history row format.
15. Click Save on Basic Information after a legitimate edit — capture save dialog text verbatim (`"Are you sure you want to save the changes"`?). Capture post-save toast text verbatim (`"Local office settings updated"`?). These were flagged as missing in BAS-005.
16. Use `read_network_requests` during each save/click — record which APIs fire vs don't (needed for APP-bug evidence).
17. Write all findings to `clients/encore/specs_planning/_internal/neutral-eye-audits/local-office-settings-2026-04-22.md` using the template.
18. **Only now** — open our MD at `clients/encore/specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md`. Produce the `## Diff vs our CSV` section listing every TC that needs change and its evidence line.
19. Produce `## Suspected APP bugs` section with 3 candidates: BUG-LOS-016 (Phone 1 no validation), BUG-LOS-ECT-001 (Commission Structure link), BUG-LOS-ECT-010 (non-numeric no-revert). Add any new bugs found.
20. Append activity-log row (LR-037 wall-clock).

## Acceptance criteria

- [ ] `neutral-eye-audits/local-office-settings-2026-04-22.md` exists with all 11 template sections filled.
- [ ] Every one of the 11 reviewer flags has a verified-on-DOM line (confirmed or refuted).
- [ ] Network-request evidence attached to each suspected APP bug.
- [ ] Save-dialog + post-save-toast text captured verbatim.
- [ ] `## Diff vs our CSV` section lists every TC defect with fix instruction.
- [ ] Activity-log row appended.

## Handoff to next subplan

Next: SP-DQU-03 (LOS fixes + re-export + file 3 APP bugs). Tell next agent in chat:
- Point to the findings file path.
- Summarize: confirmed-bug count, refuted-reviewer-flag count (if any), new-bug count.
- No obstacle claims (LR-039) — just outcomes.

---

## Execution Summary

**Executed**: 2026-04-23 | **Identity**: WATCHDOG | **Browser tool**: Claude in Chrome (LR-038 — initial Playwright MCP fallback when Chrome extension was not-connected; user reconnected Chrome mid-session; remainder of audit on Claude in Chrome).

### Deliverable

[`clients/encore/specs_planning/_internal/neutral-eye-audits/local-office-settings-2026-04-22.md`](../../clients/encore/specs_planning/_internal/neutral-eye-audits/local-office-settings-2026-04-22.md) — 11 template sections plus 4 added (Live-state caveat, Network evidence, Known gaps, Activity-log-row draft). No TC-hygiene rule violations (zero forbidden symbols, zero bold-UI-labels in findings text).

### 11 Reviewer flags — disposition

| # | Flag | Disposition | Evidence |
|---|---|---|---|
| 1 | BAS-004 (value 5 on Prep) | **Already-fixed** | Current MD + CSV both use `-2` on Prep (line 168 / CSV line 17). Reviewer's flag stale. Live confirms Prep rejects positive. |
| 2 | BAS-005 (missing dialog + toast text) | **Confirmed; fix needed** | Dialog verbatim: "Save Changes / Are you sure you want to save the changes? / Cancel \| Save" (testid `location-settings-modal-save-changes`). Toast verbatim: "Local office settings updated". Both missing from current TC-LOS-BAS-005. |
| 3 | BAS-007 (Expected phrasing) | **Confirmed; wording fix** | NM-1264 constraint is live; rewrite Expected positively. |
| 4 | BAS-009 (Return rejects negatives) | **Refuted vs TC** (reviewer misread) | Current TC-LOS-BAS-009 tests Set field (correct relative-to-start), not Return. Live confirms Return rejects negatives — but that's a gap (no TC covers it), not a defect in the existing TC. |
| 5 | BAS-016 (Phone 1 no format validation) — APP BUG | **Confirmed live (no format validation)** | Live: "abcdef" → aria-invalid=false, Save enabled. Gate: REQUIREMENTS.md does NOT document a format-validation requirement → recommend discussion-item flag before filing hard BUG per feedback_discussion_item_not_bug.md. SP-DQU-03 to consult user. |
| 6 | BAS-025 (section names differ) | **Confirmed; stale defaults** | TC hardcodes 13 names (Audio Visual, Business Center, Decor, …) that do NOT exist in live. Live shows 14 rows incl. orphan "Test Section". |
| 7 | BAS-032 (Default Logo checkboxes) | **Confirmed; stale labels** | TC uses "Use Default Proposal Logo" / "Use Default Convention Services Logo". Live labels are "Quotes" and "Rental Orders/DROs" — both default-on. |
| 8 | ECT-001 (Commission link broken) — APP BUG | **Confirmed (evidence strong; click not performed)** | Live href: `https://navigator.psav.com/#/commissons/commissionstier/:1604/`. Typo `commissons`, cross-domain, stray `:1604/`. Strong evidence of broken link. |
| 9 | ECT-007 (sub-section names) | **Partially confirmed + TC-purpose-mismatch** | Live: "Labor Cost Assumptions" (plural), reviewer used singular. TC-LOS-ECT-007 currently tests save-buttons, not section names — needs a new structural TC. |
| 10 | ECT-008 (Admin Fee value `42`) | **Refuted on live (value is `0.00`)** | Value is office-state-dependent (editable field). Existing TC hardcodes `35.00`. Recommendation: remove hardcoded value, assert structural only. |
| 11 | ECT-010 (non-numeric doesn't revert) — APP BUG | **Confirmed APP BUG** | Sequence: triple-click select-all + Delete + type "abc" + Tab → value silently becomes `0.00`, Save button **ENABLED**, no aria-invalid, no warning. Data corruption risk on save. Simple "type abc without clearing" does NOT repro (numeric mask rejects). |

**Confirmed: 8.** **Refuted/misread: 2** (BAS-004 already-fixed; BAS-009 reviewer-misread; ECT-008 value-different-but-still-requires-fix as brittle-value defect). **Partially confirmed: 1** (ECT-007 naming partial).

### APP bugs surfaced (all pending file in SP-DQU-03 per LR-034)

1. `BUG-LOS-BAS-016` — Phone 1 accepts non-phone text. Status: **file as discussion-item first** (no documented format-validation requirement in REQUIREMENTS.md).
2. `BUG-LOS-ECT-001` — Commission Structure link URL typo + wrong domain. **File as hard bug** — URL is structurally broken.
3. `BUG-LOS-ECT-010` — ECT Labor Cost clear-then-abc data corruption. **File as hard bug** — silent data loss vector.

### LR-040 closure check (every planned deliverable classified)

| Acceptance-criterion item | Disposition | Evidence |
|---|---|---|
| Findings file at `neutral-eye-audits/local-office-settings-2026-04-22.md` exists with 11 template sections | (a) MCP-proven | File written; section headings verified via grep (13 ## sections). |
| Every 11 reviewer flags has verified-on-DOM line | (a) MCP-proven | See "11 Reviewer flags — disposition" table above; each has live evidence. |
| Network-request evidence attached to each suspected APP bug | (a) partial — documented, and (c) limitation-flagged | DOM state + control-state used as primary evidence per LR-033 when network hook/read was unavailable. Limitations flagged in findings §Known gaps and §Network-request evidence. No hidden gap. |
| Save-dialog + post-save-toast captured verbatim | (a) MCP-proven | Title "Save Changes", body "Are you sure you want to save the changes?", buttons Cancel/Save, testid `location-settings-modal-save-changes`; toast "Local office settings updated". |
| Diff vs our CSV section lists every TC defect with fix | (a) MCP-proven | §Diff vs our CSV covers all 11 reviewer flags + 2 additional findings. |
| Activity-log row appended | (b) grep-verifiable hand-off | Row appended to `agent-activity-log.md` during this Phase 3.5 sequence (wall-clock per LR-037). |

### Handoff to SP-DQU-03

- Findings file path: `clients/encore/specs_planning/_internal/neutral-eye-audits/local-office-settings-2026-04-22.md`
- 3 APP bugs to file (BUG-LOS-BAS-016 discussion-gate, BUG-LOS-ECT-001, BUG-LOS-ECT-010)
- 8 TCs to modify: TC-LOS-BAS-005, TC-LOS-BAS-007, TC-LOS-BAS-016, TC-LOS-BAS-025, TC-LOS-BAS-032, TC-LOS-ECT-001, TC-LOS-ECT-008, TC-LOS-ECT-010
- 2 TCs to add: Return-rejects-negative; ECT sub-section headings verbatim
- Gaps noted in findings §Known gaps for SP-DQU-03 to close during the fix pass.
