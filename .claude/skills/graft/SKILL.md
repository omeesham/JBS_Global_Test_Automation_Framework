---
name: graft
description: Graft lifecycle — hand-port code from a colleague's branch into our codebase, verify vs source, prove with a real E2E run, and sync the git index to the tested working tree so the disk never lies. Use when grafting, splicing, or integrating hand-ported code outside the pipeline.
user-invocable: true
auto-calls: identity
tools: Read, Glob, Grep, Bash, Write, Edit
---

# /graft — Graft Lifecycle (Splice → Verify → Prove → Sync)

Surgically integrates code from a colleague's branch into our codebase such that the graft is
NOT "done" until the git index provably equals the tested working tree. Prevents the NM-2265
class of defect: code `git add`-ed early, corrected later in the working tree, never re-staged —
so a later commit ships a STALE version that was never the tested version.

The rule this skill enforces: **a clean graft makes the disk truthful. No ledger, no marker, no
reconciliation file — the synced index IS the reconciliation.**

## When to Use

**Identity**: OWNER. Auto-loaded via Identity Gate.

- **Manual**: user says "graft", "splice", "integrate from branch", "port code"
- Hand-porting a feature from another branch (NOT via the pipeline `/chain`)
- Surgically merging colleague work that needs convention adaptation

## Identity Gate

Runs `/identity` Step 1.5 with caller=`/graft`. No-op if a compatible identity is active.

## Step 1: Splice deterministically

Write the ported code into the target files with an **anchor-first, atomic** splice:

- Validate EVERY insertion anchor across ALL target files BEFORE writing any file. Each anchor
  must match exactly once — abort loudly if any anchor is missing or ambiguous.
- Never partially splice. If one anchor fails, write nothing (no half-applied state to recover).

Do NOT `git add` here. The working tree now holds unverified ported code.

## Step 2: Verify vs real source

Audit every spliced change against the authoritative source (the colleague's branch) AND our
conventions:

1. Diff the spliced code against the source branch for completeness.
2. Check naming, import paths, selectors, and patterns match our codebase.
3. Fix ALL discrepancies **in the working tree** — corrections stay on disk, still not staged.

## Step 3: Prove with a REAL E2E run

Run the actual Playwright spec(s) for the grafted feature and require green (LR-059: no
"works / verified" claim without driving the real counterpart end-to-end). The E2E validates the
**working tree** — which is exactly why the index must be synced to it afterward, never before.

If a spec fails: fix in the working tree and re-run. Do not proceed until green.

## Step 4: Sync index to the tested tree — THE INVARIANT

Only after E2E is green:

```bash
git add <graft-paths>                 # stage every grafted path
git diff --quiet -- <graft-paths>     # assert zero index-vs-worktree drift (exit 0 required)
```

If `git diff --quiet` exits non-zero, the graft is NOT done — a path drifted between staging and
now; re-stage and re-assert until it exits 0.

- **Never `git add` before the E2E is green** — that early staging is exactly what created the
  stale index in NM-2265.
- **No commit.** The graft ends staged-and-consistent, disk-only, until a separate ship session.

## Step 5: Activity log

Record the graft per LR-028 session-bookkeeping (activity-log row listing the grafted files).

## Backstop (defense-in-depth, not the prevention)

`.claude/hooks/graft-ship-gate.sh` blocks a Claude-issued `git commit` if any staged file still
has unstaged worktree changes — catching a drift that slipped past Step 4. **Scope**: it gates
ONLY Claude's Bash tool, not a human terminal, a GUI, another agent, or CI. This skill's Step 4
invariant is the actual prevention; the hook is the safety net for the one vector it can see.

## Verification Artifact (D23)

Confirm a graft is clean (copy-pasteable — replace `<graft-paths>` with the real files):

```bash
git diff --quiet -- <graft-paths> && echo "GRAFT CLEAN: index == worktree" || echo "DRIFT — re-stage before ship"
```

Exit 0 + "GRAFT CLEAN" = safe to ship. Anything else = re-stage required before commit.
