# SUBPLAN: Create `/nextweek` Skill — Prospective Weekly Outlook

**Status**: SUPERSEDED
**Superseded-On**: 2026-04-23
**Replaced-By**: `.claude/skills/next-this-week/SKILL.md` (skill already created this session; broader vision — Shield/Armor modes + no-lies/more-detail toggles — applied to /standup, /end-day, /end-week as well)
**Priority**: P5-PARKED
**Created**: 2026-04-22
**Parent**: PLAN_DELIVERABLE_QUALITY_UPGRADE.md
**Depends on**: SP-DQU-01
**Blocks**: none
**Model**: claude-sonnet-4-6
**Thinking**: hi
**PermissionMode**: auto

> **REPLACED BY** `.claude/skills/next-this-week/SKILL.md` authored 2026-04-23.
> Best practices from this subplan (Bootstrap block, Parent link, Acceptance Criteria, activity-log closeout) were folded into the new skill. The new skill goes further: canonical Shield example + Armor example, grab-handle list, DUMBASS + GRILL tests, Phase 0 mode detection, NO-LIES toggle, `/schedule` cron note, plans/INDEX.md gather path.
> `/chain` queue-build should skip this file (SUPERSEDED status).

---

## Bootstrap

**Invoke with**: `/execute SUBPLAN_DQU_33_K2_NEXTWEEK_SKILL.md`
**Identity**: OWNER
**Skills auto-called**: /identity
**Model + thinking**: Sonnet + medium
**Dependency gate**: SP-DQU-01 `Status: DONE`
**Context files**:
- `.claude/skills/standup/SKILL.md` (vocabulary + KILL LIST)
- `.claude/skills/end-week/SKILL.md` (weekly composition reference)
- `.claude/skills/today/SKILL.md` (sibling skill, same shape — create in SP-32 first ideally)
- `plans/INDEX.md`
- `plans/pending/` (for forward-looking priorities)

## Purpose

Prospective counterpart to `/end-week`. User invokes at start of week to get 5-8 plain-English bullets of "what I'll tackle next week" based on `plans/INDEX.md` + pending queue.

Private. Not indexed.

## Step-by-step

1. Create `.claude/skills/nextweek/SKILL.md` with frontmatter (mirror `/today`'s, description = "5-8 day forward outlook from plans/INDEX.md, plain English, private").
2. Body sections mirroring `/today` but 5-day window + slightly more bullets:
   - `## Output Format` (5-8 plain-text bullets, "Next week I will: [item]" OR grouped by day-of-week if plans have dated slots)
   - `## Phase 1: Gather` (read INDEX top block + `plans/pending/` by priority + historical `daily-status-bank.json` for "what I was going to do next")
   - `## Phase 2: Compose` (group by theme or by day if datable; name concrete modules; 1 bullet per theme)
   - `## Phase 3: Vocabulary` (inherit KILL LIST)
   - `## Phase 4: Canonical Example`:
     ```
     Next week I will finish the Local Information neutral-eye audit and apply the fixes to the CSV.
     I will also roll out the new Tags column across the remaining module test cases.
     Mid-week I will start on the pre-test and post-test cleanup patterns so specs do not break on leftover state.
     By Friday I will have the Allure report ready for the client and a first draft of the bug report package.
     ```
3. Verify parse. Smoke-test invoke.
4. Activity-log row.

## Acceptance criteria

- [ ] `.claude/skills/nextweek/SKILL.md` exists, frontmatter valid.
- [ ] NOT in `.claude/skills/INDEX.md`.
- [ ] Smoke-test output matches shape.
- [ ] Activity-log row.

## Handoff

Next: depends on user. Both skills shippable. Chat summary: `/today` and `/nextweek` live; user can invoke any time.
