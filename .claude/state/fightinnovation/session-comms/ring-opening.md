# FIGHT — Inter-Session Communication + Rutvik's-Assistant Control Plane

## READ-ONLY, ZERO CUD
Do NOT write/edit/delete any file or run mutating shell. Read + reason. Return your proposal as your result text ONLY. This fight PLANS a design; nothing is built here.

## The vision (Rutvik, verbatim intent — do not water it down, do not overengineer it)
Parallel Claude Code sessions on one machine should be **aware of each other and able to communicate** — efficiently, on-demand, while staying their own autonomous session agents. Two halves:
- **V1 — peer awareness/help**: a session can *sense* when another ongoing session's work is relevant to its own (could help it, or it could help them) and reach out — WITHOUT the human copy-pasting between sessions. Not always-on; only when it genuinely matters. **This is the overengineering-prone half — bound it.**
- **V2 — the control plane (the MAIN goal)**: ONE session, invoked via an `/assistant` skill, whose ONLY job is to be **Rutvik's assistant** — the single API between Rutvik and every other session. He chats with it; it answers "what's up with task 1", surfaces "session 2 is asking you X", and routes his decisions/approvals/reviews/interrogations back — so he never has to enter another session to steer the fleet. "One session that controls all sessions."

## THE REAL SUBSTRATE (ground your design in THIS — it already exists in Claude Code; verified from the live tool schemas)
A session-management capability set is ALREADY present to Claude sessions:
- `list_sessions` — list the user's other sessions (title, branch, PR, last activity, model, worktree). Current session excluded.
- `get_session` — full metadata for one session (model, worktree/branch, remote flag, scheduled-task linkage, agent).
- `list_events` — read another session's recent transcript (its actual turns + tool calls). **⚠ ALWAYS prompts the user for approval** (it returns conversation content).
- `search_session_transcripts` — full-text search across all other sessions' transcripts (one hit + snippet per session).
- `send_message` — deliver a message to another session; it arrives there as a user turn "From {sender title}" with a link back. **⚠ ALWAYS prompts the user for confirmation. Explicitly "not to orchestrate background work."**

**The load-bearing consequence you MUST design around**: the platform **deliberately gates cross-session READ (`list_events`) and WRITE (`send_message`) behind a per-call human approval**, and forbids using messaging to silently orchestrate background work. So a purely-MCP design CANNOT deliver frictionless autonomous peer chatter — every hop asks Rutvik. This is a SAFETY feature, not a bug. Your design must either (a) embrace the approval as the human-in-loop guardrail, or (b) move *ambient awareness* to a channel that doesn't need per-call approval (e.g., sessions writing lightweight status to a shared file bus that any session can READ freely), reserving approved `send_message` for deliberate handoffs. **The central crux of this fight is exactly that fork.**

## The rubric (the design MUST satisfy ALL — this is how the fight is scored)
- **C1** ONE control-plane session = single pane of glass: Rutvik never enters another session to make a decision/approval/review/interrogation.
- **C2** The hub answers "what's up with session N" AND surfaces "session N is asking you X" AND routes Rutvik's answer back to N.
- **C3** Communication is on-demand, triggered by BOUNDED events (blocked / about-to-touch-a-shared-resource / hub-query / explicit ask) — never free-form "chat whenever it feels like it" chatter.
- **C4** A session can sense when another's work is relevant and get/give help WITHOUT human copy-paste — within the platform's approval reality above.
- **C5** Efficient: minimal token/context overhead; no N² peer links, no polling storms, no awareness loops. Cost is a first-class constraint.
- **C6** Sessions stay their own autonomous agents — the hub COORDINATES, it does not puppet or block them.
- **C7** Do-NOT-overengineer: the simplest mechanism that achieves the vision; the autonomous-peer half (V1) MUST be explicitly bounded (status-publish + pull-on-event, not a message firehose).
- **C8** Fits reality: Windows + Claude Code sessions + the EXISTING session-MCP above + the copilot-worker fleet; and MUST NOT collide with the existing `/assistants` mode (Claude's chief-of-staff — a DIFFERENT thing from Rutvik's-assistant `/assistant`). Read `.claude/skills/ultra-agents/worker-ext.md` § "Assistant mode" to see what you must not clash with.
- **C9** Safe + transparent: Rutvik can see everything flowing between sessions; no silent cross-session actions; the hub cannot take irreversible action on his behalf without surfacing it. (The MCP's built-in approval prompts are an asset here.)

## Sibling awareness (design AWARE of these, do not re-solve them)
- **Task 2 (clash-free parallelism)** already designs DISK isolation + gated merge for parallel sessions: `.claude/state/fightinnovation/clash-isolation/verdict.md`. THIS fight is the COMMUNICATION/CONTROL layer over those isolated sessions — and the hub is the natural place a merge-conflict or a merge-approval surfaces to Rutvik. Note the seam; do not redesign the merge.
- **The copilot-worker fleet** (`.claude/skills/ultra-agents/worker-ext.md`) = Claude→ephemeral workers. That is intra-session delegation. THIS is inter-SESSION (peer Claude Code sessions). Keep them distinct.

## Seed hypotheses (priors to test/reject — NOT the answer)
- **H1 — MCP-native hub**: `/assistant` session uses list_sessions + list_events + search + send_message; every cross-session read/message rides the built-in approval prompt (Rutvik is present in the hub chat, so approving is cheap). Zero new infra. Risk: not "automatic"; approval friction if the fleet is large.
- **H2 — disk status-bus**: each session writes a small `status.json` (what I'm doing, files I own, am-I-blocked, open-ask) to a shared dir any session can READ without approval; the hub aggregates the bus into one view; deliberate handoffs still go through approved send_message. Delivers frictionless ambient awareness (C4/C5); the approval stays only on real messages. Risk: staleness, write-coordination with task-2 worktrees.
- **H3 — hub-mediated star (no peer-to-peer)**: sessions never talk to each other directly; ALL awareness + handoff routes through the `/assistant` hub (a star, not a mesh). Kills N² chatter (C5), makes C1/C2 the same mechanism. Risk: hub as bottleneck/SPOF.
- **H4 — event-triggered pull**: a session only consults the bus/hub at bounded trigger points (about to touch a shared file per task-2 ownership, blocked ≥T, or hub-poked). Defines C3's "sense the need" as concrete events, not vibes.
- The crux to resolve: **ambient-awareness channel (disk bus, no approval) vs deliberate-handoff channel (MCP send_message, approved)** — and whether peer links exist at all or everything is hub-star.

## The two guards Rutvik demanded
### Guard A — don't overload one agent (split the scope)
Facets, each covered explicitly so no agent drowns:
1. The `/assistant` hub session (Rutvik's single pane — aggregate view, ask-inbox, approval/answer routing).
2. Inter-session messaging substrate (what the existing MCP gives vs the minimal addition needed).
3. Trigger discipline (the bounded events that make a session "sense the need" — C3/C7).
4. Awareness/status model (how sessions know what others are doing, efficiently — C4/C5).
5. Fit + safety (existing MCP approval reality, `/assistants` non-collision, task-2 seam, transparency — C8/C9).
Each fighter may use ≤3 sub-agents to parallelize facets, OR Claude issues multiple scoped dispatches. No one agent carries all 5 alone.

### Guard B — don't fight over 80% and drop the 20%
Every proposal MUST address all 5 facets + all C1–C9. After the fight, a completeness pass asks: "what did BOTH gloss over — which facet/requirement got no real attention because everyone argued about the disk-bus-vs-MCP fork?" Overlooked items become explicit open questions in the design doc, never silently dropped.

## The rounds
0. **Ring (Claude, referee)** — this document.
1. **Opening (parallel, blind, read-only)** — opus-4.6 proposes design A; gpt-5.5 proposes design B. Each covers all 5 facets + C1–C9 + own weaknesses, grounded in the real substrate above.
2. **Fight (read-only)** — each refutes the other vs the rubric + defends/upgrades.
3. **Completeness pass** — Guard-B check.
4. **Judgment (Claude, referee)** — score vs C1–C9, synthesize the winning design (may graft best of both + completeness findings), record the loser's surviving points. Claude authors ZERO of the design — referee only.
5. **Output** — design doc → `.claude/state/fightinnovation/session-comms/verdict.md`, then folded into a `plans/pending/` super-plan. ZERO CUD; nothing builds until a separate Rutvik go.

## Fighters
opus-4.6 (T3) vs gpt-5.5 (T4) — opposite families, the whole point.

## OUTPUT (each fighter)
1. **Design** — the hub + substrate + trigger + awareness + safety, covering all 5 facets + C1–C9.
2. **Where it lands on the crux** — MCP-native vs disk-bus vs hub-star; defend against the platform's approval reality.
3. **Own weaknesses** — the R's you under-deliver and why; what you'd need to prove (LR-059).
