# PLAN: Anthropic-Aligned Claude Code Setup — Surface Debloat + Audit Hardening + Native Patterns

**Status**: DONE
**Executed**: 2026-04-27
**Priority**: P0-CYCLE-1
**Created**: 2026-04-27
**Parent**: (root — framework infra; supersedes `PLAN_CLAUDE_SETUP_AUDIT_REMEDIATION` + `PLAN_FRAMEWORK_AUDIT_EVIDENCE_EMISSION` as a unified successor)
**Depends on**: none
**Blocks**: future agent-authoring; new skill/hook/rule additions land on the merged surface
**Skills**: `/planning` (authoring), `/audit`, `/slop`, `/review`, `/research`, `/execute`, `/final-q`
**Identity**: OWNER
**Model**: claude-opus-4-7
**Thinking**: max
**Justification**: Cross-plan synthesis (Plan A surface debloat + Plan B audit primitive hardening + Anthropic-native patterns) requiring multi-rule judgment across ~30 skills, settings.json, hook surface, identity ceremony, AGENT_SHARED_RULES §2, learned-rules registry, and the 5-agent Copilot-eviction layer. RCA + architectural.
**PermissionMode**: plan
**BrowserTool**: none

---

## Context

User flagged the Claude Code setup as "very inefficient" and asked for a unified plan that ingests three sources:

| Source | What it gives us |
|---|---|
| Anthropic cupcake guide (`C:/Users/rutvi/.claude/plans/ur-only-goal-is-flickering-cupcake.md`) | Structural philosophy: CLAUDE.md <200 lines, hooks vs skills vs rules, subagents for context isolation, `paths:`-scoped rules, `disable-model-invocation`, /clear discipline, build-over-time triggers, "if you can't verify it, don't ship it" |
| `PLAN_CLAUDE_SETUP_AUDIT_REMEDIATION` (Plan A) | Surface debloat: 854→200 line CLAUDE.md, 8 ghost-hook references in 96 places, 6 missing skills, plaintext creds, broad permissions, `chain-orchestrator.sh` non-idempotent, Copilot evict, skill rationalization, memory consolidation |
| `PLAN_FRAMEWORK_AUDIT_EVIDENCE_EMISSION` (Plan B) | Audit primitive hardening: `/final-q` Step 4.5 evidence-emission, Step 6 verdict reclassification, `/execute` Phase 2.5 adjacent-sweep, `/identity` Step 6.1 SWITCH-BACK fast-path, §2 ownership broadening |

Goal: **adopt Anthropic's scaffolding for our particular use case**, without deleting the novel value-adds the user explicitly named (skills system, todo injection, identity discipline, learned-rules registry, plans system, 5-agent pipeline, hooks, memory layer). Plan A's debloat clears the table. Plan B's evidence-emission ensures the leaner surface still self-checks. Anthropic's native patterns lock in discipline going forward.

---

## Phase −1 — Pre-execution bookkeeping (~5 min, before SP1 spawns)

Mechanical actions on approval:

1. **Rename + relocate this plan** → `plans/pending/PLAN_CC_ANTHROPIC_ALIGNMENT.md` (or user-preferred clean name). The harness saved it to `C:/Users/rutvi/.claude/plans/...` — outside the repo, so it will not appear in `plans/INDEX.md` until moved. Frontmatter already has `**Priority**: P0-CYCLE-1` so it will land at the top of the P0 section once indexed.
2. **Supersede Plan A + Plan B** — both source plans are fully absorbed here. For each:
   - `plans/pending/PLAN_CLAUDE_SETUP_AUDIT_REMEDIATION.md` → `plans/done/`. Set `**Status**: SUPERSEDED`, add `**Executed**: 2026-04-27`, append one-line Execution Summary: *"Substance absorbed into PLAN_CC_ANTHROPIC_ALIGNMENT.md. See that plan for execution. No unique work remains here."* Per Plan A's own P0.4 protocol.
   - Same for `plans/pending/PLAN_FRAMEWORK_AUDIT_EVIDENCE_EMISSION.md`.
3. **Cupcake guide** (`C:/Users/rutvi/.claude/plans/ur-only-goal-is-flickering-cupcake.md`) — reference material, NOT a repo plan. No status change. Stays put as the source-of-truth Anthropic guide we built against.
4. **Reindex**: `npm run plans:reindex` (per LR-035 — `plans/INDEX.md` is auto-generated, never hand-edit). Verify this plan appears at the top of the P0 section.
5. **Verify supersede** — grep `plans/pending/` for any subplan with `**Parent**:` pointing at Plan A or Plan B. Should be 0 hits (both were root-level). If any exist, repoint to this super plan first.

---

## Subplan structure (execution shape)

One-shot execution is NOT viable (V7 cold-read requires fresh session by design; ~150-200K token load before edits begin; /clear discipline (D22) we are SHIPPING explicitly forbids unrelated tasks in one session). Instead: 6 subplans run via `/chain` in next session — one user invocation, sequential headless runs, each gets clean context per LR-042, `/final-q` gates between.

**Sequencing fix 2026-04-27**: SP1 shipped YELLOW with a "HANDOFF FOR NEW SESSION" containing 4-7 lazy-deferred items (LR-039 / LR-040 violation). RCA traced to bad sequencing in this plan: Plan B's audit-boundary fixes (Phase 2.5 + Step 4.5 + Step 6) were bundled into rank-4 SP4, so they ran AFTER SP1 — without the guardrails Plan B was authored to provide. Fix: split SP4. Defensive scaffolding (Fixes 1, 2a, 2b) extracted to new **SP0** that runs FIRST. SP4 retains only Fixes 3 + 4 (identity Step 6.1 fast-path + §2 broadening) which legitimately depend on smaller `/identity` post-SP3. Net effect: 7 subplans, but SP0 is short (~3 hr) and inoculates every later subplan against the SP-DQU-03 lazy-defer pattern.

| SP | Phases covered | Scope | Skills | Identity | Est. |
|---|---|---|---|---|---|
| **SP0** (NEW 2026-04-27) | 3 (P3.6, P3.7) | Audit boundary hardening — Plan B Fixes 1, 2a, 2b: `/execute` Phase 2.5 (Adjacent-Sweep) + `/final-q` Step 4.5 (evidence-emission) + Step 6 (recipientless reclassification) + `parse-verdict.mjs` regex update + V8/V9/V8.5 replays *(SHIPPED 2026-04-27 GREEN)* | `/execute`, `/audit`, `/final-q` | OWNER | ~3 hr |
| SP1 | 0 + 1 | Copilot absorb + evict; ghost-hook scrub; INDEX align; settings.local.json sanitize *(SHIPPED 2026-04-27 YELLOW — see SP0 sequencing fix above)* | `/execute`, `/research`, `/audit`, `/final-q` | OWNER | ~4 hr |
| SP2 | 2 | CLAUDE.md 854→200; LR-* extract to `.claude/rules/<topic>.md` (path-scoped); SETUP.md split; LEARNED_RULES.md companion; Build-over-time + /clear blocks | `/execute`, `/audit`, `/final-q` | OWNER | ~half day |
| **SP02B** (NEW 2026-04-27 post-SP0) | new (TodoWrite enforcement) | TodoWrite context-injection enforcement — PostToolUse+PreToolUse hook pair on TodoWrite/Edit; `/execute` Phase 0.0 marker + Phase 0.5 ceremony-dedup; `/relevant` 3-grep injection; new `pipeline.md` §"TodoWrite Tagging Contract"; synthetic fixture tests V12/V13. Closes the closure-ceremony-not-in-todos gap that bit SP1 + SP0. | `/execute`, `/audit`, `/regression-guard`, `/final-q` | OWNER | ~3 hr |
| SP3 | 3 (P3.1-P3.5, P3.10) | Skill rationalization — merge `/audit+/slop+/upgrade`, descriptions ≤1,536, `disable-model-invocation`, slop-each-skill, verification-artifact step | `/execute`, `/slop`, `/audit`, `/final-q` | OWNER | ~half day |
| SP4 (revised) | 3 (P3.8, P3.9) | Identity ceremony fast-path + §2 ownership broadening — Plan B Fixes 3 + 4 only: `/identity` Step 6.1 (3 modes + work-gated self-audit) + Step 6.5 amend + §2 HEALER broadening + `identity-ownership.mjs` mirror + V10 ceremony budget | `/execute`, `/audit`, `/final-q` | OWNER | ~2 hr |
| SP5 | 4 + 5 | Memory dedup; chain-orchestrator idempotency; permission narrowing; settings precedence header; parse-verdict.mjs migration | `/execute`, `/audit`, `/final-q` | OWNER | ~half day |
| SP6 | 7 | V0–V11 verification (REQUIRES fresh session for V7 cold-read; ceremony budget V10; trigger-awareness V11; V8/V9 already passed in SP0) | `/audit`, `/final-q` | OWNER | ~3 hr |

Wall-clock: ~2-3 days unattended via `/chain`. User invokes once, watches headless execution. Each SP authored as `plans/pending/SUBPLAN_CCE_0N_<NAME>.md` with parent pointing at this super plan, frontmatter declaring Model + Thinking + PermissionMode per LR-041.

**Alternative compact (4 SPs)**: merge SP1+SP2, merge SP3+SP4. Fewer handoffs, but each SP gets ~150K context burn — higher error risk. Recommended only if user wants tighter wall-clock.

---

## 🛑 MANDATORY PHASE 0 — RE-AUDIT BEFORE EXECUTION

This plan was authored 2026-04-27 against a fast-moving setup. Before touching any file:

1. Re-fetch https://docs.claude.com/en/docs/claude-code/ — Anthropic recommendations may have shifted (CLAUDE.md sizing, skill-description caps, `disable-model-invocation`, path-scoped `.claude/rules/*.md` syntax).
2. Re-run the 3 Explore agents from Plan A (inventory / docs / runtime quality) — counts and overlaps may have shifted.
3. Read the unread surfaces Plan B's caveat names: ~25 unread skills, all `.claude/hooks/*`, `parse-verdict.mjs`, `plans-reindex.mjs`, `check-subplan-identity.mjs`, all `.github/agents/*.agent.md`, `.claude/context/{navigation,patterns}.md`. Confirm no surface collisions with the proposed amendments.
4. Grep for the 8 deleted hooks (Plan A P1.3 list), `LR-008` / `LR-012` / `LR-036` ghosts, and the 6 INDEX-missing skills — confirm gaps before remediation.
5. Slop check: before authoring any new file (`.claude/rules/*.md`, `docs/SETUP.md`, `docs/read_only_docs/LEARNED_RULES.md`), grep first.
6. If any audit step shows a gap is closed, mark sub-task DONE in Execution Summary instead of re-doing.

---

## Headline philosophy (post-merge)

1. **Trim aggressively, verify ruthlessly.** Every line removed must pass a cold-read test (paste trimmed CLAUDE.md to fresh Claude, ask what to do, compare behavior). Anthropic line 838 + Plan A V7.
2. **Verdicts are free; evidence is what counts.** Every audit primitive (cross-check, self-audit, walkthrough log) must emit `ran '<command>' → output: '<snippet>'` instead of self-attestation. Plan B unifying root cause + Anthropic line 787.
3. **Keep what is uniquely ours; relocate what is bloat.** Skills, identity, plans, 5-agent pipeline, todo injection stay. LR-001..LR-045 migrate to `.claude/rules/*.md` (path-scoped) per Anthropic line 730. Memory layer dedups against rules.
4. **One decisive structural cut, not 12 incremental ones.** Phases run sequentially A → B → C → D; sequencing matters because Plan B's `/identity` restructure operates on Plan A's trimmed CLAUDE.md.
5. **Add Anthropic-native habits we lack today.** /clear discipline, Build-over-time triggers, verification-first per skill output.

---

## Decisions made (locked unless user pushes back at ExitPlanMode)

| # | Decision | Source | Rationale |
|---|---|---|---|
| D1 | Sequential phases A → B → C → D, NOT parallel | merger | Plan B's `/identity` restructure benefits from Plan A's trimmed surface; Plan A's V-tests benefit from Plan B's evidence-emission |
| D2 | LR-001..LR-045 migrate from CLAUDE.md → `.claude/rules/<topic>.md` (path-scoped, `paths:` frontmatter per Anthropic) | Anthropic line 730 + Plan A P2.1 | Reduces context tax to pages that don't touch matching files |
| D3 | Cross-cutting LRs (identity, planning, execution discipline) live in `docs/read_only_docs/LEARNED_RULES.md`, `@`-referenced from CLAUDE.md | Plan A P2.1 | Hybrid: path-scoped where possible, central where cross-cutting |
| D4 | Merge `/audit + /slop + /upgrade` → ONE skill `/audit --mode={review\|slop\|upgrade}`; keep `/slop` and `/upgrade` as alias commands | Plan A P3.1 | Reduces critique-class overlap; preserves muscle memory via aliases |
| D5 | Trim every SKILL.md `description` to ≤1,536 chars; front-load trigger keywords | Plan A P3.2 + Anthropic | Prevents truncation that silently breaks auto-routing |
| D6 | `disable-model-invocation: true` on side-effecting skills (`/deploy`, `/chain`, `/end-day`, `/end-week`, `/encore-questions`, `/report`) | Plan A P3.3 + Anthropic | User-only invocation prevents accidental activation |
| D7 | `/final-q` Step 4.5 mandates evidence-emission: `Cross-check: [claim] → ran '<exact command>' → output: '<snippet OR "0 hits">' → [match/mismatch] → [tag]`; missing `ran`+`output` → row forced to `screwed`, verdict floor RED | Plan B Fix 2a | Closes ALL-030/AUD-001 rubber-stamp pattern |
| D8 | `/final-q` Step 6 auto-reclassifies recipientless `skipped` rows → `ignored`; verdict floor YELLOW; ≥2 reclassifications → RED | Plan B Fix 2b | Closes A1 missing-recipient hatch; pairs with D7 |
| D9 | `/execute` inserts Phase 2.5 (Adjacent-Sweep) between Phase 2 (work) and Phase 3 (post-audit) — every adjacent item gets DO-NOW / SPAWN / APPEND, no bare "out of scope" | Plan B Fix 1 | In-session scope expansion while context is hot |
| D10 | `/identity` Step 6.1 introduces 3 modes (INITIAL_LOAD / SWITCH-NEW / SWITCH-BACK) + work-gated self-audit | Plan B Fix 3 | ~45-50% per-session token reduction on multi-switch workunits |
| D11 | §2 ownership broadens HEALER (`field-inventories/<module>-*.md` READ→UPDATE; `reports/bugs/BUG-*.json` new row Heal=CREATE); mirror in `scripts/identity-ownership.mjs` per LR-043 §A | Plan B Fix 4 | Eliminates 2 of 3 forced switches in HEALER-led work |
| D12 | `chain-orchestrator.sh` becomes idempotent (per-spawn lock + first-call guard); soft-rollout: log "would have skipped" first | Plan A P5.1 | Anthropic line 863: hooks must be deterministic + retry-safe |
| D13 | Permissions narrowed: `Bash(find:*)`, `Bash(grep:*)`, `Bash(env)`, `Bash(npm install:*)` → specific allowlists OR documented why broad | Plan A P5.2 + Anthropic | Least-privilege |
| D14 | Plaintext credentials at `settings.local.json:147` removed; settings.local.json scrubbed (467 → ~150 lines) | Plan A P1.5 | Security + maintenance |
| D15 | 6 missing skills added to `.claude/skills/INDEX.md`; `CLAUDE.md` auto-routing table replaced with `@`-pointer to INDEX | Plan A P1.1, P1.2, P2.3 | Single source of truth |
| D16 | 8 deleted-hook references scrubbed across 96 occurrences | Plan A P1.3 | Cleanup after LR-042 hook deletion |
| D17 | LR-008 / LR-012 / LR-036 ghost citations resolved (reinstate body OR remove cite) | Plan A P1.4 | Trust restoration in rule numbering |
| D18 | 6 model-agnostic Claude sub-agents at `.claude/agents/{REQUIREMENTS,PLANNER,GENERATOR,HEALER,AUDIT,MAINTAINER}.md` absorb Copilot's 6 pipeline roles BEFORE Copilot deletion; agnostic frontmatter (no Claude-specific keys) | Plan A P0.1-P0.4 | Substance preservation; Codex/GPT can adopt unchanged |
| D19 | Copilot artifacts deleted only after absorption + reference repointing | Plan A P0.3 | No work-loss risk |
| D20 | Memory layer (~70 files) audited: stale (>30d idle, not preference) → archive; LR-* duplicates → deduped after D2/D3 (target ~40-50 files) | Plan A P4 | Anthropic line 1373 sparse-memory + dedup |
| D21 | **NEW (Anthropic-native)**: Build-over-time trigger block added to root CLAUDE.md (~10 lines) — "Claude gets X wrong 2x → CLAUDE.md; same prompt 3x → skill; must always happen → hook" | Anthropic lines 2002-2011 | Net new pattern |
| D22 | **NEW (Anthropic-native)**: `/clear` discipline reminder block in CLAUDE.md (~5 lines) — "use /clear between unrelated tasks; after 2 failed corrections, /clear and rewrite" | Anthropic lines 965-970 | Net new pattern |
| D23 | **NEW (Anthropic-native)**: Verification-first as a per-skill output requirement — every skill that produces work output must include verification artifact (test command, screenshot, expected output) per Anthropic line 787 | Anthropic | Highest-leverage tactic, currently uneven across skills |
| D24 | Hook-level enforcement of evidence-emission DEFERRED — skill mandate first; hook only if pattern persists 2 weeks | Plan B + LR-043 precedent | Avoid hook-bloat repeat |
| D25 | `/init` benchmark deferred (Plan A P6) — only run if surface still feels heavy after Phase 5 | Plan A P6 | Risk of /init clobbering our skills system |
| D26 | Cold-read verification gate runs after every phase — paste trimmed CLAUDE.md to fresh Claude, ask "what should you do?", compare to today's behavior. Drift = the trim removed something load-bearing | Plan A V7 + Anthropic line 838 | Catches load-bearing trims |

---

## Phased remediation

### Phase 0 — Absorb + Evict Copilot (Plan A P0)
Same as Plan A P0.1-P0.4. Substance to model-agnostic sub-agents (D18) → reference repoint → delete. ~1 day.

### Phase 1 — Stop the bleeding (Plan A P1)
Indices, ghost-hook scrub, ghost-LR resolve, settings.local.json sanitize. ~1 hour.
- P1.1: INDEX.md adds 6 missing skills
- P1.2: CLAUDE.md auto-routing table aligned (then replaced by `@`-pointer in P2.3)
- P1.3: 8 ghost-hook references scrubbed (96 occurrences across `.claude/settings.local.json`, hook docstrings, SKILL.md files)
- P1.4: LR-008/012/036 resolved
- P1.5: settings.local.json — strip creds, promote stable entries to settings.json, delete one-shot debris

### Phase 2 — Right-size CLAUDE.md + Anthropic adoption
Goal: root `CLAUDE.md` ≤200 lines per Anthropic guidance. ~half day.
- P2.1: extract LR-001..LR-045 (~400 lines) → path-scoped `.claude/rules/<topic>.md` (Angular rules → `angular.md`, spec-fixing → `specs.md`, hooks/identity → `hooks-identity.md`, browser-tool → `browser-tool.md`, planning/execution → `pipeline.md`, baseline-truth → `baseline.md`); cross-cutting → `docs/read_only_docs/LEARNED_RULES.md`
- P2.2: replace inline Skill Dependency Graph with `@.claude/skills/INDEX.md`
- P2.3: replace Skill Auto-Routing table with `@`-pointer + per-skill `description` triggers
- P2.4: First-Time Setup → `docs/SETUP.md`
- P2.5: final root CLAUDE.md shape — navigation pointer + supreme rules + `@`-references + auto-routing pointer + active-client switch
- **P2.6 (Anthropic-native)**: every `.claude/rules/<topic>.md` adopts Anthropic spec frontmatter:
  ```yaml
  ---
  paths: ["clients/**/specs_planning/**/*.md", "tests/**/*.spec.ts"]
  description: "Spec-fixing discipline for active client"
  ---
  ```
- **P2.7 (D21)**: append Build-over-time trigger block to CLAUDE.md (~10 lines)
- **P2.8 (D22)**: append /clear discipline block to CLAUDE.md (~5 lines)

### Phase 3 — Skill rationalization + Plan B audit hardening
Goal: remove duplication, fit docs caps, harden audit primitives. ~half day.
- P3.1 (D4): merge `/audit + /slop + /upgrade` → `/audit --mode=...`; keep `/slop` and `/upgrade` as alias commands routing to `/audit <mode>`
- P3.2 (D5): trim every SKILL.md description ≤1,536 chars
- P3.3 (D6): `disable-model-invocation: true` on side-effecting skills
- P3.4: reconcile auto-call claims — verify each SKILL.md actually invokes its stated dependencies, or fix the graph in CLAUDE.md
- P3.5: run `/slop` on each remaining skill; trim over-engineered Steps
- **P3.6 (Plan B Fix 1, D9)**: insert `/execute` Phase 2.5 (Adjacent-Sweep) between current Phase 2 end (line ~150) and Phase 3 start (~152)
- **P3.7 (Plan B Fix 2, D7+D8)**: amend `/final-q` Step 4.5 evidence-emission format + Step 6 verdict reclassification logic
- **P3.8 (Plan B Fix 3, D10)**: insert `/identity` Step 6.1 (3 modes + work-gated self-audit); amend Step 6.5 to defer to 6.1 mode classification
- **P3.9 (Plan B Fix 4, D11)**: broaden §2 ownership (HEALER); mirror in `scripts/identity-ownership.mjs`
- **P3.10 (D23)**: every skill with a "produce work output" step gets a "verification artifact" sub-step (test command, screenshot path, or expected output template)

### Phase 4 — Memory consolidation (Plan A P4)
~2 hours.
- P4.1: pick canonical home per type (preferences → auto-memory; client facts → `clients/encore/CLAUDE.md`; framework rules → `.claude/rules/` after P2.1)
- P4.2: audit 70 files — archive >30d-idle non-preference; delete LR-* duplicates after P2.1
- P4.3: keep `MEMORY.md` index ≤200 lines / 25KB

### Phase 5 — Hooks & settings hardening (Plan A P5)
~2 hours.
- P5.1 (D12): `chain-orchestrator.sh` idempotent; per-spawn lock; first-call guard
- P5.2 (D13): narrow overbroad permission patterns
- P5.3: document fail-mode for each hook in its docstring (`identity-switch-gate.sh`, `browsertool-gate.sh` already correct; `chain-orchestrator.sh` needs explicit doc)
- P5.4: settings.local.json header documents project + local merge precedence
- P5.5: migrate `chain-orchestrator.sh` budget logic to `parse-verdict.mjs` companion (Node) — avoid shell-quoting fragility; reuse existing `parse-verdict.mjs`

### Phase 6 — Optional /init benchmark (deferred per D25)

### Phase 7 — Cross-cutting verification

| ID | Test | Pass criterion |
|---|---|---|
| V0 | Copilot grep clean | 0 hits in active config/code/docs (excluding `agent-activity-log.md`, `audits/archive/*`) |
| V1 | Token budget | Cold-start context <30K tokens (was ~239K) |
| V2 | Skill routing | All ~25 skill triggers route correctly on test prompts |
| V3 | Hook health | Each hook event clean; `chain-orchestrator.sh` increments exactly once per Stop event under retry |
| V4 | Settings parse | No warnings on startup |
| V5 | Pipeline regression | One small pending subplan via `/execute` — no stale citations, no hook errors, parseable `/final-q` verdict |
| V6 | Audit re-run | 3 Explore agents re-run; HIGH severity findings = 0; MED reduced ≥50% |
| V7 (D26) | Cold-read test | Paste trimmed CLAUDE.md to fresh Claude, ask "what should you do?"; compare to today's behavior. Drift = load-bearing trim |
| V8 (Plan B replay) | SP-DQU-03 first /final-q against new Step 6 | Items 15/16/17 reclassify `ignored` → 3 reclassifications → RED → would have HALTed structurally |
| V9 (Plan B replay) | SP-DQU-03 second /final-q against new Step 4.5 | Risk 1 cross-check missing `ran`+`output` → row `screwed` → RED → would have HALTed |
| V10 (D10) | Identity ceremony budget | Multi-switch session token cost drops ≥40% vs pre-fix |
| V11 (D21) | Build-over-time awareness | Fresh Claude asked "what if I keep correcting indent?" answers "add to CLAUDE.md or hook" |

---

## Critical files to modify

| Path | Phase | Action |
|---|---|---|
| `CLAUDE.md` (root) | 2 | 854 → ≤200 lines + `@`-references + Build-over-time + /clear blocks |
| `.claude/skills/INDEX.md` | 1.1 | Add 6 missing skills (encore-questions, end-day, end-week, next-this-week, standup, ultrathink) |
| `.claude/settings.local.json` | 1.5, 5.2 | Scrub creds, narrow perms, dedupe (467 → ~150) |
| `.claude/hooks/chain-orchestrator.sh` | 1.3, 5.1, 5.3 | Docstring, idempotency, fail-mode |
| `.claude/hooks/identity-switch-gate.sh` | 1.3 | Docstring update |
| `.claude/skills/{audit,slop,upgrade}/SKILL.md` | 3.1 | Merge to `/audit --mode=...`; keep `/slop`+`/upgrade` aliases |
| `.claude/skills/*/SKILL.md` (all 30) | 3.2, 3.3, 3.10 | Description ≤1536, `disable-model-invocation` where side-effecting, verification-artifact step where applicable |
| `.claude/skills/execute/SKILL.md` | 3.6 | Insert Phase 2.5 (Adjacent-Sweep) (~+30 lines) |
| `.claude/skills/final-q/SKILL.md` | 3.7 | Step 4.5 evidence-emission (+8); Step 6 verdict reclassification (+6) |
| `.claude/skills/identity/SKILL.md` | 3.8 | Insert Step 6.1 (3 modes + work-gated self-audit) (+25); amend Step 6.5 (+3) |
| `docs/read_only_docs/AGENT_SHARED_RULES.md` | 2.1, 3.9 | Receive cross-cutting rules; broaden §2 (HEALER `field-inventories/*` + `reports/bugs/*`) (+2) |
| `scripts/identity-ownership.mjs` | 3.9 | Mirror §2 broadening (+5) per LR-043 §A parity |
| `clients/encore/CLAUDE.md` | 4.1 | Keep client-specific facts here |
| **New** `.claude/rules/<topic>.md` (4-6 files) | 2.1, 2.6 | Path-scoped framework rules with Anthropic `paths:` frontmatter |
| **New** `docs/SETUP.md` | 2.4 | First-time setup steps (extracted from CLAUDE.md) |
| **New** `docs/read_only_docs/LEARNED_RULES.md` | 2.1 | Cross-cutting LRs companion to AGENT_SHARED_RULES |
| **New** `.claude/agents/{REQUIREMENTS,PLANNER,GENERATOR,HEALER,AUDIT,MAINTAINER}.md` | 0.1 | Model-agnostic sub-agent files (no Claude-specific frontmatter keys) |
| `.github/copilot-instructions.md`, `.github/agents/playwright-*.agent.md` (6), `.github/workflows/copilot-setup-steps.yml`, `scripts/sync-copilot-session.ts`, `package.json:48` | 0.3 | DELETE after absorption |
| `.vscode/settings.json:8,13-15` + 3 grep lines in settings.local.json | 0.2 | Drop Copilot extension + MCP sampling refs |
| `docs/README.md`, `docs/read_only_docs/AGENT_SHARED_RULES.md`, `docs/read_only_docs/COMMENTING_STANDARDS.md` | 0.2 | Repoint Copilot mentions → "Claude / frontier agent" |

**Existing utilities to reuse, not duplicate**:
- `.claude/context/navigation.md` — `@`-reference, don't restate
- `scripts/identity-ownership.mjs` — already byte-mirrors §2 (LR-043); extend, don't reimplement
- `parse-verdict.mjs` — already reads chain-session JSONL; extend regex if Step 4.5 format changes
- `npm run plans:reindex` — auto-generates `plans/INDEX.md`; LR-035 forbids hand-edit

---

## Out of scope (intentionally untouched)

- Plans system (`plans/pending/`, `plans/done/`, `npm run plans:reindex`) — orthogonal to Claude Code config
- Per-client product knowledge (Encore-specific TCs, requirements, baseline)
- Auto-memory mechanism itself — keep; only consolidate content (Phase 4)
- TodoWrite injection patterns — keep
- Bug filing protocol (LR-034) — keep
- Backfilling SP-DQU-03's 3 skipped items — forward-looking plan; can fix items 15/16/17 inline if desired
- New LR rules — explicitly rejected per Plan B + LR-043 remediation precedent (rule-inflation does not change behavior)
- Hook-level enforcement of evidence-emission — deferred per D24

---

## Risk register

| Risk | Mitigation |
|---|---|
| Trimming LR-* removes load-bearing behavior | P2.1 migrates not deletes; V5 + V7 catch breakage; do P2 in worktree first |
| Skill merge `/audit + /slop + /upgrade` breaks muscle memory | Keep `/slop` + `/upgrade` as alias commands routing to `/audit <mode>` |
| Removing routing table from CLAUDE.md harms discoverability | `@`-pointer to `.claude/skills/INDEX.md`; INDEX gets "When to use" column |
| Path-scoped rules don't load when expected | V2 + deliberate touch-this-file-then-check-rule-applied sweep |
| Anthropic `paths:` frontmatter syntax mismatch | Adopt Anthropic spec exactly per cupcake line 730; verify with `/context` after touch |
| `chain-orchestrator.sh` lock breaks existing flows | Soft-rollout: log "would have skipped" first, observe one chain cycle, then enforce |
| Copilot deletion before absorption strands `{AGENT}-*` rule | P0.1 absorbs first; P0.3 deletes only after V0 grep clean |
| `SUBPLAN_REPO_02/13` + `PLAN_AUDIT_COPILOT` carry unique work | P0.4 reviews each before this plan starts |
| New sub-agent files become Claude-only by accident | Frontmatter avoids Claude-specific keys; describe role + tools + scope in plain prose |
| Evidence-emission format breaks `parse-verdict.mjs` regex | V3 + V8/V9 confirm regex matches new format; update regex or v2 detection backstop |
| `/identity` SWITCH-BACK fast-path skips legitimate re-internalization | Step 6.1 MODE A still triggers full ceremony on first activation; SWITCH-BACK only skips re-emission |
| §2 broadening grants HEALER unintended write paths | Mirror in `scripts/identity-ownership.mjs` parity test (LR-043 §A); review with `/audit` post-edit |
| Cold-read test (V7) is subjective | Concrete pass criterion: 3 of 5 random subplans, asked "what should you do?", produce same skill chain as today |
| /clear discipline reminder forgotten under pressure | Anthropic-recommended Stop hook can re-inject reminder if needed (defer per D24) |
| Verification-artifact requirement (D23) bloats short skills | Apply only to skills that produce work output; leaf-utility skills exempt |

---

## Final-state vision (post-execution)

- Root `CLAUDE.md`: ≤200 lines, mostly `@`-references + Build-over-time + /clear blocks
- `.claude/rules/`: 4-6 path-scoped rule files with `paths:` frontmatter, each ≤150 lines
- ~30 skills → ~25 (merged critique cluster), each `description` ≤1,536 chars, side-effecting ones gated by `disable-model-invocation: true`, work-output skills include verification-artifact step
- `settings.json` + `settings.local.json` together ≤200 lines, no plaintext creds, no orphan refs, narrow permissions
- 4 active hooks, all idempotent, all documenting fail-mode
- Memory layer: ~40-50 files (was 70), no overlap with `LR-*`
- 6 model-agnostic sub-agents (`.claude/agents/{ROLE}.md`); zero Copilot footprint in active config
- `/final-q` Step 4.5 emits evidence (`ran '<cmd>' → output: '<snippet>'`) — rubber-stamp pattern extinct
- `/identity` ceremony cost: ~10k per session (was ~50k); SWITCH-BACK is one-line
- New contributor reading `CLAUDE.md` predicts agent routing without reading skill files
- Cold-start context: <30K tokens (was ~239K) — ~7-8× reduction with no behavior loss
- SP-DQU-03 replay: structurally HALTs at first `/final-q` (recipientless skip → ignored → RED) and at second `/final-q` (rubber-stamped cross-check → screwed → RED)

---

## Acceptance criterion (one sentence)

A new contributor with zero project history opens a fresh terminal in this repo, types `claude`, runs `/execute SUBPLAN_X.md` for any reasonable X, and the run completes with: (a) correct identity loaded automatically, (b) all skills routable from descriptions alone, (c) `/final-q` emits evidence-bearing verdict, (d) any skipped item reclassified to ignored or named to a real recipient grep-verified, (e) cold-start context <30K tokens, (f) zero stale-citation or ghost-hook errors in transcript.

---

## Execution Summary

**Executed**: 2026-04-27 by OWNER (interactive close after the chain of 7 child subplans + this terminal verifier).

**Plan absorbed**: `PLAN_CLAUDE_SETUP_AUDIT_REMEDIATION` (Plan A) + `PLAN_FRAMEWORK_AUDIT_EVIDENCE_EMISSION` (Plan B) as superseded predecessors. Both already in `plans/done/` with `**Status**: SUPERSEDED` per Phase −1 protocol.

**Subplan chain (7 children + this parent close)**:

| SP | Status | Verdict | Key delivery |
|---|---|---|---|
| [SP-CCE-00](../done/SUBPLAN_CCE_00_AUDIT_BOUNDARY_HARDENING.md) | DONE | GREEN | Audit boundary primitives — `/execute` Phase 2.5 Adjacent-Sweep + `/final-q` Step 4.5 evidence-emission + Step 6 verdict reclassification + parse-verdict.mjs regex update + V8/V9/V8.5 replays. |
| [SP-CCE-01](../done/SUBPLAN_CCE_01_FOUNDATION_CLEANUP.md) | DONE | YELLOW (per SP0 sequencing fix; see plan's "Sequencing fix" note line 51) | Copilot absorb + evict; ghost-hook scrub; INDEX align; settings.local.json sanitize. |
| [SP-CCE-02](../done/SUBPLAN_CCE_02_CLAUDEMD_RIGHTSIZE.md) | DONE | GREEN | CLAUDE.md 854→124 lines; LR-* extracted to path-scoped `.claude/rules/<topic>.md`; SETUP.md split; LEARNED_RULES.md companion; Build-over-time + /clear blocks. |
| [SP-CCE-02B](../done/SUBPLAN_CCE_02B_TODO_INJECTION_ENFORCEMENT.md) | DONE | GREEN | TodoWrite tagging contract + PostToolUse capture + PreToolUse validate hooks; `/execute` Phase 0.0 marker + Phase 0.5 ceremony-dedup; new `pipeline.md` § "TodoWrite Tagging Contract"; synthetic fixture tests V12/V13. |
| [SP-CCE-03](../done/SUBPLAN_CCE_03_SKILL_RATIONALIZATION.md) | DONE | GREEN | Merged `/audit + /slop + /upgrade` → `/audit --mode=...`; `/slop` and `/upgrade` preserved as alias commands; descriptions ≤1,536; `disable-model-invocation: true` on 6 side-effecting skills; `/slop`-pass on every skill; verification-artifact step (D23) in work-output skills. |
| [SP-CCE-04](../done/SUBPLAN_CCE_04_AUDIT_HARDENING.md) | DONE | GREEN | Identity ceremony fast-path (Plan B Fix 3 — `/identity` Step 6.1 MODE A/B/C + work-gated self-audit); §2 ownership broadening (Plan B Fix 4 — HEALER `field-inventories/<module>-*.md` UPDATE; new HEALER row for `reports/bugs/BUG-*.json` CREATE); `identity-ownership.mjs` mirror updated; V10 ceremony budget reduction projected 38–53% (≥40% target). |
| [SP-CCE-05](../done/SUBPLAN_CCE_05_MEMORY_HOOKS_SETTINGS.md) | DONE | GREEN | Memory consolidation (70→59 active; 192K→111K bytes, −42%); MEMORY.md 198→117 lines; chain-orchestrator.sh idempotent (per-spawn marker via `parse-verdict.mjs --prep-spawn` + record-outcome guard); permission narrowing (settings.local.json scrubbed 467→203); settings precedence header; parse-verdict.mjs absorbed budget logic. |
| [SP-CCE-06](../done/SUBPLAN_CCE_06_VERIFICATION.md) | DONE | GREEN (with V0 YELLOW pragmatic-pass, V3.1 user-decision-pending, V5/V10 caveats) | V0–V11 verification matrix; final report at `reports/cce-alignment/V0-V11-summary-2026-04-27.md`. |

**Token-budget delta** (V1):
- Plan A baseline: ~239K tokens (62 agent-instruction files, ~12K lines)
- Post-merge cold-start: ~2.6K tokens (CLAUDE.md 124 lines + MEMORY.md 117 lines)
- **~92× reduction** at cold start.

**Identity ceremony delta** (V10): ~50K tokens (SP-DQU-03 5-switch baseline) → ~22.5–30K projected (~45% midpoint reduction).

**File-count delta**:
- Skills: 30 → 28 (−2; audit/slop/upgrade merged with aliases preserved)
- Hooks: identity-switch-gate, todo-injection-gate (×2 modes), browsertool-gate, chain-orchestrator, chain-pause-notice (5 active)
- Path-scoped rules: 0 → 8 (`.claude/rules/{angular,baseline,browser-tool,data,hooks-identity,inventory,pipeline,specs}.md`)
- Memory files (active): 70 → 59
- `.github/agents/*.agent.md` (Copilot): 6 → 0 (replaced by 6 model-agnostic `.claude/agents/{REQUIREMENTS,PLANNER,GENERATOR,HEALER,AUDIT,MAINTAINER}.md`)

**Audit-primitive evidence-emission delta**:
- `/final-q` Step 4.5: prose-only v1 → v2 evidence-emission (`ran '<cmd>' → output: '<snippet>'`); incomplete cross-check → row `screwed`; mismatch → verdict floor YELLOW; ≥2 mismatches → RED
- `/final-q` Step 6.0: recipientless `skipped`/`deferred` → auto-reclassify to `ignored`; ≥2 reclassifications → verdict floor RED
- `/execute` Phase 2.5: Adjacent-Sweep ritual (DO-NOW / SPAWN / APPEND with grep verification); bare "out of scope" forbidden as disposition

**V0–V11 acceptance** (final-q gate per LR-027):
- All 13 verification IDs (V0–V11 + V3.1) reach a verdict.
- 11 of 13 GREEN/PASS; 1 YELLOW (V0 pragmatic with documented historical residual); 1 USER-DECISION-PENDING (V3.1, non-blocking).

**HALT condition check**: NONE trigger. PLAN_CC_ANTHROPIC_ALIGNMENT closes per LR-027 parent-cascade clause.

**Out-of-scope items confirmed not touched** (matches plan's "Out of scope" section):
- Plans system mechanism (`plans/pending/`, `plans/done/`, `npm run plans:reindex`) — only INDEX.md regenerated
- Per-client product knowledge (Encore TCs, requirements, baseline)
- Auto-memory mechanism itself (only content consolidated)
- TodoWrite injection patterns (kept; SP-02B added enforcement layer)
- Bug filing protocol (LR-034) — kept
- Backfilling SP-DQU-03's 3 skipped items — out of scope (Plan B was forward-looking; SP-DQU-03 closed via separate cleanup pass — see SUBPLAN_DQU_03_C1_LOS_FIXES_AND_REEXPORT.md)
- New LR rules — explicitly rejected per Plan B + LR-043 remediation precedent
- Hook-level enforcement of evidence-emission — deferred per D24

**Risks closed / deferred**:
- 9 risks closed in-execution (trim catches, alias preservation, parity tests, soft-rollouts).
- 1 risk deferred: V10 empirical 3-switch validation (recommended next chain-spawned multi-switch session).
- 1 USER-DECISION-PENDING: V3.1 chain-orchestrator currentIndex-advance double-fire (recommend option (a), small follow-up subplan).

**Next steps**:
1. Pick V3.1 option (a / b / c) when convenient. Default (a) — small follow-up.
2. After 1 multi-switch chain session lands, validate V10 empirical reduction against 40% target.
3. Re-run `/cleanup` (already in pending) for V0 APPEND items + any residual non-historical Copilot mentions.

**Verification artifact** (D23): re-run anytime via the bash block at the bottom of `reports/cce-alignment/V0-V11-summary-2026-04-27.md`.

**Closes**: PLAN_CLAUDE_SETUP_AUDIT_REMEDIATION (SUPERSEDED 2026-04-27, absorbed) + PLAN_FRAMEWORK_AUDIT_EVIDENCE_EMISSION (SUPERSEDED 2026-04-27, absorbed) + PLAN_CC_ANTHROPIC_ALIGNMENT (this plan, DONE).
