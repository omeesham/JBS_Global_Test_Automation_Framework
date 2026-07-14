---
**Status**: PENDING (read-only fight → design doc. ZERO code CUD. Nothing builds/implements until Rutvik's separate go.)
**Priority**: P1
**Created**: 2026-07-13
**Identity**: OWNER
**Model**: claude-opus-4-8
**Thinking**: max
**Justification**: A cross-family fight (opus vs gpt) DESIGNS an inter-session communication + control-plane architecture. Claude referees + synthesizes; it authors none of the design. Read-only — no code touched. Max effort: multi-facet design with a load-bearing platform-approval constraint to reason around.
**PermissionMode**: read-only (all fight workers dispatched read-mode / `--task`: write + shell denied at the wrapper → structurally cannot CUD)
**BrowserTool**: none
---

# PLAN_FIGHTINNOVATION_INTER_SESSION_ASSISTANT (simple fight plan)

## What this is (one line)
Run a read-only opus-vs-gpt **fight** to design (a) parallel Claude sessions that sense + communicate when relevant, and (b) ONE `/assistant` control-plane session = "Rutvik's assistant" = single API to all sessions — output is a **design doc**, nothing gets built here.

## Scope guard (Rutvik, 2026-07-13)
- **ZERO code CUD.** Every fight worker ran read-only (write+shell denied). They read + reason + return a proposal. Claude (referee) writes only the design doc + this plan — never code, never the system.
- **Do not overengineer.** The brief was explicit: "understand the vision vs what exists and make sure the vision is achieved." Simplest system that meets the vision; V1 (autonomous peer awareness) is the overengineering-prone half and is BOUNDED on purpose.
- **Nothing implements** until a SEPARATE explicit Rutvik "go" (+ grants for any protected/hook files). This plan ends at "design chosen", not "built".
- **M-series stays the priority.** This is a parked super-plan; it does not compete with the parity injection work.

## The vision (Rutvik, verbatim intent)
Parallel Claude Code sessions on one machine should be **aware of each other and able to communicate** — efficiently, on-demand, while staying their own autonomous session agents. Two halves:
- **V1 — peer awareness/help**: a session senses when another ongoing session's work is relevant (could help it / it could help them) and reaches out — WITHOUT the human copy-pasting between sessions. Only when it genuinely matters. *(overengineering-prone — bounded.)*
- **V2 — the control plane (MAIN goal)**: ONE session, invoked via `/assistant`, whose ONLY job is to be **Rutvik's assistant** — the single API between Rutvik and every other session. He chats with it; it answers "what's up with task 1", surfaces "session 2 is asking you X", and routes his decisions/approvals/reviews/interrogations back — so he never enters another session to steer. "One session that controls all sessions."

## The blunt verdict (need? slop? innovative? feasible?)
- **Not slop.** Real, named friction (hand-carrying context between windows; no single place to answer sessions' questions).
- **V2 is the strong, feasible half — buildable today** on the existing session-management MCP + a thin disk bus. This is the main goal and it lands.
- **V1 is real but BOUNDED by a platform reality**: the platform **deliberately gates** cross-session read (`list_events`) and write (`send_message`) behind a **per-call human approval**, and forbids messaging-as-silent-orchestration. Fully-automatic no-human peer chatter is **not** achievable via MCP by design. The design embraces that.
- **Innovative within its lane** — composes an underused MCP surface + a file bus + one skill; the innovation is the topology (hub-star, no peer mesh) and stratification by approval cost.
- **Worthy of a super-plan: YES.**

## The chosen design (full synthesis → verdict.md)
Canonical design: **`.claude/state/fightinnovation/session-comms/verdict.md`** (referee synthesis; graft of Design A skeleton + Design B durability). Three layers:
1. **Disk status/ask bus** (user-profile, keyed by repo — `%USERPROFILE%\.claude\session-bus\<repo-key>\`) — every session publishes tiny JSON at bounded triggers; any session + the hub READ with **zero approval prompts**. This is the ambient-awareness channel MCP can't be.
2. **`/assistant` hub session (singular)** — Rutvik's single pane; aggregates the bus, surfaces asks, routes his answers. Star topology — sessions never message each other directly. Distinct from the existing plural `/assistants` chief-of-staff skill (verified non-colliding: separate skill path + state path + scope).
3. **Session-management MCP** — reserved for *deliberate* actions only (`send_message` urgent wake-up, `list_events` deep read); their approval prompts are kept as the C9 transparency gate. `list_sessions` / `search_session_transcripts` are approval-free (roster + investigation).

**Crux resolution**: disk bus for awareness (no approval) · hub-star for control · MCP only for approved deliberate read/write. Both fighters, in BOTH referee passes, rejected pure-MCP (approval friction) and pure-peer-mesh (N² chatter). MCP messages are hints that trigger a disk read — never the state itself.

## FIGHT OUTCOME (2026-07-13) — design chosen
- **Rounds run**: ring → opening (both, blind, read-only) → refutation (each attacks the other) → cross-family codebase verification → completeness. TWO independent referee passes (opus-led + gpt-led) reached the SAME crux resolution — strong convergence.
- **Winner = graft**: Design A (opus) skeleton — hub command surface, `status.json` schema, `merge_result`, T1/T5 hook lifecycle. Design B (gpt) grafts — per-message `asks/replies/notices/` files (not a single mutable `inbox.json` — concurrency trap), `interests.json` relevance layer (topics/selectors/error-signatures), append-only `events.jsonl` audit trail (C9), user-profile bus location (worktree-safe), inbox-first render on every `/assistant` command (C2).
- **5 facets all covered** (Guard A held): hub session · messaging substrate · trigger discipline · awareness/status model · fit+safety. **Guard B completeness** produced 6 open questions (below), none silently dropped.

## Deferred execution (what building it WOULD look like — do NOT start without a separate go)
> Build order: **prove the 6 open questions live → V2 (control plane) → V1 (bounded peer awareness)**. V2 is the main goal; V1 is a thin add-on on the same bus.

- **Phase P — prove-outs (LR-059, gates everything).** Live-probe all 6 open questions before any code. A 2–3 real-session pilot must pass all before V1 is trusted.
- **Phase V2.1 — the disk bus.** **V2-minimal set = `status.json` + `asks/` + `replies/` ONLY** (that is all the control plane needs — do NOT over-build). `interests.json` + `notices/` are V1 (peer awareness); `events.jsonl` is the C9 audit trail — add each only when its phase lands, not up front. Bus root `session-bus/<repo-key>/<session-id>/`. Atomic tmp-write+rename. SessionStart hook writes initial status (T1); Stop hook writes final + orphan-sweep (T5).
- **Phase V2.2 — the `/assistant` hub skill (singular).** Sub-commands `status | inbox | answer <ask-id> <decision> | query <session> | send <session> <directive> | merges`; inbox-first render; `/hub` alias. Reads bus (free) + `list_sessions`/`search_session_transcripts` (free); `list_events`/`send_message` only on explicit Rutvik-directed actions (approved).
- **Phase V1 — bounded peer awareness.** Behavioral triggers T2 (phase-complete), T3 (blocked → write ask), T4 (shared-resource-touch), T6 (evidence-overlap), T7 (pre-merge) in the worker-side skill; peers READ the bus at T1/T4 only; help flows as `notices/`, never as direct commands. No polling storm, no mesh.
- **Phase S — Task-2 seam.** On a gated-merge PARK, session writes `merge_result` → hub surfaces it. Bus lives OUTSIDE worktrees so all sessions across all worktrees share one bus. Merge mechanics stay owned by `PLAN_FIGHTINNOVATION_CLASH_FREE_PARALLELISM`.

## Open questions to resolve FIRST (Guard-B completeness — prove before build, LR-059)
- **OQ-C1 — session-id inside hooks** (blocker): can a hook read the Claude Code session ID to key the bus dir? Fallback: mint a UUID/slug at SessionStart, persist for later hooks.
- **OQ-C2 — `send_message` interrupt semantics**: interrupt-now vs queue-until-tool-completes? Decides whether "urgent unblock" is synchronous.
- **OQ-C3 — Stop-hook reliability on crash/SIGTERM**: if it doesn't always fire, orphan-sweep (TTL/heartbeat) must be robust (shares Task-2 sweep).
- **OQ-C4 — blocked-session latency vs approval cost**: disk-truth + MCP wake-up for blocked/approval asks + exponential-backoff poll fallback.
- **OQ-C5 — `<repo-key>` derivation**: stable across worktrees/clones of one repo, distinct across repos (hash of primary remote or main-worktree path).
- **OQ-C6 — existing `.claude/channel/` (broadcast/ + inbox/)**: reuse/extend vs keep the session-bus separate. Verified present; not yet reconciled.

## Sibling awareness (do not re-solve)
- **Task 2 — clash-free parallelism** (`plans/pending/PLAN_FIGHTINNOVATION_CLASH_FREE_PARALLELISM.md` + `.claude/state/fightinnovation/clash-isolation/verdict.md`) designs the DISK isolation + gated merge. THIS plan is the COMMUNICATION/CONTROL layer over those isolated sessions. Note the merge-surfacing seam; do not redesign the merge.
- **Copilot-worker fleet** (`.claude/skills/ultra-agents/worker-ext.md`) = intra-session Claude→worker delegation. THIS is inter-SESSION (peer Claude Code sessions). Distinct.

## Acceptance criteria (for THIS fight plan — all met)
- [x] Read-only fight run (opus vs gpt), zero code CUD.
- [x] Both fighters covered all 5 facets + C1–C9 (Guard A + Guard B held).
- [x] Crux resolved (disk-bus + hub-star + approved-MCP) with a cross-family convergence check.
- [x] Design doc synthesized at `.claude/state/fightinnovation/session-comms/verdict.md`.
- [x] Super-plan saved (this file), execution deferred to a separate Rutvik go.
- [ ] **(deferred)** Implementation — gated on Rutvik's explicit "go" + the 6 open-question prove-outs.

## Handoff
Fight complete; design chosen; nothing built. When Rutvik says go: start at Phase P (prove the 6 OQs live), then V2, then V1. This plan stays PENDING until then.
