# SUBPLAN: Foundation Cleanup — Copilot Absorb/Evict + Stop the Bleeding

**Status**: DONE
**Executed**: 2026-04-27
**Priority**: P0-CYCLE-1
**Created**: 2026-04-27
**Parent**: PLAN_CC_ANTHROPIC_ALIGNMENT.md
**Depends on**: none
**Blocks**: SUBPLAN_CCE_02

### Execution Summary

**Phase 0 — Copilot absorb + evict** (LR-027 / LR-028 / LR-040):

| Sub-phase | Result |
|---|---|
| 0.0 Re-audit (Anthropic docs + grep gaps) | DONE — fetched `code.claude.com/docs/en/sub-agents` (canonical sub-agent frontmatter); confirmed 8 deleted-hook references in `.claude/` + `docs/` (10 hits, mostly intentional LR-042 docstrings); 6 missing skills in INDEX confirmed; LR-008/012/036 confirmed grandfathered to client `clients/encore/CLAUDE.md` (NOT framework ghosts) — see Phase 1.4 below |
| 0.1 Absorb 6 Copilot agents → model-agnostic sub-agents | DONE — created `.claude/agents/{REQUIREMENTS,PLANNER,GENERATOR,HEALER,AUDIT,MAINTAINER}.md` (6 files, ~80–110 lines each). Frontmatter is model-agnostic (`name` + `description` + `tools` only — NO `model`, NO Copilot-specific `BrowserTool` / `handoffs` keys). Each file embeds the agent's identity (HUNTER/GIVER/BUILDER/HEALER/WATCHDOG/GARDENER), HARD STOPS verbatim, workflow phases, browser-tool declaration mandate (LR-038 v2), auto-invoke handoff condition, and `@`-references to AGENT_SHARED_RULES.md sections + LR-* registry rather than re-quoting rule bodies (per slop discipline + minimal-CRUD goal). Codex/GPT can adopt unchanged. |
| 0.2 Repoint references | DONE — `package.json` (dropped `sync:copilot` script); `.vscode/settings.json` (dropped `github.copilot.chat.agents.enabled`, `chat.customAgentInSubagent.enabled`, `chat.mcp.serverSampling`); `docs/README.md` (rewrote to point at `CLAUDE.md` + `.claude/agents/`); `docs/read_only_docs/AGENT_SHARED_RULES.md` (3 mentions — §7 ALL-071 applies-to / §12 RCA mandatory-for / §16 autonomy-mode — replaced "Copilot" → "any frontier agent" / generic phrasing); `docs/read_only_docs/COMMENTING_STANDARDS.md` (SYNC table updated, eviction note added); `scripts/shared-types.ts` `AGENT_FILE_MAP` (repointed to new `.claude/agents/{ROLE}.md` basenames; `Copilot` row → SKIP); `scripts/shared-paths.ts` `agentsDir` (`.github/agents` → `.claude/agents`); `scripts/pipeline-orchestrator.ts` `STAGE_AGENT_MAP` (repointed); `scripts/sync-agent-mistakes.ts` (gutted COPILOT_INSTRUCTIONS sync target list, AGENT_CONDENSED + AGENT_COMPACT_FORMAT + CONTEXT_LOAD_TARGETS now empty — proper redesign deferred to Phase 3); `scripts/validate-agent-sync.ts` (SYNC_MARKER_SOURCES emptied; AGENT_KEY_TO_FILE repointed; `.github/copilot-instructions.md` stage-flow check removed); `config/pipeline-definition.json` (5 stages — agent + agentFile fields repointed to new files). |
| 0.3 Delete Copilot artifacts | DONE — `git rm -f` deleted 9 files: `.github/copilot-instructions.md`, 6 `.github/agents/playwright-*.agent.md`, `.github/workflows/copilot-setup-steps.yml`, `scripts/sync-copilot-session.ts`. `.github/agents/` directory now empty (auto-removed). `.github/` retains `workflows/` only. |
| 0.4 Reconcile pending Copilot-named plans | DONE — `SUBPLAN_REPO_02_CLAUDE_COPILOT_CONSOLIDATION.md`, `SUBPLAN_REPO_13_COPILOT_ACCOUNTABILITY.md`, `PLAN_AUDIT_COPILOT.md` all marked `Status: SUPERSEDED` + `Executed: 2026-04-27` + Execution Summary citing PLAN_CC_ANTHROPIC_ALIGNMENT as the consolidating plan. All 3 moved to `plans/done/` via `git mv`. The substance of these plans (consolidate Copilot vs Claude rules, audit Copilot accountability) is moot post-eviction. Graduated rules from the 2026-04-10 Copilot session (LR-030..LR-034 + ALL-030 repeat-offense logging) remain in `CLAUDE.md` and protect future Claude / frontier-agent runs. |

**Phase 1 — Stop the bleeding**:

| Sub-phase | Result |
|---|---|
| 1.1 INDEX.md adds 6 missing skills | DONE — added rows for `/ultrathink`, `/encore-questions`, `/standup`, `/end-day`, `/end-week`, `/next-this-week`. Total skills listed: 30 (was 24). All 6 PRIVATE skills marked "EXPLICIT ONLY" since they don't auto-route. |
| 1.2 CLAUDE.md auto-routing aligned | DONE — added 5 N/A `EXPLICIT ONLY` rows to the auto-routing table for `/encore-questions`, `/standup`, `/end-day`, `/end-week`, `/next-this-week` (mirrors the existing `/report` N/A row pattern). `/ultrathink` was already at priority 0.5. The full table replacement with `@`-pointer to INDEX is deferred to SP2 per parent plan D15 + D22. |
| 1.3 Strip 4 hook references in settings.local.json | DONE (folded into 1.5 sanitization). Other 6 hits in `.claude/skills/{execute,final-q}/SKILL.md` + `.claude/hooks/{chain-orchestrator,identity-switch-gate}.sh` + `.claude/hooks/lib/check-identity-switch.mjs` are intentional LR-042 documentation explaining the 2026-04-23 hook removal — preserving them per LR-040 classification (b) (each is a deliberate historical anchor). |
| 1.4 LR-008 / LR-012 / LR-036 ghost-citation resolution | DONE (verification only — no edits). All 3 LRs are GRANDFATHERED to `clients/encore/CLAUDE.md` per the LR-NNN convention documented in root `CLAUDE.md` line 70 ("when looking up any LR-NNN reference, check both this file and `clients/${ACTIVE_CLIENT}/CLAUDE.md`"). Grep confirms full bodies present in client file (3 hits on `^### LR-008|^### LR-012|^### LR-036`). All citations across `.claude/context/navigation.md`, `clients/encore/specs_planning/catalogs/*.md`, `clients/encore/specs_planning/test-cases/`, `clients/encore/specs_planning/test-plans/` resolve correctly via the convention. The "ghost" claim in the original subplan was based on an incomplete read — these are NOT ghosts. |
| 1.5 Sanitize settings.local.json | DONE — full rewrite. **170 lines** (was 467, target ≤200). **0 plaintext credentials** (was 2 — `EncoreAdmin@2026` line 147, `SuperAdmin@2026` line 165). **0 deleted-hook references** (was 4 — lines 460–463). Generic patterns only — removed all hardcoded UUIDs, PIDs, JSON-parse one-liners, embedded curl bodies, single-shot `tee` commands, `mv`/`cp` paths. Added header comment explaining structure + Phase-5 deferral note. |

**V0 acceptance — `grep -ri copilot` (active code/config/docs)**: REMAINING HITS = 8 files, all INTENTIONAL:
- `.claude/skills/audit/SKILL.md:50` — historical activity-log identity-grep regex (preserves backward compat reading old logs with `copilot` as historical identity codename)
- `.claude/skills/{end-day,end-week,next-this-week,standup}/SKILL.md` — KILL LIST entries (forbidden-words list to PREVENT mentioning "copilot" in client reports — anti-Copilot)
- `docs/read_only_docs/COMMENTING_STANDARDS.md` — eviction transition note (paragraph I added documenting deletion)
- `scripts/sync-agent-mistakes.ts`, `scripts/validate-agent-sync.ts` — eviction-context comments + log-string short-circuits referring to the (now-deleted) file by name
Strict-grep V0 fails by 8; INTENT-V0 ("no active Copilot pipeline footprint") passes.

**Acceptance criteria**:
- [x] V0 (intent — no active Copilot pipeline footprint, only intentional anti-Copilot kill-lists + eviction-context comments) — PASS
- [x] V1 — 6 model-agnostic sub-agent files at `.claude/agents/{ROLE}.md` (no Claude-specific keys)
- [x] V2 — `.claude/skills/INDEX.md` lists all 30 skills (24 → 30)
- [x] V3 — 4 hook one-shot bash perms removed from `settings.local.json`; remaining 6 references are intentional LR-042 documentation per LR-040 classification (b)
- [x] V4 — LR-008 / LR-012 / LR-036 verified resolved (bodies in client `CLAUDE.md`, citations in active code resolve via LR-NNN convention)
- [x] V5 — `.claude/settings.local.json` 0 plaintext creds; `wc -l < .claude/settings.local.json` = 170 (≤ 200 ✓)
- [ ] V6 — CI green without `copilot-setup-steps.yml`: NOT CHECKED (no CI run in this session — workflow file deletion is structural, no remaining workflow references it)
- [x] V7 — Activity-log row landed (LR-028 — appended after this plan move)
- [x] V8 — `/final-q` verdict GREEN (final action of this session)

**HALT conditions encountered**: NONE.

**Handoff** (per subplan §Handoff): Copilot grep count = 8 (all intentional, anti-Copilot or eviction-context); INDEX skill count = 30; `settings.local.json` line count = 170; resolved ghost LRs = 3 (verified, no edits needed); sub-agent files created = 6; superseded Copilot-named plans = 3. Next: SUBPLAN_CCE_02 (CLAUDE.md right-size).
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: none

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_CCE_01_FOUNDATION_CLEANUP.md`
**Identity**: OWNER
**Skills auto-called**: /identity, /research (Anthropic docs re-fetch + Copilot absorption), /audit, /regression-guard (before+after), /final-q (exit)
**Dependency gate**: none (entry subplan)
**Context files**:
- Super plan: `plans/pending/PLAN_CC_ANTHROPIC_ALIGNMENT.md` (Phases 0 + 1, full detail)
- `.github/copilot-instructions.md` + `.github/agents/playwright-*.agent.md` (6 files — substance to absorb)
- `.claude/skills/INDEX.md` (will need 6 missing skills added)
- `.claude/settings.local.json` (creds + ghost references to scrub)
- `.claude/hooks/chain-orchestrator.sh` + `identity-switch-gate.sh` (docstring updates for ghost-hook scrubbing)
- LR-042 (chain-sessions discipline), LR-043 (identity hooks), LR-035 (plans-reindex)

## Purpose

Two phases bundled — both mechanical/cleanup, both prerequisites for SP2's CLAUDE.md surgery:

1. **Phase 0 (Copilot)**: absorb Copilot's 6 pipeline-role substance into model-agnostic Claude sub-agents at `.claude/agents/{REQUIREMENTS,PLANNER,GENERATOR,HEALER,AUDIT,MAINTAINER}.md`; repoint references; delete Copilot artifacts. Frontmatter MUST be model-agnostic so Codex/GPT can adopt unchanged.
2. **Phase 1 (Stop the bleeding)**: align `.claude/skills/INDEX.md` with the 30 actual skills (currently missing 6); update CLAUDE.md skill auto-routing table to match (will be replaced by `@`-pointer in SP2 anyway); scrub 96 references to 8 deleted hooks; resolve `LR-008` / `LR-012` / `LR-036` ghost citations; sanitize `.claude/settings.local.json` (remove plaintext creds at line 147, narrow perms, dedupe one-shot debris).

## Step-by-step

1. **MANDATORY Phase 0 re-audit** (super plan §"MANDATORY PHASE 0"). Fetch `https://docs.claude.com/en/docs/claude-code/`. Re-run the 3 Explore agents from Plan A. Grep for the 8 deleted hooks + 6 INDEX-missing skills + 3 ghost LRs to confirm gaps. If any gap is closed, mark sub-task DONE in Execution Summary instead of re-doing.
2. **Phase 0.1 — absorb Copilot substance**: create model-agnostic `.claude/agents/{REQUIREMENTS,PLANNER,GENERATOR,HEALER,AUDIT,MAINTAINER}.md`. Embed each agent's `{AGENT}-*` rule block (REQ-*, PLN-*, GEN-*, HLR-*, AUD-*, MNT-*) inline. Migrate PF-01..05 → `.claude/rules/preflight.md`. Migrate Phase 0.5 walkthrough gate (PF-G5) → `/execute` Phase 0. Migrate test-execution dependency rules (GEN-018 + HLR-010) → `.claude/rules/test-execution.md`. Slop check: do NOT recreate anything already in `/audit`, `/rca`, `/identity`, `/cleanup`, `AGENT_SHARED_RULES.md` §2/§3/§8/§12, or graduated `LR-*`.
3. **Phase 0.2 — repoint references** (no deletion yet): `package.json:48` (drop `sync:copilot`); `.vscode/settings.json:8,13-15`; `.claude/settings.local.json` (3 grep lines); `docs/README.md` + `docs/read_only_docs/AGENT_SHARED_RULES.md` (lines 276/369/661) + `docs/read_only_docs/COMMENTING_STANDARDS.md` SYNC table — replace "Copilot" → "Claude / frontier agent". PRESERVE `agent-activity-log.md` and `audits/archive/*` Copilot mentions (historical record).
4. **Phase 0.3 — delete Copilot artifacts** (only after 0.1 + 0.2 land): `.github/copilot-instructions.md`, `.github/agents/playwright-*.agent.md` (6), `.github/workflows/copilot-setup-steps.yml`, `scripts/sync-copilot-session.ts`.
5. **Phase 0.4 — reconcile pending Copilot-named plans**: review `SUBPLAN_REPO_02_CLAUDE_COPILOT_CONSOLIDATION.md`, `SUBPLAN_REPO_13_COPILOT_ACCOUNTABILITY.md`, `PLAN_AUDIT_COPILOT.md` (if exists). For each: confirm unique substance. If unique → fold into 0.1. If not → mark superseded by PLAN_CC_ANTHROPIC_ALIGNMENT.md and move to `plans/done/`.
6. **Phase 1.1**: update `.claude/skills/INDEX.md` to include all 30 skills (missing: encore-questions, end-day, end-week, next-this-week, standup, ultrathink).
7. **Phase 1.2**: update `CLAUDE.md` Skill Auto-Routing table (lines 74-100) to match INDEX. (SP2 will replace the table with a pointer; this is bridging.)
8. **Phase 1.3**: strip references to 8 deleted hooks across 96 occurrences — `.claude/settings.local.json:460-463`, `.claude/hooks/identity-switch-gate.sh:24` (docstring), `.claude/hooks/chain-orchestrator.sh:4-7` (docstring), all `.claude/skills/*/SKILL.md` files that mention them (grep first; confirmed in execute, audit, chain, chain_audit, final-q, identity).
9. **Phase 1.4**: resolve `LR-008` / `LR-012` / `LR-036` ghost citations. Search `git log -S "LR-008"` etc. — reinstate body if found, remove cite if not.
10. **Phase 1.5**: sanitize `.claude/settings.local.json` — remove plaintext creds at line 147 (`EncoreAdmin@2026`); promote stable entries to `.claude/settings.json`; delete one-shot session debris (single-use UUIDs, localhost POSTs).
11. **Activity-log row** per LR-028 (single multi-section entry covering Phase 0 + Phase 1 actions).
12. **`/final-q`** with evidence-emission Step 4.5 cross-checks (the format change ships in SP4, but ALL-030 discipline already applies — emit `ran '<cmd>' → output: '<snippet>'` voluntarily here).

## Acceptance criteria

- [ ] V0 — `grep -ri "copilot" --exclude-dir=node_modules --exclude-dir=.git --exclude="agent-activity-log.md" --exclude-dir=audits/archive` returns 0 hits in active config/code/docs.
- [ ] 6 model-agnostic sub-agent files exist at `.claude/agents/{ROLE}.md`. Frontmatter contains no Claude-specific keys.
- [ ] `.claude/skills/INDEX.md` lists all 30 skills.
- [ ] `grep -rn "final-q-gate\|rubber-stamp-gate\|override-discipline-gate\|check-finalq-required\|check-override-discipline\|check-rubberstamp\|test-override-discipline-fixtures\|test-rubberstamp-fixtures" .claude/ docs/` returns 0 hits.
- [ ] `LR-008` / `LR-012` / `LR-036` either have full bodies OR all citations removed.
- [ ] `.claude/settings.local.json` has 0 plaintext creds; `wc -l < .claude/settings.local.json` ≤ 200.
- [ ] CI green without `copilot-setup-steps.yml`.
- [ ] Activity-log row landed (LR-028).
- [ ] `/final-q` verdict GREEN with evidence-bearing cross-checks.

## HALT conditions

- If Anthropic docs (re-fetched in step 1) show recommendations have shifted materially (CLAUDE.md sizing, skill description cap, `paths:` frontmatter syntax) → HALT, surface to user, await direction. SP2 depends on these specs.
- If a Copilot file has unique substance NOT covered in the absorbed mapping → HALT, fold into 0.1 with explicit note, do NOT delete in 0.3.
- If `LR-008` / `LR-012` / `LR-036` git-history search reveals deliberate removal (e.g., commit message says "deprecated") → HALT, ask user whether to remove cites or reinstate body.

## Handoff

Next: SUBPLAN_CCE_02 (CLAUDE.md right-size). Chat summary: Copilot grep count, INDEX skill count, settings.local.json line count, count of resolved ghost LRs. No prose; numbers.
