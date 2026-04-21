> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute <this-filename>`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: load `/identity` per the `**Identity**` field below.
> 2. **Skills**: load every skill in `**Skills**` field below (the leading skill auto-calls its chain — e.g. `/cleanup` → `/regression-guard`).
> 3. **Model + thinking tier**: look up this subplan's SP number in `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` → Execution Order table. Use the specified Opus/Sonnet + think / think hard / think harder / ultrathink. If Phase 0 is present in Step-by-Step, bump thinking tier one notch higher than the table (forensic analysis needs judgment).
> 4. **Dependency gate**: verify every item in `**Depends on**` field is marked DONE in `plans/done/` or not-applicable. If any blocker → HALT + report to user. Do not proceed.
> 5. **Context load**: read `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` §1–§3 (pivot rationale + scope + per-identity KEEP/DELETE inventory) + this subplan in full.
> 6. **Phase 0 FIRST (if present in Step-by-Step)**: execute the "Phase 0 — Date-Forensic Self-Discovery" step before any code or doc edits. Document findings (with dispositions) in your activity-log row.
> 7. **Execute Phases 1+** per Step-by-Step in order.
> 8. **Handoff**: on success, apply the Handoff Signals block — set the file's Status field to DONE + Executed date in this file, append activity-log row (LR-028 + LR-037 wall-clock time ≥ mtime of every touched file), `git mv` this file to `plans/done/`, run `npm run plans:reindex`, commit (one commit per LR-027 boundary).
>
> **HALT + ASK USER** (do NOT silently proceed) if:
> - Any `**Depends on**` item is not DONE.
> - Phase 0 uncovers scope extension >30% beyond the listed starting point (user confirms before acting on unscoped items).
> - Genuine ambiguity in scope beyond the master plan §3 KEEP list.
> - `/regression-guard` diff shows changes unrelated to this subplan's stated scope.
> - Activity-log preflight (`npm run validate:activity-log:preflight`) would fail for your row.

---

# SUBPLAN SP-J: WATCHDOG Final Cross-Pivot Audit

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 5 (Audit — final)
**Status**: Pending (runs after all other subplans)
**Priority**: P0 (acceptance gate)
**Created**: 2026-04-20
**Depends on**: SP-A* + SP-B-*R + SP-D0 + SP-C*/D* + SP-F* + SP-E-* complete
**Identity**: WATCHDOG
**Skills**: `/audit` + `/regression-guard` + `/identity`
**Estimated**: one session

---

## Cause

Independent audit that the entire pivot has landed correctly. Catches drift, missed files, incomplete cleanups, and dead pointers. This is the pre-sign-off gate.

---

## Scope

**Audit checklist** (from master plan §7 Verification):

1. **Code cleanup**: `grep -rn "TC-.*-HIST" clients/encore/tests/specs/setup/` returns ZERO hits outside `tests/specs/setup/locations/history/` and `local-office-history.spec.ts`.
2. **Test-case MD cleanup**: `grep -rn "TC-.*-HIST" clients/encore/specs_planning/test-cases/` returns zero hits in the 10 non-history MDs.
3. **CSV sync**: `clients/encore/exports/*.csv` contains no HIST rows for non-history specs; counts match surviving MDs.
4. **Structural specs untouched**: `location-management-history.spec.ts` 19/19 TCs pass; `local-office-history.spec.ts` 7/7 + N-new per-column TCs pass.
5. **Catalog coverage**: `hist-root-map-local-office.md` covers 42/42; `hist-root-map-location-management.md` covers 87/87. Zero unresolved `UNKNOWN_ROOT`.
6. **Per-column TCs**: every column has at least one state-space TC + metadata TC + fidelity or orphan TC.
7. **No soft asserts**: `grep -rn "expect.soft" clients/encore/tests/specs/setup/local-office/local-office-history.spec.ts clients/encore/tests/specs/setup/locations/history/` returns zero hits.
8. **Anomaly pipeline**: seed a known corruption → confirm one HIST TC fails AND one anomaly JSON is written.
9. **Auto-filer**: `npm run hist:anomaly-filer` on the seeded anomaly produces a sensible digest.
10. **REQUIREMENTS.md**: §History Tracking language matches catalogs. No "each spec verifies" references.
11. **Run-time check**: 10 basic-info specs run faster post-pivot vs pre-pivot baseline (regression report comparison).
12. **Activity log**: all session rows pass `npm run validate:activity-log:preflight` (LR-037).
13. **Plans index**: `npm run plans:reindex:check` reports clean.
14. **Plan bookkeeping**: 3 superseded plans in done/, this master + all SP-* subplans completed.
15. **Bug coverage**: every NOT-TRACKED catalog entry has a filed BUG-* or exemption note.
16. **Bug-report TC refs current**: every `reports/bugs/BUG-*.json` `affectedTests` entry resolves to an existing TC ID — zero TC-*-HIST dangling refs.
17. **Test-plan MDs clean**: `grep -rn "integration.*per.*spec\|each spec verifies" clients/encore/specs_planning/test-plans/` returns zero hits. HIST cross-references are structural pointers only, not workflow directives.
18. **Agent prompt line refs current**: agent prompts that cite REQUIREMENTS.md line numbers in the §History range are still accurate post-SP-H (no line-drift mismatches). Spot-check any prompt with `lines N..M` inside 826-961 or 1176-1273 original ranges.
19. **Template exists**: `clients/encore/docs/hist-spec-template.md` exists and structurally matches SP-D1's Currency spec (annotated, not Currency-specific).
20. **Shared-utils deduplication**: SP-C*/SP-D* files have ZERO inline reimplementations of hist-reader exports. Grep for reinvented `enumerateStateSpace`, `histSaveActions`, `enforceBaseline`, `diffRowsByCol`, `assertNoTrackedFor` in spec bodies — should only see imports.
21. **Top-level docs clean**: README.md + HANDOFF_TO_COLLEAGUE.md + `clients/encore/CLAUDE.md` contain no old-pattern HIST references (workflow/process-level). Domain knowledge (LR-036, PLN-048, etc.) stays.
22. **Date-forensic completeness**: Run `git log --since=2026-04-13 --until=2026-04-18 --name-only` across the whole repo. Every file touched in that window that the pivot implies should-be-cleaned, is in fact cleaned. Any lingering HIST integration artifact is a failure.

---

## KEEP list

- All done/ artifacts — audit reads, never modifies.
- All passing TCs — audit doesn't re-run CI, only reads reports.

---

## Step-by-Step Execution

### Phase 0 — Date-Forensic Whole-Repo Sweep (MANDATORY first step)

**Principle**: You are the last line of defense. Don't trust that prior subplans caught everything. Run a whole-repo forensic sweep yourself.

1. Run:
   ```
   git log --since=2026-04-13 --until=2026-04-18 --name-only --pretty=format:"%h %ad %s" --date=short
   ```
2. Enumerate every unique file in the output. Categorize:
   - **COVERED**: file appears in the KEEP list (master plan §3), OR was explicitly handled by SP-01/02/03/04/H, OR is in the superseded-plans set.
   - **EXPECTED-TOUCHED**: new per-column hist specs, catalogs, new utils — should have landed via SP-19..SP-34.
   - **UNEXPECTED / LINGERING**: files touched 2026-04-13..17 that are neither in KEEP list nor properly cleaned. THESE ARE AUDIT FAILURES.
3. For each UNEXPECTED file: read the diff from that window, determine disposition (should have been deleted / should have been revised / is actually fine).
4. Any disposition-violating files → log as audit failure in your report.

### Phase 1 — Checklist Audit (run all 22 items)

1. `/identity WATCHDOG`.
2. Run each check in the checklist. Document pass/fail per item.
3. If any FAIL: write remediation subplan `SUBPLAN_HIST_PIVOT_J_REMEDIATION_{N}.md` naming the failure + owner + scope. Do NOT fix in this session.
4. Write audit report: `plans/done/PLAN_HIST_PIVOT_FINAL_AUDIT.md` with:
   - Date + identity + session scope
   - Checklist with pass/fail + evidence per item
   - Remediation list (if any)
   - Sign-off note (if all pass)
5. Commit: `audit(hist-pivot): SP-J — final cross-pivot audit report`.

---

## Verification

1. Audit report exists at `plans/done/PLAN_HIST_PIVOT_FINAL_AUDIT.md`.
2. If pass: sign-off note + "Pivot complete" message to user.
3. If fail: remediation subplan(s) authored + queued in `plans/pending/`.

---

## Handoff Signals

1. Status DONE + Executed.
2. Activity log:
   ```
   | YYYY-MM-DDThh:mm | watchdog | done | plans/done/PLAN_HIST_PIVOT_FINAL_AUDIT.md | SP-J — final pivot audit. <pass | fail + N remediation subplans spawned>. |
   ```
3. `git mv` this subplan to done/. Reindex.
4. If all pass: propose master plan PLAN_HIST_COLUMN_FIRST_PIVOT.md → `git mv` to done/ with `Status: DONE`.

---

## Context for Cold-Start Session

- This is audit only. Do NOT fix anything found — that's SP-J-REMEDIATION-*.
- LR-029: never audit selectors without live DOM verification. If audit item requires selector state check, MCP-verify.
- LR-020 plan-vs-codebase verification.

---

## Dependencies

- All other Group 1–5 subplans complete.
- Unblocks: master plan move to done/.
