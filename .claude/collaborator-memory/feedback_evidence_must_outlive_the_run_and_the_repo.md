---
name: evidence-must-outlive-the-run-and-the-repo
description: "Worker evidence has two independent killers — the worker dying mid-run, and another session purging the repo path it wrote to; tee to disk AND keep transient dispatch state outside the repo"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e7690fd2-7dcb-4086-be6d-3093e49d4687
  modified: 2026-07-31T08:25:21.684Z
---

Two failures hit the same wave on 2026-07-31 and both destroyed evidence:

1. **Worker died before writing its report** (session-limit exhaustion, `ok:false` / `no-deliverable`, zero report sections). The verdicts survived anyway because the ticket forced `<cmd> 2>&1 | tee <OUT>/<name>.verify.txt` on every command — the evidence existed independently of the report.
2. **A concurrent purge session deleted the whole output directory** — `.claude/state/ua-worker/chips/<goal>/` — tickets, artifacts and all, while the wave was live.

**Why:** a report is a narration of evidence; if it is the only copy, one death loses everything. And `.claude/state/**` reads as ephemeral scratch to any cleanup pass, so it is not a safe home for state another session is depending on.

**How to apply:**
- Always `tee` every worker command to disk before the worker composes anything; then read the artifacts, never the prose (this is also the Acceptance Law).
- Put transient dispatch state (tickets, worker output dirs) in the session scratchpad OUTSIDE the repo, not under `.claude/state/ua-worker/chips/`.
- Read and extract the verdicts from a completed worker's artifacts promptly — a dead run's files are recoverable evidence, but only until something sweeps them.
- Cross-check: `git log --oneline -3` naming a purge/cleanup plan means another session is mutating the tree — hold writes and relocate state before resuming.

Related: [[worker-ticket-mechanics]], [[silent-worker-death-is-a-stale-slot-lock]], [[dont-destroy-user-data]].
