---
name: deploy
description: Deployment pipeline — type check, build, regression guard, code review, commit, push. Use when ready to ship, say "deploy", "push to prod", "ship it", "go live".
user-invocable: true
auto-calls: regression-guard, review
tools: Read, Bash, Glob, Grep, Agent
---

# /deploy — Deployment Pipeline

End-to-end deployment with safety checks at every stage. Catches problems before they reach the remote.

## When to Use

**Identity**: OWNER. Incompatible identity triggers a warning — see `/identity`.

- **Manual**: user says "deploy", "push to prod", "ship it", "go live", "push changes"
- After a `/chain` completes and user wants to push
- After implementing changes and user is satisfied

## Steps

### Phase 1: Pre-Flight Checks

1. **`git status`** — ensure working directory state is understood
   - If uncommitted changes: list them, ask user if they should be included
   - If nothing to commit and already pushed: tell user "nothing to deploy"
2. **Check `CURRENT_OWNER.md`** — confirm push token is ours (if multi-agent setup)
3. **`git pull --rebase`** — incorporate any remote changes
   - If conflicts: STOP and report. Do not auto-resolve merge conflicts during deploy.

### Phase 2: Type Check

1. **Root project**: `npx tsc --noEmit` (if tsconfig.json exists at root)
2. **Frontend**: `cd website/frontend && npx tsc --noEmit` (if exists)
3. **Backend**: `cd website/backend && npx tsc --noEmit` (if exists)

If ANY type errors: **STOP**. Report the exact errors. Do not proceed with broken types.

### Phase 3: Build

1. **Frontend**: `cd website/frontend && npm run build`
2. **Backend**: build step if applicable

If build fails: **STOP**. Report the exact error. Do not proceed with a broken build.

### Phase 4: Regression Guard

Auto-call `/regression-guard`:
- Scope: all files changed since the last push (`git diff origin/main...HEAD --name-only`)
- Review the report — if SILENT BREAKS found, STOP and fix

### Phase 5: Code Review

Auto-call `/review`:
- Scope: all changes being deployed (`git diff origin/main...HEAD`)
- If CRITICAL issues found, STOP and fix before deploying
- Important issues: report to user, let them decide

### Phase 6: Commit

1. **Stage changes** with specific file paths (never `git add -A`)
2. **Commit** with proper message format:
   - `type(scope): description` (e.g., `feat(skills): add regression-guard and bugfix skills`)
   - Types: feat, fix, chore, refactor, docs, test, style

Ask user to confirm the commit message before committing.

### Phase 7: Push

1. **`git push`** — with user confirmation
2. Verify push succeeded
3. If push fails (rejected, auth, network): report the error

### Phase 8: Post-Deploy

1. Update `.claude/context/CURRENT_STATE.md` with deployment info
2. If handing off to another agent: write HANDOFF message to channel

## Auto-Calls

- `/regression-guard` — Phase 4 (before commit)
- `/review` — Phase 5 (before commit)

## Output

```
## Deploy Report

### Pre-Flight
- Working directory: [clean / N uncommitted files]
- Remote sync: [up to date / pulled N commits / conflicts]

### Quality Gates
- Type check: [PASS / FAIL — details]
- Build: [PASS / FAIL — details]
- Regression guard: [CLEAN / REVIEW NEEDED / BLOCKED]
- Code review: [CLEAN / N issues (X critical, Y important)]

### Deployment
- Commit: [hash] [message]
- Push: [SUCCESS / FAILED — reason]

### Post-Deploy
- CURRENT_STATE.md: [updated / skipped]
```
