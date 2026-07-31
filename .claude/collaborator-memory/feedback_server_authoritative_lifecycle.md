---
name: server-authoritative-agent-connector-lifecycle-not-agent-authoritative
description: "For connect/disconnect/remove of a remote agent, the server is the source of truth and acts immediately; never make user-visible state depend on the agent confirming back"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 93ce0a56-81f6-41ce-991b-520bffdbcd17
---

For any "this device/agent/connector" lifecycle action (disconnect, remove, deregister, revoke), the SERVER must be authoritative: it forgets the agent IMMEDIATELY and the user-visible state reflects it at once. The agent DETECTS it has been deregistered (its next heartbeat/poll fails or returns "you're gone") and stands down / self-uninstalls on its own. Never make the user-visible effect wait on the agent confirming back — a stale / old-version / offline / wedged agent then freezes the UI forever.

**Why:** 2026-06-18 (IntelliQE "Login to Claude") — I built Disconnect/Remove to set a `pending_command` and only delete the server record after the connector called `command-confirm`. The real connector (old code) never confirmed → server never forgot it → UI stuck "connected." This is backwards from how real agent software works (GitHub self-hosted runners: the server deletes the runner immediately; the runner notices on its next poll and exits — confirmed via /research).

**How to apply:**
1. Disconnect / remove / revoke = delete the server record NOW (works whether the agent is online or offline). UI reflects it on the next poll regardless of the agent.
2. Pair with **optimistic UI**: show a transient "Disconnecting…/Removing…" immediately + block further commands, then a terminal "Removed" state (+ a manual fallback when the device-side cleanup can't be guaranteed).
3. The agent's cooperation (clean exit / self-uninstall) is an OPTIMISATION, never a correctness dependency.
4. Treat an in-flight leave (pending command) as not-connected in status AND dispatch, so nothing keeps using a "leaving" agent.

Links [[feedback_real_verification]] [[feedback_apply_ux_vision_to_every_ui]].
