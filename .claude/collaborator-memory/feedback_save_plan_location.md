---
name: save-plan-location
description: Every plan must end up in the repo (plans/pending/ or plans/done/), not just in ~/.claude/plans/ scratch dir
type: feedback
originSessionId: b0a1877a-11f4-4681-b182-a84a59522a97
---
Every plan must end up in the repo at `plans/pending/` (if pending) or `plans/done/` (if executed/closed). The scratch dir at `~/.claude/plans/` is acceptable as a transient artifact (Claude Code plan-mode forces a write there before `ExitPlanMode`), but it MUST NOT be the only home. Mirror to repo before session end.

**Why**: scratch-dir plans are invisible to teammates, not version-controlled, not picked up by `npm run plans:reindex`, and lost when `~/.claude/plans/` is cleared. Repo plans are the single source of truth.

**How to apply**:
- When `/planning` or `/audit` produces a plan: if the work is done within the same session, write to `plans/done/PLAN_*.md` with full LR-027 frontmatter (Status DONE + Executed date + Execution Summary). If the work is pending, write to `plans/pending/PLAN_*.md`.
- Plan-mode (Claude Code's built-in) requires writing to `~/.claude/plans/<dreamy-noun-foo>.md` before `ExitPlanMode` — that's fine, but immediately after approval, mirror to repo with proper name + frontmatter.
- Add a `**Mirror of:**` line in the repo plan's frontmatter pointing back to the scratch-dir source for traceability.
- Run `npm run plans:reindex` after creating any new repo plan so INDEX.md picks it up (LR-035).

**Trigger phrases**: "save plan", "save to plans", "save in repo", "plans should be in repo", any user correction about a plan file's location.

**Why escalated to feedback memory (2026-05-07)**: I dropped an audit plan (`dreamy-finding-squid.md`) only into `~/.claude/plans/` and considered it saved. User correctly flagged "make sure whatever plans u do, are saved in repo as well, not just .claude.. dont be an idiot!" — the scratch dir is not a plan store, it's a plan-mode buffer. Every actionable plan ends up in the repo. Period.
