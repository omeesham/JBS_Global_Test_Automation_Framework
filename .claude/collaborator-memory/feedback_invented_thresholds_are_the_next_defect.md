---
name: feedback-invented-thresholds-are-the-next-defect
description: "A repair that invents a numeric threshold makes the next defect — delete the number rather than retune it, and justify by comparing false-positive cost against false-negative cost"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 51ef29b4-3c51-4a5f-8b49-7c3d0f0bcca9
  modified: 2026-07-30T08:29:22.527Z
---

When a worker repairs a filter by inventing a numeric threshold, that number is very likely the
next defect. Observed **three times in one workstream** (oneliners secret filter, 2026-07-26):

1. "treat `+ / = _ -` as credential evidence" — `/`, `-`, `_` are the commonest characters in
   Rutvik's writing; 366 false positives.
2. "drop n-gram tokens ≥16 chars" — ate `counterproductive`, `cross-family-delegation`.
3. "only lines ≥16 chars join into a wrapped-credential run" — missed a 40-char key wrapped 14/14/12.

Each was invented during a repair, none was in the finding it answered, and each survived a green
test suite. The battery was 29/29 while two confirmed leaks were live.

**Fourth instance, and a new surface — the number was in a TICKET, not a repair (2026-07-30).**
A bed-hunting ticket demanded offices with "≥ 20 rows" to call a bed filter-capable. Nothing derived
20; it was borrowed from an unrelated "20 rows per page" note. The real requirement is that a
two-state filter has data on **both** sides, which is satisfied by ≥1 active and ≥1 inactive — so 20
would have rejected usable beds and returned "no bed exists", the exact false conclusion that had
already burned three runs. **Acceptance criteria are where an invented threshold does the most
damage**, because the number silently defines the answer the sweep is allowed to give.

**The move that finally worked: delete the number, do not retune it.** Picking 12 after 16 fails
just relocates the argument.

**Why:** a threshold fitted to the one example in front of you encodes that example, not the rule.
The reviewer will always find the shape just outside it.

**How to apply:**

- Treat any new constant in a fix as a finding in its own right and send it to the reviewer to
  attack from **both** sides — under-broad and over-broad.
- **Before writing a number into a ticket's ACCEPTANCE, derive it out loud from the thing being
  measured.** If the derivation is "what would make this answer usable?", write *that* sentence as
  the criterion and skip the number entirely. A threshold in acceptance decides the verdict before
  any evidence arrives, and the worker cannot argue with it.
- Before defending a threshold, price both errors concretely. Here: a false positive cost a message
  its eligibility to be one of 8 quoted exemplars out of 3,935 candidates, while it stayed in the
  corpus and still fed every statistic. A false negative put a credential in a file read every
  session. Those are not comparable, so the threshold was buying almost nothing at real cost —
  which is what made deleting it obviously right rather than merely tidy.
- Have the author **trace every consumer** of the check before you accept a cost argument. Six call
  sites, all exemplar/phrase selection, none touching corpus survival — that trace is what turned
  the reasoning from plausible into verified.
- Deleting a constant is only safe when the failure mode is degraded-but-honest output, never a
  deadlock. Test the starvation case explicitly.

Related: [[feedback-one-adversarial-pass-is-not-enough]], [[feedback-gate-fix-floor-design]],
[[feedback-worker-report-claims-need-own-grep]], [[project-oneliners-switch]].
