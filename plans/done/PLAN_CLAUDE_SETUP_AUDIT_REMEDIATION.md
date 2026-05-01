# PLAN: Claude Code Setup Audit & Remediation — Align with Official Best Practices

**Status**: SUPERSEDED
**Executed**: 2026-04-27
**Superseded by**: PLAN_CC_ANTHROPIC_ALIGNMENT.md (substance fully absorbed; merged with PLAN_FRAMEWORK_AUDIT_EVIDENCE_EMISSION.md; verified DONE 2026-04-27; structural field added by 2026-04-28 supersession-integrity sweep)
**Priority**: P0-CYCLE-1
**Created**: 2026-04-27
**Parent**: (root — framework infra)
**Depends on**: none
**Blocks**: future agent-authoring efficiency work; any new skill/hook/rule additions should land on the trimmed surface
**Skills**: `/planning` (authoring), `/audit`, `/slop`, `/review`, `/research` (Copilot absorption), `/execute` (implementation), `/final-q` (exit)
**Identity**: OWNER
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: plan
**BrowserTool**: none

---

## 🛑 MANDATORY PHASE 0 — AUDIT EVERY WORD BEFORE EXECUTING

This plan was authored 2026-04-27 against a fast-moving setup. Before touching any file:

1. Re-run a fresh inventory pass (`Explore` agent, very thorough) — counts and overlaps may have shifted.
2. Re-fetch the official docs at https://docs.claude.com/en/docs/claude-code/ — limits and recommendations may have changed (esp. CLAUDE.md sizing, skill description caps, `disable-model-invocation`, path-scoped `.claude/rules/*.md`).
3. Grep for the 8 deleted hooks listed in P1.3 — confirm the references still exist before scrubbing (LR-042 already removed the hooks; the orphan refs are the leftover work).
4. Grep `LR-008`, `LR-012`, `LR-036` — confirm ghost status before remediation.
5. Confirm `.claude/skills/INDEX.md` is still missing the 6 skills named in P1.1.
6. Slop-prevention: before authoring any new file (`.claude/rules/*.md`, `docs/SETUP.md`, `docs/read_only_docs/LEARNED_RULES.md`), grep first — they may already exist.

If any audit step shows the gap is closed, mark that sub-task DONE in the Execution Summary instead of re-doing it.

---

## Context

User flagged the Claude Code setup as "very inefficient" and asked for an audit against the official docs (https://docs.claude.com/en/docs/claude-code/) using `/review` + `/slop` lenses, covering everything that instructs an AI agent — `CLAUDE.md`, skills, hooks, sub-agents, settings, shared rules, memory.

Three Explore agents ran in parallel:
1. **Inventory**: 62 agent-instruction files, ~12K lines, ~239K tokens (with memory ~191K without)
2. **Docs**: fetched 11 official Claude Code doc pages, built Best Practices / Anti-Patterns / Limits index
3. **Runtime quality**: audited `settings.json`, hooks, skill SKILL.md files, INDEX, agent files

This plan turns those findings into a phased roadmap. The bias is `/slop` — DROP first, ADD only where docs explicitly recommend.

---

## Headline deltas (us vs docs)

| Surface | Docs say | We have | Gap |
|---|---|---|---|
| `CLAUDE.md` (root) | **< 200 lines** for adherence | 854 lines | 4.3× over |
| `AGENT_SHARED_RULES.md` | docs has no equivalent — use path-scoped `.claude/rules/*.md` instead | 807 lines | path-scoped layer unused |
| Skills | on-demand, narrow, distinct | **30 skills, 5,571 lines, 72.5K tokens** | heavy critique-class overlap |
| Skill description | **≤ 1,536 chars** combined | many over | trigger keywords truncated, auto-routing silently misses |
| `settings.local.json` | narrow, intentional | **467 lines** + plaintext creds (`EncoreAdmin@2026` line 147) | leak risk + maintenance tax |
| Permissions | narrow patterns | `Bash(find:*)`, `Bash(grep:*)`, `Bash(env)`, `Bash(npm install:*)` | broad allowlist hides what agents do |
| Hooks | **stateless + idempotent** | `chain-orchestrator.sh` increments budget counters on every call | will double-count on retries |
| Hook references | live or absent | **8 hooks deleted 2026-04-23, still cited in 96 places** | skills + settings.local point at ghosts |
| Skill `INDEX.md` | source of truth | **6 skills missing**: encore-questions, end-day, end-week, next-this-week, standup, ultrathink | `/relevant` auto-injection silently broken for these |
| `CLAUDE.md` skill-routing table | match INDEX | same 6 missing | user can't predict routing |
| LR rule numbering | stable lookup | **LR-008, LR-012, LR-036 cited but undefined** | trust erosion |
| Memory | one auto-memory layer | **two overlapping layers** — auto-memory (70 files, 48K tok) + `LR-*` in CLAUDE.md | same insights stored twice |
| Custom rule taxonomy | docs has none | `LR-NNN`, `ALL-NNN`, `PF-GN`, `AAE-DN`, `PLN-NNN`, `REQ-NNN` | reader cognitive tax, no docs precedent |
| `/init` | recommended bootstrap | never run | bottom-up sprawl instead of docs-shaped baseline |
| Copilot footprint | docs assume one frontier agent (Claude / Codex / etc.) | **7 Copilot-only files (~1,870 lines)** + 1 CI workflow + 1 sync script + scattered refs | Copilot is being decommissioned — substance must be absorbed, agent itself evicted |

---

## Phased remediation

### Phase 0 — Absorb + Evict Copilot (model-agnostic absorption)

**Goal**: remove Copilot-the-agent from every wiring, preserve every task it does so any frontier model (Opus, Sonnet, Codex, future GPT) can pick up the work. ~1 day.

**Premise**: 7 Copilot-only files (`.github/copilot-instructions.md` + 6 `.github/agents/playwright-*.agent.md`) prescribe 6 pipeline roles (HUNTER / GIVER / BUILDER / HEALER / WATCHDOG / GARDENER). Coverage analysis: ~31 of ~36 enumerated tasks already live in Claude assets (skills, rules, AGENT_SHARED_RULES). Net-new absorption: 5 tasks → rules/skills, 4–6 roles → Claude-native sub-agent files.

- **P0.1 Absorb the substance** (BEFORE any deletion):
  - Create model-agnostic Claude sub-agents at `.claude/agents/{REQUIREMENTS,PLANNER,GENERATOR,HEALER,AUDIT,MAINTAINER}.md`. Frontmatter must NOT hard-code Claude — describe role + tools + scope so Codex/GPT/etc. can adopt unchanged. Embed each agent's `{AGENT}-*` rule block (REQ-*, PLN-*, GEN-*, HLR-*, AUD-*, MNT-*) inline.
  - Migrate **pre-flight checks** (PF-01…05) → `.claude/rules/preflight.md`.
  - Migrate **Phase 0.5 walkthrough gate** (PF-G5) → `/execute` Phase 0 so all agent invocations share it.
  - Migrate **test-execution dependency rules** (GEN-018 + HLR-010) → `.claude/rules/test-execution.md`.
  - Migrate **Mode-Switch Protocol** (copilot-instructions §1–74) into root `CLAUDE.md` "Identity Enforcement" (most already there — finish the migration).
  - **Slop check**: do NOT recreate anything already in `/audit`, `/rca`, `/identity`, `/cleanup`, `AGENT_SHARED_RULES.md` §2/§3/§8/§12, or graduated `LR-*`. The absorption is for the ~5 truly uncovered items; everything else is a pointer.

- **P0.2 Repoint references** (no deletion yet):
  - `package.json` (drop `sync:copilot` script line 48)
  - `.vscode/settings.json` (drop Copilot extension + Copilot-model MCP sampling lines 8, 13–15)
  - `.claude/settings.local.json` (drop 3 lines that grep `.github/agents/`)
  - `docs/README.md` (3 lines), `docs/read_only_docs/AGENT_SHARED_RULES.md` (lines 276/369/661 — replace "Copilot" → "Claude / frontier agent"), `docs/read_only_docs/COMMENTING_STANDARDS.md` SYNC table
  - Skill SKILL.md mentions of "Copilot" → genericize to "agent"
  - **PRESERVE**: `agent-activity-log.md` and `audits/archive/*` Copilot mentions are historical record — do not scrub.

- **P0.3 Delete Copilot artifacts** (only after P0.1 + P0.2 land):
  - `.github/copilot-instructions.md`
  - `.github/agents/playwright-*.agent.md` (6 files)
  - `.github/workflows/copilot-setup-steps.yml`
  - `scripts/sync-copilot-session.ts`

- **P0.4 Reconcile pending Copilot-named plans**:
  - `plans/pending/SUBPLAN_REPO_02_CLAUDE_COPILOT_CONSOLIDATION.md`, `SUBPLAN_REPO_13_COPILOT_ACCOUNTABILITY.md`, `PLAN_AUDIT_COPILOT.md` — for each: confirm whether unique substance exists. If yes, fold into P0.1; if no, mark superseded by this plan and move to `plans/done/` with a one-line execution summary citing this PLAN.

### Phase 1 — Stop the bleeding (no behavior change)

**Goal**: kill orphans, align indices. ~1 hour.

- **P1.1** Update `.claude/skills/INDEX.md` to include all 30 skills (currently missing: encore-questions, end-day, end-week, next-this-week, standup, ultrathink).
- **P1.2** Update `CLAUDE.md` Skill Auto-Routing table (lines 74–100) to match INDEX.
- **P1.3** Strip references to the 8 deleted hooks (`final-q-gate.sh`, `rubber-stamp-gate.sh`, `override-discipline-gate.sh`, `lib/check-finalq-required.mjs`, `lib/check-override-discipline.mjs`, `lib/check-rubberstamp.mjs`, `lib/test-override-discipline-fixtures.mjs`, `lib/test-rubberstamp-fixtures.mjs`) across:
  - `.claude/settings.local.json:460–463`
  - `.claude/hooks/identity-switch-gate.sh:24` (docstring)
  - `.claude/hooks/chain-orchestrator.sh:4–7` (docstring)
  - All `.claude/skills/*/SKILL.md` files that mention them (grep first; confirmed in execute, audit, chain, chain_audit, final-q, identity)
- **P1.4** Resolve `LR-008` / `LR-012` / `LR-036` ghost citations. Either reinstate body (search git log) or remove the cites.
- **P1.5** Sanitize `.claude/settings.local.json`:
  - Remove plaintext credentials at line 147
  - Promote stable entries to `.claude/settings.json`
  - Delete one-shot session debris (single-use UUIDs, localhost POSTs)

### Phase 2 — Right-size `CLAUDE.md` (content-preserving migration)

**Goal**: root `CLAUDE.md` ≤ 200 lines per docs guidance. ~half day.

- **P2.1** Extract `LR-001…LR-045` block (≈400 lines) out of root `CLAUDE.md`. Use the docs-supported pattern:
  - **Path-scoped → `.claude/rules/*.md`** (preferred): Angular rules → `.claude/rules/angular.md`, spec-fixing rules → `.claude/rules/specs.md`, hooks/identity rules → `.claude/rules/hooks-identity.md`. Loads only when Claude touches matching files = lower context tax.
  - **Cross-cutting → `docs/read_only_docs/LEARNED_RULES.md`** (companion to AGENT_SHARED_RULES.md), `@`-referenced from CLAUDE.md.
- **P2.2** Replace the inline **Skill Dependency Graph** in CLAUDE.md with a one-line pointer to `.claude/skills/INDEX.md`. Don't duplicate.
- **P2.3** Replace the **Skill Auto-Routing table** with a pointer + rely on each skill's `description` frontmatter (which already carries triggers). Removes ~30 rows.
- **P2.4** Move **First-Time Setup** (steps 1–7, env files, install commands) to `docs/SETUP.md`. Reference from `CLAUDE.md`.
- **P2.5** Final shape of root `CLAUDE.md`:
  1. Navigation pointer (`.claude/context/navigation.md` already exists)
  2. Supreme rules (NEVER ASSUME, identity discipline, guiding vision)
  3. `@`-references to: SETUP, rules, skills INDEX, AGENT_SHARED_RULES
  4. Auto-routing pointer
  5. Active-client switch (`clients/encore/CLAUDE.md`)

### Phase 3 — Skill rationalization

**Goal**: remove duplication, fit docs caps. ~half day.

- **P3.1** Merge critique-class overlap. Today's surface: `/audit`, `/review`, `/find-bugs`, `/slop`, `/upgrade`, `/reflect`. Proposed:
  - **Keep distinct**: `/review` (PR-style code review), `/find-bugs` (adversarial live-app QA), `/reflect` (session retro)
  - **Merge into `/audit` with modes**: `/slop` → `/audit slop`, `/upgrade` → `/audit upgrade`. All three produce verdict-style output; one skill, three flags.
- **P3.2** Trim every `SKILL.md` `description` to ≤ 1,536 chars (docs cap). Front-load trigger keywords. Audit large ones first: `/end-day` (368 lines), `/end-week` (326), `/report` (306).
- **P3.3** Add `disable-model-invocation: true` to side-effect skills per docs: `/deploy`, `/chain`, `/end-day`, `/encore-questions`. User-only invocation.
- **P3.4** Reconcile auto-call claims. `CLAUDE.md`'s skill dependency graph is aspirational — verify each `SKILL.md` actually invokes its stated dependencies, or fix the graph.
- **P3.5** Run `/slop` on each remaining skill to find Steps that are over-engineered (the LR-042 hook removal is precedent — skill-level mandate replaced a Stop hook because the hook burned tokens).

### Phase 4 — Memory consolidation

**Goal**: one memory layer, not two. ~2 hours.

- **P4.1** Pick canonical home per type:
  - User preferences / corrections → **auto-memory** (`~/.claude/projects/.../memory/feedback_*.md`) — keep
  - Project facts (Encore product / client) → **`clients/encore/CLAUDE.md`** — keep, possibly extend
  - Framework rules (`LR-*`) → **`.claude/rules/*.md`** after P2.1 — single source
- **P4.2** Audit the 70-file memory layer:
  - Anything > 30 days idle and not a true preference → archive
  - Anything duplicated in `CLAUDE.md` `LR-*` after P2.1 → delete one copy
  - Goal: drop ~30–40% (24K → 14K tokens)
- **P4.3** `MEMORY.md` index — keep concise (docs caps it at 200 lines / 25KB load). Currently OK; verify after pruning.

### Phase 5 — Hooks & settings hardening

**Goal**: deterministic, idempotent, narrow. ~2 hours.

- **P5.1** Make `.claude/hooks/chain-orchestrator.sh` idempotent. Add a per-spawn lock file or guard the budget-counter increment behind a "first call this Stop event" check. Today double-runs double-count (lines 137–140).
- **P5.2** Narrow overbroad permission patterns. Replace `Bash(find:*)`, `Bash(grep:*)`, `Bash(env)`, `Bash(npm install:*)` with specific allowlists or document why broad is needed for autonomous chain runs.
- **P5.3** Document fail-mode for each hook in its docstring. `identity-switch-gate.sh` and `browsertool-gate.sh` correctly fail-open; `chain-orchestrator.sh` should make this explicit.
- **P5.4** Document precedence in `.claude/settings.local.json` header (project + local merger semantics — currently unclear).
- **P5.5** Consider migrating `chain-orchestrator.sh` budget logic to a `parse-verdict.mjs` companion (Node), avoiding shell-quoting fragility at line 149.

### Phase 6 — Optional: `/init` benchmark

If after P1–P5 the surface still feels heavy, run `/init` in a scratch worktree on a clean clone. Compare what Claude Code auto-generates against our trimmed setup. Use as a "we're not insane" check or as a further trimming target.

---

## Critical files to modify (when execution begins)

| Path | Phase | Action |
|---|---|---|
| `CLAUDE.md` (root) | P2 | 854 → ≤ 200 lines |
| `.claude/skills/INDEX.md` | P1.1 | add 6 missing skills |
| `.claude/settings.local.json` | P1.5 + P5.2 | scrub creds, narrow perms, dedupe (467 → ~150) |
| `.claude/hooks/chain-orchestrator.sh` | P1.3 + P5.1 + P5.3 | docstring, idempotency, fail-mode |
| `.claude/hooks/identity-switch-gate.sh` | P1.3 | docstring update |
| `.claude/skills/{audit,slop,upgrade}/SKILL.md` | P3.1 | merge to one with mode flag |
| `.claude/skills/*/SKILL.md` (all 30) | P3.2 + P3.3 | description ≤ 1536, `disable-model-invocation` where side-effecting |
| `docs/read_only_docs/AGENT_SHARED_RULES.md` | P2.1 | receive cross-cutting rules; trim duplicated content |
| `clients/encore/CLAUDE.md` | P4.1 | keep client-specific facts here |
| **New** `.claude/rules/*.md` | P2.1 | path-scoped framework rules |
| **New** `docs/SETUP.md` | P2.4 | first-time setup steps |
| **New** `.claude/agents/{REQUIREMENTS,PLANNER,GENERATOR,HEALER,AUDIT,MAINTAINER}.md` | P0.1 | model-agnostic sub-agents that absorb the 6 Copilot agent roles |
| `.github/copilot-instructions.md` + `.github/agents/playwright-*.agent.md` (6) | P0.3 | DELETE after absorption |
| `.github/workflows/copilot-setup-steps.yml` | P0.3 | DELETE (orphaned) |
| `scripts/sync-copilot-session.ts` + `package.json:48` | P0.3 | DELETE script + npm entry |
| `.vscode/settings.json:8,13–15` + `.claude/settings.local.json` (3 Copilot grep lines) | P0.2 | drop Copilot extension + MCP sampling refs |
| `docs/README.md`, `docs/read_only_docs/AGENT_SHARED_RULES.md`, `docs/read_only_docs/COMMENTING_STANDARDS.md` | P0.2 | repoint Copilot mentions → "Claude / frontier agent" |

Existing utilities to **reuse, not duplicate**:
- `.claude/context/navigation.md` — already serves as the §A navigation pointer; CLAUDE.md should `@`-reference it, not restate.
- `scripts/identity-ownership.mjs` — already byte-mirrors §2 (LR-043). Don't re-implement.
- `parse-verdict.mjs` — already reads chain-session JSONL. Reuse for P5.5.
- `npm run plans:reindex` — already auto-generates `plans/INDEX.md`. Don't hand-edit (LR-035).

---

## Verification (end-to-end)

- **V0 — Copilot-clean**. After Phase 0: `grep -ri "copilot" --exclude-dir=node_modules --exclude-dir=.git --exclude="agent-activity-log.md" --exclude-dir=audits/archive` returns zero hits in active config/code/docs. Every `{AGENT}-*` rule (PLN-*, REQ-*, GEN-*, HLR-*, AUD-*, MNT-*) is reachable from a Claude sub-agent file or a `.claude/rules/*.md`. CI is green without `copilot-setup-steps.yml`.
- **V1 — Token budget**. Fresh `claude` session; observe context usage at start. Target after Phase 2: < 30K tokens of agent instructions auto-loaded (vs current ~239K).
- **V2 — Skill routing**. Issue test prompts matching all 30 skill triggers; confirm correct skill auto-invokes for each. Catches INDEX/auto-routing drift.
- **V3 — Hook health**. Trigger each hook event (PreToolUse, Stop, SessionStart). No "file not found" errors in transcript. `chain-orchestrator.sh` budget counter increments exactly once per Stop event under retry.
- **V4 — Settings parse**. Run any startup command; Claude Code logs warnings on invalid permissions. Should be silent.
- **V5 — Pipeline regression**. Run one small pending subplan via `/execute`. All auto-calls resolve, no stale-rule citations surface, no hook errors, `/final-q` emits a parseable verdict.
- **V6 — Audit re-run**. Re-run the 3 Explore agents. HIGH severity findings → 0. MED findings → reduced ≥ 50%.
- **V7 — Cold-read test**. Open a new chat, paste only the trimmed `CLAUDE.md` + 1 SKILL.md, ask Claude to summarize what it should do. Compare against today's behavior. Drift = the trim removed something load-bearing.

---

## Out of scope (intentionally untouched)

- The plans system (`plans/pending/`, `plans/done/`, `npm run plans:reindex`) — orthogonal to Claude Code config.
- Per-client product knowledge (Encore-specific test cases, requirements, baseline truth) — content, not config.
- The auto-memory mechanism itself — keep; only consolidate content (P4).

---

## Risk register

| Risk | Mitigation |
|---|---|
| Trimming `LR-*` rules removes load-bearing behavior | P2.1 migrates not deletes; V5 pipeline regression catches breakage; do P2 in a worktree first |
| Skill merge `/audit + /slop + /upgrade` breaks user muscle memory | Keep `/slop` and `/upgrade` as alias commands that route to `/audit <mode>` |
| Removing routing table from CLAUDE.md harms discoverability | Replace with `@.claude/skills/INDEX.md` pointer; INDEX gets a "When to use" column (today's LOW finding) |
| Path-scoped rules don't load when expected | Test with V2 + a deliberate touch-this-file-then-check-rule-applied sweep |
| `chain-orchestrator.sh` lock breaks existing flows | Soft-rollout: log "would have skipped" first, observe one chain cycle, then enforce |
| Copilot deletion before absorption strands an `{AGENT}-*` rule (PLN-*, GEN-*, etc.) | P0.1 absorbs first, P0.3 deletes only after V0 grep is clean; sub-agent files keep all rules embedded inline |
| `SUBPLAN_REPO_02/13` + `PLAN_AUDIT_COPILOT` carry unique work not captured here | P0.4 reviews each before this plan starts; fold or supersede explicitly |
| New sub-agent files become Claude-only by accident, defeating model-agnostic goal | Frontmatter must avoid Claude-specific keys; describe role + tools + scope in plain prose so Codex/GPT can adopt unchanged |

---

## Final-state vision (post-execution)

- Root `CLAUDE.md`: ≤ 200 lines, mostly `@`-references.
- `.claude/rules/`: 4–6 path-scoped rule files, each ≤ 150 lines.
- 30 skills → ~25 skills (merged critique cluster), each `description` ≤ 1,536 chars.
- `settings.json` + `settings.local.json` together ≤ 200 lines, no plaintext creds, no orphan refs.
- 4 active hooks, all idempotent, all documenting fail-mode.
- Memory layer: ~40–50 files (was 70), no overlap with `LR-*`.
- A new contributor reading `CLAUDE.md` can predict agent routing without reading skill files.
- Cold-start context load: < 30K tokens (was ~239K) — a ~7× reduction with no behavioral loss.
- Zero Copilot footprint in active config; 6 model-agnostic sub-agents (`.claude/agents/{ROLE}.md`) carry every prior Copilot responsibility — adoptable by Claude today, Codex / GPT / future frontier models tomorrow with no rewrite.

---

## Execution Summary

**SUPERSEDED 2026-04-27.** Substance fully absorbed into [PLAN_CC_ANTHROPIC_ALIGNMENT.md](../pending/PLAN_CC_ANTHROPIC_ALIGNMENT.md), which merges this plan with `PLAN_FRAMEWORK_AUDIT_EVIDENCE_EMISSION.md` and Anthropic's official Claude Code best-practices guide (`~/.claude/plans/ur-only-goal-is-flickering-cupcake.md`). No unique work remains here. See the super plan for execution shape (6 subplans `SUBPLAN_CCE_01..06`, runnable via `/chain`).
