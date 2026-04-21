> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute <this-filename>`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: load `/identity` per the `**Identity**` field below.
> 2. **Skills**: load every skill in `**Skills**` field below (the leading skill auto-calls its chain — e.g. `/cleanup` → `/regression-guard`).
> 3. **Model + thinking tier**: look up this subplan's SP number in `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` → Execution Order table. Use the specified Opus/Sonnet + think / think hard / think harder / ultrathink. If Phase 0 is present in Step-by-Step, bump thinking tier one notch higher than the table (forensic analysis needs judgment).
> 4. **Dependency gate**: verify every item in `**Depends on**` field is marked DONE in `plans/done/` or not-applicable. If any blocker → HALT + report to user. Do not proceed.
> 5. **Context load**: read `plans/pending/PLAN_HIST_COLUMN_FIRST_PIVOT.md` §1–§3 (pivot rationale + scope + per-identity KEEP/DELETE inventory) + this subplan in full.
> 6. **Phase 0 FIRST (if present in Step-by-Step)**: execute the "Phase 0 — Date-Forensic Self-Discovery" step before any code or doc edits. Document findings (with dispositions) in your activity-log row.
> 7. **Execute Phases 1+** per Step-by-Step in order.
> 8. **Handoff**: on success, apply the Handoff Signals block — set the file's Status field to DONE + Executed date in this file, append activity-log row (LR-028 + LR-037 wall-clock time ≥ mtime of every touched file), `git mv` this file to `plans/done/`, run `npm run plans:reindex`, commit (one commit per LR-027 boundary).
>
> **HALT + ASK USER** (do NOT silently proceed) if:
> - Any `**Depends on**` item is not DONE.
> - Phase 0 uncovers scope extension >30% beyond the listed starting point (user confirms before acting on unscoped items).
> - Genuine ambiguity in scope beyond the master plan §3 KEEP list.
> - `/regression-guard` diff shows changes unrelated to this subplan's stated scope.
> - Activity-log preflight (`npm run validate:activity-log:preflight`) would fail for your row.

---

# SUBPLAN SP-K2: Agent Prompts Sweep — Confirm No Old-Pattern Instructions

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 6 (Sanity sweep — low priority)
**Status**: Pending
**Priority**: P2
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
