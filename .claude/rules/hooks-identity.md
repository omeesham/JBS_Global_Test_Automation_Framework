---
description: Chain-session artifact discipline + identity hook enforcement
paths:
  - ".claude/hooks/**/*.sh"
  - ".claude/hooks/**/*.mjs"
  - ".claude/skills/identity/**"
  - "scripts/identity-ownership.mjs"
  - "scripts/check-subplan-identity.mjs"
  - ".claude/state/chain-sessions/**"
---

# Hooks & Identity Discipline

Path-scoped rule pack — loads when editing hooks, identity ownership, or anything in chain-sessions state.

## LR-042: Chain artifact discipline — `/final-q` mandatory + chain-sessions/* move only via `/chain_audit` GREEN

Two enforcement strands for headless chain execution. Both are structural (hooks / skill steps), not advisory.

### A. `/final-q` is non-skippable before any session ends

- `/execute` SKILL.md Phase 4 mandates `/final-q` as the final action — no prose summary, no "done" phrasing in place of it. The output MUST end with `## /final-q audit` heading + (within ~3000 chars) `**Verdict**: GREEN|YELLOW|RED`.
- **Stop-hook enforcement REMOVED (2026-04-23)**: `.claude/hooks/final-q-gate.sh` + `lib/check-finalq-required.mjs` deleted. The hook injected a ~600-char block reason on every edit-bearing Stop, including routine iterative turns and conversational stops mid-session — pure token burn with weak marginal signal. The companion `rubber-stamp-gate.sh` was removed at the same time for the same reason (phrase-match heuristic, AUD-001/ALL-030 discipline already in `/final-q` Step 4.5 + `/audit` Step 2.5). `/execute` Phase 4 mandate remains the primary enforcement.
- Pure-chat sessions (zero mutations) are exempt. Trivial single-task sessions use `/final-q`'s own short-path, but still invoke `/final-q`.
- For chain-spawned children: without a parseable verdict, the chain orchestrator pauses with `verdict-NONE`. The `/execute` Phase 4 mandate + chain-orchestrator pause-on-NONE (strand unchanged — see `chain-orchestrator.sh`) guarantee emission at the authoring + execution layers. The removed Stop hook was a redundant third layer.

### B. Chain-sessions artifacts move only via `/chain_audit` GREEN + explicit user approval

- The LIVE queue of headless runs lives in `.claude/state/chain-sessions/<plan>.log` (+ `.pid`), and their JSONL transcripts in `~/.claude/projects/c--Users-rutvi-projects-encore-framework/<uuid>.jsonl`. These are the "chain-spawned, human never saw them live" artifacts.
- The ONLY path that may move these files out is `/chain_audit` when it (a) verdicts GREEN AND (b) receives explicit user "yes" in the interactive chat. On that two-gate condition, the `.log`, the `.pid`, and the matching `~/.claude/projects` JSONL transcript all move to `.claude/state/chain-sessions-green/` (sibling of `chain-sessions/` and `chain-archive/`).
- YELLOW / RED → nothing moves; artifacts stay in `chain-sessions/` so the user can fix and re-audit.
- FORBIDDEN paths (no matter how tidy it looks):
  - manual `mv`/`rm` of `chain-sessions/*.log` or `.pid` (violated 2026-04-23 → triggered this rule)
  - `/chain reset` touching `chain-sessions/` (reset archives `chain.json` only)
  - agent cleanup passes, `/cleanup` skill, end-of-session tidy-up
  - orchestrator hooks (`chain-orchestrator.sh` writes to chain-sessions, never moves out)

**Why**: the chain-sessions folder IS the audit queue. Pre-emptive archival destroys the queue. Only human-gated `/chain_audit` may approve removal, because only a human can confirm the headless run was actually correct.

**Trigger**:

- Any code path that touches `.claude/state/chain-sessions/*` → must be `/chain_audit` GREEN-approval path OR blocked.
- Any new `/execute` SKILL.md work must preserve Phase 4.
- Any new Stop hook or pre-stop skill must preserve the `/final-q` invocation requirement.

## LR-043: Identity discipline — structural enforcement via hooks + skill mandates

> **REMEDIATION NOTICE (2026-04-23, same-day)**: The hook built by this rule sabotaged its own author's next session on its first real-world use (plan-mode write to `C:/Users/rutvi/.claude/plans/*` → default-deny because harness paths were not in OWNER's §2 coverage). Resolution landed the same day: OWNER short-circuit in `canWrite()` (§A), `/final-q` cycle-reset + plan-mode path exemption + denied-edit filter, tolerant override-handshake regex, and `/identity` SKILL.md Purpose reframe from "access-control enforcement" to "system-prompt context-loading". §B (override-discipline Stop hook) was REMOVED from `.claude/settings.json` during the incident and is DEPRECATED — do not reintroduce; the primary write-gate is now OWNER-free so the companion audit has no basis. **No new LR rules for this remediation**: the framework already has rule-inflation fatigue; the fix is in code + skill prose, not a new rule. OWNER may judge-reject a bugged hook via the override handshake sparingly — discretion, not workflow.

Four structural gates convert ALL-077 (subplan identity must match §2 ownership) and the mid-session identity-switch protocol (`feedback_identity_switch_protocol.md`) from advisory rules into bypassable hooks and mandated skill steps.

### A. PreToolUse hook — write-time identity check (`.claude/hooks/identity-switch-gate.sh` + `lib/check-identity-switch.mjs`, SP-IDS-01)

> **SCOPED 2026-04-23**: OWNER is short-circuited in `canWrite()` to allow all writes; the §2 write-gate applies only to pipeline identities (HUNTER / GIVER / BUILDER / HEALER / WATCHDOG / GARDENER). Identity is a context-switching layer (load the right system prompt so Claude doesn't hallucinate a pipeline agent's scope), not an access-control layer for the non-pipeline owner. The OWNER catch-alls in `identity-ownership.mjs` remain for introspection (`ownershipFor()` / deny-message rendering) but no longer gate writes for OWNER. Original SP-AAE-01 need (preventing a pipeline agent from writing outside §2) stays satisfied by the pipeline-identity branch.

- Ground-truth identity = last `/identity` Skill invocation in transcript. Banner text is UX-only.
- Every Edit/Write/NotebookEdit tool call is inspected: target path vs §2 ownership for the ground-truth identity (via `scripts/identity-ownership.mjs` — byte-exact mirror of §2, gated by `scripts/check-identity-ownership.mjs` parity test).
- Mismatch → `permissionDecision: "deny"` with full §2 citation + 3 resolution options ((a) switch identity, (b) user-typed override authorization, (c) update §2).
- Override allow-path: in last 3 assistant turns, `[OVERRIDE-REQUEST]` for same path + user authorization phrase (`override approved`/`override ok`/`approve override`/`authorized to override`) → one-shot allow.

### B. Stop hook — session-end override audit — DEPRECATED 2026-04-23

`.claude/hooks/override-discipline-gate.sh` + `lib/check-override-discipline.mjs` (SP-IDS-02): removed from `.claude/settings.json` during the remediation incident. The companion `.mjs` + `.sh` files remain on disk (tolerant regex still patched for parity with `check-identity-switch.mjs`) but are not wired to any hook event. **Do not reintroduce**: with OWNER short-circuited in §A, overrides now only trigger when a pipeline identity hits a real §2 deny — rare enough that session-end audit is overhead not protection. Reconsider only if pipeline-identity override abuse actually appears in chain-session audits.

### C. Stop hook — banner drift + switch-without-extract detection (second mode of SP-IDS-01's hook)

- Blocks session end if banner text ≠ last `/identity` Skill invocation (agent relabeled without switching).
- Blocks if `IDENTITY SWITCH:` log line appears in transcript without a matching `## [IDENTITY-ACTIVE: {NEW}] Constraint Extract` heading within 5 turns.

### D. `/execute` Phase 0.1 cross-check HALT (`.claude/skills/execute/SKILL.md` + `scripts/check-subplan-identity.mjs`, SP-IDS-04)

- Every `/execute` invocation with a plan file runs `node scripts/check-subplan-identity.mjs <plan>` before TodoWrite.
- Exit 1 → HALT; emit violations + 3 options; agent must pick (a)/(b)/(c) and act before proceeding.
- No silent auto-switch — audit trail preservation (per Q4=a Rutvik directive 2026-04-23).

### `/identity` SKILL.md mandates (SP-IDS-03)

- Step 2 item 6 + Step 6 item 5: emit Step 6.5 `## [IDENTITY-ACTIVE: {CODENAME}] Constraint Extract` block before any tool call under new identity (parsed by Stop hook).
- Step 5: "Ground truth is the last `/identity` Skill invocation, not the banner text."
- Step 7: request-authorize-log handshake replaces informal "user says override".

**Trigger**:

- Every Edit/Write/NotebookEdit tool call (PreToolUse fires universally).
- Every session end (Stop hooks fire universally).
- Every `/execute` with a plan file (Phase 0.1 fires before TodoWrite).
- Every `/identity` invocation (Step 6.5 emission mandate).
