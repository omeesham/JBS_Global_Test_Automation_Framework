> **ARCHIVED — DO NOT EXECUTE.** Superseded by: PLAN_LM_HISTORY_COVERAGE + PLAN_LO_HISTORY_COVERAGE Phase 7 closure + external /audit per AUD-017

---

# SUBPLAN SP-J: WATCHDOG Final Cross-Pivot Audit

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 5 (Audit — final)
**Status**: SUPERSEDED
**Superseded by**: PLAN_LM_HISTORY_COVERAGE + PLAN_LO_HISTORY_COVERAGE Phase 7 closure + external /audit per AUD-017
**Priority**: P1-CYCLE-2
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
23. **TC authoring rules — client-visible text hygiene** (added by SP-L1, 2026-04-22): Run the 4 forbidden-pattern greps from `clients/encore/specs_planning/_internal/tc-authoring-rules.md` over every file in `clients/encore/specs_planning/test-cases/**/*.md`:
    - `grep -rniE '✓\|✔\|✅\|✗\|✘\|❌\|→\|⇒\|▶\|►\|⚠️\|ℹ️\|❗' clients/encore/specs_planning/test-cases/` → zero hits required (Rule 1, no symbols).
    - `grep -rniE '\*\*[A-Z][^*]{0,40}\*\*' clients/encore/specs_planning/test-cases/` → zero hits outside priority/status table headers (Rule 2, no bold around UI labels).
    - `grep -rniE 'known bug\|not translated\|untranslated key\|raw i18n key\|\*\*BUG\*\*:\|bugBehavior=\|as-is buggy\|known defect\|pending fix\|workaround\|renders (an )?untranslated' clients/encore/specs_planning/test-cases/` → zero hits required (Rule 4, no bug-descriptor language).
    - `grep -rniE '\b(DataTable\|tabpanel\|spinner\|aria-invalid\|data-testid\|shadow DOM\|selector)\b' clients/encore/specs_planning/test-cases/` → zero hits required (Rule 3, no jargon in Expected).
    Any hit is an audit failure. File a remediation subplan per LR-034 and the sweep obligation from `tc-authoring-rules.md`. Known-leak inventory: `locations_management_history_test_cases.md` lines 38, 127, 129, 305–317 (CalcDamageWaiverOnNetAmount i18n gap — BUG-HIS-CDWNA-001 unfiled as of 2026-04-22).

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

---

## UPDATE (2026-04-22) — AUDIT RECOMMENDATION (append-only; original plan above is intact)

> **Execution-agent directive — read BEFORE Phase 0 runs.**
> This subplan now has TWO candidate paths:
> - **(a) Original plan** — 22 checklist items above.
> - **(b) Audit recommendation** — extend to 24 items, absorbing K1 + K2 as grep checks.
> Do NOT default to either:
> 1. Read both paths in full.
> 2. The 2 new grep items (below) add ~2 minutes to this audit. If both return zero hits → K1/K2 can be marked DONE-conditional-skipped without running full sessions.
> 3. If either grep returns hits → K1/K2 execute their original plans to remediate.
> 4. Log disposition in activity-log.
> Evidence wins, not recency.

**Audited by**: /ultrathink + /audit + /planning (Opus, 2026-04-22)
**Audit plan**: `~/.claude/plans/3-shared-utils-temporal-kahan.md`

### Finding
SP-K1 (framework rules sweep) and SP-K2 (agent prompts sweep) both document "expected outcome: zero revisions needed" in their own Cause sections, and master plan §8 Q7 confirms the same pre-audit finding. Running them as full cold-start sessions to re-confirm a precomputed null result is ceremony.

Both sweeps reduce to 2 grep commands that belong inside J's acceptance checklist.

### Proposed alternative path — extend checklist to 24 items
Add these to the §Scope numbered list (after item 22):

> 23. **Framework rules clean (absorbs SP-K1 scope)**:
>     ```
>     grep -rn "TC-LOC-.*-HIST\|TC-LOS-.*-HIST\|integration-per-spec\|hist-check in each spec\|each spec verifies history" CLAUDE.md clients/encore/CLAUDE.md docs/read_only_docs/
>     ```
>     Expected: zero hits.
>     If zero → note "SP-K1 absorbed; skipped" and proceed.
>     If nonzero → SP-K1 executes as designed to remediate; report each hit + disposition in J's audit report.
>
> 24. **Agent prompts clean (absorbs SP-K2 scope)**:
>     ```
>     grep -rn "TC-LOC-.*-HIST\|TC-LOS-.*-HIST\|append a HIST test\|integration TC after save\|verify history in each spec" .github/agents/ .github/copilot-instructions.md .claude/agents/
>     ```
>     Expected: zero hits.
>     If zero → note "SP-K2 absorbed; skipped" and proceed.
>     If nonzero → SP-K2 executes as designed; report each hit + disposition.

Update the J audit report template to include a "SP-K1/K2 absorption" section documenting grep results.

### Evidence
- Master plan §8 Q7 direct quote: "Current inventory reports ZERO OLD-pattern prompts/rules. SP-K1/K2 are sanity sweeps — ≤1 session each, near-zero effort. If anything is found, it's trivial to revise at that point."
- Both K1 and K2 Verification sections already use the same grep patterns J can run.

### Risk of blindly following path (a)
- K1 + K2 burn ~90 min of agent time re-measuring a precomputed null.

### What execution agent must check before picking
- Before adding items 23/24: confirm grep commands resolve against the cited paths in your working directory (file paths may have moved since 2026-04-22).
- If any of those paths no longer exist, audit is stale — adjust grep targets OR fall back to path (a).

---

## UPDATE #2 (2026-04-22) — ITEM 19 PATH CORRECTION (user-approved)

**User pre-approval, 2026-04-22**: §Scope checklist item 19 refers to `clients/encore/docs/hist-spec-template.md`, but that path was redirected to `clients/encore/specs_planning/_internal/hist-spec-template.md` per [SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md](SUBPLAN_HIST_PIVOT_22_D1_LM_CURRENCY_TESTS.md) UPDATE block.

**Execution-agent directive (override)**: when running this audit, reinterpret item 19 as:

> 19. **Template exists**: `clients/encore/specs_planning/_internal/hist-spec-template.md` exists and structurally matches SP-D1's Currency spec (annotated, not Currency-specific).

Do NOT check the original `clients/encore/docs/` path — it does not exist in this repo and never should. If you find a template at the old path, that's an audit failure (plan-amendment not honored); report it.
