# SUBPLAN SP-AAE-06: Parallel 9-Module Rollout Under New System

**Status**: CANCELLED
**Cancelled**: 2026-04-28
**Cancellation reason**: Manual one-by-one revival per user direction 2026-04-28 ("no chain, i dont trust it"). Parallel-chain orchestration was rejected; the 9 module audits are revived as standalone subplans (SP-DQU-12..20) for sequential `/execute`. See SP-DQU-12..20 in `plans/pending/` for the actual work; the original body below is preserved unchanged as historical record of the parallel approach considered.
**Priority**: P0-CYCLE-1
**Created**: 2026-04-23
**Parent**: PLAN_AGENT_AUTHORING_EFFICIENCY.md
**Depends on**: SP-AAE-01..05 (full system fix), SP-DQU-03 (LOS end-to-end validation of the gate), SP-DQU-04 + SP-DQU-05 (LI validation — proves pattern on 2 modules before rolling to 9)
**Blocks**: (none — cancelled; the 9 superseded subplans are revived directly, see Cancellation note below)

<!-- NUMBERING-CORRECTION 2026-04-28: this line previously read "SP-DQU-12..21". That range was wrong twice: (1) DQU-21 is Track G leftover-state, never superseded by AAE-06; (2) DQU-11 IS superseded (the module-audit planner) but the original range started at 12. Verified 2026-04-28 supersession-integrity sweep: superseded set = SUBPLAN_DQU_11_F1_REMAINING_MODULES_PLANNER + SUBPLAN_DQU_12..20 (9 module audits). DQU-21 has no Superseded by field and remains independently pending. If git history or older activity-log rows show "12..21" — they are pre-correction. -->


**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a

*Thinking justification*: Orchestration work — chain spawns, activity-log aggregation, parallel batch coordination. Deterministic + mechanical. Sonnet + hi sufficient.

---

## Supersession Map (verified 2026-04-28)

This subplan absorbs **10** Track F subplans. Exact mapping — confirmed against each file's `**Superseded by**: SP-AAE-06` field on 2026-04-28:

| Superseded plan | Module / role | File |
|---|---|---|
| SP-DQU-11 | Module-audit Planner (folded — no separate planner step) | `done/SUBPLAN_DQU_11_F1_REMAINING_MODULES_PLANNER.md` |
| SP-DQU-12 | Pricing | `done/SUBPLAN_DQU_12_F1a_PRICING_AUDIT.md` |
| SP-DQU-13 | Legal | `done/SUBPLAN_DQU_13_F1b_LEGAL_AUDIT.md` |
| SP-DQU-14 | Currency | `done/SUBPLAN_DQU_14_F1c_CURRENCY_AUDIT.md` |
| SP-DQU-15 | Notes | `done/SUBPLAN_DQU_15_F1d_NOTES_AUDIT.md` |
| SP-DQU-16 | Account & Address | `done/SUBPLAN_DQU_16_F1e_ACCOUNT_ADDRESS_AUDIT.md` |
| SP-DQU-17 | Shared Setup Locations | `done/SUBPLAN_DQU_17_F1f_SHARED_SETUP_AUDIT.md` |
| SP-DQU-18 | Auto Add-On | `done/SUBPLAN_DQU_18_F1g_AUTO_ADDON_AUDIT.md` |
| SP-DQU-19 | ECT Standalone (distinct from LOS-ECT tab) | `done/SUBPLAN_DQU_19_F1h_ECT_STANDALONE_AUDIT.md` |
| SP-DQU-20 | Location Management History | `done/SUBPLAN_DQU_20_F1i_MGMT_HISTORY_AUDIT.md` |

**EXPLICITLY NOT superseded**: SP-DQU-21 (`Leftover-State Audit`, Track G — different scope, separate parent chain through SP-DQU-22..25). Remains independently pending.

If a future agent reads "SP-DQU-12..21" in any older artifact (git history, activity log, prior INDEX snapshot) — that was a pre-correction range. Authoritative range is SP-DQU-11..20.

---

## ⚠️ DO NOT RUN EARLY

This subplan runs **LAST** in the AAE+DQU sequence (Step 11 — see [PLAN_AGENT_AUTHORING_EFFICIENCY.md §Run sequence](PLAN_AGENT_AUTHORING_EFFICIENCY.md)). Even though reindex may display it near the other AAE subplans visually, its real prerequisites are:

- **SP-AAE-01..05** — the full system fix must be live
- **SP-DQU-03** — LOS fixes must have validated the gate end-to-end
- **SP-DQU-04 + SP-DQU-05** — LI must have proven the pattern on a 2nd module

The Bootstrap Phase 0 directive below enforces this via a dependency gate — it HALTs if any of the above is not DONE. Do not try to skip or override the gate.

---

## Bootstrap (agent reads this first)

**Invoke with**: `/execute SUBPLAN_AAE_06_PARALLEL_ROLLOUT.md`
**Identity**: OWNER
**Skills auto-called**: /identity, /chain, /audit, /final-q
**Context files** (read before Phase 0):
- `plans/pending/PLAN_AGENT_AUTHORING_EFFICIENCY.md` (parent — AAE-D7 parallel batches)
- `plans/pending/PLAN_DELIVERABLE_QUALITY_UPGRADE.md` (remaining 9 modules listed in Track F)
- `plans/done/SUBPLAN_AAE_04_CONSUMERS_NO_REWALK.md` (confirms consumers are 1x)
- `.claude/skills/chain/SKILL.md` (chain orchestration mechanics)
- LR-038 (browser-tool selection — Chrome Claude default for auth-heavy)
- LR-041 (model/effort/permission-mode per subplan)
- LR-042 (final-q mandatory + chain-sessions discipline)

**Phase 0 directive**: confirm all of SP-AAE-01..05 + SP-DQU-03, SP-DQU-04, SP-DQU-05 are DONE. Confirm `/chain` infrastructure is healthy (no orphan chain-sessions, staleness warnings clear).

**Handoff sequence**:
- Activity-log row per wave (3 rows total).
- Consolidated activity-log row on close.
- `/final-q` mandatory (LR-042).

**HALT conditions**:
- Any dependency not DONE → HALT.
- Chain orchestrator has >2 chain-sessions in pending-audit state → HALT, run `/chain_audit` first (LR-042).
- Wave 1 (first 3 modules) surfaces a class of defect not covered by the system fix → HALT, ask user (rollout paused until system patch).

---

## Purpose

Run the 9 remaining Encore modules through neutral-eye audit + fix + re-export, **in parallel batches of 3**, using the system fix built in SP-AAE-01..05. Prove the system scales. Target: ≤3 calendar days for all 9 modules clean.

## Module list (9 remaining per DQU parent)

1. Pricing
2. Legal
3. Currency
4. Notes
5. Account & Address
6. Shared Setup Locations
7. Auto Add-on
8. Top-Level (if applicable — confirm scope at Phase 0)
9. Orphan columns / miscellaneous (confirm scope)

*(Final list locked at Phase 0 against PLAN_DELIVERABLE_QUALITY_UPGRADE.md Track F; any mismatch HALT.)*

## Step-by-step

1. **Phase 0 — Dependency + infra check**:
   - Confirm all prereq subplans DONE.
   - Confirm `npm run validate:fieldinventory-staleness` reports only LOS + LI artifacts present (≤14 days old).
   - Confirm `/chain` state is clean.
2. **Wave 1 — 3 modules**:
   - Spawn 3 parallel `/execute SUBPLAN_AAE_06_MODULE_<name>.md` sessions via `/chain` per module.
   - Each module session: planner emits field-inventory → fixer diffs against TC MD → files BUG-*.json as needed → re-exports CSV.
   - **Instrumentation calibration (deferred from SP-AAE-04 steps 6-7)**: on the FIRST module of Wave 1 — when generator runs Phase 0.5a against the freshly-emitted artifact, capture: (a) DOM tool-call count for spot-check happy path (must be ≤5: 3 spot-checks + ≤2 navigation/setup); (b) deliberately corrupt one field's default in the artifact, re-run generator, confirm `DRIFT_DETECTED` fires + Phase 0.5b full re-walk engages. Log both as activity-log rows (LR-037 wall-clock). If (a) >5 calls or (b) drift not detected → HALT wave, file SP-AAE-04 follow-up. SP-AAE-04 closed without instrumentation because no real artifact existed yet (only `_TEMPLATE.md`); SP-AAE-06's first wave is the first natural opportunity.
   - Wait for all 3 `/final-q` verdicts. GREEN only = proceed.
3. **Wave 2 — next 3 modules**: same protocol.
4. **Wave 3 — final 3 modules**: same protocol.
5. **Consolidated audit**:
   - `/audit` full-chain across all 9 modules.
   - Every TC in every module cites `MCP_VERIFICATION_LOG`.
   - Every field-inventory artifact is fresh (≤14 days).
   - Every BUG-*.json filed has a corresponding `Status: Blocked by BUG-*` in its affected TC MD.
6. **Client-review simulation**:
   - Pick 3 random TCs per module (27 total).
   - Diff each against its artifact — zero defects allowed.
   - If any defect: HALT, RCA, patch system if system failure; patch module if data failure.
7. **`/final-q`** mandatory (LR-042). Emit GREEN only if all gates pass.

## Per-module mini-subplan template

Since 9 modules need consistent handling, emit 9 small per-module subplans (SP-AAE-06-A..I) with a shared template. Each carries module name, CSV path, TC MD path, expected artifact path. Template lives inline in this subplan's §Appendix.

*(SP-AAE-06 owner generates the 9 per-module files on Phase 0 from the template; they are spawned by `/chain`.)*

---

## Artifacts produced

- 9 `field-inventories/<module>-YYYY-MM-DD.md` artifacts.
- 9 updated TC MD files (corrections applied).
- 9 re-exported CSVs under `clients/encore/exports/`.
- N BUG-*.json files (count TBD per module).
- Activity-log rows per wave + consolidated row.
- `/final-q` GREEN verdict transcript.

## Success criteria

- [ ] All 9 modules: fresh field-inventory artifacts present.
- [ ] All 9 module TC MDs: every TC cites MCP_VERIFICATION_LOG.
- [ ] All 9 CSVs: re-exported under new format (Tags column per SP-DQU-06).
- [ ] Heuristic runs clean on all 9 module TC MDs.
- [ ] Staleness runs clean on all 9 artifacts.
- [ ] Consolidated `/audit` GREEN.
- [ ] LR-040 closure gate: every module + every artifact + every BUG has (a)/(b)/(c) classification.
- [ ] Calendar: ≤3 wall-clock days from wave 1 start to final-q GREEN.

## Handoff

- Activity-log consolidated row (LR-037 wall-clock ≥ latest mtime of any touched file).
- Chat handoff to client-delivery owner: 10/10 modules clean (LOS + LI + 9 new).
- On close: `git mv` this file + 9 per-module files to `plans/done/`, update Status + Executed, run `npm run plans:reindex`, run `npm run validate:activity-log:preflight`.

---

## Appendix — Per-module subplan template (pseudo-code)

```md
# SUBPLAN SP-AAE-06-<X>: <MODULE> Neutral-Eye + Fix Under New System

**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**Identity**: WATCHDOG → HEALER (two phases)
**Skills**: /find-bugs, /bugfix, /regression-guard, /final-q

Phase 1 (WATCHDOG, Chrome Claude per LR-038): emit `<module>-<date>.md` field-inventory artifact.
Phase 2 (HEALER): diff TC MD against artifact, file bugs, re-export CSV.
HALT if >5 bugs (LR-040 re-scope gate).
```

---

## Cancellation note (2026-04-28)

Cancelled in favor of manual one-by-one revival of the 9 supersedee subplans. See `plans/pending/SUBPLAN_DQU_12_F1a_PRICING_AUDIT.md` through `SUBPLAN_DQU_20_F1i_MGMT_HISTORY_AUDIT.md` (revived 2026-04-28). Each carries forward the original module-audit goal under the new SP-AAE-01..05 system fix without `/chain` orchestration.

SP-DQU-11 (planner subplan) remains in `plans/done/` as SUPERSEDED — its planner-vision is preserved by direct revival of the 9 module audits.

Authoring this cancellation note: see `C:/Users/rutvi/.claude/plans/plan-a-fix-to-humble-wren.md` for the full revival rationale and order of operations.
