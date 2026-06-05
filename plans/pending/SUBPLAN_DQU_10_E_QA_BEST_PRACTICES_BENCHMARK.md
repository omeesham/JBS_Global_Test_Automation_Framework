# SUBPLAN: QA Best-Practices Research + Benchmark vs Our Work

**Status**: Pending
**Priority**: P2-CYCLE-3
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-01
**Blocks**: none (feeds recommendations to downstream subplans)
**Model**: claude-opus-4-8
**Thinking**: xhi
**PermissionMode**: auto

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_10_E_QA_BEST_PRACTICES_BENCHMARK.md`
**Identity**: WATCHDOG
**Skills auto-called**: /identity, /research, /audit
**Model + thinking**: Opus + high (synthesis-heavy)
**Dependency gate**: SP-DQU-01 `Status: DONE`
**Context files**:
- `clients/encore/specs_planning/_internal/tc-authoring-rules.md`
- `clients/encore/specs_planning/test-cases/setup/local-office/local_office_settings_test_cases.md` (sample artifact to benchmark — Basic Information tab; sibling files for HIS + ECT post-2026-05-05 split)
- `clients/encore/test_cases_csv/local_office_settings_test_cases.csv` (sample CSV)
- `.claude/skills/research/SKILL.md` (skill definition for /research)
**Phase 0 directive**: no browser required (research is web-based via /research skill). Announce in chat.
**HALT conditions**:
- /research skill unavailable → stop, ask user.

---

## Purpose

Research 2-10 authoritative sources on QA test-case authoring + coverage best practices. Benchmark our current artifacts. Produce a gap list with severity + recommended action. Feed into SP-DQU-11..20 (remaining-module audits) and SP-DQU-21..25 (spec health).

## Step-by-step

1. Invoke `/research` with scoped prompt: "Best practices for manual QA test case authoring — coverage strategies (ISTQB, risk-based, exploratory), test-type tagging conventions, human-readability standards, requirement traceability, edge-case enumeration patterns, pre-test/post-test state hygiene. 2026-era industry practice, Angular+SPA context."
2. Cross-reference with `feedback_bug_pattern_learning.md` + existing `tc-authoring-rules.md` + any internal QA docs.
3. Produce `clients/encore/specs_planning/_internal/qa-benchmark-2026-04-22.md` with sections:
   - `## Sources consulted` (2-10 URLs with 1-line takeaway each)
   - `## Our current approach` (short summary of our 6 rules + tag system + test-data-from-MCP pattern)
   - `## Industry best practices (synthesized)` (top 10 patterns)
   - `## Gap analysis` (table: practice, status=have/partial/missing, recommended action, severity)
   - `## Recommendations feeding downstream SPs` (per SP-DQU-11..20, SP-21..25 — concrete nudges)
   - `## Scoped out — intentional non-adoption` (patterns we explicitly skip + why)
4. Activity-log row.

## Acceptance criteria

- [ ] Benchmark doc exists.
- [ ] 2-10 sources cited.
- [ ] Gap table has at least 10 rows with severity ranking.
- [ ] Downstream-SP feed recommendations labeled by target SP ID.
- [ ] Activity-log row.

## Handoff

Next: none (feeds into F/G tracks). Chat summary: top 3 gaps, top 3 adoption recommendations.
