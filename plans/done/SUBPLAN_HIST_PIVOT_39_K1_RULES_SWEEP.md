> **ARCHIVED — DO NOT EXECUTE.** Folded into: PLAN_LM_HISTORY_COVERAGE Phase 7 (rules sweep)

---

# SUBPLAN SP-K1: Framework Rules Sweep — Confirm No Old-Pattern Language

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 6 (Sanity sweep — low priority, non-blocking)
**Status**: FOLDED
**Folded into**: PLAN_LM_HISTORY_COVERAGE Phase 7 (rules sweep)
**Priority**: P1-CYCLE-2
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

---

## UPDATE (2026-04-22) — AUDIT RECOMMENDATION (append-only; original plan above is intact)

> **Execution-agent directive — read BEFORE Phase 0 runs.**
> This subplan now has TWO candidate paths:
> - **(a) Original plan** — full ~45 min sweep session above.
> - **(b) Audit recommendation** — conditional execution based on SP-J's grep result.
> Do NOT default to either:
> 1. Read both paths in full.
> 2. Check: has SP-J run and produced `plans/done/PLAN_HIST_PIVOT_FINAL_AUDIT.md`?
>    - If NO → J hasn't measured yet; the precondition for path (b) doesn't exist. Execute path (a) as a standalone sweep.
>    - If YES → read J's §23 (Framework rules clean) result:
>      - PASS (zero grep hits) → execute path (b): skip sweep, mark DONE-conditional-skipped.
>      - FAIL (grep hits found) → execute path (a) to remediate each hit; use J's report as input.
> 3. Log disposition in activity-log.
> Evidence wins, not recency.

**Audited by**: /ultrathink + /audit + /planning (Opus, 2026-04-22)
**Audit plan**: `~/.claude/plans/3-shared-utils-temporal-kahan.md`

### Finding
K1's entire Verification section is one grep command. K1's Cause section says "expected outcome: No revisions needed." Master plan §8 Q7 says the same. Running K1 as a standalone session to confirm a precomputed null is ceremony.

SP-J (see its UPDATE block) can absorb K1 as checklist item #23 — adds ~1 minute to J, saves ~45 min of K1 session.

### Proposed alternative path — conditional-on-J-grep
Default state: **SKIP this subplan**. Execute only if J's item #23 reports grep hits.

Execution flow:
1. Read `plans/done/PLAN_HIST_PIVOT_FINAL_AUDIT.md` (J's output). Locate §23 "Framework rules clean".
2. If §23 = PASS (zero hits):
   - Append activity-log row: `| YYYY-MM-DDThh:mm | watchdog | done | (none) | SP-K1 — absorbed into SP-J §23, zero grep hits, no sweep needed |`
   - `git mv` this file to done/ with Status set to `DONE-conditional-skipped` (or `DONE` with note in file). No sweep work performed.
3. If §23 = FAIL (hits found):
   - J's report will list the specific hits. Use that as input.
   - Execute the original Phase 1 Sweep steps above to remediate each hit.
   - Write the standard `plans/done/SP-K1-RULES-SWEEP-REPORT.md`.

### Evidence
- K1 Cause direct quote: "Current inventory says ZERO rules endorse the old integration-per-spec pattern... Expected outcome: 'No revisions needed.'"
- K1 Verification is a grep identical to what J can run.

### Risk of blindly following path (a)
- ~45 min session to confirm a null outcome J can measure in seconds.

### What execution agent must check before picking
- `ls plans/done/PLAN_HIST_PIVOT_FINAL_AUDIT.md` — does J's output exist yet?
- If J hasn't run, path (b) is not yet applicable. Default to path (a) in that case.
- If J ran but §23 is unclear/missing, fall back to path (a) for safety.
