---
name: copilot-trust-is-switched
description: "Copilot trust is governed by the /assistants switch (Rutvik decision 2026-07-16) — ON = copilot CEO-delegation mode; OFF = copilot fully off, Claude does deliverables itself. Blanket \"verify every copilot diff via Opus\" was a 2026-07-16 SESSION-ONLY directive, not standing."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 50072f45-7db7-4ab9-8949-f494d7a5616a
---

Rutvik (2026-07-16), two-part correction:

1. **SESSION-SCOPED (2026-07-16 session only, EXPIRED after)**: "u still have to check the code these moronic copilot workers write, u can dispatch opus subagent from claude code itself to get shit done… we cannot trust copilot until everything is properly setup." That session: every copilot diff Claude-verified; Opus subagents executed the work. NOT a standing every-session rule — he explicitly said "This is only FOR THIS SESSION!"

2. **DURABLE semantic (the actual standing rule)**: "assistants is the switch that either lets claude work on its own, or become a ceo delegator." `/assistants on` = copilot integration ON (Claude = CEO delegator per worker-ext.md). `/assistants off` = copilot OFF entirely = Claude does ALL work itself, exactly like pre-integration — used "whenever i am afraid of copilot's bullshit code", until the integration plan families (LCD/PARITY/UPLINK/HARDGATES/ASSISTANT_LAYER…) are done + tested.

**Why:** Copilot integration is a long build; Rutvik needs a one-switch fallback to trusted Claude-only delivery for one-shot/deliverable work without dismantling the delegation stack.

**How to apply:**
- At session start read `~/.claude/delegation/assistant-state.json`: `"off"` → NO copilot dispatches; Claude executes deliverables itself (pipeline identities as usual). `"on"` → CEO-delegator mode per worker-ext.md.
- The original /assistants design (OFF = legacy direct-council delegation, chief-layer-only toggle) is SUPERSEDED by this decision; skill doc updated 2026-07-16. Hook-level wiring (gate/guard/primer honoring OFF) needs Rutvik-applied Tier-2 patches — until applied, OFF is doctrine-enforced by Claude reading the state file.
