---
name: review
description: PR-style code review against standards — actionable feedback with fix plan. Different from /audit (which checks full execution chains). Use for reviewing specific code changes, say "review", "check this code", "code review".
user-invocable: true
auto-calls: none
tools: Read, Glob, Grep, Bash
---

# /review — Code Review

Focused code review of specific changes. This is NOT `/audit` — audit traces the full chain (prompt → intent → plan → execution → outcome). `/review` zooms in on the code itself: is it correct, clean, and convention-compliant?

## When to Use

- **Auto-called** by `/deploy` (before commit)
- **Manual**: user says "review", "check this code", "code review", "look at this PR", "is this good"
- After implementing changes, before committing
- When reviewing someone else's code or a colleague's PR

## Steps

### Step 1: Determine Scope

Identify what to review:
- **Specific files** named by user
- **All uncommitted changes**: `git diff` + `git diff --cached`
- **Specific commit range**: `git diff <from>..<to>`
- **A PR**: `git diff main...HEAD`

### Step 2: Read Everything in Scope

Read every file in scope **completely**. No skimming. No shortcuts.

### Step 3: Review Against Standards

Check each dimension. For every issue found, note the exact file:line and a concrete fix.

#### Correctness
- Does the code do what it claims? Logic errors? Off-by-one?
- Missing null/undefined checks where data could be absent?
- Async operations: are promises awaited? Error paths handled?

#### Conventions
- Does it follow existing codebase patterns? (naming, file structure, import style)
- Are new patterns introduced unnecessarily when existing patterns would work?

#### DRY
- Is there duplication that should use existing utilities?
- Grep for similar code elsewhere — could this be consolidated?

#### Types (TypeScript)
- Are types correct and specific? No unnecessary `any`?
- Are return types explicit where they should be?
- Do interfaces/types match their actual usage?

#### Error Handling
- Are error paths handled? Are errors swallowed silently?
- Do try/catch blocks log or propagate meaningfully?
- Are user-facing errors helpful, not cryptic?

#### Security
- Hardcoded secrets, API keys, credentials?
- SQL injection, XSS, or command injection vectors?
- Sensitive data in logs or error messages?

#### Performance
- Obvious N+1 queries or repeated expensive operations?
- Unnecessary re-renders in React components?
- Missing memoization where computation is heavy?

#### Readability
- Would a new team member understand this without explanation?
- Are variable/function names self-documenting?
- Is the code flow linear and easy to trace?

### Step 4: Produce Review Report

## Auto-Calls

None — this is a standalone review skill.

## Output

```
## Code Review: [scope description]

### Issues Found: [N total]

#### Critical (must fix before merge)
- [file:line] [description] → fix: [concrete suggestion]

#### Important (should fix)
- [file:line] [description] → fix: [concrete suggestion]

#### Nitpicks (optional, style preferences)
- [file:line] [description]

### What's Good
- [at least one positive observation — always acknowledge good work]

### Fix Plan (if issues found)
1. [ordered steps to address critical + important issues]
2. ...
```
