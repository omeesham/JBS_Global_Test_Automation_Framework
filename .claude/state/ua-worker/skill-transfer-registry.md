# Skill Transfer Registry

**Source**: `.claude/skills/INDEX.md` (classification source — 33 skills)
**Maintained by**: whoever maintains `.claude/skills/INDEX.md`

### TRANSFERABLE skills (11 — methodology readable + followable by a worker)

| # | Skill | Evidence signature (what the worker's report MUST show) |
|---|---|---|
| 1 | `/rca` | DOCTRINE_READ lists `rca/SKILL.md`. Report shows: (1) artifact reads BEFORE any fix attempt, (2) IS/IS-NOT table or structured analysis, (3) root cause with cited evidence. |
| 2 | `/coverage` | DOCTRINE_READ lists `coverage/SKILL.md`. Report shows: FCC taxonomy per field, L1 surface/behavior must-asserts, `field-case-generation.md` categories cited. |
| 3 | `/ultracoverage` | Same as `/coverage` plus L2/L3 depth markers (pairwise grids, date-BVA, persistence). |
| 4 | `/regression-guard` | VERIFY_OUTPUT shows before/after structural fingerprint (exports, imports, routes, signatures) with diff. |
| 5 | `/bugfix` | Report shows explore→trace-root-cause→plan-fix→implement→verify sequence (not jump-to-fix). |
| 6 | `/find-bugs` | Report shows SFDPOT heuristic categories explored (Structure, Function, Data, Platform, Operations, Time). |
| 7 | `/review` | Report shows actionable findings with file:line references and fix-plan. |
| 8 | `/cleanup` | Report shows dead-code/unused-import identification (with evidence) before removal. |
| 9 | `/research` | Report shows ≥2 sources with URLs, findings mapped to our stack. |
| 10 | `/graft` | Report shows source-vs-port verification diff + E2E proof run output. |
| 11 | `/relevant` | DOCTRINE_READ lists `relevant/SKILL.md`. Report shows: sub-task decomposition with skill/rule tags per sub-task and routing rationale provided. (Transferable because: the core methodology — "scan for applicable skills/rules before multi-step work, tag sub-tasks" — is readable + followable; the hook-based auto-injection is Claude-only convenience.) |

### CLAUDE-ONLY skills (22 — require harness/hooks/transcript/interactive machinery)

| # | Skill | Why non-transferable |
|---|---|---|
| 1 | `/execute` | Orchestrates multi-phase plan execution via TodoWrite, auto-calls 5 other skills — requires Claude's session state + tool chain. |
| 2 | `/final-q` | Reads TodoWrite state, checks context-budget thresholds — requires Claude's internal context accounting. |
| 3 | `/identity` | Loads pipeline agent system prompts, drives identity switching, write-gates via PreToolUse hook. |
| 4 | `/chain` | Autonomous plan execution via `chain-orchestrator.sh`, resume/pause/skip — not a single-turn task. |
| 5 | `/chain_audit` | Walks chain-spawned session logs — audit of Claude's own execution history. |
| 6 | `/reflect` | Session-end retrospective updating auto-memory, checking 6 triggers — requires session transcript. |
| 7 | `/compile-learnings` | Scans `agent-mistakes.md` for 3+ patterns, graduates to LR rules — framework meta-skill. |
| 8 | `/planning` | Creates plans with LR-041 validation checklist, saves to `plans/pending/` — plan-authoring ceremony. |
| 9 | `/questionnaire` | Dynamic question chain adapting on answers — interactive multi-turn by design. |
| 10 | `/ultrathink` | Quality-gated wrapper with mandatory TodoWrite gates — requires TodoWrite. |
| 11 | `/sonnet` | Model-aware guardrails for Sonnet sessions — irrelevant to workers. |
| 12 | `/share-kt` | Cross-repo exploration — workers confined to this repo. |
| 13 | `/innovation` | Anti-over-delegation: frontier model authors novel thinking — non-transferable by doctrine. |
| 14 | `/audit` | Universal pipeline auditor (7 modes) — deep transcript/pipeline state access. |
| 15 | `/deploy` | Push-to-prod ceremony — workers NEVER publish. |
| 16 | `/report` | Tier-appropriate artifact generation — side-effecting, explicit-only, requires Claude reporting. |
| 17 | `/standup` | Scheduling/reporting — interactive, personal, explicit-only. |
| 18 | `/end-day` | Daily status from multiple sources — interactive, personal, explicit-only. |
| 19 | `/end-week` | Weekly summary — interactive, personal, explicit-only. |
| 20 | `/next-this-week` | Forward-looking schedule — interactive, personal, explicit-only. |
| 21 | `/encore-questions` | Live-Chrome-verified batch — requires Claude's MCP browser. |
| 22 | `/ultra-agents` | Cap booster for subagent spawning — Claude-only orchestration control. |

**Row count**: 11 + 22 = 33 = INDEX.md skill row count (`grep -c '^| /' .claude/skills/INDEX.md` = 33). ✓

### HYBRID note

`/rca`: mama-led orchestration (subagent spawning) is Claude ceremony; core methodology (IS/IS-NOT, Fishbone, 5 Whys, artifact-first) transfers. Workers follow METHODOLOGY, not ORCHESTRATION.
`/relevant`: hook-based auto-injection is Claude-only; manual routing methodology (scan for skills before multi-step work) is transferable.

### Registry-vs-INDEX parity acceptance check (name-SET comparison, not count)

**Machine check** (run at plan acceptance AND during any registry/INDEX maintenance). The authoritative runnable form is the Phase-1 / Verification snippet below; this block states intent:

- Extract sorted skill NAMES from INDEX (`^| /<name>`), and sorted skill NAMES from the registry (both tables, `| \`/<name>\``).
- `comm`-diff the two sorted sets. FAIL on any MISSING (in INDEX, absent from registry), EXTRA (in registry, absent from INDEX), or DUP (name appears twice in registry).

**Rationale**: count-only parity (v2's `grep -c`) passes a duplicate/missing swap. A sorted name-SET diff catches MISSING, EXTRA, and DUP individually (GPT S2 fix). See Phase 1 step 3 + Verification commands for the exact runnable script.
