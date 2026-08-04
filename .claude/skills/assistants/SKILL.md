---
name: assistants
description: Toggle the assistant delegation layer on or off, or check its current state. Sub-commands: on | off | status. Explicit-invoke only. NOT listed in INDEX.md (secrecy — git-excluded dir).
user-invocable: true
disable-model-invocation: true
auto-calls: none
tools: Read, Write, Bash
---

# /assistants — Copilot Layer Master Switch

**SEMANTIC REDEFINED by Rutvik in-chat 2026-07-16** ("assistants is the switch that either lets
claude work on its own, or become a ceo delegator"): this switch now governs the ENTIRE copilot
integration, not just the chief-of-staff seat.

- **ON** = copilot integration ON — Claude = CEO delegator per worker-ext.md (tickets, workers,
  reviewers, chief when briefed).
- **OFF** = copilot ENTIRELY OFF — Claude does ALL work itself, exactly like pre-integration
  (pipeline identities, skills, direct execution). Zero copilot dispatches. Used whenever Rutvik
  needs trusted one-shot delivery ("whenever i am afraid of copilot's bullshit code"), until the
  integration plan families (LCD / PARITY / UPLINK / HARDGATES / ASSISTANT_LAYER) are done + tested.

The pre-2026-07-16 semantic (OFF = legacy direct-council delegation, still copilot-on) is
SUPERSEDED. **Wiring status**: OFF is doctrine-enforced (Claude reads the state file at session
start and must not dispatch); the three home hooks (delegation-gate / ua-worker-guard /
delegation-primer) honor OFF structurally only after Rutvik hand-applies the Tier-2 patches
(3-line early-allow on explicit `"assistant":"off"`; fail-safe: absent/unparseable state ≠ off;
PROTECTED-file rules stay live in every mode).

**SECRECY**: This skill is NOT added to the tracked skills INDEX.md. The `.claude/skills/assistants/`
directory is git-excluded. Never reference this system using vendor strings in any tracked file.

**MF-2 HARD RULE**: This skill writes ONLY `~/.claude/delegation/assistant-state.json`.
It NEVER writes `~/.claude/delegation/config.json`. config.json is a PROTECTED control file —
flipping it forces a GO+SELF_GRANT ceremony on every on/off toggle. assistant-state.json is
unprotected because toggling it can only select legacy-OFF or ON, never weaken a gate.

## State file

`~/.claude/delegation/assistant-state.json` — single-key JSON: `{"assistant":"on"|"off"}`.
Default when absent: `"off"`.

SessionStart primer reads this file and announces state every session:
- ON  → `ASSISTANT MODE: ON — brief the chief; you interrogate + compact`
- OFF → `ASSISTANT MODE: OFF — copilot off; direct execution, no dispatches`

**Ship default is ON** (locked decision), but the FIRST supervised goal runs while Rutvik
watches. State was SEEDED `off` at build time; the supervised-goal step flips it on.

## Sub-commands

### `/assistants on`

1. Write `{"assistant":"on"}` atomically to `~/.claude/delegation/assistant-state.json`:
   - Write to a temp file `assistant-state.json.tmp` in the same directory first.
   - Rename (move) the tmp file over the target — atomic on all supported OSes.
2. Print: `ASSISTANT MODE: ON — brief the chief; you interrogate + compact`

### `/assistants off`

1. Write `{"assistant":"off"}` atomically (same tmp+rename pattern).
2. Print: `ASSISTANT MODE: OFF — copilot off; direct execution, no dispatches`

**Note**: Only Rutvik confirms the off. Never auto-off based on failure count — Claude
REPORTS to Rutvik with evidence + recommendation; Rutvik confirms the flip.

### `/assistants status`

1. Read `~/.claude/delegation/assistant-state.json`.
   - If absent, treat as `{"assistant":"off"}`.
2. Parse the `assistant` key and print: `ASSISTANT MODE: <ON|OFF>`

## When assistant mode is ON

- Claude's brief → chief of staff (via `~/.copilot/agents/chief.agent.md`).
- Chief decomposes → tickets → routes per `~/.claude/delegation/routing-policy.json`.
- Claude interrogates at every hop (pre-writes trap questions BEFORE reading each return).
- Never auto-off on failure — flag, dig, report.

## When assistant mode is OFF (2026-07-16 semantic)

- COPILOT LAYER OFF: no copilot dispatches of any kind — no worker tickets, no reviewers, no chief.
- Claude executes deliverables itself: pipeline identities for spec/page-object work, skills as
  usual, Claude subagents where genuinely needed (each spawn prompt must carry
  `[UA-SPAWN-JUSTIFIED: <reason>]` while the spawn guard is active) — zero copilot dispatches of
  any kind.
- Delegation-stack state (ledger, scorecard, routing-policy) is left untouched — the stack is
  dormant, not dismantled; flipping back ON resumes CEO-delegator mode unchanged.

## Never-delegate list (applies regardless of switch state)

Talking to Rutvik · final accept/reject per goal · protected-file writes under grant ·
publishing (push/Jira-write/deploy) · this switch + grants + secrecy control plane ·
auto-memory writes · Chrome-MCP visual checks · innovation-class core thinking.
