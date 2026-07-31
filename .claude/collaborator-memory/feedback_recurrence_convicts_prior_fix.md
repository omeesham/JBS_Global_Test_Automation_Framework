---
name: feedback_recurrence_convicts_prior_fix
description: "When a failure class recurs in an area that already has a \"permanent\" fix, the PRIOR fix goes on trial first — slop-check it, rewire or retire; never layer a new fix over an unconvicted failed one"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: d3adf543-4d4f-4a51-b6ef-25e71e2759eb
---

Rutvik's framework law (2026-07-17): whenever we find a defect, we "perm block" it — and if the SAME
AREA shits again later, the last thing applied to prevent it was itself MOST LIKELY SLOP. The
incident response must START by putting the prior fix on trial with a three-question slop-check:
(1) what did the old fix do to prevent this class, (2) why didn't it prevent THIS instance (scoped
wrong / prose-not-mechanism / rubber-stampable / dead), (3) what will the new mechanism do
differently. Verdict: SURVIVES (covers a genuinely different sub-class — keep) or CONVICTED (rewire
into machine-enforced form, or retire). **Layering new fixes over unconvicted failed ones is
forbidden** — that's how decorative gate sediment accumulates.

**Why:** 2026-07-17 Override walk gaps — LR-062/LR-064/FCC taxonomy/walk HARD STOPs ALL existed and
ALL failed to fire (landing-page-only denominator, rubber-stampable prose mandates, no machine
checking assertions). The walk area had been "fixed" before and shat again.

**How to apply:** every recurrence-class incident RCA gets a prior-fix trial section; the
forced-discovery fold cross-examines every existing touchpoint against the RCA ("you existed on
2026-07-17 — why didn't you fire?"). Pending encode into `.claude/rules/guardrail-policy.md` §3.5
(protected file — needs Rutvik's explicit in-chat go). Pairs LR-069 §3.4 demotion review,
[[feedback_gate_fix_floor_design]], [[project_walks_are_manual_qa_bug_harvest]].
