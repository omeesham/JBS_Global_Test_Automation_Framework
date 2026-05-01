# SUBPLAN: Create `/today` Skill — Prospective Daily Priority Summary

**Status**: Pending
**Priority**: P2-CYCLE-3
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-01
**Blocks**: none
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_32_K1_TODAY_SKILL.md`
**Identity**: OWNER
**Skills auto-called**: /identity
**Model + thinking**: Sonnet + medium
**Dependency gate**: SP-DQU-01 `Status: DONE`
**Context files**:
- `.claude/skills/standup/SKILL.md` (structural template — copy frontmatter + vocabulary discipline)
- `.claude/skills/end-day/SKILL.md` (private-skill pattern reference)
- `plans/INDEX.md` (source of priority data)
- `clients/encore/specs_planning/_internal/daily-status-bank.json` (continuity signal)

## Purpose

Prospective counterpart to `/end-day`. User invokes at start of day to get 3-5 plain-English bullets of "what I'll work on today" based on `plans/INDEX.md` top-priority block + active TodoWrite.

Private skill (same pattern as `/end-day`, `/end-week`, `/standup`). NOT listed in `.claude/skills/INDEX.md`.

## Step-by-step

1. Create `.claude/skills/today/SKILL.md` with frontmatter:
   ```yaml
   ---
   name: today
   description: Generate a short, plain-English "what I'll do today" summary from plans/INDEX.md top-priority block. Private skill.
   user-invocable: true
   auto-calls: none
   tools: Read, Glob, Grep, Bash
   ---
   ```
2. Body ≤80 lines, sections:
   - `# /today — Prospective Daily Priority Summary`
   - `**PRIVATE SKILL** — gitignored, never committed.`
   - `## Output Format` (3-5 plain-text bullets, "Today I will: [item]", 1 sentence each)
   - `## When to Use` (start of day, before planning work)
   - `## Phase 1: Gather` (read INDEX top block, pending/ priorities P0 first, active TodoWrite, last `daily-status-bank.json` entry for continuity signal)
   - `## Phase 2: Compose` (pick 3-5 highest-priority items; name concrete modules + features; no jargon)
   - `## Phase 3: Vocabulary` (inherit KILL LIST from `/standup`: Playwright, selectors, fixtures, MCP, agent, Claude, etc.)
   - `## Phase 4: Canonical Example` (GOLD STANDARD):
     ```
     Today I will continue the History pivot work on Local Office Basic Info, then roll the same catalog to the Pricing tab.
     After that I will start reviewing Local Information test cases for requirements coverage.
     If time permits I will also prep the Allure report for this week's runs.
     ```
   - `## Rules` (private; no subplan numbers; continuity signal when yesterday was same theme)
3. Verify skill file parses (frontmatter valid, no YAML errors).
4. Smoke-test: invoke `/today` in a scratch session, verify output matches format.
5. Activity-log row.

## Acceptance criteria

- [ ] `.claude/skills/today/SKILL.md` exists, ≤80 lines, frontmatter valid.
- [ ] NOT in `.claude/skills/INDEX.md` (private).
- [ ] Smoke-test output matches Phase 4 canonical shape.
- [ ] Activity-log row.

## Handoff

Next: SP-DQU-33 (/nextweek skill — same pattern, 5-8 bullets, 5-day forward window).
