# PLAN_COPILOT_INTEGRATION_ULTRAAUDIT — Look back, find slop, remove slop, prove nothing broke

**Status**: PENDING
**Priority**: P0
**Created**: 2026-07-16
**Identity**: OWNER
**Depends on**: SUBPLAN_LCD_07_OBSERVABILITY.md (staging round closed; its live apply is PARKED behind this audit unless Rutvik separately GOs it)
**Blocks**: ALL further copilot-claude integration execution (GOVERNOR, UPLINK wires, ASSISTANT_LAYER, HARDGATES, UPLINK_WAVE2, FIGHTINNOVATION, MEGA_AUDIT) — "only then we go forward"
**Collides-with**: PLAN_LOSSLESS_DEEP_TRIM family (no longer on disk — collision is moot; Phase 4 retro-verifies its executed deletions; TRIM_04/05/06 stay paused until Phase 4 verdicts land)
**Model**: claude-opus-4-6
**Thinking**: max
**Justification**: cross-plan coherence judgment + slop-vs-load-bearing calls across the whole delegation stack — the highest-judgment work in the queue; council labors, Claude architects
**PermissionMode**: default
**BrowserTool**: none
**RiskAcknowledged**: HIGH — the audit's fix wave edits the LIVE delegation machinery Claude depends on mid-session; every fix is staged + council-reviewed + battery-proven before apply; deletions are archive-only with owner confirmation (LCD_06 policy)

---

## ⚠ TRI-PLAN MUTUAL GATE — welded to FIX_WAVE + SLOP_SWEEP (2026-07-20, Rutvik-directed)

**These three plans are ONE gated unit — running any ONE obligates the other two:**
`PLAN_COPILOT_INTEGRATION_ULTRAAUDIT` (this) ⇄ `PLAN_ULTRAAUDIT_FIX_WAVE` ⇄ `PLAN_REPO_SLOP_SWEEP`.

**Shared root cause:** this audit's original denominator was model-GUESSED (~197 files) and is proven incomplete — the real machine roster is **1,853 in-scope entries** (`.claude/state/ua-worker/slop0-enum-0718-artifacts/denominator.md`, `git ls-files` + full-disk walk). Every "later phase" line below that points at `_ULTRAAUDIT_MANIFEST.md` as its denominator is **SUPERSEDED** by that 1,853 roster.

**The gate — whichever of the three you run FIRST must do this ONCE, before ANY harness file is fixed/deleted/relocated, and share the result with the other two:**
1. **Re-run the bug hunt over the full 1,853 machine denominator** (cross-provider council, guilty-until-proven) — harness *correctness* gets the same 100% coverage that file-*existence* already got.
2. **Reconcile the FIX_WAVE fix-list against the SLOP_SWEEP DELETE-list** (`plans/pending/_REPO_SLOP_FINDINGS.md`) — never fix-then-delete, never delete-mid-fix.
3. The re-hunt + reconciliation is performed **once and shared** (NOT three times); the other two plans CONSUME its artifact rather than repeat it. None of the three's harness fix/delete/apply work proceeds until 1+2 are complete.

If unclear at run time: **STOP and re-read — do not improvise.** Mechanics: FIX_WAVE → "Execution Prerequisite" and SLOP_SWEEP → "Execution Order STEP 0".

---

## ⚠ REUSE FROM PLAN_REPO_SLOP_SWEEP (Rutvik-directed 2026-08-06 — read BEFORE interrogating Rutvik or designing delegation for this plan)

`plans/pending/PLAN_REPO_SLOP_SWEEP.md` now carries owner decisions + doctrine this plan CONSUMES instead of re-deriving or re-asking:

1. **Its §DELEGATION DOCTRINE applies to THIS plan's execution too (ONE SYSTEM)**: councils not single
   agents; tiered FIGHTERS (opus/gpt only, model-max) / HELPERS (sonnet, mechanical only, under a
   fighter); 3× credit + timeout sizing; Fable adjudicates planned diffs (redo/yes, frugally); council
   output is claims — Claude re-verifies critical calls; sleeping-SOTA law; nothing unconfirmed;
   reversible deletions only; zero-burn; not-built-yet ≠ not-to-be-used (hand-emulate pending-plan
   behaviors, never claim unbuilt infra as enforcement). This matches and extends this plan's own
   "Execution model" paragraph — where they differ, the sweep's doctrine (newer, 2026-08-06) wins.
2. **Redundancy ban on owner asks**: before asking Rutvik ANY question here, grep that plan's `DECIDE:`
   lines (2026-08-06 batch — ALL filled). If the same question is already answered there, CONSUME the
   answer — do not re-ask. Rutvik answers only THIS plan's genuinely novel interrogations.
3. **Shared prerequisites + handoffs already decided there**: § S-0a — five-root denominator
   regeneration precedes everything (supersedes the 1,853 roster this plan cites, which was itself
   measured at 0.96% real coverage). § S-9 — the sweep's survivor content pass runs THROUGH this plan's
   Phase 2/2.5 machinery with the denominator set to the sweep's survivors (the pass runs ONCE, not
   twice). § S-8e — `_TRIPLAN_RECONCILIATION.md` shrinks only AFTER this plan finishes consuming it.
   Back this plan file up before running (it is gitignored — one copy).

---

## Context

Rutvik directive 2026-07-16 (verbatim intent): the copilot-claude integration was rushed forward plan-by-plan — 12+ plans executed, never audited as a WHOLE. Before any further forward execution: look back, find shit, remove shit — of any kind. Plans were made one-by-one so nobody knows if they FIT TOGETHER; the framework must not bloat "in the hopes that some things from it would work and save us." Everything useless / redundant / compactable / improvable gets acted on. Core goal behind the goal: copilot at Claude's execution level with a harness where lying is structurally impossible — so the council can shrink to 1 worker + 1 light check. A slop-free harness is a prerequisite: **if council fucks up, it keeps fucking up.**

Quality bar (verbatim): reduce bugs, compact logic, increase code quality WITHOUT reducing efficiency (increase it!) or efficacy (100% quality retained before vs after). Self-pruning vision generalizes: not just auto-provable stale files — brain-required pruning (redundancy, duplication, soft/mid/hard gate checkup, doctrine text, knobs) across every visionary achievement made or planned.

Execution model: Claude = architect only (tickets, verdict reads, judgment, this ceremony). Council = ALL labor, cross-provider (opus-4.6 ↔ gpt-5.5 ONLY — owner: "only opus/gpt as we do not want fuckups", max available think per seat; reviewer provider ≠ executor provider, reviewers RE-EXECUTE). Heavy research delegation expected. Agent doubts are never auto-dispositioned — every worker `## ASK` item routes to Claude's own judgment ("use ur brain if agents have doubts").

**Scope expansion (owner directives 2026-07-16 evening)**: (1) the audit covers not only the copilot-claude integration but **Claude's existing harness itself** — it works, but is it MINIMAL? Bloated-but-works is not acceptable; efficiency saves context for both Claude and copilot (new Phase 2.5). (2) Phase 4 grows to a full **before-vs-after scrutiny swarm** over every recent cleanup CRUD (see Phase 4). (3) Phase 6 gains a deep-research input on how auto-trim / repo-hygiene is done in the wild (see Phase 6.0).

---

## Bootstrap

- **Identity**: OWNER. **Skills**: /relevant (fired per phase), /audit --mode=slop (Phase 2 doctrine), /review (fix-wave doctrine), /regression-guard (Phase 5 WRAP), /delegation-temp posture (architect-not-bricklayer), /reflect + /final-q at close.
- **Context files**: `plans/INDEX.md`, `plans/done/SUBPLAN_LCD_0{1,2,3,4,5,6}_*.md`, `plans/done/PLAN_WORKER_SKILL_ROUTING.md`, `plans/done/SUBPLAN_PARITY_INJECTION_SYSTEM.md`, `plans/done/PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY.md`, `plans/pending/PLAN_LAZY_CEO_DELEGATOR.md` (master vision), `plans/pending/SUBPLAN_ASSISTANT_LAYER_HARDGATES.md`, `plans/pending/SUBPLAN_UPLINK_WAVE2.md`, `.claude/rules/guardrail-policy.md` (LR-069 §3.4 bloat governor + demotion review, LR-070), `docs/read_only_docs/AGENT_SHARED_RULES.md`. (Note: three previously-listed context files no longer exist on disk and were removed from this list: PLAN_UPLINK_PROTOCOL, SUBPLAN_COPILOT_CONTEXT_GOVERNOR, PLAN_LOSSLESS_DEEP_TRIM.)
- **Worker doctrine for tickets**: `.claude/state/ua-worker/worker-doctrine-index.md` + M2 scan per ticket (`node scripts/ticket-skill-scan.mjs`).

---

## Phase 0 — Freeze + machine inventory (research tickets, read-only)

0.1 **Scope freeze**: no new integration-plan execution while this plan is open (frontmatter Blocks line). LCD_07 staged artifacts stay staged.
0.2 **Audit-manifest build** (council research ticket, opus + gpt independent then merged): enumerate EVERY file the integration created or modified, from four sources cross-checked — (1) Execution Summaries of all done integration plans, (2) `git log --name-status` since 2026-06-20 on integration-relevant paths, (3) live listing of the home delegation surface (off-repo: ~/.claude/delegation/, ~/.claude/hooks/delegation-*.mjs + gate, ~/.copilot/agents/*.agent.md), (4) repo surface (`.claude/skills/ultra-agents/**`, `.claude/hooks/lib/uplink/**`, `.claude/guardrail-config.json`, `scripts/ticket-doctrine-from-scope.mjs`, `scripts/ticket-skill-scan.mjs`, `scripts/prune-check.mjs`, `scripts/scorecard*` if present, `.claude/skills/{reflect,compile-learnings,final-q,delegation-temp,ultra-agents}/SKILL.md`, `.claude/rules/guardrail-policy.md`, memory pointer files, `.claude/state/ua-worker/` structure).
   Deliverable: `plans/pending/_ULTRAAUDIT_MANIFEST.md` — one row per file: path, origin plan, size, purpose-one-liner, layer (soft-prose | mid-announce | hard-deny | code | doctrine | state). **This manifest is the denominator for every later phase** (LR-062 spirit: machine denominator, no sampling).

## Phase 1 — Vision coherence: do the plans compose?

1.1 Council ticket (2 independent readers, opus + gpt, then adversarial merge): read all done integration plans + the pending ones' Objectives. Hunt: (a) contradictions between landed mechanisms (e.g., two systems writing the same file/knob, conflicting cadences, doctrine text disagreeing with a gate's actual behavior), (b) mechanisms a later plan obsoleted but the earlier artifact still lives, (c) pending-plan assumptions already invalidated by landed state (stale anchors — the LCD_07 `:540-549` class, found 2026-07-16), (d) gaps: things every plan assumes exist but nothing built.
1.2 Deliverable: coherence report with per-finding severity (S0-S3 per LR-069 §3.1) + exact file:line. Claude reads EVERY finding (feedback_verify_synthesis_refutations — no auto-accepting refutations or confirmations).

## Phase 2 — Slop sweep: every file, line-level

2.1 Partition the manifest into review lots (~8-12 files each, grouped by surface). Per lot: executor slop-audit ticket (line-level: dead code, duplicated logic, redundant prose, contradictory instructions, unused knobs/env-vars/flags, over-engineering, stale references, commented-out corpses, AI-slop phrasing, copy-paste drift between the repo declaration and home runtime copies of the same config) + cross-provider reviewer who RE-READS the same lot cold and must find anything the executor missed (miss = named defect on the executor).
2.2 Special lots: (a) **duplication across the membrane** — repo `guardrail-config.json` vs home `config.json` vs `DUTY_STACK.md` vs worker-ext.md vs agent profiles: same rule stated N times = one canonical home + pointers; (b) **doctrine text audit** — UPLINK_DOCTRINE / ASKING_DOCTRINE / lesson-router / pruning-policy / worker-doctrine-index: compaction without semantic loss; (c) **the wrapper itself** (`copilot-worker.sh`, ~625 lines): logic compaction candidates, dead branches, duplicated node -e builders (META vs ledger — near-identical twins).
2.3 Deliverable: per-lot findings tables (file:line, class, severity, proposed action: DELETE | MERGE | COMPACT | REWRITE | KEEP-载-bearing) merged into `_ULTRAAUDIT_FINDINGS.md`. Every manifest row must appear with a verdict — **zero unreviewed rows** (strict line, deliberate).

## Phase 2.5 — Claude harness efficiency audit (owner expansion: "is it minimal or just bloated but still works")

2.5.1 Surface: the ENTIRE working harness beyond the integration — `.claude/hooks/**` (repo), `.claude/rules/*.md`, `.claude/skills/*/SKILL.md` (all ~35), `.claude/context/navigation.md`, `CLAUDE.md` + its `@`-reference chain, `scripts/` (non-integration), `.claude/settings.json` hook wiring, auto-memory MEMORY.md index + pointer files. Same lot/executor/cross-reviewer discipline as Phase 2.
2.5.2 The question per file is EFFICIENCY, not correctness: what does this cost in context per session class (always-loaded vs path-scoped vs on-demand), is every loaded line earning rent, can it be compacted/merged/demoted a layer with ZERO capability loss? "It works" is not a KEEP verdict — bloated-but-works gets a COMPACT/MERGE proposal with the before/after line count.
2.5.3 Deliverable: harness-efficiency table (file, layer, lines, load-frequency, verdict, projected saving) merged into `_ULTRAAUDIT_FINDINGS.md`; context-cost totals before/after (the number Rutvik cares about: how many lines every session pays).

## Phase 3 — Gate topology checkup (soft/mid/hard)

3.1 Council ticket: inventory every gate the integration added or touched — PreToolUse/Stop hooks (home + repo), wrapper-internal gates (labor gate, PINJ echo, stall system, envelope/anti-cheat, ASK gate), validators, scorecard enforcement, G1-TP1. For each: layer (announce/deny), fire telemetry present? (LR-069 §3.4 KNOWN-GAP says ≥8 gate libs are DARK), overlap with another gate (two gates catching the same class = merge candidate), rent proof (severity header + graduating incident present?), false-positive history (grants-audit.log, gate-fires.log, session evidence — e.g., G1's heredoc over-match, already flagged), demotion candidates (0 fires + no recurrence).
3.2 Deliverable: gate topology map + per-gate verdict (KEEP | MERGE-WITH-x | DEMOTE | FIX | RETIRE) + the dark-gate telemetry gap dispositioned (fix now in Phase 5, or explicit park with reason).

## Phase 4 — Cleanup retro-verify SWARM: before-vs-after on EVERY recent cleanup CRUD (owner expansion)

4.1 **Denominator**: every cleanup wave executed recently ("today/yesterday... whatever is recent as fuck" + the full TRIM family by the time this runs): TRIM_01 (committed pending deletions), TRIM_02 (old-plan disposition), TRIM_03 (plan corpus moves incl. 15 resolved plans), **TRIM_04 (scripts deadweight), TRIM_05 (export converters), RCD_B (dedupe scripts), RCD_C (env/reports cruft)**, parity-staging purge (196 files, 2026-07-16), `scripts/archive-allure.js` + `archive-html.js` + `ensure-report-dirs.js` + `preserve-allure-history.js` deletions, comment-strip commits (`8875b232`, `4ea2cfea`), and any other cleanup CRUD `git log --since=2026-07-01` surfaces.
4.2 **Method — before-vs-after with scrutiny, per CRUD item** (not per wave): reconstruct BEFORE state (`git show <parent>:<path>` / reflog / plan Execution Summary), diff against AFTER (current tree), and judge: was this removal/change WORTH IT, or is it something that "WOULD FUCK US UP" later? Mechanical check (prune-check 5-class live-ref grep + package.json/config/docs scan) is the floor; the JUDGMENT (value-of-what-was-lost) is the point — an unreferenced file can still be irreplaceable knowledge.
4.3 **Swarm shape**: agents divided by wave with ZERO overlap (clash-free division per Phase 5.0 — "make sure divide of work is properly done or agents would fight internally"); opus/gpt max-think only; each wave gets executor + cross-provider re-verifier; agent doubts route to Claude's own read, never auto-closed.
4.4 Deliverable: per-CRUD-item verdict table (WORTH-IT | REGRESSION-restore | QUESTIONABLE-to-Rutvik with exact refs). Restores need Rutvik's yes (they're his files).

## Phase 5 — Fix wave: act on everything (staged, proven, then applied)

5.0 **Parallel dispatch discipline (owner directive 2026-07-16)**: never overload one worker — a lot with ≥3 independent targets splits into multiple tickets; disjoint-surface lots dispatch in PARALLEL (one turn, N dispatches, end turn); clash-avoidance is structural (disjoint output dirs, no two concurrent workers on the same staged file, same-file lots sequenced); >5 concurrent needs Rutvik consent. Applies to Phases 1-4 research/review lots too.
5.1 Claude triages ALL findings from Phases 1-4 into fix lots by blast radius: (A) inert (docs/prose/dead files) — council build+review then apply; (B) live machinery (wrapper, hooks, gates, configs) — staged copies + battery proof + council review, then apply; (C) protected/Tier-2 (delegation-gate.mjs, anything under HARDGATES' remit) — staged + reviewed + **HALT for Rutvik GO per item**; (D) deletions — archive-only + `scripts/prune-check.mjs` zero-live-ref + batch list to Rutvik for confirmation (LCD_06 policy: no autonomous deletion ever).
5.2 **Efficacy floor (the 100%-retained proof, strict)**: before ANY category-B/C apply and again after ALL applies, run the full existing regression floor and diff: LCD_03 live-verify (8 checks), LCD_04 probe battery (43), LCD_05 battery (35) + route-sim, LCD_06 battery (49), PINJ echo-check on a canary dispatch, one real end-to-end council dispatch (ticket → worker → ledger row → report schema). **Every pre-pass green must be post-pass green** — a single regression = revert that fix, not rationalize it. One legitimate exception, declared never discovered: a fix that intentionally changes a fingerprinted surface (e.g., compacting a file whose exact headings/lines a probe pins) must ship the probe update IN THE SAME reviewed fix lot, named in the reviewer's verdict — a post-hoc probe edit to make a failure pass is itself an S1 finding.
5.3 Efficiency gain measured: before/after LOC per compacted file, gate count, duplicated-rule count, wrapper hot-path line count — reported as numbers in the Execution Summary, no prose-only claims.

## Phase 6 — Generalized self-pruning doctrine (the visionary extension)

6.0 **Deep-research input (owner: "research whatever the fuck u need")**: dispatch a deep-research wave (multi-source web, adversarially verified) on how mature teams auto-trim — dead-code detection in CI (knip/depcheck/ts-prune class tooling), doc/config rot detection, gate/flag lifecycle management, LLM-agent memory-pruning practice, monorepo hygiene automation. Deliverable: a cited practices report mapped to OUR stack (what to adopt / adapt / reject and why) — it feeds 6.1's doctrine so we're not inventing in a vacuum.
6.1 Council draft + Claude judgment: extend `pruning-policy.md` + LCD_06's Step 4.7 from "stale files" to **every accumulating surface self-prunes**: dispatcher-lessons (dedupe/merge at cap, not just archive), agent-profile § Lessons (same), gate fleet (LR-069 demotion review actually SCHEDULED, not just documented), doctrine files (compaction cadence), knobs/config keys (unused-knob detector), ticket/artifact dirs (retention), memory pointer files (already covered — verify). Each surface gets: metric, threshold, prune semantics, never-prune guard, owner-confirmation point.
6.2 Deliverable: pruning-policy v2 (staged → reviewed → applied to home via grant ceremony) + follow-up stubs ONLY where a mechanism must be built later (LR-040 §b grep-verifiable line items — no phantom handoffs).

## Phase 7 — Closure

7.1 Validator ceremony (LR-055 full pass), INDEX reindex, activity-log row, parent/blocked-plans annotations.
7.2 Receipt to Rutvik: newcomer words + real numbers (files audited / findings by severity / removed / compacted / LOC delta / gates merged-demoted / regressions caught by the efficacy floor / trim-verify verdicts).

---

## Per-Identity Satisfaction

| Identity | Owned artifact this plan touches | Concrete deliverable | Acceptance command |
|---|---|---|---|
| OWNER | delegation stack (repo + home), plans corpus, this plan | plans/pending/_ULTRAAUDIT_MANIFEST.md<br>plans/pending/_ULTRAAUDIT_FINDINGS.md | grep both files exist + every manifest row carries a verdict |
| HUNTER | (none) | (none) | (none) |
| GIVER | (none) | (none) | (none) |
| BUILDER | (none) | (none) | (none) |
| HEALER | (none) | (none) | (none) |
| WATCHDOG | audit findings tables (council-produced, OWNER-judged) | plans/pending/_ULTRAAUDIT_FINDINGS.md | severity column present on every row |
| GARDENER | fix-wave structural changes | (skipped: plan is pending — metrics table produced at execution close) | numbers present, no prose-only claims |

## Acceptance criteria

- [ ] Manifest exists; **every** manifest row reviewed with a verdict (zero unreviewed — strict, deliberate).
- [ ] Coherence report: every contradiction dispositioned (fixed / parked-with-reason / refuted-with-evidence Claude personally read).
- [ ] Gate topology map: every gate has KEEP/MERGE/DEMOTE/FIX/RETIRE verdict; dark-telemetry gap dispositioned.
- [ ] Trim retro-verify: every executed deletion wave verdicted CLEAN or REGRESSION+restore-list.
- [ ] Efficacy floor: pre-pass and post-pass battery outputs tee'd; **zero** pre-green→post-red.
- [ ] Efficiency deltas reported as numbers.
- [ ] All deletions: archive-only + prune-check PASS + Rutvik confirmation logged. All Tier-2 applies: per-item Rutvik GO logged.
- [ ] Pruning-policy v2 applied or explicitly parked by Rutvik.

## Pending decisions (Rutvik — one-liners, answer at execution GO)

1. **LCD_07 apply**: park until after this audit (my recommendation — it edits the exact wrapper Phase 2.3 audits) or apply first?
2. **Fix-wave autonomy**: category-A/B fixes auto-apply on council green + battery proof (my recommendation), or every fix waits for your per-item yes? (C and D always wait regardless.)
3. **Budget posture**: this is ~15-25 council tickets across 7 phases — cap-per-phase check-ins with you, or run phases 0-4 (read-only) uninterrupted and check in before the fix wave (my recommendation)?

## Rollback

- Phases 0-4 are read-only — nothing to roll back.
- Phase 5: every category-B/C fix keeps its staged base + pre-apply battery tee; revert = restore base + re-run battery. Deletions are archive-moves — `mv` back.
- Phase 6: pruning-policy v2 backs up v1 (`.bak-ultraaudit`) before placement.

## Handoff

Chat-only. Outcomes + numbers per LR-039 (no blocker claims); receipt format per feedback_receipt_newcomer_format.

---

### Execution Summary

Execution not yet performed. This plan is explicitly PARKED — scope freeze is in effect (frontmatter Blocks line), and the TRI-PLAN MUTUAL GATE reconciliation must complete before any phase runs. Phases 0–6 have not been executed.

---

# EXECUTION ORDER + ONE-SYSTEM SCOPE (added 2026-08-05, Rutvik GO)

**Run order for the tri-plan unit**: this plan runs **3rd** — after 1️⃣ `PLAN_REPO_SLOP_SWEEP` (rebuilds
the denominator) and 2️⃣ `PLAN_ULTRAAUDIT_FIX_WAVE`. **Before anything else at execution: back this file
up** — it is gitignored (§ C-5) and exists in exactly one copy on one disk.

**ONE SYSTEM (scoping law for every phase and DECIDE below)**: Claude and Copilot are halves of the same
framework. Every phase applies across the WHOLE system — the repository, `~/.claude/` (hooks, delegation
control plane, memory), and `~/.copilot/` (agents, config, state) — unless its text names a narrower
scope with a reason. Phase 2.5's efficiency question ("is every loaded line earning rent") applies to the
worker side exactly as it does to Claude's harness — see § C-6.

**Execution mechanics**: at execution start, batch every unfilled `DECIDE:` line through `/questionnaire`
(decision mode). Evidence home: the audit artifacts cited below are preserved in-repo at
`plans/pending/_audit-evidence-0805/` — `~/aud/` is scheduled for teardown and must never be
the only copy.

---

# AUDIT FINDINGS TO DISPOSITION (wired 2026-08-05)

**Where this came from**: a two-round council audit of everything the framework touched 2026-07-27 →
2026-08-05. Full report: `plans/pending/_audit-evidence-0805/AUDIT-REPORT-V2.md`. Ledger:
`plans/pending/_audit-evidence-0805/PROGRESS.md` (preserved in-repo before the `~/aud/`
workspace teardown).

**The audit was READ-ONLY by instruction.** Nothing below was changed. **This plan is where the changes
happen.** Every block ends in a `DECIDE:` line.

**State at wiring** (council-measured, 57 roster items): DONE-COMMITTED 34 · PARTIAL 10 · NOT-STARTED 2 ·
SUPERSEDED 6 · UNVERIFIABLE-FROM-CLONE 5 → **60% over all items, 65% over the items a clone can judge.**
This is the most complete of the three plans. Its remaining work is almost entirely **off-repo**, which is
exactly the surface the audit found nobody has ever enumerated.

---

## C-0 · The off-repo surface has never been in any denominator

A from-scratch rebuild on 2026-08-05 counted **156,018 files** across the repository and the two off-repo
roots. The roster all three plans call their machine denominator holds **1,854 rows — and zero of them
cover `~/.claude` or `~/.copilot`.**

The off-repo population, never enumerated by anything:

| root | files |
|---|---|
| `~/.copilot` | 11,599 |
| `~/.claude` | 5,489 |
| **total** | **17,088** |

This is where the agent harness, the delegation control plane, agent definitions, memory files, and
grant/gate state actually live — the machinery that decides what every agent is permitted to do. Counts
cross-checked with a second instrument (PowerShell against bash `find`), agreeing within 3 files on
directories with active sessions writing to them.

A council lot grouped this population with a verdict per group, off-repo first
(`plans/pending/_audit-evidence-0805/NEVER-ENUMERATED-FINDINGS.md`). Of 154,515 never-enumerated files,
**147,164 are bulk-dismissable with a named reason** and **7,326 genuinely need human decisions** — the
off-repo agent, delegation, control-plane and config surfaces plus in-repo framework material.

**Its recommended first lot is squarely this plan's territory**: `~/.claude/delegation`, **2,047 files** —
*"the personal-machine delegation authority surface containing tickets, grants, reviews, and control-plane
material that can change what agents are allowed to do, while the prior roster had zero rows there."*

> **DECIDE — C-0a**: adopt the four-quadrant denominator (see `PLAN_REPO_SLOP_SWEEP` § S-0) as this plan's
> scope, so the off-repo half is enumerated rather than sampled?
> `DECIDE: ____`
> **DECIDE — C-0b**: make `~/.claude/delegation` (2,047 files) this plan's first lot?  `DECIDE: ____`

---

## C-5 · This plan is not in version control

`plans/pending/PLAN_COPILOT_INTEGRATION_ULTRAAUDIT.md` — this file — is **gitignored at
`.gitignore:296`**. It is tracked by nothing. It exists on this machine and nowhere else: not in a clone,
not on the team remote, not in any backup git provides. Everything above, and the 57 roster items below
it, live in one copy on one disk.

Found while wiring these findings in, not by any lot.

> **DECIDE — C-5**: track this plan, or keep it machine-local deliberately (and if deliberately, where is
> the backup)?
> `DECIDE: ____`

---

## C-1 · Two gates drift from their sources — in opposite directions

Both confirmed through the full fight protocol (author works, cross-provider seat attacks, author defends,
aligned result only):

- **labor-gate**: an `&`-separated command bypass was patched in the repository source and **never
  installed** to the running copy. The gate that runs is the older one.
- **isolation-perimeter**: a `.claude/rules/` carve-out exists **only on the machine** and in no
  repository source. The running gate permits something no source file describes.

> **DECIDE — C-1**: install the labor-gate patch, and either promote the isolation-perimeter carve-out to
> source or remove it from the machine?
> `DECIDE: ____`

---

## C-2 · The 2026-08-03 batch never propagated

After the fight settled, the aligned count is **9 files where the repository is newer than what runs, and
2 where the machine is newer than the repository.** Six configuration files driving the delegation system
are still on versions from 2026-07-10 to 07-16.

**The last time anyone compared the two sides was 2026-07-18** — before the audit window even opened.
Related: the routing scorecard is 21 days stale (installed 07-13, source 08-03). An early audit draft said
"~7 weeks"; that was wrong, corrected independently by two parties, and the real figure is 21 days.

> **DECIDE — C-2a**: propagate the 9, and decide per-file on the 2 where the machine leads?
> `DECIDE: ____`
> **DECIDE — C-2b**: add a parity check that runs on a schedule, so the answer is never 18 days old again?
> `DECIDE: ____`

---

## C-3 · Files that change the system's permissions, reviewed by nobody

A council lot judged 72 machine-only files that changed in the audit window and had no repository
counterpart. Six carry behaviour-changing reach, quoted from the staged evidence:

- **An active `SELF_GRANT`** (`ticket_id: offrepo-sec-20260804`, expiry `2026-08-04T13:15:45Z`) naming
  protected hook paths **and `copilot-worker.sh` itself** — a grant permitting edits to the dispatch
  wrapper. Expiry has passed; whether the consumer honours expiry is not established.
- **`gates.sha256`** — the hash pin deciding which `envelope.mjs` / `verify-run.mjs` content is trusted.
  Change the pin, change what gate code counts as legitimate.
- **`labor-gate.mjs.pre-install-*.bak`** — not executing, but it documents the live gate's four fail-open
  conditions: mode `off`, mode `announce`, a pipeline identity detected in the transcript, and any
  internal error. Worth reading precisely because it states them plainly.
- **7 agent-definition files** — worker, reviewer and chief prompts that determine how every dispatched
  agent behaves. None reviewed.
- **`corpus.jsonl`** — a raw prompt corpus flagged as a prompt-injection surface if any consumer ever
  treats its rows as instructions rather than data.

> **DECIDE — C-3a**: does the SELF_GRANT consumer enforce expiry? (Read the consumer, do not assume.)
> `DECIDE: ____`
> **DECIDE — C-3b**: bring the 7 agent definitions under source control, or accept them as machine-local?
> `DECIDE: ____`
> **DECIDE — C-3c**: confirm no consumer treats `corpus.jsonl` rows as instructions?  `DECIDE: ____`

---

## C-4 · The installed agent registry is inconsistent with its sources

- **35 agent files installed** in `~/.copilot/agents/`; **18 sources** in the repository at
  `.claude/skills/ultra-agents/setup/agents/`. Seventeen installed agents have no repository source.
- **7 of the 35 carry a doubled-prefix naming bug**, e.g.
  `v--claude-opus-4.6--v--claude-opus-4.6--chief.agent.md` — a broken copy step, live in the registry.
- **Version drift across the seam**: the repository ships
  `v--claude-sonnet-4.5--council-worker.agent.md`; the machine has 4.6.
- `agents-variants-archive/` untouched since 2026-07-25.
- Stale database backups: `data.db.pre-update-backup-1.0.26-*` (2.0 MB) and `-1.1.0-*` (2.6 MB).
  `session-store.db` is 139 MB with a 5.2 MB WAL.

> **DECIDE — C-4a**: reconcile the 17 sourceless installed agents — promote to source or remove?
> `DECIDE: ____`
> **DECIDE — C-4b**: fix the 7 doubled-prefix filenames and the copy step that produced them?
> `DECIDE: ____`
> **DECIDE — C-4c**: resolve the 4.5-vs-4.6 seam drift, and delete the 4.6 MB of stale backups?
> `DECIDE: ____`

---

## C-6 · Copilot's own memory gets the same consolidation Claude's gets

`PLAN_REPO_SLOP_SWEEP` § S-8 consolidates Claude's two memory populations (repo collaborator-memory +
machine memory). Copilot's equivalents are named in this plan's Phase 6.1 as self-pruning **policy**
targets — but no lot ever **runs** the merge:

- `~/.claude/delegation/dispatcher-lessons.md` — accumulating; dedupe/merge never executed
- `~/.copilot/agents/*.agent.md` `§ Lessons` blocks — per-profile accumulation, never merged (the
  membrane law routes worker lessons here — so this is where they pile up)
- `.claude/state/ua-worker/worker-doctrine-index.md` — the doctrine pointer list every ticket carries

**The lot**: run the same content-level consolidation over these populations — merge duplicates, prune
superseded entries, keep every load-bearing lesson — and measure the **per-dispatch context bill** (agent
profile + preamble + doctrine text a worker pays on every single ticket) before and after, exactly as
Phase 2.5 measures Claude's per-session bill. Same warning as § S-8: a zero-reference count is a
candidate signal, never a delete authorisation.

> **DECIDE — C-6a**: run the copilot-side consolidation as a lot in this plan?  `DECIDE: ____`
> **DECIDE — C-6b**: report the per-dispatch context bill before/after as this plan's efficiency number?
> `DECIDE: ____`
