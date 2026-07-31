---
name: feedback_self_produce_test_data
description: "Data-need ladder — self-produce via UI, then self-serve from existing artifacts, only then escalate; never silent-skip"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: aed9b060-0245-42be-84e0-f5b3ba690bf4
---

When a test case lacks data, the mandatory ladder is: (1) **SELF-PRODUCE** — create the state via the
UI on a designated office (blank the field + save, add a row, toggle it) when reversible; (2)
**SELF-SERVE** — mine artifacts already on disk (tenant export CSVs, walk-coverage JSONs, evidence
files) for an office that already has the state; (3) only then **ESCALATE LOUDLY** — a named question
queued as an /encore-questions candidate AND the case marked PARTIAL with the block named. A skip
citing "no data" without rungs 1-2 evidenced is a bounce.

**Why:** 2026-07-17 — NM-1932 (blank Override Price) was skipped as "need an office with blank data,
ask Encore" when (a) Rutvik manually proved the state self-producible in the UI (1105 Camlok rows),
and (b) one awk over the tenant export CSV already on disk answered it (office 1115) PLUS the
">50 rows" (9460/1974), "inactive rows" (1169/1137/1105), and "populated Labor" (9460/9211) questions
the worker wanted to send to Encore. Rutvik: "WHY CANT AGENT MAKE IT... RATHER THAN WAIT AND SKIP."

**Zero-delta trigger (2026-07-17, second incident — the ladder failed to fire the SAME DAY it was
written):** a probe on any filter/sort/guard control that returns ZERO delta ("toggling changes
nothing") IS a data need — it means all reachable data sits on ONE side of the control. The dialog
Active checkbox returned identical 2,651 all-active rows both states; Claude escalated to
ask-Encore/ask-Rutvik without rung 1 (deactivate a designated office) or full rung 2 (the picker's
OWN API was queried 6 ways, but the Location Settings surface — where inactive office 1222 was
plainly visible — was never consulted). Rutvik found 1222 by hand in 30 seconds: it never appears in
the picker either state = real bug, nearly calcified as "assert no change". Rung 2 means ALL
surfaces/artifacts, not the probed control's own data source. "No effect observed" is never a
conclusion — it's rung 0 of this ladder.

**How to apply:** encoded structurally in `plans/pending/PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION.md`
(data doctrine + gate + Zero-Effect Probe Protocol, added 2026-07-17 after a §3.5 trial CONVICTED the
original scoping). Until that lands, apply by discipline on every data-blocked disposition AND every
zero-delta effect probe. Pairs [[feedback_surface_coverage_gaps_loudly]],
[[feedback_recurrence_convicts_prior_fix]], LR-063 (self-serve first), LR-031, LR-040(c).
