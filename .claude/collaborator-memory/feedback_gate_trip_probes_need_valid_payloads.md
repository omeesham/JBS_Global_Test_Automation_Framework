---
name: gate-trip-probes-need-valid-payloads
description: CEO probe-craft — a hook-gate trip test must use a payload that survives tool input-validation; a rejected input never reaches PreToolUse and masquerades as a gate hole
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 92727b65-1382-486e-bdfd-5504c81a7ca5
---

2026-07-16 LCD_07 apply-verification: I probed the repo-ledger gate entry with an Edit whose `old_string` didn't exist ("zero-pollution trick"). Claude Code's input validation rejected it in ~4ms BEFORE any PreToolUse hook ran — no hook attachments in the transcript. I read the absent deny as "the gate entry is DEAD" and dispatched a 2-round fix chain for a defect that never existed (the live gate denies + logs correctly when spawned with the same path — proven 12/12).

**Why:** tool-input validation preempts hooks; absence-of-deny is only meaningful if the hook layer actually attached. A probe that can't execute proves nothing about the gate.

**How to apply:**
- Gate-trip tests use payloads that pass input validation end-to-end (real `old_string`, or a Write to a scratch-named path INSIDE the protected dir), and confirm the hook layer attached (deny text / gate-fires line / hook cascade in transcript) before concluding anything.
- Cheapest reliable trip: spawn the gate directly with a synthetic PreToolUse JSON payload (the gate-trip-sim pattern in the lcd07-gatefix artifacts) — deterministic, zero live pollution.
- Before reporting any "protection is dead" finding to Rutvik: one direct-spawn counter-proof first. Related: [[file-based-probes-only]].
