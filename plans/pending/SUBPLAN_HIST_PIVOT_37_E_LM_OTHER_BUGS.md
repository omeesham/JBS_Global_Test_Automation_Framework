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

# SUBPLAN SP-E-LM-OTHER: Bug Filings — Remaining Location Management NOT-TRACKED (Batch)

**Parent**: PLAN_HIST_COLUMN_FIRST_PIVOT.md
**Group**: 5 (Bug filing — gated)
**Status**: GATED
**Priority**: P1
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
