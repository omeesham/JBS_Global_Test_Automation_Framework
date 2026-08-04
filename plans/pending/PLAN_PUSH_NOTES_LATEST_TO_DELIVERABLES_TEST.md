# PLAN — Push Encore deliverable to `notes-latest` branch on `RutviK-JBS/encore_deliverables_test`

**Status**: Pending
**Created**: 2026-05-19
**Priority**: P1
**Identity**: OWNER
**Skills**: /execute → /regression-guard (wrap) → /final-q
**Model**: opus
**Thinking**: xhi
**PermissionMode**: acceptEdits
**BrowserTool**: none
**Branch**: `client_deliverable` (source) → push deliverable to `notes-latest` (target mock repo)
**Target repo**: https://github.com/RutviK-JBS/encore_deliverables_test
**Runbook**: [clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md](clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md) (this plan is the same flow with `main` → `notes-latest` branch swap + a commit step because the source tree is dirty)

> 🤖 **SESSION BOOTSTRAP — Just invoke with `/execute plans/pending/PLAN_PUSH_NOTES_LATEST_TO_DELIVERABLES_TEST.md`. All context below.**
>
> 1. **Identity**: `/identity` → OWNER (ship-discipline owner; non-pipeline operational task).
> 2. **Skills**: `/execute` auto-calls `/identity`, `/regression-guard` (wrap; structural diff before+after the local commit), and `/final-q` (closure).
> 3. **Model + Thinking + PermissionMode**: opus / xhi / acceptEdits — set per frontmatter.
> 4. **Dependency gate**: none. This plan is self-contained — it only orchestrates the runbook.
> 5. **Context load**:
>    - [clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md](clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md) — the 6-step runbook this plan automates.
>    - [.claude/rules/pipeline.md](.claude/rules/pipeline.md) LR-049 — ship-via-git-archive-only rule. NEVER `cp -r`, `tar`, or `zip` direct.
>    - [scripts/ship-client.sh](scripts/ship-client.sh) — the only blessed ship path (git-archive + deny-list + smoke).
>    - Memory: `project_encore_deliverable_channel.md` — `RutviK-JBS/encore_deliverables_test` is a DRY-RUN MOCK. Real client never touches git.
> 6. **Browser tool**: none. This plan is git + shell only; no live app interaction.
> 7. **Phase 0 (preflight)**: read the state of branch, working tree, and remote refs. HALT if any mismatch.
> 8. **Execute Phases 1–5** in order.
> 9. **Handoff**: flip the Status field to DONE + add the Executed date, append activity-log row (LR-028), `git mv` to `plans/done/`, `npm run plans:reindex`, commit.
>
> **HALT + ASK USER** if:
> - Current branch is not `client_deliverable` (don't auto-switch — could trash uncommitted work).
> - Phase 1 commit produces unexpected scope (regression-guard surfaces files outside `clients/encore/` + the known dirty framework paths).
> - Ship script (Phase 2) errors on deny-list grep — that means a forbidden pattern is staged in `clients/encore/`. Read the error, fix at source, do NOT bypass.
> - Phase 3 force-with-lease push to `notes-latest` fails because the branch ALREADY exists on remote with a SHA we don't know — preflight expected it to not exist.
> - Phase 4 GA workflow returns RED with login error OR zero passes — surface log + STOP per runbook.

---

## 1. Context

User intent: push the current `clients/encore/` deliverable snapshot to the dry-run mock repo `RutviK-JBS/encore_deliverables_test` on a NEW branch `notes-latest`. This is internal hygiene only — the Encore client never touches git; JBS colleagues hand over the folder/zip outside git (per `project_encore_deliverable_channel.md`).

This is essentially the standard runbook at [clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md](clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md) with three deltas:

1. Target branch is `notes-latest` (the runbook defaults to `main`). `notes-latest` does NOT currently exist on the remote — preflight confirmed `git ls-remote ...` returns only `refs/heads/main`. So Phase 3 is a fresh-branch push, no force-with-lease needed.
2. Source tree is dirty (165 modified/added files spanning `clients/encore/`, `src/`, `pipeline/`, `.claude/`, `docs/`, etc., plus stray `grep.exe.stackdump`). Ship script's preflight refuses dirty tree in tracked paths. So Phase 1 must commit first — `git archive HEAD` only sees committed state, so commit-first is the only path that gets unstaged work into the archive.
3. The runbook is parameterised on `main`; this plan parameterises on `notes-latest`.

## 2. Scope

### In-scope

- **Phase 0**: Preflight reads (branch, working tree, remote refs).
- **Phase 1**: Single local commit on `client_deliverable` of all dirty + new files EXCEPT `grep.exe.stackdump` (junk crash dump). No push of the framework branch.
- **Phase 2**: `npm run client:ship -- --client=encore --out=/tmp/encore-deliv-2026-05-19` (the only blessed ship path per LR-049).
- **Phase 3**: In the shipped output, `git init` + commit + remote add + push to `RutviK-JBS/encore_deliverables_test` branch `notes-latest`.
- **Phase 4**: Trigger GA `playwright-tests.yml` on `--ref notes-latest`, watch run, capture verdict.
- **Phase 5**: Activity-log row + close plan.

### Out of scope (strict plan lines per LR-046)

- DO NOT touch `main` on `RutviK-JBS/encore_deliverables_test`. The existing SHA `0b97f38f2c149df2d44a1903f96b321543bff0bd` stays untouched.
- DO NOT push the framework `client_deliverable` branch to its origin. User only asked for the mock-repo push.
- DO NOT use `cp -r` / `tar` / `zip` direct — LR-049 forbids any path other than `npm run client:ship`.
- DO NOT add `grep.exe.stackdump` to the commit. (Junk artifact from a prior crash; not part of the deliverable scope.)
- DO NOT modify `clients/encore/` source content to "improve" the deliverable — ship the snapshot as-is.

## 3. Active rules (apply during execution)

| Rule | Where applied | How |
|---|---|---|
| **LR-049** (ship-via-git-archive only) | Phase 2 | Use `npm run client:ship` exclusively. Reject any inner-monologue suggestion to `cp -r` "because the script is being picky". |
| **LR-028** (activity-log row at session end) | Phase 5 | Append `\| YYYY-MM-DDThh:mm \| OWNER \| done \| <files> \| Push to encore_deliverables_test notes-latest \|`. |
| **LR-027** (plan finalization) | Phase 5 | Flip Status field to DONE + add Executed date + write Execution Summary (SHAs pushed, GA verdict). |
| **LR-038 v2 / LR-054** (browser-tool) | Plan-wide | `BrowserTool: none` — no live app; do not start any browser. |
| **NEVER ASSUME** (Supreme Rule) | All phases | Run preflight greps; verify dirty state, verify remote refs; do NOT guess `notes-latest` doesn't exist — check. |

## 4. Phase 0 — Preflight (read state, decide)

```bash
# Branch must be client_deliverable
git branch --show-current
# expected: client_deliverable

# Count + classify dirty paths
git status --porcelain | wc -l
# expected: ~165 (as of plan authoring)

# Verify junk artifact is in the dirty set so Phase 1 can explicitly exclude it
git status --porcelain | grep "grep.exe.stackdump"
# expected: one line " M grep.exe.stackdump" or "?? grep.exe.stackdump"

# Remote state — confirm notes-latest does NOT yet exist
git ls-remote https://github.com/RutviK-JBS/encore_deliverables_test.git refs/heads/main refs/heads/notes-latest
# expected: ONLY refs/heads/main (SHA: 0b97f38f2c149df2d44a1903f96b321543bff0bd at plan-authoring time)
# if refs/heads/notes-latest also returns → HALT, ask user (we'd be overwriting their pre-existing branch)
```

**HALT conditions**:
- Branch ≠ `client_deliverable` → ask user before checkout.
- `notes-latest` already exists on remote → ask user (force-with-lease semantics needed).
- Dirty set is empty (0 files) → unusual; user might have already committed elsewhere; confirm intent before re-running.

## 5. Phase 1 — Commit pending source changes on `client_deliverable`

`git archive HEAD` only sees committed state. To get the current working-tree state into the deliverable, commit first. Ship-script preflight refuses dirty `clients/encore/`, `src/`, `pipeline/`.

```bash
# 1. Stage everything EXCEPT the junk crash dump.
git add -A
git reset HEAD -- grep.exe.stackdump   # unstage if it ended up staged
# (alternative: git add -A -- ':!grep.exe.stackdump')

# 2. Sanity-check the staged set: should NOT contain grep.exe.stackdump
git status --porcelain | grep "grep.exe.stackdump" | head -3
# expected: file still shows as " M" or "??" (unstaged), not "A " or "M " (staged)

# 3. Commit. Concise message — what this snapshot represents.
git commit -m "$(cat <<'EOF'
chore(deliverable): snapshot for notes-latest push to encore_deliverables_test

- clients/encore/ test data + CSVs + auth.setup + fixtures + playwright.config + workflow
- framework restructure carry-over (.claude/, docs/, scripts/, plans/) committed as
  working-tree state at ship time
- excludes grep.exe.stackdump (junk crash artifact)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"

# 4. Verify clean tree in ship-script-relevant paths
git status --porcelain "clients/encore/" src/ pipeline/
# expected: empty (no output)
```

**Regression-guard wrap**: `/execute` auto-calls `/regression-guard` before+after. Confirm the structural diff matches the in-scope list (clients/encore + framework restructure files). Unexpected files in the diff → HALT.

## 6. Phase 2 — Ship via `npm run client:ship`

The single blessed path per LR-049.

```bash
# Use the Bash tool (not PowerShell) — ship-client.sh is bash; npm script invokes bash directly.
npm run client:ship -- --client=encore --out=/tmp/encore-deliv-2026-05-19
```

What this does internally (per [scripts/ship-client.sh](scripts/ship-client.sh)):

1. Preflight: working tree clean in `clients/encore/`, `src/`, `pipeline/` (Phase 1 satisfied this).
2. Preflight: `clients/encore/` exists.
3. ~~Preflight: vendor-freshness check~~ — `verify-vendor-fresh.mjs` was retired in commit `93a07763` (chore(trim04): remove deprecated verify-vendor-fresh); this step no longer exists and has no successor.
4. Preflight: `verify-no-forbidden.mjs --client=encore` (deny-list against tracked files).
5. `git archive HEAD clients/encore/ | tar -x -C /tmp/encore-deliv-2026-05-19 --strip-components=2`.
6. Post-ship: `verify-no-forbidden.mjs --target=/tmp/encore-deliv-2026-05-19` (defense in depth).
7. Post-ship: confirm at least one `.github/workflows/*.yml` exists in output (`clients/encore/.github/workflows/playwright-tests.yml` ships there).
8. Post-ship smoke: `npm install --silent && npx playwright test --list >/dev/null` inside output.

Expected exit: `[OK] Shipped clients/encore/ -> /tmp/encore-deliv-2026-05-19 via git archive`.

**Failure paths** (cite [SHIP_TO_ENCORE.md](clients/encore/docs/read_only_docs/SHIP_TO_ENCORE.md) §Failure paths):
- deny-list grep fails → read marker, fix at source, restart Phase 1.
- `--list` smoke fails → spec syntax/import error in shipped output; fix at source, restart Phase 1.
- Workflow-presence check fails → would mean `clients/encore/.github/workflows/` is empty; preflight ensures the file is tracked.

## 7. Phase 3 — Init + push shipped output to `notes-latest`

`notes-latest` is a fresh branch on remote (Phase 0 confirmed). No force-with-lease needed; a vanilla push creates it.

```bash
cd /tmp/encore-deliv-2026-05-19

# Fresh repo — no hooks, no inherited history
git init -b main >/dev/null
git add -A
git commit -m "Encore deliverables — 2026-05-19 notes-latest snapshot" >/dev/null

git remote add origin https://github.com/RutviK-JBS/encore_deliverables_test.git

# Push to notes-latest (new branch on remote).
# Using --no-force: if Phase 0 was wrong and notes-latest already exists, this push fails
# safely instead of overwriting — matches the HALT condition.
git push origin HEAD:refs/heads/notes-latest

# Capture the new SHA for the Execution Summary + activity-log row
NEW_SHA=$(git rev-parse HEAD)
echo "Pushed to notes-latest at SHA: $NEW_SHA"
```

**Why not `--force-with-lease`**: that flag protects against overwriting a known-old SHA. Since `notes-latest` does not exist remotely, there's no SHA to lease. A bare push is correct here AND safer — if `notes-latest` unexpectedly exists, the bare push will fail (non-fast-forward) and we HALT rather than overwriting whatever the user put there.

## 8. Phase 4 — GA workflow trigger + verdict (recommended)

The mock repo's GA verifies login + ≥1 spec passes — the standard verdict per runbook. This is the whole point of having a dry-run mock.

```bash
# Trigger workflow_dispatch on the notes-latest branch
gh workflow run playwright-tests.yml --repo RutviK-JBS/encore_deliverables_test --ref notes-latest

# Wait briefly for GA to register the run, then capture run ID
sleep 10
RUN_ID=$(gh run list --repo RutviK-JBS/encore_deliverables_test --workflow playwright-tests.yml --branch notes-latest --limit 1 --json databaseId --jq '.[0].databaseId')
echo "Watching run: $RUN_ID"

# Block until the run completes
gh run watch "$RUN_ID" --repo RutviK-JBS/encore_deliverables_test
```

**Verdict** (per runbook §6):
- **GREEN** = setup project login completes (`.auth/encore-state.json` written in GA) AND ≥1 spec passes in `encore-local-office` or `encore-locations`.
- Spec-level failures are FINE — they're downstream of the ship pipeline.
- **RED** with login error → check GA log for `auth.setup.ts` step; surface to user (likely GitHub secrets out of date — out of scope for this plan).
- **RED** with 0 passes → NOT a flake; surface log + STOP, do not iterate without user input.

**If GA workflow isn't dispatchable on `--ref notes-latest`** (e.g., `gh` says "could not find any workflows named playwright-tests.yml on ref notes-latest" — possible if `gh` requires the workflow to be on the default branch): surface the error, do NOT auto-set `notes-latest` as default branch. Push success is already the primary deliverable; GA verification is a recommended addition.

## 9. Phase 5 — Activity log + close plan

```bash
# 1. Append activity-log row (LR-028).
# File: clients/encore/specs_planning/_internal/agent-activity-log.md
# Format: | YYYY-MM-DDThh:mm | OWNER | done | clients/encore/** | Pushed encore deliverable to RutviK-JBS/encore_deliverables_test notes-latest @ <SHA>. GA: <GREEN|RED|skipped> |

# 2. Flip plan to DONE.
# Edit this file: Status -> DONE, add Executed: 2026-05-19, write Execution Summary
#   (source-repo SHA after Phase 1 commit, mock-repo SHA after Phase 3 push, GA verdict + run URL).

# 3. git mv plans/pending/PLAN_PUSH_NOTES_LATEST_TO_DELIVERABLES_TEST.md plans/done/
# 4. npm run plans:reindex
# 5. git add + commit the plan move + activity-log row
```

## 10. Verification artifact

After execution completes, the next session (or the user) can re-run these to confirm:

```bash
# A. Source-repo commit landed
git log --oneline -3
# expect: a commit "chore(deliverable): snapshot for notes-latest push..." at HEAD

# B. Mock-repo branch exists
git ls-remote https://github.com/RutviK-JBS/encore_deliverables_test.git refs/heads/notes-latest
# expect: <some SHA>	refs/heads/notes-latest  (a SHA appears — not empty)

# C. Mock-repo main UNTOUCHED
git ls-remote https://github.com/RutviK-JBS/encore_deliverables_test.git refs/heads/main
# expect: 0b97f38f2c149df2d44a1903f96b321543bff0bd	refs/heads/main  (unchanged from preflight)

# D. GA run captured (if Phase 4 ran)
gh run list --repo RutviK-JBS/encore_deliverables_test --workflow playwright-tests.yml --branch notes-latest --limit 1
# expect: one row with conclusion = success OR failure (not "queued" or "in_progress")

# E. Activity-log row present
grep "encore_deliverables_test notes-latest" clients/encore/specs_planning/_internal/agent-activity-log.md
# expect: one line with today's date + OWNER + the push description
```

All five = plan DONE. Any FAIL on (A)–(C) = plan must be re-attempted; (D)–(E) = closure hygiene gaps.

## 11. Failure → Rollback (only if we made the mock structurally worse)

`notes-latest` is a fresh branch, so rollback = delete the branch:

```bash
git push origin --delete notes-latest
# or, if user wants to keep the branch but reset it:
# git push --force origin <PREVIOUS_GOOD_SHA>:notes-latest   (but no previous good SHA exists for this branch)
```

Don't roll back for GA spec-level flakes — those are downstream of the ship pipeline (per runbook §Rollback).
