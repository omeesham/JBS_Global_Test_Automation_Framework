---
description: Severity policy — speed↔quality governor for all gates and LR rules
paths:
  - ".claude/hooks/**"
  - "scripts/check-*"
  - "plans/**"
---

# Guardrail Policy

Path-scoped rule — loads when authoring or modifying hook scripts, check scripts, or plans.

## LR-069: Severity rubric + ramp discipline + bloat governor for all gates

**Every new gate, check script, and LR rule must declare a severity class and graduating incident. No incident, no gate.**

### §3.1 — Severity rubric (the speed↔quality governor)

| Sev | Class definition (examples from this repo's history) | Recurrence budget | Gate on breach | Friction budget |
|---|---|---|---|---|
| **S0** | Irreversible or trust-destroying: client-facing leak (IP / secrets / internal vocab), data destruction, fabricated evidence or false-green shipped | **0 — gate on FIRST occurrence** | Write-time PreToolUse **deny** AND server-side CI required check (the floor no bypass skips) | Slowness accepted; still path-scoped |
| **S1** | High: silent quality drift that survives to commit/ship — MD↔spec parity drift, DONE-flip on red tests, silent skip/rescope, closure without evidence | **1 — announce on first, deny on second confirmed** | PreToolUse or pre-commit gate landing in `announce`, ramped per §3.3 | PreToolUse ≤200ms typical; ≤2s of the pre-commit budget |
| **S2** | Medium: recurring craft defects later layers usually catch — flake anti-patterns, weak assertions, missing waits | **3 — the existing 3× graduation** | Commit-time detective, warn → `--enforce` once its suite is clean; PREFER extending an existing check script over adding a new gate | Whole pre-commit ≤20s wall |
| **S3** | Low / heuristic / false-positive-prone: judgment calls, style, anything whose mechanical check would false-positive | n/a | **Prose LR rule only**, with an explicit "deliberately no gate" note (LR-068 precedent) | Zero runtime |

Severity is assigned at capture time by the agent logging the mistake (via `/reflect` Step 2) and re-checked at nomination; classification disputes HALT-and-ask. An under-classification found by any later audit (WATCHDOG, `/audit`, owner) is **itself an S1 mistake** with its own `agent-mistakes.md` row.

### §3.2 — Per-task mistake collection (forced, not voluntary)

- **`/reflect` Step 2**: the 6-trigger mistake table carries a mandatory `Sev` column (per §3.1). Every fired trigger appends an `agent-mistakes.md` row with the Sev tag + a one-line classification rationale in the SAME session — no batching to "later". Under-classification by any later audit is itself an S1 mistake (§3.1 final sentence — not duplicated here).
- **`/final-q`**: mandatory attestation block — `**Mistakes this session:** <N> (IDs + Sev)` or `**Mistakes this session:** none — 6 triggers checked`. Missing block floors the verdict to YELLOW.
- **Stop-hook backstop** (`mistake-ledger-gate.sh`, announce mode): detects mutating sessions ending without either token; persists to `.claude/state/mistake-ledger-warnings-<sid>.json`. Both `/final-q` and `/audit` read this state file for verdict-flooring. A Stop hook cannot veto (LR-060 precedent) — it makes silence visible; the skill layer makes it a verdict problem.

### §3.3 — Ramp discipline (never straight to deny for S1)

1. **S0 is the sole deny-on-landing exception** — blast radius bounded by tight path-scoping. A server-side CI required check must accompany every S0 PreToolUse gate (the floor no bypass skips).
2. **S1/S2**: always land at `announce` first. Record `ramp_started`, `ramp_target`, and a `ramp_note` describing the ramp criterion in `.claude/guardrail-config.json` (one key per gate, same shape as the proven `c6_mode`, `coverage_mode`, `test_status_mode`, `md_first_mode` knobs — one shared file, not one file per gate). Promote to `deny` only after the ramp criterion is met (e.g., N clean sessions, zero false positives). Record `ramp_complete: true` and `ramp_flipped` date on promotion.
3. **Task chips are forbidden durable recipients** (LR-060 obligation 3). A budget-exhausted S0/S1 mistake requires a `plans/pending/SUBPLAN_GUARDRAIL_<CLASS>.md` stub (LR-048 minimum) or a grep-verifiable line item in an existing pending guardrail plan (LR-040(b)), filed in the SAME session.
4. **No silent graduation to prose for S0/S1.** The default graduation target for S0/S1 is a MECHANISM (hook / CI check / default-change). Prose-only requires an explicit un-gateable rationale recorded in the LR rule body.

### §3.4 — Bloat governor (anti-eternity lever)

**Budgets** — a gate that exceeds its layer's budget moves DOWN a layer; it does not ship over-budget:
- PreToolUse: ≤200ms per call on the hot path (fires on every write)
- pre-commit: ≤20s total wall time
- CI: carries everything heavier

**Every gate proves its rent** — the gate's source-file header comment names its Sev class and the graduating incident. No incident, no gate.

**Fire telemetry (the demotion review's data source)**: every deny/announce verdict appends one CSV line to `.claude/state/gate-fires.log`:

```
<gate-name>, <ISO timestamp>, <verdict>, <target-path-or-session-id>
```

One shared append-only log. Without this the demotion review is unauditable prose.

> **⚠ KNOWN-GAP (2026-07-13 — flagged, NOT fixed):** this mandate is only partially wired. Only
> `check-md-first.mjs` + `check-mistake-ledger.mjs` actually emit fire telemetry; the other ≥8
> deny/announce gate libs (`check-plan-closure`, `check-todo-injection`, `check-browsertool`,
> `check-graft-ship`, `check-bug-baseline`, `check-identity-switch`, `check-jargon`, `check-no-verify`)
> are DARK — they never append to `gate-fires.log`. The demotion review below therefore runs on
> partial signal and could wrongly retire a still-live gate as "0 fires in 90 days". Fix (when
> someone gets to it) = a shared `fireTelemetry(gate, verdict, target)` helper called on every
> deny/announce branch of the dark libs. Surfaced by a cross-family gap-hunt debate; the ranking +
> evidence live in the delegation `decision-debates.jsonl` (2026-07-13 entry). Left as a flag by
> owner direction — parallel plans may touch these libs; if still unused later it gets removed anyway.

**Demotion review** (at `/compile-learnings` cadence, reading `gate-fires.log`):
- deny-gate with 0 fires in 90 days AND no class recurrence → demote to `announce`
- announce-gate with 0 fires in 90 days → demote to prose-only LR rule
- ≥3 confirmed false positives in 30 days → demote + fix or delete the gate
- Dead gates (the 3 vendor-fresh no-ops in `.githooks/` are the standing example) get deleted

Direction of trust: gates exist to make quality CHEAP, not to make work slow — when a class stops recurring, its gate must shrink with it.

**Trigger**: any authoring or edit of a hook script (`.claude/hooks/**`), a check script (`scripts/check-*`), or a plan/subplan (`plans/**`) that introduces, modifies, or removes a gate. Re-verify the LR number is free per LR-020 before assigning.

**Graduated from**: PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT Phase 3 (2026-07-10 amendment — the owner directive to implement a standing severity-policy + self-healing loop system, not a one-time fix list). Cross-refs LR-040, LR-048, LR-055, LR-060, LR-062.

## LR-070: Uplink law — a disciplined ask-channel wherever a judge hands a single-turn task to a cheaper actor

**An uplink belongs wherever a judge (orchestrator / manager / stronger model) hands a single-turn or headless task to a cheaper actor that cannot clarify mid-run, AND a GREEN / verdict / schema gate can accept the actor's output without a mandatory assumptions-disposition.** That is the assumption-leak class: the actor assumes, the judge misses it, and the failure rides a GREEN into the deliverable uncaught.

**Sev**: S1 (silent quality drift surviving to commit/ship — an unsurfaced assumption baked into accepted output). **Graduating incident**: Rutvik owner directive 2026-07-12 — "the employee cannot discuss doubts with the manager, so agents ASSUME, managers miss it, and assumption-failures leak into the final deliverable uncaught." Landed via PLAN_UPLINK_PROTOCOL, announce-first per §3.3; `enforce` is Phase 7 (a separate calibrated session — flip only after ≥20 announce dispatches land the trip-rate in the 10–20%-of-decision-points band with zero false fires).

**The law** (`~/.claude/delegation/UPLINK_DOCTRINE.md` v1.0) — three roles that never merge (Worker owns the task end-to-end; Supervisor = dumb deterministic code holding the ONLY trigger; Oracle = stateless consultant, cheapest-capable first); the trigger is external + behavioral + deterministic because **the asker may NOT own the ask** (§2 — self-assessment of when help is needed is least reliable exactly when help is most needed); the packet is minimum-context + split-authorship (facts from the machine, question from the mind) + boundary-redacted (§3); the advisory constrains, never labors (§4 no-labor / no-scope / no-conversation); two control layers — soft asking-doctrine (Worker reads at trip time) + hard policy (Supervisor only) (§5); every answer graduates into a rule so the line goes quieter every week until silence means success (§6 ratchet).

**Wave-1 instantiation surfaces (this repo)**: copilot workers → Claude via the `## ASK` report section + acceptance gate + pre-flight CLARIFY round; the Supervisor = `copilot-worker.sh` UW-wires + `.claude/hooks/lib/uplink/*.mjs` (packet-builder / redact / validate-advisory); Claude → Rutvik via the one-liner ask law (`ASKING_DOCTRINE.md` §Claude-tier + `feedback_ask_rutvik_oneliner.md`); headless `/execute` chain sessions → Rutvik via the PAUSE_NOTICE `## ASK` section + the GREEN-path assumptions-disposition (`**Assumptions**:` line under `/final-q` `**AuditFormat**: v3`, parsed by `parse-verdict.mjs`).

**How to apply**: when authoring ANY judge→cheap-actor handoff (LR-064 Tiered Delegated Walk, `/rca` mama↔Subagent, `/execute` Adjacent-Sweep spawns, `/ultra-agents` fanout, Claude→Task-tool subagents), ask: can the actor clarify mid-run? If no, AND a GREEN/verdict/schema gate accepts its output, wire (a) a pre-assume ASK channel the gate keys on, and (b) an assumptions-disposition the accept path cannot skip. Wave-2 expansion instances are enumerated in `plans/pending/SUBPLAN_UPLINK_WAVE2.md` and fire after Phase 7 calibration.

**Deliberately prose-tier where noted** (S3 posture — no grep can make the call): the accuracy of an `ASK: none` claim, sub-agent assumption fold-up, and innovation-class routing — netted by the reviewer assumptions-vs-diff bounce + the mandatory assumptions-disposition line, not a hook.

**Trigger**: authoring/editing any delegation handoff where a judge accepts a single-turn/headless actor's output behind a GREEN/verdict/schema gate; any edit to the uplink control surface (`uplink-policy.json`, `ASKING_DOCTRINE.md`, `UPLINK_DOCTRINE.md`, the `copilot-worker.sh` UW-wires, `.claude/hooks/lib/uplink/*.mjs`); every `/compile-learnings` (run the §6 graduation scan).

**Graduated from**: PLAN_UPLINK_PROTOCOL (2026-07-12). Cross-refs LR-069 (severity/ramp — uplink lands announce-first), LR-060 (assumptions-disposition on GREEN close), LR-064 (TDW is wave-2 C1), LR-046 (strict-line HALT is a Rutvik-tier ask-class), LR-063 (self-serve ladder — Rutvik is the top, not the first stop).
