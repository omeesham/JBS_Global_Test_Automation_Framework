# PLAN: Location Management History — Centralized Coverage (87 columns)

**Status**: GATED (full body) — **Phase 5e EXTRACTED 2026-06-05** → executed standalone via `plans/done/PLAN_NOTES_HIST_CONSOLIDATION.md`
**Priority**: P0-EMERGENCY
**Priority-note**: gated until parent rollout step 8 (Track B #2; one of 14 child plans for parent-flip)
**Created**: 2026-05-12
**Identity**: OWNER (planning) -> HUNTER + GIVER + BUILDER + WATCHDOG (execution per parent plan §3 3-agent routing)
**Parent**: `plans/pending/PLAN_DQU_COVERAGE_REMEDIATION.md`
**Depends on**: column-root catalogs (Local Office, ECT, Currency, Pricing, Notes col 69 done; Local Info, Account, Legal, Shared Setup, Auto-Addon, Top-Level pending — filled inline by Phase 1b per parent §6)
**Blocks**: parent plan flip to `done/` (one of 14 child plans per parent §7 parent-persistence rule)
**Blocker**: full body authoring is step 8 of parent rollout (gated on Shared Setup pilot + Notes redo + LO-History WATCHDOG GREEN per parent Order-of-execution lines 493-498)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: cli
**Skills**: `/execute`, `/audit`, `/find-bugs`, `/regression-guard`, `/encore-questions`, `/final-q`

---

## Context

This is the central plan for Location Management History coverage (87 columns). Authored as a STUB at parent plan `PLAN_DQU_COVERAGE_REMEDIATION.md` step 2.4 (2026-05-12) to close the LR-040 phantom-handoff window for the 32-file disposition pass in step 2.5 — every `SUBPLAN_HIST_PIVOT_*` row in the disposition table cites this file as either SUPERSEDED-BY or FOLDED-INTO recipient. The stub exists so those grep-verifiable line-item references resolve to a real file in `plans/pending/`.

**Why a STUB and not the full body**: per parent §6 + §9, full body authoring is step 8 of the rollout — runs only after Shared Setup pilot WATCHDOG GREEN (step 3), Notes redo WATCHDOG GREEN (step 4), and LO-History plan (step 5). Authoring the full LM-HISTORY body now would risk template breakage compounding across 87 columns before pilots validate the 4-matrix design (parent §7 pilots-only scope rationale).

**Provenance**: salvages content from 32 dispositioned `SUBPLAN_HIST_PIVOT_*` rows in parent §10 table — specifically the 12 SUPERSEDED-BY rows (22, 23, 24, 25, 26, 27, 30, 31, 32, 38, 20-LM-only-portion, SUBPLAN_DQU_20) and the 14 FOLDED-INTO rows whose recipient is `PLAN_LM_HISTORY_COVERAGE` (10, 11, 12, 13, 16, 17, 18, 19, 33, 34, 36, 37, 39, 40). Full body Phase 1b absorbs the catalog content from rows 10-17.

---

## Bootstrap

**Identity**: OWNER (planning); HUNTER / GIVER / BUILDER / WATCHDOG at execution per parent §3 routing table.

**Skills auto-called**:
- `/identity` (Step 1.5 gate per agent boundary)
- `/regression-guard` (wrap — BEFORE + AFTER snapshots per pilot/module Phase 5)
- `/relevant` (Phase 0.5 — skill + LR + agent-mistakes + patterns injection)
- `/audit` (Phase 7, fresh session per AUD-017)
- `/find-bugs` (Phase 7 closure — file BUGs against broken columns)
- `/final-q` (every per-column subplan exit per LR-042)

**Context files**:
- `plans/pending/PLAN_DQU_COVERAGE_REMEDIATION.md` (parent — §3 routing, §4 Phase 0 intake, §6 Track B workflow)
- `.claude/rules/pipeline.md` (LR-020, LR-027, LR-028, LR-040, LR-041, LR-046, LR-048, LR-050)
- `.claude/rules/baseline.md` (LR-045 baseline-first; auto-loads on edits under `clients/encore/specs_planning/_internal/old-site-baseline/`)
- `.claude/rules/browser-tool.md` (LR-038 v2; CLI primary per BrowserTool=cli)
- `.claude/rules/specs.md` (LR-018, LR-019, LR-023, LR-024)
- `.claude/rules/inventory.md` (field-inventory spec for Phase 1b consumption)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership for HUNTER/GIVER/BUILDER/WATCHDOG path-class authority)
- `docs/read_only_docs/LEARNED_RULES.md` (cross-cutting LR-NNN)
- `clients/encore/CLAUDE.md` (active client; LR-ENC-NNN)
- `clients/encore/specs_planning/_internal/field-inventory-spec.md` (consumed by Phase 1b)
- `clients/encore/specs_planning/_internal/bug-archetypes.md` (ARCH-001..012; ARCH-013/014 to be authored inline during Shared Setup pilot)
- `clients/encore/specs_planning/_internal/intake/` (Phase 0 intake artifact destination)
- Salvage source: every `plans/done/SUBPLAN_HIST_PIVOT_*` row dispositioned to this plan in parent §10

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY at full-body authoring)

1. Confirm Depends-on column-root catalogs are filled (LO, ECT, Currency, Pricing, Notes col 69 already done; remainder filled inline by Phase 1b — gate is "any subset with done catalogs is workable").
2. Read `.claude/context/navigation.md` (R00) — pull Exploration Registry findings for `setup/locations/management-history`.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter by active agent identity prefix (HUNTER → ALL-*/REQ-*; GIVER → ALL-*/PLN-*; BUILDER → ALL-*/GEN-*; WATCHDOG → ALL-*/AUD-*).
4. Read `.claude/context/patterns.md` — match HIST-relevant decision trees (Modified-On timestamp anchor, multi-row " | " encoding, boolean-collapse fix, auto-row artifact, ARCH-013 sequential-save).
5. LR scan — every active LR rule per touched-file path-scope.
6. **Browser-tool announcement** (LR-038 v2): `BrowserTool=cli`. Reason: HIST verification = byte-exact column compare from root saves; unattended, multi-column batch ≈ catalog-walkthrough class per matrix row "Catalog walkthrough / locator discovery (>10 fields)".

---

## Phase 0.5b — Baseline-first walk (CONDITIONAL — REQUIRED here)

REQUIRED triggers that fire:
- Skills include `/find-bugs` (Phase 7 closure files BUGs against broken columns).
- Plan output drives TC corrections (Phase 5d new TCs; Phase 5e migration of TC-LOC-NTS-028..032 + 038 was EXTRACTED + executed 2026-06-05 via PLAN_NOTES_HIST_CONSOLIDATION).

Per-column baseline workflow at full-body authoring:
1. Visit baseline (Nav2) per `.claude/rules/baseline.md` workflow row 4 for each column under test.
2. Emit/refresh `clients/encore/specs_planning/_internal/old-site-baseline/location-management-history-<YYYY-MM-DD>.md` (≤14-day freshness per LR-013 spot-check).
3. Classify every e2e-vs-Nav2 column divergence per (a) regression / (b) intentional / (c) `baselineScope: baseline-absent` per LR-ENC-001.
4. Every BUG-*.json filed against an LM-History column carries `baselineComparison` + `baselineEvidence` per LR-034.
5. Findings doc emits a `## Baseline diff` section per column under test.

---

## Phase 1b — Catalog completion + field inventory (FULL BODY DEFERRED)

> **STUB NOTICE.** Full Phase 1+ body deferred to parent plan `PLAN_DQU_COVERAGE_REMEDIATION.md` step 8 per parent Order-of-execution (line 498). This section header reserves the slot; full content lands after pilots validate the 4-matrix template.

Full body will enumerate:
- Per-column scenario depth (parent §6 "no-laziness" list: empty→content, boundary, special chars, unicode, newlines, multi-row " | " encoding, partial-delete, sequential-save ARCH-013, update-existing, empty-after-delete-all, cross-tab ARCH-013, auto-row BUG-LOC-NTS-003 style).
- Per-column TC: navigate to root → save scenario → navigate to History → byte-exact verify column (`.toContain([formA, formB])` for valid-form sets; `Modified On >= sinceMs` anchored).
- Cross-track citation: each TC cites source-module field-inventory + column-root catalog row.
- Catalog gap fill inline (Local Info, Account, Legal, Shared Setup, Auto-Addon, Top-Level — absorbed from dispositioned SP-HIST-10..17).
- Phase 5 page-object work salvaging boolean-render evidence from `SUBPLAN_HISTORY_01_MCP_FINDINGS.md` (Unicode vs SVG per LR-036).
- Phase 7 closure salvaging anomaly-writer + auto-filer + LM-bug-triage from SP-HIST-33/34/36/37/39/40.

---

## Phase 5e — Notes HIST consolidation (EXTRACTED 2026-06-05)

**Status**: EXTRACTED → executed standalone via `plans/done/PLAN_NOTES_HIST_CONSOLIDATION.md` (2026-06-05). The 6 Notes col-69 HIST tests (TC-LOC-NTS-028..032 **and 038**) were moved into `clients/encore/tests/locations/location-management-history.spec.ts` (new `@notes-hist` describe), the markdown case-defs relocated to the LM-History catalog, the `NOTE_SEQUENTIAL_HIST_*` constants renamed hist-neutral, the orphan `tests/locations/history/` spec + dir deleted, and the workbook rebuilt (6 rows moved Notes-sheet→History-sheet). This plan's strict acceptance line ("zero per-source-module HIST spec files") is now satisfied by that plan. **The steps below are historical — do NOT re-execute** (note: they were authored for 5 tests + an `expect.poll` race-fix that would have violated LR-051; the standalone plan corrected both). Full-body Phase 1b (87-column coverage) remains GATED.

_Phase 5e's original step-by-step (authored for **5** tests + an `expect.poll` race-fix that would have violated LR-051, with stale `--project=chrome` / line refs) is **superseded**. The authoritative executed record — 6 tests moved, constants renamed, full separation, verified green — is [`plans/done/PLAN_NOTES_HIST_CONSOLIDATION.md`](../done/PLAN_NOTES_HIST_CONSOLIDATION.md). This plan stays **GATED**; full-body Phase 1b (87-column coverage) remains gated on parent rollout step 8._

---

## Phase 2.5 — Adjacent-Sweep ritual (applies at full-body execution)

For every adjacent fix noticed during Phase 1+ (same identity + same file/module + 5–30 min + no user input), pick exactly one: DO-NOW / SPAWN / APPEND with grep verification. Bare "out of scope" with no recipient = HALT (LR-040 + LR-046).

---

## Acceptance criteria (LR-040 closure gate)

Stub-level (active now):
- [x] File exists in `plans/pending/` so step-2.5 disposition recipient references grep-verify.
- [x] Frontmatter declares Status: GATED + Blocker line citing parent rollout step 8.
- [x] Bootstrap context-files list complete per LR-048 structural minimum.
- [x] Phase 1b section header reserved per parent §step-2.4 ("frontmatter + Phase 1b section header only").

Full-body level (deferred to parent step 8 — items recorded here for forward visibility):
- [ ] Every one of 87 LM-History columns classified per (a) MCP-proven save→read pair / (b) NOT-AUTOMATABLE with reason / (c) BLOCKED-BY-BUG with filed BUG-ID per LR-040.
- [ ] Per-column scenario depth covers every applicable archetype (parent §6 no-laziness list); non-applicable archetypes recorded with reason.
- [ ] Single spec file: `clients/encore/tests/locations/location-management-history.spec.ts`. Zero per-source-module HIST spec files (parent §5e + step-2.5 grep-verify line: `find clients/encore/specs -name "*hist-*.spec.ts"` returns zero).
- [ ] CSV regenerated once after Phase 5d. Path cited in Execution Summary.
- [ ] 3 consecutive fresh runs `npx playwright test --grep "@lm-history" --retries=0` — runnable subset green; `test.fail` cases continue to fail; `test.fixme` stay skipped.
- [ ] `/regression-guard` snapshot before/after = no silent breakage on touched files.
- [ ] External `/audit` (WATCHDOG) GREEN in fresh session per AUD-017.
- [ ] Activity-log row per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042.

---

## Verification

```bash
# Stub-level (verifies stub satisfies LR-040 phantom-handoff close):
test -f plans/pending/PLAN_LM_HISTORY_COVERAGE.md && echo "stub exists"
grep -c "^**Status**: GATED" plans/pending/PLAN_LM_HISTORY_COVERAGE.md  # expect: 1
grep -rn "PLAN_LM_HISTORY_COVERAGE" plans/done/SUBPLAN_HIST_PIVOT_*.md plans/done/SUBPLAN_DQU_20_F1i_MGMT_HISTORY_AUDIT.md plans/done/SUBPLAN_HISTORY_01_MCP_FINDINGS.md plans/done/PLAN_HIST_COLUMN_FIRST_PIVOT.md plans/done/PLAN_HIST_COMMIT_HISTORY_WORK.md plans/done/PLAN_PILOT_SHARED_TESTS.md 2>/dev/null | wc -l  # expect: >= 12 (every SUPERSEDED-BY/FOLDED-INTO row resolving to this file)

# Full-body level (re-run after parent step 8 executes):
# (deferred)
```

---

## Handoff (post-stub-authoring)

Stub authored 2026-05-12 as parent-plan step 2.4 prerequisite for step-2.5 disposition pass. No execution work performed; no specs touched; no agent boundary crossed. File now serves as grep-verifiable LR-040 recipient for 12 SUPERSEDED-BY rows + 14 FOLDED-INTO rows in parent §10 disposition table. Full body authoring queued for parent step 8 after Shared Setup pilot (step 3) → Notes redo (step 4) → LO-History plan (step 5) → template stub (step 6) → 10-module thaw (step 7) all complete with WATCHDOG GREEN per parent §7 pilots-only scope rule.
