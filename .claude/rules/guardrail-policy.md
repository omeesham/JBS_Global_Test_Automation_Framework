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
| **S0** | Irreversible or trust-destroying: client-facing leak (IP / secrets / internal vocab), data destruction, fabricated evidence or false-green shipped | **0 — gate on FIRST occurrence** | Write-time PreToolUse **deny** AND local `.githooks` pre-commit/pre-push gates (the floor for any git user with hooks installed) [NOT-WIRED-BY-DESIGN: client removed GitHub Actions — no server-side CI exists; local hooks + Claude-layer denies are the real floor] | Slowness accepted; still path-scoped |
| **S1** | High: silent quality drift that survives to commit/ship — MD↔spec parity drift, DONE-flip on red tests, silent skip/rescope, closure without evidence | **1 — announce on first, deny on second confirmed** | PreToolUse or pre-commit gate landing in `announce`, ramped per §3.3 | PreToolUse ≤200ms typical; ≤2s of the pre-commit budget |
| **S2** | Medium: recurring craft defects later layers usually catch — flake anti-patterns, weak assertions, missing waits | **3 — the existing 3× graduation** | Commit-time detective, warn → `--enforce` once its suite is clean; PREFER extending an existing check script over adding a new gate | Whole pre-commit ≤20s wall |
| **S3** | Low / heuristic / false-positive-prone: judgment calls, style, anything whose mechanical check would false-positive | n/a | **Prose LR rule only**, with an explicit "deliberately no gate" note (LR-068 precedent) | Zero runtime |

Severity is assigned at capture time by the agent logging the mistake (via `/reflect` Step 2) and re-checked at nomination; classification disputes HALT-and-ask. An under-classification found by any later audit (WATCHDOG, `/audit`, owner) is **itself an S1 mistake** with its own `agent-mistakes.md` row.

### §3.2 — Per-task mistake collection (forced, not voluntary)

- **`/reflect` Step 2**: the 6-trigger mistake table carries a mandatory `Sev` column (per §3.1). Every fired trigger appends an `agent-mistakes.md` row with the Sev tag + a one-line classification rationale in the SAME session — no batching to "later". Under-classification by any later audit is itself an S1 mistake (§3.1 final sentence — not duplicated here).
- **`/final-q`**: mandatory attestation block — `**Mistakes this session:** <N> (IDs + Sev)` or `**Mistakes this session:** none — 6 triggers checked`. Missing block floors the verdict to YELLOW.
- **Stop-hook backstop** (`mistake-ledger-gate.sh`, announce mode): detects mutating sessions ending without either token; persists to `.claude/state/mistake-ledger-warnings-<sid>.json`. Both `/final-q` and `/audit` read this state file for verdict-flooring. A Stop hook cannot veto (LR-060 precedent) — it makes silence visible; the skill layer makes it a verdict problem.

### §3.3 — Ramp discipline (never straight to deny for S1)

1. **S0 is the sole deny-on-landing exception** — blast radius bounded by tight path-scoping. The floor is the local `.githooks` chain (pre-commit + pre-push) plus Claude-layer PreToolUse denies [NOT-WIRED-BY-DESIGN: client removed GitHub Actions — no server-side CI exists].
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

> **⚠ PARTIALLY-WIRED (2026-07-13 flagged; updated 2026-08-03):** the shared helper `fireTelemetry(gate, verdict, target)` is implemented and exported at `.claude/hooks/lib/hook-utils.mjs:102`. LIT/DARK state as measured across all gate libs (source: `grep -rn fireTelemetry .claude/hooks/lib/`):
>
> | Gate | Status | Detail |
> |---|---|---|
> | `check-md-first.mjs` | **LIT** | own inline helper (not shared); fires on deny/announce (line 202) |
> | `check-client-surface-size.mjs` | **LIT** | shared helper; announce branches (lines 210, 222) |
> | `check-client-surface-write.mjs` | **LIT** | shared helper; deny + announce branches (lines 125, 139, 157, 173, 196, 227, 232) |
> | `check-bug-baseline.mjs` | **LIT** | shared helper; deny branch (line 183) |
> | `check-identity-switch.mjs` | **LIT** | shared helper; announce (line 145) + deny branches (lines 295, 307) |
> | `check-plan-closure.mjs` | **LIT** | shared helper; deny + announce branches (lines 91, 213, 269, 273, 291, 376) |
> | `check-todo-injection.mjs` | **LIT** | shared helper; deny branch (line 721) |
> | `check-execution-completion.mjs` | **LIT — SOFT-COMPLETE** | Stop hook; only reachable verdict is `warn` (line 236); structurally cannot deny — demotion-review "0 deny-fires" trigger does not apply |
> | `check-rca-verdict.mjs` | **LIT — SOFT-COMPLETE** | Stop hook; only reachable verdict is `warn` (line 192); structurally cannot deny — demotion-review "0 deny-fires" trigger does not apply |
> | `check-browsertool.mjs` | **DARK** | can deny; no telemetry wired — demotion review runs on incomplete signal |
> | `check-graft-ship.mjs` | **DARK** | can deny; no telemetry wired — demotion review runs on incomplete signal |
> | `check-jargon.mjs` | **DARK** | can deny; no telemetry wired — demotion review runs on incomplete signal |
> | `check-no-verify.mjs` | **DARK** | can deny; no telemetry wired — demotion review runs on incomplete signal |
> | `check-mistake-ledger.mjs` | **DARK** | announce-only Stop hook; no telemetry wired (prior LIT claim in this doc was incorrect — grep finds zero `fireTelemetry` calls) |
>
> **SOFT-COMPLETE** = gate fires on its only reachable verdict; it cannot deny, so the "0 deny-fires in 90 days" demotion trigger does not apply. **DARK** = gate can deny (or announce) but fires no telemetry — these are real gaps where the demotion review runs on incomplete signal and could wrongly retire a live gate. The 5 DARK gates above remain unwired; wiring each is per-gate work outside this doc. Surfaced by a cross-family gap-hunt debate; evidence in `decision-debates.jsonl` (2026-07-13 entry).

**Demotion review** (at `/compile-learnings` cadence, reading `gate-fires.log`):
- deny-gate with 0 fires in 90 days AND no class recurrence → demote to `announce`
- announce-gate with 0 fires in 90 days → demote to prose-only LR rule
- ≥3 confirmed false positives in 30 days → demote + fix or delete the gate
- Dead gates (the 3 vendor-fresh no-ops in `.githooks/` are the standing example) get deleted

Direction of trust: gates exist to make quality CHEAP, not to make work slow — when a class stops recurring, its gate must shrink with it.

### §3.5 — Recurrence convicts the prior fix (owner doctrine 2026-07-17)

When a failure class RECURS in an area that already carries a "permanent" fix (rule, gate, HARD STOP,
taxonomy mandate), the incident response MUST start by putting the PRIOR fix on trial — it is the
prime suspect, most likely slop. Mandatory three-question trial before any new mechanism lands:
(1) what did the old fix do to prevent this class; (2) why did it fail to prevent THIS instance
(enum: `scoped-wrong` | `prose-not-mechanism` | `rubber-stampable` | `dead/never-fired` |
`different-sub-class`); (3) what will the new mechanism do differently. Verdict per prior fix:
`SURVIVES` (genuinely different sub-class — keep) or `CONVICTED`. **A CONVICTED fix is rewired into a
machine-enforced form or RETIRED-AND-REMOVED in the same change — never left idling as sediment**
(dead harness wastes time, effort, and accumulates non-working slop; removal is part of the fix, per
the §3.4 dead-gate deletion posture and LR-050 in-scope-cleanup). **Layering a new fix on top of an
unconvicted-but-failed old fix is FORBIDDEN.** Record the trial verdicts in the incident's RCA/plan.
Enforcement companions: `/rca` Prior-Fix Trial phase (mandatory section on recurrence-class RCAs),
`/planning` Step 3 recurrence gate (HALT without a trial section), and the machine closure-check per
`plans/pending/SUBPLAN_GUARDRAIL_RAMP_PROMOTIONS.md` (custodian; trial subplan closed 2026-07-29, ramp promotion outstanding). *Graduating incident*: 2026-07-17 Override
walk gaps — LR-062/LR-064/FCC-taxonomy/walk HARD STOPs all existed and none fired (landing-page-only
denominator, rubber-stampable prose mandates, no machine checking assertions).

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

## LR-071: Human-Catch Reflex routing — named hand-off for both residual classes

**Purpose**: This rule documents where a human's answer goes when the interaction-coverage checker fires on a residual it cannot resolve autonomously. **This is a documented route, not an enforced mechanism** — it makes the hand-off explicit and auditable; it does not force anyone to follow it.

**The route is surfaced at the moment of failure**: both FAIL `reason:` strings in `scripts/check-interaction-coverage.mjs` end with `See .claude/rules/guardrail-policy.md §LR-071 for resolution steps.` — `unclassified-element` at line 266, `claim-census` at line 817. Self-test: 189/189.

**Sev**: S1 — both residuals emit a FAIL verdict that blocks map closure; an unresolved FAIL that reaches a DONE-flip is silent quality drift surviving to commit/ship. **Graduating incident**: 2026-07-30 — Human-Catch Reflex detection existed in `check-interaction-coverage.mjs`; named routing did not (PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION criterion 9).

### §LR-071.1 — Residual 1: Unclassifiable control

**Trigger**: sub-check `unclassified-element`, verdict `FAIL`
Source: `scripts/check-interaction-coverage.mjs` lines 258–267
Reason string (verbatim): `UNCLASSIFIED VIOLATION: ${unclassifiedEls.length} element(s) carry UNCLASSIFIED — unclassifiable controls block closure; each must be resolved before this map closes: [${unclassifiedEls.join(', ')}] See .claude/rules/guardrail-policy.md §LR-071 for resolution steps.`

**Recipient**: `scripts/walk-coverage/drone-probes.mjs` — the `PROBE_DEFINITIONS` export at line 26.

**The edit**: add one new entry to the `PROBE_DEFINITIONS` object, covering the new control **class** (not the single instance that triggered the reflex). Copy the shape of an existing entry exactly:

```js
'<new-class-name>': {
  class: '<new-class-name>',
  requiredActions: [
    'record-baseline: <what to observe before acting>',
    '<verb-noun>: <deterministic playwright-cli action>',
    'assert: <criterion that proves effect occurred>',
  ],
  effectObservable: '<what delta proves the control did something>',
  zeroEffectProtocol: '<what emits on zero-delta — DIFFERENTIAL-DATA-REQUIRED or DATA-BLOCKED + unlock hint>',
  emissionContract: 'PROBED with effectObserved:boolean …',
},
```

The key set of `PROBE_DEFINITIONS` is the metamodel vocabulary. Existing **control-class** keys (9 of 12): `filter`, `sort`, `pagination`, `editable-cell`, `guard`, `io`, `menu-disclosure`, `add-picker`, `context-selector`; the remaining 3 keys (`claim-census`, `count-source`, `ui-vs-persisted-parity`) are Cross-Check Kernel verification oracles (not UI control classes) and are not extended by this route. Adding one entry here is the class-level extension the recurrence law requires — the entire class is covered, not one instance.

**Proof it took**: `node scripts/check-interaction-coverage.mjs --self-test` passes; re-running the checker on the map that fired the reflex shows `unclassified-element: PASS`. The class never needs a human twice: it is now in `PROBE_DEFINITIONS` and future instances are classifiable without human input.

### §LR-071.2 — Residual 2: Undocumented intent

**Trigger**: sub-check `claim-census`, verdict `FAIL`
Source: `scripts/check-interaction-coverage.mjs` lines 810–818
Reason string (verbatim): `CLAIM-CENSUS VIOLATION: ${claimEls.length} element(s) carry claim-sourced dispositions with no valid census evidence — external claims must be verified against machine-readable data before steering a disposition: [${claimEls.map(e => e.elementId || '(unknown)').join(', ')}] See .claude/rules/guardrail-policy.md §LR-071 for resolution steps.`

**Recipient**: the interaction-map JSON file for the affected surface — the file whose element carries `basis: "claim:…"`.

**The edit**: the human adjudicates which side of the disagreement is correct, then adds a `census:` entry to the same map:

1. Create or locate an evidence artifact (walk log, Jira export, or plain-text domain note) that captures the adjudicated truth and mentions the claim subject by name. File format is not constrained — the oracle binds by token overlap between artifact content and claim subject.
2. Add one element row to the map with `basis: "census:<relative-path-to-artifact>"`. The artifact must exist on disk and its content must mention at least one token from the claim subject (the oracle validates this at line 825 of the checker).
3. If the adjudicated rule is a business rule that applies across surfaces, also add it to the domain-invariant input corpus managed by SUBPLAN_GUARDRAIL_ROLE_PARTITION_ORACLE.md Phase 4. If that subplan has not landed, record the rule in the nearest surface's walk artifact until it does.

**Proof it took**: re-running the checker on the affected map shows `claim-census: PASS`. The domain rule is now machine-readable; future surfaces that exercise it are covered without further human adjudication.

**Trigger**: any attempt to close or flip-DONE an interaction-map that produces a FAIL verdict on `unclassified-element` or `claim-census`.

**Graduated from**: PLAN_FORCED_DISCOVERY_LOCATOR_EXHAUSTION criterion 9 (2026-07-30). Cross-refs LR-069 §3.5 (recurrence convicts — on first human touch, recurrence law triggers the edit above), LR-070 (uplink law — human adjudicates, never finds).

---

## LR-074: Every delegated dispatch must be visible to the owner as it happens

**Sev S0.** A worker run the owner cannot see in Claude Code is indistinguishable from a worker run the agent chose to hide. Intent does not enter into it: the *capability* to run work invisibly is itself the defect, because it makes every "I dispatched N workers" claim unverifiable. Gate on first occurrence.

### §74.1 — The law

Every Copilot dispatch runs through the canonical wrapper (`.claude/skills/ultra-agents/copilot-worker.sh`), in the **foreground of a tracked tool call**, so the command, its run-id, and its completion all land in the transcript the owner reads. Backgrounding through the harness's own tracked mechanism is visible and therefore allowed; backgrounding that detaches the process from the harness is not.

Forbidden, without exception: detachment primitives (a surviving unquoted `&`, `nohup`, `setsid`, `disown`, `coproc`, `screen -dm`, `tmux new -d`, `schtasks /create`, `at`, node `detached:true`, python `start_new_session=True`, PowerShell `Start-Process` / `Start-Job` / `-WindowStyle Hidden` / `Invoke-Command -AsJob`, `cmd /c start`, `wsl.exe` trampolines); invoking the `copilot` CLI directly, bypassing the wrapper that writes the ledger row; any launcher construct whose purpose is to put a dispatch behind one more layer of indirection; and editing the gate, its libraries, or `.claude/settings.json` to weaken any of the above. Those control files are self-protected: changing them requires the owner's in-chat GO **plus** a `SELF_GRANT` the owner writes. Claude cannot author its own grant — the grant file is itself gate-protected, and that is deliberate.

### §74.2 — One layer, because the other one was never going to work

**Detective (live)** — `.claude/hooks/visibility-reconcile.sh` + `.claude/hooks/lib/check-visibility-reconcile.mjs`: a Stop hook matching each dispatch-ledger row for the session against the visible tool calls, one-to-one by `run_id`, reporting any row with no corresponding visible call.

**Preventive (built, then removed 2026-08-14)** — a PreToolUse deny on the constructs above once lived at `.claude/hooks/dispatch-visibility-gate.sh` + `.claude/hooks/lib/check-dispatch-visibility.mjs`. Six adversarial review rounds each produced a fresh bypass — a PowerShell character-code array carrying no literal dispatch string, then `echo hi && copilot`, then env-assignment prefixes, subshells, backticks, `$(…)`, `eval`, `bash -c`, `timeout` — while the same matcher kept refusing ordinary read-only work. Pattern-matching an unbounded command language leaks by construction. It was unwired by owner directive and deleted; only the module's shared tokenizer survives, because the Stop hook imports it.

Two facts about that removal, so nobody rebuilds it: a PreToolUse hook inspects **Claude's own tool calls**, and a dispatched worker is a separate process that never reaches it — so this layer never protected a file from a worker in the first place (proven the same day: a worker overwrote `.claude/settings.json` while the gate was wired). And reconciliation does not care how a command was spelled, which is why the surviving layer is the one that scales. **Extend the detective layer. Do not resurrect the matcher.**

### §74.3 — Deny what you cannot parse

Six rounds of naming constructs and being beaten by the next ones convicted the enumerate-and-patch approach. The default is inverted instead: the module declares which shell forms it parses with confidence, and treats the rest — heredoc bodies, `eval`, backticks, `$( … )`, subshells, `xargs`, `case`, and the launcher forms `env` / `nice` / `timeout` / `sudo` / `bash -c` / `sh -c` — as **unmodeled**. An unmodeled context that also mentions a dispatch token is denied, naming the construct; one that does not is allowed, so ordinary `$(date)` and `timeout 60 npm test` keep working. On the detective side the mirror applies: a wrapper invocation found inside an unmodeled context never counts as a visible dispatch. The deny set becomes "what I cannot read", not "what I have thought of", and that converges.

Two supporting invariants, each of which failed at least once before being made structural: every path decision funnels through a single `canonicalizePath`, and every executable decision through a single `executableOf` over ALL statements of a quote-aware split. Structural tests fail the suite if a second normalization site appears or a detector derives an executable by any other route. Those tests are the anti-recurrence mechanism — a fix without one returns.

### §74.4 — The residual, stated plainly

Direct process creation outside the wrapper — a launch whose command is assembled at runtime from character codes or base64 — writes no ledger row and carries no readable name, so neither layer sees it. **Neither layer may be described as complete on its own, and the pair may not be described as closing the class.** Two layers make hiding hard and leave a trail; they do not make it impossible. Any future edit that claims otherwise in a comment, a report, or a rule is wrong.

**Trigger**: authoring or modifying any dispatch path, hook, or delegation wrapper; any command that would start a worker; any edit to the gate files or to `.claude/settings.json`.

**Graduated from**: owner directive, 2026-08-14 — *"i dont want claude to run copilot in a way i wont ever know and notice on how its run.... it would be a deceptive fooling technique"* — hardened across six opus-vs-gpt review rounds under PLAN_67. Cross-refs LR-069 §3.1 (S0 gates on first occurrence) and §3.5 (recurrence convicted per-site patching three times, forcing the single-funnel rewrite, the shared tokenizer, and the inverted default).
