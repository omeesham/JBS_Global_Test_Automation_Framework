# SUBPLAN: Neutral-Eye Audit + Fix — Location Management History

**Status**: SUPERSEDED
**Superseded by**: PLAN_LM_HISTORY_COVERAGE Phase 5b/7 (LM History neutral-eye audit)
**Priority**: P0-CYCLE-1
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-AAE-01, SP-AAE-02, SP-AAE-03, SP-AAE-04, SP-AAE-05, SP-DQU-03, SP-DQU-04, SP-DQU-05
**Model**: claude-opus-4-7
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: Catalog walkthrough per LR-038 v2 — CLI primary with grep-over-disk discipline. Mid-subplan switch to Chrome allowed only on Entra FedAuth refresh per `.claude/rules/browser-tool.md` Gate 3 protocol.

---

## Provenance (vision preservation)

This subplan was originally authored 2026-04-22 with the following goal:

> **BUG-HIS-CDWNA-001 filing + known-leaks sweep**

It was marked SUPERSEDED on 2026-04-25 by SP-AAE-06 (parallel-chain rollout). On **2026-04-28** the user rejected `/chain` orchestration; SP-AAE-06 was retired (Status: CANCELLED) and this subplan was **revived 2026-04-28** for **manual one-by-one `/execute`**. Revival applies the SP-AAE-01..05 system fix.

Original module-specific focus areas (preserved from pre-supersession plan body):
- 87 column headers visible + readable text.
- Boolean columns (Active, Corporate Pricing, etc.) — confirm Unicode ✔ render per LR-036.
- Column #28 untranslated i18n key state — file BUG-HIS-CDWNA-001 per LR-034 if still present.
- Sweep obligation: fix TC-LOC-MGH-002 (remove Step 4, rewrite Expected) per `tc-authoring-rules.md` Known Leaks table.
- Sweep obligation: delete TC-LOC-MGH-038 (content becomes bug's expected/actual fields) per `tc-authoring-rules.md` Known Leaks table.
- Re-export CSV after MD cleanup.
- LR-036 boolean render reference: this table uses Unicode ✔ (vs SVG lucide-check on LOS-History).

## Bootstrap

- **Invoke with**: `/execute SUBPLAN_DQU_20_F1i_MGMT_HISTORY_AUDIT.md`
- **Identity**: WATCHDOG → HEALER (two phases, switch via `/identity` between Phase 1 and Phase 2)
- **Skills auto-called**: `/identity`, `/find-bugs` (Phase 1), `/bugfix` + `/regression-guard` (Phase 2), `/final-q` (close)
- **Context files**:
  - `clients/encore/specs_planning/_internal/field-inventory-spec.md`
  - `clients/encore/specs_planning/_internal/field-inventories/_TEMPLATE.md`
  - `clients/encore/specs_planning/_internal/field-inventories/local-office-settings-2026-04-27.md` (reference shape)
  - `clients/encore/specs_planning/test-cases/setup/locations/locations_management_history_test_cases.md` (do NOT read until Phase 2 diff step)
  - `clients/encore/specs_planning/_internal/tc-authoring-rules.md` (Known Leaks table — this subplan owns the cleanup)
  - LR-036 (boolean render format), LR-038 v2, LR-040, LR-041, LR-042, LR-046

## Phase 0 — Dependency + browser-tool gate

1. Confirm SP-AAE-01..05 + SP-DQU-03/04/05 are all `Status: DONE`.
2. Run `npm run validate:fieldinventory-staleness`:
   - **No artifact yet for Mgmt History** → fall through to Phase 1 emit-new-artifact path per LR-013 (b). NOT a HALT.
   - **Artifact ≤14d fresh** → spot-check OK.
   - **Artifact >30d stale** → HALT.
3. Announce: `Browser tool: Playwright CLI. Reason: catalog walkthrough, 87-column history table, unattended.`
4. **HALT** only on (a) prereq not DONE, or (b) >30d-stale exit.

## Phase 0.5b — Baseline-first walk (LR-045 row 4 / LR-ENC-001 / D11)

Before Phase 1's e2e walk, visit nav2 baseline first and emit `clients/encore/specs_planning/_internal/old-site-baseline/location-management-history-<TODAY>.md`. If an artifact ≤14 days old exists, spot-check 2-3 fields per LR-013; otherwise emit fresh.

1. Chrome Claude (LR-038 v2 auth-heavy row): `navigate` to `https://navigator2.training.psav.com/#/setup/locationdetail/1604`. Locate the equivalent Location Management History tab (Glyphicon-rendered booleans per LR-036).
2. Walk every column header + filter UX. Document column count + sort/filter behavior on baseline.
3. Emit baseline artifact per LR-045 free-form. Frontmatter `baselineScope: full | baseline-partial | baseline-absent`.
4. Phase 1's field-inventory frontmatter sets `Baseline_Artifact: old-site-baseline/location-management-history-<TODAY>.md`.
5. Phase 2's diff step adds `## Baseline diff` section classifying divergences as regression-from-baseline / intentional-UX-change / baseline-absent. Pay special attention to column-count differences (baseline column count vs new-site 87 columns).

**HALT gate**: regression-from-baseline count > 5 → STOP, escalate per LR-040.

## Phase 1 — WATCHDOG: emit field-inventory artifact

**Output**: `clients/encore/specs_planning/_internal/field-inventories/location-management-history-<TODAY>.md`

1. Navigate to `/navigator/locations/1604/settings/location` and click the **Location Management History** tab (or equivalent path).
2. Walk live DOM via Playwright CLI; capture all 87 columns + boolean render + filter UX.
3. Emit artifact per `field-inventory-spec.md` — **8 mandatory frontmatter keys**:
   1. `Module: location-management-history`
   2. `Client: encore`
   3. `MCP_Session_Date: <today's ISO date>`
   4. `MCP_Session_Tool: Playwright MCP` (legacy enum)
   5. `MCP_Tool_Reason: <one-line free text>`
   6. `Author_Identity: WATCHDOG`
   7. `Page_URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location` (Mgmt History tab)
   8. `Test_Entity: Office 1604`
4. Emit **7 mandatory sections**: URL(s) visited, Field Inventory, Labels + Section Names, Live-state caveat, Known App Bugs, Save-cycle observations, Staleness signal.
5. **Priority focus fields**:
   - 87 column headers — capture verbatim text + visibility.
   - Boolean columns (Active, Corporate Pricing, etc.) — confirm Unicode ✔ render per LR-036 (do NOT assume textContent works on SVG-rendered cells).
   - Column #28 — check for untranslated i18n key (e.g., raw `cdwna_*` token visible in cell text); if present, this is BUG-HIS-CDWNA-001.
6. **LR-014/015 compliance**: data-testid + live defaults.
7. Pre-commit hook validates on `git add`.
8. **HALT gates**: >5 new APP bugs → ask user. Drift → log + document.

## Phase 2 — HEALER: diff TC MD, file bugs, re-export CSV + sweep cleanup

1. Switch identity: `/identity HEALER`.
2. Diff Phase 1 artifact against `locations_management_history_test_cases.md`.
3. Apply diff fixes with `**MCP_VERIFICATION_LOG**: location-management-history-<date>.md §<section> "<field>" — <evidence>` citations.
4. **Sweep obligations** from `tc-authoring-rules.md` Known Leaks table:
   - Fix TC-LOC-MGH-002: remove Step 4, rewrite Expected per the leak entry.
   - Delete TC-LOC-MGH-038: its content becomes the BUG-HIS-CDWNA-001 expected/actual fields.
   - Update `tc-authoring-rules.md` Known Leaks table: remove these 2 rows (resolved).
5. **File `BUG-HIS-CDWNA-001`** per LR-034 schema:
   - Title: "Column #28 untranslated i18n key on Location Management History table"
   - stepsToReproduce: numbered array.
   - Expected: cell shows translated label.
   - Actual: cell shows raw i18n token (e.g., `cdwna_*`).
   - Severity, category, affectedTests fields.
   - Append `**Status**: Blocked by BUG-HIS-CDWNA-001` to TC-LOC-MGH-002 and any other affected TCs.
6. File any other `BUG-HIS-NNN.json` for additional defects.
7. Re-export CSV: `npx ts-node export_test_cases/to-csv.ts clients/encore/specs_planning/test-cases/setup/locations/locations_management_history_test_cases.md clients/encore/exports/locations_management_history_test_cases.csv`. Verify Tags column.
8. Regression fingerprint via `/regression-guard`.

## Acceptance criteria (LR-040 closure gate — every diffed item classified)

For every field surfaced in Phase 1 → Phase 2 must classify each as:

- **(a) MCP-proven** — TC MD updated with MCP_VERIFICATION_LOG citation, OR
- **(b) Grep-verifiable hand-off** — line item exists in a named downstream subplan, AND verifier has run `grep "<item-text>" <recipient-file>` and found it, OR
- **(c) User-flagged** — named bug ID + Pending decision, OR `**Discussion item**:`.

**Sweep-specific acceptance**:
- [ ] BUG-HIS-CDWNA-001 filed per LR-034 (or marked `STALE` if column #28 already fixed in app).
- [ ] TC-LOC-MGH-002 leak cleaned (Step 4 removed, Expected rewritten).
- [ ] TC-LOC-MGH-038 deleted (or repurposed as bug evidence).
- [ ] `tc-authoring-rules.md` Known Leaks table updated — those 2 rows removed.

**HALT before flipping `Status: DONE`** if any item lacks (a)/(b)/(c) OR sweep checkbox is unchecked.

## LR-046 acknowledgment (strict lines)

- "Every TC cites MCP_VERIFICATION_LOG" — strict. APPEND on miss = /final-q RED.
- "Heuristic runs clean" — strict. Pre-existing hits APPEND only with `override approved`.
- ">5 new APP bugs" — strict HALT.
- "Both TC-LOC-MGH-002 + TC-LOC-MGH-038 sweep cleanup" — strict. Skipping either = /final-q RED.

## Handoff

1. Activity-log row per LR-028 (timestamp ≥ touched-file mtimes per LR-037).
2. `/final-q` v2 evidence-emission per LR-042 §E.
3. On GREEN: `mv` to `plans/done/`, update Status + Executed + Execution Summary (LR-027), `npm run plans:reindex`.

## Why no `## Artifacts produced` section (intentional)

Two-phase WATCHDOG → HEALER: `check-subplan-identity.mjs` captures only WATCHDOG. Omitting → Phase 0.1 `skipped: true`. Mid-subplan `/identity HEALER` switch + PreToolUse hook handles post-switch ownership.
