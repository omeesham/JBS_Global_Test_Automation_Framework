---
name: share-kt
description: Cross-repo knowledge transfer session — explore another repo, extract features/patterns/learnings, compare against ours, identify gaps, update KT log. Use when user says "KT", "knowledge transfer", "share learnings", "what can we learn from".
user-invocable: true
auto-calls: none
tools: Read, Glob, Grep, Write, Edit, Bash, Agent, TodoWrite
---

# /share-kt — Cross-Repo Knowledge Transfer Session

When the user invokes `/share-kt`, follow this workflow to sync knowledge between repos.

## When to Use

**Identity**: OWNER. Incompatible identity triggers a warning — see `/identity`.

- User says "KT", "knowledge transfer", "share learnings", "sync with other repo"
- User wants to compare Encore with another codebase
- User wants to extract patterns from a reference repo

## Input
The user specifies which repo to learn from (default: `website/` for JBSIntelliQE).

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
