---
name: push-encore-deliverables
description: Ship one branch to the Encore CLIENT deliverables repo (encore-mock / encore_deliverables_test). The branch name is REQUIRED and always chosen by the user. Dry-runs and shows the exact payload before pushing. EXPLICIT-INVOKE ONLY.
when-to-use: User types /push-encore-deliverables <branch>. Never auto-routes, never infers the branch, never ships a second branch off one authorisation.
---

# /push-encore-deliverables — ship to the CLIENT repo

**Target**: `encore-mock` → `https://github.com/RutviK-JBS/encore_deliverables_test`.
**Audience**: the client's reviewers. They see exactly what this ships and nothing else.
**Identity**: OWNER. Publishing is never delegated.

> **This skill exists to stop the two repos being confused.** `origin` is the TEAM repo and gets
> everything (`/push-repo`). This one is the CLIENT repo and gets only shipped test code — never
> plans, evidence, internal markdown, credentials, or another ticket's work.

> **The branch is the user's decision, always.** With no argument this skill pushes nothing — it
> lists what is prepared and asks. Never infer the branch from context or from the last thing
> discussed. **One invocation authorises exactly one branch.** After a successful push, STOP.

## Step 0 — Require the branch

```
/push-encore-deliverables nm2268
```

No argument → list local `delivery/*` branches and existing remote branches, then stop and ask.

## Step 1 — Know what the tool does

`scripts/ship-branch.sh` is the only sanctioned path (LR-049 — ship via `git archive`, never `cp -r`):

- Archives `HEAD`, so **the checked-out branch decides the content**.
- Purges `docs/` and `specs_planning/` from the scratch tree — internal material cannot reach the client.
- Builds a **fresh orphan commit** as `Encore Deliverable <deliverable@jade-biz.com>`, message
  `Encore deliverable — <branch> module`. No framework history and no `Co-Authored-By` trailers travel.
- Remote is **hardcoded** to `encore-mock` — it cannot push anywhere else.
- **Without `--push` it is a dry run.** This is the safety property the whole process rests on.

Filtering: `--surface` selects whole spec files, `--modules` whole workbook sheets, `--tcs`
individual test cases within them. **Read the argument parsing to confirm which flags exist before
relying on one** — do not assume from this document.

## Step 2 — Dry run FIRST, always

```bash
bash scripts/ship-branch.sh --branch=<name> --modules=<codes> --surface='<glob>' [--tcs=<ids>]
```

Copy the `--surface` value from an existing preset that already ships the same spec rather than
inventing a glob — the pattern matches a `tests/`-relative path, so a naive `foo*` silently matches
nothing when the file sits in a subdirectory.

**A dry run that filters everything out also exits 0. Verify the payload, never the exit code.**

## Step 3 — Inspect the actual payload

- Which spec files survived, and the exact TC-ID set in each.
- Which workbook sheets survived, and whether any row belongs to an unshipped ticket.
- Grep for ticket references that don't belong to this delivery — other `NM-` numbers, internal
  `BUG-` IDs, plan names, internal jargon.
- Confirm no `specs_planning/`, `docs/`, `.claude/`, `CLAUDE.md`, or `.env.local` is present.

## Step 4 — Coverage-regression check

```bash
git fetch encore-mock <branch> 2>/dev/null
git show encore-mock/<branch>:tests/<path-to-spec> | grep -oE 'TC-[A-Z-]+[0-9]+'
```

Every TC-ID the client already has for this spec must still be present. A shrunken set reads as
coverage going backwards and is almost always a slicing bug — **STOP and report**.

## Step 5 — Show the user, then push

Report branch, spec files, TC-ID range, sheets, and anything flagged. Then and only then:

```bash
bash scripts/ship-branch.sh --branch=<name> --modules=<codes> --surface='<glob>' [--tcs=<ids>] --push
```

## Step 6 — Verify on the remote

```bash
git fetch encore-mock <branch>
git show encore-mock/<branch>:tests/<path-to-spec> | grep -cE 'TC-[A-Z-]+[0-9]+'
git ls-tree -r encore-mock/<branch> --name-only | grep -E 'specs_planning|\.claude|CLAUDE\.md|\.env\.local' && echo "LEAK" || echo "clean"
```

Report the tip SHA, shipped TC count, and the leak-check result. Then **STOP.**

## Context worth carrying

- Every branch on this remote is a **standalone orphan** — no shared history, no merge base. Each is
  a full framework snapshot differing only in which spec files appear under `tests/`.
- Non-contiguous and out-of-order TC IDs are **normal** here. Do not "fix" ordering.
- Referencing a client Jira ID (`NM-####`) in a skip reason is legitimate — those are the client's
  own tickets. Internal `BUG-*` IDs are not, and no gate currently catches them.

## Rules

- Never push without a dry run in the same session.
- Never ship a red or non-compiling spec. A trimmed file that no longer passes is worse than no delivery.
- Never batch branches. One command, one branch, then stop.
- Never edit `ship-branch.sh` mid-delivery to make a push succeed — fix the content, not the gate.
