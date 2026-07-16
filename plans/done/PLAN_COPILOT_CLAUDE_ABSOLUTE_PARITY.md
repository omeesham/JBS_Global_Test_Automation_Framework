# PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY — Copilot workforce replicates EVERYTHING Claude has on this PC

**Status**: DONE
**Executed**: 2026-07-16
**Priority**: P0-EMERGENCY
**Created**: 2026-07-12
**Identity**: OWNER
**Model**: claude-opus-4-8
**Thinking**: max
**Justification**: multi-system doctrine synthesis across the entire Claude+Copilot control surface + innovation-class injection-system design — max-tier judgment work.
**PermissionMode**: auto
**BrowserTool**: none

---

## Context — the vision (Rutvik, 2026-07-12, verbatim intent)

Until now Claude was the driver with access to everything (skills, rules, hooks, memory, MCP, injections); Copilot sat idle. Under the takeover, Copilot does everything and Claude makes it do — but Copilot does NOT yet have everything Claude has (proven: workers have no Skill tool, no skill/rule/memory injection). The mission:

1. **Whatever Claude can do, Copilot IS FORCED TO REPLICATE.** Every worker behaves as if it is Claude, working for the real Claude.
2. The **injection Claude gets** (UserPromptSubmit keyword→LR-rule/skill scan, SessionStart primers, auto-memory, CLAUDE.md, path-scoped rules) **must be replicated for ALL agents** — dynamically, per-dispatch.
3. Skills are NOT to be run by Claude for this mission — their **methodology is injected into the worker tickets** (already done for wave 1: /research, /review, /find-bugs methodologies are cited in ticket DOCTRINE fields).
4. Scope covers **everything Claude and Copilot touch on this PC** — repo + `~/.claude/**` + `~/.copilot/**` (mirrored into repo staging for repo-confined workers).
5. While researching, **find bugs with proof** in the already-implemented delegation stack.
6. One agent was **already commissioned for "skills access to Copilot"** — find that work (wave-1 sweep ticket does), extend it, never duplicate it.
7. Claude authors the FINAL injection-system doctrine itself (innovation law / worker-ext CLAUDE-ONLY #9); workers feed evidence + drafts.

## Orchestration state (what Fable already did)

- Staged outside-repo control surface → `.claude/state/parity-staging/home/` (claude: settings/hooks/delegation/memory; copilot: agents). **Re-run the staging block below if `find .claude/state/parity-staging -type f | wc -l` is 0.**
- Authored 6 tickets in `~/.claude/delegation/tickets/`:
  - **Wave 1 (dispatched, background, council-worker/sonnet-4.6, --work-type research)**:
    - `TICKET-parity-claude-inv.md` → run-id `parity-claude-inv` → `.claude/state/parity-recon/CLAUDE_CAPABILITY_INVENTORY.md`
    - `TICKET-parity-copilot-inv.md` → run-id `parity-copilot-inv` → `.claude/state/parity-recon/COPILOT_WORKER_RUNTIME_INVENTORY.md`
    - `TICKET-parity-plans-sweep.md` → run-id `parity-plans-sweep` → `.claude/state/parity-recon/PLANS_AND_INFLIGHT_MAP.md`
    - `TICKET-parity-bughunt.md` → run-id `parity-bughunt` → `.claude/state/parity-recon/DELEGATION_STACK_BUGS.md`
  - **Wave 2 (council-planner/opus-4.6)**:
    - `TICKET-parity-gap-matrix.md` → `PARITY_GAP_MATRIX.md` — **DONE** (52-row matrix, run `parity-gap-matrix`; verified inline by Opus during synthesis)
    - `TICKET-parity-inject-draft.md` → **HELD / SUPERSEDED** — NOT dispatched. Reason (Opus CEO call): the injection-design core is innovation-class (non-delegable, worker-ext CLAUDE-ONLY #9); AND a foreign session's `worker-skills-design-v2-0712` is actively revising the skills-routing core (RED-verdicted v1). Dispatching a competing opus inject-draft would collide + duplicate. Opus authored the design directly instead → `SUBPLAN_PARITY_INJECTION_SYSTEM.md`.

## WAVE-2 RESULTS + SYNTHESIS (Opus, 2026-07-12)

- **PARITY_GAP_MATRIX.md** — 52 capabilities classified. Thesis: **the injection system is entirely DISPATCHER-SIDE** — Claude runs the same `run-relevant-scan.mjs` at ticket-write time and injects matched rules/skills/memory into the ticket; workers need routing+verification, not a Skill tool. Top-3 P0 gaps: keyword→rule injection (row 6), path-glob→DOCTRINE auto-populate (row 7), LR-rule scan (row 28). 20 capabilities deliberately NOT replicated (CEO-side).
- **v1 skills plan RED verdict** (worker-skills-review-0712) — key finding: `run-relevant-scan.mjs` caps skills at 4 + forces `matchType:"INFORM"`, so any DIRECT/INFORM branching needs a NEW ticket-mode scanner first; UW-5 placement used undefined `$LOG_DIR`; `/relevant` omitted from classification. All folded into the design as hard constraints.
- **v2 skills-design STILL IN-FLIGHT** (foreign session, slot-314, opus-max) — owns the skills-routing sub-component. My design integrates it, does NOT re-author it; HARD no-clobber constraint on shared control files until v2 lands.
- **Authored (Opus, innovation-core):**
  - [SUBPLAN_PARITY_INJECTION_SYSTEM.md](SUBPLAN_PARITY_INJECTION_SYSTEM.md) — 3 dispatcher-side mechanisms (M1 path-glob→DOCTRINE, M2 ticket-mode scanner + rule/memory inject, M3 worker-rules-extract preamble) + verification layer + v2 reconciliation. GATED.
  - `plans/done/SUBPLAN_PARITY_BUGFIXES.md` — **DONE 2026-07-16**, 10 verified bugs fixed (2 refuted untouched): wrapper batch + uplink hardening (19/19) + gate v5 riders (PBUG-08 telemetry live in gate-fires.log from both gates, PBUG-09 identity-last); grants superseded by direct owner in-chat authorization.

**DECISION SURFACE FOR RUTVIK (the only things needing you):**
1. Go/no-go on protected-file edits (wrapper, gates, DUTY_STACK, agent briefs) + issue SELF_GRANTs — nothing implements without this.
2. Confirm v2 owns skills-routing (my design integrates it) vs re-scoping it under the parity plan.
3. Priority of this vs ASSISTANT_LAYER + UPLINK Phase 7 (all P0 delegation plans).

## WAVE-1 RESULTS (Opus, 2026-07-12 — all green)

All 4 recon deliverables landed, cross-family reviewed (gpt-5.5), and defects bounced+fixed. All 3 inventories now clean-verified; `.gitignore` guards `parity-staging/` + `parity-recon/` (SECRET-tier).

- **CLAUDE_CAPABILITY_INVENTORY.md** — clean (bounce fixed §9 citations + path prefixes + bare settings.json).
- **COPILOT_WORKER_RUNTIME_INVENTORY.md** — clean (bounce fixed stale 492→539 line count + reclassified routing-policy.json as dispatcher-side). **KEY NUMBER**: of 18 Claude context layers the worker gets 1 PRESENT · 4 PARTIAL · 2 N-A · **11 MISSING** — the 11 MISSING are the parity target.
- **PLANS_AND_INFLIGHT_MAP.md** — clean (bounce fixed ULTRA_AGENTS done→pending + added AUDIT_REMEDIATION row). **Skills-access work CONFIRMED FOUND**: `worker-skills-design-0712` → draft `PLAN_WORKER_SKILL_ROUTING` (classifies all 33 skills TRANSFERABLE(10)/CLAUDE-ONLY(23) + reuses `run-relevant-scan.mjs`). A `worker-skills-design-v2-0712` run is ALSO active in a parallel session — the parity injection design must EXTEND, not collide. Do NOT dispatch conflicting edits to worker-ext.md / copilot-worker.sh / agent briefs while v2 is in flight.
- **DELEGATION_STACK_BUGS.md** — 12 findings → adversarial refute-review (gpt-5.5) → **10 REAL, 2 REFUTED** (PBUG-05 UW-3-absent + PBUG-10 parse-verdict-regex both false alarms). Verified real: 2×S1 (PBUG-01 missing-`## ASK` silent-pass; PBUG-08 delegation-gate + ua-worker-guard missing LR-069 §3.4 gate-fires telemetry), 5×S2 (PBUG-02 sleep-1 flush race, PBUG-04 unescaped JSON in ledger, PBUG-06 overflow invalid-JSON untested, PBUG-09 identity first-vs-last, PBUG-12 dead config keys stall_guard_mode/uplink_mode), 3×S3 (PBUG-03/07/11 minor). **Most fixes touch PROTECTED control files → GATED on Rutvik in-chat go + SELF_GRANT** → to become `SUBPLAN_PARITY_BUGFIXES.md`.

Review verdicts (for scorecard record at handoff): parity-claude-inv-review=MATERIAL_ISSUES, parity-copilot-inv-review=MATERIAL_ISSUES, parity-plans-sweep-review=MATERIAL_ISSUES (all remediated via bounce), parity-bughunt-verify=PARTIAL (10/12 real).

### Staging block (idempotent — re-run if empty)
```bash
mkdir -p .claude/state/parity-staging/home/claude/hooks .claude/state/parity-staging/home/claude/delegation/tickets .claude/state/parity-staging/home/copilot/agents .claude/state/parity-staging/home/claude/memory .claude/state/parity-recon
cp ~/.claude/settings.json ~/.claude/CLAUDE.md ~/.claude/keybindings.json .claude/state/parity-staging/home/claude/ 2>/dev/null
cp ~/.claude/hooks/*.mjs .claude/state/parity-staging/home/claude/hooks/ 2>/dev/null
cp ~/.claude/delegation/*.md ~/.claude/delegation/*.json ~/.claude/delegation/*.log ~/.claude/delegation/*.mjs .claude/state/parity-staging/home/claude/delegation/ 2>/dev/null
cp ~/.claude/delegation/tickets/*.md .claude/state/parity-staging/home/claude/delegation/tickets/ 2>/dev/null
cp ~/.copilot/agents/*.md .claude/state/parity-staging/home/copilot/agents/ 2>/dev/null
cp ~/.claude/projects/C--Users-rutvi-projects-encore-framework/memory/*.md .claude/state/parity-staging/home/claude/memory/ 2>/dev/null
git check-ignore -q .claude/state/parity-staging/home/claude/settings.json && echo IGNORED || echo "NOT-IGNORED — add .claude/state/ (or parity-staging/) to .gitignore BEFORE any commit; staging mirrors SECRET control files"
```

### Dispatch commands (wave 1 — already fired; re-fire any that died)
```bash
bash .claude/skills/ultra-agents/copilot-worker.sh --ticket ~/.claude/delegation/tickets/TICKET-parity-claude-inv.md  --agent council-worker --work-type research --run-id parity-claude-inv
bash .claude/skills/ultra-agents/copilot-worker.sh --ticket ~/.claude/delegation/tickets/TICKET-parity-copilot-inv.md --agent council-worker --work-type research --run-id parity-copilot-inv
bash .claude/skills/ultra-agents/copilot-worker.sh --ticket ~/.claude/delegation/tickets/TICKET-parity-plans-sweep.md --agent council-worker --work-type research --run-id parity-plans-sweep
bash .claude/skills/ultra-agents/copilot-worker.sh --ticket ~/.claude/delegation/tickets/TICKET-parity-bughunt.md     --agent council-worker --work-type research --run-id parity-bughunt
```
Reports land at `~/.claude/delegation/reports/<run-id>.report.md`; ledger rows in `.claude/state/ua-worker/ledger.jsonl`. 4 concurrent ≤ MAX_WORKERS 5 — no UA boost needed for wave 1.

## Opus continuation checklist (fire order — do these, in order)

1. **Harvest wave 1.** For each run-id: confirm recon file exists + report exists. Dead/timeout run → classify per the escalation ladder (prompt-issue vs env-flake) and re-dispatch (`--attempt 2`).
2. **Review each report cross-family** (worker=sonnet → reviewer=gpt-5.5): `bash .claude/skills/ultra-agents/copilot-worker.sh --agent council-reviewer --task ~/.claude/delegation/reports/<run-id>.report.md --work-type review --run-id <run-id>-review`. Read DIGEST only. `ASKS: n>0` → disposition every ask before accepting. Bounce defects to the worker, don't self-fix.
3. **Record verdicts**: `scorecard.mjs record --run-id … --work-type research --outcome …` per run (LEDGER_PATH from repo cwd — see `reference_scorecard_record_runbook.md`).
4. **Fire wave 2 sequentially**: gap-matrix (after 3 recon files green) → its review → inject-draft (after matrix green) → its review. Same commands with `--agent council-planner --work-type draft` and the wave-2 ticket paths. NOTE: strip/ignore the ⛔ header lines — they're fire-condition markers for you, harmless to the worker.
5. **Claude-authored synthesis (NOT delegable — innovation law)**: from `PARITY_GAP_MATRIX.md` + `INJECTION_SYSTEM_DRAFT.md` + `DELEGATION_STACK_BUGS.md`, author the final design + implementation subplans under this plan: `SUBPLAN_PARITY_INJECTION_SYSTEM.md` (the injection engine — wrapper/agent-brief/matcher changes), `SUBPLAN_PARITY_BUGFIXES.md` (confirmed PBUG-* fixes, ticketed to workers), plus any per-gap subplans the matrix justifies. Control-surface edits (copilot-worker.sh, hooks, agent briefs) need **Rutvik's explicit in-chat go + SELF_GRANT** — protected files. Surface the ask as one-liner + options + recommendation.
6. **Implementation wave**: ticket the approved subplans to council workers (build tickets, T2 default); reviews per pyramid; every injection change gets a live-run verification ticket (dispatch a canary worker, prove the injected content landed via report DOCTRINE_READ echo + ledger).
7. **Ceremony**: keep this plan's Status current; `npm run plans:reindex` (INDEX doesn't know this file yet); Receipt v3 per goal summary; cleanup — delete `.claude/state/parity-staging/` when recon is harvested (staleness risk: it's a snapshot, not live state).

## Deviations log (Fable, 2026-07-12 — per feedback_plan_deviations_log)

- **CLARIFY pre-flight skipped** for wave-1 tickets (doctrine wants it on novel scope): budget-death tradeoff, compensated by ASK-and-proceed constraint + the ASK acceptance gate at review time. Opus: treat any heavy `## ASK` section as the clarify round happening late — disposition fully.
- **Reviews not yet dispatched** — wave-1 reports are UNREVIEWED until step 2 runs. Nothing is green yet.
- **OFF-REPO marked `no`** on all tickets because inputs were pre-mirrored into repo staging; the mirror is a point-in-time snapshot (2026-07-12) — if reviews happen days later, re-run the staging block for freshness.
- **plans:reindex not run** (no commit made); run at step 7.
- **Chain remains PAUSED** (HELD by user, NM2305 armed) — untouched, unrelated to this mission. Do NOT resume it as part of this plan.

## Acceptance criteria (whole plan)

- [ ] 6 recon/design artifacts exist in `.claude/state/parity-recon/` and passed cross-family review
- [ ] Bug findings dispositioned: each PBUG confirmed→fix subplan / refuted→noted with reviewer evidence
- [ ] Claude-authored injection-system design approved by Rutvik; implementation subplans in `plans/pending/`
- [ ] After implementation: a canary dispatch PROVES a worker received skill+rule+memory injection matched to its ticket (report echo + ledger evidence) — LR-059 real-E2E, no simulation
- [ ] In-flight skills-access work found and folded in (or explicit NOT-FOUND recorded)
- [ ] Staging dir cleaned up; nothing SECRET-tier committed (verify `git status` clean of parity-staging before any commit)

---

## Execution Summary

**Closed 2026-07-16 as the parent-cascade of its last child: both implementation children DONE (`plans/done/SUBPLAN_PARITY_BUGFIXES.md` 2026-07-16; `plans/done/SUBPLAN_PARITY_INJECTION_SYSTEM.md` 2026-07-16).**

### Acceptance criteria — final disposition
- **Recon/design artifacts**: 5 of 6 exist in `.claude/state/parity-recon/` (CLAUDE_CAPABILITY_INVENTORY, COPILOT_WORKER_RUNTIME_INVENTORY, PLANS_AND_INFLIGHT_MAP, DELEGATION_STACK_BUGS, PARITY_GAP_MATRIX — all cross-family reviewed, bounce-fixed, verdicts in body line 63). The 6th (INJECTION_SYSTEM_DRAFT) was deliberately HELD/SUPERSEDED (body line 38): innovation-class design authored directly by Claude as SUBPLAN_PARITY_INJECTION_SYSTEM — documented decision, not a gap.
- **Bug findings dispositioned**: 12 findings → 10 fixed via SUBPLAN_PARITY_BUGFIXES (done), 2 refuted with reviewer evidence untouched.
- **Design approved + implementation subplans**: both children existed in plans/pending/ and are now DONE; protected-file edits carried Rutvik's in-chat GOs (2026-07-16) + SELF_GRANT ceremony.
- **Canary proof (LR-059)**: run `pinj-canary-0716` + `-r2` — worker received per-ticket skill (`/find-bugs` SKILL.md via M2) + rule (4 `.claude/rules/*.md` via M1) injection it was NOT hand-given (pre-injection snapshot diff), followed the methodology (6/6 SFDPOT in findings.md), and echoed every path in DOCTRINE_READ (`PINJ-ECHO: OK`); ledger rows + `.claude/state/gate-fires.log` PINJ-VERIFY telemetry. Memory-layer parity ships as the M3 standing worker-rules-extract inlined into the DUTY-STACK contract (child's documented design: curated static extract, not per-dispatch memory matching).
- **Skills-access work found + folded**: PLAN_WORKER_SKILL_ROUTING (the commissioned work) found by wave-1 sweep, integrated (M2 scanner + registry consumed, never duplicated), and closed DONE 2026-07-16.
- **Staging cleanup**: `.claude/state/parity-staging/` (196-file SECRET-tier snapshot) deleted 2026-07-16 per body step 7 — verified gitignored and never committed (`git log --all` empty for the path) before deletion; originals all live in the home dirs.

### Net outcome
Of the 11 MISSING context layers (worker runtime inventory §329), the dispatcher-side injection engine now closes the load-bearing ones per-dispatch: path-glob→rules (M1), goal→skill methodology (M2, canary-proven), house-rules/memory extract (M3, wired into every ticket-mode prompt). Verification layers live announce-tier: reviewer §PINJ evidence-signature check + verifier §PINJ-VERIFY echo check + calibration log for the LR-069 ramp.
