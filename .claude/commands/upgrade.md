---
description: Self-referential rule applicability check (alias — routes to /audit upgrade)
argument-hint: "[rule/skill name or implicit current-session check]"
---

Run the `audit` skill in `upgrade` mode. Pass through any arguments verbatim:

`/audit upgrade $ARGUMENTS`

When invoked with no arguments, scan the most recently created/modified rule, skill, or memory file against the current session's TodoWrite + git diff. See `.claude/skills/audit/SKILL.md` §UPGRADE.
