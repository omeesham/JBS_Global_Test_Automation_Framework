# SUBPLAN_UPLINK_WAVE2 — Wave-2 uplink expansion instances (C1–C4 + B3)

**Status**: PENDING
**Priority**: P1
**Created**: 2026-07-12
**Identity**: OWNER
**Parent**: PLAN_UPLINK_PROTOCOL.md
**Depends on**: PLAN_UPLINK_PROTOCOL Phase 7 calibration
**Blocks**: none
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: plan
**BrowserTool**: none

---

## Context

Wave-1 of PLAN_UPLINK_PROTOCOL lands the structural shape of the uplink protocol (packet schema,
Class-A/B wires, the LR-070 rule, advisory injection, guardrail-config ramp). These five instances
were deliberately parked outside wave-1 scope because they require Phase 7 calibration telemetry to
prove the wave-1 shape before adding surface area.

The pattern they instantiate is the CORE CLAUSE of LR-070 (Uplink law, to be graduated by
PLAN_UPLINK_PROTOCOL Phase 6): *"an uplink belongs wherever a judge hands a single-turn/headless
task to a cheaper actor that cannot clarify mid-run, and a GREEN/verdict/schema gate can accept its
output without a mandatory assumptions-disposition."* Each instance below is a confirmed gap in that
coverage: a real judge→cheap-actor handoff today operating with no structured assumptions-surfacing
channel.

Source: `plans/pending/PLAN_UPLINK_PROTOCOL.md` line 139 (wave-2 block, verbatim items reproduced
in Phase 1 below per LR-040(b) recipient-integrity requirement).

---

## Bootstrap

**Identity**: OWNER

**Skills auto-called**:
- `/identity` (Step 1.5 gate, fires on subplan launch)
- `/regression-guard` (wrap — BEFORE + AFTER snapshots on any hook/script edits)
- `/relevant` (Phase 0 — skill + LR + agent-mistakes + patterns injection)
- `/final-q` (Phase 4 — mandatory exit per LR-042)

**Context files** (every rule + reference this subplan loads):
- `plans/pending/PLAN_UPLINK_PROTOCOL.md` (parent plan — read full plan before execution)
- `UPLINK_DOCTRINE.md` (Rutvik v1.0 — saved to local delegation dir in PLAN_UPLINK_PROTOCOL Phase 0)
- `.claude/rules/guardrail-policy.md` (LR-069 ramp; LR-070 target home)
- `.claude/rules/inventory.md` (LR-064 Tiered Delegated Walk — C1 surface)
- `.claude/rules/pipeline.md` (LR-048 structural minimum; LR-040 closure gate)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (§2 ownership, ALL-* rules)
- `docs/read_only_docs/LEARNED_RULES.md` (cross-cutting LR-NNN including LR-064, LR-070)
- `.claude/skills/ultra-agents/worker-ext.md` (PROTECTED list, dispatch how-to, Receipt v3)
- `.claude/skills/rca/SKILL.md` (mama↔Subagent-B pattern — C2 surface)
- `pipeline/hooks/check-rca-verdict.mjs` (C2 — verify spawning vs assumption-surfacing gap at ~:174)

---

## Phase 0 — Dependency + browser-tool gate (MANDATORY)

1. Confirm `Depends on`: PLAN_UPLINK_PROTOCOL Phase 7 calibration must be complete (Status column
   of parent plan Phase 7 checkboxes all ticked) before this subplan executes. If not done → HALT,
   this subplan is GATED.
2. Read `.claude/context/navigation.md` (R00) — check Exploration Registry for uplink/inventory/rca
   surfaces; pull listed findings instead of re-exploring.
3. Read `clients/encore/specs_planning/_internal/agent-mistakes.md` — filter ALL-* + OWNER-* entries
   relevant to hook edits and doctrine-instantiation patterns.
4. Read `.claude/context/patterns.md` — match decision-tree patterns to uplink-wire subtasks.
5. LR scan: LR-040, LR-048, LR-064, LR-069, LR-070, LR-020 (free-number verify for any new rules),
   LR-046 (Adjacent-Sweep recipient discipline).
6. **Browser-tool announcement**: `BrowserTool=none` — this subplan edits framework rules/hooks
   only; no live website interaction.

---

## Phase 1 — Wave-2 uplink expansion instances (C1–C4 + B3)

Each item below is transcribed verbatim from `plans/pending/PLAN_UPLINK_PROTOCOL.md` line 139,
then expanded with the concrete handoff, leak, and pre-assume ASK + assumptions-disposition to add.

---

### C1 — LR-064 Tiered Delegated Walk (`.claude/rules/inventory.md`)

**Verbatim source**: *LR-064 Tiered Delegated Walk (`.claude/rules/inventory.md` — the DEFAULT
walk; worker gets exact inputs+oracle, has post-hoc `anomaly:` only; add a pre-assume ASK so
Stage-3 verify stops paying rework).*

**The handoff**: Opus orchestrator → Haiku/Sonnet worker via tiered-delegated-walk (`worker ladder`
in `CLAUDE.md`). Worker receives exact inputs + oracle; its only post-hoc uncertainty channel is
`anomaly:` in the result doc.

**The leak**: No pre-flight assumptions-disposition. Worker may assume field-type classification,
selector stability, or cascade behavior; those assumptions bake into the evidence; Stage-3 verify
pays rework when they are wrong.

**Work items**:
1. Add a pre-assume ASK block to the worker prompt template in `LR-064` / `.claude/rules/inventory.md`
   (wherever the tiered-walk dispatch instruction lives). The block must ask: field type if ambiguous,
   selector source (live DOM vs stale PO), cascade expectations for dependent fields.
2. Add an `## ASSUMPTIONS-MADE` section to the worker's result-doc schema so Stage-3 verify can
   inspect assumptions before accepting evidence.
3. Wire a machine-check: if result-doc lacks `## ASSUMPTIONS-MADE` section → Stage-3 treat as
   anomaly flag (not a hard HALT — soft fail first, measure frequency in Phase 7 telemetry).

---

### C2 — /rca mama↔Subagent-B (`check-rca-verdict.mjs` ~:174)

**Verbatim source**: */rca mama↔Subagent-B (`check-rca-verdict.mjs` ~:174 verifies spawning,
never assumption-surfacing).*

**The handoff**: mama Opus → Subagent-B (cheaper model) for evidence-gathering phases of RCA.
`check-rca-verdict.mjs` at ~:174 verifies that a sub-agent was spawned; it does NOT verify that
the sub-agent surfaced its assumptions.

**The leak**: Subagent-B may assume error context, log structure, or scope; mama accepts its
evidence and closes the RCA without knowing which assumptions baked in.

**Work items**:
1. Read `check-rca-verdict.mjs` lines ~160–200 to confirm the exact verdict-parse logic and what
   fields are currently validated.
2. Add an `ASSUMPTIONS_SURFACED` field check to `check-rca-verdict.mjs`: if the sub-agent's result
   lacks `## ASSUMPTIONS-MADE`, the verdict-checker emits a `WARN: assumptions-not-surfaced` log
   line (non-blocking first wave; escalate to FAIL after Phase 7 baseline confirms the field is
   being populated reliably by Subagent-B's prompt).
3. Update the `/rca` SKILL.md Subagent-B dispatch prompt to include an `## ASSUMPTIONS-MADE`
   section requirement mirroring the C1 schema.

---

### C3 — /execute Adjacent-Sweep SPAWN prompts

**Verbatim source**: */execute Adjacent-Sweep SPAWN prompts.*

**The handoff**: OWNER /execute orchestrator → spawned task-tool sub-agent via Adjacent-Sweep
`SPAWN` path (`plans/pending/_TEMPLATE_SUBPLAN.md` Phase 2.5). The spawned sub-agent is
single-turn, headless, cannot clarify mid-run.

**The leak**: SPAWN prompt carries the adjacent fix's intent and acceptance criteria, but no
structured CLARIFY block or `## ASSUMPTIONS-MADE` requirement. Sub-agent bakes assumptions about
codebase state, naming conventions, or scope; the parent orchestrator never sees them at acceptance.

**Work items**:
1. Update the SPAWN-path instructions in `.claude/skills/execute/SKILL.md` (and any adjacent-sweep
   template) to require: (a) a `## CLARIFY` preamble listing known ambiguities the spawned agent
   must resolve via code inspection before acting, (b) an `## ASSUMPTIONS-MADE` section in the
   spawned agent's Parity Report.
2. Update the `/execute` Adjacent-Sweep acceptance step: before accepting a SPAWN result, check
   that the Parity Report contains `## ASSUMPTIONS-MADE`; if absent, treat as incomplete Parity
   Report (same class as missing `## BLOCKERS_DEVIATIONS`).

---

### C4 — /ultra-agents direct fanout

**Verbatim source**: */ultra-agents direct fanout.*

**The handoff**: OWNER orchestrator → N parallel task-tool workers dispatched via `/ultra-agents`
direct fanout. Workers are single-turn, headless, cannot clarify mid-run (same substrate as
copilot workers: `--no-ask-user` equivalent).

**The leak**: Fanout prompt carries the worker's ticket but no CLARIFY-class hook. Each worker
operates independently; assumptions from different workers can conflict; the orchestrator's
consolidation step may merge conflicting assumptions without surfacing the conflict.

**Work items**:
1. Update `.claude/skills/ultra-agents/SKILL.md` worker-dispatch template to include a CLARIFY
   section: items the worker MUST resolve (grep / read) before touching code, listed explicitly
   by the orchestrator based on known ambiguities.
2. Add to the ultra-agents consolidation step: before merging worker Parity Reports, diff their
   `## ASSUMPTIONS-MADE` lists; if two workers made conflicting assumptions on the same item,
   HALT + surface to Rutvik (do not silently pick one).
3. Update `worker-ext.md` PROTECTED-files section to note the ASSUMPTIONS-MADE consolidation
   requirement for fanout dispatches.

---

### B3 — Claude→Task-tool subagents

**Verbatim source**: *Claude→Task-tool subagents (largely suppressed by ua-worker-guard.mjs —
VERIFIED PRESENT at `~/.claude/hooks/`, 6741 bytes; the gpt coverage map's "phantom" claim was a
false positive, its sandbox could not read `~/.claude/`). Wave-2 fires after Phase 7 calibration
proves the wave-1 shape.*

**The handoff**: Claude orchestrator → task-tool sub-agent (inline `task` MCP call, not a
copilot-worker dispatch). These are single-turn; `ua-worker-guard.mjs` already suppresses the
worst over-delegation (VERIFIED PRESENT). The gap is assumption-surfacing, not volume control.

**The leak**: `ua-worker-guard.mjs` guards AGAINST over-delegation but does not require the
sub-agent to surface assumptions in its result. The guard's 6741-byte body (verified 2026-07-12)
focuses on dispatch gating; post-result validation of `## ASSUMPTIONS-MADE` is absent.

**Work items**:
1. Confirm current `ua-worker-guard.mjs` guard logic (read the file; do not assume from byte-count
   alone). Identify where the post-result hook would slot in.
2. Add a post-result lint step (new mjs or extension of existing guard): if the task-tool sub-agent
   result lacks `## ASSUMPTIONS-MADE`, emit `WARN: task-subagent-assumptions-not-surfaced` to the
   delegation log. Non-blocking in wave-2 (soft warn); escalate to FAIL after Phase 7 telemetry
   confirms base rate.
3. Update the `Sub-Agent Rule` section in `CLAUDE.md` (the "Sub-Agent Rule" block that governs
   inline task-tool spawns) to explicitly require `## ASSUMPTIONS-MADE` in every Parity Report.

---

## Per-Identity Satisfaction

This subplan is an OWNER-identity documentation + framework-wire authoring task. It does NOT
produce, modify, or delete `.spec.ts`, `test-cases/*.md`, `test-plans/*.md`, XLSX deliverable,
`field-case-catalogs/*.md`, `field-inventories/*.md`, `REQUIREMENTS.md`, `agent-mistakes.md`, or
`old-site-baseline/*.md` artifacts. Per LR-048 v3, all pipeline-identity rows are `(none)` —
explicit, not silent.

| Identity | Owned artifact this subplan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| HUNTER | (none) | (none) | (none) |
| GIVER | (none) | (none) | (none) |
| BUILDER | (none) | (none) | (none) |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | (none) | (none) | (none) |
| GARDENER | (none) | (none) | (none) |
| OWNER | `.claude/rules/inventory.md` (C1 worker-prompt + assumptions schema)<br>`pipeline/hooks/check-rca-verdict.mjs` (C2 assumptions-surfacing check)<br>`.claude/skills/rca/SKILL.md` (C2 Subagent-B prompt update)<br>`.claude/skills/execute/SKILL.md` (C3 SPAWN prompt requirements)<br>`.claude/skills/ultra-agents/SKILL.md` + `worker-ext.md` (C4 fanout CLARIFY + consolidation)<br>`~/.claude/hooks/ua-worker-guard.mjs` (B3 post-result lint) | Per-file edits to the above 6 paths | `node --check` clean on each edited mjs; grep confirming each ASSUMPTIONS-MADE requirement present |

---

## Acceptance criteria

- [ ] **C1**: `inventory.md` / LR-064 dispatch instruction contains a pre-assume ASK block
  requiring field-type, selector-source, and cascade-expectation resolution; result-doc schema
  requires `## ASSUMPTIONS-MADE`; Stage-3 soft-fail logic for missing section present and
  grep-verifiable.
- [ ] **C2**: `check-rca-verdict.mjs` emits `WARN: assumptions-not-surfaced` when result lacks
  `## ASSUMPTIONS-MADE`; `/rca` SKILL.md Subagent-B prompt requires the section.
- [ ] **C3**: `/execute` Adjacent-Sweep SPAWN path requires CLARIFY preamble + `## ASSUMPTIONS-MADE`
  in spawned agent Parity Report; acceptance step checks for its presence.
- [ ] **C4**: `/ultra-agents` worker-dispatch template includes CLARIFY section; consolidation step
  diffs ASSUMPTIONS-MADE lists and HALTs on conflict; `worker-ext.md` notes the requirement.
- [ ] **B3**: `ua-worker-guard.mjs` post-result lint emits `WARN` on missing `## ASSUMPTIONS-MADE`;
  `CLAUDE.md` Sub-Agent Rule block requires the section in every Parity Report.
- [ ] All 5 instance IDs (C1, C2, C3, C4, B3) grep-verifiable in this file.
- [ ] `node --check` clean on every new/edited `.mjs` file.
- [ ] `/regression-guard` snapshot BEFORE + AFTER = CLEAN on hook/script edits.
- [ ] Activity-log row appended per LR-028 with LR-037 timestamp ≥ all touched-file mtimes.
- [ ] `/final-q` verdict block emitted (GREEN | YELLOW | RED) per LR-042.

---

## Verification

```bash
# All 5 instance IDs present in this file
grep -E "\*\*(C1|C2|C3|C4|B3)\*\*" plans/pending/SUBPLAN_UPLINK_WAVE2.md
# expect: 5 lines (one per ID)

# File exists at canonical path
Test-Path plans/pending/SUBPLAN_UPLINK_WAVE2.md
# expect: True

# node --check after mjs edits (run per-file at execution time)
node --check pipeline/hooks/check-rca-verdict.mjs
# expect: (no output = clean)
```

---

## Handoff

Wave-2 instances C1–C4 and B3 are now carried in a valid LR-040(b) recipient file
(`plans/pending/SUBPLAN_UPLINK_WAVE2.md`), unblocking PLAN_UPLINK_PROTOCOL's Status flip to DONE
at Phase 7 closure. This subplan is PENDING and gates on Phase 7 calibration; it does not execute
now. When Phase 7 completes, the next session inherits: parent plan verified DONE, this subplan
PENDING, and five concrete work items with pre-defined handoffs, leak descriptions, and
assumptions-surfacing wire designs ready for implementation.
