---
name: feedback_silent_worker_death_is_a_stale_slot_lock
description: "Workers that launch, sit silent, then die with zero output are usually blocked on stale slot locks — check ~/.claude/delegation/locks before blaming the script, the model, or another session"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 97fc2a8f-d682-49e5-ad02-431273e486b4
  modified: 2026-07-30T18:49:18.269Z
---

`copilot-worker.sh` gates every dispatch through `acquire_slot()`
(`.claude/skills/ultra-agents/copilot-worker.sh:415`): it counts directories in
`~/.claude/delegation/locks/slot-*` and sleeps in a loop until the count drops below `MAX_WORKERS`
(5, from `~/.claude/delegation/config.json`). The lock is released by an `EXIT` trap — **so a worker
killed with `timeout`, `rm -rf` on its run dir, or any hard kill leaves its slot dir behind forever.**
Stale reclamation only fires after `TIMEOUT + 120` seconds.

Once `MAX_WORKERS` slots are held by dead PIDs, every subsequent dispatch launches, blocks silently in
the sleep loop, stall-warns at 300s, and dies with `report_sections: 0`, `deliverable: not-declared`,
and `model: UNVERIFIED(...)`. It looks exactly like a broken script or an exhausted budget.

**Why:** on 2026-07-30 I lost roughly nine dispatches to this and misdiagnosed it three times in a row
— first blaming a concurrent session for editing the shared wrapper (its mtime had been frozen the
whole time, and I had that evidence), then a CRLF/syntax theory, then credit exhaustion. Four dead PIDs
were holding four of five slots because I had killed those runs myself with `timeout` and `rm -rf`.
Rutvik had to tell me twice to be a smarter orchestrator before I ran the check that settles it.

**How to apply:**
- **Two silent worker deaths = check the locks first**, before any other hypothesis:
  `for d in ~/.claude/delegation/locks/slot-*; do pid=$(basename $d | sed -E 's/^slot-([0-9]+)-.*/\1/'); kill -0 $pid 2>/dev/null && echo "$d ALIVE" || echo "$d DEAD"; done`
  Release only the DEAD ones. Never remove a lock whose PID is alive.
- **Never `timeout` or `rm -rf` a running dispatch.** The EXIT trap is the only thing that frees the
  slot; killing the process leaks it and poisons every later dispatch.
- **Signature to recognise**: process starts, `stall.log` shows `STALL-WARN … 300s-silent`,
  `model-verify.txt` is empty, meta records `model: UNVERIFIED(...)` with `ok:false` and zero sections.
  That is a queued worker, not a failing one.
- **The wrapper's exit code is not the verdict.** In the same incident a worker wrote a complete 16.7 KB
  report and a second one completed its manifest edit, and both were reported to me as failures. Check
  the artifact — the report file and the repo state — before calling a run dead.
  Related: [[feedback_worker_report_claims_need_own_grep]], [[feedback_stop_guessing]],
  [[feedback_worker_credit_budget_is_the_real_killer]].
