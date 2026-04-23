---
name: chain_audit
description: Linear, single-session audit walker for CHAIN-SPAWNED (headless) sessions only. Candidate set = plans in `plans/done/` that have a matching `.claude/state/chain-sessions/<plan>.log` (= evidence the plan was executed by `/chain`, not interactively). Each invocation audits ONE such plan (oldest un-audited by default, or user-specified), runs full `/audit` against it in the current interactive session, records verdict + findings to state file, advances the pointer. Sub-commands — `/chain_audit` (next), `/chain_audit <plan-file>` (specific), `/chain_audit status` (queue view), `/chain_audit reset` (clear state). Use when the user says "chain audit", "audit next chain-run plan", "walk through headless sessions", or "audit plan execution".
user-invocable: true
auto-calls: identity, audit
tools: Read, Glob, Grep, Write, Edit, Bash, TodoWrite
---

# /chain_audit — Linear Chain-Session Audit Walker

> **Scope (important)**: `/chain_audit` audits **only headless, chain-spawned sessions** — the runs a human never saw live because `/chain` launched them via `nohup claude -p`. The signal that a plan was chain-spawned is the presence of `.claude/state/chain-sessions/<plan>.log`. Plans executed interactively (no chain-sessions log) are NOT `/chain_audit` candidates — the user already saw them run. This is a queue iterator for headless work, not a universal done-plan auditor.
>
> **Difference from /chain**: `/chain` spawns background sessions to EXECUTE pending plans. `/chain_audit` runs in YOUR current session to AUDIT those completed headless runs, one at a time, on demand. You invoke once → one plan gets audited → next invocation picks up the next. No spawning, no background.
>
> **State**: `.claude/state/chain-audit.json` (gitignored — tracks which plans have been audited). Plan files stay in `plans/done/`.
>
> **Archive-on-GREEN (LR-042)**: when an audit passes GREEN *and* the user explicitly approves during the session, ALL the plan's headless-session artifacts are **moved** to `.claude/state/chain-sessions-green/` (sibling of `chain-sessions/` and `chain-archive/`). The move set:
> - `.claude/state/chain-sessions/<plan>.log` → `.claude/state/chain-sessions-green/<plan>.log`
> - `.claude/state/chain-sessions/<plan>.pid` → `.claude/state/chain-sessions-green/<plan>.pid`
> - `~/.claude/projects/c--Users-rutvi-projects-encore-framework/<uuid>.jsonl` → `.claude/state/chain-sessions-green/<plan>.<uuid>.jsonl` (renamed to carry the plan name)
>
> YELLOW / RED → nothing moves. Artifacts stay in `chain-sessions/` until the user fixes and re-audits to GREEN. Per LR-042: no other path (manual cleanup, `/chain reset`, agent tidy-up) may touch `chain-sessions/*.log|*.pid` — only a GREEN `/chain_audit` approval may move them.

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
| `/chain_audit` | Audit the oldest un-audited chain-spawned plan (`plans/done/<p>` with a matching `chain-sessions/<p>.log`) |
| `/chain_audit <plan-file>` | Audit the specified plan (e.g. `/chain_audit PLAN_XXX.md` or full path). Refuses if no `chain-sessions/<p>.log` — that plan was not chain-spawned |
| `/chain_audit status` | Print queue view: audited count / remaining chain-spawned / next candidate |
| `/chain_audit reset` | Clear `chain-audit.json`; next invocation starts from oldest chain-spawned again. Does NOT touch `chain-sessions-green/` |

---

## `/chain_audit` — DEFAULT (audit next)

1. **Identity gate** → OWNER (auto-call `/identity`).
2. **Load state** from `.claude/state/chain-audit.json`. If missing, treat as `{"schemaVersion": 1, "audited": []}`.
3. **Build candidate list** (chain-spawned only):
   - `ls plans/done/*.md` (all done plans and subplans).
   - **Chain-spawn filter** (MANDATORY): for each `<plan>.md`, keep only if `.claude/state/chain-sessions/<plan>.md.log` exists. Plans with no matching log were executed interactively and are OUT OF SCOPE for `/chain_audit`.
   - Get "addition date" for each remaining plan via `git log --diff-filter=A --follow --format="%aI" -- <file> | tail -1` (oldest commit that added the file). Fall back to file mtime if git-untracked.
   - Sort ascending by date.
   - Filter out files already in `state.audited[].plan`.
   - If empty after filtering → "No un-audited chain-spawned plans. Either /chain has not run, or all its outputs are audited." Exit.
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
7. **Record to state** — append to `audited[]` (includes artifact paths):
   ```jsonc
   {
     "plan": "<picked>.md",
     "auditedAt": "<ISO timestamp>",
     "verdict": "GREEN|YELLOW|RED",
     "findingsSummary": "<one-line distillation of top gap(s), or 'clean' on GREEN>",
     "gaps": [ /* structured findings from /audit, truncated to top 5 */ ],
     "chainLogSource": ".claude/state/chain-sessions/<picked>.log",
     "transcriptSource": "~/.claude/projects/c--.../<uuid>.jsonl",               // pre-move (or null if not found)
     "archivedTo": ".claude/state/chain-sessions-green/"                         // set only on GREEN + approval
   }
   ```
8. **Archive artifacts on GREEN + user approval**:
   - Only if verdict == GREEN → ask the user in chat: "Approve GREEN audit — archive chain-session artifacts (log + pid + ~/.claude/projects transcript) to `.claude/state/chain-sessions-green/`? (yes/no)"
   - On **yes**:
     1. `mkdir -p .claude/state/chain-sessions-green`
     2. Move the headless-run log + pid (present by candidate filter):
        - `mv .claude/state/chain-sessions/<picked>.log .claude/state/chain-sessions-green/<picked>.log`
        - `mv .claude/state/chain-sessions/<picked>.pid .claude/state/chain-sessions-green/<picked>.pid` (if exists; skip silently otherwise)
     3. Find the matching transcript: enumerate `~/.claude/projects/c--Users-rutvi-projects-encore-framework/*.jsonl`, read each line as JSON, scan content (`.message.content[].text` or `.content`) for the plan's filename. Pick the newest match.
        - If match: `mv <match> .claude/state/chain-sessions-green/<picked>.<uuid>.jsonl` (rename to embed plan name for self-identification).
     4. Update the state entry with `archivedTo` = the destination folder.
   - On **no** or artifacts already moved → skip, record `archivedTo: null`. Not an error.
   - YELLOW/RED → never prompt, never move. Artifacts stay in `chain-sessions/` for re-audit.
9. **Next-candidate hint** — print the next pick so the user knows what `/chain_audit` again will pick.
10. **User acts** on findings (file bugs, patch plans, defer) — outside this skill's scope.

## `/chain_audit <plan-file>` — SPECIFIC PICK

1. Identity gate.
2. Accept first arg as plan filename (e.g. `PLAN_XXX.md`) or full path. Resolve:
   - If path exists → use as-is.
   - Else if `plans/done/<arg>` exists → use that.
   - Else if `plans/pending/<arg>` exists → refuse with "That plan is still pending. /chain_audit audits done/ only."
   - Else → refuse with "Plan not found."
3. **Chain-spawn check**: confirm `.claude/state/chain-sessions/<basename>.log` OR `.claude/state/chain-sessions-green/<basename>.log` exists. If neither:
   - Refuse with "That plan was not chain-spawned (no chain-sessions log). /chain_audit only covers headless runs. Use /audit directly for interactive-session reviews."
4. Warn if already in `audited[]` (still proceed — user may be re-auditing).
5. Run `/audit` (same as default path steps 6–8).

## `/chain_audit status`

1. Read state.
2. Count:
   - Chain-spawned total: count of `plans/done/*.md` where a matching `chain-sessions/<p>.log` OR `chain-sessions-green/<p>.log` exists.
   - `audited[]` length.
   - Remaining = chain-spawned total − audited.
3. Print table: recent audits (last 10) with `plan | auditedAt | verdict | 1-line-finding`.
4. Print next candidate (what `/chain_audit` would pick now — must have live `chain-sessions/<p>.log`).
5. Print counts of GREEN-archived items in `chain-sessions-green/` for visibility.
6. No mutations.

## `/chain_audit reset`

1. Archive current state to `.claude/state/chain-audit-archive/chain-audit-<ISO>.json` (optional, for history).
2. Delete `.claude/state/chain-audit.json`.
3. Print "Audit queue cleared. Next `/chain_audit` will start from the oldest chain-spawned plan."
4. **Does NOT touch `chain-sessions-green/`** — once artifacts are moved there on GREEN approval, they stay. If the user wants to re-audit a plan whose artifacts already moved, `/chain_audit <plan>` still works against the same chain-sessions-green files; it'll just not find anything at the live chain-sessions source.
5. **Does NOT touch `chain-sessions/`** either — un-audited headless artifacts stay in place for re-audit (LR-042).

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
- Does NOT move plan files (they stay in `plans/done/`).
- Does NOT spawn background sessions (that's `/chain`, a different skill).
- Does NOT commit, does NOT regenerate `plans/INDEX.md`.
- Does NOT batch-audit multiple plans in one invocation — one call = one audit.
- Does NOT move YELLOW/RED transcripts (they stay at source so the user can `claude --resume <uuid>` to re-examine).
- Does NOT auto-move GREEN transcripts — always asks for user approval in the interactive session first.
