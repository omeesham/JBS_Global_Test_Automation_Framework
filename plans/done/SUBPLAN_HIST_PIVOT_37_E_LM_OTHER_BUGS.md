> **ARCHIVED — DO NOT EXECUTE.** Folded into: PLAN_LM_HISTORY_COVERAGE Phase 7 (LM other-column bug triage)

---

# SUBPLAN SP-E-LM-OTHER: Bug Filings — Remaining Location Management NOT-TRACKED (Batch)

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 5 (Bug filing — gated)
**Status**: FOLDED
**Folded into**: PLAN_LM_HISTORY_COVERAGE Phase 7 (LM other-column bug triage)
**Priority**: P1-CYCLE-2
**Created**: 2026-04-20
**Depends on**: SP-B-LM-R + SP-D2 through SP-D10 complete (evidence for all non-Currency bugs)
**Identity**: WATCHDOG or OWNER
**Skills**: `/find-bugs` + `/audit` + `/identity`
**Estimated**: one session (may split per sub-batch if >15 bugs)

---

## Cause

File LR-034 bugs for the remaining 87-col Location Management History NOT-TRACKED findings (Pricing, Local Info, Account/Address, Legal, Notes, Shared Setup, Auto Add-On, Top-level, Orphans) plus same-parent duplicate-header findings. Batched across all non-Currency tabs to keep triage ergonomic.

Candidate IDs pre-identified:
- `BUG-LOC-AAO-001` (AAO-BUG-A — 5 Auto Add-On fields NOT-TRACKED)
- `BUG-LOC-PRI-001+` (EnableMultidayPricing + related)
- `BUG-LOC-SSL-001+` (Shared Setup snapshot-model gaps if confirmed)
- `BUG-LOC-LI-*`, `BUG-LOC-ACC-*`, `BUG-LOC-LGL-*`, `BUG-LOC-NTS-*`, `BUG-LOC-TOP-*` as findings dictate
- `BUG-HIS-ORPHAN-*` if SP-D10 found TRUE ORPHANs

Expected total: 15–25 bugs.

---

## Scope

**Inputs**: all non-Currency catalog sessions + all non-D1 test runs + anomaly JSONs + auto-filer digest.

**Outputs**: `reports/bugs/BUG-LOC-*.json` (grouped by module prefix per LR-034).

**Split**: if >15 bugs, spawn SP-E-LM-OTHER-B for remainder.

---

## KEEP list

- Existing BUG-HIS-001/002 + BUG-LOC-CUR-001..003 — dedup, don't refile.
- All done/ BUG files — don't modify.

---

## Step-by-Step Execution

Standard LR-034 protocol per bug. See SP-E-LO for step-by-step.

Process bugs by module (AAO first, then Pricing, etc.) so user triage can gate approval per module.

Commit: `fix(hist-pivot): SP-E-LM-OTHER — file N bugs for non-Currency LM NOT-TRACKED findings`.

---

## Verification

1. Every NOT-TRACKED entry in `hist-root-map-location-management.md` has a BUG or documented exemption.
2. Each BUG passes LR-034 validation.
3. Dedup clean — no duplicate BUG files.

---

## Handoff Signals

Activity log:
```
| YYYY-MM-DDThh:mm | watchdog | done | reports/bugs/BUG-LOC-*.json | SP-E-LM-OTHER — filed N bugs for non-Currency Location Mgmt NOT-TRACKED findings. |
```

## Context for Cold-Start Session

- LR-030/031/032/033/034 compliance.
- If a finding is intentional (e.g., "Line Of Business not tracked by design per requirement") — document as exemption in catalog, don't file bug.

## Dependencies

SP-B-LM-R + SP-D2..D10 + SP-E-LM-CUR done. User approval (GATE).
