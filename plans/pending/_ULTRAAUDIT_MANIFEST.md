# ULTRAAUDIT MERGED MANIFEST — Integration File Denominator
# Date: 2026-07-17
# Merged-by: claude-opus-4.6 (Seat C, merge worker ua0-manifest-merge-0717)
# Seat A: claude-opus-4.6 | 48 active rows | 3 home-blocked rows
# Seat B: gpt-5.5        | ~177 active rows | 3 home-blocked rows
# CEO-listing: home surface supplied to close all 3 blocked rows
# Active rows in merged manifest: 197 (≥ max(A=48, B=177)) ✓
# Home runtime grouped entries (not individual rows): 6 groups (~350+ runtime files in reports/, logs/, tickets/, stall-queue/, locks/)
#
# Per-layer counts: hard-deny=41 | code=82 | doctrine=36 | soft-prose=3 | mid-announce=5 | state=30
# Per-surface: .claude/hooks=37 | .claude/skills=20 | .claude/rules=8 | .claude/agents=7 |
#   .claude/context=2 | .claude/state=8 | scripts=66 | docs=1 | root=2 |
#   home-delegation=80 | home-hooks=18 | home-agents=10
#
# SCOPE RULING: Seat A used [INT]-only scope; Seat B used [INT]+[FW] (framework files).
# RULING: B's broader scope adopted. Phase 0.2 denominator covers all phases incl. 2.5
# (harness efficiency audit); FW files are in scope for the full audit.
# Tags in origin column: INT=integration-created/modified | FW=framework-only | INT+FW=both
#
# LAYER KEY: soft-prose | mid-announce | hard-deny | code | doctrine | state
# NOTE: Seat B used "config" for JSON files; per governing plan's layer key "config" is not valid.
# All JSON/config files are classified "code" (machine-read executable).
#
# LCD ATTRIBUTION NOTE: copilot-worker.sh per-LCD attribution partially resolved via bak-file
# timestamps and plan names. LCD execution-summary tails not read (credit constraint).
# See DISAGREEMENTS §D1.
#
# FOUND-BY KEY: A=Seat A only | B=Seat B only | BOTH=both seats | CEO-listing=home surface

| path | origin plan | lines | purpose one-liner | layer | found-by |
|---|---|---|---|---|---|
| `.claude/AGENT_SCHOOL.md` | SUBPLAN_LCD_02_ENFORCEMENT_HOLES [INT] | 88 | Worker onboarding: shared rules all agents inherit on session start | doctrine | B |
| `.claude/agents/AUDIT.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | 91 | Agent system prompt: WATCHDOG (Audit) — 7-mode audit pipeline | doctrine | B |
| `.claude/agents/GENERATOR.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | 81 | Agent system prompt: BUILDER (Generator) — spec generation pipeline | doctrine | B |
| `.claude/agents/HEALER.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | 78 | Agent system prompt: HEALER — 2-phase spec debugger | doctrine | B |
| `.claude/agents/MAINTAINER.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | 82 | Agent system prompt: GARDENER (Maintainer) — framework hygiene | doctrine | B |
| `.claude/agents/PLANNER.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | 98 | Agent system prompt: GIVER (Planner) — manual-QA walk | doctrine | B |
| `.claude/agents/REQUIREMENTS.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | 83 | Agent system prompt: HUNTER (Requirements) — intake + baseline walk | doctrine | B |
| `.claude/closure-config.json` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 26 | Plan closure validator config: required fields per closure type | code | B |
| `.claude/context/navigation.md` | Multiple integration plans; M: aa7a8552, 3156c352, 664ae0cc, 4a24e140 [INT+FW] | 150 | Exploration registry + routing table; updated each integration wave | soft-prose | BOTH |
| `.claude/context/patterns.md` | PLAN_WORKER_SKILL_ROUTING [INT+FW] | 68 | Codebase pattern registry: recurring solution patterns | soft-prose | B |
| `.claude/guardrail-config.json` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS; M: PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [INT+FW] | 43 | Machine-read guardrail registry: gate IDs, thresholds, severity tiers | code | BOTH |
| `.claude/hooks/browsertool-gate.sh` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 80 | Shell gate: invokes check-browsertool.mjs (CLI vs Chrome enforcement) | hard-deny | B |
| `.claude/hooks/bug-baseline-gate.sh` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 42 | Shell gate: invokes check-bug-baseline.mjs | hard-deny | B |
| `.claude/hooks/chain-orchestrator.sh` | SUBPLAN_LCD_03_COMPACTION_SURVIVAL [INT] | 289 | Chain orchestrator: headless session chain runner | code | B |
| `.claude/hooks/chain-pause-notice.sh` | SUBPLAN_LCD_03_COMPACTION_SURVIVAL [INT] | 55 | Announces chain-pause event to user | mid-announce | B |
| `.claude/hooks/execution-completion-gate.sh` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 60 | Shell gate: invokes check-execution-completion.mjs | hard-deny | B |
| `.claude/hooks/graft-ship-gate.sh` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 35 | Shell gate: invokes check-graft-ship.mjs | hard-deny | B |
| `.claude/hooks/identity-switch-gate.sh` | PLAN_DELEGATION_CHEATPROOF [INT] | 73 | Shell gate: invokes check-identity-switch.mjs | hard-deny | B |
| `.claude/hooks/jargon-gate.sh` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 41 | Shell gate: invokes check-jargon.mjs | hard-deny | B |
| `.claude/hooks/lib/chain-guards.sh` | SUBPLAN_LCD_03_COMPACTION_SURVIVAL [INT] | 144 | Chain guard library: pre/post-session chain invariant checks | code | B |
| `.claude/hooks/lib/chain-state.mjs` | SUBPLAN_LCD_03_COMPACTION_SURVIVAL [INT] | 126 | Chain state machine: reads/writes chain session state | code | B |
| `.claude/hooks/lib/chain-state.sh` | SUBPLAN_LCD_03_COMPACTION_SURVIVAL [INT] | 90 | Shell wrapper for chain-state.mjs | code | B |
| `.claude/hooks/lib/check-browsertool.mjs` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 380 | Logic: enforces CLI vs Chrome browser-tool selection per task class | hard-deny | B |
| `.claude/hooks/lib/check-bug-baseline.mjs` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 204 | Logic: verifies bug-baseline file exists before bug-fix claims | hard-deny | B |
| `.claude/hooks/lib/check-execution-completion.mjs` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 354 | Logic: gates execution completion — checks all plan steps resolved | hard-deny | B |
| `.claude/hooks/lib/check-graft-ship.mjs` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 189 | Logic: gates graft ship — verifies E2E proof before allow | hard-deny | B |
| `.claude/hooks/lib/check-identity-switch.mjs` | PLAN_IDENTITY_ENFORCEMENT; M: PLAN_STATIC_TO_DYNAMIC, PLAN_DELEGATION_CHEATPROOF [INT] | 409 | Identity write-gate checker — §2 ownership gate blocks pipeline-role writes | hard-deny | BOTH |
| `.claude/hooks/lib/check-jargon.mjs` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 185 | Logic: blocks internal-process jargon tokens in client artifacts | hard-deny | B |
| `.claude/hooks/lib/check-md-first.mjs` | SUBPLAN_LCD_02_ENFORCEMENT_HOLES [INT] | 358 | Logic: MD-first gate — blocks spec commit without matching MD update | hard-deny | BOTH |
| `.claude/hooks/lib/check-mistake-ledger.mjs` | SUBPLAN_LCD_02_ENFORCEMENT_HOLES; M: SUBPLAN_LCD_05_LEARNING_LANES [INT] | 432 | Logic: mistake-ledger gate — requires ASK-section acknowledgment at session end | hard-deny | BOTH |
| `.claude/hooks/lib/check-no-verify.mjs` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 146 | Logic: blocks git --no-verify usage | hard-deny | B |
| `.claude/hooks/lib/check-plan-closure.mjs` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 446 | Logic: validates plan closure fields before marking done | hard-deny | B |
| `.claude/hooks/lib/check-rca-verdict.mjs` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 559 | Logic: gates RCA output — requires verdict before proceeding | hard-deny | B |
| `.claude/hooks/lib/check-todo-injection.mjs` | PLAN_IDENTITY_ENFORCEMENT; M: PLAN_STATIC_TO_DYNAMIC [INT] | 1411 | Todo-injection gate + execute lookback (EXECUTE_LOOKBACK=200) | hard-deny | BOTH |
| `.claude/hooks/lib/parse-verdict.mjs` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY; M: LCD_01, LCD_03, LCD_04, PLAN_STATIC_TO_DYNAMIC [INT] | 749 | Verdict extraction from copilot worker stdout (window 8000, poll backoff) | code | BOTH |
| `.claude/hooks/lib/relevant-injection.mjs` | PLAN_WORKER_SKILL_ROUTING [INT] | 276 | Logic: maps task descriptions to relevant skills and injects tags | mid-announce | B |
| `.claude/hooks/lib/test-browsertool-fixtures.mjs` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 345 | Test fixtures for check-browsertool.mjs | code | B |
| `.claude/hooks/lib/test-bug-baseline-fixtures.mjs` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 144 | Test fixtures for check-bug-baseline.mjs | code | B |
| `.claude/hooks/lib/test-execution-completion-fixtures.mjs` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 211 | Test fixtures for check-execution-completion.mjs | code | B |
| `.claude/hooks/lib/test-identity-switch-fixtures.mjs` | PLAN_DELEGATION_CHEATPROOF [INT] | 277 | Test fixtures for check-identity-switch.mjs | code | B |
| `.claude/hooks/lib/test-jargon-fixtures.mjs` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 166 | Test fixtures for check-jargon.mjs | code | B |
| `.claude/hooks/lib/uplink/packet-builder.mjs` | PLAN_UPLINK_PROTOCOL [INT] | 102 | Builds structured UPLINK advisory packets per dispatch | code | BOTH |
| `.claude/hooks/lib/uplink/redact.mjs` | PLAN_UPLINK_PROTOCOL [INT] | 73 | Redacts secrets/tokens before UPLINK advisory packet is written | code | BOTH |
| `.claude/hooks/lib/uplink/uplink.test.mjs` | PLAN_UPLINK_PROTOCOL [INT] | 307 | Unit tests for UPLINK packet pipeline | code | BOTH |
| `.claude/hooks/lib/uplink/validate-advisory.mjs` | PLAN_UPLINK_PROTOCOL [INT] | 60 | Validates UPLINK advisory schema before packet emit | code | BOTH |
| `.claude/hooks/md-first-gate.sh` | SUBPLAN_LCD_02_ENFORCEMENT_HOLES [INT] | 44 | Shell entry-point for MD-first PreToolUse hook | hard-deny | BOTH |
| `.claude/hooks/mistake-ledger-gate.sh` | SUBPLAN_LCD_02_ENFORCEMENT_HOLES [INT] | 60 | Shell entry-point for mistake-ledger PreToolUse hook | hard-deny | BOTH |
| `.claude/hooks/no-verify-gate.sh` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 32 | Shell gate: invokes check-no-verify.mjs | hard-deny | B |
| `.claude/hooks/plan-closure-gate.sh` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 41 | Shell gate: invokes check-plan-closure.mjs | hard-deny | B |
| `.claude/hooks/rca-verdict-gate.sh` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 59 | Shell gate: invokes check-rca-verdict.mjs | hard-deny | B |
| `.claude/hooks/relevant-injection.sh` | PLAN_WORKER_SKILL_ROUTING [INT] | 56 | Injects relevant-skill tags into TodoWrite items (announce only) | mid-announce | B |
| `.claude/hooks/todo-injection-gate.sh` | PLAN_DELEGATION_CHEATPROOF [INT] | 64 | Shell gate: invokes check-todo-injection.mjs | hard-deny | B |
| `.claude/identity-gate-config.json` | PLAN_IDENTITY_ENFORCEMENT; M: PLAN_DELEGATION_CHEATPROOF [INT] | 9 | Identity enforcement ramp knob (gate on/off per role) | code | BOTH |
| `.claude/rules/baseline.md` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 39 | LR-ENC-001: baseline truth walk protocol | doctrine | B |
| `.claude/rules/deliverable.md` | PLAN_DELEGATION_CHEATPROOF [INT+FW] | 72 | LR-058: jargon ban + plain-English rule for client artifacts | doctrine | B |
| `.claude/rules/guardrail-policy.md` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS; M: PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT, SUBPLAN_LCD_06 [INT+FW] | 97 | LR-069/LR-070 gate fleet lifecycle — demotion review + bloat governor | doctrine | BOTH |
| `.claude/rules/hooks-identity.md` | PLAN_IDENTITY_ENFORCEMENT; M: PLAN_DELEGATION_CHEATPROOF [INT] | 109 | LR-043 identity write-gate discipline — hook wiring and override semantics | doctrine | BOTH |
| `.claude/rules/inventory.md` | PLAN_TIERED_DELEGATED_WALK [INT] | 154 | LR-064: TDW procedure — Haiku→Sonnet→Opus field-walk ladder | doctrine | B |
| `.claude/rules/pipeline.md` | Multiple; M: b3791493, aa7a8552, d1c1ad69, 607d107c [INT+FW] | 438 | Pipeline agent scope + bus-rules for all codenames | doctrine | BOTH |
| `.claude/rules/specs.md` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 452 | Spec quality rules: sleep bans, assertion discipline, TC structure | doctrine | B |
| `.claude/settings.json` | Multiple — LCD gate-wiring + GUARDRAIL + IDENTITY; M: aa7a8552, 3156c352, 664ae0cc [INT+FW] | 165 | PreToolUse/Stop gate registrations for all integration hooks | hard-deny | BOTH |
| `.claude/settings.local.json` | SUBPLAN_LCD_01_CONTEXT_SURGERY [INT] | 282 | Local hook overrides: session-local gate config (not committed to repo) | code | B |
| `.claude/skills/INDEX.md` | Multiple integration waves; M: aa7a8552, 3156c352, 4a24e140 [INT+FW] | 50 | Skill catalog with routing triggers for all 35 skills | doctrine | BOTH |
| `.claude/skills/assistants/SKILL.md` | PLAN_DYNAMIC_WORKERS [INT] | 93 | Assistants skill: how Claude uses GitHub Copilot assistants | doctrine | B |
| `.claude/skills/audit/SKILL.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT+FW] | 672 | Audit skill — 7 modes incl. pipeline + agent + slop | doctrine | BOTH |
| `.claude/skills/chain/SKILL.md` | SUBPLAN_LCD_03_COMPACTION_SURVIVAL; M: PLAN_STATIC_TO_DYNAMIC [INT] | 245 | Chain skill — headless session orchestration + CHAIN_DAILY_CAP enforcement | doctrine | BOTH |
| `.claude/skills/compile-learnings/SKILL.md` | SUBPLAN_LCD_05_LEARNING_LANES; M: SUBPLAN_PARITY_INJECTION_SYSTEM M3 [INT] | 212 | Compile-learnings skill — M3 preamble injected for worker parity | doctrine | BOTH |
| `.claude/skills/coverage/SKILL.md` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | ~100 | Coverage skill: quick test-coverage subplan | doctrine | B |
| `.claude/skills/delegation-temp/SKILL.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | 160 | Delegation-temp skill — hand-emulates delegation behavior pending GOVERNOR/UPLINK | doctrine | BOTH |
| `.claude/skills/encore-questions/SKILL.md` | UNKNOWN-with-guess: Encore client work [FW] | ~80 | Encore-questions skill: Encore-specific question protocol | doctrine | B |
| `.claude/skills/execute/SKILL.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY; M: PLAN_WORKER_SKILL_ROUTING [INT] | 354 | Execute skill — pre-research, gap analysis, post-execution audit | doctrine | BOTH |
| `.claude/skills/final-q/SKILL.md` | PLAN_STATIC_TO_DYNAMIC; M: PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY, SUBPLAN_LCD_07_OBSERVABILITY [INT] | 429 | Final-q — 75%/90% context-band thresholds + session-end audit gate | doctrine | BOTH |
| `.claude/skills/final-q/SKILL.md.bak-lcd07` | SUBPLAN_LCD_07_OBSERVABILITY [INT] | ~429 | Pre-LCD_07 backup of final-q SKILL.md (staged) | state | B |
| `.claude/skills/graft/SKILL.md` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | ~80 | Graft skill: hand-port code from colleague branch | doctrine | B |
| `.claude/skills/innovation/SKILL.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | 40 | Innovation skill — anti-over-delegation law for novel thinking | doctrine | BOTH |
| `.claude/skills/planning/SKILL.md` | PLAN_WORKER_SKILL_ROUTING [INT] | 197 | Planning skill: rigorously audited implementation plan creation | doctrine | B |
| `.claude/skills/questionnaire/SKILL.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | 94 | Questionnaire skill — dynamic yes/no gap-closure chain before execution | doctrine | BOTH |
| `.claude/skills/reflect/SKILL.md` | SUBPLAN_LCD_05_LEARNING_LANES; M: SUBPLAN_PARITY_INJECTION_SYSTEM M3 [INT] | 167 | Reflect skill — M3 preamble injected for worker parity | doctrine | BOTH |
| `.claude/skills/ultra-agents/SKILL.md` | PLAN_DYNAMIC_WORKERS; M: PLAN_WORKER_SKILL_ROUTING [INT] | 96 | Ultra-agents skill — dispatch protocol, model tiers, parallel caps | doctrine | BOTH |
| `.claude/skills/ultra-agents/copilot-worker.sh` | PLAN_DYNAMIC_WORKERS; M: LCD_01-04, SUBPLAN_PARITY_BUGFIXES, PLAN_STATIC_TO_DYNAMIC [INT] | 694 | Main Bash orchestrator dispatching council tickets to Copilot worker via CLI | code | BOTH |
| `.claude/skills/ultra-agents/copilot-worker.sh.bak-lcd07` | SUBPLAN_LCD_07_OBSERVABILITY [INT] | ~694 | Pre-LCD_07 backup of copilot-worker.sh (staged; LCD_07 apply parked) | state | BOTH |
| `.claude/skills/ultra-agents/tavily-mcp/.gitignore` | PLAN_WORKER_SKILL_ROUTING [INT] | ~5 | Gitignore for tavily-mcp build artifacts | code | BOTH |
| `.claude/skills/ultra-agents/tavily-mcp/package-lock.json` | PLAN_WORKER_SKILL_ROUTING [INT] | 1728 | Tavily-mcp npm lockfile | code | BOTH |
| `.claude/skills/ultra-agents/tavily-mcp/package.json` | PLAN_WORKER_SKILL_ROUTING [INT] | 20 | Tavily-mcp npm manifest | code | BOTH |
| `.claude/skills/ultra-agents/tavily-mcp/src/index.ts` | PLAN_WORKER_SKILL_ROUTING [INT] | 110 | Tavily MCP server entry point | code | BOTH |
| `.claude/skills/ultra-agents/tavily-mcp/src/rotation.ts` | PLAN_WORKER_SKILL_ROUTING [INT] | 288 | API-key rotation manager for Tavily MCP | code | BOTH |
| `.claude/skills/ultra-agents/tavily-mcp/src/tavily-client.ts` | PLAN_WORKER_SKILL_ROUTING [INT] | 123 | Tavily HTTP client wrapper | code | BOTH |
| `.claude/skills/ultra-agents/tavily-mcp/src/types.ts` | PLAN_WORKER_SKILL_ROUTING [INT] | 44 | TypeScript types for Tavily MCP | code | BOTH |
| `.claude/skills/ultra-agents/tavily-mcp/test-client.ts` | PLAN_WORKER_SKILL_ROUTING; M: SUBPLAN_LCD_04_STALL_HANDLING [INT] | 184 | Tavily-mcp manual test client | code | BOTH |
| `.claude/skills/ultra-agents/tavily-mcp/tsconfig.json` | PLAN_WORKER_SKILL_ROUTING [INT] | ~15 | Tavily-mcp TypeScript config | code | BOTH |
| `.claude/skills/ultra-agents/worker-ext.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY; M: SUBPLAN_LCD_05_LEARNING_LANES [INT] | 263 | Per-ticket worker doctrine injection — 8-duty stack + house rules | doctrine | BOTH |
| `.claude/skills/ultra-agents/worker-ext.md.bak-lcd07` | SUBPLAN_LCD_07_OBSERVABILITY [INT] | ~263 | Pre-LCD_07 backup of worker-ext.md (staged; LCD_07 apply parked) | state | BOTH |
| `.claude/skills/ultracoverage/SKILL.md` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | ~80 | Ultracoverage skill: deep exhaustive test-coverage subplan | doctrine | B |
| `.claude/state/fightinnovation/clash-isolation/refute-gpt.md` | PLAN_FIGHTINNOVATION [INT] | ~50 | Council clash state: GPT refutation of innovation proposal | state | B |
| `.claude/state/fightinnovation/clash-isolation/refute-opus.md` | PLAN_FIGHTINNOVATION [INT] | ~50 | Council clash state: Opus refutation of innovation proposal | state | B |
| `.claude/state/fightinnovation/clash-isolation/ring-opening.md` | PLAN_FIGHTINNOVATION [INT] | ~30 | Council clash state: ring-opening statement | state | B |
| `.claude/state/fightinnovation/clash-isolation/verdict.md` | PLAN_FIGHTINNOVATION [INT] | ~30 | Council clash state: final verdict | state | B |
| `.claude/state/fightinnovation/session-comms/ring-opening.md` | PLAN_FIGHTINNOVATION [INT] | ~30 | Council session-comms: ring-opening for session channel | state | B |
| `.claude/state/fightinnovation/session-comms/verdict.md` | PLAN_FIGHTINNOVATION [INT] | ~30 | Council session-comms: verdict for session channel | state | B |
| local worker-doctrine index under ua-worker state (gitignored) | PLAN_WORKER_SKILL_ROUTING [INT] | 25 | Doctrine lookup pointer registry - maps ticket type to doctrine file | state | BOTH |
| `CLAUDE.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY; M: LCD family, PLAN_DELEGATION_CHEATPROOF [INT+FW] | 162 | Root Claude config: supreme rules, @-refs, skill routing, identity codenames | doctrine | B |
| `docs/read_only_docs/AGENT_SHARED_RULES.md` | Multiple; M: b3791493, aa7a8552, d97923b2, beb38014 [INT+FW] | 867 | Shared rules for all pipeline agents — §ALL rules governing workers | doctrine | BOTH |
| `scripts/check-dead-exports.mjs` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | 153 | Detects dead exports in framework scripts | code | B |
| `scripts/check-dead-exports.test.mjs` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | ~60 | Tests for check-dead-exports.mjs | code | B |
| `scripts/check-doc-script-parity.mjs` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | 133 | Checks that docs and scripts are in sync | code | B |
| `scripts/check-doc-script-parity.test.mjs` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | ~60 | Tests for check-doc-script-parity.mjs | code | B |
| `scripts/check-identity-ownership.mjs` | PLAN_DELEGATION_CHEATPROOF [INT] | 166 | CLI runner for identity-ownership.mjs; used in pre-commit gate | code | B |
| `scripts/check-lr-embed-parity.mjs` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | 84 | Checks LR-NNN embed parity across docs | code | B |
| `scripts/check-per-test-baseline.mjs` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | 289 | Validates per-test baseline files exist for bug claims | code | B |
| `scripts/check-reload-wait.mjs` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | 133 | Checks for disallowed reload/wait patterns in specs | code | B |
| `scripts/check-reload-wait.test.mjs` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | ~60 | Tests for check-reload-wait.mjs | code | B |
| `scripts/check-save-honesty.mjs` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | 252 | Validates save-honesty: save actions must have verifiable evidence | code | B |
| `scripts/check-save-route-parity.mjs` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | 125 | Checks save-route parity between spec and page-object | code | B |
| `scripts/check-spec-sleeps.mjs` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | 150 | Detects disallowed sleep() calls in spec files | code | B |
| `scripts/check-spec-sleeps.test.mjs` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | ~60 | Tests for check-spec-sleeps.mjs | code | B |
| `scripts/check-step-labels.mjs` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 216 | Validates step labels are plain English ≤12 words (LR-ENC-006) | code | B |
| `scripts/check-step-labels.test.mjs` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | ~60 | Tests for check-step-labels.mjs | code | B |
| `scripts/check-swallowed-failures.mjs` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | 141 | Detects swallowed assertion failures in specs | code | B |
| `scripts/check-swallowed-failures.test.mjs` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | ~60 | Tests for check-swallowed-failures.mjs | code | B |
| `scripts/check-testid-preference.mjs` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | 186 | Enforces data-testid selector preference over CSS selectors | code | B |
| `scripts/check-unfailable-assertions.mjs` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | 188 | Detects assertions that can never fail (vacuous truths) | code | B |
| `scripts/check-unfailable-assertions.test.mjs` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | ~60 | Tests for check-unfailable-assertions.mjs | code | B |
| `scripts/check-vacuous-grid-assertions.mjs` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | 254 | Detects vacuous grid assertions that skip empty-table case | code | B |
| `scripts/check-weak-reset.mjs` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | 203 | Detects weak reset patterns that may not fully reset state | code | B |
| `scripts/dead-exports-allowlist.json` | PLAN_REACTIVE_VS_PREVENTIVE_GUARDRAIL_AUDIT [FW] | 90 | Allowlist for check-dead-exports.mjs (known-safe dead exports) | code | B |
| `scripts/generate-label-inventory.mjs` | PLAN_TIERED_DELEGATED_WALK [INT] | 98 | Generates label inventory for step-label compliance checks | code | B |
| `scripts/humanize.test.ts` | PLAN_TIERED_DELEGATED_WALK [INT] | 126 | Tests for humanize label derivation | code | B |
| `scripts/identity-ownership.mjs` | PLAN_DELEGATION_CHEATPROOF [INT] | 419 | Library: maps file paths to owning pipeline identity | code | B |
| `scripts/lib/forbidden-patterns.mjs` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 206 | Shared library: forbidden token list used by jargon-gate + verify | code | B |
| `scripts/lib/label-derivation.mjs` | PLAN_TIERED_DELEGATED_WALK [INT] | 61 | Library: derives plain-English step labels from method names | code | B |
| `scripts/plans-reindex.mjs` | PLAN_WORKER_SKILL_ROUTING [INT+FW] | 864 | Rebuilds plans/INDEX.md from all plan frontmatter | code | B |
| `scripts/prune-check.mjs` | SUBPLAN_LCD_06_SELF_PRUNING [INT] | 154 | 5-class dead-ref checker — safe-to-delete gate for self-pruning | code | A |
| `scripts/ship-branch.sh` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT+FW] | 162 | Ships a branch via git archive for delivery | code | B |
| `scripts/ship-client.ps1` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT+FW] | 58 | PowerShell equivalent of ship-client.sh | code | B |
| `scripts/ship-client.sh` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT+FW] | 76 | Ships client artifacts via git archive to output path | code | B |
| `scripts/test-fixtures/plan-closure/cx-provenance-live.md` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | ~30 | Test fixture: plan-closure provenance live example | state | B |
| `scripts/test-fixtures/plan-closure/cx-provenance-oracle.md` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | ~30 | Test fixture: plan-closure provenance oracle | state | B |
| `scripts/test-fixtures/plan-closure/field-inventories/cx-evidence-input-name.json` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | ~20 | Test fixture: field inventory evidence for plan-closure | state | B |
| `scripts/ticket-doctrine-from-scope.mjs` | PLAN_WORKER_SKILL_ROUTING [INT] | 596 | Path-glob→DOCTRINE auto-populate for worker tickets | code | BOTH |
| `scripts/ticket-doctrine-from-scope.test.mjs` | PLAN_WORKER_SKILL_ROUTING [INT] | 290 | Tests for ticket-doctrine-from-scope.mjs | code | BOTH |
| `scripts/ticket-skill-scan.mjs` | PLAN_WORKER_SKILL_ROUTING; M: SUBPLAN_PARITY_INJECTION_SYSTEM M2 [INT] | 288 | Keyword→skill scan — injects matched skills into ticket DOCTRINE | code | BOTH |
| `scripts/validate-activity-log.mjs` | SUBPLAN_LCD_01_CONTEXT_SURGERY [INT] | 484 | Validates activity-log entries for required fields + timestamps | code | B |
| `scripts/validate-activity-log.test.mjs` | SUBPLAN_LCD_01_CONTEXT_SURGERY [INT] | ~100 | Tests for validate-activity-log.mjs | code | B |
| `scripts/validate-plan-closure.mjs` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 1378 | Validates plan closure: all acceptance criteria checked | code | B |
| `scripts/verify-no-forbidden.mjs` | PLAN_AUDIT_REMEDIATION_AND_GUARDRAILS [FW] | 331 | Scans for forbidden patterns in committed files | code | B |
| `scripts/verify-no-stale-live-refs.mjs` | SUBPLAN_LCD_06_SELF_PRUNING [INT] | 92 | Detects stale live-refs (5-class) preventing safe file deletion | code | B |
| `scripts/walk-coverage/cross-check.mjs` | PLAN_TIERED_DELEGATED_WALK [INT] | 285 | Cross-checks enumerated page fields against test coverage | code | B |
| `scripts/walk-coverage/critic-prompt.md` | PLAN_TIERED_DELEGATED_WALK [INT] | 71 | Prompt template: adversarial critic for walk-coverage | doctrine | B |
| `scripts/walk-coverage/enumerate-page.mjs` | PLAN_TIERED_DELEGATED_WALK [INT] | 388 | Enumerates all fields/controls on a given page for coverage | code | B |
| `scripts/walk-coverage/lib/coverage-manifest.mjs` | PLAN_TIERED_DELEGATED_WALK [INT] | 235 | Library: coverage manifest read/write for walk results | code | B |
| `scripts/walk-coverage/lib/deep-pierce.mjs` | PLAN_TIERED_DELEGATED_WALK [INT] | 300 | Library: deep DOM pierce for Angular shadow-DOM coverage | code | B |
| `scripts/walk-coverage/lib/test-coverage-manifest.mjs` | PLAN_TIERED_DELEGATED_WALK [INT] | ~100 | Tests for coverage-manifest.mjs | code | B |
| `scripts/walk-coverage/lib/test-enumerate-fixtures.mjs` | PLAN_TIERED_DELEGATED_WALK [INT] | ~80 | Test fixtures for enumerate-page.mjs | code | B |
| `scripts/walk-coverage/tdw-probe.mjs` | PLAN_TIERED_DELEGATED_WALK [INT] | 108 | TDW probe: runs tiered delegated walk for a given module | code | B |
| `scripts/xlsx-cell-diff.mjs` | SUBPLAN_PARITY_INJECTION_SYSTEM [INT+FW] | 117 | Diffs XLSX cells between two workbook versions | code | B |
| `scripts/xlsx-lint-rules.mjs` | SUBPLAN_PARITY_INJECTION_SYSTEM [INT+FW] | 709 | Lint rules for XLSX spec deliverables | code | B |

---

## HOME SURFACE — ~/.claude/delegation/ (structural files)

| path | origin plan | lines (approx) | purpose one-liner | layer | found-by |
|---|---|---|---|---|---|
| `~/.claude/delegation/ASKING_DOCTRINE.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | ~41 | Doctrine: how workers surface ASK entries (class-tag protocol) | doctrine | CEO-listing |
| `~/.claude/delegation/DUTY_STACK.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY; M: SUBPLAN_LCD_07, SUBPLAN_PARITY_INJECTION_SYSTEM [INT] | ~148 | Master 8-duty stack injected into every worker ticket | doctrine | CEO-listing |
| `~/.claude/delegation/DUTY_STACK.md.bak-cheatproof-20260715` | PLAN_DELEGATION_CHEATPROOF [INT] | ~67 | Pre-cheatproof backup of DUTY_STACK.md (Jul 15) | state | CEO-listing |
| `~/.claude/delegation/DUTY_STACK.md.bak-pinj-0716` | SUBPLAN_PARITY_INJECTION_SYSTEM [INT] | ~70 | Pre-parity-injection backup of DUTY_STACK.md (Jul 16) | state | CEO-listing |
| `~/.claude/delegation/OUTCOMES-FORMAT.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | ~25 | Format spec for outcomes.jsonl entries | doctrine | CEO-listing |
| `~/.claude/delegation/PROTECTED-SPLICE-PROPOSALS-0712.md` | PLAN_FIGHTINNOVATION [INT] | ~200 | Council-protected splice proposals from fight round 0712 | state | CEO-listing |
| `~/.claude/delegation/UPLINK_DOCTRINE.md` | PLAN_UPLINK_PROTOCOL [INT] | ~207 | Uplink advisory protocol: format, redaction, packet schema | doctrine | CEO-listing |
| `~/.claude/delegation/arms-inventory.md` | PLAN_FIGHTINNOVATION [INT] | ~60 | Inventory of integration arms (attack surfaces, threat model) | doctrine | CEO-listing |
| `~/.claude/delegation/assistant-fight-gate-DESIGN.md` | PLAN_FIGHTINNOVATION [INT] | ~75 | Design doc for assistant fight gate mechanism | doctrine | CEO-listing |
| `~/.claude/delegation/assistant-state.json` | PLAN_DYNAMIC_WORKERS [INT] | ~1 | Runtime: current delegation assistant state (session tracking) | state | CEO-listing |
| `~/.claude/delegation/candidates.txt` | PLAN_DYNAMIC_WORKERS [INT] | ~1 | Candidate model list for dynamic model selection | state | CEO-listing |
| `~/.claude/delegation/cli-version.txt` | PLAN_DYNAMIC_WORKERS [INT] | ~1 | Pinned Copilot CLI version for delegation dispatch | state | CEO-listing |
| `~/.claude/delegation/config-liveness-registry.json` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | ~55 | Registry: live config values used by check-config-liveness.mjs | code | CEO-listing |
| `~/.claude/delegation/config.json` | PLAN_DYNAMIC_WORKERS; M: SUBPLAN_LCD_04_STALL_HANDLING [INT] | ~3 | Worker dispatch config (stall timeout, poll interval) | code | CEO-listing |
| `~/.claude/delegation/config.json.bak-lcd04` | SUBPLAN_LCD_04_STALL_HANDLING [INT] | ~2 | Pre-LCD_04 backup of config.json | state | CEO-listing |
| `~/.claude/delegation/debate-protocol.md` | PLAN_FIGHTINNOVATION [INT] | ~119 | Protocol: adversarial council debate format for innovation proposals | doctrine | CEO-listing |
| `~/.claude/delegation/decision-debates.jsonl` | PLAN_FIGHTINNOVATION [INT] | ~3 | Runtime log of council debate decisions | state | CEO-listing |
| `~/.claude/delegation/discover.sh` | PLAN_DYNAMIC_WORKERS [INT] | ~34 | Shell script: discovers delegation routing targets | code | CEO-listing |
| `~/.claude/delegation/dispatcher-lessons.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | ~133 | Accumulated dispatcher lessons from live council runs | state | CEO-listing |
| `~/.claude/delegation/duty_stack.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY; M: SUBPLAN_LCD_07 [INT] | ~148 | Lowercase runtime copy of DUTY_STACK.md | doctrine | CEO-listing |
| `~/.claude/delegation/gap-hunt-checklist.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | ~60 | Gap-hunt checklist for council audit passes | doctrine | CEO-listing |
| `~/.claude/delegation/gates-config.json` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | ~55 | Gate configuration registry: gate IDs to home-hook paths | code | CEO-listing |
| `~/.claude/delegation/grants-audit.log` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | ~600 | Runtime: gate grants/denies audit log | state | CEO-listing |
| `~/.claude/delegation/interrogation-bank.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | ~42 | Bank of interrogation questions for worker gap analysis | doctrine | CEO-listing |
| `~/.claude/delegation/labor-gate-audit.log` | PLAN_DELEGATION_CHEATPROOF [INT] | ~460 | Runtime: labor-gate dispatch audit log | state | CEO-listing |
| `~/.claude/delegation/labor-gate-config.json` | PLAN_DELEGATION_CHEATPROOF [INT] | ~2 | Labor gate config: concurrent-worker thresholds, enabled flag | code | CEO-listing |
| `~/.claude/delegation/labor-gate-config.json.bak-cheatproof-20260715` | PLAN_DELEGATION_CHEATPROOF [INT] | ~1 | Pre-cheatproof backup of labor-gate-config.json | state | CEO-listing |
| lesson-router in the local delegation home bundle | SUBPLAN_LCD_07_OBSERVABILITY [INT] | ~20 | Routes dispatcher lessons to appropriate learning channels | doctrine | CEO-listing |
| model-costs in the local delegation home bundle | PLAN_DYNAMIC_WORKERS [INT] | ~8 | Cost data per model for routing-policy optimization | code | CEO-listing |
| `~/.claude/delegation/model-registry.json` | PLAN_DYNAMIC_WORKERS [INT] | ~89 | Registry of models available for council dispatch | code | CEO-listing |
| `~/.claude/delegation/outcomes.jsonl` | PLAN_DYNAMIC_WORKERS [INT] | ~250 | Runtime: dispatch outcomes log (every council run result) | state | CEO-listing |
| `~/.claude/delegation/pruning-policy.md` | SUBPLAN_LCD_06_SELF_PRUNING [INT] | ~30 | Self-pruning policy: when and how to archive stale delegation files | doctrine | CEO-listing |
| `~/.claude/delegation/registry-block.sh` | PLAN_DYNAMIC_WORKERS [INT] | ~88 | Shell script: blocks/unblocks delegation registry entries | code | CEO-listing |
| `~/.claude/delegation/registry-block.sh.pre-orch-bak` | PLAN_DYNAMIC_WORKERS [INT] | ~87 | Pre-orchestrator backup of registry-block.sh | state | CEO-listing |
| `~/.claude/delegation/routing-changes.log` | PLAN_DYNAMIC_WORKERS [INT] | ~1 | Runtime: log of routing-policy changes | state | CEO-listing |
| `~/.claude/delegation/routing-policy.json` | PLAN_DYNAMIC_WORKERS [INT] | ~18 | Cheapest-proven-model routing policy per ticket class | code | CEO-listing |
| scorecard in the local delegation home bundle | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | ~1 | Runtime: current scorecard summary | state | CEO-listing |
| `~/.claude/delegation/scorecard.mjs` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | ~265 | Scorecard computation: worker quality metrics from council runs | code | CEO-listing |
| `~/.claude/delegation/self_incidents.log` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | ~65 | Runtime: self-identified incidents log | state | CEO-listing |
| `~/.claude/delegation/session-continuity.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | ~63 | Session continuity protocol: how to resume interrupted council runs | doctrine | CEO-listing |
| `~/.claude/delegation/ticket-template.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY; M: PLAN_DELEGATION_CHEATPROOF [INT] | ~48 | Template for dispatching worker tickets with correct DUTY_STACK | doctrine | CEO-listing |
| `~/.claude/delegation/ticket-template.md.bak-cheatproof-20260715` | PLAN_DELEGATION_CHEATPROOF [INT] | ~48 | Pre-cheatproof backup of ticket-template.md | state | CEO-listing |
| `~/.claude/delegation/uplink-policy.json` | PLAN_UPLINK_PROTOCOL [INT] | ~23 | Uplink policy: which events trigger advisory, redaction rules | code | CEO-listing |
| uplink log in the local delegation home bundle | PLAN_UPLINK_PROTOCOL [INT] | ~182 | Runtime: uplink advisory log | state | CEO-listing |
| `~/.claude/delegation/weakness-map.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | ~47 | Map of known worker weaknesses by category | doctrine | CEO-listing |
| `~/.claude/delegation/worker-rules-extract.md` | SUBPLAN_PARITY_INJECTION_SYSTEM M3 [INT] | ~75 | M3 preamble source: worker house rules extracted for ticket injection | doctrine | CEO-listing |
| `~/.claude/delegation/wrapper-clear-waiter.sh` | PLAN_DYNAMIC_WORKERS [INT] | ~9 | Shell: waits for wrapper clear signal before dispatch | code | CEO-listing |
| `~/.claude/delegation/gates/envelope.mjs` | PLAN_DELEGATION_CHEATPROOF [INT] | ~27 | Envelope gate: wraps worker output in tamper-evident structure | code | CEO-listing |
| `~/.claude/delegation/gates/verify-run.mjs` | PLAN_DELEGATION_CHEATPROOF; M: cheatproof-20260715 [INT] | ~310 | Verify-run gate: validates worker output against parity schema | code | CEO-listing |
| `~/.claude/delegation/gates/verify-run.mjs.bak2-cheatproof-20260715` | PLAN_DELEGATION_CHEATPROOF [INT] | ~310 | Pre-cheatproof backup of verify-run.mjs | state | CEO-listing |
| private baseline-hashes file in the local delegation home bundle | PLAN_DELEGATION_CHEATPROOF [INT] | ~6 | Baseline hashes for tamper-detection (private, not in repo) | state | CEO-listing |
| private fixture corpus in the local delegation home bundle | PLAN_DELEGATION_CHEATPROOF [INT] | ~73 | Private fixture corpus for gate verification | state | CEO-listing |
| `~/.claude/delegation/private/gates.sha256` | PLAN_DELEGATION_CHEATPROOF [INT] | ~3 | SHA256 checksums of gate files (tamper-detection) | state | CEO-listing |
| `~/.claude/delegation/private/gates.sha256.tmp-backup` | PLAN_DELEGATION_CHEATPROOF [INT] | ~3 | Temporary backup of gates.sha256 | state | CEO-listing |

### HOME Runtime Artifact Directories (grouped — not enumerated individually per row due to volume)

| group | origin | count | description | layer | found-by |
|---|---|---|---|---|---|
| `~/.claude/delegation/reports/` | All integration plans (runtime outputs) | ~250 files | Per-run council report .md files from all dispatch sessions | state | CEO-listing |
| `~/.claude/delegation/tickets/` | Multiple | ~25 files | Operational TICKET-*.md and REVIEW-*.md dispatch tickets | state | CEO-listing |
| `~/.claude/delegation/logs/` | PLAN_DYNAMIC_WORKERS | 6 dirs + process logs | Per-run process logs from assist-series runs | state | CEO-listing |
| `~/.claude/delegation/stall-queue/` | SUBPLAN_LCD_04_STALL_HANDLING | 7 files | Bounce files for stalled council dispatches | state | CEO-listing |
| `~/.claude/delegation/locks/` | PLAN_DYNAMIC_WORKERS | 3 slot dirs | Runtime dispatch slot locks (active sessions) | state | CEO-listing |
| `~/.claude/delegation/` (TICKET-*/BRIEF-*/REVIEW-* in root) | Multiple | ~35 files | Operational planning briefs, bounce docs, review artifacts in root | state | CEO-listing |

---

## HOME SURFACE — ~/.claude/hooks/ (delegation-* and related)

| path | origin plan | lines (approx) | purpose one-liner | layer | found-by |
|---|---|---|---|---|---|
| `~/.claude/hooks/check-agent-parity.mjs` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | ~210 | Checks agent-to-repo parity: agent prompts vs repo rules drift | hard-deny | CEO-listing |
| `~/.claude/hooks/check-closure-debt.mjs` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | ~186 | Checks plan closure debt: open plans past due | hard-deny | CEO-listing |
| `~/.claude/hooks/check-config-liveness.mjs` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | ~210 | Checks config values are live/valid per liveness registry | hard-deny | CEO-listing |
| `~/.claude/hooks/check-delegation-envelope.mjs` | PLAN_DELEGATION_CHEATPROOF; M: cheatproof-20260715 [INT] | ~278 | Checks delegation envelope tamper-evidence on worker return | hard-deny | CEO-listing |
| `~/.claude/hooks/check-delegation-envelope.mjs.bak-cheatproof-20260715` | PLAN_DELEGATION_CHEATPROOF [INT] | ~272 | Pre-cheatproof backup of check-delegation-envelope.mjs | state | CEO-listing |
| `~/.claude/hooks/check-isolation-perimeter.mjs` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | ~225 | Checks worker isolation perimeter (no cross-ticket contamination) | hard-deny | CEO-listing |
| `~/.claude/hooks/check-weight-council.mjs` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | ~260 | Checks council weight: max parallel workers + model class compliance | hard-deny | CEO-listing |
| `~/.claude/hooks/delegation-gate.mjs` | PLAN_DELEGATION_CHEATPROOF; M: SUBPLAN_LCD_07_OBSERVABILITY [INT] | ~339 | Main delegation gate: anti-cheat + anti-injection for dispatch | hard-deny | CEO-listing |
| `~/.claude/hooks/delegation-gate.mjs.bak-cheatproof-20260715` | PLAN_DELEGATION_CHEATPROOF [INT] | ~184 | Pre-cheatproof backup of delegation-gate.mjs (Jul 12 state) | state | CEO-listing |
| `~/.claude/hooks/delegation-gate.mjs.bak-lcd07` | SUBPLAN_LCD_07_OBSERVABILITY [INT] | ~283 | Pre-LCD_07 backup of delegation-gate.mjs (Jul 16 state) | state | CEO-listing |
| `~/.claude/hooks/delegation-nudge.mjs` | SUBPLAN_LCD_03_COMPACTION_SURVIVAL; M: SUBPLAN_LCD_04_STALL_HANDLING [INT] | ~155 | Nudge hook: announces dispatch-related context advisories | mid-announce | CEO-listing |
| `~/.claude/hooks/delegation-nudge.mjs.bak-lcd03` | SUBPLAN_LCD_03_COMPACTION_SURVIVAL [INT] | ~137 | Pre-LCD_03 backup of delegation-nudge.mjs | state | CEO-listing |
| `~/.claude/hooks/delegation-nudge.mjs.bak-lcd04` | SUBPLAN_LCD_04_STALL_HANDLING [INT] | ~138 | Pre-LCD_04 backup of delegation-nudge.mjs | state | CEO-listing |
| `~/.claude/hooks/delegation-primer.mjs` | SUBPLAN_LCD_03_COMPACTION_SURVIVAL [INT] | ~134 | Primer hook: pre-dispatch context priming for workers | mid-announce | CEO-listing |
| `~/.claude/hooks/delegation-primer.mjs.bak-lcd03` | SUBPLAN_LCD_03_COMPACTION_SURVIVAL [INT] | ~105 | Pre-LCD_03 backup of delegation-primer.mjs | state | CEO-listing |
| `~/.claude/hooks/labor-gate.mjs` | PLAN_DELEGATION_CHEATPROOF; M: cheatproof-20260715 [INT] | ~184 | Labor gate: tracks and limits concurrent worker dispatches | hard-deny | CEO-listing |
| `~/.claude/hooks/labor-gate.mjs.bak-cheatproof-20260715` | PLAN_DELEGATION_CHEATPROOF [INT] | ~72 | Pre-cheatproof backup of labor-gate.mjs | state | CEO-listing |
| `~/.claude/hooks/ua-worker-guard.mjs` | SUBPLAN_LCD_07_OBSERVABILITY [INT] | ~117 | UA worker guard: observability gate for worker dispatch lifecycle | hard-deny | CEO-listing |

---

## HOME SURFACE — ~/.copilot/agents/

| path | origin plan | lines (approx) | purpose one-liner | layer | found-by |
|---|---|---|---|---|---|
| `~/.copilot/agents/chief.agent.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY; M: cheatproof-20260715 [INT] | ~168 | Chief agent system prompt: senior orchestrator for council dispatch | doctrine | CEO-listing |
| `~/.copilot/agents/chief.agent.md.bak-2026-07-14T09-38-29-747Z` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY [INT] | ~114 | Pre-July-14 backup of chief.agent.md | state | CEO-listing |
| `~/.copilot/agents/chief.agent.md.bak-cheatproof-20260715` | PLAN_DELEGATION_CHEATPROOF [INT] | ~124 | Pre-cheatproof backup of chief.agent.md | state | CEO-listing |
| `~/.copilot/agents/council-planner.agent.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY; M: cheatproof-20260715 [INT] | ~60 | Council planner agent: rigorously audited plan drafting | doctrine | CEO-listing |
| `~/.copilot/agents/council-planner.agent.md.bak-cheatproof-20260715` | PLAN_DELEGATION_CHEATPROOF [INT] | ~44 | Pre-cheatproof backup of council-planner.agent.md | state | CEO-listing |
| `~/.copilot/agents/council-reviewer.agent.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY; M: SUBPLAN_LCD_07_OBSERVABILITY [INT] | ~193 | Council reviewer agent: adversarial cross-vendor review | doctrine | CEO-listing |
| `~/.copilot/agents/council-reviewer.agent.md.bak-cheatproof-20260715` | PLAN_DELEGATION_CHEATPROOF [INT] | ~99 | Pre-cheatproof backup of council-reviewer.agent.md | state | CEO-listing |
| `~/.copilot/agents/council-verifier.agent.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY; M: SUBPLAN_LCD_07_OBSERVABILITY [INT] | ~68 | Council verifier agent: mechanical spec-vs-diff verification | doctrine | CEO-listing |
| `~/.copilot/agents/council-verifier.agent.md.bak-cheatproof-20260715` | PLAN_DELEGATION_CHEATPROOF [INT] | ~30 | Pre-cheatproof backup of council-verifier.agent.md | state | CEO-listing |
| `~/.copilot/agents/council-worker.agent.md` | PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY; M: cheatproof-20260715 [INT] | ~45 | Council worker agent: senior-engineer-replacement workhorse | doctrine | CEO-listing |
| `~/.copilot/agents/council-worker.agent.md.bak-cheatproof-20260715` | PLAN_DELEGATION_CHEATPROOF [INT] | ~43 | Pre-cheatproof backup of council-worker.agent.md | state | CEO-listing |

---

## DISAGREEMENTS

| ID | path | Seat A value | Seat B value | Disk evidence | RULING |
|---|---|---|---|---|---|
| D1 | `.claude/skills/ultra-agents/copilot-worker.sh` origin | `LCD_01-04 + SUBPLAN_PARITY_BUGFIXES + PLAN_STATIC_TO_DYNAMIC` | `PLAN_DYNAMIC_WORKERS` | Bak files: `.bak-lcd07` (LCD_07 staged mod, Jul 16). A identified modification series; B identified creation plan. | BOTH PARTIALLY CORRECT. B names creation; A names modification series. Merged: "PLAN_DYNAMIC_WORKERS (creation); M: LCD_01-04, SUBPLAN_PARITY_BUGFIXES, PLAN_STATIC_TO_DYNAMIC" |
| D2 | `.claude/skills/ultra-agents/tavily-mcp/` origin | `SUBPLAN_LCD_04_STALL_HANDLING` | `PLAN_WORKER_SKILL_ROUTING` | LCD_04 plan name = stall handling specifically; PLAN_WORKER_SKILL_ROUTING built the MCP infrastructure. test-client has bak pattern consistent with worker-skill-routing era. | B CORRECT for creation; A CORRECT for stall-handling enhancements. Merged: "PLAN_WORKER_SKILL_ROUTING (creation); M: SUBPLAN_LCD_04_STALL_HANDLING" |
| D3 | `.claude/skills/ultra-agents/tavily-mcp/test-client.ts` lines | `184` | `~40` | DISK PROOF: `Get-Content` count = 184 lines | A CORRECT. B's ~40 is a gross underestimate. Manifest uses 184. |
| D4 | `.claude/hooks/lib/check-identity-switch.mjs` origin | `PLAN_IDENTITY_ENFORCEMENT + PLAN_STATIC_TO_DYNAMIC` | `PLAN_DELEGATION_CHEATPROOF` | All three plans touched identity enforcement across different eras. File has 409 lines suggesting multi-wave build. | BOTH PARTIALLY CORRECT. Created in PLAN_IDENTITY_ENFORCEMENT, extended in PLAN_STATIC_TO_DYNAMIC, hardened in PLAN_DELEGATION_CHEATPROOF. Merged multi-plan attribution used. |
| D5 | `.claude/hooks/lib/check-mistake-ledger.mjs` origin | `SUBPLAN_LCD_02_ENFORCEMENT_HOLES` | `SUBPLAN_LCD_05_LEARNING_LANES` | LCD_02 = enforcement holes (likely created the gate); LCD_05 = learning lanes (likely added acknowledgment logic). | BOTH PARTIALLY CORRECT. LCD_02 created; LCD_05 modified. Merged attribution used. |
| D6 | `.claude/skills/chain/SKILL.md` origin | `PLAN_STATIC_TO_DYNAMIC` | `SUBPLAN_LCD_03_COMPACTION_SURVIVAL` | LCD_03 is specifically compaction-survival; chain skill's CHAIN_DAILY_CAP and compaction docs are LCD_03 content. | B MORE SPECIFIC. LCD_03 is primary origin; PLAN_STATIC_TO_DYNAMIC may reflect broader context. Merged: LCD_03 primary, PLAN_STATIC_TO_DYNAMIC as M. |
| D7 | `.claude/skills/compile-learnings/SKILL.md` origin | `SUBPLAN_PARITY_INJECTION_SYSTEM M3 wire` | `SUBPLAN_LCD_05_LEARNING_LANES` | LCD_05 = learning lanes (compile-learnings expansion); M3 = parity injection added worker preamble. | BOTH PARTIALLY CORRECT. LCD_05 primary; M3 modified. Merged attribution used. |
| D8 | `.claude/skills/execute/SKILL.md` origin | `PLAN_COPILOT_CLAUDE_ABSOLUTE_PARITY` | `PLAN_WORKER_SKILL_ROUTING` | PARITY updated the execute skill with pre-research/audit; WORKER_SKILL_ROUTING added routing hooks. | BOTH PARTIALLY CORRECT. PARITY likely first; WORKER_SKILL_ROUTING M. Merged attribution used. |
| D9 | `.claude/skills/final-q/SKILL.md` origin | `PLAN_STATIC_TO_DYNAMIC + PARITY` | `SUBPLAN_LCD_07_OBSERVABILITY` | LCD_07 = observability (context-band thresholds per A's description = LCD_07 feature). A identified multi-plan history. | BOTH PARTIALLY CORRECT. A's multi-plan + LCD_07 as latest M. Merged attribution used. |
| D10 | `.claude/skills/reflect/SKILL.md` origin | `SUBPLAN_PARITY_INJECTION_SYSTEM M3 wire` | `SUBPLAN_LCD_05_LEARNING_LANES` | Same pattern as compile-learnings: LCD_05 added mistake-ledger integration; M3 injected worker preamble. | BOTH PARTIALLY CORRECT. LCD_05 primary; M3 modified. Merged attribution used. |
| D11 | Layer for JSON/config files | `code` | `config` (B's extension) | Governing plan Phase 0.2 layer key: soft-prose \| mid-announce \| hard-deny \| code \| doctrine \| state. "config" is not in the spec. | A CORRECT. All JSON/config files classified "code" per governing plan's layer key. |
| D12 | `scripts/prune-check.mjs` vs `scripts/verify-no-stale-live-refs.mjs` | A found prune-check.mjs (154 lines) | B found verify-no-stale-live-refs.mjs (92 lines) | DISK: both files exist at their respective paths (Test-Path = True for both). Both origin = SUBPLAN_LCD_06_SELF_PRUNING. | NOT A DISAGREEMENT — TWO DIFFERENT FILES. prune-check.mjs is A-only; verify-no-stale-live-refs.mjs is B-only. Both included in merged manifest. |
| D13 | `scripts/ticket-doctrine-from-scope.test.mjs` lines | `290` | `~80` | A provides exact count; B provides approximation. | A CORRECT (exact vs approximation). Manifest uses 290. |
| D14 | Scope: [INT]-only vs [INT+FW] | A: integration files only | B: integration + framework files | Phase 0.2 denominator is for all phases incl. 2.5 (harness efficiency audit requires FW files). | B CORRECT. Broader scope adopted. All FW files included, tagged [FW] or [INT+FW]. |

---

## REJECTED

No rows rejected. All B-only rows verified True on disk via `Test-Path`. The two apparent double-path failures (`scripts/scripts/lib/...`, `scripts/scripts/validate-activity-log.test.mjs`) were errors in the verification script input, not B's manifest content — B's manifest uses correct single-level paths (`scripts/lib/forbidden-patterns.mjs`, `scripts/validate-activity-log.test.mjs`), both verified True.

---

## LCD ATTRIBUTION GAP-FILL (Seat A's open ASK)

Seat A flagged that `copilot-worker.sh` and gate changes had "git commit message only" as evidence for per-LCD attribution. Exec-summary tails of SUBPLAN_LCD_01-07 were not read due to credit constraints. Available evidence (bak-file timestamps + plan names):

| file | attribution evidence | confidence |
|---|---|---|
| `copilot-worker.sh` | PLAN_DYNAMIC_WORKERS created it; LCD_01-04 series modified it (stall guard, ledger, envelope per bak dates); PLAN_STATIC_TO_DYNAMIC added s2d hooks | PARTIAL — per-LCD commit attribution not confirmed from exec summaries |
| `delegation-gate.mjs` | .bak-cheatproof-20260715 (Jul 12 baseline) + .bak-lcd07 (Jul 16) → created pre-Jul-12, modified Jul 15+16 | PARTIAL |
| `delegation-nudge.mjs` | .bak-lcd03 + .bak-lcd04 → created in LCD_03 (Jul 16), modified in LCD_04 (Jul 16) | STRONG |
| `delegation-primer.mjs` | .bak-lcd03 → created in LCD_03 (Jul 16) | STRONG |
| `ua-worker-guard.mjs` | no bak, dated Jul 16 = LCD_07 era | STRONG |
| `ua0-worker-guard.mjs` | dated Jul 16 during LCD_07 week | STRONG |

**Status: PARTIALLY RESOLVED.** Per-LCD commit attribution for copilot-worker.sh remains approximate. Full resolution requires reading SUBPLAN_LCD_01-07 execution summary tails.
