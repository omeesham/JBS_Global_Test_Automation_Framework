# PLAN: Agent Authoring Efficiency — One-Look DOM, Locked Catalog, Structural Gate

**Status**: Pending
**Priority**: P0-CYCLE-1
**Created**: 2026-04-23
**Parent**: (root — system-level mega plan)
**Depends on**: SP-DQU-02 (done — neutral-eye findings file proves the artifact format works for one module)
**Blocks**: SP-DQU-03 + every SP-DQU-04..21 (LOS fixes onward consume the new gate; 9 remaining modules ride the new rails)
**Skills**: /planning (authoring), /ultrathink (quality gates), /audit (closure), /final-q (exit)
**Related**: [PLAN_DELIVERABLE_QUALITY_UPGRADE.md](PLAN_DELIVERABLE_QUALITY_UPGRADE.md)

---

## 🛑 MANDATORY PHASE 0 — AUDIT EVERY WORD BEFORE EXECUTING

**This plan is ~2+ days old. Reality may have drifted. Your FIRST action is NOT execution — it is audit.**

Before touching any file described below, do this (max thinking, ultra-deep dive):

1. **Read every word of this plan end-to-end.** No skimming.
2. **For every claim in this plan, verify against current repo state**: grep for the files, functions, rules, paths, line numbers named here. If a line number is wrong, a file has moved, or a rule was already graduated — flag it in your notes BEFORE proceeding.
3. **Check all sibling SUBPLAN_AAE_*.md** in `plans/pending/` and `plans/done/` — some may be DONE, SUPERSEDED, or in-progress. Do not re-do what is already done.
4. **Check for overlap with already-shipped work**: `reports/bugs/`, `clients/encore/specs_planning/_internal/tc-authoring-rules.md`, `clients/encore/specs_planning/_internal/field-inventories/`, `scripts/check-*.mjs`, any `.claude/hooks/*.sh`. If the mechanism this plan proposes already exists in another form, DO NOT build a second version.
5. **Check against `PLAN_DELIVERABLE_QUALITY_UPGRADE.md` + `PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md`**: both plans touch adjacent surfaces. If this plan and another are fixing the same thing two different ways → STOP and ask the user which to keep. We do NOT want two parallel implementations.
6. **Slop-prevention gate**: before writing any new file, grep the repo for the filename. Before writing any new function, grep for the function name. Before adding any rule, grep `agent-mistakes.md` + `AGENT_SHARED_RULES.md` + root `CLAUDE.md` for the rule substance.

**Output of Phase 0**: a short audit note (in chat, not a file) listing:
- Claims verified ✓
- Claims found stale / wrong / drifted
- Overlaps with existing code / rules / other plans
- Recommendation: proceed as written | proceed with deltas | halt and replan

Only after the user acknowledges the audit note may you begin execution. No drift. No duplicate work. No two agents fixing one thing.

---

## Context

Client review of `local_office_settings_test_cases.csv` surfaced 11 defects. Root cause analysis (this session, 2026-04-23) found the failure was **systemic**, not module-specific:

1. **3x DOM traversal** — planner walks the page (Phase 0.5), generator walks it again (LR-007 forces re-verify), neutral-eye audit walks it a 3rd time (DQU-02). Same work, three sessions, three opportunities for drift.
2. **No structural enforcement** — Rule 6 (Live-DOM-first) is procedural advice; nothing in the build rejects a TC MD that was authored from spec memory instead of the live app.
3. **No "authoring-from-spec" detector** — there is no heuristic that flags a TC whose Expected text was clearly copy-pasted from `REQUIREMENTS.md` without a dated MCP session.
4. **Catalog staleness has no expiry** — dated MCP catalogs go stale silently after every Encore release; future regen reads stale truth and ships stale TCs.
5. **Reactive audit, not preventive gate** — neutral-eye audit catches what already shipped. We need to stop garbage at the door, not sweep it after delivery.

If we extend authoring to the remaining 9 modules under the current process, **we will reproduce all 11 defect classes 9 more times**. That is the embarrassment we cannot afford.

### Vision (one paragraph)

The planner walks the live DOM **once** and emits a dated, structured **field-inventory artifact** (testid + default + validation + states + MCP session date). A pre-commit hook **rejects** any TC MD that lacks a same-day, same-module artifact. The generator and auditor **consume** the artifact instead of re-walking the page. A grep heuristic flags TCs that smell of spec-authoring (no MCP session reference). Catalog staleness emits a warning when artifacts age past a threshold. Result: 1 DOM pass per module per cycle, structural prevention of authoring-from-spec, automatic detection of recurrence.

### Run sequence (canonical — honor this, not INDEX display order)

> ⚠️ **INDEX display ≠ run order.** `plans/INDEX.md` sorts by priority rank + creation date, which does NOT encode dependency chains. The sequence below is the source of truth. SP-AAE-06 is deliberately flagged as `P1 (sort-only, actual priority P0)` so reindex puts it visually below its prerequisites; this is a sort hack, not a scope downgrade.

```
Step 1. SP-DQU-01  ✅ (done — INDEX block + tmp cleanup)
Step 2. SP-DQU-02  ✅ (done — LOS neutral-eye audit)
        ↓
Step 3. SP-AAE-01  → Artifact format spec (freezes the contract)
Step 4. SP-AAE-02  → Pre-commit gate hook installed
Step 5. SP-AAE-03  → Planner emits field-inventory artifact
Step 6. SP-AAE-04  → Generator + auditor consume, no re-walk (3x → 1x DOM)
Step 7. SP-AAE-05  → Authoring-from-spec heuristic + staleness signal
        ↓
Step 8. SP-DQU-03  → LOS fixes — first real-world consumption of the new gate (end-to-end validation of AAE system)
        ↓
Step 9. SP-DQU-04  → LI neutral-eye (now rides the new rails — must emit artifact, must pass hook)
Step 10. SP-DQU-05 → LI fixes (proves pattern on 2 modules: LOS + LI)
        ↓
Step 11. SP-AAE-06 → PARALLEL rollout of remaining 9 modules (supersedes SP-DQU-12..21; 3 waves × 3 modules)
        ↓
Step 12. SP-DQU-21+ → remaining DQU tracks (slate-clear, simplify, cleanup, identity ripple, allure, bug reports, handoff, exit audit)
```

Dependency enforcement: every subplan's Bootstrap block already has a "Dependency gate" step that HALTs if any `**Depends on**` item is Pending. `/execute` honors this. `/chain` honors this. INDEX top-down scan does NOT — so never dispatch from INDEX blindly; always honor `**Depends on**`.

---

## Decisions

| ID | Decision | Why |
|---|---|---|
| AAE-D1 | Field-inventory artifact lives at `clients/${ACTIVE_CLIENT}/specs_planning/_internal/field-inventories/<module>-<YYYY-MM-DD>.md`. Matches existing `neutral-eye-audits/` shape. | One folder per artifact class; mtime + filename date both encode freshness. |
| AAE-D2 | Pre-commit hook installed via `.githooks/pre-commit` (existing infra per `npm run plans:hooks:install`). Rejects any staged change to `clients/**/test-cases/**/*.md` lacking a paired same-module field-inventory artifact ≤14 days old. | Reuses existing hook plumbing; 14-day window balances Encore release cadence vs noise. |
| AAE-D3 | Planner workflow change goes into the agent SKILL files / planner identity prompt, NOT into a new agent. The existing planner identity emits the artifact as a required Phase 0.5 output. | Avoids agent proliferation. Existing identities own existing artifacts. |
| AAE-D4 | Generator + Auditor refactor: read artifact + spot-check 2-3 random fields; only do full re-walk if spot-check disagrees with artifact (catalog drift signal). | Cuts DOM traversal from 3x to 1x in the happy path; preserves verification when drift is real. |
| AAE-D5 | "Authoring-from-spec" heuristic = grep TC MDs for absence of `MCP_VERIFICATION_LOG:` line in Notes. Hook warns; CI gates the warning. | Cheapest possible detector that catches the LOS-class defect class. |
| AAE-D6 | Catalog staleness = artifact older than 14 days emits warning at planner/generator load; older than 30 days = HALT until refreshed. | Mirrors prompt-cache TTL philosophy: short window for "fresh", longer for "must refresh". |
| AAE-D7 | All 9 remaining modules audit/fix run in **parallel batches** (3 modules × 3 waves), not sequential. Each module is independent. | User directive 2026-04-23 — "we should not wait for reviews that asswhoop us." Burn Chrome Claude sessions, not calendar weeks. |
| AAE-D8 | This plan does NOT modify SP-DQU-03's scope. DQU-03 becomes the first end-to-end validation of the new gate (LOS field-inventory artifact already exists from DQU-02 — DQU-03 must consume it). | DQU-03 stays minimal; system fix gives it more guardrails for free. |
| AAE-D9 | Field-inventory artifact ownership splits by file class, not by single owner. (a) **Format contract** (`_internal/field-inventories/_TEMPLATE.md` + `clients/encore/specs_planning/_internal/field-inventory-spec.md`) = OWNER RW only — framework governance, rare changes. (b) **Per-module artifacts** (`_internal/field-inventories/<module>-<YYYY-MM-DD>.md`) = GIVER CREATE, WATCHDOG UPDATE (refresh on neutral-eye re-audit), all others READ — primary author is the planner walking live DOM in Phase 0.5. Encoded in [AGENT_SHARED_RULES.md §2](../../docs/read_only_docs/AGENT_SHARED_RULES.md) (3 new rows added by SP-AAE-01). | Avoids a single-owner bottleneck while keeping the format contract immutable to runtime agents. Eliminates the "GARDENER assigned to a path GARDENER can't write" failure mode that this plan's own Subplan map originally exhibited. See SP-AAE-01 execution summary for the mid-session GARDENER → OWNER identity-switch incident that surfaced this gap. |

### AAE-D9 follow-ups (do NOT block SP-AAE-01 close — track for SP-AAE-03 / SP-AAE-04 / SP-AAE-06 authoring)

The Subplan map below was originally authored before AAE-D9 existed. SP-AAE-03 + SP-AAE-04 are listed as `GARDENER` but their actual deliverables (planner / generator / auditor identity-prompt edits) route through `npm run sync:mistakes` against `.github/agents/*.agent.md` — that path is `SYNC ONLY` for OWNER per §2 + `READ-ONLY` for GARDENER. The runtime authoring identity for SP-AAE-03 + SP-AAE-04 should be **OWNER** (the agent that runs `sync:mistakes`); the planner / generator / auditor identities are the *consumers* of those prompts at pipeline runtime, not the authors. Action item for the agent that picks up SP-AAE-03: re-read AAE-D9 + verify your identity selection against the actual file paths your subplan writes. Same for SP-AAE-04 + SP-AAE-06.

---

## Subplan map

| ID | Title | Identity | Skills | Output |
|---|---|---|---|---|
| SP-AAE-01 | Field-inventory artifact spec — format, naming, required sections, template | GARDENER | /planning, /research | `_internal/field-inventories/_TEMPLATE.md` + format spec doc |
| SP-AAE-02 | Pre-commit gate hook — reject TC MD edits without paired field-inventory artifact | BUILDER | /execute, /regression-guard | `.githooks/pre-commit` updated + `scripts/check-tc-has-fieldinventory.mjs` |
| SP-AAE-03 | Planner workflow refactor — emit field-inventory artifact as mandatory Phase 0.5 output | GARDENER | /execute, /upgrade | Updated planner identity prompt + skill SKILL.md edits |
| SP-AAE-04 | Generator + Auditor refactor — consume artifact, spot-check only, no full re-walk | GARDENER | /execute, /upgrade | Updated generator + auditor identity prompts + LR-007 amendment |
| SP-AAE-05 | Authoring-from-spec heuristic + catalog staleness signal | BUILDER | /execute, /find-bugs | `scripts/check-tc-mcp-citations.mjs` + staleness warning in planner/generator bootstrap |
| SP-AAE-06 | Parallel 9-module rollout orchestration under new system | OWNER | /chain, /audit | 9 parallel field-inventory artifacts + 9 corrected MDs + re-exported CSVs |

---

## Success criteria

1. **DOM traversal: 3x → 1x** per module per cycle (planner emits, others consume + spot-check).
2. **Pre-commit hook rejects** any TC MD edit lacking a fresh field-inventory artifact (CI green proves enforcement bites).
3. **DQU-03 lands** consuming the LOS field-inventory artifact end-to-end with zero re-walk.
4. **Heuristic flag fires** on at least one historical TC MD (proves detector works on real corpus).
5. **Catalog staleness warning** triggers on ≥1 artifact ≥14 days old; HALT triggers on ≥1 ≥30 days old.
6. **9 remaining modules** complete neutral-eye audit + fixes in ≤3 calendar days under SP-AAE-06 parallel rollout.
7. **No new client-review-grade defects** surface on modules audited under the new system (validated at first client checkpoint after rollout).
8. **LR-040 closure gate** passed on every subplan: every planned item is (a) MCP-proven, (b) grep-verifiable hand-off, or (c) user-flagged.

---

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Hook is too strict and blocks legitimate edits (typo fix, formatting) | Hook only fires on changes to TC `Steps` / `Expected` / `Data` / `Preconditions` blocks — pure metadata or comment edits pass. |
| Field-inventory artifact format churns and invalidates 11 existing artifacts | SP-AAE-01 freezes the format BEFORE SP-AAE-02 turns the hook on. Migration script promotes existing neutral-eye-audit findings to artifact format if needed. |
| Generator spot-check disagrees with artifact every time (artifact format too rigid) | SP-AAE-04 spot-check returns "drift detected" → planner re-runs Phase 0.5. Fail-open with audit trail, not fail-closed. |
| Parallel rollout (SP-AAE-06) burns Chrome Claude session quota | Run in waves of 3, not all 9 at once. Each module = one Chrome session = ~1 hour. 9 modules = 3 waves × 1 hour = 3 hours wall-clock. |
| Existing planner identity SKILL.md changes break in-flight HIST pivot work | SP-AAE-03 ships behind a flag; HIST work uses old path until pivot completes per existing freeze. |

---

## Verification (end-to-end)

1. Manually try to commit an edit to a TC MD without a field-inventory artifact → hook rejects with clear error.
2. Run `npm run plans:reindex:check` after every subplan close → INDEX stays consistent.
3. After SP-AAE-04, instrument a generator session and count DOM tool calls → must be ≤3 (spot-check budget), not ≥15 (full walk).
4. After SP-AAE-06, sample 3 random TCs from each of the 9 modules → every one cites a fresh `MCP_VERIFICATION_LOG`.
5. After full rollout, deliver to client → zero "TC value violates field constraint" flags on the next review cycle.

---

## Out of scope

- Client-specific catalog rewrites (lives in DQU plan, not this one).
- Spec-level (Playwright `.ts` file) refactors — this plan is about TC authoring, not spec generation.
- Removing the neutral-eye audit step — it stays as belt-and-suspenders, but becomes lightweight (verify catalog ↔ DOM, not catalog ↔ TCs).

---

## Reference docs

- `clients/encore/specs_planning/_internal/tc-authoring-rules.md` (Rules 1–6)
- `clients/encore/specs_planning/_internal/neutral-eye-audits/local-office-settings-2026-04-22.md` (proof artifact for AAE-D1 format)
- LR-007 (MCP-verify all planner claims) — to be amended by SP-AAE-04
- LR-013 (Generator Phase 0.5 mandatory) — to be amended by SP-AAE-04
- LR-014 (FIELD INVENTORY testid completeness) — codified at the artifact level by SP-AAE-01
- LR-015 (defaults from dated MCP) — codified at the artifact level by SP-AAE-01
- LR-034 (Bug Filing) — unchanged
- LR-040 (closure gate) — applies to every subplan in this plan
- LR-041 (Model + Thinking + PermissionMode in subplan frontmatter) — applied below
