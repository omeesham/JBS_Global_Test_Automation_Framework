---
name: cleanup
description: Codebase hygiene — dead code removal, unused imports, orphaned files, stale references, duplicate consolidation. Use when codebase feels bloated or say "clean up", "dead code", "remove unused".
user-invocable: true
auto-calls: regression-guard
tools: Read, Glob, Grep, Bash, Write, Edit, Agent
---

# /cleanup — Codebase Hygiene

Finds and removes dead weight from the codebase. This is destructive work — always presents findings before removing anything.

## When to Use

- **Manual**: user says "clean up", "dead code", "remove unused", "orphaned files", "consolidate", "hygiene"
- After major refactors or feature removals
- When file count or code size grows suspiciously

## Steps

### Step 1: Scope

User specifies area (e.g., `src/`, `website/`, or "everything"). Default: entire repo.

### Step 2: BEFORE Snapshot

Auto-call `/regression-guard` Phase 1 on all files in scope.

### Step 3: Scan for Dead Code

Launch Explore agents (up to 3) to find:

1. **Unused exports** — for each `export` in scope, grep the codebase: is it imported anywhere outside its own file?
2. **Unused imports** — for each `import` in a file, is the imported name actually used in the file body?
3. **Orphaned files** — files not imported/required by anything (check: is any other file importing this?)
4. **Stale references** — strings, paths, or comments that reference deleted files/functions
5. **Duplicate patterns** — near-identical code blocks across files that should be a shared utility

### Step 4: Categorize Findings

| Category | Criteria | Action |
|----------|----------|--------|
| **Safe to remove** | Zero references anywhere in codebase | Remove after user confirms |
| **Probably safe** | Only self-referenced, or only in comments/docs | Present to user, recommend removal |
| **Needs review** | Has references but those references may also be dead (transitive) | Flag for user decision |

### Step 5: Present Findings

Show the user a structured report BEFORE making any changes:
```
Found [N] dead code items:
- [count] unused exports (safe to remove)
- [count] unused imports (safe to remove)
- [count] orphaned files (probably safe)
- [count] stale references (safe to remove)
- [count] potential duplicates (needs review)

Proceed with cleanup? yes/no/selective
```

### Step 6: Execute Approved Removals

After user confirms, remove the approved items. Track every removal.

### Step 7: AFTER Snapshot

Auto-call `/regression-guard` Phase 2. Review the diff — ensure only intended removals occurred.

### Step 8: Verify Build

Run type-check if applicable: `npx tsc --noEmit`
If build breaks, something was NOT actually dead — investigate and restore.

## Auto-Calls

- `/regression-guard` — Phase 1 (before cleanup) and Phase 2 (after cleanup)

## Output

```
## Cleanup Report

### Scan Scope: [directory/files]
### Files Scanned: [N]

### Dead Code Found: [total items]
- Unused exports: [count]
- Unused imports: [count]
- Orphaned files: [count]
- Stale references: [count]
- Duplicates: [count]

### Removed: [count items]
- [file:line] — [what was removed and why]

### Kept (user chose not to remove): [count]
- [item] — [reason kept]

### Regression Guard: [CLEAN / issues found]
### Build Check: [PASS / FAIL]
```
