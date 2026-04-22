---
name: planning
description: Create a rigorously audited implementation plan — explores codebase, drafts plan, runs validation checklist, reviews against original intent, then saves to plans/pending/. Use when user says "plan", "design", "how should we".
user-invocable: true
auto-calls: research
tools: Read, Glob, Grep, Write, Edit, Bash, Agent, TodoWrite
---

# /planning — Rigorous Plan Creation Workflow

When the user invokes `/planning`, follow this exact workflow. Do NOT skip steps.

## When to Use

**Identity**: OWNER. Auto-loaded via Identity Gate.

- User says "plan", "design", "how should we", "create a plan", "approach"
- User describes a feature or change without saying "just do it"
- Complex multi-file changes that need thought before execution

## Input
The user will describe what they want planned. If their description is vague, ask HIGH-IMPACT clarifying questions before proceeding.

## Identity Gate
Runs `/identity` Step 1.5 with caller=`/planning`. No-op if compatible identity active.

## Step 0: Research (if unfamiliar territory)

Auto-call `/research` if the topic involves:
- Technology or patterns not yet used in this codebase
- External APIs or services you haven't worked with
- Architecture decisions with multiple valid approaches
- Anything where "I think this is how it works" — look it up

**Skip** if the topic is purely internal refactoring of well-understood code.

## Step 1: Explore
- Use Explore agents (up to 3 in parallel) to understand the codebase areas relevant to the request
- Identify existing patterns, utilities, and conventions that must be respected
- Map out all files that would be affected

## Step 2: Draft the Plan
Write an initial plan covering:
- **Context**: Why this change is needed, what prompted it, intended outcome
- **Changes**: Specific files, specific lines, exact before/after where possible
- **NOT touched**: Files explicitly excluded and why
- **Verification**: How to test the changes end-to-end

## Step 3: Validation Pass

Complete this checklist in a single pass. Fix any issues found before proceeding to Step 4.

- [ ] **Reference check** — Open the most recent completed plan in `plans/done/` for the same category. Compare section-by-section. Flag any section present in the reference that's missing in yours. If no reference exists, use the most complex completed plan as baseline.
- [ ] **Rules applied** — For each rule listed in your plan's "Active Rules" section (or equivalent), verify it's actually reflected in the plan body (implementation steps, code snippets, or explicit exclusion with reason). Rule listed but not applied = gap.
- [ ] **Mistakes check** — Grep for the target page/module name in `clients/${ACTIVE_CLIENT}/specs_planning/_internal/agent-mistakes.md`. Read every hit. Verify none of the documented mistakes are repeated in your plan. Also grep for any function names or patterns your plan proposes to use.
- [ ] **Model + Thinking + PermissionMode declared** (LR-041 / D17 rubric) — every new subplan file has `**Model**:`, `**Thinking**:`, and `**PermissionMode**:` in frontmatter. FORBIDDEN: Sonnet `lo`/`max` (under-thinks / clamps); Opus `lo`/`mid` (promote to Sonnet `hi` instead). Sonnet `mid` and Opus `max` require a one-sentence justification in the subplan body. `bypassPermissions` requires `**RiskAcknowledged**: true` in frontmatter.

## Step 4: Intent Review
- Re-read the user's original request word by word
- Compare every claim in the plan against the actual codebase (verify, don't assume)
- Confirm the plan actually delivers what was asked — not more, not less

## Step 5: Save
- Determine the next plan number by checking `plans/pending/` and `plans/done/` for the highest existing PLAN_XX number
- Save the final plan to `plans/pending/PLAN_XX_<DESCRIPTIVE_NAME>.md`
- Present a concise summary to the user

## Step 6: MANDATORY — Embed SESSION BOOTSTRAP block at top of every subplan

**User preference (absolute rule)**: every subplan file must be executable cold with ONLY `/execute <filename>` — zero additional prompting. The user should never have to tell a session "remember to load identity, check dependencies, do Phase 0 first, etc."

For every subplan file you author, the FIRST content (before the `# SUBPLAN SP-XX: Title` heading) must be a SESSION BOOTSTRAP blockquote containing:

1. Explicit statement: "To run: `/execute <this-filename>` — that is all."
2. Numbered bootstrap sequence the agent follows on load:
   - Load identity (per `**Identity**` frontmatter field)
   - Load skills (per `**Skills**` frontmatter field, including auto-calls)
   - Resolve model + thinking tier (from master plan's execution-order table, or inline in the subplan)
   - Dependency gate — verify every `**Depends on**` item is DONE or N/A; HALT if blocked
   - Read required context files (master plan sections, catalogs, etc.)
   - Resolve browser tool (Claude in Chrome vs Playwright MCP) per LR-038 if subplan interacts with a live app
   - Execute Phase 0 (if present) before any edits
   - Execute remaining Step-by-Step phases
   - Handoff: flip Status/Executed, append activity-log row, git mv, reindex
3. HALT + ASK USER conditions (never silently proceed):
   - Dependency blocker
   - Scope ambiguity beyond KEEP list
   - Phase 0 discovers >30% scope extension
   - Regression-guard shows unrelated changes
   - Activity-log LR-037 preflight would fail

**CRITICAL PARSER NOTE**: Do NOT put the literal strings `**Status**: DONE` or `**Executed**: <date>` (with markdown bold + colon) inside the bootstrap block — the `plans-reindex.mjs` regex parses these as frontmatter fields and will incorrectly mark the subplan as DONE. Use paraphrased language: "flip the Status field to DONE", "add the Executed date", etc. Same for any other labels the reindex watches: Status, Priority, Created, Executed, Parent.

**Template to adapt** (starting point — customize per subplan's specifics):

```markdown
> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute <this-filename>`. All context below.**
>
> The agent self-bootstraps using the frontmatter + sections in this file. On invocation, it follows this sequence **without any additional user prompting**:
>
> 1. **Identity**: load /identity per the Identity field below.
> 2. **Skills**: load every skill in the Skills field below (leading skill auto-calls its chain).
> 3. **Model + thinking + permission-mode**: read `**Model**:`, `**Thinking**:`, `**PermissionMode**:` from this subplan's frontmatter (all three required per LR-041). If absent (grandfathered file), defaults are Sonnet → `hi`, Opus → `xhi` (clamped to `high` on CLI < 2.1.111 — see chain-orchestrator header), permission-mode `auto`. If Phase 0 is present in Step-by-Step, bump thinking tier one notch.
> 4. **Dependency gate**: verify every item in the Depends-on field is DONE in plans/done/ or N/A. HALT if blocker.
> 5. **Context load**: read master plan §1-§3 + this subplan in full.
> 5.5. **Browser tool selection (if this subplan browses a live app)**: select per LR-038. Announce choice + reason in first output.
> 6. **Phase 0 FIRST (if present)**: execute Phase 0 date-forensic self-discovery before any edits.
> 7. **Execute Phases 1+** per Step-by-Step.
> 8. **Handoff**: flip Status field to DONE + add Executed date, append activity-log row (LR-028 + LR-037), git mv to plans/done/, npm run plans:reindex, commit.
>
> **HALT + ASK USER** if: dependency blocker / scope ambiguity / Phase 0 >30% scope extension / regression-guard unrelated changes / LR-037 timestamp drift / **LR-040 closure-completeness gate — any planned item not classifiable as (a) MCP-proven, (b) grep-verifiable line item in a named recipient subplan, or (c) user-flagged discussion-item / bug-candidate with Pending-decision entry. Phantom hand-offs = audit finding.**

---

# SUBPLAN SP-XX: ...
```

This is non-negotiable. Every subplan gets this. Every plan summary must cite this pattern. Missing bootstrap = defect.

## Auto-Calls

- `/research` — Step 0, before exploration, when unfamiliar territory is involved

## Output

- Saved plan file in `plans/pending/PLAN_XX_<NAME>.md`
- Concise summary presented to user (context, key changes, verification approach)

## Rules
- NEVER skip the validation pass checklist — all 3 items are mandatory
- NEVER assume — verify by reading actual files
- Internal variable names are NOT user-facing — don't change them unless explicitly needed
- Keep the plan surgical — minimum changes for maximum effect
- If the plan touches more than 10 files, ask the user if the scope is right before saving
