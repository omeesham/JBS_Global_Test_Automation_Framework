# SUBPLAN_TRIM_02_OLD_PLAN_DISPOSITION — per-item disposition of the stale cleanup-plan family (supersede with audit trail)

**Status**: PENDING
**Priority**: P0
**Created**: 2026-06-12
**Identity**: OWNER
**Parent**: PLAN_LOSSLESS_DEEP_TRIM.md
**Depends on**: SUBPLAN_TRIM_01_COMMIT_PENDING_DELETIONS.md
**Blocks**: SUBPLAN_TRIM_03_PLAN_CORPUS_HYGIENE.md, SUBPLAN_TRIM_04_SCRIPTS_DEADWEIGHT.md, SUBPLAN_TRIM_05_EXPORT_CONVERTERS.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Context

A stale cleanup-plan family in `plans/pending/` predates the 2026-04-30 client rebuild and the 2026-06-05 POM restructure; much of what they target moved or vanished. Per user decision (2026-06-12): supersede with a per-item audit trail — Status flips + provenance pointers only, NO plan file is ever deleted. Disposition must precede the execution wave so exactly one plan governs each deletion category (otherwise e.g. SUBPLAN_REPO_04/11 and RCD_B/C both claim `scripts/`). Ledger row 2 of the parent.

**Disposition set (12 files)**: PLAN_MASTER_REPO_CLEANUP, SUBPLAN_REPO_03_AGENT_FILE_RESTRUCTURE, SUBPLAN_REPO_04_DUPLICATE_JUNK_PURGE, SUBPLAN_REPO_05_DEAD_CODE_REUSABILITY, SUBPLAN_REPO_06_DOC_MD_SLOP_AUDIT, SUBPLAN_REPO_07_SLOP_PREVENTION, SUBPLAN_REPO_10_SOURCE_CODE_QUALITY, SUBPLAN_REPO_11_SCRIPTS_CONFIG_AUDIT, SUBPLAN_REPO_12_TEST_INFRASTRUCTURE_AUDIT, PLAN_CODEBASE_CLEANUP, PLAN_MAINTAINER_SWEEP, PLAN_FULL_CHAIN_AUDIT (cleanup-relevant Category A slice only — Categories C/D are code-bug findings, untouched).

**Explicitly NOT dispositioned**: SUBPLAN_REPO_08_RENAME_JBS (annotate "parked — out of trim scope per user 2026-06-12", stays PENDING); SP-DQU-26/27/28 (own chain); SUBPLAN_RCD_B/C (live, adopted by parent).

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` · `/regression-guard` · `/relevant` · `/final-q`

**Context files**:
- `plans/pending/PLAN_LOSSLESS_DEEP_TRIM.md` (§Re-Proof Protocol, §Untouchables, §Ledger row 2)
- `.claude/rules/pipeline.md` (LR-020/027/035/046/048/050)
- `.claude/rules/plan-closure.md` (LR-055 — flips here are to SUPERSEDED, not DONE, so the closure gate does not fire; verify no file is flipped to DONE in this session)
- `docs/read_only_docs/LEARNED_RULES.md`

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm SUBPLAN_TRIM_01 is in `plans/done/`.
2. Read `.claude/context/navigation.md` + `agent-mistakes.md` (ALL-*). LR scan. BrowserTool=none.

(Phase 0.5b not applicable — disposition of plan files, no live-app or TC-correction output.)

---

## Phase 1 — Per-plan disposition (the audit trail)

For EACH of the 12 files:

1. Read the plan fully. Build a **per-line-item disposition table** in this subplan's Execution Summary: each concrete target/claim → `already-done (by <plan/commit>)` | `target-gone (restructure: <which>)` | `still-valid → migrated to <TRIM_xx/RCD_x ledger row or next-batch ledger>` | `unverifiable (note)`. Spot-verify each `still-valid` with a live grep/glob (LR-020) — survey verdicts are hypotheses.
2. **Decision rule (pre-approved by user)**: <50% of items still-valid → flip `**Status**:` to `SUPERSEDED` + add provenance line `Superseded by plans/pending/PLAN_LOSSLESS_DEEP_TRIM.md (2026-06-12 deep-trim disposition; per-item table in SUBPLAN_TRIM_02 Execution Summary)`. ≥50% still-valid → surgical path-patch instead (update stale paths, keep PENDING) and flag in handoff.
3. `still-valid` orphan items that NO existing ledger row covers → record in `## Next-batch ledger` (no action; user approval round required).
4. PLAN_FULL_CHAIN_AUDIT: disposition ONLY Category A (rule-registry integrity) items; annotate the plan that A-items moved/were-checked, leave C/D untouched and Status unchanged unless wholly stale.

## Phase 2 — Annotations

5. SUBPLAN_REPO_08_RENAME_JBS: add one line under Context — "Parked: out of deep-trim scope per user decision 2026-06-12 (see PLAN_LOSSLESS_DEEP_TRIM)". Status stays PENDING.
6. SUBPLAN_RCD_C_ENV_REPORTS_CRUFT: verify the provenance amendment exists (added at trim authoring 2026-06-12): counts stale → regenerate in-session from `git ls-files`/`git status`; Re-Proof Protocol governs. Add it if missing.

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

DO-NOW only for parent-ledger items; everything else → next-batch ledger (no bare "out of scope" — LR-040/LR-046).

---

## Acceptance criteria (LR-040 closure gate)

- [ ] All 12 files dispositioned — each has a per-line-item table in the Execution Summary; every `still-valid` item names its migration target (grep-verifiable) or sits in the next-batch ledger. (LR-040 (b) classification for every enumerated item.)
- [ ] Zero plan files deleted; zero Status flips to DONE (SUPERSEDED/annotation edits only).
- [ ] REPO_08 annotated parked; RCD_C provenance note verified present.
- [ ] `npm run plans:reindex` run after flips (LR-035) — INDEX regenerates clean.
- [ ] Activity-log row per LR-028; `/final-q` verdict per LR-042.

## Verification

```bash
grep -l "SUPERSEDED" plans/pending/PLAN_MASTER_REPO_CLEANUP.md plans/pending/SUBPLAN_REPO_0*.md plans/pending/SUBPLAN_REPO_1*.md plans/pending/PLAN_CODEBASE_CLEANUP.md   # lists the flipped subset
grep -c "disposition" plans/pending/SUBPLAN_TRIM_02_OLD_PLAN_DISPOSITION.md   # Execution Summary tables present
npm run plans:reindex:check 2>/dev/null || npm run plans:reindex -- --check   # INDEX not stale
```

## Handoff (post-execution)

Chat-only. Outcome: per-plan disposition tables, which plans flipped SUPERSEDED vs path-patched, migrated items per ledger row, next-batch ledger contents. TRIM_03 inherits the flip list for its move pass.
