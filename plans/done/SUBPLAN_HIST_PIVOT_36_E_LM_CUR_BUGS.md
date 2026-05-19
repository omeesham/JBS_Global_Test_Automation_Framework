> **ARCHIVED — DO NOT EXECUTE.** Folded into: PLAN_LM_HISTORY_COVERAGE Phase 7 (LM Currency bug triage)

---

# SUBPLAN SP-E-LM-CUR: Bug Filings — Location Mgmt Currency NOT-TRACKED (CUR-BUG-A/B/C)

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 5 (Bug filing — gated)
**Status**: FOLDED
**Folded into**: PLAN_LM_HISTORY_COVERAGE Phase 7 (LM Currency bug triage)
**Priority**: P1-CYCLE-2
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
