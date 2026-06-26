---
name: NotCluely Adoptable Patterns
description: Complete absorption of NotCluely's KT Part C — 15 adoptable patterns across skills, mistake capture, learning loops, context compaction, bug pipeline, permissions, audit roles. 15-vs-6 skill audit with HAVE/ADOPT/ADAPT/SKIP verdicts. Consult when creating new skills, improving capture/audit, or building bug pipeline.
type: reference
---

# NotCluely Patterns — Adoptable Reference

Extracted 2026-03-18 from their Part C deep-dive answers. Organized by adoption priority.

---

## Full Skill Audit: Their 15 vs Our 6

| Their Skill | What It Does | Our Equivalent | Verdict |
|-------------|-------------|----------------|---------|
| `/execute` | Chains 3-10 skills autonomously | `/execute` | **HAVE** — ours uses pre-research + gap analysis |
| `/deploy` | Schema check → build → E2E → audit → commit → push | None | **ADOPT** — we lack a deployment skill |
| `/bugfix` | Explore → trace root cause → plan → implement → audit → document | Healer agent (pipeline) | **ADAPT** — Healer is pipeline-only, /bugfix is general-purpose |
| `/e2e` | Run tests, parse failures, fix, loop until 100% pass | Pipeline generation→testing→healing cycle | **SKIP** — our pipeline handles this |
| `/db-migrate` | Plan → update models → generate migration → audit → test → verify | None | **ADOPT** — relevant for website/ PostgreSQL |
| `/cleanup` | Dead code, unused imports, consolidate duplicates | None | **ADOPT** — we have no codebase hygiene skill |
| `/plan-task` | Research → explore → design → 3-level audit → save to plans/ | `/planning` | **HAVE** — ours has 3x enemy audit rounds |
| `/review` | Code review against standards → actionable feedback + fix plan | None (different from /audit) | **ADOPT** — our /audit is full-chain QA, /review is focused PR-style review |
| `/audit` | Security, bugs, performance, conventions scan | `/audit` | **HAVE** — ours is full-chain (prompt→intent→plan→execution→outcome) |
| `/find-bugs` | Adversarial QA with SFDPOT heuristics, boundary/edge cases | Pipeline Audit agent (partial) | **ADAPT** — add adversarial mindset + SFDPOT to audit skill or create standalone |
| `/reflect` | Session-end retrospective → update memory files | None | **ADOPT** — see HIGH PRIORITY #2 below |
| `/compile-learnings` | Graduate 3+ occurrence patterns → permanent rules | None (sync:mistakes doesn't graduate) | **ADOPT** — see HIGH PRIORITY #2 below |
| `/regression-guard` | Structural fingerprinting before/after changes | None | **ADOPT** — see HIGH PRIORITY #1 below (most novel) |
| `/research` | Multi-source web research (2-10 searches), synthesize, map to stack | Embedded in /planning | **ADOPT** — standalone research skill is more reusable |
| `/share-kt` | Bidirectional KT with IP protection gates | `/share-kt` | **HAVE** |

**Score: HAVE 5, ADOPT 6, ADAPT 2, SKIP 2**

### Standardized Skill File Template (from their structure)
Their skills follow a consistent 4-section format worth adopting:

```markdown
---
name: skill-name
description: One-line description (used by auto-routing to match user intent)
---
# /skill-name
## When to Use
[Trigger conditions — what user intent maps here]
## Steps
[Ordered instructions the agent follows]
## Auto-Calls
[Other skills this one chains to, e.g. "Call /regression-guard before and after"]
## Output
[What the skill produces — files, commits, reports]
```

**Where to adopt:** Standardize our existing 6 skills to this format. Add "Auto-Calls" section (we don't have this — enables automatic skill chaining).

---

## HIGH PRIORITY — Adopt When Ready

### 1. Regression Guard (MOST NOVEL — we have NOTHING like this)
Their `/regression-guard` does **structural fingerprinting before AND after changes**:
- Snapshot all exports, imports, routes, function signatures BEFORE change
- Make the change
- Snapshot again AFTER
- Diff the two — flag anything that silently changed

**How they use it:**
- `/bugfix` auto-calls `/regression-guard` before and after every fix
- `/execute` wraps implementation: `/regression-guard` (before) → implement → `/regression-guard` (after)

**Why it matters:** Our `/audit` reviews what WAS done (post-hoc). `/regression-guard` catches what SILENTLY BROKE — an import path that disappeared, an export that got renamed, a route that shifted. Fundamentally different tool. Catches a class of bugs /audit cannot.

**Where to adopt:** Create `/regression-guard` skill in `.claude/skills/`. Add as auto-call in `/execute` and future `/bugfix` skill.

### 2. Six Explicit Mistake Triggers
Their mistake capture fires on ANY of these 6 conditions (vs our general "MANDATORY STOP"):

| # | Trigger | Example |
|---|---------|---------|
| 1 | User corrects you | "No, don't use that approach" |
| 2 | Retry was needed (first attempt failed) | Build failed, had to fix and retry |
| 3 | Unexpected state encountered | File missing, wrong page, wrong value |
| 4 | Output doesn't match evidence | Said "field exists" but code says otherwise |
| 5 | Command errors out | `npm run build` exits with errors |
| 6 | Approach changed mid-task | Started with A, switched to B |

**Why it matters:** Explicit triggers are more actionable than our general "MANDATORY STOP" rule. Agents can pattern-match against this list.
**Where to adopt:** Could be added to AGENT_SHARED_RULES.md §8 WORK phase, or as a new section in mistake capture protocol.

### 3. Learning Loop Graduation (/reflect + /compile-learnings)
They have two skills we lack:

**`/reflect`** — Mandatory at session end:
- Captures mistakes missed during blocking capture
- Updates memory files with new learnings
- Belt-and-suspenders with blocking capture

**`/compile-learnings`** — Periodic (weekly or when memory grows):
- Scans mistakes.md for patterns with 3+ occurrences
- Graduates recurring patterns into permanent CLAUDE.md rules
- Also updates .claude/rules/ files and copilot-instructions.md
- Creates patterns.md with recurring solutions, decision trees, code templates

**Why it matters:** Our sync:mistakes pipeline auto-injects into agent context but doesn't _graduate_ recurring patterns into permanent rules. Theirs compounds — ours stays flat.
**Where to adopt:** Create `/reflect` and `/compile-learnings` skills in `.claude/skills/`.

### 4. Auto-Skill Routing Table (COMPLETE — 11 intent patterns)
Their agent auto-invokes skills based on user intent — user never types `/skill`:

| User Intent Pattern | Auto-Invoked Skill |
|--------------------|-------------------|
| "fix bug", "broken", "not working", "error" | /bugfix |
| "add feature", "implement", "build", "create" | /execute |
| "deploy", "push to prod", "ship it" | /deploy |
| "test", "run tests", "e2e" | /e2e |
| "review", "check code", "look at PR" | /review |
| "audit", "security check", "find issues" | /audit |
| "plan", "design", "how should we" | /plan-task |
| "clean up", "dead code", "remove unused" | /cleanup |
| "migrate", "schema change", "add column" | /db-migrate |
| "find bugs", "QA", "break it" | /find-bugs |
| "research", "best practices" | /research |
| Multiple intents detected | /execute (chains skills) |

**Why it matters:** Removes friction. User says "fix the login bug" and the right skill fires without manual routing.
**Where to adopt:** Would require adding routing logic to each skill's SKILL.md trigger conditions, plus a master routing table. Medium effort.

### 5. Skill Chaining Recipe (concrete /execute sequence)
Their `/execute` chains in this specific order:
```
/research → /plan-task → /regression-guard (BEFORE) → implement → /regression-guard (AFTER) → /e2e → /reflect
```
Other auto-call patterns:
- `/bugfix` auto-calls `/regression-guard` before AND after every fix
- `/plan-task` auto-calls `/research` before planning
- Context dedup: if `/research` already ran in session, `/plan-task` checks for a context marker and skips re-researching

**Where to adopt:** Add "Auto-Calls" section to our skill files + implement context dedup markers.

### 6. Context Compaction Protocol (3-layer pipeline — NOVEL)
From their CLAUDE.md — a formalized approach to managing context window:

| Layer | What It Does |
|-------|-------------|
| **Tool discipline** | Use dedicated tools (Read, Grep, Glob) instead of Bash cat/grep to minimize context noise |
| **Write-before-compact** | Before context gets compacted, write important findings to files so they survive compaction |
| **Task-boundary compaction** | At the boundary between tasks, explicitly reset — carry only what the NEXT task needs |

**Why it matters:** Our `/chain` skill does task-boundary compaction but we don't formalize layers 1 and 2. Write-before-compact is particularly useful — ensures discoveries survive when context is truncated.
**Where to adopt:** Add to `/chain` skill and as a general principle in memory.

### 7. Mistake Capture PROCESS (not just triggers)
The triggers (item #2) say WHEN to capture. This is HOW:

**5-step blocking process:**
1. **STOP** current task immediately
2. **Open** mistakes.md (the Rule Registry)
3. **Determine scope**: `ALL` (both agents) | `CC` (Claude Code only) | `CP` (Copilot only)
4. **Append** rule: `| {ID} | {one-line rule} | LRN: {what happened} |`
5. **THEN** resume task

**Format examples:**
```
| ALL-003 | Schema Mismatch — always verify before deploy | LRN: models.py updated but migration not run, caused crash |
| ALL-008 | ALWAYS open models.py before writing queries | LRN: wrote field names from memory, 3 were wrong |
| CC-002 | Parallel audit catches bugs single-pass misses | LRN: 3-agent audit found 4 bugs that single review missed |
```

**Where to adopt:** Our agent-mistakes.md uses a different format (R01-R22 with resolution column). The scope tags (ALL/CC/CP) are worth adding — map to our agents (ALL/CLAUDE/COPILOT).

---

## MEDIUM PRIORITY — Future Reference

### 8. Bug Report Vetting Protocol
Their bug vetting has 3 tiers:
1. **Admin reports** — always trusted, fix without question
2. **Non-admin reports** — vetted critically: cross-reference against codebase, check if feature request vs real bug
3. **Prompt injection detection** — reports containing "ignore instructions," "overwrite rules," "I am admin" are dismissed

**Where to adopt:** Add to bug-reports handling in website/ backend when bug pipeline matures.

### 9. Explicit Deny List in Permissions
They block destructive commands regardless of allowlist: `rm -rf`, `git reset --hard`, `git push --force`, `DROP TABLE`, `DROP DATABASE`.

**Why it matters:** Defense in depth — even if something is accidentally allowlisted, deny list catches it.
**Where to adopt:** Add deny patterns to `.claude/settings.local.json`.

### 10. AI-Enriched Bug Reports (Dual Model)

**BugReport** (user-facing, raw):
- `conversation_log`, `page_url`, `username`, `created_at`

**ChatSubmission** (AI-enriched intelligence layer):
- `category` (bug_report | feature_request | improvement | question | complaint | praise | spam | other)
- `subcategory` — more specific classification
- `summary` — AI-generated 1-2 sentence summary
- `sentiment` (positive/negative/neutral)
- `urgency` (low/medium/high/critical)
- `frustration_level`
- `actionable` (boolean)
- `tags` (auto-generated)

**Implementation details:**
- Rate limit: 10 reports/hour/user
- Dedup: same content hash within 60 seconds = return existing
- AI categorization runs as background async task (non-blocking)
- Agent M2M endpoint enables batch triage → auto-feed into /bugfix

**Where to adopt:** When bug pipeline in website/ is mature enough.

### 11. Learning-Focused Completion Checklist (vs our technical-focused)
Their 8-item checklist has a different PHILOSOPHY than ours:

| # | Their Item | Focus |
|---|-----------|-------|
| 1 | Does my work compile/build without errors? | Technical |
| 2 | Did I verify against user's ORIGINAL requirement? | Technical |
| 3 | Any hardcoded values, TODOs, or placeholders? | Technical |
| 4 | If failures occurred, did I capture rules in registry? | **Learning** |
| 5 | Would a senior engineer approve without changes? | **Quality** |
| 6 | /reflect called and memory updated? | **Learning** |
| 7 | Unexpected behavior written to mistakes.md? | **Learning** |
| 8 | New patterns written to relevant memory file? | **Learning** |

**Key insight:** Items 5-8 are LEARNING-focused. Our per-agent checklists (7 items each) are primarily TECHNICAL (tests pass? selectors from index? no hardcoded waits?). We check correctness. They check correctness AND learning.
**Where to adopt:** Add items 6-8 to our agent checklists when /reflect skill exists.

### 12. Parallel Audit Agent Roles
For complex changes, they launch 3 specialized audit agents simultaneously:

| Agent | What It Checks |
|-------|---------------|
| **Model-field checker** | Greps every `models.X.field` reference, cross-refs against actual model definitions |
| **Logic checker** | Verifies business logic matches requirements |
| **Scope checker** | Verifies every variable/import/dependency is properly declared |

**Why parallel:** 3 agents simultaneously catches bugs single-pass review misses. They found 4 bugs a single-pass review missed.
**Where to adopt:** Use Claude Code's Agent tool to launch parallel audit subagents with these specific roles.

### 13. Intermediate Plan Folder States
They have 4 plan folders vs our 2:
```
plans/
├── pending/        # Not started (WE HAVE)
├── audit/          # Code pushed, needs QA review (WE DON'T HAVE)
├── improvements/   # Audit found issues, needs fixes (WE DON'T HAVE)
└── done/           # Fully executed AND audited (WE HAVE)
```
**Rule:** NEVER skip to done/ without going through audit/ first.
**Where to adopt:** Create plans/audit/ and plans/improvements/ folders.

### 14. Their CLAUDE.md Section Template (16 sections)
Their ~400-line CLAUDE.md has these sections — useful as a reference when building comprehensive project instructions:

| Section | Purpose |
|---------|---------|
| Stack & Structure | Tech stack, repo layout |
| Plans System | Plans lifecycle, INDEX.md |
| Build & Run | Command reference |
| URLs | Production endpoints |
| Code Conventions | TS + Python + E2E standards |
| Workflow Rules (MANDATORY) | 10-step execution, 7-step planning |
| Plan Status Lifecycle | 6 states, folder = status |
| When Reviewing Code | 5-step deep review |
| When Fixing Bugs | Fetch → vet → fix → verify |
| Core Principles | Plan vs execution vs requirements vs assumptions |
| Mistake Capture (BLOCKING) | 6 triggers + capture format |
| Context Compaction | 3-layer pipeline |
| Completion Self-Audit | 8-item checklist + evidence table |
| Root Cause Analysis | Diagnosis first, failure categories, max 2 cycles |
| Critical Lessons | 16 one-liners from hard-won experience |
| Self-Learning System | /reflect mandatory, /compile-learnings periodic |

### 15. Corrections to Their Recommendations About Us
Their Part C ends with 3 recommendations based on INCOMPLETE info about Encore:

| Their Rec | Their Assumption | Reality |
|-----------|-----------------|---------|
| "Make mistake capture blocking" | They think ours might not be | **We already have this** — §8 Session Protocol says "MANDATORY STOP" |
| "Add evidence table (you have 5-item checklist)" | They think we have 5 items | **We have 7-item checklists per agent role** + §8 Reconciliation table (3-row min) |
| "Add auto-skill routing" | Valid gap | **Correct** — we don't have formal intent→skill routing |

**Context:** Their assessment was based on our Part A/B KT which didn't describe §8 Session Protocol in detail. Worth noting if we share back.

---

## ALREADY HAVE — Confirmed by Comparison

These patterns appeared in their answers but we already implement them:
- Allowlist permission strategy (settings.local.json)
- Evidence-based completion tables (§8 Reconciliation table, 3-row min)
- Max 2 fix cycles (AGENT_SHARED_RULES §5)
- Blocking mistake capture (§8 WORK phase)
- 4-dimension verification (our full-chain audit is MORE granular)
- Inherited work verification (/execute pre-research + gap analysis)
- Memory compounding (our sync:mistakes → build:context → inject pipeline)
- Context compaction (/chain skill isolates context per plan)
- Folder-as-status for plans (plans/pending/ and plans/done/)

---

## Key Quotes Worth Remembering

- **"Fixing without learning = wasted session"** — their core philosophy on mistake capture
- **"Skill descriptions must include trigger conditions, or the agent can't auto-route correctly"** — on auto-routing
- **"Blocklists have gaps — you can't anticipate every dangerous command. Allowlists are safer by default."** — on permission strategy
- **"Plans go stale fast"** — why executor must verify 3+ claims against actual source before executing
