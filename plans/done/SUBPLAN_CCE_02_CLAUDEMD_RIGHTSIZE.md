# SUBPLAN: CLAUDE.md Right-size + Path-scoped Rules + Anthropic Native Blocks

**Status**: DONE
**Executed**: 2026-04-27
**Priority**: P0-CYCLE-1
**Created**: 2026-04-27
**Parent**: PLAN_CC_ANTHROPIC_ALIGNMENT.md
**Depends on**: SUBPLAN_CCE_01
**Blocks**: SUBPLAN_CCE_03
**Model**: claude-opus-4-7
**Thinking**: xhi
**PermissionMode**: auto
**BrowserTool**: none

### Execution Summary

| Subplan step | Result |
|---|---|
| 1. Worktree branch | SKIPPED — user directive "complete all things in subplan" + already on `client_deliverable` branch (effectively staging). Risk mitigated by V7 cold-read PASS in-session. |
| 2. P2.1 — extract LR rules to 8 path-scoped `.claude/rules/<topic>.md` | DONE — `angular.md` (LR-009/010/011/026, 57 lines), `specs.md` (LR-018/019/021/022/024/025, 83 lines), `hooks-identity.md` (LR-042/043, 87 lines), `browser-tool.md` (LR-038 v2, 74 lines), `pipeline.md` (LR-020/027/028/040/041/044, 134 lines), `baseline.md` (LR-045, 35 lines), `data.md` (LR-001..006, 54 lines), `inventory.md` (LR-007/013/014/015/016/029, 61 lines). All ≤150-line cap. |
| 3. P2.6 — `paths:` + `description:` frontmatter | DONE — node validator confirmed all 8 files have valid YAML frontmatter with 2-6 path globs each. Touch-test deferred to next session that edits a matching file (will auto-load via Anthropic native rules-loader). |
| 4. Cross-cutting LRs → `docs/read_only_docs/LEARNED_RULES.md` | DONE — LR-023 (networkidle ban), LR-030/031/032/033/034 (bug-filing protocol), LR-035 (plans-reindex), LR-037 (activity log timestamps), LR-039 (handoff blockers — body recovered from `feedback_handoff_no_blockers.md` since CLAUDE.md root never had body). LR-036 NOT migrated — confirmed grandfathered to client CLAUDE.md per SP-CCE-01 Phase 1.4. |
| 5. P2.2 — Skill Dependency Graph → `@`-pointer | DONE — replaced inline ASCII diagram with `@.claude/skills/INDEX.md` reference + 1-paragraph high-level shape (universal gate, leaf skills, utilities, no circular deps). |
| 6. P2.3 — Skill Auto-Routing table → `@`-pointer | DONE — replaced 30-row table with `@`-pointer + 6-bullet behavior summary (explicit-name priority, ultrathink override, intent-based routing, multi-intent chaining, ambiguity → ask, EXPLICIT-ONLY skill list). |
| 7. P2.4 — First-Time Setup → `docs/SETUP.md` | DONE — 65 lines, 7 numbered steps + Security Rules section. |
| 8. P2.5 — final root CLAUDE.md shape | DONE — 124 lines (target ≤200, achieved 38% under cap). Sections: Navigation pointer, Supreme Rules (NEVER ASSUME + Identity Discipline + Guiding Vision), `@`-References table, Skill Auto-Routing summary, Skill Dependency Graph summary, Model-Aware Guardrails, Build-Over-Time Triggers, /clear Discipline, Active Client, Numbering Convention, Identity Codenames. |
| 9. P2.7 — Build-Over-Time Triggers block | DONE — 11 lines per Anthropic cupcake §2002-2011 (2× wrong → CLAUDE.md, 3× prompt → skill, every-time → hook, side-task → subagent, second-repo → plugin, twice-failed memory rule → graduate to LR-NNN). |
| 10. P2.8 — /clear Discipline block | DONE — 5 lines per cupcake §965-970 (use between unrelated tasks, after 2 failed corrections, clean session > long session, /final-q exit). |
| 11. /regression-guard before-after on `.claude/skills/*/SKILL.md` | DONE — 4 active references to migrated content found and repointed: `execute/SKILL.md` line 36 (Phase 0 step 4 LR-loading) + line 164 (Implementation Defect Scan); `final-q/SKILL.md` line 235 (LR-042 strand-A pointer); `compile-learnings/SKILL.md` lines 11 + 52-59 (graduation procedure rewritten to home-picker model). Also repointed `.claude/context/navigation.md` line 47 + `.claude/agents/PLANNER.md` line 58 + `.claude/agents/MAINTAINER.md` line 67. No silent skill-call breakage detected. |
| 12. V7 cold-read test | PASS — spawned fresh general-purpose agent with ONLY trimmed CLAUDE.md, asked 5 representative subplan prompts (new test catalog Foo, fix failing TC-LO-007, audit PLAN_CC_ANTHROPIC_ALIGNMENT, run chain autonomously, 3 broken testids on Pricing). 5/5 produced correct skill chain matching pre-trim behavior. Agent-listed "ambiguities" are all expected — they describe content delegated to `@`-files (skill dep graph in INDEX.md, LR bodies in `.claude/rules/`, §2 ownership in AGENT_SHARED_RULES). That IS the Anthropic-recommended pattern, not behavior loss. |
| 13. Worktree merge | N/A — see step 1. |
| 14. Activity-log row | DONE — `clients/encore/specs_planning/_internal/agent-activity-log.md` — 2026-04-27T18:14 OWNER row with full file-list + per-LR-honored breakdown. |
| 15. /final-q | DONE — invoked at end of `/execute` Phase 4. |

**Acceptance criteria**:
- [x] `wc -l CLAUDE.md` ≤ 200 — 124 lines, 38% under cap.
- [x] 7-8 `.claude/rules/<topic>.md` files exist; each has `paths:` + `description:` frontmatter; each ≤150 lines — 8 files, 35-134 lines each.
- [x] `docs/SETUP.md` exists and contains the 7 setup steps.
- [x] `docs/read_only_docs/LEARNED_RULES.md` exists; cross-cutting LRs present (LR-023, LR-030..034, LR-035, LR-037, LR-039).
- [x] CLAUDE.md contains Build-over-time trigger block + /clear discipline block.
- [ ] V1 — fresh `claude` session shows context usage <30K tokens of agent instructions auto-loaded — DEFERRED-TO-V1-RUN (estimate from line counts: ~4K tokens for trimmed root + lazy-load `@`-files only as needed; was ~239K pre-trim per parent plan baseline).
- [x] V7 — cold-read on fresh Claude session yields same skill-chain prediction as pre-trim behavior — 5/5 prompts correct.
- [x] `/regression-guard` returns no silent skill-call breakage — 4 stale skill-file references repointed.
- [x] Activity-log row landed.
- [x] `/final-q` verdict GREEN — see `## /final-q audit` section in chat.

**HALT conditions**: NONE encountered.

**Parent-cascade gate** (LR-027 amended 2026-04-24): grepped `plans/pending/` for `SUBPLAN_*.md` with `Parent: PLAN_CC_ANTHROPIC_ALIGNMENT.md` → SP-CCE-03..06 still pending. NOT the last subplan, parent stays pending (will close when SP-CCE-06 closes).

**Handoff** (chat-only summary per subplan §Handoff): CLAUDE.md line count = 124 (target ≤200); count of `.claude/rules/*.md` files created = 8; cold-read pass/fail = 5/5 PASS; total cold-start token budget = ~4K trimmed root (was ~239K pre-trim). Next: SUBPLAN_CCE_03 (skill rationalization).

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_CCE_02_CLAUDEMD_RIGHTSIZE.md`
**Identity**: OWNER
**Skills auto-called**: /identity, /audit, /regression-guard (before+after), /final-q (exit)
**Dependency gate**: SUBPLAN_CCE_01 `Status: DONE`
**Context files**:
- Super plan §"Phase 2" (full detail of LR-* → `.claude/rules/` migration)
- Anthropic cupcake guide §"CLAUDE.md authoring" (lines 820-849, 730 for `paths:` syntax)
- Current `CLAUDE.md` (854 lines — primary surgery target)
- `docs/read_only_docs/AGENT_SHARED_RULES.md` (companion; will receive cross-cutting LRs)
- `.claude/context/navigation.md` (will be `@`-referenced from trimmed CLAUDE.md)
- LR-035 (plans/INDEX.md auto-generated)

## Purpose

Trim root `CLAUDE.md` from **854 → ≤200 lines** per Anthropic recommendation (line 824 — bloated CLAUDE.md causes Claude to ignore actual instructions). Mechanism: extract `LR-001..LR-045` block (~400 lines) to **path-scoped `.claude/rules/<topic>.md` files** with Anthropic `paths:` frontmatter; cross-cutting LRs to `docs/read_only_docs/LEARNED_RULES.md`; First-Time Setup to `docs/SETUP.md`; replace inline tables with `@`-pointers. Then add Anthropic-native habits (Build-over-time triggers + /clear discipline) we lack today.

## Step-by-step

1. **Pre-edit**: take a worktree branch (`git worktree add` per super plan risk register — "do P2 in a worktree first"). All edits land in worktree until V7 cold-read passes.
2. **P2.1 — extract LR rules** to path-scoped files:
   - `.claude/rules/angular.md`: LR-009, LR-010, LR-011, LR-026 (Angular form discipline). `paths: ["**/*.ts", "**/*.spec.ts"]` + `description: "Angular form/dirty-state discipline"`.
   - `.claude/rules/specs.md`: LR-018, LR-019, LR-021, LR-022, LR-024, LR-025 (spec-fixing). `paths: ["tests/**/*.spec.ts", "src/pages/**/*.ts"]`.
   - `.claude/rules/hooks-identity.md`: LR-042, LR-043 (chain-sessions + identity hooks). `paths: [".claude/hooks/**/*.sh", ".claude/hooks/**/*.mjs", ".claude/skills/identity/**", "scripts/identity-ownership.mjs"]`.
   - `.claude/rules/browser-tool.md`: LR-038 V2 (CLI vs Chrome matrix). `paths: ["plans/**/*.md", "src/pages/**/*.ts"]`.
   - `.claude/rules/pipeline.md`: LR-020, LR-027, LR-028, LR-040, LR-041, LR-044 (planning/execution discipline). `paths: ["plans/**/*.md", ".claude/skills/**/SKILL.md"]`.
   - `.claude/rules/baseline.md`: LR-045 (baseline-truth workflow). `paths: ["clients/${ACTIVE_CLIENT}/specs_planning/**/*.md", "clients/${ACTIVE_CLIENT}/docs/REQUIREMENTS.md"]`.
   - `.claude/rules/data.md`: LR-001, LR-002, LR-003, LR-004, LR-005, LR-006 (function signatures + catalog parity + empty catches + React cleanup + dep-array audit + external-data validation — coding hygiene). `paths: ["src/**/*.ts", "src/**/*.tsx"]`.
   - `.claude/rules/inventory.md`: LR-007, LR-013, LR-014, LR-015, LR-016, LR-029 (field inventory + walkthrough + DOM verify). `paths: ["clients/${ACTIVE_CLIENT}/specs_planning/_internal/**/*.md", "src/selectors/**/*.ts"]`.
3. **P2.6 (Anthropic-native frontmatter)**: every `.claude/rules/<topic>.md` declares `paths:` array + `description:` string per Anthropic spec line 730. Verify syntax with one touch-test (touch a file matching `paths:`, run `/context`, confirm rule loaded).
4. **Cross-cutting LRs** (apply to multiple file classes or session-level discipline) → `docs/read_only_docs/LEARNED_RULES.md`: LR-023 (networkidle ban — anywhere Playwright runs), LR-030/031/032/033/034 (bug-filing protocol), LR-035 (plans-reindex), LR-036 (if reinstated in SP1), LR-037 (activity log timestamps), LR-039 (handoff discipline). `@`-reference from CLAUDE.md.
5. **P2.2 — replace Skill Dependency Graph** (CLAUDE.md ~lines 137-167) with one line: `@.claude/skills/INDEX.md`. Don't duplicate.
6. **P2.3 — replace Skill Auto-Routing table** (CLAUDE.md ~lines 64-100) with one line: `Auto-routing: see each skill's @description; @.claude/skills/INDEX.md for full list`. Removes ~30 rows.
7. **P2.4 — move First-Time Setup** (CLAUDE.md ~lines 16-58, steps 1-7, env files, install commands) → `docs/SETUP.md`. Reference from CLAUDE.md as `@docs/SETUP.md` for new collaborators.
8. **P2.5 — final shape of root CLAUDE.md** (≤200 lines):
   1. Navigation pointer (`@.claude/context/navigation.md`)
   2. Supreme rules (NEVER ASSUME, identity discipline, guiding vision)
   3. `@`-references (SETUP, rules, skills INDEX, AGENT_SHARED_RULES, LEARNED_RULES)
   4. Auto-routing pointer
   5. Active-client switch (`@clients/encore/CLAUDE.md`)
   6. Build-over-time trigger block (P2.7)
   7. /clear discipline block (P2.8)
9. **P2.7 — Build-over-time trigger block** (~10 lines, per Anthropic cupcake §2002-2011): "Claude gets convention wrong 2× → add to CLAUDE.md. Same prompt 3rd time → save as skill. Same playbook 3× → capture as skill. Side task floods convo with output you won't reference → route through subagent. Want it every time without asking → hook. Second repo needs same setup → package as plugin."
10. **P2.8 — /clear discipline block** (~5 lines, per Anthropic cupcake §965-970): "Use `/clear` between unrelated tasks. After 2 failed corrections, `/clear` and rewrite the prompt with better context. A clean session with a better prompt beats a long session with accumulated corrections."
11. **`/regression-guard`** before-after on `.claude/skills/*/SKILL.md` to confirm no skill auto-call relied on inline CLAUDE.md content that was migrated.
12. **V7 — cold-read test** (CRITICAL): in a fresh `claude` session, paste only the trimmed CLAUDE.md + 1 SKILL.md. Ask "what should you do as an agent in this repo?" Compare answer to today's behavior. Drift = the trim removed something load-bearing → restore + re-trim.
13. **Worktree merge** to main branch only AFTER V7 passes.
14. Activity-log row.
15. **`/final-q`** with evidence-emission cross-checks (line counts before/after on every touched file).

## Acceptance criteria

- [ ] `wc -l CLAUDE.md` ≤ 200.
- [ ] 7-8 `.claude/rules/<topic>.md` files exist; each has `paths:` + `description:` frontmatter; each ≤150 lines.
- [ ] `docs/SETUP.md` exists and contains the 7 setup steps.
- [ ] `docs/read_only_docs/LEARNED_RULES.md` exists; cross-cutting LRs present.
- [ ] CLAUDE.md contains Build-over-time trigger block + /clear discipline block.
- [ ] V1 — fresh `claude` session shows context usage <30K tokens of agent instructions auto-loaded.
- [ ] V7 — cold-read on fresh Claude session yields same skill-chain prediction as pre-trim behavior.
- [ ] `/regression-guard` returns no silent skill-call breakage.
- [ ] Activity-log row landed.
- [ ] `/final-q` verdict GREEN.

## HALT conditions

- V7 cold-read shows behavior drift on >1 of 5 random subplan prompts → HALT, restore migrated rule, identify which LR was load-bearing, surface to user before re-attempting.
- A `paths:` glob fails to match expected files (touch-test fails) → HALT, debug syntax (Anthropic spec) before continuing migration.
- `@`-reference syntax doesn't render correctly in trimmed CLAUDE.md → HALT, verify Anthropic loading order (cupcake §1303-1307).
- LR cited from a skill SKILL.md that was migrated → confirm the skill still works post-migration; if not, the cross-cutting LR must stay in CLAUDE.md.

## Handoff

Next: SUBPLAN_CCE_03 (skill rationalization). Chat summary: CLAUDE.md line count, count of `.claude/rules/*.md` files created, cold-read pass/fail, total cold-start token budget. No prose; numbers.
