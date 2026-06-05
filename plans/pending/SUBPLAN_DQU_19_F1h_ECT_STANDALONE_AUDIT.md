# SUBPLAN: Neutral-Eye Audit + Fix — ECT (Standalone Scope-Check)

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
**BrowserToolJustification**: Catalog walkthrough per LR-038 v2 — CLI primary with grep-over-disk discipline. Phase 0 is a live-CLI scope-check (judgment-required); mid-subplan switch to Chrome allowed only on Entra FedAuth refresh per `.claude/rules/browser-tool.md` Gate 3 protocol.

---

## Provenance (vision preservation)

This subplan was originally authored 2026-04-22 with the following goal:

> **Scope check may short-circuit to "covered by SP-02"**

It was marked SUPERSEDED on 2026-04-25 by SP-AAE-06 (parallel-chain rollout). On **2026-04-28** the user rejected `/chain` orchestration; SP-AAE-06 was retired (Status: CANCELLED) and this subplan was **revived 2026-04-28** for **manual one-by-one `/execute`**. Revival applies the SP-AAE-01..05 system fix.

Original module-specific intent (preserved from pre-supersession plan body):
- Confirm scope: is ECT a distinct page or the same as the LOS-ECT tab?
- If distinct → audit it (full Phase 1 + Phase 2).
- If same as LOS-ECT (covered by SP-DQU-02/03) → close subplan with that note.

**This is NOT a routine module audit — Phase 0 is a judgment-required scope-check that may short-circuit Phase 1 + Phase 2 entirely.** Do NOT pre-assume the outcome.

## Bootstrap

- **Invoke with**: `/execute SUBPLAN_DQU_19_F1h_ECT_STANDALONE_AUDIT.md`
- **Identity**: WATCHDOG → (HEALER only if Phase 0 returns "distinct page" outcome)
- **Skills auto-called**: `/identity`, `/find-bugs` (Phase 1 if reached), `/bugfix` + `/regression-guard` (Phase 2 if reached), `/final-q` (close — always)
- **Context files**:
  - `clients/encore/CLAUDE.md` (LR-ENC-001 — ECT scope claim)
  - `clients/encore/CLAUDE.md (was MODULE_REGISTRY.md, removed 2026-05-19 per unified-matsumoto plan)` (line 31: `setup/ect-settings | /settings/ect`)
  - `clients/encore/docs/read_only_docs/AGENT_RULES_ENCORE.md` (line 56: stale "ECT tab on Locations Settings" claim — verify against live UI)
  - `clients/encore/specs_planning/test-cases/setup/local-office/local_office_ect_test_cases.md` (existing TC-LOS-ECT-001..018; split out of combined LOS test-cases on 2026-05-05)
  - `plans/done/SUBPLAN_DQU_02_B1_LOS_NEUTRAL_EYE_AUDIT.md` + `SUBPLAN_DQU_03_C1_LOS_FIXES_AND_REEXPORT.md` (LOS audits — already covered LOS-ECT tab)
  - `clients/encore/specs_planning/_internal/field-inventory-spec.md`
  - `clients/encore/specs_planning/_internal/field-inventories/_TEMPLATE.md`
  - LR-038 v2, LR-040, LR-041, LR-042, LR-046

## Phase 0 — ECT scope verification (live CLI, judgment-required)

**Codebase claims (verified 2026-04-28 by /plan session — NOT pre-assumed)**:
- `clients/encore/CLAUDE.md` LR-ENC-001: ECT Settings is a tab inside Local Office Settings (`/settings/local-office`).
- `MODULE_REGISTRY.md:31` lists `setup/ect-settings | /settings/ect` but no code or tests live at that path (`Glob` returned zero files in `setup/ect-settings/`).
- `local_office_ect_test_cases.md` (post-2026-05-05 split) covers the ECT Settings tab in full (TC-LOS-ECT-001..018, 18 TCs).
- `clients/encore/specs/local-office/local-office-ect.spec.ts` exists; no `setup/locations/...ect*` file exists.

**Live CLI verification** (mandatory — do NOT pre-assume):

1. **Browser-tool announcement** per LR-038 v2: `Browser tool: Playwright CLI. Reason: ECT scope-check verification, ~3 navigations, unattended.`
2. **Confirm prereqs**: SP-AAE-01..05 + SP-DQU-03/04/05 all `Status: DONE` (grep `plans/done/`).
3. **Probe `/settings/ect`**: Playwright CLI navigate to `https://cloudapps-e2e.encoreglobal.com/navigator/settings/ect`. Outcomes:
   - **404 / route-not-found / redirect-to-home** → ECT-as-standalone-page does not exist; the LOS-ECT tab is the only surface.
   - **Renders a page with form fields** → distinct standalone surface; full audit needed.
4. **Probe `/settings/location`**: Playwright CLI navigate to `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location` and inspect tab list. Confirm ECT does NOT appear as a Locations Settings tab (would contradict LR-ENC-001).
5. **Probe `/settings/local-office`**: Playwright CLI navigate to `https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/local-office` and confirm "ECT Settings" tab exists alongside "Basic Information" and "Location Settings History" — sanity check that LOS-ECT tab is still present.
6. **Compare findings to LR-ENC-001 claim**. If divergent → file BUG-ENC-NNN OR update LR-ENC-001 (whichever is wrong); HALT and ask user.

**Branch on outcome**:

### Branch A — ECT is fully covered by LOS-ECT tab (expected per codebase)

Phase 1 + Phase 2 are **NO-OP**. Close subplan with full evidence emission:

1. Skip Phase 1 (no field-inventory artifact needed; LOS already has `field-inventories/local-office-settings-2026-04-27.md` covering ECT Settings tab).
2. Skip Phase 2 (no diff against ECT-only TC MD because no ECT-only TC MD exists; existing TC-LOS-ECT-001..018 cover the tab).
3. Activity-log row per LR-028 documenting:
   - Phase 0 CLI evidence (3 navigations + outcomes).
   - Goal-preservation: "Original SP-DQU-19 vision (scope check) achieved; ECT confirmed as LOS tab; coverage already in TC-LOS-ECT-001..018."
   - Files touched: this subplan only (Status flip + Execution Summary).
4. Update Status: `**Status**: DONE`. Add `**Executed**: <today>`. Append `## Execution Summary` per LR-027:
   - Outcome: NO-OP (scope-check confirmed coverage).
   - CLI verification: 3 navigations, results.
   - Existing coverage: `clients/encore/specs_planning/test-cases/setup/local-office/local_office_ect_test_cases.md` (TC-LOS-ECT-001..018; split out of combined LOS file on 2026-05-05).
   - Vision-preservation: original Why-line "Scope check may short-circuit to 'covered by SP-02'" was the predicted outcome and is realized.
5. `mv plans/pending/SUBPLAN_DQU_19_F1h_ECT_STANDALONE_AUDIT.md plans/done/`.
6. `npm run plans:reindex`.
7. `/final-q` GREEN with the CLI evidence + activity-log row + Execution Summary.

### Branch B — ECT is a distinct standalone page (`/settings/ect` renders)

1. HALT this subplan immediately.
2. Author and file `SUBPLAN_DQU_19A_ECT_BOOTSTRAP_TC_MD.md` first to:
   - Create `clients/encore/specs_planning/test-cases/setup/ect-settings/ect_settings_test_cases.md` (TC MD).
   - Create `clients/encore/test_cases_csv/ect_settings_test_cases.csv` (initial export).
   - Add `setup/ect-settings/` directory tree per MODULE_REGISTRY convention.
3. After SP-DQU-19A is DONE, return to this subplan and proceed to Phase 1 (full audit) using the new artifact paths.

### Branch C — LR-ENC-001 is wrong / contradicts live UI

1. File a doc-correction sub-task (BUG-ENC-NNN if user-facing app divergence, OR a corrective subplan to fix LR-ENC-001 + AGENT_RULES_ENCORE.md:56 + MODULE_REGISTRY.md:31 if these docs are stale).
2. HALT this subplan until doc is reconciled.

---

## Phase 0.5b — Baseline-first walk (LR-045 row 4 / LR-ENC-001 / D11) — BASELINE-ABSENT

ECT Settings is **net-new on e2e per LR-ENC-001 architectural divergence** — zero nav2 equivalent. Per ALL-078 (escalation path: feature absent on baseline → flag, do NOT HALT):

1. SKIP nav2 walk for ECT-specific fields (Benefits Multiplier, Historical Subrental %, Labor Cost Assumptions table, SubRental Matrix, Event Profit Target, Approval Threshold, etc.).
2. Record `baselineScope: baseline-absent` + `Baseline_Artifact: (none — ECT net-new on e2e per LR-ENC-001)` in Phase 1's field-inventory frontmatter.
3. Truth source for ECT behavior = REQUIREMENTS.md + `Functional Requirement -v1.docx` + Jira NM-* tickets (NOT nav2).
4. Phase 2's diff step records `baselineScope: baseline-absent` for every ECT field row in `## Baseline diff`. No regression-from-baseline classifications possible.
5. If Branch C fires (LR-ENC-001 itself contradicts live UI), the doc-correction sub-task is the recovery path.

## Phase 1 — WATCHDOG: emit field-inventory artifact (only on Branch B)

**Output**: `clients/encore/specs_planning/_internal/field-inventories/ect-<TODAY>.md`

1. Navigate to `/navigator/settings/ect` (the standalone ECT page confirmed by Phase 0 Branch B).
2. Walk live DOM via Playwright CLI.
3. Emit artifact per `field-inventory-spec.md` — **8 mandatory frontmatter keys**:
   1. `Module: ect`
   2. `Client: encore`
   3. `MCP_Session_Date: <today's ISO date>`
   4. `MCP_Session_Tool: Playwright MCP` (legacy enum)
   5. `MCP_Tool_Reason: <one-line free text>`
   6. `Author_Identity: WATCHDOG`
   7. `Page_URL: https://cloudapps-e2e.encoreglobal.com/navigator/settings/ect`
   8. `Test_Entity: Office 1604`
4. Emit **7 mandatory sections** + LR-014/015 compliance.
5. Pre-commit hook validates on `git add`.
6. **HALT gates**: >5 new APP bugs → ask user. Drift → log + document.

## Phase 2 — HEALER: diff new TC MD, file bugs, re-export CSV (only on Branch B)

1. Switch identity: `/identity HEALER`.
2. Diff Phase 1 artifact against `clients/encore/specs_planning/test-cases/setup/ect-settings/ect_settings_test_cases.md` (created by SP-DQU-19A).
3. Apply fixes with `**MCP_VERIFICATION_LOG**: ect-<date>.md §<section> "<field>" — <evidence>` citations.
4. File `BUG-ECT-NNN.json` per LR-034.
5. Re-export CSV with Tags column (SP-DQU-06 format).
6. Regression fingerprint via `/regression-guard`.

## Acceptance criteria (LR-040 closure gate)

For every field surfaced (in Branch B Phase 1 → Phase 2) must classify each as (a) MCP-proven, (b) Grep-verifiable hand-off, or (c) User-flagged. **HALT before `Status: DONE`** if any item lacks (a)/(b)/(c).

For Branch A (NO-OP): the closure gate is the Phase 0 evidence itself — every probed URL must have a documented outcome.

## LR-046 acknowledgment (strict lines)

- "Every TC cites MCP_VERIFICATION_LOG" — strict (Branch B only). APPEND on miss = /final-q RED.
- "Phase 0 CLI verification before assuming" — strict. Skipping live CLI checks and assuming outcome = automatic /final-q RED.
- ">5 new APP bugs" — strict HALT.

## Handoff

1. Activity-log row per LR-028 (timestamp ≥ touched-file mtimes per LR-037).
2. `/final-q` v2 evidence-emission per LR-042 §E. **Phase 0 outcome (A/B/C) + CLI evidence is mandatory** in the verdict.
3. On GREEN: `mv` to `plans/done/`, update Status + Executed + Execution Summary (LR-027). For Branch A, the Execution Summary is the closure note. For Branch B, it follows the standard module-audit shape.

## Why no `## Artifacts produced` section (intentional)

Two-phase WATCHDOG → HEALER: `check-subplan-identity.mjs` captures only WATCHDOG. Omitting → Phase 0.1 `skipped: true`. Mid-subplan `/identity HEALER` switch (Branch B only) + PreToolUse hook handles post-switch ownership.
