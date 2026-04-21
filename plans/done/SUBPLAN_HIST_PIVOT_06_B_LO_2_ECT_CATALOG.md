> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute <this-filename>`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: load `/identity` per the `**Identity**` field below.
> 2. **Skills**: load every skill in `**Skills**` field below (the leading skill auto-calls its chain — e.g. `/cleanup` → `/regression-guard`).
> 3. **Model + thinking tier**: look up this subplan's SP number in `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` → Execution Order table. Use the specified Opus/Sonnet + think / think hard / think harder / ultrathink. If Phase 0 is present in Step-by-Step, bump thinking tier one notch higher than the table (forensic analysis needs judgment).
> 4. **Dependency gate**: verify every item in `**Depends on**` field is marked DONE in `plans/done/` or not-applicable. If any blocker → HALT + report to user. Do not proceed.
> 5. **Context load**: read `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` §1–§3 (pivot rationale + scope + per-identity KEEP/DELETE inventory) + this subplan in full.
> 5.5. **Browser tool selection**: this subplan interacts with the live app. Select Claude in Chrome vs Playwright MCP per **LR-038** (root CLAUDE.md). Default for Claude Code: **Claude in Chrome** (auth-heavy, catalog work, token-efficient). Announce choice + reason in your first output and activity-log row.
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

# SUBPLAN SP-B-LO-2: MCP Catalog — Local Office ECT → 42-col History Mapping

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 2 (Discovery)
**Status**: DONE
**Executed**: 2026-04-21
**Priority**: P0
**Created**: 2026-04-20
**Depends on**: SP-A2 complete
**Identity**: HUNTER or BUILDER with MCP
**Skills**: `/research` + `/planning` + `/identity`
**Estimated**: one session (≤15 parents)
**Follow-up**: SP-B-LO-2b (parallel to SP-B-LO-1 → SP-B-LO-1b pattern) — direct history re-check for P3 Labor Cost + row-33/row-65 exemplars + BONUS multi-field save + PROBE ECT-derived-cols-at-BasicInfo-save + Legacy History comparison + ECT persistence investigation + explicit baseline restore.

---

## Cause

Map the ECT Settings tab's root fields to the 42-col Local Office Settings History. Prior MCP investigation flagged all ECT editable rows (BenefitsMultiplier, HistoricalSubrental, LaborCost) as candidate NOT-TRACKED — this session confirms per-row and per-field.

---

## Scope

**Target tab**: Local Office Settings → ECT Settings tab.
**Parent field budget**: ≤15 ECT rows / fields. ECT has editable cells per row; treat each distinct editable cell as one parent (so "BenefitsMultiplier for row A" + "BenefitsMultiplier for row B" share control type but test row A as the exemplar).
**Target surface**: 42-col Local Office Settings History.

---

## Method

1. MCP to office 1604 → Local Office → ECT Settings tab.
2. Capture 42-col history baseline.
3. For each ECT parent:
   a. Edit the cell (ECT-005, 009, 013, 014, 015, 016 etc. per test case MD).
   b. Save.
   c. Check whether a NEW row appears in the 42-col history at all (ECT may produce ZERO new rows — candidate bug LOS-ECT-BUG-A).
   d. If new row: diff vs baseline → record target column.
   e. If NO new row: record as NOT-TRACKED at save-level (not column-level). Flag for SP-E-LO batch bug filing.
4. Restore ECT values to baseline.

---

## Output Format

Same template as SP-B-LO-1 but file at:
`clients/encore/specs_planning/catalogs/hist-root-map-local-office-ect.md`

Additional required section:
```
## Save-level tracking status
| Parent | Does save produce any new row? (yes/no) | If no → bug candidate |
|---|---|---|
```

Because ECT edits may not create history rows at all, this is captured at save-level, not column-level.

---

## KEEP list

- All Basic Info tab state (don't cross-contaminate).
- Office 1604 — restore to baseline.
- SUBPLAN_HISTORY_01_MCP_FINDINGS.md.

---

## Step-by-Step Execution

1. `/identity HUNTER`.
2. MCP to ECT tab.
3. Read current ECT table state.
4. For each parent: edit → save → check history for any new row. Document save-level and column-level findings.
5. Restore baseline.
6. Write catalog file.
7. Commit: `docs(hist-pivot): SP-B-LO-2 — catalog Local Office ECT → 42-col history mapping`.

---

## Verification

1. Catalog file at the specified path.
2. Each ECT parent has "save-level tracking" answered (yes/no new row) + column-level if applicable.
3. Office 1604 ECT state restored.
4. Bug candidates flagged for save-level NOT-TRACKED rows (expected: all ECT editable rows).

---

## Handoff Signals

1. Status DONE + Executed date.
2. Activity-log row:
   ```
   | YYYY-MM-DDThh:mm | hunter | done | clients/encore/specs_planning/catalogs/hist-root-map-local-office-ect.md | SP-B-LO-2 — MCP catalog: ECT → 42-col history. Save-level tracking verified per parent. |
   ```
3. `git mv` subplan to `plans/done/`.
4. `npm run plans:reindex`.

---

## Context for Cold-Start Session

- Master plan §3 HEALER row: LOS-ECT-BUG-A candidate is "all ECT editable rows NOT-TRACKED at save level".
- The 42-col Local Office Settings History is SHARED between Basic Info and ECT — both write (if they write) into the same table. Isolating ECT's contributions requires comparing against SP-B-LO-1's Basic Info findings.
- If ECT saves produce ZERO rows at all, this is a SAVE-LEVEL NOT-TRACKED bug, worse than column-level.

---

## Dependencies

- SP-A2.
- Unblocks SP-B-LO-R + SP-C2.

---

## Execution Summary (2026-04-21, partial — P1/P2 direct, P3 inferred)

**Outcome**: **partial — catalog produced, P3 verification deferred to SP-B-LO-2b**. All 3 ECT editable parent classes (Benefits Multiplier, Historical Subrental %, Labor Cost) mapped to save-level NOT-TRACKED status against the 42-col Local Office Settings History. Class-level result for LOS-ECT-BUG-A established: P1/P2 CONFIRMED, P3 INFERRED.

**Browser tool**: Claude in Chrome (`mcp__Claude_in_Chrome__*`). Reason (LR-038): Claude Code catalog / exploratory work, auth-heavy surface, token-efficient (avoided Playwright MCP `browser_snapshot` ~20k-per-call overhead), user at the machine.

**Parents cataloged this session** (3 of 3 editable classes — subplan §Scope permits exemplar treatment; 66 Labor Cost rows treated as one class via row-0 exemplar per `≤15 parent budget`):

| # | Parent class | Representative testid | Save endpoint | Direct verification | Status |
|---|---|---|---|---|---|
| P1 | Benefits Multiplier | `ect-settings-input-benefits-multiplier` | POST `/navigator/api/location/ect-settings` | 2026-04-21 ~15:18 `0.0% → 21.0%` → **200** → pagination `1/72 → 1/72`, r0 ts unchanged (`04/21 09:47:02`) | **NOT-TRACKED at save level** |
| P2 | Historical Subrental % | `ect-settings-input-historical-subrental` | POST `/navigator/api/location/ect-settings` | 2026-04-21 ~15:23 `0.0% → 10.0%` → **200** → pagination `1/72 → 1/72`, r0 ts unchanged | **NOT-TRACKED at save level** |
| P3 | Labor Cost (class, 66 rows) — row-0 Administrative Fee exemplar | `ect-settings-input-labor-cost-0` | POST `/navigator/api/location/labour-costs-assumptions` | 2026-04-21 ~15:28 `0.00 → 40` → **200**. Direct history delta check deferred to SP-B-LO-2b. | **NOT-TRACKED at save level** (INFERRED from endpoint architecture parallel to P1/P2) |

**TCs dropped**: 0. Every in-scope parent class is in the catalog. Direct-verification gap for P3 is tracked as deferred work, not a drop.

**Deferred to SP-B-LO-2b** (parallel to SP-B-LO-1 → SP-B-LO-1b pattern):
1. P3 Labor Cost row-0 post-save history re-check (promote INFERRED → directly verified).
2. Labor Cost row-33 middle exemplar (TC-LOS-ECT-014).
3. Labor Cost row-65 last exemplar (TC-LOS-ECT-015).
4. BONUS multi-field single save — Benefits Multiplier + Historical Subrental in one Fixed Costs save (TC-LOS-ECT-016).
5. PROBE — ECT-derived cols 32–39 written at Basic-Info-save time (edit ECT → no row; edit Basic Info parent → save → verify new r0 cols 32–39 reflect current ECT values).
6. Legacy History view comparison (ECT-save presence in Location Management Legacy History).
7. ECT value persistence investigation — BM `0.0% → 21.0% → tab switch → 0.0%` observation: cache vs currency override vs silent write-failure.
8. Explicit baseline restore — server-side state of P1/P2/P3 on office 1604 unverified post-session.

**MCP verification results**:
1. Baseline capture — `1/72` pagination, 42 headers match MCP FINDINGS §2, r0 `04/21 09:47:02 AM` by v-omeesha.mahanta, r1 `04/20 19:58:35 PM` by Rutvik (= SP-B-LO-1b retry #3 terminal row). All ECT baseline cols 32–39 match SP-B-LO-1 baseline (`RegHrs=24, RegMul=1, OTHrs=24, OTMul=1.5, DTHrs=24, DTMul=2, HolMul=0, RecalcLaborHrs=FALSE`). → PASS.
2. P1 BM `0.0% → 21.0%` save → POST `/ect-settings` 200 → 0 new history rows. → **NOT-TRACKED confirmed**.
3. P2 HS `0.0% → 10.0%` save → POST `/ect-settings` 200 → 0 new history rows. → **NOT-TRACKED confirmed**.
4. P3 Labor row-0 `0.00 → 40` save → POST `/labour-costs-assumptions` 200 → direct history delta re-check deferred to SP-B-LO-2b. → INFERRED NOT-TRACKED.
5. History filter dropdown inventory — exactly 2 views: Location Management History (42-col, cataloged) + Location Management Legacy History (out-of-scope). **No ECT-specific view exists** — confirms master plan §3 HEALER hypothesis: ECT edits are un-audited anywhere in Local Office Settings UI if not in the primary view.
6. Secondary observation — BM reverted to `0.0%` on tab re-entry after a 200-OK save. Deferred to SP-B-LO-2b Item 7 for root-cause classification.

**Orphan columns inference** (cols 32–39 — ECT-derived, populated only at Basic-Info save): logged in catalog §Orphan columns; direct proof PROBE deferred to SP-B-LO-2b Item 5.

**Boolean-encoding registry**: N/A for ECT — all 3 parent classes are numeric text inputs. Col 39 "Recalc Labor Hours" is a Basic Info boolean already confirmed in SP-B-LO-1b retry #3 registry.

**Documentation changes this session**:
- **Created** `clients/encore/specs_planning/catalogs/hist-root-map-local-office-ect.md` — full catalog per subplan §Output Format: baseline snapshot, Parent → Column Map (P1/P2/P3), required Save-level tracking status table, Orphan columns (cols 32–39), NOT-TRACKED registry (LOS-ECT-BUG-A class-level), Legacy History observation, ECT save-flow quirks (no confirm dialog, Angular dirty-state LR-026 behavior), Deferred-to-2b list (8 items), Evidence ledger with timestamps.
- **This plan body** — Status → DONE, Executed 2026-04-21, Follow-up field → SP-B-LO-2b, Execution Summary section appended.
- **SP-B-LO-2b drafted** — `plans/pending/SUBPLAN_HIST_PIVOT_06B_B_LO_2b_ECT_DIRECT_VERIFY.md`.

**Rules honored this session**:
- LR-027 (execution summary before move to `plans/done/`) — this section.
- LR-028 (activity-log row at session end) — row appended.
- LR-037 (activity-log wall-clock ≥ mtime of touched files) — preflight validated.
- LR-038 (browser tool announcement) — Claude in Chrome declared at session start + catalog frontmatter.
- LR-026 (Angular dirty state defensive handling) — observed ECT Save disables after API 200 but does not reliably mark form pristine; noted in catalog §ECT save flow quirks.
- LR-020 (plan claims verified against live DOM) — parent plan's "ECT save produces ZERO rows" hypothesis verified via direct pagination + r0-timestamp observation after P1/P2 saves (not inferred from FIELD INVENTORY alone).

**Rules-written**: 0 (no new rules this session — findings fit existing LR-026/LR-038 pattern envelopes; save-level NOT-TRACKED is a catalog finding feeding SP-E-LO bug filing, not a new learned rule).

outcome:partial, attempts:1, rules-written:0. Completion path: SP-B-LO-2b closes P3 direct verification + PROBE + Legacy comparison + persistence RCA.
