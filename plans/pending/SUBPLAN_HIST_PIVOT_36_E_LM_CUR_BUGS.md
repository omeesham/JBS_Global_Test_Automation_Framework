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

# SUBPLAN SP-E-LM-CUR: Bug Filings — Location Mgmt Currency NOT-TRACKED (CUR-BUG-A/B/C)

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 5 (Bug filing — gated)
**Status**: GATED
**Priority**: P1
**Created**: 2026-04-20
**Depends on**: SP-B-LM-R catalog + SP-D1 test evidence
**Identity**: WATCHDOG or OWNER
**Skills**: `/find-bugs` + `/audit` + `/identity`
**Estimated**: one session

---

## Cause

File LR-034 bugs for the three confirmed Currency NOT-TRACKED findings identified in the 2026-04-17 MCP session and re-verified in SP-B-LM-1:
- CUR-BUG-A: USD/CAD/MXN Merchant changes not recorded.
- CUR-BUG-B: IsDefault flag not recorded.
- CUR-BUG-C: CUR-027 cleanup fails to restore USD IsDefault baseline.

Plus any additional findings from SP-D1 runs.

---

## Scope

**Bugs to file** (expected 3, may grow):
- `BUG-LOC-CUR-001` (CUR-BUG-A — Merchant)
- `BUG-LOC-CUR-002` (CUR-BUG-B — IsDefault)
- `BUG-LOC-CUR-003` (CUR-BUG-C — baseline drift)

**Skip-test pairing**: update SP-D1's affected TCs (likely the 3 MER phantom-row + 3 DEF phantom-row TCs) with `test.skip('bug-blocked: BUG-LOC-CUR-...')` ONLY if they fail under expected-behavior-is-bug semantics. Otherwise leave TCs active (they verify the NOT-TRACKED state as hard assertions).

---

## KEEP list

- Existing BUG-HIS-001/002 (unrelated) — dedup, don't refile.
- SP-D1 test TCs — review before marking skipped. Many TCs VERIFY the bug's existence; they should PASS, not be skipped.

---

## Step-by-Step Execution

Standard LR-034 protocol. See SP-E-LO for step-by-step. Scoped to Currency only.

Commit: `fix(hist-pivot): SP-E-LM-CUR — file 3 Currency NOT-TRACKED bugs per LR-034`.

---

## Verification

1. BUG-LOC-CUR-001..003 exist in `reports/bugs/`.
2. Each passes LR-034 validation.
3. SP-D1 TC behavior documented (which remain active as bug-existence verifiers, which are skipped).

---

## Handoff Signals

Activity log:
```
| YYYY-MM-DDThh:mm | watchdog | done | reports/bugs/BUG-LOC-CUR-001.json, BUG-LOC-CUR-002.json, BUG-LOC-CUR-003.json | SP-E-LM-CUR — filed 3 Currency NOT-TRACKED bugs. |
```

## Context for Cold-Start Session

- 2026-04-17 MCP evidence is the authoritative reference for CUR-BUG-A/B/C.
- Customer-facing requirement source: Functional Requirement .docx (verify section).

## Dependencies

SP-B-LM-R + SP-D1. User approval (GATE).
