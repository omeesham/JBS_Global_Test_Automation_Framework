> **ARCHIVED — DO NOT EXECUTE.** Folded into: PLAN_LM_HISTORY_COVERAGE Phase 7 (prompts sweep)

---

# SUBPLAN SP-K2: Agent Prompts Sweep — Confirm No Old-Pattern Instructions

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 6 (Sanity sweep — low priority)
**Status**: FOLDED
**Folded into**: PLAN_LM_HISTORY_COVERAGE Phase 7 (prompts sweep)
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: none
**Identity**: WATCHDOG or OWNER
**Skills**: `/audit` + `/identity`
**Estimated**: one session (~45 min)

---

## Cause

Agent prompts (`.github/agents/*.agent.md`, `.github/copilot-instructions.md`, `.claude/agents/*.agent.md`) drive future agent behavior. Confirm none of them tell BUILDER/HEALER/WATCHDOG to "append HIST TC per spec" — if any do, they'd drive agents to re-create the old pattern.

Current inventory says: zero prompts endorse old pattern. This is a confirmation sweep.

---

## Scope

**Files**:
- `.github/agents/*.agent.md` (all files)
- `.github/copilot-instructions.md`
- `.claude/agents/*.agent.md` (all files)

**Patterns to search**:
- `TC-LOC-*-HIST`, `TC-LOS-*-HIST`
- "append a HIST test"
- "integration TC after save"
- "verify history in each spec"
- Any reference to "hist in each spec"

---

## KEEP list — ALL PROMPTS

Per master plan §3, agent prompts convey domain knowledge (GEN-042, PLN-048, HLR-010, AUD-015) that's valid under pivot. Do NOT delete prompts. Only REVISE if old-pattern language found (expected: none).

---

## Step-by-Step Execution

### Phase 0 — Date-Forensic Self-Discovery (MANDATORY)

**Principle**: Agent prompts may have been edited DURING the HIST integration window with guidance that's now stale. Find them via git.

1. Run:
   ```
   git log --since=2026-04-13 --until=2026-04-18 --name-only --pretty=format:"%h %ad %s" --date=short -- .github/agents/ .github/copilot-instructions.md .claude/agents/
   ```
2. For each prompt file touched in that window: read the diff. Was HIST guidance added? Is it domain knowledge (keep — e.g., "MCP-verify history schema upfront") or process-directive (revise — e.g., "append HIST TC at end of each spec")?
3. Cross-reference with the KEEP list.

### Phase 1 — Sweep

1. `/identity WATCHDOG`.
2. Grep all prompt files for patterns above.
3. Per hit: classify DOMAIN (keep) or PROCESS-OLD (revise).
4. For REVISE items (expected: none): edit inline to reflect new pivot language. Preserve rule numbers.
5. Write report `plans/done/SP-K2-PROMPTS-SWEEP-REPORT.md`.
6. Commit: `docs(hist-pivot): SP-K2 — agent prompts sweep (expected: no revisions)`.

---

## Verification

1. Report file exists.
2. Revisions (if any) documented with before/after.
3. `grep -rn "TC-LOC-.*-HIST\|TC-LOS-.*-HIST" .github/agents/ .claude/agents/ .github/copilot-instructions.md` returns zero hits.

---

## Handoff Signals

1. Status DONE + Executed.
2. Activity log:
   ```
   | YYYY-MM-DDThh:mm | watchdog | done | plans/done/SP-K2-PROMPTS-SWEEP-REPORT.md | SP-K2 — agent prompts sweep. N revisions needed (expected: 0). |
   ```
3. `git mv` to done/. Reindex.

---

## Context for Cold-Start Session

- Expected outcome: clean sweep.
- Non-blocking.

---

## Dependencies

- None (parallel with everything else).

---

## UPDATE (2026-04-22) — AUDIT RECOMMENDATION (append-only; original plan above is intact)

> **Execution-agent directive — read BEFORE Phase 0 runs.**
> This subplan now has TWO candidate paths:
> - **(a) Original plan** — full ~45 min sweep session above.
> - **(b) Audit recommendation** — conditional execution based on SP-J's grep result.
> Do NOT default to either:
> 1. Read both paths in full.
> 2. Check: has SP-J run and produced `plans/done/PLAN_HIST_PIVOT_FINAL_AUDIT.md`?
>    - If NO → J hasn't measured; execute path (a).
>    - If YES → read J's §24 (Agent prompts clean) result:
>      - PASS (zero grep hits) → path (b): skip, mark DONE-conditional-skipped.
>      - FAIL (grep hits found) → path (a) to remediate each hit.
> 3. Log disposition in activity-log.
> Evidence wins, not recency.

**Audited by**: /ultrathink + /audit + /planning (Opus, 2026-04-22)
**Audit plan**: `~/.claude/plans/3-shared-utils-temporal-kahan.md`

### Finding
K2's Verification is one grep. K2's Cause says "Current inventory says: zero prompts endorse old pattern. This is a confirmation sweep." Master plan §8 Q7 says the same. Standalone session to confirm a precomputed null is ceremony.

SP-J (see its UPDATE block) absorbs K2 as checklist item #24.

### Proposed alternative path — conditional-on-J-grep
Default: **SKIP this subplan**. Execute only if J's §24 reports hits.

Flow:
1. Read `plans/done/PLAN_HIST_PIVOT_FINAL_AUDIT.md`. Locate §24 "Agent prompts clean".
2. If §24 = PASS:
   - Activity-log row: `| YYYY-MM-DDThh:mm | watchdog | done | (none) | SP-K2 — absorbed into SP-J §24, zero grep hits, no sweep needed |`
   - `git mv` to done/ with DONE-conditional-skipped.
3. If §24 = FAIL:
   - Use J's report as the hit list.
   - Execute original Phase 1 Sweep to remediate.
   - Write `plans/done/SP-K2-PROMPTS-SWEEP-REPORT.md`.

### Evidence
- K2 Cause direct quote: "Current inventory says: zero prompts endorse old pattern. This is a confirmation sweep."
- K2 Verification grep is what J can run directly.

### Risk of blindly following path (a)
- ~45 min to re-measure a precomputed null.

### What execution agent must check before picking
- `ls plans/done/PLAN_HIST_PIVOT_FINAL_AUDIT.md` — J's output must exist for path (b).
- If J ran but §24 is unclear, path (a) for safety.
