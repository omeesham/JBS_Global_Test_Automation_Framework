# VERDICT — Inter-Session Communication + Rutvik's-Assistant Control Plane

**Referee**: Claude (OWNER). Synthesis only — the design below is grafted from the two fighters
(opus-4.6 = Design A, gpt-5.5 = Design B); the referee authored none of the mechanism.
**Rounds run**: ring → opening (both, blind) → refutation (both attack) → cross-family codebase
verification → completeness. Two independent referee passes (opus-led + gpt-led) reached the
**same** crux resolution — strong convergence.
**Status**: DESIGN CHOSEN. Zero code built. Folds into `plans/pending/` super-plan. Nothing ships
until a separate Rutvik "go."

---

## 1. The blunt verdict on the vision (asked for: need? slop? innovative? feasible?)

- **Not slop.** The pain is real and named: parallel sessions today require Rutvik to hand-carry
  context between windows, and he has no single place to answer their questions. The vision fixes a
  concrete friction, not a hypothetical one.
- **V2 (the control plane) is the strong, feasible half.** "One session = Rutvik's assistant = the
  single API to all sessions" is buildable **today** on the existing session-management MCP
  (`list_sessions`, `get_session`, `search_session_transcripts`, `list_events`, `send_message`) plus
  a thin disk bus. This is the main goal and it lands.
- **V1 (autonomous peer awareness) is real but overengineering-prone — and it is BOUNDED, not
  unbounded.** The honest ceiling: the platform **deliberately gates** cross-session read
  (`list_events`) and write (`send_message`) behind a **per-call human approval**, and forbids using
  messaging to silently orchestrate background work. So fully-automatic, no-human peer chatter is
  **not** achievable through MCP by design. The design embraces that: ambient awareness moves to an
  approval-free disk bus; deliberate handoffs keep the approval as the safety gate.
- **Innovative within its lane**: not a new protocol — it composes an existing-but-underused MCP
  surface with a lightweight file bus and a single control-plane skill. The innovation is the
  *topology* (hub-star, no peer mesh) and the *stratification by approval cost*, not new infra.

**Worthy of a super-plan: YES.** Build V2 first; ship V1 as a thin, bounded add-on.

---

## 2. Chosen architecture (grafted winner)

**Three layers. Disk is the source of truth; MCP is an accelerator, never state.**

1. **Disk status/ask bus** — every session publishes tiny JSON at bounded trigger points; any
   session (and the hub) READS it with **zero approval prompts**. This is the ambient-awareness
   channel MCP cannot be.
2. **`/assistant` hub session (singular)** — Rutvik's single pane. Aggregates the bus, surfaces asks,
   routes his answers back. A star topology: sessions never message each other directly.
3. **Session-management MCP** — reserved for *deliberate* actions only: `send_message` (urgent
   wake-up / directive) and `list_events` (deep transcript read). Their built-in approval prompts are
   kept as the C9 transparency gate. `list_sessions` / `search_session_transcripts` are
   approval-free and used for roster + investigation.

### Where it lands on the central crux
> **Disk bus for awareness (no approval) · hub-star for control · MCP only for approved deliberate
> read/write.** Both fighters, in both referee passes, rejected pure-MCP (approval friction at fleet
> scale — quantified at up to ~125 prompts/session-lifecycle) and pure-peer-mesh (N² chatter, hidden
> coordination). MCP messages are **hints that trigger a disk read**, never the state itself.

---

## 3. The five facets — resolved

### Facet 1 — the `/assistant` hub (Design A's command surface + Design B's durability)
- New **singular** skill `.claude/skills/assistant/SKILL.md`, state under the user-profile bus root
  (below). Explicitly distinct from the existing **plural** `/assistants` chief-of-staff skill
  (`.claude/skills/assistants/SKILL.md`, state `~/.claude/delegation/assistant-state.json`) — verified
  to exist; the two are orthogonal layers and can both be active. Add `/hub` alias to kill the
  one-char-typo risk.
- Sub-commands (from Design A, sharpened by Design B): `status` (fleet roster), `inbox`
  (pending asks), `answer <ask-id> <decision>`, `query <session>` (deep read via `list_events`,
  approved), `send <session> <directive>` (via `send_message`, approved), `merges` (Task-2 park/
  conflict surfacing).
- **C2 enforcement (Design B refutation win)**: every `/assistant` command **renders the inbox/
  dashboard first** — surfacing pending asks is generated command behavior, not optional discipline.

### Facet 2 — messaging substrate (adds ONE thing: the disk bus)
- Zero new MCP tools. The only new infra is a directory of JSON files.
- **Bus location (Design B refutation win)**: user-profile, keyed by repo, NOT repo-local. A
  repo-local bus forks across git worktrees — the exact Task-2 isolation problem. Default:
  `%USERPROFILE%\.claude\session-bus\<repo-key>\` with `/assistant status --path` surfacing the
  resolved path. Env override for advanced cases only.

### Facet 3 — trigger discipline (bounded events; C3/C7)
- Five structural/behavioral triggers (Design A) **plus** Design B's two additions:
  T1 session-start (hook), T2 phase-complete (behavioral), T3 blocked (behavioral),
  T4 shared-resource-touch (behavioral), T5 session-end (hook), **T6 evidence-overlap**,
  **T7 pre-merge / pre-PR**. No ambient polling; no free-form chatter.
- T1/T5 are hook-enforced; T2/T3/T4/T6/T7 are prompt obligations in the worker-side skill. Honest
  weakness: behavioral triggers depend on model discipline (both fighters concede this).

### Facet 4 — awareness/status model (C4/C5)
- Per-session `status.json` (Design A schema: `phase`, `plan`, `step`, `active_files`,
  `planned_touch`, `files_modified`, `blocked`, `merge_result`, `worktree`) — atomic **tmp-write +
  rename**. Cap ~2 KB (Design B): max ~10 paths/selectors, compressed `shared_resources`.
- **Relevance layer (Design B refutation win)**: add `interests.json` — bounded relevance keys
  (topics, paths, ticket/module, **selectors**, **error-signatures**, shared_resources). `files_active`
  alone is too weak to answer "who knows X?".
- **Ask/reply channel (Design B refutation win)**: per-message files in `asks/`, `replies/`,
  `notices/` — NOT a single mutable `inbox.json` (that is a lost-update/concurrency trap under
  parallel writes on Windows). Per-file gives durable, inspectable history and safe concurrency.
- Cost: ~2.5 KB disk I/O per bus scan, zero MCP calls for ambient awareness, no polling daemon,
  no N² links.

### Facet 5 — fit + safety (C8/C9)
- **`/assistants` non-collision**: proven distinct (skill path, state path, scope). See Facet 1.
- **Task-2 seam**: the bus lives OUTSIDE any worktree (user-profile), so all sessions across all
  worktrees read one bus. On a gated-merge PARK, the session writes `merge_result` → hub surfaces it.
  The bus coordinates *awareness*; Task-2 owns the *merge mechanics*. Complementary, not competing.
- **Append-only audit (Design B refutation win, C9)**: a stateless dashboard loses history
  (overwritten status, answered-then-deleted asks). Add an immutable `events.jsonl` recording status
  changes, asks, answers, MCP wake-ups, cleanup, session-end — so "what happened?" is always
  answerable and `cat`-able.
- **No silent control**: hub coordinates, never puppets. `send_message`/`list_events` keep their
  approval prompts. `/assistant send` is a *directive with approval*, explicitly distinguished from an
  *answer* (disk write) — the answer/suggestion/command distinction is a first-class policy, not blur.

---

## 4. Fighter scorecard (referee)

| Facet / C-rubric | Winner | Grafted from loser |
|---|---|---|
| Hub command surface, status schema, `merge_result`, hook lifecycle (T1/T5) | **Design A (opus)** | — |
| Ask/reply as per-message files (not single inbox.json) | **Design B (gpt)** | — |
| `interests.json` relevance layer (topics/selectors/error-sigs) | **Design B (gpt)** | — |
| Append-only `events.jsonl` audit trail (C9) | **Design B (gpt)** | — |
| Bus location = user-profile keyed-by-repo (worktree-safe) | **Design B (gpt)** | — |
| Inbox-first render on every `/assistant` command (C2) | **Design B (gpt)** | — |
| Reject pure-MCP + reject peer-mesh (crux) | **Tie — both** | — |

Design A is the cleaner skeleton; Design B is stronger on concurrency, relevance, transparency, and
worktree-fit. The winning design = **A's skeleton + B's durability grafts**.

---

## 5. Guard-B completeness — what BOTH under-covered (→ open questions, not dropped)

- **OQ-C1 — session-id availability inside hooks (LR-059 blocker).** T1/T5 need the current
  session's ID to write `session-bus/<repo-key>/<session-id>/`. Whether a hook script can read the
  Claude Code session ID (env var / metadata) is **unverified**. Fallback: mint a UUID/slug at
  SessionStart and persist it where later hooks read it. **Must prove before build.**
- **OQ-C2 — `send_message` interrupt semantics.** Does it interrupt a running session immediately,
  or queue until the current tool call finishes? Determines whether "urgent unblock" is truly
  synchronous. **Must probe live.**
- **OQ-C3 — Stop-hook reliability on crash/SIGTERM.** If Stop doesn't fire on every exit, the
  orphan-sweep (TTL/heartbeat) must be robust on Windows. Shares Task-2's orphan-sweep design.
- **OQ-C4 — blocked-session latency vs cost.** Disk-only unblock can stall a blocked session up to
  one poll interval; MCP wake-up fixes it but costs an approval. Resolution direction (both agreed):
  disk is truth, send an MCP wake-up for blocked/approval asks when available, exponential-backoff
  poll as fallback.
- **OQ-C5 — repo-key derivation.** `<repo-key>` must be stable across worktrees/clones of the same
  repo but distinct across different repos. Needs a concrete rule (e.g. hash of the primary remote
  or the main-worktree path).
- **OQ-C6 — existing `.claude/channel/` (broadcast/ + inbox/).** A channel dir already exists for
  colleague/Rutvik comms. The design must decide: reuse/extend it or keep the session-bus separate.
  Verified present; not yet reconciled.

---

## 6. LR-059 proof obligations (before any "works" claim)
Nothing here is "verified" until driven live: (1) session-id-in-hook probe, (2) `~/.claude/`
write perms on this Windows box (known-good — `~/.claude/delegation/` already used), (3) Stop-hook
fires on crash, (4) `send_message` interrupt behavior, (5) concurrent writes to different bus subdirs
are non-interfering on NTFS. A pilot with 2–3 real sessions must pass all five before V1 is trusted.

---

## 7. Bottom line
Build **V2 (the `/assistant` control plane)** on disk-bus + hub-star + approved-MCP — it is the
main goal, feasible now, and the single-pane vision is fully met. Ship **V1 (peer awareness)** as a
thin, five/seven-trigger, hub-mediated add-on — bounded exactly so it never becomes a message
firehose. The platform's approval gates are treated as a safety **asset**, not fought. Prove the six
open questions live before writing code.
