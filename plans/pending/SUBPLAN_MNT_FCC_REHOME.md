# SUBPLAN_MNT_FCC_REHOME — re-homed maintainer items NB-8/NB-9 (SP-MNT-FCC-01/02)

**Status**: PENDING
**Priority**: P3
**Created**: 2026-07-16
**Identity**: GARDENER
**Depends on**: none
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto
**BrowserTool**: none

---

## Context

TRIM_02 (2026-07-16, `plans/done/SUBPLAN_TRIM_02_OLD_PLAN_DISPOSITION.md` NB-8/NB-9 rows) flagged two still-valid maintainer items whose LR-040 §b recipient was `PLAN_MAINTAINER_SWEEP.md` — superseded and moved to `plans/done/` by TRIM_03 (2026-07-16, cross-review `trim03-review-0716` FINDING-1 mandated this re-home before the move). This stub is the fresh PENDING recipient preserving the §b linkage for `PLAN_AGENT_IDENTITY_REALIGNMENT_AND_FCC_STRUCTURAL_CURE` (done).

## Bootstrap

- Identity: GARDENER (structural maintenance only, no business logic).
- Context files: `.claude/rules/pipeline.md` (LR-020 verify-first), `docs/read_only_docs/AGENT_SHARED_RULES.md`.

## Phase 0 — Dependency gate

No dependencies. Both target scripts verified present at re-home time (2026-07-16): `scripts/sync-agent-mistakes.ts` (wired to `npm run sync:mistakes`, package.json), `scripts/check-tc-parity.ts`.

## Phase 1 — The two items

1. **NB-8 / SP-MNT-FCC-01**: patch or decommission `scripts/sync-agent-mistakes.ts` — post-2026-04-27 Copilot-eviction rationale; decide keep-and-patch vs retire-and-unwire (`npm run sync:mistakes` script key comes out if retired).
2. **NB-9 / SP-MNT-FCC-02**: add a `--module` flag to `scripts/check-tc-parity.ts` (scope parity checks to one module; enhancement unbuilt as of 2026-07-16).

## Acceptance criteria

- [ ] NB-8: script patched (typecheck clean + `npm run sync:mistakes` exercises it) OR decommissioned (file removed + package.json key removed + rationale recorded here).
- [ ] NB-9: `npx tsx scripts/check-tc-parity.ts --module <name>` filters to that module; no-flag behavior unchanged; `npm run check:tc-parity` exit 0.

## Handoff

Chat-only per `feedback_handoff_in_chat_only.md`; outcomes only, no blocker claims (LR-039).
