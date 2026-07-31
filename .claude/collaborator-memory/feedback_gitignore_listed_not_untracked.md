---
name: gitignore-listed-not-untracked
description: "Gitignore-listed ≠ untracked — run git ls-files before claiming a path class can't be in a push range; deliverable DENY_GLOBS ≠ origin push-deny"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e1001be8-214b-4595-8e09-2ddfcb84e658
  modified: 2026-07-30T14:47:02.097Z
---

CEO mistake 2026-07-24 (gate-fix bounce-b2): ordered a pre-push path-deny on `clients/*/specs_planning/**` + per-client `CLAUDE.md` asserting they "never legitimately appear in a push range because they're gitignored". FALSE — `git ls-files clients/encore/specs_planning/` showed **439 tracked files** (48 in the live `origin/main..HEAD` range). `.gitignore` never affects already-tracked files; this repo tracks the internal corpus BY DESIGN and the per-client gitignore governs fresh-clone/deliverable hygiene, not origin pushes. The ordered gate would have bricked the next origin push; cost one full bounce round to reverse.

**Why:** two different deny domains got conflated — `DENY_GLOBS` protect the CLIENT DELIVERABLE channel (ship-branch.sh / archive), while an origin push-deny may only cover the never-legitimately-tracked secrets floor (`clients/*/.auth/**`, `clients/*/.env.server`; note `.env.local` is designed-tracked WITH creds per LR-ENC-003).

**How to apply:** before any claim that a path class "can't be committed/pushed", run `git ls-files <path>` + `git diff --name-only origin/<branch>..HEAD` and read the counts. Never derive push-gate policy from gitignore listings or deliverable deny lists. Related: [[never-conclude-from-redacted-or-name-only-match]], [[worker-report-claims-need-own-grep]].

## The inverse bites too: an EMPTY `git diff` is not proof of "untouched" (2026-07-30)

Same root cause — conflating git's view with disk reality — running the other way. Verifying a worker's
"I changed nothing" claim with `git diff --numstat -- <paths>` is only evidence **if those paths are
tracked.** For a gitignored path, git is silent whether the file was rewritten or never opened.

Live case (q123): a U-phase worker reported four edits to `plans/pending/SUBPLAN_ASSISTANT_LAYER_HARDGATES.md`,
`PLAN_DELEGATION_GOVERNOR_AND_STEERING.md`, `PLAN_LAZY_CEO_DELEGATOR.md`. `git diff --numstat` showed
nothing, so I was about to call the report a false claim. `git ls-files --error-unmatch` on all three:
*"did not match any file(s) known to git"* — **they are gitignored**, and `git status --porcelain` on the
exact paths is likewise silent (an untracked-but-not-ignored file at least shows `??`). The worker was
honest; my instrument was blind. mtimes inside the run window plus a content grep confirmed the edits
landed.

The dangerous half is the other direction: I had just "proved" eight rejected proposals were not applied
with an empty `git diff -- .claude/agents/`. Had `.claude/agents/` been ignored, that proof would have
been worthless. It is tracked (8 files, mtimes days old), so the conclusion survived — by luck of path
choice, not by method.

**How to apply:** before using `git diff`/`git status` as no-touch evidence, confirm the path is tracked
(`git ls-files <path>` returns rows). If it does not, fall back to **mtime vs the run window + a content
grep** — the same instrument used for the OUTPUT-path check. State which instrument you used. Silence
from a tool that cannot see the target is not evidence of anything ([[gate-trip-probes-need-valid-payloads]]:
absence-of-deny proves nothing).
