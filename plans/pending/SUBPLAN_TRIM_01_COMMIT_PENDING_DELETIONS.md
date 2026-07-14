# SUBPLAN_TRIM_01_COMMIT_PENDING_DELETIONS — commit the already-deleted tracked files (clean fingerprint baseline)

**Status**: PENDING
**Priority**: P0
**Created**: 2026-06-12
**Identity**: OWNER
**Parent**: PLAN_LOSSLESS_DEEP_TRIM.md
**Depends on**: none
**Blocks**: SUBPLAN_TRIM_02_OLD_PLAN_DISPOSITION.md
**Model**: claude-sonnet-4-6
**Thinking**: mid
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none
**Justification**: mechanical explicit-path staging of files already deleted on the branch — zero analysis, zero new deletions

---

## Context

The working branch carries ~25 tracked files under `.playwright-cli/` plus `scripts/build-framework-vendor-all.mjs` and `scripts/build-framework-vendor.ts` already showing `D` (deleted) in `git status` — debug-session artifacts and the retired vendoring scripts (vendoring removed by PLAN_DIST_REGRESSION_AND_N_FIXES). Committing these pending deletions first gives every later trim session a clean regression-guard baseline. Ledger row 1 of the parent.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (Step 1.5 gate)
- `/regression-guard` (BEFORE + AFTER snapshots)
- `/relevant` (Phase 0.5)
- `/final-q` (exit per LR-042)

**Context files**:
- `plans/pending/PLAN_LOSSLESS_DEEP_TRIM.md` (§Re-Proof Protocol, §Untouchables, §Ledger row 1)
- `.claude/rules/pipeline.md` (LR-027/028/048)
- `docs/read_only_docs/LEARNED_RULES.md`

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. `Depends on: none` — confirm parent master exists in `plans/pending/`.
2. Read `.claude/context/navigation.md`; read `clients/encore/specs_planning/_internal/agent-mistakes.md` (ALL-*).
3. LR scan. BrowserTool=none (no live website work).

(Phase 0.5b not applicable — no audit/find-bugs trigger; section deleted per template rule 5.)

---

## Phase 1 — Work

1. Record pre-state: `git status --short` snapshot into the session log (counts only for `.playwright-cli/` names — see parent closure-gate authoring note: deleted `.yml`/`.txt` names are cited extension-free).
2. Re-proof (protocol step 2, scoped): `rg -n "build-framework-vendor" --hidden -g "!node_modules" -g "!plans/"` → expect only doc-only/self hits (survey 2026-06-12: clean outside plans/done). Any live-caller hit → DROP that file from the commit and log.
3. Stage EXPLICIT paths only: `git add -u -- .playwright-cli/ scripts/build-framework-vendor-all.mjs scripts/build-framework-vendor.ts`
4. Verify staged set: `git diff --cached --stat` — ONLY deletions of the enumerated paths; any other path staged → unstage and HALT.
5. Commit: `chore(trim): commit pending deletions — playwright-cli debug artifacts + retired vendor scripts (TRIM_01)`.
6. Record post-state `git status --short` snapshot (unrelated WIP must be untouched, count unchanged minus committed deletions).

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

Any adjacent finds → next-batch ledger in this file's Execution Summary (parent decision 3: no new-candidate action without a future approval round). DO-NOW applies only to items already on the parent ledger.

---

## Acceptance criteria (LR-040 closure gate)

- [ ] Commit contains ONLY deletions of the enumerated paths (verify via `git show --stat HEAD`).
- [ ] Zero non-ledger paths staged at any point (status snapshots prove it).
- [ ] `npx tsc --noEmit` clean (vendor scripts had no importers — re-proved).
- [ ] `/regression-guard` before/after diff = deletions only.
- [ ] Activity-log row per LR-028 (LR-037 timestamp).
- [ ] `/final-q` verdict emitted per LR-042.

## Verification

```bash
git log --oneline -1 --stat | head -5     # expect: chore(trim) commit, ~27 deletions
git status --short | grep -c "^ D"        # expect: 0 (no pending deletions left)
npx tsc --noEmit                          # expect: clean
```

## Handoff (post-execution)

Chat-only. Outcome: pending deletions committed, fingerprint baseline clean; TRIM_02 inherits a quiet `git status` slice for the plans/ surface.
