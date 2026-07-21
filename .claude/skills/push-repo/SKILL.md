---
name: push-repo
description: Push the framework repo to the TEAM remote (origin/main, qa_agentic_framework_global) — the repo colleagues work from. Runs the commit-gate battery, a secret sweep, and a delegation-material check first. EXPLICIT-INVOKE ONLY.
when-to-use: User types /push-repo. Never fires on "push", "commit", "deploy", or any ambient phrasing.
---

# /push-repo — publish to the TEAM repo

**Target**: `origin` → `https://github.com/RutviK-JBS/qa_agentic_framework_global`, branch `main`.
**Audience**: colleagues who continue this work on their own machines.
**Identity**: OWNER. Publishing is never delegated — Claude runs the push itself.

> **This skill exists to stop the two repos being confused.** There are two push destinations with
> **opposite** rules. Sending the wrong thing to the wrong one is the failure this prevents.

| Remote | Audience | Gets | Skill |
|---|---|---|---|
| `origin` | Colleagues | Everything they need: specs, plans, walk evidence, test-case markdown, field inventories, credentials for the shared automation account | **this skill** |
| `encore-mock` | The client | Only shipped test code — never internal material | `/push-encore-deliverables` |

Withholding internal artifacts from **colleagues** blocks them. Sending internal artifacts to the
**client** harms us. Same content, opposite verdicts. This skill serves colleagues.

## Step 1 — Confirm the target

```bash
git remote -v | grep origin
git rev-parse --abbrev-ref HEAD
git log origin/main..HEAD --oneline | wc -l
```

Abort if the remote is not `qa_agentic_framework_global`, or if HEAD is not the intended branch.
**Never push a `delivery/*` branch here** — those are deliberately truncated client-delivery states;
pushing one to the team repo hands colleagues an incomplete spec.

## Step 2 — Gate battery (all must pass)

A green test suite is not the same as a clean commit. This battery has repeatedly caught defects
that passing tests missed.

```bash
npm run check:spec-quality
npm run check:tc-parity
npm run check:step-labels
npm run check:save-honesty
npm run check:dead-exports
npm run check:untracked-knowledge
```

The last check catches knowledge artifacts (field inventories, walk evidence, baseline files) that
git is silently ignoring because their parent directory is gitignored but already held tracked files.
This is exactly the defect that stranded a colleague waiting for artifacts that never reached remote.

If the workbook is stale, run `npm run xlsx:build` and stage the result — never push a workbook that
disagrees with its markdown source; the pre-push freshness gate will reject it anyway.

## Step 3 — Secret sweep on the outgoing diff

```bash
git diff origin/main..HEAD --name-only
git diff origin/main..HEAD | grep -inE "api[_-]?key|secret|token|password|bearer|-----BEGIN" || true
```

`grep` exits 1 on no matches — `|| true` keeps the chain alive. A hit is not automatically a blocker:
an env-var **name** is fine, a **value** is not. Look at every hit and report it.
**Never conclude "clean" from a name-only match or from redacted output.**

Known and accepted: `clients/encore/.env.local` is tracked on purpose and carries the shared
automation-account credentials, so colleagues get a working setup. That is a deliberate decision,
not a leak. Personal credentials must never go there.

## Step 4 — Delegation-material check

Colleagues run their agent as a **direct worker**. They have no Copilot workforce. Shipping
delegation tooling or doctrine configures a workflow they cannot run, which degrades their agent.

```bash
git diff origin/main..HEAD --name-only | grep -iE "ua-worker|worker-ext|copilot|council-|delegation" || true
git diff origin/main..HEAD | grep -inE "copilot-worker|council-(worker|reviewer|planner|verifier)|--max-credits|--work-type|SELF_GRANT" || true
```

Any hit → **STOP**, report the paths, let the user decide. Do not silently drop files; do not
silently push them.

## Step 5 — Show the payload, then push

Report file count, the paths, and anything the gates flagged. Then:

```bash
git push origin main
```

## Step 6 — Verify

```bash
git fetch origin && git rev-list --left-right --count origin/main...HEAD   # expect "0	0"
```

Report the pushed range and the sync state. **If any gate was skipped or any file deliberately left
behind, say so plainly** — an unmentioned omission reads as "everything went" when it didn't.

## Failure discipline

- A gate fails → fix the cause. Never `--no-verify`.
- A hook blocks → read what it actually says. These hooks have caught stale indexes, stale workbooks,
  spec/markdown title drift, and backdated log rows. They are usually right.
- Claiming something is "pre-existing / out of scope" → prove it with `git blame` or `git log` first.
  Not-committed-yet means it is in scope.

## Rules

- Never `--force` on `main` without explicit instruction.
- Never push `delivery/*` here.
- Never skip Step 4.
- If the user asked for a plan and not a push, do not push.
