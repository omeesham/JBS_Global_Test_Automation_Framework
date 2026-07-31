---
name: proposal-may-truncate-the-finding
description: "A worker's proposal can carry only half of a finding's stated fix — diff the proposal against the original finding row before approving"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 26eef3b7-4743-40c6-9eac-6d60ef6c8935
  modified: 2026-07-30T16:53:57.224Z
---

A proposal row is a worker's *restatement* of a finding, and restatement can silently drop a clause.
Before approving any proposal, read the original finding row and check that the proposal covers **all**
of its stated fix — not just the first, easiest half.

**Why:** Live case, 2026-07-30. Finding `P2-LOT18-01` read:

> `COMPACT: remove test-client.ts from tsconfig include; create tsconfig.test.json`

Two halves. The R-phase proposal carried only the removal. It was approved and applied correctly — and
the net effect was that `test-client.ts` (which exists, is tracked, and typechecks clean) stopped being
typechecked by anything. The removal alone converted a "stop shipping a dev file" fix into a pure
coverage loss. The worker did exactly what it was told; the defect was in the approval.

The failure is invisible at review time because the applied half is *correct in isolation*. The diff
looks right, the typecheck is green, the report is honest. Only the finding row shows what's missing —
and the second clause is usually the compensating control that makes the first clause safe.

**How to apply:**
- For every proposal, open the finding row it derives from and compare clause by clause. A `;` or "and"
  in the finding text is the tell — it means two actions, and a proposal naming one is incomplete.
- Treat "remove X from the build/include/registry" as presumptively half a fix. Ask what preserves the
  coverage that removal deletes. If the answer isn't in the proposal, it was truncated.
- A green typecheck after a removal proves nothing — a file excluded from checking always passes.
  Verify the removed target still exists and is still covered somewhere.
- When it turns out truncated, that's a dispatcher error, not a worker error. Say so, and file the
  missing half as its own ticket rather than reverting the applied half.

Related: [[feedback_worker_report_claims_need_own_grep]] — worker claims need your own grep;
[[feedback_never_propagate_a_derived_id_to_file_mapping]] — the ticket names the FILE, the worker derives
the IDs; [[feedback_gitignore_listed_not_untracked]] — pick the right instrument before concluding.
