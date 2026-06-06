# SUBPLAN: Tag Rollout — LOS + LI MD Files + Re-Export CSVs

**Status**: Pending
**Priority**: P0-CYCLE-1
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-03 (LOS fixes), SP-DQU-05 (LI fixes), SP-DQU-05D (LI new-bug fixes — BUG-LI-003 + 6 ARCH drift items + ~30 NEGATIVE TCs; MUST land before tag rollout per PLAN_FIND_BUGS_LI_FOLLOWUP Fork A reroute 2026-04-28), SP-DQU-06 (converter ready), SP-DQU-07 (rules doc live)
**Blocks**: SP-DQU-34 (client handoff — CSVs must be tagged before shipping)
**Model**: claude-sonnet-4-6
**Thinking**: mid
**PermissionMode**: auto
**Justification**: Tag rollout = mechanical edits with strict rule adherence (LR-041 explicit mid example)

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_08_E3_TAG_ROLLOUT_LOS_LI.md`
**Identity**: BUILDER
**Skills auto-called**: /identity, /regression-guard (before + after)
**Model + thinking**: Sonnet + medium (mechanical edits with strict rule adherence)
**Dependency gate**: SP-03 + SP-05 + SP-06 + SP-07 all `Status: DONE`
**Context files**:
- `clients/encore/specs_planning/_internal/tc-authoring-rules.md` (Rule 5 tag definitions)
- `clients/encore/specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md` + `local_office_history_test_cases.md` + `local_office_ect_test_cases.md` (LOS split into 3 sibling files on 2026-05-05)
- `clients/encore/specs_planning/test-cases/setup/locations/locations_local_information_test_cases.md`
- Neutral-eye findings for both modules
**Phase 0 directive**: regression fingerprint; read Rule 5 verbatim; build tag decision table upfront before applying.
**HALT conditions**:
- Any TC that can't be cleanly tagged (unclear whether POSITIVE or NEGATIVE) → annotate with `Tags: <candidate>` comment in MD, note in chat, continue. Do NOT guess.

---

## Purpose

Add the `Tags` column to every TC's metadata table in LOS + LI MDs. Populate per Rule 5. Re-export both CSVs. Top-down layering: the 10-15 most business-critical TCs get `SMOKE`; others get the right combo of positive/negative/UI/regression.

## Step-by-step

1. Regression fingerprint snapshot.
2. Build tag-decision table (in chat — not a file) to audit own logic:
   - SMOKE candidates: page-load TCs, tab-visible TCs, first happy-path-save per module.
   - REGRESSION candidates: any TC where `Status: Blocked by BUG-*` OR historical bug-bound (e.g., TC-LOS-BAS-007 NM-1264).
   - UI only: default-values, tab-structure, label verification.
   - E2E: cross-tab persistence, save + reload, cross-module effects.
3. For each TC in LOS MD:
   - Open metadata table; confirm it has 3 columns today (`| Priority | Status | Type |`).
   - Add 4th column header `| Tags |`.
   - Add 4th column data cell with the assigned tag(s), comma-separated.
4. Repeat for LI MD.
5. Run all 6 Phase 0 greps on both MDs. Zero hits on Tags-empty-cell pattern.
6. Rebuild the XLSX deliverable: `npm run xlsx:build` — re-parses both edited MDs (LOS siblings post-2026-05-05 split + LI) into the single `clients/encore/test_cases_xlsx/encore_test_cases.xlsx` workbook. The per-module CSV re-export was retired in PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION Phase D.
7. Open the rebuilt workbook sheets (LOS + LI) in verification:
   - The `Tags` column is present.
   - Every row has a non-empty Tags cell.
   - Top ~10 TCs per module have `SMOKE` somewhere.
8. Regression fingerprint after. Should show only the 2 edited MD files + the rebuilt workbook changed.
9. Activity-log row.

## Acceptance criteria

- [ ] Every TC in LOS + LI MDs has a non-empty Tags cell with one or more allowed values.
- [ ] SMOKE applied to minimum-viable must-pass TCs (page load, primary save) in each module.
- [ ] REGRESSION applied to every BUG-*-linked TC.
- [ ] CSVs re-exported; Tags column visible; zero empty Tags cells.
- [ ] Phase 0 greps clean.
- [ ] Activity-log row.

## Handoff

Next: parallel split — SP-DQU-09 (reqs sampling, already running), SP-DQU-11 (remaining modules planner), SP-DQU-21 (leftover-state audit), SP-DQU-32/33 (skills). Chat summary: client-shippable state reached (mega plan ship-first gate satisfied).
