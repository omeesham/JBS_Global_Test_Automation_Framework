# SUBPLAN: Neutral-Eye Audit + Fix — Legal

**Status**: Pending
**Priority**: P0-CYCLE-1
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-AAE-01, SP-AAE-02, SP-AAE-03, SP-AAE-04, SP-AAE-05, SP-DQU-03, SP-DQU-04, SP-DQU-05
**Model**: claude-opus-4-8
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: Catalog walkthrough per LR-038 v2 — CLI primary with grep-over-disk discipline. Mid-subplan switch to Chrome allowed only on Entra FedAuth refresh per `.claude/rules/browser-tool.md` Gate 3 protocol.

---

## Provenance (vision preservation)

This subplan was originally authored 2026-04-22 with the following goal:

> **Mostly NOT-AUTOMATABLE re-confirm**

It was marked SUPERSEDED on 2026-04-25 by SP-AAE-06 (parallel-chain rollout). On **2026-04-28** the user rejected `/chain` orchestration; SP-AAE-06 was retired (`plans/done/SUBPLAN_AAE_06_PARALLEL_ROLLOUT.md`, Status: CANCELLED) and this subplan was **revived 2026-04-28** for **manual one-by-one `/execute`**. Revival applies the SP-AAE-01..05 system fix (field-inventory artifact + drift gate + heuristic + staleness + Tags re-export).

Original module-specific focus areas (preserved from pre-supersession plan body):
- ServiceChargeId + TermsConditionsId required-validation (still NOT-AUTOMATABLE per 2026-04-06 finding? — re-confirm).
- ServiceChargeNames + TermConditionNames alphabetical sort (v1 rule; existing APP-bug candidates — confirm still broken or fixed).
- Language filter behavior.
- Country change cascade (NOT testable on 1604 — note in Live-state caveat).
- v1 gaps #16, #17 from `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md` — NOT-AUTOMATABLE via Radix Select; reconfirm still blocked.

## Bootstrap

- **Invoke with**: `/execute SUBPLAN_DQU_13_F1b_LEGAL_AUDIT.md`
- **Identity**: WATCHDOG → HEALER (two phases, switch via `/identity` between Phase 1 and Phase 2)
- **Skills auto-called**: `/identity`, `/find-bugs` (Phase 1), `/bugfix` + `/regression-guard` (Phase 2), `/final-q` (close)
- **Context files**:
  - `clients/encore/specs_planning/_internal/field-inventory-spec.md` (artifact format authority)
  - `clients/encore/specs_planning/_internal/field-inventories/_TEMPLATE.md` (template)
  - `clients/encore/specs_planning/_internal/field-inventories/local-office-settings-2026-04-27.md` (reference shape)
  - `clients/encore/specs_planning/test-cases/setup/locations/locations_legal_test_cases.md` (do NOT read until Phase 2 diff step)
  - `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md` (Legal v1 gaps #16, #17)
  - LR-038 v2, LR-040, LR-041, LR-042, LR-046 (`.claude/rules/`)

## Phase 0 — Dependency + browser-tool gate

1. Confirm SP-AAE-01..05 + SP-DQU-03/04/05 are all `Status: DONE` (grep `plans/done/`).
2. Run `npm run validate:fieldinventory-staleness`:
   - **No artifact yet for Legal** (expected on first revival run) → fall through to Phase 1's emit-new-artifact path per LR-013 (b). NOT a HALT.
   - **Artifact exists, ≤14d fresh** → spot-check path (LR-013 a) is preferred but Phase 1's full walk is still acceptable on first revival to establish baseline.
   - **Artifact exists, >30d stale** → HALT, refresh required.
3. Announce browser tool per LR-038 v2: `Browser tool: Playwright CLI. Reason: catalog walkthrough, ~N fields, unattended.`
4. **HALT** only if (a) any prereq subplan is not DONE, or (b) staleness exits with the >30d-stale exit code.

## Phase 0.5b — Baseline-first walk (LR-045 row 4 / LR-ENC-001 / D11)

Before Phase 1's e2e walk, visit nav2 baseline first and emit `clients/encore/specs_planning/_internal/old-site-baseline/legal-<TODAY>.md`. If an artifact ≤14 days old exists, spot-check 2-3 fields per LR-013; otherwise emit fresh.

1. Chrome Claude (LR-038 v2 auth-heavy row): `navigate` to `https://navigator2.training.psav.com/#/setup/locationdetail/1604`. Locate the equivalent Legal sub-tab.
2. Walk every interactive field. Capture name=/id= attrs, defaults, validation, dependencies.
3. Emit baseline artifact per LR-045 free-form (6-section reference: `OSB-ACCESS-VERIFY-2026-04-24.md`). Frontmatter `baselineScope: full | baseline-partial | baseline-absent`.
4. Phase 1's field-inventory frontmatter sets `Baseline_Artifact: old-site-baseline/legal-<TODAY>.md`.
5. Phase 2's diff step adds `## Baseline diff` section classifying each divergence as regression-from-baseline (file BUG-* with `baselineComparison`), intentional-UX-change (link Jira/NM-*), or baseline-absent.

**HALT gate**: regression-from-baseline count > 5 → STOP, escalate per LR-040.

## Phase 1 — WATCHDOG: emit field-inventory artifact

**Output**: `clients/encore/specs_planning/_internal/field-inventories/legal-<TODAY>.md`

1. Navigate to `/navigator/locations/1604/settings/location` and click the **Legal** tab.
2. Walk the live DOM via Playwright CLI; capture every interactive field's: name, data-testid, control type, default value, validation rules, enabled/disabled states, cross-field dependencies.
3. Emit artifact per `field-inventory-spec.md` — **8 mandatory frontmatter keys** (in order):
   1. `Module: legal`
   2. `Client: encore`
   3. `MCP_Session_Date: <today's ISO date>`
   4. `MCP_Session_Tool: Playwright MCP` (legacy enum value pending SP-PWC2-05 normalization)
   5. `MCP_Tool_Reason: <one-line free text>` — note actual CLI usage if applicable.
   6. `Author_Identity: WATCHDOG`
   7. `Page_URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location` (Legal tab)
   8. `Test_Entity: Office 1604`
   - Optional 9th key: `Baseline_Artifact` — required if `baselineScope: full|baseline-partial` per PLN-049; check for `clients/encore/specs_planning/_internal/old-site-baseline/legal-*.md`.
4. Emit **7 mandatory sections**: URL(s) visited, Field Inventory, Labels + Section Names, Live-state caveat, Known App Bugs, Save-cycle observations, Staleness signal.
5. **Priority focus fields** (verify each):
   - ServiceChargeId + TermsConditionsId required-validation (Radix Select NOT-AUTOMATABLE re-confirm).
   - ServiceChargeNames + TermConditionNames alphabetical sort (APP-bug candidate per v1 rule).
   - Language filter behavior.
   - Country change cascade (note non-testable on 1604).
6. **LR-014 compliance**: every Field Inventory row has non-empty data-testid OR explicit fallback.
7. **LR-015 compliance**: defaults read live on MCP_Session_Date.
8. Pre-commit hook (SP-AAE-02) validates artifact on `git add`. Fix any hook failures before proceeding.
9. **HALT gates**:
   - >5 new APP bug candidates surface → STOP, present to user via AskUserQuestion before Phase 2.
   - Phase 0.5 drift detected → log `DRIFT_DETECTED`, document in Live-state caveat.

## Phase 2 — HEALER: diff TC MD, file bugs, re-export CSV

1. Switch identity: `/identity HEALER` (issue a fresh `/identity` call).
2. Diff Phase 1 artifact against `clients/encore/specs_planning/test-cases/setup/locations/locations_legal_test_cases.md`.
3. For each diff: apply fix to TC MD with inline `**MCP_VERIFICATION_LOG**: legal-<date>.md §Field Inventory row "<field>" — <evidence>` citation.
4. File `BUG-LEG-NNN.json` per LR-034 schema for any APP-layer defect. Append `**Status**: Blocked by BUG-LEG-NNN` to affected TCs.
5. Rebuild the XLSX deliverable: `npm run xlsx:build` (re-parses the edited Legal MD into `clients/encore/testcases/encore_test_cases.xlsx`; the per-module CSV re-export was retired in PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION Phase D). Verify the Tags column is populated in the legal sheet.
6. Regression fingerprint snapshot before + after via `/regression-guard`.

## Acceptance criteria (LR-040 closure gate — every diffed item classified)

For every field surfaced in Phase 1 → Phase 2 must classify each as:

- **(a) MCP-proven** — TC MD updated with MCP_VERIFICATION_LOG citation, OR
- **(b) Grep-verifiable hand-off** — line item exists in a named downstream subplan, AND verifier has run `grep "<item-text>" <recipient-file>` and found it, OR
- **(c) User-flagged** — named bug ID + Pending decision, OR `**Discussion item**:` per `feedback_discussion_item_not_bug.md`.

**HALT before flipping `Status: DONE`** if any item lacks (a)/(b)/(c).

## LR-046 acknowledgment (strict lines)

- "Every TC cites MCP_VERIFICATION_LOG" — strict. APPEND-and-close on a miss = automatic /final-q RED.
- "Heuristic runs clean" — strict. Pre-existing hits before this run can be APPEND'd to a follow-up only with explicit user authorization (`override approved`); else HALT.
- ">5 new APP bugs" — strict HALT, ASK user, do NOT proceed unilaterally.

## Handoff

1. Activity-log row per LR-028 (timestamp ≥ all touched-file mtimes per LR-037).
2. `/final-q` v2 evidence-emission — every cross-check formatted as `ran '<cmd>' → output: '<snippet>'` (LR-042 §E).
3. On GREEN: `mv plans/pending/SUBPLAN_DQU_13_F1b_LEGAL_AUDIT.md plans/done/`, update Status + Executed + Execution Summary (LR-027), run `npm run plans:reindex`. Parent-cascade: grep `plans/pending/` for siblings of `Parent: PLAN_DELIVERABLE_QUALITY_UPGRADE.md`; many remain → no parent closure yet.

## Why no `## Artifacts produced` section (intentional design)

`scripts/check-subplan-identity.mjs` parses the FIRST `Identity:` ALL-CAPS word; with two-phase WATCHDOG → HEALER, only WATCHDOG is captured. Listing both phases' artifact paths would fail HEALER's TC-MD-edit ownership check. Resolution: omit the section. Phase 0.1 exits 0 with `skipped: true`. Mid-subplan identity-switch via `/identity HEALER` updates the active identity at runtime; PreToolUse hook (SP-IDS-01) gates writes against the post-switch identity.
