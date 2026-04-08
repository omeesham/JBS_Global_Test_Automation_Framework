---
name: research
description: Multi-source web research — 2-10 searches, synthesize findings, map to our stack. Use before planning unfamiliar territory, or say "research", "best practices", "how do others do this".
user-invocable: true
auto-calls: none
tools: WebSearch, WebFetch, Read, Glob, Grep
---

# /research — Standalone Research

Focused web research that synthesizes findings and maps them to our specific stack. Extracted from `/planning` to be reusable by any skill.

## When to Use

**Identity**: OWNER, HUNTER, GIVER, BUILDER. Auto-loaded via Identity Gate.

- **Auto-called** by `/planning` (Step 0, when unfamiliar territory)
- **Auto-called** by `/chain` (Phase 1/4, when knowledge gaps found)
- **Manual**: user says "research", "best practices", "how do others do", "what's the standard approach", "look this up"
- **Error recovery**: when a command fails or behavior is unexpected — search before guessing

## Identity Gate
Runs `/identity` Step 1.5 with caller=`/research`. No-op if compatible identity active.

## Steps

### Step 1: Frame the Research

Break the topic into **2-5 specific research questions**. Vague research produces vague results.

**Bad**: "research authentication"
**Good**:
1. "What's the standard session management approach for Express + React apps?"
2. "JWT vs session cookies for multi-tenant SaaS — which is simpler?"
3. "Express session middleware — common pitfalls with TypeScript"

### Step 2: Search Phase (2-10 searches)

Execute searches in order of specificity:

1. **Stack-specific**: "[topic] TypeScript Playwright" or "[topic] Express React"
2. **Best practices**: "[topic] best practices 2025 2026"
3. **Pitfalls**: "[topic] common mistakes" or "[topic] gotchas"
4. **Version-specific**: Check `package.json` for library versions, then "[library] v[X] [topic]"
5. **Comparisons** (if choosing between approaches): "[option A] vs [option B] for [use case]"

Stop searching when you have **consensus from 3+ sources** or when results start repeating.

### Step 3: Read Phase (3-5 best results)

For the most relevant search results, use WebFetch to read the full content:
- Prioritize: official docs > well-known blogs > Stack Overflow > random articles
- Extract: code examples, configuration patterns, gotchas, version requirements
- Note: anything that contradicts other sources (conflict = important signal)

### Step 4: Synthesize

Cross-reference findings:
- **Consensus**: What do 3+ sources agree on? → High confidence
- **Conflict**: Where do sources disagree? → Note both sides + reasoning
- **Gaps**: What couldn't you find? → Note as open question

### Step 5: Map to Our Stack

Translate generic findings to Encore-specific implementation:
- What patterns apply to our TypeScript/Playwright setup?
- What conventions in our codebase constrain the approach? (read existing code to check)
- What utilities do we already have that align? (grep for relevant functions)
- What would need to be built fresh vs. reused?

## Auto-Calls

None — this is a leaf skill. Called BY `/planning` and `/chain`.

## Output

```
## Research Brief: [topic]

### Key Findings
1. [finding with source] — confidence: HIGH/MEDIUM/LOW
2. [finding with source]
3. ...

### Recommended Approach
[1-3 sentences on what to do, mapped to our stack]

### Risks & Alternatives
- [risk or alternative approach worth considering]

### Open Questions
- [anything unresolved that needs human judgment]

### Sources
- [URL 1] — [what was useful from this source]
- [URL 2] — [what was useful]
```
