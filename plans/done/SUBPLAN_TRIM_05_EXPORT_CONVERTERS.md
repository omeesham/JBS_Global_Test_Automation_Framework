# SUBPLAN_TRIM_05_EXPORT_CONVERTERS — transitive-dead analysis + removal of legacy export converters

**Status**: DONE
**Executed**: 2026-07-16
**Priority**: P0
**Created**: 2026-06-12
**Identity**: GARDENER
**Parent**: PLAN_LOSSLESS_DEEP_TRIM.md
**Depends on**: SUBPLAN_TRIM_02_OLD_PLAN_DISPOSITION.md
**Blocks**: SUBPLAN_TRIM_06_CLOSURE.md
**Model**: claude-opus-4-8
**Thinking**: hi
**PermissionMode**: auto
**RiskAcknowledged**: n/a
**BrowserTool**: none

---

## Context

`export_test_cases/to-jira.ts`, `to-json.ts`, `to-testmo.ts` are legacy export formats superseded by the XLSX consolidation (PLAN_CSV_TO_XLSX_DELIVERABLE_MIGRATION + PLAN_DELIVERABLE_MERGE_TESTRAIL_FORMAT, 2026-06-11). They are referenced ONLY by `export_test_cases/index.ts` (verified 2026-06-12) — so deadness is TRANSITIVE: the question is whether index.ts's dispatch branches to them are reachable from any npm script, doc, runbook, or ship flow. `markdown-parser.ts` is KEEP (live via `to-csv.ts`, which `to-xlsx.ts` imports). Ledger row 7 of the parent. GARDENER identity: structural refactor, zero behavior change to the live xlsx pipeline, typecheck-gated.

**Coordination guard**: `export_test_cases/to-xlsx.ts` may carry uncommitted WIP on the working branch. Phase 0 checks; if this session's edits would collide, DEFER the whole subplan (log, hand off) rather than touching WIP.

---

## Bootstrap

**Identity**: GARDENER

**Skills auto-called**: `/identity` · `/regression-guard` · `/relevant` · `/cleanup` · `/final-q`

**Context files**:
- `plans/done/PLAN_LOSSLESS_DEEP_TRIM.md` (§Re-Proof Protocol VERBATIM, §Untouchables, §Ledger row 7)
- `.claude/rules/pipeline.md` (LR-048 matrix), `.claude/rules/data.md` (auto-loads on scripts/ts edits)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 GARDENER scope)
- `clients/encore/CLAUDE.md` (LR-ENC-004 — deliverable workbook is generated, never hand-edited)

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm SUBPLAN_TRIM_02 in `plans/done/`.
2. `git status --short export_test_cases/` — if `to-xlsx.ts`/`index.ts` carry uncommitted WIP that this session would edit, DEFER (chat handoff, no edits).
3. navigation.md (§B row for XLSX pipeline) + agent-mistakes.md + LR scan. BrowserTool=none.

(Phase 0.5b not applicable.)

---

## Phase 1 — Reachability analysis (transitive-dead proof)

1. Read `export_test_cases/index.ts` — map every dispatch path to to-jira/to-json/to-testmo (CLI arg? format param? export barrel?).
2. Prove unreachability of each path: `rg -n "jira|testmo" package.json clients/encore/package.json .githooks/ .claude/ scripts/ docs/ export_test_cases/README.md` + how index.ts itself is invoked (`rg -n "export_test_cases/index|from './index'|to-xlsx" package.json scripts/`). Every invocation site must be shown to never select the legacy formats. Any reachable path → DROP the candidate (log refuting ref).
3. Baseline artifact: run the live build (`npm run xlsx:build` or the package.json equivalent) → record workbook sheet inventory + row counts (or `npm run test:xlsx-merged-shape` output) as BEFORE evidence.

## Phase 2 — Removal + lossless proof

4. Delete `to-jira.ts`, `to-json.ts`, `to-testmo.ts`; prune their dispatch branches/imports from `index.ts`. `markdown-parser.ts` and `to-csv.ts` UNTOUCHED.
5. Re-run the build + xlsx regression tests (`npm run test:xlsx-merged-shape`, `npm run test:xlsx-continuation-row`, `npm run test:xlsx-compose-reason` if present) → AFTER evidence must equal BEFORE (byte/sheet/count diff = zero behavior change).
6. `npx tsc --noEmit` (root) clean; explicit-path staging; one commit.

## Phase 2.5 — Adjacent-Sweep ritual (MANDATORY)

DO-NOW only for parent-ledger items; discoveries → `## Next-batch ledger`.

---

## Per-Identity Satisfaction

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | (none) |
| GIVER | (none — workbook content unchanged; build re-run only) | (none) | (none) |
| BUILDER | (none) | (none) | (none) |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none) | (none) | (none) |
| GARDENER | export_test_cases structural refactor | export_test_cases/index.ts | `npx tsc --noEmit` |

---

## Acceptance criteria (LR-040 closure gate)

- [ ] Each of the 3 converters: removed-with-unreachability-evidence | DROPPED-with-cited-reachable-path. (LR-040 classification per item.)
- [ ] BEFORE/AFTER build evidence identical (workbook shape tests green both runs) — zero behavior change.
- [ ] `markdown-parser.ts` + `to-csv.ts` untouched (`git diff --stat` proves).
- [ ] `npx tsc --noEmit` clean; `/regression-guard` diff = intended removals only.
- [ ] Activity-log row (LR-028); `/final-q` verdict (LR-042).

## Verification

```bash
ls export_test_cases/ | grep -E "to-(jira|json|testmo)" | wc -l    # expect: 0 (if all 3 passed re-proof)
npm run test:xlsx-merged-shape                                      # expect: pass
npx tsc --noEmit                                                    # expect: clean
```

## Handoff (post-execution)

Chat-only. Outcome: which converters landed vs dropped (with the reachable-path citation per drop), build-equivalence evidence summary, next-batch ledger contents.

---

## Execution Summary

**Executed 2026-07-16 via the copilot council** (opus-4.6 executor run trim05-build-0716, 212s; gpt-5.5 cross-review run trim05-review-0716 — GREEN, all 5 lanes independently re-executed). Dispatcher committed atomically with explicit pathspec (4 paths, 428 deletions); regenerated workbook restored (timestamp-only churn, content proven identical). Evidence dir: .claude/state/ua-worker/trim05-build-0716-artifacts (BEFORE/AFTER build + shape + sha256 tees, manifest); reviewer evidence: .claude/state/ua-worker/trim05-review-0716-artifacts.

### Per-converter dispositions (LR-040)
- to-jira converter (249 lines): REMOVED-with-unreachability-evidence — barrel-only reference in the export index; zero live npm/config/code callers (executor + reviewer independent greps over package.json, client package.json, .githooks, scripts, src, pipeline, config).
- to-json converter (42 lines): REMOVED — same evidence class.
- to-testmo converter (131 lines): REMOVED — same evidence class.
- export_test_cases/index.ts: pruned exactly 6 lines (3 stale JSDoc bullets + 3 export lines); no other logic moved (reviewer lane 3).

### Lossless proof (zero behavior change)
- Workbook shape-test output hash BYTE-IDENTICAL across three builds (executor BEFORE, executor AFTER, reviewer re-run): 23 sheets, 820 rows each.
- Workbook binary sha256 delta = xlsx embedded write-timestamp only — PROVEN by the reviewer's two consecutive no-code-change builds producing different binary hashes with identical shape hashes.
- npx tsc --noEmit clean (both seats). markdown-parser.ts, to-csv.ts, to-xlsx.ts untouched (git diff --stat, reviewer-verified).

### Next-batch ledger (recorded, not acted)
- export_test_cases/README.md carries doc-only stale pointers to the removed converters and their example script snippets — routed to SUBPLAN_TRIM_06_CLOSURE consolidated list.
- to-xlsx.ts comment-only mentions (3 lines) — same doc-only class, same recipient.

### Documentation
- LR-028 activity-log row appended this closure. Parent PLAN_LOSSLESS_DEEP_TRIM.md annotated per LR-027 parent-cascade.
