# SUBPLAN: Neutral-Eye Audit + Fix — Account & Address

**Status**: Pending
**Priority**: P0-CYCLE-1
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-AAE-01, SP-AAE-02, SP-AAE-03, SP-AAE-04, SP-AAE-05, SP-DQU-03, SP-DQU-04, SP-DQU-05
**Model**: claude-opus-4-7
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: cli
**BrowserToolJustification**: Catalog walkthrough per LR-038 v2 — CLI primary with grep-over-disk discipline. Mid-subplan switch to Chrome allowed only on fresh MFA/TOTP refresh per `.claude/rules/browser-tool.md` switch protocol.

---

## Provenance (vision preservation)

This subplan was originally authored 2026-04-22 with the following goal:

> **Client-visible, money-adjacent**

It was marked SUPERSEDED on 2026-04-25 by SP-AAE-06 (parallel-chain rollout). On **2026-04-28** the user rejected `/chain` orchestration; SP-AAE-06 was retired (Status: CANCELLED) and this subplan was **revived 2026-04-28** for **manual one-by-one `/execute`**. Revival applies the SP-AAE-01..05 system fix.

Original module-specific focus areas (preserved from pre-supersession plan body):
- Phone1 validation path (already tested with 5 TCs — reconfirm).
- BAS-016 finding cross-check: is the Phone1 validation difference between LOS and Account & Address actually a bug?
- Address Line 1 required (parent-level condition per save-button disable rules).
- Phone2/Email optional fields.
- Master Address relationship + empty-line validation.
- Cross-tab save-button conditions (#21 from `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md`).

## Bootstrap

- **Invoke with**: `/execute SUBPLAN_DQU_16_F1e_ACCOUNT_ADDRESS_AUDIT.md`
- **Identity**: WATCHDOG → HEALER (two phases, switch via `/identity` between Phase 1 and Phase 2)
- **Skills auto-called**: `/identity`, `/find-bugs` (Phase 1), `/bugfix` + `/regression-guard` (Phase 2), `/final-q` (close)
- **Context files**:
  - `clients/encore/specs_planning/_internal/field-inventory-spec.md`
  - `clients/encore/specs_planning/_internal/field-inventories/_TEMPLATE.md`
  - `clients/encore/specs_planning/_internal/field-inventories/local-office-settings-2026-04-27.md`
  - `clients/encore/specs_planning/test-cases/setup/locations/locations_account_address_test_cases.md` (do NOT read until Phase 2 diff step)
  - `plans/pending/PLAN_REQUIREMENTS_DRIVEN_TEST_QUALITY_UPGRADE.md` (#21 cross-tab save-button conditions)
  - LR-038 v2, LR-040, LR-041, LR-042, LR-046

## Phase 0 — Dependency + browser-tool gate

1. Confirm SP-AAE-01..05 + SP-DQU-03/04/05 are all `Status: DONE`.
2. Run `npm run validate:fieldinventory-staleness`:
   - **No artifact yet for Account & Address** → fall through to Phase 1 emit-new-artifact path per LR-013 (b). NOT a HALT.
   - **Artifact ≤14d fresh** → spot-check OK.
   - **Artifact >30d stale** → HALT.
3. Announce: `Browser tool: Playwright CLI. Reason: catalog walkthrough, money-adjacent fields, unattended.`
4. **HALT** only on (a) prereq not DONE, or (b) >30d-stale exit.

## Phase 0.5b — Baseline-first walk (LR-045 row 4 / LR-ENC-001 / D11)

Before Phase 1's e2e walk, visit nav2 baseline first and emit `clients/encore/specs_planning/_internal/old-site-baseline/account-address-<TODAY>.md`. If an artifact ≤14 days old exists, spot-check 2-3 fields per LR-013; otherwise emit fresh.

1. Chrome Claude (LR-038 v2 auth-heavy row): `navigate` to `https://navigator2.training.psav.com/#/setup/locationdetail/1604`. Locate the equivalent Account & Address sub-tab.
2. Walk every interactive field. Capture name=/id= attrs, defaults, validation, dependencies (special focus per #21: cross-tab save-button conditions).
3. Emit baseline artifact per LR-045 free-form. Frontmatter `baselineScope: full | baseline-partial | baseline-absent`.
4. Phase 1's field-inventory frontmatter sets `Baseline_Artifact: old-site-baseline/account-address-<TODAY>.md`.
5. Phase 2's diff step adds `## Baseline diff` section classifying divergences as regression-from-baseline / intentional-UX-change / baseline-absent.

**HALT gate**: regression-from-baseline count > 5 → STOP, escalate per LR-040.

## Phase 1 — WATCHDOG: emit field-inventory artifact

**Output**: `clients/encore/specs_planning/_internal/field-inventories/account-address-<TODAY>.md`

1. Navigate to `/navigator/locations/1604/settings/location` and click the **Account & Address** tab.
2. Walk live DOM via Playwright CLI.
3. Emit artifact per `field-inventory-spec.md` — **8 mandatory frontmatter keys**:
   1. `Module: account-address`
   2. `Client: encore`
   3. `MCP_Session_Date: <today's ISO date>`
   4. `MCP_Session_Tool: Playwright MCP` (legacy enum)
   5. `MCP_Tool_Reason: <one-line free text>`
   6. `Author_Identity: WATCHDOG`
   7. `Page_URL: https://cloudapps-e2e.encoreglobal.com/navigator/locations/1604/settings/location` (Account & Address tab)
   8. `Test_Entity: Office 1604`
4. Emit **7 mandatory sections**: URL(s) visited, Field Inventory, Labels + Section Names, Live-state caveat, Known App Bugs, Save-cycle observations, Staleness signal.
5. **Priority focus fields**:
   - Phone1 format validation (cross-check vs BAS-016 LOS finding).
   - Address Line 1 required behavior + save-button disable cascade.
   - Phone2/Email optional field handling.
   - Master Address relationship + empty-line validation.
6. **LR-014/015 compliance**: data-testid + live defaults.
7. Pre-commit hook validates on `git add`.
8. **HALT gates**: >5 new APP bugs → ask user. Drift → log + document.

## Phase 2 — HEALER: diff TC MD, file bugs, re-export CSV

1. Switch identity: `/identity HEALER`.
2. Diff Phase 1 artifact against `locations_account_address_test_cases.md`.
3. Apply fixes with `**MCP_VERIFICATION_LOG**: account-address-<date>.md §<section> "<field>" — <evidence>` citations.
4. File `BUG-AA-NNN.json` per LR-034.
5. Re-export CSV: `npx ts-node export_test_cases/to-csv.ts clients/encore/specs_planning/test-cases/setup/locations/locations_account_address_test_cases.md clients/encore/exports/locations_account_address_test_cases.csv`. Verify Tags column.
6. Regression fingerprint via `/regression-guard`.

## Acceptance criteria (LR-040 closure gate)

Every diffed item: (a) MCP-proven, (b) Grep-verifiable hand-off, or (c) User-flagged. **HALT before `Status: DONE`** if any item lacks (a)/(b)/(c).

## LR-046 acknowledgment (strict lines)

- "Every TC cites MCP_VERIFICATION_LOG" — strict. APPEND on miss = /final-q RED.
- "Heuristic runs clean" — strict. Pre-existing hits APPEND only with `override approved`.
- ">5 new APP bugs" — strict HALT.

## Handoff

1. Activity-log row per LR-028 (timestamp ≥ touched-file mtimes per LR-037).
2. `/final-q` v2 evidence-emission per LR-042 §E.
3. On GREEN: `mv` to `plans/done/`, update Status + Executed + Execution Summary (LR-027), `npm run plans:reindex`.

## Why no `## Artifacts produced` section (intentional)

Two-phase WATCHDOG → HEALER: `check-subplan-identity.mjs` captures only WATCHDOG. Omitting → Phase 0.1 `skipped: true`. Mid-subplan `/identity HEALER` switch + PreToolUse hook handles post-switch ownership.
