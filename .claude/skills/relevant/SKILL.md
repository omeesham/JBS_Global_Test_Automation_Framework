---
name: relevant
description: Pre-task skill scanner — reads task, maps subtasks to available skills, injects skill tags into TodoWrite items. Use at session start or before complex multi-step work. Say "/relevant" or "check skills".
user-invocable: true
auto-calls: none
tools: Read, Glob, Grep, TodoWrite
---

# /relevant — Pre-Task Skill Injection

Scans available skills and maps each subtask to the best-fit skill before work begins. Prevents agents from reinventing what skills already provide.

## When to Use

**Identity**: ALL. No identity restrictions.

- User says `/relevant`, "check skills", "what skills should I use"
- Auto-called by `/execute` Phase 0.5 (before building TodoWrite list)
- Auto-called by `/chain` Phase 0.5 (per plan, before Phase 4 handoff)
- Complex multi-step task where manual skill tagging might miss coverage

## Identity Gate
None — this is a utility skill available to all identities.

## Step 1: Read Skill Index

Read `.claude/skills/INDEX.md` — a single file with one line per skill containing name, triggers, and match types.

- Read ONCE per session, cache mentally
- ~2 seconds, 1 file read (not 17)
- If INDEX.md is missing or stale, fall back to globbing `.claude/skills/*/SKILL.md` and reading descriptions

## Step 2: Decompose Task

Break the user's request into discrete subtasks:

- **If a plan exists** → use the plan's numbered steps/sections as subtasks (already decomposed)
- **If user request** → split by action verbs: "fix X, then add Y, then verify Z" → 3 subtasks
- **If ambiguous** → ask the user to list what they want done (max 1 question)
- Each subtask = one sentence: `[verb] [what] [where]`
- **Sonnet-specific**: MUST write subtasks to TodoWrite BEFORE matching (makes decomposition auditable)

## Step 2.5: Agent-Mistakes Grep (advisory tags)

For each subtask, grep `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md` for keyword matches:

```bash
grep -niE "<subtask-keyword-1>|<keyword-2>" clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md
```

For each `MIS-XXX` / `ALL-XXX` / `GEN-XXX` / etc. hit, flag as **advisory** TodoWrite tag (not blocking). Format: `MIS-013(don't bypass save dialog)` — same parens-required syntax as `LR-NNN(reason)` so the hook regex accepts it.

Why advisory: graduated mistakes BECOME `LR-NNN` per `/compile-learnings`. The parallel taxonomy is informational — once graduated, the LR rule is the binding form. Until graduation, the agent-mistakes hit is a strong hint, not a hard contract.

## Step 2.6: LR-Rule Path-Glob Grep (binding tags)

For each subtask, grep `.claude/rules/*.md` for `paths:` glob matches against the files the subtask will touch:

```bash
grep -lE "paths:" .claude/rules/*.md | xargs -I{} sh -c 'head -10 "{}" | grep -q "<file-path-pattern>" && echo "{}"'
```

For each LR-NNN found in a matching rule pack, tag the subtask `LR-NNN(reason)`. Multiple rules per subtask is fine. These are **binding** tags — `/final-q` Step 4.5 cross-checks LR-tagged todos to ensure the rule was actually followed (e.g., LR-028 tagged → activity-log row landed).

Also scan cross-cutting rules in `docs/read_only_docs/LEARNED_RULES.md` for triggers that match the subtask description.

## Step 2.7: Patterns.md Decision-Tree Match (advisory tags)

If the subtask matches a decision tree in `.claude/context/patterns.md` (e.g., spec-fixing start, Radix UI dropdowns, Angular save→tab race), tag with `[manual](patterns.md §<section> applies)`. Pattern references are advisory — they document the recommended approach but don't have a binding obligation like LR rules do.

## Step 3: Match Subtasks to Skills

For each subtask, check against INDEX.md triggers. Assign a match type:

| Match Type | Meaning | Example |
|---|---|---|
| **DIRECT** | Subtask IS the skill's job | "fix failing test" → `/bugfix` |
| **WRAP** | Skill should run before+after | any code change → `/regression-guard` |
| **INFORM** | Skill should run first for context | unfamiliar API → `/research` |
| **VERIFY** | Skill should run after to check | after implementation → `/audit` |
| **NONE** | No skill covers this subtask | documentation edit → `[manual]` |

Multiple skills can match one subtask (e.g., INFORM + WRAP + VERIFY for a complex change).

## Step 4: Inject as TRACKED Tags into TodoWrite (not binding)

Tag each todo item with matched skills + LR rules + agent-mistakes hits + patterns. Per SP02B (TodoWrite Tagging Contract in `.claude/rules/pipeline.md`), tags are **TRACKED, not binding** — `/relevant` injects them as suggestions; the agent decides whether to actually invoke each tagged skill.

`/final-q` Step 6 reclassifies any todo whose `[/skill:direct]` tag was injected here but the named skill was never invoked → `screwed` row. So a `direct` match is a high-confidence claim — only inject `direct` when the subtask IS the skill's job.

Required tag format (per `.claude/rules/pipeline.md` § "TodoWrite Tagging Contract" — closed 4-type taxonomy enforced by hook):

```
[/research:inform] Understand Radix combobox API before implementing filter
[/regression-guard:wrap] Modify page object — snapshot before+after
[/audit:verify] Post-implementation check — verify all plan items executed
[manual](docs edit) Update REQUIREMENTS.md line 791
LR-007(verify before code) Pre-flight check — test data constants exist live
MIS-013(don't bypass save dialog) Click Save then handle dialog — page object change
```

Multi-tag per item allowed: `[/regression-guard:wrap] LR-009(angular dirty) [ceremony]` is valid when an Angular-form edit is wrapped by regression-guard, governed by LR-009, AND counts as a closure ceremony obligation.

## Step 5: Gap Report

```
Skills injected: 8/12 subtasks covered
Gaps (manual): 4 subtasks with no skill match
  - Update REQUIREMENTS.md line 791 (documentation edit)
  - Update test plan doc counts (artifact bookkeeping)
```

## Overlap Note

`/execute` Phase 0.5 already tags TodoWrite items with skills — but relies on agent memory of all skills. `/relevant` is most valuable for:
- **(a)** Sonnet (weaker skill awareness)
- **(b)** Ad-hoc work outside `/execute`
- **(c)** Complex tasks where manual tagging misses skills

For simple `/execute` runs with clear plans, `/relevant` adds minimal value and can be skipped.

## Output

The tagged TodoWrite list + gap report from Step 5.

## Rules

- NEVER skip skill scanning — even "simple" tasks may have skill coverage
- NEVER force a skill where none fits — `[manual]` is a valid tag
- Read INDEX.md ONCE per session — don't re-read per subtask
- Skill matches are SUGGESTIONS — the agent decides whether to actually invoke
- If INDEX.md is missing, create it as part of this invocation (read all SKILL.md files, generate index)
