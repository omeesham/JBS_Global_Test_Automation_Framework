---
name: chain_audit
description: Linear, single-session audit walker through `plans/done/`. Each invocation audits ONE plan (oldest un-audited by default, or user-specified), runs full `/audit` against it in the current interactive session, records verdict + findings to state file, advances the pointer. Sub-commands — `/chain_audit` (next), `/chain_audit <plan-file>` (specific), `/chain_audit status` (queue view), `/chain_audit reset` (clear state). Use when the user says "chain audit", "audit next done plan", "walk through done plans", or "audit plan execution".
user-invocable: true
auto-calls: identity, audit
tools: Read, Glob, Grep, Write, Edit, Bash, TodoWrite
---

# /chain_audit — Linear Done-Plan Audit Walker

> **Difference from /chain**: `/chain` spawns background sessions to EXECUTE pending plans. `/chain_audit` runs in YOUR current session to AUDIT already-executed plans, one at a time, on demand. You invoke once → one plan gets audited → next invocation picks up the next. No spawning, no background.
>
> **State**: `.claude/state/chain-audit.json` (gitignored — tracks which plans have been audited). Original plan files stay where they are. Transcripts stay in `~/.claude/projects/` as Claude Code stores them.

---

## When to Use

**Identity**: OWNER. Auto-loaded via Identity Gate.

Triggered by:
- User says "chain audit", "audit next done plan", "walk through done plans"
- User says "/chain_audit", "/chain_audit status", "/chain_audit reset"
- User wants to systematically review plan executions without picking which one each time

---

## Sub-command dispatch

| Invocation | Action |
|---|---|
| `/chain_audit` | Audit the oldest un-audited plan in `plans/done/` |
| `/chain_audit <plan-file>` | Audit the specified plan (e.g. `/chain_audit PLAN_XXX.md` or full path) |
| `/chain_audit status` | Print queue view: audited count / remaining / next candidate |
| `/chain_audit reset` | Clear `chain-audit.json`; next invocation starts from oldest again |

---

## `/chain_audit` — DEFAULT (audit next)

1. **Identity gate** → OWNER (auto-call `/identity`).
2. **Load state** from `.claude/state/chain-audit.json`. If missing, treat as `{"schemaVersion": 1, "audited": []}`.
3. **Build candidate list**:
   - `ls plans/done/*.md` (all done plans and subplans).
   - Get "addition date" for each via `git log --diff-filter=A --follow --format="%aI" -- <file> | tail -1` (oldest commit that added the file). Fall back to file mtime if git-untracked.
   - Sort ascending by date.
   - Filter out files already in `state.audited[].plan`.
4. **Pick first candidate**. If list is empty → report "All done plans have been audited. Use `/chain_audit reset` to re-walk." and exit.
5. **Announce pick** to user:
   ```
   Auditing: plans/done/<picked>.md
     ({N} of {total} done plans; {remaining} remaining after this)
   ```
6. **Auto-call `/audit`** scoped to this plan. The `/audit` skill:
   - Re-reads the plan's stated intent and Execution Summary (LR-027).
   - Verifies every claim against the actual codebase (files exist, tests exist, refs match).
   - Compares against original intent (what was asked vs what landed).
   - Flags gaps with severity (CRITICAL / HIGH / MEDIUM / LOW / INFO).
   - Emits a Verdict line: GREEN | YELLOW | RED.
7. **Record to state** — append to `audited[]`:
   ```jsonc
   {
     "plan": "<picked>.md",
     "auditedAt": "<ISO timestamp>",
     "verdict": "GREEN|YELLOW|RED",
     "findingsSummary": "<one-line distillation of top gap(s), or 'clean' on GREEN>",
     "gaps": [ /* structured findings from /audit, truncated to top 5 */ ]
   }
   ```
8. **Next-candidate hint** — print the next pick so the user knows what `/chain_audit` again will pick.
9. **User acts** on findings (file bugs, patch plans, defer) — outside this skill's scope.

## `/chain_audit <plan-file>` — SPECIFIC PICK

1. Identity gate.
2. Accept first arg as plan filename (e.g. `PLAN_XXX.md`) or full path. Resolve:
   - If path exists → use as-is.
   - Else if `plans/done/<arg>` exists → use that.
   - Else if `plans/pending/<arg>` exists → refuse with "That plan is still pending. /chain_audit audits done/ only."
   - Else → refuse with "Plan not found."
3. Warn if already in `audited[]` (still proceed — user may be re-auditing).
4. Run `/audit` (same as default path steps 6–8).

## `/chain_audit status`

1. Read state.
2. Count:
   - `plans/done/*.md` total
   - `audited[]` length
   - Remaining = total − audited
3. Print table: recent audits (last 10) with `plan | auditedAt | verdict | 1-line-finding`.
4. Print next candidate (what `/chain_audit` would pick now).
5. No mutations.

## `/chain_audit reset`

1. Archive current state to `.claude/state/chain-audit-archive/chain-audit-<ISO>.json` (optional, for history).
2. Delete `.claude/state/chain-audit.json`.
3. Print "Audit queue cleared. Next `/chain_audit` will start from the oldest done plan."

---

## State schema: `.claude/state/chain-audit.json`

```jsonc
{
  "schemaVersion": 1,
  "createdAt": "<ISO>",
  "updatedAt": "<ISO>",
  "audited": [
    {
      "plan": "PLAN_XXX.md",
      "auditedAt": "<ISO>",
      "verdict": "GREEN",
      "findingsSummary": "clean",
      "gaps": []
    },
    {
      "plan": "SUBPLAN_YYY.md",
      "auditedAt": "<ISO>",
      "verdict": "YELLOW",
      "findingsSummary": "2 LR-027 sections missing from Execution Summary",
      "gaps": [
        { "severity": "MEDIUM", "note": "No TCs-dropped justification (LR-027)" },
        { "severity": "LOW", "note": "Activity-log row timestamp off by ~6h (LR-037 adjacent)" }
      ]
    }
  ]
}
```

**Gitignore**: `.claude/state/chain-audit.json` is already covered by the `.claude/state/*.json` pattern. Runtime state stays local; not committed.

---

## Defaults + guarantees

- **Single session only**. No backgrounding, no `nohup`. Audit runs inline in the user's current `claude` conversation.
- **One plan per invocation**. Even if 30 done plans remain, `/chain_audit` audits exactly one. User re-invokes to get the next.
- **Re-audit allowed** via explicit path override — warns but proceeds.
- **No commits** from this skill. Audit findings go in chat; any follow-up fixes are user-initiated.
- **`/audit` is the engine** — this skill is a queue iterator, not a new audit algorithm.

## Rules applied

- **LR-027** (Execution Summary) — `/audit` checks this per plan.
- **LR-035** (INDEX auto-gen) — unchanged; reading only.
- **LR-037** (activity-log timestamps) — `/audit` can flag violations.
- **LR-040** (closure completeness) — `/audit` checks each planned item is (a) proven / (b) tracked / (c) flagged.
- **ALL-030** (no rubber-stamp audits) — findings go to chat with evidence; never a silent pass.

## Auto-Calls

- `/identity` — first step. OWNER required.
- `/audit` — per invocation, scoped to the picked plan.

## Output

- Audit findings printed in chat (from `/audit`).
- Updated `.claude/state/chain-audit.json` (gitignored).
- Pointer to next candidate so user knows what `/chain_audit` again will pick.

## What this skill does NOT do

- Does NOT run `/execute`, never modifies plan files.
- Does NOT spawn background sessions (that's `/chain`, a different skill).
- Does NOT commit, does NOT regenerate `plans/INDEX.md`.
- Does NOT batch-audit multiple plans in one invocation — one call = one audit.
- Does NOT move audited plans to a separate directory.
