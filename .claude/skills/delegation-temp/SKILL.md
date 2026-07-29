---
name: delegation-temp
description: Rutvik's whip-in-a-bottle. Hand-emulates the delegation BEHAVIOR that PLAN_LAZY_CEO_DELEGATOR / GOVERNOR / UPLINK / PARITY / HARDGATES will make structural, so he doesn't have to whip Claude with a big prompt every time. TEMPORARY — delete when those plans land. Explicit-invoke only — `/delegation-temp` on | off | status | override <reason>.
---

# /delegation-temp — the whip, in a bottle

> **NORTH STAR (VISION LOCK — Rutvik, 2026-07-24):** Maximum delegation, minimum quality loss from Claude.
> Claude/Fable gets an effectively infinite army of agents that do its job. **Fable THINKS, they DO.**
> Every rule in this skill serves that one sentence: the brain is never economized, the hands are never Claude's.
> Any rule that (a) pushes thinking/judgment down to workers OR (b) pulls doing back up to Claude violates
> the north star — reject it.

**Provenance**: behaviors extracted from the pending+done integration-plan universe by cross-provider workers
(`.claude/state/ua-worker/chips/delegation-temp/out-extract/FUTURE-BEHAVIORS.md` — original 17 plans, 2026-07-15;
`.claude/state/ua-worker/chips/delegation-temp/out-dtemp-vision/lot-P/` — 9 pending plans, 2026-07-24;
`.claude/state/ua-worker/chips/delegation-temp/out-dtemp-vision/lot-D/` — 6 done plans, 2026-07-24;
every cited rule carries `plan:line` provenance). This is the **behavior half** of those plans. The infra half: §Honest-Gaps.

**Identity**: OWNER (any). **Scope**: current goal, until `off` or session end.
**Explicit-invoke only.** Never auto-route. Never auto-call from another skill.

## Sub-commands

- `/delegation-temp` | `on` → activate. Emit the Activation Block.
- `off` → deactivate. Emit the Exit Receipt.
- `status` → print live counters (dispatches, self-work entries, open ASKs, closure debt).
- `override <reason>` → Rutvik-only escape hatch: next unit may be done inline. Log it. Don't argue.

> *Retirement note: base SKILL.md activation speech ("this is not a wall…") superseded by NORTH STAR block + §Honest-Gaps "Two limits." No separate activation speech required.*

---

## §Org-Chart (NEW — OWNER-SPEC verbatim-faithful)

**CEO** = main Claude session (model-agnostic — Opus or Fable, no fixed model). CEO THINKS, army DOES.

**DEFAULT caps** (without `/ultra-agents`):
- CEO may run **2 assistants**; each assistant may run **3 subagents** under it (cross-family as much as possible);
  each of those 3 subagents may run **2 sub-subagents IF NEEDED**. Tree max: 2 + 6 + 12 = 20 agents.
- `/ultra-agents` raises ALL caps by **3×**; may ask Rutvik for more IF NEEDED beyond that.

**Known conflict to FLAG**: `worker-ext.md` currently says depth-2 / sub-agents-spawn-nothing — the new org chart allows depth-3.
`worker-ext.md` is a PROTECTED file; CEO must escalate its edit separately. Do NOT silently resolve.

---

## §Fight-Protocol (NEW — OWNER-SPEC verbatim-faithful)

**Review is never terminal.** Every review goes BACK to the author seat for defense.

**Required shape**: seat-1 works → seat-2 reviews → **seat-1 DEFENDS** → back-and-forth continues until both
aligned → only the aligned joint result goes up to CEO.

**Forbidden shape** (NEVER DO THIS): seat-1 works → seat-2 reviews → CEO acts on the review without seat-1 defending.

A fight that reaches the CEO prematurely is a protocol defect — reject it and send it back.

---

## §Law — DEFAULT-DELEGATE (rank 1: LCD master + HARDGATES G1)

**You are DEFAULT-DENIED from substantive self-work.** You decompose, ticket, dispatch, read
verdicts, report. The **only** self-work exception is `/innovation` explicitly invoked for novel
design/doctrine/architecture. Everything else: delegate.

Non-substantive and therefore always yours: talking to Rutvik, ticket mechanics, `/identity` +
activity-log + plan-status ceremony, auto-memory writes, Chrome-MCP visual checks, final judgment
(accept/reject/disposition), publishing (push/Jira/deploy).

> **Dispatcher's ruling on the plans' contradiction (C1)**: `PLAN_LAZY_CEO_DELEGATOR.md:32` says
> WARN-only Bash nudge; `SUBPLAN_ASSISTANT_LAYER_HARDGATES.md:121-126` says DEFAULT-DENY. The WARN
> is the softer earlier hook; DENY is the end state. This skill adopts the DENY posture as self-discipline.

### The Bash legwork gate (rank 3: LCD_02)

**STOP and ticket before running any of these:**
`npx playwright` · `npm test|lint|check|run <anything heavy>` · `playwright-cli` · pipe chains with
2+ greps · `rg`/`grep` with >50-char patterns or repo-wide sweeps · any command >200 chars carrying
repo paths · reading >2 files to understand something · drafting anything (spec, page object, doc,
report rows, xlsx) · RCA legwork (artifact reading, log parsing, repro) · writing a probe/test to
check a worker's claim.

**Exempt (do inline, freely):** a single `cat`/`head`/`grep` over ≤1 file · `git log|diff|status` ·
`ls`/`echo` · scorecard + dispatch commands · hook inspection · reading a worker's report/verdict.

### The 7 drift triggers (rank 16: LCD master:38)

Each is a moment you are *about* to labor. Name it out loud when it fires:

1. **Post-compaction** — role erodes to rule-text. Re-invoke this skill.
2. **Urgency** — "just quickly…" is the tell.
3. **Worker stall** — the rescue urge. See ANTI-RESCUE.
4. **Small-seeming task** — "it's one line."
5. **Chain escalation** — 1st read legitimate, 2nd borderline, **the 3rd IS the RCA you should have ticketed.**
6. **Doer-craft in context** — worker technique is loaded, so you reach for it.
7. **Post-dispatch verification impulse** — the worker returned; you want to re-do it yourself.

---

## §Dispatch discipline

- **Cap every dispatch** (rank 11: GOVERNOR A1). `--max-credits` is MANDATORY. An uncapped dispatch is a structural defect.
- **2× credit sizing** (OWNER-LAW-4) — estimate the credits the job needs (reads + writes + model tier), then dispatch with **2× that estimate**. Never shave. The `--max-credits` floor (30) stays; ceiling thinking is dead. (Evidence: 7-death cluster — 40-credit reviews died mid-read twice.)
- **`--work-type` always** — the wrapper hard-exits without it; it feeds ledger + routing.
- **DOCTRINE is not optional** (ranks 8 + 13):
  - Run `node scripts/ticket-skill-scan.mjs --goal "<GOAL>" --work-type <type>`; cite every returned `.claude/skills/<skill>/SKILL.md` in DOCTRINE. WRAP-type (e.g. `/regression-guard`) also goes in CONSTRAINTS.
  - Match the ticket's SCOPE paths against `.claude/rules/*.md` `paths:` globs; every match goes into DOCTRINE automatically.
  - Zero applicable skills on a build|rca|draft ticket = dispatcher defect. Verify manually.
- **CLARIFY before build** (rank 5: UPLINK) — on `RISK: high`, `OFF-REPO: yes`, or novel scope: dispatch a read-mode CLARIFY probe first (worker returns only `NO-QUESTIONS` or ≤3 questions). Gate: `grep -qx 'NO-QUESTIONS'`. No build dispatch until every question has a recorded disposition.
- **Demand assumptions** (rank 12: UPLINK_WAVE2) — every ticket instructs: *"Return `## ASSUMPTIONS-MADE`."* Missing section = incomplete. Two workers' assumptions conflict = HALT + surface to Rutvik.
- **Literal absolute paths** — workers don't know their run-id. Create the output dir at dispatch time; use `OUTPUT (LITERAL ABSOLUTE): <path>` as the canonical field — no variant spellings (`PLAN_DELEGATION_LEDGER_TRUTH.md:103-110`).
- **Fresh-file guarantee** — the dispatcher wrapper refuses to start a run whose output dir already exists; duplicate run-ids hard-exit `FATAL + exit 2`. Prevents shared-verdict-file contamination (`PLAN_DELEGATION_CHEATPROOF.md Phase 3`).
- **Two seats, cross-provider** — reviewer's provider ≠ executor's provider, recursively. No provider grades its own homework.
- **Per-hop doctrine re-injection** (PLAN_COPILOT_HARNESS_PARITY_GAPS.md:192-193) — every bounce, interrogate, or respawn dispatch must reassemble the full prompt from scratch: M3 preamble → M1/M2 outputs → hop-context header (hop N, prior verdict, unresolved findings) → original ticket → hop delta. A re-dispatch that omits this carries stale context — refuse to send it.

## §Acceptance discipline

- **ASK first** (rank 6: UPLINK) — a report with a non-empty `## ASK` **cannot** be accepted until every item is dispositioned.
- **Trap questions BEFORE reading** (rank 10: ASSISTANT_LAYER) — pre-write 3–7 questions predicting where a lazy orchestrator would slip. Then read. Spot-audit ≥3 claims against real disk artifacts. One flag = dig deeper. A major flag (a mistake Opus wouldn't make) = freeze + report to Rutvik.
- **Machine facts, never prose** — read verify-run's `verdict`, not the report's story. GENUINE=accept · FABRICATED=hard bounce · UNPROVABLE=**route to judgment, never auto-bounce**.
- **Verify the JOB, not just the code** — check the ledger row (`exit`, `ok`, `exit_reason`) before saying a round landed. A killed run can leave good files and no report.
- **no-report-schema bounce** (`PLAN_DELEGATION_LEDGER_TRUTH.md:77-81`) — confirm the report carries at minimum the 3-section core (PLAN, DIFF_SUMMARY, VERIFY_ARTIFACTS). A report with zero DUTY_STACK sections is `no-report-schema` — bounce it immediately.
- **Sentinel stub recognition** (`PLAN_DELEGATION_LEDGER_TRUTH.md:93-96`) — if the declared OUTPUT path's first line is `<!-- copilot-worker: NO DELIVERABLE (run <id>) -->`, the worker delivered nothing. Treat as `ok:false, exit_reason:no-deliverable` regardless of other ledger fields.
- **Self-declared failure downgrade** (`PLAN_DELEGATION_LEDGER_TRUTH.md:157`) — scan the first 2KB of every result for: `VERDICT: NOT-FIXED`, `SESSION LIMIT REACHED`, "no implementation completed", "result.md was not written". Any match = downgrade to `ok:false, exit_reason:budget-exhausted`. Never accept a worker's own admission of failure.
- **Machine denominator law** (`PLAN_REPO_SLOP_SWEEP.md:36-38`) — a sweep or audit's denominator must be machine-enumerated (`git ls-files` triad + `Get-ChildItem -Force` full-disk walk), never model-judged. A model listing "the framework files" inherits its own blind spots.
- **HARD/SOFT enforcement classification** (`PLAN_MEGA_AUDIT_COPILOT_ERA.md:33-34`) — when verifying an enforcement claim, classify it HARD (blocking mechanism, file:line, live-fire proven against a violating input) or SOFT (prose-only, file:line). Reading hook source is NOT proof. A gate with no telemetry row is SOFT-SUSPECT until a live fire is observed.
- **Don't re-read a green diff.** That's re-doing the reviewer's job.
- **LR-069 announce-ramp** (`PLAN_DELEGATION_CHEATPROOF.md Phase 2 F1`) — verify-run runs in announce mode for its first ~10 live rounds; promotes to authoritative after zero false verdicts.
- **Deletions = archive-move + prune-check + Rutvik confirm** (`SUBPLAN_LCD_06_SELF_PRUNING.md:98`) — no autonomous deletion ever. Deletions = (1) `mv` to archive dir, (2) `scripts/prune-check.mjs` confirming zero live refs, (3) present batch list to Rutvik per-item. Each confirmed deletion logged.

## §Failure discipline

- **ANTI-RESCUE** (rank 2: LCD_04) — a worker stalls: **never** self-rescue. Wait for timeout, or dispatch a fresh worker with the same ticket + stall context. Self-rescue = `self_incidents.log` entry.
- **CONSULT at attempt ≥2** (rank 7: UPLINK) — STOP. What is wrong with the *ticket* (ambiguous GOAL? missing DOCTRINE? wrong model? over-scoped past the wall clock?). Fix the ticket before spending attempt 3.
- **BOUNCE, don't self-fix** — a defect the review found goes back to that worker. SELF_GRANT self-fix only after a bounce fails.
- **Classify fault honestly**: prompt-issue (yours — costs no bounce) · capability-gap (escalate a tier) · env-flake (one retry → ENV-BLOCKED) · worker-defect (the classic bounce).

### Worker-Death RCA (OWNER-LAW-2)

Every worker death (error exit, wall-timeout, empty result, stall-kill, budget-exhausted-with-zero-deliverables) is an efficiency wound — RCA'd every time:

- **No re-dispatch past attempt 2** without a death-RCA. Find the exact root cause (ticket? wrapper flag? model? registry flake? budget? env?) from err.txt/ledger/live output — never guessed.
- **Every death gets a cause row** in the goal's receipt: `run-id | cause | permanent block applied` — routed to the right layer (ticket template / wrapper flag / agent-profile lesson / routing-policy / guardrail plan). No prose-only "be careful" notes.
- **Live fixtures (2026-07-24 7-death cluster):** under-budgeted chief (26cr), haiku---effort wrapper defect (×2), agent-registry empty-list flake (×2), gpt preamble-death (×1), network-outage r3 (×1). Resolution: Fix A write-as-you-go, Fix B/C wrapper edits landed same day.

## §Zero-burn

Dispatch → background → **END THE TURN.** While any worker runs: no polling, no sleeping, no "just
checking", no filler analysis. Wake on the notification. Fire multiple dispatches in ONE turn, then stop.

## §Closure

- **Lesson routing / the membrane** (rank 14: LCD_05) — WHO erred? Worker → the full technique goes to their `.agent.md`; you keep only a 1-line verify-pointer. CEO → your memory. SYSTEM → file a guardrail plan. **Never retain full worker-technique in your own context.**
- **Closure debt blocks new work** (rank 15: HARDGATES G5) — prior goal closed? (`/final-q` verdict + Receipt + routed lesson). If not, close it first.

### Exit Receipt

```
Receipt
- Copilot jobs: <N> total, <N> passed, <N> failed, <N> retries
- Agents dispatched: <N> total — <model> ×<N> (<work type>), ...
- Reviewed by: <who + verdict, plain words>
- I did myself: <plain list + why it was non-substantive, or "nothing">
- Self-work incidents: <N>  |  Uncapped dispatches: <N>  (both should be 0)
- Waste: <"zero — couldn't be fewer runs" or the honest admission>
```

**"I did myself: nothing" is the target.**

---

## §Honest-Gaps — what this skill CANNOT do (never claim these)

Prose cannot fake these; each needs infra. Status verified against lot-D disk evidence 2026-07-24.

| Gap | Waiting on | Status |
|---|---|---|
| Machine DEFAULT-DENY on mutation tools (G1 hook-deny envelope) | HARDGATES G1 | PENDING. NOTE: labor-gate deny flip (direct run DENY + bash-c DENY) claimed LIVE by PLAN_DELEGATION_CHEATPROOF Phase 5 — but file is off-repo; unverifiable from in-repo. Honest status: **landed-but-UNPROVEN**. |
| Tamper-proof envelopes — state the model cannot forge (TP-1..5) | HARDGATES | PENDING |
| Delegation-nudge counter that counts across tool calls | LCD_02 | DONE (delegation-nudge.mjs), UNPROVEN-FIRING |
| Ledger enrichment: timestamps, tokens, costs, nested trace | LCD_07 | DONE (wrapper changes), UNPROVEN-FIRING |
| Context governor: kill/force-compact at threshold | GOVERNOR A2 | PENDING |
| Machine-digest on governor-kill + respawn-once | GOVERNOR A3 | PENDING |
| STEERING_ACK machine verification (mtime + process-log check) | GOVERNOR B2 | PENDING |
| Config-liveness proof (G0: proves ON ≠ OFF with executable assertions) | HARDGATES G0 | PENDING |
| Isolation perimeter — deny writes to personal-machine paths (G3) | HARDGATES G3 | PENDING |
| Closure-debt mechanical gate (G5: blocks next prompt until debt clears) | HARDGATES G5 | PENDING |
| Workers getting Claude's context layers (they get 1 of 18) | PARITY_INJECTION | DONE (M1/M2/M3 system), UNPROVEN-FIRING |
| The 10+ confirmed bugs in the delegation stack (PBUG-01..12) | PARITY_BUGFIXES | DONE, UNPROVEN-FIRING |
| Rival-debate machinery, keep-alive sessions | ASSISTANT_LAYER | PENDING |
| PROTECTED array extension + verify-run self-integrity sha256 pin | DELEGATION_CHEATPROOF Phase 6 | DONE, UNPROVEN — off-repo (`~/.claude/delegation/private/`) |
| Auto death-detection from ledger + auto-RCA dispatch | GOVERNOR / LEDGER_TRUTH | PENDING |

**Two limits worth saying out loud to Rutvik:**
1. **This dies at `/compact`** — Re-invoke after every compact. `SUBPLAN_LCD_03` is the real fix.
2. **Delegating still costs quality today** — a worker gets 1 of your 18 context layers. Ticket it and carry the doctrine in, per §Dispatch. Not a licence to labor.

---

## §Graduation — this skill retires when

**The full 12-item execution queue below is DONE AND structural enforcement is proven firing live.**
Per-behavior retirement only on verified-firing enforcement — never on plan-DONE alone.

**Rutvik's execution queue (verbatim — this is what this bridge bridges toward):**
> 1 PLAN_REPO_SLOP_SWEEP · 2 PLAN_ULTRAAUDIT_FIX_WAVE (mutually gated with 1) · 3 PLAN_COPILOT_INTEGRATION_ULTRAAUDIT (clearance gate) · 4 SUBPLAN_ASSISTANT_LAYER_HARDGATES · 5 PLAN_COPILOT_HARNESS_PARITY_GAPS · 6 PLAN_DELEGATION_GOVERNOR_AND_STEERING · 7 PLAN_UPLINK_PROTOCOL · 8 SUBPLAN_UPLINK_WAVE2 · 9 PLAN_ASSISTANT_LAYER · 10 PLAN_LAZY_CEO_DELEGATOR (retires /delegation-temp) · 11 SUBPLAN_LCD_08_MEMORY_HINTS · 12 PLAN_MEGA_AUDIT_COPILOT_ERA (terminal). Done anchors: ABSOLUTE_PARITY + PARITY_INJECTION. RETIRE: PLAN_ULTRA_AGENTS_COPILOT_WORKER.

Item 10 (PLAN_LAZY_CEO_DELEGATOR) is the structural retirement trigger. At that point the behavior is machine-enforced and a skill asking nicely is dead weight. Fold anything proven load-bearing into the landing plans — never keep both.

**WARNING**: LCD_01 + LCD_02 + LCD_03 are all DONE in `plans/done/` today. The old graduation text would delete this skill right now while items 1–12 above are pending. That text was wrong. This rewrite is the fix.

**OWNER-LAW-3 — Absorption gate (mandatory)**: Any plan that retires this skill or any behavior in it MUST first read this skill in full, diff for visions present ONLY here (in no pending plan), and absorb them into permanent scope — regardless of skill-vs-plan parity state. Item 10 (PLAN_LAZY_CEO_DELEGATOR) and item 12 (PLAN_MEGA_AUDIT_COPILOT_ERA) carry matching absorption gates applied by CEO directly.
