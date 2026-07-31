---
name: feedback_no_asks_fable_decides
description: "Standing order — never ask Rutvik clarifying/scope/design questions; delegate the decision to a fable agent that researches online + picks the most-ideal answer from Rutvik's known style"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 92727b65-1382-486e-bdfd-5504c81a7ca5
---

**Standing order (2026-07-18)**: From now on, do NOT ask Rutvik anything. When a genuine decision-fork appears (scope, approach, design, config), delegate it to a **fable agent**: have it `/research` online AND reason from what we know about Rutvik + his style of choices for this repo, then return the single most-ideal answer. Claude adopts it and proceeds — no question to Rutvik.

**Why**: Rutvik wants zero decision-friction on his end; he trusts fable+Claude to research and choose the way he would. Asking him is the friction he's eliminating.

**How to apply**:
- Replaces the terminal "ask Rutvik" rung of the self-first ladder ([[feedback_self_first_research.md]] LR-063): introspect → repo → Rovo → web → **fable-researches-and-decides** (was: ask Rutvik).
- The fable brief carries: the fork, the options, what we know of Rutvik's style, and "return ONE recommended answer + 1-line why." Fable may `/research` the web for best-practice grounding.
- State the adopted decision in chat as a one-liner ("defaulting X because …") so Rutvik can veto — informing ≠ asking.
- **Boundary — this does NOT waive hard safety gates**: deletions (category D) and protected control-surface edits (category C) still need Rutvik's explicit per-item GO; prohibited actions stay prohibited; publishing still gated. Fable-decides covers *work forks*, not *irreversible/safety* forks.
- Supersedes the ask-first reflex in [[feedback_ask_rutvik_oneliner.md]] for decision-forks (that memory's format still applies to the rare safety-gate GO request).
