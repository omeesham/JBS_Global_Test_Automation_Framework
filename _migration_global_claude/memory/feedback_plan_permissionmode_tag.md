---
name: PermissionMode tag matches plan type
description: When authoring a plan, tag planning-type as `plan` and execution-type as `auto`/`acceptEdits` — not all `auto`.
type: feedback
originSessionId: 8b5f32a6-c597-4eb6-a773-31d62b68f56f
---
When authoring any new plan file (via `/planning` or manually), the `**PermissionMode**:` frontmatter field must match the plan's output type:

- **Planning-type** (output = another plan file; typically `PLAN_*` that spawns subplans, or any file with `Skills: /planning`) → `**PermissionMode**: plan`
- **Execution-type** (output = code/config edits; typically `SUBPLAN_*` or `Skills: /execute`) → `**PermissionMode**: auto` / `acceptEdits` / `bypassPermissions` per need

**Why**: Rutvik spotted the `plans/INDEX.md` `Perm` column showing `auto` on planning-type rows (2026-04-24) and called it a wrong tag. Planning sessions don't need code-write capability — `plan` mode is the right restriction. LR-041 in `CLAUDE.md` now lists `plan` as a legal value with this guidance attached.

**How to apply**: at plan authoring time, glance at the filename + Skills field. If it produces plans, tag `plan`. If it produces code, pick one of the other three. Do NOT default to `auto` for everything. No HALT gate — user explicitly rejected structural enforcement as over-engineering; this is authoring discipline, not a hook.

**Precedent**: 2 files already fixed — `PLAN_PLAYWRIGHT_CLI_PRIMARY_CHROME_SPECIALIST.md`, `godsplan.md`. Both flipped `auto` → `plan` on 2026-04-24.
