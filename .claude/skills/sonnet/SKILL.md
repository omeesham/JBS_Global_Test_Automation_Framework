---
name: sonnet
description: Model-aware guardrails for Sonnet — converts Opus intuition into explicit checklists, forces structured breadcrumb trail for auditor traceability. Activates when user says "/sonnet" or "sonnet mode".
user-invocable: true
auto-calls: none
tools: Read, Glob, Grep, Write, Edit, Bash, Agent, TodoWrite
---

# /sonnet — Model-Aware Guardrails + Breadcrumb Protocol

Wraps any task with Sonnet-specific safety nets: explicit checklists replace Opus's intuition, and a structured breadcrumb trail makes every decision auditable in seconds.

## When to Use

**Identity**: ALL. Orthogonal to identity — identity controls WHAT you touch, /sonnet controls HOW carefully.

- User says `/sonnet`, "sonnet mode", "use sonnet"
- Deactivate with `/sonnet off`

**Note**: No auto-detection. Model self-identification is unreliable. User must explicitly activate.

## Identity Gate
None — /sonnet is a wrapper layer, not a pipeline skill.

---

## Part A: Guardrail Checklists

Where Opus uses judgment, Sonnet uses explicit yes/no gates. These are MANDATORY when /sonnet is active.

### Pre-Write Gate (before ANY file write)

```
[ ] I read the target file (not just the plan's snippet)
[ ] I verified function signatures I'm calling (LR-001)
[ ] I checked file ownership for my identity (§2)
[ ] I have a plan section or rule citation for this change
[ ] I am NOT making a judgment call — if I am, I flag with [?]
```

### Assertion Gate (before ANY test assertion)

```
[ ] This expected value comes from MCP verification or test data file
[ ] I am NOT guessing what the UI shows
[ ] The selector exists in the selector file (grepped)
[ ] I used expect.poll for async values (LR-010)
```

### Completion Gate (before declaring ANY task done)

```
[ ] Every TodoWrite item is completed or documented as skipped+why
[ ] Breadcrumb trail is written (Part B)
[ ] I ran the code/tests (not just wrote them)
[ ] MOD-004 check: all docs synced with code changes
```

---

## Part B: Breadcrumb Protocol

One line per action. Append to a `### Breadcrumbs` section at the BOTTOM of plan files (`.claude/plans/` and `plans/`). Always append, never insert mid-file.

### Format

```
<!-- [S] SYMBOL action | file:line | per:justification | skip:what | risk:level -->
```

### Symbols

| Symbol | Meaning |
|---|---|
| `+` | Added (new code/file/method) |
| `~` | Modified (changed existing) |
| `!` | Fixed (bug/error correction) |
| `-` | Removed (deleted code/file) |
| `?` | Uncertain (needs audit — flagging own doubt) |
| `>` | Deferred (intentionally postponed) |

### Fields

| Field | Required | Description |
|---|---|---|
| action | YES | What was done (3-8 words) |
| file:line | YES | Where (file path + line or range) |
| per: | YES | Why — cite plan section, LR rule, or MCP finding |
| skip: | NO | What was intentionally not done (default: omit) |
| risk: | NO | low/medium/high + reason if high (default: omit) |

### Example

```
<!-- [S] + reloadAndNavigateToSSLTab | page.ts:41-50 | per:plan§7a,LR-026 -->
<!-- [S] ~ TC-008 reload pattern | spec.ts:90 | per:plan§6 -->
<!-- [S] + openSaveDialog | page.ts:120 | per:plan§7a,acct-addr:415 -->
<!-- [S] + TC-018 add-persist | spec.ts:205 | per:plan§7d,MCP-1 | risk:medium(first_RT_test) -->
<!-- [S] ? TC-021 cleanup reliability | spec.ts:310 | per:LR-026 | risk:high(angular_dirty_state) -->
<!-- [S] ! REQUIREMENTS.md:791 | per:plan§2,MCP-2026-03-19 -->
<!-- [S] > TC-023 beforeunload | per:MCP-4_not_verified -->
```

### Properties

- **Minimal**: ~100 chars per line. 10 actions = 1KB.
- **Parseable**: `grep "[S]"` extracts all. `grep "[S] ?"` finds uncertainties. `grep "risk:high"` finds risks.
- **Invisible**: HTML-comment wrapped — doesn't clutter rendered markdown.
- **Auditor-friendly**: WATCHDOG reviews 20 breadcrumbs in 30 seconds vs 20 minutes reading diffs.

---

## Part C: Session Wrapper

/sonnet is a WRAPPER — it runs as a pre/post layer around whatever skill the agent uses. ZERO modifications to existing skill files.

### Pre-Skill (runs before any skill starts)

1. Activate pre-write, assertion, and completion gates
2. Force `per:` citations on all TodoWrite items
3. Log: `[SONNET MODE ACTIVE]`

### Post-Skill (runs after any skill completes)

1. Verify breadcrumb trail exists for all actions taken
2. Flag any uncited decisions as `[?]`
3. Write breadcrumb count summary

### Behavioral Overrides

| What | Opus Default | Sonnet Override |
|---|---|---|
| Pre-research | Optional for familiar code | MANDATORY for all code |
| Self-audit rounds | 1 (per /planning) | 1 (same — extra guards come from pre-write gate + breadcrumbs) |
| Claim verification | Trust judgment | Verify EVERY claim against actual file |
| TodoWrite items | Descriptive | MUST include `per:` citation |
| Context between plans | Compact normally | Compact + append breadcrumb summary |

---

## Part D: Handoff Format (Sonnet → Opus)

At session end, write a handoff block in the plan file:

```markdown
### Sonnet Handoff (YYYY-MM-DD)

**Completed**: [list of TodoWrite items marked done]
**Skipped**: [list + per-item reason]
**Uncertain**: [list of [?] breadcrumbs — needs Opus review]
**Risks**: [list of risk:high breadcrumbs]
**State**: [clean/dirty — is there uncommitted work?]

Breadcrumb trail: [N] entries (grep `[S]` in this file)
```

~10-15 lines. Opus reads it in 10 seconds and knows exactly what to review.

---

## Output

When activated: `[SONNET MODE ACTIVE]` banner.
During work: breadcrumbs appended to plan file.
At session end: handoff block written.

## Rules

- NEVER make uncited decisions — every action needs `per:` justification
- NEVER skip breadcrumbs — they ARE the audit trail
- NEVER use breadcrumbs on Opus unless user explicitly asks — overhead Opus doesn't need
- The `?` symbol is Sonnet's STRENGTH — better to flag uncertainty than guess wrong
- Handoff block is MANDATORY at session end — no exceptions
- Keep breadcrumbs to ONE LINE per action — verbosity defeats the purpose
- Identity and /sonnet are orthogonal — both apply simultaneously, no conflicts
