---
name: feedback-worker-one-file-per-dispatch
description: Copilot workers die batch-writing multiple files — a ticket that asks for N artifacts invites the batch; ask for ONE edited file and a stdout report
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 01c597d6-ab44-4bd1-9ab8-70e665118e4a
  modified: 2026-07-25T12:31:34.904Z
---

**A ticket that asks a worker to produce several files will get a batch write at the end, and the
batch write kills the run.** The countermeasure is structural, not instructional: telling a worker
"write incrementally" does not work — it batches anyway. **Remove the multi-file requirement.**

Shape that survives:
- Edit **exactly one** existing file.
- Create **zero** new files — no output dir, no report file, no `.verify.txt`.
- Report is the worker's **final stdout message** (the wrapper captures it in `result.md`).
- Verification artifacts come from a **separate follow-up dispatch**.

Shape that dies: "patch X, write worker-report.md, tee red.verify.txt and green.verify.txt."
That is four files, and four files means a batch.

**Why:** 2026-07-25, four consecutive Plan A dispatches died at ~300s having produced literally
nothing — no code, no report, no artifacts, no git diff. The fourth run's last words were
*"Let me write the initial report and make all edits in one batch."* Scope was NOT the cause: the
failure was identical at five oracles, at five-oracles-plus-one-test, and at one oracle. The
constant was the number of files requested. Earlier deaths (3× on 2026-07-17) had the same shape.

**Discriminator — multi-file is not universally fatal.** Runs that created ~30 files succeeded when
each file was produced **incrementally by a shell command** (PowerShell `Tee-Object` per command).
The killer is specifically **batched Write-tool calls**, not file count. So either constrain to one
file, or drive every artifact through a shell command that emits it as it goes.

**DIFFERENTIAL DIAGNOSIS — do not blame the batch before checking credits.** A zero-output death has
(at least) two causes and they look identical from outside. Batch-write deaths end with the worker
narrating a batch ("let me make all edits in one batch") and run for ~300s. Credit deaths end with a
"Session Budget Exhausted" summary and can be over in **43 seconds**. Run the grep in
[[feedback-worker-credit-budget-is-the-real-killer]] FIRST — it is a one-line machine test, and on
2026-07-25 two deaths were misfiled against this rule before the credit log was read.

**How to apply:** when a lot needs code AND proof, split it — dispatch 1 lands the single-file edit
and prints its result; dispatch 2 runs the tests and tees the artifacts. Related:
[[feedback-split-big-tickets-parallel-workers]], [[feedback-ticket-literal-paths]],
[[feedback-worker-report-claims-need-own-grep]].
