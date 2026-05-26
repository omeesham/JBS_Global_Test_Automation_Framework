---
name: share-kt
description: Cross-repo knowledge transfer session — explore another repo, extract features/patterns/learnings, compare against ours, identify gaps, update KT log. Use when user says "KT", "knowledge transfer", "share learnings", "what can we learn from".
user-invocable: true
auto-calls: identity
tools: Read, Glob, Grep, Write, Edit, Bash, Agent, TodoWrite, TaskCreate, TaskUpdate, TaskList
---

# /share-kt — Cross-Repo Knowledge Transfer Session

When the user invokes `/share-kt`, follow this workflow to sync knowledge between repos.

## When to Use

**Identity**: OWNER. Auto-loaded via Identity Gate.

- User says "KT", "knowledge transfer", "share learnings", "sync with other repo"
- User wants to compare Encore with another codebase
- User wants to extract patterns from a reference repo

## Input
The user specifies which repo to learn from (default: `website/` for JBSIntelliQE).

## Identity Gate
Runs `/identity` Step 1.5 with caller=`/share-kt`. No-op if compatible identity active.

## Step 1: Read Previous KT
- Read `memory/reference_intelliqe_features.md` (or equivalent reference memory) to understand what was already captured
- Read the last KT vision plan if one exists in `plans/done/` or `plans/pending/`

## Step 2: Explore the Other Repo
Launch up to 3 Explore agents in parallel to scan:
1. **New features** — anything added since last KT (check git log, new files, changed services)
2. **Patterns & architecture** — how they solve problems we also face
3. **Claude Code usage** — their .claude/ folder, skills, memory, settings, workflows

## Step 3: Compare & Identify Gaps
For each finding, classify as:
- **We have better** — note what we do well (share back opportunity)
- **They have better** — note what we should replicate (sub-plan candidate)
- **Neither has** — note as shared gap (potential joint improvement)

## Step 4: Update Knowledge
- Update `memory/reference_intelliqe_features.md` with new findings
- If significant, create a new vision plan in `plans/pending/`

## Step 5: Share Back (Optional)
If we have features/patterns worth sharing:
- Write a summary of our strengths to `.claude/channel/broadcast/BROADCAST.md` (if channel system exists)
- Or save as a shareable document the colleague's agent can read

## Auto-Calls

None — this is a standalone skill.

## Output
A concise summary of:
- What's new in their repo
- What gaps we identified
- Recommended sub-plans for replication
- What we can share back


## Verification Artifact (D23)

Before declaring this skill done, emit one runnable / readable check the user (or next session) can re-run to confirm the output:

- File path + expected content (e.g., `plans/pending/X.md exists with **Status**: Pending`)
- Bash command + expected output (e.g., `git diff --stat ...` shows N files)
- Test command (e.g., `npm run typecheck`, `npx tsc --noEmit`)
- Or a structured expected-output template (≤10 lines)

Verification artifact ≠ prose summary. It is a runnable / readable check that confirms the skill's output. Without it, the work is unaudítable. Anthropic cupcake §786-793 — single highest-leverage tactic for AI-built artifacts.
