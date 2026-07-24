# PLAN_GATE_DEBT_CLOSURE

**Status**: Pending
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: plan
**Created**: 2026-07-24

---

## Purpose

Close the remaining gate-enforcement gaps identified by the 2026-07-13 Council census audit
(COUNCIL-REFUTE-REPORT.md rows F3, F4, F5, P3) plus the enforcement-claims lint ramp and
census completion corrections. Each row below is a discrete workstream; they may execute in
any order but share a dependency on the telemetry wiring landed by TICKET-fix-b.

## Bootstrap

- Depends on: TICKET-fix-b (pre-push range fix + gate-fire telemetry) — landed.
- All items below are S1 per LR-069 §3.1 (silent quality drift surviving to commit/ship).
- Each item lands at `announce` first per §3.3 ramp discipline.

## Workstreams

| ID | Description | LR-069 Sev | Layer | Ramp |
|---|---|---|---|---|
| A | **Baseline-artifact prevent-gate** (census F3). PreToolUse hook that denies TC/audit output when no dated baseline-artifact exists for the target module. Prevents the "no old-site walk" class. | S1 | PreToolUse | announce → deny after 10 clean sessions |
| B | **Field-inventory coverage gate** (census F4). PreToolUse hook requiring a non-stale field-inventory artifact before walk-closure edits. Enforces the affordance/per-launcher HARD STOP stack structurally. | S1 | PreToolUse | announce → deny after 10 clean sessions |
| C | **TDW provenance gate** (census F5). PreToolUse hook verifying Tiered-Delegated-Walk worker reports carry verified-output evidence before closure. Enforces the TDW ladder structurally. | S1 | PreToolUse | announce → deny after 10 clean sessions |
| D | **Plan model/thinking validator** (census P3). PreToolUse on Edit/Write to plans/**. Validates Model/Thinking/PermissionMode frontmatter values against LR-041 allowed combos. Independent from the skill-step instruction layer. | S1 | PreToolUse | announce → deny after 20 clean plans |
| E | **Enforcement-claims lint ramp** (announce→enforce). `scripts/check-enforcement-claims.mjs` currently runs announce-only. Flip to enforce after the 29 recount-missed claims are resolved + the 1 phantom row removed + R11 correction applied. | S1 | pre-commit | announce → deny after census corrections land |
| F | **Census completion**. Resolve the 29 recount-missed enforcement claims, remove the 1 phantom row, and apply the R11 PARTIAL correction (pre-push range fix makes R11 REAL again). | S2 | n/a (data fix) | n/a |

## Acceptance Criteria

1. Each gate (A–D) has a dedicated `check-*.mjs` in `.claude/hooks/lib/` with `--self-test` passing.
2. Each gate fires telemetry to `.claude/state/gate-fires.log` on every deny/announce.
3. Each gate lands at `announce` in `.claude/guardrail-config.json` with `ramp_started` date.
4. Item E: `check-enforcement-claims.mjs` exits 1 on any unresolved claim when mode=`deny`.
5. Item F: census spreadsheet/log updated; no phantom rows; R11 marked REAL.
6. All self-tests pass; no pre-commit regression.
