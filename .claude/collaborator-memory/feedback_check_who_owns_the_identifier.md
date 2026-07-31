---
name: feedback_check_who_owns_the_identifier
description: "Before classing a token as internal jargon to strip from a deliverable, establish who owns the identifier — the client's own IDs are an asset, not a leak"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 97fc2a8f-d682-49e5-ad02-431273e486b4
  modified: 2026-07-30T17:36:57.387Z
---

`NM-####` is **Encore's own Jira prefix**, not ours. It is deliberately KEPT in shipped client
source by product decision — `scripts/lib/forbidden-patterns.mjs` DELIBERATELY-EXCLUDED list and
`.claude/rules/deliverable.md` LR-058 both say so explicitly. A reference like `NM-1463` in a test
comment links that test to the client's own bug, which is useful *to them*.

**Why:** on 2026-07-30, during the deliverable over-ship audit, I wrote a slop-definition file that
classed `NM-####` as "internal ticket IDs the client has no idea about". Eleven audit workers
inherited that premise and produced 104 HIGH-severity findings from it. Two build workers then
stripped 132 references across 35 of the client's own tickets before the error surfaced — caught
only because a path-scoped rule file loaded into context and contradicted it. Rutvik chose full
revert. The same audit was simultaneously *correct* about `graft`, `lot contract`, `walk-A`,
`ORACLE-FACTS` — those really are ours. The classifier wasn't broken; the ownership question was
never asked.

**How to apply:**
- The test is **"who owns this identifier?"** — not "does it look like an internal code?".
  Client-owned IDs (their Jira, their ticket prefix, their test-case IDs) are traceability the
  deliverable should *keep*. Ours (`LR-###`, `PLAN_*`, `SUBPLAN_*`, `ALL/AUD/PLN-###`, wave IDs)
  go.
- Before writing a doctrine file that many workers will consume, grep the repo for an existing
  authority on the same question. `forbidden-patterns.mjs` and the matching `.claude/rules/*.md`
  already encode which tokens ship and which don't — a hand-written definition that contradicts
  them is a defect that scales across every worker that reads it.
- A shared definition file is a force multiplier in both directions. An error in it does not stay
  one error; it becomes one error per worker. Weight the review of shared doctrine accordingly.
- Related: [[feedback_verify_recommendations_vs_design]] (audit recommendations can conflict with
  designed behavior — verify first), [[feedback_worker_report_claims_need_own_grep]].
