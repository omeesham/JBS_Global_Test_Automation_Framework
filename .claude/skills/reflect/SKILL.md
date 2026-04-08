---
name: reflect
description: Session-end retrospective — capture mistakes, update memory files, flag graduation candidates. Use at session end, after major tasks, or say "reflect" or "what did we learn".
user-invocable: true
auto-calls: none
tools: Read, Glob, Grep, Write, Edit
---

# /reflect — Session Retrospective

Captures what was learned during this session and persists it to memory so future sessions benefit. Belt-and-suspenders with blocking mistake capture — this catches what was missed in the moment.

## When to Use

**Identity**: ALL. No identity restrictions for this skill.

- **End of session** (before the user leaves)
- **After major task completion** (post-/execute, post-/chain)
- **Auto-called** by `/execute` (after Phase 3 post-audit)
- **Auto-called** by `/bugfix` (after documentation phase)
- **Manual**: user says "reflect", "what did we learn", "session retrospective", "save learnings"

## Steps

### Step 1: Scan Session Work

Review what happened in this session:

1. **Files changed** — `git diff --stat` or recall from session context
2. **Plans executed** — which plans moved from pending/ to done/?
3. **Errors encountered** — what went wrong and how was it resolved?
4. **User corrections** — did the user redirect or correct your approach?
5. **Approach changes** — did you start with plan A and switch to plan B?

### Step 2: Apply the 6 Mistake Triggers

Check each trigger against the session. If ANY fired, it's a learning to capture:

| # | Trigger | Did it happen? |
|---|---------|---------------|
| 1 | User corrected you | What was wrong? What did they say? |
| 2 | Retry was needed (first attempt failed) | What failed? Why? What fixed it? |
| 3 | Unexpected state encountered | What did you expect vs. find? |
| 4 | Output didn't match evidence | What did you claim vs. reality? |
| 5 | Command errored out | What command? What error? Resolution? |
| 6 | Approach changed mid-task | Original approach? Why abandoned? New approach? |

### Step 3: Categorize Learnings

For each learning identified, classify as:

- **Mistake** → goes to `specs_planning/_internal/agent-mistakes.md` (with proper ID: next sequential R-number)
- **Pattern** → goes to relevant memory file (new pattern that worked well, worth repeating)
- **Preference** → goes to feedback memory file (user style/approach correction)
- **Reference** → goes to reference memory file (external resource or technique discovered)

### Step 4: Update Memory Files

1. **Mistakes**: Append to `specs_planning/_internal/agent-mistakes.md` following existing format
2. **Patterns**: Write to appropriate memory file in `.claude/projects/.../memory/` — update existing file if topic matches, create new if novel
3. **Preferences**: Write to `feedback_*.md` in memory directory
4. **References**: Write to `reference_*.md` in memory directory
5. **Update MEMORY.md index** if any new files were created

### Step 4.5: Upgrade Check (self-referential improvement)

If Step 4 wrote any new mistakes or patterns, run `/upgrade` logic inline:

1. For each new rule/pattern just captured, extract its TRIGGER and SCOPE
2. Scan the current session's active TodoWrite items and recently modified files
3. Check: does this new rule apply to anything we did or are doing RIGHT NOW?
4. If yes: flag as `APPLY NOW` — the agent should fix before session ends
5. If no: note why and move on

This catches the "I just wrote a rule I'm violating" pattern. See `/upgrade` SKILL.md for full methodology.

### Step 5: Check for Graduation Candidates

Scan `specs_planning/_internal/agent-mistakes.md` for patterns with **3+ occurrences** (similar root cause or same rule violated repeatedly).

If found, flag them:
```
GRADUATION CANDIDATES (3+ occurrences — run /compile-learnings):
- Pattern: [description] — seen in R-XX, R-YY, R-ZZ
```

## Auto-Calls

None — this is a leaf skill. Called BY `/execute`, `/bugfix`, `/audit`, and `/chain`.

## Output

```
## Session Retrospective

### Learnings Captured: [N total]
- Mistakes: [count] → agent-mistakes.md
- Patterns: [count] → [which memory files]
- Preferences: [count] → [which feedback files]
- References: [count] → [which reference files]

### Memory Files Updated
- [file1] — [what was added]
- [file2] — [what was added]

### Graduation Candidates
- [any patterns with 3+ occurrences, or "None found"]

### Session Quality
- Corrections received: [count]
- Retries needed: [count]
- Clean executions: [count]
```
