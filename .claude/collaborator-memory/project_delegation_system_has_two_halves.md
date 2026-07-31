---
name: project-delegation-system-has-two-halves
description: "The Copilot workforce is only half the system — the half that makes Claude delegate lives in ~/.claude/hooks + user-level settings.json, invisible to the repo"
metadata: 
  node_type: memory
  type: project
  originSessionId: ea127a18-8e6e-4a6d-8fdb-d4c6d11049d9
  modified: 2026-07-29T12:11:57.958Z
---

The delegation system splits across two locations, and only one of them is in the repo.

**Copilot's half (in the repo):** `copilot-worker.sh`, `worker-ext.md`, the agent definitions, the
delegation configs. Clone the repo and you have these.

**Claude's half (NOT in the repo, until 2026-07-29):** 11 hook scripts in `~/.claude/hooks/` wired
through the **user-level** `~/.claude/settings.json` — `delegation-primer.mjs` (the SessionStart
banner that tells Claude it is the CEO), `delegation-gate.mjs`, `delegation-nudge.mjs`,
`ua-worker-guard.mjs`, `labor-gate.mjs`, and six `check-*.mjs`. Plus `envelope.mjs` +
`verify-run.mjs` in `~/.claude/delegation/gates/`, which are what turn a worker's claim of success
into a machine-checked verdict.

**Why this matters:** a colleague who clones the repo gets workers and a rulebook, and a Claude that
keeps doing the work itself. The repo's `.claude/settings.json` has zero delegation wiring — checking
it proves nothing. Always check `~/.claude/settings.json` too.

Shipped 2026-07-29 under `.claude/skills/ultra-agents/setup/hooks/` +
`setup/delegation/gates/` + `setup/settings-hooks.json` (the block to merge, never copy over).

Two traps found while shipping it: the hooks hardcoded one machine's paths (a gate that never fires
still reads as protection), and `copilot-worker.sh` opens `DUTY_STACK.md` while the file on disk was
`duty_stack.md` — a `[ -f ]` test that fails open, so Linux and Mac silently ran with no duty
contract.

Related: [[project-copilot-takeover-system]], [[feedback-copilot-output-untrusted]]
