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

# SUBPLAN SP-K1: Framework Rules Sweep — Confirm No Old-Pattern Language

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 6 (Sanity sweep — low priority, non-blocking)
**Status**: Pending
**Priority**: P2
**Created**: 2026-04-20
**Depends on**: none (can run anytime after SP-H)
**Identity**: WATCHDOG or OWNER
**Skills**: `/audit` + `/identity`
**Estimated**: one session (~45 min)

---

## Cause

Framework-level rules (LR-*, LR-ENC-*, GEN-*, PLN-*, HLR-*, AUD-*) carry domain knowledge. Current inventory says ZERO rules endorse the old integration-per-spec pattern — all HIST-adjacent rules convey domain truths valid under the new pivot (LR-036 encoding, GEN-042 duplicate headers, PLN-048 MCP-verify upfront). This subplan CONFIRMS that in a fresh sweep.

Expected outcome: "No revisions needed. All rules still apply under pivot."

If anything is found, revise inline + document.

---

## Scope

**Files to grep**:
- Root `CLAUDE.md`
- `clients/encore/CLAUDE.md`
- `docs/read_only_docs/AGENT_SHARED_RULES.md`
- Any `clients/*/CLAUDE.md` (other clients if present)
- Any `docs/read_only_docs/*.md` with `LR-` / `LR-ENC-` / `GEN-` / `PLN-` / `HLR-` / `AUD-` rule numbers.

**Patterns to search**:
- "integration-per-spec" or "append HIST TC" or "each spec verifies history"
- `TC-LOC-*-HIST`, `TC-LOS-*-HIST` in rule text (rules should not reference specific deleted TCs).
- "hist-check in each spec" or similar old-pattern endorsements

---

## KEEP list — ALL RULES

Per master plan §3 inventory, every HIST-adjacent rule is domain knowledge, not process-directive. Do NOT delete any rule. Only REVISE if language explicitly endorses deleted pattern.

Rules confirmed keepers:
- LR-003 (no empty catch)
- LR-009 (Angular dirty tracking)
- LR-018 (run-all + individual + run-all workflow)
- LR-019 (first TC baseline enforcement)
- LR-020 (verify plan vs codebase)
- LR-025 (Radix large-option retry)
- LR-026 (Angular dirty defense)
- LR-028 (activity log)
- LR-030 (requirement contradiction → investigate)
- LR-031 (no lazy SKIP)
- LR-032 (MCP investigate, don't theorize)
- LR-033 (network RCA checklist)
- LR-034 (bug filing protocol)
- LR-035 (plans/INDEX auto-gen)
- LR-036 (SVG vs Unicode boolean)
- LR-037 (activity log timestamps)
- GEN-042, PLN-048, HLR-010, AUD-015 — all domain knowledge.

---

## Step-by-Step Execution

### Phase 0 — Date-Forensic Self-Discovery (MANDATORY)

**Principle**: Framework rules may have been added DURING the HIST integration window. Some are domain knowledge (keep), others may be process-directives now obsolete. Use the git history to find rules added in the 2026-04-13 → 2026-04-17 window and scrutinize them specifically.

1. Run:
   ```
   git log --since=2026-04-13 --until=2026-04-18 --name-only --pretty=format:"%h %ad %s" --date=short -- CLAUDE.md clients/encore/CLAUDE.md docs/read_only_docs/
   ```
2. Enumerate rules added/modified in that window (use `git show <hash>` to view diffs). Focus: any rule whose ADDITION was motivated by HIST integration work.
3. Per rule: classify DOMAIN (keep — applies independent of test pattern) vs PROCESS (may be obsolete under pivot).
4. Cross-reference with the KEEP list below so you don't over-revise.

### Phase 1 — Sweep

1. `/identity WATCHDOG`.
2. Grep all files listed above for the old-pattern patterns.
3. Per hit: read surrounding context. Classify as DOMAIN (keep) or PROCESS-OLD-PATTERN (revise).
4. For REVISE items (expected: zero):
   a. Edit the rule text to remove old-pattern language (e.g., "tests are appended to each spec" → "tests live in dedicated hist specs").
   b. Do NOT change rule number.
5. Write report `plans/done/SP-K1-RULES-SWEEP-REPORT.md` with findings + any edits made.
6. Commit: `docs(hist-pivot): SP-K1 — rules sweep report (expected: no revisions)`.

---

## Verification

1. Report file exists.
2. Any REVISE items have explicit before/after diff documented.
3. All rule numbers preserved.
4. `grep -rn "TC-LOC-.*-HIST\|TC-LOS-.*-HIST\|integration-per-spec" CLAUDE.md clients/encore/CLAUDE.md docs/read_only_docs/` returns zero hits (or only inside `/plans/pending/` master plan context, which is expected).

---

## Handoff Signals

1. Status DONE + Executed.
2. Activity log:
   ```
   | YYYY-MM-DDThh:mm | watchdog | done | plans/done/SP-K1-RULES-SWEEP-REPORT.md | SP-K1 — framework rules sweep. N revisions needed (expected: 0). |
   ```
3. `git mv` to done/. Reindex.

---

## Context for Cold-Start Session

- Expected outcome: clean sweep, zero revisions needed.
- If anything found: inline revise + document. Do NOT escalate.
- This is low-priority — blocks nothing.

---

## Dependencies

- None (parallel with everything else).
- Non-blocking for Group 1–5.
