# _ULTRAAUDIT_FINDINGS.md — UltraAudit Consolidated Findings**Date**: 2026-07-18**Ticket**: ua-merge-findings-0718## Sources Roster (every artifact dir consumed)- `.claude/state/ua-worker/ua1-coherence-merge-0717-artifacts/coherence-merged.md` (Phase 1, 21 findings)- `.claude/state/ua-worker/ua2-lot01-0718-review-artifacts/review.md` (lot01 reviewer, REJECTED)- `.claude/state/ua-worker/ua2-lot07-0718-review-artifacts/review.md` (lot07 reviewer, MATERIAL_ISSUES)- `.claude/state/ua-worker/ua2-lot08b-0718-artifacts/findings.md` (lot08b delta, 7 bak files)- `.claude/state/ua-worker/ua2-lot10b-0718-artifacts/findings.md` (lot10b delta, 6 bak files)- `.claude/state/ua-worker/ua2-lot14-0718-review-artifacts/review.md` (lot14 reviewer, MATERIAL_ISSUES)- `.claude/state/ua-worker/ua2-partitioner-0718-artifacts/dispatch-plan.md` (roster)- `.claude/state/ua-worker/ua3-gates-0718-artifacts/gate-topology.md` (Phase 3 executor)- `.claude/state/ua-worker/ua3-gates-0718-review-artifacts/review.md` (Phase 3 reviewer, REJECTED)- `.claude/state/ua-worker/ua4-lotA-0718-artifacts/lot-verdicts.md` (Phase 4 lot A)- `.claude/state/ua-worker/ua25-lot02-0718-review-artifacts/review.md` (lot25-02 reviewer, MATERIAL_ISSUES)- `.claude/state/ua-worker/ua25-lot04-0718-review-artifacts/review.md` (lot25-04 reviewer, MATERIAL_ISSUES)- `.claude/state/ua-worker/ua25-lot06-0718-review-artifacts/review.md` (lot25-06 reviewer, MATERIAL_ISSUES)- `.claude/state/ua-worker/ua25-lot07-0718-review-artifacts/review.md` (lot25-07 reviewer, MATERIAL_ISSUES)- `plans/pending/PLAN_COPILOT_INTEGRATION_ULTRAAUDIT.md` (Phase 5.1 fix-category definitions)- CEO dispatcher adjudications (source=CEO, 4 items)## Executor-Status Law Note- **ua2-lot01 REJECTED**: reviewer's H1-H7, M1-M7, E1-E3 replace executor's contested rows; uncontested executor rows survive.- **ua2-lot08 REFUTED**: all 7 executor line counts wrong + false "diff blocked" claim; reviewer authoritative on contested rows. *Reviewer content NOT read in this merge pass — flagged as gap in Coverage Reconciliation.*- **ua3-gates REFUTED**: executor claimed check-browsertool "SHIPS DISABLED" and proposed DEMOTE; reviewer found 1/19 fixture FAILS and settings.json wires it live — verdict corrected to FIX-OR-DISABLE.- **MATERIAL_ISSUES lots** (lot07, lot14, ua25-lot02/04/06/07): executor rows stand PLUS reviewer's named misses are imported as additional findings.---## Phase 1 — Vision Coherence (21 findings; import as-is from coherence-merged.md)> Source: `ua1-coherence-merge-0717-artifacts/coherence-merged.md` | All 21 findings confirmed by adversarial merge (seats A+B, opus+gpt).| id | file:line | class | severity | proposed action | source ||---|---|---|---|---|---|| P1-M01 | `.claude/skills/ultra-agents/copilot-worker.sh:166-170,586-589` | a-dead-knob | S1 | Wire wrapper uplink_mode read/enforce path before Phase 7, or remove the knob as sediment | ua1-coherence-merge-0717 || P1-M02 | `plans/pending/SUBPLAN_ASSISTANT_LAYER_HARDGATES.md:19-23` + `plans/done/SUBPLAN_LCD_02_ENFORCEMENT_HOLES.md:120-128` | c-stale-context | S2 | Add execution note to HARDGATES build: LCD_02 already wired switch behavior; G1 must not double-gate | ua1-coherence-merge-0717 || P1-M03 | `plans/pending/PLAN_LAZY_CEO_DELEGATOR.md:43-62` vs `plans/pending/SUBPLAN_ASSISTANT_LAYER_HARDGATES.md:50-55` | c-authority-conflict | S2 | Decide whether routing-policy.json is Tier-1 brokerable or Rutvik-only before building grant broker | ua1-coherence-merge-0717 || P1-M04 | `plans/done/PLAN_DELEGATION_CHEATPROOF.md:30-34,45-55` + `plans/done/SUBPLAN_PARITY_INJECTION_SYSTEM.md:45-48` | d-missing-mechanism | S1 | Add deterministic report lint: SKIP/SKIP-* output cannot support "all passed" claims | ua1-coherence-merge-0717 || P1-M05 | `.claude/state/ua-worker/lcd07-gatefix-0716-artifacts/delegation-gate.mjs.lcd07r2` (25747 bytes staged) | b-staged-unapplied | S2 | Route lcd07 path-normalization hardening to Phase 5 category C with Rutvik GO | ua1-coherence-merge-0717 || P1-M06 | `.claude/guardrail-config.json:15,36-39` | a-dual-source | S2 | Canonicalize stall behavior runtime source; make the mirror generated or explicitly non-authoritative | ua1-coherence-merge-0717 || P1-M07 | `plans/done/SUBPLAN_LCD_05_LEARNING_LANES.md:83-85` vs CEO listing | a-refuted | REFUTED | No action; worker-primer.md coexistence premise false — revisit only when primer is actually created | ua1-coherence-merge-0717 || P1-M08 | `.claude/rules/guardrail-policy.md:58-66` vs home hook contents | a-unverifiable | S1 | CEO expose/read home hook contents or treat under M13's remaining-dark-gates fix | ua1-coherence-merge-0717 || P1-M09 | `plans/done/SUBPLAN_LCD_05_LEARNING_LANES.md:10` + `SUBPLAN_LCD_06_SELF_PRUNING.md:10` | b-stale-blocks | S3 | Optional annotation: "LCD_08 exists, pending/P3 parked" | ua1-coherence-merge-0717 || P1-M10 | `plans/pending/PLAN_UPLINK_PROTOCOL.md:98-101,145-161` | c-refuted | REFUTED | No fix; UPLINK_WAVE2 gating is intended until Phase 7 calibration closes | ua1-coherence-merge-0717 || P1-M11 | `plans/pending/PLAN_DELEGATION_GOVERNOR_AND_STEERING.md:53-58` + `plans/done/SUBPLAN_LCD_07_OBSERVABILITY.md:180-181` | c-stale-assumption | S2 | Rewrite GOVERNOR A6 to use secs/outcome first; treat tokens/cost as future optional signal | ua1-coherence-merge-0717 || P1-M12 | `plans/done/SUBPLAN_LCD_07_OBSERVABILITY.md:25-30,163-183` | a-stale-anchor | S3 | No behavior fix; record as stale-anchor hygiene for future plan execution | ua1-coherence-merge-0717 || P1-M13 | `.claude/rules/guardrail-policy.md:58-66` + `check-md-first.mjs:141-202` | d-dark-gates | S1 | Add shared `fireTelemetry(gate, verdict, target)` and wire every deny/announce branch | ua1-coherence-merge-0717 || P1-M14 | `plans/done/PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md:92` vs `.claude/hooks/lib/parse-verdict.mjs:151-157` | a-stale-prose | S3 | Add D23 supersession note; behavior already updated | ua1-coherence-merge-0717 || P1-M15 | `plans/done/PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md:124-131,651-654` | a-stale-diagram | S3 | Add supersession note pointing to Execution Summary | ua1-coherence-merge-0717 || P1-M16 | `plans/done/PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md:86,417-419,656` | a-version-drift | S3 | Update D17 wording when touching the plan | ua1-coherence-merge-0717 || P1-M17 | `plans/done/PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md:399-401,654` | b-dead-helper | S3 | Mark bash parse_verdict sketch superseded | ua1-coherence-merge-0717 || P1-M18 | `plans/done/PLAN_AUDIT_COPILOT.md:1-11,18-40` (2816 lines) | b-trim-candidate | S3 | TRIM candidate after prune-check and owner confirmation; contains raw debugging transcript | ua1-coherence-merge-0717 || P1-M19 | `plans/pending/PLAN_LAZY_CEO_DELEGATOR.md:73-76` | c-stale-runorder | S2 | Annotate item #2 DONE 2026-07-15 (reactive guardrail audit closed) | ua1-coherence-merge-0717 || P1-M20 | `plans/pending/PLAN_LAZY_CEO_DELEGATOR.md:98-100` | c-stale-hot-warning | S2 | Replace HOT warnings on rows #25-26 with DONE/superseded notes | ua1-coherence-merge-0717 || P1-M21 | `plans/done/PLAN_CHAIN_PER_SESSION_ORCHESTRATION.md:78,657` | b-stale-guard-prose | S3 | Add note: invariant preserved by queue-only iteration; check_allowlist deleted PBUG-11 | ua1-coherence-merge-0717 |---## Phase 2 — Slop Sweep (ua2-lot01 through lot18 + delta lots 08b/10b)> **Executor-status applied**: lot01 REJECTED (reviewer authoritative); lot08 REFUTED (reviewer authoritative — imported via fragment A); lot08b P2-D01..D07 SUPERSEDED by lot08 reviewer rows (same 7 files, higher-accuracy verdict); all other lots executor rows stand with reviewer corrections applied for MATERIAL_ISSUES lots.### Phase 2 — Lot 01 (reviewer authoritative, executor REJECTED)| id | file:line | class | severity | proposed action | source ||---|---|---|---|---|---|| P2-01 | `.claude/guardrail-config.json:36-38` vs `~/.claude/delegation/config.json:7-9` | duplicate-config | S2 | Label repo copy as doc-only mirror or remove; wrapper reads home bounce config | ua2-lot01-0718-review || P2-02 | `.claude/guardrail-config.json:26-29` | dead-knob | S2 | Delete `skill_route_*` keys — no active wrapper read found | ua2-lot01-0718-review || P2-03 | `~/.copilot/agents/council-worker.agent.md:3,9-18` | stale-duty-count | S2 | Update 8→9 duties; add EXTERNAL_CONTENT_CONSUMED to schema | ua2-lot01-0718-review || P2-04 | `~/.copilot/agents/chief.agent.md:38-64` + `.claude/skills/ultra-agents/worker-ext.md:59-71` | doctrine-duplication | S2 | Remove inline partial duty/routing copies; point to canonical DUTY_STACK.md + routing-policy.json | ua2-lot01-0718-review || P2-05 | `~/.copilot/agents/council-reviewer.agent.md:51-64,82-99` | duplication | S2 | Remove inline skill-evidence-signatures copy; point to registry file | ua2-lot01-0718-review || P2-06 | `~/.claude/delegation/DUTY_STACK.md:83-84` (and lowercase twin, same file) | stale-schema-text | S2 | Fix injected block text that says "8-duty cycle" inside the 9-duty document | ua2-lot01-0718-review || P2-07 | `.claude/skills/ultra-agents/worker-ext.md:11` | stale-duty-count | S2 | Update "full 8-duty stack" → 9; ensure generated tickets include EXTERNAL_CONTENT_CONSUMED | ua2-lot01-0718-review || P2-08 | `~/.copilot/agents/chief.agent.md:3,65-79` | missing-duty-9-schema | S2 | Add EXTERNAL_CONTENT_CONSUMED to chief schema; fix SI-1 to mandate the field | ua2-lot01-0718-review || P2-09 | `~/.copilot/agents/council-reviewer.agent.md:29` | missing-duty-9-check | S2 | Add EXTERNAL_CONTENT_CONSUMED to reviewer's completeness check; reviewers must bounce reports missing it | ua2-lot01-0718-review || P2-10 | `.claude/guardrail-config.json:16,39` | duplicate-json-key | S2 | Remove duplicate `_stall_guard_comment` key; many parsers silently discard the first | ua2-lot01-0718-review || P2-11 | `~/.copilot/agents/council-reviewer.agent.md:51-52` vs `:98` | registry-citation-drift | S2 | Reconcile which registry file is authoritative; fix `/regression-guard` VERIFY_ARTIFACTS vs VERIFY_OUTPUT drift | ua2-lot01-0718-review || P2-12 | `~/.copilot/agents/chief.agent.md:38-64` | stale-duty-numbering | S2 | Claims "9 duties" but numbers only 1-8 and lacks inline Duty 9; point to DUTY_STACK.md instead | ua2-lot01-0718-review |> **CEO-01 adjudication**: `DUTY_STACK.md` and `duty_stack.md` are ONE file on Windows case-insensitive FS (sha256 identical = `26826C76A7AA3B0A13F3BD650718B2AD4C3400660CBE83805B165A11FBEA166B`). Any "delete the lowercase copy" proposal is VOID. | source=CEO
### Phase 2 — Lot 02 (ACCEPT-WITH-NOTES / review: ACCEPT-WITH-NOTES)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P2-LOT02-01 | ~/.claude/delegation/ASKING_DOCTRINE.md:30-33 | duplication | S1 | DELETE: sub-agent unknowns block verbatim in DUTY_STACK worker-rules-extract; silent drift on one-sided edit | exec-ua2-lot02-0718 |
| P2-LOT02-02 | ~/.claude/delegation/ASKING_DOCTRINE.md:34-37 | slop-prose | S2 | COMPACT to 1-line pointer: Claude-tier ask guidance in a worker trip-time doc is wrong audience | exec-ua2-lot02-0718 |
| P2-LOT02-03 | home delegation session-continuity note lines 10-12 | duplication | S3 | DELETE from preamble: restates §5 lines 92-96 verbatim; §5 is canonical home | exec-ua2-lot02-0718 |
| P2-LOT02-04 | home delegation session-continuity note lines 100-108 | stale-ref | S2 | REWRITE (do NOT delete): PLAN_ASSISTANT_LAYER still pending on disk; stale BLOCKED notice misdirects workers | exec-ua2-lot02-0718 (reviewer correction: delete→rewrite) |
| P2-LOT02-05 | home delegation pruning-policy note line 5 | slop-prose | S3 | COMPACT: remove stale inline current-state count from policy threshold | exec-ua2-lot02-0718 |
| P2-LOT02-06 | home delegation pruning-policy note line 11 | slop-prose | S3 | COMPACT: remove stale memory count annotation | exec-ua2-lot02-0718 (reviewer line correction) |
| P2-LOT02-07 | ~/.claude/delegation/UPLINK_DOCTRINE.md:7 | duplication | S3 | COMPACT: callout box duplicates LR-070 cross-ref; remove callout, keep §0 | exec-ua2-lot02-0718 |
| P2-LOT02-08 | ~/.claude/delegation/UPLINK_DOCTRINE.md:114-115 | slop-prose | S3 | DELETE: tangential substrate management implementation detail | exec-ua2-lot02-0718 |
| P2-LOT02-09 | ~/.claude/delegation/gap-hunt-checklist.md:3-13 | slop-prose | S3 | COMPACT: triple-blockquote prelude 11 lines → ≤3 lines | exec-ua2-lot02-0718 |
| P2-LOT02-10 | ~/.claude/delegation/interrogation-bank.md:48-50 | duplication | S3 | DELETE third question only if another generic verify-command prompt remains | exec-ua2-lot02-0718 |
| P2-LOT02-11 | home delegation outcomes-format note lines 3-4 | duplication | S3 | COMPACT: two adjacent lines state same timing/ownership idea; consolidate to 1 sentence | rev-ua2-lot02-0718 |
| P2-LOT02-12 | ~/.claude/delegation/weakness-map.md:3-5 | slop-prose | S3 | COMPACT: 3-line purpose preamble → 1 line without losing semantics | rev-ua2-lot02-0718 |

### Phase 2 — Lot 03 (MATERIAL_ISSUES / review: MATERIAL_ISSUES)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P2-LOT03-01 | copilot-worker.sh:141-143 | dead-code | S3 | DELETE duplicate branch: both if/else arms set RUN_ID identically | exec-ua2-lot03-0718 |
| P2-LOT03-02 | copilot-worker.sh:462-492 | copy-paste-drift | S3 | Extract _dispatch_copilot() function: 3 case-arms repeat same 6-arg invocation | exec-ua2-lot03-0718 |
| P2-LOT03-03 | copilot-worker.sh:629-656 | copy-paste-drift | S2 | Extract build-run-record.mjs helper: META and ledger builders share 95%+ identical JS | exec-ua2-lot03-0718 |
| P2-LOT03-04 | copilot-worker.sh:88-94 | undocumented | S3 | Document: orchestrate in WORK_TYPE enum absent from timeout table; silently inherits default 600s | exec-ua2-lot03-0718 |
| P2-LOT03-05 | parse-verdict.mjs:127-148,703-727 | copy-paste-drift | S2 | Replace local extractText() with module-level extractTextFromTranscript() | exec-ua2-lot03-0718 |
| P2-LOT03-06 | parse-verdict.mjs:410-641 | slop-code | S3 | Move 231-line self-test to parse-verdict.test.mjs | exec-ua2-lot03-0718 |
| P2-LOT03-07 | delegation-gate.mjs:161-166 | copy-paste-drift | S2 | Extract shared fireTelemetry to hook-lib: verbatim copy in delegation-gate + ua-worker-guard | exec-ua2-lot03-0718 |
| P2-LOT03-08 | delegation-gate.mjs:252-275 | copy-paste-drift | S2 | Extract shared hasPipelineIdentity to hook-lib: near-identical in delegation-gate + labor-gate; labor copy has unfixed PBUG-09 bug | exec-ua2-lot03-0718 |
| P2-LOT03-09 | labor-gate.mjs:361-382 | logic-bug | S2 | Apply PBUG-09 fix: hasPipelineIdentity in labor-gate still does forward scan; delegation-gate fixed but fix never propagated; identity escape in labor-gate | exec-ua2-lot03-0718 |
| P2-LOT03-10 | delegation-gate.mjs:1-62 | slop-prose | S3 | Move change-log prose to CHANGELOG.md; keep 1-line version tag per block | exec-ua2-lot03-0718 |
| P2-LOT03-11 | ua-worker-guard.mjs:66-71 | copy-paste-drift | S2 | Same fireTelemetry copy; resolved by shared-lib extraction (see P2-LOT03-07) | exec-ua2-lot03-0718 |
| P2-LOT03-12 | ua-worker-guard.mjs:73-84 | copy-paste-drift | S3 | Extract shared readConfig/assistantExplicitlyOff to hook-lib; identical logic in delegation-gate | exec-ua2-lot03-0718 |
| P2-LOT03-13 | delegation-nudge.mjs:46 | copy-paste-drift | S3 | Move REPO_CWD_PREFIX to shared constant: same string as GATED_REPO in ua-worker-guard | exec-ua2-lot03-0718 |
| P2-LOT03-14 | delegation-nudge.mjs:188-190 | undocumented | S3 | Add comment: isLongSourceCmd 200-char threshold is arbitrary and unexplained | exec-ua2-lot03-0718 |
| P2-LOT03-15 | delegation-nudge.mjs:204-211 | style-drift | S3 | Align readStdin to consistent implementation style across hook files | exec-ua2-lot03-0718 |
| P2-LOT03-16 | verify-run.mjs:135-137,433-436 | logic-bug | S1 | FIX: verifier never parses artifact rows, validates sha256=, or re-executes cmd=; VERIFY_ARTIFACTS proof entirely unverified (executor underclassified as KEEP) | rev-ua2-lot03-0718 |
| P2-LOT03-17 | labor-gate.mjs:265-281 | logic-bug | S2 | FIX: pipeline detection only checks first command; spec command later in pipeline bypasses gate | rev-ua2-lot03-0718 |

### Phase 2 — Lot 04 (MATERIAL_ISSUES / review: MATERIAL_ISSUES)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P2-LOT04-01 | routing-policy.json:6-12 | copy-paste-drift | S3 | COMPACT: all 7 work_type evidence strings byte-for-byte identical; move seed provenance to top-level | exec-ua2-lot04-0718 |
| P2-LOT04-02 | routing-policy.json:2 | dead-code | S3 | DELETE updated field: doCommit hardcodes 'unknown'; field is permanently misleading | exec-ua2-lot04-0718 |
| P2-LOT04-03 | model-registry.json:16,28,41,52,59 | copy-paste-drift | S3 | COMPACT: repeated 18-word live-probe suffix on all 5 model notes; move to top-level note | exec-ua2-lot04-0718 |
| P2-LOT04-04 | model-costs.json:1-13 | dead-code | S2 | DELETE entire file: all nulls; cost sort in doSelect never fires; doReport always prints unverified | exec-ua2-lot04-0718 |
| P2-LOT04-05 | gates-config.json:14-17 | contradiction | S1 | REWRITE: G1 sev=S0 but mode=announce; LR-069 §3.3 makes S0 the deny-on-landing exception; ramp_note is a lie | exec-ua2-lot04-0718 |
| P2-LOT04-06 | gates-config.json:30-35 | contradiction | S1 | REWRITE: G3 same S0/announce contradiction as G1 | exec-ua2-lot04-0718 |
| P2-LOT04-07 | gates-config.json:6-11 | contradiction | S2 | REWRITE: G0 ramp_note says deny but mode=announce | exec-ua2-lot04-0718 |
| P2-LOT04-08 | gates-config.json schema | copy-paste-drift | S3 | COMPACT: normalize G0/G1/G3 to ramp-tracking schema of G2/G4/G5 | exec-ua2-lot04-0718 |
| P2-LOT04-09 | config-liveness-registry.json:13,25,37,49,61,73 | slop-prose | S3 | REWRITE: on/off_behavior_sha fields contain semantic labels not SHA hashes; rename to semantic label fields | exec-ua2-lot04-0718 |
| P2-LOT04-10 | config-liveness-registry.json:3 | dead-code | S3 | DELETE _state_path self-annotation; a file cannot usefully reference its own path | exec-ua2-lot04-0718 |
| P2-LOT04-11 | config-liveness-registry.json all entries | copy-paste-drift | S3 | COMPACT: registered_by and last_proven identical across all 6 entries; hoist to file header | exec-ua2-lot04-0718 |
| P2-LOT04-12 | uplink-policy.json:2 | slop-prose | S3 | COMPACT _doc: 3-sentence restatement; reduce to 1-sentence pointer | exec-ua2-lot04-0718 |
| P2-LOT04-13 | uplink-policy.json:8 | schema-drift | S3 | REWRITE: stall_consult is a string while all other wires fields are booleans; not machine-readable | exec-ua2-lot04-0718 |
| P2-LOT04-14 | scorecard.mjs:11 | dead-code | S2 | DELETE orchestrate/research from WORK_TYPES: absent from routing-policy.json; records pass validation but cannot route | exec-ua2-lot04-0718 |
| P2-LOT04-15 | scorecard.mjs:193 | stale-ref | S1 | REWRITE: D12 checks VERIFY_OUTPUT; current schema uses VERIFY_ARTIFACTS; also add EXTERNAL_CONTENT_CONSUMED and ASK fields | exec-ua2-lot04-0718 + rev-ua2-lot04-0718 |
| P2-LOT04-16 | scorecard.mjs:271,334 | dead-code | S3 | REWRITE: generated and pol.updated hardcoded 'unknown'; use new Date().toISOString() | exec-ua2-lot04-0718 |
| P2-LOT04-17 | scorecard.mjs:10 | stale-ref | S2 | REWRITE: D9 pin-freshness scans wrong agent dir | exec-ua2-lot04-0718 (reviewer correction applied) |
| P2-LOT04-18 | scorecard.mjs:263-264 | over-engineering | S3 | COMPACT: add tail-keep-3 rotation after unbounded uplink-report-history.jsonl append | exec-ua2-lot04-0718 |
| P2-LOT04-19 | scorecard.mjs:58 | dead-code | S3 | COMPACT: derive NON_GREEN_OUTCOMES from OUTCOMES filter; manual sync hazard | exec-ua2-lot04-0718 |
| P2-LOT04-20 | gates-config.json:20-27 | contradiction | S1 | REWRITE: G2 is also sev=S0 but mode=announce; executor missed G2 | rev-ua2-lot04-0718 |
| P2-LOT04-21 | scorecard.mjs:194 | stale-ref | S2 | REWRITE: D12 checks wrong agents dir path | rev-ua2-lot04-0718 |
| P2-LOT04-22 | scorecard.mjs:331,336 | stale-state | S3 | REWRITE: doCommit hardcodes since:'unknown' and 'in-chat unknown' approval time | rev-ua2-lot04-0718 |
| P2-LOT04-23 | scorecard.mjs:114 | error-handling | S2 | REWRITE: missing/corrupt model-costs.json silently degrades to unverified output | rev-ua2-lot04-0718 |
| P2-LOT04-24 | scorecard.json:2 | stale-state | S3 | REWRITE: artifact carries generated:"unknown" from stale timestamp path | rev-ua2-lot04-0718 |
| P2-LOT04-25 | model-registry.json:34-38 | schema-drift | S3 | COMPACT: only gpt-5.5 includes "none" in tiers; normalize across all effort-capable models | rev-ua2-lot04-0718 |

### Phase 2 — Lot 05 (MATERIAL_ISSUES / review: MATERIAL_ISSUES)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P2-LOT05-01 | home delegation protected-splice proposal lines 1-6 | stale-ref | S1 | REWRITE: add STATUS block per splice (APPLIED date / PENDING); header says DRAFT ONLY with no status field | exec-ua2-lot05-0718 |
| P2-LOT05-02 | home delegation protected-splice proposal lines 76-340 | stale-ref | S1 | REWRITE: Splice 2 has landed-review ticket in same mirror but proposal still says DRAFT ONLY; mark APPLIED with citation | exec-ua2-lot05-0718 (reviewer confirmation) |
| P2-LOT05-03 | home delegation protected-splice proposal lines 323-580 | stale-ref | S1 | REWRITE: Splices 3 and 4 also contain stale line anchors with no APPLIED/PENDING status | rev-ua2-lot05-0718 |
| P2-LOT05-04 | ~/.claude/delegation/ticket-template.md:1-76 | copy-paste-drift | S1 | REWRITE: template missing MODEL, WORK-TYPE, REPO ROOT, EVIDENCE DIR, WRITE ALLOW-LIST fields present in all live tickets | exec-ua2-lot05-0718 |
| P2-LOT05-05 | ~/.claude/delegation/dispatcher-lessons.md:1-18 | slop-prose | S2 | COMPACT: 17-line header restates SessionStart primer doctrine; reduce to 3-line summary | exec-ua2-lot05-0718 |
| P2-LOT05-06 | ~/.claude/delegation/dispatcher-lessons.md:20-25 | copy-paste-drift | S2 | COMPACT: normalize to single YYYY-MM-DD|class|one-liner format | exec-ua2-lot05-0718 |
| P2-LOT05-07 | ~/.claude/delegation/dispatcher-lessons.md:53 | stale-ref | S3 | COMPACT: canary cost floor is a CLI constant; move to config/docs not a dated lesson entry | exec-ua2-lot05-0718 |
| P2-LOT05-08 | ~/.claude/delegation/wrapper-clear-waiter.sh:1-16 | dead-code | S2 | DELETE: zero runtime callers confirmed repo-wide; one-shot apply event reference | exec-ua2-lot05-0718 |
| P2-LOT05-09 | ~/.claude/delegation/registry-block.sh:70 | stale-ref | S3 | COMPACT: remove stale "not yet exercised live" parenthetical | exec-ua2-lot05-0718 |
| P2-LOT05-10 | home delegation assistant-fight-gate design lines 1-4 | stale-ref | S2 | REWRITE: no build-status field; add Build Status: UNBUILT|BUILT block | exec-ua2-lot05-0718 |
| P2-LOT05-11 | home delegation assistant-fight-gate design lines 23 and 63 | contradiction | S2 | REWRITE: design says default mode=deny; LR-069 says S1/S2 always land announce-first; resolve ramp policy before implementation | rev-ua2-lot05-0718 |
| P2-LOT05-12 | home delegation worker-rules extract line 7 | stale-ref | S2 | REWRITE: says 8-duty cycle; current DUTY_STACK has 9 duties; injected doctrine teaches stale schema | rev-ua2-lot05-0718 |

### Phase 2 — Lot 06 (MATERIAL_ISSUES / review: MATERIAL_ISSUES)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P2-LOT06-01 | ~/.claude/hooks/check-agent-parity.mjs:34 | dead-code | S2 | DELETE const __dirname: declared in all 6 hooks; zero uses | exec-ua2-lot06-0718 |
| P2-LOT06-02 | ~/.claude/hooks/check-closure-debt.mjs:35 | dead-code | S2 | DELETE const __dirname: same pattern | exec-ua2-lot06-0718 |
| P2-LOT06-03 | ~/.claude/hooks/check-config-liveness.mjs:27 | dead-code | S2 | DELETE const __dirname: same pattern | exec-ua2-lot06-0718 |
| P2-LOT06-04 | ~/.claude/hooks/check-delegation-envelope.mjs:36 | dead-code | S2 | DELETE const __dirname: same pattern | exec-ua2-lot06-0718 |
| P2-LOT06-05 | ~/.claude/hooks/check-isolation-perimeter.mjs:34 | dead-code | S2 | DELETE const __dirname: same pattern | exec-ua2-lot06-0718 |
| P2-LOT06-06 | ~/.claude/hooks/check-weight-council.mjs:37 | dead-code | S2 | DELETE const __dirname: same pattern | exec-ua2-lot06-0718 |
| P2-LOT06-07 | ~/.claude/hooks/check-agent-parity.mjs:32 | dead-import | S2 | REMOVE resolve from import: imported in all 6 hooks; never called | exec-ua2-lot06-0718 |
| P2-LOT06-08 | ~/.claude/hooks/check-closure-debt.mjs:32 | dead-import | S2 | REMOVE resolve from import | exec-ua2-lot06-0718 |
| P2-LOT06-09 | ~/.claude/hooks/check-config-liveness.mjs:23 | dead-import | S2 | REMOVE resolve from import | rev-ua2-lot06-0718 (reviewer catch) |
| P2-LOT06-10 | ~/.claude/hooks/check-delegation-envelope.mjs:31 | dead-import | S2 | REMOVE resolve from import | exec-ua2-lot06-0718 |
| P2-LOT06-11 | ~/.claude/hooks/check-isolation-perimeter.mjs:30 | dead-import | S2 | REMOVE resolve from import | exec-ua2-lot06-0718 |
| P2-LOT06-12 | ~/.claude/hooks/check-weight-council.mjs:33 | dead-import | S2 | REMOVE resolve from import | exec-ua2-lot06-0718 |
| P2-LOT06-13 | ~/.claude/hooks/check-agent-parity.mjs:37 | dead-code | S2 | DELETE const REPO_ROOT: declared but never referenced in G4 | exec-ua2-lot06-0718 |
| P2-LOT06-14 | ~/.claude/hooks/check-closure-debt.mjs:37 | dead-code | S2 | DELETE const REPO_ROOT: declared but never referenced in G5 | exec-ua2-lot06-0718 |
| P2-LOT06-15 | ~/.claude/hooks/check-config-liveness.mjs:29 | dead-code | S2 | DELETE const REPO_ROOT: G0 uses BASE_STATE-relative paths only | exec-ua2-lot06-0718 |
| P2-LOT06-16 | ~/.claude/hooks/check-weight-council.mjs:39 | dead-code | S2 | DELETE const REPO_ROOT: G2 never references it | exec-ua2-lot06-0718 |
| P2-LOT06-17 | ~/.claude/hooks/check-agent-parity.mjs:204-229 | copy-paste-drift | S2 | MERGE to hook-utils.mjs: emitAllow/emitDeny/failOpen/fireTelemetry/readMode/readStdin (~65 lines) identical across all 6 hooks | exec-ua2-lot06-0718 |
| P2-LOT06-18 | ~/.claude/hooks/check-closure-debt.mjs:130-179 | copy-paste-drift | S2 | MERGE to hook-utils.mjs: same 6 boilerplate functions | exec-ua2-lot06-0718 |
| P2-LOT06-19 | ~/.claude/hooks/check-config-liveness.mjs:64-117 | copy-paste-drift | S2 | MERGE to hook-utils.mjs: same 6 boilerplate functions | exec-ua2-lot06-0718 |
| P2-LOT06-20 | ~/.claude/hooks/check-delegation-envelope.mjs:234-280 | copy-paste-drift | S2 | MERGE to hook-utils.mjs: same 6 boilerplate functions | exec-ua2-lot06-0718 |
| P2-LOT06-21 | ~/.claude/hooks/check-isolation-perimeter.mjs:208-255 | copy-paste-drift | S2 | MERGE to hook-utils.mjs: same 6 boilerplate functions | exec-ua2-lot06-0718 |
| P2-LOT06-22 | ~/.claude/hooks/check-weight-council.mjs:232-260 | copy-paste-drift | S2 | MERGE to hook-utils.mjs: same 6 boilerplate functions | exec-ua2-lot06-0718 |
| P2-LOT06-23 | ~/.claude/hooks/check-config-liveness.mjs:88 | style-drift | S3 | COMPACT: G0 uses /* swallow */ in catch blocks; all other hooks use {}; normalize | exec-ua2-lot06-0718 |
| P2-LOT06-24 | ~/.claude/hooks/check-isolation-perimeter.mjs:262 | logic-bug | S1 | FIX: !detectLeakMarkers(...).length > 0 always false due to operator precedence; preflight never catches broken detectLeakMarkers; fix to .length === 0 | exec-ua2-lot06-0718 |
| P2-LOT06-25 | ~/.claude/hooks/check-agent-parity.mjs:57-58 | stale-comment | S3 | REWRITE: "see spec ask Q." references a now-resolved spec question | exec-ua2-lot06-0718 |
| P2-LOT06-26 | ~/.copilot/agents/council-planner.agent.md:23-36 | doctrine-duplication | S2 | COMPACT to pointer: Ticket Mode repeats full duty stack verbatim | exec-ua2-lot06-0718 |
| P2-LOT06-27 | ~/.copilot/agents/council-verifier.agent.md:25-86 | profile-bloat | S2 | EXTRACT + pointer: Lessons + PINJ-VERIFY spec (~53 lines) move to gate lib | exec-ua2-lot06-0718 |
| P2-LOT06-28 | ~/.copilot/agents/council-verifier.agent.md:52-60 | spec-in-prompt | S2 | EXTRACT: pseudo-code spec in runtime prompt; move to check-doctrine-echo.mjs | exec-ua2-lot06-0718 |
| P2-LOT06-29 | ~/.claude/hooks/check-delegation-envelope.mjs:336-342 | logic-bug | S1 | REWRITE: tautological self-test assertions; one has || true making it permanently green | rev-ua2-lot06-0718 |
| P2-LOT06-30 | ~/.claude/hooks/check-isolation-perimeter.mjs:189 | logic-bug | S1 | FIX: /.claude/ early-return disables leak scanning for .claude/rules/** despite line 194 claiming it is likely tracked | rev-ua2-lot06-0718 |
| P2-LOT06-31 | ~/.claude/hooks/check-config-liveness.mjs:148 | parser-gap | S2 | ADD Out-File and quoted-path coverage to extractTargetPath: PowerShell Out-File writes bypass G0 classification | rev-ua2-lot06-0718 |
| P2-LOT06-32 | ~/.copilot/agents/council-planner.agent.md:21 | self-contradictory-doctrine | S2 | DELETE or align: planner profile allows 3 sub-agents; verifier profile correctly says never spawn | rev-ua2-lot06-0718 |

### Phase 2 — Lot 07 (MATERIAL_ISSUES; executor rows stand + reviewer corrections)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P2-13 | `~/.claude/delegation/config.json.bak-lcd04:7-9` | bak-merge-blocker | S2 | Do NOT delete: bak preserves `stall_guard_action`, `stall_guard_bounce_delay_s`, `stall_guard_max_bounces` missing from live config; MERGE keys into live config first | ua2-lot07-0718-review (MISS-01) |
| P2-14 | (all other .bak files in lot07 scope) | stale-sediment | S3 | DELETE accepted per executor — backup content confirmed superseded by live counterparts | ua2-lot07-0718 (executor stood) |

> **Lot 07 executor errors noted**: ERROR-01 config diff inverted (backup 8 keys, live 5); ERROR-02 labor-gate-config bak-only differs from claimed; these do not alter net verdicts except P2-13.

### Phase 2 — Lot 08 (executor REFUTED — reviewer authoritative; dedup note: lot08b P2-D01..D07 superseded by these rows — same 7 hook bak files, reviewer line counts authoritative)

NOTE: Executor's line counts were all wrong and diff-blocked claim was false. All measurements below are reviewer-verified. Executor directional verdict (FLAG all, no git fallback) preserved only where reviewer did not contest.

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P2-LOT08-01 | ~/.claude/hooks/check-delegation-envelope.mjs.bak-cheatproof-20260715 | stale-bak | S3 | FLAG: 413 lines (executor claimed ~272); predates TP-1 through TP-5; home-only, no git fallback — verify before delete | rev-ua2-lot08-0718 |
| P2-LOT08-02 | ~/.claude/hooks/delegation-gate.mjs.bak-cheatproof-20260715 | stale-bak | S3 | FLAG: 239 lines (executor claimed ~184); predates v3 R-532 wrapper interlock; home-only, no git fallback | rev-ua2-lot08-0718 |
| P2-LOT08-03 | ~/.claude/hooks/delegation-gate.mjs.bak-lcd07 | stale-bak | S3 | **DO NOT DELETE — UNIQUE CONTENT**: 338 lines; unique load-bearing content: v4 /assistants stand-down, v5 LCD_02 worker advisory, doctrine protection, SELF_GRANT reasons, PBUG-08 fireTelemetry, PBUG-09 reverse identity scan; materially newer than cheatproof bak | rev-ua2-lot08-0718 (authoritative) |
| P2-LOT08-04 | ~/.claude/hooks/delegation-nudge.mjs.bak-lcd03 | stale-bak | S3 | FLAG: 226 lines (executor claimed ~137); predates lcd04; home-only, no git fallback | rev-ua2-lot08-0718 |
| P2-LOT08-05 | ~/.claude/hooks/delegation-nudge.mjs.bak-lcd04 | stale-bak | S3 | FLAG: 231 lines (executor claimed ~138); 5-line delta from lcd03 (not 1-line); more recent of pair | rev-ua2-lot08-0718 |
| P2-LOT08-06 | ~/.claude/hooks/delegation-primer.mjs.bak-lcd03 | stale-bak | S3 | FLAG: 118 lines (executor claimed ~105); predates D12 sentinel blocks; home-only, no git fallback | rev-ua2-lot08-0718 |
| P2-LOT08-07 | ~/.claude/hooks/labor-gate.mjs.bak-cheatproof-20260715 | stale-bak | S3 | FLAG: 130 lines (executor claimed ~72); predates v3 bash-c unwrapping, tokeniser, heredoc stripper; largest functional delta of lot | rev-ua2-lot08-0718 |

### Phase 2 — Lot 09 (MATERIAL_ISSUES / review: MATERIAL_ISSUES)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P2-LOT09-01 | ~/.claude/delegation/private/gates.sha256.tmp-backup | duplicate | S3 | DELETE: byte-for-byte identical to gates.sha256; zero independent information | exec-ua2-lot09-0718 |
| P2-LOT09-02 | ~/.claude/delegation/grants-audit.log | log-quality | S3 | COMPACT: add rotation policy; log grows unboundedly | exec-ua2-lot09-0718 |
| P2-LOT09-03 | ~/.claude/delegation/labor-gate-audit.log | log-quality | S2 | FLAG-for-Rutvik: full multi-line bash blobs verbatim; consider truncating to 500 chars + truncated:true flag | exec-ua2-lot09-0718 |
| P2-LOT09-04 | ~/.claude/delegation/outcomes.jsonl:2-140 | format-quality | S2 | FLAG-for-Rutvik: ~70% entries have ts:"unknown"; inconsistent ticket_id formats | exec-ua2-lot09-0718 |
| P2-LOT09-05 | home delegation routing changes log | dead-log | S3 | FLAG-for-Rutvik: file is EMPTY (0 bytes); writer mechanism may be dark from day 1 | exec-ua2-lot09-0718 |
| P2-LOT09-06 | home delegation self-incidents log line 1 | format-quality | S3 | FLAG-for-Rutvik: line 1 is JSONL; lines 2-11 are freetext prose; two formats in one file | exec-ua2-lot09-0718 |
| P2-LOT09-07 | ~/.claude/delegation/self_incidents.log:2-11 | pattern | S2 | FLAG-for-Rutvik: 4 of 11 entries are recurring self-work violations; un-gated recurrence class | exec-ua2-lot09-0718 |
| P2-LOT09-08 | ~/.claude/delegation/labor-gate-audit.log:13-14 | schema-inconsistency | S2 | FIX: two rows missing session_id; backfill or null-tag legacy rows | rev-ua2-lot09-0718 |
| P2-LOT09-09 | ~/.claude/delegation/outcomes.jsonl | data-inconsistency | S2 | FIX: 17 rows have outcome:"bounced-then-green" with bounces:0; contradictory metrics | rev-ua2-lot09-0718 |
| P2-LOT09-10 | ~/.claude/delegation/grants-audit.log:1-2,109-110 | data-quality | S2 | FIX: fixture/probe contamination rows + empty ticket_id in live audit ledger; remove or tag fixture rows | rev-ua2-lot09-0718 |

### Phase 2 — Lot 10 (MATERIAL_ISSUES / review: MATERIAL_ISSUES)

NOTE: Executor declared all 6 bak files unauditable (false blocker; mirror had them). Rows 01-06 are reviewer-authoritative; rows 07-09 apply reviewer corrections to executor keep/stale verdicts.

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P2-LOT10-01 | ~/.copilot/agents/chief.agent.md.bak-2026-07-14T09-38-29-747Z | stale-bak | S3 | FLAG: 144 lines; pre-dates A6b session-continuity and A8 rival-collaboration; verify live supersedes before delete | rev-ua2-lot10-0718 |
| P2-LOT10-02 | ~/.copilot/agents/chief.agent.md.bak-cheatproof-20260715 | stale-bak | S3 | FLAG: 158 lines; preserves stronger role boundary; verify live fully supersedes all constraints before delete | rev-ua2-lot10-0718 |
| P2-LOT10-03 | ~/.copilot/agents/council-planner.agent.md.bak-cheatproof-20260715 | stale-bak | S3 | FLAG: 30 lines; older/smaller profile; quarantine pending archive confirmation | rev-ua2-lot10-0718 |
| P2-LOT10-04 | ~/.copilot/agents/council-reviewer.agent.md.bak-cheatproof-20260715 | stale-bak | S3 | FLAG: 56 lines; older profile; quarantine pending archive confirmation | rev-ua2-lot10-0718 |
| P2-LOT10-05 | ~/.copilot/agents/council-verifier.agent.md.bak-cheatproof-20260715 | stale-bak | S3 | FLAG: 21 lines; older profile; quarantine pending archive confirmation | rev-ua2-lot10-0718 |
| P2-LOT10-06 | ~/.copilot/agents/council-worker.agent.md.bak-cheatproof-20260715 | stale-bak | S3 | FLAG: 49 lines; older profile; quarantine pending archive confirmation | rev-ua2-lot10-0718 |
| P2-LOT10-07 | ~/.claude/delegation/assistant-state.json | state | S3 | KEEP: {"assistant":"on"}; callers: delegation-primer.mjs, delegation-gate.mjs, delegation-nudge.mjs, ua-worker-guard.mjs | exec-ua2-lot10-0718 (reviewer correction applied) |
| P2-LOT10-08 | ~/.claude/delegation/candidates.txt | state | S3 | KEEP: 5 model IDs; callers: discover.sh + scorecard.mjs | exec-ua2-lot10-0718 |
| P2-LOT10-09 | ~/.claude/delegation/cli-version.txt | stale-state | S3 | FLAG: no live mirror delegation file reads it; bak-era state only | rev-ua2-lot10-0718 (executor error corrected) |

### Phase 2 — Lot 11 (MATERIAL_ISSUES / review: MATERIAL_ISSUES)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P2-LOT11-01 | check-todo-injection.mjs:756-1411 | slop-code | S2 | COMPACT: extract 656-line self-test suite to test-todo-injection.mjs; 46% of file is inline tests | exec-ua2-lot11-0718 |
| P2-LOT11-02 | check-todo-injection.mjs:692-702 | copy-paste-drift | S2 | MERGE: extract textOf() to hook-utils.mjs; byte-for-byte identical to check-identity-switch.mjs:320-330 | exec-ua2-lot11-0718 |
| P2-LOT11-03 | check-identity-switch.mjs:320-330 | copy-paste-drift | S2 | MERGE: extract textOf() to hook-utils.mjs (same extraction as P2-LOT11-02) | exec-ua2-lot11-0718 |
| P2-LOT11-04 | check-todo-injection.mjs:60 + check-identity-switch.mjs:45 | copy-paste-drift | S2 | MERGE: EXECUTE_LOOKBACK = 200 to shared module; keep-in-sync comment acknowledges risk | exec-ua2-lot11-0718 |
| P2-LOT11-05 | check-todo-injection.mjs:650-667 + check-identity-switch.mjs:209-223 | copy-paste-drift | S2 | MERGE: isInExecuteContext() near-identical 18-line function to shared module | exec-ua2-lot11-0718 |
| P2-LOT11-06 | check-todo-injection.mjs:669-690 + check-identity-switch.mjs:180-200 | copy-paste-drift | S2 | MERGE: hasOverrideAuthorization() to shared module; todo version hardcodes 3 turns vs env-configurable | exec-ua2-lot11-0718 |
| P2-LOT11-07 | relevant-injection.mjs:183-189 | dead-code | S3 | DELETE outer try-catch: readStdin() already catches all errors; outer catch can never fire | exec-ua2-lot11-0718 |
| P2-LOT11-08 | chain-state.sh:67-72 + chain-state.mjs:96-102 | dead-code | S2 | DELETE cs_history_append: no live caller found; git grep confirms | rev-ua2-lot11-0718 |
| P2-LOT11-09 | check-identity-switch.mjs:180-197 + check-todo-injection.mjs:669-687 | logic-bug | S2 | FIX: override approval ordering not enforced; approve-before-request still authorizes inside window; require authIndex > requestIndex | rev-ua2-lot11-0718 |
| P2-LOT11-10 | check-identity-switch.mjs:57,195 vs check-todo-injection.mjs:54 | schema-drift | S2 | REWRITE: centralize LR-043 override semantics; identity gate has batch-approval + env-configurable turns; todo gate does not | rev-ua2-lot11-0718 |


### Phase 2 — Lot 12 (S1+S2+S3 / review: MATERIAL_ISSUES)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P2-LOT12-01 | `.claude/hooks/lib/uplink/redact.mjs:17` | stale-comment | S2 | COMPACT: rewrite comment to match actual regex | exec ua2-lot12-0718 |
| P2-LOT12-02 | `.claude/hooks/relevant-injection.sh:44` | fragile-path | S2 | REWRITE: use BASH_SOURCE-relative lib path for CWD-independence | exec ua2-lot12-0718 |
| P2-LOT12-03 | `.claude/hooks/lib/check-mistake-ledger.mjs:373` | duplication | S2 | MERGE safeLoadTranscript into shared lib/transcript-loader.mjs | exec ua2-lot12-0718 |
| P2-LOT12-04 | `.claude/identity-gate-config.json` | metadata-liveness | S2 | CORRECT: runtime-live = mode only; _comment/_provenance/ramp_* are policy metadata | review ua2-lot12-0718-review |
| P2-LOT12-05 | `.claude/hooks/lib/uplink/uplink.test.mjs:40-46` | test-coverage-gap | S2 | ADD non-header prose bearer test (e.g. `please inspect bearer ${secret}`) | review ua2-lot12-0718-review |
| P2-LOT12-06 | `.claude/hooks/lib/uplink/uplink.test.mjs:70-80` | vacuous-assert | S2 | REPLACE mysecrettoken fixture with real nested bearer/API-key fixture | review ua2-lot12-0718-review |
| P2-LOT12-07 | `.claude/hooks/relevant-injection.sh:37` | premature-work | S3 | COMPACT: move mkdir -p to after empty-stdin guard | exec ua2-lot12-0718 |
| P2-LOT12-08 | `.claude/hooks/lib/check-mistake-ledger.mjs:163-165` | redundant-guard | S3 | KEEP: JS empty-stdin + stop_hook_active guards are valid defense-in-depth | exec ua2-lot12-0718 |
| P2-LOT12-09 | `.claude/hooks/lib/check-md-first.mjs:62-68` | trivial-duplication | S3 | COMPACT: extract normPath(p) helper reused by isSpecPath and extractClient | exec ua2-lot12-0718 |
| P2-LOT12-10 | `.claude/hooks/lib/uplink/uplink.test.mjs:167-187` | test-coverage-gap | S3 | ADD overflow-truncation test with single long non-space word | review ua2-lot12-0718-review |

### Phase 2 — Lot 13 (S1+S2+S3 / review: MATERIAL_ISSUES)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P2-LOT13-01 | `.claude/settings.local.json:157` | LR-ENC-003-violation | S1 | DELETE Bash(env -u CI CI_ENV=e2e ...) grant — LR-ENC-003 prohibits CI_ENV=e2e locally | exec ua2-lot13-0718 |
| P2-LOT13-02 | `.claude/context/navigation.md:71` | stale-reference | S2 | DELETE row or repath to clients/encore/CLAUDE.md | exec ua2-lot13-0718 |
| P2-LOT13-03 | `.claude/settings.local.json:147` | dead-code | S2 | DELETE hardcoded one-shot cp command (source file gone) | exec ua2-lot13-0718 |
| P2-LOT13-04 | `.claude/settings.local.json:153` | dead-code | S2 | DELETE hardcoded one-shot rm for specific plan file that already landed | exec ua2-lot13-0718 |
| P2-LOT13-05 | `.claude/settings.local.json:156` | dead-code | S2 | DELETE escaped PowerShell Move-Item one-liner for PLAN_CSV_TO_XLSX | exec ua2-lot13-0718 |
| P2-LOT13-06 | `.claude/settings.local.json:239` | dead-code | S2 | DELETE hardcoded god_staging git-commit one-shot backup | exec ua2-lot13-0718 |
| P2-LOT13-07 | `.claude/settings.local.json:148-190` | session-debris | S2 | DELETE ~15 PowerShell debug inspection one-liners | exec ua2-lot13-0718 |
| P2-LOT13-08 | `.claude/settings.local.json:212-219` | session-debris | S2 | DELETE single-use python/xlsx debug inspection commands | exec ua2-lot13-0718 |
| P2-LOT13-09 | `.claude/agents/*.md:HARD_STOP_0` (6 files) | duplication | S2 | MERGE detect→STOP→write rule into AGENT_SHARED_RULES.md §NEW; add per-agent pointer | exec ua2-lot13-0718 |
| P2-LOT13-10 | `.claude/agents/*.md:USER_SAYS_STOP` (6 files) | duplication | S2 | MERGE into AGENT_SHARED_RULES.md §NEW | exec ua2-lot13-0718 |
| P2-LOT13-11 | `.claude/agents/*.md:BEFOREUNLOAD_TRAP` (6 files) | duplication | S2 | DELETE per-agent copies; AGENT_SHARED_RULES.md §12 is canonical | exec ua2-lot13-0718 |
| P2-LOT13-12 | `GENERATOR.md:12,HEALER.md:7,MAINTAINER.md:6` (LR-058) | duplication | S2 | MERGE NO INTERNAL JARGON block into AGENT_SHARED_RULES.md §NEW | exec ua2-lot13-0718 |
| P2-LOT13-13 | `GENERATOR.md:15,HEALER.md:10` (LR-060) | duplication | S2 | MERGE NO HANDOFF WITH RED TESTS block | exec ua2-lot13-0718 |
| P2-LOT13-14 | `GENERATOR.md:13,HEALER.md:9,PLANNER.md:21,REQUIREMENTS.md:10` (LR-061) | duplication | S2 | MERGE verify-before-blocked + positive-control | exec ua2-lot13-0718 |
| P2-LOT13-15 | `AUDIT.md:11,PLANNER.md:19,REQUIREMENTS.md:11` (LR-062) | duplication | S2 | MERGE walk-completeness + TDW verdict-trail | exec ua2-lot13-0718 |
| P2-LOT13-16 | `AUDIT.md:11b,PLANNER.md:19b,REQUIREMENTS.md:11b` (§20) | duplication | S2 | DELETE per-agent §20 Walk Doctrine v2 bodies; replace with 1-line pointer | exec ua2-lot13-0718 |
| P2-LOT13-17 | `PLANNER.md:22,REQUIREMENTS.md:12` (LR-040c) | duplication | S2 | MERGE empty-surface investigation mandate | exec ua2-lot13-0718 |
| P2-LOT13-18 | `PLANNER.md:23,REQUIREMENTS.md:13` (ALL-045) | duplication | S2 | MERGE observation-reporting block | exec ua2-lot13-0718 |
| P2-LOT13-19 | `.claude/agents/*.md:activity-log-row` (6 files) | duplication | S3 | MERGE into AGENT_SHARED_RULES.md §13 | exec ua2-lot13-0718 |
| P2-LOT13-20 | `.claude/agents/*.md:FCC_intro_line` (6 files) | duplication | S3 | COMPACT: delete shared opener + cross-ref footer | exec ua2-lot13-0718 |
| P2-LOT13-21 | `.claude/closure-config.json:20` | incomplete-config | S3 | ADD ramp_note + flip criterion to test_status_mode block | exec ua2-lot13-0718 |
| P2-LOT13-22 | `.claude/context/patterns.md:42` | stale-reference | S3 | VERIFY/UPDATE or remove specific line-number anchors | exec ua2-lot13-0718 |
| P2-LOT13-23 | `.claude/hooks/lib/check-plan-closure.mjs:181-188` + `scripts/validate-plan-closure.mjs:960-977` | announce-gap | S2 | ADD buildTestStatusAnnounceWarning() beside C6/Cx warn path | review ua2-lot13-0718-review |
| P2-LOT13-24 | `.claude/context/navigation.md:78-120` | context-cost | S2 | DEMOTE exploration-registry to .claude/context/exploration-registry.md; 3-line pointer | review ua2-lot13-0718-review |
| P2-LOT13-25 | `.claude/context/navigation.md:87` | stale-reference | S2 | CREATE/recover hist-root-map-local-office-basic-info.md or delete pending-creation row | review ua2-lot13-0718-review |
| P2-LOT13-26 | `.claude/context/navigation.md:88` | stale-reference | S2 | REPATH or remove claims about BUG-LOC-MGH-002.json and BUG-LOC-MGH-003.json | review ua2-lot13-0718-review |
| P2-LOT13-27 | `.claude/context/navigation.md:95,102` | stale-reference | S2 | REPATH PLAN_CHAIN and SUBPLAN_ACCOUNT_ADDRESS_FCC to plans/done/ | review ua2-lot13-0718-review |
| P2-LOT13-28 | `.claude/context/navigation.md:109` | transient-owner | S2 | REPATH transient task_054e2fe7 chip to real done/pending artifact | review ua2-lot13-0718-review |
| P2-LOT13-29 | `.claude/context/navigation.md:140-150` | maintenance-gap | S3 | ADD weekly/monthly registry liveness sweep + size budget | review ua2-lot13-0718-review |
| P2-LOT13-30 | `.claude/settings.local.json:157-159` | self-contradiction | S2 | DELETE three Bash(env ...) grants or update file header | review ua2-lot13-0718-review |
| P2-LOT13-31 | `.claude/settings.local.json:77` | over-broad-grant | S2 | REMOVE taskkill //F //IM * image-name grant; use PID-specific kill only | review ua2-lot13-0718-review |
| P2-LOT13-32 | `.claude/context/patterns.md:40` | stale-reference | S2 | REPATH base-page.ts anchor to clients/encore/src/pages/base.page.ts | review ua2-lot13-0718-review |

### Phase 2 — Lot 14 (MATERIAL_ISSUES; executor rows stand + reviewer misses)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P2-15 | `.claude/skills/questionnaire/SKILL.md:23` vs `:84` | contradiction | S2 | Choose one question-batch limit (10 or 5) and delete the contradictory line | ua2-lot14-0718-review |
| P2-16 | `audit/SKILL.md:5` frontmatter vs `:25` | frontmatter-contradiction | S2 | Fix auto-calls: identity, reflect — /reflect only fires in review mode | ua2-lot14-0718-review |
| P2-17 | `audit/SKILL.md:365-373` | missed-D23-instance | S2 | Add audit/SKILL.md to D23 compaction pass | ua2-lot14-0718-review |
| P2-18 | `assistants/SKILL.md:43-45,61-62` vs `:18-21,80-85` | OFF-status-contradiction | S2 | Fix OFF status text: "direct council admin (legacy)" contradicts "no copilot dispatches" | ua2-lot14-0718-review |
| P2-19 | `compile-learnings/SKILL.md:3` | wrong-rule-home | S2 | Fix description: graduation target is .claude/rules/ or LEARNED_RULES.md | ua2-lot14-0718-review |
| P2-20 | `.claude/skills/planning/SKILL.md:174` | auto-call-list-incomplete | S3 | Add /identity to auto-call list | ua2-lot14-0718-review |
| P2-21 | `delegation-temp/SKILL.md:156-160` | graduation-condition-met | S2 | DELETE: LCD_01/02/03 all done; skill's own graduation condition met | ua2-lot14-0718 |
| P2-22 | `audit/SKILL.md:63-69` | stale-grep-example | S3 | Make grep example shell-neutral/PowerShell equivalent | ua2-lot14-0718 |
| P2-23 | `compile-learnings/SKILL.md:192-199` | wrong-rule-home | S2 | Update graduation routing to .claude/rules/ per current rule homes | ua2-lot14-0718 |

### Phase 2 — Lot 15 (S2+S3 / review: MATERIAL_ISSUES)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P2-LOT15-01 | `scripts/prune-check.mjs:83-115` | code-gap | S2 | ADD .claude/**/*.md scan class; SKILL.md-only references get false-safe verdict without it | exec ua2-lot15-0718 |
| P2-LOT15-02 | `scripts/ticket-skill-scan.mjs:51-66` | duplication | S3 | COMPACT: extract STOPWORDS to shared module with run-relevant-scan.mjs | exec ua2-lot15-0718 |
| P2-LOT15-03 | `.claude/state/fightinnovation/**` (6 files) | state-archive | S3 | KEEP-as-archive: completed ring prompts; zero automation references | exec ua2-lot15-0718 |
| P2-LOT15-04 | `scripts/identity-ownership.mjs:297-300` | security-gap | S1 | FIX: deny when ownershipFor().action === "HARD_STOP" BEFORE OWNER short-circuit in canWrite | review ua2-lot15-0718-review |
| P2-LOT15-05 | `scripts/verify-no-stale-live-refs.mjs:44-52` | coverage-gap | S2 | ADD ^\.claude/hooks/ to INCLUDE set | review ua2-lot15-0718-review |

### Phase 2 — Lot 16 (S2+S3 / review: MATERIAL_ISSUES)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P2-LOT16-01 | `scripts/ticket-doctrine-from-scope.test.mjs:235-257` | dead-test | S2 | DELETE DEFECT-5 block — errorCalled can never become true; assert.ok(false) fires every run | exec ua2-lot16-0718 |
| P2-LOT16-02 | `scripts/ticket-doctrine-from-scope.test.mjs:210-231` | dead-test | S3 | DELETE or REWRITE DEFECT-4 vacuous-pass test | exec ua2-lot16-0718 |
| P2-LOT16-03 | `scripts/ticket-doctrine-from-scope.mjs:246` | dead-param | S3 | COMPACT: remove deprecated _repoRoot = null parameter | exec ua2-lot16-0718 |
| P2-LOT16-04 | `scripts/generate-label-inventory.mjs:13` | unused-import | S3 | DELETE statSync import | exec ua2-lot16-0718 |
| P2-LOT16-05 | `scripts/generate-label-inventory.mjs:14` | unused-import | S3 | DELETE relative import | exec ua2-lot16-0718 |
| P2-LOT16-06 | `scripts/ticket-doctrine-from-scope.mjs:260-284` | parser-gap | S2 | REWRITE parseScopePaths to parse ## FILE LIST markdown table path column | review ua2-lot16-0718-review |
| P2-LOT16-07 | `scripts/ticket-doctrine-from-scope.test.mjs:187-204` | stale-test-name | S3 | REWRITE comments/names to say glob-intersection | review ua2-lot16-0718-review |
| P2-LOT16-08 | `scripts/walk-coverage/enumerate-page.mjs:56-58,308-314` | contradictory-comment | S2 | REWRITE comment or implement promised generic role/aria opener | review ua2-lot16-0718-review |
| P2-LOT16-09 | `scripts/walk-coverage/enumerate-page.mjs:98-104` | stale-config | S2 | REWRITE corporate-pricing-detail to activate tab or split out | review ua2-lot16-0718-review |
| P2-LOT16-10 | `scripts/walk-coverage/critic-prompt.md:35-36` | review-method-gap | S3 | REWRITE sampling instruction to require at least one item from every non-empty group | review ua2-lot16-0718-review |

### Phase 2 — Lot 17 (S2+S3 / review: MATERIAL_ISSUES)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P2-LOT17-01 | `scripts/ship-client.ps1` (XLSX gates) | cross-platform-drift | S2 | ADD Encore-specific XLSX freshness check (sh exits 6/7) and post-ship workbook-presence check | exec ua2-lot17-0718 |
| P2-LOT17-02 | `scripts/ship-branch.sh:100-101` | drift-risk | S3 | NOTE: DENY_GLOBS is manual copy of forbidden-patterns.mjs; document risk | exec ua2-lot17-0718 |
| P2-LOT17-03 | `scripts/xlsx-lint-rules.mjs:181` | over-broad | S3 | REVIEW camelCase-call ban; add fixture proving no false positive | exec ua2-lot17-0718 |
| P2-LOT17-04 | `scripts/xlsx-cell-diff.mjs` | orphan | S3 | FLAG: no CI wiring; efficiency verdict deferred | exec ua2-lot17-0718 |
| P2-LOT17-05 | `scripts/walk-coverage/tdw-probe.mjs:70` | dead-code | S3 | COMPACT: replace dense collect lambda with readable form | exec ua2-lot17-0718 |
| P2-LOT17-06 | `scripts/ship-client.ps1:53-55` | false-green-risk | S1 | FIX: add $LASTEXITCODE checks after npm install --silent and npx playwright test --list | review ua2-lot17-0718-review |
| P2-LOT17-07 | `scripts/ship-client.ps1:39-40` | false-green-risk | S2 | FIX: check $LASTEXITCODE after tar before deleting _archive.tar | review ua2-lot17-0718-review |
| P2-LOT17-08 | `scripts/xlsx-lint-rules.mjs:6-9` | stale-comment | S3 | REWRITE or wire real import; to-xlsx.ts import not found | review ua2-lot17-0718-review |

### Phase 2 — Lot 18 (S2+S3 / review: MATERIAL_ISSUES)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P2-LOT18-01 | `tsconfig.json:12` + `test-client.ts` | shipped-dead-file | S2 | COMPACT: remove test-client.ts from tsconfig include; create tsconfig.test.json | exec ua2-lot18-0718 |
| P2-LOT18-02 | `src/rotation.ts:255-263` | undocumented-design | S2 | DOCUMENT or FIX: after MAX_429_RETRIES on one key, remaining keys never tried | exec ua2-lot18-0718 |
| P2-LOT18-03 | `src/rotation.ts:173` + `:216-225` | duplicate-logic | S3 | MERGE: extract formatExhaustedMessage() | exec ua2-lot18-0718 |
| P2-LOT18-04 | `src/rotation.ts:8` | misleading-name | S3 | COMPACT: rename MAX_ROTATIONS to MAX_KEY_ATTEMPTS | exec ua2-lot18-0718 |
| P2-LOT18-05 | `.gitignore:3` + `package-lock.json` | tracked-but-ignored | S2 | CHOOSE POLICY: lockfile IS git-tracked; remove ignore entry or untrack | CEO correction |
| P2-LOT18-06 | `src/tavily-client.ts:18` | credential-scan | S3 | KEEP: Authorization: ****** is benign template literal (CEO-confirmed) | CEO |
| P2-LOT18-07 | `src/index.ts:85` | schema-gap | S2 | FIX: add .max(20) to z.array(z.string()) for web_extract URL list | review ua2-lot18-0718-review |
| P2-LOT18-08 | `src/index.ts:21-32` | implicit-parsing | S2 | FIX: accept only explicit TAVILY_KEY_N= names in .env.keys | review ua2-lot18-0718-review |

> **CEO-02**: validate-advisory module = DEAD (zero references in copilot-worker.sh wrapper).
> **CEO-03**: package-lock.json IS git-tracked despite .gitignore (tracked-but-ignored quirk).

### Phase 2 — Delta lot 10b (6 agent bak files; lot08b rows deduped into lot08 reviewer section)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P2-D08 | `~/.copilot/agents/chief.agent.md.bak-2026-07-14T09-38-29-747Z` | stale-sediment | S3 | DELETE — old 8-duty schema, no DISPATCH/NEVER-DO; live subsumes | ua2-lot10b-0718 |
| P2-D09 | `~/.copilot/agents/chief.agent.md.bak-cheatproof-20260715` | stale-sediment | S3 | DELETE — intermediate 9-duty but VERIFY_OUTPUT not VERIFY_ARTIFACTS; live subsumes | ua2-lot10b-0718 |
| P2-D10 | `~/.copilot/agents/council-planner.agent.md.bak-cheatproof-20260715` | stale-sediment | S3 | DELETE — only diff is VERIFY_OUTPUT vs VERIFY_ARTIFACTS; live subsumes | ua2-lot10b-0718 |
| P2-D11 | `~/.copilot/agents/council-reviewer.agent.md.bak-cheatproof-20260715` | stale-sediment | S3 | DELETE — pre-PINJ; missing entire §PINJ block | ua2-lot10b-0718 |
| P2-D12 | `~/.copilot/agents/council-verifier.agent.md.bak-cheatproof-20260715` | stale-sediment | S3 | DELETE — pre-PINJ-VERIFY; missing entire §PINJ-VERIFY block | ua2-lot10b-0718 |
| P2-D13 | `~/.copilot/agents/council-worker.agent.md.bak-cheatproof-20260715` | stale-sediment | S3 | DELETE — pre-VERIFY_ARTIFACTS; missing D12-bounce lesson | ua2-lot10b-0718 |


---

## Phase 2.5 — Harness Efficiency Audit (ua25-lot01 through lot07)

### Phase 2.5 — Lot 01 (S3-efficiency / review: MATERIAL_ISSUES)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P25-LOT01-01 | `.claude/hooks/browsertool-gate.sh:23-33` | dead-prose | S3 | COMPACT: move HOW-TO-ENABLE/DISABLE guide to CLI_BROWSER_GUIDE.md §6.x; 11→1 | exec ua25-lot01-0718 |
| P25-LOT01-02 | `.claude/hooks/browsertool-gate.sh:34-45` | duplication | S3 | COMPACT: remove DESIGN LESSONS block (dup of check-browsertool.mjs header); 12→0 | exec ua25-lot01-0718 |
| P25-LOT01-03 | `.claude/hooks/lib/check-browsertool.mjs:23-44` | bloated-header | S3 | COMPACT: relocate 3-source hierarchy inside resolveActiveSubplan(); 22→inline | exec ua25-lot01-0718 |
| P25-LOT01-04 | `check-browsertool.mjs:337-347` + `check-bug-baseline.mjs:178-187` | cross-hook-dup | S3 | MERGE identical emitAllow(reason) into hook-utils.mjs; 14→6 | exec ua25-lot01-0718 |
| P25-LOT01-05 | `check-browsertool.mjs:128-139` + `check-execution-completion.mjs:290-308` | cross-hook-dup | S3 | MERGE JSONL transcript parse loop into hook-utils.mjs::parseTranscript; 31→18 | exec ua25-lot01-0718 |
| P25-LOT01-06 | `test-browsertool-fixtures.mjs:43-81` | dead-design-doc | S3 | COMPACT: replace 39-line rejected-approach with 4-line rationale | exec ua25-lot01-0718 |
| P25-LOT01-07 | `check-bug-baseline.mjs:1-11` | verbose-incident | S3 | COMPACT: shrink THE HOLE THIS CLOSES header 11→4 lines | exec ua25-lot01-0718 |
| P25-LOT01-08 | `execution-completion-gate.sh:36-50` | dup-guard-blocks | S3 | COMPACT: merge identical mode+lib_path guard blocks; 15→~9 | exec ua25-lot01-0718 |
| P25-LOT01-09 | `check-execution-completion.mjs:44` | eager-heavy-import | S3 | COMPACT: lazy-load coverageVerdict inside decide() path only | exec ua25-lot01-0718 |
| P25-LOT01-10 | `check-execution-completion.mjs:310-328` | over-complex | S3 | COMPACT: appendStateEntry()+atomicWrite() to ~13 lines; 20→13 | exec ua25-lot01-0718 |
| P25-LOT01-11 | `test-browsertool-fixtures.mjs:19-81` | dead-design-doc | S3 | COMPACT: reviewer widens scope to lines 19-81; 63→~8 | review ua25-lot01-0718-review |
| P25-LOT01-12 | `bug-baseline-gate.sh:4-15` | bloated-header | S3 | COMPACT: wrapper repeats lib header enum/scope; 12→5-6 | review ua25-lot01-0718-review |
| P25-LOT01-13 | `check-execution-completion.mjs:5-36` | bloated-header | S3 | COMPACT: incident narrative duplicates gate.sh header; 32→18-20 | review ua25-lot01-0718-review |
| P25-LOT01-14 | `check-browsertool.mjs:291-298` | stale-comment | S3 | COMPACT: comment says "top ~80 lines" but code scans 120 | review ua25-lot01-0718-review |

### Phase 2.5 — Lot 02 (MATERIAL_ISSUES: lock-path bypass + compaction caution)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P25-M01 | `.claude/hooks/lib/check-plan-closure.mjs:39-41,311-317` | hard-deny-bypass | S2 | Fix lock-path bypass: `ls lock; rm lock` bypasses READ_ONLY_PREFIX_RX + WRITE_OP_RX | ua25-lot02-0718-review |
| P25-M02 | `.claude/hooks/lib/{check-graft-ship,check-jargon,check-no-verify,check-plan-closure}.mjs` | compaction-risk | S2 | hook-utils.mjs: helper must accept gate label; ship with self-tests for all four | ua25-lot02-0718-review |
| P25-M03 | (boilerplate in lot25-02 scope) | duplication | S3 | Extract emitAllow/emitDeny/failOpen + constants into hook-utils.mjs; net ~91 lines | ua25-lot02-0718 |

### Phase 2.5 — Lot 03 (S3-efficiency / review: MATERIAL_ISSUES)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P25-LOT03-01 | `CLAUDE.md:128-130` | duplication | S3 | DELETE "Active Client" section — verbatim dup of @-references table row | exec ua25-lot03-0718 |
| P25-LOT03-02 | `CLAUDE.md:144-146` | near-duplication | S3 | COMPACT: fold codename-to-role mapping into Identity Discipline before deleting | exec ua25-lot03-0718 + corrected by review |
| P25-LOT03-03 | `.claude/rules/hooks-identity.md:83-85` | stale-section | S3 | COMPACT: §B heading+3-line body to 1-line inline note | exec ua25-lot03-0718 |
| P25-LOT03-04 | `.claude/hooks/lib/check-rca-verdict.mjs:282-285` | dead-branch | S3 | REVIEW: {warnings:[]} branch never self-produced; check history before deletion | exec ua25-lot03-0718 (qualified by review) |
| P25-LOT03-05 | `.claude/rules/guardrail-policy.md` | coverage-gap | S2 | RECOUNT: file is 117 lines not 97; LR-070 (lines 100-116) omitted from efficiency review | review ua25-lot03-0718-review |
| P25-LOT03-06 | `.claude/rules/specs.md:250-452` | coverage-gap | S2 | COMPLETE review of lines 250-452; exec admitted sampling only lines 1-250 | review ua25-lot03-0718-review |

### Phase 2.5 — Lot 04 (MATERIAL_ISSUES: baseline count corrections + missed compaction)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P25-M04 | `docs/read_only_docs/AGENT_SHARED_RULES.md:835-867` | missed-compaction | S2 | §20 live-walk doctrine (33 lines) — compact to short trigger + pointer file | ua25-lot04-0718-review |
| P25-M05 | `.claude/skills/encore-questions/SKILL.md:104-180` | missed-compaction | S3 | Chrome verification protocol verbose; state-machine table saves >25 lines | ua25-lot04-0718-review |
| P25-M06 | `.claude/skills/coverage/SKILL.md:39-52` + `.claude/skills/ultracoverage/SKILL.md:36-49` | duplication | S3 | Near-identical authoring prose; merge into shared coverage-authoring pointer | ua25-lot04-0718-review |
| P25-M07 | `docs/read_only_docs/AGENT_SHARED_RULES.md` | count-correction | S2 | Baseline corrected: 867 lines not 657; recompute savings. Duplicate ALL-054 at :696-697 vs :741 — renumber | ua25-lot04-0718-review |
| P25-M08 | `docs/read_only_docs/AGENT_SHARED_RULES.md:391-549,770-833` | compaction | S2 | §12 (159 lines) RCA doctrine + §19 (64 lines) audit prohibition — compact via table | ua25-lot04-0718 |

### Phase 2.5 — Lot 05 (S3-efficiency / review: MATERIAL_ISSUES)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P25-LOT05-01 | `scripts/check-dead-exports.mjs:73-82` + `scripts/check-per-test-baseline.mjs:181-190` | duplication | S3 | MERGE: extract stagedFiles() to scripts/lib/git-staged.mjs; net -8 lines | exec ua25-lot05-0718 |
| P25-LOT05-02 | `scripts/check-per-test-baseline.mjs:1-43` | bloated-header | S3 | COMPACT: 43-line JSDoc → ~15 lines | exec ua25-lot05-0718 |
| P25-LOT05-03 | `scripts/check-per-test-baseline.mjs:207` | inconsistency | S3 | WRAP: add main()+ESM guard to match every other check-*.mjs | exec ua25-lot05-0718 |
| P25-LOT05-04 | `scripts/check-doc-script-parity.mjs:106` | dead-flag-doc | S3 | COMPACT: add 1-line comment explaining --staged is no-op | exec ua25-lot05-0718 |
| P25-LOT05-05 | `scripts/check-reload-wait.mjs:104` | dead-flag-doc | S3 | COMPACT: same 1-line comment for consistency | exec ua25-lot05-0718 |
| P25-LOT05-06 | `scripts/lib/forbidden-patterns.mjs:SOURCE_COMMENT_JARGON` | liveness-failure | S2 | FIX or DISPOSITION: walk-evidence pattern has 9 live hits in clients/encore/src; gate no longer fail-green | review ua25-lot05-0718-review |

### Phase 2.5 — Lot 06 (MATERIAL_ISSUES: FP risk, cwd-root weakness, testability gap)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P25-M09 | `scripts/check-save-route-parity.mjs:39-45` | false-positive-risk | S2 | Helper-list omits clickSaveAndCaptureDialog — spec using it as sole save-route will false-fail | ua25-lot06-0718-review |
| P25-M10 | `scripts/check-save-honesty.mjs:36-37` | cwd-root-weakness | S2 | Derives ROOT from process.cwd(); derive repo root from script path or validate cwd | ua25-lot06-0718-review |
| P25-M11 | `scripts/check-step-labels.mjs:216` | testability-gap | S3 | Unconditional main() prevents importing; add ESM guard + export pure check functions | ua25-lot06-0718-review |
| P25-M12 | `scripts/{check-spec-sleeps,check-swallowed-failures,check-unfailable-assertions}.mjs` | duplication | S3 | isCommentLine/walkSpecFiles/walkDir/buildReport duplicated 2-3x; harness helpers duplicated | ua25-lot06-0718 |
| P25-M13 | `scripts/check-step-labels.mjs:134` | dead-code | S3 | ASYNC_METHOD_RE declared but never used — DELETE | ua25-lot06-0718 |

### Phase 2.5 — Lot 07 (MATERIAL_ISSUES: dead code misses + footprint undercount)

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P25-M14 | `scripts/plans-reindex.mjs:383-396` | dead-function | S2 | sortPending() unused dead function — DELETE (14-line saving) | ua25-lot07-0718-review |
| P25-M15 | `scripts/validate-plan-closure.mjs:176-180` | dead-code | S2 | isInFencedCodeBlock unused — DELETE unless caller is restored | ua25-lot07-0718-review |
| P25-M16 | `scripts/validate-plan-closure.mjs:27-28,39-40,547` | dead-symbols | S2 | DELETE unused: statSync, extname, SCHEMA_PATH, LANDED_AT_PATH, ACCEPTANCE_HEADINGS | ua25-lot07-0718-review |
| P25-M17 | `scripts/validate-plan-closure.mjs:1265-1269` | dead-read | S2 | Self-test loads _overrides.json but never passes it to validation — wire or DELETE | ua25-lot07-0718-review |
| P25-M18 | `scripts/validate-plan-closure.mjs:667` | binary-corruption | S2 | Literal NUL placeholder makes file binary for ripgrep — replace with printable sentinel | ua25-lot07-0718-review |
| P25-M19 | `scripts/validate-plan-closure.mjs` | footprint-undercount | S3 | Count corrected: 698 semantic lines not ~477; savings math revised | ua25-lot07-0718-review |
| P25-M20 | `scripts/{xlsx-lint-rules.mjs:390,418}` | redundant-parse | S3 | Same workbook parsed twice — cache/pass to eliminate redundant XLSX read | ua25-lot07-0718 |


---

## Phase 3 — Gate Topology Checkup

> Source: `ua3-gates-0718-artifacts/gate-topology.md` corrected by `ua3-gates-0718-review-artifacts/review.md` (REJECTED; reviewer authoritative). Fixture re-run: browsertool 1/19 FAIL; bug-baseline 15/15 PASS; execution-completion 26/26 PASS; identity-switch 22/22 PASS; jargon 18/18 PASS.

| id | file:line | class | severity | proposed action | source |
|---|---|---|---|---|---|
| P3-01 | `~/.claude/hooks/labor-gate.mjs:1` (468L) | dark-gate | S1 | FIX: never writes shared gate-fires.log; add fireTelemetry() on deny/announce branches | ua3-gates-0718 |
| P3-02 | `~/.claude/hooks/delegation-nudge.mjs:1` + `delegation-primer.mjs:1` | gate-overlap | S2 | MERGE: both soft-channel delegation reminders; primer is DARK; merge into single gate with fireTelemetry | ua3-gates-0718 |
| P3-03 | `.claude/hooks/lib/check-plan-closure.mjs:1` (447L) | dark-gate | S1 | FIX: add fireTelemetry('check-plan-closure', verdict, target) on all deny/announce branches | ua3-gates-0718 |
| P3-04 | `.claude/hooks/lib/check-todo-injection.mjs:1` (1412L) | dark-gate + bloat | S1 | FIX: add telemetry + incident header; schedule compaction audit | ua3-gates-0718 |
| P3-05 | `.claude/hooks/lib/check-no-verify.mjs:1` (147L) | dark-gate | S1 | FIX: add fireTelemetry + incident header | ua3-gates-0718 |
| P3-06 | `.claude/hooks/lib/check-graft-ship.mjs:1` (190L) | dark-gate | S1 | FIX: add fireTelemetry + incident header | ua3-gates-0718 |
| P3-07 | `.claude/hooks/lib/check-rca-verdict.mjs:1` (560L) | dark-gate + soft-only | S2 | FIX: classify sev + add incident header | ua3-gates-0718 |
| P3-08 | `.claude/hooks/lib/check-jargon.mjs:1` (186L) | dark-gate + FP-history | S2 | FIX: add telemetry + incident; resolve FP history before promoting to hard-deny | ua3-gates-0718 |
| P3-09 | `.claude/hooks/lib/check-identity-switch.mjs:1` (410L) | dark-gate | S1 | FIX: add fireTelemetry + incident header | ua3-gates-0718 |
| P3-10 | `.claude/hooks/lib/check-execution-completion.mjs:1` (355L) | dark-gate + soft-only | S2 | FIX: classify layer; if deny-capable add telemetry | ua3-gates-0718 |
| P3-11 | `.claude/hooks/lib/check-bug-baseline.mjs:1` (205L) | dark-gate | S1 | FIX: add fireTelemetry + incident header | ua3-gates-0718 |
| P3-12 | `.claude/hooks/lib/check-browsertool.mjs:1` (381L) | live-broken-fixture | S1 | **FIX-OR-DISABLE**: settings.json wires it live; 1/19 fixture FAILS (no_subplan_pointer_allow → deny); fix fallback OR remove settings hook | ua3-gates-0718-review (authoritative) |
| P3-13 | `.claude/rules/guardrail-policy.md:58-66` | stale-known-gap | S2 | Update §3.4: since 2026-07-13, ua-worker-guard + 7 home gates gained fireTelemetry; update LIT vs DARK state | ua3-gates-0718 |


---

## Phase 4 — Retro-Verify Swarm Summary (banked, no fix items)

All 76 items across lots A–E (TRIM_01–06, RCD_B/C, script deletions, comment-strip commits) verified **WORTH-IT**. RESTORE_LIST = empty across all 5 lots. Phase 4 introduced zero regressions. Five QUESTIONS_FOR_OWNER noted (stale README references to deleted verify-vendor-fresh.mjs) — hygiene items, not reversals.


---

## Fix-Wave Triage

> **A** = inert (docs/prose/dead files) — council build+review then apply; **B** = live machinery — staged + battery proof + council review; **C** = protected control surfaces — staged + reviewed + **Rutvik GO per item**; **D** = deletions — archive-only + prune-check + **Rutvik GO batch**.

### Category A — Inert (docs/prose/stale annotations)

| ids | files | action |
|---|---|---|
| P1-M09, P1-M11..12, P1-M14..16, P1-M21 | PLAN_CHAIN, LCD_05/06, PLAN_DELEGATION_GOVERNOR | Stale prose notes, supersession annotations, signal-rewrite |
| P2-06..07 | DUTY_STACK.md, worker-ext.md | Update "8-duty" → "9-duty" text |
| P2-22 | audit/SKILL.md:63-69 | Make grep example shell-neutral |
| P2-LOT02-01..12 | ~/.claude/delegation/ (ASKING_DOCTRINE, session-continuity, pruning-policy, UPLINK_DOCTRINE, gap-hunt, interrogation-bank, OUTCOMES-FORMAT, weakness-map) | Prose/dedup compaction per individual row actions |
| P2-LOT03-04, P2-LOT03-10, P2-LOT03-14 | copilot-worker.sh / delegation-gate.mjs / delegation-nudge.mjs | Add comment; move changelog prose; add threshold comment |
| P2-LOT04-01..03, P2-LOT04-08..12, P2-LOT04-16, P2-LOT04-18..19, P2-LOT04-22, P2-LOT04-24..25 | routing-policy.json / model-registry.json / config-liveness-registry.json / uplink-policy.json / scorecard.mjs | JSON annotation and compaction per row actions |
| P2-LOT05-01..03, P2-LOT05-05..07, P2-LOT05-09..11 | ~/.claude/delegation/ docs | Stale-status rewrite; prose compact; annotation; build-status field |
| P2-LOT06-23, P2-LOT06-25..28 | hooks / council agent profiles | Style normalize; stale comment; profile compaction |
| P2-LOT09-02..07 | ~/.claude/delegation/ logs | FLAG-for-Rutvik: log quality and format issues |
| P2-LOT12-01, P2-LOT12-04 | redact.mjs / identity-gate-config.json | Stale comment; metadata correctness |
| P2-LOT13-02, P2-LOT13-19..22, P2-LOT13-24..29, P2-LOT13-32 | navigation.md / patterns.md / agent files | Stale refs; registry demote; maintenance schedule; path corrections |
| P2-LOT16-07, P2-LOT16-10 | ticket-doctrine test / critic-prompt.md | Stale test name; review-method instruction |
| P2-LOT17-02, P2-LOT17-04, P2-LOT17-08 | ship-branch.sh / xlsx-cell-diff.mjs / xlsx-lint-rules.mjs | Drift-risk note; orphan flag; stale import comment |
| P2-LOT18-02 | src/rotation.ts | Document MAX_429_RETRIES behavior |
| P3-13 | guardrail-policy.md §3.4 | Update stale LIT/DARK gate state text |
| P25-LOT01-01..03, P25-LOT01-06..07, P25-LOT01-11..14 | browsertool-gate.sh / check-browsertool.mjs / test fixtures | Header and dead-design-doc compaction |
| P25-LOT03-01..05 | CLAUDE.md / hooks-identity.md / guardrail-policy.md / specs.md | Duplication removal; stale section; coverage recount |
| P25-LOT05-02..05 | check-per-test-baseline.mjs / check scripts | Header compact; ESM guard; flag-doc comments |
| P25-M05, P25-M06 | .claude/skills/encore-questions/SKILL.md / coverage+.claude/skills/ultracoverage/SKILL.md | Protocol compact; shared authoring pointer |
| P25-M19 | validate-plan-closure.mjs | Update footprint-count estimate in plan |

### Category B — Live Machinery (staged + battery proof + council review)

| ids | files | action |
|---|---|---|
| P1-M01 | copilot-worker.sh:166-170 | Wire uplink_mode read or remove dead knob |
| P1-M04 | DUTY_STACK + report-lint | Add deterministic SKIP-as-PASS lint |
| P1-M06 | guardrail-config.json | Canonicalize stall dual-source |
| P1-M08 | Home hook telemetry | Expose/read home hook contents; treat under M13 |
| P1-M13 | All dark gate libs | Add shared fireTelemetry() to every deny/announce branch |
| P1-M17 | PLAN_CHAIN bash sketch | Mark superseded |
| P2-01..02, P2-10..12 | guardrail-config.json | Label/remove duplicate stall config; delete skill_route_*; remove duplicate key; reconcile citations |
| P2-03..05, P2-08..09 | council-worker/reviewer/chief agent profiles | 8→9 duty update; EXTERNAL_CONTENT_CONSUMED field |
| P2-15..P2-20, P2-23 | Skill files (questionnaire, audit, assistants, compile-learnings, planning) | Contradiction/stale/routing fixes per row |
| P2-LOT03-05..09, P2-LOT03-11..13, P2-LOT03-15..17 | parse-verdict.mjs / delegation-gate.mjs / labor-gate.mjs / ua-worker-guard.mjs / delegation-nudge.mjs | Shared-lib extractions; PBUG-09 fix; pipeline detection fix; **S1** verifier sha256 validation |
| P2-LOT04-05..07, P2-LOT04-13..15, P2-LOT04-17, P2-LOT04-20..21, P2-LOT04-23 | gates-config.json / uplink-policy.json / scorecard.mjs | **S1** G1/G2/G3 S0/announce contradictions; VERIFY_OUTPUT→VERIFY_ARTIFACTS; error handling |
| P2-LOT05-12 | worker-rules-extract.md | Rewrite 8-duty → 9-duty (injected into workers) |
| P2-LOT06-01..22, P2-LOT06-24, P2-LOT06-29..32 | ~/.claude/hooks/ (6 home hooks) | Dead imports/consts cleanup; hook-utils.mjs extraction; **S1** operator-precedence, tautological self-test, /.claude/ early-return, PowerShell Out-File bypass |
| P2-LOT09-08..10 | ~/.claude/delegation/ logs | FIX session_id missing; bounces:0 contradiction; fixture contamination |
| P2-LOT11-01..06, P2-LOT11-08..10 | check-todo-injection.mjs / check-identity-switch.mjs / chain-state | Self-test extraction; shared func extractions; dead-code delete; **S2** override ordering; LR-043 centralize |
| P2-LOT12-02..03, P2-LOT12-05..07, P2-LOT12-09..10 | relevant-injection.sh / check-mistake-ledger.mjs / uplink.test.mjs / check-md-first.mjs | Fragile path; merge; test coverage; mkdir order; normPath |
| P2-LOT13-09..18, P2-LOT13-21, P2-LOT13-23 | .claude/agents/*.md / AGENT_SHARED_RULES.md / closure-config.json / check-plan-closure.mjs | Per-agent block merges; incomplete config; announce-gap |
| P2-LOT15-01, P2-LOT15-04..05 | prune-check.mjs / identity-ownership.mjs / verify-no-stale-live-refs.mjs | .claude scan gap; **S1** OWNER bypass before HARD_STOP; hook coverage gap |
| P2-LOT16-01..06, P2-LOT16-08..09 | scripts/ticket-doctrine-from-scope / walk-coverage/ | Dead tests; dead param; unused imports; parser gap; contradictory comment; stale config |
| P2-LOT17-01, P2-LOT17-03, P2-LOT17-05..07 | ship-client.ps1 / xlsx-lint-rules.mjs / tdw-probe.mjs | XLSX gate cross-platform; camelCase FP test; dead-code compact; **S1** false-green npm/playwright |
| P2-LOT18-01, P2-LOT18-03..04, P2-LOT18-05, P2-LOT18-07..08 | tsconfig.json / src/rotation.ts / src/index.ts / .gitignore | Dead include; duplicate logic; misleading name; policy choice; .max(20); implicit parsing |
| P25-M01..03 | check-plan-closure.mjs / hook-utils.mjs | **S2** Lock-path bypass fix; gate-label param + self-tests; boilerplate extraction |
| P25-M04, P25-M07..08 | AGENT_SHARED_RULES.md | §20 compact; ALL-054 renumber; §12/§19 compact |
| P25-M09..11, P25-M13 | check-save-route-parity.mjs / check-save-honesty.mjs / check-step-labels.mjs | FP risk fix; cwd-root fix; ESM guard+exports; delete ASYNC_METHOD_RE |
| P25-M12 | check-spec-sleeps/swallowed/unfailable | Extract shared walker/harness helpers |
| P25-M14..18, P25-M20 | plans-reindex.mjs / validate-plan-closure.mjs / xlsx-lint-rules.mjs | Dead functions/imports/symbols; **S2** NUL sentinel; redundant parse |
| P25-LOT01-04..05, P25-LOT01-08..10 | check-browsertool.mjs / check-bug-baseline.mjs / check-execution-completion.mjs / gate.sh | Cross-hook merge; dup-guard compact; lazy import; atomicWrite compact |
| P25-LOT03-04..06 | check-rca-verdict.mjs / guardrail-policy.md / specs.md | Dead branch review; coverage recount |
| P25-LOT05-01, P25-LOT05-06 | check-dead-exports.mjs / forbidden-patterns.mjs | stagedFiles() extraction; **S2** walk-evidence liveness fix |
| P3-01..12 | labor-gate.mjs / 9 repo gate libs / check-browsertool.mjs | fireTelemetry on all dark gates; nudge+primer merge; **S1** FIX-OR-DISABLE browsertool |

### Category C — Protected Control Surfaces (Rutvik GO per item)

| ids | files | action |
|---|---|---|
| P1-M02 | SUBPLAN_ASSISTANT_LAYER_HARDGATES | Add execution note before HARDGATES build |
| P1-M03 | routing-policy.json | Rutvik decides: Tier-1 brokerable vs Rutvik-only |
| P1-M05 | delegation-gate.mjs.lcd07r2 (staged, 25KB unapplied) | Fresh review + Rutvik GO before applying |
| P1-M19, P1-M20 | PLAN_LAZY_CEO_DELEGATOR | Annotate item #2 DONE; replace HOT warnings #25-26 with DONE |
| P2-13 | config.json.bak-lcd04 | Rutvik GO to merge stall_guard_* keys into live config.json |
| P2-LOT13-01, P2-LOT13-03..08, P2-LOT13-30..31 | `.claude/settings.local.json` | DELETE LR-ENC-003 violation; session-debris; self-contradiction; over-broad taskkill grant |

### Category D — Deletions (archive-only; Rutvik GO batch)

| ids | files | action |
|---|---|---|
| P1-M18 | PLAN_AUDIT_COPILOT.md (2816L) | TRIM candidate; prune-check + owner confirm |
| P2-21 | delegation-temp/SKILL.md | DELETE; graduation conditions met |
| P2-D08..D13 | 6 agent bak files (~/.copilot/agents/*.bak-cheatproof-20260715 + bak-2026-07-14) | DELETE batch; confirmed strict subsets of live |
| P2-LOT05-08 | ~/.claude/delegation/wrapper-clear-waiter.sh | DELETE; zero runtime callers |
| P2-LOT08-01..02, P2-LOT08-04..07 | 6 hook bak files (bak-cheatproof/bak-lcd03/bak-lcd04 variants) | DELETE batch after verifying live supersedes each; Rutvik GO per file |
| P2-LOT08-03 | delegation-gate.mjs.bak-lcd07 | **DO NOT DELETE** — unique v4/v5 content; archive with Rutvik GO |
| P2-LOT09-01 | gates.sha256.tmp-backup | DELETE; byte-for-byte identical to gates.sha256 |
| P2-LOT10-01..06 | 6 agent bak files (~/.copilot/agents/*.bak-*) | Quarantine; confirm before delete; Rutvik GO |
| CEO-02 | validate-advisory module | Retirement candidate; prune-check + Rutvik confirm |


---

## Coverage Reconciliation

### Per-Lot Imported Row Counts

| phase | lot | rows | notes |
|---|---|---|---|
| 1 | — | 21 | coherence-merged.md full import |
| 2 | lot01 | 12 | reviewer-authoritative (REJECTED) |
| 2 | lot02 | 12 | frag-A |
| 2 | lot03 | 17 | frag-A |
| 2 | lot04 | 25 | frag-A |
| 2 | lot05 | 12 | frag-A |
| 2 | lot06 | 32 | frag-A |
| 2 | lot07 | 2 | reviewer corrections |
| 2 | lot08 | 7 | frag-A; reviewer-auth (REFUTED); lot08b P2-D01..07 superseded |
| 2 | lot09 | 10 | frag-A |
| 2 | lot10 | 9 | frag-A |
| 2 | lot11 | 10 | frag-A |
| 2 | lot12 | 10 | frag-B |
| 2 | lot13 | 32 | frag-B |
| 2 | lot14 | 9 | reviewer corrections |
| 2 | lot15 | 5 | frag-B |
| 2 | lot16 | 10 | frag-B |
| 2 | lot17 | 8 | frag-B |
| 2 | lot18 | 8 | frag-B + CEO corrections |
| 2 | delta-08b | 0 | superseded by lot08 reviewer rows |
| 2 | delta-10b | 6 | executor-only; no overlap with lot08 |
| 2.5 | lot01 | 14 | frag-B |
| 2.5 | lot02 | 3 | reviewer corrections |
| 2.5 | lot03 | 6 | frag-B |
| 2.5 | lot04 | 5 | reviewer corrections |
| 2.5 | lot05 | 6 | frag-B |
| 2.5 | lot06 | 5 | reviewer corrections |
| 2.5 | lot07 | 7 | reviewer corrections |
| 3 | gates | 13 | reviewer-authoritative (REJECTED) |
| 4 | lots A-E | 0 | all 76 WORTH-IT; no fix items |

### Totals

| bucket | count |
|---|---|
| Phase 1 | 21 |
| Phase 2 lots 01-18 + delta-10b | 236 |
| Phase 2.5 lots 01-07 | 46 |
| Phase 3 | 13 |
| Phase 4 | 0 |
| **GRAND TOTAL** | **316** |

**Open Gaps: NONE** — all lots fully imported. Zero gap/placeholder rows remain.

---

## Headliners (top 15, S0/S1 first)

| rank | id | sev | one-liner |
|---|---|---|---|
| 1 | P2-LOT06-24 | S1 | `check-isolation-perimeter.mjs:262` operator-precedence bug: `!detectLeakMarkers().length > 0` always false — isolation gate silently non-functional |
| 2 | P2-LOT06-29 | S1 | `check-delegation-envelope.mjs:336-342` tautological self-test with `\|\| true` — self-test always passes regardless of gate logic |
| 3 | P2-LOT06-30 | S1 | `check-isolation-perimeter.mjs:189` `/.claude/` early-return disables leak scanning for `.claude/rules/**` |
| 4 | P2-LOT03-16 | S1 | `verify-run.mjs` never parses artifact rows, validates sha256=, or re-executes cmd= — entire VERIFY_ARTIFACTS proof system is theater |
| 5 | P2-LOT15-04 | S1 | `identity-ownership.mjs:297-300` OWNER short-circuit fires BEFORE HARD_STOP check — OWNER can write .env.local |
| 6 | P3-12 | S1 | `check-browsertool.mjs` wired live but 1/19 fixture FAILS (`no_subplan_pointer_allow` → deny); executor's DEMOTE claim was wrong — FIX-OR-DISABLE |
| 7 | P2-LOT17-06 | S1 | `ship-client.ps1:53-55` no `$LASTEXITCODE` check after npm install / playwright test — failed operations produce false-green ship |
| 8 | P2-LOT13-01 | S1 | `settings.local.json:157` `Bash(env -u CI CI_ENV=e2e ...)` grant violates LR-ENC-003 |
| 9 | P1-M04 | S1 | No mechanism catches SKIP results reported as PASS — deterministic report lint missing |
| 10 | P1-M13 + P3-01..11 | S1 | 10+ gate libs DARK — demotion reviews can retire live gates; 0 fires in shared log would look clean |
| 11 | P25-M01 | S2 | `check-plan-closure.mjs:39-41` hard-deny lock-path bypass: `ls lock; rm lock` bypasses both RX patterns |
| 12 | P2-LOT08-03 | S3⚠ | `delegation-gate.mjs.bak-lcd07` has unique content (v4 /assistants stand-down, v5 LCD_02 advisory) — lot08b DELETE verdict P2-D03 was wrong |
| 13 | P2-LOT04-05,06,20 | S1 | `gates-config.json` G1/G2/G3 sev=S0 but mode=announce — config contradicts LR-069 §3.3 deny-on-landing rule |
| 14 | P2-LOT03-09 + P2-LOT03-17 | S2 | PBUG-09 never propagated to labor-gate; pipeline detection only checks first command — identity bypass path in labor-gate |
| 15 | P25-M18 | S2 | `validate-plan-closure.mjs:667` literal NUL char makes file binary for ripgrep and normal text tooling |

---

## ASK

none — all pass-1 gaps resolved: lot08 reviewer imported via fragment A; lot12 review in fragment B; all unresolved gap entries eliminated.

**ASSUMPTIONS-MADE**:
1. lot08b rows P2-D01..D07 superseded by lot08 reviewer P2-LOT08-01..07 (same 7 bak files; reviewer more accurate; kept higher-fidelity verdict).
2. P2-LOT10-07/08 (KEEP), P2-LOT15-03 (KEEP-as-archive), P2-LOT18-06 (KEEP CEO), P1-M07/M10 (REFUTED): excluded from triage as non-actionable.
3. Phase 4 all 76 WORTH-IT; lot B/C/D/E not re-read (per ticket spec; Phase 4 = banked, no fix items).
4. Fix category edge cases: AGENT_SHARED_RULES.md classified B (always-loaded context cost); worker-rules-extract.md classified B (injected worker behavior).

---

## BLOCKERS_DEVIATIONS

none — all prior coverage gaps resolved by fragment A+B import.
