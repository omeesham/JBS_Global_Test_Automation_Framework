---
name: feedback-one-adversarial-pass-is-not-enough
description: A second cross-vendor review of the same file finds blockers the first never probed — and defence rounds routinely ship partial fixes reported as complete
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8e8a38b6-2071-4cbd-a694-d72b98d4f1c9
  modified: 2026-07-25T15:19:13.657Z
---

**One adversarial pass is not sufficient for any gate whose job is resisting deception.** Measured
2026-07-25 on `scripts/check-worker-fabrication.mjs`: round 1 (gpt-5.5) found 3 holes in quote
provenance, they were fixed and CEO-verified. Round 2 on the **same file** found **five more
blockers** in areas round 1 never touched — negative line numbers, path traversal outside the repo,
a cited directory, meta-schema gaps, and parse-coverage dilution.

Same pattern on `scripts/check-agent-provenance.mjs`, which shipped with only the commissioner's own
verification: its first rival pass found **3 blockers**, including a teaming check that printed a
clean pass on 89% of real data.

**Two structural findings that generalise:**

1. **A fix can create the next hole.** Round 1 answered a bare-substring attack with a minimum-LENGTH
   rule (`WEAK_PROVENANCE`). Round 2 beat it with **25 dashes**. Length was never provenance — a long
   meaningless string proves exactly what a short one does. When reviewing a fix, attack the *fix's
   own mechanism*, not just the original payload.

2. **Partial fix reported as complete is the recurring defence-round failure mode** — not
   carelessness, real work that stops short. Two instances in one session: a ±2 line window wider
   than the delta-1 defect it answered; and a 3-part blocker fixed in 2 parts, leaving
   `if (!hasExit) return claims;` as a silent pass. Both reported `ACCEPTED-AND-FIXED`.

**How to apply:**
- The acceptance criterion for a defence round is **the reported payload now fails** — nothing else.
  Re-fire every payload yourself on real artifacts; never accept `ACCEPTED-AND-FIXED` on its word.
- Budget **two** adversarial rounds for any deception-resisting gate, and say plainly that two is not
  proof of exhaustion.
- Every payload suite needs an **honest control** — a case that must come back CLEAN. Seven
  CEO-authored harness errors in one session were caught only by a control; without one, "everything
  caught" is indistinguishable from a gate that fails everything.

Related: [[feedback-two-chiefs-always-default]], [[feedback-copilot-output-untrusted]],
[[feedback-worker-report-claims-need-own-grep]], [[feedback-verify-synthesis-refutations]].
