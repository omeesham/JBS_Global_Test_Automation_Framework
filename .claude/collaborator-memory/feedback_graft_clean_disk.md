---
name: feedback-graft-clean-disk
description: Grafting must leave the disk truthful (git index == tested worktree); prevention over reconciliation — no ledger/marker for a clean graft.
metadata: 
  node_type: memory
  type: feedback
  originSessionId: b6fb4198-1fcf-4955-8623-b3903a97fda4
---

When hand-grafting colleague code into our codebase (splicing outside the pipeline `/chain`), the graft is NOT done until `git diff --quiet -- <graft-paths>` exits 0 — the staged index must equal the E2E-tested working tree. Never `git add` before the E2E is green: early staging → stale index → a later commit ships code that was never tested (the NM-2265 defect: staged an old version, corrected the worktree in audit, never re-staged).

**Why:** a clean graft makes the disk truthful. If the disk lies (staged ≠ tested), the graft was botched and nobody cleaned it. Rutvik: "make sure it NEVER happens in the first place" + "if the graft was done properly, the disk would NOT LIE, unless the graft was botched and no one cleaned it."

**How to apply:** use `/graft` (encodes splice → verify vs source → prove with real E2E → sync index to tested worktree). Prevention is primary; `.claude/hooks/graft-ship-gate.sh` is a Claude-Bash-only commit backstop, not the fix. **Reject reconciliation patches** — a ledger / marker / SessionStart banner to "explain" a dirty graft to other sessions is treating the symptom. Fix the graft so the disk is truthful; don't build machinery to describe the mess. Pairs with [[feedback_real_verification]] (LR-059 real-E2E), [[feedback_no_token_burn_on_rediscovery]].
