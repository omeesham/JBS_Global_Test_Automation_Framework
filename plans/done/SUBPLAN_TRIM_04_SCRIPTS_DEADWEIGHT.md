# SUBPLAN_TRIM_04_SCRIPTS_DEADWEIGHT — coordinated vendor-fresh removal + dead root scripts + dead npm entries

**Status**: DONE
**Executed**: 2026-07-16
**Priority**: P0
**Created**: 2026-06-12
**Identity**: OWNER
**Parent**: PLAN_LOSSLESS_DEEP_TRIM.md
**Depends on**: SUBPLAN_TRIM_02_OLD_PLAN_DISPOSITION.md
**Blocks**: SUBPLAN_TRIM_06_CLOSURE.md
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Context

`scripts/verify-vendor-fresh.mjs` declares itself "DEPRECATED 2026-05-19 — vendoring removed in PLAN_DIST_REGRESSION_AND_N_FIXES"; its only live branch is a no-op exit 0, yet 4 callers still invoke it (`.githooks/pre-commit`, `.githooks/pre-push`, `scripts/ship-client.sh`, `scripts/ship-client.ps1`) — removal must be a COORDINATED single commit (file + all 4 caller edges) on the LR-049 ship path. Three further scripts surveyed as orphans need fresh re-proof. Ledger rows 4–6 of the parent. This subplan touches the ship/hook surface → highest-risk session of the trim; the verification battery is the gate.

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**: `/identity` · `/regression-guard` · `/relevant` · `/cleanup` (delete mechanics + report format) · `/final-q`

**Context files**:
- `plans/done/PLAN_LOSSLESS_DEEP_TRIM.md` (§Re-Proof Protocol VERBATIM, §Untouchables, §Ledger rows 4–6, §closure-gate authoring note)
- `.claude/rules/pipeline.md` (LR-049 ship-discipline — hook smoke is mandatory)
- `.claude/rules/hooks-identity.md` (auto-loads on .githooks/.claude-hooks edits)
- `docs/read_only_docs/LEARNED_RULES.md`

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm SUBPLAN_TRIM_02 in `plans/done/`.
2. navigation.md + agent-mistakes.md (ALL-*) + LR scan. BrowserTool=none.
3. Confirm the §Untouchables list is loaded — `scripts/*-pre-run.ts` / `*-post-complete.ts` family is config-wired (`config/pipeline-definition.json`) and MUST NOT be touched regardless of what any grep suggests.

(Phase 0.5b not applicable.)

---

## Phase 1 — Coordinated removal: verify-vendor-fresh (ledger row 4)

1. Re-proof per protocol: confirm the deprecation header + that the only executed branch is the meta-absent exit-0 path; enumerate ALL callers fresh (`rg -n "verify-vendor-fresh" --hidden -g "!node_modules" -g "!plans/"`). Any caller beyond the known 4 → include its edit in the same commit or DROP the candidate.
2. Edit all 4 callers to remove the invocation (preserve surrounding gate logic — especially `verify-no-forbidden` calls, which are NOT-DEAD core infra).
3. Delete `scripts/verify-vendor-fresh.mjs`. ONE commit: file + caller edits.
4. Smoke: `bash .githooks/pre-commit` on a trivial staged change; `bash .githooks/pre-push` dry path if invocable; `npm run client:ship -- --client=encore --out=<temp>` list/dry smoke (LR-049 stays green) OR document why ship smoke deferred with exact command for TRIM_06.

## Phase 2 — Orphan scripts (ledger row 5)

5. For each of `scripts/priority-sweep.mjs`, `scripts/validation-gates.ts`, `scripts/migrate-queue-csv-to-xlsx.mjs`: FULL Re-Proof Protocol (all 5 grep classes, config-wiring scan mandatory, every command logged even when EMPTY). Zero live/config hits → delete (explicit-path staging). Any hit → DROP + log `DROPPED: <file> — live ref at <path>:<line>`.

## Phase 3 — Dead npm scripts (ledger row 6)

6. Enumerate root `package.json` scripts in-session; for each, verify its referenced file/binary exists. Nonexistent target → remove the script entry. Cross-check nothing else invokes the removed script name (`rg -n "npm run <name>"`).

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

DO-NOW only for parent-ledger items; discoveries → `## Next-batch ledger` in the Execution Summary.

---

## Acceptance criteria (LR-040 closure gate)

- [ ] Every ledger-row-4/5/6 item dispositioned: removed-with-evidence | DROPPED-with-cited-ref | deferred-with-named-recipient. No silent skips.
- [ ] vendor-fresh removal is ONE commit containing the file deletion + every caller edit; zero dangling references (`rg "verify-vendor-fresh"` post-commit → plans/docs hits only).
- [ ] Hook smoke + ship smoke green (or ship smoke explicitly deferred to TRIM_06 with command).
- [ ] `npx tsc --noEmit` (root) clean; `/regression-guard` diff = intended removals only.
- [ ] Explicit-path staging throughout (status snapshots logged; no unrelated WIP staged).
- [ ] Activity-log row (LR-028); `/final-q` verdict (LR-042).

## Verification

```bash
rg -n "verify-vendor-fresh" .githooks/ scripts/ package.json | wc -l   # expect: 0
bash .githooks/pre-commit                                              # expect: exits 0 on clean stage
npx tsc --noEmit                                                       # expect: clean
```

## Handoff (post-execution)

Chat-only. Outcome: which of the 4–6 ledger rows landed vs dropped (with the refuting reference for each drop), ship-path smoke result, next-batch ledger contents for the closure session.

---

## Execution Summary

**Executed 2026-07-16 via the copilot council** (opus-4.6 executor run trim04-build-0716, 665s; gpt-5.5 cross-review run trim04-review-0716 — GREEN, 0 defects, battery re-run independently). Dispatcher committed atomically: commit 93a07763 (7 paths, 437 deletions) with explicit pathspec so pre-existing WIP stayed out. Evidence dir: .claude/state/ua-worker/trim04-build-0716-artifacts (probes.verify.txt, proofs.txt, sha256-manifest.txt).

### Ledger-row dispositions (LR-040)
- **Row 4 (verify-vendor-fresh)**: REMOVED-with-evidence — fresh caller enumeration found exactly the known 4; all 4 edited surgically (.githooks/pre-commit -11, .githooks/pre-push -24, scripts/ship-client.sh -3, scripts/ship-client.ps1 -2); script deleted (-108). verify-no-forbidden calls byte-intact (LR-049 core infra), confirmed by reviewer lane 1.
- **Row 5 (3 orphan scripts)**: scripts/priority-sweep.mjs REMOVED (-169) and scripts/migrate-queue-csv-to-xlsx.mjs REMOVED (-121) — full 5-class re-proof + prune-check, zero production callers; **scripts/validation-gates.ts DROPPED** — live callers found at scripts/audit-post-complete.ts:21, scripts/audit-pre-run.ts:122, and the healer post-complete gate script under pipeline/scripts/ (line 21) — survey was a false positive; parent ledger row annotated.
- **Row 6 (dead npm entries)**: healer:post-complete entry removed from root package.json (target file nonexistent at the declared root path). DEVIATION: the package.json hunk rides the SUBPLAN_RCD_B commit because the file already carried RCD_B pre-staged WIP (allure entries) — shared-file split documented in both plans; the change is already in the working tree.

### Verification battery (all tee'd)
- rg verify-vendor-fresh over .githooks/ scripts/ package.json → 0 hits (executor + reviewer independently).
- bash .githooks/pre-commit → exit 0. npx tsc --noEmit → clean (both seats).
- git status snapshots bracket the diff — every change inside the ticket allow-list (reviewer lane 2 PASS).
- Ship smoke DEFERRED to SUBPLAN_TRIM_06_CLOSURE per plan allowance — command recorded: npm run client:ship with --client=encore against a temp out dir (working tree carries pre-existing WIP blocking the clean-tree check).

### Next-batch ledger (recorded, not acted)
- validation-gates.ts is NOT dead (3 live callers) — parent plan ledger row 5 annotated this session.
- Ephemeral Claude worktree copies under .claude/worktrees/ still contain the deleted-script text; recommend a prune-check exclusion, routed to SUBPLAN_TRIM_06_CLOSURE.
- LATENT BUG escalated to owner: the healer post-complete gate file lives under pipeline/scripts/ while both the removed npm entry and the pipeline runtime resolver (pipeline/worker/index.ts:513) expect it under root scripts/ — the gate has been silently absent at runtime; out of trim scope (Untouchables family), flagged for the integration ultraaudit findings.

### Documentation
- LR-028 activity-log row appended this closure. Parent PLAN_LOSSLESS_DEEP_TRIM.md annotated per LR-027 parent-cascade.
