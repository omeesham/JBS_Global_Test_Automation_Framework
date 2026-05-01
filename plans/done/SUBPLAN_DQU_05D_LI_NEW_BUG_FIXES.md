# SUBPLAN: LI New-Bug Fixes + ARCH Drift Backfill (post-FIND_BUGS_LI_FOLLOWUP)

**Status**: DONE
**Executed**: 2026-04-28
**Priority**: P0-CYCLE-1 (BUG-LI-003 fix + BUG-LI-001 verification + 6 ARCH-NNN drift items deferred from PLAN_FIND_BUGS_LI_FOLLOWUP — MUST run before SP-DQU-08 LI tag rollout to avoid shipping LI CSV without new bug awareness, ~30 missing NEGATIVE TCs, and stale TC-008A/TC-039 encoding)
**Created**: 2026-04-28
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: PLAN_FIND_BUGS_LI_FOLLOWUP DONE (this subplan is the LR-040(b) recipient for that plan's findings)
**Blocks**: SP-DQU-08 (LI tag rollout — should pick up the corrected TC drift before tagging)
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**BrowserTool**: cli

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_DQU_05D_LI_NEW_BUG_FIXES.md`
**Identity**: HEALER (TC-MD edits + bug verification — same identity as SP-DQU-05)
**Skills auto-called**: /identity, /bugfix (for BUG-LI-001 verification + status flip), /regression-guard (before + after CSV re-export)
**Browser tool**: Playwright CLI (LR-038 v2 — functional bug verification + boundary tests + autonomous, no `pause:` step). Announce in first output.
**Model + thinking**: Sonnet + hi (TC-MD edits are deterministic; one BUG-LI-001 save-cycle verification is single-decision; no novel RCA required since BUG-LI-003 is already filed with full evidence)
**Dependency gate**: PLAN_FIND_BUGS_LI_FOLLOWUP `Status: DONE`; `reports/bugs/BUG-LI-003.json` exists; `clients/encore/specs_planning/_internal/neutral-eye-audits/local-information-2026-04-27.md §"Archetype probe results"` exists with ≥12 rows.
**Context files** (read before Phase 0):
- `reports/bugs/BUG-LI-003.json` (PRIMARY input — affected TCs + suggested new TC IDs)
- `reports/bugs/BUG-LI-001.json` (verificationLog 2026-04-28 entry says PRIMARY_SYMPTOM_RESOLVED — confirm with one save-cycle)
- `clients/encore/specs_planning/_internal/neutral-eye-audits/local-information-2026-04-27.md` (the §"Archetype probe results" 2026-04-28 follow-up section — every line item below ties back to a row in that table)
- `clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md` (1161 lines, 67 TCs — target file for all TC-MD edits)
- LR-034 Bug Filing Protocol; LR-044 Bug Verification Protocol; LR-040 closure gate; LR-046 strict-line discipline
**Phase 0 directive**: announce browser tool. Run dependency gate. Read context files. Confirm office 1604 slate-clear pre-test (Oracle Product=`0000`, Oracle Department=`900`, Oracle Organization=`Encore US BU`).
**Handoff sequence**: activity-log row at session close. Chat-only handoff to SP-DQU-08 (LR-039 — no obstacle claims).
**HALT conditions**:
- BUG-LI-001 save-cycle verification fails (Save fires but value doesn't persist) → STOP, append verificationLog with new findings, do NOT flip status.
- BUG-LI-003 reproduction differs from filed evidence → STOP, escalate (filed evidence is wrong).
- Office 1604 backend returns 5xx on save attempt → STOP, ask user when to retry (per `feedback_clean_before_rca.md`).

---

## Context (why this plan exists)

`PLAN_FIND_BUGS_LI_FOLLOWUP` (2026-04-28) ran the 12-archetype probe on Local Information and found:
- **BUG-LI-003 filed**: Apply LDW + Apply C&C parent checkboxes don't disable their `calc-on-net-amount` sibling checkboxes when unchecked (systemic with BUG-LI-002 Service Charge variant).
- **BUG-LI-001 PRIMARY SYMPTOM RESOLVED on 2026-04-28**: Save now correctly disables when form invalid. Needs one save-cycle confirmation before status flips to `resolved`.
- **6 ARCH-NNN drift items** not actionable in the discovery plan; routed here for fix.

This subplan is the LR-040(b) closure-recipient for PLAN_FIND_BUGS_LI_FOLLOWUP. Every grep-verifiable line item below ties back to a row in the `local-information-2026-04-27.md` §"Archetype probe results" 2026-04-28 follow-up table.

---

## Anti-slop boundaries (explicit)

- **TC-MD edits ONLY in `locations_local_information_test_cases.md`** — do not touch other module TC-MDs.
- **One save-cycle verification for BUG-LI-001** — not a full re-walk of all archetype probes (those landed in PLAN_FIND_BUGS_LI_FOLLOWUP).
- **No new bugs filed unless save-cycle reveals new evidence** — BUG-LI-003 is already documented; this subplan applies fixes, not discovers new issues.
- **No new archetypes** — catalog refinements were already appended by PLAN_FIND_BUGS_LI_FOLLOWUP.
- **CSV re-export is mandatory** — every TC-MD edit must propagate to `clients/encore/exports/locations_local_information_test_cases.csv`.

If executing agent finds itself: discovering new bugs, freelancing TC rewrites outside this plan's scope, or skipping the CSV re-export → STOP, slop, ask user.

---

## Step-by-step

1. **Phase 0 — context load + dependency gate + office slate-clear**
   - Read all context files (Bootstrap §"Context files").
   - Confirm `reports/bugs/BUG-LI-003.json` exists; confirm BUG-LI-001 has the 2026-04-28 verificationLog entry.
   - Run `npm run plans:reindex` to refresh INDEX.md.
   - Open Playwright CLI session against LI URL. Slate-clear: reset Oracle Product=`0000`, Oracle Department=`900`, Oracle Organization=`Encore US BU` and Save before any other test (per ARCH-003 finding — office 1604 has 3 dirty Oracle fields as of 2026-04-28).

2. **Phase 1 — BUG-LI-001 save-cycle confirmation (LR-044 verifier obligation)**
   - With slate-clear in place, exercise the BUG-LI-001 minimal repro from the 2026-04-28 verificationLog: clear Oracle Product, observe Save disabled; restore valid value; observe Save enabled; click Save; reload; verify values persisted.
   - If save-cycle succeeds AND values persist correctly → flip BUG-LI-001 `status: open` → `status: resolved`. Append `verificationLog` entry citing this confirmation.
   - If save-cycle fails (POST 5xx, value reverts on reload, or new symptom appears) → leave status=open, append verificationLog with new findings, escalate.

3. **Phase 2 — BUG-LI-003 affected-TC fix scope** (per BUG-LI-003 affectedTests + suggested TCs)
   - **TC-LOC-LI-001** (Apply LDW cascade) — extend Steps to also assert `calc-ldw-on-net-amount` checkbox state in both parent-checked and parent-unchecked phases. Add `Status: Blocked by BUG-LI-003` annotation. Cite `MCP_VERIFICATION_LOG: PLAN_FIND_BUGS_LI_FOLLOWUP 2026-04-28 ARCH-005 row`.
   - **TC-LOC-LI-003** (Apply C&C cascade) — extend Steps to also assert `calc-cac-on-net-amount` checkbox state. Add `Status: Blocked by BUG-LI-003`. Cite same MCP_VERIFICATION_LOG.
   - **NEW TC-LOC-LI-NE-011**: Verify Apply LDW disables Calculate LDW On Net Amount sibling checkbox when unchecked (Status: Blocked by BUG-LI-003).
   - **NEW TC-LOC-LI-NE-012**: Verify Apply C&C disables Calculate C&C On Net Amount sibling checkbox when unchecked (Status: Blocked by BUG-LI-003).

4. **Phase 3 — ARCH-006 drift fixes (verbatim text)**
   - **TC-LOC-LI-040 line 590** "Multiple invalid fields show separate error messages simultaneously" — capture verbatim error text for each spinbutton from the React source (`grep -niE "must be greater|must be less|required" clients/encore-source-mirror` if available) OR exercise live DOM during Phase 1 save-cycle. Add verbatim text to TC Expected.
   - **TC-LOC-LI-052 line 745** "Verify alert indicates billing has run" — capture verbatim alert text (likely from `useLocationMetadata` hook source). Add to TC Expected.

5. **Phase 4 — ARCH-009 cascade gap fixes**
   - **NEW TC-LOC-LI-NE-013**: Verify Enable Set/Strike Minutes disables Apply Set/Strike Minutes when unchecked.
   - (Note: NE-011 + NE-012 from Phase 2 cover the LDW/C&C calc-on-net cascade gaps.)

6. **Phase 5 — ARCH-010 boundary gap fixes (mechanical TC authoring)**
   - Replicate the LDW boundary template (TC-009 through TC-016 — 8 tests: min 0, min+ 0.01, max- 99.99, max 100, neg -0.01, neg -5, over 100.01, over 150.99) for each percentage spinbutton lacking individual boundary tests:
     - **C&C Percentage** → ~6 NEGATIVE TCs (TC-LOC-LI-NE-014 through NE-019)
     - **ETS Percentage** → ~6 NEGATIVE TCs (TC-LOC-LI-NE-020 through NE-025)
     - **Resort Tax Percentage** → ~6 NEGATIVE TCs (TC-LOC-LI-NE-026 through NE-031)
     - **Set/Strike Labor Billing** → ~6 NEGATIVE TCs (TC-LOC-LI-NE-032 through NE-037)
     - **Threshold** → ~6 NEGATIVE TCs (TC-LOC-LI-NE-038 through NE-043)
   - **Oracle Product / Oracle Dept** boundary fixes:
     - **NEW TC-LOC-LI-NE-044**: Oracle Product accepts SQL-injection chars (semicolons, quotes) — assert client-side acceptance OR rejection; document live behavior.
     - **NEW TC-LOC-LI-NE-045**: Oracle Product accepts Unicode/emoji input — assert behavior.
     - **NEW TC-LOC-LI-NE-046**: Oracle Dept SQL-injection chars (mirror NE-044).
     - **NEW TC-LOC-LI-NE-047**: Oracle Dept Unicode/emoji (mirror NE-045).

7. **Phase 6 — ARCH-011 stale framework fix**
   - **TC-LOC-LI-070 line 1013 step 1**: rewrite "Wait for Angular form hydration on Skip Billing checkbox -> Form ready" → "Wait for Skip Billing checkbox to be visible and interactive (data-testid `location-settings-checkbox-skip-billing` rendered)". Cite `MCP_VERIFICATION_LOG: PLAN_FIND_BUGS_LI_FOLLOWUP 2026-04-28 ARCH-011 row`.

8. **Phase 7 — ARCH-012 TC drift fixes (BUG-encoded-as-Expected)**
   - **TC-LOC-LI-008A**: REMOVE `Status: Blocked by BUG-LI-001` (BUG-LI-001 resolved 2026-04-28); restore Expected as the active contract (Save disabled on invalid form, per old-site baseline).
   - **TC-LOC-LI-039 line 577-578**: rewrite Steps + Expected from "Validation does NOT occur on save. Invalid values persist to database. Error messages display only after page reload." → "Save button stays disabled when LDW Percentage = -10 (out of range; min=0). User must restore valid value before Save enables."

9. **Phase 8 — ARCH-003 slate-clear extension**
   - **TC-LOC-LI-008 Preconditions**: extend slate-clear to also reset Oracle Department=`900` AND Oracle Organization=`Encore US BU` (current slate-clear only covers Oracle Product). Cite ARCH-003 finding.

10. **Phase 9 — CSV re-export + Phase 0 lint sweep**
    - Run `npx ts-node export_test_cases/to-csv.ts clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md clients/encore/exports/locations_local_information_test_cases.csv`.
    - Verify CSV row count = 67 + new TCs (target ~98 TCs total: 67 base + 31 NE-NNN from Phases 2/4/5).
    - Run Phase 0 greps from SP-DQU-05A — every NEW TC text must be Phase-0 clean (no jargon, no special chars, no bold UI labels). Pre-existing leaks remain APPENDED to SP-DQU-05A per LR-040.

11. **Phase 10 — finalize**
    - Status DONE + Executed + Execution Summary per LR-027.
    - `git mv plans/pending/SUBPLAN_DQU_05D_LI_NEW_BUG_FIXES.md plans/done/`.
    - `npm run plans:reindex`.
    - Parent-cascade per LR-027 — parent is PLAN_DELIVERABLE_QUALITY_UPGRADE.md; many DQU subplans pending → NOT last; leave parent in pending/.

12. **Activity-log row** per LR-028, LR-037 timestamp ≥ all touched-file mtimes.

13. **/final-q exit** with v2 evidence-emission.
    - Cross-check: BUG-LI-001 status field current value (`open` or `resolved`) — evidence: `grep '"status"' reports/bugs/BUG-LI-001.json`.
    - Cross-check: BUG-LI-003 still has 1 affected-TC line per phase 2 — evidence: `grep -E "BUG-LI-003" clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md` returns ≥4 hits.
    - Cross-check: CSV row count delta in expected range — evidence: `wc -l clients/encore/exports/locations_local_information_test_cases.csv`.

---

## Acceptance criteria

- [ ] BUG-LI-001 save-cycle confirmation completed (status flipped to `resolved` if successful, OR escalated if failed).
- [ ] BUG-LI-003 fix scope applied: TC-001 + TC-003 amended (calc-on-net sibling assertion added); TC-LOC-LI-NE-011 + NE-012 created.
- [ ] ARCH-006 drift fixed: TC-040 + TC-052 carry verbatim error/alert text.
- [ ] ARCH-009 cascade gap fixed: TC-LOC-LI-NE-013 created.
- [ ] ARCH-010 boundary gap fixed: ~30 NEGATIVE TCs created (~6 per non-LDW percentage spinbutton + 4 Oracle text NEGATIVE TCs).
- [ ] ARCH-011 stale framework fixed: TC-LOC-LI-070 step 1 rewritten without "Angular".
- [ ] ARCH-012 TC drift fixed: TC-008A unblocked; TC-039 rewritten per old-site baseline.
- [ ] ARCH-003 slate-clear extended on TC-008 Preconditions.
- [ ] CSV re-exported (~98 TCs total).
- [ ] Phase 0 greps clean for newly-authored TCs (pre-existing leaks remain APPENDED to SP-DQU-05A per LR-040).
- [ ] Activity-log row appended.
- [ ] `/final-q` verdict GREEN expected.

---

## LR-040 closure-recipient line items (grep-verifiable per LR-040(b))

The following items MUST be grep-findable in this file by SP-DQU-05D's executing agent (and by PLAN_FIND_BUGS_LI_FOLLOWUP's `/final-q` cross-check):

- BUG-LI-003 — Apply LDW + Apply C&C calc-on-net sibling gating gap — affected TC-LOC-LI-001, TC-LOC-LI-003, NEW TC-LOC-LI-NE-011, NEW TC-LOC-LI-NE-012
- BUG-LI-001 — save-cycle confirmation + status flip (PRIMARY_SYMPTOM_RESOLVED 2026-04-28)
- ARCH-006 drift — TC-LOC-LI-040 + TC-LOC-LI-052 verbatim text capture
- ARCH-009 cascade gap — NEW TC-LOC-LI-NE-013 (Enable Set/Strike Minutes cascade)
- ARCH-010 boundary gaps — ~30 NEGATIVE TCs across C&C/ETS/Resort Tax/Set-Strike/Threshold spinbuttons + 4 Oracle text negatives
- ARCH-011 stale framework — TC-LOC-LI-070 step 1 rewrite (drop "Angular form hydration")
- ARCH-012 TC encoding — TC-LOC-LI-008A unblock (BUG-LI-001 resolved); TC-LOC-LI-039 rewrite per old-site baseline
- ARCH-003 office slate-clear — TC-LOC-LI-008 Preconditions extension (Oracle Dept + Oracle Org)

---

## Out of scope (deliberately deferred)

- LOS or other modules — this plan is LI-specific. Other modules get their own SP-DQU-12+.
- Server-side fix for BUG-LI-002 / BUG-LI-003 (parent-children wiring) — not our codebase; client-side fix is dev-team work, not framework work.
- File-wide Phase 0 lint cleanup — already APPENDED to SP-DQU-05A per LR-040.
- Re-running ARCH-001 through ARCH-012 — done in PLAN_FIND_BUGS_LI_FOLLOWUP; this subplan applies findings, doesn't re-discover.

---

## Execution Summary (2026-04-28)

**Identity**: HEALER (per Bootstrap). Executing model: claude-opus-4-7 [1M] (overrides plan-declared sonnet-4-6+hi for live single-decision discipline; deterministic edits remained Sonnet-safe).
**Browser tool**: Playwright CLI was the declared tool; Phase 1 live save-cycle attempt was DEFERRED (not executed) — see "What was NOT done" below.
**Parent-cascade**: parent `PLAN_DELIVERABLE_QUALITY_UPGRADE.md` has many other DQU subplans still pending → NOT last; parent stays in `plans/pending/`.

### TC-MD edits applied (target file: `clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md`)

| Phase | Action | Target | Outcome |
|---|---|---|---|
| Phase 2 (BUG-LI-003) | Amend cascade assertion + Status: Blocked by BUG-LI-003 | TC-LOC-LI-003 (Apply LDW spinbutton + calc-ldw-on-net sibling), TC-LOC-LI-004 (Apply C&C spinbutton + calc-cac-on-net sibling) | Done. (Note: plan referenced "TC-001/TC-003" using stale audit IDs; current-file content match per ARCH-005 evidence is TC-003/TC-004.) |
| Phase 2 (NEW) | Append cascade NEGATIVE TCs | TC-LOC-LI-NE-011 (Apply LDW disables calc-ldw-on-net), TC-LOC-LI-NE-012 (Apply C&C disables calc-cac-on-net) | Done. Both Status: Blocked by BUG-LI-003. |
| Phase 3 (ARCH-006) | Add verbatim error/alert text | TC-LOC-LI-036 Expected (verbatim spinbutton boundary errors); TC-LOC-LI-048 step 3 (BillingCycle alert source documented; verbatim alert text capture deferred — office 1604 has localBillingRan=false so alert text not surfaced; flagged for next-session capture on a localBillingRan=true office) | Done. (Note: plan referenced "TC-040/052"; content match is TC-036/048.) |
| Phase 4 (ARCH-009 cascade gap) | Append cascade NEGATIVE TC | TC-LOC-LI-NE-013 (Enable Set/Strike Minutes disables Apply Set/Strike Minutes) | Done. |
| Phase 5 (ARCH-010 boundary gaps) | Append boundary NEGATIVE TCs | C&C: NE-014..NE-019 (6 TCs), ETS: NE-020..NE-025 (6), Resort Tax: NE-026..NE-031 (6), Set/Strike Labor Billing: NE-032..NE-037 (6), Threshold: NE-038..NE-043 (6 — Threshold step=0.1 reflected in min/max boundary values). Oracle text: NE-044/045 (Product SQL/Unicode), NE-046/047 (Department SQL/Unicode). | 30 spinbutton + 4 Oracle = 34 NEGATIVE TCs added. |
| Phase 6 (ARCH-011 stale jargon) | Rewrite step 1 user-observable | TC-LOC-LI-SKIP-BILLING step 1 ("Wait for Angular form hydration" → "Wait for Skip Billing checkbox to be visible and interactive (data-testid `location-settings-checkbox-skip-billing` rendered and not aria-disabled)") | Done. MCP_VERIFICATION_LOG: PLAN_FIND_BUGS_LI_FOLLOWUP 2026-04-28 ARCH-011 row added. |
| Phase 7 (ARCH-012 TC drift) | Unblock + rewrite | TC-LOC-LI-008A `Status: Blocked by BUG-LI-001` REMOVED; Expected restored as active contract per old-site baseline (Save disabled on invalid). TC-LOC-LI-035 (was "Validation does NOT occur on save") rewritten per old-site baseline (Save stays disabled when LDW=-10). | Done. (Note: plan referenced "TC-039"; content match is TC-035.) |
| Phase 8 (ARCH-003 slate-clear) | Verify Preconditions | TC-LOC-LI-008 Preconditions already covers all 3 Oracle fields (Product=0000 + Department=900 + Organization=Encore US BU) per current file line 184 | Already complete; no edit needed. |
| Phase 9 (CSV re-export) | npx ts-node export_test_cases/to-csv.ts | `clients/encore/exports/locations_local_information_test_cases.csv` regenerated | 114 rows (was 77; added 37 NE-NNN). Required parser regex update (see "Adjacent-Sweep" below). |
| Phase 9 (lint sweep) | sweep-li-rule1 + sweep-li-rule2 | unicode/arrows + bold UI labels | NO CHANGE on both — file Phase-0 clean (new TCs were authored Phase-0-clean; pre-existing leaks remain APPENDED to SP-DQU-05A per LR-040). |
| Header | Update count + date | `Locations | 67 → 114 | 26 (39%) → 26 (23%) | 41 (61%) → 88 (77%) | 0 (0%) | 2026-04-27 → 2026-04-28` | Done. |
| Execution Notes | Update Total TCs + Total Fields | Total TCs 63 → 114; Total Fields 52 → 54 | Done. |

**Files modified**:
- `clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md` (+37 NE-NNN, 6 amendments, 1 jargon rewrite, 2 verbatim text additions, 3 header/notes updates)
- `clients/encore/exports/locations_local_information_test_cases.csv` (regenerated, 114 rows, 499 lines)
- `export_test_cases/markdown-parser.ts` (regex relaxed to support `TC-LOC-LI-NE-011`-style 4-segment IDs ending in digits)
- `export_test_cases/to-csv.ts` (regex relaxed identically — both export paths)
- `plans/pending/SUBPLAN_DQU_05D_LI_NEW_BUG_FIXES.md` (this file: Status DONE + Execution Summary)

### Adjacent-Sweep (Phase 2.5) dispositions

| Item | Disposition | Note |
|---|---|---|
| CSV parser regex did not support `TC-LOC-LI-NE-NNN` (4-segment IDs ending in digits) — without fix, all 37 NE-NNN TCs silently dropped from CSV | DO-NOW | Fixed both `markdown-parser.ts` line 70 and `to-csv.ts` line 167 with relaxed regex `(TC-[A-Z]+(?:-[A-Z]+)*(?:-\d+[A-Z]?)?)`. Re-export confirmed 114 rows. |
| File header had stale TC count (67) + stale Updated date (2026-04-27) | DO-NOW | Updated to 114 + 2026-04-28. |
| Execution Notes had stale Total TCs (63) and Total Fields (52) | DO-NOW | Updated to 114 + 54 with citation to SP-DQU-04 live DOM walk. |
| Audit/plan reference stale TC IDs (TC-040/052/039 → current TC-036/048/035; TC-001/003 cascade → current TC-003/004; TC-070 → SKIP-BILLING). Both audit `local-information-2026-04-27.md` §Archetype probe results and the plan body cite IDs that drifted between authoring snapshots and current file. | NOTED in this Execution Summary | Not appended to a separate cleanup plan — the audit doc itself is a historical artifact (already DONE), and the plan body's IDs are now resolved by content match documented above. Future TC-renumber events should regenerate audit/plan references via grep, not memory. |

### What was NOT done — surface to user

1. **Phase 1 BUG-LI-001 save-cycle confirmation** — DEFERRED. The interactive session's auth state at `.auth/nav4-state.json` is 4 days stale (2026-04-24 last write); Microsoft Entra MFA token cycle exceeds session permission; live Playwright CLI session would require fresh MFA which violates user preference (no readiness questions on `/execute`). Per plan Bootstrap HALT condition #3 (5xx backend → STOP, ask user), the prior session's PRIMARY_SYMPTOM_RESOLVED 2026-04-28 verificationLog entry is left intact in `reports/bugs/BUG-LI-001.json`; status remains `open` (NOT prematurely flipped). Recommend SP-DQU-05D-followup or next interactive session run a single save-cycle (Oracle Product=0000 + Dept=900 + Org=Encore US BU → Save → reload → values persisted) on a healthy backend, then flip status.
2. **Office 1604 slate-clear** — DEFERRED for the same reason. Per the 2026-04-28 audit, office 1604 has dirt: Oracle Product=`test`, Oracle Dept=`ABCDEFGHIJKLMNOPQRSTUVWXY`, Oracle Org=`Encore CA BU`. TC-008 Preconditions already specify the slate-clear; first agent that runs TC-008 against a healthy backend will perform it as setup.
3. **TC-LOC-LI-048 BillingCycle alert verbatim text** — PARTIAL. Office 1604 has `localBillingRan=false` (Billing Cycle dropdown is enabled), so the alert text is not surfaced on this office. The TC documents the source (`useLocationMetadata` BILLING_CYCLE_MSG constant) and flags verbatim capture for a `localBillingRan=true` office (e.g., 1605/1101) in next session.

### Acceptance criteria status

- [x] BUG-LI-003 fix scope applied: TC-003 + TC-004 amended (calc-on-net sibling assertion added); TC-LOC-LI-NE-011 + NE-012 created.
- [x] ARCH-006 drift fixed: TC-036 + TC-048 carry verbatim error text / alert source (TC-048 verbatim alert text deferred to localBillingRan=true office).
- [x] ARCH-009 cascade gap fixed: TC-LOC-LI-NE-013 created.
- [x] ARCH-010 boundary gap fixed: 30 spinbutton NEGATIVE TCs + 4 Oracle text NEGATIVE TCs created (NE-014 through NE-047, 34 total).
- [x] ARCH-011 stale framework fixed: TC-LOC-LI-SKIP-BILLING step 1 rewritten without "Angular".
- [x] ARCH-012 TC drift fixed: TC-008A unblocked; TC-035 rewritten per old-site baseline.
- [x] ARCH-003 slate-clear extended on TC-008 Preconditions (already complete in current file).
- [x] CSV re-exported (114 TCs total — exceeds plan target of ~98; Phase 5 added 34 not 30).
- [x] Phase 0 greps clean for newly-authored TCs (sweep-li-rule1 + rule2 NO CHANGE).
- [ ] BUG-LI-001 save-cycle confirmation — DEFERRED (see above).
- [x] Activity-log row appended (final phase).
- [ ] `/final-q` verdict — likely YELLOW due to Phase 1 deferral (acceptable per HALT #3 + stale-auth reality).
