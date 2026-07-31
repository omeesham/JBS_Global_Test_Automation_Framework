---
name: project_assistant_approval_authority_model
description: Recursive approval model for the assistant layer — Claude approves Tier-1 for assistants; the safety layer (Tier-2) stays Rutvik-only always
metadata: 
  node_type: memory
  type: project
  originSessionId: e564a2f1-93bf-4e23-961c-0c6daa3a566e
---

Assistant-layer authority model (Rutvik 2026-07-13, LOCKED). Recursive delegation of the approval power: the way Rutvik approves Claude's protected/out-of-repo actions, Claude now approves the **assistants' and their subagents'** requests — they ASK, Claude critically approves "only if not flawed in any way or form." This unblocks the two things Claude could NOT delegate: (1) protected-file / self-modification edits, (2) out-of-repo access. Claude is the approver, never the doer.

**Two tiers of protected (the load-bearing line):**
- **Tier 1 — Claude-approvable**: ordinary operational control-plane + out-of-repo (routing-policy.json, scorecard.mjs, DUTY_STACK.md, worker-ext.md, copilot-worker.sh, worker/agent profiles, Jira reads, `--add-dir`/`--allow-url`). Assistant requests → Claude critically checks → mints a scoped grant → gate allows.
- **Tier 2 — Rutvik-only ALWAYS, even for Claude**: the safety/permission/privacy layer itself (the gate hooks `check-*.mjs`/delegation-gate/ua-worker-guard, settings.json, the grant-broker/approval logic, the isolation perimeter + manifest, gate mode-knobs, config.json kill-switch, config-liveness-registry). Neither an assistant NOR Claude may self-approve these. Preserves: **Claude cannot silently weaken its own enforcement, and cannot launder that through an assistant.**

**Grant-broker** (itself Tier-2): assistant/subagent emits `{target, action, scope, why}` → Claude approves Tier-1 (mints grant) or escalates Tier-2 to Rutvik. Secure-by-default = everything Tier-2 until the Tier-1 allowlist opens it. Out-of-repo approvals stay bound by the isolation perimeter — an approval can never authorize a bleed to the personal machine (the "most important ask" is not brokerable away). Depth-2 chain: subagent → assistant → Claude (Tier-1 terminal) / Rutvik (Tier-2 terminal).

**Why:** the assistant layer's whole point is Claude delegating maximally, but the self-mod rule ([[feedback_self_modification_needs_explicit_go]]) must stay real — hollow if Claude could approve edits to its own enforcement. **How to apply:** when building/operating the assistant layer, route assistant protected/out-of-repo requests through Claude's critical approval for Tier-1; ALWAYS escalate Tier-2 (the wall itself) to Rutvik. Full spec in git-excluded `plans/pending/SUBPLAN_ASSISTANT_LAYER_HARDGATES.md`. Related: [[project_copilot_takeover_system.md]], [[project_pipeline_identities_are_skins]].
