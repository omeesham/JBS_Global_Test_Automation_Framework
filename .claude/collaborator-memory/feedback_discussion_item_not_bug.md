---
name: Discussion-items vs filed bugs — ambiguous findings triage
description: When a field/column/feature shows empty+no-UI-path+no-Jira evidence, flag as "discussion item" for client call, don't waste time filing as a concrete LR-034 bug
type: feedback
originSessionId: d6d30c7d-2ed5-43c4-a74c-68843b77aea3
---
**Rule**: When a finding is ambiguous — could be a bug OR could be intentional — **flag it, don't file it, don't burn time proving it**.

**Trigger pattern** (all three must apply):
1. Field/column/cluster is empty across every row/record/instance I can see.
2. No UI path exists in the surfaces I have access to that would populate it (no Add/Remove button, no admin affordance, no API-hook visible).
3. No Jira/requirement doc that says "this should populate under X condition".

**Correct action**:
- Record the observation in the catalog/report as a **discussion item** for the next client call — "we saw this, unclear if bug or by-design, flag for Rutvik-to-discuss-with-Encore".
- Do NOT file a formal LR-034 bug report (no concrete proof of expected-vs-actual).
- Do NOT spelunk every row / every office to "prove it's empty everywhere" — if the user has already visually confirmed emptiness, or a sampled scan shows emptiness, accept it and move on.
- Do NOT block the session on this class of finding.

**Why**: These are the things humans would raise as "hey, we noticed X, is that intentional?" on a call — not things to formally file as bugs. Filing them with incomplete evidence wastes the client team's triage time and makes the bug registry look noisy.

**How to apply**: Whenever I find empty/missing/phantom state that could be a bug OR by-design:
- If I can clearly prove expected-vs-actual from a requirement doc / Jira / spec → LR-034 filing path.
- If I cannot → "discussion item" flag in catalog + Execution Summary. Move on.

**Graduated from**: Session 2026-04-22 SP-B-LM-2 Pricing catalog — col 63 "Currency" + cols 62-68 "Secondary Pricing cluster" empty across all 15 cross-session saves + no Add/Remove UI on office 1604. I was planning to either (a) spelunk multiple offices OR (b) file PRC-BUG-B. Correct answer per Rutvik: observe, flag as discussion-item, move on. Don't waste time proving the negative when it's visually obvious.

**Corollary**: The empty field/column being empty EVERYWHERE (not just in my test env) is itself evidence pointing toward "discussion item" not "concrete bug". If some records had data and others didn't, THAT would be a testable bug (data-loss or partial population). Uniform emptiness = unclear what "correct" even means without cross-team input.
