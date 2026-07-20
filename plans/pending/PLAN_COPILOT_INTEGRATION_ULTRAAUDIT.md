# PLAN_COPILOT_INTEGRATION_ULTRAAUDIT — Look back, find slop, remove slop, prove nothing broke

**Status**: PENDING
**Priority**: P0
**Created**: 2026-07-16
**Identity**: OWNER
**Depends on**: SUBPLAN_LCD_07_OBSERVABILITY.md (staging round closed; its live apply is PARKED behind this audit unless Rutvik separately GOs it)
**Blocks**: ALL further copilot-claude integration execution (GOVERNOR, UPLINK wires, ASSISTANT_LAYER, HARDGATES, UPLINK_WAVE2, FIGHTINNOVATION, MEGA_AUDIT) — "only then we go forward"
**Collides-with**: PLAN_LOSSLESS_DEEP_TRIM family (Phase 4 retro-verifies its executed deletions; TRIM_04/05/06 stay paused until Phase 4 verdicts land)
**Model**: claude-opus-4-6
**Thinking**: max
**Justification**: cross-plan coherence judgment + slop-vs-load-bearing calls across the whole delegation stack — the highest-judgment work in the queue; council labors, Claude architects
**PermissionMode**: default
**BrowserTool**: none
**RiskAcknowledged**: HIGH — the audit's fix wave edits the LIVE delegation machinery Claude depends on mid-session; every fix is staged + council-reviewed + battery-proven before apply; deletions are archive-only with owner confirmation (LCD_06 policy)

---

## Context

Rutvik directive 2026-07-16 (verbatim intent): the copilot-claude integration was rushed forward plan-by-plan — 12+ plans executed, never audited as a WHOLE. Before any further forward execution: look back, find shit, remove shit — of any kind. Plans were made one-by-one so nobody knows if they FIT TOGETHER; the framework must not bloat "in the hopes that some things from it would work and save us." Everything useless / redundant / compactable / improvable gets acted on. Core goal behind the goal: copilot at Claude's execution level with a harness where lying is structurally impossible — so the council can shrink to 1 worker + 1 light check. A slop-free harness is a prerequisite: **if council fucks up, it keeps fucking up.**

Quality bar (verbatim): reduce bugs, compact logic, increase code quality WITHOUT reducing efficiency (increase it!) or efficacy (100% quality retained before vs after). Self-pruning vision generalizes: not just auto-provable stale files — brain-required pruning (redundancy, duplication, soft/mid/hard gate checkup, doctrine text, knobs) across every visionary achievement made or planned.

Execution model: Claude = architect only (tickets, verdict reads, judgment, this ceremony). Council = ALL labor, cross-provider (opus-4.6 ↔ gpt-5.5 ONLY — owner: "only opus/gpt as we do not want fuckups", max available think per seat; reviewer provider ≠ executor provider, reviewers RE-EXECUTE). Heavy research delegation expected. Agent doubts are never auto-dispositioned — every worker `## ASK` item routes to Claude's own judgment ("use ur brain if agents have doubts").

**Scope expansion (owner directives 2026-07-16 evening)**: (1) the audit covers not only the copilot-claude integration but **Claude's existing harness itself** — it works, but is it MINIMAL? Bloated-but-works is not acceptable; efficiency saves context for both Claude and copilot (new Phase 2.5). (2) Phase 4 grows to a full **before-vs-after scrutiny swarm** over every recent cleanup CRUD (see Phase 4). (3) Phase 6 gains a deep-research input on how auto-trim / repo-hygiene is done in the wild (see Phase 6.0).

---

## Bootstrap

- **Identity**: OWNER. **Skills**: /relevant (fired per phase), /audit --mode=slop (Phase 2 doctrine), /review (fix-wave doctrine), /regression-guard (Phase 5 WRAP), /delegation-temp posture (architect-not-bricklayer), /reflect + /final-q at close.
- **Context files**: `plans/INDEX.md`, `plans/done/SUBPLAN_LCD_0{1,2,3,4,5,6}_*.md`, `plans/done/PLAN_WORKER_SKILL_ROUTING.md`, `plans/done/SUBPLAN_PARITY_INJECTION_SYSTEM.md`, `plans/done/PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY.md`, `plans/done/PLAN_UPLINK_PROTOCOL.md`, `plans/pending/PLAN_LAZY_CEO_DELEGATOR.md` (master vision), `plans/pending/SUBPLAN_ASSISTANT_LAYER_HARDGATES.md`, `plans/pending/SUBPLAN_COPILOT_CONTEXT_GOVERNOR.md`, `plans/pending/SUBPLAN_UPLINK_WAVE2.md`, `plans/pending/PLAN_LOSSLESS_DEEP_TRIM.md`, `.claude/rules/guardrail-policy.md` (LR-069 §3.4 bloat governor + demotion review, LR-070), `docs/read_only_docs/AGENT_SHARED_RULES.md`.
- **Worker doctrine for tickets**: `.claude/state/ua-worker/worker-doctrine-index.md` + M2 scan per ticket (`node scripts/ticket-skill-scan.mjs`).

---

## Phase 0 — Freeze + machine inventory (research tickets, read-only)

0.1 **Scope freeze**: no new integration-plan execution while this plan is open (frontmatter Blocks line). LCD_07 staged artifacts stay staged.
0.2 **Audit-manifest build** (council research ticket, opus + gpt independent then merged): enumerate EVERY file the integration created or modified, from four sources cross-checked — (1) Execution Summaries of all done integration plans, (2) `git log --name-status` since 2026-06-20 on integration-relevant paths, (3) live listing of the home delegation surface (`C:\Users\rutvi\.claude\delegation\`, `C:\Users\rutvi\.claude\hooks\delegation-*.mjs` + gate, `C:\Users\rutvi\.copilot\agents\*.agent.md`), (4) repo surface (`.claude/skills/ultra-agents/**`, `.claude/hooks/lib/uplink/**`, `.claude/guardrail-config.json`, `scripts/ticket-*.mjs`, `scripts/prune-check.mjs`, `scripts/scorecard*` if present, `.claude/skills/{reflect,compile-learnings,final-q,delegation-temp,ultra-agents}/SKILL.md`, `.claude/rules/guardrail-policy.md`, memory pointer files, `.claude/state/ua-worker/` structure).
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
| GARDENER | fix-wave structural changes | Execution Summary metrics table (LOC/gate/dup deltas) | numbers present, no prose-only claims |

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
