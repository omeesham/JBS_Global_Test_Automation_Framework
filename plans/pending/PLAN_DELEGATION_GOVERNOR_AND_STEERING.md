# PLAN_DELEGATION_GOVERNOR_AND_STEERING — context governor (die-or-force-compact) + cascading steering downlink

**Status**: PENDING (GATED — every Tier-2 surface is stage-only; Rutvik applies)
**Priority**: P0
**Created**: 2026-07-15
**Identity**: OWNER
**Model**: claude-opus-4-8
**Thinking**: max
**Justification**: Tier-2 enforcement-layer staging + multi-rule judgment (LR-069 gate authoring, LR-020 anchor re-verification, sequencing vs CHEATPROOF/UPLINK) — max-tier per LR-041.
**PermissionMode**: auto
**BrowserTool**: none
**Depends on**: PLAN_DELEGATION_CHEATPROOF.md (acceptance-gate patterns, trap T8) — this plan can land independently; the STEERING_ACK machine-verification check reaches full strength only once the verify-run gate exists.
**Related, no overlap**: PLAN_UPLINK_PROTOCOL.md (uplink = worker→Claude ASK channel; this plan is the mirror DOWNLINK), SUBPLAN_LCD_03_COMPACTION_SURVIVAL.md (Claude-side /compact identity survival — different layer).

---

## Context — owner directives (2026-07-15, verbatim intent)

1. *"we need a hardcore rule, each agent dies at 400k or compacts forcefully on context use, i believe no one is compacting them"*
2. *"we need a feature that allows claude to inject steering points to assistants who do it to workers who do it to subagents they have"*

**Owner decisions (2026-07-15, in-chat)**: breach semantics = kill + machine-digest + respawn-once CONFIRMED (A3 stands as written); sequencing = PLAN_DELEGATION_CHEATPROOF executes FIRST, this plan second, same Opus queue.

Structural constraint (proven 2026-07-14, twice — live hook probe + parity recon rows 4–5): the worker CLI has **no hook mechanism of any kind**. Nothing can be forced *inside* its runtime; all forcing lives at the boundary — the wrapper that spawns it, the dispatch tooling that tickets it, the acceptance gates that judge it. Claude-side agents (this session, chain sessions, Task-tool subagents) are ALREADY governed (harness auto-compaction + `/final-q` context-budget gates at 75–90%) and are **explicitly out of scope** — this plan governs the worker layers only: assistant seats (chiefs), council workers, and their sub-spawned agents.

## Verified inventory (2026-07-15 recon — LR-020: re-verify every line anchor at execute; the wrapper drifts)

- Wrapper `.claude/skills/ultra-agents/copilot-worker.sh`: per-work-type `--timeout` table (:161–171, 600–1800s); `--max-credits` flag → CLI `--max-ai-credits` with `MAX_AI_CREDITS` config fallback, **omitted entirely if unset** (:279–285); session plumbing `--continue`/`--connect` parsed at :51/:58–59, `SESSION_ARGS` built at :276–277, consumed at the CLI invocation (~:431, which also passes `--context long_context`); stall-guard config block (:174+); per-run dir `.claude/state/ua-worker/<run-id>/` with `meta.json` (`secs`, `exit`, `exit_reason`, `stall_warns` — **no token fields**) + `process-*.log` (tool invocations).
- Worker CLI surface (from `help`, verified): `--max-ai-credits <n>` (native per-session budget), `--max-autopilot-continues <n>`, `--resume[=sessionId]`, `--continue`, `--session-id <id>` (can PRE-SET the UUID for a new session), `--share[=path]` (post-session markdown transcript export), subcommands `limits` ("Session Limits Controls") and `billing` ("AI credit usage") — **their exact surfaces did not print via `<cmd> --help`; probe in Phase 0**.
- Per-run logs contain **zero token telemetry** (grepped a fresh run: no `*tokens*` / `context_window` fields).

## The honest 400k translation

The CLI exposes **no token counter** at the boundary. "Dies at 400k" therefore maps to the nearest enforceable set, strongest first: (1) the vendor's own `--max-ai-credits` kill — made MANDATORY (never dispatch uncapped); (2) whatever `limits` exposes if Phase 0 finds a settable context/token cap — then 400k is set literally; (3) calibrated boundary proxies (process-log bytes, tool-call count, wall-time) that the wrapper watchdog kills on. If Rutvik wants a literal token number and (2) fails, the proxy thresholds are calibrated TO the 400k-equivalent from historical run data — recorded in the config, not hand-waved.

## Bootstrap (context files for the executor)

`PLAN_DELEGATION_CHEATPROOF.md` (sibling, patterns) · `.claude/skills/ultra-agents/worker-ext.md` (delegation pyramid) · `.claude/state/ua-worker/assistant-flow/shared-traps.md` (T1–T8) · `~/.claude/delegation/UPLINK_DOCTRINE.md` (mirror-channel doctrine) · `.claude/rules/guardrail-policy.md` (LR-069/LR-070) · memory `feedback_trust_vector_and_zero_burn.md`, `feedback_two_chiefs_always_default.md`.

Delegation shape: 2 cross-family fighters for EVERY build/probe ticket (no exemptions); Claude authors tickets + judges; Tier-2 artifacts are staged to `.claude/state/ua-worker/governor-staging/`, never applied by any agent.

---

## Phase 0 — Probes (NEVER-ASSUME; each = 2-fighter probe tickets, machine evidence only)

- **P0.1 limits/billing surface**: inside a live scripted session, capture what `limits` and `billing` actually expose (settable caps? readable usage?). Deliverable: raw transcript + a one-table summary. If a settable context/token cap exists → Phase 1 uses it as the primary 400k lever.
- **P0.2 headless steer probe**: spawn a trivial run with pre-assigned `--session-id <uuid>`; after it exits, run `copilot --resume=<uuid> -p "reply STEER-ACK only"` headless. PASS = clean exit + answer in transcript. This decides whether hard-steer rides session-resume (context preserved) or falls back to kill+respawn-with-amended-ticket.
- **P0.3 calibration table**: from `ledger.jsonl` + all existing run dirs: per run — secs, process-log bytes, tool-call count, exit_reason. Output: the proxy↔size distribution that sets governor thresholds. (Pure file-reading — Haiku/cheap tier fine, still 2-fighter.)
- **P0.4 sub-spawn path check**: confirm whether chief sub-dispatches go through `copilot-worker.sh` (then caps inherit automatically) or through the CLI-internal `task` tool (then the cap must ride the parent session's own credit ceiling). Evidence: process logs of a real chief run.

## Phase 1 — Context governor (feature A)

- **A1 Mandatory native cap**: wrapper change (Tier-2, staged) — if `MAX_CREDITS` resolves empty, apply a per-work-type default table (values from P0.3) instead of omitting the flag. An uncapped dispatch becomes impossible. If P0.1 found a native context cap, wire it here at the 400k value.
- **A2 Boundary watchdog**: wrapper monitors the live run (log-byte growth + tool-call count + existing stall-guard cadence); breach of calibrated threshold → SIGTERM → `meta.json` gains `exit_reason:"context_governor"` + a `governor` block recording the tripped proxy values. LR-069: **S1, lands in `announce`** (logs "would-kill" only) → `deny` (real kills) after the calibration window shows zero false trips; knob in `~/.claude/delegation/governor-config.json` (Tier-2); fires append to `.claude/state/gate-fires.log`.
- **A3 Forced-compaction equivalent = kill → digest → respawn-once**: on governor kill, dispatcher tooling builds a **machine-authored** CHECKPOINT digest — disk diff of the run dir + tracked-target mtimes, ledger row, tool-call tail from `process-*.log`, `--share` transcript if cheap — worker self-summary prose is NEVER the digest (fabrication lesson). Attempt-2 dispatch = original ticket + digest + "continue from verified state". **Max one respawn**, then the run fails honestly with the digest attached for Claude's judgment.
- **A4 Checkpoint mandate (seat files, Tier-2 staged)**: workers append one-line progress rows to `<run-dir>/CHECKPOINT.log` at each phase boundary; a long run (>P0.3 median) with an empty CHECKPOINT.log = report bounce at acceptance (schema check — prose-level until the verify-run gate lands, machine-checked after).
- **A5 Cascade**: per P0.4 — wrapper-path sub-dispatches inherit A1 automatically; task-tool sub-agents are bounded by the parent session's credit cap (document as residual, weaker bound if that's what P0.4 shows).
- **A6 Dynamic cap + credit-beg channel (owner-requested 2026-07-16, "like corporate")**: two wires on top of A1/A3. (a) **Learned sizing**: A1's per-work-type default table stops being static — a small sizing helper reads the ledger's history per work_type (secs and outcome as primary signals; cost/token fields are future-optional — currently null at worker depth per LCD_07 Execution Summary deviation, apply when available) and recommends the cap at dispatch time (dispatcher may override); cap-death outcomes automatically raise the recommendation, clean under-runs lower it. (b) **Beg-before-death**: probe (Phase 0 add-on) whether the worker can see its own remaining credits (`billing`/`limits` surface); if yes, DUTY_STACK instructs the worker at ~75% burn to write a `CREDIT-REQUEST` checkpoint (landed-vs-missing inventory + credits wanted) instead of dying blind; the wrapper surfaces it, and on dispatcher approval the run resumes via the P0.2 session-resume path (context preserved) with a topped-up cap — A3's digest-respawn stays the fallback when the probe fails or no request was written. 12 cap-deaths on 2026-07-16 alone are the graduating incidents; every one already produced the landed-vs-missing bounce manually — A6 automates exactly that loop.

## Phase 2 — Steering downlink (feature B)

- **B1 Channel**: `<run-dir>/STEERING.md`, append-only numbered entries `S<n> | INFO|ADJUST|STOP | cascade:yes|no | <text>`. Writers: Claude for runs it dispatched; a chief for its sub-runs. Zero-prompt for Claude (dispatch-path action — trust vector).
- **B2 Soft pickup (in-run)**: seat files + wrapper ticket-preamble injection (same splice point as the doctrine block — verify anchor at execute) mandate: check STEERING.md at every phase boundary; every entry is binding; report gains `## STEERING_ACK` (entry IDs + what changed). **Machine verification** (T8 pattern): if STEERING.md mtime predates run end by ≥60s and `process-*.log` shows no read of it → bounce; ACK claims are never taken on prose.
- **B3 Hard steer (STOP/urgent)**: wrapper gains `--steer <run-id> "<text>"`: kills the live process, appends the entry, then (if P0.2 PASSED) `copilot --resume=<session-id> -p` injects the steering as a new turn in the SAME session — context preserved; else respawns with amended ticket + A3 digest. Requires wrapper to pre-assign `--session-id` at spawn and record it in `meta.json` (new field — insert before SESSION_ARGS build at :276, re-verify anchor).
- **B4 Cascade discipline**: `cascade:yes` entries MUST be copied by the chief into every subsequent sub-ticket (SUB-DISPATCHES table gains a STEERING column; acceptance cross-checks the sub-run dirs actually contain the entry). Workers→their own subagents: spawn-time snapshot embedding (subagents are short-lived; no mid-run channel — documented bound, not a gap).
- **B5 Doctrine**: one DOWNLINK section appended to the uplink doctrine file (Tier-2, staged): steering constrains, never labors (mirror of §4 no-labor); budget max 3 steers/run (anti-micromanagement — the ticket should have been better); every STOP steer logged with reason.

## Phase 3 — LR-069 + closure ceremony

Severity S1 (graduating incidents: owner directive 2026-07-15 + the 2026-07-14 fabrication cluster on long uncompacted runs). Announce→deny ramp criteria recorded in governor-config.json; fire telemetry from day one; gate header comments name Sev + incident. Receipt v3 to Rutvik with the **owner-apply checklist** (numbered commands: wrapper patch, seat patches, doctrine append, config install) — the executor never touches `~/.claude/hooks/`, `~/.copilot/agents/`, or the wrapper directly.

## HALT conditions

- P0.2 fails AND P0.1 finds no native cap AND P0.3 shows proxies correlate too weakly to set honest thresholds → HALT, present raw probe evidence.
- Any step requiring a direct write to Tier-2 paths → stage + HALT for owner apply (never self-apply).
- Both fighter seats exhaust 2 bounce cycles on any deliverable → HALT with raw score tables (CHEATPROOF Phase 1 precedent).

## Acceptance criteria

- [ ] Uncapped dispatch is impossible (A1 staged patch shows the default table; test dispatch without config proves the cap is applied).
- [ ] Governor announce-mode log shows ≥1 real run with recorded proxy values; zero false kills during ramp.
- [ ] A3 digest produced on a real governor-killed run (live drill, LR-059 — no simulation), respawn-once observed, second kill fails honestly.
- [ ] STEERING round-trip proven live: entry written mid-run → process log shows the read → report ACKs it (LR-059 real-E2E).
- [ ] Cascade proven: one `cascade:yes` entry appears verbatim in a chief's sub-ticket + sub-run dir.
- [ ] All Tier-2 artifacts staged with sha256 manifest; nothing applied by an agent.

## Adversarial audit record (authored-in, /ultrathink Step 3)

- **Skeptic**: weakest assumptions = headless resume (P0.2) and proxy↔token correlation (P0.3) — both converted to probes with designed fallbacks (kill+respawn; credits-as-primary). Second: `limits`/`billing` help didn't nest — unknown surface, probed not assumed.
- **Scope**: Claude-side agents deliberately excluded (already governed — stated, not silent); task-tool subagent steering bounded to spawn-time snapshot (stated residual); STEERING_ACK machine-check depends on CHEATPROOF's verifier for full strength (stated dependency).
- **Intent drift check**: "dies at 400k" → no token counter exists at this boundary; mapped to native cap + probed literal cap + calibrated proxies with the translation stated to the owner, not silently substituted. "Compacts forcefully" → kill→machine-digest→respawn-once (forced from outside, per harness asymmetry — the agent is never trusted to self-compact). Cascade covers all three hops with per-hop mechanisms.
