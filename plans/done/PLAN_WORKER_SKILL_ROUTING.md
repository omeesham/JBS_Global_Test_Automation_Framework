**Status**: DONE
**Executed**: 2026-07-16 (verification-close; deliverables landed 2026-07-12/13)
**Priority**: P2
**Created**: 2026-07-13
**Identity**: OWNER
**Type**: Framework extension — delegation skill-routing gap closure
**Model**: claude-opus-4-8
**Thinking**: max
**Justification**: multi-file cross-surface edits touching protected delegation files + per-skill evidence design requires judgment
**PermissionMode**: auto
**BrowserTool**: none
**Depends on**: PLAN_UPLINK_PROTOCOL (P0–P6 landed; P7 independent)
**NOT-CHAIN-RUNNABLE**: Phase 3 edits `worker-ext.md` (PROTECTED) — requires Rutvik live in-chat GO + a scoped SELF_GRANT per the same gate PLAN_UPLINK_PROTOCOL / PLAN_STATIC_TO_DYNAMIC honor. Phase 4 edits machine-local copilot agent profiles (agent.md files in the home copilot agents dir). Never edit the wrapper/worker-ext while another session runs workers through it.

# PLAN_WORKER_SKILL_ROUTING — Skill awareness, access, and enforcement for copilot council workers

## Bootstrap
- **Identity**: OWNER (no switch needed; Phase 3 protected-file writes are gated by Rutvik GO + SELF_GRANT, not by an identity switch).
- **Skills**: /execute (orchestrator) · /relevant (pre-execution) · /regression-guard (wrap the new scanner + config/hook edits) · /reflect + /final-q (closure).
- **Context files**: this plan · `.claude/skills/ultra-agents/worker-ext.md` (skill-routing clause `:110`, PROTECTED list, dispatch how-to) · `.claude/skills/INDEX.md` (33-skill catalog — the classification source) · `scripts/run-relevant-scan.mjs` (the existing scanner contract this plan deliberately does NOT reuse) · `.claude/rules/guardrail-policy.md` (LR-069 ramp/bloat-governor + LR-070 uplink) · `.claude/rules/pipeline.md` (LR-020 / LR-048 / LR-050) · review evidence: `.claude/state/ua-worker/worker-skills-review-v2-{gpt,opus}/verdict.md` (both YELLOW; the 5 named fixes are folded into this v3) · design lineage: `.claude/state/ua-worker/worker-skills-design-v2-0712/result.md` + `.claude/state/ua-worker/worker-skills-design-v3-0712/result.md`.
- **Delegation split (this plan's own execution)**: council workers BUILD `scripts/ticket-skill-scan.mjs` + the state-dir registry/evidence-signature files to Claude-authored specs; Claude APPLIES the PROTECTED `worker-ext.md` edit under SELF_GRANT and the machine-local profile edits; cross-family review + T0 verify per the delegation pyramid; the E2E acceptance (a real `/rca`-DOCTRINE ticket → reviewer DIGEST) dispatches through the NEW machinery after apply.

## Context — the gap, precisely stated

Claude has a `Skill` tool that loads `.claude/skills/<name>/SKILL.md` on demand. The `/relevant` scanner (`relevant-injection.mjs` → `run-relevant-scan.mjs`, a UserPromptSubmit hook) auto-fires on every Claude prompt, matching keywords to skills/rules/patterns and injecting them as advisory context. Workers run under the Copilot CLI and have **neither** the Skill tool **nor** the relevant-injection hook. The only bridge is the "Skill/rule routing (MANDATORY)" clause (`worker-ext.md:110`): Claude MUST cite governing SKILL.md paths in the ticket's DOCTRINE field, and duty #1 forces the worker to read + follow them.

**Three failure modes this bridge doesn't cover:**
1. **Dispatcher amnesia** — Claude forgets to cite the right skills in DOCTRINE. Today this depends on Claude's session memory of all 33 skills. No deterministic scan validates DOCTRINE completeness.
2. **Methodology lip-service** — a worker cites a SKILL.md in DOCTRINE_READ but doesn't actually follow the methodology. The reviewer has no per-skill evidence specification to check against.
3. **Classification void** — no maintained list distinguishes which skills are transferable-by-reading vs which require Claude's harness/hooks/transcript machinery.

## Web research — external sources mapped to our stack

### Source 1: Anthropic "Agent Skills" / Progressive Disclosure
**URL**: https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
**Key finding**: Skills use 3-layer progressive disclosure: metadata → full SKILL.md → reference docs. The Skill tool is LOADING machinery; methodology content is plain markdown readable by any filesystem-access agent.
**Mapping**: Workers have filesystem access. We replicate ROUTING + VERIFICATION, not the tool.

### Source 2: AGENTS.md Specification / Custom Agent Instruction Injection
**URL**: https://www.morphllm.com/agents-md-guide + https://gist.github.com/0xdevalias/f40bc5a6f84c4c5ad862e314894b2fa6
**Key finding**: Custom Copilot CLI agents receive `.agent.md` as system prompt. No dynamic skill loading. Instructions baked in profile or injected via ticket.
**Mapping**: Confirms ticket DOCTRINE + duty #1 is the correct injection pattern.

### Source 3: Anthropic Agent Skills Course (Skilljar)
**URL**: https://anthropic.skilljar.com/introduction-to-agent-skills
**Key finding**: Skills are instruction sets, not tools. Value is methodology content, not loading machinery.
**Mapping**: Transferring methodology via file reads is architecturally sound.

---

## Deliverable 1 — Skill Transfer Registry (the classification)

**File**: `.claude/state/ua-worker/skill-transfer-registry.md` (git-excluded state dir — workers do NOT need to read this; only the DISPATCHER and REVIEWER load it)

**Maintained by**: whoever maintains `.claude/skills/INDEX.md` (today: manual — update when creating/modifying skills per INDEX.md:6 instructions)

### TRANSFERABLE skills (11 — methodology readable + followable by a worker)

| # | Skill | Evidence signature (what the worker's report MUST show) |
|---|---|---|
| 1 | `/rca` | DOCTRINE_READ lists `.claude/skills/rca/SKILL.md`. Report shows: (1) artifact reads BEFORE any fix attempt, (2) IS/IS-NOT table or structured analysis, (3) root cause with cited evidence. |
| 2 | `/coverage` | DOCTRINE_READ lists `coverage/SKILL.md`. Report shows: FCC taxonomy per field, L1 surface/behavior must-asserts, `field-case-generation.md` categories cited. |
| 3 | `/ultracoverage` | Same as `/coverage` plus L2/L3 depth markers (pairwise grids, date-BVA, persistence). |
| 4 | `/regression-guard` | VERIFY_OUTPUT shows before/after structural fingerprint (exports, imports, routes, signatures) with diff. |
| 5 | `/bugfix` | Report shows explore→trace-root-cause→plan-fix→implement→verify sequence (not jump-to-fix). |
| 6 | `/find-bugs` | Report shows SFDPOT heuristic categories explored (Structure, Function, Data, Platform, Operations, Time). |
| 7 | `/review` | Report shows actionable findings with file:line references and fix-plan. |
| 8 | `/cleanup` | Report shows dead-code/unused-import identification (with evidence) before removal. |
| 9 | `/research` | Report shows ≥2 sources with URLs, findings mapped to our stack. |
| 10 | `/graft` | Report shows source-vs-port verification diff + E2E proof run output. |
| 11 | `/relevant` | DOCTRINE_READ lists `.claude/skills/relevant/SKILL.md`. Report shows: sub-task decomposition with skill/rule tags per sub-task and routing rationale provided. (Transferable because: the core methodology — "scan for applicable skills/rules before multi-step work, tag sub-tasks" — is readable + followable; the hook-based auto-injection is Claude-only convenience.) |

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

---

## Deliverable 2 — Ticket-Mode Skill Scanner (awareness mechanism)

### 2.1 — Design decision: NEW deterministic ticket-mode scanner

**Why not use `run-relevant-scan.mjs`**: that scanner (`scripts/run-relevant-scan.mjs:390–405`) hardcodes `matchType:"INFORM"` for ALL skills and caps results at `TOP_N_SKILLS=4` (`:50`). The v1 draft branched on DIRECT/INFORM — impossible against this scanner. The prompt-injection scanner has a DIFFERENT CONTRACT: advisory context for Claude (capped to avoid prompt bloat, forced-INFORM because skill loading is Claude's job). The ticket-mode scanner has a ROUTING CONTRACT: complete, no-cap, true match types for the dispatcher to populate DOCTRINE.

**File**: `scripts/ticket-skill-scan.mjs` (repo-tracked, deterministic, worker-buildable)

**Contract**:
- Input: `--goal "<GOAL text>"` AND/OR `--work-type <type>`
- Reads `.claude/skills/INDEX.md` directly (Triggers column, Match Types column per row)
- Cross-references `.claude/state/ua-worker/skill-transfer-registry.md` (TRANSFERABLE list only — filters out CLAUDE-ONLY)
- Output (stdout JSON):
  ```json
  {
    "applicable": [
      {"skill": "/rca", "matchType": "DIRECT", "trigger": "root cause, why is this failing"},
      {"skill": "/regression-guard", "matchType": "WRAP", "trigger": "any code change"}
    ],
    "work_type": "rca",
    "transferable_count": 2,
    "total_index_skills": 33
  }
  ```
- Returns ONLY TRANSFERABLE skills (filters by registry classification)
- Returns TRUE `matchType` from INDEX (DIRECT/INFORM/VERIFY/WRAP — NOT forced INFORM)
- NO cap — returns ALL applicable transferable skills
- Deterministic: keyword tokenize + score against INDEX Triggers column (reuses the scoring algorithm pattern from `run-relevant-scan.mjs` `scoreRule()` but without `.slice(0, TOP_N_SKILLS)` or forced matchType)
- Work-type heuristic layer: `build` → include `/regression-guard` ONLY when the goal text contains code-mutation keywords (fix, implement, refactor, create, edit, add, change, modify, write, build — NOT deploy, ship, push, release); `rca` → always include `/rca`; `draft` → include `/research` if goal contains research-pattern keywords

**Why sound**: the ticket-mode scanner is a ROUTING tool for the DISPATCHER (Claude at ticket-write time). Different requirements from prompt-injection: completeness over brevity, true match types for DOCTRINE priority, zero false negatives.

### 2.2 — Extend the ticket-authoring recipe in worker-ext.md

**File edited**: `.claude/skills/ultra-agents/worker-ext.md` (PROTECTED — requires Rutvik go + SELF_GRANT)
**Location**: step 1 of §How-to-dispatch (`:110`), EXTENDING the existing "Skill/rule routing (MANDATORY)" clause — appended after "...tracked = secrecy leak)."

**New text**:
```
   **Skill scan recipe (deterministic — replaces Claude-remembers)**: before writing the DOCTRINE field, run:
   `node scripts/ticket-skill-scan.mjs --goal "<GOAL text>" --work-type <work-type>`
   For each returned skill in `applicable[]`:
   - Add `.claude/skills/<skill>/SKILL.md` to the ticket's DOCTRINE field.
   - For WRAP-type skills (e.g., /regression-guard): add as DOCTRINE AND note in CONSTRAINTS.
   If the scanner returns zero applicable AND work-type is build|rca|draft, manually verify
   no transferable skill governs this work — zero-result on skill-governed work = dispatcher defect.
   This scanner reads INDEX.md directly (NOT `run-relevant-scan.mjs` which caps at 4 + forces INFORM).
```

### 2.3 — Ticket template extension

**File edited**: `C:\Users\rutvi\.claude\delegation\ticket-template.md` (machine-local)
**Change**: guidance comment after DOCTRINE field:
```
## DOCTRINE (read before starting; list in DOCTRINE_READ)
<!-- Populated by dispatcher via: `node scripts/ticket-skill-scan.mjs --goal "<GOAL>" --work-type <type>`
     Returns applicable TRANSFERABLE skills; each → DOCTRINE path.
     Also include governing .claude/rules/*.md LR rules.
     Zero results on build|rca|draft = verify manually (dispatcher defect if a skill governs work). -->
```

### 2.4 — Wrapper validation wire: DEFERRED

**v1 proposed UW-5** in the wrapper arg-validation block. This is **DEFERRED** for four reasons:

1. **False-fire**: zero-`.claude/skills/` grep fires on rule-only tickets (DOCTRINE correctly cites only `.claude/rules/*.md`) and manual/explicit-only tickets with no skill governance — false warns on ~40% of dispatches.
2. **Wrong-skill miss**: blunt grep detects PRESENCE, not CORRECTNESS. The reviewer's evidence-signature check catches wrong-skill via methodology-specific evidence — the wrapper grep cannot.
3. **UW-1..4 collision**: UPLINK (`PLAN_UPLINK_PROTOCOL.md:76`) states UW-1 is "budget check ONLY, nothing else fits here." Adding UW-5 in the same arg-validation exit (:96–98) collides with UW-1's documented single-purpose scope.
4. **Earning-rent test fails**: no reviewer SKILL-SKIP data exists yet. Wire a wrapper gate only AFTER ≥30 reviewed dispatches prove dispatcher amnesia persists (>20% SKILL-SKIP rate) despite the scan recipe.

**Deferral artifact**: `.claude/guardrail-config.json` gains:
```json
{
  "skill_route_mode": "deferred",
  "skill_route_deferred_reason": "earning-rent: need >=30 reviewed dispatches to prove rent; false-fire on rule-only/manual tickets unresolved",
  "skill_route_ramp_prerequisite": "reviewer SKILL-SKIP rate >20% across 30 dispatches with the scan recipe active"
}
```

**Future wire spec** (for when rent is proven): numbered **UW-6** (avoids UPLINK's UW-1..4 + any future UW-5 UPLINK may claim), placed in the **post-exit evaluation window** (`copilot-worker.sh:501+`, after UW-4 at :497–500), using only vars that exist at that point: `$RUN_ID` (init at :80), `$WORK_TYPE` (init at :65), `$TASK` (init at :55), `$RESULT` (init at :128). Logic: run `ticket-skill-scan.mjs --goal` against the ticket's GOAL, diff output vs actual DOCTRINE content, warn if mismatch. This is a POST-DISPATCH detective (catches the amnesia after the fact for feedback), not a PRE-DISPATCH blocker.

---

## Deliverable 3 — Reviewer Skill-Compliance Enforcement

### 3.1 — Reviewer prompt extension

**File edited**: the council-reviewer agent profile, machine-local home copilot agents dir
**Change**: append `## Skill Methodology Compliance` section.

```markdown
## Skill Methodology Compliance

**Severity**: S2 (recurring craft defect — reviewer is the second catch line; dispatcher scan recipe is first).
**Graduating incident**: TICKET-worker-skills-design-v2-0712 (2026-07-12 — gap: workers cited SKILL.md in DOCTRINE_READ but methodology compliance was unchecked by the reviewer).
**Ramp**: announce-first → `.claude/guardrail-config.json` key `reviewer_skill_compliance_mode: "announce"`. Promote to auto-bounce after ≥10 reviewed dispatches with skill DOCTRINE where SKILL-SKIP false-positive rate <5%.
**Announce-first behavior**: SKILL-SKIP is a DIGEST finding only. It does NOT auto-bounce on first landing. The dispatcher evaluates materiality.

When the ticket's DOCTRINE lists one or more `.claude/skills/*/SKILL.md` paths:

1. **DOCTRINE_READ check**: every SKILL.md in DOCTRINE must appear in the worker's DOCTRINE_READ.
   Missing = UNPROVEN (the worker claims compliance with a methodology it didn't read).

2. **Evidence-signature check**: load `.claude/state/ua-worker/skill-evidence-signatures.md`.
   For each TRANSFERABLE skill in DOCTRINE, check the report for the required evidence markers:
   - /rca: artifact reads BEFORE fix + IS/IS-NOT or structured analysis + cited evidence.
   - /regression-guard: before/after fingerprint in VERIFY_OUTPUT.
   - /research: ≥2 URLs + stack mapping.
   - /bugfix: explore→trace→plan→implement→verify sequence.
   - /coverage: FCC taxonomy + L1 must-asserts.
   - /find-bugs: ≥3 SFDPOT categories explored.
   - /review: file:line findings + fix-plan.
   - /cleanup: evidence-before-removal.
   - /graft: source-vs-port diff + E2E proof.
   - /ultracoverage: /coverage markers + L2/L3 depth.
   - /relevant: sub-task skill/rule tagging with rationale.
   Missing evidence for a cited skill = SKILL-SKIP finding.

3. **DIGEST line**: `SKILL-COMPLIANCE: <n>/<total> skills evidenced`.
   Any SKILL-SKIP → `SKILL-SKIP: <skill> — <missing evidence>` in DIGEST.
```

### 3.2 — Evidence-signatures companion file

**File**: `.claude/state/ua-worker/skill-evidence-signatures.md`

**Why this path**: The cross-family reviewer cannot read `~/.claude/**` or `~/.copilot/**` (verdict confirms). The `.claude/state/` dir is INSIDE the repo filesystem (git-excluded but file-accessible to any agent running with repo access — both v2 reviewers confirmed `state-dir READABLE`). The reviewer already reads state-dir files (ledger.jsonl, meta.json) during review. This puts evidence-signatures in a repo-readable place the reviewer loads.

**Content** (structured for mechanical checking):
```markdown
# Skill Evidence Signatures (reviewer reference)

For each TRANSFERABLE skill cited in a ticket's DOCTRINE, check the worker's
report for ALL listed evidence markers.

| Skill | Required evidence markers (ALL must be present) |
|---|---|
| /rca | (1) artifact reads cited BEFORE fix attempt (2) IS/IS-NOT or structured analysis (3) root cause + cited evidence |
| /coverage | (1) FCC taxonomy per field (2) L1 must-asserts enumerated (3) field-case-generation.md categories cited |
| /ultracoverage | (1) all /coverage markers (2) L2/L3 depth markers (pairwise/date-BVA/persistence) |
| /regression-guard | (1) before snapshot in VERIFY (2) after snapshot in VERIFY (3) diff showing delta |
| /bugfix | (1) explore phase (2) trace-root-cause (3) plan-fix (4) implement (5) verify |
| /find-bugs | (1) >=3 SFDPOT categories explored with findings |
| /review | (1) actionable findings (2) file:line references (3) fix-plan per finding |
| /cleanup | (1) dead-code identification with evidence (2) removal only after evidence |
| /research | (1) >=2 source URLs (2) findings mapped to our stack |
| /graft | (1) source-vs-port diff (2) E2E proof run output |
| /relevant | (1) sub-task decomposition shown (2) skill/rule tags per sub-task with rationale |

Drift guard: row count here MUST equal TRANSFERABLE count in skill-transfer-registry.md (currently 11).
Machine check (executable): `[ "$(grep -c '^| /' .claude/state/ua-worker/skill-evidence-signatures.md)" -eq 11 ] && echo "PASS" || echo "FAIL"`.
```

---

## Reconciliation — execution order vs UPLINK → ASSISTANT

### Locked execution order: UPLINK → THIS PLAN → ASSISTANT

**Why safe:**

1. **UPLINK (P0–P6 landed)**: edited worker-ext.md (CLARIFY round step 0, consult rung, PROTECTED list), DUTY_STACK (`## ASK`), ticket template (CLARIFY row), agent profiles (ASK handling). All COMPLETE — this plan touches NONE of those sections.

2. **THIS PLAN**: extends worker-ext.md step 1 skill-routing clause (`:110` — different paragraph from UPLINK's step 0), creates `scripts/ticket-skill-scan.mjs` (new file), extends agent profiles with NEW `##` sections (not modifying UPLINK's ASK sections), creates state-dir files (registry, evidence-signatures). ONLY overlap surface: agent profiles — but this plan APPENDS after UPLINK's sections, never modifies them.

3. **ASSISTANT (runs last)**: Step-0.75 STALE-REALITY PRECHECK (`PLAN_ASSISTANT_LAYER.md:206`) reads live disk per deliverable, marks landed-by-prior-plan as ambient. This plan creates NO deliverable ASSISTANT also creates:
   - worker-ext.md skill-routing extension → ASSISTANT's deliverables target inline-mode/assistant-mode (different sections)
   - Agent profile Skill Compliance sections → ASSISTANT's A3 interrogation is a different section
   - `scripts/ticket-skill-scan.mjs` → ASSISTANT has no competing scanner
   - State-dir files → ASSISTANT doesn't touch skill-routing state

**No blind clobber**: all edits ADDITIVE. No modification of text another plan also modifies. (Both v2 reviewers independently verified: UPLINK's worker-ext step 0 is at lines 105–108, this plan's skill-routing extension is at step 1 after :110 — separate regions.)

### Wrapper interaction with UPLINK UW-1..4

This plan adds NO wrapper wire (UW-5 deferred). Zero collision with UW-1 (budget-check :96–98), UW-2 (advisory inject :237+), UW-3 (stall :435–448), UW-4 (post-exit :497–500). Future wire = UW-6 placed AFTER UW-4 in the post-exit window (`copilot-worker.sh:501+`), using only vars initialized before that point (`$RESULT` at :128, `$RUN_ID` at :80, `$WORK_TYPE` at :65, `$TASK` at :55).

---

## Phase 0 — Dependency + browser-tool gate

1. **Dependency check**: confirm `PLAN_UPLINK_PROTOCOL` Phases P0–P6 have landed (worker-ext.md step 0 CLARIFY round + PROTECTED list + agent-profile ASK sections present). This plan's reconciliation assumes those edits exist. If a UPLINK session is mid-flight on `worker-ext.md` / `copilot-worker.sh`, **HALT** — never edit those files while another session runs workers through them.
2. **Browser tool**: `none` — pure repo/config/profile edits + one E2E dispatch through the delegation wrapper. No live-DOM work.
3. **Protected-file gate**: Phase 3 (`worker-ext.md`) needs Rutvik's live in-chat GO + a scoped SELF_GRANT before any write. Do NOT enter Phase 3 without it. Phase 4 edits machine-local copilot agent profiles (outside the repo gate but still precheck-gated per Phase 4 step 1).

## Phases (each independently shippable)

### Phase 1 — Classification + evidence-signatures (zero protected-file edits)
1. Create `.claude/state/ua-worker/skill-transfer-registry.md` (Deliverable 1).
2. Create `.claude/state/ua-worker/skill-evidence-signatures.md` (Deliverable 3.2).
3. Run name-set parity check:
   ```bash
   idx_names=$(grep '^| /' .claude/skills/INDEX.md | sed 's/^| \(\/[^ |]*\).*/\1/' | sort)
   reg_names=$(grep '| `/' .claude/state/ua-worker/skill-transfer-registry.md | sed 's/.*| `\(\/[^`]*\)`.*/\1/' | sort)
   missing=$(comm -23 <(echo "$idx_names") <(echo "$reg_names"))
   extra=$(comm -13 <(echo "$idx_names") <(echo "$reg_names"))
   dup=$(echo "$reg_names" | sort | uniq -d)
   [ -z "$missing" ] && [ -z "$extra" ] && [ -z "$dup" ] && echo "PASS" || echo "FAIL — MISSING: $missing | EXTRA: $extra | DUP: $dup"
   ```
4. Run evidence-signature row-count parity:
   ```bash
   sig=$(grep -c '^| /' .claude/state/ua-worker/skill-evidence-signatures.md)
   [ "$sig" -eq 11 ] && echo "PASS: $sig signatures == 11 TRANSFERABLE" || echo "FAIL: $sig != 11"
   ```

### Phase 2 — Ticket-mode scanner [scripts/ — tracked, no PROTECTED gate]
1. Create `scripts/ticket-skill-scan.mjs` (Deliverable 2.1).
2. Verify: `node scripts/ticket-skill-scan.mjs --goal "root cause analysis" --work-type rca` → applicable contains `/rca` DIRECT.
3. Verify: `node scripts/ticket-skill-scan.mjs --goal "fix the login bug" --work-type build` → applicable contains `/regression-guard` WRAP (goal contains code-mutation keyword "fix").
4. Verify: `node scripts/ticket-skill-scan.mjs --goal "deploy to production" --work-type build` → zero applicable (goal has no code-mutation keyword; deploy is not code-mutating).

### Phase 3 — Dispatcher recipe + config [worker-ext.md PROTECTED — Rutvik GO + SELF_GRANT required]
1. Extend worker-ext.md §How-to-dispatch step 1 skill-routing clause (Deliverable 2.2).
2. Extend ticket-template.md DOCTRINE guidance comment (Deliverable 2.3).
3. `.claude/guardrail-config.json`: add `skill_route_mode` + `reviewer_skill_compliance_mode` keys (Deliverable 2.4).
4. Verify: `grep 'ticket-skill-scan' .claude/skills/ultra-agents/worker-ext.md` returns recipe line.

### Phase 4 — Reviewer prompt extension (machine-local)
1. **Precheck**: `grep -n '^## ' "$HOME_COPILOT_AGENTS"/council-reviewer.agent.md | tail -5   # HOME_COPILOT_AGENTS = home copilot agents dir` — verify structure safe for append; if unexpected structure → flag + HALT, do NOT append blindly.
2. Extend council-reviewer.agent.md (Deliverable 3.1).
3. Verify: `grep '## Skill Methodology Compliance' "$HOME_COPILOT_AGENTS"/council-reviewer.agent.md` returns header.

### Phase 5 — Deferred — pending rent (verifier check + worker-profile awareness)

**Prerequisite**: ≥10 reviewed dispatches with skill DOCTRINE where reviewer SKILL-SKIP data shows a real miss the reviewer + scanner didn't catch. Until this threshold is met, these deliverables are NOT implemented.

**Why deferred** (LR-069 §3.4 bloat governor): Both cross-family reviewers (GPT finding 6, Opus S3) identified the verifier DOCTRINE_READ check and worker-profile awareness section as redundant on day 1. The scanner catches dispatcher amnesia (failure mode 1); the reviewer evidence-signature check catches methodology lip-service (failure mode 2). Adding a third mechanical list-compare (verifier) and a fourth awareness paragraph (worker profile) is redundant until telemetry proves the first two layers miss something.

**Deferred deliverables** (implement when prerequisite met):

#### 5.1 — Verifier prompt extension
**File edited**: the council-verifier agent profile, machine-local home copilot agents dir
**Change**: append `## DOCTRINE_READ Completeness` section.

```markdown
## DOCTRINE_READ Completeness

**Severity**: S2 (mechanical list-compare; downstream reviewer catches substantive compliance).
**Graduating incident**: TICKET-worker-skills-design-v2-0712.
**Ramp**: announce-first → `.claude/guardrail-config.json` key `verifier_doctrine_read_mode: "announce"`. Promote to VIOLATION after ≥10 dispatches where false-positive rate is 0%.
**Announce-first behavior**: first-landing finding is REPORTED as DOCTRINE-READ-INCOMPLETE. Does NOT hard-fail the acceptance on first occurrence. Mechanical list-compare only.

If the ticket's DOCTRINE field lists file paths, the worker's DOCTRINE_READ MUST list
every one of them. A DOCTRINE path absent from DOCTRINE_READ = DOCTRINE-READ-INCOMPLETE finding.
Compare the two lists mechanically. No judgment needed.
```

#### 5.2 — Worker-Side Awareness (agent profile)
**File edited**: the council-worker agent profile, machine-local home copilot agents dir

**Precheck requirement**: before appending, execution MUST:
```bash
grep -n '^## ' "$HOME_COPILOT_AGENTS"/council-worker.agent.md | tail -5
```
Verify: (a) file exists, (b) has `## Lessons` or equivalent section, (c) no closing markers/special format after last `##` that would break from appending. If unexpected structure → flag in execution ASK, do NOT append blindly.

**New section**:
```markdown
## Skill Methodology Awareness

Some tickets cite `.claude/skills/*/SKILL.md` files in DOCTRINE. These are METHODOLOGY
files — they describe HOW to do a class of work (e.g., root cause analysis, test coverage
design, regression guarding). When duty #1 requires you to read them:

1. Read the SKILL.md FULLY — not just the title. The methodology steps are your playbook.
2. Follow the methodology in your work. The reviewer checks for evidence that you did.
3. List every SKILL.md you read in DOCTRINE_READ — missing = finding.
4. If the methodology requires specific evidence (e.g., /rca requires artifact reads
   before fix attempts), your report MUST SHOW that evidence explicitly.

You do NOT need the Skill tool. The methodology is in the file. Read it, follow it, prove it.
```

---

## Acceptance criteria

- [ ] Registry classifies ALL 33 INDEX skills exactly once (11 TRANSFERABLE incl. `/relevant` + 22 CLAUDE-ONLY).
- [ ] Name-set parity check passes: sorted skill names from INDEX == sorted skill names from registry (MISSING=none, EXTRA=none, DUP=none).
- [ ] Evidence-signature row-count parity: `grep -c '^| /' skill-evidence-signatures.md` == 11 (TRANSFERABLE count).
- [ ] `scripts/ticket-skill-scan.mjs` reads INDEX directly, true match types, no cap, TRANSFERABLE-only output.
- [ ] Scanner work-type heuristic: `build` + code-mutation goal → `/regression-guard` present; `build` + non-mutation goal (e.g. "deploy") → zero applicable. No contradiction.
- [ ] worker-ext.md recipe cites `ticket-skill-scan.mjs` (NOT `run-relevant-scan.mjs`).
- [ ] Wrapper wire UW-5 NOT added — deferral in guardrail-config with earning-rent prerequisite.
- [ ] Evidence-signatures at `.claude/state/ua-worker/skill-evidence-signatures.md` (repo-readable).
- [ ] Reviewer section declares: Sev S2, graduating incident, ramp to bounce, announce-first, DOCTRINE_READ + evidence-signature checks, DIGEST line format.
- [ ] Verifier section + worker profile section: DEFERRED to Phase 5 with named prerequisite (≥10 reviewed dispatches showing a miss).
- [ ] guardrail-config has `reviewer_skill_compliance_mode`, `skill_route_mode` keys. `verifier_doctrine_read_mode` deferred to Phase 5.
- [ ] E2E proof: ticket with the rca SKILL.md (`.claude/skills/rca/SKILL.md`) in DOCTRINE → reviewer DIGEST shows `SKILL-COMPLIANCE: 1/1`.
- [ ] Zero clobber: diffs show ADDITIVE only — no UPLINK-landed text modified.
- [ ] git status post-exec = only this plan's edits + result files.

## Non-goals / slop-guard

1. **No new subsystem**: no hook, no daemon, no wrapper mode. Extends existing surfaces + one new script.
2. **No Skill tool emulation**: workers read files. No dynamic loading mechanism.
3. **No skill edits mentioning workers**: tracked SKILL.md files NEVER mention the worker system (secrecy, `worker-ext.md:110`).
4. **No `/execute` in workers**: orchestration stays Claude-only. Workers follow methodology, not ceremony.
5. **No interactive questioning**: workers remain single-turn; skill questions go through `## ASK` uplink.
6. **No auto-bounce day 1**: all checks land announce-first (LR-069 §3.3).
7. **No `run-relevant-scan.mjs` modification**: different contract (advisory vs routing); separate scanner.
8. **No wrapper wire day 1**: earning-rent test not passed; deferred with documented prerequisite.
9. **No secrecy leak**: all worker-awareness artifacts in git-excluded paths or machine-local profiles.

## What becomes stale (LR-050 — fixed IN-scope)

- worker-ext.md:110 says "skills stay Claude-run ceremony" with no scan recipe → extended Phase 3.
- Agent profiles have no skill-compliance checking → reviewer added Phase 4; verifier + worker deferred Phase 5.
- No TRANSFERABLE/CLAUDE-ONLY classification exists → created Phase 1.
- ticket-template.md has no scan guidance → added Phase 3.
- guardrail-config.json has no skill-routing knobs → added Phase 3.

## Verification commands

```bash
# Phase 1 — name-set parity:
idx_names=$(grep '^| /' .claude/skills/INDEX.md | sed 's/^| \(\/[^ |]*\).*/\1/' | sort)
reg_names=$(grep '| `/' .claude/state/ua-worker/skill-transfer-registry.md | sed 's/.*| `\(\/[^`]*\)`.*/\1/' | sort)
missing=$(comm -23 <(echo "$idx_names") <(echo "$reg_names"))
extra=$(comm -13 <(echo "$idx_names") <(echo "$reg_names"))
dup=$(echo "$reg_names" | sort | uniq -d)
[ -z "$missing" ] && [ -z "$extra" ] && [ -z "$dup" ] && echo "NAME-SET PARITY: PASS" || echo "NAME-SET PARITY: FAIL — MISSING: $missing | EXTRA: $extra | DUP: $dup"

# Phase 1 — evidence-signature row-count:
sig=$(grep -c '^| /' .claude/state/ua-worker/skill-evidence-signatures.md)
[ "$sig" -eq 11 ] && echo "EVIDENCE PARITY: PASS ($sig == 11)" || echo "EVIDENCE PARITY: FAIL ($sig != 11)"

# Phase 2 — scanner:
node scripts/ticket-skill-scan.mjs --goal "root cause" --work-type rca | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const d=JSON.parse(s);if(!d.applicable.some(x=>x.skill==='/rca'))throw new Error('FAIL: /rca missing');console.log('PASS: /rca present')})"
node scripts/ticket-skill-scan.mjs --goal "fix the login bug" --work-type build | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const d=JSON.parse(s);if(!d.applicable.some(x=>x.skill==='/regression-guard'))throw new Error('FAIL: /regression-guard missing');console.log('PASS: /regression-guard present')})"
node scripts/ticket-skill-scan.mjs --goal "deploy to production" --work-type build | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const d=JSON.parse(s);if(d.applicable.length!==0)throw new Error('FAIL: expected zero applicable');console.log('PASS: zero applicable')})"

# Phase 3:
grep 'ticket-skill-scan' .claude/skills/ultra-agents/worker-ext.md
grep 'skill_route_mode' .claude/guardrail-config.json

# Phase 4:
grep '## Skill Methodology Compliance' "$HOME_COPILOT_AGENTS"/council-reviewer.agent.md

# Phase 5 (deferred — verify only after prerequisite met):
# grep '## DOCTRINE_READ Completeness' "$HOME_COPILOT_AGENTS"/council-verifier.agent.md
# grep '## Skill Methodology Awareness' "$HOME_COPILOT_AGENTS"/council-worker.agent.md
```

---

## Finding-to-fix traceability

| Finding | Fix | Location |
|---|---|---|
| v1 S1-1: `/relevant` dropped (32/33) | Classified as TRANSFERABLE #11 | Deliverable 1 table row 11; name-set parity check |
| v1 S1-2: Scanner DIRECT/INFORM branch vs forced-INFORM + 4-cap | New ticket-mode scanner; recipe cites it | Deliverable 2.1 + 2.2 |
| v1 S1-3: UW-5 misplaced + undefined $LOG_DIR + UW-1 collision | Wire DEFERRED (earning-rent); future = UW-6 at :501+ with defined vars (anchors verified: $RESULT at :128, UW-4 at :497–500) | Deliverable 2.4 |
| v1 S1-4: Registry path unreadable by reviewer | Evidence-signatures in `.claude/state/` (repo-accessible) | Deliverable 3.2 |
| v1 S2-5: LR-069 missing on checks | Every check: Sev S2 + incident + ramp + announce-first; verifier NO hard-fail | Deliverable 3.1, Phase 5.1 (deferred) |
| v1 S2-6: Bloat / false-fire | Wrapper deferred; verifier + worker profile deferred to Phase 5 (bloat governor) | Deliverable 2.4; Phase 5 |
| v1 S2-7: Drift + companion enforcement | Name-set parity (not count); evidence-signature row-count = executable command | Deliverable 1 parity; Deliverable 3.2 |
| v1 S2-8: Profile precheck | grep before append; flag if unexpected | Phase 4 step 1; Phase 5.2 precheck |
| v2 GPT S2: count→name-set parity | Sorted name-SET diff replaces `grep -c` count comparison | Deliverable 1 parity; Phase 1 step 3; Acceptance; Verification |
| v2 both, finding 7: evidence row-count executable | `grep -c '^| /' == 11` command added | Deliverable 3.2; Phase 1 step 4; Acceptance; Verification |
| v2 GPT S2: build/regression-guard contradiction | Heuristic narrowed: build→/regression-guard ONLY when goal has code-mutation keywords | Deliverable 2.1; Phase 2 steps 3–4; Acceptance |
| v2 both, finding 6: trim per bloat-governor | Verifier + worker-profile → Phase 5 "Deferred — pending rent" | Phase 5; Acceptance |
| v2 GPT S3: stale UW-6 anchors | $RESULT at :128, UW-4 at :497–500 (live grep verified) | Deliverable 2.4; Reconciliation |

## Handoff (chat-only per framework discipline)

Execution outcome, deviations, and the E2E DIGEST proof are reported in chat at close — not written into this plan body. Phase 3 requires a live Rutvik GO before the protected `worker-ext.md` edit.

---

## Execution Summary

**Verification-close 2026-07-16**: all Phase 1-4 deliverables were found ALREADY LANDED on disk (built 2026-07-12/13 by the worker-skills-design / wsr-inc-a / wsr-inc-b council sessions); this session re-ran every acceptance check live and closed the plan. No new edits were needed — re-execution would have risked clobbering landed UPLINK-adjacent text.

### Per-phase evidence (all ran 2026-07-16)
- **Phase 1**: ran the plan's name-set parity check → output: `P1-PARITY: PASS` (registry ↔ INDEX name sets match, no missing/extra/dup); ran signature row-count → output: `P1-SIG: PASS (11)`. Artifacts: `.claude/state/ua-worker/skill-transfer-registry.md`, `.claude/state/ua-worker/skill-evidence-signatures.md`.
- **Phase 2**: `scripts/ticket-skill-scan.mjs` exists and passes all 3 heuristic checks — ran `--goal "root cause analysis" --work-type rca` → output contains `{"skill":"/rca","matchType":"DIRECT"}`; `--goal "fix the login bug" --work-type build` → `/regression-guard` present; `--goal "deploy to production" --work-type build` → zero applicable. (In live dispatcher use since 2026-07-16 — every ticket this session was scanner-populated.)
- **Phase 3**: ran `grep -n 'ticket-skill-scan' .claude/skills/ultra-agents/worker-ext.md` → output: line 112 (recipe present, cites the scanner NOT run-relevant-scan); `C:\Users\rutvi\.claude\delegation\ticket-template.md` line 37 carries the DOCTRINE guidance comment; `.claude/guardrail-config.json` lines 26-35 carry `skill_route_mode: "deferred"` (+ reason + earning-rent prerequisite = the 2.4 deferral artifact) and the full `reviewer_skill_compliance_*` ramp block (ramp_started 2026-07-13, announce-first per LR-069).
- **Phase 4**: ran the Phase-4 verify grep against the machine-local council-reviewer agent profile → output: line 39; section declares Sev S2, graduating incident TICKET-worker-skills-design-v2-0712, announce-first ramp, DIGEST line format.
- **Phase 5**: DEFERRED BY DESIGN (plan lines 339-343, LR-069 §3.4 bloat governor) — prerequisite (≥10 reviewed dispatches showing a scanner+reviewer miss) not met; verifier section and worker-profile section verified ABSENT (grep count 0 in both agent files) and `verifier_doctrine_read_mode` key verified ABSENT from guardrail-config — exactly the deferred state the plan mandates.

### E2E proof (acceptance item 12)
Reviewer DIGEST `SKILL-COMPLIANCE: 1/1 skills evidenced` in `C:\Users\rutvi\.claude\delegation\reports\wsr-inc-b-e2e-review.report.md` (line 7); the negative path also proven live — `wsr-inc-a-review.report.md` DIGEST shows a real `SKILL-COMPLIANCE: 0/1` SKILL-SKIP finding, so the check demonstrably fires in both directions.

### Deviations
None. Zero file edits this session (verification-close). The protected-file GO for Phase 3 (Rutvik blanket GO 2026-07-16) was never consumed — the edit pre-existed with its own 2026-07-13 authorization trail (ramp_started stamp).
