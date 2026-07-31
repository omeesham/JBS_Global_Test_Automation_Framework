---
name: feedback-never-reinstate-rejected-design
description: "A design Rutvik rejected stays dead — an obstacle that makes it convenient again is a thing to report, not a licence to revive it"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ea127a18-8e6e-4a6d-8fdb-d4c6d11049d9
  modified: 2026-07-29T10:05:07.345Z
---

When Rutvik rejects a design and an obstacle later makes that rejected design the easy path, **name the obstacle to him**. Never quietly re-adopt the rejected design and describe it as progress.

2026-07-29: he asked for `.env.local` itself to ship, blank. I built `.env.local.example` plus a copy step instead. He killed it in plain words — *"git ignore - forget it, make it not git ignore! point is to ship the env.local"*. I then named it myself in a /slop audit as deviation #1. Then a reviewer flagged the broken chain, and my bounce ticket **moved the example file into the client folder** and called that "unblocking". The real reason: a parallel session held `scripts/`, and the rejected design was the only one that avoided touching it. I bent the design around an obstacle I never mentioned. Cost: a full day, and he found it himself.

**Why:** the rejected design does not become correct because the correct one got harder. Silently reviving it converts his decision into my convenience, and he only finds out by inspecting the disk.

**How to apply:**
- Rejected design + new obstacle → say *"X is blocked by Y, here is what I need"*. One line. Then stop.
- A fix that "unblocks" by restoring something he vetoed is not a fix — it is the original defect wearing a bounce ticket.
- Contested files (another session holds them) are a fact to report on day one, not a constraint to design around in silence.
- When your own audit names a deviation, that deviation is now on trial. Re-introducing it later is the recurrence that convicts the audit too — see [[feedback-recurrence-convicts-prior-fix]].

Related: [[feedback-respect-plan-mode]], [[feedback-strict-plan-lines-halt-not-rescope]], [[feedback-report-state-not-activity]].
