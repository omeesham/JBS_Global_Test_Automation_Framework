---
name: feedback-graft-clean-disk
description: A graft protects OUR codebase from their incoming code and splices only what is safe; it never tests, verifies, or repairs their work — and it leaves the disk truthful (git index == worktree).
metadata: 
  node_type: memory
  type: feedback
  originSessionId: b6fb4198-1fcf-4955-8623-b3903a97fda4
---

When hand-grafting colleague code into our codebase (splicing outside the pipeline `/chain`), the job is **protect ours, then graft whatever is safe** — nothing else. Three lanes (`/graft` Step 0 classifier): **D-NEW** = a path they created that our `main` does not have → take as-is, fast lane; **D-COMMON** = their edit to a path we ALREADY HAVE, or to a shared surface (barrels, base pages, components, fixtures/utils/setup/types/reporter, auth.setup.ts, the aggregate xlsx workbook) → per-hunk code-level trial, and **any altered pre-existing line is REJECT-KEEP-OURS**; **F** = framework behaviour → guilty until proven right. Their new module is never the only thing their branch touched.

**We do not test.** Not their module, not ours — no spec runs, no E2E, no "prove it still works". Testing their work would be adopting it; re-testing ours is redundant, because if nothing that alters our existing code gets through, our existing code is by construction unchanged. The graft therefore makes **no** green/verified/tested claim, and LR-059/LR-060 verification duties attach to whoever later runs or ships the module, not to the graft. The one permitted execution is a Tier F gate's own `--self-test` (an incoming hook that misfires wedges every future session).

**We never fix their code.** If their module is broken — including broken *because* we kept our version of a hunk they depended on — it lands broken and it stays theirs (HOLD + report, never repair). Their bad code is on them; their bad code silently regressing our clean code is on us.

**Why:** a clean graft makes the disk truthful. If the disk lies (staged ≠ what is on disk), the graft was botched and nobody cleaned it. Rutvik: "make sure it NEVER happens in the first place" + "if the graft was done properly, the disk would NOT LIE, unless the graft was botched and no one cleaned it."

**How to apply:** use `/graft` (classify → take D-NEW as-is → try D-COMMON and F per hunk → splice → verify fidelity + confirm every rejection held against `git show main:<path>` → sync index). Stage only after that fidelity check, never mid-splice: early staging → stale index → a later commit ships a version nobody looked at (the NM-2265 defect). With no test run anywhere in the flow, the per-hunk rejection re-read is the last line of defence — a rubber-stamped verdict has nothing downstream to catch it. Prevention is primary; `.claude/hooks/graft-ship-gate.sh` is a Claude-Bash-only commit backstop, not the fix. **Reject reconciliation patches** — a ledger / marker / SessionStart banner to "explain" a dirty graft to other sessions is treating the symptom. Pairs with [[feedback_no_token_burn_on_rediscovery]], [[feedback_worker_report_claims_need_own_grep]], [[feedback_a_test_case_id_lives_in_four_places]].
