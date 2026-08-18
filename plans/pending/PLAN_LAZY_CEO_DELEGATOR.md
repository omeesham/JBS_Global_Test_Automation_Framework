# PLAN_LAZY_CEO_DELEGATOR — Master Tracker & Run-Order for Claude↔Copilot Integration Redesign

**Status**: Pending
**Priority**: P0
**Created**: 2026-07-13
**Identity**: OWNER
**PermissionMode**: default
**Type**: MASTER (tracker + run-order — never executed directly)

---

## Diagnosis

Claude's delegation system suffers from a **structural enforcement gap** (primary cause, delegation-audit-B) compounded by **always-on doer-craft context priming** (44% of CEO context is worker-technique, delegation-audit-A). The delegation-gate (`delegation-gate.mjs:51`) only intercepts Edit/Write/MultiEdit/NotebookEdit — Bash, reads-at-scale, RCA, verification, and `.md` drafting are completely ungated (`delegation-gate.mjs:128-130`). The stall guard is WARN-only (`worker-ext.md:116`), creating rescue temptation. Post-compaction, CEO identity erodes to rule-text without role-assertion (`delegation-primer.mjs:82-95`). The result: Claude burns expensive tokens on work unlimited Copilot workers should do.

---

## § BACKBONE (referee ruling)

**HYBRID backbone — neither GPT alone nor Opus alone.** Both refuters advocated for their own side:

- `refute-opus/result.md:61–63`: **"Opus is the stronger backbone"** — treats failure as a control-system problem; close actual tool-surface gaps FIRST; do NOT build a mini-platform before the first enforcement layer works.
- `refute-gpt/result.md:67`: **"GPT is the stronger backbone"** — stays closer to real hook behavior; keeps Bash nudging simpler; preserves escalation ladder; sets a serious delegation target.

There is **no clean winner** — each refuter favored its own side. The correct backbone is Opus's control-system spine with the components BOTH refuters independently salvaged:

**Spine (Opus):**
- Close actual tool-surface gaps FIRST. Do NOT build ceremony before the first enforcement layer works. This is also the anti-token-burn / lazy-CEO position.
- Preserve the stall/bounce WARN-only path (`worker-ext.md:116`) without hard-kill before work-type timeout.

**Salvaged by BOTH refuters (canonical to keep):**
- **WARN-only Bash nudge, never a Bash deny** — respects the approved false-positive tradeoff (`delegation-gate.mjs:23-24`).
- **Stall→pre-written bounce ticket, without immediate kill** — pre-writing gives CEO a delegation path; killing before work-type timeout is wrong (`worker-ext.md:116`).
- **Lesson-router with CEO/worker/system lane split** — prevents re-pollution; membrane rule: only verify-pointers cross the CEO boundary.
- **Delegation-ratio target ≥0.95** — denominator = `dispatches / (dispatches + self_work_logged + nudges_fired)`, so unlogged reads cannot report clean.
- **Dispatch-counter reset as positive reinforcement** (carrot on delegate) — `refute-opus/result.md:60–64`.
- **Quick-dispatch copy-paste patterns** (not a new script) — `refute-opus/result.md:202–208`.
- **Q3 trigger table** (post-compaction, task urgency, stall rescue, small-seeming task, chain escalation, doer-craft in context, post-dispatch verification) — `refute-opus/result.md:248–262`.
- **Migration safety table** (phase/risk/protected/reversible matrix format) — `refute-opus/result.md:266–277`.

---

## PROTECTED-FILES List

These files require Rutvik's explicit in-chat "go" + SELF_GRANT ceremony before ANY modification. The subplans DESCRIBE changes; they do NOT execute them.

| File | Why protected |
|------|--------------|
| `~/.claude/hooks/delegation-gate.mjs` | Source-write enforcement gate |
| `~/.claude/hooks/delegation-primer.mjs` | SessionStart CEO identity + rule injection |
| `~/.claude/hooks/ua-worker-guard.mjs` | Agent-spawn guard |
| `~/.claude/settings.json` | Hook registration; one wrong entry = system down |
| `~/.claude/settings.local.json` | Local hook overrides |
| `.claude/guardrail-config.json` | Enforcement knob state |
| `.claude/identity-gate-config.json` | Identity enforcement ramp |
| `.claude/closure-config.json` | Plan closure gate ramps |
| `~/.claude/delegation/config.json` | Master ON/OFF gate for delegation system |
| `~/.claude/delegation/routing-policy.json` | Chief's routing rulebook (scorecard-written only) |
| `scripts/scorecard.mjs` | Routing/scoring logic |
| `.claude/skills/ultra-agents/copilot-worker.sh` | Worker dispatch wrapper |
| `.claude/skills/ultra-agents/worker-ext.md` | Worker doctrine (source of truth) |

---

## § MASTER RUN-ORDER

Corrected 42-item sequence (ordering prosecutor `## CORRECTED RUN-ORDER`, referee-approved). Replaces the original 30-slot draft. Applies fixes D1–D14 from `prosecute-ordering/result.md`.

**Existence note**: all plan-file rows were verified present in `plans/pending/` at authoring time (2026-07-13), except substrates in item #0 (confirmed in `plans/done/`). `worker-skills-design-v2` (#25) is a verification CHECKPOINT, not a plan file.

| # | Plan / checkpoint | Reason |
|---:|---|---|
| 0 | ✅ Re-verify DONE substrates: `PLAN_STATIC_TO_DYNAMIC.md`, `PLAN_IDENTITY_ENFORCEMENT.md` | In `plans/done/` — confirm done status; not run candidates. Redesign builds on them. |
| 1 | `PLAN_FIGHTINNOVATION_CLASH_FREE_PARALLELISM.md` | Read-only design must precede any parallel integration execution. |
| 2 | [PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT.md](../plans/done/PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT.md) — **DONE 2026-07-15** | Guardrail severity/friction rules before new hooks. |
| 3 | [PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY.md](../done/PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY.md) — **DONE 2026-07-16** | Parent-cascade close: both children done (BUGFIXES 10-fixed/2-refuted; INJECTION_SYSTEM M1+M2+M3 wired, canary-proven echo, DUTY_STACK extract live); staging snapshot deleted per step 7. |
| 4 | `SUBPLAN_PARITY_BUGFIXES.md` | Fix substrate (`copilot-worker.sh`, `guardrail-config.json`, `delegation-gate.mjs`) before Uplink/Injection/LCD hook work. |
| 5 | [SUBPLAN_LCD_01_CONTEXT_SURGERY.md](../plans/done/SUBPLAN_LCD_01_CONTEXT_SURGERY.md) — **DONE 2026-07-16** | Creates landing zones for LCD_02/LCD_05. Landed: doctrine index (relocated in-repo per ticket DEVIATION), 10 CEO pointers in encore CLAUDE.md (232→129), root CLAUDE.md 2 compressions, MEMORY.md worker-lane fold. |
| 6 | [SUBPLAN_LCD_02_ENFORCEMENT_HOLES.md](../plans/done/SUBPLAN_LCD_02_ENFORCEMENT_HOLES.md) — **DONE 2026-07-16** | Nudge hook installed+registered (11/11 battery, gpt review GREEN), gate v5 live (.md advisory, grant anchor, doctrine PROTECTED, PBUG-08/09, /assistants switch — 8/8 live probes), check:tc-parity exit 0. |
| 7 | [SUBPLAN_LCD_03_COMPACTION_SURVIVAL.md](../plans/done/SUBPLAN_LCD_03_COMPACTION_SURVIVAL.md) — **DONE 2026-07-16** | CEO identity block in primer ON/fail-safe branches (OFF stays pure per master switch) + nudge CEO-mode wording; council-built (opus build 25/25 probes, gpt review GREEN, 0 defects), installed with .bak-lcd03 backups, live 8/8 incl. real OFF-flip + idempotent re-fire. |
| 8 | [SUBPLAN_LCD_04_STALL_HANDLING.md](../plans/done/SUBPLAN_LCD_04_STALL_HANDLING.md) — **DONE 2026-07-16** | Stall warn+bounce live: wrapper pre-writes bounce ticket at warn+60s (max 2, STALL-EXHAUST after), nudge warns anti-rescue while a fresh bounce is queued, worker never killed; proven on a REAL 400s-silent dispatch (bounce file + STALL-CONTEXT + worker survived). |
| 9 | `PLAN_UPLINK_PROTOCOL.md` | ASK schema/uplink must exist before chain, injection, assistant, observability. |
| 10 | [PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md](../plans/done/PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md) — **DONE 2026-07-16** (closure paperwork; was fully landed 2026-04-23 + hardened since) | Verified already-built by read-only pass 2026-07-16; re-execution would have regressed RC-1/RC-2/idempotency/uplink hardening. Chain runtime untouched (PAUSED/HELD). |
| 11 | [SUBPLAN_LCD_07_OBSERVABILITY.md](../plans/done/SUBPLAN_LCD_07_OBSERVABILITY.md) — **DONE 2026-07-16**, owner-GO'd live apply: enriched ledger (ts/dispatcher/session/ticket/depth/cap/sub_agents, UUID fallback, mkdir-lock), gate AH-02 ledger PROTECTED, activity-log parity per dispatch, final-q delegation-ratio Step 4.9; proven by live canaries + direct gate spawns; v6.1 norm-hardening staged for the ultraaudit fix wave. | After stall handling and wired uplink; owns ledger enrichment. |
| 12 | `SUBPLAN_UPLINK_WAVE2.md` | After Uplink calibration and rebase against LCD_07 ledger. |
| 13 | [SUBPLAN_LCD_05_LEARNING_LANES.md](../plans/done/SUBPLAN_LCD_05_LEARNING_LANES.md) — **DONE 2026-07-16** | Lesson-router live (CEO/WORKER/SYSTEM lanes) + /reflect Step 2.5 with membrane HARD BAN + /compile-learnings worker-lane scan/graduation/size-caps; council-built (35/35 probes + routing sim), gpt review GREEN. |
| 14 | `PLAN_LOSSLESS_DEEP_TRIM.md` | Manual self-pruning parent. |
| 15 | `SUBPLAN_TRIM_01_COMMIT_PENDING_DELETIONS.md` | Clean baseline first. |
| 16 | `SUBPLAN_TRIM_02_OLD_PLAN_DISPOSITION.md` | Decides stale cleanup families before moves. |
| 17 | `PLAN_ROOT_CLIENT_DEDUPE.md` | Required parent for RCD_B (classifier dependency). |
| 18 | `SUBPLAN_RCD_B_DEDUPE_SCRIPTS.md` | Required before RCD_C and TRIM_06. |
| 19 | `SUBPLAN_RCD_C_ENV_REPORTS_CRUFT.md` | Depends on RCD_B. |
| 20 | `SUBPLAN_TRIM_03_PLAN_CORPUS_HYGIENE.md` | After TRIM_02 verdicts. |
| 21 | `SUBPLAN_TRIM_04_SCRIPTS_DEADWEIGHT.md` | After TRIM_02; before TRIM_06. |
| 22 | `SUBPLAN_TRIM_05_EXPORT_CONVERTERS.md` | After TRIM_02; before TRIM_06. |
| 23 | `SUBPLAN_TRIM_06_CLOSURE.md` | Fan-in after TRIM_03/04/05 + RCD_B/C. |
| 24 | [SUBPLAN_LCD_06_SELF_PRUNING.md](../plans/done/SUBPLAN_LCD_06_SELF_PRUNING.md) — **DONE 2026-07-16**, council loop (opus build ×3 + gpt review BOUNCE→GREEN, 49/49 probes): pruning-policy.md in home delegation dir, scripts/prune-check.mjs (exit 0/1/2 fail-safe), compile-learnings Step 4.7 § Pruning Check (no autonomous deletion ever). | Codifies ongoing pruning after lanes + manual trim. |
| ⛔ | [PLAN_WORKER_SKILL_ROUTING.md](../plans/done/PLAN_WORKER_SKILL_ROUTING.md) — **DONE** (superseded by worker-skills-design-v2) | Confirmed in `plans/done/` — do not execute. |
| 25 | worker-skills-design-v2 checkpoint *(not a plan file)* | Gate passed — SUBPLAN_PARITY_INJECTION_SYSTEM (#26) is confirmed DONE; this checkpoint was a prerequisite and is resolved. |
| 26 | [SUBPLAN_PARITY_INJECTION_SYSTEM.md](../plans/done/SUBPLAN_PARITY_INJECTION_SYSTEM.md) — **DONE** | Confirmed in `plans/done/`. |
| 27 | `PLAN_ASSISTANT_LAYER.md` | After stable base + ASK schema + injection substrate. |
| 28 | `PLAN_FIGHTINNOVATION_INTER_SESSION_ASSISTANT.md` | Depends on Assistant Layer. |
| 29 | `PLAN_AGENT_AUTHORING_EFFICIENCY.md` | Recheck after Injection because M1 may subsume it. |
| 30 | `SUBPLAN_DQU_05C_LR_046_HOOK_AUTHORING.md` | After guardrail audit. |
| 31 | `PLAN_JARGON_AUTHORING_GATE.md` | After guardrail audit; hook/precommit collision lane. |
| 32 | `PLAN_CLOSURE_GATE_V6_PARENT.md` | After guardrail audit and trim script cleanup. |
| 33 | `SUBPLAN_CLOSURE_GATE_V6_A_OVERRIDES_FOUNDATION.md` | V6 chain A (strict sequence: A→B→C→D→E→F→G). |
| 34 | `SUBPLAN_CLOSURE_GATE_V6_B_VALIDATOR_C1_C2.md` | V6 chain B. |
| 35 | `SUBPLAN_CLOSURE_GATE_V6_C_VALIDATOR_C3_C5.md` | V6 chain C. |
| 36 | `SUBPLAN_CLOSURE_GATE_V6_D_MANIFEST_LAYOUT.md` | V6 chain D. |
| 37 | `SUBPLAN_CLOSURE_GATE_V6_E_HOOK_LIB.md` | V6 chain E. |
| 38 | `SUBPLAN_CLOSURE_GATE_V6_F_WRAPPER_PRECOMMIT_NPM.md` | V6 chain F. |
| 39 | `SUBPLAN_CLOSURE_GATE_V6_G_RULE_SKILL_CEREMONY.md` | V6 chain G (final chunk). |
| 40 | `SUBPLAN_DQU_29_I1_IDENTITY_RIPPLE_SYNC.md` | Identity/agent sync after plan/hook mutations. |
| 41 | `SUBPLAN_LCD_08_MEMORY_HINTS.md` | P3 parked; last feature plan only if owner promotes it. |
| 42 | `PLAN_MEGA_AUDIT_COPILOT_ERA.md` | Terminal finalizer after all actually-promoted initiatives. |

---

## § CROSS-AWARENESS STAMPS

Each plan in the family carries a one-line header stamp so every plan knows its neighbors:

| Plan | Stamp |
|------|-------|
| `SUBPLAN_LCD_01` | `Runs-after: none \| Collides-with: LCD_02 (CLAUDE.md pointers)` |
| `SUBPLAN_LCD_02` | `Runs-after: LCD_01 \| Collides-with: LCD_01 (CLAUDE.md pointers), LCD_03 (primer), PARITY_BUGFIXES (hooks)` |
| `SUBPLAN_LCD_03` | `Runs-after: LCD_02 \| Collides-with: LCD_02 (primer)` |
| `SUBPLAN_LCD_04` | `Runs-after: LCD_02 \| Collides-with: none` |
| `SUBPLAN_LCD_05` | `Runs-after: LCD_01 \| Collides-with: WORKER_SKILL_ROUTING (routing)` |
| `SUBPLAN_LCD_06` | `Runs-after: LCD_05 \| Collides-with: PLAN_LOSSLESS_DEEP_TRIM (same surface) \| Blocks: LCD_08` |
| `SUBPLAN_LCD_07` | `Runs-after: LCD_04 \| Collides-with: UPLINK_WAVE2 (ledger), MEGA_AUDIT (reads ledger)` |
| `SUBPLAN_LCD_08` | `Runs-after: LCD_06 \| Collides-with: none \| Priority: P3-PARKED \| Blocked-by: LCD_05, LCD_06` |

**Bidirectionality note**: LCD_02's `Collides-with` now includes LCD_01 (back-pointer to close the asymmetry identified by the ordering prosecutor). Cross-awareness with existing plans outside the LCD family (UPLINK_WAVE2, MEGA_AUDIT, WORKER_SKILL_ROUTING, LOSSLESS_DEEP_TRIM) is tracked in this master table; those external plans receive physical stamps in a later housekeeping step.

---

## § RE-CHECK-BEFORE-EACH-RUN PROTOCOL

**Runnable preflight — mandatory before executing any plan in this family.**

```bash
# Usage: before executing plans/pending/<PLAN>.md
node scripts/plan-preflight.mjs plans/pending/<PLAN>.md
# exits 0 = safe to run; exits non-zero = HALT, re-anchor before proceeding
```

The preflight runs exactly 4 checks and exits non-zero on any failure:

**Check 1 — Anchor drift**: Extracts every `file:line` citation from the plan body, runs `sed -n '<lines>p' <file>` for each, and confirms the line is non-empty. Drift on ≥1 anchor → exit 1.

```bash
# Manual spot-check form:
grep -oP '`[a-zA-Z0-9_.~/\-]+:\d+(-\d+)?`' plans/pending/<PLAN>.md
# For each result, e.g. `copilot-worker.sh:492-496`:
sed -n '492,496p' .claude/skills/ultra-agents/copilot-worker.sh
# HALT if output is empty or content diverges from the plan's stated expectation
```

**Check 2 — Precondition greps**: Runs every grep assertion in the plan's `## Preconditions` section. Any grep returning exit 1 (no match) → exit 1.

```bash
# Example for SUBPLAN_LCD_02:
grep "Bash no-gate comment" ~/.claude/hooks/delegation-gate.mjs && echo "OK" || exit 1
```

**Check 3 — Collision check**: If the plan's `Collides-with` stamp names a plan whose status changed since authoring, re-read the shared files and confirm no semantic conflict. Log resolution before proceeding.

**Check 4 — Gate + state freshness**:
```bash
node -e "const c=require(process.env.HOME+'/.claude/delegation/config.json'); if(c.GATE!=='on') process.exit(1)"
# => HALT if GATE is not 'on'
cat ~/.claude/state/assistant-state.json | grep '"mode"'
# => Note current mode; informs execution context
```

**HALT semantics**: any check fails → STOP. Re-anchor the plan (update stale file:line citations), then re-run preflight. A plan that proceeds despite a known-drifted anchor is an execution defect.

---

## § DELEGATION-DEPTH POLICY + NESTED-WORKER OBSERVABILITY

### Current state (verified)
- `worker-ext.md:12`: "Claude → ≤5 workers → each ≤3 sub-agents → those spawn nothing (depth 2)"
- `worker-ext.md:148-150`: depth/breadth cap is SOFT (instruction only, no hook enforces)
- Ledger (`copilot-worker.sh:540-549`): records ONE row per TOP-LEVEL worker dispatch only
- Nested sub-agents: NO ledger row, NO trace, only parent's self-reported count (`worker-ext.md:150`)
- `/assistants` ON adds depth 1 (chief between Claude and workers) → actual depth = 3

### Policy decisions for this family

**Depth model**:
```
Claude (CEO) → Chief-of-Staff [depth 0, when /assistants ON] → Workers [depth 1] → Sub-agents [depth 2]
```
- Chief is NOT a worker and NOT subject to worker caps. It is a persistent named agent at depth 0.
- Workers: hard cap at 5 concurrent (existing). `/ultra-agents` can boost to 6 (existing goal-scoped lift).
- Sub-agents: soft cap at 3 per worker (existing). Keep soft — sub-agents are ephemeral read-only helpers.
- Depth cap: 2 from workers (workers + their sub-agents). Chief does not count toward this cap.

**Hard vs soft enforcement**: Keep depth/breadth cap SOFT for sub-agents (they are cheap, ephemeral, and capped by the `task` tool's own limits). Make worker cap HARD via slot-lock fix (AH-13 in LCD_07). `/ultra-agents` boost remains goal-scoped with ledger proof.

**Nested observability (OWNER HARD REQUIREMENT)**:

Every agent action on Encore work must be fully trackable. The family closes these gaps:

1. **Ledger enrichment** (LCD_07): Add fields `ts`, `tokens_in`, `tokens_out`, `cost_usd`, `dispatcher` (CEO|chief|worker-N), `session_id`, `ticket_id`, `parent_run_id`, `depth`, `effective_cap`.
2. **Nested sub-agent trace** (LCD_07): Each worker that spawns sub-agents appends a `sub_agents: [{name, model, ts, tokens_in, tokens_out, cost_usd, files, work_type, secs, ok}]` array to its own ledger row on completion. See LCD_07 for field surfacing constraints (some fields require worker self-report; see `SUBPLAN_LCD_07_OBSERVABILITY.md` Phase 3 for the explicit gap inventory).
3. **Activity-log parity** (LCD_07): The wrapper (`copilot-worker.sh`) writes a structured activity-log entry (matching solo-Claude's format) for every Encore-touching dispatch. Fields: who dispatched, model, work-type, when, cost/tokens, files touched. This feeds the same reporting pipeline solo-Claude used.
4. **Reconstructability test**: For ANY Encore dispatch, the audit trail must answer: who dispatched it (CEO vs chief vs which worker), model used, work-type, WHEN (wall-clock timestamp), cost/tokens consumed, files touched, and the full parent→child chain — top-level AND nested.

---

## § SKILL-ABSORPTION PARITY GATE (owner mandate 2026-07-24)

`/delegation-temp` SKILL.md is a FIRST-CLASS VISION SOURCE, not disposable temp prose — new owner
laws land there first (fastest write surface), so vision scatters into it between planning waves.
Before THIS plan (or any sibling it sequences) retires `/delegation-temp` or any behavior in it:

1. Read `.claude/skills/delegation-temp/SKILL.md` IN FULL (current on-disk version, not a cached
   summary).
2. Diff every section (§Law, §Org-Chart, §Fight-Protocol, §Worker-Death-RCA, §Dispatch, §Acceptance,
   §Failure, §Zero-burn, §Closure, §Honest-Gaps, §Graduation) against the pending/done integration
   plans' scope AND the landed harness.
3. Any vision/law present ONLY in the skill → ABSORB into permanent scope FIRST (extend this plan or
   the right sibling), regardless of parity between the skill's temp wording and plan wording — the
   owner's intent in the skill wins over "it wasn't in a plan".
4. Only after zero skill-only visions remain may the skill (or the behavior) be retired.
5. `PLAN_MEGA_AUDIT_COPILOT_ERA` re-verifies this as a nothing-lost acceptance line (added same day).

## § OPEN FOR OWNER

1. **Tool-stripping vs nudge-only**: The completeness critic (gap #1) notes external research suggests zero-execution-tool CEO wrapper as the highest-leverage hard fix. Current design uses nudge-only (WARN, never DENY) per the approved Bash no-gate trade. Should phase 2 include a hard zero-execution wrapper option? (This is a comfort/product call.)

2. **Retention horizon for archived plans + delegation reports**: Research disagrees between TTL cleanup and permanent provenance. What retention: 60/90/180 days, or "forever but outside active context"?

3. **Chief learning lane**: When the chief makes a wrong routing decision, where does that lesson land? Is the chief governed by `dispatcher-lessons.md`, or does it need its own learning file? (UNKNOWN from repo evidence — chief agent file is outside repo.)

4. **`/assistants` chief-dispatch observability**: Does the chief's routing decision (what it chose, why) need its own ledger row, or is the worker-level row sufficient?

5. **Chain + assistant mode interaction (AH-05)**: `/chain` currently bypasses assistant mode. Should it be required to route through the chief when assistants=ON, or is chain a CEO-direct-dispatch mode by design?

---

## § ROLLBACK STORY

### Owner's 3 questions answered:

**Q1: Does finishing `/assistant` (inter-session control plane) fix this?**
No. Complementary but NOT the fix. `/assistant` (singular, inter-session hub, `PLAN_FIGHTINNOVATION_INTER_SESSION_ASSISTANT.md`) fixes Rutvik's cross-session steering UX. The lazy-CEO regression is an INTRA-session token-burn problem. The `/assistants` (plural, chief-of-staff layer) is a force multiplier — it offloads CEO mechanics to the chief — but the drift happens BEFORE any ticketing: Claude receives a task and immediately starts doing it. If identity drifts, it'll also forget to brief the chief. Build Layer 1 (enforcement + identity + surgery) first. Then `/assistants` multiplies the savings on a stable base.

**Q2: Is a good PLAN a guarantee?**
No. A plan is necessary scaffolding but hooks must back it. Evidence: `worker-ext.md` IS a perfect plan — and Claude STILL labored (2 caught sessions). Why plans fail alone: (1) attention decay (plan competes with 600+ lines), (2) compaction destroys nuance, (3) plans don't intercept tool calls. Formula: **Plan + Hooks + Identity + Measurement = structural guarantee**. Hooks are load-bearing (they fire at the action layer). Plans enable hooks to know WHAT to enforce.

**Q3: Will Claude hallucinate into working?**
Yes. Predictable triggers (from Opus fight, validated):
| Trigger | Why it happens |
|---------|---------------|
| Post-compaction | Identity erased; doer-craft remains; base training wins |
| Task urgency | "Just quickly" → bypasses deliberation |
| Worker stall | "I can do this in 10s" → least resistance path |
| Small-seeming task | "Just one grep" → no self-monitoring activates |
| Chain escalation | 1st read legitimate → 3rd read IS the RCA → never ticketed |
| Doer-craft in context | Reading LR-036 code → "I know how" → doing |
| Post-dispatch verification | "Just want to check" → runs entire battery |

Structural answer: You cannot instruction-tune away the drift (instructions fade). You must make doing-it-yourself HARDER than delegating (friction via nudge hook) AND make not-delegating VISIBLE (measurement via self_incidents + Receipt). The model optimizes for least friction — make delegation that path.

### Rollback

Every subplan is independently revertible:
- Context surgery: `git checkout -- clients/encore/CLAUDE.md CLAUDE.md` (git-tracked, checkout works)
- Hooks (new files in `~/.claude/hooks/`): delete the new hook file + remove `~/.claude/settings.json` entry — **no git checkout** (untracked home-dir files); take a file-copy backup before modifying: `cp ~/.claude/hooks/delegation-nudge.mjs ~/.claude/hooks/delegation-nudge.mjs.bak`
- Primer changes (`~/.claude/hooks/delegation-primer.mjs`): **restore from file-copy backup** — `git checkout` does NOT revert `~/.claude/` files. Required backup step before modification: `cp ~/.claude/hooks/delegation-primer.mjs ~/.claude/hooks/delegation-primer.mjs.bak`
- Gate changes (`~/.claude/hooks/delegation-gate.mjs`): **restore from file-copy backup** — same reason. Required backup: `cp ~/.claude/hooks/delegation-gate.mjs ~/.claude/hooks/delegation-gate.mjs.bak`
- Stall config (`.claude/guardrail-config.json`, git-tracked): `git checkout -- .claude/guardrail-config.json` OR set `stall_guard_action: "warn"` directly
- Ledger schema: backward-compatible (new fields are additive; old parsers ignore them)

**VALID rollback rule** (R6): `git checkout` works ONLY for files tracked in the repo (`.claude/`, `clients/`, `scripts/`). For `~/.claude/`, `~/.copilot/` files — use file-copy backup/restore ONLY.

---

## § ASSISTANTS LAYER — DO-NOT-BREAK

Per `map-assistants/result.md`, the `/assistants` layer is a first-class component. This family EXTENDS it, never clobbers it.

| # | Must preserve | Source |
|---|---------------|--------|
| 1 | `assistant-state.json` sole state truth | `.claude/skills/assistants/SKILL.md:26` |
| 2 | `config.json` PROTECTED — `/assistants` never writes it | `SKILL.md:19-22` |
| 3 | Primer lines 44-52 (reads assistant state, emits announce FIRST) | `delegation-primer.mjs:44-52` |
| 4 | Announce line text verbatim | `SKILL.md:30` |
| 5 | Chief agent file (`~/.copilot/agents/chief.agent.md`) | `SKILL.md:61` |
| 6 | `routing-policy.json` (machine-written by scorecard only) | `delegation-gate.mjs:67` |
| 7 | Never-delegate list (6 items stay Claude-only) | `SKILL.md:72-75` |
| 8 | Atomic write protocol (tmp+rename) | `SKILL.md:39-48` |
| 9 | Secrecy discipline (git-excluded, not in INDEX.md) | `SKILL.md:16-17` |
| 10 | `/assistants` plural ≠ `/assistant` singular (orthogonal) | `verdict.md:63-65` |
| 11 | Depth-2 cap in worker-ext is the OFF model; ON = depth 3 (explicit) | `worker-ext.md:12` |

Enforcement design (LCD_02) must distinguish "Claude directly running Bash" from "chief routing workers through authorized dispatch path" — chief dispatches are NOT self-work.

---

## Non-collision declaration

- `/assistants` (plural) = intra-session chief-of-staff layer — EXISTS, may be ON now.
- `/assistant` (singular) = future inter-session hub — DESIGN-ONLY, not built.
- These are **orthogonal**. Both can be active simultaneously. No state-path or skill-path collision.
