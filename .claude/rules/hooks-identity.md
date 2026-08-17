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

- The LIVE queue of headless runs lives in `.claude/state/chain-sessions/<plan>.log` (+ `.pid`), and their JSONL transcripts in `~/.claude/projects/C--Users-RutvikKhorasiya-projects-encore-framework/<uuid>.jsonl`. These are the "chain-spawned, human never saw them live" artifacts.
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

### C. Chain Stop-hook correctness — session-ownership + Git-Bash launch survival (2026-07-07)

Two defects surfaced on the **first real headless chain run** (2026-07-06, `SUBPLAN_CORP_PRICING_NM2305_LOC_IMPORT`). Both are now structural fixes in `chain-orchestrator.sh` + `lib/parse-verdict.mjs`, covered by `parse-verdict.mjs --self-test` and `scratchpad/chain-fix-integration-test.sh` (13 assertions against the real hook). Rule text + code edited together (LR-020).

- **RC-1 — Git-Bash/MSYS path mangling of the spawn.** `nohup claude -p "/execute <file>"` runs under Git Bash on Windows; POSIX-path conversion rewrites the bare `/execute` argument into `C:/Program Files/Git/execute …`, so the headless session receives a nonsense prompt, does no plan work, and exits verdict-NONE. It bit BOTH the manual `/chain` launch AND this hook's auto-advance spawn (the earlier "auto-advance dry-run passed" only exercised the `CHAIN_SPAWN_CMD="echo …"` test override, never a real `claude -p`). **Fix**: prefix the spawn with `MSYS2_ARG_CONV_EXCL='*'` (no-op on Linux/macOS). Any new code that shells `claude -p "/…"` on this repo MUST carry the same guard. Verified: without it argv[0] mangles; with it the slash-command passes through intact.
- **RC-2 — Stop hook had no session-ownership guard.** The `Stop` hook fires on EVERY session's turn-end — the interactive launcher, a manual **Stop-button / Ctrl-C interrupt**, or an unrelated subplan's run — not only the headless `/execute <current_file>` session it means to grade. The old code blindly read `currentIndex`, parsed the *stopping* session's transcript, and recorded that verdict against the current subplan. On 2026-07-06 a pending interrupt on the interactive launcher stamped `verdict-NONE` onto NM2305 and paused the chain **22 s after spawn, while NM2305's own headless session was still alive**. **Fix**: before recording anything, the orchestrator calls `parse-verdict.mjs --owns-subplan <transcript> <current_file>`, which returns `yes` only when the transcript's first user prompt is exactly `/execute <current_file>` (the unique headless launch signature). Foreign/interrupt/cross-subplan Stop → silent exit (no record, no pause, no spawn). Fail-safe: missing/unreadable transcript or any parse error → not-owned → silent exit (never poison; a genuine headless transcript is present + readable). This also independently closes the V3.1 post-advance double-fire (a stale transcript no longer matches the advanced `current_file`).

**Trigger** (§C): any edit to `chain-orchestrator.sh`, `chain-guards.sh`, or `parse-verdict.mjs`; any new code path that spawns `claude -p "/<slash-command> …"` on Windows/Git-Bash; any new `Stop` hook that records per-session outcomes must gate on session ownership, not just `status==running`. Re-run `node .claude/hooks/lib/parse-verdict.mjs --self-test` after touching any of them.

## LR-043: Identity discipline — structural enforcement via hooks + skill mandates

> **REMEDIATION NOTICE (2026-04-23, same-day)**: The hook built by this rule sabotaged its own author's next session on its first real-world use (plan-mode write to `C:/Users/RutvikKhorasiya/.claude/plans/*` → default-deny because harness paths were not in OWNER's §2 coverage). Resolution landed the same day: OWNER short-circuit in `canWrite()` (§A), `/final-q` cycle-reset + plan-mode path exemption + denied-edit filter, tolerant override-handshake regex, and `/identity` SKILL.md Purpose reframe from "access-control enforcement" to "system-prompt context-loading". §B (override-discipline Stop hook) was REMOVED from `.claude/settings.json` during the incident and is DEPRECATED — do not reintroduce; the primary write-gate is now OWNER-free so the companion audit has no basis. **No new LR rules for this remediation**: the framework already has rule-inflation fatigue; the fix is in code + skill prose, not a new rule. OWNER may judge-reject a bugged hook via the override handshake sparingly — discretion, not workflow.

Four structural gates convert ALL-077 (subplan identity must match §2 ownership) and the mid-session identity-switch protocol (`feedback_identity_switch_protocol.md`) from advisory rules into bypassable hooks and mandated skill steps.

### A. PreToolUse hook — write-time identity check (`.claude/hooks/identity-switch-gate.sh` + `lib/check-identity-switch.mjs`, SP-IDS-01)

> **SCOPED 2026-04-23**: OWNER is short-circuited in `canWrite()` to allow all writes; the §2 write-gate applies only to pipeline identities (HUNTER / GIVER / BUILDER / HEALER / WATCHDOG / GARDENER). Identity is a context-switching layer (load the right system prompt so Claude doesn't hallucinate a pipeline agent's scope), not an access-control layer for the non-pipeline owner. The OWNER catch-alls in `identity-ownership.mjs` remain for introspection (`ownershipFor()` / deny-message rendering) but no longer gate writes for OWNER. Original SP-AAE-01 need (preventing a pipeline agent from writing outside §2) stays satisfied by the pipeline-identity branch.

- Ground-truth identity = last `/identity` Skill invocation in transcript. Banner text is UX-only.
- Every Edit/Write/NotebookEdit tool call is inspected: target path vs §2 ownership for the ground-truth identity (via `scripts/identity-ownership.mjs` — byte-exact mirror of §2, gated by `scripts/check-identity-ownership.mjs` parity test).
- Mismatch → `permissionDecision: "deny"` with full §2 citation + 3 resolution options ((a) switch identity, (b) user-typed override authorization, (c) update §2).
- Override allow-path: in last 3 assistant turns, `[OVERRIDE-REQUEST]` for same path + user authorization phrase (`override approved`/`override ok`/`approve override`/`authorized to override`) → one-shot allow.

#### A.1 Layer-1 OWNER pipeline-artifact gate (PLAN_IDENTITY_ENFORCEMENT, 2026-06-25)

> **CORRECTNESS-CRITICAL FRAMING — the `canWrite()` OWNER short-circuit STAYS.** The §A SCOPED-2026-04-23 invariant above remains true: `canWrite("OWNER", …)` still returns `true` unconditionally and the §2 write-gate still applies only to pipeline identities. Layer 1 does **NOT** re-introduce blanket OWNER access-control. It is an **additional hook-level branch** in the same `check-identity-switch.mjs` PreToolUse path that fires *before* the `canWrite` short-circuit, but ONLY for a deliberately narrow case: an OWNER write to **pipeline-artifact territory** *inside an active `/execute`*. Rule text and hook code are edited together so they never contradict (LR-020).

Why it exists: adopting a pipeline role (`/identity GIVER`) is what loads that role's HARD STOPs. Today OWNER can author a role's test deliverables (test-cases, field-inventories, catalogs, specs, selectors, REQUIREMENTS.md) during `/execute` *without ever adopting the role*, silently skipping every gate. Layer 1 closes that — it enforces **context-loading** ("adopt the role before writing the role's artifacts"), which IS what LR-043 says identity is for; it is not access-control.

- **DENY condition (all of):** ground-truth identity == OWNER · an `/execute` is active (last `Skill=execute` with no subsequent `final-q`, reusing the todo-gate's transcript walk) · target is **pipeline-artifact territory** (`isPipelineArtifact(path)` in `identity-ownership.mjs` — some pipeline role has a strong write grant on the §2 row AND OWNER's grant ≠ APPEND, so the shared ceremony logs `agent-mistakes.md`/`agent-activity-log.md` are excluded). Framework paths (`scripts/**`, `plans/**`, `.claude/**`, `docs/**`, `website/**`) are not pipeline-artifact territory → never gated → **LR-043-safe by construction**.
- **Role derivation:** `ownerRoleFor(path)` inverts `OWNERSHIP_ROWS` to the primary pipeline CREATE/RW role (test-cases→GIVER, `*.spec.ts`→BUILDER, REQUIREMENTS.md→HUNTER, …). No new ownership table.
- **Ramp knob** `.claude/identity-gate-config.json` `{mode: off|announce|deny}`, ramped like `closure-config.json`'s `c6_mode`: `off` skips the branch; `announce` ALLOWS + persists a warning to `.claude/state/identity-gate-warnings-<sid>.json` (read by `/final-q` Step 4.5 + `/audit`, floor YELLOW); `deny` DENIES unless the §A override handshake is present. Landed in `announce`. Env `IDENTITY_GATE_MODE` overrides (tests).
- **Fail-open:** any parse/lookup error → allow (the hook's existing posture; `readGateMode` returns `off` on error).
- **On catch (deny mode): HALT, no silent auto-switch** — forces `/identity <ROLE>`, which actually loads the HARD STOPs (same posture as Phase 0.1; matches the 2026-04-23 "preserve audit trail" directive).
- Fixtures: `.claude/hooks/lib/test-identity-switch-fixtures.mjs` (deny/announce/off × pipeline-artifact vs framework × in/out `/execute` + GIVER-adopted + override). Parity: `check-identity-ownership.mjs` asserts `ownerRoleFor`/`isPipelineArtifact` stay consistent with `OWNERSHIP_ROWS`.

### B. Stop hook — session-end override audit — DEPRECATED 2026-04-23

`override-discipline-gate.sh` + `lib/check-override-discipline.mjs` (SP-IDS-02): removed from `.claude/settings.json` during remediation; files remain on disk but unwired — do not reintroduce (OWNER short-circuit makes pipeline-identity overrides rare; reconsider only if override abuse appears in chain-session audits).

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
